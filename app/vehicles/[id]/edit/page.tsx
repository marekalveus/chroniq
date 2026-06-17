import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

async function updateVehicle(id: string, formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "");
  const registration_number = String(formData.get("registration_number") || "");
  const vehicle_type = String(formData.get("vehicle_type") || "company");
  const initial_odometer_km = Number(formData.get("initial_odometer_km") || 0);
  const current_odometer_km = Number(formData.get("current_odometer_km") || 0);
  const fuel_type = String(formData.get("fuel_type") || "");
  const notes = String(formData.get("notes") || "");
  const inspection_valid_until = String(formData.get("inspection_valid_until") || "");
  const insurance_provider = String(formData.get("insurance_provider") || "");
  const insurance_policy_number = String(formData.get("insurance_policy_number") || "");
  const insurance_valid_until = String(formData.get("insurance_valid_until") || "") || null;
  const owner_name = String(formData.get("owner_name") || "");
  const is_active = formData.get("is_active") === "on";

  const { error } = await supabaseAdmin
    .from("vehicles")
    .update({
      name,
      registration_number,
      vehicle_type,
      initial_odometer_km,
      current_odometer_km,
      fuel_type,
      notes,
      inspection_valid_until,
      insurance_provider,
      insurance_policy_number,
      insurance_valid_until,
      owner_name,
      is_active,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  redirect("/vehicles");
}

export default async function EditVehiclePage({
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

  const action = updateVehicle.bind(null, id);

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/vehicles" className="text-sm text-emerald-400">
        ← Tagasi autode juurde
      </Link>

      <h1 className="mt-4 text-4xl font-bold">Muuda autot</h1>

      <form action={action} className="mt-8 max-w-2xl space-y-4">
        <input
          name="name"
          defaultValue={vehicle?.name ?? ""}
          placeholder="Auto nimi"
          required
          className={inputClass}
        />

        <input
          name="registration_number"
          defaultValue={vehicle?.registration_number ?? ""}
          placeholder="Reg.nr"
          className={inputClass}
        />

        <select
          name="vehicle_type"
          defaultValue={vehicle?.vehicle_type ?? "company"}
          className={inputClass}
        >
          <option value="company">Firmaauto</option>
          <option value="private">Eraauto</option>
        </select>

        <input
          name="initial_odometer_km"
          defaultValue={vehicle?.initial_odometer_km ?? vehicle?.current_odometer_km ?? ""}
          placeholder="Algne odomeeter / etalon"
          type="number"
          step="0.1"
          className={inputClass}
        />

        <input
          name="current_odometer_km"
          defaultValue={vehicle?.current_odometer_km ?? ""}
          placeholder="Praegune odomeeter"
          type="number"
          step="0.1"
          className={inputClass}
        />

        <input
          name="fuel_type"
          defaultValue={vehicle?.fuel_type ?? ""}
          placeholder="Kütus, nt diisel / bensiin / hübriid"
          className={inputClass}
        />

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-4 text-lg font-semibold">Dokumendid ja kindlustus</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              name="owner_name"
              defaultValue={vehicle?.owner_name ?? ""}
              placeholder="Omanik / liising"
              className={inputClass}
            />

            <input
              name="inspection_valid_until"
              defaultValue={vehicle?.inspection_valid_until ?? ""}
              placeholder="Ülevaatus kehtib kuni"
              type="month"
              className={inputClass}
            />

            <input
              name="insurance_provider"
              defaultValue={vehicle?.insurance_provider ?? ""}
              placeholder="Kindlustusandja"
              className={inputClass}
            />

            <input
              name="insurance_policy_number"
              defaultValue={vehicle?.insurance_policy_number ?? ""}
              placeholder="Poliisi nr"
              className={inputClass}
            />

            <input
              name="insurance_valid_until"
              defaultValue={vehicle?.insurance_valid_until ?? ""}
              placeholder="Kindlustus kehtib kuni"
              type="date"
              className={inputClass}
            />
          </div>
        </div>

        <textarea
          name="notes"
          defaultValue={vehicle?.notes ?? ""}
          placeholder="Märkused"
          className={inputClass}
        />

        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <input name="is_active" type="checkbox" defaultChecked={vehicle?.is_active} />
          <span>Aktiivne auto</span>
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
