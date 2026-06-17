import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

async function createVehicle(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "");
  const registration_number = String(formData.get("registration_number") || "");
  const vehicle_type = String(formData.get("vehicle_type") || "company");
  const notes = String(formData.get("notes") || "");

  const { error } = await supabaseAdmin.from("vehicles").insert({
    name,
    registration_number,
    vehicle_type,
    notes,
    is_active: true,
  });

  if (error) throw new Error(error.message);

  redirect("/vehicles");
}

export default function NewVehiclePage() {
  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/vehicles" className="text-sm text-emerald-400">
        ← Tagasi autode juurde
      </Link>

      <h1 className="mt-4 text-4xl font-bold">Lisa auto</h1>

      <form action={createVehicle} className="mt-8 max-w-2xl space-y-4">
        <input name="name" placeholder="Auto nimi, nt BMW X5" required className={inputClass} />
        <input name="registration_number" placeholder="Reg.nr" className={inputClass} />

        <select name="vehicle_type" defaultValue="company" className={inputClass}>
          <option value="company">Firmaauto</option>
          <option value="private">Eraauto</option>
        </select>

        <textarea name="notes" placeholder="Märkused" className={inputClass} />

        <button className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black">
          Salvesta auto
        </button>
      </form>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/40";
