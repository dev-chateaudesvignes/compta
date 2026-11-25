import "server-only";
import { definirLecture, type ValeurDe } from "./lecture";
import {
  calcul,
  calculRequis,
  lienUnique,
  liens,
  lookupCase,
  lookupNombre,
  lookupTexte,
  nombre,
  texte,
  texteRequis,
} from "./zod";

// Synthèse : une ligne par culture × récolte. LECTURE SEULE : tout ce qui est
// ici est calculé par Airtable (rollups / formules) ; l'app ne recalcule rien.
// Arrondir à l'affichage (flottants type 15.670000000000002).
const lecture = definirLecture("synthese", {
  idCultureAnnee: texteRequis, // « Blé-2025 », clé des automations de liaison
  culture: lienUnique,
  nomCulture: lookupTexte, // lookup Culture → Nom culture
  couleur: lookupTexte, // lookup Culture → Couleur (« #C2410C »)
  ordre: lookupNombre, // lookup Culture → Ordre d'affichage
  seLivre: lookupCase, // lookup Culture → Se livre (absente de l'écran Livraisons sinon)
  campagne: lienUnique,
  travaux: liens,
  surfacePacHa: calculRequis,
  livraisonEnT: calcul,
  nombreDeLivraison: calculRequis,
  valeurLivreeEstimeeEuros: calcul, // rollup Livraison → Valeur estimée (€)
  venteEnT: calcul,
  nombreDeVente: calculRequis,
  partVendue: calcul, // ratio Vente en T ÷ Livraison en T (1 = 100 %) ; vide sans livraison
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
  // Travaux agricoles par famille (rollups Travaux → Montant filtrés sur la Catégorie)
  travailDuSolEuros: calculRequis,
  recolteEuros: calculRequis,
  travauxDiversARepartirEuros: calculRequis,
  autresTravauxEuros: calculRequis,
  clauseGasoilEuros: calculRequis,
  travauxNonClassesEuros: calculRequis, // travaux agricoles − Σ familles ; ≠ 0 → Alerte
  alerte: texte, // « à vérifier » si stock < 0 ou travaux non classés
  resultatEuros: calculRequis, // Ventes + Autres recettes − Charges
});

export type Synthese = ValeurDe<typeof lecture>;
export const parseSynthese = lecture.parser;
export const listerSyntheses = lecture.lister;
