// Mise en forme pour l'affichage (fr-FR). Arrondit au passage les flottants
// des rollups Airtable (15.670000000000002 → 15,67).

const formats = new Map<string, Intl.NumberFormat>();

function format(decimales: number, style?: "currency"): Intl.NumberFormat {
  const cle = `${decimales}-${style ?? ""}`;
  let f = formats.get(cle);
  if (!f) {
    f = new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
      ...(style === "currency" ? { style: "currency", currency: "EUR" } : {}),
    });
    formats.set(cle, f);
  }
  return f;
}

/** 8204 → « 8 204,00 € » ; vide → « — ». */
export function euros(v: number | null | undefined, decimales = 2): string {
  return v == null ? "—" : format(decimales, "currency").format(v);
}

/** 15.670000000000002 → « 15,67 » ; vide → « — ». */
export function nombre(v: number | null | undefined, decimales = 2): string {
  return v == null ? "—" : format(decimales).format(v);
}

/** « 2025-06-30 » → « 30/06/2025 ». */
export function dateFr(iso: string | undefined): string {
  if (!iso) return "—";
  const [a, m, j] = iso.split("-");
  return `${j}/${m}/${a}`;
}
