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
  const $ = (s) => d.querySelector(s);
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

// 15. Weekly goals, weekly boss, weekly report
const W48 = '2026-11-25T10:00:00', W49 = '2026-12-02T10:00:00'; // maths goal: W48 the weekly boss, W49 right answers
async function weeklyCases() {
  { // same week key → same goals on two devices; one goal per subject, only enabled task types
    const a = open(null, { now: W49 }), b = open(null, { now: W49 });
    const ga = a.w.__mq.weeklyGoals(), gb = b.w.__mq.weeklyGoals();
    check(ga.length === 4 && same(ga, gb), 'two devices show the same goals in the same week');
    check(same(ga.map((g) => g.subject), ['Mathe', 'Deutsch', 'Ethik', 'Sachkunde']), 'one goal per subject of the grade');
    check(ga.every((g) => (g.kind === 'right' ? g.n >= 15 && g.n <= 25 : g.kind === 'elite' ? g.n >= 2 && g.n <= 3 : g.n === 1)), 'goal sizes: 15–25 right answers, 2–3 elites, one win or weekly boss');
    check(ga[0].kind === 'right' && ga[0].m === 'math', 'W49 has a right-answers goal in maths');
    const c = open(null, { now: '2026-12-09T10:00:00' });
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
    const m = p.w.__mq.meta;
    answer(p, true);
    check(m.weekly.week === '2026-W49' && m.weekly.progress[0] === 1 && same(m.weekly.tally['math:' + g.mod], { c: 1, t: 1 }), 'a right answer of the goal type counts');
    p.click('#next'); await sleep(2200); answer(p, false);
    check(m.weekly.progress[0] === 1 && same(m.weekly.tally['math:' + g.mod], { c: 1, t: 2 }), 'a wrong answer counts for the report only');
    p.click('#next'); await sleep(2200);
    const goals = p.w.__mq.weeklyGoals(); m.weekly.progress = goals.map((x, i) => (i ? x.n : x.n - 1)); const st = m.stamps;
    answer(p, true);
    check(m.weekly.done && m.stampCard['2026-W49'] === 2 && m.stamps === st + 10 && m.stampsTotal >= 10 && !!m.progressAt, 'all goals: gold week on the stamp card, 10 stamps, progress date');
    p.w.__mq.screenMap();
    check(!!p.$('.overlay') && p.$('.overlay').textContent.includes('Wochenaufgabe geschafft') && p.$('.overlay').textContent.includes('+10'), 'a short card "Wochenaufgabe geschafft" shows once');
    p.click('.overlay #tutok'); p.w.__mq.screenMap();
    check(!p.$('.overlay'), 'the card does not come back');
    const p2 = open(p.dump(), { now: W49 });
    check(p2.w.__mq.meta.weekly.done && p2.$('#weekly').textContent.includes('Wochenaufgabe geschafft'), 'a finished week is saved and shown on the title');
    p2.click('#parents');
    check(p2.text().includes('Wochenbericht') && p2.text().includes(p2.w.eval('MQ.MODULES')[g.mod].name) && p2.text().includes('2 / 3') && p2.text().includes('Wochenziele: 4 von 4 erledigt'), 'parent area shows the weekly report');
    const lines = p2.$('#wtext').value.split('\n');
    check(lines.length >= 3 && lines.length <= 5 && lines[0] === 'Lernquest, Woche 49' && lines.some((l) => l.startsWith('Geübt')) && !/Steinkauz|Moosbär/.test(p2.$('#wtext').value), 'report text has three to five lines and no names: ' + JSON.stringify(lines));
    p2.click('#wcopy');
    check(p2.$('#wmsg').textContent.includes('markiert') && p2.d.activeElement === p2.$('#wtext'), 'without clipboard the report text is marked for copying');
    // next week: fresh goals, nothing taken away
    const p3 = open(p2.dump(), { now: '2026-12-09T10:00:00' }); const m3 = p3.w.__mq.meta;
    check(m3.weekly.week === '2026-W50' && m3.weekly.progress.length === 0 && !m3.weekly.done && same(m3.weekly.tally, {}) && m3.stampCard['2026-W49'] === 2 && m3.stamps === p2.w.__mq.meta.stamps, 'a new week starts fresh and takes nothing away');
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
    check(o.errors.length === 0 && o.w.__mq.meta.weekly.week === '2026-W49' && same(o.w.__mq.meta.weekly.progress, []) && !!o.$('#weekly'), 'old save without weekly data loads with defaults');
    const b = open({ [META]: JSON.stringify({ setup: { done: false, skipped: true, at: 'x' }, weekly: { week: 5, progress: ['x', 3.7, -2], done: 'ja', beaten: [1, 'math'], tally: { 'math:add': { c: 1, t: 2 }, bad: 7 } } }) }, { now: W49 });
    const bw = b.w.__mq.meta.weekly;
    check(b.errors.length === 0 && bw.week === '2026-W49' && bw.done === false, 'wrong-typed weekly data falls back to defaults');
    const raw = open().w.__mq.meta; raw.weekly = { week: '2026-W49', progress: ['x', 3.7, -2], done: false, beaten: [1, 'math'], tally: { 'math:add': { c: 1, t: 2 }, bad: 7 } };
    const n = open({ [META]: JSON.stringify(raw) }, { now: W49 }).w.__mq.meta.weekly;
    check(same(n.progress, [0, 3, 0]) && same(n.beaten, ['math']) && same(n.tally, { 'math:add': { c: 1, t: 2 } }), 'weekly fields are cleaned up when loading');
    const base = open().w.__mq.meta; const mk = (wk) => Object.assign(JSON.parse(JSON.stringify(base)), { weekly: wk });
    const wa = { week: '2026-W49', progress: [3, 0, 1], done: false, beaten: [], tally: { 'math:add': { c: 2, t: 3 } } };
    const wb = { week: '2026-W49', progress: [1, 2], done: false, beaten: ['ethik'], tally: { 'math:add': { c: 1, t: 1 }, 'ethik:rf': { c: 1, t: 1 } } };
    const mw = open().w.__mq.mergeMeta(mk(wa), mk(wb)).weekly;
    check(same(mw.progress, [3, 2, 1]) && same(mw.beaten, ['ethik']) && same(mw.tally, { 'math:add': { c: 3, t: 4 }, 'ethik:rf': { c: 1, t: 1 } }), 'merge: same week keeps the higher progress and adds the answers');
    check(open().w.__mq.mergeMeta(mk(Object.assign({}, wa, { week: '2026-W48' })), mk(wb)).weekly.week === '2026-W49', 'merge: the newer week wins');
  }
}
reloadCases().then(saveCodeCases).then(stampCases).then(weeklyCases).then(() => {
  console.log('storage fails', fails);
  if (fails) process.exit(1);
});
