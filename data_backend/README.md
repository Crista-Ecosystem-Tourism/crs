# Crista — Data Backend

ETL‑оркестратор для всей экосистемы. Тянет открытые данные о туристических местах,
нормализует, складывает в **Postgres** (источник правды) и переиндексирует **Chroma**
через сервис `vectorization`.

## Источники (только открытые, без квот)

| ID | Источник | Лицензия |
|----|----------|----------|
| `osm` | OpenStreetMap (Overpass API) | ODbL |
| `wikidata` | Wikidata SPARQL — enrichment по `wikidata=Q*` | CC0 |
| `mkrf` | opendata.mkrf.ru — музеи РФ | OpenData |
| `kudago` | KudaGo — события и места РФ | Open REST |

OSM покрывает 85 субъектов РФ (по ISO 3166‑2) **подробно**, плюс top‑городов мира
из `data/cities.json`. Фото у себя не храним — только ссылки на оригиналы (Commons и т.п.).

## Архитектура

```
                 Open sources
                 (OSM/Wikidata/mkrf/KudaGo)
                          │
                          ▼
  data_backend  ── normalize → enrich → upsert ─► Postgres (data_place)
                                                 │
                                                 ▼
                                       vectorization /load/json ─► chromadb
```

* Postgres — источник правды (`data_place`, `data_place_link`, `data_source_run`,
  `data_bootstrap_state`).
* Chroma — производный векторный индекс. Можно пересобрать в любой момент из Postgres
  без обращения в интернет.
* Фото — только URL.

## Запуск локально (через `crs/`)

```bash
cd crs && docker compose up -d data_backend
curl -sS http://localhost:8004/health
```

## Эндпоинты

* `GET  /health`
* `GET  /stats`
* `GET  /sources`
* `GET  /places?country=RU&city=Сочи&category=restaurant`
* `GET  /runs`
* `GET  /bootstrap`
* `POST /sources/run-all` (admin)
* `POST /sources/{id}/run` (admin)
* `POST /bootstrap` (admin)

Из браузера прокидывается через `frontend/nginx.conf` под префиксом `/data-api/`.

### Авторизация

Эндпоинты записи требуют:

* JWT с `role=admin` (общий `JWT_SECRET` со всем стеком), либо
* короткий статический токен `DATA_ADMIN_TOKEN` (удобно из cron‑скриптов).

## Bootstrap

`DATA_AUTO_BOOTSTRAP=true` (дефолт) — при первом старте, если БД пустая,
контейнер сам прогонит `run_all_sources()` и переиндексирует Chroma. После
успеха повторный старт уже ничего не делает (идемпотентно).

Ручной запуск (если выключал auto):

```bash
curl -X POST -H "Authorization: Bearer $DATA_ADMIN_TOKEN" \
  https://api.crista.online/data-api/bootstrap
```

## Cron (всё ежедневно)

* `DATA_WEEKLY_CRON=0 3 * * *` — каждый день в 03:00 полный прогон источников.
* `DATA_REINDEX_CRON=30 4 * * *` — каждый день в 04:30 переиндексация Chroma.
* Отключить можно `DATA_DISABLE_CRON=true`.

## CI/CD

После push в `main` → копия в [crs/data_backend](https://github.com/Crista-Ecosystem-Tourism/crs)
через GitHub Actions (`reusable-sync-to-crs`). Coolify пересобирает `data_backend`
и поднимает с миграциями.
