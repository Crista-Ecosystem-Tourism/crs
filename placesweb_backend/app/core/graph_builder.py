import logging
from dataclasses import dataclass
from typing import List, Tuple, Dict, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

import numpy as np
import networkx as nx
from scipy.spatial import Delaunay

try:
    from sklearn.neighbors import NearestNeighbors
    HAVE_SKLEARN = True
except ImportError:
    HAVE_SKLEARN = False

from ..core.geometry import GeometryCalculator
from ..services.osrm_client import OSRMClient
from ..utils.metrics import calculate_graph_metrics, pair_key
from ..config import config

logger = logging.getLogger(__name__)


@dataclass
class GraphBuildResult:
    edges: List[Tuple[int, int]]
    connections: List[int]
    routes: Dict[Tuple[int, int], List[Tuple[float, float]]]
    dist_matrix: np.ndarray
    metrics: Dict


class WeightedGraphBuilder:
    def __init__(self, osrm_client: Optional[OSRMClient] = None):
        self.osrm_client = osrm_client or OSRMClient()
        self.geometry = GeometryCalculator()
    
    def build(
        self, 
        points: List[Tuple[float, float]], 
        weights: List[float],
        use_osrm_scoring: bool = False
    ) -> GraphBuildResult:
        num_points = len(points)
        if num_points == 0:
            return GraphBuildResult([], [], {}, np.array([]), {})
        
        logger.info("Computing distance matrix...")
        dist_haversine = self.geometry.compute_distance_matrix(points)
        
        osrm_matrix = None
        if use_osrm_scoring and config.USE_OSRM:
            osrm_matrix = self.osrm_client.get_distance_matrix(points)
            if osrm_matrix is None:
                logger.info("OSRM matrix unavailable, using haversine")
        
        candidates = self._generate_candidates(points, dist_haversine)
        
        candidates = self._add_hub_spokes(
            candidates, points, weights, dist_haversine
        )
        
        edges, connections = self._select_edges(
            points, weights, candidates, dist_haversine, osrm_matrix
        )
        
        edges, connections = self._ensure_connectivity(
            edges, points, connections, dist_haversine
        )
        
        routes, _ = self._fetch_route_geometries(edges, points)
        
        dist_matrix = self._build_distance_matrix(
            dist_haversine, edges, routes
        )
        
        metrics = calculate_graph_metrics(edges, dist_matrix, connections)
        
        return GraphBuildResult(
            edges=edges,
            connections=connections,
            routes=routes,
            dist_matrix=dist_matrix,
            metrics=metrics
        )
    
    def _generate_candidates(
        self,
        points: List[Tuple[float, float]],
        dist_matrix: np.ndarray
    ) -> List[Tuple[int, int]]:
        num_points = len(points)
        candidates = set()
        
        if num_points >= 3:
            try:
                points_3d = np.array([
                    self.geometry.to_cartesian_3d(p) for p in points
                ])
                triangulation = Delaunay(points_3d)
                
                for simplex in triangulation.simplices:
                    for i in range(3):
                        for j in range(i + 1, 3):
                            a, b = simplex[i], simplex[j]
                            if dist_matrix[a, b] <= config.BASE_RADIUS_M:
                                candidates.add(pair_key(a, b))
                                
            except Exception as e:
                logger.info(f"Delaunay failed: {e}, using kNN only")
        
        coords = np.array(points)
        k = min(config.KNN_K + 1, num_points)
        
        if HAVE_SKLEARN:
            nn = NearestNeighbors(n_neighbors=k).fit(coords)
            _, indices = nn.kneighbors(coords)
            for i, neighbors in enumerate(indices):
                for j in neighbors[1:]:
                    candidates.add(pair_key(i, int(j)))
        else:
            # TODO On2 пока что
            for i in range(num_points):
                distances = [(dist_matrix[i, j], j) for j in range(num_points) if i != j]
                distances.sort()
                for _, j in distances[:config.KNN_K]:
                    candidates.add(pair_key(i, j))
        
        return list(candidates)
    
    def _add_hub_spokes(
        self,
        candidates: List[Tuple[int, int]],
        points: List[Tuple[float, float]],
        weights: List[float],
        dist_matrix: np.ndarray
    ) -> List[Tuple[int, int]]:
        hub_threshold = 4.0
        hub_connections = 6
        
        for i, weight in enumerate(weights):
            if weight >= hub_threshold:
                neighbors = sorted(
                    [(j, dist_matrix[i, j]) for j in range(len(points)) if j != i],
                    key=lambda x: x[1]
                )[:hub_connections]
                
                for j, _ in neighbors:
                    candidates.append(pair_key(i, j))
        
        return list(set(candidates))
    
    def _select_edges(
        self,
        points: List[Tuple[float, float]],
        weights: List[float],
        candidates: List[Tuple[int, int]],
        dist_haversine: np.ndarray,
        osrm_matrix: Optional[np.ndarray]
    ) -> Tuple[List[Tuple[int, int]], List[int]]:
        num_points = len(points)
        dist_for_scoring = osrm_matrix if osrm_matrix is not None else dist_haversine
        
        scored_edges = []
        for a, b in candidates:
            avg_weight = (weights[a] + weights[b]) / 2.0
            distance = float(dist_for_scoring[a, b])
            score = distance / (1.0 + config.ALPHA_WEIGHT_PULL * avg_weight)
            
            if distance > config.BASE_RADIUS_M:
                score *= 1.5
            
            scored_edges.append((score, a, b, distance))
        
        scored_edges.sort(key=lambda x: x[0])
        
        connections = [0] * num_points
        selected_edges = []
        used_pairs = set()
        
        for score, a, b, dist in scored_edges:
            if pair_key(a, b) in used_pairs:
                continue
            
            max_conn_a = config.MIN_CONNECTIONS + int(
                weights[a] * config.MAX_CONNECTIONS_FACTOR
            )
            max_conn_b = config.MIN_CONNECTIONS + int(
                weights[b] * config.MAX_CONNECTIONS_FACTOR
            )
            
            if connections[a] < max_conn_a and connections[b] < max_conn_b:
                used_pairs.add(pair_key(a, b))
                selected_edges.append((a, b))
                connections[a] += 1
                connections[b] += 1
        
        for i in range(num_points):
            while connections[i] < config.MIN_CONNECTIONS:
                candidates_for_i = [
                    (j, dist_haversine[i, j]) 
                    for j in range(num_points) 
                    if j != i and pair_key(i, j) not in used_pairs
                ]
                if not candidates_for_i:
                    break
                
                j, _ = min(candidates_for_i, key=lambda x: x[1])
                used_pairs.add(pair_key(i, j))
                selected_edges.append((i, j))
                connections[i] += 1
                connections[j] += 1
        
        return selected_edges, connections
    
    def _ensure_connectivity(
        self,
        edges: List[Tuple[int, int]],
        points: List[Tuple[float, float]],
        connections: List[int],
        dist_matrix: np.ndarray
    ) -> Tuple[List[Tuple[int, int]], List[int]]:
        graph = nx.Graph()
        graph.add_nodes_from(range(len(points)))
        graph.add_edges_from(edges)
        
        components = list(nx.connected_components(graph))
        if len(components) <= 1:
            return edges, connections
        
        logger.info(f"Connecting {len(components)} components...")
        
        component_list = [list(comp) for comp in components]
        for i in range(len(component_list) - 1):
            comp_a = component_list[i]
            comp_b = component_list[i + 1]
            
            best_pair = None
            best_distance = float("inf")
            
            for node_a in comp_a:
                for node_b in comp_b:
                    distance = dist_matrix[node_a, node_b]
                    if distance < best_distance:
                        best_distance = distance
                        best_pair = (node_a, node_b)
            
            if best_pair:
                edges.append(best_pair)
                connections[best_pair[0]] += 1
                connections[best_pair[1]] += 1
        
        return edges, connections
    
    def _fetch_route_geometries(
        self,
        edges: List[Tuple[int, int]],
        points: List[Tuple[float, float]]
    ) -> Tuple[Dict[Tuple[int, int], List[Tuple[float, float]]], List[Tuple[int, int]]]:
        routes = {}
        failed = []
        
        def fetch_single_route(edge):
            a, b = edge
            geometry = None
            
            if config.USE_OSRM:
                geometry = self.osrm_client.get_route_geometry(points[a], points[b])
            
            if geometry is None:
                num_segments = 8
                geometry = [
                    (
                        points[a][0] + (points[b][0] - points[a][0]) * t / (num_segments - 1),
                        points[a][1] + (points[b][1] - points[a][1]) * t / (num_segments - 1)
                    )
                    for t in range(num_segments)
                ]
                return pair_key(a, b), geometry, False
            
            return pair_key(a, b), geometry, True
        
        with ThreadPoolExecutor(max_workers=config.PARALLEL_WORKERS) as executor:
            futures = {executor.submit(fetch_single_route, edge): edge for edge in edges}
            
            for future in as_completed(futures):
                edge = futures[future]
                try:
                    key, geometry, success = future.result()
                    routes[key] = geometry
                    if not success:
                        failed.append(edge)
                except Exception as e:
                    logger.warning(f"Route fetch exception for {edge}: {e}")
                    failed.append(edge)
        
        if failed:
            logger.warning(f"Failed to fetch {len(failed)} routes")
        
        return routes, failed
    
    def _build_distance_matrix(
        self,
        haversine_matrix: np.ndarray,
        edges: List[Tuple[int, int]],
        routes: Dict[Tuple[int, int], List[Tuple[float, float]]]
    ) -> np.ndarray:
        dist_matrix = haversine_matrix.copy()
        
        for i, j in edges:
            key = pair_key(i, j)
            geometry = routes.get(key)
            
            if geometry:
                route_length = sum(
                    self.geometry.haversine(geometry[k], geometry[k + 1])
                    for k in range(len(geometry) - 1)
                )
                dist_matrix[i, j] = dist_matrix[j, i] = route_length
        
        return dist_matrix
