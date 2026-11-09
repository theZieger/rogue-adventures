(() => {
  const { rnd, pick, shuffle, TYPES, BEATS, ENEMY_MOVES, ITEMS, makeMap, euro } = MQ;
  const MODES = {
    math: { modules: MQ.MODULES, starters: MQ.STARTERS, extra: MQ.EXTRA_ATTACKS, enemies: MQ.ENEMIES, events: MQ.EVENTS, tut: null, worlds: 3, title: 'Zahlenquest', icon: '🧮', sub: 'Rechnen und Zahlen', mine: true },
    bau: { modules: MQ.BAU.MODULES, starters: MQ.BAU.STARTERS, extra: MQ.BAU.EXTRA, enemies: MQ.BAU.ENEMIES, events: MQ.BAU.EVENTS, moves: MQ.BAU.MOVES, tut: MQ.BAU.TUT, worlds: 2, worldAttacks: MQ.BAU.WORLD_ATTACKS, title: 'Die Baustelle', icon: '🏗️', sub: 'Würfel, Körper, Netze, Flächen, Spiegelbilder und Vielecke', mine: true },
    ethik: MK.MODES.ethik,
    kirchenjahr: MK.MODES.kirchenjahr,
    kartoffel: MK.MODES.kartoffel,
    woerterwerkstatt: MK.MODES.woerterwerkstatt,
    satzbaustelle: MK.MODES.satzbaustelle,
    kornkammer: MK.MODES.kornkammer,
    wetterstation: MK.MODES.wetterstation,
    kompass: MK.MODES.kompass,
    freunde: MK.MODES.freunde,
    jahrmarkt: MJ.MODE,
  };
  const MODE_KEYS = ['math', 'bau', 'ethik', 'kirchenjahr', 'kartoffel', 'woerterwerkstatt', 'satzbaustelle', 'kornkammer', 'wetterstation', 'kompass', 'freunde', 'jahrmarkt'];
  // the title screen builds itself from this list
  const CURRICULUM = [
    { grade: 3, label: 'Klasse 3', subjects: [
      { subject: 'Mathe', icon: '🔢', modes: ['math', 'bau', 'jahrmarkt'] },
      { subject: 'Deutsch', icon: '📖', modes: ['woerterwerkstatt', 'satzbaustelle'] },
      { subject: 'Ethik', icon: '🕊️', modes: ['ethik', 'kirchenjahr', 'freunde'] },
      { subject: 'Sachkunde', icon: '🌱', modes: ['kartoffel', 'kornkammer', 'wetterstation', 'kompass'] },
    ] },
  ];
  let mode = 'math';
  const CFG = () => MODES[mode];
  const MODULES_OF = () => CFG().modules;
  const MODKEYS = () => Object.keys(CFG().modules);
  const $ = (sel, el) => (el || document).querySelector(sel);
  const app = $('#app');
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // svg, not emoji: emoji arrows differ in size between fonts
  const arrow = (dir) => `<svg class="arr arr-${dir}" viewBox="0 0 20 20" aria-label="${{ r: 'rechts', l: 'links', d: 'unten', u: 'oben' }[dir]}"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Storage ---------- */
  const KEY_META = 'mathquest_meta_v2';
  const KEY_RUN_FOR = (m) => (m === 'math' ? 'mathquest_run_v1' : 'mathquest_run_' + m);
  function load(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } }
  function clear(key) { try { localStorage.removeItem(key); } catch (e) { } }

  const emptyStats = (m) => Object.fromEntries(Object.keys(MODES[m].modules).map((k) => [k, { c: 0, t: 0, hist: [] }]));
  const defaultMeta = () => ({ runs: 0, wins: 0, dex: {}, seenTut: {}, stats: Object.fromEntries(MODE_KEYS.map((m) => [m, emptyStats(m)])), know: {}, knowSeq: 0, evoUnlocked: {}, bestWorld: 0, seenNews: '', grade: 3, off: {}, lastStarter: {}, sound: true,
    setup: { done: false, skipped: false, at: '' }, pin: '', storage: { persisted: false, warnedAt: '' }, stamps: 0, stampsTotal: 0, stampCard: {}, owned: {}, worn: {}, backupAt: '', progressAt: '', garden: { beds: [0, 1, 2, 3].map(() => ({ crop: null, plantedAt: 0 })) }, materials: {}, pantry: [], hut: { rooms: 1, items: [] }, top: { tip: 'stahl', ring: 'zahn', disc: 'leicht' },
    weekly: { week: '', progress: [], done: false, beaten: [], tally: {} } });
  const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const TOP = MQ.TOP_PARTS;
  const hasPart = (slot, id, m) => TOP[slot][0].id === id || (TOP[slot].some((p) => p.id === id) && !!(m || meta).owned[`top-${slot}-${id}`]);
  // Saves must always load: missing/wrong-typed fields fall back to defaults, old names map to new ones.
  const RENAMES = { Flummibatz: 'Sumpfbrocken', Tropfling: 'Regenwicht', 'Zündi': 'Streichholzkopf', 'Großglibber': 'Moorschlund', Flatterfledi: 'Nachtschwinge', 'Kristallkäfer': 'Glaspanzer', Aschendrache: 'Ofenwurm', Sturmgeist: 'Sturmreiter',
    Zweifelgeist: 'Der Zweifler', Vergessgeist: 'Der Vergessliche', Verwechsler: 'Der Verwechsler', Schwindelgeist: 'Der Schwindler', 'Strenger Richter': 'Der strenge Richter',
    'Blubberrätsel': 'Tiefseerätsel', Rankenrechnen: 'Honigrechnung', Schattenschnitt: 'Rückwärtsgang', Sternenmal: 'Malmühle', 'Geheimrätsel': 'Zifferncode', Reihenrausch: 'Treppenlauf', Tintenfass: 'Druckerpresse', 'Wörterwirbel': 'Rezeptbuch' };
  // also checks progress that comes in from a save code
  function normMeta(raw) {
    const m = defaultMeta();
    if (isObj(raw)) for (const k of Object.keys(m)) if (raw[k] != null && typeof raw[k] === typeof m[k] && Array.isArray(raw[k]) === Array.isArray(m[k])) m[k] = raw[k];
    for (const k of ['dex', 'seenTut', 'stats', 'know', 'evoUnlocked', 'off', 'lastStarter', 'stampCard', 'owned', 'materials', 'worn']) if (!isObj(m[k])) m[k] = {};
    for (const k of Object.keys(m.materials)) if (!Number.isInteger(m.materials[k]) || m.materials[k] < 0) delete m.materials[k];
    for (const [h, o] of Object.entries(m.worn)) if (typeof o !== 'string') delete m.worn[h];
    for (const k of ['stamps', 'stampsTotal']) m[k] = Number.isFinite(m[k]) ? Math.max(0, Math.floor(m[k])) : 0;
    for (const k of ['setup', 'storage', 'weekly', 'hut']) { const d = defaultMeta()[k]; m[k] = Object.assign({}, m[k]); for (const f of Object.keys(d)) if (typeof m[k][f] !== typeof d[f] || Array.isArray(m[k][f]) !== Array.isArray(d[f])) m[k][f] = d[f]; }
    const wk = m.weekly; if (!isObj(wk.tally)) wk.tally = {}; wk.progress = wk.progress.map((n) => (Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0)); wk.beaten = wk.beaten.filter((x) => typeof x === 'string');
    for (const [k, v] of Object.entries(wk.tally)) if (!okStat(Object.assign({ hist: [] }, v))) delete wk.tally[k];
    for (const [o, n] of Object.entries(RENAMES)) if (m.dex[o]) { if (!m.dex[n]) m.dex[n] = m.dex[o]; delete m.dex[o]; }
    for (const g of MODE_KEYS) { if (!isObj(m.stats[g])) m.stats[g] = emptyStats(g); for (const k of Object.keys(MODES[g].modules)) if (!okStat(m.stats[g][k])) m.stats[g][k] = { c: 0, t: 0, hist: [] }; }
    if (!Number.isFinite(m.knowSeq)) m.knowSeq = 0;
    m.pantry = m.pantry.filter((it) => ITEMS[it]).slice(0, PANTRY_MAX);
    m.hut.rooms = m.hut.rooms >= 2 ? 2 : 1; m.hut.items = m.hut.items.filter((id) => typeof id === 'string');
    const beds = isObj(m.garden) && Array.isArray(m.garden.beds) ? m.garden.beds : [];
    m.top = Object.fromEntries(Object.keys(TOP).map((s) => [s, hasPart(s, m.top[s], m) ? m.top[s] : TOP[s][0].id]));
    m.garden = { beds: defaultMeta().garden.beds.map((d, i) => { const b = beds[i]; return isObj(b) && MK.CROPS[b.crop] && Number.isFinite(b.plantedAt) ? { crop: b.crop, plantedAt: b.plantedAt } : d; }) };
    return m;
  }
  const PANTRY_MAX = 3;
  const okStat = (v) => isObj(v) && Number.isFinite(v.c) && Number.isFinite(v.t) && Array.isArray(v.hist);
  let meta = normMeta(load(KEY_META, null));
  (function migrate() { const old = load('mathquest_meta_v1', null); if (old && !load(KEY_META, null)) { meta.runs = old.runs || 0; meta.wins = old.wins || 0; meta.dex = old.dex || {}; meta.bestWorld = old.bestWorld || 0; for (const k in (old.stats || {})) if (meta.stats.math[k]) meta.stats.math[k] = old.stats[k]; for (const k in (old.seenTut || {})) meta.seenTut['math:' + k] = true; save(KEY_META, meta); } })();
  meta = normMeta(meta);
  let run = null;
  const curGrade = () => CURRICULUM.find((g) => g.grade === meta.grade) || CURRICULUM[0];
  const gradeTabs = () => `<div class="grades" role="group" aria-label="Klasse">${CURRICULUM.map((g) => `<button class="gradechip ${g === curGrade() ? 'on' : ''}" data-grade="${g.grade}" aria-pressed="${g === curGrade()}">${esc(g.label)}</button>`).join('')}</div>`;
  // switched off in the parent area; at least two stay on per mode
  const offList = (m) => (isObj(meta.off) && Array.isArray(meta.off[m]) ? meta.off[m] : []);
  const fightMods = (m) => Object.keys(MODES[m].modules).filter((k) => !MODES[m].modules[k].shop);
  // worldCap 0 keeps a task type out of that world (the written methods start in world 3)
  const inWorld = (m, k) => { const c = MODES[m].modules[k].worldCap; return c[Math.min(run && run.mode === m ? run.world : 1, c.length) - 1] > 0; };
  const enabledMods = (m) => { m = m || mode; const all = fightMods(m).filter((k) => inWorld(m, k)); const on = all.filter((k) => !offList(m).includes(k)); return on.length >= 2 ? on : all; };
  // coins and the market only exist in Zahlenquest, and only while parents leave „Geld“ on
  const marketOn = () => mode === 'math' && !offList('math').includes('geld');
  const practice = (k) => (STATS()[k] ? STATS()[k].t : 0);
  // a saved run is only removed by endRun or a new run, never as a side effect of saving
  const saveAll = () => { save(KEY_META, meta); if (run && !run.over) save(KEY_RUN_FOR(run.mode), run); };
  function endRun() { if (run) { run.over = true; clear(KEY_RUN_FOR(run.mode)); } save(KEY_META, meta); }
  function loadRun(m) {
    const r = load(KEY_RUN_FOR(m), null);
    const ok = isObj(r) && isObj(r.hero) && Array.isArray(r.map) && isObj(r.tiers) && Array.isArray(r.items) && Array.isArray(r.path) && Array.isArray(r.hero.attacks)
      && Number.isFinite(r.world) && Number.isFinite(r.floor) && Number.isFinite(r.hero.hp) && MODES[m].starters.some((s) => s.id === r.hero.id) && r.world >= 1 && r.world <= MODES[m].worlds && r.floor >= 1 && r.floor <= r.map.length;
    if (!ok) { if (r) clear(KEY_RUN_FOR(m)); return null; }
    r.map = r.map.map((fl, f, all) => (Array.isArray(fl) ? fl.map((n, i) => (isObj(n) ? n : { t: n, c: 1.5 + (i - (fl.length - 1) / 2) * 1.1, n: f < all.length - 1 && Array.isArray(all[f + 1]) ? all[f + 1].map((_, j) => j) : [] })) : fl));
    if (!r.map.every((fl) => Array.isArray(fl) && fl.length && fl.every((n) => isObj(n) && NODE_INFO[n.t] && Array.isArray(n.n) && Number.isFinite(n.c)))) { clear(KEY_RUN_FOR(m)); return null; }
    if (isObj(r.node) && !NODE_INFO[r.node.type]) r.node = null;
    r.items = r.items.filter((it) => ITEMS[it]);
    r.coins = Number.isFinite(r.coins) ? Math.max(0, Math.floor(r.coins)) : 0;
    r.hero.attacks.forEach((a) => { if (RENAMES[a.name]) a.name = RENAMES[a.name]; });
    if (isObj(r.node) && isObj(r.node.enemy) && RENAMES[r.node.enemy.name]) r.node.enemy.name = RENAMES[r.node.enemy.name];
    r.mode = m; return r;
  }

  /* ---------- Monster art ---------- */
  const monsterSVG = MONART.monsterSVG; const shade = MONART.shade;

  /* ---------- Helpers ---------- */
  const heroName = () => heroSpec().names[run.hero.evo];
  const heroSpec = () => CFG().starters.find((s) => s.id === run.hero.id);
  const STATS = () => meta.stats[mode];
  const tutKey = (k) => mode + ':' + k;
  const typeChip = (t) => `<span class="chip" style="background:${TYPES[t].color};color:#1C2541">${TYPES[t].icon} ${TYPES[t].name}</span>`;
  const xpNeeded = (lvl) => 20 + lvl * 15;
  const worldCapFor = (mod) => { const M = MODULES_OF()[mod]; return Math.min(M.maxTier || Infinity, M.worldCap[Math.min(run.world, M.worldCap.length) - 1]); };
  function tierFor(mod) { return Math.max(1, Math.min(worldCapFor(mod), run.tiers[mod] || 1)); }
  function recordAnswer(mod, ok, task) {
    const M = MODULES_OF()[mod]; const s = STATS()[mod]; s.t++; if (ok) s.c++; if (ok && run) run.right = (run.right || 0) + 1; markWeek(); s.hist.push(ok ? 1 : 0); if (s.hist.length > 40) s.hist.shift();
    const wt = weekly().tally; const ws = wt[mode + ':' + mod] = wt[mode + ':' + mod] || { c: 0, t: 0 }; ws.t++; if (ok) { ws.c++; weeklyStep('right', mod); }
    if (task && task.qid) { meta.knowSeq++; MK.record(meta.know, task.qid, ok, meta.knowSeq); }
    const recent = s.hist.slice(-6); const acc = recent.reduce((a, b) => a + b, 0) / recent.length;
    // capped at the current world, otherwise the next world would start at its hardest tier
    if (run && recent.length >= 6) { const cur = tierFor(mod); if (acc >= 0.85) { run.tiers[mod] = Math.min(worldCapFor(mod), cur + 1); s.hist = []; } else if (acc < 0.5) { run.tiers[mod] = Math.max(1, cur - 1); s.hist = []; } }
  }
  /* ---------- Stamps ---------- */
  const giveStamps = (n) => { meta.stamps += n; meta.stampsTotal += n; return n; };
  const addMat = (k, n) => { meta.materials[k] = (meta.materials[k] || 0) + n; meta.progressAt = new Date().toISOString(); };
  // 1 stamp per 10 right answers in this adventure, paid at the end of every fight (won or lost)
  const payAnswers = () => { const n = Math.floor((run.right || 0) / 10); run.right = (run.right || 0) - n * 10; return giveStamps(n); };
  const markWeek = () => { const k = MQ.isoWeek(new Date()); if (!(meta.stampCard[k] >= 1)) meta.stampCard[k] = 1; };
  const REWARDS = [
    { id: 'map-w1-winter', name: 'Winterkarte', desc: 'Welt 1 in Zahlenquest bekommt einen eisblauen Hintergrund.', price: 25, world: 1, bg: '#24496E' },
    { id: 'map-w2-herbst', name: 'Herbstkarte', desc: 'Welt 2 in Zahlenquest bekommt einen braunen Hintergrund.', price: 25, world: 2, bg: '#57341F' },
    { id: 'map-w3-wald', name: 'Waldkarte', desc: 'Welt 3 in Zahlenquest bekommt einen dunkelgrünen Hintergrund.', price: 25, world: 3, bg: '#1D4A33' },
    { id: 'hero-kauz', name: 'Steinkauz', desc: 'Ein vierter Held für Zahlenquest. Er übt Einmaleins, Nachbarzahlen, Rätsel und Zahlwörter.', price: 40, hero: 'kauz' },
    { id: 'hut-zimmer2', name: 'Zweites Zimmer', desc: 'Deine Hütte wird größer. Möbel kannst du dann ins zweite Zimmer stellen.', price: 30, stein: 12, icon: '🏠', has: () => meta.hut.rooms >= 2, get: () => { meta.hut.rooms = 2; } },
    { id: 'hut-dachfenster', name: 'Dachfenster', desc: 'Gewinne Zahlenquest einmal durch alle drei Welten, dann bekommt deine Hütte ein rundes Dachfenster.', icon: '☀️' },
  ];
  const owns = (r) => (r.has ? r.has() : !!meta.owned[r.id]);
  const canBuy = (r) => meta.stamps >= r.price && (meta.materials.stein || 0) >= (r.stein || 0);
  const heroLocked = (s) => REWARDS.some((r) => r.hero === s.id && !meta.owned[r.id]);
  /* ---------- Kleiderkammer ---------- */
  // bought pieces live in owned['outfit-<id>']; the others are earned and checked live, so old saves get them too
  const OUTFITS = [
    { id: 'strohhut', name: 'Strohhut', price: 15 },
    { id: 'schal', name: 'Schal', price: 10 },
    { id: 'brille', name: 'Brille', price: 12 },
    { id: 'ranzen', name: 'Ranzen', need: () => `Schaffe 4 Wochenaufgaben (${Math.min(4, goldWeeks())} von 4).`, got: () => goldWeeks() >= 4 },
    // an adventure is only won after its last world, so one win = all worlds of a unit beaten
    { id: 'krone', name: 'Krone', need: () => 'Gewinne ein ganzes Abenteuer.', got: () => meta.wins > 0 },
    // the first harvest in the Schulgarten sets owned['outfit-aehrenkranz']
    { id: 'aehrenkranz', name: 'Ährenkranz', need: () => 'Ernte zum ersten Mal im Schulgarten.' },
  ];
  const goldWeeks = () => Object.values(meta.stampCard).filter((v) => v === 2).length;
  const hasOutfit = (o) => !!meta.owned['outfit-' + o.id] || !!(o.got && o.got());
  const wornBy = (heroId) => { const o = OUTFITS.find((x) => x.id === meta.worn[heroId]); return o && hasOutfit(o) ? o.id : null; };
  const heroSVG = (s, evo, cls) => monsterSVG(s.shape, TYPES[s.type].color, evo, cls, { outfit: wornBy(s.id) });
  /* ---------- Weekly goals ---------- */
  // a new week starts fresh; finished weeks stay on the stamp card, nothing is taken away
  const weekly = () => { const k = MQ.isoWeek(new Date()); if (meta.weekly.week !== k) meta.weekly = { week: k, progress: [], done: false, beaten: [], tally: {} }; return meta.weekly; };
  // one goal per subject of the grade, from the week key and the enabled task types only.
  // Every branch draws the same numbers, so switching a task type off changes no other goal.
  function weeklyGoals() {
    const r = MQ.seeded(weekly().week);
    return curGrade().subjects.map((sub) => {
      const m = sub.modes[Math.floor(r() * sub.modes.length)]; const on = enabledMods(m);
      const kinds = ['right', 'elite', 'boss'].concat(MODES[m].worlds <= 2 ? ['win'] : []); // three worlds are too long for one week
      const kind = kinds[Math.floor(r() * kinds.length)]; const mod = seededOrder(r, Object.keys(MODES[m].modules)).find((k) => on.includes(k));
      const n = kind === 'right' ? 15 + Math.floor(r() * 11) : kind === 'elite' ? 2 + Math.floor(r() * 2) : (r(), 1);
      return { m, kind, mod, n, subject: sub.subject };
    });
  }
  const seededOrder = (r, arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const goalText = (g) => { const t = `„${MODES[g.m].title}“`; return g.kind === 'right' ? `Löse ${g.n} Aufgaben ${MODES[g.m].modules[g.mod].icon} ${MODES[g.m].modules[g.mod].name} richtig.` : g.kind === 'win' ? `Gewinne ein Abenteuer in ${t}.` : g.kind === 'elite' ? `Besiege ${g.n} Elitegegner in ${t}.` : `Besiege den Wochenboss in ${t}.`; };
  const goalDone = (g, i) => (weekly().progress[i] || 0) >= g.n;
  let weeklyNews = false; // the card waits for the next calm screen (map or title)
  function weeklyStep(kind, mod) {
    const w = weekly(); if (w.done) return; const goals = weeklyGoals();
    goals.forEach((g, i) => { if (g.m === mode && g.kind === kind && (kind !== 'right' || g.mod === mod)) w.progress[i] = Math.min(g.n, (w.progress[i] || 0) + 1); });
    if (goals.every(goalDone)) { w.done = true; meta.stampCard[w.week] = 2; giveStamps(10); meta.progressAt = new Date().toISOString(); weeklyNews = true; }
  }
  function showWeeklyNews() {
    if (!weeklyNews) return; weeklyNews = false;
    const ov = modal(`<h2>Wochenaufgabe geschafft</h2><p>Alle Ziele dieser Woche sind erledigt, dafür steht ein Stern auf deiner Stempelkarte.</p>${stampLine(10)}<button class="btn" id="tutok">Weiter</button>`);
    $('#tutok', ov).focus({ preventScroll: true }); $('#tutok', ov).onclick = () => ov.remove();
  }
  const stampLine = (n) => (n ? `<p class="stampgain" aria-label="${n} Stempel">+${n} 🏷️</p>` : '');
  function weakestModule() { let best = null, bestAcc = 2; for (const k of enabledMods()) { const s = STATS()[k]; const acc = s.t === 0 ? 0.6 : s.c / s.t; if (acc < bestAcc) { bestAcc = acc; best = k; } } return best; }
  let duel = null; // a running duel lives only in memory
  function makeTask(mod, tier, opts) {
    const box = run || duel; box.recent = box.recent || {}; const rec = box.recent[mod] = box.recent[mod] || [];
    let t, sig;
    for (let i = 0; i < 12; i++) {
      if (mode === 'math') { t = MQ.generate(mod, tier, opts); t.kind = t.kind || 'num'; t.group = mod + ':' + t.tier; sig = t.grid ? JSON.stringify(t.grid) : t.text; }
      else if (mode === 'bau') { t = MQ.BAU.generate(mod, tier); sig = t.sig; }
      else if (CFG().numGen) { t = CFG().numGen(mod, tier, opts); t.kind = t.kind || 'num'; t.group = mod + ':' + t.tier; sig = t.text; }
      else { t = MK.generate(mode, mod, tier, meta.know, meta.knowSeq, { g: opts && opts.g, world: run ? run.world : 1 }); sig = t.qid; }
      if (!rec.includes(sig)) break;
    }
    rec.push(sig); if (rec.length > 8) rec.shift();
    return t;
  }
  // switched-off task types are replaced by enabled ones the hero doesn't have yet
  function heroAttacks() {
    const on = enabledMods(); const used = run.hero.attacks.map((a) => a.mod).filter((k) => on.includes(k)); const spare = on.filter((k) => !used.includes(k)); let i = 0;
    return run.hero.attacks.map((a) => { if (on.includes(a.mod)) return Object.assign({}, a); const k = spare.length ? spare.shift() : on[i++ % on.length]; return { name: CFG().extra[k], mod: k }; });
  }
  function gainXp(n) { run.hero.xp += n; let msgs = []; while (run.hero.xp >= xpNeeded(run.hero.level)) { run.hero.xp -= xpNeeded(run.hero.level); run.hero.level++; run.hero.maxHp += 8; run.hero.hp = Math.min(run.hero.maxHp, run.hero.hp + 8); msgs.push(`Level ${run.hero.level}! Alle Attacken machen mehr Schaden.`); }
    if (msgs.length) setTimeout(SFX.levelup, 1400); return msgs; }
  function heal(n) { run.hero.hp = Math.min(run.hero.maxHp, run.hero.hp + n); }

  /* ---------- Rendering primitives ---------- */
  let keyHandler = null; // physical keyboard while a number task is open
  // quiet: re-render without fade-in (battle turns)
  function render(html, quiet) { keyHandler = null; app.innerHTML = html; if (!quiet && app.firstElementChild) app.firstElementChild.classList.add('enter'); }

  /* ---------- Sounds ---------- */
  // phones stay silent until a user gesture, so the first tap unlocks the context
  const SFX = (() => {
    const FILES = { tap: 0.45, right: 0.9, wrong: 0.9, hit: 1, crit: 1, hurt: 0.9, block: 1, levelup: 1, win: 1, finale: 1, lose: 0.9 };
    const AC = window.AudioContext || window.webkitAudioContext;
    let ctx = null, loading = false; const buffers = {};
    function load() { loading = true; if (typeof fetch !== 'function') return; for (const k of Object.keys(FILES)) fetch('sounds/' + k + '.mp3').then((r) => r.arrayBuffer()).then((ab) => ctx.decodeAudioData(ab)).then((buf) => { buffers[k] = buf; }).catch(() => { }); }
    function ensure() { if (!AC || !meta.sound) return null; try { if (!ctx) ctx = new AC(); if (ctx.state === 'suspended') ctx.resume(); if (!loading) load(); return ctx; } catch (e) { return null; } }
    function play(k) { const c = ensure(); if (!c || !buffers[k]) return; try { const src = c.createBufferSource(); src.buffer = buffers[k]; const g = c.createGain(); g.gain.value = FILES[k]; src.connect(g); g.connect(c.destination); src.start(); } catch (e) { } }
    const api = { unlock: ensure, loaded: () => Object.keys(buffers).length };
    for (const k of Object.keys(FILES)) api[k] = () => play(k);
    return api;
  })();
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, () => SFX.unlock(), { capture: true, passive: true }));
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('button')) SFX.tap(); }, true);
  window.__sfx = SFX;
  function fx(sel, text, cls) { const el = $(sel); if (!el) return; const r = el.getBoundingClientRect(); const s = document.createElement('span'); s.className = 'floatnum ' + (cls || ''); s.textContent = text; s.setAttribute('aria-hidden', 'true'); s.style.left = (r.left + r.width / 2) + 'px'; s.style.top = (r.top + Math.min(40, r.height * 0.3)) + 'px'; document.body.appendChild(s); setTimeout(() => s.remove(), 2100); }
  document.addEventListener('keydown', (e) => { if (keyHandler && !e.ctrlKey && !e.metaKey && !e.altKey && !$('.overlay')) keyHandler(e); });
  // one persistent live region: screen readers miss re-created ones
  const live = document.createElement('div'); live.className = 'sr-only'; live.setAttribute('aria-live', 'polite'); live.setAttribute('role', 'status'); document.body.appendChild(live);
  function announce(text) { live.textContent = ''; setTimeout(() => { live.textContent = text; }, 50); }
  function topbar(title, extra) { return `<div class="topbar"><div class="title">${title}</div>${extra || ''}${run ? `<div class="world">${CFG().worlds > 1 ? `Welt ${run.world} · ` : ''}Etage ${run.floor}</div>` : ''}</div>`; }
  function modal(html) {
    const ov = document.createElement('div'); ov.className = 'overlay'; ov.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
    const behind = [...app.children]; behind.forEach((el) => { el.inert = true; }); app.appendChild(ov);
    const rm = ov.remove.bind(ov); ov.remove = () => { behind.forEach((el) => { el.inert = false; }); rm(); };
    return ov;
  }

  /* ---------- Tutorials ---------- */
  // maths tutorials also serve the Bergwerk's division tasks in other units
  function tutFor(group) { if (group === 'lesen:1') return Object.assign({ icon: READ_MOD.icon }, READ_TUT); const [mod, tier] = group.split(':'); const nt = CFG().numTut; if (nt) return Object.assign({ icon: MODULES_OF()[mod].icon }, nt[mod][+tier] || nt[mod][1]); const t = CFG().tut && CFG().tut[group]; if (!t) return Object.assign({ icon: MQ.MODULES[mod].icon }, MQ.TUT[mod][+tier] || MQ.TUT[mod][1]); const M = MODULES_OF()[mod]; return Object.assign({ icon: M ? M.icon : '📖' }, t); }
  function showTutorial(group, note, onClose, auto) {
    const t = tutFor(group); const n = note && CFG().notes ? CFG().notes[note] : null;
    const ov = modal(`<h2>${t.icon} ${esc(t.title)}</h2><p class="muted" style="opacity:.8">${auto ? 'Neue Aufgabenart. So geht sie:' : 'So geht es:'}</p><ol>${t.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>${n ? `<div class="ex"><div style="font-size:16px;color:var(--ink-soft)">📄 Aus deinen Notizen: ${esc(n.title)}</div>${n.lines.map((l) => `<div>• ${esc(l)}</div>`).join('')}</div>` : ''}<button class="btn" id="tutok" style="margin-top:12px">Verstanden</button>`);
    $('#tutok', ov).focus({ preventScroll: true });
    $('#tutok', ov).onclick = () => { ov.remove(); meta.seenTut[tutKey(group)] = true; if (note) meta.seenTut[tutKey('note:' + note)] = true; saveAll(); if (onClose) onClose(); };
  }
  function ensureTutorial(task, then) { const needGroup = !meta.seenTut[tutKey(task.group)]; const needNote = task.note && !meta.seenTut[tutKey('note:' + task.note)]; if (needGroup || needNote) showTutorial(task.group, task.note, then, true); else then(); }

  /* ---------- Task UI ---------- */
  const PLACES = ['Einer', 'Zehner', 'Hunderter', 'Tausender'];
  function colHtml(c, text) {
    const place = (i) => PLACES[c.w - 1 - i]; const cells = (f) => Array.from({ length: c.w }, (_, i) => f(i)).join('');
    // multiplication is written in one line (213 · 3) with the result under the first factor
    const mul = c.op === '·'; const end = mul ? '<span></span>' : '';
    const rows = (mul ? c.rows.slice(0, 1) : c.rows).map((n, r) => { const s = String(n).padStart(c.w, ' '); return `<span class="op">${r ? c.op : ''}</span>${cells((i) => `<span>${s[i].trim()}</span>`)}${mul ? `<span class="op">· ${c.rows[1]}</span>` : ''}`; }).join('');
    return `<div class="colcalc${mul ? ' mul' : ''}" style="--w:${c.w}" role="group" aria-label="${esc(text.replace(' = ?', ''))}">${rows}<span class="op"></span>${cells((i) => (i < c.w - 1 ? `<div class="inp carry" data-i="${c.w + i}" aria-label="Übertrag ${place(i)}"></div>` : '<span></span>'))}${end}<i class="colline"></i><span class="op"></span>${cells((i) => `<div class="inp dig" data-i="${i}" aria-label="${place(i)}"></div>`)}${end}</div><div class="prompt">Rechne von rechts nach links. Den Übertrag schreibst du in das kleine Feld.</div>`;
  }
  function runTask(task, opts, done) {
    opts = opts || {}; window.__task = task;
    if (task.kind !== 'num') return runChoiceTask(task, opts, done);
    const mod = task.mod; const M = MODULES_OF()[mod] || MQ.MODULES[mod]; const C = task.col;
    // written methods: one field per result digit (0 … w−1), then the carry fields (w + column)
    const nAns = C ? 2 * C.w - 1 : task.answers.length;
    const values = Array(nAns).fill(''); let active = C ? C.w - 1 : 0; let locked = false;
    // entry follows the written method: Einer, carry into the Zehner, Zehner, carry into the Hunderter, …
    const order = C ? [C.w - 1].concat(...Array.from({ length: C.w - 1 }, (_, k) => [2 * C.w - 2 - k, C.w - 2 - k])) : null;
    const container = opts.container; const bottom = opts.bottom;
    const labelsFor = () => task.nb ? [`${task.nb} davor`, `${task.nb} danach`] : task.seq ? ['', '', ''] : [''];
    function cardHtml() {
      let body = '';
      if (task.fig) body = task.fig; // ready-made question with drawing (Jahrmarkt)
      else if (task.riddle) body = `<div class="clues">${task.text.split('\n').map((c) => `<div>${esc(c)}</div>`).join('')}</div><div class="prompt">Welche Zahl bin ich?</div>`;
      else if (task.seq) body = `<div class="seq">${task.seq.join(', ')}, …</div><div class="prompt">Wie gehen die nächsten drei weiter?</div>`;
      else if (task.nb) body = `<div class="prompt">Welche ${task.nb}zahl kommt davor, welche danach?</div>`;
      else if (task.grid) { const g = task.grid; let cells = ''; for (let r = 0; r < g.size; r++) for (let c = 0; c < g.size; c++) { const isS = r === g.sr && c === g.sc, isT = r === g.tr && c === g.tc; cells += `<div class="${isS ? 'start' : ''}${isT ? ' target' : ''}">${isS ? g.base : isT ? '?' : ''}</div>`; } body = `<div class="grid">${cells}</div><div class="legend" data-step-r="${g.stepR}" data-step-d="${g.stepD}"><span>${arrow('r')} +${g.stepR}</span><span>${arrow('l')} −${g.stepR}</span><span>${arrow('d')} +${g.stepD}</span><span>${arrow('u')} −${g.stepD}</span></div><div class="prompt">Welche Zahl steht im Zielfeld?</div>`; }
      else if (C) body = colHtml(C, task.text);
      else if (task.word) body = `<div class="prompt">Schreibe die Zahl:</div><div class="numword">${esc(task.text).replace(/hundert|tausend/g, '$&<wbr>')}</div>`;
      else if (task.svg) body = `<div class="figure">${task.svg}</div><div class="prompt">${esc(task.ask)}</div>`;
      else if (task.story) body = `<p class="story">${esc(task.story)}</p>`;
      else if (task.ask) body = `<div class="expr${task.long ? ' long' : ''}">${esc(task.text)}</div><div class="prompt">${esc(task.ask)}</div>`;
      else body = `<div class="expr">${esc(task.text)}</div>`;
      let inputs = '';
      if (C) inputs = '';
      else if (task.nb) inputs = `<div class="nbline"><div class="inpgroup"><div class="inp" data-i="0"></div><span>davor</span></div><div class="mid">${task.n}</div><div class="inpgroup"><div class="inp" data-i="1"></div><span>danach</span></div></div>`;
      else if (task.labels) inputs = `<div class="nbline">${task.labels.map((l, i) => `<div class="inpgroup"><div class="inp" data-i="${i}"></div><span>${esc(l)}</span></div>`).join('')}</div>`;
      else inputs = `<div class="inputs">${task.answers.map((_, i) => `<div class="inp" data-i="${i}"></div>`).join('')}</div>`;
      const a0 = task.answers[0]; const lo = Math.max(0, a0 - 1 - Math.floor(Math.random() * 3)); const hint = opts.hint ? `<div class="hintline">🌉 Tipp: ${task.answers.length > 1 ? 'Die erste Zahl' : 'Die Antwort'} liegt zwischen ${lo} und ${lo + 4}.</div>` : '';
      return `<div class="task"><div class="head">${M.icon} ${M.name}${opts.subtitle ? ` · ${esc(opts.subtitle)}` : ''}<button class="tut" type="button" aria-label="Erklärung anzeigen">🛈 Wie geht das?</button></div>${body}${hint}${inputs}<div id="fb" role="status" aria-live="polite"></div></div>`;
    }
    container.innerHTML = cardHtml();
    bottom.innerHTML = `<div class="numpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button data-k="${d}">${d}</button>`).join('')}<button class="del" data-k="del" aria-label="Löschen">⌫</button><button data-k="0">0</button><button class="ok" data-k="ok" aria-label="Antwort prüfen">✓</button>${opts.cancel ? `<button class="cancel" data-k="cancel" style="grid-column:1/-1">Abbrechen</button>` : ''}</div>`;
    const inps = []; container.querySelectorAll('.inp').forEach((el) => { inps[+el.dataset.i] = el; });
    function paint() { inps.forEach((el, i) => { el.textContent = values[i]; el.classList.toggle('active', i === active && !locked); }); const a = inps[active]; if (a && a.scrollIntoView && !locked) a.scrollIntoView({ block: 'nearest' }); }
    inps.forEach((el) => { el.onclick = () => { if (!locked) { active = +el.dataset.i; paint(); } }; });
    $('.tut', container).onclick = () => showTutorial(task.group, task.note);
    paint();
    bottom.onclick = (e) => {
      const b = e.target.closest('button'); if (!b || locked || !bottom.contains(b) || !b.dataset.k) return; press(b.dataset.k);
    };
    keyHandler = (e) => {
      if (locked) return; let k = null;
      if (/^[0-9]$/.test(e.key)) k = e.key; else if (e.key === 'Backspace' || e.key === 'Delete') k = 'del'; else if (e.key === 'Enter') k = 'ok';
      else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && C) { e.preventDefault(); const p = order.indexOf(active); active = order[(p + (e.key === 'ArrowLeft' ? 1 : nAns - 1)) % nAns]; paint(); return; }
      else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && nAns > 1) { e.preventDefault(); active = (active + (e.key === 'ArrowLeft' ? nAns - 1 : 1)) % nAns; paint(); return; }
      if (!k) return; e.preventDefault(); press(k);
    };
    function press(k) {
      if (k === 'cancel') { done(null); return; }
      if (k === 'del') { values[active] = values[active].slice(0, -1); }
      else if (k === 'ok' && C) {
        // carries are optional; the result needs every digit from its first one to the Einer
        const dig = values.slice(0, C.w); const first = dig.findIndex((v) => v !== '');
        const gap = first < 0 ? C.w - 1 : dig.findIndex((v, i) => i > first && v === '');
        if (gap >= 0) { active = gap; paint(); return; }
        submit(); return;
      }
      else if (C) { values[active] = k; const p = order.indexOf(active); if (p < nAns - 1) active = order[p + 1]; }
      else if (k === 'ok') {
        if (values.some((v) => v === '')) { const idx = values.findIndex((v) => v === ''); if (idx === active) return; active = idx; paint(); return; }
        submit(); return;
      }
      else { if (values[active].length < (task.maxLen || 3)) values[active] += k; }
      paint();
    }
    function submit() {
      locked = true; keyHandler = null;
      const want = C ? String(task.answers[0]).padStart(C.w, ' ') : '';
      const fieldOk = (v, i) => (!C ? parseInt(v, 10) === task.answers[i] : i < C.w ? v === want[i] || (want[i] === ' ' && (v === '' || v === '0')) : v === '' ? null : +v === C.carry[i - C.w]);
      const ok = C ? parseInt(values.slice(0, C.w).join(''), 10) === task.answers[0] : values.every((v, i) => parseInt(v, 10) === task.answers[i]);
      if (opts.onResult) opts.onResult(ok); // game state changes now, so a reload can't undo the answer
      inps.forEach((el, i) => { el.classList.remove('active'); const f = fieldOk(values[i], i); if (f !== null) el.classList.add(f ? 'ok' : 'bad'); });
      const fb = $('#fb', container);
      if (ok) { fb.innerHTML = `<div class="feedback good pop">Richtig! ✔</div>`; SFX.right(); }
      else { SFX.wrong(); const corr = task.show || (task.money ? euro(task.answers[0] * 100 + task.answers[1]) : task.answers.join(task.nb ? ' und ' : task.rest ? ' Rest ' : ', ')); fb.innerHTML = `<div class="feedback bad ${reducedMotion ? '' : 'shake'}">Daneben<small>Richtig wäre: ${corr}</small></div>`; }
      if (fb.scrollIntoView) fb.scrollIntoView({ block: 'nearest' });
      bottom.innerHTML = `<button class="btn" id="next">Weiter</button>`;
      $('#next').focus();
      $('#next').onclick = () => done(ok);
    }
  }

  /* ---------- Choice / order / parts tasks ---------- */
  function runChoiceTask(task, opts, done) {
    const container = opts.container, bottom = opts.bottom; const M = MODULES_OF()[task.mod] || READ_MOD; let locked = false;
    const head = `<div class="head">${M.icon} ${M.name}${opts.subtitle ? ` · ${esc(opts.subtitle)}` : ''}<button class="tut" type="button" aria-label="Erklärung anzeigen">🛈 Wie geht das?</button></div>`;
    // with two options crossing one out gives the answer away, so show the notes instead
    const strikeWrongOption = () => { if (task.options.length <= 2) { const n = task.note && CFG().notes ? CFG().notes[task.note] : null; $('#fb', container).insertAdjacentHTML('beforebegin', task.tip ? `<div class="hintline">🌉 Tipp: ${esc(task.tip)}</div>` : n ? `<div class="hintline">🌉 Tipp aus deinen Notizen „${esc(n.title)}“:<br>${n.lines.map((l) => esc(l)).join('<br>')}</div>` : '<div class="hintline">🌉 Tipp: Lies die Frage noch einmal ganz genau.</div>'); return; } const wrong = [...bottom.querySelectorAll('.opt')].filter((b) => task.options[+b.dataset.i] !== task.answer); const w = wrong[Math.floor(Math.random() * wrong.length)]; if (w) { w.disabled = true; w.classList.add('struck'); } $('#fb', container).insertAdjacentHTML('beforebegin', '<div class="hintline">🌉 Tipp: Eine falsche Antwort ist durchgestrichen.</div>'); };
    const finish = (ok, extraHtml) => {
      locked = true; const fb = $('#fb', container); if (ok) SFX.right(); else SFX.wrong();
      if (opts.onResult) opts.onResult(ok);
      fb.innerHTML = ok ? `<div class="feedback good pop">Richtig! ✔</div>` : `<div class="feedback bad ${reducedMotion ? '' : 'shake'}">Daneben<small>${extraHtml}</small></div>`;
      if (fb.scrollIntoView) fb.scrollIntoView({ block: 'nearest' });
      bottom.innerHTML = `<button class="btn" id="next">Weiter</button>`; $('#next').focus(); $('#next').onclick = () => done(ok);
    };
    if (task.kind === 'choice') {
      // svgOpts: the options are pictures (generated markup, not player text)
      container.innerHTML = `<div class="task">${head}${task.fig || ''}<div class="question">${esc(task.q).replace('___', '<span class="blank">____</span>')}</div>${task.pic || ''}<div id="fb" role="status" aria-live="polite"></div></div>`;
      bottom.innerHTML = `<div class="options ${task.svgOpts ? 'pics' + (task.tall ? ' tall' : '') : task.inline ? 'sentence' : task.cols === 2 ? 'two' : ''}">${task.options.map((o, i) => `<button class="opt" data-i="${i}"${task.svgOpts ? ` aria-label="Bild ${i + 1}">${o}` : `>${esc(o)}`}</button>`).join('')}${task.inline ? '<span aria-hidden="true">.</span>' : ''}</div>`;
      bottom.querySelectorAll('.opt').forEach((b) => { b.onclick = () => { if (locked) return; const ok = task.options[+b.dataset.i] === task.answer; b.classList.add(ok ? 'right' : 'wrong');
        if (task.svgOpts) { finish(ok, `${esc(task.why)}<span class="fbpic">${task.answer}</span>`); return; }
        finish(ok, `Richtig wäre: ${esc(task.answer)}${task.why ? ' – ' + esc(task.why) : ''}`); }; });
      if (opts.hint) strikeWrongOption();
    } else if (task.kind === 'parts') {
      container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q)}</div>${plantOf(task.plant).svg({ highlight: task.part })}<div id="fb" role="status" aria-live="polite"></div></div>`;
      bottom.innerHTML = `<div class="options two">${task.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
      bottom.querySelectorAll('.opt').forEach((b) => { b.onclick = () => { if (locked) return; const ok = task.options[+b.dataset.i] === task.answer; b.classList.add(ok ? 'right' : 'wrong'); if (!ok) { const el = container.querySelector('[data-part="' + task.part + '"]'); if (el) el.classList.add('reveal'); } finish(ok, `Das ist: ${esc(task.answer)}`); }; });
      if (opts.hint) strikeWrongOption();
    } else if (task.kind === 'parts-find') {
      container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q)}</div>${plantOf(task.plant).svg({ clickable: true })}<div id="fb" role="status" aria-live="polite"></div></div>`;
      const pp = plantOf(task.plant).parts.find((p) => p.id === task.part);
      bottom.innerHTML = `<p class="center muted" style="margin:6px 0">Tippe auf ${task.plant === 'kreislauf' ? 'die Stelle im Bild' : 'den Teil in der Pflanze'}.</p>${opts.hint && pp ? `<p class="center hintline">🌉 Tipp: ${esc(pp.tip || `Der Teil ist ${pp.ground === 'unten' ? 'unter' : 'über'} der Erde.`)}</p>` : ''}`;
      container.querySelectorAll('[data-part]').forEach((g) => { g.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g.onclick(); } }; g.onclick = () => { if (locked) return; const ok = g.dataset.part === task.part; g.classList.add(ok ? 'hit-part' : 'miss-part'); if (!ok) { const el = container.querySelector('[data-part="' + task.part + '"]'); if (el) el.classList.add('reveal'); } finish(ok, `Hier leuchtet jetzt: ${esc(task.answer)}`); }; });
    } else if (task.kind === 'karte') {
      const goal = task.target.join('-');
      container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q)}</div>${MS.mapSVG({ start: task.start, neben: task.neben, scale: task.scale, clickable: true })}<div id="fb" role="status" aria-live="polite"></div></div>`;
      bottom.innerHTML = `<p class="center muted" style="margin:6px 0">Tippe auf das Feld mit dem Schatz.</p>${opts.hint ? '<p class="center hintline">🌉 Tipp: Norden ist oben, Osten rechts, Süden unten, Westen links.</p>' : ''}`;
      container.querySelectorAll('[data-cell]').forEach((c) => { c.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.onclick(); } }; c.onclick = () => { if (locked) return; const ok = c.dataset.cell === goal; c.classList.add(ok ? 'hit' : 'miss'); if (!ok) container.querySelector(`[data-cell="${goal}"]`).classList.add('reveal'); finish(ok, 'Der Schatz liegt auf dem gelben Feld.'); }; });
    } else if (task.kind === 'order') {
      const chosen = opts.hint ? [task.order[0]] : []; const fixed = chosen.length;
      container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q)}</div><div class="orderlist" id="olist"></div><p class="ohelp">Tippe der Reihe nach. Nochmal tippen nimmt es wieder heraus.</p><div id="fb" role="status" aria-live="polite"></div></div>`;
      const paint = () => { $('#olist', container).innerHTML = task.display.map((it) => { const pos = chosen.indexOf(it.id); return `<button class="oitem ${pos >= 0 ? 'picked' : ''}" data-id="${it.id}" aria-pressed="${pos >= 0}" aria-label="${esc(it.text)}${pos >= 0 ? ', Platz ' + (pos + 1) : ''}"><span class="num">${pos >= 0 ? pos + 1 : ''}</span><span>${esc(it.text)}</span></button>`; }).join(''); container.querySelectorAll('.oitem').forEach((b) => { b.onclick = () => { if (locked) return; const pos = chosen.indexOf(b.dataset.id); if (pos >= fixed) chosen.splice(pos, 1); else if (pos < 0) chosen.push(b.dataset.id); paint(); }; }); /* tap again = take it out, the ones after it move up */ $('#ocheck').disabled = chosen.length !== task.order.length; $('#oundo').disabled = chosen.length <= fixed; };
      bottom.innerHTML = `<div class="row"><button class="btn secondary" id="oundo">↶ Rückgängig</button><button class="btn" id="ocheck">✓ Prüfen</button></div>`;
      $('#oundo').onclick = () => { if (!locked && chosen.length > fixed) { chosen.pop(); paint(); } };
      if (fixed) $('#olist', container).insertAdjacentHTML('afterend', '<div class="hintline">🌉 Tipp: Das Erste steht schon richtig.</div>');
      $('#ocheck').onclick = () => { if (locked || chosen.length !== task.order.length) return; const ok = chosen.every((id, i) => id === task.order[i]); const byId = Object.fromEntries(task.items.map((x) => [x.id, x.text])); container.querySelectorAll('.oitem').forEach((b) => { const i = chosen.indexOf(b.dataset.id); b.classList.add(task.order[i] === b.dataset.id ? 'right' : 'wrong'); }); finish(ok, 'Richtige Reihenfolge:<br>' + task.order.map((id, i) => `${i + 1}. ${esc(byId[id])}`).join('<br>')); };
      paint();
    }
    $('.tut', container).onclick = () => showTutorial(task.group, task.note);
  }

  /* ---------- Potato plant drawing ---------- */
  // opts: highlight (part id), clickable, labels (bool), step (1-6 for drawing school)
  function potatoSVG(opts) {
    opts = opts || {}; const step = opts.step || 6; const hl = (id) => opts.highlight === id ? ' glow' : '';
    const g = (id, inner, cls) => (step >= PART_STEP[id] ? `<g data-part="${id}" class="part${hl(id)} ${cls || ''}" ${opts.clickable ? `tabindex="0" role="button" aria-label="Pflanzenteil ${Object.keys(PART_STEP).indexOf(id) + 1}"` : ''}>${inner}</g>` : '');
    const label = (id, x, y, anchor) => opts.labels && step >= PART_STEP[id] ? `<text class="plabel" x="${x}" y="${y}" text-anchor="${anchor || 'start'}">${MK.PARTS.find((p) => p.id === id).name.replace(' (Frucht)', '')}</text>` : '';
    return `<svg class="plant ${opts.clickable ? 'clickable' : ''}" viewBox="0 0 260 300" aria-label="Kartoffelpflanze">
      <rect x="0" y="150" width="260" height="150" fill="#8B5E3C" opacity=".35"/><line x1="0" y1="150" x2="260" y2="150" stroke="#6B4423" stroke-width="3" stroke-dasharray="6 4"/>
      ${g('wurzeln', `<path d="M130 190 Q110 215 95 245 M130 190 Q150 220 160 250 M130 195 Q125 225 118 260 M130 195 Q140 230 150 270" stroke="#C7A27A" stroke-width="3" fill="none" stroke-linecap="round"/><path class="hitarea" d="M90 190 L170 190 L170 275 L90 275 Z" fill="transparent"/>`)}
      ${g('mutterknolle', `<ellipse cx="130" cy="185" rx="26" ry="16" fill="#8A6A3F" stroke="#5A4327" stroke-width="2"/><circle cx="120" cy="182" r="2" fill="#5A4327"/><circle cx="138" cy="189" r="2" fill="#5A4327"/>`)}
      ${g('auslaeufer', `<path d="M110 180 Q70 185 50 210 M150 180 Q190 185 215 205 M120 192 Q95 215 80 240 M140 192 Q170 215 190 240" stroke="#E6D3A3" stroke-width="3.5" fill="none" stroke-linecap="round"/>`)}
      ${g('tochterknollen', `<ellipse cx="44" cy="218" rx="15" ry="10" fill="#C9A35B" stroke="#7A5A2A" stroke-width="2"/><ellipse cx="222" cy="214" rx="15" ry="10" fill="#C9A35B" stroke="#7A5A2A" stroke-width="2"/><ellipse cx="76" cy="248" rx="14" ry="9" fill="#C9A35B" stroke="#7A5A2A" stroke-width="2"/><ellipse cx="196" cy="248" rx="14" ry="9" fill="#C9A35B" stroke="#7A5A2A" stroke-width="2"/>`)}
      ${g('staengel', `<path d="M130 170 Q128 120 130 60 M130 120 Q110 100 92 92 M130 95 Q152 80 168 72 M130 140 Q156 128 176 126 M130 125 Q104 118 84 120" stroke="#3E8E41" stroke-width="5" fill="none" stroke-linecap="round"/>`)}
      ${g('blaetter', `<g fill="#4FB04F" stroke="#2F7A32" stroke-width="1.5"><ellipse cx="80" cy="88" rx="16" ry="9" transform="rotate(-25 80 88)"/><ellipse cx="62" cy="100" rx="13" ry="8" transform="rotate(-10 62 100)"/><ellipse cx="178" cy="66" rx="16" ry="9" transform="rotate(20 178 66)"/><ellipse cx="196" cy="80" rx="13" ry="8" transform="rotate(10 196 80)"/><ellipse cx="190" cy="124" rx="16" ry="9" transform="rotate(15 190 124)"/><ellipse cx="208" cy="138" rx="12" ry="7"/><ellipse cx="70" cy="122" rx="16" ry="9" transform="rotate(-15 70 122)"/><ellipse cx="52" cy="134" rx="12" ry="7"/><ellipse cx="118" cy="48" rx="12" ry="8" transform="rotate(-40 118 48)"/><ellipse cx="146" cy="100" rx="12" ry="7" transform="rotate(35 146 100)"/></g>`)}
      ${g('bluete', `<g><circle cx="130" cy="40" r="4" fill="#F5D33F"/><g fill="#C9B0F5" stroke="#8C6BD1" stroke-width="1.5"><ellipse cx="130" cy="28" rx="6" ry="9"/><ellipse cx="141" cy="36" rx="6" ry="9" transform="rotate(72 141 36)"/><ellipse cx="137" cy="50" rx="6" ry="9" transform="rotate(144 137 50)"/><ellipse cx="123" cy="50" rx="6" ry="9" transform="rotate(216 123 50)"/><ellipse cx="119" cy="36" rx="6" ry="9" transform="rotate(288 119 36)"/></g><circle cx="130" cy="40" r="4" fill="#F5D33F"/><circle cx="156" cy="52" r="4" fill="#F5D33F"/><g fill="#C9B0F5" stroke="#8C6BD1" stroke-width="1.5"><ellipse cx="156" cy="43" rx="5" ry="7"/><ellipse cx="164" cy="49" rx="5" ry="7" transform="rotate(72 164 49)"/><ellipse cx="161" cy="59" rx="5" ry="7" transform="rotate(144 161 59)"/><ellipse cx="151" cy="59" rx="5" ry="7" transform="rotate(216 151 59)"/><ellipse cx="148" cy="49" rx="5" ry="7" transform="rotate(288 148 49)"/></g><circle cx="156" cy="52" r="3.5" fill="#F5D33F"/></g>`)}
      ${g('beere', `<path d="M104 66 Q100 76 98 84" stroke="#3E8E41" stroke-width="3" fill="none"/><circle cx="98" cy="90" r="8" fill="#8BC34A" stroke="#4A7C23" stroke-width="2"/><circle cx="95" cy="87" r="2" fill="#D9F0B0"/>`)}
      ${label('bluete', 168, 30)}${label('beere', 6, 76)}${label('blaetter', 4, 112)}${label('staengel', 140, 146)}${label('mutterknolle', 162, 178)}${label('wurzeln', 160, 290)}${label('auslaeufer', 6, 204)}${label('tochterknollen', 6, 276)}
    </svg>`;
  }
  const PART_STEP = { mutterknolle: 1, wurzeln: 2, auslaeufer: 3, tochterknollen: 3, staengel: 4, blaetter: 5, bluete: 6, beere: 6 };
  const DRAW_STEPS = ['Zeichne die Erdlinie und darunter die Mutterknolle.', 'Zeichne die Wurzeln nach unten.', 'Zeichne die Ausläufer zur Seite und daran die Tochterknollen.', 'Zeichne den Stängel nach oben mit Seitentrieben.', 'Zeichne die Blätter an die Triebe.', 'Zeichne oben die Blüten und eine kleine Beere.'];
  // labelled pictures: the potato here, cereal plant and water cycle in sachkunde.js
  const POTATO = { svg: potatoSVG, parts: MK.PARTS, steps: DRAW_STEPS, qid: 'p_', note: 'teile' };
  const plantOf = (k) => (k && MS.PLANTS[k]) || POTATO;

  /* ---------- Screens ---------- */
  const GEAR = '<svg class="gear" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="3.6" stroke-dasharray="3.4 3.35"/><circle cx="12" cy="12" r="6.2" fill="none" stroke="currentColor" stroke-width="3.2"/></svg>';
  // Safari (and every browser on iOS) deletes site data after 7 days without a visit, unless the app is on the home screen
  const evictable = () => { const ua = navigator.userAgent; return (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) || (/Safari\//.test(ua) && !/Chrome|Chromium|Edg|Android|Firefox/.test(ua))) && !navigator.standalone && !!window.matchMedia && window.matchMedia('(display-mode: browser)').matches; };
  const showWarn = () => evictable() && !(Date.now() - Date.parse(meta.storage.warnedAt) < 30 * 864e5);
  function screenTitle() {
    if (!meta.setup.done && !meta.setup.skipped) return screenSetup();
    render(`<div class="screen"><div class="scroll"><button class="soundbtn" id="snd" aria-label="${meta.sound ? 'Töne ausschalten' : 'Töne einschalten'}" aria-pressed="${!!meta.sound}">${meta.sound ? '🔊' : '🔇'}</button><button class="stampbtn" id="stampsTop" aria-label="Stempelheft, ${meta.stamps} Stempel">🏷️ ${meta.stamps}</button><button class="parentbtn" id="parents">${GEAR} Eltern${backupDue() ? '<span class="dot" aria-hidden="true"></span><span class="sr-only">, bitte Spielstand sichern</span>' : ''}</button><div class="hero"><div class="logo">🎒</div><h1 id="logo">Lern­quest</h1><div class="sub">Jede Attacke ist eine Aufgabe.</div></div>
      <div class="stack" style="margin-top:16px">
        ${showWarn() ? `<div class="card warncard"><button class="warnx" id="warnx" aria-label="Hinweis schließen">✕</button><p>Safari löscht gespeicherte Spiele nach 7 Tagen Pause. Installiere Lernquest auf dem Startbildschirm oder sichere den Spielstand im Elternbereich.</p><button class="btn small secondary" id="warnp">Zum Elternbereich</button></div>` : ''}
        ${weeklyCard()}
        ${gradeTabs()}${gardenCard()}<div class="subjects">${curGrade().subjects.map((sub, i) => { const live = sub.modes.some((m) => loadRun(m)); return `<button class="card subjtile" data-sub="${i}"><span class="subjicon" aria-hidden="true">${sub.icon}</span><span class="subjname">${esc(sub.subject)}</span><span class="desc">${live ? '▶ Abenteuer läuft' : `${sub.modes.length} ${sub.modes.length === 1 ? 'Spiel' : 'Spiele'}`}</span></button>`; }).join('')}</div>
        <div class="row"><button class="btn ghost" id="dex">Monsterbuch (${Object.keys(meta.dex).length})</button><button class="btn ghost" id="stamps">Stempelheft</button></div>
        <div class="row"><button class="btn ghost" id="hut">Meine Hütte</button><button class="btn ghost" id="garden">Schulgarten</button></div>
        <div class="row"><button class="btn ghost" id="duel">Duell zu zweit</button><button class="btn ghost" id="news">Was ist neu?${hasNews() ? ' <span class="newbadge">Neu!</span>' : ''}</button></div>
        <div class="row"><button class="btn ghost" id="feedback">Idee senden</button></div>
      </div></div></div>`);
    let taps = 0; $('#logo').onclick = () => { taps++; if (taps >= 5) { taps = 0; askPin(screenParent); } };
    $('#parents').onclick = () => askPin(screenParent);
    if ($('#warnx')) { const seen = () => { meta.storage.warnedAt = new Date().toISOString(); saveAll(); }; $('#warnx').onclick = () => { seen(); screenTitle(); }; $('#warnp').onclick = () => { seen(); askPin(() => screenParent('save')); }; }
    app.querySelectorAll('[data-sub]').forEach((b) => { b.onclick = () => screenSubject(curGrade().subjects[+b.dataset.sub]); });
    $('#dex').onclick = screenDex;
    $('#stamps').onclick = $('#stampsTop').onclick = () => screenStamps();
    $('#news').onclick = screenNews;
    $('#duel').onclick = () => screenDuel([]);
    $('#hut').onclick = screenHut; $('#garden').onclick = screenGarden; if ($('#harvest')) $('#harvest').onclick = screenGarden;
    $('#feedback').onclick = () => screenFeedback(screenTitle);
    $('#snd').onclick = () => { meta.sound = !meta.sound; saveAll(); if (meta.sound) { SFX.unlock(); setTimeout(SFX.right, 150); } screenTitle(); };
    app.querySelectorAll('[data-grade]').forEach((b) => { b.onclick = () => { meta.grade = +b.dataset.grade; saveAll(); screenTitle(); }; });
    $('#weekly').onclick = screenWeekly;
    showWeeklyNews();
  }
  const subjectOf = (m) => curGrade().subjects.find((sub) => sub.modes.includes(m));
  function screenSubject(sub) {
    render(`<div class="screen">${topbar(esc(sub.subject))}<div class="scroll"><div class="stack">${sub.modes.map((m) => { const r = loadRun(m); const c = MODES[m]; return `<div class="card modecard"><div class="row" style="align-items:center;gap:12px"><div style="font-size:40px" aria-hidden="true">${c.icon}</div><div style="flex:1"><h3>${c.title}</h3><div class="desc">${c.sub}</div></div></div><div class="row" style="margin-top:10px">${r ? `<button class="btn small" data-cont="${m}">Weiter${c.worlds > 1 ? ` (Welt ${r.world})` : ''}</button>` : ''}<button class="btn small ${r ? 'secondary' : ''}" data-new="${m}">${r ? 'Neu' : 'Starten'}</button></div></div>`; }).join('')}</div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    app.querySelectorAll('[data-cont]').forEach((b) => { b.onclick = () => { mode = b.dataset.cont; run = loadRun(mode); if (run) resumeRun(); else screenSubject(sub); }; });
    app.querySelectorAll('[data-new]').forEach((b) => { b.onclick = () => { mode = b.dataset.new; const r = loadRun(mode); if (r) { const ov = modal(`<h2>Neues Abenteuer?</h2><p>Dein laufendes Abenteuer in „${MODES[mode].title}“ wird gelöscht.</p><div class="stack"><button class="btn" id="yes">Ja, neu starten</button><button class="btn secondary" id="no">Zurück</button></div>`); $('#yes', ov).onclick = () => { run = null; screenStarter(); /* old save is replaced only when the new adventure starts */ }; $('#no', ov).onclick = () => ov.remove(); } else screenStarter(); }; });
    $('#back').onclick = screenTitle;
  }
  const goalCount = (g, i) => Math.min(g.n, weekly().progress[i] || 0);
  function weeklyCard() {
    const goals = weeklyGoals(); const n = goals.filter(goalDone).length; const pct = Math.round((goals.reduce((a, g, i) => a + goalCount(g, i) / g.n, 0) / goals.length) * 100);
    return `<button class="card weekcard" id="weekly"><span class="eyebrow">Diese Woche</span><span class="weekline"><b>${weekly().done ? 'Wochenaufgabe geschafft' : `${n} von ${goals.length} Zielen erledigt`}</b><span>Neue Aufgaben am Montag</span></span><span class="bar" role="img" aria-label="${pct} %"><i style="width:${pct}%"></i></span></button>`;
  }
  function screenWeekly() {
    const goals = weeklyGoals();
    render(`<div class="screen">${topbar('Wochenaufgabe')}<div class="scroll"><div class="stack">
      <p class="center">${weekly().done ? 'Alle Ziele dieser Woche sind erledigt.' : 'Schaffst du alle Ziele, bekommst du 10 Stempel und einen Stern auf der Stempelkarte.'}</p>
      ${goals.map((g, i) => { const c = goalCount(g, i); return `<div class="card goal"><div class="eyebrow">${esc(g.subject)}</div><p>${esc(goalText(g))}</p><div class="goalrow"><span class="bar" aria-hidden="true"><i style="width:${(c / g.n) * 100}%"></i></span><b>${c >= g.n ? '✔ ' : ''}${c} von ${g.n}</b></div></div>`; }).join('')}
      <p class="center">Nichts geht verloren, wenn du eine Woche aussetzt. Neue Aufgaben gibt es am Montag.</p>
      </div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    $('#back').onclick = screenTitle;
  }

  /* ---------- First start, PIN, parental gate ---------- */
  const setupDone = (how) => { meta.setup[how] = true; meta.setup.at = meta.setup.at || new Date().toISOString(); saveAll(); };
  function screenSetup() {
    render(`<div class="screen setup"><div class="scroll"><div class="hero"><div class="logo">🎒</div><h1>Willkommen bei Lernquest</h1></div>
      <div class="card"><div class="eyebrow">Für Eltern</div><p>Lernquest speichert alles nur auf diesem Gerät, ohne Konto. Im Elternbereich stellen Sie ein, was geübt wird, und sehen, was schon gut klappt.</p><p>Mit einer vierstelligen PIN können nur Sie dort etwas ändern.</p>
      <div class="stack" style="margin-top:14px"><button class="btn" id="setpin">PIN festlegen</button><button class="btn secondary" id="setload">Spielstand laden</button><button class="btn secondary" id="later">Später</button></div>
      <p class="hintsmall">Der Elternbereich ist jederzeit über den Knopf „Eltern“ oben rechts erreichbar.</p></div></div></div>`);
    $('#setpin').onclick = () => setPin(screenTitle, screenSetup);
    $('#setload').onclick = () => screenParent('load', screenSetup);
    $('#later').onclick = () => { setupDone('skipped'); screenTitle(); };
  }
  // a parental gate, not encryption: four digits are guessed quickly anyway, the hash only keeps the PIN out of plain sight
  const pinHash = (p) => { let h = 2166136261; for (const c of 'lernquest:' + p) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return 'h1' + (h >>> 0).toString(36); };
  let pinFails = 0, pinLockUntil = 0;
  // one numpad screen for entering the PIN, choosing one and the parental gate
  function screenCode(o) {
    let val = ''; const len = o.len || 4;
    render(`<div class="screen">${topbar(o.title)}<div class="scroll"><div class="card codecard"><p>${o.text}</p>${o.task ? `<div class="codetask">${o.task}</div>` : ''}<div class="codeval ${o.task ? 'plain' : ''}" id="cval" role="img"></div><p id="cmsg" class="cmsg" role="status">${esc(o.msg || '')}</p>${o.forgot ? '<button class="linkbtn" id="forgot">PIN vergessen?</button>' : ''}</div></div>
      <div class="bottom"><div class="numpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button data-k="${d}">${d}</button>`).join('')}<button class="del" data-k="del" aria-label="Löschen">⌫</button><button data-k="0">0</button><button class="ok" data-k="ok" aria-label="Bestätigen">✓</button><button class="cancel" id="back" style="grid-column:1/-1">Zurück</button></div></div></div>`);
    const paint = () => { const el = $('#cval'); el.innerHTML = o.task ? esc(val) : Array.from({ length: len }, (_, i) => `<i class="${i < val.length ? 'on' : ''}"></i>`).join(''); el.setAttribute('aria-label', o.task ? (val || 'leer') : `${val.length} von ${len} Ziffern`); };
    const keys = [...app.querySelectorAll('.numpad [data-k]')];
    const fail = (msg) => { val = ''; paint(); $('#cmsg').textContent = msg; };
    function press(k) {
      if (keys[0].disabled) return;
      if (k === 'del') val = val.slice(0, -1);
      else if (k === 'ok') { if (val && (o.task || val.length === len)) { const v = val; val = ''; o.onCode(v, fail); } return; }
      else if (val.length < len) val += k;
      paint();
      if (!o.task && val.length === len) { const v = val; val = ''; o.onCode(v, fail); }
    }
    $('.numpad').onclick = (e) => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); };
    keyHandler = (e) => { const k = /^[0-9]$/.test(e.key) ? e.key : e.key === 'Backspace' || e.key === 'Delete' ? 'del' : e.key === 'Enter' ? 'ok' : null; if (k) { e.preventDefault(); press(k); } };
    $('#back').onclick = () => o.back();
    if (o.forgot) $('#forgot').onclick = o.forgot;
    paint();
    const wait = pinLockUntil - Date.now();
    if (o.lock && wait > 0) {
      keys.forEach((b) => { b.disabled = true; }); $('#cmsg').textContent = 'Dreimal falsch. Bitte 30 Sekunden warten.';
      setTimeout(() => { if (!keys[0].isConnected) return; keys.forEach((b) => { b.disabled = false; }); $('#cmsg').textContent = ''; }, wait);
    }
  }
  function askPin(then) {
    if (!meta.pin) return then();
    screenCode({ title: 'Elternbereich', text: 'Bitte die Eltern-PIN eingeben.', lock: true, back: screenTitle, forgot: () => screenGate(then), onCode: (v, fail) => {
      if (pinHash(v) === meta.pin) { pinFails = 0; return then(); }
      if (++pinFails < 3) return fail('Falsche PIN.');
      pinFails = 0; pinLockUntil = Date.now() + 30000; askPin(then);
    } });
  }
  function setPin(done, back) {
    const first = (msg) => screenCode({ title: 'PIN festlegen', text: 'Vier Ziffern für den Elternbereich wählen.', msg, back, onCode: (a) => screenCode({ title: 'PIN festlegen', text: 'Zur Kontrolle dieselbe PIN noch einmal eingeben.', back: () => first(), onCode: (b) => {
      if (a !== b) return first('Die beiden Eingaben waren verschieden. Bitte neu wählen.');
      meta.pin = pinHash(a); setupDone('done'); done();
    } }) });
    first();
  }
  function screenGate(then, msg) {
    const a = rnd(13, 29), b = rnd(13, 29);
    screenCode({ title: 'PIN vergessen?', text: 'Zur Kontrolle eine Aufgabe für Erwachsene. Danach eine neue PIN wählen.', task: `${a} · ${b} = ?`, msg, back: screenTitle,
      onCode: (v) => (+v === a * b ? setPin(then, screenTitle) : screenGate(then, 'Das stimmt nicht. Hier ist eine neue Aufgabe.')) });
  }

  /* ---------- Changelog (CHANGELOG.md via build.py) ---------- */
  const NEWS = (typeof CHANGELOG !== 'undefined' && Array.isArray(CHANGELOG)) ? CHANGELOG : [];
  const hasNews = () => NEWS.length > 0 && NEWS[0].date > (meta.seenNews || '');
  const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const deDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d}. ${MONTHS[m - 1]} ${y}`; };
  const GROUP_ICON = { 'Neu': '✨', 'Verbessert': '🔧', 'Behoben': '🐞' };
  function screenNews() {
    const unseen = meta.seenNews || '';
    render(`<div class="screen">${topbar('Was ist neu?')}<div class="scroll"><div class="stack">${NEWS.map((e) => `<div class="card news"><h3>${deDate(e.date)}${e.date > unseen ? ' <span class="newbadge">Neu!</span>' : ''}</h3>${e.groups.map((g) => `<h4>${GROUP_ICON[g.title] || '📌'} ${esc(g.title)}</h4><ul>${g.items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul>`).join('')}</div>`).join('') || '<p>Noch keine Einträge.</p>'}</div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    if (NEWS.length) { meta.seenNews = NEWS[0].date; saveAll(); }
    $('#back').onclick = screenTitle;
  }

  /* ---------- Save code: export, import, merge ---------- */
  const SITE = 'https://thezieger.github.io/rogue-adventures/';
  const b64 = (bin) => btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const viaStream = (bytes, stream) => new Response(new Response(bytes).body.pipeThrough(stream));
  const canZip = (S) => typeof S === 'function' && typeof Response === 'function' && typeof TextEncoder === 'function';
  // a won adventure (and later a purchase) since the last export, which was more than 30 days ago
  const backupDue = () => !!meta.progressAt && meta.progressAt > meta.backupAt && !(Date.now() - Date.parse(meta.backupAt) < 30 * 864e5);
  // short: for the QR code, without answer history and running adventures
  function saveData(short) {
    const m = JSON.parse(JSON.stringify(meta)); const runs = {};
    // unpractised task types are left out too: loading fills them in again with empty stats
    if (short) for (const g of Object.values(m.stats)) for (const [k, st] of Object.entries(g)) { if (st.t) st.hist = []; else delete g[k]; }
    if (short) delete m.weekly; // only this week's progress, the QR has no room for it
    else for (const g of MODE_KEYS) { const r = load(KEY_RUN_FOR(g), null); if (r) runs[g] = r; }
    return { v: 1, at: new Date().toISOString(), meta: m, runs };
  }
  async function packSave(data) {
    const json = JSON.stringify(data);
    if (canZip(window.CompressionStream)) try { const buf = new Uint8Array(await viaStream(new TextEncoder().encode(json), new CompressionStream('deflate-raw')).arrayBuffer()); let bin = ''; for (const b of buf) bin += String.fromCharCode(b); return 'LQ1.' + b64(bin); } catch (e) { /* browsers before 2023 know only gzip and deflate */ }
    return 'LQ0.' + b64(unescape(encodeURIComponent(json)));
  }
  // accepts the code or the whole link; rejects with a message for parents
  async function unpackSave(text) {
    const bad = new Error('Das ist kein vollständiger Lernquest-Code. Bitte den ganzen Code kopieren und einfügen.');
    const m = /^LQ([01])\.([A-Za-z0-9_-]+)$/.exec(String(text).replace(/\s+/g, '').replace(/^.*[#&]lade=/, ''));
    if (!m) throw bad;
    if (m[1] === '1' && !canZip(window.DecompressionStream)) throw new Error('Dieser Browser kann den Code nicht lesen. Bitte den Browser aktualisieren oder den Code auf einem anderen Gerät einfügen.');
    let d;
    try {
      const bin = atob(m[2].replace(/-/g, '+').replace(/_/g, '/'));
      d = JSON.parse(m[1] === '0' ? decodeURIComponent(escape(bin)) : await viaStream(Uint8Array.from(bin, (c) => c.charCodeAt(0)), new DecompressionStream('deflate-raw')).text());
    } catch (e) { throw bad; }
    if (!isObj(d) || d.v !== 1 || !isObj(d.meta)) throw bad;
    return { at: typeof d.at === 'string' ? d.at : '', meta: normMeta(d.meta), runs: isObj(d.runs) ? d.runs : {} };
  }
  const okKnow = (q) => isObj(q) && Number.isFinite(q.c) && Number.isFinite(q.t);
  // dev = this device, inc = from the code (both normalised): nothing that was reached on either device gets lost
  function mergeMeta(dev, inc) {
    const m = JSON.parse(JSON.stringify(dev));
    for (const k of ['runs', 'wins', 'bestWorld', 'knowSeq', 'stamps', 'stampsTotal']) if (Number.isFinite(inc[k])) m[k] = Math.max(Number.isFinite(m[k]) ? m[k] : 0, inc[k]);
    for (const k of ['dex', 'owned', 'seenTut', 'evoUnlocked', 'stampCard', 'worn']) if (isObj(inc[k])) { if (!isObj(m[k])) m[k] = {}; for (const [id, v] of Object.entries(inc[k])) m[k][id] = !(id in m[k]) ? v : k === 'stampCard' ? Math.max(m[k][id], v) : m[k][id]; }
    for (const g of MODE_KEYS) for (const [k, st] of Object.entries(m.stats[g])) { st.c += inc.stats[g][k].c; st.t += inc.stats[g][k].t; }
    for (const [id, q] of Object.entries(inc.know)) { if (!okKnow(q)) continue; const d = m.know[id]; m.know[id] = okKnow(d) ? Object.assign({}, (q.last || 0) > (d.last || 0) ? q : d, { c: d.c + q.c, t: d.t + q.t }) : q; }
    if (inc.progressAt > m.progressAt) m.progressAt = inc.progressAt;
    for (const [k, v] of Object.entries(inc.materials)) m.materials[k] = Math.max(m.materials[k] || 0, v);
    m.garden.beds.forEach((b, i) => { if (!b.crop) m.garden.beds[i] = inc.garden.beds[i]; });
    // the fuller pantry, not both: a code exported from this device would otherwise double what is in it
    if (inc.pantry.length > m.pantry.length) m.pantry = inc.pantry.slice();
    m.hut.rooms = Math.max(m.hut.rooms, inc.hut.rooms); m.hut.items = [...new Set(m.hut.items.concat(inc.hut.items))];
    const dw = m.weekly, iw = inc.weekly;
    if (iw.week > dw.week) m.weekly = JSON.parse(JSON.stringify(iw));
    else if (iw.week === dw.week) {
      dw.progress = Array.from({ length: Math.max(dw.progress.length, iw.progress.length) }, (_, i) => Math.max(dw.progress[i] || 0, iw.progress[i] || 0));
      dw.done = dw.done || iw.done; dw.beaten = [...new Set(dw.beaten.concat(iw.beaten))];
      for (const [k, v] of Object.entries(iw.tally)) { const d = dw.tally[k] || { c: 0, t: 0 }; dw.tally[k] = { c: d.c + v.c, t: d.t + v.t }; }
    }
    // a device without PIN was not set up yet, so it takes the settings from the code
    if (!dev.pin && inc.pin) for (const k of ['off', 'sound', 'grade', 'pin', 'setup']) m[k] = inc[k];
    return m;
  }
  function applySave(s, how) {
    meta = how === 'replace' ? s.meta : mergeMeta(meta, s.meta);
    for (const g of MODE_KEYS) { const r = s.runs[g]; if (how === 'replace') { if (isObj(r)) save(KEY_RUN_FOR(g), r); else clear(KEY_RUN_FOR(g)); } else if (isObj(r) && !loadRun(g)) save(KEY_RUN_FOR(g), r); }
    run = null; saveAll();
    if (!meta.setup.done && !meta.setup.skipped) setupDone('skipped'); // loading a save replaces the setup dialog
    screenTitle();
  }
  function summaryHtml(s) {
    const open = MODE_KEYS.filter((g) => isObj(s.runs[g])).map((g) => MODES[g].title); const d = new Date(s.at);
    return `<ul class="sumlist">${[Number.isFinite(s.meta.stamps) ? `🏷 ${s.meta.stamps} Stempel` : '', `${s.meta.wins} ${s.meta.wins === 1 ? 'Sieg' : 'Siege'}`, `${Object.keys(s.meta.dex).length} im Monsterbuch`,
      open.length ? `Laufende Abenteuer: ${open.join(', ')}` : 'Kein laufendes Abenteuer', isNaN(d) ? '' : `Gesichert am ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`].filter(Boolean).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
  }
  function askImport(s) {
    const ov = modal(`<h2>Spielstand gefunden</h2>${summaryHtml(s)}<p>Zusammenlegen behält alles auf diesem Gerät und nimmt dazu, was im Code mehr ist. Ersetzen überschreibt alles auf diesem Gerät.</p><div class="stack"><button class="btn" id="imerge">Zusammenlegen</button><button class="btn secondary" id="ireplace">Ersetzen</button><button class="btn secondary" id="ino">Nicht laden</button></div>`);
    const go = (how) => () => { ov.remove(); askPin(() => applySave(s, how)); };
    $('#imerge', ov).onclick = go('merge'); $('#ireplace', ov).onclick = go('replace'); $('#ino', ov).onclick = () => ov.remove();
  }
  function importFromLink() {
    const h = location.hash; if (!h.startsWith('#lade=')) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* file:// in some browsers */ }
    unpackSave(h).then(askImport, (e) => { const ov = modal(`<h2>Spielstand nicht geladen</h2><p>${esc(e.message)}</p><button class="btn" id="iok">OK</button>`); $('#iok', ov).onclick = () => ov.remove(); });
  }

  function screenStarter() {
    let sel = CFG().starters.length === 1 ? CFG().starters[0].id : null;
    // recommend the monster whose attacks were practised least (and not the one played last time)
    const S = CFG().starters.filter((s) => !heroLocked(s)); const last = meta.lastStarter[mode];
    const score = (s) => s.attacks.reduce((n, a) => n + practice(a.mod), 0) + (s.id === last ? 1e6 : 0);
    const rec = S.length > 1 ? S.slice().sort((a, b) => score(a) - score(b))[0].id : null;
    // offer to swap the most practised attack for a task type that was hardly practised yet
    let swap = null, swapOn = true;
    const swapFor = (s) => { if (!s) return null; const have = s.attacks.map((a) => a.mod); const cand = enabledMods().filter((k) => !have.includes(k)).sort((a, b) => practice(a) - practice(b))[0]; const most = have.filter((k) => enabledMods().includes(k)).sort((a, b) => practice(b) - practice(a))[0];
      return cand && most && practice(most) >= practice(cand) + 3 ? { from: most, to: cand } : null; };
    const paintSwap = () => { const s = S.find((x) => x.id === sel); swap = swapFor(s); const box = $('#swapbox'); if (!box) return; const M = MODULES_OF();
      box.innerHTML = swap ? `<button class="choice swap ${swapOn ? 'selected' : ''}" id="swap" aria-pressed="${swapOn}"><div class="meta"><div class="name">🎯 Neues üben: ${M[swap.to].icon} ${M[swap.to].name}</div><div class="desc">Statt ${M[swap.from].name} (schon oft geübt) bekommst du die Attacke „${esc(CFG().extra[swap.to])}“. 🐝 Bonus: Fleißbienchen</div></div><span class="tick" aria-hidden="true">${swapOn ? '✔' : ''}</span></button>` : '';
      if (swap) $('#swap').onclick = () => { swapOn = !swapOn; paintSwap(); }; };
    render(`<div class="screen">${topbar(CFG().starters.length === 1 ? 'Dein Held' : 'Wähle dein Monster')}<div class="scroll"><div class="stack">
      ${S.map((s) => `<button class="choice ${CFG().starters.length === 1 ? 'selected' : ''}" data-id="${s.id}">${heroSVG(s, 0)}<div class="meta">${rec === s.id ? '<div class="recbadge">⭐ Empfohlen: übt Neues · 🐝 Bonus</div>' : ''}<div class="name">${s.names[0]}</div>${typeChip(s.type)}<div class="desc">${s.desc}<br>❤️ ${s.hp} LP · Attacken: ${[...new Set(s.attacks.map((a) => MODULES_OF()[a.mod].name))].join(', ')}</div></div></button>`).join('')}
      ${CFG().starters.filter(heroLocked).map((s) => `<div class="choice locked">${monsterSVG(s.shape, '#8A8FA3', 0)}<div class="meta"><div class="name">🔒 ${s.names[0]}</div><div class="desc">Im Stempelheft für ${REWARDS.find((r) => r.hero === s.id).price} 🏷️ zu holen.</div></div></div>`).join('')}
      <div id="swapbox"></div>
      ${meta.pantry.length ? `<p class="center">Aus deinem Vorrat kommt mit: ${meta.pantry.map((it) => `${ITEMS[it].icon} ${ITEMS[it].name}`).join(', ')}</p>` : ''}
      </div></div><div class="bottom"><div class="row"><button class="btn secondary" id="back">Zurück</button><button class="btn" id="go" ${sel ? '' : 'disabled'}>Start</button></div></div></div>`);
    $('#back').onclick = () => screenSubject(subjectOf(mode));
    app.querySelectorAll('.choice[data-id]').forEach((b) => { b.onclick = () => { sel = b.dataset.id; app.querySelectorAll('.choice[data-id]').forEach((x) => x.classList.toggle('selected', x === b)); $('#go').disabled = false; paintSwap(); }; });
    paintSwap();
    $('#go').onclick = () => { if (!sel) return; const s = CFG().starters.find((x) => x.id === sel); run = { mode, world: 1, floor: 1, map: [], hero: { id: s.id, evo: 0, level: 1, xp: 0, hp: s.hp, maxHp: s.hp, attacks: s.attacks.map((a) => ({ name: a.name, mod: a.mod })) }, items: ['trank'].concat(meta.pantry.slice(0, PANTRY_MAX)), coins: marketOn() ? 100 : 0, tiers: Object.fromEntries(MODKEYS().map((k) => [k, 1])), path: [], shield: false };
      run.map = makeMapFor(1);
      if (swap && swapOn) { const a = run.hero.attacks.find((x) => x.mod === swap.from); if (a) { a.mod = swap.to; a.name = CFG().extra[swap.to]; } }
      if (rec && sel === rec) run.items.push('stern');
      if (swap && swapOn) run.items.push('stern');
      meta.pantry = []; meta.lastStarter[mode] = sel; meta.runs++; markWeek(); saveAll(); screenMap(); };
  }
  function makeMapFor(world) { const m = makeMap(world); if (CFG().school && world === 1) { m[1].forEach((n) => { n.t = 'school'; }); if (!m[4].some((n) => n.t === 'school')) m[4][0].t = 'school'; }
    // one special node per world on floors 3–6 instead of an event or treasure (a fight if the map has none)
    const sw = CFG().swap; if (sw) { const on = (t) => m.slice(2, 6).flat().filter((n) => n.t === t); const c = on(sw.from).length ? on(sw.from) : on('fight'); if (c.length) pick(c).t = sw.to; }
    const chests = m.flat().filter((n) => n.t === 'treasure'); if (CFG().mine && chests.length && !offList('math').includes('rest')) pick(chests).t = 'bergwerk';
    // one market per world on floors 3–6, in place of an event (a fight if there is none)
    if (marketOn()) { const fl = m.slice(2, 6).flat(); const ev = fl.filter((n) => n.t === 'event'); const n = pick(ev.length ? ev : fl.filter((x) => x.t === 'fight')); if (n) n.t = 'markt'; }
    // the week's boss takes the place of one fight on floor 5 or 6: once per adventure, until it is beaten this week
    const fights = m[4].concat(m[5]).filter((n) => n.t === 'fight');
    if (!run.wb && fights.length && !weekly().beaten.includes(mode)) { pick(fights).t = 'weekboss'; run.wb = true; }
    if (readsIn(mode)) { const fights = m.slice(1, 6).flat().filter((n) => n.t === 'fight'); pick(fights.length ? fights : m[0]).t = 'lesen'; }
    // last, so the Kreisel-Arena only takes a fight on floors 4–6 that no other special node took (else an event or an elite)
    const tf = ['fight', 'event', 'elite'].map((t) => m.slice(3, 6).flat().filter((n) => n.t === t)).find((c) => c.length); if (tf) pick(tf).t = 'arena';
    return m;
  }
  // one Lesestube per world replaces a fight in every Deutsch and Ethik unit
  const readsIn = (m) => CURRICULUM.some((g) => g.subjects.some((s) => ['Deutsch', 'Ethik'].includes(s.subject) && s.modes.includes(m)));
  // same enemy, weak spot and HP on every device in this week
  function weekBossSpec(world) {
    const r = MQ.seeded(weekly().week + ':' + mode + ':' + world); const pool = CFG().enemies[world].normal; const e = pool[Math.floor(r() * pool.length)];
    return Object.assign({}, e, { name: e.name + ' der Woche', base: e.name, hp: Math.round(e.hp * 1.25), weekboss: true, weakOrder: seededOrder(r, MODKEYS()) });
  }

  const NODE_INFO = { fight: ['⚔️', 'Kampf'], elite: ['💀', 'Elite'], event: ['❓', 'Ereignis'], rest: ['🔥', 'Rast'], treasure: ['🎁', 'Schatz'], boss: ['👑', 'Boss'], school: ['✏️', 'Zeichenschule'], labor: ['🔬', 'Forscherlabor'], karte: ['🗺️', 'Schatzkarte'], weekboss: ['🏅', 'Wochenboss'], markt: ['🧺', 'Markt'], lesen: ['📖', 'Lesestube'], bergwerk: ['⛏️', 'Bergwerk'], arena: ['🌀', 'Kreisel-Arena'] };
  function screenMap() {
    const h = run.hero;
    const open = openNodes(); const live = run.map.map(() => new Set()); open.forEach((i) => live[run.floor - 1].add(i));
    for (let f = run.floor - 1; f < run.map.length - 1; f++) live[f].forEach((i) => run.map[f][i].n.forEach((j) => live[f + 1].add(j)));
    const ROW = 86, H = run.map.length * ROW; const X = (c) => (c + 0.5) * 25; const Y = (f) => H - (f + 0.5) * ROW;
    let lines = '';
    run.map.forEach((fl, f) => fl.forEach((nd, i) => nd.n.forEach((j) => { if (!run.map[f + 1] || !run.map[f + 1][j]) return;
      const walked = run.path[f] === i && run.path[f + 1] === j && f + 1 < run.floor - 1; const next = f === run.floor - 2 && run.path[f] === i && open.includes(j);
      const dead = !walked && !next && !(live[f].has(i) && live[f + 1].has(j));
      lines += `<line class="${walked ? 'walked' : next ? 'next' : dead ? 'dead' : ''}" x1="${X(nd.c)}" y1="${Y(f)}" x2="${X(run.map[f + 1][j].c)}" y2="${Y(f + 1)}"/>`; })));
    const nodes = run.map.map((fl, f) => fl.map((nd, i) => { const isOpen = f === run.floor - 1 && open.includes(i); const taken = run.path[f] === i && f < run.floor - 1;
      const cls = isOpen ? 'open' : taken ? 'taken' : f < run.floor - 1 ? 'past' : live[f].has(i) ? 'future' : 'dead';
      return `<button class="node ${cls} ${nd.t}" style="left:${X(nd.c)}%;top:${Y(f)}px" data-n="${i}" ${isOpen ? '' : 'tabindex="-1" disabled'} aria-label="${NODE_INFO[nd.t][1]}">${NODE_INFO[nd.t][0]}<small>${NODE_INFO[nd.t][1]}</small></button>`; }).join('')).join('');
    const look = mode === 'math' && REWARDS.find((r) => r.world === run.world && meta.owned[r.id]);
    render(`<div class="screen"${look ? ` style="background:${look.bg}"` : ''}>${topbar(`${heroSVG(heroSpec(), h.evo, 'tbhero')}${esc(heroName())} <span class="levelbadge">Lv ${h.level}</span>`)}
      <div style="padding:8px 16px 0"><div class="hpbar"><i style="width:${(h.hp / h.maxHp) * 100}%" class="${h.hp / h.maxHp < .3 ? 'low' : h.hp / h.maxHp < .6 ? 'mid' : ''}"></i></div><div class="row" style="justify-content:space-between;font-size:15px;font-weight:700"><span>❤️ ${h.hp} / ${h.maxHp}</span><span>⭐ ${h.xp} / ${xpNeeded(h.level)} XP</span>${marketOn() ? `<span>🪙 ${euro(run.coins)}</span>` : ''}</div><p class="maphint">Wähle deinen Weg – er sperrt andere. 💀 Elite ist schwer, dafür suchst du dir die Beute aus.</p></div>
      <div class="scroll"><div class="wmap" style="height:${H}px"><svg class="maplines" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${nodes}</div></div>
      <div class="bottom"><div class="row"><button class="btn secondary small" id="bag">🎒 Beutel (${run.items.length})</button><button class="btn ghost small" id="home">Titel</button></div></div></div>`);
    app.querySelectorAll('.node.open').forEach((b) => { b.onclick = () => { const ni = +b.dataset.n; run.path[run.floor - 1] = ni; const type = run.map[run.floor - 1][ni].t; run.node = { type }; saveAll(); enterNode(type); }; });
    $('#home').onclick = screenTitle;
    $('#bag').onclick = () => showBag(null);
    showWeeklyNews();
    const scroller = $('.scroll'); const cur = $('.node.open'); if (cur && scroller) scroller.scrollTop = Math.max(0, scroller.scrollTop + cur.getBoundingClientRect().top - scroller.getBoundingClientRect().top - scroller.clientHeight / 2);
  }
  // nodes the hero can step on now: all of floor 1, later only those the last node leads to
  function openNodes() {
    const fl = run.map[run.floor - 1]; const all = fl.map((_, i) => i); if (run.floor === 1) return all;
    const prev = run.map[run.floor - 2][run.path[run.floor - 2]]; const n = prev ? prev.n.filter((i) => fl[i]) : [];
    return n.length ? n : all;
  }
  function showBag(inBattle) {
    const stacks = []; run.items.forEach((it, i) => { const st = stacks.find((x) => x.id === it); if (st) st.n++; else stacks.push({ id: it, i, n: 1 }); });
    const ov = modal(`<h2>🎒 Beutel</h2>${run.items.length ? `<div class="items">${stacks.map((st) => `<button class="item" data-i="${st.i}" aria-label="${ITEMS[st.id].name}${st.n > 1 ? `, ${st.n} Stück` : ''}: ${esc(ITEMS[st.id].desc)}"><span>${ITEMS[st.id].icon} ${ITEMS[st.id].name}${st.n > 1 ? ` <b class="count">×${st.n}</b>` : ''}</span><small>${esc(ITEMS[st.id].desc)}</small></button>`).join('')}</div><p class="muted" style="opacity:.8;margin-top:10px" id="bagdesc">Tippe auf einen Gegenstand, um ihn zu benutzen.</p>` : '<p>Dein Beutel ist leer.</p>'}<button class="btn secondary" id="close" style="margin-top:10px">Schließen</button>`);
    $('#close', ov).onclick = () => ov.remove();
    ov.querySelectorAll('.item').forEach((b) => { b.onclick = () => { const it = ITEMS[run.items[+b.dataset.i]]; if (it.heal && run.hero.hp >= run.hero.maxHp) { $('#bagdesc', ov).textContent = 'Du hast schon volle Lebenspunkte.'; return; } if ((it.shield || it.power || it.hint) && !inBattle) { $('#bagdesc', ov).textContent = `${it.name}: Das kannst du nur im Kampf benutzen.`; return; } if (it.revive) { $('#bagdesc', ov).textContent = `${it.name}: ${it.desc}`; return; } if ((it.shield && run.shield) || (it.power && run.power) || (it.hint && run.hint)) { $('#bagdesc', ov).textContent = `${it.name} wirkt schon – mehr geht nicht gleichzeitig.`; return; } run.items.splice(+b.dataset.i, 1); if (it.heal) heal(it.heal); if (it.shield) run.shield = true; if (it.power) run.power = true; if (it.hint) run.hint = true; const lv = it.xp ? gainXp(it.xp) : []; saveAll(); ov.remove(); if (inBattle) inBattle(it, lv); else { screenMap(); if (it.xp) { const m = modal(`<h2>${it.icon} +${it.xp} XP</h2>${lv.map((x) => `<p style="font-weight:800;color:var(--orange)">${esc(x)}</p>`).join('') || '<p>Dein Monster lernt dazu.</p>'}<button class="btn" id="tutok">Weiter</button>`); $('#tutok', m).focus({ preventScroll: true }); $('#tutok', m).onclick = () => m.remove(); } } }; });
  }

  // resume exactly where it stopped, so closing the app never swaps a node or resets a fight
  function resumeRun() {
    const n = run.node;
    if (!isObj(n)) return screenMap();
    if (n.done) return advance();
    if (n.reward) return screenTreasure('elite'); // elite beaten, reward not picked yet
    if (isObj(n.enemy)) {
      const b = { enemy: n.enemy, log: 'Der Kampf geht weiter!', logCls: '', phase: 'choose' };
      if (isObj(n.enemy.top) && (n.enemy.hp <= 0 || n.enemy.top.spin <= 0)) return topEnd(b);
      if (n.enemy.hp <= 0) return n.enemy.read ? readEnd(b) : battleWon(b); // defeated just before the app closed: hand out the reward
      if (n.enemy.pending) { b.phase = 'wait'; renderBattle(b); setTimeout(() => { if (run) enemyTurn(b, n.enemy.pending); }, 1200); return; } // the enemy still has its turn
      return renderBattle(b);
    }
    if (n.type === 'event' && Number.isInteger(n.opt)) return screenEvent(n.opt); // a started event task can't be swapped for the safe option
    enterNode(n.type);
  }
  // mark the current node as finished (rewards already given) – a reload then simply moves on
  function nodeDone() { if (run.node) { run.node.done = true; run.node.enemy = null; } }
  function enterNode(type) {
    if (type === 'fight') startBattle(pick(CFG().enemies[run.world].normal), false);
    else if (type === 'elite') startBattle(CFG().enemies[run.world].elite, true);
    else if (type === 'boss') startBattle(CFG().enemies[run.world].boss, true);
    else if (type === 'weekboss') startBattle(weekBossSpec(run.world), true);
    else if (type === 'arena') startBattle(pick(CFG().enemies[run.world].normal), false, true);
    else if (type === 'event') screenEvent();
    else if (type === 'rest') screenRest();
    else if (type === 'treasure') screenTreasure();
    else if (type === 'school') screenSchool(1);
    else if (type === 'bergwerk') screenMine();
    else if (type === 'labor') screenLabor();
    else if (type === 'karte') screenKarte();
    else if (type === 'lesen') screenRead();
    else if (type === 'markt') { if (marketOn()) screenMarket(); else screenEvent(); }
  }
  function advance() { run.floor++; run.shield = false; run.node = null; if (run.floor > 8) { if (run.world >= CFG().worlds) { screenVictory(); return; } run.world++; run.floor = 1; run.map = makeMapFor(run.world); run.path = []; meta.bestWorld = Math.max(meta.bestWorld, run.world); if (CFG().worldAttacks && CFG().worldAttacks[run.world]) { run.hero.attacks = CFG().worldAttacks[run.world].map((x) => ({ name: x.name, mod: x.mod })); } } saveAll(); screenMap(); }

  /* ---------- Battle ---------- */
  // arena: a spinning-top duel against the owner of the other top, which isn't a Monsterbuch entry
  function startBattle(spec, hard, arena) {
    // extra HP offsets weak-spot damage, so fights stay about as long
    const scale = ENEMY_HP * (1 + (run.floor - 1) * 0.03); const elite = hard && !spec.boss;
    const dexName = spec.base || spec.name; const fresh = !arena && !meta.dex[dexName]; if (fresh) giveStamps(2);
    const mods = heroAttacks().map((a) => a.mod); const weak = spec.weakOrder ? spec.weakOrder.find((k) => mods.includes(k)) : pickWeak();
    const enemy = { fresh, name: spec.name, type: spec.type, shape: spec.shape, maxHp: Math.round(spec.hp * scale), hp: Math.round(spec.hp * scale), atk: Math.round(spec.atk * (1 + (run.floor - 1) * 0.02)) + (elite ? 1 : 0), boss: !!spec.boss, elite, weekboss: !!spec.weekboss, weak };
    if (arena) Object.assign(enemy, { hp: TOP_FOE(), maxHp: TOP_FOE(), top: topStart(enemy) }); else meta.dex[dexName] = { type: spec.type, shape: spec.shape, world: run.world, mode };
    if (run.node) { run.node.enemy = enemy; saveAll(); }
    const b = { enemy, log: arena ? `${esc(enemy.name)} tritt mit einem Kreisel an. Hol zuerst Schwung: Jede richtige Aufgabe gibt +4.` : `${enemy.name} taucht auf! 🎯 Schwachstelle: ${esc(weakName(enemy.weak))}.`, logCls: '', phase: 'choose' };
    renderBattle(b);
  }
  function renderBattle(b) {
    const h = run.hero, e = b.enemy;
    const pct = (a, m) => Math.max(0, (a / m) * 100);
    const hpcls = (a, m) => a / m < .3 ? 'low' : a / m < .6 ? 'mid' : '';
    const quiet = !!b.shown; b.shown = true; const T = e.top;
    render(`<div class="screen">${topbar(T ? '🌀 Kreisel-Arena' : e.read ? '📖 Lesestube' : e.boss ? '👑 Bosskampf' : e.weekboss ? '🏅 Wochenboss' : e.elite ? '💀 Elitekampf' : '⚔️ Kampf')}
      <div class="arena ${T ? 'kreisel' : ''}">
        <div class="plate enemy"><div class="name">${esc(e.name)}</div><div class="plateline">${typeChip(e.type)}${BEATS[heroSpec().type] === e.type ? `<span class="advantage">💪 stark gegen ${TYPES[e.type].name}</span>` : ''}</div><div class="hpbar"><i class="${hpcls(e.hp, e.maxHp)}" style="width:${pct(e.hp, e.maxHp)}%"></i></div><div class="hptext">${T ? `🌀 ${e.hp} Schwung` : `❤️ ${e.hp} / ${e.maxHp}`}</div></div>
        ${T ? `<div class="dish ${b.clash ? 'clash' : quiet ? '' : 'launch'}" id="dish">${SPIRAL}${topSprite('enemy', e.hp, e.maxHp, TYPES[e.type].color, foeParts(), (b.clash === 'foe' ? 'attacker' : b.clash ? 'target' : '') + (T.spin <= 0 ? ' winner' : ''))}${topSprite('hero', T.spin, T.max, TYPES[heroSpec().type].color, T.parts, (b.clash === 'hero' ? 'attacker' : b.clash ? 'target' : b.boost ? 'boost' : '') + (e.hp <= 0 ? ' winner' : ''))}</div>` : `<div class="sprite enemy" id="fe">${monsterSVG(e.shape, TYPES[e.type].color, 0, 'enemy', { elite: e.elite, boss: e.boss || e.weekboss })}<i class="ground"></i></div>
        <div class="sprite hero" id="fh">${heroSVG(heroSpec(), h.evo)}<i class="ground"></i></div>`}
        <div class="plate hero"><div class="name">${esc(heroName())} <span class="levelbadge">Lv ${h.level}</span></div>${T ? `<div class="hpbar"><i class="${hpcls(T.spin, T.max)}" style="width:${pct(T.spin, T.max)}%"></i></div><div class="hptext">🌀 ${T.spin} Schwung</div>` : `<div class="hpbar"><i class="${hpcls(h.hp, h.maxHp)}" style="width:${pct(h.hp, h.maxHp)}%"></i></div><div class="hptext">❤️ ${h.hp} / ${h.maxHp} ${run.shield ? '🛡️' : ''}</div>`}<div class="xpbar" aria-label="Erfahrung"><i style="width:${Math.min(100, (h.xp / xpNeeded(h.level)) * 100)}%"></i></div></div>
      </div>
      <div class="log ${b.logCls}">${b.log}</div>
      <div class="taskwrap" id="taskwrap"></div>
      <div class="bottom" id="bottom"></div></div>`, quiet);
    announce(b.log.replace(/<[^>]+>/g, ''));
    delete b.clash; delete b.boost; // the clash plays once, on this render
    if (b.phase === 'choose') renderAttackChoice(b);
  }
  // a top in the dish: spins slower and wobbles more as its Schwung runs out; the burst shows where a clash lands
  const BANG = `<svg class="bang" viewBox="0 0 100 100" aria-hidden="true"><path d="${Array.from({ length: 24 }, (_, i) => { const r = i % 2 ? 26 : 48, a = (i / 24) * 2 * Math.PI; return `${i ? 'L' : 'M'}${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`; }).join('')}Z" fill="#FFC93C" stroke="#1C2541" stroke-width="3" stroke-linejoin="round"/><path d="${Array.from({ length: 12 }, (_, i) => { const r = i % 2 ? 10 : 24, a = (i / 12) * 2 * Math.PI + 0.3; return `${i ? 'L' : 'M'}${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`; }).join('')}Z" fill="#FFF9EE"/></svg>`;
  const SPARKS = Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * 2 * Math.PI + 0.4; return `<i style="--dx:${Math.round(70 * Math.cos(a))}px;--dy:${Math.round(48 * Math.sin(a))}px"></i>`; }).join('');
  const SPIRAL = (() => { let d = ''; for (let t = 0; t <= 4 * Math.PI; t += 0.25) { const r = 2 + t * 3.4; d += `${d ? 'L' : 'M'}${(r * Math.cos(t)).toFixed(1)} ${(r * Math.sin(t)).toFixed(1)}`; } return `<svg class="emblem" viewBox="-50 -50 100 100" aria-hidden="true"><path d="${d}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`; })();
  function topSprite(who, spin, max, color, parts, state) {
    const live = spin > 0; const speed = (0.45 + 0.65 * (1 - spin / max)).toFixed(2);
    return `<div class="sprite ${who} ${live ? 'live' : 'fallen'} ${live && spin / max < 0.3 ? 'low' : ''} ${state}" id="${who === 'hero' ? 'fh' : 'fe'}" style="--spin:${speed}s"><i class="streaks"></i>${MONART.topSVG(color, parts, live ? 'live' : 'fallen')}<i class="wave"></i><span class="sparks">${SPARKS}</span>${BANG}</div>`;
  }
  // Repeating an attack makes it tired; the weak spot moves to the least-practised attack after each hit.
  // Both push children to practise all task types. Damage is always a whole number.
  const TIRED = [1, 0.6, 0.35], WEAK = 1.5, ENEMY_HP = 1.4;
  function pickWeak(except) {
    run.used = isObj(run.used) ? run.used : {};
    const mods = [...new Set(heroAttacks().map((a) => a.mod))]; const pool = mods.length > 1 ? mods.filter((m) => m !== except) : mods;
    const least = Math.min(...pool.map((m) => run.used[m] || 0)); return pick(pool.filter((m) => (run.used[m] || 0) === least));
  }
  function weakName(mod) { const a = heroAttacks().find((x) => x.mod === mod); return a ? a.name : MODULES_OF()[mod].name; }
  function attackInfo(b, atk) {
    const strong = BEATS[heroSpec().type] === b.enemy.type; const weak = b.enemy.weak === atk.mod;
    const tired = b.enemy.lastMod === atk.mod ? Math.min(b.enemy.reps || 1, TIRED.length - 1) : 0;
    let dmg = (MODULES_OF()[atk.mod].dmg + run.hero.level * 2) * (strong ? 1.5 : 1) * (weak ? WEAK : 1) * TIRED[tired];
    if (run.power) dmg *= 2;
    return { dmg: Math.max(1, Math.round(dmg)), strong, tired, weak };
  }
  function noteAttackUsed(b, atk) { if (b.enemy.lastMod === atk.mod) b.enemy.reps = (b.enemy.reps || 1) + 1; else { b.enemy.lastMod = atk.mod; b.enemy.reps = 1; } }
  function renderAttackChoice(b) {
    if (b.enemy.read) return readChoice(b);
    if (b.enemy.top) return topChoice(b);
    const atks = heroAttacks(); const MODULES = MODULES_OF();
    if (!atks.some((a) => a.mod === b.enemy.weak)) { b.enemy.weak = pickWeak(); saveAll(); } // older save or task types switched in the parent area
    $('#bottom').innerHTML = `<div class="attacks">${atks.map((a, i) => { const inf = attackInfo(b, a); return `<button class="atk ${inf.tired ? 'tired' : ''} ${inf.weak ? 'weak' : ''}" data-i="${i}" aria-label="${esc(a.name)}: ${MODULES[a.mod].name}, ${inf.dmg} Schaden${inf.weak ? ', Schwachstelle' : ''}${inf.strong ? ', stark' : ''}${inf.tired ? ', müde' : ''}"><span class="n">${esc(a.name)}</span><span class="m">${MODULES[a.mod].icon} ${MODULES[a.mod].name}<span class="dmg">💥 ${inf.dmg}</span></span><span class="tags">${inf.weak ? '<span class="tag weak">🎯 Schwachstelle</span>' : ''}${inf.tired ? `<span class="tag tired">😮‍💨 ${inf.tired > 1 ? 'sehr müde' : 'müde'}</span>` : ''}${run.power ? '<span class="tag power">🌶️ doppelt</span>' : ''}</span></button>`; }).join('')}</div><div class="row" style="margin-top:8px"><button class="btn secondary small" id="bag">🎒 Beutel (${run.items.length})</button><span class="muted" style="align-self:center;font-size:14px">Tipp: Nimm die 🎯 Schwachstelle und wechsle ab.</span></div>`;
    $('#bag').onclick = () => showBag((it, lv) => useItemInBattle(b, it, lv));
    app.querySelectorAll('.atk').forEach((btn) => { btn.onclick = () => chooseAttack(b, atks[+btn.dataset.i]); });
    if (!meta.seenTut['battle:intro2']) showBattleIntro();
  }
  function showBattleIntro() {
    const ov = modal(`<h2>So kämpfst du</h2><ol><li>Tippe auf eine Attacke und löse die Aufgabe.</li><li>Richtig gelöst: Dein Monster trifft. Die Zahl bei 💥 zeigt, wie viel Schaden das macht.</li><li>💪 <b>Stark gegen …</b> beim Gegner heißt: Dein Monster ist stark gegen ihn – alle Attacken machen mehr Schaden.</li><li>🎯 <b>Schwachstelle</b>: Mit dieser Attacke triffst du besonders stark. Nach dem Treffer wandert sie zu einer anderen Attacke.</li><li>😮‍💨 <b>müde</b> heißt: Du hast die Attacke gerade schon benutzt. Nimm eine andere – dann ist sie wieder stark.</li><li>Falsch gelöst: Der Gegner bekommt einen freien Schlag.</li></ol><button class="btn" id="tutok" style="margin-top:12px">Alles klar</button>`);
    $('#tutok', ov).focus({ preventScroll: true });
    $('#tutok', ov).onclick = () => { ov.remove(); meta.seenTut['battle:intro2'] = true; saveAll(); };
  }
  // potions take your turn; shield, cookie, magnifier and stars don't
  function useItemInBattle(b, it, lv) {
    b.logCls = 'hit';
    if (it.xp) { b.log = `${it.icon} +${it.xp} XP!${lv && lv.length ? ' ' + lv.join(' ') : ''}`; b.phase = 'choose'; renderBattle(b); return; }
    if (it.shield) { b.log = `${it.icon} Schild bereit! Der nächste Angriff wird geblockt.`; b.phase = 'choose'; renderBattle(b); return; }
    if (it.power) { b.log = `${it.icon} ${it.name}! Dein nächster Treffer macht doppelten Schaden.`; b.phase = 'choose'; renderBattle(b); return; }
    if (it.hint) { b.log = `${it.icon} ${it.name}! Bei der nächsten Aufgabe bekommst du einen Tipp.`; b.phase = 'choose'; renderBattle(b); return; }
    b.log = `${it.icon} ${it.name} benutzt!`; enemyTurn(b, 1);
  }
  function chooseAttack(b, atk) {
    const tier = tierFor(atk.mod);
    let t = makeTask(atk.mod, tier, { elite: b.enemy.elite || b.enemy.boss });
    b.phase = 'task'; $('.screen').classList.add('tasking'); $('#bottom').innerHTML = ''; // no second attack while the task opens
    const hint = !!run.hint; run.hint = false;
    let hit = null;
    // the answer counts the moment it is checked: damage, stats and the enemy's turn are saved right away
    const onResult = (ok) => {
      recordAnswer(atk.mod, ok, t);
      const inf = attackInfo(b, atk);
      if (ok) {
        noteAttackUsed(b, atk); // only hits make an attack tired – after a mistake the child may try the same type again
        let dmg = inf.dmg; const crit = heroSpec().perk === 'crit' && Math.random() < 0.15;
        if (crit) dmg *= 2;
        run.power = false;
        b.enemy.hp = Math.max(0, b.enemy.hp - dmg);
        run.used = isObj(run.used) ? run.used : {}; run.used[atk.mod] = (run.used[atk.mod] || 0) + 1;
        if (inf.weak && !b.enemy.weekboss) b.enemy.weak = pickWeak(atk.mod); // the week's boss keeps its weak spot
        if (heroSpec().perk === 'heal') heal(3);
        b.log = `${atk.name}: ${crit ? 'VOLLTREFFER – doppelter Schaden! ' : inf.weak ? 'Schwachstelle getroffen! ' : inf.strong ? 'Stark! ' : 'Treffer! '}${dmg} Schaden${inf.tired ? ' (müde)' : ''}`; b.logCls = crit ? 'crit' : 'hit';
        hit = { dmg, crit };
        if (b.enemy.hp > 0) b.enemy.pending = 1;
      } else {
        b.log = `${atk.name} geht daneben. ${b.enemy.name} hat einen freien Schlag!`; b.logCls = 'miss';
        b.enemy.pending = 1.5;
      }
      saveAll();
    };
    ensureTutorial(t, () => {
      runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: atk.name, hint, onResult }, () => {
        b.phase = b.enemy.hp <= 0 ? 'over' : 'wait';
        if (hit) { renderBattle(b, true); $('#fe').classList.add('hurt'); fx('#fe', '−' + hit.dmg, hit.crit ? 'crit' : ''); if (hit.crit) SFX.crit(); else SFX.hit(); }
        else renderBattle(b, true);
        if (b.enemy.hp <= 0) { setTimeout(() => { if (run) battleWon(b); }, 1500); return; }
        setTimeout(() => { if (run) enemyTurn(b, b.enemy.pending || 1); }, hit ? 1700 : 1900);
      });
    });
  }
  function enemyTurn(b, mult) {
    const h = run.hero; const move = pick(CFG().moves || ENEMY_MOVES);
    b.taken = 0; delete b.enemy.pending;
    if (run.shield) { run.shield = false; b.log = `${b.enemy.name} greift mit ${move} an – dein Schild blockt alles! 🛡️`; b.logCls = 'hit'; }
    else { let dmg = Math.round(b.enemy.atk * mult * (0.85 + Math.random() * 0.3)); if (BEATS[b.enemy.type] === heroSpec().type) dmg = Math.round(dmg * 1.25); if (heroSpec().perk === 'tank') dmg = Math.round(dmg * 0.85); dmg = Math.max(1, dmg); b.taken = dmg; h.hp = Math.max(0, h.hp - dmg); b.log = `${b.enemy.name} greift mit ${move} an: ${dmg} Schaden${mult > 1 ? ' (freier Schlag)' : ''}`; b.logCls = 'miss'; }
    const angel = run.items.indexOf('engel');
    if (h.hp <= 0 && angel >= 0) { run.items.splice(angel, 1); h.hp = Math.round(h.maxHp * 0.5); b.log += ` – aber ${ITEMS.engel.icon} der Schutzengel rettet dich! ❤️ ${h.hp}`; b.logCls = 'crit'; }
    b.phase = h.hp <= 0 ? 'over' : 'choose'; if (h.hp <= 0) { b.stamps = payAnswers(); endRun(); } else saveAll(); renderBattle(b);
    if (b.taken) { $('#fh').classList.add('hurt'); fx('#fh', '−' + b.taken); SFX.hurt(); } else { fx('#fh', '🛡️', 'shield'); SFX.block(); }
    if (h.hp <= 0) setTimeout(() => screenGameOver(b), 1600);
  }
  const LOOT = { normal: ['beere', 'beere', 'trank', 'keks', 'lupe', 'stern'], boss: ['engel', 'keks', 'schild'], chest: ['trank', 'schild', 'keks', 'lupe', 'engel', 'stern'], rare: ['engel', 'grosstrank', 'schild'] };
  function battleWon(b) {
    const e = b.enemy; const xp = e.boss ? 60 : e.elite ? 35 : 18;
    const msgs = gainXp(xp);
    // ~1/3 of normal fights drop one item, bosses two; elites pick a reward on the next screen
    const drops = [];
    if (e.boss) drops.push('grosstrank', pick(LOOT.boss));
    else if (!e.elite && Math.random() < 0.3) drops.push(pick(LOOT.normal));
    run.items.push(...drops);
    const coins = marketOn() ? (e.boss ? rnd(40, 60) : e.elite ? rnd(20, 40) : rnd(6, 16)) * 5 : 0; run.coins += coins;
    const wood = mode === 'kartoffel' ? (e.boss ? 3 : 1) : 0; if (wood) addMat('holz', wood);
    // the Monsterbuch stamps were given when the enemy appeared, they are only shown here
    const stamps = payAnswers() + (e.boss ? giveStamps(5) : 0) + (e.fresh ? 2 : 0);
    if (!(e.boss && run.world >= CFG().worlds)) setTimeout(SFX.win, 150);
    if (e.weekboss) { weekly().beaten.push(mode); weeklyStep('boss'); } else if (e.elite) weeklyStep('elite');
    if (e.elite && run.node) { run.node.enemy = null; run.node.reward = true; } else nodeDone();
    let evoMsg = '';
    if (e.boss && run.hero.evo < 2 && CFG().worlds > 1 && run.world < CFG().worlds) { run.hero.evo++; run.hero.maxHp += 15; heal(20); meta.evoUnlocked[run.hero.id + run.hero.evo] = true; const wa = CFG().worldAttacks && CFG().worldAttacks[run.world + 1]; evoMsg = `<div class="card center" style="margin-top:12px"><h3>Dein Monster entwickelt sich!</h3><div class="evo-row">${heroSVG(heroSpec(), run.hero.evo - 1, 'before')}<span aria-hidden="true">➜</span>${heroSVG(heroSpec(), run.hero.evo, 'after')}</div><p>Dein Monster ist jetzt <b>${esc(heroName())}</b>!</p>${wa ? `<p>Neue Attacken für die nächste Welt: ${wa.map((x) => esc(x.name)).join(', ')}</p>` : ''}</div>`; }
    saveAll();
    render(`<div class="screen">${topbar('Gewonnen!')}<div class="scroll"><div class="card center"><h2>${esc(e.name)} besiegt!</h2><p>+${xp} XP</p>${coins ? `<p>🪙 +${euro(coins)}</p>` : ''}${wood ? `<p>🪵 +${wood} Holz für die Werkbank</p>` : ''}${stampLine(stamps)}${drops.map((d) => `<p>${ITEMS[d].icon} ${ITEMS[d].name} gefunden! <small class="muted" style="color:var(--ink-soft)">${esc(ITEMS[d].desc)}</small></p>`).join('')}${e.elite ? '<p>Als Beute suchst du dir gleich eine Belohnung aus.</p>' : ''}${msgs.map((m) => `<p style="color:var(--orange);font-weight:800">${m}</p>`).join('')}</div>${evoMsg}</div><div class="bottom"><button class="btn" id="next">${e.elite ? 'Beute aussuchen' : e.boss ? (run.world >= CFG().worlds ? 'Zum großen Finale' : 'Weiter zur nächsten Welt') : 'Weiter'}</button></div></div>`);
    $('#next').onclick = e.elite ? () => screenTreasure('elite') : advance;
  }

  /* ---------- Kreisel-Arena ---------- */
  // Schwung instead of life points: three tasks to wind up (+4 each), then each right answer costs the other top
  // your Wucht, each wrong one costs yours 6 minus Panzer. No items; losing only ends this node.
  const TOP_START = 3, TOP_WIND = 4, TOP_KNOCK = 6;
  const TOP_FOE = () => 16 + 8 * run.world;
  const topVal = (slot) => TOP[slot].find((p) => p.id === meta.top[slot]).val;
  // the other top gets better parts in later worlds (only its look; its Schwung comes from TOP_FOE)
  const foeParts = () => { const i = Math.min(run.world, 3) - 1; return { tip: TOP.tip[i].id, ring: TOP.ring[i].id, disc: TOP.disc[i].id }; };
  // parts and values are fixed when the duel starts, so changing parts during a running duel changes nothing
  const topStart = (enemy) => ({ start: 0, spin: topVal('disc'), max: topVal('disc') + TOP_START * TOP_WIND, wucht: topVal('tip') + (BEATS[heroSpec().type] === enemy.type ? 2 : 0), panzer: topVal('ring'), parts: Object.assign({}, meta.top) });
  function topChoice(b) {
    const e = b.enemy, T = e.top;
    if (e.hp <= 0 || T.spin <= 0) { $('#bottom').innerHTML = '<button class="btn" id="next">Weiter</button>'; $('#next').onclick = () => topEnd(b); return; }
    const atks = heroAttacks(); const M = MODULES_OF(); const wind = T.start < TOP_START;
    $('#bottom').innerHTML = `<div class="attacks">${atks.map((a, i) => `<button class="atk" data-i="${i}" aria-label="${esc(a.name)}: ${M[a.mod].name}, ${wind ? `${TOP_WIND} Schwung` : `Wucht ${T.wucht}`}"><span class="n">${esc(a.name)}</span><span class="m">${M[a.mod].icon} ${M[a.mod].name}<span class="dmg">${wind ? `🌀 +${TOP_WIND}` : `💥 ${T.wucht}`}</span></span></button>`).join('')}</div>
      <p class="muted toprule">${wind ? `Schwung holen: Aufgabe ${T.start + 1} von ${TOP_START}` : `Wucht ${T.wucht} · Panzer ${T.panzer}. Eine falsche Antwort kostet dich ${TOP_KNOCK - T.panzer} Schwung.`}</p>`;
    app.querySelectorAll('.atk').forEach((btn) => { btn.onclick = () => topAttack(b, atks[+btn.dataset.i]); });
    if (!meta.seenTut['arena:intro']) {
      const ov = modal(`<h2>🌀 Kreisel-Arena</h2><ol><li>Erst holst du Schwung: ${TOP_START} Aufgaben, jede richtige gibt deinem Kreisel ${TOP_WIND} Schwung.</li><li>Dann stoßen die Kreisel zusammen. Richtig gelöst: Der andere Kreisel verliert so viel Schwung, wie deine Wucht zeigt.</li><li>Falsch gelöst: Dein Kreisel verliert ${TOP_KNOCK} Schwung, weniger, je mehr Panzer er hat.</li><li>Ein Kreisel ohne Schwung kippt um. Verlierst du, geht dein Abenteuer einfach weiter.</li><li>Neue Teile für deinen Kreisel gibt es im Stempelheft unter „Kreisel bauen“.</li></ol><button class="btn" id="tutok" style="margin-top:12px">Verstanden</button>`);
      $('#tutok', ov).focus({ preventScroll: true }); $('#tutok', ov).onclick = () => { ov.remove(); meta.seenTut['arena:intro'] = true; saveAll(); };
    }
  }
  function topAttack(b, atk) {
    const e = b.enemy, T = e.top; const t = makeTask(atk.mod, tierFor(atk.mod)); const wind = T.start < TOP_START;
    b.phase = 'task'; $('.screen').classList.add('tasking'); $('#bottom').innerHTML = ''; $('#dish').classList.remove('clash');
    let fxOn = null;
    const onResult = (ok) => {
      recordAnswer(atk.mod, ok, t);
      if (wind) { T.start++; if (ok) T.spin += TOP_WIND; b.log = `${ok ? `Richtig: +${TOP_WIND} Schwung` : 'Daneben: kein Schwung dazu'} (${T.start} von ${TOP_START}).${T.start === TOP_START ? ' Jetzt stoßen die Kreisel zusammen.' : ''}`; b.logCls = ok ? 'hit' : 'miss'; if (ok) { fxOn = ['#fh', '+' + TOP_WIND, 'shield']; b.boost = true; } }
      else if (ok) { e.hp = Math.max(0, e.hp - T.wucht); b.log = `${esc(atk.name)}: Dein Kreisel kracht in den anderen. Der verliert ${T.wucht} Schwung.`; b.logCls = 'hit'; fxOn = ['#fe', '−' + T.wucht]; b.clash = 'hero'; }
      else { const l = TOP_KNOCK - T.panzer; T.spin = Math.max(0, T.spin - l); b.log = `Daneben. Der andere Kreisel kracht in deinen, der verliert ${l} Schwung.`; b.logCls = 'miss'; fxOn = ['#fh', '−' + l]; b.clash = 'foe'; }
      if (e.hp <= 0) b.log += ' Der andere Kreisel kippt um.'; else if (T.spin <= 0) b.log += ' Dein Kreisel kippt um.';
      saveAll();
    };
    ensureTutorial(t, () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: wind ? 'Schwung holen' : atk.name, onResult }, () => {
      b.phase = 'choose'; renderBattle(b, true);
      if (!fxOn) return;
      if (wind) fx(fxOn[0], fxOn[1], fxOn[2]);
      else setTimeout(() => { if (!run || !$(fxOn[0])) return; fx(fxOn[0], fxOn[1]); if (fxOn[0] === '#fe') SFX.hit(); else SFX.hurt(); }, reducedMotion ? 0 : 560);
    }));
  }
  // like a fight: the answers pay their stamps either way, the win adds XP and 1 stamp
  function topEnd(b) {
    const e = b.enemy, T = e.top, won = e.hp <= 0; const xp = won ? 18 : 0; const msgs = won ? gainXp(xp) : [];
    const stamps = payAnswers() + (won ? giveStamps(1) : 0);
    nodeDone(); saveAll(); if (won) setTimeout(SFX.win, 150);
    render(`<div class="screen">${topbar('🌀 Kreisel-Arena')}<div class="scroll"><div class="card center topend" id="topend"><h2>${won ? 'Der andere Kreisel kippt um.' : 'Dein Kreisel kippt um.'}</h2>${MONART.topSVG(TYPES[heroSpec().type].color, T.parts, won ? 'live' : 'fallen')}
      <p>${won ? `Dein Kreisel dreht sich noch mit ${T.spin} Schwung.` : `${esc(e.name)} gewinnt diesmal. Das kostet dich nichts, dein Abenteuer geht weiter.`}</p>${xp ? `<p>+${xp} XP</p>` : ''}${stampLine(stamps)}${msgs.map((m) => `<p style="color:var(--orange);font-weight:800">${m}</p>`).join('')}
      ${won ? '' : '<p>Neue Teile für deinen Kreisel gibt es im Stempelheft unter „Kreisel bauen“.</p>'}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`);
    $('#next').onclick = advance;
  }

  /* ---------- Lesestube ---------- */
  // three questions about a text are the attacks; after the third the reading lesson ends, beaten or not
  const READ_FOE = { name: 'Der Zeilenspringer', type: 'normal', shape: 'zeilenspringer', hp: 30, atk: 4 };
  const READ_MOD = { icon: '📖', name: 'Lesestube' };
  const READ_TUT = { title: 'Lesestube', steps: ['Lies den Text in Ruhe. Vor jeder Frage kannst du ihn noch einmal ansehen.', 'Jede richtige Antwort trifft den Zeilenspringer. Nach einer falschen Antwort schlägt er zurück.', 'Nach drei Fragen ist die Lesestunde vorbei.'] };
  const readText = () => TEXTE[run.node.text];
  const readCard = (t) => `<div class="card readcard"><div class="eyebrow">${esc(t.kind)}</div><h2>${esc(t.title)}</h2><p>${esc(t.text)}</p></div>`;
  function screenRead() {
    if (!Number.isInteger(run.node.text) || !TEXTE[run.node.text]) { run.node.text = rnd(0, TEXTE.length - 1); saveAll(); }
    render(`<div class="screen">${topbar('📖 Lesestube')}<div class="scroll">${readCard(readText())}</div><div class="bottom"><button class="btn" id="next">Zu den Fragen</button></div></div>`);
    $('#next').onclick = () => {
      const e = { name: READ_FOE.name, type: READ_FOE.type, shape: READ_FOE.shape, maxHp: READ_FOE.hp, hp: READ_FOE.hp, atk: READ_FOE.atk, read: { q: 0, right: 0 } };
      run.node.enemy = e; saveAll();
      renderBattle({ enemy: e, log: `${e.name} bringt die Zeilen durcheinander. Beantworte drei Fragen zum Text.`, logCls: '', phase: 'choose' });
    };
  }
  function readChoice(b) {
    const r = b.enemy.read; const dmg = Math.ceil(b.enemy.maxHp / 3);
    if (r.q >= 3 || b.enemy.hp <= 0) { $('#bottom').innerHTML = '<button class="btn" id="next">Weiter</button>'; $('#next').onclick = () => readEnd(b); return; }
    $('#bottom').innerHTML = `<div class="attacks" style="grid-template-columns:1fr"><button class="atk" id="rq" aria-label="Frage ${r.q + 1} von 3, ${dmg} Schaden"><span class="n">Frage ${r.q + 1} von 3</span><span class="m">${READ_MOD.icon} ${READ_MOD.name}<span class="dmg">💥 ${dmg}${run.power ? ' · 🌶️ doppelt' : ''}</span></span></button></div><div class="row" style="margin-top:8px"><button class="btn secondary small" id="rtext">📄 Text ansehen</button><button class="btn secondary small" id="bag">🎒 Beutel (${run.items.length})</button></div>`;
    $('#rtext').onclick = () => { const ov = modal(`${readCard(readText())}<button class="btn" id="tutok" style="margin-top:12px">Zurück zur Frage</button>`); $('#tutok', ov).focus({ preventScroll: true }); $('#tutok', ov).onclick = () => ov.remove(); };
    $('#bag').onclick = () => showBag((it, lv) => useItemInBattle(b, it, lv));
    $('#rq').onclick = () => readAsk(b, dmg);
  }
  function readAsk(b, dmg) {
    const r = b.enemy.read; const tx = readText(); const q = tx.qs[r.q];
    const t = { kind: 'choice', mod: 'lesen', tier: 1, group: 'lesen:1', q: q.q, options: shuffle(q.o), answer: q.o[q.a], qid: 'lesen_' + tx.id + r.q, cols: 1 };
    b.phase = 'task'; $('.screen').classList.add('tasking'); $('#bottom').innerHTML = '';
    const hint = !!run.hint; run.hint = false; let hit = 0;
    const onResult = (ok) => {
      r.q++;
      if (ok) { r.right++; hit = dmg * (run.power ? 2 : 1); run.power = false; b.enemy.hp = Math.max(0, b.enemy.hp - hit); b.log = `Richtig gelesen: ${hit} Schaden`; b.logCls = 'hit'; }
      else { b.log = `Das stand anders im Text. ${b.enemy.name} hat einen freien Schlag!`; b.logCls = 'miss'; b.enemy.pending = 1; }
      saveAll();
    };
    ensureTutorial(t, () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: `Frage ${r.q + 1} von 3`, hint, onResult }, () => {
      b.phase = b.enemy.pending ? 'wait' : 'choose'; renderBattle(b, true);
      if (hit) { $('#fe').classList.add('hurt'); fx('#fe', '−' + hit); SFX.hit(); }
      else setTimeout(() => { if (run) enemyTurn(b, 1); }, 1700);
    }));
  }
  function readEnd(b) {
    const r = b.enemy.read; const beaten = b.enemy.hp <= 0; const xp = 6 * r.right; const msgs = gainXp(xp);
    nodeDone(); saveAll(); if (r.right) setTimeout(SFX.win, 150);
    render(`<div class="screen">${topbar('📖 Lesestube')}<div class="scroll"><div class="card center"><h2>${esc(b.enemy.name)} ${beaten ? 'ist besiegt.' : 'verschwindet zwischen den Seiten.'}</h2><p>${r.right} von 3 Fragen richtig</p>${xp ? `<p>+${xp} XP</p>` : ''}${msgs.map((m) => `<p style="color:var(--orange);font-weight:800">${m}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`);
    $('#next').onclick = advance;
  }

  /* ---------- Event ---------- */
  function screenEvent(resumeOpt) {
    // run.node.ev indexes the whole list, so new events are only ever appended; w = only in that world
    const EV = CFG().events; const coinEv = (ev) => ev.opts.some((o) => [o.effect, o.win, o.lose].some((x) => x && x.coins));
    const ids = EV.map((_, i) => i).filter((i) => (!EV[i].w || EV[i].w === run.world) && (marketOn() || !coinEv(EV[i])));
    if (!Number.isInteger(run.node && run.node.ev) || !EV[run.node.ev]) { if (run.node) run.node.ev = pick(ids); saveAll(); }
    const ev = run.node ? EV[run.node.ev] : EV[pick(ids)];
    render(`<div class="screen">${topbar('❓ Ereignis')}<div class="scroll"><div class="card"><h2>${esc(ev.title)}</h2><p style="font-size:20px">${esc(ev.text)}</p>${ev.dilemma ? '<p><b>Was würdest du tun?</b> Hier gibt es kein Richtig oder Falsch.</p>' : ''}</div></div><div class="bottom"><div class="stack">${ev.opts.map((o, i) => `<button class="btn ${i || ev.dilemma ? 'secondary' : ''}" data-i="${i}" ${o.effect && run.coins < -(o.effect.coins || 0) ? 'disabled' : ''}>${esc(o.label)}</button>`).join('')}</div></div></div>`);
    const runOpt = (i) => { const o = ev.opts[i]; if (!o) return screenEvent();
      if (!o.task) { applyEffect(ev.dilemma ? ev.reward : o.effect); showEffect(ev.title, o); return; }
      if (run.node) { run.node.opt = i; saveAll(); }
      const mod = o.task === 'geld' ? 'geld' : o.task === 'any' || !enabledMods().includes(o.task) ? pick(enabledMods()) : o.task; const t = makeTask(mod, tierFor(mod), { g: o.g });
      render(`<div class="screen">${topbar('❓ ' + esc(ev.title))}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`);
      let won = false;
      ensureTutorial(t, () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), onResult: (ok) => { won = ok; recordAnswer(mod, ok, t); applyEffect(ok ? o.win : o.lose); } }, () => showEffect(won ? 'Richtig gelöst' : 'Daneben')));
    };
    if (Number.isInteger(resumeOpt)) return runOpt(resumeOpt);
    app.querySelectorAll('.bottom .btn').forEach((btn) => { btn.onclick = () => runOpt(+btn.dataset.i); });
  }
  function applyEffect(eff) {
    const lines = []; run.node && (run.node.lines = lines);
    if (eff.hp) { if (eff.hp > 0) { heal(eff.hp); lines.push(`❤️ +${eff.hp} Lebenspunkte`); } else { run.hero.hp = Math.max(1, run.hero.hp + eff.hp); lines.push(`💔 −${Math.abs(eff.hp)} Lebenspunkte`); } }
    if (eff.coins) { run.coins = Math.max(0, run.coins + eff.coins); lines.push(`🪙 ${eff.coins > 0 ? '+' : '−'}${euro(Math.abs(eff.coins))}`); }
    if (eff.maxhp) { run.hero.maxHp += eff.maxhp; heal(eff.maxhp); lines.push(`💪 +${eff.maxhp} maximale Lebenspunkte`); }
    if (eff.item) { run.items.push(eff.item); lines.push(`${ITEMS[eff.item].icon} ${ITEMS[eff.item].name} erhalten`); }
    if (eff.holz) { addMat('holz', eff.holz); lines.push(`🪵 +${eff.holz} Holz für die Werkbank`); }
    if (eff.xp) { const m = gainXp(eff.xp); lines.push(`⭐ +${eff.xp} XP`); lines.push(...m); }
    if (!lines.length) lines.push('Nichts passiert.');
    nodeDone(); saveAll(); return lines;
  }
  function showEffect(title, opt) {
    const lines = (run.node && run.node.lines) || [];
    render(`<div class="screen">${topbar('❓ Ereignis')}<div class="scroll"><div class="card center"><h2>${esc(title)}</h2>${opt && opt.then ? `<p>${esc(opt.then)}</p><p><b>Denk mal nach:</b> ${esc(opt.think)}</p>` : ''}${lines.map((l) => `<p>${l}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`);
    $('#next').onclick = advance;
  }

  /* ---------- Rest ---------- */
  function screenRest() {
    const weak = weakestModule(); const s = STATS()[weak]; const acc = s.t ? Math.round((s.c / s.t) * 100) : null; const MODULES = MODULES_OF();
    render(`<div class="screen">${topbar('🔥 Rast')}<div class="scroll"><div class="card center"><h2>Am Lagerfeuer</h2>${heroSVG(heroSpec(), run.hero.evo)}<p>❤️ ${run.hero.hp} / ${run.hero.maxHp}</p></div></div>
      <div class="bottom"><div class="stack"><button class="btn" id="heal">Ausruhen: +${Math.round(run.hero.maxHp * 0.4)} LP</button><button class="btn secondary" id="train">Training: ${MODULES[weak].icon} ${MODULES[weak].name}${acc !== null ? ` (${acc} % richtig)` : ''} – 3 Aufgaben, kein Risiko, +XP</button></div></div></div>`);
    $('#heal').onclick = () => { heal(Math.round(run.hero.maxHp * 0.4)); saveAll(); advance(); };
    $('#train').onclick = () => training(weak, 3, 0);
  }
  function training(mod, total, done) {
    if (done >= total) { const m = gainXp(15); nodeDone(); saveAll(); render(`<div class="screen">${topbar('🔥 Training')}<div class="scroll"><div class="card center"><h2>Training beendet</h2><p>⭐ +15 XP</p>${m.map((x) => `<p style="color:var(--orange);font-weight:800">${x}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`); $('#next').onclick = advance; return; }
    const tier = tierFor(mod); const t = makeTask(mod, tier);
    render(`<div class="screen">${topbar(`🔥 Training ${done + 1} / ${total}`)}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`);
    const s = STATS()[mod]; const low = s.t >= 3 && s.c / s.t < 0.6;
    const go = () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: 'Übung', onResult: (ok) => { recordAnswer(mod, ok, t); saveAll(); } }, () => training(mod, total, done + 1));
    if (low && done === 0 && meta.seenTut[tutKey(t.group)]) showTutorial(t.group, t.note, go); else ensureTutorial(t, go);
  }

  /* ---------- Treasure ---------- */
  function screenTreasure(kind) {
    const elite = kind === 'elite'; const owned = heroAttacks().map((a) => a.mod); const free = enabledMods().filter((k) => !owned.includes(k)); const MODULES = MODULES_OF(); const EXTRA_ATTACKS = CFG().extra;
    if (run.node && !Array.isArray(run.node.chest)) { const [r1, r2] = shuffle(LOOT.rare); run.node.chest = [r1, elite ? r2 : pick(LOOT.chest.filter((x) => x !== r1)), free.length ? pick(free) : null];
      // chests in world 2 and 3 hold the Flammenring and the Kugelspitze, once
      const part = elite ? null : Object.keys(TOP).flatMap((s) => TOP[s].filter((p) => p.chest === run.world).map((p) => `top-${s}-${p.id}`)).find((k) => !meta.owned[k]);
      if (part) { meta.owned[part] = true; run.node.part = part; meta.progressAt = new Date().toISOString(); }
      saveAll(); }
    const found = run.node && typeof run.node.part === 'string' && partOf(run.node.part);
    const [i1, i2, freeMod] = (run.node && run.node.chest) || [pick(LOOT.rare), pick(LOOT.chest), free.length ? pick(free) : null]; const itemOpt = (id) => ({ k: 'item', item: id, label: `${ITEMS[id].icon} ${ITEMS[id].name}`, desc: ITEMS[id].desc });
    const maxhp = { k: 'maxhp', label: '💪 +10 maximale LP', desc: 'Dein Monster wird zäher.' };
    const atkOpt = freeMod && free.includes(freeMod) ? { k: 'atk', mod: freeMod, label: `${MODULES[freeMod].icon} Neue Attacke: ${EXTRA_ATTACKS[freeMod]}`, desc: `${MODULES[freeMod].name} – ersetzt eine deiner Attacken.` } : null;
    const opts = elite ? [itemOpt(i1), itemOpt(i2), atkOpt || maxhp] : [itemOpt(i1), maxhp, atkOpt || itemOpt(i2)];
    render(`<div class="screen">${topbar(elite ? '💀 Beute' : '🎁 Schatz')}<div class="scroll"><p class="center">${elite ? `${run.node && run.node.type === 'weekboss' ? 'Der Wochenboss' : 'Der Elitegegner'} hat etwas dagelassen. Wähle eine Belohnung:` : 'Du findest eine Truhe. Wähle eine Belohnung:'}</p><div class="stack">${found ? `<div class="card center">${MONART.topSVG(TYPES[heroSpec().type].color, Object.assign({}, meta.top, { [found.slot]: found.id }))}<p>In der Truhe liegt noch etwas für deinen Kreisel: <b>${found.name}</b>. Einbauen kannst du es im Stempelheft.</p></div>` : ''}${opts.map((o, i) => `<button class="choice" data-i="${i}"><div class="meta"><div class="name">${o.label}</div><div class="desc">${o.desc}</div></div></button>`).join('')}</div></div></div>`);
    app.querySelectorAll('.choice').forEach((b) => { b.onclick = () => { const o = opts[+b.dataset.i]; if (o.k === 'item') run.items.push(o.item); if (o.k === 'maxhp') { run.hero.maxHp += 10; heal(10); } if (o.k === 'atk') { chooseSlot(o.mod); return; } saveAll(); advance(); }; });
  }
  function chooseSlot(mod) {
    const MODULES = MODULES_OF(); const EXTRA_ATTACKS = CFG().extra;
    render(`<div class="screen">${topbar('🎁 Neue Attacke')}<div class="scroll"><p class="center">Welche Attacke soll ${EXTRA_ATTACKS[mod]} ersetzen?</p><div class="stack">${heroAttacks().map((a, i) => `<button class="choice" data-i="${i}"><div class="meta"><div class="name">${esc(a.name)}</div><div class="desc">${MODULES[a.mod].icon} ${MODULES[a.mod].name} · Platz ${i + 1}</div></div></button>`).join('')}<button class="btn ghost" id="skip">Doch lieber behalten – dafür gibt es einen 🧪 Trank</button></div></div></div>`);
    app.querySelectorAll('.choice').forEach((b) => { b.onclick = () => { run.hero.attacks[+b.dataset.i] = { name: EXTRA_ATTACKS[mod], mod }; saveAll(); advance(); }; });
    $('#skip').onclick = () => { run.items.push('trank'); saveAll(); advance(); };
  }

  /* ---------- Bergwerk ---------- */
  // 12 covered blocks, three per visit. Each block is a division with remainder: no remainder means ore, otherwise stone,
  // a wrong answer crumbles the block. The haul goes to meta.materials; the first ore ever unlocks the iron disc for the spinning top.
  const MINE_PICKS = 3, MINE_LABEL = { erz: 'Erz', stein: 'Stein', leer: 'leer' };
  const blockSVG = (k) => `<svg viewBox="0 0 40 40" aria-hidden="true">${k === 'leer' ? '<rect x="3" y="3" width="34" height="34" rx="6" fill="none" stroke="#7A6A5A" stroke-width="2" stroke-dasharray="4 3"/><path d="M10 32 l4 -4 l4 4 Z M22 33 l5 -6 l5 6 Z" fill="#9AA0A8"/>'
    : `<rect x="3" y="3" width="34" height="34" rx="6" fill="${k ? '#9AA0A8' : '#7A5A3A'}" stroke="#1C2541" stroke-width="2"/>${!k ? '<path d="M9 12 L16 18 L14 27 M27 7 L24 16 L32 22 M20 30 L26 34" fill="none" stroke="#4A3422" stroke-width="2"/>'
    : k === 'erz' ? '<circle cx="13" cy="14" r="4" fill="#C8582A"/><circle cx="26" cy="22" r="5" fill="#C8582A"/><circle cx="15" cy="28" r="3" fill="#E8A15A"/><circle cx="28" cy="11" r="2.5" fill="#E8A15A"/>'
    : '<path d="M9 14 L15 12 M22 27 L30 25 M12 28 L16 30" stroke="#6E747C" stroke-width="2.5" stroke-linecap="round"/>'}`}</svg>`;
  function mineRecord(ok, t) {
    if (mode === 'math') return recordAnswer('rest', ok, t);
    const s = meta.stats.math.rest; s.t++; if (ok) s.c++; // other units count it as practice in Zahlenquest, without changing its levels
  }
  function screenMine() {
    const n = run.node; if (!isObj(n.mine) || !Array.isArray(n.mine.cells) || !Array.isArray(n.mine.got)) { n.mine = { cells: Array(12).fill(''), got: [] }; saveAll(); }
    const mn = n.mine; if (isObj(mn.task) && isObj(mn.task.t)) return mineTask(mn);
    const left = MINE_PICKS - mn.got.length; const haul = (k) => mn.got.filter((x) => x === k).length;
    render(`<div class="screen">${topbar('⛏️ Bergwerk')}<div class="scroll"><div class="card"><p style="margin-top:0">Schlag ${MINE_PICKS} Blöcke auf. In jedem steckt eine Aufgabe zum Teilen mit Rest. Geht sie ohne Rest auf, findest du Erz, sonst Stein.</p>
      <div class="mine">${mn.cells.map((k, i) => `<button class="mblock ${k ? 'open' : 'covered'}" data-i="${i}" ${k || !left ? 'disabled' : ''} aria-label="${k ? MINE_LABEL[k] : 'Block ' + (i + 1)}">${blockSVG(k)}${k ? `<small>${MINE_LABEL[k]}</small>` : ''}</button>`).join('')}</div>
      <p class="center">${left ? `Noch ${left} ${left === 1 ? 'Block' : 'Blöcke'}.` : `Ausbeute: ${haul('erz')} Erz, ${haul('stein')} Stein.`}</p>${!left && mn.disc ? '<p class="center"><b>Aus deinem ersten Erz wird eine Eisenscheibe für den Kreisel.</b></p>' : ''}
      <p class="center muted" style="color:var(--ink-soft)">Im Lager: ${meta.materials.erz || 0} Erz, ${meta.materials.stein || 0} Stein</p></div></div>
      <div class="bottom">${left ? '<p class="center muted" style="margin:6px 0">Tippe auf einen Block.</p>' : '<button class="btn" id="next">Weiter</button>'}</div></div>`);
    app.querySelectorAll('.mblock.covered:not([disabled])').forEach((b) => { b.onclick = () => {
      const zero = Math.random() < 0.4; const t = MQ.generate('rest', mode === 'math' ? tierFor('rest') : Math.min(2, run.world), { zero });
      t.kind = 'num'; t.group = 'rest:' + t.tier; mn.task = { i: +b.dataset.i, t }; saveAll(); mineTask(mn); }; });
    if (!left) $('#next').onclick = () => { nodeDone(); saveAll(); advance(); };
  }
  function mineTask(mn) {
    const { i, t } = mn.task;
    render(`<div class="screen">${topbar(`⛏️ Block ${mn.got.length + 1} / ${MINE_PICKS}`)}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`);
    ensureTutorial(t, () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: 'Bergwerk', onResult: (ok) => {
      const k = !ok ? 'leer' : t.answers[1] === 0 ? 'erz' : 'stein';
      mn.cells[i] = k; mn.got.push(k); delete mn.task; mineRecord(ok, t);
      if (k !== 'leer') addMat(k, 1);
      if (k === 'erz' && !meta.owned['top-disc-eisen']) { meta.owned['top-disc-eisen'] = true; mn.disc = true; }
      saveAll();
    } }, screenMine));
  }

  /* ---------- Markt ---------- */
  const STALL = `<svg class="stall" viewBox="0 0 220 120" aria-hidden="true"><path d="M30 34v80M190 34v80" stroke="#7A4A22" stroke-width="7"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${14 + i * 32} 12h32v22a16 10 0 0 1-32 0z" fill="${i % 2 ? '#fff' : '#E8483B'}" stroke="#1C2541" stroke-width="3"/>`).join('')}<path d="M88 112q2-30 22-34 20 4 22 34z" fill="#3D8C55" stroke="#1C2541" stroke-width="3"/><circle cx="110" cy="62" r="15" fill="#F2C9A0" stroke="#1C2541" stroke-width="3"/><path d="M95 60q2-18 15-18t15 18q-6-9-15-9t-15 9z" fill="#7A4A22"/><rect x="18" y="84" width="184" height="30" rx="5" fill="#C98B4E" stroke="#1C2541" stroke-width="3"/></svg>`;
  const coinBtn = (v, attr) => `<button class="coin ${v >= 500 ? 'note n' + v : v >= 100 ? 'euro' : v >= 10 ? 'brass' : 'copper'}" ${attr} aria-label="${euro(v)}">${euro(v)}</button>`;
  function screenMarket(msg) {
    const n = run.node || {}; const tier = run.world >= 2 ? 2 : 1; const P = MQ.PRICES;
    if (!Array.isArray(n.offers) || n.offers.length !== 3 || !n.offers.every((id) => P[id])) { n.offers = shuffle(Object.keys(P)).slice(0, 3); n.sold = []; saveAll(); }
    if (!Array.isArray(n.sold)) n.sold = [];
    run.tiers.geld = tier;
    const kinds = MQ.COINS.concat(run.world >= 3 ? [1000, 500] : []).sort((a, b) => b - a);
    let sel = null; const counter = []; const sum = () => counter.reduce((a, b) => a + b, 0);
    const hello = tier === 1 ? 'Was darf es sein? Bei mir bezahlst du passend.' : 'Was darf es sein? Du darfst auch mehr geben, das Rückgeld rechnest du dann selbst aus.';
    render(`<div class="screen market" data-tier="${tier}">${topbar('🧺 Markt')}<div class="scroll"><div class="stack">
      <div class="card seller">${STALL}<div class="row"><p class="say" id="say" role="status">${esc(msg || hello)}</p><button class="tut" type="button" id="mtut" aria-label="Erklärung anzeigen">🛈</button></div></div>
      ${n.offers.map((id, i) => { const sold = n.sold.includes(i); return `<button class="choice offer ${sold ? 'sold' : ''}" data-i="${i}" data-price="${P[id]}" ${sold ? 'disabled' : ''}><span class="ic" aria-hidden="true">${ITEMS[id].icon}</span><div class="meta"><div class="name">${ITEMS[id].name}</div><div class="desc">${esc(ITEMS[id].desc)}</div></div><span class="price">${sold ? 'verkauft' : euro(P[id])}</span></button>`; }).join('')}
      <div class="card purse"><div class="row"><span>👛 Geldbeutel</span><b id="purse" data-cents="${run.coins}">${euro(run.coins)}</b></div><div class="lbl">Ladentisch</div><div class="counter" id="counter"></div><div class="coins">${kinds.map((v) => coinBtn(v, `data-v="${v}"`)).join('')}</div></div>
      </div></div><div class="bottom"><div class="row"><button class="btn secondary" id="leave">Weitergehen</button><button class="btn" id="pay" disabled>Bezahlen</button></div></div></div>`);
    const show = (el) => { if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }); };
    const say = (t) => { $('#say').textContent = t; show($('.seller')); };
    const paint = () => {
      $('#counter').innerHTML = counter.length ? counter.map((v, j) => coinBtn(v, `data-j="${j}"`)).join('') : `<span class="muted">${sel === null ? 'Tippe zuerst auf eine Ware.' : 'Tippe auf Münzen, um sie hinzulegen.'}</span>`;
      app.querySelectorAll('.coins .coin').forEach((b) => { b.disabled = sel === null || sum() + +b.dataset.v > run.coins; });
      app.querySelectorAll('.offer').forEach((b) => b.classList.toggle('selected', +b.dataset.i === sel));
      $('#pay').disabled = sel === null || !counter.length;
      $('#counter').querySelectorAll('.coin').forEach((b) => { b.onclick = () => { counter.splice(+b.dataset.j, 1); paint(); }; });
    };
    paint();
    app.querySelectorAll('.offer').forEach((b) => { b.onclick = () => { const i = +b.dataset.i; const it = ITEMS[n.offers[i]]; counter.length = 0;
      if (P[n.offers[i]] > run.coins) { sel = null; say(`${it.name} kostet ${euro(P[n.offers[i]])}. Dafür reicht dein Geld noch nicht.`); } else { sel = i; say(`${it.name} kostet ${euro(P[n.offers[i]])}.`); }
      paint(); if (sel !== null) show($('.purse')); }; });
    app.querySelectorAll('.coins .coin').forEach((b) => { b.onclick = () => { counter.push(+b.dataset.v); paint(); }; });
    $('#mtut').onclick = () => showTutorial('geld:' + tier);
    $('#leave').onclick = () => { nodeDone(); saveAll(); advance(); };
    const buy = (bonus) => { const id = n.offers[sel]; run.coins -= P[id]; run.items.push(id); n.sold.push(sel); if (bonus) run.items.push('beere'); saveAll();
      return `Bitte schön, ${ITEMS[id].name} ist jetzt in deinem Beutel.${bonus ? ' Weil du passend bezahlt hast, bekommst du eine Beere dazu.' : ''}`; };
    $('#pay').onclick = () => {
      const id = n.offers[sel], price = P[id], paid = sum(), name = ITEMS[id].name;
      if (paid === price) { recordAnswer('geld', true); return screenMarket(buy(tier === 1)); }
      if (tier === 1 || paid < price) { recordAnswer('geld', false); saveAll(); counter.length = 0; paint(); return say(`Das sind ${euro(paid)}. ${name} kostet ${euro(price)}. Hier hast du dein Geld zurück.`); }
      const c = paid - price; let ok = false;
      const t = { kind: 'num', mod: 'geld', tier: 2, group: 'geld:2', text: `${euro(paid)} − ${euro(price)}`, ask: `Du gibst ${euro(paid)}. ${name} kostet ${euro(price)}. Wie viel Rückgeld bekommst du?`, answers: [Math.floor(c / 100), c % 100], labels: ['€', 'ct'], money: true };
      let done = '';
      render(`<div class="screen">${topbar('🧺 Rückgeld')}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`);
      ensureTutorial(t, () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: 'Markt', onResult: (r) => { ok = r; recordAnswer('geld', r, t); if (r) done = buy(false); else saveAll(); } },
        () => screenMarket(ok ? done : 'Das Rückgeld stimmt nicht. Hier hast du dein Geld zurück. Du kannst neu bezahlen oder weitergehen.')));
    };
    if (!msg && !meta.seenTut[tutKey('geld:1')]) showTutorial('geld:1', null, null, true);
  }

  /* ---------- Zeichenschule ---------- */
  function screenSchool(step) {
    const P = plantOf(CFG().school); const n = P.steps.length;
    if (step > n) { render(`<div class="screen">${topbar('✏️ Zeichenschule')}<div class="scroll"><div class="card center"><h2>Merk-Check</h2><p>Jetzt verschwinden die Namen. Weißt du noch, wie alle Teile heißen?</p>${P.svg({})}</div></div><div class="bottom"><button class="btn" id="go">Los!</button></div></div>`); $('#go').onclick = () => schoolCheck(MK.shuffle(P.parts.map((p) => p.id)), 0); return; }
    render(`<div class="screen">${topbar(`✏️ Zeichenschule ${step} / ${n}`)}<div class="scroll"><div class="card"><h3>Schritt ${step}</h3><p>${esc(P.steps[step - 1])}</p>${P.svg({ step, labels: true })}<p class="muted" style="color:var(--ink-soft)">Zeichne mit auf Papier. Die Namen stehen dabei.</p></div></div><div class="bottom"><div class="row">${step > 1 ? `<button class="btn secondary" id="prev">Zurück</button>` : ''}<button class="btn" id="next">${step < n ? 'Nächster Schritt' : 'Zum Merk-Check'}</button></div></div></div>`);
    $('#next').onclick = () => screenSchool(step + 1); if ($('#prev')) $('#prev').onclick = () => screenSchool(step - 1);
  }
  function schoolCheck(ids, i) {
    if (i >= ids.length) { const m = gainXp(20); nodeDone(); saveAll(); render(`<div class="screen">${topbar('✏️ Zeichenschule')}<div class="scroll"><div class="card center"><h2>Merk-Check bestanden</h2><p>⭐ +20 XP</p>${m.map((x) => `<p style="color:var(--orange);font-weight:800">${x}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`); $('#next').onclick = advance; return; }
    const P = plantOf(CFG().school); const part = P.parts.find((p) => p.id === ids[i]); const others = MK.shuffle(P.parts.filter((p) => p.id !== part.id)).slice(0, 3).map((p) => p.name);
    const t = { kind: 'parts', mod: 'parts', tier: 1, group: 'parts:1', note: P.note, q: 'Wie heißt der leuchtende Teil?', part: part.id, options: MK.shuffle(others.concat([part.name])), answer: part.name, qid: P.qid + part.id, plant: P === POTATO ? undefined : CFG().school };
    render(`<div class="screen">${topbar(`✏️ Merk-Check ${i + 1} / ${ids.length}`)}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`);
    ensureTutorial(t, () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: 'Merk-Check', onResult: (ok) => { recordAnswer('parts', ok, t); saveAll(); } }, () => schoolCheck(ids, i + 1)));
  }

  /* ---------- Forscherlabor: guess first, then the result; a wrong guess costs nothing ---------- */
  function screenLabor() {
    const n = run.node; if (!isObj(n.lab) || !Array.isArray(n.lab.list)) { n.lab = { list: MS.laborSet(), i: 0, right: 0, guess: null }; saveAll(); }
    const L = n.lab; if (L.i >= L.list.length) return laborEnd();
    const ex = L.list[L.i]; const guessed = Number.isInteger(L.guess); const ok = L.guess === ex.a;
    const result = guessed ? `<p class="labres"><b>${ok ? 'Deine Vermutung stimmt.' : `Du hast „${esc(ex.opts[L.guess])}“ vermutet.`}</b> Ergebnis: ${esc(ex.opts[ex.a])}.</p><div class="notecard"><div class="eyebrow">Notiz</div>${esc(ex.note)}</div>` : '<p>Was vermutest du? Tippe auf deine Vermutung.</p>';
    render(`<div class="screen">${topbar('🔬 Forscherlabor')}<div class="scroll"><div class="card labor"><div class="eyebrow">Versuch ${L.i + 1} von ${L.list.length}</div><h3>${esc(ex.q)}</h3>${(guessed && ex.after) || ex.pic || ''}${result}</div></div>
      <div class="bottom">${guessed ? '<button class="btn" id="next">Weiter</button>' : `<div class="options ${ex.opts.length === 2 ? 'two' : ''}">${ex.opts.map((o, i) => `<button class="opt guess" data-i="${i}">${esc(o)}</button>`).join('')}</div>`}</div></div>`);
    if (guessed) { $('#next').onclick = () => { L.i++; L.guess = null; saveAll(); screenLabor(); }; return; }
    app.querySelectorAll('.opt.guess').forEach((b) => { b.onclick = () => { L.guess = +b.dataset.i; if (L.guess === ex.a) { L.right++; SFX.right(); } saveAll(); screenLabor(); }; });
  }
  // same reward level as an event
  function laborEnd() {
    const L = run.node.lab; const m = gainXp(20); nodeDone(); saveAll();
    render(`<div class="screen">${topbar('🔬 Forscherlabor')}<div class="scroll"><div class="card"><h2>Deine Notizkarte</h2><p>${L.right} von ${L.list.length} Vermutungen ${L.right === 1 ? 'hat' : 'haben'} gestimmt.</p><div class="notecard">${L.list.map((x) => `<div>• ${esc(x.note)}</div>`).join('')}</div><p>⭐ +20 XP</p>${m.map((x) => `<p style="color:var(--orange);font-weight:800">${x}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`);
    $('#next').onclick = advance;
  }

  /* ---------- Schatzkarte: instead of a treasure; found = chest, two misses = a berry ---------- */
  function screenKarte() {
    const n = run.node; if (!enabledMods().includes('karte') || n.found) return screenTreasure();
    if (!isObj(n.hunt)) n.hunt = { tries: 0, task: null };
    if (!isObj(n.hunt.task)) { n.hunt.task = makeTask('karte', tierFor('karte')); saveAll(); }
    const t = n.hunt.task;
    render(`<div class="screen">${topbar('🗺️ Schatzkarte')}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`);
    ensureTutorial(t, () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: `Versuch ${n.hunt.tries + 1} von 2`, onResult: (ok) => {
      recordAnswer('karte', ok, t);
      if (ok) n.found = true; else { n.hunt.tries++; n.hunt.task = null; if (n.hunt.tries >= 2) { run.items.push('beere'); nodeDone(); } }
      saveAll();
    } }, (ok) => {
      if (ok || !n.done) return screenKarte();
      render(`<div class="screen">${topbar('🗺️ Schatzkarte')}<div class="scroll"><div class="card center"><h2>Der Schatz bleibt versteckt</h2><p>Unter einem Busch findest du ${ITEMS.beere.icon} eine Beere.</p></div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`);
      $('#next').onclick = advance;
    }));
  }

  /* ---------- End screens ---------- */
  function screenGameOver(b) {
    const world = run.world; const name = heroName(); const multi = CFG().worlds > 1;
    endRun(); run = null; setTimeout(SFX.lose, 200);
    render(`<div class="screen">${topbar('Besiegt')}<div class="scroll"><div class="card center"><h2>${esc(b.enemy.name)} war diesmal stärker.</h2><p>${esc(name)} muss sich ausruhen.${multi ? ` Du bist bis Welt ${world} gekommen.` : ''}</p>${stampLine(b.stamps)}<p>Alles, was du geübt hast, bleibt gespeichert. Das nächste Abenteuer beginnt bei Welt 1 mit einem ausgeruhten Monster.</p></div></div><div class="bottom"><div class="stack"><button class="btn" id="again">Neues Abenteuer</button><button class="btn ghost" id="home">Zum Titel</button></div></div></div>`);
    $('#again').onclick = screenStarter; $('#home').onclick = screenTitle;
  }
  function screenVictory() {
    meta.wins++; giveStamps(10); weeklyStep('win'); meta.progressAt = new Date().toISOString(); if (mode === 'kartoffel') meta.owned['beet-4'] = true;
    const roof = CFG().worlds >= 3 && !meta.owned['hut-dachfenster']; if (roof) meta.owned['hut-dachfenster'] = true; const name = heroName(); const spec = heroSpec(); const evo = run.hero.evo; const bs = CFG().enemies[CFG().worlds].boss; const bossName = bs.acc || bs.name;
    endRun(); run = null; setTimeout(SFX.finale, 300);
    render(`<div class="screen">${topbar('Sieg!')}<div class="confetti" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 6) * 0.35}s;--c:${['#FFC93C', '#4FC96A', '#3FA0FF', '#FF6A3D', '#FF6E8E'][i % 5]}"></i>`).join('')}</div><div class="scroll"><div class="card center"><h1 style="font-size:36px">${esc(bs.name)} ist besiegt!</h1>${heroSVG(spec, evo)}<p><b>${esc(name)}</b> ${CFG().worlds > 1 ? `hat ${CFG().worlds === 2 ? 'beide Welten' : 'alle drei Welten'} durchquert.` : 'ist am Ziel.'}</p>${stampLine(10)}${roof ? '<p>Für deine Hütte gibt es jetzt ein Dachfenster.</p>' : ''}<p>Gewonnene Abenteuer: ${meta.wins}</p></div></div><div class="bottom"><div class="stack"><button class="btn" id="again">Noch ein Abenteuer</button><button class="btn ghost" id="home">Zum Titel</button></div></div></div>`);
    $('#again').onclick = screenStarter; $('#home').onclick = screenTitle;
  }
  function screenDex() {
    const all = []; for (const m of MODE_KEYS) { const EN = MODES[m].enemies; for (const w of Object.keys(EN)) { for (const e of EN[w].normal) all.push(e); all.push({ ...EN[w].elite, elite: true }); all.push(EN[w].boss); } }
    render(`<div class="screen">${topbar('Monsterbuch')}<div class="scroll"><div class="stack">${all.map((e) => { const seen = meta.dex[e.name]; return `<div class="choice" style="cursor:default">${seen ? monsterSVG(e.shape, TYPES[e.type].color, 0, '', { elite: e.elite, boss: e.boss }) : `<div class="mon" style="width:96px;height:96px;display:flex;align-items:center;justify-content:center;font-size:48px">❔</div>`}<div class="meta"><div class="name">${seen ? esc(e.name) : '???'}</div>${seen ? typeChip(e.type) : ''}<div class="desc">${seen ? `Welt ${seen.world}${e.boss ? ' · Boss' : e.elite ? ' · Elite' : ''}` : 'Noch nicht gesehen'}</div></div></div>`; }).join('')}</div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    $('#back').onclick = screenTitle;
  }
  function screenStamps(jump) {
    const now = MQ.isoWeek(new Date()); const weeks = MQ.schoolWeeks(new Date()); const y = +weeks[0].slice(0, 4);
    const cells = weeks.map((k) => { const v = meta.stampCard[k]; return `<span class="wk${v === 2 ? ' gold' : v ? ' done' : ''}${k === now ? ' now' : ''}" role="img" aria-label="Woche ${+k.slice(6)}${v === 2 ? ', Wochenaufgabe geschafft' : v ? ', gespielt' : ''}${k === now ? ', diese Woche' : ''}">${v === 2 ? '★' : v ? '✓' : ''}</span>`; }).join('');
    const row = (r) => { const prev = r.icon ? `<div class="rwprev" aria-hidden="true">${r.icon}</div>` : r.bg ? `<div class="rwprev" style="background:${r.bg}" aria-hidden="true">⚔️</div>` : monsterSVG(MQ.STARTERS.find((s) => s.id === r.hero).shape, TYPES.normal.color, 0);
      return `<div class="choice reward">${prev}<div class="meta"><div class="name">${esc(r.name)}</div><div class="desc">${esc(r.desc)}</div>${owns(r) ? '<div class="rwhave">✔ Schon geholt</div>' : r.price ? `<button class="btn small" data-buy="${r.id}" ${canBuy(r) ? '' : 'disabled'}>Holen · ${r.price} 🏷️${r.stein ? ` + ${r.stein} Stein` : ''}</button>` : ''}</div></div>`; };
    render(`<div class="screen">${topbar('Stempelheft')}<div class="scroll"><div class="stack">
      <div class="card center"><div class="stampbal">🏷️ ${meta.stamps}</div><p>Je 10 richtige Aufgaben in einem Abenteuer: 1 Stempel. Neues Monster im Monsterbuch: 2. Boss besiegt: 5. Abenteuer gewonnen: 10. Wochenaufgabe: 10.</p></div>
      <div class="card"><h3>Stempelkarte ${y}/${String(y + 1).slice(2)}</h3><p class="pnote">Ein Feld für jede Schulwoche. ✓ heißt: In dieser Woche hast du gespielt. ★ heißt: Wochenaufgabe geschafft.</p><div class="wkgrid">${cells}</div></div>
      <h2 id="rewards">Belohnungen</h2>
      <div class="choice reward">${monsterSVG('fox', TYPES.feuer.color, 0, '', { outfit: 'strohhut' })}<div class="meta"><div class="name">Kleiderkammer</div><div class="desc">Hut, Schal, Brille und mehr für deine Helden.</div><button class="btn small" id="kk">Öffnen</button></div></div>
      <div class="choice reward">${MONART.topSVG(TYPES.wasser.color, meta.top)}<div class="meta"><div class="name">Kreisel bauen</div><div class="desc">Spitze, Ring und Scheibe für die Kreisel-Arena.</div><button class="btn small" id="kb">Öffnen</button></div></div>
      ${REWARDS.map(row).join('')}
      ${benchHtml()}
      </div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    $('#back').onclick = screenTitle;
    $('#kk').onclick = () => screenWardrobe();
    $('#kb').onclick = () => screenTop();
    app.querySelectorAll('[data-craft]').forEach((b) => { b.onclick = () => screenCraft(b.dataset.craft); });
    if (jump && $('#werkbank').scrollIntoView) $('#werkbank').scrollIntoView();
    app.querySelectorAll('[data-buy]').forEach((b) => { b.onclick = () => { const r = REWARDS.find((x) => x.id === b.dataset.buy);
      const ov = modal(`<h2>${esc(r.name)} holen?</h2><p>Das kostet ${r.price} Stempel${r.stein ? ` und ${r.stein} Stein` : ''}. Danach hast du noch ${meta.stamps - r.price} Stempel.</p><div class="stack"><button class="btn" id="yes">Holen</button><button class="btn secondary" id="no">Zurück</button></div>`);
      $('#no', ov).onclick = () => ov.remove();
      $('#yes', ov).onclick = () => { if (!owns(r) && canBuy(r)) { meta.stamps -= r.price; if (r.stein) meta.materials.stein -= r.stein; if (r.get) r.get(); else meta.owned[r.id] = true; meta.progressAt = new Date().toISOString(); saveAll(); } screenStamps(); }; }; });
  }

  /* ---------- Werkbank ---------- */
  // the question is about the thing being built (a · b); the cost stays small and fixed, because a bed gives one crop a week
  const RECIPES = [
    { id: 'trank', need: { hafer: 1, holz: 1 }, q: (a, b) => `Für den Trank kochst du Haferbrei in ${a} Töpfen. In jeden Topf kommen ${b} Löffel Hafer. Wie viele Löffel Hafer brauchst du?` },
    { id: 'grosstrank', need: { hafer: 2, kartoffel: 1, holz: 1 }, q: (a, b) => `Der große Trank kocht ${a} Stunden lang. In jeder Stunde rührst du ${b}-mal um. Wie oft rührst du um?` },
    { id: 'schild', need: { holz: 2, erz: 1 }, q: (a, b) => `Der Schild hat ${a} Bretter. Jedes Brett schlägst du mit ${b} Nägeln fest. Wie viele Nägel brauchst du?` },
    { id: 'keks', need: { roggen: 1, holz: 1 }, q: (a, b) => `Der Chilibauer tauscht eine Chilischote gegen Roggen. Zum Trocknen hängen bei ihm ${a} Schnüre mit je ${b} Schoten. Wie viele Schoten hängen da?` },
    { id: 'hut-tisch', place: 'Tisch', name: 'Tisch mit Erntekorb', desc: 'Auf dem Tisch steht ein Korb mit deiner Ernte.', need: { holz: 4, kartoffel: 1 }, q: (a, b) => `Im Erntekorb liegen ${a} Reihen Kartoffeln mit je ${b} Stück. Wie viele Kartoffeln liegen im Korb?` },
    { id: 'hut-regal', place: 'Regal', name: 'Regal mit Monsterbuch', desc: 'Im Regal siehst du, wie viele Monster, Kreiselteile und Notizkarten du hast.', need: { holz: 4, stein: 1 }, q: (a, b) => `Das Regal hat ${a} Bretter. Auf jedes Brett passen ${b} Bücher. Wie viele Bücher passen ins Regal?` },
    { id: 'hut-haken', place: 'Haken', name: 'Wandhaken für den Kreisel', desc: 'Ein Haken aus Eisen. Daran hängt dein Kreisel, sobald du Kreiselteile hast.', need: { erz: 1, holz: 1 }, q: (a, b) => `Den Haken legst du ${a}-mal ins Feuer. Nach jedem Mal schlägst du ${b}-mal mit dem Hammer darauf. Wie oft schlägst du insgesamt?` },
    { id: 'hut-bett', place: 'Bett', name: 'Bett', desc: 'Ein Holzbett mit einer Matratze aus Roggenstroh.', need: { holz: 5, roggen: 2 }, q: (a, b) => `Für die Matratze stopfst du ${a} Säcke mit je ${b} Armen voll Roggenstroh. Wie viele Arme voll Stroh sind das?` },
    { id: 'hut-fenster', place: 'Fenster', name: 'Fenster', desc: 'Ein Fenster mit einer Fensterbank aus Stein.', need: { holz: 2, stein: 2 }, q: (a, b) => `Das Fenster hat ${a} Reihen mit je ${b} kleinen Scheiben. Wie viele Scheiben hat das Fenster?` },
  ];
  const MATS = ['holz', 'stein', 'erz'].concat(Object.keys(MK.CROPS));
  const matName = (k) => (MK.CROPS[k] ? MK.CROPS[k].name : { holz: 'Holz', stein: 'Stein', erz: 'Erz' }[k]);
  const andList = (a) => (a.length > 1 ? a.slice(0, -1).join(', ') + ' und ' + a[a.length - 1] : a[0] || '');
  const isFurn = (r) => r.id.startsWith('hut-');
  const rName = (r) => r.name || ITEMS[r.id].name;
  const missing = (r) => Object.entries(r.need).filter(([k, n]) => (meta.materials[k] || 0) < n).map(([k, n]) => `${n - (meta.materials[k] || 0)} ${matName(k)}`);
  const craftable = (r) => !missing(r).length && (isFurn(r) ? !meta.owned[r.id] : meta.pantry.length < PANTRY_MAX);
  function craft(r) {
    if (!craftable(r)) return false;
    for (const [k, n] of Object.entries(r.need)) meta.materials[k] -= n;
    if (isFurn(r)) meta.owned[r.id] = true; else meta.pantry.push(r.id);
    meta.progressAt = new Date().toISOString(); return true;
  }
  function benchHtml() {
    const stock = MATS.filter((k) => meta.materials[k]).map((k) => `${meta.materials[k]} ${matName(k)}`);
    const row = (r) => { const miss = missing(r); const prev = isFurn(r) ? furnPreview(r.id) : `<div class="rwprev" aria-hidden="true">${ITEMS[r.id].icon}</div>`;
      const state = isFurn(r) && meta.owned[r.id] ? '<div class="rwhave">✔ Steht in deiner Hütte</div>'
        : `<button class="btn small" data-craft="${r.id}" ${craftable(r) ? '' : 'disabled'}>Bauen</button>${miss.length ? `<div class="desc">Es fehlt: ${miss.join(', ')}</div>` : !isFurn(r) && !craftable(r) ? '<div class="desc">Der Vorrat ist voll.</div>' : ''}`;
      return `<div class="choice reward">${prev}<div class="meta"><div class="name">${esc(rName(r))}</div><div class="desc">${esc(isFurn(r) ? r.desc : ITEMS[r.id].desc)}</div><div class="desc">Braucht ${andList(Object.entries(r.need).map(([k, n]) => `${n} ${matName(k)}`))}</div>${state}</div></div>`; };
    return `<h2 id="werkbank">Werkbank</h2>
      <div class="card"><p>Im Lager: ${stock.length ? andList(stock) : 'noch nichts'}.</p><p>Im Vorrat: ${meta.pantry.length} von ${PANTRY_MAX}${meta.pantry.length ? ` (${meta.pantry.map((it) => `${ITEMS[it].icon} ${ITEMS[it].name}`).join(', ')})` : ''}. Der Vorrat kommt ins nächste Abenteuer mit.</p>
      <p class="pnote">Holz gibt es auf dem Holzplatz in Zahlenquest und für jeden Sieg in der Kartoffel-Werkstatt. Erz und Stein findest du im Bergwerk, Ernte im Schulgarten. Vor dem Bauen löst du eine Aufgabe.</p></div>
      <h3>Für dein nächstes Abenteuer</h3>
      ${RECIPES.filter((r) => !isFurn(r)).map(row).join('')}
      <h3>Für deine Hütte</h3>${RECIPES.filter(isFurn).map(row).join('')}`;
  }
  function screenCraft(id) {
    const r = RECIPES.find((x) => x.id === id); if (!r || !craftable(r)) return screenStamps(true);
    const a = rnd(2, 6), b = rnd(3, 9); const t = { kind: 'num', mod: 'mul', tier: 1, group: 'mul:1', story: r.q(a, b), answers: [a * b] };
    render(`<div class="screen">${topbar('Werkbank')}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`);
    let made = false;
    // counts as Einmaleins practice in Zahlenquest, without changing its levels (like the Bergwerk in other units)
    runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: rName(r), onResult: (ok) => { const s = meta.stats.math.mul; s.t++; if (ok) s.c++; markWeek(); made = ok && craft(r); saveAll(); } }, () => {
      render(`<div class="screen">${topbar('Werkbank')}<div class="scroll"><div class="card center">${made ? `<h2>Gebaut: ${esc(rName(r))}</h2>${isFurn(r) ? `${furnPreview(r.id)}<p>Das steht jetzt in deiner Hütte.</p>` : `<p style="font-size:48px;margin:0" aria-hidden="true">${ITEMS[r.id].icon}</p><p>Das liegt jetzt im Vorrat und kommt ins nächste Abenteuer mit.</p>`}`
        : '<h2>Nicht gebaut</h2><p>Die Rechnung hat nicht gestimmt. Deine Zutaten bleiben im Lager. Du kannst es mit neuen Zahlen wieder versuchen.</p>'}</div></div>
        <div class="bottom"><div class="row"><button class="btn${made && isFurn(r) ? ' secondary' : ''}" id="next">Zur Werkbank</button>${made && isFurn(r) ? '<button class="btn" id="hut">Zur Hütte</button>' : ''}</div></div></div>`);
      $('#next').onclick = () => screenStamps(true); if ($('#hut')) $('#hut').onclick = screenHut;
    });
  }

  /* ---------- Meine Hütte ---------- */
  // furniture is drawn in room coordinates (viewBox 0 0 360 290); box = its place, also used to crop the preview
  const FURN = {
    'hut-fenster': { box: [32, 82, 98, 78], art: () => '<rect x="40" y="88" width="80" height="62" fill="#9FD3F5" stroke="#6B4423" stroke-width="6"/><path d="M80 88v62M40 108h80M40 129h80" stroke="#6B4423" stroke-width="4"/><rect x="34" y="148" width="92" height="9" rx="2" fill="#9AA0A8" stroke="#1C2541" stroke-width="2"/>' },
    'hut-haken': { box: [148, 82, 56, 74], art: (n) => `<rect x="166" y="88" width="20" height="10" rx="2" fill="#6E747C" stroke="#1C2541" stroke-width="2"/><path d="M176 98v16q0 9-8 9" fill="none" stroke="#4A4F57" stroke-width="5" stroke-linecap="round"/>${n.tops ? MONART.topSVG(TYPES.feuer.color, meta.top).replace('<svg ', '<svg x="152" y="104" width="48" height="48" ') : ''}` },
    'hut-regal': { box: [234, 68, 112, 168], art: (n) => `<rect x="240" y="74" width="98" height="158" fill="#A9764A" stroke="#1C2541" stroke-width="3"/>${[114, 156, 198].map((y) => `<rect x="240" y="${y}" width="98" height="7" fill="#7A4E2D"/>`).join('')}
      <rect x="252" y="84" width="20" height="30" rx="2" fill="#E8483B" stroke="#1C2541" stroke-width="2"/><rect x="274" y="88" width="10" height="26" fill="#3FA0FF" stroke="#1C2541" stroke-width="2"/><text x="318" y="108" text-anchor="middle" font-size="22" font-weight="700" fill="#FFF7E6">${n.dex}</text>
      <path d="M252 134h24l-12 17z" fill="#FFC93C" stroke="#1C2541" stroke-width="2" stroke-linejoin="round"/><rect x="261" y="127" width="6" height="7" fill="#1C2541"/><text x="318" y="150" text-anchor="middle" font-size="22" font-weight="700" fill="#FFF7E6">${n.tops}</text>
      <rect x="250" y="170" width="30" height="22" rx="2" fill="#FFF7E6" stroke="#1C2541" stroke-width="2"/><path d="M255 177h20M255 184h14" stroke="#8A8FA3" stroke-width="2"/><text x="318" y="192" text-anchor="middle" font-size="22" font-weight="700" fill="#FFF7E6">${n.notes}</text>` },
    'hut-bett': { box: [10, 190, 128, 86], art: () => '<rect x="16" y="196" width="16" height="74" rx="3" fill="#7A4E2D" stroke="#1C2541" stroke-width="3"/><rect x="28" y="224" width="104" height="18" rx="4" fill="#F4ECD8" stroke="#1C2541" stroke-width="2"/><ellipse cx="48" cy="223" rx="15" ry="8" fill="#fff" stroke="#1C2541" stroke-width="2"/><rect x="64" y="218" width="68" height="26" rx="5" fill="#3FA0FF" stroke="#1C2541" stroke-width="3"/><rect x="16" y="240" width="118" height="20" rx="3" fill="#A9764A" stroke="#1C2541" stroke-width="3"/><path d="M24 260v12M126 260v12" stroke="#1C2541" stroke-width="5"/>' },
    'hut-tisch': { box: [144, 160, 92, 118], art: () => '<path d="M166 186h52l-6 28h-40z" fill="#C8964E" stroke="#1C2541" stroke-width="3" stroke-linejoin="round"/><ellipse cx="180" cy="186" rx="9" ry="6" fill="#D9B26A" stroke="#8A6A30" stroke-width="2"/><ellipse cx="197" cy="184" rx="9" ry="6" fill="#D9B26A" stroke="#8A6A30" stroke-width="2"/><path d="M210 186l4-16" stroke="#A67C1A" stroke-width="3"/><ellipse cx="214" cy="168" rx="3.5" ry="7" fill="#E3B341" stroke="#A67C1A" stroke-width="1.5"/><rect x="150" y="214" width="84" height="11" rx="3" fill="#A9764A" stroke="#1C2541" stroke-width="3"/><path d="M160 225v48M224 225v48" stroke="#7A4E2D" stroke-width="8"/>' },
  };
  const ROOF = '<circle cx="180" cy="28" r="14" fill="#9FD3F5" stroke="#6B4423" stroke-width="5"/><path d="M166 28h28M180 14v28" stroke="#6B4423" stroke-width="3"/>';
  const shelfNums = () => ({ dex: Object.keys(meta.dex).length, tops: Object.keys(meta.owned).filter((k) => k.startsWith('top-')).length, notes: Object.keys(meta.know).length });
  const furnPreview = (id) => { const [x, y, w, h] = FURN[id].box; return `<svg class="rwprev furn" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true">${FURN[id].art(shelfNums())}</svg>`; };
  // room 1 shows a dashed place for every piece not built yet; hut.items are the pieces moved to room 2
  function hutSVG(room) {
    const n = shelfNums(); const here = Object.keys(FURN).filter((id) => meta.owned[id] && (room === 2) === (meta.hut.rooms >= 2 && meta.hut.items.includes(id)));
    const gaps = room === 1 ? Object.keys(FURN).filter((id) => !meta.owned[id]) : [];
    const label = here.length ? 'Im Zimmer: ' + here.map((id) => RECIPES.find((r) => r.id === id).name).join(', ') : 'Das Zimmer ist leer';
    return `<svg class="hutroom" viewBox="0 0 360 290" role="img" aria-label="${esc(label)}"><polygon points="0,48 180,4 360,48" fill="#6B4423"/><rect y="48" width="360" height="182" fill="#E9D3A8"/>${[60, 120, 180, 240, 300].map((x) => `<path d="M${x} 48v182" stroke="#D4B985" stroke-width="2"/>`).join('')}<rect y="230" width="360" height="60" fill="#A9764A"/><path d="M0 230h360" stroke="#7A4E2D" stroke-width="4"/>
      ${room === 1 && meta.owned['hut-dachfenster'] ? ROOF : ''}${gaps.map((id) => { const [x, y, w, h] = FURN[id].box; return `<rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="10" fill="none" stroke="#8A6A30" stroke-width="2.5" stroke-dasharray="7 6"/><text x="${x + w / 2}" y="${y + 30}" text-anchor="middle" font-size="15" font-weight="700" fill="#7A5A2A">${RECIPES.find((r) => r.id === id).place}</text>`; }).join('')}${here.map((id) => FURN[id].art(n)).join('')}</svg>`;
  }
  function screenHut() {
    const two = meta.hut.rooms >= 2; const n = shelfNums(); const built = Object.keys(FURN).filter((id) => meta.owned[id]);
    const name = (id) => RECIPES.find((r) => r.id === id).name;
    render(`<div class="screen">${topbar('Meine Hütte')}<div class="scroll"><div class="stack">
      ${two ? '<h3>Erstes Zimmer</h3>' : ''}${hutSVG(1)}${two ? `<h3>Zweites Zimmer</h3>${hutSVG(2)}` : ''}
      <div class="card">${built.length ? '' : '<p>Noch ist deine Hütte leer. Möbel baust du an der Werkbank im Stempelheft.</p>'}${meta.owned['hut-regal'] ? `<p>Im Regal: ${n.dex} im Monsterbuch, ${n.tops} Kreiselteile, ${n.notes} Notizkarten.</p>` : ''}
      ${built.length && built.length < 5 ? '<p class="pnote">Die gestrichelten Plätze warten noch auf Möbel von der Werkbank.</p>' : ''}${two ? '' : '<p class="pnote">Ein zweites Zimmer gibt es im Stempelheft für 30 Stempel und 12 Stein.</p>'}${meta.owned['hut-dachfenster'] ? '' : '<p class="pnote">Wer Zahlenquest durch alle drei Welten gewinnt, bekommt ein Dachfenster.</p>'}</div>
      <div class="row"><button class="btn ghost" id="bench">Zur Werkbank</button><button class="btn ghost" id="garden">Schulgarten</button></div>
      ${two && built.length ? `<div class="card"><h3>Umräumen</h3><div class="stack">${built.map((id) => `<button class="btn small secondary" data-move="${id}">${esc(name(id))} ins ${meta.hut.items.includes(id) ? 'erste' : 'zweite'} Zimmer</button>`).join('')}</div></div>` : ''}
      </div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    $('#back').onclick = screenTitle; $('#bench').onclick = () => screenStamps(true); $('#garden').onclick = screenGarden;
    app.querySelectorAll('[data-move]').forEach((b) => { b.onclick = () => { const id = b.dataset.move; const h = meta.hut; h.items = h.items.includes(id) ? h.items.filter((x) => x !== id) : h.items.concat(id); saveAll(); screenHut(); }; });
  }
  function screenWardrobe(heroId) {
    const heroes = MODE_KEYS.flatMap((m) => MODES[m].starters).filter((s, i, all) => !heroLocked(s) && all.findIndex((x) => x.id === s.id) === i);
    const hero = heroes.find((s) => s.id === heroId) || heroes.find((s) => s.id === meta.lastStarter[mode]) || heroes[0];
    const worn = wornBy(hero.id);
    const tile = (o) => { const has = hasOutfit(o);
      const act = o.id === worn ? `<button class="btn small secondary" data-off="${o.id}">Ablegen</button>` : has ? `<button class="btn small" data-wear="${o.id}">Anziehen</button>`
        : o.price ? `<button class="btn small" data-buy="${o.id}" ${meta.stamps < o.price ? 'disabled' : ''}>Holen · ${o.price} 🏷️</button>` : `<div class="desc">${esc(o.need())}</div>`;
      return `<div class="kkitem${o.id === worn ? ' on' : ''}${has ? '' : ' locked'}">${monsterSVG(hero.shape, TYPES[hero.type].color, 0, '', { outfit: o.id })}<div class="name">${o.name}</div>${act}</div>`; };
    render(`<div class="screen">${topbar('Kleiderkammer')}<div class="scroll"><div class="stack">
      <div class="card center kkcard">${heroSVG(hero, 0)}<div class="name">${esc(hero.names[0])}</div><p>🏷️ ${meta.stamps} Stempel</p><p class="pnote">Kleidung ändert nichts am Kampf. Jeder Held trägt ein Teil.</p></div>
      ${heroes.length > 1 ? `<div class="kkpick" role="group" aria-label="Held wählen">${heroes.map((s) => `<button class="kkhero${s === hero ? ' on' : ''}" data-hero="${s.id}" aria-pressed="${s === hero}" aria-label="${esc(s.names[0])}">${heroSVG(s, 0)}</button>`).join('')}</div>` : ''}
      <div class="kkgrid">${OUTFITS.map(tile).join('')}</div>
      </div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    const wear = (id) => { if (id) meta.worn[hero.id] = id; else delete meta.worn[hero.id]; saveAll(); screenWardrobe(hero.id); };
    $('#back').onclick = () => screenStamps();
    app.querySelectorAll('[data-hero]').forEach((b) => { b.onclick = () => screenWardrobe(b.dataset.hero); });
    app.querySelectorAll('[data-wear]').forEach((b) => { b.onclick = () => wear(b.dataset.wear); });
    app.querySelectorAll('[data-off]').forEach((b) => { b.onclick = () => wear(null); });
    app.querySelectorAll('[data-buy]').forEach((b) => { b.onclick = () => { const o = OUTFITS.find((x) => x.id === b.dataset.buy);
      const ov = modal(`<h2>${o.name} holen?</h2><p>Das kostet ${o.price} Stempel. Danach hast du noch ${meta.stamps - o.price}.</p><div class="stack"><button class="btn" id="yes">Holen und anziehen</button><button class="btn secondary" id="no">Zurück</button></div>`);
      $('#no', ov).onclick = () => ov.remove();
      $('#yes', ov).onclick = () => { if (!hasOutfit(o) && meta.stamps >= o.price) { meta.stamps -= o.price; meta.owned['outfit-' + o.id] = true; meta.progressAt = new Date().toISOString(); meta.worn[hero.id] = o.id; } saveAll(); screenWardrobe(hero.id); }; }; });
  }
  const partOf = (key) => { const [, slot, id] = key.split('-'); const p = TOP[slot] && TOP[slot].find((x) => x.id === id); return p ? Object.assign({ slot }, p) : null; };
  const TOP_ROWS = [['tip', 'Spitze', 'Wucht', 'So viel Schwung verliert der andere Kreisel bei jeder richtigen Antwort.'], ['ring', 'Ring', 'Panzer', `Bei einer falschen Antwort verliert dein Kreisel ${TOP_KNOCK} Schwung minus Panzer.`], ['disc', 'Scheibe', 'Schwung', 'Mit so viel Schwung startet dein Kreisel in die Arena.']];
  function screenTop() {
    const s = CFG().starters.find((x) => x.id === meta.lastStarter[mode]) || CFG().starters[0]; const color = TYPES[s.type].color;
    const need = (p) => (p.chest ? `Liegt in einer Truhe in Welt ${p.chest}${p.chest > 2 ? ' von Zahlenquest' : ''}.` : 'Finde Erz im Bergwerk in Zahlenquest oder auf der Baustelle.');
    const tile = (slot, label, p) => { const on = meta.top[slot] === p.id, has = hasPart(slot, p.id);
      const act = on ? '<div class="rwhave">✔ Eingebaut</div>' : has ? `<button class="btn small" data-fit="${slot}:${p.id}">Einbauen</button>`
        : p.price ? `<button class="btn small" data-buy="${slot}:${p.id}" ${meta.stamps < p.price ? 'disabled' : ''}>Holen · ${p.price} 🏷️</button>` : `<div class="desc">${need(p)}</div>`;
      return `<div class="kkitem${on ? ' on' : ''}${has ? '' : ' locked'}">${MONART.topSVG(color, Object.assign({}, meta.top, { [slot]: p.id }))}<div class="name">${p.name}</div><div class="partval">${label} ${p.val}</div>${act}</div>`; };
    render(`<div class="screen">${topbar('Kreisel bauen')}<div class="scroll"><div class="stack">
      <div class="card center kkcard">${MONART.topSVG(color, meta.top, 'live')}<p class="topvals"><span>💥 Wucht ${topVal('tip')}</span><span>🛡️ Panzer ${topVal('ring')}</span><span>🌀 Schwung ${topVal('disc')}</span></p><p>🏷️ ${meta.stamps} Stempel</p><p class="pnote">Mit diesem Kreisel trittst du in der Kreisel-Arena an. Er hat den Typ deines Helden.</p></div>
      ${TOP_ROWS.map(([slot, title, label, text]) => `<div><h3>${title}: ${label}</h3><p class="toptext">${text}</p><div class="kkgrid topgrid">${TOP[slot].map((p) => tile(slot, label, p)).join('')}</div></div>`).join('')}
      </div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    const again = () => { const y = $('.scroll').scrollTop; screenTop(); $('.scroll').scrollTop = y; };
    $('#back').onclick = screenStamps;
    app.querySelectorAll('[data-fit]').forEach((b) => { b.onclick = () => { const [slot, id] = b.dataset.fit.split(':'); meta.top[slot] = id; saveAll(); again(); }; });
    app.querySelectorAll('[data-buy]').forEach((b) => { b.onclick = () => { const [slot, id] = b.dataset.buy.split(':'); const p = TOP[slot].find((x) => x.id === id);
      const ov = modal(`<h2>${p.name} holen?</h2><p>Das kostet ${p.price} Stempel. Danach hast du noch ${meta.stamps - p.price}.</p><div class="stack"><button class="btn" id="yes">Holen und einbauen</button><button class="btn secondary" id="no">Zurück</button></div>`);
      $('#no', ov).onclick = () => ov.remove();
      $('#yes', ov).onclick = () => { if (!hasPart(slot, id) && meta.stamps >= p.price) { meta.stamps -= p.price; meta.owned[`top-${slot}-${id}`] = true; meta.progressAt = new Date().toISOString(); meta.top[slot] = id; saveAll(); } ov.remove(); again(); }; }; });
  }
  /* ---------- Duell ---------- */
  // Two children on one device. Nothing is saved: no run, no stamps, and no statistics, because
  // the device statistics belong to one child and a duel would mix in the other child's answers.
  const DUEL_HP = 60, DUEL_HIT = 12;
  const duelSpec = (p) => MODES[p.mode].starters.find((s) => s.id === p.hero);
  // each child plays at the level of the running adventure in that unit, otherwise level 1
  const duelTiers = (m) => { const r = loadRun(m); return Object.fromEntries(Object.entries(MODES[m].modules).map(([k, M]) => [k, Math.max(1, Math.min(M.maxTier, (r && r.tiers[k]) || 1))])); };
  const duelAttacks = (p) => { const on = enabledMods(p.mode); const a = duelSpec(p).attacks.filter((x) => on.includes(x.mod)); return a.length ? a : on.slice(0, 4).map((k) => ({ name: MODES[p.mode].extra[k], mod: k })); };
  function screenDuel(players) {
    const i = players.length; const p = { name: '', mode: null, hero: null };
    const units = curGrade().subjects.flatMap((s) => s.modes);
    const heroes = () => (p.mode ? MODES[p.mode].starters.filter((s) => !heroLocked(s)) : []);
    render(`<div class="screen">${topbar(`Duell · Kind ${i + 1} von 2`)}<div class="scroll"><div class="stack">
      ${i ? `<p class="center">${esc(players[0].name)} ist bereit. Jetzt wählt das zweite Kind.</p>` : '<p class="center">Zwei Kinder, ein Gerät. Ihr löst abwechselnd Aufgaben. Jede richtige Antwort trifft den Helden des anderen Kindes.</p>'}
      <div class="card"><h3><label for="dname">Dein Name</label></h3><input id="dname" class="nameinput" maxlength="12" autocomplete="off" placeholder="Kind ${i + 1}"><p class="pnote">Der Name wird nicht gespeichert.</p></div>
      <div class="card"><h3>Einheit</h3><div class="toggles" role="group" aria-label="Einheit">${units.map((m) => `<button class="toggle" data-unit="${m}" aria-pressed="false">${MODES[m].icon} ${esc(MODES[m].title)}</button>`).join('')}</div></div>
      <div id="dheroes"></div>
      </div></div><div class="bottom"><div class="row"><button class="btn secondary" id="back">Zurück</button><button class="btn" id="go" disabled>${i ? 'Duell starten' : 'Weiter'}</button></div></div></div>`);
    const paint = () => {
      app.querySelectorAll('[data-unit]').forEach((b) => { const on = b.dataset.unit === p.mode; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      $('#dheroes').innerHTML = p.mode ? `<h3>Dein Held</h3><div class="stack">${heroes().map((s) => `<button class="choice ${p.hero === s.id ? 'selected' : ''}" data-hero="${s.id}" aria-pressed="${p.hero === s.id}">${heroSVG(s, 0)}<div class="meta"><div class="name">${s.names[0]}</div><div class="desc">Attacken: ${[...new Set(s.attacks.map((a) => MODES[p.mode].modules[a.mod].name))].join(', ')}</div></div></button>`).join('')}</div>` : '';
      app.querySelectorAll('[data-hero]').forEach((b) => { b.onclick = () => { p.hero = b.dataset.hero; paint(); }; });
      $('#go').disabled = !p.hero;
    };
    app.querySelectorAll('[data-unit]').forEach((b) => { b.onclick = () => { p.mode = b.dataset.unit; const h = heroes(); p.hero = h.length === 1 ? h[0].id : null; paint(); }; });
    $('#back').onclick = () => (i ? screenDuel([]) : screenTitle());
    $('#go').onclick = () => {
      if (!p.hero) return;
      p.name = $('#dname').value.trim().slice(0, 12) || `Kind ${i + 1}`;
      if (i === 0) screenDuel([p]); else startDuel([players[0], p], 0);
    };
  }
  function startDuel(players, first) {
    run = null; duel = { p: players.map((p) => Object.assign(p, { hp: DUEL_HP, tiers: duelTiers(p.mode) })), turn: first };
    duelTurn(`${esc(duel.p[first].name)} fängt an.`, '');
  }
  // child 1 stands at the bottom like the hero in a fight, child 2 at the top
  function renderDuel(log, cls) {
    const plate = (p, side) => { const pct = (p.hp / DUEL_HP) * 100; return `<div class="plate ${side}"><div class="name">${esc(p.name)}${duel.p[duel.turn] === p ? ' <span class="levelbadge">am Zug</span>' : ''}</div><div class="plateline"><span class="chip" style="background:${TYPES[duelSpec(p).type].color};color:#1C2541">${MODES[p.mode].icon} ${esc(duelSpec(p).names[0])}</span></div><div class="hpbar"><i class="${pct < 30 ? 'low' : pct < 60 ? 'mid' : ''}" style="width:${pct}%"></i></div><div class="hptext">❤️ ${p.hp} / ${DUEL_HP}</div></div>`; };
    const sprite = (p, side, id) => `<div class="sprite ${side}" id="${id}">${heroSVG(duelSpec(p), 0, side === 'enemy' ? 'enemy' : undefined)}<i class="ground"></i></div>`;
    const [a, b] = duel.p;
    render(`<div class="screen">${topbar('⚔️ Duell')}<div class="arena">${plate(b, 'enemy')}${sprite(b, 'enemy', 'fe')}${sprite(a, 'hero', 'fh')}${plate(a, 'hero')}</div><div class="log ${cls}">${log}</div><div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`, true);
    announce(log.replace(/<[^>]+>/g, ''));
  }
  function duelTurn(log, cls) {
    const p = duel.p[duel.turn]; mode = p.mode; const atks = duelAttacks(p); const M = MODULES_OF();
    renderDuel(log, cls);
    $('#bottom').innerHTML = `<div class="attacks">${atks.map((a, i) => `<button class="atk" data-i="${i}" aria-label="${esc(a.name)}: ${M[a.mod].name}, ${DUEL_HIT} Schaden"><span class="n">${esc(a.name)}</span><span class="m">${M[a.mod].icon} ${M[a.mod].name}<span class="dmg">💥 ${DUEL_HIT}</span></span></button>`).join('')}</div>`;
    app.querySelectorAll('.atk').forEach((btn) => { btn.onclick = () => duelAttack(atks[+btn.dataset.i]); });
  }
  function duelAttack(atk) {
    const p = duel.p[duel.turn], o = duel.p[1 - duel.turn]; const t = makeTask(atk.mod, p.tiers[atk.mod] || 1);
    $('.screen').classList.add('tasking'); $('#bottom').innerHTML = '';
    let hit = false;
    runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: `${p.name}: ${atk.name}`, onResult: (ok) => { hit = ok; if (ok) o.hp = Math.max(0, o.hp - DUEL_HIT); } }, () => {
      const log = hit ? `${esc(atk.name)} trifft: ${DUEL_HIT} Schaden für ${esc(o.name)}.` : `${esc(atk.name)} geht daneben.`;
      const show = () => { if (hit) { const sel = duel.p.indexOf(o) ? '#fe' : '#fh'; $(sel).classList.add('hurt'); fx(sel, '−' + DUEL_HIT); SFX.hit(); } };
      if (o.hp <= 0) { renderDuel(log, 'hit'); show(); setTimeout(() => screenDuelEnd(p), 1500); return; }
      duel.turn = 1 - duel.turn; duelTurn(`${log} Jetzt ist ${esc(o.name)} dran.`, hit ? 'hit' : 'miss'); show();
    });
  }
  function screenDuelEnd(w) {
    const players = duel.p; const l = players.find((x) => x !== w); duel = null; setTimeout(SFX.win, 150);
    render(`<div class="screen">${topbar('⚔️ Duell')}<div class="scroll"><div class="card center"><h2>${esc(w.name)} gewinnt das Duell.</h2>${heroSVG(duelSpec(w), 0)}<p>${esc(duelSpec(w).names[0])} hat noch ${w.hp} von ${DUEL_HP} Lebenspunkten.</p><p>Im nächsten Duell fängt ${esc(l.name)} an.</p></div></div><div class="bottom"><div class="stack"><button class="btn" id="again">Noch ein Duell</button><button class="btn ghost" id="home">Zum Titel</button></div></div></div>`);
    $('#again').onclick = () => startDuel(players, players.indexOf(l)); $('#home').onclick = screenTitle;
  }

  // this week for parents: practised task types, the weakest one, the goals; the text has no names in it
  function weekReport() {
    const w = weekly(); const goals = weeklyGoals(); const wk = +w.week.slice(6);
    const rows = Object.entries(w.tally).map(([k, v]) => { const [m, mod] = k.split(':'); const M = MODES[m] && MODES[m].modules[mod]; return M && v.t ? { m, name: M.name, icon: M.icon, c: v.c, t: v.t } : null; }).filter(Boolean).sort((a, b) => b.t - a.t);
    // Luther and Kirchenjahr share task type names
    const label = (r) => (rows.some((x) => x.name === r.name && x.m !== r.m) ? `${r.name} (${MODES[r.m].title})` : r.name);
    const weak = rows.filter((r) => r.t >= 3).sort((a, b) => a.c / a.t - b.c / b.t)[0];
    const done = goals.filter(goalDone).length;
    const text = [`Lernquest, Woche ${wk}`, rows.length ? 'Geübt (richtig von gesamt): ' + rows.map((r) => `${label(r)} ${r.c} von ${r.t}`).join(', ') : 'Diese Woche noch nichts geübt.',
      weak ? `Schwächste Aufgabenart: ${label(weak)} (${weak.c} von ${weak.t} richtig)` : '', `Wochenziele: ${done} von ${goals.length} erledigt`].filter(Boolean).join('\n');
    const html = `<p class="pnote">Kalenderwoche ${wk}, seit Montag.</p>${rows.length ? `<table><tr><th>Art</th><th>Richtig</th></tr>${rows.map((r) => `<tr><td>${r.icon} ${esc(label(r))}</td><td>${r.c} / ${r.t}</td></tr>`).join('')}</table>` : '<p class="pnote">Diese Woche noch nichts geübt.</p>'}
      <div class="statrow"><span class="n">Schwächste Aufgabenart</span><span>${weak ? `${weak.icon} ${esc(label(weak))}` : 'noch zu wenig geübt'}</span></div>
      <h4 style="margin:10px 0 4px">Wochenziele: ${done} von ${goals.length} erledigt</h4>${goals.map((g, i) => `<div class="statrow"><span class="n">${esc(goalText(g))}</span><span>${goalCount(g, i)} / ${g.n}</span></div>`).join('')}
      <label for="wtext" class="pnote">Als Text</label><textarea id="wtext" class="codebox reporttext" rows="6" readonly>${esc(text)}</textarea><button class="btn small" id="wcopy">Als Text kopieren</button><p id="wmsg" role="status" class="pnote"></p>`;
    return { text, html };
  }
  /* ---------- Schulgarten ---------- */
  const DAY = 864e5;
  // tests set window.__mq.now; a clock set back or forward only changes what grows, nothing is lost
  const clock = () => (Number.isFinite(window.__mq && window.__mq.now) ? window.__mq.now : Date.now());
  const bedDays = (b) => Math.max(0, Math.floor((clock() - b.plantedAt) / DAY));
  const bedPhase = (b) => { const d = bedDays(b); return d >= 7 ? 3 : d >= 5 ? 2 : d >= 2 ? 1 : 0; };
  // bed 4 is the reward for winning the Kartoffel-Werkstatt (owned['beet-4'], set in screenVictory)
  const bedOpen = (i) => i < 3 || !!meta.owned['beet-4'];
  const ripeBeds = () => meta.garden.beds.filter((b, i) => b.crop && bedOpen(i) && bedPhase(b) === 3);
  function gardenCard() {
    const r = ripeBeds(); if (!r.length) return '';
    const crops = [...new Set(r.map((b) => b.crop))];
    return `<div class="card gardencard"><p>${crops.length === 1 ? MK.CROPS[crops[0]].ripe : 'Im Schulgarten ist etwas reif.'}</p><button class="btn small" id="harvest">Ernten</button></div>`;
  }
  function plantSVG(crop, ph) {
    const ripe = ph === 3; const col = ripe ? '#E3B341' : '#5DBB4F'; const dark = ripe ? '#A67C1A' : '#2F7A32';
    let p = '';
    if (!crop) p = '';
    else if (ph === 0) p = crop === 'kartoffel' ? '<ellipse cx="40" cy="69" rx="9" ry="6" fill="#D9B26A" stroke="#8A6A30" stroke-width="2"/>' : [26, 40, 54].map((x) => `<ellipse cx="${x}" cy="67" rx="3.5" ry="2.2" fill="#E8C97A" stroke="#8A6A30"/>`).join('');
    else if (ph === 1) p = '<path d="M40 61V44" stroke="#2F7A32" stroke-width="3"/><path d="M40 52q-11-1-13-11q11 0 13 11zM40 47q11-1 13-11q-11 0-13 11z" fill="#6CCB5F" stroke="#2F7A32" stroke-width="1.5"/>';
    else if (crop === 'kartoffel') {
      p = `<path d="M40 61V30M40 46l-14-8M40 40l13-9" stroke="${dark}" stroke-width="3"/>${[[26, 36], [53, 29], [40, 28], [31, 48], [50, 45]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="6" fill="${ripe ? '#C9B25A' : col}" stroke="${dark}" stroke-width="1.5"/>`).join('')}`;
      p += ripe ? [[24, 70], [40, 73], [56, 69]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="5" fill="#D9B26A" stroke="#8A6A30" stroke-width="2"/>`).join('') : [[34, 20], [46, 19]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#F4ECFF" stroke="#8C6BD1" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="1.8" fill="#F5D33F"/>`).join('');
    } else p = [24, 40, 56].map((x) => {
      const stalk = `<path d="M${x} 61V${crop === 'roggen' ? 18 : 24}" stroke="${dark}" stroke-width="2.5"/>`;
      if (crop === 'hafer') return stalk + [[-1, 30], [1, 34], [-1, 40], [1, 44]].map(([s, y]) => `<path d="M${x} ${y - 6}l${s * 4} 3" stroke="${dark}" stroke-width="1.5"/><ellipse cx="${x + s * 5}" cy="${y}" rx="2.2" ry="4" fill="${col}" stroke="${dark}"/>`).join('');
      if (crop === 'roggen') return stalk + `<path d="M${x - 2} 10L${x - 5} 1M${x} 9V0M${x + 2} 10L${x + 5} 1" stroke="${dark}" stroke-width="1.2"/><ellipse cx="${x}" cy="17" rx="3" ry="9" fill="${col}" stroke="${dark}" stroke-width="1.5"/>`;
      return stalk + `<ellipse cx="${x}" cy="20" rx="4.5" ry="9" fill="${col}" stroke="${dark}" stroke-width="1.5"/>`;
    }).join('');
    return `<svg class="plant-art" viewBox="0 0 80 80" aria-hidden="true"><rect x="2" y="60" width="76" height="18" rx="6" fill="#7A4E2D"/>${p}</svg>`;
  }
  function screenGarden() {
    const bed = (b, i) => {
      if (!bedOpen(i)) return `<div class="bed locked"><div class="bedart" aria-hidden="true">🔒</div><div class="bedname">Beet ${i + 1}</div><div class="beddesc">Gewinne die Kartoffel-Werkstatt, dann gehört dir dieses Beet.</div></div>`;
      if (!b.crop) return `<div class="bed">${plantSVG(null, 0)}<div class="bedname">Beet ${i + 1}</div><div class="beddesc">Noch leer.</div><button class="btn small" data-plant="${i}">Pflanzen</button></div>`;
      const c = MK.CROPS[b.crop]; const ph = bedPhase(b); const d = bedDays(b);
      return `<div class="bed${ph === 3 ? ' ripe' : ''}">${plantSVG(b.crop, ph)}<div class="bedname">${c.name}</div><div class="beddesc">${ph === 3 ? 'Reif' : d ? `${[c.put, 'Keimling', c.top][ph]}<br>Tag ${d} von 7` : `Heute ${c.put.toLowerCase()}`}</div>${ph === 3 ? `<button class="btn small" data-harvest="${i}">Ernten</button>` : ''}</div>`;
    };
    const got = Object.keys(MK.CROPS).filter((k) => meta.materials[k]).map((k) => `${MK.CROPS[k].name} ${meta.materials[k]}`);
    render(`<div class="screen">${topbar('Schulgarten')}<div class="scroll"><div class="stack">
      <div class="card"><p>Beete wachsen auch, wenn du nicht spielst. Nach 7 Tagen kannst du ernten. Für jede Ernte gibt es 4 Stempel.</p>${got.length ? `<p class="pnote">Schon geerntet: ${got.join(' · ')}</p>` : ''}</div>
      <div class="beds">${meta.garden.beds.map(bed).join('')}</div>
      </div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    $('#back').onclick = screenTitle;
    app.querySelectorAll('[data-plant]').forEach((el) => { el.onclick = () => plantDialog(+el.dataset.plant); });
    app.querySelectorAll('[data-harvest]').forEach((el) => { el.onclick = () => harvest(+el.dataset.harvest); });
  }
  function plantDialog(i) {
    const ov = modal(`<h2>Was pflanzt du in Beet ${i + 1}?</h2><div class="stack">${Object.entries(MK.CROPS).map(([k, c]) => `<button class="choice cropchoice" data-crop="${k}">${plantSVG(k, 3)}<div class="meta"><div class="name">${c.name}</div><div class="desc">${c.desc}</div></div></button>`).join('')}<button class="btn secondary" id="no">Zurück</button></div>`);
    $('#no', ov).onclick = () => ov.remove();
    ov.querySelectorAll('[data-crop]').forEach((el) => { el.onclick = () => { meta.garden.beds[i] = { crop: el.dataset.crop, plantedAt: clock() }; markWeek(); saveAll(); screenGarden(); }; });
  }
  function harvest(i) {
    const b = meta.garden.beds[i]; if (!b.crop || bedPhase(b) !== 3 || !bedOpen(i)) return screenGarden();
    const c = MK.CROPS[b.crop]; const t = MK.gardenQuestion(b.crop);
    const ov = modal(`<h2>${c.name} ernten</h2><p>Erst eine Frage zur Pflanze:</p><div class="question">${esc(t.q)}</div><div class="options" style="margin-top:12px">${t.options.map((o, k) => `<button class="opt" data-i="${k}">${esc(o)}</button>`).join('')}</div><div id="hfb" role="status" aria-live="polite"></div>`);
    ov.querySelectorAll('.opt').forEach((el) => { el.onclick = () => {
      const ok = t.options[+el.dataset.i] === t.answer; const first = !meta.owned['outfit-aehrenkranz'];
      // the harvest pays either way: the question is for learning, not a gate
      meta.garden.beds[i] = { crop: null, plantedAt: 0 }; meta.materials[b.crop] = (meta.materials[b.crop] || 0) + 1; giveStamps(4);
      meta.owned['outfit-aehrenkranz'] = true; meta.progressAt = new Date().toISOString(); markWeek(); saveAll();
      if (ok) SFX.right(); else SFX.wrong();
      ov.querySelectorAll('.opt').forEach((o) => { o.disabled = true; if (t.options[+o.dataset.i] === t.answer) o.classList.add('right'); else if (o === el) o.classList.add('wrong'); });
      $('#hfb', ov).innerHTML = `${ok ? '<div class="feedback good">Richtig! ✔</div>' : `<div class="feedback bad">Daneben<small>Richtig wäre: ${esc(t.answer)}</small></div>`}<p>Du hast ${c.name} geerntet.</p>${stampLine(4)}${first ? '<p>Das war deine erste Ernte. Dafür bekommst du den Ährenkranz für die Kleiderkammer.</p>' : ''}<button class="btn" id="hnext">Weiter</button>`;
      $('#hnext', ov).focus(); $('#hnext', ov).onclick = screenGarden;
    }; });
  }
  function screenParent(jump, back) {
    back = typeof back === 'function' ? back : screenTitle;
    const again = (j) => screenParent(j, back);
    const card = (h, body) => `<div class="card parent-stats"><h3>${h}</h3>${body}</div>`;
    const note = (t) => `<p class="pnote">${t}</p>`;
    const tables = MODE_KEYS.map((m) => { const r = loadRun(m); const rows = Object.keys(MODES[m].modules).map((k) => { const s = meta.stats[m][k]; const acc = s.t ? Math.round((s.c / s.t) * 100) : 0; return `<tr><td>${MODES[m].modules[k].icon} ${MODES[m].modules[k].name}</td><td>${s.c} / ${s.t}</td><td><div class="bar" aria-label="${acc} %"><i style="width:${acc}%;background:${acc < 50 ? 'var(--red)' : acc < 80 ? 'var(--gold)' : 'var(--green)'}"></i></div></td><td>${acc} %</td><td>${r ? 'Stufe ' + (r.tiers[k] || 1) : '–'}</td></tr>`; }).join(''); return card(`${MODES[m].icon} ${MODES[m].title}`, `<table><tr><th>Art</th><th>Richtig</th><th></th><th></th><th>Aktuell</th></tr>${rows}</table>`); }).join('');
    const weakFacts = Object.entries(meta.know).filter(([id, k]) => k.t >= 2 && k.c / k.t < 0.7).map(([id, k]) => { const q = Object.values(MK.MODES).flatMap((c) => c.pool).find((p) => p.id === id.replace('_find', '')); return q ? `<div class="statrow"><span class="n">${esc(q.q)}</span><span>${k.c} / ${k.t}</span></div>` : ''; }).join('');
    const toggles = MODE_KEYS.map((m) => `<h4 style="margin:10px 0 4px">${MODES[m].icon} ${MODES[m].title}</h4><div class="toggles">${Object.keys(MODES[m].modules).map((k) => { const on = !offList(m).includes(k); return `<button class="toggle ${on ? 'on' : ''}" data-m="${m}" data-k="${k}" aria-pressed="${on}">${on ? '✔' : '✖'} ${MODES[m].modules[k].icon} ${MODES[m].modules[k].name}</button>`; }).join('')}</div>`).join('');
    const report = weekReport();
    const SECTIONS = { practice: 'Üben', progress: 'Fortschritt', save: 'Spielstand', appsec: 'App' };
    const version = (document.querySelector('meta[name=app-version]') || {}).content || '?';
    render(`<div class="screen">${topbar('Elternbereich')}<nav class="jumpbar" aria-label="Abschnitte">${Object.entries(SECTIONS).map(([id, t]) => `<button data-jump="${id}">${t}</button>`).join('')}</nav><div class="scroll"><div class="stack">
      ${meta.pin ? '' : `<div class="card warncard"><p><b>Noch keine PIN.</b> Ohne PIN kann jeder hier alles ändern.</p><button class="btn small" id="pnew">PIN festlegen</button></div>`}
      <h2 class="psec" id="p-practice">Üben</h2>
      ${card('Klasse', gradeTabs())}
      ${card('Was soll geübt werden?', `${note('Ausgeschaltete Aufgabenarten kommen nicht mehr als Attacke, Ereignis oder Training vor. Mindestens zwei bleiben an. Ist „Geld“ aus, gibt es keinen Markt und keine Münzen. Gilt sofort, auch für laufende Abenteuer.')}${toggles}<p id="tmsg" role="status" class="pnote" style="color:#A42020;min-height:1em;margin:6px 0 0"></p>`)}
      <p class="muted">Die Stufe passt sich an: 5 von 6 richtig → eine Stufe höher, weniger als die Hälfte → eine Stufe tiefer. Welt 1 in Zahlenquest bleibt unter 100. Wissensfragen, die falsch waren, kommen schneller wieder.</p>
      <h2 class="psec" id="p-progress">Fortschritt</h2>
      ${card('Stempel', `<div class="statrow"><span class="n">Stempel verdient insgesamt</span><span>${meta.stampsTotal}</span></div><div class="statrow"><span class="n">Davon noch übrig</span><span>${meta.stamps}</span></div>`)}
      <div id="pruns">${card('🗺️ Abenteuer', `<div class="statrow"><span class="n">Begonnen</span><span>${meta.runs}</span></div><div class="statrow"><span class="n">Bis zum Ende geschafft</span><span>${meta.wins}</span></div>${note('Alle Fächer zusammen. „Geschafft“ heißt: Der Endgegner der letzten Welt ist besiegt. Die übrigen Abenteuer wurden verloren, abgebrochen oder laufen noch.')}`)}</div>
      <div id="p-weekrep">${card('Wochenbericht', report.html)}</div>
      ${tables}
      ${card('Wissensfragen mit Schwierigkeiten', weakFacts || note('Noch keine – oder noch nicht genug gespielt.'))}
      <h2 class="psec" id="p-save">Spielstand</h2>
      ${backupDue() ? `<div class="card warncard" id="pwarn"><p>Der Spielstand wurde ${meta.backupAt ? 'seit über 30 Tagen' : 'noch nie'} gesichert.</p></div>` : ''}
      ${card('Spielstand sichern', `${note('Der Code enthält den ganzen Spielstand. Damit lässt er sich auf einem anderen Gerät laden oder später zurückholen.')}<button class="btn small" id="pexport">Spielstand sichern</button><div id="pout"></div>`)}
      <div id="p-load">${card('Spielstand laden', `<label for="pcodein" class="pnote">Code einfügen</label><textarea id="pcodein" class="codebox" rows="4" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea><p id="pimsg" role="status" class="cmsg"></p><div class="row"><button class="btn small" id="pmerge">Zusammenlegen</button><button class="btn small secondary" id="preplace">Ersetzen</button></div>${note('Zusammenlegen behält alles auf diesem Gerät und nimmt dazu, was im Code mehr ist. Ersetzen überschreibt alles auf diesem Gerät.')}`)}</div>
      ${card('Speicher', note(meta.storage.persisted ? 'Dieser Browser hebt den Spielstand dauerhaft auf.' : 'Dieser Browser darf den Spielstand löschen, wenn der Speicher knapp wird. Safari löscht ihn nach 7 Tagen ohne Spielen. Als App auf dem Startbildschirm ist er sicherer.'))}
      <button class="btn secondary" id="rstats">Statistik zurücksetzen</button><button class="btn ghost" id="rall">Alles löschen (Abenteuer, Monsterbuch, Statistik)</button>
      <h2 class="psec" id="p-appsec">App</h2>
      ${card('Töne', `${note('Klick, Treffer, Fanfare und Applaus. Alle Klänge sind gemeinfrei (CC0).')}<button class="toggle ${meta.sound ? 'on' : ''}" id="psound" aria-pressed="${!!meta.sound}">${meta.sound ? '✔ Töne an' : '✖ Töne aus'}</button>`)}
      ${card('Eltern-PIN', meta.pin ? `${note('Die PIN schützt den Elternbereich.')}<div class="row"><button class="btn small secondary" id="pchange">PIN ändern</button><button class="btn small secondary" id="pdel">PIN entfernen</button></div>` : `${note('Noch keine PIN festgelegt.')}<button class="btn small" id="pset">PIN festlegen</button>`)}
      <button class="btn secondary" id="rtut">Alle Erklärungen wieder einmalig anzeigen</button><button class="btn secondary" id="pfeedback">Idee oder Fehler melden</button>
      <p class="center muted">Lernquest, Version ${esc(version)}</p>
      </div></div><div class="bottom"><button class="btn" id="back">Zurück zum Spiel</button></div></div>`);
    const scroller = $('.scroll');
    const go = (id) => { const el = $('#p-' + id); if (el) scroller.scrollTop = el.offsetTop - scroller.offsetTop - 8; };
    app.querySelectorAll('[data-jump]').forEach((b) => { b.onclick = () => go(b.dataset.jump); });
    if (jump) go(jump);
    if (jump === 'load') $('#pcodein').focus({ preventScroll: true });
    $('#back').onclick = () => back();
    const keepScroll = (fn) => () => { const y = scroller.scrollTop; fn(); $('.scroll').scrollTop = y; };
    $('#rtut').onclick = keepScroll(() => { meta.seenTut = {}; saveAll(); again(); });
    $('#rstats').onclick = keepScroll(() => { meta.stats = defaultMeta().stats; meta.know = {}; meta.runs = 0; meta.wins = 0; saveAll(); again(); });
    $('#rall').onclick = () => { const ov = modal(`<h2>Wirklich alles löschen?</h2><p>Alle Abenteuer, das Monsterbuch, die Statistik und die Einstellungen werden gelöscht. Das kann man nicht rückgängig machen.</p><div class="stack"><button class="btn" id="yes" style="background:var(--red)">Ja, alles löschen</button><button class="btn secondary" id="no">Abbrechen</button></div>`); $('#no', ov).onclick = () => ov.remove(); $('#yes', ov).onclick = () => { meta = defaultMeta(); run = null; for (const m of MODE_KEYS) clear(KEY_RUN_FOR(m)); saveAll(); screenTitle(); }; };
    $('#pfeedback').onclick = () => screenFeedback(() => again('appsec'));
    $('#psound').onclick = keepScroll(() => { meta.sound = !meta.sound; saveAll(); if (meta.sound) { SFX.unlock(); setTimeout(SFX.right, 150); } again(); });
    const newPin = () => setPin(() => again('appsec'), () => again('appsec'));
    for (const id of ['pnew', 'pset', 'pchange']) if ($('#' + id)) $('#' + id).onclick = newPin;
    $('#pexport').onclick = async () => {
      meta.backupAt = new Date().toISOString(); saveAll(); if ($('#pwarn')) $('#pwarn').remove();
      const full = saveData(false); const code = await packSave(full); const link = (c) => SITE + '#lade=' + c;
      let qr = QR.svg(link(code), 'QR-Code mit dem Spielstand'), short = false;
      if (!qr) { qr = QR.svg(link(await packSave(saveData(true))), 'QR-Code mit einer Kurzfassung des Spielstands'); short = !!qr; }
      $('#pout').innerHTML = `${summaryHtml(full)}<label for="pcode" class="pnote">Code</label><textarea id="pcode" class="codebox" rows="4" readonly>${esc(code)}</textarea><div class="row"><button class="btn small" id="pcopy">Kopieren</button>${navigator.share ? '<button class="btn small secondary" id="pshare">Teilen</button>' : ''}</div><p id="pcmsg" role="status" class="pnote"></p>
        ${qr ? `<div class="qrbox">${qr}</div>${note((short ? 'Der QR-Code enthält eine Kurzfassung ohne laufende Abenteuer, den ganzen Spielstand gibt es nur mit dem Code. ' : '') + 'Mit der Kamera des anderen Geräts den QR-Code öffnen, dann fragt Lernquest nach. Ist Lernquest dort als App installiert, den Code lieber in der App einfügen.')}` : note('Für einen QR-Code ist der Spielstand zu groß. Bitte den Code benutzen.')}`;
      $('#pcopy').onclick = () => { const say = (t) => { $('#pcmsg').textContent = t; }; const mark = () => { $('#pcode').focus(); $('#pcode').select(); say('Der Code ist markiert. Bitte jetzt kopieren.'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(() => say('Kopiert.'), mark); else mark(); };
      if ($('#pshare')) $('#pshare').onclick = () => navigator.share({ title: 'Lernquest-Spielstand', text: link(code) }).catch(() => { });
    };
    const readCode = async (how) => {
      let s; try { s = await unpackSave($('#pcodein').value); } catch (e) { $('#pimsg').textContent = e.message; return; }
      if (how === 'merge') return applySave(s, how);
      const ov = modal(`<h2>Alles ersetzen?</h2>${summaryHtml(s)}<p>Alles auf diesem Gerät wird durch diesen Spielstand ersetzt.</p><div class="stack"><button class="btn" id="yes">Ja, ersetzen</button><button class="btn secondary" id="no">Abbrechen</button></div>`);
      $('#no', ov).onclick = () => ov.remove(); $('#yes', ov).onclick = () => applySave(s, how);
    };
    $('#wcopy').onclick = () => { const say = (t) => { $('#wmsg').textContent = t; }; const mark = () => { $('#wtext').focus(); $('#wtext').select(); say('Der Text ist markiert. Bitte jetzt kopieren.'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(report.text).then(() => say('Kopiert.'), mark); else mark(); };
    $('#pmerge').onclick = () => readCode('merge'); $('#preplace').onclick = () => readCode('replace');
    if ($('#pdel')) $('#pdel').onclick = () => { meta.pin = ''; saveAll(); again('appsec'); };
    app.querySelectorAll('[data-grade]').forEach((b) => { b.onclick = keepScroll(() => { meta.grade = +b.dataset.grade; saveAll(); again(); }); });
    app.querySelectorAll('.toggle[data-k]').forEach((b) => { b.onclick = () => {
      const m = b.dataset.m, k = b.dataset.k; const off = offList(m).slice(); const i = off.indexOf(k);
      if (i >= 0) off.splice(i, 1); else { if (!MODES[m].modules[k].shop && fightMods(m).filter((x) => !off.includes(x)).length <= 2) { $('#tmsg').textContent = 'Mindestens zwei Aufgabenarten müssen an bleiben.'; return; } off.push(k); }
      meta.off[m] = off; saveAll(); keepScroll(again)(); }; });
  }

  /* ---------- Feedback ---------- */
  // The only external request. If sending fails, the prefilled form opens in a new tab.
  const FEEDBACK = { form: 'https://docs.google.com/forms/d/e/1FAIpQLSdJcDUJ8kqJWKyu5Y1UFrFHS0kRMuELfxjrACJxYK8k-QXDbw', entry: 'entry.1794178349' };
  function screenFeedback(back) {
    back = typeof back === 'function' ? back : screenTitle;
    render(`<div class="screen">${topbar('Idee oder Fehler melden')}<div class="scroll"><div class="card"><p style="margin-top:0">Hast du eine Idee, einen Wunsch oder einen Fehler gefunden? Schreib es hier auf!</p>
      <div class="toggles" role="group" aria-label="Was ist es?">${['💡 Idee', '🐞 Fehler', '❤️ Lob'].map((t, i) => `<button class="toggle ${i ? '' : 'on'}" data-kind="${t}" aria-pressed="${!i}">${t}</button>`).join('')}</div>
      <label for="fbtext" class="sr-only">Deine Nachricht</label><textarea id="fbtext" rows="6" maxlength="2000" placeholder="Zum Beispiel: Ich wünsche mir Aufgaben zum Einmaleins mit 7 …"></textarea>
      <p class="muted" style="color:var(--ink-soft);font-size:15px">Bitte keine Namen, Adressen oder Telefonnummern hineinschreiben.</p><p id="fbmsg" role="status" aria-live="polite" class="fbmsg"></p></div></div>
      <div class="bottom"><div class="stack"><button class="btn" id="fbsend">Absenden</button><button class="btn ghost" id="back">Zurück</button></div></div></div>`);
    let kind = '💡 Idee'; let sending = false;
    app.querySelectorAll('[data-kind]').forEach((b) => { b.onclick = () => { kind = b.dataset.kind; app.querySelectorAll('[data-kind]').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); }; });
    const text = () => $('#fbtext').value.trim();
    const body = () => `${kind}: ${text()}\n\n(Lernquest, Version ${(document.querySelector('meta[name=app-version]') || {}).content || '?'})`;
    const formLink = () => `${FEEDBACK.form}/viewform?usp=pp_url&${FEEDBACK.entry}=${encodeURIComponent(body())}`;
    $('#back').onclick = () => back();
    $('#fbsend').onclick = async () => {
      if (sending) return;
      if (!text()) { $('#fbtext').focus(); $('#fbmsg').textContent = 'Bitte zuerst etwas hineinschreiben 🙂'; return; }
      sending = true; $('#fbsend').disabled = true; $('#fbsend').textContent = 'Wird gesendet …';
      try {
        if (navigator.onLine === false) throw new Error('offline');
        // no-cors: the response can't be read, but the request arrives
        await fetch(`${FEEDBACK.form}/formResponse`, { method: 'POST', mode: 'no-cors', body: new URLSearchParams({ [FEEDBACK.entry]: body() }) });
        render(`<div class="screen">${topbar('Danke')}<div class="scroll"><div class="card center"><div style="font-size:56px" aria-hidden="true">💌</div><h2>Danke für deine Nachricht!</h2><p>Sie ist angekommen. Vielleicht steht deine Idee bald unter „Was ist neu?“.</p></div></div><div class="bottom"><button class="btn" id="back">Zurück</button></div></div>`);
        $('#back').onclick = () => back();
      } catch (e) {
        sending = false; $('#fbsend').disabled = false; $('#fbsend').textContent = 'Nochmal versuchen';
        $('#fbmsg').innerHTML = `Das hat nicht geklappt – bist du mit dem Internet verbunden? Dein Text bleibt hier stehen. <a href="${esc(formLink())}" target="_blank" rel="noopener">Oder im Formular senden ↗</a>`;
      }
    };
  }

  if (navigator.storage && navigator.storage.persist && !meta.storage.persisted) navigator.storage.persist().then((ok) => { if (ok) { meta.storage.persisted = true; saveAll(); } }).catch(() => { });
  screenTitle();
  importFromLink();
  window.__mq = { get run() { return run; }, subjectOf, get meta() { return meta; }, get mode() { return mode; }, screenMap, screenTitle, packSave, unpackSave, mergeMeta, weeklyGoals, screenWardrobe, screenTop, RECIPES, craft };
})();
