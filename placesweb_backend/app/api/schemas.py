from pydantic import BaseModel, Field
from typing import List, Optional, Dict


class PointInput(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="Широта")
    lon: float = Field(..., ge=-180, le=180, description="Долгота")
    weight: float = Field(default=1.0, ge=0.1, le=10.0, description="Вес узла")
    name: Optional[str] = Field(None, description="Название точки")


class GraphBuildRequest(BaseModel):
    points: List[PointInput] = Field(..., min_items=2, max_items=500)
    use_osrm_scoring: bool = Field(default=True, description="Использовать OSRM для выбора рёбер")
    base_radius_m: Optional[float] = Field(default=500, ge=100, le=5000)
    min_connections: Optional[int] = Field(default=1, ge=1, le=10)
    k_alternatives: Optional[int] = Field(default=0, ge=0, le=10, description="Количество альтернативных путей")


class NodeInfo(BaseModel):
    id: int
    lat: float
    lon: float
    weight: float
    name: Optional[str] = None


class EdgeOutput(BaseModel):
    from_node: NodeInfo
    to_node: NodeInfo
    distance_m: float
    route_geometry: List[List[float]] = Field(
        ..., 
        description="Массив координат маршрута [[lon, lat], [lon, lat], ...]"
    )


class AlternativePath(BaseModel):
    path_nodes: List[int] = Field(..., description="Индексы узлов в пути")
    distance_m: float
    route_geometry: List[List[float]]


class GraphBuildResponse(BaseModel):
    graph_id: str
    nodes: List[NodeInfo]
    edges: List[EdgeOutput]
    metrics: Dict[str, float]
    alternatives: Optional[List[AlternativePath]] = None
    build_time_seconds: float
    
    geojson: Dict
