import "server-only";
import { campagnePourDate, listerCampagnes, type Campagne } from "@/lib/airtable/campagnes";
import { dateParDefaut } from "@/lib/config";
import { dateFr } from "@/lib/format";

/** « Campagne 2024/2025 » → « 2024 / 2025 ». */
export function libelleCampagne(c: Campagne): string {
  return c.name.replace(/^campagne\s+/i, "").replace(/\s*\/\s*/, " / ");
}

/**
 * Campagne affichée par un écran : celle demandée dans l'adresse (?campagne=rec…),
 * sinon celle de la date par défaut. Renvoie aussi la liste du menu : les campagnes
 * qui ont des cultures, la campagne en cours, et celle affichée.
 */
export async function campagneAffichee(demandee: string | string[] | undefined) {
  const campagnes = await listerCampagnes();
  const parDefaut = campagnePourDate(campagnes.valides, dateParDefaut());
  const campagne = campagnes.valides.find((c) => c.id === demandee) ?? parDefaut;
  if (!campagne) return null;

  const choix = campagnes.valides
    .filter((c) => c.totalSurfacePacHa > 0 || c.status === "En cours" || c.id === campagne.id)
    .sort((a, b) => a.anneeDeRecolte - b.anneeDeRecolte)
    .map((c) => ({ id: c.id, libelle: libelleCampagne(c) }));

  return { campagne, choix };
}

export function AucuneCampagne() {
  return (
    <div className="app">
      <main className="wrap">
        <p className="empty">
          Aucune campagne ne correspond à la date du {dateFr(dateParDefaut())}. Il faut la créer dans Airtable.
        </p>
      </main>
    </div>
  );
}
