import type { Synthese } from "@/lib/airtable/synthese";

// Affichage des cultures : nom, couleur et ordre viennent de la table Cultures
// (lookups dans Synthèse).

/** Couleur si la case « Couleur » de la culture est vide ou mal écrite. */
const COULEUR_PAR_DEFAUT = "#6B7280";
const HEXA = /^#[0-9a-f]{6}$/i;

export function couleurCulture(s: Synthese): string {
  return s.couleur && HEXA.test(s.couleur) ? s.couleur : COULEUR_PAR_DEFAUT;
}

export function nomCulture(s: Synthese): string {
  return s.nomCulture ?? s.idCultureAnnee;
}

/** Tri selon « Ordre » de la culture (vide : à la fin), puis par nom. */
export function parOrdre(a: Synthese, b: Synthese): number {
  return (a.ordre ?? Infinity) - (b.ordre ?? Infinity) || nomCulture(a).localeCompare(nomCulture(b), "fr");
}
