#!/usr/bin/env node
// node tools/screenshots.js <dir>             every screen of the built app as <dir>/<name>.png (390×844 at 2×)
// node tools/screenshots.js <before> <after>  compares two such folders and writes <after>/compare.html
import fs from 'node:fs';
import path from 'node:path';
import { withApp } from './browser.js';
import { open, SCREENS } from './screens.js';

async function shoot(dir) {
  fs.mkdirSync(dir, { recursive: true });
  await withApp(async (newPage) => {
    for (const name of Object.keys(SCREENS)) {
      const page = await open(newPage, name);
      await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: name === 'gallery' });
      await page.context().close();
    }
  });
  console.log(`${Object.keys(SCREENS).length} screens -> ${dir}`);
}

function compare(before, after) {
  const read = (dir, name) => (fs.existsSync(path.join(dir, name)) ? fs.readFileSync(path.join(dir, name)) : null);
  const names = fs.readdirSync(after).filter((name) => name.endsWith('.png'));
  const changed = names.filter((name) => !read(before, name)?.equals(read(after, name)));
  const pair = (name) =>
    `<h2>${name}</h2><div><img src="${path.relative(after, path.join(before, name))}"><img src="${name}"></div>`;
  fs.writeFileSync(
    path.join(after, 'compare.html'),
    `<!DOCTYPE html><meta charset="utf-8"><title>Before and after</title>
<style>body{font-family:sans-serif}div{display:flex;gap:16px}img{width:390px;border:1px solid #888}</style>
<h1>${changed.length} of ${names.length} screens changed</h1>${changed.map(pair).join('')}`,
  );
  console.log(`${changed.length} of ${names.length} screens changed${changed.length ? `: ${changed.join(', ')}` : ''}`);
}

const [first, second] = process.argv.slice(2);
if (second) compare(first, second);
else if (first) shoot(first);
else console.error('usage: node tools/screenshots.js <dir> | <before> <after>');
