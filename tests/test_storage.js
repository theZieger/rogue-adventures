// Regression tests for saving/loading (runs the built docs/index.html in jsdom).
// Each "page load" is a fresh JSDOM that starts with the localStorage of the previous one,
// which is what a reload or reopening the app does.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8');

let fails = 0;
const check = (cond, msg) => { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); };

// opts.url: page address (e.g. with #lade=); opts.zip: give the page the compression streams jsdom lacks
function open(storage, opts) {
  const errors = []; opts = opts || {};
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: opts.url || 'https://example.com/',
    beforeParse(w) {
      for (const [k, v] of Object.entries(storage || {})) w.localStorage.setItem(k, v); w.addEventListener('error', (e) => errors.push(e.message));
      if (opts.zip) Object.assign(w, { CompressionStream, DecompressionStream, Response, TextEncoder });
    },
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

// 11. A save from before the Kirchenjahr unit loads, and a Kirchenjahr adventure continues after reopening
{
  const p0 = open(); const old = JSON.parse(JSON.stringify(p0.w.__mq.meta)); delete old.stats.kirchenjahr;
  const p1 = open({ [META]: JSON.stringify(old) }); if (p1.$('#later')) p1.click('#later');
  check(p1.errors.length === 0 && p1.w.__mq.meta.stats.kirchenjahr && p1.w.__mq.meta.stats.kirchenjahr.rf.t === 0, 'old save without Kirchenjahr stats loads with empty stats');
  p1.click('[data-new="kirchenjahr"]'); p1.click('.choice'); p1.click('#go'); p1.click('.node.open');
  const p2 = open(p1.dump());
  check(!!p2.dump().mathquest_run_kirchenjahr && !!p2.$('[data-cont="kirchenjahr"]'), 'Kirchenjahr adventure is saved and can be continued');
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

reloadCases().then(saveCodeCases).then(stampCases).then(gardenCases).then(gardenWinCases).then(() => {
  console.log('storage fails', fails);
  if (fails) process.exit(1);
});
