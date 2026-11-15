// The save: what is stored on the device, its defaults, and the repair every load goes through.
// Saves must always load: a missing or wrong-typed field falls back to its default, old names map to new ones.
import { CURRICULUM, MODE_KEYS, MODES, SUBJECTS, type Subject } from './curriculum.ts';
import { type Know, MK } from './knowledge.ts';
import { MQ } from './logic.ts';
import { TW } from './turm.ts';

export interface Score {
  c: number;
  t: number;
}
export interface Stat extends Score {
  hist: number[];
}
type TopSlot = keyof typeof TOP;
export interface Meta {
  runs: number;
  wins: number;
  dex: Record<string, { type: string; shape: string; world: number; mode: string }>;
  seenTut: Record<string, boolean>;
  stats: Record<string, Record<string, Stat>>;
  know: Know;
  knowSeq: number;
  evoUnlocked: Record<string, boolean>;
  bestWorld: number;
  seenNews: string;
  grade: number;
  off: Record<string, string[]>;
  lastStarter: Record<string, string>;
  sound: boolean;
  speak: boolean;
  voiceName: string;
  voiceEn: string;
  speakRate: number;
  setup: { done: boolean; skipped: boolean; at: string };
  pin: string;
  storage: { persisted: boolean; warnedAt: string };
  stamps: number;
  stampsTotal: number;
  stampCard: Record<string, number>;
  owned: Record<string, boolean>;
  worn: Record<string, string>;
  backupAt: string;
  progressAt: string;
  garden: { beds: { crop: string | null; plantedAt: number }[] };
  materials: Record<string, number>;
  pantry: string[];
  hut: { rooms: number; items: string[] };
  top: Record<TopSlot, string>;
  weekly: { week: string; progress: number[]; done: boolean; beaten: string[]; tally: Record<string, Score> };
  hidden: string[];
  level: Record<string, Record<string, number>>;
  started: Record<string, number>;
  // subjects: fixed by parents per grade, { [grade]: [1–3 subjects] } (null: the child chooses);
  // last: right/total per subject of the latest Turmwacht
  turm: {
    on: boolean;
    runs: number;
    wins: number;
    best: number;
    subjects: Record<number, Subject[]> | null;
    last: Record<string, Score>;
  };
}
// What a load hands to the repair: anything at all, until normMeta has looked at it.
type Unchecked = any;

export const KEY_META = 'mathquest_meta_v2';
export const KEY_RUN_FOR = (m: string) => (m === 'math' ? 'mathquest_run_v1' : 'mathquest_run_' + m);
export const KEY_TURM = KEY_RUN_FOR('turm');
export function load<T>(key: string, fallback: T): Unchecked | T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}
export function save(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    /* storage unavailable */
  }
}
export function clear(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
}

export const emptyStats = (m: string): Record<string, Stat> =>
  Object.fromEntries(Object.keys(MODES[m].modules).map((k) => [k, { c: 0, t: 0, hist: [] }]));
export const defaultMeta = (): Meta => ({
  runs: 0,
  wins: 0,
  dex: {},
  seenTut: {},
  stats: Object.fromEntries(MODE_KEYS.map((m) => [m, emptyStats(m)])),
  know: {},
  knowSeq: 0,
  evoUnlocked: {},
  bestWorld: 0,
  seenNews: '',
  grade: 3,
  off: {},
  lastStarter: {},
  sound: true,
  speak: true,
  voiceName: '',
  voiceEn: '',
  speakRate: 1,
  setup: { done: false, skipped: false, at: '' },
  pin: '',
  storage: { persisted: false, warnedAt: '' },
  stamps: 0,
  stampsTotal: 0,
  stampCard: {},
  owned: {},
  worn: {},
  backupAt: '',
  progressAt: '',
  garden: { beds: [0, 1, 2, 3].map(() => ({ crop: null, plantedAt: 0 })) },
  materials: {},
  pantry: [],
  hut: { rooms: 1, items: [] },
  top: { tip: 'stahl', ring: 'zahn', disc: 'leicht' },
  weekly: { week: '', progress: [], done: false, beaten: [], tally: {} },
  hidden: [],
  level: {},
  started: {},
  turm: { on: false, runs: 0, wins: 0, best: 0, subjects: null, last: {} },
});
export const isObj = (v: unknown): v is Record<string, Unchecked> => !!v && typeof v === 'object' && !Array.isArray(v);
export const TOP = MQ.TOP_PARTS;
// the first part of a slot belongs to everyone, the others are bought or found
export const ownsPart = (m: Pick<Meta, 'owned'>, slot: TopSlot, id: string) =>
  TOP[slot][0].id === id || (TOP[slot].some((p) => p.id === id) && !!m.owned[`top-${slot}-${id}`]);
// Saves must always load: missing/wrong-typed fields fall back to defaults, old names map to new ones.
export const RENAMES: Record<string, string> = {
  Flummibatz: 'Sumpfbrocken',
  Tropfling: 'Regenwicht',
  Zündi: 'Streichholzkopf',
  Großglibber: 'Moorschlund',
  Flatterfledi: 'Nachtschwinge',
  Kristallkäfer: 'Glaspanzer',
  Aschendrache: 'Ofenwurm',
  Sturmgeist: 'Sturmreiter',
  Zweifelgeist: 'Der Zweifler',
  Vergessgeist: 'Der Vergessliche',
  Verwechsler: 'Der Verwechsler',
  Schwindelgeist: 'Der Schwindler',
  'Strenger Richter': 'Der strenge Richter',
  Blubberrätsel: 'Tiefseerätsel',
  Rankenrechnen: 'Honigrechnung',
  Schattenschnitt: 'Rückwärtsgang',
  Sternenmal: 'Malmühle',
  Geheimrätsel: 'Zifferncode',
  Reihenrausch: 'Treppenlauf',
  Tintenfass: 'Druckerpresse',
  Wörterwirbel: 'Rezeptbuch',
};
// also checks progress that comes in from a save code
export function normMeta(raw: unknown): Meta {
  const m: Record<keyof Meta, Unchecked> = defaultMeta();
  if (isObj(raw))
    for (const k of Object.keys(m) as (keyof Meta)[])
      if (raw[k] != null && typeof raw[k] === typeof m[k] && Array.isArray(raw[k]) === Array.isArray(m[k]))
        m[k] = raw[k];
  for (const k of [
    'dex',
    'seenTut',
    'stats',
    'know',
    'evoUnlocked',
    'off',
    'lastStarter',
    'stampCard',
    'owned',
    'materials',
    'worn',
  ] as const)
    if (!isObj(m[k])) m[k] = {};
  for (const k of Object.keys(m.materials))
    if (!Number.isInteger(m.materials[k]) || m.materials[k] < 0) delete m.materials[k];
  for (const [h, o] of Object.entries(m.worn)) if (typeof o !== 'string') delete m.worn[h];
  for (const k of ['stamps', 'stampsTotal'] as const) m[k] = Number.isFinite(m[k]) ? Math.max(0, Math.floor(m[k])) : 0;
  for (const k of ['setup', 'storage', 'weekly', 'hut'] as const) {
    const d: Record<string, unknown> = defaultMeta()[k];
    m[k] = Object.assign({}, m[k]);
    for (const f of Object.keys(d))
      if (typeof m[k][f] !== typeof d[f] || Array.isArray(m[k][f]) !== Array.isArray(d[f])) m[k][f] = d[f];
  }
  const wk = m.weekly;
  if (!isObj(wk.tally)) wk.tally = {};
  wk.progress = wk.progress.map((n: unknown) => (Number.isFinite(n) ? Math.max(0, Math.floor(n as number)) : 0));
  wk.beaten = wk.beaten.filter((x: unknown) => typeof x === 'string');
  for (const [k, v] of Object.entries(wk.tally)) if (!okStat(Object.assign({ hist: [] }, v))) delete wk.tally[k];
  for (const [o, n] of Object.entries(RENAMES))
    if (m.dex[o]) {
      if (!m.dex[n]) m.dex[n] = m.dex[o];
      delete m.dex[o];
    }
  for (const g of MODE_KEYS) {
    if (!isObj(m.stats[g])) m.stats[g] = emptyStats(g);
    for (const k of Object.keys(MODES[g].modules)) if (!okStat(m.stats[g][k])) m.stats[g][k] = { c: 0, t: 0, hist: [] };
  }
  if (!Number.isFinite(m.knowSeq)) m.knowSeq = 0;
  m.level = Object.fromEntries(
    Object.entries(m.level)
      .filter(([, L]) => isObj(L))
      .map(([g, L]: [string, Unchecked]) => [
        g,
        Object.fromEntries(Object.entries(L).filter(([, t]: [string, Unchecked]) => Number.isInteger(t) && t >= 1)),
      ]),
  );
  m.pantry = m.pantry.filter((it: string) => (MQ.ITEMS as Record<string, unknown>)[it]).slice(0, PANTRY_MAX);
  m.hidden = m.hidden.filter((x: unknown) => typeof x === 'string');
  if (!(m.speakRate >= 0.6 && m.speakRate <= 1.4)) m.speakRate = 1;
  m.started = Object.fromEntries(
    Object.entries(m.started).filter(([, n]: [string, Unchecked]) => Number.isInteger(n) && n > 0),
  );
  m.hut.rooms = m.hut.rooms >= 2 ? 2 : 1;
  m.hut.items = m.hut.items.filter((id: unknown) => typeof id === 'string');
  const beds = isObj(m.garden) && Array.isArray(m.garden.beds) ? m.garden.beds : [];
  m.top = Object.fromEntries(
    (Object.keys(TOP) as TopSlot[]).map((s) => [s, ownsPart(m, s, m.top[s]) ? m.top[s] : TOP[s][0].id]),
  );
  m.garden = {
    beds: defaultMeta().garden.beds.map((d, i) => {
      const b = beds[i];
      return isObj(b) && (MK.CROPS as Record<string, unknown>)[b.crop] && Number.isFinite(b.plantedAt)
        ? { crop: b.crop, plantedAt: b.plantedAt }
        : d;
    }),
  };
  const t = m.turm,
    subs = t.subjects;
  m.turm = {
    on: t.on === true,
    runs: nat(t.runs),
    wins: nat(t.wins),
    best: Number.isInteger(t.best) && t.best >= 0 && t.best <= TW.WAVES.length ? t.best : 0,
    subjects: turmFixed(subs),
    last: isObj(t.last)
      ? Object.fromEntries(Object.entries(t.last).filter(([x, v]) => own(SUBJECTS, x) && okScore(v)))
      : {},
  };
  return m;
}
export const nat = (n: unknown) => (typeof n === 'number' && Number.isInteger(n) && n >= 0 ? n : 0);
// an early save had one list for every grade: each grade keeps the subjects it has
export function turmFixed(subs: Unchecked): Meta['turm']['subjects'] {
  const ok = (a: Unchecked, names: string[]) =>
    Array.isArray(a) && a.length && a.length <= 3 && new Set(a).size === a.length && a.every((x) => names.includes(x));
  const old = ok(subs, Object.keys(SUBJECTS)),
    out: Record<number, Subject[]> = {};
  for (const g of CURRICULUM.filter((x) => x.grade !== 1)) {
    const names: string[] = g.subjects.map((x) => x.subject),
      a = old ? subs.filter((x: string) => names.includes(x)) : isObj(subs) ? subs[g.grade] : null;
    if (ok(a, names)) out[g.grade] = a.slice();
  }
  return Object.keys(out).length ? out : null;
}
export const own = (o: object, k: unknown) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k);
export const okScore = (v: unknown) =>
  isObj(v) && Number.isInteger(v.c) && Number.isInteger(v.t) && v.c >= 0 && v.c <= v.t;
export const PANTRY_MAX = 3;
export const okStat = (v: unknown) => isObj(v) && Number.isFinite(v.c) && Number.isFinite(v.t) && Array.isArray(v.hist);
