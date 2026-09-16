/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — aplicación
   Dos capas: sin conexión (casos escritos + motor de reglas) y con modelo
   (clave propia de la API de Anthropic, guardada solo en este navegador).
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
"use strict";

const { CPP, TECNICA, LOGICA, FALACIAS, CASOS,
        analizar, decidirObjecion, responderOffline, informeOffline, fichas } = window.LEX;

/* ─────────────── configuración ─────────────── */
const MODULOS = {
  contra:  {nombre:'Contraexamen', pista:'al testigo de la contraria', tipo:'audiencia', testigo:true,
            reglas:'El usuario contraexamina. Puede usar sugestivas de un solo punto y confrontar con la declaración previa (art. 203): las sugestivas NO son objetables. Sí lo son: compuesta, capciosa, que asume hechos no acreditados, que tergiversa la previa, argumentativa, repetitiva, ambigua o vaga por adjetivación, que pide opinión a un testigo lego, impertinente o coactiva.'},
  directo: {nombre:'Examen directo', pista:'a tu propio testigo', tipo:'audiencia', testigo:true,
            reglas:'El usuario hace el examen directo de su propio testigo. Son OBJETABLES las sugestivas o indicativas (art. 203), salvo introductorias, de transición o por la negación. También: compuesta, ambigua o vaga, capciosa, que asume hechos no acreditados, opinión de testigo lego, repetitiva, impertinente.'},
  cautelar:{nombre:'Audiencia de cautelar', pista:'prisión preventiva o medida alternativa', tipo:'audiencia', testigo:false,
            reglas:'Audiencia del art. 130. No hay testigos: se litiga contra la contraparte ante el juez. El juez conduce y exige concreción, pero no interroga sobre los hechos (art. 203).'},
  apertura:{nombre:'Alegato de apertura', pista:'anunciar la teoría del caso', tipo:'alegato', minutos:5,
            reglas:'Exposición inicial del art. 199: se anuncia lo que la prueba va a demostrar, no se argumenta todavía, y no se leen memoriales (art. 211).'},
  clausura:{nombre:'Alegato de clausura', pista:'cerrar con la prueba producida', tipo:'alegato', minutos:8,
            reglas:'Alegato final del art. 211: se argumenta y se valora la prueba según la sana crítica, y se cierra con la petición concreta.'}
};
const ROLES = { fiscal:'Fiscal', defensa:'Defensa' };
const otroDe = r => r === 'fiscal' ? 'DEFENSA' : 'FISCAL';
const MODELO_TURNO = 'claude-sonnet-5';
const MODELO_FONDO = 'claude-opus-5';
const TOPES = { reglas:2500, criterios:14000, ambiente:14000 };

/* ─────────────── estado ─────────────── */
const S = { modulo:'contra', rol:'defensa', casoId:null, caso:null, generado:false,
            registro:[], turnos:[], previas:[], t0:0, tick:null,
            estado:{ desdeUltimaObjecion:9, dichos:new Set() } };

/* ─────────────── utilidades ─────────────── */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mmss = s => String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');

const guardado = {
  leer(k, def){ try { const v = localStorage.getItem('lex.'+k); return v ? JSON.parse(v) : def; } catch { return def; } },
  escribir(k, v){ try { localStorage.setItem('lex.'+k, JSON.stringify(v)); return true; } catch { return false; } },
  borrar(k){ try { localStorage.removeItem('lex.'+k); } catch {} }
};
const clave = () => guardado.leer('clave', '');
const hayIA  = () => !!clave();
const kb = () => guardado.leer('kb', { reglas:'', criterios:'', ambiente:'' });

/* ─────────────── navegación ─────────────── */
function ver(id){
  $('#portada').style.display = id === 'portada' ? 'flex' : 'none';
  $('#sala').classList.toggle('activo', id === 'sala');
  $$('.panel').forEach(p => p.classList.toggle('activo', p.id === id));
  window.scrollTo(0,0);
}
$$('[data-volver]').forEach(b => b.onclick = () => ver(b.dataset.volver));
$('#empezar').onclick    = () => { pintarSetup(); ver('setup'); };
$('#irHistorial').onclick= () => { pintarHistorial(); ver('historial'); };
$('#irBase').onclick     = () => { pintarBase(); ver('base'); };
$('#irFalacias').onclick = () => { pintarFalacias(); ver('falacias'); };
$('#irAjustes').onclick  = () => { pintarAjustes(); ver('ajustes'); };

/* ═══════════════ CAPA CON MODELO ═══════════════ */
async function pedir(mensajes, opciones){
  const o = opciones || {};
  const cuerpo = {
    model: o.modelo || MODELO_TURNO,
    max_tokens: o.tope || 1200,
    messages: Array.isArray(mensajes) ? mensajes : [{ role:'user', content: mensajes }]
  };
  if (o.sistema) cuerpo.system = o.sistema;

  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{
        'content-type':'application/json',
        'x-api-key': clave(),
        'anthropic-version':'2023-06-01',
        'anthropic-dangerous-direct-browser-access':'true'
      },
      body: JSON.stringify(cuerpo)
    });
  } catch { throw new Error('No se pudo conectar. Revisá tu conexión.'); }

  if (!r.ok){
    let msg = 'HTTP ' + r.status;
    try { const e = await r.json(); msg = e?.error?.message || msg; } catch {}
    if (r.status === 401) msg = 'La clave no es válida. Revisala en Ajustes.';
    if (r.status === 429) msg = 'Alcanzaste el límite de la API. Esperá un momento.';
    if (r.status === 400 && /credit/i.test(msg)) msg = 'La cuenta no tiene crédito disponible.';
    throw new Error(msg);
  }
  const d = await r.json();
  return (d.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
}

async function pedirJson(mensajes, opciones){
  const t = await pedir(mensajes, opciones);
  const limpio = t.replace(/```json/gi,'').replace(/```/g,'').trim();
  const i = limpio.indexOf('{'), f = limpio.lastIndexOf('}');
  if (i < 0 || f < 0) throw new Error('La respuesta llegó mal formada.');
  return JSON.parse(limpio.slice(i, f+1));
}

/* ═══════════════ PANTALLA DE ARMADO ═══════════════ */
function pintarSetup(){
  const om = $('#opModulo'); om.innerHTML = '';
  for (const [k,m] of Object.entries(MODULOS)){
    const b = document.createElement('button');
    b.className = 'op'; b.dataset.k = k;
    b.setAttribute('aria-pressed', k === S.modulo);
    b.innerHTML = esc(m.nombre) + '<small>' + esc(m.pista) + '</small>';
    b.onclick = () => { S.modulo = k; S.casoId = null; pintarSetup(); };
    om.appendChild(b);
  }
  const or = $('#opRol'); or.innerHTML = '';
  for (const [k,n] of Object.entries(ROLES)){
    const b = document.createElement('button');
    b.className = 'op'; b.dataset.k = k;
    b.setAttribute('aria-pressed', k === S.rol);
    b.textContent = n;
    b.onclick = () => { S.rol = k; pintarSetup(); };
    or.appendChild(b);
  }

  const oc = $('#opCaso'); oc.innerHTML = '';
  const dispo = CASOS.filter(c => c.modulos.includes(S.modulo));
  if (hayIA()){
    const b = document.createElement('button');
    b.className = 'op'; b.dataset.k = '';
    b.setAttribute('aria-pressed', S.casoId === null);
    b.innerHTML = 'Sortear uno nuevo<small>lo genera el modelo al momento</small>';
    b.onclick = () => { S.casoId = null; pintarSetup(); };
    oc.appendChild(b);
  } else if (S.casoId === null && dispo.length){
    S.casoId = dispo[0].id;
  }
  for (const c of dispo){
    const b = document.createElement('button');
    b.className = 'op'; b.dataset.k = c.id;
    b.setAttribute('aria-pressed', c.id === S.casoId);
    b.innerHTML = esc(c.delito.split('(')[0].trim()) + '<small>' + esc(c.caratula.replace(/^F\. c\/ /,'')) + '</small>';
    b.onclick = () => { S.casoId = c.id; pintarSetup(); };
    oc.appendChild(b);
  }

  const av = $('#avisoIA');
  av.classList.remove('oculto');
  av.className = 'aviso';
  av.innerHTML = hayIA()
    ? 'Modo con modelo activo: el testigo improvisa y la devolución la escribe Claude.'
    : 'Modo sin conexión: testigo por banco de respuestas y objeciones por reglas. Para que el testigo improvise, cargá tu clave en <b>Ajustes</b>.';
  $('#abrir').disabled = !hayIA() && !dispo.length;
}

/* ═══════════════ ABRIR LA AUDIENCIA ═══════════════ */
$('#abrir').onclick = async () => {
  const m = MODULOS[S.modulo];
  if (S.casoId){
    S.caso = CASOS.find(c => c.id === S.casoId);
    S.generado = false;
    entrarSala();
  } else {
    $('#abrir').disabled = true;
    $('#avisoIA').textContent = 'Sorteando la causa y cerrando el sobre…';
    try {
      S.caso = await generarCaso();
      S.generado = true;
      entrarSala();
    } catch (e){
      $('#avisoIA').className = 'aviso malo';
      $('#avisoIA').textContent = e.message;
    } finally { $('#abrir').disabled = false; }
  }
};

async function generarCaso(){
  const m = MODULOS[S.modulo], extra = kb().ambiente;
  const pide = `Sos instructor de litigación penal oral en La Rioja, Argentina. Generá un caso de entrenamiento.

MÓDULO: ${m.nombre} — ${m.pista}. El litigante actúa como ${ROLES[S.rol]}.

REGLAS DE CONSTRUCCIÓN
- Ambientación riojana verosímil: Capital y sus barrios, o Chilecito, Chamical, Aimogasta, Olta, Villa Unión, Chepes, Sanagasta, Famatina.
- Hechos concretos: fecha, hora, lugar exacto, personas identificadas y calificación del Código Penal argentino.
- El legajo público es lo que ambas partes conocen y NO debe contener la verdad completa.
${m.testigo ? `- La declaración previa del testigo va narrada en primera persona, de 150 a 220 palabras, con estilo de acta de sumariante.
- El sobre cerrado debe tener AL MENOS DOS puntos en los que lo que el testigo vivió se contradice o excede lo que declaró antes. Concretos y explotables con preguntas: distancias, iluminación, tiempo de observación, alcohol, relación previa con las partes, qué vio y qué le contaron, dudas en el reconocimiento.`
: `- El sobre cerrado debe traer arraigo, antecedentes, conducta procesal y al menos un dato que debilita la posición del litigante.`}
${extra ? '\nMATERIAL DE REFERENCIA APORTADO POR EL USUARIO (respetá su estilo y vocabulario):\n' + extra.slice(0,12000) : ''}

Respondé SOLO este JSON, sin texto alrededor:
{"caratula":"F. c/ APELLIDO, Nombre s/ delito","delito":"calificación con artículo","sintesis":"2 o 3 oraciones","hechos":"6 a 10 oraciones sobre el estado del legajo","prueba":[{"tipo":"","detalle":""}],${m.testigo ? '"testigo":{"nombre":"","calidad":"","perfil":""},"previa":"",' : '"imputado":{"nombre":"","perfil":""},'}"sobre":{"verdad":"","puntos":["","",""],"conducta":""}}`;
  return await pedirJson(pide, { modelo: MODELO_FONDO, tope: 3000 });
}

/* ═══════════════ SALA ═══════════════ */
function entrarSala(){
  const m = MODULOS[S.modulo], c = S.caso;
  S.registro = []; S.turnos = []; S.previas = [];
  S.estado = { desdeUltimaObjecion: 9, dichos: new Set() };
  $('#hilo').innerHTML = '';
  $('#caratula').textContent = c.caratula || 'Causa sin carátula';
  $('#subtitulo').textContent = `${m.nombre} · ${ROLES[S.rol]}${hayIA() ? '' : ' · sin conexión'}`;
  $('#pie').style.display = '';
  $('#levantar').textContent = 'Levantar audiencia';
  $('#levantar').onclick = levantar;

  pintarLegajo();
  marca(m.tipo === 'alegato'
    ? `Se declara abierta la audiencia. Tiene la palabra la ${ROLES[S.rol].toLowerCase()}. Sugerido: ${m.minutos} minutos.`
    : m.testigo
      ? `El testigo ${c.testigo?.nombre || ''} presta juramento. Tiene la palabra la ${ROLES[S.rol].toLowerCase()}.`
      : `Se abre la audiencia del art. 130. Tiene la palabra la ${ROLES[S.rol].toLowerCase()}.`);

  $('#pregunta').placeholder = m.tipo === 'alegato' ? 'Pronuncie su alegato…' : 'Formule su pregunta…';
  $('#pistaIzq').textContent = 'Enter para enviar · Shift+Enter corta renglón';
  aviso('');
  arrancarReloj(m.minutos);
  ver('sala');
  setTimeout(() => $('#pregunta').focus(), 80);
}

function pintarLegajo(){
  const c = S.caso, m = MODULOS[S.modulo];
  const tabs = [{k:'hechos',n:'Hechos'},{k:'prueba',n:'Prueba'}];
  if (c.previa) tabs.push({k:'previa',n:'Declaración previa'});
  if (c.imputado) tabs.push({k:'imputado',n:'Imputado'});
  const nav = $('#pestanas'); nav.innerHTML = '';
  tabs.forEach((t,i) => {
    const b = document.createElement('button');
    b.textContent = t.n; b.setAttribute('aria-selected', i===0);
    b.onclick = () => { [...nav.children].forEach(x => x.setAttribute('aria-selected', x===b)); folio(t.k); };
    nav.appendChild(b);
  });
  folio('hechos');
}

function folio(k){
  const c = S.caso, f = $('#folios');
  if (k === 'hechos')
    f.innerHTML = '<h4>Hecho imputado</h4><p>'+esc(c.sintesis)+'</p><h4>Estado del legajo</h4><p>'+esc(c.hechos)+'</p>';
  else if (k === 'prueba')
    f.innerHTML = (c.prueba||[]).map(p => '<h4>'+esc(p.tipo)+'</h4><p>'+esc(p.detalle)+'</p>').join('') || '<p>Sin prueba cargada.</p>';
  else if (k === 'previa')
    f.innerHTML = '<h4>'+esc(c.testigo?.nombre||'Testigo')+' — '+esc(c.testigo?.calidad||'')+'</h4>'+
                  '<div class="previa"><p>'+esc(c.previa).replace(/\n+/g,'</p><p>')+'</p></div>';
  else if (k === 'imputado')
    f.innerHTML = '<h4>'+esc(c.imputado?.nombre||'')+'</h4><p>'+esc(c.imputado?.perfil||'')+'</p>';
  f.scrollTop = 0;
}

function marca(t){
  const d = document.createElement('div');
  d.className = 'marca-acta'; d.innerHTML = '<span>'+esc(t)+'</span>';
  $('#hilo').appendChild(d); alFinal();
}
function turno(quien, texto, clase){
  const d = document.createElement('div');
  d.className = 'turno ' + (clase||'');
  d.innerHTML = '<div class="quien">'+esc(quien)+'</div><p class="dicho">'+esc(texto)+'</p>';
  $('#hilo').appendChild(d); alFinal(); return d;
}
const alFinal = () => { const a = $('#acta'); a.scrollTop = a.scrollHeight; };
function aviso(t, malo){ const e = $('#pistaDer'); e.textContent = t||''; e.className = malo ? 'err' : (t ? 'ok' : ''); }

function arrancarReloj(obj){
  S.t0 = Date.now(); clearInterval(S.tick);
  S.tick = setInterval(() => {
    const s = Math.floor((Date.now()-S.t0)/1000);
    $('#reloj').textContent = mmss(s);
    if (obj) $('#reloj').classList.toggle('excedido', s > obj*60);
  }, 250);
}

/* ═══════════════ TURNO ═══════════════ */
async function formular(){
  const txt = $('#pregunta').value.trim();
  if (!txt) return;
  const m = MODULOS[S.modulo];

  $('#pregunta').value = ''; altoAuto();
  turno('USTED — ' + ROLES[S.rol].toUpperCase(), txt, 'propio');

  const an = m.tipo === 'audiencia' ? analizar(txt, S.modulo, S.previas) : null;
  if (an) S.previas.push(an.toks);
  const fila = { quien:'LITIGANTE', texto:txt, analisis:an, objetada:false, revelo:null };
  S.registro.push(fila);

  if (m.tipo === 'alegato'){
    marca('La parte concluye su alegato.');
    S.turnos.push({ role:'user', content: txt });
    setTimeout(levantar, 600);
    return;
  }

  if (hayIA()) await turnoConModelo(txt, fila);
  else turnoOffline(an, fila);

  $('#pregunta').focus();
}

/* ─── sin conexión ─── */
function turnoOffline(an, fila){
  const m = MODULOS[S.modulo], otro = otroDe(S.rol);
  S.estado.desdeUltimaObjecion++;

  const obj = m.testigo ? decidirObjecion(an, S.modulo, S.estado) : null;
  if (obj){
    S.estado.desdeUltimaObjecion = 0;
    fila.objetada = true;
    const fal = FALACIAS.find(f => f.id === obj.defecto.falacia);
    turno(otro, 'Objeción, su señoría: ' + obj.defecto.nombre.toLowerCase() +
      (fal ? '. ' + fal.planteo.replace(/^Objeto[^:]*:\s*/,'') : '. ' + obj.defecto.motivo + '.'), 'objecion');
    S.registro.push({ quien:otro, texto:'objeción' });
    if (obj.prospera){
      turno('JUEZ', 'Ha lugar. Reformule la pregunta.', 'juez');
      S.registro.push({ quien:'JUEZ', texto:'ha lugar' });
      aviso(obj.defecto.nombre + ': ' + obj.defecto.motivo, true);
      return;
    }
    turno('JUEZ', 'No ha lugar. Prosiga.', 'juez');
    S.registro.push({ quien:'JUEZ', texto:'no ha lugar' });
  }

  if (!m.testigo){
    turno(otro, 'La contraparte se opone y solicita que se resuelva conforme a los arts. 127 a 129.', 'objecion');
    turno('JUEZ', 'Escuchada la parte, continúe fundando su petición. Recuerde precisar el plazo.', 'juez');
    S.registro.push({ quien:'JUEZ', texto:'continúe' });
    return;
  }

  const r = responderOffline(S.caso, an, S.estado);
  turno('TESTIGO', r.texto, '');
  S.registro.push({ quien:'TESTIGO', texto:r.texto, revelo:r.revelado });
  if (r.revelado) aviso('Sacaste un punto del sobre cerrado.');
  else if (an.defectos.length && !obj) aviso(an.defectos[0].nombre + ': ' + an.defectos[0].motivo, true);
}

/* ─── con modelo ─── */
function instrucciones(){
  const m = MODULOS[S.modulo], c = S.caso, mio = ROLES[S.rol].toUpperCase(), otro = otroDe(S.rol);
  const extra = kb().reglas;
  const personajes = m.testigo ? `
PERSONAJES:
• TESTIGO (${c.testigo?.nombre}, ${c.testigo?.calidad}). Perfil: ${c.testigo?.perfil}. Habla en primera
  persona con el vocabulario de esa persona, no con el de un abogado. Contesta SOLO lo que se le
  pregunta. Ante una abierta se explaya y aprovecha para dañar a quien interroga; ante una sugestiva
  de un solo punto contesta seco y se calla. Nunca ofrece lo que está en el sobre cerrado: si no se
  lo preguntan bien, esa información no aparece.
• ${otro}: objeta cuando corresponde, diciendo "Objeción" y el motivo.
• JUEZ: resuelve en una línea. NO interroga al testigo jamás (art. 203).`
  : `
PERSONAJES:
• ${otro}: litiga en contra con argumentos concretos sobre los arts. 116, 127, 128 y 129.
• JUEZ: conduce, exige concreción y pide el plazo si no se lo dieron. NO interroga sobre los hechos.`;

  return `Estás corriendo una simulación de audiencia penal oral para entrenar a un litigante en La Rioja.
No sos un asistente: sostenés personajes y nunca salís de ese rol. El litigante es la ${mio}.

${CPP}

${LOGICA}

MÓDULO: ${m.nombre}. ${m.reglas}
${personajes}

LEGAJO PÚBLICO
${c.caratula} — ${c.delito}
${c.sintesis}
${c.hechos}
Prueba: ${(c.prueba||[]).map(p => p.tipo+' — '+p.detalle).join(' | ')}
${c.previa ? 'DECLARACIÓN PREVIA:\n'+c.previa : ''}
${c.imputado ? 'IMPUTADO: '+c.imputado.nombre+' — '+c.imputado.perfil : ''}

SOBRE CERRADO — solo vos lo conocés. Nunca lo reveles fuera de la boca de un personaje, y solo si una
pregunta bien formulada lo obliga a salir:
Verdad: ${c.sobre?.verdad}
Puntos: ${(c.sobre?.puntos||[]).join(' | ')}
${c.sobre?.conducta ? 'Conducta: '+c.sobre.conducta : ''}
${extra ? '\nREGLAS ADICIONALES DEL USUARIO:\n'+extra.slice(0,2500) : ''}

CÓMO OBJETAR: solo con fundamento real, y como mucho una cada cuatro o cinco preguntas (art. 204).
Si la pregunta es correcta, no inventes motivo.

Respondé SOLO este JSON:
{"intervenciones":[{"quien":"TESTIGO|${otro}|JUEZ","texto":""}],"falta":null,"revelo":false}
Si la objeción prospera: ${otro} objeta, JUEZ resuelve, el testigo NO responde.
"revelo" es true si en este turno salió algo del sobre cerrado.`;
}

async function turnoConModelo(txt, fila){
  const pensando = turno('SALA', 'Pensando…', '');
  pensando.querySelector('.dicho').className = 'pensando';
  const mens = [{ role:'user', content: instrucciones() }, ...S.turnos.slice(-14), { role:'user', content: txt }];
  try {
    const r = await pedirJson(mens, { modelo: MODELO_TURNO, tope: 900 });
    pensando.remove();
    const ivs = Array.isArray(r.intervenciones) ? r.intervenciones : [];
    if (!ivs.length) throw new Error('No hubo respuesta. Reformulá.');
    const eco = [];
    for (const iv of ivs){
      const q = String(iv.quien||'TESTIGO').toUpperCase();
      const cl = q.includes('JUEZ') ? 'juez' : (q.includes('FISCAL')||q.includes('DEFENSA')) ? 'objecion' : '';
      if (cl === 'objecion') fila.objetada = true;
      turno(q, iv.texto, cl);
      S.registro.push({ quien:q, texto:iv.texto });
      eco.push(q + ': ' + iv.texto);
    }
    if (r.revelo){ fila.revelo = true; aviso('Sacaste un punto del sobre cerrado.'); }
    else if (r.falta) aviso('Objetable: ' + r.falta, true);
    else aviso('');
    S.turnos.push({ role:'user', content: txt }, { role:'assistant', content: eco.join('\n') });
  } catch (e){
    pensando.remove();
    aviso(e.message, true);
    $('#pregunta').value = txt; altoAuto();
    S.registro.pop(); S.previas.pop();
    $('#hilo').lastElementChild?.remove();
  }
}

/* ═══════════════ DEVOLUCIÓN ═══════════════ */
async function levantar(){
  if (!S.registro.length){ aviso('Todavía no hay nada que evaluar.', true); return; }
  clearInterval(S.tick);
  const seg = Math.floor((Date.now()-S.t0)/1000);
  const m = MODULOS[S.modulo];

  ver('devolucion');
  $('#hojaDev').innerHTML = '<h2>Devolución</h2><p class="pensando">Revisando el acta…</p>';

  let d;
  if (hayIA()){
    try { d = await devolucionConModelo(seg); }
    catch (e){
      d = m.tipo === 'audiencia' ? informeOffline(S.caso, S.modulo, S.registro, seg) : null;
      if (d) d.veredicto = '[La devolución del modelo falló: ' + e.message + '] ' + d.veredicto;
      else { $('#hojaDev').innerHTML = '<h2>Devolución</h2><p>'+esc(e.message)+'</p>'; return; }
    }
  } else if (m.tipo === 'audiencia'){
    d = informeOffline(S.caso, S.modulo, S.registro, seg);
  } else {
    d = informeAlegatoOffline(seg);
  }
  pintarDevolucion(d, seg);
  archivar(d, seg);
}

async function devolucionConModelo(seg){
  const m = MODULOS[S.modulo], c = S.caso, extra = kb().criterios;
  const acta = S.registro.map(r => r.quien + ': ' + r.texto).join('\n').slice(0, 20000);
  const pide = `Sos instructor de litigación penal oral en La Rioja evaluando a un litigante después de la
audiencia. Sos exigente y concreto: cada observación se apoya en una frase textual de lo que dijo.

${CPP}

${TECNICA}

${LOGICA}

MÓDULO: ${m.nombre}. ${m.reglas}
ACTUÓ COMO: ${ROLES[S.rol]}
DURACIÓN: ${mmss(seg)}${m.minutos ? ' (sugerido '+m.minutos+' minutos)' : ''}

CASO: ${c.caratula} — ${c.delito}
${c.sintesis}
${c.previa ? 'DECLARACIÓN PREVIA:\n'+c.previa : ''}
SOBRE CERRADO (el litigante no lo conocía):
${c.sobre?.verdad}
Puntos: ${(c.sobre?.puntos||[]).join(' | ')}

ACTA:
${acta}
${extra ? '\nCRITERIOS ADICIONALES DEL USUARIO, que tienen prioridad:\n'+extra.slice(0,12000) : ''}

En "perdido" listá los puntos del sobre que no logró sacar, y con qué línea de preguntas se obtenían.
Cuando un defecto corresponda a una falacia, nombrala.

Respondé SOLO este JSON:
{"global":0.0,"veredicto":"3 a 5 oraciones","ejes":[{"eje":"","puntaje":0,"comentario":""}],
"aciertos":[""],"correcciones":[{"tuya":"","problema":"","mejor":""}],"perdido":[""]}`;
  return await pedirJson(pide, { modelo: MODELO_FONDO, tope: 3200 });
}

function informeAlegatoOffline(seg){
  const t = S.registro.map(r => r.texto).join(' ');
  const plano = window.LEX.sinTildes(t);
  const pal = t.split(/\s+/).filter(Boolean).length;
  const m = MODULOS[S.modulo];
  const tiene = re => re.test(plano);
  const ejes = [
    { eje:'Petición concreta (art. 211)', puntaje: tiene(/\b(solicito|pido|requiero|peticiono|absoluci|condena|pena de)\b/) ? 9 : 3,
      comentario:'El art. 211 exige que las partes expresen sus peticiones de un modo concreto al finalizar.' },
    { eje:'Proposiciones fácticas', puntaje: tiene(/\b(la prueba|el testigo|el perito|acredit|demostr|surge de)\b/) ? 8 : 4,
      comentario:'Se litiga con afirmaciones de hecho respaldadas en prueba, no con conclusiones jurídicas sueltas.' },
    { eje:'Extensión', puntaje: Math.max(0, Math.min(10, 10 - Math.abs(pal - m.minutos*130)/60)),
      comentario:`${pal} palabras en ${mmss(seg)}. Para ${m.minutos} minutos hablados, la referencia ronda las ${m.minutos*130}.` }
  ];
  if (S.modulo === 'apertura')
    ejes.push({ eje:'No argumentar todavía', puntaje: tiene(/\b(es evidente|no cabe duda|queda claro que|resulta indudable)\b/) ? 4 : 8,
      comentario:'La apertura anuncia lo que la prueba va a demostrar; la valoración es materia de la clausura.' });
  else
    ejes.push({ eje:'Sana crítica', puntaje: tiene(/\b(sana critica|valoraci|integral|indicio|coherent|corrobor)\b/) ? 8 : 5,
      comentario:'Los arts. 19 y 212 mandan valoración integral. Mostrá cómo se articula la prueba, no la enumeres.' });
  const global = Math.round((ejes.reduce((a,e)=>a+e.puntaje,0)/ejes.length)*10)/10;
  return { global, ejes, correcciones:[], aciertos:[],
    perdido:(S.caso.sobre?.puntos||[]).filter(p => !plano.includes(window.LEX.sinTildes(p).slice(0,25))),
    veredicto:'Informe sin conexión: se evalúa estructura y cumplimiento del art. 211. Para una devolución que cite tus frases y te reescriba los pasajes flojos, cargá tu clave en Ajustes.' };
}

function pintarDevolucion(d, seg){
  const c = S.caso, m = MODULOS[S.modulo];
  let h = '<button class="plano" data-volver="portada">← Volver al inicio</button><h2>Devolución</h2>';
  h += '<div class="global"><b>'+esc(d.global ?? '—')+'</b><span>'+esc(m.nombre)+' · '+esc(ROLES[S.rol])+' · '+mmss(seg)+'</span></div>';
  h += '<p>'+esc(d.veredicto||'')+'</p>';
  if (d.ejes?.length){
    h += '<h3>Ejes</h3>';
    for (const e of d.ejes)
      h += '<div class="eje"><strong>'+esc(e.eje)+'</strong><span class="pt">'+
           esc(typeof e.puntaje === 'number' ? e.puntaje.toFixed(1) : e.puntaje)+
           '</span><em>'+esc(e.comentario)+'</em></div>';
  }
  if (d.aciertos?.length)
    h += '<h3>Lo que funcionó</h3><ul class="limpia">'+d.aciertos.map(a=>'<li>'+esc(a)+'</li>').join('')+'</ul>';
  if (d.correcciones?.length){
    h += '<h3>Preguntas para rehacer</h3>';
    for (const k of d.correcciones)
      h += '<div class="corr"><p class="tuya">'+esc(k.tuya)+'</p><p class="mal">'+esc(k.problema)+
           '</p><p class="bien">'+esc(k.mejor)+'</p></div>';
  }
  if (d.perdido?.length)
    h += '<h3>Lo que quedó en el sobre</h3><ul class="limpia">'+d.perdido.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul>';
  h += '<h3>El sobre cerrado</h3><div class="sobre"><p>'+esc(c.sobre?.verdad||'')+'</p>'+
       (c.sobre?.puntos||[]).map(p=>'<p>— '+esc(p)+'</p>').join('')+'</div>';
  h += '<div class="acciones"><button class="principal" id="otra">Otra audiencia</button>'+
       '<button class="secundario" id="leerActa">Leer el acta</button></div>';
  $('#hojaDev').innerHTML = h;
  $('#hojaDev [data-volver]').onclick = () => ver('portada');
  $('#otra').onclick = () => { pintarSetup(); ver('setup'); };
  $('#leerActa').onclick = () => {
    ver('sala'); $('#pie').style.display = 'none';
    $('#levantar').textContent = 'Volver a la devolución';
    $('#levantar').onclick = () => ver('devolucion');
  };
}

/* ═══════════════ HISTORIAL ═══════════════ */
function archivar(d, seg){
  const h = guardado.leer('historial', []);
  h.unshift({ fecha:Date.now(), modulo:S.modulo, rol:S.rol, caratula:S.caso.caratula||'',
              global:d.global ?? null, duracion:seg, conIA:hayIA(),
              ejes:(d.ejes||[]).map(e => ({ eje:e.eje, puntaje:e.puntaje })) });
  guardado.escribir('historial', h.slice(0, 60));
}

function pintarHistorial(){
  const h = guardado.leer('historial', []);
  const cont = $('#listaHistorial');
  if (!h.length){ cont.innerHTML = '<p class="ayuda">Todavía no cerraste ninguna audiencia.</p>'; return; }
  const prom = {};
  for (const a of h) for (const e of (a.ejes||[])){
    prom[e.eje] = prom[e.eje] || [];
    if (typeof e.puntaje === 'number') prom[e.eje].push(e.puntaje);
  }
  let s = '<h3>Promedio por eje</h3>';
  for (const [eje, vals] of Object.entries(prom)){
    if (!vals.length) continue;
    const p = vals.reduce((a,b)=>a+b,0)/vals.length;
    s += '<div class="eje"><strong>'+esc(eje)+'</strong><span class="pt">'+p.toFixed(1)+
         '</span><em><span class="medidor"><i style="width:'+(p*10)+'%"></i></span></em></div>';
  }
  s += '<h3>Audiencias</h3>';
  for (const a of h)
    s += '<div class="fila"><div>'+esc(a.caratula||'—')+'<span>'+esc(MODULOS[a.modulo]?.nombre||a.modulo)+
         ' · '+esc(ROLES[a.rol]||'')+' · '+new Date(a.fecha).toLocaleDateString('es-AR')+
         (a.conIA?' · con modelo':'')+'</span></div><div class="num">'+esc(a.global ?? '—')+'</div></div>';
  cont.innerHTML = s;
}

/* ═══════════════ BASE DE CONOCIMIENTO ═══════════════ */
function pintarBase(){
  const k = kb();
  $('#kbReglas').value = k.reglas || '';
  $('#kbCriterios').value = k.criterios || '';
  $('#kbAmbiente').value = k.ambiente || '';
  medir();
}
function medir(){
  for (const [id, tope] of Object.entries(TOPES)){
    const campo = 'kb' + id.charAt(0).toUpperCase() + id.slice(1);
    const n = $('#'+campo).value.length;
    const pc = Math.min(100, (n/tope)*100);
    const med = $('#med' + id.charAt(0).toUpperCase() + id.slice(1));
    med.querySelector('i').style.width = pc + '%';
    med.classList.toggle('alto', pc > 90);
    $('#cnt' + id.charAt(0).toUpperCase() + id.slice(1)).textContent =
      n.toLocaleString('es-AR') + ' de ' + tope.toLocaleString('es-AR') + ' caracteres' +
      (pc > 90 ? ' — pasado el tope se recorta' : '');
  }
}
['kbReglas','kbCriterios','kbAmbiente'].forEach(id => $('#'+id).addEventListener('input', medir));
$('#guardarKb').onclick = () => {
  const ok = guardado.escribir('kb', {
    reglas: $('#kbReglas').value.slice(0, TOPES.reglas),
    criterios: $('#kbCriterios').value.slice(0, TOPES.criterios),
    ambiente: $('#kbAmbiente').value.slice(0, TOPES.ambiente)
  });
  $('#guardarKb').textContent = ok ? 'Guardado' : 'No se pudo guardar';
  setTimeout(() => $('#guardarKb').textContent = 'Guardar', 1600);
};
$('#exportarKb').onclick = () => {
  const blob = new Blob([JSON.stringify({ kb:kb(), historial:guardado.leer('historial',[]) }, null, 2)],
                        { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'lex-simulator-' + new Date().toISOString().slice(0,10) + '.json';
  a.click(); URL.revokeObjectURL(a.href);
};
$('#importarKb').onclick = () => $('#archivoKb').click();
$('#archivoKb').onchange = async e => {
  const f = e.target.files?.[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (d.kb) guardado.escribir('kb', d.kb);
    if (Array.isArray(d.historial)) guardado.escribir('historial', d.historial);
    pintarBase();
    alert('Material importado.');
  } catch { alert('El archivo no tiene el formato esperado.'); }
  e.target.value = '';
};

/* ═══════════════ FALACIAS ═══════════════ */
function pintarFalacias(){
  $('#listaFalacias').innerHTML = FALACIAS.map(f =>
    '<div class="falacia"><h4>'+esc(f.nombre)+'</h4>'+
    '<span class="obj">'+esc(f.objecion)+'</span>'+
    '<p>'+esc(f.que)+'</p>'+
    '<p><b>Ejemplo.</b> '+esc(f.ejemplo)+'</p>'+
    '<p class="plan">'+esc(f.planteo)+'</p>'+
    '<p style="margin-top:8px"><b>Nota.</b> '+esc(f.remedio)+'</p></div>').join('');
}

/* ═══════════════ AJUSTES ═══════════════ */
function pintarAjustes(){
  const c = clave();
  $('#clave').value = c;
  $('#estadoClave').textContent = c ? 'Hay una clave guardada en este navegador.' : 'Sin clave: la app funciona en modo sin conexión.';
}
$('#guardarClave').onclick = () => {
  const v = $('#clave').value.trim();
  guardado.escribir('clave', v);
  $('#estadoClave').textContent = v ? 'Clave guardada en este dispositivo.' : 'Clave borrada.';
};
$('#borrarClave').onclick = () => { guardado.borrar('clave'); $('#clave').value = ''; $('#estadoClave').textContent = 'Clave borrada.'; };
$('#probarClave').onclick = async () => {
  const v = $('#clave').value.trim();
  if (!v){ $('#estadoClave').textContent = 'Primero pegá una clave.'; return; }
  guardado.escribir('clave', v);
  $('#estadoClave').textContent = 'Probando…';
  try { await pedir('Respondé solamente: listo', { modelo: MODELO_TURNO, tope: 16 });
        $('#estadoClave').textContent = 'La clave funciona.'; }
  catch (e){ $('#estadoClave').textContent = e.message; }
};
$('#borrarTodo').onclick = () => {
  if (!confirm('Se borran la clave, el historial y la base de conocimiento de este dispositivo. ¿Seguir?')) return;
  ['clave','kb','historial'].forEach(guardado.borrar);
  alert('Listo.');
};

/* ═══════════════ ENTRADA ═══════════════ */
const ta = $('#pregunta');
function altoAuto(){ ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 180) + 'px'; }
ta.addEventListener('input', altoAuto);
ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); formular(); } });
$('#enviar').onclick = formular;
$('#verLegajo').onclick = () => $('#legajo').classList.toggle('abierto');
$('#acta').addEventListener('click', () => $('#legajo').classList.remove('abierto'));

/* dictado */
(function(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const b = $('#microfono');
  if (!SR){ b.style.display = 'none'; return; }
  let rec = null, base = '';
  b.onclick = () => {
    if (rec){ rec.stop(); return; }
    try {
      rec = new SR(); rec.lang = 'es-AR'; rec.continuous = true; rec.interimResults = true;
      base = ta.value ? ta.value.replace(/\s+$/,'') + ' ' : '';
      rec.onresult = ev => {
        let t = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) t += ev.results[i][0].transcript;
        ta.value = base + t; altoAuto();
      };
      rec.onerror = ev => { aviso(ev.error === 'not-allowed' ? 'El navegador no dio permiso al micrófono.' : 'No se pudo dictar.', true);
                            rec = null; b.setAttribute('aria-pressed','false'); };
      rec.onend = () => { rec = null; b.setAttribute('aria-pressed','false'); base = ta.value + ' '; };
      rec.start(); b.setAttribute('aria-pressed','true'); aviso('Dictando…');
    } catch { b.style.display = 'none'; }
  };
})();

/* ═══════════════ PWA ═══════════════ */
if ('serviceWorker' in navigator)
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));

let promptInstalar = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); promptInstalar = e; $('#instalar').classList.remove('oculto');
});
$('#instalar').onclick = async () => {
  if (!promptInstalar) return;
  promptInstalar.prompt(); await promptInstalar.userChoice;
  promptInstalar = null; $('#instalar').classList.add('oculto');
};

ver('portada');
})();
