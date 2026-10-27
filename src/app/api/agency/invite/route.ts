import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

// Fonction retirée : l'inscription est désormais libre (email + mot de passe).
export async function GET() {
  return NextResponse.json({ error: "Non disponible" }, { status: 404 });
}
