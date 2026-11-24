import "server-only";
import { definirLecture, type ValeurDe } from "./lecture";
import { calculRequis, choixParmi, date, texteRequis } from "./zod";

// Campagnes : une par année de récolte, du 01/07 au 30/06.
// Les colonnes « Stock Ble », « Vente Mais »… sont exclues de fields.ts.
const lecture = definirLecture("campagnes", {
  name: texteRequis,
  dateDeDebut: date,
  dateDeFin: date,
  status: choixParmi(["En cours", "Terminé"]),
  anneeDeRecolte: calculRequis, // formule Airtable : on la lit, on ne la recalcule pas
});

export type Campagne = ValeurDe<typeof lecture>;
export const parseCampagne = lecture.parser;
export const listerCampagnes = lecture.lister;

/**
 * Campagne qui contient une date (« AAAA-MM-JJ »), d'après les dates de début
 * et de fin lues dans Airtable. Sert à préremplir la campagne à partir de la
 * date d'un formulaire ou de la date du jour.
 */
export function campagnePourDate(campagnes: Campagne[], jour: string): Campagne | undefined {
  return campagnes.find((c) => c.dateDeDebut <= jour && jour <= c.dateDeFin);
}
