import type { Metadata } from "next";
import { FormulaireConnexion } from "./formulaire";

export const metadata: Metadata = { title: "Connexion — Gestion ferme" };

export default function PageConnexion() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-semibold">Gestion ferme</h1>
      <FormulaireConnexion />
    </main>
  );
}
