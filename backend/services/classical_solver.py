from __future__ import annotations
import time
import pulp
from typing import List
from schemas import Depot, Clinic, SolverResult, AllocationRoute
from services.dataset import get_cost_matrix
from services.osrm_router import get_osrm_road_route

def solve_classical_ilp(depots: List[Depot], clinics: List[Clinic]) -> SolverResult:
    """
    Solves the vaccine allocation logistics problem using PuLP Integer Linear Programming (ILP).
    Minimizes: sum(cost_ij * demand_j * x_ij)
    Subject to:
      1. sum_i x_ij == 1 (Each clinic assigned to exactly one supply depot)
      2. sum_j (demand_j * x_ij) <= stock_i (Depot stock limit)
    """
    t0 = time.time()
    cost_matrix = get_cost_matrix(depots, clinics)
    num_depots = len(depots)
    num_clinics = len(clinics)

    prob = pulp.LpProblem("Vaccine_Distribution_Classical_ILP", pulp.LpMinimize)

    # Decision variables x_{i,j} in {0, 1}
    x = {}
    for i in range(num_depots):
        for j in range(num_clinics):
            x[i, j] = pulp.LpVariable(f"x_{i}_{j}", cat="Binary")

    # Objective Function
    prob += pulp.lpSum(
        cost_matrix[i][j] * clinics[j].demand * x[i, j]
        for i in range(num_depots)
        for j in range(num_clinics)
    )

    # Constraint 1: Clinic assignment (coverage)
    for j in range(num_clinics):
        prob += (
            pulp.lpSum(x[i, j] for i in range(num_depots)) == 1,
            f"Clinic_{j}_Coverage",
        )

    # Constraint 2: Depot capacity constraint
    for i in range(num_depots):
        prob += (
            pulp.lpSum(clinics[j].demand * x[i, j] for j in range(num_clinics)) <= depots[i].stock,
            f"Depot_{i}_Capacity",
        )

    # Solve using COIN-OR CBC Solver (bundled with PuLP)
    status_code = prob.solve(pulp.PULP_CBC_CMD(msg=False))
    t1 = time.time()

    allocations: List[AllocationRoute] = []
    total_cost = 0.0
    unmet_demand = 0

    for j in range(num_clinics):
        assigned_depot_idx = None
        for i in range(num_depots):
            val = pulp.value(x[i, j])
            if val is not None and val > 0.5:
                assigned_depot_idx = i
                dist = cost_matrix[i][j]
                cost = dist * clinics[j].demand
                
                # Fetch OSRM road geometry route
                road_geometry = get_osrm_road_route(
                    depots[i].lat, depots[i].lng,
                    clinics[j].lat, clinics[j].lng
                )

                allocations.append(
                    AllocationRoute(
                        depot_id=depots[i].id,
                        depot_name=depots[i].name,
                        clinic_id=clinics[j].id,
                        clinic_name=clinics[j].name,
                        allocated_doses=clinics[j].demand,
                        distance_km=round(dist, 2),
                        cost=round(cost, 2),
                        geometry=road_geometry,
                    )
                )
                total_cost += cost
                break

        if assigned_depot_idx is None:
            unmet_demand += clinics[j].demand

    solve_time_ms = round((t1 - t0) * 1000.0, 2)
    status_str = pulp.LpStatus[status_code]

    return SolverResult(
        solver_name="Classical Baseline (PuLP ILP)",
        solver_type="classical",
        solve_time_ms=solve_time_ms,
        total_cost=round(total_cost, 2),
        unmet_demand=unmet_demand,
        qubit_count=None,
        qubo_energy=None,
        status=status_str,
        allocations=allocations,
    )
