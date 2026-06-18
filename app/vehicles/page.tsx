export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

async function toggleVehicle(id: string, isActive: boolean) {
  "use server";

  const { error } = await supabaseAdmin
    .from("vehicles")
    .update({ is_active: !isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);

  redirect("/vehicles");
}

export default async function VehiclesPage() {
  const { data: vehicles } = await supabaseAdmin
    .from("vehicles")
    .select("*")
    .order("name", { ascending: true });

  const activeVehicles = vehicles?.filter((v) => v.is_active) ?? [];
  const pausedVehicles = vehicles?.filter((v) => !v.is_active) ?? [];

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-emerald-400">
            ← Tagasi avalehele
          </Link>
          <h1 className="mt-4 text-4xl font-bold">Autod</h1>
          <p className="mt-2 text-white/50">
            Firmaautod, eraautod ja läbisõidud.
          </p>
        </div>

        <Link
          href="/vehicles/new"
          className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black"
        >
          + Lisa auto
        </Link>
      </div>

      <VehicleTable vehicles={activeVehicles} />

      {pausedVehicles.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold text-white/70">
            Peatatud autod
          </h2>
          <VehicleTable vehicles={pausedVehicles} muted />
        </section>
      )}
    </main>
  );
}

function VehicleTable({ vehicles, muted = false }: { vehicles: any[]; muted?: boolean }) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] ${muted ? "opacity-55" : ""}`}>
      <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
        <thead className="bg-white/[0.04] text-white/60">
          <tr>
            <th className="px-4 py-3">Auto</th>
            <th className="px-4 py-3">Reg.nr</th>
            <th className="px-4 py-3">Tüüp</th>
            <th className="px-4 py-3">Praegune juht</th>
            <th className="px-4 py-3">Läbisõit</th>
            <th className="px-4 py-3">Ülevaatus</th>
            <th className="px-4 py-3">Kindlustus</th>
            <th className="px-4 py-3">Staatus</th>
            <th className="px-4 py-3">Tegevus</th>
          </tr>
        </thead>

        <tbody>
          {vehicles.map((vehicle) => {
            const toggle = toggleVehicle.bind(null, vehicle.id, vehicle.is_active);

            return (
              <tr key={vehicle.id} className="border-t border-white/10">
                <td className="px-4 py-4 font-medium">
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    🚗 {vehicle.name}
                  </Link>
                </td>

                <td className="px-4 py-4">
                  {vehicle.registration_number ?? "-"}
                </td>

                <td className="px-4 py-4">
                  {vehicle.vehicle_type === "private" ? "Eraauto" : "Firmaauto"}
                </td>

                <td className="px-4 py-4 text-white/60">
                  {vehicle.assigned_to ? "Määratud" : "-"}
                </td>

                <td className="px-4 py-4 text-white/60">
                  {vehicle.current_odometer_km
                    ? `${Number(vehicle.current_odometer_km).toFixed(1)} km`
                    : "-"}
                </td>

                <td className="px-4 py-4">
                  <TrafficLight value={vehicle.inspection_valid_until} type="month" />
                </td>

                <td className="px-4 py-4">
                  <TrafficLight value={vehicle.insurance_valid_until} type="date" />
                </td>

                <td className="px-4 py-4">
                  {vehicle.is_active ? (
                    <span className="rounded-lg bg-emerald-500/15 px-3 py-1 text-emerald-300">
                      Aktiivne
                    </span>
                  ) : (
                    <span className="rounded-lg bg-red-500/15 px-3 py-1 text-red-300">
                      Peatatud
                    </span>
                  )}
                </td>

                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/vehicles/${vehicle.id}/edit`}
                      className="rounded-lg bg-white/10 px-3 py-2 text-emerald-300 hover:bg-white/20"
                    >
                      Muuda
                    </Link>

                    <form action={toggle}>
                      <button
                        className={`rounded-lg px-3 py-2 ${
                          vehicle.is_active
                            ? "bg-red-500/15 text-red-300 hover:bg-red-500/25"
                            : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                        }`}
                      >
                        {vehicle.is_active ? "Peata" : "Taasta"}
                      </button>
                    </form>
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


function TrafficLight({
  value,
  type,
}: {
  value?: string | null;
  type: "month" | "date";
}) {
  if (!value) {
    return <span className="text-white/40">-</span>;
  }

  const now = new Date();
  let endDate: Date;

  if (type === "month") {
    const [year, month] = value.split("-").map(Number);
    endDate = new Date(year, month, 0, 23, 59, 59);
  } else {
    endDate = new Date(value);
    endDate.setHours(23, 59, 59, 999);
  }

  const diffDays = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  let color = "bg-emerald-500/15 text-emerald-300";
  let icon = "🟢";

  if (diffDays < 0) {
    color = "bg-red-500/15 text-red-300";
    icon = "🔴";
  } else if (diffDays <= 14) {
    color = "bg-yellow-500/15 text-yellow-300";
    icon = "🟡";
  }

  return (
    <span className={`rounded-lg px-3 py-1 ${color}`}>
      {icon} {formatValue(value, type)}
    </span>
  );
}

function formatValue(value: string, type: "month" | "date") {
  if (type === "month") {
    const [year, month] = value.split("-");
    return `${month}.${year}`;
  }

  return new Date(value).toLocaleDateString("et-EE");
}
