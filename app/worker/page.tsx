"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Profile = { id: string; full_name: string };
type ObjectRow = { id: string; name: string };
type VehicleRow = { id: string; name: string; registration_number: string | null };

type WorkSession = {
  id: string;
  object_id: string;
  vehicle_id?: string | null;
  start_time: string;
  session_type: string;
  travel_from?: string | null;
  travel_to?: string | null;
  start_odometer_km?: number | null;
  is_night_work?: boolean;
  objects?: { name: string };
  vehicles?: { name: string; registration_number: string | null };
};

export default function WorkerPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [objects, setObjects] = useState<ObjectRow[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null);

  const [objectId, setObjectId] = useState("");
  const [sessionType, setSessionType] = useState("work");
  const [isNightWork, setIsNightWork] = useState(false);

  const [useVehicle, setUseVehicle] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [startOdometerKm, setStartOdometerKm] = useState("");
  const [endOdometerKm, setEndOdometerKm] = useState("");

  const [travelFrom, setTravelFrom] = useState("");
  const [travelTo, setTravelTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", userData.user.id)
      .single();

    const { data: objectsData } = await supabase
      .from("objects")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true });

    const { data: vehiclesData } = await supabase
      .from("vehicles")
      .select("id, name, registration_number")
      .eq("is_active", true)
      .order("name", { ascending: true });

    const { data: sessionData } = await supabase
      .from("work_sessions")
      .select("id, object_id, vehicle_id, start_time, session_type, travel_from, travel_to, start_odometer_km, is_night_work, objects(name), vehicles(name, registration_number)")
      .eq("worker_id", userData.user.id)
      .is("end_time", null)
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    setProfile(profileData);
    setObjects(objectsData ?? []);
    setVehicles(vehiclesData ?? []);
    setActiveSession(sessionData as WorkSession | null);
    setLoading(false);
  }

  function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
      });
    });
  }

  async function startActivity() {
    if (!profile) return;

    if (!objectId) {
      setStatus("Vali objekt.");
      return;
    }

    if (useVehicle && (!vehicleId || !startOdometerKm)) {
      setStatus("Vali auto ja sisesta alguse km.");
      return;
    }

    setStatus("Küsin GPS asukohta...");

    try {
      const position = await getCurrentPosition();

      setStatus("Alustan tegevust...");

      const selectedObject = objects.find((o) => o.id === objectId);

      const { error } = await supabase.rpc("start_work_session", {
        p_worker_id: profile.id,
        p_object_id: objectId,
        p_latitude: position.coords.latitude,
        p_longitude: position.coords.longitude,
        p_session_type: sessionType,
        p_travel_from:
          sessionType === "work" ? null : travelFrom || "Eelmine asukoht",
        p_travel_to:
          sessionType === "work" ? null : travelTo || selectedObject?.name || null,
        p_start_odometer_km:
          useVehicle && startOdometerKm ? Number(startOdometerKm) : null,
        p_is_night_work: sessionType === "work" ? isNightWork : false,
        p_vehicle_id: useVehicle && vehicleId ? vehicleId : null,
      });

      if (error) {
        setStatus("Viga: " + error.message);
        return;
      }

      resetForm();
      setStatus("🟢 Tegevus alustatud");
      await load();
    } catch (error: any) {
      setStatus("GPS viga: " + error.message);
    }
  }

  async function stopActivity() {
    if (!activeSession) return;

    if (activeSession.vehicle_id && !endOdometerKm) {
      setStatus("Sisesta lõpu km-näit.");
      return;
    }

    setStatus("Küsin GPS asukohta...");

    try {
      const position = await getCurrentPosition();

      const { error } = await supabase.rpc("stop_work_session", {
        p_session_id: activeSession.id,
        p_latitude: position.coords.latitude,
        p_longitude: position.coords.longitude,
        p_end_odometer_km:
          activeSession.vehicle_id && endOdometerKm
            ? Number(endOdometerKm)
            : null,
      });

      if (error) {
        setStatus("Viga: " + error.message);
        return;
      }

      setEndOdometerKm("");
      setStatus("✅ Tegevus lõpetatud");
      await load();
    } catch (error: any) {
      setStatus("GPS viga: " + error.message);
    }
  }

  async function switchActivity(nextType: string) {
    if (!activeSession) return;

    await stopActivity();

    setObjectId(activeSession.object_id);
    setSessionType(nextType);
  }

  function resetForm() {
    setObjectId("");
    setSessionType("work");
    setIsNightWork(false);
    setUseVehicle(false);
    setVehicleId("");
    setStartOdometerKm("");
    setEndOdometerKm("");
    setTravelFrom("");
    setTravelTo("");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050807] p-6 text-white">Laen...</main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050807] p-6 text-white">
      <div className="mx-auto max-w-xl">
        <h1 className="mt-4 text-3xl font-bold">LinkPoint WorkTime</h1>

        <p className="mt-2 text-white/50">
          Tere, {profile?.full_name ?? "töötaja"}
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          {activeSession ? (
            <div>
              <div className="text-2xl font-bold text-emerald-400">
                🟢 Tegevus käib
              </div>

              <Info
                title="Objekt"
                value={activeSession.objects?.name ?? "Objekt"}
              />

              <Info
                title="Tegevus"
                value={typeLabel(activeSession.session_type)}
              />

              {activeSession.is_night_work && (
                <Info title="Öötöö" value="Jah, topelttund" />
              )}

              {activeSession.session_type !== "work" && (
                <Info
                  title="Sõit"
                  value={`${activeSession.travel_from ?? "-"} → ${
                    activeSession.travel_to ?? "-"
                  }`}
                />
              )}

              {activeSession.vehicle_id && (
                <>
                  <Info
                    title="Auto"
                    value={`${activeSession.vehicles?.name ?? ""} ${
                      activeSession.vehicles?.registration_number ?? ""
                    }`}
                  />
                  <Info
                    title="Alguse km"
                    value={`${activeSession.start_odometer_km ?? "-"} km`}
                  />

                  <div className="mt-4">
                    <label className="mb-2 block text-sm text-white/60">
                      Lõpu km-näit
                    </label>
                    <input
                      value={endOdometerKm}
                      onChange={(e) => setEndOdometerKm(e.target.value)}
                      type="number"
                      step="0.1"
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              <Info
                title="Algus"
                value={new Date(activeSession.start_time).toLocaleString("et-EE")}
              />

              <div className="mt-5 grid grid-cols-1 gap-3">
                <button
                  onClick={() => switchActivity("work")}
                  className="rounded-xl bg-white/10 px-4 py-4 font-semibold text-emerald-300"
                >
                  👷 Vaheta: töö objektil
                </button>

                <button
                  onClick={() => switchActivity("travel_to")}
                  className="rounded-xl bg-white/10 px-4 py-4 font-semibold text-blue-300"
                >
                  🚗 Vaheta: sõit objektile
                </button>

                <button
                  onClick={() => switchActivity("travel_from")}
                  className="rounded-xl bg-white/10 px-4 py-4 font-semibold text-blue-300"
                >
                  🚗 Vaheta: sõit objektilt
                </button>

                <button
                  onClick={stopActivity}
                  className="rounded-xl bg-red-500 px-4 py-4 text-lg font-bold text-white"
                >
                  ⏹ Lõpeta tegevus
                </button>
              </div>
            </div>
          ) : (
            <>
              <label className="mb-2 block text-sm text-white/60">
                Objekt
              </label>

              <select
                value={objectId}
                onChange={(e) => setObjectId(e.target.value)}
                className={inputClass}
              >
                <option value="">Vali objekt</option>
                {objects.map((object) => (
                  <option key={object.id} value={object.id}>
                    {object.name}
                  </option>
                ))}
              </select>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-white/60">
                  Tegevus
                </label>

                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className={inputClass}
                >
                  <option value="travel_to">Sõit objektile</option>
                  <option value="work">Töö objektil</option>
                  <option value="travel_from">Sõit objektilt</option>
                </select>
              </div>

              {sessionType === "work" && (
                <label className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={isNightWork}
                    onChange={(e) => setIsNightWork(e.target.checked)}
                  />
                  <span>Öötöö / topelttund</span>
                </label>
              )}

              {sessionType !== "work" && (
                <div className="mt-4 space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
                  <input
                    value={travelFrom}
                    onChange={(e) => setTravelFrom(e.target.value)}
                    placeholder="Kust"
                    className={inputClass}
                  />
                  <input
                    value={travelTo}
                    onChange={(e) => setTravelTo(e.target.value)}
                    placeholder="Kuhu"
                    className={inputClass}
                  />
                </div>
              )}

              <label className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4">
                <input
                  type="checkbox"
                  checked={useVehicle}
                  onChange={(e) => setUseVehicle(e.target.checked)}
                />
                <span>Olen autoga / olen roolis</span>
              </label>

              {useVehicle && (
                <div className="mt-4 space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Vali auto</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} {vehicle.registration_number ?? ""}
                      </option>
                    ))}
                  </select>

                  <input
                    value={startOdometerKm}
                    onChange={(e) => setStartOdometerKm(e.target.value)}
                    type="number"
                    step="0.1"
                    placeholder="Alguse km-näit"
                    className={inputClass}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  startActivity();
                }}
                className="mt-5 w-full cursor-pointer rounded-xl bg-emerald-500 px-4 py-4 text-lg font-bold text-black"
              >
                ▶ Alusta tegevust
              </button>
            </>
          )}

          {status && (
            <div className="mt-5 rounded-xl bg-black/30 p-4 text-sm text-white/70">
              {status}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="mt-4 rounded-xl bg-black/30 p-4">
      <div className="text-sm text-white/50">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function typeLabel(type: string) {
  if (type === "travel_to") return "Sõit objektile";
  if (type === "travel_from") return "Sõit objektilt";
  return "Töö objektil";
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white outline-none placeholder:text-white/40";
