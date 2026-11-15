import { MODES, MODE_KEYS } from '../curriculum.ts';
import { KEY_TURM, RENAMES, clear, isObj, load, nat, okScore, own } from '../save.ts';
import { TW } from '../turm.ts';
import { ITEMS, TYPES } from './core.ts';
import {
  giveStamps,
  heroLocked,
  levelOf,
  makeTask,
  payAnswers,
  recordAnswer,
  taskTier,
  weeklyStep,
} from './progress.ts';
import { state } from './state.ts';
import { curGrade, enabledMods, fightMods, heroShown, loadRun, saveAll, shown } from './storage.ts';
import { practised } from './title.ts';

/* ---------- Turmwacht (rules in src/turm.ts) ---------- */
const TURM_PHASES = ['choose', 'task', 'step', 'reward', 'build', 'fallen', 'won'];
// a unit's Turm world: the furthest world reached in an adventure there (running, or a Monsterbuch entry from there)
const turmWorld = (m: string) => {
  const r = loadRun(m);
  return Math.min(
    MODES[m].worlds,
    Math.max(
      1,
      r ? r.world : 1,
      ...Object.values(state.meta.dex)
        .filter((e) => isObj(e) && e.mode === m && Number.isInteger(e.world))
        .map((e) => e.world),
    ),
  );
};
// Turmwacht is for review: only the task types the child has practised in a subject, topped up to two from the first
// practised theme, else from the subject's first theme in title order (a new subject brings two explanations, not a dozen)
export const turmSources = (subject: string, grade: number) => {
  const units = MODE_KEYS.filter((m) => MODES[m].grade === grade && MODES[m].subject === subject && shown(m)).sort(
      (x, y) => (MODES[x].rank || 0) - (MODES[y].rank || 0),
    ),
    done = units.filter(practised);
  const seen = done.flatMap((m) =>
    fightMods(m)
      .filter((k) => state.meta.stats[m][k] && state.meta.stats[m][k].t > 0)
      .map((k) => ({ m, k })),
  );
  // at least two task types, so a subject alone still gets two paths
  const m = done[0] || units[0];
  for (const k of enabledMods(m)) if (seen.length < 2 && !seen.some((s) => s.m === m && s.k === k)) seen.push({ m, k });
  return seen;
};
export const turmHero = (h = state.run.hero) => MODES[h.m].starters.find((s) => s.id === h.id);
const laneAcc = (lane: { src: any }) => {
  let c = 0,
    t = 0;
  for (const { m, k } of lane.src) {
    const s = state.meta.stats[m][k];
    c += s.c;
    t += s.t;
  }
  return t ? c / t : 0.6;
};
export const turmCtx = (hero: any) => ({
  rnd: Math.random,
  heroType: turmHero(hero).type,
  enemies: (m: string | number, w: string | number) => MODES[m].enemies[w],
  worlds: (m: string | number) => MODES[m].worlds,
  dmg: (m: string | number, k: string | number) => MODES[m].modules[k].dmg,
  acc: laneAcc,
  on: (m: string | undefined, k: string) => enabledMods(m).includes(k),
});
// the per-unit task box; start tiers one below the level reached, as in an adventure
const turmBox = (m: string) =>
  state.run.turm.at[m] ||
  (state.run.turm.at[m] = {
    world: turmWorld(m),
    tiers: Object.fromEntries(fightMods(m).map((k) => [k, Math.max(1, (levelOf(m)[k] || 1) - 1)])),
    recent: {},
  });
// after every rule change: record and latest scores go to meta, and everything is saved at once
function turmSync(x) {
  const t = state.run.turm;
  state.meta.turm.best = Math.max(state.meta.turm.best, t.best);
  // a monster on the board is seen: Monsterbuch entry under its own unit and world, +2 Stempel when new (as in an adventure)
  for (const y of t.monsters)
    if (!state.meta.dex[y.name]) {
      state.meta.dex[y.name] = { type: y.type, shape: y.shape, world: y.world, mode: y.unit || y.m };
      y.fresh = true;
      t.stamps += giveStamps(2);
    }
  if (Object.keys(t.score).length) state.meta.turm.last = JSON.parse(JSON.stringify(t.score));
  saveAll();
  return x;
}
// a new run replaces a saved one
export function startTurm(subjects: string[], hero: { m: any; id: any }) {
  const grade = curGrade().grade;
  clear(KEY_TURM);
  state.run = null;
  const r = TW.newRun({ grade, lanes: TW.lanesFor(subjects, (s) => turmSources(s, grade)), hero }, turmCtx(hero));
  state.run = r;
  for (const l of r.turm.lanes) for (const s of l.src) turmBox(s.m);
  state.meta.turm.runs++;
  return turmSync(r);
}
// the question is saved with the run before it is shown, so a reload asks the same one again
export function turmAsk(id?: number | null | undefined) {
  const t = state.run.turm;
  if (t.phase !== 'task' && !TW.ask(state.run, id)) return null;
  const a = t.asking;
  state.mode = a.m;
  turmBox(a.m);
  if (!a.task) {
    a.task = (a.again && a.again.task) || makeTask(a.k, a.again ? a.again.tier : taskTier(a.k));
    saveAll();
  }
  return a.task;
}
// saved together with phase 'step': a reload never repeats the answer or its Ziegel
export function turmAnswer(ok: boolean) {
  const a = state.run.turm.asking;
  if (state.run.turm.phase !== 'task' || !a) return [];
  state.mode = a.m;
  turmBox(a.m);
  recordAnswer(a.k, ok, a.task);
  const elites = state.run.turm.monsters.filter((x: { elite: any }) => x.elite),
    ev = TW.answer(state.run, ok, turmCtx(state.run.hero), { task: a.task });
  for (const x of elites)
    if (ev.some((e) => e.t === 'beaten' && e.id === x.id)) {
      state.mode = x.m;
      weeklyStep('elite');
    }
  state.mode = a.m;
  return turmSync(ev);
}
// Stempel as in an adventure: the answers pay at the end of every wave and at the fall, +5 per boss wave, +10 for the victory
export function turmStep() {
  const t = state.run.turm,
    w = TW.WAVES[t.wave - 1];
  for (const x of t.monsters) delete x.fresh; // „Neu im Monsterbuch“ shows for the turn the monster arrives
  const ev = TW.step(state.run, turmCtx(state.run.hero)),
    has = (k: string) => ev.some((e) => e.t === k);
  if (has('cleared') || has('fallen')) t.stamps += payAnswers();
  if (has('cleared') && (w.boss != null || w.final != null)) t.stamps += giveStamps(5);
  if (has('won')) {
    state.meta.turm.wins++;
    t.stamps += giveStamps(10);
    state.meta.progressAt = new Date().toISOString();
  }
  return turmSync(ev);
}
export const turmReward = (i: number) => turmSync(TW.takeReward(state.run, i));
export const turmBuy = (card) => turmSync(TW.buy(state.run, card));
export const turmNextWave = () => turmSync(TW.nextWave(state.run, turmCtx(state.run.hero)));
export const turmRetry = () => turmSync(TW.retry(state.run));

// Saves must always load: a broken Turm run is removed (only its own key), single bad fields are repaired
export function loadTurm() {
  const r = load(KEY_TURM, null);
  if (fixTurm(r)) return r;
  if (r) clear(KEY_TURM);
  return null;
}
function fixTurm(r: unknown) {
  const t = isObj(r) && r.turm,
    int = (v: unknown, lo: number, hi: number) => Number.isInteger(v) && v >= lo && v <= hi,
    arr = (a: any) => (Array.isArray(a) ? a : []);
  if (
    !isObj(t) ||
    !isObj(r.hero) ||
    !Array.isArray(t.lanes) ||
    !t.lanes.length ||
    t.lanes.length > 3 ||
    !t.lanes.every((l) => isObj(l) && typeof l.subject === 'string' && Array.isArray(l.src)) ||
    !int(t.wave, 1, TW.WAVES.length)
  )
    return false;
  const okSrc = (s: unknown) =>
    isObj(s) && own(MODES, s.m) && own(MODES[s.m].modules, s.k) && !MODES[s.m].modules[s.k].shop;
  // a lane whose units are gone keeps its monsters; they take questions from the other lanes
  for (const l of t.lanes) l.src = l.src.filter(okSrc).map(({ m, k }) => ({ m, k }));
  const L = t.lanes.length,
    all = t.lanes.flatMap((l) => l.src),
    lane = (i: number) => int(i, 0, L - 1);
  if (!all.length) return false;
  r.mode = 'turm';
  r.grade = r.grade === 2 ? 2 : 3;
  const h = r.hero;
  if (!own(MODES, h.m) || !MODES[h.m].starters.some((s) => s.id === h.id)) {
    h.m = all[0].m;
    h.id = MODES[h.m].starters[0].id;
  }
  h.evo = int(h.evo, 0, 2) ? h.evo : 0;
  h.maxHp = int(h.maxHp, 1, 999) ? h.maxHp : TW.TOWER_HP;
  h.hp = int(h.hp, 0, h.maxHp) ? h.hp : h.maxHp;
  r.items = arr(r.items).filter((it) => own(ITEMS, it));
  for (const k of ['shield', 'power', 'hint']) r[k] = r[k] === true;
  for (const k of ['right', 'answered', 'solved']) r[k] = nat(r[k]);
  const okAgain = (e: { lane: any; tier: any; task: unknown }) =>
    okSrc(e) && lane(e.lane) && int(e.tier, 1, 99) && (e.task === undefined || isObj(e.task));
  const ids = new Set<number>(),
    cells = new Set();
  const okMon = (board: boolean) => (x: unknown) => {
    if (
      !isObj(x) ||
      !Number.isInteger(x.id) ||
      ids.has(x.id) ||
      !lane(x.lane) ||
      !(board ? int(x.cell, 1, TW.CELLS) : x.cell === 0) ||
      !int(x.maxHp, 1, 1e5) ||
      !int(x.hp, 1, x.maxHp)
    )
      return false;
    if (board) {
      if (cells.has(x.lane + ':' + x.cell)) return false;
      cells.add(x.lane + ':' + x.cell);
    }
    ids.add(x.id);
    if (!okSrc(x)) Object.assign(x, t.lanes[x.lane].src[0] || all[0]);
    x.name = typeof x.name === 'string' ? RENAMES[x.name] || x.name : 'Sumpfbrocken';
    if (typeof x.shape !== 'string') x.shape = 'sumpfbrocken';
    if (!own(TYPES, x.type)) x.type = 'normal';
    x.world = int(x.world, 1, 9) ? x.world : 1;
    x.steps = x.steps === 2 ? 2 : 1;
    x.slow = x.slow === 1 ? 1 : 0;
    x.stun = x.stun === 1 ? 1 : 0;
    for (const k of ['elite', 'boss', 'final', 'fresh']) if (x[k] !== true) delete x[k];
    if (typeof x.acc !== 'string') delete x.acc;
    if (x.again !== undefined && !okAgain(x.again)) delete x.again;
    // the final boss loses one shield per path; its HP must still reach the next shield
    const sh = x.shields;
    if (
      x.final &&
      !(
        Array.isArray(sh) &&
        sh.length &&
        sh.every(lane) &&
        new Set(sh).size === sh.length &&
        int(x.part, 1, x.maxHp) &&
        x.hp > x.part * (sh.length - 1)
      )
    ) {
      x.shields = [x.lane];
      x.part = x.maxHp;
    }
    if (x.final && !own(MODES, x.unit)) x.unit = x.m;
    return true;
  };
  t.monsters = arr(t.monsters).filter(okMon(true));
  t.queue = arr(t.queue).filter(okMon(false));
  t.nextId = Math.max(int(t.nextId, 1, 1e9) ? t.nextId : 1, ...[...ids].map((i) => i + 1));
  const onBoard = (id: any) => t.monsters.some((x: { id: any }) => x.id === id);
  if (!TURM_PHASES.includes(t.phase)) t.phase = 'choose';
  const a = t.asking;
  t.asking = t.phase === 'task' && isObj(a) && onBoard(a.id) && okSrc(a) && lane(a.lane) ? a : null;
  if (t.asking) {
    if (a.task !== undefined && !isObj(a.task)) delete a.task;
    if (a.again !== undefined && !okAgain(a.again)) delete a.again;
  } else if (t.phase === 'task') t.phase = 'choose';
  // nothing left to tap: the next step ends the wave or lets new monsters in
  if (t.phase === 'choose' && !t.monsters.length) t.phase = 'step';
  t.offer = t.phase === 'reward' ? arr(t.offer).filter((it) => own(ITEMS, it)) : null;
  if (t.offer && !t.offer.length) t.offer = ['trank'];
  if (!onBoard(t.weak)) t.weak = null;
  if (!(isObj(t.boss3) && lane(t.boss3.lane) && typeof t.boss3.name === 'string')) t.boss3 = null;
  t.guards = Object.fromEntries(
    Object.entries(isObj(t.guards) ? t.guards : {}).filter(
      ([k, g]) =>
        /^\d:\d$/.test(k) &&
        lane(+k[0]) &&
        +k[2] < TW.SPOTS &&
        isObj(g) &&
        typeof g.look === 'string' &&
        own(TYPES, g.type) &&
        int(g.lvl, 1, TW.GUARD_DMG.length),
    ),
  );
  t.floors = [...new Set(arr(t.floors).filter((s) => t.lanes.some((l: { subject: any }) => l.subject === s)))];
  t.again = arr(t.again).filter(okAgain).slice(0, TW.AGAIN_MAX);
  t.used = Object.fromEntries(
    Object.entries(isObj(t.used) ? t.used : {}).filter(([, n]) => Number.isInteger(n) && n >= 0),
  );
  t.score = Object.fromEntries(Object.entries(isObj(t.score) ? t.score : {}).filter(([, v]) => okScore(v)));
  t.at = Object.fromEntries(
    Object.entries(isObj(t.at) ? t.at : {})
      .filter(([m, b]) => own(MODES, m) && isObj(b) && int(b.world, 1, MODES[m].worlds))
      .map(([m, b]) => [
        m,
        {
          world: b.world,
          tiers: Object.fromEntries(
            Object.entries(isObj(b.tiers) ? b.tiers : {}).filter(([k, n]) => own(MODES[m].modules, k) && int(n, 1, 99)),
          ),
          recent: Object.fromEntries(
            Object.entries(isObj(b.recent) ? b.recent : {}).filter(([, x]) => Array.isArray(x)),
          ),
        },
      ]),
  );
  for (const k of ['ziegel', 'turn', 'stamps']) t[k] = nat(t[k]);
  t.earned = Object.fromEntries(
    Object.entries(isObj(t.earned) ? t.earned : {}).filter(([, n]) => Number.isInteger(n) && n > 0),
  );
  for (const k of ['free', 'hurtThisWave']) t[k] = t[k] === true;
  t.cpUsed = int(t.cpUsed, 0, TW.CP_USES) ? t.cpUsed : 0;
  t.best = Math.min(TW.WAVES.length, Math.max(t.wave, nat(t.best)));
  // the checkpoint is a run without the fields that stay when it is used: check it as one, with those taken from this run
  if (t.cp !== null) {
    const c = isObj(t.cp) && isObj(t.cp.turm) ? JSON.parse(JSON.stringify(t.cp)) : null;
    if (c) for (const k of TW.KEEP) c.turm[k] = k === 'cp' ? null : JSON.parse(JSON.stringify(t[k]));
    if (c && fixTurm(c) && c.turm.phase === 'build') {
      delete c.right;
      delete c.answered;
      delete c.solved;
      for (const k of TW.KEEP) delete c.turm[k];
      t.cp = c;
    } else t.cp = null;
  }
  return true;
}

/* Turm screens. They never call CFG()-based helpers: the global mode is only the unit that asked last. */
// off until the parents switch it on: Turmwacht is still being tried out
export const turmOn = () => state.meta.turm.on && curGrade().grade !== 1;
export const TW_FLAG =
  '<svg class="twflag" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 2.5v15" fill="none" stroke="#FFF9EE" stroke-width="2.2" stroke-linecap="round"/><path d="M6 3.5h9.5l-2.6 3.2 2.6 3.3H6Z" fill="#FF6A3D" stroke="#1C2541" stroke-width="1.4" stroke-linejoin="round"/></svg>';
export const TURM_BAG = {
  full: 'Der Turm ist heil.',
  later: 'Das geht nur, solange eine Welle läuft.',
  desc: {
    trank: `Repariert ${ITEMS.trank.heal} ❤️ am Turm. Während einer Welle kostet das einen Zug.`,
    grosstrank: `Repariert ${ITEMS.grosstrank.heal} ❤️ am Turm. Während einer Welle kostet das einen Zug.`,
    schild: 'Wirkt, sobald ein Monster am Turm ankommt.',
    keks: 'Dein nächster Treffer macht doppelten Schaden.',
    lupe: 'Ein Tipp bei der nächsten Aufgabe.',
  },
};
export const turmSubjAcc = (subject: string, grade: number) => {
  let c = 0,
    t = 0;
  for (const { m, k } of turmSources(subject, grade)) {
    const s = state.meta.stats[m][k];
    c += s.c;
    t += s.t;
  }
  return { subject, acc: t ? c / t : 0.6, t };
};
// starters of the units the child has practised (all units if none); Klasse-1/2 heroes are shared by a subject's units, each counts once
export function turmHeroes(grade: number) {
  const units = MODE_KEYS.filter((m) => MODES[m].grade === grade && shown(m));
  const of = (ms: any[]) =>
    ms
      .flatMap((m: string | number | null) =>
        MODES[m].starters.filter((s: { id: any }) => heroShown(m, s) && !heroLocked(s)).map((s: any) => ({ m, s })),
      )
      .filter(
        (h: { s: { id: any } }, i: any, all: any[]) =>
          all.findIndex((x: { s: { id: any } }) => x.s.id === h.s.id) === i,
      );
  const met = of(units.filter((m) => practised(m) || state.meta.lastStarter[m])),
    all = of(units);
  return met.length ? met : all.length ? all : [{ m: units[0], s: MODES[units[0]].starters[0] }];
}
export const turmLeave = (to: { (): void; (): void; (): void; (): void; (): void; (): void; (): void }) => {
  saveAll();
  state.run = null;
  state.turmMode = null;
  to();
};
// id → monster as it was before the answer (beaten ones are gone afterwards), for the log
export const turmNames = () =>
  Object.fromEntries(
    state.run.turm.monsters
      .concat(state.run.turm.queue)
      .map((x: { id: any; name: any }) => [x.id, { name: x.name, acc: accName(x), x: JSON.parse(JSON.stringify(x)) }]),
  );
// „Erst den Wackelturm besiegen.“: the data's accusative if it has one, else the article (and an adjective after „Der“) declined
export const accName = (x: { acc: any; name: string }) =>
  x.acc ||
  x.name.replace(
    /^(Der|Die|Das) (?:([a-zäöüß]+e) )?/,
    (_: any, art: string, adj: string | number) =>
      `${{ Der: 'den', Die: 'die', Das: 'das' }[art]} ${adj ? adj + (art === 'Der' ? 'n ' : ' ') : ''}`,
  );
export const midName = (n: string) => n.replace(/^(Der|Die|Das) /, (a: string) => a.toLowerCase());
export const turmEliteText = (x: { name: any }) =>
  `Das Elitemonster 🛡️ schützt alle Monster hinter sich auf seinem Weg. Erst wenn ${midName(x.name)} besiegt ist, kommst du an sie heran.`;
export const turmBlocked = (by: any) => `Erst ${accName(by)} besiegen.`;
// the warning for monsters that reach the tower in the next step (TW.threats): card line and the hint under the board
export const turmGateLine = (x: { boss: any }) => (x.boss ? 'Schlägt gleich wieder zu!' : 'Gleich am Turm!');
export const turmGateText = (xs: any[]) =>
  !xs.length
    ? ''
    : `Achtung! ${xs.length > 2 ? `${xs.length} Monster` : xs.map((x: { name: any }, i: any) => (i ? midName(x.name) : x.name)).join(' und ')} ${xs.length > 1 ? 'sind' : 'ist'} gleich am Turm.`;
// stage names change only for some heroes, so the new name is said only when there is one (never „wird zu …“)
export function turmEvoText(evo: number) {
  const N = turmHero().names,
    a = N[evo - 1],
    b = N[evo];
  return `${a} bekommt eine neue Gestalt${a !== b ? ` und heißt jetzt ${midName(b)}` : ''}. Jede Attacke macht ${TW.HERO_EVO} Schaden mehr.`;
}
export const laneName = (i: number) => {
  const L = state.run.turm.lanes,
    s = L[i].subject,
    same = L.filter((l: { subject: any }) => l.subject === s);
  return same.length > 1 ? `${s} ${same.indexOf(L[i]) + 1}` : s;
};
