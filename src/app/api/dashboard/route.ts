import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized, forbidden } from "@/lib/auth";
import { applicationInAgency, clientInAgency, userInAgency } from "@/lib/guards";
export const dynamic = 'force-dynamic';

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

    // Counts
    const totalClients = await prisma.client.count({
      where: { agencyId },
    });

    const totalApplications = await prisma.application.count({
      where: { agencyId },
    });

    const inProgressApplications = await prisma.application.count({
      where: { agencyId, status: "IN_PROGRESS" },
    });

    const blockedApplications = await prisma.application.count({
      where: { agencyId, status: "BLOCKED" },
    });

    const visasGranted = await prisma.application.count({
      where: { agencyId, status: "VISA_GRANTED" },
    });

    // Country breakdown
    const franceApps = await prisma.application.count({
      where: { agencyId, country: "FRANCE" },
    });

    const canadaApps = await prisma.application.count({
      where: { agencyId, country: "CANADA" },
    });

    // Payments / Revenue
    const payments = await prisma.payment.findMany({
      where: { agencyId },
      select: { amount: true },
    });
    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

    // Blocked or inactive applications (alert threshold)
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

    // Recent activity logs
    const recentActivities = await prisma.activityLog.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    // Pending tasks
    const pendingTasks = await prisma.task.findMany({
      where: { agencyId, isCompleted: false },
      orderBy: { dueDate: "asc" },
      take: 5,
    });

    return NextResponse.json({
      agency,
      stats: {
        totalClients,
        totalApplications,
        inProgressApplications,
        blockedApplications,
        visasGranted,
        franceApps,
        canadaApps,
        totalRevenue,
      },
      alertApplications,
      recentActivities,
      pendingTasks,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
