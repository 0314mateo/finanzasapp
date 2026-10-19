// Service worker: deja la app disponible sin conexión. Nunca guarda en caché las llamadas a Google.
const VERSION = 'finanzas-v5b';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'demo-data.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // API de Google: siempre a la red
  // red primero: siempre la versión más nueva; sin conexión, la copia guardada
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(VERSION).then(ch => ch.put(e.request, c)); }
      return r;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('index.html')))
  );
});
