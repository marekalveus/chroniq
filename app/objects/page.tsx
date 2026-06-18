export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

async function toggleObject(id: string, isActive: boolean) {
  "use server";

  const { error } = await supabaseAdmin
    .from("objects")
    .update({ is_active: !isActive })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/objects");
}

export default async function ObjectsPage() {
  const { data: objects } = await supabaseAdmin
    .from("objects")
    .select("*")
    .order("name", { ascending: true });

  const activeObjects = objects?.filter((o) => o.is_active) ?? [];
  const pausedObjects = objects?.filter((o) => !o.is_active) ?? [];

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-emerald-400">
            ← Tagasi avalehele
          </Link>

          <h1 className="mt-4 text-4xl font-bold">Objektid</h1>
          <p className="mt-2 text-white/50">
            Aktiivsed ja lõpetatud objektid.
          </p>
        </div>

        <Link
          href="/objects/new"
          className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black"
        >
          + Lisa objekt
        </Link>
      </div>

      <ObjectTable objects={activeObjects} />

      {pausedObjects.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold text-white/70">
            Lõpetatud objektid
          </h2>

          <ObjectTable objects={pausedObjects} muted />
        </section>
      )}
    </main>
  );
}

function ObjectTable({
  objects,
  muted = false,
}: {
  objects: any[];
  muted?: boolean;
}) {
  return (
    <div
      className={`overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] ${
        muted ? "opacity-55" : ""
      }`}
    >
      <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
        <thead className="bg-white/[0.04] text-white/60">
          <tr>
            <th className="px-4 py-3">Kood</th>
            <th className="px-4 py-3">Objekt</th>
            <th className="px-4 py-3">Klient</th>
            <th className="px-4 py-3">Aadress</th>
            <th className="px-4 py-3">Tüüp</th>
            <th className="px-4 py-3">Staatus</th>
            <th className="px-4 py-3">Tegevus</th>
          </tr>
        </thead>

        <tbody>
          {objects.map((object) => {
            const toggle = toggleObject.bind(null, object.id, object.is_active);

            return (
              <tr key={object.id} className="border-t border-white/10">
                <td className="px-4 py-4">
                  <span className="rounded-lg bg-emerald-500/15 px-3 py-1 text-emerald-300">
                    {object.object_code ?? "-"}
                  </span>
                </td>

                <td className="px-4 py-4 font-medium">
                  <Link
                    href={`/objects/${object.id}`}
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    {object.name}
                  </Link>
                </td>

                <td className="px-4 py-4 text-white/60">
                  {object.client_name ?? "-"}
                </td>

                <td className="px-4 py-4 text-white/60">
                  {object.address ?? "-"}
                </td>

                <td className="px-4 py-4">
                  {object.category === "category_1"
                    ? "Tüüp 1"
                    : object.category === "category_2"
                    ? "Tüüp 2"
                    : object.category === "category_3"
                    ? "Tüüp 3"
                    : object.category ?? "-"}
                </td>

                <td className="px-4 py-4">
                  {object.is_active ? (
                    <span className="rounded-lg bg-emerald-500/15 px-3 py-1 text-emerald-300">
                      Aktiivne
                    </span>
                  ) : (
                    <span className="rounded-lg bg-red-500/15 px-3 py-1 text-red-300">
                      Lõpetatud
                    </span>
                  )}
                </td>

                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/objects/${object.id}/edit`}
                      className="rounded-lg bg-white/10 px-3 py-2 text-emerald-300 hover:bg-white/20"
                    >
                      Muuda
                    </Link>

                    <form action={toggle}>
                      <button
                        className={`rounded-lg px-3 py-2 ${
                          object.is_active
                            ? "bg-red-500/15 text-red-300 hover:bg-red-500/25"
                            : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                        }`}
                      >
                        {object.is_active ? "Lõpeta" : "Taasta"}
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
