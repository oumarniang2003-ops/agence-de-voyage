import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized, forbidden } from "@/lib/auth";
import { applicationInAgency, clientInAgency, userInAgency } from "@/lib/guards";
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { id } = params;

    const client = await prisma.client.findFirst({
      where: { id, agencyId: session.agencyId },
      include: {
        assignedCounselor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        applications: {
          include: {
            steps: {
              orderBy: { orderIndex: "asc" },
            },
            documents: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error fetching client details:", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { id } = params;
    const body = await req.json();

    if (!(await clientInAgency(id, session.agencyId))) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }
    if (body.assignedCounselorId && !(await userInAgency(body.assignedCounselorId, session.agencyId))) {
      return NextResponse.json({ error: "Conseiller invalide." }, { status: 400 });
    }

    // Liste blanche : on ne laisse jamais le client modifier agencyId, id, etc.
    const allowed = [
      "assignedCounselorId", "firstName", "lastName", "email", "phone", "whatsapp",
      "nationality", "address", "currentEducationLevel", "fieldOfStudy",
      "targetCountry", "targetIntake", "notesSummary",
    ];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (body.birthDate !== undefined) data.birthDate = body.birthDate ? new Date(body.birthDate) : null;
    if (body.tags !== undefined) data.tags = body.tags ? JSON.stringify(body.tags) : null;

    const updated = await prisma.client.update({ where: { id }, data });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ error: "Échec de mise à jour du client" }, { status: 500 });
  }
}
