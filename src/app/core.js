const { rnd, pick, shuffle, TYPES, BEATS, ITEMS, makeMap, euro } = MQ;
const MODES = UNITS;
// the Monsterbuch and the hero lists keep this order; new units follow in the order they register
const FIRST = [
  'math',
  'bau',
  'ethik',
  'kirchenjahr',
  'kartoffel',
  'woerterwerkstatt',
  'satzbaustelle',
  'kornkammer',
  'wetterstation',
  'kompass',
  'freunde',
  'jahrmarkt',
  'wiese',
  'frueher',
  'sinne',
  'verkehr',
  'musik',
  'ichwelt',
  'teestube',
  'doppeldecker',
];
const MODE_KEYS = FIRST.concat(Object.keys(MODES).filter((m) => !FIRST.includes(m)));
// the title screen builds itself from grade and subject of the units; `rank` orders the themes of a subject from easy to hard
const SUBJECTS = { Mathe: '🔢', Deutsch: '📖', Ethik: '🕊️', Sachkunde: '🌱', Musik: '🎵', Englisch: '💬' };
const CURRICULUM = [...new Set(MODE_KEYS.map((m) => MODES[m].grade))]
  .sort((a, b) => a - b)
  .map((grade) => ({
    grade,
    label: 'Klasse ' + grade,
    subjects: Object.keys(SUBJECTS)
      .map((subject) => ({
        subject,
        icon: SUBJECTS[subject],
        modes: MODE_KEYS.filter((m) => MODES[m].grade === grade && MODES[m].subject === subject).sort(
          (a, b) => (MODES[a].rank || 0) - (MODES[b].rank || 0),
        ),
      }))
      .filter((x) => x.modes.length),
  }));
let mode = 'math';
const CFG = () => MODES[mode];
const MODULES_OF = () => CFG().modules;
const MODKEYS = () => Object.keys(CFG().modules);
const $ = (sel, el) => (el || document).querySelector(sel);
const app = $('#app');
const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// svg, not emoji: emoji arrows differ in size between fonts
const arrow = (dir) =>
  `<svg class="arr arr-${dir}" viewBox="0 0 20 20" aria-label="${{ r: 'rechts', l: 'links', d: 'unten', u: 'oben' }[dir]}"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

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
