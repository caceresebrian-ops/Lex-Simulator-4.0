/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — aplicación
   Dos capas: sin conexión (casos escritos + motor de reglas) y con modelo
   (clave propia de la API de Anthropic, guardada solo en este navegador).
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
"use strict";

/* Todo lo que app.js toma de los otros módulos. Si falta uno acá, la
   función que lo use muere en silencio: por eso abajo hay un control
   que avisa en consola apenas arranca.                               */
const LEXAPI = ['CPP','TECNICA','PREVIAS','LOGICA','FALACIAS','EJEMPLOS','CASOS',
  'analizar','decidirObjecion','responderOffline','informeOffline','reformular','fichas','sinTildes',
  'analizarCautelar','informeCautelar','informeAlegato','EJES_CAUTELAR',
  'clasificar','planificar','instruccionesAgente','verificarFuga','nuevaMemoria','registrar',
  'articulo','citaLey','verificarCitas','buscarLey','contextoLey',
  'detectarPersonales','sanear','extraerEstructura','construirCaso','bancoUniversal'];
const faltantes = LEXAPI.filter(k => window.LEX[k] === undefined);
if (faltantes.length) console.error('LEX: faltan módulos o funciones →', faltantes.join(', '));

/* Todo lo que app.js usa de los otros módulos. Si falta un nombre acá,
   la función que lo use muere en silencio: ya pasó una vez.        */
const {
        CASOS, CPP, EJEMPLOS, EJES_CAUTELAR, FALACIAS, LOGICA, PREVIAS, TECNICA, analizar,
        analizarCautelar, citaLey, clasificar, construirCaso, decidirObjecion,
        detectarPersonales, extraerEstructura, fichas, informeAlegato, informeCautelar,
        informeOffline, instruccionesAgente, nuevaMemoria, planificar, reformular, registrar,
        responderOffline, sanear, verificarCitas, verificarFuga
, comoCautelar, diagnostico, perfilDe, recomendar, dificultadDe
} = window.LEX;

/* Red de seguridad: si algún módulo no cargó, se ve en la consola. */
for (const n of ['CASOS', 'CPP', 'EJEMPLOS', 'EJES_CAUTELAR', 'FALACIAS', 'LOGICA', 'PREVIAS', 'TECNICA', 'analizar', 'analizarCautelar', 'citaLey', 'clasificar', 'construirCaso', 'decidirObjecion', 'detectarPersonales', 'extraerEstructura', 'fichas', 'informeAlegato', 'informeCautelar', 'informeOffline', 'instruccionesAgente', 'nuevaMemoria', 'planificar', 'reformular', 'registrar', 'responderOffline', 'sanear', 'verificarCitas', 'verificarFuga'])
  if (window.LEX[n] === undefined) console.error("LEX: falta " + n);

/* ─────────────── configuración ─────────────── */
const MODULOS = {
  contra:  {nombre:'Contraexamen', pista:'al testigo de la contraria', tipo:'audiencia', testigo:true,
            reglas:'El usuario contraexamina. Puede usar sugestivas de un solo punto y confrontar con la declaración previa (art. 209): las sugestivas NO son objetables. Sí lo son: compuesta, capciosa, que asume hechos no acreditados, que tergiversa la previa, argumentativa, repetitiva, ambigua o vaga por adjetivación, que pide opinión a un testigo lego, impertinente o coactiva.'},
  directo: {nombre:'Examen directo', pista:'a tu propio testigo', tipo:'audiencia', testigo:true,
            reglas:'El usuario hace el examen directo de su propio testigo. Son OBJETABLES las sugestivas o indicativas (art. 209), salvo introductorias, de transición o por la negación. También: compuesta, ambigua o vaga, capciosa, que asume hechos no acreditados, opinión de testigo lego, repetitiva, impertinente.'},
  cautelar:{nombre:'Audiencia de cautelar', pista:'prisión preventiva o medida alternativa', tipo:'audiencia', testigo:false,
            reglas:'Audiencia del art. 130. No hay testigos: se litiga contra la contraparte ante el juez. El juez conduce y exige concreción, pero no interroga sobre los hechos (art. 209).'},
  apertura:{nombre:'Alegato de apertura', pista:'anunciar la teoría del caso', tipo:'alegato', minutos:5,
            reglas:'Exposición inicial del art. 205: se anuncia lo que la prueba va a demostrar, no se argumenta todavía, y no se leen memoriales (art. 217).'},
  clausura:{nombre:'Alegato de clausura', pista:'cerrar con la prueba producida', tipo:'alegato', minutos:8,
            reglas:'Alegato final del art. 217: se argumenta y se valora la prueba según la sana crítica, y se cierra con la petición concreta.'}
};
const ROLES = { fiscal:'Fiscal', querella:'Querella', defensa:'Defensa' };
/* La querella acusa, igual que la fiscalía: su contraparte es la defensa. */
const otroDe = r => r === 'defensa' ? 'FISCAL' : 'DEFENSA';
const esAcusador = r => r === 'fiscal' || r === 'querella';

/* ─────────────── complementos y eventos ───────────────
   Los módulos nuevos se enchufan acá sin tocar el motor: cada uno
   registra cómo se abre, cómo procesa un turno y cómo se evalúa.   */
const PLUGINS = {};
const OYENTES = {};
const emitir = (ev, datos) => (OYENTES[ev] || []).forEach(f => { try { f(datos); } catch (e){ console.error(ev, e); } });
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
  document.body.classList.toggle('solo-portada', id === 'portada');
  $('#sala').classList.toggle('activo', id === 'sala');
  $$('.panel').forEach(p => p.classList.toggle('activo', p.id === id));
  window.scrollTo(0,0);
}
$$('[data-volver]').forEach(b => b.onclick = () => ver(b.dataset.volver));
$('#empezar').onclick    = () => { pintarSetup(); ver('setup'); };
$('#irHistorial').onclick= () => { pintarHistorial(); ver('historial'); };
$('#irBase').onclick     = () => { pintarBase(); ver('base'); };
$('#irCausa').onclick    = () => { pintarCausa(); ver('causa'); };

/* Menú desplegable: en el teléfono la barra no alcanza para seis secciones */
const menu = $('#menu'), hb = $('#abrirMenu');
if (hb){
  hb.onclick = e => {
    e.stopPropagation();
    const abierto = menu.classList.contains('abierto');
    menu.classList.toggle('abierto', !abierto);
    hb.setAttribute('aria-expanded', String(!abierto));
  };
  document.addEventListener('click', () => {
    menu.classList.remove('abierto'); hb.setAttribute('aria-expanded','false');
  });
  menu.addEventListener('click', () => {
    menu.classList.remove('abierto'); hb.setAttribute('aria-expanded','false');
  });
}
$('#irFalacias').onclick = () => { pintarFalacias(); ver('falacias'); };
$('#irDiagnostico').onclick = () => { pintarDiagnostico(); ver('diagnostico'); };
$('#irEjemplos').onclick = () => { pintarEjemplos(); ver('ejemplos'); };
$('#irAjustes').onclick  = () => { pintarAjustes(); ver('ajustes'); };
$('#verDetalles').onclick = () => ver('detalles');
$('#detallesEmpezar').onclick = () => { pintarSetup(); ver('setup'); };

/* ─── carrusel de la portada: puntos sincronizados con el arrastre ─── */
(function(){
  const pista = $('#rasgos'), cont = $('#puntos');
  if (!pista || !cont) return;
  const tarjetas = [...pista.children];
  tarjetas.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'punto'; b.type = 'button'; b.role = 'tab';
    b.setAttribute('aria-selected', i === 0);
    b.setAttribute('aria-label', 'Característica ' + (i+1));
    b.onclick = () => tarjetas[i].scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' });
    cont.appendChild(b);
  });
  let pendiente = null;
  pista.addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = requestAnimationFrame(() => {
      pendiente = null;
      const centro = pista.scrollLeft + pista.clientWidth / 2;
      let cerca = 0, dist = Infinity;
      tarjetas.forEach((t, i) => {
        const d = Math.abs((t.offsetLeft + t.offsetWidth/2) - centro);
        if (d < dist){ dist = d; cerca = i; }
      });
      [...cont.children].forEach((p, i) => p.setAttribute('aria-selected', i === cerca));
    });
  }, { passive:true });
})();

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
  const filtro = (PLUGINS[S.modulo] && PLUGINS[S.modulo].casos) || (c => (c.modulos||[]).includes(S.modulo));
  const dispo = causasPropias().filter(filtro).concat(CASOS.filter(filtro));
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
    b.innerHTML = (c.propio ? '★ ' : '') + esc(String(c.delito||'').split('(')[0].trim()) +
                  '<small>' + esc(String(c.caratula||'').replace(/^F\. c\/ /,'')) +
                  (c.propio ? ' · causa propia' : '') + '</small>';
    b.onclick = () => { S.casoId = c.id; pintarSetup(); };
    oc.appendChild(b);
  }

  const av = $('#avisoIA');
  av.classList.remove('oculto');
  av.className = 'aviso';
  av.innerHTML = hayIA()
    ? 'Modo con modelo activo: el testigo improvisa y la devolución la escribe Claude.'
    : 'Estás en <b>modo autónomo</b>: el testigo responde por banco de respuestas, así que entiende lo habitual pero no improvisa. Esto no depende de tu conexión a internet sino de la clave: cargala en <b>Ajustes</b> y el testigo pasa a contestar cualquier pregunta.';
  $('#abrir').disabled = !hayIA() && !dispo.length;
}

/* ═══════════════ ABRIR LA AUDIENCIA ═══════════════ */
$('#abrir').onclick = async () => {
  const m = MODULOS[S.modulo];
  /* Este clic es el gesto que los navegadores exigen para permitir
     que la página hable. Se aprovecha para habilitar la voz.       */
  VOZ.desbloquear();
  if (S.casoId){
    S.caso = causasPropias().find(c => c.id === S.casoId) || CASOS.find(c => c.id === S.casoId);
    /* Cualquier caso sirve para litigar su cautelar: si no trae argumentos
       escritos, se arman desde el propio legajo.                         */
    if (S.modulo === 'cautelar') S.caso = comoCautelar(S.caso);
    S.generado = false;
    entrarSala();
  } else {
    $('#abrir').disabled = true;
    $('#avisoIA').textContent = 'Sorteando la causa y cerrando el sobre…';
    try {
      S.caso = await generarCaso();
      if (S.modulo === 'cautelar') S.caso = comoCautelar(S.caso);
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


/* ═══════════════ LA VOZ DE LA SALA ═══════════════
   Cada rol habla con su propio timbre. La cola garantiza que las
   intervenciones se escuchen en orden y avisa cuando terminó la última,
   que es lo que permite reabrir el micrófono en el modo oral.        */
const VOZ = {
  soportada: typeof speechSynthesis !== 'undefined',
  encendida: false, voces: [], cola: [], hablando: false, alVaciar: null,
  generos: { testigo:'m', juez:'m', contraparte:'f' },

  /* Nombres de voces en castellano cuyo género se conoce. Sirve cuando el
     sistema tiene varias instaladas; si no, se distingue por el tono.   */
  MASC: /(pablo|jorge|diego|miguel|carlos|raul|raúl|alvaro|álvaro|enrique|andres|andrés|juan|luciano|mateo|tomas|tomás|arnau|felipe|gonzalo|sergio|dario|manuel|male|hombre|masculin)/i,
  FEM:  /(helena|laura|sabina|monica|mónica|paulina|marisol|esperanza|elvira|lucia|lucía|conchita|penelope|penélope|camila|isabela|salome|salomé|sofia|sofía|ximena|valentina|elena|dalia|paloma|female|mujer|femenin)/i,
  BUENA: /(natural|neural|online|google|premium|enhanced|wavenet)/i,
  MALA:  /(espeak|compact|pico|robot)/i,

  cargarVoces(){
    if (!this.soportada) return;
    const todas = speechSynthesis.getVoices() || [];
    let es = todas.filter(v => /^es/i.test(v.lang));
    if (!es.length) es = todas.slice(0, 3);
    /* Mejor primero: las naturales antes que las sintéticas viejas */
    es.sort((a,b) => this.calidad(b) - this.calidad(a));
    this.voces = es;
  },
  calidad(v){
    let p = 0;
    if (this.BUENA.test(v.name)) p += 3;
    if (this.MALA.test(v.name))  p -= 4;
    if (v.localService === false) p += 1;      // las de red suelen sonar mejor
    if (/^es-(AR|419|MX|US|CL|UY)/i.test(v.lang)) p += 2;   // acento rioplatense o americano
    return p;
  },
  /* Busca una voz del género pedido; si el sistema no las distingue,
     devuelve la mejor y el tono se encarga de diferenciarlas.        */
  vozDe(g){
    const elegida = guardado.leer(g === 'm' ? 'vozM' : 'vozF', '');
    if (elegida){
      const v = this.voces.find(x => x.name === elegida) ||
                (speechSynthesis.getVoices()||[]).find(x => x.name === elegida);
      if (v) return v;
    }
    const re = g === 'm' ? this.MASC : this.FEM;
    const otra = g === 'm' ? this.FEM : this.MASC;
    return this.voces.find(v => re.test(v.name))
        || this.voces.find(v => !otra.test(v.name))
        || this.voces[0] || null;
  },
  factorRate(){ return (guardado.leer('vozRate', 100) || 100) / 100; },

  perfil(quien){
    const q = String(quien || '').toUpperCase();
    if (q.includes('SALA')) return null;
    let rol = 'testigo';
    if (q.includes('JUEZ')) rol = 'juez';
    else if (q.includes('FISCAL') || q.includes('DEFENSA')) rol = 'contraparte';
    const g = this.generos[rol] || 'm';
    /* Tono base por género y ajuste por rol: el juez más grave y pausado,
       la contraparte algo más rápida al objetar.                        */
    let pitch = g === 'm' ? 0.80 : 1.14;
    let rate  = 1.0;
    if (rol === 'juez'){ pitch -= 0.06; rate = 0.93; }
    if (rol === 'contraparte'){ rate = 0.97; }   // objetar pausado, no atropellado
    return { v: this.vozDe(g), rate: rate * this.factorRate(), pitch };
  },

  /* Los sonidos de duda se deletrean si se los manda tal cual:
     "Mmm" sale como "eme eme eme". Se cambian por una pausa.   */
  paraHablar(t){
    return String(t)
      .replace(/\b(m+h*m+|hm+|mmm+|ehh+|uhm+)\b/gi, ',')
      /* Las abreviaturas se deletrean o se leen como palabra suelta.
         En una audiencia nadie dice "art punto": dice "artículo".   */
      .replace(/\barts?\.\s*/gi, m => /arts/i.test(m) ? 'artículos ' : 'artículo ')
      .replace(/\bincs?\.\s*/gi, m => /incs/i.test(m) ? 'incisos ' : 'inciso ')
      .replace(/\bC\.?P\.?P\b/g, 'Código Procesal Penal')
      .replace(/\bCPP\b/g, 'Código Procesal Penal')
      .replace(/\bCP\b/g, 'Código Penal')
      .replace(/\bDr\.\s*/g, 'doctor ').replace(/\bDra\.\s*/g, 'doctora ')
      .replace(/\bNº|\bN°/g, 'número ')
      .replace(/…/g, ', ')
      .replace(/\s*,\s*,+/g, ',')
      .replace(/^\s*[,\.]\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  decir(quien, texto){
    if (!this.soportada || !this.encendida || !texto) return;
    const p = this.perfil(quien);
    if (!p) return;
    const limpio = this.paraHablar(texto).slice(0, 600);
    if (!limpio) return;
    /* Nadie habla de corrido en una audiencia. Se parte por oraciones y
       se deja una respiración entre una y otra; quien objeta o resuelve
       hace pausas más largas, porque está midiendo al tribunal.      */
    const q = String(quien||'').toUpperCase();
    const formal = q.includes('JUEZ') || q.includes('FISCAL') || q.includes('DEFENSA');
    const trozos = limpio.split(/(?<=[.:;?!])\s+/).filter(Boolean);
    trozos.forEach((t, i) => {
      this.cola.push({ texto:t, p, pausa: i < trozos.length-1 ? (formal ? 520 : 260) : 0 });
    });
    if (!this.hablando) this._siguiente();
  },

  _siguiente(){
    const item = this.cola.shift();
    if (!item){
      this.hablando = false;
      const cb = this.alVaciar; this.alVaciar = null;
      if (cb) setTimeout(cb, 120);
      return;
    }
    this.hablando = true;
    try {
      const u = new SpeechSynthesisUtterance(item.texto);
      u.lang = (item.p.v && item.p.v.lang) || 'es-AR';
      u.rate = item.p.rate; u.pitch = item.p.pitch;
      if (item.p.v) u.voice = item.p.v;
      const seguir = () => item.pausa ? setTimeout(() => this._siguiente(), item.pausa) : this._siguiente();
      u.onend = seguir;
      u.onerror = seguir;
      speechSynthesis.speak(u);
    } catch { this._siguiente(); }
  },

  callar(){
    if (!this.soportada) return;
    this.cola = [];
    try { speechSynthesis.cancel(); } catch {}
    this.hablando = false;
    const cb = this.alVaciar; this.alVaciar = null;
    if (cb) setTimeout(cb, 60);
  },

  desbloquear(){
    if (!this.soportada) return;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0; speechSynthesis.speak(u);
    } catch {}
  }
};
if (VOZ.soportada){
  VOZ.cargarVoces();
  speechSynthesis.onvoiceschanged = () => VOZ.cargarVoces();
}

/* ═══════════════ SALA ═══════════════ */
function entrarSala(){
  const m = MODULOS[S.modulo], c = S.caso;
  S.registro = []; S.previas = [];
  S.dificultad = dificultadDe(perfilDe(guardado.leer('historial', [])));
  S.estado = { desdeUltimaObjecion: 9, dichos: new Set(), dificultad: S.dificultad };
  S.fundado = '';
  S.mem = nuevaMemoria();
  $('#hilo').innerHTML = '';
  $('#caratula').textContent = c.caratula || 'Causa sin carátula';
  $('#subtitulo').innerHTML = `${esc(m.nombre)} · ${esc(ROLES[S.rol])} · ` +
    (hayIA() ? '<b style="color:var(--laurel)">testigo con IA</b>'
             : '<button class="plano" id="irClave" style="font-size:12px">modo autónomo · activar IA</button>');
  const bc = $('#irClave');
  if (bc) bc.onclick = () => { pintarAjustes(); ver('ajustes'); };
  $('#pie').style.display = '';
  $('#levantar').textContent = 'Levantar audiencia';
  $('#levantar').onclick = levantar;

  /* El testigo tiene el género que le fijó el caso; el juez y la
     contraparte se sortean, para que no suenen siempre igual.     */
  VOZ.generos = {
    testigo: (c.testigo && c.testigo.genero) || 'm',
    juez: Math.random() < 0.5 ? 'm' : 'f',
    contraparte: Math.random() < 0.5 ? 'm' : 'f'
  };
  VOZ.cargarVoces();
  VOZ.encendida = guardado.leer('voz', true) !== false;
  $('#vozToggle').setAttribute('aria-pressed', VOZ.encendida);

  pintarLegajo();
  marca(m.tipo === 'alegato'
    ? `Se declara abierta la audiencia. Tiene la palabra la ${ROLES[S.rol].toLowerCase()}. Sugerido: ${m.minutos} minutos.`
    : m.testigo
      ? `El testigo ${c.testigo?.nombre || ''} presta juramento. Tiene la palabra la ${ROLES[S.rol].toLowerCase()}.`
      : `Se abre la audiencia del art. 130. Tiene la palabra la ${ROLES[S.rol].toLowerCase()}.`);

  $('#pregunta').placeholder = m.tipo === 'alegato' ? 'Pronuncie su alegato…' : 'Formule su pregunta…';
  $('#pistaIzq').textContent = 'Enter para enviar · Shift+Enter corta renglón';
  aviso('');
  S.fase = 'principal';
  S.avisosTiempo = new Set();
  arrancarReloj(tiempoDelModulo(S.modulo));
  ver('sala');
  if (PLUGINS[S.modulo] && PLUGINS[S.modulo].abrir) PLUGINS[S.modulo].abrir(S);
  emitir('abrir', { modulo:S.modulo, rol:S.rol, caso:S.caso });
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
  $('#hilo').appendChild(d); alFinal();
  if (clase !== 'propio' && texto !== 'Pensando…') VOZ.decir(quien, texto);
  emitir('turno', { quien, texto, t: S.t0 ? (Date.now() - S.t0) / 1000 : 0 });
  return d;
}
const alFinal = () => { const a = $('#acta'); a.scrollTop = a.scrollHeight; };

/* El testigo piensa antes de contestar. Una respuesta instantánea
   rompe la ilusión y además no entrena el silencio, que en una
   audiencia real es donde uno se pone nervioso.                  */
function pensando(quien){
  const d = document.createElement('div');
  d.className = 'turno';
  d.innerHTML = '<div class="quien">'+esc(quien)+'</div>' +
                '<span class="puntitos"><i></i><i></i><i></i></span>';
  $('#hilo').appendChild(d); alFinal(); return d;
}
const demora = ms => new Promise(r => setTimeout(r, ms));
function aviso(t, malo){ const e = $('#pistaDer'); e.textContent = t||''; e.className = malo ? 'err' : (t ? 'ok' : ''); }

/* Tiempos por audiencia, configurables en Ajustes. En competencia se
   litiga contra reloj y en una sala real el juez corta.             */
const TIEMPOS_BASE = { directo:12, contra:10, cautelar:15, apertura:5, clausura:8, objetar:8, preparacion:15 };
function tiempoDelModulo(mod){
  const t = guardado.leer('tiempos', {});
  return Number(t[mod]) || TIEMPOS_BASE[mod] || 10;
}

function arrancarReloj(obj){
  S.t0 = Date.now(); clearInterval(S.tick);
  S.tick = setInterval(() => {
    const s = Math.floor((Date.now()-S.t0)/1000);
    $('#reloj').textContent = mmss(s);
    const meta = (obj || 12) * 60;
    $('#barra').style.setProperty('--avance', Math.min(100, (s/meta)*100).toFixed(1) + '%');
    $('#reloj').classList.toggle('excedido', s > meta);
    /* El juez administra el tiempo, como en una sala */
    if (!S.avisosTiempo || !guardado.leer('avisarTiempo', true)) return;
    const hito = (clave, cuando, texto) => {
      if (s >= cuando && !S.avisosTiempo.has(clave)){
        S.avisosTiempo.add(clave);
        turno('JUEZ', texto, 'juez');
        S.registro.push({ quien:'JUEZ', texto, tiempo:true });
      }
    };
    const rest = Math.max(1, Math.round((meta - s) / 60));
    hito('80',  Math.round(meta*0.8), `Doctor, le quedan ${rest} minuto${rest>1?'s':''}.`);
    hito('100', meta, 'Su tiempo ha concluido. Vaya cerrando, por favor.');
    hito('120', Math.round(meta*1.2), 'Le voy a pedir que concluya ahora.');
  }, 250);
}

/* ═══════════════ TURNO ═══════════════ */
async function formular(){
  try { await formularInterno(); }
  catch (e){
    console.error(e);
    aviso('Se cortó el turno: ' + (e && e.message ? e.message : 'error inesperado') +
          '. Volvé a intentar o levantá la audiencia.', true);
  }
}

async function formularInterno(){
  const txt = $('#pregunta').value.trim();
  if (!txt) return;
  const m = MODULOS[S.modulo];

  $('#pregunta').value = ''; altoAuto();
  turno('USTED — ' + ROLES[S.rol].toUpperCase(), txt, 'propio');

  const esCautelar = S.modulo === 'cautelar';
  const an = (m.tipo === 'audiencia' && !esCautelar) ? analizar(txt, S.modulo, S.previas) : null;
  if (an) S.previas.push(an.toks);

  /* La fila se declara ANTES de usarla. Parece obvio, pero acá hubo un
     error que rompía la audiencia de cautelar entera y en silencio.  */
  const fila = { quien:'LITIGANTE', texto:txt, analisis:an, objetada:false, revelo:null };
  if (esCautelar){
    S.fundado = (S.fundado || '') + ' \n ' + txt;
    fila.cautelar = analizarCautelar(txt);
  }
  S.registro.push(fila);

  if (PLUGINS[S.modulo] && PLUGINS[S.modulo].turno){
    await PLUGINS[S.modulo].turno(txt, fila);
    return;
  }

  if (m.tipo === 'alegato'){
    await faseAlegato(txt, fila);
    return;
  }

  if (hayIA()) await turnoConModelo(txt, fila);
  else await turnoOffline(an, fila);

  $('#pregunta').focus();
}

/* ─── alegatos con réplica y dúplica (art. 217) ───
   La clausura no termina con tu alegato: habla la contraparte, replicás
   solo para refutar lo que no se discutió antes, y si sos defensa tenés
   la última palabra.                                                */
async function faseAlegato(txt, fila){
  fila.fase = S.fase;
  if (S.modulo === 'apertura' || !guardado.leer('replica', true)){
    marca('La parte concluye su exposición.');
    setTimeout(levantar, 600);
    return;
  }
  const otro = otroDe(S.rol);
  if (S.fase === 'principal'){
    marca('Concluye su alegato. Tiene la palabra la ' + otro.toLowerCase() + '.');
    const ind = pensando(otro); await demora(2200); ind.remove();
    const alegato = await alegatoContrario();
    turno(otro, alegato, 'objecion');
    S.registro.push({ quien:otro, texto:alegato, fase:'contraria' });
    S.alegatoContra = alegato;
    S.fase = 'replica';
    await demora(900);
    turno('JUEZ', '¿Va a replicar? Recuerde que la réplica se limita a refutar argumentos no discutidos antes.', 'juez');
    $('#pregunta').placeholder = 'Réplica: refutá lo que dijo la contraparte…';
    aviso('Réplica. Si no vas a replicar, levantá la audiencia.');
    return;
  }
  if (S.fase === 'replica'){
    const ind = pensando(otro); await demora(1900); ind.remove();
    const duplica = await duplicaContraria(txt);
    turno(otro, duplica, 'objecion');
    S.registro.push({ quien:otro, texto:duplica, fase:'duplica' });
    if (S.rol === 'defensa'){
      S.fase = 'ultima';
      await demora(800);
      turno('JUEZ', 'Tiene la última palabra la defensa, conforme el artículo 217.', 'juez');
      $('#pregunta').placeholder = 'Última palabra…';
      return;
    }
    marca('Concluidos los alegatos.');
    setTimeout(levantar, 900);
    return;
  }
  marca('Concluidos los alegatos.');
  setTimeout(levantar, 700);
}

async function alegatoContrario(){
  const c = S.caso, soyAcusador = esAcusador(S.rol);
  if (hayIA()){
    try {
      const r = await pedir(`Sos la ${soyAcusador ? 'defensa' : 'fiscalía'} en el alegato de clausura de esta causa de La Rioja.
${legajoCorto(c)}
Tu adversario dijo: "${S.registro.filter(x=>x.quien==='LITIGANTE').map(x=>x.texto).join(' ').slice(0,1500)}"
Alegá en 5 a 7 oraciones, con tu teoría del caso, valoración de la prueba y petición concreta (art. 217).
Respondé solo con tu alegato.`, { modelo: MODELO_TURNO, tope: 500 });
      if (verificarCitas(r).valido) return r.trim();
    } catch {}
  }
  const puntos = (c.sobre?.puntos || []).slice(0, 2);
  return soyAcusador
    ? `Su señoría, la acusación descansa sobre una prueba que no resiste el análisis. ${puntos[0] ? puntos[0].replace(/\.$/,'') + '.' : ''} ${puntos[1] ? puntos[1].replace(/\.$/,'') + '.' : ''} Valorada en conjunto conforme la sana crítica, esa prueba no alcanza el grado de certeza que exige una condena. El artículo 8 manda resolver la duda a favor del imputado. Solicito la absolución.`
    : `Su señoría, la prueba producida acredita el hecho y la participación. ${(c.prueba||[]).slice(0,2).map(p=>p.tipo).join(' y ') || 'La prueba de cargo'} ${c.prueba && c.prueba.length > 1 ? 'se corroboran' : 'se sostiene'} entre sí. La defensa pretende instalar una duda que no surge de ninguna constancia. Solicito la condena por ${String(c.delito||'el hecho imputado').split('(')[0].trim().toLowerCase()}.`;
}

async function duplicaContraria(replica){
  if (hayIA()){
    try {
      const r = await pedir(`Sos la contraparte en la dúplica de un alegato de clausura en La Rioja. Tu adversario replicó: "${replica.slice(0,1200)}". Duplicá en 2 o 3 oraciones, limitándote a refutar lo nuevo. Solo tu dúplica.`,
        { modelo: MODELO_TURNO, tope: 250 });
      if (verificarCitas(r).valido) return r.trim();
    } catch {}
  }
  return 'Su señoría, la réplica no introduce nada que no haya sido ya contestado. Me remito a lo expuesto en el alegato.';
}

function legajoCorto(c){
  return `Carátula: ${c.caratula}. Calificación: ${c.delito}. Hecho: ${c.sintesis||''}. Prueba: ${(c.prueba||[]).map(p=>p.tipo+' — '+p.detalle).join(' | ')}`;
}

/* ─── sin conexión ─── */

/* Cómo se funda cada objeción en voz alta. Una oración por idea, para que
   la voz pueda respirar entre una y otra.                              */
const FUNDAMENTOS = {
  sugestiva:  'La pregunta es sugestiva: contiene la respuesta que se busca. El artículo 209 no las admite en el examen directo.',
  compuesta:  'La pregunta es compuesta. Contiene más de un hecho, y la respuesta va a ser ambigua. Pido que se divida.',
  vaguedad:   'La pregunta es ambigua. El término empleado no tiene contenido preciso. El artículo 209 no admite preguntas ambiguas.',
  repetitiva: 'La pregunta ya fue formulada y respondida. El artículo 209 no admite preguntas repetitivas.',
  coaccion:   'La pregunta contiene una advertencia dirigida a condicionar la respuesta. El artículo 209 prohíbe las preguntas destinadas a coaccionar al testigo.',
  opinion:    'Se le está pidiendo al testigo una conclusión que excede lo que percibió por sus sentidos.',
  asume:      'La pregunta presupone un hecho que no está acreditado en esta audiencia. Pido que se divida.',
  adhominem:  'La pregunta no se dirige a los hechos sino a denostar al testigo. Es impertinente.',
  conclusion: 'Se le está pidiendo al testigo la conclusión, que es materia del alegato y no del interrogatorio.',
  larga:      'La pregunta es confusa por su extensión. Pido que se reformule.'
};
const APERTURAS = ['Objeción, su señoría.', 'Objeción.', 'Objeto la pregunta, su señoría.', 'Objeción, señor juez.'];
const RESUELVE_SI = [
  'Ha lugar. Reformule la pregunta, doctor.',
  'Ha lugar la objeción. Reformule.',
  'Es correcto el planteo. Ha lugar. Reformule la pregunta.'
];
const RESUELVE_NO = [
  'No ha lugar. Prosiga.',
  'No ha lugar. Puede responder el testigo.',
  'Se rechaza la objeción. Continúe, doctor.'
];
function armarObjecion(d){
  const ap = APERTURAS[Math.floor(Math.random()*APERTURAS.length)];
  const fund = FUNDAMENTOS[d.id] || (d.motivo.charAt(0).toUpperCase() + d.motivo.slice(1) + '.');
  return ap + ' ' + fund;
}
async function turnoOffline(an, fila){
  const m = MODULOS[S.modulo], otro = otroDe(S.rol);
  S.estado.desdeUltimaObjecion++;

  const obj = m.testigo ? decidirObjecion(an, S.modulo, S.estado) : null;
  if (obj) await demora(500 + Math.random()*400);   // la objeción salta rápido
  if (obj){
    S.estado.desdeUltimaObjecion = 0;
    fila.objetada = true;
    turno(otro, armarObjecion(obj.defecto), 'objecion');
    S.registro.push({ quien:otro, texto:'objeción' });
    await demora(1100 + Math.random()*700);          // el juez toma su tiempo
    if (obj.prospera){
      turno('JUEZ', RESUELVE_SI[Math.floor(Math.random()*RESUELVE_SI.length)], 'juez');
      S.registro.push({ quien:'JUEZ', texto:'ha lugar' });
      aviso(obj.defecto.nombre + ': ' + obj.defecto.motivo, true);
      return;
    }
    turno('JUEZ', RESUELVE_NO[Math.floor(Math.random()*RESUELVE_NO.length)], 'juez');
    S.registro.push({ quien:'JUEZ', texto:'no ha lugar' });
  }

  if (!m.testigo){
    const ind = pensando('SALA');
    await demora(1500 + Math.random()*900);
    ind.remove();
    const { replica, interpela } = tribunalCautelar(fila.cautelar);
    turno(otro, replica, 'objecion');
    S.registro.push({ quien:otro, texto:replica });
    await demora(1200 + Math.random()*600);
    turno('JUEZ', interpela, 'juez');
    S.registro.push({ quien:'JUEZ', texto:interpela });
    return;
  }

  /* El testigo tarda más cuanto más lo aprieta la pregunta */
  const r = responderOffline(S.caso, an, S.estado);
  const ind = pensando('TESTIGO');
  let espera = 1900 + Math.random()*900;
  if (r.revelado) espera += 900;                   // duda antes de conceder
  if (r.aclara)   espera -= 600;                   // el "no entiendo" sale antes
  await demora(Math.max(700, espera));
  ind.remove();

  turno('TESTIGO', r.texto, '');
  S.registro.push({ quien:'TESTIGO', texto:r.texto, revelo:r.revelado, aclara:r.aclara });
  if (r.revelado) aviso('Sacaste un punto del sobre cerrado.');
  else if (r.aclara) aviso('El testigo no entendió la pregunta.', true);
  else if (an.defectos.length && !obj) aviso(an.defectos[0].nombre + ': ' + an.defectos[0].motivo, true);
}

/* El tribunal reacciona a lo que todavía no fundaste. Si no diste el
   plazo, el juez te lo pide; si no descartaste las medidas del art. 116,
   la contraparte se apoya justo ahí.                                   */
/* El debate de la cautelar.
   La contraparte contesta el punto que vos acabás de plantear, con el
   argumento que ese caso tiene para ese punto, y no repite. El juez
   alterna entre exigirte lo que falta y devolverte el argumento del
   otro para que te hagas cargo.                                      */
function tribunalCautelar(an){
  const c = S.caso;
  const otroRol = S.rol === 'fiscal' ? 'defensa' : 'fiscal';
  const deb = (c.debate && c.debate[otroRol]) || {};
  const todo = window.LEX.sinTildes(S.fundado || '');
  const faltan = EJES_CAUTELAR.filter(e => !e.re.test(todo));
  const usados = S.estado.replicas || (S.estado.replicas = new Set());
  const vuelta = S.estado.vueltas = (S.estado.vueltas || 0) + 1;

  /* 1. Contestar lo que el litigante acaba de plantear */
  let replica = null, tema = null;
  for (const id of (an && an.cubre) || []){
    if (deb[id] && !usados.has(id)){ usados.add(id); replica = deb[id]; tema = id; break; }
  }
  /* 2. Si no trajo nada nuevo, atacar por donde todavía no fundó */
  if (!replica){
    const f = faltan.find(e => deb[e.id] && !usados.has(e.id));
    if (f){ usados.add(f.id); replica = deb[f.id]; tema = f.id; }
  }
  /* 3. Agotados los argumentos, la contraparte mantiene su posición */
  if (!replica) replica = deb.cierre || 'Mantengo mi posición en los términos ya expuestos, su señoría.';
  if (vuelta === 1 && deb.apertura) replica = deb.apertura + ' ' + replica;

  /* El juez: primero exige lo esencial, después te devuelve el argumento
     de la contraparte, y al final anuncia que va a resolver.          */
  const CRITICOS = ['conviccion','alternativa','plazo','peticion'];
  const EXIGE = {
    conviccion:'Doctor, antes de seguir: ¿con qué elementos concretos del legajo acredita el hecho y la participación?',
    arraigo:'¿Qué dice el informe socioambiental sobre domicilio y trabajo? Necesito el dato, no la afirmación.',
    conducta:'¿Hubo rebeldías, incomparecencias u ocultamiento de identidad en esta causa?',
    entorpecimiento:'¿Qué indicio concreto de entorpecimiento invoca? El art. 129 pide vehementes indicios, no posibilidades.',
    alternativa:'Le pido que me explique por qué ninguna de las medidas del art. 116 alcanza para neutralizar el peligro que describe.',
    limitaciones:'¿Considera aplicable alguna de las limitaciones del art. 124 a este caso?',
    plazo:'No me ha dado el plazo, doctor. ¿Por cuánto tiempo pide la medida?',
    peticion:'Concretamente, ¿qué le está pidiendo a este tribunal?',
    contradiccion:'¿Qué responde al planteo de la contraparte?'
  };
  const DEVUELVE = {
    conviccion:'La contraparte sostiene que el mérito no se discute. ¿Coincide usted, o quiere agregar algo?',
    arraigo:'Acaba de escuchar el planteo sobre el arraigo. ¿Qué responde?',
    conducta:'Se invocó el comportamiento procesal previo. ¿Cómo lo contesta?',
    entorpecimiento:'La contraparte plantea el art. 129 en términos concretos. Le escucho la respuesta.',
    alternativa:'Se le ofrecieron medidas alternativas del art. 116. ¿Por qué no serían idóneas, o por qué sí lo son?',
    limitaciones:'Se invocó el art. 124. ¿Qué tiene para decir sobre ese punto?',
    plazo:'Hay una discusión sobre el plazo. ¿Mantiene el que propuso?',
    peticion:'Ambas peticiones están sobre la mesa. ¿Agrega algo antes de que resuelva?'
  };

  let interpela;
  const critico = faltan.find(e => CRITICOS.includes(e.id));
  if (vuelta >= 5){
    interpela = 'Bien. Voy a resolver. ¿Alguna última consideración antes de que lo haga?';
  } else if (critico && vuelta <= 3){
    interpela = EXIGE[critico.id];
  } else if (tema && DEVUELVE[tema]){
    interpela = DEVUELVE[tema];
  } else if (critico){
    interpela = EXIGE[critico.id];
  } else {
    interpela = 'Tomo nota. ¿Algo más que quiera agregar?';
  }
  return { replica, interpela };
}

/* ─── con modelo ─── */
/* Cada agente habla por separado, con su propio paquete de conocimiento.
   Antes de emitir, se verifica que no haya inventado un artículo y que no
   haya filtrado el sobre cerrado.                                       */
async function hablarAgente(paso, txt, fila){
  const extra = paso.defecto ? { arts: [209, 210] } : null;
  const sistema = instruccionesAgente(paso.agente, S.caso, S.rol, S.modulo, S.mem, extra);
  const otro = otroDe(S.rol);

  const consigna = {
    objetar:   `La ${ROLES[S.rol].toLowerCase()} acaba de formular: "${txt}". Objetala: el defecto es ${paso.defecto?.nombre}. Decí "Objeción" y fundá el motivo en el artículo que corresponda.`,
    resolver:  `Se objetó la pregunta "${txt}" por ${paso.defecto?.nombre}. Resolvé: ${paso.prospera ? 'hacés lugar y mandás reformular' : 'no hacés lugar y mandás proseguir'}. Una o dos oraciones.`,
    responder: `Te preguntan: "${txt}". Contestá como el testigo que sos.`,
    replicar:  `La contraparte acaba de sostener: "${txt}". Contestá ESE punto concreto con tu mejor argumento para este caso.`,
    interpelar:`La ${ROLES[S.rol].toLowerCase()} acaba de fundar: "${txt}". Como juez, exigí lo que falte o devolvele el argumento de la contraparte.`,
    cerrar:    `Anunciá que vas a resolver y ofrecé una última consideración a las partes.`
  }[paso.intencion] || txt;

  const historia = S.registro.slice(-8).map(r => r.quien + ': ' + r.texto).join('\n');

  for (let intento = 0; intento < 2; intento++){
    const salida = await pedir(
      [{ role:'user', content: (historia ? 'ÚLTIMOS TRAMOS DEL ACTA:\n' + historia + '\n\n' : '') + consigna }],
      { modelo: MODELO_TURNO, tope: 600, sistema }
    );
    const limpio = String(salida).replace(/^["“]|["”]$/g,'').trim();
    if (!limpio) continue;

    /* ¿Inventó un artículo? */
    const vc = verificarCitas(limpio);
    if (!vc.valido && intento === 0) continue;

    /* ¿Filtró el sobre cerrado? Solo aplica al testigo. */
    if (paso.agente === 'testigo'){
      const vf = verificarFuga(limpio, txt, S.caso, S.mem);
      if (!vf.limpio && intento === 0) continue;
      if (vf.limpio || intento > 0) fila.revelo = S.mem.revelados.size > (S.revelPrev || 0);
      S.revelPrev = S.mem.revelados.size;
    }
    return { texto: limpio, citas: vc.citas };
  }
  return null;
}

async function turnoConModelo(txt, fila){
  const ind = pensando(MODULOS[S.modulo].testigo ? 'TESTIGO' : 'SALA');
  const desde = Date.now();
  const intencion = clasificar(txt, S.modulo);
  fila.intencion = intencion;
  S.estado.desdeUltimaObjecion++;
  const plan = planificar(intencion, fila.analisis, S.modulo, S.mem, S.estado);

  try {
    let primero = true;
    for (const paso of plan.escena){
      const quien = paso.agente === 'testigo' ? 'TESTIGO'
                  : paso.agente === 'juez' ? 'JUEZ' : otroDe(S.rol);
      const r = await hablarAgente(paso, txt, fila);
      if (!r) continue;
      if (primero){
        const falta = 1900 - (Date.now() - desde);
        if (falta > 0) await demora(falta);
        ind.remove(); primero = false;
      } else {
        await demora(paso.agente === 'juez' ? 900 : 600);
      }
      const clase = paso.agente === 'juez' ? 'juez'
                  : paso.agente === 'contraparte' ? 'objecion' : '';
      if (paso.intencion === 'objetar'){ fila.objetada = true; S.estado.desdeUltimaObjecion = 0; }
      const nodo = turno(quien, r.texto, clase);
      marcarCitas(nodo, r.citas);
      S.registro.push({ quien, texto:r.texto });
      registrar(S.mem, quien, r.texto);
    }
    if (primero) ind.remove();
    if (fila.revelo) aviso('Sacaste un punto del sobre cerrado.');
    else if (fila.analisis?.defectos?.length) aviso(fila.analisis.defectos[0].nombre + ': ' + fila.analisis.defectos[0].motivo, true);
    else aviso('');
  } catch (e){
    ind.remove();
    aviso(e.message, true);
    $('#pregunta').value = txt; altoAuto();
    S.registro.pop(); if (fila.analisis) S.previas.pop();
    $('#hilo').lastElementChild?.remove();
  }
}

/* Las citas legales quedan tocables: muestran el texto oficial del artículo */
function marcarCitas(nodo, citas){
  if (!nodo || !citas || !citas.length) return;
  const p = nodo.querySelector('.dicho');
  if (!p) return;
  p.innerHTML = p.textContent.replace(/\bart(?:[íi]culos?)?\.?\s*(\d{1,3})\b/gi, (m, n) => {
    const c = citas.find(x => String(x.n) === n && x.estado !== 'otra-norma' && x.estado !== 'inexistente');
    return c ? '<button class="cita" data-art="' + n + '">' + m + '</button>' : m;
  });
  p.querySelectorAll('.cita').forEach(b => b.onclick = () => verArticulo(b.dataset.art));
}

function verArticulo(n){
  const c = citaLey(n);
  if (!c){ aviso('Ese artículo no figura en la biblioteca.', true); return; }
  $('#artNumero').textContent = 'Artículo ' + c.numero;
  $('#artRubrica').textContent = c.rubrica;
  $('#artTexto').textContent = c.texto;
  $('#artFuente').textContent = c.fuente;
  $('#hojaArt').classList.remove('oculto');
}
$('#cerrarArt') && ($('#cerrarArt').onclick = () => $('#hojaArt').classList.add('oculto'));

/* ═══════════════ DEVOLUCIÓN ═══════════════ */
async function levantar(){
  if (!S.registro.length){ aviso('Todavía no hay nada que evaluar.', true); return; }
  if (typeof ORAL !== 'undefined' && ORAL.activo) ORAL.apagar();
  VOZ.callar();
  clearInterval(S.tick);
  const seg = Math.floor((Date.now()-S.t0)/1000);
  const m = MODULOS[S.modulo];

  ver('devolucion');
  $('#hojaDev').innerHTML = '<h2>Devolución</h2><p class="pensando">Revisando el acta…</p>';

  emitir('levantar', { seg });
  let d;
  if (PLUGINS[S.modulo] && PLUGINS[S.modulo].informe){
    d = PLUGINS[S.modulo].informe(S, seg);
  } else if (hayIA()){
    try { d = await devolucionConModelo(seg); }
    catch (e){
      d = S.modulo === 'cautelar' ? informeCautelar(S.caso, S.rol, S.registro, seg)
        : m.tipo === 'alegato'    ? informeAlegato(S.caso, S.modulo, S.rol, S.registro, seg, m.minutos)
        : informeOffline(S.caso, S.modulo, S.registro, seg);
      if (d) d.veredicto = '[La devolución del modelo falló: ' + e.message + '] ' + d.veredicto;
      else { $('#hojaDev').innerHTML = '<h2>Devolución</h2><p>'+esc(e.message)+'</p>'; return; }
    }
  } else if (S.modulo === 'cautelar'){
    d = informeCautelar(S.caso, S.rol, S.registro, seg);
  } else if (m.tipo === 'alegato'){
    d = informeAlegato(S.caso, S.modulo, S.rol, S.registro, seg, m.minutos);
  } else {
    d = informeOffline(S.caso, S.modulo, S.registro, seg);
  }
  if (m.tipo === 'alegato') evaluarReplica(d);
  S.ultimaDev = d; S.ultimosSeg = seg;
  pintarDevolucion(d, seg);
  archivar(d, seg);
}

/* La réplica se evalúa aparte: el art. 217 la limita a refutar lo no
   discutido, así que repetir el propio alegato es un error.          */
function evaluarReplica(d){
  const rep = S.registro.find(r => r.quien === 'LITIGANTE' && r.fase === 'replica');
  if (!rep || !d || !d.ejes) return;
  const t = window.LEX.sinTildes(rep.texto);
  const contra = window.LEX.sinTildes(S.alegatoContra || '');
  const refuta = /\b(la (fiscalia|defensa|querella) (dijo|sostiene|pretende)|se dijo|contrariamente|no es cierto|el argumento de|frente a (eso|ello)|refut)/.test(t);
  const tomaTema = window.LEX.fichas(contra).filter(w => t.includes(w)).length >= 3;
  const breve = rep.texto.split(/\s+/).length <= 180;
  const pt = (refuta ? 4 : 0) + (tomaTema ? 4 : 0) + (breve ? 2 : 0);
  d.ejes.push({ eje:'Réplica (art. 217)', puntaje: pt,
    comentario: pt >= 8 ? 'Te hiciste cargo de lo que dijo la contraparte, en forma breve.'
      : !refuta ? 'La réplica no refutó: repitió tu alegato. El art. 217 la limita a contestar argumentos no discutidos antes.'
      : !tomaTema ? 'Refutaste en abstracto. Tenías que tomar los argumentos concretos del alegato contrario.'
      : 'Fue demasiado larga para una réplica.' });
}

async function devolucionConModelo(seg){
  const m = MODULOS[S.modulo], c = S.caso, extra = kb().criterios;
  const acta = S.registro.map(r => r.quien + ': ' + r.texto).join('\n').slice(0, 20000);
  const pide = `Sos instructor de litigación penal oral en La Rioja evaluando a un litigante después de la
audiencia. Sos exigente y concreto: cada observación se apoya en una frase textual de lo que dijo.

${CPP}

${TECNICA}

${PREVIAS}

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
  h += '<div id="zonaGrabacion"></div>';
  h += '<div class="acciones"><button class="principal" id="otra">Otra audiencia</button>'+
       '<button class="secundario" id="leerActa">Leer el acta</button>'+
       '<button class="secundario" id="exportarPdf">Exportar en PDF</button>'+
       '<button class="secundario" id="evaluarJurado">Evaluar como jurado</button></div>';
  $('#hojaDev').innerHTML = h;
  $('#exportarPdf').onclick = () => exportarPdf(d, seg);
  $('#evaluarJurado').onclick = () => emitir('jurado', { d, seg });
  $('#hojaDev [data-volver]').onclick = () => ver('portada');
  $('#otra').onclick = () => { pintarSetup(); ver('setup'); };
  $('#leerActa').onclick = () => {
    ver('sala'); $('#pie').style.display = 'none';
    $('#levantar').textContent = 'Volver a la devolución';
    $('#levantar').onclick = () => ver('devolucion');
  };
  emitir('devolucion', { d, seg });
}

/* ─── Exportación en PDF ───
   Se arma una página limpia con el acta y la devolución, y se usa la
   impresión del navegador, que en cualquier dispositivo ofrece
   "Guardar como PDF". No hace falta ninguna biblioteca externa.      */
function exportarPdf(d, seg){
  const c = S.caso, m = MODULOS[S.modulo];
  const acta = S.registro.filter(r => !r.tiempo).map(r =>
    '<p><b>' + esc(r.quien === 'LITIGANTE' ? ROLES[S.rol].toUpperCase() : r.quien) + ':</b> ' + esc(r.texto) + '</p>').join('');
  const ejes = (d.ejes||[]).map(e =>
    '<tr><td>' + esc(e.eje) + '</td><td class="n">' + esc(typeof e.puntaje==='number'?e.puntaje.toFixed(1):e.puntaje) +
    '</td><td>' + esc(e.comentario) + '</td></tr>').join('');
  const corr = (d.correcciones||[]).map(k =>
    '<div class="c"><p><i>' + esc(k.tuya) + '</i></p><p class="m">' + esc(k.problema) + '</p><p class="b">' + esc(k.mejor) + '</p></div>').join('');
  const html = `<!DOCTYPE html><html lang="es-AR"><head><meta charset="utf-8">
<title>Lex Simulator — ${esc(c.caratula||'')}</title><style>
@page{margin:18mm 16mm}
body{font-family:Georgia,serif;color:#0F2A4D;font-size:11pt;line-height:1.5}
.cab{border-bottom:3px solid #C1272D;padding-bottom:8px;margin-bottom:14px}
.cab h1{font-size:15pt;margin:0}.cab p{margin:3px 0;color:#5A6B7E;font-size:9.5pt}
h2{font-size:12.5pt;border-bottom:1px solid #DCE4ED;padding-bottom:3px;margin-top:22px}
.global{font-size:26pt;font-weight:bold;color:#2E7D57}
table{width:100%;border-collapse:collapse;font-size:9.5pt}td{border-top:1px solid #DCE4ED;padding:5px;vertical-align:top}
td.n{font-weight:bold;width:40px;text-align:center}
.c{border-left:3px solid #DCE4ED;padding-left:10px;margin:8px 0;font-size:10pt}
.m{color:#C1272D;margin:2px 0}.b{border-left:3px solid #2E7D57;padding-left:8px;margin:2px 0}
.acta p{margin:5px 0;font-size:10pt}.pie{margin-top:26px;font-size:8.5pt;color:#8B9AAB;border-top:1px solid #DCE4ED;padding-top:6px}
</style></head><body>
<div class="cab"><h1>${esc(c.caratula||'')}</h1>
<p>${esc(m.nombre)} · ${esc(ROLES[S.rol])} · ${mmss(seg)} · ${new Date().toLocaleString('es-AR')}</p>
<p>${esc(c.delito||'')}</p></div>
<h2>Resultado</h2><p class="global">${esc(d.global ?? '—')}</p><p>${esc(d.veredicto||'')}</p>
${ejes ? '<h2>Ejes de evaluación</h2><table>' + ejes + '</table>' : ''}
${corr ? '<h2>Correcciones</h2>' + corr : ''}
<h2>Acta de la audiencia</h2><div class="acta">${acta}</div>
<h2>El sobre cerrado</h2><p>${esc(c.sobre?.verdad||'')}</p>
${(c.sobre?.puntos||[]).map(p=>'<p>— '+esc(p)+'</p>').join('')}
<p class="pie">Lex Simulator · Ley 10.797, Código Procesal Penal de La Rioja · Simulador de práctica: no sustituye la formación ni el criterio profesional.</p>
<script>window.onload=()=>setTimeout(()=>window.print(),350)<\/script></body></html>`;
  const w = window.open('', '_blank');
  if (!w){ aviso('El navegador bloqueó la ventana. Permití ventanas emergentes para exportar.', true); return; }
  w.document.write(html); w.document.close();
}

/* ═══════════════ HISTORIAL ═══════════════ */
function archivar(d, seg){
  const h = guardado.leer('historial', []);
  const defectos = {};
  for (const r of S.registro)
    for (const x of (r.analisis?.defectos || [])) defectos[x.nombre] = (defectos[x.nombre]||0) + 1;
  h.unshift({ fecha:Date.now(), modulo:S.modulo, rol:S.rol, caratula:S.caso.caratula||'',
              global:d.global ?? null, duracion:seg, conIA:hayIA(), defectos,
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

/* ═══════════════ CARGA DE CAUSAS REALES ═══════════════ */
const ING = { texto:'', hallazgos:[], datos:null };

const causasPropias = () => guardado.leer('causas', []);

function pintarCausa(){
  ['#pasoDatos','#pasoEstructura','#pasoSobre'].forEach(id => $(id).classList.add('oculto'));
  const mias = causasPropias();
  $('#misCausas').innerHTML = mias.length
    ? '<h3>Mis causas cargadas</h3>' + mias.map((c,i) =>
        '<div class="fila"><div>' + esc(c.caratula) +
        '<span>' + esc(c.delito) + ' · ' + (c.banco||[]).length + ' respuestas · ' +
        new Date(c.fecha||Date.now()).toLocaleDateString('es-AR') + '</span></div>' +
        '<button class="plano" data-borrar="' + i + '">Borrar</button></div>').join('')
    : '';
  $$('#misCausas [data-borrar]').forEach(b => b.onclick = () => {
    const m = causasPropias(); m.splice(+b.dataset.borrar, 1);
    guardado.escribir('causas', m); pintarCausa();
  });
}

$('#subirCausa').onclick = () => $('#archivoCausa').click();

/* Lectura de PDF en el propio dispositivo. La biblioteca se baja solo
   cuando hace falta, para no cargarla en cada visita.               */
let pdfListo = null;
function cargarPdfJs(){
  if (pdfListo) return pdfListo;
  pdfListo = new Promise((resolver, rechazar) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => {
      try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolver(window.pdfjsLib);
      } catch (e){ rechazar(e); }
    };
    s.onerror = () => rechazar(new Error('sin conexión'));
    document.head.appendChild(s);
  });
  return pdfListo;
}

async function textoDePdf(archivo, avisar){
  const pdfjs = await cargarPdfJs();
  const datos = new Uint8Array(await archivo.arrayBuffer());
  const doc = await pdfjs.getDocument({ data: datos }).promise;
  const partes = [];
  for (let p = 1; p <= doc.numPages; p++){
    if (avisar) avisar(`Leyendo página ${p} de ${doc.numPages}…`);
    const pag = await doc.getPage(p);
    const c = await pag.getTextContent();
    partes.push(c.items.map(i => i.str).join(' '));
  }
  return partes.join('\n\n').replace(/[ \t]{2,}/g, ' ');
}

$('#archivoCausa').onchange = async e => {
  const f = e.target.files?.[0]; if (!f) return;
  const estado = $('#estadoArchivo');
  try {
    if (/\.pdf$/i.test(f.name) || f.type === 'application/pdf'){
      estado.textContent = 'Abriendo el PDF…';
      const t = await textoDePdf(f, m => estado.textContent = m);
      if (t.replace(/\s/g,'').length < 200){
        estado.textContent = 'Ese PDF no tiene texto: parece un escaneo. Habría que pasarle OCR, o pegar el texto a mano.';
      } else {
        $('#txtCausa').value = t;
        estado.textContent = `Listo: ${t.length.toLocaleString('es-AR')} caracteres leídos del PDF.`;
      }
    } else {
      $('#txtCausa').value = await f.text();
      estado.textContent = 'Archivo cargado.';
    }
  } catch (err){
    estado.textContent = err.message === 'sin conexión'
      ? 'Para leer PDF hace falta conexión la primera vez. Podés pegar el texto igual.'
      : 'No se pudo leer el archivo: ' + err.message;
  }
  e.target.value = '';
};

$('#revisarCausa').onclick = () => {
  const t = $('#txtCausa').value.trim();
  if (t.length < 200){ alert('Pegá el texto de la causa: hacen falta al menos unos párrafos.'); return; }
  ING.texto = t;
  ING.hallazgos = detectarPersonales(t);
  const altos = ING.hallazgos.filter(h => h.riesgo === 'alto').length;
  $('#resumenDatos').innerHTML = ING.hallazgos.length
    ? '<b>' + ING.hallazgos.length + ' hallazgos</b>, de los cuales ' + altos +
      ' son de riesgo alto. Están marcados los de riesgo alto; revisá los demás y marcá los que sean datos reales. Todo lo marcado se reemplaza por datos ficticios riojanos.'
    : 'No se encontraron datos personales evidentes. Revisá igual el texto antes de continuar: ningún detector automático es completo.';
  $('#listaDatos').innerHTML = ING.hallazgos.map((h,i) =>
    '<label class="dato ' + h.riesgo + '"><input type="checkbox" data-i="' + i + '"' +
    (h.riesgo === 'alto' ? ' checked' : '') + '>' +
    '<span class="val">' + esc(h.valor) +
    '<span class="meta">' + esc(h.nombre) + ' · riesgo ' + h.riesgo +
    (h.veces > 1 ? ' · aparece ' + h.veces + ' veces' : '') + '</span></span></label>').join('');
  $('#pasoDatos').classList.remove('oculto');
  $('#pasoDatos').scrollIntoView({ behavior:'smooth', block:'start' });
};

$('#marcarTodo').onclick = () => $$('#listaDatos input').forEach(c => c.checked = true);

/* Un solo toque: marca todo lo encontrado, lo reemplaza y avanza. */
$('#anonimizarTodo').onclick = () => {
  $$('#listaDatos input').forEach(c => c.checked = true);
  $('#sanearCausa').onclick();
  const n = ING.hallazgos.length;
  $('#resumenDatos').innerHTML = '<b>' + n + ' datos reemplazados</b> por datos ficticios riojanos. ' +
    'Revisá el texto igual antes de seguir: ningún detector automático es completo.';
};

$('#sanearCausa').onclick = () => {
  const sel = $$('#listaDatos input').filter(c => c.checked).map(c => ING.hallazgos[+c.dataset.i]);
  const r = sanear(ING.texto, sel);
  ING.texto = r.texto;
  $('#txtCausa').value = r.texto;
  ING.datos = extraerEstructura(r.texto);
  const d = ING.datos;
  $('#cCaratula').value = d.caratula;
  $('#cDelito').value   = d.delito;
  $('#cSintesis').value = d.sintesis;
  $('#cHechos').value   = d.hechos;
  $('#cTestigo').value  = d.testigo.nombre;
  $('#cPerfil').value   = d.testigo.perfil;
  $('#cPrevia').value   = d.previa;
  const g = $('#cGenero'); g.innerHTML = '';
  for (const [k,n] of [['m','Voz masculina'],['f','Voz femenina']]){
    const b = document.createElement('button');
    b.className = 'op'; b.dataset.k = k;
    b.setAttribute('aria-pressed', k === (d.testigo.genero||'m'));
    b.textContent = n;
    b.onclick = () => { d.testigo.genero = k; [...g.children].forEach(x => x.setAttribute('aria-pressed', x.dataset.k===k)); };
    g.appendChild(b);
  }
  $('#pasoEstructura').classList.remove('oculto');
  $('#pasoEstructura').scrollIntoView({ behavior:'smooth', block:'start' });
};

$('#irSobre').onclick = () => {
  $('#pasoSobre').classList.remove('oculto');
  $('#pasoSobre').scrollIntoView({ behavior:'smooth', block:'start' });
};

$('#generarSobre').onclick = async () => {
  if (!hayIA()){ $('#estadoSobre').textContent = 'Para esto hace falta cargar tu clave en Ajustes. Si no, escribilo vos: nadie conoce el caso mejor.'; return; }
  if (!confirm('El texto de la declaración previa y del hecho va a enviarse a la API de Anthropic para que proponga el sobre cerrado. ¿Continuar?')) return;
  $('#estadoSobre').textContent = 'Pensando qué puede estar ocultando este testigo…';
  try {
    const r = await pedirJson(`Sos instructor de litigación penal oral. Leé este legajo y proponé el "sobre cerrado":
lo que el testigo realmente vivió y que no figura en su declaración, para usar como material de contraexamen.

CARÁTULA: ${$('#cCaratula').value}
CALIFICACIÓN: ${$('#cDelito').value}
HECHO: ${$('#cSintesis').value}
LEGAJO: ${$('#cHechos').value.slice(0,2000)}
DECLARACIÓN PREVIA DEL TESTIGO:
${$('#cPrevia').value.slice(0,3000)}

Buscá las debilidades que el propio texto ya insinúa: condiciones de percepción, tiempo de
observación, iluminación, distancia, contradicciones internas, vaguedades, fuentes de conocimiento
indirecto, interés en el resultado. Si el texto no las trae, inventá dos o tres compatibles con él.

Respondé SOLO este JSON:
{"verdad":"qué pasó realmente, 3 a 5 oraciones","puntos":["punto explotable 1","2","3"],"conducta":"cómo se comporta el testigo al ser interrogado"}`,
      { modelo: MODELO_FONDO, tope: 1200 });
    $('#cVerdad').value   = r.verdad || '';
    $('#cPuntos').value   = (r.puntos || []).join('\n');
    $('#cConducta').value = r.conducta || '';
    $('#estadoSobre').textContent = 'Propuesta lista. Revisala y corregí lo que no cierre con el caso.';
  } catch (e){ $('#estadoSobre').textContent = e.message; }
};

$('#guardarCausa').onclick = () => {
  const puntos = $('#cPuntos').value.split('\n').map(x => x.trim()).filter(Boolean);
  if (!puntos.length && !confirm('Sin puntos en el sobre cerrado, el testigo no va a tener nada que ocultar y el ejercicio pierde su parte más útil. ¿Guardar igual?')) return;
  const datos = {
    caratula: $('#cCaratula').value.trim() || 'Causa importada',
    delito:   $('#cDelito').value.trim(),
    sintesis: $('#cSintesis').value.trim(),
    hechos:   $('#cHechos').value.trim(),
    prueba:   (ING.datos && ING.datos.prueba) || [],
    testigo:  { nombre: $('#cTestigo').value.trim() || 'Testigo',
                calidad: 'testigo',
                genero: (ING.datos && ING.datos.testigo.genero) || 'm',
                perfil: $('#cPerfil').value.trim() },
    previa:   $('#cPrevia').value.trim()
  };
  const caso = construirCaso(datos, {
    verdad: $('#cVerdad').value.trim(),
    puntos,
    conducta: $('#cConducta').value.trim()
  }, ['directo','contra']);
  caso.fecha = Date.now();
  const mias = causasPropias();
  mias.unshift(caso);
  if (!guardado.escribir('causas', mias.slice(0, 40))){
    alert('No hubo lugar para guardar. Borrá alguna causa cargada.'); return;
  }
  alert('Caso guardado con ' + caso.banco.length + ' respuestas. Ya podés elegirlo al armar una audiencia.');
  pintarCausa();
  $('#txtCausa').value = '';
  ['#pasoDatos','#pasoEstructura','#pasoSobre'].forEach(id => $(id).classList.add('oculto'));
};

/* ═══════════════ DIAGNÓSTICO Y APRENDIZAJE ═══════════════ */
function pintarDiagnostico(){
  /* — cómo va el usuario — */
  const perfil = perfilDe(guardado.leer('historial', []));
  const cont = $('#miPerfil');
  if (perfil.vacio){
    cont.innerHTML = '<p class="ayuda">Todavía no cerraste ninguna audiencia. Cuando tengas dos o tres, ' +
      'acá vas a ver qué eje te cuesta, qué defecto repetís y qué conviene practicar.</p>';
  } else {
    const r = recomendar(perfil, MODULOS);
    const dif = dificultadDe(perfil);
    let s = '<div class="global"><b>' + perfil.global + '</b><span>promedio en ' + perfil.sesiones +
            ' audiencia' + (perfil.sesiones>1?'s':'') +
            (perfil.tendencia ? ' · ' + (perfil.tendencia>0?'+':'') + perfil.tendencia + ' respecto de las primeras' : '') +
            '</span></div>';
    s += '<div class="reco"><b>' + esc(MODULOS[r.modulo]?.nombre || r.modulo) + '</b><p>' + esc(r.razon) + '</p></div>';
    s += '<h3>Tus ejes, del más flojo al más firme</h3>';
    for (const e of perfil.ejes)
      s += '<div class="eje"><strong>' + esc(e.eje) + '</strong><span class="pt">' + e.prom +
           '</span><em><span class="medidor' + (e.prom < 5 ? ' alto' : '') + '"><i style="width:' +
           (e.prom*10) + '%"></i></span>' + e.veces + ' audiencias' +
           (e.delta ? ' · ' + (e.delta>0?'mejorando ':'cayendo ') + Math.abs(e.delta) : '') + '</em></div>';
    if (perfil.recurrentes.length){
      s += '<h3>Lo que más repetís</h3><ul class="limpia">' +
challengeRec(perfil) + '</ul>';
    }
    s += '<p class="ayuda" style="margin-top:16px">Exigencia actual de la sala: <b>' +
         Math.round(dif*100) + '%</b>. Sube a medida que mejorás: la contraparte objeta con más ' +
         'precisión y el testigo se pone más difícil.</p>';
    cont.innerHTML = s;
  }

  /* — cómo está la aplicación — */
  const d = diagnostico();
  $('#resultadoDiag').innerHTML =
    '<div class="resumenDiag ' + (d.ok ? 'bien' : 'mal') + '">' +
    (d.ok ? 'Las ' + d.total + ' verificaciones pasaron. La aplicación está entera.'
          : d.fallas.length + ' de ' + d.total + ' verificaciones fallaron.') + '</div>' +
    d.pruebas.map(x =>
      '<div class="chk ' + (x.ok?'si':'no') + '"><span class="marca">' + (x.ok?'✓':'!') + '</span>' +
      '<span><span class="area">' + esc(x.area) + '</span><br>' + esc(x.nombre) +
      (x.detalle ? '<span class="det">' + esc(x.detalle) + '</span>' : '') + '</span></div>').join('');
}

function challengeRec(perfil){
  return perfil.recurrentes.map(x =>
    '<li>' + esc(x.id) + ' — ' + x.n + ' ' + (x.n===1?'vez':'veces') + '</li>').join('');
}

$('#correrDiag').onclick = () => pintarDiagnostico();

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

function pintarEjemplos(){
  $('#listaEjemplos').innerHTML = EJEMPLOS.map(g =>
    '<div class="grupoEj"><h3>' + esc(g.grupo) + '</h3><p>' + esc(g.nota) + '</p></div>' +
    g.items.map(i =>
      '<div class="par"><h4>' + esc(i.tipo) + '</h4>' +
      '<p class="mal"><span class="rot">Así no</span>' + esc(i.mal) + '</p>' +
      '<p class="bien"><span class="rot">Así sí</span>' + esc(i.bien) + '</p>' +
      '<p class="porque">' + esc(i.porque) + '</p></div>').join('')
  ).join('');
}

/* ═══════════════ AJUSTES ═══════════════ */
function pintarVoces(){
  const listar = () => {
    VOZ.cargarVoces();
    const todas = (typeof speechSynthesis !== 'undefined' ? speechSynthesis.getVoices() : []) || [];
    const es = todas.filter(v => /^es/i.test(v.lang));
    const pool = es.length ? es : todas;
    for (const [id, key] of [['#vozM','vozM'], ['#vozF','vozF']]){
      const sel = $(id);
      if (!sel) return;
      const actual = guardado.leer(key, '');
      sel.innerHTML = '<option value="">Elegir automáticamente</option>' +
        pool.map(v => '<option value="'+esc(v.name)+'"'+(v.name===actual?' selected':'')+'>'+
                      esc(v.name)+' · '+esc(v.lang)+(v.localService===false?' · red':'')+'</option>').join('');
    }
    $('#estadoVoces').textContent = pool.length
      ? pool.length + ' voces disponibles en este dispositivo' + (es.length ? '' : ' (ninguna en español)')
      : 'Este navegador no expone voces.';
  };
  listar();
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.onvoiceschanged = listar;
  const r = guardado.leer('vozRate', 100);
  $('#vozRate').value = r;
  $('#vozRateVal').textContent = r + ' % de la velocidad normal';
}
$('#vozRate') && ($('#vozRate').oninput = e => {
  $('#vozRateVal').textContent = e.target.value + ' % de la velocidad normal';
});
function probar(g){
  const nombre = $(g === 'm' ? '#vozM' : '#vozF').value;
  guardado.escribir(g === 'm' ? 'vozM' : 'vozF', nombre);
  guardado.escribir('vozRate', parseInt($('#vozRate').value, 10) || 100);
  VOZ.encendida = true; VOZ.desbloquear(); VOZ.callar();
  VOZ.generos = { testigo:g, juez:g, contraparte:g };
  VOZ.decir('TESTIGO', g === 'm'
    ? 'Objeción, su señoría. La pregunta es sugestiva. El artículo 209 no las admite en el examen directo.'
    : 'Yo estaba atrás del mostrador del kiosco. Escuché gritos y miré hacia la mitad de cuadra.');
}
$('#probarM') && ($('#probarM').onclick = () => probar('m'));
$('#probarF') && ($('#probarF').onclick = () => probar('f'));
$('#guardarVoces') && ($('#guardarVoces').onclick = () => {
  guardado.escribir('vozM', $('#vozM').value);
  guardado.escribir('vozF', $('#vozF').value);
  guardado.escribir('vozRate', parseInt($('#vozRate').value, 10) || 100);
  $('#estadoVoces').textContent = 'Voces guardadas para este dispositivo.';
});

function pintarPractica(){
  const t = guardado.leer('tiempos', {});
  $('#ajTiempos').innerHTML = Object.entries(MODULOS).map(([k,m]) =>
    '<div class="rubro"><div><b>' + esc(m.nombre) + '</b><span>minutos</span></div>' +
    '<input type="number" min="1" max="60" data-tiempo="' + k + '" value="' + (Number(t[k]) || tiempoDelModulo(k)) + '"></div>').join('');
  const OPC = [
    ['avisarTiempo', true,  'El juez avisa cuando se acaba el tiempo'],
    ['replica',      true,  'Réplica y dúplica en el alegato de clausura'],
    ['grabarSiempre',false, 'Grabar todas las audiencias automáticamente']
  ];
  $('#ajOpciones').innerHTML = OPC.map(([k, def, n]) =>
    '<label class="dato"><input type="checkbox" data-opc="' + k + '"' + (guardado.leer(k, def) ? ' checked' : '') +
    '><span class="val" style="font-family:inherit;font-size:14px">' + esc(n) + '</span></label>').join('');
}
$('#guardarPractica').onclick = () => {
  const t = {};
  $$('[data-tiempo]').forEach(i => { if (+i.value > 0) t[i.dataset.tiempo] = +i.value; });
  guardado.escribir('tiempos', t);
  $$('[data-opc]').forEach(c => guardado.escribir(c.dataset.opc, c.checked));
  aviso('Ajustes de práctica guardados.');
};

function pintarAjustes(){
  pintarVoces();
  pintarPractica();
  const c = clave();
  $('#clave').value = c;
  $('#estadoClave').textContent = c
    ? 'Hay una clave guardada en este navegador. El testigo improvisa y la devolución la escribe el modelo.'
    : 'Sin clave: la app funciona en modo autónomo, con banco de respuestas y reglas. No tiene que ver con tu conexión a internet.';
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
$('#vozToggle').onclick = () => {
  if (!VOZ.soportada){ aviso('Este navegador no puede hablar.', true); return; }
  VOZ.encendida = !VOZ.encendida;
  if (!VOZ.encendida) VOZ.callar(); else VOZ.desbloquear();
  guardado.escribir('voz', VOZ.encendida);
  $('#vozToggle').setAttribute('aria-pressed', VOZ.encendida);
  aviso(VOZ.encendida ? 'La sala habla.' : 'Sala en silencio.');
};
$('#verLegajo').onclick = () => $('#legajo').classList.toggle('abierto');
$('#acta').addEventListener('click', () => $('#legajo').classList.remove('abierto'));

/* ═══════════════ ENTRADA POR VOZ ═══════════════
   Dos cosas distintas:
   · el micrófono dicta la pregunta y vos la enviás;
   · el modo oral cierra el circuito — escucha, envía sola cuando hacés
     silencio, la sala contesta en voz alta y el micrófono se reabre.  */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

const ORAL = {
  activo:false, rec:null, final:'', reloj:null, PAUSA:1700,

  encender(){
    if (!SR && !VOZ.soportada){
      aviso('Este navegador no maneja voz. Podés litigar escribiendo.', true); return;
    }
    VOZ.encendida = true;
    VOZ.desbloquear();                       // iOS exige el gesto inicial
    $('#vozToggle').setAttribute('aria-pressed','true');
    $('#modoOral').setAttribute('aria-pressed','true');
    if (!SR){
      /* Safari en iPhone suele no reconocer voz, pero sí hablar.
         Media capacidad es mejor que ninguna: la sala te contesta
         en voz alta y vos escribís o dictás con el teclado.        */
      this.activo = false;
      $('#pistaIzq').textContent = 'La sala te contesta en voz alta. Escribí tu pregunta.';
      aviso('Solo salida de audio en este navegador.');
      return;
    }
    this.activo = true;
    $('#pistaIzq').textContent = 'Modo oral: hablá y hacé una pausa para formular';
    this.escuchar();
  },

  apagar(){
    this.activo = false;
    this.soloAudio = false;
    VOZ.callar();
    clearTimeout(this.reloj);
    this.parar();
    $('#modoOral').setAttribute('aria-pressed','false');
    $('#modoOral').classList.remove('hablando');
    $('#pistaIzq').textContent = 'Enter para enviar · Shift+Enter corta renglón';
    aviso('');
  },

  parar(){ try { this.rec && this.rec.stop(); } catch {} this.rec = null; },

  escuchar(){
    if (!this.activo || this.rec) return;
    try {
      const r = new SR();
      r.lang = 'es-AR'; r.continuous = true; r.interimResults = true;
      this.final = '';
      r.onresult = ev => {
        let parcial = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++){
          const t = ev.results[i][0].transcript;
          if (ev.results[i].isFinal) this.final += t + ' ';
          else parcial += t;
        }
        ta.value = (this.final + parcial).trim(); altoAuto();
        clearTimeout(this.reloj);
        if (ta.value) this.reloj = setTimeout(() => this.cerrarPregunta(), this.PAUSA);
      };
      r.onerror = ev => {
        if (ev.error === 'not-allowed'){
          aviso('El navegador no dio permiso al micrófono.', true);
          this.apagar();
        } else if (ev.error !== 'no-speech' && ev.error !== 'aborted'){
          aviso('Se cortó el micrófono. Tocá el botón para retomar.', true);
        }
      };
      r.onend = () => { this.rec = null; if (this.activo && !VOZ.hablando && !ta.value) this.escuchar(); };
      r.start();
      this.rec = r;
      aviso('Escuchando…');
    } catch { aviso('No se pudo abrir el micrófono.', true); this.apagar(); }
  },

  async cerrarPregunta(){
    if (!this.activo) return;
    const txt = ta.value.trim();
    if (!txt) return;
    clearTimeout(this.reloj);
    this.parar();
    aviso('');
    $('#modoOral').classList.add('hablando');
    await formular();
    if (!this.activo) return;
    if (VOZ.hablando) VOZ.alVaciar = () => this.retomar();
    else this.retomar();
  },

  retomar(){
    $('#modoOral').classList.remove('hablando');
    if (this.activo) this.escuchar();
  }
};

$('#modoOral').onclick = () => (ORAL.activo || VOZ.encendida) ? ORAL.apagar() : ORAL.encender();

/* Micrófono: dicta. Y si la sala está hablando, la corta en seco,
   que es lo que uno hace cuando el testigo se va por las ramas.     */
(function(){
  const b = $('#microfono');
  if (!SR){ b.style.display = 'none'; return; }
  let rec = null, base = '';
  b.onclick = () => {
    if (VOZ.hablando){ VOZ.callar(); aviso('Cortaste a la sala.'); return; }
    if (ORAL.activo){ ORAL.apagar(); return; }
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

/* ═══════════════ PUENTE PARA LOS MÓDULOS NUEVOS ═══════════════
   Los complementos no parchean app.js: reciben lo que necesitan por acá. */
window.LEXAPP = {
  S, MODULOS, ROLES, otroDe, esAcusador, guardado, esc, mmss,
  ver, turno, marca, aviso, pensando, demora, hayIA, pedir, pedirJson,
  pintarSetup, levantar, causasPropias, VOZ,
  modulo(clave, def){ MODULOS[clave] = def.modulo; if (def.plugin) PLUGINS[clave] = def.plugin; },
  on(ev, fn){ (OYENTES[ev] = OYENTES[ev] || []).push(fn); },
  MODELO_TURNO, MODELO_FONDO
};

ver('portada');
})();
