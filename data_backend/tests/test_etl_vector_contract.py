import unittest
import uuid

from app.core.vector_contract import place_to_vector_record
from app.models import Place


class EtlVectorContractTests(unittest.TestCase):
    def test_normalized_place_keeps_vectorization_fields_and_compatibility_projection(self):
        place = Place(
            id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
            source="osm",
            external_id="node/1",
            name="Красная площадь",
            category="attraction",
            subcategory="viewpoint",
            city="Москва",
            region="Москва",
            country="RU",
            lat=55.7539,
            lng=37.6208,
            description="Главная площадь Москвы",
            tags={"historic": "square"},
            image_urls=["https://images.example.org/red-square.jpg"],
            license="ODbL-1.0",
            attribution="OpenStreetMap contributors",
            source_url="https://www.openstreetmap.org/node/1",
        )

        record = place_to_vector_record(place)

        self.assertEqual(record["id"], "00000000-0000-0000-0000-000000000001")
        self.assertEqual(record["category"], "attraction")
        self.assertEqual(record["subcategory"], "viewpoint")
        self.assertEqual(record["city"], "Москва")
        self.assertEqual(record["region"], "Москва")
        self.assertEqual(record["country"], "RU")
        self.assertEqual(record["latitude"], 55.7539)
        self.assertEqual(record["longitude"], 37.6208)
        self.assertEqual(record["subcategories"], ["attraction", "viewpoint"])
        self.assertEqual(record["subtype"], ["viewpoint"])
        self.assertEqual(record["addressObj"], {
            "city": "Москва", "state": "Москва", "country": "RU",
        })
        self.assertIn("Красная площадь", record["page_content"])
        self.assertIn("Главная площадь Москвы", record["page_content"])
        self.assertEqual(record["image"], "https://images.example.org/red-square.jpg")


if __name__ == "__main__":
    unittest.main()
