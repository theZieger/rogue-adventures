/* Lernquest service worker – makes the game installable and playable offline.
 * 692083ce36ba is replaced by build.py with a hash of the built files, so every
 * new build ships a new worker that refreshes the cache. */
const VERSION = '692083ce36ba';
const CACHE = 'lernquest-' + VERSION;
const FONT_CACHE = 'lernquest-fonts';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.ico',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: serve cached copy instantly, refresh in the background.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONT_CACHE).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // The game page: precached copy (works offline, starts instantly).
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./index.html').then((hit) => hit || fetch(req)));
    return;
  }

  // Everything else from our origin: cache first, then network.
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
