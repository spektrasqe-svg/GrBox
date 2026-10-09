#!/usr/bin/env bash
# Деплой релея заявок SECRET BOX → Cloudflare Worker.
# Все секреты читаются из файлов (не из литералов команды), чтобы не светиться в логах.
#   .openclaw/tmp/.cf_token  — Cloudflare API token (scope: Account · Workers · Edit)
#   .openclaw/tmp/.cf_acct   — Cloudflare Account ID
#   .openclaw/tmp/.tgbt      — Telegram bot token
#   .openclaw/tmp/.tgchat    — Telegram chat_id (куда падают заявки)
# Значения подставляет ассистент; после деплоя временные файлы удаляются.
set -euo pipefail
cd "$(dirname "$0")"
D="$HOME/.openclaw/workspace/.openclaw/tmp"

for f in .cf_token .cf_acct .tgbt .tgchat; do
  [ -s "$D/$f" ] || { echo "ОШИБКА: нет файла $D/$f"; exit 1; }
done

export CLOUDFLARE_API_TOKEN="$(tr -d '\n' < "$D/.cf_token")"
export CLOUDFLARE_ACCOUNT_ID="$(tr -d '\n' < "$D/.cf_acct")"
TG_BOT_TOKEN="$(tr -d '\n' < "$D/.tgbt")"
TG_CHAT_ID="$(tr -d '\n' < "$D/.tgchat")"
ALLOWED_ORIGIN="https://spektrasqe-svg.github.io"

echo "==> Деплой воркера secretbox-relay ..."
npx --yes wrangler deploy

echo "==> Установка секретов (токен уходит только в Cloudflare Secret) ..."
printf '%s' "$TG_BOT_TOKEN"   | npx --yes wrangler secret put TG_BOT_TOKEN
printf '%s' "$TG_CHAT_ID"     | npx --yes wrangler secret put TG_CHAT_ID
printf '%s' "$ALLOWED_ORIGIN" | npx --yes wrangler secret put ALLOWED_ORIGIN

echo "==> Готово. URL воркера будет в выводе deploy выше (https://secretbox-relay.<поддомен>.workers.dev)"
