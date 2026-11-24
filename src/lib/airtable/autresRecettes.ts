import "server-only";
import { definirLecture, type ValeurDe } from "./lecture";
import { choixParmi, dateFacultative, lienUnique, nombreRequis, texte, texteRequis } from "./zod";

export const TYPES_RECETTE = ["DPB / primes PAC", "Indemnité grêle", "Paille / foin", "Autre"] as const;

// Autres recettes : aides PAC, indemnités, paille… rattachées à une culture × récolte.
// Pas de formulaire prévu pour l'instant : lecture seule.
const lecture = definirLecture("autresRecettes", {
  libelle: texteRequis,
  type: choixParmi(TYPES_RECETTE),
  campagne: lienUnique,
  cultureRecolte: lienUnique, // → Synthèse, écrit par l'app
  montantEuros: nombreRequis,
  date: dateFacultative, // vide sur 8/10 lignes 24/25
  note: texte,
});

export type AutreRecette = ValeurDe<typeof lecture>;
export const parseAutreRecette = lecture.parser;
export const listerAutresRecettes = lecture.lister;
