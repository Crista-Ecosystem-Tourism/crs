from __future__ import annotations

import os
from typing import Any

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN

from app.config import admin_token

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
JWT_ALG = os.getenv("JWT_ALG", "HS256")

bearer = HTTPBearer(auto_error=False)


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])


async def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> dict[str, Any]:
    """Доступ к admin-эндпоинтам.

    Принимаются два варианта:
    - JWT, выпущенный ai_agent (общий JWT_SECRET) с claim ``role=admin`` или
      ``is_admin=true``;
    - короткий токен из переменной DATA_ADMIN_TOKEN — для bootstrap/cron.
    """

    if credentials is None:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Не авторизован")

    raw_token = credentials.credentials
    static = admin_token()
    if static and raw_token == static:
        return {"sub": "static-admin", "role": "admin"}

    try:
        payload = decode_token(raw_token)
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Неверный токен") from exc

    role = str(payload.get("role") or "").lower()
    if role == "admin" or payload.get("is_admin") is True:
        return payload

    raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="Требуется роль admin")
