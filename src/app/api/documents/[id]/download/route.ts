import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
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

    // Si on a des données de fichier en base64
    if (doc.fileData) {
      // Nettoyer l'éventuel préfixe data:mime;base64,
      let base64Data = doc.fileData;
      let contentType = doc.mimeType || "application/octet-stream";

      if (base64Data.startsWith("data:")) {
        const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          contentType = matches[1];
          base64Data = matches[2];
        }
      }

      const buffer = Buffer.from(base64Data, "base64");
      const filename = encodeURIComponent(doc.originalFilename || doc.name || "document");

      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Content-Length", String(buffer.length));
      // inline permet à l'agent de prévisualiser le PDF / JPG dans le navigateur ou télécharger
      headers.set("Content-Disposition", `inline; filename="${filename}"`);
      headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");

      return new NextResponse(buffer, { headers });
    }

    // Si pas de données physiques (ancien enregistrement texte simulé)
    return NextResponse.json(
      {
        message: "Ce document est un enregistrement antérieur sans fichier binaire attaché. Veuillez utiliser le bouton 'Remplacer' pour y associer un fichier physique.",
        name: doc.name,
        status: doc.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error downloading document:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération du fichier." }, { status: 500 });
  }
}
