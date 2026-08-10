from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field

class Depot(BaseModel):
    id: str = Field(..., description="Unique depot identifier")
    name: str = Field(..., description="Depot / Warehouse name")
    stock: int = Field(..., description="Vaccine stock quantity available (doses)")
    lat: float = Field(..., description="Latitude coordinate")
    lng: float = Field(..., description="Longitude coordinate")

class Clinic(BaseModel):
    id: str = Field(..., description="Unique clinic identifier")
    name: str = Field(..., description="Clinic / Health center name")
    demand: int = Field(..., description="Vaccine demand quantity required (doses)")
    lat: float = Field(..., description="Latitude coordinate")
    lng: float = Field(..., description="Longitude coordinate")

class AllocationRoute(BaseModel):
    depot_id: str
    depot_name: str
    clinic_id: str
    clinic_name: str
    allocated_doses: int
    distance_km: float
    cost: float
    geometry: Optional[List[List[float]]] = Field(None, description="Array of [lat, lng] road polyline waypoints from OSRM")

class SolverResult(BaseModel):
    solver_name: str
    solver_type: str  # "quantum" or "classical"
    solve_time_ms: float
    total_cost: float
    unmet_demand: int
    qubit_count: Optional[int] = None
    qubo_energy: Optional[float] = None
    status: str
    allocations: List[AllocationRoute]

class OptimizationRequest(BaseModel):
    depots: Optional[List[Depot]] = None
    clinics: Optional[List[Clinic]] = None

class ComparativeSummary(BaseModel):
    cost_difference: float
    time_ratio: str
    verdict: str

class OptimizationResponse(BaseModel):
    district_name: str
    depots: List[Depot]
    clinics: List[Clinic]
    quantum_result: SolverResult
    classical_result: SolverResult
    comparison_summary: ComparativeSummary
