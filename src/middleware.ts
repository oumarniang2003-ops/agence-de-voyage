import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth/login", "/api/auth/register", "/api/auth/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    // Déjà connecté : inutile de revoir les pages de connexion / inscription
    if (pathname === "/login" || pathname === "/register") {
      const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value).catch(() => null);
      if (session) return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value).catch(() => null);
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Un visiteur non connecté arrive d'abord sur la page de création de compte
  return NextResponse.redirect(new URL("/register", req.url));
}

export const config = {
  // Tout sauf les fichiers statiques de Next.js
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
