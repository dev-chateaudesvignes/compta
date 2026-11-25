import "server-only";
import { listerAchats } from "@/lib/airtable/achat";
import type { Campagne } from "@/lib/airtable/campagnes";
import { idsSignales, type Lecture } from "@/lib/airtable/lecture";
import { listerSyntheses, type Synthese } from "@/lib/airtable/synthese";
import { listerTravaux, type Travail } from "@/lib/airtable/travaux";

/**
 * Lectures du résultat d'une campagne (Synthèse) et de ce qui permet de marquer
 * les montants « à vérifier ». Aucun calcul de montant : tout vient d'Airtable.
 */
export async function lireResultatCampagne(campagne: Campagne) {
  const filtre = { campagne: campagne.id };
  const [syntheses, travaux, achats] = await Promise.all([
    listerSyntheses(filtre),
    listerTravaux(),
    listerAchats(filtre),
  ]);

  // Travaux n'a pas de lien Campagne : on garde ceux des lignes Synthèse de la campagne.
  const idsSynthese = new Set(syntheses.valides.map((s) => s.id));
  const valides = travaux.valides.filter((t) => idsSynthese.has(t.cultureRecolte));
  const idsTravaux = new Set(valides.map((t) => t.id));
  const travauxCampagne: Lecture<Travail> = {
    valides,
    aVerifier: travaux.aVerifier, // sans lien fiable, on ne sait pas les rattacher : toutes campagnes
    signales: travaux.signales.filter((s) => idsTravaux.has(s.id)),
  };

  const travauxSignales = idsSignales(travauxCampagne);
  const achatsSignales = idsSignales(achats);

  /** Une ligne Synthèse est concernée si un de ses Travaux est signalé (rollups de charges). */
  const syntheseSignalee = (s: Synthese) => s.travaux.some((id) => travauxSignales.has(id));

  return {
    syntheses,
    travauxCampagne,
    achats,
    syntheseSignalee,
    resultatSignale: syntheses.valides.some(syntheseSignalee),
    horsCultureSignale: achats.valides.some((a) => a.horsCultureEuros && achatsSignales.has(a.id)),
  };
}
