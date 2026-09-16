/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Motor sin conexión
   Analiza la forma de cada pregunta, decide objeciones y hace hablar al
   testigo sin necesidad de modelo. Todo lo de acá funciona offline.
   ══════════════════════════════════════════════════════════════════════════ */

/* ─────────────── utilidades de texto ─────────────── */
const sinTildes = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const VACIAS = new Set(('a al ante antes con contra de del desde durante en entre hacia hasta la las le les lo los mas me mi mis nos o para pero por que se sin sobre su sus te tras tu tus un una uno unos unas y ya el es era son fue ser esta estaba estan he ha han hay muy si no como cuando donde quien cual usted ud vos yo nos les eso esa ese esto esta').split(' '));
const fichas = s => sinTildes(s).replace(/[^a-z0-9ñ\s]/g,' ').split(/\s+/).filter(w => w.length>2 && !VACIAS.has(w));

const raiz = w => w.length > 6 ? w.slice(0,6) : w;
function solape(a, b){
  if (!a.length || !b.length) return 0;
  const sa = new Set(a.map(raiz));
  let n = 0;
  for (const w of b) if (sa.has(raiz(w))) n++;
  return n / Math.min(4, b.length);
}
function jaccard(a, b){
  const sa = new Set(a), sb = new Set(b);
  if (!sa.size || !sb.size) return 0;
  let inter = 0;
  for (const w of sa) if (sb.has(w)) inter++;
  return inter / (sa.size + sb.size - inter);
}

/* ─────────────── detectores de defectos ─────────────── */
/* Cada detector devuelve null o {id, nombre, falacia, motivo}.
   "falacia" enlaza con la tabla de conocimiento.js                     */

const INTERROGATIVOS = /^(¿)?\s*(que|quien|quienes|como|cuando|donde|adonde|cual|cuales|cuanto|cuanta|cuantos|cuantas|por que|para que|a que|de que|en que|con que|puede|podria|pudo|sabe|sabia|recuerda|recordaba|describa|cuente|cuentenos|explique|diga|digame|conoce|conocia|vio|escucho|habia|hay|tiene|tenia|existe)/;

const COLETILLA = /(no es (cierto|verdad|asi|tan asi)|verdad|cierto|correcto|no es asi|si o no|estoy en lo cierto)\s*[\?\.]?\s*$/;

function analizar(texto, modulo, previas){
  const crudo = String(texto||'').trim();
  const plano = sinTildes(crudo);
  const toks  = fichas(crudo);
  const palabras = crudo.split(/\s+/).filter(Boolean).length;
  const d = [];

  /* — sugestiva — */
  const tieneColetilla = COLETILLA.test(plano.replace(/[¿?]/g,'').trim());
  const arrancaInterrogativo = INTERROGATIVOS.test(plano.replace(/^[¿\s]+/,''));
  const sugestiva = tieneColetilla || (!arrancaInterrogativo && crudo.length > 12);

  /* — compuesta — */
  const dosSignos = (crudo.match(/\?/g)||[]).length > 1;
  const conector  = /\s(y|e)\s+(tambien|ademas|luego|despues|entonces|usted|ud|entonces)\b/.test(plano)
                 || /\?.+\?/.test(crudo);
  if (dosSignos || conector)
    d.push({id:'compuesta', nombre:'Pregunta compuesta', falacia:'pregunta-compleja',
            motivo:'contiene más de un hecho en una sola pregunta'});

  /* — por qué / pide explicación — */
  if (/^(¿)?\s*por\s?que\b/.test(plano) || /\b(explique|expliquenos|cuente|cuentenos|describa|relate|a que se debe|como es que)\b/.test(plano))
    d.push({id:'explicacion', nombre:'Pide explicación', falacia:null,
            motivo:'le devuelve el control al testigo y lo habilita a argumentar'});

  /* — adjetivaciones — */
  const adj = plano.match(/\b(cerca|lejos|rapido|rapida|lento|lenta|fuerte|despacio|mucho|mucha|poco|poca|grande|chico|chica|bastante|enseguida|alto|baja|nervioso|nerviosa|agresivo|agresiva|violento|violenta|tranquilo|tranquila|borracho|raro)\b/);
  if (adj)
    d.push({id:'vaguedad', nombre:'Adjetivación vaga', falacia:'equivoco',
            motivo:`el término "${adj[1]}" no tiene contenido preciso y le abre una puerta de escape`});

  /* — opinión o conclusión de testigo lego — */
  if (/\b(cree|creia|piensa|penso|opina|opinion|le parece|parecio|considera|supone|imagina|interpreta|entiende que|es logico|deduce)\b/.test(plano))
    d.push({id:'opinion', nombre:'Pide opinión o conclusión', falacia:'ad-verecundiam',
            motivo:'el testigo lego declara sobre lo que percibió, no sobre lo que concluye'});

  /* — extensión — */
  if (palabras > 28)
    d.push({id:'larga', nombre:'Pregunta demasiado larga', falacia:null,
            motivo:`${palabras} palabras: si anotada ocupa más de un renglón, hay que partirla`});

  /* — conclusión (la pregunta de más) — */
  if (/\b(entonces|o sea que|es decir que|quiere decir que|en conclusion|por lo tanto|de manera que|con lo cual)\b/.test(plano) && /\?/.test(crudo))
    d.push({id:'conclusion', nombre:'Pregunta de más', falacia:'ignoratio-elenchi',
            motivo:'le pide al testigo la conclusión, que es materia del alegato de clausura'});

  /* — asume hechos no acreditados — */
  if (/\b(cuando|luego de que|despues de que|una vez que|mientras|al momento en que)\s+(usted|ud|el|ella|lo|le|se)\b/.test(plano))
    d.push({id:'asume', nombre:'Asume un hecho no acreditado', falacia:'pregunta-compleja',
            motivo:'la subordinada da por cierto algo que todavía no se acreditó'});

  /* — intimidación — */
  if (/\b(miente|mentira|esta mintiendo|no me mienta|le advierto|sepa que|falso testimonio|bajo juramento|le conviene|diga la verdad de una vez)\b/.test(plano))
    d.push({id:'coaccion', nombre:'Coacción ilegítima', falacia:'ad-baculum',
            motivo:'contiene una advertencia dirigida a condicionar la respuesta'});

  /* — ataque personal — */
  if (/\b(delincuente|ladron|drogadicto|borracho de|vago|mentiroso|sinverguenza|no trabaja|tiene antecedentes)\b/.test(plano))
    d.push({id:'adhominem', nombre:'Ataque personal', falacia:'ad-hominem',
            motivo:'ataca a la persona sin mostrar inconsistencia ni pauta de conducta'});

  /* — repetitiva — */
  for (const p of previas){
    if (jaccard(toks, p) > 0.7){
      d.push({id:'repetitiva', nombre:'Preguntada y respondida', falacia:null,
              motivo:'ya se formuló esta misma pregunta'});
      break;
    }
  }

  /* — sugestiva en el directo — */
  const introductoria = previas.length < 2 || /\b(su nombre|se llama|a que se dedica|donde vive|es usted)\b/.test(plano);
  if (modulo === 'directo' && sugestiva && !introductoria)
    d.unshift({id:'sugestiva', nombre:'Pregunta sugestiva', falacia:null,
               motivo:'en el examen directo la pregunta no puede contener la respuesta (art. 203)'});

  /* — abierta en contraexamen: no es objetable, pero es un "NO" — */
  if (modulo === 'contra' && !sugestiva && !d.some(x => x.id==='explicacion') && palabras > 10)
    d.push({id:'abierta', nombre:'Pregunta abierta en contraexamen', falacia:null,
            motivo:'cede el control: el testigo puede explayarse hacia donde le convenga'});

  return {
    texto: crudo, toks, palabras,
    sugestiva, unPunto: sugestiva && palabras <= 16,
    abierta: !sugestiva || palabras > 24,
    defectos: d
  };
}

/* Qué defectos habilitan objeción de la contraparte, según el módulo */
const OBJETABLES = {
  directo: ['sugestiva','compuesta','vaguedad','opinion','larga','asume','coaccion','adhominem','repetitiva'],
  contra:  ['compuesta','vaguedad','opinion','larga','asume','coaccion','adhominem','repetitiva','conclusion']
};

function decidirObjecion(an, modulo, estado){
  const lista = OBJETABLES[modulo] || [];
  const grave = an.defectos.find(x => lista.includes(x.id));
  if (!grave) return null;
  // El art. 204 manda que las objeciones no alteren la continuidad:
  // como mucho una cada tres preguntas, salvo defectos manifiestos.
  const manifiesto = ['sugestiva','coaccion','adhominem','compuesta'].includes(grave.id);
  if (!manifiesto && estado.desdeUltimaObjecion < 3) return null;
  if (manifiesto && estado.desdeUltimaObjecion < 1) return null;
  return { defecto: grave, prospera: manifiesto || Math.random() < 0.7 };
}

/* ─────────────── testigo sin conexión ─────────────── */
const EVASIVAS = [
  'No entiendo qué me está preguntando.',
  'No sabría decirle.',
  '¿Me lo puede repetir de otra manera?',
  'Eso no lo sé.',
  'No me acuerdo de eso.'
];

function responderOffline(caso, an, estado){
  const banco = caso.banco || [];
  let mejor = null, punt = 0;
  for (const h of banco){
    const claves = fichas(h.claves);
    const s = solape(an.toks, claves);
    if (s > punt){ punt = s; mejor = h; }
  }
  const umbral = mejor && mejor.reservado ? 0.5 : 0.25;
  if (!mejor || punt < umbral){
    return { texto: EVASIVAS[Math.floor(Math.random()*EVASIVAS.length)], revelado: null };
  }
  let texto;
  if (an.unPunto && mejor.corto) texto = mejor.corto;
  else if (an.abierta && mejor.extra) texto = mejor.texto + ' ' + mejor.extra;
  else texto = mejor.texto;

  if (estado.dichos.has(mejor)) texto = 'Ya se lo dije: ' + texto.charAt(0).toLowerCase() + texto.slice(1);
  estado.dichos.add(mejor);
  return { texto, revelado: mejor.reservado ? mejor : null };
}

/* ─────────────── informe sin conexión ─────────────── */
function informeOffline(caso, modulo, registro, segundos){
  const preguntas = registro.filter(r => r.quien === 'LITIGANTE');
  const n = preguntas.length || 1;
  const cuenta = {};
  let objeciones = 0;
  for (const p of preguntas){
    for (const d of (p.analisis?.defectos || [])) cuenta[d.id] = (cuenta[d.id]||0) + 1;
    if (p.objetada) objeciones++;
  }
  const limpias = preguntas.filter(p => !(p.analisis?.defectos||[]).some(d =>
    (OBJETABLES[modulo]||[]).includes(d.id))).length;

  /* uso de la declaración previa: los tres pasos de Rúa */
  const txt = preguntas.map(p => sinTildes(p.texto)).join(' | ');
  const pasoFijar   = /\b(acaba de decir|usted dijo|nos dijo recien|declaro hoy|dijo en esta audiencia)\b/.test(txt);
  const pasoAcredita= /\b(declaro antes|presto declaracion|declaracion anterior|en la comisaria|en la fiscalia|recuerda haber declarado|mas fresco)\b/.test(txt);
  const pasoConfront= /\b(sin embargo|en aquella oportunidad|en esa declaracion|alli dijo|le leo|lea usted)\b/.test(txt);
  const pasos = [pasoFijar, pasoAcredita, pasoConfront].filter(Boolean).length;

  const palabras = preguntas.reduce((a,p)=>a+(p.analisis?.palabras||0),0) / n;
  const revelados = registro.filter(r => r.revelo).length;
  const totalReservados = (caso.banco||[]).filter(h => h.reservado).length;

  /* puntaje determinístico */
  const tasaLimpia = limpias / n;
  const ejes = [];
  ejes.push({ eje:'Forma de la pregunta', puntaje: Math.round(tasaLimpia*10*10)/10,
    comentario: `${limpias} de ${n} preguntas sin defecto objetable. ` +
      (cuenta.sugestiva ? `${cuenta.sugestiva} sugestivas en examen directo. ` : '') +
      (cuenta.compuesta ? `${cuenta.compuesta} compuestas. ` : '') +
      (cuenta.vaguedad ? `${cuenta.vaguedad} con adjetivación vaga. ` : '') || 'Sin defectos detectados.' });

  const r1 = x => Math.round(x*10)/10;
  const ctrl = modulo === 'contra'
    ? Math.max(0, 10 - ((cuenta.abierta||0)*1.5 + (cuenta.explicacion||0)*2 + (cuenta.conclusion||0)*2))
    : Math.max(0, 10 - ((cuenta.larga||0) + (cuenta.opinion||0)));
  ejes.push({ eje:'Control del testigo', puntaje: Math.round(ctrl*10)/10,
    comentario: modulo === 'contra'
      ? `${cuenta.abierta||0} preguntas abiertas y ${cuenta.explicacion||0} que piden explicación. Cada una le devuelve el control.`
      : `Promedio de ${palabras.toFixed(0)} palabras por pregunta.` });

  ejes.push({ eje:'Uso de la declaración previa', puntaje: r1(pasos*3.33),
    comentario: pasos === 0 ? 'No se advierte trabajo con la declaración previa.'
      : `Se detectan ${pasos} de los 3 pasos: ${pasoFijar?'fijar el punto':'—'} / ${pasoAcredita?'acreditar la anterior':'—'} / ${pasoConfront?'confrontar':'—'}.` });

  if (totalReservados){
    ejes.push({ eje:'Explotación del sobre cerrado', puntaje: r1((revelados/totalReservados)*10),
      comentario: `Sacaste a la luz ${revelados} de ${totalReservados} puntos reservados del testigo.` });
  }

  ejes.push({ eje:'Economía y ritmo', puntaje: r1(Math.max(0, Math.min(10, 10 - Math.abs(palabras-12)/2))),
    comentario: `${n} preguntas en ${Math.floor(segundos/60)} minutos, con un promedio de ${palabras.toFixed(0)} palabras.` });

  const global = Math.round((ejes.reduce((a,e)=>a+e.puntaje,0)/ejes.length)*10)/10;

  const correcciones = [];
  for (const p of preguntas){
    const d = (p.analisis?.defectos||[])[0];
    if (!d || correcciones.length >= 5) continue;
    correcciones.push({ tuya:p.texto, problema:`${d.nombre}: ${d.motivo}`, mejor: sugerir(d, p.texto) });
  }

  const perdidos = (caso.banco||[]).filter(h => h.reservado && !registro.some(r => r.revelo === h))
    .map(h => `Quedó sin explotar: "${h.texto}". Se sacaba con una sugestiva de un solo punto sobre ${h.claves.split(' ').slice(0,3).join(', ')}.`);

  return { global, ejes, correcciones, perdido: perdidos, objeciones,
    veredicto: armarVeredicto(modulo, n, tasaLimpia, pasos, revelados, totalReservados) };
}

function sugerir(d, texto){
  switch (d.id){
    case 'sugestiva':  return 'Reformulá en abierta: "¿Qué pasó en ese momento?" o "¿Qué fue lo que vio?".';
    case 'compuesta':  return 'Partila en dos: un hecho por pregunta.';
    case 'explicacion':return 'No le pidas que explique. Afirmá el hecho: "Usted estaba de espaldas, ¿no es cierto?".';
    case 'vaguedad':   return 'Reemplazá el adjetivo por una medida: en metros, en minutos, en cantidad.';
    case 'opinion':    return 'Preguntá por lo percibido, no por lo concluido: qué vio, qué escuchó, qué hizo.';
    case 'larga':      return 'Cortala. Una pregunta, un hecho, una línea.';
    case 'conclusion': return 'Sacá la conclusión de la pregunta y guardala para la clausura.';
    case 'asume':      return 'Acreditá primero el presupuesto y recién después preguntá por el hecho.';
    case 'coaccion':   return 'Sacá la advertencia. La sugestiva ya presiona lo suficiente.';
    case 'adhominem':  return 'Mostralo con la inconsistencia de su testimonio, no con una calificación.';
    case 'abierta':    return 'Convertila en sugestiva de un solo punto, afirmativa y corta.';
    case 'repetitiva': return 'Ya la hiciste. Avanzá a la línea siguiente.';
    default:           return 'Revisá la formulación.';
  }
}

function armarVeredicto(modulo, n, tasa, pasos, rev, tot){
  const p = [];
  p.push(`Formulaste ${n} preguntas.`);
  p.push(tasa > 0.8 ? 'La forma fue mayormente correcta.'
       : tasa > 0.5 ? 'La mitad de tus preguntas tuvo algún defecto de forma.'
       : 'La forma de las preguntas fue el problema principal de esta audiencia.');
  if (modulo === 'contra'){
    p.push(pasos === 3 ? 'Trabajaste la declaración previa con los tres pasos completos.'
         : pasos > 0 ? 'Empezaste a trabajar la declaración previa pero salteaste pasos, y eso le deja al testigo una ventana de escape.'
         : 'No usaste la declaración previa, que era el material central de este contraexamen.');
  }
  if (tot) p.push(rev === 0 ? 'No lograste sacar ninguno de los puntos que el testigo reservaba.'
                : rev < tot ? `Sacaste ${rev} de ${tot} puntos reservados.`
                : 'Sacaste todo lo que el testigo tenía guardado.');
  return p.join(' ');
}

if (typeof window !== 'undefined') {
  window.LEX = Object.assign(window.LEX || {}, {
    analizar, decidirObjecion, responderOffline, informeOffline, fichas, sinTildes
  });
}
