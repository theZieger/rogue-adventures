// Turmwacht rules: pure changes on a plain-JSON run object, no DOM, no app.js globals.
// app.js passes everything unit-specific in through ctx (described at newRun).
const TW = (() => {
  const CELLS = 5, SPOTS = 2, TOWER_HP = 60;
  // n normal monsters, base HP; start/enter = monsters entering at wave start / per turn
  // (enter 0: the next one only when the board is empty); boss/elite/final = queue position of the special monster
  const WAVES = [
    { n: 3, hp: 23, start: 1, enter: 0 },
    { n: 5, hp: 29, start: 2, enter: 2 },
    { n: 3, hp: 34, start: 2, enter: 2, boss: 1 },
    { n: 6, hp: 39, start: 3, enter: 2, fast: 3 },
    { n: 5, hp: 44, start: 3, enter: 2, elite: 2 },
    { n: 3, hp: 49, start: 3, enter: 2, final: 1 },
  ];
  // Klasse 2: fewer monsters, each a little sturdier, so a run still has about as many questions
  const K2_COUNT = 0.8, K2_MIN = 2, K2_HP = 1.2;
  const COST = { guard: 4, up: [7, 11], floor: 12, fix: 3 };
  const FIX_HP = 10, REPAIR_HP = 2;
  const GUARD_DMG = [4, 6, 8];
  const HERO_EVO = 3, HERO_WAVE = 4, STRONG = 1.5, WEAK = 1.5, POWER = 2;
  const TOWER_DMG = { normal: 5, boss: 14, wave: 2.5, elite: 1.5 }; // per hit: normal/boss + wave × wave number, elites × elite, rounded up
  const INCOME = { right: 1, weak: 1, wave: 2, clean: 1, floor: 1 };
  const ELITE_HP = 1.9, BOSS_HP = 3.5, FINAL_HP = 1.6;
  const PER_MONSTER = 2; // ≈ questions a monster takes, for spreading monsters over the lanes
  const AGAIN_MAX = 3, AGAIN_TASK_MAX = 8192;
  // catch-up: from 8 answers on, tower damage shrinks smoothly from ×1 at 75 % right down to ×0.5 at 50 % (no message)
  const CATCHUP_AFTER = 8, CATCHUP_FULL = 0.75, CATCHUP_HALF = 0.5;
  const CP_USES = 2;
  const START_ITEMS = ['trank'], BOSS_ITEM = 'grosstrank', OFFER = ['trank', 'schild', 'keks', 'lupe'];
  const FLOORS = { Mathe: 'chain', Ethik: 'stun', Sachkunde: 'repair', Deutsch: 'brick', Musik: 'push', Englisch: 'volley' };
  const BEATS = { feuer: 'pflanze', pflanze: 'wasser', wasser: 'feuer' }; // = MQ.BEATS (test checks)
  // what really happened stays when the checkpoint is used: answers, practice counts, tiers, the record
  const KEEP = ['cp', 'cpUsed', 'best', 'score', 'used', 'at'];

  const pick = (ctx, a) => a[Math.floor(ctx.rnd() * a.length)];
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const keyOf = (s) => s.m + ':' + s.k;
  const at = (t, lane, cell) => t.monsters.find((x) => x.lane === lane && x.cell === cell);
  const front = (t, lane, ok = () => true) => t.monsters.filter((x) => x.lane === lane && ok(x)).sort((a, b) => a.cell - b.cell)[0];
  const usedOf = (t, i) => t.lanes[i].src.reduce((a, s) => a + (t.used[keyOf(s)] || 0), 0);
  const accOf = (t, i, ctx) => (ctx.acc ? ctx.acc(t.lanes[i]) : 0.6);
  const order = (t, a, b) => t.lanes.map((_, i) => i).sort((x, y) => a(x) - a(y) || b(x) - b(y) || x - y);
  const weakest = (t, ctx) => order(t, (i) => accOf(t, i, ctx), (i) => usedOf(t, i));
  const leastUsed = (t, ctx) => order(t, (i) => usedOf(t, i), (i) => accOf(t, i, ctx));
  const remove = (t, x) => { t.monsters = t.monsters.filter((y) => y !== x); if (t.weak === x.id) t.weak = null; };
  // earned: this wave's Ziegel by reason, for the wave-cleared screen
  const earn = (t, n, why, ev) => { t.ziegel += n; t.earned[why] = (t.earned[why] || 0) + n; ev.push({ t: 'ziegel', n, why, total: t.ziegel }); };
  const catchUp = (t) => {
    const s = Object.values(t.score), c = s.reduce((a, x) => a + x.c, 0), n = s.reduce((a, x) => a + x.t, 0);
    return n < CATCHUP_AFTER ? 1 : Math.min(1, Math.max(0.5, 0.5 + 0.5 * (c / n - CATCHUP_HALF) / (CATCHUP_FULL - CATCHUP_HALF)));
  };
  // the final boss only takes damage from questions of its current shield's path
  const hittable = (lane) => (x) => !x.final || x.shields[0] === lane;
  const protector = (t, x) => t.monsters.filter((e) => e.elite && e.lane === x.lane && e.cell < x.cell).sort((a, b) => b.cell - a.cell)[0] || null;
  const canTarget = (run, id) => { const x = run.turm.monsters.find((y) => y.id === id); return !!x && !protector(run.turm, x); };

  // 1 subject: split by unit (≥ 3 units) or round-robin by task type, so the board never becomes a single corridor
  function lanesFor(subjects, sourcesOf) {
    const subs = subjects.slice(0, 3).map((subject) => ({ subject, src: sourcesOf(subject).map(({ m, k }) => ({ m, k })) })).filter((l) => l.src.length);
    if (subs.length !== 1) return subs;
    const { subject, src } = subs[0], units = [...new Set(src.map((s) => s.m))];
    const n = Math.min(3, src.length), lanes = Array.from({ length: n }, () => ({ subject, src: [] }));
    src.forEach((s, i) => lanes[(units.length >= 3 ? units.indexOf(s.m) : i) % n].src.push(s));
    return lanes;
  }

  function nextSource(run, lane, not, ctx) {
    const t = run.turm, on = (s) => !ctx.on || ctx.on(s.m, s.k);
    let src = t.lanes[lane].src.filter(on);
    if (!src.length) src = t.lanes.flatMap((l) => l.src).filter(on);
    if (!src.length) src = t.lanes.flatMap((l) => l.src);
    if (not && src.length > 1) src = src.filter((s) => keyOf(s) !== keyOf(not));
    const u = (s) => t.used[keyOf(s)] || 0, min = Math.min(...src.map(u));
    const s = pick(ctx, src.filter((x) => u(x) === min));
    return { m: s.m, k: s.k };
  }

  function spawn(run, ctx, lane, kind, src) {
    const t = run.turm, w = WAVES[t.wave - 1], base = w.hp * (run.grade === 2 ? K2_HP : 1);
    src = src || nextSource(run, lane, null, ctx);
    const unit = kind === 'final' ? finalUnit(run, ctx, lane) : src.m;
    const worlds = ctx.worlds(unit), world = Math.min(worlds, Math.ceil(t.wave * worlds / WAVES.length));
    const pool = ctx.enemies(unit, world), avg = pool.normal.reduce((a, s) => a + s.hp, 0) / pool.normal.length;
    const sp = kind === 'normal' ? pick(ctx, pool.normal) : kind === 'elite' ? pool.elite : pool.boss;
    const x = { id: t.nextId++, lane, cell: 0, m: src.m, k: src.k, name: sp.name, shape: sp.shape, type: sp.type, world, steps: 1, slow: 0, stun: 0 };
    if (sp.acc) x.acc = sp.acc;
    let hp = base * (kind === 'normal' ? sp.hp / avg : kind === 'elite' ? ELITE_HP : BOSS_HP);
    if (kind === 'elite') x.elite = true;
    if (kind === 'boss' || kind === 'final') x.boss = true;
    if (kind === 'final') {
      // one shield per path, least practised first; the HP bar is split into equal parts
      x.final = true; x.unit = unit; x.shields = leastUsed(t, ctx); x.part = Math.round(base * FINAL_HP); hp = x.part * x.shields.length;
      Object.assign(x, nextSource(run, x.shields[0], null, ctx));
    }
    x.hp = x.maxHp = Math.max(1, Math.round(hp));
    return x;
  }

  // a different boss than in wave 3 if any unit on the board has one
  function finalUnit(run, ctx, lane) {
    const t = run.turm, us = [...new Set([...t.lanes[lane].src, ...t.lanes.flatMap((l) => l.src)].map((s) => s.m))];
    const bossOf = (m) => ctx.enemies(m, ctx.worlds(m)).boss.name;
    return us.find((m) => !t.boss3 || bossOf(m) !== t.boss3.name) || us[0];
  }

  // which path each monster of the coming wave walks on: the same plan builds the wave and the Bauzeit preview
  function plan(run, ctx, wave) {
    const t = run.turm, w = WAVES[wave - 1], k2 = run.grade === 2, L = t.lanes.length, weak = weakest(t, ctx);
    const n = k2 ? Math.max(K2_MIN, Math.round(w.n * K2_COUNT)) : w.n;
    // spread over the lanes so every path gets its share of questions, then one more for a weak lane;
    // 🔁 monsters walk their own path and the boss/elite's many questions count first, so the others go elsewhere
    const load = t.lanes.map((_, i) => usedOf(t, i)), special = w.boss != null ? BOSS_HP : w.elite != null ? ELITE_HP : 0;
    load[weak[0]] += special * PER_MONSTER;
    const again = t.again.slice(0, n + 1).filter((e) => e.lane < L), lanes = again.map((e) => e.lane);
    for (const l of lanes) load[l] += PER_MONSTER;
    while (lanes.length < n) { const l = load.indexOf(Math.min(...load)); lanes.push(l); load[l] += PER_MONSTER; }
    // the extra monster: the weakest path that has not had more than its share of questions yet
    const used = t.lanes.map((_, i) => usedOf(t, i)), fair = used.reduce((x, y) => x + y, 0) / L;
    if (lanes.length < n + 1) lanes.push(weak.find((i) => used[i] <= fair) ?? weak[0]);
    const normal = lanes.map((lane, i) => ({ lane, again: again[i], fast: !!w.fast && !k2 && i % w.fast === w.fast - 1 }));
    const finalLane = (L > 1 && t.boss3 ? weak.find((i) => i !== t.boss3.lane) : null) ?? weak[0];
    return { w, weak, normal, n: lanes.length, finalLane };
  }

  function buildWave(run, ctx) {
    const t = run.turm, p = plan(run, ctx, t.wave), w = p.w, weak = p.weak;
    t.again.splice(0, p.n);
    const q = p.normal.map((e) => {
      const x = spawn(run, ctx, e.lane, 'normal', e.again && { m: e.again.m, k: e.again.k });
      if (e.again) x.again = e.again;
      if (e.fast) x.steps = 2;
      return x;
    });
    if (w.boss != null) { const x = spawn(run, ctx, weak[0], 'boss'); t.boss3 = { lane: x.lane, name: x.name }; q.splice(w.boss, 0, x); }
    if (w.elite != null) q.splice(w.elite, 0, spawn(run, ctx, weak[0], 'elite'));
    if (w.final != null) q.splice(w.final, 0, spawn(run, ctx, p.finalLane, 'final'));
    return q;
  }

  // Bauzeit: what the next wave brings on each path → [{ n, fast, boss, elite, final }] (n counts every monster)
  function preview(run, ctx) {
    const t = run.turm;
    if (t.phase !== 'build' || t.wave >= WAVES.length) return null;
    const p = plan(run, ctx, t.wave + 1), out = t.lanes.map(() => ({ n: 0, fast: 0, boss: false, elite: false, final: false }));
    for (const e of p.normal) { out[e.lane].n++; if (e.fast) out[e.lane].fast++; }
    const add = (lane, k) => { out[lane].n++; out[lane][k] = true; };
    if (p.w.boss != null) add(p.weak[0], 'boss');
    if (p.w.elite != null) add(p.weak[0], 'elite');
    if (p.w.final != null) add(p.finalLane, 'final');
    return out;
  }

  function enter(t, max, ev) {
    if (!max) max = t.monsters.length ? 0 : 1;
    for (let i = 0; i < t.queue.length && max > 0;) {
      const x = t.queue[i];
      if (at(t, x.lane, CELLS)) { i++; continue; }
      t.queue.splice(i, 1); x.cell = CELLS; t.monsters.push(x); max--;
      ev.push({ t: 'enter', id: x.id, lane: x.lane, cell: CELLS, ...(x.boss && { boss: true }), ...(x.elite && { elite: true }) });
    }
  }

  // 🎯: front monster on the least practised path this run
  function weakTarget(run, ctx) {
    const t = run.turm;
    for (const i of leastUsed(t, ctx)) { const x = front(t, i); if (x) return x.id; }
    return null;
  }

  function nextWave(run, ctx) {
    const t = run.turm;
    if (t.phase !== 'build' || t.wave >= WAVES.length) return [];
    t.wave++; t.best = Math.max(t.best, t.wave); t.turn = 0; t.hurtThisWave = false; t.phase = 'choose'; t.offer = null; t.earned = {}; t.stamps = 0;
    t.queue = buildWave(run, ctx);
    const ev = [{ t: 'wave', wave: t.wave }];
    enter(t, WAVES[t.wave - 1].start, ev);
    t.weak = weakTarget(run, ctx);
    return ev;
  }

  // ctx: { rnd() → [0,1), enemies(m, world) → { normal: [], elite, boss }, worlds(m), dmg(m, k), heroType,
  //        acc(lane) → 0…1 (optional, default 0.6), on(m, k) → enabled (optional) }
  function newRun({ grade, lanes, hero }, ctx) {
    const run = {
      mode: 'turm', v: 1, grade, hero: { m: hero.m, id: hero.id, evo: 0, hp: TOWER_HP, maxHp: TOWER_HP },
      items: START_ITEMS.slice(), shield: false, power: false, hint: false, right: 0, answered: 0, solved: 0,
      turm: {
        wave: 0, turn: 0, phase: 'build', lanes: clone(lanes), at: {}, used: {}, monsters: [], queue: [], guards: {}, floors: [],
        ziegel: 0, earned: {}, stamps: 0, again: [], score: {}, asking: null, weak: null, offer: null, boss3: null, free: true,
        cp: null, cpUsed: 0, best: 0, nextId: 1, hurtThisWave: false,
      },
    };
    nextWave(run, ctx);
    return run;
  }

  function heroDamage(run, x, ctx) {
    const t = run.turm, strong = BEATS[ctx.heroType] === x.type, weak = t.weak === x.id;
    const d = (ctx.dmg(x.m, x.k) + HERO_EVO * run.hero.evo + HERO_WAVE * (t.wave - 1)) * (strong ? STRONG : 1) * (weak ? WEAK : 1) * (run.power ? POWER : 1);
    return { dmg: Math.max(1, Math.round(d)), strong, weak };
  }
  const guardDamage = (g, x) => Math.max(1, Math.round(GUARD_DMG[g.lvl - 1] * (BEATS[g.type] === x.type ? STRONG : 1)));

  // what the monster card shows; blockedBy = the elite that protects it
  function card(run, id, ctx) {
    const t = run.turm, x = t.monsters.find((y) => y.id === id);
    if (!x) return null;
    const p = protector(t, x);
    return { ...heroDamage(run, x, ctx), again: !!x.again, m: x.m, blockedBy: p && p.id };
  }

  function ask(run, id) {
    const t = run.turm, x = t.monsters.find((y) => y.id === id);
    if (t.phase !== 'choose' || !canTarget(run, id)) return null;
    t.asking = { id, m: x.m, k: x.k, lane: x.final ? x.shields[0] : x.lane };
    if (x.again) t.asking.again = x.again;
    t.phase = 'task';
    return t.asking;
  }

  function noteWrong(t, { m, k, lane, tier, task }) {
    if (t.again.length >= AGAIN_MAX || t.again.some((e) => e.m === m && e.k === k)) return false;
    const e = { m, k, lane, tier };
    // number tasks come back with new numbers: their solution was just shown
    if (task && task.kind !== 'num' && JSON.stringify(task).length <= AGAIN_TASK_MAX) e.task = task;
    t.again.push(e);
    return true;
  }

  // info: { task, tier } of the question just answered (for 🔁)
  function answer(run, ok, ctx, info = {}) {
    const t = run.turm, a = t.asking;
    if (t.phase !== 'task' || !a) return [];
    const x = t.monsters.find((y) => y.id === a.id), sub = t.lanes[a.lane].subject, ev = [];
    t.used[keyOf(a)] = (t.used[keyOf(a)] || 0) + 1;
    const sc = t.score[sub] || (t.score[sub] = { c: 0, t: 0 }); sc.t++; if (ok) sc.c++;
    if (x) delete x.again;
    if (!ok) {
      ev.push({ t: 'wrong', id: a.id });
      if (!a.again && noteWrong(t, { m: a.m, k: a.k, lane: a.lane, tier: info.tier || (info.task && info.task.tier) || 1, task: info.task })) ev.push({ t: 'again', m: a.m, k: a.k });
    } else if (x) {
      let broke = false;
      const hurt = (y, d, e) => {
        if (!y || !t.monsters.includes(y) || (y.final && broke)) return;
        const cap = y.final ? y.part * (y.shields.length - 1) : 0, n = Math.min(d, y.hp - cap);
        if (n < 1) return;
        y.hp -= n; ev.push({ ...e, id: y.id, dmg: n, hp: y.hp });
        if (y.hp <= 0) { remove(t, y); ev.push({ t: 'beaten', id: y.id }); }
        else if (y.final && y.hp <= cap) {
          broke = true; const lane = y.shields.shift();
          y.shields = leastUsed(t, ctx).filter((i) => y.shields.includes(i));
          ev.push({ t: 'shield', id: y.id, lane, left: y.shields.length });
        }
      };
      const h = heroDamage(run, x, ctx), weak = h.weak;
      hurt(x, h.dmg, { t: 'hit', strong: h.strong, weak, power: run.power });
      run.power = false;
      const volley = () => {
        for (let s = 0; s < SPOTS; s++) {
          const g = t.guards[a.lane + ':' + s], y = x.final ? x : front(t, a.lane, hittable(a.lane));
          if (g && y) hurt(y, guardDamage(g, y), { t: 'shot', from: a.lane + ':' + s, strong: BEATS[g.type] === y.type });
        }
      };
      volley();
      if (t.floors.includes(sub)) floorFx(run, ctx, FLOORS[sub], x, a, h.dmg, hurt, volley, ev);
      earn(t, INCOME.right, 'right', ev);
      if (weak) earn(t, INCOME.weak, 'weak', ev);
      if (t.monsters.includes(x)) Object.assign(x, nextSource(run, x.final ? x.shields[0] : x.lane, x, ctx));
    }
    t.asking = null; t.phase = 'step';
    return ev;
  }

  function floorFx(run, ctx, fx, x, a, dmg, hurt, volley, ev) {
    const t = run.turm, L = t.lanes.length, alive = t.monsters.includes(x);
    ev.push({ t: 'floor', subject: t.lanes[a.lane].subject, fx });
    if (fx === 'chain') {
      for (let j = 1; j < L; j++) {
        const y = front(t, (x.lane + j) % L, hittable(a.lane));
        if (y) { hurt(y, Math.max(1, Math.round(dmg / 2)), { t: 'chain', from: x.id }); break; }
      }
    } else if (fx === 'stun') { if (alive) { x.stun = 1; ev.push({ t: 'stun', id: x.id }); } }
    else if (fx === 'repair') {
      const h = run.hero, n = Math.min(REPAIR_HP, h.maxHp - h.hp);
      if (n > 0) { h.hp += n; ev.push({ t: 'heal', n, hp: h.hp }); }
    } else if (fx === 'brick') earn(t, INCOME.floor, 'floor', ev);
    else if (fx === 'push') {
      const y = front(t, x.lane);
      if (y && !y.boss && y.cell < CELLS && !at(t, y.lane, y.cell + 1)) { ev.push({ t: 'push', id: y.id, from: y.cell, to: y.cell + 1 }); y.cell++; }
    } else if (fx === 'volley') volley();
  }

  function towerHit(run, x, ev) {
    const t = run.turm, h = run.hero, gone = !x.boss;
    if (gone) remove(t, x);
    if (run.shield) { run.shield = false; ev.push({ t: 'block', id: x.id, gone }); return; }
    let d = (x.boss ? TOWER_DMG.boss : TOWER_DMG.normal) + TOWER_DMG.wave * t.wave;
    if (x.elite) d *= TOWER_DMG.elite;
    d = Math.max(1, Math.ceil(d * catchUp(t) - 1e-9));
    if (t.wave === 1) d = Math.min(d, h.hp - 1); // wave 1 is safe: the tower keeps at least 1 ❤️
    if (d < 1) { ev.push({ t: 'hold', id: x.id, gone }); return; }
    h.hp = Math.max(0, h.hp - d); t.hurtThisWave = true;
    ev.push({ t: 'tower', id: x.id, dmg: d, hp: h.hp, gone });
  }

  // monsters walk, hit the tower, new ones enter; then the next turn, the wave's end or the fall
  function step(run, ctx) {
    const t = run.turm, ev = [];
    if (t.phase !== 'step' && t.phase !== 'choose') return ev;
    t.asking = null;
    for (const x of t.monsters.slice().sort((a, b) => a.cell - b.cell)) {
      if (x.boss) { const rest = x.slow; x.slow = 1 - x.slow; if (rest) continue; }
      if (x.stun) { x.stun = 0; ev.push({ t: 'stunned', id: x.id }); continue; }
      const from = x.cell; let n = x.steps, hit = false;
      while (n-- > 0) {
        if (x.cell === 1) { hit = true; break; }
        if (at(t, x.lane, x.cell - 1)) break;
        x.cell--;
      }
      if (x.cell !== from) ev.push({ t: 'move', id: x.id, from, to: x.cell });
      if (hit) towerHit(run, x, ev);
    }
    if (run.hero.hp <= 0) { t.phase = 'fallen'; ev.push({ t: 'fallen', wave: t.wave }); return ev; }
    enter(t, WAVES[t.wave - 1].enter, ev);
    t.turn++;
    if (!t.monsters.length && !t.queue.length) waveDone(run, ctx, ev);
    else { t.phase = 'choose'; t.weak = weakTarget(run, ctx); }
    return ev;
  }

  function toBuild(run) { run.turm.phase = 'build'; run.turm.cp = snapshot(run); }

  function waveDone(run, ctx, ev) {
    const t = run.turm, w = WAVES[t.wave - 1];
    t.weak = null;
    ev.push({ t: 'cleared', wave: t.wave });
    earn(t, INCOME.wave, 'wave', ev);
    if (!t.hurtThisWave) earn(t, INCOME.clean, 'clean', ev);
    if (w.boss != null || w.final != null) { run.hero.evo = Math.min(2, run.hero.evo + 1); ev.push({ t: 'evolve', evo: run.hero.evo }); }
    if (t.wave === WAVES.length) { t.phase = 'won'; ev.push({ t: 'won' }); return; }
    if (w.boss != null) {
      run.items.push(BOSS_ITEM); ev.push({ t: 'item', id: BOSS_ITEM });
      const a = pick(ctx, OFFER); t.offer = [a, pick(ctx, OFFER.filter((i) => i !== a))];
      t.phase = 'reward'; ev.push({ t: 'offer', items: t.offer.slice() });
      return;
    }
    toBuild(run);
  }

  function takeReward(run, i) {
    const t = run.turm;
    if (t.phase !== 'reward' || !t.offer || !t.offer[i]) return false;
    run.items.push(t.offer[i]); t.offer = null; toBuild(run);
    return true;
  }

  // card: { kind: 'guard', lane, spot, look, type } | { kind: 'up', lane, spot } | { kind: 'floor', subject } | { kind: 'fix' }
  // → cost in Ziegel, or -1 if the card can't be used now
  function price(run, c) {
    const t = run.turm, okSpot = c.lane >= 0 && c.lane < t.lanes.length && c.spot >= 0 && c.spot < SPOTS, g = okSpot && t.guards[c.lane + ':' + c.spot];
    if (t.phase !== 'build') return -1;
    if (c.kind === 'guard') return okSpot ? (t.free && t.wave === 1 ? 0 : COST.guard) : -1;
    if (c.kind === 'up') return g && g.lvl < GUARD_DMG.length ? COST.up[g.lvl - 1] : -1;
    if (c.kind === 'floor') return t.lanes.some((l) => l.subject === c.subject) && !t.floors.includes(c.subject) ? COST.floor : -1;
    if (c.kind === 'fix') return run.hero.hp < run.hero.maxHp ? COST.fix : -1;
    return -1;
  }

  function buy(run, c) {
    const t = run.turm, p = price(run, c);
    if (p < 0 || p > t.ziegel) return null;
    t.ziegel -= p;
    const k = c.lane + ':' + c.spot;
    if (c.kind === 'guard') { t.guards[k] = { look: c.look, type: c.type, lvl: 1 }; t.free = false; }
    else if (c.kind === 'up') t.guards[k].lvl++;
    else if (c.kind === 'floor') t.floors.push(c.subject);
    else run.hero.hp = Math.min(run.hero.maxHp, run.hero.hp + FIX_HP);
    return [{ t: 'built', card: { ...c }, cost: p, ziegel: t.ziegel }];
  }

  function snapshot(run) {
    const { right, answered, solved, turm, ...rest } = run, tt = { ...turm };
    for (const k of KEEP) delete tt[k];
    return clone({ ...rest, turm: tt });
  }
  const canRetry = (run) => run.turm.phase === 'fallen' && !!run.turm.cp && run.turm.cpUsed < CP_USES;
  // „Ab Welle N weitermachen“: back to the last Bauzeit with a repaired tower; N = run.turm.cp.turm.wave + 1
  function retry(run) {
    if (!canRetry(run)) return false;
    const old = run.turm, c = clone(old.cp);
    for (const k of KEEP) c.turm[k] = old[k];
    Object.assign(run, c);
    run.turm.cpUsed++; run.turm.phase = 'build'; run.hero.hp = run.hero.maxHp;
    return true;
  }

  return {
    CELLS, SPOTS, TOWER_HP, WAVES, KEEP, HERO_EVO, HERO_WAVE, INCOME, COST, FIX_HP, REPAIR_HP, GUARD_DMG, TOWER_DMG, FLOORS, CP_USES, BEATS, AGAIN_MAX, AGAIN_TASK_MAX,
    lanesFor, newRun, card, canTarget, preview,
    ask, answer, step, takeReward, price, buy, nextWave, canRetry, retry,
  };
})();
if (typeof module !== 'undefined') module.exports = TW;
