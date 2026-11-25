// Mise en forme pour l'affichage (fr-FR). Arrondit au passage les flottants
// des rollups Airtable (15.670000000000002 → 15,67).

const formats = new Map<string, Intl.NumberFormat>();

function format(decimales: number, style?: "currency", signe = false): Intl.NumberFormat {
  const cle = `${decimales}-${style ?? ""}-${signe}`;
  let f = formats.get(cle);
  if (!f) {
    f = new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
      ...(style === "currency" ? { style: "currency", currency: "EUR" } : {}),
      ...(signe ? { signDisplay: "exceptZero" } : {}),
    });
    formats.set(cle, f);
  }
  return f;
}

/** 8204 → « 8 204,00 € » ; vide → « — ». */
export function euros(v: number | null | undefined, decimales = 2): string {
  return v == null ? "—" : format(decimales, "currency").format(v);
}

/** Montant signé : 7220 → « +7 220 € », −2497 → « −2 497 € » (vrai signe moins) ; vide → « — ». */
export function eurosSigne(v: number | null | undefined, decimales = 0): string {
  return v == null ? "—" : format(decimales, "currency", true).format(v).replace("-", "−");
}

/** 15.670000000000002 → « 15,67 » ; vide → « — ». */
export function nombre(v: number | null | undefined, decimales = 2): string {
  return v == null ? "—" : format(decimales).format(v);
}

/** Ratio → pourcentage : 0.9999 → « 100 % » ; vide → « — ». */
export function pourcentage(ratio: number | null | undefined, decimales = 0): string {
  return ratio == null ? "—" : format(decimales).format(ratio * 100) + "\u00A0%";
}

/** Vrai si la valeur s'affiche comme zéro (vide, 0 ou reste de flottant type 7e-15). */
export function estNul(v: number | null | undefined, decimales = 2): boolean {
  return v == null || Math.abs(v) < 0.5 * 10 ** -decimales;
}

/** « 2025-06-30 » → « 30/06/2025 ». */
export function dateFr(iso: string | undefined): string {
  if (!iso) return "—";
  const [a, m, j] = iso.split("-");
  return `${j}/${m}/${a}`;
}
