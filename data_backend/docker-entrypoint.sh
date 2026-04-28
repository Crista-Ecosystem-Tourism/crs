#!/bin/sh
set -eu

echo "[data_backend] alembic upgrade head..."
alembic -c /app/alembic.ini upgrade head
echo "[data_backend] starting: $*"
exec "$@"
