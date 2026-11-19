import "server-only";
import { definirLecture, type ValeurDe } from "./lecture";
import { texteRequis } from "./zod";

// Cultures : table de référence (Blé, Colza…). Les rollups (dernière vente…)
// sont ignorés : on recalcule à partir de Vente.
const lecture = definirLecture("cultures", {
  nomCulture: texteRequis,
});

export type Culture = ValeurDe<typeof lecture>;
export const parseCulture = lecture.parser;
export const listerCultures = lecture.lister;
