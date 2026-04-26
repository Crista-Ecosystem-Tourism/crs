# Crista — PlacesWeb Backend

Построение **графа** мест и **маршрутов**: **FastAPI**, **NetworkX**, **OSRM** (при **настроенном** `USE_OSRM`).

## Роль

`POST /api/v1/graph/build` — **AI agent** **дергает** **через** `ROUTE_URL`. **Вход**: точки (lat/lon), **веса** **мест**; **выход**: **рёбра**, **альтернативные** **пути**, **GeoJSON**.

## Алгоритм «простыми словами»

См. [docs/graf-marshrutov.md](docs/graf-marshrutov.md) (в **этом** **репо**).

## Локально

```bash
cd placesweb_backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.api.routes:app --reload --host 0.0.0.0 --port 8003
```

## CI/CD

Синк в [crs/placesweb_backend](https://github.com/Crista-Ecosystem-Tourism/crs): [инструкция](https://github.com/Crista-Ecosystem-Tourism/crs/blob/main/docs/CI-CD-SYNC.md), `CRS_SYNC_PAT`.

## Полная документация

[README `crs`](https://github.com/Crista-Ecosystem-Tourism/crs#readme)
