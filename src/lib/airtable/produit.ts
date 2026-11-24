import "server-only";
import { definirEcriture } from "./ecriture";
import { definirLecture, type ValeurDe } from "./lecture";
import { calcul, choixAEcrire, choixParmi, choixRequis, lookupNombre, nombre, texteRequis } from "./zod";

export const UNITES = ["kg", "t", "l", "dose", "u"] as const;

// Produit : catalogue des produits stockables (engrais, semences, phytos…).
const lecture = definirLecture("produit", {
  produit: texteRequis,
  categorie: choixRequis,
  unite: choixParmi(UNITES),
  dernierPrixUnitaireEuros: lookupNombre, // vide si jamais acheté avec une quantité
  nbAchats: nombre,
  // Rollups filtrés : hors « Report stock N-1 », campagne « En cours » seulement.
  totalAcheteCampagneEnCoursEuros: calcul,
  quantiteAcheteeCampagneEnCours: calcul,
});

export type Produit = ValeurDe<typeof lecture>;
export const parseProduit = lecture.parser;
export const listerProduits = lecture.lister;

// Écriture : nouveau produit créé côté serveur depuis le formulaire d'achat.
export const ecritureProduit = definirEcriture("produit", {
  produit: texteRequis,
  categorie: choixRequis,
  unite: choixAEcrire(UNITES),
});
