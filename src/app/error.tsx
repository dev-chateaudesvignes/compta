"use client";

// Écran affiché si une page plante (le plus souvent : Airtable injoignable).
// L'erreur est déjà enregistrée côté serveur (logError dans src/lib/airtable/client.ts).
export default function Erreur({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="app">
      <main className="wrap" style={{ justifyContent: "center", alignItems: "center", gap: 24 }}>
        <h1>Les données ne sont pas disponibles pour le moment.</h1>
        <p>Réessayez dans quelques minutes. Si cela continue, prévenez Guillaume.</p>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            font: "inherit",
            fontSize: 22,
            fontWeight: 700,
            minHeight: 56,
            padding: "4px 28px",
            borderRadius: 14,
            border: 0,
            background: "#15803D",
            color: "#FFFFFF",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </main>
    </div>
  );
}
