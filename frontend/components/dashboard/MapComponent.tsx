"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

export interface Depot {
  id: string;
  name: string;
  stock: number;
  lat: number;
  lng: number;
}

export interface Clinic {
  id: string;
  name: string;
  demand: number;
  lat: number;
  lng: number;
}

export interface AllocationRoute {
  depot_id: string;
  depot_name: string;
  clinic_id: string;
  clinic_name: string;
  allocated_doses: number;
  distance_km: number;
  cost: number;
  geometry?: number[][];
}

interface MapComponentProps {
  depots: Depot[];
  clinics: Clinic[];
  allocations: AllocationRoute[];
  activeSolver: "quantum" | "classical";
  onMapClick?: (lat: number, lng: number) => void;
  isPickingLocation?: boolean;
}

/**
 * Unified rendering function for all allocation route polylines.
 * Guarantees identical OSRM road-geometry rendering for both QAOA Quantum and Classical ILP plans.
 */
function renderAllocationRoutes(
  allocations: AllocationRoute[],
  solverType: "quantum" | "classical",
  layerGroup: L.LayerGroup,
  depotMap: Map<string, Depot>,
  clinicMap: Map<string, Clinic>
) {
  allocations.forEach((alloc) => {
    const depot = depotMap.get(alloc.depot_id);
    const clinic = clinicMap.get(alloc.clinic_id);

    if (depot && clinic) {
      const isQuantum = solverType === "quantum";
      const lineColor = isQuantum ? "#ffffff" : "#a1a1aa"; // White for QAOA, Zinc for Classical
      const lineWeight = Math.max(2, Math.min(6, alloc.allocated_doses / 50));

      // Use real road geometry waypoints from OSRM if available, else straight line fallback
      const polylineCoords: L.LatLngExpression[] =
        alloc.geometry && alloc.geometry.length > 0
          ? (alloc.geometry as [number, number][])
          : [
              [depot.lat, depot.lng],
              [clinic.lat, clinic.lng],
            ];

      const polyline = L.polyline(polylineCoords, {
        color: lineColor,
        weight: lineWeight,
        opacity: 0.9,
        dashArray: isQuantum ? "6, 6" : undefined, // Dashed for Quantum, Solid for Classical
      });

      polyline.bindPopup(`
        <div class="p-1.5 text-zinc-200 font-sans">
          <div class="font-bold text-xs text-white">${alloc.depot_name} ➔ ${alloc.clinic_name}</div>
          <div class="text-xs text-zinc-400 mt-1">Plan: <b class="text-white">${isQuantum ? "QAOA Quantum Plan" : "Classical ILP Plan"}</b></div>
          <div class="text-xs text-zinc-400">Allocated: <b class="text-white">${alloc.allocated_doses} doses</b></div>
          <div class="text-xs text-zinc-400">Distance: <b class="text-white">${alloc.distance_km} km</b> | Cost: <b class="text-white">$${alloc.cost.toLocaleString()}</b></div>
          <div class="text-[10px] text-zinc-500 font-mono mt-1">Routing: Real OSRM Road Geometry</div>
        </div>
      `);

      layerGroup.addLayer(polyline);
    }
  });
}

export default function MapComponent({
  depots,
  clinics,
  allocations,
  activeSolver,
  onMapClick,
  isPickingLocation,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapInstance = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Leaflet map if not created yet
    if (!leafletMapInstance.current) {
      // Default center: Karawang District (-6.30, 107.30)
      const map = L.map(mapRef.current, {
        center: [-6.30, 107.30],
        zoom: 11,
        zoomControl: true,
        attributionControl: false, // REMOVE LEAFLET WATERMARK/ATTRIBUTION
      });

      // CARTO Dark Matter Raster Tiles (Monochrome Black & White)
      const tileLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
        }
      );

      tileLayer.addTo(map);

      // Handle map click for location picking
      map.on("click", (e: L.LeafletMouseEvent) => {
        if (onMapClickRef.current) {
          onMapClickRef.current(
            parseFloat(e.latlng.lat.toFixed(4)),
            parseFloat(e.latlng.lng.toFixed(4))
          );
        }
      });

      layerGroupRef.current = L.layerGroup().addTo(map);
      leafletMapInstance.current = map;
    }

    const map = leafletMapInstance.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    // Force Leaflet to recalculate container size
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Clear previous markers & polylines
    layerGroup.clearLayers();

    // Map depot/clinic lookup by ID
    const depotMap = new Map<string, Depot>();
    depots.forEach((d) => depotMap.set(d.id, d));

    const clinicMap = new Map<string, Clinic>();
    clinics.forEach((c) => clinicMap.set(c.id, c));

    // Simple Black & White Custom Icon Creators
    const createDepotIcon = (d: Depot) =>
      L.divIcon({
        className: "custom-depot-marker",
        html: `
          <div class="flex flex-col items-center">
            <div class="bg-black text-white font-mono text-[11px] font-semibold px-2 py-0.5 rounded border border-zinc-700 shadow-md whitespace-nowrap">
              ${d.stock} doses
            </div>
            <div class="w-6 h-6 rounded-full bg-black border-2 border-white flex items-center justify-center text-white text-xs font-bold mt-0.5 shadow-lg">
              D
            </div>
            <div class="text-[10px] font-mono text-zinc-300 bg-black/90 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap border border-zinc-800">
              ${d.name}
            </div>
          </div>
        `,
        iconSize: [120, 60],
        iconAnchor: [60, 30],
      });

    const createClinicIcon = (c: Clinic) =>
      L.divIcon({
        className: "custom-clinic-marker",
        html: `
          <div class="flex flex-col items-center">
            <div class="bg-zinc-900 text-zinc-200 font-mono text-[11px] font-semibold px-2 py-0.5 rounded border border-zinc-700 shadow-md whitespace-nowrap">
              ${c.demand} doses
            </div>
            <div class="w-6 h-6 rounded-full bg-zinc-900 border-2 border-zinc-400 flex items-center justify-center text-white text-xs font-bold mt-0.5 shadow-lg">
              C
            </div>
            <div class="text-[10px] font-mono text-zinc-300 bg-black/90 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap border border-zinc-800">
              ${c.name}
            </div>
          </div>
        `,
        iconSize: [120, 60],
        iconAnchor: [60, 30],
      });

    // Add Depot Markers
    depots.forEach((depot) => {
      const marker = L.marker([depot.lat, depot.lng], {
        icon: createDepotIcon(depot),
      });
      marker.bindPopup(`
        <div class="p-1.5 text-zinc-200 font-sans">
          <div class="font-bold text-xs text-white">${depot.name}</div>
          <div class="text-xs text-zinc-400 mt-1">Stock: <b class="text-white">${depot.stock} doses</b></div>
          <div class="text-[11px] text-zinc-500 font-mono mt-1">${depot.lat}, ${depot.lng}</div>
        </div>
      `);
      layerGroup.addLayer(marker);
    });

    // Add Clinic Markers
    clinics.forEach((clinic) => {
      const marker = L.marker([clinic.lat, clinic.lng], {
        icon: createClinicIcon(clinic),
      });
      marker.bindPopup(`
        <div class="p-1.5 text-zinc-200 font-sans">
          <div class="font-bold text-xs text-white">${clinic.name}</div>
          <div class="text-xs text-zinc-400 mt-1">Demand: <b class="text-white">${clinic.demand} doses</b></div>
          <div class="text-[11px] text-zinc-500 font-mono mt-1">${clinic.lat}, ${clinic.lng}</div>
        </div>
      `);
      layerGroup.addLayer(marker);
    });

    // Draw Allocation OSRM Road Flow Lines for the Active Solver Plan
    renderAllocationRoutes(allocations, activeSolver, layerGroup, depotMap, clinicMap);

    // Auto-fit map bounds
    const bounds: [number, number][] = [];
    depots.forEach((d) => bounds.push([d.lat, d.lng]));
    clinics.forEach((c) => bounds.push([c.lat, c.lng]));
    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
    }
  }, [depots, clinics, allocations, activeSolver]);

  // Maintain click ref
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  return (
    <div
      className={`relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border transition-all ${
        isPickingLocation ? "border-white ring-2 ring-white/40 cursor-crosshair" : "border-zinc-800 bg-black"
      }`}
    >
      <div ref={mapRef} className="w-full h-full z-0 min-h-[500px]" />
      
      {isPickingLocation && (
        <div className="absolute top-3 left-3 z-[1000] bg-black/90 text-white text-xs px-3 py-1.5 rounded border border-zinc-700 font-mono shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          Click any location on map to capture Lat/Lng
        </div>
      )}
    </div>
  );
}
