// Turmwacht rules engine (src/turm.js): Node only, seeded, no JSDOM.
const TW = require('../src/turm.js');
const MQ = require('../src/logic.js');
const t0 = Date.now();
const fails = [];
const check = (cond, msg, x) => { if (!cond && fails.length < 20) fails.push(msg + (x === undefined ? '' : ' ' + JSON.stringify(x).slice(0, 300))); };

const seeded = (s) => () => { s = (s + 0x6D2B79F5) | 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
const UNITS = {
  math: { subject: 'Mathe', worlds: 3, ks: ['add', 'sub', 'mul', 'div'] },
  bau: { subject: 'Mathe', worlds: 2, ks: ['flaeche', 'umfang'] },
  wort: { subject: 'Deutsch', worlds: 1, ks: ['doppel', 'abc', 'wortart'] },
  satz: { subject: 'Deutsch', worlds: 1, ks: ['zeit'] },
  kart: { subject: 'Sachkunde', worlds: 2, ks: ['teile', 'lager'] },
  wiese: { subject: 'Sachkunde', worlds: 1, ks: ['bluete'] },
  wetter: { subject: 'Sachkunde', worlds: 1, ks: ['wolke', 'regen'] },
  ethik: { subject: 'Ethik', worlds: 1, ks: ['regel'] },
  musik: { subject: 'Musik', worlds: 1, ks: ['note'] },
  tee: { subject: 'Englisch', worlds: 1, ks: ['words'] },
};
const sourcesOf = (sub) => Object.entries(UNITS).filter(([, u]) => u.subject === sub).flatMap(([m, u]) => u.ks.map((k) => ({ m, k })));
const DMG = [10, 12, 12, 14];
const makeCtx = (seed, o = {}) => ({
  rnd: seeded(seed), heroType: 'feuer',
  enemies: (m, w) => (m === 'wiese' ? MQ.ENEMIES[1] : MQ.ENEMIES[Math.min(3, w)]),
  worlds: (m) => UNITS[m].worlds,
  dmg: (m, k) => DMG[(m.length + k.length) % DMG.length],
  ...o,
});
const start = (subjects = ['Mathe', 'Deutsch', 'Sachkunde'], grade = 3, ctx = makeCtx(1)) => TW.newRun({ grade, lanes: TW.lanesFor(subjects, sourcesOf), hero: { m: 'math', id: 'fuchs' } }, ctx);
// put a run on an empty board in the given wave (queue cleared) for hand-made situations
const board = (run, wave, ctx) => { run.turm.phase = 'build'; run.turm.wave = wave - 1; TW.nextWave(run, ctx); run.turm.monsters = []; run.turm.queue = []; return run; };
let nid = 1000;
const mon = (run, lane, cell, o = {}) => { const x = { id: nid++, lane, cell, m: run.turm.lanes[lane].src[0].m, k: run.turm.lanes[lane].src[0].k, name: 'Regenwicht', shape: 'regenwicht', type: 'wasser', world: 1, hp: 20, maxHp: 20, steps: 1, slow: 0, stun: 0, ...o }; run.turm.monsters.push(x); return x; };
const hit = (run, id, ok, ctx, info) => { if (run.turm.phase === 'step') run.turm.phase = 'choose'; check(TW.ask(run, id), 'ask', id); return TW.answer(run, ok, ctx, info); };
const TD = TW.TOWER_DMG, towerDmg = (wave, kind) => ((kind === 'boss' ? TD.boss : TD.normal) + TD.wave * wave) * (kind === 'elite' ? TD.elite : 1);
const cellsOk = (run) => { const seen = new Set(); for (const x of run.turm.monsters) { const k = x.lane + ':' + x.cell; if (seen.has(k) || x.cell < 1 || x.cell > TW.CELLS) return false; seen.add(k); } return true; };

// --- lanes ---
{
  check(TW.lanesFor(['Mathe', 'Deutsch', 'Sachkunde'], sourcesOf).map((l) => l.subject).join() === 'Mathe,Deutsch,Sachkunde', '3 subjects → 3 lanes');
  check(TW.lanesFor(['Mathe', 'Deutsch'], sourcesOf).length === 2, '2 subjects → 2 lanes');
  check(TW.lanesFor(['Mathe', 'Deutsch', 'Sachkunde', 'Ethik'], sourcesOf).length === 3, 'at most 3 lanes');
  const s = TW.lanesFor(['Sachkunde'], sourcesOf);
  check(s.length === 3 && s.every((l) => new Set(l.src.map((x) => x.m)).size === 1), '1 subject with 3 units → one lane per unit', s);
  const m = TW.lanesFor(['Mathe'], sourcesOf);
  check(m.length === 3 && m.every((l) => l.subject === 'Mathe' && l.src.length) && m.flatMap((l) => l.src).length === 6, '1 subject with 2 units → split by task type over 3 lanes', m);
  const d = TW.lanesFor(['Ethik'], (x) => (x === 'Ethik' ? [{ m: 'ethik', k: 'a' }, { m: 'ethik', k: 'b' }] : []));
  check(d.length === 2, '1 subject with 2 task types → 2 lanes', d);
  check(TW.lanesFor(['Nichts', 'Deutsch'], sourcesOf).every((l) => l.subject === 'Deutsch'), 'subjects without sources are dropped');
  check(JSON.stringify(TW.BEATS) === JSON.stringify(MQ.BEATS), 'BEATS = MQ.BEATS');
}

// --- wave building ---
{
  const ctx = makeCtx(2), run = start(undefined, 3, ctx), t = run.turm;
  check(t.wave === 1 && t.phase === 'choose' && t.monsters.length === 1 && t.monsters[0].cell === 5 && t.queue.length === 3, 'wave 1: 3 + 1 monsters, one on the board', t);
  check(run.hero.hp === 60 && run.items.join() === 'trank' && t.ziegel === 0, 'start values');
  check(JSON.stringify(JSON.parse(JSON.stringify(run))) === JSON.stringify(run), 'run is plain JSON');
  // wave 1 is guided: the next monster only comes when the board is empty
  const ev = TW.step(run, ctx);
  check(!ev.some((e) => e.t === 'enter') && t.monsters.length === 1, 'wave 1: no second monster while one is on the board', ev);
  t.monsters = []; t.phase = 'step';
  check(TW.step(run, ctx).filter((e) => e.t === 'enter').length === 1, 'wave 1: next monster enters on an empty board');
  // monsters are spread so every lane gets questions, plus one extra on the weakest lane
  const c2 = makeCtx(3, { acc: (l) => (l.subject === 'Mathe' ? 0.3 : 0.8) }), r2 = start(undefined, 3, c2);
  const perLane = (r) => { const all = r.turm.monsters.concat(r.turm.queue); return [0, 1, 2].map((i) => all.filter((x) => x.lane === i).length); };
  r2.turm.phase = 'build'; r2.turm.monsters = []; r2.turm.queue = []; TW.nextWave(r2, c2);
  check(perLane(r2).join() === '3,2,1', 'wave 2: 5 spread + 1 on the weakest lane', perLane(r2));
  const s1 = r2.turm.lanes[1].src[0]; r2.turm.used[s1.m + ':' + s1.k] = 3;
  r2.turm.phase = 'build'; r2.turm.wave = 1; r2.turm.monsters = []; r2.turm.queue = []; TW.nextWave(r2, c2);
  check(perLane(r2).join() === '3,1,2', 'a lane with many questions gets fewer monsters', perLane(r2));
  const all = r2.turm.monsters.concat(r2.turm.queue);
  check(all.every((x) => Number.isInteger(x.hp) && x.hp >= 1 && x.hp === x.maxHp), 'whole-number monster HP');
  // wave 4 has fast monsters in Klasse 3, none in Klasse 2; Klasse 2 has × 0.8 monsters, at least 2
  const r3 = board(start(undefined, 3, makeCtx(4)), 3, makeCtx(4)); r3.turm.phase = 'build'; r3.turm.wave = 3; TW.nextWave(r3, makeCtx(4));
  check(r3.turm.monsters.concat(r3.turm.queue).filter((x) => x.steps === 2).length === 2, 'wave 4: every third monster is fast');
  for (let w = 1; w <= 6; w++) {
    const c = makeCtx(5), r = start(undefined, 2, c); r.turm.phase = 'build'; r.turm.wave = w - 1; r.turm.monsters = []; r.turm.queue = []; TW.nextWave(r, c);
    const q = r.turm.monsters.concat(r.turm.queue), normals = q.filter((x) => !x.boss && !x.elite);
    check(normals.length === Math.max(2, Math.round(TW.WAVES[w - 1].n * 0.8)) + 1, 'Klasse 2: × 0.8 monsters (min 2) + weakest-lane extra', [w, normals.length]);
    check(q.every((x) => x.steps === 1), 'Klasse 2: no fast monsters', w);
  }
  // wave 3 boss, wave 5 elite, wave 6 final boss on another lane than the wave-3 boss, one shield per lane
  const c4 = makeCtx(6), r4 = start(undefined, 3, c4), t4 = r4.turm;
  const kinds = [];
  for (let w = 2; w <= 6; w++) { t4.phase = 'build'; t4.monsters = []; t4.queue = []; TW.nextWave(r4, c4); kinds.push(t4.monsters.concat(t4.queue).filter((x) => x.boss || x.elite).map((x) => (x.final ? 'final' : x.boss ? 'boss' : 'elite')).join()); }
  check(kinds.join('|') === '|boss||elite|final', 'specials per wave', kinds);
  const fin = t4.monsters.concat(t4.queue).find((x) => x.final);
  check(fin.lane !== t4.boss3.lane && fin.shields.length === 3 && fin.hp === fin.part * 3 && fin.name !== t4.boss3.name, 'final boss: other lane, a different boss, one shield per lane', fin);
}

// --- movement: one monster per cell, queue waits for cell 5, boss gate, slow rhythm, stun ---
{
  const ctx = makeCtx(7), run = board(start(undefined, 3, ctx), 2, ctx), t = run.turm;
  const a = mon(run, 0, 3, { stun: 1 }), b = mon(run, 0, 4), c = mon(run, 0, 5, { stun: 1 });
  t.queue = [{ ...b, id: 50, lane: 0, cell: 0 }, { ...b, id: 51, lane: 1, cell: 0 }];
  t.phase = 'step'; const ev = TW.step(run, ctx);
  check(a.cell === 3 && b.cell === 4 && c.cell === 5 && cellsOk(run), 'blocked monsters wait behind a stopped one', ev);
  check(ev.some((e) => e.t === 'stunned' && e.id === a.id) && a.stun === 0, 'a stopped monster skips one turn', ev);
  check(t.queue.length === 1 && t.queue[0].id === 50 && t.monsters.some((x) => x.id === 51 && x.cell === 5), 'queue waits for its own cell 5, others enter', t.queue);
  // boss: moves on every second turn, stops at the gate and keeps hitting in the same rhythm, monsters behind wait
  const r2 = board(start(undefined, 3, ctx), 3, ctx), t2 = r2.turm;
  const boss = mon(r2, 1, 2, { boss: true, hp: 90, maxHp: 90 }), behind = mon(r2, 1, 3);
  const seq = [];
  for (let i = 0; i < 5; i++) { t2.phase = 'step'; const e = TW.step(r2, ctx); seq.push(boss.cell + (e.some((x) => x.t === 'tower' && x.id === boss.id) ? 'H' : '')); }
  check(seq.join() === '1,1,1H,1,1H', 'boss walks every second turn and hits at the gate every second turn', seq);
  check(behind.cell === 2 && t2.monsters.includes(boss), 'monsters behind the boss at the gate wait');
  check(r2.hero.hp === 60 - 2 * towerDmg(3, 'boss'), 'boss damage', r2.hero.hp);
  // a normal monster past cell 1 hits once and disappears
  const r3 = board(start(undefined, 3, ctx), 2, ctx), x = mon(r3, 0, 1);
  r3.turm.phase = 'step'; const e3 = TW.step(r3, ctx);
  check(e3.some((e) => e.t === 'tower' && e.id === x.id && e.dmg === towerDmg(2) && e.gone) && !r3.turm.monsters.includes(x), 'normal monster hits once and is gone', e3);
  const f = mon(r3, 0, 3, { steps: 2 }); r3.turm.phase = 'step'; TW.step(r3, ctx);
  check(f.cell === 1, 'fast monster walks 2 cells');
  // elite hits double
  const r4 = board(start(undefined, 3, ctx), 5, ctx); mon(r4, 0, 1, { elite: true }); r4.turm.phase = 'step';
  check(TW.step(r4, ctx).find((e) => e.t === 'tower').dmg === towerDmg(5, 'elite') && towerDmg(5, 'elite') === 2 * towerDmg(5), 'elite hits double');
}

// --- fairness: wave 1 floor, catch-up, item shield ---
{
  const ctx = makeCtx(8), run = board(start(undefined, 3, ctx), 1, ctx);
  run.hero.hp = 3; mon(run, 0, 1); run.turm.phase = 'step';
  let ev = TW.step(run, ctx);
  check(run.hero.hp === 1 && ev.find((e) => e.t === 'tower').dmg === 2, 'wave 1: tower keeps 1 ❤️', ev);
  mon(run, 0, 1); run.turm.phase = 'step'; ev = TW.step(run, ctx);
  check(run.hero.hp === 1 && ev.some((e) => e.t === 'hold') && run.turm.phase !== 'fallen', 'wave 1: tower holds at 1 ❤️', ev);
  const r2 = board(start(undefined, 3, ctx), 4, ctx); r2.turm.score = { Mathe: { c: 4, t: 8 } }; mon(r2, 0, 1); r2.turm.phase = 'step';
  check(TW.step(r2, ctx).find((e) => e.t === 'tower').dmg === Math.ceil(towerDmg(4) / 2), 'catch-up: half damage rounded up below 60 % after 8 answers');
  r2.turm.score = { Mathe: { c: 4, t: 7 } }; mon(r2, 0, 1); r2.turm.phase = 'step';
  check(TW.step(r2, ctx).find((e) => e.t === 'tower').dmg === towerDmg(4), 'no catch-up before 8 answers');
  r2.turm.score = { Mathe: { c: 5, t: 8 } }; mon(r2, 0, 1); r2.turm.phase = 'step';
  check(TW.step(r2, ctx).find((e) => e.t === 'tower').dmg === towerDmg(4), 'no catch-up at 60 % or more');
  r2.shield = true; mon(r2, 0, 1); r2.turm.phase = 'step'; const hp = r2.hero.hp;
  check(TW.step(r2, ctx).some((e) => e.t === 'block') && r2.hero.hp === hp && !r2.shield, 'item shield blocks the next monster at the tower');
  // the tower falls from wave 2 on
  r2.hero.hp = 2; mon(r2, 1, 1); r2.turm.phase = 'step';
  check(TW.step(r2, ctx).some((e) => e.t === 'fallen') && r2.turm.phase === 'fallen' && r2.hero.hp === 0, 'tower falls at 0 ❤️');
}

// --- elite protection, hero damage, 🎯, guards ---
{
  const ctx = makeCtx(9), run = board(start(undefined, 3, ctx), 5, ctx), t = run.turm;
  const lead = mon(run, 0, 2, { hp: 50, maxHp: 50 }), elite = mon(run, 0, 3, { elite: true, hp: 75, maxHp: 75 }), back = mon(run, 0, 4);
  check(TW.canTarget(run, lead.id) && TW.canTarget(run, elite.id) && !TW.canTarget(run, back.id), 'elite protects the monsters behind it');
  check(TW.card(run, back.id, ctx).blockedBy === elite.id && TW.ask(run, back.id) === null && t.phase === 'choose', 'protected monster can’t be asked; card names the elite');
  t.guards['0:0'] = { look: 'fuchs', type: 'feuer', lvl: 1 };
  const ev = hit(run, elite.id, true, ctx);
  check(ev.find((e) => e.t === 'shot').id === lead.id, 'guards hit the front monster anyway', ev);
  // hero damage: module dmg + 3 × stage + 2 × (wave − 1), × 1.5 strong, × 1.5 🎯, × 2 Chilischote
  const r2 = board(start(undefined, 3, ctx), 3, ctx);
  const plant = mon(r2, 0, 3, { type: 'pflanze', hp: 500, maxHp: 500 }), base = ctx.dmg(plant.m, plant.k);
  r2.hero.evo = 1; r2.turm.weak = null; r2.turm.phase = 'choose';
  check(TW.card(r2, plant.id, ctx).dmg === Math.round((base + 3 + 4) * 1.5), 'hero damage formula, strong', TW.card(r2, plant.id, ctx));
  r2.turm.weak = plant.id; r2.power = true;
  const e2 = hit(r2, plant.id, true, ctx), h = e2.find((e) => e.t === 'hit');
  check(h.dmg === Math.round((base + 7) * 1.5 * 1.5 * 2) && h.weak && h.strong && !r2.power, '🎯 × 1.5 and Chilischote × 2 (used up)', h);
  check(e2.filter((e) => e.t === 'ziegel').map((e) => e.why).join() === 'right,weak' && r2.turm.ziegel === 2, '🎯 gives double Ziegel', e2);
  // 🎯: exactly one, front monster of the least practised lane
  const r3 = board(start(undefined, 3, ctx), 2, ctx), t3 = r3.turm;
  mon(r3, 0, 2); const w1 = mon(r3, 1, 3), w1b = mon(r3, 1, 5); mon(r3, 2, 1);
  for (const s of t3.lanes[0].src.concat(t3.lanes[2].src)) t3.used[s.m + ':' + s.k] = 2;
  t3.phase = 'step'; TW.step(r3, ctx);
  check(t3.weak === w1.id && w1b.id !== t3.weak, '🎯 on the front monster of the least practised lane', t3.weak);
  // guard damage: 4 / 7 / 10, × 1.5 if its type beats the monster's; normal-type guards no bonus
  const r4 = board(start(undefined, 3, ctx), 2, ctx), y = mon(r4, 1, 4, { type: 'pflanze', hp: 500, maxHp: 500 }), z = mon(r4, 1, 2, { type: 'normal', hp: 500, maxHp: 500 });
  r4.turm.guards = { '1:0': { look: 'fuchs', type: 'feuer', lvl: 3 }, '1:1': { look: 'boss', type: 'normal', lvl: 2 } };
  const e4 = hit(r4, y.id, true, ctx).filter((e) => e.t === 'shot');
  check(e4.map((e) => e.id + ':' + e.dmg).join() === `${z.id}:10,${z.id}:7`, 'guards fire at the front monster of their lane', e4);
  z.type = 'pflanze'; r4.turm.phase = 'step'; TW.step(r4, ctx); r4.turm.phase = 'choose';
  const e5 = hit(r4, y.id, true, ctx).filter((e) => e.t === 'shot');
  check(e5[0].dmg === 15 && e5[0].strong && e5[1].dmg === 7, 'guard type bonus × 1.5', e5);
  // wrong answer: nothing fires, no Ziegel
  const e6 = hit(r4, y.id, false, ctx);
  check(!e6.some((e) => e.t === 'shot' || e.t === 'hit' || e.t === 'ziegel') && r4.turm.phase === 'step', 'wrong: nothing fires', e6);
  // a right answer moves the monster to another source of its lane
  const r5 = board(start(['Mathe'], 3, ctx), 2, ctx), q = mon(r5, 0, 3, { hp: 500, maxHp: 500 }), k0 = q.k;
  hit(r5, q.id, true, ctx);
  check(r5.turm.lanes[0].src.length < 2 || q.k !== k0, 'next question from another source of the lane', [k0, q.k]);
}

// --- final boss shields ---
{
  const ctx = makeCtx(10, { dmg: () => 1 }), run = board(start(undefined, 3, ctx), 6, ctx), t = run.turm;
  for (const s of t.lanes[0].src) t.used[s.m + ':' + s.k] = 5;
  for (const s of t.lanes[1].src) t.used[s.m + ':' + s.k] = 3;
  t.phase = 'build'; t.wave = 5; t.monsters = []; t.queue = []; TW.nextWave(run, ctx);
  const b = t.monsters.concat(t.queue).find((x) => x.final);
  t.queue = []; t.monsters = [b]; b.cell = 3;
  check(b.shields.join() === '2,1,0', 'shields least practised lane first', b.shields);
  check(t.lanes[2].src.some((s) => s.m === b.m && s.k === b.k), 'the boss asks a question of its current shield’s lane', b);
  const lead = mon(run, 2, 1, { hp: 500, maxHp: 500 });
  t.guards['2:0'] = { look: 'kroete', type: 'wasser', lvl: 1 };
  t.guards[b.lane + ':1'] = { look: 'baer', type: 'pflanze', lvl: 1 };
  let ev = hit(run, b.id, true, ctx);
  check(ev.filter((e) => e.t === 'shot').every((e) => e.id === b.id) && ev.some((e) => e.t === 'shot' && e.from === '2:0'), 'shield lane guards fire at the boss, not their own front monster', ev);
  check(lead.hp === 500, 'front monster of the shield lane untouched');
  // a huge hit only breaks the current shield
  ctx.dmg = () => 999; t.phase = 'step'; TW.step(run, ctx); t.phase = 'choose'; t.monsters = [b];
  ev = hit(run, b.id, true, ctx);
  check(ev.some((e) => e.t === 'shield' && e.lane === 2) && b.hp === b.part * 2 && b.shields.length === 2, 'one answer breaks one shield', ev);
  check(t.lanes[b.shields[0]].src.some((s) => s.m === b.m && s.k === b.k), 'next question from the next shield’s lane', [b.shields, b.m, b.k]);
  check(ev.filter((e) => e.dmg !== undefined).every((e) => Number.isInteger(e.dmg) && e.dmg >= 1), 'no 0-damage events after the break', ev);
  // a hit on another lane than the current shield's never touches the boss (guards, Rechenstube)
  const other = [0, 1, 2].find((i) => i !== b.shields[0] && i !== b.lane) ?? [0, 1, 2].find((i) => i !== b.shields[0]);
  const foe = mon(run, other, 1, { hp: 500, maxHp: 500 }), hp = b.hp;
  t.guards = { [other + ':0']: { look: 'fuchs', type: 'feuer', lvl: 3 } }; t.floors = [t.lanes[other].subject];
  ev = hit(run, foe.id, true, ctx);
  check(b.hp === hp && !ev.some((e) => e.id === b.id), 'other lanes don’t hurt the shielded boss', ev);
  t.monsters = [b]; hit(run, b.id, true, ctx);
  ev = hit(run, b.id, true, ctx);
  check(ev.some((e) => e.t === 'beaten' && e.id === b.id), 'last shield: boss beaten', ev);
}

// --- 🔁 returning questions ---
{
  const ctx = makeCtx(11), run = board(start(undefined, 3, ctx), 2, ctx), t = run.turm;
  const x = mon(run, 0, 4, { hp: 500, maxHp: 500 }), y = mon(run, 1, 4, { hp: 500, maxHp: 500 }), z = mon(run, 2, 4, { hp: 500, maxHp: 500 });
  const small = { kind: 'choice', q: 'Welches Wort?', options: ['a', 'b'], answer: 'a', tier: 2 };
  const big = { kind: 'choice', fig: '<svg>' + 'x'.repeat(9000) + '</svg>', options: ['a', 'b'], answer: 'a', tier: 1 };
  const num = { kind: 'num', text: '3 + 4', answers: [7], tier: 1 };
  hit(run, x.id, false, ctx, { task: small, tier: 2 }); t.phase = 'choose';
  hit(run, x.id, false, ctx, { task: small, tier: 2 }); t.phase = 'choose';
  check(t.again.length === 1 && t.again[0].task.q === small.q && t.again[0].tier === 2, 'no duplicates; small knowledge task stored', t.again);
  hit(run, y.id, false, ctx, { task: big }); t.phase = 'choose';
  check(t.again.length === 2 && !t.again[1].task && t.again[1].m === y.m, 'big picture task falls back to re-roll of the same unit/type/tier', t.again[1]);
  hit(run, z.id, false, ctx, { task: num }); t.phase = 'choose';
  check(t.again.length === 3 && !t.again[2].task, 'number tasks come back with new numbers');
  x.k = t.lanes[0].src[1].k; hit(run, x.id, false, ctx, { task: small });
  check(t.again.length === 3, 'at most 3 entries');
  // next wave: the first monsters carry 🔁 with their entries, each once
  t.phase = 'build'; t.monsters = []; t.queue = []; TW.nextWave(run, ctx);
  const q = t.monsters.concat(t.queue).sort((a, b) => a.id - b.id), carriers = q.filter((m) => m.again);
  check(t.again.length === 0 && carriers.length === 3 && q.slice(0, 3).every((m) => m.again), 'first monsters of the next wave carry 🔁', carriers.length);
  check(carriers[0].m === x.m && carriers[0].lane === 0 && carriers[0].again.task.q === small.q, '🔁 monster asks the same unit/type on the same lane', carriers[0]);
  const c0 = carriers[0]; t.monsters = [c0]; c0.cell = 5;
  const a = TW.ask(run, c0.id);
  check(a.again && a.again.task.q === small.q, 'ask hands the stored task back');
  TW.answer(run, false, ctx, { task: small });
  check(!c0.again && t.again.length === 0, '🔁 comes back once: a wrong answer doesn’t add it again', t.again);
}

// --- Bauzeit: income, costs, free first guard, floors, reward, evolution ---
{
  const ctx = makeCtx(12), run = start(undefined, 3, ctx), t = run.turm;
  // clear wave 1 without damage: +3 wave +2 clean
  t.monsters = []; t.queue = []; t.phase = 'step';
  let ev = TW.step(run, ctx);
  check(ev.filter((e) => e.t === 'ziegel').map((e) => e.why + e.n).join() === 'wave3,clean2' && t.phase === 'build' && t.cp, 'wave income and Bauzeit with checkpoint', ev);
  t.ziegel = 30;
  const g = { kind: 'guard', lane: 0, spot: 0, look: 'fuchs', type: 'feuer' };
  check(TW.price(run, g) === 0 && TW.buy(run, g) && t.ziegel === 30, 'first guard is free in the first Bauzeit');
  check(TW.price(run, { ...g, spot: 1 }) === 4 && TW.buy(run, { ...g, spot: 1 }) && t.ziegel === 26, 'second guard costs 4');
  check(TW.price(run, { ...g, spot: 2 }) === -1 && TW.price(run, { ...g, lane: 3 }) === -1, 'only 2 spots per lane, only existing lanes');
  const up = { kind: 'up', lane: 0, spot: 0 };
  check(TW.price(run, up) === 6 && TW.buy(run, up) && TW.price(run, up) === 9 && TW.buy(run, up) && TW.price(run, up) === -1 && t.guards['0:0'].lvl === 3 && t.ziegel === 11, 'upgrade 6 → 9, max level 3');
  check(TW.price(run, { kind: 'floor', subject: 'Musik' }) === -1, 'only floors for subjects on the lanes');
  check(TW.price(run, { kind: 'floor', subject: 'Mathe' }) === 8 && TW.buy(run, { kind: 'floor', subject: 'Mathe' }) && TW.price(run, { kind: 'floor', subject: 'Mathe' }) === -1 && t.ziegel === 3, 'floor 8, once');
  check(TW.price(run, { kind: 'fix' }) === -1, 'no repair on a whole tower');
  run.hero.hp = 55;
  check(TW.buy(run, { kind: 'floor', subject: 'Deutsch' }) === null && t.ziegel === 3, 'can’t buy without enough Ziegel');
  check(TW.price(run, { kind: 'fix' }) === 3 && TW.buy(run, { kind: 'fix' }) && run.hero.hp === 60 && t.ziegel === 0, 'repair 3 Ziegel, +10 ❤️ up to max');
  t.ziegel = 4; t.phase = 'choose';
  check(TW.buy(run, g) === null && t.ziegel === 4, 'nothing to buy outside Bauzeit');
  // free guard only in the first Bauzeit
  const r2 = start(undefined, 3, ctx); r2.turm.phase = 'build'; TW.nextWave(r2, ctx); r2.turm.phase = 'build';
  check(TW.price(r2, g) === 4, 'no free guard after the first Bauzeit');
  // boss wave: Großer Trank + choice of two, evolution, then Bauzeit
  const r3 = board(start(undefined, 3, ctx), 3, ctx); r3.turm.phase = 'step';
  ev = TW.step(r3, ctx);
  check(r3.turm.phase === 'reward' && r3.items.includes('grosstrank') && r3.turm.offer.length === 2 && r3.turm.offer[0] !== r3.turm.offer[1] && r3.hero.evo === 1, 'boss wave reward and evolution', ev);
  const pickd = r3.turm.offer[1];
  check(TW.takeReward(r3, 1) && r3.items[r3.items.length - 1] === pickd && r3.turm.phase === 'build' && r3.turm.cp, 'reward taken, Bauzeit with checkpoint');
  const r4 = board(start(undefined, 3, ctx), 6, ctx); r4.hero.evo = 1; r4.turm.phase = 'step';
  check(TW.step(r4, ctx).some((e) => e.t === 'won') && r4.turm.phase === 'won' && r4.hero.evo === 2, 'wave 6 cleared: victory, hero evolves');
}

// --- floor effects ---
{
  const ctx = makeCtx(13);
  const floor = (subjects, sub, setup) => { const run = board(start(subjects, 3, ctx), 2, ctx); run.turm.floors = [sub]; const s = setup(run); const ev = hit(run, s.x.id, true, ctx); return { run, ev, ...s }; };
  let r = floor(['Mathe', 'Deutsch', 'Sachkunde'], 'Mathe', (run) => ({ x: mon(run, 0, 3, { hp: 500, maxHp: 500 }), y: mon(run, 1, 4, { hp: 500, maxHp: 500 }), own: mon(run, 0, 5, { hp: 500, maxHp: 500 }) }));
  const h = r.ev.find((e) => e.t === 'hit'), ch = r.ev.find((e) => e.t === 'chain');
  check(ch && ch.id === r.y.id && ch.dmg === Math.max(1, Math.round(h.dmg / 2)) && r.own.hp === 500, 'Rechenstube: half damage to the front monster of the next lane', r.ev);
  r = floor(['Deutsch', 'Sachkunde', 'Mathe'], 'Mathe', (run) => ({ x: mon(run, 2, 3, { hp: 500, maxHp: 500 }), y: mon(run, 0, 4, { hp: 500, maxHp: 500 }) }));
  check(r.ev.find((e) => e.t === 'chain').id === r.y.id, 'Rechenstube wraps around');
  r = floor(['Ethik', 'Mathe'], 'Ethik', (run) => ({ x: mon(run, 0, 3, { hp: 500, maxHp: 500 }) }));
  r.run.turm.phase = 'step'; TW.step(r.run, ctx);
  check(r.x.cell === 3 && r.ev.some((e) => e.t === 'stun'), 'Druckerei: the hit monster stops one turn');
  TW.step(r.run, ctx); check(r.x.cell === 2, 'Druckerei: walks again after');
  r = floor(['Sachkunde'], 'Sachkunde', (run) => { run.hero.hp = 50; return { x: mon(run, 0, 3, { hp: 500, maxHp: 500 }) }; });
  check(r.run.hero.hp === 52 && r.ev.some((e) => e.t === 'heal' && e.n === 2), 'Kartoffelkeller: +2 ❤️');
  r = floor(['Deutsch', 'Mathe'], 'Deutsch', (run) => ({ x: mon(run, 0, 3, { hp: 500, maxHp: 500 }) }));
  check(r.run.turm.ziegel === 2 && r.ev.some((e) => e.t === 'ziegel' && e.why === 'floor'), 'Schreibstube: +1 Ziegel');
  r = floor(['Musik', 'Mathe'], 'Musik', (run) => ({ x: mon(run, 0, 3, { hp: 500, maxHp: 500 }), f: mon(run, 0, 1, { hp: 500, maxHp: 500 }) }));
  check(r.f.cell === 2 && r.ev.some((e) => e.t === 'push' && e.id === r.f.id), 'Glockenstube: front monster steps back', r.ev);
  r = floor(['Musik', 'Mathe'], 'Musik', (run) => ({ x: mon(run, 0, 1, { hp: 500, maxHp: 500 }), f: mon(run, 0, 2, { hp: 500, maxHp: 500 }) }));
  check(r.x.cell === 1, 'Glockenstube: no step back onto a taken cell');
  r = floor(['Englisch', 'Mathe'], 'Englisch', (run) => { run.turm.guards['0:0'] = { look: 'fuchs', type: 'normal', lvl: 1 }; return { x: mon(run, 0, 3, { hp: 500, maxHp: 500 }) }; });
  check(r.ev.filter((e) => e.t === 'shot').length === 2, 'Englisch floor: guards fire twice', r.ev);
  r = floor(['Mathe', 'Deutsch'], 'Deutsch', (run) => ({ x: mon(run, 0, 3, { hp: 500, maxHp: 500 }) }));
  check(!r.ev.some((e) => e.t === 'floor'), 'floor only fires for its own subject');
}

// --- checkpoint: refreshed every Bauzeit, usable twice, answers stay ---
{
  const ctx = makeCtx(14), run = start(undefined, 3, ctx), t = run.turm;
  t.monsters = []; t.queue = []; t.phase = 'step'; TW.step(run, ctx);
  t.ziegel = 9; TW.buy(run, { kind: 'guard', lane: 1, spot: 0, look: 'baer', type: 'pflanze' });
  TW.nextWave(run, ctx); t.monsters = []; t.queue = []; t.phase = 'step'; TW.step(run, ctx);
  check(t.phase === 'build' && t.cp && t.cp.turm.wave === 2 && !('cp' in t.cp.turm) && !('score' in t.cp.turm), 'snapshot at the start of Bauzeit, without what stays outside', t.cp && t.cp.turm.wave);
  const zg = t.ziegel;
  TW.nextWave(run, ctx); t.score = { Mathe: { c: 3, t: 9 } }; t.used = { 'math:add': 4 };
  TW.buy(run, { kind: 'fix' }); t.ziegel = 0; t.guards = {}; run.items = [];
  t.phase = 'step'; run.hero.hp = 1; mon(run, 0, 1); TW.step(run, ctx);
  check(t.phase === 'fallen' && TW.canRetry(run), 'fallen with checkpoint');
  check(TW.retry(run) && run.turm.phase === 'build' && run.turm.wave === 2 && run.turm.ziegel === zg && run.turm.guards['1:0'] && run.items.length && run.hero.hp === 60, 'retry restores the last Bauzeit with a repaired tower', run.turm);
  check(run.turm.cpUsed === 1 && run.turm.best === 3 && run.turm.score.Mathe.t === 9 && run.turm.used['math:add'] === 4 && run.turm.cp, 'cpUsed, record, answers and practice counts stay', run.turm);
  const fall = () => { TW.nextWave(run, ctx); run.turm.phase = 'step'; run.hero.hp = 1; mon(run, 0, 1); TW.step(run, ctx); };
  fall(); check(TW.retry(run) && run.turm.cpUsed === 2, 'second retry');
  fall(); check(run.turm.phase === 'fallen' && !TW.canRetry(run) && !TW.retry(run), 'no third retry');
}

// --- bot: full runs through the API only ---
const play = (acc, seed, grade = 3, subjects = ['Mathe', 'Deutsch', 'Sachkunde']) => {
  const rnd = seeded(seed * 7919 + Math.round(acc * 100)), right = {}, total = {};
  const ctx = makeCtx(seed, { acc: (l) => (total[l.subject] ? right[l.subject] / total[l.subject] : 0.6) });
  const run = TW.newRun({ grade, lanes: TW.lanesFor(subjects, sourcesOf), hero: { m: 'math', id: 'fuchs' } }, ctx), t = () => run.turm;
  let questions = 0, hurt = 0, pass = 0, maxPass = 0, guard = 0, reached = 1, lanesAsked = {};
  const looks = [['fuchs', 'feuer'], ['kroete', 'wasser'], ['baer', 'pflanze']];
  const checkEv = (ev) => {
    for (const e of ev) if (e.t === 'tower') hurt += e.dmg;
    for (const e of ev) if ('dmg' in e || e.t === 'heal') check(Number.isInteger(e.dmg ?? e.n) && (e.dmg ?? e.n) >= 1, 'whole-number damage ≥ 1', e);
    check(cellsOk(run), 'never two monsters on a cell', t().monsters);
    check(Number.isInteger(run.hero.hp) && run.hero.hp >= 0 && run.hero.hp <= run.hero.maxHp, 'tower HP whole and in range', run.hero.hp);
  };
  while (guard++ < 3000) {
    const ph = t().phase;
    reached = Math.max(reached, t().wave);
    if (ph === 'choose') {
      if (run.hero.hp < 20 && run.items.some((i) => i === 'trank' || i === 'grosstrank')) {
        const i = run.items.findIndex((x) => x === 'trank' || x === 'grosstrank');
        run.hero.hp = Math.min(run.hero.maxHp, run.hero.hp + (run.items[i] === 'trank' ? 30 : 60)); run.items.splice(i, 1);
        checkEv(TW.step(run, ctx)); continue;
      }
      const ms = t().monsters.filter((x) => TW.canTarget(run, x.id)).sort((a, b) => a.cell - b.cell);
      const x = ms.find((y) => y.id === t().weak) || ms[0];
      check(x, 'something to target', t());
      const a = TW.ask(run, x.id), ok = rnd() < acc, sub = t().lanes[a.lane].subject;
      total[sub] = (total[sub] || 0) + 1; if (ok) right[sub] = (right[sub] || 0) + 1;
      lanesAsked[a.lane] = (lanesAsked[a.lane] || 0) + 1;
      checkEv(TW.answer(run, ok, ctx, { task: { kind: 'choice', q: 'Frage ' + questions, options: ['a', 'b'], answer: 'a' }, tier: 1 }));
      questions++; pass++; maxPass = Math.max(maxPass, pass);
      checkEv(TW.step(run, ctx));
      if (!['choose', 'build', 'reward', 'fallen', 'won'].includes(t().phase)) check(false, 'phase after step', t().phase);
    } else if (ph === 'reward') TW.takeReward(run, 0);
    else if (ph === 'build') {
      const L = t().lanes.length, cards = [];
      for (let l = 0; l < L; l++) for (let s = 0; s < TW.SPOTS; s++) { const lk = looks[(l + s) % 3]; cards.push(t().guards[l + ':' + s] ? { kind: 'up', lane: l, spot: s } : { kind: 'guard', lane: l, spot: s, look: lk[0], type: lk[1] }); }
      for (const l of t().lanes) cards.push({ kind: 'floor', subject: l.subject });
      for (let n = 0; n < 20; n++) {
        if (run.hero.hp < 40 && TW.buy(run, { kind: 'fix' })) continue;
        const c = cards.filter((c) => TW.price(run, c) >= 0 && TW.price(run, c) <= t().ziegel && !(c.kind === 'guard' && t().guards[c.lane + ':' + c.spot])).sort((a, b) => TW.price(run, a) - TW.price(run, b))[0];
        if (!c || !TW.buy(run, c)) break;
        if (c.kind === 'guard') cards[cards.indexOf(c)] = { kind: 'up', lane: c.lane, spot: c.spot };
      }
      check(JSON.stringify(JSON.parse(JSON.stringify(run))) === JSON.stringify(run), 'plain JSON');
      checkEv(TW.nextWave(run, ctx));
    } else if (ph === 'fallen') { if (!TW.retry(run)) break; pass = 0; }
    else if (ph === 'won') break;
    else { check(false, 'unknown phase', ph); break; }
  }
  check(JSON.stringify(JSON.parse(JSON.stringify(run))) === JSON.stringify(run), 'plain JSON');
  check(guard < 3000, 'run terminates', { acc, seed });
  const per = Object.values(lanesAsked).map((n) => n / questions);
  return { won: t().phase === 'won', best: t().best, questions, hurt, maxPass, retries: t().cpUsed, minShare: Math.min(...per) };
};

const rows = [];
for (const [grade, subjects, N] of [[3, ['Mathe', 'Deutsch', 'Sachkunde'], 200], [2, ['Mathe', 'Deutsch', 'Sachkunde'], 60], [3, ['Mathe'], 60]]) {
  for (const acc of [0.9, 0.65, 0.5]) {
    const res = [];
    for (let s = 1; s <= N; s++) res.push(play(acc, s, grade, subjects));
    res.forEach((r) => check(r.questions <= 70 * (1 + r.retries) && r.maxPass <= 70, 'never more than 70 questions per attempt', r));
    const avg = (f) => Math.round(res.reduce((a, r) => a + f(r), 0) / N);
    const waves = [1, 2, 3, 4, 5, 6].map((w) => Math.round(100 * res.filter((r) => r.best >= w).length / N) + '%');
    rows.push(`K${grade} ${subjects.length === 1 ? subjects[0].padEnd(9) : '3 Fächer '} ${Math.round(acc * 100)} %: Sieg ${Math.round(100 * res.filter((r) => r.won).length / N)} % (ohne Neustart ${Math.round(100 * res.filter((r) => r.won && !r.retries).length / N)} %), Welle ≥1..6 ${waves.join(' ')}, Fragen Ø ${avg((r) => r.questions)} (max ${Math.max(...res.map((r) => r.questions))}, pro Anlauf max ${Math.max(...res.map((r) => r.maxPass))}), Turmschaden Ø ${avg((r) => r.hurt)}, Neustarts Ø ${(res.reduce((a, r) => a + r.retries, 0) / N).toFixed(1)}, Läufe mit einem Weg unter 20 % ${Math.round(100 * res.filter((r) => r.minShare < 0.2).length / N)} %`);
  }
}
console.log(rows.join('\n'));

if (fails.length) { console.error('FAIL test_turm:\n' + fails.join('\n')); process.exit(1); }
console.log(`test_turm OK (${Date.now() - t0} ms)`);
