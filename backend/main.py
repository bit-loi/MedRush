from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    Depot,
    Clinic,
    OptimizationRequest,
    OptimizationResponse,
    ComparativeSummary,
)
from services import (
    DEFAULT_DEPOTS,
    DEFAULT_CLINICS,
    DEFAULT_DISTRICT_NAME,
    solve_classical_ilp,
    solve_quantum_qaoa,
)

app = FastAPI(
    title="MedRush Quantum Optimization API",
    description="Quantum Optimization (QUBO & QAOA via Qiskit Aer) vs Classical ILP for Vaccine Distribution Logistics.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "*",
    ],
)

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "Quantum Vaccine Optimization API",
        "qiskit_backend": "Qiskit Aer Simulator (Local)",
    }

@app.get("/api/dataset")
def get_default_dataset():
    """Returns the default vaccine supply chain dataset for Karawang District."""
    return {
        "district_name": DEFAULT_DISTRICT_NAME,
        "depots": DEFAULT_DEPOTS,
        "clinics": DEFAULT_CLINICS,
    }

@app.post("/api/optimize", response_model=OptimizationResponse)
def run_optimization(request: OptimizationRequest):
    """
    Executes side-by-side vaccine allocation optimization:
    1. Quantum QUBO & QAOA (via Qiskit Aer Simulator)
    2. Classical Integer Linear Programming (PuLP CBC Solver)
    """
    depots = request.depots if request.depots and len(request.depots) > 0 else DEFAULT_DEPOTS
    clinics = request.clinics if request.clinics and len(request.clinics) > 0 else DEFAULT_CLINICS

    # Run Classical Solver
    classical_res = solve_classical_ilp(depots, clinics)

    # Run Quantum QAOA / QUBO Solver
    quantum_res = solve_quantum_qaoa(depots, clinics)

    # Calculate comparative metrics
    cost_diff = round(quantum_res.total_cost - classical_res.total_cost, 2)
    
    if classical_res.solve_time_ms > 0:
        ratio_val = quantum_res.solve_time_ms / classical_res.solve_time_ms
        time_ratio_str = f"QAOA Pure Solver is {ratio_val:.1f}x solve time compared to Classical ILP ({quantum_res.solve_time_ms:.1f}ms vs {classical_res.solve_time_ms:.1f}ms)"
    else:
        time_ratio_str = "Sub-millisecond comparison"

    if cost_diff == 0:
        verdict = (
            f"QAOA successfully achieved the exact global optimal cost (${quantum_res.total_cost:,.2f}) "
            f"matching the classical baseline on {quantum_res.qubit_count} qubits."
        )
    elif quantum_res.unmet_demand > 0:
        verdict = (
            f"Classical ILP solved in {classical_res.solve_time_ms:.1f} ms with optimal cost ${classical_res.total_cost:,.2f} (100% coverage). "
            f"QAOA yielded cost ${quantum_res.total_cost:,.2f} including ${quantum_res.penalty_cost:,.2f} penalty for {quantum_res.unmet_demand} unmet doses."
        )
    elif cost_diff > 0:
        verdict = (
            f"Classical ILP solved in {classical_res.solve_time_ms:.1f} ms with cost ${classical_res.total_cost:,.2f}. "
            f"QAOA QUBO ground state yielded cost ${quantum_res.total_cost:,.2f} (+${cost_diff:,.2f} penalty/soft constraint gap)."
        )
    else:
        verdict = f"QAOA achieved cost ${quantum_res.total_cost:,.2f}."

    comparison_summary = ComparativeSummary(
        cost_difference=cost_diff,
        time_ratio=time_ratio_str,
        verdict=verdict,
    )

    return OptimizationResponse(
        district_name=DEFAULT_DISTRICT_NAME,
        depots=depots,
        clinics=clinics,
        quantum_result=quantum_res,
        classical_result=classical_res,
        comparison_summary=comparison_summary,
    )
