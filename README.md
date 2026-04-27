# Crista — `crs` (Docker Compose)

В репо лежат **`docker-compose.yml`** и каталоги сервисов: `frontend/`, `ai_agent/`, `vectorization_backend/`, `placesweb_backend/` (и при появлении кода — `data_backend/`). Это **точка входа** для **сборки** **всего** **стека** (локально, Coolify, VPS).

## Быстрый старт

```bash
cp .env.example .env
# задать OPENROUTER_API_KEY, JWT_SECRET, VITE_*, CORS_*
docker compose up --build -d
```

**Порты на хост:** **3333** (фронт), **8002** (API); граф — **только** путь `http://localhost:3333/graph-api/` (nginx → placesweb, **без** :8003). По умолчанию привязка **`127.0.0.1`** (`COMPOSE_LAN_BIND` в `.env`) — с другой машины в сети не открывается. Остальное (RAG, Chroma, pgAdmin, …) — оверлей [docker-compose.dev-ports.yaml](docker-compose.dev-ports.yaml).

Карта URL: [docs/LOCAL-URLS.md](docs/LOCAL-URLS.md) · **прод (Coolify):** [docs/COOLIFY-SUBDOMAINS.md](docs/COOLIFY-SUBDOMAINS.md) (`COMPOSE_LAN_BIND=0.0.0.0` на сервере).

Подключение к БД из pgAdmin и смысл Chroma: [../LOCAL-POSTGRES-AND-CHROMA.md](../LOCAL-POSTGRES-AND-CHROMA.md)

## Coolify: один деплой при лавине sync

Пуши в `frontend` / `ai_agent` / … → Actions заливают копии в `crs` (несколько коммитов). Чтобы в Coolify уходил **один** деплой по **последнему** `main`, в `crs` есть workflow [`.github/workflows/trigger-coolify-deploy.yml`](.github/workflows/trigger-coolify-deploy.yml) (отмена лишних запусков через `concurrency`).

1. В Coolify у приложения со стеком из **`crs`**: **отключи** автодеплой по push из Git (иначе сработают и Git, и workflow).
2. В GitHub: в секреты репо `crs` добавь `COOLIFY_DEPLOY_WEBHOOK` и `COOLIFY_TOKEN` — по комментариям в workflow.
3. Если в Actions **401/403**: при создании **API token** в Coolify укажи **IP allowlist** `0.0.0.0/0` или оставь пустым (иначе запросы с раннеров GitHub не проходят). Права токена — **root** (`*`), не read-only.

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
