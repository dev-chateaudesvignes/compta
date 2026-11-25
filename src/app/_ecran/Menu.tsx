import Link from "next/link";
import type { ReactNode } from "react";
import { ChoixCampagne } from "./ChoixCampagne";

// Menu principal des écrans de consultation (maquettes docs/mockups/*.dc.html).
// Les écrans pas encore construits sont visibles mais pas cliquables (écart à la
// maquette, en attendant leur intégration) : on retire `href: null` au fur et à mesure.

type Entree = { cle: string; libelle: string; href: string | null; icone: ReactNode };

const ICONE = {
  width: 28,
  height: 28,
  viewBox: "0 0 28 28",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const ENTREES: Entree[] = [
  {
    cle: "synthese",
    libelle: "Synthèse",
    href: "/",
    icone: (
      <svg {...ICONE}>
        <path d="M4 11.5 14 4l10 7.5" />
        <path d="M6.5 10v13h15V10" />
        <path d="M11.5 23v-6.5h5V23" />
      </svg>
    ),
  },
  {
    cle: "livraisons",
    libelle: "Livraisons",
    href: null,
    icone: (
      <svg {...ICONE}>
        <path d="M2.5 8.5h18v8h-18z" />
        <path d="M4.5 8.5c2-3.8 12-3.8 14 0" />
        <circle cx="7.5" cy="20" r="2.4" />
        <circle cx="14.5" cy="20" r="2.4" />
        <path d="M20.5 14h5" />
      </svg>
    ),
  },
  {
    cle: "ventes",
    libelle: "Ventes",
    href: null,
    icone: (
      <svg {...ICONE}>
        <circle cx="11" cy="15" r="7.5" />
        <path d="M14 12a3.5 3.5 0 1 0 0 6M7.5 14h5M7.5 16.5h5" />
        <path d="M20 7.5 24.5 3M20.5 3h4v4" />
      </svg>
    ),
  },
  {
    cle: "achats",
    libelle: "Achats",
    href: null,
    icone: (
      <svg {...ICONE}>
        <path d="M3 4.5h3l2.6 12.5h12.4l2.4-9H7.5" />
        <circle cx="10.5" cy="21.5" r="1.8" />
        <circle cx="19" cy="21.5" r="1.8" />
      </svg>
    ),
  },
  {
    cle: "travaux",
    libelle: "Travaux",
    href: null,
    icone: (
      <svg {...ICONE}>
        <path d="M10 2.8h8" />
        <path d="M14 2.8v10" />
        <path d="M8.5 12.8h11v5.4a5.5 5.5 0 0 1-11 0z" />
      </svg>
    ),
  },
  {
    cle: "admin",
    libelle: "Admin",
    href: null,
    icone: (
      <svg {...ICONE}>
        <circle cx="14" cy="14" r="3.6" />
        <path d="M14 2.8l1.9 2.6 3.1-.9.6 3.2 3.1 1-1 3.1 2.5 2.1-2.5 2.1 1 3.1-3.1 1-.6 3.2-3.1-.9L14 25.2l-1.9-2.6-3.1.9-.6-3.2-3.1-1 1-3.1L3.8 14l2.5-2.1-1-3.1 3.1-1 .6-3.2 3.1.9z" />
      </svg>
    ),
  },
];

export function Menu({
  actif,
  campagnes,
  campagneChoisie,
}: {
  actif: string;
  campagnes: { id: string; libelle: string }[];
  campagneChoisie: string;
}) {
  return (
    <nav className="nav" aria-label="Menu principal">
      {ENTREES.map((e) =>
        e.href === null ? (
          <span key={e.cle} className="navlink off" aria-disabled="true" title="Bientôt disponible">
            {e.icone}
            <span>{e.libelle}</span>
          </span>
        ) : (
          <Link
            key={e.cle}
            href={e.href}
            className={`navlink${e.cle === actif ? " on" : ""}`}
            aria-current={e.cle === actif ? "page" : undefined}
          >
            {e.icone}
            <span>{e.libelle}</span>
          </Link>
        ),
      )}
      <ChoixCampagne campagnes={campagnes} choisie={campagneChoisie} />
    </nav>
  );
}
