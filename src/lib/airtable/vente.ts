import "server-only";
import { definirEcriture } from "./ecriture";
import { definirLecture, type ValeurDe } from "./lecture";
import { calcul, date, dateAEcrire, lienAEcrire, lienUnique, liens, nombre, nombreRequis, positif } from "./zod";

// Vente : un contrat (quantité × prix). Les résultats se font sur ces prix.
// Synthèse est remplie par une automation après la création.
const lecture = definirLecture("vente", {
  culture: lienUnique,
  campagne: lienUnique,
  synthese: liens,
  date: date,
  quantiteEnTonne: nombreRequis,
  prixParTonne: nombreRequis,
  valeur: calcul, // formule Airtable (colonne « Montant »)
  numeroAutomatique: nombre, // ordre de création : départage les ventes du même jour
});

export type Vente = ValeurDe<typeof lecture>;
export const parseVente = lecture.parser;
export const listerVentes = lecture.lister;

// Écriture (formulaire 3a). Culture ET Campagne dans le même appel ; jamais Synthèse.
export const ecritureVente = definirEcriture("vente", {
  culture: lienAEcrire,
  campagne: lienAEcrire,
  date: dateAEcrire,
  quantiteEnTonne: positif,
  prixParTonne: positif,
});
