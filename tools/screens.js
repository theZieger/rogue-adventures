// The screens that screenshots and browser tests visit: a name and the taps that lead there from a first start.
const TITLE = ['#later'];
const MATH = [...TITLE, '[data-sub="0"]', '[data-new="math"]'];
const MAP = [...MATH, '[data-id="fuchs"]', '#go'];
const BATTLE = [...MAP, '.node:not([disabled])', '#tutok'];

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
  parents: [...TITLE, '#parents'],
};

async function visit(page, taps) {
  for (const tap of taps) await page.click(tap);
  await page.evaluate(() => document.fonts.ready);
}

module.exports = { SCREENS, visit };
