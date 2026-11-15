/* ---------- Storage ---------- */
const hasPart = (slot, id) => ownsPart(meta, slot, id);
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
