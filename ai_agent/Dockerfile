# syntax=docker/dockerfile:1.6
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential libpq-dev \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

COPY . .

EXPOSE 8002

# Миграции не должны валить процесс: иначе Traefik не видит backend → 502.
# Если alembic упал (DB не готова, конфликт версий) — лог, и стартуем uvicorn,
# чтобы /health отвечал и был виден Coolify-прокси.
CMD ["sh", "-c", "alembic upgrade head || echo '[startup] alembic failed, продолжаю запуск'; exec uvicorn app.main:app --host 0.0.0.0 --port 8002"]
