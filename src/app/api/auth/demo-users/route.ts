import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            slug: true,
            currency: true,
          },
        },
      },
      orderBy: [
        { agencyId: "asc" },
        { role: "asc" },
      ],
    });

    const formatted = users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      agencyId: u.agency.id,
      agencyName: u.agency.name,
      agencySlug: u.agency.slug,
      agencyCurrency: u.agency.currency,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching demo users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
