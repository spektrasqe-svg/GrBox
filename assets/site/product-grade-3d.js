(function(){
'use strict';
if(!window.THREE||!window.SECRETBOX||!window.SECRETBOX_LAYOUT||!window.scene)return;
var G=scene.getObjectByName('SECRET_BOX_PRODUCT_GRADE');
if(!G){G=new THREE.Group();G.name='SECRET_BOX_PRODUCT_GRADE';scene.add(G);}
var U=.0032;
var M={
 frame:new THREE.MeshStandardMaterial({color:0x4c5559,metalness:.7,roughness:.34}),
 steel:new THREE.MeshStandardMaterial({color:0x8d979a,metalness:.8,roughness:.25}),
 dark:new THREE.MeshStandardMaterial({color:0x15191b,metalness:.45,roughness:.55}),
 accent:new THREE.MeshStandardMaterial({color:0xc9f27f,metalness:.15,roughness:.34}),
 clear:new THREE.MeshStandardMaterial({color:0xd8c28e,transparent:true,opacity:.09,depthWrite:false}),
 bad:new THREE.MeshStandardMaterial({color:0xef655b,transparent:true,opacity:.2,depthWrite:false})
};
function mm(v){return v*U}
function box(n,w,h,d,x,y,z,m){var o=new THREE.Mesh(new THREE.BoxGeometry(mm(w),mm(h),mm(d)),m);o.name=n;o.position.set(mm(x),mm(y),mm(z));G.add(o);return o}
function clear(){while(G.children.length)G.remove(G.children[G.children.length-1]);}
function build(){
 var S=SECRETBOX.load(),L=SECRETBOX_LAYOUT.derive(S),d=L.outer;
 clear();
 [-1,1].forEach(function(side){
   box('HINGE_RAIL',16,d.H-120,22,side*(d.W/2-12),0,d.D/2+9,M.steel);
   for(var i=0;i<L.doors.count;i++)box('HINGE',14,72,18,side*(d.W/2-18),-d.H/2+170+i*430,d.D/2+20,M.steel);
 });
 for(var i=0;i<L.doors.count;i++){var x=-d.W/2+L.doors.width/2+i*L.doors.width;box('HANDLE',18,180,22,x,0,d.D/2+L.doors.thickness+15,M.steel);}
 [L.zones.tray.y,L.zones.scrog.y-L.zones.scrog.h/2].forEach(function(y,i){box('STRUCTURAL_DECK_'+i,L.zones.grow.w-40,18,L.zones.grow.d-40,L.zones.grow.x,y,0,M.frame);});
 var rear=-d.D/2+18;
 for(var lane=0;lane<4;lane++)box('REAR_CABLE_CHANNEL_'+lane,26,d.H-160,18,-d.W/2+Math.max(90,d.W*.12)+lane*42,0,rear,M.dark);
 var light=L.equipment.light,fan=L.equipment.fan;
 box('LIGHT_MOUNT_PLATE',light.w+90,12,light.d+90,L.anchors.light.x,L.anchors.light.y,0,M.frame);
 box('FAN_MOUNT_PLATE',fan.w+100,18,fan.d+100,L.anchors.fan.x,L.anchors.fan.y,L.anchors.fan.z,M.frame);
 if(S.engineering.vibration)for(var sx=-1;sx<=1;sx+=2)for(var sz=-1;sz<=1;sz+=2)box('VIBRATION_MOUNT',20,22,20,L.anchors.fan.x+sx*(fan.w/2-35),L.anchors.fan.y-fan.h/2-20,L.anchors.fan.z+sz*(fan.d/2-35),M.steel);
 box('LIGHT_CLEARANCE',light.w+70,light.h+80,light.d+70,L.anchors.light.x,L.anchors.light.y,0,(L.zones.grow.w<light.w+70||L.zones.grow.d<light.d+60)?M.bad:M.clear);
 box('FAN_CLEARANCE',fan.w+150,fan.h+140,fan.d+150,L.anchors.fan.x,L.anchors.fan.y,L.anchors.fan.z,L.checks.some(function(x){return x.code==='FAN_SERVICE';})?M.bad:M.clear);
 box('SERVICE_ZONE_FRAME',L.zones.service.w,12,L.zones.service.d,L.zones.service.x,L.zones.service.y+L.zones.service.h/2-6,0,M.accent);
 L.mounts.rails.forEach(function(x){box('ADJUSTABLE_RAIL',24,L.zones.grow.h-80,24,x,L.zones.grow.y,0,M.steel);for(var j=0;j<9;j++)box('CARRIAGE',58,16,20,x,L.mounts.railBottom+j*(L.mounts.railTop-L.mounts.railBottom)/8,0,M.accent);});
 box('DIN_SERVICE_FRAME',L.zones.tech.w-70,220,L.zones.tech.d-90,L.zones.tech.x,L.zones.tech.y+L.zones.tech.h*.22,d.D/2-65,M.frame);
 box('PUMP_SERVICE_FRAME',L.zones.tech.w-70,180,L.zones.tech.d-90,L.zones.tech.x,L.zones.tech.y-L.zones.tech.h*.20,d.D/2-65,M.frame);
 box('NOISE_BAFFLE_A',L.zones.top.w-90,L.zones.top.h-70,18,0,L.zones.top.y,-L.zones.top.d/2+60,M.frame);
 box('NOISE_BAFFLE_B',L.zones.top.w-140,L.zones.top.h-110,18,70,L.zones.top.y,0,M.frame);
 for(var k=0;k<3;k++)box('TECH_ACCESS_PANEL_'+k,L.zones.tech.w-46,190,L.zones.tech.d-55,L.zones.tech.x,L.zones.tech.y-L.zones.tech.h*.30+k*220,d.D/2-30,M.dark);
 var p=document.getElementById('sb3d-info');
 if(!p){p=document.createElement('div');p.id='sb3d-info';p.style.cssText='position:fixed;right:18px;bottom:18px;z-index:50;max-width:340px;background:rgba(15,17,18,.92);border:1px solid rgba(232,220,200,.22);border-radius:14px;padding:14px 16px;color:#eee5d7;font:12px/1.5 Manrope,sans-serif;backdrop-filter:blur(12px)';document.body.appendChild(p);}
 var er=L.checks.filter(function(x){return x.level==='error'}),wa=L.checks.filter(function(x){return x.level==='warning'});
 p.innerHTML='<b>SECRET BOX · ENGINEERING VIEW</b><br>'+d.W+' × '+d.D+' × '+d.H+' мм · '+L.metrics.mass+' кг<br><span style="color:#c9f27f">'+L.metrics.power+' W · '+L.metrics.airflow+' m³/h</span><br><span style="color:'+(er.length?'#ef655b':'#c9f27f')+'">'+(er.length?er.length+' critical conflict(s)':'✓ geometry compatible')+'</span>'+(wa.length?' · <span style="color:#e5bd72">'+wa.length+' warning(s)</span>':'');
}
var last='';
function tick(){var s=SECRETBOX.load(),sig=JSON.stringify(s);if(sig!==last){last=sig;build();}requestAnimationFrame(tick);}
window.SECRETBOX_PRODUCT_GRADE={build:build,get:function(){return G}};
tick();
})();