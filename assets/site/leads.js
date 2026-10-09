/* SECRET BOX — приём заявок.
   Читает SB_CONFIG (site-config.js) и SECRETBOX (product-state.js).
   Режимы: 'links' (без бэкенда) · 'formspree' · 'webhook' */
(function(){
  'use strict';

  var EQ = {
    light:{SE3000:'Свет SE3000',SE5000:'Свет SE5000',G8600:'Свет G8600'},
    fan:{SF4:'Вентилятор SF4',SF6:'Вентилятор SF6',SF8:'Вентилятор SF8'},
    controller:{GGS:'Контроллер GGS'},
    climate:{humidifier:'Увлажнитель'},
    irrigation:{'smart-drip':'Автополив'},
    reservoir:{'20L':'Бак 20 л'}
  };
  var EN = {silencer:'Глушитель',vibration:'Виброизоляция',leakProtection:'Защита от протечки',
            ups:'ИБП / резерв питания',din:'DIN-панель',rkn:'RCD / защита питания'};

  function pick(map, val){ return (map && map[val]) ? map[val] : null; }

  /* ── история заявок (для личного кабинета) ── */
  var LEADS='secretbox.leads', PROF='secretbox.profile';
  function readJSON(k,d){ try{ return JSON.parse(localStorage.getItem(k)||'null') || d }catch(e){ return d } }
  function remember(form,text,status){
    try{
      var list=readJSON(LEADS,[]);
      var sel=form.querySelector('#lead-type');
      list.push({
        id:'L-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),
        at:new Date().toISOString(),
        type:(sel&&sel.value)||'',
        typeLabel:(sel&&sel.selectedIndex>-1)?sel.options[sel.selectedIndex].text:'',
        status:status||'подготовлена',
        text:text
      });
      while(list.length>50) list.shift();
      localStorage.setItem(LEADS,JSON.stringify(list));
    }catch(e){}
  }
  function saveProfile(form){
    try{
      var p=readJSON(PROF,{});
      ['name','phone','telegram','email'].forEach(function(f){
        var el=form.querySelector('#lead-'+f);
        if(el&&String(el.value||'').trim()) p[f]=String(el.value).trim();
      });
      localStorage.setItem(PROF,JSON.stringify(p));
    }catch(e){}
  }

  /* ── сводка текущей конфигурации ── */
  function configLines(){
    var S = window.SECRETBOX;
    if(!S) return [];
    var s = S.load(), l = S.label(s), g = S.geometry(s), lines = [];
    lines.push('Модель: ' + l.modelName);
    lines.push('Размер: ' + l.dimensions);
    lines.push('Отделка: ' + l.finish);
    var eq = [];
    Object.keys(EQ).forEach(function(k){ var t = pick(EQ[k], s.equipment && s.equipment[k]); if(t) eq.push(t); });
    if(s.equipment && s.equipment.sensors) eq.push('Комплект датчиков');
    if(s.equipment && s.equipment.camera) eq.push('Сетевая камера');
    lines.push('Оборудование: ' + (eq.length ? eq.join(', ') : 'не выбрано'));
    var en = [];
    Object.keys(EN).forEach(function(k){ if(s.engineering && s.engineering[k]) en.push(EN[k]); });
    lines.push('Инженерия: ' + (en.length ? en.join(', ') : 'базовая'));
    if(g.plinth) lines.push('Цоколь: ' + g.plinth + ' мм');
    lines.push('Ориентировочная масса: ' + l.mass + ' кг');
    var p = window.SB_CONFIG && window.SB_CONFIG.pricing;
    if(p && p.show) lines.push('Предварительная смета: ≈ ' + (window.SB_PRICE ? SB_PRICE.fmt(l.estimate) : l.estimate) + ' ' + p.currency);
    return lines;
  }

  /* ── текст заявки ── */
  function compose(form){
    var cfg = window.SB_CONFIG || {}, c = cfg.contacts || {}, out = [];
    var v = function(id){ var el = form.querySelector('#' + id); return el ? String(el.value || '').trim() : ''; };
    out.push('ЗАЯВКА НА РАСЧЁТ · ' + ((cfg.brand && cfg.brand.name) || 'SECRET BOX'));
    out.push('Дата: ' + new Date().toLocaleString('ru-RU'));
    out.push('');
    if(v('lead-name'))    out.push('Имя: ' + v('lead-name'));
    if(v('lead-phone'))   out.push('Телефон: ' + v('lead-phone'));
    if(v('lead-telegram'))out.push('Telegram: ' + v('lead-telegram'));
    if(v('lead-email'))   out.push('E-mail: ' + v('lead-email'));
    var typeSel = form.querySelector('#lead-type');
    if(typeSel && typeSel.value) out.push('Запрос: ' + typeSel.options[typeSel.selectedIndex].text);
    var lines = configLines();
    if(lines.length){ out.push(''); out.push('— КОНФИГУРАЦИЯ —'); Array.prototype.push.apply(out, lines); }
    var comment = v('lead-comment');
    if(comment){ out.push(''); out.push('Комментарий: ' + comment); }
    return out.join('\n');
  }

  /* ── отправка ── */
  function tg(){ return (window.SB_CONTACTS && SB_CONTACTS.tgLink()) || null; }
  function phoneHref(){
    var c=(window.SB_CONFIG&&SB_CONFIG.contacts)||{};
    return c.phone ? (c.phoneHref || c.phone.replace(/[^\d+]/g,'')) : null;
  }

  function success(form, text, note, status){
    saveProfile(form);
    remember(form, text, status);
    var box = form.querySelector('.lead-done');
    if(!box) return;
    box.hidden = false;
    box.innerHTML = '<b>Заявка готова.</b> ' + note +
      '<div class="lead-done-actions">' +
      (tg() ? '<a class="btn btn-solid" href="' + tg() + '" target="_blank" rel="noopener">ОТКРЫТЬ TELEGRAM</a>' : '') +
      (phoneHref() ? '<a class="btn" href="tel:' + phoneHref() + '">ПОЗВОНИТЬ</a>' : '') +
      '<button type="button" class="btn" data-copy>СКОПИРОВАТЬ ЗАЯВКУ</button>' +
      '</div>';
    var cp = box.querySelector('[data-copy]');
    if(cp) cp.addEventListener('click', function(){ copy(text, cp); });
    box.scrollIntoView({behavior:'smooth', block:'nearest'});
  }

  function copy(text, btn){
    var done = function(){
      if(!btn) return;
      var t = btn.textContent; btn.textContent = 'СКОПИРОВАНО ✓';
      setTimeout(function(){ btn.textContent = t; }, 1800);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done, done); return; }
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); }catch(e){}
    document.body.removeChild(ta); done();
  }

  function submit(form){
    var cfg = window.SB_CONFIG || {}, leads = cfg.leads || {}, text = compose(form);
    var err = form.querySelector('.lead-error');
    if(err){ err.hidden = true; }

    // валидация: имя + хотя бы один контакт
    var name = form.querySelector('#lead-name');
    var hasContact = ['lead-phone','lead-telegram','lead-email'].some(function(id){
      var el = form.querySelector('#' + id); return el && String(el.value || '').trim();
    });
    if(!name || !String(name.value || '').trim() || !hasContact){
      if(err){ err.hidden = false; err.textContent = 'Укажите имя и хотя бы один контакт — телефон, Telegram или e-mail.'; }
      return;
    }

    if((leads.mode === 'formspree' || leads.mode === 'webhook' || leads.mode === 'telegram') && leads.endpoint){
      var btn = form.querySelector('[type="submit"]');
      if(btn){ btn.disabled = true; btn.textContent = 'ОТПРАВЛЯЕМ…'; }
      fetch(leads.endpoint, {
        method: 'POST',
        headers: leads.mode === 'formspree'
          ? {'Accept':'application/json','Content-Type':'application/json'}
          : {'Content-Type':'application/json'},
        body: JSON.stringify({
          source: 'secretbox.ru',
          text: text,
          name: (name && name.value) || '',
          phone: (form.querySelector('#lead-phone')||{}).value || '',
          telegram: (form.querySelector('#lead-telegram')||{}).value || '',
          email: (form.querySelector('#lead-email')||{}).value || '',
          type: (form.querySelector('#lead-type')||{}).value || '',
          comment: (form.querySelector('#lead-comment')||{}).value || '',
          config: text
        })
      }).then(function(r){
        if(btn){ btn.disabled = false; btn.textContent = 'ОТПРАВИТЬ ЗАЯВКУ'; }
        if(r.ok) success(form, text, 'Заявка ушла — ответим в рабочее время.', 'отправлена');
        else if(err){ err.hidden = false; err.textContent = 'Не удалось отправить (код ' + r.status + '). Напишите нам напрямую — контакты ниже.'; }
      }).catch(function(){
        if(btn){ btn.disabled = false; btn.textContent = 'ОТПРАВИТЬ ЗАЯВКУ'; }
        success(form, text, 'Отправьте её нам в Telegram — мы на связи.', 'подготовлена');
      });
      return;
    }

    // режим 'links': заявка готова, отправка кнопками
    success(form, text, 'Скопируйте её и отправьте в Telegram, на почту или позвоните.', 'подготовлена');
  }

  function init(){
    var form = document.querySelector('#lead-form');
    if(!form) return;
    var cfg = window.SB_CONFIG || {};
    // подстановка контактов в блок «Куда уходит заявка» (блок живёт в сайдбаре, не в форме)
    var dest = document.querySelector('.lead-dest');
    if(dest){
      var rows = [];
      var link = tg();
      if(link) rows.push('<a href="' + link + '" target="_blank" rel="noopener">Telegram · ' + SB_CONTACTS.tgLabel() + '</a>');
      if(cfg.contacts && cfg.contacts.email) rows.push('<a href="mailto:' + cfg.contacts.email + '">' + cfg.contacts.email + '</a>');
      if(phoneHref()) rows.push('<a href="tel:' + phoneHref() + '">' + cfg.contacts.phone + '</a>');
      if(cfg.contacts && cfg.contacts.workHours) rows.push('<span class="muted">' + cfg.contacts.workHours + '</span>');
      dest.innerHTML = rows.length ? rows.join('<br>') : '<span class="muted">Контакты подключаются — оставьте заявку, мы свяжемся.</span>';
    }
    // сводка конфигурации
    var sum = document.querySelector('.lead-config');
    if(sum){
      var lines = configLines();
      sum.innerHTML = lines.length
        ? lines.map(function(x){ return '<div>' + x + '</div>'; }).join('')
        : '<div class="muted">Конфигурация не выбрана — подберём вместе.</div>';
    }
    // подстановка данных профиля из личного кабинета
    try{
      var prof=readJSON(PROF,{});
      ['name','phone','telegram','email'].forEach(function(f){
        var el=form.querySelector('#lead-'+f);
        if(el && !String(el.value||'').trim() && prof[f]) el.value=prof[f];
      });
    }catch(e){}
    form.addEventListener('submit', function(e){ e.preventDefault(); submit(form); });
    // ?type=dealer / ?type=model-a … — предвыбор типа запроса
    try{
      var q=new URLSearchParams(location.search).get('type');
      var sel=form.querySelector('#lead-type');
      if(q&&sel&&sel.querySelector('option[value="'+q+'"]'))sel.value=q;
    }catch(e){}
    // перерисовка сводки при изменении конфигурации в другой вкладке
    document.addEventListener('secretbox:state', function(){
      var box = document.querySelector('.lead-config');
      if(box) box.innerHTML = configLines().map(function(x){ return '<div>' + x + '</div>'; }).join('');
    });
  }

  window.SB_LEADS = { compose: compose, configLines: configLines, copy: copy };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
