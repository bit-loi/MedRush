"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale, Cpu, Activity, Building2, Package, FileText } from "lucide-react";

export interface SolverResult {
  solver_name: string;
  solver_type: "quantum" | "classical";
  solve_time_ms: number;
  routing_time_ms?: number;
  total_cost: number;
  penalty_cost?: number;
  unmet_demand: number;
  qubit_count?: number;
  qubo_energy?: number;
  status: string;
  allocations: {
    depot_id: string;
    depot_name: string;
    clinic_id: string;
    clinic_name: string;
    allocated_doses: number;
    distance_km: number;
    cost: number;
  }[];
}

export interface ComparativeSummary {
  cost_difference: number;
  time_ratio: string;
  verdict: string;
}

interface ComparisonCardsProps {
  quantumResult: SolverResult | null;
  classicalResult: SolverResult | null;
  comparisonSummary: ComparativeSummary | null;
  activeSolver: "quantum" | "classical";
  setActiveSolver: (solver: "quantum" | "classical") => void;
}

export default function ComparisonCards({
  quantumResult,
  classicalResult,
  comparisonSummary,
  activeSolver,
  setActiveSolver,
}: ComparisonCardsProps) {
  if (!quantumResult || !classicalResult) return null;

  return (
    <div className="space-y-6 font-sans text-zinc-100">
      {/* Top Verdict Card */}
      {comparisonSummary && (
        <Card className="bg-[#0c0c0e] border-zinc-800/80">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="relative flex aspect-square size-10 shrink-0 rounded-full border border-zinc-700/60 before:absolute before:-inset-1 before:rounded-full before:border before:border-zinc-800/40">
                <Scale className="m-auto size-4 text-white" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Benchmarking Verdict & Analysis
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                  {comparisonSummary.verdict}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="bg-[#141417] text-zinc-300 border border-zinc-800 px-2.5 py-1 rounded text-xs font-mono">
                    {comparisonSummary.time_ratio}
                  </span>
                  <span className="bg-[#141417] text-zinc-300 border border-zinc-800 px-2.5 py-1 rounded text-xs font-mono">
                    Cost Delta: {comparisonSummary.cost_difference >= 0 ? `+$${comparisonSummary.cost_difference.toLocaleString()}` : `-$${Math.abs(comparisonSummary.cost_difference).toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Side-by-Side Solver Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QAOA Quantum Card */}
        <Card
          onClick={() => setActiveSolver("quantum")}
          className={`cursor-pointer transition-all bg-[#0c0c0e] border ${
            activeSolver === "quantum"
              ? "border-white ring-1 ring-white/20 bg-[#121215]"
              : "border-zinc-800/80 hover:border-zinc-700"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
              <div className="relative flex aspect-square size-9 rounded-full border border-zinc-700/60 before:absolute before:-inset-1 before:rounded-full before:border before:border-zinc-800/40">
                <Cpu className="m-auto size-4 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-white">
                  Quantum QAOA Solver
                </CardTitle>
                <CardDescription className="text-[11px] text-zinc-400 mt-0.5">
                  NumPy Statevector Engine
                </CardDescription>
              </div>
            </div>
            <span className="bg-[#141417] text-zinc-300 text-[11px] px-2.5 py-0.5 rounded border border-zinc-800 font-mono">
              15 Qubits
            </span>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-[#141417] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 font-mono">Pure Solve Time</span>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {quantumResult.solve_time_ms} ms
                </div>
                {quantumResult.routing_time_ms !== undefined && (
                  <div className="text-[10px] text-zinc-500 font-mono mt-1">
                    + {quantumResult.routing_time_ms} ms OSRM route
                  </div>
                )}
              </div>

              <div className="bg-[#141417] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 font-mono">Total Cost</span>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  ${quantumResult.total_cost.toLocaleString()}
                </div>
                {(quantumResult.penalty_cost ?? 0) > 0 && (
                  <div className="text-[10px] text-amber-400 font-mono mt-1">
                    incl. ${quantumResult.penalty_cost?.toLocaleString()} unmet penalty
                  </div>
                )}
              </div>

              <div className="bg-[#141417] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 font-mono">Qubit Count</span>
                <div className="text-sm font-semibold text-zinc-200 font-mono mt-0.5">
                  {quantumResult.qubit_count ?? 15} qubits
                </div>
              </div>

              <div className="bg-[#141417] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 font-mono">Unmet Demand</span>
                <div className="text-sm font-semibold text-zinc-200 font-mono mt-0.5">
                  {quantumResult.unmet_demand} doses
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classical ILP Card */}
        <Card
          onClick={() => setActiveSolver("classical")}
          className={`cursor-pointer transition-all bg-[#0c0c0e] border ${
            activeSolver === "classical"
              ? "border-white ring-1 ring-white/20 bg-[#121215]"
              : "border-zinc-800/80 hover:border-zinc-700"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
              <div className="relative flex aspect-square size-9 rounded-full border border-zinc-700/60 before:absolute before:-inset-1 before:rounded-full before:border before:border-zinc-800/40">
                <Activity className="m-auto size-4 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-white">
                  Classical Baseline (ILP)
                </CardTitle>
                <CardDescription className="text-[11px] text-zinc-400 mt-0.5">
                  PuLP CBC Solver
                </CardDescription>
              </div>
            </div>
            <span className="bg-[#141417] text-zinc-300 text-[11px] px-2.5 py-0.5 rounded border border-zinc-800 font-mono">
              PuLP CBC
            </span>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-[#141417] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 font-mono">Pure Solve Time</span>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {classicalResult.solve_time_ms} ms
                </div>
                {classicalResult.routing_time_ms !== undefined && (
                  <div className="text-[10px] text-zinc-500 font-mono mt-1">
                    + {classicalResult.routing_time_ms} ms OSRM route
                  </div>
                )}
              </div>

              <div className="bg-[#141417] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 font-mono">Total Cost</span>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  ${classicalResult.total_cost.toLocaleString()}
                </div>
              </div>

              <div className="bg-[#141417] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 font-mono">Variables</span>
                <div className="text-sm font-semibold text-zinc-200 font-mono mt-0.5">
                  {classicalResult.allocations.length * 3} binary vars
                </div>
              </div>

              <div className="bg-[#141417] p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 font-mono">Unmet Demand</span>
                <div className="text-sm font-semibold text-zinc-200 font-mono mt-0.5">
                  {classicalResult.unmet_demand} doses
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Solver Route Allocation Table */}
      <Card className="bg-[#0c0c0e] border-zinc-800/80">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-zinc-400" strokeWidth={1.5} />
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-300">
              Active Plan Routes ({activeSolver === "quantum" ? "QAOA Quantum" : "Classical ILP"})
            </CardTitle>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {activeSolver === "quantum" ? quantumResult.allocations.length : classicalResult.allocations.length} Active Routes
          </span>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-400 font-mono uppercase">
                  <th className="py-2.5 px-3">Supply Depot</th>
                  <th className="py-2.5 px-3">Target Clinic</th>
                  <th className="py-2.5 px-3">Allocated Doses</th>
                  <th className="py-2.5 px-3">Distance (km)</th>
                  <th className="py-2.5 px-3 text-right">Logistics Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300">
                {(activeSolver === "quantum" ? quantumResult : classicalResult).allocations.map(
                  (route, idx) => (
                    <tr key={idx} className="hover:bg-[#141417] transition-colors">
                      <td className="py-2.5 px-3 font-sans font-medium text-zinc-200 flex items-center gap-2">
                        <Package className="size-3.5 text-zinc-400" strokeWidth={1.5} /> {route.depot_name}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-zinc-200">
                        <span className="inline-flex items-center gap-2">
                          <Building2 className="size-3.5 text-zinc-400" strokeWidth={1.5} /> {route.clinic_name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {route.allocated_doses} doses
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400">
                        {route.distance_km} km
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-white">
                        ${route.cost.toLocaleString()}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
