/* SECRET BOX — релей заявок в Telegram (Cloudflare Worker)
   Схема C: форма на сайте шлёт POST сюда, релей пересылает текст в Telegram.
   Токен бота живёт ТОЛЬКО здесь (wrangler secret), в браузер не попадает.

   Подключение:
   1. В Telegram: @BotFather → /newbot → получишь токен вида 123456789:AAF...
   2. Напиши боту любое сообщение (иначе он не сможет писать тебе), затем открой
      https://api.telegram.org/bot<ТОКЕН>/getUpdates — там будет "chat":{"id":123456789}.
      Это TG_CHAT_ID — куда падают заявки (твой личный чат или группа).
   3. Cloudflare Dashboard → Workers → Create → вставь этот файл → Deploy.
   4. В терминале:
        npx wrangler secret put TG_BOT_TOKEN      # вставь токен бота
        npx wrangler secret put TG_CHAT_ID        # вставь id чата
        npx wrangler secret put ALLOWED_ORIGIN    # например https://spektrasqe-svg.github.io
   5. Скопируй URL воркера (вида https://xxx.workers.dev) в assets/site/site-config.js:
        leads: { mode: 'telegram', endpoint: 'https://xxx.workers.dev' }

   Контракт: POST JSON { text, name, phone, telegram, email, type, comment } → 200 { ok:true }.
*/
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || '*';
    const cors = {
      'Access-Control-Allow-Origin': (allowed === '*' ? (origin || '*') : (origin === allowed ? origin : 'null')),
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin'
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

    let data = null;
    try { data = await request.json(); } catch (e) {
      return new Response('Bad JSON', { status: 400, headers: cors });
    }

    const token = env.TG_BOT_TOKEN;
    const chatId = env.TG_CHAT_ID;
    if (!token || !chatId) {
      return new Response(JSON.stringify({ ok: false, error: 'relay not configured' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // собираем сообщение: сначала готовый текст из формы, иначе поля по одному
    let text = String(data.text || '').slice(0, 3900);
    if (!text) {
      text = [
        'ЗАЯВКА · SECRET BOX',
        data.name ? 'Имя: ' + data.name : '',
        data.phone ? 'Телефон: ' + data.phone : '',
        data.telegram ? 'Telegram: ' + data.telegram : '',
        data.email ? 'E-mail: ' + data.email : '',
        data.type ? 'Запрос: ' + data.type : '',
        data.comment ? 'Комментарий: ' + data.comment : ''
      ].filter(Boolean).join('\n').slice(0, 3900);
    }
    if (!text.trim()) {
      return new Response(JSON.stringify({ ok: false, error: 'empty message' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const res = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        disable_web_page_preview: true
      })
    });

    return new Response(JSON.stringify({ ok: res.ok, status: res.status }),
      { status: res.ok ? 200 : 502, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
};
