import random
import json
import logging

from app.config import config
from app.core.graph_builder import WeightedGraphBuilder
from app.core.pathfinding import PathFinder
from app.visualization.plotly_visualizer import PlotlyVisualizer
from app.services.osrm_client import OSRMClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    center = (43.59637598502456, 39.73748856914054)
    num_points = 18
    spread = 0.03
    
    points = [
        (center[0] + random.uniform(-spread, spread),
         center[1] + random.uniform(-spread, spread))
        for _ in range(num_points)
    ]
    weights = [random.uniform(0.5, 10.0) for _ in range(num_points)]
    
    osrm_client = OSRMClient()
    builder = WeightedGraphBuilder(osrm_client)
    
    logger.info("Building geo-based graph...")
    result_geo = builder.build(points, weights, use_osrm_scoring=False)
    logger.info(f"Built graph with {len(result_geo.edges)} edges")
    
    with open("graph_geo_based.json", "w") as f:
        json.dump({
            "edges": [
                {"from": int(a), "to": int(b), "dist": float(result_geo.dist_matrix[a, b])}
                for a, b in result_geo.edges
            ],
            "metrics": result_geo.metrics
        }, f, indent=2)
    
    if config.USE_OSRM:
        logger.info("Building OSRM-based graph...")
        result_osrm = builder.build(points, weights, use_osrm_scoring=True)
        logger.info(f"Built graph with {len(result_osrm.edges)} edges")
        
        with open("graph_osrm_based.json", "w") as f:
            json.dump({
                "edges": [
                    {"from": int(a), "to": int(b), "dist": float(result_osrm.dist_matrix[a, b])}
                    for a, b in result_osrm.edges
                ],
                "metrics": result_osrm.metrics
            }, f, indent=2)
    else:
        result_osrm = result_geo
    
    alternatives = []
    if len(points) >= 2 and config.K_ALTERNATIVES > 0:
        source, target = 0, len(points) - 1
        alternatives = PathFinder.find_k_shortest_paths(
            result_osrm, source, target, config.K_ALTERNATIVES
        )
        logger.info(f"Found {len(alternatives)} alternative paths")
    
    PlotlyVisualizer.visualize_graph(
        points, weights, result_osrm, alternatives, config.OUTPUT_HTML
    )
    
    logger.info("Done!")


if __name__ == "__main__":
    main()
