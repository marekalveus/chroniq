export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export default async function WorkSessionsPage() {
  const { data: sessions } = await supabaseAdmin
    .from("work_sessions")
    .select("*, profiles(full_name), objects(name)")
    .order("start_time", { ascending: false });

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/" className="text-sm text-emerald-400">
        ← Tagasi avalehele
      </Link>

      <h1 className="mt-4 text-4xl font-bold">Tööajad</h1>
      <p className="mt-2 text-white/50">
        Tööaja kirjed, tunnid, summad ja GPS detailid.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-white/60">
            <tr>
              <th className="px-4 py-3">Töötaja</th>
              <th className="px-4 py-3">Objekt</th>
              <th className="px-4 py-3">Algus</th>
              <th className="px-4 py-3">Lõpp</th>
              <th className="px-4 py-3">Tunnid</th>
              <th className="px-4 py-3">Summa</th>
              <th className="px-4 py-3">GPS</th>
            </tr>
          </thead>

          <tbody>
            {sessions?.map((s) => (
              <tr key={s.id} className="border-t border-white/10">
                <td className="px-4 py-4">{s.profiles?.full_name ?? "-"}</td>
                <td className="px-4 py-4">{s.objects?.name ?? "-"}</td>
                <td className="px-4 py-4">
                  {new Date(s.start_time).toLocaleString("et-EE")}
                </td>
                <td className="px-4 py-4">
                  {s.end_time
                    ? new Date(s.end_time).toLocaleString("et-EE")
                    : "avatud"}
                </td>
                <td className="px-4 py-4">{s.total_hours ?? "-"} h</td>
                <td className="px-4 py-4">{s.total_amount ?? "-"} €</td>
                <td className="px-4 py-4">
                  <Link
                    href={`/work-sessions/${s.id}`}
                    className="rounded-lg bg-white/10 px-3 py-2 text-emerald-300 hover:bg-white/20"
                  >
                    Vaata kaarti
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
