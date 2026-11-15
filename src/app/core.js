import { MODES } from '../curriculum.ts';
import { ICONS } from '../icons.js';
import { MQ } from '../logic.js';
import { state } from './state.js';

export const { rnd, pick, shuffle, TYPES, BEATS, ITEMS, makeMap, euro } = MQ;

export const CFG = () => MODES[state.mode];
export const MODULES_OF = () => CFG().modules;
export const MODKEYS = () => Object.keys(CFG().modules);
export const $ = (sel, el) => (el || document).querySelector(sel);
export const app = $('#app');
export const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// svg, not emoji: emoji arrows differ in size between fonts
export const arrow = (dir) =>
  `<svg class="arr arr-${dir}" viewBox="0 0 20 20" aria-label="${{ r: 'rechts', l: 'links', d: 'unten', u: 'oben' }[dir]}"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/* ---------- Icons ---------- */
// Emojis look different on every device and some are missing on older ones. Wherever one appears as text inside
// #app, the drawn icon from icons.js takes its place. Attributes (aria-label, data-*) keep the emoji.
const emoId = (k) => 'i-' + [...k].map((c) => c.codePointAt(0).toString(16)).join('-');
// not display:none, or Safari and Firefox lose the gradients inside <use>
document.body.insertAdjacentHTML(
  'beforeend',
  `<svg class="emosheet" aria-hidden="true">${Object.entries(ICONS)
    .map(([k, m]) => `<symbol id="${emoId(k)}" viewBox="0 0 32 32">${m}</symbol>`)
    .join('')}</svg>`,
);
const EMO = new RegExp(
  '(' +
    Object.keys(ICONS)
      .sort((a, b) => b.length - a.length)
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|') +
    ')\\uFE0F?',
  'gu',
);
function drawIcons(root) {
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walk.nextNode()) {
    const n = walk.currentNode;
    EMO.lastIndex = 0;
    if (EMO.test(n.data) && !n.parentElement.closest('textarea, svg, script, style')) hits.push(n);
  }
  for (const n of hits) {
    const box = document.createElement('span');
    box.innerHTML = esc(n.data).replace(
      EMO,
      (all, k) => `<svg class="emo" role="img" aria-label="${all}"><use href="#${emoId(k)}"/></svg>`,
    );
    n.replaceWith(...box.childNodes);
  }
}
new MutationObserver((list) => {
  for (const m of list) {
    if (m.type === 'characterData') {
      if (m.target.parentElement) drawIcons(m.target.parentElement);
    } else
      m.addedNodes.forEach((n) => {
        if (n.nodeType === 1) drawIcons(n);
        else if (n.nodeType === 3 && n.parentElement) drawIcons(n.parentElement);
      });
  }
}).observe(app, { childList: true, subtree: true, characterData: true });
