/* SECRET BOX — 3D ↔ BOM bridge v1.0 */
(function(){
'use strict';
function matchBom(name){
 const n=String(name||'').toUpperCase();
 if(/ВИБРО|VIBRATION/.test(n))return ['Крепление','Виброопоры'];
 if(/НАПРАВЛЯЮЩАЯ/.test(n))return ['Крепление','Направляющая поддона'];
 if(/ПЛАТФОРМА|PLATFORM/.test(n))return ['Крепление','Монтажная платформа'];
 if(/SE3000|SE5000|G8600|СВЕТИЛЬНИК|LIGHT/.test(n))return ['Оборудование','Свет Spider Farmer'];
 if(/ВЕНТИЛЯТОР|FAN|SF4|SF6|SF8/.test(n))return ['Оборудование','Вентилятор Spider Farmer'];
 if(/РЕЗЕРВУАР|БАК|RESERVOIR/.test(n))return ['Оборудование','Бак 20 л'];
 if(/DIN/.test(n))return ['Инженерия','DIN-панель'];
 if(/ГЛУШИТЕЛЬ|SILENCER/.test(n))return ['Акустика','Глушитель'];
 if(/ШУМО|АКУСТ|ПЕРЕГОРОДКА|ВОЗДУШНАЯ КАМЕРА|NOISE|BAFFLE|AIR_CHAMBER/.test(n))return ['Акустика','Шумовой модуль / baffling'];
 if(/ЭКРАН/.test(n))return ['Камера','Экран рабочей камеры'];
 if(/SCROG/.test(n))return ['Сервис','SCROG grid'];
 if(/ПОДДОН|TRAY/.test(n))return ['Сервис','Выдвижной поддон'];
 if(/РЕЙКА|КАРЕТКА|СТОПОР|ПОПЕРЕЧИНА|ПЕРЕКЛАДИНА|RAIL|UPRIGHT/.test(n))return ['Крепление','Монтажная рейка / каретка'];
 if(/КАССЕТА|ТЕХНИЧ|СЕРВИСН|SERVICE|TECH_COLUMN/.test(n))return ['Сервис','Техническая колонна / сервисная кассета'];
 if(/ДВЕР|РУЧКА|ПЕТЛЯ|DOOR/.test(n))return ['Фасад','Дверь сэндвич'];
 if(/КАБЕЛЬ/.test(n))return ['Сервис','Кабельная трасса'];
 if(/СТОЙКА|РАМА|ПАНЕЛЬ|ЦОКОЛЬ|FRAME|PANEL|BACK|PLINTH|БОКОВИН|ДНО|ПОЛКА/.test(n))return ['Корпус','Панель корпуса'];
 if(/SENSOR|ДАТЧИК/.test(n))return ['Датчики','Комплект датчиков'];
 if(/GGS|CONTROLLER|КОНТРОЛЛЕР/.test(n))return ['Оборудование','Контроллер GGS'];
 return ['—','Инженерная деталь'];
}
function install(){
 const info=document.getElementById('info'), iN=document.getElementById('infoName');
 if(!info||!iN||info.dataset.bomBridge)return;
 info.dataset.bomBridge='1';
 const row=document.createElement('div'); row.id='bomLink'; row.className='dm'; row.style.color='#c5a46c';
 info.appendChild(row);
 const paint=()=>{
   const m=matchBom(iN.textContent);
   row.textContent='BOM · '+m[0]+' / '+m[1];
 };
 new MutationObserver(paint).observe(iN,{childList:true,characterData:true,subtree:true});
 paint();
}
function annotate(){
 try{
  if(window.SECRETBOX_PROJECT&&window.SECRETBOX&&window.SECRETBOX_LAYOUT){
   const s=SECRETBOX.load(), p=SECRETBOX_PROJECT.build(s);
   window.__SECRETBOX_BOM_INDEX={total:p.componentCount,price:p.totalPrice,mass:p.totalMass,rows:p.rows};
  }
 }catch(e){}
}
install();annotate();
if(window.SECRETBOX&&typeof window.SECRETBOX.subscribe==='function')window.SECRETBOX.subscribe(annotate);
window.__SECRETBOX_BOM_BRIDGE={version:'1.0',matchBom};
})();