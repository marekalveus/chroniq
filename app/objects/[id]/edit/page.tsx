import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

async function updateObject(id: string, formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "");
  const object_code = String(formData.get("object_code") || "");
  const client_name = String(formData.get("client_name") || "");
  const address = String(formData.get("address") || "");
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));
  const hourly_rate = Number(formData.get("hourly_rate"));
  const allowed_radius_m = Number(formData.get("allowed_radius_m") || 300);
  const object_type = String(formData.get("object_type") || "regular");
  const is_active = formData.get("is_active") === "on";

  const { error } = await supabaseAdmin
    .from("objects")
    .update({
      name,
      object_code,
      client_name,
      address,
      latitude,
      longitude,
      hourly_rate,
      allowed_radius_m,
      object_type,
      is_active,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/objects");
}

export default async function EditObjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: object, error } = await supabaseAdmin
    .from("objects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !object) {
    return (
      <main className="min-h-screen bg-[#050807] p-10 text-white">
        <Link href="/objects" className="text-sm text-emerald-400">
          ← Tagasi objektide juurde
        </Link>
        <h1 className="mt-4 text-4xl font-bold">Objekti ei leitud</h1>
      </main>
    );
  }

  const save = updateObject.bind(null, id);

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/objects" className="text-sm text-emerald-400">
        ← Tagasi objektide juurde
      </Link>

      <h1 className="mt-4 text-4xl font-bold">Muuda objekti</h1>

      <form action={save} className="mt-8 max-w-2xl space-y-4">
        <input name="name" defaultValue={object.name ?? ""} placeholder="Objekti nimi" required className={inputClass} />
        <input name="object_code" defaultValue={object.object_code ?? ""} placeholder="Objekti kood" className={inputClass} />
        <input name="client_name" defaultValue={object.client_name ?? ""} placeholder="Klient" className={inputClass} />
        <input name="address" defaultValue={object.address ?? ""} placeholder="Aadress" className={inputClass} />

        <div className="grid grid-cols-2 gap-4">
          <input name="latitude" defaultValue={object.latitude ?? ""} placeholder="Latitude" required className={inputClass} />
          <input name="longitude" defaultValue={object.longitude ?? ""} placeholder="Longitude" required className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input name="hourly_rate" defaultValue={object.hourly_rate ?? ""} placeholder="Tunnihind" required className={inputClass} />
          <input name="allowed_radius_m" defaultValue={object.allowed_radius_m ?? 300} placeholder="Raadius meetrites" className={inputClass} />
        </div>

        <select name="category" className={inputClass} defaultValue={object.category ?? "regular"}>
          <option value="regular">Objekti tüüp 1</option>
          <option value="ship">Objekti tüüp 2</option>
          <option value="category_3">Objekti tüüp 3</option>
        </select>

        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <input name="is_active" type="checkbox" defaultChecked={object.is_active} />
          <span>Aktiivne objekt</span>
        </label>

        <button className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black">
          Salvesta muudatused
        </button>
      </form>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/40";
