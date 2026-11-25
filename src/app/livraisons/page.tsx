// Écran « Livraisons » : intégration de docs/mockups/Livraisons.dc.html (validée par le client).
// LECTURE SEULE et aucun calcul : totaux par culture lus dans Synthèse (Livraison en T,
// Nombre de livraison, Valeur livrée estimée), lignes lues dans Livraison (Poids net (t),
// Valeur estimée). Seule la longueur des barres est une proportion d'affichage.
import Link from "next/link";
import { Suspense } from "react";
import { exigerSession } from "@/lib/auth/session";
import { listerLivraisons, type Livraison } from "@/lib/airtable/livraison";
import { listerSyntheses, type Synthese } from "@/lib/airtable/synthese";
import { dateFr, euros, estNul, nombre } from "@/lib/format";
import { AucuneCampagne, campagneAffichee } from "../_ecran/campagne";
import { Chargement } from "../_ecran/Chargement";
import { couleurCulture, nomCulture, parOrdre } from "../_ecran/cultures";
import { Menu } from "../_ecran/Menu";
import { BoutonAjouter, Tuile } from "../_ecran/Tuile";

export default function PageLivraisons(props: PageProps<"/livraisons">) {
  return (
    <Suspense fallback={<Chargement texte="Chargement des livraisons…" />}>
      <Contenu searchParams={props.searchParams} />
    </Suspense>
  );
}

const A_VERIFIER = "à vérifier";

function tonnes(v: number | null | undefined, decimales: number): string {
  return v == null ? "—" : `${nombre(v, decimales)} t`;
}

function pourcent(v: number | undefined): string {
  return v == null ? "—" : `${nombre(v, 1)} %`;
}

function eurosOuTiret(v: number | null | undefined): string {
  return estNul(v, 0) ? "—" : euros(v, 0);
}

function sousTitre(s: Synthese): string {
  if (s.nombreDeLivraison === 0) return "Aucune livraison enregistrée";
  const nb = `${s.nombreDeLivraison} livraison${s.nombreDeLivraison > 1 ? "s" : ""}`;
  return estNul(s.valeurLivreeEstimeeEuros, 0) ? nb : `${nb} · ${euros(s.valeurLivreeEstimeeEuros, 0)}`;
}

/** Plus ancienne d'abord ; même jour : par numéro de bon. */
function parDate(a: Livraison, b: Livraison): number {
  return a.dateDeLivraison.localeCompare(b.dateDeLivraison) || a.idBonDeLivraison.localeCompare(b.idBonDeLivraison);
}

async function Contenu({ searchParams }: { searchParams: PageProps<"/livraisons">["searchParams"] }) {
  await exigerSession();
  const { campagne: demandee, culture: cultureDemandee } = await searchParams;

  const affichee = await campagneAffichee(demandee);
  if (!affichee) return <AucuneCampagne />;
  const { campagne, choix } = affichee;

  const filtre = { campagne: campagne.id };
  const [syntheses, livraisons] = await Promise.all([listerSyntheses(filtre), listerLivraisons(filtre)]);

  // Tuiles : les cultures qui se livrent, et toute culture qui a quand même des livraisons.
  const tuiles = syntheses.valides.filter((s) => s.seLivre || s.nombreDeLivraison > 0).sort(parOrdre);
  const choisie = tuiles.find((s) => s.id === cultureDemandee) ?? tuiles[0];
  const maxLivre = Math.max(0, ...tuiles.map((s) => s.livraisonEnT ?? 0));

  const lignes = choisie
    ? livraisons.valides.filter((l) => l.culture === choisie.culture).sort(parDate)
    : [];

  // Livraisons pas encore reliées à la Synthèse : absentes des totaux tant que le lien manque.
  const nonReliees = livraisons.valides.filter((l) => l.synthese.length === 0).length;
  const nbProblemes = livraisons.aVerifier.length + livraisons.signales.length + syntheses.aVerifier.length + nonReliees;

  return (
    <div className="app">
      <Menu actif="livraisons" campagnes={choix} campagneChoisie={campagne.id} />
      <main className="wrap">
        <div className="head">
          <h1>Livraisons</h1>
          <BoutonAjouter libelle="Nouvelle livraison" />
        </div>

        {nbProblemes > 0 && (
          <p className="hint">
            Certaines livraisons sont à vérifier dans Airtable.{" "}
            <Link href={`/controle?campagne=${campagne.id}`}>Voir le détail</Link>
          </p>
        )}

        {!choisie ? (
          <p className="empty">Aucune culture à livrer pour cette campagne.</p>
        ) : (
          <div className="split" style={{ gridTemplateColumns: "minmax(250px, 22%) minmax(0, 1fr)" }}>
            <section className="card" aria-labelledby="t-c">
              <h2 id="t-c">Par culture</h2>
              <div className="tiles" role="group" aria-label="Choisir la culture">
                {tuiles.map((s) => (
                  <Tuile
                    key={s.id}
                    href={`/livraisons?campagne=${campagne.id}&culture=${s.id}`}
                    on={s.id === choisie.id}
                    couleur={couleurCulture(s)}
                    nom={nomCulture(s)}
                    droite={s.alerte ?? tonnes(s.livraisonEnT ?? 0, 1)}
                    sousTitre={sousTitre(s)}
                    barre={maxLivre > 0 ? (s.livraisonEnT ?? 0) / maxLivre : 0}
                  />
                ))}
              </div>
            </section>

            <section className="card" style={{ border: `4px solid ${couleurCulture(choisie)}` }} aria-labelledby="t-l">
              <div className="cardhead">
                <h2 id="t-l">
                  <span className="sw" style={{ background: couleurCulture(choisie) }} />
                  Livraisons de {nomCulture(choisie)}
                </h2>
                <span style={{ fontSize: 19, fontWeight: 700 }}>
                  Total : {tonnes(choisie.livraisonEnT ?? 0, 1)} · {eurosOuTiret(choisie.valeurLivreeEstimeeEuros)}
                </span>
              </div>
              <div className="box">
                {lignes.length === 0 ? (
                  <p className="empty">Aucune livraison enregistrée pour cette culture.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Poids net</th>
                        <th scope="col">Valeur estimée</th>
                        <th scope="col">Humidité</th>
                        <th scope="col">Poids spécifique</th>
                        <th scope="col">Protéines</th>
                        <th scope="col">Impuretés</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lignes.map((l) => (
                        <tr key={l.id}>
                          <td className="name">
                            {dateFr(l.dateDeLivraison)}
                            {l.synthese.length === 0 && <span className="flag">{A_VERIFIER}</span>}
                          </td>
                          <td style={{ fontWeight: 700 }}>{tonnes(l.poidsNetT, 2)}</td>
                          <td>{eurosOuTiret(l.valeurEstimeeEuros)}</td>
                          <td>{pourcent(l.h2o)}</td>
                          <td>{l.ps == null ? "—" : nombre(l.ps, 1)}</td>
                          <td>{pourcent(l.proteine)}</td>
                          <td>{pourcent(l.impurete)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
