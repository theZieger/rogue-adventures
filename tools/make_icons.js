#!/usr/bin/env node
/* Generates the app icons in docs/icons/ from the game's own monster art
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
  await browser.close();
})();
