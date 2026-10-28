import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized, forbidden } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
      status, // "VALIDATED", "REJECTED", "IN_REVIEW", "MISSING", "EXPIRED"
      verificationComment,
      expiresAt,
    } = body;
    const verifiedByUserId = session.userId;
    const verifiedByName = session.name;

    // Seuls Admin et Conseiller peuvent valider / rejeter une pièce
    if ((status === "VALIDATED" || status === "REJECTED") && !["ADMIN", "COUNSELOR"].includes(session.role)) {
      return forbidden("Votre rôle ne permet pas de valider les documents.");
    }

    const doc = await prisma.document.findFirst({
      where: { id, agencyId: session.agencyId },
      include: { application: true },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        status: status || doc.status,
        verificationComment: verificationComment !== undefined ? verificationComment : doc.verificationComment,
        expiresAt: expiresAt ? new Date(expiresAt) : doc.expiresAt,
        verifiedByUserId: status === "VALIDATED" || status === "REJECTED" ? verifiedByUserId : doc.verifiedByUserId,
        verifiedAt: status === "VALIDATED" || status === "REJECTED" ? new Date() : doc.verifiedAt,
      },
    });

    // Update application activity
    await prisma.application.update({
      where: { id: doc.applicationId },
      data: { lastActivityAt: new Date() },
    });

    const statusLabel =
      status === "VALIDATED"
        ? "validé"
        : status === "REJECTED"
          ? "rejeté (à corriger)"
          : status === "IN_REVIEW"
            ? "marqué en cours d'examen"
            : status;

    await prisma.activityLog.create({
      data: {
        agencyId: doc.agencyId,
        applicationId: doc.applicationId,
        userId: verifiedByUserId || null,
        userName: verifiedByName || "Vérificateur",
        actionType: status === "VALIDATED" ? "DOCUMENT_VALIDATED" : "DOCUMENT_REVIEWED",
        description: `Document "${doc.name}" : statut ${statusLabel}.${verificationComment ? ` Note : "${verificationComment}"` : ""}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json({ error: "Échec de vérification du document" }, { status: 500 });
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

    const doc = await prisma.document.findFirst({
      where: { id, agencyId: session.agencyId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document introuvable ou accès refusé." }, { status: 404 });
    }

    // Seuls Admin et Conseiller peuvent supprimer un document
    if (!["ADMIN", "COUNSELOR"].includes(session.role)) {
      return forbidden("Votre rôle ne permet pas de supprimer des pièces.");
    }

    // Si c'est un document obligatoire issu du template, on remet le statut à MISSING et on vide le fichier
    if (doc.requirementName) {
      await prisma.document.update({
        where: { id },
        data: {
          fileData: null,
          filePath: null,
          status: "MISSING",
          fileSize: null,
          mimeType: null,
          version: 1,
          verificationComment: null,
          verifiedByUserId: null,
          verifiedAt: null,
        },
      });
    } else {
      // Si c'est un document personnalisé libre, on le supprime
      await prisma.document.delete({
        where: { id },
      });
    }

    // Log d'audit
    await prisma.activityLog.create({
      data: {
        agencyId: session.agencyId,
        applicationId: doc.applicationId,
        userId: session.userId || null,
        userName: session.name || "Agent",
        actionType: "DOCUMENT_DELETED",
        description: `Suppression du document "${doc.name}".`,
      },
    });

    return NextResponse.json({ success: true, message: "Document supprimé avec succès." });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Échec de suppression du document" }, { status: 500 });
  }
}
