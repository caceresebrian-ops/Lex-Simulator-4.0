/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Base de conocimiento
   Normativa: LEY 10.797 — CÓDIGO PROCESAL PENAL DE LA RIOJA (sancionada).
   Técnica:   Baytelman & Duce, "Litigación penal. Juicio oral y prueba"
              Gonzalo Rúa, "Contraexamen" y "Examen directo de testigos"
              Bacigalupo, "Técnica de resolución de casos penales"
   Lógica:    Copi, "Introducción a la lógica", cap. 3 (falacias)

   ATENCIÓN AL ACTUALIZAR: la numeración de la ley sancionada NO coincide con
   la del proyecto 2022. El bloque de coerción (115-132) y la formalización
   (143, 151) conservan su número; la etapa intermedia se corrió +5 y el
   juicio +6. Interrogatorios es el 209, objeciones el 210, declaraciones
   previas el 211 y alegatos el 217.
   ══════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────── 1. CÓDIGO PROCESAL ─────────────────────────── */

const CPP = `
LEY 10.797 — CÓDIGO PROCESAL PENAL DE LA RIOJA. Reglas de la audiencia:

Art. 209 INTERROGATORIOS. Los testigos y peritos, luego de prestar juramento, serán interrogados por
las partes, comenzando por aquella que ofreció la prueba.
· No se podrá autorizar un nuevo interrogatorio después del contraexamen, salvo cuando fuere
  indispensable para considerar información novedosa que no hubiera sido consultada en el directo.
· EXAMEN DIRECTO: no se admitirán preguntas sugestivas o indicativas, salvo que se autorice el
  tratamiento para el testigo hostil, o que se trate de sugestivas introductorias, de transición, o
  por la negación.
· CONTRAEXAMEN: las partes podrán confrontar al testigo o perito con sus propios dichos o con otras
  versiones, a través de preguntas sugestivas DE UN SOLO PUNTO.
· En ningún caso se admitirán preguntas engañosas, repetitivas, ambiguas o destinadas a coaccionar
  ilegítimamente al testigo o perito.
· LAS JUEZAS O JUECES NO PODRÁN FORMULAR PREGUNTAS.

Art. 210 OBJECIONES. Las partes podrán objetar las preguntas inadmisibles INDICANDO EL MOTIVO. El
tribunal hará lugar de inmediato al planteo si fuere manifiesto el exceso, o decidirá luego de
permitir la réplica de la contraparte. El tribunal procurará que no se utilicen las objeciones para
alterar la continuidad de los interrogatorios.

Art. 211 LECTURA DE DECLARACIONES PREVIAS. Cuando sea necesario para demostrar o superar
contradicciones, o fuere indispensable para ayudar a la memoria del testigo o perito, se podrá leer
parte de las declaraciones previas prestadas antes del juicio. Sólo se permitirá que el testigo
efectúe la lectura a viva voz cuando se trate de evidenciar una inconsistencia. Se considera
declaración previa cualquier manifestación dada con anterioridad al juicio, ya sea en un organismo
oficial o en cualquier sede.

Art. 212 DOCUMENTACIÓN Y OBJETOS. Los objetos y evidencias introducidos por testigos y peritos serán
exhibidos a aquellos para su reconocimiento. Sólo podrán incorporarse los objetos que fueran
exhibidos. Las grabaciones y elementos audiovisuales serán reproducidos.

Art. 207 REGLAS. La prueba que sirve de base a la sentencia se produce en la audiencia. Orden de
recepción: fiscalía, querella, defensa.

Art. 208 PERITOS, TESTIGOS E INTÉRPRETES. Los testigos permanecerán incomunicados; el incumplimiento
no impide la declaración pero el tribunal lo apreciará al valorar la prueba. Los peritos podrán
consultar sus informes escritos, pero las conclusiones deberán presentarse oralmente; el informe
escrito no será agregado al debate como prueba. Los peritos serán interrogados bajo las reglas de los
testigos.

Art. 214 DEBER DE TESTIFICAR. Toda persona tiene obligación de concurrir y declarar la verdad de
cuanto conozca y le sea preguntado, y no podrá ocultar hechos. No tendrá obligación de declarar sobre
hechos que le puedan significar responsabilidad penal.

Art. 215 DEBER Y FACULTAD DE ABSTENCIÓN. Podrán abstenerse el cónyuge o conviviente, quienes estén
ligados por especiales vínculos de afecto, y los parientes hasta el 4° grado de consanguinidad y 2°
de afinidad. Se los informa antes de iniciar la declaración y pueden ejercerla aun durante ella,
incluso al momento de responder determinadas preguntas.

Art. 205 INICIO DE LA AUDIENCIA. Abierto el juicio se concede la palabra para las exposiciones
iniciales: fiscalía, querellante, defensa, en ese orden.

Art. 217 ALEGATOS. Terminada la recepción de las pruebas se concede sucesivamente la palabra a la
fiscalía, al querellante y a la defensa. No se podrán leer memoriales, sin perjuicio de la lectura
parcial de notas. Todas las partes podrán replicar, limitándose a refutar argumentos adversos no
discutidos antes; LA ÚLTIMA PALABRA CORRESPONDE A LA DEFENSA. Al finalizar, las partes expresarán sus
peticiones de un modo concreto. Durante la recepción de la prueba la fiscalía podrá solicitar la
absolución, en cuyo caso no se continúa el debate y se dicta sentencia absolutoria inmediata.

Art. 19 APRECIACIÓN DE LAS PRUEBAS. Las pruebas serán valoradas según la sana crítica, observando las
reglas de la lógica, los conocimientos científicos y las máximas de la experiencia. La convicción se
forma de la valoración conjunta y armónica de toda la prueba producida.
Art. 218 DELIBERACIÓN. Valoración integral conforme a la sana crítica.

MEDIDAS DE COERCIÓN
Art. 115 PRINCIPIOS GENERALES. Carácter excepcional, necesario y proporcional. No pueden ser
impuestas de oficio por la jueza o juez.
Art. 116 MEDIDAS DE COERCIÓN. Catálogo, en orden de gravedad: 1) promesa de someterse al
procedimiento y de no obstaculizar la investigación; 2) cuidado o vigilancia de una persona o
institución determinada; 3) presentación periódica; 4) prohibición de salir sin autorización del
ámbito territorial que se determine; 5) retención de documentos de viaje; 6) prohibición de concurrir
a determinadas reuniones o lugares, o de comunicarse con personas determinadas, siempre que no se
afecte el derecho de defensa; 7) abandono inmediato del domicilio, cuando se trate de hechos de
violencia doméstica y la víctima conviva con la persona imputada; 8) caución económica o seguro de
caución; 9) vigilancia mediante dispositivo electrónico de rastreo o posicionamiento; 10) arresto en
su propio domicilio o en el de otra persona; 11) prisión preventiva, en caso de que las medidas
anteriores no fueren suficientes.
ÚLTIMO PÁRRAFO: siempre que el peligro de fuga o de entorpecimiento pueda ser evitado razonablemente
por aplicación de otra medida menos gravosa que la requerida, la jueza o juez DEBERÁ imponer alguna
de las previstas en el artículo, por un plazo predeterminado, en forma individual o combinada.
Art. 124 LIMITACIONES A LA PRISIÓN PREVENTIVA. No procede: 1) si por las características del hecho y
las condiciones personales pudiere resultar de aplicación una condena condicional o alguna modalidad
de ejecución morigerada de la Ley 24.660; 2) en hechos cometidos en ejercicio de la libertad de
expresión o como consecuencia de la crítica en cuestiones públicas; 3) en los delitos de acción
privada; 4) personas mayores de setenta años; 5) mujeres o personas con capacidad de gestar en los
últimos meses de embarazo.
Art. 127 CONDICIONES Y REQUISITOS. Quien la pide debe acreditar elementos de convicción suficientes
sobre la existencia del hecho y la participación, justificar el peligro procesal según las
circunstancias del caso y las personales, e indicar el plazo de duración necesario.
Art. 128 PELIGRO DE FUGA. Pautas, entre otras: 1) ARRAIGO, determinado por el domicilio, residencia
habitual, asiento de la familia y de sus negocios o trabajo, las facilidades para abandonar el país o
permanecer oculto y demás cuestiones que influyan en el arraigo; 2) COMPORTAMIENTO DURANTE EL
PROCEDIMIENTO, en la medida en que indique su voluntad de someterse a la persecución penal, en
particular si incurrió en rebeldía, ocultó información sobre su identidad o domicilio o proporcionó
una falsa.
Art. 129 PELIGRO DE ENTORPECIMIENTO Y RIESGO DE LA VÍCTIMA. Se tendrá en cuenta la existencia de
vehementes indicios que justifiquen la grave sospecha de que la persona imputada:
  1) destruirá, modificará, ocultará, suprimirá o falsificará elementos de prueba;
  2) influirá para que testigos o peritos informen falsamente o se comporten de manera desleal o
     reticente;
  3) inducirá a otros a realizar tales comportamientos;
  4) PRODUCIRÁ ACTOS INTIMIDATORIOS O AMENAZANTES EN CONTRA DE LA VÍCTIMA O DE SU FAMILIA, O
     VIOLATORIOS DE LAS MEDIDAS CAUTELARES IMPUESTAS.
Art. 130 PROCEDIMIENTO. El requerimiento se formula y decide en audiencia, garantizando contradicción,
inmediación, publicidad y celeridad. No puede aplicarse una medida sin expreso pedido del fiscal o el
querellante. El fiscal debe especificar el plazo de duración de la medida y el plazo requerido para
la investigación. Si la persona está previamente detenida, la audiencia se celebra dentro del plazo
máximo de 48 horas desde la detención. Se da al imputado la oportunidad de ser oído, con su defensa
técnica, que también puede cuestionar el lugar y las condiciones de cumplimiento. La resolución
individualiza al imputado, enuncia los hechos, su calificación, las circunstancias que fundan la
medida, el plazo y el lugar de cumplimiento. La prisión preventiva no puede exceder de tres meses;
vencido el plazo, previa audiencia, se decide si corresponde extenderla, y cada renovación tampoco
puede exceder de tres meses.
Art. 131 LÍMITE TEMPORAL A LA PRISIÓN PREVENTIVA.
Art. 132 CESE DE LA PRISIÓN PREVENTIVA.

ETAPA PREPARATORIA E INTERMEDIA
Art. 143 FORMALIZACIÓN DE LA IMPUTACIÓN.
Art. 151 AUDIENCIA DE FORMULACIÓN DE CARGOS. Si el imputado está detenido, dentro de las 48 horas.
Art. 179 DURACIÓN de la etapa preparatoria.
Art. 187 REQUERIMIENTO DE APERTURA A JUICIO (acusación). Procede cuando todas las pruebas, tomadas en
conjunto, justificarían un veredicto condenatorio si no fueran explicadas o contradichas. Contiene la
identificación, la relación precisa y circunstanciada del hecho, la calificación legal, la pretensión
punitiva provisoria y el ofrecimiento de prueba por separado.
Art. 190 CONTROL DE LA ACUSACIÓN. Art. 191 AUDIENCIA. Art. 192 CORRECCIÓN DE VICIOS FORMALES.
Art. 193 LIBERTAD PROBATORIA. Art. 194 ADMISIBILIDAD Y CONVENCIONES PROBATORIAS. Art. 195 DECISIÓN.
Art. 196 APERTURA A JUICIO. Art. 197 SUBSISTENCIA DE LAS MEDIDAS DE COERCIÓN.

GARANTÍAS
Art. 6 SEPARACIÓN DE FUNCIONES. Las juezas y jueces no pueden realizar actos de investigación ni
suplir la actividad de las partes.
Art. 8 ESTADO DE INOCENCIA Y DUDA. En caso de duda debe decidirse lo más favorable al imputado.
Art. 9 LIBERTAD EN EL PROCESO. La persona imputada permanece en libertad durante el proceso;
excepcionalmente puede restringirse, fundándose en la existencia real de peligro de fuga u
obstaculización.
Art. 13 LEGALIDAD Y CARGA DE LA PRUEBA. Incumbe a la acusación la carga de la prueba y en ningún caso
podrá invertirse esta carga probatoria.
`;

/* ─────────────────────────── 2. TÉCNICA ─────────────────────────── */

const TECNICA = `
TÉCNICA DE LITIGACIÓN (Baytelman-Duce; Rúa):

EXAMEN DIRECTO
Objetivos: solventar la credibilidad del testigo; acreditar las proposiciones fácticas de la teoría
del caso; acreditar e introducir prueba material; obtener información para analizar otra prueba.
Estructura: acreditación del testigo (quién es y por qué creerle) y luego el relato de los hechos.
CINE: el examen directo debe instalar la película en la mente del juzgador. Los jueces no conocen el
caso ni tienen expediente. No sirven los relatos vagos y generales ("Pedro apuñaló a Juan") ni las
fórmulas conceptuales abstractas ("él me amenazó"): hace falta imagen mental y detalle sensorial.
DIETA: no se trata de cuánto, sino de qué. Que el testigo diga todo lo que sirve, y ojalá solo eso.
Recomendaciones: lenguaje común; directo al punto; escuchar al testigo; adelantar las debilidades y
explicarlas antes de que lo haga el contraexamen; no leer el examen.

CONTRAEXAMEN
Objetivos: acreditar nuestras propias proposiciones fácticas; desacreditar al testigo; desacreditar
el testimonio; acreditar prueba material propia; obtener inconsistencias con otra prueba.
Herramienta: la sugestiva de un solo punto, corta y afirmativa. Abiertas solo en zonas seguras.
LOS "NO" DEL CONTRAEXAMEN (pérdida de control), según Rúa:
· argumentativas: el rol argumentativo no es del testigo, es de las partes, y recién en la clausura;
· preguntas que empiezan con "por qué" o piden explicación: le devuelven el control al testigo;
· "de pesca": preguntar sin saber la respuesta;
· largas: si anotada ocupa más de un renglón, hay que partirla (suele ser compuesta o confusa);
· con adjetivaciones o calificaciones ("cerca", "rápido", "fuerte"): objetables por vaguedad,
  producen información de baja calidad y le dan al testigo una puerta de escape;
· por conclusiones u opiniones;
· intimidantes: exhiben falta de recursos y hacen perder credibilidad ante el tribunal;
· que asumen hechos aún no acreditados: objetables por capciosas.
LA PREGUNTA DE MÁS: nunca pedirle al testigo la conclusión. La conclusión se guarda para el alegato
de clausura. Se obtiene el material y se corta.

IMPUGNACIÓN CON DECLARACIÓN PREVIA (art. 211) — tres pasos, a fuego lento, sin saltear etapas:
1) FIJAR EL PUNTO: confirmar lo que el testigo acaba de declarar, cerrando toda ventana de escape,
   para que después no diga que lo interpretaron mal. Conviene rematar con una abierta acotada que
   lo haga reafirmar.
2) ACREDITAR LA DECLARACIÓN ANTERIOR: que reconozca que declaró antes, ante quién, cuándo, en qué
   condiciones, y que entonces tenía los hechos más frescos en la memoria.
3) CONFRONTAR con la versión anterior.
La declaración previa no es prueba de lo que afirma. La proposición fáctica que se incorpora es:
"cuando lo tenía todo más fresco, dijo lo contrario de lo que sostiene hoy".

REFRESCAR MEMORIA (distinto de impugnar): requiere un escenario de duda genuino ("no recuerdo"), no
un defecto de litigación. Se da cuenta de la existencia de la declaración previa y se ofrece:
"¿le refrescaría la memoria ver…?". Tiene costo en la credibilidad del testigo.

OBJECIONES (fundamentos):
· SUGESTIVA: en el directo, la pregunta que contiene la respuesta.
· CAPCIOSA O ENGAÑOSA: induce a error a quien responde, favoreciendo a quien la formula.
· COACCIÓN ILEGÍTIMA: hostigamiento o presión abusiva que coarta la libertad de responder. Distinta
  de la coacción legítima que toda sugestiva supone.
· POCO CLARA: confusa (formulación compleja), ambigua (sugiere varias cuestiones), vaga (demasiado
  amplia).
· IMPERTINENTE: test lógico, no de mérito — ¿la respuesta buscada hace más probable o menos probable
  alguna de las teorías del caso en competencia? Si avanza aunque sea mínimamente una teoría del
  caso, es relevante. La duda beneficia a la parte que pregunta.
· OPINIÓN O CONCLUSIÓN DE TESTIGO LEGO: el testigo declara sobre lo que percibió por sus sentidos o
  sobre su propio estado mental. Excepciones: experticia concreta acreditada; y opiniones de sentido
  común basadas en hechos percibidos directamente y útiles para comprender el relato.
· PREGUNTADA Y RESPONDIDA (repetitiva).
· TERGIVERSA LA PRUEBA: le atribuye al testigo o al material algo que no dijo o no dice.
· COMPUESTA: contiene más de un hecho en una sola pregunta.
Objetar es una decisión estratégica, no un reflejo: la objeción también le avisa al tribunal que algo
nos incomoda, e interrumpe nuestro propio ritmo.

TEORÍA DEL CASO
Se litiga con proposiciones fácticas, no con conclusiones jurídicas. Una proposición fáctica es una
afirmación de hecho que, de ser acreditada, satisface un elemento de la teoría jurídica. Cada
proposición debe tener prueba que la sostenga y cada prueba debe servir a una proposición.
Para la calificación (Bacigalupo): determinar y ordenar las acciones de cada interviniente, listar
los tipos penales en consideración y verificar la subsunción antes de comprometerse en la audiencia.
`;

/* ─────────────────────────── 3. LÓGICA Y FALACIAS ─────────────────────────── */
/* Copi distingue falacias de atinencia (premisas no pertinentes) y de ambigüedad
   (un término cambia de sentido dentro del argumento). Lo que sigue traduce cada
   una al fundamento concreto de una objeción del art. 210, o al contraargumento
   del alegato del art. 217.                                                     */

const FALACIAS = [
  {
    id:'pregunta-compleja', nombre:'Pregunta compleja', grupo:'atinencia',
    que:'Se formula la pregunta de modo que presupone la verdad de una conclusión implícita en ella. Su presencia es sospechosa cada vez que viene acompañada de un tajante "sí o no".',
    objecion:'Capciosa, o compuesta: asume un hecho no acreditado',
    planteo:'Objeto la pregunta: presupone un hecho que no está acreditado en esta audiencia. Solicito que se divida.',
    ejemplo:'"¿Cuánto tiempo hace que viene golpeando a su pareja?" presupone que la golpeó alguna vez. Copi da el ejemplo de un abogado que pregunta por ventas incrementadas por publicidad tendenciosa, el testigo dice que no, y el abogado infiere que admitió que la publicidad es tendenciosa.',
    remedio:'Dividir la pregunta: primero acreditar el presupuesto, después preguntar por el hecho. El art. 209 prohíbe las preguntas engañosas, y esta es la forma más común que adoptan.'
  },
  {
    id:'ad-hominem', nombre:'Ad hominem (abusivo y circunstancial)', grupo:'atinencia',
    que:'Se ataca a la persona que afirma algo en lugar de atacar lo que afirma. El carácter personal es lógicamente irrelevante para la verdad de lo que dice.',
    objecion:'Impertinente, o coacción ilegítima (art. 209)',
    planteo:'Objeto: la pregunta no se dirige a los hechos sino a denostar al testigo.',
    ejemplo:'"Usted es un delincuente conocido en el barrio, ¿no es cierto?" sin conexión con el hecho que se juzga.',
    remedio:'IMPORTANTE — Copi señala expresamente que en los tribunales la impugnación de un testigo NO es falaz cuando se muestra que es perjuro o que su testimonio es inconsistente: ahí el ataque sí es atinente porque socava la credibilidad. Pero no basta con afirmar que miente: hay que mostrarlo a partir de su pauta de conducta o de la inconsistencia del testimonio. Esa es la justificación lógica exacta del procedimiento del art. 211 y de los tres pasos de Rúa. Y queda una falacia si de la impugnación se concluye que necesariamente todo lo que afirma es falso.'
  },
  {
    id:'ad-verecundiam', nombre:'Apelación inapropiada a la autoridad', grupo:'atinencia',
    que:'Se invoca a una autoridad fuera de su campo de competencia.',
    objecion:'Opinión o conclusión de testigo lego; perito fuera de su área',
    planteo:'Objeto: se le pide una opinión sobre una materia ajena a la experticia que se acreditó.',
    ejemplo:'Preguntarle al médico legista sobre la mecánica del impacto vehicular, o al preventor sobre la data de la lesión.',
    remedio:'Acreditar primero la experticia concreta en esa materia, o llevar al perito que corresponde. El art. 208 somete a los peritos a las reglas de los testigos y exige que las conclusiones se presenten oralmente.'
  },
  {
    id:'ad-ignorantiam', nombre:'Argumento por la ignorancia', grupo:'atinencia',
    que:'Se sostiene que algo es verdadero porque no se probó que sea falso, o falso porque no se probó que sea verdadero.',
    objecion:'En alegatos, no en preguntas',
    planteo:'La ausencia de prueba de un hecho no acredita el hecho contrario.',
    ejemplo:'"Nadie declaró que mi defendido no estuviera ahí, luego estaba."',
    remedio:'Ojo — en el proceso penal hay una asimetría deliberada: el estado de inocencia del art. 8 y la carga de la prueba del art. 13, que en ningún caso puede invertirse, hacen que la falta de prueba de cargo SÍ deba resolverse a favor del imputado. Eso no es una falacia, es una regla de carga probatoria. La falacia aparece cuando la acusación invierte la carga, o cuando la defensa la usa para dar por acreditado un hecho positivo propio.'
  },
  {
    id:'peticion-principio', nombre:'Petición de principio (petitio principii)', grupo:'atinencia',
    que:'Se asume en las premisas lo que se pretende probar en la conclusión.',
    objecion:'Tergiversa la prueba, o asume hechos no acreditados',
    planteo:'Objeto: la pregunta da por probado justamente lo que es materia de debate.',
    ejemplo:'"Cuando el imputado le sustrajo el teléfono, ¿usted gritó?" cuando la sustracción es el hecho controvertido.',
    remedio:'Formular en términos neutros lo que todavía se discute.'
  },
  {
    id:'causa-falsa', nombre:'Causa falsa (post hoc ergo propter hoc)', grupo:'atinencia',
    que:'Se toma por causa lo que solo es antecedente temporal.',
    objecion:'En alegatos y en el contraexamen de peritos',
    planteo:'La secuencia no acredita la causalidad.',
    ejemplo:'"Discutieron a las 22 y a las 23 apareció la lesión, luego él la lesionó."',
    remedio:'Exigirle al perito el nexo, no la cronología: qué otras causas compatibles descartó y cómo. Como el art. 208 manda que las conclusiones se presenten oralmente, el nexo se interroga en la audiencia y no queda escondido en el informe escrito.'
  },
  {
    id:'accidente', nombre:'Accidente y accidente inverso', grupo:'atinencia',
    que:'Accidente: aplicar una generalización a un caso particular al que no alcanza. Accidente inverso: generalizar apresuradamente desde un caso atípico.',
    objecion:'En alegatos',
    planteo:'La regla general no cubre este caso, o este caso no funda la regla.',
    ejemplo:'"Las víctimas de violencia siempre se retractan, luego esta retractación no vale" es accidente inverso: convierte una tendencia en ley y omite examinar esta retractación.',
    remedio:'Bajar de la máxima de la experiencia al dato del caso, que es exactamente lo que exige el art. 19 al mandar valorar según las máximas de la experiencia junto con el resto de la prueba.'
  },
  {
    id:'ignoratio-elenchi', nombre:'Conclusión inatinente (ignoratio elenchi)', grupo:'atinencia',
    que:'Se prueba algo distinto de lo que había que probar.',
    objecion:'Impertinente o irrelevante',
    planteo:'Objeto por impertinente: la respuesta no hace más ni menos probable ninguna de las teorías del caso.',
    ejemplo:'Acreditar largamente que el imputado tiene mala fama cuando lo que se discute es si estuvo en el lugar.',
    remedio:'Es el mismo test que usan Baytelman y Duce para la pertinencia, y el que rige la admisibilidad probatoria del art. 194.'
  },
  {
    id:'ad-misericordiam', nombre:'Apelación a la piedad (ad misericordiam)', grupo:'atinencia',
    que:'Se sustituye la prueba por la compasión.',
    objecion:'Impertinente',
    planteo:'Objeto: la pregunta busca conmover, no acreditar.',
    ejemplo:'Interrogar largamente sobre los hijos pequeños del imputado mientras se discute la autoría.',
    remedio:'Ese material es pertinente en el juicio sobre la pena del art. 203 o en la audiencia de cautelar del art. 130, no para acreditar el hecho.'
  },
  {
    id:'ad-populum', nombre:'Apelación a la multitud (ad populum)', grupo:'atinencia',
    que:'Se apela al sentir general en lugar de a la prueba.',
    objecion:'Impertinente, o prueba que procura generar prejuicio (art. 194)',
    planteo:'Objeto: se invoca la alarma social, no la prueba del hecho.',
    ejemplo:'"Todo el barrio sabe lo que pasó esa noche."',
    remedio:'Exigir la fuente de conocimiento directa de cada afirmación.'
  },
  {
    id:'ad-baculum', nombre:'Apelación a la fuerza (ad baculum)', grupo:'atinencia',
    que:'Se sustituye la razón por la amenaza.',
    objecion:'Coacción ilegítima (art. 209)',
    planteo:'Objeto: la pregunta contiene una advertencia dirigida a condicionar la respuesta.',
    ejemplo:'"Sepa que mentir acá es un delito. Ahora le vuelvo a preguntar…"',
    remedio:'La coacción legítima que toda sugestiva supone no llega a la advertencia personal. El art. 209 prohíbe expresamente las preguntas destinadas a coaccionar ilegítimamente al testigo o perito.'
  },
  {
    id:'equivoco', nombre:'Equívoco', grupo:'ambigüedad',
    que:'Un término se usa con dos sentidos distintos dentro del mismo razonamiento.',
    objecion:'Ambigua (art. 209)',
    planteo:'Objeto por ambigua: el término admite dos sentidos y no se precisa cuál se indaga.',
    ejemplo:'"Arma" como arma de fuego apta y como cualquier objeto contundente. O "lo tenía" como tenencia material y como disponibilidad.',
    remedio:'Definir el término en la pregunta anterior y recién después preguntar.'
  },
  {
    id:'anfibologia', nombre:'Anfibología', grupo:'ambigüedad',
    que:'La ambigüedad no está en la palabra sino en la construcción sintáctica.',
    objecion:'Ambigua o confusa',
    planteo:'Objeto: la pregunta admite dos lecturas.',
    ejemplo:'"¿Vio al hombre que corría con el arma en la mano?" — no se sabe si el arma estaba en la mano del que corría o del testigo.',
    remedio:'Partir la oración. Una pregunta, un hecho.'
  },
  {
    id:'acento', nombre:'Acento', grupo:'ambigüedad',
    que:'Se cambia el sentido cambiando el énfasis, o citando de forma recortada.',
    objecion:'Tergiversa la prueba',
    planteo:'Objeto: se lee la declaración previa recortada, alterando su sentido.',
    ejemplo:'Leer "no estaba seguro" omitiendo que la frase seguía "…hasta que lo vi de frente".',
    remedio:'Exigir la lectura del pasaje completo. El art. 211 autoriza leer parte de la declaración previa para demostrar o superar contradicciones, no para fabricarlas. Es la defensa más común cuando nos impugnan con una previa.'
  },
  {
    id:'composicion', nombre:'Composición', grupo:'ambigüedad',
    que:'Se atribuye al todo lo que vale para las partes.',
    objecion:'En alegatos',
    planteo:'Que cada indicio sea equívoco no significa que el conjunto lo sea, pero tampoco al revés.',
    ejemplo:'"Cada uno de estos indicios es débil, luego el cuadro indiciario es débil."',
    remedio:'El art. 19 manda formar convicción de la valoración conjunta y armónica de toda la prueba, no indicio por indicio aislado.'
  },
  {
    id:'division', nombre:'División', grupo:'ambigüedad',
    que:'Se atribuye a las partes lo que vale para el todo.',
    objecion:'En alegatos',
    planteo:'Del peso del conjunto no se sigue el peso de cada elemento.',
    ejemplo:'"El cuadro probatorio es contundente, luego este testigo es creíble."',
    remedio:'Cada proposición fáctica necesita su propia prueba.'
  }
];

/* Resumen compacto para inyectar en los prompts del modelo */
const LOGICA = `
LÓGICA ARGUMENTATIVA APLICADA A LA OBJECIÓN (Copi, cap. 3):
El art. 210 exige indicar el motivo de la objeción, y el motivo es más fuerte cuando se identifica la
falacia que hay debajo. Correspondencias:
` + FALACIAS.map(f => `· ${f.nombre} → ${f.objecion}. ${f.que} Planteo: "${f.planteo}"`).join('\n') + `

Advertencia central de Copi para el contraexamen: impugnar a un testigo NO es un ad hominem falaz si
se lo hace mostrando su pauta de conducta o la inconsistencia de su testimonio; sí lo es si uno se
limita a afirmar que miente, o si de la impugnación se concluye que todo lo que dijo es falso.
`;

if (typeof window !== 'undefined') {
  window.LEX = Object.assign(window.LEX || {}, { CPP, TECNICA, LOGICA, FALACIAS });
}
