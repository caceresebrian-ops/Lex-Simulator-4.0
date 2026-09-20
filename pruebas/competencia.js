require('./simulacro-dom.js');
['conocimiento','casos','biblioteca','motor','agentes','ingesta','aprendizaje','app',
 'grabacion','objeciones','preparacion','competencia','vigencia','audiencias'].forEach(f=>require('../js/'+f+'.js'));
const $=s=>global.document.querySelector(s); const L=global.window.LEX; let f=0;
for (const [tab, marca] of [['jurado','Primero litigá'],['equipo','Integrantes y tramos'],['casos','Importar caso'],['docente','Crear una consigna']]){
  try { L.pintarCompetencia(tab); const h=$('#compContenido').innerHTML;
        const bien = h.includes(marca); console.log((bien?'  ✓ ':'  ✗ ')+'pestaña '+tab+' se dibuja'); if(!bien)f++; }
  catch(e){ console.log('  ✗ pestaña '+tab+': '+e.message); f++; }
}
// el guardado del equipo y la creación de consigna ejecutan sin excepción
try { L.pintarCompetencia('equipo'); $('#eGuardar').onclick(); console.log('  ✓ guardar equipo'); } catch(e){ console.log('  ✗ guardar equipo: '+e.message); f++; }
try { L.pintarCompetencia('docente'); $('#dCaso').value='0'; $('#dModulo').value='contra'; $('#dRol').value='defensa';
      $('#dCrear').onclick(); console.log('  ✓ crear consigna'); } catch(e){ console.log('  ✗ crear consigna: '+e.message); f++; }
console.log(f ? '  '+f+' FALLAS' : '  sin fallas');
