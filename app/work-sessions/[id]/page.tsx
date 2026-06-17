import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import SessionMap from "@/components/SessionMap";

export default async function WorkSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: session, error } = await supabaseAdmin
    .from("work_sessions")
    .select("*, profiles(full_name), objects(name, latitude, longitude)")
    .eq("id", id)
    .single();

  if (error || !session) {
    return (
      <main className="min-h-screen bg-[#050807] p-10 text-white">
        <Link href="/work-sessions" className="text-sm text-emerald-400">
          ← Tagasi tööaegade juurde
        </Link>
        <h1 className="mt-4 text-4xl font-bold">Tööaega ei leitud</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/work-sessions" className="text-sm text-emerald-400">
        ← Tagasi tööaegade juurde
      </Link>

      <h1 className="mt-4 text-4xl font-bold">Tööaja detail</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Info title="Töötaja" value={session.profiles?.full_name ?? "-"} />
        <Info title="Objekt" value={session.objects?.name ?? "-"} />
        <Info
          title="Algus"
          value={new Date(session.start_time).toLocaleString("et-EE")}
        />
        <Info
          title="Lõpp"
          value={
            session.end_time
              ? new Date(session.end_time).toLocaleString("et-EE")
              : "avatud"
          }
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Info title="Alguse kaugus" value={`${session.start_distance_m ?? "-"} m`} />
        <Info title="Lõpu kaugus" value={`${session.end_distance_m ?? "-"} m`} />
        <Info title="Tunnid" value={`${session.total_hours ?? "-"} h`} />
        <Info title="Summa" value={`${session.total_amount ?? "-"} €`} />
      </div>

      <div className="mt-8">
        <SessionMap
          startLat={Number(session.start_latitude)}
          startLng={Number(session.start_longitude)}
          endLat={session.end_latitude ? Number(session.end_latitude) : null}
          endLng={session.end_longitude ? Number(session.end_longitude) : null}
          objectLat={session.objects?.latitude ? Number(session.objects.latitude) : null}
          objectLng={session.objects?.longitude ? Number(session.objects.longitude) : null}
          startTime={session.start_time}
          endTime={session.end_time}
          objectName={session.objects?.name}
        />
      </div>
    </main>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-sm text-white/50">{title}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
