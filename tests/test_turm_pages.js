// Turmwacht in the page: saving and resuming runs (runs the built docs/index.html in jsdom, seeded).
// Page budget for the whole Turm feature: at most 15 page opens in this file.
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8');

const t0 = Date.now();
let fails = 0, opens = 0;
const check = (cond, msg) => { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); };
const META = 'mathquest_meta_v2', TURM = 'mathquest_run_turm', RUN = 'mathquest_run_v1';
const seeded = (s) => () => { s = (s + 0x6D2B79F5) | 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
const same = (a, b) => { const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x)); return canon(a) === canon(b); };
const clone = (o) => JSON.parse(JSON.stringify(o));

// one page at a time: opening a page closes the previous one (every page is a full app with its own timers)
let last = null;
function open(storage, seed = 1) {
  if (last) last.close();
  opens++;
  const errors = [], virtualConsole = new VirtualConsole(); let closed = false;
  virtualConsole.sendTo(console, { omitJSDOMErrors: true }); virtualConsole.on('jsdomError', (e) => { if (!closed) console.error(e); });
  const dom = new JSDOM(html, { virtualConsole, runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/', beforeParse(w) {
    for (const [k, v] of Object.entries(storage || {})) w.localStorage.setItem(k, v);
    w.Math.random = seeded(seed); w.addEventListener('error', (e) => errors.push(e.message));
  } });
  const w = dom.window, d = w.document;
  const dump = () => Object.fromEntries(Object.keys(w.localStorage).map((k) => [k, w.localStorage.getItem(k)]));
  const p = { w, d, T: w.__mq.turm, $: (s) => d.querySelector(s), click: (s) => d.querySelector(s).click(), dump, errors, saved: () => JSON.parse(w.localStorage.getItem(TURM)) };
  last = { close: () => { closed = true; w.close(); } };
  return p;
}
const meta0 = JSON.stringify({ setup: { done: false, skipped: true, at: 'x' }, grade: 3, turm: { on: true } });

// answer the question on screen through the real task view, then „Weiter“ (as in tests/test_duel.js)
function uiAnswer(p, right) {
  const t = p.w.__task, c = (s) => (typeof s === 'string' ? p.$(s) : s).click();
  if (t.kind === 'num') {
    if (t.col) { const s = String(right ? t.answers[0] : t.answers[0] + 1); const w = t.col.w; [...s].forEach((ch, k) => { c(`.colcalc .inp[data-i="${w - s.length + k}"]`); c(`.numpad [data-k="${ch}"]`); }); }
    else [...p.d.querySelectorAll('.inp')].forEach((el, i) => { el.click(); for (const ch of String(right ? t.answers[i] : t.answers[i] + 1)) c(`.numpad [data-k="${ch}"]`); });
    c('.numpad [data-k="ok"]');
  } else if (t.kind === 'choice' || t.kind === 'parts') { const i = t.options.indexOf(t.answer); c(p.d.querySelectorAll('.opt')[right ? i : (i + 1) % t.options.length]); }
  else if (t.kind === 'parts-find') c([...p.d.querySelectorAll('.plant [data-part]')].find((x) => (x.dataset.part === t.part) === right));
  else { const o = right ? t.order : [t.order[1], t.order[0]].concat(t.order.slice(2)); for (const id of o) c(`.oitem[data-id="${id}"]`); c('#ocheck'); }
  c('#next');
}
// play one turn: the first monster that can be attacked, answered right or wrong, then the monsters step
const turn = (p, ok) => { const r = p.w.__mq.run, x = r.turm.monsters.find((y) => p.T.TW.canTarget(r, y.id)); p.T.ask(x.id); p.T.answer(ok); return p.T.step(); };

(async () => {
  // a math adventure is running too; a Turm run must never touch it
  const p = open({ [META]: meta0 });
  p.click('[data-sub="0"]'); p.click('[data-new="math"]'); p.click('.choice'); p.click('#go'); p.click('.node.open');
  const adv = p.w.localStorage.getItem(RUN);
  p.w.__mq.screenTitle();
  p.T.start(['Mathe', 'Deutsch', 'Sachkunde'], { m: 'math', id: 'fuchs' });
  const run = p.w.__mq.run, snap = {};
  check(run.mode === 'turm' && run.turm.phase === 'choose' && same(p.saved(), run), 'a new Turm run is saved right away');
  check(p.w.__mq.meta.turm.runs === 1 && p.w.localStorage.getItem(RUN) === adv, 'the run counts as begun; the adventure stays saved');
  const unitsOf = (r, sub) => [...new Set(r.turm.lanes.filter((l) => l.subject === sub).flatMap((l) => l.src.map((s) => s.m)))].join();
  check(unitsOf(run, 'Mathe') === 'math' && ['Deutsch', 'Sachkunde'].every((s) => unitsOf(run, s) && !unitsOf(run, s).includes(',')), 'nothing practised yet: each subject asks only from its first theme');
  check(run.turm.lanes.every((l) => l.src.length <= 2), 'nothing practised yet: at most two task types per subject');
  check(Object.keys(run.turm.at).sort().join() === [...new Set(run.turm.lanes.flatMap((l) => l.src.map((s) => s.m)))].sort().join(), 'every unit on the paths gets its own task box');
  snap.choose = p.dump();
  const x = run.turm.monsters[0], task = p.T.ask(x.id);
  check(run.turm.phase === 'task' && same(p.saved().turm.asking.task, task), 'the shown question is saved before it is answered');
  snap.task = p.dump();
  p.T.answer(true);
  check(run.turm.phase === 'step' && p.saved().turm.phase === 'step' && p.saved().turm.ziegel === run.turm.ziegel && run.turm.ziegel >= 1, 'the answer and its Ziegel are saved at once');
  snap.step = p.dump();
  // play right answers until the wave-3 boss is beaten (Bauzeit after waves 1 and 2 on the way)
  for (let n = 0; n < 200 && run.turm.phase !== 'reward'; n++) {
    if (run.turm.phase === 'build') { if (!snap.build) snap.build = p.dump(); p.T.nextWave(); } else if (run.turm.phase === 'step') p.T.step(); else turn(p, true);
  }
  check(run.turm.phase === 'reward' && run.turm.wave === 3, 'right answers reach the reward after the wave-3 boss');
  snap.reward = p.dump();
  p.T.reward(0); p.T.nextWave();
  check(run.turm.wave === 4 && !!run.turm.cp, 'wave 4 with a checkpoint');
  run.hero.hp = 1;
  for (let n = 0; n < 50 && run.turm.phase !== 'fallen'; n++) turn(p, false);
  check(run.turm.phase === 'fallen' && p.T.TW.canRetry(run), 'the tower falls in wave 4 with a retry left');
  snap.fallen = p.dump();
  check(p.w.__mq.meta.turm.best === 4 && p.w.__mq.meta.turm.last.Mathe && p.w.__mq.meta.turm.last.Mathe.t >= 1, 'record and latest scores reach meta');
  check(p.errors.length === 0, 'no page errors ' + p.errors.join(' '));

  // reload: every phase loads unchanged and goes on
  // every Turm sentence with a monster name, for every monster: nominative/accusative forms and no capital article mid-sentence
  {
    const S = p.T.say, names = new Map();
    for (const u of Object.values(require('./units.js'))) for (const w of Object.values(u.enemies)) for (const e of [...w.normal, w.elite, w.boss]) if (e) names.set(e.name, e);
    const out = [];
    for (const e of names.values()) {
      const x = { id: 1, name: e.name, acc: e.acc }, nm = { 1: { name: e.name, acc: S.acc(x) } };
      const ev = [{ t: 'hit', id: 1, dmg: 5 }, { t: 'shot', id: 1, dmg: 4 }, { t: 'chain', id: 1, dmg: 3 }, { t: 'beaten', id: 1 }, { t: 'stun', id: 1 }, { t: 'push', id: 1 }, { t: 'tower', id: 1, dmg: 9 }, { t: 'hold', id: 1 }, { t: 'block', id: 1 }, { t: 'enter', id: 1, boss: true }];
      out.push(...S.lines(ev, nm), S.elite(x), S.blocked(x), S.gate([x]), S.gate([x, x]), S.gate([x, x, x]));
    }
    if (process.env.TURM_NAMES) console.log(out.join('\n'));
    const bad = out.filter((l) => / (Der|Die|Das|Den) /.test(l.replace(/^(Der|Die|Das) /, '').replace(/\. (Der|Die|Das) /g, '. ')) || /Erst wenn (den|einen) /.test(l) || /(trifft|hält|schiebt)( auch)? (der|Der) /.test(l) || /\bden [A-ZÄÖÜ][a-zäöüß]+e\b/.test(l));
    check(names.size > 100 && !bad.length, 'monster names take the right case in every Turm sentence ' + bad.slice(0, 5).join(' | '));
  }
  const q = open(snap.task, 2);
  check(q.T.resume() && same(q.w.__mq.run, JSON.parse(snap.task[TURM])), 'reload during a question: the run loads unchanged');
  const t1 = q.T.ask(-1), z0 = q.w.__mq.run.turm.ziegel;
  check(same(t1, JSON.parse(snap.task[TURM]).turm.asking.task) && same(q.saved(), JSON.parse(snap.task[TURM])), 'the same question is asked again, nothing re-rolled');
  const st = () => JSON.stringify(q.w.__mq.meta.stats);
  const ev = q.T.answer(true), s1 = st(), z1 = q.w.__mq.run.turm.ziegel;
  check(ev.some((e) => e.t === 'hit') && z1 > z0, 'answering it hits the monster and earns Ziegel');
  check(q.T.answer(true).length === 0 && q.w.__mq.run.turm.ziegel === z1 && st() === s1, 'a second answer counts nothing');
  const setRun = (s) => { q.w.localStorage.setItem(TURM, s[TURM]); q.w.localStorage.setItem(META, s[META]); return q.T.resume(); };
  for (const ph of ['choose', 'step', 'build', 'reward', 'fallen']) check(same(setRun(snap[ph]), JSON.parse(snap[ph][TURM])) && q.w.__mq.run.turm.phase === ph, 'reload in phase ' + ph + ': the run loads unchanged');
  setRun(snap.step);
  const zs = q.w.__mq.run.turm.ziegel, ss = st();
  check(q.T.answer(true).length === 0 && q.w.__mq.run.turm.ziegel === zs && st() === ss, 'reload after an answer: no second answer, no Ziegel twice');
  q.T.step();
  check(q.w.__mq.run.turm.phase === 'choose' && q.saved().turm.phase === 'choose', 'then the monsters step and the next turn is saved');
  setRun(snap.reward); q.T.reward(1);
  const rw = JSON.parse(snap.reward[TURM]);
  check(q.w.__mq.run.turm.phase === 'build' && same(q.saved().items, rw.items.concat(rw.turm.offer[1])), 'reload in the reward: the chosen item is saved');
  setRun(snap.build); q.T.nextWave();
  check(q.saved().turm.wave === JSON.parse(snap.build[TURM]).turm.wave + 1, 'reload in the Bauzeit: the next wave starts');
  setRun(snap.fallen); q.T.retry();
  check(q.saved().turm.phase === 'build' && q.saved().turm.cpUsed === 1 && q.saved().hero.hp === q.saved().hero.maxHp && q.saved().turm.wave === 3, 'reload after the fall: „Ab Welle 4 weitermachen“ still works');
  check(q.errors.length === 0, 'no page errors ' + q.errors.join(' '));

  // broken runs: removed, only their own key; repairable fields are repaired
  const good = JSON.parse(snap.task[TURM]);
  const b = open({ [META]: snap.task[META], [RUN]: adv, [TURM]: '{"turm":' }, 3);
  check(!b.w.localStorage.getItem(TURM) || !b.T.resume(), 'unreadable Turm run: the app starts');
  check(b.w.localStorage.getItem(RUN) === adv && b.errors.length === 0, 'the adventure stays');
  const bad = [42, [], { turm: {} }, Object.assign(clone(good), { hero: null }), (() => { const r = clone(good); r.turm.wave = 9; return r; })(), (() => { const r = clone(good); r.turm.lanes = []; return r; })(),
    (() => { const r = clone(good); r.turm.lanes.forEach((l) => { l.src = [{ m: 'gibtsnicht', k: 'x' }]; }); return r; })(), (() => { const r = clone(good); r.turm.wave = 2.5; return r; })()];
  for (const r of bad) { b.w.localStorage.setItem(TURM, JSON.stringify(r)); check(b.T.resume() === null && !b.w.localStorage.getItem(TURM) && b.w.localStorage.getItem(RUN) === adv, 'broken Turm run is removed, the adventure stays: ' + JSON.stringify(r).slice(0, 50)); }
  const fix = (f) => { const r = clone(good); f(r); b.w.localStorage.setItem(TURM, JSON.stringify(r)); return b.T.resume(); };
  let r = fix((r) => { r.hero = { m: 'gibtsnicht', id: 'x', hp: 'viel' }; });
  check(r && r.hero.m === good.turm.lanes[0].src[0].m && r.hero.hp === 60 && r.hero.evo === 0, 'unknown hero: first hero of a unit on the paths, tower full');
  r = fix((r) => { const m = r.turm.monsters[0]; m.name = 'Flummibatz'; m.m = 'gibtsnicht'; m.type = 'blitz'; r.turm.queue.push({ id: 'x' }, { ...r.turm.queue[0] }); r.items = ['trank', 'zauberstab']; });
  const m0 = r && r.turm.monsters[0];
  check(m0 && m0.name === 'Sumpfbrocken' && m0.m === r.turm.lanes[m0.lane].src[0].m && m0.type === 'normal', 'old monster names are renamed, unknown units and types replaced');
  check(r && r.turm.queue.length === good.turm.queue.length && same(r.items, ['trank']), 'invalid and doubled monsters and unknown items are dropped');
  r = fix((r) => { r.turm.phase = 'tanzen'; r.turm.ziegel = -3; r.turm.cpUsed = 'ja'; r.turm.guards = { '0:0': { look: 'fuchs', type: 'feuer', lvl: 1 }, '7:0': { look: 'x', type: 'feuer', lvl: 1 }, '1:1': { lvl: 9 } }; r.turm.score.Mathe = { c: 5, t: 2 }; r.turm.cp = { turm: 1 }; });
  check(r && r.turm.phase === 'choose' && r.turm.asking === null && r.turm.ziegel === 0 && r.turm.cpUsed === 0 && same(Object.keys(r.turm.guards), ['0:0']) && !r.turm.score.Mathe && r.turm.cp === null, 'unknown phase, bad numbers, guards, scores and checkpoint fall back field by field');
  r = fix((r) => { r.turm.monsters = []; r.turm.queue = []; r.turm.phase = 'choose'; });
  check(r && r.turm.phase === 'step' && b.T.step().some((e) => e.t === 'cleared') && b.w.__mq.run.turm.phase === 'build', 'an empty board goes on to the end of the wave');
  b.w.localStorage.setItem(TURM, snap.fallen[TURM]); r = b.T.resume();
  check(r && same(r, JSON.parse(snap.fallen[TURM])), 'a valid checkpoint is kept as it is');
  check(b.errors.length === 0, 'no page errors ' + b.errors.join(' '));

  // a broken adventure leaves the Turm run alone
  const c = open({ [META]: snap.task[META], [RUN]: '{"hero":1}', [TURM]: snap.task[TURM] }, 4);
  check(c.w.localStorage.getItem(TURM) === snap.task[TURM] && !!c.T.resume(), 'a broken adventure leaves the Turm run');
  check(c.errors.length === 0, 'no page errors ' + c.errors.join(' '));

  // through the screens: title → start → board → monster card → task → board, then back to the title and into an adventure
  const u = open({ [META]: meta0 }, 5), ud = u.d, txt = () => ud.querySelector('#app').textContent;
  check(!!u.$('#turm') && !txt().includes('läuft'), 'Klasse 3: the title shows Turmwacht, nothing running');
  u.click('#turm');
  const picked = [...ud.querySelectorAll('button[data-subj]')].filter((b) => b.getAttribute('aria-pressed') === 'true').length;
  check(picked >= 1 && picked <= 3 && ud.querySelectorAll('[data-h]').length >= 1 && !u.$('#go').disabled, 'start screen: subjects pre-selected, heroes to choose');
  u.click('#go');
  check(!!u.$('.overlay #tutok') && ud.querySelectorAll('.tw-mon').length >= 1, 'the board opens with the intro the first time');
  u.click('.overlay #tutok');
  check(u.w.__mq.meta.seenTut['turm:intro'] === true && !u.$('.overlay'), 'the intro is seen once');
  const ask = () => { const r = u.w.__mq.run; [...ud.querySelectorAll('.tw-mon')].find((b) => r.turm.monsters.some((x) => x.id === +b.dataset.id && u.T.TW.canTarget(r, x.id))).click(); const x = r.turm.monsters.find((y) => y.id === +u.$('.tw-mon.sel').dataset.id); check(!!u.$('#atk') && !u.$('#atk').disabled && u.$('#twcard').textContent.includes(x.name) && !!u.$('#twcard .tw-theme'), 'a tap opens the monster card'); u.click('#atk'); if (u.$('.overlay #tutok')) u.click('.overlay #tutok'); return u.saved().turm.asking; };
  const stat = (a) => ({ ...u.w.__mq.meta.stats[a.m][a.k] });
  let a1 = ask(); const s0 = stat(a1);
  check(u.saved().turm.phase === 'task' && same(u.w.__task, a1.task) && !!u.$('.screen.tasking'), 'Angreifen shows the saved question in the normal task view');
  const snapUi = u.dump();
  uiAnswer(u, true);
  let n1 = stat(a1);
  check(n1.t === s0.t + 1 && n1.c === s0.c + 1 && !u.w.__mq.meta.stats.turm, 'a right answer counts for the unit of the monster, no Turm entry in the statistics');
  check(!!u.$('.tw-board') && /Schaden/.test(u.$('.tw-log').textContent) && ['choose', 'build'].includes(u.saved().turm.phase), 'back on the board, the log tells what happened');
  a1 = ask(); const w0 = stat(a1);
  uiAnswer(u, false);
  n1 = stat(a1);
  check(n1.t === w0.t + 1 && n1.c === w0.c && /Die Monster rücken vor/.test(u.$('.tw-log').textContent), 'a wrong answer counts too, the monsters step');
  // with motion (forced, 100× faster): the turn plays over the saved board and ends on the same board (or the wave's end)
  u.T.motion(0.01); a1 = ask(); uiAnswer(u, true);
  const played = !!u.$('.tw-screen.playing'), saved1 = u.saved();
  await new Promise((r) => setTimeout(r, 300));
  const R1 = u.w.__mq.run;
  check(played && !u.$('.tw-screen.playing') && !u.$('.tw-ghost') && same(saved1, u.saved()) && (!!u.$('#tobuild') || ud.querySelectorAll('button.tw-mon').length === R1.turm.monsters.length), 'with motion the turn plays after it is saved and ends on the board');
  u.T.motion(null); if (u.$('#tobuild')) u.click('#tobuild'); while (u.$('.overlay #tutok')) u.click('.overlay #tutok');
  u.click('#home');
  check(u.w.__mq.run === null && !!u.w.localStorage.getItem(TURM) && !!u.$('#turm') && txt().includes('läuft'), '„Titel“ saves the run, clears it from memory, the title shows „läuft“');
  u.click('#turm');
  check(!!u.$('#cont') && !!u.$('#new'), 'a saved run: „Weiter“ and „Neu“');
  u.click('#back');
  check(!!u.$('#turm'), 'Zurück goes to the title');
  u.click('[data-sub="0"]'); u.click('[data-new="math"]'); u.click('.choice'); u.click('#go'); u.click('.node.open');
  check(u.w.__mq.run.mode === 'math' && !!u.$('.atk') && !!u.w.localStorage.getItem(TURM), 'an adventure starts after the Turmwacht, the Turm run stays saved');
  check(u.errors.length === 0, 'no page errors ' + u.errors.join(' '));

  // reload during a question: the same question through the screens; Klasse 1 and hidden extras have no entry
  const v = open(snapUi, 6);
  v.click('#turm'); v.click('#cont');
  check(same(v.w.__task, JSON.parse(snapUi[TURM]).turm.asking.task) && !!v.$('.screen.tasking'), 'resume during a question shows the same question');
  uiAnswer(v, true);
  check(!!v.$('.tw-board') && v.saved().turm.phase !== 'task', 'answered after the reload, back on the board');
  const M = v.w.__mq.meta;
  M.grade = 1; v.w.__mq.screenTitle();
  check(!v.$('#turm'), 'Klasse 1: no Turmwacht on the title');
  M.grade = 2; v.w.__mq.screenTitle();
  check(!!v.$('#turm'), 'Klasse 2: Turmwacht on the title');
  M.turm.on = false; v.w.__mq.screenTitle();
  check(!v.$('#turm'), 'switched off by the parents: no Turmwacht on the title');
  check(v.w.__mq.normMeta({ grade: 2 }).turm.on === false && v.w.__mq.normMeta({ turm: { on: 1 } }).turm.on === false && v.w.__mq.normMeta({ turm: { on: true } }).turm.on === true, 'Turmwacht is off unless the parents switched it on');
  check(v.errors.length === 0, 'no page errors ' + v.errors.join(' '));

  // a whole run through the screens, every answer right: banners, wave screens, evolution, victory, Monsterbuch, Stempel
  const f = open({ [META]: meta0 }, 7), fd = f.d, fr = () => f.w.__mq.run, FM = f.w.__mq.meta, stamps0 = FM.stamps;
  f.click('#turm'); f.click('#go'); f.click('.overlay #tutok');
  const seen = { banner: [], cleared: 0, evo: [], guard: '' }; let guard = false;
  for (let n = 0; n < 400 && !f.$('.tw-endbtns'); n++) {
    const ov = f.$('.overlay #tutok');
    if (ov) { const h = f.$('.overlay h2'); if (h && / kommt\.$/.test(h.textContent)) seen.banner.push(h.textContent); ov.click(); continue; }
    if (f.$('#tobuild') || f.$('#pick')) { seen.cleared++; const e = f.$('.tw-evo p'); if (e) seen.evo.push(e.textContent); if (f.$('#pick')) { f.click('#pick'); f.click('.overlay [data-r="0"]'); } else f.click('#tobuild'); continue; }
    if (f.$('#nextwave')) { f.click('#nextwave'); continue; }
    const r = fr(); r.hero.hp = r.hero.maxHp; // this run checks the screens, not the balance
    const prot = !guard && [...fd.querySelectorAll('.tw-mon.guarded')][0];
    if (prot) { guard = true; prot.click(); seen.guard = f.$('.tw-guard').textContent; seen.flash = !!f.$('.tw-mon.sel .tw-bubble.flash') && f.$('#atk').disabled; }
    [...fd.querySelectorAll('.tw-mon')].find((b) => f.T.TW.canTarget(r, +b.dataset.id)).click();
    f.click('#atk'); while (f.$('.overlay #tutok')) f.click('.overlay #tutok');
    uiAnswer(f, true);
  }
  const L = FM.turm.last, right = Object.values(L).reduce((a, v) => a + v.c, 0), dex = Object.values(FM.dex);
  check(!!f.$('.tw-endtower .tw-heroslot') && f.$('#home').className === 'btn' && /geübt/.test(f.$('.tw-end h2').textContent), 'victory: what was practised first, the hero on the finished tower, „Zum Titel“ as the main button');
  check(seen.banner.length === 3 && seen.cleared === 5 && seen.evo.length === 1 && /bekommt eine neue Gestalt/.test(seen.evo[0]) && !/wird zu/.test(seen.evo[0]), 'boss, elite and final boss arrive with a banner; five wave screens, the evolution after the wave-3 boss: ' + seen.banner.join(' | '));
  check(/^Erst (den |die |das )?[A-ZÄÖÜa-zäöü].* besiegen\.$/.test(seen.guard) && !/Erst (Der|Die|Das) /.test(seen.guard) && seen.flash, 'a protected monster: the bubble flashes, „' + seen.guard + '“');
  check(FM.turm.runs === 1 && FM.turm.wins === 1 && FM.turm.best === 6 && Object.keys(L).length >= 1 && right >= 40, 'meta.turm: begun, won, record 6, latest scores');
  check(dex.length >= 8 && dex.every((e) => e.mode !== 'turm' && f.w.__mq.subjectOf(e.mode) && Number.isInteger(e.world)), 'every monster seen is in the Monsterbuch under its own unit');
  check(FM.stamps - stamps0 === 2 * dex.length + 5 + 5 + 10 + Math.floor(right / 10), 'Stempel as in an adventure: new entries, two boss waves, the victory, 1 per 10 right answers');
  f.click('#home');
  check(!f.w.localStorage.getItem(TURM) && f.w.__mq.run === null && !!f.$('#turm'), 'after the victory the run is over, back on the title');
  check(f.errors.length === 0, 'no page errors ' + f.errors.join(' '));

  // the tower falls: „Ab Welle N weitermachen“ twice, then the run is over
  const g = open({ [META]: meta0 }, 8), gr = () => g.w.__mq.run;
  g.T.start(['Mathe', 'Deutsch'], { m: 'math', id: 'kroete' });
  for (let n = 0; n < 300 && !(gr().turm.wave === 4 && gr().turm.phase === 'choose'); n++) { const t = gr().turm; gr().hero.hp = 60; if (t.phase === 'build') g.T.nextWave(); else if (t.phase === 'reward') g.T.reward(0); else if (t.phase === 'step') g.T.step(); else turn(g, true); }
  const fall = () => { g.T.board(); gr().hero.hp = 1; for (let n = 0; n < 40 && g.$('.tw-mon'); n++) { [...g.d.querySelectorAll('.tw-mon')].find((b) => g.T.TW.canTarget(gr(), +b.dataset.id)).click(); g.click("#atk"); while (g.$(".overlay #tutok")) g.click(".overlay #tutok"); uiAnswer(g, false); while (g.$('.overlay #tutok')) g.click('.overlay #tutok'); } };
  const tries = [];
  for (let k = 0; k < 3; k++) {
    fall();
    tries.push({ retry: g.$('#retry') && g.$('#retry').textContent, note: (g.$('.tw-endbtns .pnote') || {}).textContent, saved: !!g.w.localStorage.getItem(TURM) });
    if (!g.$('#retry')) break;
    g.click('#retry'); g.click('#nextwave');
  }
  check(tries.length === 3 && tries[0].retry === 'Ab Welle 4 weitermachen' && /zweimal/.test(tries[0].note) && /einmal/.test(tries[1].note) && tries[0].saved && tries[1].saved, 'fallen: „Ab Welle 4 weitermachen“, the screen says how often it still works');
  check(!tries[2].retry && !tries[2].saved && gr().turm.cpUsed === 2, 'after two retries the third fall ends the run');
  check(/Turm ist gefallen/.test(g.$('.tw-end.center:last-child, .tw-result').textContent) && /geübt/.test(g.$('.tw-end h2').textContent), 'the end screen leads with what was practised');
  check(g.errors.length === 0, 'no page errors ' + g.errors.join(' '));

  // the Bauzeit through the real cards: every kind bought, refusals, then the parents fix the subjects
  const z = open({ [META]: meta0 }, 9), zr = () => z.w.__mq.run, zt = () => zr().turm, card = (id) => z.click(`[data-card="${id}"]`), spot = (l, s) => z.click(`.tw-spot[data-lane="${l}"][data-spot="${s}"]`);
  const log = () => (z.$('.tw-log') || { textContent: '' }).textContent, bmsg = () => z.$('.tw-bmsg').textContent;
  z.w.__mq.meta.dex.Moorschlund = { type: 'wasser', shape: 'moorschlund', world: 1, mode: 'math' };
  z.T.start(['Mathe', 'Deutsch', 'Sachkunde'], { m: 'math', id: 'fuchs' });
  for (let n = 0; n < 100 && zt().phase !== 'build'; n++) { if (zt().phase === 'step') z.T.step(); else turn(z, true); }
  z.T.board();
  check(!!z.$('.overlay #tutok') && /Bauzeit/.test(z.$('.overlay h2').textContent), 'the first Bauzeit explains itself');
  z.click('.overlay #tutok');
  check(z.w.__mq.meta.seenTut['turm:bau'] === true && /geschenkt/.test(z.$('[data-card="guard"]').textContent) && z.d.querySelectorAll('.tw-coming').length >= 1, 'the guard card says the first guard is free, the paths show the coming wave');
  const free0 = zt().ziegel;
  card('guard'); spot(0, 1);
  check(z.d.querySelectorAll('.overlay [data-l]').length === 4 && /stark gegen/.test(z.$('.overlay').textContent), 'a spot asks for the look: three typed guards and the boss from the Monsterbuch');
  z.click('.overlay [data-l="0"]');
  check(same(zt().guards['0:1'], { look: 'fuchs', type: 'feuer', lvl: 1 }) && zt().ziegel === free0 && /Glutfuchs steht jetzt/.test(log()) && same(z.saved(), zr()), 'the free guard is placed and saved');
  const C = z.T.TW.COST;
  zt().ziegel = C.guard + C.up[0] + C.up[1] + C.floor + C.fix; zr().hero.hp = 40; z.T.buy({ kind: 'none' }); z.T.board();
  card('guard'); spot(1, 0); z.click('.overlay [data-l="3"]');
  check(same(zt().guards['1:0'], { look: 'moorschlund', type: 'normal', lvl: 1 }) && zt().ziegel === C.up[0] + C.up[1] + C.floor + C.fix && /Moorschlund hilft dir jetzt\./.test(log()), 'a boss as a guard: normal type, costs Ziegel, „… hilft dir jetzt.“');
  card('up'); spot(0, 1); card('up'); spot(0, 1);
  check(zt().guards['0:1'].lvl === 3 && zt().ziegel === C.floor + C.fix && /Stufe 3/.test(log()) && z.d.querySelectorAll('.tw-spot.on').length === 2, 'upgrades: level 2, then level 3');
  card('floor:Mathe');
  check(same(zt().floors, ['Mathe']) && zt().ziegel === C.fix && !!z.$('#twt .tw-fl[data-subject="Mathe"]') && /Rechenstube ist fertig/.test(log()), 'a floor is built and drawn on the tower');
  card('fix');
  check(zr().hero.hp === 50 && zt().ziegel === 0, 'Mauer flicken: +10 ❤️');
  card('floor:Deutsch');
  check(zt().floors.length === 1 && bmsg() === `Dafür fehlen dir noch ${C.floor} Ziegel.` && z.$('[data-card="floor:Deutsch"]').classList.contains('short') && z.$('[data-card="floor:Deutsch"]').textContent.includes(`Noch ${C.floor}`), 'too expensive: greyed, „Noch n 🧱“, nothing bought');
  card('floor:Mathe');
  check(bmsg() === 'Schon gebaut.', 'a built floor says why it can\'t be built again');
  zt().ziegel = 7; z.T.buy({ kind: 'none' }); z.T.board(); card('guard'); // a refused buy still saves
  const zSaved = z.saved();
  check(z.d.querySelectorAll('button.tw-spot.pick').length === 6 && same(zSaved, zr()), 'a guard card waits for a spot; everything bought is saved');
  z.w.__mq.screenTitle();
  for (let i = 0; i < 5; i++) z.click('#logo');
  z.click('[data-pt="settings"]'); z.click('[data-ps="show"]');
  z.click('[data-tsub="3:Mathe"]'); z.click('[data-tsub="3:Musik"]'); z.click('[data-tsub="2:Ethik"]');
  check(same(z.w.__mq.meta.turm.subjects, { 2: ['Ethik'], 3: ['Mathe', 'Musik'] }) && same(JSON.parse(z.w.localStorage.getItem(META)).turm.subjects, { 2: ['Ethik'], 3: ['Mathe', 'Musik'] }), 'parents fix the Turm subjects per grade');
  check(z.errors.length === 0, 'no page errors ' + z.errors.join(' '));

  // reload in the middle of placing a guard: back to the cards, nothing lost; the start screen keeps the parents' subjects
  const y = open(z.dump(), 10);
  y.click('#turm'); y.click('#cont');
  check(same(y.w.__mq.run, zSaved) && !!y.$('.tw-buy') && !y.$('button.tw-spot.pick') && /7/.test(y.$('.tw-res').textContent), 'reload during the Bauzeit: the cards again, guards, floor and Ziegel kept');
  y.click('#home'); y.click('#turm'); y.click('#new'); y.click('.overlay #yes');
  check([...y.d.querySelectorAll('.tw-subj.fixed')].map((e) => e.dataset.subj).join() === 'Mathe,Musik' && !y.$('button[data-subj]'), 'after the reload the start screen shows the parents\' subjects, fixed');
  check(/schon geübt/.test(y.$('.tw-review').textContent), 'the start screen says the questions come from practised themes');
  // only Die Baustelle practised in Mathe: the Mathe paths ask only from there
  const S = y.w.__mq.meta.stats;
  for (const m of ['math', 'jahrmarkt', 'bau']) for (const k in S[m]) S[m][k] = { c: 0, t: 0 };
  S.bau[Object.keys(S.bau)[0]] = { c: 1, t: 1 };
  y.click('#go');
  check(same([...new Set(y.w.__mq.run.turm.lanes.map((l) => l.subject))], ['Mathe', 'Musik']), 'the run uses exactly those subjects');
  const ks = y.w.__mq.run.turm.lanes.filter((l) => l.subject === 'Mathe').flatMap((l) => l.src.map((x) => x.k));
  check(unitsOf(y.w.__mq.run, 'Mathe') === 'bau' && ks.length === 2 && ks.includes(Object.keys(S.bau)[0]), 'a subject asks only from practised themes: the practised task type and one more from there', ks);
  check(y.errors.length === 0, 'no page errors ' + y.errors.join(' '));
  last.close();
  console.log(`turm pages fails ${fails} (${opens} pages, ${Date.now() - t0} ms)`);
  if (fails) process.exit(1);
})();
