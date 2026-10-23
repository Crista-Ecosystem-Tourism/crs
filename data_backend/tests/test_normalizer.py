"""Dependency-free tests for source-to-Place normalization."""

import unittest

from app.core.normalizer import (
    NormalizedPlace,
    deduplicate,
    kudago_to_place,
    merge_wikidata_enrich,
    osm_category,
    osm_to_place,
)


def place(**overrides):
    payload = {
        "source": "osm",
        "external_id": "node/1",
        "name": "Красная площадь",
        "category": "attraction",
        "lat": 55.7539,
        "lng": 37.6208,
    }
    payload.update(overrides)
    return NormalizedPlace(**payload)


class NormalizedPlaceTests(unittest.TestCase):
    def test_unknown_category_falls_back_to_other(self):
        self.assertEqual("other", place(category="spaceport").category)

    def test_name_is_trimmed_and_country_upper_cased(self):
        normalized = place(name="  Кремль  ", country="ru")
        self.assertEqual("Кремль", normalized.name)
        self.assertEqual("RU", normalized.country)

    def test_image_urls_drop_empty_and_duplicate_entries_in_order(self):
        normalized = place(image_urls=["https://a/1.jpg", "", "https://a/2.jpg", "https://a/1.jpg"])
        self.assertEqual(["https://a/1.jpg", "https://a/2.jpg"], normalized.image_urls)


class OsmCategoryTests(unittest.TestCase):
    def test_accommodation_wins_over_other_tags(self):
        self.assertEqual(("hotel", "hostel"), osm_category({"tourism": "hostel", "amenity": "cafe"}))

    def test_historic_places_are_culture(self):
        self.assertEqual(("culture", "castle"), osm_category({"historic": "castle"}))

    def test_food_and_nature_mappings(self):
        self.assertEqual(("restaurant", "cafe"), osm_category({"amenity": "cafe"}))
        self.assertEqual(("nature", "park"), osm_category({"leisure": "park"}))
        self.assertEqual(("nature", "waterfall"), osm_category({"natural": "waterfall"}))

    def test_unmapped_tags_are_other(self):
        self.assertEqual(("other", None), osm_category({"shop": "bakery"}))


class OsmToPlaceTests(unittest.TestCase):
    def test_node_prefers_russian_name_and_keeps_attribution(self):
        result = osm_to_place(
            {
                "type": "node",
                "id": 42,
                "lat": 55.75,
                "lon": 37.62,
                "tags": {
                    "name": "Red Square",
                    "name:ru": "Красная площадь",
                    "name:en": "Red Square",
                    "tourism": "attraction",
                    "addr:country": "ru",
                    "opening_hours": "24/7",
                    "wikidata": "Q1",
                },
            },
            region_hint="Москва",
        )
        self.assertIsNotNone(result)
        self.assertEqual("Красная площадь", result.name)
        self.assertEqual("node/42", result.external_id)
        self.assertEqual({"ru": "Красная площадь", "en": "Red Square"}, result.alt_names)
        self.assertEqual("RU", result.country)
        self.assertEqual("Москва", result.region)
        self.assertEqual({"opening_hours": "24/7"}, result.hours)
        self.assertEqual("Q1", result.wiki_q)
        self.assertEqual("ODbL", result.license)
        self.assertEqual("https://www.openstreetmap.org/node/42", result.source_url)

    def test_way_uses_center_and_builds_commons_file_url(self):
        result = osm_to_place({
            "type": "way",
            "id": 7,
            "center": {"lat": 59.94, "lon": 30.31},
            "tags": {"name": "Эрмитаж", "tourism": "museum", "wikimedia_commons": "File:Winter Palace.jpg"},
        })
        self.assertEqual((59.94, 30.31), (result.lat, result.lng))
        self.assertEqual(
            ["https://commons.wikimedia.org/wiki/Special:FilePath/Winter_Palace.jpg"],
            result.image_urls,
        )

    def test_elements_without_name_id_or_coordinates_are_skipped(self):
        self.assertIsNone(osm_to_place({"type": "node", "id": 1, "lat": 1, "lon": 1, "tags": {"tourism": "museum"}}))
        self.assertIsNone(osm_to_place({"type": "node", "lat": 1, "lon": 1, "tags": {"name": "X"}}))
        self.assertIsNone(osm_to_place({"type": "node", "id": 1, "tags": {"name": "X"}}))
        self.assertIsNone(osm_to_place({"type": "node", "id": 1, "lat": 1, "lon": 1}))

    def test_non_scalar_tags_are_not_copied(self):
        result = osm_to_place({"type": "node", "id": 1, "lat": 1, "lon": 1, "tags": {"name": "X", "nested": {"a": 1}}})
        self.assertNotIn("nested", result.tags)


class KudagoToPlaceTests(unittest.TestCase):
    def test_dated_item_is_event_with_images_from_both_shapes(self):
        result = kudago_to_place({
            "id": 9,
            "title": "Выставка",
            "coords": {"lat": 55.7, "lon": 37.6},
            "dates": [{"start": 1}],
            "images": [{"image": "https://k/1.jpg"}, "https://k/2.jpg"],
            "site_url": "https://kudago.com/msk/event/9/",
        })
        self.assertEqual("event", result.category)
        self.assertEqual("9", result.external_id)
        self.assertEqual(["https://k/1.jpg", "https://k/2.jpg"], result.image_urls)
        self.assertEqual("RU", result.country)

    def test_undated_item_is_culture_and_missing_coordinates_are_skipped(self):
        self.assertEqual("culture", kudago_to_place({"title": "Музей", "coords": {"lat": 1, "lon": 2}}).category)
        self.assertIsNone(kudago_to_place({"title": "Музей", "coords": {"lat": 1}}))
        self.assertIsNone(kudago_to_place({"coords": {"lat": 1, "lon": 2}}))


class EnrichAndDeduplicateTests(unittest.TestCase):
    def test_wikidata_fills_gaps_without_overwriting_source_text(self):
        enriched = merge_wikidata_enrich(
            place(description="Из OSM", image_urls=["https://a/osm.jpg"]),
            {"description": "Из Wikidata", "image": "https://a/wiki.jpg", "country": "ru"},
        )
        self.assertEqual("Из OSM", enriched.description)
        self.assertEqual(["https://a/wiki.jpg", "https://a/osm.jpg"], enriched.image_urls)
        self.assertEqual("RU", enriched.country)

    def test_duplicates_merge_names_and_images_into_first_record(self):
        merged = deduplicate([
            place(alt_names={"ru": "Красная площадь"}, image_urls=["https://a/1.jpg"]),
            place(name="Duplicate", alt_names={"en": "Red Square"}, image_urls=["https://a/1.jpg", "https://a/2.jpg"]),
            place(external_id="node/2"),
        ])
        self.assertEqual(2, len(merged))
        first = merged[0]
        self.assertEqual("Красная площадь", first.name)
        self.assertEqual({"ru": "Красная площадь", "en": "Red Square"}, first.alt_names)
        self.assertEqual(["https://a/1.jpg", "https://a/2.jpg"], first.image_urls)


if __name__ == "__main__":
    unittest.main()
