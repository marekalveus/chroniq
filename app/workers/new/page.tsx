import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

async function createWorker(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const full_name = String(formData.get("full_name") || "");
  const phone = String(formData.get("phone") || "");
  const role = String(formData.get("role") || "worker");

  const category_1_rate = Number(formData.get("category_1_rate") || 0);
  const category_2_rate = Number(formData.get("category_2_rate") || 0);
  const category_3_rate = Number(formData.get("category_3_rate") || 0);

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

  if (authError) {
    throw new Error("Auth viga: " + authError.message);
  }

  const userId = authData.user?.id;

  if (!userId) {
    throw new Error("Kasutaja ID puudub.");
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: userId,
    full_name,
    phone,
    role: role === "admin" ? "admin" : "worker",
    is_active: true,
    category_1_rate,
    category_2_rate,
    category_3_rate,
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw new Error("Profile viga: " + profileError.message);
  }

  redirect("/workers");
}

export default function NewWorkerPage() {
  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <Link href="/workers" className="text-sm text-emerald-400">
        ← Tagasi töötajate juurde
      </Link>

      <h1 className="mt-4 text-4xl font-bold">Lisa töötaja</h1>

      <form action={createWorker} className="mt-8 max-w-2xl space-y-4">
        <input name="full_name" placeholder="Töötaja nimi" required className={inputClass} />
        <input name="phone" placeholder="Telefon" className={inputClass} />
        <input name="email" type="email" placeholder="E-post sisselogimiseks" required className={inputClass} />
        <input name="password" type="password" placeholder="Ajutine parool" required className={inputClass} />

        <select name="role" className={inputClass} defaultValue="worker">
          <option value="worker">Töötaja</option>
          <option value="admin">Admin</option>
        </select>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-4 text-lg font-semibold">Kategooria tunnihinnad</h2>
          <div className="grid grid-cols-3 gap-4">
            <input name="category_1_rate" placeholder="Kat 1 €/h" type="number" step="0.01" className={inputClass} />
            <input name="category_2_rate" placeholder="Kat 2 €/h" type="number" step="0.01" className={inputClass} />
            <input name="category_3_rate" placeholder="Kat 3 €/h" type="number" step="0.01" className={inputClass} />
          </div>
        </div>

        <button className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black">
          Salvesta töötaja
        </button>
      </form>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/40";
