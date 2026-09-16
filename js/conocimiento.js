/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Base de conocimiento
   Destilada de:
     · Proyecto de Código Procesal Penal de La Rioja (2022)
     · Baytelman & Duce, "Litigación penal. Juicio oral y prueba"
     · Gonzalo Rúa, "Contraexamen de testigos" / "Examen directo de testigos"
     · Bacigalupo, "Técnica de resolución de casos penales"
     · Copi, "Introducción a la lógica", cap. 3 (falacias)
   ══════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────── 1. CÓDIGO PROCESAL ─────────────────────────── */

const CPP = `
CÓDIGO PROCESAL PENAL DE LA RIOJA (Proyecto 2022) — reglas de la audiencia:

Art. 203 INTERROGATORIOS. Testigos y peritos, tras prestar juramento, son interrogados por las
partes, comenzando por la que ofreció la prueba. No se autoriza un nuevo interrogatorio después del
contraexamen salvo que sea indispensable por información novedosa no consultada en el directo.
· EXAMEN DIRECTO: no se admiten preguntas sugestivas ni indicativas, salvo que se autorice el
  tratamiento de testigo hostil, o que se trate de sugestivas introductorias, de transición, o por
  la negación.
· CONTRAEXAMEN: las partes pueden confrontar al testigo con sus propios dichos o con otras
  versiones, mediante preguntas sugestivas DE UN SOLO PUNTO.
· En ningún caso se admiten preguntas engañosas, repetitivas, ambiguas o destinadas a coaccionar
  ilegítimamente al testigo o perito.
· LAS JUEZAS O JUECES NO PUEDEN FORMULAR PREGUNTAS.

Art. 204 OBJECIONES. Las partes objetan las preguntas inadmisibles INDICANDO EL MOTIVO. El tribunal
hace lugar de inmediato si el exceso es manifiesto, o decide luego de permitir la réplica de la
contraparte. Procura que las objeciones no se usen para alterar la continuidad del interrogatorio.

Art. 205 LECTURA DE DECLARACIONES PREVIAS. Cuando sea necesario para demostrar o superar
contradicciones, o indispensable para ayudar a la memoria, se puede leer parte de las declaraciones
previas. Solo se permite que el testigo lea la declaración a viva voz cuando se trata de evidenciar
una inconsistencia. Es declaración previa cualquier manifestación dada antes del juicio, en un
organismo oficial o en cualquier sede.

Art. 206 DOCUMENTACIÓN Y OBJETOS. Los objetos y evidencias se exhiben al testigo o perito para su
reconocimiento. Solo se incorporan al juicio los objetos que fueron exhibidos. Las grabaciones se
reproducen.

Art. 201 Orden de la prueba: fiscalía, querella, defensa. La prueba que sirve de base a la sentencia
se produce en la audiencia; se valoran los dichos vertidos en ella. Solo se incorpora por lectura la
prueba recibida como anticipo jurisdiccional, la acordada por las partes o la admitida por estar
suficientemente estandarizada.

Art. 202 Los peritos pueden consultar sus informes, pero las conclusiones se presentan oralmente; el
informe escrito no se agrega como prueba. Se los interroga bajo las reglas de los testigos.

Art. 209 Pueden abstenerse de declarar el cónyuge o conviviente, quienes estén ligados por especiales
vínculos de afecto, y los parientes hasta 4° grado de consanguinidad y 2° de afinidad. Se los informa
antes de declarar y pueden ejercer la facultad incluso al responder preguntas determinadas.

Art. 199 Abierto el juicio, se cede la palabra para las exposiciones iniciales: fiscalía, querellante,
defensa, en ese orden. El imputado puede declarar cuando lo considere oportuno y las partes pueden
formularle preguntas.

Art. 211 ALEGATOS. Orden: fiscalía, querella, defensa. No se pueden leer memoriales, sin perjuicio de
la lectura parcial de notas. Todas las partes pueden replicar, limitándose a refutar argumentos
adversos no discutidos antes; la última palabra corresponde a la defensa. Al finalizar, las partes
expresan sus peticiones de modo concreto.

Art. 19 y 212 Las pruebas se valoran de modo integral según las reglas de la sana crítica.

MEDIDAS DE COERCIÓN
Art. 115 Excepcionales, necesarias y proporcionales; no pueden imponerse de oficio.
Art. 116 Catálogo, en orden de gravedad: promesa de someterse al proceso; cuidado o vigilancia de
persona o institución; presentación periódica; prohibición de salir del ámbito territorial; retención
de documentos de viaje; prohibición de concurrir a lugares o comunicarse con personas; abandono del
domicilio en casos de violencia doméstica; caución económica o seguro de caución; dispositivo
electrónico de rastreo; arresto domiciliario; y en último lugar la prisión preventiva, solo si las
anteriores no alcanzan. Si el peligro puede evitarse razonablemente con una medida menos gravosa, la
jueza o juez DEBE imponer esa, por un plazo predeterminado, individual o combinada.
Art. 124 No procede la prisión preventiva si pudiera aplicarse condena condicional o ejecución
morigerada; en hechos cometidos en ejercicio de la libertad de expresión; en delitos de acción
privada; a mayores de 70 años; en los últimos meses de embarazo; durante el primer año de lactancia;
ante enfermedad grave y riesgosa; o cuando no haya peligro cierto de fuga o entorpecimiento.
Art. 127 Quien la pide debe: 1) acreditar elementos de convicción suficientes sobre la existencia del
hecho y la participación; 2) justificar el peligro con arreglo a las circunstancias del caso y las
personales; 3) indicar el plazo de duración necesario.
Art. 128 PELIGRO DE FUGA: arraigo (domicilio, residencia habitual, asiento de la familia, negocios o
trabajo, facilidades para abandonar el país u ocultarse) y comportamiento durante el procedimiento
(rebeldía, ocultamiento o falsedad sobre identidad o domicilio).
Art. 129 PELIGRO DE ENTORPECIMIENTO: indicios de grave sospecha de que destruirá, modificará,
ocultará, suprimirá o falsificará prueba; influirá para que testigos o peritos informen falsamente o
se comporten de manera desleal o reticente; o inducirá a otros a ello.
Art. 130 Se decide en audiencia, con contradicción e inmediación; nunca sin pedido expreso de parte.
Si la persona está detenida, la audiencia se celebra dentro de las 48 horas. El fiscal debe
especificar el plazo de la medida y el de la investigación. La prisión preventiva no puede fijarse
por más de 3 meses, renovables por igual plazo previa audiencia. Revisable ante el Tribunal de
Impugnación dentro de las 72 horas, sin efecto suspensivo.
Art. 131 Tope de 2 años; 3 años si hay condena no firme a 5 años o más.
Art. 132 Cese de la prisión preventiva: vencido el plazo de la investigación sin acusación; sin
audiencia de juicio en plazo; sin resolverse la impugnación en 6 meses; cumplida en preventiva la
pena pedida por el fiscal o la impuesta por sentencia no firme; agotado el tiempo que habilitaría la
libertad condicional o asistida; o alcanzado el mínimo de la escala penal aplicable.

ETAPA PREPARATORIA Y CONTROL
Art. 143 y 151 Formalización de la imputación y audiencia de formulación de cargos: individualizar al
imputado, el hecho, fecha y lugar, calificación, grado de participación y la información que lo
sustenta; fijar el plazo de la investigación. Si está detenido, dentro de las 48 horas.
Art. 174 La etapa preparatoria dura como máximo 4 meses, prorrogables.
Art. 182 ACUSACIÓN. Procede cuando todas las pruebas, tomadas en conjunto, justificarían un veredicto
condenatorio si no fueran explicadas o contradichas en la audiencia. Contiene: identificación,
relación precisa y circunstanciada del hecho, calificación legal, pretensión punitiva provisoria y
ofrecimiento de prueba por separado.
Art. 186 a 190 CONTROL DE LA ACUSACIÓN. La defensa puede objetar por defectos formales, oponer
excepciones, pedir saneamiento o invalidez, proponer reparación, instar el sobreseimiento y pedir la
revisión de la cautelar. Solo se excluye la prueba impertinente por ajena al objeto procesal, la que
procura generar prejuicio en el juzgador, la sobreabundante, la que acredita hechos notorios y la
proveniente de actuaciones inválidas o con inobservancia de garantías.
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

IMPUGNACIÓN CON DECLARACIÓN PREVIA — tres pasos, a fuego lento, sin saltear etapas:
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
· CAPCIOSA O ENGAÑOSA: induce a error a quien responde, favoreciendo a quien la formula. Es el género
  que cubre a muchas otras. Produce información de baja calidad.
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
   una al fundamento concreto de una objeción del art. 204, o al contraargumento
   del alegato.                                                                  */

const FALACIAS = [
  {
    id:'pregunta-compleja', nombre:'Pregunta compleja', grupo:'atinencia',
    que:'Se formula la pregunta de modo que presupone la verdad de una conclusión implícita en ella. Su presencia es sospechosa cada vez que viene acompañada de un tajante "sí o no".',
    objecion:'Capciosa, o compuesta: asume un hecho no acreditado',
    planteo:'Objeto la pregunta: presupone un hecho que no está acreditado en esta audiencia. Solicito que se divida.',
    ejemplo:'"¿Cuánto tiempo hace que viene golpeando a su pareja?" presupone que la golpeó alguna vez. Copi da el ejemplo de un abogado que pregunta por ventas incrementadas por publicidad tendenciosa, el testigo dice que no, y el abogado infiere que admitió que la publicidad es tendenciosa.',
    remedio:'Dividir la pregunta: primero acreditar el presupuesto, después preguntar por el hecho.'
  },
  {
    id:'ad-hominem', nombre:'Ad hominem (abusivo y circunstancial)', grupo:'atinencia',
    que:'Se ataca a la persona que afirma algo en lugar de atacar lo que afirma. El carácter personal es lógicamente irrelevante para la verdad de lo que dice.',
    objecion:'Impertinente, o coacción ilegítima',
    planteo:'Objeto: la pregunta no se dirige a los hechos sino a denostar al testigo.',
    ejemplo:'"Usted es un delincuente conocido en el barrio, ¿no es cierto?" sin conexión con el hecho que se juzga.',
    remedio:'IMPORTANTE — Copi señala expresamente que en los tribunales la impugnación de un testigo NO es falaz cuando se muestra que es perjuro o que su testimonio es inconsistente: ahí el ataque sí es atinente porque socava la credibilidad. Pero no basta con afirmar que miente: hay que mostrarlo a partir de su pauta de conducta o de la inconsistencia del testimonio. Esa es la justificación lógica exacta de los tres pasos de impugnación con declaración previa. Y queda una falacia si de la impugnación se concluye que necesariamente lo que afirma es falso.'
  },
  {
    id:'ad-verecundiam', nombre:'Apelación inapropiada a la autoridad', grupo:'atinencia',
    que:'Se invoca a una autoridad fuera de su campo de competencia.',
    objecion:'Opinión o conclusión de testigo lego; perito fuera de su área de experticia',
    planteo:'Objeto: se le pide una opinión sobre una materia ajena a la experticia que se acreditó.',
    ejemplo:'Preguntarle al médico legista sobre la mecánica del impacto vehicular, o al preventor sobre la data de la lesión.',
    remedio:'Acreditar primero la experticia concreta en esa materia, o llevar al perito que corresponde.'
  },
  {
    id:'ad-ignorantiam', nombre:'Argumento por la ignorancia', grupo:'atinencia',
    que:'Se sostiene que algo es verdadero porque no se probó que sea falso, o falso porque no se probó que sea verdadero.',
    objecion:'En alegatos, no en preguntas',
    planteo:'La ausencia de prueba de un hecho no acredita el hecho contrario.',
    ejemplo:'"Nadie declaró que mi defendido no estuviera ahí, luego estaba."',
    remedio:'Ojo — en el proceso penal hay una asimetría deliberada: el estado de inocencia (art. 8) hace que la falta de prueba de cargo SÍ deba resolverse a favor del imputado. Eso no es una falacia, es una regla de carga probatoria. La falacia aparece cuando la acusación invierte la carga, o cuando la defensa la usa para dar por acreditado un hecho positivo propio.'
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
    objecion:'En alegatos y en peritajes',
    planteo:'La secuencia no acredita la causalidad.',
    ejemplo:'"Discutieron a las 22 y a las 23 apareció la lesión, luego él la lesionó."',
    remedio:'Exigirle al perito el nexo, no la cronología. En el contraexamen del experto: preguntar qué otras causas compatibles descartó y cómo.'
  },
  {
    id:'accidente', nombre:'Accidente y accidente inverso', grupo:'atinencia',
    que:'Accidente: aplicar una generalización a un caso particular al que no alcanza. Accidente inverso: generalizar apresuradamente desde un caso atípico.',
    objecion:'En alegatos',
    planteo:'La regla general no cubre este caso, o este caso no funda la regla.',
    ejemplo:'"Las víctimas de violencia siempre se retractan, luego esta retractación no vale" es accidente inverso: convierte una tendencia en ley y omite examinar esta retractación.',
    remedio:'Bajar de la máxima de la experiencia al dato del caso, que es lo que exige la sana crítica.'
  },
  {
    id:'ignoratio-elenchi', nombre:'Conclusión inatinente (ignoratio elenchi)', grupo:'atinencia',
    que:'Se prueba algo distinto de lo que había que probar.',
    objecion:'Impertinente o irrelevante',
    planteo:'Objeto por impertinente: la respuesta no hace más ni menos probable ninguna de las teorías del caso.',
    ejemplo:'Acreditar largamente que el imputado tiene mala fama cuando lo que se discute es si estuvo en el lugar.',
    remedio:'Es el mismo test que usan Baytelman y Duce para la pertinencia.'
  },
  {
    id:'ad-misericordiam', nombre:'Apelación a la piedad (ad misericordiam)', grupo:'atinencia',
    que:'Se sustituye la prueba por la compasión.',
    objecion:'Impertinente',
    planteo:'Objeto: la pregunta busca conmover, no acreditar.',
    ejemplo:'Interrogar largamente sobre los hijos pequeños del imputado durante la etapa de culpabilidad.',
    remedio:'Ese material es pertinente en la cesura de pena o en la audiencia de cautelar, no para acreditar el hecho.'
  },
  {
    id:'ad-populum', nombre:'Apelación a la multitud (ad populum)', grupo:'atinencia',
    que:'Se apela al sentir general en lugar de a la prueba.',
    objecion:'Impertinente, o prueba que procura generar prejuicio (art. 190)',
    planteo:'Objeto: se invoca la alarma social, no la prueba del hecho.',
    ejemplo:'"Todo el barrio sabe lo que pasó esa noche."',
    remedio:'Exigir la fuente de conocimiento directa de cada afirmación.'
  },
  {
    id:'ad-baculum', nombre:'Apelación a la fuerza (ad baculum)', grupo:'atinencia',
    que:'Se sustituye la razón por la amenaza.',
    objecion:'Coacción ilegítima (art. 203)',
    planteo:'Objeto: la pregunta contiene una advertencia dirigida a condicionar la respuesta.',
    ejemplo:'"Sepa que mentir acá es un delito. Ahora le vuelvo a preguntar…"',
    remedio:'La coacción legítima que toda sugestiva supone no llega a la advertencia personal.'
  },
  {
    id:'equivoco', nombre:'Equívoco', grupo:'ambigüedad',
    que:'Un término se usa con dos sentidos distintos dentro del mismo razonamiento.',
    objecion:'Ambigua',
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
    remedio:'Exigir la lectura del pasaje completo. Es la defensa más común cuando nos impugnan con una previa.'
  },
  {
    id:'composicion', nombre:'Composición', grupo:'ambigüedad',
    que:'Se atribuye al todo lo que vale para las partes.',
    objecion:'En alegatos',
    planteo:'Que cada indicio sea equívoco no significa que el conjunto lo sea, pero tampoco al revés.',
    ejemplo:'"Cada uno de estos indicios es débil, luego el cuadro indiciario es débil."',
    remedio:'La sana crítica (art. 19 y 212) manda valorar la prueba de modo integral, no indicio por indicio aislado.'
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
Una objeción bien fundada nombra el defecto. El art. 204 exige indicar el motivo, y el motivo es más
fuerte cuando se identifica la falacia que hay debajo. Correspondencias:
` + FALACIAS.map(f => `· ${f.nombre} → ${f.objecion}. ${f.que} Planteo: "${f.planteo}"`).join('\n') + `

Advertencia central de Copi para el contraexamen: impugnar a un testigo NO es un ad hominem falaz si
se lo hace mostrando su pauta de conducta o la inconsistencia de su testimonio; sí lo es si uno se
limita a afirmar que miente, o si de la impugnación se concluye que todo lo que dijo es falso.
`;

if (typeof window !== 'undefined') {
  window.LEX = Object.assign(window.LEX || {}, { CPP, TECNICA, LOGICA, FALACIAS });
}
