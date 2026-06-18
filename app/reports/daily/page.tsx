import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function hoursOf(session: any) {
  if (!session.start_time || !session.end_time) return 0;
  const start = new Date(session.start_time).getTime();
  const end = new Date(session.end_time).getTime();
  return Math.max(0, (end - start) / 1000 / 60 / 60);
}

function formatTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("et-EE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function typeLabel(type: string) {
  if (type === "travel_to") return "Sõit objektile";
  if (type === "travel_from") return "Sõit objektilt";
  return "Töö objektil";
}

export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; worker?: string }>;
}) {
  const params = await searchParams;

  const today = new Date();
  const selectedDate =
    params.date ?? today.toISOString().slice(0, 10);

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

  if (selectedWorker) {
    query = query.eq("worker_id", selectedWorker);
  }

  const { data: sessions } = await query;

  const rows = sessions ?? [];

  const totalHours = rows.reduce((sum, s) => sum + hoursOf(s), 0);
  const totalAmount = rows.reduce(
    (sum, s) => sum + hoursOf(s) * Number(s.hourly_rate_snapshot ?? 0),
    0
  );
  const totalKm = rows.reduce((sum, s) => sum + Number(s.driven_km ?? 0), 0);
  const totalKmComp = rows.reduce(
    (sum, s) => sum + Number(s.km_compensation ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/" className="text-sm text-emerald-400">
        ← Tagasi avalehele
      </Link>

      <h1 className="mt-4 text-4xl font-bold">Päeva tööaja arvestus</h1>
      <p className="mt-2 text-white/50">
        Päeva lõikes töötaja töö, sõidud, tunnid, km ja summa.
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

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Info title="Tunde kokku" value={`${totalHours.toFixed(2)} h`} />
        <Info title="Töötasu" value={`${totalAmount.toFixed(2)} €`} />
        <Info title="Km kokku" value={`${totalKm.toFixed(1)} km`} />
        <Info title="Km komp" value={`${totalKmComp.toFixed(2)} €`} />
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full min-w-[1500px] border-collapse text-left text-sm">
          <thead className="bg-white/[0.04] text-white/60">
            <tr>
              <th className="px-4 py-3">Töötaja</th>
              <th className="px-4 py-3">Tegevus</th>
              <th className="px-4 py-3">Objekt / marsruut</th>
              <th className="px-4 py-3">Algus</th>
              <th className="px-4 py-3">Lõpp</th>
              <th className="px-4 py-3">Tunde</th>
              <th className="px-4 py-3">Tüüp</th>
              <th className="px-4 py-3">Hind</th>
              <th className="px-4 py-3">Summa</th>
              <th className="px-4 py-3">Auto</th>
              <th className="px-4 py-3">Odo km</th>
              <th className="px-4 py-3">GPS km</th>
              <th className="px-4 py-3">Km komp</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-4 py-6 text-white/50">
                  Sellel päeval tööaegu ei ole.
                </td>
              </tr>
            ) : (
              rows.map((s: any) => {
                const h = hoursOf(s);
                const rate = Number(s.hourly_rate_snapshot ?? 0);
                const amount = h * rate;

                return (
                  <tr key={s.id} className="border-t border-white/10">
                    <td className="px-4 py-4 font-medium text-emerald-300">
                      👷 {s.profiles?.full_name ?? "-"}
                    </td>

                    <td className="px-4 py-4">{typeLabel(s.session_type)}</td>

                    <td className="px-4 py-4">
                      {s.session_type === "work"
                        ? `🏗 ${s.objects?.name ?? "-"}`
                        : `🚗 ${s.travel_from ?? "-"} → ${
                            s.travel_to ?? "-"
                          }`}
                    </td>

                    <td className="px-4 py-4">{formatTime(s.start_time)}</td>
                    <td className="px-4 py-4">{formatTime(s.end_time)}</td>

                    <td className="px-4 py-4 font-semibold">
                      {h.toFixed(2)}
                    </td>

                    <td className="px-4 py-4">
                      {s.is_night_work
                        ? "Öö / topelt"
                        : s.base_pay_type === "ship" || s.pay_type === "ship"
                        ? "Laev"
                        : "Tava"}
                    </td>

                    <td className="px-4 py-4">{rate.toFixed(2)} €</td>
                    <td className="px-4 py-4 font-semibold text-emerald-300">
                      {amount.toFixed(2)} €
                    </td>

                    <td className="px-4 py-4">
                      {s.vehicles
                        ? `${s.vehicles.name ?? ""} ${
                            s.vehicles.registration_number ?? ""
                          }`
                        : "-"}
                    </td>

                    <td className="px-4 py-4">
                      {Number(s.driven_km ?? 0).toFixed(1)}
                    </td>

                    <td className="px-4 py-4">
                      {Number(s.gps_distance_km ?? 0).toFixed(2)}
                    </td>

                    <td className="px-4 py-4">
                      {Number(s.km_compensation ?? 0).toFixed(2)} €
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-sm text-white/50">{title}</div>
      <div className="mt-1 text-2xl font-bold text-emerald-300">{value}</div>
    </div>
  );
}
