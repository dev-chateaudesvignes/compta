import "server-only";
import { definirEcriture } from "./ecriture";
import { definirLecture, type ValeurDe } from "./lecture";
import {
  date,
  dateAEcrire,
  lienAEcrire,
  lienUnique,
  liens,
  liensAEcrire,
  nombre,
  nombreRequis,
  positif,
  texteRequis,
} from "./zod";

// Livraison : un bon de livraison à l'organisme stockeur.
// Une livraison = exactement 1 culture et 1 campagne (sinon « à vérifier »).
// Synthèse est remplie par une automation quelques secondes après la création :
// elle peut être vide juste après une saisie.
// « Livraison en T » (Synthèse) = somme des Poids net / 1000 : Tonnage n'est pas utilisé.
const lecture = definirLecture("livraison", {
  idBonDeLivraison: texteRequis,
  culture: lienUnique,
  campagne: lienUnique,
  synthese: liens,
  dateDeLivraison: date,
  poidsNet: nombreRequis, // kg
  tonnage: nombre,
  champ: liens,
  assolement: liens,
  // Analyses qualité : souvent vides selon la culture.
  h2o: nombre,
  ps: nombre,
  calibre: nombre,
  impurete: nombre,
  brasserie: nombre,
  mouture: nombre,
  proteine: nombre,
  fusarioseOuHagberg: nombre,
});

export type Livraison = ValeurDe<typeof lecture>;
export const parseLivraison = lecture.parser;
export const listerLivraisons = lecture.lister;

// Écriture (formulaire 2a). Culture ET Campagne dans le même appel ; jamais Synthèse.
const qualite = positif.optional();
export const ecritureLivraison = definirEcriture("livraison", {
  idBonDeLivraison: texteRequis,
  culture: lienAEcrire,
  campagne: lienAEcrire,
  dateDeLivraison: dateAEcrire,
  poidsNet: positif,
  champ: liensAEcrire.optional(),
  h2o: qualite,
  ps: qualite,
  calibre: qualite,
  impurete: qualite,
  brasserie: qualite,
  mouture: qualite,
  proteine: qualite,
  fusarioseOuHagberg: qualite,
});
