"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function WorkerPasswordPage() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [status, setStatus] = useState("");

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    if (password.length < 6) {
      setStatus("Parool peab olema vähemalt 6 märki.");
      return;
    }

    if (password !== password2) {
      setStatus("Paroolid ei kattu.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("Viga: " + error.message);
      return;
    }

    setPassword("");
    setPassword2("");
    setStatus("✅ Parool muudetud.");
  }

  return (
    <main className="min-h-screen bg-[#050807] p-6 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/worker" className="text-sm text-emerald-400">
          ← Tagasi töötaja vaatesse
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Muuda parool</h1>

        <form
          onSubmit={changePassword}
          className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
        >
          <label className="mb-2 block text-sm text-white/60">
            Uus parool
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />

          <label className="mb-2 mt-4 block text-sm text-white/60">
            Korda uut parooli
          </label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className={inputClass}
          />

          <button className="mt-5 w-full rounded-xl bg-emerald-500 px-4 py-4 font-bold text-black">
            Salvesta uus parool
          </button>

          {status && (
            <div className="mt-5 rounded-xl bg-black/30 p-4 text-sm text-white/70">
              {status}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white outline-none";
