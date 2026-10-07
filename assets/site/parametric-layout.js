/* SECRET BOX — shared parametric layout engine v1
 * One source of truth for builder, 3D and future BOM/export.
 */
(function(g){
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const CATALOG={
    light:{
      SE3000:{label:'Spider Farmer SE3000',w:610,d:410,h:55,mass:4.8,power:300},
      SE5000:{label:'Spider Farmer SE5000',w:1090,d:590,h:55,mass:8.2,power:480},
      G8600:{label:'Spider Farmer G8600',w:1100,d:660,h:58,mass:11.2,power:860}
    },
    fan:{
      SF4:{label:'Spider Farmer SF4',w:200,d:200,h:280,mass:3.1,power:35},
      SF6:{label:'Spider Farmer SF6',w:220,d:220,h:320,mass:4.4,power:45},
      SF8:{label:'Spider Farmer SF8',w:260,d:260,h:370,mass:6.2,power:60}
    }
  };
  function derive(config){
    const d=config.dimensions||{}, a=config.architecture||{}, e=config.equipment||{};
    const W=clamp(Number(d.W)||1250,700,2600);
    const H=clamp(Number(d.H)||2060,1500,3000);
    const D=clamp(Number(d.D)||741,550,1200);
    const panel=clamp(Number(d.panel)||18,12,30);
    const plinth=clamp(Number(d.plinth)||55,30,120);
    const tech=clamp(Number(a.techColumn)||Math.max(260,Math.min(520,Math.round(W*.28))),220,W-420);
    const topH=clamp(Number(a.topBoxH)||300,180,520);
    const trayH=clamp(Number(a.trayH)||120,70,220);
    const serviceGap=clamp(Number(a.serviceGap)||40,20,120);
    const scrogH=clamp(Number(a.scrogH)||650,350,H-topH-trayH-250);
    const growW=Math.max(320,W-tech-panel*2-18);
    const growD=Math.max(360,D-panel*2);
    const innerH=Math.max(900,H-plinth-panel*2);
    const topBoxY=H-plinth-topH/2;
    const growTop=H-plinth-topH-30;
    const trayY=plinth+trayH/2+serviceGap;
    const scrogY=Math.max(trayY+260,Math.min(growTop-220,trayY+scrogH/2));
    const light=CATALOG.light[e.light]||CATALOG.light.SE3000;
    const fan=CATALOG.fan[e.fan]||CATALOG.fan.SF4;
    const doors=clamp(Number(a.doors)||3,1,4);
    const clear=Math.max(28,serviceGap);
    const result={
      outer:{W,H,D,panel,plinth},
      inner:{W:W-panel*2,H:innerH,D:growD},
      zones:{
        tech:{x:-(W/2-tech/2),w:tech,d:growD,y:plinth+innerH/2,h:innerH},
        grow:{x:tech/2,w:growW,d:growD,y:plinth+innerH/2,h:innerH},
        top:{x:0,w:W-panel*2,d:growD,y:topBoxY,h:topH},
        tray:{x:tech/2,w:growW,d:growD,y:trayY,h:trayH},
        scrog:{x:tech/2,w:growW-36,d:growD-36,y:scrogY,h:scrogH},
        service:{x:-(W/2-tech/2),w:tech-30,d:growD-40,y:plinth+220,h:Math.max(420,innerH-420)}
      },
      doors:{count:doors,width:(W-panel*2)/doors,height:H-plinth,thickness:Number(a.doorSandwich)||41},
      equipment:{light,fan},
      anchors:{
        light:{x:tech+growW/2+panel/2,y:growTop-70,z:0},
        fan:{x:W/2-tech/2,y:growTop-fan.h/2-60,z:-D/2+fan.d/2+24},
        tray:{x:tech/2,y:trayY,z:0},
        tech:{x:-W/2+tech/2,y:plinth+innerH/2,z:0}
      },
      checks:[]
    };
    const minLightW=light.w+70;
    if(growW<minLightW) result.checks.push({level:'error',code:'LIGHT_WIDTH',text:'Светильник не помещается по ширине Grow Zone.'});
    if(growD<light.d+60) result.checks.push({level:'error',code:'LIGHT_DEPTH',text:'Недостаточная глубина под выбранный светильник.'});
    if(H<topH+light.h+trayH+320) result.checks.push({level:'warning',code:'VERTICAL_CLEARANCE',text:'Мало вертикального сервисного зазора.'});
    if(tech<fan.w+120) result.checks.push({level:'warning',code:'TECH_CLEARANCE',text:'Tech Column почти без сервисного запаса.'});
    if(D<650) result.checks.push({level:'warning',code:'DEPTH',text:'Глубина ограничивает вентиляцию и сервисный доступ.'});
    const mass=35+(W*H*D/1e6)*95+light.mass+fan.mass+(e.reservoir==='20L'?22:8);
    const power=light.power+fan.power+(e.controller==='NONE'?0:18)+(e.climate==='humidifier'?30:0);
    result.metrics={mass:+mass.toFixed(1),power:+power.toFixed(0),airflow:fan.w>=260?720:fan.w>=220?520:350};
    result.compatible=!result.checks.some(x=>x.level==='error');
    return result;
  }
  function label(config){
    const l=derive(config),d=l.outer;
    return {dimensions:d.W+' × '+d.D+' × '+d.H+' мм',status:l.compatible?'✓ CONFIGURATION COMPATIBLE':'⚠ NEEDS REVIEW',mass:l.metrics.mass+' кг',power:l.metrics.power+' Вт'};
  }
  g.SECRETBOX_LAYOUT={derive, label, catalog:CATALOG, version:'1.0.0'};
})(window);
