"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { configurationOk } from "./jeton";
import { fermerSession, ouvrirSession } from "./session";

export type EtatConnexion = { erreur?: string };

const schemaConnexion = z.strictObject({
  motDePasse: z.string().min(1),
});

const MSG_INDISPONIBLE =
  "La connexion ne marche pas pour le moment. Prévenez Guillaume.";

function memeMotDePasse(saisi: string, attendu: string): boolean {
  // Comparaison à temps constant (on compare les empreintes, de même longueur).
  const a = createHash("sha256").update(saisi).digest();
  const b = createHash("sha256").update(attendu).digest();
  return timingSafeEqual(a, b);
}

export async function seConnecter(
  _etat: EtatConnexion,
  formData: FormData,
): Promise<EtatConnexion> {
  if (!configurationOk()) {
    logError("auth.seConnecter", new Error("APP_PASSWORD ou SESSION_SECRET manquant ou trop court"));
    return { erreur: MSG_INDISPONIBLE };
  }

  const saisie = schemaConnexion.safeParse({ motDePasse: formData.get("motDePasse") });
  if (!saisie.success) {
    return { erreur: "Tapez le mot de passe, puis appuyez sur « Entrer »." };
  }

  if (!memeMotDePasse(saisie.data.motDePasse, process.env.APP_PASSWORD!)) {
    await new Promise((r) => setTimeout(r, 1000)); // freine les essais en rafale
    return { erreur: "Ce n'est pas le bon mot de passe. Réessayez." };
  }

  if (!(await ouvrirSession())) {
    logError("auth.seConnecter", new Error("Impossible de signer le jeton de session"));
    return { erreur: MSG_INDISPONIBLE };
  }
  redirect("/");
}

export async function seDeconnecter(): Promise<void> {
  await fermerSession();
  redirect("/connexion");
}
