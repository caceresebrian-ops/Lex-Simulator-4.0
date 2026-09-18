/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Ingesta de causas reales
   Convierte el texto de una causa anonimizada en un caso jugable.

   Todo lo de este archivo corre en el dispositivo. Nada sale de acá salvo
   que el usuario active expresamente el modelo, y en ese caso se le avisa
   antes de que el texto viaje.
   ══════════════════════════════════════════════════════════════════════════ */

/* ─────────────── 1. DETECCIÓN DE DATOS PERSONALES ───────────────
   Primer filtro de seguridad. Marca lo que quedó sin anonimizar para que
   el usuario lo revise antes de seguir. Prefiere marcar de más.        */

const DETECTORES = [
  { id:'dni', nombre:'Documento',
    re:/\b(?:D\.?N\.?I\.?|documento|L\.?C\.?|L\.?E\.?)[\s.:nN°º]*(\d{1,2}[.\s]?\d{3}[.\s]?\d{3})\b/gi,
    grupo:1, riesgo:'alto' },
  { id:'dni-suelto', nombre:'Número de documento suelto',
    re:/\b\d{2}[.]\d{3}[.]\d{3}\b/g, grupo:0, riesgo:'alto' },
  { id:'cuil', nombre:'CUIL o CUIT',
    re:/\b\d{2}[-\s]?\d{8}[-\s]?\d\b/g, grupo:0, riesgo:'alto' },
  { id:'email', nombre:'Correo electrónico',
    re:/\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/g, grupo:0, riesgo:'alto' },
  { id:'tel', nombre:'Teléfono',
    re:/\b(?:tel(?:éfono)?|cel(?:ular)?|abonado)[\s.:nN°º]*((?:\+?54)?[\s()-]?\d[\d\s()-]{7,14})/gi,
    grupo:1, riesgo:'alto' },
  { id:'tel-suelto', nombre:'Número que parece teléfono',
    re:/\b(?:380|11|351|11)[\s-]?\d{3}[\s-]?\d{4}\b/g, grupo:0, riesgo:'medio' },
  { id:'patente', nombre:'Dominio de vehículo',
    re:/\b(?:dominio|patente|chapa)[\s.:nN°º]*([A-Z]{2,3}\s?\d{3}\s?[A-Z]{0,2})\b/gi,
    grupo:1, riesgo:'alto' },
  { id:'expte', nombre:'Número de causa o legajo',
    re:/\b(?:expte\.?|expediente|legajo|causa|I\.?P\.?P\.?|autos)[\s.:nN°º]*([\d]{1,6}[\/\-.][\d]{2,4}[\/\-.\d]*)/gi,
    grupo:1, riesgo:'alto' },
  { id:'domicilio', nombre:'Domicilio',
    re:/\b(?:calle|avenida|av\.|pasaje|barrio|b[°º]|manzana|mz\.?|lote|casa)\s+[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ.\s]{2,32}?(?:\s*n?[°º]?\s*\d{1,5})/gi,
    grupo:0, riesgo:'medio' },
  { id:'nombre', nombre:'Posible nombre y apellido',
    re:/\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\s+(?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\s+)?[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\b/g,
    grupo:0, riesgo:'medio' }
];

/* Palabras que empiezan con mayúscula pero no son nombres de persona */
const NO_ES_NOMBRE = /^(Ministerio|Poder|Codigo|Código|Camara|Cámara|Tribunal|Juzgado|Fiscalia|Fiscalía|Defensoria|Defensoría|Comisaria|Comisaría|Policia|Policía|Provincia|Republica|República|Boletin|Boletín|Direccion|Dirección|Secretaria|Secretaría|Unidad|Division|División|Departamento|Hospital|Municipalidad|Buenos|La Rioja|Santa|San|Villa|Nuestra|Corte|Superior|Penal|Civil|Instruccion|Instrucción|Camara|Registro|Nacional|Argentina|Estado|Banco|Escuela|Colegio|Universidad|Ley|Acta|Informe|Pericia|Declaracion|Declaración|Que|Los|Las|Del|Por|Con|Para|Sin|Ante|Segun|Según|Asimismo|Atento|Visto|Considerando|Resulta|Primero|Segundo|Tercero)\b/;

function detectarPersonales(texto){
  const hallazgos = [];
  const vistos = new Set();
  for (const d of DETECTORES){
    const re = new RegExp(d.re.source, d.re.flags);
    let m;
    while ((m = re.exec(texto)) !== null){
      const valor = (m[d.grupo] || m[0]).trim();
      if (!valor || valor.length < 3) continue;
      if (d.id === 'nombre' && NO_ES_NOMBRE.test(valor)) continue;
      const clave = valor.toLowerCase();   // por valor, no por detector
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      hallazgos.push({ tipo:d.id, nombre:d.nombre, valor, riesgo:d.riesgo,
                       veces: contar(texto, valor) });
      if (hallazgos.length > 400) break;
    }
  }
  return hallazgos.sort((a,b) => (a.riesgo === b.riesgo ? b.veces - a.veces : a.riesgo === 'alto' ? -1 : 1));
}

function contar(texto, valor){
  try {
    const re = new RegExp(valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    return (texto.match(re) || []).length;
  } catch { return 1; }
}

/* ─────────────── 2. REEMPLAZO POR DATOS FICTICIOS ───────────────
   Nombres, calles y barrios riojanos, para que el caso siga sonando local. */

const FICCION = {
  varon:['Ramón Quiroga','Nahuel Agüero','Cristian Vera','Sergio Olmos','Diego Morales',
         'Walter Brizuela','Emanuel Carrizo','Damián Funes','Luis Herrera','Fabián Roldán',
         'Matías Paz','Héctor Villafañe','Jonatan Albornoz','Gustavo Nieva','Aldo Páez',
         'Franco Luna','Raúl Cáceres','Julio Sosa','Marcelo Britos','Ariel Ferreyra'],
  mujer:['Yamila Torres','Lucía Agüero','Nélida Cabrera','Wanda Ocampo','Elba Moyano',
         'Marta Gómez','Rocío Leiva','Silvia Bazán','Carla Nieto','Mariela Ávila',
         'Paola Reinoso','Andrea Sotomayor','Valeria Corzo','Noelia Brizuela','Daniela Páez'],
  calle:['Benjamín de la Vega','Copiapó','19 de Febrero','Los Zorzales','Santa Fe',
         'Rivadavia','Catamarca','Perú','San Nicolás de Bari','Joaquín V. González',
         'Pelagio B. Luna','Dalmacio Vélez','Corrientes','Hipólito Yrigoyen'],
  barrio:['barrio Vargas','barrio Antártida','barrio Ñuñorco','barrio San Martín',
          'barrio Faldeo del Velasco','barrio Evita','barrio Panamericano','barrio Shincal'],
  lugar:['Capital','Chilecito','Chamical','Aimogasta','Olta','Villa Unión','Chepes',
         'Sanagasta','Famatina','Patquía','Anillaco','Ulapes']
};

function reemplazoFicticio(h, usados){
  const elegir = lista => {
    for (let i = 0; i < 60; i++){
      const v = lista[Math.floor(Math.random()*lista.length)];
      if (!usados.has(v)){ usados.add(v); return v; }
    }
    return lista[0] + ' ' + (usados.size);
  };
  switch (h.tipo){
    case 'dni': case 'dni-suelto':
      return String(Math.floor(20 + Math.random()*25)) + '.' +
             String(Math.floor(100 + Math.random()*899)) + '.' +
             String(Math.floor(100 + Math.random()*899));
    case 'cuil':
      return '20-' + String(Math.floor(20000000 + Math.random()*19000000)) + '-4';
    case 'email':   return 'contacto' + Math.floor(Math.random()*90+10) + '@correo.ficticio';
    case 'tel': case 'tel-suelto': return '380 4' + String(Math.floor(100000 + Math.random()*899999));
    case 'patente': return 'AB' + Math.floor(100+Math.random()*899) + 'CD';
    case 'expte':   return String(Math.floor(100+Math.random()*899)) + '/' + (new Date().getFullYear());
    case 'domicilio':
      return elegir(FICCION.calle) + ' al ' + (Math.floor(1+Math.random()*9) * 100);
    case 'nombre':
      return elegir(Math.random() < 0.65 ? FICCION.varon : FICCION.mujer);
    default: return '[dato reemplazado]';
  }
}

/* Aplica los reemplazos elegidos y devuelve el texto saneado más el mapa,
   para que el usuario pueda ver qué se cambió por qué.                */
function sanear(texto, seleccion){
  const usados = new Set();
  const mapa = [];
  let out = texto;
  for (const h of seleccion){
    const nuevo = reemplazoFicticio(h, usados);
    try {
      const re = new RegExp(h.valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      out = out.replace(re, nuevo);
      mapa.push({ de:h.valor, a:nuevo, tipo:h.nombre });
    } catch {}
  }
  return { texto: out, mapa };
}

/* ─────────────── 3. EXTRACCIÓN DE ESTRUCTURA (sin conexión) ───────────────
   Reglas sobre el modo en que se redacta un legajo penal argentino.     */

function extraerEstructura(texto){
  const t = texto.replace(/\r/g,'');
  const lineas = t.split('\n').map(l => l.trim()).filter(Boolean);
  const plano = t.toLowerCase();

  const buscar = (re, n) => { const m = t.match(re); return m ? (m[n||1]||'').trim() : ''; };

  /* Carátula */
  let caratula = buscar(/(?:car[aá]tula|autos?|causa)[\s:"“]*([^\n"”]{10,120})/i);
  if (!caratula) caratula = buscar(/\b([A-ZÁÉÍÓÚÑ][^\n]{3,60}\s+s\/\s+[^\n]{4,60})/);
  if (!caratula) caratula = 'Causa importada';

  /* Calificación legal */
  let delito = buscar(/(?:calificaci[oó]n legal|calificado como|delito de|se le imputa(?:n)?|encuadra(?:da)? en)[\s:]*([^\n.;]{6,110})/i);
  if (!delito){
    const m = t.match(/\barts?\.?\s*\d+[^\n.;]{0,60}(?:C\.?P\.?|C[oó]digo Penal)/i);
    delito = m ? m[0].trim() : '';
  }
  if (!delito){
    const m = caratula.match(/\bs\/\s*(.{4,70})$/i);
    if (m) delito = m[1].trim().replace(/["”']+$/,'');
  }
  if (!delito) delito = 'A determinar';

  /* Relato del hecho */
  let hechos = buscar(/(?:relaci[oó]n (?:precisa|circunstanciada|del hecho)|hecho imputado|de los hechos|hechos)[\s:\-—]*\n?([\s\S]{120,1600}?)(?:\n\s*\n|\n[A-ZÁÉÍÓÚÑ]{4,}[\s:])/i);
  if (!hechos){
    const idx = lineas.findIndex(l => /^(que\s+(?:el\s+d[ií]a|siendo|con\s+fecha))/i.test(l));
    if (idx >= 0) hechos = lineas.slice(idx, idx+6).join(' ');
  }
  if (!hechos) hechos = lineas.slice(0, 8).join(' ').slice(0, 1200);

  /* Elementos de prueba */
  const prueba = [];
  const RE_PRUEBA = /\b(acta de [a-záéíóúñ ]{3,40}|informe [a-záéíóúñ ]{3,40}|pericia [a-záéíóúñ ]{3,40}|peritaje [a-záéíóúñ ]{3,40}|declaraci[oó]n testimonial de [^\n.;,]{3,50}|croquis[a-záéíóúñ ]{0,25}|historia cl[ií]nica|informe m[eé]dico[a-záéíóúñ ]{0,25}|planilla de [a-záéíóúñ ]{3,30}|filmaci[oó]n[a-záéíóúñ ]{0,25}|c[aá]mara de seguridad|secuestro de [^\n.;,]{3,40}|rueda de reconocimiento|alcoholemia|informe socioambiental|certificado de antecedentes)/gi;
  let mp, vistos = new Set();
  while ((mp = RE_PRUEBA.exec(t)) !== null){
    const tipo = mp[1].replace(/\s+/g,' ').trim();
    const k = tipo.toLowerCase();
    if (vistos.has(k)) continue;
    vistos.add(k);
    const ctx = t.slice(mp.index, mp.index + 260).split(/[.;]\s/)[0];
    prueba.push({ tipo: tipo.charAt(0).toUpperCase()+tipo.slice(1),
                  detalle: ctx.slice(tipo.length).replace(/^[\s,:;-]+/,'').slice(0,180) || 'Incorporado al legajo.' });
    if (prueba.length >= 10) break;
  }

  /* Declaración testimonial: el bloque más largo en estilo de acta */
  let previa = '';
  const bloques = t.split(/\n\s*\n/);
  for (const b of bloques){
    if (/\bque\s+(?:el\s+d[ií]a|siendo|en\s+circunstancias|se\s+encontraba|el\s+declarante)/i.test(b)
        && b.length > (previa.length) && b.length > 220) previa = b.trim();
  }
  if (previa.length > 2400) previa = previa.slice(0, 2400);

  /* Testigo */
  let nombre = buscar(/(?:declara(?:ci[oó]n)?(?:\s+testimonial)?\s+de|testigo|comparec[eió]{1,2}|se presenta|presta declaraci[oó]n)[\s:,]*(?:el|la|ante m[ií])?[\s:,]*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,2})/i);
  if (!nombre) nombre = 'Testigo';
  const edad = buscar(/(\d{2})\s*años/);

  return {
    caratula, delito,
    sintesis: hechos.split(/(?<=[.])\s+/).slice(0,3).join(' ').slice(0, 500),
    hechos: hechos.slice(0, 1600),
    prueba: prueba.length ? prueba : [{tipo:'Elementos del legajo', detalle:'Cargados en el expediente.'}],
    testigo: { nombre, calidad:'testigo', genero: 'm',
               perfil: (edad ? edad + ' años. ' : '') + 'Declaró en la etapa preparatoria.' },
    previa
  };
}

/* ─────────────── 4. BANCO DE RESPUESTAS DESDE LA DECLARACIÓN ───────────────
   Cada afirmación de la declaración previa se vuelve una respuesta posible,
   y sus palabras de contenido, las claves que la activan.              */

const VACIAS_ING = new Set(('que el la los las de del al un una unos unas en con por para sin sobre su sus se lo le les y o a es era fue ser este esta esto ese esa aquel mismo misma declarante manifiesta manifesto refiere dice expresa siendo aproximadamente circunstancias oportunidad momento asimismo tambien luego cuando donde como cual quien mas muy ya no si ante entre hasta desde durante contra segun tras').split(' '));

function bancoDesdePrevia(previa, nombreTestigo){
  if (!previa) return [];
  const frases = previa
    .replace(/\s+/g,' ')
    .split(/(?<=[.;])\s+(?=[A-ZQ])/)
    .map(f => f.trim())
    .filter(f => f.length > 35);

  const banco = [];
  for (const f of frases.slice(0, 26)){
    const claves = f.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9ñ\s]/g,' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !VACIAS_ING.has(w));
    if (claves.length < 2) continue;
    /* Se pasa de la redacción de acta a la primera persona hablada */
    /* El acta está en tercera persona y con fórmulas de sumariante.
       Se la pasa a primera persona hablada para que el testigo suene
       a persona y no a expediente leído en voz alta.                */
    const texto = f
      .replace(/^Que\s+(el\s+|la\s+)?declarante\s+/i, '')
      .replace(/^Que\s+/i, '')
      .replace(/\b(el|la)\s+declarante\b/gi, 'yo')
      .replace(/\b(al|a la)\s+declarante\b/gi, 'a mí')
      .replace(/\b(del|de la)\s+declarante\b/gi, 'mío')
      .replace(/\bfue abordad[oa] por\b/gi, 'me abordó')
      .replace(/\bfue interceptad[oa] por\b/gi, 'me interceptó')
      .replace(/\ble (exhibi|mostr|exigi|manifest|refiri|dij|solicit)([oó])/gi, 'me $1$2')
      .replace(/\bse encontraba\b/gi, 'estaba')
      .replace(/\bmanifiesta que\b/gi, '')
      .replace(/\ben circunstancias en que\b/gi, 'cuando')
      .replace(/\bdicha arteria\b/gi, 'esa calle')
      .replace(/\bdicho sujeto\b/gi, 'el tipo')
      .replace(/\bel nombrado\b/gi, 'él')
      .replace(/\bsiendo aproximadamente las\b/gi, 'serían como las')
      .replace(/\bdel corriente\b/gi, '')
      .replace(/^entreg[oó]/i, 'Le entregué')
      .replace(/^me entreg[oó]/i, 'Le entregué')
      .replace(/\s{2,}/g, ' ')
      .replace(/^(\w)/, (m,c) => c.toUpperCase())
      .trim();
    banco.push({
      claves: [...new Set(claves)].slice(0, 9).join(' '),
      texto,
      corto: 'Sí, así fue.'
    });
  }
  return banco;
}

/* ─────────────── 5. ARMADO DEL CASO JUGABLE ─────────────── */

function construirCaso(datos, sobre, modulos){
  const id = 'propio-' + Date.now().toString(36);
  const banco = bancoDesdePrevia(datos.previa, datos.testigo.nombre);
  /* Lo que el testigo se guarda: cada punto del sobre entra al banco como
     entrada reservada, que solo sale con una pregunta muy precisa.     */
  for (const p of (sobre.puntos || [])){
    const claves = String(p).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9ñ\s]/g,' ').split(/\s+/)
      .filter(w => w.length > 3 && !VACIAS_ING.has(w));
    if (!claves.length) continue;
    banco.push({ claves: claves.slice(0, 9).join(' '), texto: String(p),
                 corto: 'Sí, es así.', reservado: true });
  }
  return Object.assign({}, datos, {
    id, propio: true, origen: 'causa real anonimizada',
    modulos: modulos && modulos.length ? modulos : ['directo','contra'],
    banco, sobre,
    contexto: {}
  });
}

if (typeof window !== 'undefined') {
  window.LEX = Object.assign(window.LEX || {}, {
    detectarPersonales, sanear, extraerEstructura, bancoDesdePrevia, construirCaso, FICCION
  });
}
