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
    const search = searchParams.get("search") || "";
    const country = searchParams.get("country") || "";
    const counselorId = searchParams.get("counselorId") || "";

    if (!agencyId) {
      return NextResponse.json({ error: "agencyId is required" }, { status: 400 });
    }

    const whereClause: any = {
      agencyId,
    };

    if (country) {
      whereClause.targetCountry = country;
    }

    if (counselorId) {
      whereClause.assignedCounselorId = counselorId;
    }

    if (search.trim()) {
      whereClause.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { referenceCode: { contains: search } },
      ];
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
      include: {
        assignedCounselor: {
          select: { id: true, firstName: true, lastName: true },
        },
        applications: {
          select: {
            id: true,
            dossierNumber: true,
            country: true,
            status: true,
            progressPercentage: true,
            targetInstitution: true,
            targetProgram: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const body = await req.json();
    const {
      assignedCounselorId,
      firstName,
      lastName,
      email,
      phone,
      whatsapp,
      birthDate,
      nationality,
      address,
      currentEducationLevel,
      fieldOfStudy,
      targetCountry,
      targetIntake,
      tags,
      notesSummary,
    } = body;
    const agencyId = session.agencyId;
    const createdById = session.userId;
    const createdByName = session.name;

    if (!firstName || !lastName || !email || !phone || !nationality) {
      return NextResponse.json(
        { error: "Veuillez renseigner tous les champs obligatoires (nom, prénom, email, téléphone, nationalité)." },
        { status: 400 }
      );
    }

    if (assignedCounselorId && !(await userInAgency(assignedCounselorId, agencyId))) {
      return NextResponse.json({ error: "Conseiller invalide." }, { status: 400 });
    }

    // Auto-generate reference code
    const clientCount = await prisma.client.count({ where: { agencyId } });
    const refCode = `CLI-${String(clientCount + 1).padStart(3, "0")}`;

    const newClient = await prisma.client.create({
      data: {
        agencyId,
        assignedCounselorId: assignedCounselorId || null,
        referenceCode: refCode,
        firstName,
        lastName,
        email,
        phone,
        whatsapp: whatsapp || phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        nationality,
        address: address || null,
        currentEducationLevel: currentEducationLevel || null,
        fieldOfStudy: fieldOfStudy || null,
        targetCountry: targetCountry || "FRANCE",
        targetIntake: targetIntake || null,
        tags: tags ? JSON.stringify(tags) : null,
        notesSummary: notesSummary || null,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        agencyId,
        clientId: newClient.id,
        userId: createdById || null,
        userName: createdByName || "Système",
        actionType: "CREATED",
        description: `Nouveau client enregistré : ${firstName} ${lastName} (${refCode}).`,
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Échec de création du client" }, { status: 500 });
  }
}
