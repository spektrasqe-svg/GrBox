/* WALLFORM® — общий код страниц: шапка/футер из конфига, меню, мини-расчёт,
   рендер каталога и расходников из site-config.js. */
(function () {
  'use strict';

  var C = window.SITE_CONFIG || {};

  /* ---------- подстановка бренда и контактов ---------- */
  function fill() {
    var b = C.brand || {}, c = C.contacts || {};

    document.querySelectorAll('[data-brand]').forEach(function (el) {
      el.innerHTML = b.name + '<sup>' + (b.reg || '') + '</sup>';
    });
    document.querySelectorAll('[data-tagline]').forEach(function (el) {
      el.textContent = b.tagline || '';
    });
    document.querySelectorAll('[data-city]').forEach(function (el) {
      if (c.city || b.city) el.textContent = c.city || b.city; else el.closest('[data-hide-if-empty]')?.remove();
    });

    document.querySelectorAll('[data-phone]').forEach(function (el) {
      if (c.phone) el.textContent = c.phone;
      else { var w = el.closest('[data-hide-if-empty]') || el; w.style.display = 'none'; }
    });
    document.querySelectorAll('[data-phone-link]').forEach(function (el) {
      if (c.phoneHref) el.href = 'tel:' + c.phoneHref;
      else { var w2 = el.closest('[data-hide-if-empty]') || el; w2.style.display = 'none'; }
    });
    document.querySelectorAll('[data-email]').forEach(function (el) {
      if (c.email) { el.textContent = c.email; el.href = 'mailto:' + c.email; }
      else { var w3 = el.closest('[data-hide-if-empty]') || el; w3.style.display = 'none'; }
    });
    document.querySelectorAll('[data-hours]').forEach(function (el) {
      if (c.hours) el.textContent = c.hours;
      else { var w4 = el.closest('[data-hide-if-empty]') || el; w4.style.display = 'none'; }
    });
    document.querySelectorAll('[data-address]').forEach(function (el) {
      if (c.address) el.textContent = c.address;
      else { var w5 = el.closest('[data-hide-if-empty]') || el; w5.style.display = 'none'; }
    });
    document.querySelectorAll('[data-link=telegram]').forEach(function (el) {
      if (c.telegram) el.href = c.telegram; else el.style.display = 'none';
    });
    document.querySelectorAll('[data-link=whatsapp]').forEach(function (el) {
      if (c.whatsapp) el.href = c.whatsapp; else el.style.display = 'none';
    });

    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
    document.querySelectorAll('[data-manager]').forEach(function (el) {
      el.textContent = (C.leads && C.leads.managerName) || 'менеджер';
    });
  }

  /* ---------- мобильное меню ---------- */
  function nav() {
    var burger = document.querySelector('.burger');
    var menu = document.querySelector('.nav');
    if (!burger || !menu) return;
    burger.addEventListener('click', function () { menu.classList.toggle('open'); });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') menu.classList.remove('open');
    });
  }

  /* ---------- рендер категорий каталога ---------- */
  function catalog() {
    var host = document.getElementById('catalogGrid');
    if (!host || !C.categories) return;

    var html = C.categories.map(function (cat) {
      return '<a class="card" href="order.html?cat=' + cat.id + '">' +
        '<div class="thumb ph ' + (cat.finish || 'ph-stone') + '" data-label="' + cat.name + '"></div>' +
        '<div class="k">' + (cat.unit === 'м²' ? 'панели' : cat.unit) + '</div>' +
        '<h3>' + cat.name + '</h3>' +
        '<p>' + (cat.note || '') + '</p>' +
        '<div class="price">от ' + cat.price.toLocaleString('ru-RU') + ' ₽<small>/ м²</small></div>' +
        '<span class="go">Рассчитать <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
        '</a>';
    }).join('');

    host.innerHTML = html +
      '<div class="card card-cta"><h3>Не нашли нужную панель?</h3>' +
      '<p>Работаем с 40+ поставщиками: подберём фактуру, толщину и формат под ваш проект.</p>' +
      '<span class="go">Оставить заявку <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div>';
  }

  /* ---------- рендер расходников ---------- */
  function consumables() {
    var host = document.getElementById('consList');
    if (!host || !C.consumables) return;
    host.innerHTML = C.consumables.map(function (it) {
      return '<div class="row"><b>' + it.name + '</b>' +
        '<span>' + it.unit + (it.note ? ' · ' + it.note : '') + '</span>' +
        '<span class="p">' + it.price.toLocaleString('ru-RU') + ' ₽</span></div>';
    }).join('');
  }

  /* ---------- рендер тарифов на работы ---------- */
  function worksList() {
    var host = document.getElementById('worksList');
    if (!host || !C.works) return;
    host.innerHTML = Object.keys(C.works).map(function (k) {
      var w = C.works[k];
      return '<div class="row"><b>' + w.name + '</b><span>за ' + w.unit + '</span>' +
        '<span class="p">от ' + w.price.toLocaleString('ru-RU') + ' ₽</span></div>';
    }).join('');
  }

  /* ---------- мини-расчёт на главной ---------- */
  function miniCalc() {
    var host = document.getElementById('miniCalc');
    if (!host || !window.CalcEngine) return;

    var sel = host.querySelector('[name=category]');
    if (sel && C.categories) {
      sel.innerHTML = C.categories.map(function (c) {
        return '<option value="' + c.id + '">' + c.name + ' — от ' + c.price.toLocaleString('ru-RU') + ' ₽/м²</option>';
      }).join('');
    }

    var out = host.querySelector('.mini-out');
    var run = function () {
      var area = parseFloat(host.querySelector('[name=area]').value) || 0;
      var method = host.querySelector('[name=method]') ? (host.querySelector('[name=method]').value || 'glue') : 'glue';
      var r = window.CalcEngine.compute(area, sel ? sel.value : null, method, { consumables: true });
      if (out) {
        out.innerHTML = '<div class="big">' + (area > 0 ? r.total.toLocaleString('ru-RU') + ' ₽' : '—') +
          '<small>предварительно · ≈ ' + (area > 0 ? r.perM2.toLocaleString('ru-RU') + ' ₽/м²' : 'укажите площадь') + '</small></div>' +
          '<div class="brk">' +
          '<div class="r"><span>Панели (с запасом ' + r.grossArea + ' м²)</span><b>' + r.materials.sum.toLocaleString('ru-RU') + ' ₽</b></div>' +
          '<div class="r"><span>Расходники</span><b>' + r.consumables.sum.toLocaleString('ru-RU') + ' ₽</b></div>' +
          '<div class="r"><span>Монтаж</span><b>' + r.works.sum.toLocaleString('ru-RU') + ' ₽</b></div>' +
          '</div>';
      }
    };
    host.addEventListener('input', run);
    host.addEventListener('change', run);
    run();
  }

  /* ---------- формы заявки ---------- */
  function forms() {
    document.querySelectorAll('form[data-lead]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!window.Leads) return;
        var extra = f.__extraText ? f.__extraText() : null;
        window.Leads.submit(f, extra, f.querySelector('.form-ok'));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    fill(); nav(); catalog(); consumables(); worksList(); miniCalc(); forms();
  });
})();
