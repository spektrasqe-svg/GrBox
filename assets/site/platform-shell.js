(function(){
 const SB=window.SECRETBOX;
 const is3d=/GrowBox_v31_3D\.html$/i.test(location.pathname);
 document.body.classList.add(is3d?'sb-3d-page':'sb-platform-page');
 // ?bare=1 — встраивание без шапки (живая 3D внутри конфигуратора/лендинга)
 if(new URLSearchParams(location.search).has('bare')){document.body.classList.add('sb-bare');return;}

 // Навигация: подписано так, как это называется на самих страницах
 const items=[
  ['index.html','Главная','home'],
  ['product.html','Продукт','product'],
  ['builder.html','Конфигуратор','builder'],
  ['GrowBox_v31_3D.html','3D-модель','3d'],
  ['calculators.html','Калькуляторы','calc'],
  ['growpedia.html','Гровпедия','pedia'],
  ['engineering.html','Инженерия','engineering'],
  ['documentation.html','Документация','docs']
 ];

 // активный раздел по имени файла (без query/hash)
 const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 const fileKey={
  'index.html':'home','':'home',
  'product.html':'product','product-a.html':'product','product-b.html':'product','product-c.html':'product',
  'builder.html':'builder','growbox_v31_3d.html':'3d','calculators.html':'calc',
  'growpedia.html':'pedia','engineering.html':'engineering','documentation.html':'docs'
 }[path]||'';

 const shell=document.createElement('div'); shell.className='sb-shell';
 shell.innerHTML=
  '<a class="sb-brand" href="index.html" aria-label="SECRET BOX — на главную"><img src="assets/logo_20261005.jpg" alt="SECRET BOX"></a>'+
  '<button class="sb-menu" type="button" aria-label="Меню">МЕНЮ</button>'+
  '<nav class="sb-links">'+items.map(x=>'<a href="'+x[0]+'" data-key="'+x[2]+'">'+x[1]+'</a>').join('')+'</nav>'+
  '<a class="sb-account" href="account.html" data-key="account">КАБИНЕТ</a>'+
  '<a class="sb-home" href="order.html">ЗАПРОСИТЬ РАСЧЁТ →</a>';

 document.body.appendChild(shell);
 // старая разметка навигации на страницах больше не используется
 document.querySelectorAll('body > nav').forEach(n=>{if(n!==shell.querySelector('nav')) n.style.display='none'});

 shell.querySelectorAll('[data-key]').forEach(a=>{if(a.dataset.key===fileKey)a.classList.add('sb-active')});

 const btn=shell.querySelector('.sb-menu'), links=shell.querySelector('.sb-links');
 btn.addEventListener('click',()=>links.classList.toggle('sb-open'));
})();
