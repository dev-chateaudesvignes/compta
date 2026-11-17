import "server-only";
import { createHmac } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

// Jeton de session signé (HS256). Utilisé par le proxy et par la session.
// Ne contient aucune donnée : il prouve seulement que le mot de passe a été saisi.

export const NOM_COOKIE = "session";
export const DUREE_SESSION_S = 60 * 60 * 24 * 30; // 30 jours : on reste connecté longtemps

// La clé de signature dépend du secret ET du mot de passe : changer le mot de
// passe invalide toutes les sessions ouvertes (ex. si quelqu'un l'a vu).
function cle(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  const motDePasse = process.env.APP_PASSWORD;
  if (!secret || secret.length < 32 || !motDePasse) return null;
  return createHmac("sha256", secret).update(motDePasse).digest();
}

export function configurationOk(): boolean {
  return cle() !== null;
}

export async function signerJeton(): Promise<string | null> {
  const k = cle();
  if (!k) return null;
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DUREE_SESSION_S}s`)
    .sign(k);
}

export async function jetonValide(jeton: string | undefined): Promise<boolean> {
  const k = cle();
  if (!k || !jeton) return false;
  try {
    await jwtVerify(jeton, k, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false; // expiré, falsifié ou signé avec un ancien secret
  }
}
