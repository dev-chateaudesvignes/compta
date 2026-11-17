import { seDeconnecter } from "@/lib/auth/actions";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-semibold">Gestion ferme</h1>
      <p className="mt-4 text-xl">L&apos;application est en cours de préparation.</p>
      <form action={seDeconnecter} className="mt-12">
        <button type="submit" className="rounded-lg border-2 border-zinc-400 px-6 py-3 text-xl">
          Se déconnecter
        </button>
      </form>
    </main>
  );
}
