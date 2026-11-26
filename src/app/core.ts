import { MODES } from '../curriculum.ts';
import { ICONS } from '../icons.ts';
import { reword } from '../laender.ts';
import { MQ } from '../logic.ts';
import { state } from './state.ts';

export interface MonsterType {
  name: string;
  icon: string;
  color: string;
}
// what an item does when used: each item has one of the effects
export interface Item {
  name: string;
  icon: string;
  desc: string;
  heal?: number;
  xp?: number;
  shield?: boolean;
  power?: boolean;
  hint?: boolean;
  revive?: boolean;
}
// the keys come from saves and unit files, so these three are looked up by any string
interface Lookups {
  TYPES: Record<string, MonsterType>;
  BEATS: Record<string, string>;
  ITEMS: Record<string, Item>;
}
export const { rnd, pick, shuffle, TYPES, BEATS, ITEMS, makeMap, euro }: Omit<typeof MQ, keyof Lookups> & Lookups = MQ;

export const CFG = () => MODES[state.mode];
export const MODULES_OF = () => CFG().modules;
export const MODKEYS = () => Object.keys(CFG().modules);
// the element is expected to be there: a screen asks for what it has just rendered
export const $ = <T extends HTMLElement = HTMLElement>(sel: string, el?: ParentNode | null) =>
  (el || document).querySelector<HTMLElement>(sel) as T;
export const app = $('#app');
export const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// svg, not emoji: emoji arrows differ in size between fonts
export const arrow = (dir: string) =>
  `<svg class="arr arr-${dir}" viewBox="0 0 20 20" aria-label="${{ r: 'rechts', l: 'links', d: 'unten', u: 'oben' }[dir]}"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const esc = (s: string | undefined) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }) as Record<string, string>)[c],
  );

/* ---------- Icons ---------- */
// Emojis look different on every device and some are missing on older ones. Wherever one appears as text inside
// #app, the drawn icon from icons.ts takes its place. Attributes (aria-label, data-*) keep the emoji.
// The same walk puts the Bundesland's words into the text (reword); attributes keep the Saxon word.
const emoId = (k: string) => 'i-' + [...k].map((c) => c.codePointAt(0)!.toString(16)).join('-');
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
function drawIcons(root: Node) {
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits: Text[] = [];
  while (walk.nextNode()) {
    const n = walk.currentNode as Text;
    if (n.parentElement!.closest<HTMLElement>('textarea, svg, script, style')) continue;
    const said = reword(n.data, state.meta.land);
    if (said !== n.data) n.data = said;
    EMO.lastIndex = 0;
    if (EMO.test(n.data)) hits.push(n);
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
