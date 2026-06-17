"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const workerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Session = {
  id: string;
  start_latitude: number;
  start_longitude: number;
  start_time: string;
  session_type: string;
  travel_from?: string | null;
  travel_to?: string | null;
  profiles?: { full_name?: string | null };
  objects?: {
    name?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  vehicles?: {
    name?: string | null;
    registration_number?: string | null;
  } | null;
};

export default function LiveMap({ sessions }: { sessions: Session[] }) {
  const first = sessions[0];

  const center: [number, number] = first
    ? [Number(first.start_latitude), Number(first.start_longitude)]
    : [59.437, 24.7536];

  return (
    <div className="h-[720px] overflow-hidden rounded-2xl border border-white/10">
      <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {sessions.map((s) => {
          const lat = Number(s.start_latitude);
          const lng = Number(s.start_longitude);

          return (
            <Marker key={s.id} position={[lat, lng]} icon={workerIcon}>
              <Popup>
                <div>
                  <b>{s.profiles?.full_name ?? "Töötaja"}</b>
                  <br />
                  {s.session_type === "work"
                    ? `Töö objektil: ${s.objects?.name ?? "-"}`
                    : `Sõit: ${s.travel_from ?? "-"} → ${s.travel_to ?? "-"}`}
                  <br />
                  Algus: {new Date(s.start_time).toLocaleString("et-EE")}
                  <br />
                  Auto:{" "}
                  {s.vehicles
                    ? `${s.vehicles.name ?? ""} ${s.vehicles.registration_number ?? ""}`
                    : "-"}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {sessions.map((s) => {
          if (!s.objects?.latitude || !s.objects?.longitude) return null;

          return (
            <Circle
              key={`object-${s.id}`}
              center={[Number(s.objects.latitude), Number(s.objects.longitude)]}
              radius={300}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
