/* WALLFORM® — логика заявок: сборка, валидация, отправка.
   Режимы из site-config.js leads.mode:
   - links     : без бэкенда — текст заявки + кнопки Telegram / WhatsApp + копирование
   - formspree : POST на leads.endpoint (Formspree / любой form-сервис)
   - webhook   : POST JSON на leads.endpoint (свой релей / бот)
   Без endpoint любой режим откатывается в links. */
(function () {
  'use strict';

  function cfg() { return (window.SITE_CONFIG && window.SITE_CONFIG.leads) || {}; }

  function validPhone(p) {
    return !!p && (p.replace(/\D/g, '').length >= 10);
  }

  function saveLocal(payload) {
    try {
      var all = JSON.parse(localStorage.getItem('wf_leads') || '[]');
      all.push(payload);
      localStorage.setItem('wf_leads', JSON.stringify(all.slice(-50)));
    } catch (e) { /* приватный режим — просто игнорируем */ }
  }

  /* Сборка и отправка.
     formEl   — <form>, из него читаются поля name/phone/city/comment
     extra    — объект (напр. результат CalcEngine.toText) → добавляется в текст
     okEl     — блок .form-ok, показывается после отправки
     Returns  Promise. */
  function submit(formEl, extra, okEl) {
    var fd = new FormData(formEl);
    var contact = {
      name: (fd.get('name') || '').toString().trim(),
      phone: (fd.get('phone') || '').toString().trim(),
      city: (fd.get('city') || '').toString().trim(),
      comment: (fd.get('comment') || '').toString().trim(),
      page: location.pathname.split('/').pop() || 'index.html',
      ts: new Date().toISOString(),
    };

    if (!contact.phone || !validPhone(contact.phone)) {
      alert('Укажите корректный телефон — по нему свяжется менеджер.');
      var p = formEl.querySelector('[name=phone]'); if (p) p.focus();
      return Promise.reject(new Error('phone'));
    }

    var text = (extra && extra.text) ? extra.text : '';
    if (!text) {
      text = 'ЗАЯВКА WALLFORM®\nИмя: ' + (contact.name || '—') +
             '\nТелефон: ' + contact.phone +
             (contact.city ? '\nОбъект: ' + contact.city : '') +
             (contact.comment ? '\nКомментарий: ' + contact.comment : '');
    } else if (text.indexOf('Телефон:') === -1) {
      text = text.replace('ЗАЯВКА WALLFORM®',
        'ЗАЯВКА WALLFORM®\nИмя: ' + (contact.name || '—') + '\nТелефон: ' + contact.phone +
        (contact.city ? '\nОбъект: ' + contact.city : ''));
    }

    var payload = Object.assign({}, contact, { text: text });
    saveLocal(payload);

    var mode = cfg().mode || 'links';
    var endpoint = cfg().endpoint || '';
    if (!endpoint && mode !== 'links') mode = 'links';

    var done = function () {
      if (okEl) { okEl.classList.add('show'); okEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      formEl.reset();
    };

    if (mode === 'formspree' || mode === 'webhook') {
      return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      }).then(done).catch(function () { fallbackLinks(text, done); });
    }

    fallbackLinks(text, done);
    return Promise.resolve();
  }

  /* Без бэкенда: показываем панель отправки (Telegram / WhatsApp / копировать) */
  function fallbackLinks(text, done) {
    var panel = document.getElementById('sendPanel');
    var out = document.getElementById('sendText');
    if (!panel || !out) { done(); return; }
    out.value = text;
    var c = (window.SITE_CONFIG && window.SITE_CONFIG.contacts) || {};
    var tg = panel.querySelector('[data-send=telegram]');
    var wa = panel.querySelector('[data-send=whatsapp]');
    if (tg) {
      if (c.telegram) { tg.href = c.telegram + '?text=' + encodeURIComponent(text); tg.style.display = ''; }
      else tg.style.display = 'none';
    }
    if (wa) {
      if (c.whatsapp) { wa.href = c.whatsapp + '?text=' + encodeURIComponent(text); wa.style.display = ''; }
      else wa.style.display = 'none';
    }
    panel.style.display = 'block';
    done();
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (!b) return;
    var out = document.getElementById('sendText');
    if (!out) return;
    out.select();
    try { document.execCommand('copy'); } catch (err) {}
    b.textContent = 'Скопировано ✓';
    setTimeout(function () { b.textContent = 'Скопировать текст'; }, 2200);
  });

  window.Leads = { submit: submit, validPhone: validPhone };
})();
