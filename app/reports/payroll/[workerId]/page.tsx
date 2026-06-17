import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export default async function WorkerPayrollDetailPage({
  params,
}: {
  params: Promise<{ workerId: string }>;
}) {
  const { workerId } = await params;

  const { data: worker } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", workerId)
    .single();

  const { data: sessions } = await supabaseAdmin
    .from("work_sessions")
    .select("*, objects(name)")
    .eq("worker_id", workerId)
    .not("end_time", "is", null)
    .order("start_time", { ascending: true });

  const days = new Map<
    string,
    {
      objects: Map<
        string,
        {
          objectName: string;
          hours: number;
          amount: number;
          sessionIds: string[];
        }
      >;
      dayHours: number;
      dayAmount: number;
    }
  >();

  const objectTotals = new Map<
    string,
    {
      objectName: string;
      hours: number;
      amount: number;
    }
  >();

  sessions?.forEach((s) => {
    const date = new Date(s.start_time).toLocaleDateString("et-EE");
    const objectId = s.object_id;
    const objectName = s.objects?.name ?? "Tundmatu objekt";
    const hours = Number(s.total_hours ?? 0);
    const amount = Number(s.total_amount ?? 0);

    if (!days.has(date)) {
      days.set(date, {
        objects: new Map(),
        dayHours: 0,
        dayAmount: 0,
      });
    }

    const day = days.get(date)!;

    if (!day.objects.has(objectId)) {
      day.objects.set(objectId, {
        objectName,
        hours: 0,
        amount: 0,
        sessionIds: [],
      });
    }

    const objectRow = day.objects.get(objectId)!;
    objectRow.hours += hours;
    objectRow.amount += amount;
    objectRow.sessionIds.push(s.id);

    day.dayHours += hours;
    day.dayAmount += amount;

    if (!objectTotals.has(objectId)) {
      objectTotals.set(objectId, {
        objectName,
        hours: 0,
        amount: 0,
      });
    }

    const objectTotal = objectTotals.get(objectId)!;
    objectTotal.hours += hours;
    objectTotal.amount += amount;
  });

  const monthHours = Array.from(days.values()).reduce(
    (sum, day) => sum + day.dayHours,
    0
  );

  const monthAmount = Array.from(days.values()).reduce(
    (sum, day) => sum + day.dayAmount,
    0
  );

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/reports/payroll" className="text-sm text-emerald-400">
        ← Tagasi töötajate juurde
      </Link>

      <h1 className="mt-4 text-4xl font-bold">
        👷 {worker?.full_name ?? "Töötaja"}
      </h1>

      <p className="mt-2 text-white/50">
        Päevade kaupa: kuupäev, objekt ja tunnid.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Info title="Tunnid kokku" value={`${monthHours.toFixed(2)} h`} />
        <Info title="Summa kokku" value={`${monthAmount.toFixed(2)} €`} />
      </div>

      <div className="mt-8 space-y-6">
        {Array.from(days.entries()).map(([date, day]) => (
          <section
            key={date}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-semibold">{date}</h2>
              <div className="text-right text-sm text-white/60">
                <div>{day.dayHours.toFixed(2)} h</div>
                <div>{day.dayAmount.toFixed(2)} €</div>
              </div>
            </div>

            <div className="space-y-3">
              {Array.from(day.objects.values()).map((objectRow) => (
                <div
                  key={objectRow.objectName}
                  className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3"
                >
                  <div>
                    <div className="text-lg font-medium">
                      {objectRow.objectName}
                    </div>
                    <div className="text-sm text-white/40">
                      {objectRow.sessionIds.length} tööseanss
                      {objectRow.sessionIds.length === 1 ? "" : "i"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-semibold text-emerald-300">
                      {objectRow.hours.toFixed(2)} h
                    </div>
                    <div className="text-sm text-white/40">
                      {objectRow.amount.toFixed(2)} €
                    </div>
                    <Link
                      href={`/work-sessions/${objectRow.sessionIds[0]}`}
                      className="mt-1 inline-block text-sm text-emerald-400 hover:text-emerald-300"
                    >
                      🗺 kaart
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-semibold">
              <span>Päev kokku</span>
              <span>{day.dayHours.toFixed(2)} h</span>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-4 text-2xl font-semibold">Objektide kokkuvõte</h2>

        <div className="space-y-3">
          {Array.from(objectTotals.values()).map((object) => (
            <div
              key={object.objectName}
              className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3"
            >
              <div className="text-lg font-medium">{object.objectName}</div>
              <div className="text-right">
                <div className="text-xl font-semibold text-emerald-300">
                  {object.hours.toFixed(2)} h
                </div>
                <div className="text-sm text-white/40">
                  {object.amount.toFixed(2)} €
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-sm text-white/50">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
