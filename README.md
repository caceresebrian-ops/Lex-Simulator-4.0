# Lex Simulator

Entrenamiento en litigación penal oral para la provincia de La Rioja, Argentina.
Aplicación web estática, instalable en el teléfono, que funciona sin conexión.

## Qué hace

Simula audiencias penales orales. Elegís el tipo de audiencia, de qué lado litigás y el caso, y
formulás preguntas escribiendo o dictando. El testigo responde según su perfil: ante una sugestiva
de un solo punto contesta seco, ante una abierta se explaya y te hace daño. Cada testigo guarda un
**sobre cerrado** con datos que solo salen si la pregunta da justo en el punto. Al levantar la
audiencia, recibís una devolución técnica y se abre el sobre.

Módulos: examen directo, contraexamen, audiencia de medidas de coerción (art. 130), alegato de
apertura y alegato de clausura.

## Las dos capas

**Sin conexión.** Veinte causas riojanas escritas a mano, con declaración previa y sobre cerrado, y
un motor de objeciones por reglas que detecta sugestivas en el directo, preguntas compuestas, las
que arrancan con "por qué", adjetivaciones vagas, pedidos de opinión a testigos legos, preguntas de
más, las que asumen hechos no acreditados y las repetidas. La devolución es un informe
determinístico. No necesita clave, ni cuenta, ni internet.

**Con modelo.** Si cargás tu propia clave de la API de Anthropic en Ajustes, el caso se genera al
momento, el testigo improvisa y la devolución la escribe Claude citando tus frases textuales.

La clave se guarda **solo en el `localStorage` de tu navegador**. No viaja a ningún servidor salvo
a `api.anthropic.com`, y no está en el repositorio. Nunca la commitees.

## Publicar en GitHub Pages

1. Creá un repositorio nuevo, por ejemplo `lex-simulator`.
2. Subí todos los archivos de este directorio a la raíz del repositorio, manteniendo las carpetas
   `css/` y `js/`.
3. Andá a **Settings → Pages**, y en *Source* elegí la rama `main` y la carpeta `/ (root)`.
4. En un minuto queda publicada en `https://TUUSUARIO.github.io/lex-simulator/`.

Las rutas son todas relativas (`./`), así que funciona igual en la raíz del dominio o en un
subdirectorio de proyecto.

## Instalar en el teléfono

Abrí la dirección publicada y:

- **Android (Chrome):** menú → *Agregar a pantalla principal*, o el botón "Instalar en el teléfono"
  que aparece en la portada.
- **iPhone (Safari):** Compartir → *Añadir a pantalla de inicio*.

Queda con ícono propio y abre a pantalla completa. El *service worker* cachea todo, así que después
de la primera visita funciona sin señal.

### El testigo

Cada testigo maneja dos bancos de respuestas. Uno propio del caso, sobre lo que vio y lo que declaró
antes. Otro universal, que le permite contestar sobre quién es, a qué se dedica, si conoce al
imputado, si tuvo problemas con él, si espera algo del juicio, si usa anteojos, si había tomado, qué
hacía antes del hecho, qué hizo después, a quién le contó, si habló con el fiscal y cuánto recuerda.
Entiende cerca del 90 % de las preguntas habituales de una acreditación.

Cuando no entiende, pide aclaración en lugar de quedarse mudo, y eso se te contabiliza: una pregunta
que hay que repetir ya perdió efecto ante el tribunal, y aparece como eje propio en la devolución.

Tarda entre dos y tres segundos en contestar, y algo más cuando la pregunta lo acorrala. La demora
es deliberada: el silencio es donde uno se pone nervioso en una audiencia real.

### Las voces

La app usa el motor de voz del dispositivo, así que la naturalidad depende de qué tenga instalado.
En **Ajustes → Voces de la sala** podés elegir una voz masculina y una femenina entre las
disponibles, escucharlas antes de asignarlas y regular la velocidad.

Si todas suenan robóticas, en Android se instalan voces mejores desde Configuración →
Administración general → Texto a voz → Motor de Google → instalar datos de voz en español. Las
voces marcadas como "red" suenan bastante más humanas que las locales.

Cada testigo tiene género asignado en el caso; el juez y la contraparte se sortean en cada
audiencia. Si el dispositivo tiene una sola voz castellana, la diferencia se marca por el tono.

### Litigar de manera oral

Hay dos botones junto al campo de la pregunta.

El **micrófono** dicta: hablás, el texto aparece en el campo y vos lo enviás cuando querés. Si la
sala está hablando, tocarlo la corta en seco, que es lo que uno hace cuando el testigo se va por las
ramas.

La sala habla desde que entrás a la audiencia. El botón del **parlante**, arriba junto al reloj,
la silencia si estás en un lugar donde no podés escuchar; la preferencia queda guardada.

El botón de **auriculares** enciende el modo oral, que cierra el circuito completo: escucha sin que
tengas que sostener nada, envía la pregunta sola cuando hacés una pausa de un segundo y medio, la
sala te contesta en voz alta con un timbre distinto para el testigo, el juez y la contraparte, y el
micrófono se reabre solo. Así podés entrenar caminando, sin mirar la pantalla.

El reconocimiento de voz anda bien en Chrome sobre Android y en Chrome de escritorio. En Safari
sobre iPhone suele no estar disponible: en ese caso el modo oral se enciende igual, pero solo de
salida, así que escuchás la audiencia y escribís tus preguntas.

## Estructura

```
index.html              portada, sala de audiencia y paneles
manifest.json           metadatos de la app instalable
service-worker.js       caché para uso sin conexión
css/estilo.css          hoja de estilos
js/conocimiento.js      CPP de La Rioja, técnica de litigación y tabla de falacias
js/casos.js             las 20 causas con su banco de respuestas
js/motor.js             análisis de preguntas, objeciones, testigo e informe offline
js/app.js               navegación, flujos, llamadas a la API y almacenamiento
icon-192.png            íconos e imagen del emblema
icon-512.png
apple-touch-icon.png
emblema.png
```

## Actualizar el sitio

Para reemplazar archivos no hace falta borrar nada: subí los nuevos con el mismo nombre y GitHub
los sobrescribe. Pero **cada vez que cambies un archivo, subí el número de `VERSION` en
`service-worker.js`** (`lex-v2`, `lex-v3`, y así). Ese nombre identifica el caché: si no cambia, los
navegadores que ya visitaron el sitio siguen mostrando la versión vieja aunque en GitHub estén los
archivos nuevos.

Si actualizaste y no ves los cambios, en la computadora hacé Ctrl+Shift+R, y en el teléfono cerrá la
app instalada del todo y volvé a abrirla.

## Agregar casos

Los casos viven en `js/casos.js`. Cada uno lleva legajo público, declaración previa, sobre cerrado y
un banco de respuestas donde cada entrada tiene:

| campo | para qué sirve |
|---|---|
| `claves` | palabras que activan el tema, separadas por espacios |
| `texto` | respuesta normal |
| `corto` | respuesta ante una sugestiva de un solo punto |
| `extra` | lo que agrega de más si la pregunta fue abierta |
| `reservado` | si es `true`, solo sale con una pregunta muy precisa |

También podés cargar material desde la propia app, en **Base de conocimiento**, sin tocar el código.
Son tres pisos con presupuestos distintos: las reglas de audiencia viajan en cada pregunta y por eso
tienen poco lugar; los criterios de evaluación y la ambientación viajan una sola vez y admiten mucho
más texto.

## Material de base

- Ley 10.797 — Código Procesal Penal de La Rioja (sancionada) — arts. 205 a 218 y 115 a 132
- Baytelman y Duce, *Litigación penal. Juicio oral y prueba*
- Gonzalo Rúa, *Contraexamen de testigos* y *Examen directo de testigos* (Binder, dir.)
- Bacigalupo, *Técnica de resolución de casos penales*
- Copi, *Introducción a la lógica*, cap. 3

## Licencia

Uso personal y de capacitación. Los casos son ficticios; cualquier parecido con causas reales es
coincidencia.
