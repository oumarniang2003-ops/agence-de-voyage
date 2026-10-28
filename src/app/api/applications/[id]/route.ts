import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized } from "@/lib/auth";
import { userInAgency } from "@/lib/guards";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { id } = params;

    const application = await prisma.application.findFirst({
      where: { id, agencyId: session.agencyId },
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
    const session = await getSession();
    if (!session) return unauthorized();
    const { id } = params;
    const body = await req.json();
    const {
      stepId,
      stepStatus,
      stepComments,
      applicationStatus,
      statusNote,
      counselorId,
      nextAction,
      nextActionDate,
      targetInstitution,
      targetProgram,
      intake,
      totalServiceFee,
    } = body;

    const userId = session.userId;
    const userName = session.name;

    const app = await prisma.application.findFirst({
      where: { id, agencyId: session.agencyId },
      include: { steps: { orderBy: { orderIndex: "asc" } }, client: true },
    });

    if (!app) {
      return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
    }

    const updateData: any = {
      lastActivityAt: new Date(),
    };

    // 1. Mise à jour de la prochaine action
    if (nextAction !== undefined) {
      updateData.nextAction = nextAction ? nextAction.trim() : null;
    }
    if (nextActionDate !== undefined) {
      updateData.nextActionDate = nextActionDate ? new Date(nextActionDate) : null;
    }

    // 2. Mise à jour des informations générales
    if (targetInstitution !== undefined) updateData.targetInstitution = targetInstitution;
    if (targetProgram !== undefined) updateData.targetProgram = targetProgram;
    if (intake !== undefined) updateData.intake = intake;
    if (totalServiceFee !== undefined) updateData.totalServiceFee = parseFloat(totalServiceFee) || 0;

    // 3. Changement de statut global
    if (applicationStatus && applicationStatus !== app.status) {
      updateData.status = applicationStatus;

      await prisma.activityLog.create({
        data: {
          agencyId: app.agencyId,
          applicationId: app.id,
          clientId: app.clientId,
          userId: userId || null,
          userName: userName || "Agent",
          actionType: "STATUS_CHANGED",
          description: `Statut modifié de "${app.status}" à "${applicationStatus}".${statusNote ? ` Note : "${statusNote}"` : ""}`,
        },
      });

      if (statusNote && statusNote.trim()) {
        await prisma.note.create({
          data: {
            agencyId: app.agencyId,
            applicationId: app.id,
            authorId: userId || null,
            authorName: userName || "Agent",
            content: `[Statut : ${applicationStatus}] ${statusNote.trim()}`,
            isPinned: false,
          },
        });
      }
    }

    // 4. Mise à jour d'une étape spécifique
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

        // Recalcul de progression
        const updatedSteps = await prisma.applicationStep.findMany({
          where: { applicationId: id },
        });
        const completedCount = updatedSteps.filter((s) => s.status === "COMPLETED").length;
        const total = updatedSteps.length;
        updateData.progressPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        let nextIndex = app.currentStepIndex;
        if (stepStatus === "COMPLETED" && targetStep.orderIndex === app.currentStepIndex) {
          nextIndex = Math.min(targetStep.orderIndex + 1, total - 1);
        }
        updateData.currentStepIndex = nextIndex;

        await prisma.activityLog.create({
          data: {
            agencyId: app.agencyId,
            applicationId: app.id,
            clientId: app.clientId,
            userId: userId || null,
            userName: userName || "Agent",
            actionType: "STEP_CHANGED",
            description: `Étape "${targetStep.stepTitle}" : statut -> ${stepStatus}.${stepComments ? ` Remarque : "${stepComments}"` : ""}`,
          },
        });
      }
    }

    // 5. Mise à jour conseiller
    if (counselorId && counselorId !== app.counselorId) {
      if (await userInAgency(counselorId, session.agencyId)) {
        updateData.counselorId = counselorId;
      }
    }

    await prisma.application.update({
      where: { id },
      data: updateData,
    });

    const reloaded = await prisma.application.findUnique({
      where: { id },
      include: {
        client: true,
        counselor: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        steps: { orderBy: { orderIndex: "asc" } },
        documents: {
          include: {
            verifiedByUser: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        notes: { orderBy: { createdAt: "desc" } },
        tasks: { orderBy: { dueDate: "asc" } },
        activityLogs: { orderBy: { createdAt: "desc" }, take: 30 },
      },
    });

    return NextResponse.json(reloaded);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({ error: "Échec de mise à jour du dossier" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { id } = params;

    const app = await prisma.application.findFirst({
      where: { id, agencyId: session.agencyId },
    });

    if (!app) {
      return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });
    }

    // Seuls les ADMIN peuvent supprimer un dossier
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seul un administrateur peut supprimer définitivement un dossier." },
        { status: 403 }
      );
    }

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Dossier supprimé avec succès." });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json({ error: "Échec de suppression du dossier" }, { status: 500 });
  }
}
