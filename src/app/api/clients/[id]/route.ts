import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const client = await prisma.client.findUnique({
      where: { id },
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
    const { id } = params;
    const body = await req.json();

    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...body,
        tags: body.tags ? JSON.stringify(body.tags) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ error: "Échec de mise à jour du client" }, { status: 500 });
  }
}
