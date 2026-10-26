import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      status, // "VALIDATED", "REJECTED", "IN_REVIEW", "MISSING", "EXPIRED"
      verificationComment,
      expiresAt,
      verifiedByUserId,
      verifiedByName,
    } = body;

    const doc = await prisma.document.findUnique({
      where: { id },
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
        verifiedByUserId: verifiedByUserId || doc.verifiedByUserId,
        verifiedAt: status === "VALIDATED" || status === "REJECTED" ? new Date() : doc.verifiedAt,
      },
    });

    // Update application activity
    await prisma.application.update({
      where: { id: doc.applicationId },
      data: { lastActivityAt: new Date() },
    });

    // Create activity log
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
