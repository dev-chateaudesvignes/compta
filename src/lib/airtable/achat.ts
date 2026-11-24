import "server-only";
import { definirEcriture } from "./ecriture";
import { definirLecture, type ValeurDe } from "./lecture";
import {
  calcul,
  choixAEcrire,
  choixParmi,
  choixRequis,
  dateAEcrire,
  dateFacultative,
  lienAEcrire,
  lienFacultatif,
  lienUnique,
  liens,
  montant,
  nombre,
  nombreRequis,
  positif,
  texte,
  texteRequis,
} from "./zod";

export const SECTIONS = ["Intrants", "Report stock N-1", "Travaux agricoles", "Charges diverses"] as const;
export type Section = (typeof SECTIONS)[number];

// Achat : une facture. Son unité vient du Produit lié (Produit.Unité).
// Reste à répartir / Quantité restante sont des formules Airtable.
// Quantité restante est fausse sur 24/25 (Travaux importés sans quantité) :
// ne s'en servir que sur la campagne en cours (FIFO).
const lecture = definirLecture("achat", {
  idAchat: texte,
  libelle: texteRequis,
  date: dateFacultative, // 6 factures 24/25 sans date : tolérées
  campagne: lienUnique,
  section: choixParmi(SECTIONS),
  categorie: choixRequis, // rubriques FARM, le client peut en ajouter
  montantHt: nombreRequis, // négatif = avoir
  produit: lienFacultatif, // vide si non stockable
  quantite: nombre,
  prixUnitaireEuros: calcul, // vide si pas de quantité
  horsCultureEuros: nombre,
  stockFinDeCampagneEuros: nombre,
  stockFinQte: nombre,
  note: texte,
  travaux: liens,
  totalVentileEuros: calcul,
  resteARepartirEuros: calcul,
  quantiteUtilisee: calcul,
  quantiteRestante: calcul, // vide si pas de quantité
});

export type Achat = ValeurDe<typeof lecture>;
export const parseAchat = lecture.parser;
export const listerAchats = lecture.lister;

// Écriture (formulaire 4a). La facture jointe (pièce jointe) viendra avec le formulaire.
export const ecritureAchat = definirEcriture("achat", {
  libelle: texteRequis,
  date: dateAEcrire,
  campagne: lienAEcrire,
  section: choixAEcrire(SECTIONS),
  categorie: choixRequis,
  montantHt: montant.refine((v) => v !== 0, "le montant ne peut pas être nul"),
  produit: lienAEcrire.optional(),
  quantite: positif.optional(),
  horsCultureEuros: montant.optional(),
  note: texte,
});
