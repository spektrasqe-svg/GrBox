# Подключение приёма заявок в Telegram (схема C)

Задача: форма `order.html` → заявка падает тебе в Telegram **автоматически**.
Токен бота живёт ТОЛЬКО в секрете на сервере релея. В код сайта / git / браузер — НИКОГДА.

Архитектура:
```
(order.html, браузер)  --POST {text,name,phone,...}-->  [Cloudflare Worker релей]  -->  Telegram Bot API  -->  твой чат
        ↑                             ↑
  токена здесь НЕТ          токен только здесь (wrangler secret TG_BOT_TOKEN)
```

---

## Шаг 1 — Создай бота (2 минуты, только ты)
1. В Telegram открой **@BotFather** → команда `/newbot`.
2. Придумай имя (напр. `SECRET BOX Заявки`) и username (напр. `secretbox_leads_bot`).
3. BotFather выдаст **токен** вида `123456789:AAF...` — это главный секрет.
4. **Напиши своему новому боту любое сообщение** (напр. `привет`) — иначе он не сможет
   присылать тебе заявки.

## Шаг 2 — Узнай chat_id (можно доверить мне)
После шага 1.4 открой в браузере:
```
https://api.telegram.org/bot<ТОКЕН>/getUpdates
```
Найди `"chat":{"id":123456789}` — это **TG_CHAT_ID** (твой личный чат с ботом).
> Если дашь мне токен — я вытащу chat_id сам через getUpdates, тебе не придётся копаться в JSON.

## Шаг 3 — Хостинг релея (Cloudflare Worker, бесплатно)
Нужен аккаунт Cloudflare. Два пути:
- **A (проще всего для тебя):** зайди на dash.cloudflare.com → Workers → Create → вставь
  содержимое `deploy/telegram-relay.js` → Deploy. Потом в Settings → Variables задай секреты
  `TG_BOT_TOKEN`, `TG_CHAT_ID`, `ALLOWED_ORIGIN`.
- **B (сделаю я):** установи и залогинь wrangler одной командой `npx wrangler login`
  (откроется браузер → войди в Cloudflare). Дальше деплой и секреты — мои руки.

## Шаг 4 — Впиши URL релея в сайт
В `assets/site/site-config.js`:
```js
leads: { mode: 'telegram', endpoint: 'https://<имя-воркера>.workers.dev' }
```
Это единственная правка в коде. Без endpoint сайт молча работает в ручном режиме (копирование).

## Шаг 5 — Проверка
Отправь тестовую заявку с формы `order.html` → сообщение должно прийти в чат бота.

---

## Безопасность
- Токен бота = доступ к рассылке. Никогда не публикуй его в коде/репозитории/браузере.
- Релей отдаёт CORS только на нужный origin (`ALLOWED_ORIGIN`) — чужие сайты не смогут
  слать заявки через твой релей.
- Если токен утёк — в @BotFather `/revoke` → выпусти новый.

## Что уже готово
- `deploy/telegram-relay.js` — код релея (CORS, валидация, сборка текста).
- `assets/site/leads.js` — форма: валидация имя+контакт, сборка текста, POST на endpoint.
- `assets/site/site-config.js` — `leads.mode='telegram'`, ждёт `endpoint`.
