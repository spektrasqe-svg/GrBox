/* SECRET BOX — личный кабинет.
   Всё хранится в браузере (localStorage): регистрации нет и не нужно.
   Разделы: мои данные · текущая конфигурация · мои проекты · мои заявки. */
(function(){
'use strict';
var PROF='secretbox.profile', LEADS='secretbox.leads';

function read(k,d){ try{ return JSON.parse(localStorage.getItem(k)||'null') || d }catch(e){ return d } }
function write(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)) }catch(e){} }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]}) }
function fmtDate(iso){
  var d=new Date(iso); if(isNaN(d)) return '';
  return d.toLocaleDateString('ru-RU',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
}
function toast(msg){
  var t=document.querySelector('.acc-toast');
  if(!t) return;
  t.textContent=msg; t.hidden=false;
  clearTimeout(toast._t); toast._t=setTimeout(function(){ t.hidden=true },3200);
}

/* ── мои данные ── */
function renderProfile(){
  var p=read(PROF,{});
  ['name','phone','telegram','email'].forEach(function(f){
    var el=document.getElementById('prof-'+f);
    if(el) el.value=p[f]||'';
  });
}
function saveProfile(){
  var p={};
  ['name','phone','telegram','email'].forEach(function(f){
    var el=document.getElementById('prof-'+f);
    if(el) p[f]=String(el.value||'').trim();
  });
  write(PROF,p);
  toast('Сохранено. Теперь форма заявки заполняется сама.');
}

/* ── текущая конфигурация ── */
function renderCurrent(){
  var box=document.getElementById('acc-current');
  if(!box) return;
  var S=window.SECRETBOX;
  if(!S){ box.innerHTML='<div class="acc-empty">Движок конфигурации не загрузился.</div>'; return }
  var lines=window.SB_LEADS&&SB_LEADS.configLines?SB_LEADS.configLines():[];
  box.innerHTML=lines.length
    ? lines.map(function(x){ return '<div>'+esc(x)+'</div>' }).join('')
    : '<div class="acc-empty">Конфигурация пока пустая.</div>';
}

/* ── мои проекты ── */
function renderProjects(){
  var box=document.getElementById('acc-projects');
  if(!box) return;
  var P=window.SECRETBOX_PROJECT;
  if(!P){ box.innerHTML='<div class="acc-empty">Модуль проектов недоступен.</div>'; return }
  var list=P.list()||[];
  if(!list.length){
    box.innerHTML='<div class="acc-empty">Проектов пока нет. Соберите первый в <a href="builder.html">конфигураторе</a>.</div>';
    return;
  }
  box.innerHTML=list.map(function(p){
    return '<div class="acc-row" data-id="'+esc(p.id)+'">'+
      '<div class="acc-row-main"><b>'+esc(p.name||'Проект')+'</b>'+
      '<span class="acc-meta">'+esc(p.id)+' · обновлён '+esc(fmtDate(p.updatedAt))+'</span></div>'+
      '<div class="acc-row-actions">'+
      '<button type="button" class="acc-btn" data-act="spec">СПЕЦИФИКАЦИЯ</button>'+
      '<button type="button" class="acc-btn" data-act="json">ФАЙЛ ПРОЕКТА</button>'+
      '<button type="button" class="acc-btn danger" data-act="del">УДАЛИТЬ</button>'+
      '</div></div>';
  }).join('');
}
function projectAction(e){
  var btn=e.target.closest('[data-act]'); if(!btn) return;
  var row=btn.closest('.acc-row'); var id=row&&row.getAttribute('data-id');
  var P=window.SECRETBOX_PROJECT; if(!P||!id) return;
  var p=P.load(id); if(!p){ toast('Проект не найден — возможно, очищены данные браузера.'); renderProjects(); return }
  var act=btn.getAttribute('data-act');
  if(act==='spec') P.download('secret-box-'+id+'.txt', P.exportText(p), 'text/plain;charset=utf-8');
  else if(act==='json') P.download('secret-box-'+id+'.json', P.exportJSON(p), 'application/json');
  else if(act==='del'){
    if(!confirm('Удалить проект «'+(p.name||id)+'»?')) return;
    try{ localStorage.removeItem('secretbox.project.'+id) }catch(err){}
    toast('Проект удалён.'); renderProjects();
  }
}

/* ── мои заявки ── */
function renderLeads(){
  var box=document.getElementById('acc-leads');
  if(!box) return;
  var leads=read(LEADS,[]);
  if(!leads.length){
    box.innerHTML='<div class="acc-empty">Заявок пока нет. <a href="order.html">Отправить первую →</a></div>';
    return;
  }
  box.innerHTML=leads.slice().reverse().map(function(l){
    return '<details class="acc-lead"><summary>'+
      '<span class="acc-when">'+esc(fmtDate(l.at))+'</span>'+
      '<span class="acc-type">'+esc(l.typeLabel||l.type||'Заявка')+'</span>'+
      '<span class="acc-status">'+esc(l.status||'отправлена')+'</span></summary>'+
      '<pre class="acc-text">'+esc(l.text||'')+'</pre>'+
      '<button type="button" class="acc-btn" data-copy="'+esc(l.id)+'">СКОПИРОВАТЬ</button></details>';
  }).join('');
}
function copyLead(e){
  var btn=e.target.closest('[data-copy]'); if(!btn) return;
  var leads=read(LEADS,[]), id=btn.getAttribute('data-copy');
  var l=leads.filter(function(x){ return x.id===id })[0];
  if(!l) return;
  if(window.SB_LEADS&&SB_LEADS.copy) SB_LEADS.copy(l.text||'', btn);
}

function init(){
  renderProfile(); renderCurrent(); renderProjects(); renderLeads();
  document.addEventListener('click',function(e){
    if(e.target.closest('#acc-save')){ saveProfile(); renderProfile(); return }
    if(e.target.closest('#acc-reset')){ write(PROF,{}); renderProfile(); toast('Данные очищены.'); return }
    projectAction(e); copyLead(e);
  });
  // конфигурация меняется — перерисовываем сводку
  document.addEventListener('secretbox:state',renderCurrent);
}

window.SB_ACCOUNT={renderProjects,renderLeads,renderCurrent};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
else init();
})();
