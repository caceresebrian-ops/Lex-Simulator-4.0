/* Lex Simulator — service worker
   Cachea la app para que funcione sin conexión. Las llamadas a la API
   de Anthropic nunca se cachean: van siempre a la red.                */

/* IMPORTANTE: subí este número en CADA actualización de los archivos.
   Si no cambia, los navegadores que ya visitaron el sitio siguen sirviendo
   la copia vieja desde el caché y no ven los cambios nunca.              */
const VERSION = 'lex-v12';
const NUCLEO = [
  './',
  './index.html',
  './css/estilo.css',
  './js/conocimiento.js',
  './js/casos.js',
  './js/biblioteca.js',
  './js/motor.js',
  './js/agentes.js',
  './js/ingesta.js',
  './js/app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './emblema.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.allSettled(NUCLEO.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.hostname === 'api.anthropic.com') return;   // siempre a la red

  ev.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.status === 200 &&
            (url.origin === location.origin || url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com'))) {
          const copia = res.clone();
          caches.open(VERSION).then(c => c.put(req, copia)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
