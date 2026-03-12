from typing import List, Tuple, Dict
import numpy as np


def calculate_graph_metrics(
    edges: List[Tuple[int, int]], 
    dist_matrix: np.ndarray, 
    connections: List[int]
) -> Dict:
    if not edges:
        return {}
    
    num_nodes = len(connections)
    edge_distances = [dist_matrix[i, j] for i, j in edges]
    
    return {
        "num_vertices": num_nodes,
        "num_edges": len(edges),
        "avg_degree": float(np.mean(connections)),
        "graph_density": float(len(edges) / (num_nodes * (num_nodes - 1) / 2)) 
                        if num_nodes > 1 else 0.0,
        "avg_edge_distance_m": float(np.mean(edge_distances)),
        "max_edge_distance_m": float(np.max(edge_distances)),
        "min_edge_distance_m": float(np.min(edge_distances))
    }

def pair_key(i: int, j: int) -> Tuple[int, int]:
    return (min(i, j), max(i, j))
