import math
from typing import Tuple, List
import numpy as np


class GeometryCalculator:    
    EARTH_RADIUS_M = 6371000.0
    
    @staticmethod
    def haversine(
        point_a: Tuple[float, float], 
        point_b: Tuple[float, float]
    ) -> float:
        lat1, lon1 = point_a
        lat2, lon2 = point_b
        
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        
        sin_half_dphi = math.sin(dphi / 2.0)
        sin_half_dlambda = math.sin(dlambda / 2.0)
        
        a = sin_half_dphi**2 + math.cos(phi1) * math.cos(phi2) * sin_half_dlambda**2
        c = 2 * math.asin(math.sqrt(a))
        
        return GeometryCalculator.EARTH_RADIUS_M * c
    
    @staticmethod
    def to_cartesian_3d(point: Tuple[float, float]) -> List[float]:
        lat, lon = point
        lat_rad = math.radians(lat)
        lon_rad = math.radians(lon)
        
        return [
            math.cos(lat_rad) * math.cos(lon_rad),
            math.cos(lat_rad) * math.sin(lon_rad),
            math.sin(lat_rad)
        ]
    
    @staticmethod
    def compute_distance_matrix(
        points: List[Tuple[float, float]]
    ) -> np.ndarray:
        n = len(points)
        dist_matrix = np.zeros((n, n), dtype=float)
        
        for i in range(n):
            for j in range(i + 1, n):
                distance = GeometryCalculator.haversine(points[i], points[j])
                dist_matrix[i, j] = dist_matrix[j, i] = distance
        
        return dist_matrix
