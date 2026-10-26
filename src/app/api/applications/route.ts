import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get("agencyId");
    const country = searchParams.get("country");
    const status = searchParams.get("status");
    const counselorId = searchParams.get("counselorId");
    const search = searchParams.get("search");

    if (!agencyId) {
      return NextResponse.json({ error: "agencyId is required" }, { status: 400 });
    }

    const whereClause: any = { agencyId };

    if (country) whereClause.country = country;
    if (status) whereClause.status = status;
    if (counselorId) whereClause.counselorId = counselorId;

    if (search && search.trim()) {
      whereClause.OR = [
        { dossierNumber: { contains: search } },
        { targetInstitution: { contains: search } },
        { targetProgram: { contains: search } },
        {
          client: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
            ],
          },
        },
      ];
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            nationality: true,
            referenceCode: true,
          },
        },
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        steps: {
          orderBy: { orderIndex: "asc" },
        },
        documents: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      agencyId,
      clientId,
      counselorId,
      country, // "FRANCE" ou "CANADA"
      targetInstitution,
      targetProgram,
      intake,
      totalServiceFee,
      currency,
      createdById,
      createdByName,
    } = body;

    if (!agencyId || !clientId || !country) {
      return NextResponse.json(
        { error: "Veuillez spécifier l'agence, le client et le pays de destination." },
        { status: 400 }
      );
    }

    // Find the default template for this country
    const template = await prisma.procedureTemplate.findFirst({
      where: {
        country,
        OR: [{ agencyId }, { isDefault: true }],
      },
      include: {
        steps: { orderBy: { orderIndex: "asc" } },
        documentRequirements: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: `Aucun modèle de procédure trouvé pour le pays ${country}` },
        { status: 404 }
      );
    }

    // Generate unique dossier number
    const count = await prisma.application.count({ where: { agencyId } });
    const codePrefix = country === "FRANCE" ? "FR" : "CA";
    const dossierNumber = `DOS-${codePrefix}-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    // Create Application
    const newApp = await prisma.application.create({
      data: {
        agencyId,
        clientId,
        counselorId: counselorId || null,
        templateId: template.id,
        dossierNumber,
        country,
        targetInstitution: targetInstitution || null,
        targetProgram: targetProgram || null,
        intake: intake || null,
        totalServiceFee: totalServiceFee ? parseFloat(totalServiceFee) : 0,
        currency: currency || "EUR",
        status: "IN_PROGRESS",
        currentStepIndex: 0,
        progressPercentage: 0,
        lastActivityAt: new Date(),
      },
    });

    // Populate steps from template
    if (template.steps.length > 0) {
      for (let i = 0; i < template.steps.length; i++) {
        const step = template.steps[i];
        await prisma.applicationStep.create({
          data: {
            applicationId: newApp.id,
            stepTitle: step.title,
            stepDescription: step.description,
            orderIndex: step.orderIndex,
            status: i === 0 ? "IN_PROGRESS" : "PENDING",
            startedAt: i === 0 ? new Date() : null,
            responsibleUserId: counselorId || null,
          },
        });
      }
    }

    // Populate document checklist from requirements
    if (template.documentRequirements.length > 0) {
      for (const reqItem of template.documentRequirements) {
        await prisma.document.create({
          data: {
            agencyId,
            applicationId: newApp.id,
            requirementName: reqItem.name,
            name: reqItem.name,
            status: "MISSING",
          },
        });
      }
    }

    // Activity Log
    await prisma.activityLog.create({
      data: {
        agencyId,
        applicationId: newApp.id,
        clientId,
        userId: createdById || null,
        userName: createdByName || "Collaborateur",
        actionType: "CREATED",
        description: `Création du dossier ${dossierNumber} (${country}) avec initialisation des ${template.steps.length} étapes et checklist documentaire.`,
      },
    });

    return NextResponse.json(newApp, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ error: "Échec de création du dossier" }, { status: 500 });
  }
}
