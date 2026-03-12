import logging
from typing import List, Dict
import networkx as nx

from ..core.graph_builder import GraphBuildResult

logger = logging.getLogger(__name__)


class PathFinder:
    
    @staticmethod
    def find_k_shortest_paths(
        build_result: GraphBuildResult,
        source: int,
        target: int,
        k: int
    ) -> List[Dict]:
        graph = nx.Graph()
        num_nodes = build_result.dist_matrix.shape[0]
        
        for i in range(num_nodes):
            graph.add_node(i)
        
        for a, b in build_result.edges:
            weight = float(build_result.dist_matrix[a, b])
            graph.add_edge(a, b, weight=weight)
        
        try:
            path_generator = nx.shortest_simple_paths(
                graph, source, target, weight="weight"
            )
            
            alternatives = []
            for _, path in zip(range(k), path_generator):
                total_distance = sum(
                    graph[u][v]['weight'] 
                    for u, v in zip(path, path[1:])
                )
                alternatives.append({
                    "path": path,
                    "distance_m": total_distance
                })
            
            return alternatives
            
        except nx.NetworkXNoPath:
            logger.warning(f"No path found from {source} to {target}")
            return []
