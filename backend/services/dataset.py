from __future__ import annotations
import numpy as np
from typing import List, Tuple
from schemas import Depot, Clinic

DEFAULT_DISTRICT_NAME = "Regional Medical Vaccine Supply Network"

DEFAULT_DEPOTS: List[Depot] = [
    Depot(
        id="depot-1",
        name="Central Medical Logistics Hub",
        stock=600,
        lat=37.7749,
        lng=-122.4194
    ),
    Depot(
        id="depot-2",
        name="North Regional Distribution Depot",
        stock=500,
        lat=37.8044,
        lng=-122.2712
    ),
    Depot(
        id="depot-3",
        name="East Logistics Hub",
        stock=450,
        lat=37.6879,
        lng=-122.1599
    ),
]

DEFAULT_CLINICS: List[Clinic] = [
    Clinic(
        id="clinic-1",
        name="Metro Community Health Clinic",
        demand=200,
        lat=37.7690,
        lng=-122.4480
    ),
    Clinic(
        id="clinic-2",
        name="Valley Regional Care Center",
        demand=250,
        lat=37.8200,
        lng=-122.2500
    ),
    Clinic(
        id="clinic-3",
        name="Northern Health Station",
        demand=180,
        lat=37.8700,
        lng=-122.2700
    ),
    Clinic(
        id="clinic-4",
        name="Eastern Community Care",
        demand=220,
        lat=37.7000,
        lng=-122.1800
    ),
    Clinic(
        id="clinic-5",
        name="Harbor View Health Center",
        demand=190,
        lat=37.7300,
        lng=-122.3800
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
