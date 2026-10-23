import unittest

import numpy as np

from app.core.geometry import GeometryCalculator
from app.core.graph_builder import GraphBuildResult
from app.core.pathfinding import PathFinder

MOSCOW = (55.7539, 37.6208)
SAINT_PETERSBURG = (59.9398, 30.3146)


def build_result(points, edges):
    return GraphBuildResult(
        edges=edges,
        connections=[],
        routes={},
        approximate_routes=[],
        dist_matrix=GeometryCalculator.compute_distance_matrix(points),
        metrics={},
    )


class GeometryTests(unittest.TestCase):
    def test_haversine_matches_known_city_distance(self):
        distance_km = GeometryCalculator.haversine(MOSCOW, SAINT_PETERSBURG) / 1000
        self.assertAlmostEqual(634, distance_km, delta=5)

    def test_haversine_is_symmetric_and_zero_for_same_point(self):
        self.assertEqual(0, GeometryCalculator.haversine(MOSCOW, MOSCOW))
        self.assertAlmostEqual(
            GeometryCalculator.haversine(MOSCOW, SAINT_PETERSBURG),
            GeometryCalculator.haversine(SAINT_PETERSBURG, MOSCOW),
        )

    def test_cartesian_projection_is_on_unit_sphere(self):
        x, y, z = GeometryCalculator.to_cartesian_3d(MOSCOW)
        self.assertAlmostEqual(1.0, x * x + y * y + z * z)

    def test_distance_matrix_is_symmetric_with_zero_diagonal(self):
        matrix = GeometryCalculator.compute_distance_matrix([MOSCOW, SAINT_PETERSBURG, (55.76, 37.63)])
        self.assertEqual((3, 3), matrix.shape)
        self.assertTrue(np.allclose(matrix, matrix.T))
        self.assertTrue(np.all(np.diag(matrix) == 0))


class PathFinderTests(unittest.TestCase):
    def test_returns_shortest_alternatives_in_ascending_distance(self):
        # A square of nearby points: two equal-length detours plus a direct diagonal.
        points = [(55.750, 37.610), (55.750, 37.620), (55.760, 37.620), (55.760, 37.610)]
        result = build_result(points, [(0, 1), (1, 2), (2, 3), (3, 0), (0, 2)])

        alternatives = PathFinder.find_k_shortest_paths(result, 0, 2, k=3)

        self.assertEqual([0, 2], alternatives[0]["path"])
        self.assertEqual(3, len(alternatives))
        distances = [item["distance_m"] for item in alternatives]
        self.assertEqual(sorted(distances), distances)
        self.assertAlmostEqual(result.dist_matrix[0, 2], distances[0])

    def test_disconnected_points_return_no_paths(self):
        result = build_result([MOSCOW, SAINT_PETERSBURG], [])
        self.assertEqual([], PathFinder.find_k_shortest_paths(result, 0, 1, k=2))


if __name__ == "__main__":
    unittest.main()
