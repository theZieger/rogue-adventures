import { type Attack, MODES } from '../curriculum.ts';
import { type Known, MK } from '../knowledge.ts';
import { MQ, type Task } from '../logic.ts';
import { MONART } from '../monsters.ts';
import { isObj } from '../save.ts';
import { html, raw } from '../ui/html.ts';
import { $, CFG, MODULES_OF, TYPES } from './core.ts';
import { state } from './state.ts';
import { curGrade, enOff, enabledMods, extraOn, shown } from './storage.ts';
import { SFX, modal } from './ui.ts';

/* ---------- Monster art ---------- */
export const monsterSVG = MONART.monsterSVG;
const shade = MONART.shade;

/* ---------- Helpers ---------- */
export const heroName = () => heroSpec().names[state.run.hero.evo];
export const heroSpec = () => CFG().starters.find((s) => s.id === state.run.hero.id)!;
export const STATS = () => state.meta.stats[state.mode];
export const tutKey = (k: string) => state.mode + ':' + k;
export const typeChip = (t: string) =>
  `<span class="pill lg" style="background:${TYPES[t].color}">${TYPES[t].icon} ${TYPES[t].name}</span>`;
export const xpNeeded = (lvl: number) => 20 + lvl * 15;
// a Turm run keeps world, tiers and the repeat guard per unit: task-type keys repeat across units
const taskBox = () => (state.run && state.run.mode === 'turm' ? state.run.turm.at[state.mode] : state.run);
const worldCapFor = (mod: string) => {
  const M = MODULES_OF()[mod];
  return Math.min(M.maxTier || Infinity, M.worldCap[Math.min(taskBox().world, M.worldCap.length) - 1]);
};
export function tierFor(mod: string) {
  return Math.max(1, Math.min(worldCapFor(mod), taskBox().tiers[mod] || 1));
}
// about every fourth task comes from the tier below, so the child keeps some easy wins
export const taskTier = (mod: string) => {
  const t = tierFor(mod);
  return t >= 2 && Math.random() < 0.25 ? t - 1 : t;
};
// the tier reached per unit and task type; a new adventure starts one tier below it
export const levelOf = (m: string) => (state.meta.level[m] = isObj(state.meta.level[m]) ? state.meta.level[m] : {});
// under 65 % right in this adventure (from 8 answers on), a wrong answer costs less
export const struggling = () => state.run.answered >= 8 && state.run.solved / state.run.answered < 0.65;
export function recordAnswer(
  mod: string,
  ok: boolean,
  // only the id under which the answer is remembered is needed
  task?: Pick<Task, 'qid'>,
) {
  const M = MODULES_OF()[mod];
  const s = STATS()[mod];
  s.t++;
  if (ok) s.c++;
  if (ok && state.run) state.run.right = (state.run.right || 0) + 1;
  markWeek();
  s.hist.push(ok ? 1 : 0);
  if (s.hist.length > 40) s.hist.shift();
  if (state.run) {
    state.run.answered = (state.run.answered || 0) + 1;
    state.run.solved = (state.run.solved || 0) + (ok ? 1 : 0);
  }
  const wt = weekly().tally;
  const ws = (wt[state.mode + ':' + mod] = wt[state.mode + ':' + mod] || { c: 0, t: 0 });
  ws.t++;
  if (ok) {
    ws.c++;
    weeklyStep('right', mod);
  }
  if (task && task.qid) {
    state.meta.knowSeq++;
    MK.record(state.meta.know as Record<string, Required<Known>>, task.qid, ok, state.meta.knowSeq);
  }
  const right = (n: number) => s.hist.slice(-n).reduce((a, b) => a + b, 0);
  if (!state.run) return;
  // up at 5 of the last 6 right, down at 2 of the last 3 wrong; capped at the current world, otherwise the next world would start at its hardest tier
  const cur = tierFor(mod);
  const next =
    s.hist.length >= 6 && right(6) >= 5
      ? Math.min(worldCapFor(mod), cur + 1)
      : s.hist.length >= 3 && right(3) <= 1
        ? Math.max(1, cur - 1)
        : cur;
  if (next !== cur) {
    taskBox().tiers[mod] = next;
    levelOf(state.mode)[mod] = next;
    s.hist = [];
  }
}
/* ---------- Stamps ---------- */
export const giveStamps = (n: number) => {
  state.meta.stamps += n;
  state.meta.stampsTotal += n;
  return n;
};
export const addMat = (k: string, n: number) => {
  state.meta.materials[k] = (state.meta.materials[k] || 0) + n;
  state.meta.progressAt = new Date().toISOString();
};
// 1 stamp per 10 right answers in this adventure, paid at the end of every fight (won or lost)
export const payAnswers = () => {
  const n = Math.floor((state.run.right || 0) / 10);
  state.run.right = (state.run.right || 0) - n * 10;
  return giveStamps(n);
};
export const markWeek = () => {
  const k = MQ.isoWeek(new Date());
  if (!(state.meta.stampCard[k] >= 1)) state.meta.stampCard[k] = 1;
};
// has/get: owned and handed over in its own way instead of owned[id]
export interface Reward {
  id: string;
  name: string;
  desc: string;
  price?: number;
  stein?: number;
  world?: number;
  bg?: string;
  hero?: string;
  icon?: string;
  has?: () => boolean;
  get?: () => void;
}
export const REWARDS: Reward[] = [
  {
    id: 'map-w1-winter',
    name: 'Winterkarte',
    desc: 'Welt 1 in Zahlenquest bekommt einen eisblauen Hintergrund.',
    price: 25,
    world: 1,
    bg: '#24496E',
  },
  {
    id: 'map-w2-herbst',
    name: 'Herbstkarte',
    desc: 'Welt 2 in Zahlenquest bekommt einen braunen Hintergrund.',
    price: 25,
    world: 2,
    bg: '#57341F',
  },
  {
    id: 'map-w3-wald',
    name: 'Waldkarte',
    desc: 'Welt 3 in Zahlenquest bekommt einen dunkelgrünen Hintergrund.',
    price: 25,
    world: 3,
    bg: '#1D4A33',
  },
  {
    id: 'hero-kauz',
    name: 'Steinkauz',
    desc: 'Ein vierter Held für Zahlenquest. Er übt Einmaleins, Nachbarzahlen, Rätsel und Zahlwörter.',
    price: 40,
    hero: 'kauz',
  },
  {
    id: 'hut-zimmer2',
    name: 'Zweites Zimmer',
    desc: 'Deine Hütte wird größer. Möbel kannst du dann ins zweite Zimmer stellen.',
    price: 30,
    stein: 12,
    icon: '🏠',
    has: () => state.meta.hut.rooms >= 2,
    get: () => {
      state.meta.hut.rooms = 2;
    },
  },
  {
    id: 'hut-dachfenster',
    name: 'Dachfenster',
    desc: 'Gewinne Zahlenquest einmal durch alle drei Welten, dann bekommt deine Hütte ein rundes Dachfenster.',
    icon: '☀️',
  },
];
export const owns = (r: Reward) => (r.has ? r.has() : !!state.meta.owned[r.id]);
// only asked for rewards with a price
export const canBuy = (r: Reward) =>
  state.meta.stamps >= r.price! && (state.meta.materials.stein || 0) >= (r.stein || 0);
export const heroLocked = (s: { id: string }) => REWARDS.some((r) => r.hero === s.id && !state.meta.owned[r.id]);
/* ---------- Kleiderkammer ---------- */
// bought pieces live in owned['outfit-<id>']; the others are earned and checked live, so old saves get them too
// bought (price) or earned (need says how, got checks it)
export interface Outfit {
  id: string;
  name: string;
  price?: number;
  need?: () => string;
  got?: () => boolean;
}
export const OUTFITS: Outfit[] = [
  { id: 'strohhut', name: 'Strohhut', price: 15 },
  { id: 'schal', name: 'Schal', price: 10 },
  { id: 'brille', name: 'Brille', price: 12 },
  {
    id: 'ranzen',
    name: 'Ranzen',
    need: () => `Schaffe 4 Wochenaufgaben (${Math.min(4, goldWeeks())} von 4).`,
    got: () => goldWeeks() >= 4,
  },
  // an adventure is only won after its last world, so one win = all worlds of a unit beaten
  { id: 'krone', name: 'Krone', need: () => 'Gewinne ein ganzes Abenteuer.', got: () => state.meta.wins > 0 },
  // the first harvest in the Schulgarten sets owned['outfit-aehrenkranz']
  { id: 'aehrenkranz', name: 'Ährenkranz', need: () => 'Ernte zum ersten Mal im Schulgarten.' },
];
const goldWeeks = () => Object.values(state.meta.stampCard).filter((v) => v === 2).length;
export const hasOutfit = (o: Outfit) => !!state.meta.owned['outfit-' + o.id] || !!(o.got && o.got());
export const wornBy = (heroId: string) => {
  const o = OUTFITS.find((x) => x.id === state.meta.worn[heroId]);
  return o && hasOutfit(o) ? o.id : null;
};
export const heroSVG = (s: { shape: string; type: string; id: string }, evo: number, cls?: string) =>
  monsterSVG(s.shape, TYPES[s.type].color, evo, cls, { outfit: wornBy(s.id) });
/* ---------- Weekly goals ---------- */
// a new week starts fresh; finished weeks stay on the stamp card, nothing is taken away
export const weekly = () => {
  const k = MQ.isoWeek(new Date());
  if (state.meta.weekly.week !== k) state.meta.weekly = { week: k, progress: [], done: false, beaten: [], tally: {} };
  return state.meta.weekly;
};
export interface WeeklyGoal {
  m: string;
  kind: string;
  // undefined if every task type of the unit is switched off
  mod: string | undefined;
  n: number;
  subject: string;
  i: number;
}
// one goal per shown subject of the grade, from the week key and the enabled task types only.
// Every branch draws the same numbers, so switching a task type off changes no other goal. A hidden game is
// replaced from its own seed, so the other subjects keep their goals. i is the goal's slot in weekly.progress.
export function weeklyGoals() {
  const r = MQ.seeded(weekly().week);
  const goal = (r: () => number, m: string) => {
    const on = enabledMods(m);
    const kinds = ['right', 'elite', 'boss'].concat(MODES[m].worlds <= 2 ? ['win'] : []); // three worlds are too long for one week
    const kind = kinds[Math.floor(r() * kinds.length)];
    const mod = seededOrder(r, Object.keys(MODES[m].modules)).find((k) => on.includes(k));
    const n = kind === 'right' ? 15 + Math.floor(r() * 11) : kind === 'elite' ? 2 + Math.floor(r() * 2) : (r(), 1);
    return { m, kind, mod, n };
  };
  return curGrade()
    .subjects.map((sub, i) => {
      let g = goal(r, sub.modes[Math.floor(r() * sub.modes.length)]);
      if (!shown(g.m)) {
        const vis = sub.modes.filter(shown);
        if (!vis.length) return null;
        const r2 = MQ.seeded(weekly().week + ':' + sub.subject);
        g = goal(r2, vis[Math.floor(r2() * vis.length)]);
      }
      return Object.assign(g, { subject: sub.subject, i });
    })
    .filter(Boolean) as WeeklyGoal[];
}
export const seededOrder = <T>(r: () => number, arr: readonly T[]) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const goalText = (g: WeeklyGoal) => {
  const t = `„${MODES[g.m].title}“`;
  return g.kind === 'right'
    ? `Löse ${g.n} Aufgaben ${MODES[g.m].modules[g.mod!].icon} ${MODES[g.m].modules[g.mod!].name} richtig.`
    : g.kind === 'win'
      ? `Gewinne ein Abenteuer in ${t}.`
      : g.kind === 'elite'
        ? `Besiege ${g.n} Elitegegner in ${t}.`
        : `Besiege den Wochenboss in ${t}.`;
};
export const goalDone = (g: WeeklyGoal) => (weekly().progress[g.i] || 0) >= g.n;
let weeklyNews = false; // the card waits for the next calm screen (map or title)
export function weeklyStep(kind: string, mod?: string) {
  const w = weekly();
  if (w.done || !extraOn('wochenziele')) return;
  const goals = weeklyGoals();
  goals.forEach((g) => {
    if (g.m === state.mode && g.kind === kind && (kind !== 'right' || g.mod === mod))
      w.progress[g.i] = Math.min(g.n, (w.progress[g.i] || 0) + 1);
  });
  if (goals.every(goalDone)) {
    w.done = true;
    state.meta.stampCard[w.week] = 2;
    giveStamps(10);
    state.meta.progressAt = new Date().toISOString();
    weeklyNews = true;
  }
}
export function showWeeklyNews() {
  if (!weeklyNews) return;
  weeklyNews = false;
  const ov = modal(
    html`<h2>Wochenaufgabe geschafft</h2><p>Alle Ziele dieser Woche sind erledigt, dafür steht ein Stern auf deiner Stempelkarte.</p>${raw(stampLine(10))}<button class="btn" id="tutok" data-action="close">Weiter</button>`,
    { close: () => ov.remove() },
  );
  $('#tutok', ov).focus({ preventScroll: true });
}
export const stampLine = (n: number) => (n ? `<p class="stampgain" aria-label="${n} Stempel">+${n} 🏷️</p>` : '');
export function weakestModule() {
  let best: string | null = null,
    bestAcc = 2;
  for (const k of enabledMods()) {
    const s = STATS()[k];
    const acc = s.t === 0 ? 0.6 : s.c / s.t;
    if (acc < bestAcc) {
      bestAcc = acc;
      best = k;
    }
  }
  return best!; // at least one task type is always on
}
// a running duel lives only in memory
export function makeTask(mod: string, tier: number, opts?: { elite?: boolean; zero?: boolean; g?: string }) {
  const box = taskBox() || state.duel;
  box.recent = box.recent || {};
  const rec = (box.recent[mod] = box.recent[mod] || []);
  let t, sig;
  for (let i = 0; i < 12; i++) {
    if (state.mode === 'math') {
      t = MQ.generate(mod, tier, opts);
      t.kind = t.kind || 'num';
      t.group = mod + ':' + t.tier;
      sig = t.grid ? JSON.stringify(t.grid) : t.text;
    } else if (state.mode === 'bau') {
      t = MQ.BAU.generate(mod, tier);
      sig = t.sig;
    } else if (CFG().numGen) {
      t = CFG().numGen!(mod, tier, opts);
      t.kind = t.kind || 'num';
      t.group = mod + ':' + t.tier;
      sig = t.text;
    }
    // generated units may give one qid to a whole kind of task, so the question and answer tell repeats apart
    else {
      t = MK.generate(state.mode, mod, tier, state.meta.know, state.meta.knowSeq, {
        g: opts && opts.g,
        world: taskBox() ? taskBox().world : 1,
        enOff: enOff(),
      });
      sig = [t.qid, t.text || t.q, t.answer, t.answers].join('|');
    }
    if (!rec.includes(sig!)) break;
  }
  rec.push(sig!);
  if (rec.length > 8) rec.shift();
  return t!;
}
// switched-off task types are replaced by enabled ones the hero doesn't have yet
export type { Attack };
export function heroAttacks(): Attack[] {
  const on = enabledMods();
  const used = state.run.hero.attacks.map((a: Attack) => a.mod).filter((k: string) => on.includes(k));
  const spare = on.filter((k) => !used.includes(k));
  let i = 0;
  return state.run.hero.attacks.map((a: Attack) => {
    if (on.includes(a.mod)) return Object.assign({}, a);
    const k = spare.length ? spare.shift()! : on[i++ % on.length];
    return { name: CFG().extra[k], mod: k };
  });
}
export function gainXp(n: number) {
  state.run.hero.xp += n;
  let msgs: string[] = [];
  while (state.run.hero.xp >= xpNeeded(state.run.hero.level)) {
    state.run.hero.xp -= xpNeeded(state.run.hero.level);
    state.run.hero.level++;
    state.run.hero.maxHp += 8;
    state.run.hero.hp = Math.min(state.run.hero.maxHp, state.run.hero.hp + 8);
    msgs.push(`Level ${state.run.hero.level}! Alle Attacken machen mehr Schaden.`);
  }
  if (msgs.length) setTimeout(SFX.levelup, 1400);
  return msgs;
}
export function heal(n: number) {
  state.run.hero.hp = Math.min(state.run.hero.maxHp, state.run.hero.hp + n);
}
