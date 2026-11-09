// Regression tests for saving/loading (runs the built docs/index.html in jsdom).
// Each "page load" is a fresh JSDOM that starts with the localStorage of the previous one,
// which is what a reload or reopening the app does.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8');

let fails = 0;
const check = (cond, msg) => { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); };

// opts.url: page address (e.g. with #lade=); opts.zip: give the page the compression streams jsdom lacks; opts.now: the page's clock
function open(storage, opts) {
  const errors = []; opts = opts || {};
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: opts.url || 'https://example.com/',
    beforeParse(w) {
      for (const [k, v] of Object.entries(storage || {})) w.localStorage.setItem(k, v); w.addEventListener('error', (e) => errors.push(e.message));
      if (opts.zip) Object.assign(w, { CompressionStream, DecompressionStream, Response, TextEncoder });
      if (opts.now) { const D = w.Date, now = Date.parse(opts.now); w.Date = class extends D { constructor(...a) { super(...(a.length ? a : [now])); } static now() { return now; } }; }
    },
  });
  const w = dom.window, d = w.document;
  // tests were written for one title screen: a game's button sits on its subject screen, so open that from the
  // title first, and a title button looked for on a subject screen means going back
  const $ = (s) => d.querySelector(s) || toGame(s) || toTitle(s);
  const toTitle = (s) => { if (!d.querySelector('[data-new]') || !d.querySelector('#back')) return null; d.querySelector('#back').click(); return d.querySelector(s); };
  const toGame = (s) => { const m = /data-(?:new|cont)="(\w+)"/.exec(s); const sub = m && d.querySelector('[data-sub]') && w.__mq.subjectOf(m[1]); if (!sub) return null; d.querySelectorAll('[data-sub]')[[...d.querySelectorAll('[data-sub]')].findIndex((b) => b.textContent.includes(sub.subject))].click(); return d.querySelector(s); };
  const click = (s) => { const el = typeof s === 'string' ? $(s) : s; if (!el) throw new Error('missing ' + s + ' on: ' + d.body.textContent.slice(0, 200)); el.click(); };
  const dump = () => Object.fromEntries(Object.keys(w.localStorage).map((k) => [k, w.localStorage.getItem(k)]));
  const text = () => $('#app').textContent;
  return { w, d, $, click, dump, text, errors };
}
const RUN = 'mathquest_run_v1';
const META = 'mathquest_meta_v2';

// start a math adventure and enter the first fight
function startMathFight(opts) {
  const p = open(null, opts);
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
function answer(p, right, atk) {
  if (p.$('#tutok')) p.click('#tutok');
  p.click(atk || '.atk[data-i="0"]');
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
  check(!!p1.$('[data-sub]') && !!p1.$('#parents'), '"Später" leads to the title with a parent button');
  const m = p1.w.__mq.meta;
  check(m.setup.skipped === true && m.setup.done === false && !!m.setup.at && m.pin === '', '"Später" is saved, no PIN');
  const p2 = open(p1.dump());
  check(!p2.$('#later') && !!p2.$('[data-sub]'), 'setup dialog does not come back after "Später"');
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

// 11. A save from before the Kirchenjahr unit loads, and a Kirchenjahr adventure continues after reopening
{
  const p0 = open(); const old = JSON.parse(JSON.stringify(p0.w.__mq.meta)); delete old.stats.kirchenjahr;
  const p1 = open({ [META]: JSON.stringify(old) }); if (p1.$('#later')) p1.click('#later');
  check(p1.errors.length === 0 && p1.w.__mq.meta.stats.kirchenjahr && p1.w.__mq.meta.stats.kirchenjahr.rf.t === 0, 'old save without Kirchenjahr stats loads with empty stats');
  p1.click('[data-new="kirchenjahr"]'); p1.click('.choice'); p1.click('#go'); p1.click('.node.open');
  const p2 = open(p1.dump());
  check(!!p2.dump().mathquest_run_kirchenjahr && !!p2.$('[data-cont="kirchenjahr"]'), 'Kirchenjahr adventure is saved and can be continued');
}

// 19. Markt: coins in the run, one market per world, paying, change, reload inside the market
{
  const skip = { setup: { done: false, skipped: true, at: 'x' } };
  const p1 = startMathFight(); const r0 = p1.w.__mq.run;
  check(r0.coins === 100, 'a new Zahlenquest adventure starts with 1 € in the purse');
  const markets = r0.map.flatMap((fl, f) => fl.filter((n) => n.t === 'markt').map(() => f));
  check(markets.length === 1 && markets[0] >= 2 && markets[0] <= 5, 'exactly one market per world, on floors 3–6');
  { // an adventure saved before coins existed loads with an empty purse
    const saved = p1.dump(); const r = JSON.parse(saved[RUN]); delete r.coins; r.map.forEach((fl) => fl.forEach((n) => { if (n.t === 'markt') n.t = 'event'; })); saved[RUN] = JSON.stringify(r);
    const p = open(saved); p.click('[data-cont="math"]');
    check(p.errors.length === 0 && p.w.__mq.run.coins === 0 && !!p.$('#fe'), 'old adventure without coins continues with 0 ct');
  }
  { // parents switch „Geld“ off: no market in new maps, no coins on the map
    const p = open({ [META]: JSON.stringify(Object.assign({ off: { math: ['geld'] } }, skip)) });
    p.click('[data-new="math"]'); p.click('.choice'); p.click('#go');
    check(!p.w.__mq.run.map.flat().some((n) => n.t === 'markt') && !p.text().includes('🪙'), 'with „Geld“ switched off there is no market and no purse');
    const k = open({ [META]: JSON.stringify(skip) }); k.click('[data-new="kartoffel"]'); k.click('.choice'); k.click('#go');
    check(!k.w.__mq.run.map.flat().some((n) => n.t === 'markt'), 'other subjects have no market');
  }
  // stand in front of the market with a fixed purse and offers, then reopen the app
  const atMarket = (world, coins) => { const saved = p1.dump(); const r = JSON.parse(saved[RUN]); const f = r.map.findIndex((fl) => fl.some((n) => n.t === 'markt'));
    r.world = world; r.floor = f + 1; r.path = r.map.slice(0, f + 1).map((fl, k) => (k === f ? fl.findIndex((n) => n.t === 'markt') : 0)); r.coins = coins;
    r.node = { type: 'markt', offers: ['beere', 'trank', 'engel'], sold: [] }; saved[RUN] = JSON.stringify(r);
    const p = open(saved); p.click('[data-cont="math"]'); if (p.$('#tutok')) p.click('#tutok'); return p; };
  const coin = (p, v) => p.click(`.coins .coin[data-v="${v}"]`);
  const offer = (p, i) => p.click(`.offer[data-i="${i}"]`);
  const stat = (p) => p.w.__mq.meta.stats.math.geld;
  {
    const p = atMarket(1, 150);
    check(!!p.$('.market') && p.errors.length === 0 && p.$('#purse').textContent === '1 € 50 ct' && [...p.d.querySelectorAll('.offer .name')].map((x) => x.textContent).join() === 'Beere,Trank,Schutzengel', 'a saved run inside the market reopens with the same offers and purse');
    offer(p, 2); check(p.$('#pay').disabled && p.d.querySelectorAll('.coins .coin:not([disabled])').length === 0 && p.text().includes('reicht dein Geld noch nicht'), 'no purchase without enough money');
    offer(p, 0); coin(p, 50); p.click('#pay');
    check(p.w.__mq.run.coins === 150 && !p.$('.offer.sold') && stat(p).t === 1 && stat(p).c === 0 && p.text().includes('Das sind 50 ct'), 'paying the wrong amount gives the money back and counts as a try');
    offer(p, 0); coin(p, 100);
    check(p.$('.coins .coin[data-v="100"]').disabled && !p.$('.coins .coin[data-v="50"]').disabled, 'coins worth more than what is left in the purse are greyed out');
    p.click('#counter .coin'); check(!p.$('#counter .coin') && !p.$('.coins .coin[data-v="100"]').disabled, 'tapping a coin on the counter takes it back');
    coin(p, 20); coin(p, 20); coin(p, 10); coin(p, 10); p.click('#pay');
    const r = p.w.__mq.run;
    check(r.coins === 90 && r.items.filter((x) => x === 'beere').length === 2 && !!p.$('.offer.sold[data-i="0"]') && stat(p).c === 1 && stat(p).t === 2, 'paying exactly buys the berry plus a bonus berry');
    const p2 = open(p.dump()); p2.click('[data-cont="math"]');
    check(!!p2.$('.offer.sold[data-i="0"]') && p2.w.__mq.run.coins === 90, 'after reopening the bought item stays sold and the purse stays the same');
    p2.click('#leave'); check(!!p2.$('.wmap') && p2.w.__mq.run.floor === r.floor + 1, 'leaving the market moves on');
  }
  {
    const p = atMarket(2, 300); offer(p, 1); coin(p, 200); p.click('#pay'); if (p.$('#tutok')) p.click('#tutok');
    const answer = (e, c) => { const inps = p.d.querySelectorAll('.inp'); inps[0].click(); for (const ch of String(e)) p.click(`.numpad [data-k="${ch}"]`); inps[1].click(); for (const ch of String(c)) p.click(`.numpad [data-k="${ch}"]`); p.click('.numpad [data-k="ok"]'); };
    check(p.$('.expr').textContent === '2 € − 1 € 20 ct' && p.d.querySelectorAll('.inp').length === 2, 'overpaying in world 2 asks for the change in € and ct');
    answer(0, 70); check(p.text().includes('Richtig wäre: 80 ct'), 'a wrong change answer shows the right amount without a comma'); p.click('#next');
    check(!!p.$('.market') && p.w.__mq.run.coins === 300 && !p.$('.offer.sold') && stat(p).t === 1, 'wrong change: money back, nothing bought, the try counts');
    offer(p, 1); coin(p, 200); p.click('#pay'); answer(0, 80); p.click('#next');
    check(p.w.__mq.run.coins === 180 && !!p.$('.offer.sold[data-i="1"]') && p.w.__mq.run.items.filter((x) => x === 'beere').length === 0 && stat(p).c === 1, 'right change buys the potion (no bonus berry in world 2)');
  }
}

// 12. Save code: export, import (replace/merge), broken codes, link import, backup reminder
const same = (a, b) => { const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x)); return canon(a) === canon(b); };
const until = async (fn) => { for (let i = 0; i < 100 && !fn(); i++) await sleep(10); return fn(); };
async function exportCode(p) {
  p.click('#parents'); p.click('#pexport');
  await until(() => p.$('#pcode'));
  return p.$('#pcode').value;
}
async function saveCodeCases() {
  // source device: an adventure in progress plus some progress
  const src = startMathFight();
  Object.assign(src.w.__mq.meta, { wins: 2, bestWorld: 2, dex: { Sumpfbrocken: { world: 1 }, 'Glaspanzer': { world: 2 } }, know: { l1: { c: 1, t: 2, ws: 1, last: 4 } }, knowSeq: 4, progressAt: '2026-11-01T10:00:00.000Z' });
  src.w.__mq.meta.stats.math.add = { c: 7, t: 9, hist: [1, 0, 1] };
  src.w.__mq.screenTitle();
  check(!!src.$('#parents .dot'), 'a win that was never saved puts a dot on the parent button');
  const code = await exportCode(src);
  check(code.startsWith('LQ0.'), 'without compression in the browser the code starts with LQ0.');
  check(!!src.$('#pout svg.qr') && src.text().includes('2 Siege') && src.text().includes('Laufende Abenteuer: Zahlenquest'), 'export shows a QR code and the summary');
  { // the QR short version leaves out never-practised task types; loading it brings them back empty
    const m = JSON.parse(JSON.stringify(src.w.__mq.meta)); m.stats = { math: { add: m.stats.math.add } };
    const back = await src.w.__mq.unpackSave(await src.w.__mq.packSave({ v: 1, at: '', meta: m, runs: {} }));
    check(back.meta.stats.math.add.c === 7 && back.meta.stats.math.sub.t === 0 && back.meta.stats.freunde.rf.t === 0, 'a save code without unused task types loads with empty stats for them');
  }
  check(!!src.w.__mq.meta.backupAt && Date.now() - Date.parse(src.w.__mq.meta.backupAt) < 60000, 'export remembers when it was saved');
  src.w.__mq.screenTitle();
  check(!src.$('#parents .dot'), 'after saving the dot is gone');
  const saved = src.dump();

  // replace on a fresh device via the setup dialog
  const dst = open();
  dst.click('#setload');
  check(dst.d.activeElement === dst.$('#pcodein'), '"Spielstand laden" in the setup dialog leads to the code field');
  dst.$('#pcodein').value = code; dst.click('#preplace');
  await until(() => dst.$('.overlay #yes'));
  dst.click('.overlay #yes');
  const got = dst.dump();
  check(same(JSON.parse(got[META]), JSON.parse(saved[META])) && same(JSON.parse(got[RUN]), JSON.parse(saved[RUN])), 'export then replace gives the same save, including the running adventure');
  check(!!dst.$('[data-cont="math"]') && !dst.$('#later'), 'after loading the title opens with the adventure');
  dst.click('[data-cont="math"]');
  check(!!dst.$('#fe') && dst.errors.length === 0, 'the loaded adventure can be continued');

  // broken codes are rejected with a message and change nothing
  const bad = open(saved);
  bad.click('#parents');
  for (const c of ['', 'hallo', 'LQ0.abc!!', 'LQ1.' + code.slice(4), code.slice(0, -12), 'LQ0.' + Buffer.from('{"v":1}').toString('base64url'), 'LQ0.' + Buffer.from('[1,2]').toString('base64url')]) {
    bad.$('#pcodein').value = c; bad.$('#pimsg').textContent = ''; bad.click('#pmerge');
    await until(() => bad.$('#pimsg').textContent);
    check(bad.$('#pimsg').textContent.includes('Code') && same(bad.dump(), saved), 'broken code is rejected with a message: ' + JSON.stringify(c.slice(0, 20)));
  }

  // compressed codes (LQ1.) where the browser can compress
  const z = open(saved, { zip: true });
  const zcode = await z.w.__mq.packSave({ v: 1, at: '2026-11-09T08:00:00.000Z', meta: JSON.parse(saved[META]), runs: { math: JSON.parse(saved[RUN]) } });
  check(zcode.startsWith('LQ1.') && zcode.length < code.length, 'with compression the code starts with LQ1. and is shorter (' + zcode.length + ' vs ' + code.length + ')');
  const back = await z.w.__mq.unpackSave(zcode);
  check(same(back.meta, JSON.parse(saved[META])) && same(back.runs.math, JSON.parse(saved[RUN])), 'LQ1. code reads back to the same save');
  const old = open(saved); old.click('#parents');
  old.$('#pcodein').value = zcode; old.click('#pmerge');
  await until(() => old.$('#pimsg').textContent);
  check(old.$('#pimsg').textContent.includes('Browser'), 'a browser without decompression explains why it cannot read LQ1.');

  // link import on a fresh device: dialog, hash removed, merge takes the adventure
  const link = open(null, { url: 'https://example.com/#lade=' + code });
  await until(() => link.$('.overlay #imerge'));
  check(link.$('.overlay').textContent.includes('Spielstand gefunden') && link.$('.overlay').textContent.includes('2 Siege'), 'opening the link shows "Spielstand gefunden" with the summary');
  check(link.w.location.hash === '' && link.w.location.href === 'https://example.com/', 'the code is removed from the address');
  link.click('.overlay #imerge');
  const lm = link.w.__mq.meta;
  check(!!link.dump()[RUN] && lm.wins === 2 && lm.setup.skipped && !!link.$('[data-cont="math"]'), 'merging into a fresh device takes the adventure and skips the setup dialog');
  const no = open(null, { url: 'https://example.com/#lade=' + code });
  await until(() => no.$('.overlay #ino'));
  no.click('.overlay #ino');
  check(!no.$('.overlay') && !no.dump()[META] && !!no.$('#later'), '"Nicht laden" changes nothing');
  const broken = open(saved, { url: 'https://example.com/#lade=LQ0.kaputt' });
  await until(() => broken.$('.overlay #iok'));
  check(broken.$('.overlay').textContent.includes('nicht geladen') && same(broken.dump(), saved), 'a broken link shows a message and changes nothing');

  // merge keeps the adventure of this device; with a PIN the parents must confirm
  const own = startMathFight(); const ownRun = own.dump()[RUN];
  const pinned = JSON.parse(own.dump()[META]); pinned.pin = 'h1test';
  const dev = open({ [META]: JSON.stringify(pinned), [RUN]: ownRun }, { url: 'https://example.com/#lade=' + code });
  await until(() => dev.$('.overlay #imerge'));
  dev.click('.overlay #imerge');
  check(!!dev.$('#cval') && dev.w.__mq.meta.wins === 0, 'with a PIN, loading from a link asks for the PIN first');

  const keep = open(own.dump()); keep.click('#parents');
  keep.$('#pcodein').value = code; keep.click('#pmerge');
  await until(() => keep.$('[data-cont]'));
  check(keep.dump()[RUN] === ownRun && keep.w.__mq.meta.wins === 2, 'merge keeps the adventure of this device and takes the wins from the code');

  // merge rules
  const base = open().w.__mq.meta;
  const mk = (o) => Object.assign(JSON.parse(JSON.stringify(base)), o);
  const a = mk({ runs: 3, wins: 1, bestWorld: 2, knowSeq: 10, dex: { A: { world: 1 } }, seenTut: { 'math:add': true }, evoUnlocked: { x: 1 }, know: { q1: { c: 1, t: 2, ws: 1, last: 9 }, q3: { c: 0, t: 1, ws: 1, last: 2 } }, sound: false, grade: 3, progressAt: '2026-10-01T00:00:00.000Z', backupAt: '2026-10-02T00:00:00.000Z', seenNews: '2026-11-09' });
  a.stats.math.add = { c: 5, t: 6, hist: [1, 1] };
  const b = mk({ runs: 5, wins: 0, bestWorld: 1, knowSeq: 20, dex: { B: { world: 2 }, A: { world: 3 } }, seenTut: { 'ethik:rf': true }, know: { q1: { c: 2, t: 2, ws: 0, last: 15 }, q2: { c: 1, t: 1, ws: 0, last: 3 } }, sound: true, off: { math: ['grid'] }, pin: 'h1abc', setup: { done: true, skipped: false, at: 'x' }, progressAt: '2026-11-01T00:00:00.000Z', backupAt: '2026-11-02T00:00:00.000Z' });
  b.stats.math.add = { c: 2, t: 3, hist: [0] }; b.stats.ethik.rf = { c: 4, t: 4, hist: [1] };
  const m = open().w.__mq.mergeMeta(a, b);
  check(m.runs === 5 && m.wins === 1 && m.bestWorld === 2 && m.knowSeq === 20, 'merge: counters take the maximum');
  check(same(m.dex, { A: { world: 1 }, B: { world: 2 } }) && m.seenTut['math:add'] && m.seenTut['ethik:rf'] && m.evoUnlocked.x === 1, 'merge: monster book and seen explanations are combined');
  check(m.stats.math.add.c === 7 && m.stats.math.add.t === 9 && same(m.stats.math.add.hist, [1, 1]) && m.stats.ethik.rf.c === 4, 'merge: right/total are added, recent answers stay from this device');
  check(same(m.know.q1, { c: 3, t: 4, ws: 0, last: 15 }) && same(m.know.q2, b.know.q2) && same(m.know.q3, a.know.q3), 'merge: knowledge questions add up, newer state wins');
  check(m.pin === 'h1abc' && m.sound === true && same(m.off, { math: ['grid'] }) && m.setup.done === true, 'merge: a device without PIN takes the settings from the code');
  check(m.progressAt === b.progressAt && m.backupAt === a.backupAt && m.seenNews === a.seenNews, 'merge: last win is the newer one, backup date stays from this device');
  const mm = open().w.__mq.mergeMeta(mk({ materials: { erz: 2, stein: 1 } }), mk({ materials: { erz: 1, stein: 5, holz: 3 } }));
  check(same(mm.materials, { erz: 2, stein: 5, holz: 3 }), 'merge: materials take the larger amount per kind');
  const m2 = open().w.__mq.mergeMeta(Object.assign(a, { pin: 'h1own' }), b);
  check(m2.pin === 'h1own' && m2.sound === false && same(m2.off, {}), 'merge: a device with PIN keeps its settings');
  check(same(a.stats.math.add, { c: 5, t: 6, hist: [1, 1] }), 'merge does not change its inputs');

  // backup reminder
  const day = 864e5, iso = (t) => new Date(t).toISOString();
  const dot = (o) => { const p = open({ [META]: JSON.stringify(Object.assign({ setup: { done: false, skipped: true, at: '' } }, o)) }); return !!p.$('#parents .dot'); };
  check(!dot({}) && !dot({ wins: 3 }), 'no reminder without a new win');
  check(dot({ progressAt: iso(Date.now() - 40 * day), backupAt: iso(Date.now() - 50 * day) }), 'reminder when the last backup is older than 30 days and a win came after it');
  check(!dot({ progressAt: iso(Date.now() - day), backupAt: iso(Date.now() - 10 * day) }), 'no reminder within 30 days of a backup');
  check(!dot({ progressAt: iso(Date.now() - 50 * day), backupAt: iso(Date.now() - 40 * day) }), 'no reminder when nothing was won since the backup');
  const o = open({ [META]: JSON.stringify({ runs: 1 }) }).w.__mq.meta;
  check(o.backupAt === '' && o.progressAt === '', 'old save loads with empty backup and win dates');
}

// 13. Stamps: earning rules, stamp card, buying, old saves
async function stampCases() {
  const week = (p) => p.w.eval('MQ.isoWeek(new Date())');
  { // new Monsterbuch entry 2, every 10 right answers 1, shown on the won screen; the week is marked
    const p = startMathFight(); const m = p.w.__mq.meta;
    check(m.stamps === 2 && m.stampsTotal === 2, 'a new Monsterbuch entry gives 2 stamps');
    p.w.__mq.run.right = 9; p.w.__mq.run.node.enemy.hp = 1;
    answer(p, true); p.click('#next'); await sleep(1600);
    check(m.stamps === 3 && m.stampsTotal === 3 && p.w.__mq.run.right === 0, 'the 10th right answer pays 1 stamp at the end of the fight');
    check(p.text().includes('besiegt') && p.text().includes('+3 🏷'), 'won screen shows +3 🏷');
    check(m.stampCard[week(p)] === 1, 'playing marks the current week on the stamp card');
    const p2 = open(p.dump());
    check(p2.w.__mq.meta.stamps === 3 && p2.w.__mq.meta.stampCard[week(p2)] === 1, 'stamps and stamp card are saved');
    check(p2.$('#stampsTop').textContent.includes('3'), 'title shows the stamp count');
  }
  { // boss 5, adventure won 10
    const p = startMathFight(); const r = p.w.__mq.run; const m = p.w.__mq.meta;
    r.world = 3; r.floor = 8; r.node.enemy.boss = true; r.node.enemy.fresh = false; r.node.enemy.hp = 1; m.stamps = 0; m.stampsTotal = 0;
    answer(p, true); p.click('#next'); await sleep(1600);
    check(m.stamps === 5 && p.text().includes('+5 🏷'), 'a beaten boss gives 5 stamps');
    p.click('#next');
    check(m.stamps === 15 && m.stampsTotal === 15 && p.text().includes('+10 🏷') && p.text().includes('Sieg'), 'a won adventure gives 10 stamps');
  }
  { // a lost adventure pays the right answers too, and keeps a stamp week set to 2
    const p = startMathFight(); const r = p.w.__mq.run; const m = p.w.__mq.meta;
    r.right = 25; r.hero.hp = 1; r.items = []; m.stamps = 0; m.stampCard[week(p)] = 2;
    answer(p, false); p.click('#next'); await sleep(3800);
    check(p.text().includes('Besiegt') || p.text().includes('stärker'), 'hero lost the fight');
    check(m.stamps === 2 && p.text().includes('+2 🏷'), 'a lost adventure pays 1 stamp per 10 right answers');
    check(m.stampCard[week(p)] === 2, 'a playing week never lowers a 2 on the stamp card');
  }
  { // buying deducts and unlocks; old saves have 0 and still load
    const old = { runs: 2, wins: 0, dex: {}, setup: { done: false, skipped: true, at: 'x' } };
    const p = open({ [META]: JSON.stringify(old) }); const m = p.w.__mq.meta;
    check(m.stamps === 0 && m.stampsTotal === 0 && JSON.stringify(m.stampCard) === '{}' && JSON.stringify(m.owned) === '{}' && m.progressAt === '' && p.errors.length === 0, 'old save loads with 0 stamps, empty card and nothing owned');
    p.click('[data-new="math"]');
    check(!p.$('.choice[data-id="kauz"]') && p.text().includes('Steinkauz') && p.text().includes('40 🏷'), 'fourth hero is locked on the starter screen');
    p.click('#back'); p.click('#stamps');
    check(p.text().includes('Stempelkarte') && p.d.querySelectorAll('.wk').length >= 47 && p.d.querySelectorAll('.wk.now').length === (p.w.eval('MQ.schoolWeeks(new Date()).includes(MQ.isoWeek(new Date()))') ? 1 : 0), 'Stempelheft shows the school-year card with this week outlined');
    check(p.$('[data-buy="map-w1-winter"]').disabled, 'cannot buy without enough stamps');
    m.stamps = 70; m.stampsTotal = 70; p.w.__mq.screenTitle(); p.click('#stamps');
    p.click('[data-buy="map-w1-winter"]'); p.click('.overlay #no');
    check(m.stamps === 70 && !m.owned['map-w1-winter'], '"Zurück" in the buy dialog buys nothing');
    p.click('[data-buy="map-w1-winter"]'); p.click('.overlay #yes');
    check(m.stamps === 45 && m.stampsTotal === 70 && m.owned['map-w1-winter'] === true && !!m.progressAt && !p.$('[data-buy="map-w1-winter"]'), 'buying the winter map costs 25 stamps');
    p.click('[data-buy="hero-kauz"]'); p.click('.overlay #yes');
    check(m.stamps === 5 && m.owned['hero-kauz'] === true, 'buying the fourth hero costs 40 stamps');
    check(p.$('[data-buy="map-w2-herbst"]').disabled, 'with 5 stamps left the next map stays locked');
    const p2 = open(p.dump());
    p2.click('[data-new="math"]'); p2.click('.choice[data-id="kauz"]'); p2.click('#go');
    check(p2.w.__mq.run.hero.id === 'kauz' && p2.$('.screen').style.background !== '', 'bought hero can be played, bought map look shows in world 1');
    const p3 = open({ [META]: JSON.stringify({ stamps: -4, stampsTotal: 'x', stampCard: [1], owned: 7 }) });
    const m3 = p3.w.__mq.meta;
    check(m3.stamps === 0 && m3.stampsTotal === 0 && JSON.stringify(m3.stampCard) === '{}' && JSON.stringify(m3.owned) === '{}' && p3.errors.length === 0, 'wrong-typed stamp fields fall back to defaults');
  }
  { // parent area shows the total
    const p = open({ [META]: JSON.stringify({ stampsTotal: 123, setup: { done: false, skipped: true, at: 'x' } }) });
    p.click('#parents');
    check(p.text().includes('Stempel verdient insgesamt') && p.text().includes('123'), 'parent area shows stamps earned in total');
  }
}
// 25. Kleiderkammer: buying, wearing, conditions, old saves
function wardrobeCases() {
  const skip = { setup: { done: false, skipped: true, at: 'x' } };
  { // an old save without worn/owned loads; earned pieces show their condition
    const p = open({ [META]: JSON.stringify(Object.assign({ runs: 3, wins: 0, stamps: 20 }, skip)) }); const m = p.w.__mq.meta;
    check(JSON.stringify(m.worn) === '{}' && JSON.stringify(m.owned) === '{}' && p.errors.length === 0, 'old save without worn/owned loads with nothing worn');
    p.click('#stamps'); p.click('#kk');
    check(p.text().includes('Kleiderkammer') && p.text().includes('Kleidung ändert nichts am Kampf.') && p.d.querySelectorAll('.kkitem').length === 6, 'Kleiderkammer opens from the Stempelheft with six pieces');
    check(!p.$('[data-hero="kauz"]') && p.$('[data-hero="fuchs"]') && p.$('[data-hero="knolli"]'), 'hero picker lists the heroes of all units, not locked ones');
    check(!p.$('[data-wear="ranzen"]') && p.text().includes('0 von 4') && !p.$('[data-wear="krone"]') && p.text().includes('Schulgarten') && !p.$('[data-wear="aehrenkranz"]'), 'Ranzen, Krone and Ährenkranz are locked with their condition');
    check(p.$('[data-buy="schal"]') && !p.$('[data-buy="schal"]').disabled && p.$('[data-buy="strohhut"]') && !p.$('[data-buy="strohhut"]').disabled, 'pieces with a price can be bought');
    p.click('[data-hero="baer"]');
    p.click('[data-buy="strohhut"]'); p.click('.overlay #no');
    check(m.stamps === 20 && !m.owned['outfit-strohhut'], '"Zurück" in the buy dialog buys nothing');
    p.click('[data-buy="strohhut"]'); p.click('.overlay #yes');
    check(m.stamps === 5 && m.owned['outfit-strohhut'] === true && m.worn.baer === 'strohhut' && !!m.progressAt && p.$('[data-off="strohhut"]'), 'buying the straw hat costs 15 stamps and puts it on the chosen hero');
    check(p.$('[data-buy="schal"]').disabled, 'with 5 stamps the scarf stays locked');
    p.click('[data-hero="fuchs"]'); p.click('[data-wear="strohhut"]');
    check(m.worn.fuchs === 'strohhut' && m.worn.baer === 'strohhut', 'a bought piece can be worn by several heroes');
    p.click('[data-off="strohhut"]');
    check(!m.worn.fuchs && m.worn.baer === 'strohhut', '"Ablegen" takes it off this hero only');
    // dressed hero shows on the starter screen, in the map top bar and in battle
    const q = open(p.dump()); q.click('[data-new="math"]');
    const hat = (el) => !!el && el.innerHTML.includes('#E8C25A');
    check(hat(q.$('.choice[data-id="baer"]')) && !hat(q.$('.choice[data-id="fuchs"]')), 'starter screen shows the outfit');
    q.click('.choice[data-id="baer"]'); q.click('#go');
    check(hat(q.$('.topbar')), 'map top bar shows the dressed hero');
    q.click([...q.d.querySelectorAll('.node.open')].find((n) => n.getAttribute('aria-label') === 'Kampf') || q.$('.node.open'));
    check(hat(q.$('#fh')) && !hat(q.$('#fe')), 'battle shows the outfit on the hero, never on the enemy');
  }
  { // earned pieces: 4 gold weeks → Ranzen, a won adventure → Krone, owned flag from the garden → Ährenkranz
    const p = open({ [META]: JSON.stringify(Object.assign({ wins: 1, stampCard: { '2026-W40': 2, '2026-W41': 2, '2026-W42': 1, '2026-W43': 2, '2026-W44': 2 }, owned: { 'outfit-aehrenkranz': true } }, skip)) });
    p.w.__mq.screenWardrobe('knolli');
    check(p.$('[data-wear="ranzen"]') && p.$('[data-wear="krone"]') && p.$('[data-wear="aehrenkranz"]'), 'earned pieces can be worn without stamps');
    p.click('[data-wear="krone"]'); p.click('[data-wear="ranzen"]');
    check(p.w.__mq.meta.worn.knolli === 'ranzen', 'one piece per hero at a time');
  }
  { // wrong-typed or unknown worn entries do not break loading; a piece that is not owned is not drawn
    const p = open({ [META]: JSON.stringify(Object.assign({ worn: { baer: 7, fuchs: 'gibt-es-nicht', kroete: 'brille' } }, skip)) });
    check(JSON.stringify(p.w.__mq.meta.worn) === '{"fuchs":"gibt-es-nicht","kroete":"brille"}' && p.errors.length === 0, 'wrong-typed worn entries are dropped on load');
    p.click('[data-new="math"]');
    check(!p.$('.choice[data-id="kroete"]').innerHTML.includes('#BFE3FF'), 'a worn piece that is not owned is not shown');
    const q = open({ [META]: JSON.stringify({ worn: [1] }) });
    check(JSON.stringify(q.w.__mq.meta.worn) === '{}' && q.errors.length === 0, 'worn of the wrong type falls back to empty');
  }
}
// 14. Deutsch: a save from before the subject existed gets stats for it; a Deutsch adventure continues after reopening
{
  const old = { runs: 2, stats: { math: {}, ethik: {}, kirchenjahr: {}, kartoffel: {} }, setup: { done: false, skipped: true, at: '' } };
  const p1 = open({ [META]: JSON.stringify(old) });
  const m = p1.w.__mq.meta;
  check(m.runs === 2 && m.stats.woerterwerkstatt.doppel.t === 0 && m.stats.satzbaustelle.umstell.t === 0 && p1.errors.length === 0, 'old save gets stats for the Deutsch units');
  for (const mode of ['woerterwerkstatt', 'satzbaustelle']) {
    const p1 = open({ [META]: JSON.stringify(old) });
    p1.click('[data-new="' + mode + '"]'); p1.click('.choice'); p1.click('#go');
    p1.click([...p1.d.querySelectorAll('.node.open')].find((n) => n.getAttribute('aria-label') === 'Kampf') || p1.$('.node.open'));
    const enemy = p1.$('.plate.enemy .name').textContent;
    const p2 = open(p1.dump());
    p2.click('[data-cont="' + mode + '"]');
    check(!!p2.$('#fe') && p2.$('.plate.enemy .name').textContent === enemy && p2.errors.length === 0, mode + ' adventure continues the same fight after reopening');
  }
}

// 15. Schulgarten: growth by the (injected) clock, harvest, bed 4, old saves, reload
function gardenCases() {
  const DAY = 864e5, T = Date.UTC(2026, 10, 9, 8);
  const skip = { setup: { done: false, skipped: true, at: 'x' } };
  { // an old save without garden/materials loads with four empty beds
    const p = open({ [META]: JSON.stringify(Object.assign({ runs: 3, wins: 1, stamps: 7 }, skip)) }); const m = p.w.__mq.meta;
    check(m.garden.beds.length === 4 && m.garden.beds.every((b) => b.crop === null && b.plantedAt === 0) && JSON.stringify(m.materials) === '{}' && m.stamps === 7 && p.errors.length === 0, 'old save without garden loads with four empty beds and no materials');
    check(!p.$('.gardencard'), 'title shows no garden card when nothing is ripe');
    const p2 = open({ [META]: JSON.stringify(Object.assign({ garden: { beds: [{ crop: 'mais', plantedAt: 1 }, 'x', { crop: 'hafer', plantedAt: 'y' }, { crop: 'weizen', plantedAt: 5 }, { crop: 'roggen', plantedAt: 1 }] }, materials: { hafer: -1, weizen: 2 } }, skip)) });
    const m2 = p2.w.__mq.meta;
    check(m2.garden.beds.length === 4 && m2.garden.beds.slice(0, 3).every((b) => b.crop === null) && m2.garden.beds[3].crop === 'weizen' && JSON.stringify(m2.materials) === '{"weizen":2}', 'broken beds and materials fall back to defaults, good ones are kept');
  }
  { // planting, growth phases, a planted bed survives a reload
    const p = open({ [META]: JSON.stringify(skip) }); p.w.__mq.now = T;
    p.click('#garden');
    check(p.text().includes('Beete wachsen auch, wenn du nicht spielst.') && p.d.querySelectorAll('[data-plant]').length === 3 && p.d.querySelectorAll('.bed.locked').length === 1, 'garden shows three free beds and bed 4 locked');
    p.click('[data-plant="0"]'); p.click('.overlay [data-crop="weizen"]');
    const m = p.w.__mq.meta;
    check(m.garden.beds[0].crop === 'weizen' && m.garden.beds[0].plantedAt === T && p.text().includes('Heute gesät'), 'planting weizen stores the crop and the time');
    const p2 = open(p.dump());
    check(p2.w.__mq.meta.garden.beds[0].crop === 'weizen' && p2.w.__mq.meta.garden.beds[0].plantedAt === T, 'a planted bed survives a reload');
    const phase = (days) => { p2.w.__mq.now = T + days * DAY; p2.w.__mq.screenTitle(); p2.click('#garden'); return p2.$('.bed').textContent; };
    check(phase(1).includes('Gesät') && phase(1).includes('Tag 1 von 7'), 'day 1: sown');
    check(phase(2).includes('Keimling') && phase(4.9).includes('Tag 4 von 7'), 'day 2 to 4: sprout');
    check(phase(5).includes('Ähre') && phase(5).includes('Tag 5 von 7') && !p2.$('[data-harvest]'), 'day 5: ear, nothing to harvest yet');
    check(phase(7).includes('Reif') && !!p2.$('[data-harvest="0"]'), 'day 7: ripe');
    check(phase(400).includes('Reif') && phase(-3).includes('Heute gesät'), 'a ripe bed never withers, a clock set back does no harm');
    check(!/Stunde|\d+:\d\d/.test(phase(3)), 'no hours or countdown');
    p2.w.__mq.now = T + 8 * DAY; p2.w.__mq.screenTitle();
    check(p2.$('.gardencard') && p2.$('.gardencard').textContent.includes('Dein Weizen ist reif.'), 'title shows a card when something is ripe');
    // harvest: question first, then 4 stamps, the crop and the Ährenkranz
    const m2 = p2.w.__mq.meta; m2.stamps = 0; m2.stampsTotal = 0; m2.progressAt = '';
    p2.click('#harvest'); p2.click('[data-harvest="0"]');
    check(!!p2.$('.overlay .question') && p2.d.querySelectorAll('.overlay .opt').length === 3 && m2.stamps === 0, 'harvest asks a question about the plant first');
    const ans = p2.w.eval('MK.GARDEN_POOL').find((e) => e.q === p2.$('.overlay .question').textContent);
    const right = [...p2.d.querySelectorAll('.overlay .opt')].find((o) => o.textContent === ans.o[ans.a]);
    check(!!ans && ['weizen', 'getreide'].includes(ans.crop), 'the question is about weizen or grain');
    p2.click(right);
    check(m2.stamps === 4 && m2.stampsTotal === 4 && m2.materials.weizen === 1 && m2.owned['outfit-aehrenkranz'] === true && !!m2.progressAt && m2.garden.beds[0].crop === null, 'harvest pays 4 stamps, counts the crop and unlocks the Ährenkranz');
    check(p2.text().includes('Richtig') && p2.text().includes('+4 🏷') && p2.text().includes('Ährenkranz'), 'harvest shows the result');
    p2.click('#hnext');
    const p3 = open(p2.dump());
    check(p3.w.__mq.meta.materials.weizen === 1 && p3.w.__mq.meta.stamps === 4 && !p3.$('.gardencard'), 'harvest is saved and the title card is gone');
  }
  { // a wrong answer still harvests; bed 4 opens after winning the Kartoffel-Werkstatt
    const beds = [{ crop: 'hafer', plantedAt: T - 9 * DAY }, { crop: null, plantedAt: 0 }, { crop: null, plantedAt: 0 }, { crop: 'roggen', plantedAt: T - 9 * DAY }];
    const p = open({ [META]: JSON.stringify(Object.assign({ garden: { beds }, owned: { 'outfit-aehrenkranz': true } }, skip)) }); p.w.__mq.now = T; const m = p.w.__mq.meta;
    p.click('#garden');
    check(!p.$('[data-harvest="3"]') && !!p.$('.bed.locked'), 'bed 4 stays locked and cannot be harvested without a Kartoffel win');
    p.click('[data-harvest="0"]');
    const ans = p.w.eval('MK.GARDEN_POOL').find((e) => e.q === p.$('.overlay .question').textContent);
    p.click([...p.d.querySelectorAll('.overlay .opt')].find((o) => o.textContent !== ans.o[ans.a]));
    check(m.stamps === 4 && m.materials.hafer === 1 && p.text().includes('Richtig wäre') && !p.text().includes('erste Ernte'), 'a wrong answer still harvests and shows the right answer');
    m.owned['beet-4'] = true; p.click('#hnext');
    check(!p.$('.bed.locked') && !!p.$('[data-harvest="3"]'), 'bed 4 opens once the Kartoffel-Werkstatt is won');
  }
  { // merging a save code keeps the larger harvest count and fills only empty beds
    const inc = open({ [META]: JSON.stringify(Object.assign({ materials: { weizen: 4, hafer: 1 }, garden: { beds: [{ crop: 'roggen', plantedAt: 9 }, { crop: 'hafer', plantedAt: 9 }] } }, skip)) }).w.__mq.meta;
    const p = open({ [META]: JSON.stringify(Object.assign({ materials: { weizen: 1, hafer: 3 }, garden: { beds: [{ crop: 'weizen', plantedAt: 5 }] } }, skip)) });
    const m = p.w.__mq.mergeMeta(p.w.__mq.meta, JSON.parse(JSON.stringify(inc)));
    check(m.materials.weizen === 4 && m.materials.hafer === 3 && m.garden.beds[0].crop === 'weizen' && m.garden.beds[1].crop === 'hafer' && m.garden.beds[2].crop === null, 'merging keeps the larger harvest count and fills only empty beds');
  }
}
const SKIPPED = { setup: { done: false, skipped: true, at: 'x' } };
// 20. Step 17: new task types and the Lesestube keep old saves working
{
  const p = open({ [META]: JSON.stringify({ runs: 2, stats: { math: { add: { c: 3, t: 4, hist: [1] } } } }) });
  const st = p.w.__mq.meta.stats.math;
  check(st.add.c === 3 && st.sadd && st.sadd.t === 0 && st.ssub && st.ssub.t === 0, 'old save gets empty statistics for the written methods');
  // a run saved before the Lesestube existed (map without it) still loads
  const old = { mode: 'satzbaustelle', world: 1, floor: 2, map: p.w.eval('MQ.makeMap(1)'), hero: { id: p.w.eval('MK.MODES.satzbaustelle.starters[0].id'), evo: 0, level: 1, xp: 0, hp: 50, maxHp: 65, attacks: p.w.eval('MK.MODES.satzbaustelle.starters[0].attacks') }, items: [], tiers: {}, path: [0], shield: false };
  const p2 = open({ [META]: JSON.stringify(SKIPPED), mathquest_run_satzbaustelle: JSON.stringify(old) });
  p2.click('[data-cont="satzbaustelle"]');
  check(!!p2.$('.wmap') && p2.errors.length === 0, 'an adventure saved before the Lesestube existed continues');
  // new Deutsch maps have exactly one Lesestube, math maps none
  const p3 = open({ [META]: JSON.stringify(SKIPPED) });
  p3.click('[data-new="woerterwerkstatt"]'); p3.click('#go');
  check(p3.w.__mq.run.map.flat().filter((n) => n.t === 'lesen').length === 1, 'a Wörterwerkstatt map has one Lesestube');
  const p4 = open({ [META]: JSON.stringify(SKIPPED) });
  p4.click('[data-new="math"]'); p4.click('.choice'); p4.click('#go');
  check(!p4.w.__mq.run.map.flat().some((n) => n.t === 'lesen'), 'a Zahlenquest map has no Lesestube');
}
// 22. Step 21: six new Zahlenquest task types; old saves and old heroes keep working, choice tasks run in a fight
{
  const NEW = ['smul', 'teilbar', 'mauer', 'bruch', 'vorrang', 'zahlwort'];
  const p = open({ [META]: JSON.stringify(Object.assign({ runs: 2, stats: { math: { add: { c: 3, t: 4, hist: [1] } } }, off: { math: ['seq'] } }, SKIPPED)) });
  const m = p.w.__mq.meta;
  check(m.stats.math.add.c === 3 && NEW.every((k) => m.stats.math[k] && m.stats.math[k].t === 0 && Array.isArray(m.stats.math[k].hist)) && m.off.math.join() === 'seq', 'old save gets empty statistics for the six new task types and keeps its switches');
  const p2 = open(p.dump()); for (let i = 0; i < 5; i++) p2.click('#logo');
  check(['Schriftlich multiplizieren', 'Teilbarkeit', 'Zahlenmauern', 'Bruchteile', 'Punkt vor Strich', 'Zahlwörter und Stellenwerte'].every((n) => p2.text().includes(n)), 'parent area lists the new task types');
  // a Kröte adventure saved while she still had Nachbarflut (nb) continues; the first attack is Teilbarkeit
  const p3 = startMathFight(); const d = p3.dump(); const r = JSON.parse(d[RUN]);
  r.hero.id = 'kroete'; r.hero.attacks = [{ name: 'Kornsieb', mod: 'teilbar' }, { name: 'Strudelzug', mod: 'sub' }, { name: 'Tiefseerätsel', mod: 'riddle' }, { name: 'Nachbarflut', mod: 'nb' }]; d[RUN] = JSON.stringify(r);
  const p4 = open(d); p4.click('[data-cont="math"]');
  check(p4.text().includes('Nachbarflut') && p4.errors.length === 0, 'an adventure saved with the old Kröte attacks continues');
  // a choice task (Teilbarkeit) as an attack: answered by tapping, counted in the statistics
  if (p4.$('#tutok')) p4.click('#tutok'); p4.click('.atk[data-i="0"]'); if (p4.$('#tutok')) p4.click('#tutok');
  const t = p4.w.__task; const btn = [...p4.d.querySelectorAll('.opt')].find((b) => b.textContent === t.answer);
  check(t.kind === 'choice' && !!btn, 'Teilbarkeit shows answer buttons');
  btn.click();
  check(!!p4.$('.feedback.good') && p4.w.__mq.meta.stats.math.teilbar.c === 1 && p4.errors.length === 0, 'a right Teilbarkeit answer counts');
}
// 21. Lesestube: reading, three questions, reload in the middle keeps text and question number
async function readCases() {
  const p = open({ [META]: JSON.stringify(Object.assign({ seenTut: { 'battle:intro2': true } }, SKIPPED)) });
  p.click('[data-new="satzbaustelle"]'); p.click('#go');
  const r = p.w.__mq.run; const f = r.map.findIndex((fl) => fl.some((n) => n.t === 'lesen'));
  r.floor = f + 1; r.path = r.map.slice(0, f).map(() => 0); if (f > 0) r.map[f - 1][0].n = [r.map[f].findIndex((n) => n.t === 'lesen')];
  p.w.__mq.screenMap();
  p.click([...p.d.querySelectorAll('.node.open')].find((n) => n.getAttribute('aria-label') === 'Lesestube'));
  const text = p.w.eval('TEXTE')[p.w.__mq.run.node.text];
  check(!!p.$('.readcard') && p.text().includes(text.title), 'the Lesestube shows a text first');
  p.click('#next');
  check(p.text().includes('Zeilenspringer') && p.text().includes('Frage 1 von 3'), 'then the reading enemy and question 1');
  const ask = (right) => { p.click('#rq'); if (p.$('#tutok')) p.click('#tutok'); const t = p.w.__task; const i = t.options.indexOf(t.answer); p.click(p.d.querySelectorAll('.opt')[right ? i : (i + 1) % t.options.length]); };
  ask(true);
  check(text.qs[0].q === p.w.__task.q, 'question 1 belongs to the text');
  const p2 = open(p.dump()); p2.click('[data-cont="satzbaustelle"]');
  check(p2.text().includes('Frage 2 von 3') && p2.w.__mq.run.node.text === p.w.__mq.run.node.text, 'reload keeps the text and goes on with question 2');
  p2.click('#rtext'); check(!!p2.$('.overlay .readcard'), 'the text can be read again'); p2.click('.overlay #tutok');
  const q = (right) => { p2.click('#rq'); const t = p2.w.__task; const i = t.options.indexOf(t.answer); p2.click(p2.d.querySelectorAll('.opt')[right ? i : (i + 1) % t.options.length]); p2.click('#next'); };
  const hp = p2.w.__mq.run.hero.hp; q(false); await sleep(1900);
  check(p2.w.__mq.run.hero.hp < hp, 'a wrong answer gives the reading enemy a free hit');
  q(true);
  check(!!p2.$('#next') && !p2.$('#rq'), 'after three questions the reading lesson ends');
  p2.click('#next');
  check(p2.text().includes('2 von 3 Fragen richtig') && p2.w.__mq.run.node.done, 'result shows the right answers, node is done');
  const tries = Object.values(p2.w.__mq.meta.stats.satzbaustelle).reduce((n, s) => n + s.t, 0);
  check(tries === 0, 'reading questions do not change the task statistics');
}
// winning the Kartoffel-Werkstatt opens bed 4 (other modes don't)
async function gardenWinCases() {
  for (const g of ['math', 'kartoffel']) {
    const p = open({ [META]: JSON.stringify({ setup: { done: false, skipped: true, at: 'x' } }) });
    p.click(`[data-new="${g}"]`); p.click('.choice'); p.click('#go');
    p.click([...p.d.querySelectorAll('.node.open')].find((n) => n.getAttribute('aria-label') === 'Kampf') || p.$('.node.open'));
    const r = p.w.__mq.run; r.world = p.w.eval(`MK.MODES.${g} ? MK.MODES.${g}.worlds : 3`); r.floor = 8; r.node.enemy.boss = true; r.node.enemy.hp = 1;
    if (p.$('#tutok')) p.click('#tutok');
    p.click('.atk[data-i="0"]'); if (p.$('#tutok')) p.click('#tutok');
    const t = p.w.__task;
    if (t.kind === 'num') { [...p.d.querySelectorAll('.inp')].forEach((el, i) => { el.click(); for (const ch of String(t.answers[i])) p.click(`.numpad [data-k="${ch}"]`); }); p.click('.numpad [data-k="ok"]'); }
    else if (t.kind === 'choice' || t.kind === 'parts') p.click(p.d.querySelectorAll('.opt')[t.options.indexOf(t.answer)]);
    else if (t.kind === 'parts-find') p.click([...p.d.querySelectorAll('.plant [data-part]')].find((x) => x.dataset.part === t.part));
    else { for (const id of t.order) p.click(`.oitem[data-id="${id}"]`); p.click('#ocheck'); }
    p.click('#next'); await sleep(1600); p.click('#next');
    check(p.text().includes('Sieg') && !!p.w.__mq.meta.owned['beet-4'] === (g === 'kartoffel'), `winning ${g} ${g === 'kartoffel' ? 'opens' : 'does not open'} bed 4`);
    // step 13: Kartoffel fights give wood (3 for the boss), a win across all three worlds of Zahlenquest gives the Dachfenster
    check((p.w.__mq.meta.materials.holz || 0) === (g === 'kartoffel' ? 3 : 0), `winning the boss fight in ${g} gives ${g === 'kartoffel' ? '3' : 'no'} wood`);
    check(!!p.w.__mq.meta.owned['hut-dachfenster'] === (g === 'math') && p.text().includes('Dachfenster') === (g === 'math'), `winning ${g} ${g === 'math' ? 'gives' : 'does not give'} the Dachfenster`);
  }
}

// 16. Sachkunde units: an old save gains their stats; reopening in the Forscherlabor or on the Schatzkarte keeps the state
{
  const p0 = open(); const old = JSON.parse(JSON.stringify(p0.w.__mq.meta)); for (const m of ['kornkammer', 'wetterstation', 'kompass']) delete old.stats[m];
  const p1 = open({ [META]: JSON.stringify(old) }); if (p1.$('#later')) p1.click('#later');
  check(p1.errors.length === 0 && ['kornkammer', 'wetterstation', 'kompass'].every((m) => p1.w.__mq.meta.stats[m] && Object.values(p1.w.__mq.meta.stats[m]).every((s) => s.t === 0)), 'old save without Sachkunde stats loads with empty stats');
  // enter a node of the given type from the first floor of a new adventure
  const enter = (p, mode, type) => { p.click(`[data-new="${mode}"]`); const y = p.$('.overlay #yes'); if (y) y.click(); p.click('.choice'); p.click('#go'); p.w.__mq.run.map[0][0].t = type; p.w.__mq.screenMap(); p.click('.node.open'); const ok = p.$('.overlay #tutok'); if (ok) ok.click(); };
  enter(p1, 'wetterstation', 'labor');
  p1.click('.opt.guess'); p1.click('#next');
  const q2 = p1.$('.labor h3').textContent;
  const p2 = open(p1.dump()); p2.click('[data-cont="wetterstation"]');
  check(p2.errors.length === 0 && p2.text().includes('Versuch 2 von 5') && p2.$('.labor h3').textContent === q2, 'reopening the Forscherlabor continues with the same experiment');
  for (let i = 0; i < 4; i++) { p2.click('.opt.guess'); p2.click('#next'); }
  check(p2.text().includes('Notizkarte') && p2.w.__mq.run.node.done === true, 'after five experiments the Forscherlabor shows the note card and is done');
  const p3 = open(p2.dump()); enter(p3, 'kompass', 'karte');
  const t = p3.w.__task; const wrong = [...p3.d.querySelectorAll('[data-cell]')].find((c) => c.dataset.cell !== t.target.join('-'));
  wrong.dispatchEvent(new p3.w.MouseEvent('click', { bubbles: true }));
  const p4 = open(p3.dump()); p4.click('[data-cont="kompass"]'); const ok4 = p4.$('.overlay #tutok'); if (ok4) ok4.click();
  check(p4.errors.length === 0 && p4.text().includes('Versuch 2 von 2') && !!p4.$('[data-cell]'), 'a wrong tap on the Schatzkarte stays counted after reopening');
  const t4 = p4.w.__task; p4.$(`[data-cell="${t4.target.join('-')}"]`).dispatchEvent(new p4.w.MouseEvent('click', { bubbles: true }));
  const p5 = open(p4.dump()); p5.click('[data-cont="kompass"]');
  check(p5.errors.length === 0 && p5.text().includes('Truhe'), 'a found treasure opens the chest after reopening');
}
// 17. Kirchenjahr Teil 2 and Gute Freunde: an old save without Gute Freunde stats loads, a Kirchenjahr adventure
// started in world 1 continues in world 1, and Gute Freunde adventures are saved
{
  const p0 = open(); const old = JSON.parse(JSON.stringify(p0.w.__mq.meta)); delete old.stats.freunde;
  const p1 = open({ [META]: JSON.stringify(old) }); if (p1.$('#later')) p1.click('#later');
  check(p1.errors.length === 0 && p1.w.__mq.meta.stats.freunde && p1.w.__mq.meta.stats.freunde.def.t === 0, 'old save without Gute Freunde stats loads with empty stats');
  p1.click('[data-new="kirchenjahr"]'); p1.click('.choice'); p1.click('#go'); p1.click('.node.open');
  const saved = p1.dump(); const r = JSON.parse(saved.mathquest_run_kirchenjahr); r.node = null; saved.mathquest_run_kirchenjahr = JSON.stringify(r);
  check(r.world === 1, 'Kirchenjahr adventure starts in world 1');
  const p2 = open(saved);
  check(/Weiter \(Welt 1\)/.test(p2.$('[data-cont="kirchenjahr"]').textContent), 'title shows the world of a running Kirchenjahr adventure');
  p2.click('[data-cont="kirchenjahr"]');
  check(p2.errors.length === 0 && p2.w.__mq.run.world === 1 && !!p2.$('.node.open'), 'Kirchenjahr adventure from world 1 continues on the map');
}
{
  const p1 = open(); if (p1.$('#later')) p1.click('#later');
  p1.click('[data-new="freunde"]'); p1.click('.choice'); p1.click('#go'); p1.click('.node.open');
  const p2 = open(p1.dump());
  check(p2.errors.length === 0 && !!p2.dump().mathquest_run_freunde && !!p2.$('[data-cont="freunde"]'), 'Gute Freunde adventure is saved and can be continued');
}

// 18. Weekly goals, weekly boss, weekly report
// weeks whose maths goal is in Zahlenquest (the seed also picks Die Baustelle): W48 the weekly boss, W49 right answers
const W48 = '2026-12-23T10:00:00', W49 = '2027-01-27T10:00:00';
async function weeklyCases() {
  { // same week key → same goals on two devices; one goal per subject, only enabled task types
    const a = open(null, { now: W49 }), b = open(null, { now: W49 });
    const ga = a.w.__mq.weeklyGoals(), gb = b.w.__mq.weeklyGoals();
    check(ga.length === 4 && same(ga, gb), 'two devices show the same goals in the same week');
    check(same(ga.map((g) => g.subject), ['Mathe', 'Deutsch', 'Ethik', 'Sachkunde']), 'one goal per subject of the grade');
    check(ga.every((g) => (g.kind === 'right' ? g.n >= 15 && g.n <= 25 : g.kind === 'elite' ? g.n >= 2 && g.n <= 3 : g.n === 1)), 'goal sizes: 15–25 right answers, 2–3 elites, one win or weekly boss');
    check(ga[0].kind === 'right' && ga[0].m === 'math', 'this week has a right-answers goal in maths');
    const c = open(null, { now: '2027-02-03T10:00:00' });
    check(!same(c.w.__mq.weeklyGoals(), ga), 'another week has other goals');
    const off = open({ [META]: JSON.stringify({ setup: { done: false, skipped: true, at: 'x' }, off: { math: [ga[0].mod] } }) }, { now: W49 });
    const go = off.w.__mq.weeklyGoals();
    check(go[0].kind === 'right' && go[0].mod !== ga[0].mod && !off.w.__mq.meta.off.math.includes(go[0].mod) && same(go.slice(1), ga.slice(1)), 'a switched-off task type is never a goal, the other goals stay');
  }
  { // title card, goal screen
    const p = open(null, { now: W49 }); p.click('#later');
    check(!!p.$('#weekly') && p.$('#weekly').textContent.includes('Diese Woche') && p.$('#weekly').textContent.includes('Neue Aufgaben am Montag') && !!p.$('#weekly .bar'), 'title shows the card "Diese Woche" with a bar');
    p.click('#weekly');
    check(p.text().includes('Wochenaufgabe') && p.d.querySelectorAll('.goal').length === 4 && p.text().includes('0 von') && p.text().includes('Nichts geht verloren, wenn du eine Woche aussetzt.'), 'goal screen lists one goal per subject with whole-number progress');
  }
  { // right answers count for the goal of their task type; all three goals → 10 stamps, gold week, one card
    const p0 = startMathFight({ now: W49 }); const g = p0.w.__mq.weeklyGoals()[0];
    const d = p0.dump(); const r = JSON.parse(d[RUN]); r.hero.attacks[0].mod = g.mod; d[RUN] = JSON.stringify(r);
    const p = open(d, { now: W49 }); p.click('[data-cont="math"]');
    const m = p.w.__mq.meta; p.w.__mq.run.node.enemy.hp = 9999; // the fight must outlast three answers
    answer(p, true);
    check(m.weekly.week === '2027-W04' && m.weekly.progress[0] === 1 && same(m.weekly.tally['math:' + g.mod], { c: 1, t: 1 }), 'a right answer of the goal type counts');
    p.click('#next'); await sleep(2200); answer(p, false);
    check(m.weekly.progress[0] === 1 && same(m.weekly.tally['math:' + g.mod], { c: 1, t: 2 }), 'a wrong answer counts for the report only');
    p.click('#next'); await sleep(2200);
    const goals = p.w.__mq.weeklyGoals(); m.weekly.progress = goals.map((x, i) => (i ? x.n : x.n - 1)); const st = m.stamps;
    answer(p, true);
    check(m.weekly.done && m.stampCard['2027-W04'] === 2 && m.stamps === st + 10 && m.stampsTotal >= 10 && !!m.progressAt, 'all goals: gold week on the stamp card, 10 stamps, progress date');
    p.w.__mq.screenMap();
    check(!!p.$('.overlay') && p.$('.overlay').textContent.includes('Wochenaufgabe geschafft') && p.$('.overlay').textContent.includes('+10'), 'a short card "Wochenaufgabe geschafft" shows once');
    p.click('.overlay #tutok'); p.w.__mq.screenMap();
    check(!p.$('.overlay'), 'the card does not come back');
    const p2 = open(p.dump(), { now: W49 });
    check(p2.w.__mq.meta.weekly.done && p2.$('#weekly').textContent.includes('Wochenaufgabe geschafft'), 'a finished week is saved and shown on the title');
    p2.click('#parents');
    check(p2.text().includes('Wochenbericht') && p2.text().includes(p2.w.eval('MQ.MODULES')[g.mod].name) && p2.text().includes('2 / 3') && p2.text().includes('Wochenziele: 4 von 4 erledigt'), 'parent area shows the weekly report');
    const lines = p2.$('#wtext').value.split('\n');
    check(lines.length >= 3 && lines.length <= 5 && lines[0] === 'Lernquest, Woche 4' && lines.some((l) => l.startsWith('Geübt')) && !/Steinkauz|Moosbär/.test(p2.$('#wtext').value), 'report text has three to five lines and no names: ' + JSON.stringify(lines));
    p2.click('#wcopy');
    check(p2.$('#wmsg').textContent.includes('markiert') && p2.d.activeElement === p2.$('#wtext'), 'without clipboard the report text is marked for copying');
    // next week: fresh goals, nothing taken away
    const p3 = open(p2.dump(), { now: '2027-02-03T10:00:00' }); const m3 = p3.w.__mq.meta;
    check(m3.weekly.week === '2027-W05' && m3.weekly.progress.length === 0 && !m3.weekly.done && same(m3.weekly.tally, {}) && m3.stampCard['2027-W04'] === 2 && m3.stamps === p2.w.__mq.meta.stamps, 'a new week starts fresh and takes nothing away');
  }
  { // weekly boss: a node on floor 5 or 6 once per adventure, 25 % more HP, fixed weak spot, elite reward, counts for the goal
    let p, r;
    for (let i = 0; i < 6 && !(r && r.wb); i++) { p = startMathFight({ now: W48 }); r = p.w.__mq.run; }
    const at = []; r.map.forEach((fl, f) => fl.forEach((n, i) => { if (n.t === 'weekboss') at.push([f, i]); }));
    check(at.length === 1 && (at[0][0] === 4 || at[0][0] === 5), 'the weekly boss is one node on floor 5 or 6');
    const [f, i] = at[0]; r.floor = f + 1; r.path[f - 1] = 0; r.map[f - 1][0].n = [i]; r.node = null; p.w.__mq.screenMap();
    p.click('.node.open.weekboss');
    const e = r.node.enemy; const base = p.w.eval('MQ.ENEMIES[1].normal').find((x) => e.name === x.name + ' der Woche');
    check(!!base && p.text().includes('Wochenboss') && e.weekboss && e.elite && e.maxHp === Math.round(Math.round(base.hp * 1.25) * (1.4 * (1 + f * 0.03))), 'weekly boss: enemy of the world with "der Woche" and 25 % more HP (' + e.name + ')');
    check(!!p.w.__mq.meta.dex[base.name] && !p.w.__mq.meta.dex[e.name], 'the Monsterbuch gets the normal name');
    const q = open(null, { now: W48 }); q.click('#later'); q.click('[data-new="math"]'); q.click('.choice'); q.click('#go');
    const qr = q.w.__mq.run; qr.floor = f + 1; qr.path[f - 1] = 0; qr.map[f - 1][0].n = [0]; qr.map[f][0].t = 'weekboss'; qr.hero.attacks = JSON.parse(JSON.stringify(r.hero.attacks)); q.w.__mq.screenMap(); q.click('.node.open.weekboss');
    check(qr.node.enemy.name === e.name && qr.node.enemy.weak === e.weak, 'another device meets the same weekly boss with the same weak spot');
    const weak = e.weak; e.hp = 9999; answer(p, true, '.atk.weak');
    check(e.weak === weak, 'the weak spot of the weekly boss stays');
    p.click('#next'); await sleep(2200); e.hp = 1; answer(p, true); p.click('#next'); await sleep(1700);
    const m = p.w.__mq.meta;
    check(p.text().includes('besiegt') && p.text().includes('+35 XP') && !!p.$('#next') && p.$('#next').textContent.includes('Beute'), 'the beaten weekly boss pays like an elite');
    check(m.weekly.beaten.includes('math') && m.weekly.progress[0] === 1 && p.w.__mq.weeklyGoals()[0].kind === 'boss', 'beating it counts for the weekly-boss goal');
    p.click('#next');
    check(p.text().includes('Der Wochenboss hat etwas dagelassen'), 'then the reward is picked');
    const p2 = open(p.dump(), { now: W48 }); p2.click('[data-new="math"]'); p2.click('.overlay #yes'); p2.click('.choice'); p2.click('#go');
    check(!p2.w.__mq.run.map.some((fl) => fl.some((n) => n.t === 'weekboss')), 'once beaten, the weekly boss does not come back this week');
  }
  { // old saves and broken weekly data load with defaults; merging keeps the best of the week
    const o = open({ [META]: JSON.stringify({ runs: 2, setup: { done: false, skipped: true, at: 'x' } }) }, { now: W49 });
    check(o.errors.length === 0 && o.w.__mq.meta.weekly.week === '2027-W04' && same(o.w.__mq.meta.weekly.progress, []) && !!o.$('#weekly'), 'old save without weekly data loads with defaults');
    const b = open({ [META]: JSON.stringify({ setup: { done: false, skipped: true, at: 'x' }, weekly: { week: 5, progress: ['x', 3.7, -2], done: 'ja', beaten: [1, 'math'], tally: { 'math:add': { c: 1, t: 2 }, bad: 7 } } }) }, { now: W49 });
    const bw = b.w.__mq.meta.weekly;
    check(b.errors.length === 0 && bw.week === '2027-W04' && bw.done === false, 'wrong-typed weekly data falls back to defaults');
    const raw = open().w.__mq.meta; raw.weekly = { week: '2027-W04', progress: ['x', 3.7, -2], done: false, beaten: [1, 'math'], tally: { 'math:add': { c: 1, t: 2 }, bad: 7 } };
    const n = open({ [META]: JSON.stringify(raw) }, { now: W49 }).w.__mq.meta.weekly;
    check(same(n.progress, [0, 3, 0]) && same(n.beaten, ['math']) && same(n.tally, { 'math:add': { c: 1, t: 2 } }), 'weekly fields are cleaned up when loading');
    const base = open().w.__mq.meta; const mk = (wk) => Object.assign(JSON.parse(JSON.stringify(base)), { weekly: wk });
    const wa = { week: '2027-W04', progress: [3, 0, 1], done: false, beaten: [], tally: { 'math:add': { c: 2, t: 3 } } };
    const wb = { week: '2027-W04', progress: [1, 2], done: false, beaten: ['ethik'], tally: { 'math:add': { c: 1, t: 1 }, 'ethik:rf': { c: 1, t: 1 } } };
    const mw = open().w.__mq.mergeMeta(mk(wa), mk(wb)).weekly;
    check(same(mw.progress, [3, 2, 1]) && same(mw.beaten, ['ethik']) && same(mw.tally, { 'math:add': { c: 3, t: 4 }, 'ethik:rf': { c: 1, t: 1 } }), 'merge: same week keeps the higher progress and adds the answers');
    check(open().w.__mq.mergeMeta(mk(Object.assign({}, wa, { week: '2026-W48' })), mk(wb)).weekly.week === '2027-W04', 'merge: the newer week wins');
  }
}
// 22. Materials and owned things: defaults, damaged values, the Bergwerk fills them and survives a reload
{
  const p0 = open({ [META]: JSON.stringify({ runs: 2, wins: 0 }) });
  check(JSON.stringify(p0.w.__mq.meta.materials) === '{}' && JSON.stringify(p0.w.__mq.meta.owned) === '{}', 'old save gets empty materials and owned');
  for (const bad of [[], 'x', 7]) {
    const p = open({ [META]: JSON.stringify({ materials: bad, owned: bad }) });
    check(JSON.stringify(p.w.__mq.meta.materials) === '{}' && JSON.stringify(p.w.__mq.meta.owned) === '{}' && p.errors.length === 0, 'wrong-typed materials/owned fall back to {} (' + JSON.stringify(bad) + ')');
  }
  const p1 = open({ [META]: JSON.stringify({ materials: { erz: 'viel', stein: 4, holz: -1, ernte: 2.5 }, owned: { 'map-w1-winter': true } }) });
  check(JSON.stringify(p1.w.__mq.meta.materials) === '{"stein":4}' && p1.w.__mq.meta.owned['map-w1-winter'] === true, 'only whole, non-negative amounts are kept');

  const p = open(); p.click('#later'); p.click('[data-new="math"]'); p.click('.choice'); p.click('#go');
  const r = p.w.__mq.run; r.map[0][0].t = 'bergwerk'; p.w.__mq.screenMap();
  p.click([...p.d.querySelectorAll('.node.open')].find((n) => n.getAttribute('aria-label') === 'Bergwerk'));
  check(p.d.querySelectorAll('.mblock.covered:not([disabled])').length === 12, 'Bergwerk shows 12 covered blocks');
  const real = p.w.Math.random; let first = true; p.w.Math.random = () => (first ? (first = false, 0.1) : real());
  p.click('.mblock[data-i="5"]'); p.w.Math.random = real;
  if (p.$('#tutok')) p.click('#tutok');
  const asked = p.$('.expr').textContent;
  const p2 = open(p.dump()); p2.click('[data-cont="math"]'); if (p2.$('#tutok')) p2.click('#tutok');
  check(p2.$('.expr') && p2.$('.expr').textContent === asked, 'reopening inside the Bergwerk shows the same block task (' + asked + ')');
  const solve = (q, right) => { const ans = q.w.__task.answers.map((a) => (right ? a : a + 1)); const inps = [...q.d.querySelectorAll('.inp')];
    ans.forEach((a, i) => { inps[i].click(); for (const ch of String(a)) q.click(`.numpad [data-k="${ch}"]`); }); q.click('.numpad [data-k="ok"]'); };
  solve(p2, true);
  const m = p2.w.__mq.meta;
  check(m.materials.erz === 1 && m.owned['top-disc-eisen'] === true && p2.w.__mq.run.node.mine.cells[5] === 'erz', 'remainder 0 gives ore, the first ore unlocks the iron disc');
  check(m.stats.math.rest.t === 1 && m.stats.math.rest.c === 1, 'Bergwerk answers count as division with remainder');
  check(!!m.progressAt, 'a find in the Bergwerk counts as progress for the backup reminder');
  p2.click('#next');
  check(p2.d.querySelectorAll('.mblock.covered:not([disabled])').length === 11 && p2.text().includes('Noch 2 Blöcke'), 'back at the mine: one block open, two to go');
  p2.click('.mblock.covered'); if (p2.$('#tutok')) p2.click('#tutok'); solve(p2, false); p2.click('#next');
  check(p2.w.__mq.run.node.mine.got[1] === 'leer' && (m.materials.stein || 0) + m.materials.erz === 1, 'a wrong answer crumbles the block, nothing is added');
  p2.click('.mblock.covered'); solve(p2, true); p2.click('#next');
  const total = (m.materials.stein || 0) + m.materials.erz;
  check(total === 2 && !p2.$('.mblock.covered:not([disabled])') && p2.text().includes('Ausbeute') && p2.text().includes('Eisenscheibe'), 'after three blocks the haul is shown');
  const p3 = open(p2.dump()); p3.click('[data-cont="math"]');
  check(!!p3.$('#next') && p3.text().includes('Ausbeute'), 'reopening after the third block shows the haul, no extra blocks');
  p3.click('#next');
  const m3 = p3.w.__mq.meta;
  check(p3.w.__mq.run.floor === 2 && !!p3.$('.wmap') && m3.materials.erz + (m3.materials.stein || 0) === 2 && m3.owned['top-disc-eisen'] === true, 'leaving the Bergwerk keeps the materials');

  let mines = 0, maps = 0;
  for (let i = 0; i < 30; i++) { const q = open(p3.dump()); q.click('[data-new="math"]'); q.click('.overlay #yes'); q.click('.choice'); q.click('#go'); const fl = q.w.__mq.run.map.flat(); maps++; mines += fl.filter((n) => n.t === 'bergwerk').length; if (fl.filter((n) => n.t === 'bergwerk').length > 1) check(false, 'at most one Bergwerk per world'); }
  check(mines >= 20 && mines <= maps, 'about one Bergwerk per world map (' + mines + ' in ' + maps + ')');
  const off = open({ [META]: JSON.stringify({ setup: { skipped: true }, off: { math: ['rest'] } }) });
  let any = 0; for (let i = 0; i < 10; i++) { off.click('[data-new="math"]'); if (off.$('.overlay #yes')) off.click('.overlay #yes'); off.click('.choice'); off.click('#go'); any += off.w.__mq.run.map.flat().filter((n) => n.t === 'bergwerk').length; off.w.__mq.screenTitle(); }
  check(any === 0, 'no Bergwerk when division with remainder is switched off');
}

// 23. Die Baustelle: new unit on the title, adventure starts, stats exist for old saves
{
  const p = open({ [META]: JSON.stringify({ setup: { skipped: true }, stats: { math: {} } }) });
  check(!!p.$('[data-new="bau"]') && p.text().includes('Die Baustelle'), 'title lists Die Baustelle under Mathe');
  const st = p.w.__mq.meta.stats.bau;
  check(['wz', 'fq', 'netz', 'koerper', 'band', 'lage', 'umfang', 'flaeche', 'spiegel', 'bewegung', 'vieleck'].every((k) => st[k] && st[k].t === 0), 'old save gains stats for the Baustelle');
  p.click('[data-new="bau"]'); p.click('#go');
  p.click([...p.d.querySelectorAll('.node.open')][0]);
  const saved = p.dump();
  check(!!saved.mathquest_run_bau, 'Baustelle adventure is saved under its own key');
  const p2 = open(saved);
  check(!!p2.$('[data-cont="bau"]') && !!p2.$('[data-new="math"]') && !p2.$('[data-cont="math"]'), 'Baustelle adventure does not touch Zahlenquest');
  p2.click('[data-cont="bau"]');
  check(!!p2.$('#fe') && p2.errors.length === 0, 'Baustelle fight continues after reopening');
}

// 23b. Saves from before step 22: Baustelle and Jahrmarkt stats without the new task types, a running adventure with old tiers
{
  const oldBau = { wz: { c: 5, t: 6, hist: [] }, netz: { c: 2, t: 3, hist: [] }, umfang: { c: 1, t: 1, hist: [] } }, oldJm = { uhr: { c: 4, t: 4, hist: [] }, tafel: { c: 1, t: 2, hist: [] } };
  const run = { mode: 'bau', world: 2, floor: 2, map: JSON.parse(open().w.eval('JSON.stringify(MQ.makeMap(2))')), hero: { id: 'biber', evo: 1, level: 4, xp: 0, hp: 60, maxHp: 90, attacks: [{ name: 'Mauerlücke', mod: 'fq' }, { name: 'Faltkarton', mod: 'netz' }, { name: 'Fliesenband', mod: 'band' }, { name: 'Zollstock', mod: 'umfang' }] }, items: [], tiers: { netz: 1, umfang: 2 }, path: [0], shield: false };
  const p = open({ [META]: JSON.stringify({ setup: { skipped: true }, stats: { bau: oldBau, jahrmarkt: oldJm } }), mathquest_run_bau: JSON.stringify(run) });
  const m = p.w.__mq.meta;
  check(m.stats.bau.wz.c === 5 && m.stats.bau.netz.t === 3 && ['flaeche', 'spiegel', 'bewegung', 'vieleck'].every((k) => m.stats.bau[k].t === 0) && m.stats.jahrmarkt.uhr.c === 4 && m.stats.jahrmarkt.fahrplan.t === 0, 'old stats are kept and the new task types start empty');
  p.click('[data-cont="bau"]'); p.click([...p.d.querySelectorAll('.node.open')][0]);
  check(p.errors.length === 0 && p.w.__mq.run.tiers.netz === 1, 'old Baustelle adventure continues with its tiers');
}

// 24. A save from before the Jahrmarkt unit loads; a Jahrmarkt adventure continues mid-fight after reopening
{
  const p0 = open(); const old = JSON.parse(JSON.stringify(p0.w.__mq.meta)); delete old.stats.jahrmarkt;
  const p1 = open({ [META]: JSON.stringify(old) }); if (p1.$('#later')) p1.click('#later');
  check(p1.errors.length === 0 && p1.w.__mq.meta.stats.jahrmarkt && p1.w.__mq.meta.stats.jahrmarkt.uhr.t === 0, 'old save without Jahrmarkt stats loads with empty stats');
  p1.click('[data-new="jahrmarkt"]'); p1.click('.choice'); p1.click('#go'); p1.click('.node.open');
  const p2 = open(p1.dump());
  check(!!p2.dump().mathquest_run_jahrmarkt && !!p2.$('[data-cont="jahrmarkt"]'), 'Jahrmarkt adventure is saved and can be continued');
  p2.click('[data-cont="jahrmarkt"]');
  check(!!p2.$('#fe') && p2.errors.length === 0, 'Jahrmarkt fight resumes after reopening');
}
// 26. Werkbank, pantry and Meine Hütte (step 13)
{
  const p0 = open({ [META]: JSON.stringify({ runs: 4, wins: 1, stamps: 3, setup: { skipped: true } }) }); const m0 = p0.w.__mq.meta;
  check(Array.isArray(m0.pantry) && m0.pantry.length === 0 && m0.hut.rooms === 1 && m0.hut.items.length === 0 && m0.stamps === 3, 'old save without pantry and hut loads with an empty pantry and one room');
  for (const bad of [{ pantry: 'trank', hut: [] }, { pantry: ['trank', 'gold', 7, 'schild', 'keks', 'trank'], hut: { rooms: 'zwei', items: 'bett' } }, { pantry: null, hut: { rooms: 9, items: ['hut-bett', 3] } }]) {
    const m = open({ [META]: JSON.stringify(bad) }).w.__mq.meta;
    check(m.pantry.every((it) => ['trank', 'schild', 'keks'].includes(it)) && m.pantry.length <= 3 && [1, 2].includes(m.hut.rooms) && m.hut.items.every((x) => typeof x === 'string'), 'damaged pantry/hut values are cleaned (' + JSON.stringify(bad) + ')');
  }
  check(JSON.stringify(open({ [META]: JSON.stringify({ pantry: ['trank', 'gold', 'schild', 'keks', 'trank'], hut: { rooms: 9, items: ['hut-bett', 3] } }) }).w.__mq.meta.pantry) === '["trank","schild","keks"]', 'unknown items are dropped, the pantry keeps at most three');

  // every recipe asks a · b with the numbers in its text, and costs only known materials
  const R = p0.w.__mq.RECIPES;
  check(R.length === 9 && R.filter((r) => r.id.startsWith('hut-')).length === 5 && R.every((r) => { const q = r.q(4, 7); return q.includes('4') && q.includes('7') && q.endsWith('?') && Object.keys(r.need).every((k) => ['holz', 'stein', 'erz', 'kartoffel', 'weizen', 'roggen', 'hafer'].includes(k)); }), 'nine recipes (four items, five pieces of furniture) with both numbers in the question');

  const crafted = (p, right) => { const t = p.w.__task; check(t.answers[0] === (() => { const n = p.$('.story').textContent.match(/\d+/g).map(Number); return n[0] * n[1]; })(), 'the answer is the product of the two numbers in the text'); p.$('.inp').click(); for (const ch of String(t.answers[0] + (right ? 0 : 1))) p.click(`.numpad [data-k="${ch}"]`); p.click('.numpad [data-k="ok"]'); p.click('#next'); };
  const p = open({ [META]: JSON.stringify({ setup: { skipped: true }, materials: { holz: 3, erz: 1, hafer: 1 } }) }); const m = p.w.__mq.meta;
  p.click('#stamps');
  check(p.text().includes('Werkbank') && p.text().includes('Im Lager: 3 Holz, 1 Erz und 1 Hafer') && p.text().includes('Im Vorrat: 0 von 3'), 'the Werkbank in the Stempelheft shows the stock and the pantry');
  check(!p.$('[data-craft="schild"]').disabled && !p.$('[data-craft="trank"]').disabled && p.$('[data-craft="grosstrank"]').disabled && p.$('[data-craft="hut-bett"]').disabled && p.text().includes('Es fehlt: 2 Holz, 2 Roggen'), 'only recipes with enough materials can be built; missing ones are named');
  p.click('[data-craft="schild"]');
  check(!!p.$('.story') && p.$('.story').textContent.includes('Nägel'), 'building asks a word problem first');
  crafted(p, false);
  check(m.materials.holz === 3 && m.materials.erz === 1 && m.pantry.length === 0 && p.text().includes('Nicht gebaut') && m.stats.math.mul.t === 1 && m.stats.math.mul.c === 0, 'a wrong answer builds nothing and uses no materials');
  p.click('#next'); p.click('[data-craft="schild"]'); crafted(p, true);
  check(m.materials.holz === 1 && m.materials.erz === 0 && JSON.stringify(m.pantry) === '["schild"]' && p.text().includes('Gebaut: Schild') && m.stats.math.mul.c === 1 && !!m.progressAt, 'a right answer uses 2 Holz and 1 Erz and puts the Schild into the pantry');
  const p2 = open(p.dump()); const m2 = p2.w.__mq.meta;
  check(JSON.stringify(m2.pantry) === '["schild"]' && m2.materials.holz === 1, 'pantry and materials survive a reload');
  check(p2.w.__mq.craft(R.find((r) => r.id === 'schild')) === false && JSON.stringify(m2.pantry) === '["schild"]' && m2.materials.holz === 1, 'nothing is built when materials are missing');
  m2.materials = { holz: 20, hafer: 20, kartoffel: 5, roggen: 5, erz: 5, stein: 5 };
  check(['trank', 'keks'].every((id) => p2.w.__mq.craft(R.find((r) => r.id === id))) && p2.w.__mq.craft(R.find((r) => r.id === 'trank')) === false && m2.pantry.length === 3 && m2.materials.hafer === 19, 'the pantry holds three things, a fourth is not built');
  p2.click('#stamps'); check(p2.$('[data-craft="trank"]').disabled && p2.text().includes('Der Vorrat ist voll.'), 'a full pantry is shown');
  check(p2.w.__mq.craft(R.find((r) => r.id === 'hut-tisch')) && m2.owned['hut-tisch'] && m2.materials.holz === 14 && m2.materials.kartoffel === 4 && p2.w.__mq.craft(R.find((r) => r.id === 'hut-tisch')) === false, 'furniture is built once and lands in owned');

  // the pantry goes into the next adventure (after the starting Trank) and is emptied
  p2.w.__mq.screenTitle(); p2.click('[data-new="math"]');
  check(p2.text().includes('Aus deinem Vorrat kommt mit: 🛡️ Schild, 🧪 Trank, 🌶️ Chilischote'), 'hero selection shows what comes from the pantry');
  p2.click('.choice[data-id]'); p2.click('#go');
  // (a recommended hero or a swapped attack adds a Fleißbienchen behind)
  check(JSON.stringify(p2.w.__mq.run.items.slice(0, 4)) === '["trank","schild","trank","keks"]' && p2.w.__mq.run.items.slice(4).every((x) => x === 'stern') && m2.pantry.length === 0, 'the pantry is added to run.items and emptied');
  const p3 = open(p2.dump());
  check(p3.w.__mq.meta.pantry.length === 0 && JSON.parse(p3.dump()[RUN]).items.length === p2.w.__mq.run.items.length, 'after a reload the pantry stays empty and the adventure keeps the items');
}
{ // the hut: renders from an old save, furniture, shelf numbers, second room, moving furniture
  const p = open({ [META]: JSON.stringify({ runs: 1, setup: { skipped: true } }) });
  p.click('#hut');
  check(!!p.$('svg.hutroom') && p.d.querySelectorAll('svg.hutroom').length === 1 && p.text().includes('Noch ist deine Hütte leer') && p.$('svg.hutroom').getAttribute('aria-label') === 'Das Zimmer ist leer' && p.errors.length === 0, 'the hut opens from an old save without hut field');
  p.click('#garden'); check(p.text().includes('Beete wachsen'), 'the hut has a button to the Schulgarten');
  const p2 = open({ [META]: JSON.stringify({ setup: { skipped: true }, stamps: 31, materials: { stein: 11 }, dex: { A: {}, B: {} }, know: { q1: { c: 1, t: 1 } }, owned: { 'hut-regal': true, 'hut-bett': true, 'top-disc-eisen': true, 'map-w1-winter': true } }) }); const m = p2.w.__mq.meta;
  p2.click('#hut');
  check(p2.$('svg.hutroom').getAttribute('aria-label') === 'Im Zimmer: Regal mit Monsterbuch, Bett' && p2.text().includes('Im Regal: 2 im Monsterbuch, 1 Kreiselteile, 1 Notizkarten'), 'built furniture stands in the hut, the shelf counts Monsterbuch, Kreisel parts and note cards');
  check(!p2.$('[data-move]') && p2.text().includes('30 Stempel und 12 Stein'), 'one room: nothing to move, the second room is offered');
  p2.click('#bench'); check(!!p2.$('#werkbank'), 'the hut leads to the Werkbank');
  check(p2.$('[data-buy="hut-zimmer2"]').disabled && p2.text().includes('Holen · 30 🏷️ + 12 Stein') && p2.text().includes('Dachfenster'), 'the Stempelheft lists the hut rewards; 11 stone are not enough');
  m.materials.stein = 12; p2.click('#back'); p2.click('#stamps'); p2.click('[data-buy="hut-zimmer2"]');
  check(p2.$('.overlay').textContent.includes('30 Stempel und 12 Stein'), 'the purchase names stamps and stone');
  p2.click('.overlay #yes');
  check(m.hut.rooms === 2 && m.stamps === 1 && m.materials.stein === 0 && !m.owned['hut-zimmer2'] && !p2.$('[data-buy="hut-zimmer2"]'), 'buying the second room takes 30 stamps and 12 stone');
  p2.click('#back'); p2.click('#hut');
  check(p2.d.querySelectorAll('svg.hutroom').length === 2 && p2.d.querySelectorAll('[data-move]').length === 2, 'two rooms, both pieces can be moved');
  p2.click('[data-move="hut-bett"]');
  const rooms = p2.d.querySelectorAll('svg.hutroom');
  check(JSON.stringify(m.hut.items) === '["hut-bett"]' && rooms[1].getAttribute('aria-label') === 'Im Zimmer: Bett' && rooms[0].getAttribute('aria-label') === 'Im Zimmer: Regal mit Monsterbuch', 'the bed moves into the second room');
  const p3 = open(p2.dump()); p3.click('#hut');
  check(p3.w.__mq.meta.hut.rooms === 2 && p3.d.querySelectorAll('svg.hutroom')[1].getAttribute('aria-label') === 'Im Zimmer: Bett', 'rooms and furniture places survive a reload');
  p3.click('[data-move="hut-bett"]'); check(p3.w.__mq.meta.hut.items.length === 0, 'and it can move back');
  // merging: more rooms win, moved furniture is united, the fuller pantry wins
  const inc = open({ [META]: JSON.stringify({ hut: { rooms: 2, items: ['hut-tisch'] }, pantry: ['trank', 'schild'] }) }).w.__mq.meta;
  const dev = open({ [META]: JSON.stringify({ hut: { rooms: 1, items: ['hut-bett'] }, pantry: ['keks'] }) });
  const mm = dev.w.__mq.mergeMeta(dev.w.__mq.meta, JSON.parse(JSON.stringify(inc)));
  check(mm.hut.rooms === 2 && JSON.stringify(mm.hut.items) === '["hut-bett","hut-tisch"]' && JSON.stringify(mm.pantry) === '["trank","schild"]', 'merging keeps more rooms, unites moved furniture and takes the fuller pantry');
  const mm2 = dev.w.__mq.mergeMeta(JSON.parse(JSON.stringify(inc)), dev.w.__mq.meta);
  check(mm2.hut.rooms === 2 && JSON.stringify(mm2.pantry) === '["trank","schild"]', 'the device keeps its fuller pantry');
}
{ // Der Holzplatz: wood for a right answer; the event list only grows at the end
  const p = startMathFight(); const EV = p.w.eval('MQ.EVENTS'); const i = EV.length - 1;
  check(EV[i].title === 'Der Holzplatz' && EV[0].title === 'Die Brücke', 'Der Holzplatz is appended to the Zahlenquest events');
  const saved = p.dump(); const run = JSON.parse(saved[RUN]); run.node = { type: 'event', ev: i }; saved[RUN] = JSON.stringify(run);
  const p2 = open(saved); p2.click('[data-cont="math"]');
  check(p2.text().includes('Der Holzplatz') && p2.text().includes('Werkbank'), 'the Holzplatz event opens');
  p2.click('.bottom .btn[data-i="0"]'); if (p2.$('#tutok')) p2.click('#tutok');
  const t = p2.w.__task; p2.$('.inp').click(); for (const ch of String(t.answers[0])) p2.click(`.numpad [data-k="${ch}"]`); p2.click('.numpad [data-k="ok"]');
  check(p2.w.__mq.meta.materials.holz === 2, 'a right answer at the Holzplatz gives 2 Holz');
  p2.click('#next'); check(p2.text().includes('+2 Holz für die Werkbank'), 'the wood is shown');
}

// 27. Kreisel: part values, old saves, buying and fitting, one arena per world, resume mid-duel, win and loss, chest parts
function topCases() {
  const skip = { setup: { done: false, skipped: true, at: 'x' } };
  const START = '{"tip":"stahl","ring":"zahn","disc":"leicht"}';
  { // every part changes one number; the starter parts come first and are always there
    const T = open().w.eval('MQ.TOP_PARTS');
    check(['tip', 'ring', 'disc'].every((k) => T[k].length === 3 && !T[k][0].price && !T[k][0].chest && !T[k][0].mine && T[k][0].val < T[k][1].val && T[k][1].val < T[k][2].val), 'three parts per row, starter part first, each better than the last');
    check(T.tip.map((x) => x.name).join() === 'Stahlspitze,Gummispitze,Kugelspitze' && T.ring.map((x) => x.name).join() === 'Zahnring,Wellenring,Flammenring' && T.disc.map((x) => x.name).join() === 'Leichte Scheibe,Schwere Scheibe,Eisenscheibe', 'part names');
    check(T.tip[1].price === 8 && T.ring[1].price === 12 && T.disc[1].price === 10 && T.ring[2].chest === 2 && T.tip[2].chest === 3 && T.disc[2].mine && T.disc[2].id === 'eisen', 'prices 8/12/10, Flammenring in world 2, Kugelspitze in world 3, Eisenscheibe from the Bergwerk (top-disc-eisen)');
  }
  { // old saves and damaged values load with the starter parts; a fitted part needs to be owned
    const p = open({ [META]: JSON.stringify(Object.assign({ runs: 4, stamps: 3 }, skip)) });
    check(JSON.stringify(p.w.__mq.meta.top) === START && p.errors.length === 0, 'old save without top loads with Stahlspitze, Zahnring and Leichte Scheibe');
    for (const bad of [[1], 'x', 5, { tip: 'gibt-es-nicht', ring: 7 }, { tip: 'kugel', ring: 'welle', disc: 'eisen' }]) {
      const q = open({ [META]: JSON.stringify({ top: bad }) });
      check(JSON.stringify(q.w.__mq.meta.top) === START && q.errors.length === 0, 'wrong or not owned top parts fall back to the starter parts (' + JSON.stringify(bad) + ')');
    }
    const q = open({ [META]: JSON.stringify({ top: { tip: 'kugel', ring: 'zahn', disc: 'eisen' }, owned: { 'top-tip-kugel': true, 'top-disc-eisen': true } }) });
    check(JSON.stringify(q.w.__mq.meta.top) === '{"tip":"kugel","ring":"zahn","disc":"eisen"}', 'owned parts stay fitted');
    const merged = q.w.__mq.mergeMeta(p.w.__mq.meta, q.w.__mq.meta);
    check(JSON.stringify(merged.top) === START && merged.owned['top-tip-kugel'] && merged.owned['top-disc-eisen'], 'merging a save code keeps the device top and adds the parts from the code');
  }
  { // Kreisel bauen: values, three rows, buy with a confirm dialog, fit
    const p = open({ [META]: JSON.stringify(Object.assign({ stamps: 25, owned: { 'top-disc-eisen': true } }, skip)) }); const m = p.w.__mq.meta;
    p.click('#stamps');
    check(p.text().includes('Kreisel bauen') && !!p.$('#kb'), 'Stempelheft lists „Kreisel bauen“');
    p.click('#kb');
    const vals = () => p.$('.topvals').textContent;
    check(vals().includes('Wucht 5') && vals().includes('Panzer 1') && vals().includes('Schwung 20') && p.d.querySelectorAll('.kkitem').length === 9 && p.d.querySelectorAll('.kkitem .rwhave').length === 3, 'Kreisel bauen shows the values and three rows of parts with the starter parts fitted');
    check(p.text().includes('Truhe in Welt 2') && p.text().includes('Truhe in Welt 3') && !p.$('[data-buy="ring:flamme"]') && !!p.$('[data-fit="disc:eisen"]'), 'chest parts show where to find them, the iron disc from the Bergwerk can be fitted');
    p.click('[data-buy="tip:gummi"]'); p.click('.overlay #no');
    check(m.stamps === 25 && !m.owned['top-tip-gummi'] && m.top.tip === 'stahl', '"Zurück" in the buy dialog buys nothing');
    p.click('[data-buy="tip:gummi"]'); p.click('.overlay #yes');
    check(m.stamps === 17 && m.owned['top-tip-gummi'] === true && m.top.tip === 'gummi' && !!m.progressAt && vals().includes('Wucht 6'), 'buying the Gummispitze costs 8 stamps, fits it and raises the Wucht');
    p.click('[data-buy="ring:welle"]'); p.click('.overlay #yes');
    check(m.stamps === 5 && m.top.ring === 'welle' && vals().includes('Panzer 2') && p.$('[data-buy="disc:schwer"]').disabled, 'Wellenring costs 12; with 5 stamps left the heavy disc stays locked');
    p.click('[data-fit="disc:eisen"]'); p.click('[data-fit="tip:stahl"]');
    check(m.top.disc === 'eisen' && m.top.tip === 'stahl' && vals().includes('Schwung 28') && vals().includes('Wucht 5'), 'fitting owned parts changes the values');
    const q = open(p.dump());
    check(JSON.stringify(q.w.__mq.meta.top) === '{"tip":"stahl","ring":"welle","disc":"eisen"}' && q.w.__mq.meta.owned['top-tip-gummi'], 'the built top and the bought parts are saved');
  }
  { // one arena per world on floors 4–6, on a fight: the other special nodes stay as they were
    const p = open({ [META]: JSON.stringify(skip) }); let maps = 0, arenas = 0, other = true;
    for (const [m, specials] of [['math', ['markt']], ['satzbaustelle', ['lesen']], ['kartoffel', []]]) for (let i = 0; i < 30; i++) {
      p.w.__mq.screenTitle(); p.click(`[data-new="${m}"]`); if (p.$('.overlay #yes')) p.click('.overlay #yes'); p.click('.choice'); p.click('#go');
      const map = p.w.__mq.run.map; const at = map.flatMap((fl, f) => fl.filter((n) => n.t === 'arena').map(() => f)); maps++; arenas += at.length;
      if (at.length > 1 || at.some((f) => f < 3 || f > 5)) check(false, 'arena on the wrong floor or twice: ' + at);
      for (const t of specials) if (map.flat().filter((n) => n.t === t).length !== 1) other = false;
      if (map.flat().filter((n) => n.t === 'weekboss').length > 1) other = false;
    }
    check(arenas >= maps - 3, 'one Kreisel-Arena per world map on floors 4–6 (' + arenas + ' in ' + maps + ')');
    check(other, 'market, weekly boss and Lesestube keep their own node');
  }
  // an adventure standing in front of an arena on floor 1
  const toArena = (meta) => { const p = open({ [META]: JSON.stringify(Object.assign({}, skip, meta)) }); p.click('[data-new="math"]'); p.click('.choice'); p.click('#go');
    p.w.__mq.run.map[0][0].t = 'arena'; p.w.__mq.screenMap(); p.click([...p.d.querySelectorAll('.node.open')].find((n) => n.getAttribute('aria-label') === 'Kreisel-Arena')); return p; };
  { // win: start phase, reload mid-duel, rounds, 1 stamp and XP
    const p = toArena({ owned: { 'top-tip-gummi': true }, top: { tip: 'gummi', ring: 'zahn', disc: 'leicht' } }); const r = p.w.__mq.run;
    const e = r.node.enemy;
    check(!!p.$('.mon.top.live') && p.text().includes('Kreisel-Arena') && p.text().includes('Schwung') && !p.text().includes('❤️') && !p.$('#bag'), 'the arena shows two spinning tops with Schwung instead of life points and no bag');
    // the opponent is a random enemy of the world: the hero's type advantage adds 2 Wucht
    const bonus = p.w.eval('MQ.BEATS')[p.w.eval('MQ.STARTERS').find((s) => s.id === r.hero.id).type] === e.type ? 2 : 0;
    check(e.top.spin === 20 && e.hp === 24 && e.top.wucht === 6 + bonus && e.top.panzer === 1 && !p.w.__mq.meta.dex[e.name], 'start values come from the parts (Schwung 20, Wucht 6, +2 with type advantage) and the other top has 24 Schwung; no Monsterbuch entry');
    answer(p, true); p.click('#next');
    check(e.top.spin === 24 && e.top.start === 1 && e.hp === 24, 'a right answer in the start phase gives +4 Schwung');
    const hp = r.hero.hp, items = r.items.join(), xp = r.hero.xp;
    const p2 = open(p.dump()); p2.click('[data-cont="math"]'); const e2 = p2.w.__mq.run.node.enemy;
    check(p2.text().includes('Kreisel-Arena') && p2.text().includes('Aufgabe 2 von 3') && e2.top.spin === 24 && e2.hp === 24 && p2.errors.length === 0, 'reopening the app mid-duel continues with the same Schwung and task number');
    answer(p2, false); p2.click('#next');
    check(e2.top.spin === 24 && e2.top.start === 2, 'a wrong answer in the start phase gives nothing');
    answer(p2, true); p2.click('#next');
    answer(p2, true); p2.click('#next');
    check(e2.hp === 24 - e2.top.wucht && e2.top.spin === 28, 'a right answer in a round costs the other top your Wucht');
    answer(p2, false); p2.click('#next');
    check(e2.top.spin === 23, 'a wrong answer costs your top 6 minus Panzer');
    while (e2.hp > e2.top.wucht) { answer(p2, true); p2.click('#next'); }
    const m = p2.w.__mq.meta; const before = m.stamps; p2.w.__mq.run.right = 0;
    answer(p2, true);
    const p3 = open(p2.dump()); p3.click('[data-cont="math"]'); const m3 = p3.w.__mq.meta; const r3 = p3.w.__mq.run;
    check(!!p3.$('#topend') && p3.text().includes('Der andere Kreisel kippt um') && m3.stamps === before + 1 && p3.text().includes('+1 🏷') && r3.hero.xp === xp + 18 && r3.node.done, 'a win gives 1 stamp and 18 XP, also when the app was closed right after the last answer');
    check(r3.hero.hp === hp && r3.items.join() === items, 'the duel never touches life points or items');
    const p4 = open(p3.dump()); p4.click('[data-cont="math"]');
    check(p4.w.__mq.meta.stamps === before + 1 && !!p4.$('.wmap') && p4.w.__mq.run.floor === 2, 'reopening after the win moves on without paying twice');
  }
  { // loss: costs nothing but the node
    const p = toArena({ seenTut: { 'arena:intro': true } }); const r = p.w.__mq.run; const e = r.node.enemy; const m = p.w.__mq.meta;
    const hp = r.hero.hp, xp = r.hero.xp, items = r.items.join(), stamps = m.stamps;
    for (let i = 0; i < 3; i++) { answer(p, false); p.click('#next'); }
    check(e.top.spin === 20 && e.top.start === 3, 'three wrong answers in the start phase leave the start value');
    while (e.top.spin > 0) { answer(p, false); p.click('#next'); }
    check(p.text().includes('Dein Kreisel kippt um') && !p.$('.atk'), 'without Schwung your top falls over');
    p.click('#next');
    check(!!p.$('#topend') && p.text().includes('kostet dich nichts') && m.stamps === stamps && r.hero.hp === hp && r.hero.xp === xp && r.items.join() === items && !p.w.__mq.run.over, 'a lost duel costs no life points, items, XP or stamps and the adventure goes on');
    p.click('#next');
    check(!!p.$('.wmap') && p.w.__mq.run.floor === 2 && !!p.dump()[RUN], 'after a lost duel the map moves on to the next floor');
  }
  { // chests: Flammenring in world 2, Kugelspitze in world 3, each once; nothing in world 1
    const chest = (saved, world) => { const r = JSON.parse(saved[RUN]); r.world = world; r.node = { type: 'treasure' }; saved[RUN] = JSON.stringify(r); const p = open(saved); p.click('[data-cont="math"]'); return p; };
    const p0 = toArena({ seenTut: { 'arena:intro': true } });
    const p1 = chest(p0.dump(), 1);
    check(!Object.keys(p1.w.__mq.meta.owned).some((k) => k.startsWith('top-')) && !p1.text().includes('Kreisel'), 'a chest in world 1 has no top part');
    const p2 = chest(p0.dump(), 2);
    check(p2.w.__mq.meta.owned['top-ring-flamme'] === true && p2.text().includes('Flammenring') && !!p2.w.__mq.meta.progressAt, 'the first chest in world 2 holds the Flammenring');
    const p2b = open(p2.dump()); p2b.click('[data-cont="math"]');
    check(p2b.text().includes('Flammenring') && p2b.w.__mq.run.node.part === 'top-ring-flamme', 'reopening at the chest still shows the part');
    p2b.click('.choice[data-i="0"]');
    const p2c = chest(p2b.dump(), 2);
    check(!p2c.text().includes('Flammenring') && !p2c.w.__mq.run.node.part, 'the next chest in world 2 has no second Flammenring');
    const p3 = chest(p2c.dump(), 3);
    check(p3.w.__mq.meta.owned['top-tip-kugel'] === true && p3.text().includes('Kugelspitze'), 'a chest in world 3 holds the Kugelspitze');
  }
}

reloadCases().then(readCases).then(saveCodeCases).then(stampCases).then(gardenCases).then(gardenWinCases).then(weeklyCases).then(wardrobeCases).then(topCases).then(() => {
  console.log('storage fails', fails);
  if (fails) process.exit(1);
});
