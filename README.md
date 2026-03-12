# Crista — AI Travel Planner

Многокомпонентная система для интеллектуального планирования путешествий с чат-ботом, векторным поиском мест и построением маршрутов.

## Быстрый старт (Docker)

Единственное требование: **Docker** и **Docker Compose**.

```bash
# 1. Создайте .env в корне (или отредактируйте существующий)
cp .env.example .env
# Укажите OPENROUTER_API_KEY и JWT_SECRET

# 2. Поднимите все сервисы одной командой
docker compose up --build -d

# 3. Следите за логами (первый раз ~3-5 мин — скачиваются модели)
docker compose logs -f
```

После запуска:

| Сервис | URL | Описание |
|--------|-----|----------|
| **Frontend** | http://localhost:3333 | Веб-интерфейс |
| **AI Agent API** | http://localhost:8002/docs | Чат, сессии, авторизация |
| **Vectorization API** | http://localhost:8001/docs | Семантический поиск мест |
| **Graph API** | http://localhost:8003/docs | Построение маршрутов |
| **PostgreSQL** | localhost:5544 | БД (postgres / postgres123) |
| **ChromaDB** | localhost:8010 | Векторная БД |

### Загрузка данных мест

После запуска загрузите данные в векторную БД:

```bash
# Скопируйте файл в контейнер и загрузите
docker compose cp ./data.json vectorization:/app/data.json
curl -X POST "http://localhost:8001/api/v1/load/json?filepath=/app/data.json"
```

### Управление

```bash
docker compose up -d           # Запустить все
docker compose down            # Остановить (данные сохраняются)
docker compose down -v         # Остановить + удалить данные
docker compose logs -f ai_agent  # Логи конкретного сервиса
docker compose restart ai_agent  # Перезапустить сервис
```

---

## Архитектура

```
┌──────────────┐     ┌──────────────┐     ┌───────────────────┐     ┌──────────────┐
│   Frontend   │────▶│   AI Agent   │────▶│  Vectorization    │────▶│  ChromaDB    │
│  React/Vite  │     │   FastAPI    │     │    Backend        │     │   Server     │
│  :3333       │     │  :8002       │     │   :8001           │     │  :8010       │
└──────────────┘     └──────┬───────┘     └───────────────────┘     └──────────────┘
                            │
                            │         ┌──────────────┐     ┌──────────────┐
                            ├────────▶│  PlacesWeb   │     │  PostgreSQL  │
                            │         │  Backend     │     │              │
                            │         │  :8003       │     │  :5544       │
                            │         └──────────────┘     └──────────────┘
                            └──────────────────────────────────┘
```

## Компоненты

| Компонент | Порт | Технологии | Назначение |
|-----------|------|-----------|-----------|
| **Frontend** | 3333 | React 18, TypeScript, Vite, Tailwind, Leaflet | UI: чат, карта, маршруты |
| **AI Agent** | 8002 | FastAPI, pydantic-ai, OpenRouter (GPT-4o) | Чат-бот, обработка предпочтений |
| **Vectorization Backend** | 8001 | FastAPI, LangChain, HuggingFace Embeddings | Векторный поиск мест |
| **ChromaDB Server** | 8010 | ChromaDB | Хранилище векторных эмбеддингов |
| **PlacesWeb Backend** | 8003 | FastAPI, NetworkX, OSRM | Построение графов маршрутов |
| **PostgreSQL** | 5544 | PostgreSQL 16 | БД для сессий чата и пользователей |

---

## Запуск без Docker (для разработки)

### Требования

- Python 3.13+
- Node.js 20+
- PostgreSQL (порт 5544)

### Порядок запуска

Строго в таком порядке (зависимости):

#### 1. PostgreSQL

```bash
# Через Docker:
docker run -d --name crs-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=crs_agent \
  -p 5544:5432 postgres:16-alpine
```

#### 2. ChromaDB Server (:8010)

```bash
cd vectorization_backend
./venv/Scripts/chroma run \
  --path ./app/vector_store/sochi_rests_and_piter_chroma_db \
  --port 8010 --host 0.0.0.0
```

#### 3. Vectorization Backend (:8001)

```bash
cd vectorization_backend
source venv/Scripts/activate   # Windows: .\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

#### 4. PlacesWeb Backend (:8003)

```bash
cd placesweb_backend
source venv/Scripts/activate
uvicorn app.api.routes:app --reload --host 0.0.0.0 --port 8003
```

#### 5. AI Agent (:8002)

```bash
cd ai_agent
source venv/Scripts/activate
alembic upgrade head   # миграции БД (первый запуск)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

#### 6. Frontend (:3333)

```bash
cd frontend
npm install
npm run dev -- --port 3333
```

### Env-переменные

**ai_agent/.env:**
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3333
RAG_URL=http://localhost:8001
ROUTE_URL=http://localhost:8003
OPENROUTER_API_KEY=sk-or-v1-...
DATABASE_URL=postgresql+asyncpg://postgres:postgres123@localhost:5544/crs_agent
```

**vectorization_backend/.env:**
```
EMBEDDING_PROVIDER=huggingface
EMBEDDING_MODEL_NAME=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
CHROMA_HOST=localhost
CHROMA_PORT=8010
```

**frontend/.env:**
```
VITE_API_URL=http://localhost:8002
VITE_USE_MOCKS=false
```

---

## Известные особенности

### Прокси
На машинах с корпоративным прокси необходимо указать `NO_PROXY=localhost,127.0.0.1` и `HTTP_PROXY=` / `HTTPS_PROXY=` в `.env` файлах, иначе запросы между сервисами пойдут через прокси и получат 502.

### ChromaDB на Windows
ChromaDB в embedded-режиме не сохраняет HNSW индекс на диск на Windows. Поэтому ChromaDB запускается как **отдельный сервер**, а vectorization backend подключается через `HttpClient`.

### CORS
AI Agent принимает запросы только с origins, перечисленных в `CORS_ORIGINS`. При смене порта фронтенда нужно обновить эту переменную.

## API Endpoints

### AI Agent (:8002)
- `GET /health` — health check
- `POST /chat/sessions` — создание сессии чата
- `POST /chat/sessions/{id}/messages` — отправка сообщения
- `GET /chat/sessions/{id}/history` — история чата
- `GET /chat/sessions` — список сессий пользователя
- `POST /auth/register` — регистрация
- `POST /auth/login` — вход

### Vectorization Backend (:8001)
- `POST /api/v1/search` — векторный поиск мест
- `POST /api/v1/load/json?filepath=...` — загрузка данных из JSON
- `POST /api/v1/load/api?url=...` — загрузка данных из внешнего API

### PlacesWeb Backend (:8003)
- `POST /api/v1/graph/build` — построение графа маршрута
- `GET /api/v1/health` — health check
