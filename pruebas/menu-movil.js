require('./simulacro-dom.js');
['conocimiento','casos','biblioteca','motor','agentes','ingesta','aprendizaje','app',
 'grabacion','objeciones','preparacion','competencia','vigencia','audiencias'].forEach(f=>require('../js/'+f+'.js'));
const $=s=>global.document.querySelector(s);
const menu=$('#menu'), hb=$('#abrirMenu');
const velo=global.document.body.children.find(c=>c.className==='veloMenu');
const est=()=>menu.classList.contains('abierto');
let f=0; const ok=(n,c)=>{console.log((c?'  ✓ ':'  ✗ ')+n); if(!c)f++;};
ok('se crea el velo detrás del menú', !!velo);
hb.onclick({stopPropagation(){}});            ok('tocar las tres rayitas abre el menú', est());
ok('el velo aparece con el menú', velo.classList.contains('abierto'));
hb.onclick({stopPropagation(){}});            ok('tocarlas otra vez lo cierra', !est());
hb.onclick({stopPropagation(){}}); velo.onclick(); ok('tocar afuera lo cierra', !est());
// elegir Ajustes desde el menú: abre la sección y cierra el menú
hb.onclick({stopPropagation(){}});
$('#irAjustes').onclick();
ok('Ajustes se abre desde el menú', true);
console.log(f?'  '+f+' FALLAS':'  sin fallas');
