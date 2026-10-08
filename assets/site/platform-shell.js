(function(){
 const SB=window.SECRETШКАФ;
 const is3d=/GrowBox_v31_3D\.html$/i.test(location.pathname);
 document.body.classList.add(is3d?'sb-3d-page':'sb-platform-page');
 function mountState(){if(!SB)return;const el=document.createElement('div');el.className='sb-state';function paint(s){const x=SB.label(s);el.innerHTML='<span class="sb-live"></span><b>ТЕКУЩАЯ КОНФИГУРАЦИЯ</b><span>'+x.dimensions+'</span><span>≈ '+Math.round(x.estimate).toLocaleString('ru-RU')+' ₽</span><a href="builder.html">Изменить</a>'}paint(SB.load());document.body.appendChild(el);SB.subscribe(paint)}
 const path=location.pathname.split('/').pop()||'index.html';
 const items=[
  ['index.html#models','Модели','models'],
  ['index.html#interior','Внутри','interior'],
  ['GrowBox_v31_3D.html','3D','3d'],
  ['builder.html','Конфигуратор','builder'],
  ['calculators.html','Расчёты','calc'],
  ['growpedia.html','Знания','pedia'],
  ['engineering.html','Инженерия','engineering'],
  ['documentation.html','Документы','docs']
 ];
 const shell=document.createElement('div'); shell.className='sb-shell';
 shell.innerHTML='<a class="sb-brand" href="index.html" aria-label="SECRET ШКАФ"><img src="assets/logo_20261005.jpg" alt="SECRET ШКАФ"></a><button class="sb-menu" type="button" aria-label="Меню">МЕНЮ</button><nav class="sb-links">'+items.map(x=>'<a href="'+x[0]+'" data-key="'+x[2]+'">'+x[1]+'</a>').join('')+'</nav><a class="sb-home" href="index.html#models">ВЫБРАТЬ ШКАФ →</a>';
 document.body.appendChild(shell); document.querySelectorAll('body > nav').forEach(n=>{if(n!==shell.querySelector('nav')) n.style.display='none'});
 const key=path.includes('3D')?'3d':path.includes('engineering')?'engineering':path.includes('documentation')?'docs':path.includes('builder')?'builder':path.includes('calculators')?'calc':path.includes('growpedia')?'pedia':'models';
 shell.querySelectorAll('[data-key]').forEach(a=>{if(a.dataset.key===key)a.classList.add('sb-active')});
 const btn=shell.querySelector('.sb-menu'), links=shell.querySelector('.sb-links');
 btn.addEventListener('click',()=>links.classList.toggle('sb-open'));
 const dock=document.createElement('div'); dock.className='sb-dock';
 dock.innerHTML='<a href="GrowBox_v31_3D.html">3D</a><a href="builder.html">СБОРЩИК</a><a href="calculators.html">РАСЧЁТЫ</a><a href="growpedia.html">ЗНАНИЯ</a>';
 document.body.appendChild(dock);
 mountState();
})();