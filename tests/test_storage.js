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

// 13. Materials and owned things: defaults, damaged values, the Bergwerk fills them and survives a reload
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

// 14. Die Baustelle: new unit on the title, adventure starts, stats exist for old saves
{
  const p = open({ [META]: JSON.stringify({ setup: { skipped: true }, stats: { math: {} } }) });
  check(!!p.$('[data-new="bau"]') && p.text().includes('Die Baustelle'), 'title lists Die Baustelle under Mathe');
  const st = p.w.__mq.meta.stats.bau;
  check(['wz', 'fq', 'netz', 'koerper', 'band', 'lage', 'umfang'].every((k) => st[k] && st[k].t === 0), 'old save gains stats for the Baustelle');
  p.click('[data-new="bau"]'); p.click('#go');
  p.click([...p.d.querySelectorAll('.node.open')][0]);
  const saved = p.dump();
  check(!!saved.mathquest_run_bau, 'Baustelle adventure is saved under its own key');
  const p2 = open(saved);
  check(!!p2.$('[data-cont="bau"]') && !!p2.$('[data-new="math"]') && !p2.$('[data-cont="math"]'), 'Baustelle adventure does not touch Zahlenquest');
  p2.click('[data-cont="bau"]');
  check(!!p2.$('#fe') && p2.errors.length === 0, 'Baustelle fight continues after reopening');
}

reloadCases().then(saveCodeCases).then(() => {
  console.log('storage fails', fails);
  if (fails) process.exit(1);
});
