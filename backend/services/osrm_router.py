from __future__ import annotations
import urllib.request
import json
from typing import List, Dict, Tuple

# In-memory geometry cache to avoid duplicate OSRM API calls & rate limits
_OSRM_CACHE: Dict[Tuple[float, float, float, float], List[List[float]]] = {}

def get_osrm_road_route(
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float,
) -> List[List[float]]:
    """
    Queries OSRM (Open Source Routing Machine) public demo server API to fetch
    real road-following driving geometry between start and end coordinates.

    Returns:
        List of [lat, lng] coordinates following actual road network.
        Falls back to straight line [[start_lat, start_lng], [end_lat, end_lng]] if OSRM is unreachable.
    """
    key = (round(start_lat, 4), round(start_lng, 4), round(end_lat, 4), round(end_lng, 4))
    if key in _OSRM_CACHE:
        return _OSRM_CACHE[key]

    url = f"http://router.project-osrm.org/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}?overview=full&geometries=geojson"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MedRush-Quantum-Logistics/1.0"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
                coords = data["routes"][0]["geometry"]["coordinates"]
                # Convert OSRM GeoJSON [lng, lat] to Leaflet [lat, lng]
                lat_lng_polyline = [[c[1], c[0]] for c in coords]
                _OSRM_CACHE[key] = lat_lng_polyline
                return lat_lng_polyline
    except Exception as err:
        print(f"OSRM routing fallback for ({start_lat},{start_lng}) -> ({end_lat},{end_lng}): {err}")

    # Fallback to straight line
    fallback = [[start_lat, start_lng], [end_lat, end_lng]]
    _OSRM_CACHE[key] = fallback
    return fallback
