import Link from "next/link";

// Tuile « Par culture » des écrans Livraisons / Ventes (maquettes) : nom + pastille
// de couleur, chiffre principal à droite, sous-titre, barre de progression.
// La largeur de la barre est un calcul d'affichage autorisé (docs/schema-api.md, Principe).

/** Fond de la tuile choisie : la couleur de la culture, très éclaircie. */
function fondClair(couleur: string): string {
  return `color-mix(in srgb, ${couleur} 15%, #FFFFFF)`;
}

export function Tuile({
  href,
  on,
  couleur,
  nom,
  droite,
  sousTitre,
  barre,
}: {
  href: string;
  on: boolean;
  couleur: string;
  nom: string;
  droite: string;
  sousTitre: string;
  /** Largeur de la barre, de 0 à 1 (bornée). */
  barre: number;
}) {
  const largeur = Math.min(1, Math.max(0, barre)) * 100;
  return (
    <Link
      href={href}
      className={`tile${on ? " on" : ""}`}
      style={on ? { borderColor: couleur, background: fondClair(couleur) } : undefined}
      aria-current={on ? "true" : undefined}
      scroll={false}
    >
      <span className="tt">
        <span className="tl1">
          <b>
            <span className="sw" style={{ background: couleur }} />
            {nom}
          </b>
          <span className="big">{droite}</span>
        </span>
        <span className="tile-sub">{sousTitre}</span>
        <span className="mbar" aria-hidden="true">
          <i style={{ width: `${largeur}%`, background: couleur }} />
        </span>
      </span>
      <span className="go">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}

/** Bouton vert « + … » de la maquette ; grisé tant que le formulaire n'existe pas. */
export function BoutonAjouter({ libelle }: { libelle: string }) {
  return (
    <button type="button" className="add" disabled title="Bientôt disponible">
      <span aria-hidden="true" style={{ fontSize: 30, lineHeight: 1 }}>
        +
      </span>{" "}
      {libelle}
    </button>
  );
}
