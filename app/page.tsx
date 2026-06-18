export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export default async function HomePage() {
  const { data: workers } = await supabaseAdmin
    .from("profiles")
    .select("*");

  const { data: objects } = await supabaseAdmin
    .from("objects")
    .select("*");

  const { data: vehicles } = await supabaseAdmin
    .from("vehicles")
    .select("*");

  const activeVehicles = vehicles?.filter((v) => v.is_active) ?? [];
  const companyVehicles = activeVehicles.filter((v) => v.vehicle_type !== "private");
  const privateVehicles = activeVehicles.filter((v) => v.vehicle_type === "private");

  const { data: activeSessions } = await supabaseAdmin
    .from("work_sessions")
    .select("*, profiles(full_name), objects(name)")
    .is("end_time", null)
    .order("start_time", { ascending: false });

  const activeWorkers = workers?.filter((w) => w.is_active) ?? [];
  const activeObjects = objects?.filter((o) => o.is_active) ?? [];

  return (
    <main className="min-h-screen bg-[#050807] text-white">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-white/10 bg-black/20 p-6">
          <div className="mb-10">
            <div className="text-2xl font-bold tracking-tight">Chroniq</div>
            <div className="text-sm text-emerald-400">LinkPoint Grupp</div>
          </div>

          <nav className="space-y-2">
            <Link href="/" className="block rounded-xl bg-white/10 px-4 py-3">
              🏠 Avaleht
            </Link>
            <Link href="/workers" className="block rounded-xl px-4 py-3 text-white/70 hover:bg-white/5">
              👥 Töötajad
            </Link>
            <Link href="/objects" className="block rounded-xl px-4 py-3 text-white/70 hover:bg-white/5">
              🏗 Töömaad
            </Link>
            <Link href="/vehicles" className="block rounded-xl px-4 py-3 text-white/70 hover:bg-white/5">
              🚗 Autod
            </Link>
            <Link href="/map" className="block rounded-xl px-4 py-3 text-white/70 hover:bg-white/5">
              🗺 Kaart
            </Link>
            <Link href="/work-sessions" className="block rounded-xl px-4 py-3 text-white/70 hover:bg-white/5">
              ⏱ Tööaja arvestus
            </Link>
            <Link href="/reports/payroll" className="block rounded-xl px-4 py-3 text-white/70 hover:bg-white/5">
              💰 Palgaarvestus
            </Link>
            <Link href="/reports/workers" className="block rounded-xl px-4 py-3 text-white/70 hover:bg-white/5">
              📊 Töötaja arvestus
            </Link>
            <Link href="/worker" className="block rounded-xl px-4 py-3 text-white/70 hover:bg-white/5">
              📱 Töötaja äpp
            </Link>
            <Link href="/settings" className="block rounded-xl px-4 py-3 text-white/70 hover:bg-white/5">
              ⚙️ Seaded
            </Link>
          </nav>
        </aside>

        <section className="flex-1 p-10">
          <div className="mb-10">
            <h1 className="text-4xl font-bold">Avaleht</h1>
            <p className="mt-2 text-white/50">
              Kiirvaade töötajatele, töömaadele, autodele ja aktiivsetele töödele.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardCard href="/workers" icon="👷" title="Töötajad" value={activeWorkers.length} />
            <DashboardCard href="/objects" icon="🏗" title="Töömaad" value={activeObjects.length} />
            <DashboardCard href="/map" icon="🗺" title="Kaart" value={activeSessions?.length ?? 0} subtitle="meest praegu tööl" />
            <DashboardCard
              href="/vehicles"
              icon="🚗"
              title="Autod"
              value={activeVehicles.length}
              subtitle={`Firmaautod: ${companyVehicles.length} · Eraautod: ${privateVehicles.length}`}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link href="/work-sessions" className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06]">
              <div className="text-3xl">⏱</div>
              <div className="mt-4 text-xl font-semibold">Tööaja arvestus</div>
              <div className="mt-2 text-sm text-white/50">Kõik töö algused, lõpud, GPS ja sessioonid.</div>
            </Link>

            <Link href="/reports/payroll" className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06]">
              <div className="text-3xl">💰</div>
              <div className="mt-4 text-xl font-semibold">Palgaarvestus</div>
              <div className="mt-2 text-sm text-white/50">Kuu koond, tunnid, hinnad, km ja kompensatsioon.</div>
            </Link>

            <Link href="/reports/workers" className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06]">
              <div className="text-3xl">📊</div>
              <div className="mt-4 text-xl font-semibold">Töötaja arvestus</div>
              <div className="mt-2 text-sm text-white/50">Töötajate tunnid ja koondid.</div>
            </Link>
          </div>

          <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Praegu tööl</h2>
              <Link href="/map" className="text-sm text-emerald-400">
                Ava kaart →
              </Link>
            </div>

            {activeSessions && activeSessions.length > 0 ? (
              <div className="space-y-3">
                {activeSessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/work-sessions/${s.id}`}
                    className="flex items-center justify-between rounded-xl bg-black/30 p-4 hover:bg-black/40"
                  >
                    <div>
                      <div className="font-semibold">
                        👷 {s.profiles?.full_name ?? "-"}
                      </div>
                      <div className="mt-1 text-sm text-white/50">
                        {s.session_type === "travel"
                          ? `🚗 ${s.travel_from ?? "-"} → ${s.travel_to ?? "-"}`
                          : `🏗 ${s.objects?.name ?? "-"}`}
                      </div>
                    </div>

                    <div className="text-right text-sm text-white/50">
                      Alustas{" "}
                      {new Date(s.start_time).toLocaleTimeString("et-EE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-black/30 p-4 text-white/50">
                Hetkel ei ole kedagi tööl.
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  href,
  icon,
  title,
  value,
  subtitle,
}: {
  href: string;
  icon: string;
  title: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06]"
    >
      <div className="text-3xl">{icon}</div>
      <div className="mt-4 text-sm text-white/50">{title}</div>
      <div className="mt-1 text-4xl font-bold">{value}</div>
      {subtitle && <div className="mt-1 text-sm text-white/40">{subtitle}</div>}
    </Link>
  );
}
