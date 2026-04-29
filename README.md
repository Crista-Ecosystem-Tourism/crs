# Crista — `crs` (Docker Compose)

В репо лежат **`docker-compose.yml`** и каталоги сервисов: `frontend/`, `ai_agent/`, `vectorization_backend/`, `placesweb_backend/`, `data_backend/`, `suitcase/`. Основной compose запускает уже готовые локальные images, а сборка вынесена в `docker-compose.build.yml`.

## Быстрый старт

```bash
cp .env.example .env
# задать OPENROUTER_API_KEY, JWT_SECRET, VITE_*, CORS_*
docker compose -f docker-compose.build.yml build
docker compose up -d
```

**Порты на хост:** **3333** (фронт), **8002** (API); граф — **только** путь `http://localhost:3333/graph-api/` (nginx → placesweb, **без** :8003). По умолчанию привязка **`127.0.0.1`** (`COMPOSE_LAN_BIND` в `.env`) — с другой машины в сети не открывается. Остальное (RAG, Chroma, pgAdmin, …) — оверлей [docker-compose.dev-ports.yaml](docker-compose.dev-ports.yaml).

Карта URL: [docs/LOCAL-URLS.md](docs/LOCAL-URLS.md) · **прод (Coolify):** [docs/COOLIFY-SUBDOMAINS.md](docs/COOLIFY-SUBDOMAINS.md) (`COMPOSE_LAN_BIND=0.0.0.0` на сервере).

Подключение к БД из pgAdmin и смысл Chroma: [../LOCAL-POSTGRES-AND-CHROMA.md](../LOCAL-POSTGRES-AND-CHROMA.md)

## Coolify: быстрый деплой без платных раннеров

В проде Coolify больше не собирает app-образы. Он запускает локальные images:

- `crs-vectorization:prod`
- `crs-placesweb:prod`
- `crs-ai-agent:prod`
- `crs-suitcase-backend:prod`
- `crs-data-backend:prod`
- `crs-frontend:prod`

Сборка идёт на том же VPS заранее через [scripts/prebuild-and-deploy.sh](scripts/prebuild-and-deploy.sh), без GitHub-hosted build minutes и без внешнего registry.

Первый запуск на VPS:

```bash
cd /path/to/crs
cat > .env.deploy <<'EOF'
COOLIFY_DEPLOY_WEBHOOK=https://coolify.example/api/v1/deploy?uuid=...
COOLIFY_TOKEN=...
EOF
chmod 600 .env.deploy
./scripts/prebuild-and-deploy.sh
```

Что важно:

1. В Coolify у приложения со стеком из **`crs`** должен быть отключён автодеплой по push из Git.
2. GitHub workflow [`.github/workflows/trigger-coolify-deploy.yml`](.github/workflows/trigger-coolify-deploy.yml) оставлен как ручной fallback (`workflow_dispatch`), но обычный prod deploy должен идти через VPS-скрипт.
3. Если менялся только один сервис, скрипт пересоберёт только его image. Если это первый запуск или поменялся `docker-compose.build.yml`, будут собраны все app images.

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

