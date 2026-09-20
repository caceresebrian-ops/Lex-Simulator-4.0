/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Preparación del testigo

   En la realidad uno prepara a su testigo antes de la audiencia. Este
   módulo es ese ensayo: le hacés preguntas a tu propio testigo, en
   privado, para descubrir sus puntos débiles antes de que los encuentre
   la contraparte.

   El objetivo pedagógico es el de Baytelman: adelantar la debilidad. Lo
   que descubrís acá lo sacás vos primero en el examen directo, y así el
   golpe del contraexamen llega amortiguado.

   El testigo, en preparación, no se guarda nada: si le preguntás bien,
   te lo cuenta. Lo que se evalúa es si supiste preguntarle.
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  const A = window.LEXAPP;
  if (!A) return;
  const L = window.LEX;
  const E = { descubiertos:new Set(), preguntas:0 };

  function puntosDe(caso){ return (caso.sobre && caso.sobre.puntos) || []; }

  const def = {
    modulo: { nombre:'Preparar testigo', pista:'ensayo privado antes de la audiencia', tipo:'audiencia', testigo:true,
              reglas:'Ensayo con el testigo propio para detectar debilidades antes de la audiencia.' },
    plugin: {
      casos: c => !!(c.banco && c.banco.length && c.testigo),
      abrir(S){
        E.descubiertos = new Set(); E.preguntas = 0;
        const p = document.querySelector('#pregunta');
        if (p) p.placeholder = 'Preguntale a tu testigo, en privado…';
        A.marca('Preparación privada. El testigo te cuenta lo que le preguntes: buscá dónde flaquea.');
      },
      async turno(txt){
        E.preguntas++;
        const S = A.S, caso = S.caso;
        const an = L.analizar(txt, 'directo', S.previas || []);
        const ind = A.pensando('TESTIGO'); await A.demora(1500); ind.remove();

        /* En preparación el testigo colabora: si la pregunta roza un punto
           débil, lo confiesa, porque sabe que su abogado lo necesita saber. */
        let revelo = null;
        for (const p of puntosDe(caso)){
          if (E.descubiertos.has(p)) continue;
          const tp = L.fichas(p), tq = new Set(L.fichas(txt));
          const comunes = tp.filter(w => tq.has(w)).length;
          if (comunes >= 2 || (comunes >= 1 && tp.length <= 4)){ revelo = p; break; }
        }
        let texto;
        if (revelo){
          E.descubiertos.add(revelo);
          texto = 'Mire, doctor, le tengo que decir algo: ' + revelo.charAt(0).toLowerCase() + revelo.slice(1).replace(/\.$/, '') +
                  '. No sé si eso me va a complicar.';
          S.registro.push({ quien:'TESTIGO', texto, revelo:true });
        } else {
          const est = S.estado || { desdeUltimaObjecion:9, dichos:new Set() };
          const r = L.responderOffline(caso, an, est);
          texto = r.texto;
          S.registro.push({ quien:'TESTIGO', texto });
        }
        A.turno('TESTIGO', texto, '');
        if (revelo) A.aviso('Descubriste un punto débil. Anotalo: vas a tener que adelantarlo en el directo.');
      },
      informe(S, seg){
        const puntos = puntosDe(S.caso);
        const hallados = puntos.filter(p => E.descubiertos.has(p));
        const faltan = puntos.filter(p => !E.descubiertos.has(p));
        const r1 = x => Math.round(x*10)/10;
        const tasa = puntos.length ? hallados.length / puntos.length : 1;
        const ejes = [
          { eje:'Debilidades descubiertas', puntaje: r1(tasa*10),
            comentario:`Encontraste ${hallados.length} de ${puntos.length} puntos débiles de tu testigo antes de la audiencia.` },
          { eje:'Economía del ensayo', puntaje: r1(Math.max(2, 10 - Math.max(0, E.preguntas - 15) * 0.4)),
            comentario:`${E.preguntas} preguntas de ensayo. Una preparación larga no es mejor: lo que importa es ir a los puntos de riesgo.` }
        ];
        return {
          global: r1(ejes.reduce((a,e)=>a+e.puntaje,0)/ejes.length), ejes,
          aciertos: hallados.map(p => 'Detectaste a tiempo: ' + p),
          correcciones: hallados.map(p => ({
            tuya: 'Debilidad detectada: ' + p,
            problema: 'Si no la sacás vos, la saca la contraparte en el contraexamen.',
            mejor: 'Adelantala en tu examen directo con una pregunta abierta sobre ese punto, para que el testigo la explique con sus palabras antes de que se la echen en cara.'
          })),
          perdido: faltan.map(p => 'No lo descubriste en el ensayo: ' + p),
          veredicto: faltan.length
            ? `Te quedaron ${faltan.length} debilidades sin detectar. En la audiencia te van a sorprender.`
            : 'Encontraste todas las debilidades. Ahora el trabajo es adelantarlas en el directo.'
        };
      }
    }
  };
  A.modulo('preparacion', def);
})();
