import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized } from "@/lib/auth";
import { clientInAgency, userInAgency } from "@/lib/guards";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { searchParams } = new URL(req.url);
    const agencyId = session.agencyId;
    const country = searchParams.get("country");
    const status = searchParams.get("status");
    const type = searchParams.get("type"); // "STUDIES", "TOURISM" ou null
    const counselorId = searchParams.get("counselorId");
    const search = searchParams.get("search");

    if (!agencyId) {
      return NextResponse.json({ error: "agencyId is required" }, { status: 400 });
    }

    const whereClause: any = { agencyId };

    if (country && country !== "ALL") whereClause.country = country;
    if (status && status !== "ALL") whereClause.status = status;
    if (type && type !== "ALL") whereClause.type = type;
    if (counselorId && counselorId !== "ALL") whereClause.counselorId = counselorId;

    if (search && search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { dossierNumber: { contains: q, mode: "insensitive" } },
        { targetInstitution: { contains: q, mode: "insensitive" } },
        { targetProgram: { contains: q, mode: "insensitive" } },
        { nextAction: { contains: q, mode: "insensitive" } },
        {
          client: {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
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
            fileSize: true,
            mimeType: true,
            requirementName: true,
            createdAt: true,
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
    const session = await getSession();
    if (!session) return unauthorized();
    const body = await req.json();
    const {
      clientId,
      // Champs pour création client directe / simplifiée
      clientFirstName,
      clientLastName,
      clientPhone,
      clientEmail,
      counselorId,
      type = "STUDIES", // "STUDIES" ou "TOURISM"
      country, // "FRANCE", "CANADA", etc.
      targetInstitution, // Établissement (études) ou Motif du séjour (tourisme)
      targetProgram, // Programme (études) ou Durée prévue (tourisme)
      intake, // Rentrée ou période du voyage
      totalServiceFee,
      currency,
      initialStatus = "IN_PROGRESS",
      initialNotes,
      nextAction,
      nextActionDate,
      confirmDuplicate = false,
    } = body;

    const agencyId = session.agencyId;
    const createdById = session.userId;
    const createdByName = session.name;

    if (!country) {
      return NextResponse.json(
        { error: "Veuillez spécifier le pays de destination." },
        { status: 400 }
      );
    }

    let targetClientId = clientId;

    // Si pas de clientId direct, chercher ou créer le client
    if (!targetClientId) {
      if (!clientLastName || !clientPhone) {
        return NextResponse.json(
          { error: "Veuillez renseigner au moins le nom et le numéro de téléphone du client." },
          { status: 400 }
        );
      }

      // Recherche par téléphone pour éviter les doublons de clients
      const existingClient = await prisma.client.findFirst({
        where: {
          agencyId,
          phone: clientPhone.trim(),
        },
      });

      if (existingClient) {
        targetClientId = existingClient.id;
      } else {
        const clientCount = await prisma.client.count({ where: { agencyId } });
        const refCode = `CLI-${String(clientCount + 1).padStart(3, "0")}`;
        const newClient = await prisma.client.create({
          data: {
            agencyId,
            referenceCode: refCode,
            firstName: (clientFirstName || "").trim(),
            lastName: clientLastName.trim(),
            phone: clientPhone.trim(),
            email: (clientEmail || "").trim() || `${refCode.toLowerCase()}@client.local`,
            nationality: "Sénégalaise",
            targetCountry: country,
            assignedCounselorId: counselorId || createdById,
            notesSummary: initialNotes || null,
          },
        });
        targetClientId = newClient.id;
      }
    } else {
      if (!(await clientInAgency(targetClientId, agencyId))) {
        return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
      }
    }

    if (counselorId && !(await userInAgency(counselorId, agencyId))) {
      return NextResponse.json({ error: "Conseiller invalide." }, { status: 400 });
    }

    // Avertissement de doublon de dossier
    if (!confirmDuplicate) {
      const existingDossier = await prisma.application.findFirst({
        where: {
          agencyId,
          clientId: targetClientId,
          country,
          type,
          status: { notIn: ["CLOSED", "VISA_REFUSED"] },
        },
        include: { client: true },
      });

      if (existingDossier) {
        return NextResponse.json(
          {
            isDuplicate: true,
            warning: `Un dossier ${type === "TOURISM" ? "Tourisme" : "Études"} pour ${country} est déjà en cours pour ce client (${existingDossier.dossierNumber}). Souhaitez-vous quand même en ouvrir un nouveau ?`,
            existingDossierNumber: existingDossier.dossierNumber,
          },
          { status: 409 }
        );
      }
    }

    // Recherche du modèle correspondant au pays ET au type
    let template = await prisma.procedureTemplate.findFirst({
      where: {
        country,
        type,
        OR: [{ agencyId }, { isDefault: true }],
      },
      include: {
        steps: { orderBy: { orderIndex: "asc" } },
        documentRequirements: true,
      },
    });

    // Fallback pays si pas de template exact sur le type
    if (!template) {
      template = await prisma.procedureTemplate.findFirst({
        where: {
          country,
          OR: [{ agencyId }, { isDefault: true }],
        },
        include: {
          steps: { orderBy: { orderIndex: "asc" } },
          documentRequirements: true,
        },
      });
    }

    // Numéro de dossier unique
    const count = await prisma.application.count({ where: { agencyId } });
    const codePrefix = type === "TOURISM" ? "TOUR" : (country === "FRANCE" ? "FR" : "CA");
    const dossierNumber = `DOS-${codePrefix}-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    // Création de l'application
    const newApp = await prisma.application.create({
      data: {
        agencyId,
        clientId: targetClientId,
        counselorId: counselorId || createdById || null,
        templateId: template?.id || null,
        dossierNumber,
        type,
        country,
        targetInstitution: targetInstitution || null,
        targetProgram: targetProgram || null,
        intake: intake || null,
        nextAction: nextAction ? nextAction.trim() : null,
        nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
        totalServiceFee: totalServiceFee ? parseFloat(totalServiceFee) : 0,
        currency: currency || "FCFA",
        status: initialStatus || "IN_PROGRESS",
        currentStepIndex: 0,
        progressPercentage: 0,
        lastActivityAt: new Date(),
      },
      include: {
        client: true,
      },
    });

    // Initialisation des étapes depuis le template
    if (template && template.steps.length > 0) {
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
            responsibleUserId: counselorId || createdById || null,
          },
        });
      }
    }

    // Initialisation de la checklist documentaire depuis le template
    if (template && template.documentRequirements.length > 0) {
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

    // Note initiale si renseignée
    if (initialNotes && initialNotes.trim()) {
      await prisma.note.create({
        data: {
          agencyId,
          applicationId: newApp.id,
          authorId: createdById || null,
          authorName: createdByName || "Agent",
          content: initialNotes.trim(),
          isPinned: true,
        },
      });
    }

    // Journal d'activité (Audit log)
    await prisma.activityLog.create({
      data: {
        agencyId,
        applicationId: newApp.id,
        clientId: targetClientId,
        userId: createdById || null,
        userName: createdByName || "Agent",
        actionType: "CREATED",
        description: `Création du dossier ${dossierNumber} (${type === "TOURISM" ? "Visa Tourisme" : "Études"} - ${country}) pour ${newApp.client.firstName} ${newApp.client.lastName}.`,
      },
    });

    return NextResponse.json(newApp, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ error: "Échec de création du dossier" }, { status: 500 });
  }
}
