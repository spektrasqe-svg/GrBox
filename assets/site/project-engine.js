/* SECRET BOX — project engine v1.0 */
(function(g){
'use strict';
function n(v){return Number(v)||0}
function build(config){
 const L=g.SECRETBOX_LAYOUT.derive(config), a=config.architecture||{},e=config.equipment||{},en=config.engineering||{},d=L.outer;
 // все цены берём из site-config.js → SB_CONFIG.pricing.book; правь прайс там, а не здесь
 const B=(g.SB_CONFIG&&g.SB_CONFIG.pricing&&g.SB_CONFIG.pricing.book)||{};
 const bk=(k,dflt)=>(B[k]!==undefined&&B[k]!==null)?B[k]:dflt;
 const m2=v=>Math.max(0,v/1e6);
 const rows=[];
 const add=(category,name,qty,unit,mass,price,note)=>rows.push({category,name,qty,unit,mass:+(mass||0).toFixed(1),price:Math.round(price||0),note:note||''});
 add('Корпус','Панель корпуса',2,'шт',d.W*d.H*d.panel/1e9*650,m2(d.W*d.H)*bk('panelPerM2',9000),'раскрой по параметрам');
 add('Корпус','Боковые панели',2,'шт',d.H*d.D*d.panel/1e9*650,m2(d.H*d.D)*bk('panelPerM2',9000),'раскрой по параметрам');
 add('Корпус','Верх/низ',2,'шт',d.W*d.D*d.panel/1e9*650,m2(d.W*d.D)*bk('panelPerM2',9000),'раскрой по параметрам');
 add('Корпус','Цоколь',1,'шт',Math.max(4,d.W*d.D/1e6*2.2),bk('plinth',4500),'несущий');
 add('Фасад','Дверь сэндвич',L.doors.count,'шт',Math.max(4,d.H*L.doors.width*a.doorSandwich/1e9*700),Math.max(bk('doorMin',7000),m2(L.doors.width*d.H)*bk('doorPerM2',5000)),'толщина '+L.doors.thickness+' мм');
 add('Крепление','Вертикальная монтажная рейка',2,'шт',2.5,bk('rail',1800),'регулируемая');
 add('Крепление','Каретка + траверса',8,'компл',0.35,bk('carriage',650),'быстросъём');
 add('Крепление','Виброопоры',en.vibration?8:0,'шт',0.12,bk('vibro',180),'изолированный контур');
 add('Инженерия','DIN-панель',en.din?1:0,'шт',3,bk('din',5500),'сервисный модуль');
 add('Инженерия','RCD / Surge',en.rkn?1:0,'компл',0.8,bk('rcd',5500),'защита питания');
 add('Инженерия','Защита от протечки',en.leakProtection?1:0,'компл',1.2,bk('leak',8000),'датчики + клапан');
 add('Инженерия','ИБП / контроль',en.ups?1:0,'компл',7,bk('ups',18000),'резерв + контроль');
 const light=L.equipment.light,fan=L.equipment.fan;
 add('Оборудование',light.label,1,'шт',light.mass,light.power?((B.equipment&&B.equipment[e.light])||0):0,'Spider Farmer');
 add('Оборудование',fan.label,1,'шт',fan.mass,((B.fan&&B.fan[e.fan])||0),'Spider Farmer');
 add('Оборудование','Контроллер GGS',e.controller==='GGS'?1:0,'шт',0.7,e.controller==='GGS'?bk('controller',7000):0,'');
 add('Оборудование','Увлажнитель',e.climate==='humidifier'?1:0,'шт',2.2,e.climate==='humidifier'?bk('humidifier',7000):0,'');
 add('Оборудование','Автополив',e.irrigation==='smart-drip'?1:0,'компл',3,e.irrigation==='smart-drip'?bk('irrigation',12000):0,'');
 add('Оборудование','Бак 20 л',e.reservoir==='20L'?1:0,'шт',22,e.reservoir==='20L'?bk('reservoir',4500):0,'рабочая масса');
 add('Сервис','Выдвижной поддон',1,'шт',Math.max(5,L.zones.поддон.w*L.zones.поддон.d/1e6*2.5),bk('tray',8500),'');
 add('Сервис','Сетка SCROG',1,'шт',2.5,bk('scrog',3200),'регулируемая высота');
 add('Акустика','Глушитель',en.silencer?1:0,'шт',8,bk('silencer',10000),'верхний noise box');
 add('Акустика','Шумовой модуль / baffling',1,'компл',Math.max(5,d.W*d.D/1e5*0.08),bk('baffle',9000),'верхний технический блок');
 add('Датчики','Комплект датчиков',e.sensors?1:0,'компл',0.5,e.sensors?bk('sensors',4500):0,'');
 add('Датчики','Сетевая камера',e.camera?1:0,'шт',0.3,e.camera?bk('camera',5500):0,'');
 const total=rows.reduce((s,x)=>s+x.qty*x.price,0), mass=rows.reduce((s,x)=>s+x.qty*x.mass,0);
 return {layout:L,rows,totalPrice:Math.round(total/500)*500,totalMass:+mass.toFixed(1),componentCount:rows.reduce((s,x)=>s+x.qty,0)};
}
function projectId(){return 'SB-'+new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)+'-'+Math.random().toString(36).slice(2,6).toUpperCase()}
function create(config,meta){
 const p=build(config), now=new Date().toISOString();
 return {schema:'SECRETBOX-PROJECT/1.0',id:(meta&&meta.id)||projectId(),name:(meta&&meta.name)||'SECRET BOX Индивидуальный',createdAt:(meta&&meta.createdAt)||now,updatedAt:now,config:JSON.parse(JSON.stringify(config)),project:p};
}
function save(config,meta){
 const p=create(config,meta), key='secretbox.project.'+p.id;
 localStorage.setItem(key,JSON.stringify(p)); localStorage.setItem('secretbox.project.current',p.id); return p;
}
function load(id){
 const key=id||localStorage.getItem('secretbox.project.current');
 try{return key?JSON.parse(localStorage.getItem('secretbox.project.'+key)||'null'):null}catch(e){return null}
}
function list(){
 const out=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf('secretbox.project.')===0&&k!=='secretbox.project.current'){try{const p=JSON.parse(localStorage.getItem(k));if(p)out.push({id:p.id,name:p.name,updatedAt:p.updatedAt})}catch(e){}}}return out.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
}
function exportJSON(p){return JSON.stringify(p,null,2)}
function download(name,textValue,type){
 const blob=new Blob([textValue],{type:type||'text/plain;charset=utf-8'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),800);
}
function exportText(p){
 const lines=['SECRET BOX ИНДИВИДУАЛЬНЫЙ — СПЕЦИФИКАЦИЯ','Размер: '+p.layout.outer.W+' × '+p.layout.outer.D+' × '+p.layout.outer.H+' мм',''];
 p.rows.filter(x=>x.qty>0).forEach(x=>lines.push([x.category,x.name,x.qty,x.unit,x.mass+' кг/ед.',x.price+' ₽/ед.'].join(' | ')));
 lines.push('','ИТОГО | '+p.componentCount+' поз. | '+p.totalMass+' кг | '+p.totalPrice+' ₽');
 return lines.join('\n');
}
g.SECRETBOX_PROJECT={build,exportText,create,save,load,list,exportJSON,download};
})(window);
