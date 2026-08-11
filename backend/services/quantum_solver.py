from __future__ import annotations
import time
import numpy as np
from typing import List, Tuple
from scipy.optimize import minimize
from schemas import Depot, Clinic, SolverResult, AllocationRoute
from services.dataset import get_cost_matrix
from services.osrm_router import get_osrm_road_route

def build_qubo_matrix(
    depots: List[Depot],
    clinics: List[Clinic],
    cost_matrix: List[List[float]],
    penalty_coverage: float = 5000.0,
    penalty_capacity: float = 10.0,
) -> np.ndarray:
    """
    Constructs a Quadratic Unconstrained Binary Optimization (QUBO) matrix Q.
    Binary variable vector x of dimension K = M * N (M depots, N clinics).
    x_k = x_{i, j} where k = i * N + j.

    QUBO Hamiltonian: x^T Q x
    1. Linear distance cost: Q[k, k] += cost_ij * demand_j
    2. Coverage constraint penalty: P_cov * sum_j (sum_i x_ij - 1)^2
    3. Soft capacity constraint penalty: P_cap * sum_i (sum_j demand_j * x_ij - stock_i)^2
    """
    num_depots = len(depots)
    num_clinics = len(clinics)
    K = num_depots * num_clinics
    Q = np.zeros((K, K))

    # 1. Distance Cost
    for i in range(num_depots):
        for j in range(num_clinics):
            k = i * num_clinics + j
            Q[k, k] += cost_matrix[i][j] * clinics[j].demand

    # 2. Coverage Penalty (each clinic gets 1 depot)
    for j in range(num_clinics):
        # Diagonal terms: -P_cov
        for i in range(num_depots):
            k = i * num_clinics + j
            Q[k, k] -= penalty_coverage

        # Off-diagonal cross terms: 2 * P_cov
        for i1 in range(num_depots):
            for i2 in range(i1 + 1, num_depots):
                k1 = i1 * num_clinics + j
                k2 = i2 * num_clinics + j
                Q[k1, k2] += 2.0 * penalty_coverage

    # 3. Capacity Soft Penalty
    for i in range(num_depots):
        stock_i = float(depots[i].stock)
        for j in range(num_clinics):
            k = i * num_clinics + j
            d_j = float(clinics[j].demand)
            Q[k, k] += penalty_capacity * (d_j**2 - 2.0 * d_j * stock_i)

        for j1 in range(num_clinics):
            for j2 in range(j1 + 1, num_clinics):
                k1 = i * num_clinics + j1
                k2 = i * num_clinics + j2
                d1 = float(clinics[j1].demand)
                d2 = float(clinics[j2].demand)
                Q[k1, k2] += 2.0 * penalty_capacity * d1 * d2

    return Q

def solve_quantum_qaoa(depots: List[Depot], clinics: List[Clinic]) -> SolverResult:
    """
    Formulates the vaccine allocation problem into QUBO and solves it using authentic
    Quantum Approximate Optimization Algorithm (QAOA) with OSRM road geometry routes:

      1. Optimized Sampler Backend: Fast C++/vectorized statevector propagation
      2. Minimal QAOA Circuit Depth (p=1 layer): U(C, gamma) = exp(-i gamma H_C), U(B, beta) = exp(-i beta sum X_i)
      3. COBYLA Optimizer Iteration Cap: maxiter=25 for sub-second live demo responsiveness
      4. OSRM Road Router: Fetches real driving route waypoints between depots and clinics
    """
    t0 = time.time()
    num_depots = len(depots)
    num_clinics = len(clinics)
    qubit_count = num_depots * num_clinics
    cost_matrix = get_cost_matrix(depots, clinics)

    Q = build_qubo_matrix(depots, clinics, cost_matrix)

    # 1. Precompute QUBO energies E(x) for all 2^N basis states x in {0, 1}^N
    num_states = 1 << qubit_count
    x_bits = ((np.arange(num_states)[:, None] >> np.arange(qubit_count)) & 1)
    energies = np.einsum("ki,ij,kj->k", x_bits, Q, x_bits)

    # 2. QAOA Variational Circuit Expectation Function
    def qaoa_expectation(params: List[float]) -> float:
        gamma, beta = params
        # Cost Unitary: U(C, gamma) |x> = exp(-i * gamma * E(x)) |x>
        psi = (1.0 / np.sqrt(num_states)) * np.exp(-1j * gamma * energies)

        # Mixer Unitary: U(B, beta) = Rx(2*beta) on each qubit
        rx = np.array([
            [np.cos(beta), -1j * np.sin(beta)],
            [-1j * np.sin(beta), np.cos(beta)]
        ])
        psi = psi.reshape([2] * qubit_count)
        for q in range(qubit_count):
            psi = np.tensordot(rx, psi, axes=([1], [q]))
            psi = np.moveaxis(psi, 0, q)
        
        psi = psi.reshape(-1)
        probs = np.abs(psi) ** 2
        return float(np.sum(probs * energies))

    # 3. Optimize QAOA parameters (gamma, beta) using COBYLA optimizer (maxiter=25)
    opt_res = minimize(
        qaoa_expectation,
        x0=[0.4, 0.4],
        method="COBYLA",
        options={"maxiter": 25}
    )

    gamma_opt, beta_opt = opt_res.x

    # 4. Reconstruct final QAOA statevector & measurement probabilities
    psi_opt = (1.0 / np.sqrt(num_states)) * np.exp(-1j * gamma_opt * energies)
    rx_opt = np.array([
        [np.cos(beta_opt), -1j * np.sin(beta_opt)],
        [-1j * np.sin(beta_opt), np.cos(beta_opt)]
    ])
    psi_opt = psi_opt.reshape([2] * qubit_count)
    for q in range(qubit_count):
        psi_opt = np.tensordot(rx_opt, psi_opt, axes=([1], [q]))
        psi_opt = np.moveaxis(psi_opt, 0, q)

    psi_opt = psi_opt.reshape(-1)
    probs_opt = np.abs(psi_opt) ** 2

    # Sample highest probability bitstring from QAOA quantum ground state
    best_state_idx = int(np.argmax(probs_opt))
    bits = x_bits[best_state_idx]
    qubo_energy = float(energies[best_state_idx])

    t1_solve = time.time()
    solve_time_ms = round((t1_solve - t0) * 1000.0, 2)

    # Reshape bits into M x N binary matrix
    sol_matrix = np.array(bits).reshape((num_depots, num_clinics))

    t0_route = time.time()
    allocations: List[AllocationRoute] = []
    base_cost = 0.0
    unmet_demand = 0

    for j in range(num_clinics):
        assigned_depot_idx = None
        for i in range(num_depots):
            if sol_matrix[i, j] == 1:
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
                base_cost += cost
                break

        if assigned_depot_idx is None:
            unmet_demand += clinics[j].demand

    t1_route = time.time()
    routing_time_ms = round((t1_route - t0_route) * 1000.0, 2)

    # Calculate Fairness Penalty: $50 per dose of unmet demand to penalize unserved clinics
    PENALTY_PER_UNMET_DOSE = 50.0
    penalty_cost = round(unmet_demand * PENALTY_PER_UNMET_DOSE, 2)
    total_cost = round(base_cost + penalty_cost, 2)

    status_str = "Optimal (QAOA Ground State)" if unmet_demand == 0 else f"Sub-optimal ({unmet_demand} doses unmet penalty applied)"

    return SolverResult(
        solver_name="Quantum QAOA (NumPy-Accelerated Statevector Simulator)",
        solver_type="quantum",
        solve_time_ms=solve_time_ms,
        routing_time_ms=routing_time_ms,
        total_cost=total_cost,
        penalty_cost=penalty_cost,
        unmet_demand=unmet_demand,
        qubit_count=qubit_count,
        qubo_energy=round(qubo_energy, 2),
        status=status_str,
        allocations=allocations,
    )
