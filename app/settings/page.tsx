import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/" className="text-sm text-emerald-400">← Tagasi avalehele</Link>
      <h1 className="mt-4 text-4xl font-bold">Seaded</h1>
      <p className="mt-4 text-white/50">Siia tulevad kategooriad, hinnad ja süsteemi seaded.</p>
    </main>
  );
}
