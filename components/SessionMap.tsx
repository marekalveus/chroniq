"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function SessionMap({
  startLat,
  startLng,
  endLat,
  endLng,
  objectLat,
  objectLng,
  startTime,
  endTime,
  objectName,
}: {
  startLat: number;
  startLng: number;
  endLat?: number | null;
  endLng?: number | null;
  objectLat?: number | null;
  objectLng?: number | null;
  startTime: string;
  endTime?: string | null;
  objectName?: string | null;
}) {
  const start: [number, number] = [startLat, startLng];
  const end: [number, number] | null =
    endLat && endLng ? [endLat, endLng] : null;

  const objectPoint: [number, number] | null =
    objectLat && objectLng ? [objectLat, objectLng] : null;

  return (
    <div className="h-[520px] overflow-hidden rounded-2xl border border-white/10">
      <MapContainer center={start} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {objectPoint && (
          <Marker position={objectPoint} icon={blueIcon}>
            <Popup>
              Objekt: {objectName ?? "Objekt"}
            </Popup>
          </Marker>
        )}

        <Marker position={start} icon={greenIcon}>
          <Popup>
            Algus: {new Date(startTime).toLocaleString("et-EE")}
          </Popup>
        </Marker>

        {end && (
          <Marker position={end} icon={redIcon}>
            <Popup>
              Lõpp: {endTime ? new Date(endTime).toLocaleString("et-EE") : "-"}
            </Popup>
          </Marker>
        )}

        {end && <Polyline positions={[start, end]} />}
      </MapContainer>
    </div>
  );
}
