// 9ac9185a3199 = build hash (build.py), so every build refreshes the cache.
const VERSION = '9ac9185a3199';
const CACHE = 'lernquest-' + VERSION;
const NET_TIMEOUT_MS = 3500;
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.ico',
  './fonts/andika-400-latin.woff2',
  './fonts/andika-700-latin.woff2',
  './fonts/patrickhand-latin.woff2',
  './sounds/tap.mp3',
  './sounds/right.mp3',
  './sounds/wrong.mp3',
  './sounds/hit.mp3',
  './sounds/crit.mp3',
  './sounds/hurt.mp3',
  './sounds/block.mp3',
  './sounds/levelup.mp3',
  './sounds/win.mp3',
  './sounds/finale.mp3',
  './sounds/lose.mp3',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((wins) => wins.forEach((w) => w.postMessage({ type: 'sw-activated', version: VERSION })))
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  // game page: network first with timeout, cache fallback; other pages (e.g. fonts/OFL.txt) pass through
  const scope = new URL(self.registration.scope);
  const isGame = url.pathname === scope.pathname || url.pathname === scope.pathname + 'index.html';
  if (req.mode === 'navigate' && !isGame) return;
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const net = fetch(req, { cache: 'no-cache' }).then((res) => {
        if (res.ok) cache.put('./index.html', res.clone());
        return res;
      });
      net.catch(() => {});
      const timeout = new Promise((r) => setTimeout(r, NET_TIMEOUT_MS));
      try {
        const res = await Promise.race([net, timeout]);
        if (res) return res;
      } catch (err) { /* offline – fall through */ }
      const hit = await cache.match('./index.html');
      return hit || net;
    })());
    return;
  }

  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
