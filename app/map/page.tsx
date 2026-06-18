export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import LiveMapClient from "@/components/LiveMapClient";

export default async function MapPage() {
  const { data: sessions } = await supabaseAdmin
    .from("work_sessions")
    .select(`
      id,
      start_latitude,
      start_longitude,
      start_time,
      session_type,
      travel_from,
      travel_to,
      profiles(full_name),
      objects(name, latitude, longitude),
      vehicles(name, registration_number)
    `)
    .is("end_time", null)
    .order("start_time", { ascending: false });

  const activeSessions = sessions ?? [];

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/" className="text-sm text-emerald-400">
        ← Tagasi avalehele
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-4xl font-bold">Kaart</h1>
        <p className="mt-2 text-white/50">
          Praegu töös olevad inimesed, objektid ja autoga seotud tegevused.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="text-sm text-white/50">Praegu aktiivseid tegevusi</div>
        <div className="mt-1 text-4xl font-bold text-emerald-300">
          {activeSessions.length}
        </div>
      </div>

      <LiveMapClient sessions={activeSessions as any} />

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-2xl font-semibold">Praegu tööl</h2>

        <div className="space-y-3">
          {activeSessions.length === 0 ? (
            <div className="text-white/50">Hetkel aktiivseid tegevusi ei ole.</div>
          ) : (
            activeSessions.map((s: any) => (
              <Link
                key={s.id}
                href={`/work-sessions/${s.id}`}
                className="block rounded-xl bg-black/30 p-4 hover:bg-black/40"
              >
                <div className="font-semibold">
                  👷 {s.profiles?.full_name ?? "-"}
                </div>

                <div className="mt-1 text-sm text-white/50">
                  {s.session_type === "work"
                    ? `🏗 ${s.objects?.name ?? "-"}`
                    : `🚗 ${s.travel_from ?? "-"} → ${s.travel_to ?? "-"}`}
                </div>

                <div className="mt-1 text-sm text-white/40">
                  Auto:{" "}
                  {s.vehicles
                    ? `${s.vehicles.name ?? ""} ${s.vehicles.registration_number ?? ""}`
                    : "-"}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
