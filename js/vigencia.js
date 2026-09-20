/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Vigencia y verificación de la ley

   Los 359 artículos salieron de un OCR revisado por muestreo, no artículo
   por artículo. Antes de que esto lo use una facultad hay que poder
   contrastarlos contra el texto oficial. Acá se hace eso:

     · pegás el texto oficial de un artículo y la app lo compara;
     · si difiere, lo corregís y la corrección pasa a toda la app;
     · registrás las reformas, y el artículo reformado avisa al citarse.

   Un simulador que enseña derecho derogado es peor que ninguno.
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  const A = window.LEXAPP, L = window.LEX;
  if (!A || !L || !L.LEY_10797) return;
  const $ = s => document.querySelector(s);
  const esc = A.esc, G = A.guardado;

  const FICHA = {
    norma: 'Ley 10.797 — Código Procesal Penal de La Rioja',
    fuente: 'Texto extraído por OCR del escaneo oficial de la ley sancionada',
    extraccion: '2026-09-16',
    articulos: L.LEY_10797.length
  };

  /* Las correcciones se aplican sobre el mismo arreglo que usa toda la
     app, así la búsqueda, las citas y los agentes leen el texto bueno.  */
  function aplicarCorrecciones(){
    const corr = G.leer('leyCorrecciones', {});
    for (const [n, t] of Object.entries(corr)){
      const a = L.LEY_10797.find(x => x.n === +n);
      if (a && t) a.t = t;
    }
  }
  aplicarCorrecciones();

  /* Estado de un artículo, que la hoja de cita muestra al usuario */
  L.estadoArticulo = n => {
    const ref = G.leer('leyReformas', []).filter(r => +r.n === +n);
    if (ref.length) return '⚠ reformado por ' + ref.map(r => r.por).join(', ');
    if (G.leer('leyVerificados', {})[n]) return 'verificado contra el texto oficial';
    return 'sin verificar contra el texto oficial';
  };

  /* Parecido entre dos textos, por palabras: 1 es idéntico */
  function parecido(a, b){
    const f = s => L.sinTildes(s).replace(/[^a-z0-9ñ\s]/g,' ').split(/\s+/).filter(w => w.length > 2);
    const x = f(a), y = f(b);
    if (!x.length || !y.length) return 0;
    const sy = new Set(y); let n = 0;
    for (const w of x) if (sy.has(w)) n++;
    return Math.round((2 * n / (x.length + y.length)) * 100);
  }

  /* Palabras que están en uno y no en el otro: para ver dónde difieren */
  function diferencias(nuestro, oficial){
    const f = s => L.sinTildes(s).replace(/[^a-z0-9ñ\s]/g,' ').split(/\s+/).filter(w => w.length > 3);
    const a = new Set(f(nuestro)), b = new Set(f(oficial));
    return { faltan: [...b].filter(w => !a.has(w)).slice(0, 18), sobran: [...a].filter(w => !b.has(w)).slice(0, 18) };
  }

  function pintar(){
    const cont = $('#zonaVigencia');
    if (!cont) return;
    const ver = G.leer('leyVerificados', {}), refs = G.leer('leyReformas', []);
    const nVer = Object.keys(ver).length;
    const pct = Math.round(nVer / FICHA.articulos * 100);
    cont.innerHTML =
      '<div class="tarjeta"><b>' + esc(FICHA.norma) + '</b>' +
      '<p class="ayuda" style="margin:6px 0 0">' + esc(FICHA.fuente) + '. Extraído el ' + esc(FICHA.extraccion) + '. ' +
      FICHA.articulos + ' artículos.</p>' +
      '<div class="medidor' + (pct < 30 ? ' alto' : '') + '" style="margin-top:12px"><i style="width:' + pct + '%"></i></div>' +
      '<p class="ayuda">' + nVer + ' artículos verificados contra el texto oficial (' + pct + '%). ' +
      (pct < 100 ? 'Hasta que estén todos, tratá las citas como referencia y contrastá las que uses en un escrito real.' : '') + '</p>' +
      (refs.length ? '<p class="ayuda"><b>Reformas registradas:</b> ' + refs.map(r => 'art. ' + r.n + ' por ' + esc(r.por)).join(' · ') + '</p>' : '') +
      '</div>' +
      '<div class="tarjeta"><h3>Verificar un artículo</h3>' +
      '<div class="campo"><span>Número de artículo</span><input type="text" id="vNum" placeholder="209" inputmode="numeric"></div>' +
      '<div id="vNuestro"></div>' +
      '<div class="campo"><span>Texto oficial (pegalo del Boletín Oficial)</span><textarea id="vOficial" style="min-height:110px"></textarea></div>' +
      '<div class="acciones"><button class="principal" id="vComparar">Comparar</button></div>' +
      '<div id="vResultado"></div></div>' +
      '<div class="tarjeta"><h3>Registrar una reforma</h3>' +
      '<div class="campo"><span>Artículo reformado</span><input type="text" id="rNum" inputmode="numeric"></div>' +
      '<div class="campo"><span>Norma que lo reforma</span><input type="text" id="rPor" placeholder="Ley N° …, del …"></div>' +
      '<div class="acciones"><button class="secundario" id="rGuardar">Registrar reforma</button></div></div>';

    $('#vNum').oninput = () => {
      const a = L.articulo($('#vNum').value);
      $('#vNuestro').innerHTML = a
        ? '<p class="ayuda"><b>Art. ' + a.n + ' ' + esc(a.r) + '</b> — texto actual en la app:</p>' +
          '<p style="font-family:Spectral,Georgia,serif;font-size:14px;line-height:1.55;background:var(--fondo);padding:10px;border-radius:8px">' + esc(a.t) + '</p>'
        : '';
    };
    $('#vComparar').onclick = () => {
      const a = L.articulo($('#vNum').value), of = $('#vOficial').value.trim();
      if (!a || !of){ A.aviso('Indicá el número y pegá el texto oficial.', true); return; }
      const p = parecido(a.t, of), d = diferencias(a.t, of);
      $('#vResultado').innerHTML =
        '<div class="resumenDiag ' + (p >= 97 ? 'bien' : 'mal') + '">Coincidencia: ' + p + '%. ' +
        (p >= 97 ? 'El texto de la app coincide con el oficial.' : 'Hay diferencias: probablemente errores del OCR.') + '</div>' +
        (d.faltan.length ? '<p class="ayuda"><b>En el oficial y no en la app:</b> ' + d.faltan.map(esc).join(', ') + '</p>' : '') +
        (d.sobran.length ? '<p class="ayuda"><b>En la app y no en el oficial:</b> ' + d.sobran.map(esc).join(', ') + '</p>' : '') +
        '<div class="acciones">' +
        (p >= 97 ? '<button class="principal" id="vMarcar">Marcar como verificado</button>'
                 : '<button class="principal" id="vCorregir">Reemplazar por el texto oficial</button>') + '</div>';
      const mk = $('#vMarcar');
      if (mk) mk.onclick = () => { const v = G.leer('leyVerificados', {}); v[a.n] = 1; G.escribir('leyVerificados', v); pintar(); };
      const co = $('#vCorregir');
      if (co) co.onclick = () => {
        const c = G.leer('leyCorrecciones', {}); c[a.n] = of; G.escribir('leyCorrecciones', c);
        const v = G.leer('leyVerificados', {}); v[a.n] = 1; G.escribir('leyVerificados', v);
        aplicarCorrecciones(); A.aviso('Art. ' + a.n + ' corregido y verificado.'); pintar();
      };
    };
    $('#rGuardar').onclick = () => {
      const n = +$('#rNum').value, por = $('#rPor').value.trim();
      if (!L.articulo(n) || !por){ A.aviso('Indicá un artículo existente y la norma que lo reforma.', true); return; }
      const r = G.leer('leyReformas', []); r.push({ n, por, fecha: new Date().toISOString().slice(0,10) });
      G.escribir('leyReformas', r); pintar();
    };
  }

  A.on('abrir', () => {});   // se mantiene suscripto por si hace falta en el futuro
  document.addEventListener('DOMContentLoaded', enganchar);
  function enganchar(){
    const b = $('#irDiagnostico');
    if (b && !b._vig){ b._vig = true; const f = b.onclick; b.onclick = () => { if (f) f(); pintar(); }; }
  }
  enganchar();
  window.LEX = Object.assign(window.LEX || {}, { FICHA_LEY: FICHA, parecidoTextos: parecido, pintarVigencia: pintar });
})();
