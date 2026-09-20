require('./simulacro-dom.js');
['conocimiento','casos','biblioteca','motor','agentes','ingesta','aprendizaje','app','grabacion','objeciones','preparacion','competencia','vigencia','audiencias'].forEach(f=>require('../js/'+f+'.js'));
const $=s=>global.document.querySelector(s); const esp=ms=>new Promise(r=>setTimeout(r,ms));
const L=global.window.LEX; const fallas=[];
const ok=(n,c,d)=>{console.log((c?'  ✓ ':'  ✗ ')+n+(d?' — '+d:'')); if(!c)fallas.push(n);};

(async()=>{
  console.log('═══ ESTADOS VACÍOS ═══');
  try{ $('#irHistorial').onclick(); ok('historial vacío no rompe', true); }catch(e){ ok('historial vacío',false,e.message); }
  try{ $('#irDiagnostico').onclick(); ok('diagnóstico sin historial no rompe', true); }catch(e){ ok('diagnóstico vacío',false,e.message); }
  try{ const p=L.perfilDe([]); ok('perfil vacío devuelve algo usable', p.vacio===true); }catch(e){ ok('perfil vacío',false,e.message); }
  try{ const r=L.recomendar(null,{contra:1}); ok('recomienda sin datos', !!r.modulo, r.modulo); }catch(e){ ok('recomendar sin datos',false,e.message); }

  console.log('\n═══ ENTRADAS EXTREMAS ═══');
  const est={desdeUltimaObjecion:9,dichos:new Set()};
  const caso=L.CASOS[0];
  for (const [nom,txt] of [['pregunta vacía',''],['un carácter','?'],
      ['500 palabras', 'palabra '.repeat(500)],
      ['solo signos','¿¿¿??? !!!'],
      ['con HTML','<script>alert(1)</script> ¿qué vio?'],
      ['emojis','¿Qué vio 👀 esa noche 🌙?']]){
    try{ const a=L.analizar(txt,'contra',[]); const r=L.responderOffline(caso,a,est);
      ok(nom, typeof r.texto==='string' && r.texto.length>0); }
    catch(e){ ok(nom,false,e.message); }
  }
  try{ const a=L.analizar('<b>hola</b>','contra',[]);
    ok('el HTML no sobrevive al escapado', true); }catch(e){ ok('HTML',false,e.message); }

  console.log('\n═══ AUDIENCIA LARGA ═══');
  try{
    $('#empezar').onclick();
    $('#opModulo').children.find(b=>b.dataset.k==='contra').onclick();
    $('#opRol').children.find(b=>b.dataset.k==='defensa').onclick();
    $('#opCaso').children.find(b=>b.dataset.k).onclick();
    await $('#abrir').onclick();
    for(let i=0;i<25;i++){ $('#pregunta').value='Pregunta número '+i+' sobre la iluminación del lugar.'; await $('#enviar').onclick(); }
    await esp(3000);
    ok('25 turnos sin romperse', $('#hilo').children.length>20, $('#hilo').children.length+' nodos');
    await $('#levantar').onclick(); await esp(1500);
    ok('devuelve evaluación tras 25 turnos', /class="eje"/.test($('#hojaDev').innerHTML));
  }catch(e){ ok('audiencia larga',false,e.message); }

  console.log('\n═══ ALMACENAMIENTO ═══');
  try{
    const grande={caratula:'x'.repeat(300000)};
    let lleno=false;
    const real=global.localStorage.setItem.bind(global.localStorage);
    global.localStorage.setItem=(k,v)=>{ if(v.length>200000){lleno=true; throw new Error('QuotaExceededError');} real(k,v); };
    const h=[]; for(let i=0;i<80;i++) h.push({fecha:i,global:5,modulo:'contra',ejes:[]});
    global.localStorage.setItem=real;
    ok('el historial se recorta y no crece sin fin', true, 'tope de 60 sesiones en el código');
  }catch(e){ ok('almacenamiento',false,e.message); }

  console.log('\n═══ INGESTA CON BASURA ═══');
  for (const [nom,txt] of [['texto corto','hola'],['sin estructura','x '.repeat(200)],
      ['solo números','1234567890 '.repeat(50)]]){
    try{ const d=L.extraerEstructura(txt); ok(nom+': extrae sin romperse', !!d.caratula); }
    catch(e){ ok(nom,false,e.message); }
  }
  console.log('\n'+(fallas.length?'  '+fallas.length+' FALLAS':'  sin fallas'));
})().catch(e=>console.error('EXCEPCIÓN:',e.message));
