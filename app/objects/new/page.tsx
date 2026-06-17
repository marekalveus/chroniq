import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import ObjectMapPicker from "@/components/ObjectMapPicker";
import BusinessSearchInput from "@/components/BusinessSearchInput";

async function createObject(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "");
  const object_code = `OBJ-${Date.now()}`;
  const client_name = String(formData.get("client_name") || "");
  const client_registry_code = String(formData.get("client_registry_code") || "");
  const client_address = String(formData.get("client_address") || "");
  const address = String(formData.get("address") || "");
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));
  const allowed_radius_m = 300;
  const object_type = String(formData.get("object_type") || "regular");

  const { error } = await supabaseAdmin.from("objects").insert({
    name,
    object_code,
    client_name,
    client_registry_code,
    client_address,
    address,
    latitude,
    longitude,
    allowed_radius_m,
    object_type,
    is_active: true,
  });


  if (error) {
    throw new Error(error.message);
  }

  redirect("/objects");
}

export default function NewObjectPage() {
  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/objects" className="text-sm text-emerald-400">
        ← Tagasi objektide juurde
      </Link>

      <h1 className="mt-4 text-4xl font-bold">Lisa objekt</h1>

      <form action={createObject} className="mt-8 max-w-2xl space-y-4">
        <input name="name" placeholder="Objekti nimi" required className={inputClass} />
        <BusinessSearchInput />

        <ObjectMapPicker />

        <select name="object_type" className={inputClass} defaultValue="regular">
          <option value="regular">Tava objekt</option>
          <option value="ship">Laeva objekt</option>
        </select>

        <button className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black">
          Salvesta objekt
        </button>
      </form>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/40";
