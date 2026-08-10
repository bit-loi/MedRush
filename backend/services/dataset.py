from __future__ import annotations
import numpy as np
from typing import List, Tuple
from schemas import Depot, Clinic

DEFAULT_DISTRICT_NAME = "Karawang District Vaccine Supply Chain"

DEFAULT_DEPOTS: List[Depot] = [
    Depot(
        id="depot-1",
        name="Karawang Central Hub",
        stock=600,
        lat=-6.3125,
        lng=107.2974
    ),
    Depot(
        id="depot-2",
        name="Cikarang Supply Depot",
        stock=500,
        lat=-6.2911,
        lng=107.1352
    ),
    Depot(
        id="depot-3",
        name="Cikampek Logistics Post",
        stock=450,
        lat=-6.4173,
        lng=107.4560
    ),
]

DEFAULT_CLINICS: List[Clinic] = [
    Clinic(
        id="clinic-1",
        name="Puskesmas Telukjambe",
        demand=200,
        lat=-6.3250,
        lng=107.3010
    ),
    Clinic(
        id="clinic-2",
        name="Puskesmas Klari",
        demand=250,
        lat=-6.3500,
        lng=107.3600
    ),
    Clinic(
        id="clinic-3",
        name="Puskesmas Rengasdengklok",
        demand=180,
        lat=-6.1600,
        lng=107.2900
    ),
    Clinic(
        id="clinic-4",
        name="Puskesmas Majalaya",
        demand=220,
        lat=-6.3400,
        lng=107.4100
    ),
    Clinic(
        id="clinic-5",
        name="Puskesmas Lemahabang",
        demand=190,
        lat=-6.2700,
        lng=107.4400
    ),
]

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates straight-line Haversine distance in kilometers between two lat/lng coordinates."""
    R = 6371.0  # Earth's radius in kilometers
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2.0)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2.0)**2
    c = 2.0 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))
    return float(R * c)

def get_cost_matrix(depots: List[Depot], clinics: List[Clinic]) -> List[List[float]]:
    """Generates cost/distance matrix (in kilometers) between each depot and clinic."""
    matrix = []
    for depot in depots:
        row = []
        for clinic in clinics:
            dist = calculate_haversine_distance(depot.lat, depot.lng, clinic.lat, clinic.lng)
            row.append(dist)
        matrix.append(row)
    return matrix
