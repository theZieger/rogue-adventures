/* Lernquest service worker – makes the game installable and playable offline.
 * 73c43fdc4f5e is replaced by build.py with a hash of the sources, so every new
 * build ships a new worker that refreshes the cache.
 * Update strategy: the game page is fetched network-first (revalidated past the
 * HTTP cache), so an online launch always shows the newest version; offline or
 * on a slow connection the cached copy is used after a short timeout. */
const VERSION = '73c43fdc4f5e';
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
      // tell open pages which version is now active (they reload if they are older)
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((wins) => wins.forEach((w) => w.postMessage({ type: 'sw-activated', version: VERSION })))
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  // The game page (./ or ./index.html): network first (newest version), cached copy as fallback.
  // Other pages opened inside the app's folder (e.g. fonts/OFL.txt) are passed through and never cached as the game.
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

  // Everything else from our origin: cache first, then network.
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
