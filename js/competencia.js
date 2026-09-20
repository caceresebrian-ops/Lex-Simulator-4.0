/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Competencia y docencia

   Cuatro herramientas, todas sin servidor:
     · JURADO: rúbrica por rubros, como en los concursos de litigación, para
       que un jurado humano puntúe al lado de la evaluación automática.
     · EQUIPO: reparto de roles y tramos entre los integrantes.
     · CASOS OFICIALES: importar el caso hipotético de una competencia y
       exportar cualquier caso para compartirlo.
     · DOCENTE: consignas que se entregan como archivo, resultados que se
       devuelven como archivo, y un tablero con toda la clase.

   Sin servidor no hay tiempo real: todo viaja en archivos. Es una
   limitación deliberada del alojamiento, no un descuido.
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  const A = window.LEXAPP;
  if (!A) return;
  const $ = s => document.querySelector(s);
  const esc = A.esc, G = A.guardado;

  /* Rubros de los concursos de litigación oral: la planilla del jurado */
  const RUBROS = [
    { id:'teoria',    n:'Teoría del caso',              d:'Clara, consistente, sostenida de principio a fin.' },
    { id:'directo',   n:'Examen directo',               d:'Preguntas abiertas, relato visual, acreditación del testigo.' },
    { id:'contra',    n:'Contraexamen',                 d:'Control del testigo, sugestivas de un punto, uso de la declaración previa.' },
    { id:'objeciones',n:'Objeciones',                   d:'Oportunas, fundadas en su motivo, sin abusar.' },
    { id:'alegatos',  n:'Alegatos',                     d:'Apertura que promete, clausura que cumple y pide en concreto.' },
    { id:'prueba',    n:'Manejo de la prueba',          d:'Proposiciones fácticas ancladas en prueba identificada.' },
    { id:'oralidad',  n:'Oralidad y persuasión',        d:'Sin leer, con dominio del espacio, del tono y de los silencios.' },
    { id:'etica',     n:'Ética y respeto de las reglas',d:'Trato al tribunal, a la contraparte y al testigo.' }
  ];

  const bajar = (nombre, obj) => {
    const b = new Blob([JSON.stringify(obj, null, 2)], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = nombre; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const leerArchivo = accept => new Promise(ok => {
    const i = document.createElement('input');
    i.type = 'file'; i.accept = accept; i.multiple = true;
    i.onchange = async () => {
      const out = [];
      for (const f of i.files) try { out.push(JSON.parse(await f.text())); } catch {}
      ok(out);
    };
    i.click();
  });
  const hoy = () => new Date().toISOString().slice(0, 10);

  /* ═══════════ panel y pestañas ═══════════ */
  function pintar(tab){
    const cont = $('#compContenido');
    if (!cont) return;
    document.querySelectorAll('#compTabs button').forEach(b =>
      b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    ({ jurado:pJurado, equipo:pEquipo, casos:pCasos, docente:pDocente }[tab] || pJurado)(cont);
  }

  /* ═══════════ 1. JURADO ═══════════ */
  function pJurado(cont){
    const ult = A.S.ultimaDev;
    const evals = G.leer('jurado', []);
    let h = '<p class="ayuda">La planilla que usan los concursos de litigación, por rubros de 1 a 10. ' +
      'Un jurado humano puntúa acá, al lado de la evaluación automática, y se comparan.</p>';
    if (!ult){
      h += '<div class="aviso">Primero litigá una audiencia. Al terminar, tocá “Evaluar como jurado” en la devolución.</div>';
    } else {
      h += '<div class="tarjeta"><h3>' + esc(A.S.caso?.caratula || 'Última audiencia') + '</h3>' +
        '<p class="ayuda">Puntaje automático: <b>' + esc(ult.global) + '</b></p>' +
        '<div class="campo"><span>Jurado</span><input type="text" id="jNombre" placeholder="Nombre de quien evalúa"></div>' +
        '<div class="campo"><span>Participante o equipo</span><input type="text" id="jParticipante" placeholder="Quién litigó"></div>' +
        RUBROS.map(r => '<div class="rubro"><div><b>' + esc(r.n) + '</b><span>' + esc(r.d) + '</span></div>' +
          '<input type="number" min="1" max="10" step="0.5" data-rubro="' + r.id + '" placeholder="—"></div>').join('') +
        '<div class="campo"><span>Observaciones</span><textarea id="jObs" style="min-height:80px"></textarea></div>' +
        '<div class="acciones"><button class="principal" id="jGuardar">Guardar evaluación</button></div></div>';
    }
    if (evals.length){
      h += '<h3>Evaluaciones guardadas</h3>' + evals.map((e,i) =>
        '<div class="fila"><div>' + esc(e.participante || 'Sin nombre') + '<span>' + esc(e.caratula) + ' · jurado ' +
        esc(e.jurado || '—') + ' · ' + esc(e.fecha) + '</span></div><div class="num">' + esc(e.promedio) +
        '<span>auto ' + esc(e.automatico) + '</span></div></div>').join('') +
        '<div class="acciones"><button class="secundario" id="jExportar">Exportar planillas</button></div>';
    }
    cont.innerHTML = h;
    const g = $('#jGuardar');
    if (g) g.onclick = () => {
      const notas = {};
      document.querySelectorAll('[data-rubro]').forEach(i => { if (i.value) notas[i.dataset.rubro] = Math.min(10, Math.max(1, +i.value)); });
      const vals = Object.values(notas);
      if (!vals.length){ A.aviso('Cargá al menos un rubro.', true); return; }
      const promedio = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*10)/10;
      const l = G.leer('jurado', []);
      l.unshift({ fecha:hoy(), jurado:$('#jNombre').value.trim(), participante:$('#jParticipante').value.trim(),
                  caratula: A.S.caso?.caratula || '', modulo: A.S.modulo, notas, promedio,
                  automatico: ult.global, observaciones: $('#jObs').value.trim() });
      G.escribir('jurado', l.slice(0, 200));
      pJurado(cont);
    };
    const ex = $('#jExportar');
    if (ex) ex.onclick = () => bajar('planillas-jurado-' + hoy() + '.json', { tipo:'lex-jurado', rubros:RUBROS, evaluaciones: G.leer('jurado', []) });
  }

  /* ═══════════ 2. EQUIPO ═══════════ */
  function pEquipo(cont){
    const eq = G.leer('equipo', { nombre:'', integrantes:[] });
    const TRAMOS = ['Apertura','Examen directo','Contraexamen','Objeciones','Clausura','Réplica'];
    let h = '<p class="ayuda">En competencia se litiga de a dos o tres, repartiendo testigos y alegatos. ' +
      'Acá armás el equipo y asignás cada tramo. Sin servidor no hay entrenamiento simultáneo en varios ' +
      'teléfonos: se rota en el mismo dispositivo o se pasan las audiencias como archivo.</p>' +
      '<div class="campo"><span>Nombre del equipo</span><input type="text" id="eNombre" value="' + esc(eq.nombre) + '"></div>' +
      '<h3>Integrantes y tramos</h3>';
    const filas = (eq.integrantes.length ? eq.integrantes : [{nombre:'',tramos:[]},{nombre:'',tramos:[]}]);
    h += filas.map((it, i) => '<div class="tarjeta" style="padding:14px">' +
      '<input type="text" data-int="' + i + '" value="' + esc(it.nombre) + '" placeholder="Integrante ' + (i+1) + '">' +
      '<div class="opciones" style="margin-top:9px">' + TRAMOS.map(t =>
        '<button class="op" data-int="' + i + '" data-tramo="' + esc(t) + '" aria-pressed="' + (it.tramos||[]).includes(t) + '">' + esc(t) + '</button>').join('') +
      '</div></div>').join('');
    h += '<div class="acciones"><button class="secundario" id="eSumar">Sumar integrante</button>' +
         '<button class="principal" id="eGuardar">Guardar equipo</button></div>';
    cont.innerHTML = h;
    const leerForm = () => {
      const ints = [];
      document.querySelectorAll('input[data-int]').forEach(i => {
        const k = +i.dataset.int;
        ints[k] = { nombre: i.value.trim(), tramos: [...document.querySelectorAll('button[data-int="'+k+'"][aria-pressed="true"]')].map(b => b.dataset.tramo) };
      });
      return { nombre: $('#eNombre').value.trim(), integrantes: ints.filter(Boolean) };
    };
    document.querySelectorAll('button[data-tramo]').forEach(b => b.onclick = () =>
      b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')));
    $('#eSumar').onclick = () => { const e = leerForm(); e.integrantes.push({ nombre:'', tramos:[] }); G.escribir('equipo', e); pEquipo(cont); };
    $('#eGuardar').onclick = () => { G.escribir('equipo', leerForm()); A.aviso('Equipo guardado.'); pEquipo(cont); };
  }

  /* ═══════════ 3. CASOS OFICIALES ═══════════ */
  const PLANTILLA = {
    tipo:'lex-caso', version:1,
    caso:{ id:'competencia-ejemplo', modulos:['directo','contra','cautelar','apertura','clausura'],
      caratula:'F. c/ APELLIDO, Nombre s/ delito', delito:'Calificación (art. X CP)',
      sintesis:'El hecho, en dos o tres oraciones.', hechos:'Estado del legajo.',
      prueba:[{ tipo:'Declaración de …', detalle:'Qué dice.' }],
      testigo:{ nombre:'Nombre Apellido', calidad:'víctima / testigo presencial', genero:'m', perfil:'edad, oficio, temperamento' },
      previa:'Declaración previa del testigo, en primera persona o en estilo de acta.',
      banco:[{ claves:'palabras que activan esta respuesta', texto:'Lo que contesta', corto:'Sí.' }],
      sobre:{ verdad:'Lo que pasó realmente.', puntos:['Punto que el testigo se guarda'], conducta:'Cómo se comporta.' } }
  };

  function validarCaso(c){
    const falta = ['id','caratula','modulos','sobre'].filter(k => !c || !c[k]);
    if (falta.length) return 'Faltan campos: ' + falta.join(', ');
    if (!Array.isArray(c.modulos) || !c.modulos.length) return 'El campo "modulos" tiene que ser una lista.';
    return null;
  }

  function pCasos(cont){
    const mias = A.causasPropias();
    let h = '<p class="ayuda">Los concursos publican su caso hipotético con meses de anticipación. Importalo ' +
      'acá y todo el equipo entrena sobre el mismo expediente. También podés exportar cualquier caso para compartirlo.</p>' +
      '<div class="acciones"><button class="principal" id="cImportar">Importar caso</button>' +
      '<button class="secundario" id="cPlantilla">Descargar plantilla</button></div>';
    const todos = mias.concat(window.LEX.CASOS || []);
    h += '<h3>Exportar un caso</h3>' + todos.map((c, i) =>
      '<div class="fila"><div>' + esc(c.caratula) + '<span>' + esc((c.modulos||[]).join(' · ')) +
      (c.propio ? ' · propio' : '') + '</span></div><button class="plano" data-exp="' + i + '">Exportar</button></div>').join('');
    cont.innerHTML = h;
    $('#cPlantilla').onclick = () => bajar('plantilla-caso-lex.json', PLANTILLA);
    $('#cImportar').onclick = async () => {
      const arch = await leerArchivo('application/json,.json');
      let n = 0, errores = [];
      const l = A.causasPropias();
      for (const a of arch){
        const c = a && (a.caso || a);
        const err = validarCaso(c);
        if (err){ errores.push(err); continue; }
        c.propio = true; c.origen = 'caso de competencia'; c.fecha = Date.now();
        l.unshift(c); n++;
      }
      G.escribir('causas', l.slice(0, 60));
      A.aviso(n ? `${n} caso${n>1?'s':''} importado${n>1?'s':''}.` : ('No se importó nada. ' + (errores[0] || '')), !n);
      pCasos(cont);
    };
    cont.querySelectorAll('[data-exp]').forEach(b => b.onclick = () => {
      const c = todos[+b.dataset.exp];
      /* las causas derivadas de material real no se comparten sin confirmación */
      if (c.origen === 'causa real anonimizada' &&
          !confirm('Este caso se armó con una causa real. ¿Confirmás que está anonimizado y que podés compartirlo?')) return;
      bajar('caso-' + String(c.id).replace(/[^\w-]/g,'') + '.json', { tipo:'lex-caso', version:1, caso:c });
    });
  }

  /* ═══════════ 4. DOCENTE ═══════════ */
  function pDocente(cont){
    const todos = A.causasPropias().concat(window.LEX.CASOS || []);
    const res = G.leer('resultadosClase', []);
    let h = '<p class="ayuda">El docente arma una consigna y la reparte como archivo. Cada alumno la abre, ' +
      'litiga y devuelve su resultado como archivo. El docente carga todos los resultados y ve la clase entera.</p>' +
      '<div class="tarjeta"><h3>Crear una consigna</h3>' +
      '<div class="campo"><span>Título</span><input type="text" id="dTitulo" placeholder="Práctica 3: contraexamen del damnificado"></div>' +
      '<div class="campo"><span>Caso</span><select id="dCaso">' + todos.map((c,i) =>
        '<option value="' + i + '">' + esc(c.caratula) + '</option>').join('') + '</select></div>' +
      '<div class="campo"><span>Audiencia</span><select id="dModulo">' + Object.entries(A.MODULOS).map(([k,m]) =>
        '<option value="' + k + '">' + esc(m.nombre) + '</option>').join('') + '</select></div>' +
      '<div class="campo"><span>Rol del alumno</span><select id="dRol">' + Object.entries(A.ROLES).map(([k,n]) =>
        '<option value="' + k + '">' + esc(n) + '</option>').join('') + '</select></div>' +
      '<div class="campo"><span>Minutos</span><input type="text" id="dMin" value="10"></div>' +
      '<div class="campo"><span>Fecha de entrega</span><input type="text" id="dFecha" placeholder="aaaa-mm-dd"></div>' +
      '<div class="acciones"><button class="principal" id="dCrear">Descargar consigna</button></div></div>' +
      '<div class="tarjeta"><h3>Soy alumno</h3>' +
      '<div class="campo"><span>Tu nombre</span><input type="text" id="dAlumno" value="' + esc(G.leer('alumno','')) + '"></div>' +
      '<div class="acciones"><button class="principal" id="dAbrir">Abrir una consigna</button></div></div>' +
      '<div class="tarjeta"><h3>Tablero de la clase</h3>' +
      '<div class="acciones"><button class="principal" id="dCargar">Cargar resultados de alumnos</button>' +
      (res.length ? '<button class="secundario" id="dLimpiar">Vaciar tablero</button>' : '') + '</div>' + tablero(res) + '</div>';
    cont.innerHTML = h;

    $('#dCrear').onclick = () => {
      const c = todos[+$('#dCaso').value];
      const mod = $('#dModulo').value;
      const consigna = { tipo:'lex-consigna', version:1, titulo: $('#dTitulo').value.trim() || 'Consigna',
        modulo: mod, rol: $('#dRol').value, minutos: +$('#dMin').value || 10, entrega: $('#dFecha').value.trim(),
        caso: Object.assign({}, c, { modulos: [...new Set((c.modulos||[]).concat(mod))] }) };
      bajar('consigna-' + hoy() + '.json', consigna);
    };
    $('#dAbrir').onclick = async () => {
      G.escribir('alumno', $('#dAlumno').value.trim());
      const [con] = await leerArchivo('application/json,.json');
      if (!con || con.tipo !== 'lex-consigna'){ A.aviso('Ese archivo no es una consigna.', true); return; }
      const c = Object.assign({}, con.caso, { propio:true, origen:'consigna', consigna: con.titulo });
      const l = A.causasPropias().filter(x => x.id !== c.id); l.unshift(c);
      G.escribir('causas', l.slice(0, 60));
      const t = G.leer('tiempos', {}); t[con.modulo] = con.minutos; G.escribir('tiempos', t);
      A.S.modulo = con.modulo; A.S.rol = con.rol; A.S.casoId = c.id;
      A.S.consigna = { titulo: con.titulo, entrega: con.entrega };
      A.pintarSetup(); A.ver('setup');
      A.aviso('Consigna cargada: ' + con.titulo + '. Tocá “Abrir la audiencia”.');
    };
    $('#dCargar').onclick = async () => {
      const arch = await leerArchivo('application/json,.json');
      const l = G.leer('resultadosClase', []);
      for (const r of arch) if (r && r.tipo === 'lex-resultado') l.push(r);
      G.escribir('resultadosClase', l);
      pDocente(cont);
    };
    const lim = $('#dLimpiar');
    if (lim) lim.onclick = () => { if (confirm('¿Vaciar el tablero?')){ G.escribir('resultadosClase', []); pDocente(cont); } };
  }

  function tablero(res){
    if (!res.length) return '<p class="ayuda">Todavía no cargaste resultados.</p>';
    const prom = Math.round(res.reduce((a,r)=>a+(+r.global||0),0)/res.length*10)/10;
    const porEje = {}, defectos = {};
    for (const r of res){
      for (const e of (r.ejes||[])) (porEje[e.eje] = porEje[e.eje] || []).push(+e.puntaje||0);
      for (const [k,v] of Object.entries(r.defectos||{})) defectos[k] = (defectos[k]||0) + v;
    }
    const ejes = Object.entries(porEje).map(([e,v]) => [e, Math.round(v.reduce((a,b)=>a+b,0)/v.length*10)/10]).sort((a,b)=>a[1]-b[1]);
    const def = Object.entries(defectos).sort((a,b)=>b[1]-a[1]).slice(0,4);
    return '<div class="global"><b>' + prom + '</b><span>promedio de ' + res.length + ' alumnos</span></div>' +
      (ejes[0] ? '<div class="reco"><b>Lo que más le cuesta a la clase</b><p>' + esc(ejes[0][0]) + ', con ' + ejes[0][1] + ' de promedio.' +
       (def[0] ? ' El defecto más repetido es “' + esc(def[0][0]) + '”, ' + def[0][1] + ' veces.' : '') + '</p></div>' : '') +
      res.slice().sort((a,b)=>(+b.global||0)-(+a.global||0)).map(r =>
        '<div class="fila"><div>' + esc(r.alumno || 'Sin nombre') + '<span>' + esc(r.consigna || '') + ' · ' +
        esc(r.fecha || '') + '</span></div><div class="num">' + esc(r.global) + '</div></div>').join('');
  }

  /* Al terminar una audiencia que vino de una consigna, el alumno exporta */
  A.on('devolucion', ({ d, seg }) => {
    if (!A.S.consigna) return;
    const acc = document.querySelector('#hojaDev .acciones');
    if (!acc || document.querySelector('#exportarResultado')) return;
    const b = document.createElement('button');
    b.className = 'principal'; b.id = 'exportarResultado';
    b.textContent = 'Entregar al docente';
    b.onclick = () => {
      const defectos = {};
      for (const r of A.S.registro) for (const x of (r.analisis?.defectos || [])) defectos[x.nombre] = (defectos[x.nombre]||0) + 1;
      bajar('resultado-' + (G.leer('alumno','alumno').replace(/\W+/g,'-') || 'alumno') + '-' + hoy() + '.json', {
        tipo:'lex-resultado', version:1, alumno: G.leer('alumno',''), consigna: A.S.consigna.titulo,
        fecha: hoy(), modulo: A.S.modulo, rol: A.S.rol, global: d.global, segundos: seg,
        ejes: (d.ejes||[]).map(e => ({ eje:e.eje, puntaje:e.puntaje })), defectos,
        acta: A.S.registro.filter(r => !r.tiempo).map(r => ({ quien:r.quien, texto:r.texto }))
      });
    };
    acc.insertBefore(b, acc.firstChild);
  });

  /* El botón “Evaluar como jurado” de la devolución abre esta pestaña */
  A.on('jurado', () => { A.ver('competencia'); pintar('jurado'); });

  /* Conexión con el menú y las pestañas */
  document.addEventListener('DOMContentLoaded', instalar);
  function instalar(){
    const ir = $('#irCompetencia');
    if (ir) ir.onclick = () => { A.ver('competencia'); pintar('jurado'); };
    document.querySelectorAll('#compTabs button').forEach(b => b.onclick = () => pintar(b.dataset.tab));
  }
  instalar();

  window.LEX = Object.assign(window.LEX || {}, { RUBROS_JURADO: RUBROS, validarCaso, tableroClase: tablero, pintarCompetencia: pintar });
})();
