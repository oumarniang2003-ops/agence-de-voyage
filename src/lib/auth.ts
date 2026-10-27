// Helpers serveur (routes API) : lecture de la session et réponses d'erreur.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, SessionPayload, verifySession } from "@/lib/session";

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export function unauthorized() {
  return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
}

export function forbidden(message = "Accès refusé") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function hasRole(session: SessionPayload, ...roles: string[]) {
  return roles.includes(session.role);
}
