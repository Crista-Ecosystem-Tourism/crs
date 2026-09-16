import unittest
from dataclasses import replace

from app.api.routes import _build_response, _request_config
from app.api.schemas import GraphBuildRequest, PointInput
from app.config import config
from app.core.graph_builder import WeightedGraphBuilder


def request_with(**overrides):
    payload = {
        "points": [
            PointInput(lat=55.751, lon=37.618, name="A"),
            PointInput(lat=55.752, lon=37.619, name="B"),
        ],
        "base_radius_m": 500,
        "min_connections": 1,
        "k_alternatives": 0,
    }
    payload.update(overrides)
    return GraphBuildRequest(**payload)


class RequestConfigTests(unittest.TestCase):
    def test_request_settings_are_isolated_from_global_config(self):
        original = (config.BASE_RADIUS_M, config.MIN_CONNECTIONS, config.K_ALTERNATIVES)

        first = _request_config(
            request_with(base_radius_m=250, min_connections=2, k_alternatives=3)
        )
        second = _request_config(
            request_with(base_radius_m=1250, min_connections=4, k_alternatives=1)
        )

        self.assertEqual((config.BASE_RADIUS_M, config.MIN_CONNECTIONS, config.K_ALTERNATIVES), original)
        self.assertEqual((first.BASE_RADIUS_M, first.MIN_CONNECTIONS, first.K_ALTERNATIVES), (250, 2, 3))
        self.assertEqual((second.BASE_RADIUS_M, second.MIN_CONNECTIONS, second.K_ALTERNATIVES), (1250, 4, 1))
        self.assertIsNot(first, second)

    def test_builders_keep_their_own_settings(self):
        first = WeightedGraphBuilder(settings=replace(config, BASE_RADIUS_M=250))
        second = WeightedGraphBuilder(settings=replace(config, BASE_RADIUS_M=1250))

        self.assertEqual(first.config.BASE_RADIUS_M, 250)
        self.assertEqual(second.config.BASE_RADIUS_M, 1250)
        self.assertEqual(config.BASE_RADIUS_M, 500.0)

    def test_fallback_geometry_is_marked_as_approximate(self):
        class UnavailableOsrm:
            def get_route_geometry(self, *_):
                return None

        points = [(55.751, 37.618), (55.752, 37.619)]
        result = WeightedGraphBuilder(
            osrm_client=UnavailableOsrm(),
            settings=replace(config, USE_OSRM=True),
        ).build(points, [1.0, 1.0])

        response = _build_response(
            result=result,
            points=points,
            weights=[1.0, 1.0],
            names=["A", "B"],
            alternatives=[],
            build_time=0.0,
        )

        self.assertEqual(result.approximate_routes, [(0, 1)])
        self.assertTrue(response.edges[0].is_approximate_route)
        self.assertTrue(response.geojson["features"][2]["properties"]["is_approximate_route"])
