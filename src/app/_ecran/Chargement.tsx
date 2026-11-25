// Écran d'attente pendant qu'une page lit ses données : un moulin dont les ailes tournent,
// aux couleurs des maquettes (vert #1F5130, jaune #FACC15, fond #F6F4EE).
// Écart à la maquette : aucun écran d'attente n'y figure (demande du 25/11).
// Styles dans ecrans.css (.chargement). Animation coupée si l'utilisateur a demandé
// moins d'animations dans son système.

// Une aile, pointée vers le haut depuis le moyeu (60, 44) ; les trois autres sont tournées.
function Aile({ angle }: { angle: number }) {
  return <rect x="57" y="10" width="9" height="32" rx="2" fill="#FACC15" transform={`rotate(${angle} 60 44)`} />;
}

export function Chargement({ texte = "Chargement…" }: { texte?: string }) {
  return (
    <div className="app">
      <main className="wrap chargement" role="status" aria-live="polite">
        <svg className="moulin" viewBox="22 6 76 112" aria-hidden="true">
          <path d="M50 44h20l8 70H42z" fill="#1F5130" />
          <path d="M30 114h60" stroke="#1F5130" strokeWidth="3" strokeLinecap="round" />
          <g className="ailes">
            <Aile angle={0} />
            <Aile angle={90} />
            <Aile angle={180} />
            <Aile angle={270} />
          </g>
          <circle cx="60" cy="44" r="4" fill="#1F5130" />
        </svg>
        <p className="texte">{texte}</p>
      </main>
    </div>
  );
}
