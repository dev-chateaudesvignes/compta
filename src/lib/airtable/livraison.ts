import "server-only";
import { definirLecture, type ValeurDe } from "./lecture";
import { date, lienUnique, liens, nombre, nombreRequis, texteRequis } from "./zod";

// Livraison : un bon de livraison à l'organisme stockeur.
// Règles : une livraison = exactement 1 culture et 1 campagne (sinon « à vérifier »).
// Assolement peut contenir plusieurs liens (livraison répartie sur plusieurs champs).
// Les formules (« Tonnage sec corrigé », « Tonnage Ble »…) sont ignorées : à recalculer.
const lecture = definirLecture("livraison", {
  idBonDeLivraison: texteRequis,
  culture: lienUnique,
  campagne: lienUnique,
  dateDeLivraison: date,
  assolement: liens,
  vente: liens,
  tonnage: nombreRequis,
  poidsNet: nombre,
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
