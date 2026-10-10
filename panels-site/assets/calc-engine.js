/* WALLFORM® — расчётный движок: материалы + расходники + работы.
   Чистая функция compute() — используется калькулятором и мини-расчётом на главной. */
(function () {
  'use strict';

  function cfg() { return window.SITE_CONFIG || {}; }
  function num(v, d) { v = parseFloat(v); return isFinite(v) && v >= 0 ? v : (d || 0); }
  function round(v, p) { var m = Math.pow(10, p || 0); return Math.round(v * m) / m; }

  /* Вход:
     area          — площадь стен, м²
     categoryId    — id категории из site-config.js
     method        — 'glue' | 'frame'
     opts          — { prep:bool, demo:bool, skirtingMl:number, consumables:bool,
                       electricMl:number } */
  function compute(area, categoryId, method, opts) {
    opts = opts || {};
    var C = cfg();
    var waste = (C.calc && C.calc.wastePercent) || 10;

    area = num(area, 0);
    var cat = (C.categories || []).find(function (c) { return c.id === categoryId; })
           || (C.categories || [])[0] || { name: '—', price: 0 };
    var works = C.works || {};
    var cons = C.consumables || [];

    var netArea = area;
    var grossArea = round(netArea * (1 + waste / 100), 1);        // с запасом на подрез

    /* ---- материалы ---- */
    var costPanels = round(grossArea * num(cat.price), 0);

    /* ---- расходники ---- */
    var items = [];
    var costConsumables = 0;

    if (opts.consumables !== false) {
      var glue = cons.find(function (x) { return x.id === 'glue'; });
      if (glue && method !== 'frame') {
        var tubes = Math.ceil(grossArea * ((C.calc && C.calc.defaultGluePerM2) || 0.22));
        items.push({ name: glue.name, qty: tubes, unit: glue.unit, sum: tubes * glue.price });
      }
      var grunt = cons.find(function (x) { return x.id === 'grunt'; });
      if (grunt && opts.prep) {
        var cans = Math.ceil(netArea / 50);
        items.push({ name: grunt.name, qty: cans, unit: grunt.unit, sum: cans * grunt.price });
      }
      if (method === 'frame') {
        var fasten = cons.find(function (x) { return x.id === 'fasten'; });
        if (fasten) {
          var packs = Math.ceil(netArea / 10);
          items.push({ name: fasten.name, qty: packs, unit: fasten.unit, sum: packs * fasten.price });
        }
        var prof = cons.find(function (x) { return x.id === 'profSt'; });
        if (prof) {
          var profMl = round(netArea * 1.2, 1);                    // стойки каркаса ≈ 1,2 пог.м/м²
          var profQty = Math.ceil(profMl / 2.5);
          items.push({ name: prof.name + ' (каркас)', qty: profQty, unit: prof.unit, sum: profQty * prof.price });
        }
      }
      var seal = cons.find(function (x) { return x.id === 'sealant'; });
      if (seal) {
        var seals = Math.ceil(netArea / 12);
        items.push({ name: seal.name, qty: seals, unit: seal.unit, sum: seals * seal.price });
      }
    }

    var skirtingMl = num(opts.skirtingMl, 0);
    if (skirtingMl > 0 && opts.consumables !== false) {
      var skirt = cons.find(function (x) { return x.id === 'skirt'; });
      if (skirt) {
        var skirtQty = Math.ceil(skirtingMl / 2.0);
        items.push({ name: skirt.name, qty: skirtQty, unit: skirt.unit, sum: skirtQty * skirt.price });
      }
    }

    costConsumables = items.reduce(function (s, i) { return s + i.sum; }, 0);

    /* ---- работы ---- */
    var workItems = [];
    var methodWork = method === 'frame' ? works.frame : works.glue;
    if (methodWork) workItems.push({ name: methodWork.name, qty: netArea, unit: methodWork.unit, sum: round(netArea * methodWork.price, 0) });
    if (opts.prep && works.prep) workItems.push({ name: works.prep.name, qty: netArea, unit: works.prep.unit, sum: round(netArea * works.prep.price, 0) });
    if (opts.demo && works.demo) workItems.push({ name: works.demo.name, qty: netArea, unit: works.demo.unit, sum: round(netArea * works.demo.price, 0) });
    if (skirtingMl > 0 && works.skirting) workItems.push({ name: works.skirting.name, qty: skirtingMl, unit: works.skirting.unit, sum: round(skirtingMl * works.skirting.price, 0) });
    var electricMl = num(opts.electricMl, 0);
    if (electricMl > 0 && works.electric) workItems.push({ name: works.electric.name, qty: electricMl, unit: works.electric.unit, sum: round(electricMl * works.electric.price, 0) });

    var costWorks = workItems.reduce(function (s, i) { return s + i.sum; }, 0);

    var total = costPanels + costConsumables + costWorks;

    return {
      category: cat,
      area: round(netArea, 1),
      grossArea: grossArea,
      method: method,
      materials: { items: [{ name: cat.name, qty: grossArea, unit: 'м²', sum: costPanels }], sum: costPanels },
      consumables: { items: items, sum: costConsumables },
      works: { items: workItems, sum: costWorks },
      total: total,
      perM2: netArea > 0 ? round(total / netArea, 0) : 0,
    };
  }

  /* Текст заявки для отправки менеджеру */
  function toText(r, contact) {
    var L = [];
    L.push('ЗАЯВКА WALLFORM®');
    if (contact) {
      if (contact.name) L.push('Имя: ' + contact.name);
      if (contact.phone) L.push('Телефон: ' + contact.phone);
      if (contact.city) L.push('Город / объект: ' + contact.city);
      if (contact.comment) L.push('Комментарий: ' + contact.comment);
    }
    L.push('');
    L.push('Категория: ' + r.category.name);
    L.push('Площадь стен: ' + r.area + ' м² (с запасом: ' + r.grossArea + ' м²)');
    L.push('Монтаж: ' + (r.method === 'frame' ? 'на каркас' : 'на клей'));
    L.push('');
    L.push('— Материалы: ' + r.materials.sum.toLocaleString('ru-RU') + ' ₽');
    L.push('— Расходники: ' + r.consumables.sum.toLocaleString('ru-RU') + ' ₽');
    L.push('— Работы: ' + r.works.sum.toLocaleString('ru-RU') + ' ₽');
    L.push('ИТОГО (предв.): ' + r.total.toLocaleString('ru-RU') + ' ₽  ·  ≈ ' + r.perM2.toLocaleString('ru-RU') + ' ₽/м²');
    L.push('');
    L.push('Смета предварительная. Точный расчёт — после замера.');
    return L.join('\n');
  }

  window.CalcEngine = { compute: compute, toText: toText };
})();
