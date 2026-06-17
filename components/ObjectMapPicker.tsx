"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

function ClickHandler({
  onPick,
}: {
  onPick: (position: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

function MapMover({ position }: { position: [number, number] }) {
  const map = useMap();
  map.setView(position, 16);
  return null;
}

export default function ObjectMapPicker() {
  const [address, setAddress] = useState("");
  const [position, setPosition] = useState<[number, number]>([
    59.437,
    24.7536,
  ]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");

  async function searchAddress() {
    setError("");

    if (!address.trim()) {
      setError("Sisesta aadress või koha nimi.");
      return;
    }

    const url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=ee&q=" +
      encodeURIComponent(address);

    const response = await fetch(url, {
      headers: {
        "Accept-Language": "et",
      },
    });

    const found: SearchResult[] = await response.json();

    if (!found || found.length === 0) {
      setError("Aadressi või kohta ei leitud.");
      setResults([]);
      return;
    }

    setResults(found);
    selectResult(found[0]);
  }

  function selectResult(result: SearchResult) {
    const lat = Number(result.lat);
    const lon = Number(result.lon);

    setPosition([lat, lon]);
    setAddress(result.display_name);
    setResults([]);
  }

  function handleMapClick(position: [number, number]) {
    setPosition(position);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm text-white/60">
          Aadress / asukoht
        </label>

        <div className="flex gap-3">
          <input
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                searchAddress();
              }
            }}
            placeholder="Näiteks: Saku õlletehas või Tallinna mnt 2, Saku"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/40"
          />

          <button
            type="button"
            onClick={searchAddress}
            className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black"
          >
            Otsi
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-black/40">
            {results.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectResult(result)}
                className="block w-full border-b border-white/10 px-4 py-3 text-left text-sm hover:bg-white/10"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}

        {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
      </div>

      <div className="h-[420px] overflow-hidden rounded-2xl border border-white/10">
        <MapContainer
          center={position}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapMover position={position} />
          <ClickHandler onPick={handleMapClick} />

          <Marker position={position} icon={markerIcon} />
          <Circle center={position} radius={300} />
        </MapContainer>
      </div>

      <input type="hidden" name="latitude" value={position[0]} />
      <input type="hidden" name="longitude" value={position[1]} />

      <div className="rounded-xl bg-black/30 p-4 text-sm text-white/60">
        Salvestatav aadress:{" "}
        <span className="text-emerald-300">{address || "-"}</span>
        <br />
        Keskpunkt:{" "}
        <span className="text-emerald-300">
          {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </span>
      </div>
    </div>
  );
}
