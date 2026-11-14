(() => {
  const { rnd, pick, shuffle, TYPES, BEATS, ENEMY_MOVES, ITEMS, makeMap, euro } = MQ;
  // A unit registers itself: src/knowledge.js and the files after it add theirs to MK.MODES.
  const MODES = Object.assign({
    math: { modules: MQ.MODULES, starters: MQ.STARTERS, extra: MQ.EXTRA_ATTACKS, enemies: MQ.ENEMIES, events: MQ.EVENTS, tut: null, worlds: 3, grade: 3, subject: 'Mathe', title: 'Zahlenquest', icon: '🧮', sub: 'Rechnen und Zahlen', mine: true, rank: 1 },
    bau: { modules: MQ.BAU.MODULES, starters: MQ.BAU.STARTERS, extra: MQ.BAU.EXTRA, enemies: MQ.BAU.ENEMIES, events: MQ.BAU.EVENTS, moves: MQ.BAU.MOVES, tut: MQ.BAU.TUT, worlds: 2, worldAttacks: MQ.BAU.WORLD_ATTACKS, grade: 3, subject: 'Mathe', title: 'Die Baustelle', icon: '🏗️', sub: 'Würfel, Körper, Netze, Flächen, Spiegelbilder und Vielecke', mine: true, rank: 3 },
    jahrmarkt: Object.assign({ rank: 2 }, MJ.MODE),
  }, MK.MODES);
  // the Monsterbuch and the hero lists keep this order; new units follow in the order they register
  const FIRST = ['math', 'bau', 'ethik', 'kirchenjahr', 'kartoffel', 'woerterwerkstatt', 'satzbaustelle', 'kornkammer', 'wetterstation', 'kompass', 'freunde', 'jahrmarkt', 'wiese', 'frueher', 'sinne', 'verkehr', 'musik', 'ichwelt', 'teestube', 'doppeldecker'];
  const MODE_KEYS = FIRST.concat(Object.keys(MODES).filter((m) => !FIRST.includes(m)));
  // the title screen builds itself from grade and subject of the units; `rank` orders the themes of a subject from easy to hard
  const SUBJECTS = { Mathe: '🔢', Deutsch: '📖', Ethik: '🕊️', Sachkunde: '🌱', Musik: '🎵', Englisch: '💬' };
  const CURRICULUM = [...new Set(MODE_KEYS.map((m) => MODES[m].grade))].sort((a, b) => a - b).map((grade) => ({ grade, label: 'Klasse ' + grade,
    subjects: Object.keys(SUBJECTS).map((subject) => ({ subject, icon: SUBJECTS[subject], modes: MODE_KEYS.filter((m) => MODES[m].grade === grade && MODES[m].subject === subject).sort((a, b) => (MODES[a].rank || 0) - (MODES[b].rank || 0)) })).filter((x) => x.modes.length) }));
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

  /* ---------- Icons ---------- */
  // Emojis look different on every device and some are missing on older ones. Wherever one appears as text inside
  // #app, the drawn icon from icons.js takes its place. Attributes (aria-label, data-*) keep the emoji.
  const emoId = (k) => 'i-' + [...k].map((c) => c.codePointAt(0).toString(16)).join('-');
  // not display:none, or Safari and Firefox lose the gradients inside <use>
  document.body.insertAdjacentHTML('beforeend', `<svg class="emosheet" aria-hidden="true">${Object.entries(ICONS).map(([k, m]) => `<symbol id="${emoId(k)}" viewBox="0 0 32 32">${m}</symbol>`).join('')}</svg>`);
  const EMO = new RegExp('(' + Object.keys(ICONS).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\uFE0F?', 'gu');
  function drawIcons(root) {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const hits = [];
    while (walk.nextNode()) { const n = walk.currentNode; EMO.lastIndex = 0; if (EMO.test(n.data) && !n.parentElement.closest('textarea, svg, script, style')) hits.push(n); }
    for (const n of hits) { const box = document.createElement('span'); box.innerHTML = esc(n.data).replace(EMO, (all, k) => `<svg class="emo" role="img" aria-label="${all}"><use href="#${emoId(k)}"/></svg>`); n.replaceWith(...box.childNodes); }
  }
  new MutationObserver((list) => { for (const m of list) { if (m.type === 'characterData') { if (m.target.parentElement) drawIcons(m.target.parentElement); } else m.addedNodes.forEach((n) => { if (n.nodeType === 1) drawIcons(n); else if (n.nodeType === 3 && n.parentElement) drawIcons(n.parentElement); }); } }).observe(app, { childList: true, subtree: true, characterData: true });

  /* ---------- Storage ---------- */
  const KEY_META = 'mathquest_meta_v2';
  const KEY_RUN_FOR = (m) => (m === 'math' ? 'mathquest_run_v1' : 'mathquest_run_' + m);
  const KEY_TURM = KEY_RUN_FOR('turm');
  function load(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } }
  function clear(key) { try { localStorage.removeItem(key); } catch (e) { } }

  const emptyStats = (m) => Object.fromEntries(Object.keys(MODES[m].modules).map((k) => [k, { c: 0, t: 0, hist: [] }]));
  const defaultMeta = () => ({ runs: 0, wins: 0, dex: {}, seenTut: {}, stats: Object.fromEntries(MODE_KEYS.map((m) => [m, emptyStats(m)])), know: {}, knowSeq: 0, evoUnlocked: {}, bestWorld: 0, seenNews: '', grade: 3, off: {}, lastStarter: {}, sound: true, speak: true, voiceName: '', voiceEn: '', speakRate: 1,
    setup: { done: false, skipped: false, at: '' }, pin: '', storage: { persisted: false, warnedAt: '' }, stamps: 0, stampsTotal: 0, stampCard: {}, owned: {}, worn: {}, backupAt: '', progressAt: '', garden: { beds: [0, 1, 2, 3].map(() => ({ crop: null, plantedAt: 0 })) }, materials: {}, pantry: [], hut: { rooms: 1, items: [] }, top: { tip: 'stahl', ring: 'zahn', disc: 'leicht' },
    weekly: { week: '', progress: [], done: false, beaten: [], tally: {} }, hidden: [], level: {}, started: {},
    // Turmwacht: subjects = fixed by parents per grade, { [grade]: [1–3 subjects] } (null: the child chooses); last = right/total per subject of the latest run
    turm: { on: false, runs: 0, wins: 0, best: 0, subjects: null, last: {} } });
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
    m.level = Object.fromEntries(Object.entries(m.level).filter(([, L]) => isObj(L)).map(([g, L]) => [g, Object.fromEntries(Object.entries(L).filter(([, t]) => Number.isInteger(t) && t >= 1))]));
    m.pantry = m.pantry.filter((it) => ITEMS[it]).slice(0, PANTRY_MAX);
    m.hidden = m.hidden.filter((x) => typeof x === 'string');
    if (!(m.speakRate >= 0.6 && m.speakRate <= 1.4)) m.speakRate = 1;
    m.started = Object.fromEntries(Object.entries(m.started).filter(([, n]) => Number.isInteger(n) && n > 0));
    m.hut.rooms = m.hut.rooms >= 2 ? 2 : 1; m.hut.items = m.hut.items.filter((id) => typeof id === 'string');
    const beds = isObj(m.garden) && Array.isArray(m.garden.beds) ? m.garden.beds : [];
    m.top = Object.fromEntries(Object.keys(TOP).map((s) => [s, hasPart(s, m.top[s], m) ? m.top[s] : TOP[s][0].id]));
    m.garden = { beds: defaultMeta().garden.beds.map((d, i) => { const b = beds[i]; return isObj(b) && MK.CROPS[b.crop] && Number.isFinite(b.plantedAt) ? { crop: b.crop, plantedAt: b.plantedAt } : d; }) };
    const t = m.turm, subs = t.subjects;
    m.turm = { on: t.on === true, runs: nat(t.runs), wins: nat(t.wins), best: Number.isInteger(t.best) && t.best >= 0 && t.best <= TW.WAVES.length ? t.best : 0,
      subjects: turmFixed(subs),
      last: isObj(t.last) ? Object.fromEntries(Object.entries(t.last).filter(([x, v]) => own(SUBJECTS, x) && okScore(v))) : {} };
    return m;
  }
  const nat = (n) => (Number.isInteger(n) && n >= 0 ? n : 0);
  // an early save had one list for every grade: each grade keeps the subjects it has
  function turmFixed(subs) {
    const ok = (a, names) => Array.isArray(a) && a.length && a.length <= 3 && new Set(a).size === a.length && a.every((x) => names.includes(x));
    const old = ok(subs, Object.keys(SUBJECTS)), out = {};
    for (const g of CURRICULUM.filter((x) => x.grade !== 1)) {
      const names = g.subjects.map((x) => x.subject), a = old ? subs.filter((x) => names.includes(x)) : isObj(subs) ? subs[g.grade] : null;
      if (ok(a, names)) out[g.grade] = a.slice();
    }
    return Object.keys(out).length ? out : null;
  }
  const own = (o, k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k);
  const okScore = (v) => isObj(v) && Number.isInteger(v.c) && Number.isInteger(v.t) && v.c >= 0 && v.c <= v.t;
  const PANTRY_MAX = 3;
  const okStat = (v) => isObj(v) && Number.isFinite(v.c) && Number.isFinite(v.t) && Array.isArray(v.hist);
  let meta = normMeta(load(KEY_META, null));
  (function migrate() { const old = load('mathquest_meta_v1', null); if (old && !load(KEY_META, null)) { meta.runs = old.runs || 0; meta.wins = old.wins || 0; meta.dex = old.dex || {}; meta.bestWorld = old.bestWorld || 0; for (const k in (old.stats || {})) if (meta.stats.math[k]) meta.stats.math[k] = old.stats[k]; for (const k in (old.seenTut || {})) meta.seenTut['math:' + k] = true; save(KEY_META, meta); } })();
  meta = normMeta(meta);
  let run = null;
  // hidden in the parent area: 'grade:<n>' for a class, 'extra:<name>' for an extra (EXTRAS), 'en:<topic>' for an English topic
  const grades = () => CURRICULUM.filter((g) => !meta.hidden.includes('grade:' + g.grade));
  const curGrade = () => grades().find((g) => g.grade === meta.grade) || grades()[0] || CURRICULUM[0];
  const gradeTabs = () => grades().length < 2 ? '' : `<div class="grades" role="group" aria-label="Klasse">${grades().map((g) => `<button class="gradechip ${g === curGrade() ? 'on' : ''}" data-grade="${g.grade}" aria-pressed="${g === curGrade()}">${esc(g.label)}</button>`).join('')}</div>`;
  // switched off in the parent area; at least two stay on per mode
  const offList = (m) => (isObj(meta.off) && Array.isArray(meta.off[m]) ? meta.off[m] : []);
  // hidden in the parent area: 'mode:<mode>' for a game, 'hero:<mode>:<id>' for a hero; a subject is hidden when all its games are
  const shown = (m) => !meta.hidden.includes('mode:' + m);
  const EXTRAS = { garten: ['Schulgarten', 'Beete bepflanzen und ernten.'], huette: ['Meine Hütte', 'Die Hütte einrichten, mit der Werkbank im Stempelheft.'], kreisel: ['Kreisel-Arena', 'Kreiselkämpfe auf der Karte und „Kreisel bauen“ im Stempelheft.'],
    duell: ['Duell zu zweit', 'Zwei Kinder lösen an einem Gerät abwechselnd Aufgaben.'], wochenziele: ['Wochenziele', 'Ziele für jede Woche und der Wochenboss auf der Karte.'], markt: ['Markt in Zahlenquest', 'Münzen sammeln und auf dem Markt einkaufen.'] };
  const extraOn = (k) => !meta.hidden.includes('extra:' + k);
  const enOff = () => meta.hidden.filter((x) => x.startsWith('en:')).map((x) => x.slice(3));
  const heroShown = (m, s) => !meta.hidden.includes(`hero:${m}:${s.id}`);
  const visSubjects = () => curGrade().subjects.map((sub) => Object.assign({}, sub, { modes: sub.modes.filter(shown) })).filter((sub) => sub.modes.length);
  const fightMods = (m) => Object.keys(MODES[m].modules).filter((k) => !MODES[m].modules[k].shop);
  // worldCap 0 keeps a task type out of that world (the written methods start in world 3)
  const inWorld = (m, k) => { const c = MODES[m].modules[k].worldCap; const b = run && (run.mode === m ? run : run.mode === 'turm' && run.turm.at[m]); return c[Math.min(b ? b.world : 1, c.length) - 1] > 0; };
  const enabledMods = (m) => { m = m || mode; const all = fightMods(m).filter((k) => inWorld(m, k)); const on = all.filter((k) => !offList(m).includes(k)); return on.length >= 2 ? on : all; };
  // coins and the market only exist in Zahlenquest, and only while parents leave „Geld“ on
  const marketOn = () => mode === 'math' && !offList('math').includes('geld') && extraOn('markt');
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
  // a Turm run keeps world, tiers and the repeat guard per unit: task-type keys repeat across units
  const taskBox = () => (run && run.mode === 'turm' ? run.turm.at[mode] : run);
  const worldCapFor = (mod) => { const M = MODULES_OF()[mod]; return Math.min(M.maxTier || Infinity, M.worldCap[Math.min(taskBox().world, M.worldCap.length) - 1]); };
  function tierFor(mod) { return Math.max(1, Math.min(worldCapFor(mod), taskBox().tiers[mod] || 1)); }
  // about every fourth task comes from the tier below, so the child keeps some easy wins
  const taskTier = (mod) => { const t = tierFor(mod); return t >= 2 && Math.random() < 0.25 ? t - 1 : t; };
  // the tier reached per unit and task type; a new adventure starts one tier below it
  const levelOf = (m) => (meta.level[m] = isObj(meta.level[m]) ? meta.level[m] : {});
  // under 65 % right in this adventure (from 8 answers on), a wrong answer costs less
  const struggling = () => run.answered >= 8 && run.solved / run.answered < 0.65;
  function recordAnswer(mod, ok, task) {
    const M = MODULES_OF()[mod]; const s = STATS()[mod]; s.t++; if (ok) s.c++; if (ok && run) run.right = (run.right || 0) + 1; markWeek(); s.hist.push(ok ? 1 : 0); if (s.hist.length > 40) s.hist.shift();
    if (run) { run.answered = (run.answered || 0) + 1; run.solved = (run.solved || 0) + (ok ? 1 : 0); }
    const wt = weekly().tally; const ws = wt[mode + ':' + mod] = wt[mode + ':' + mod] || { c: 0, t: 0 }; ws.t++; if (ok) { ws.c++; weeklyStep('right', mod); }
    if (task && task.qid) { meta.knowSeq++; MK.record(meta.know, task.qid, ok, meta.knowSeq); }
    const right = (n) => s.hist.slice(-n).reduce((a, b) => a + b, 0);
    if (!run) return;
    // up at 5 of the last 6 right, down at 2 of the last 3 wrong; capped at the current world, otherwise the next world would start at its hardest tier
    const cur = tierFor(mod); const next = s.hist.length >= 6 && right(6) >= 5 ? Math.min(worldCapFor(mod), cur + 1) : s.hist.length >= 3 && right(3) <= 1 ? Math.max(1, cur - 1) : cur;
    if (next !== cur) { taskBox().tiers[mod] = next; levelOf(mode)[mod] = next; s.hist = []; }
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
  // one goal per shown subject of the grade, from the week key and the enabled task types only.
  // Every branch draws the same numbers, so switching a task type off changes no other goal. A hidden game is
  // replaced from its own seed, so the other subjects keep their goals. i is the goal's slot in weekly.progress.
  function weeklyGoals() {
    const r = MQ.seeded(weekly().week);
    const goal = (r, m) => {
      const on = enabledMods(m); const kinds = ['right', 'elite', 'boss'].concat(MODES[m].worlds <= 2 ? ['win'] : []); // three worlds are too long for one week
      const kind = kinds[Math.floor(r() * kinds.length)]; const mod = seededOrder(r, Object.keys(MODES[m].modules)).find((k) => on.includes(k));
      const n = kind === 'right' ? 15 + Math.floor(r() * 11) : kind === 'elite' ? 2 + Math.floor(r() * 2) : (r(), 1);
      return { m, kind, mod, n };
    };
    return curGrade().subjects.map((sub, i) => {
      let g = goal(r, sub.modes[Math.floor(r() * sub.modes.length)]);
      if (!shown(g.m)) { const vis = sub.modes.filter(shown); if (!vis.length) return null; const r2 = MQ.seeded(weekly().week + ':' + sub.subject); g = goal(r2, vis[Math.floor(r2() * vis.length)]); }
      return Object.assign(g, { subject: sub.subject, i });
    }).filter(Boolean);
  }
  const seededOrder = (r, arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const goalText = (g) => { const t = `„${MODES[g.m].title}“`; return g.kind === 'right' ? `Löse ${g.n} Aufgaben ${MODES[g.m].modules[g.mod].icon} ${MODES[g.m].modules[g.mod].name} richtig.` : g.kind === 'win' ? `Gewinne ein Abenteuer in ${t}.` : g.kind === 'elite' ? `Besiege ${g.n} Elitegegner in ${t}.` : `Besiege den Wochenboss in ${t}.`; };
  const goalDone = (g) => (weekly().progress[g.i] || 0) >= g.n;
  let weeklyNews = false; // the card waits for the next calm screen (map or title)
  function weeklyStep(kind, mod) {
    const w = weekly(); if (w.done || !extraOn('wochenziele')) return; const goals = weeklyGoals();
    goals.forEach((g) => { if (g.m === mode && g.kind === kind && (kind !== 'right' || g.mod === mod)) w.progress[g.i] = Math.min(g.n, (w.progress[g.i] || 0) + 1); });
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
    const box = taskBox() || duel; box.recent = box.recent || {}; const rec = box.recent[mod] = box.recent[mod] || [];
    let t, sig;
    for (let i = 0; i < 12; i++) {
      if (mode === 'math') { t = MQ.generate(mod, tier, opts); t.kind = t.kind || 'num'; t.group = mod + ':' + t.tier; sig = t.grid ? JSON.stringify(t.grid) : t.text; }
      else if (mode === 'bau') { t = MQ.BAU.generate(mod, tier); sig = t.sig; }
      else if (CFG().numGen) { t = CFG().numGen(mod, tier, opts); t.kind = t.kind || 'num'; t.group = mod + ':' + t.tier; sig = t.text; }
      // generated units may give one qid to a whole kind of task, so the question and answer tell repeats apart
      else { t = MK.generate(mode, mod, tier, meta.know, meta.knowSeq, { g: opts && opts.g, world: taskBox() ? taskBox().world : 1, enOff: enOff() }); sig = [t.qid, t.text || t.q, t.answer, t.answers].join('|'); }
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
  function render(html, quiet) { keyHandler = null; backTo = null; if (window.speechSynthesis) speechSynthesis.cancel(); app.innerHTML = html; if (!quiet && app.firstElementChild) app.firstElementChild.classList.add('enter'); syncHistory(); }

  /* ---------- Back button ---------- */
  // Android's back button and the browser's back gesture step back inside the app. History holds one entry per level
  // (title 0, its screens 1, adventure and sub pages 2, an open dialog one more), so an adventure never floods it and
  // in-screen updates add nothing. Back does what the screen's „Zurück“ does: a dialog closes, the map goes to the
  // subject (the run stays saved), fights and tasks have no „Zurück“ and stay put, the title screen leaves the app.
  // History is only a convenience: a reload starts on the title as before.
  let depth = 0, backTo = null, maxD = 0, moving = 0; // moving: our own history.go is on its way
  const level = () => depth + ($('.overlay') ? 1 : 0);
  const atD = () => (history.state && Number.isInteger(history.state.lq) ? history.state.lq : 0);
  function syncHistory() {
    const d = atD(), want = level(); if (moving || want === d) return;
    // walk over entries that are still there instead of pushing: Chrome skips entries on back that were pushed without a tap
    const to = Math.min(want, Math.max(maxD, d));
    try {
      if (to !== d) { moving = setTimeout(() => { moving = 0; syncHistory(); }, 1000); history.go(to - d); }
      else for (let i = d + 1; i <= want; i++) { history.pushState({ lq: i }, ''); maxD = i; }
    } catch (e) { clearTimeout(moving); moving = 0; }
  }
  function goBack() {
    const ov = $('.overlay');
    if (ov) { const b = $('#no, #ino, #iok, #ok, #close, #tutok, #hnext', ov); return b ? b.click() : ov.remove(); }
    if (backTo) return backTo();
    const b = $('#pback') || $('#back'); if (b && !b.disabled) b.click();
  }
  try { history.replaceState({ lq: 0 }, ''); } catch (e) { /* no history */ }
  window.addEventListener('popstate', () => {
    if (moving) { clearTimeout(moving); moving = 0; return syncHistory(); }
    const d = atD(); if (d >= level()) return syncHistory();
    // a screen reached by going back takes the entry back landed on
    const was = app.firstElementChild; goBack(); if (app.firstElementChild !== was) depth = Math.min(depth, d);
    syncHistory();
  });

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
    // short Turmwacht sounds made in code (no files); quiet on purpose, parents hear them too
    const tone = (c, t, type, f0, f1, dur, vol) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03); };
    const hiss = (c, t, dur, vol, freq) => { const b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2; const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol; s.connect(f); f.connect(g); g.connect(c.destination); s.start(t); };
    const SYN = {
      pop: (c, t) => { tone(c, t, 'sine', 700, 140, 0.13, 0.22); hiss(c, t, 0.08, 0.25, 1800); },
      clink: (c, t, k = 0) => { const f = 1700 * 2 ** (k / 12); tone(c, t, 'triangle', f, f * 0.98, 0.09, 0.09); tone(c, t + 0.012, 'sine', f * 1.5, f * 1.5, 0.07, 0.05); },
      shatter: (c, t) => { hiss(c, t, 0.4, 0.35, 4200); [2600, 3300, 2100, 3900].forEach((f, i) => tone(c, t + i * 0.035, 'sine', f, f * 0.9, 0.12, 0.05)); },
      bell: (c, t) => { [[660, 0.12], [1320, 0.05], [1980, 0.03]].forEach(([f, v]) => tone(c, t, 'sine', f, f * 0.995, 1.1, v)); },
      shot: (c, t, k = 1) => { tone(c, t, 'triangle', 900 + 150 * k, 320, 0.1, 0.07); if (k > 1) tone(c, t, 'sine', 180, 90, 0.12, 0.08); },
      swish: (c, t) => hiss(c, t, 0.16, 0.18, 900),
      chime: (c, t) => [784, 988, 1175].forEach((f, i) => tone(c, t + i * 0.08, 'sine', f, f, 0.35, 0.07)),
      thud: (c, t) => { tone(c, t, 'sine', 140, 55, 0.22, 0.25); hiss(c, t, 0.12, 0.2, 400); },
    };
    for (const k of Object.keys(SYN)) api[k] = (arg) => { const c = ensure(); if (c) try { SYN[k](c, c.currentTime + 0.005, arg); } catch (e) { } };
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
  function topbar(title, extra) { return `<div class="topbar"><div class="title">${title}</div>${extra || ''}${run && run.floor ? `<div class="world">${CFG().worlds > 1 ? `Welt ${run.world} · ` : ''}Etage ${run.floor}</div>` : ''}</div>`; }
  function modal(html) {
    const ov = document.createElement('div'); ov.className = 'overlay'; ov.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
    const behind = [...app.children]; behind.forEach((el) => { el.inert = true; }); app.appendChild(ov);
    const rm = ov.remove.bind(ov); ov.remove = () => { behind.forEach((el) => { el.inert = false; }); rm(); syncHistory(); };
    syncHistory();
    return ov;
  }

  /* ---------- Tutorials ---------- */
  // maths tutorials also serve the Bergwerk's division tasks in other units
  function tutFor(group) { if (group === 'lesen:1') return Object.assign({ icon: READ_MOD.icon }, READ_TUT); const [mod, tier] = group.split(':'); const nt = CFG().numTut; if (nt) return Object.assign({ icon: MODULES_OF()[mod].icon }, nt[mod][+tier] || nt[mod][1]); const t = CFG().tut && CFG().tut[group]; if (!t) return Object.assign({ icon: MQ.MODULES[mod].icon }, MQ.TUT[mod][+tier] || MQ.TUT[mod][1]); const M = MODULES_OF()[mod]; return Object.assign({ icon: M ? M.icon : '📖' }, t); }
  function showTutorial(group, note, onClose, auto) {
    const t = tutFor(group); const n = note && CFG().notes ? CFG().notes[note] : null;
    const ov = modal(`<h2>${t.icon} ${esc(t.title)}</h2><p class="muted" style="opacity:.8">${auto ? 'Neue Aufgabenart. So geht sie:' : 'So geht es:'}</p><ol>${t.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>${n ? `<div class="ex"><div style="font-size:16px;color:var(--ink-soft)">📄 Aus deinen Notizen: ${esc(n.title)}</div>${n.lines.map((l) => `<div>• ${esc(l)}</div>`).join('')}${n.fig || ''}</div>` : ''}<button class="btn" id="tutok" style="margin-top:12px">Verstanden</button>`);
    const letter = /(^|[\s,(„])[A-Za-zÄÖÜäöü](?=[\s,.)“:]|$)/, say = (list) => (CFG().noLetters ? list.filter((x) => !letter.test(x)) : list);
    const steps = () => joined(t.title, ...say(t.steps));
    speakBtn($('h2', ov), 'afterbegin', () => joined(steps(), n && 'Aus deinen Notizen: ' + n.title, ...(n ? say(n.lines) : [])), steps);
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
      return `<div class="task"><div class="head">${M.icon} ${M.name}${opts.subtitle ? ` · ${esc(opts.subtitle)}` : ''}<button class="tut" type="button" aria-label="Erklärung anzeigen">🛈<span class="lbl"> Wie geht das?</span></button></div>${body}${hint}${inputs}<div id="fb" role="status" aria-live="polite"></div></div>`;
    }
    container.innerHTML = cardHtml();
    bottom.innerHTML = `<div class="numpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button data-k="${d}">${d}</button>`).join('')}<button class="del" data-k="del" aria-label="Löschen">⌫</button><button data-k="0">0</button><button class="ok" data-k="ok" aria-label="Antwort prüfen">✓</button>${opts.cancel ? `<button class="cancel" data-k="cancel" style="grid-column:1/-1">Abbrechen</button>` : ''}</div>`;
    const inps = []; container.querySelectorAll('.inp').forEach((el) => { inps[+el.dataset.i] = el; });
    function paint() { inps.forEach((el, i) => { el.textContent = values[i]; el.classList.toggle('active', i === active && !locked); }); const a = inps[active]; if (a && a.scrollIntoView && !locked) a.scrollIntoView({ block: 'nearest' }); }
    inps.forEach((el) => { el.onclick = () => { if (!locked) { active = +el.dataset.i; paint(); } }; });
    $('.tut', container).onclick = () => showTutorial(task.group, task.note);
    readAloud(container, opts.bottom, task);
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
      if (ok) { fb.innerHTML = `<div class="feedback good pop">Richtig! ✔</div>`; SFX.right(); sayResult(fb, true); }
      else { SFX.wrong(); const corr = task.show || (task.money ? euro(task.answers[0] * 100 + task.answers[1]) : task.answers.join(task.nb ? ' und ' : task.rest ? ' Rest ' : ', ')); fb.innerHTML = `<div class="feedback bad ${reducedMotion ? '' : 'shake'}">Daneben<small>Richtig wäre: ${corr}</small></div>`; sayResult(fb, false, 'Richtig wäre: ' + corr); }
      if (fb.scrollIntoView) fb.scrollIntoView({ block: 'nearest' });
      bottom.innerHTML = `<button class="btn" id="next">Weiter</button>`;
      $('#next').focus();
      $('#next').onclick = () => done(ok);
    }
  }

  /* ---------- Vorlesen ---------- */
  // Only a voice that lives on the device: a network voice would send the task text away.
  const TTS = window.speechSynthesis;
  if (TTS) TTS.getVoices(); // some browsers only start loading the list when first asked
  const local = (lang) => (TTS ? TTS.getVoices().filter((v) => v.localService && lang.test(v.lang)) : []);
  const voices = () => local(/^de/i);
  const enVoices = () => local(/^en/i);
  // a saved voice that is gone from the device quietly falls back to the first German one
  const chosenVoice = () => { const vs = voices(); return vs.find((v) => v.name === meta.voiceName) || vs[0] || null; };
  const enVoice = () => { const vs = enVoices(); return vs.find((v) => v.name === meta.voiceEn) || vs.find((v) => /^en[-_]GB/i.test(v.lang)) || vs.find((v) => /^en[-_]US/i.test(v.lang)) || vs[0] || null; };
  const voice = () => (meta.speak ? chosenVoice() : null);
  const spoken = (t) => t.replace(/\bLP\b/g, 'Lebenspunkte').replace(/_{2,}/g, ' Lücke ').replace(/−/g, ' minus ').replace(/·/g, ' mal ').replace(/=\s*\?/g, ' gleich wie viel').replace(/\?(?=\s*[=+−·:])/g, ' wie viel ').replace(/\p{Extended_Pictographic}\uFE0F?/gu, '');
  // the task's English words and sentences (en) become pieces of their own: [text, true]; a gap is ___ in data, ____ on screen
  const gap = (t) => t.replace(/_{2,}/g, '___');
  function pieces(text, en) {
    const list = [...new Set(en.map(gap))].sort((a, b) => b.length - a.length).map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const all = list.length ? gap(text).split(new RegExp(`(?<![\\p{L}'’-])(${list.join('|')})(?![\\p{L}'’-])`, 'u')) : [text];
    return all.map((t, i) => [t, i % 2 === 1]).filter(([t]) => /[\p{L}\p{N}]/u.test(t));
  }
  // one utterance per piece; without an English voice the German one gets lang en-GB, which some engines follow
  function speak(text, v = voice(), en = [], ve = enVoice()) {
    if (!v) return; TTS.cancel();
    for (const [t, isEn] of pieces(text, en)) {
      const u = new SpeechSynthesisUtterance(isEn ? t.replace(/_{2,}/g, ' … ') : spoken(t));
      u.voice = (isEn && ve) || v; u.lang = isEn ? (ve ? ve.lang : 'en-GB') : v.lang; u.rate = meta.speakRate; TTS.speak(u);
    }
  }
  // a 🔊 button at anchor that reads text(); units for Klasse 1 and 2 read first() on their own (no anchor: no button).
  // grade: Turmwacht passes its run's grade, the global mode there is just the unit that asked last
  function speakBtn(anchor, where, text, first = text, en = [], grade) {
    if (!voice()) return;
    if (anchor) { const b = document.createElement('button'); Object.assign(b, { type: 'button', className: 'speak', textContent: '🔊', onclick: () => speak(text(), voice(), en) }); b.setAttribute('aria-label', 'Vorlesen'); anchor.insertAdjacentElement(where, b); }
    if (first && (grade || CFG().grade) < 3) speak(first(), voice(), en);
  }
  const joined = (...t) => t.filter(Boolean).join('. ').replace(/([.?!:…“])\. /g, '$1 ');
  const plain = (html) => { const d = document.createElement('div'); d.innerHTML = html.replace(/<br>/g, '. '); d.querySelectorAll('svg').forEach((s) => s.remove()); return d.textContent; };
  let onScreen = {}; // the task on screen, for its feedback
  const sayResult = (fb, ok, why) => speakBtn(!ok && $('.feedback', fb), 'afterbegin', () => (ok ? 'Richtig' : onScreen.quiet ? 'Daneben' : 'Daneben. ' + why), undefined, onScreen.english || []);
  // how a fight ended: the headline and the line under it
  const sayCard = () => speakBtn($('.card'), 'afterbegin', () => joined(...[...app.querySelectorAll('.card h2, .card h2 + p')].slice(0, 2).map((e) => e.textContent)));
  // setup help for the parents, only for their system; iPadOS reports itself as a Mac with touch
  function voiceGuide(open) {
    const ua = navigator.userAgent;
    const [steps, hint] = /Android/.test(ua) ? [['Die Einstellungen öffnen, dann System → Sprachen und Eingabe → Sprachausgabe (oder „Text-in-Sprache“).', 'Als bevorzugtes Modul zum Beispiel „Sprachausgabe von Google“ wählen und als Sprache Deutsch.', 'Unter „Stimmdaten installieren“ Deutsch laden, für Englisch zusätzlich Englisch.', 'Die Lautstärke prüfen und Lernquest neu öffnen.'], 'Die Namen der Menüs unterscheiden sich je nach Hersteller.']
      : /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? [['Die Einstellungen öffnen, dann Bedienungshilfen → Gesprochene Inhalte → Stimmen.', 'Deutsch antippen und eine Stimme laden. Für Englisch genauso unter Englisch.', 'Den Lautlos-Schalter ausschalten und die Lautstärke prüfen.', 'Lernquest neu öffnen.'], 'Je nach Version heißen die Menüs etwas anders.']
        : [null, ''];
    return `<details class="pguide"${open ? ' open' : ''}><summary>So klappt das Vorlesen</summary>${steps ? `<ol>${steps.map((x) => `<li>${x}</li>`).join('')}</ol>` : '<p>In den Systemeinstellungen unter Sprachausgabe eine deutsche Stimme hinzufügen, für Englisch auch eine englische.</p>'}${hint ? `<p class="pnote">${hint}</p>` : ''}</details>`;
  }
  // task.say: the question as spoken, without the letter it shows; task.quiet: its options are letters and stay unread
  function readAloud(container, bottom, task) {
    onScreen = task;
    const asked = [...container.querySelectorAll('.question, .prompt, .expr, .story, .clues, .numword')].map((e) => e.textContent.trim());
    const opts = CFG().speakOptions === false || task.quiet ? [] : [...(bottom || container).querySelectorAll('.opt, .oitem')].map((e) => e.textContent.trim());
    speakBtn($('.tut', container), 'beforebegin', () => joined(...(task.say ? [task.say] : asked), ...opts), undefined, task.english || []);
  }

  /* ---------- Choice / order / parts tasks ---------- */
  function runChoiceTask(task, opts, done) {
    const container = opts.container, bottom = opts.bottom; const M = MODULES_OF()[task.mod] || READ_MOD; let locked = false;
    const head = `<div class="head">${M.icon} ${M.name}${opts.subtitle ? ` · ${esc(opts.subtitle)}` : ''}<button class="tut" type="button" aria-label="Erklärung anzeigen">🛈<span class="lbl"> Wie geht das?</span></button></div>`;
    // with two options crossing one out gives the answer away, so show the notes instead
    const strikeWrongOption = () => { if (task.options.length <= 2) { const n = task.note && CFG().notes ? CFG().notes[task.note] : null; $('#fb', container).insertAdjacentHTML('beforebegin', task.tip ? `<div class="hintline">🌉 Tipp: ${esc(task.tip)}</div>` : n ? `<div class="hintline">🌉 Tipp aus deinen Notizen „${esc(n.title)}“:<br>${n.lines.map((l) => esc(l)).join('<br>')}</div>` : '<div class="hintline">🌉 Tipp: Lies die Frage noch einmal ganz genau.</div>'); return; } const wrong = [...bottom.querySelectorAll('.opt')].filter((b) => task.options[+b.dataset.i] !== task.answer); const w = wrong[Math.floor(Math.random() * wrong.length)]; if (w) { w.disabled = true; w.classList.add('struck'); } $('#fb', container).insertAdjacentHTML('beforebegin', '<div class="hintline">🌉 Tipp: Eine falsche Antwort ist durchgestrichen.</div>'); };
    const finish = (ok, extraHtml) => {
      locked = true; const fb = $('#fb', container); if (ok) SFX.right(); else SFX.wrong();
      if (opts.onResult) opts.onResult(ok);
      const more = task.more ? `<small>Herkunft: ${esc(task.more)}</small>` : ''; // where a saying comes from, after every answer
      fb.innerHTML = ok ? `<div class="feedback good pop">Richtig! ✔${more}</div>` : `<div class="feedback bad ${reducedMotion ? '' : 'shake'}">Daneben<small>${extraHtml}</small>${more}</div>`;
      sayResult(fb, ok, plain(extraHtml));
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
      bottom.innerHTML = `<p class="center muted" style="margin:6px 0">Tippe auf ${(MS.PLANTS[task.plant] && MS.PLANTS[task.plant].tap) || 'den Teil in der Pflanze'}.</p>${opts.hint && pp ? `<p class="center hintline">🌉 Tipp: ${esc(pp.tip || `Der Teil ist ${pp.ground === 'unten' ? 'unter' : 'über'} der Erde.`)}</p>` : ''}`;
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
    readAloud(container, opts.bottom, task);
  }

  /* ---------- Potato plant drawing ---------- */
  // shared by the hut, garden, market and mine pictures: ink outline, soft gradients lit from the top left
  const INK = '#1C2541';
  const ln = (w) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const lg = (id, a, b, h) => `<linearGradient id="${id}" x1="0" y1="0" x2="${h ? 1 : 0}" y2="${h ? 0 : 1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const rg = (id, a, b) => `<radialGradient id="${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
  const r1 = (svg) => svg.replace(/(\.\d)\d+/g, '$1');
  const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${INK}" opacity=".18"/>`;
  // the glow style recolours every stroke inside a part, so inner colours and widths are set inline
  const st = (c, w) => `fill="none" style="stroke:${c};stroke-width:${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const twin = (d, c, w) => `<path d="${d}" ${st(INK, w + 3)}/><path d="${d}" ${st(c, w)}/>`;
  const ptLeaf = (x, y, rx, ry, a) => `<g transform="translate(${x} ${y}) rotate(${x < 130 ? a + 180 : a}) scale(1.15)" fill="url(#pt-lf)" ${ln(2)}><path d="M${-rx} 0Q${-rx * 0.1} ${-ry * 1.5} ${rx} 0Q${-rx * 0.1} ${ry * 1.5} ${-rx} 0Z"/><path d="M${2 - rx} 0Q0 -1 ${rx - 3} 0M${-rx * 0.3} -0.5l${rx * 0.35} ${-ry * 0.55}M${-rx * 0.3} 0.5l${rx * 0.35} ${ry * 0.55}M${rx * 0.2} -0.3l${rx * 0.3} ${-ry * 0.4}M${rx * 0.2} 0.3l${rx * 0.3} ${ry * 0.4}" ${st('#2F7A32', 1.1)}/></g>`;
  const ptFlower = (x, y, r) => `<g transform="translate(${x} ${y})" fill="url(#pt-fl)" ${ln(1.8)}>${[0, 72, 144, 216, 288].map((a) => `<ellipse cy="${-r * 0.55}" rx="${r * 0.5}" ry="${r * 0.62}" transform="rotate(${a})"/>`).join('')}<path d="M0 ${-r * 0.42}L${r * 0.16} -2L${r * 0.4} ${-r * 0.1}L${r * 0.2} ${r * 0.18}L${r * 0.25} ${r * 0.42}L0 ${r * 0.3}L${-r * 0.25} ${r * 0.42}L${-r * 0.2} ${r * 0.18}L${-r * 0.4} ${-r * 0.1}L${-r * 0.16} -2Z" fill="#F5C93F" ${ln(1.2)}/></g>`;
  const ptTuber = (x, y, rx, ry, a) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M${-rx} 1Q${-rx} ${-ry} ${-rx * 0.1} ${-ry}Q${rx * 0.9} ${-ry * 1.1} ${rx} ${-ry * 0.1}Q${rx * 1.05} ${ry} 0 ${ry}Q${-rx * 1.02} ${ry * 1.05} ${-rx} 1Z" fill="url(#pt-tk)" ${ln(2.2)}/>${[[-0.4, -0.15], [0.42, 0.15], [0, 0.55]].map(([a, b]) => `<circle cx="${rx * a}" cy="${ry * b}" r="1.3" fill="#8A6030"/>`).join('')}<ellipse cx="${-rx * 0.35}" cy="${-ry * 0.5}" rx="${rx * 0.28}" ry="${ry * 0.18}" fill="#FFF7E0" opacity=".55"/></g>`;
  const PT_DEFS = `<defs>${lg('pt-soil', '#BE9064', '#8A5F3B')}${lg('pt-lf', '#86CF63', '#3E9640')}${lg('pt-st', '#7CC35B', '#3E8E41', 1)}${rg('pt-fl', '#FFFFFF', '#B79BEE')}${rg('pt-tk', '#F6D995', '#BC8B42')}${rg('pt-mk', '#A98256', '#5E4026')}${rg('pt-be', '#C6E89A', '#5E9A2E')}
    <pattern id="pt-cr" width="40" height="34" patternUnits="userSpaceOnUse"><circle cx="6" cy="8" r="1.6" fill="#6E4A2C" opacity=".5"/><circle cx="25" cy="4" r="1.2" fill="#F2D9B0" opacity=".45"/><circle cx="33" cy="20" r="2" fill="#6E4A2C" opacity=".4"/><circle cx="14" cy="26" r="1.3" fill="#F2D9B0" opacity=".4"/><ellipse cx="22" cy="16" rx="2.6" ry="1.8" fill="#A8A29A" stroke="#6E4A2C" stroke-width=".8" opacity=".7"/></pattern></defs>`;
  // opts: highlight (part id), clickable, labels (bool), step (1-6 for drawing school)
  function potatoSVG(opts) {
    opts = opts || {}; const step = opts.step || 6; const hl = (id) => opts.highlight === id ? ' glow' : '';
    const g = (id, inner, cls) => (step >= PART_STEP[id] ? `<g data-part="${id}" class="part${hl(id)} ${cls || ''}" ${opts.clickable ? `tabindex="0" role="button" aria-label="Pflanzenteil ${Object.keys(PART_STEP).indexOf(id) + 1}"` : ''}>${inner}</g>` : '');
    const label = (id, x, y, anchor) => opts.labels && step >= PART_STEP[id] ? `<text class="plabel" x="${x}" y="${y}" text-anchor="${anchor || 'start'}">${MK.PARTS.find((p) => p.id === id).name.replace(' (Frucht)', '')}</text>` : '';
    return r1(`<svg class="plant ${opts.clickable ? 'clickable' : ''}" viewBox="0 0 260 300" aria-label="Kartoffelpflanze">${PT_DEFS}
      <path d="M0 152Q40 147 80 151T160 150T260 151V300H0Z" fill="url(#pt-soil)"/><path d="M0 152Q40 147 80 151T160 150T260 151V300H0Z" fill="url(#pt-cr)"/><path d="M0 152Q40 147 80 151T160 150T260 151" fill="none" ${ln(2.5)}/>
      <path d="M18 151l-3-7M21 151l1-8M24 151l4-6M226 151l-3-6M229 151l1-8M232 151l4-6" stroke="#4F9A45" stroke-width="2" stroke-linecap="round"/>
      ${g('wurzeln', `${twin('M130 190Q110 215 95 245M130 190Q150 220 160 250M130 195Q125 225 118 260M130 195Q140 230 150 270', '#EAD7B0', 2.4)}<path d="M104 228l-7-3M112 214l-6 2M154 228l7-2M146 212l6 1M121 245l-6 3M145 248l6 2M156 262l6-1" ${st('#EAD7B0', 1.2)}/><path class="hitarea" d="M90 190 L170 190 L170 275 L90 275 Z" fill="transparent"/>`)}
      ${g('mutterknolle', `<path d="M104 186Q103 169 127 169Q154 167 156 184Q157 202 131 202Q105 204 104 186Z" fill="url(#pt-mk)" ${ln(2.5)}/><path d="M112 180q6 4 12 1M134 192q7 2 13-3M116 194q4 2 8 0" ${st('#4A321C', 1.4)}/><circle cx="123" cy="178" r="1.6" fill="#3A2614"/><circle cx="143" cy="183" r="1.6" fill="#3A2614"/><circle cx="129" cy="191" r="1.6" fill="#3A2614"/><ellipse cx="117" cy="175" rx="6" ry="2.5" fill="#E8D2B0" opacity=".4"/>`)}
      ${g('auslaeufer', twin('M110 180Q70 185 50 210M150 180Q190 185 215 205M120 192Q95 215 80 240M140 192Q170 215 190 240', '#F4E9CC', 3))}
      ${g('tochterknollen', ptTuber(44, 218, 15, 10, -8) + ptTuber(222, 214, 15, 10, 10) + ptTuber(76, 248, 14, 9, 6) + ptTuber(196, 248, 14, 9, -6))}
      ${g('staengel', `${twin('M130 170Q128 120 130 60', 'url(#pt-st)', 5)}${twin('M130 120Q110 100 92 92M130 95Q152 80 168 72M130 140Q156 128 176 126M130 125Q104 118 84 120', 'url(#pt-st)', 3.6)}<path d="M128 160Q126.5 120 128.5 66" ${st('#B4E39A', 1.3)}/>`)}
      ${g('blaetter', `<path d="M92 92Q78 88 62 100M168 72Q184 70 196 80M176 126Q194 126 208 138M84 120Q66 120 52 134M130 66Q122 56 118 48M130 104Q138 102 146 100" ${st('#3E8E41', 2.4)}/>${[[80, 88, 16, 9, -25], [62, 100, 13, 8, -10], [178, 66, 16, 9, 20], [196, 80, 13, 8, 10], [190, 124, 16, 9, 15], [208, 138, 12, 7, 0], [70, 122, 16, 9, -15], [52, 134, 12, 7, 0], [118, 48, 12, 8, -40], [146, 100, 12, 7, 35]].map((l) => ptLeaf(...l)).join('')}`)}
      ${g('bluete', `<path d="M130 60V48M131 58Q144 52 156 52" ${st('#3E8E41', 2.6)}/>${ptFlower(130, 40, 13)}${ptFlower(156, 52, 10)}`)}
      ${g('beere', `<path d="M129 78Q112 72 100 84" ${st('#3E8E41', 2.6)}/><circle cx="98" cy="91" r="8" fill="url(#pt-be)" ${ln(2.2)}/><path d="M93 84l5 3 5-3M98 87v-4" ${st('#2F7A32', 1.6)}/><ellipse cx="95" cy="89" rx="2.4" ry="1.6" fill="#F4FBE6" opacity=".8"/>`)}
      ${label('bluete', 168, 30)}${label('beere', 6, 76)}${label('blaetter', 4, 112)}${label('staengel', 140, 146)}${label('mutterknolle', 162, 178)}${label('wurzeln', 160, 290)}${label('auslaeufer', 6, 204)}${label('tochterknollen', 6, 276)}
    </svg>`);
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
    depth = 0;
    if (!meta.setup.done && !meta.setup.skipped) return screenSetup();
    render(`<div class="screen"><div class="scroll"><button class="soundbtn" id="snd" aria-label="${meta.sound ? 'Töne ausschalten' : 'Töne einschalten'}" aria-pressed="${!!meta.sound}">${meta.sound ? '🔊' : '🔇'}</button><button class="stampbtn" id="stampsTop" aria-label="Stempelheft, ${meta.stamps} Stempel">🏷️ ${meta.stamps}</button><button class="parentbtn" id="parents">${GEAR} Eltern${backupDue() ? '<span class="dot" aria-hidden="true"></span><span class="sr-only">, bitte Spielstand sichern</span>' : ''}</button><div class="hero"><div class="logo">🎒</div><h1 id="logo">Lern­quest</h1><div class="sub">Jede Attacke ist eine Aufgabe.</div></div>
      <div class="stack" style="margin-top:16px">
        ${showWarn() ? `<div class="card warncard"><button class="warnx" id="warnx" aria-label="Hinweis schließen">✕</button><p>Safari löscht deinen Fortschritt nach 7 Tagen Pause. Installiere Lernquest auf dem Startbildschirm oder sichere den Spielstand im Elternbereich.</p><button class="btn small secondary" id="warnp">Zum Elternbereich</button></div>` : ''}
        ${extraOn('wochenziele') ? weeklyCard() : ''}
        ${gradeTabs()}${extraOn('garten') ? gardenCard() : ''}<div class="subjects">${visSubjects().map((sub, i) => { const live = sub.modes.some((m) => loadRun(m)); return `<button class="card subjtile" data-sub="${i}"><span class="subjicon" aria-hidden="true">${sub.icon}</span><span class="subjname">${esc(sub.subject)}</span><span class="desc">${live ? '▶ Abenteuer läuft' : `${sub.modes.length} ${sub.modes.length === 1 ? 'Thema' : 'Themen'}`}</span></button>`; }).join('')}</div>
        ${[`<button class="btn ghost" id="dex">Monsterbuch (${Object.keys(meta.dex).length})</button>`, '<button class="btn ghost" id="stamps">Stempelheft</button>', extraOn('huette') && '<button class="btn ghost" id="hut">Meine Hütte</button>',
          extraOn('garten') && '<button class="btn ghost" id="garden">Schulgarten</button>', extraOn('duell') && '<button class="btn ghost" id="duel">Duell zu zweit</button>', turmOn() && `<button class="btn ghost" id="turm"><span>🏰 Turmwacht</span>${loadTurm() ? `<span class="twrun">${TW_FLAG}läuft</span>` : ''}</button>`, `<button class="btn ghost" id="news">Was ist neu?${hasNews() ? '<span class="newbadge">Neu!</span>' : ''}</button>`,
          '<button class="btn ghost" id="feedback">Idee senden</button>'].filter(Boolean).map((b, i, all) => (i % 2 ? '' : `<div class="trow">${b}${all[i + 1] || ''}</div>`)).join('')}
      </div></div></div>`);
    let taps = 0; $('#logo').onclick = () => { taps++; if (taps >= 5) { taps = 0; askPin(screenParent); } };
    $('#parents').onclick = () => askPin(screenParent);
    if ($('#warnx')) { const seen = () => { meta.storage.warnedAt = new Date().toISOString(); saveAll(); }; $('#warnx').onclick = () => { seen(); screenTitle(); }; $('#warnp').onclick = () => { seen(); askPin(() => screenParent('save')); }; }
    app.querySelectorAll('[data-sub]').forEach((b) => { b.onclick = () => screenSubject(visSubjects()[+b.dataset.sub]); });
    $('#dex').onclick = screenDex;
    $('#stamps').onclick = $('#stampsTop').onclick = () => screenStamps();
    $('#news').onclick = screenNews;
    const bind = (sel, fn) => { const el = $(sel); if (el) el.onclick = fn; };
    bind('#duel', () => screenDuel([])); bind('#turm', screenTurm); bind('#hut', screenHut); bind('#garden', screenGarden); bind('#harvest', screenGarden);
    $('#feedback').onclick = () => screenFeedback(screenTitle);
    $('#snd').onclick = () => { meta.sound = !meta.sound; saveAll(); if (meta.sound) { SFX.unlock(); setTimeout(SFX.right, 150); } screenTitle(); };
    app.querySelectorAll('[data-grade]').forEach((b) => { b.onclick = () => { meta.grade = +b.dataset.grade; saveAll(); screenTitle(); }; });
    bind('#weekly', screenWeekly);
    showWeeklyNews();
  }
  const subjectOf = (m) => visSubjects().find((sub) => sub.modes.includes(m)) || curGrade().subjects.find((sub) => sub.modes.includes(m));
  const openGoals = (m) => (extraOn('wochenziele') ? weeklyGoals().filter((g) => g.m === m && !goalDone(g)) : []);
  const practised = (m) => Object.values(meta.stats[m]).some((x) => x.t > 0);
  // no locks: a ranked subject marks its easiest theme and points from a harder one to the easiest one not practised yet
  function screenSubject(sub) {
    depth = 1;
    const ranked = sub.modes.some((m) => MODES[m].rank);
    const path = (m, i) => { const e = ranked && sub.modes.slice(0, i).find((x) => !practised(x)); return (ranked && !i ? '<span class="startbadge">Hier anfangen</span>' : '') + (e ? `<p class="pathhint">Leichter geht es mit „${esc(MODES[e].title)}“ los.</p>` : ''); };
    render(`<div class="screen">${topbar(esc(sub.subject))}<div class="scroll"><div class="stack">${sub.modes.map((m, i) => { const r = loadRun(m); const c = MODES[m]; return `<div class="card modecard"><div class="row" style="align-items:center;gap:12px"><div style="font-size:40px" aria-hidden="true">${c.icon}</div><div style="flex:1"><h3>${c.title}</h3><div class="desc">${c.sub}</div></div></div>${path(m, i)}${openGoals(m).map((g) => `<p class="goalbadge">⭐ Wochenziel: ${esc(goalText(g))}</p>`).join('')}<div class="row" style="margin-top:10px">${r ? `<button class="btn small" data-cont="${m}">Weiter${c.worlds > 1 ? ` (Welt ${r.world})` : ''}</button>` : ''}<button class="btn small ${r ? 'secondary' : ''}" data-new="${m}">${r ? 'Neu' : 'Starten'}</button></div></div>`; }).join('')}</div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    app.querySelectorAll('[data-cont]').forEach((b) => { b.onclick = () => { mode = b.dataset.cont; run = loadRun(mode); if (run) resumeRun(); else screenSubject(sub); }; });
    app.querySelectorAll('[data-new]').forEach((b) => { b.onclick = () => { mode = b.dataset.new; const r = loadRun(mode); if (r) { const ov = modal(`<h2>Neues Abenteuer?</h2><p>Dein laufendes Abenteuer in „${MODES[mode].title}“ wird gelöscht.</p><div class="stack"><button class="btn" id="yes">Ja, neu starten</button><button class="btn secondary" id="no">Zurück</button></div>`); $('#yes', ov).onclick = () => { run = null; screenStarter(); /* old save is replaced only when the new adventure starts */ }; $('#no', ov).onclick = () => ov.remove(); } else screenStarter(); }; });
    $('#back').onclick = screenTitle;
  }
  const goalCount = (g) => Math.min(g.n, weekly().progress[g.i] || 0);
  function weeklyCard() {
    const goals = weeklyGoals(); const n = goals.filter(goalDone).length; const pct = Math.round((goals.reduce((a, g) => a + goalCount(g) / g.n, 0) / goals.length) * 100);
    return `<button class="card weekcard" id="weekly"><span class="eyebrow">Diese Woche</span><span class="weekline"><b>${weekly().done ? 'Wochenaufgabe geschafft' : `${n} von ${goals.length} Zielen erledigt`}</b><span>Neue Aufgaben am Montag</span></span><span class="bar" role="img" aria-label="${pct} %"><i style="width:${pct}%"></i></span>${weekly().done ? '' : '<span class="weekgo">Ziele ansehen und loslegen ›</span>'}</button>`;
  }
  function screenWeekly() {
    depth = 1;
    const goals = weeklyGoals();
    render(`<div class="screen">${topbar('Wochenaufgabe')}<div class="scroll"><div class="stack">
      <p class="center">${weekly().done ? 'Alle Ziele dieser Woche sind erledigt.' : 'Schaffst du alle Ziele, bekommst du 10 Stempel und einen Stern auf der Stempelkarte.'}</p>
      ${goals.map((g) => { const c = goalCount(g); const M = MODES[g.m]; return `<div class="card goal${c >= g.n ? ' done' : ''}"><div class="eyebrow">${esc(g.subject)}</div><div class="goalgame"><span aria-hidden="true">${M.icon}</span>${esc(M.title)}</div><p>${esc(goalText(g))}</p><div class="goalrow"><span class="bar" aria-hidden="true"><i style="width:${(c / g.n) * 100}%"></i></span><b>${c >= g.n ? '✔ ' : ''}${c} von ${g.n}</b></div>${c >= g.n ? '' : `<button class="btn goalplay" data-goal="${g.i}">▶ ${loadRun(g.m) ? 'Weitermachen' : 'Jetzt loslegen'}</button>`}</div>`; }).join('')}
      <p class="center">Nichts geht verloren, wenn du eine Woche aussetzt. Neue Aufgaben gibt es am Montag.</p>
      </div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    $('#back').onclick = screenTitle;
    app.querySelectorAll('[data-goal]').forEach((b) => { b.onclick = () => playGoal(goals.find((g) => g.i === +b.dataset.goal)); });
  }
  // straight into the game of a goal; an adventure whose hero lacks the goal's task type asks first
  function playGoal(g) {
    mode = g.m; run = loadRun(mode);
    if (!run) return screenStarter(g);
    if (g.kind !== 'right' || heroAttacks().some((a) => a.mod === g.mod)) return resumeRun();
    const M = MODES[mode].modules[g.mod];
    const ov = modal(`<h2>${M.icon} ${esc(M.name)}</h2><p>Dein Held in „${esc(MODES[mode].title)}“ hat diese Attacke nicht. In einem neuen Abenteuer bekommt er sie. Dein laufendes Abenteuer wird dann gelöscht.</p><div class="stack"><button class="btn" id="yes">Neues Abenteuer</button><button class="btn secondary" id="cont">Altes Abenteuer fortsetzen</button><button class="btn secondary" id="no">Zurück</button></div>`);
    $('#yes', ov).onclick = () => { run = null; screenStarter(g); }; $('#cont', ov).onclick = resumeRun; $('#no', ov).onclick = () => { run = null; ov.remove(); };
  }

  /* ---------- First start, PIN, parental gate ---------- */
  const setupDone = (how) => { meta.setup[how] = true; meta.setup.at = meta.setup.at || new Date().toISOString(); saveAll(); };
  function screenSetup() {
    depth = 0;
    render(`<div class="screen setup"><div class="scroll"><div class="hero"><div class="logo">🎒</div><h1>Willkommen bei Lernquest</h1></div>
      <div class="card"><div class="eyebrow">Für Eltern</div><p>Lernquest speichert alles nur auf diesem Gerät, ohne Konto. Im Elternbereich stellen Sie ein, was geübt wird, und sehen, was schon gut klappt.</p><p>Mit einer vierstelligen PIN können nur Sie dort etwas ändern.</p>
      <div class="stack" style="margin-top:14px"><button class="btn" id="setpin">PIN festlegen</button><button class="btn secondary" id="setload">Spielstand laden</button><button class="btn secondary" id="later">Später</button></div>
      <p class="hintsmall">Der Elternbereich ist jederzeit über den Knopf „Eltern“ oben rechts erreichbar.</p></div>
      <div class="card" style="margin-top:12px"><div class="eyebrow">In welche Klasse geht Ihr Kind?</div>${gradeTabs()}<p class="hintsmall">Das lässt sich jederzeit auf der Startseite ändern.</p></div></div></div>`);
    app.querySelectorAll('[data-grade]').forEach((b) => { b.onclick = () => { meta.grade = +b.dataset.grade; saveAll(); screenSetup(); }; });
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
    if (!o.relock) depth++;
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
  // relock: the parents' area locked itself; a wrong PIN goes to the title screen
  function askPin(then, relock) {
    if (!meta.pin) return then();
    screenCode({ title: 'Elternbereich', text: 'Bitte die Eltern-PIN eingeben.', lock: true, relock, back: screenTitle, forgot: () => screenGate(then), onCode: (v, fail) => {
      if (pinHash(v) === meta.pin) { pinFails = 0; return then(); }
      const locked = ++pinFails >= 3; if (locked) { pinFails = 0; pinLockUntil = Date.now() + 30000; }
      if (relock) return screenTitle();
      if (locked) askPin(then); else fail('Falsche PIN.');
    } });
  }
  // in the background the parents' area locks at once, so the app switcher doesn't show it either; the PIN leads back to the same place
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden' || !meta.pin || !$('.ptabs')) return;
    const y = $('.scroll').scrollTop, back = pAt.back;
    askPin(() => { screenParent(null, back, true); $('.scroll').scrollTop = y; }, true);
  });
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
    depth = 1;
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
    // unpractised task types are left out: loading fills them in again with empty stats
    for (const g of Object.values(m.stats)) for (const [k, st] of Object.entries(g)) { if (!st.t) delete g[k]; else if (short) st.hist = []; }
    if (short) delete m.weekly; // only this week's progress, the QR has no room for it
    else for (const g of MODE_KEYS.concat('turm')) { const r = load(KEY_RUN_FOR(g), null); if (r) runs[g] = r; }
    return { v: 1, at: new Date().toISOString(), meta: m, runs };
  }
  // LQ0: JSON, for browsers without compression; LQ1: deflated JSON from older versions; LQ2: deflated SAVECODE.shrink(data).
  // Codes stay out there for years, so every one of them must keep loading.
  async function packSave(data) {
    if (canZip(window.CompressionStream)) try { const buf = new Uint8Array(await viaStream(new TextEncoder().encode(JSON.stringify(SAVECODE.shrink(data))), new CompressionStream('deflate-raw')).arrayBuffer()); let bin = ''; for (const b of buf) bin += String.fromCharCode(b); return 'LQ2.' + b64(bin); } catch (e) { /* browsers before 2023 know only gzip and deflate */ }
    return 'LQ0.' + b64(unescape(encodeURIComponent(JSON.stringify(data))));
  }
  const unb64 = (s) => atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  // the same code for the QR code: „LQ2:“ and base 42, which the QR code packs tighter than base64
  const qrCode = (code) => (code.startsWith('LQ2.') ? 'LQ2:' + SAVECODE.to42(Uint8Array.from(unb64(code.slice(4)), (c) => c.charCodeAt(0))) : code);
  // accepts the code or the whole link; rejects with a message for parents
  async function unpackSave(text) {
    const bad = new Error('Das ist kein vollständiger Lernquest-Code. Bitte den ganzen Code kopieren und einfügen.');
    const m = /^LQ([012])([.:])([\w$*./:-]+)$/.exec(String(text).replace(/\s+/g, '').replace(/^.*[#&]lade=/, ''));
    if (!m || (m[2] === ':' && m[1] !== '2')) throw bad;
    if (m[1] !== '0' && !canZip(window.DecompressionStream)) throw new Error('Dieser Browser kann den Code nicht lesen. Bitte den Browser aktualisieren oder den Code auf einem anderen Gerät einfügen.');
    let d;
    try {
      const bin = m[2] === '.' ? unb64(m[3]) : '';
      const bytes = m[2] === ':' ? SAVECODE.from42(m[3]) : Uint8Array.from(bin, (c) => c.charCodeAt(0));
      d = JSON.parse(m[1] === '0' ? decodeURIComponent(escape(bin)) : await viaStream(bytes, new DecompressionStream('deflate-raw')).text());
      if (m[1] === '2') d = SAVECODE.grow(d);
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
    for (const [g, n] of Object.entries(inc.started)) m.started[g] = Math.max(m.started[g] || 0, n);
    for (const [k, v] of Object.entries(inc.materials)) m.materials[k] = Math.max(m.materials[k] || 0, v);
    for (const [g, L] of Object.entries(inc.level)) { const d = m.level[g] = Object.assign({}, m.level[g]); for (const [k, t] of Object.entries(L)) d[k] = Math.max(d[k] || 0, t); }
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
    const dt = m.turm, it = inc.turm;
    for (const k of ['runs', 'wins', 'best']) dt[k] = Math.max(dt[k], it[k]);
    if (!Object.keys(dt.last).length) dt.last = it.last;
    if (!dev.pin && inc.pin) { for (const k of ['off', 'hidden', 'sound', 'speak', 'grade', 'pin', 'setup']) m[k] = inc[k]; dt.subjects = it.subjects; dt.on = it.on; }
    return m;
  }
  function applySave(s, how) {
    meta = how === 'replace' ? s.meta : mergeMeta(meta, s.meta);
    for (const g of MODE_KEYS.concat('turm')) { const r = s.runs[g]; if (how === 'replace') { if (isObj(r)) save(KEY_RUN_FOR(g), r); else clear(KEY_RUN_FOR(g)); } else if (isObj(r) && !(g === 'turm' ? loadTurm() : loadRun(g))) save(KEY_RUN_FOR(g), r); }
    run = null; saveAll();
    if (!meta.setup.done && !meta.setup.skipped) setupDone('skipped'); // loading a save replaces the setup dialog
    screenTitle();
  }
  function summaryHtml(s) {
    const open = MODE_KEYS.filter((g) => isObj(s.runs[g])).map((g) => MODES[g].title).concat(isObj(s.runs.turm) ? ['Turmwacht'] : []); const d = new Date(s.at);
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

  // goal: the weekly goal this adventure was started for; its task type is offered as an attack
  function screenStarter(goal) {
    depth = 2;
    const vis = CFG().starters.filter((s) => heroShown(mode, s)); const S = vis.filter((s) => !heroLocked(s)); const last = meta.lastStarter[mode];
    let sel = S.length === 1 ? S[0].id : null;
    const want = goal && goal.kind === 'right' ? goal.mod : null;
    // Klasse 1 starts small: 2 attacks in the first adventure of a theme, 3 in the second, then all 4; a goal's attack comes first
    const kit = (s) => { if (CFG().grade !== 1) return s.attacks; const a = s.attacks.slice(), i = a.findIndex((x) => x.mod === want); if (i > 0) a.unshift(a.splice(i, 1)[0]); return a.slice(0, 2 + (meta.started[mode] || 0)); };
    // recommend the monster whose attacks were practised least (and not the one played last time); for a goal one that has its task type
    const score = (s) => s.attacks.reduce((n, a) => n + practice(a.mod), 0) + (s.id === last ? 1e6 : 0) - (want && s.attacks.some((a) => a.mod === want) ? 1e9 : 0);
    const rec = S.length > 1 ? S.slice().sort((a, b) => score(a) - score(b))[0].id : null;
    // offer to swap the most practised attack for the goal's task type or one that was hardly practised yet
    let swap = null, swapOn = true;
    const swapFor = (s) => { if (!s) return null; const have = kit(s).map((a) => a.mod); const most = have.filter((k) => enabledMods().includes(k)).sort((a, b) => practice(b) - practice(a))[0];
      if (want) return have.includes(want) || !most ? null : { from: most, to: want, goal: true };
      const cand = enabledMods().filter((k) => !have.includes(k)).sort((a, b) => practice(a) - practice(b))[0];
      return cand && most && practice(most) >= practice(cand) + 3 ? { from: most, to: cand } : null; };
    const paintSwap = () => { const s = S.find((x) => x.id === sel); swap = swapFor(s); const box = $('#swapbox'); if (!box) return; const M = MODULES_OF();
      box.innerHTML = swap ? `<button class="choice swap ${swapOn ? 'selected' : ''}" id="swap" aria-pressed="${swapOn}"><div class="meta"><div class="name">${swap.goal ? '⭐ Für dein Wochenziel' : '🎯 Neues üben'}: ${M[swap.to].icon} ${M[swap.to].name}</div><div class="desc">Statt ${M[swap.from].name}${swap.goal ? '' : ' (schon oft geübt)'} bekommst du die Attacke „${esc(CFG().extra[swap.to])}“. 🐝 Bonus: Fleißbienchen</div></div><span class="tick" aria-hidden="true">${swapOn ? '✔' : ''}</span></button>` : '';
      if (swap) $('#swap').onclick = () => { swapOn = !swapOn; paintSwap(); }; };
    render(`<div class="screen">${topbar(S.length === 1 ? 'Dein Held' : 'Wähle dein Monster')}<div class="scroll"><div class="stack">
      ${goal ? `<p class="center goalbadge">⭐ Wochenziel: ${esc(goalText(goal))}</p>` : ''}
      ${S.map((s) => `<button class="choice ${S.length === 1 ? 'selected' : ''}" data-id="${s.id}">${heroSVG(s, 0)}<div class="meta">${rec === s.id ? `<div class="recbadge">${want ? `⭐ Empfohlen: hat ${MODULES_OF()[want].name} · 🐝 Bonus` : '⭐ Empfohlen: übt Neues · 🐝 Bonus'}</div>` : ''}<div class="name">${s.names[0]}</div>${typeChip(s.type)}<div class="desc">${s.desc}<br>❤️ ${s.hp} LP · Attacken: ${[...new Set(kit(s).map((a) => MODULES_OF()[a.mod].name))].join(', ')}</div></div></button>`).join('')}
      ${vis.filter(heroLocked).map((s) => `<div class="choice locked">${monsterSVG(s.shape, '#8A8FA3', 0)}<div class="meta"><div class="name">🔒 ${s.names[0]}</div><div class="desc">Im Stempelheft für ${REWARDS.find((r) => r.hero === s.id).price} 🏷️ zu holen.</div></div></div>`).join('')}
      <div id="swapbox"></div>
      ${meta.pantry.length ? `<p class="center">Aus deinem Vorrat kommt mit: ${meta.pantry.map((it) => `${ITEMS[it].icon} ${ITEMS[it].name}`).join(', ')}</p>` : ''}
      </div></div><div class="bottom"><div class="row"><button class="btn secondary" id="back">Zurück</button><button class="btn" id="go" ${sel ? '' : 'disabled'}>Start</button></div></div></div>`);
    $('#back').onclick = () => (goal ? screenWeekly() : screenSubject(subjectOf(mode)));
    app.querySelectorAll('.choice[data-id]').forEach((b) => { b.onclick = () => { sel = b.dataset.id; app.querySelectorAll('.choice[data-id]').forEach((x) => x.classList.toggle('selected', x === b)); $('#go').disabled = false; paintSwap(); }; });
    paintSwap();
    $('#go').onclick = () => { if (!sel) return; const s = CFG().starters.find((x) => x.id === sel); run = { mode, world: 1, floor: 1, map: [], hero: { id: s.id, evo: 0, level: 1, xp: 0, hp: s.hp, maxHp: s.hp, attacks: kit(s).map((a) => ({ name: a.name, mod: a.mod })) }, items: ['trank'].concat(meta.pantry.slice(0, PANTRY_MAX)), coins: marketOn() ? 100 : 0, tiers: Object.fromEntries(MODKEYS().map((k) => [k, Math.max(1, (levelOf(mode)[k] || 1) - 1)])), path: [], shield: false };
      run.map = makeMapFor(1);
      if (swap && swapOn) { const a = run.hero.attacks.find((x) => x.mod === swap.from); if (a) { a.mod = swap.to; a.name = CFG().extra[swap.to]; } }
      if (rec && sel === rec) run.items.push('stern');
      if (swap && swapOn) run.items.push('stern');
      meta.pantry = []; meta.lastStarter[mode] = sel; meta.started[mode] = (meta.started[mode] || 0) + 1; meta.runs++; markWeek(); saveAll(); screenMap(); };
  }
  // shorter adventures for the younger grades; enemies stay as strong (see startBattle)
  const FLOORS_BY_GRADE = { 1: 6, 2: 7, 3: 8 };
  // floors are counted on an 8-floor map; m.slice(a, -2) ends before the camp and the boss
  function makeMapFor(world) { const m = makeMap(FLOORS_BY_GRADE[CFG().grade] || 8); if (CFG().school && world === 1) { m[1].forEach((n) => { n.t = 'school'; }); if (!m[m.length - 4].some((n) => n.t === 'school')) m[m.length - 4][0].t = 'school'; }
    // one special node per world on floors 3–6 instead of an event or treasure (a fight if the map has none)
    const sw = CFG().swap; if (sw) { const on = (t) => m.slice(2, -2).flat().filter((n) => n.t === t); const c = on(sw.from).length ? on(sw.from) : on('fight'); if (c.length) pick(c).t = sw.to; }
    const chests = m.flat().filter((n) => n.t === 'treasure'); if (CFG().mine && chests.length && !offList('math').includes('rest')) pick(chests).t = 'bergwerk';
    // one market per world on floors 3–6, in place of an event (a fight if there is none)
    if (marketOn()) { const fl = m.slice(2, -2).flat(); const ev = fl.filter((n) => n.t === 'event'); const n = pick(ev.length ? ev : fl.filter((x) => x.t === 'fight')); if (n) n.t = 'markt'; }
    // the week's boss takes the place of one fight on floor 5 or 6: once per adventure, until it is beaten this week
    const fights = m.slice(-4, -2).flat().filter((n) => n.t === 'fight');
    if (extraOn('wochenziele') && !run.wb && fights.length && !weekly().beaten.includes(mode)) { pick(fights).t = 'weekboss'; run.wb = true; }
    if (readsIn(mode)) { const fights = m.slice(1, -2).flat().filter((n) => n.t === 'fight'); pick(fights.length ? fights : m[0]).t = 'lesen'; }
    // last, so the Kreisel-Arena only takes a fight on floors 4–6 that no other special node took (else an event or an elite); never in Klasse 1
    const tf = extraOn('kreisel') && CFG().grade !== 1 && ['fight', 'event', 'elite'].map((t) => m.slice(-5, -2).flat().filter((n) => n.t === t)).find((c) => c.length); if (tf) pick(tf).t = 'arena';
    return m;
  }
  // one Lesestube per world replaces a fight in every Deutsch and Ethik unit
  // texts carry their grade (default 3); a unit only gets a Lesestube when there are texts for its grade
  const textsFor = (m) => TEXTE.map((t, i) => i).filter((i) => (TEXTE[i].grade || 3) === MODES[m].grade);
  const readsIn = (m) => ['Deutsch', 'Ethik'].includes(MODES[m].subject) && textsFor(m).length > 0;
  // same enemy, weak spot and HP on every device in this week
  function weekBossSpec(world) {
    const r = MQ.seeded(weekly().week + ':' + mode + ':' + world); const pool = CFG().enemies[world].normal; const e = pool[Math.floor(r() * pool.length)];
    return Object.assign({}, e, { name: e.name + ' der Woche', base: e.name, hp: Math.round(e.hp * 1.25), weekboss: true, weakOrder: seededOrder(r, MODKEYS()) });
  }

  const NODE_INFO = { fight: ['⚔️', 'Kampf'], elite: ['💀', 'Elite'], event: ['❓', 'Ereignis'], rest: ['🔥', 'Rast'], treasure: ['🎁', 'Schatz'], boss: ['👑', 'Boss'], school: ['✏️', 'Zeichenschule'], labor: ['🔬', 'Forscherlabor'], taeusch: ['👁️', 'Sinnestäuschung'], karte: ['🗺️', 'Schatzkarte'], weekboss: ['🏅', 'Wochenboss'], markt: ['🧺', 'Markt'], lesen: ['📖', 'Lesestube'], bergwerk: ['⛏️', 'Bergwerk'], arena: ['🌀', 'Kreisel-Arena'] };
  function screenMap() {
    depth = 2;
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
    backTo = () => { const s = subjectOf(mode); if (s) screenSubject(s); else screenTitle(); };
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
  // ctx (Turmwacht) may override the texts: { full, later, desc: { [item id]: text } } and the screen after using an item outside a fight (done)
  function showBag(inBattle, ctx) {
    const T = ctx || {}; const desc = (id) => (T.desc && T.desc[id]) || ITEMS[id].desc;
    const stacks = []; run.items.forEach((it, i) => { const st = stacks.find((x) => x.id === it); if (st) st.n++; else stacks.push({ id: it, i, n: 1 }); });
    const ov = modal(`<h2>🎒 Beutel</h2>${run.items.length ? `<div class="items">${stacks.map((st) => `<button class="item" data-i="${st.i}" aria-label="${ITEMS[st.id].name}${st.n > 1 ? `, ${st.n} Stück` : ''}: ${esc(desc(st.id))}"><span>${ITEMS[st.id].icon} ${ITEMS[st.id].name}${st.n > 1 ? ` <b class="count">×${st.n}</b>` : ''}</span><small>${esc(desc(st.id))}</small></button>`).join('')}</div><p class="muted" style="opacity:.8;margin-top:10px" id="bagdesc">Tippe auf einen Gegenstand, um ihn zu benutzen.</p>` : '<p>Dein Beutel ist leer.</p>'}<button class="btn secondary" id="close" style="margin-top:10px">Schließen</button>`);
    $('#close', ov).onclick = () => ov.remove();
    ov.querySelectorAll('.item').forEach((b) => { b.onclick = () => { const id = run.items[+b.dataset.i]; const it = ITEMS[id]; if (it.heal && run.hero.hp >= run.hero.maxHp) { $('#bagdesc', ov).textContent = T.full || 'Du hast schon volle Lebenspunkte.'; return; } if ((it.shield || it.power || it.hint) && !inBattle) { $('#bagdesc', ov).textContent = `${it.name}: ${T.later || 'Das kannst du nur im Kampf benutzen.'}`; return; } if (it.revive) { $('#bagdesc', ov).textContent = `${it.name}: ${desc(id)}`; return; } if ((it.shield && run.shield) || (it.power && run.power) || (it.hint && run.hint)) { $('#bagdesc', ov).textContent = `${it.name} wirkt schon – mehr geht nicht gleichzeitig.`; return; } run.items.splice(+b.dataset.i, 1); if (it.heal) heal(it.heal); if (it.shield) run.shield = true; if (it.power) run.power = true; if (it.hint) run.hint = true; const lv = it.xp ? gainXp(it.xp) : []; saveAll(); ov.remove(); if (inBattle) inBattle(it, lv); else if (T.done) T.done(it); else { screenMap(); if (it.xp) { const m = modal(`<h2>${it.icon} +${it.xp} XP</h2>${lv.map((x) => `<p style="font-weight:800;color:var(--orange)">${esc(x)}</p>`).join('') || '<p>Dein Monster lernt dazu.</p>'}<button class="btn" id="tutok">Weiter</button>`); $('#tutok', m).focus({ preventScroll: true }); $('#tutok', m).onclick = () => m.remove(); } } }; });
  }

  // resume exactly where it stopped, so closing the app never swaps a node or resets a fight
  function resumeRun() {
    depth = 2;
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
    else if (type === 'labor' || type === 'taeusch') screenLabor();
    else if (type === 'karte') screenKarte();
    else if (type === 'lesen') screenRead();
    else if (type === 'markt') { if (marketOn()) screenMarket(); else screenEvent(); }
  }
  function advance() { run.floor++; run.shield = false; run.node = null; if (run.floor > run.map.length) { if (run.world >= CFG().worlds) { screenVictory(); return; } run.world++; run.floor = 1; run.map = makeMapFor(run.world); run.path = []; meta.bestWorld = Math.max(meta.bestWorld, run.world); if (CFG().worldAttacks && CFG().worldAttacks[run.world]) { run.hero.attacks = CFG().worldAttacks[run.world].map((x) => ({ name: x.name, mod: x.mod })); } } saveAll(); screenMap(); }

  /* ---------- Battle ---------- */
  // arena: a spinning-top duel against the owner of the other top, which isn't a Monsterbuch entry
  function startBattle(spec, hard, arena) {
    // extra HP offsets weak-spot damage, so fights stay about as long
    // enemies grow along the way as on an 8-floor map, so a shorter map's boss is just as strong
    const step = (run.floor - 1) * 7 / Math.max(1, run.map.length - 1);
    const scale = ENEMY_HP * (1 + step * 0.03); const elite = hard && !spec.boss;
    const dexName = spec.base || spec.name; const fresh = !arena && !meta.dex[dexName]; if (fresh) giveStamps(2);
    const mods = heroAttacks().map((a) => a.mod); const weak = spec.weakOrder ? spec.weakOrder.find((k) => mods.includes(k)) : pickWeak();
    const enemy = { fresh, name: spec.name, type: spec.type, shape: spec.shape, maxHp: Math.round(spec.hp * scale), hp: Math.round(spec.hp * scale), atk: Math.round(spec.atk * (1 + step * 0.02)) + (elite ? 1 : 0), boss: !!spec.boss, elite, weekboss: !!spec.weekboss, weak };
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
    const log = () => plain(b.log); speakBtn($('.log'), 'afterbegin', log, !quiet && log); // Klasse 1 and 2 hear only how a fight starts
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
    const goalMods = openGoals(mode).filter((g) => g.kind === 'right').map((g) => g.mod);
    $('#bottom').innerHTML = `<div class="attacks">${atks.map((a, i) => { const inf = attackInfo(b, a); return `<button class="atk ${inf.tired ? 'tired' : ''} ${inf.weak ? 'weak' : ''}" data-i="${i}" aria-label="${esc(a.name)}: ${MODULES[a.mod].name}, ${inf.dmg} Schaden${inf.weak ? ', Schwachstelle' : ''}${inf.strong ? ', stark' : ''}${inf.tired ? ', müde' : ''}"><span class="n">${esc(a.name)}</span><span class="m">${MODULES[a.mod].icon} ${MODULES[a.mod].name}<span class="dmg">💥 ${inf.dmg}</span></span><span class="tags">${goalMods.includes(a.mod) ? '<span class="tag goal">⭐ Wochenziel</span>' : ''}${inf.weak ? '<span class="tag weak">🎯 Schwachstelle</span>' : ''}${inf.tired ? `<span class="tag tired">😮‍💨 ${inf.tired > 1 ? 'sehr müde' : 'müde'}</span>` : ''}${run.power ? '<span class="tag power">🌶️ doppelt</span>' : ''}</span></button>`; }).join('')}</div><div class="row" style="margin-top:8px"><button class="btn secondary small" id="bag">🎒 Beutel (${run.items.length})</button><span class="muted" style="align-self:center;font-size:14px">Tipp: Nimm die 🎯 Schwachstelle und wechsle ab.</span></div>`;
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
    const tier = taskTier(atk.mod);
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
        b.enemy.pending = struggling() ? 1 : 1.5;
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
    sayCard();
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
    const e = b.enemy, T = e.top; const t = makeTask(atk.mod, taskTier(atk.mod)); const wind = T.start < TOP_START;
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
  const READ_TUT = { title: 'Lesestube', steps: ['Lies den Text in Ruhe. Vor jeder Frage kannst du ihn noch einmal ansehen.', 'Jede richtige Antwort trifft den Zeilenspringer. Nach einer falschen Antwort schlägt er zurück.', 'Nach den Fragen ist die Lesestunde vorbei.'] };
  const readText = () => TEXTE[run.node.text];
  // Silbenmethode: syllables alternate two colours, each word starts with the first
  const sylHtml = (s) => s.split(/([A-Za-zÄÖÜäöüß·]+)/).map((w, i) => (i % 2 ? w.split('·').map((x, k) => `<span class="sy${k % 2}">${x}</span>`).join('') : esc(w))).join('');
  const readCard = (t) => `<div class="card readcard"><div class="eyebrow">${esc(t.kind)}</div><h2>${esc(t.title)}</h2><p${t.syl ? ' class="syl"' : ''}>${t.syl ? sylHtml(t.syl) : esc(t.text)}</p>${t.by ? `<p class="by">${esc(t.by)}</p>` : ''}</div>`;
  function screenRead() {
    if (!Number.isInteger(run.node.text) || !TEXTE[run.node.text]) { run.node.text = pick(textsFor(mode)); saveAll(); }
    render(`<div class="screen">${topbar('📖 Lesestube')}<div class="scroll">${readCard(readText())}</div><div class="bottom"><button class="btn" id="next">Zu den Fragen</button></div></div>`);
    $('#next').onclick = () => {
      const e = { name: READ_FOE.name, type: READ_FOE.type, shape: READ_FOE.shape, maxHp: READ_FOE.hp, hp: READ_FOE.hp, atk: READ_FOE.atk, read: { q: 0, right: 0 } };
      run.node.enemy = e; saveAll();
      renderBattle({ enemy: e, log: `${e.name} bringt die Zeilen durcheinander. Beantworte ${readText().qs.length === 2 ? 'zwei' : 'drei'} Fragen zum Text.`, logCls: '', phase: 'choose' });
    };
  }
  function readChoice(b) {
    const r = b.enemy.read; const n = readText().qs.length; const dmg = Math.ceil(b.enemy.maxHp / n);
    if (r.q >= n || b.enemy.hp <= 0) { $('#bottom').innerHTML = '<button class="btn" id="next">Weiter</button>'; $('#next').onclick = () => readEnd(b); return; }
    $('#bottom').innerHTML = `<div class="attacks" style="grid-template-columns:1fr"><button class="atk" id="rq" aria-label="Frage ${r.q + 1} von ${n}, ${dmg} Schaden"><span class="n">Frage ${r.q + 1} von ${n}</span><span class="m">${READ_MOD.icon} ${READ_MOD.name}<span class="dmg">💥 ${dmg}${run.power ? ' · 🌶️ doppelt' : ''}</span></span></button></div><div class="row" style="margin-top:8px"><button class="btn secondary small" id="rtext">📄 Text ansehen</button><button class="btn secondary small" id="bag">🎒 Beutel (${run.items.length})</button></div>`;
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
    ensureTutorial(t, () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: `Frage ${r.q + 1} von ${tx.qs.length}`, hint, onResult }, () => {
      b.phase = b.enemy.pending ? 'wait' : 'choose'; renderBattle(b, true);
      if (hit) { $('#fe').classList.add('hurt'); fx('#fe', '−' + hit); SFX.hit(); }
      else setTimeout(() => { if (run) enemyTurn(b, 1); }, 1700);
    }));
  }
  function readEnd(b) {
    const r = b.enemy.read; const beaten = b.enemy.hp <= 0; const xp = 6 * r.right; const msgs = gainXp(xp);
    nodeDone(); saveAll(); if (r.right) setTimeout(SFX.win, 150);
    render(`<div class="screen">${topbar('📖 Lesestube')}<div class="scroll"><div class="card center"><h2>${esc(b.enemy.name)} ${beaten ? 'ist besiegt.' : 'verschwindet zwischen den Seiten.'}</h2><p>${r.right} von ${readText().qs.length} Fragen richtig</p>${xp ? `<p>+${xp} XP</p>` : ''}${msgs.map((m) => `<p style="color:var(--orange);font-weight:800">${m}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`);
    sayCard();
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
      const mod = o.task === 'geld' ? 'geld' : o.task === 'any' || !enabledMods().includes(o.task) ? pick(enabledMods()) : o.task; const t = makeTask(mod, taskTier(mod), { g: o.g });
      render(`<div class="screen">${topbar('❓ ' + esc(ev.title))}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`);
      let won = false;
      ensureTutorial(t, () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), onResult: (ok) => { won = ok; recordAnswer(mod, ok, t); applyEffect(ok ? o.win : o.lose); } }, () => showEffect(won ? 'Richtig gelöst' : 'Daneben')));
    };
    if (Number.isInteger(resumeOpt)) return runOpt(resumeOpt);
    speakBtn($('.card'), 'afterbegin', () => joined(ev.title, ev.text, ev.dilemma && 'Was würdest du tun?', ...ev.opts.map((o) => o.label)));
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
    speakBtn($('.card'), 'afterbegin', () => joined(title, opt && opt.then, opt && opt.then && 'Denk mal nach: ' + opt.think, ...lines.map(plain)));
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
    const t = makeTask(mod, taskTier(mod));
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
      const part = elite || !extraOn('kreisel') ? null : Object.keys(TOP).flatMap((s) => TOP[s].filter((p) => p.chest === run.world).map((p) => `top-${s}-${p.id}`)).find((k) => !meta.owned[k]);
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
  const MB_DEFS = `<defs>${rg('mb-dirt', '#A87850', '#5E3D24')}${rg('mb-rock', '#C3C8CF', '#6E747C')}${rg('mb-ore', '#9AA0AA', '#4E545E')}${rg('mb-nug', '#F2A866', '#B4471E')}<radialGradient id="mb-hole" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#2E1C10"/><stop offset="1" stop-color="#6E4A2E"/></radialGradient></defs>`;
  const glint = (x, y, s) => `<path d="M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z" fill="#FFE27A"/>`;
  const MB = {
    '': `<rect x="3" y="3" width="34" height="34" rx="6" fill="url(#mb-dirt)" ${ln(2)}/><path d="M7 13V9q0-3 3-3h18" fill="none" stroke="#D2A270" stroke-width="1.6" stroke-linecap="round" opacity=".8"/><path d="M9 12l6 5-2 8M27 8l-3 8 7 5M19 29l6 4" fill="none" stroke="#3E2816" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="30" cy="30" rx="2.6" ry="1.9" fill="#A9AFB8" ${ln(0.8)}/><ellipse cx="11" cy="31" rx="1.8" ry="1.4" fill="#A9AFB8" ${ln(0.8)}/><circle cx="21" cy="11" r=".9" fill="#D2A270"/><circle cx="33" cy="15" r=".8" fill="#D2A270"/><circle cx="16" cy="22" r=".8" fill="#3E2816"/>`,
    stein: `<rect x="3" y="3" width="34" height="34" rx="6" fill="url(#mb-rock)" ${ln(2)}/><path d="M4 18L13 12L22 15L29 8M13 12L12 4M22 15L24 25L36 27M24 25L17 36M24 25L11 27L4 24" fill="none" stroke="#6E747C" stroke-width="1.3" stroke-linejoin="round"/><path d="M6 15L12 11L12 5L8 5Q5 5 5 8Z" fill="#E1E5EA" opacity=".7"/><path d="M25 26L35 28L35 34Q35 36 33 36L19 36Z" fill="#4E545E" opacity=".35"/><circle cx="17" cy="20" r=".9" fill="#5E646E"/><circle cx="30" cy="16" r=".8" fill="#5E646E"/><circle cx="9" cy="31" r=".8" fill="#E1E5EA"/>`,
    erz: `<rect x="3" y="3" width="34" height="34" rx="6" fill="url(#mb-ore)" ${ln(2)}/><path d="M7 13V9q0-3 3-3h18" fill="none" stroke="#C3C8CF" stroke-width="1.6" stroke-linecap="round" opacity=".7"/><path d="M8 30Q15 22 20 23T33 12" fill="none" stroke="#B4471E" stroke-width="2.4" stroke-linecap="round"/><path d="M8 30Q15 22 20 23T33 12" fill="none" stroke="#E8A15A" stroke-width="1" stroke-linecap="round"/>
      <path d="M9 11l5-2 3 4-3 4-5-1z" fill="url(#mb-nug)" ${ln(1.2)}/><path d="M21 19l6-1 3 5-4 5-6-2z" fill="url(#mb-nug)" ${ln(1.2)}/><path d="M12 27l4-1 2 3-3 3-4-2z" fill="url(#mb-nug)" ${ln(1.2)}/><path d="M11 12l3-1M23 20l3-.5" stroke="#FFE0B8" stroke-width="1" stroke-linecap="round"/>${glint(29, 9, 3.4)}${glint(31, 31, 2.8)}${glint(17, 16, 2)}`,
    leer: `<rect x="3" y="3" width="34" height="34" rx="8" fill="#9C7048" stroke="#5E3D24" stroke-width="1.6"/><path d="M8 21Q7 12 16 11Q22 9 28 12Q34 15 32 23Q31 31 21 32Q10 32 8 21Z" fill="url(#mb-hole)" stroke="#4A2C18" stroke-width="1.4"/><path d="M10 17Q14 11 22 11.5Q28 12 31 17" fill="none" stroke="#C99A70" stroke-width="1.6" stroke-linecap="round" opacity=".8"/><ellipse cx="9" cy="33" rx="3" ry="2" fill="#B88A5E" stroke="#5E3D24" stroke-width=".9"/><ellipse cx="31" cy="34" rx="3.4" ry="2.2" fill="#B88A5E" stroke="#5E3D24" stroke-width=".9"/><ellipse cx="33" cy="8" rx="2" ry="1.4" fill="#B88A5E" stroke="#5E3D24" stroke-width=".8"/><circle cx="8" cy="9" r="1.2" fill="#6E4A2E"/><circle cx="20" cy="35" r="1" fill="#6E4A2E"/><circle cx="15" cy="7" r=".9" fill="#C99A70"/><ellipse cx="17" cy="26" rx="2.2" ry="1.3" fill="#7A5234"/>`,
  };
  const blockSVG = (k) => `<svg viewBox="0 0 40 40" aria-hidden="true">${MB_DEFS}${MB[k || '']}</svg>`;
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
  const STALL = `<svg class="stall" viewBox="0 0 220 120" aria-hidden="true"><defs>${lg('ms-r', '#EE6A55', '#C23A30')}${lg('ms-c', '#FFF8E8', '#E6D3AE')}${lg('ms-w', '#C99158', '#8E5A30')}${lg('ms-p', '#8E5A30', '#C08550', 1)}${rg('ms-sk', '#F8DABA', '#E0A980')}${lg('ms-sh', '#4FA66A', '#2F7A47')}${rg('ms-ap', '#F07A5E', '#B8322A')}${rg('ms-po', '#F3D48E', '#B88843')}${rg('ms-hr', '#9A6440', '#5E3A22')}
    <pattern id="ms-wv" width="8" height="6" patternUnits="userSpaceOnUse"><rect width="8" height="6" fill="#D2A458"/><path d="M0 3q2-3 4 0t4 0" stroke="#8E6A2C" stroke-width="1.1" fill="none"/></pattern></defs>
    ${shadow(110, 116, 102, 4)}<rect x="26" y="28" width="8" height="86" fill="url(#ms-p)" ${ln(2.5)}/><rect x="186" y="28" width="8" height="86" fill="url(#ms-p)" ${ln(2.5)}/>
    <path d="M84 113q2-32 26-36q24 4 26 36z" fill="url(#ms-sh)" ${ln(3)}/><path d="M99 86h22v27h-22z" fill="#FFF3D6" ${ln(2)}/><path d="M103 98h14v8h-14z" fill="none" stroke="#C9B48A" stroke-width="1.4"/>
    <ellipse cx="95" cy="62" rx="3.5" ry="4.5" fill="url(#ms-sk)" ${ln(2)}/><ellipse cx="125" cy="62" rx="3.5" ry="4.5" fill="url(#ms-sk)" ${ln(2)}/><circle cx="110" cy="61" r="15" fill="url(#ms-sk)" ${ln(3)}/>
    <circle cx="110" cy="42" r="6" fill="url(#ms-hr)" ${ln(2.2)}/><path d="M95 60q-1-17 15-17t15 17q-5-9-15-9t-15 9z" fill="url(#ms-hr)" ${ln(2.2)}/><path d="M102 47q5-2 9-1" stroke="#C49070" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <circle cx="104" cy="61" r="2.2" fill="${INK}"/><circle cx="116" cy="61" r="2.2" fill="${INK}"/><circle cx="103.3" cy="60.2" r=".8" fill="#FFFFFF"/><circle cx="115.3" cy="60.2" r=".8" fill="#FFFFFF"/><path d="M104 68q6 5 12 0" fill="none" ${ln(2.2)}/><ellipse cx="100" cy="67" rx="3" ry="1.8" fill="#FF7A9A" opacity=".45"/><ellipse cx="120" cy="67" rx="3" ry="1.8" fill="#FF7A9A" opacity=".45"/>
    ${[[42, 70], [52, 68], [62, 70], [47, 64], [57, 63]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="url(#ms-ap)" ${ln(1.8)}/><path d="M${x} ${y - 5}l1-3" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="${x - 2}" cy="${y - 2}" rx="1.6" ry="1" fill="#FFE0D6" opacity=".7"/>`).join('')}<path d="M58 60q4-4 8-1q-4 3-8 1z" fill="#5FA34E" ${ln(1)}/>
    <path d="M34 72h38l-4 12h-30z" fill="url(#ms-wv)" ${ln(2.2)}/><rect x="32" y="70" width="42" height="5" rx="2.5" fill="#C99A4E" ${ln(1.8)}/>
    ${[[150, 70, 0], [162, 68, 15], [174, 70, -10], [156, 64, 8], [168, 63, -6]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="5" transform="rotate(${a} ${x} ${y})" fill="url(#ms-po)" ${ln(1.8)}/><circle cx="${x + 2}" cy="${y + 1}" r=".9" fill="#8A6030"/>`).join('')}
    <rect x="142" y="72" width="40" height="12" rx="2" fill="url(#ms-w)" ${ln(2.2)}/><path d="M142 78h40M162 72v12" stroke="#6E4526" stroke-width="1.2"/>
    <rect x="14" y="82" width="192" height="7" rx="3" fill="#DDA86B" ${ln(2.5)}/><path d="M18 84h184" stroke="#F2CE98" stroke-width="1.2" stroke-linecap="round"/><rect x="18" y="89" width="184" height="25" rx="3" fill="url(#ms-w)" ${ln(3)}/>${[48, 79, 110, 141, 172].map((x) => `<path d="M${x} 90v23" stroke="#6E4526" stroke-width="1.6"/>`).join('')}<path d="M24 97q10-2 18 0M56 104q12 2 18-1M90 96q10 1 16-1M118 106q12-2 18 0M150 98q10 2 16 0M180 105q10-2 18 0" stroke="#7A4A26" stroke-width="1" fill="none" opacity=".55"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${14 + i * 32} 12L${24 + i * 28.7} 3H${24 + (i + 1) * 28.7}L${14 + (i + 1) * 32} 12z" fill="url(#ms-${i % 2 ? 'c' : 'r'})" ${ln(2.2)}/>`).join('')}
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${14 + i * 32} 12h32v18a16 9 0 0 1-32 0z" fill="url(#ms-${i % 2 ? 'c' : 'r'})" ${ln(2.5)}/><path d="M${18 + i * 32} 15v13" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity=".35"/>`).join('')}<path d="M14 12h192" fill="none" ${ln(3)}/></svg>`;
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
  // a unit can draw two pictures: the first on floor 2, the second later (see makeMapFor)
  const schoolKey = () => { const s = CFG().school; return Array.isArray(s) ? s[run && run.floor > 2 ? 1 : 0] : s; };
  function screenSchool(step) {
    const P = plantOf(schoolKey()); const n = P.steps.length;
    if (step > n) { render(`<div class="screen">${topbar('✏️ Zeichenschule')}<div class="scroll"><div class="card center"><h2>Merk-Check</h2><p>Jetzt verschwinden die Namen. Weißt du noch, wie alle Teile heißen?</p>${P.svg({})}</div></div><div class="bottom"><button class="btn" id="go">Los!</button></div></div>`); $('#go').onclick = () => schoolCheck(MK.shuffle(P.parts.map((p) => p.id)), 0); return; }
    render(`<div class="screen">${topbar(`✏️ Zeichenschule ${step} / ${n}`)}<div class="scroll"><div class="card"><h3>Schritt ${step}</h3><p>${esc(P.steps[step - 1])}</p>${P.svg({ step, labels: true })}<p class="muted" style="color:var(--ink-soft)">Zeichne mit auf Papier. Die Namen stehen dabei.</p></div></div><div class="bottom"><div class="row">${step > 1 ? `<button class="btn secondary" id="prev">Zurück</button>` : ''}<button class="btn" id="next">${step < n ? 'Nächster Schritt' : 'Zum Merk-Check'}</button></div></div></div>`);
    $('#next').onclick = () => screenSchool(step + 1); if ($('#prev')) $('#prev').onclick = () => screenSchool(step - 1);
  }
  function schoolCheck(ids, i) {
    if (i >= ids.length) { const m = gainXp(20); nodeDone(); saveAll(); render(`<div class="screen">${topbar('✏️ Zeichenschule')}<div class="scroll"><div class="card center"><h2>Merk-Check bestanden</h2><p>⭐ +20 XP</p>${m.map((x) => `<p style="color:var(--orange);font-weight:800">${x}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`); $('#next').onclick = advance; return; }
    const P = plantOf(schoolKey()); const part = P.parts.find((p) => p.id === ids[i]); const others = MK.shuffle(P.parts.filter((p) => p.id !== part.id)).slice(0, 3).map((p) => p.name);
    const t = { kind: 'parts', mod: 'parts', tier: 1, group: 'parts:1', note: P.note, q: 'Wie heißt der leuchtende Teil?', part: part.id, options: MK.shuffle(others.concat([part.name])), answer: part.name, qid: P.qid + part.id, plant: P === POTATO ? undefined : schoolKey() };
    render(`<div class="screen">${topbar(`✏️ Merk-Check ${i + 1} / ${ids.length}`)}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`);
    ensureTutorial(t, () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: 'Merk-Check', onResult: (ok) => { recordAnswer('parts', ok, t); saveAll(); } }, () => schoolCheck(ids, i + 1)));
  }

  /* ---------- Forscherlabor: guess first, then the result; a wrong guess costs nothing ---------- */
  function screenLabor() {
    const n = run.node; if (!isObj(n.lab) || !Array.isArray(n.lab.list)) { n.lab = { list: (CFG().labor || MS.laborSet)(), i: 0, right: 0, guess: null }; saveAll(); }
    const L = n.lab; if (L.i >= L.list.length) return laborEnd();
    const ex = L.list[L.i]; const title = NODE_INFO[n.type === 'taeusch' ? 'taeusch' : 'labor'].join(' '); const guessed = Number.isInteger(L.guess); const ok = L.guess === ex.a;
    const result = guessed ? `<p class="labres"><b>${ok ? 'Deine Vermutung stimmt.' : `Du hast „${esc(ex.opts[L.guess])}“ vermutet.`}</b> Ergebnis: ${esc(ex.opts[ex.a])}.</p><div class="notecard"><div class="eyebrow">Notiz</div>${esc(ex.note)}</div>` : '<p>Was vermutest du? Tippe auf deine Vermutung.</p>';
    render(`<div class="screen">${topbar(title)}<div class="scroll"><div class="card labor"><div class="eyebrow">Versuch ${L.i + 1} von ${L.list.length}</div><h3>${esc(ex.q)}</h3>${(guessed && ex.after) || ex.pic || ''}${result}</div></div>
      <div class="bottom">${guessed ? '<button class="btn" id="next">Weiter</button>' : `<div class="options ${ex.opts.length === 2 ? 'two' : ''}">${ex.opts.map((o, i) => `<button class="opt guess" data-i="${i}">${esc(o)}</button>`).join('')}</div>`}</div></div>`);
    if (guessed) { $('#next').onclick = () => { L.i++; L.guess = null; saveAll(); screenLabor(); }; return; }
    app.querySelectorAll('.opt.guess').forEach((b) => { b.onclick = () => { L.guess = +b.dataset.i; if (L.guess === ex.a) { L.right++; SFX.right(); } saveAll(); screenLabor(); }; });
  }
  // same reward level as an event
  function laborEnd() {
    const L = run.node.lab; const title = NODE_INFO[run.node.type === 'taeusch' ? 'taeusch' : 'labor'].join(' '); const m = gainXp(20); nodeDone(); saveAll();
    render(`<div class="screen">${topbar(title)}<div class="scroll"><div class="card"><h2>Deine Notizkarte</h2><p>${L.right} von ${L.list.length} Vermutungen ${L.right === 1 ? 'hat' : 'haben'} gestimmt.</p><div class="notecard">${L.list.map((x) => `<div>• ${esc(x.note)}</div>`).join('')}</div><p>⭐ +20 XP</p>${m.map((x) => `<p style="color:var(--orange);font-weight:800">${x}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`);
    $('#next').onclick = advance;
  }

  /* ---------- Schatzkarte: instead of a treasure; found = chest, two misses = a berry ---------- */
  function screenKarte() {
    const n = run.node; if (!enabledMods().includes('karte') || n.found) return screenTreasure();
    if (!isObj(n.hunt)) n.hunt = { tries: 0, task: null };
    if (!isObj(n.hunt.task)) { n.hunt.task = makeTask('karte', taskTier('karte')); saveAll(); }
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
    sayCard();
    $('#again').onclick = () => screenStarter(); $('#home').onclick = screenTitle;
  }
  const CONFETTI = `<div class="confetti" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 6) * 0.35}s;--c:${['#FFC93C', '#4FC96A', '#3FA0FF', '#FF6A3D', '#FF6E8E'][i % 5]}"></i>`).join('')}</div>`;
  function screenVictory() {
    meta.wins++; giveStamps(10); weeklyStep('win'); meta.progressAt = new Date().toISOString(); if (mode === 'kartoffel') meta.owned['beet-4'] = true;
    const roof = CFG().worlds >= 3 && !meta.owned['hut-dachfenster']; if (roof) meta.owned['hut-dachfenster'] = true; const name = heroName(); const spec = heroSpec(); const evo = run.hero.evo; const bs = CFG().enemies[CFG().worlds].boss; const bossName = bs.acc || bs.name;
    endRun(); run = null; setTimeout(SFX.finale, 300);
    render(`<div class="screen">${topbar('Sieg!')}${CONFETTI}<div class="scroll"><div class="card center"><h1 style="font-size:36px">${esc(bs.name)} ist besiegt!</h1>${heroSVG(spec, evo)}<p><b>${esc(name)}</b> ${CFG().worlds > 1 ? `hat ${CFG().worlds === 2 ? 'beide Welten' : 'alle drei Welten'} durchquert.` : 'ist am Ziel.'}</p>${stampLine(10)}${roof && extraOn('huette') ? '<p>Für deine Hütte gibt es jetzt ein Dachfenster.</p>' : ''}<p>Gewonnene Abenteuer: ${meta.wins}</p></div></div><div class="bottom"><div class="stack"><button class="btn" id="again">Noch ein Abenteuer</button><button class="btn ghost" id="home">Zum Titel</button></div></div></div>`);
    $('#again').onclick = () => screenStarter(); $('#home').onclick = screenTitle;
  }
  function screenDex() {
    depth = 1;
    const all = []; for (const m of MODE_KEYS) { const EN = MODES[m].enemies; for (const w of Object.keys(EN)) { for (const e of EN[w].normal) all.push(e); all.push({ ...EN[w].elite, elite: true }); all.push(EN[w].boss); } }
    for (let i = all.length - 1; i >= 0; i--) if (all.findIndex((e) => e.name === all[i].name) < i) all.splice(i, 1); // Klasse 1/2 units share their opponents
    render(`<div class="screen">${topbar('Monsterbuch')}<div class="scroll"><div class="stack">${all.map((e) => { const seen = meta.dex[e.name]; return `<div class="choice" style="cursor:default">${seen ? monsterSVG(e.shape, TYPES[e.type].color, 0, '', { elite: e.elite, boss: e.boss }) : `<div class="mon" style="width:96px;height:96px;display:flex;align-items:center;justify-content:center;font-size:48px">❔</div>`}<div class="meta"><div class="name">${seen ? esc(e.name) : '???'}</div>${seen ? typeChip(e.type) : ''}<div class="desc">${seen ? `Welt ${seen.world}${e.boss ? ' · Boss' : e.elite ? ' · Elite' : ''}` : 'Noch nicht gesehen'}</div></div></div>`; }).join('')}</div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    $('#back').onclick = screenTitle;
  }
  function screenStamps(jump) {
    depth = 1;
    const now = MQ.isoWeek(new Date()); const weeks = MQ.schoolWeeks(new Date()); const y = +weeks[0].slice(0, 4);
    const cells = weeks.map((k) => { const v = meta.stampCard[k]; return `<span class="wk${v === 2 ? ' gold' : v ? ' done' : ''}${k === now ? ' now' : ''}" role="img" aria-label="Woche ${+k.slice(6)}${v === 2 ? ', Wochenaufgabe geschafft' : v ? ', geübt' : ''}${k === now ? ', diese Woche' : ''}">${v === 2 ? '★' : v ? '✓' : ''}</span>`; }).join('');
    const row = (r) => { const prev = r.icon ? `<div class="rwprev" aria-hidden="true">${r.icon}</div>` : r.bg ? `<div class="rwprev" style="background:${r.bg}" aria-hidden="true">⚔️</div>` : monsterSVG(MQ.STARTERS.find((s) => s.id === r.hero).shape, TYPES.normal.color, 0);
      return `<div class="choice reward">${prev}<div class="meta"><div class="name">${esc(r.name)}</div><div class="desc">${esc(r.desc)}</div>${owns(r) ? '<div class="rwhave">✔ Schon geholt</div>' : r.price ? `<button class="btn small" data-buy="${r.id}" ${canBuy(r) ? '' : 'disabled'}>Holen · ${r.price} 🏷️${r.stein ? ` + ${r.stein} Stein` : ''}</button>` : ''}</div></div>`; };
    render(`<div class="screen">${topbar('Stempelheft')}<div class="scroll"><div class="stack">
      <div class="card center"><div class="stampbal">🏷️ ${meta.stamps}</div><p>Je 10 richtige Aufgaben in einem Abenteuer: 1 Stempel. Neues Monster im Monsterbuch: 2. Boss besiegt: 5. Abenteuer gewonnen: 10. Wochenaufgabe: 10.</p></div>
      <div class="card"><h3>Stempelkarte ${y}/${String(y + 1).slice(2)}</h3><p class="pnote">Ein Feld für jede Schulwoche. ✓ heißt: In dieser Woche hast du geübt. ★ heißt: Wochenaufgabe geschafft.</p><div class="wkgrid">${cells}</div></div>
      <h2 id="rewards">Belohnungen</h2>
      <div class="choice reward">${monsterSVG('fox', TYPES.feuer.color, 0, '', { outfit: 'strohhut' })}<div class="meta"><div class="name">Kleiderkammer</div><div class="desc">Hut, Schal, Brille und mehr für deine Helden.</div><button class="btn small" id="kk">Öffnen</button></div></div>
      ${extraOn('kreisel') ? `<div class="choice reward">${MONART.topSVG(TYPES.wasser.color, meta.top)}<div class="meta"><div class="name">Kreisel bauen</div><div class="desc">Spitze, Ring und Scheibe für die Kreisel-Arena.</div><button class="btn small" id="kb">Öffnen</button></div></div>` : ''}
      ${REWARDS.filter((r) => extraOn('huette') || !r.id.startsWith('hut-')).map(row).join('')}
      ${extraOn('huette') ? benchHtml() : ''}
      </div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    $('#back').onclick = screenTitle;
    $('#kk').onclick = () => screenWardrobe();
    if ($('#kb')) $('#kb').onclick = () => screenTop();
    app.querySelectorAll('[data-craft]').forEach((b) => { b.onclick = () => screenCraft(b.dataset.craft); });
    if (jump && $('#werkbank') && $('#werkbank').scrollIntoView) $('#werkbank').scrollIntoView();
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
    depth = 2;
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
  const plaque = (y, v) => `<rect x="296" y="${y}" width="36" height="24" rx="6" fill="#FFF3D6" ${ln(2)}/><text x="314" y="${y + 18}" text-anchor="middle" font-size="18" font-weight="700" fill="${INK}">${v}</text>`;
  const FURN = {
    'hut-fenster': { box: [32, 82, 98, 78], art: () => `<defs>${lg('hf-w', '#C98F55', '#8E5A30')}${lg('hf-sky', '#8FCDF2', '#E2F3EC')}${lg('hf-st', '#CDD2D8', '#8C939C')}${lg('hf-cu', '#E66A55', '#B23A31', 1)}</defs>
      <rect x="43" y="92" width="84" height="62" rx="4" fill="#5A3A1E" opacity=".22"/><rect x="38" y="86" width="86" height="64" rx="4" fill="url(#hf-w)" ${ln(3)}/><path d="M42 90h30M88 146h30M120 96v20" stroke="#6E4526" stroke-width="1.2" opacity=".45"/>
      <rect x="46" y="93" width="70" height="50" fill="url(#hf-sky)" ${ln(2)}/><path d="M47 131q14-9 28-4t26-6t14 4v17h-68z" fill="#8CC56A"/><path d="M47 137q18-6 34 0t34-2v7h-68z" fill="#5FA34E"/>
      <path d="M53 106a4 4 0 0 1 7-3a5 5 0 0 1 9 2a3 3 0 0 1 0 6h-15a3 3 0 0 1 -1-5z" fill="#FFFDF5" opacity=".9"/><circle cx="104" cy="102" r="5" fill="#FFE27A"/>
      <path d="M81 93v50M46 118h70" stroke="${INK}" stroke-width="6"/><path d="M81 94v48M47 118h68" stroke="#B07A45" stroke-width="3"/><path d="M51 113l10-14M57 115l6-8M87 139l10-14" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>
      <path d="M36 86h15q-3 30 4 57q-11 4-20 0q4-28 1-57z" fill="url(#hf-cu)" ${ln(2.2)}/><path d="M41 92q-1 22 1 44M46 92q0 24 3 46" stroke="#8E2A24" stroke-width="1.2" fill="none" opacity=".6"/>
      <path d="M126 86h-15q3 30-4 57q11 4 20 0q-4-28-1-57z" fill="url(#hf-cu)" ${ln(2.2)}/><path d="M121 92q1 22-1 44M116 92q0 24-3 46" stroke="#8E2A24" stroke-width="1.2" fill="none" opacity=".6"/>
      <rect x="31" y="82" width="100" height="5" rx="2.5" fill="#7A4A26" ${ln(2)}/>
      <path d="M95 148l-2-10h14l-2 10z" fill="#D2733F" ${ln(2)}/><path d="M100 138q-6-8-2-13q4 5 2 13zM100 138q5-9 9-9q0 7-9 9z" fill="#5FA34E" ${ln(1.6)}/>
      <rect x="32" y="148" width="98" height="10" rx="3" fill="url(#hf-st)" ${ln(2.5)}/><path d="M36 151h90" stroke="#F0F2F5" stroke-width="1.5" stroke-linecap="round" opacity=".8"/><circle cx="50" cy="154" r="1" fill="#6E747C"/><circle cx="78" cy="155" r="1.2" fill="#6E747C"/><circle cx="112" cy="154" r="1" fill="#6E747C"/>` },
    'hut-haken': { box: [148, 82, 56, 74], art: (n) => `<defs>${lg('hh-m', '#C4CAD3', '#5E646E')}</defs>
      <rect x="168" y="91" width="22" height="11" rx="3" fill="#5A3A1E" opacity=".22"/><rect x="165" y="87" width="22" height="11" rx="3" fill="url(#hh-m)" ${ln(2.2)}/><circle cx="170" cy="92.5" r="1.7" fill="#E6E9EE" ${ln(0.8)}/><circle cx="182" cy="92.5" r="1.7" fill="#E6E9EE" ${ln(0.8)}/>
      <path d="M180 98v10q0 7-5 7q-6 0-6-6" fill="none" ${ln(7)}/><path d="M180 98v10q0 7-5 7q-6 0-6-6" fill="none" stroke="#8C939C" stroke-width="3.6" stroke-linecap="round"/><path d="M181.2 100v7" stroke="#EEF1F5" stroke-width="1.2" stroke-linecap="round"/>
      ${n.tops ? `<path d="M175 114q-4 4 1 8" fill="none" stroke="#C8473B" stroke-width="2" stroke-linecap="round"/>${MONART.topSVG(TYPES.feuer.color, meta.top).replace('<svg ', '<svg x="152" y="104" width="48" height="48" ')}` : ''}` },
    'hut-regal': { box: [234, 68, 112, 168], art: (n) => `<defs>${lg('hr-w', '#C68B55', '#8A5530', 1)}${lg('hr-b', '#5E3A1E', '#8E5E36')}${lg('hr-y', '#FFE27A', '#E0A82E')}</defs>
      ${shadow(289, 233, 58, 5)}<rect x="240" y="74" width="98" height="158" rx="3" fill="url(#hr-w)" ${ln(3)}/><rect x="248" y="80" width="82" height="146" fill="url(#hr-b)" ${ln(2)}/>
      <path d="M243 90v40M244 170v40M335 100v50M334 190v28" stroke="#6E4526" stroke-width="1.2" opacity=".5"/>
      ${[114, 156, 198].map((y) => `<rect x="248" y="${y + 7}" width="82" height="6" fill="${INK}" opacity=".2"/><rect x="246" y="${y}" width="86" height="7" rx="2" fill="#B98048" ${ln(2)}/><path d="M249 ${y + 2}h80" stroke="#E2B07A" stroke-width="1.2" stroke-linecap="round"/>`).join('')}
      <rect x="236" y="68" width="106" height="9" rx="3" fill="#9C6A3C" ${ln(2.5)}/><path d="M240 70.5h98" stroke="#D59E66" stroke-width="1.2" stroke-linecap="round"/>
      <rect x="252" y="84" width="18" height="30" rx="2" fill="#D94A3A" ${ln(2)}/><path d="M252 89h18M252 109h18" stroke="#FFC93C" stroke-width="2"/><circle cx="261" cy="99" r="3.5" fill="#FFC93C" ${ln(1.2)}/><path d="M254 86v26" stroke="#F08A78" stroke-width="1.4" stroke-linecap="round"/>
      <rect x="271" y="88" width="10" height="26" rx="2" fill="#3B7DD8" ${ln(2)}/><path d="M271 94h10" stroke="#BFD8F5" stroke-width="1.5"/><rect x="282" y="90" width="8" height="25" rx="2" fill="#4FA66A" ${ln(2)} transform="rotate(12 286 114)"/>${plaque(86, n.dex)}
      ${shadow(266, 155, 9, 1.6)}<path d="M266 155l-12-13h24z" fill="url(#hr-y)" ${ln(2)}/><ellipse cx="266" cy="142" rx="12" ry="4" fill="#FFE9A0" ${ln(2)}/><rect x="263" y="130" width="6" height="12" rx="2.5" fill="#E8483B" ${ln(1.8)}/>${plaque(127, n.tops)}
      <rect x="250" y="176" width="30" height="22" rx="2" fill="#E8DCC0" ${ln(2)} transform="rotate(-7 265 187)"/><rect x="254" y="174" width="30" height="22" rx="2" fill="#FFF7E6" ${ln(2)}/><path d="M259 181h20M259 186h20M259 191h12" stroke="#8A8FA3" stroke-width="1.6" stroke-linecap="round"/>${plaque(169, n.notes)}
      <path d="M256 226q-2-12 8-12q9 0 9 12z" fill="#8C939C" ${ln(2)}/><circle cx="262" cy="219" r="1.6" fill="#E07A3A"/><circle cx="267" cy="222" r="1.2" fill="#FFE27A"/><path d="M272 226q0-9 8-9q8 0 8 9z" fill="#A9AFB8" ${ln(2)}/><circle cx="281" cy="222" r="1.5" fill="#E07A3A"/>` },
    'hut-bett': { box: [10, 190, 128, 86], art: () => `<defs>${lg('hb-w', '#BE824C', '#7E4E2A')}${lg('hb-m', '#F6E8C2', '#D8BC80')}${lg('hb-p', '#FFFDF5', '#E3DAC4')}${lg('hb-s', '#1C2541', '#1C2541')}
      <pattern id="hb-q" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#3B7DD8"/><rect width="6" height="12" fill="#2D63B4" opacity=".55"/><rect width="12" height="6" fill="#7AAEEB" opacity=".45"/><path d="M0 9h12M3 0v12" stroke="#FFF3D6" stroke-width=".8" opacity=".5"/></pattern></defs>
      ${shadow(76, 272, 64, 5)}<rect x="21" y="254" width="7" height="18" rx="2" fill="#6E4526" ${ln(2)}/><rect x="124" y="254" width="7" height="18" rx="2" fill="#6E4526" ${ln(2)}/>
      <path d="M14 270V205q0-9 9-9q9 0 9 9v65z" fill="url(#hb-w)" ${ln(3)}/><rect x="18" y="208" width="10" height="30" rx="3" fill="#8E5A30" stroke="#6E4526" stroke-width="1.4"/><circle cx="23" cy="197" r="4" fill="#9C6A3C" ${ln(2)}/>
      <rect x="30" y="228" width="98" height="14" rx="5" fill="url(#hb-m)" ${ln(2.5)}/><path d="M36 236l5-2M46 238l6-3M58 235l4 2" stroke="#C9A55E" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M34 226q-2-10 12-11q16-1 17 8q0 6-14 6q-13 0-15-3z" fill="url(#hb-p)" ${ln(2.2)}/><path d="M44 220q6 2 10 0" stroke="#C9BFA6" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <path d="M62 219q33-4 66 0v25q-34 6-66 0z" fill="url(#hb-q)" ${ln(2.5)}/><path d="M62 219q33-4 66 0v6q-33-4-66 0z" fill="#FFF3D6" ${ln(2)}/><path d="M63 238q32 5 64 0v6q-33 6-64 0z" fill="#1C2541" opacity=".18"/>
      <rect x="18" y="240" width="116" height="17" rx="3" fill="url(#hb-w)" ${ln(3)}/><path d="M24 245q30-2 52 1M84 251q20 2 44-1" stroke="#6E4526" stroke-width="1.2" fill="none" opacity=".55"/><path d="M22 243h108" stroke="#D9A066" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M125 268v-36q0-5 5-5q5 0 5 5v36z" fill="url(#hb-w)" ${ln(2.5)}/>` },
    'hut-tisch': { box: [144, 160, 92, 118], art: () => `<defs>${lg('ht-w', '#C99158', '#8E5A30')}${lg('ht-t', '#E2AE70', '#BC834A')}${rg('ht-p', '#F3D48E', '#B88843')}
      <pattern id="ht-wv" width="8" height="6" patternUnits="userSpaceOnUse"><rect width="8" height="6" fill="#D2A458"/><path d="M0 3q2-3 4 0t4 0" stroke="#8E6A2C" stroke-width="1.1" fill="none"/><path d="M4 0v6" stroke="#B48A40" stroke-width=".8"/></pattern></defs>
      ${shadow(192, 274, 48, 5)}<path d="M158 224h8l-1 48h-6zM218 224h8l-1 48h-6z" fill="url(#ht-w)" ${ln(2.5)}/><rect x="164" y="252" width="56" height="5" rx="2" fill="#8E5A30" ${ln(2)}/>
      <path d="M170 190q22-34 44 0" fill="none" ${ln(6.5)}/><path d="M170 190q22-34 44 0" fill="none" stroke="#C99A4E" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M205 186l9-18" ${ln(3.5)}/><path d="M205 186l9-18" stroke="#E3B341" stroke-width="1.6" stroke-linecap="round"/>${[0, 1, 2, 3].map((i) => `<ellipse cx="${214 - i * 1.6 + (i % 2 ? 2.4 : -2.4)}" cy="${167 + i * 3.4}" rx="2.2" ry="3" fill="#EAC25A" ${ln(1)}/>`).join('')}
      <ellipse cx="178" cy="184" rx="10" ry="7" fill="url(#ht-p)" ${ln(2)}/><ellipse cx="196" cy="181" rx="10" ry="7" fill="url(#ht-p)" ${ln(2)}/><ellipse cx="208" cy="186" rx="8" ry="6" fill="url(#ht-p)" ${ln(2)}/><circle cx="175" cy="182" r="1.1" fill="#8A6030"/><circle cx="199" cy="179" r="1.1" fill="#8A6030"/><ellipse cx="192" cy="178" rx="3" ry="1.5" fill="#FFF7E0" opacity=".6"/>
      <path d="M164 189h56l-6 24h-44z" fill="url(#ht-wv)" ${ln(2.5)}/><path d="M168 205h48l-2 8h-44z" fill="${INK}" opacity=".15"/><rect x="162" y="185" width="60" height="7" rx="3.5" fill="#C99A4E" ${ln(2.2)}/><path d="M166 187h52" stroke="#EBCB85" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M148 216l4-6h80l4 6z" fill="url(#ht-t)" ${ln(2.5)}/><rect x="148" y="216" width="88" height="9" rx="2" fill="url(#ht-w)" ${ln(2.5)}/><path d="M156 220h30M196 221h32" stroke="#6E4526" stroke-width="1.1" opacity=".5"/>` },
  };
  const ROOF = `<path d="M170 40L148 230h68L190 40z" fill="#FFF3C4" opacity=".22"/><circle cx="180" cy="28" r="16" fill="#9C6A3C" ${ln(2.5)}/><circle cx="180" cy="28" r="11" fill="url(#hu-sky)" ${ln(2)}/><path d="M169 28h22M180 17v22" stroke="${INK}" stroke-width="4.5"/><path d="M169.5 28h21M180 17.5v21" stroke="#B07A45" stroke-width="2"/><path d="M172 24l4-5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
  const HUT_DEFS = `<defs>${lg('hu-log', '#EDD6A6', '#CDAA70')}${lg('hu-gab', '#8E5E36', '#6A4224')}${lg('hu-beam', '#A87442', '#6E4526')}${lg('hu-post', '#8E5E36', '#B07A45', 1)}${lg('hu-fl', '#BC8654', '#8E5E36')}${lg('hu-sky', '#8FCDF2', '#D9F0EE')}${lg('hu-sk', '#1C2541', '#1C2541')}
    <radialGradient id="hu-light" cx=".3" cy=".25" r=".85"><stop offset="0" stop-color="#FFF4D6" stop-opacity=".55"/><stop offset=".6" stop-color="#FFF4D6" stop-opacity="0"/><stop offset="1" stop-color="#5A3A1E" stop-opacity=".25"/></radialGradient>
    <linearGradient id="hu-sb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C2541" stop-opacity=".25"/><stop offset="1" stop-color="#1C2541" stop-opacity="0"/></linearGradient>
    <pattern id="hu-logs" width="180" height="52" patternUnits="userSpaceOnUse" y="48"><rect width="180" height="52" fill="url(#hu-log)"/><rect y="26" width="180" height="26" fill="#E6CB94"/><rect y="39" width="180" height="13" fill="#CDAA70" opacity=".5"/>
      <path d="M0 25h180M0 51h180" stroke="#9C7444" stroke-width="2"/><path d="M0 2h180M0 28h180" stroke="#F8E8C4" stroke-width="1.4"/><path d="M14 10q30-3 60 1M100 16q30 2 64-1M30 36q40 3 80-1M130 44q20-2 44 0" stroke="#C49B63" stroke-width="1.1" fill="none"/><ellipse cx="88" cy="13" rx="4" ry="2" fill="none" stroke="#B48A55" stroke-width="1.1"/><ellipse cx="152" cy="38" rx="3" ry="1.6" fill="none" stroke="#B48A55" stroke-width="1.1"/></pattern></defs>`;
  const shelfNums = () => ({ dex: Object.keys(meta.dex).length, tops: Object.keys(meta.owned).filter((k) => k.startsWith('top-')).length, notes: Object.keys(meta.know).length });
  const furnPreview = (id) => { const [x, y, w, h] = FURN[id].box; return `<svg class="rwprev furn" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true">${FURN[id].art(shelfNums())}</svg>`; };
  // room 1 shows a dashed place for every piece not built yet; hut.items are the pieces moved to room 2
  function hutSVG(room) {
    const n = shelfNums(); const here = Object.keys(FURN).filter((id) => meta.owned[id] && (room === 2) === (meta.hut.rooms >= 2 && meta.hut.items.includes(id)));
    const gaps = room === 1 ? Object.keys(FURN).filter((id) => !meta.owned[id]) : [];
    const label = here.length ? 'Im Zimmer: ' + here.map((id) => RECIPES.find((r) => r.id === id).name).join(', ') : 'Das Zimmer ist leer';
    return `<svg class="hutroom" viewBox="0 0 360 290" role="img" aria-label="${esc(label)}">${HUT_DEFS}
      <rect y="48" width="360" height="182" fill="url(#hu-logs)"/><rect width="360" height="48" fill="url(#hu-gab)"/>${[30, 75, 120, 240, 285, 330].map((x) => `<path d="M${x} 0V48" stroke="#4E3018" stroke-width="1.6"/>`).join('')}<path d="M180 6V48" stroke="#4E3018" stroke-width="5"/><path d="M0 48L180 4L360 48" fill="none" stroke="#4E3018" stroke-width="9" stroke-linejoin="round"/><path d="M0 44L180 1L360 44" fill="none" stroke="#B07A45" stroke-width="2"/>
      <rect y="230" width="360" height="60" fill="url(#hu-fl)"/>${[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => `<path d="M${180 + i * 30} 230L${180 + i * 42} 290" stroke="#7A4E2D" stroke-width="1.6"/>`).join('')}<path d="M40 250l14 1M120 268l18 1M228 246l12 0M290 272l20 1M70 282l16 0" stroke="#7A4E2D" stroke-width="1.1" opacity=".6"/>
      <rect y="233" width="360" height="10" fill="url(#hu-sb)"/><ellipse cx="190" cy="266" rx="78" ry="15" fill="#C8473B" ${ln(2.5)}/><ellipse cx="190" cy="266" rx="64" ry="11.5" fill="#E3B341"/><ellipse cx="190" cy="266" rx="48" ry="8.5" fill="#3B7DD8"/><ellipse cx="190" cy="266" rx="31" ry="5.5" fill="#F2E2BC"/>${[74, 57, 40].map((r) => `<ellipse cx="190" cy="266" rx="${r}" ry="${r * 0.19}" fill="none" stroke="#1C2541" stroke-width="1.2" stroke-dasharray="2 3" opacity=".3"/>`).join('')}
      <rect y="224" width="360" height="8" fill="#8E5E36" stroke="#5E3A1E" stroke-width="1.5"/><path d="M0 225.5h360" stroke="#C99158" stroke-width="1.2"/>
      <rect y="42" width="360" height="12" fill="url(#hu-beam)" ${ln(2.5)}/><path d="M20 46q60-2 120 1M200 50q70 2 140-1" stroke="#5E3A1E" stroke-width="1.1" fill="none" opacity=".6"/><circle cx="60" cy="48" r="2" fill="#4E3018"/><circle cx="300" cy="48" r="2" fill="#4E3018"/>
      <rect x="-2" y="54" width="12" height="176" fill="url(#hu-post)" ${ln(2)}/><rect x="350" y="54" width="12" height="176" fill="url(#hu-post)" ${ln(2)}/>
      <rect width="360" height="290" fill="url(#hu-light)"/>
      ${room === 1 && meta.owned['hut-dachfenster'] ? ROOF : ''}${gaps.map((id) => { const [x, y, w, h] = FURN[id].box; return `<rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="10" fill="#FFF7E6" fill-opacity=".55" stroke="#8A6A30" stroke-width="2.5" stroke-dasharray="7 6"/><text x="${x + w / 2}" y="${y + 30}" text-anchor="middle" font-size="15" font-weight="700" fill="#6B4A22">${RECIPES.find((r) => r.id === id).place}</text>`; }).join('')}${here.map((id) => FURN[id].art(n)).join('')}</svg>`;
  }
  function screenHut() {
    depth = 1;
    const two = meta.hut.rooms >= 2; const n = shelfNums(); const built = Object.keys(FURN).filter((id) => meta.owned[id]);
    const name = (id) => RECIPES.find((r) => r.id === id).name;
    render(`<div class="screen">${topbar('Meine Hütte')}<div class="scroll"><div class="stack">
      ${two ? '<h3>Erstes Zimmer</h3>' : ''}${hutSVG(1)}${two ? `<h3>Zweites Zimmer</h3>${hutSVG(2)}` : ''}
      <div class="card">${built.length ? '' : '<p>Noch ist deine Hütte leer. Möbel baust du an der Werkbank im Stempelheft.</p>'}${meta.owned['hut-regal'] ? `<p>Im Regal: ${n.dex} im Monsterbuch, ${n.tops} Kreiselteile, ${n.notes} Notizkarten.</p>` : ''}
      ${built.length && built.length < 5 ? '<p class="pnote">Die gestrichelten Plätze warten noch auf Möbel von der Werkbank.</p>' : ''}${two ? '' : '<p class="pnote">Ein zweites Zimmer gibt es im Stempelheft für 30 Stempel und 12 Stein.</p>'}${meta.owned['hut-dachfenster'] ? '' : '<p class="pnote">Wer Zahlenquest durch alle drei Welten gewinnt, bekommt ein Dachfenster.</p>'}</div>
      <div class="row"><button class="btn ghost" id="bench">Zur Werkbank</button>${extraOn('garten') ? '<button class="btn ghost" id="garden">Schulgarten</button>' : ''}</div>
      ${two && built.length ? `<div class="card"><h3>Umräumen</h3><div class="stack">${built.map((id) => `<button class="btn small secondary" data-move="${id}">${esc(name(id))} ins ${meta.hut.items.includes(id) ? 'erste' : 'zweite'} Zimmer</button>`).join('')}</div></div>` : ''}
      </div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    $('#back').onclick = screenTitle; $('#bench').onclick = () => screenStamps(true); if ($('#garden')) $('#garden').onclick = screenGarden;
    app.querySelectorAll('[data-move]').forEach((b) => { b.onclick = () => { const id = b.dataset.move; const h = meta.hut; h.items = h.items.includes(id) ? h.items.filter((x) => x !== id) : h.items.concat(id); saveAll(); screenHut(); }; });
  }
  function screenWardrobe(heroId) {
    depth = 2;
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
    depth = 2;
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
    depth = i ? 2 : 1;
    const units = visSubjects().flatMap((s) => s.modes);
    const heroes = () => (p.mode ? MODES[p.mode].starters.filter((s) => !heroLocked(s) && heroShown(p.mode, s)) : []);
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
    const all = Object.entries(w.tally).map(([k, v]) => { const [m, mod] = k.split(':'); const M = MODES[m] && MODES[m].modules[mod]; return M && v.t ? { m, name: M.name, icon: M.icon, c: v.c, t: v.t } : null; }).filter(Boolean).sort((a, b) => b.t - a.t);
    // Luther and Kirchenjahr share task type names
    const rows = all.map((r) => Object.assign(r, { label: all.some((x) => x.name === r.name && x.m !== r.m) ? `${r.name} (${MODES[r.m].title})` : r.name }));
    const weak = rows.filter((r) => r.t >= 3).sort((a, b) => a.c / a.t - b.c / b.t)[0];
    const done = goals.filter(goalDone).length;
    const text = [`Lernquest, Woche ${wk}`, rows.length ? 'Geübt (richtig von gesamt): ' + rows.map((r) => `${r.label} ${r.c} von ${r.t}`).join(', ') : 'Diese Woche noch nichts geübt.',
      weak ? `Schwächste Aufgabenart: ${weak.label} (${weak.c} von ${weak.t} richtig)` : '', extraOn('wochenziele') ? `Wochenziele: ${done} von ${goals.length} erledigt` : ''].filter(Boolean).join('\n');
    return { text, wk, rows, goals, done };
  }
  /* ---------- Turmwacht (rules in src/turm.js) ---------- */
  const TURM_PHASES = ['choose', 'task', 'step', 'reward', 'build', 'fallen', 'won'];
  // a unit's Turm world: the furthest world reached in an adventure there (running, or a Monsterbuch entry from there)
  const turmWorld = (m) => { const r = loadRun(m); return Math.min(MODES[m].worlds, Math.max(1, r ? r.world : 1, ...Object.values(meta.dex).filter((e) => isObj(e) && e.mode === m && Number.isInteger(e.world)).map((e) => e.world))); };
  // Turmwacht is for review: only the task types the child has practised in a subject, topped up to two from the first
  // practised theme, else from the subject's first theme in title order (a new subject brings two explanations, not a dozen)
  const turmSources = (subject, grade) => {
    const units = MODE_KEYS.filter((m) => MODES[m].grade === grade && MODES[m].subject === subject && shown(m)).sort((x, y) => (MODES[x].rank || 0) - (MODES[y].rank || 0)), done = units.filter(practised);
    const seen = done.flatMap((m) => fightMods(m).filter((k) => meta.stats[m][k] && meta.stats[m][k].t > 0).map((k) => ({ m, k })));
    // at least two task types, so a subject alone still gets two paths
    const m = done[0] || units[0];
    for (const k of enabledMods(m)) if (seen.length < 2 && !seen.some((s) => s.m === m && s.k === k)) seen.push({ m, k });
    return seen;
  };
  const turmHero = (h = run.hero) => MODES[h.m].starters.find((s) => s.id === h.id);
  const laneAcc = (lane) => { let c = 0, t = 0; for (const { m, k } of lane.src) { const s = meta.stats[m][k]; c += s.c; t += s.t; } return t ? c / t : 0.6; };
  const turmCtx = (hero) => ({ rnd: Math.random, heroType: turmHero(hero).type, enemies: (m, w) => MODES[m].enemies[w], worlds: (m) => MODES[m].worlds, dmg: (m, k) => MODES[m].modules[k].dmg, acc: laneAcc, on: (m, k) => enabledMods(m).includes(k) });
  // the per-unit task box; start tiers one below the level reached, as in an adventure
  const turmBox = (m) => run.turm.at[m] || (run.turm.at[m] = { world: turmWorld(m), tiers: Object.fromEntries(fightMods(m).map((k) => [k, Math.max(1, (levelOf(m)[k] || 1) - 1)])), recent: {} });
  // after every rule change: record and latest scores go to meta, and everything is saved at once
  function turmSync(x) {
    const t = run.turm; meta.turm.best = Math.max(meta.turm.best, t.best);
    // a monster on the board is seen: Monsterbuch entry under its own unit and world, +2 Stempel when new (as in an adventure)
    for (const y of t.monsters) if (!meta.dex[y.name]) { meta.dex[y.name] = { type: y.type, shape: y.shape, world: y.world, mode: y.unit || y.m }; y.fresh = true; t.stamps += giveStamps(2); }
    if (Object.keys(t.score).length) meta.turm.last = JSON.parse(JSON.stringify(t.score));
    saveAll(); return x;
  }
  // a new run replaces a saved one
  function startTurm(subjects, hero) {
    const grade = curGrade().grade;
    clear(KEY_TURM); run = null;
    const r = TW.newRun({ grade, lanes: TW.lanesFor(subjects, (s) => turmSources(s, grade)), hero }, turmCtx(hero));
    run = r; for (const l of r.turm.lanes) for (const s of l.src) turmBox(s.m);
    meta.turm.runs++;
    return turmSync(r);
  }
  // the question is saved with the run before it is shown, so a reload asks the same one again
  function turmAsk(id) {
    const t = run.turm;
    if (t.phase !== 'task' && !TW.ask(run, id)) return null;
    const a = t.asking; mode = a.m; turmBox(a.m);
    if (!a.task) { a.task = (a.again && a.again.task) || makeTask(a.k, a.again ? a.again.tier : taskTier(a.k)); saveAll(); }
    return a.task;
  }
  // saved together with phase 'step': a reload never repeats the answer or its Ziegel
  function turmAnswer(ok) {
    const a = run.turm.asking;
    if (run.turm.phase !== 'task' || !a) return [];
    mode = a.m; turmBox(a.m); recordAnswer(a.k, ok, a.task);
    const elites = run.turm.monsters.filter((x) => x.elite), ev = TW.answer(run, ok, turmCtx(run.hero), { task: a.task });
    for (const x of elites) if (ev.some((e) => e.t === 'beaten' && e.id === x.id)) { mode = x.m; weeklyStep('elite'); }
    mode = a.m;
    return turmSync(ev);
  }
  // Stempel as in an adventure: the answers pay at the end of every wave and at the fall, +5 per boss wave, +10 for the victory
  function turmStep() {
    const t = run.turm, w = TW.WAVES[t.wave - 1];
    for (const x of t.monsters) delete x.fresh; // „Neu im Monsterbuch“ shows for the turn the monster arrives
    const ev = TW.step(run, turmCtx(run.hero)), has = (k) => ev.some((e) => e.t === k);
    if (has('cleared') || has('fallen')) t.stamps += payAnswers();
    if (has('cleared') && (w.boss != null || w.final != null)) t.stamps += giveStamps(5);
    if (has('won')) { meta.turm.wins++; t.stamps += giveStamps(10); meta.progressAt = new Date().toISOString(); }
    return turmSync(ev);
  }
  const turmReward = (i) => turmSync(TW.takeReward(run, i));
  const turmBuy = (card) => turmSync(TW.buy(run, card));
  const turmNextWave = () => turmSync(TW.nextWave(run, turmCtx(run.hero)));
  const turmRetry = () => turmSync(TW.retry(run));

  // Saves must always load: a broken Turm run is removed (only its own key), single bad fields are repaired
  function loadTurm() {
    const r = load(KEY_TURM, null);
    if (fixTurm(r)) return r;
    if (r) clear(KEY_TURM);
    return null;
  }
  function fixTurm(r) {
    const t = isObj(r) && r.turm, int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi, arr = (a) => (Array.isArray(a) ? a : []);
    if (!isObj(t) || !isObj(r.hero) || !Array.isArray(t.lanes) || !t.lanes.length || t.lanes.length > 3 || !t.lanes.every((l) => isObj(l) && typeof l.subject === 'string' && Array.isArray(l.src)) || !int(t.wave, 1, TW.WAVES.length)) return false;
    const okSrc = (s) => isObj(s) && own(MODES, s.m) && own(MODES[s.m].modules, s.k) && !MODES[s.m].modules[s.k].shop;
    // a lane whose units are gone keeps its monsters; they take questions from the other lanes
    for (const l of t.lanes) l.src = l.src.filter(okSrc).map(({ m, k }) => ({ m, k }));
    const L = t.lanes.length, all = t.lanes.flatMap((l) => l.src), lane = (i) => int(i, 0, L - 1);
    if (!all.length) return false;
    r.mode = 'turm'; r.grade = r.grade === 2 ? 2 : 3;
    const h = r.hero;
    if (!own(MODES, h.m) || !MODES[h.m].starters.some((s) => s.id === h.id)) { h.m = all[0].m; h.id = MODES[h.m].starters[0].id; }
    h.evo = int(h.evo, 0, 2) ? h.evo : 0; h.maxHp = int(h.maxHp, 1, 999) ? h.maxHp : TW.TOWER_HP; h.hp = int(h.hp, 0, h.maxHp) ? h.hp : h.maxHp;
    r.items = arr(r.items).filter((it) => own(ITEMS, it));
    for (const k of ['shield', 'power', 'hint']) r[k] = r[k] === true;
    for (const k of ['right', 'answered', 'solved']) r[k] = nat(r[k]);
    const okAgain = (e) => okSrc(e) && lane(e.lane) && int(e.tier, 1, 99) && (e.task === undefined || isObj(e.task));
    const ids = new Set(), cells = new Set();
    const okMon = (board) => (x) => {
      if (!isObj(x) || !Number.isInteger(x.id) || ids.has(x.id) || !lane(x.lane) || !(board ? int(x.cell, 1, TW.CELLS) : x.cell === 0) || !int(x.maxHp, 1, 1e5) || !int(x.hp, 1, x.maxHp)) return false;
      if (board) { if (cells.has(x.lane + ':' + x.cell)) return false; cells.add(x.lane + ':' + x.cell); }
      ids.add(x.id);
      if (!okSrc(x)) Object.assign(x, t.lanes[x.lane].src[0] || all[0]);
      x.name = typeof x.name === 'string' ? RENAMES[x.name] || x.name : 'Sumpfbrocken';
      if (typeof x.shape !== 'string') x.shape = 'sumpfbrocken';
      if (!own(TYPES, x.type)) x.type = 'normal';
      x.world = int(x.world, 1, 9) ? x.world : 1; x.steps = x.steps === 2 ? 2 : 1; x.slow = x.slow === 1 ? 1 : 0; x.stun = x.stun === 1 ? 1 : 0;
      for (const k of ['elite', 'boss', 'final', 'fresh']) if (x[k] !== true) delete x[k];
      if (typeof x.acc !== 'string') delete x.acc;
      if (x.again !== undefined && !okAgain(x.again)) delete x.again;
      // the final boss loses one shield per path; its HP must still reach the next shield
      const sh = x.shields;
      if (x.final && !(Array.isArray(sh) && sh.length && sh.every(lane) && new Set(sh).size === sh.length && int(x.part, 1, x.maxHp) && x.hp > x.part * (sh.length - 1))) { x.shields = [x.lane]; x.part = x.maxHp; }
      if (x.final && !own(MODES, x.unit)) x.unit = x.m;
      return true;
    };
    t.monsters = arr(t.monsters).filter(okMon(true));
    t.queue = arr(t.queue).filter(okMon(false));
    t.nextId = Math.max(int(t.nextId, 1, 1e9) ? t.nextId : 1, ...[...ids].map((i) => i + 1));
    const onBoard = (id) => t.monsters.some((x) => x.id === id);
    if (!TURM_PHASES.includes(t.phase)) t.phase = 'choose';
    const a = t.asking;
    t.asking = t.phase === 'task' && isObj(a) && onBoard(a.id) && okSrc(a) && lane(a.lane) ? a : null;
    if (t.asking) { if (a.task !== undefined && !isObj(a.task)) delete a.task; if (a.again !== undefined && !okAgain(a.again)) delete a.again; }
    else if (t.phase === 'task') t.phase = 'choose';
    // nothing left to tap: the next step ends the wave or lets new monsters in
    if (t.phase === 'choose' && !t.monsters.length) t.phase = 'step';
    t.offer = t.phase === 'reward' ? arr(t.offer).filter((it) => own(ITEMS, it)) : null;
    if (t.offer && !t.offer.length) t.offer = ['trank'];
    if (!onBoard(t.weak)) t.weak = null;
    if (!(isObj(t.boss3) && lane(t.boss3.lane) && typeof t.boss3.name === 'string')) t.boss3 = null;
    t.guards = Object.fromEntries(Object.entries(isObj(t.guards) ? t.guards : {}).filter(([k, g]) => /^\d:\d$/.test(k) && lane(+k[0]) && +k[2] < TW.SPOTS && isObj(g) && typeof g.look === 'string' && own(TYPES, g.type) && int(g.lvl, 1, TW.GUARD_DMG.length)));
    t.floors = [...new Set(arr(t.floors).filter((s) => t.lanes.some((l) => l.subject === s)))];
    t.again = arr(t.again).filter(okAgain).slice(0, TW.AGAIN_MAX);
    t.used = Object.fromEntries(Object.entries(isObj(t.used) ? t.used : {}).filter(([, n]) => Number.isInteger(n) && n >= 0));
    t.score = Object.fromEntries(Object.entries(isObj(t.score) ? t.score : {}).filter(([, v]) => okScore(v)));
    t.at = Object.fromEntries(Object.entries(isObj(t.at) ? t.at : {}).filter(([m, b]) => own(MODES, m) && isObj(b) && int(b.world, 1, MODES[m].worlds)).map(([m, b]) => [m, {
      world: b.world, tiers: Object.fromEntries(Object.entries(isObj(b.tiers) ? b.tiers : {}).filter(([k, n]) => own(MODES[m].modules, k) && int(n, 1, 99))),
      recent: Object.fromEntries(Object.entries(isObj(b.recent) ? b.recent : {}).filter(([, x]) => Array.isArray(x))) }]));
    for (const k of ['ziegel', 'turn', 'stamps']) t[k] = nat(t[k]);
    t.earned = Object.fromEntries(Object.entries(isObj(t.earned) ? t.earned : {}).filter(([, n]) => Number.isInteger(n) && n > 0));
    for (const k of ['free', 'hurtThisWave']) t[k] = t[k] === true;
    t.cpUsed = int(t.cpUsed, 0, TW.CP_USES) ? t.cpUsed : 0;
    t.best = Math.min(TW.WAVES.length, Math.max(t.wave, nat(t.best)));
    // the checkpoint is a run without the fields that stay when it is used: check it as one, with those taken from this run
    if (t.cp !== null) {
      const c = isObj(t.cp) && isObj(t.cp.turm) ? JSON.parse(JSON.stringify(t.cp)) : null;
      if (c) for (const k of TW.KEEP) c.turm[k] = k === 'cp' ? null : JSON.parse(JSON.stringify(t[k]));
      if (c && fixTurm(c) && c.turm.phase === 'build') { delete c.right; delete c.answered; delete c.solved; for (const k of TW.KEEP) delete c.turm[k]; t.cp = c; } else t.cp = null;
    }
    return true;
  }

  /* Turm screens. They never call CFG()-based helpers: the global mode is only the unit that asked last. */
  // off until the parents switch it on: Turmwacht is still being tried out
  const turmOn = () => meta.turm.on && curGrade().grade !== 1;
  const TW_FLAG = '<svg class="twflag" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 2.5v15" fill="none" stroke="#FFF9EE" stroke-width="2.2" stroke-linecap="round"/><path d="M6 3.5h9.5l-2.6 3.2 2.6 3.3H6Z" fill="#FF6A3D" stroke="#1C2541" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  const TURM_BAG = { full: 'Der Turm ist heil.', later: 'Das geht nur, solange eine Welle läuft.',
    desc: { trank: `Repariert ${ITEMS.trank.heal} ❤️ am Turm. Während einer Welle kostet das einen Zug.`, grosstrank: `Repariert ${ITEMS.grosstrank.heal} ❤️ am Turm. Während einer Welle kostet das einen Zug.`, schild: 'Wirkt, sobald ein Monster am Turm ankommt.', keks: 'Dein nächster Treffer macht doppelten Schaden.', lupe: 'Ein Tipp bei der nächsten Aufgabe.' } };
  const turmSubjAcc = (subject, grade) => { let c = 0, t = 0; for (const { m, k } of turmSources(subject, grade)) { const s = meta.stats[m][k]; c += s.c; t += s.t; } return { subject, acc: t ? c / t : 0.6, t }; };
  // starters of the units the child has practised (all units if none); Klasse-1/2 heroes are shared by a subject's units, each counts once
  function turmHeroes(grade) {
    const units = MODE_KEYS.filter((m) => MODES[m].grade === grade && shown(m));
    const of = (ms) => ms.flatMap((m) => MODES[m].starters.filter((s) => heroShown(m, s) && !heroLocked(s)).map((s) => ({ m, s }))).filter((h, i, all) => all.findIndex((x) => x.s.id === h.s.id) === i);
    const met = of(units.filter((m) => practised(m) || meta.lastStarter[m])), all = of(units);
    return met.length ? met : all.length ? all : [{ m: units[0], s: MODES[units[0]].starters[0] }];
  }
  const turmLeave = (to) => { saveAll(); run = null; turmMode = null; to(); };
  // id → monster as it was before the answer (beaten ones are gone afterwards), for the log
  const turmNames = () => Object.fromEntries(run.turm.monsters.concat(run.turm.queue).map((x) => [x.id, { name: x.name, acc: accName(x), x: JSON.parse(JSON.stringify(x)) }]));
  // „Erst den Wackelturm besiegen.“: the data's accusative if it has one, else the article (and an adjective after „Der“) declined
  const accName = (x) => x.acc || x.name.replace(/^(Der|Die|Das) (?:([a-zäöüß]+e) )?/, (_, art, adj) => `${{ Der: 'den', Die: 'die', Das: 'das' }[art]} ${adj ? adj + (art === 'Der' ? 'n ' : ' ') : ''}`);
  const midName = (n) => n.replace(/^(Der|Die|Das) /, (a) => a.toLowerCase());
  const turmEliteText = (x) => `Das Elitemonster 🛡️ schützt alle Monster hinter sich auf seinem Weg. Erst wenn ${midName(x.name)} besiegt ist, kommst du an sie heran.`;
  const turmBlocked = (by) => `Erst ${accName(by)} besiegen.`;
  // the warning for monsters that reach the tower in the next step (TW.threats): card line and the hint under the board
  const turmGateLine = (x) => (x.boss ? 'Schlägt gleich wieder zu!' : 'Gleich am Turm!');
  const turmGateText = (xs) => !xs.length ? '' : `Achtung! ${xs.length > 2 ? `${xs.length} Monster` : xs.map((x, i) => (i ? midName(x.name) : x.name)).join(' und ')} ${xs.length > 1 ? 'sind' : 'ist'} gleich am Turm.`;
  // stage names change only for some heroes, so the new name is said only when there is one (never „wird zu …“)
  function turmEvoText(evo) {
    const N = turmHero().names, a = N[evo - 1], b = N[evo];
    return `${a} bekommt eine neue Gestalt${a !== b ? ` und heißt jetzt ${midName(b)}` : ''}. Jede Attacke macht ${TW.HERO_EVO} Schaden mehr.`;
  }
  const laneName = (i) => { const L = run.turm.lanes, s = L[i].subject, same = L.filter((l) => l.subject === s); return same.length > 1 ? `${s} ${same.indexOf(L[i]) + 1}` : s; };

  // start: a saved run first, else subjects and hero
  function screenTurm() {
    depth = 1; run = null;
    const r = loadTurm();
    if (!r) return screenTurmNew();
    const t = r.turm, h = r.hero, W = TW.WAVES.length;
    const state = t.phase === 'fallen' ? 'Der Turm ist gefallen.' : t.phase === 'won' ? 'Alle Wellen sind vorbei.' : t.phase === 'build' || t.phase === 'reward' ? `Bauzeit nach Welle ${t.wave} von ${W}` : `Welle ${t.wave} von ${W}`;
    render(`<div class="screen">${topbar('🏰 Turmwacht')}<div class="scroll"><div class="card center tw-saved"><h2>Deine Turmwacht läuft</h2>${heroSVG(turmHero(h), h.evo)}<p>${state}<br>❤️ ${h.hp} / ${h.maxHp}</p><p class="pnote">${[...new Set(t.lanes.map((l) => l.subject))].map((s) => `${SUBJECTS[s]} ${esc(s)}`).join(' · ')}</p>${meta.turm.best ? `<p>Rekord: Welle ${meta.turm.best}</p>` : ''}</div></div>
      <div class="bottom"><div class="stack"><button class="btn" id="cont">Weiter (${r.grade !== curGrade().grade ? `Klasse ${r.grade}, ` : ''}Welle ${t.wave})</button><div class="row"><button class="btn secondary" id="back">Zurück</button><button class="btn secondary" id="new">Neu</button></div></div></div></div>`);
    $('#cont').onclick = () => { run = loadTurm(); if (run) resumeTurm(); else screenTurm(); };
    $('#new').onclick = () => confirmBox('Neue Turmwacht?', '<p>Deine laufende Turmwacht wird gelöscht, sobald du die neue startest.</p>', 'Ja, neu anfangen', screenTurmNew);
    $('#back').onclick = screenTitle;
  }
  function screenTurmNew() {
    depth = 1; run = null;
    const grade = curGrade().grade, saved = !!loadTurm();
    const subs = visSubjects().filter((s) => turmSources(s.subject, grade).length);
    if (!subs.length) return screenTitle();
    const fixed = ((meta.turm.subjects || {})[grade] || []).filter((x) => subs.some((s) => s.subject === x));
    // the weakest subjects first: lowest share right, then least practised
    const weak = subs.map((s) => turmSubjAcc(s.subject, grade)).sort((a, b) => a.acc - b.acc || a.t - b.t).slice(0, 3);
    const tip = weak.filter((x) => x.t > 0).map((x) => x.subject);
    let sel = fixed.length ? fixed : weak.map((x) => x.subject);
    const heroes = turmHeroes(grade); let hero = heroes[0];
    const subj = (s, fix) => `<${fix ? 'div' : 'button'} class="tw-subj${fix ? ' on fixed' : ''}" data-subj="${esc(s.subject)}"${fix ? '' : ' aria-pressed="false"'}><span class="ic" aria-hidden="true">${s.icon}</span><span class="nm">${esc(s.subject)}${!fix && tip.includes(s.subject) ? '<small>Hier kannst du stärker werden</small>' : ''}</span>${fix ? '' : '<span class="tick" aria-hidden="true">✓</span>'}</${fix ? 'div' : 'button'}>`;
    render(`<div class="screen">${topbar('🏰 Turmwacht')}<div class="scroll"><div class="stack">
      <p class="center tw-lead">Monster laufen auf den Wissensturm zu. Jede richtige Antwort trifft eins.</p>
      <div class="card"><h3>Fächer</h3>${fixed.length ? `<p class="pnote">Diese Fächer haben deine Eltern ausgewählt.</p><div class="tw-subjs">${subs.filter((s) => fixed.includes(s.subject)).map((s) => subj(s, true)).join('')}</div>`
        : `<p class="pnote" id="subnote" aria-live="polite">Wähle ein bis drei Fächer. Jedes Fach bekommt einen eigenen Weg.</p><div class="tw-subjs">${subs.map((s) => subj(s)).join('')}</div>`}<p class="pnote tw-review">Gefragt wird, was du schon geübt hast. Ein neues Fach beginnt mit seinem ersten Thema.</p></div>
      <div class="card"><h3>Dein Held</h3><div class="tw-heroes">${heroes.map((h, i) => `<button class="tw-hero" data-h="${i}" aria-pressed="false">${heroSVG(h.s, 0)}<span>${esc(h.s.names[0])}</span></button>`).join('')}</div><div id="evo"></div></div>
      </div></div><div class="bottom"><div class="row"><button class="btn secondary" id="back">Zurück</button><button class="btn" id="go">Start</button></div></div></div>`);
    const paint = () => {
      app.querySelectorAll('button[data-subj]').forEach((b) => { const on = sel.includes(b.dataset.subj); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      app.querySelectorAll('[data-h]').forEach((b) => { const on = heroes[+b.dataset.h] === hero; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      $('#evo').innerHTML = `<div class="tw-stages" aria-hidden="true">${[0, 1, 2].map((e) => heroSVG(hero.s, e)).join('')}</div><p class="pnote center">${esc(hero.s.names[0])} bekommt nach jedem Boss eine neue Gestalt.</p>`;
      $('#go').disabled = !sel.length;
    };
    app.querySelectorAll('button[data-subj]').forEach((b) => { b.onclick = () => {
      const s = b.dataset.subj;
      if (sel.includes(s)) sel = sel.filter((x) => x !== s);
      else if (sel.length < 3) sel = sel.concat(s);
      else { $('#subnote').textContent = 'Höchstens drei Fächer. Tippe erst eins weg.'; return; }
      paint();
    }; });
    app.querySelectorAll('[data-h]').forEach((b) => { b.onclick = () => { hero = heroes[+b.dataset.h]; paint(); }; });
    $('#back').onclick = () => (saved ? screenTurm() : screenTitle());
    $('#go').onclick = () => {
      if (!sel.length) return;
      startTurm(subs.map((s) => s.subject).filter((s) => sel.includes(s)), { m: hero.m, id: hero.s.id });
      turmSel = null; screenTurmBoard({ ev: [{ t: 'wave', wave: 1 }].concat(run.turm.monsters.map((x) => ({ t: 'enter', id: x.id, lane: x.lane, cell: x.cell }))) });
    };
    paint();
  }
  // resume exactly where it stopped: the saved question, the monsters' step after an answer, or the screen of the phase
  function resumeTurm() {
    turmSel = null; turmMode = null; const t = run.turm;
    if (t.phase === 'task') { const names = turmNames(); screenTurmBoard(); return turmTask(turmAsk(), names); }
    if (t.phase === 'step') { const names = turmNames(); return screenTurmBoard({ ev: turmStep(), names }); }
    screenTurmBoard({ lines: ['Die Turmwacht geht weiter.'], quiet: true });
  }

  /* the board: an illustrated scene (TWART) with the Wissensturm in the middle and up to three paths to its gate.
     Everything is placed in board units (--x/--y of TWART.geo); CSS turns them into percentages of the board. */
  let turmSel = null; // id of the monster whose card is open
  let turmLost = 0; // ❤️ the tower lost in the turn on screen: stays marked at the tower until the next action
  const turmTop = () => { const t = run.turm, n = t.monsters.length + t.queue.length; return topbar(`🏰 Welle ${t.wave}/${TW.WAVES.length}`, `<div class="world tw-res">${n && t.phase !== 'build' ? `<span class="tw-left">Noch ${n} Monster</span>` : ''}<span class="tw-bricks" aria-label="${t.ziegel} Ziegel">🧱 <b>${t.ziegel}</b></span></div>`); };
  function turmMonLabel(x) {
    const t = run.turm;
    return [x.name, `Weg ${laneName(x.lane)}`, `noch ${x.cell} ${x.cell === 1 ? 'Feld' : 'Felder'} bis zum Turm`, TW.threats(run).includes(x.id) && (x.boss ? 'schlägt gleich wieder zu' : 'gleich am Turm'), `${x.hp} Lebenspunkte`, t.weak === x.id && 'doppelte Ziegel', x.again && 'Aufgabe von vorhin', !TW.canTarget(run, x.id) && 'geschützt', x.fresh && 'neu im Monsterbuch'].filter(Boolean).join(', ');
  }
  // a monster faces the gate: the plain sprite looks right, the mirrored enemy sprite (flipped back by CSS) looks left
  function turmMon(x, cols, right, ghost) {
    const t = run.turm, sel = x.id === turmSel, pct = Math.max(4, (x.hp / x.maxHp) * 100), free = ghost || TW.canTarget(run, x.id);
    const threat = !ghost && TW.threats(run).includes(x.id);
    const tags = [threat && '⚠️', t.weak === x.id && '🎯', x.again && '🔁'].filter(Boolean).map((e) => `<i>${e}</i>`).join('');
    const ring = x.final ? TWART.shields(x.shields.map((l) => cols[l]), Math.round(x.maxHp / x.part) - x.shields.length) : '';
    // guided wave 1: the first monster is marked until it is tapped
    const guide = t.wave === 1 && t.turn === 0 && turmSel === null && t.phase === 'choose';
    return `<button class="tw-mon${sel ? ' sel' : ''}${free ? '' : ' guarded'}${t.weak === x.id ? ' weak' : ''}${right ? ' r' : ''}${x.boss || x.elite ? ' big' : ''}${guide ? ' guide' : ''}${threat ? ' threat' : ''}" data-id="${x.id}" aria-pressed="${sel}" aria-label="${esc(turmMonLabel(x))}">${monsterSVG(x.shape, TYPES[x.type].color, 0, right ? '' : 'enemy', { elite: x.elite, boss: x.boss })}${ring}${free ? '' : TWART.bubble()}` +
      `<span class="tw-stat">${x.steps > 1 || x.stun ? TWART.feet(x.steps, x.stun) : ''}<i class="tw-hp"><b class="${pct < 30 ? 'low' : pct < 60 ? 'mid' : ''}" style="width:${pct}%"></b></i></span>${tags ? `<span class="tw-tags" aria-hidden="true">${tags}</span>` : ''}</button>`;
  }
  // guards: the three typed starters or a boss from the Monsterbuch (look = its shape)
  const GUARD_LOOK = { fuchs: ['fox', 'feuer'], kroete: ['toad', 'wasser'], baer: ['bear', 'pflanze'] };
  const turmGuardSVG = (g) => { const [shape, type] = GUARD_LOOK[g.look] || [g.look, g.type in TYPES ? g.type : 'normal']; return monsterSVG(shape, TYPES[type].color, 0, '', { boss: !GUARD_LOOK[g.look] }); };
  // outro: the last turn of a wave on the board, without the Bauzeit marks
  function turmBoardHtml(outro) {
    const t = run.turm, h = run.hero, G = TWART.geo(t.lanes.length), cols = TWART.laneColors(t.lanes), pct = (h.hp / h.maxHp) * 100, build = t.phase === 'build' && !outro;
    const at = ([x, y]) => `--x:${x};--y:${y}`, pv = build && TW.preview(run, turmCtx(run.hero));
    const pick = (gd) => build && (turmMode === 'guard' || (turmMode === 'up' && gd && gd.lvl < TW.GUARD_DMG.length));
    const tw = TWART.tower(t.floors, h.hp, h.maxHp);
    const lanes = G.lanes.slice(0, t.lanes.length).map((g, i) => {
      const [hx, hy, side] = g.head;
      const cells = g.cells.map((c, k) => { const x = t.monsters.find((y) => y.lane === i && y.cell === k + 1); return `<div class="tw-cell" data-lane="${i}" data-cell="${k + 1}" style="${at(c)}">${x ? turmMon(x, cols, c[0] < G.gate[0] - 4) : ''}</div>`; }).join('');
      const spots = g.spots.map((p, s) => { const gd = t.guards[i + ':' + s], tag = pick(gd) ? 'button' : 'div';
        return `<${tag} class="tw-spot${gd ? ' on' : ''}${tag === 'button' ? ' pick' : ''}" data-lane="${i}" data-spot="${s}" style="${at(p)}"${tag === 'button' ? ` aria-label="${esc(`Wachplatz ${s + 1} am Weg ${laneName(i)}: ${gd ? `Wache Stufe ${gd.lvl}` : 'frei'}`)}"` : ' aria-hidden="true"'}>${gd ? `${turmGuardSVG(gd)}${TWART.pips(gd.lvl)}` : ''}</${tag}>`; }).join('');
      return `<div class="tw-lane" data-lane="${i}" role="group" aria-label="Weg ${esc(laneName(i))}" style="--c:${cols[i]}"><div class="tw-lanehead ${side}" style="${at([hx, hy])}"><span class="nm">${SUBJECTS[t.lanes[i].subject]} ${esc(laneName(i))}</span>${pv ? turmComing(pv[i]) : ''}</div>${spots}${cells}</div>`;
    }).join('');
    return `<div class="tw-board">${TWART.scene(t.lanes)}
      <div class="tw-tower" id="twt" style="--x:${G.gate[0]};--y:${G.gate[1] + 8};--th:${tw.h};--feet:${tw.feet}" data-floors="${t.floors.length}">${tw.back}<div class="tw-heroslot">${heroSVG(turmHero(), h.evo)}</div>${tw.front}</div>
      ${lanes}
      <div class="tw-hpbox ${G.hp[2]}${turmLost ? ' hurt' : ''}" style="${at(G.hp)}"><span class="hptext" aria-label="Turm: ${h.hp} von ${h.maxHp} Lebenspunkten">Turm ❤️ <b>${h.hp}</b>${run.shield ? ' 🛡️' : ''}${turmLost ? `<em class="tw-lost">−${turmLost}</em>` : ''}</span><span class="hpbar" aria-hidden="true"><i class="${turmBar(pct)}" style="width:${pct}%"></i></span></div>
      <div class="tw-fx" aria-hidden="true"><svg viewBox="0 0 ${G.w} ${G.h}" preserveAspectRatio="none"></svg></div></div>`;
  }
  const turmBar = (pct) => (pct < 30 ? 'low' : pct < 60 ? 'mid' : '');
  // o: { ev: engine events to show, names: id → { name, acc, x } from before the answer, lines: extra log lines first, quiet: no auto-reading }
  // o.still: the same screen again (a Bauzeit card was tapped), without the enter animation; o.bau: what was just bought (motion)
  function screenTurmBoard(o = {}) {
    depth = 2; const t = run.turm;
    const end = t.phase === 'fallen' || t.phase === 'won', next = end ? () => screenTurmEnd(o) : () => screenTurmCleared(o);
    const outro = o.ev && o.ev.some((e) => e.t === 'cleared' || e.t === 'fallen');
    // the wave's last turn plays on the board first; without motion the next screen comes at once
    if ((end || t.phase === 'reward' || outro) && !(outro && turmMotion(true))) return next();
    if (!t.monsters.some((x) => x.id === turmSel)) turmSel = null;
    if (t.phase !== 'build' || outro) turmMode = null;
    turmLost = (o.ev || []).reduce((a, e) => a + (e.t === 'tower' ? e.dmg : 0), 0);
    document.querySelectorAll('.floatnum').forEach((f) => f.remove()); // numbers of the turn before don't hang over this one
    const L = o.ev ? turmLines(o.ev, o.names || {}) : { hits: [], key: [], all: [] }, own = o.lines || [];
    const hurt = L.hits.join(' '), rest = own.concat(L.key).join(' '), text = own.concat(L.all).join(' ');
    render(`<div class="screen tw-screen">${turmTop()}<div class="tw-main" style="--W:${TWART.geo(t.lanes.length).w};--H:${TWART.geo(t.lanes.length).h}">${turmBoardHtml(outro)}</div>${hurt || rest ? `<div class="log tw-log${hurt ? ' hurt' : ''}">${hurt ? `<p class="tw-hurtline">${esc(hurt)}</p>` : ''}${rest ? `<p>${esc(rest)}</p>` : ''}</div>` : ''}<div class="taskwrap" id="taskwrap"></div><div class="bottom tw-panel" id="bottom"></div></div>`, !!o.ev || !!o.still);
    backTo = turmMode ? () => { turmMode = null; screenTurmBoard({ still: true }); } : () => turmLeave(screenTurm);
    if (t.phase === 'build' && !outro) $('.tw-screen').classList.add('build');
    if (text) announce(text);
    if (hurt || rest) { const vis = joined(hurt, rest); speakBtn($('.tw-log'), 'afterbegin', () => vis, o.quiet ? null : () => vis, [], run.grade); }
    turmBind();
    const bauTut = t.phase === 'build' && !outro && !meta.seenTut['turm:bau'];
    if (outro) $('#bottom').innerHTML = '<button class="btn" id="twon">Weiter</button>';
    else turmPanel(t.phase === 'build' && !hurt && !rest && !o.still && !bauTut);
    const big = o.ev && o.ev.find((e) => e.t === 'enter' && (e.boss || e.elite)), bx = big && t.monsters.find((x) => x.id === big.id);
    const intro = t.phase === 'choose' && !meta.seenTut['turm:intro'];
    const hitTut = turmLost && !outro && !meta.seenTut['turm:hit'] ? () => turmHitTut(o) : null;
    if (o.ev && !intro && turmMotion()) turmPlay(o, outro ? next : bx ? () => turmBanner(bx, true) : hitTut);
    else if (o.ev) turmFx(o.ev);
    if (o.bau) turmBuilt(o.bau);
    if (intro) turmIntro();
    else if (bauTut) turmBauTut();
    else if (bx && !$('.tw-screen.playing')) turmBanner(bx);
    else if (hitTut && !$('.tw-screen.playing')) hitTut();
  }
  const turmBind = () => app.querySelectorAll('button.tw-mon').forEach((b) => { b.onclick = () => { turmSel = +b.dataset.id; turmPick(); }; });
  function turmPick() {
    app.querySelectorAll('.tw-mon').forEach((b) => { const on = +b.dataset.id === turmSel; b.classList.toggle('sel', on); b.classList.remove('guide'); b.setAttribute('aria-pressed', on); });
    turmPanel(true);
  }
  // the panel under the board: monster card, hint or Bauzeit
  function turmPanel(say) {
    const t = run.turm, bot = $('#bottom'), x = t.phase === 'choose' && t.monsters.find((y) => y.id === turmSel);
    $('.tw-screen').classList.toggle('carded', !!x);
    const row = (main) => `<div class="row tw-baurow"><button class="btn secondary small" id="bag" aria-label="Beutel, ${run.items.length}">🎒 ${run.items.length}</button><button class="btn ghost small" id="home">Titel</button>${main}</div>`;
    if (t.phase === 'build') return turmBau(bot, say);
    if (!x) {
      const warn = turmGateText(t.monsters.filter((y) => TW.threats(run).includes(y.id)));
      const hint = warn ? `⚠️ ${warn}` : t.turn === 0 && t.wave === 1 ? 'Tippe auf das Monster auf dem Weg.' : 'Tippe auf ein Monster.';
      bot.innerHTML = row(`<p class="tw-hint${warn ? ' warn' : ''}">${hint}</p>`);
    } else {
      const c = TW.card(run, x.id, turmCtx(run.hero)), M = MODES[x.m], by = c.blockedBy && t.monsters.find((y) => y.id === c.blockedBy), cols = TWART.laneColors(t.lanes);
      const gate = TW.threats(run).includes(x.id) && turmGateLine(x);
      // only what changes the child's choice: the warning, the double Ziegel, a question from before, how a special monster behaves
      const tags = [gate && `<span class="tag gate">⚠️ ${gate}</span>`, c.weak && '<span class="tag weak">🎯 Doppelte Ziegel</span>', c.again && '<span class="tag again">🔁 Aufgabe von vorhin</span>', run.power && '<span class="tag power">🌶️ Doppelter Schaden</span>',
        x.boss && '<span class="tag boss">👑 Boss: langsam, aber stark</span>', x.elite && '<span class="tag elite">🛡️ schützt die Monster hinter sich</span>', x.steps > 1 && '<span class="tag boss">👣 Schnell: 2 Felder auf einmal</span>'].filter(Boolean).join('');
      // the final boss: which subject the question comes from now, and how many shields are left
      const sh = x.final && x.shields[0], shield = x.final ? `<p class="tw-shieldnow"><i class="dot" style="background:${cols[sh]}" aria-hidden="true"></i><span>Die Aufgabe kommt aus ${SUBJECTS[t.lanes[sh].subject]} ${esc(laneName(sh))}. ${x.shields.length === 1 ? 'Das ist der letzte Schild.' : `Noch ${x.shields.length} Schilde.`}</span></p>` : '';
      bot.innerHTML = `<div class="card tw-card" id="twcard"><div class="tw-cardhead">${monsterSVG(x.shape, TYPES[x.type].color, 0, 'enemy', { elite: x.elite, boss: x.boss })}<div class="tw-cardinfo"><div class="tw-namerow"><div class="name">${esc(x.name)}</div><span class="tw-cardhp" aria-label="${x.hp} von ${x.maxHp} Lebenspunkten">❤️ ${x.hp}</span></div><div class="tw-from">Aufgabe aus: ${M.icon} ${esc(M.title)}</div></div></div>
        ${tags ? `<div class="tags">${tags}</div>` : ''}${shield}${by ? `<p class="tw-guard">${esc(turmBlocked(by))}</p>` : ''}</div>${row(`<button class="btn" id="atk"${by ? ' disabled' : ''}>Angreifen</button>`)}`;
      const said = () => joined(x.name, 'Aufgabe aus: ' + M.title, `${x.hp} Lebenspunkte`, gate, c.weak && 'Doppelte Ziegel', c.again && 'Aufgabe von vorhin', x.boss && 'Boss: langsam, aber stark', x.steps > 1 && 'schnell', x.final && `Die Aufgabe kommt aus ${laneName(sh)}`, by && turmBlocked(by));
      speakBtn($('.tw-cardinfo .name', bot), 'beforeend', said, say ? said : null, [], run.grade);
      if (by) { const b = $(`.tw-mon[data-id="${x.id}"] .tw-bubble`); if (b) { b.classList.remove('flash'); void b.getBoundingClientRect(); b.classList.add('flash'); } }
    }
    const on = (s, f) => { const el = $(s, bot); if (el) el.onclick = f; };
    on('#atk', () => { const names = turmNames(), task = turmAsk(turmSel); if (task) turmTask(task, names); });
    on('#bag', turmBag);
    on('#home', () => turmLeave(screenTitle));
  }
  /* Bauzeit: cards under the board; a guard card waits for a spot on the board, then for the guard's look */
  let turmMode = null; // 'guard' | 'up' while a card waits for a spot (not saved: a reload shows the cards again)
  const FLOOR_FX = { chain: 'trifft auch das vorderste Monster auf einem anderen Weg.', stun: 'Das Monster bleibt einen Zug stehen.', repair: `Der Turm bekommt ${TW.REPAIR_HP} ❤️.`,
    brick: '1 🧱 mehr.', push: 'Das vorderste Monster geht ein Feld zurück.', volley: 'Die Wachen schießen zweimal.' };
  // the coming wave on a path's name chip
  function turmComing(p) {
    if (!p.n) return '';
    const said = `Nächste Welle: ${p.n} Monster${p.final ? ', der letzte Boss' : p.boss ? ', ein Boss' : ''}${p.elite ? ', ein Elitemonster' : ''}${p.fast ? `, ${p.fast} schnell` : ''}`;
    return `<span class="tw-queue tw-coming" aria-label="${said}">${p.n} ${p.n === 1 ? 'kommt' : 'kommen'}${p.boss || p.final ? ' 👑' : ''}${p.elite ? ' 🛡️' : ''}${p.fast ? ' 👣' : ''}</span>`;
  }
  function turmComingText() {
    const pv = TW.preview(run, turmCtx(run.hero)), n = pv.reduce((a, p) => a + p.n, 0);
    const extra = pv.some((p) => p.final) ? ', darunter der letzte Boss' : pv.some((p) => p.boss) ? ', darunter ein Boss' : pv.some((p) => p.elite) ? ', darunter ein Elitemonster' : '';
    return `Welle ${run.turm.wave + 1} von ${TW.WAVES.length}: ${n} Monster${extra}.`;
  }
  // every card with its price (null: nothing to pay) and why it can't be used now
  function turmCards() {
    const t = run.turm, G = Object.values(t.guards), ups = G.filter((g) => g.lvl < TW.GUARD_DMG.length), free = TW.price(run, { kind: 'guard', lane: 0, spot: 0 }) === 0;
    const upP = [...new Set(ups.map((g) => TW.COST.up[g.lvl - 1]))].sort((a, b) => a - b);
    const full = G.length === t.lanes.length * TW.SPOTS;
    const cards = [{ id: 'guard', name: 'Wache aufstellen', pic: 'guard', price: free ? 0 : TW.COST.guard, desc: 'Die Wache schießt mit, wenn du auf ihrem Weg richtig antwortest.', note: full ? 'Alle Plätze sind besetzt. Eine neue Wache ersetzt eine alte.' : '' },
      { id: 'up', name: 'Wache verbessern', pic: 'up', price: upP[0] ?? TW.COST.up[0], label: upP.length > 1 ? upP.join(' / ') : null, desc: 'Die Wache trifft stärker.', why: !G.length ? 'Stell zuerst eine Wache auf.' : !ups.length ? 'Alle Wachen haben Stufe 3.' : '' }]
      .concat([...new Set(t.lanes.map((l) => l.subject))].map((s) => ({ id: 'floor:' + s, name: TWART.ROOMS[s].name, pic: s, price: TW.COST.floor, desc: `Richtig in ${s}: ${FLOOR_FX[TW.FLOORS[s]]}`, why: t.floors.includes(s) ? 'Schon gebaut.' : '' })))
      .concat({ id: 'fix', name: 'Mauer flicken', pic: 'fix', price: TW.COST.fix, desc: `Der Turm bekommt ${TW.FIX_HP} ❤️.`, why: run.hero.hp >= run.hero.maxHp ? 'Der Turm ist heil.' : '' });
    for (const c of cards) c.short = c.why ? 0 : Math.max(0, c.price - t.ziegel);
    return cards;
  }
  function turmBau(bot, say) {
    const t = run.turm, home = () => turmLeave(screenTitle);
    if (turmMode) {
      const text = turmMode === 'guard' ? `Tippe auf einen Platz am Weg.${Object.keys(t.guards).length ? ' Steht dort schon eine Wache, wird sie ersetzt.' : ''}` : 'Tippe auf die Wache, die stärker werden soll.';
      bot.innerHTML = `<div class="card tw-card tw-pickhint"><p>${text}</p><p class="tw-bmsg" role="status"></p><button class="btn secondary" id="pickno">Zurück</button></div>`;
      speakBtn($('.tw-pickhint p'), 'beforeend', () => text, () => text, [], run.grade);
      $('#pickno', bot).onclick = backTo;
      app.querySelectorAll('button.tw-spot').forEach((b) => { b.onclick = () => turmSpot(+b.dataset.lane, +b.dataset.spot); });
      return;
    }
    const cards = turmCards(), coming = turmComingText();
    bot.innerHTML = `<div class="tw-bau"><div class="tw-bauhead"><h3>Bauzeit</h3><p>${coming}</p></div>
      <div class="tw-cards" role="list">${cards.map((c) => `<div role="listitem"><button class="tw-buy${c.why ? ' off' : c.short ? ' short' : ''}" data-card="${esc(c.id)}" aria-disabled="${!!(c.why || c.short)}">${TWART.picture(c.pic)}<b>${esc(c.name)}</b><span class="tw-price${c.why ? ' done' : ''}">${c.why ? '' : c.short ? `Noch ${c.short} 🧱` : c.price ? `${c.label || c.price} 🧱` : 'geschenkt'}</span></button></div>`).join('')}</div>
      <div class="row tw-baurow"><button class="btn secondary small" id="bag" aria-label="Beutel, ${run.items.length}">🎒 ${run.items.length}</button><button class="btn ghost small" id="home">Titel</button><button class="btn" id="nextwave">Welle ${t.wave + 1} starten</button></div></div>`;
    const said = () => joined('Bauzeit', coming, ...cards.map((c) => joined(c.name, c.why || (c.price ? `${c.label || c.price} Ziegel` : 'geschenkt'))));
    speakBtn($('.tw-bauhead h3'), 'beforeend', said, say ? said : null, [], run.grade);
    bot.querySelectorAll('[data-card]').forEach((b) => { b.onclick = () => turmSheet(cards.find((x) => x.id === b.dataset.card)); });
    $('#bag', bot).onclick = turmBag; $('#home', bot).onclick = home;
    $('#nextwave', bot).onclick = () => { const names = turmNames(), ev = turmNextWave(); screenTurmBoard({ ev, names }); };
  }
  function turmSheet(c) {
    const t = run.turm, pick = c.id === 'guard' || c.id === 'up', no = c.why || (c.short ? `Dafür fehlen dir noch ${c.short} Ziegel.` : '');
    const cost = no ? '' : !c.price ? 'Die erste Wache ist geschenkt.' : pick && c.label ? `Kostet ${c.label} 🧱, je nach Stufe.` : `Kostet ${c.price} 🧱. Danach hast du noch ${t.ziegel - c.price} 🧱.`;
    const text = [c.desc, c.note, cost].filter(Boolean).join(' ');
    const ov = modal(`<div class="tw-sheet">${TWART.picture(c.pic)}<h2>${esc(c.name)}</h2><p>${esc(text)}</p><p class="tw-bmsg" role="status">${esc(no)}</p></div><div class="row"><button class="btn secondary" id="no">Zurück</button><button class="btn" id="build"${no ? ' disabled' : ''}>${pick ? 'Platz aussuchen' : 'Bauen'}</button></div>`);
    const said = () => joined(c.name, text, no);
    speakBtn($('h2', ov), 'beforeend', said, said, [], run.grade);
    $('#no', ov).onclick = () => ov.remove();
    $('#build', ov).onclick = () => {
      ov.remove();
      if (pick) { turmMode = c.id; return screenTurmBoard({ still: true }); }
      if (c.id === 'fix') { const hp = run.hero.hp; if (turmBuy({ kind: 'fix' })) screenTurmBoard({ still: true, bau: { fix: hp }, lines: [`Die Mauer ist geflickt: ❤️ ${run.hero.hp} / ${run.hero.maxHp}.`] }); return; }
      const sub = c.id.slice(6);
      if (turmBuy({ kind: 'floor', subject: sub })) { SFX.levelup(); screenTurmBoard({ still: true, bau: { floor: sub }, lines: [`${TWART.ROOMS[sub].name} ist fertig. ${c.desc}`] }); }
    };
  }
  function turmSpot(lane, spot) {
    const t = run.turm, k = lane + ':' + spot, g = t.guards[k];
    if (turmMode === 'guard') return turmLooks(lane, spot);
    const p = TW.price(run, { kind: 'up', lane, spot });
    if (p < 0) return;
    if (p > t.ziegel) { $('.tw-bmsg').textContent = `Dafür fehlen dir noch ${p - t.ziegel} Ziegel.`; return; }
    turmBuy({ kind: 'up', lane, spot }); turmMode = null;
    screenTurmBoard({ still: true, bau: { up: k }, lines: [`Die Wache am Weg ${laneName(lane)} ist jetzt auf Stufe ${g.lvl}.`] });
  }
  // the three typed guards, and the bosses of this grade from the Monsterbuch as normal-type guards
  function turmGuardLooks() {
    const typed = Object.entries(GUARD_LOOK).map(([look, [, type]]) => ({ look, type, name: MQ.STARTERS.find((s) => s.id === look).names[0] }));
    const isBoss = (m, name) => Object.values(MODES[m].enemies).some((w) => isObj(w) && w.boss && w.boss.name === name);
    const bosses = Object.entries(meta.dex).filter(([name, e]) => isObj(e) && typeof e.shape === 'string' && own(MODES, e.mode) && MODES[e.mode].grade === run.grade && isBoss(e.mode, name))
      .map(([name, e]) => ({ look: e.shape, type: 'normal', name })).filter((x, i, a) => !GUARD_LOOK[x.look] && a.findIndex((y) => y.look === x.look) === i);
    return typed.concat(bosses);
  }
  function turmLooks(lane, spot) {
    const t = run.turm, p = TW.price(run, { kind: 'guard', lane, spot }), old = t.guards[lane + ':' + spot], looks = turmGuardLooks();
    const head = `Wache am Weg ${laneName(lane)}. ${p ? `Kostet ${p} 🧱.` : 'Die erste Wache ist geschenkt.'}${old ? ' Die Wache auf diesem Platz geht dafür weg.' : ''}`;
    const ov = modal(`<h2>Welche Wache?</h2><p class="pnote">${esc(head)}</p><div class="tw-looks">${looks.map((x, i) => `<button class="choice tw-look" data-l="${i}">${turmGuardSVG({ look: x.look, type: x.type })}<span class="name">${esc(x.name)}</span></button>`).join('')}</div><button class="btn secondary" id="no">Zurück</button>`);
    const said = () => joined('Welche Wache', head, ...looks.map((x) => x.name));
    speakBtn($('h2', ov), 'beforeend', said, said, [], run.grade);
    $('#no', ov).onclick = () => ov.remove();
    ov.querySelectorAll('[data-l]').forEach((b) => { b.onclick = () => {
      const x = looks[+b.dataset.l]; ov.remove();
      if (!turmBuy({ kind: 'guard', lane, spot, look: x.look, type: x.type })) return;
      turmMode = null;
      screenTurmBoard({ still: true, bau: { guard: lane + ':' + spot }, lines: [GUARD_LOOK[x.look] ? `${x.name} steht jetzt am Weg ${laneName(lane)}.` : `${x.name} hilft dir jetzt.`] });
    }; });
  }
  function turmBauTut() {
    const steps = ['Mit Ziegeln 🧱 machst du den Turm stärker. Die erste Wache ist geschenkt.', 'Eine Wache hilft dir auf ihrem Weg.', `Bist du fertig, tippe auf „Welle ${run.turm.wave + 1} starten“.`];
    const ov = modal(`<h2>🧱 Bauzeit</h2><ol>${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol><button class="btn" id="tutok" style="margin-top:12px">Verstanden</button>`);
    speakBtn($('h2', ov), 'afterbegin', () => joined(...steps), undefined, [], run.grade);
    $('#tutok', ov).focus({ preventScroll: true }); $('#tutok', ov).onclick = () => { ov.remove(); meta.seenTut['turm:bau'] = true; saveAll(); };
  }
  // after the wave-3 boss: half of the run is done, a good moment to stop
  function turmPause() {
    const text = 'Gute Stelle für eine Pause – alles ist gespeichert.';
    const ov = modal(`<p class="tw-pause">${text}</p><div class="row"><button class="btn secondary" id="ptitle">Zum Titel</button><button class="btn" id="tutok">Weiter</button></div>`);
    speakBtn($('.tw-pause', ov), 'beforeend', () => text, () => text, [], run.grade);
    $('#tutok', ov).focus({ preventScroll: true }); $('#tutok', ov).onclick = () => ov.remove();
    $('#ptitle', ov).onclick = () => { ov.remove(); turmLeave(screenTitle); };
  }
  // the normal task view; answered → the engine's events and the monsters' step are shown on the board
  function turmTask(task, names) {
    const a = run.turm.asking, x = run.turm.monsters.find((y) => y.id === a.id);
    $('.screen').classList.add('tasking'); $('#bottom').innerHTML = '';
    backTo = () => { }; // a question stays until it is answered
    const hint = !!run.hint; run.hint = false;
    let ev = [];
    ensureTutorial(task, () => runTask(task, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: x ? x.name : '', hint, onResult: (ok) => { ev = turmAnswer(ok); } },
      () => { turmSel = null; screenTurmBoard({ ev: ev.concat(turmStep()), names }); }));
  }
  function turmBag() {
    if (run.turm.phase !== 'choose') return showBag(null, Object.assign({ done: (it) => screenTurmBoard({ still: true, lines: [`${it.name} benutzt: Der Turm hat jetzt ${run.hero.hp} ❤️.`] }) }, TURM_BAG));
    // a potion takes the turn, like in a fight; the other items don't
    showBag((it) => {
      if (it.heal) { const hp = run.hero.hp, names = turmNames(); return screenTurmBoard({ lines: [`${it.name} benutzt: Der Turm hat jetzt ${hp} ❤️.`], ev: turmStep(), names }); }
      screenTurmBoard({ lines: [it.shield ? 'Der Schild hält das nächste Monster am Turm auf.' : it.power ? 'Dein nächster Treffer macht doppelten Schaden.' : 'Bei der nächsten Aufgabe gibt es einen Tipp.'] });
    }, TURM_BAG);
  }
  // the log under the board, one short sentence per thing that happened. names: id → { name, acc } from before the answer
  // → { hits: the tower's losses, key: what matters and is easy to miss, all: everything (for screen readers) }
  function turmLines(ev, names) {
    const t = run.turm, cur = turmNames(), who = (id) => names[id] || cur[id] || { name: 'Ein Monster', acc: 'ein Monster' };
    const n = (id) => who(id).name, acc = (id) => who(id).acc, all = [], key = [], L = { push: (s, k) => { all.push(s); if (k) key.push(s); } }, hits = [];
    let fresh = 0, z = 0;
    ev.forEach((e, i) => {
      const next = ev[i + 1], gone = next && next.t === 'beaten' && next.id === e.id;
      if (e.t === 'wave') L.push(`Welle ${e.wave} von ${TW.WAVES.length}.`);
      else if (e.t === 'wrong') L.push('Die Monster rücken vor.');
      else if (e.t === 'again' && t.wave < TW.WAVES.length && !meta.seenTut['turm:again']) { meta.seenTut['turm:again'] = true; L.push('🔁 Diese Aufgabe kommt in der nächsten Welle noch einmal.', true); }
      else if (e.t === 'hit') L.push(`${n(e.id)} bekommt ${e.dmg} Schaden${gone ? ' und ist besiegt' : ''}.`);
      else if (e.t === 'shot') {
        // the guards of a path fire one after another at the same monster: one sentence for all of them
        if (ev[i - 1] && ev[i - 1].t === 'shot' && ev[i - 1].id === e.id) return;
        let k = i, d = 0; while (ev[k] && ev[k].t === 'shot' && ev[k].id === e.id) d += ev[k++].dmg;
        L.push(`${k - i > 1 ? 'Die Wachen treffen' : 'Die Wache trifft'} ${acc(e.id)}: ${d} Schaden.`);
      } else if (e.t === 'chain') L.push(`Die Rechenstube trifft auch ${acc(e.id)}: ${e.dmg} Schaden.`, true);
      else if (e.t === 'beaten') { const p = ev[i - 1]; if (!(p && p.t === 'hit' && p.id === e.id)) L.push(`${n(e.id)} ist besiegt.`); }
      else if (e.t === 'shield') {
        const x = t.monsters.find((y) => y.id === e.id);
        L.push(`Der Schild für ${laneName(e.lane)} ist zerbrochen.${x ? ` Jetzt kommen die Aufgaben aus ${laneName(x.shields[0])}.` : ''}`, true);
      } else if (e.t === 'stun') L.push(`Die Druckerei hält ${acc(e.id)} kurz auf.`, true);
      else if (e.t === 'push') L.push(`Die Glockenstube schiebt ${acc(e.id)} ein Feld zurück.`, true);
      else if (e.t === 'floor' && e.fx === 'volley') L.push('Die Plauderstube: Die Wachen schießen noch einmal.', true);
      else if (e.t === 'heal') L.push(`Der Kartoffelkeller repariert den Turm: +${e.n} ❤️.`, true);
      else if (e.t === 'patch') L.push(`Nach der Welle wird die Mauer geflickt: +${e.n} ❤️.`, true);
      else if (e.t === 'tower') hits.push(`${n(e.id)} ist am Turm angekommen: −${e.dmg} ❤️.`);
      else if (e.t === 'hold') L.push(`${n(e.id)} kommt nicht durch die Mauer.`, true);
      else if (e.t === 'block') L.push(`${n(e.id)} prallt am Schild ab.`, true);
      else if (e.t === 'enter') { if (e.boss || e.elite) L.push(`${n(e.id)} kommt.`); else if (!ev.some((x) => x.t === 'wave')) fresh++; }
      else if (e.t === 'cleared') L.push(`Welle ${e.wave} ist vorbei.`);
      else if (e.t === 'ziegel') z += e.n;
    });
    if (fresh) L.push(fresh === 1 ? 'Ein neues Monster kommt.' : `${fresh} neue Monster kommen.`);
    // guided wave 1: the first step is explained once it has happened
    if (t.wave === 1 && t.turn === 1 && t.phase === 'choose' && ev.some((e) => e.t === 'move') && !ev.some((e) => e.t === 'wrong')) L.push('Nach jeder Aufgabe gehen die Monster ein Feld weiter.', true);
    if (z) L.push(`+${z} 🧱${ev.some((e) => e.t === 'ziegel' && e.why === 'weak') ? ', doppelt durch 🎯' : ''}.`);
    const seen = t.monsters.filter((x) => x.fresh).map((x) => midName(x.name));
    if (seen.length) L.push(`Neu im Monsterbuch: ${seen.join(', ')}.`);
    return { hits, key, all: hits.concat(all) };
  }
  /* Motion. The board is drawn in its final state first (saved, tappable, what screen readers and tests see); turmPlay then
     replays the turn on top of it in short beats. A tap on the board jumps to the end. Timers only touch a board that is still
     on screen and not covered by a task. Without layout (tests) or with „Bewegung reduzieren“ everything is shown at once. */
  let turmSpeed = null; // test hook: a number forces the motion, at that speed factor
  const turmMotion = () => turmSpeed != null || (!reducedMotion && app.clientWidth > 0);
  const TW_STEP = 300; // one field of walking, ms
  function turmPlay(o, after) {
    const t = run.turm, scr = $('.tw-screen'), board = $('.tw-board', scr), G = TWART.geo(t.lanes.length), cols = TWART.laneColors(t.lanes);
    const names = o.names || {}, ev = o.ev, k = turmSpeed || 1, timers = [], fx = $('.tw-fx', board), fsvg = $('svg', fx), flyers = [];
    const alive = () => board.isConnected && !scr.classList.contains('tasking');
    let stopped = false;
    const later = (ms, f) => timers.push(setTimeout(() => { if (!stopped && alive()) f(); }, ms * k));
    const at = (p) => `--x:${p[0]};--y:${p[1]}`;
    const add = (html, p, ms) => { const d = document.createElement('div'); d.className = 'tw-fxi'; d.setAttribute('style', at(p)); d.innerHTML = html; fx.appendChild(d); if (ms) later(ms, () => d.remove()); return d; };
    // numbers that pop at the same spot while earlier ones still show (hero, then guards) move aside instead of covering them
    const live = {}, SHIFT = [[0, 0], [26, -18], [-26, -30], [0, -44]];
    const num = (p, n, cls) => {
      const key = Math.round(p[0]) + ':' + Math.round(p[1]), i = live[key] = (live[key] || 0) + 1, [dx, dy] = SHIFT[(i - 1) % SHIFT.length];
      later(1000, () => { live[key]--; });
      return add(`<span class="tw-num ${cls || ''}">${n}</span>`, [p[0] + dx, p[1] - 14 + dy], 1000);
    };
    const again = (el, cls) => { if (!el) return; el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); };
    // a thrown thing: an arc from p to q (board units) with the Web Animations API; lands after ms
    const throwIt = (html, p, q, ms, h, spin) => {
      const d = add(html, p), u = board.clientWidth / G.w, dx = (q[0] - p[0]) * u, dy = (q[1] - p[1]) * u, up = h * u;
      if (d.animate) d.animate([0, 0.25, 0.5, 0.75, 1].map((f) => ({ translate: `${dx * f}px ${dy * f - up * 4 * f * (1 - f)}px`, rotate: spin ? `${spin * f}deg` : '0deg' })), { duration: ms * k, easing: 'linear', fill: 'forwards' });
      later(ms, () => d.remove());
      return d;
    };
    // where things are: monster bodies, the hero, the tower's rooms, the gate
    const cellP = (lane, c) => G.lanes[lane].cells[c - 1];
    const body = (p) => [p[0], p[1] - 20];
    const n = t.floors.length, top = G.gate[1] + 8 - TWART.towerH(n);
    const heroP = [G.gate[0] - 9, top + TWART.TOWER.TOP - 26], roomP = (s) => [G.gate[0], G.gate[1] - 69 - 38 * Math.max(0, t.floors.indexOf(s))];
    const towerP = [G.gate[0], G.gate[1] - 40];
    // every token: its element, the point it is anchored at and where it shows now
    const tok = {}, anchor = {}, cur = {};
    const place = (id, p, ms) => { const el = tok[id]; if (!el) return; const a = anchor[id]; el.style.transition = ms ? `translate ${ms * k}ms ease-in-out, opacity ${ms * k}ms` : 'none'; el.style.translate = `calc(${p[0] - a[0]} * var(--u)) calc(${p[1] - a[1]} * var(--u))`; cur[id] = p; };
    const pre = (id) => names[id] && names[id].x;
    board.querySelectorAll('button.tw-mon').forEach((b) => { const id = +b.dataset.id, x = t.monsters.find((y) => y.id === id); tok[id] = b; anchor[id] = cur[id] = cellP(x.lane, x.cell); });
    // beaten monsters and those that walked into the gate come back as ghosts where they stood
    for (const id of new Set(ev.filter((e) => e.t === 'beaten' || e.gone).map((e) => e.id))) {
      const x = pre(id); if (!x || !x.cell || tok[id]) continue;
      const c = cellP(x.lane, x.cell), cell = board.querySelector(`.tw-cell[data-lane="${x.lane}"][data-cell="${x.cell}"]`);
      cell.insertAdjacentHTML('beforeend', turmMon(x, cols, c[0] < G.gate[0] - 4, true).replace('<button class="tw-mon', '<div aria-hidden="true" class="tw-mon tw-ghost').replace(/<\/button>$/, '</div>'));
      tok[id] = cell.lastElementChild; anchor[id] = cur[id] = c;
    }
    // back to how it looked before the answer
    const entering = ev.filter((e) => e.t === 'enter');
    for (const id of Object.keys(tok)) {
      const x = pre(id), first = ev.find((e) => e.id === +id && (e.t === 'move' || e.t === 'push'));
      if (entering.some((e) => e.id === +id)) { const L = t.monsters.find((y) => y.id === +id).lane; place(id, G.lanes[L].from[0]); tok[id].style.opacity = 0; }
      else if (x && x.cell) place(id, cellP(x.lane, x.cell));
      else if (first) place(id, cellP(t.monsters.find((y) => y.id === +id).lane, first.from));
      const bar = $('.tw-hp b', tok[id]);
      if (x && bar && !tok[id].classList.contains('tw-ghost')) bar.style.width = Math.max(4, (x.hp / x.maxHp) * 100) + '%';
    }
    const res = (cls) => $(`.topbar .${cls} b`, scr), hpBox = $('.tw-hpbox', board), hpNow = $('.hptext b', hpBox), hpBar = $('.hpbar i', hpBox), twt = $('#twt', board);
    const setHp = (hp) => { const pct = (hp / run.hero.maxHp) * 100; hpNow.textContent = hp; hpBar.style.width = pct + '%'; hpBar.className = turmBar(pct); };
    const towerArt = (hp) => { const tw = TWART.tower(t.floors, hp, run.hero.maxHp); twt.querySelector('.tw-towerart').outerHTML = tw.back; twt.querySelector('.tw-parapet').outerHTML = tw.front; };
    const level = (hp) => (hp > (run.hero.maxHp * 2) / 3 ? 0 : hp > run.hero.maxHp / 3 ? 1 : 2);
    const hpEv = ev.find((e) => e.t === 'tower' || e.t === 'heal' || e.t === 'patch');
    let hp = hpEv ? (hpEv.t === 'tower' ? hpEv.hp + hpEv.dmg : hpEv.hp - hpEv.n) : run.hero.hp;
    if (hp !== run.hero.hp) { setHp(hp); if (level(hp) !== level(run.hero.hp)) towerArt(hp); }
    // the „−7“ at the tower's ❤️ counts up with each hit
    const lostEl = $('.tw-lost', hpBox); let lostNow = 0;
    const hurtLog = $('.tw-log.hurt', scr);
    const showLost = () => { if (!lostEl) return; lostEl.hidden = !lostNow; lostEl.textContent = '−' + lostNow; hpBox.classList.toggle('hurt', !!lostNow); if (hurtLog) hurtLog.style.visibility = lostNow ? '' : 'hidden'; };
    showLost();
    let bricks = t.ziegel - ev.filter((e) => e.t === 'ziegel').reduce((a, e) => a + e.n, 0);
    res('tw-bricks').textContent = bricks;
    const evo = ev.find((e) => e.t === 'evolve'), slot = $('.tw-heroslot', board);
    if (evo) slot.innerHTML = heroSVG(turmHero(), evo.evo - 1);
    const shieldEv = ev.find((e) => e.t === 'shield'), ringNow = shieldEv && tok[shieldEv.id] && $('.tw-shields', tok[shieldEv.id]);
    if (ringNow) { const x = pre(shieldEv.id); ringNow.insertAdjacentHTML('afterend', TWART.shields(x.shields.map((l) => cols[l]), Math.round(x.maxHp / x.part) - x.shields.length)); ringNow.hidden = true; }

    /* the beats: [ms until the next one, what happens] */
    const hit = (id, dmg, big, crit, hp1) => {
      const el = tok[id]; again(el, 'tw-hit'); num(body(cur[id] || [0, 0]), '−' + dmg, crit ? 'crit' : '');
      const x = pre(id), bar = el && $('.tw-hp b', el);
      if (bar && x) { const pct = Math.max(4, (Math.max(0, hp1) / x.maxHp) * 100); bar.style.width = pct + '%'; bar.className = pct < 30 ? 'low' : pct < 60 ? 'mid' : ''; }
      if (big) { add('<i class="tw-burst"></i>', body(cur[id]), 600); SFX.crit(); } else if (crit) SFX.crit(); else SFX.hit();
    };
    const heroType = TYPES[turmHero().type].color, B = [];
    const walk = (id, path, ms) => path.forEach((p, i) => later(i * ms, () => { place(id, p, ms); again(tok[id], 'tw-step'); }));
    const lastHit = {}; // who was hit last, so the Ziegel fly from there
    for (let i = 0; i < ev.length; i++) {
      const e = ev[i];
      if (e.t === 'hit') B.push([e.weak ? 520 : 450, () => {
        again(slot, 'tw-throw'); SFX.swish(); lastHit.p = body(cur[e.id]);
        throwIt(TWART.orb(heroType, e.weak), [heroP[0], heroP[1] - 6], body(cur[e.id]), 340, 34, 0);
        later(340, () => hit(e.id, e.dmg, e.weak, e.weak || e.strong, e.hp));
      }]);
      else if (e.t === 'shot') {
        const [L, sp] = e.from.split(':').map(Number), g = t.guards[e.from], p = G.lanes[L].spots[sp];
        B.push([ev[i + 1] && ev[i + 1].t === 'shot' ? 200 : 300, () => {
          again(board.querySelector(`.tw-spot[data-lane="${L}"][data-spot="${sp}"]`), 'tw-fire'); SFX.shot(g ? g.lvl : 1);
          throwIt(TWART.orb(TYPES[g ? g.type : 'normal'].color, g && g.lvl > 2).replace('tw-orb', `tw-orb g${g ? g.lvl : 1}`), [p[0], p[1] - 24], body(cur[e.id]), 260, 18, 0);
          later(260, () => hit(e.id, e.dmg, false, e.strong, e.hp));
        }]);
      } else if (e.t === 'chain') B.push([380, () => {
        const a = body(cur[e.from] || lastHit.p || towerP), b = body(cur[e.id]), mid = (f, j) => [a[0] + (b[0] - a[0]) * f + j, a[1] + (b[1] - a[1]) * f - j];
        const d = [a, mid(0.25, 9), mid(0.45, -8), mid(0.65, 8), mid(0.82, -6), b].map((p) => p.join(' ')).join(' L');
        fsvg.insertAdjacentHTML('beforeend', `<g class="tw-zap"><path d="M${d}" fill="none" stroke="#1C2541" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="M${d}" fill="none" stroke="#FFE066" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/></g>`);
        const z = fsvg.lastElementChild; later(520, () => z.remove()); SFX.shot(3);
        later(160, () => hit(e.id, e.dmg, false, false, e.hp));
      }]);
      else if (e.t === 'beaten') B.push([300, () => {
        const p = body(cur[e.id] || [0, 0]); if (tok[e.id]) tok[e.id].classList.add('tw-gone');
        add(TWART.poof(), p, 800); add('<span class="tw-say win">Besiegt!</span>', [p[0], p[1] - 26], 900); SFX.pop();
      }]);
      else if (e.t === 'shield') B.push([520, () => {
        if (ringNow) { ringNow.nextElementSibling.remove(); ringNow.hidden = false; }
        const p = body(cur[e.id]); again(tok[e.id], 'tw-hit'); SFX.shatter();
        add(`<i class="tw-burst" style="border-color:${cols[e.lane]}"></i>`, p, 600);
        for (let j = 0; j < 8; j++) { const a = (j / 8) * Math.PI * 2 + 0.3; const d = add(`<i class="tw-shard" style="background:${cols[e.lane]}"></i>`, p, 750); d.firstChild.style.setProperty('--dx', Math.cos(a) * 64 + 'px'); d.firstChild.style.setProperty('--dy', Math.sin(a) * 64 + 'px'); }
      }]);
      else if (e.t === 'floor') B.push([e.fx === 'volley' ? 380 : 260, () => {
        const r = roomP(e.subject), f = twt.querySelector(`.tw-fl[data-subject="${e.subject}"]`);
        again(f, 'tw-glow');
        if (e.fx === 'volley') { add('<span class="tw-say">Hi!</span>', [r[0] - 40, r[1] - 8], 900); later(140, () => add('<span class="tw-say r">Yes!</span>', [r[0] + 40, r[1] - 14], 760)); SFX.chime(); }
        else if (e.fx === 'brick') add('<span class="tw-say">+🧱</span>', [r[0] + 44, r[1] - 10], 900);
      }]);
      else if (e.t === 'stun') B.push([560, () => {
        const r = roomP(t.lanes.find((l) => TW.FLOORS[l.subject] === 'stun').subject), q = body(cur[e.id]); SFX.swish();
        [0, 1, 2].forEach((j) => later(j * 90, () => throwIt(TWART.leaflet(TWART.ROOMS.Ethik.c), [r[0] + (j - 1) * 12, r[1]], [q[0] + (j - 1) * 12, q[1] - 20 + j * 6], 420, 30, (j - 1) * 160 + 40)));
        later(520, () => { add(`<span class="tw-read">${TWART.leaflet(TWART.ROOMS.Ethik.c)}</span>`, [q[0], q[1] - 14], 900); again(tok[e.id], 'tw-dizzy'); });
      }]);
      else if (e.t === 'heal') B.push([560, () => {
        const r = roomP(t.lanes.find((l) => TW.FLOORS[l.subject] === 'repair').subject); SFX.chime();
        throwIt('<span class="tw-heart">❤️</span>', r, [heroP[0] + 9, heroP[1] + 30], 460, 26, 0);
        later(460, () => { hp = e.hp; setHp(hp); if (level(hp) !== level(hp - e.n)) towerArt(hp); again(twt, 'tw-heal'); num(towerP, '+' + e.n, 'heal'); });
      }]);
      else if (e.t === 'patch') B.push([560, () => { hp = e.hp; setHp(hp); if (level(hp) !== level(hp - e.n)) towerArt(hp); again(twt, 'tw-heal'); num(towerP, '+' + e.n, 'heal'); SFX.chime(); }]);
      else if (e.t === 'push') B.push([540, () => {
        const r = roomP(t.lanes.find((l) => TW.FLOORS[l.subject] === 'push').subject), x = t.monsters.find((y) => y.id === e.id) || pre(e.id); SFX.bell();
        fsvg.insertAdjacentHTML('beforeend', `<g class="tw-rings">${[0, 1, 2].map((j) => `<circle cx="${r[0]}" cy="${r[1]}" r="22" style="animation-delay:${j * 0.12 * k}s"/>`).join('')}</g>`);
        const g = fsvg.lastElementChild; later(900, () => g.remove());
        later(240, () => { place(e.id, cellP(x.lane, e.to), 320); again(tok[e.id], 'tw-dizzy'); });
      }]);
      else if (e.t === 'ziegel') {
        const list = []; for (; ev[i] && ev[i].t === 'ziegel'; i++) list.push(ev[i]); i--;
        const all = list.flatMap((z) => Array.from({ length: z.n }, () => z.why)), from = (why) => (why === 'floor' ? roomP(t.lanes.find((l) => TW.FLOORS[l.subject] === 'brick').subject) : lastHit.p || towerP);
        B.push([150, () => all.forEach((why, j) => later(j * 120, () => fly(from(why), j)))]);
      } else if (e.t === 'wrong') B.push([380, () => again(tok[e.id], 'tw-taunt')]);
      else if (['move', 'stunned', 'enter', 'tower', 'block', 'hold'].includes(e.t)) {
        // the monsters' step: everyone walks at once, new ones come in from the edge meanwhile; a monster already
        // at the gate hits the tower without a move before it
        const group = []; for (; ev[i] && ['move', 'stunned', 'enter', 'tower', 'block', 'hold'].includes(ev[i].t); i++) group.push(ev[i]); i--;
        const moves = group.filter((g) => g.t === 'move'), ins = group.filter((g) => g.t === 'enter'), hits = group.filter((g) => ['tower', 'block', 'hold'].includes(g.t));
        const boss = ins.some((g) => g.boss || g.elite), wIn = boss ? 1.5 * TW_STEP : 1.2 * TW_STEP;
        const len = Math.max(0, ...moves.map((m) => m.from - m.to)) * TW_STEP, inLen = ins.length ? 2 * wIn + 140 * (ins.length - 1) : 0;
        const walkBeat = () => {
          for (const m of moves) { const x = t.monsters.find((y) => y.id === m.id) || pre(m.id); if (!x) continue; walk(m.id, Array.from({ length: m.from - m.to }, (_, s) => cellP(x.lane, m.from - s - 1)), TW_STEP); }
          for (const g of group.filter((x) => x.t === 'stunned')) again(tok[g.id], 'tw-dizzy');
          if (boss) { again(board, 'tw-dim'); }
          ins.forEach((g, j) => later(j * 140, () => { const L = G.lanes[g.lane]; tok[g.id].style.opacity = 1; if (g.boss || g.elite) tok[g.id].classList.add('tw-star'); walk(g.id, [L.from[1], L.cells[4]], wIn); if (g.boss || g.elite) later(2 * wIn, () => { SFX.thud(); again(tok[g.id], 'tw-land'); }); }));
        };
        if (moves.length || ins.length) B.push([Math.max(len, inLen, 200) + 60, walkBeat]);
        for (const h of hits) B.push([h.t === 'tower' ? 1500 : 460, () => impact(h)]); // a hit on the tower gets time to sink in
      } else if (e.t === 'cleared') B.push([850, () => { again(board, 'tw-won'); add(`<div class="tw-wavebanner">${t.phase === 'won' ? 'Alle Wellen sind vorbei.' : `Welle ${e.wave} ist vorbei.`}</div>`, [G.w / 2, G.gate[1] - 150], 1400); SFX.chime(); }]);
      else if (e.t === 'evolve') B.push([900, () => { again(slot, 'tw-evolve'); later(380, () => { slot.innerHTML = heroSVG(turmHero(), e.evo); }); [0, 1, 2, 3, 4].forEach((j) => add(TWART.spark(j % 2 ? '#fff' : '#FFE066'), [heroP[0] + Math.cos(j * 1.26) * 30, heroP[1] + Math.sin(j * 1.26) * 26], 900)); SFX.levelup(); }]);
      else if (e.t === 'won') B.push([1300, () => { board.insertAdjacentHTML('beforeend', CONFETTI); }]);
      else if (e.t === 'fallen') B.push([1100, () => { again(twt, 'tw-fall'); add(TWART.poof(), [G.gate[0], G.gate[1] - 10], 1000); SFX.thud(); }]);
    }
    // a monster at the gate: it runs at the tower; a shield or the wall can stop it
    function impact(h) {
      const x = t.monsters.find((y) => y.id === h.id) || pre(h.id); if (!x) return;
      const g = G.lanes[x.lane].to[0], c = cur[h.id] || cellP(x.lane, 1), p = [c[0] + (g[0] - c[0]) * 0.7, c[1] + (g[1] - c[1]) * 0.7];
      place(h.id, p, 180);
      later(180, () => {
        if (h.t === 'tower') { again(twt, 'tw-shake'); again(board, 'tw-alarm'); hp = h.hp; setHp(hp); if (level(hp) !== level(hp + h.dmg)) towerArt(hp); add(`<span class="tw-num hurt">−${h.dmg} ❤️</span>`, [towerP[0], towerP[1] - 30], 1600); lostNow += h.dmg; showLost(); SFX.hurt(); }
        else if (h.t === 'block') { add(TWART.guardShield(), [g[0], g[1] - 18], 700); SFX.block(); }
        else { add('<i class="tw-dust"></i>', g, 600); SFX.thud(); }
        if (h.gone && h.t === 'tower') { place(h.id, [G.gate[0], G.gate[1] - 4], 300); tok[h.id].classList.add('tw-in'); }
        else if (h.gone) { tok[h.id].classList.add('tw-gone'); add(TWART.poof(), body(p), 700); } else place(h.id, c, 260);
      });
    }
    // a Ziegel flies from the board to the counter in the top bar, which ticks up when it lands
    function fly(p, j) {
      const counter = $('.topbar .tw-bricks', scr), sr = scr.getBoundingClientRect(), br = board.getBoundingClientRect(), cr = counter.getBoundingClientRect(), u = br.width / G.w;
      const x0 = br.left - sr.left + p[0] * u, y0 = br.top - sr.top + p[1] * u, x1 = cr.left - sr.left + 12, y1 = cr.top - sr.top + cr.height / 2;
      const d = document.createElement('span'); d.className = 'tw-fly'; d.innerHTML = TWART.brickOne(); d.style.left = x0 + 'px'; d.style.top = y0 + 'px'; scr.appendChild(d); flyers.push(d);
      const dx = x1 - x0, dy = y1 - y0;
      if (d.animate) d.animate([0, 0.25, 0.5, 0.75, 1].map((f) => ({ translate: `${dx * f}px ${dy * f - 60 * 4 * f * (1 - f)}px`, scale: String(1 + 0.4 * Math.sin(f * Math.PI)) })), { duration: 520 * k, easing: 'ease-in', fill: 'forwards' });
      later(520, () => { d.remove(); bricks++; res('tw-bricks').textContent = bricks; again(counter, 'tw-tick'); SFX.clink(j); });
    }
    const finish = () => {
      if (stopped) return; stopped = true; timers.forEach(clearTimeout); flyers.forEach((d) => d.remove());
      scr.removeEventListener('click', tap, true); scr.classList.remove('playing'); backTo = keepBack; if (hurtLog) hurtLog.style.visibility = '';
      if (!board.isConnected) return;
      if (after) return after();
      if (alive()) { $('.tw-main', scr).innerHTML = turmBoardHtml(); $('.topbar', scr).outerHTML = turmTop(); turmBind(); }
    };
    // a tap skips; a tap on a monster also selects it (its own handler runs after the board is redrawn)
    const tap = (e) => { const real = e.target.closest && e.target.closest('button.tw-mon'); if (!real && e.target.closest && e.target.closest('.tw-main, #twon')) { e.stopPropagation(); e.preventDefault(); } finish(); };
    scr.addEventListener('click', tap, true); scr.classList.add('playing');
    const keepBack = backTo; backTo = finish;
    let b = 0;
    const beat = () => { if (stopped) return; if (!alive()) { stopped = true; return; } const x = B[b++]; if (!x) return finish(); x[1](); timers.push(setTimeout(beat, x[0] * k)); };
    timers.push(setTimeout(beat, 80 * k));
  }
  // Bauzeit: what was just bought moves into place (CSS only, nothing waits)
  function turmBuilt(bau) {
    if (!turmMotion()) { if (bau.guard) SFX.right(); return; }
    const twt = $('#twt'), spot = (key) => $(`.tw-spot[data-lane="${key[0]}"][data-spot="${key[2]}"]`);
    if (bau.guard) { const s = spot(bau.guard); if (s) s.classList.add('tw-arrive'); SFX.thud(); setTimeout(SFX.right, 380); }
    if (bau.up) { const s = spot(bau.up); if (s) s.classList.add('tw-upnow'); SFX.chime(); }
    if (bau.floor) { const f = $(`.tw-fl[data-subject="${bau.floor}"]`, twt); if (f) { f.classList.add('new'); twt.classList.add('tw-grow'); twt.insertAdjacentHTML('beforeend', `<i class="tw-dustpuff" style="--fy:${TWART.TOWER.BASE + 8 + TWART.TOWER.FLOOR * (+f.dataset.floor)}"></i>`); setTimeout(() => SFX.thud(), 620); } }
    if (bau.fix != null) { const old = TWART.tower(run.turm.floors, bau.fix, run.hero.maxHp); $('.tw-towerart', twt).insertAdjacentHTML('afterend', old.back.replace('class="tw-towerart"', 'class="tw-towerart tw-oldart"')); twt.classList.add('tw-mend'); [0, 1, 2].forEach((j) => setTimeout(() => SFX.clink(j * 3), 150 + j * 160)); }
  }
  // without motion: the numbers and the sound at once
  function turmFx(ev) {
    for (const e of ev) if (e.t === 'hit' || e.t === 'shot' || e.t === 'chain') fx(`.tw-mon[data-id="${e.id}"]`, '−' + e.dmg, e.weak ? 'crit' : '');
    const hurt = ev.filter((e) => e.t === 'tower');
    if (hurt.length) { $('#twt').classList.add('hurt'); $('.tw-board').classList.add('tw-alarm'); SFX.hurt(); }
    else if (ev.some((e) => e.t === 'hit')) SFX.hit();
  }
  function turmIntro() {
    const steps = ['Tippe auf ein Monster und dann auf „Angreifen“. Löse die Aufgabe.', 'Richtig gelöst? Dein Held trifft das Monster und du bekommst Ziegel 🧱.', 'Kommt ein Monster am Turm an, verliert der Turm ❤️. Pass auf bei ⚠️!'];
    const ov = modal(`<h2>🏰 Turmwacht</h2><ol>${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol><button class="btn" id="tutok" style="margin-top:12px">Verstanden</button>`);
    speakBtn($('h2', ov), 'afterbegin', () => joined(...steps), undefined, [], run.grade);
    $('#tutok', ov).focus({ preventScroll: true }); $('#tutok', ov).onclick = () => { ov.remove(); meta.seenTut['turm:intro'] = true; saveAll(); };
  }
  // children took a monster vanishing at the gate for a win: the first time the tower loses ❤️, say so
  function turmHitTut(o) {
    const e = o.ev.find((y) => y.t === 'tower'), w = (o.names || {})[e.id], x = w && w.x;
    const text = `${w ? w.name : 'Ein Monster'} ist am Turm angekommen. Der Turm hat ${turmLost} ❤️ verloren.`, tip = 'Tipp: Greif zuerst das Monster mit ⚠️ an.';
    const ov = modal(`<div class="tw-banner">${x ? monsterSVG(x.shape, TYPES[x.type].color, 0, 'enemy', { elite: x.elite, boss: x.boss }) : ''}<h2>Oh nein!</h2></div><p>${esc(text)}</p><p>${tip}</p><button class="btn" id="tutok">Weiter</button>`);
    ov.classList.add('tw-bannerov');
    const said = () => joined('Oh nein', text, tip);
    speakBtn($('h2', ov), 'beforeend', said, said, [], run.grade);
    $('#tutok', ov).focus({ preventScroll: true }); $('#tutok', ov).onclick = () => { ov.remove(); meta.seenTut['turm:hit'] = true; saveAll(); };
  }
  // a boss or the elite arrives: a still banner over the board until it is tapped away (no timer)
  function turmBanner(x, slide) {
    const t = run.turm, cols = TWART.laneColors(t.lanes);
    const text = x.final ? 'Für jedes Fach trägt der Boss einen Schild. Die Aufgaben kommen der Reihe nach aus diesen Fächern:'
      : x.boss ? 'Der Boss geht nur jeden zweiten Zug ein Feld. Am Tor bleibt er stehen und trifft den Turm, bis er besiegt ist.'
        : turmEliteText(x);
    const list = x.final ? `<div class="tw-shieldlist">${x.shields.map((l) => `<span><i class="dot" style="background:${cols[l]}" aria-hidden="true"></i>${SUBJECTS[t.lanes[l].subject]} ${esc(laneName(l))}</span>`).join('')}</div>` : '';
    const ov = modal(`<div class="tw-banner">${monsterSVG(x.shape, TYPES[x.type].color, 0, 'enemy', { elite: x.elite, boss: x.boss })}<h2>${esc(x.name)} kommt.</h2></div><p>${esc(text)}</p>${list}<button class="btn" id="tutok">Weiter</button>`);
    ov.classList.add('tw-bannerov'); if (slide) ov.classList.add('slide');
    const said = () => joined(`${x.name} kommt`, text, x.final && x.shields.map(laneName).join(', '));
    speakBtn($('h2', ov), 'beforeend', said, said, [], run.grade);
    const close = () => ov.remove();
    $('#tutok', ov).focus({ preventScroll: true }); $('#tutok', ov).onclick = close;
    ov.onclick = (e) => { if (e.target === ov) close(); };
  }
  // after a wave: the Ziegel with their reasons and the Stempel; after the wave-3 boss also the new shape and the item choice
  function screenTurmCleared() {
    depth = 2; const t = run.turm, boss = TW.WAVES[t.wave - 1].boss != null, H = turmHero();
    const why = { right: 'Richtige Antworten', weak: '🎯 Doppelte Ziegel', floor: 'Schreibstube', wave: 'Welle vorbei', clean: 'Der Turm blieb heil' };
    const rows = Object.keys(why).filter((k) => t.earned[k]).map((k) => `<li><span>${why[k]}</span><b>+${t.earned[k]} 🧱</b></li>`).join('');
    const evo = boss ? `<div class="card center tw-evo"><h3>Neue Gestalt</h3><div class="evo-row">${heroSVG(H, run.hero.evo - 1, 'before')}<span aria-hidden="true">➜</span>${heroSVG(H, run.hero.evo, 'after')}</div><p>${esc(turmEvoText(run.hero.evo))}</p></div>` : '';
    const offer = t.phase === 'reward' && t.offer;
    render(`<div class="screen">${turmTop()}<div class="scroll"><div class="stack"><div class="card center tw-cleared"><h2>Welle ${t.wave} ist vorbei.</h2>${rows ? `<ul class="tw-earned">${rows}</ul>` : ''}<p>Du hast jetzt ${t.ziegel} 🧱.</p>${stampLine(t.stamps)}<p class="pnote">Gleich ist Bauzeit: Mit Ziegeln machst du den Turm stärker.</p></div>${evo}</div></div>
      <div class="bottom">${offer ? '<button class="btn" id="pick">Belohnung aussuchen</button>' : '<button class="btn" id="tobuild">Zur Bauzeit</button>'}</div></div>`);
    backTo = () => turmLeave(screenTurm);
    speakBtn($('.tw-cleared h2'), 'beforeend', () => joined(`Welle ${t.wave} ist vorbei`, `Du hast jetzt ${t.ziegel} Ziegel`, boss && turmEvoText(run.hero.evo)), undefined, [], run.grade);
    setTimeout(boss ? SFX.levelup : SFX.win, 150);
    if (!offer) { $('#tobuild').onclick = () => screenTurmBoard(); return; }
    $('#pick').onclick = () => {
      const ov = modal(`<h2>Belohnung</h2><p>Für den Boss ist schon ${ITEMS.grosstrank.icon} ${ITEMS.grosstrank.name} in deinem Beutel. Such dir noch etwas aus:</p><div class="stack">${offer.map((id, i) => `<button class="choice tw-item" data-r="${i}"><span class="tw-itemic" aria-hidden="true">${ITEMS[id].icon}</span><span class="meta"><span class="name">${ITEMS[id].name}</span><span class="desc">${esc(TURM_BAG.desc[id] || ITEMS[id].desc)}</span></span></button>`).join('')}<button class="btn secondary" id="no">Zurück</button></div>`);
      $('#no', ov).onclick = () => ov.remove();
      ov.querySelectorAll('[data-r]').forEach((b) => { b.onclick = () => { const id = t.offer[+b.dataset.r]; ov.remove(); if (turmReward(+b.dataset.r)) { screenTurmBoard({ lines: [`${ITEMS[id].icon} ${ITEMS[id].name} ist jetzt in deinem Beutel.`], quiet: true }); if (run.turm.wave === 3) turmPause(); } }; });
    };
  }
  // fallen or won: first what was practised, then the result
  function screenTurmEnd(o = {}) {
    depth = 2; const t = run.turm, won = t.phase === 'won', retry = TW.canRetry(run), left = TW.CP_USES - t.cpUsed, H = turmHero();
    const rows = [...new Set(t.lanes.map((l) => l.subject))].map((s) => { const v = t.score[s] || { c: 0, t: 0 }; return `<li><span>${SUBJECTS[s]} ${esc(s)}</span><b>${v.c} von ${v.t} richtig</b></li>`; }).join('');
    if (!retry) endRun(); // over for good; record and scores are already in meta
    if (o.ev) setTimeout(won ? SFX.finale : SFX.lose, 150);
    if (won && o.ev && !reducedMotion) setTimeout(() => { const e = $('.tw-endtower'); if (e) e.classList.add('rise'); }, 0);
    // the finished tower with every floor built in this run and the hero in its last shape on top
    const tw = TWART.tower(t.floors, run.hero.hp, run.hero.maxHp);
    const pic = won ? `<div class="tw-endtower"><div class="tw-tower" style="--th:${tw.h};--feet:${tw.feet}">${tw.back}<div class="tw-heroslot">${heroSVG(H, run.hero.evo)}</div>${tw.front}</div></div>` : heroSVG(H, run.hero.evo);
    const result = won ? 'Der Wissensturm hat allen Wellen standgehalten.' : `Der Turm ist gefallen. Du bist bis Welle ${t.wave} gekommen.`;
    render(`<div class="screen">${topbar('🏰 Turmwacht')}${won ? CONFETTI : ''}<div class="scroll"><div class="stack"><div class="card center tw-end"><h2>Das hast du geübt</h2><ul class="tw-score">${rows}</ul></div>
      <div class="card center tw-end${won ? ' won' : ''}">${pic}<p class="tw-result">${result}</p>${won ? `<p>${esc(H.names[run.hero.evo])} steht ganz oben auf dem Turm.</p>` : ''}${stampLine(t.stamps)}<p>Rekord: Welle ${meta.turm.best}</p></div></div></div>
      <div class="bottom"><div class="stack tw-endbtns">${retry ? `<button class="btn" id="retry">Ab Welle ${t.cp.turm.wave + 1} weitermachen</button><p class="pnote center">Das geht in dieser Turmwacht noch ${left === 1 ? 'einmal' : 'zweimal'}.</p>` : ''}${won ? '<button class="btn" id="home">Zum Titel</button><button class="btn secondary" id="again">Neue Turmwacht</button>'
        : `<button class="btn${retry ? ' secondary' : ''}" id="again">Neue Turmwacht</button><button class="btn ghost" id="home">Zum Titel</button>`}</div></div></div>`);
    speakBtn($('.tw-end h2'), 'beforeend', () => joined('Das hast du geübt', ...[...app.querySelectorAll('.tw-score li')].map((li) => li.textContent.replace(/^\S+\s/, '')), result), undefined, [], run.grade);
    const home = () => turmLeave(screenTitle);
    backTo = home; $('#home').onclick = home;
    $('#again').onclick = () => { endRun(); run = null; screenTurmNew(); };
    if (retry) $('#retry').onclick = () => { turmRetry(); screenTurmBoard({ lines: [`Der Turm ist wieder heil. Gleich kommt Welle ${run.turm.wave + 1}.`] }); };
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
  const PG_DEFS = `<defs>${lg('pg-soil', '#9A6640', '#6B4226')}${lg('pg-bd', '#C68B55', '#8A5530')}${lg('pg-lv', '#8DD16A', '#3E9640')}${lg('pg-dry', '#E6CE70', '#A8892E')}${rg('pg-tb', '#F3D48E', '#B88843')}</defs>`;
  const gLeaf = (x, y, rx, ry, a, f) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0Q${rx * 0.4} ${-ry * 1.5} ${rx * 2} 0Q${rx * 0.4} ${ry * 1.5} 0 0Z" fill="${f}" ${ln(1.1)}/><path d="M1 0H${rx * 1.6}" stroke="${INK}" stroke-width=".6" opacity=".45"/></g>`;
  const gTuber = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="4.2" fill="url(#pg-tb)" ${ln(1.5)}/><circle cx="${x + 2}" cy="${y + 1}" r=".8" fill="#8A6030"/><ellipse cx="${x - 2}" cy="${y - 1.6}" rx="2" ry="1" fill="#FFF7E0" opacity=".6"/>`;
  const gStalk = (x, top, c) => `<path d="M${x} 61V${top}" ${ln(3)}/><path d="M${x} 61V${top}" stroke="${c}" stroke-width="1.4" stroke-linecap="round"/>`;
  const CROP_EAR = {
    weizen: (x, t, c) => [5, 4, 3, 2, 1, 0].map((j) => { const y = t + 3 + j * 2.4; return `<ellipse cx="${x - 1.7}" cy="${y}" rx="1.9" ry="2.6" transform="rotate(-20 ${x - 1.7} ${y})" fill="${c}"/><ellipse cx="${x + 1.7}" cy="${y}" rx="1.9" ry="2.6" transform="rotate(20 ${x + 1.7} ${y})" fill="${c}"/>`; }).join('') + `<ellipse cx="${x}" cy="${t + 1.5}" rx="1.6" ry="2.4" fill="${c}"/>`,
    roggen: (x, t, c) => [6, 5, 4, 3, 2, 1, 0].map((j) => { const y = t + 3 + j * 2.1; return `<path d="M${x - 1.2} ${y - 1}L${x - 3.5} ${y - 10}M${x + 1.2} ${y - 1}L${x + 3.5} ${y - 10}" stroke="#8A6A2A" stroke-width=".7" stroke-linecap="round"/><ellipse cx="${x - 1.2}" cy="${y}" rx="1.3" ry="2.1" fill="${c}"/><ellipse cx="${x + 1.2}" cy="${y}" rx="1.3" ry="2.1" fill="${c}"/>`; }).join(''),
    hafer: (x, t, c) => `<path d="M${x} ${t + 18}V${t}" stroke="${INK}" stroke-width="1" stroke-linecap="round"/>` + [0, 1, 2, 3].map((j) => { const y = t + 2 + j * 4, s = j % 2 ? 1 : -1; return `<path d="M${x} ${y}q${s * 4} 0 ${s * 6} 4" fill="none" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/><ellipse cx="${x + s * 6}" cy="${y + 7}" rx="1.7" ry="3.1" transform="rotate(${s * -12} ${x + s * 6} ${y + 7})" fill="${c}"/>`; }).join('') + `<ellipse cx="${x + 1}" cy="${t + 3}" rx="1.5" ry="2.8" fill="${c}"/>`,
  };
  const CROP_TOPS = { weizen: [24, 20, 17, 21, 25], roggen: [18, 14, 12, 15, 19], hafer: [22, 18, 15, 19, 23] };
  function plantSVG(crop, ph) {
    const ripe = ph === 3; const lf = ripe ? 'url(#pg-dry)' : 'url(#pg-lv)'; const stalk = ripe ? '#D9B04A' : '#5DA34A'; const ear = ripe ? '#EBC254' : '#A6D879';
    let p = '';
    if (!crop) p = '<path d="M9 60Q40 57 71 60M12 63Q40 60 68 63" fill="none" stroke="#4A2C18" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>';
    else if (ph === 0) p = crop === 'kartoffel' ? `<ellipse cx="40" cy="60" rx="13" ry="3.6" fill="#4A2C18"/><g transform="translate(40 56.5) scale(1.35) translate(-40 -56.5)">${gTuber(40, 56.5)}</g><circle cx="35.5" cy="52" r="1.5" fill="#B86A9A" ${ln(0.6)}/><circle cx="44" cy="51.6" r="1.2" fill="#B86A9A" ${ln(0.6)}/><path d="M24 63Q30 59 34 60.5L46 60.5Q50 59 56 63Z" fill="url(#pg-soil)" ${ln(1.4)}/>`
      : `<path d="M9 60Q40 57 71 60" fill="none" stroke="#4A2C18" stroke-width="2.4" stroke-linecap="round"/>${[16, 26, 36, 46, 56, 66].map((x) => `<ellipse cx="${x}" cy="${58.6 + Math.abs(x - 40) / 25}" rx="2.3" ry="1.5" fill="#E8C97A" ${ln(0.8)}/>`).join('')}`;
    else if (ph === 1) p = crop === 'kartoffel' ? `<path d="M40 61Q39 53 40 46" ${ln(3.4)}/><path d="M40 61Q39 53 40 46" stroke="#5DA34A" stroke-width="1.8" stroke-linecap="round"/>${gLeaf(39, 50, 6, 3.6, -160, lf)}${gLeaf(41, 49, 6, 3.6, -20, lf)}${gLeaf(40, 47, 5, 3.2, -95, lf)}${gLeaf(39, 55, 4.5, 2.8, 170, lf)}`
      : [16, 28, 40, 52, 64].map((x, i) => `<path d="M${x - 2} 61Q${x - 2} 52 ${x - 3.5} ${44 + (i % 2) * 3}Q${x + 1.5} 52 ${x + 1} 61Z" fill="${lf}" ${ln(0.9)}/><path d="M${x} 61Q${x + 1} 53 ${x + 5} ${48 + (i % 2) * 2}Q${x + 3} 55 ${x + 2.4} 61Z" fill="${lf}" ${ln(0.9)}/>`).join('');
    else if (crop === 'kartoffel') {
      const d = ripe ? 30 : 0;
      p = `<path d="M40 61V30M40 46L26 38M40 40L53 31M40 52L24 50M40 50L56 46" ${ln(3.2)}/><path d="M40 61V30M40 46L26 38M40 40L53 31M40 52L24 50M40 50L56 46" stroke="${stalk}" stroke-width="1.6" stroke-linecap="round"/>`;
      p += [[26, 38, -160], [53, 31, -20], [40, 30, -90], [24, 50, -175], [56, 46, -5], [32, 43, -130], [47, 37, -50], [33, 33, -120], [49, 51, 20], [31, 53, 160], [45, 27, -60]].map(([x, y, a]) => gLeaf(x, y, 6.5, 4.5, a + (a < -90 ? -d : d), lf)).join('');
      p += ripe ? `<circle cx="29" cy="40" r="1" fill="#8A6A2A"/><circle cx="51" cy="35" r="1" fill="#8A6A2A"/>${gTuber(22, 61)}${gTuber(57, 61.5)}${gTuber(39, 63)}`
        : [[34, 22, 3.6], [46, 21, 3.6], [40, 18, 2.8]].map(([x, y, r]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cy="${-r * 0.55}" rx="${r * 0.5}" ry="${r * 0.62}" transform="rotate(${a})" fill="#F7F1FF" ${ln(0.8)}/>`).join('')}<circle r="${r * 0.32}" fill="#F5C93F" ${ln(0.6)}/></g>`).join('');
    } else p = CROP_TOPS[crop].map((t, i) => { const x = 16 + i * 12, s = i % 2 ? 1 : -1; return `${gStalk(x, t + 6, stalk)}<path d="M${x} 50q${s * 5} -4 ${s * 10} -1q${s * -5} -1 ${s * -10} 4z" fill="${lf}" ${ln(0.9)}/><g stroke="${INK}" stroke-width=".75">${CROP_EAR[crop](x, t, ear)}</g>`; }).join('');
    return r1(`<svg class="plant-art" viewBox="0 0 80 80" aria-hidden="true">${PG_DEFS}${shadow(40, 76.5, 37, 3)}<path d="M4 64Q4 55 16 55H64Q76 55 76 64Z" fill="url(#pg-soil)" ${ln(2)}/><circle cx="12" cy="59" r=".9" fill="#C99A70"/><circle cx="31" cy="57.5" r=".8" fill="#C99A70"/><circle cx="62" cy="58" r=".9" fill="#C99A70"/><circle cx="50" cy="62" r=".8" fill="#3E2414"/><circle cx="21" cy="62" r=".8" fill="#3E2414"/>${p}
      <rect x="3" y="63" width="74" height="13" rx="3" fill="url(#pg-bd)" ${ln(2)}/><path d="M6 65.5h68" stroke="#E2B07A" stroke-width="1" stroke-linecap="round"/><path d="M10 70q18-2 32 0M46 73q12 1 24-1" stroke="#6E4526" stroke-width=".8" fill="none" opacity=".6"/><circle cx="7.5" cy="69.5" r="1" fill="#5E646E"/><circle cx="72.5" cy="69.5" r="1" fill="#5E646E"/></svg>`);
  }
  function screenGarden() {
    depth = 1;
    const bed = (b, i) => {
      if (!bedOpen(i)) return `<div class="bed locked"><div class="bedart" aria-hidden="true">🔒</div><div class="bedname">Beet ${i + 1}</div><div class="beddesc">Gewinne die Kartoffel-Werkstatt, dann gehört dir dieses Beet.</div></div>`;
      if (!b.crop) return `<div class="bed">${plantSVG(null, 0)}<div class="bedname">Beet ${i + 1}</div><div class="beddesc">Noch leer.</div><button class="btn small" data-plant="${i}">Pflanzen</button></div>`;
      const c = MK.CROPS[b.crop]; const ph = bedPhase(b); const d = bedDays(b);
      return `<div class="bed${ph === 3 ? ' ripe' : ''}">${plantSVG(b.crop, ph)}<div class="bedname">${c.name}</div><div class="beddesc">${ph === 3 ? 'Reif' : d ? `${[c.put, 'Keimling', c.top][ph]}<br>Tag ${d} von 7` : `Heute ${c.put.toLowerCase()}`}</div>${ph === 3 ? `<button class="btn small" data-harvest="${i}">Ernten</button>` : ''}</div>`;
    };
    const got = Object.keys(MK.CROPS).filter((k) => meta.materials[k]).map((k) => `${MK.CROPS[k].name} ${meta.materials[k]}`);
    render(`<div class="screen">${topbar('Schulgarten')}<div class="scroll"><div class="stack">
      <div class="card"><p>Beete wachsen auch, wenn du Pause machst. Nach 7 Tagen kannst du ernten. Für jede Ernte gibt es 4 Stempel.</p>${got.length ? `<p class="pnote">Schon geerntet: ${got.join(' · ')}</p>` : ''}</div>
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
  // svg, not emoji: the parent area looks the same on every device
  const ICO = { chart: '<path d="M4 20V11M10 20V4M16 20v-6M22 20H2"/>', book: '<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h12M9 8h6"/>', sliders: '<path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="3"/><circle cx="8" cy="17" r="3"/>',
    next: '<path d="M9 5l7 7-7 7"/>', back: '<path d="M15 5l-7 7 7 7"/>', warn: '<path d="M12 3l10 18H2zM12 10v5M12 18v.5"/>' };
  const ico = (n) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICO[n]}</svg>`;
  const P_TABS = { overview: ['Überblick', 'chart', { week: 'Diese Woche', all: 'Insgesamt' }], practice: ['Inhalte', 'book', { subjects: 'Fächer', how: 'So lernt Ihr Kind' }], settings: ['Einstellungen', 'sliders', { save: 'Spielstand', app: 'App', show: 'Anzeigen', reset: 'Löschen' }] };
  const P_JUMPS = { load: ['settings', 'save'], save: ['settings', 'save'], appsec: ['settings', 'app'] };
  let pAt;
  const tutOf = (m, k, tier) => { const c = MODES[m]; return c.numTut ? c.numTut[k][tier] : c.tut ? c.tut[k + ':' + tier] : MQ.TUT[k][tier]; };
  function confirmBox(title, body, yes, fn, danger) {
    const ov = modal(`<h2>${title}</h2>${body}<div class="stack"><button class="btn${danger ? ' danger' : ''}" id="yes">${yes}</button><button class="btn secondary" id="no">Abbrechen</button></div>`);
    $('#no', ov).onclick = () => ov.remove(); $('#yes', ov).onclick = () => { ov.remove(); fn(); }; $('#no', ov).focus({ preventScroll: true });
  }
  // quiet: redrawn in place after a switch or a tab, without the screen animation
  function screenParent(jump, back, quiet) {
    back = typeof back === 'function' ? back : screenTitle;
    if (!quiet) pAt = { tab: 'overview', sub: {}, subj: -1, mode: '' };
    if (P_JUMPS[jump]) { pAt.tab = P_JUMPS[jump][0]; pAt.sub[pAt.tab] = P_JUMPS[jump][1]; }
    pAt.back = back;
    const tab = pAt.tab; const subs = P_TABS[tab][2]; const sub = subs[pAt.sub[tab]] ? pAt.sub[tab] : Object.keys(subs)[0];
    depth = sub === 'subjects' && curGrade().subjects[pAt.subj] ? 2 : 1;
    const redraw = (focus) => { screenParent(null, back, true); const el = focus && $(focus); if (el) el.focus({ preventScroll: true }); };
    const switches = () => [...app.querySelectorAll('[role=switch]')];
    const again = () => { const y = $('.scroll').scrollTop; const i = switches().indexOf(document.activeElement); redraw(); $('.scroll').scrollTop = y; if (i >= 0 && switches()[i]) switches()[i].focus({ preventScroll: true }); };
    const card = (h, body, cls) => `<div class="card pcard${cls ? ' ' + cls : ''}">${h ? `<h3>${h}</h3>` : ''}${body}</div>`;
    const note = (t) => `<p class="pnote">${t}</p>`;
    const msg = '<p class="tmsg" role="status"></p>';
    const speakSettings = () => { const vs = voices(), cur = chosenVoice(), es = enVoices(), ce = enVoice(); const tryBtn = (i, en = '') => `<button class="btn small secondary" data-try${en}="${i}">Probe hören</button>`;
      if (!TTS) return note('Dieser Browser kann nicht vorlesen.');
      if (!vs.length) return note('Auf diesem Gerät fehlt eine deutsche Stimme.') + voiceGuide(true);
      const pick = (list, c, en) => list.map((v, i) => `<div class="pvrow"><button class="pvoice" aria-pressed="${v === c}" data-voice${en}="${i}">${esc(v.name)}</button>${tryBtn(i, en)}</div>`).join('');
      return (vs.length > 1 ? `<div class="pset"><b>Stimme</b>${pick(vs, cur, '')}</div>` : '')
        + (es.length > 1 ? `<div class="pset"><b>Stimme für Englisch</b>${pick(es, ce, '-en')}</div>` : '')
        + `<div class="pset"><label for="prate"><b>Tempo</b></label><input type="range" id="prate" class="prate" min="0.6" max="1.4" step="0.05" value="${meta.speakRate}"><div class="prange" aria-hidden="true"><span>langsam</span><span>schnell</span></div>${vs.length > 1 ? '' : `<div class="pvrow">${tryBtn(0)}</div>`}</div>`
        + (es.length ? '' : note('Für Englisch ist keine englische Stimme auf dem Gerät. Bis eine geladen ist, liest die deutsche Stimme die englischen Wörter. Wie das geht, steht unten.'))
        + voiceGuide(false); };
    const sw = (on, attr, title, desc) => `<div class="prow"><div class="ptext"><b>${title}</b>${desc || ''}</div><button class="switch" role="switch" aria-checked="${!!on}" aria-label="${title.replace(/<[^>]+>/g, '')}" ${attr}><i></i></button></div>`;
    const stat = (n, v) => `<div class="statrow"><span class="n">${n}</span><span>${v}</span></div>`;
    const level = (c, t) => (c / t >= 0.8 ? '<span class="lvl good">sicher</span>' : c / t >= 0.5 ? '<span class="lvl mid">fast sicher</span>' : '<span class="lvl low">übt noch</span>');
    const srow = (icon, name, c, t, more) => `<div class="srow"><div class="ptext"><b>${icon} ${esc(name)}</b><span>${c} von ${t} richtig${more || ''}</span></div>${level(c, t)}</div>`;
    const LEGEND = note('<b>sicher:</b> mindestens 8 von 10 richtig · <b>fast sicher:</b> mindestens die Hälfte · <b>übt noch:</b> weniger als die Hälfte');
    const report = weekReport();
    const gameState = (m) => { if (!shown(m)) return 'ausgeblendet'; const all = Object.keys(MODES[m].modules); const n = all.filter((k) => !offList(m).includes(k)).length; const S = MODES[m].starters;
      return `${n} von ${all.length} Aufgabenarten${S.length > 1 ? ` · ${S.filter((x) => heroShown(m, x)).length} von ${S.length} Helden` : ''}`; };

    const turmSubjCard = () => { const G = grades().filter((g) => g.grade !== 1), fixed = (g) => (meta.turm.subjects || {})[g] || [];
      return G.length ? card('Turmwacht: Fächer festlegen', note(ELTERN.TURM.subjects) + G.map((g) => `${G.length > 1 ? `<h4 class="psubhead">${g.label}</h4>` : ''}${g.subjects.filter((s) => s.modes.some(shown)).map((s) => sw(fixed(g.grade).includes(s.subject), `data-tsub="${g.grade}:${esc(s.subject)}"`, `${s.icon} ${esc(s.subject)}`)).join('')}`).join('') + msg) : ''; };
    const pages = {
      week() {
        const r = report; const sum = (f) => r.rows.reduce((a, x) => a + x[f], 0);
        const weak = r.rows.filter((x) => x.t >= 3 && x.c / x.t < 0.8).sort((a, b) => a.c / a.t - b.c / b.t).slice(0, 3);
        return card(`Kalenderwoche ${r.wk}`, r.rows.length ? `<p class="plead">${sum('t')} Aufgaben gelöst, ${sum('c')} davon richtig.</p>${note('Gezählt wird seit Montag.')}` : note('Diese Woche wurde noch nichts geübt.'))
          + card('Braucht noch Übung', weak.length ? weak.map((x) => srow(x.icon, x.label, x.c, x.t)).join('') : note(r.rows.some((x) => x.t >= 3) ? 'Im Moment nichts. Alles, was diese Woche geübt wurde, klappt sicher.' : 'Noch zu wenig geübt für eine Auswertung.'))
          + (extraOn('wochenziele') ? card('Wochenziele', `${note(`${r.done} von ${r.goals.length} erledigt. Für alle Wochenziele zusammen gibt es 10 Stempel.`)}${r.goals.map((g) => stat(esc(goalText(g)), `${Math.min(goalCount(g), g.n)} von ${g.n}`)).join('')}`) : '')
          + (r.rows.length ? card('Alles, was diese Woche geübt wurde', LEGEND + r.rows.map((x) => srow(x.icon, x.label, x.c, x.t)).join('')) : '')
          + card('Wochenbericht als Text', `${note('Zum Weitergeben, zum Beispiel an die Lehrerin oder den Lehrer. Es steht kein Name darin.')}<label for="wtext" class="sr-only">Wochenbericht</label><textarea id="wtext" class="codebox reporttext" rows="6" readonly>${esc(r.text)}</textarea><button class="btn small" id="wcopy">Text kopieren</button><p id="wmsg" role="status" class="pnote"></p>`);
      },
      all() {
        const played = MODE_KEYS.filter((m) => Object.values(meta.stats[m]).some((x) => x.t > 0));
        const topics = played.map((m) => { const r = loadRun(m); return card(`${MODES[m].icon} ${MODES[m].title}`, Object.keys(MODES[m].modules).filter((k) => meta.stats[m][k].t > 0).map((k) => { const s = meta.stats[m][k]; return srow(MODES[m].modules[k].icon, MODES[m].modules[k].name, s.c, s.t, r ? ` · Stufe ${r.tiers[k] || 1}` : ''); }).join('')); }).join('');
        const weakFacts = Object.entries(meta.know).filter(([id, k]) => k.t >= 2 && k.c / k.t < 0.7).map(([id, k]) => { const q = Object.values(MK.MODES).flatMap((c) => c.pool).find((p) => p.id === id.replace('_find', '')); return q ? stat(esc(q.q), `${k.c} von ${k.t}`) : ''; }).join('');
        return card('Seit dem ersten Tag', `${stat('Abenteuer begonnen', meta.runs)}${stat('Bis zum Ende geschafft', meta.wins)}${stat('Stempel verdient insgesamt', meta.stampsTotal)}${stat('Davon noch übrig', meta.stamps)}${note('Alle Fächer zusammen. „Geschafft“ heißt: Der Endgegner der letzten Welt ist besiegt.')}`)
          + (meta.turm.runs || meta.turm.on ? card('🏰 Turmwacht', `${stat('Begonnen', meta.turm.runs)}${stat('Bis zum Ende geschafft', meta.turm.wins)}${stat('Rekord', meta.turm.best ? `Welle ${meta.turm.best} von ${TW.WAVES.length}` : '–')}${Object.values(meta.turm.last).some((v) => v.t) ? `<p class="plead">Letzte Turmwacht</p>${Object.entries(meta.turm.last).filter(([, v]) => v.t).map(([s, v]) => srow(SUBJECTS[s], s, v.c, v.t)).join('')}` : ''}${note(ELTERN.TURM.counts)}`) : '')
          + card('Trefferquote je Thema', topics ? `${note('Hier stehen nur Themen und Aufgabenarten, die schon geübt wurden. „Stufe“ zeigt, wie schwer die Aufgaben im laufenden Abenteuer gerade sind.')}${LEGEND}` : note('Noch nichts geübt.'))
          + topics
          + card('Wissensfragen mit Schwierigkeiten', weakFacts ? `${note('Diese Fragen waren öfter falsch. Lernquest stellt sie bald wieder.')}${weakFacts}` : note('Noch keine – oder noch nicht genug geübt.'));
      },
      subjects() {
        const S = curGrade().subjects;
        if (!S[pAt.subj]) return card('', `<p class="plead">Lernquest merkt, was Ihr Kind schon kann, und stellt passende Aufgaben: nicht zu leicht und nicht zu schwer.</p><button class="linkbtn" data-ps="how">So lernt Ihr Kind mit Lernquest</button>`)
          + (grades().length > 1 ? card('Klasse', gradeTabs()) : '')
          + card('Was soll geübt werden?', `${note('Tippen Sie auf ein Fach. Dort sehen Sie, was jede Aufgabenart übt, und können Themen, Helden und Aufgabenarten ein- oder ausschalten.')}${S.map((s, i) => { const vis = s.modes.filter(shown).length;
            return `<button class="pnav" data-pf="${i}"><span class="ptext"><b>${s.icon} ${esc(s.subject)}</b><span>${!vis ? 'ausgeblendet' : s.modes.length === 1 ? gameState(s.modes[0]) : `${vis} von ${s.modes.length} Themen`}</span></span>${ico('next')}</button>`; }).join('')}`);
        const s = S[pAt.subj]; const m = s.modes.includes(pAt.mode) ? pAt.mode : s.modes[0]; const c = MODES[m]; const keys = Object.keys(c.modules); const plan = ELTERN.PLAN[m];
        return `<button class="pback" id="pback">${ico('back')}Alle Fächer</button>`
          + (s.modes.length > 1 ? card(`${s.icon} ${esc(s.subject)}`, sw(s.modes.some(shown), `data-hidesub="${pAt.subj}"`, 'Fach anzeigen', '<span>Ausgeschaltet erscheint das ganze Fach nicht mehr auf der Startseite.</span>') + msg)
            + (s.subject === 'Englisch' ? card('Themen aus dem Unterricht', `${note('Ausgeschaltete Themen kommen in beiden Englisch-Themen nicht mehr vor, auch nicht in Sätzen. Sätze ohne Themenwort bleiben immer an. Mindestens ein Thema bleibt an.')}${Object.keys(MK.EN_THEMES).map((t) => sw(!meta.hidden.includes('en:' + t), `data-hide="en:${esc(t)}"`, esc(t), `<span>${MK.EN_THEMES[t].slice(0, 4).map((x) => esc(x[0])).join(', ')} …</span>`)).join('')}${msg}`) : '')
            + `<div class="pchips" role="tablist" aria-label="Themen">${s.modes.map((x) => `<button role="tab" data-pm="${x}" aria-selected="${x === m}" class="${shown(x) ? '' : 'off'}">${MODES[x].icon} ${esc(MODES[x].title)}</button>`).join('')}</div>` : '')
          + card(`${c.icon} ${esc(c.title)}`, `<p>${esc(c.sub)}</p>${plan ? `<p class="pplan"><b>Lehrplan Sachsen:</b> ${esc(plan)}</p>` : ''}${sw(shown(m), `data-hide="mode:${m}"`, 'Thema anzeigen', '<span>Ausgeschaltet erscheint das Thema nicht mehr. Ein laufendes Abenteuer bleibt gespeichert.</span>')}${msg}`)
          + (c.starters.length > 1 ? card('Helden', `${note('Jeder Held bringt eigene Aufgabenarten mit. Ausgeschaltete Helden stehen nicht mehr zur Wahl.')}${c.starters.map((x) => sw(heroShown(m, x), `data-hide="hero:${m}:${x.id}"`, esc(x.names[0]), `<span>${[...new Set(x.attacks.map((a) => c.modules[a.mod].name))].map(esc).join(', ')}</span>`)).join('')}${msg}`) : '')
          + card('Aufgabenarten', `${note(`${keys.filter((k) => !offList(m).includes(k)).length} von ${keys.length} sind an. Ausgeschaltete Aufgabenarten kommen nicht mehr vor. Mindestens zwei bleiben an, weil ein Kampf zwei Attacken braucht. Soll das Thema gar nicht vorkommen, schalten Sie oben „Thema anzeigen“ aus.`)}${keys.map((k) => sw(!offList(m).includes(k), `data-m="${m}" data-k="${k}"`, `${c.modules[k].icon} ${esc(c.modules[k].name)}`, `<span>${esc(ELTERN.INFO[m][k])}</span><button class="linkbtn" data-info="${k}">Beispiel ansehen</button>`)).join('')}${msg}`);
      },
      how: () => card('Lernquest passt sich an', '<p>Lernquest merkt, was Ihr Kind schon kann. Läuft es gut, werden die Aufgaben schwerer. Hakt es, werden sie leichter. So bleibt das Üben weder langweilig noch zu schwer.</p><p>Es gibt keine Uhr und keinen Zeitdruck.</p>')
        + card('Was ist eine Stufe?', `<p>Jede Aufgabenart hat Stufen, von leicht nach schwer.</p><p>Beispiel Addition: Auf Stufe 1 steht 23 + 45, auf Stufe 3 steht 234 + 152.</p><p>Lernquest merkt sich die Stufe. Ein neues Abenteuer beginnt zum Aufwärmen eine Stufe tiefer.</p><p>${ELTERN.TURM.level}</p>`)
        + card('Wann wird es schwerer?', '<p>Lernquest schaut bei jeder Aufgabenart auf die letzten Aufgaben.</p><ul class="plist"><li><b>5 von 6 richtig:</b> eine Stufe höher.</li><li><b>2 von 3 falsch:</b> eine Stufe zurück.</li></ul><p>Danach zählt Lernquest von vorn. Etwa jede vierte Aufgabe kommt von der Stufe darunter. Löst Ihr Kind in einem Abenteuer weniger als zwei Drittel richtig, trifft der Gegner nach einem Fehler nicht so hart.</p>')
        + card('Was ist eine Welt?', '<p>Ein Abenteuer führt durch eine bis drei Welten. In jeder neuen Welt kommen höhere Stufen und neue Aufgabenarten dazu.</p><p>Beispiel Zahlenquest: In Welt 1 bleiben alle Zahlen unter 100. Das schriftliche Rechnen beginnt erst in Welt 3.</p>')
        + card('Was passiert bei einem Fehler?', '<p>Ihr Kind sieht sofort die richtige Lösung. Niemand schimpft, es geht einfach weiter.</p><p>Wissensfragen, die falsch waren, kommen bald wieder, bis sie sitzen.</p>')
        + card('Wie lernt mein Kind eine neue Aufgabenart?', '<p>Beim ersten Mal erklärt Lernquest die Aufgabenart in drei bis vier kurzen Schritten mit einem Beispiel.</p><p>Dieselben Erklärungen finden Sie unter „Fächer“ bei jeder Aufgabenart: „Beispiel ansehen“.</p>'),
      save: () => (backupDue() ? `<div class="card warncard pwarn" id="pwarn">${ico('warn')}<p>Der Spielstand wurde ${meta.backupAt ? 'seit über 30 Tagen' : 'noch nie'} gesichert.</p></div>` : '')
        + card('Spielstand sichern', `${note('Die Datei und der Code enthalten den ganzen Spielstand. Damit lässt er sich auf einem anderen Gerät laden oder später zurückholen.')}<button class="btn small" id="pexport">Spielstand sichern</button><div id="pout"></div>`)
        + `<div id="p-load">${card('Spielstand laden', `<input type="file" id="pfilein" class="sr-only" accept="text/plain,.txt"><label for="pfilein" class="btn small">Datei auswählen</label>${note('Die Datei „Lernquest-Spielstand-….txt“ aus „Dateien“, „Downloads“ oder einer Nachricht wählen.')}<label for="pcodein" class="pnote">Oder Code einfügen</label><textarea id="pcodein" class="codebox" rows="4" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea><p id="pimsg" role="status" class="cmsg"></p><div class="row"><button class="btn small" id="pmerge">Zusammenlegen</button><button class="btn small secondary" id="preplace">Ersetzen</button></div>${note('<b>Zusammenlegen</b> behält alles auf diesem Gerät und nimmt dazu, was im Code mehr ist. <b>Ersetzen</b> überschreibt alles auf diesem Gerät. Vor beidem fragt Lernquest noch einmal nach.')}`)}</div>`
        + card('Speicher', note(meta.storage.persisted ? 'Dieser Browser hebt den Spielstand dauerhaft auf.' : 'Dieser Browser darf den Spielstand löschen, wenn der Speicher knapp wird. Safari löscht ihn nach 7 Tagen ohne Besuch. Als App auf dem Startbildschirm ist er sicherer.')),
      app: () => card('Töne', sw(meta.sound, 'id="psound"', 'Töne an', '<span>Klick, Treffer, Fanfare und Applaus. Alle Klänge sind gemeinfrei (CC0).</span>'))
          + card('Vorlesen', sw(meta.speak, 'id="pspeak"', 'Aufgaben vorlesen', '<span>Ein Knopf bei jeder Aufgabe liest Frage und Antworten vor, in Klasse 1 und 2 von selbst. Es spricht nur eine Stimme, die auf Ihrem Gerät gespeichert ist, ohne Internet.</span>') + (meta.speak ? speakSettings() : ''))
        + card('Eltern-PIN', meta.pin ? `${note('Die PIN schützt den Elternbereich.')}<div class="row"><button class="btn small secondary" id="pchange">PIN ändern</button><button class="btn small secondary" id="pdel">PIN entfernen</button></div>` : `${note('Noch keine PIN festgelegt. Ohne PIN kann jeder hier alles ändern.')}<button class="btn small" id="pset">PIN festlegen</button>`)
        + card('Erklärungen', `${note('Jede Aufgabenart erklärt sich beim ersten Mal selbst. Hier können Sie alle Erklärungen noch einmal zeigen lassen.')}<button class="btn small secondary" id="rtut">Erklärungen wieder zeigen</button>${msg}`)
        + card('Idee oder Fehler', `${note('Schicken Sie uns Wünsche, Fehler oder Lob.')}<button class="btn small secondary" id="pfeedback">Idee oder Fehler melden</button>`)
        + `<p class="center muted">Lernquest, Version ${esc((document.querySelector('meta[name=app-version]') || {}).content || '?')}</p>`,
      show: () => card('Klassen', `${note('Ausgeschaltete Klassen verschwinden von der Startseite. Mindestens eine bleibt an.')}${CURRICULUM.map((g) => sw(grades().includes(g), `data-hide="grade:${g.grade}"`, esc(g.label), `<span>${g.subjects.map((x) => esc(x.subject)).join(', ')}</span>`)).join('')}${msg}`)
        + card('Extras', `${note('Ausgeschaltete Extras verschwinden von der Startseite und kommen in neuen Abenteuern nicht mehr vor. Was Ihr Kind dort schon gesammelt hat, bleibt gespeichert.')}${Object.entries(EXTRAS).map(([k, [t, d]]) => sw(extraOn(k), `data-hide="extra:${k}"`, esc(t), `<span>${esc(d)}</span>`)).join('')}`)
        + card('🏰 Turmwacht <span class="ptag">zum Ausprobieren</span>', sw(meta.turm.on, 'data-turmon', 'Turmwacht anzeigen', `<span>${esc(ELTERN.TURM.what)}</span>`) + note(ELTERN.TURM.beta))
        + (meta.turm.on ? turmSubjCard() : ''),
      reset: () => card('', `<p class="plead">Hier wird gelöscht. Vor jedem Löschen fragt Lernquest noch einmal nach.</p>${note('Tipp: Sichern Sie vorher den Spielstand unter „Spielstand“.')}`)
        + card('Statistik zurücksetzen', `${note('Löscht nur die Zahlen unter „Überblick“. Stempel, Monsterbuch und laufende Abenteuer bleiben.')}<button class="btn small secondary" id="rstats">Statistik zurücksetzen</button>`)
        + card('Alles löschen', `${note('Setzt Lernquest ganz auf Anfang: Abenteuer, Stempel, Monsterbuch, Statistik und Einstellungen.')}<button class="btn small danger" id="rall">Alles löschen</button>`),
    };
    render(`<div class="screen">${topbar('Elternbereich')}<nav class="ptabs" role="tablist" aria-label="Bereiche">${Object.entries(P_TABS).map(([id, [t, ic]]) => `<button role="tab" data-pt="${id}" aria-selected="${id === tab}">${ico(ic)}<span>${t}</span></button>`).join('')}</nav><div class="scroll"><div class="stack" id="p-${sub}">
      ${meta.pin || tab !== 'overview' ? '' : `<div class="card warncard pwarn">${ico('warn')}<p><b>Noch keine PIN.</b> Ohne PIN kann jeder hier alles ändern.</p><button class="btn small" id="pnew">PIN festlegen</button></div>`}
      ${tab === 'practice' && curGrade().subjects[pAt.subj] ? '' : `<div class="psubtabs" role="tablist" aria-label="${P_TABS[tab][0]}">${Object.entries(subs).map(([id, t]) => `<button role="tab" data-ps="${id}" aria-selected="${id === sub}">${t}</button>`).join('')}</div>`}
      ${pages[sub]()}
      </div></div><div class="bottom"><button class="btn" id="back">Zurück zu Lernquest</button></div></div>`, quiet);
    const on = (sel, fn) => app.querySelectorAll(sel).forEach((el) => { el.onclick = () => fn(el); });
    const say = (b, t) => { b.closest('.card').querySelector('.tmsg').textContent = t; };
    $('#back').onclick = () => back();
    on('[data-pt]', (b) => { pAt.tab = b.dataset.pt; redraw('.ptabs [aria-selected=true]'); });
    on('[data-ps]', (b) => { pAt.sub[tab] = b.dataset.ps; redraw('.psubtabs [aria-selected=true]'); });
    on('[data-pf]', (b) => { pAt.subj = +b.dataset.pf; pAt.mode = ''; redraw('#pback'); });
    on('#pback', () => { const i = pAt.subj; pAt.subj = -1; redraw(`[data-pf="${i}"]`); });
    on('[data-pm]', (b) => { const x = $('.pchips').scrollLeft; pAt.mode = b.dataset.pm; redraw('.pchips [aria-selected=true]'); $('.pchips').scrollLeft = x; });
    on('[data-info]', (b) => { const m = pAt.mode || curGrade().subjects[pAt.subj].modes[0]; const k = b.dataset.info; const M = MODES[m].modules[k];
      const tiers = Array.from({ length: M.maxTier }, (_, i) => [i + 1, tutOf(m, k, i + 1)]).filter((x) => x[1]);
      const ov = modal(`<h2>${M.icon} ${esc(M.name)}</h2><p>${esc(ELTERN.INFO[m][k])}</p><h3>So erklärt Lernquest es Ihrem Kind</h3>${tiers.length > 1 ? note('Die Stufen gehen von leicht nach schwer.') : ''}${tiers.map(([t, x]) => `${tiers.length > 1 ? `<h4>Stufe ${t}: ${esc(x.title)}</h4>` : ''}<ol>${x.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`).join('')}<button class="btn" id="ok">Schließen</button>`);
      $('#ok', ov).onclick = () => ov.remove(); $('#ok', ov).focus({ preventScroll: true }); });
    const newPin = () => setPin(() => screenParent('appsec', back), () => screenParent('appsec', back));
    on('#pnew, #pset, #pchange', newPin);
    on('#pdel', () => confirmBox('PIN entfernen?', '<p>Ohne PIN kann jeder den Elternbereich öffnen und alles ändern.</p>', 'Ja, PIN entfernen', () => { meta.pin = ''; saveAll(); again(); }, true));
    on('#pspeak', () => { meta.speak = !meta.speak; saveAll(); again(); });
    const sample = (v) => speak('Hallo! So klingt diese Stimme.', v);
    const sampleEn = 'Hello! This is how I sound.';
    on('[data-try]', (b) => sample(voices()[+b.dataset.try]));
    on('[data-voice]', (b) => { const v = voices()[+b.dataset.voice]; if (!v) return; meta.voiceName = v.name; saveAll(); again(); sample(v); });
    on('[data-try-en]', (b) => { const v = enVoices()[+b.dataset.tryEn]; speak(sampleEn, voice(), [sampleEn], v); });
    on('[data-voice-en]', (b) => { const v = enVoices()[+b.dataset.voiceEn]; if (!v) return; meta.voiceEn = v.name; saveAll(); again(); speak(sampleEn, voice(), [sampleEn], v); });
    const rate = $('#prate'); if (rate) rate.onchange = () => { meta.speakRate = +rate.value; saveAll(); sample(chosenVoice()); };
    if (TTS) TTS.onvoiceschanged = () => { if ($('#pspeak')) again(); }; // some browsers deliver their voices late
    on('#psound', () => { meta.sound = !meta.sound; saveAll(); if (meta.sound) { SFX.unlock(); setTimeout(SFX.right, 150); } again(); });
    on('#rtut', (b) => { meta.seenTut = {}; saveAll(); say(b, 'Erledigt. Alle Erklärungen erscheinen beim nächsten Mal wieder.'); });
    on('#pfeedback', () => screenFeedback(() => screenParent('appsec', back)));
    on('#rstats', () => confirmBox('Statistik zurücksetzen?', '<p>Alle Trefferquoten, die Zahl der Abenteuer und der Rekord der Turmwacht werden gelöscht. Stempel, Monsterbuch und laufende Abenteuer bleiben.</p><p>Das kann man nicht rückgängig machen.</p>', 'Ja, Statistik löschen', () => { meta.stats = defaultMeta().stats; meta.know = {}; meta.runs = 0; meta.wins = 0; meta.turm = Object.assign(defaultMeta().turm, { subjects: meta.turm.subjects, on: meta.turm.on }); saveAll(); again(); }, true));
    on('#rall', () => confirmBox('Wirklich alles löschen?', '<p>Alle Abenteuer, das Monsterbuch, die Statistik und die Einstellungen werden gelöscht.</p><p>Das kann man nicht rückgängig machen.</p>', 'Ja, alles löschen', () => { meta = defaultMeta(); run = null; for (const m of MODE_KEYS.concat('turm')) clear(KEY_RUN_FOR(m)); saveAll(); screenTitle(); }, true));
    const copy = (text, box, out) => { const tell = (t) => { $(out).textContent = t; }; const mark = () => { $(box).focus(); $(box).select(); tell('Der Text ist markiert. Bitte jetzt kopieren.'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => tell('Kopiert.'), mark); else mark(); };
    on('#wcopy', () => copy(report.text, '#wtext', '#wmsg'));
    on('#pexport', async () => {
      meta.backupAt = new Date().toISOString(); saveAll(); if ($('#pwarn')) $('#pwarn').remove();
      const full = saveData(false); const code = await packSave(full); const link = (c) => SITE + '#lade=' + c;
      let qr = QR.svg(link(qrCode(code)), 'QR-Code mit dem Spielstand'), short = false;
      if (!qr) { qr = QR.svg(link(qrCode(await packSave(saveData(true)))), 'QR-Code mit einer Kurzfassung des Spielstands'); short = !!qr; }
      $('#pout').innerHTML = `${summaryHtml(full)}<label for="pcode" class="pnote">Code</label><textarea id="pcode" class="codebox" rows="4" readonly>${esc(code)}</textarea><div class="row"><button class="btn small" id="pfile">Als Datei sichern</button><button class="btn small secondary" id="pcopy">Kopieren</button>${navigator.share ? '<button class="btn small secondary" id="pshare">Teilen</button>' : ''}</div><p id="pcmsg" role="status" class="pnote"></p>
        ${qr ? `<div class="qrbox">${qr}</div>${note((short ? 'Der QR-Code enthält eine Kurzfassung ohne laufende Abenteuer. Den ganzen Spielstand gibt es als Datei oder Code. ' : '') + 'Mit der Kamera des anderen Geräts den QR-Code öffnen, dann fragt Lernquest nach. Ist Lernquest dort als App installiert, den Code lieber in der App einfügen.')}` : note('Für einen QR-Code ist der Spielstand zu groß. Bitte die Datei oder den Code benutzen.')}`;
      $('#pcopy').onclick = () => copy(code, '#pcode', '#pcmsg');
      // .txt: Android shares only known file types, the iPhone file picker greys out unknown ones; the link line is what unpackSave reads
      const d = new Date(full.at), day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const file = new File([`Lernquest-Spielstand vom ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}\nIn Lernquest unter Eltern › Einstellungen › Spielstand „Datei auswählen“ tippen und diese Datei wählen.\n${link(code)}\n`], `Lernquest-Spielstand-${day}.txt`, { type: 'text/plain' });
      const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = file.name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1e4); $('#pcmsg').textContent = 'Die Datei liegt im Download-Ordner.'; };
      // share inside the tap itself: iOS refuses it after an await; the iPhone app has no downloads, so sharing comes first
      $('#pfile').onclick = () => (navigator.canShare && navigator.canShare({ files: [file] }) ? navigator.share({ files: [file], title: 'Lernquest-Spielstand' }).catch((e) => { if (e.name !== 'AbortError') download(); }) : download());
      if ($('#pshare')) $('#pshare').onclick = () => navigator.share({ title: 'Lernquest-Spielstand', text: link(code) }).catch(() => { });
    });
    const readCode = async (how) => {
      let s; try { s = await unpackSave($('#pcodein').value); } catch (e) { $('#pimsg').classList.remove('ok'); $('#pimsg').textContent = e.message; return; }
      if (how === 'merge') confirmBox('Spielstände zusammenlegen?', `${summaryHtml(s)}<p>Alles auf diesem Gerät bleibt. Dazu kommt, was in diesem Spielstand mehr ist.</p>`, 'Ja, zusammenlegen', () => applySave(s, how));
      else confirmBox('Alles ersetzen?', `${summaryHtml(s)}<p>Alles auf diesem Gerät wird durch diesen Spielstand ersetzt. Das kann man nicht rückgängig machen.</p>`, 'Ja, ersetzen', () => applySave(s, how), true);
    };
    if ($('#pfilein')) $('#pfilein').onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return; const msg = $('#pimsg'); msg.classList.remove('ok');
      try { if (f.size > 5e6) throw 0; const text = await f.text(); await unpackSave(text); $('#pcodein').value = text; msg.textContent = 'Datei gelesen. Jetzt „Zusammenlegen“ oder „Ersetzen“ wählen.'; msg.classList.add('ok'); } catch (err) { msg.textContent = 'Das ist keine Lernquest-Datei. Bitte die Datei „Lernquest-Spielstand-….txt“ wählen.'; }
      e.target.value = '';
    };
    on('#pmerge', () => readCode('merge')); on('#preplace', () => readCode('replace'));
    if (jump === 'load') { const el = $('#p-load'); const sc = $('.scroll'); sc.scrollTop = el.offsetTop - sc.offsetTop - 8; $('#pcodein').focus({ preventScroll: true }); }
    on('[data-grade]', (b) => { meta.grade = +b.dataset.grade; saveAll(); again(); });
    on('.switch[data-k]', (b) => {
      const m = b.dataset.m, k = b.dataset.k; const off = offList(m).slice(); const i = off.indexOf(k);
      if (i >= 0) off.splice(i, 1); else { if (!MODES[m].modules[k].shop && fightMods(m).filter((x) => !off.includes(x)).length <= 2) return say(b, 'Mindestens zwei Aufgabenarten müssen an bleiben.'); off.push(k); }
      meta.off[m] = off; saveAll(); again(); });
    const setHidden = (keys, hide) => { meta.hidden = meta.hidden.filter((x) => !keys.includes(x)).concat(hide ? keys : []); };
    const noGameLeft = (keys) => !curGrade().subjects.some((s) => s.modes.some((m) => shown(m) && !keys.includes('mode:' + m)));
    on('[data-hide]', (b) => {
      const key = b.dataset.hide; const hide = !meta.hidden.includes(key); const [kind, m, id] = key.split(':');
      if (hide && kind === 'mode' && noGameLeft([key])) return say(b, 'Mindestens ein Thema muss sichtbar bleiben.');
      if (hide && kind === 'en' && Object.keys(MK.EN_THEMES).every((t) => t === m || enOff().includes(t))) return say(b, 'Mindestens ein Thema muss an bleiben.');
      if (hide && kind === 'grade' && grades().length < 2) return say(b, 'Mindestens eine Klasse muss sichtbar bleiben.');
      // a hero that is a reward does not count: it may still be locked
      if (hide && kind === 'hero' && !REWARDS.some((r) => r.hero === id) && !MODES[m].starters.some((x) => x.id !== id && heroShown(m, x) && !REWARDS.some((r) => r.hero === x.id))) return say(b, 'Mindestens ein Held muss bleiben.');
      setHidden([key], hide); meta.grade = curGrade().grade; saveAll(); again(); });
    on('[data-turmon]', () => { meta.turm.on = !meta.turm.on; saveAll(); again(); });
    on('[data-tsub]', (b) => {
      const [g, s] = b.dataset.tsub.split(':'), all = Object.assign({}, meta.turm.subjects), cur = all[g] || [];
      if (!cur.includes(s) && cur.length >= 3) return say(b, 'Höchstens drei Fächer.');
      all[g] = cur.includes(s) ? cur.filter((x) => x !== s) : cur.concat(s);
      if (!all[g].length) delete all[g];
      meta.turm.subjects = Object.keys(all).length ? all : null; saveAll(); again(); });
    on('[data-hidesub]', (b) => {
      const keys = curGrade().subjects[+b.dataset.hidesub].modes.map((m) => 'mode:' + m); const hide = keys.some((k) => !meta.hidden.includes(k));
      if (hide && noGameLeft(keys)) return say(b, 'Mindestens ein Fach muss sichtbar bleiben.');
      setHidden(keys, hide); saveAll(); again(); });
  }

  /* ---------- Feedback ---------- */
  // The only external request. If sending fails, the prefilled form opens in a new tab.
  const FEEDBACK = { form: 'https://docs.google.com/forms/d/e/1FAIpQLSdJcDUJ8kqJWKyu5Y1UFrFHS0kRMuELfxjrACJxYK8k-QXDbw', entry: 'entry.1794178349' };
  function screenFeedback(back) {
    depth++;
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
  // turm: the rules without the screens, for the page tests
  window.__mq = { get run() { return run; }, normMeta, turm: { TW, start: startTurm, resume: () => (run = loadTurm()), ask: turmAsk, answer: turmAnswer, step: turmStep, reward: turmReward, buy: turmBuy, nextWave: turmNextWave, retry: turmRetry, screen: screenTurm, board: (o) => screenTurmBoard(o || {}), motion: (speed) => { turmSpeed = speed == null ? null : speed; }, say: { lines: (ev, names) => turmLines(ev, names).all, elite: turmEliteText, blocked: turmBlocked, gate: turmGateText, acc: accName } }, subjectOf, recordAnswer, get meta() { return meta; }, get mode() { return mode; }, screenMap, screenTitle, packSave, unpackSave, mergeMeta, weeklyGoals, screenWardrobe, screenTop, RECIPES, craft };
})();
