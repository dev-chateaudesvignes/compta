import "server-only";
import { z } from "zod";
import type { Forme } from "./lecture";
import { tables, type CleTable } from "./fields";

/**
 * Déclare ce que l'app a le droit d'écrire dans une table : schéma Zod STRICT
 * (toute clé inconnue est refusée), clés = clés lisibles de fields.ts.
 * `versChamps` traduit une valeur validée en { idDeChamp: valeur } pour l'API
 * (les valeurs undefined ne sont pas envoyées).
 */
export function definirEcriture<K extends CleTable, F extends Forme<K, F>>(cleTable: K, forme: F) {
  const champs = tables[cleTable].champs as Record<string, { id: string }>;
  const schema = z.strictObject(forme);

  function versChamps(valeur: z.output<typeof schema>): Record<string, unknown> {
    const sortie: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valeur)) {
      if (v !== undefined) sortie[champs[k].id] = v;
    }
    return sortie;
  }

  return { schema, versChamps };
}
