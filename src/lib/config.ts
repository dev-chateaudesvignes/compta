// Réglages de l'app qui ne sont pas des secrets.

/**
 * Date par défaut des formulaires (et campagne affichée par défaut).
 *
 * TODO TEMPORAIRE : on travaille pour l'instant sur la campagne 2024/2025 ;
 * repasser à la date du jour (et donc à la campagne 2026/2027) en mettant
 * `null` ici. Cf. issue « Repasser à la date du jour + campagne 26/27 ».
 */
const DATE_PAR_DEFAUT_TEMPORAIRE: string | null = "2025-06-30";

/** Date du jour en France, « AAAA-MM-JJ » (le serveur Vercel tourne en UTC). */
function aujourdhui(): string {
  return new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(new Date());
}

/** Date préremplie dans les formulaires ; la campagne par défaut en découle. */
export function dateParDefaut(): string {
  return DATE_PAR_DEFAUT_TEMPORAIRE ?? aujourdhui();
}
