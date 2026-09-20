/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Grabación y reproducción

   Graba tu voz durante la audiencia y te deja escucharte después, con el
   acta al lado: tocás un turno y el audio salta a ese momento. Escuchar
   las propias muletillas, los silencios y el tono es una corrección que
   ningún texto reemplaza.

   El audio se guarda en el dispositivo (IndexedDB), nunca se sube. Se
   conservan las últimas diez audiencias.
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  const A = window.LEXAPP;
  if (!A) return;
  const $ = s => document.querySelector(s);
  const MAX = 10;

  const soportado = () => typeof MediaRecorder !== 'undefined' &&
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  /* ─── almacenamiento de audio en IndexedDB ─── */
  function db(){
    return new Promise((ok, mal) => {
      if (!window.indexedDB) return mal(new Error('sin IndexedDB'));
      const r = indexedDB.open('lex-grabaciones', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('g', { keyPath:'id' });
      r.onsuccess = () => ok(r.result);
      r.onerror = () => mal(r.error);
    });
  }
  async function guardar(reg){
    const d = await db();
    await new Promise((ok, mal) => {
      const tx = d.transaction('g', 'readwrite');
      tx.objectStore('g').put(reg); tx.oncomplete = ok; tx.onerror = () => mal(tx.error);
    });
    /* conservar solo las últimas */
    const todas = await listar();
    for (const v of todas.slice(MAX)){
      await new Promise(ok => { const tx = d.transaction('g','readwrite'); tx.objectStore('g').delete(v.id); tx.oncomplete = ok; });
    }
  }
  async function listar(){
    const d = await db();
    return new Promise(ok => {
      const out = [];
      const c = d.transaction('g').objectStore('g').openCursor();
      c.onsuccess = e => { const cur = e.target.result; if (cur){ out.push(cur.value); cur.continue(); }
                           else ok(out.sort((a,b) => b.fecha - a.fecha)); };
      c.onerror = () => ok([]);
    });
  }

  /* ─── la grabación en curso ─── */
  const G = { rec:null, trozos:[], marcas:[], activa:false, stream:null, t0:0 };

  async function empezar(){
    if (!soportado()){ A.aviso('Este navegador no permite grabar audio.', true); return false; }
    try {
      G.stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      const tipo = ['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg']
        .find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
      G.rec = tipo ? new MediaRecorder(G.stream, { mimeType: tipo }) : new MediaRecorder(G.stream);
      G.trozos = []; G.marcas = []; G.t0 = Date.now();
      G.rec.ondataavailable = e => { if (e.data && e.data.size) G.trozos.push(e.data); };
      G.rec.start(1000);
      G.activa = true;
      pintarBoton();
      A.aviso('Grabando la audiencia.');
      return true;
    } catch (e){
      A.aviso(e.name === 'NotAllowedError' ? 'No diste permiso para grabar.' : 'No se pudo iniciar la grabación.', true);
      return false;
    }
  }

  function detener(){
    return new Promise(ok => {
      if (!G.rec || G.rec.state === 'inactive'){ G.activa = false; return ok(null); }
      G.rec.onstop = () => {
        const blob = new Blob(G.trozos, { type: G.rec.mimeType || 'audio/webm' });
        (G.stream && G.stream.getTracks() || []).forEach(t => t.stop());
        G.activa = false; pintarBoton();
        ok(blob);
      };
      G.rec.stop();
    });
  }

  function pintarBoton(){
    const b = $('#grabar');
    if (!b) return;
    b.setAttribute('aria-pressed', String(G.activa));
    b.title = G.activa ? 'Grabando: tocá para detener' : 'Grabar la audiencia';
  }

  /* ─── botón en la barra de la sala ─── */
  function instalarBoton(){
    if ($('#grabar') || !$('#barra')) return;
    const b = document.createElement('button');
    b.className = 'icono chico'; b.id = 'grabar';
    b.setAttribute('aria-label', 'Grabar la audiencia');
    b.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="currentColor" stroke="none"/></svg>';
    b.onclick = async () => { if (G.activa) await detener(); else await empezar(); };
    const reloj = $('#reloj');
    if (reloj && reloj.parentNode) reloj.parentNode.insertBefore(b, reloj);
    else $('#barra').appendChild(b);
    if (!soportado()) b.style.display = 'none';
  }

  A.on('abrir', () => {
    instalarBoton();
    G.marcas = [];
    if (A.guardado.leer('grabarSiempre', false) && soportado()) empezar();
  });

  A.on('turno', ev => {
    if (G.activa) G.marcas.push({ t: (Date.now() - G.t0) / 1000, quien: ev.quien, texto: ev.texto });
  });

  A.on('levantar', async () => {
    if (!G.activa) { G.pendiente = null; return; }
    const blob = await detener();
    if (!blob || !blob.size) return;
    const reg = { id: 'g' + Date.now(), fecha: Date.now(), blob, marcas: G.marcas.slice(),
                  caratula: A.S.caso?.caratula || '', modulo: A.S.modulo };
    G.pendiente = reg;
    try { await guardar(reg); } catch {}
    mostrarReproductor(reg);
  });

  A.on('devolucion', () => { if (G.pendiente) mostrarReproductor(G.pendiente); });

  /* ─── reproductor con el acta sincronizada ─── */
  function mostrarReproductor(reg){
    const zona = $('#zonaGrabacion');
    if (!zona || !reg || !reg.blob) return;
    const url = URL.createObjectURL(reg.blob);
    const turnos = reg.marcas.map((m, i) =>
      '<button class="marcaAudio" data-t="' + m.t + '"><span>' + A.mmss(Math.floor(m.t)) + '</span>' +
      A.esc(m.quien) + ': ' + A.esc(String(m.texto).slice(0, 110)) + '</button>').join('');
    zona.innerHTML = '<h3>Escuchate</h3>' +
      '<p class="ayuda">Tocá un turno y el audio salta a ese momento. Prestá atención a las muletillas, ' +
      'a los silencios antes de preguntar y a si subís el tono cuando el testigo se resiste.</p>' +
      '<audio controls preload="metadata" src="' + url + '" id="audioActa" style="width:100%"></audio>' +
      '<div class="marcasAudio">' + turnos + '</div>';
    const au = $('#audioActa');
    zona.querySelectorAll('.marcaAudio').forEach(b => b.onclick = () => {
      au.currentTime = Math.max(0, parseFloat(b.dataset.t) - 1.5); au.play();
    });
  }

  window.LEX = Object.assign(window.LEX || {}, { grabacionesGuardadas: listar });
})();
