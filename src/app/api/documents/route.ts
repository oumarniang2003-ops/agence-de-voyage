import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      agencyId,
      applicationId,
      requirementName,
      name,
      filePath,
      fileSize,
      mimeType,
      userId,
      userName,
    } = body;

    if (!agencyId || !applicationId || !name) {
      return NextResponse.json(
        { error: "agencyId, applicationId et name sont requis." },
        { status: 400 }
      );
    }

    // Check if a document with this requirementName already exists for this application
    let document;
    if (requirementName) {
      const existing = await prisma.document.findFirst({
        where: { applicationId, requirementName },
      });

      if (existing) {
        document = await prisma.document.update({
          where: { id: existing.id },
          data: {
            name,
            filePath: filePath || existing.filePath,
            fileSize: fileSize || existing.fileSize,
            mimeType: mimeType || existing.mimeType,
            status: "UPLOADED",
            version: existing.version + 1,
            updatedAt: new Date(),
          },
        });
      }
    }

    if (!document) {
      document = await prisma.document.create({
        data: {
          agencyId,
          applicationId,
          requirementName: requirementName || null,
          name,
          filePath: filePath || `/uploads/${name}`,
          fileSize: fileSize || 1024000,
          mimeType: mimeType || "application/pdf",
          status: "UPLOADED",
          version: 1,
        },
      });
    }

    // Update application lastActivityAt
    await prisma.application.update({
      where: { id: applicationId },
      data: { lastActivityAt: new Date() },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        agencyId,
        applicationId,
        userId: userId || null,
        userName: userName || "Collaborateur",
        actionType: "DOCUMENT_UPLOADED",
        description: `Téléversement de la pièce "${name}" (version ${document.version}).`,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating document:", error);
    return NextResponse.json({ error: "Échec du téléversement du document" }, { status: 500 });
  }
}
