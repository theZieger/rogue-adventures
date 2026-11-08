#!/usr/bin/env node
/* Generates the app icons in docs/icons/ and the iOS/iPadOS startup screens
 * in docs/splash/ from the game's own monster art
 * (Sonnenfuchs, fully evolved). Uses the pre-installed Playwright Chromium
 * to rasterise the SVGs. Run manually when the icon design changes:
 *   node tools/make_icons.js
 * The PNGs are committed, so CI/build do not need Playwright. */
const fs = require('fs');
const path = require('path');
const MONART = require('../src/monsters.js');

const OUT = path.join(__dirname, '..', 'docs', 'icons');
const BG_TOP = '#2A3A73';
const BG_BOT = '#141B33';
const FOX = '#FF6A3D';

// Fox artwork occupies roughly x 0..120, y 0..116 of its 120x120 viewBox.
function fox() {
  return MONART.monsterSVG('fox', FOX, 2, '')
    .replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
    .replace(/<circle cx="60" cy="62" r="56"[^>]*\/>/g, ''); // drop evo aura ring
}

function stars(s) {
  // a few small twinkles in the background for a "quest" feel
  const pts = [[0.16, 0.2, 1], [0.84, 0.17, 0.8], [0.12, 0.78, 0.7], [0.88, 0.8, 0.9]];
  return pts.map(([x, y, k]) => {
    const r = s * 0.035 * k, cx = s * x, cy = s * y;
    return `<path d="M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r} Z" fill="#FFC93C" opacity=".85"/>`;
  }).join('');
}

/* opts.radius: corner radius as fraction (0 = full-bleed square)
 * opts.scale:  fox width as fraction of the icon
 * opts.stars:  draw background twinkles */
function iconSVG(size, opts) {
  const s = size;
  const r = (opts.radius || 0) * s;
  const k = (opts.scale * s) / 120;
  const tx = (s - 120 * k) / 2;
  const ty = (s - 116 * k) / 2 + s * 0.01;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
<defs><radialGradient id="bg" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="${BG_TOP}"/><stop offset="1" stop-color="${BG_BOT}"/></radialGradient><radialGradient id="glow"><stop offset="0" stop-color="#FFC93C" stop-opacity=".55"/><stop offset=".6" stop-color="#FF8A3D" stop-opacity=".18"/><stop offset="1" stop-color="#FF8A3D" stop-opacity="0"/></radialGradient></defs>
<rect width="${s}" height="${s}" rx="${r}" ry="${r}" fill="url(#bg)"/>
${opts.stars ? stars(s) : ''}
<circle cx="${s / 2}" cy="${s * 0.53}" r="${s * opts.scale * 0.58}" fill="url(#glow)"/>
<g transform="translate(${tx} ${ty}) scale(${k})">${fox()}</g>
</svg>`;
}

const ICONS = [
  // name, size, options
  // "any": rounded square, used on desktop (Windows/macOS/ChromeOS/Linux) and as favicon
  ['icon-192.png', 192, { radius: 0.22, scale: 0.80, stars: true }],
  ['icon-512.png', 512, { radius: 0.22, scale: 0.80, stars: true }],
  // "maskable": full bleed; Android crops to circle/squircle. Safe zone is the
  // central 80 % circle – the fox is sized to fill it so it looks big.
  ['maskable-192.png', 192, { radius: 0, scale: 0.68, stars: true }],
  ['maskable-512.png', 512, { radius: 0, scale: 0.68, stars: true }],
  // iOS/iPadOS: full-bleed square, the system applies its own rounded mask
  ['apple-touch-icon.png', 180, { radius: 0, scale: 0.84, stars: true }],
  // browser tab favicons
  ['favicon-32.png', 32, { radius: 0.2, scale: 0.98, stars: false }],
  ['favicon-16.png', 16, { radius: 0.2, scale: 1.0, stars: false }],
];

// iOS/iPadOS launch screens (apple-touch-startup-image). Safari needs one exact
// image per device: [CSS width, CSS height, pixel ratio]. build.py turns the
// file names into <link> tags, so adding a device here is all that's needed.
const IPHONES = [
  [440, 956, 3],  // 16 Pro Max, 17 Pro Max
  [430, 932, 3],  // 14 Pro Max, 15 Plus/Pro Max, 16 Plus
  [428, 926, 3],  // 12/13 Pro Max, 14 Plus
  [420, 912, 3],  // Air
  [414, 896, 3],  // XS Max, 11 Pro Max
  [414, 896, 2],  // XR, 11
  [414, 736, 3],  // 6/7/8 Plus
  [402, 874, 3],  // 16 Pro, 17, 17 Pro
  [393, 852, 3],  // 14 Pro, 15, 15 Pro, 16
  [390, 844, 3],  // 12, 13, 14, 16e
  [375, 812, 3],  // X, XS, 11 Pro, 12/13 mini
  [375, 667, 2],  // 6/7/8, SE 2nd/3rd gen
  [320, 568, 2],  // SE 1st gen
];
const IPADS = [ // iPads ignore the portrait lock, so they get landscape too
  [1032, 1376, 2], // Pro 13" (M4), Air 13"
  [1024, 1366, 2], // Pro 12.9"
  [834, 1210, 2],  // Pro 11" (M4)
  [834, 1194, 2],  // Pro 11", Air 11" (M2)
  [820, 1180, 2],  // Air 10.9", iPad 10th gen+
  [834, 1112, 2],  // Air 3, Pro 10.5"
  [810, 1080, 2],  // iPad 7th–9th gen
  [768, 1024, 2],  // iPad 9.7", mini 1–5
  [744, 1133, 2],  // mini 6+
];
const FONT_B64 = fs.readFileSync(path.join(__dirname, '..', 'docs', 'fonts', 'baloo2-latin.woff2')).toString('base64');
const SPLASH_BG = '#1C2541'; // = --bg, so the launch flows straight into the game

function splashHTML(w, h) {
  const m = Math.min(w, h);
  const foxW = m * 0.42, k = foxW / 120;
  const font = m * 0.13;
  return `<html><head><style>@font-face{font-family:'Baloo 2';font-weight:400 800;src:url(data:font/woff2;base64,${FONT_B64}) format('woff2')}</style></head>
<body style="margin:0;width:${w}px;height:${h}px;background:${SPLASH_BG};display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Baloo 2',sans-serif">
<svg width="${foxW * 1.6}" height="${foxW * 1.4}" viewBox="0 0 ${foxW * 1.6} ${foxW * 1.4}" style="overflow:visible">
<defs><radialGradient id="glow"><stop offset="0" stop-color="#FFC93C" stop-opacity=".45"/><stop offset=".6" stop-color="#FF8A3D" stop-opacity=".12"/><stop offset="1" stop-color="#FF8A3D" stop-opacity="0"/></radialGradient></defs>
<circle cx="${foxW * 0.8}" cy="${foxW * 0.72}" r="${foxW * 0.7}" fill="url(#glow)"/>
<g transform="translate(${foxW * 0.3} ${foxW * 0.12}) scale(${k})">${fox()}</g></svg>
<div style="color:#fff;font-weight:800;font-size:${font}px;line-height:1;margin-top:${m * 0.02}px;letter-spacing:-.01em">Lernquest</div>
<div style="color:#FFC93C;font-weight:800;font-size:${font * 0.32}px;margin-top:${m * 0.025}px">Monster · Wissen · Abenteuer</div>
</body></html>`;
}

async function makeSplash(browser) {
  const dir = path.join(__dirname, '..', 'docs', 'splash');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const jobs = [];
  for (const [w, h, r] of IPHONES) jobs.push([w, h, r, 'portrait']);
  for (const [w, h, r] of IPADS) jobs.push([w, h, r, 'portrait'], [w, h, r, 'landscape']);
  for (const [w, h, r, o] of jobs) {
    const [vw, vh] = o === 'portrait' ? [w, h] : [h, w];
    const page = await browser.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: r });
    await page.setContent(splashHTML(vw, vh));
    await page.evaluate(() => document.fonts.ready);
    const name = `splash-${w}x${h}@${r}-${o}.png`;
    await page.screenshot({ path: path.join(dir, name) });
    await page.close();
    // shrink to a 256-colour palette (visually identical, ~half the size) if ImageMagick is there
    try { require('child_process').execFileSync('convert', [path.join(dir, name), '-dither', 'FloydSteinberg', '-colors', '256', 'PNG8:' + path.join(dir, name)]); } catch (e) { /* keep full-colour PNG */ }
    console.log('wrote splash/' + name);
  }
}

// Screenshots for the install dialog (manifest "screenshots"): played from the built game, so run `npm run build` first.
async function makeScreenshots(browser) {
  const dir = path.join(__dirname, '..', 'docs', 'screenshots');
  fs.mkdirSync(dir, { recursive: true });
  const game = 'file://' + path.join(__dirname, '..', 'docs', 'index.html');
  const shots = [
    // form factor, CSS viewport, pixel ratio (=> 1080x1920 / 1920x1080 pixels)
    ['narrow', 360, 640, 3],
    ['wide', 1280, 720, 1.5],
  ];
  for (const [form, w, h, dpr] of shots) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
    await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('mathquest_meta_v2', JSON.stringify({ seenNews: '9999-12-31', sound: false, seenTut: { 'battle:intro': true } })); } } catch (e) { } });
    const p = await ctx.newPage();
    await p.goto(game); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(dir, `${form}-1-start.png`) });
    await p.click('[data-new="math"]'); await p.click('.choice[data-id]'); await p.click('#go'); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(dir, `${form}-2-karte.png`) });
    const nodes = await p.$$('.floor.current .node'); let t = nodes[0];
    for (const n of nodes) if (await n.getAttribute('aria-label') === 'Kampf') t = n;
    await t.click(); await p.waitForTimeout(500);
    if (await p.$('#tutok')) await p.click('#tutok');
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(dir, `${form}-3-kampf.png`) });
    await p.click('.atk[data-i="0"]'); await p.waitForTimeout(200);
    if (await p.$('#tutok')) await p.click('#tutok');
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(dir, `${form}-4-aufgabe.png`) });
    await ctx.close();
    console.log('wrote screenshots/' + form + '-*.png');
  }
}

(async () => {
  const { chromium } = require('playwright');
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [name, size, opts] of ICONS) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;background:transparent">${iconSVG(size, opts)}</body></html>`);
    await page.locator('svg').first().screenshot({ path: path.join(OUT, name), omitBackground: true });
    console.log('wrote', name);
  }
  // scalable favicon for modern browsers
  fs.writeFileSync(path.join(OUT, 'favicon.svg'), iconSVG(64, { radius: 0.2, scale: 0.98, stars: false }));
  console.log('wrote favicon.svg');
  // favicon.ico (16 + 32 px) for old browsers – needs ImageMagick
  try { require('child_process').execFileSync('convert', [path.join(OUT, 'favicon-16.png'), path.join(OUT, 'favicon-32.png'), path.join(OUT, '..', 'favicon.ico')]); console.log('wrote favicon.ico'); } catch (e) { console.log('skipped favicon.ico (ImageMagick "convert" not found)'); }
  await makeSplash(browser);
  await makeScreenshots(browser);
  await browser.close();
})();
