/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Motor sin conexión
   Analiza la forma de cada pregunta, decide objeciones, hace hablar al
   testigo y evalúa la audiencia. Todo funciona sin conexión.

   El testigo entiende tres capas de preguntas:
     · el banco propio del caso (lo que vio, el hecho);
     · el banco universal (quién es, qué hizo antes, qué hizo después,
       con quién habló, si tiene interés en el resultado);
     · y cuando no entiende, pide aclaración en lugar de callarse.
   ══════════════════════════════════════════════════════════════════════════ */

/* ─────────────── utilidades de texto ─────────────── */
const sinTildes = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const VACIAS = new Set(('a al ante antes con contra de del desde durante en entre hacia hasta la las le les lo los mas me mi mis nos o para pero por que se sin sobre su sus te tras tu tus un una uno unos unas y ya el es era son fue ser esta estaba estan he ha han hay muy si no como cuando donde quien cual usted ud vos yo nos les eso esa ese esto esta senor senora doctor diga digame').split(' '));
const fichas = s => sinTildes(s).replace(/[^a-z0-9ñ\s]/g,' ').split(/\s+/).filter(w => w.length>2 && !VACIAS.has(w));
const raiz = w => w.length > 6 ? w.slice(0,6) : w;

/* Sinónimos: el testigo no puede depender de que uses su misma palabra */
const SINONIMOS = {
  ver:'observ mir avist divis presenci', mirar:'ver observ', observar:'ver mir',
  escuchar:'oir sent', oir:'escuch sent', decir:'coment manifest refer expres cont',
  contar:'decir relat coment narr', lugar:'sitio zona lado punto ubicac',
  hora:'moment tiempo horari cuando', distancia:'metros lejos cerca alejad',
  luz:'ilumin alumbr claridad visib oscur', cara:'rostro facci fison semblant',
  arma:'pistol revolv fierr cuchill puñal navaj', golpe:'piña trompad puñet impact',
  auto:'vehicul coche rodad camionet', moto:'motocicl rodad ciclomot',
  declarar:'declarac testimoni manifest deposic', comisaria:'policia dependenc seccion sumari',
  fiscalia:'fiscal ministeri', conocer:'conoc trato relacion vinculo amistad',
  trabajo:'trabaj empleo labor ocupac oficio changa', domicilio:'casa vivienda vive barrio direccion',
  beber:'tomar alcohol cerveza vino borrach copas fernet',
  antes:'previo anterior prevam', despues:'luego posterior seguid',
  recordar:'acordar memoria recuerd rememor'
};
function expandir(toks){
  const out = new Set(toks.map(raiz));
  for (const t of toks){
    const s = SINONIMOS[t] || SINONIMOS[Object.keys(SINONIMOS).find(k => raiz(k) === raiz(t))];
    if (s) for (const w of s.split(' ')) out.add(raiz(w));
  }
  return [...out];
}

/* Peso inverso a la frecuencia: "noche" aparece en muchas entradas y
   distingue poco; "venia" aparece en una sola y distingue mucho.     */
function pesos(banco){
  const frec = new Map();
  for (const h of banco) for (const c of new Set(fichas(h.claves).map(raiz)))
    frec.set(c, (frec.get(c)||0) + 1);
  const n = banco.length || 1;
  const w = new Map();
  for (const [c, f] of frec) w.set(c, Math.log(1 + n / f));
  return w;
}
function solape(pregunta, claves, w){
  if (!pregunta.length || !claves.length) return 0;
  const sp = new Set(pregunta);
  let suma = 0, total = 0, n = 0;
  for (const c of claves.map(raiz)){
    const peso = w ? (w.get(c) || 1) : 1;
    total += peso;
    if (sp.has(c)){ suma += peso; n++; }
  }
  if (!total) return 0;
  const cobertura = n / Math.min(3, claves.length);          // cuánto del tema cubre
  const precision = suma / total;                            // cuán informativo fue
  return cobertura * 0.65 + precision * 0.35;
}
function jaccard(a, b){
  const sa = new Set(a), sb = new Set(b);
  if (!sa.size || !sb.size) return 0;
  let inter = 0;
  for (const w of sa) if (sb.has(w)) inter++;
  return inter / (sa.size + sb.size - inter);
}

/* ═══════════════ 1. ANÁLISIS DE LA PREGUNTA ═══════════════ */

const INTERROGATIVOS = /^(¿)?\s*(que|quien|quienes|como|cuando|donde|adonde|cual|cuales|cuanto|cuanta|cuantos|cuantas|por que|para que|a que|a quien|a cual|de que|de donde|de quien|en que|con que|con quien|desde cuando|hasta cuando|hasta donde|puede|podria|pudo|sabe|sabia|supo|recuerda|recordaba|describa|cuente|cuentenos|explique|diga|digame|conoce|conocia|vio|escucho|oyo|habia|hay|tiene|tenia|tuvo|existe|estaba|estuvo|era|fue|hizo|dijo|habla|hablo|conto|llamo|denuncio|volvio|salio|entro|usa|uso|toma|tomo|trabaja|vive|declaro|leyo|repaso|noto|observo|percibio|advirtio)/;
const COLETILLA = /(no es (cierto|verdad|asi|tan asi)|verdad|cierto|correcto|no es asi|es asi|es correcto|si o no|estoy en lo cierto|me equivoco|o no|de acuerdo|si)\s*[\?\.]?\s*$/;

function analizar(texto, modulo, previas){
  const crudo = String(texto||'').trim();
  const plano = sinTildes(crudo);
  const toks  = fichas(crudo);
  const palabras = crudo.split(/\s+/).filter(Boolean).length;
  const d = [];

  /* En castellano la pregunta sugestiva se reconoce por el orden: sujeto
     antes del verbo ("Usted estaba ahí…"), o por la coletilla final.
     Una interrogativa verbal ("¿Estaba acompañado?") es cerrada pero NO
     sugestiva: no contiene la respuesta.                              */
  const limpio = plano.replace(/^[¿\s]+/,'').replace(/^(y|e|bien|bueno|ahora|entonces|ademas)\s+/,'');

  /* Una pregunta es sugestiva cuando afirma el hecho y solo pide
     confirmación. Señales: coletilla final, u orden sujeto-verbo sin
     ninguna palabra interrogativa. NO alcanza con que falte el signo
     de pregunta: quien dicta no los escribe.                        */
  const tieneColetilla  = COLETILLA.test(plano.replace(/[¿?]/g,'').trim());
  const hayInterrogativo = /\b(que|qué|quien|quienes|como|cuando|donde|adonde|cual|cuales|cuanto|cuanta|cuantos|cuantas|por que|para que)\b/.test(plano);
  const ordenAfirmativo = /^(usted|ud\.?|vos|el|ella|ellos|ellas|su|sus|los|las|esos|esas|este|esta|estos|estas|ese|esa|don|doña|dona|el imputado|la victima|el testigo|el acusado|mi defendido)\b/.test(limpio);
  const primeras = limpio.split(/\s+/).slice(0, 4).join(' ');
  const verboInterrogativo = INTERROGATIVOS.test(primeras) ||
    /\b(puede|podria|pudo|sabe|sabia|supo|recuerda|conoce|conocia|vio|escucho|oyo|estaba|estuvo|habia|tuvo|hizo|dijo|noto|observo|advirtio|logro|alcanzo)\b/.test(primeras);

  const sugestiva = tieneColetilla
    || (ordenAfirmativo && !hayInterrogativo)
    || (!hayInterrogativo && !verboInterrogativo && crudo.length > 12);

  const dosSignos = (crudo.match(/\?/g)||[]).length > 1;
  const conector  = /\s(y|e)\s+(tambien|ademas|luego|despues|entonces|usted|ud)\b/.test(plano) || /\?.+\?/.test(crudo);
  if (dosSignos || conector)
    d.push({id:'compuesta', nombre:'Pregunta compuesta', falacia:'pregunta-compleja',
            motivo:'contiene más de un hecho en una sola pregunta'});

  if (/^(¿)?\s*por\s?que\b/.test(plano) || /\b(explique|expliquenos|cuente|cuentenos|describa|relate|a que se debe|como es que)\b/.test(plano))
    d.push({id:'explicacion', nombre:'Pide explicación', falacia:null,
            motivo:'le devuelve el control al testigo y lo habilita a argumentar'});

  const adj = plano.match(/\b(cerca|lejos|rapido|rapida|lento|lenta|fuerte|despacio|mucho|mucha|poco|poca|grande|chico|chica|bastante|enseguida|alto|baja|nervioso|nerviosa|agresivo|agresiva|violento|violenta|tranquilo|tranquila|borracho|raro)\b/);
  if (adj)
    d.push({id:'vaguedad', nombre:'Adjetivación vaga', falacia:'equivoco', termino:adj[1],
            motivo:`el término "${adj[1]}" no tiene contenido preciso y le abre una puerta de escape`});

  if (/\b(cree|creia|piensa|penso|opina|opinion|le parece|parecio|considera|supone|imagina|interpreta|entiende que|es logico|deduce)\b/.test(plano))
    d.push({id:'opinion', nombre:'Pide opinión o conclusión', falacia:'ad-verecundiam',
            motivo:'el testigo lego declara sobre lo que percibió, no sobre lo que concluye'});

  if (palabras > 28)
    d.push({id:'larga', nombre:'Pregunta demasiado larga', falacia:null,
            motivo:`${palabras} palabras: si anotada ocupa más de un renglón, hay que partirla`});

  if (/\b(entonces|o sea que|es decir que|quiere decir que|en conclusion|por lo tanto|de manera que|con lo cual)\b/.test(plano) && /\?/.test(crudo))
    d.push({id:'conclusion', nombre:'Pregunta de más', falacia:'ignoratio-elenchi',
            motivo:'le pide al testigo la conclusión, que es materia del alegato de clausura'});

  if (/\b(cuando|luego de que|despues de que|una vez que|mientras|al momento en que)\s+(usted|ud|el|ella|lo|le|se)\b/.test(plano))
    d.push({id:'asume', nombre:'Asume un hecho no acreditado', falacia:'pregunta-compleja',
            motivo:'la subordinada da por cierto algo que todavía no se acreditó'});

  if (/\b(miente|mentira|esta mintiendo|no me mienta|le advierto|sepa que|falso testimonio|bajo juramento|le conviene|diga la verdad de una vez)\b/.test(plano))
    d.push({id:'coaccion', nombre:'Coacción ilegítima', falacia:'ad-baculum',
            motivo:'contiene una advertencia dirigida a condicionar la respuesta'});

  if (/\b(delincuente|ladron|drogadicto|borracho de|vago|mentiroso|sinverguenza|no trabaja|tiene antecedentes)\b/.test(plano))
    d.push({id:'adhominem', nombre:'Ataque personal', falacia:'ad-hominem',
            motivo:'ataca a la persona sin mostrar inconsistencia ni pauta de conducta'});

  for (const p of previas){
    if (jaccard(toks, p) > 0.7){
      d.push({id:'repetitiva', nombre:'Preguntada y respondida', falacia:null,
              motivo:'ya se formuló esta misma pregunta'});
      break;
    }
  }

  const introductoria = previas.length < 2 || /\b(su nombre|se llama|a que se dedica|donde vive|es usted|cuantos años)\b/.test(plano);
  if (modulo === 'directo' && sugestiva && !introductoria)
    d.unshift({id:'sugestiva', nombre:'Pregunta sugestiva', falacia:null,
               motivo:'en el examen directo la pregunta no puede contener la respuesta (art. 209)'});

  if (modulo === 'contra' && !sugestiva && !d.some(x => x.id==='explicacion') && palabras > 10)
    d.push({id:'abierta', nombre:'Pregunta abierta en contraexamen', falacia:null,
            motivo:'cede el control: el testigo puede explayarse hacia donde le convenga'});

  return {
    texto: crudo, toks, expandidos: expandir(toks), palabras,
    sugestiva, unPunto: sugestiva && palabras <= 16,
    abierta: !sugestiva || palabras > 24,
    defectos: d
  };
}

const OBJETABLES = {
  directo: ['sugestiva','compuesta','vaguedad','opinion','larga','asume','coaccion','adhominem','repetitiva'],
  contra:  ['compuesta','vaguedad','opinion','larga','asume','coaccion','adhominem','repetitiva','conclusion']
};

function decidirObjecion(an, modulo, estado){
  const lista = OBJETABLES[modulo] || [];
  const grave = an.defectos.find(x => lista.includes(x.id));
  if (!grave) return null;
  const manifiesto = ['sugestiva','coaccion','adhominem','compuesta'].includes(grave.id);
  if (!manifiesto && estado.desdeUltimaObjecion < 3) return null;
  if (manifiesto && estado.desdeUltimaObjecion < 1) return null;
  return { defecto: grave, prospera: manifiesto || Math.random() < 0.7 };
}

/* ═══════════════ 2. EL TESTIGO ═══════════════ */

/* Banco universal: lo que se le puede preguntar a cualquier testigo, antes,
   durante y después del hecho. Se arma con los datos del caso.          */
function bancoUniversal(caso){
  const t = caso.testigo || {};
  const c = caso.contexto || {};
  const edad = (String(t.perfil||'').match(/(\d{2})\s*años/) || [])[1];
  const g = [];
  const A = (claves, texto, corto, extra) => g.push({claves, texto, corto, extra, generico:true});

  /* — acreditación — */
  A('nombre llama apellido identifique', `Me llamo ${t.nombre || 'como consta en el acta'}.`, `${t.nombre || 'Sí'}.`);
  A('edad años cuantos tiene', edad ? `Tengo ${edad} años.` : 'Prefiero no precisarlo, pero soy mayor.', edad ? `${edad}.` : 'Sí.');
  A('trabaja trabajo ocupacion dedica oficio empleo vive de changa',
    c.ocupacion || 'Trabajo de lo que salga, no tengo algo fijo.', c.ocupacion ? 'Sí.' : 'No tengo algo fijo.');
  A('vive domicilio casa barrio direccion reside',
    c.domicilio || 'Vivo en el mismo barrio donde pasó todo.', 'Sí.');
  A('estudios estudio secundario primario escuela instruccion',
    c.estudios || 'Terminé la secundaria.', 'Sí.');
  A('familia casado soltero pareja hijos convive',
    c.familia || 'Estoy con mi familia, tengo mis cosas armadas.', 'Sí.');

  /* — vínculo con las partes y con el resultado — */
  A('conoce imputado acusado relacion trato vinculo lo conocia de antes',
    c.relacionImputado || 'De vista, del barrio. Trato no tenía.', c.relacionImputado ? 'Sí.' : 'De vista nomás.');
  A('enemistad problema pelea rencilla bronca conflicto previo',
    c.conflicto || 'Problemas no tuve nunca con él.', 'No.');
  A('interes resultado gana espera juicio reclamo abogado indemnizacion plata',
    c.interes || 'Yo no espero nada de esto. Vine porque me citaron.', 'No espero nada.', 'Aunque la verdad es que ojalá esto sirva para algo.');

  /* — condiciones de percepción — */
  A('vista anteojos lentes ve bien problema visual',
    c.vista || 'Veo bien, no uso anteojos.', 'Veo bien.');
  A('oido escucha bien sordera audifono',
    c.oido || 'Escucho perfecto.', 'Escucho bien.');
  A('medicacion remedio tratamiento medico pastillas',
    c.medicacion || 'No tomo nada, estoy sano.', 'No.');
  A('alcohol tomado bebida cerveza vino borracho copas fernet drogas',
    c.consumo || 'Esa vez no había tomado nada.', c.consumo ? 'Sí.' : 'No había tomado.');

  /* — hechos anteriores — */
  A('antes previo hacia venia actividad ese dia mas temprano jornada',
    c.antes || 'Venía de hacer mis cosas, un día normal hasta ahí.', 'Sí.', 'Fue un día como cualquier otro hasta que pasó lo que pasó.');
  A('acompañado solo con quien estaba alguien mas',
    c.compania || 'Estaba solo en ese momento.', c.compania ? 'Sí.' : 'Solo.');
  A('sabia esperaba anticipo previo aviso presentia',
    'No, no me esperaba nada de lo que pasó.', 'No.');

  /* — hechos posteriores — */
  A('despues luego posterior que hizo se fue adonde fue siguio',
    c.despues || 'Después me quedé un rato y me fui a mi casa.', 'Sí.');
  A('conto aviso hablo familia amigos comento a quien le dijo',
    c.conto || 'Se lo conté a mi familia cuando llegué.', 'Sí.');
  A('policia llamo 911 aviso denuncio cuando',
    c.policia || 'Se dio aviso a la policía esa misma vez.', 'Sí.');
  A('volvio lugar regreso paso de nuevo por ahi',
    'Por ahí paso seguido, es mi zona.', 'Sí.');
  A('consecuencias secuelas quedo salud tratamiento despues como siguio',
    c.consecuencias || 'Quedé mal un tiempo, después se me fue pasando.', 'Sí.');

  /* — la declaración previa y la preparación del testimonio — */
  A('declaro declaracion previa antes presto testimonio comisaria fiscalia',
    'Sí, ya declaré antes de esto.', 'Sí, declaré.');
  A('leyo releyo repaso declaracion antes de venir refresco',
    'La leí antes de venir, sí.', 'Sí, la leí.', 'Me la dieron para que la repasara.');
  A('hablo fiscal defensor abogado preparo reunion antes de la audiencia',
    c.preparacion || 'Hablamos un rato antes, me explicaron cómo era esto.', 'Sí, hablamos.', true);
  A('hablo otros testigos comentaron entre ustedes version pusieron de acuerdo',
    'Comentamos algo entre nosotros, es inevitable.', 'Algo comentamos.', null);
  A('tiempo transcurrido cuanto hace meses año desde el hecho',
    'Ya pasó un tiempo largo de esto.', 'Bastante.');
  A('recuerda memoria acuerda bien seguro olvido',
    'Algunas cosas las tengo claras, otras se me borronearon con el tiempo.', 'Me acuerdo.', 'Pero lo importante no me lo olvido.');

  return g;
}

/* Cuando no entiende: pide aclaración en vez de quedarse mudo */
const ACLARACIONES = [
  '¿Perdón, me la puede repetir?',
  'Disculpe, no le entendí bien la pregunta.',
  '¿Cómo era? Me perdí.',
  'No sé si entiendo qué me está preguntando.',
  '¿Se refiere a ese día o en general?',
  'Discúlpeme, ¿me lo puede preguntar de otra manera?'
];
const TITUBEOS = ['Eh… ', 'Mire… ', 'Y… ', 'A ver… ', 'Y bueno… '];
const REMATES  = [' No sé si me explico.', ' Eso es lo que me acuerdo.', ' Así fue.', ''];

function humanizar(texto, opts){
  const o = opts || {};
  let t = texto;
  if (o.titubea && t.length > 38 && Math.random() < 0.5)
    t = TITUBEOS[Math.floor(Math.random()*TITUBEOS.length)] + t.charAt(0).toLowerCase() + t.slice(1);
  if (o.remata && Math.random() < 0.35) t = t + REMATES[Math.floor(Math.random()*REMATES.length)];
  return t;
}

function responderOffline(caso, an, estado){
  if (!estado.universal){
    estado.universal = bancoUniversal(caso);
    estado.banco = (caso.banco || []).concat(estado.universal);
    estado.pesos = pesos(estado.banco);
  }
  const banco = estado.banco;

  let mejor = null, punt = 0, abierto = null, puntAbierto = 0;
  for (const h of banco){
    const s = solape(an.expandidos, fichas(h.claves), estado.pesos);
    if (s > punt){ punt = s; mejor = h; }
    if (!h.reservado && s > puntAbierto){ puntAbierto = s; abierto = h; }
  }

  /* Si lo que mejor encaja es un dato que el testigo se guarda pero la
     pregunta no fue lo bastante precisa, no se queda mudo: contesta lo
     que sí puede contestar.                                          */
  if (mejor && mejor.reservado && punt < 0.48 && abierto && puntAbierto >= 0.22){
    mejor = abierto; punt = puntAbierto;
  }

  const umbral = mejor && mejor.reservado ? 0.48 : 0.22;

  /* Zona gris: entendió a medias. Pide aclaración, como una persona. */
  if (mejor && punt >= 0.12 && punt < umbral){
    estado.confusiones = (estado.confusiones || 0) + 1;
    return { texto: ACLARACIONES[Math.floor(Math.random()*ACLARACIONES.length)], revelado:null, aclara:true };
  }
  if (!mejor || punt < 0.12){
    estado.confusiones = (estado.confusiones || 0) + 1;
    return { texto: humanizar('No sabría decirle. Eso no lo tengo presente.', {titubea:true}), revelado:null, aclara:true };
  }

  let texto;
  if (an.unPunto && mejor.corto) texto = mejor.corto;
  else if (an.abierta && mejor.extra && typeof mejor.extra === 'string') texto = mejor.texto + ' ' + mejor.extra;
  else texto = mejor.texto;

  if (estado.dichos.has(mejor)){
    texto = 'Ya se lo dije: ' + texto.charAt(0).toLowerCase() + texto.slice(1);
  } else {
    texto = humanizar(texto, { titubea: !!mejor.reservado || punt < 0.4, remata: an.abierta });
  }
  estado.dichos.add(mejor);
  return { texto, revelado: mejor.reservado ? mejor : null, generico: !!mejor.generico };
}

/* ═══════════════ 3. REFORMULACIÓN CONCRETA ═══════════════
   No alcanza con decir "estuvo mal": hay que mostrar cómo se preguntaba.
   Estas transformaciones trabajan sobre la propia frase del litigante.  */

const MEDIDAS = {
  cerca:'¿A cuántos metros estaba?', lejos:'¿A cuántos metros estaba?',
  rapido:'¿Cuánto tiempo duró?', rapida:'¿Cuánto tiempo duró?',
  lento:'¿Cuánto tiempo duró?', lenta:'¿Cuánto tiempo duró?',
  despacio:'¿Cuánto tiempo duró?', enseguida:'¿Cuántos minutos pasaron?',
  fuerte:'¿Qué fue exactamente lo que escuchó?', mucho:'¿Cuántos, exactamente?',
  mucha:'¿Cuánta, exactamente?', poco:'¿Cuántos, exactamente?', poca:'¿Cuánta, exactamente?',
  bastante:'¿Cuánto, exactamente?', grande:'¿De qué tamaño, comparado con qué?',
  chico:'¿De qué tamaño, comparado con qué?', chica:'¿De qué tamaño, comparado con qué?',
  alto:'¿Qué altura tenía, aproximadamente?', baja:'¿Qué altura tenía, aproximadamente?',
  nervioso:'¿Qué hacía con las manos mientras hablaba?',
  nerviosa:'¿Qué hacía con las manos mientras hablaba?',
  agresivo:'¿Qué fue lo que hizo concretamente?', agresiva:'¿Qué fue lo que hizo concretamente?',
  violento:'¿Qué fue lo que hizo concretamente?', violenta:'¿Qué fue lo que hizo concretamente?',
  tranquilo:'¿Qué estaba haciendo en ese momento?', tranquila:'¿Qué estaba haciendo en ese momento?',
  borracho:'¿Qué observó en su manera de caminar y de hablar?',
  raro:'¿Qué fue lo que observó concretamente?'
};

const ABIERTAS = [
  [/\b(vio|observo|miro|vi)\b/, '¿Qué fue lo que vio en ese momento?'],
  [/\b(escucho|oyo|sintio)\b/, '¿Qué fue lo que escuchó?'],
  [/\b(dijo|manifesto|comento|expreso)\b/, '¿Qué fue exactamente lo que le dijo?'],
  [/\b(estaba|encontraba|ubicado)\b/, '¿Dónde estaba usted en ese momento?'],
  [/\b(hizo|realizo|actuo)\b/, '¿Qué fue lo que hizo?'],
  [/\b(paso|ocurrio|sucedio)\b/, '¿Qué fue lo que pasó?'],
  [/\b(hora|momento|tiempo)\b/, '¿A qué hora ocurrió eso?'],
  [/\b(luz|oscur|ilumin)\b/, '¿Cómo era la iluminación del lugar?']
];

/* Deja una frase lista para mostrarse como pregunta bien formada */
function pulir(t){
  let x = String(t||'').replace(/[¿?]+/g,' ').replace(/\s+/g,' ').trim();
  x = x.replace(/^(y|e|ademas|además|tambien|también|luego|despues|después|entonces)\s+/i,'');
  x = x.replace(/,?\s*(no es cierto|no es verdad|no es así|no es asi|es así|es asi|verdad|cierto|correcto|no)\s*$/i,'');
  x = x.replace(/[,;.\s]+$/,'').trim();
  return x ? x.charAt(0).toUpperCase() + x.slice(1) : '';
}

function limpiarColetilla(t){
  return t.replace(/[¿?]/g,'')
          .replace(/,?\s*(no es cierto|no es verdad|no es así|verdad|cierto|correcto|no es asi|sí o no|si o no)\s*$/i,'')
          .trim().replace(/^usted\s+/i,'').replace(/\s+$/,'');
}

function reformular(d, texto, modulo){
  const plano = sinTildes(texto);
  /* En el examen directo las sugestivas están prohibidas (art. 209), así
     que jamás se puede sugerir una como corrección. En el contraexamen
     son la herramienta principal.                                      */
  const directo = modulo === 'directo';
  const cerrar = f => directo ? abierta(f) : (f + ', ¿no es cierto?');
  const abierta = f => {
    for (const [re, sug] of ABIERTAS) if (re.test(sinTildes(f))) return sug;
    return '¿Qué fue lo que pasó en ese momento?';
  };

  if (d.id === 'compuesta'){
    let partes = texto.split(/\?\s*/).filter(x => x.trim().length > 4);
    if (partes.length < 2){
      const sinAc = sinTildes(texto);
      const m = sinAc.search(/\s+y\s+(?:tambien|ademas|luego|despues|entonces|usted|ud)\b/);
      if (m > 0){
        const corte = sinAc.slice(m).match(/\s+y\s+/)[0].length + m;
        partes = [texto.slice(0, m), texto.slice(corte)];
      }
    }
    const a = pulir(partes[0] || ''), b = pulir(partes.slice(1).join(' '));
    if (a && b)
      return 'Partila en dos: «' + cerrar(a) + '» y recién después «' + cerrar(b) + '».';
    return 'Partila en dos preguntas: un hecho por pregunta.';
  }

  if (d.id === 'explicacion'){
    const m = texto.match(/por\s?qu[eé]\s+(.+?)[\?\.]?$/i);
    if (m) return directo
      ? 'En el directo no podés afirmarlo vos. Preguntá abierto y acotado: «' + abierta(m[1]) + '».'
      : 'No le pidas que explique. Afirmá el hecho y que lo conceda: «' + pulir(m[1]) + ', ¿no es cierto?».';
    return 'Sacá el pedido de explicación y afirmá el hecho: «Usted [hecho], ¿no es cierto?».';
  }

  if (d.id === 'vaguedad' && d.termino && MEDIDAS[d.termino])
    return 'Cambiá "' + d.termino + '" por una medida: «' + MEDIDAS[d.termino] + '».';

  if (d.id === 'sugestiva'){
    const nucleo = pulir(limpiarColetilla(texto));
    return 'En el directo la pregunta no puede traer la respuesta puesta. En vez de «' + nucleo +
           '», preguntá «' + abierta(texto) + '» y que lo diga él.';
  }

  if (d.id === 'opinion'){
    const m = plano.match(/\b(cree|creia|piensa|penso|opina|le parece|parecio|considera|supone|imagina)\b/);
    for (const [re, sug] of ABIERTAS) if (re.test(plano)) return 'Preguntá por lo percibido, no por lo concluido: «' + sug + '».';
    return 'Preguntá por lo percibido, no por lo concluido: «¿Qué fue lo que vio?» o «¿Qué fue lo que hizo?».';
  }

  if (d.id === 'conclusion'){
    const nucleo = texto.replace(/\b(entonces|o sea que|es decir que|quiere decir que|en conclusi[oó]n|por lo tanto|de manera que|con lo cual)\b/gi,'').replace(/^[\s,¿]+/,'').trim();
    return 'Sacá la conclusión y guardala para la clausura. Quedate con el hecho: «' +
           cerrar(pulir(nucleo)) + '».';
  }

  if (d.id === 'asume'){
    const m = texto.match(/\b(cuando|luego de que|despu[eé]s de que|una vez que|mientras)\s+(.+?)[,\?]/i);
    if (m) return 'Primero acreditá el presupuesto: «' + cerrar(pulir(m[2])) +
                  '». Recién cuando lo tengas, preguntá por el resto.';
    return 'Acreditá primero el hecho que la subordinada da por cierto, y después preguntá.';
  }

  if (d.id === 'larga'){
    const corte = texto.split(/[,;]/)[0];
    return 'Cortala en la primera coma: «' + cerrar(pulir(corte)) + '». El resto va en preguntas siguientes.';
  }

  if (d.id === 'abierta'){
    const nucleo = limpiarColetilla(texto);
    for (const [re] of ABIERTAS) if (re.test(plano))
      return 'Convertila en sugestiva de un solo punto: «' + pulir(nucleo) + ', ¿no es cierto?».';
    return 'Convertila en sugestiva de un solo punto, afirmativa y corta, que solo admita sí o no.';
  }

  if (d.id === 'coaccion')
    return 'Sacá la advertencia: «' + cerrar(pulir(limpiarColetilla(texto))) + '».';

  if (d.id === 'adhominem')
    return 'No lo califiques: mostralo con su propia declaración previa. Fijá el punto, acreditá la declaración anterior y recién ahí confrontá.';

  if (d.id === 'repetitiva')
    return 'Ya la hiciste y ya te contestó. Avanzá a la línea siguiente.';

  return 'Revisá la formulación.';
}

/* ═══════════════ 4. INFORME SIN CONEXIÓN ═══════════════ */

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

  const txt = preguntas.map(p => sinTildes(p.texto)).join(' | ');
  const pasoFijar    = /\b(acaba de decir|usted dijo|nos dijo recien|declaro hoy|dijo en esta audiencia|acaba de declarar)\b/.test(txt);
  const pasoAcredita = /\b(declaro antes|presto declaracion|declaracion anterior|en la comisaria|en la fiscalia|recuerda haber declarado|mas fresco)\b/.test(txt);
  const pasoConfront = /\b(sin embargo|en aquella oportunidad|en esa declaracion|alli dijo|le leo|lea usted|le exhibo)\b/.test(txt);
  const pasos = [pasoFijar, pasoAcredita, pasoConfront].filter(Boolean).length;

  const palabras = preguntas.reduce((a,p)=>a+(p.analisis?.palabras||0),0) / n;
  const revelados = registro.filter(r => r.revelo).length;
  const totalReservados = (caso.banco||[]).filter(h => h.reservado).length;
  const confusiones = registro.filter(r => r.aclara).length;
  const r1 = x => Math.round(x*10)/10;

  const ejes = [];
  ejes.push({ eje:'Forma de la pregunta', puntaje: r1((limpias/n)*10),
    comentario: `${limpias} de ${n} preguntas sin defecto objetable. ` +
      (cuenta.sugestiva ? `${cuenta.sugestiva} sugestivas en examen directo. ` : '') +
      (cuenta.compuesta ? `${cuenta.compuesta} compuestas. ` : '') +
      (cuenta.vaguedad  ? `${cuenta.vaguedad} con adjetivación vaga. ` : '') });

  const ctrl = modulo === 'contra'
    ? Math.max(0, 10 - ((cuenta.abierta||0)*1.5 + (cuenta.explicacion||0)*2 + (cuenta.conclusion||0)*2))
    : Math.max(0, 10 - ((cuenta.larga||0) + (cuenta.opinion||0)));
  ejes.push({ eje:'Control del testigo', puntaje: r1(ctrl),
    comentario: modulo === 'contra'
      ? `${cuenta.abierta||0} preguntas abiertas y ${cuenta.explicacion||0} que piden explicación. Cada una le devuelve el control.`
      : `Promedio de ${palabras.toFixed(0)} palabras por pregunta.` });

  ejes.push({ eje:'Uso de la declaración previa', puntaje: r1(pasos*3.33),
    comentario: pasos === 0 ? 'No se advierte trabajo con la declaración previa.'
      : `Se detectan ${pasos} de los 3 pasos: ${pasoFijar?'fijar el punto':'—'} / ${pasoAcredita?'acreditar la anterior':'—'} / ${pasoConfront?'confrontar':'—'}.` });

  ejes.push({ eje:'Claridad para el testigo', puntaje: r1(Math.max(0, 10 - (confusiones/n)*12)),
    comentario: confusiones === 0
      ? 'El testigo entendió todas tus preguntas a la primera.'
      : `El testigo pidió aclaración o no entendió en ${confusiones} de ${n} preguntas. Una pregunta que hay que repetir ya perdió efecto ante el tribunal.` });

  if (totalReservados)
    ejes.push({ eje:'Explotación del sobre cerrado', puntaje: r1((revelados/totalReservados)*10),
      comentario: `Sacaste a la luz ${revelados} de ${totalReservados} puntos reservados del testigo.` });

  ejes.push({ eje:'Economía y ritmo', puntaje: r1(Math.max(0, Math.min(10, 10 - Math.abs(palabras-12)/2))),
    comentario: `${n} preguntas en ${Math.floor(segundos/60)} minutos, con un promedio de ${palabras.toFixed(0)} palabras.` });

  const global = r1(ejes.reduce((a,e)=>a+e.puntaje,0)/ejes.length);

  /* Correcciones: una por cada pregunta defectuosa, con la reformulación */
  const correcciones = [];
  for (const p of preguntas){
    const d = (p.analisis?.defectos||[])[0];
    if (!d || correcciones.length >= 8) continue;
    correcciones.push({
      tuya: p.texto,
      problema: d.nombre + ': ' + d.motivo + (d.falacia ? ' Falacia subyacente: ' + d.falacia.replace(/-/g,' ') + '.' : ''),
      mejor: reformular(d, p.texto, modulo)
    });
  }

  const aciertos = [];
  if (pasos === 3) aciertos.push('Completaste los tres pasos de la impugnación con declaración previa, sin saltear etapas.');
  if (limpias/n > 0.75) aciertos.push(`${limpias} de tus ${n} preguntas estuvieron bien formuladas y no dieron lugar a objeción.`);
  if (revelados) aciertos.push(`Lograste que el testigo soltara ${revelados} punto${revelados>1?'s':''} que tenía reservado${revelados>1?'s':''}.`);
  if (modulo === 'contra' && !cuenta.explicacion) aciertos.push('No le pediste explicaciones en ningún momento: mantuviste el control del contraexamen.');

  const perdidos = (caso.banco||[]).filter(h => h.reservado && !registro.some(r => r.revelo === h))
    .map(h => `Quedó sin explotar: "${h.texto}". Se sacaba con una sugestiva de un solo punto sobre ${h.claves.split(' ').slice(0,3).join(', ')}.`);

  return { global, ejes, correcciones, aciertos, perdido: perdidos, objeciones,
    veredicto: armarVeredicto(modulo, n, limpias/n, pasos, revelados, totalReservados, confusiones) };
}

function armarVeredicto(modulo, n, tasa, pasos, rev, tot, conf){
  const p = [];
  p.push(`Formulaste ${n} preguntas.`);
  p.push(tasa > 0.8 ? 'La forma fue mayormente correcta.'
       : tasa > 0.5 ? 'La mitad de tus preguntas tuvo algún defecto de forma.'
       : 'La forma de las preguntas fue el problema principal de esta audiencia.');
  if (conf > n*0.3) p.push('Varias preguntas no se entendieron a la primera, y eso en una audiencia real se paga: el testigo gana tiempo y el tribunal pierde el hilo.');
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
    analizar, decidirObjecion, responderOffline, informeOffline, reformular,
    bancoUniversal, fichas, sinTildes
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   5. AUDIENCIA DE MEDIDAS DE COERCIÓN (art. 130)
   Acá no se interroga: se funda. Evaluar la forma de las preguntas no
   tiene sentido. Lo que se mide es si el planteo cumple la checklist que
   la propia ley impone a quien pide o resiste la medida.
   ══════════════════════════════════════════════════════════════════════════ */

const EJES_CAUTELAR = [
  { id:'conviccion', eje:'Elementos de convicción (art. 127.1)', peso:1,
    re:/\b(elementos de conviccion|acta de|flagrancia|testimonio|declaracion de|pericia|informe|secuestr|filmacion|camara|acredit|surge de|constanci|prueba que)/,
    falta:'No acreditaste los elementos de convicción sobre la existencia del hecho y la participación. Es el primer requisito del art. 127 y sin eso no se discute ningún peligro.',
    bien:'Acreditaste el mérito sustantivo con elementos concretos del legajo.' },

  { id:'arraigo', eje:'Arraigo (art. 128.1)', peso:1,
    re:/\b(arraigo|domicilio|residencia|vive en|asiento de la familia|trabajo|empleo|ocupacion|hijos a cargo|familia|facilidades para|abandonar el pais|ocultarse|socioambiental)/,
    falta:'No trabajaste el arraigo, que es la primera pauta del art. 128: domicilio, residencia habitual, asiento de la familia, negocios o trabajo, y facilidades para irse u ocultarse.',
    bien:'Discutiste el arraigo con las pautas concretas del art. 128.1.' },

  { id:'conducta', eje:'Comportamiento procesal (art. 128.2)', peso:1,
    re:/\b(rebeldia|rebelde|no compareci|comparecio|se present|citacion|oculto|identidad falsa|domicilio falso|antecedent|condena anterior|condicional|incumpli|se fugo|se dio a la fuga|entrego voluntariamente)/,
    falta:'No dijiste nada sobre el comportamiento durante el procedimiento, que es la segunda pauta del art. 128: si hubo rebeldía, ocultamiento de identidad o domicilio falso.',
    bien:'Usaste el comportamiento procesal previo como pauta del peligro de fuga.' },

  { id:'entorpecimiento', eje:'Entorpecimiento y riesgo de la víctima (art. 129)', peso:1,
    re:/\b(entorpec|destru|modific|oculta|suprim|falsific|prueba|influ|testigos|perito|reticen|induc|intimidator|amenaz|contra la victima|su familia|violatorio|viole las medidas|incumplio la cautelar|acercamiento)/,
    falta:'No planteaste el art. 129. Ojo que la Ley 10.797 lo amplió: ya no es solo entorpecimiento, el inciso 4 incorpora los actos intimidatorios contra la víctima o su familia y la violación de las cautelares impuestas.',
    bien:'Trabajaste el art. 129, incluido el riesgo de la víctima.' },

  { id:'alternativa', eje:'Proporcionalidad y medida alternativa (art. 116)', peso:1.3,
    re:/\b(art(iculo)? 116|medida menos gravosa|alternativ|presentacion periodica|caucion|dispositivo|tobillera|rastreo|arresto domiciliario|prohibicion de|abandono del domicilio|no salir|ultimo recurso|proporcional|menos lesiva|combinad)/,
    falta:'No discutiste las medidas del art. 116. Su último párrafo es imperativo: si el peligro puede evitarse razonablemente con una medida menos gravosa, el juez DEBE imponer esa. Litigar una preventiva sin descartar las diez alternativas anteriores es dejar el planteo a mitad de camino.',
    bien:'Discutiste el catálogo del art. 116 y la proporcionalidad de la medida pedida.' },

  { id:'limitaciones', eje:'Limitaciones del art. 124', peso:0.8,
    re:/\b(art(iculo)? 124|condena condicional|condicional|ejecucion morigerada|24\.?660|setenta an?os|70 an?os|embarazo|lactancia|accion privada|libertad de expresion)/,
    falta:'No mencionaste el art. 124, que bloquea la prisión preventiva de plano en varios supuestos, empezando por el más frecuente: que pudiera aplicarse condena condicional.',
    bien:'Invocaste las limitaciones del art. 124.' },

  { id:'plazo', eje:'Plazo de la medida (arts. 127.3 y 130)', peso:1,
    re:/\b(plazo|meses|dias de|duracion|por el termino|tres meses|renovacion|vencimiento|hasta el)/,
    falta:'No fijaste plazo. El art. 127 inc. 3 obliga a indicar el plazo de duración necesario, y el art. 130 exige que el fiscal especifique el de la medida y el de la investigación. Sin plazo, el pedido está incompleto.',
    bien:'Precisaste el plazo, como exigen los arts. 127.3 y 130.' },

  { id:'peticion', eje:'Petición concreta', peso:1,
    re:/\b(solicito|pido|requiero|peticiono|solicitamos|vengo a solicitar|corresponde disponer|se disponga|se imponga|se rechace|se ordene|cese|libertad)/,
    falta:'No cerraste con una petición concreta. El tribunal necesita saber exactamente qué le estás pidiendo y por cuánto tiempo.',
    bien:'Cerraste con una petición concreta.' },

  { id:'contradiccion', eje:'Respuesta a la contraparte', peso:0.8,
    re:/\b(la (fiscalia|defensa|contraparte)|lo que dice|sostiene que|se invoca|alega|no es cierto que|contrariamente|sin embargo|frente a ello|el planteo de)/,
    falta:'No te hiciste cargo de lo que argumentó la contraparte. La audiencia del art. 130 es contradictoria: lo que no se refuta, queda en pie.',
    bien:'Te hiciste cargo de los argumentos de la contraparte.' }
];

/* Vicios típicos: fundar el peligro en la gravedad del delito o en fórmulas
   sin datos del caso. Son los dos motivos más frecuentes de revocación.  */
const VICIOS_CAUTELAR = [
  { id:'gravedad', re:/\b(gravedad del (hecho|delito)|pena en expectativa|escala penal|delito grave|alarma social|repercusion (social|publica)|inseguridad)/,
    aviso:'Fundaste el peligro procesal en la gravedad del delito o en la alarma social. La gravedad por sí sola no es un peligro procesal: los arts. 128 y 129 exigen pautas concretas referidas a esta persona. Es el vicio que más revocaciones genera.' },
  { id:'formula', re:/\b(podria (eludir|entorpecer)|existe riesgo de que|no puede descartarse|es de presumir|presumible|razonablemente podria)/,
    aviso:'Usaste fórmulas presuntivas ("podría", "no puede descartarse"). El art. 129 pide vehementes indicios que justifiquen la grave sospecha, no posibilidades abstractas.' },
  { id:'oficio', re:/\b(de oficio|el tribunal deberia disponer por si)/,
    aviso:'El art. 115 prohíbe imponer medidas de oficio: siempre hace falta pedido expreso de parte.' }
];

function analizarCautelar(texto){
  const p = sinTildes(texto);
  /* Ordenado por fuerza de la coincidencia, no por el orden de la lista:
     un párrafo sobre arraigo menciona "acredita" al pasar, pero nombra
     domicilio, familia, trabajo e informe socioambiental. Gana el tema
     que más señales tiene, que es del que realmente se está hablando. */
  const puntajes = EJES_CAUTELAR.map(e => {
    const g = new RegExp(e.re.source, 'g');
    const m = p.match(g);
    return { id:e.id, n: m ? new Set(m.map(x=>x.trim())).size : 0 };
  }).filter(x => x.n > 0).sort((a,b) => b.n - a.n);

  return {
    texto, palabras: texto.split(/\s+/).filter(Boolean).length,
    cubre: puntajes.map(x => x.id),
    fuerza: puntajes,
    vicios: VICIOS_CAUTELAR.filter(v => v.re.test(p)).map(v => v.id)
  };
}

function informeCautelar(caso, rol, registro, segundos){
  const mios = registro.filter(r => r.quien === 'LITIGANTE');
  const todo = sinTildes(mios.map(r => r.texto).join(' \n '));
  const n = mios.length || 1;
  const r1 = x => Math.round(x*10)/10;

  const ejes = [], faltantes = [], logrados = [];
  let suma = 0, pesos = 0;
  for (const e of EJES_CAUTELAR){
    const ok = e.re.test(todo);
    const pt = ok ? 9 : 2;
    ejes.push({ eje:e.eje, puntaje:pt, comentario: ok ? e.bien : e.falta });
    suma += pt * e.peso; pesos += e.peso;
    (ok ? logrados : faltantes).push(e);
  }

  const vicios = VICIOS_CAUTELAR.filter(v => v.re.test(todo));
  let global = r1(suma / pesos - vicios.length * 0.8);
  global = Math.max(1, Math.min(10, global));

  const correcciones = vicios.map(v => {
    const frase = mios.map(m=>m.texto).find(t => v.re.test(sinTildes(t))) || '';
    return { tuya: frase.slice(0, 220), problema: 'Vicio de fundamentación', mejor: v.aviso };
  });
  for (const e of faltantes.slice(0, 4))
    correcciones.push({ tuya:'(no lo planteaste)', problema:e.eje, mejor:e.falta });

  const perdido = [];
  for (const p of (caso.sobre?.puntos || []))
    if (!todo.includes(sinTildes(p).slice(0, 28))) perdido.push(p);

  const partes = [];
  partes.push(`Fundaste en ${n} intervención${n>1?'es':''}, durante ${Math.floor(segundos/60)} minutos.`);
  partes.push(`Cubriste ${logrados.length} de los ${EJES_CAUTELAR.length} puntos que la ley exige en esta audiencia.`);
  if (vicios.length) partes.push('Aparecen vicios de fundamentación que en una revisión ante el Tribunal de Impugnación se pagan caro.');
  partes.push(rol === 'fiscal'
    ? 'Como fiscal, la carga es tuya: tenés que acreditar el mérito, justificar el peligro con pautas concretas y fijar el plazo.'
    : 'Como defensa, tu mejor terreno no es negar el hecho sino atacar el peligro procesal y ofrecer la medida menos gravosa que lo neutralice.');

  return { global, ejes, correcciones, perdido,
    aciertos: logrados.slice(0,3).map(e => e.bien),
    veredicto: partes.join(' ') };
}

/* ══════════════════════════════════════════════════════════════════════════
   6. ALEGATOS
   Se evalúa estructura, uso de la prueba, petición y solidez lógica.
   ══════════════════════════════════════════════════════════════════════════ */

const EJES_APERTURA = [
  { id:'teoria', eje:'Teoría del caso', peso:1.3,
    re:/\b(este (es un )?caso (se trata|es)|lo que paso|la prueba va a demostrar|vamos a demostrar|van a escuchar|va a quedar acreditad|esta causa trata)/,
    falta:'No enunciaste una teoría del caso. La apertura tiene que empezar con una frase que el tribunal pueda repetir: de qué se trata este juicio, en tus términos.',
    bien:'Enunciaste una teoría del caso identificable.' },
  { id:'promesa', eje:'Anuncio de la prueba', peso:1.2,
    re:/\b(va a declarar|van a declarar|escucharan|van a escuchar|se va a incorporar|el perito|la prueba|los testigos|se va a acreditar|vamos a probar)/,
    falta:'La apertura es una promesa: hay que anunciar qué prueba se va a producir y qué va a demostrar cada una. Sin eso, el tribunal no tiene con qué ordenar lo que va a escuchar.',
    bien:'Anunciaste la prueba y lo que cada elemento va a demostrar.' },
  { id:'protagonistas', eje:'Presentación de los protagonistas', peso:0.9,
    re:/\b(mi (defendido|asistido)|el imputado|la victima|el senor|la senora|se llama|de \d{2} an?os|trabajaba|vivia)/,
    falta:'No presentaste a las personas. Los jueces no conocen el caso: necesitan saber quién es quién antes de escuchar a nadie.',
    bien:'Presentaste a los protagonistas del caso.' },
  { id:'debilidad', eje:'Anticipación de las debilidades', peso:1,
    re:/\b(es cierto que|va a escuchar tambien|no vamos a negar|reconocemos que|si bien|es verdad que|la defensa va a decir|la fiscalia va a decir)/,
    falta:'No adelantaste ninguna debilidad. Si la contraria la va a exhibir igual, conviene que salga primero de tu boca: el golpe se amortigua y ganás credibilidad.',
    bien:'Adelantaste las debilidades de tu caso, que es lo que hace creíble una apertura.' }
];

const EJES_CLAUSURA = [
  { id:'promesa', eje:'Retoma de la promesa', peso:1.1,
    re:/\b(como (dijimos|anticipamos|prometimos)|al comenzar|en la apertura|dijimos que|tal como adelant)/,
    falta:'No retomaste lo que prometiste en la apertura. Cerrar el círculo es lo que convierte la clausura en el final de una historia y no en un resumen.',
    bien:'Retomaste la promesa de la apertura y mostraste que se cumplió.' },
  { id:'prueba', eje:'Proposiciones fácticas con su prueba', peso:1.4,
    re:/\b(declaro que|dijo que|el testigo|el perito|surge de|conforme el acta|la pericia|quedo acreditado con|lo dicho por|segun el informe)/,
    falta:'No anclaste tus afirmaciones en prueba concreta. Cada proposición fáctica tiene que decir de dónde sale: qué testigo, qué pericia, qué acta.',
    bien:'Anclaste tus afirmaciones en prueba producida e identificada.' },
  { id:'sana', eje:'Valoración integral (arts. 19 y 218)', peso:1.1,
    re:/\b(sana critica|valoracion (conjunta|integral|armonica)|en conjunto|se corrobora|coincide con|converge|maximas de la experiencia|reglas de la logica)/,
    falta:'Enumeraste prueba sin articularla. Los arts. 19 y 218 mandan formar convicción de la valoración conjunta y armónica: hay que mostrar cómo se sostienen unas pruebas con otras.',
    bien:'Mostraste cómo se articula la prueba entre sí, y no solo la enumeraste.' },
  { id:'refuta', eje:'Refutación de la contraria', peso:1.1,
    re:/\b(la (fiscalia|defensa|querella) (dijo|sostiene|pretende|va a decir)|se dijo aca que|el argumento de|frente a ello|no es cierto que|se pretende hacer creer)/,
    falta:'No refutaste la posición contraria. Lo que no se contesta, el tribunal lo puede dar por no discutido.',
    bien:'Te hiciste cargo de los argumentos de la contraria.' },
  { id:'adversa', eje:'Tratamiento de la prueba adversa', peso:1,
    re:/\b(es cierto que|si bien|reconocemos|ese testigo|la contradiccion|declaro distinto|no recordaba|se contradijo|resulta inconsistente)/,
    falta:'No trataste la prueba que juega en contra. Ignorarla no la hace desaparecer: la deja intacta para que la use el otro.',
    bien:'Trataste la prueba adversa en lugar de ignorarla.' },
  { id:'calificacion', eje:'Calificación legal', peso:1,
    re:/\b(art(iculo)?\.? ?\d+|codigo penal|tipifica|calific|encuadra|subsun|autor|participe|tentativa|agravad|atenuad|legitima defensa)/,
    falta:'No fundaste la calificación legal. Hay que mostrar cómo los hechos acreditados se subsumen en el tipo, elemento por elemento.',
    bien:'Fundaste la calificación legal sobre los hechos acreditados.' },
  { id:'peticion', eje:'Petición concreta (art. 217)', peso:1.3,
    re:/\b(solicito|solicitamos|pido|pedimos|requiero|corresponde (condenar|absolver)|absolucion|condena de|pena de|an?os de prision|se absuelva|se condene)/,
    falta:'No cerraste con una petición concreta. El art. 217 lo exige expresamente: al finalizar, las partes expresan sus peticiones de un modo concreto. Y en la práctica, un alegato sin pedido concreto deja al tribunal decidiendo solo.',
    bien:'Cerraste con la petición concreta que exige el art. 217.' }
];

/* Falacias de Copi detectables en el texto de un alegato */
const FALACIAS_ALEGATO = [
  { id:'ad-ignorantiam', re:/\b(nadie (dijo|declaro|probo) lo contrario|no se probo que no|no hay prueba de que no|no fue desmentido)/,
    aviso:'Argumento por la ignorancia: que no se haya probado lo contrario no acredita el hecho. Ojo con la asimetría: el art. 13 pone la carga en la acusación, así que la falta de prueba de cargo sí favorece al imputado, pero no alcanza para dar por cierto un hecho positivo propio.' },
  { id:'causa-falsa', re:/\b(despues de (eso|ello) |acto seguido.*por lo tanto|primero.*luego.*entonces fue|si ocurrio antes)/,
    aviso:'Causa falsa: estás tomando por causa lo que solo es antecedente temporal. La secuencia no acredita la causalidad.' },
  { id:'composicion', re:/\b(cada (uno de los )?indicio.*(debil|aislad)|por separado no (prueban|acreditan))/,
    aviso:'Falacia de composición o división: que cada indicio sea equívoco por separado no vuelve equívoco al conjunto, ni al revés. El art. 19 manda valoración conjunta y armónica.' },
  { id:'ad-misericordiam', re:/\b(tiene (hijos|familia) (peque|a cargo|menores)|situacion de pobreza|padre de familia|da pena|sufrimiento de mi asistido)/,
    aviso:'Apelación a la piedad: esas circunstancias son pertinentes en el juicio sobre la pena del art. 203, no para acreditar o descartar el hecho.' },
  { id:'ad-populum', re:/\b(todos sabemos|es de publico conocimiento|la sociedad reclama|todo el barrio sabe|alarma social)/,
    aviso:'Apelación a la multitud: el sentir general no es prueba. Además el art. 194 excluye la prueba que procura generar prejuicio.' },
  { id:'ad-hominem', re:/\b(es un (delincuente|mentiroso|vago)|tiene antecedentes|no se puede creer a alguien asi)/,
    aviso:'Ad hominem: impugnar al testigo es legítimo si mostrás su pauta de conducta o la inconsistencia de su testimonio; no lo es descalificarlo sin más, ni concluir que todo lo que dijo es falso.' },
  { id:'peticion-principio', re:/\b(es evidente que|obviamente|no cabe duda|resulta indudable|claramente quedo probado)/,
    aviso:'Petición de principio: afirmar con énfasis no es demostrar. Reemplazá el adjetivo por la prueba que lo sostiene.' }
];

function informeAlegato(caso, modulo, rol, registro, segundos, minutos){
  const texto = registro.filter(r => r.quien === 'LITIGANTE').map(r => r.texto).join(' \n ');
  const p = sinTildes(texto);
  const palabras = texto.split(/\s+/).filter(Boolean).length;
  const r1 = x => Math.round(x*10)/10;
  const lista = modulo === 'apertura' ? EJES_APERTURA : EJES_CLAUSURA;

  const ejes = [], faltan = [], logros = [];
  let suma = 0, pesos = 0;
  for (const e of lista){
    const ok = e.re.test(p);
    const pt = ok ? 9 : 2.5;
    ejes.push({ eje:e.eje, puntaje:pt, comentario: ok ? e.bien : e.falta });
    suma += pt*e.peso; pesos += e.peso;
    (ok ? logros : faltan).push(e);
  }

  /* La apertura no argumenta: eso es de la clausura (arts. 205 y 217) */
  const correcciones = [];
  if (modulo === 'apertura'){
    const argumenta = /\b(es evidente|no cabe duda|quedo (probado|acreditado)|resulta indudable|debe condenarse|debe absolverse|la prueba demuestra que)\b/.test(p);
    ejes.push({ eje:'No argumentar todavía', puntaje: argumenta ? 3 : 9,
      comentario: argumenta
        ? 'Valoraste prueba que todavía no se produjo. La exposición inicial del art. 205 anuncia lo que la prueba va a demostrar; la valoración es materia del alegato del art. 217.'
        : 'Mantuviste el registro del anuncio, sin adelantar valoración.' });
    suma += (argumenta ? 3 : 9) * 1.2; pesos += 1.2;
    if (argumenta) correcciones.push({ tuya:'(en tu apertura)', problema:'Argumentación anticipada',
      mejor:'Cambiá "quedó probado que…" por "la prueba va a demostrar que…". Es la misma idea en el tiempo verbal correcto.' });
  }

  const fal = FALACIAS_ALEGATO.filter(f => f.re.test(p));
  for (const f of fal){
    const frase = texto.split(/(?<=[.;])\s+/).find(t => f.re.test(sinTildes(t))) || '(en tu alegato)';
    correcciones.push({ tuya: frase.slice(0,200), problema: 'Defecto lógico: ' + f.id.replace(/-/g,' '), mejor: f.aviso });
  }
  for (const e of faltan.slice(0, 4))
    correcciones.push({ tuya:'(no aparece en tu alegato)', problema:e.eje, mejor:e.falta });

  const objetivo = (minutos || 6) * 130;
  const ritmo = Math.max(0, Math.min(10, 10 - Math.abs(palabras - objetivo)/(objetivo*0.09)));
  ejes.push({ eje:'Extensión y ritmo', puntaje:r1(ritmo),
    comentario:`${palabras} palabras en ${Math.floor(segundos/60)} minutos. Para ${minutos||6} minutos hablados, la referencia ronda las ${objetivo}.` });
  suma += ritmo*0.7; pesos += 0.7;

  let global = r1(suma/pesos - fal.length*0.6);
  global = Math.max(1, Math.min(10, global));

  const v = [];
  v.push(`${palabras} palabras, ${Math.floor(segundos/60)} minutos.`);
  v.push(`Cubriste ${logros.length} de los ${lista.length} elementos que se esperan en ${modulo === 'apertura' ? 'una apertura' : 'una clausura'}.`);
  if (fal.length) v.push(`Se detectaron ${fal.length} defecto${fal.length>1?'s':''} lógico${fal.length>1?'s':''} en la argumentación.`);
  v.push(modulo === 'apertura'
    ? 'La apertura se gana con una teoría del caso clara y una promesa que después puedas cumplir.'
    : 'La clausura se gana mostrando cómo cada afirmación se apoya en prueba producida, y cerrando con una petición concreta.');

  return { global, ejes, correcciones, aciertos: logros.slice(0,3).map(e=>e.bien),
    perdido: (caso.sobre?.puntos||[]).filter(x => !p.includes(sinTildes(x).slice(0,26))),
    veredicto: v.join(' ') };
}

if (typeof window !== 'undefined') {
  window.LEX = Object.assign(window.LEX || {}, {
    analizarCautelar, informeCautelar, informeAlegato, EJES_CAUTELAR
  });
}
