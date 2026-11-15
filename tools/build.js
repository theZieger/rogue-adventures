#!/usr/bin/env node
// src/* -> docs/index.html, docs/sw.js, docs/manifest.webmanifest
import assert from 'node:assert';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';

const ROOT = path.join(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const DOCS = path.join(ROOT, 'docs');

// The game itself: the parts of src/app/ in this order inside one function, so they share its state (meta, run, mode).
const APP = [
  'core',
  'storage',
  'progress',
  'ui',
  'tasks',
  'title',
  'backup',
  'map',
  'battle',
  'nodes',
  'collection',
  'huette',
  'duell',
  'turm',
  'turm_screens',
  'garten',
  'elternbereich',
  'feedback',
  'boot',
];
const GROUPS = ['Neu', 'Verbessert', 'Behoben'];

const read = (...parts) => fs.readFileSync(path.join(...parts), 'utf8');
const files = (dir, ext = '') =>
  fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(ext))
    .sort();
const inlineJson = (value) => JSON.stringify(value).replaceAll('</', '<\\/');

function bakedMonsters() {
  const dir = path.join(ROOT, 'art', 'monsters', 'svg');
  const baked = Object.fromEntries(
    files(dir, '.svg').map((name) => [path.basename(name, '.svg'), read(dir, name).trim()]),
  );
  assert(Object.keys(baked).length, 'art/monsters/svg/ is empty: run npm run svg');
  return baked;
}

// Everything the modules of src/ export, then the game. units.js goes first: it sets the order of the units.
function appSource() {
  const modules = files(SRC).filter((name) => /\.(js|ts)$/.test(name) && name !== 'sw.js' && name !== 'units.js');
  const imports = ['units.js', ...modules].flatMap((name) => {
    const exported = [...read(SRC, name).matchAll(/^export (?:const|function) (\w+)/gm)].map((match) => match[1]);
    return exported.length ? [`import { ${exported.join(', ')} } from './${name}';`] : [];
  });
  return `${imports.join('\n')}\n(() => {\n${APP.map((part) => read(SRC, 'app', `${part}.js`)).join('')}})();\n`;
}

function bundle() {
  const { outputFiles } = esbuild.buildSync({
    stdin: { contents: appSource(), resolveDir: SRC, sourcefile: 'app.js' },
    bundle: true,
    format: 'iife',
    minifyWhitespace: true,
    charset: 'utf8',
    write: false,
  });
  return outputFiles[0].text;
}

// -> [{ date: '2026-11-07', groups: [{ title: 'Neu', items: ['...'] }] }]
// Strict: everything after the first date heading must be a date, a known group or a "- " line.
function parseChangelog(text) {
  const entries = [];
  text.split(/\r?\n/).forEach((line, index) => {
    const where = `CHANGELOG.md:${index + 1}`;
    const entry = entries.at(-1);
    let match;
    if ((match = /^## (\d{4}-\d{2}-\d{2})\s*$/.exec(line))) {
      entries.push({ date: match[1], groups: [] });
    } else if (!entry || !line.trim()) {
      return;
    } else if ((match = /^### (.+?)\s*$/.exec(line))) {
      assert(GROUPS.includes(match[1]), `${where}: group must be one of ${GROUPS}, got "${match[1]}"`);
      entry.groups.push({ title: match[1], items: [] });
    } else if ((match = /^- (.+?)\s*$/.exec(line)) && entry.groups.length) {
      entry.groups.at(-1).items.push(match[1]);
    } else {
      assert.fail(`${where}: unexpected line (one '- ' line per point, no line breaks): "${line}"`);
    }
  });
  for (const { date, groups } of entries) {
    const titles = groups.map((group) => group.title);
    assert.deepStrictEqual(
      titles,
      GROUPS.filter((title) => titles.includes(title)),
      `CHANGELOG.md ${date}: groups must be in the order ${GROUPS}`,
    );
    assert(
      groups.every((group) => group.items.length),
      `CHANGELOG.md ${date}: empty group`,
    );
  }
  const dates = entries.map((entry) => entry.date);
  assert.deepStrictEqual(dates, [...dates].sort().reverse(), 'CHANGELOG.md: dates must be newest first');
  assert.strictEqual(new Set(dates).size, dates.length, 'CHANGELOG.md: each date only once');
  return entries;
}

// iOS launch screens from tools/make_icons.js
function splashTags() {
  return files(path.join(DOCS, 'splash'))
    .map((name) => [name, /^splash-(\d+)x(\d+)@(\d)-(portrait|landscape)\.png$/.exec(name)])
    .filter(([, match]) => match)
    .map(
      ([name, [, width, height, ratio, orientation]]) =>
        `<link rel="apple-touch-startup-image" href="splash/${name}" media="(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: ${orientation})">`,
    )
    .join('\n');
}

const REGISTER_SERVICE_WORKER = `(function () {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const BUILD = '__BUILD__';
  const loadedAt = Date.now();
  let pending = false;
  function refresh(v) {
    try { if (sessionStorage.getItem('lq-reloaded') === v) return; sessionStorage.setItem('lq-reloaded', v); } catch (e) { }
    location.reload();
  }
  navigator.serviceWorker.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || d.type !== 'sw-activated' || d.version === BUILD) return;
    // update now only if just opened or in background, never mid-battle
    if (document.hidden || Date.now() - loadedAt < 8000) refresh(d.version); else pending = d.version;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (pending) refresh(pending); return; }
    navigator.serviceWorker.getRegistration().then((r) => r && r.update()).catch(() => {});
  });
  addEventListener('load', () => navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {}));
})();`;

function page() {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Lernquest – Mathe, Deutsch, Englisch, Musik, Ethik und Sachkunde</title>
<meta name="description" content="Roguelike-Lernspiel für Grundschüler (Klasse 1 bis 3): Mathe, Deutsch, Englisch, Musik, Ethik und Sachkunde. Funktioniert offline.">
<meta name="theme-color" content="#1C2541">
<meta name="color-scheme" content="dark">
<meta name="format-detection" content="telephone=no">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="favicon.ico" sizes="32x32">
<link rel="icon" href="icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="application-name" content="Lernquest">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Lernquest">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="msapplication-TileColor" content="#1C2541">
<meta name="msapplication-TileImage" content="icons/icon-192.png">
<meta name="app-version" content="__BUILD__">
${splashTags()}
<link rel="preload" href="fonts/andika-700-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/patrickhand-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>
${read(SRC, 'style.css')}
</style>
</head>
<body>
<div id="app"></div>
<script>
globalThis.MONBAKED = ${inlineJson(bakedMonsters())};
const CHANGELOG = ${inlineJson(parseChangelog(read(ROOT, 'CHANGELOG.md')))};
</script>
<script>
${bundle()}</script>
<script>
${REGISTER_SERVICE_WORKER}
</script>
</body>
</html>
`;
}

// Hash of everything shipped; page and worker compare it to detect updates.
function buildId(texts) {
  const hash = crypto.createHash('sha256');
  texts.forEach((text) => hash.update(text, 'utf8'));
  const assets = ['icons', 'splash', 'fonts', 'sounds'].flatMap((dir) =>
    files(path.join(DOCS, dir)).map((name) => path.join(DOCS, dir, name)),
  );
  [...assets, path.join(DOCS, 'favicon.ico')]
    .filter((file) => fs.statSync(file).isFile())
    .forEach((file) => hash.update(fs.readFileSync(file)));
  return hash.digest('hex').slice(0, 12);
}

function write(name, text) {
  fs.writeFileSync(path.join(DOCS, name), text);
  return `docs/${name}`;
}

assert.deepStrictEqual(
  APP.map((part) => `${part}.js`).sort(),
  files(path.join(SRC, 'app'), '.js'),
  'APP in tools/build.js must list every file in src/app/',
);

const html = page();
const manifest = read(SRC, 'manifest.webmanifest');
const serviceWorker = read(SRC, 'sw.js');
const id = buildId([html, manifest, serviceWorker]);

console.log(
  `built ${write('index.html', html.replaceAll('__BUILD__', id))} (${Buffer.byteLength(html).toLocaleString('en')} bytes)`,
);
write('manifest.webmanifest', manifest);
console.log(`built ${write('sw.js', serviceWorker.replaceAll('__VERSION__', id))} (version ${id})`);
