"use client";

import { usePathname } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

export default function AdminLogoutButton() {
  const pathname = usePathname();

  if (
    pathname === "/login" ||
    pathname.startsWith("/worker") ||
    pathname.startsWith("/reset-password")
  ) {
    return null;
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="fixed right-6 top-6 z-50 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-red-600"
    >
      Logi välja
    </button>
  );
}
