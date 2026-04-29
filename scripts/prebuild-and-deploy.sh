#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="${CRS_BRANCH:-main}"
STATE_DIR="${CRS_PREBUILD_STATE_DIR:-${ROOT_DIR}/.deploy-state}"
STATE_FILE="${STATE_DIR}/last-built-sha"
BUILD_COMPOSE_FILE="${CRS_BUILD_COMPOSE_FILE:-${ROOT_DIR}/docker-compose.build.yml}"
DEPLOY_ENV_FILE="${CRS_DEPLOY_ENV_FILE:-${ROOT_DIR}/.env.deploy}"
COMPOSE_PARALLEL_LIMIT="${COMPOSE_PARALLEL_LIMIT:-6}"

ALL_SERVICES=(
  vectorization
  placesweb
  ai_agent
  suitcase_backend
  data_backend
  frontend
)

cd "${ROOT_DIR}"

if [ -f "${DEPLOY_ENV_FILE}" ]; then
  set -a
  # shellcheck disable=SC1090
  . "${DEPLOY_ENV_FILE}"
  set +a
fi

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Не найдена команда: $1" >&2
    exit 1
  fi
}

image_for_service() {
  case "$1" in
    vectorization) echo "crs-vectorization:prod" ;;
    placesweb) echo "crs-placesweb:prod" ;;
    ai_agent) echo "crs-ai-agent:prod" ;;
    suitcase_backend) echo "crs-suitcase-backend:prod" ;;
    data_backend) echo "crs-data-backend:prod" ;;
    frontend) echo "crs-frontend:prod" ;;
    *) echo "Unknown service: $1" >&2; exit 1 ;;
  esac
}

has_service() {
  local needle="$1"
  shift
  local service
  for service in "$@"; do
    [ "${service}" = "${needle}" ] && return 0
  done
  return 1
}

add_service() {
  local service="$1"
  if ! has_service "${service}" "${SELECTED_SERVICES[@]:-}"; then
    SELECTED_SERVICES+=("${service}")
  fi
}

http_ok() {
  [ -n "${1:-}" ] && [ "$1" -ge 200 ] 2>/dev/null && [ "$1" -lt 300 ] 2>/dev/null
}

trigger_coolify() {
  local webhook token http ok api_root uuid
  webhook="$(printf '%s' "${COOLIFY_DEPLOY_WEBHOOK:-}" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  token="$(printf '%s' "${COOLIFY_TOKEN:-}" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"

  if [ -z "${webhook}" ]; then
    echo "COOLIFY_DEPLOY_WEBHOOK не задан. Образы собраны, но деплой не запрошен." >&2
    echo "Добавь webhook в ${DEPLOY_ENV_FILE} или запусти Redeploy вручную в Coolify." >&2
    exit 2
  fi

  ok=0
  set +e
  if [ -n "${token}" ]; then
    http="$(curl -sS -o /tmp/coolify-prebuild.rsp -w "%{http_code}" --request GET "${webhook}" \
      -H "Authorization: Bearer ${token}" \
      -H "Accept: application/json" 2>/tmp/coolify-prebuild.err)"
    if http_ok "${http}"; then
      echo "Coolify deploy запрошен: GET + Bearer, HTTP ${http}"
      ok=1
    else
      echo "GET + Bearer: HTTP ${http}, ответ: $(head -c 400 /tmp/coolify-prebuild.rsp 2>/dev/null || true)"
    fi
  fi

  if [ "${ok}" -eq 0 ]; then
    http="$(curl -sS -o /tmp/coolify-prebuild.rsp -w "%{http_code}" --request GET "${webhook}" \
      -H "Accept: application/json" 2>/tmp/coolify-prebuild.err)"
    if http_ok "${http}"; then
      echo "Coolify deploy запрошен: GET без Bearer, HTTP ${http}"
      ok=1
    fi
  fi

  if [ "${ok}" -eq 0 ] && [ -n "${token}" ]; then
    api_root="${webhook%%/api/v1/deploy*}"
    uuid="$(printf '%s' "${webhook}" | sed -n 's/^.*[?&]uuid=\([^&?#]*\).*$/\1/p')"
    if [ -n "${api_root}" ] && [ -n "${uuid}" ]; then
      http="$(curl -sS -o /tmp/coolify-prebuild.rsp -w "%{http_code}" --request POST "${api_root}/api/v1/deploy" \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -d "{\"uuid\":\"${uuid}\",\"force\":false}" 2>/tmp/coolify-prebuild.err)"
      if http_ok "${http}"; then
        echo "Coolify deploy запрошен: POST + JSON, HTTP ${http}"
        ok=1
      else
        echo "POST: HTTP ${http}, ответ: $(head -c 400 /tmp/coolify-prebuild.rsp 2>/dev/null || true)"
      fi
    fi
  fi
  set -e

  if [ "${ok}" -ne 1 ]; then
    echo "Coolify не ответил успехом. Проверь COOLIFY_DEPLOY_WEBHOOK / COOLIFY_TOKEN." >&2
    exit 1
  fi
}

need docker
need git
need curl

if [ ! -f "${BUILD_COMPOSE_FILE}" ]; then
  echo "Не найден build compose: ${BUILD_COMPOSE_FILE}" >&2
  exit 1
fi

old_sha=""
if [ -f "${STATE_FILE}" ]; then
  old_sha="$(tr -d '[:space:]' < "${STATE_FILE}")"
fi

echo "Обновляю crs/${BRANCH}..."
git fetch origin "${BRANCH}"
git pull --ff-only origin "${BRANCH}"
new_sha="$(git rev-parse HEAD)"

SELECTED_SERVICES=()
build_all=0

if [ -z "${old_sha}" ] || ! git cat-file -e "${old_sha}^{commit}" 2>/dev/null; then
  echo "Предыдущий successful prebuild не найден — собираю все app images."
  build_all=1
elif [ "${old_sha}" = "${new_sha}" ]; then
  echo "Новых коммитов после ${old_sha:0:7} нет."
else
  echo "Изменения с ${old_sha:0:7} до ${new_sha:0:7}:"
  while IFS= read -r changed_path; do
    [ -z "${changed_path}" ] && continue
    echo "  ${changed_path}"
    case "${changed_path}" in
      docker-compose.build.yml|scripts/prebuild-and-deploy.sh)
        build_all=1
        ;;
      vectorization_backend/*)
        add_service vectorization
        ;;
      placesweb_backend/*)
        add_service placesweb
        ;;
      ai_agent/*)
        add_service ai_agent
        ;;
      suitcase/backend/*)
        add_service suitcase_backend
        ;;
      data_backend/*)
        add_service data_backend
        ;;
      frontend/*)
        add_service frontend
        ;;
    esac
  done < <(git diff --name-only "${old_sha}" "${new_sha}")
fi

if [ "${build_all}" -eq 1 ]; then
  SELECTED_SERVICES=("${ALL_SERVICES[@]}")
fi

for service in "${ALL_SERVICES[@]}"; do
  image="$(image_for_service "${service}")"
  if ! docker image inspect "${image}" >/dev/null 2>&1; then
    echo "Локальный image отсутствует: ${image} — добавляю ${service} в сборку."
    add_service "${service}"
  fi
done

if [ "${#SELECTED_SERVICES[@]}" -gt 0 ]; then
  export COMPOSE_PARALLEL_LIMIT
  echo "Собираю локальные images: ${SELECTED_SERVICES[*]}"
  docker compose -f "${BUILD_COMPOSE_FILE}" build "${SELECTED_SERVICES[@]}"
else
  echo "Сервисные контексты не менялись, сборка не нужна."
fi

mkdir -p "${STATE_DIR}"
printf '%s\n' "${new_sha}" > "${STATE_FILE}"

if [ "${CRS_SKIP_DEPLOY:-0}" = "1" ]; then
  echo "CRS_SKIP_DEPLOY=1 — deploy webhook пропущен."
  exit 0
fi

trigger_coolify
