from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging
import time
import uuid
from typing import List, Dict, Tuple

from app.config import config
from app.core.graph_builder import WeightedGraphBuilder, GraphBuildResult
from app.core.pathfinding import PathFinder
from app.services.osrm_client import OSRMClient
from .schemas import (
    GraphBuildRequest, GraphBuildResponse, 
    NodeInfo, EdgeOutput, AlternativePath
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="GraphMap API",
    description="API для построения взвешенных графов с маршрутизацией",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

osrm_client = OSRMClient()


@app.post("/api/v1/graph/build", response_model=GraphBuildResponse)
async def build_graph(request: GraphBuildRequest):

    start_time = time.time()
    
    try:
        points = [(p.lat, p.lon) for p in request.points]
        weights = [p.weight for p in request.points]
        names = [p.name for p in request.points]
        
        original_config = _apply_request_config(request)
        
        logger.info(f"Building graph for {len(points)} points...")
        
        builder = WeightedGraphBuilder(osrm_client)
        result = await asyncio.to_thread(
            builder.build,
            points,
            weights,
            use_osrm_scoring=request.use_osrm_scoring
        )
        
        logger.info(f"Graph built: {len(result.edges)} edges")
        
        alternatives = []
        if len(points) >= 2 and request.k_alternatives > 0:
            source, target = 0, len(points) - 1
            alternatives = await asyncio.to_thread(
                PathFinder.find_k_shortest_paths,
                result,
                source,
                target,
                request.k_alternatives
            )
            logger.info(f"Found {len(alternatives)} alternative paths")
        
        response = _build_response(
            result=result,
            points=points,
            weights=weights,
            names=names,
            alternatives=alternatives,
            build_time=time.time() - start_time
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error building graph: {e}", exc_info=True)
        raise HTTPException(500, f"Failed to build graph: {str(e)}")
    
    finally:
        _restore_config(original_config)


def _apply_request_config(request: GraphBuildRequest) -> Dict:
    original = {}
    
    if request.base_radius_m is not None:
        original['BASE_RADIUS_M'] = config.BASE_RADIUS_M
        config.BASE_RADIUS_M = request.base_radius_m
    
    if request.min_connections is not None:
        original['MIN_CONNECTIONS'] = config.MIN_CONNECTIONS
        config.MIN_CONNECTIONS = request.min_connections
    
    if request.k_alternatives is not None:
        original['K_ALTERNATIVES'] = config.K_ALTERNATIVES
        config.K_ALTERNATIVES = request.k_alternatives
    
    return original


def _restore_config(original: Dict):
    for key, value in original.items():
        setattr(config, key, value)


def _build_response(
    result: GraphBuildResult,
    points: List[Tuple[float, float]],
    weights: List[float],
    names: List[str],
    alternatives: List[Dict],
    build_time: float
) -> GraphBuildResponse:
    
    nodes = [
        NodeInfo(
            id=i,
            lat=points[i][0],
            lon=points[i][1],
            weight=weights[i],
            name=names[i]
        )
        for i in range(len(points))
    ]
    
    edges = []
    for a, b in result.edges:
        key = (min(a, b), max(a, b))
        geometry = result.routes.get(key, [])
        
        route_coords = [[lon, lat] for lat, lon in geometry]
        
        edges.append(EdgeOutput(
            from_node=NodeInfo(
                id=a,
                lat=points[a][0],
                lon=points[a][1],
                weight=weights[a],
                name=names[a]
            ),
            to_node=NodeInfo(
                id=b,
                lat=points[b][0],
                lon=points[b][1],
                weight=weights[b],
                name=names[b]
            ),
            distance_m=float(result.dist_matrix[a, b]),
            route_geometry=route_coords
        ))
    
    alternative_paths = []
    for alt in alternatives:
        path = alt["path"]
        
        path_geometry = []
        for i in range(len(path) - 1):
            node_a = path[i]
            node_b = path[i + 1]
            key = (min(node_a, node_b), max(node_a, node_b))
            
            edge_geom = result.routes.get(key, [])
            path_geometry.extend([[lon, lat] for lat, lon in edge_geom])
        
        alternative_paths.append(AlternativePath(
            path_nodes=path,
            distance_m=alt["distance_m"],
            route_geometry=path_geometry
        ))
    
    geojson = _create_geojson(nodes, edges, alternative_paths)
    
    return GraphBuildResponse(
        graph_id=str(uuid.uuid4()),
        nodes=nodes,
        edges=edges,
        metrics=result.metrics,
        alternatives=alternative_paths if alternative_paths else None,
        build_time_seconds=round(build_time, 3),
        geojson=geojson
    )


def _create_geojson(
    nodes: List[NodeInfo],
    edges: List[EdgeOutput],
    alternatives: List[AlternativePath]
) -> Dict:
    features = []
    
    for node in nodes:
        features.append({
            "type": "Feature",
            "id": f"node-{node.id}",
            "geometry": {
                "type": "Point",
                "coordinates": [node.lon, node.lat]
            },
            "properties": {
                "type": "node",
                "node_id": node.id,
                "weight": node.weight,
                "name": node.name
            }
        })
    
    for idx, edge in enumerate(edges):
        features.append({
            "type": "Feature",
            "id": f"edge-{idx}",
            "geometry": {
                "type": "LineString",
                "coordinates": edge.route_geometry
            },
            "properties": {
                "type": "edge",
                "from_id": edge.from_node.id,
                "from_name": edge.from_node.name,
                "to_id": edge.to_node.id,
                "to_name": edge.to_node.name,
                "distance_m": edge.distance_m
            }
        })
    
    for idx, alt in enumerate(alternatives):
        features.append({
            "type": "Feature",
            "id": f"alternative-{idx}",
            "geometry": {
                "type": "LineString",
                "coordinates": alt.route_geometry
            },
            "properties": {
                "type": "alternative",
                "path_index": idx,
                "distance_m": alt.distance_m,
                "path_nodes": alt.path_nodes
            }
        })
    
    return {
        "type": "FeatureCollection",
        "features": features
    }


@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "osrm_url": config.OSRM_URL,
        "version": "1.0.0"
    }
