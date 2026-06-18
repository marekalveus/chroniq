import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function minutesOf(session: any) {
  if (!session.start_time || !session.end_time) return 0;
  const start = new Date(session.start_time).getTime();
  const end = new Date(session.end_time).getTime();
  return Math.max(0, Math.round((end - start) / 1000 / 60));
}

function formatTime(value: string | null) {
  if (!value) return "käib";
  return new Date(value).toLocaleTimeString("et-EE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number, isActive: boolean) {
  if (isActive) return "käib";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

function typeLabel(type: string) {
  if (type === "travel_to") return "Sõit objektile";
  if (type === "travel_from") return "Sõit objektilt";
  return "Töö objektil";
}

function placeLabel(s: any) {
  if (s.session_type === "work") return s.objects?.name ?? "-";
  return `${s.travel_from ?? "-"} → ${s.travel_to ?? "-"}`;
}

export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; worker?: string }>;
}) {
  const params = await searchParams;

  const today = new Date();
  const selectedDate = params.date ?? today.toISOString().slice(0, 10);

  const start = new Date(`${selectedDate}T00:00:00`);
  const end = new Date(`${selectedDate}T23:59:59`);

  const { data: workers } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  const selectedWorker = params.worker ?? "";

  let query = supabaseAdmin
    .from("work_sessions")
    .select(`
      *,
      profiles(full_name),
      objects(name, object_type),
      vehicles(name, registration_number)
    `)
    .gte("start_time", start.toISOString())
    .lte("start_time", end.toISOString())
    .order("start_time", { ascending: true });

  if (selectedWorker) query = query.eq("worker_id", selectedWorker);

  const { data: sessions } = await query;
  const rows = sessions ?? [];

  const groups = new Map<string, any[]>();

  for (const row of rows) {
    const name = row.profiles?.full_name ?? "Töötaja";
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)?.push(row);
  }

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/" className="text-sm text-emerald-400">
        ← Tagasi avalehele
      </Link>

      <h1 className="mt-4 text-4xl font-bold">Päeva tööaja arvestus</h1>
      <p className="mt-2 text-white/50">
        Selge ülevaade: kes kus oli, mis kellast mis kellani ja kui kaua.
      </p>

      <form className="mt-6 flex flex-wrap gap-3" action="/reports/daily">
        <input
          type="date"
          name="date"
          defaultValue={selectedDate}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
        />

        <select
          name="worker"
          defaultValue={selectedWorker}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
        >
          <option value="">Kõik töötajad</option>
          {workers?.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.full_name}
            </option>
          ))}
        </select>

        <button className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black">
          Näita
        </button>
      </form>

      <div className="mt-8 space-y-8">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/50">
            Sellel päeval tööaegu ei ole.
          </div>
        ) : (
          Array.from(groups.entries()).map(([workerName, items]) => {
            const totalMinutes = items.reduce(
              (sum, s) => sum + minutesOf(s),
              0
            );

            return (
              <section
                key={workerName}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-5 py-4">
                  <div className="text-xl font-bold text-emerald-300">
                    👷 {workerName}
                  </div>
                  <div className="text-sm text-white/60">
                    Kokku:{" "}
                    <span className="font-semibold text-white">
                      {formatDuration(totalMinutes, false)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-white/10">
                  {items.map((s: any) => {
                    const active = !s.end_time;
                    const minutes = minutesOf(s);

                    return (
                      <div
                        key={s.id}
                        className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[150px_170px_1fr_120px]"
                      >
                        <div>
                          <div className="text-xs uppercase tracking-wide text-white/40">
                            Aeg
                          </div>
                          <div className="mt-1 text-lg font-semibold">
                            {formatTime(s.start_time)} – {formatTime(s.end_time)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-wide text-white/40">
                            Tegevus
                          </div>
                          <div className="mt-1">
                            {s.session_type === "work" ? "🏗 " : "🚗 "}
                            {typeLabel(s.session_type)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-wide text-white/40">
                            Koht / marsruut
                          </div>
                          <div className="mt-1 text-lg">{placeLabel(s)}</div>
                          {s.vehicles && (
                            <div className="mt-1 text-sm text-white/50">
                              Auto: {s.vehicles.name}{" "}
                              {s.vehicles.registration_number ?? ""}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-wide text-white/40">
                            Kestus
                          </div>
                          <div
                            className={
                              active
                                ? "mt-1 font-bold text-emerald-300"
                                : "mt-1 text-lg font-bold"
                            }
                          >
                            {formatDuration(minutes, active)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}
