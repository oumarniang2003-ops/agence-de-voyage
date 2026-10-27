import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/session";
export const dynamic = "force-dynamic";

// Hash factice : on compare toujours un mot de passe, même si l'email n'existe pas,
// pour que le temps de réponse ne révèle pas quels emails existent.
const DUMMY_HASH = bcrypt.hashSync("visatrack-dummy-password", 10);

// Limiteur simple en mémoire (par instance serverless : protection de base)
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function tooManyAttempts(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) return false;
  return entry.count >= MAX_ATTEMPTS;
}
function recordFailure(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) attempts.set(key, { count: 1, first: now });
  else entry.count += 1;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = `${ip}:${email}`;
    if (tooManyAttempts(key)) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429 }
      );
    }

    const candidates = await prisma.user.findMany({
      where: { email: { equals: email, mode: "insensitive" }, isActive: true },
      include: { agency: true },
    });

    let matched = null as (typeof candidates)[number] | null;
    for (const c of candidates) {
      if (await bcrypt.compare(password, c.passwordHash)) {
        matched = c;
        break;
      }
    }
    if (candidates.length === 0) await bcrypt.compare(password, DUMMY_HASH);

    if (!matched || !matched.agency.isActive) {
      recordFailure(key);
      return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
    }

    attempts.delete(key);

    const token = await signSession({
      userId: matched.id,
      agencyId: matched.agencyId,
      role: matched.role,
      name: `${matched.firstName} ${matched.lastName}`,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erreur serveur. Réessayez." }, { status: 500 });
  }
}
