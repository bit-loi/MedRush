"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Cpu, RotateCw, AlertCircle, Server, Sliders } from "lucide-react";
import ComparisonCards, {
  SolverResult,
  ComparativeSummary,
} from "@/components/dashboard/ComparisonCards";
import LocationManager from "@/components/dashboard/LocationManager";

// Dynamically import Leaflet MapComponent to disable Server Side Rendering (SSR)
const MapComponent = dynamic(
  () => import("@/components/dashboard/MapComponent"),
  { ssr: false }
);

interface Depot {
  id: string;
  name: string;
  stock: number;
  lat: number;
  lng: number;
}

interface Clinic {
  id: string;
  name: string;
  demand: number;
  lat: number;
  lng: number;
}

const DEFAULT_DEPOTS: Depot[] = [
  { id: "d1", name: "Central Logistics Hub", stock: 600, lat: 37.7749, lng: -122.4194 },
  { id: "d2", name: "North Distribution Depot", stock: 500, lat: 37.8044, lng: -122.2712 },
  { id: "d3", name: "East Logistics Hub", stock: 450, lat: 37.6879, lng: -122.1599 },
];

const DEFAULT_CLINICS: Clinic[] = [
  { id: "c1", name: "Metro Community Clinic", demand: 200, lat: 37.769, lng: -122.448 },
  { id: "c2", name: "Valley Care Center", demand: 250, lat: 37.82, lng: -122.25 },
  { id: "c3", name: "Northern Health Station", demand: 180, lat: 37.87, lng: -122.27 },
  { id: "c4", name: "Eastern Community Care", demand: 220, lat: 37.7, lng: -122.18 },
  { id: "c5", name: "Harbor View Center", demand: 190, lat: 37.73, lng: -122.38 },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8003";

export default function QuantumVaccineDashboard() {
  const [districtName, setDistrictName] = useState("Regional Medical Vaccine Supply Network");
  const [depots, setDepots] = useState<Depot[]>(DEFAULT_DEPOTS);
  const [clinics, setClinics] = useState<Clinic[]>(DEFAULT_CLINICS);
  const [quantumResult, setQuantumResult] = useState<SolverResult | null>(null);
  const [classicalResult, setClassicalResult] = useState<SolverResult | null>(null);
  const [comparisonSummary, setComparisonSummary] = useState<ComparativeSummary | null>(null);

  const [activeSolver, setActiveSolver] = useState<"quantum" | "classical">("quantum");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showLocationManager, setShowLocationManager] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch Dataset & Run Optimization
  const fetchAndOptimize = async (customDepots?: Depot[], customClinics?: Clinic[]) => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s safety timeout

    try {
      const activeDepots = customDepots || depots;
      const activeClinics = customClinics || clinics;

      const optRes = await fetch(`${API_BASE_URL}/api/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depots: activeDepots.length > 0 ? activeDepots : undefined,
          clinics: activeClinics.length > 0 ? activeClinics : undefined,
        }),
        signal: controller.signal,
      });

      if (!optRes.ok) {
        throw new Error(`Optimization API failed with status ${optRes.status}`);
      }

      const resData = await optRes.json();
      setDistrictName(resData.district_name);
      setDepots(resData.depots);
      setClinics(resData.clinics);
      setQuantumResult(resData.quantum_result);
      setClassicalResult(resData.classical_result);
      setComparisonSummary(resData.comparison_summary);
    } catch (err: unknown) {
      console.error("Optimization error:", err);
      if (err instanceof Error && err.name === "AbortError") {
        setError("Optimization request timed out. Please try again.");
      } else {
        const msg = err instanceof Error ? err.message : "Failed to connect to backend optimization API.";
        setError(msg);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndOptimize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    if (isPickingLocation) {
      setSelectedCoords({ lat, lng });
      setShowLocationManager(true);
    }
  };

  const handleUpdateLocations = (newDepots: Depot[], newClinics: Clinic[]) => {
    setDepots(newDepots);
    setClinics(newClinics);
    fetchAndOptimize(newDepots, newClinics);
  };

  const activeAllocations =
    activeSolver === "quantum"
      ? quantumResult?.allocations ?? []
      : classicalResult?.allocations ?? [];

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="border-b border-zinc-800/80 bg-[#09090b] sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex aspect-square size-9 rounded-full border border-zinc-700/60 before:absolute before:-inset-1 before:rounded-full before:border before:border-zinc-800/40">
              <Cpu className="m-auto size-4 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-base tracking-tight text-white">
                  MedRush Quantum
                </h1>
                <span className="bg-[#141417] text-zinc-300 border border-zinc-800 text-[10px] font-mono px-2 py-0.5 rounded">
                  QAOA Demo
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                {districtName} &bull; QUBO & QAOA Optimization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLocationManager(!showLocationManager)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 border ${
                showLocationManager
                  ? "bg-zinc-800 text-white border-zinc-600"
                  : "bg-[#141417] text-zinc-300 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <Sliders className="size-3.5" />
              {showLocationManager ? "Hide Location Editor" : "Manage Locations"}
            </button>

            <button
              onClick={() => fetchAndOptimize(depots, clinics)}
              disabled={loading}
              className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs px-3.5 py-1.5 rounded-lg border border-white transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCw className={`size-3.5 text-black ${loading ? "animate-spin" : ""}`} strokeWidth={2} />
              {loading ? "Solving QUBO..." : "Re-Run Optimization"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 space-y-6 flex-1">
        {error && (
          <div className="bg-[#0c0c0e] border border-zinc-800/80 text-zinc-300 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="size-4 text-white" strokeWidth={1.5} />
            <div>
              <b className="text-white">Optimization Backend Offline / Timed Out:</b> {error}.
            </div>
          </div>
        )}

        {/* Collapsible Location Input Manager */}
        {showLocationManager && (
          <LocationManager
            depots={depots}
            clinics={clinics}
            onUpdateLocations={handleUpdateLocations}
            selectedCoords={selectedCoords}
            isPickingLocation={isPickingLocation}
            setIsPickingLocation={setIsPickingLocation}
          />
        )}

        {/* Map & View Controls Header */}
        <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400">Visualization Mode:</span>
            <div className="bg-[#141417] p-1 rounded-lg border border-zinc-800 flex gap-1">
              <button
                onClick={() => setActiveSolver("quantum")}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  activeSolver === "quantum"
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                QAOA Quantum Plan
              </button>

              <button
                onClick={() => setActiveSolver("classical")}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  activeSolver === "classical"
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Classical ILP Plan
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              Depots ({depots.length})
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
              Clinics ({clinics.length})
            </div>
            <div className="flex items-center gap-1.5">
              <Server className="size-3.5 text-zinc-400" strokeWidth={1.5} />
              CARTO Dark Matter
            </div>
          </div>
        </div>

        {/* Leaflet CARTO Map Section */}
        <div className="w-full h-[520px]">
          <MapComponent
            depots={depots}
            clinics={clinics}
            allocations={activeAllocations}
            activeSolver={activeSolver}
            onMapClick={handleMapClick}
            isPickingLocation={isPickingLocation}
          />
        </div>

        {/* Side-by-Side Benchmark & Metrics Section */}
        <ComparisonCards
          quantumResult={quantumResult}
          classicalResult={classicalResult}
          comparisonSummary={comparisonSummary}
          activeSolver={activeSolver}
          setActiveSolver={setActiveSolver}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#09090b] py-4 px-6 text-center text-xs text-zinc-500 font-mono">
        <p>
          MedRush Quantum Optimization &bull; Qiskit Aer Simulation &bull; Learning Prototype
        </p>
      </footer>
    </main>
  );
}
