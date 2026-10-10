/* SECRET BOX — Spider Farmer: библиотека процедурных 3D-моделей оборудования v1.0
 *
 * Модели строятся из примитивов three.js (без внешних ассетов), геометрия — в миллиметрах,
 * центр модели в начале координат. Масштаб и позиция задаются вызывающим кодом.
 *
 * API:
 *   SPIDERFARMER3D.ids                    -> ['SE3000','SE5000','G8600','SF4','SF6','SF8','FILTER4','GGS','UVIR','AC10','HUMID']
 *   SPIDERFARMER3D.spec(id)               -> {kind,label,w,d,h,…} | null
 *   SPIDERFARMER3D.build(THREE, id)       -> THREE.Group (габариты = spec.w × spec.h × spec.d, мм)
 *   SPIDERFARMER3D.build(THREE, id, {})   -> то же, с переопределением габаритов {w,d,h}
 */
(function(global){
'use strict';

/* ---------- паспорта моделей (мм) ---------- */
const SPECS={
 SE3000:{kind:'light',label:'Spider Farmer SE3000',w:603,d:585,h:71,bars:4,power:300,mass:5.3,
   desc:'Светодиодный светильник Spider Farmer SE3000, 300 Вт: рама с 4 серебристыми LED-барами, белые платы с SMD-диодами (часть IR-красных), серебристый радиатор по центру, блок управления с синим экраном и диммером, оранжевые надписи Spider Farmer / SE 3000'},
 SE5000:{kind:'light',label:'Spider Farmer SE5000',w:1090,d:590,h:55,bars:6,power:480,
   desc:'Светодиодный светильник Spider Farmer SE5000, 480 Вт: 6 алюминиевых LED-баров, диодные платы, драйвер с диммером и тросовый подвес'},
 G8600:{kind:'light',label:'Spider Farmer G8600',w:1100,d:660,h:58,bars:8,power:860,
   desc:'Светодиодный светильник Spider Farmer G8600, 860 Вт: 8 алюминиевых LED-баров, диодные платы, драйвер с диммером и тросовый подвес'},
 SF4:{kind:'fan',label:'Spider Farmer SF4',w:200,d:200,h:280,power:35,duct:100,
   desc:'Канальный вентилятор Spider Farmer SF4 4" (100 мм): цилиндрический корпус, крыльчатка, крепёжная площадка, пульт с диммером'},
 SF6:{kind:'fan',label:'Spider Farmer SF6',w:220,d:320,h:320,power:45,duct:150,
   desc:'Канальный вентилятор Spider Farmer SF6 6" (150 мм): цилиндрический корпус, крыльчатка, крепёжная площадка, пульт с диммером'},
 SF8:{kind:'fan',label:'Spider Farmer SF8',w:260,d:260,h:370,power:60,duct:200,
   desc:'Канальный вентилятор Spider Farmer SF8 8" (200 мм): цилиндрический корпус, крыльчатка, крепёжная площадка, пульт с диммером'},
 FILTER4:{kind:'filter',label:'Фильтр угольный Spider Farmer 4"',w:220,d:300,h:220,
   desc:'Угольный фильтр Spider Farmer 4" (100 мм): сетчатый корпус, активированный уголь, фланцы, стяжные ремни'},
 GGS:{kind:'controller',label:'Spider Farmer GGS Controller',w:168,d:36,h:112,
   desc:'Контроллер Spider Farmer GGS: сенсорный экран, энкодер, порты RJ12 — единая точка управления экосистемой'},
 UVIR:{kind:'uvbar',label:'Spider Farmer UV30 + IR16',w:600,d:48,h:36,
   desc:'Досветка Spider Farmer UV30 + IR16: UV-A 365 нм и IR 730 нм в одном баре, отдельное управление'},
 AC10:{kind:'power',label:'Spider Farmer AC10',w:70,d:70,h:210,
   desc:'Умная сетевая колодка Spider Farmer AC10: 10 розеток с независимым контролем и защитой'},
 HUMID:{kind:'humidifier',label:'Увлажнитель Spider Farmer 5 л',w:260,d:260,h:330,
   desc:'Увлажнитель Spider Farmer 5 л: бак, ультразвуковой генератор тумана, панель управления'}
};

/* ---------- материалы (кэш на экземпляр THREE) ---------- */
let cachedTHREE=null,cachedMats=null;
function getMats(THREE){
 if(cachedTHREE===THREE&&cachedMats)return cachedMats;
 cachedTHREE=THREE;
 cachedMats={
  alu:new THREE.MeshStandardMaterial({color:0x9ba2a7,roughness:.36,metalness:.78}),
  aluDark:new THREE.MeshStandardMaterial({color:0x63686c,roughness:.5,metalness:.62}),
  steel:new THREE.MeshStandardMaterial({color:0x8c9498,roughness:.38,metalness:.66}),
  dark:new THREE.MeshStandardMaterial({color:0x2b2f32,roughness:.62,metalness:.22}),
  black:new THREE.MeshStandardMaterial({color:0x1c1f21,roughness:.56,metalness:.18}),
  rubber:new THREE.MeshStandardMaterial({color:0x16181a,roughness:.94,metalness:.02}),
  board:new THREE.MeshStandardMaterial({color:0xd9dbd6,roughness:.5,metalness:.12}),
  diode:new THREE.MeshStandardMaterial({color:0xf1e9cf,roughness:.28,metalness:.05,emissive:0x79683b,emissiveIntensity:.55}),
  diodeUV:new THREE.MeshStandardMaterial({color:0x6a4ea6,roughness:.3,metalness:.05,emissive:0x3c2976,emissiveIntensity:.85}),
  diodeIR:new THREE.MeshStandardMaterial({color:0x8b3326,roughness:.3,metalness:.05,emissive:0x5a140b,emissiveIntensity:.85}),
  gold:new THREE.MeshStandardMaterial({color:0xaf8c51,roughness:.42,metalness:.68}),
  glass:new THREE.MeshStandardMaterial({color:0x11171b,roughness:.18,metalness:.1,emissive:0x1b2932,emissiveIntensity:.6}),
  felt:new THREE.MeshStandardMaterial({color:0x32373a,roughness:.95,metalness:.02}),
  tank:new THREE.MeshStandardMaterial({color:0x9db3b8,roughness:.16,metalness:.05,transparent:true,opacity:.55,depthWrite:false}),
  white:new THREE.MeshStandardMaterial({color:0xd7dada,roughness:.6,metalness:.05}),
  rail:new THREE.MeshStandardMaterial({color:0x212427,roughness:.52,metalness:.42}),
  green:new THREE.MeshStandardMaterial({color:0x35c06a,roughness:.35,metalness:.1,emissive:0x0d5a2c,emissiveIntensity:.9})
 };
 return cachedMats;
}

/* ---------- геометрические помощники ---------- */
function boxG(THREE,w,h,d){return new THREE.BoxGeometry(Math.max(.01,w),Math.max(.01,h),Math.max(.01,d))}
function cylG(THREE,rt,rb,h,seg,open){return new THREE.CylinderGeometry(Math.max(.01,rt),Math.max(.01,rb),Math.max(.01,h),seg||24,1,!!open)}
function torG(THREE,r,tube,arc){return new THREE.TorusGeometry(Math.max(.01,r),Math.max(.01,tube),8,26,arc||Math.PI*2)}
function add(parent,THREE,geo,mat,x,y,z,rx,ry,rz){
 const m=new THREE.Mesh(geo,mat);
 if(x!==undefined)m.position.set(x,y,z);
 if(rx)m.rotation.x=rx;
 if(ry)m.rotation.y=ry;
 if(rz)m.rotation.z=rz;
 parent.add(m);return m;
}
/* инстансы диодов: одна геометрия, много точек — дёшево по draw calls */
function diodeRow(parent,THREE,mat,pts,w,h,d,y){
 const im=new THREE.InstancedMesh(boxG(THREE,w,h,d),mat,pts.length);
 const mtx=new THREE.Matrix4();
 pts.forEach((p,i)=>{mtx.setPosition(p[0],y,p[1]);im.setMatrixAt(i,mtx)});
 im.instanceMatrix.needsUpdate=true;
 parent.add(im);return im;
}
/* кольцо вокруг оси Z (как у канальных элементов) */
function ring(parent,THREE,mat,r,tube,x,y,z){return add(parent,THREE,torG(THREE,r,tube),mat,x,y,z)}
function wire(parent,THREE,mat,x,y,z,h,rx,rz){return add(parent,THREE,cylG(THREE,1.8,1.8,h,8),mat,x,y,z,rx||0,0,rz||0)}

/* ---------- текстуры (canvas): надписи, шильдики, индикаторы, LED-матрица ---------- */
function canvasTex(THREE,w,h,draw){
 if(typeof document==='undefined')return null;
 const c=document.createElement('canvas');c.width=w;c.height=h;
 const x=c.getContext('2d');draw(x,w,h);
 const t=new THREE.CanvasTexture(c);
 if('colorSpace' in t)t.colorSpace=THREE.SRGBColorSpace;
 return t;
}
function texPlane(THREE,tex,w,h,x,y,z,rx,parent,ry){
 if(!tex)return null;
 const mat=new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:.55,metalness:.08});
 return add(parent,THREE,new THREE.PlaneGeometry(w,h),mat,x,y,z,rx||0,ry||0);
}
function ledTex(THREE){
 /* Матовая алюминиевая PCB с плотной матрицей SMD-светодиодов.
    Рисуем отдельные корпуса диодов, а не крупные цветные плитки. */
 return canvasTex(THREE,512,1024,(x,w,h)=>{
  x.fillStyle='#c9cbc5';x.fillRect(0,0,w,h);
  x.fillStyle='rgba(65,70,68,.20)';
  for(let yy=7;yy<h;yy+=18)x.fillRect(0,yy,w,1);
  const cols=5,rows=46,padX=10,padY=8;
  const sx=(w-padX*2)/(cols*2-1),sy=(h-padY*2)/(rows*2-1);
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
   const gx=padX+c*sx*2,gy=padY+r*sy*2;
   const red=((r*cols+c)%19===7)||((r*cols+c)%31===11);
   const warm=((r+c)%5===0);
   const bw=Math.max(5,sx*.78),bh=Math.max(5,sy*.78);
   x.fillStyle='rgba(52,55,52,.55)';x.fillRect(gx-1,gy-1,bw+2,bh+2);
   x.fillStyle=red?'#9e3d2c':(warm?'#f5e8c6':'#fff7df');x.fillRect(gx,gy,bw,bh);
   x.fillStyle='rgba(255,255,255,.82)';x.fillRect(gx+1,gy+1,Math.max(1,bw*.36),Math.max(1,bh*.28));
  }
  /* Небольшие монтажные площадки по торцам платы */
  x.fillStyle='#858b88';
  for(const yy of [4,h-8])for(let c=0;c<cols;c++)x.fillRect(padX+c*sx*2,yy,Math.max(4,sx*.8),4);
 });
}
function logoTex(THREE){
 return canvasTex(THREE,768,128,(x,w,h)=>{
  x.clearRect(0,0,w,h);
  x.fillStyle='#e8722a';
  x.beginPath();x.ellipse(72,64,14,20,0,0,Math.PI*2);x.fill();
  x.beginPath();x.arc(72,38,9,0,Math.PI*2);x.fill();
  x.lineWidth=6;x.strokeStyle='#e8722a';x.lineCap='round';
  for(const s of [-1,1])for(let i=0;i<4;i++){
   x.beginPath();x.moveTo(72+s*10,46+i*10);
   x.quadraticCurveTo(72+s*40,32+i*15,72+s*64,42+i*14);x.stroke();
  }
  x.font='bold 62px Arial';x.textBaseline='middle';
  x.fillStyle='#f1f1ec';x.fillText('SPIDER',152,58);
  x.fillStyle='#e8722a';x.fillText('FARMER',352,58);
  x.font='24px Arial';x.fillStyle='#b9b9b2';x.fillText('SMART GROW LIGHTING',154,108);
 });
}
function plateTex(THREE,text){
 return canvasTex(THREE,512,128,(x,w,h)=>{
  x.fillStyle='#141416';x.fillRect(0,0,w,h);
  x.fillStyle='#e8722a';x.fillRect(12,12,w-24,h-24);
  x.fillStyle='#121212';x.font='bold 72px Arial';x.textAlign='center';x.textBaseline='middle';
  x.fillText(text,w/2,h/2+3);
 });
}
function displayTex(THREE){
 return canvasTex(THREE,256,128,(x,w,h)=>{
  x.fillStyle='#0a1322';x.fillRect(0,0,w,h);
  x.fillStyle='#122c46';x.fillRect(10,10,w-20,h-20);
  x.font='bold 82px "Courier New",monospace';x.textAlign='center';x.textBaseline='middle';
  x.shadowColor='#57c1ff';x.shadowBlur=24;x.fillStyle='#93d9ff';
  x.fillText('100',w/2,h/2+4);
 });
}
/* ================= LIGHT: SE3000 / SE5000 / G8600 (шаблон v4 по фото) ================= */
function buildLight(THREE,g,M,s){
 const w=s.w,d=s.d,h=s.h,bars=s.bars||4;
 const y0=-h/2;
 const railW=Math.max(17,Math.min(25,d*.043));
 const railH=Math.max(8,h*.17);
 const sideX=w/2-railW/2;
 const railY=y0+railH/2;
 /* Рама по фотографии: две продольные боковые рейки идут вдоль LED-планок,
    а короткие торцевые перемычки соединяют их по краям. */
 for(const side of [-1,1]){
  add(g,THREE,boxG(THREE,railW,railH,d*.985),M.rail,side*sideX,railY,0);
  add(g,THREE,boxG(THREE,railW*.78,2.2,d*.96),M.black,side*sideX,railY+railH/2+1.1,0);
  for(const sz of [-1,1]){
   add(g,THREE,boxG(THREE,railW+2,railH+2,12),M.black,side*sideX,railY,sz*(d/2-6));
  }
 }
 for(const sz of [-1,1]){
  add(g,THREE,boxG(THREE,w-railW*1.2,railH,railW*.8),M.black,0,railY,sz*(d/2-railW*.42));
  add(g,THREE,boxG(THREE,w-railW*1.5,2,railW*.58),M.dark,0,railY+railH/2+1,sz*(d/2-railW*.42));
 }
 /* Четыре LED-планки: тонкие серебристые профили, параллельные боковым рейкам. */
 const barW=Math.max(15,Math.min(22,w*.035));
 const edge=railW+8;
 const span=Math.max(0,w-2*edge-barW);
 const step=span/Math.max(1,bars-1);
 const barLen=d-2*railW-16;
 const led=ledTex(THREE);
 const boardMat=new THREE.MeshStandardMaterial({map:led,roughness:.46,metalness:.1});
 for(let i=0;i<bars;i++){
  const x=bars===1?0:-span/2+i*step;
  const barY=y0+railH*.54;
  add(g,THREE,boxG(THREE,barW,Math.max(4,h*.105),barLen),M.alu,x,barY,0);
  add(g,THREE,boxG(THREE,barW*.84,1.6,barLen*.99),boardMat,x,y0+1.1,0);
  /* Концевые держатели каждой планки. */
  for(const sz of [-1,1]){
   add(g,THREE,boxG(THREE,barW+4,4,8),M.aluDark,x,barY,sz*(barLen/2+2));
   add(g,THREE,cylG(THREE,1.5,1.5,2,8),M.steel,x,barY+2.3,sz*(barLen/2+3));
  }
 }
 /* Центральный драйвер — поперечный серебристый радиатор между LED-планками.
    Его рёбра ориентированы поперёк баров, как на фото-исходнике. */
 const drvW=Math.min(238,w*.43);
 const drvD=Math.min(132,d*.235);
 const drvH=Math.max(15,h*.23);
 const drvY=y0+railH+drvH/2+2.5;
 add(g,THREE,boxG(THREE,drvW,drvH,drvD),M.alu,0,drvY,0);
 add(g,THREE,boxG(THREE,drvW*.98,2.2,drvD*.98),M.aluDark,0,drvY+drvH/2+1.1,0);
 for(let i=0;i<21;i++){
  const x=-drvW*.46+i*(drvW*.92/20);
  add(g,THREE,boxG(THREE,2.2,3.4,drvD*.91),M.steel,x,drvY+drvH/2+2.8,0);
 }
 /* Небольшие опоры драйвера — не отдельные высокие стойки. */
 for(const sx of [-1,1])for(const sz of [-1,1]){
  add(g,THREE,boxG(THREE,10,4,10),M.dark,sx*(drvW*.42),y0+railH+1.5,sz*(drvD*.39));
 }
 /* Блок управления находится на внешней стороне левой боковой рейки,
    а не на торце центрального радиатора. Экран и диммер смотрят наружу (-X). */
 const ctlW=Math.min(104,w*.19);
 const ctlH=Math.min(25,railH*1.25);
 const ctlD=Math.max(7,railW*.42);
 const ctlX=-(w/2+ctlD*.28);
 const ctlY=railY+railH*.48;
 const ctlZ=-d*.22;
 add(g,THREE,boxG(THREE,ctlD,ctlH,ctlW),M.black,ctlX,ctlY,ctlZ);
 add(g,THREE,boxG(THREE,2,ctlH+3,ctlW+3),M.dark,ctlX-ctlD/2-1,ctlY,ctlZ);
 /* PlaneGeometry lies in XY; rotate around Y so its face points toward -X. */
 texPlane(THREE,displayTex(THREE),ctlW*.31,ctlH*.56,ctlX-ctlD/2-2.2,ctlY,ctlZ-ctlW*.13,0,g,-Math.PI/2);
 add(g,THREE,cylG(THREE,Math.max(4,ctlH*.26),Math.max(4,ctlH*.26),4,18),M.dark,ctlX-ctlD/2-2.4,ctlY,ctlZ+ctlW*.27,Math.PI/2);
 add(g,THREE,cylG(THREE,Math.max(1.8,ctlH*.09),Math.max(1.8,ctlH*.09),1.5,12),M.gold,ctlX-ctlD/2-4.6,ctlY,ctlZ+ctlW*.27,Math.PI/2);
 add(g,THREE,cylG(THREE,1.7,1.7,1.6,10),M.green,ctlX-ctlD/2-2.4,ctlY-ctlH*.25,ctlZ+ctlW*.42,Math.PI/2);
 /* Кабель уходит от края блока управления, аккуратно вдоль рамы. */
 wire(g,THREE,M.black,ctlX,ctlY-ctlH*.48,ctlZ+ctlW*.43,26,0,.25);
 /* Подвесные проушины на четырёх углах рамы. */
 for(const sx of [-1,1])for(const sz of [-1,1]){
  const x=sx*(w/2-railW*.5), z=sz*(d/2-railW*.5);
  add(g,THREE,boxG(THREE,10,3.5,10),M.dark,x,railY+railH/2+2,z);
  add(g,THREE,torG(THREE,4.5,1.5),M.steel,x,railY+railH/2+6,z);
 }
 for(const sx of [-1,1]){
  wire(g,THREE,M.steel,sx*(w*.34),railY+railH/2+18,0,22);
  add(g,THREE,torG(THREE,5.5,1.6),M.steel,sx*(w*.34),railY+railH/2+31,0);
 }
 /* Оранжевый фирменный логотип и табличка SE3000 на внешней боковой рейке.
    Они обращены наружу, как в фото-исходнике. */
 const markX=-(w/2+railW*.5+.7);
 texPlane(THREE,logoTex(THREE),Math.min(175,d*.31),Math.min(25,railH*.82),markX,railY,-d*.03,0,g,-Math.PI/2);
 texPlane(THREE,plateTex(THREE,'SE 3000'),Math.min(78,d*.14),Math.min(16,railH*.58),markX,railY,d*.27,0,g,-Math.PI/2);
}
/* ================= FAN: SF4 / SF6 / SF8 ================= */
function buildFan(THREE,g,M,s){
 const w=s.w,d=s.d,h=s.h;
 const r=w/2, bodyY=-h/2+42+r, flange=20, bodyLen=d-2*flange-14;
 /* корпус */
 add(g,THREE,cylG(THREE,r,r,bodyLen,32),M.black,0,bodyY,0,Math.PI/2);
 /* центральная лента мотора */
 add(g,THREE,cylG(THREE,r+10,r+10,Math.max(40,d*.26),32),M.dark,0,bodyY,0,Math.PI/2);
 /* рёбра-кольца */
 ring(g,THREE,M.dark,r+5,5,0,bodyY,-d*.27);
 ring(g,THREE,M.dark,r+5,5,0,bodyY,d*.27);
 /* фланцы + внутренняя гильза */
 for(const side of [-1,1]){
  add(g,THREE,cylG(THREE,r+17,r+17,flange,32),M.dark,0,bodyY,side*(d/2-flange/2),Math.PI/2);
  add(g,THREE,cylG(THREE,r-2,r-2,26,32,true),M.steel,0,bodyY,side*(d/2-flange-6),Math.PI/2);
  ring(g,THREE,M.steel,r+17,3.5,0,bodyY,side*(d/2-flange));
 }
 /* решётка на входе */
 const gz=d/2-flange-2;
 ring(g,THREE,M.steel,r-3,5,0,bodyY,gz+8);
 add(g,THREE,cylG(THREE,r*.17,r*.17,14,20),M.dark,0,bodyY,gz+6,Math.PI/2);
 for(let i=0;i<8;i++){
  const a=i*Math.PI/8;
  const sp=add(g,THREE,boxG(THREE,(r-4)*2,6,4),M.steel,0,bodyY,gz+6,0,0,a);
 }
 /* крыльчатка за решёткой */
 for(let i=0;i<7;i++){
  const a=i*Math.PI*2/7, br=r*.34;
  const bx=Math.cos(a)*br, by=bodyY+Math.sin(a)*br;
  add(g,THREE,boxG(THREE,r*.34,r*.24,3),M.aluDark,bx,by,gz-24,0,.55,a);
 }
 add(g,THREE,cylG(THREE,r*.2,r*.2,Math.max(30,bodyLen*.42),20),M.dark,0,bodyY,-d*.12,Math.PI/2);
 /* крепёжная площадка и лапки */
 add(g,THREE,boxG(THREE,w*1.2,14,d*.55),M.dark,0,-h/2+8,0);
 for(const sx of [-1,1])for(const sz of [-1,1]){
  add(g,THREE,cylG(THREE,15,16,12,14),M.rubber,sx*w*.42,-h/2+6,sz*d*.2);
  add(g,THREE,boxG(THREE,w*.62,14,30),M.aluDark,0,-h/2+42+6,sz*d*.21);
 }
 /* подвесные скобы */
 for(const sx of [-1,1]){
  add(g,THREE,boxG(THREE,10,Math.max(30,h*.22),22),M.aluDark,sx*w*.3,(bodyY+r+h/2-12)/2,0);
  ring(g,THREE,M.steel,8,2.6,sx*w*.3,h/2-8,0);
 }
 /* пульт с диммером на корпусе */
 const cx=r+13,cy=bodyY+6,cz=-d*.14;
 add(g,THREE,boxG(THREE,26,92,52),M.dark,cx,cy,cz);
 add(g,THREE,boxG(THREE,3,26,30),M.glass,cx+14,cy+22,cz);
 add(g,THREE,cylG(THREE,9,9,9,16),M.black,cx+16,cy-16,cz,0,0,Math.PI/2);
 add(g,THREE,cylG(THREE,3,3,2,10),M.gold,cx+21,cy-16,cz,0,0,Math.PI/2);
 wire(g,THREE,M.black,cx-2,cy-58,cz,56,0,0);
 /* шильдик */
 add(g,THREE,boxG(THREE,2,22,34),M.gold,cx+14,cy-16,cz+0.1);
}

/* ================= FILTER: угольный фильтр 4" ================= */
function buildFilter(THREE,g,M,s){
 const w=s.w,d=s.d,r=w/2-16;
 /* корпус: сетка + сукно */
 add(g,THREE,cylG(THREE,r,r,d-42,28),M.felt,0,0,0,Math.PI/2);
 add(g,THREE,cylG(THREE,r+5,r+5,d-36,28,true),M.steel,0,0,0,Math.PI/2);
 /* крышки и фланцы */
 for(const side of [-1,1]){
  add(g,THREE,cylG(THREE,r+8,r+8,22,28),M.aluDark,0,0,side*(d/2-11),Math.PI/2);
  add(g,THREE,cylG(THREE,52,52,26,24,true),M.steel,0,0,side*(d/2+8),Math.PI/2);
  ring(g,THREE,M.steel,52,3,0,0,side*(d/2+18));
 }
 /* стяжные ремни */
 for(const zc of [-d*.3,0,d*.3]){
  ring(g,THREE,M.aluDark,r+7,5,0,0,zc);
  for(let i=0;i<4;i++){
   const a=i*Math.PI/2+Math.PI/4;
   add(g,THREE,boxG(THREE,12,8,14),M.dark,Math.cos(a)*(r+9),Math.sin(a)*(r+9),zc);
  }
 }
 /* ручка */
 add(g,THREE,torG(THREE,26,4,Math.PI),M.steel,0,r+8,0,0,0,0);
}

/* ================= GGS: контроллер ================= */
function buildController(THREE,g,M,s){
 const w=s.w,h=s.h,d=s.d;
 add(g,THREE,boxG(THREE,w,h*.84,d*.62),M.dark,0,0,0);
 add(g,THREE,boxG(THREE,w*.96,h*.8,d*.2),M.black,0,0,d*.36);
 add(g,THREE,boxG(THREE,w*.5,h*.32,2.4),M.glass,0,h*.16,d*.5);
 add(g,THREE,boxG(THREE,w*.3,1.6,d*.36),M.gold,0,h*.36,d*.3);
 /* энкодер и кнопки */
 add(g,THREE,cylG(THREE,13,13,12,20),M.black,w*.27,-h*.14,d*.52,Math.PI/2);
 add(g,THREE,cylG(THREE,3.2,3.2,2,10),M.gold,w*.27,-h*.14,d*.6,Math.PI/2);
 for(let i=0;i<4;i++)add(g,THREE,cylG(THREE,6,6,5,12),M.black,-w*.28+i*w*.13,-h*.2,d*.5,Math.PI/2);
 /* порты RJ12 снизу */
 for(let i=0;i<6;i++)add(g,THREE,boxG(THREE,13,9,9),M.black,-w*.36+i*w*.145,-h*.46,0);
 /* кабель */
 wire(g,THREE,M.black,w*.38,-h*.5,0,52,0,.25);
}

/* ================= UV30 + IR16: бар досветки ================= */
function buildUvBar(THREE,g,M,s){
 const w=s.w,d=s.d,h=s.h;
 add(g,THREE,boxG(THREE,w*.98,h*.62,d*.82),M.alu,0,h*.1,0);
 add(g,THREE,boxG(THREE,w*.92,h*.14,d*.62),M.board,0,-h*.28,0);
 /* диоды: чередование warm / UV / IR */
 const n=Math.max(8,Math.min(18,Math.round(w/46)));
 const warm=[],uv=[],ir=[];
 for(let i=0;i<n;i++){
  const x=-w*.44+(i+.5)*(w*.88)/n;
  (i%3===0?uv:i%3===1?ir:warm).push([x,0]);
 }
 diodeRow(g,THREE,M.diode,warm,Math.min(10,w/n*.42),2.2,d*.5,-h*.42);
 diodeRow(g,THREE,M.diodeUV,uv,Math.min(10,w/n*.42),2.2,d*.5,-h*.42);
 diodeRow(g,THREE,M.diodeIR,ir,Math.min(10,w/n*.42),2.2,d*.5,-h*.42);
 /* драйвер и заглушки */
 add(g,THREE,boxG(THREE,w*.24,h*.42,d*.6),M.aluDark,0,h*.42,0);
 add(g,THREE,boxG(THREE,w*.1,1.6,d*.3),M.gold,0,h*.66,0);
 for(const side of [-1,1])add(g,THREE,boxG(THREE,10,h*.8,d),M.aluDark,side*(w/2-5),h*.04,0);
 for(const xx of [-w*.28,w*.28])wire(g,THREE,M.steel,xx,h*.62,0,30);
}

/* ================= AC10: умная колодка ================= */
function buildPower(THREE,g,M,s){
 const w=s.w,d=s.d,h=s.h;
 add(g,THREE,boxG(THREE,w*.82,h,d*.82),M.dark,0,0,0);
 add(g,THREE,boxG(THREE,w*.88,h*.06,d*.88),M.black,0,h*.42,0);
 /* розетки: две колонки по 5 */
 for(let c=0;c<2;c++)for(let i=0;i<5;i++){
  const x=(c-.5)*w*.36, y=-h*.38+i*h*.185;
  add(g,THREE,cylG(THREE,11,11,3.2,16),M.black,x,y,d*.42,Math.PI/2);
  add(g,THREE,cylG(THREE,6.5,6.5,2,12),M.rubber,x,y,d*.45,Math.PI/2);
 }
 /* индикатор и выключатель */
 add(g,THREE,boxG(THREE,w*.2,7,3),M.glass,-w*.16,h*.44,d*.42);
 add(g,THREE,boxG(THREE,w*.24,12,5),M.black,w*.18,h*.44,d*.42);
 wire(g,THREE,M.black,0,-h*.56,0,46,0,0);
}

/* ================= Увлажнитель 5 л ================= */
function buildHumidifier(THREE,g,M,s){
 const w=s.w,d=s.d,h=s.h,r=w/2-16;
 const tankH=h*.6;
 add(g,THREE,cylG(THREE,r,r,tankH,28),M.tank,0,-h/2+22+tankH/2,0);
 add(g,THREE,cylG(THREE,r+8,r+8,22,28),M.dark,0,-h/2+11,0);
 add(g,THREE,cylG(THREE,r+6,r+6,26,28),M.white,0,-h/2+22+tankH+13,0);
 /* сопло тумана */
 add(g,THREE,cylG(THREE,17,17,26,18),M.white,0,-h/2+22+tankH+38,0);
 add(g,THREE,cylG(THREE,12,15,30,18),M.white,0,-h/2+22+tankH+52,0,0,0,.5);
 /* ручка */
 add(g,THREE,torG(THREE,r*.62,5,Math.PI),M.dark,0,-h/2+22+tankH+22,0,0,0,0);
 /* панель управления */
 add(g,THREE,boxG(THREE,w*.44,h*.14,6),M.dark,0,-h/2+22+tankH*.34,r+2);
 add(g,THREE,boxG(THREE,w*.22,h*.06,2.4),M.glass,-w*.08,-h/2+22+tankH*.34,r+6);
 add(g,THREE,cylG(THREE,8,8,6,14),M.black,w*.13,-h/2+22+tankH*.34,r+6,Math.PI/2);
 /* уровень воды */
 add(g,THREE,boxG(THREE,6,tankH*.7,2),M.white,r*.86,-h/2+22+tankH*.5,r*.5);
}

/* ================= API ================= */
function build(THREE,id,over){
 const s0=SPECS[id]||SPECS.SE3000;
 const s=over?Object.assign({},s0,over):s0;
 const M=getMats(THREE);
 const g=new THREE.Group();
 g.name='SPIDER FARMER · '+s0.label;
 switch(s.kind){
  case 'light':buildLight(THREE,g,M,s);break;
  case 'fan':buildFan(THREE,g,M,s);break;
  case 'filter':buildFilter(THREE,g,M,s);break;
  case 'controller':buildController(THREE,g,M,s);break;
  case 'uvbar':buildUvBar(THREE,g,M,s);break;
  case 'power':buildPower(THREE,g,M,s);break;
  case 'humidifier':buildHumidifier(THREE,g,M,s);break;
 }
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
 return g;
}
global.SPIDERFARMER3D={
 version:'1.1',
 ids:Object.keys(SPECS),
 spec:function(id){return SPECS[id]||null},
 label:function(id){return (SPECS[id]||{}).label||id},
 build:build
};
})(typeof window!=='undefined'?window:this);
