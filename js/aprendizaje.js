/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Autocontrol y aprendizaje

   Dos cosas distintas que conviene no confundir:

   · AUTOCONTROL. La aplicación se revisa a sí misma cada vez que arranca:
     si un módulo no cargó, si falta un artículo de la ley, si un caso está
     incompleto, si el almacenamiento no responde. Existe porque ya pasó
     que medio sistema quedara muerto sin que nadie se enterara.

   · APRENDIZAJE. La aplicación aprende de TU historial: qué defecto
     repetís, qué eje no levanta, qué módulo evitás. Con eso ajusta la
     dificultad y te recomienda el próximo ejercicio.
     No reentrena ningún modelo: eso no ocurre en un teléfono.
   ══════════════════════════════════════════════════════════════════════════ */

/* ─────────────── 1. AUTOCONTROL ─────────────── */

function diagnostico(){
  const L = window.LEX || {};
  const pruebas = [];
  const p = (area, nombre, fn) => {
    try { const r = fn(); pruebas.push({ area, nombre, ok: r === true || r === undefined, detalle: r === true ? '' : (r || '') }); }
    catch (e){ pruebas.push({ area, nombre, ok:false, detalle: e.message }); }
  };

  /* módulos cargados */
  for (const [nom, clave] of [['Base de conocimiento','CPP'], ['Doctrina de previas','PREVIAS'],
                              ['Biblioteca de la ley','LEY_10797'], ['Casos','CASOS'],
                              ['Motor de análisis','analizar'], ['Director de audiencia','planificar'],
                              ['Ingesta de causas','detectarPersonales'], ['Tabla de falacias','FALACIAS'],
                              ['Ejemplos de estudio','EJEMPLOS']])
    p('Módulos', nom, () => L[clave] !== undefined || ('no cargó'));

  /* módulos complementarios: se enchufan después de la aplicación */
  const AP = window.LEXAPP || {};
  for (const [nom, fn] of [
      ['Grabación de audiencias',   () => typeof L.grabacionesGuardadas === 'function'],
      ['Objeciones propias',        () => !!(AP.MODULOS && AP.MODULOS.objetar)],
      ['Preparación del testigo',   () => !!(AP.MODULOS && AP.MODULOS.preparacion)],
      ['Competencia y docencia',    () => Array.isArray(L.RUBROS_JURADO)],
      ['Vigencia de la ley',        () => !!L.FICHA_LEY],
      ['Rol de querellante',        () => !!(AP.ROLES && AP.ROLES.querella)]])
    p('Complementos', nom, () => fn() || 'no cargó');

  /* integridad de la ley */
  p('Ley 10.797', 'Los 359 artículos están', () => {
    const n = (L.LEY_10797 || []).length;
    return n >= 359 ? true : `solo ${n}`;
  });
  p('Ley 10.797', 'Los artículos del juicio se leen', () => {
    for (const a of [209, 210, 211, 217]){
      const art = L.articulo && L.articulo(a);
      if (!art || art.t.length < 80) return `el art. ${a} no se recupera`;
    }
    return true;
  });
  p('Ley 10.797', 'Rechaza artículos inexistentes', () => {
    const v = L.verificarCitas && L.verificarCitas('Conforme el art. 987 corresponde.');
    return (v && !v.valido) ? true : 'no detecta la cita falsa';
  });

  /* integridad de los casos */
  p('Casos', 'Todos tienen los campos necesarios', () => {
    const malos = (L.CASOS || []).filter(c =>
      !c.id || !c.caratula || !c.modulos || !c.modulos.length || !c.sobre);
    return malos.length ? malos.map(c => c.id || '(sin id)').join(', ') : true;
  });
  p('Casos', 'Los testigos tienen banco y sobre', () => {
    const malos = (L.CASOS || []).filter(c => c.testigo && (!c.banco || !c.banco.length));
    return malos.length ? malos.map(c => c.id).join(', ') : true;
  });
  p('Casos', 'Hay casos en cada módulo', () => {
    const faltan = ['directo','contra','cautelar','apertura','clausura']
      .filter(m => !(L.CASOS || []).some(c => (c.modulos||[]).includes(m)));
    return faltan.length ? 'sin casos en: ' + faltan.join(', ') : true;
  });

  /* el motor responde */
  p('Motor', 'Detecta una pregunta sugestiva', () => {
    const a = L.analizar && L.analizar('Usted estaba en el lugar, ¿no es cierto?', 'directo', [[],[]]);
    return a && a.sugestiva ? true : 'no la detecta';
  });
  p('Motor', 'No marca sugestiva una interrogativa', () => {
    const a = L.analizar && L.analizar('¿Qué fue lo que vio esa noche?', 'directo', [[],[]]);
    return a && !a.sugestiva ? true : 'falso positivo';
  });
  p('Motor', 'El testigo contesta', () => {
    const c = (L.CASOS || []).find(x => x.banco && x.banco.length);
    if (!c) return 'sin casos con banco';
    const est = { desdeUltimaObjecion:9, dichos:new Set() };
    const r = L.responderOffline(c, L.analizar('¿A qué se dedica usted?', 'directo', []), est);
    return r && r.texto && !r.aclara ? true : 'no entiende una pregunta básica';
  });
  p('Motor', 'Bloquea la fuga del sobre cerrado', () => {
    const c = (L.CASOS || []).find(x => x.sobre && (x.sobre.puntos||[]).length);
    if (!c) return 'sin casos con sobre';
    const mem = L.nuevaMemoria();
    const v = L.verificarFuga(c.sobre.puntos[0], '¿Qué hora era?', c, mem);
    return v.limpio ? 'no bloquea' : true;
  });

  /* entorno */
  p('Dispositivo', 'Almacenamiento disponible', () => {
    try { localStorage.setItem('lex.__t','1'); localStorage.removeItem('lex.__t'); return true; }
    catch { return 'el navegador no deja guardar (¿modo incógnito?)'; }
  });
  p('Dispositivo', 'Funciona sin conexión', () =>
    ('serviceWorker' in navigator) ? true : 'este navegador no soporta uso sin conexión');
  p('Dispositivo', 'Puede hablar', () =>
    (typeof speechSynthesis !== 'undefined') ? true : 'sin síntesis de voz');
  p('Dispositivo', 'Puede escuchar', () =>
    (window.SpeechRecognition || window.webkitSpeechRecognition) ? true : 'sin reconocimiento de voz (normal en iPhone)');

  const fallas = pruebas.filter(x => !x.ok);
  return { pruebas, fallas, ok: fallas.length === 0, total: pruebas.length };
}

/* ─────────────── 2. APRENDIZAJE ─────────────── */

/* Construye el perfil del litigante a partir de su propio historial. */
function perfilDe(historial){
  /* Se ordena siempre de la más nueva a la más vieja: el historial puede
     llegar en cualquier orden y la tendencia depende de eso.          */
  const h = (historial || []).filter(x => x && typeof x.global === 'number')
              .slice().sort((a,b) => (b.fecha||0) - (a.fecha||0));
  if (!h.length) return { vacio:true, sesiones:0 };

  const porEje = new Map();
  for (const s of h) for (const e of (s.ejes || [])){
    if (typeof e.puntaje !== 'number') continue;
    if (!porEje.has(e.eje)) porEje.set(e.eje, []);
    porEje.get(e.eje).push({ v:e.puntaje, t:s.fecha });
  }

  const ejes = [...porEje.entries()].map(([eje, vals]) => {
    vals.sort((a,b) => a.t - b.t);
    const prom = vals.reduce((a,b) => a + b.v, 0) / vals.length;
    /* Tendencia: la mitad más nueva contra la mitad más vieja. Con
       tramos fijos de tres se comparaba el mismo tramo consigo mismo. */
    let delta = 0;
    if (vals.length >= 2){
      const corte = Math.floor(vals.length / 2);
      const vie = vals.slice(0, corte), nue = vals.slice(corte);
      const mVie = vie.reduce((a,b)=>a+b.v,0) / vie.length;
      const mNue = nue.reduce((a,b)=>a+b.v,0) / nue.length;
      delta = Math.round((mNue - mVie)*10)/10;
    }
    return { eje, prom: Math.round(prom*10)/10, veces: vals.length, delta };
  }).sort((a,b) => a.prom - b.prom);

  const defectos = new Map();
  for (const s of h) for (const [id, n] of Object.entries(s.defectos || {}))
    defectos.set(id, (defectos.get(id) || 0) + n);
  const recurrentes = [...defectos.entries()].sort((a,b) => b[1]-a[1]).slice(0, 4)
    .map(([id, n]) => ({ id, n }));

  const modulos = new Map();
  for (const s of h) modulos.set(s.modulo, (modulos.get(s.modulo) || 0) + 1);

  const ultimas = h.slice(0, 5).map(s => s.global);
  const global = Math.round((h.reduce((a,b)=>a+b.global,0) / h.length) * 10) / 10;

  return {
    vacio:false, sesiones:h.length, global,
    ejes, debil: ejes[0] || null, fuerte: ejes[ejes.length-1] || null,
    recurrentes,
    modulos: [...modulos.entries()].map(([m,n]) => ({ m, n })).sort((a,b)=>b.n-a.n),
    tendencia: ultimas.length > 2
      ? Math.round((ultimas[0] - ultimas[ultimas.length-1]) * 10) / 10 : 0
  };
}

/* Qué conviene practicar ahora, y por qué. */
function recomendar(perfil, modulos){
  if (!perfil || perfil.vacio)
    return { modulo:'contra', razon:'Empezá por un contraexamen: es donde se ve más rápido si la técnica está o no está.' };

  const hechos = new Set(perfil.modulos.map(x => x.m));
  const sinHacer = Object.keys(modulos || {}).filter(m => !hechos.has(m));
  if (sinHacer.length)
    return { modulo: sinHacer[0],
             razon: `Todavía no litigaste ninguna audiencia de este tipo, y se evalúa distinto que las demás.` };

  if (perfil.debil && perfil.debil.prom < 6){
    const m = { 'Uso de la declaración previa':'contra', 'Control del testigo':'contra',
                'Forma de la pregunta':'directo', 'Claridad para el testigo':'directo',
                'Petición concreta':'cautelar' }[perfil.debil.eje] || perfil.modulos[0].m;
    return { modulo:m,
             razon: `Tu eje más flojo es "${perfil.debil.eje}", con ${perfil.debil.prom} de promedio en ${perfil.debil.veces} audiencias. Esta es la audiencia donde más se entrena.` };
  }
  if (perfil.recurrentes.length)
    return { modulo: perfil.modulos[0].m,
             razon: `El defecto que más repetís es "${perfil.recurrentes[0].id}", ${perfil.recurrentes[0].n} veces. Practicá con eso en la cabeza.` };
  return { modulo:'cautelar', razon:'Vas bien parejo. Probá una cautelar, que exige fundar y no preguntar.' };
}

/* Dificultad adaptativa: 0 es blando, 1 es exigente. */
function dificultadDe(perfil){
  if (!perfil || perfil.vacio) return 0.35;
  const base = Math.max(0, Math.min(1, (perfil.global - 4) / 5));
  const exp = Math.min(1, perfil.sesiones / 12);
  return Math.round((base * 0.7 + exp * 0.3) * 100) / 100;
}

if (typeof window !== 'undefined')
  window.LEX = Object.assign(window.LEX || {}, { diagnostico, perfilDe, recomendar, dificultadDe });
