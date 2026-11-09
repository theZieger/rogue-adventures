#!/usr/bin/env node
/* Checks that svgo lost nothing: renders every art/monsters/raw/*.svg and its art/monsters/svg/*.svg twin at
 * 480×480 and compares the pixels. Needs Playwright with Chromium (not in CI):  node tools/svg_compare.js */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ART = path.join(__dirname, '..', 'art', 'monsters');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 480, height: 480 } });
  const shot = async (svg) => { await p.setContent(`<body style="margin:0;background:#24305A">${svg.replace('<svg', '<svg width="480" height="480"')}</body>`); return p.screenshot({ type: 'png' }); };
  const files = fs.readdirSync(path.join(ART, 'svg')).filter((f) => f.endsWith('.svg'));
  let worst = 0, worstFile = '';
  for (const f of files) {
    const [a, c] = await Promise.all([0, 0]).then(async () => [await shot(fs.readFileSync(path.join(ART, 'raw', f), 'utf8')), await shot(fs.readFileSync(path.join(ART, 'svg', f), 'utf8'))]);
    const diff = await p.evaluate(async ([x, y]) => {
      const load = (b64) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + b64; });
      const [i1, i2] = await Promise.all([load(x), load(y)]); const cv = document.createElement('canvas'); cv.width = i1.width; cv.height = i1.height; const g = cv.getContext('2d');
      g.drawImage(i1, 0, 0); const d1 = g.getImageData(0, 0, cv.width, cv.height).data; g.drawImage(i2, 0, 0); const d2 = g.getImageData(0, 0, cv.width, cv.height).data;
      let n = 0; for (let i = 0; i < d1.length; i += 4) if (Math.abs(d1[i] - d2[i]) + Math.abs(d1[i + 1] - d2[i + 1]) + Math.abs(d1[i + 2] - d2[i + 2]) > 24) n++;
      return n / (d1.length / 4);
    }, [a.toString('base64'), c.toString('base64')]);
    if (diff > worst) { worst = diff; worstFile = f; }
  }
  await b.close();
  console.log(`svg_compare: ${files.length} files, largest difference ${(worst * 100).toFixed(3)} % of pixels${worstFile ? ` (${worstFile})` : ''}`);
  process.exit(worst > 0.001 ? 1 : 0);
})();
