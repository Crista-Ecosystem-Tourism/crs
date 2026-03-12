import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import search, load_data

logger = logging.getLogger(__name__)

SEED_DATA_PATH = os.getenv("SEED_DATA_PATH", "/app/data/data.json")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Автозагрузка данных при старте, если коллекция пустая
    if os.path.exists(SEED_DATA_PATH):
        try:
            from app.dependencies.vectorizer import get_vectorizer
            from app.utils.data_loader import DataLoader

            vectorizer = get_vectorizer()
            collection = vectorizer.vector_store_manager.vector_store._collection
            count = collection.count()
            if count == 0:
                logger.info(f"Коллекция пустая, загружаю данные из {SEED_DATA_PATH}")
                data = DataLoader().load_from_json(SEED_DATA_PATH)
                vectorizer.build_and_store_embeddings(data)
                logger.info(f"Загружено {len(data)} записей в ChromaDB")
            else:
                logger.info(f"Коллекция уже содержит {count} записей, пропускаю загрузку")
        except Exception as e:
            logger.error(f"Ошибка автозагрузки данных: {e}")
    else:
        logger.warning(f"Файл {SEED_DATA_PATH} не найден, пропускаю автозагрузку")
    yield


app = FastAPI(lifespan=lifespan)

# CORS — разрешаем запросы от ai_agent и фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/api/v1")
app.include_router(load_data.router, prefix="/api/v1")
