import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/session";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Limiteur en mémoire : 5 inscriptions / heure / IP (protection de base)
const signups = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_SIGNUPS = 5;

function slugify(input: string) {
  return (
    input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 30) || "espace"
  );
}

export async function POST(req: NextRequest) {
  try {
    if (process.env.ALLOW_SIGNUP === "false") {
      return NextResponse.json({ error: "Les inscriptions sont fermées." }, { status: 403 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const entry = signups.get(ip);
    const inWindow = !!entry && now - entry.first <= WINDOW_MS;
    if (entry && inWindow && entry.count >= MAX_SIGNUPS) {
      return NextResponse.json({ error: "Trop d'inscriptions depuis cette adresse. Réessayez plus tard." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
    }
    if (email.length > 120 || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
    }
    if (password.length > 72) {
      return NextResponse.json({ error: "Le mot de passe est trop long (72 caractères maximum)." }, { status: 400 });
    }

    const existing = await prisma.user.count({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (existing > 0) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email. Cliquez sur « Connexion »." }, { status: 409 });
    }

    // Nom affiché : la partie de l'email avant le @ (ex. "oumar" pour oumar@gmail.com)
    const local = email.split("@")[0].replace(/[^a-zA-Z0-9]+/g, " ").trim() || "Utilisateur";
    const firstName = local.charAt(0).toUpperCase() + local.slice(1);

    // Chaque nouveau compte reçoit son propre espace privé, vide :
    // personne d'autre ne voit ses clients ni ses dossiers.
    const slug = `${slugify(local)}-${randomBytes(3).toString("hex")}`;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: { name: `Espace de ${firstName}`, slug, email, currency: "FCFA" },
      });
      return tx.user.create({
        data: { agencyId: agency.id, email, passwordHash, firstName, lastName: "", role: "ADMIN" },
      });
    });

    signups.set(ip, {
      count: entry && inWindow ? entry.count + 1 : 1,
      first: entry && inWindow ? entry.first : now,
    });

    const token = await signSession({
      userId: user.id,
      agencyId: user.agencyId,
      role: user.role,
      name: user.firstName,
    });

    const res = NextResponse.json({ ok: true }, { status: 201 });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erreur serveur. Réessayez." }, { status: 500 });
  }
}
