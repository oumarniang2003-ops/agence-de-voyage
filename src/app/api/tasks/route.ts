import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized, forbidden } from "@/lib/auth";
import { applicationInAgency, clientInAgency, userInAgency } from "@/lib/guards";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { searchParams } = new URL(req.url);
    const agencyId = session.agencyId;
    const applicationId = searchParams.get("applicationId");

    if (!agencyId) {
      return NextResponse.json({ error: "agencyId is required" }, { status: 400 });
    }

    const where: any = { agencyId };
    if (applicationId) where.applicationId = applicationId;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const body = await req.json();
    const { applicationId, assignedToId, assignedToName, title, dueDate, priority } = body;
    const agencyId = session.agencyId;

    if (!title) {
      return NextResponse.json({ error: "title est requis" }, { status: 400 });
    }
    if (applicationId && !(await applicationInAgency(applicationId, agencyId))) {
      return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });
    }
    if (assignedToId && !(await userInAgency(assignedToId, agencyId))) {
      return NextResponse.json({ error: "Collaborateur invalide." }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        agencyId,
        applicationId: applicationId || null,
        assignedToId: assignedToId || null,
        assignedToName: assignedToName || null,
        title,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || "MEDIUM",
        isCompleted: false,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Échec de création de la tâche" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const body = await req.json();
    const { id, isCompleted } = body;

    if (!id) {
      return NextResponse.json({ error: "id est requis" }, { status: 400 });
    }

    const result = await prisma.task.updateMany({
      where: { id, agencyId: session.agencyId },
      data: { isCompleted: Boolean(isCompleted) },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 });
    }

    const updated = await prisma.task.findUnique({ where: { id } });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Échec de mise à jour de la tâche" }, { status: 500 });
  }
}
