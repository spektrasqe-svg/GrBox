/* SECRET BOX — русский интерфейс v1.0 */
(function(){
'use strict';
var MAP={
'LIVE':'В РАБОТЕ','LIVE 3D':'ЖИВАЯ 3D','LIVE PROJECT':'ЖИВОЙ ПРОЕКТ','CUSTOM':'ИНДИВИДУАЛЬНЫЙ','CUSTOM BUILD':'ИНДИВИДУАЛЬНАЯ СБОРКА',
'BUILD YOUR BOX':'СОБЕРИТЕ СВОЙ ШКАФ','BUILD':'СБОРКА','PROJECT':'ПРОЕКТ','FINAL PROJECT':'ГОТОВЫЙ ПРОЕКТ',
'OPEN':'ОТКРЫТЬ','OPEN 3D':'ОТКРЫТЬ 3D','SAVE':'СОХРАНИТЬ','RESET':'СБРОСИТЬ','DOWNLOAD':'СКАЧАТЬ','EXPORT':'ЭКСПОРТИРОВАТЬ','COPY':'КОПИРОВАТЬ',
'CHECK':'ПРОВЕРКА','CHECKS':'ПРОВЕРКИ','FINAL':'ИТОГ','NEXT':'ДАЛЕЕ','BACK':'НАЗАД','START':'НАЧАТЬ','DETAILS':'ПОДРОБНОСТИ',
'ENGINEERING':'ИНЖЕНЕРИЯ','ENGINEERING VIEW':'ИНЖЕНЕРНЫЙ ВИД','VIEW':'ВИД','MODEL':'МОДЕЛЬ','MODELS':'МОДЕЛИ','SYSTEM':'СИСТЕМА','PRODUCT':'ПРОДУКТ',
'COMPATIBLE':'СОВМЕСТИМО','CONFIGURATION COMPATIBLE':'КОНФИГУРАЦИЯ СОВМЕСТИМА','NEEDS REVIEW':'ТРЕБУЕТ ПРОВЕРКИ',
'WARNING':'ПРЕДУПРЕЖДЕНИЕ','WARNINGS':'ПРЕДУПРЕЖДЕНИЯ','ERROR':'ОШИБКА','ERRORS':'ОШИБКИ','CRITICAL CONFLICT(S)':'КРИТИЧЕСКИХ КОНФЛИКТОВ',
'BASE':'БАЗА','FULL':'ПОЛНЫЙ','PRO':'ПРО','STANDARD':'СТАНДАРТ','COMPACT':'КОМПАКТ','MODULAR':'МОДУЛЬНЫЙ','LOW':'НИЗКИЙ','TV':'ТВ-ФОРМАТ',
'TECH COLUMN':'ТЕХНИЧЕСКАЯ КОЛОННА','TECH':'ТЕХНИЧЕСКИЙ','SERVICE':'СЕРВИС','SERVICE ZONE':'СЕРВИСНАЯ ЗОНА','SERVICE ACCESS':'СЕРВИСНЫЙ ДОСТУП',
'TOP NOISE BOX':'ВЕРХНИЙ ШУМОЗАЩИТНЫЙ МОДУЛЬ','NOISE BOX':'ШУМОЗАЩИТНЫЙ МОДУЛЬ','NOISE':'ШУМОЗАЩИТА','BAFFLING':'АКУСТИЧЕСКИЙ КАНАЛ',
'LIGHT':'СВЕТ','FAN':'ВЕНТИЛЯТОР','CONTROLLER':'КОНТРОЛЛЕР','HUMIDIFIER':'УВЛАЖНИТЕЛЬ','RESERVOIR':'БАК','SILENCER':'ГЛУШИТЕЛЬ',
'SMART DRIP':'АВТОПОЛИВ','SCROG GRID':'СЕТКА SCROG','TRAY':'ВЫДВИЖНОЙ ПОДДОН','MOUNT':'КРЕПЛЕНИЕ','MOUNTING':'МОНТАЖ',
'CLEARANCE':'ЗАЗОР','POWER':'МОЩНОСТЬ','AIRFLOW':'ВОЗДУШНЫЙ ПОТОК','FLOOR LOAD':'НАГРУЗКА НА ПОЛ','HEAT':'ТЕПЛОВЫДЕЛЕНИЕ',
'DOOR':'ДВЕРЬ','WIDTH':'ШИРИНА','HEIGHT':'ВЫСОТА','DEPTH':'ГЛУБИНА','MASS':'МАССА','PRICE':'ЦЕНА','BOM':'СПЕЦИФИКАЦИЯ',
'DIGITAL TWIN':'ЦИФРОВОЙ ДВОЙНИК','PLATFORM':'ПЛАТФОРМА','DESIGN':'ПРОЕКТ','PACKAGE':'КОМПЛЕКТАЦИЯ','CONFIGURATION':'КОНФИГУРАЦИЯ',
'WATCHDOG':'КОНТРОЛЬ РЕЗЕРВА','LEAK PROTECTION':'ЗАЩИТА ОТ ПРОТЕЧЕК','UPS':'ИБП','SURGE':'ЗАЩИТА ОТ ИМПУЛЬСОВ','RCD':'УЗО',
'RTSP CAMERA':'СЕТЕВАЯ КАМЕРА','SENSOR PACK':'НАБОР ДАТЧИКОВ','SMART LIFE':'УПРАВЛЕНИЕ СО СМАРТФОНА',
'GEOMETRY COMPATIBLE':'ГЕОМЕТРИЯ СОВМЕСТИМА','ACTIVE':'АКТИВНО','INACTIVE':'НЕ АКТИВНО'
};
var keys=Object.keys(MAP).sort(function(a,b){return b.length-a.length});
function esc(s){return s.replace(/[.*+?^$()|[\]\\]/g,'\\$&')}
function tr(s){
 var out=String(s);
 keys.forEach(function(k){out=out.replace(new RegExp('\\b'+esc(k)+'\\b','gi'),MAP[k]);});
 return out;
}
function textNode(n){if(n.nodeType===3 && n.parentNode && !/SCRIPT|STYLE|NOSCRIPT|TEXTAREA/.test(n.parentNode.nodeName)){var v=tr(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;}}
function scan(root){
 if(!root)return;
 var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),n;
 while(n=w.nextNode())textNode(n);
 if(root.querySelectorAll)root.querySelectorAll('[title],[aria-label]').forEach(function(el){['title','aria-label'].forEach(function(a){if(el.hasAttribute(a))el.setAttribute(a,tr(el.getAttribute(a)));});});
}
if(document.body)scan(document.body);
new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='characterData')textNode(m.target);else m.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n);});});}).observe(document.body,{subtree:true,childList:true,characterData:true});
window.SECRETBOX_RU={version:'1.0',translate:tr};
})();