import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized } from "@/lib/auth";
export const dynamic = "force-dynamic";

// Équipe de l'agence de l'utilisateur connecté uniquement (jamais de passwordHash).
export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const users = await prisma.user.findMany({
    where: { agencyId: session.agencyId, isActive: true },
    include: { agency: { select: { id: true, name: true, slug: true, currency: true } } },
    orderBy: [{ role: "asc" }, { lastName: "asc" }],
  });

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      agencyId: u.agency.id,
      agencyName: u.agency.name,
      agencySlug: u.agency.slug,
      agencyCurrency: u.agency.currency,
    }))
  );
}
