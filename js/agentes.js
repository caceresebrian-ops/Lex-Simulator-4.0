/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Director de audiencia
   Orquesta a todos los intervinientes. Recibe la intervención del usuario,
   decide quién habla y con qué, y verifica antes de emitir.

   Reglas que no se negocian:
   · Cada agente recibe SOLO lo que su personaje sabe (paquete de
     conocimiento). Ahí vive la asimetría de información.
   · Ninguna cita legal sale sin pasar por la biblioteca.
   · Ninguna respuesta se emite sin verificar que no filtró el sobre cerrado.
   ══════════════════════════════════════════════════════════════════════════ */

/* ─────────────── 1. CLASIFICACIÓN DE LA INTERVENCIÓN ─────────────── */

function clasificar(texto, modulo){
  const p = window.LEX.sinTildes(texto);
  if (/^\s*(objeto|objeci[oó]n|me opongo)/i.test(texto)) return 'objecion';
  if (/\b(solicito|pido|requiero|peticiono|corresponde que|se disponga|se imponga|se rechace)\b/.test(p)
      && !/\?/.test(texto)) return 'peticion';
  if (/\b(exhibo|le exhibo|se exhibe|pongo a la vista|reconoce este|le muestro)\b/.test(p)) return 'exhibicion';
  if (/\?|^\s*(que|quien|como|cuando|donde|cual|cuanto|por que|diga|cuente|describa|recuerda|sabe|vio|escucho)\b/i.test(texto)
      && ['directo','contra'].includes(modulo)) return 'pregunta';
  if (['cautelar','apertura','clausura','impugnacion'].includes(modulo)) return 'fundamento';
  return ['directo','contra'].includes(modulo) ? 'pregunta' : 'fundamento';
}

/* ─────────────── 2. PAQUETES DE CONOCIMIENTO ───────────────
   Lo único que cada personaje sabe. Un agente jamás recibe en su contexto
   información que su personaje no tendría. Esto es lo que impide que el
   juez conozca el sobre cerrado o que la contraparte sepa lo que el
   testigo se guarda.                                                   */

function legajoPublico(c){
  return [
    `Carátula: ${c.caratula}`,
    `Calificación: ${c.delito}`,
    `Hecho: ${c.sintesis}`,
    c.hechos,
    'Prueba del legajo: ' + (c.prueba || []).map(p => `${p.tipo} — ${p.detalle}`).join(' | ')
  ].filter(Boolean).join('\n');
}

const PAQUETES = {
  testigo(c){
    return [
      'SOS ' + (c.testigo?.nombre || 'el testigo') + ', ' + (c.testigo?.calidad || 'testigo') + '.',
      'Perfil: ' + (c.testigo?.perfil || ''),
      c.contexto ? 'Tu vida: ' + Object.values(c.contexto).join(' ') : '',
      c.previa ? 'TU DECLARACIÓN PREVIA (la conocen todos):\n' + c.previa : '',
      'LO QUE SABÉS Y NO VAS A DECIR salvo que te lo pregunten con precisión:',
      c.sobre?.verdad || '',
      (c.sobre?.puntos || []).map((p,i) => `  ${i+1}. ${p}`).join('\n'),
      c.sobre?.conducta ? 'Cómo te comportás: ' + c.sobre.conducta : ''
    ].filter(Boolean).join('\n');
  },
  /* La contraparte conoce el legajo y su teoría, NUNCA el sobre cerrado */
  contraparte(c, rolPropio){
    const mio = rolPropio === 'fiscal' ? 'defensa' : 'fiscal';
    const arg = c.debate && c.debate[mio];
    return [
      'LEGAJO (lo que conocés):', legajoPublico(c),
      c.previa ? 'Declaración previa del testigo:\n' + c.previa : '',
      arg ? 'TUS ARGUMENTOS PARA ESTE CASO:\n' +
            Object.entries(arg).map(([k,v]) => `· ${k}: ${v}`).join('\n') : ''
    ].filter(Boolean).join('\n');
  },
  /* El juez conoce el legajo público y nada más */
  juez(c){
    return 'LEGAJO PÚBLICO (lo único que conocés):\n' + legajoPublico(c);
  }
};

/* ─────────────── 3. REGLAS PROCESALES POR AGENTE ───────────────
   El texto viene de la biblioteca, no de la memoria del modelo.      */

const ARTS_POR_MODULO = {
  directo:  [209, 210, 211, 212, 207, 208],
  contra:   [209, 210, 211, 212, 208],
  cautelar: [115, 116, 124, 127, 128, 129, 130, 131, 132],
  apertura: [205, 207, 217],
  clausura: [19, 207, 217, 218],
  impugnacion: [285, 286, 287, 288, 289, 291, 292, 293]
};

function reglasDe(modulo, extra){
  const nums = (ARTS_POR_MODULO[modulo] || []).concat(extra || []);
  return window.LEX.contextoLey(nums);
}

/* ─────────────── 4. MEMORIA DE COHERENCIA ─────────────── */

function nuevaMemoria(){
  return { afirmado: [], concedido: [], revelados: new Set(), turnos: 0 };
}

function registrar(mem, quien, texto){
  mem.turnos++;
  const frases = String(texto).split(/(?<=[.;])\s+/).filter(f => f.length > 25);
  for (const f of frases.slice(0, 3)) mem.afirmado.push({ quien, f: f.slice(0, 180) });
  if (mem.afirmado.length > 24) mem.afirmado = mem.afirmado.slice(-24);
}

function resumenCoherencia(mem){
  if (!mem.afirmado.length) return '';
  return 'YA SE DIJO EN ESTA AUDIENCIA (no te contradigas con esto):\n' +
    mem.afirmado.map(a => `· ${a.quien}: ${a.f}`).join('\n');
}

/* ─────────────── 5. VERIFICACIÓN DE FUGA ───────────────
   El modelo tiende a ser servicial y regala lo que el usuario no supo
   pedir. Esto lo impide: si aparece un punto reservado que la pregunta
   no habilitaba, la respuesta se rechaza y se regenera.              */

function solapaCon(texto, punto){
  const ta = new Set(window.LEX.fichas(texto));
  const tb = window.LEX.fichas(punto);
  if (!tb.length) return 0;
  let n = 0;
  for (const w of tb) if (ta.has(w)) n++;
  return n / tb.length;
}

function verificarFuga(respuesta, pregunta, caso, mem){
  const puntos = caso.sobre?.puntos || [];
  const fugas = [];
  for (const p of puntos){
    if (mem.revelados.has(p)) continue;          // ya salió legítimamente
    const enRespuesta = solapaCon(respuesta, p);
    if (enRespuesta < 0.34) continue;            // no lo está diciendo
    const enPregunta = solapaCon(pregunta, p);
    /* Sale solo si la pregunta apuntaba a ese punto */
    if (enPregunta >= 0.22) mem.revelados.add(p);
    else fugas.push(p);
  }
  return { limpio: fugas.length === 0, fugas };
}

/* ─────────────── 6. EL DIRECTOR ─────────────── */

function instruccionesAgente(agente, caso, rol, modulo, mem, extra){
  const otro = rol === 'fiscal' ? 'DEFENSA' : 'FISCAL';
  const comun = [
    'Estás en una audiencia penal oral de la provincia de La Rioja, Argentina, regida por la Ley 10.797.',
    'No sos un asistente: sos un personaje dentro de la audiencia y nunca salís de ese rol.',
    'Hablás en castellano rioplatense, con voseo, como se habla en una sala de La Rioja.',
    'NORMAS APLICABLES (texto oficial; no cites ningún artículo que no esté acá):',
    reglasDe(modulo, extra && extra.arts),
    resumenCoherencia(mem)
  ].filter(Boolean).join('\n\n');

  if (agente === 'testigo'){
    return comun + '\n\n' + PAQUETES.testigo(caso) + `

CÓMO RESPONDÉS
· Contestás SOLO lo que te preguntan. Ni una palabra de más.
· Si la pregunta es sugestiva y de un solo punto, contestás seco: sí, no, o un dato.
· Si la pregunta es abierta, te explayás y aprovechás para decir lo que te conviene a vos.
· NUNCA ofrecés por tu cuenta lo que está en la lista de lo que no vas a decir. Si la pregunta
  no apunta exactamente a uno de esos puntos, ese punto no aparece. Ni insinuado.
· Si te acorralan con tu declaración previa, bien traído y paso a paso, concedés a regañadientes.
· Si no entendés, pedís que te la repitan. No te quedás mudo.
· Hablás como la persona que sos, no como un abogado. Frases cortas. Dudás si dudás.
Respondé SOLO con lo que dice el testigo, sin comillas ni acotaciones.`;
  }

  if (agente === 'contraparte'){
    return comun + '\n\n' + PAQUETES.contraparte(caso, rol) + `

SOS LA ${otro} y litigás en contra de quien tenés enfrente.
· Si estás objetando: decís "Objeción" y el motivo, fundado en el artículo que corresponda.
  Objetás solo con fundamento real. El art. 210 manda que las objeciones no alteren la
  continuidad del interrogatorio, así que no objetás por reflejo.
· Si estás argumentando: contestás EL PUNTO QUE ACABAN DE PLANTEAR, con el argumento que este
  caso te da para ese punto. No repetís argumentos ya usados. No hablás en general.
· Una idea por oración, para poder respirar entre una y otra.
Respondé SOLO con lo que decís en la audiencia.`;
  }

  if (agente === 'juez'){
    const puedePreguntar = modulo === 'impugnacion';
    return comun + '\n\n' + PAQUETES.juez(caso) + `

SOS LA JUEZA O EL JUEZ.
· ${puedePreguntar
    ? 'En esta audiencia PODÉS interrogar al recurrente sobre sus fundamentos legales, doctrinarios y jurisprudenciales (art. 291). Usá esa facultad: apretá.'
    : 'NO PODÉS formular preguntas sobre los hechos (art. 209). Conducís, resolvés objeciones y exigís concreción, nada más.'}
· Resolvés las objeciones en una o dos oraciones, diciendo si hacés lugar y por qué.
· Exigís concreción: si una afirmación no está acreditada, lo marcás. Si falta el plazo, lo pedís.
· Devolvés el argumento de la contraparte para que se hagan cargo.
· No conocés nada fuera del legajo público. No inventás hechos.
Respondé SOLO con lo que decís desde el estrado.`;
  }
  return comun;
}

/* Decide la escena del turno: quién habla y en qué orden. */
function planificar(intencion, analisis, modulo, mem, estado){
  const escena = [];
  const esInterrogatorio = ['directo','contra'].includes(modulo);

  if (esInterrogatorio){
    const obj = analisis && window.LEX.decidirObjecion(analisis, modulo, estado);
    if (obj){
      escena.push({ agente:'contraparte', intencion:'objetar', defecto:obj.defecto });
      escena.push({ agente:'juez', intencion:'resolver', prospera:obj.prospera, defecto:obj.defecto });
      if (obj.prospera) return { escena, corta:true };
    }
    escena.push({ agente:'testigo', intencion:'responder' });
    return { escena, corta:false };
  }

  /* Módulos de argumentación */
  escena.push({ agente:'contraparte', intencion:'replicar' });
  escena.push({ agente:'juez', intencion: mem.turnos >= 8 ? 'cerrar' : 'interpelar' });
  return { escena, corta:false };
}

if (typeof window !== 'undefined'){
  window.LEX = Object.assign(window.LEX || {}, {
    clasificar, PAQUETES, reglasDe, nuevaMemoria, registrar, resumenCoherencia,
    verificarFuga, instruccionesAgente, planificar, legajoPublico, ARTS_POR_MODULO
  });
}
