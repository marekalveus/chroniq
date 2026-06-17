"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/worker");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#050807] flex items-center justify-center p-6 text-white">
      <form
        onSubmit={login}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
        <h1 className="mb-6 text-3xl font-bold">
          LinkPoint WorkTime
        </h1>

        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />

        <input
          type="password"
          placeholder="Parool"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputClass} mt-4`}
        />

        {error && (
          <div className="mt-4 text-red-400">
            {error}
          </div>
        )}

        <button className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-4 font-bold text-black">
          Logi sisse
        </button>
      </form>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white outline-none";
