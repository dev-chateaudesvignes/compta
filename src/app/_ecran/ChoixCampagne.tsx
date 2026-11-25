"use client";

import { useRouter } from "next/navigation";

/** Liste « Campagne » du menu : changer de campagne recharge l'écran sur celle-ci. */
export function ChoixCampagne({
  campagnes,
  choisie,
}: {
  campagnes: { id: string; libelle: string }[];
  choisie: string;
}) {
  const router = useRouter();
  return (
    <div className="camp">
      <label htmlFor="campagne">Campagne</label>
      <select id="campagne" value={choisie} onChange={(e) => router.push(`?campagne=${e.target.value}`)}>
        {campagnes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.libelle}
          </option>
        ))}
      </select>
    </div>
  );
}
