/* SECRET BOX — единая точка настройки сайта.
   Правь ТОЛЬКО этот файл: контакты, приём заявок, цены. Остальной код читает значения отсюда.
   Любое поле можно оставить null — сайт просто скроет/подставит заглушку и не сломается. */
(function(){
  'use strict';

  var CONFIG = {

    /* ───────────────────────── КОНТАКТЫ ─────────────────────────
       Заполни реальными значениями. null → блок «Контакты» и кнопка канала не показываются. */
    contacts: {
      phone:     null,   // например '+7 999 123-45-67'  (то, что видит посетитель)
      phoneHref: null,   // например '+79991234567'      (то, что набирается по клику)
      telegram:  null,   // @username (без @), если есть — он приоритетнее номера
      telegramPhone: '89521004044', // номер Telegram, если username нет: ссылка получается t.me/+7…
      email:     null,   // например 'sales@secretbox.ru'
      workHours: 'Пн–Сб · 10:00–20:00',
      address:   'Москва · сборка под ключ',
      dealerUrl: null,   // ссылка «Стать дилером»; null → ведёт на форму заявки
    },

    /* ─────────────────────── ПРИЁМ ЗАЯВОК ───────────────────────
       mode 'links'     — без бэкенда: форма готовит текст заявки, отправка кнопками
                          (Telegram / почта / телефон) + копирование в буфер.
       mode 'telegram'  — заявка падает в Telegram через свой релей (deploy/telegram-relay.js).
                          Нужен endpoint = URL релея. Схема C.
       mode 'formspree' — POST на https://formspree.io/f/<id>  (нужен endpoint)
       mode 'webhook'   — POST JSON на свой обработчик        (нужен endpoint)
       Без endpoint любой режим молча откатывается в 'links' — форма не ломается. */
    leads: {
      mode: 'telegram',
      endpoint: null,    // URL релея, например 'https://secretbox-relay.workers.dev'
      manager: null,     // telegram-ник менеджера (без @); null → берём contacts.telegram
      privacyUrl: 'privacy.html',  // политика обработки персональных данных
    },

    /* ─────────────────────────── ЦЕНЫ ─────────────────────────── */
    pricing: {
      currency: '₽',
      // false → на карточках и в смете везде «Цена по запросу»
      show: true,
      // Стартовые цены комплектаций. null → «Цена по запросу».
      // Якоря владельца: минимум 80 000 · база 150 000 · топ 300 000.
      // Готовых моделей нет — продукт один и параметрический, различается только наполнением.
      products: {
        base: { from: 80000,  title: 'БАЗА' },
        full: { from: 150000, title: 'ПОЛНЫЙ ЦИКЛ' },
        max:  { from: 300000, title: 'МАКСИМУМ' }
      },
      // Подпись под ценой на карточках
      priceLabel: 'СТАРТОВАЯ КОМПЛЕКТАЦИЯ',
      priceOnRequest: 'Цена по запросу',
      /* Мини-конфигуратор на главной: надбавки за опции, ₽.
         Порядок кнопок = порядок значений. По умолчанию выбраны бесплатные опции + «Полный цикл»
         → стартовая цифра на экране = 150 000 ₽ (базовый якорь). */
      quick: {
        body:    [0, 45000, 130000],       // Размер: Компактный / Стандартный / Большой
        finish:  [12000, 6000, 0],         // Шоколад / Шампань / Белый
        sections:[0, 35000],               // Только гроу / Гроу + хранение
        tank:    [6000, 3000, 0],          // Встроенный / Внешний / Без бака
        gear:    [80000, 150000, 300000],  // Комплектация: База / Полный цикл / Максимум
        water:   [18000, 0]                // Автополив / Без автополива
      },
      /* Тарифы расчётного движка (project-engine.js + product-state.js).
         Откалиброваны под якоря: минимум ≈ 80 000 · база ≈ 150 000 · топ ≈ 300 000.
         Реальный прайс пришёл → правишь здесь, пересчитывается вся смета на сайте. */
      book: {
        base: 47000,                  // база: корпус + сборка + пусконаладка
        panelPerM2: 2500,             // раскрой и обработка панелей, ₽/м²
        doorPerM2: 1600,              // дверь-сэндвич, ₽/м²
        doorMin: 1500,
        plinth: 800,
        rail: 900,                    // монтажная рейка
        carriage: 350,                // каретка + траверса
        vibro: 120,                   // виброопора (за шт.)
        vibration: 4000,              // виброизоляция комплектом (в смете оценки)
        din: 4000,
        rcd: 6000,
        leak: 10000,
        ups: 28000,
        tray: 5000,
        scrog: 2500,
        silencer: 12000,
        baffle: 4500,
        sensors: 2500,
        camera: 4500,
        controller: 8000,
        humidifier: 8000,
        irrigation: 14000,
        reservoir: 4500,
        equipment: { SE3000: 25000, SE5000: 55000, G8600: 110000 },
        fan: { SF4: 8000, SF6: 22000, SF8: 45000 },
        finish: { choco: 8000, champ: 4000, white: 0 }
      }
    }
  };

  /* ── сервисные функции (менять не нужно) ── */
  var fmt = function(n){ return Number(n||0).toLocaleString('ru-RU'); };

  function priceHTML(from){
    var p = CONFIG.pricing;
    if(!p.show || from === null || from === undefined) return p.priceOnRequest;
    return 'от ' + fmt(from) + ' ' + p.currency;
  }

  function productPrice(key){
    var t = CONFIG.pricing.products[String(key||'').toLowerCase()];
    return (t && t.from !== undefined) ? t.from : null;
  }

  /* Ссылка на Telegram: @username → t.me/<username>, иначе номер → t.me/+<7XXXXXXXXXX> */
  function tgLink(){
    var c = CONFIG.contacts;
    if(c.telegram) return 'https://t.me/' + String(c.telegram).replace(/^@/, '');
    var d = String(c.telegramPhone || '').replace(/\D/g, '');
    if(!d) return null;
    if(d.length === 11 && d[0] === '8') d = '7' + d.slice(1);   // 8 952… → 7 952…
    return 'https://t.me/+' + d;
  }
  function tgLabel(){
    var c = CONFIG.contacts;
    if(c.telegram) return '@' + String(c.telegram).replace(/^@/, '');
    var s = String(c.telegramPhone || '').replace(/\D/g, '');
    if(s.length === 11) return s[0] + ' ' + s.slice(1,4) + ' ' + s.slice(4,7) + '-' + s.slice(7,9) + '-' + s.slice(9);
    return s;
  }

  function contactsHTML(){
    var c = CONFIG.contacts, out = [];
    if(c.phone)     out.push('<a href="tel:' + (c.phoneHref || c.phone.replace(/[^\d+]/g,'')) + '">' + c.phone + '</a>');
    var tg = tgLink();
    if(tg)          out.push('<a href="' + tg + '" target="_blank" rel="noopener">Telegram · ' + tgLabel() + '</a>');
    if(c.email)     out.push('<a href="mailto:' + c.email + '">' + c.email + '</a>');
    return out.join('');
  }

  window.SB_CONFIG = CONFIG;
  window.SB_PRICE  = { fmt: fmt, html: priceHTML, product: productPrice, book: CONFIG.pricing.book };
  window.SB_CONTACTS = { html: contactsHTML, config: CONFIG.contacts, tgLink: tgLink, tgLabel: tgLabel };

  /* Автозаполнение: <span data-sb-price="A"></span>, <span data-sb-contacts></span> */
  function paint(){
    document.querySelectorAll('[data-sb-price]').forEach(function(el){
      el.innerHTML = priceHTML(productPrice(el.getAttribute('data-sb-price')));
    });
    document.querySelectorAll('[data-sb-price-label]').forEach(function(el){
      el.textContent = CONFIG.pricing.priceLabel;
    });
    document.querySelectorAll('[data-sb-contacts]').forEach(function(el){
      el.innerHTML = contactsHTML() || '<span class="muted">Контакты подключаются</span>';
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
  document.addEventListener('secretbox:config', paint);
})();
