/* SECRET BOX — 3D ↔ BOM bridge v1.0 */
(function(){
'use strict';
function matchBom(name){
 const n=String(name||'').toUpperCase();
 if(/LIGHT|SE3000|SE5000|G8600/.test(n))return ['Оборудование','Spider Farmer light'];
 if(/FAN|SF4|SF6|SF8/.test(n))return ['Оборудование','Spider Farmer fan'];
 if(/RESERVOIR|БАК/.test(n))return ['Оборудование','Reservoir 20 L'];
 if(/DIN/.test(n))return ['Инженерия','DIN-панель'];
 if(/SILENCER/.test(n))return ['Акустика','Silencer'];
 if(/NOISE|BAFFLE|AIR_CHAMBER/.test(n))return ['Акустика','Шумовой модуль / baffling'];
 if(/TRAY|ПОДДОН|PLATFORM/.test(n))return ['Сервис','Выдвижной поддон'];
 if(/SCROG/.test(n))return ['Сервис','SCROG grid'];
 if(/VIBRATION/.test(n))return ['Крепление','Виброопоры'];
 if(/UPRIGHT|CARRIAGE|RAIL/.test(n))return ['Крепление','Вертикальная монтажная рейка'];
 if(/TECH_COLUMN|SERVICE/.test(n))return ['Сервис','Tech Column / service cassette'];
 if(/DOOR|ДВЕРЬ/.test(n))return ['Фасад','Дверь сэндвич'];
 if(/FRAME|PANEL|BACK|PLINTH|БОКОВИН|ДНО|ПОЛКА/.test(n))return ['Корпус','Панель корпуса'];
 if(/SENSOR/.test(n))return ['Датчики','Sensor Pack'];
 if(/GGS|CONTROLLER/.test(n))return ['Оборудование','GGS Controller'];
 return ['—','Инженерная деталь'];
}
function install(){
 const info=document.getElementById('info'), iN=document.getElementById('iN');
 if(!info||!iN||info.dataset.bomBridge)return;
 info.dataset.bomBridge='1';
 const row=document.createElement('div'); row.id='bomLink'; row.className='dm'; row.style.color='#c4a96a';
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
setInterval(annotate,1000);
window.__SECRETBOX_BOM_BRIDGE={version:'1.0',matchBom};
})();