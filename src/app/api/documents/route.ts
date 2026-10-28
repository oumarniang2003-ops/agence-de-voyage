import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized } from "@/lib/auth";
import { applicationInAgency } from "@/lib/guards";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const body = await req.json();
    const {
      applicationId,
      requirementName,
      name,
      originalFilename,
      fileData, // base64 string
      fileSize,
      mimeType,
    } = body;

    const agencyId = session.agencyId;
    const userId = session.userId;
    const userName = session.name;

    if (!applicationId || !name) {
      return NextResponse.json(
        { error: "applicationId et name sont requis." },
        { status: 400 }
      );
    }

    if (!(await applicationInAgency(applicationId, agencyId))) {
      return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });
    }

    // Vérifier si un document avec ce requirementName existe déjà
    let document;
    if (requirementName) {
      const existing = await prisma.document.findFirst({
        where: { applicationId, requirementName },
      });

      if (existing) {
        document = await prisma.document.update({
          where: { id: existing.id },
          data: {
            name: name || existing.name,
            originalFilename: originalFilename || existing.originalFilename || name,
            fileData: fileData || existing.fileData,
            filePath: `/api/documents/${existing.id}/download`,
            fileSize: fileSize || existing.fileSize || 102400,
            mimeType: mimeType || existing.mimeType || "application/pdf",
            status: "UPLOADED",
            version: existing.version + 1,
            updatedAt: new Date(),
          },
        });
      }
    }

    // Sinon créer un nouveau document (document standard ou personnalisé)
    if (!document) {
      document = await prisma.document.create({
        data: {
          agencyId,
          applicationId,
          requirementName: requirementName || null,
          name,
          originalFilename: originalFilename || name,
          fileData: fileData || null,
          filePath: null, // sera mis à jour avec son ID
          fileSize: fileSize || 102400,
          mimeType: mimeType || "application/pdf",
          status: "UPLOADED",
          version: 1,
        },
      });

      // Mettre à jour l'URL de téléchargement interne
      document = await prisma.document.update({
        where: { id: document.id },
        data: { filePath: `/api/documents/${document.id}/download` },
      });
    }

    // Mettre à jour la date d'activité du dossier
    await prisma.application.update({
      where: { id: applicationId },
      data: { lastActivityAt: new Date() },
    });

    // Journal d'audit
    await prisma.activityLog.create({
      data: {
        agencyId,
        applicationId,
        userId: userId || null,
        userName: userName || "Agent",
        actionType: "DOCUMENT_UPLOADED",
        description: `Ajout / Mise à jour du document "${name}" (version ${document.version}).`,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating document:", error);
    return NextResponse.json({ error: "Échec du téléversement du document" }, { status: 500 });
  }
}
