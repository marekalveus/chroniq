"use client";

import { useState } from "react";

type Result = {
  name?: string;
  nimi?: string;
  reg_code?: string;
  ariregistri_kood?: string;
  registry_code?: string;
  address?: string;
  aadress?: string;
};

export default function BusinessSearchInput() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [registryCode, setRegistryCode] = useState("");
  const [address, setAddress] = useState("");

  async function search(value: string) {
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    const res = await fetch(`/api/business-search?q=${encodeURIComponent(value)}`);
    const json = await res.json();

    const list = Array.isArray(json) ? json : json.data ?? [];
    setResults(list);
  }

  function selectBusiness(item: Result) {
    const name = item.name ?? item.nimi ?? "";
    const code =
      item.reg_code ??
      item.ariregistri_kood ??
      item.registry_code ??
      "";
    const adr = item.address ?? item.aadress ?? "";

    setQuery(name);
    setRegistryCode(code);
    setAddress(adr);
    setResults([]);
  }

  return (
    <div className="relative space-y-4">
      <input
        name="client_name"
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="Klient"
        className={inputClass}
      />

      {results.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-white/10 bg-[#101514] shadow-xl">
          {results.map((item, index) => {
            const name = item.name ?? item.nimi ?? "";
            const code =
              item.reg_code ??
              item.ariregistri_kood ??
              item.registry_code ??
              "";
            const adr = item.address ?? item.aadress ?? "";

            return (
              <button
                key={index}
                type="button"
                onClick={() => selectBusiness(item)}
                className="block w-full border-b border-white/10 px-4 py-3 text-left hover:bg-white/10"
              >
                <div className="font-medium">{name}</div>
                <div className="text-sm text-white/50">
                  {code} {adr ? `· ${adr}` : ""}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <input
        name="client_registry_code"
        value={registryCode}
        onChange={(e) => setRegistryCode(e.target.value)}
        placeholder="Registrikood"
        className={inputClass}
      />

      <input
        name="client_address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Kliendi aadress"
        className={inputClass}
      />
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/40";
