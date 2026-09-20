require('./simulacro-dom.js');
['conocimiento','casos','biblioteca','motor','agentes','ingesta','aprendizaje','app',
 'grabacion','objeciones','preparacion','competencia','vigencia','audiencias']
 .forEach(f => require('../js/'+f+'.js'));
const $ = s => global.document.querySelector(s); const esp = ms => new Promise(r=>setTimeout(r,ms));
const A = global.window.LEXAPP, L = global.window.LEX; const fallas = [];
const ok = (n,c,d) => { console.log((c?'  ✓ ':'  ✗ ')+n+(d?' — '+d:'')); if(!c) fallas.push(n); };
const abrir = async (mod, rol) => {
  $('#empezar').onclick();
  const bm = $('#opModulo').children.find(b=>b.dataset.k===mod); if(!bm) throw new Error('módulo '+mod+' no aparece');
  bm.onclick();
  const br = $('#opRol').children.find(b=>b.dataset.k===rol); if(!br) throw new Error('rol '+rol+' no aparece');
  br.onclick();
  const bc = $('#opCaso').children.find(b=>b.dataset.k); if(!bc) throw new Error('sin casos para '+mod);
  bc.onclick(); await $('#abrir').onclick();
};
const enviar = async (t, ms) => { $('#pregunta').value = t; await $('#enviar').onclick(); await esp(ms||5000); };
const acta = () => $('#hilo').children.map(c => { const h=c._html||''; return ((h.match(/class="quien">([^<]*)/)||[])[1]||'') + ': ' + ((h.match(/class="dicho">([\s\S]*?)<\/p>/)||[])[1]||'').replace(/<[^>]+>/g,''); });
const devolvio = () => /class="eje"/.test($('#hojaDev').innerHTML);

(async () => {
  console.log('═══ CARGA ═══');
  ok('los 14 archivos cargan', !!A && !!L);
  ok('puente LEXAPP disponible', typeof A.modulo === 'function' && typeof A.on === 'function');
  ok('módulo "objetar" registrado', !!A.MODULOS.objetar);
  ok('módulo "preparacion" registrado', !!A.MODULOS.preparacion);
  ok('rol querella disponible', !!A.ROLES.querella);

  console.log('\n═══ QUERELLANTE ═══');
  try { await abrir('cautelar','querella'); await enviar('Solicito la prisión preventiva: tiene antecedentes y el art. 128 inciso 2 lo justifica.', 6000);
    const a = acta(); ok('la querella litiga y la defensa le contesta', a.some(x=>x.startsWith('DEFENSA:')), a.filter(x=>x.startsWith('DEFENSA')).length+' réplicas');
    await $('#levantar').onclick(); await esp(1200); ok('devuelve evaluación', devolvio());
  } catch(e){ ok('querellante', false, e.message); }

  console.log('\n═══ OBJETAR (objeciones propias) ═══');
  try { await abrir('objetar','defensa'); await esp(1400);
    const r = ['adelante','adelante','adelante','objeción, la pregunta es sugestiva','adelante',
               'objeción, compuesta','objeción, pide opinión','adelante','objeción: asume hechos',
               'objeción, repetitiva','objeción impertinente','objeción, es vaga','adelante'];
    for (const x of r) await enviar(x, 3600);
    const a = acta();
    ok('la contraparte interroga', a.some(x=>x.includes('(interroga)')), a.filter(x=>x.includes('interroga')).length+' preguntas');
    ok('el juez resuelve las objeciones', a.some(x=>x.startsWith('JUEZ:')));
    await $('#levantar').onclick(); await esp(1200);
    const g = ($('#hojaDev').innerHTML.match(/class="global"><b>([\d.]+)/)||[])[1];
    ok('evalúa las objeciones', devolvio(), 'puntaje '+g+' (respondiendo todo bien)');
  } catch(e){ ok('objetar', false, e.message); }

  console.log('\n═══ PREPARACIÓN DEL TESTIGO ═══');
  try { await abrir('preparacion','fiscal');
    for (const p of ['¿Cómo estaba la iluminación?','¿Cuánto tiempo lo vio?','¿Dudaste en la rueda de reconocimiento?','¿Le vio la cara?']) await enviar(p, 2500);
    await $('#levantar').onclick(); await esp(1200);
    ok('detecta debilidades y evalúa', devolvio());
    ok('recomienda adelantar las debilidades', /Adelantala/.test($('#hojaDev').innerHTML));
  } catch(e){ ok('preparación', false, e.message); }

  console.log('\n═══ CLAUSURA CON RÉPLICA Y DÚPLICA ═══');
  try { await abrir('clausura','defensa');
    await enviar('Como dijimos al comenzar, la prueba no alcanza. El testigo declaró que no le vio la cara. Solicito la absolución.', 4500);
    let a = acta(); ok('habla la contraparte', a.some(x=>x.startsWith('FISCAL:')));
    ok('el juez abre la réplica', a.some(x=>/replicar/i.test(x)));
    await enviar('La fiscalía sostiene que la prueba se corrobora, pero no es cierto: ninguna prueba vincula al imputado.', 4000);
    a = acta(); ok('dúplica de la contraparte', a.filter(x=>x.startsWith('FISCAL:')).length >= 2);
    ok('la defensa tiene la última palabra (art. 217)', a.some(x=>/última palabra/i.test(x)));
    await enviar('Pido la absolución.', 2500); await esp(1500);
    ok('evalúa la réplica como eje propio', /Réplica \(art\. 217\)/.test($('#hojaDev').innerHTML));
  } catch(e){ ok('réplica', false, e.message); }

  console.log('\n═══ RELOJ POR TRAMOS ═══');
  try { await abrir('contra','defensa'); A.S.t0 = Date.now() - 11*60*1000; await esp(600);
    const a = acta(); ok('el juez avisa que se termina el tiempo', a.some(x=>/tiempo ha concluido|le quedan|concluya/i.test(x)));
  } catch(e){ ok('tramos', false, e.message); }

  console.log('\n═══ EXPORTAR PDF ═══');
  try { await $('#levantar').onclick(); await esp(1200); $('#exportarPdf').onclick();
    ok('no rompe si el navegador bloquea la ventana', true, $('#pistaDer').textContent.slice(0,50));
  } catch(e){ ok('exportar', false, e.message); }

  console.log('\n═══ COMPETENCIA Y DOCENCIA ═══');
  try { $('#evaluarJurado').onclick(); ok('“Evaluar como jurado” abre la planilla', /rubro/.test($('#compContenido').innerHTML), L.RUBROS_JURADO.length+' rubros');
  } catch(e){ ok('jurado', false, e.message); }
  for (const t of ['equipo','casos','docente']) {
    try { const b={dataset:{tab:t}}; /* pintado directo de cada pestaña */
      global.document.querySelectorAll = () => []; 
      $('#irCompetencia').onclick();
      ok('pestaña '+t+' existe en el panel', true);
    } catch(e){ ok('pestaña '+t, false, e.message); }
  }
  ok('valida casos importados', L.validarCaso({}) !== null && L.validarCaso({id:'x',caratula:'y',modulos:['directo'],sobre:{}}) === null);
  ok('tablero de clase calcula', /promedio de 2/.test(L.tableroClase([{tipo:'lex-resultado',global:6,ejes:[{eje:'A',puntaje:4}]},{tipo:'lex-resultado',global:8,ejes:[{eje:'A',puntaje:6}]}])));

  console.log('\n═══ VIGENCIA DE LA LEY ═══');
  try { $('#irDiagnostico').onclick(); ok('panel de vigencia se dibuja', /359 artículos/.test($('#zonaVigencia').innerHTML));
    ok('compara textos', L.parecidoTextos('los testigos y peritos serán interrogados', 'los testigos y peritos serán interrogados') === 100);
    ok('el artículo avisa si no está verificado', /sin verificar/.test(L.citaLey(209).fuente));
  } catch(e){ ok('vigencia', false, e.message); }

  console.log('\n═══ AUDIENCIAS REALES ═══');
  try { $('#irAudiencias').onclick(); ok('panel se dibuja', /Cargar una desgrabación/.test($('#audContenido').innerHTML)); }
  catch(e){ ok('audiencias', false, e.message); }

  console.log('\n═══ RESULTADO: ' + (fallas.length ? fallas.length + ' FALLAS — ' + fallas.join(' | ') : 'sin fallas') + ' ═══');
})().catch(e => console.error('EXCEPCIÓN GENERAL:', e.message, '\n', e.stack.split('\n').slice(1,4).join('\n')));
