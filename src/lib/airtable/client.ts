import "server-only";
import { logError } from "@/lib/logger";

// Seul endroit qui parle à l'API Airtable. Côté serveur uniquement.

export type EnregistrementBrut = {
  id: string;
  createdTime: string;
  fields: Record<string, unknown>; // clés = IDs de champ (returnFieldsByFieldId)
};

/** Erreur technique (réseau, jeton, quota). Le message affiché à l'écran reste sans jargon. */
export class ErreurAirtable extends Error {
  constructor(
    message: string,
    readonly statut?: number,
  ) {
    super(message);
    this.name = "ErreurAirtable";
  }
}

function config() {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) throw new ErreurAirtable("AIRTABLE_TOKEN ou AIRTABLE_BASE_ID manquant");
  return { token, baseId };
}

/**
 * Lit tous les enregistrements d'une table (pagination gérée), en ne demandant
 * que les champs listés. Lance ErreurAirtable en cas d'échec (déjà loggée).
 */
export async function listerEnregistrements(
  tableId: string,
  champIds: readonly string[],
): Promise<EnregistrementBrut[]> {
  const { token, baseId } = config();
  const resultats: EnregistrementBrut[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
    url.searchParams.set("returnFieldsByFieldId", "true");
    url.searchParams.set("pageSize", "100");
    for (const id of champIds) url.searchParams.append("fields[]", id);
    if (offset) url.searchParams.set("offset", offset);

    let reponse: Response;
    try {
      reponse = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(15_000),
      });
    } catch (e) {
      logError("airtable.lister", e, { tableId });
      throw new ErreurAirtable("Airtable injoignable");
    }

    if (!reponse.ok) {
      // Corps tronqué : jamais le jeton (il n'est que dans l'en-tête de la requête).
      const corps = (await reponse.text()).slice(0, 300);
      const err = new ErreurAirtable(`Airtable a répondu ${reponse.status}`, reponse.status);
      logError("airtable.lister", err, { tableId, corps });
      throw err;
    }

    const page = (await reponse.json()) as { records: EnregistrementBrut[]; offset?: string };
    resultats.push(...page.records);
    offset = page.offset;
  } while (offset);

  return resultats;
}
