// The built app in a phone-sized Chromium, for screenshots and browser tests. Served over http, as the service
// worker needs; random numbers and the clock are fixed so a screen looks the same on every run.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const DOCS = path.join(import.meta.dirname, '..', 'docs');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
};

function serve(root = DOCS) {
  const server = http.createServer((request, response) => {
    const name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.join(root, name.endsWith('/') ? `${name}index.html` : name);
    if (!file.startsWith(root) || !fs.existsSync(file)) return response.writeHead(404).end();
    response.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

function fixRandomAndClock() {
  let seed = 20261108;
  // mulberry32
  Math.random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const RealDate = Date;
  const now = RealDate.parse('2026-12-23T10:00:00');
  Date = class extends RealDate {
    constructor(...args) {
      super(...(args.length ? args : [now]));
    }
    static now() {
      return now;
    }
  };
}

// use(newPage, url): newPage() opens the app (or another file of docs/) in a fresh browser profile, so every caller
// starts without a save
async function withApp(use, root) {
  const server = await serve(root);
  // CHROMIUM=/path/to/chrome uses that browser instead of the one Playwright installs
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const url = `http://localhost:${server.address().port}/`;
  const newPage = async (file = '') => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
      locale: 'de-DE',
    });
    await context.addInitScript(fixRandomAndClock);
    const page = await context.newPage();
    await page.goto(url + file);
    return page;
  };
  try {
    return await use(newPage, url);
  } finally {
    await browser.close();
    server.close();
  }
}

export { withApp };
