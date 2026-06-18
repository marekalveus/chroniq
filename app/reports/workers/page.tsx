export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export default async function WorkerReportPage() {
  const { data: sessions } = await supabaseAdmin
    .from("work_sessions")
    .select("*, profiles(full_name)")
    .not("end_time", "is", null);

  const rows = new Map();

  sessions?.forEach((s) => {
    const workerName = s.profiles?.full_name ?? "Tundmatu";
    const key = s.worker_id;

    if (!rows.has(key)) {
      rows.set(key, {
        workerName,
        cat1Hours: 0,
        cat2Hours: 0,
        cat3Hours: 0,
        totalHours: 0,
        totalAmount: 0,
      });
    }

    const row = rows.get(key);
    const hours = Number(s.total_hours ?? 0);
    const amount = Number(s.total_amount ?? 0);

    if (s.object_category_snapshot === "category_1") row.cat1Hours += hours;
    if (s.object_category_snapshot === "category_2") row.cat2Hours += hours;
    if (s.object_category_snapshot === "category_3") row.cat3Hours += hours;

    row.totalHours += hours;
    row.totalAmount += amount;
  });

  const reportRows = Array.from(rows.values());

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/" className="text-sm text-emerald-400">
        ← Tagasi avalehele
      </Link>

      <h1 className="mt-4 text-4xl font-bold">Töötaja arvestus</h1>
      <p className="mt-2 text-white/50">
        Tunnid ja summad töötajate ning kategooriate kaupa.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-white/[0.04] text-white/60">
            <tr>
              <th className="px-4 py-3">Töötaja</th>
              <th className="px-4 py-3">Kat 1 tunnid</th>
              <th className="px-4 py-3">Kat 2 tunnid</th>
              <th className="px-4 py-3">Kat 3 tunnid</th>
              <th className="px-4 py-3">Tunnid kokku</th>
              <th className="px-4 py-3">Summa kokku</th>
            </tr>
          </thead>

          <tbody>
            {reportRows.map((row) => (
              <tr key={row.workerName} className="border-t border-white/10">
                <td className="px-4 py-4 font-medium">👷 {row.workerName}</td>
                <td className="px-4 py-4">{row.cat1Hours.toFixed(2)} h</td>
                <td className="px-4 py-4">{row.cat2Hours.toFixed(2)} h</td>
                <td className="px-4 py-4">{row.cat3Hours.toFixed(2)} h</td>
                <td className="px-4 py-4 font-semibold">{row.totalHours.toFixed(2)} h</td>
                <td className="px-4 py-4 text-emerald-300 font-semibold">
                  {row.totalAmount.toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
