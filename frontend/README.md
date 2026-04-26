# Crista — Frontend

Веб-клиент: **React 18**, **Vite**, **TypeScript**, **Tailwind**, **Leaflet** (карта).

## Роль

Чат с AI, карта, маршруты, профиль. HTTP-запросы к **ai_agent** (`VITE_API_URL`), к графу — `VITE_GRAPH_API_URL` (см. `src/api/`).

## Локально

```bash
cd frontend
npm install
cp .env.example .env  # VITE_API_URL=http://localhost:8002, VITE_USE_MOCKS=false
npm run dev
```

Vite по умолчанию: **http://localhost:5173**. В Docker-стеке `crs` фронт обычно **:3333** — в **CORS** у `ai_agent` добавь `http://localhost:3333`.

## CI/CD

Пуш в `main` / `master` копирует этот репо в [crs/frontend](https://github.com/Crista-Ecosystem-Tourism/crs): [инструкция](https://github.com/Crista-Ecosystem-Tourism/crs/blob/main/docs/CI-CD-SYNC.md), секрет `CRS_SYNC_PAT`.

## Полная документация

Сводка по **всем** сервисам, порты, Docker, прод: [README в корневом репо](https://github.com/Crista-Ecosystem-Tourism/crs#readme) — при **работе** **только** **с** `frontend` **репо** **см.** **также** [орг](https://github.com/Crista-Ecosystem-Tourism).
