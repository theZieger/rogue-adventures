// The screens that screenshots and browser tests visit: a name and the taps that lead there from a first start.
const TITLE = ['#later'];
const MATH = [...TITLE, '[data-sub="0"]', '[data-new="math"]'];
const MAP = [...MATH, '[data-id="fuchs"]', '#go'];
const BATTLE = [...MAP, '.node:not([disabled])', '#tutok'];
const GERMAN = [...TITLE, '[data-sub="1"]', '[data-new]', '.choice', '#go', '.node:not([disabled])'];
const KLASSE_1 = [...TITLE, '.chip[data-grade="1"]'];
const PARENTS = [...TITLE, '#parents'];
const SSUB = ['[data-sub="0"]', '[data-cont="math"]', '.node:not([disabled])', '.atk[data-i="0"]', '#tutok'];
// the second task: about every fourth comes from the tier below, and with the fixed random numbers the first one does
const SSUB2 = [...SSUB, ...[1, 1, 1, 'ok'].map((k) => `[data-k="${k}"]`), '#next', '.atk[data-i="0"]', '#tutok'];

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
  'setup-land': ['#setland'],
  parents: PARENTS,
  'parents-subjects': [...PARENTS, '[data-pt="practice"]'],
  'parents-how': [...PARENTS, '[data-pt="practice"]', '[role="tab"][data-ps="how"]'],
  'parents-subject': [...PARENTS, '[data-pt="practice"]', '[data-pf="0"]'],
  'parents-land': [...PARENTS, '[data-pt="practice"]', '#pland'],
  // a Bundesland is chosen: the subject names on the title, and a unit the Bundesland hides until parents show it
  'title-ni': [],
  'parents-unit-by': ['#parents', '[data-pt="practice"]', '[data-pf="2"]'],
  'parents-save': [...PARENTS, '[data-pt="settings"]'],
  'parents-app': [...PARENTS, '[data-pt="settings"]', '[data-ps="app"]'],
  'parents-show': [...PARENTS, '[data-pt="settings"]', '[data-ps="show"]'],
  'parents-reset': [...PARENTS, '[data-pt="settings"]', '[data-ps="reset"]'],
  bench: [...TITLE, '#hut', '#bench'],
  wardrobe: [...TITLE, '#stampsTop', '#kk'],
  'top-build': [...TITLE, '#stampsTop', '#kb'],
  // written subtraction in world 3 of Zahlenquest, by Abziehen and by Ergänzen, and the parents' choice between them
  'minus-abz-tutorial': SSUB.slice(0, -1),
  'minus-abz': SSUB,
  'minus-abz-tutorial2': SSUB2.slice(0, -1),
  'minus-abz-tier2': SSUB2,
  'minus-abz-filled': [...SSUB2, '.inp[data-i="4"]', '[data-k="6"]', '.inp[data-i="3"]', '[data-k="6"]'],
  'minus-erg-tutorial': SSUB.slice(0, -1),
  'minus-erg': SSUB,
  'parents-minus': ['#parents', '[data-pt="practice"]', '[data-pf="0"]', '[data-minus="abz"]'],
  turm: ['#turm'],
  'turm-tutorial': ['#turm', '#go'],
  'turm-board': ['#turm', '#go', '#tutok'],
  'turm-monster': ['#turm', '#go', '#tutok', '.tw-mon[data-action="monster"]'],
  'turm-task': ['#turm', '#go', '#tutok', '.tw-mon[data-action="monster"]', '#atk'],
};

// screens that need more than a first start: what is in the save before the taps
const TURM_ON = { setup: { done: false, skipped: true, at: 'x' }, grade: 3, turm: { on: true } };
const IN = (land) => ({ setup: { done: false, skipped: true, at: 'x' }, grade: 3, land });
// a save without `minus` is one from before the choice and keeps Ergänzen; this family is new in Bayern
const ABZ = { ...IN('BY'), minus: '' };
const SAVES = {
  'title-ni': IN('NI'),
  'parents-unit-by': IN('BY'),
  'minus-abz-tutorial': ABZ,
  'minus-abz': ABZ,
  'minus-abz-tutorial2': ABZ,
  'minus-abz-tier2': ABZ,
  'minus-abz-filled': ABZ,
  'minus-erg-tutorial': IN(''),
  'minus-erg': IN(''),
  'parents-minus': IN('SN'),
  turm: TURM_ON,
  'turm-tutorial': TURM_ON,
  'turm-board': TURM_ON,
  'turm-monster': TURM_ON,
  'turm-task': TURM_ON,
};

// screens inside a Zahlenquest adventure in world 3 whose first attack is written subtraction, at this tier
const SSUB_TIER = {
  'minus-abz-tutorial': 2,
  'minus-abz': 2,
  'minus-abz-tutorial2': 2,
  'minus-abz-tier2': 2,
  'minus-abz-filled': 2,
  'minus-erg-tutorial': 1,
  'minus-erg': 1,
};
const saveW3 = (tier) => {
  const MQ = window.__mq.modules.MQ;
  const run = {
    mode: 'math',
    world: 3,
    floor: 1,
    map: MQ.makeMap(),
    hero: {
      id: 'fuchs',
      evo: 2,
      level: 9,
      xp: 0,
      hp: 150,
      maxHp: 150,
      attacks: ['ssub', 'sadd', 'smul', 'bruch'].map((mod) => ({ name: MQ.EXTRA_ATTACKS[mod], mod })),
    },
    items: [],
    tiers: { ...Object.fromEntries(MQ.MODULE_KEYS.map((k) => [k, 1])), ssub: tier },
    path: [],
    shield: false,
  };
  localStorage.setItem('mathquest_run_v1', JSON.stringify(run));
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
    if (SSUB_TIER[name]) await page.evaluate(saveW3, SSUB_TIER[name]);
    await page.reload();
  }
  await visit(page, SCREENS[name]);
  return page;
}

export { SCREENS, open, visit };
