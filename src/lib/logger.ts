/**
 * Point unique de remontée des erreurs (cf. CLAUDE.md).
 * Écrit un log JSON structuré, lisible dans les logs Vercel.
 * Le jour où on branche un outil de suivi d'erreurs, seul ce fichier change.
 *
 * Ne jamais passer de secret (jeton, mot de passe) dans `donnees`.
 */
export function logError(
  contexte: string,
  erreur: unknown,
  donnees?: Record<string, unknown>,
): void {
  const err =
    erreur instanceof Error
      ? { name: erreur.name, message: erreur.message, stack: erreur.stack }
      : { message: String(erreur) };

  // Seul console.error autorisé du projet.
  console.error(
    JSON.stringify({
      niveau: "error",
      date: new Date().toISOString(),
      contexte,
      erreur: err,
      donnees,
    }),
  );
}
