/* SECRET BOX — shared product state v2 */
(function(){
 const KEY='secretbox.product.state.v2';
 const OLD='secretbox.product.state.v1';
 const D={
  mode:'custom', model:'CUSTOM', finish:'choco',
  dimensions:{W:1250,H:2060,D:741,plinth:55,panel:18},
  // ключи архитектуры должны совпадать с тем, что читает parametric-layout.js и редактирует builder.html:
  // поддонH / сервисGap (а не старые trayH / serviceGap)
  architecture:{techColumn:400,topBoxH:300,сервисGap:40,doors:3,doorSandwich:41,поддонH:120,scrogH:650},
  equipment:{light:'SE3000',fan:'SF4',controller:'GGS',climate:'humidifier',irrigation:'smart-drip',reservoir:'20L',sensors:true,camera:false},
  engineering:{silencer:true,vibration:true,leakProtection:true,ups:false,din:true,rkn:true}
 };
 const clone=o=>JSON.parse(JSON.stringify(o));
 function merge(base,src){
  const o=clone(base); src=src||{};
  Object.keys(src).forEach(k=>{
   if(src[k]&&typeof src[k]==='object'&&!Array.isArray(src[k]))o[k]=Object.assign({},o[k]||{},src[k]);
   else if(src[k]!==undefined)o[k]=src[k];
  });
  return o;
 }
 function migrate(){
  try{
   const old=JSON.parse(localStorage.getItem(OLD)||'null');
   if(!old)return null;
   const g={width:18+(old.mods?.b?400:0)+(old.mods?.c?Number(old.cWidth||796):0)+18,height:2060,depth:741};
   return merge(D,{model:'CUSTOM',dimensions:{W:g.width,H:g.height,D:g.depth},finish:old.finish||'choco'});
  }catch(e){return null}
 }
 // старые сохранённые состояния использовали trayH/serviceGap — переносим их в живые ключи,
  // чтобы ничего не терялось и не появлялось value="undefined" в полях конфигуратора
  function normalize(o){
   const a=o.architecture||{};
   if(a.поддонH===undefined&&a.trayH!==undefined)a.поддонH=a.trayH;
   if(a.сервисGap===undefined&&a.serviceGap!==undefined)a.сервисGap=a.serviceGap;
   delete a.trayH;delete a.serviceGap;
   o.architecture=a;
   return o;
  }
  function load(){
   try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'null');
    if(raw)return normalize(merge(D,raw));
    return normalize(migrate()||clone(D));
   }catch(e){return clone(D)}
  }
 function save(v){
  const x=normalize(merge(D,v));
  localStorage.setItem(KEY,JSON.stringify(x));
  window.dispatchEvent(new CustomEvent('secretbox:state',{detail:x}));
  return x;
 }
 function set(v){return save(merge(load(),v))}
 function geometry(s=load()){const d=s.dimensions;return{width:+d.W||0,height:+d.H||0,depth:+d.D||0,plinth:+d.plinth||0,panel:+d.panel||0}}
 function mass(s=load()){
  const d=geometry(s), a=s.architecture||{}, e=s.equipment||{}, en=s.engineering||{};
  let m=80+(d.width*d.height*d.depth)/9000000;
  m+=(+a.techColumn||0)*0.08;
  if(e.light)m+=8;if(e.fan)m+=4;if(e.reservoir)m+=22;
  if(en.silencer)m+=8;if(en.vibration)m+=2;if(en.ups)m+=7;if(en.din)m+=3;
  return Math.round(m*10)/10;
 }
 function estimate(s=load()){
  let t=72000;
  const eq={SE3000:28000,SE5000:42000,G8600:56000};
  const fan={SF4:9000,SF6:13000,SF8:18000};
  if(eq[s.equipment?.light])t+=eq[s.equipment.light];
  if(fan[s.equipment?.fan])t+=fan[s.equipment.fan];
  t+=s.equipment?.controller==='GGS'?7000:0;
  t+=s.equipment?.climate==='humidifier'?7000:0;
  t+=s.equipment?.irrigation==='smart-drip'?12000:0;
  t+=s.engineering?.silencer?10000:0;
  t+=s.engineering?.vibration?3500:0;
  t+=s.engineering?.leakProtection?8000:0;
  t+=s.engineering?.ups?18000:0;
  t+=s.engineering?.rkn?5500:0;
  t+=s.finish==='choco'?25000:s.finish==='champ'?10000:0;
  return Math.round(t/500)*500;
 }
 function label(s=load()){
  const g=geometry(s);
  const names={CUSTOM:'SECRET BOX · CUSTOM',A:'SECRET BOX A · FLAGSHIP',B:'SECRET BOX B · COMPACT',C:'SECRET BOX C · DUAL ZONE'};
  const m=String(s.model||'CUSTOM').toUpperCase();
  return{model:m,modelName:names[m]||('SECRET BOX · '+m),finish:{choco:'Шоколад',champ:'Шампань',white:'Белый'}[s.finish]||s.finish,
   dimensions:g.width+' × '+g.depth+' × '+g.height+' мм',mass:mass(s),estimate:estimate(s)}
 }
 window.SECRETBOX={key:KEY,defaults:clone(D),load,save,set,reset:()=>{localStorage.removeItem(KEY);return save(D)},geometry,mass,estimate,label,
  subscribe(fn){const h=e=>fn(e.detail);addEventListener('secretbox:state',h);return()=>removeEventListener('secretbox:state',h)}};
})();