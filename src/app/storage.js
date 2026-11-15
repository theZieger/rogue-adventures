/* ---------- Storage ---------- */
const KEY_META = 'mathquest_meta_v2';
const KEY_RUN_FOR = (m) => (m === 'math' ? 'mathquest_run_v1' : 'mathquest_run_' + m);
const KEY_TURM = KEY_RUN_FOR('turm');
function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}
function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    /* storage unavailable */
  }
}
function clear(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
}

const emptyStats = (m) => Object.fromEntries(Object.keys(MODES[m].modules).map((k) => [k, { c: 0, t: 0, hist: [] }]));
const defaultMeta = () => ({
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
  // Turmwacht: subjects = fixed by parents per grade, { [grade]: [1–3 subjects] } (null: the child chooses); last = right/total per subject of the latest run
  turm: { on: false, runs: 0, wins: 0, best: 0, subjects: null, last: {} },
});
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const TOP = MQ.TOP_PARTS;
const hasPart = (slot, id, m) =>
  TOP[slot][0].id === id || (TOP[slot].some((p) => p.id === id) && !!(m || meta).owned[`top-${slot}-${id}`]);
// Saves must always load: missing/wrong-typed fields fall back to defaults, old names map to new ones.
const RENAMES = {
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
function normMeta(raw) {
  const m = defaultMeta();
  if (isObj(raw))
    for (const k of Object.keys(m))
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
  ])
    if (!isObj(m[k])) m[k] = {};
  for (const k of Object.keys(m.materials))
    if (!Number.isInteger(m.materials[k]) || m.materials[k] < 0) delete m.materials[k];
  for (const [h, o] of Object.entries(m.worn)) if (typeof o !== 'string') delete m.worn[h];
  for (const k of ['stamps', 'stampsTotal']) m[k] = Number.isFinite(m[k]) ? Math.max(0, Math.floor(m[k])) : 0;
  for (const k of ['setup', 'storage', 'weekly', 'hut']) {
    const d = defaultMeta()[k];
    m[k] = Object.assign({}, m[k]);
    for (const f of Object.keys(d))
      if (typeof m[k][f] !== typeof d[f] || Array.isArray(m[k][f]) !== Array.isArray(d[f])) m[k][f] = d[f];
  }
  const wk = m.weekly;
  if (!isObj(wk.tally)) wk.tally = {};
  wk.progress = wk.progress.map((n) => (Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0));
  wk.beaten = wk.beaten.filter((x) => typeof x === 'string');
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
      .map(([g, L]) => [g, Object.fromEntries(Object.entries(L).filter(([, t]) => Number.isInteger(t) && t >= 1))]),
  );
  m.pantry = m.pantry.filter((it) => ITEMS[it]).slice(0, PANTRY_MAX);
  m.hidden = m.hidden.filter((x) => typeof x === 'string');
  if (!(m.speakRate >= 0.6 && m.speakRate <= 1.4)) m.speakRate = 1;
  m.started = Object.fromEntries(Object.entries(m.started).filter(([, n]) => Number.isInteger(n) && n > 0));
  m.hut.rooms = m.hut.rooms >= 2 ? 2 : 1;
  m.hut.items = m.hut.items.filter((id) => typeof id === 'string');
  const beds = isObj(m.garden) && Array.isArray(m.garden.beds) ? m.garden.beds : [];
  m.top = Object.fromEntries(Object.keys(TOP).map((s) => [s, hasPart(s, m.top[s], m) ? m.top[s] : TOP[s][0].id]));
  m.garden = {
    beds: defaultMeta().garden.beds.map((d, i) => {
      const b = beds[i];
      return isObj(b) && MK.CROPS[b.crop] && Number.isFinite(b.plantedAt)
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
const nat = (n) => (Number.isInteger(n) && n >= 0 ? n : 0);
// an early save had one list for every grade: each grade keeps the subjects it has
function turmFixed(subs) {
  const ok = (a, names) =>
    Array.isArray(a) && a.length && a.length <= 3 && new Set(a).size === a.length && a.every((x) => names.includes(x));
  const old = ok(subs, Object.keys(SUBJECTS)),
    out = {};
  for (const g of CURRICULUM.filter((x) => x.grade !== 1)) {
    const names = g.subjects.map((x) => x.subject),
      a = old ? subs.filter((x) => names.includes(x)) : isObj(subs) ? subs[g.grade] : null;
    if (ok(a, names)) out[g.grade] = a.slice();
  }
  return Object.keys(out).length ? out : null;
}
const own = (o, k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k);
const okScore = (v) => isObj(v) && Number.isInteger(v.c) && Number.isInteger(v.t) && v.c >= 0 && v.c <= v.t;
const PANTRY_MAX = 3;
const okStat = (v) => isObj(v) && Number.isFinite(v.c) && Number.isFinite(v.t) && Array.isArray(v.hist);
let meta = normMeta(load(KEY_META, null));
(function migrate() {
  const old = load('mathquest_meta_v1', null);
  if (old && !load(KEY_META, null)) {
    meta.runs = old.runs || 0;
    meta.wins = old.wins || 0;
    meta.dex = old.dex || {};
    meta.bestWorld = old.bestWorld || 0;
    for (const k in old.stats || {}) if (meta.stats.math[k]) meta.stats.math[k] = old.stats[k];
    for (const k in old.seenTut || {}) meta.seenTut['math:' + k] = true;
    save(KEY_META, meta);
  }
})();
meta = normMeta(meta);
let run = null;
// hidden in the parent area: 'grade:<n>' for a class, 'extra:<name>' for an extra (EXTRAS), 'en:<topic>' for an English topic
const grades = () => CURRICULUM.filter((g) => !meta.hidden.includes('grade:' + g.grade));
const curGrade = () => grades().find((g) => g.grade === meta.grade) || grades()[0] || CURRICULUM[0];
const gradeTabs = () =>
  grades().length < 2
    ? ''
    : `<div class="grades" role="group" aria-label="Klasse">${grades()
        .map(
          (g) =>
            `<button class="gradechip ${g === curGrade() ? 'on' : ''}" data-grade="${g.grade}" aria-pressed="${g === curGrade()}">${esc(g.label)}</button>`,
        )
        .join('')}</div>`;
// switched off in the parent area; at least two stay on per mode
const offList = (m) => (isObj(meta.off) && Array.isArray(meta.off[m]) ? meta.off[m] : []);
// hidden in the parent area: 'mode:<mode>' for a game, 'hero:<mode>:<id>' for a hero; a subject is hidden when all its games are
const shown = (m) => !meta.hidden.includes('mode:' + m);
const EXTRAS = {
  garten: ['Schulgarten', 'Beete bepflanzen und ernten.'],
  huette: ['Meine Hütte', 'Die Hütte einrichten, mit der Werkbank im Stempelheft.'],
  kreisel: ['Kreisel-Arena', 'Kreiselkämpfe auf der Karte und „Kreisel bauen“ im Stempelheft.'],
  duell: ['Duell zu zweit', 'Zwei Kinder lösen an einem Gerät abwechselnd Aufgaben.'],
  wochenziele: ['Wochenziele', 'Ziele für jede Woche und der Wochenboss auf der Karte.'],
  markt: ['Kaufladen in Zahlenquest', 'Im Kaufladen Kunden bedienen: Geld abzählen und Rückgeld geben.'],
};
const extraOn = (k) => !meta.hidden.includes('extra:' + k);
const enOff = () => meta.hidden.filter((x) => x.startsWith('en:')).map((x) => x.slice(3));
const heroShown = (m, s) => !meta.hidden.includes(`hero:${m}:${s.id}`);
const visSubjects = () =>
  curGrade()
    .subjects.map((sub) => Object.assign({}, sub, { modes: sub.modes.filter(shown) }))
    .filter((sub) => sub.modes.length);
const fightMods = (m) => Object.keys(MODES[m].modules).filter((k) => !MODES[m].modules[k].shop);
// worldCap 0 keeps a task type out of that world (the written methods start in world 3)
const inWorld = (m, k) => {
  const c = MODES[m].modules[k].worldCap;
  const b = run && (run.mode === m ? run : run.mode === 'turm' && run.turm.at[m]);
  return c[Math.min(b ? b.world : 1, c.length) - 1] > 0;
};
const enabledMods = (m) => {
  m = m || mode;
  const all = fightMods(m).filter((k) => inWorld(m, k));
  const on = all.filter((k) => !offList(m).includes(k));
  return on.length >= 2 ? on : all;
};
// the Kaufladen (node type `markt`) only exists in Zahlenquest, and only while parents leave „Geld“ on
const marketOn = () => mode === 'math' && !offList('math').includes('geld') && extraOn('markt');
const practice = (k) => (STATS()[k] ? STATS()[k].t : 0);
// a saved run is only removed by endRun or a new run, never as a side effect of saving
const saveAll = () => {
  save(KEY_META, meta);
  if (run && !run.over) save(KEY_RUN_FOR(run.mode), run);
};
function endRun() {
  if (run) {
    run.over = true;
    clear(KEY_RUN_FOR(run.mode));
  }
  save(KEY_META, meta);
}
function loadRun(m) {
  const r = load(KEY_RUN_FOR(m), null);
  const ok =
    isObj(r) &&
    isObj(r.hero) &&
    Array.isArray(r.map) &&
    isObj(r.tiers) &&
    Array.isArray(r.items) &&
    Array.isArray(r.path) &&
    Array.isArray(r.hero.attacks) &&
    Number.isFinite(r.world) &&
    Number.isFinite(r.floor) &&
    Number.isFinite(r.hero.hp) &&
    MODES[m].starters.some((s) => s.id === r.hero.id) &&
    r.world >= 1 &&
    r.world <= MODES[m].worlds &&
    r.floor >= 1 &&
    r.floor <= r.map.length;
  if (!ok) {
    if (r) clear(KEY_RUN_FOR(m));
    return null;
  }
  r.map = r.map.map((fl, f, all) =>
    Array.isArray(fl)
      ? fl.map((n, i) =>
          isObj(n)
            ? n
            : {
                t: n,
                c: 1.5 + (i - (fl.length - 1) / 2) * 1.1,
                n: f < all.length - 1 && Array.isArray(all[f + 1]) ? all[f + 1].map((_, j) => j) : [],
              },
        )
      : fl,
  );
  if (
    !r.map.every(
      (fl) =>
        Array.isArray(fl) &&
        fl.length &&
        fl.every((n) => isObj(n) && NODE_INFO[n.t] && Array.isArray(n.n) && Number.isFinite(n.c)),
    )
  ) {
    clear(KEY_RUN_FOR(m));
    return null;
  }
  if (isObj(r.node) && !NODE_INFO[r.node.type]) r.node = null;
  r.items = r.items.filter((it) => ITEMS[it]);
  r.hero.attacks.forEach((a) => {
    if (RENAMES[a.name]) a.name = RENAMES[a.name];
  });
  if (isObj(r.node) && isObj(r.node.enemy) && RENAMES[r.node.enemy.name])
    r.node.enemy.name = RENAMES[r.node.enemy.name];
  r.mode = m;
  return r;
}
