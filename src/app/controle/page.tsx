// PAGE PROVISOIRE de contrôle des lectures Airtable (étape « typage Zod »).
// À retirer quand les écrans des maquettes seront en place.
// Le total des résultats est additionné ici uniquement comme contrôle technique
// (valeur attendue 24/25 : 8 204,00 €) : ce n'est pas un écran de l'app.
import Link from "next/link";
import { Suspense } from "react";
import { exigerSession } from "@/lib/auth/session";
import { listerAchats } from "@/lib/airtable/achat";
import { listerAssolements } from "@/lib/airtable/assolement";
import { listerAutresRecettes } from "@/lib/airtable/autresRecettes";
import { campagnePourDate, listerCampagnes } from "@/lib/airtable/campagnes";
import { listerCultures } from "@/lib/airtable/cultures";
import type { AVerifier } from "@/lib/airtable/lecture";
import { listerLivraisons } from "@/lib/airtable/livraison";
import { listerProduits } from "@/lib/airtable/produit";
import { listerSyntheses } from "@/lib/airtable/synthese";
import { listerTravaux } from "@/lib/airtable/travaux";
import { listerVentes } from "@/lib/airtable/vente";
import { euros, nombre } from "@/lib/format";

export default function Controle(props: PageProps<"/controle">) {
  return (
    <Suspense fallback={<p className="p-8 text-xl">Lecture des données…</p>}>
      <Contenu searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Contenu({ searchParams }: { searchParams: PageProps<"/controle">["searchParams"] }) {
  await exigerSession();
  const { campagne: demandee } = await searchParams;

  const campagnes = await listerCampagnes();
  const aujourdhui = new Date().toISOString().slice(0, 10);
  // Campagne du jour, sinon la dernière commencée (la suivante n'est pas toujours créée).
  const courante =
    campagnePourDate(campagnes.valides, aujourdhui) ??
    campagnes.valides
      .filter((c) => c.dateDeDebut <= aujourdhui)
      .sort((a, b) => b.dateDeDebut.localeCompare(a.dateDeDebut))[0];
  const campagne = campagnes.valides.find((c) => c.id === demandee) ?? courante;
  // Menu : les 3 dernières récoltes jusqu'à la campagne en cours.
  const recentes = campagnes.valides
    .filter((c) => !courante || (c.anneeDeRecolte <= courante.anneeDeRecolte && c.anneeDeRecolte > courante.anneeDeRecolte - 3))
    .sort((a, b) => a.anneeDeRecolte - b.anneeDeRecolte);

  if (!campagne) {
    return <p className="p-8 text-xl">Aucune campagne ne correspond à aujourd&apos;hui.</p>;
  }

  const filtre = { campagne: campagne.id };
  const [cultures, syntheses, assolements, livraisons, ventes, achats, autres, travaux, produits] =
    await Promise.all([
      listerCultures(),
      listerSyntheses(filtre),
      listerAssolements(filtre),
      listerLivraisons(filtre),
      listerVentes(filtre),
      listerAchats(filtre),
      listerAutresRecettes(filtre),
      listerTravaux(),
      listerProduits(),
    ]);

  // Travaux n'a pas de lien Campagne : on garde ceux des lignes Synthèse de la campagne.
  const idsSynthese = new Set(syntheses.valides.map((s) => s.id));
  const travauxCampagne = travaux.valides.filter((t) => idsSynthese.has(t.cultureRecolte));

  const nomCulture = new Map(cultures.valides.map((c) => [c.id, c.nomCulture]));
  const totalResultat = syntheses.valides.reduce((s, l) => s + l.resultatEuros, 0);
  const totalHorsCulture = achats.valides.reduce((s, a) => s + (a.horsCultureEuros ?? 0), 0);

  const lectures: [string, number, AVerifier[]][] = [
    ["Campagnes (toutes)", campagnes.valides.length, campagnes.aVerifier],
    ["Cultures (toutes)", cultures.valides.length, cultures.aVerifier],
    ["Produits (tous)", produits.valides.length, produits.aVerifier],
    ["Synthèse", syntheses.valides.length, syntheses.aVerifier],
    ["Assolement", assolements.valides.length, assolements.aVerifier],
    ["Livraisons", livraisons.valides.length, livraisons.aVerifier],
    ["Ventes", ventes.valides.length, ventes.aVerifier],
    ["Achats", achats.valides.length, achats.aVerifier],
    ["Autres recettes", autres.valides.length, autres.aVerifier],
    ["Travaux (de la campagne / à vérifier : toutes campagnes)", travauxCampagne.length, travaux.aVerifier],
  ];
  const aVerifier = lectures.flatMap(([, , a]) => a);

  return (
    <main className="mx-auto max-w-5xl space-y-10 p-8 text-lg">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Contrôle des données — {campagne.name}</h1>
        <nav className="flex flex-wrap gap-3">
          {recentes.map((c) => (
              <Link
                key={c.id}
                href={`/controle?campagne=${c.id}`}
                className={`rounded-lg border-2 px-4 py-2 ${c.id === campagne.id ? "border-green-700 font-semibold" : "border-zinc-300"}`}
              >
                {c.name}
              </Link>
            ))}
        </nav>
      </header>

      <section>
        <h2 className="mb-3 text-2xl font-semibold">Résultat par culture (lu dans Synthèse)</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 text-left">
              <th className="py-2">Culture</th>
              <th className="text-right">Surface PAC</th>
              <th className="text-right">Ventes</th>
              <th className="text-right">Autres recettes</th>
              <th className="text-right">Charges</th>
              <th className="text-right">Résultat</th>
            </tr>
          </thead>
          <tbody>
            {syntheses.valides.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="py-2">{nomCulture.get(s.culture) ?? s.idCultureAnnee}</td>
                <td className="text-right">{nombre(s.surfacePacHa)} ha</td>
                <td className="text-right">{euros(s.ventesEuros)}</td>
                <td className="text-right">{euros(s.autresRecettesEuros)}</td>
                <td className="text-right">{euros(s.chargesEuros)}</td>
                <td className="text-right font-semibold">{euros(s.resultatEuros)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="py-2 text-right">
                Total des cultures
              </td>
              <td className="text-right font-semibold">{euros(totalResultat)}</td>
            </tr>
            <tr>
              <td colSpan={5} className="py-2 text-right">
                − Hors culture (factures, ex. bonus TSA)
              </td>
              <td className="text-right">{euros(totalHorsCulture)}</td>
            </tr>
            <tr>
              <td colSpan={5} className="py-2 text-right">
                Résultat de l&apos;exploitation (contrôle technique, attendu 24/25 : 8 204,00 €)
              </td>
              <td className="text-right font-semibold">{euros(totalResultat - totalHorsCulture)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold">Lectures</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 text-left">
              <th className="py-2">Table</th>
              <th className="text-right">Valides</th>
              <th className="text-right">À vérifier</th>
            </tr>
          </thead>
          <tbody>
            {lectures.map(([nom, n, a]) => (
              <tr key={nom} className="border-b">
                <td className="py-2">{nom}</td>
                <td className="text-right">{n}</td>
                <td className={`text-right ${a.length ? "font-semibold text-red-700" : ""}`}>{a.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {aVerifier.length > 0 && (
        <section>
          <h2 className="mb-3 text-2xl font-semibold">À vérifier dans Airtable</h2>
          <ul className="space-y-2">
            {aVerifier.map((a) => (
              <li key={`${a.table}-${a.id}`}>
                <span className="font-semibold">{a.table}</span> <code className="text-base">{a.id}</code> :{" "}
                {a.champs.map((c) => `${c.nom} (${c.probleme})`).join(", ")}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
