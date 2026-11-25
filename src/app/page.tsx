// Écran « Synthèse » : intégration de docs/mockups/Main.dc.html (validée par le client).
// LECTURE SEULE et aucun calcul : chaque chiffre est lu dans Airtable (lignes
// Synthèse pour les cultures, rollups de Campagnes pour les totaux).
// Écart accepté le 24/11 : sous la ligne Total, « Hors culture » et « Résultat de
// l'exploitation » (lus dans Campagnes).
import Link from "next/link";
import { Suspense } from "react";
import { exigerSession } from "@/lib/auth/session";
import { campagnePourDate, listerCampagnes, type Campagne } from "@/lib/airtable/campagnes";
import type { Synthese } from "@/lib/airtable/synthese";
import { dateParDefaut } from "@/lib/config";
import { euros, eurosSigne, estNul, nombre } from "@/lib/format";
import { lireResultatCampagne } from "@/lib/resultatCampagne";
import { Menu } from "./_ecran/Menu";

export default function PageSynthese(props: PageProps<"/">) {
  return (
    <Suspense fallback={<Attente />}>
      <Contenu searchParams={props.searchParams} />
    </Suspense>
  );
}

function Attente() {
  return (
    <div className="app">
      <main className="wrap">
        <p className="empty">Chargement de la synthèse…</p>
      </main>
    </div>
  );
}

const A_VERIFIER = "à vérifier";

// Couleur de chaque culture (maquette). Une culture absente de la liste prend une
// couleur de réserve, dans l'ordre d'affichage.
const COULEURS: Record<string, string> = {
  ble: "#C2410C",
  "orge hiver": "#2563EB",
  "orge d'hiver": "#2563EB",
  colza: "#CA8A04",
  mais: "#A21CAF",
  jachere: "#6B7280",
};
const COULEURS_RESERVE = ["#0E7490", "#4D7C0F", "#BE185D", "#475569", "#9A3412", "#1D4ED8"];

function sansAccent(texte: string): string {
  return texte.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

/** « Campagne 2024/2025 » → « 2024 / 2025 ». */
function libelleCampagne(c: Campagne): string {
  return c.name.replace(/^campagne\s+/i, "").replace(/\s*\/\s*/, " / ");
}

/** Montant arrondi à l'euro ; zéro → « — » (comme la maquette). */
function eurosOuTiret(v: number | null | undefined): string {
  return estNul(v, 0) ? "—" : euros(v, 0);
}

function classeResultat(v: number): string {
  return estNul(v, 0) ? "" : v > 0 ? "pos" : "neg";
}

async function Contenu({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  await exigerSession();
  const { campagne: demandee } = await searchParams;

  const campagnes = await listerCampagnes();
  const parDefaut = campagnePourDate(campagnes.valides, dateParDefaut());
  const campagne = campagnes.valides.find((c) => c.id === demandee) ?? parDefaut;

  if (!campagne) {
    return (
      <div className="app">
        <main className="wrap">
          <p className="empty">
            Aucune campagne ne correspond à la date du {dateParDefaut().split("-").reverse().join("/")}. Il faut
            la créer dans Airtable.
          </p>
        </main>
      </div>
    );
  }

  // Liste du menu : les campagnes qui ont des cultures, la campagne en cours, et celle affichée.
  const choix = campagnes.valides
    .filter((c) => c.totalSurfacePacHa > 0 || c.status === "En cours" || c.id === campagne.id)
    .sort((a, b) => a.anneeDeRecolte - b.anneeDeRecolte)
    .map((c) => ({ id: c.id, libelle: libelleCampagne(c) }));

  const { syntheses, achats, travauxCampagne, syntheseSignalee, resultatSignale, horsCultureSignale } =
    await lireResultatCampagne(campagne);

  // Ordre d'affichage : la plus grande surface d'abord (comme la maquette).
  const lignes = [...syntheses.valides].sort((a, b) => b.surfacePacHa - a.surfacePacHa);
  const couleur = new Map<string, string>();
  let reserve = 0;
  for (const s of lignes) {
    const c = COULEURS[sansAccent(s.nomCulture ?? "")];
    couleur.set(s.id, c ?? COULEURS_RESERVE[reserve++ % COULEURS_RESERVE.length]);
  }

  const nom = (s: Synthese) => s.nomCulture ?? s.idCultureAnnee;
  const aVerifier = (s: Synthese) => !!s.alerte || syntheseSignalee(s);

  // Lignes mises de côté (invalides, donc absentes du tableau) ou valeurs inattendues.
  const nbProblemes =
    syntheses.aVerifier.length +
    syntheses.signales.length +
    travauxCampagne.signales.length +
    achats.signales.length +
    lignes.filter((s) => s.alerte).length;
  const totalAVerifier = resultatSignale || syntheses.aVerifier.length > 0;
  const exploitationAVerifier = totalAVerifier || horsCultureSignale;

  const familles: { nom: string; parCulture: (s: Synthese) => number; total: number }[] = [
    { nom: "Travail du sol", parCulture: (s) => s.travailDuSolEuros, total: campagne.totalTravailDuSolEuros },
    { nom: "Récolte", parCulture: (s) => s.recolteEuros, total: campagne.totalRecolteEuros },
    {
      nom: "Travaux divers à répartir",
      parCulture: (s) => s.travauxDiversARepartirEuros,
      total: campagne.totalTravauxDiversARepartirEuros,
    },
    { nom: "Autres travaux", parCulture: (s) => s.autresTravauxEuros, total: campagne.totalAutresTravauxEuros },
    { nom: "Clause gasoil", parCulture: (s) => s.clauseGasoilEuros, total: campagne.totalClauseGasoilEuros },
  ];

  return (
    <div className="app">
      <Menu actif="synthese" campagnes={choix} campagneChoisie={campagne.id} />
      <main className="wrap">
        <div className="head">
          <h1>Synthèse de la campagne {libelleCampagne(campagne)}</h1>
        </div>

        {nbProblemes > 0 && (
          <p className="hint">
            Certaines lignes sont à vérifier dans Airtable.{" "}
            <Link href={`/controle?campagne=${campagne.id}`}>Voir le détail</Link>
          </p>
        )}

        <section className="card" aria-labelledby="t-cult">
          <div className="cardhead">
            <h2 id="t-cult">Résultat par culture</h2>
          </div>
          {lignes.length === 0 ? (
            <p className="empty">Aucune culture pour cette campagne.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th scope="col">Culture</th>
                  <th scope="col">Surface</th>
                  <th scope="col">Livré</th>
                  <th scope="col">Rendement</th>
                  <th scope="col">Ventes</th>
                  <th scope="col">Aides et autres</th>
                  <th scope="col">Dépenses</th>
                  <th scope="col" className="tc">
                    Résultat
                  </th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((s) => (
                  <tr key={s.id}>
                    <td className="name">
                      <span className="sw" style={{ background: couleur.get(s.id) }} />
                      {nom(s)}
                      {aVerifier(s) && <span className="flag">{s.alerte ?? A_VERIFIER}</span>}
                    </td>
                    <td>{nombre(s.surfacePacHa)} ha</td>
                    <td>{estNul(s.livraisonEnT, 1) ? "—" : `${nombre(s.livraisonEnT, 1)} t`}</td>
                    <td>{s.rendementEnTHa == null ? "—" : `${nombre(s.rendementEnTHa, 1)} t/ha`}</td>
                    <td>{eurosOuTiret(s.ventesEuros)}</td>
                    <td>{eurosOuTiret(s.autresRecettesEuros)}</td>
                    <td>{eurosOuTiret(s.chargesEuros)}</td>
                    <td className={`tc ${classeResultat(s.resultatEuros)}`}>{eurosSigne(s.resultatEuros)}</td>
                  </tr>
                ))}
                <tr className="total">
                  <td>
                    Total
                    {totalAVerifier && <span className="flag">{A_VERIFIER}</span>}
                  </td>
                  <td>{nombre(campagne.totalSurfacePacHa)} ha</td>
                  <td>{nombre(campagne.totalLivreT, 1)} t</td>
                  <td></td>
                  <td>{euros(campagne.totalVentesEuros, 0)}</td>
                  <td>{euros(campagne.totalAutresRecettesEuros, 0)}</td>
                  <td>{euros(campagne.totalChargesEuros, 0)}</td>
                  <td className={`tc ${classeResultat(campagne.resultatCulturesEuros)}`}>
                    {eurosSigne(campagne.resultatCulturesEuros)}
                  </td>
                </tr>
                <tr className="hors">
                  <td colSpan={7}>
                    Hors culture (bonus TSA…)
                    {horsCultureSignale && <span className="flag">{A_VERIFIER}</span>}
                  </td>
                  <td className="tc">{estNul(campagne.horsCultureEuros, 0) ? "—" : eurosSigne(-campagne.horsCultureEuros)}</td>
                </tr>
                <tr className="exploitation">
                  <td colSpan={7}>
                    Résultat de l&apos;exploitation
                    {exploitationAVerifier && <span className="flag">{A_VERIFIER}</span>}
                  </td>
                  <td className="tc">{eurosSigne(campagne.resultatExploitationEuros)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </section>

        {lignes.length > 0 && (
          <section className="card" aria-labelledby="t-tr">
            <div className="cardhead">
              <h2 id="t-tr">Travaux agricoles par culture</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th scope="col">Famille de travaux</th>
                  {lignes.map((s) => (
                    <th key={s.id} scope="col">
                      <span className="sw" style={{ background: couleur.get(s.id) }} />
                      {nom(s)}
                    </th>
                  ))}
                  <th scope="col" className="tc">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {familles.map((f) => (
                  <tr key={f.nom}>
                    <td className="name">{f.nom}</td>
                    {lignes.map((s) => (
                      <td key={s.id}>{eurosOuTiret(f.parCulture(s))}</td>
                    ))}
                    <td className="tc">{eurosOuTiret(f.total)}</td>
                  </tr>
                ))}
                <tr className="total">
                  <td>Total</td>
                  {lignes.map((s) => (
                    <td key={s.id}>{eurosOuTiret(s.chargesTravauxAgricolesEuros)}</td>
                  ))}
                  <td className="tc">{eurosOuTiret(campagne.totalTravauxAgricolesEuros)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}
