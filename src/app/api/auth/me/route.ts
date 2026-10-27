import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  // On relit l'utilisateur en base : un compte désactivé perd l'accès immédiatement.
  const u = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { agency: { select: { id: true, name: true, slug: true, currency: true, isActive: true } } },
  });

  if (!u || !u.isActive || !u.agency.isActive) {
    const res = NextResponse.json({ error: "Session invalide" }, { status: 401 });
    res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  }

  return NextResponse.json({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    agencyId: u.agency.id,
    agencyName: u.agency.name,
    agencySlug: u.agency.slug,
    agencyCurrency: u.agency.currency,
  });
}
