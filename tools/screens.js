// The screens that screenshots and browser tests visit: a name and the taps that lead there from a first start.
const TITLE = ['#later'];
const MATH = [...TITLE, '[data-sub="0"]', '[data-new="math"]'];
const MAP = [...MATH, '[data-id="fuchs"]', '#go'];
const BATTLE = [...MAP, '.node:not([disabled])', '#tutok'];
const GERMAN = [...TITLE, '[data-sub="1"]', '[data-new]', '.choice', '#go', '.node:not([disabled])'];
const KLASSE_1 = [...TITLE, '.chip[data-grade="1"]'];
const PARENTS = [...TITLE, '#parents'];

const SCREENS = {
  // the design system page, docs/gallery.html
  gallery: [],
  setup: [],
  title: TITLE,
  subject: [...TITLE, '[data-sub="0"]'],
  starter: MATH,
  map: MAP,
  'battle-tutorial': BATTLE.slice(0, -1),
  battle: BATTLE,
  'task-tutorial': [...BATTLE, '.atk[data-i="0"]'],
  'task-number': [...BATTLE, '.atk[data-i="0"]', '#tutok'],
  weekly: [...TITLE, '#weekly'],
  dex: [...TITLE, '#dex'],
  stamps: [...TITLE, '#stampsTop'],
  hut: [...TITLE, '#hut'],
  garden: [...TITLE, '#garden'],
  duel: [...TITLE, '#duel'],
  news: [...TITLE, '#news'],
  feedback: [...PARENTS, '[data-pt="settings"]', '[data-ps="app"]', '#pfeedback'],
  'task-choice': [...GERMAN, '.atk[data-i="0"]', '#tutok'],
  'klasse1-title': KLASSE_1,
  'klasse1-task': [
    ...KLASSE_1,
    '[data-sub="0"]',
    '[data-new]',
    '.choice',
    '#go',
    '.node:not([disabled])',
    '.atk',
    '#tutok',
  ],
  'setup-pin': ['#setpin'],
  'setup-load': ['#setload'],
  parents: PARENTS,
  'parents-subjects': [...PARENTS, '[data-pt="practice"]'],
  'parents-how': [...PARENTS, '[data-pt="practice"]', '[role="tab"][data-ps="how"]'],
  'parents-subject': [...PARENTS, '[data-pt="practice"]', '[data-pf="0"]'],
  'parents-save': [...PARENTS, '[data-pt="settings"]'],
  'parents-app': [...PARENTS, '[data-pt="settings"]', '[data-ps="app"]'],
  'parents-show': [...PARENTS, '[data-pt="settings"]', '[data-ps="show"]'],
  'parents-reset': [...PARENTS, '[data-pt="settings"]', '[data-ps="reset"]'],
  bench: [...TITLE, '#hut', '#bench'],
  wardrobe: [...TITLE, '#stampsTop', '#kk'],
  'top-build': [...TITLE, '#stampsTop', '#kb'],
  turm: ['#turm'],
  'turm-tutorial': ['#turm', '#go'],
  'turm-board': ['#turm', '#go', '#tutok'],
  'turm-monster': ['#turm', '#go', '#tutok', '.tw-mon[data-action="monster"]'],
  'turm-task': ['#turm', '#go', '#tutok', '.tw-mon[data-action="monster"]', '#atk'],
  'task-picture': [
    ...TITLE,
    '[data-sub="2"]',
    '[data-new="religionen"]',
    '.choice',
    '#go',
    '.node:not([disabled])',
    '.atk[data-i="3"]',
    '#tutok',
  ],
};

// screens that need more than a first start: what is in the save before the taps
const TURM_ON = { setup: { done: false, skipped: true, at: 'x' }, grade: 3, turm: { on: true } };
const SAVES = {
  turm: TURM_ON,
  'turm-tutorial': TURM_ON,
  'turm-board': TURM_ON,
  'turm-monster': TURM_ON,
  'turm-task': TURM_ON,
};

// a fight's first-time explanation („Alles klar“) is tapped away wherever it shows, so a list need not name it
async function visit(page, taps) {
  for (const tap of taps) {
    if (tap !== '#tutok' && (await page.isVisible('#tutok'))) await page.click('#tutok');
    await page.click(tap, { timeout: 5000 });
  }
  await page.evaluate(() => document.fonts.ready);
}

// a fresh page on the screen of that name
async function open(newPage, name) {
  const page = await newPage(name === 'gallery' ? 'gallery.html' : '');
  if (SAVES[name]) {
    await page.evaluate((save) => localStorage.setItem('mathquest_meta_v2', JSON.stringify(save)), SAVES[name]);
    await page.reload();
  }
  await visit(page, SCREENS[name]);
  return page;
}

export { SCREENS, open, visit };
