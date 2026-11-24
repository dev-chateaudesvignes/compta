import "server-only";
import { definirEcriture } from "./ecriture";
import { SECTIONS } from "./achat";
import { definirLecture, type ValeurDe } from "./lecture";
import {
  choixAEcrire,
  choixParmiFacultatif,
  dateAEcrire,
  dateFacultative,
  lienAEcrire,
  lienUnique,
  lookupChoixParmi,
  lookupNombre,
  lookupTexte,
  montant,
  nombre,
  nombreRequis,
  positif,
} from "./zod";

export const MODES = ["Montant saisi", "Prorata surfaces"] as const;

// Travaux (ex-« Ventilation achat ») : l'affectation de tout ou partie d'une
// facture à une culture × récolte. Montant (€) est la source des rollups.
// Lignes 24/25 importées : sans date ni quantité, et Mode vide sur 141 lignes
// (Mode obligatoire à la saisie, toléré vide à la lecture, comme Achat.Date).
const lecture = definirLecture("travaux", {
  n: nombre,
  achat: lienUnique,
  cultureRecolte: lienUnique, // → Synthèse, écrit par l'app
  montantEuros: nombreRequis,
  mode: choixParmiFacultatif(MODES),
  date: dateFacultative,
  quantite: nombre,
  categorie: lookupTexte, // lookup Achat → Catégorie (famille)
  section: lookupChoixParmi(SECTIONS), // lookup Achat → Section
  unite: lookupTexte, // lookup Achat → Unité
  prixUnitaireEuros: lookupNombre, // lookup Achat → Prix unitaire
});

export type Travail = ValeurDe<typeof lecture>;
export const parseTravail = lecture.parser;
export const listerTravaux = lecture.lister;

// Écriture (formulaires 4a et 5a). Montant (€) = quantité × prix unitaire de la
// facture, calculé par l'app au moment d'écrire (cf. regles-saisie.md).
export const ecritureTravail = definirEcriture("travaux", {
  achat: lienAEcrire,
  cultureRecolte: lienAEcrire,
  montantEuros: montant,
  mode: choixAEcrire(MODES),
  date: dateAEcrire.optional(),
  quantite: positif.optional(),
});
