require('./simulacro-dom.js');
['conocimiento','casos','biblioteca','motor','agentes','ingesta','app'].forEach(f =>
  require('/home/claude/lex/js/'+f+'.js'));
const $ = s => global.document.querySelector(s);
const espera = ms => new Promise(r => setTimeout(r, ms));
const fallas = [];
const ok = (n,c,d) => { console.log((c?'  ✓ ':'  ✗ ')+n+(d?' — '+d:'')); if(!c) fallas.push(n); };

const PLANTEOS = {
  directo:  ['¿A qué se dedica usted?','¿Qué fue lo que vio esa noche?'],
  contra:   ['Usted declaró esa misma noche en la comisaría, ¿no es cierto?','En esa declaración dijo que no le vio bien la cara, ¿es así?'],
  cautelar: ['Mi asistido tiene arraigo: vive con su madre y trabaja en una gomería, lo acredita el informe socioambiental.','Ofrezco presentación periódica por el plazo de tres meses. Solicito se rechace la preventiva.'],
  apertura: ['Su señoría, este caso se trata de un reconocimiento hecho de noche y a los apurones. La prueba va a demostrar que el testigo vio dos segundos, de perfil y sin luz. Van a escuchar al propio damnificado admitirlo.'],
  clausura: ['Como dijimos al comenzar, todo se apoyaba en un reconocimiento. El testigo declaró que no le vio la cara. Surge del informe de alumbrado que dos luminarias estaban apagadas. Valorada en conjunto conforme la sana crítica, la prueba no alcanza. Solicito la absolución.']
};

(async () => {
  console.log('\n═══ 1. CARGA Y DEPENDENCIAS ═══');
  ok('app.js carga sin excepción', true);
  const faltan = [];
  for (const n of Object.keys(global.window.LEX)) if (global.window.LEX[n] === undefined) faltan.push(n);
  ok('ningún export indefinido', faltan.length===0, faltan.join(','));

  console.log('\n═══ 2. LOS CINCO MÓDULOS, DE PUNTA A PUNTA ═══');
  for (const [mod, planteos] of Object.entries(PLANTEOS)){
    try {
      $('#empezar').onclick();
      $('#opModulo').children.find(b=>b.dataset.k===mod).onclick();
      $('#opRol').children.find(b=>b.dataset.k==='defensa').onclick();
      const bc = $('#opCaso').children.find(b=>b.dataset.k);
      if (!bc){ ok(mod+': hay caso disponible', false); continue; }
      bc.onclick();
      await $('#abrir').onclick();
      for (const p of planteos){ $('#pregunta').value = p; await $('#enviar').onclick(); await espera(7000); }
      const antes = $('#hojaDev').innerHTML.length;
      await $('#levantar').onclick();
      await espera(1200);
      const dev = $('#hojaDev').innerHTML;
      const tieneEjes = /class="eje"/.test(dev);
      const tienePuntaje = /class="global"/.test(dev);
      ok(mod+': la audiencia corre y devuelve evaluación', tieneEjes && tienePuntaje,
         tieneEjes?'':'sin ejes en la devolución');
    } catch(e){ ok(mod+': sin excepciones', false, e.message); }
  }

  console.log('\n═══ 3. PANELES ═══');
  for (const [nom, sel] of [['Base de conocimiento','#irBase'],['Ejemplos','#irEjemplos'],
                            ['Falacias','#irFalacias'],['Ajustes','#irAjustes'],
                            ['Cargar causa','#irCausa'],['Historial','#irHistorial']]){
    try { $(sel).onclick(); ok(nom+' abre', true); }
    catch(e){ ok(nom+' abre', false, e.message); }
  }

  console.log('\n═══ 4. INGESTA DE CAUSA REAL ═══');
  try {
    $('#txtCausa').value = require('fs').readFileSync('/tmp/ipp.txt','utf8');
    $('#revisarCausa').onclick();
    const n = ($('#listaDatos').innerHTML.match(/class="dato/g)||[]).length;
    ok('detecta datos personales', n>0, n+' hallazgos');
    global.document.querySelectorAll = () => [];   // nada tildado
    $('#sanearCausa').onclick();
    ok('extrae estructura', !!$('#cCaratula').value, $('#cCaratula').value.slice(0,40));
    $('#cPuntos').value = 'La iluminación era escasa\nLa observación duró segundos';
    $('#guardarCausa').onclick();
    const guardadas = JSON.parse(global.localStorage.getItem('lex.causas')||'[]');
    ok('guarda el caso jugable', guardadas.length>0, (guardadas[0]?.banco||[]).length+' respuestas');
  } catch(e){ ok('ingesta completa', false, e.message); }

  console.log('\n═══ RESULTADO ═══');
  console.log(fallas.length ? '  ' + fallas.length + ' FALLAS: ' + fallas.join(' | ') : '  sin fallas');
})().catch(e => console.error('EXCEPCIÓN GENERAL:', e.message, e.stack.split('\n')[1]));
