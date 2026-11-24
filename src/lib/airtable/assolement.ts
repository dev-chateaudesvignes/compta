import "server-only";
import { definirLecture, type ValeurDe } from "./lecture";
import { lienUnique, liens, nombreRequis, texte } from "./zod";

// Assolement : quelle culture sur quel champ pour une campagne, avec la surface
// déclarée à la PAC (≠ surface cadastrale). Sert de base aux prorata.
// Les anciennes campagnes n'ont pas de Surface PAC : lire avec { campagne }.
const lecture = definirLecture("assolement", {
  idAssolement: texte,
  champ: lienUnique,
  campagne: lienUnique,
  culture: lienUnique,
  synthese: liens, // rempli par automation (peut être vide juste après création)
  surfacePacHa: nombreRequis,
});

export type Assolement = ValeurDe<typeof lecture>;
export const parseAssolement = lecture.parser;
export const listerAssolements = lecture.lister;
