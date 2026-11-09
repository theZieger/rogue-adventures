#!/usr/bin/env node
/* Monster art pipeline: src/monsters.js -> art/monsters/raw/*.svg -> (svgo) -> art/monsters/svg/*.svg
 *
 *   npm run svg            bake the raw SVGs and optimise the ones that changed
 *   npm run svg -- --all   re-optimise everything (e.g. after changing SVGO_CONFIG)
 *
 * The raw files are the drawing code's output, one per variant the game shows. svgo only runs on files whose
 * raw content (or the svgo config/version) changed since the last run: art/monsters/manifest.json keeps a
 * sha256 of each raw file, so an unchanged monster costs nothing. build.py inlines art/monsters/svg/*.svg.
 * Settings are lossless on purpose: 3 decimals (the drawings use at most 1), no path merging, and transforms are
 * not baked into path data (that changes how scaled outlines render). tools/svg_compare.js checks it pixel by pixel. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { optimize } = require('svgo');
const MONART = require('../src/monsters.js');
const MQ = require('../src/logic.js');
const MK = require('../src/knowledge.js');

const ROOT = path.join(__dirname, '..');
const ART = path.join(ROOT, 'art', 'monsters');
const RAW = path.join(ART, 'raw');
const OUT = path.join(ART, 'svg');
const MANIFEST = path.join(ART, 'manifest.json');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

const SVGO_CONFIG = (key) => ({
  multipass: true,
  floatPrecision: 3,
  plugins: [
    { name: 'preset-default', params: { overrides: { mergePaths: false, convertPathData: { floatPrecision: 3, applyTransforms: false }, convertTransform: { floatPrecision: 3 } } } },
    { name: 'prefixIds', params: { prefix: `m-${key}`, delim: '__' } },
  ],
});
const svgoVersion = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules', 'svgo', 'package.json'), 'utf8')).version;
const configHash = sha(svgoVersion + JSON.stringify(SVGO_CONFIG('KEY')));

// every variant the game can show
function variants() {
  const T = MQ.TYPES, list = [];
  const starters = [...MQ.STARTERS, ...Object.values(MK.MODES).flatMap((m) => m.starters)];
  for (const s of starters) for (let e = 0; e < 3; e++) list.push({ key: MONART.bakedKey(s.shape, e), args: [s.shape, T[s.type].color, e, '', {}] });
  const enemies = [MQ.ENEMIES, ...Object.values(MK.MODES).map((m) => m.enemies)];
  for (const EN of enemies) for (const W of Object.values(EN)) for (const [e, opts] of [...W.normal.map((x) => [x, {}]), [W.elite, { elite: true }], [W.boss, { boss: true }]]) {
    const key = MONART.bakedKey(e.shape, 0, '', opts);
    list.push({ key, args: [e.shape, T[e.type].color, 0, '', opts] });
    list.push({ key: key + '-enemy', args: [e.shape, T[e.type].color, 0, 'enemy', opts], onlyIfDifferent: key });
  }
  const seen = new Set();
  return list.filter((v) => !seen.has(v.key) && seen.add(v.key));
}
const bake = (v) => MONART.render(v.args[0], v.args[1], v.args[2], v.args[3], { ...v.args[4], id: `m${v.key.replace(/-enemy$/, '')}` })
  .replace(/ class="mon[^"]*"/, '') + '\n';

const all = process.argv.includes('--all');
fs.mkdirSync(RAW, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
let manifest = {}; try { manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch (e) { /* first run */ }
const next = {}; const raws = {};
let optimised = 0, kept = 0, bytesIn = 0, bytesOut = 0;
for (const v of variants()) {
  const raw = bake(v);
  if (v.onlyIfDifferent && raw.replace(/m[\w-]+?_/g, '') === raws[v.onlyIfDifferent].replace(/m[\w-]+?_/g, '')) continue;
  raws[v.key] = raw;
  const rawFile = path.join(RAW, v.key + '.svg'), outFile = path.join(OUT, v.key + '.svg'), h = sha(raw);
  if (!fs.existsSync(rawFile) || fs.readFileSync(rawFile, 'utf8') !== raw) fs.writeFileSync(rawFile, raw);
  const prev = manifest[v.key];
  if (!all && prev && prev.raw === h && prev.config === configHash && fs.existsSync(outFile) && sha(fs.readFileSync(outFile, 'utf8')) === prev.out) {
    next[v.key] = prev; kept++; continue;
  }
  const out = optimize(raw, { path: v.key + '.svg', ...SVGO_CONFIG(v.key) }).data;
  fs.writeFileSync(outFile, out);
  next[v.key] = { raw: h, out: sha(out), config: configHash };
  optimised++; bytesIn += raw.length; bytesOut += out.length;
}
// drop files of variants that no longer exist
for (const dir of [RAW, OUT]) for (const f of fs.readdirSync(dir)) if (f.endsWith('.svg') && !next[f.slice(0, -4)]) fs.unlinkSync(path.join(dir, f));
const sorted = Object.fromEntries(Object.keys(next).sort().map((k) => [k, next[k]]));
const json = JSON.stringify(sorted, null, 1) + '\n';
if (!fs.existsSync(MANIFEST) || fs.readFileSync(MANIFEST, 'utf8') !== json) fs.writeFileSync(MANIFEST, json);
console.log(`svg: ${Object.keys(next).length} monsters, ${optimised} optimised${optimised ? ` (${bytesIn} → ${bytesOut} bytes, −${Math.round(100 - (bytesOut / bytesIn) * 100)} %)` : ''}, ${kept} unchanged`);
