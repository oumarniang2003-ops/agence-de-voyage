// Session par cookie signé (JWT HS256) — compatible Edge (middleware) et Node.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "visatrack_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

export interface SessionPayload {
  userId: string;
  agencyId: string;
  role: string;
  name: string;
}

function getKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET manquante ou trop courte (16 caractères minimum). Ajoutez-la dans les variables d'environnement."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

export async function verifySession(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    if (!payload.userId || !payload.agencyId) return null;
    return {
      userId: String(payload.userId),
      agencyId: String(payload.agencyId),
      role: String(payload.role),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}
