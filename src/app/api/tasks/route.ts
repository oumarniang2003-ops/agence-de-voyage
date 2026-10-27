import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get("agencyId");
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
    const body = await req.json();
    const { agencyId, applicationId, assignedToId, assignedToName, title, dueDate, priority } = body;

    if (!agencyId || !title) {
      return NextResponse.json({ error: "agencyId et title sont requis" }, { status: 400 });
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
    const body = await req.json();
    const { id, isCompleted } = body;

    if (!id) {
      return NextResponse.json({ error: "id est requis" }, { status: 400 });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { isCompleted },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Échec de mise à jour de la tâche" }, { status: 500 });
  }
}
