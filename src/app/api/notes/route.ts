import { NextRequest, NextResponse } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agencyId, applicationId, authorId, authorName, content, isPinned } = body;

    if (!agencyId || !applicationId || !content) {
      return NextResponse.json({ error: "agencyId, applicationId et content sont requis." }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        agencyId,
        applicationId,
        authorId: authorId || null,
        authorName: authorName || "Collaborateur",
        content,
        isPinned: isPinned || false,
      },
    });

    // Update application activity
    await prisma.application.update({
      where: { id: applicationId },
      data: { lastActivityAt: new Date() },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        agencyId,
        applicationId,
        userId: authorId || null,
        userName: authorName || "Collaborateur",
        actionType: "NOTE_ADDED",
        description: `Ajout d'une note interne : "${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"`,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Échec de création de la note" }, { status: 500 });
  }
}
