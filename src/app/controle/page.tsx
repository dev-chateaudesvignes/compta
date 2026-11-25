// PAGE PROVISOIRE de contrôle des lectures Airtable (étape « typage Zod »).
// À retirer (ou à garder comme page technique) quand les écrans des maquettes seront en place.
// Aucun calcul : tous les montants sont lus dans Airtable (Synthèse, Campagnes).
import Link from "next/link";
import { Suspense } from "react";
import { exigerSession } from "@/lib/auth/session";
import { listerAssolements } from "@/lib/airtable/assolement";
import { listerAutresRecettes } from "@/lib/airtable/autresRecettes";
import { campagnePourDate, listerCampagnes } from "@/lib/airtable/campagnes";
import { listerCultures } from "@/lib/airtable/cultures";
import type { AVerifier, Lecture } from "@/lib/airtable/lecture";
import { listerLivraisons } from "@/lib/airtable/livraison";
import { listerProduits } from "@/lib/airtable/produit";
import { listerVentes } from "@/lib/airtable/vente";
import { dateParDefaut } from "@/lib/config";
import { euros, nombre } from "@/lib/format";
import { lireResultatCampagne } from "@/lib/resultatCampagne";
import { Chargement } from "../_ecran/Chargement";

export default function Controle(props: PageProps<"/controle">) {
  return (
    <Suspense fallback={<Chargement texte="Lecture des données…" />}>
      <Contenu searchParams={props.searchParams} />
    </Suspense>
  );
}

const ALERTE = "⚠ contient des lignes à vérifier";

async function Contenu({ searchParams }: { searchParams: PageProps<"/controle">["searchParams"] }) {
  await exigerSession();
  const { campagne: demandee } = await searchParams;

  const campagnes = await listerCampagnes();
  const parDefaut = campagnePourDate(campagnes.valides, dateParDefaut());
  const campagne = campagnes.valides.find((c) => c.id === demandee) ?? parDefaut;
  const autres = campagnes.valides
    .filter((c) => !parDefaut || Math.abs(c.anneeDeRecolte - parDefaut.anneeDeRecolte) <= 2)
    .sort((a, b) => a.anneeDeRecolte - b.anneeDeRecolte);

  if (!campagne) {
    return <p className="p-8 text-xl">Aucune campagne ne contient la date {dateParDefaut()}.</p>;
  }

  const filtre = { campagne: campagne.id };
  const [resultat, cultures, assolements, livraisons, ventes, recettes, produits] = await Promise.all([
    lireResultatCampagne(campagne),
    listerCultures(),
    listerAssolements(filtre),
    listerLivraisons(filtre),
    listerVentes(filtre),
    listerAutresRecettes(filtre),
    listerProduits(),
  ]);
  const { syntheses, achats, travauxCampagne, syntheseSignalee, resultatSignale, horsCultureSignale } = resultat;

  const nomCulture = new Map(cultures.valides.map((c) => [c.id, c.nomCulture]));

  const lectures: [string, Lecture<unknown>][] = [
    ["Campagnes (toutes)", campagnes],
    ["Cultures (toutes)", cultures],
    ["Produits (tous)", produits],
    ["Synthèse", syntheses],
    ["Assolement", assolements],
    ["Livraisons", livraisons],
    ["Ventes", ventes],
    ["Achats", achats],
    ["Autres recettes", recettes],
    ["Travaux (« à vérifier » : toutes campagnes)", travauxCampagne],
  ];
  const aVerifier = lectures.flatMap(([, l]) => l.aVerifier);
  const signales = lectures.flatMap(([, l]) => l.signales);

  return (
    <main className="mx-auto max-w-5xl space-y-10 p-8 text-lg">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Contrôle des données — {campagne.name}</h1>
        <p>Date par défaut des formulaires : {dateParDefaut()}</p>
        <nav className="flex flex-wrap gap-3">
          {autres.map((c) => (
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
                <td className="py-2">
                  {nomCulture.get(s.culture) ?? s.idCultureAnnee}
                  {syntheseSignalee(s) && <span className="ml-2 text-base text-amber-700">{ALERTE}</span>}
                </td>
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
                Total des cultures {resultatSignale && <span className="text-amber-700">({ALERTE})</span>}
              </td>
              <td className="text-right font-semibold">{euros(campagne.resultatCulturesEuros)}</td>
            </tr>
            <tr>
              <td colSpan={5} className="py-2 text-right">
                − Hors culture (factures, ex. bonus TSA){" "}
                {horsCultureSignale && <span className="text-amber-700">({ALERTE})</span>}
              </td>
              <td className="text-right">{euros(campagne.horsCultureEuros)}</td>
            </tr>
            <tr>
              <td colSpan={5} className="py-2 text-right">
                Résultat de l&apos;exploitation (référence 24/25 : 8 204,01 €)
              </td>
              <td className="text-right font-semibold">{euros(campagne.resultatExploitationEuros)}</td>
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
              <th className="text-right">Comptées</th>
              <th className="text-right">dont valeur inattendue</th>
              <th className="text-right">Mises de côté</th>
            </tr>
          </thead>
          <tbody>
            {lectures.map(([nom, l]) => (
              <tr key={nom} className="border-b">
                <td className="py-2">{nom}</td>
                <td className="text-right">{l.valides.length}</td>
                <td className={`text-right ${l.signales.length ? "font-semibold text-amber-700" : ""}`}>
                  {l.signales.length}
                </td>
                <td className={`text-right ${l.aVerifier.length ? "font-semibold text-red-700" : ""}`}>
                  {l.aVerifier.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <ListeAVerifier titre="Mises de côté (invalides, hors calculs)" lignes={aVerifier} />
      <ListeAVerifier titre="Valeurs inattendues (lignes comptées avec leur valeur brute)" lignes={signales} />
    </main>
  );
}

function ListeAVerifier({ titre, lignes }: { titre: string; lignes: AVerifier[] }) {
  if (lignes.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-2xl font-semibold">{titre}</h2>
      <ul className="space-y-2">
        {lignes.map((a) => (
          <li key={`${a.table}-${a.id}`}>
            <span className="font-semibold">{a.table}</span> <code className="text-base">{a.id}</code> :{" "}
            {a.champs.map((c) => `${c.nom} (${c.probleme})`).join(", ")}
          </li>
        ))}
      </ul>
    </section>
  );
}
