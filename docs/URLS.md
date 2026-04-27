# URL сервисов Crista

## Локально

```bash
cd crs && docker compose -f docker-compose.yml -f docker-compose.dev-ports.yaml up -d
```

| Назначение | URL |
| ---------- | --- |
| UI (фронт) | [http://localhost:3333](http://localhost:3333) |
| API (ai_agent) | [http://localhost:8002](http://localhost:8002) |
| Swagger API | [http://localhost:8002/docs](http://localhost:8002/docs) |
| RAG / vectorization (Swagger) | [http://localhost:8001/docs](http://localhost:8001/docs) |
| Граф (placesweb) | [http://localhost:8003](http://localhost:8003) · [http://localhost:8003/docs](http://localhost:8003/docs) |
| Chroma (OpenAPI) | [http://localhost:8010/docs](http://localhost:8010/docs) |
| pgAdmin (PostgreSQL) | [http://localhost:5050](http://localhost:5050) |
| Zipkin | [http://localhost:9411](http://localhost:9411) |

## Прод (Coolify, `crista.online`)

Соответствует **Domains** в Coolify для стека `crs`.

| Сервис | URL | Примечание |
| ------ | --- | ---------- |
| Frontend | [https://crista.online](https://crista.online) | UI |
| ai_agent (API) | [https://api.crista.online](https://api.crista.online) | [Swagger /docs](https://api.crista.online/docs) |
| placesweb (граф) | [https://graph.crista.online](https://graph.crista.online) | [Swagger /docs](https://graph.crista.online/docs) |
| vectorization (RAG) | [https://vectorization.crista.online](https://vectorization.crista.online) | [Swagger /docs](https://vectorization.crista.online/docs) |
| Chroma | [https://chroma.crista.online](https://chroma.crista.online) | API; в браузере — […/docs](https://chroma.crista.online/docs) |
| pgAdmin (PostgreSQL) | [https://pgadmin.crista.online](https://pgadmin.crista.online) | Вход в веб: `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD`; к БД: host `postgres`, порт `5432`, БД `crs_agent`, пароль `POSTGRES_PASSWORD` |
| Zipkin | [https://zipkin.crista.online](https://zipkin.crista.online) | UI трейсов |
| otel-collector | — | Публичный домен не задан (только внутренняя сеть Docker) |

