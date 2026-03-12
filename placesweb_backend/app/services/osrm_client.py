import logging
from typing import List, Tuple, Optional
import numpy as np
import requests

from ..services.cache import SimpleCache
from ..config import config

logger = logging.getLogger(__name__)


class OSRMClient:    
    def __init__(self, base_url: str = None, cache_ttl: int = None):
        self.base_url = base_url or config.OSRM_URL
        self.timeout = config.OSRM_TIMEOUT
        self.route_cache = SimpleCache(cache_ttl or config.CACHE_TTL_SECONDS)
        self.matrix_cache = SimpleCache(cache_ttl or config.CACHE_TTL_SECONDS)
    
    def get_distance_matrix(
        self, 
        points: List[Tuple[float, float]]
    ) -> Optional[np.ndarray]:
        if len(points) > config.OSRM_TABLE_BATCH:
            logger.info(f"Too many points ({len(points)}) for single OSRM table request")
            return None
        
        cache_key = ("table_foot", tuple(points))
        cached = self.matrix_cache.get(cache_key)
        if cached is not None:
            return cached
        
        locations = ";".join([f"{lon},{lat}" for lat, lon in points])
        url = f"{self.base_url}/table/v1/foot/{locations}?annotations=distance"
        
        try:
            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            if data.get("code") != "Ok":
                logger.warning(f"OSRM table returned: {data.get('code')}")
                return None
            
            distances = data.get("distances")
            if distances is None:
                return None
            
            matrix = np.array(distances, dtype=float)
            self.matrix_cache.set(cache_key, matrix)
            return matrix
            
        except requests.RequestException as e:
            logger.warning(f"OSRM table request failed: {e}")
            return None
    
    def get_route_geometry(
        self, 
        point_a: Tuple[float, float], 
        point_b: Tuple[float, float]
    ) -> Optional[List[Tuple[float, float]]]:
        cache_key = ("route_foot", point_a, point_b)
        cached = self.route_cache.get(cache_key)
        if cached is not None:
            return cached
        
        lonlat = f"{point_a[1]},{point_a[0]};{point_b[1]},{point_b[0]}"
        url = f"{self.base_url}/route/v1/foot/{lonlat}?overview=full&geometries=geojson"
        
        try:
            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            if data.get("code") == "Ok" and data.get("routes"):
                coords = data["routes"][0]["geometry"]["coordinates"]
                geometry = [(c[1], c[0]) for c in coords]
                self.route_cache.set(cache_key, geometry)
                return geometry
                
        except requests.RequestException as e:
            logger.debug(f"OSRM route failed {point_a}->{point_b}: {e}")
        
        return None
