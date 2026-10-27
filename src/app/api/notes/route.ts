import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized, forbidden } from "@/lib/auth";
import { applicationInAgency, clientInAgency, userInAgency } from "@/lib/guards";
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const body = await req.json();
    const { applicationId, content, isPinned } = body;
    const agencyId = session.agencyId;
    const authorId = session.userId;
    const authorName = session.name;

    if (!applicationId || !content) {
      return NextResponse.json({ error: "applicationId et content sont requis." }, { status: 400 });
    }
    if (!(await applicationInAgency(applicationId, agencyId))) {
      return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });
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
