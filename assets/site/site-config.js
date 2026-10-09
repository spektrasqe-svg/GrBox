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
      telegram:  null,   // например 'secretbox'          (без @)
      email:     null,   // например 'sales@secretbox.ru'
      workHours: 'Пн–Сб · 10:00–20:00',
      address:   'Москва · сборка под ключ',
      dealerUrl: null,   // ссылка «Стать дилером»; null → ведёт на форму заявки
    },

    /* ─────────────────────── ПРИЁМ ЗАЯВОК ───────────────────────
       mode 'links'     — без бэкенда: форма готовит текст заявки, отправка кнопками
                          (Telegram / почта / телефон) + копирование в буфер.
       mode 'formspree' — POST на https://formspree.io/f/<id>  (нужен endpoint)
       mode 'webhook'   — POST JSON на свой обработчик        (нужен endpoint) */
    leads: {
      mode: 'links',
      endpoint: null,
      manager: null,      // куда уходят заявки: telegram-ник менеджера (без @) или null
      privacyUrl: null,   // ссылка на политику обработки данных; null → текст без ссылки
    },

    /* ─────────────────────────── ЦЕНЫ ─────────────────────────── */
    pricing: {
      currency: '₽',
      // false → на карточках и в смете везде «Цена по запросу»
      show: true,
      // Стартовые цены карточек товаров. null → «Цена по запросу».
      // Плавающий прайс: ставь «от» цены минимальной комплектации.
      products: {
        A: { from: null, badge: 'FLAGSHIP' },
        B: { from: null, badge: 'SPACE SAVER' },
        C: { from: null, badge: 'DUAL ZONE' }
      },
      // Подпись под ценой на карточках
      priceLabel: 'СТАРТОВАЯ КОМПЛЕКТАЦИЯ',
      priceOnRequest: 'Цена по запросу',
      /* Мини-конфигуратор на главной: надбавки за опции, ₽.
         Порядок кнопок = порядок значений. Правь под реальный прайс. */
      quick: {
        body:    [100000, 85000, 95000],   // A · Флагман / B · Компакт / C · Двухсекционный
        finish:  [25000, 10000, 0],        // Шоколад / Шампань / Белый
        sections:[0, 15000],               // Только гроу / Гроу + хранение
        tank:    [12000, 6000, 0],         // Встроенный / Внешний / Без бака
        gear:    [0, 45000, 85000],        // База / Полный цикл / Максимум
        water:   [18000, 0]                // Автополив / Без автополива
      },
      /* Тарифы расчётного движка (project-engine.js + product-state.js).
         Реальный прайс пришёл → правишь здесь, пересчитывается вся смета на сайте. */
      book: {
        base: 72000,                  // база: корпус + сборка + пусконаладка
        panelPerM2: 9000,             // раскрой и обработка панелей, ₽/м²
        doorPerM2: 5000,              // дверь-сэндвич, ₽/м²
        doorMin: 7000,
        plinth: 4500,
        rail: 1800,                   // монтажная рейка
        carriage: 650,                // каретка + траверса
        vibro: 180,                   // виброопора (за шт.)
        vibration: 3500,              // виброизоляция комплектом (в смете оценки)
        din: 5500,
        rcd: 5500,
        leak: 8000,
        ups: 18000,
        tray: 8500,
        scrog: 3200,
        silencer: 10000,
        baffle: 9000,
        sensors: 4500,
        camera: 5500,
        controller: 7000,
        humidifier: 7000,
        irrigation: 12000,
        reservoir: 4500,
        equipment: { SE3000: 28000, SE5000: 42000, G8600: 56000 },
        fan: { SF4: 9000, SF6: 13000, SF8: 18000 },
        finish: { choco: 25000, champ: 10000, white: 0 }
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

  function productPrice(model){
    var t = CONFIG.pricing.products[String(model||'').toUpperCase()];
    return (t && t.from !== undefined) ? t.from : null;
  }

  function contactsHTML(){
    var c = CONFIG.contacts, out = [];
    if(c.phone)     out.push('<a href="tel:' + (c.phoneHref || c.phone.replace(/[^\d+]/g,'')) + '">' + c.phone + '</a>');
    if(c.telegram)  out.push('<a href="https://t.me/' + c.telegram + '" target="_blank" rel="noopener">Telegram · @' + c.telegram + '</a>');
    if(c.email)     out.push('<a href="mailto:' + c.email + '">' + c.email + '</a>');
    return out.join('');
  }

  window.SB_CONFIG = CONFIG;
  window.SB_PRICE  = { fmt: fmt, html: priceHTML, product: productPrice, book: CONFIG.pricing.book };
  window.SB_CONTACTS = { html: contactsHTML, config: CONFIG.contacts };

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
