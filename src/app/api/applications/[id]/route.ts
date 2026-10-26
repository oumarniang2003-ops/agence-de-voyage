import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        client: true,
        counselor: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        steps: {
          orderBy: { orderIndex: "asc" },
        },
        documents: {
          include: {
            verifiedByUser: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
        tasks: {
          orderBy: { dueDate: "asc" },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application details:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      stepId,
      stepStatus,
      stepComments,
      applicationStatus,
      counselorId,
      userId,
      userName,
    } = body;

    const app = await prisma.application.findUnique({
      where: { id },
      include: { steps: { orderBy: { orderIndex: "asc" } } },
    });

    if (!app) {
      return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
    }

    // 1. If updating a specific step
    if (stepId && stepStatus) {
      const targetStep = app.steps.find((s) => s.id === stepId);
      if (targetStep) {
        await prisma.applicationStep.update({
          where: { id: stepId },
          data: {
            status: stepStatus,
            comments: stepComments !== undefined ? stepComments : targetStep.comments,
            completedAt: stepStatus === "COMPLETED" ? new Date() : null,
            startedAt: stepStatus === "IN_PROGRESS" && !targetStep.startedAt ? new Date() : targetStep.startedAt,
            responsibleUserId: userId || targetStep.responsibleUserId,
          },
        });

        // Recalculate progress percentage
        const updatedSteps = await prisma.applicationStep.findMany({
          where: { applicationId: id },
        });
        const completedCount = updatedSteps.filter((s) => s.status === "COMPLETED").length;
        const total = updatedSteps.length;
        const progressPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        // If step completed, update application currentStepIndex to the next step
        let nextIndex = app.currentStepIndex;
        if (stepStatus === "COMPLETED" && targetStep.orderIndex === app.currentStepIndex) {
          nextIndex = Math.min(targetStep.orderIndex + 1, total - 1);
        }

        await prisma.application.update({
          where: { id },
          data: {
            progressPercentage,
            currentStepIndex: nextIndex,
            lastActivityAt: new Date(),
          },
        });

        // Activity log
        await prisma.activityLog.create({
          data: {
            agencyId: app.agencyId,
            applicationId: app.id,
            clientId: app.clientId,
            userId: userId || null,
            userName: userName || "Collaborateur",
            actionType: "STEP_CHANGED",
            description: `Étape "${targetStep.stepTitle}" mise à jour : Statut -> ${stepStatus}.`,
          },
        });
      }
    }

    // 2. If updating global application status (e.g. BLOCKED, VISA_GRANTED, etc.)
    if (applicationStatus && applicationStatus !== app.status) {
      await prisma.application.update({
        where: { id },
        data: {
          status: applicationStatus,
          lastActivityAt: new Date(),
        },
      });

      await prisma.activityLog.create({
        data: {
          agencyId: app.agencyId,
          applicationId: app.id,
          clientId: app.clientId,
          userId: userId || null,
          userName: userName || "Collaborateur",
          actionType: "STATUS_CHANGED",
          description: `Statut global du dossier changé de "${app.status}" à "${applicationStatus}".`,
        },
      });
    }

    // 3. If updating counselor
    if (counselorId && counselorId !== app.counselorId) {
      await prisma.application.update({
        where: { id },
        data: { counselorId, lastActivityAt: new Date() },
      });
    }

    const reloaded = await prisma.application.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { orderIndex: "asc" } },
        documents: true,
        counselor: true,
      },
    });

    return NextResponse.json(reloaded);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({ error: "Échec de mise à jour du dossier" }, { status: 500 });
  }
}
