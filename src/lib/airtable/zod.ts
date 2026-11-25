import { z } from "zod";

// Briques Zod pour LIRE les champs Airtable. Rappels (cf. CLAUDE.md) :
// - un champ vide est ABSENT du JSON (undefined, pas 0 ni "") ;
// - un lien peut contenir 0, 1 ou N enregistrements ;
// - un lookup renvoie toujours un tableau ;
// - une formule / un rollup en erreur renvoie un objet ({ error } ou { specialValue }).

/** Texte facultatif. Les espaces autour sont retirés ; "" devient undefined. */
export const texte = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

/** Texte obligatoire (non vide). */
export const texteRequis = z.string().trim().min(1);

/** Nombre saisi, facultatif. */
export const nombre = z.number().optional();

/** Nombre saisi, obligatoire. */
export const nombreRequis = z.number();

// Formule / rollup : un objet d'erreur Airtable rend l'enregistrement « à vérifier ».
const MESSAGE_CALCUL = "calcul en erreur dans Airtable";
const nombreCalcule = z.number({ error: MESSAGE_CALCUL });

/** Formule ou rollup numérique, facultatif (vide = pas de valeur, ex. rendement sans livraison). */
export const calcul = nombreCalcule.optional();

/** Formule ou rollup numérique, obligatoire. */
export const calculRequis = nombreCalcule;

/** Date Airtable « AAAA-MM-JJ », obligatoire. */
export const date = z.iso.date();

/** Date facultative. */
export const dateFacultative = z.iso.date().optional();

/** Case à cocher : absente = non cochée. */
export const caseACocher = z.boolean().default(false);

/** Choix unique libre (le client peut ajouter des options dans Airtable). */
export const choix = z.string().optional();

/** Choix unique libre, obligatoire. */
export const choixRequis = z.string().min(1);

// Choix parmi une liste connue (Section, Mode, Unité…) : la valeur BRUTE est
// gardée et la ligne reste comptée. Une valeur hors liste est « signalée » par
// definirLecture (liste de la page de contrôle, totaux concernés marqués).
const valeursConnues = new WeakMap<z.ZodType, readonly string[]>();

/** Valeurs attendues d'une brique choixParmi / lookupChoixParmi (sinon undefined). */
export function valeursConnuesDe(schema: z.ZodType): readonly string[] | undefined {
  return valeursConnues.get(schema);
}

function connu<S extends z.ZodType>(schema: S, valeurs: readonly string[]): S {
  valeursConnues.set(schema, valeurs);
  return schema;
}

/** Choix unique obligatoire, parmi une liste connue (valeur hors liste : signalée). */
export const choixParmi = (valeurs: readonly string[]) => connu(z.string().min(1), valeurs);

/** Choix unique facultatif, parmi une liste connue (valeur hors liste : signalée). */
export const choixParmiFacultatif = (valeurs: readonly string[]) => connu(z.string().optional(), valeurs);

/** Lien vers 0, 1 ou N enregistrements : toujours un tableau. */
export const liens = z.array(z.string()).default([]);

/** Lien qui doit pointer vers exactement 1 enregistrement ; sinon « à vérifier ». */
export const lienUnique = z
  .array(z.string(), { error: "doit être lié à un enregistrement" })
  .length(1, "doit être lié à un seul enregistrement")
  .transform((ids) => ids[0]);

/** Lien facultatif vers au plus 1 enregistrement (0 → undefined, 2 ou plus → « à vérifier »). */
export const lienFacultatif = z
  .array(z.string())
  .max(1, "doit être lié à un seul enregistrement au plus")
  .optional()
  .transform((ids) => ids?.[0]);

/** Lookup numérique (tableau de 0 ou 1 valeur) → le nombre, ou undefined. */
export const lookupNombre = z
  .array(nombreCalcule)
  .max(1, "plusieurs valeurs au lieu d'une")
  .optional()
  .transform((v) => v?.[0]);

const lookupUnTexte = () =>
  z
    .array(z.string())
    .max(1, "plusieurs valeurs au lieu d'une")
    .optional()
    .transform((v) => v?.[0]);

/** Lookup texte / choix (tableau de 0 ou 1 valeur) → le texte, ou undefined. */
export const lookupTexte = lookupUnTexte();

/** Lookup d'une case à cocher → vrai si cochée. Non cochée : absent, [] ou [null] selon Airtable. */
export const lookupCase = z
  .array(z.boolean().nullable())
  .optional()
  .transform((v) => v?.[0] === true);

/** Lookup d'un choix parmi une liste connue (valeur hors liste : signalée). */
export const lookupChoixParmi = (valeurs: readonly string[]) => connu(lookupUnTexte(), valeurs);

// ---------------------------------------------------------------------------
// Briques pour ÉCRIRE (schémas stricts des formulaires).

/** ID d'enregistrement Airtable (rec…). */
export const idEnregistrement = z.string().regex(/^rec[A-Za-z0-9]{14}$/, "enregistrement inconnu");

/** Nombre strictement positif (quantité, poids, prix). */
export const positif = z.number().finite().positive("doit être supérieur à zéro");

/** Montant en euros, arrondi au centime à l'écriture. Peut être négatif (avoir). */
export const montant = z
  .number()
  .finite()
  .transform((v) => Math.round(v * 100) / 100);

/** Lien à écrire vers 1 enregistrement (l'API attend un tableau). */
export const lienAEcrire = idEnregistrement.transform((id) => [id]);

/** Liens à écrire vers 0..N enregistrements. */
export const liensAEcrire = z.array(idEnregistrement);

/** Choix à écrire : uniquement une valeur de la liste. */
export const choixAEcrire = <const T extends readonly [string, ...string[]]>(valeurs: T) =>
  z.enum(valeurs, { error: "choix invalide" });

/** Date « AAAA-MM-JJ » à écrire. */
export const dateAEcrire = z.iso.date("date invalide");
