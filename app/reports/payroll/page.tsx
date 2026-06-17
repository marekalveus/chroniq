import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

function hoursOf(session: any) {
  if (session.total_hours != null) return Number(session.total_hours);
  if (!session.start_time || !session.end_time) return 0;

  const start = new Date(session.start_time).getTime();
  const end = new Date(session.end_time).getTime();

  return Math.max(0, (end - start) / 1000 / 60 / 60);
}

export default async function PayrollReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;

  const now = new Date();
  const selectedMonth =
    params.month ??
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [year, monthNumber] = selectedMonth.split("-").map(Number);

  const start = new Date(year, monthNumber - 1, 1);
  const end = new Date(year, monthNumber, 1);

  const monthLabel = start.toLocaleDateString("et-EE", {
    month: "long",
    year: "numeric",
  });

  const { data: workers } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  const { data: sessions } = await supabaseAdmin
    .from("work_sessions")
    .select("*, objects(name, object_type)")
    .not("end_time", "is", null)
    .gte("start_time", start.toISOString())
    .lt("start_time", end.toISOString());

  const rows =
    workers?.map((worker) => {
      const workerSessions =
        sessions?.filter((s) => s.worker_id === worker.id) ?? [];

      let regularHours = 0;
      let regularAmount = 0;

      let regularNightHours = 0;
      let regularNightAmount = 0;

      let shipHours = 0;
      let shipAmount = 0;

      let shipNightHours = 0;
      let shipNightAmount = 0;

      let drivenKm = 0;
      let kmCompensation = 0;

      for (const session of workerSessions) {
        const h = hoursOf(session);
        const rate = Number(session.hourly_rate_snapshot ?? 0);
        const amount = h * rate;

        const isShip =
          session.base_pay_type === "ship" ||
          session.objects?.object_type === "ship";

        const isNight = session.pay_type === "night" || session.is_night_work;

        if (isShip && isNight) {
          shipNightHours += h;
          shipNightAmount += amount;
        } else if (isShip) {
          shipHours += h;
          shipAmount += amount;
        } else if (isNight) {
          regularNightHours += h;
          regularNightAmount += amount;
        } else {
          regularHours += h;
          regularAmount += amount;
        }

        drivenKm += Number(session.driven_km ?? 0);
        kmCompensation += Number(session.km_compensation ?? 0);
      }

      const totalHours =
        regularHours + regularNightHours + shipHours + shipNightHours;

      const salaryTotal =
        regularAmount + regularNightAmount + shipAmount + shipNightAmount;

      const payableTotal = salaryTotal + kmCompensation;

      return {
        id: worker.id,
        name: worker.full_name,
        regularRate: Number(worker.regular_rate ?? 0),
        shipRate: Number(worker.ship_rate ?? 0),
        regularHours,
        regularAmount,
        regularNightHours,
        regularNightAmount,
        shipHours,
        shipAmount,
        shipNightHours,
        shipNightAmount,
        drivenKm,
        kmCompensation,
        totalHours,
        salaryTotal,
        payableTotal,
      };
    }) ?? [];

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/" className="text-sm text-emerald-400">
        ← Tagasi avalehele
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Palgaarvestuse koond</h1>
          <p className="mt-2 text-white/50">Periood: {monthLabel}</p>

          <form className="mt-4 flex gap-3" action="/reports/payroll">
            <input
              type="month"
              name="month"
              defaultValue={selectedMonth}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
            />

            <button className="rounded-xl bg-white/10 px-5 py-3 text-emerald-300 hover:bg-white/20">
              Näita
            </button>
          </form>
        </div>

        <a
          href={`/reports/payroll/export?month=${selectedMonth}`}
          className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black"
        >
          Ekspordi Excelisse
        </a>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full min-w-[1800px] border-collapse text-left text-sm">
          <thead className="bg-white/[0.04] text-white/60">
            <tr>
              <th className="px-4 py-3">Töötaja</th>

              <th className="px-4 py-3">Tava hind</th>
              <th className="px-4 py-3">Tava h</th>
              <th className="px-4 py-3">Tava kokku</th>

              <th className="px-4 py-3">Tava öö hind</th>
              <th className="px-4 py-3">Tava öö h</th>
              <th className="px-4 py-3">Tava öö kokku</th>

              <th className="px-4 py-3">Laeva hind</th>
              <th className="px-4 py-3">Laev h</th>
              <th className="px-4 py-3">Laev kokku</th>

              <th className="px-4 py-3">Laev öö hind</th>
              <th className="px-4 py-3">Laev öö h</th>
              <th className="px-4 py-3">Laev öö kokku</th>

              <th className="px-4 py-3">Kokku h</th>
              <th className="px-4 py-3">Palk kokku</th>

              <th className="px-4 py-3">Km</th>
              <th className="px-4 py-3">Auto komp</th>

              <th className="px-4 py-3">Maksta kokku</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-white/10">
                <td className="px-4 py-4 font-medium">
                  <Link
                    href={`/workers/${row.id}`}
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    👷 {row.name}
                  </Link>
                </td>

                <td className="px-4 py-4">{row.regularRate.toFixed(2)} €</td>
                <td className="px-4 py-4">{row.regularHours.toFixed(2)}</td>
                <td className="px-4 py-4">{row.regularAmount.toFixed(2)} €</td>

                <td className="px-4 py-4">{(row.regularRate * 2).toFixed(2)} €</td>
                <td className="px-4 py-4">
                  {row.regularNightHours.toFixed(2)}
                </td>
                <td className="px-4 py-4">
                  {row.regularNightAmount.toFixed(2)} €
                </td>

                <td className="px-4 py-4">{row.shipRate.toFixed(2)} €</td>
                <td className="px-4 py-4">{row.shipHours.toFixed(2)}</td>
                <td className="px-4 py-4">{row.shipAmount.toFixed(2)} €</td>

                <td className="px-4 py-4">{(row.shipRate * 2).toFixed(2)} €</td>
                <td className="px-4 py-4">{row.shipNightHours.toFixed(2)}</td>
                <td className="px-4 py-4">
                  {row.shipNightAmount.toFixed(2)} €
                </td>

                <td className="px-4 py-4 font-semibold">
                  {row.totalHours.toFixed(2)}
                </td>
                <td className="px-4 py-4 font-bold text-emerald-300">
                  {row.salaryTotal.toFixed(2)} €
                </td>

                <td className="px-4 py-4">{row.drivenKm.toFixed(1)} km</td>
                <td className="px-4 py-4">
                  {row.kmCompensation.toFixed(2)} €
                </td>

                <td className="px-4 py-4 font-bold text-emerald-300">
                  {row.payableTotal.toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
