"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function updatePassword() {
    if (!password || password.length < 6) {
      setStatus("Parool peab olema vähemalt 6 märki.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setStatus("Viga: " + error.message);
      return;
    }

    setStatus("✅ Parool muudetud. Võid nüüd sisse logida.");
  }

  return (
    <main className="min-h-screen bg-[#050807] p-10 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="text-4xl font-bold">Muuda parool</h1>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Uus parool"
          className="mt-8 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white outline-none"
        />

        <button
          onClick={updatePassword}
          className="mt-5 w-full rounded-xl bg-emerald-500 px-4 py-4 font-bold text-black"
        >
          Salvesta uus parool
        </button>

        {status && (
          <div className="mt-5 rounded-xl bg-black/30 p-4 text-sm text-white/70">
            {status}
          </div>
        )}
      </div>
    </main>
  );
}
