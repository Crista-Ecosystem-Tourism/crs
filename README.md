# Crista — `crs` (Docker Compose)

В репо лежат **`docker-compose.yml`** и каталоги сервисов: `frontend/`, `ai_agent/`, `vectorization_backend/`, `placesweb_backend/` (и при появлении кода — `data_backend/`). Это **точка входа** для **сборки** **всего** **стека** (локально, Coolify, VPS).

## Быстрый старт

```bash
cp .env.example .env
# задать OPENROUTER_API_KEY, JWT_SECRET, VITE_*, CORS_*
docker compose up --build -d
```

**Порты (хост):** frontend **3333**, AI **8002**, vectorization **8001**, placesweb **8003**, PostgreSQL **5545**, Chroma **8010**.

## Документы в этом репо

- [CI/CD: синк из 5 репо в `crs` и Coolify](docs/CI-CD-SYNC.md)
- [Алгоритм графа маршрутов (простыми словами)](docs/graf-marshrutov.md)

## Сервисы (отдельные репозитории)

| Репо | Ссылка |
|------|--------|
| frontend | <https://github.com/Crista-Ecosystem-Tourism/frontend> |
| ai_agent | <https://github.com/Crista-Ecosystem-Tourism/ai_agent> |
| vectorization_backend | <https://github.com/Crista-Ecosystem-Tourism/vectorization_backend> |
| placesweb_backend | <https://github.com/Crista-Ecosystem-Tourism/placesweb_backend> |
| data_backend | <https://github.com/Crista-Ecosystem-Tourism/data_backend> |

## Подробный гайд (порты, dev без Docker, API)

[README](https://github.com/Crista-Ecosystem-Tourism/crs#readme) на странице репо — краткое дублирование; максимально полная версия для разработчика ведётся в локальном клоне `crista` (корневой `README` рядом с `crs/`, `frontend/`, …), если у вас так настроен рабочий каталог.
