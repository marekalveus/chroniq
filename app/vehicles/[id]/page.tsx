import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: vehicle } = await supabaseAdmin
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  const { data: sessions } = await supabaseAdmin
    .from("work_sessions")
    .select("*, profiles(full_name), objects(name)")
    .eq("vehicle_id", id)
    .order("start_time", { ascending: false })
    .limit(100);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const todaySessions =
    sessions?.filter((s) => new Date(s.start_time) >= todayStart) ?? [];

  const monthSessions =
    sessions?.filter((s) => new Date(s.start_time) >= monthStart) ?? [];

  function sumOdo(list: any[]) {
    return list.reduce((sum, s) => sum + Number(s.driven_km ?? 0), 0);
  }

  function sumGps(list: any[]) {
    return list.reduce((sum, s) => sum + Number(s.gps_distance_km ?? 0), 0);
  }

  const todayOdoKm = sumOdo(todaySessions);
  const todayGpsKm = sumGps(todaySessions);
  const todayDiffKm = todayOdoKm - todayGpsKm;

  const monthOdoKm = sumOdo(monthSessions);
  const monthGpsKm = sumGps(monthSessions);
  const monthDiffKm = monthOdoKm - monthGpsKm;

  const totalOdoKm = sumOdo(sessions ?? []);
  const totalGpsKm = sumGps(sessions ?? []);
  const diffKm = totalOdoKm - totalGpsKm;

  const lastSession = sessions?.[0];

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/vehicles" className="text-sm text-emerald-400">
        ← Tagasi autode juurde
      </Link>

      <div className="mt-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">🚗 {vehicle?.name}</h1>
          <p className="mt-2 text-white/50">
            {vehicle?.registration_number ?? "-"}
          </p>
        </div>

        <Link
          href={`/vehicles/${id}/edit`}
          className="rounded-xl bg-white/10 px-5 py-3 text-emerald-300 hover:bg-white/20"
        >
          Muuda autot
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Info
          title="Tüüp"
          value={vehicle?.vehicle_type === "private" ? "Eraauto" : "Firmaauto"}
        />
        <Info
          title="Algne odomeeter"
          value={
            vehicle?.initial_odometer_km
              ? `${Number(vehicle.initial_odometer_km).toFixed(1)} km`
              : "-"
          }
        />

        <Info
          title="Algne odomeeter"
          value={
            vehicle?.initial_odometer_km
              ? `${Number(vehicle.initial_odometer_km).toFixed(1)} km`
              : "-"
          }
        />

        <Info
          title="Praegune odomeeter"
          value={
            vehicle?.current_odometer_km
              ? `${Number(vehicle.current_odometer_km).toFixed(1)} km`
              : "-"
          }
        />
        <Info
          title="Viimane kasutaja"
          value={lastSession?.profiles?.full_name ?? "-"}
        />
        <Info
          title="Staatus"
          value={vehicle?.is_active ? "Aktiivne" : "Peatatud"}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-2xl font-semibold">Läbisõidu kokkuvõte</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DistanceBox
            title="Täna"
            odoKm={todayOdoKm}
            gpsKm={todayGpsKm}
            diffKm={todayDiffKm}
          />

          <DistanceBox
            title="See kuu"
            odoKm={monthOdoKm}
            gpsKm={monthGpsKm}
            diffKm={monthDiffKm}
          />

          <DistanceBox
            title="Kokku"
            odoKm={totalOdoKm}
            gpsKm={totalGpsKm}
            diffKm={diffKm}
          />
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-2xl font-semibold">Dokumendid ja kindlustus</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Info title="Omanik / liising" value={vehicle?.owner_name ?? "-"} />
          <Info title="Ülevaatus kuni" value={vehicle?.inspection_valid_until ?? "-"} />
          <Info title="Kindlustusandja" value={vehicle?.insurance_provider ?? "-"} />
          <Info title="Poliisi nr" value={vehicle?.insurance_policy_number ?? "-"} />
          <Info title="Kindlustus kuni" value={vehicle?.insurance_valid_until ?? "-"} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-semibold">Viimased sõidud</h2>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
            <thead className="bg-white/[0.04] text-white/60">
              <tr>
                <th className="px-4 py-3">Aeg</th>
                <th className="px-4 py-3">Kasutaja</th>
                <th className="px-4 py-3">Marsruut / objekt</th>
                <th className="px-4 py-3">Algus odo</th>
                <th className="px-4 py-3">Lõpp odo</th>
                <th className="px-4 py-3">Odo km</th>
                <th className="px-4 py-3">GPS km</th>
                <th className="px-4 py-3">Vahe</th>
                <th className="px-4 py-3">Komp</th>
              </tr>
            </thead>

            <tbody>
              {sessions?.length ? (
                sessions.map((s) => (
                  <tr key={s.id} className="border-t border-white/10">
                    <td className="px-4 py-4 text-white/60">
                      {new Date(s.start_time).toLocaleString("et-EE")}
                    </td>
                    <td className="px-4 py-4">
                      👷 {s.profiles?.full_name ?? "-"}
                    </td>
                    <td className="px-4 py-4">
                      {s.session_type !== "work"
                        ? `🚗 ${s.travel_from ?? "-"} → ${s.travel_to ?? "-"}`
                        : `🏗 ${s.objects?.name ?? "-"}`}
                    </td>
                    <td className="px-4 py-4">
                      {s.start_odometer_km ?? "-"}
                    </td>
                    <td className="px-4 py-4">
                      {s.end_odometer_km ?? "-"}
                    </td>
                    <td className="px-4 py-4">
                      {Number(s.driven_km ?? 0).toFixed(1)}
                    </td>
                    <td className="px-4 py-4">
                      {Number(s.gps_distance_km ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={
                          Math.abs(Number(s.odometer_gps_diff_km ?? 0)) > 10
                            ? "text-red-300"
                            : "text-white/70"
                        }
                      >
                        {Number(s.odometer_gps_diff_km ?? 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {Number(s.km_compensation ?? 0).toFixed(2)} €
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-white/50">
                    Selle autoga pole veel sõite seotud.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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


function DistanceBox({
  title,
  odoKm,
  gpsKm,
  diffKm,
}: {
  title: string;
  odoKm: number;
  gpsKm: number;
  diffKm: number;
}) {
  const diffClass = Math.abs(diffKm) > 10 ? "text-red-300" : "text-emerald-300";

  return (
    <div className="rounded-2xl bg-black/30 p-4">
      <div className="text-sm text-white/50">{title}</div>
      <div className="mt-3 space-y-1 text-sm">
        <div>
          Odomeeter: <span className="font-semibold text-white">{odoKm.toFixed(1)} km</span>
        </div>
        <div>
          Telefoni GPS: <span className="font-semibold text-white">{gpsKm.toFixed(1)} km</span>
        </div>
        <div>
          Vahe: <span className={`font-semibold ${diffClass}`}>{diffKm.toFixed(1)} km</span>
        </div>
      </div>
    </div>
  );
}
