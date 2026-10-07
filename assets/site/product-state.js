/* SECRET BOX — shared product state */
(function(){
 const KEY='secretbox.product.state.v1';
 const D={model:'A',finish:'choco',cWidth:796,mods:{a:true,b:true,c:true},equip:{se3000:true,uvir:false,ggs:true,ac10:true,sensor:true,soil:true,drip:true,humid:true},upg:{sil:true,vibe:true,acdoor:true,leak:true,ups:false,rkn:false,uzip:false,reserve:false,peri:false,cam:false}};
 const clone=o=>JSON.parse(JSON.stringify(o));
 function merge(base,src){const o=clone(base);src=src||{};Object.keys(src).forEach(k=>{if(src[k]&&typeof src[k]==='object'&&!Array.isArray(src[k]))o[k]=Object.assign({},o[k],src[k]);else if(src[k]!==undefined)o[k]=src[k]});return o}
 function load(){try{return merge(D,JSON.parse(localStorage.getItem(KEY)||'null'))}catch(e){return clone(D)}}
 function save(v){const x=merge(D,v);localStorage.setItem(KEY,JSON.stringify(x));window.dispatchEvent(new CustomEvent('secretbox:state',{detail:x}));return x}
 function set(v){return save(merge(load(),v))}
 function geometry(s=load()){return{width:18+(s.mods.b?400:0)+(s.mods.c?Number(s.cWidth):0)+18,depth:741,height:2060,airHeight:300}}
 function mass(s=load()){const e={se3000:7,uvir:2,ggs:1,ac10:2,sensor:.5,soil:.5,drip:2,humid:3},u={sil:8,vibe:2,acdoor:22,leak:3,ups:7,rkn:1,uzip:2,reserve:20,peri:4,cam:1};let m=(s.mods.a?45:0)+(s.mods.b?85:0)+(s.mods.c?(98.7+45)*s.cWidth/796:0);Object.keys(e).forEach(k=>{if(s.equip[k])m+=e[k]});Object.keys(u).forEach(k=>{if(s.upg[k])m+=u[k]});return Math.round(m*10)/10}
 function estimate(s=load()){const e={se3000:28000,uvir:18000,ggs:7000,ac10:9000,sensor:6000,soil:5000,drip:6000,humid:7000},u={sil:10000,vibe:3500,acdoor:12000,leak:8000,ups:18000,rkn:5500,uzip:7500,reserve:9000,peri:19000,cam:9000};let t=72000+(s.finish==='choco'?25000:s.finish==='champ'?10000:0);['a','b','c'].forEach(k=>{if(s.mods[k])t+=k==='c'?Math.round(28000*s.cWidth/796/500)*500:{a:20000,b:24000}[k]});Object.keys(e).forEach(k=>{if(s.equip[k])t+=e[k]});Object.keys(u).forEach(k=>{if(s.upg[k])t+=u[k]});return t}
 function label(s=load()){const g=geometry(s);const models={A:'FLAGSHIP · BOX A',B:'COMPACT · BOX B',C:'DUAL ZONE · BOX C'};return{model:s.model||'A',modelName:models[s.model]||models.A,finish:{choco:'Шоколад',champ:'Шампань',white:'Белый'}[s.finish]||s.finish,dimensions:g.width+' × '+g.depth+' × '+g.height+' мм',mass:mass(s),estimate:estimate(s)}}
 window.SECRETBOX={key:KEY,defaults:clone(D),load,save,set,reset:()=>{localStorage.removeItem(KEY);return save(D)},geometry,mass,estimate,label,subscribe(fn){const h=e=>fn(e.detail);addEventListener('secretbox:state',h);return()=>removeEventListener('secretbox:state',h)}};
})();