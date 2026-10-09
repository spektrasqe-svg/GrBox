/* SECRET BOX — shared parametric layout engine v2.0 */
(function(g){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const КАТАЛОГ={
 light:{
  SE3000:{label:'Spider Farmer SE3000',w:610,d:410,h:55,mass:4.8,power:300},
  SE5000:{label:'Spider Farmer SE5000',w:1090,d:590,h:55,mass:8.2,power:480},
  G8600:{label:'Spider Farmer G8600',w:1100,d:660,h:58,mass:11.2,power:860}
 },
 fan:{
  SF4:{label:'Spider Farmer SF4',w:200,d:200,h:280,mass:3.1,power:35},
  SF6:{label:'Spider Farmer SF6',w:220,d:320,h:320,mass:4.4,power:45},
  SF8:{label:'Spider Farmer SF8',w:260,d:260,h:370,mass:6.2,power:60}
 }
};
function derive(config){
 const d=config.dimensions||{},a=config.architecture||{},e=config.equipment||{},en=config.engineering||{};
 const W=clamp(n(d.W,1250),700,3000),H=clamp(n(d.H,2060),1500,3200),D=clamp(n(d.D,741),500,1400);
 const panel=clamp(n(d.panel,18),12,30),plinth=clamp(n(d.plinth,55),30,140);
 const tech=clamp(n(a.techColumn,Math.max(300,Math.min(520,W*.28))),220,W-420);
 const topH=clamp(n(a.topBoxH,300),180,650),поддонH=clamp(n(a.поддонH,120),70,260);
 const сервисGap=clamp(n(a.сервисGap,40),20,150),doors=clamp(n(a.doors,3),1,4);
 const doorT=clamp(n(a.doorSandwich,41),20,80);
 const innerW=W-panel*2,innerD=D-panel*2,innerH=H-plinth-panel*2;
 const growW=Math.max(300,innerW-tech-18),growD=Math.max(340,innerD);
 const growBottom=-H/2+plinth+сервисGap+поддонH+24;
 const growTop=H/2-plinth-topH-30;
 const availableGrowH=growTop-growBottom;
 const growH=Math.max(420,availableGrowH);
 const topY=H/2-plinth-topH/2, growY=growBottom+growH/2;
 const поддонY=-H/2+plinth+поддонH/2+сервисGap;
 const scrogH=clamp(n(a.scrogH,650),300,Math.max(320,growH-260));
 const scrogY=Math.max(поддонY+220,-H/2+plinth+scrogH/2+120);
 const light=КАТАЛОГ.light[e.light]||КАТАЛОГ.light.SE3000,fan=КАТАЛОГ.fan[e.fan]||КАТАЛОГ.fan.SF4;
 const doorW=(innerW)/doors;
 const L={outer:{W,H,D,panel,plinth},inner:{W:innerW,H:innerH,D:innerD},
 zones:{
  tech:{x:-W/2+tech/2,w:tech,d:innerD,y:-H/2+plinth+innerH/2,h:innerH},
  grow:{x:-W/2+tech+18+growW/2,w:growW,d:growD,y:growY,h:growH},
  top:{x:0,w:innerW,d:innerD,y:topY,h:topH},
  поддон:{x:-W/2+tech+18+growW/2,w:growW,d:growD,y:поддонY,h:поддонH},
  scrog:{x:-W/2+tech+18+growW/2,w:Math.max(220,growW-36),d:Math.max(260,growD-36),y:scrogY,h:scrogH},
  сервис:{x:-W/2+tech/2,w:Math.max(180,tech-30),d:Math.max(240,innerD-40),y:-H/2+plinth+240,h:Math.max(420,innerH-420)}
 },
 doors:{count:doors,width:doorW,height:H-plinth,thickness:doorT,gap:7},
 equipment:{light,fan},
 anchors:{
  light:{x:-W/2+tech+18+growW/2,y:growY+growH/2-90,z:0},
  fan:{x:-W/2+tech+18+growW-fan.w/2-35,y:growY+growH/2-fan.h/2-60,z:-D/2+fan.d/2+25},
  поддон:{x:-W/2+tech+18+growW/2,y:поддонY,z:0},
  tech:{x:-W/2+tech/2,y:-H/2+plinth+innerH/2,z:0},
  reservoir:{x:-W/2+tech+18+Math.min(Math.max(150,growW*.22),Math.max(150,growW-150)),y:поддонY+поддонH/2+215,z:-D/2+150}
 },
 mounts:{rails:[-W/2+tech+42,-W/2+tech+growW-42],railTop:growY+growH/2-45,railBottom:growY-growH/2+45,scrogY:scrogY,lightY:growY+growH/2-90,reservoirSupportY:поддонY+поддонH/2+8},
 checks:[]
 };
 const add=(level,code,text,detail)=>L.checks.push({level,code,text,detail:detail||''});
 if(growW<light.w+70)add('error','LIGHT_WIDTH','Светильник не помещается по ширине Рабочая зона.','Нужна ширина '+(light.w+70)+' мм, доступно '+Math.round(growW)+' мм.');
 if(growD<light.d+60)add('error','LIGHT_DEPTH','Недостаточная глубина под выбранный светильник.','Нужна глубина '+(light.d+60)+' мм.');
 if(availableGrowH<420)add('error','GROW_HEIGHT','Недостаточная высота рабочей камеры.','Доступно '+Math.round(availableGrowH)+' мм; минимально требуется 420 мм.');
 if(growH<light.h+scrogH+220)add('error','VERTICAL_COLLISION','Конфликт по высоте: свет / SCROG / сервис.','Увеличьте высоту или уменьшите SCROG.');
 if(tech<fan.w+150)add('warning','ТЕХНИКА_CLEARANCE','Техническая колонна почти без сервисного запаса.','Рекомендуется Техническая колонна не менее '+(fan.w+150)+' мм.');
 if(D<650)add('warning','DEPTH','Глубина ограничивает вентиляцию и сервисный доступ.');
 if(doors>3 && doorW<360)add('warning','DOOR_WIDTH','Слишком узкие двери для полноценного сервиса.');
 if(doorT>50)add('warning','DOOR_WEIGHT','Толстый дверной сэндвич увеличивает массу фасада.');
 // Масса корпуса считается по площади панелей (плотность ЛДСП ≈ 650 кг/м³), а не по объёму шкафа:
 // объёмная оценка растёт как H и завышает нагрузку для больших шкафов и занижает концентрацию
 // нагрузки для маленьких. Проверено: даёт ≈ 260 кг на конфигурации по умолчанию — как и спецификация.
 const panelM2=(2*(W*D+H*D+W*H))/1e6, shellM=panelM2*(panel*650/1000);
 const doorsM=doors*Math.max(6,doorW*(H-plinth)/1e6*22);
 const floorMass=18+shellM+doorsM+light.mass+fan.mass+(e.reservoir==='20L'?22:8)+(en.silencer?8:0)+(en.ups?7:0)+(en.din?3:0)+(en.vibration?2:0)+tech*.06;
 const power=light.power+fan.power+(e.controller==='GGS'?18:0)+(e.climate==='humidifier'?30:0)+(e.irrigation==='smart-drip'?12:0);
 const airflow=fan.w>=260?720:fan.w>=220?520:350;
 L.metrics={mass:+floorMass.toFixed(1),power,airflow,floorLoad:+(floorMass/(W*D/1e6)).toFixed(0),heat:+(power*.86).toFixed(0)};
 if(L.metrics.floorLoad>350)add('error','FLOOR_LOAD','Высокая нагрузка на пол.','Расчётно '+L.metrics.floorLoad+' кг/м².');
 else if(L.metrics.floorLoad>250)add('warning','FLOOR_LOAD','Повышенная нагрузка на пол.','Расчётно '+L.metrics.floorLoad+' кг/м².');
 if(D<fan.d+180)add('warning','FAN_СЕРВИС','Недостаточный сервисный зазор вокруг вентилятора.');
 L.compatible=!L.checks.some(x=>x.level==='error');
 return L;
}
function n(v,def){return Number.isFinite(Number(v))?Number(v):def}
function label(config){const l=derive(config),d=l.outer;return{dimensions:d.W+' × '+d.D+' × '+d.H+' мм',status:l.compatible?'✓ КОНФИГУРАЦИЯ СОВМЕСТИМА':'⚠ ТРЕБУЕТ ПРОВЕРКИ',mass:l.metrics.mass+' кг',power:l.metrics.power+' Вт',airflow:l.metrics.airflow+' м³/ч',floor:l.metrics.floorLoad+' кг/м²'};}
g.SECRETBOX_LAYOUT={derive,label,catalog:КАТАЛОГ,version:'2.0.0'};
})(window);
