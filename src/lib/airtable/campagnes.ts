import "server-only";
import { definirLecture, type ValeurDe } from "./lecture";
import { choix, date, texteRequis } from "./zod";

// Campagnes : une par année de récolte. Les champs « Stock Ble », « Vente Mais »…
// sont exclus de fields.ts ; on recalcule à partir des enregistrements.
const lecture = definirLecture("campagnes", {
  name: texteRequis,
  dateDeDebut: date,
  dateDeFin: date,
  status: choix, // « En cours » | « Terminé », parfois vide
});

type CampagneBrute = ValeurDe<typeof lecture>;

export type Campagne = CampagneBrute & {
  /** Même règle que la formule Airtable : YEAR({Date de fin}). */
  anneeDeRecolte: number;
};

function enrichir(c: CampagneBrute): Campagne {
  return { ...c, anneeDeRecolte: Number(c.dateDeFin.slice(0, 4)) };
}

export function parseCampagne(...args: Parameters<typeof lecture.parser>) {
  const r = lecture.parser(...args);
  return r.ok ? { ok: true as const, valeur: enrichir(r.valeur) } : r;
}

export async function listerCampagnes() {
  const { valides, aVerifier } = await lecture.lister();
  return { valides: valides.map(enrichir), aVerifier };
}
