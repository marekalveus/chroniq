import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

async function sendPasswordReset(id: string) {
  "use server";

  const { data, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);

  if (userError || !data.user?.email) {
    throw new Error("Kasutaja e-posti ei leitud.");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(
    data.user.email,
    {
      redirectTo: `${siteUrl}/reset-password`,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/workers/${id}/edit`);
}

async function updateWorker(id: string, formData: FormData) {
  "use server";

  const full_name = String(formData.get("full_name") || "");
  const phone = String(formData.get("phone") || "");
  const role = String(formData.get("role") || "worker");
  const is_active = formData.get("is_active") === "on";

  const regular_rate = Number(formData.get("regular_rate") || 0);
  const ship_rate = Number(formData.get("ship_rate") || 0);
  const special_rate = Number(formData.get("special_rate") || 0);

  const vehicle_type = String(formData.get("vehicle_type") || "none");
  const vehicle_name = String(formData.get("vehicle_name") || "");
  const vehicle_reg_number = String(formData.get("vehicle_reg_number") || "");
  const vehicle_km_rate = Number(formData.get("vehicle_km_rate") || 0);
  const new_password = String(formData.get("new_password") || "");

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      full_name,
      phone,
      role: role === "admin" ? "admin" : "worker",
      is_active,
      regular_rate,
      ship_rate,
      special_rate,
      vehicle_type,
      vehicle_name,
      vehicle_reg_number,
      vehicle_km_rate,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  if (new_password) {
    if (new_password.length < 6) {
      throw new Error("Parool peab olema vähemalt 6 märki.");
    }

    const { error: passwordError } =
      await supabaseAdmin.auth.admin.updateUserById(id, {
        password: new_password,
      });

    if (passwordError) {
      throw new Error(passwordError.message);
    }
  }

  redirect("/workers");
}

export default async function EditWorkerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: worker, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !worker) {
    return (
      <main className="min-h-screen bg-[#050807] p-10 text-white">
        <Link href="/workers" className="text-sm text-emerald-400">
          ← Tagasi töötajate juurde
        </Link>
        <h1 className="mt-4 text-4xl font-bold">Töötajat ei leitud</h1>
      </main>
    );
  }

  const save = updateWorker.bind(null, id);
  const resetPassword = sendPasswordReset.bind(null, id);

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/workers" className="text-sm text-emerald-400">
        ← Tagasi töötajate juurde
      </Link>

      <h1 className="mt-4 text-4xl font-bold">Muuda töötajat</h1>

      <form action={save} className="mt-8 max-w-2xl space-y-4">
        <input
          name="full_name"
          defaultValue={worker.full_name ?? ""}
          placeholder="Töötaja nimi"
          required
          className={inputClass}
        />

        <input
          name="phone"
          defaultValue={worker.phone ?? ""}
          placeholder="Telefon"
          className={inputClass}
        />

        <select name="role" className={inputClass} defaultValue={worker.role ?? "worker"}>
          <option value="worker">Töötaja</option>
          <option value="admin">Admin</option>
        </select>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-4 text-lg font-semibold">Töötaja tunnihinnad</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm text-white/60">
                Tavatund (€ / h)
              </label>

              <input
                name="regular_rate"
                defaultValue={worker.regular_rate ?? 0}
                type="number"
                step="0.01"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">
                Laevatund (€ / h)
              </label>

              <input
                name="ship_rate"
                defaultValue={worker.ship_rate ?? 0}
                type="number"
                step="0.01"
                className={inputClass}
              />
            </div>

          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-4 text-lg font-semibold">Sõiduki kasutus</h2>

          <div className="grid gap-4">

            <select
              name="vehicle_type"
              defaultValue={worker.vehicle_type ?? "none"}
              className={inputClass}
            >
              <option value="none">Ei kasuta autot</option>
              <option value="private">Eraauto</option>
              <option value="company">Tööauto</option>
            </select>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <input
                name="vehicle_name"
                defaultValue={worker.vehicle_name ?? ""}
                placeholder="Auto"
                className={inputClass}
              />

              <input
                name="vehicle_reg_number"
                defaultValue={worker.vehicle_reg_number ?? ""}
                placeholder="Reg.nr"
                className={inputClass}
              />

              <input
                name="vehicle_km_rate"
                defaultValue={worker.vehicle_km_rate ?? 0.16}
                placeholder="€/km, nt 0.16"
                type="number"
                step="0.01"
                className={inputClass}
              />

            </div>
          </div></div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-4 text-lg font-semibold">Kasutaja parool</h2>

          <input
            name="new_password"
            type="password"
            placeholder="Uus parool, jäta tühjaks kui ei muuda"
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <input name="is_active" type="checkbox" defaultChecked={worker.is_active} />
          <span>Aktiivne töötaja</span>
        </label>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black">
            Salvesta muudatused
          </button>

          <button
            formAction={resetPassword}
            className="rounded-xl bg-white/10 px-6 py-3 font-semibold text-emerald-300 hover:bg-white/20"
          >
            Saada parooli taastamise link
          </button>
        </div>
      </form>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/40";
