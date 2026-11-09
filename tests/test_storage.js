// Regression tests for saving/loading (runs the built docs/index.html in jsdom).
// Each "page load" is a fresh JSDOM that starts with the localStorage of the previous one,
// which is what a reload or reopening the app does.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8');

let fails = 0;
const check = (cond, msg) => { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); };

function open(storage) {
  const errors = [];
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/',
    beforeParse(w) { for (const [k, v] of Object.entries(storage || {})) w.localStorage.setItem(k, v); w.addEventListener('error', (e) => errors.push(e.message)); },
  });
  const w = dom.window, d = w.document;
  const $ = (s) => d.querySelector(s);
  const click = (s) => { const el = typeof s === 'string' ? $(s) : s; if (!el) throw new Error('missing ' + s + ' on: ' + d.body.textContent.slice(0, 200)); el.click(); };
  const dump = () => Object.fromEntries(Object.keys(w.localStorage).map((k) => [k, w.localStorage.getItem(k)]));
  const text = () => $('#app').textContent;
  return { w, d, $, click, dump, text, errors };
}
const RUN = 'mathquest_run_v1';
const META = 'mathquest_meta_v2';

// start a math adventure and enter the first fight
function startMathFight() {
  const p = open();
  p.click('#later');
  p.click('[data-new="math"]');
  p.click('.choice'); p.click('#go');
  const fight = [...p.d.querySelectorAll('.node.open')].find((n) => n.getAttribute('aria-label') === 'Kampf') || p.$('.node.open');
  p.click(fight);
  return p;
}

// 1. Parent area must not delete a saved adventure
{
  const p1 = startMathFight();
  const saved = p1.dump();
  check(!!saved[RUN], 'adventure is saved after entering a node');
  const p2 = open(saved);
  for (let i = 0; i < 5; i++) p2.click('#logo');
  check(p2.text().includes('Elternbereich'), 'parent area opens after 5 taps');
  p2.click('#rtut'); p2.click('#rstats');
  check(!!p2.dump()[RUN], 'parent-area buttons keep the saved adventure');
}

// 2. "Neu" → "Zurück" and "Neu" → "Ja" → "Zurück" keep the saved adventure
{
  const p = open(startMathFight().dump());
  p.click('[data-new="math"]'); p.click('.overlay #no');
  check(!!p.dump()[RUN], 'cancelling "Neu" keeps the saved adventure');
  p.click('[data-new="math"]'); p.click('.overlay #yes');
  check(!!p.$('#back'), 'hero selection has a back button');
  p.click('#back');
  check(!!p.dump()[RUN] && !!p.$('[data-cont="math"]'), 'going back from hero selection keeps the saved adventure');
}

// 3. A fight continues after reopening (same enemy, can't escape to another node)
{
  const p1 = startMathFight();
  const enemy = p1.$('.plate.enemy .name') && p1.$('.plate.enemy .name').textContent;
  const p2 = open(p1.dump());
  p2.click('[data-cont="math"]');
  check(!!p2.$('#fe') && p2.$('.plate.enemy .name').textContent === enemy, 'reopened adventure continues the same fight (' + enemy + ')');
  check(p2.text().includes('Der Kampf geht weiter'), 'shows that the fight continues');
}

// 4. Damaged storage never blocks the start
{
  for (const bad of ['{"stats":null}', '{"stats":{"math":5},"dex":[1],"knowSeq":"x"}', 'not json', '[]']) {
    const p = open({ [META]: bad, [RUN]: '{"hero":null}' });
    if (p.$('#later')) p.click('#later');
    check(!!p.$('[data-new="math"]') && p.errors.length === 0, 'starts with damaged progress data ' + bad);
    check(!p.$('[data-cont="math"]'), 'ignores a damaged saved adventure (' + bad + ')');
  }
}

// 5./6. Answers count when they are checked – reloading before "Weiter" changes nothing
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function answer(p, right) {
  if (p.$('#tutok')) p.click('#tutok');
  p.click('.atk[data-i="0"]');
  if (p.$('#tutok')) p.click('#tutok');
  const ans = p.w.__task.answers.map((a) => (right ? a : a + 1));
  const inps = [...p.d.querySelectorAll('.inp')];
  ans.forEach((a, i) => { inps[i].click(); for (const ch of String(a)) p.click(`.numpad [data-k="${ch}"]`); });
  p.click('.numpad [data-k="ok"]');
}
async function reloadCases() {
  { // wrong answer, reload before "Weiter": the enemy still gets its free hit
    const p1 = startMathFight(); const hp0 = p1.w.__mq.run.hero.hp;
    answer(p1, false);
    const p2 = open(p1.dump()); p2.click('[data-cont="math"]');
    await sleep(1700);
    const r = p2.w.__mq.run; const tries = Object.values(p2.w.__mq.meta.stats.math).reduce((n, s) => n + s.t, 0);
    check(tries === 1, 'a wrong answer is counted even if the app is closed before "Weiter"');
    check(r.hero.hp < hp0 || r.shield === false && p2.text().includes('greift'), 'the enemy takes its owed turn after reopening');
  }
  { // winning hit, reload before "Weiter": the reward is not lost
    const p1 = startMathFight(); p1.w.__mq.run.node.enemy.hp = 1;
    answer(p1, true);
    const p2 = open(p1.dump()); p2.click('[data-cont="math"]');
    check(p2.text().includes('besiegt'), 'a defeated enemy gives its reward after reopening');
    check(p2.w.__mq.run.hero.xp > 0 || p2.w.__mq.run.hero.level > 1, 'XP from the won fight is kept');
  }
}

// 7. Stats are kept per mode and per task type
{
  const p = open(); p.click('#later');
  const m = p.w.__mq.meta;
  check(m.stats.math && m.stats.math.add && typeof m.stats.math.add.c === 'number', 'stats are stored per mode and task type');
}

// 8. Setup dialog: shown on first start only; old saves get the new fields with defaults
{
  const p1 = open();
  check(!!p1.$('#later') && !!p1.$('#setpin') && !!p1.$('#setload') && !p1.$('[data-new]'), 'setup dialog shows on the first start');
  p1.click('#later');
  check(!!p1.$('[data-new="math"]') && !!p1.$('#parents'), '"Später" leads to the title with a parent button');
  const m = p1.w.__mq.meta;
  check(m.setup.skipped === true && m.setup.done === false && !!m.setup.at && m.pin === '', '"Später" is saved, no PIN');
  const p2 = open(p1.dump());
  check(!p2.$('#later') && !!p2.$('[data-new="math"]'), 'setup dialog does not come back after "Später"');
  p2.click('#parents');
  check(p2.text().includes('Elternbereich') && p2.text().includes('Noch keine PIN'), 'without PIN the parent area opens directly and says so');
  check(['practice', 'progress', 'save', 'appsec'].every((s) => p2.$('[data-jump="' + s + '"]') && p2.$('#p-' + s)), 'parent area has the four sections with jump bar');

  const old = { runs: 4, wins: 1, dex: { Sumpfbrocken: { world: 1 } }, sound: false };
  const p3 = open({ [META]: JSON.stringify(old) });
  const m3 = p3.w.__mq.meta;
  check(m3.runs === 4 && m3.sound === false && m3.pin === '' && m3.setup.done === false && m3.storage.persisted === false && m3.storage.warnedAt === '', 'old save loads, new fields get defaults');
  check(!!p3.$('#later'), 'old save sees the setup dialog once');
  const p4 = open({ [META]: JSON.stringify({ setup: { done: 'x', skipped: true }, pin: 5, storage: [] }) });
  const m4 = p4.w.__mq.meta;
  check(m4.setup.done === false && m4.setup.skipped === true && m4.setup.at === '' && m4.pin === '' && m4.storage.persisted === false && p4.errors.length === 0, 'wrong-typed setup/pin/storage fall back to defaults');
}

// 9. PIN: set twice, wrong PIN, pause after three tries, parental gate
const typePin = (p, pin) => { for (const ch of pin) p.click(`.numpad [data-k="${ch}"]`); };
{
  const p1 = open();
  p1.click('#setpin');
  typePin(p1, '1234'); typePin(p1, '4321');
  check(p1.text().includes('verschieden') && !p1.w.__mq.meta.pin, 'two different PINs are not saved');
  typePin(p1, '2468'); typePin(p1, '2468');
  const m = p1.w.__mq.meta;
  check(!!m.pin && m.pin !== '2468' && !JSON.stringify(p1.dump()).includes('2468') && m.setup.done === true, 'PIN is saved hashed, setup done');
  check(!!p1.$('[data-new="math"]'), 'after setting the PIN the title opens');

  const p2 = open(p1.dump());
  check(!p2.$('#later'), 'setup dialog does not come back after setting a PIN');
  p2.click('#parents');
  check(!!p2.$('#cval') && !p2.$('#p-practice'), 'parent button asks for the PIN');
  typePin(p2, '1111');
  check(p2.text().includes('Falsche PIN') && !p2.$('#p-practice'), 'wrong PIN is rejected');
  typePin(p2, '2468');
  check(!!p2.$('#p-practice'), 'right PIN opens the parent area');

  const p3 = open(p1.dump());
  for (let i = 0; i < 5; i++) p3.click('#logo');
  check(!!p3.$('#cval') && !p3.$('#p-practice'), '5 taps on the title also ask for the PIN');
  typePin(p3, '0000'); typePin(p3, '0000'); typePin(p3, '0000');
  check(p3.text().includes('30 Sekunden') && p3.$('.numpad [data-k="2"]').disabled, 'three wrong PINs pause the numpad');
  typePin(p3, '2468');
  check(!p3.$('#p-practice'), 'the right PIN does nothing during the pause');

  const p4 = open(p1.dump());
  p4.click('#parents'); p4.click('#forgot');
  const task = () => p4.$('.codetask').textContent.match(/(\d+) · (\d+)/);
  let [, a, b] = task();
  typePin(p4, String(+a * +b + 1)); p4.click('.numpad [data-k="ok"]');
  check(p4.text().includes('stimmt nicht') && !!p4.$('.codetask'), 'wrong gate answer gives a new task');
  [, a, b] = task();
  check(+a >= 10 && +a <= 99 && +b >= 10 && +b <= 99, 'gate multiplies two two-digit numbers');
  typePin(p4, String(+a * +b)); p4.click('.numpad [data-k="ok"]');
  check(p4.text().includes('PIN festlegen'), 'right gate answer leads to choosing a new PIN');
  typePin(p4, '1357'); typePin(p4, '1357');
  check(!!p4.$('#p-practice'), 'after the new PIN the parent area opens');
  const p5 = open(p4.dump());
  p5.click('#parents'); typePin(p5, '1357');
  check(!!p5.$('#p-practice'), 'the new PIN works after reopening');
  p5.click('#pdel');
  check(p5.w.__mq.meta.pin === '' && p5.text().includes('Noch keine PIN'), 'PIN can be removed in the parent area');
}

// 10. A save from before division/rounding gains the new task types with empty stats; its adventure keeps loading
{
  const oldStats = { add: { c: 5, t: 7, hist: [1, 0] }, sub: { c: 1, t: 1, hist: [1] }, mul: { c: 0, t: 0, hist: [] }, riddle: { c: 0, t: 0, hist: [] }, seq: { c: 0, t: 0, hist: [] }, nb: { c: 0, t: 0, hist: [] }, grid: { c: 2, t: 3, hist: [] } };
  const p1 = startMathFight(); const saved = p1.dump();
  const r = JSON.parse(saved[RUN]); r.tiers = { add: 2, grid: 1 }; saved[RUN] = JSON.stringify(r);
  saved[META] = JSON.stringify({ runs: 3, wins: 1, stats: { math: oldStats }, off: { math: ['seq'] } });
  const p = open(saved); if (p.$('#later')) p.click('#later'); const m = p.w.__mq.meta.stats.math;
  check(m.add.c === 5 && m.grid.t === 3, 'old stats are kept');
  check(['div', 'rest', 'rund', 'dopp'].every((k) => m[k] && m[k].c === 0 && m[k].t === 0 && Array.isArray(m[k].hist)), 'old save gains empty stats for the new task types');
  p.click('[data-cont="math"]');
  check(!!p.$('#fe') && p.errors.length === 0, 'adventure saved before the new task types continues');
  const p2 = open(p.dump()); for (let i = 0; i < 5; i++) p2.click('#logo');
  check(['Teilen', 'Teilen mit Rest', 'Runden', 'Verdoppeln und Halbieren'].every((n) => p2.text().includes(n)), 'parent area lists the new task types');
}

reloadCases().then(() => {
  console.log('storage fails', fails);
  if (fails) process.exit(1);
});
