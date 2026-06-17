import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export default async function ObjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: object } = await supabaseAdmin
    .from("objects")
    .select("*")
    .eq("id", id)
    .single();

  const { data: activeSessions } = await supabaseAdmin
    .from("work_sessions")
    .select("*, profiles(full_name)")
    .eq("object_id", id)
    .is("end_time", null)
    .order("start_time", { ascending: true });

  const { data: previousSessions } = await supabaseAdmin
    .from("work_sessions")
    .select("*, profiles(full_name)")
    .eq("object_id", id)
    .not("end_time", "is", null)
    .order("start_time", { ascending: false })
    .limit(20);

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/objects" className="text-sm text-emerald-400">
        ← Tagasi objektide juurde
      </Link>

      <div className="mt-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">🏗 {object?.name}</h1>
          <p className="mt-2 text-white/50">
            {object?.client_name ?? "-"} · {object?.address ?? "-"}
          </p>
        </div>

        <Link
          href={`/objects/${id}/edit`}
          className="rounded-xl bg-white/10 px-5 py-3 text-emerald-300 hover:bg-white/20"
        >
          Muuda objekti
        </Link>
      </div>

      <section className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <div className="mb-4 text-2xl font-bold text-emerald-300">
          🟢 Praegu objektil
        </div>

        {activeSessions && activeSessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeSessions.map((s) => (
              <Link
                key={s.id}
                href={`/work-sessions/${s.id}`}
                className="rounded-xl bg-black/30 p-4 hover:bg-black/40"
              >
                <div className="text-xl font-semibold">
                  👷 {s.profiles?.full_name ?? "-"}
                </div>
                <div className="mt-2 text-sm text-white/50">
                  Alustas{" "}
                  {new Date(s.start_time).toLocaleTimeString("et-EE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="mt-2 text-sm text-white/50">
                  Alguse kaugus: {s.start_distance_m ?? "-"} m
                </div>
                {s.start_outside_radius && (
                  <div className="mt-2 text-sm text-red-300">
                    ⚠ Alustas objektist eemal
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-black/30 p-4 text-white/60">
            Hetkel ei ole sellel objektil kedagi tööl.
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-semibold">Viimased lõpetatud tööd</h2>

        <div className="space-y-3">
          {previousSessions?.map((s) => (
            <Link
              key={s.id}
              href={`/work-sessions/${s.id}`}
              className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-semibold">
                    👷 {s.profiles?.full_name ?? "-"}
                  </div>
                  <div className="mt-1 text-sm text-white/50">
                    {new Date(s.start_time).toLocaleDateString("et-EE")} ·{" "}
                    {new Date(s.start_time).toLocaleTimeString("et-EE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(s.end_time).toLocaleTimeString("et-EE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-emerald-300">
                    {Number(s.total_hours ?? 0).toFixed(2)} h
                  </div>
                  <div className="text-sm text-white/40">Vaata kaarti →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
