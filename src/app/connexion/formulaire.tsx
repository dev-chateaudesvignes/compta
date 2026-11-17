"use client";

import { useActionState } from "react";
import { seConnecter, type EtatConnexion } from "@/lib/auth/actions";

export function FormulaireConnexion() {
  const [etat, action, enCours] = useActionState<EtatConnexion, FormData>(seConnecter, {});

  return (
    <form action={action} className="mt-10 flex w-full max-w-md flex-col gap-6">
      <label htmlFor="motDePasse" className="text-2xl">
        Mot de passe
      </label>
      <input
        id="motDePasse"
        name="motDePasse"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        className="rounded-lg border-2 border-zinc-400 p-4 text-2xl"
      />
      {etat.erreur && (
        <p role="alert" className="text-xl font-medium text-red-700">
          {etat.erreur}
        </p>
      )}
      <button
        type="submit"
        disabled={enCours}
        className="rounded-lg bg-green-700 p-5 text-2xl font-semibold text-white disabled:opacity-60"
      >
        {enCours ? "Vérification…" : "Entrer"}
      </button>
    </form>
  );
}
