# Antigravity / прочие ИИ-агенты — Crista

Используй тот же процесс, что в **`AGENTS.md`**:

- Правки кода сервисов → только каталоги **канонических** репозиториев рядом с `crs` (`frontend`, `ai_agent`, …), **не** `crs/frontend` и т.д.
- Push в соответствующий GitHub-репозиторий; затем **`git pull`** в `crs`, не дублируя файлы внутри `crs/` в той же сессии.
- Исключение: чисто docker/compose/otel/nginx монорепы → правки в **`crs/`**, push в репо **`crs`**.

Полный текст: см. **`AGENTS.md`** и **`.cursor/rules/ecosystem-crs-sync.mdc`** (в репозитории `crs`).
