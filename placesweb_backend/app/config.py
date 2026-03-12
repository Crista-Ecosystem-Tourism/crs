from dataclasses import dataclass


@dataclass
class Config:
    
    OSRM_URL: str = "https://routing.openstreetmap.de/routed-foot"
    USE_OSRM: bool = True
    USE_OSRM_TABLE: bool = True
    OSRM_TABLE_BATCH: int = 100
    OSRM_TIMEOUT: int = 10
    CACHE_TTL_SECONDS: int = 60 * 60 * 2
    
    BASE_RADIUS_M: float = 500.0
    MIN_CONNECTIONS: int = 1
    MAX_CONNECTIONS_FACTOR: float = 0.8
    ALPHA_WEIGHT_PULL: float = 1.0
    KNN_K: int = 2
    
    PARALLEL_WORKERS: int = 8
    
    K_ALTERNATIVES: int = 0
    
    SHOW_OSRM_GEOMETRY: bool = True
    SHOW_FALLBACK_LINES: bool = False
    SHOW_K_PATHS: bool = False
    NODE_LABEL_SHOW_WEIGHT: bool = True
    OUTPUT_HTML: str = "graph_map.html"


config = Config()
