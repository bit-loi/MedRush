# MedRush: Quantum Optimized Vaccine Distribution Demo

An end-to-end prototype demonstrating quantum optimization applied to regional vaccine supply chain logistics. The system formulates the allocation problem as a **Quadratic Unconstrained Binary Optimization (QUBO)** problem, solves it using a **NumPy-Accelerated QAOA Statevector Simulator**, benchmarks the result against a **classical Integer Linear Programming (PuLP ILP)** baseline, and visualizes the allocation routes on an interactive **Leaflet map using CARTO Dark Matter tiles**.

---

## Project Overview

In regional public health logistics, vaccine supply from central hubs must be allocated to regional health clinics to meet local immunization demand while minimizing total transport distance and cost, subject to depot inventory stock constraints.

- **Primary Purpose**: Interactive **Benchmarking & Comparison Tool** comparing NISQ-era Quantum Optimization (QAOA QUBO) against exact Classical Solvers (PuLP ILP).
- **Problem Scope**: Regional Medical Network (3 Supply Depots, 5 Clinics).
- **Quantum Solver**: NumPy-Accelerated QAOA Statevector Simulator (Vectorized C-extension matrix propagation).
- **Classical Baseline**: PuLP Integer Linear Programming (COIN-OR CBC Solver).
- **Map Visualization**: Leaflet.js with **CARTO Dark Matter** raster tiles & real OSRM road geometry.
- **Backend API**: Python FastAPI.
- **Frontend Dashboard**: Next.js 15, React 19, Tailwind CSS.

> [!NOTE]
> **Core Purpose: Educational Benchmarking Tool**  
> MedRush is built primarily as an **educational and analytical comparison tool**. Rather than claiming quantum advantage on NISQ-era hardware, MedRush serves as an empirical testbed to evaluate how Quadratic Unconstrained Binary Optimization (QUBO) penalty terms perform side-by-side against exact classical Integer Linear Programming (ILP) baselines.

---

## QUBO Mathematical Formulation

The allocation problem is formulated as a binary optimization problem with decision variables:

$$x_{i,j} \in \{0, 1\}$$

where $x_{i,j} = 1$ if **Depot $i$** is assigned to supply **Clinic $j$**, and $0$ otherwise.

### 1. Logistics Distance Objective
Minimizes total transport distance scaled by clinic demand:

$$\min \sum_{i=1}^{M} \sum_{j=1}^{N} c_{i,j} \cdot d_j \cdot x_{i,j}$$

where $c_{i,j}$ is the distance (in km) between Depot $i$ and Clinic $j$, and $d_j$ is the vaccine demand of Clinic $j$.

### 2. Clinic Coverage Constraint (Hard Penalty)
Ensures every clinic is assigned to exactly one supply depot:

$$P_{\text{cov}} \sum_{j=1}^{N} \left( \sum_{i=1}^{M} x_{i,j} - 1 \right)^2$$

### 3. Depot Capacity Constraint (Soft Penalty)
Ensures total allocated doses from Depot $i$ do not exceed available stock $S_i$:

$$P_{\text{cap}} \sum_{i=1}^{M} \left( \sum_{j=1}^{N} d_j x_{i,j} - S_i \right)^2$$

### 4. Fairness Unmet Demand Penalty
To enforce fair side-by-side benchmarking, if QAOA ground state sampling leaves any clinic unserved ($u_j = 1$), a penalty cost of **$50.00 per unmet dose** is added to the reported `total_cost`:

$$\text{Total Cost} = \text{Base Transport Cost} + \sum_{j \in \text{unserved}} 50.0 \cdot d_j$$

### 5. Ising Spin Hamiltonian Transformation
Binary variables $x_k$ are mapped to Pauli Z spin operators $Z_k \in \{-1, +1\}$ via:

$$x_k = \frac{1 - Z_k}{2}$$

yielding an Ising Hamiltonian $H = \sum_k w_k Z_k + \sum_{k < l} w_{kl} Z_k Z_l$ solved by QAOA variational circuit optimization.

---

## Qubit Count & Problem Scaling

- **Qubit Formula**: $K = M \times N$ binary variables.
- **Current Demo Instance**: $3 \text{ Depots} \times 5 \text{ Clinics} = 15 \text{ Qubits}$.
- **Scaling Reason**: Keeping the qubit count at 15 allows the QAOA statevector variational circuit simulation ($2^{15} = 32,768$ quantum amplitudes) to execute in **~200-300 milliseconds** on standard CPUs without hardware queue delays or simulator timeouts.

---

## Honest Performance & Benchmarking Verdict

| Metric | Classical Baseline (PuLP ILP) | Quantum Simulation (QAOA QUBO) |
| :--- | :--- | :--- |
| **Solver Technology** | Branch-and-Bound (COIN-OR CBC) | NumPy-Accelerated QAOA Statevector Engine |
| **Pure Solve Time** | **~15 - 20 ms** | **~200 - 280 ms** |
| **OSRM Route Latency** | ~40 - 70 ms (Network) | ~40 - 70 ms (Network) |
| **Optimal Solution Cost** | **$11,681.86** (Global Optimum) | **$15,717.64** (incl. Unmet Penalty Delta) |
| **Qubit / Variable Count** | 15 Binary Variables | 15 Qubits |
| **Constraint Status** | 100% Satisfied | Satisfied with soft penalty gap |

### Key Takeaway
MedRush functions as an empirical **benchmarking and comparison tool**. At 15 qubits, classical Integer Linear Programming (PuLP ILP) remains superior in exact constraint enforcement and global optimality. The system allows users and researchers to quantitatively compare the trade-offs, soft penalty gaps, and execution speeds of quantum NISQ-era algorithms against established classical baselines.

---

## Quickstart Guide

### 1. Run the Backend API

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8003
```

Verify backend health:
```bash
curl http://127.0.0.1:8003/health
```

### 2. Run the Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:3000` in your browser.

---

## Project Structure

```
MedRush/
├── backend/
│   ├── main.py                  # FastAPI router (/api/optimize, /api/dataset)
│   ├── schemas.py               # Pydantic data schemas
│   ├── requirements.txt         # Backend Python dependencies
│   └── services/
│       ├── dataset.py           # Karawang district vaccine dataset & Haversine distance
│       ├── osrm_router.py       # OSRM road-following routing engine
│       ├── classical_solver.py  # PuLP ILP classical baseline solver
│       └── quantum_solver.py    # QAOA statevector variational solver
├── frontend/
│   ├── app/                     # Next.js App Router (page.tsx, layout.tsx)
│   ├── components/
│   │   ├── ui/
│   │   │   └── card.tsx         # Primitive Shadcn Card component
│   │   └── dashboard/
│   │       ├── MapComponent.tsx     # Leaflet map with CARTO Dark Matter & OSRM polylines
│   │       ├── ComparisonCards.tsx  # Benchmarking cards & route breakdown table
│   │       └── LocationManager.tsx  # Interactive location editor & map-click picker
│   └── package.json
└── README.md
```
