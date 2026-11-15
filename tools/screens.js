// The screens that screenshots and browser tests visit: a name and the taps that lead there from a first start.
const TITLE = ['#later'];
const MATH = [...TITLE, '[data-sub="0"]', '[data-new="math"]'];
const MAP = [...MATH, '[data-id="fuchs"]', '#go'];
const BATTLE = [...MAP, '.node:not([disabled])', '#tutok'];
const GERMAN = [...TITLE, '[data-sub="1"]', '[data-new]', '.choice', '#go', '.node:not([disabled])'];
const KLASSE_1 = [...TITLE, '.gradechip[data-grade="1"]'];
const PARENTS = [...TITLE, '#parents'];

const SCREENS = {
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
  stamps: [...TITLE, '#stamps'],
  hut: [...TITLE, '#hut'],
  garden: [...TITLE, '#garden'],
  duel: [...TITLE, '#duel'],
  news: [...TITLE, '#news'],
  feedback: [...TITLE, '#feedback'],
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
};

// a fight's first-time explanation („Alles klar“) is tapped away wherever it shows, so a list need not name it
async function visit(page, taps) {
  for (const tap of taps) {
    if (tap !== '#tutok' && (await page.isVisible('#tutok'))) await page.click('#tutok');
    await page.click(tap, { timeout: 5000 });
  }
  await page.evaluate(() => document.fonts.ready);
}

export { SCREENS, visit };
