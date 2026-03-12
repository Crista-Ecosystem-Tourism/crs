import logging
from typing import List, Tuple, Dict, Optional
import numpy as np
import plotly.graph_objects as go

from ..core.graph_builder import GraphBuildResult
from ..utils.metrics import pair_key
from ..config import config

logger = logging.getLogger(__name__)


class PlotlyVisualizer:
    
    @staticmethod
    def visualize_graph(
        points: List[Tuple[float, float]],
        weights: List[float],
        build_result: GraphBuildResult,
        alternatives: Optional[List[Dict]] = None,
        output_path: str = None
    ) -> go.Figure:
        fig = go.Figure()
        output_path = output_path or config.OUTPUT_HTML
        
        PlotlyVisualizer._add_edges(fig, points, build_result)
        
        if config.SHOW_K_PATHS and alternatives:
            PlotlyVisualizer._add_alternatives(fig, points, alternatives)
        
        PlotlyVisualizer._add_nodes(fig, points, weights)
        
        center_lat = float(np.mean([p[0] for p in points]))
        center_lon = float(np.mean([p[1] for p in points]))
        
        fig.update_layout(
            mapbox=dict(
                style="open-street-map",
                center=dict(lat=center_lat, lon=center_lon),
                zoom=12
            ),
            height=900,
            title="Weighted Graph Visualization",
            showlegend=True
        )
        
        fig.write_html(output_path)
        logger.info(f"Saved visualization to {output_path}")
        
        try:
            fig.show()
        except Exception:
            pass
        
        return fig
    
    @staticmethod
    def _add_edges(
        fig: go.Figure,
        points: List[Tuple[float, float]],
        build_result: GraphBuildResult
    ) -> None:
        for idx, (a, b) in enumerate(build_result.edges):
            key = pair_key(a, b)
            geometry = build_result.routes.get(key)
            color = "red"
            
            if geometry and config.SHOW_OSRM_GEOMETRY:
                lats, lons = zip(*geometry)
                distance = build_result.dist_matrix[a, b]
                
                fig.add_trace(go.Scattermapbox(
                    lat=list(lats),
                    lon=list(lons),
                    mode="lines",
                    line=dict(width=3, color=color),
                    hoverinfo="text",
                    hovertext=f"{a}→{b} ({distance:.0f} m)",
                    showlegend=False
                ))
            elif config.SHOW_FALLBACK_LINES:
                lat1, lon1 = points[a]
                lat2, lon2 = points[b]
                
                fig.add_trace(go.Scattermapbox(
                    lat=[lat1, lat2],
                    lon=[lon1, lon2],
                    mode="lines",
                    line=dict(width=2, color=color, dash="dash"),
                    hoverinfo="text",
                    hovertext=f"{a}→{b} fallback",
                    showlegend=False
                ))
    
    @staticmethod
    def _add_alternatives(
        fig: go.Figure,
        points: List[Tuple[float, float]],
        alternatives: List[Dict]
    ) -> None:
        for idx, alt in enumerate(alternatives):
            color = f"hsl({(idx * 97) % 360}, 80%, 40%)"
            path = alt["path"]
            coords = [points[node] for node in path]
            lats, lons = zip(*coords)
            
            fig.add_trace(go.Scattermapbox(
                lat=list(lats),
                lon=list(lons),
                mode="lines+markers",
                line=dict(width=4, color=color),
                marker=dict(size=6),
                name=f"Alt {idx + 1} ({alt['distance_m']:.0f} m)"
            ))
    
    @staticmethod
    def _add_nodes(
        fig: go.Figure,
        points: List[Tuple[float, float]],
        weights: List[float]
    ) -> None:
        lats = [p[0] for p in points]
        lons = [p[1] for p in points]
        sizes = [10 + w * 6 for w in weights]
        
        text_labels = [
            f"{w:.2f}" if config.NODE_LABEL_SHOW_WEIGHT else ""
            for w in weights
        ]
        
        hover_texts = [
            f"Node {i}<br>Weight: {weights[i]:.2f}<br>{lats[i]:.5f}, {lons[i]:.5f}"
            for i in range(len(points))
        ]
        
        fig.add_trace(go.Scattermapbox(
            lat=lats,
            lon=lons,
            mode="markers+text",
            text=text_labels,
            textposition="top center",
            marker=dict(
                size=sizes,
                color=weights,
                colorscale="Viridis",
                cmin=0,
                cmax=5,
                showscale=True,
                colorbar=dict(title="Weight")
            ),
            hoverinfo="text",
            hovertext=hover_texts,
            name="Nodes"
        ))
