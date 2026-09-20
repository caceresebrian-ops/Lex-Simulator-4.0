/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Audiencias reales

   Un banco de desgrabaciones de audiencias reales, para leer cómo se
   litigó de verdad un planteo al lado de tu propio intento. Es la forma
   más rápida de aprender que existe, y la única fuente que no sale de un
   manual: cómo habla un testigo de Chamical, cómo objeta un defensor de
   tu foro, cómo resuelve tu juez.

   Se cargan como texto (pegado, .txt o .pdf) y quedan en el dispositivo.
   Tienen que estar anonimizadas: pasan por el mismo detector de datos
   personales que las causas.
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  const A = window.LEXAPP, L = window.LEX;
  if (!A) return;
  const $ = s => document.querySelector(s);
  const esc = A.esc, G = A.guardado;
  const TOPE = 120000;   // caracteres por desgrabación, para no llenar el almacenamiento

  function pintar(){
    const cont = $('#audContenido');
    if (!cont) return;
    const lista = G.leer('audiencias', []);
    cont.innerHTML =
      '<div class="tarjeta"><h3>Cargar una desgrabación</h3>' +
      '<div class="campo"><span>Título</span><input type="text" id="aTitulo" placeholder="Cautelar por robo — Tribunal de Impugnación"></div>' +
      '<div class="campo"><span>Tipo de audiencia</span><select id="aTipo">' +
        Object.entries(A.MODULOS).map(([k,m]) => '<option value="' + k + '">' + esc(m.nombre) + '</option>').join('') +
        '<option value="otra">Otra</option></select></div>' +
      '<div class="campo"><span>Desgrabación</span><textarea id="aTexto" style="min-height:160px" placeholder="FISCAL: … DEFENSA: … JUEZ: …"></textarea></div>' +
      '<div class="campo"><span>Tus notas</span><textarea id="aNotas" style="min-height:70px" placeholder="Qué funcionó, qué te llamó la atención"></textarea></div>' +
      '<div class="acciones"><button class="principal" id="aGuardar">Revisar y guardar</button></div>' +
      '<div id="aAviso"></div></div>' +
      '<div class="campo"><span>Buscar en el banco</span><input type="text" id="aBuscar" placeholder="arraigo, sugestiva, 128…"></div>' +
      '<div id="aLista">' + lista.map((a,i) =>
        '<div class="fila"><div>' + esc(a.titulo) + '<span>' + esc(A.MODULOS[a.tipo]?.nombre || 'Otra') + ' · ' +
        esc(a.fecha) + ' · ' + a.texto.length.toLocaleString('es-AR') + ' caracteres</span></div>' +
        '<span><button class="plano" data-ver="' + i + '">Ver</button> · <button class="plano" data-borrar="' + i + '">Borrar</button></span></div>').join('') +
      (lista.length ? '' : '<p class="ayuda">Todavía no cargaste ninguna.</p>') + '</div>' +
      '<div id="aVista"></div>';

    $('#aGuardar').onclick = () => {
      const texto = $('#aTexto').value.trim();
      if (texto.length < 200){ A.aviso('Pegá la desgrabación completa.', true); return; }
      /* mismo filtro de privacidad que las causas reales */
      const h = (L.detectarPersonales ? L.detectarPersonales(texto) : []).filter(x => x.riesgo === 'alto');
      if (h.length && confirm(`Se encontraron ${h.length} datos personales de riesgo alto (documentos, teléfonos, expedientes). ¿Reemplazarlos por datos ficticios antes de guardar?`)){
        const r = L.sanear(texto, h);
        guardar(r.texto, h.length);
      } else guardar(texto, 0);
    };
    function guardar(texto, anon){
      const l = G.leer('audiencias', []);
      l.unshift({ titulo: $('#aTitulo').value.trim() || 'Audiencia sin título', tipo: $('#aTipo').value,
                  texto: texto.slice(0, TOPE), notas: $('#aNotas').value.trim(),
                  fecha: new Date().toISOString().slice(0,10) });
      if (!G.escribir('audiencias', l.slice(0, 40))){ A.aviso('No hubo lugar para guardar. Borrá alguna.', true); return; }
      A.aviso('Guardada' + (anon ? ', con ' + anon + ' datos reemplazados.' : '.'));
      pintar();
    }
    $('#aBuscar').oninput = () => {
      const q = L.sinTildes($('#aBuscar').value.trim());
      document.querySelectorAll('#aLista .fila').forEach((f, i) => {
        const a = lista[i];
        f.style.display = !q || L.sinTildes(a.titulo + ' ' + a.texto + ' ' + a.notas).includes(q) ? '' : 'none';
      });
    };
    cont.querySelectorAll('[data-ver]').forEach(b => b.onclick = () => ver(lista[+b.dataset.ver]));
    cont.querySelectorAll('[data-borrar]').forEach(b => b.onclick = () => {
      const l = G.leer('audiencias', []); l.splice(+b.dataset.borrar, 1); G.escribir('audiencias', l); pintar();
    });
  }

  /* La desgrabación al lado de tu último intento del mismo tipo */
  function ver(a){
    const mia = A.S.ultimaDev && A.S.modulo === a.tipo
      ? A.S.registro.filter(r => !r.tiempo).map(r => '<p><b>' + esc(r.quien) + ':</b> ' + esc(r.texto) + '</p>').join('')
      : '';
    const linea = s => esc(s).replace(/^([A-ZÁÉÍÓÚÑ ]{3,22}):/gm, '<b>$1:</b>');
    $('#aVista').innerHTML = '<h3>' + esc(a.titulo) + '</h3>' +
      (a.notas ? '<div class="reco"><b>Tus notas</b><p>' + esc(a.notas) + '</p></div>' : '') +
      '<div class="comparar"><div><h4>La audiencia real</h4><div class="lectura">' +
        linea(a.texto).replace(/\n/g, '<br>') + '</div></div>' +
      (mia ? '<div><h4>Tu último intento</h4><div class="lectura">' + mia + '</div></div>'
           : '<div><h4>Tu último intento</h4><p class="ayuda">Litigá una audiencia de este mismo tipo y vas a poder leerla acá, al lado.</p></div>') +
      '</div>';
    $('#aVista').scrollIntoView({ behavior:'smooth' });
  }

  document.addEventListener('DOMContentLoaded', enganchar);
  function enganchar(){
    const b = $('#irAudiencias');
    if (b) b.onclick = () => { A.ver('audiencias'); pintar(); };
  }
  enganchar();
})();
