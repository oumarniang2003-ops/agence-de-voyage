import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const agencyId = session.agencyId;

    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // 1. Total dossiers actifs (non clôturés)
    const activeApplicationsCount = await prisma.application.count({
      where: {
        agencyId,
        status: { notIn: ["CLOSED"] },
      },
    });

    // 2. Dossiers Études
    const studiesCount = await prisma.application.count({
      where: {
        agencyId,
        type: "STUDIES",
        status: { notIn: ["CLOSED"] },
      },
    });

    // 3. Dossiers Tourisme / Visiteur
    const tourismCount = await prisma.application.count({
      where: {
        agencyId,
        type: "TOURISM",
        status: { notIn: ["CLOSED"] },
      },
    });

    // 4. Dossiers en attente de documents
    const pendingDocsCount = await prisma.application.count({
      where: {
        agencyId,
        status: { notIn: ["CLOSED"] },
        documents: {
          some: {
            status: "MISSING",
          },
        },
      },
    });

    // 5. Dossiers soumis / en attente de réponse consulaire ou école
    const submittedOrWaitingCount = await prisma.application.count({
      where: {
        agencyId,
        status: { in: ["SUBMITTED", "WAITING_RESPONSE", "IN_PROGRESS", "ACCEPTED"] },
      },
    });

    // 6. Visas accordés
    const visasGrantedCount = await prisma.application.count({
      where: {
        agencyId,
        status: "VISA_GRANTED",
      },
    });

    // 7. Actions à effectuer aujourd'hui ou en retard
    const overdueOrTodayActions = await prisma.application.findMany({
      where: {
        agencyId,
        status: { notIn: ["CLOSED", "VISA_GRANTED"] },
        nextAction: { not: null },
        nextActionDate: {
          lte: today,
        },
      },
      include: {
        client: {
          select: { firstName: true, lastName: true, phone: true },
        },
        counselor: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { nextActionDate: "asc" },
      take: 6,
    });

    // 8. Tous les dossiers nécessitant une attention (inactifs depuis > seuil ou bloqués)
    const alertDays = agency.alertThresholdDays || 7;
    const thresholdDate = new Date(Date.now() - alertDays * 86400000);

    const alertApplications = await prisma.application.findMany({
      where: {
        agencyId,
        OR: [
          { status: "BLOCKED" },
          {
            status: "IN_PROGRESS",
            lastActivityAt: { lt: thresholdDate },
          },
        ],
      },
      include: {
        client: {
          select: { firstName: true, lastName: true, phone: true },
        },
        counselor: {
          select: { firstName: true, lastName: true },
        },
      },
      take: 5,
    });

    // 9. Derniers dossiers modifiés
    const recentApplications = await prisma.application.findMany({
      where: { agencyId },
      include: {
        client: {
          select: { firstName: true, lastName: true, phone: true },
        },
        counselor: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    });

    // 10. Chiffre d'affaires
    const payments = await prisma.payment.findMany({
      where: { agencyId },
      select: { amount: true },
    });
    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

    return NextResponse.json({
      agency,
      stats: {
        activeApplications: activeApplicationsCount,
        studiesCount,
        tourismCount,
        pendingDocsCount,
        submittedOrWaitingCount,
        visasGranted: visasGrantedCount,
        totalRevenue,
      },
      overdueOrTodayActions,
      alertApplications,
      recentApplications,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
