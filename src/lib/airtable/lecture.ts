import "server-only";
import { z } from "zod";
import { exigerSession } from "@/lib/auth/session";
import { listerEnregistrements, type EnregistrementBrut } from "./client";
import { tables, type CleTable, type Tables } from "./fields";
import { valeursConnuesDe } from "./zod";

z.config(z.locales.fr()); // messages d'erreur en français dans la liste « à vérifier »

/**
 * Enregistrement à vérifier dans Airtable. Deux cas :
 * - `aVerifier` : invalide, mis de côté, n'entre dans aucun calcul, l'écran le signale ;
 * - `signales` : valide et compté, mais une valeur de liste est inattendue (valeur
 *   brute gardée) ; listé sur la page de contrôle, les totaux concernés le signalent,
 *   rien de visible sur les écrans de saisie.
 */
export type AVerifier = {
  table: string; // nom lisible de la table
  id: string; // id Airtable de l'enregistrement (rec…)
  champs: { nom: string; probleme: string }[];
};

export type Lecture<T> = { valides: T[]; aVerifier: AVerifier[]; signales: AVerifier[] };

export type Parse<T> =
  | { ok: true; valeur: T; signale?: AVerifier }
  | { ok: false; aVerifier: AVerifier };

// Forme valide : seulement des clés existantes dans fields.ts pour cette table.
export type Forme<K extends CleTable, F> = z.ZodRawShape & {
  [C in Exclude<keyof F, keyof Tables[K]["champs"]>]: never;
};

/**
 * Déclare la lecture d'une table : les clés de `forme` sont les clés lisibles de
 * fields.ts, les valeurs les schémas Zod (cf. ./zod.ts). Seuls ces champs sont
 * demandés à Airtable.
 */
export function definirLecture<K extends CleTable, F extends Forme<K, F>>(cleTable: K, forme: F) {
  const table = tables[cleTable];
  const champs = table.champs as Record<string, { id: string; nom: string }>;
  const cles = Object.keys(forme);
  const schema = z.object(forme);
  type Valeur = z.output<typeof schema> & { id: string };
  const listes = cles.flatMap((k) => {
    const valeurs = valeursConnuesDe(forme[k] as z.ZodType);
    return valeurs ? [{ k, valeurs }] : [];
  });

  function signaler(id: string, valeur: Record<string, unknown>): AVerifier | undefined {
    const champsSignales = listes
      .filter(({ k, valeurs }) => typeof valeur[k] === "string" && !valeurs.includes(valeur[k]))
      .map(({ k }) => ({ nom: champs[k].nom, probleme: `valeur inattendue « ${valeur[k]} »` }));
    return champsSignales.length ? { table: table.nom, id, champs: champsSignales } : undefined;
  }

  function parser(brut: EnregistrementBrut): Parse<Valeur> {
    const entree: Record<string, unknown> = {};
    for (const k of cles) entree[k] = brut.fields[champs[k].id];

    const r = schema.safeParse(entree);
    if (r.success) {
      return { ok: true, valeur: { ...r.data, id: brut.id }, signale: signaler(brut.id, r.data) };
    }

    const parChamp = new Map<string, string>();
    for (const issue of r.error.issues) {
      const k = String(issue.path[0]);
      if (parChamp.has(k)) continue;
      parChamp.set(k, entree[k] === undefined ? "vide" : issue.message);
    }
    return {
      ok: false,
      aVerifier: {
        table: table.nom,
        id: brut.id,
        champs: [...parChamp].map(([k, probleme]) => ({ nom: champs[k]?.nom ?? k, probleme })),
      },
    };
  }

  /**
   * Lit la table. Avec `campagne` (id rec…), ne garde que les lignes liées à
   * cette campagne, AVANT validation : les anciennes campagnes incomplètes
   * n'encombrent pas la liste « à vérifier ». Une ligne sans campagne est gardée
   * (elle part dans « à vérifier »).
   */
  async function lister(filtre?: { campagne?: string }): Promise<Lecture<Valeur>> {
    await exigerSession();
    let bruts = await listerEnregistrements(
      table.id,
      cles.map((k) => champs[k].id),
    );
    if (filtre?.campagne) {
      if (!("campagne" in forme)) throw new Error(`${table.nom} : pas de champ campagne lu`);
      const idChamp = champs.campagne.id;
      bruts = bruts.filter((b) => {
        const v = b.fields[idChamp];
        return !Array.isArray(v) || v.length === 0 || v.includes(filtre.campagne);
      });
    }
    const resultat: Lecture<Valeur> = { valides: [], aVerifier: [], signales: [] };
    for (const brut of bruts) {
      const p = parser(brut);
      if (p.ok) {
        resultat.valides.push(p.valeur);
        if (p.signale) resultat.signales.push(p.signale);
      } else resultat.aVerifier.push(p.aVerifier);
    }
    return resultat;
  }

  return { parser, lister };
}

/** Ids des enregistrements signalés, pour marquer les totaux qui les contiennent. */
export function idsSignales(...lectures: Lecture<unknown>[]): Set<string> {
  return new Set(lectures.flatMap((l) => l.signales.map((s) => s.id)));
}

/** Type d'un enregistrement valide, à partir d'une lecture déclarée. */
export type ValeurDe<L extends { parser: (b: EnregistrementBrut) => Parse<unknown> }> = Extract<
  ReturnType<L["parser"]>,
  { ok: true }
>["valeur"];
