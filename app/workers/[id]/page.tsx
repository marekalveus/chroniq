import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import SessionMap from "@/components/SessionMap";

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: worker } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  const { data: activeSession } = await supabaseAdmin
    .from("work_sessions")
    .select("*, objects(name, latitude, longitude)")
    .eq("worker_id", id)
    .is("end_time", null)
    .order("start_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: previousSessions } = await supabaseAdmin
    .from("work_sessions")
    .select("*, objects(name, latitude, longitude)")
    .eq("worker_id", id)
    .not("end_time", "is", null)
    .order("start_time", { ascending: false })
    .limit(30);

  const totalKm =
    previousSessions?.reduce((sum, s) => sum + Number(s.driven_km ?? 0), 0) ?? 0;

  const totalKmComp =
    previousSessions?.reduce(
      (sum, s) => sum + Number(s.km_compensation ?? 0),
      0
    ) ?? 0;

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/workers" className="text-sm text-emerald-400">
        ← Tagasi vaatesse Töös
      </Link>

      <div className="mt-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">👷 {worker?.full_name}</h1>
          <p className="mt-2 text-white/50">{worker?.phone ?? ""}</p>
        </div>

        <Link
          href={`/workers/${id}/edit`}
          className="rounded-xl bg-white/10 px-5 py-3 text-emerald-300 hover:bg-white/20"
        >
          Muuda töötajat
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Info title="Sõidetud km" value={`${totalKm.toFixed(1)} km`} />
        <Info title="Auto komp" value={`${totalKmComp.toFixed(2)} €`} />
        <Info
          title="Sõiduk"
          value={
            worker?.vehicle_type === "private"
              ? `Eraauto · ${worker?.vehicle_reg_number ?? ""}`
              : worker?.vehicle_type === "company"
              ? `Tööauto · ${worker?.vehicle_reg_number ?? ""}`
              : "Autot ei kasuta"
          }
        />
      </div>

      {activeSession ? (
        <section className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="text-2xl font-bold text-emerald-300">🟢 Tööl</div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Info title="Objekt" value={activeSession.objects?.name ?? "-"} />
            <Info
              title="Alustas"
              value={new Date(activeSession.start_time).toLocaleString("et-EE")}
            />
            <Info
              title="Tüüp"
              value={activeSession.session_type === "travel" ? "Sõit" : "Töö"}
            />
          </div>

          {activeSession.session_type === "travel" && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Info
                title="Sõit"
                value={`${activeSession.travel_from ?? "-"} → ${
                  activeSession.travel_to ?? "-"
                }`}
              />
              <Info
                title="Alguse km"
                value={`${activeSession.start_odometer_km ?? "-"} km`}
              />
              <Info
                title="Alguse kaugus"
                value={`${activeSession.start_distance_m ?? "-"} m`}
              />
            </div>
          )}

          <div className="mt-6">
            <SessionMap
              startLat={Number(activeSession.start_latitude)}
              startLng={Number(activeSession.start_longitude)}
              endLat={null}
              endLng={null}
              objectLat={
                activeSession.objects?.latitude
                  ? Number(activeSession.objects.latitude)
                  : null
              }
              objectLng={
                activeSession.objects?.longitude
                  ? Number(activeSession.objects.longitude)
                  : null
              }
              startTime={activeSession.start_time}
              endTime={null}
              objectName={activeSession.objects?.name}
            />
          </div>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-2xl font-bold text-white/70">⚪ Ei tööta hetkel</div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-semibold">Eelmised tööd ja sõidud</h2>

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
                    {s.session_type === "travel" ? "🚗" : "👷"}{" "}
                    {s.session_type === "travel"
                      ? `${s.travel_from ?? "-"} → ${s.travel_to ?? "-"}`
                      : s.objects?.name ?? "-"}
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

                  {s.session_type === "travel" && (
                    <div className="mt-2 text-sm text-white/50">
                      Km: {Number(s.driven_km ?? 0).toFixed(1)} · Komp:{" "}
                      {Number(s.km_compensation ?? 0).toFixed(2)} €
                    </div>
                  )}
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

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/30 p-4">
      <div className="text-sm text-white/50">{title}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
