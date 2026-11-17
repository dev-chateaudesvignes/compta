import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DUREE_SESSION_S, NOM_COOKIE, jetonValide, signerJeton } from "./jeton";

export async function estConnecte(): Promise<boolean> {
  const jeton = (await cookies()).get(NOM_COOKIE)?.value;
  return jetonValide(jeton);
}

/**
 * À appeler au début de CHAQUE server action et de chaque lecture de données.
 * Le proxy ne suffit pas : il peut être contourné par un matcher mal réglé.
 */
export async function exigerSession(): Promise<void> {
  if (!(await estConnecte())) redirect("/connexion");
}

export async function ouvrirSession(): Promise<boolean> {
  const jeton = await signerJeton();
  if (!jeton) return false;
  (await cookies()).set(NOM_COOKIE, jeton, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DUREE_SESSION_S,
  });
  return true;
}

export async function fermerSession(): Promise<void> {
  (await cookies()).delete(NOM_COOKIE);
}
