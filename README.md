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

El dictado por voz usa la API de reconocimiento del navegador y anda bien en Chrome sobre Android.
En iOS el soporte es irregular: si el micrófono no aparece, escribí.

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

- Proyecto de Código Procesal Penal de La Rioja (2022) — arts. 199 a 215 y 115 a 134
- Baytelman y Duce, *Litigación penal. Juicio oral y prueba*
- Gonzalo Rúa, *Contraexamen de testigos* y *Examen directo de testigos* (Binder, dir.)
- Bacigalupo, *Técnica de resolución de casos penales*
- Copi, *Introducción a la lógica*, cap. 3

## Licencia

Uso personal y de capacitación. Los casos son ficticios; cualquier parecido con causas reales es
coincidencia.
