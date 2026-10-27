import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    // Déjà connecté : inutile de revoir la page de connexion
    if (pathname === "/login") {
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

  const loginUrl = new URL("/login", req.url);
  if (pathname !== "/") loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Tout sauf les fichiers statiques de Next.js
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
