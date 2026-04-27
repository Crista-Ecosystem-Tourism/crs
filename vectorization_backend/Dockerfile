# syntax=docker/dockerfile:1.6
# 3.12: стабильные бинарные колёса torch/transformers при pip install (3.13 на билд-сервере часто падает или OOM).
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    HF_HOME=/root/.cache/huggingface \
    TRANSFORMERS_CACHE=/root/.cache/huggingface

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# Прогреваем embedding-модель в build-слой: она кэшируется в /root/.cache/huggingface
# и переиспользуется между деплоями (экономит ~1–2 минуты на каждом старте контейнера и
# страхует от сбоев HF в момент cold start). Имя должно совпадать с EMBEDDING_MODEL_NAME
# в docker-compose.yml.
ARG EMBEDDING_MODEL_NAME=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
RUN --mount=type=cache,target=/root/.cache/huggingface \
    python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('${EMBEDDING_MODEL_NAME}')" \
 && mkdir -p /opt/hf-cache \
 && cp -a /root/.cache/huggingface/. /opt/hf-cache/
ENV HF_HOME=/opt/hf-cache \
    TRANSFORMERS_CACHE=/opt/hf-cache

COPY . .

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
