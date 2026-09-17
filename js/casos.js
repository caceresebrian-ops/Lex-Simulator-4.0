/* ══════════════════════════════════════════════════════════════════════════
   LEX SIMULATOR — Biblioteca de casos
   Normativa citada: Ley 10.797, Código Procesal Penal de La Rioja.
   Cada caso trae legajo público, declaración previa y "sobre cerrado".
   El banco de respuestas permite que el testigo conteste sin conexión:
     claves    → palabras que activan el tema (separadas por espacios)
     texto     → respuesta normal
     corto     → respuesta cuando la pregunta es sugestiva de un solo punto
     extra     → lo que agrega de más si la pregunta fue abierta (castigo)
     reservado → solo sale si la pregunta da muy justo en el punto
   ══════════════════════════════════════════════════════════════════════════ */

const CASOS = [

/* ───────────────────────── 1 ───────────────────────── */
{
  id:'robo-vargas',
  modulos:['contra','directo'],
  caratula:'F. c/ QUIROGA, Ramón Alberto s/ robo agravado',
  delito:'Robo agravado por el uso de arma de fuego (art. 166 inc. 2 CP)',
  sintesis:'El 14 de marzo, alrededor de las 22:40, en la intersección de Benjamín de la Vega y Catamarca, barrio Vargas, un hombre habría abordado a Gustavo Nieva exhibiendo un arma de fuego y le sustrajo un teléfono celular y dinero en efectivo.',
  hechos:'Nieva volvía caminando del gimnasio. Denunció el hecho esa misma noche en Comisaría Primera. Cuatro días después, en rueda de reconocimiento, señaló a Ramón Quiroga, de 24 años, domiciliado a ocho cuadras del lugar. Quiroga tiene una causa anterior por encubrimiento, sobreseída. No se secuestró el arma. El teléfono fue hallado once días después en poder de un tercero que declaró haberlo comprado en la feria de la Plaza 25 de Mayo.',
  prueba:[
    {tipo:'Denuncia de Gustavo Nieva', detalle:'Radicada el 14/3 a las 23:55 en Comisaría Primera.'},
    {tipo:'Acta de rueda de reconocimiento', detalle:'Del 18/3. Nieva señala al imputado entre cinco personas.'},
    {tipo:'Informe de la Dirección de Alumbrado', detalle:'Dos de las tres luminarias de esa esquina estaban fuera de servicio desde febrero.'},
    {tipo:'Acta de secuestro del teléfono', detalle:'Del 25/3, en poder de Julio Sosa, quien dice haberlo comprado en la feria.'}
  ],
  testigo:{genero:'m', nombre:'Gustavo Nieva', calidad:'víctima y único testigo presencial',
    perfil:'38 años, empleado municipal, secundario completo. Está convencido de lo que vio y se ofende si se le sugiere que puede equivocarse. Habla rápido cuando se pone nervioso.'},
  previa:'Que el día de la fecha, siendo aproximadamente las 22:40 horas, el declarante se encontraba caminando por calle Benjamín de la Vega en dirección al sur, cuando a la altura de la intersección con calle Catamarca fue abordado por un sujeto de sexo masculino, de contextura delgada, de aproximadamente un metro setenta y cinco de estatura, quien vestía campera oscura con capucha colocada. Que dicho sujeto le exhibió lo que parecía ser un arma de fuego a la altura de la cintura y le exigió la entrega del teléfono celular y del dinero que llevara consigo. Que el declarante entregó un aparato marca Samsung y la suma de nueve mil pesos aproximadamente. Que todo sucedió muy rápido, en cuestión de segundos, y que la iluminación del lugar era escasa. Que el sujeto se retiró corriendo en dirección al este. Que el declarante cree que podría reconocerlo si lo viera nuevamente, aunque no le vio bien la cara por la capucha.',
  contexto:{
    ocupacion:'Soy empleado municipal, en la Dirección de Espacios Verdes.',
    domicilio:'Vivo en el barrio Vargas, a unas doce cuadras de donde pasó.',
    estudios:'Terminé la secundaria.',
    familia:'Estoy en pareja, tengo un nene de seis años.',
    relacionImputado:'No lo conocía. Lo vi esa noche y después en la rueda.',
    interes:'Yo lo único que quiero es que no le pase a otro. La plata no la voy a recuperar.',
    vista:'Veo bien, nunca usé anteojos.',
    consumo:'No tomo. Venía del gimnasio, imagínese.',
    antes:'Venía del gimnasio, entreno tres veces por semana y salgo cerca de las diez y media.',
    compania:'Iba solo, caminando para mi casa.',
    despues:'Me fui corriendo hasta la esquina y de ahí llamé. Después fui a la comisaría.',
    conto:'Lo llamé a mi hermano y después le conté a mi señora cuando llegué.',
    policia:'Esa misma noche fui a la Primera y radiqué la denuncia.',
    consecuencias:'Un tiempo no quise caminar más por ahí de noche.',
    preparacion:'Me citaron y me explicaron cómo era, nada más.'
  },
  sobre:{
    verdad:'Nieva vio al agresor entre dos y tres segundos, de perfil y con capucha. En la rueda dudó entre el número 2 y el número 4, y eligió al 4 después de que el personal policial le comentara que "el que buscaban ya estaba adentro". Quiroga efectivamente estuvo esa noche a tres cuadras del lugar, pero no fue quien lo abordó.',
    puntos:[
      'En la declaración previa dijo que no le vio bien la cara por la capucha; hoy afirma estar seguro.',
      'Dos de tres luminarias estaban apagadas, dato que él mismo consignó como "iluminación escasa".',
      'La observación duró segundos y fue de perfil.',
      'En la rueda dudó entre dos personas y recibió un comentario del personal policial antes de decidirse.'
    ],
    conducta:'Se planta y repite que está seguro. Si lo llevan paso a paso a la declaración previa, concede a regañadientes. Si le hacen una pregunta abierta, aprovecha para decir que jamás olvidaría esa cara.'},
  banco:[
    {claves:'hora noche momento cuando 22 tarde horario', texto:'Eran cerca de las once menos veinte de la noche. Volvía del gimnasio.', corto:'Sí, cerca de las once menos veinte.'},
    {claves:'luz iluminacion alumbrado foco oscuro claridad veia', texto:'La cuadra estaba medio oscura, sí. Pero se veía.', corto:'Había poca luz, sí.', extra:'Igual yo lo vi perfectamente, no tengo ninguna duda de lo que vi.'},
    {claves:'capucha campera gorro cabeza ropa vestia', texto:'Tenía una campera oscura, con la capucha puesta.', corto:'Sí, tenía la capucha puesta.'},
    {claves:'cara rostro facciones vio reconocio frente perfil', texto:'Le vi la cara. Lo tengo grabado.', corto:'Sí, le vi la cara.', extra:'A esa cara no me la olvido más en la vida, se lo puedo asegurar.'},
    {claves:'segundos duro tiempo rapido cuanto instante', texto:'Fue rápido. Unos segundos nomás.', corto:'Sí, fueron segundos.', reservado:true},
    {claves:'declaracion previa comisaria denuncia declaro antes dijo esa noche', texto:'Sí, declaré esa misma noche en la Primera.', corto:'Sí, declaré esa noche.'},
    {claves:'no le vi bien la cara por la capucha dijo que no', texto:'Puede que haya dicho eso esa noche. Estaba nervioso, recién me había pasado.', corto:'Si está escrito ahí, lo habré dicho.', reservado:true},
    {claves:'rueda reconocimiento fila señalo eligio numero', texto:'Lo reconocí en la rueda. Lo señalé.', corto:'Sí, lo señalé en la rueda.'},
    {claves:'dudo duda vacilo entre dos numero 2 numero 4 costo decidir', texto:'Miré bien antes de decidirme, eso sí.', corto:'Miré bien antes de decidir.', reservado:true},
    {claves:'policia comentario le dijeron personal adentro ya esta', texto:'El personal estuvo ahí, pero yo decidí solo.', corto:'Yo decidí solo.', reservado:true},
    {claves:'arma pistola revolver fierro cintura', texto:'Me mostró un arma a la altura de la cintura. No la saqué a mirar en detalle.', corto:'Sí, tenía un arma.'},
    {claves:'telefono celular samsung plata dinero entrego', texto:'Le entregué el celular, un Samsung, y como nueve mil pesos que tenía.', corto:'Sí, le entregué el celular y la plata.'}
  ]
},

/* ───────────────────────── 2 ───────────────────────── */
{
  id:'hurto-chilecito',
  modulos:['contra','directo'],
  caratula:'F. c/ AGÜERO, Nahuel y otro s/ hurto agravado',
  delito:'Hurto agravado en poblado y en banda (art. 163 inc. 2 CP)',
  sintesis:'En la madrugada del 2 de julio se sustrajeron herramientas y una amoladora del depósito de la ferretería "El Tornillo", de calle 19 de Febrero al 400, Chilecito.',
  hechos:'El depósito tenía una abertura de ventilación forzada. El comerciante lindero, Aldo Páez, declaró haber visto a dos jóvenes cargando bultos en una moto. Nahuel Agüero, de 19 años, fue identificado dos días después. Se secuestró una amoladora en su domicilio, sin número de serie visible. El titular de la ferretería no pudo individualizar la herramienta como propia.',
  prueba:[
    {tipo:'Acta de inspección ocular', detalle:'Abertura de ventilación forzada desde el exterior.'},
    {tipo:'Declaración de Aldo Páez', detalle:'Comerciante lindero, dice haber visto a dos jóvenes con una moto.'},
    {tipo:'Acta de allanamiento', detalle:'Se secuestra una amoladora en el domicilio de Agüero.'},
    {tipo:'Informe pericial', detalle:'La amoladora no conserva numeración legible.'}
  ],
  testigo:{genero:'m', nombre:'Aldo Páez', calidad:'testigo presencial, comerciante lindero',
    perfil:'57 años, dueño de una rotisería. Servicial, quiere ayudar, y por querer ayudar afirma más de lo que sabe. Se pone incómodo si lo corrigen.'},
  previa:'Que siendo aproximadamente las cuatro de la madrugada el declarante se encontraba en el interior de su comercio realizando tareas de limpieza, cuando escuchó ruidos provenientes del fondo del local lindero. Que se asomó por la puerta y alcanzó a ver a dos personas jóvenes, de sexo masculino, que cargaban bultos en una motocicleta de color oscuro. Que no pudo observar sus rostros ni la patente del rodado. Que uno de ellos le resultó conocido de vista del barrio. Que los mismos se retiraron por calle 19 de Febrero en dirección al norte.',
  contexto:{
    ocupacion:'Tengo una rotisería, hace veinte años que estoy ahí.',
    domicilio:'Vivo arriba del local mismo, en 19 de Febrero.',
    estudios:'Hice hasta séptimo grado nomás.',
    familia:'Casado, tres hijos, ya grandes todos.',
    relacionImputado:'Al muchacho lo tengo visto del barrio. Acá nos conocemos todos.',
    interes:'A mí no me robaron nada. Yo vine porque me citaron.',
    vista:'Veo bien para mi edad. De lejos me cuesta un poco.',
    consumo:'Yo no tomo cuando trabajo.',
    antes:'Estaba limpiando el local, que es lo que hago siempre a esa hora antes de cerrar.',
    compania:'Estaba solo, mi señora ya se había ido a dormir.',
    despues:'Me quedé mirando un rato y después cerré y me fui arriba.',
    conto:'Al otro día se lo comenté al dueño de la ferretería.',
    policia:'La policía vino después y yo les conté lo que había visto.',
    consecuencias:'Desde entonces pongo la reja antes de limpiar.'
  },
  sobre:{
    verdad:'Páez vio dos siluetas desde treinta metros, sin luz, a través del vidrio de su local. Reconoció a Agüero recién cuando la policía le mostró una foto tres días después, y dijo que "podía ser". El que efectivamente cargó los bultos fue otra persona: Agüero llegó después, a buscar a su hermano.',
    puntos:[
      'En la previa dijo expresamente que no pudo observar los rostros.',
      'Observó a través del vidrio de su local, desde unos treinta metros y sin iluminación.',
      'El reconocimiento se produjo por exhibición de una sola fotografía policial, tres días después.',
      'La amoladora secuestrada no fue individualizada por el damnificado.'
    ],
    conducta:'Quiere quedar bien y afirma de más. Si se lo confronta con la previa, se achica rápido y concede casi todo. Si le hacen preguntas abiertas, se va por las ramas contando cosas del barrio.'},
  banco:[
    {claves:'hora madrugada cuatro cuando momento', texto:'Serían las cuatro de la mañana. Yo estaba limpiando el local.', corto:'Sí, las cuatro de la mañana.'},
    {claves:'ruido escucho sonido oyo', texto:'Escuché unos golpes del lado del depósito de al lado.', corto:'Sí, escuché ruidos.'},
    {claves:'vio observo miro asomo puerta vidrio ventana', texto:'Me asomé por la puerta de mi local y vi a dos muchachos.', corto:'Sí, me asomé y los vi.'},
    {claves:'distancia metros lejos cerca cuanto', texto:'Y… habrá treinta metros más o menos hasta ahí.', corto:'Unos treinta metros.', reservado:true},
    {claves:'cara rostro facciones reconocio quienes eran', texto:'Uno me pareció conocido del barrio.', corto:'Uno me resultó conocido.', extra:'Acá nos conocemos todos, yo tengo la rotisería hace veinte años.'},
    {claves:'no pudo observar rostros dijo que no les vio la cara previa declaracion', texto:'Y en ese momento no les vi bien la cara, es cierto.', corto:'Es cierto, no les vi la cara.', reservado:true},
    {claves:'foto fotografia mostraron policia identificacion despues dias', texto:'Después la policía me mostró una foto y dije que podía ser él.', corto:'Me mostraron una foto, sí.', reservado:true},
    {claves:'luz iluminacion oscuro alumbrado', texto:'Ahí atrás no hay luz. Está oscuro.', corto:'Sí, estaba oscuro.'},
    {claves:'moto motocicleta rodado patente', texto:'Cargaron los bultos en una moto oscura. La patente no la vi.', corto:'Sí, una moto oscura.'},
    {claves:'bultos herramientas cajas que llevaban', texto:'Llevaban unos bultos, no sé qué había adentro.', corto:'Sí, llevaban bultos.'}
  ]
},

/* ───────────────────────── 3 ───────────────────────── */
{
  id:'lesiones-aimogasta',
  modulos:['contra','directo'],
  caratula:'F. c/ VERA, Cristian s/ lesiones graves',
  delito:'Lesiones graves (art. 90 CP)',
  sintesis:'En la madrugada del 8 de octubre, a la salida del boliche "La Cava" de Aimogasta, Cristian Vera habría golpeado a Marcelo Britos, provocándole fractura de tabique y pérdida parcial de visión del ojo derecho.',
  hechos:'Ambos habían discutido adentro del local. Afuera había unas cuarenta personas. Britos fue trasladado al hospital Zoilo Abel Ayala. La pericia médica constató fractura nasal y lesión ocular con debilitamiento permanente de la visión. Vera reconoce haber estado en el lugar y haber discutido, pero afirma que el golpe se lo dio otra persona en medio de la gresca.',
  prueba:[
    {tipo:'Informe médico legal', detalle:'Fractura de huesos propios de nariz y debilitamiento permanente de la visión del ojo derecho.'},
    {tipo:'Declaración de Franco Luna', detalle:'Testigo presencial, amigo de la víctima.'},
    {tipo:'Actuaciones policiales', detalle:'Constatan tumulto de aproximadamente cuarenta personas a la salida.'},
    {tipo:'Historia clínica', detalle:'Ingreso a las 5:20. Se consigna aliento etílico en el paciente.'}
  ],
  testigo:{genero:'m', nombre:'Franco Luna', calidad:'testigo presencial, amigo de la víctima',
    perfil:'23 años, changarín. Leal a su amigo hasta la exageración. Había tomado esa noche. Responde con bronca si siente que se defiende al agresor.'},
  previa:'Que el declarante se encontraba junto a Marcelo Britos a la salida del local bailable La Cava, cuando se acercó Cristian Vera, a quien conoce del pueblo, y sin mediar palabra le propinó un golpe de puño en el rostro a Britos, quien cayó al suelo. Que luego de ello se generó una pelea generalizada entre varias personas. Que el declarante intervino para separar. Que había mucha gente en el lugar. Que ambos habían consumido bebidas alcohólicas durante la noche.',
  contexto:{
    ocupacion:'Hago changas, albañilería, lo que salga.',
    domicilio:'Vivo en Aimogasta, en el barrio de atrás de la terminal.',
    estudios:'Dejé en segundo año.',
    familia:'Soltero, vivo con mi vieja.',
    relacionImputado:'Al Vera lo conozco del pueblo, de vista y de nombre.',
    conflicto:'Roces habíamos tenido, pero nada serio antes de esa noche.',
    interes:'Yo quiero que se haga justicia por el Marcelo, es mi amigo de toda la vida.',
    consumo:'Habíamos tomado, sí. Era sábado a la noche y estábamos en el boliche.',
    antes:'Arrancamos como a las once en la casa de un amigo y de ahí nos fuimos a La Cava.',
    compania:'Estaba con el Marcelo y con dos más del barrio.',
    despues:'Lo levanté y lo llevamos al hospital en el auto de un conocido.',
    conto:'Esa misma noche llamé a la familia del Marcelo.',
    policia:'Declaré en la comisaría al otro día, cuando volví del hospital.',
    consecuencias:'El Marcelo quedó mal del ojo y ya no ve igual.'
  },
  sobre:{
    verdad:'Luna estaba de espaldas cuando cayó Britos y se dio vuelta al escuchar el golpe. Vio a Vera parado al lado, pero no vio el impacto. Había bebido siete u ocho cervezas. El golpe que produjo la lesión ocular se lo dio un tercero durante el tumulto, con un codazo.',
    puntos:[
      'No vio el golpe: se dio vuelta cuando su amigo ya estaba en el suelo.',
      'Había consumido alcohol durante toda la noche, según él mismo consignó en la previa.',
      'Había unas cuarenta personas y se generó una pelea generalizada.',
      'La lesión ocular pudo producirse durante el tumulto posterior, no con el primer golpe.'
    ],
    conducta:'Defiende a su amigo con vehemencia. Si le preguntan abierto, acusa a Vera de todo. Si lo llevan punto por punto a la secuencia, termina admitiendo que se dio vuelta después.'},
  banco:[
    {claves:'donde estaba lugar salida boliche parado ubicacion', texto:'Estábamos los dos afuera, en la vereda del boliche.', corto:'Sí, estábamos afuera.'},
    {claves:'golpe piña puño pego vio impacto', texto:'Vera le pegó una piña en la cara.', corto:'Sí, le pegó.', extra:'Y le pegó de atrás, como un cobarde, porque el Marcelo ni lo estaba mirando.'},
    {claves:'espaldas dado vuelta giro mirando hacia donde', texto:'Estaba ahí al lado, hablando con otro.', corto:'Estaba al lado.', reservado:true},
    {claves:'cuando se dio vuelta ya estaba en el suelo caido escucho', texto:'Cuando me di vuelta, Marcelo ya estaba en el piso.', corto:'Ya estaba en el piso, sí.', reservado:true},
    {claves:'alcohol cerveza tomo bebida borracho etilico', texto:'Habíamos tomado, sí. Era sábado a la noche.', corto:'Sí, habíamos tomado.'},
    {claves:'cuantas cervezas cantidad litros tomaste', texto:'Y… unas cuantas. No las conté.', corto:'Bastantes.', reservado:true},
    {claves:'gente personas tumulto pelea generalizada cuantos', texto:'Había un montón de gente. Después se armó una pelea general.', corto:'Sí, había mucha gente.'},
    {claves:'ojo vista ceguera lesion ocular', texto:'Quedó mal del ojo. Eso lo sé por él.', corto:'Sí, quedó mal del ojo.'},
    {claves:'separar intervino ayudo levanto', texto:'Yo me metí a separar y lo levanté a Marcelo.', corto:'Sí, me metí a separar.'},
    {claves:'declaracion previa comisaria declaro antes', texto:'Sí, declaré en la comisaría al otro día.', corto:'Sí, declaré.'}
  ]
},

/* ───────────────────────── 4 ───────────────────────── */
{
  id:'amenazas-chamical',
  modulos:['contra','directo'],
  caratula:'F. c/ OLMOS, Sergio s/ amenazas coactivas',
  delito:'Amenazas coactivas agravadas por el uso de arma (art. 149 ter inc. 1 CP)',
  sintesis:'El 3 de mayo, en calle Copiapó al 200 de Chamical, Sergio Olmos habría exhibido un arma de fuego a su vecino Raúl Cáceres exigiéndole que retirara una denuncia por ruidos molestos.',
  hechos:'Los vecinos mantienen un conflicto de tres años por una medianera y por ruidos. Cáceres denunció el hecho al día siguiente. No se secuestró arma en el allanamiento. Una vecina, Elsa Ponce, dice haber escuchado gritos pero no haber visto nada. Olmos niega el hecho y sostiene que Cáceres busca perjudicarlo en el expediente civil por la medianera.',
  prueba:[
    {tipo:'Denuncia de Raúl Cáceres', detalle:'Radicada el 4/5, un día después del hecho.'},
    {tipo:'Acta de allanamiento', detalle:'Resultado negativo. No se secuestraron armas.'},
    {tipo:'Declaración de Elsa Ponce', detalle:'Vecina. Escuchó gritos, no vio el episodio.'},
    {tipo:'Expediente civil', detalle:'Causa por medianera entre las mismas partes, en trámite desde hace tres años.'}
  ],
  testigo:{genero:'m', nombre:'Raúl Cáceres', calidad:'víctima y denunciante',
    perfil:'61 años, jubilado. Meticuloso, trae fechas anotadas. Le cuesta separar este episodio del conflicto general con el vecino y se va todo el tiempo al tema de la medianera.'},
  previa:'Que el día 3 de mayo, siendo alrededor de las 19 horas, el declarante se encontraba regando el frente de su domicilio cuando se aproximó su vecino Sergio Olmos, con quien mantiene un litigio civil, y en tono agresivo le manifestó que debía retirar la denuncia por ruidos molestos que había efectuado en la Municipalidad. Que en un momento el nombrado se levantó la remera dejando ver lo que el declarante interpretó como la culata de un arma de fuego en la cintura. Que no puede precisar el tipo ni el color del arma. Que el declarante ingresó a su domicilio y cerró la puerta. Que decidió efectuar la denuncia al día siguiente luego de consultarlo con su hija.',
  contexto:{
    ocupacion:'Soy jubilado. Trabajé toda la vida en Vialidad.',
    domicilio:'Vivo en Copiapó al 200, hace treinta años en la misma casa.',
    estudios:'Secundario completo.',
    familia:'Viudo. Tengo una hija que vive cerca.',
    relacionImputado:'Es mi vecino de al lado, lo conozco desde que se mudó.',
    conflicto:'Con Olmos venimos mal hace tres años por el tema de la medianera.',
    interes:'Yo lo único que quiero es vivir tranquilo en mi casa.',
    vista:'Uso anteojos para leer nomás. De lejos veo bien.',
    antes:'Estaba regando el frente, como hago todas las tardes a esa hora.',
    compania:'Estaba solo. Mi hija había venido más temprano.',
    despues:'Entré a mi casa, cerré con llave y no salí más esa tarde.',
    conto:'Lo llamé a mi hija enseguida y lo hablamos.',
    policia:'Denuncié al otro día, después de hablarlo con ella.',
    consecuencias:'Desde entonces no salgo al frente cuando lo veo a él.'
  },
  sobre:{
    verdad:'Olmos se levantó la remera, pero lo que llevaba en la cintura era un teléfono con funda de cuero negra. Cáceres lo interpretó como un arma en el marco del conflicto y su hija lo convenció de denunciar como amenaza con arma para fortalecer su posición en el juicio civil.',
    puntos:[
      'Él mismo declaró que "interpretó" que era un arma, y que no puede precisar tipo ni color.',
      'La denuncia se hizo al día siguiente, después de consultarlo con su hija.',
      'Existe un litigio civil de tres años entre las partes por la medianera.',
      'El allanamiento no arrojó ningún arma.'
    ],
    conducta:'Se aferra a que era un arma. Si le preguntan abierto, arranca con la historia de la medianera. Si lo confrontan con el verbo "interpretó" de su propia declaración, se pone a la defensiva pero no puede negarlo.'},
  banco:[
    {claves:'fecha dia hora 3 mayo cuando 19', texto:'Fue el 3 de mayo, cerca de las siete de la tarde. Yo estaba regando.', corto:'Sí, el 3 de mayo a las siete.'},
    {claves:'olmos vecino acerco vino dijo exigio', texto:'Vino y me dijo que sacara la denuncia de la Municipalidad.', corto:'Sí, me lo exigió.'},
    {claves:'arma pistola revolver culata vio', texto:'Se levantó la remera y le vi la culata en la cintura.', corto:'Sí, tenía un arma.', extra:'Ese hombre me tiene cansado, hace tres años que me hace la vida imposible con el tema de la pared.'},
    {claves:'interpreto parecio creyo penso supuso', texto:'Para mí era un arma. Eso es lo que vi.', corto:'Yo lo tomé como un arma.', reservado:true},
    {claves:'tipo color calibre precisar describir arma como era', texto:'No le podría decir qué tipo era. Vi la culata nomás.', corto:'No sabría precisarlo.', reservado:true},
    {claves:'denuncia dia siguiente cuando denuncio demora espero', texto:'Denuncié al otro día.', corto:'Sí, al día siguiente.', reservado:true},
    {claves:'hija consulto hablo familia', texto:'Lo hablé con mi hija antes de ir.', corto:'Sí, lo hablé con mi hija.', reservado:true},
    {claves:'medianera juicio civil litigio conflicto pared', texto:'Con Olmos tenemos un juicio por la medianera hace tres años.', corto:'Sí, tenemos un juicio civil.'},
    {claves:'entro casa puerta cerro se fue', texto:'Entré a mi casa y cerré la puerta.', corto:'Sí, entré a mi casa.'},
    {claves:'declaracion previa comisaria declaro', texto:'Sí, declaré en la comisaría.', corto:'Sí, declaré.'}
  ]
},

/* ───────────────────────── 5 ───────────────────────── */
{
  id:'genero-retractacion',
  modulos:['contra','directo'],
  caratula:'F. c/ MORALES, Diego s/ lesiones leves y desobediencia',
  delito:'Lesiones leves agravadas por el vínculo y desobediencia a orden judicial (arts. 89, 92 y 239 CP)',
  sintesis:'El 20 de enero, pese a una prohibición de acercamiento vigente, Diego Morales habría concurrido al domicilio de Yamila Torres y la habría lesionado en el rostro y el brazo izquierdo.',
  hechos:'Existía una medida de prohibición de acercamiento dictada el 4 de enero. Torres llamó al 911 y fue asistida por el SAME, que constató excoriaciones y hematoma periorbital. Declaró en sede policial esa misma noche imputando a Morales. Dos meses después, en la fiscalía, se retractó y dijo que las lesiones se las produjo al caerse. Tienen dos hijos en común.',
  prueba:[
    {tipo:'Resolución de prohibición de acercamiento', detalle:'Dictada el 4/1, notificada personalmente a Morales el 5/1.'},
    {tipo:'Informe del SAME', detalle:'Excoriaciones en antebrazo izquierdo y hematoma periorbital derecho.'},
    {tipo:'Primera declaración de Yamila Torres', detalle:'Del 20/1 en sede policial. Imputa a Morales.'},
    {tipo:'Segunda declaración de Yamila Torres', detalle:'Del 22/3 en fiscalía. Se retracta y atribuye las lesiones a una caída.'},
    {tipo:'Registro de llamada al 911', detalle:'Del 20/1 a las 23:14. Audio disponible.'}
  ],
  testigo:{genero:'f', nombre:'Yamila Torres', calidad:'víctima, testigo que se retracta',
    perfil:'29 años, dos hijos con el imputado, sin trabajo formal. Hoy sostiene la retractación. Está incómoda, responde corto y mira al piso. Es el caso clásico de impugnación con declaración previa, pero también de una víctima que puede estar bajo presión.'},
  previa:'Que el día de la fecha, siendo las 23 horas aproximadamente, se hizo presente en el domicilio de la declarante su ex pareja, Diego Morales, pese a tener prohibido el acercamiento. Que el nombrado ingresó por el patio, comenzó a increparla por cuestiones vinculadas a los hijos y, ante la negativa de la declarante a entregarle las llaves del vehículo, la tomó del brazo izquierdo y le propinó un golpe de puño en el rostro. Que la declarante logró comunicarse con el 911. Que el nombrado se retiró antes del arribo del personal policial.',
  contexto:{
    ocupacion:'Ahora no estoy trabajando. Hago limpieza por hora cuando sale.',
    domicilio:'Vivo en la casa del barrio, con los nenes.',
    estudios:'Llegué hasta cuarto año.',
    familia:'Tenemos dos nenes con él.',
    relacionImputado:'Es el padre de mis hijos. Estuvimos muchos años juntos.',
    interes:'Yo no quiero que le pase nada. Solo quiero estar tranquila.',
    antes:'Estaba en casa con los chicos, era de noche y estaban por dormirse.',
    compania:'Estaba con los nenes nada más.',
    despues:'Después llamé, vino la ambulancia y me revisaron.',
    conto:'A nadie le conté al principio. Después se enteró mi hermana.',
    policia:'Esa noche declaré en la comisaría.',
    consecuencias:'Estuve unos días con el ojo así, después se fue.',
    preparacion:'Hablé con la fiscalía cuando fui a aclarar lo que había pasado.'
  },
  sobre:{
    verdad:'La primera declaración es la verdadera. Entre enero y marzo Morales volvió a la casa, retomaron la convivencia de hecho y él le pidió que retirara la denuncia. La retractación no es espontánea. Torres no va a decirlo si no se la interroga con cuidado sobre qué cambió entre una declaración y la otra.',
    puntos:[
      'Entre las dos declaraciones se reanudó el contacto, pese a la prohibición vigente.',
      'La llamada al 911 de esa noche está registrada y es contemporánea al hecho.',
      'El informe del SAME describe lesiones en dos zonas distintas, difíciles de explicar por una sola caída.',
      'La retractación llegó dos meses después y coincide con el retorno a la convivencia.'
    ],
    conducta:'Sostiene la caída. Contesta con monosílabos. Si se la trata con dureza se cierra del todo y el tribunal se pone en contra de quien pregunta. Si se le pregunta qué pasó entre enero y marzo, duda antes de contestar.'},
  banco:[
    {claves:'caida cayo tropezo escalon resbalo como se lesiono', texto:'Me caí en el patio. Estaba oscuro y me tropecé.', corto:'Me caí.'},
    {claves:'lesiones ojo brazo hematoma golpe moreton', texto:'Tenía el ojo morado y un raspón en el brazo.', corto:'Sí, tenía esas lesiones.'},
    {claves:'911 llamada telefono llamo emergencia', texto:'Sí, llamé al 911 esa noche.', corto:'Sí, llamé.'},
    {claves:'que dijo en la llamada audio grabacion contenido', texto:'No me acuerdo bien qué dije. Estaba alterada.', corto:'No me acuerdo qué dije.', reservado:true},
    {claves:'declaracion primera enero comisaria declaro esa noche', texto:'Sí, declaré esa noche en la comisaría.', corto:'Sí, declaré.'},
    {claves:'dijo que la golpeo imputo acuso morales esa vez', texto:'En ese momento dije eso, sí. Estaba enojada.', corto:'Sí, eso dije entonces.', reservado:true},
    {claves:'segunda declaracion marzo fiscalia se retracto cambio version', texto:'Después fui a la fiscalía y aclaré lo que había pasado.', corto:'Sí, después aclaré.'},
    {claves:'que paso entre enero marzo dos meses volvieron convivencia contacto', texto:'Y… volvimos a hablar por los chicos.', corto:'Volvimos a hablar.', reservado:true},
    {claves:'volvio a la casa vive convive juntos relacion', texto:'Está yendo a la casa, sí. Por los nenes.', corto:'Sí, va a la casa.', reservado:true},
    {claves:'pidio que retirara denuncia hablaron causa juicio', texto:'Hablamos del tema, sí.', corto:'Hablamos del tema.', reservado:true},
    {claves:'prohibicion acercamiento medida orden judicial', texto:'Sí, había una medida. Yo la había pedido.', corto:'Sí, había una medida.'},
    {claves:'hijos chicos nenes familia', texto:'Tenemos dos nenes.', corto:'Dos.'}
  ]
},

/* ───────────────────────── 6 ───────────────────────── */
{
  id:'vial-patquia',
  modulos:['contra','directo'],
  caratula:'F. c/ BRIZUELA, Walter s/ homicidio culposo',
  delito:'Homicidio culposo agravado por la conducción imprudente de vehículo automotor (art. 84 bis CP)',
  sintesis:'El 12 de agosto, en el kilómetro 1.104 de la Ruta Nacional 38, cerca de Patquía, el vehículo conducido por Walter Brizuela colisionó con una motocicleta, provocando la muerte de su conductor.',
  hechos:'El hecho ocurrió a las 6:40, con niebla. El croquis policial ubica el impacto en el carril de circulación de la moto. Brizuela dio 0,0 g/l en el test de alcoholemia. La moto no tenía luz trasera funcionando, según constató la inspección. El preventor que confeccionó el croquis llegó cuarenta minutos después del hecho y el lugar ya había sido modificado por los primeros auxilios.',
  prueba:[
    {tipo:'Croquis policial', detalle:'Confeccionado por el cabo Ramírez. Ubica el impacto en el carril sur-norte.'},
    {tipo:'Acta de alcoholemia', detalle:'Resultado 0,0 g/l en el conductor del automóvil.'},
    {tipo:'Informe de inspección del rodado menor', detalle:'Sistema de iluminación trasera no operativo.'},
    {tipo:'Informe meteorológico', detalle:'Visibilidad reducida por niebla entre las 5 y las 8 del 12/8.'},
    {tipo:'Autopsia', detalle:'Politraumatismo. Muerte inmediata.'}
  ],
  testigo:{genero:'m', nombre:'Cabo Emanuel Ramírez', calidad:'preventor, confeccionó el croquis',
    perfil:'31 años, ocho años en la fuerza, sin capacitación específica en accidentología. Contesta con seguridad institucional y tiende a presentar como constatado lo que en realidad dedujo.'},
  previa:'Que el declarante se constituyó en el lugar del hecho siendo aproximadamente las 7:20 horas, por orden de la superioridad. Que al arribar se encontraba presente personal de bomberos y una ambulancia. Que procedió a confeccionar el croquis ilustrativo del lugar, consignando la posición final de los rodados y los rastros visibles sobre la calzada. Que del análisis del lugar surge que el impacto se habría producido sobre el carril de circulación sur-norte. Que las condiciones de visibilidad al momento de su arribo eran regulares por presencia de niebla.',
  contexto:{
    ocupacion:'Soy cabo de la Policía de la Provincia, hace ocho años.',
    domicilio:'Vivo en Patquía, en el casco urbano.',
    estudios:'Tengo el secundario y la escuela de policía.',
    familia:'Casado, dos hijos.',
    relacionImputado:'No, al conductor no lo conocía. Lo vi ahí en el lugar.',
    interes:'Yo cumplo con el servicio, nada más.',
    antes:'Estaba de guardia en la comisaría cuando entró el llamado por la superioridad.',
    compania:'Fui con otro efectivo en el móvil.',
    despues:'Terminé el croquis, labré las actuaciones y volví a la dependencia.',
    policia:'Yo soy el personal policial que intervino.',
    preparacion:'Repasé las actuaciones antes de venir, es el procedimiento.'
  },
  sobre:{
    verdad:'Ramírez llegó cuarenta minutos después. Los bomberos ya habían movido la moto para liberar al conductor y la ambulancia había pisado la zona de rastros. La ubicación del impacto no fue medida: la dedujo por la posición final de los vehículos. No tiene formación en accidentología y nunca hizo un curso de planimetría.',
    puntos:[
      'Llegó cuarenta minutos después y el lugar ya había sido intervenido por bomberos y ambulancia.',
      'La posición del impacto fue deducida, no medida: no hay planimetría con puntos de referencia.',
      'No tiene capacitación en accidentología ni en planimetría forense.',
      'El croquis no consigna la falta de luz trasera de la motocicleta.'
    ],
    conducta:'Responde con seguridad y lenguaje policial. Si se le pregunta qué midió y con qué, se pone incómodo. Si se le pregunta abierto, se explaya sobre el procedimiento y suena convincente.'},
  banco:[
    {claves:'hora llegada arribo constituyo cuando llego', texto:'Me constituí en el lugar a las 7:20 aproximadamente.', corto:'A las 7:20.'},
    {claves:'hecho ocurrio 6:40 cuando paso diferencia tiempo minutos', texto:'El hecho habría sido cerca de las 6:40, según lo informado.', corto:'Cerca de las 6:40.', reservado:true},
    {claves:'bomberos ambulancia personal presente lugar intervino', texto:'Cuando llegué estaban los bomberos y la ambulancia trabajando.', corto:'Sí, estaban trabajando.'},
    {claves:'movieron moto rodado desplazaron liberar victima modificaron', texto:'Los bomberos habían trabajado sobre el rodado para liberar al conductor.', corto:'Sí, habían trabajado sobre el rodado.', reservado:true},
    {claves:'croquis planimetria confecciono dibujo hizo', texto:'Confeccioné el croquis ilustrativo del lugar.', corto:'Sí, yo lo hice.', extra:'Es el procedimiento habitual, se consigna la posición final de los rodados y los rastros visibles.'},
    {claves:'midio medicion cinta metros instrumento herramienta como determino', texto:'Se consigna la posición de los elementos en el lugar.', corto:'Se consigna la posición.', reservado:true},
    {claves:'impacto punto colision donde se produjo carril', texto:'Del análisis del lugar surge que el impacto fue en el carril sur-norte.', corto:'En el carril sur-norte.'},
    {claves:'dedujo infirio surge analisis constato vio', texto:'Lo establecí por la posición final de los rodados.', corto:'Por la posición final.', reservado:true},
    {claves:'curso capacitacion accidentologia formacion especialidad titulo', texto:'Tengo la formación de la fuerza.', corto:'La formación de la fuerza.', reservado:true},
    {claves:'niebla visibilidad clima condiciones', texto:'Había niebla. La visibilidad era regular.', corto:'Sí, había niebla.'},
    {claves:'luz trasera moto iluminacion rodado menor', texto:'Eso lo constató la inspección técnica, no el croquis.', corto:'Eso no lo consigné.', reservado:true},
    {claves:'alcoholemia test alcohol conductor', texto:'Dio cero. El conductor no había ingerido alcohol.', corto:'Dio cero.'}
  ]
},

/* ───────────────────────── 7 ───────────────────────── */
{
  id:'estupefacientes-antartida',
  modulos:['contra','directo'],
  caratula:'F. c/ CARRIZO, Emanuel s/ infracción ley 23.737',
  delito:'Tenencia de estupefacientes con fines de comercialización (art. 5 inc. c, ley 23.737)',
  sintesis:'El 17 de junio se allanó el domicilio de Emanuel Carrizo, en el barrio Antártida, secuestrándose 43 envoltorios de cocaína, una balanza y dinero fraccionado.',
  hechos:'La orden se libró con base en tareas de inteligencia previas y en una denuncia anónima. El allanamiento se practicó a las 6:15. Carrizo vivía con su madre y dos hermanos menores. Los envoltorios fueron hallados en un tapial del fondo, lindero con un pasillo de uso común. La defensa sostiene que el sector no es de uso exclusivo del imputado.',
  prueba:[
    {tipo:'Orden de allanamiento', detalle:'Librada el 16/6, fundada en tareas de inteligencia y denuncia anónima.'},
    {tipo:'Acta de allanamiento y secuestro', detalle:'43 envoltorios, una balanza digital y $187.000 en billetes de baja denominación.'},
    {tipo:'Informe pericial químico', detalle:'Clorhidrato de cocaína, pureza del 31%.'},
    {tipo:'Croquis del inmueble', detalle:'El tapial del fondo linda con un pasillo de uso común de tres viviendas.'}
  ],
  testigo:{genero:'f', nombre:'Sargento Lucía Agüero', calidad:'preventora a cargo del procedimiento',
    perfil:'35 años, División Drogas. Profesional y precisa, pero acostumbrada a que no la contraexaminen. Si la pregunta es exacta, contesta exacto; si es vaga, se refugia en el acta.'},
  previa:'Que la declarante se desempeñó como jefa del procedimiento llevado a cabo en el domicilio sito en Manzana 14, Casa 7 del barrio Antártida, en virtud de orden emanada del juzgado interviniente. Que se ingresó al inmueble siendo las 6:15 horas, encontrándose en el lugar el imputado, su progenitora y dos menores de edad. Que durante el registro se procedió al secuestro de cuarenta y tres envoltorios de material vegetal compactado, una balanza de precisión y dinero en efectivo. Que los envoltorios fueron hallados en el sector posterior del inmueble. Que se labró la correspondiente acta con intervención de testigos hábiles.',
  contexto:{
    ocupacion:'Soy sargento de la División Drogas Peligrosas.',
    domicilio:'No corresponde que dé mi domicilio particular.',
    estudios:'Tengo la formación de la fuerza y cursos de la división.',
    relacionImputado:'No lo conocía personalmente. Lo conocí en el procedimiento.',
    interes:'Yo declaro sobre el procedimiento que encabecé.',
    antes:'Nos reunimos a las cinco en la dependencia para el briefing previo al allanamiento.',
    compania:'Fui con la comisión, cuatro efectivos más.',
    despues:'Se trasladó el material secuestrado y se labró el acta correspondiente.',
    preparacion:'Leí el acta antes de venir.'
  },
  sobre:{
    verdad:'Los envoltorios estaban sobre el tapial, del lado del pasillo común, accesible desde tres viviendas. La balanza estaba en la cocina, de uso familiar. El acta dice "sector posterior" porque Agüero no quiso consignar la ambigüedad del lugar. Los testigos hábiles llegaron veinte minutos después de iniciado el registro.',
    puntos:[
      'La previa describe el material secuestrado como "material vegetal compactado", pero la pericia informa clorhidrato de cocaína.',
      'El hallazgo fue en el tapial, lindero con un pasillo de uso común de tres viviendas.',
      'Los testigos hábiles no estuvieron presentes al inicio del registro.',
      'La balanza estaba en un espacio de uso familiar, no en un ámbito exclusivo del imputado.'
    ],
    conducta:'Contesta técnico y seguro. Si la pregunta es precisa sobre el lugar exacto del hallazgo o sobre el momento de llegada de los testigos, concede el dato sin dramatizar. Si le preguntan abierto, recita el procedimiento.'},
  banco:[
    {claves:'hora ingreso allanamiento 6:15 cuando entraron', texto:'Ingresamos a las 6:15.', corto:'A las 6:15.'},
    {claves:'quienes estaban personas domicilio familia madre menores', texto:'Estaban el imputado, la madre y dos menores.', corto:'Sí, estaban ellos.'},
    {claves:'envoltorios secuestro cuantos hallazgo droga', texto:'Se secuestraron cuarenta y tres envoltorios.', corto:'Cuarenta y tres.'},
    {claves:'donde estaban envoltorios lugar exacto hallados sector', texto:'En el sector posterior del inmueble.', corto:'En el sector posterior.'},
    {claves:'tapial pared muro pasillo comun lindero acceso vecinos', texto:'Sobre el tapial del fondo, que da a un pasillo.', corto:'Sobre el tapial.', reservado:true},
    {claves:'pasillo uso comun tres viviendas quien accede exclusivo', texto:'El pasillo comunica con otras casas, sí.', corto:'Sí, comunica con otras casas.', reservado:true},
    {claves:'material vegetal compactado cocaina que decia acta describio', texto:'En el acta se consignó como material compactado, sí. La pericia después determinó la sustancia.', corto:'Sí, así se consignó.', reservado:true},
    {claves:'balanza donde estaba cocina precision', texto:'La balanza estaba en la cocina.', corto:'En la cocina.', reservado:true},
    {claves:'testigos habiles presentes cuando llegaron acta', texto:'Se contó con testigos hábiles para el acta.', corto:'Sí, hubo testigos.'},
    {claves:'testigos llegaron despues inicio registro veinte minutos momento', texto:'Los testigos se incorporaron una vez iniciado el procedimiento.', corto:'Se incorporaron después.', reservado:true},
    {claves:'denuncia anonima inteligencia tareas previas orden', texto:'La orden se fundó en tareas previas y en una denuncia.', corto:'Sí, hubo tareas previas.'},
    {claves:'dinero plata efectivo billetes', texto:'Se secuestraron ciento ochenta y siete mil pesos en billetes chicos.', corto:'Sí, se secuestró dinero.'}
  ]
},

/* ───────────────────────── 8 ───────────────────────── */
{
  id:'encubrimiento-moto',
  modulos:['contra','directo'],
  caratula:'F. c/ FUNES, Damián s/ encubrimiento agravado',
  delito:'Encubrimiento agravado por el ánimo de lucro (art. 277 inc. 1 b y 3 b CP)',
  sintesis:'El 9 de abril se secuestró en el taller de Damián Funes una motocicleta con numeración de motor adulterada, denunciada como robada tres semanas antes.',
  hechos:'Funes es mecánico y sostiene que recibió la moto para reparar, de un cliente que no volvió a buscarla. No tiene comprobante de ingreso. La numeración del cuadro estaba limada. El propietario denunciante reconoció el rodado por una calcomanía en el guardabarros. No hay registro de una transferencia.',
  prueba:[
    {tipo:'Denuncia de robo del rodado', detalle:'Radicada el 17/3 por Matías Paz.'},
    {tipo:'Acta de secuestro', detalle:'Del 9/4, en el taller de calle Los Zorzales al 1200.'},
    {tipo:'Pericia mecánica', detalle:'Numeración de cuadro limada; motor con numeración regrabada.'},
    {tipo:'Declaración de Matías Paz', detalle:'Reconoce el rodado por una calcomanía y una abolladura en el tanque.'}
  ],
  testigo:{genero:'m', nombre:'Matías Paz', calidad:'damnificado, reconoce el rodado',
    perfil:'26 años, repartidor. Seguro de que la moto es suya. No sabe casi nada de mecánica ni de numeraciones, y sus certezas descansan en detalles estéticos.'},
  previa:'Que el declarante es propietario de una motocicleta marca Honda, modelo Wave, color roja, la cual le fuera sustraída el día 17 de marzo del frente de su domicilio. Que el día de la fecha fue convocado a la dependencia policial a fin de reconocer un rodado secuestrado. Que al observarlo reconoció de inmediato que se trataba de su motocicleta, por presentar una calcomanía de un club deportivo en el guardabarros trasero y una abolladura en el tanque de combustible del lado derecho. Que no conserva la documentación del rodado por haberla extraviado.',
  contexto:{
    ocupacion:'Trabajo de repartidor, hago delivery con la moto.',
    domicilio:'Vivo en el centro, en un departamento alquilado.',
    estudios:'Secundario completo.',
    familia:'Soltero.',
    relacionImputado:'Al mecánico no lo conozco de nada. Lo vi cuando fui a reconocer la moto.',
    interes:'Quiero recuperar mi moto, es mi herramienta de trabajo.',
    antes:'Esa noche la dejé en la puerta como siempre, con la traba.',
    despues:'A la mañana salí y no estaba. Denuncié ese mismo día.',
    conto:'Le avisé a mi jefe que no iba a poder trabajar.',
    policia:'Denuncié el 17 de marzo en la comisaría.',
    consecuencias:'Estuve un mes sin trabajar por no tener la moto.'
  },
  sobre:{
    verdad:'La moto es efectivamente de Paz. Pero la calcomanía es de un club con miles de hinchas y la abolladura es común en ese modelo. Paz no recuerda el número de dominio ni conserva documentación, y la identificación registral se hizo por un peritaje posterior, no por su reconocimiento. Funes, por su parte, sí recibió la moto de un tercero, pero sabía que era de origen dudoso porque le pidieron regrabar el motor.',
    puntos:[
      'El reconocimiento se basó en una calcomanía de un club popular y en una abolladura frecuente en el modelo.',
      'No conserva documentación del rodado ni recuerda el dominio.',
      'La identificación técnica se realizó por pericia posterior, no por su reconocimiento.',
      'No hubo rueda de reconocimiento de cosas con rodados similares.'
    ],
    conducta:'Insiste en que es su moto. Concede sin problema los detalles técnicos porque no los maneja, y ahí es donde se lo puede trabajar.'},
  banco:[
    {claves:'moto motocicleta propiedad suya honda wave roja', texto:'Es mi moto, una Honda Wave roja.', corto:'Sí, es mía.'},
    {claves:'robo sustraccion cuando 17 marzo frente domicilio', texto:'Me la robaron el 17 de marzo, de la puerta de mi casa.', corto:'El 17 de marzo.'},
    {claves:'reconocio como supo identifico cuando vio', texto:'La reconocí apenas la vi.', corto:'Sí, la reconocí.', extra:'Es mi moto, la tuve dos años, la conozco de memoria.'},
    {claves:'calcomania sticker club escudo guardabarros', texto:'Tiene una calcomanía del club en el guardabarros de atrás.', corto:'Sí, la calcomanía.'},
    {claves:'cuantas motos tienen esa calcomania club hinchas comun', texto:'Y… habrá otras. Es un club grande.', corto:'Habrá otras.', reservado:true},
    {claves:'abolladura golpe tanque marca', texto:'Y tiene un golpe en el tanque, del lado derecho.', corto:'Sí, un golpe en el tanque.'},
    {claves:'abolladura comun modelo frecuente otras motos igual', texto:'No sé si es común. A la mía se la hice yo.', corto:'No sabría decirle.', reservado:true},
    {claves:'documentacion titulo cedula papeles extravio', texto:'No tengo los papeles, se me perdieron.', corto:'No los tengo.'},
    {claves:'dominio patente numero chapa recuerda cual', texto:'El número no me lo acuerdo de memoria.', corto:'No me lo acuerdo.', reservado:true},
    {claves:'numeracion motor cuadro grabado chasis', texto:'De números de motor no entiendo nada.', corto:'No entiendo de eso.', reservado:true},
    {claves:'rueda reconocimiento otras motos similares comparacion', texto:'Me mostraron la moto y la reconocí.', corto:'Me mostraron la moto.', reservado:true}
  ]
},

/* ───────────────────────── 9 ───────────────────────── */
{
  id:'estafa-transferencia',
  modulos:['contra','directo'],
  caratula:'F. c/ LEIVA, Rocío s/ estafa',
  delito:'Estafa (art. 172 CP)',
  sintesis:'Entre el 2 y el 6 de febrero, Nélida Cabrera, de 74 años, realizó cuatro transferencias por un total de $940.000 a una cuenta a nombre de Rocío Leiva, tras recibir llamados de una persona que se identificó como empleada de su banco.',
  hechos:'Cabrera denunció el 10 de febrero. La cuenta receptora es una billetera virtual a nombre de Leiva, de 22 años, quien declara que entregó sus datos a cambio de $30.000 a una persona que conoció por redes sociales. Los fondos fueron retirados en cajeros de otra provincia. No hay registro de los llamados en el detalle telefónico aportado.',
  prueba:[
    {tipo:'Denuncia de Nélida Cabrera', detalle:'Del 10/2. Describe cuatro llamados en cinco días.'},
    {tipo:'Comprobantes de transferencia', detalle:'Cuatro operaciones, total $940.000, a cuenta de R. Leiva.'},
    {tipo:'Informe de la billetera virtual', detalle:'Cuenta abierta el 28/1 con datos de Leiva. Retiros en cajeros de Córdoba.'},
    {tipo:'Detalle de llamadas entrantes', detalle:'No registra los llamados en los horarios denunciados.'}
  ],
  testigo:{genero:'f', nombre:'Nélida Cabrera', calidad:'víctima',
    perfil:'74 años, jubilada docente. Lúcida pero angustiada por el episodio. Confunde fechas y horarios, y mezcla los cuatro llamados en un solo relato.'},
  previa:'Que la declarante recibió un llamado telefónico de una persona de sexo femenino que dijo ser empleada del banco donde percibe sus haberes, informándole que su cuenta había sido vulnerada y que debía resguardar el dinero transfiriéndolo a una cuenta segura. Que la declarante, creyendo en la veracidad de lo informado, realizó cuatro transferencias durante esa semana. Que no recuerda con exactitud los días ni los horarios de cada llamado. Que tomó conocimiento del engaño cuando concurrió personalmente a la sucursal.',
  contexto:{
    ocupacion:'Soy jubilada. Fui maestra cuarenta años.',
    domicilio:'Vivo sola en mi departamento, en el centro.',
    estudios:'Soy maestra normal nacional.',
    familia:'Viuda. Tengo dos hijos que viven afuera.',
    relacionImputado:'A esa señorita no la vi nunca. Yo hablé por teléfono con alguien.',
    interes:'Quiero recuperar mi plata, que me costó toda la vida juntarla.',
    vista:'Veo bien con los anteojos puestos.',
    oido:'Escucho bien, por eso le digo que era voz de mujer joven.',
    antes:'Estaba en mi casa, había ido al banco esa semana a cobrar.',
    compania:'Vivo sola, no había nadie conmigo.',
    despues:'Seguí las instrucciones que me daban y después fui al banco.',
    conto:'Le conté a mi hijo cuando me di cuenta, y él me dijo que denunciara.',
    policia:'Denuncié el 10 de febrero.',
    consecuencias:'No duermo bien desde entonces. Me da vergüenza haber caído.'
  },
  sobre:{
    verdad:'Cabrera fue efectivamente engañada. Pero hubo también un llamado que ella hizo, no recibió: devolvió el llamado a un número que le dejaron. Ese dato no figura en la denuncia y explica por qué el detalle de entrantes no registra los contactos. Leiva no fue quien llamó: su rol fue prestar la cuenta.',
    puntos:[
      'No recuerda días ni horarios, según su propia declaración.',
      'Al menos un contacto fue un llamado saliente de ella, lo que explica la ausencia de registro de entrantes.',
      'Nunca vio ni escuchó a Rocío Leiva: la voz del teléfono era de otra persona.',
      'Los fondos se retiraron en otra provincia, donde la imputada no estuvo.'
    ],
    conducta:'Se angustia y pide disculpas por no recordar. Si la tratan con dureza, el tribunal se pone en su favor. Si le preguntan con paciencia y por hechos concretos, aporta datos valiosos para la defensa sin advertirlo.'},
  banco:[
    {claves:'llamado telefono llamaron banco empleada voz', texto:'Me llamó una señorita que dijo ser del banco.', corto:'Sí, me llamaron.'},
    {claves:'voz mujer quien hablaba conoce imputada leiva vio', texto:'Era una voz de mujer joven. A la señorita esta nunca la vi.', corto:'Nunca la vi.', reservado:true},
    {claves:'transferencias cuantas cuatro monto plata total', texto:'Hice cuatro transferencias. En total casi un millón de pesos.', corto:'Cuatro.'},
    {claves:'dias horarios fechas cuando recuerda exactitud precision', texto:'Los días exactos no los recuerdo, discúlpeme.', corto:'No los recuerdo.'},
    {claves:'devolvio llamado llamo ella numero dejaron saliente', texto:'Una vez los llamé yo, porque me habían dejado un número.', corto:'Una vez llamé yo.', reservado:true},
    {claves:'banco sucursal concurrio se entero descubrio', texto:'Me di cuenta cuando fui al banco personalmente.', corto:'Cuando fui al banco.'},
    {claves:'creyo confio penso verdad engaño', texto:'Yo les creí. Me dijeron que estaba en peligro mi plata.', corto:'Sí, les creí.', extra:'Una trabaja toda la vida y le pasa esto, es una vergüenza lo que hacen.'},
    {claves:'cajero cordoba retiro donde sacaron provincia', texto:'Eso me lo dijeron después, que sacaron la plata en Córdoba.', corto:'Eso me lo dijeron.'},
    {claves:'denuncia cuando radico 10 febrero', texto:'Denuncié el 10 de febrero.', corto:'El 10 de febrero.'}
  ]
},

/* ───────────────────────── 10 ───────────────────────── */
{
  id:'homicidio-ocasion',
  modulos:['contra','directo'],
  caratula:'F. c/ SORIA, Cristian s/ homicidio en ocasión de robo',
  delito:'Homicidio en ocasión de robo (art. 165 CP)',
  sintesis:'El 28 de noviembre, cerca de la 1:30, en calle Santa Fe al 900 de la ciudad Capital, dos personas habrían interceptado a Julián Ferreyra para sustraerle la mochila; en el forcejeo, Ferreyra recibió una herida de arma blanca que le provocó la muerte.',
  hechos:'El hecho ocurrió a media cuadra de un kiosco abierto. Wanda Ocampo, empleada del kiosco, dice haber visto la secuencia desde el mostrador. Cristian Soria fue detenido a nueve cuadras, cuarenta minutos después, sin la mochila y sin arma. Se secuestró un cuchillo en un baldío lindero, sin rastros útiles. La autopsia informa una única herida punzocortante en región torácica.',
  prueba:[
    {tipo:'Declaración de Wanda Ocampo', detalle:'Empleada del kiosco de la esquina. Única testigo presencial.'},
    {tipo:'Acta de detención', detalle:'Soria detenido a las 2:10, a nueve cuadras del lugar.'},
    {tipo:'Acta de secuestro', detalle:'Cuchillo hallado en baldío lindero. Sin rastros útiles.'},
    {tipo:'Autopsia', detalle:'Herida punzocortante única en tórax. Muerte por shock hipovolémico.'},
    {tipo:'Croquis del lugar', detalle:'Distancia del kiosco al punto del hecho: 47 metros.'}
  ],
  testigo:{genero:'f', nombre:'Wanda Ocampo', calidad:'única testigo presencial',
    perfil:'24 años, empleada de kiosco, cursa el profesorado. Observadora y honesta, pero la fiscalía la presenta como si hubiera visto más de lo que vio. Si le preguntan bien, distingue con precisión lo que vio de lo que supuso.'},
  previa:'Que la declarante se encontraba trabajando en el kiosco sito en la esquina de Santa Fe y Rivadavia, cuando escuchó gritos provenientes de la mitad de cuadra. Que al mirar hacia allí observó a dos personas que forcejeaban con un joven. Que uno de ellos vestía ropa oscura y el otro una remera clara. Que luego ambos se retiraron corriendo en dirección opuesta y el joven quedó tendido en la vereda. Que la declarante llamó de inmediato al 911. Que no puede precisar las fisonomías por la distancia y la falta de iluminación en ese sector de la cuadra.',
  contexto:{
    ocupacion:'Trabajo en el kiosco y estudio el profesorado de Lengua.',
    domicilio:'Vivo a seis cuadras del kiosco.',
    estudios:'Estoy en tercer año del profesorado.',
    familia:'Soltera, vivo con una compañera.',
    relacionImputado:'No conozco a nadie de los que estuvieron ahí.',
    interes:'Yo no tengo nada que ver, vine porque me citaron.',
    vista:'Veo bien, no uso anteojos.',
    consumo:'Estaba trabajando, no había tomado nada.',
    antes:'Estaba atendiendo el kiosco, era mi turno de noche.',
    compania:'Estaba sola en el local.',
    despues:'Llamé al 911 y salí a ver si el chico respiraba, pero no me animé a moverlo.',
    conto:'Llamé a mi mamá cuando se fue la policía.',
    policia:'Declaré esa misma madrugada.',
    consecuencias:'Dejé el turno de noche después de eso.'
  },
  sobre:{
    verdad:'Ocampo vio dos siluetas a 47 metros, de noche. No puede identificar a nadie y lo sabe. Vio que uno de los dos hizo un movimiento hacia adelante, pero no vio arma alguna. Soria estaba en la zona, pero el que tenía el cuchillo era el otro, que no fue identificado.',
    puntos:[
      'Declaró expresamente que no puede precisar fisonomías por la distancia y la falta de luz.',
      'La distancia entre el kiosco y el punto del hecho es de 47 metros.',
      'Nunca vio un arma: vio un movimiento.',
      'No hay prueba que vincule a Soria con el cuchillo secuestrado.'
    ],
    conducta:'Es precisa y no exagera. Distingue con naturalidad entre lo que vio y lo que dedujo, siempre que la pregunta lo permita. Con preguntas abiertas y vagas, su relato se vuelve confuso y parece decir más de lo que dice.'},
  banco:[
    {claves:'donde estaba kiosco mostrador trabajando ubicacion', texto:'Estaba atrás del mostrador del kiosco, en la esquina.', corto:'En el kiosco.'},
    {claves:'grito escucho ruido alerto', texto:'Escuché gritos y miré hacia la mitad de cuadra.', corto:'Sí, escuché gritos.'},
    {claves:'vio observo personas dos forcejeo', texto:'Vi a dos personas forcejeando con un chico.', corto:'Sí, vi dos personas.'},
    {claves:'distancia metros lejos cuanto 47 cuadra', texto:'Estaba lejos. Media cuadra, más o menos.', corto:'Media cuadra.'},
    {claves:'cara rostro fisonomia identificar reconocer quienes', texto:'Las caras no las vi. Estaba oscuro y lejos.', corto:'No les vi las caras.', extra:'Ojalá pudiera decirle más, pero no vi las caras y no voy a inventar.'},
    {claves:'ropa vestimenta oscura clara remera', texto:'Uno tenía ropa oscura y el otro una remera clara.', corto:'Sí, uno oscuro y otro claro.'},
    {claves:'arma cuchillo vio hoja filo puñal', texto:'Arma no vi.', corto:'No vi ningún arma.', reservado:true},
    {claves:'movimiento gesto brazo adelante mano que hizo', texto:'Vi que uno hizo un movimiento hacia adelante, con el brazo.', corto:'Sí, un movimiento con el brazo.', reservado:true},
    {claves:'luz iluminacion oscuro alumbrado sector', texto:'Esa mitad de cuadra no tiene luz.', corto:'No hay luz ahí.'},
    {claves:'911 llamo policia aviso', texto:'Llamé al 911 enseguida.', corto:'Sí, llamé al 911.'},
    {claves:'soria imputado detenido vio despues reconoce', texto:'Al detenido no lo vi nunca. No sé si era alguno de ellos.', corto:'No lo vi nunca.', reservado:true}
  ]
},

/* ───────────────────────── 11 ───────────────────────── */
{
  id:'pericia-balistica',
  modulos:['contra','directo'],
  caratula:'F. c/ MERCADO, Iván s/ portación ilegítima de arma de guerra',
  delito:'Portación ilegítima de arma de fuego de guerra (art. 189 bis inc. 2, 4° párr. CP)',
  sintesis:'El 5 de septiembre, en un control vehicular de Ruta 5, se secuestró bajo el asiento del acompañante una pistola calibre 9 mm con numeración suprimida. Iván Mercado viajaba como acompañante.',
  hechos:'El conductor del vehículo era un tercero, imputado en causa separada. La pericia balística concluyó que el arma es apta para el disparo y de uso de guerra. La defensa discute la aptitud y el encuadre como arma de guerra, y la portación por parte de Mercado.',
  prueba:[
    {tipo:'Acta de secuestro', detalle:'Pistola 9 mm bajo el asiento del acompañante, con numeración suprimida.'},
    {tipo:'Pericia balística', detalle:'Arma apta para el disparo. Se efectuaron dos disparos de prueba.'},
    {tipo:'Informe RENAR', detalle:'Sin registro del arma por supresión de numeración.'},
    {tipo:'Acta del control vehicular', detalle:'Control de rutina. Mercado viajaba como acompañante.'}
  ],
  testigo:{genero:'m', nombre:'Perito Osvaldo Nieto', calidad:'perito balístico oficial',
    perfil:'52 años, veinte años en el gabinete. Sólido en lo suyo, pero acostumbrado a que sus conclusiones no se discutan. Si le preguntan por el método concreto, responde bien; si le piden opiniones fuera de su área, las da igual, y ahí queda expuesto.'},
  previa:'Que el suscripto recibió el arma remitida por la Unidad interviniente a los fines de determinar su aptitud para el disparo. Que se efectuó el examen macroscópico del arma, verificándose el estado de sus mecanismos. Que se realizaron dos disparos de prueba con munición del mismo calibre, resultando ambos exitosos. Que en consecuencia se concluye que el arma resulta apta para producir disparos. Que la numeración identificatoria se encuentra suprimida por limado.',
  contexto:{
    ocupacion:'Soy perito balístico del gabinete, hace veinte años.',
    estudios:'Tengo la formación técnica y los cursos de la especialidad.',
    relacionImputado:'No conozco a ninguna de las partes.',
    interes:'Yo hago el peritaje que se me encomienda.',
    antes:'El arma ingresó al gabinete remitida por la Unidad interviniente.',
    despues:'Elevé el informe con las conclusiones a la instrucción.',
    preparacion:'Repasé mi informe antes de venir, como corresponde.'
  },
  sobre:{
    verdad:'La pericia es correcta en cuanto a la aptitud. Pero Nieto no realizó el estudio de restauración de numeración, ni examinó rastros dactilares, porque el arma llegó ya manipulada y sin resguardo de cadena de custodia documentada. El encuadre como "arma de guerra" es una calificación jurídica que él consignó sin que corresponda a su función.',
    puntos:[
      'No efectuó estudio de restauración de numeración ni le fue requerido.',
      'El arma llegó al gabinete sin planilla de cadena de custodia completa.',
      'No se hicieron cotejos dactiloscópicos sobre el arma ni sobre el cargador.',
      'La clasificación como "arma de guerra" es una calificación jurídica, no una conclusión pericial.'
    ],
    conducta:'Firme en lo técnico. Si le preguntan qué hizo y qué no hizo, lo dice sin problema. Si le preguntan si el arma era de Mercado, o si opina sobre la portación, contesta igual y se sale de su rol.'},
  banco:[
    {claves:'titulo formacion experiencia años gabinete acreditacion especialidad', texto:'Soy perito balístico, veinte años en el gabinete de la policía.', corto:'Perito balístico, veinte años.'},
    {claves:'que hizo examen metodo procedimiento pericia realizo', texto:'Hice el examen macroscópico y dos disparos de prueba con munición del mismo calibre.', corto:'Examen macroscópico y disparos de prueba.'},
    {claves:'apta aptitud disparo funciona conclusion', texto:'El arma es apta para producir disparos.', corto:'Sí, es apta.'},
    {claves:'numeracion suprimida limado restauracion estudio recupero', texto:'La numeración está suprimida por limado.', corto:'Está limada.'},
    {claves:'restauracion quimica intento recuperar numero pidieron hizo', texto:'No se me requirió el estudio de restauración.', corto:'No se me requirió.', reservado:true},
    {claves:'huellas dactilares rastros cotejo dactiloscopico', texto:'Ese estudio no lo realicé yo.', corto:'No lo realicé.', reservado:true},
    {claves:'cadena custodia planilla resguardo como llego remision', texto:'El arma me llegó remitida por la Unidad.', corto:'Me la remitió la Unidad.'},
    {claves:'planilla completa documentacion faltaba constancia quien manipulo', texto:'La remisión no traía la planilla completa, eso es correcto.', corto:'No traía la planilla completa.', reservado:true},
    {claves:'arma de guerra clasificacion uso civil condicional calificacion', texto:'Consigné que es de uso de guerra por el calibre.', corto:'Por el calibre.'},
    {claves:'quien es la clasificacion juridica corresponde perito funcion opinion', texto:'La clasificación surge de la normativa. Yo la consigné.', corto:'La consigné yo.', reservado:true},
    {claves:'mercado imputado dueño portaba opina quien tenia', texto:'Eso no me consta. Yo peritié el arma.', corto:'No me consta.', reservado:true}
  ]
},

/* ───────────────────────── 12 ───────────────────────── */
{
  id:'usurpacion-sanagasta',
  modulos:['contra','directo'],
  caratula:'F. c/ GÓMEZ, Marta y otros s/ usurpación',
  delito:'Usurpación por despojo (art. 181 inc. 1 CP)',
  sintesis:'El 11 de octubre, un grupo de personas habría ingresado a un inmueble rural de Sanagasta, propiedad de Héctor Villafañe, instalando construcciones precarias.',
  hechos:'Villafañe es titular registral desde 1998. Sostiene que el predio estaba cercado y que concurría periódicamente. Los ocupantes afirman que el inmueble estaba abandonado hacía más de una década y que ingresaron sin violencia. No hay constancia de denuncia previa por intrusión. La fiscalía pidió el desalojo del art. 126.',
  prueba:[
    {tipo:'Título de propiedad', detalle:'Escritura e inscripción registral a nombre de H. Villafañe, año 1998.'},
    {tipo:'Acta de constatación', detalle:'Del 14/10. Cinco construcciones precarias y alambrado perimetral caído.'},
    {tipo:'Declaración de Héctor Villafañe', detalle:'Denunciante y titular registral.'},
    {tipo:'Informe municipal', detalle:'Sin registro de servicios ni de tributos abonados sobre el inmueble desde 2013.'}
  ],
  testigo:{genero:'m', nombre:'Héctor Villafañe', calidad:'denunciante y titular registral',
    perfil:'68 años, comerciante retirado, vive en Capital. Convencido de su derecho y molesto por tener que explicar por qué no iba al campo. Confunde el derecho de propiedad con la posesión efectiva.'},
  previa:'Que el declarante es titular registral del inmueble rural identificado catastralmente, ubicado en el paraje La Quebrada, departamento Sanagasta, adquirido en el año 1998. Que el predio se encontraba cercado con alambrado perimetral y que el declarante concurría periódicamente a controlarlo. Que el día 11 de octubre tomó conocimiento por comentarios de vecinos de que un grupo de personas había ingresado al predio y levantado construcciones. Que nunca autorizó a persona alguna a ocupar el inmueble.',
  contexto:{
    ocupacion:'Soy comerciante retirado. Tuve una casa de repuestos.',
    domicilio:'Vivo en la Capital, en el centro.',
    estudios:'Secundario completo.',
    familia:'Casado, dos hijos grandes.',
    relacionImputado:'A esa gente no la conozco de nada.',
    interes:'Quiero que me devuelvan mi campo, que lo compré con mi trabajo.',
    antes:'Ese día yo estaba en la Capital, en mi casa.',
    despues:'Cuando me avisaron fui hasta allá a ver y después denuncié.',
    conto:'Lo hablé con mi abogado enseguida.',
    consecuencias:'No puedo usar el campo desde entonces.'
  },
  sobre:{
    verdad:'Villafañe no concurre al predio desde 2015. El alambrado estaba caído hacía años. No pagó tributos ni mantuvo el inmueble. Tomó conocimiento de la ocupación por un llamado, no por una visita. Es titular registral, pero perdió la posesión efectiva mucho antes del ingreso de los ocupantes.',
    puntos:[
      'No concurre al predio desde hace años; la periodicidad que afirma no tiene respaldo.',
      'El alambrado perimetral estaba caído según el acta de constatación.',
      'No hay pago de tributos ni servicios desde 2013.',
      'Tomó conocimiento del hecho por comentarios de terceros, no por constatación propia.'
    ],
    conducta:'Se apoya en el título. Si le preguntan cuándo estuvo por última vez, esquiva. Si insisten con fechas concretas, no puede sostener la periodicidad.'},
  banco:[
    {claves:'titulo propiedad escritura registral dueño adquirio', texto:'Soy el dueño. Lo compré en el 98 y está escriturado a mi nombre.', corto:'Sí, soy el titular.'},
    {claves:'concurria iba visitaba controlaba periodicamente frecuencia', texto:'Iba periódicamente a controlar el campo.', corto:'Sí, iba periódicamente.', extra:'Es mi campo, lo compré con el esfuerzo de toda mi vida, cómo no voy a ir.'},
    {claves:'ultima vez cuando estuvo fecha año 2015 concretamente', texto:'La última vez… hace un tiempo ya. No le podría precisar.', corto:'No le podría precisar.', reservado:true},
    {claves:'alambrado cerco perimetral estado caido roto', texto:'El campo estaba cercado con alambrado.', corto:'Sí, estaba cercado.'},
    {claves:'alambrado caido acta constatacion estado mantenimiento arreglo', texto:'Si el acta dice que estaba caído, será por el paso del tiempo.', corto:'Puede ser.', reservado:true},
    {claves:'impuestos tributos servicios pago municipal', texto:'De los impuestos se encargaba mi contador.', corto:'Se encargaba mi contador.', reservado:true},
    {claves:'2013 sin pagos deuda constancia', texto:'No estoy al tanto de eso.', corto:'No estoy al tanto.', reservado:true},
    {claves:'como se entero conocimiento aviso vecinos llamado', texto:'Me avisaron unos vecinos que había gente adentro.', corto:'Me avisaron vecinos.', reservado:true},
    {claves:'autorizo permiso presto cedio ocupantes', texto:'Nunca autoricé a nadie a entrar ahí.', corto:'Nunca autoricé a nadie.'},
    {claves:'vive capital domicilio donde reside distancia', texto:'Yo vivo en la Capital.', corto:'En la Capital.'}
  ]
},

/* ───────────────────────── 13 ───────────────────────── */
{
  id:'resistencia-preventor',
  modulos:['contra','directo'],
  caratula:'F. c/ ALBORNOZ, Jonatan s/ resistencia a la autoridad y lesiones',
  delito:'Resistencia a la autoridad en concurso con lesiones leves (arts. 239 y 89 CP)',
  sintesis:'El 23 de febrero, durante un operativo en la Plaza del Sol, Jonatan Albornoz habría resistido su aprehensión y lesionado al agente Cristian Toledo.',
  hechos:'El procedimiento se originó en un llamado por disturbios. Albornoz fue reducido en la vía pública. El agente Toledo presenta excoriación en el antebrazo derecho. Albornoz ingresó a la comisaría con lesiones en el rostro y en la región costal, constatadas por el médico policial. Hay un video de un particular que registra parte del procedimiento.',
  prueba:[
    {tipo:'Acta de procedimiento', detalle:'Suscripta por los agentes Toledo y Villagra.'},
    {tipo:'Informe médico del agente Toledo', detalle:'Excoriación en antebrazo derecho.'},
    {tipo:'Informe del médico policial sobre Albornoz', detalle:'Hematoma malar izquierdo y contusión costal derecha.'},
    {tipo:'Video de particular', detalle:'42 segundos. Registra el momento de la reducción desde unos 15 metros.'}
  ],
  testigo:{genero:'m', nombre:'Agente Cristian Toledo', calidad:'preventor y damnificado',
    perfil:'28 años, cuatro años en la fuerza. Está a la vez como testigo y como víctima, lo que compromete su imparcialidad. Recita el acta. Si se aparta del acta, se contradice.'},
  previa:'Que el declarante, junto al agente Villagra, fue comisionado a la Plaza del Sol por un llamado al 911 referido a disturbios en la vía pública. Que al arribar observaron a un masculino en actitud agresiva, a quien se procedió a identificar. Que el nombrado se negó a identificarse y comenzó a proferir insultos hacia el personal. Que al intentar reducirlo, el mismo forcejeó violentamente, ocasionándole al declarante una lesión en el antebrazo derecho. Que finalmente fue reducido con el auxilio del agente Villagra y trasladado a la dependencia.',
  contexto:{
    ocupacion:'Soy agente de la Policía de la Provincia, hace cuatro años.',
    domicilio:'Vivo en la Capital.',
    estudios:'Secundario y escuela de policía.',
    familia:'En pareja, sin hijos.',
    relacionImputado:'No lo conocía. Lo vi en el procedimiento.',
    interes:'Yo soy el damnificado de las lesiones, además del preventor.',
    antes:'Estábamos de recorrida con el agente Villagra cuando entró el llamado.',
    compania:'Iba con el agente Villagra en el móvil.',
    despues:'Lo trasladamos a la dependencia y labramos el acta.',
    policia:'Yo soy el personal que intervino.',
    consecuencias:'Estuve con la curación unos días, nada grave.',
    preparacion:'Leí el acta antes de venir.'
  },
  sobre:{
    verdad:'Albornoz estaba alterado pero no agredió. Durante la reducción recibió dos golpes que no constan en el acta. La excoriación de Toledo se produjo al caer ambos sobre el cordón. El video muestra que Albornoz ya estaba en el suelo cuando se le aplican los golpes, y que el forcejeo duró menos de lo que dice el acta.',
    puntos:[
      'El acta no consigna las lesiones que Albornoz presentaba al ingresar a la dependencia.',
      'El video registra la secuencia y contradice la duración y el orden del forcejeo.',
      'Toledo es simultáneamente testigo y damnificado.',
      'La excoriación es compatible con la caída de ambos, no necesariamente con una agresión.'
    ],
    conducta:'Recita el acta con seguridad. Si se le pide que describa la secuencia paso a paso, empieza a dudar. Si se lo confronta con el video, intenta explicar y se enreda.'},
  banco:[
    {claves:'llamado 911 disturbios comisionado motivo operativo', texto:'Fuimos comisionados por un llamado al 911 por disturbios.', corto:'Por un llamado al 911.'},
    {claves:'actitud agresiva observaron llegaron encontraron', texto:'Al llegar vimos a un masculino en actitud agresiva.', corto:'Sí, en actitud agresiva.', extra:'Estaba totalmente fuera de sí, gritándole a la gente que pasaba.'},
    {claves:'que hizo concretamente gesto accion agresion golpeo', texto:'Se negó a identificarse y comenzó a insultar al personal.', corto:'Se negó y nos insultó.'},
    {claves:'golpeo pego trompada patada a usted agredio', texto:'Forcejeó violentamente.', corto:'Forcejeó.', reservado:true},
    {claves:'lesion antebrazo excoriacion como se produjo raspon', texto:'Tengo una excoriación en el antebrazo derecho.', corto:'Sí, en el antebrazo.'},
    {claves:'cayeron suelo piso cordon caida ambos', texto:'En el forcejeo caímos al piso los dos.', corto:'Sí, caímos los dos.', reservado:true},
    {claves:'lesiones albornoz imputado cara costilla hematoma constato', texto:'Eso lo habrá constatado el médico policial.', corto:'Eso lo constató el médico.', reservado:true},
    {claves:'acta consigno escribio no figura lesiones imputado', texto:'En el acta se consignó lo relativo al procedimiento.', corto:'Se consignó el procedimiento.', reservado:true},
    {claves:'video filmacion particular grabacion imagenes', texto:'Sé que hay un video, sí.', corto:'Sé que hay un video.'},
    {claves:'cuanto duro forcejeo tiempo segundos minutos', texto:'Fue un forcejeo intenso. No le podría decir cuánto duró.', corto:'No sabría decirle.', reservado:true},
    {claves:'damnificado victima denunciante rol doble testigo', texto:'Soy el damnificado de las lesiones, sí.', corto:'Sí, soy el damnificado.', reservado:true},
    {claves:'villagra companero auxilio otro agente', texto:'Me auxilió el agente Villagra para reducirlo.', corto:'Sí, con Villagra.'}
  ]
},

/* ─────────────── 14 a 17 · AUDIENCIAS DE MEDIDAS DE COERCIÓN ─────────────── */
{
  id:'cautelar-robo', modulos:['cautelar'],
  caratula:'F. c/ PEREYRA, Maximiliano s/ robo agravado — audiencia del art. 130',
  delito:'Robo agravado por el uso de arma (art. 166 inc. 2 CP)',
  sintesis:'La fiscalía solicita la prisión preventiva de Maximiliano Pereyra, de 27 años, detenido en flagrancia el 4 de abril tras el robo de una motocicleta en calle Perú al 600.',
  hechos:'Pereyra fue aprehendido a tres cuadras, en poder del rodado. Tiene domicilio en el barrio Ñuñorco, donde vive con su madre y una hija de 4 años. Trabaja de manera informal en una gomería. Registra una condena condicional de 2023 por hurto simple. No registra rebeldías. La escala penal del delito imputado va de 5 a 15 años.',
  prueba:[
    {tipo:'Acta de aprehensión en flagrancia', detalle:'Del 4/4 a las 20:50, a tres cuadras del hecho.'},
    {tipo:'Certificado de antecedentes', detalle:'Condena condicional de 2023 por hurto simple, art. 162 CP.'},
    {tipo:'Informe socioambiental', detalle:'Domicilio constatado. Convive con su madre y su hija de 4 años.'},
    {tipo:'Constancia laboral', detalle:'Nota del titular de la gomería donde trabaja sin registrar.'}
  ],
  imputado:{nombre:'Maximiliano Pereyra', perfil:'27 años, gomero informal, domicilio constatado en barrio Ñuñorco, convive con su madre y una hija de 4 años. Condena condicional de 2023. Sin rebeldías previas.'},
  debate:{
    fiscal:{
      conviccion:'La aprehensión fue en flagrancia, a tres cuadras del hecho y con el rodado en su poder. El mérito sustantivo del art. 127 inciso 1 no admite discusión seria en este expediente.',
      arraigo:'La defensa invoca arraigo, pero se trata de un trabajo informal, sin registración ni recibo. Un empleo que no está documentado no ata a nadie al proceso, y el art. 128 habla de asiento de los negocios o trabajo, no de una nota del dueño de una gomería.',
      conducta:'Es cierto que no registra rebeldías, pero tiene una condena condicional de 2023. Esa condena impide una nueva condicional, y el pronóstico es de pena de cumplimiento efectivo. Es precisamente eso lo que incrementa el incentivo a sustraerse.',
      entorpecimiento:'No invoco entorpecimiento, su señoría. Mi pedido se apoya exclusivamente en el peligro de fuga del art. 128, y la defensa está contestando algo que no planteé.',
      alternativa:'Las medidas que ofrece la defensa se apoyan todas en el mismo domicilio cuya estabilidad no está acreditada. Una presentación periódica exige un domicilio real; el dispositivo de rastreo exige quien lo controle. La escala del art. 166 va de cinco a quince años.',
      limitaciones:'El art. 124 inciso 1 no opera acá: con la condena condicional de 2023 vigente, no hay posibilidad de una nueva condena condicional. La limitación que invoca la defensa está fuera de este caso.',
      plazo:'Solicito la medida por el plazo de tres meses del art. 130, con investigación de cuatro meses.',
      apertura:'Su señoría, la fiscalía solicita la prisión preventiva de Maximiliano Pereyra por el plazo de tres meses.',
      cierre:'Mantengo el pedido en los términos expuestos.'
    },
    defensa:{
      conviccion:'No discuto el mérito sustantivo. Lo que discuto es que el mérito no es un peligro procesal: son dos requisitos distintos del art. 127 y la fiscalía los está fundiendo en uno solo.',
      arraigo:'El informe socioambiental constató el domicilio en barrio Ñuñorco, la convivencia con la madre y una hija de cuatro años. La informalidad del trabajo es la regla en La Rioja, no un indicio de fuga: si la informalidad laboral fundara el peligro procesal, la preventiva sería la regla para los pobres.',
      conducta:'Mi asistido nunca fue declarado rebelde, jamás ocultó su identidad ni dio domicilio falso. El art. 128 inciso 2 mide el comportamiento durante el procedimiento, y el suyo es intachable. La condena anterior es un antecedente, no una conducta procesal.',
      entorpecimiento:'No hay ningún indicio de entorpecimiento y la fiscalía ni siquiera lo invocó. La aprehensión fue en flagrancia: la prueba está producida y no hay testigos sobre quienes influir.',
      alternativa:'El art. 116 último párrafo es imperativo. Ofrezco presentación periódica semanal, prohibición de salir del ámbito territorial y dispositivo de rastreo, en forma combinada. Si la fiscalía sostiene que no alcanzan, tiene que explicar por qué, no simplemente afirmarlo.',
      limitaciones:'Aun con el antecedente, corresponde analizar la ejecución morigerada de la ley 24.660, que el art. 124 inciso 1 contempla expresamente además de la condicional.',
      plazo:'Si se impusiera alguna medida, debe serlo por plazo determinado y el más breve posible.',
      apertura:'Su señoría, la defensa se opone a la prisión preventiva y ofrece medidas alternativas.',
      cierre:'Mantengo la oposición y el ofrecimiento de medidas alternativas.'
    }
  },
  sobre:{
    verdad:'El arraigo es real y verificable. La condena condicional de 2023 impide una nueva condicional, lo que agrava el pronóstico de pena efectiva y por tanto el peligro de fuga. No hay ningún indicio concreto de entorpecimiento: no hay testigos a los que pueda influir, porque la aprehensión fue en flagrancia.',
    puntos:[
      'Hay arraigo constatado: domicilio, familia a cargo y trabajo, aunque informal (art. 128.1).',
      'No hay rebeldías ni ocultamiento de identidad: el comportamiento procesal previo es favorable (art. 128.2).',
      'No hay peligro de entorpecimiento identificable: la prueba está producida y la aprehensión fue en flagrancia (art. 129).',
      'El antecedente condicional agrava el pronóstico de pena, pero por sí solo no es un peligro procesal.',
      'Existen medidas menos gravosas del art. 116 que pueden combinarse: presentación periódica, prohibición de salir del ámbito territorial y dispositivo de rastreo.'
    ],
    conducta:''}
},
{
  id:'cautelar-genero', modulos:['cautelar'],
  caratula:'F. c/ SALVATIERRA, Rubén s/ lesiones leves agravadas — audiencia del art. 130',
  delito:'Lesiones leves agravadas por el vínculo y por mediar violencia de género (arts. 89 y 92 CP)',
  sintesis:'La fiscalía pide una medida de coerción respecto de Rubén Salvatierra, de 41 años, por hechos de violencia contra su pareja, con quien convive.',
  hechos:'Es el tercer episodio denunciado en catorce meses. Los dos anteriores terminaron archivados por falta de impulso de la víctima. Salvatierra tiene domicilio y trabajo estables como empleado municipal. La víctima convive con él y con dos hijos menores en la vivienda, que está a nombre de ella. Hay informe de riesgo de la Dirección de Violencia de Género que califica el riesgo como alto.',
  prueba:[
    {tipo:'Informe de riesgo', detalle:'Dirección de Violencia de Género. Nivel de riesgo: alto.'},
    {tipo:'Antecedentes de denuncias', detalle:'Dos denuncias previas en 14 meses, archivadas.'},
    {tipo:'Informe médico', detalle:'Excoriaciones en cuello y antebrazos.'},
    {tipo:'Constancia laboral', detalle:'Empleado municipal con 12 años de antigüedad.'}
  ],
  imputado:{nombre:'Rubén Salvatierra', perfil:'41 años, empleado municipal, 12 años de antigüedad. Convive con la víctima y dos hijos menores. Sin antecedentes condenatorios. Tres denuncias en 14 meses.'},
  debate:{
    fiscal:{
      conviccion:'El informe médico constata excoriaciones en cuello y antebrazos, y el informe de la Dirección de Violencia de Género califica el riesgo como alto. El mérito está acreditado.',
      arraigo:'Concedo el arraigo: es empleado municipal con doce años de antigüedad. No fundo mi pedido en el peligro de fuga, y la defensa está litigando contra un argumento que no hice.',
      conducta:'Hay dos denuncias previas en catorce meses, ambas archivadas por falta de impulso de la víctima. Ese patrón no es casual y es exactamente el indicio que el art. 129 pide.',
      entorpecimiento:'El art. 129 inciso 4 de la Ley 10.797 es nuevo y está hecho para este caso: contempla los actos intimidatorios o amenazantes contra la víctima o su familia. Dos archivos por desistimiento de la víctima, conviviendo con el imputado, configuran el riesgo que la norma quiere evitar.',
      alternativa:'Puedo aceptar que la preventiva sea el último recurso, pero la exclusión sola no basta si mantiene el contacto. Solicito exclusión del hogar del inciso 7, prohibición de comunicación del inciso 6 y dispositivo de rastreo del inciso 9, en forma combinada.',
      limitaciones:'El art. 124 no obsta a las medidas del art. 116 que estoy pidiendo: solo limita la prisión preventiva.',
      plazo:'Solicito las medidas por el plazo de tres meses.',
      apertura:'Su señoría, la fiscalía solicita medidas de coerción respecto de Rubén Salvatierra.',
      cierre:'Mantengo el pedido de exclusión y prohibición de contacto.'
    },
    defensa:{
      conviccion:'El informe médico describe lesiones compatibles con múltiples mecanismos. El informe de riesgo es una evaluación técnica, no una acreditación del hecho.',
      arraigo:'Mi asistido tiene empleo público con doce años de antigüedad y domicilio estable. No hay ningún peligro de fuga y la fiscalía lo reconoce.',
      conducta:'Las dos denuncias anteriores fueron archivadas. Un archivo no es un antecedente en contra: es la constatación de que no se acreditó el hecho. Construir el peligro procesal sobre causas archivadas es invertir la presunción de inocencia.',
      entorpecimiento:'El art. 129 exige vehementes indicios que justifiquen la grave sospecha. La fiscalía no aporta un solo acto concreto de intimidación: infiere la presión a partir del desistimiento, que también puede explicarse por la dependencia económica y por la voluntad de la víctima de sostener la convivencia.',
      alternativa:'La vivienda está a nombre de la víctima, así que la exclusión del art. 116 inciso 7 es materialmente posible y neutraliza el riesgo sin privar de libertad. Lo que resisto es que se agregue el dispositivo de rastreo, que es la medida inmediatamente anterior a la privación de libertad.',
      limitaciones:'Se trata de lesiones leves: la pena en expectativa admite condena condicional y el art. 124 inciso 1 bloquea de plano la prisión preventiva.',
      plazo:'Cualquier medida debe tener plazo determinado y revisión.',
      apertura:'Su señoría, la defensa acepta discutir medidas, pero no la privación de libertad.',
      cierre:'Mantengo lo expuesto.'
    }
  },
  sobre:{
    verdad:'No hay peligro de fuga: arraigo fuerte y empleo público. El riesgo real está en el art. 129, que la Ley 10.797 ya no titula solo como peligro de entorpecimiento sino como PELIGRO DE ENTORPECIMIENTO Y RIESGO DE LA VÍCTIMA, y que en su inciso 4 contempla expresamente los actos intimidatorios o amenazantes contra la víctima o su familia y la violación de las cautelares impuestas. La medida adecuada no es la preventiva sino la del art. 116 inc. 7 combinada con el inc. 6 y el inc. 9.',
    puntos:[
      'El arraigo es fuerte: empleo público estable, doce años de antigüedad y domicilio. El peligro de fuga del art. 128 es débil y conviene concederlo de entrada.',
      'El inc. 4 del art. 129 es el que rige este caso: contempla los actos intimidatorios contra la víctima como riesgo procesal autónomo, sin necesidad de forzar el inciso sobre influencia en testigos.',
      'El patrón de dos archivos por falta de impulso de la víctima es el indicio concreto que exige el art. 129: no alcanza con invocar el riesgo en abstracto.',
      'El informe de riesgo alto es el respaldo del peligro, pero hay que bajarlo a hechos: qué conducta concreta se teme y por qué.',
      'El art. 116 inc. 7 prevé específicamente el abandono inmediato del domicilio cuando se trate de hechos de violencia doméstica y la víctima conviva con el imputado, que es exactamente este supuesto.',
      'La vivienda está a nombre de la víctima, lo que despeja el obstáculo habitual a la exclusión.',
      'La prisión preventiva es el último recurso del art. 116: si el peligro se neutraliza con exclusión, prohibición de contacto y dispositivo de rastreo, el juez DEBE imponer esas, por un plazo predeterminado y en forma combinada (art. 116, último párrafo).'
    ],
    conducta:''}
},
{
  id:'cautelar-entorpecimiento', modulos:['cautelar'],
  caratula:'F. c/ ROLDÁN, Fabián s/ defraudación por administración fraudulenta — audiencia del art. 130',
  delito:'Administración fraudulenta (art. 173 inc. 7 CP)',
  sintesis:'La fiscalía solicita prisión preventiva de Fabián Roldán, contador de una cooperativa, por el desvío de fondos por $34.000.000 durante dos ejercicios.',
  hechos:'Roldán tiene 53 años, estudio contable propio, domicilio y familia en la ciudad. No tiene antecedentes. Sigue teniendo acceso al sistema informático de la cooperativa y a la documentación respaldatoria, que aún no fue secuestrada en su totalidad. Dos empleadas de la cooperativa denunciaron haber recibido llamados suyos "para ordenar la versión".',
  prueba:[
    {tipo:'Pericia contable preliminar', detalle:'Desvíos por $34.000.000 en dos ejercicios.'},
    {tipo:'Declaraciones de dos empleadas', detalle:'Refieren llamados del imputado posteriores a la denuncia.'},
    {tipo:'Informe de la cooperativa', detalle:'El imputado conserva credenciales de acceso al sistema.'},
    {tipo:'Informe socioambiental', detalle:'Domicilio y arraigo familiar constatados. Sin antecedentes.'}
  ],
  imputado:{nombre:'Fabián Roldán', perfil:'53 años, contador público, estudio propio, casado, dos hijos mayores. Sin antecedentes. Arraigo sólido.'},
  debate:{
    fiscal:{
      conviccion:'La pericia contable preliminar determinó desvíos por treinta y cuatro millones de pesos en dos ejercicios. El mérito sustantivo está sobradamente acreditado.',
      arraigo:'Concedo el arraigo: estudio propio, familia, sin antecedentes. No es el peligro de fuga lo que fundo.',
      conducta:'No hay antecedentes, es cierto. Pero hay conducta posterior al hecho: dos empleadas declararon haber recibido llamados del imputado después de la denuncia.',
      entorpecimiento:'Acá está el núcleo. El art. 129 se configura en sus tres primeros incisos: conserva credenciales de acceso al sistema donde está el soporte documental, llamó a dos testigos después de la denuncia, y por su posición puede inducir a otros empleados. No es una posibilidad abstracta: son hechos verificados.',
      alternativa:'Puedo aceptar que existan medidas menos gravosas, pero deben ser eficaces. La prohibición de comunicación por sí sola no impide el acceso remoto al sistema.',
      limitaciones:'El art. 124 inciso 1 podría jugar, lo reconozco, y por eso mi pedido principal contempla medidas del art. 116.',
      plazo:'Solicito las medidas por tres meses, mientras se completa el secuestro documental.',
      apertura:'Su señoría, la fiscalía solicita medidas respecto de Fabián Roldán por riesgo de entorpecimiento.',
      cierre:'Mantengo el pedido.'
    },
    defensa:{
      conviccion:'Es una pericia preliminar, no definitiva, y no distingue entre desvío y error de registración.',
      arraigo:'Contador público, estudio propio, casado, dos hijos mayores, sin antecedentes. No hay discusión posible sobre el arraigo.',
      conducta:'Los llamados que se invocan fueron para pedir documentación de su propio descargo. Eso es ejercicio del derecho de defensa, y el art. 116 inciso 6 condiciona expresamente la prohibición de comunicarse a que no se afecte ese derecho.',
      entorpecimiento:'Si el peligro es el acceso al sistema, la solución es el bloqueo de credenciales y el secuestro del soporte, no la prisión de una persona. Neutralizado el medio, desaparece el peligro y con él el fundamento de la medida.',
      alternativa:'El art. 116 último párrafo es imperativo: acreditado que existe una medida menos gravosa idónea, el juez debe imponer esa. Ofrezco prohibición de contacto con el personal de la cooperativa, salvo por intermedio de esta defensa, y entrega de credenciales.',
      limitaciones:'El art. 124 inciso 1 es decisivo: la pena en expectativa admite condena condicional, de modo que la prisión preventiva está bloqueada de plano.',
      plazo:'Si se dispone alguna medida, debe fijarse plazo breve y revisable.',
      apertura:'Su señoría, la defensa se opone a la prisión preventiva.',
      cierre:'Mantengo la oposición.'
    }
  },
  sobre:{
    verdad:'El arraigo es indiscutible y la pena en expectativa admitiría condicional, lo que activa el art. 124 inc. 1. Pero el peligro de entorpecimiento del art. 129 está acreditado en sus tres incisos: acceso al soporte documental, llamados a testigos y capacidad de inducir a otros. La solución del código no es la preventiva sino medidas del art. 116 dirigidas a neutralizar ese peligro específico.',
    puntos:[
      'El art. 124 inc. 1 bloquea la prisión preventiva si pudiera aplicarse condena condicional.',
      'El arraigo es sólido y no hay peligro de fuga serio (art. 128).',
      'El peligro de entorpecimiento sí está acreditado: acceso al sistema y llamados a testigos (art. 129 incs. 1 y 2).',
      'La medida idónea es la prohibición de comunicarse con personas determinadas (art. 116 inc. 6), que el código condiciona a que no se afecte el derecho de defensa.',
      'Corresponde además el secuestro del soporte documental y el bloqueo de credenciales, que neutralizan el peligro sin privar de libertad.'
    ],
    conducta:''}
},
{
  id:'cautelar-cese', modulos:['cautelar'],
  caratula:'F. c/ HERRERA, Luis s/ robo — audiencia de cese de prisión preventiva (art. 132)',
  delito:'Robo simple (art. 164 CP)',
  sintesis:'La defensa solicita el cese de la prisión preventiva de Luis Herrera, que lleva siete meses detenido sin que se haya formulado acusación.',
  hechos:'La prisión preventiva se dictó el 2 de febrero por tres meses y se renovó una vez. La etapa preparatoria venció el 2 de junio y la fiscalía obtuvo una prórroga hasta el 2 de agosto. Al día de la audiencia no hay acusación presentada. El mínimo de la escala penal del art. 164 es de un mes.',
  prueba:[
    {tipo:'Resolución de prisión preventiva', detalle:'Del 2/2, por el plazo de tres meses.'},
    {tipo:'Resolución de renovación', detalle:'Del 2/5, por tres meses más.'},
    {tipo:'Resolución de prórroga de la etapa preparatoria', detalle:'Hasta el 2/8.'},
    {tipo:'Constancia de la oficina judicial', detalle:'Sin requerimiento de apertura a juicio a la fecha.'}
  ],
  imputado:{nombre:'Luis Herrera', perfil:'34 años, siete meses en prisión preventiva, sin acusación formulada.'},
  debate:{
    fiscal:{
      conviccion:'El mérito que sostuvo la preventiva no se ha modificado, su señoría.',
      arraigo:'El arraigo es el mismo que se valoró al disponerse la medida, y entonces no alcanzó.',
      conducta:'La demora obedece a la complejidad de la prueba pendiente, no a una inactividad de esta fiscalía.',
      entorpecimiento:'Subsisten los riesgos que fundaron la medida original.',
      alternativa:'De disponerse el cese, solicito que se impongan medidas del art. 116 para asegurar la comparecencia.',
      limitaciones:'Las limitaciones del art. 124 no fueron invocadas en la oportunidad correspondiente.',
      plazo:'Solicito una última prórroga para formular acusación.',
      apertura:'Su señoría, la fiscalía se opone al cese solicitado por la defensa.',
      cierre:'Mantengo la oposición al cese.'
    },
    defensa:{
      conviccion:'El mérito no está en discusión en esta audiencia. Lo que se discute es el vencimiento de un plazo, y los plazos no dependen del mérito.',
      arraigo:'Tampoco discutimos arraigo. El art. 132 opera por el mero vencimiento, sin necesidad de valorar peligros procesales.',
      conducta:'La complejidad de la prueba no suspende los plazos. El art. 132 inciso 1 no admite excepción por carga de trabajo.',
      entorpecimiento:'Es indiferente: el cese del art. 132 es automático y no habilita a revisar los peligros procesales.',
      alternativa:'El cese procede sin perjuicio de otras medidas del art. 116, pero la libertad no puede condicionarse a ellas.',
      limitaciones:'Además del inciso 1, opera el inciso 7: el mínimo del art. 164 es de un mes y mi asistido lleva siete en prisión preventiva.',
      plazo:'La prórroga venció el 2 de agosto y no hubo acusación. No hay plazo que prorrogar.',
      apertura:'Su señoría, la defensa solicita el cese de la prisión preventiva por vencimiento de los plazos del art. 132.',
      cierre:'Solicito el cese inmediato y la libertad de mi asistido.'
    }
  },
  sobre:{
    verdad:'Operan dos causales de cese autónomas. El art. 132 inc. 1 se configuró al vencer la prórroga sin acusación. Y el inc. 7 se configuró mucho antes, porque el mínimo del art. 164 es de un mes. El código dispone que vencidos los plazos la persona queda automáticamente en libertad y que no puede volver a imponerse la preventiva cuando cesó por estas razones.',
    puntos:[
      'Art. 132 inc. 1: venció el plazo de la investigación, con su prórroga, sin que se formulara acusación.',
      'Art. 132 inc. 7: se alcanzó largamente el mínimo legal de la escala penal aplicable, que en el art. 164 es de un mes.',
      'Vencidos los plazos, la libertad es automática: no depende de una valoración de peligros procesales.',
      'No puede imponerse nuevamente la preventiva cuando una anterior cesó por estas causales.',
      'Ello sin perjuicio de otras medidas del art. 116 para asegurar la comparecencia.'
    ],
    conducta:''}
},

/* ─────────────── 18 a 20 · ALEGATOS ─────────────── */
{
  id:'alegato-reconocimiento', modulos:['apertura','clausura'],
  caratula:'F. c/ QUIROGA, Ramón Alberto s/ robo agravado',
  delito:'Robo agravado por el uso de arma de fuego (art. 166 inc. 2 CP)',
  sintesis:'Juicio por el robo del 14 de marzo en barrio Vargas. Toda la acusación descansa en el reconocimiento de la víctima.',
  hechos:'Se produjo en la audiencia el testimonio de la víctima, Gustavo Nieva, quien sostuvo estar seguro del reconocimiento pese a haber declarado en sede policial que no le vio bien la cara por la capucha. Se incorporó el informe de alumbrado que acredita dos luminarias fuera de servicio. No se secuestró arma. El teléfono apareció en poder de un tercero que declaró haberlo comprado en una feria.',
  prueba:[
    {tipo:'Testimonio de Gustavo Nieva', detalle:'Sostuvo el reconocimiento; admitió que la observación duró segundos.'},
    {tipo:'Informe de alumbrado', detalle:'Dos de tres luminarias fuera de servicio.'},
    {tipo:'Acta de rueda de reconocimiento', detalle:'Del 18/3.'},
    {tipo:'Testimonio de Julio Sosa', detalle:'Compró el teléfono en la feria. No conoce al imputado.'}
  ],
  imputado:{nombre:'Ramón Alberto Quiroga', perfil:'24 años. Niega el hecho. Sin condenas.'},
  sobre:{
    verdad:'El caso se juega entero en la fiabilidad del reconocimiento. La fiscalía debe sostener la identificación pese a las condiciones de percepción; la defensa debe mostrar que un reconocimiento en esas condiciones no supera el estándar del art. 187.',
    puntos:[
      'La identificación es el único elemento que vincula al imputado con el hecho.',
      'Las condiciones de percepción fueron adversas: segundos, de perfil, con capucha y sin iluminación.',
      'La declaración previa admite expresamente que no le vio bien la cara.',
      'El hallazgo del teléfono en poder de un tercero ajeno no cierra el círculo: lo abre.',
      'Cuidado con el argumento por la ignorancia: que nadie haya declarado otra cosa no acredita la autoría.'
    ],
    conducta:''}
},
{
  id:'alegato-indiciario', modulos:['apertura','clausura'],
  caratula:'F. c/ MOYANO, Elba s/ incendio',
  delito:'Incendio con peligro común para los bienes (art. 186 inc. 1 CP)',
  sintesis:'Juicio por el incendio de un galpón de acopio en Famatina, ocurrido el 30 de julio. No hay testigos presenciales: el caso es íntegramente indiciario.',
  hechos:'Se acreditó que la imputada mantenía un conflicto comercial con el propietario, que estuvo en la zona esa tarde, que compró un bidón de combustible dos días antes y que el peritaje determinó inicio intencional con acelerante. También se acreditó que el galpón tenía instalación eléctrica deficiente y que la imputada usa combustible habitualmente para una bomba de riego.',
  prueba:[
    {tipo:'Pericia de bomberos', detalle:'Inicio intencional. Presencia de acelerante compatible con nafta.'},
    {tipo:'Registro de compra de combustible', detalle:'Bidón de 10 litros adquirido dos días antes.'},
    {tipo:'Testimonios sobre el conflicto comercial', detalle:'Deuda impaga entre las partes.'},
    {tipo:'Informe sobre la instalación eléctrica', detalle:'Tablero sin protección térmica, cableado antiguo.'}
  ],
  imputado:{nombre:'Elba Moyano', perfil:'49 años, productora. Niega el hecho. Sin antecedentes.'},
  sobre:{
    verdad:'Es el caso ideal para discutir lógica en el alegato. La acusación debe mostrar que los indicios convergen y se refuerzan; la defensa, que cada uno admite explicación alternativa y que la convergencia es aparente.',
    puntos:[
      'Cuidado con la causa falsa: comprar combustible antes del incendio es antecedente temporal, no causa.',
      'Cuidado con la falacia de composición y de división al valorar el cuadro indiciario: ni la suma de indicios débiles es automáticamente fuerte, ni la fuerza del conjunto se transmite a cada indicio.',
      'Los arts. 19 y 218 mandan valoración integral según la sana crítica: hay que mostrar cómo se articulan los indicios, no enumerarlos.',
      'La hipótesis alternativa del cortocircuito debe ser descartada, no ignorada.',
      'La petición debe ser concreta (art. 217), incluida la calificación y el monto de pena.'
    ],
    conducta:''}
},
{
  id:'alegato-legitima-defensa', modulos:['apertura','clausura'],
  caratula:'F. c/ ARAYA, Sergio s/ lesiones graves',
  delito:'Lesiones graves (art. 90 CP) — se invoca legítima defensa (art. 34 inc. 6 CP)',
  sintesis:'Juicio por las lesiones sufridas por Ariel Ferreyra el 6 de junio en la vía pública. El imputado reconoce el hecho y alega legítima defensa.',
  hechos:'Se acreditó que Ferreyra ingresó al domicilio de Araya tras una discusión previa, que estaba armado con un palo y que Araya lo golpeó con una llave cruz que tenía en la mano por estar reparando su vehículo. Ferreyra sufrió fractura de maxilar. Araya presenta lesiones leves en el antebrazo. Hubo dos golpes: el segundo cuando Ferreyra ya estaba en el suelo.',
  prueba:[
    {tipo:'Informe médico de Ferreyra', detalle:'Fractura de maxilar inferior.'},
    {tipo:'Informe médico de Araya', detalle:'Excoriaciones en antebrazo izquierdo, compatibles con defensa.'},
    {tipo:'Acta de inspección ocular', detalle:'Palo secuestrado en el interior del domicilio del imputado.'},
    {tipo:'Testimonio de vecina', detalle:'Escuchó la discusión y vio a Ferreyra ingresar al domicilio.'}
  ],
  imputado:{nombre:'Sergio Araya', perfil:'44 años, mecánico. Reconoce el hecho e invoca legítima defensa.'},
  sobre:{
    verdad:'Los tres requisitos del art. 34 inc. 6 se discuten por separado y el caso se define en el segundo golpe. La agresión ilegítima está acreditada. La falta de provocación suficiente es discutible por la discusión previa. La racionalidad del medio se rompe con el segundo golpe, cuando la agresión ya había cesado.',
    puntos:[
      'Hay que litigar requisito por requisito, no en bloque: agresión ilegítima, necesidad racional del medio y falta de provocación suficiente.',
      'La agresión ilegítima está acreditada por el ingreso al domicilio y el palo secuestrado.',
      'El segundo golpe, con la víctima en el suelo, es el punto donde puede quebrarse la necesidad racional: ahí se discute exceso (art. 35 CP).',
      'La discusión previa abre el debate sobre provocación suficiente, pero no toda discusión es provocación en el sentido del tipo permisivo.',
      'Bacigalupo: ordenar las acciones de cada interviniente antes de subsumir. La secuencia temporal define el encuadre.'
    ],
    conducta:''}
}

];

if (typeof window !== 'undefined') {
  window.LEX = Object.assign(window.LEX || {}, { CASOS });
}
