/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Objetar

   Media técnica del litigio está del otro lado: cuando interroga la
   contraparte, sos vos el que tiene que objetar. Acá la contraparte hace
   el examen directo de su testigo, mezclando preguntas correctas con
   preguntas defectuosas, y vos decidís en el momento:

     · "adelante" (o "sin objeción") para dejarla pasar;
     · "objeción, <motivo>" para objetar.

   Se evalúa si objetaste lo objetable, si nombraste bien el motivo, y si
   dejaste pasar lo correcto. Objetar todo también es un error: interrumpe
   el propio ritmo y le avisa al tribunal que algo te incomoda.
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  const A = window.LEXAPP;
  if (!A) return;
  const L = window.LEX;

  /* Motivos que el usuario puede invocar, con las palabras que los delatan */
  const MOTIVOS = {
    sugestiva:  /sugestiv|indicativ|contiene la respuesta/,
    compuesta:  /compuest|dos (hechos|preguntas)|doble/,
    asume:      /asume|presupone|capcios|no acreditad|engañ/,
    opinion:    /opini|conclus|especul|lego/,
    repetitiva: /repetit|ya (fue|la) (formulad|respondid|contest)|preguntada y respondida/,
    vaguedad:   /ambig|vag|confus|imprecis/,
    impertinente:/impertinen|irrelevan|no hace al caso|no guarda relaci/,
    coaccion:   /coacci|intimid|presion|amenaz|hostig/
  };
  const NOMBRE = {
    sugestiva:'sugestiva', compuesta:'compuesta', asume:'asume hechos no acreditados',
    opinion:'pide opinión a un testigo lego', repetitiva:'repetitiva', vaguedad:'ambigua o vaga',
    impertinente:'impertinente', coaccion:'coactiva'
  };

  /* Arma el interrogatorio de la contraparte a partir del caso: preguntas
     correctas sacadas del banco del testigo, y defectuosas construidas a
     propósito sobre los mismos hechos.                                  */
  function armarInterrogatorio(caso){
    const banco = (caso.banco || []).filter(b => !b.reservado);
    const tema = i => (banco[i % Math.max(1, banco.length)] || {}).claves || 'lo que pasó';
    const palabra = i => tema(i).split(' ')[0];
    const nombre = caso.testigo?.nombre || 'usted';
    const serie = [
      { q:'¿Cómo se llama usted?', d:null },
      { q:'¿A qué se dedica?', d:null },
      { q:`¿Dónde estaba usted esa noche?`, d:null },
      { q:`Usted vio perfectamente todo lo que pasó, ¿no es cierto?`, d:'sugestiva' },
      { q:`¿Qué fue lo que vio en ese momento?`, d:null },
      { q:`¿Dónde estaba y qué hora era cuando empezó todo?`, d:'compuesta' },
      { q:`¿Qué cree usted que tenía en mente el imputado?`, d:'opinion' },
      { q:`¿Qué hizo después?`, d:null },
      { q:`Cuando el imputado lo amenazó, ¿qué sintió usted?`, d:'asume' },
      { q:`¿Qué fue lo que vio en ese momento?`, d:'repetitiva' },
      { q:`¿Cuál es su equipo de fútbol preferido?`, d:'impertinente' },
      { q:`¿Estaba cerca o lejos, más o menos?`, d:'vaguedad' },
      { q:`¿A quién le contó lo que había pasado?`, d:null }
    ];
    return serie;
  }

  function interpretar(txt){
    const t = L.sinTildes(txt);
    const objeta = /^\s*(objecion|objeto|me opongo|objetamos)/.test(t);
    if (!objeta) return { objeta:false };
    for (const [id, re] of Object.entries(MOTIVOS)) if (re.test(t)) return { objeta:true, motivo:id };
    return { objeta:true, motivo:null };
  }

  const E = { serie:[], i:0, res:[] };

  function siguiente(){
    const otro = A.otroDe(A.S.rol);
    if (E.i >= E.serie.length){
      A.marca('La contraparte concluye su examen.');
      A.aviso('Terminó el interrogatorio. Levantá la audiencia para ver la evaluación.');
      return;
    }
    const p = E.serie[E.i];
    A.turno(otro + ' (interroga)', p.q, 'objecion');
    A.S.registro.push({ quien: otro, texto: p.q, pregunta: E.i });
  }

  const def = {
    modulo: { nombre:'Objetar', pista:'la contraparte interroga, vos objetás', tipo:'audiencia', testigo:true,
              reglas:'La contraparte examina a su testigo. El usuario decide si objeta y por qué motivo (arts. 209 y 210).' },
    plugin: {
      casos: c => !!(c.banco && c.banco.length && c.testigo),
      abrir(S){
        E.serie = armarInterrogatorio(S.caso); E.i = 0; E.res = [];
        const p = document.querySelector('#pregunta');
        if (p) p.placeholder = 'Escribí "adelante" o "objeción, sugestiva"…';
        A.marca('La contraparte interroga a su testigo. Vos podés objetar.');
        setTimeout(siguiente, 900);
      },
      async turno(txt){
        const p = E.serie[E.i];
        if (!p) return;
        const r = interpretar(txt);
        const acierto = r.objeta === !!p.d;
        const motivoOk = r.objeta && p.d && r.motivo === p.d;
        E.res.push({ pregunta:p.q, defecto:p.d, objeto:r.objeta, motivo:r.motivo, acierto, motivoOk, dijo:txt });

        await A.demora(800);
        if (r.objeta){
          const haLugar = !!p.d;
          const texto = haLugar
            ? (r.motivo === p.d ? 'Ha lugar. ' : 'Ha lugar, aunque el motivo correcto es otro. ') + 'Reformule la pregunta.'
            : 'No ha lugar. La pregunta es admisible. Puede responder el testigo.';
          A.turno('JUEZ', texto, 'juez');
          A.S.registro.push({ quien:'JUEZ', texto });
          if (!haLugar){
            await A.demora(1300);
            A.turno('TESTIGO', 'Sí, así fue.', '');
          }
        } else {
          await A.demora(1400);
          A.turno('TESTIGO', p.d === 'impertinente' ? 'River, de toda la vida.' : 'Sí, eso es lo que recuerdo.', '');
        }
        E.i++;
        await A.demora(1100);
        siguiente();
      },
      informe(S, seg){
        const total = E.res.length || 1;
        const defect = E.res.filter(x => x.defecto);
        const buenas = E.res.filter(x => !x.defecto);
        const cazadas = defect.filter(x => x.objeto).length;
        const conMotivo = defect.filter(x => x.motivoOk).length;
        const falsas = buenas.filter(x => x.objeto).length;
        const r1 = x => Math.round(x*10)/10;
        const ejes = [
          { eje:'Detección de preguntas objetables', puntaje: r1(defect.length ? cazadas/defect.length*10 : 10),
            comentario:`Objetaste ${cazadas} de ${defect.length} preguntas objetables.` },
          { eje:'Motivo correctamente invocado (art. 210)', puntaje: r1(cazadas ? conMotivo/cazadas*10 : 0),
            comentario:`El art. 210 exige indicar el motivo. Acertaste el motivo en ${conMotivo} de ${cazadas} objeciones.` },
          { eje:'No objetar lo admisible', puntaje: r1(buenas.length ? (1 - falsas/buenas.length)*10 : 10),
            comentario: falsas ? `Objetaste ${falsas} pregunta${falsas>1?'s':''} correcta${falsas>1?'s':''}. Eso interrumpe tu ritmo y le avisa al tribunal que algo te incomoda.`
                               : 'No objetaste ninguna pregunta correcta.' }
        ];
        const correcciones = E.res.filter(x => !x.acierto || (x.objeto && x.defecto && !x.motivoOk)).slice(0, 8).map(x => ({
          tuya: x.pregunta + '  →  dijiste: "' + x.dijo + '"',
          problema: !x.defecto ? 'La pregunta era admisible y la objetaste.'
                  : !x.objeto ? 'Dejaste pasar una pregunta ' + NOMBRE[x.defecto] + '.'
                  : 'Objetaste bien, pero el motivo era: ' + NOMBRE[x.defecto] + '.',
          mejor: x.defecto ? `"Objeción, su señoría: la pregunta es ${NOMBRE[x.defecto]}."` : '"Adelante" — no había nada que objetar.'
        }));
        const global = r1(ejes.reduce((a,e)=>a+e.puntaje,0)/ejes.length);
        return { global, ejes, correcciones,
          aciertos: cazadas ? [`Detectaste ${cazadas} de ${defect.length} preguntas objetables.`] : [],
          perdido: [],
          veredicto: `Hubo ${defect.length} preguntas objetables y ${buenas.length} admisibles. ` +
            (falsas > 1 ? 'Objetaste de más: la objeción es una decisión estratégica, no un reflejo. ' : '') +
            (cazadas < defect.length ? 'Se te escaparon algunas que convenía frenar.' : 'No se te escapó ninguna.') };
      }
    }
  };
  A.modulo('objetar', def);
  window.LEX = Object.assign(window.LEX || {}, { interpretarObjecion: interpretar, armarInterrogatorio });
})();
