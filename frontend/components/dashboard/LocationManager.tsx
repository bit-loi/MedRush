"use client";

import { useState } from "react";
import { Plus, Trash2, MapPin, Building2, Package, Check, MousePointer } from "lucide-react";
import { Depot, Clinic } from "./MapComponent";

interface LocationManagerProps {
  depots: Depot[];
  clinics: Clinic[];
  onUpdateLocations: (newDepots: Depot[], newClinics: Clinic[]) => void;
  selectedCoords: { lat: number; lng: number } | null;
  isPickingLocation: boolean;
  setIsPickingLocation: (val: boolean) => void;
}

export default function LocationManager({
  depots,
  clinics,
  onUpdateLocations,
  selectedCoords,
  isPickingLocation,
  setIsPickingLocation,
}: LocationManagerProps) {
  const [activeTab, setActiveTab] = useState<"depot" | "clinic">("depot");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState<number>(300);
  const [lat, setLat] = useState<string>("-6.30");
  const [lng, setLng] = useState<string>("107.30");

  // Sync coords if picked from map
  useState(() => {
    if (selectedCoords) {
      setLat(selectedCoords.lat.toString());
      setLng(selectedCoords.lng.toString());
    }
  });

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) return;

    if (activeTab === "depot") {
      const newDepot: Depot = {
        id: `d${depots.length + 1}`,
        name: name.trim(),
        stock: capacity,
        lat: parsedLat,
        lng: parsedLng,
      };
      onUpdateLocations([...depots, newDepot], clinics);
    } else {
      const newClinic: Clinic = {
        id: `c${clinics.length + 1}`,
        name: name.trim(),
        demand: capacity,
        lat: parsedLat,
        lng: parsedLng,
      };
      onUpdateLocations(depots, [...clinics, newClinic]);
    }

    setName("");
    setIsPickingLocation(false);
  };

  const handleRemoveDepot = (id: string) => {
    onUpdateLocations(
      depots.filter((d) => d.id !== id),
      clinics
    );
  };

  const handleRemoveClinic = (id: string) => {
    onUpdateLocations(
      depots,
      clinics.filter((c) => c.id !== id)
    );
  };

  return (
    <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-5 space-y-5 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin className="size-4 text-zinc-400" />
            Supply Chain Location & Capacity Manager
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Add custom depots, clinics, or pick coordinates directly on the map.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPickingLocation(!isPickingLocation)}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-2 border ${
            isPickingLocation
              ? "bg-white text-black border-white font-bold"
              : "bg-[#141417] text-zinc-300 border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <MousePointer className="size-3.5" />
          {isPickingLocation ? "Click Map to Capture Coords..." : "Pick Location on Map"}
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddLocation} className="space-y-4 bg-[#141417] p-4 rounded-lg border border-zinc-800/80">
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setActiveTab("depot")}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              activeTab === "depot"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            + Add Depot (Supply)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("clinic")}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              activeTab === "clinic"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            + Add Clinic (Demand)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-1">
            <label className="text-[11px] text-zinc-400 font-mono block mb-1">Location Name</label>
            <input
              type="text"
              placeholder={activeTab === "depot" ? "e.g. Depot Telukjambe" : "e.g. Puskesmas Rengasdengklok"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-mono block mb-1">
              {activeTab === "depot" ? "Stock (Doses)" : "Demand (Doses)"}
            </label>
            <input
              type="number"
              min="10"
              max="2000"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 100)}
              className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-mono block mb-1">Latitude</label>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-mono block mb-1">Longitude</label>
            <input
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="bg-white text-black hover:bg-zinc-200 font-semibold text-xs px-4 py-1.5 rounded transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Add {activeTab === "depot" ? "Depot" : "Clinic"} Location
          </button>
        </div>
      </form>

      {/* Existing Depots & Clinics Summary List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Depots List */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
            <span>Depots ({depots.length})</span>
            <span>Total Stock: {depots.reduce((acc, d) => acc + d.stock, 0)} doses</span>
          </h3>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {depots.map((d) => (
              <div
                key={d.id}
                className="bg-[#141417] p-2.5 rounded border border-zinc-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Package className="size-3.5 text-zinc-400" />
                  <div>
                    <span className="font-medium text-white">{d.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      {d.lat}, {d.lng}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-300 font-semibold">{d.stock} doses</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDepot(d.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinics List */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
            <span>Clinics ({clinics.length})</span>
            <span>Total Demand: {clinics.reduce((acc, c) => acc + c.demand, 0)} doses</span>
          </h3>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {clinics.map((c) => (
              <div
                key={c.id}
                className="bg-[#141417] p-2.5 rounded border border-zinc-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="size-3.5 text-zinc-400" />
                  <div>
                    <span className="font-medium text-white">{c.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      {c.lat}, {c.lng}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-300 font-semibold">{c.demand} doses</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveClinic(c.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
