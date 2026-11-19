/**
 * Génère src/lib/airtable/fields.ts à partir du schéma de la base Airtable.
 * Lecture seule (API meta) : ne modifie jamais la base.
 *
 * Usage : npm run airtable:champs
 * (lit AIRTABLE_TOKEN et AIRTABLE_BASE_ID dans .env.local)
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

type ChampMeta = { id: string; name: string; type: string };
type TableMeta = { id: string; name: string; fields: ChampMeta[] };

// Champs morts (cf. CLAUDE.md) : absents de fields.ts, donc inutilisables.
const CHAMPS_MORTS = new Set([
  "Synthèse copy",
  "Field 20",
  "Field 22",
  "Livraison_test",
  "new type achat",
  "Achat 2",
]);

// Champs écrits en dur pour chaque culture (« Stock Ble », « Vente Mais »…) :
// on recalcule dans le code, donc on ne les expose pas.
const CULTURES = "(Ble|Blé|Mais|Colza|Tournesol|Orge Hiver|Orge Printemps|Luzerne|Jachère)";
const CHAMPS_PAR_CULTURE = [
  new RegExp(`^(Stock|Vente|Livraison|Tonnage|Surface Totale|Surface totale) ${CULTURES}$`),
  /^Travaux effectués sur /,
];

function estIgnore(nom: string): boolean {
  return CHAMPS_MORTS.has(nom) || CHAMPS_PAR_CULTURE.some((re) => re.test(nom));
}

/** « Prix par tonne » → prixParTonne ; « Vente en € » → venteEnEuros */
function cle(nom: string): string {
  const mots = nom
    .replaceAll("€", " euros ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const c = mots
    .map((m, i) => (i === 0 ? m.toLowerCase() : m[0].toUpperCase() + m.slice(1).toLowerCase()))
    .join("");
  return /^[0-9]/.test(c) ? `_${c}` : c;
}

async function main() {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) {
    console.error("AIRTABLE_TOKEN et AIRTABLE_BASE_ID doivent être définis (.env.local).");
    process.exit(1);
  }

  const r = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) {
    console.error(`Lecture du schéma impossible : HTTP ${r.status}`);
    process.exit(1);
  }
  const { tables } = (await r.json()) as { tables: TableMeta[] };

  const ignores: string[] = [];
  const lignes: string[] = [];
  const clesTables = new Set<string>();

  for (const t of tables) {
    const cleTable = cle(t.name);
    if (clesTables.has(cleTable)) throw new Error(`Deux tables donnent la clé « ${cleTable} »`);
    clesTables.add(cleTable);

    const clesChamps = new Set<string>();
    lignes.push(`  ${cleTable}: {`, `    id: ${JSON.stringify(t.id)},`, `    nom: ${JSON.stringify(t.name)},`, `    champs: {`);
    for (const f of t.fields) {
      if (estIgnore(f.name)) {
        ignores.push(`${t.name}.${f.name}`);
        continue;
      }
      const k = cle(f.name);
      if (clesChamps.has(k)) throw new Error(`Deux champs de « ${t.name} » donnent la clé « ${k} »`);
      clesChamps.add(k);
      lignes.push(
        `      ${k}: { id: ${JSON.stringify(f.id)}, nom: ${JSON.stringify(f.name)}, type: ${JSON.stringify(f.type)} },`,
      );
    }
    lignes.push(`    },`, `  },`);
  }

  const sortie = [
    "// FICHIER GÉNÉRÉ par src/scripts/generer-champs.mts — ne pas modifier à la main.",
    "// Relancer `npm run airtable:champs` après un changement de schéma dans Airtable.",
    "// Seul fichier du projet qui contient des IDs Airtable (tbl…, fld…).",
    "//",
    "// Champs volontairement absents (morts, ou écrits en dur pour chaque culture) :",
    ...ignores.map((n) => `//   - ${n}`),
    "",
    "export const tables = {",
    ...lignes,
    "} as const;",
    "",
    "export type Tables = typeof tables;",
    "export type CleTable = keyof Tables;",
    "",
  ].join("\n");

  const chemin = fileURLToPath(new URL("../lib/airtable/fields.ts", import.meta.url));
  writeFileSync(chemin, sortie);
  console.log(`fields.ts généré : ${tables.length} tables, ${ignores.length} champs ignorés.`);
}

main();
