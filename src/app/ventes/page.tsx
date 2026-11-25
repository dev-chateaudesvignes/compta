// Écran « Ventes » : intégration de docs/mockups/Ventes.dc.html (validée par le client).
// Données décrites dans docs/schema-api.md (section Vente, « Écran Ventes »).
// Tuiles, en-tête et ligne Total : lus dans Synthèse — Valeur contrats (€) et PAS
// Ventes (€), qui bascule sur l'encaissé dès qu'il est saisi.
// Seuls calculs d'affichage (liste fermée, docs/schema-api.md « Principe ») : colonnes
// « Total vendu » (cumul) et « Part de la récolte vendue », largeur des barres.
import Link from "next/link";
import { Suspense } from "react";
import { exigerSession } from "@/lib/auth/session";
import { listerSyntheses, type Synthese } from "@/lib/airtable/synthese";
import { listerVentes, type Vente } from "@/lib/airtable/vente";
import { dateFr, euros, estNul, nombre, pourcentage } from "@/lib/format";
import { AucuneCampagne, campagneAffichee } from "../_ecran/campagne";
import { Chargement } from "../_ecran/Chargement";
import { couleurCulture, nomCulture, parOrdre } from "../_ecran/cultures";
import { Menu } from "../_ecran/Menu";
import { BoutonAjouter, Tuile } from "../_ecran/Tuile";

export default function PageVentes(props: PageProps<"/ventes">) {
  return (
    <Suspense fallback={<Chargement texte="Chargement des ventes…" />}>
      <Contenu searchParams={props.searchParams} />
    </Suspense>
  );
}

const A_VERIFIER = "à vérifier";

function tonnes(v: number | null | undefined): string {
  return v == null ? "—" : `${nombre(v, 1)} t`;
}

function eurosOuTiret(v: number | null | undefined): string {
  return estNul(v, 0) ? "—" : euros(v, 0);
}

function droiteTuile(s: Synthese): string {
  if (s.alerte) return s.alerte;
  return s.partVendue == null ? "—" : `${pourcentage(s.partVendue)} vendu`;
}

function sousTitre(s: Synthese): string {
  if (s.nombreDeVente === 0) return "Aucune vente enregistrée";
  return `${tonnes(s.venteEnT)} · ${eurosOuTiret(s.valeurContratsEuros)}`;
}

/** Plus ancienne d'abord ; même jour : ordre de création (Numéro automatique). */
function parDate(a: Vente, b: Vente): number {
  return (
    a.date.localeCompare(b.date) ||
    (a.numeroAutomatique ?? Infinity) - (b.numeroAutomatique ?? Infinity) ||
    a.id.localeCompare(b.id)
  );
}

/**
 * CALCUL D'AFFICHAGE AUTORISÉ (docs/schema-api.md, Principe) : cumul progressif des
 * tonnes vendues et part de la récolte (cumul ÷ Livraison en T), ligne par ligne.
 * Jamais stocké ni réutilisé ; le total final affiché reste Synthèse.Vente en T.
 */
function avecCumul(ventes: Vente[], livraisonEnT: number | undefined) {
  let cumul = 0;
  return ventes.map((v) => {
    cumul += v.quantiteEnTonne;
    const part = livraisonEnT != null && livraisonEnT > 0 ? cumul / livraisonEnT : undefined;
    return { vente: v, cumul, part };
  });
}

async function Contenu({ searchParams }: { searchParams: PageProps<"/ventes">["searchParams"] }) {
  await exigerSession();
  const { campagne: demandee, culture: cultureDemandee } = await searchParams;

  const affichee = await campagneAffichee(demandee);
  if (!affichee) return <AucuneCampagne />;
  const { campagne, choix } = affichee;

  const filtre = { campagne: campagne.id };
  const [syntheses, ventes] = await Promise.all([listerSyntheses(filtre), listerVentes(filtre)]);

  // Tuiles : les cultures qui se livrent, et toute culture qui a quand même des ventes.
  const tuiles = syntheses.valides.filter((s) => s.seLivre || s.nombreDeVente > 0).sort(parOrdre);
  const choisie = tuiles.find((s) => s.id === cultureDemandee) ?? tuiles[0];

  // Lignes = ventes liées à la ligne Synthèse choisie (Synthèse.Vente).
  const lignes = choisie
    ? avecCumul(ventes.valides.filter((v) => v.synthese.includes(choisie.id)).sort(parDate), choisie.livraisonEnT)
    : [];

  // Ventes pas encore reliées à la Synthèse : absentes des tuiles et des totaux tant que le lien manque.
  const nonReliees = ventes.valides.filter((v) => v.synthese.length === 0).length;
  const nbProblemes = ventes.aVerifier.length + ventes.signales.length + syntheses.aVerifier.length + nonReliees;

  return (
    <div className="app">
      <Menu actif="ventes" campagnes={choix} campagneChoisie={campagne.id} />
      <main className="wrap">
        <div className="head">
          <h1>Ventes</h1>
          <BoutonAjouter libelle="Nouvelle vente" />
        </div>

        {nbProblemes > 0 && (
          <p className="hint">
            Certaines ventes sont à vérifier dans Airtable.{" "}
            <Link href={`/controle?campagne=${campagne.id}`}>Voir le détail</Link>
          </p>
        )}

        {!choisie ? (
          <p className="empty">Aucune culture à vendre pour cette campagne.</p>
        ) : (
          <div className="split" style={{ gridTemplateColumns: "minmax(260px, 24%) minmax(0, 1fr)" }}>
            <section className="card" aria-labelledby="t-c">
              <h2 id="t-c">Par culture</h2>
              <div className="tiles" role="group" aria-label="Choisir la culture">
                {tuiles.map((s) => (
                  <Tuile
                    key={s.id}
                    href={`/ventes?campagne=${campagne.id}&culture=${s.id}`}
                    on={s.id === choisie.id}
                    couleur={couleurCulture(s)}
                    nom={nomCulture(s)}
                    droite={droiteTuile(s)}
                    sousTitre={sousTitre(s)}
                    barre={s.alerte ? 0 : (s.partVendue ?? 0)}
                  />
                ))}
              </div>
            </section>

            <section className="card" style={{ border: `4px solid ${couleurCulture(choisie)}` }} aria-labelledby="t-v">
              <div className="cardhead">
                <h2 id="t-v">
                  <span className="sw" style={{ background: couleurCulture(choisie) }} />
                  Ventes de {nomCulture(choisie)}
                </h2>
                <span style={{ fontSize: 19, fontWeight: 700 }}>
                  Prix moyen :{" "}
                  {choisie.prixMoyenDeVenteEnEurosT == null ? "—" : `${euros(choisie.prixMoyenDeVenteEnEurosT, 0)}/t`}
                </span>
              </div>
              <div className="box">
                {lignes.length === 0 ? (
                  <p className="empty">Aucune vente enregistrée pour cette culture.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Quantité</th>
                        <th scope="col">Prix</th>
                        <th scope="col">Montant</th>
                        <th scope="col">Total vendu</th>
                        <th scope="col" style={{ textAlign: "left" }}>
                          Part de la récolte vendue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lignes.map(({ vente: v, cumul, part }) => (
                        <tr key={v.id}>
                          <td className="name">{dateFr(v.date)}</td>
                          <td>{tonnes(v.quantiteEnTonne)}</td>
                          <td>{euros(v.prixParTonne, 0)}/t</td>
                          <td style={{ fontWeight: 700 }}>{eurosOuTiret(v.valeur)}</td>
                          <td>{tonnes(cumul)}</td>
                          <td style={{ textAlign: "left", width: 170 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span className="mbar" style={{ flex: 1, height: 16, margin: 0 }}>
                                <i
                                  style={{
                                    width: `${Math.min(1, part ?? 0) * 100}%`,
                                    background: couleurCulture(choisie),
                                  }}
                                />
                              </span>
                              <b style={{ width: 56 }}>{pourcentage(part)}</b>
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr className="total">
                        <td>
                          Total
                          {choisie.alerte && <span className="flag">{A_VERIFIER}</span>}
                        </td>
                        <td>{tonnes(choisie.venteEnT)}</td>
                        <td></td>
                        <td>{eurosOuTiret(choisie.valeurContratsEuros)}</td>
                        <td></td>
                        <td></td>
                      </tr>
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
