import "server-only";
import { definirLecture, type ValeurDe } from "./lecture";
import { calcul, calculRequis, lienUnique, liens, nombre, texteRequis } from "./zod";

// Synthèse : une ligne par culture × récolte. LECTURE SEULE : tout ce qui est
// ici est calculé par Airtable (rollups / formules) ; l'app ne recalcule rien.
// Arrondir à l'affichage (flottants type 15.670000000000002).
const lecture = definirLecture("synthese", {
  idCultureAnnee: texteRequis, // « Blé-2025 », clé des automations de liaison
  culture: lienUnique,
  campagne: lienUnique,
  travaux: liens,
  surfacePacHa: calculRequis,
  livraisonEnT: calcul,
  venteEnT: calcul,
  stock: calcul, // t, négatif possible (vendu plus que livré)
  rendementEnTHa: calcul, // vide si pas de livraison
  prixMoyenDeVenteEnEurosT: calcul, // vide si pas de vente
  valeurContratsEuros: calcul,
  encaisseEuros: nombre, // lecture seule, vide en 24/25
  ventesEuros: calculRequis, // encaissé sinon contrats
  ecartEncaisseContratsEuros: calcul,
  autresRecettesEuros: calculRequis,
  chargesEuros: calculRequis,
  chargesIntrantsEuros: calculRequis,
  chargesTravauxAgricolesEuros: calculRequis,
  chargesDiversesEuros: calculRequis,
  resultatEuros: calculRequis, // Ventes + Autres recettes − Charges
});

export type Synthese = ValeurDe<typeof lecture>;
export const parseSynthese = lecture.parser;
export const listerSyntheses = lecture.lister;
