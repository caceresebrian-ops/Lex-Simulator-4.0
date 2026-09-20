require('./simulacro-dom.js');
let llamadas = [];
const GUION = [
  'Objeción, su señoría. La pregunta es compuesta: contiene dos hechos distintos. Conforme el artículo 210 pido que se divida.',
  'Ha lugar. Reformule la pregunta, doctor.',
  'Conforme el artículo 412 de este código, yo no tengo que contestar eso.',      // INVENTADO → debe rechazarse
  'Y bueno, esa noche volvía del gimnasio, serían las once menos veinte.'          // reintento válido
];
global.fetch = async (u, o) => { llamadas.push(JSON.parse(o.body).system?.slice(0,60)); 
  return { ok:true, status:200, json: async () => ({ content:[{type:'text', text: GUION[Math.min(llamadas.length-1, GUION.length-1)]}] }) }; };
global.localStorage.setItem('lex.clave', JSON.stringify('sk-ant-prueba'));
['conocimiento','casos','biblioteca','motor','agentes','ingesta','aprendizaje','app','grabacion','objeciones','preparacion','competencia','vigencia','audiencias'].forEach(f=>require('../js/'+f+'.js'));
const $ = s => global.document.querySelector(s);
const espera = ms => new Promise(r=>setTimeout(r,ms));
(async () => {
  $('#empezar').onclick();
  $('#opModulo').children.find(b=>b.dataset.k==='directo').onclick();
  $('#opRol').children.find(b=>b.dataset.k==='fiscal').onclick();
  $('#opCaso').children.find(b=>b.dataset.k).onclick();
  await $('#abrir').onclick();
  // dos preguntas previas para salir de la excepción de "introductoria"
  for (const p of ['¿Cómo se llama?','¿A qué se dedica?']){ $('#pregunta').value=p; await $('#enviar').onclick(); await espera(5000); }
  llamadas = [];
  $('#pregunta').value = 'Usted estaba en el lugar y además vio al imputado salir corriendo, ¿no es cierto?';
  await $('#enviar').onclick();
  await espera(12000);
  console.log('llamadas al modelo en este turno:', llamadas.length);
  console.log('\n─── acta del turno ───');
  $('#hilo').children.slice(-4).forEach(c => {
    const h=c._html||''; const q=(h.match(/class="quien">([^<]*)/)||[])[1]||'';
    const t=(h.match(/class="dicho">([\s\S]*?)<\/p>/)||[])[1]||'';
    if(q) console.log('  '+q.padEnd(16)+t.replace(/<[^>]+>/g,'').slice(0,96));
  });
  const todo = $('#hilo').children.map(c=>c._html||'').join(' ');
  console.log('\n¿se coló el artículo 412 inventado?', /412/.test(todo) ? '✗ SÍ (mal)' : '✓ no, fue rechazado');
  console.log('¿hay citas tocables?', /class="cita"/.test(todo) ? '✓ sí' : '✗ no');
})().catch(e=>console.error('EXCEPCIÓN:',e.message,'\n',e.stack.split('\n')[1]));
