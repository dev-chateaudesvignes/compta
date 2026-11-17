import { NextResponse, type NextRequest } from "next/server";
import { NOM_COOKIE, jetonValide } from "@/lib/auth/jeton";

// Première barrière : toute page demande une session valide, sauf /connexion.
// Les server actions doivent quand même appeler exigerSession() (cf. CLAUDE.md).
export async function proxy(request: NextRequest) {
  const connecte = await jetonValide(request.cookies.get(NOM_COOKIE)?.value);
  const surConnexion = request.nextUrl.pathname === "/connexion";

  if (!connecte && !surConnexion) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }
  if (connecte && surConnexion) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
