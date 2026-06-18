export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export default async function WorkersPage() {
  const { data: workers } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });

  const { data: sessions } = await supabaseAdmin
    .from("work_sessions")
    .select("*, objects(name)")
    .order("start_time", { ascending: false });

  const activeWorkers = workers?.filter((w) => w.is_active) ?? [];
  const pausedWorkers = workers?.filter((w) => !w.is_active) ?? [];

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-emerald-400">
            ← Tagasi avalehele
          </Link>
          <h1 className="mt-4 text-4xl font-bold">Nimekiri</h1>
          <p className="mt-2 text-white/50">
            Ülevaade töötajatest, objektidest ja aktiivsetest töödest.
          </p>
        </div>

        <Link
          href="/workers/new"
          className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black"
        >
          + Lisa töötaja
        </Link>
      </div>

      <WorkerTable workers={activeWorkers} sessions={sessions ?? []} />

      {pausedWorkers.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold text-white/70">
            Peatatud töötajad
          </h2>
          <WorkerTable workers={pausedWorkers} sessions={sessions ?? []} muted />
        </section>
      )}
    </main>
  );
}

function WorkerTable({
  workers,
  sessions,
  muted = false,
}: {
  workers: any[];
  sessions: any[];
  muted?: boolean;
}) {
  return (
    <div
      className={`overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] ${
        muted ? "opacity-55" : ""
      }`}
    >
      <table className="w-full min-w-[950px] border-collapse text-left text-sm">
        <thead className="bg-white/[0.04] text-white/60">
          <tr>
            <th className="px-4 py-3">Töötaja</th>
            <th className="px-4 py-3">Staatus</th>
            <th className="px-4 py-3">Praegu</th>
            <th className="px-4 py-3">Alustas</th>
            <th className="px-4 py-3">Viimane tegevus</th>
            <th className="px-4 py-3">Tegevus</th>
          </tr>
        </thead>

        <tbody>
          {workers.map((worker) => {
            const activeSession = sessions.find(
              (s) => s.worker_id === worker.id && !s.end_time
            );

            const lastSession = sessions.find(
              (s) => s.worker_id === worker.id && s.end_time
            );

            return (
              <tr key={worker.id} className="border-t border-white/10">
                <td className="px-4 py-4 font-medium">
                  <Link
                    href={`/workers/${worker.id}`}
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    👷 {worker.full_name}
                  </Link>
                </td>

                <td className="px-4 py-4">
                  {activeSession ? (
                    <span className="rounded-lg bg-emerald-500/15 px-3 py-1 text-emerald-300">
                      Tööl
                    </span>
                  ) : worker.is_active ? (
                    <span className="rounded-lg bg-white/10 px-3 py-1 text-white/60">
                      Vaba
                    </span>
                  ) : (
                    <span className="rounded-lg bg-red-500/15 px-3 py-1 text-red-300">
                      Peatatud
                    </span>
                  )}
                </td>

                <td className="px-4 py-4">
                  {activeSession
                    ? activeSession.session_type === "travel"
                      ? `🚗 ${activeSession.travel_from ?? "-"} → ${
                          activeSession.travel_to ?? "-"
                        }`
                      : `👷 ${activeSession.objects?.name ?? "-"}`
                    : "-"}
                </td>

                <td className="px-4 py-4 text-white/60">
                  {activeSession?.start_time
                    ? new Date(activeSession.start_time).toLocaleTimeString(
                        "et-EE",
                        { hour: "2-digit", minute: "2-digit" }
                      )
                    : "-"}
                </td>

                <td className="px-4 py-4 text-white/60">
                  {lastSession
                    ? lastSession.session_type === "travel"
                      ? `🚗 ${lastSession.travel_from ?? "-"} → ${
                          lastSession.travel_to ?? "-"
                        } · ${new Date(lastSession.end_time).toLocaleDateString(
                          "et-EE"
                        )}`
                      : `👷 ${lastSession.objects?.name ?? "-"} · ${new Date(
                          lastSession.end_time
                        ).toLocaleDateString("et-EE")}`
                    : "-"}
                </td>

                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/workers/${worker.id}`}
                      className="rounded-lg bg-emerald-500 px-3 py-2 font-semibold text-black"
                    >
                      Vaata
                    </Link>

                    <Link
                      href={`/workers/${worker.id}/edit`}
                      className="rounded-lg bg-white/10 px-3 py-2 text-emerald-300 hover:bg-white/20"
                    >
                      Muuda
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
