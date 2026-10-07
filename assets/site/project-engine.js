/* SECRET BOX — project engine v1.0 */
(function(g){
'use strict';
function n(v){return Number(v)||0}
function build(config){
 const L=g.SECRETBOX_LAYOUT.derive(config), a=config.architecture||{},e=config.equipment||{},en=config.engineering||{},d=L.outer;
 const rows=[];
 const add=(category,name,qty,unit,mass,price,note)=>rows.push({category,name,qty,unit,mass:+(mass||0).toFixed(1),price:Math.round(price||0),note:note||''});
 add('Корпус','Панель корпуса',2,'шт',d.W*d.H*d.panel/1e9*650,Math.max(0,d.W*d.H/1e5*900),'раскрой по параметрам');
 add('Корпус','Боковые панели',2,'шт',d.H*d.D*d.panel/1e9*650,Math.max(0,d.H*d.D/1e5*900),'раскрой по параметрам');
 add('Корпус','Верх/низ',2,'шт',d.W*d.D*d.panel/1e9*650,Math.max(0,d.W*d.D/1e5*900),'раскрой по параметрам');
 add('Корпус','Цоколь',1,'шт',Math.max(4,d.W*d.D/1e6*2.2),4500,'несущий');
 add('Фасад','Дверь сэндвич',L.doors.count,'шт',Math.max(4,d.H*L.doors.width*a.doorSandwich/1e9*700),Math.max(7000,L.doors.width*d.H/1e5*500),'толщина '+L.doors.thickness+' мм');
 add('Крепление','Вертикальная монтажная рейка',2,'шт',2.5,1800,'регулируемая');
 add('Крепление','Каретка + траверса',8,'компл',0.35,650,'быстросъём');
 add('Крепление','Виброопоры',en.vibration?8:0,'шт',0.12,180,'изолированный контур');
 add('Инженерия','DIN-панель',en.din?1:0,'шт',3,5500,'сервисный модуль');
 add('Инженерия','RCD / Surge',en.rkn?1:0,'компл',0.8,5500,'защита питания');
 add('Инженерия','Leak Protection',en.leakProtection?1:0,'компл',1.2,8000,'датчики + клапан');
 add('Инженерия','UPS / Watchdog',en.ups?1:0,'компл',7,18000,'резерв + контроль');
 const light=L.equipment.light,fan=L.equipment.fan;
 add('Оборудование',light.label,1,'шт',light.mass,light.power?({SE3000:28000,SE5000:42000,G8600:56000}[e.light]||0):0,'Spider Farmer');
 add('Оборудование',fan.label,1,'шт',fan.mass,({SF4:9000,SF6:13000,SF8:18000}[e.fan]||0),'Spider Farmer');
 add('Оборудование','GGS Controller',e.controller==='GGS'?1:0,'шт',0.7,e.controller==='GGS'?7000:0,'');
 add('Оборудование','Humidifier',e.climate==='humidifier'?1:0,'шт',2.2,e.climate==='humidifier'?7000:0,'');
 add('Оборудование','Smart Drip',e.irrigation==='smart-drip'?1:0,'компл',3,12000,'');
 add('Оборудование','Reservoir 20 L',e.reservoir==='20L'?1:0,'шт',22,4500,'рабочая масса');
 add('Сервис','Выдвижной поддон',1,'шт',Math.max(5,L.zones.tray.w*L.zones.tray.d/1e6*2.5),8500,'');
 add('Сервис','SCROG grid',1,'шт',2.5,3200,'регулируемая высота');
 add('Акустика','Silencer',en.silencer?1:0,'шт',8,10000,'верхний noise box');
 add('Акустика','Шумовой модуль / baffling',1,'компл',Math.max(5,d.W*d.D/1e5*0.08),9000,'верхний технический блок');
 add('Датчики','Sensor Pack',e.sensors?1:0,'компл',0.5,4500,'');
 add('Датчики','RTSP Camera',e.camera?1:0,'шт',0.3,5500,'');
 const total=rows.reduce((s,x)=>s+x.qty*x.price,0), mass=rows.reduce((s,x)=>s+x.qty*x.mass,0);
 return {layout:L,rows,totalPrice:Math.round(total/500)*500,totalMass:+mass.toFixed(1),componentCount:rows.reduce((s,x)=>s+x.qty,0)};
}
function exportText(p){
 const lines=['SECRET BOX CUSTOM — BOM','Размер: '+p.layout.outer.W+' × '+p.layout.outer.D+' × '+p.layout.outer.H+' мм',''];
 p.rows.filter(x=>x.qty>0).forEach(x=>lines.push([x.category,x.name,x.qty,x.unit,x.mass+' кг/ед.',x.price+' ₽/ед.'].join(' | ')));
 lines.push('','ИТОГО | '+p.componentCount+' поз. | '+p.totalMass+' кг | '+p.totalPrice+' ₽');
 return lines.join('\n');
}
g.SECRETBOX_PROJECT={build,exportText};
})(window);
