import { z } from "zod";

// Briques Zod pour LIRE les champs Airtable. Rappels (cf. CLAUDE.md) :
// - un champ vide est ABSENT du JSON (undefined, pas 0 ni "") ;
// - un lien peut contenir 0, 1 ou N enregistrements.

/** Texte facultatif. Les espaces autour sont retirés ; "" devient undefined. */
export const texte = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

/** Texte obligatoire (non vide). */
export const texteRequis = z.string().trim().min(1);

/** Nombre facultatif (les erreurs de formule Airtable sont des objets → refusés). */
export const nombre = z.number().optional();

/** Nombre obligatoire. */
export const nombreRequis = z.number();

/** Date Airtable « AAAA-MM-JJ », obligatoire. */
export const date = z.iso.date();

/** Date facultative. */
export const dateFacultative = z.iso.date().optional();

/** Case à cocher : absente = non cochée. */
export const caseACocher = z.boolean().default(false);

/** Choix unique (liste déroulante). Guillaume peut ajouter des choix : on n'impose pas la liste. */
export const choix = z.string().optional();

/** Lien vers 0, 1 ou N enregistrements : toujours un tableau. */
export const liens = z.array(z.string()).default([]);

/** Lien qui doit pointer vers exactement 1 enregistrement ; sinon « à vérifier ». */
export const lienUnique = z
  .array(z.string())
  .length(1, "doit être lié à un seul enregistrement")
  .transform((ids) => ids[0]);
