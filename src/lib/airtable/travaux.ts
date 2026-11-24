import "server-only";
import { definirEcriture } from "./ecriture";
import { definirLecture, type ValeurDe } from "./lecture";
import {
  choixParmi,
  dateAEcrire,
  dateFacultative,
  lienAEcrire,
  lienUnique,
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
// Lignes 24/25 importées : sans date ni quantité, et Mode vide sur une partie.
const lecture = definirLecture("travaux", {
  n: nombre,
  achat: lienUnique,
  cultureRecolte: lienUnique, // → Synthèse, écrit par l'app
  montantEuros: nombreRequis,
  mode: choixParmi(MODES).optional(), // ✔ dans la doc, mais vide sur 141 lignes importées
  date: dateFacultative,
  quantite: nombre,
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
  mode: choixParmi(MODES),
  date: dateAEcrire.optional(),
  quantite: positif.optional(),
});
