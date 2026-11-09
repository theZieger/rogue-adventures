(() => {
  const { rnd, pick, shuffle, TYPES, BEATS, ENEMY_MOVES, ITEMS, makeMap } = MQ;
  const MODES = {
    math: { modules: MQ.MODULES, starters: MQ.STARTERS, extra: MQ.EXTRA_ATTACKS, enemies: MQ.ENEMIES, events: MQ.EVENTS, tut: null, worlds: 3, title: 'Zahlenquest', icon: '🧮', sub: 'Rechnen und Zahlen' },
    ethik: MK.MODES.ethik,
    kartoffel: MK.MODES.kartoffel,
  };
  const MODE_KEYS = ['math', 'ethik', 'kartoffel'];
  // the title screen builds itself from this list
  const CURRICULUM = [
    { grade: 3, label: 'Klasse 3', subjects: [
      { subject: 'Mathe', modes: ['math'] },
      { subject: 'Ethik', modes: ['ethik'] },
      { subject: 'Sachkunde', modes: ['kartoffel'] },
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
  const defaultMeta = () => ({ runs: 0, wins: 0, dex: {}, seenTut: {}, stats: Object.fromEntries(MODE_KEYS.map((m) => [m, emptyStats(m)])), know: {}, knowSeq: 0, evoUnlocked: {}, bestWorld: 0, seenNews: '', grade: 3, off: {}, lastStarter: {}, sound: true });
  const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  // Saves must always load: missing/wrong-typed fields fall back to defaults, old names map to new ones.
  const RENAMES = { Flummibatz: 'Sumpfbrocken', Tropfling: 'Regenwicht', 'Zündi': 'Streichholzkopf', 'Großglibber': 'Moorschlund', Flatterfledi: 'Nachtschwinge', 'Kristallkäfer': 'Glaspanzer', Aschendrache: 'Ofenwurm', Sturmgeist: 'Sturmreiter',
    Zweifelgeist: 'Der Zweifler', Vergessgeist: 'Der Vergessliche', Verwechsler: 'Der Verwechsler', Schwindelgeist: 'Der Schwindler', 'Strenger Richter': 'Der strenge Richter',
    'Blubberrätsel': 'Tiefseerätsel', Rankenrechnen: 'Honigrechnung', Schattenschnitt: 'Rückwärtsgang', Sternenmal: 'Malmühle', 'Geheimrätsel': 'Zifferncode', Reihenrausch: 'Treppenlauf', Tintenfass: 'Druckerpresse', 'Wörterwirbel': 'Rezeptbuch' };
  function loadMeta() {
    const m = defaultMeta(); const raw = load(KEY_META, null);
    if (isObj(raw)) for (const k of Object.keys(m)) if (raw[k] != null && typeof raw[k] === typeof m[k] && Array.isArray(raw[k]) === Array.isArray(m[k])) m[k] = raw[k];
    for (const k of ['dex', 'seenTut', 'stats', 'know', 'evoUnlocked', 'off', 'lastStarter']) if (!isObj(m[k])) m[k] = {};
    for (const [o, n] of Object.entries(RENAMES)) if (m.dex[o]) { if (!m.dex[n]) m.dex[n] = m.dex[o]; delete m.dex[o]; }
    return m;
  }
  let meta = loadMeta();
  (function migrate() { const old = load('mathquest_meta_v1', null); if (old && !load(KEY_META, null)) { meta.runs = old.runs || 0; meta.wins = old.wins || 0; meta.dex = old.dex || {}; meta.bestWorld = old.bestWorld || 0; for (const k in (old.stats || {})) if (meta.stats.math[k]) meta.stats.math[k] = old.stats[k]; for (const k in (old.seenTut || {})) meta.seenTut['math:' + k] = true; save(KEY_META, meta); } })();
  const okStat = (v) => isObj(v) && Number.isFinite(v.c) && Number.isFinite(v.t) && Array.isArray(v.hist);
  for (const m of MODE_KEYS) { if (!isObj(meta.stats[m])) meta.stats[m] = emptyStats(m); for (const k of Object.keys(MODES[m].modules)) if (!okStat(meta.stats[m][k])) meta.stats[m][k] = { c: 0, t: 0, hist: [] }; }
  if (!Number.isFinite(meta.knowSeq)) meta.knowSeq = 0;
  let run = null;
  const curGrade = () => CURRICULUM.find((g) => g.grade === meta.grade) || CURRICULUM[0];
  const gradeTabs = () => `<div class="grades" role="group" aria-label="Klasse">${CURRICULUM.map((g) => `<button class="gradechip ${g === curGrade() ? 'on' : ''}" data-grade="${g.grade}" aria-pressed="${g === curGrade()}">${esc(g.label)}</button>`).join('')}</div>`;
  // switched off in the parent area; at least two stay on per mode
  const offList = (m) => (isObj(meta.off) && Array.isArray(meta.off[m]) ? meta.off[m] : []);
  const enabledMods = (m) => { const all = Object.keys(MODES[m || mode].modules); const on = all.filter((k) => !offList(m || mode).includes(k)); return on.length >= 2 ? on : all; };
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
    const M = MODULES_OF()[mod]; const s = STATS()[mod]; s.t++; if (ok) s.c++; s.hist.push(ok ? 1 : 0); if (s.hist.length > 40) s.hist.shift();
    if (task && task.qid) { meta.knowSeq++; MK.record(meta.know, task.qid, ok, meta.knowSeq); }
    const recent = s.hist.slice(-6); const acc = recent.reduce((a, b) => a + b, 0) / recent.length;
    // capped at the current world, otherwise the next world would start at its hardest tier
    if (run && recent.length >= 6) { const cur = tierFor(mod); if (acc >= 0.85) { run.tiers[mod] = Math.min(worldCapFor(mod), cur + 1); s.hist = []; } else if (acc < 0.5) { run.tiers[mod] = Math.max(1, cur - 1); s.hist = []; } }
  }
  function weakestModule() { let best = null, bestAcc = 2; for (const k of enabledMods()) { const s = STATS()[k]; const acc = s.t === 0 ? 0.6 : s.c / s.t; if (acc < bestAcc) { bestAcc = acc; best = k; } } return best; }
  function makeTask(mod, tier, opts) {
    run.recent = run.recent || {}; const rec = run.recent[mod] = run.recent[mod] || [];
    let t, sig;
    for (let i = 0; i < 12; i++) {
      if (mode === 'math') { t = MQ.generate(mod, tier, opts); t.kind = 'num'; t.group = mod + ':' + t.tier; sig = t.grid ? JSON.stringify(t.grid) : t.text; }
      else { t = MK.generate(mode, mod, tier, meta.know, meta.knowSeq, opts && opts.g ? { g: opts.g } : undefined); sig = t.qid; }
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
  function tutFor(group) { if (mode === 'math') { const [mod, tier] = group.split(':'); return Object.assign({ icon: MQ.MODULES[mod].icon }, MQ.TUT[mod][+tier] || MQ.TUT[mod][1]); } const t = CFG().tut[group]; const M = MODULES_OF()[group.split(':')[0]]; return Object.assign({ icon: M ? M.icon : '📖' }, t); }
  function showTutorial(group, note, onClose, auto) {
    const t = tutFor(group); const n = note && CFG().notes ? CFG().notes[note] : null;
    const ov = modal(`<h2>${t.icon} ${esc(t.title)}</h2><p class="muted" style="opacity:.8">${auto ? 'Neue Aufgabenart. So geht sie:' : 'So geht es:'}</p><ol>${t.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>${n ? `<div class="ex"><div style="font-size:16px;color:var(--ink-soft)">📄 Aus deinen Notizen: ${esc(n.title)}</div>${n.lines.map((l) => `<div>• ${esc(l)}</div>`).join('')}</div>` : ''}<button class="btn" id="tutok" style="margin-top:12px">Verstanden</button>`);
    $('#tutok', ov).focus({ preventScroll: true });
    $('#tutok', ov).onclick = () => { ov.remove(); meta.seenTut[tutKey(group)] = true; if (note) meta.seenTut[tutKey('note:' + note)] = true; saveAll(); if (onClose) onClose(); };
  }
  function ensureTutorial(task, then) { const needGroup = !meta.seenTut[tutKey(task.group)]; const needNote = task.note && !meta.seenTut[tutKey('note:' + task.note)]; if (needGroup || needNote) showTutorial(task.group, task.note, then, true); else then(); }

  /* ---------- Task UI ---------- */
  function runTask(task, opts, done) {
    opts = opts || {}; window.__task = task;
    if (task.kind !== 'num') return runChoiceTask(task, opts, done);
    const mod = task.mod; const nAns = task.answers.length; const MODULES = MODULES_OF();
    const values = Array(nAns).fill(''); let active = 0; let locked = false;
    const container = opts.container; const bottom = opts.bottom;
    const labelsFor = () => task.nb ? [`${task.nb} davor`, `${task.nb} danach`] : task.seq ? ['', '', ''] : [''];
    function cardHtml() {
      let body = '';
      if (task.riddle) body = `<div class="clues">${task.text.split('\n').map((c) => `<div>${esc(c)}</div>`).join('')}</div><div class="prompt">Welche Zahl bin ich?</div>`;
      else if (task.seq) body = `<div class="seq">${task.seq.join(', ')}, …</div><div class="prompt">Wie gehen die nächsten drei weiter?</div>`;
      else if (task.nb) body = `<div class="prompt">Welche ${task.nb}zahl kommt davor, welche danach?</div>`;
      else if (task.grid) { const g = task.grid; let cells = ''; for (let r = 0; r < g.size; r++) for (let c = 0; c < g.size; c++) { const isS = r === g.sr && c === g.sc, isT = r === g.tr && c === g.tc; cells += `<div class="${isS ? 'start' : ''}${isT ? ' target' : ''}">${isS ? g.base : isT ? '?' : ''}</div>`; } body = `<div class="grid">${cells}</div><div class="legend" data-step-r="${g.stepR}" data-step-d="${g.stepD}"><span>${arrow('r')} +${g.stepR}</span><span>${arrow('l')} −${g.stepR}</span><span>${arrow('d')} +${g.stepD}</span><span>${arrow('u')} −${g.stepD}</span></div><div class="prompt">Welche Zahl steht im Zielfeld?</div>`; }
      else body = `<div class="expr">${esc(task.text)}</div>`;
      let inputs = '';
      if (task.nb) inputs = `<div class="nbline"><div class="inpgroup"><div class="inp" data-i="0"></div><span>davor</span></div><div class="mid">${task.n}</div><div class="inpgroup"><div class="inp" data-i="1"></div><span>danach</span></div></div>`;
      else inputs = `<div class="inputs">${task.answers.map((_, i) => `<div class="inp" data-i="${i}"></div>`).join('')}</div>`;
      const a0 = task.answers[0]; const lo = Math.max(0, a0 - 1 - Math.floor(Math.random() * 3)); const hint = opts.hint ? `<div class="hintline">🌉 Tipp: ${task.answers.length > 1 ? 'Die erste Zahl' : 'Die Antwort'} liegt zwischen ${lo} und ${lo + 4}.</div>` : '';
      return `<div class="task"><div class="head">${MODULES[mod].icon} ${MODULES[mod].name}${opts.subtitle ? ` · ${esc(opts.subtitle)}` : ''}<button class="tut" type="button" aria-label="Erklärung anzeigen">🛈 Wie geht das?</button></div>${body}${hint}${inputs}<div id="fb" role="status" aria-live="polite"></div></div>`;
    }
    container.innerHTML = cardHtml();
    bottom.innerHTML = `<div class="numpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button data-k="${d}">${d}</button>`).join('')}<button class="del" data-k="del" aria-label="Löschen">⌫</button><button data-k="0">0</button><button class="ok" data-k="ok" aria-label="Antwort prüfen">✓</button>${opts.cancel ? `<button class="cancel" data-k="cancel" style="grid-column:1/-1">Abbrechen</button>` : ''}</div>`;
    const inps = Array.from(container.querySelectorAll('.inp'));
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
      else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && nAns > 1) { e.preventDefault(); active = (active + (e.key === 'ArrowLeft' ? nAns - 1 : 1)) % nAns; paint(); return; }
      if (!k) return; e.preventDefault(); press(k);
    };
    function press(k) {
      if (k === 'cancel') { done(null); return; }
      if (k === 'del') { values[active] = values[active].slice(0, -1); }
      else if (k === 'ok') {
        if (values.some((v) => v === '')) { const idx = values.findIndex((v) => v === ''); if (idx === active) return; active = idx; paint(); return; }
        submit(); return;
      }
      else { if (values[active].length < 3) values[active] += k; }
      paint();
    }
    function submit() {
      locked = true; keyHandler = null;
      const ok = values.every((v, i) => parseInt(v, 10) === task.answers[i]);
      if (opts.onResult) opts.onResult(ok); // game state changes now, so a reload can't undo the answer
      inps.forEach((el, i) => { el.classList.remove('active'); el.classList.add(parseInt(values[i], 10) === task.answers[i] ? 'ok' : 'bad'); });
      const fb = $('#fb', container);
      if (ok) { fb.innerHTML = `<div class="feedback good pop">Richtig! ✔</div>`; SFX.right(); }
      else { SFX.wrong(); const corr = task.answers.join(task.nb ? ' und ' : ', '); fb.innerHTML = `<div class="feedback bad ${reducedMotion ? '' : 'shake'}">Daneben<small>Richtig wäre: ${corr}</small></div>`; }
      if (fb.scrollIntoView) fb.scrollIntoView({ block: 'nearest' });
      bottom.innerHTML = `<button class="btn" id="next">Weiter</button>`;
      $('#next').focus();
      $('#next').onclick = () => done(ok);
    }
  }

  /* ---------- Choice / order / parts tasks ---------- */
  function runChoiceTask(task, opts, done) {
    const container = opts.container, bottom = opts.bottom; const M = MODULES_OF()[task.mod]; let locked = false;
    const head = `<div class="head">${M.icon} ${M.name}${opts.subtitle ? ` · ${esc(opts.subtitle)}` : ''}<button class="tut" type="button" aria-label="Erklärung anzeigen">🛈 Wie geht das?</button></div>`;
    // with two options crossing one out gives the answer away, so show the notes instead
    const strikeWrongOption = () => { if (task.options.length <= 2) { const n = task.note && CFG().notes ? CFG().notes[task.note] : null; $('#fb', container).insertAdjacentHTML('beforebegin', n ? `<div class="hintline">🌉 Tipp aus deinen Notizen „${esc(n.title)}“:<br>${n.lines.map((l) => esc(l)).join('<br>')}</div>` : '<div class="hintline">🌉 Tipp: Lies die Frage noch einmal ganz genau.</div>'); return; } const wrong = [...bottom.querySelectorAll('.opt')].filter((b) => task.options[+b.dataset.i] !== task.answer); const w = wrong[Math.floor(Math.random() * wrong.length)]; if (w) { w.disabled = true; w.classList.add('struck'); } $('#fb', container).insertAdjacentHTML('beforebegin', '<div class="hintline">🌉 Tipp: Eine falsche Antwort ist durchgestrichen.</div>'); };
    const finish = (ok, extraHtml) => {
      locked = true; const fb = $('#fb', container); if (ok) SFX.right(); else SFX.wrong();
      if (opts.onResult) opts.onResult(ok);
      fb.innerHTML = ok ? `<div class="feedback good pop">Richtig! ✔</div>` : `<div class="feedback bad ${reducedMotion ? '' : 'shake'}">Daneben<small>${extraHtml}</small></div>`;
      if (fb.scrollIntoView) fb.scrollIntoView({ block: 'nearest' });
      bottom.innerHTML = `<button class="btn" id="next">Weiter</button>`; $('#next').focus(); $('#next').onclick = () => done(ok);
    };
    if (task.kind === 'choice') {
      container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q).replace('___', '<span class="blank">____</span>')}</div><div id="fb" role="status" aria-live="polite"></div></div>`;
      bottom.innerHTML = `<div class="options ${task.cols === 2 ? 'two' : ''}">${task.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
      bottom.querySelectorAll('.opt').forEach((b) => { b.onclick = () => { if (locked) return; const ok = task.options[+b.dataset.i] === task.answer; b.classList.add(ok ? 'right' : 'wrong'); finish(ok, `Richtig wäre: ${esc(task.answer)}${task.why ? ' – ' + esc(task.why) : ''}`); }; });
      if (opts.hint) strikeWrongOption();
    } else if (task.kind === 'parts') {
      container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q)}</div>${potatoSVG({ highlight: task.part })}<div id="fb" role="status" aria-live="polite"></div></div>`;
      bottom.innerHTML = `<div class="options two">${task.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
      bottom.querySelectorAll('.opt').forEach((b) => { b.onclick = () => { if (locked) return; const ok = task.options[+b.dataset.i] === task.answer; b.classList.add(ok ? 'right' : 'wrong'); if (!ok) { const el = container.querySelector('[data-part="' + task.part + '"]'); if (el) el.classList.add('reveal'); } finish(ok, `Das ist: ${esc(task.answer)}`); }; });
      if (opts.hint) strikeWrongOption();
    } else if (task.kind === 'parts-find') {
      container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q)}</div>${potatoSVG({ clickable: true })}<div id="fb" role="status" aria-live="polite"></div></div>`;
      const pp = MK.PARTS.find((p) => p.id === task.part);
      bottom.innerHTML = `<p class="center muted" style="margin:6px 0">Tippe auf den Teil in der Pflanze.</p>${opts.hint && pp ? `<p class="center hintline">🌉 Tipp: Der Teil ist ${pp.ground === 'unten' ? 'unter' : 'über'} der Erde.</p>` : ''}`;
      container.querySelectorAll('[data-part]').forEach((g) => { g.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g.onclick(); } }; g.onclick = () => { if (locked) return; const ok = g.dataset.part === task.part; g.classList.add(ok ? 'hit-part' : 'miss-part'); if (!ok) { const el = container.querySelector('[data-part="' + task.part + '"]'); if (el) el.classList.add('reveal'); } finish(ok, `Hier leuchtet jetzt: ${esc(task.answer)}`); }; });
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

  /* ---------- Screens ---------- */
  function screenTitle() {
    render(`<div class="screen"><div class="scroll"><button class="soundbtn" id="snd" aria-label="${meta.sound ? 'Töne ausschalten' : 'Töne einschalten'}" aria-pressed="${!!meta.sound}">${meta.sound ? '🔊' : '🔇'}</button><div class="hero"><div class="logo">🎒</div><h1 id="logo">Lern­quest</h1><div class="sub">Jede Attacke ist eine Aufgabe.</div></div>
      <div class="stack" style="margin-top:16px">
        ${gradeTabs()}${(curGrade().subjects).map((sub) => sub.modes.map((m) => { const r = loadRun(m); const c = MODES[m]; return `<div class="card modecard"><div class="eyebrow">${esc(sub.subject)}</div><div class="row" style="align-items:center;gap:12px"><div style="font-size:40px" aria-hidden="true">${c.icon}</div><div style="flex:1"><h3>${c.title}</h3><div class="desc">${c.sub}</div></div></div><div class="row" style="margin-top:10px">${r ? `<button class="btn small" data-cont="${m}">Weiter${c.worlds > 1 ? ` (Welt ${r.world})` : ''}</button>` : ''}<button class="btn small ${r ? 'secondary' : ''}" data-new="${m}">${r ? 'Neu' : 'Starten'}</button></div></div>`; }).join('')).join('')}
        <button class="btn ghost" id="dex">Monsterbuch (${Object.keys(meta.dex).length})</button>
        <div class="row"><button class="btn ghost" id="news">Was ist neu?${hasNews() ? ' <span class="newbadge">Neu!</span>' : ''}</button><button class="btn ghost" id="feedback">Idee senden</button></div>
        <p class="center muted">Gespielt: ${meta.runs} · Gewonnen: ${meta.wins}</p>
      </div></div></div>`);
    let taps = 0; $('#logo').onclick = () => { taps++; if (taps >= 5) { taps = 0; screenParent(); } };
    app.querySelectorAll('[data-cont]').forEach((b) => { b.onclick = () => { mode = b.dataset.cont; run = loadRun(mode); if (run) resumeRun(); else screenTitle(); }; });
    app.querySelectorAll('[data-new]').forEach((b) => { b.onclick = () => { mode = b.dataset.new; const r = loadRun(mode); if (r) { const ov = modal(`<h2>Neues Abenteuer?</h2><p>Dein laufendes Abenteuer in „${MODES[mode].title}“ wird gelöscht.</p><div class="stack"><button class="btn" id="yes">Ja, neu starten</button><button class="btn secondary" id="no">Zurück</button></div>`); $('#yes', ov).onclick = () => { run = null; screenStarter(); /* old save is replaced only when the new adventure starts */ }; $('#no', ov).onclick = () => ov.remove(); } else screenStarter(); }; });
    $('#dex').onclick = screenDex;
    $('#news').onclick = screenNews;
    $('#feedback').onclick = () => screenFeedback(screenTitle);
    $('#snd').onclick = () => { meta.sound = !meta.sound; saveAll(); if (meta.sound) { SFX.unlock(); setTimeout(SFX.right, 150); } screenTitle(); };
    app.querySelectorAll('[data-grade]').forEach((b) => { b.onclick = () => { meta.grade = +b.dataset.grade; saveAll(); screenTitle(); }; });
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

  function screenStarter() {
    let sel = CFG().starters.length === 1 ? CFG().starters[0].id : null;
    // recommend the monster whose attacks were practised least (and not the one played last time)
    const S = CFG().starters; const last = meta.lastStarter[mode];
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
      ${CFG().starters.map((s) => `<button class="choice ${CFG().starters.length === 1 ? 'selected' : ''}" data-id="${s.id}">${monsterSVG(s.shape, TYPES[s.type].color, 0)}<div class="meta">${rec === s.id ? '<div class="recbadge">⭐ Empfohlen: übt Neues · 🐝 Bonus</div>' : ''}<div class="name">${s.names[0]}</div>${typeChip(s.type)}<div class="desc">${s.desc}<br>❤️ ${s.hp} LP · Attacken: ${[...new Set(s.attacks.map((a) => MODULES_OF()[a.mod].name))].join(', ')}</div></div></button>`).join('')}
      <div id="swapbox"></div>
      </div></div><div class="bottom"><div class="row"><button class="btn secondary" id="back">Zurück</button><button class="btn" id="go" ${sel ? '' : 'disabled'}>Start</button></div></div></div>`);
    $('#back').onclick = screenTitle;
    app.querySelectorAll('.choice[data-id]').forEach((b) => { b.onclick = () => { sel = b.dataset.id; app.querySelectorAll('.choice[data-id]').forEach((x) => x.classList.toggle('selected', x === b)); $('#go').disabled = false; paintSwap(); }; });
    paintSwap();
    $('#go').onclick = () => { if (!sel) return; const s = CFG().starters.find((x) => x.id === sel); run = { mode, world: 1, floor: 1, map: makeMapFor(1), hero: { id: s.id, evo: 0, level: 1, xp: 0, hp: s.hp, maxHp: s.hp, attacks: s.attacks.map((a) => ({ name: a.name, mod: a.mod })) }, items: ['trank'], tiers: Object.fromEntries(MODKEYS().map((k) => [k, 1])), path: [], shield: false };
      if (swap && swapOn) { const a = run.hero.attacks.find((x) => x.mod === swap.from); if (a) { a.mod = swap.to; a.name = CFG().extra[swap.to]; } }
      if (rec && sel === rec) run.items.push('stern');
      if (swap && swapOn) run.items.push('stern');
      meta.lastStarter[mode] = sel; meta.runs++; saveAll(); screenMap(); };
  }
  function makeMapFor(world) { const m = makeMap(world); if (CFG().school && world === 1) { m[1].forEach((n) => { n.t = 'school'; }); if (!m[4].some((n) => n.t === 'school')) m[4][0].t = 'school'; } return m;
  }

  const NODE_INFO = { fight: ['⚔️', 'Kampf'], elite: ['💀', 'Elite'], event: ['❓', 'Ereignis'], rest: ['🔥', 'Rast'], treasure: ['🎁', 'Schatz'], boss: ['👑', 'Boss'], school: ['✏️', 'Zeichenschule'] };
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
    render(`<div class="screen">${topbar(`${esc(heroName())} <span class="levelbadge">Lv ${h.level}</span>`)}
      <div style="padding:8px 16px 0"><div class="hpbar"><i style="width:${(h.hp / h.maxHp) * 100}%" class="${h.hp / h.maxHp < .3 ? 'low' : h.hp / h.maxHp < .6 ? 'mid' : ''}"></i></div><div class="row" style="justify-content:space-between;font-size:15px;font-weight:700"><span>❤️ ${h.hp} / ${h.maxHp}</span><span>⭐ ${h.xp} / ${xpNeeded(h.level)} XP</span></div><p class="maphint">Wähle deinen Weg – er sperrt andere. 💀 Elite ist schwer, dafür suchst du dir die Beute aus.</p></div>
      <div class="scroll"><div class="wmap" style="height:${H}px"><svg class="maplines" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${nodes}</div></div>
      <div class="bottom"><div class="row"><button class="btn secondary small" id="bag">🎒 Beutel (${run.items.length})</button><button class="btn ghost small" id="home">Titel</button></div></div></div>`);
    app.querySelectorAll('.node.open').forEach((b) => { b.onclick = () => { const ni = +b.dataset.n; run.path[run.floor - 1] = ni; const type = run.map[run.floor - 1][ni].t; run.node = { type }; saveAll(); enterNode(type); }; });
    $('#home').onclick = screenTitle;
    $('#bag').onclick = () => showBag(null);
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
      if (n.enemy.hp <= 0) return battleWon(b); // defeated just before the app closed: hand out the reward
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
    else if (type === 'event') screenEvent();
    else if (type === 'rest') screenRest();
    else if (type === 'treasure') screenTreasure();
    else if (type === 'school') screenSchool(1);
  }
  function advance() { run.floor++; run.shield = false; run.node = null; if (run.floor > 8) { if (run.world >= CFG().worlds) { screenVictory(); return; } run.world++; run.floor = 1; run.map = makeMapFor(run.world); run.path = []; meta.bestWorld = Math.max(meta.bestWorld, run.world); if (CFG().worldAttacks && CFG().worldAttacks[run.world]) { run.hero.attacks = CFG().worldAttacks[run.world].map((x) => ({ name: x.name, mod: x.mod })); } } saveAll(); screenMap(); }

  /* ---------- Battle ---------- */
  function startBattle(spec, hard) {
    // extra HP offsets weak-spot damage, so fights stay about as long
    const scale = ENEMY_HP * (1 + (run.floor - 1) * 0.03); const elite = hard && !spec.boss;
    const enemy = { name: spec.name, type: spec.type, shape: spec.shape, maxHp: Math.round(spec.hp * scale), hp: Math.round(spec.hp * scale), atk: Math.round(spec.atk * (1 + (run.floor - 1) * 0.02)) + (elite ? 1 : 0), boss: !!spec.boss, elite, weak: pickWeak() };
    meta.dex[spec.name] = { type: spec.type, shape: spec.shape, world: run.world, mode };
    if (run.node) { run.node.enemy = enemy; saveAll(); }
    const b = { enemy, log: `${enemy.name} taucht auf! 🎯 Schwachstelle: ${esc(weakName(enemy.weak))}.`, logCls: '', phase: 'choose' };
    renderBattle(b);
  }
  function renderBattle(b) {
    const h = run.hero, e = b.enemy;
    const pct = (a, m) => Math.max(0, (a / m) * 100);
    const hpcls = (a, m) => a / m < .3 ? 'low' : a / m < .6 ? 'mid' : '';
    const quiet = !!b.shown; b.shown = true;
    render(`<div class="screen">${topbar(e.boss ? '👑 Bosskampf' : e.elite ? '💀 Elitekampf' : '⚔️ Kampf')}
      <div class="arena">
        <div class="plate enemy"><div class="name">${esc(e.name)}</div><div class="plateline">${typeChip(e.type)}${BEATS[heroSpec().type] === e.type ? `<span class="advantage">💪 stark gegen ${TYPES[e.type].name}</span>` : ''}</div><div class="hpbar"><i class="${hpcls(e.hp, e.maxHp)}" style="width:${pct(e.hp, e.maxHp)}%"></i></div><div class="hptext">❤️ ${e.hp} / ${e.maxHp}</div></div>
        <div class="sprite enemy" id="fe">${monsterSVG(e.shape, TYPES[e.type].color, e.boss ? 1 : 0, 'enemy')}<i class="ground"></i></div>
        <div class="sprite hero" id="fh">${monsterSVG(heroSpec().shape, TYPES[heroSpec().type].color, h.evo)}<i class="ground"></i></div>
        <div class="plate hero"><div class="name">${esc(heroName())} <span class="levelbadge">Lv ${h.level}</span></div><div class="hpbar"><i class="${hpcls(h.hp, h.maxHp)}" style="width:${pct(h.hp, h.maxHp)}%"></i></div><div class="hptext">❤️ ${h.hp} / ${h.maxHp} ${run.shield ? '🛡️' : ''}</div><div class="xpbar" aria-label="Erfahrung"><i style="width:${Math.min(100, (h.xp / xpNeeded(h.level)) * 100)}%"></i></div></div>
      </div>
      <div class="log ${b.logCls}">${b.log}</div>
      <div class="taskwrap" id="taskwrap"></div>
      <div class="bottom" id="bottom"></div></div>`, quiet);
    announce(b.log.replace(/<[^>]+>/g, ''));
    if (b.phase === 'choose') renderAttackChoice(b);
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
        if (inf.weak) b.enemy.weak = pickWeak(atk.mod);
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
    b.phase = h.hp <= 0 ? 'over' : 'choose'; if (h.hp <= 0) endRun(); else saveAll(); renderBattle(b);
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
    if (!(e.boss && run.world >= CFG().worlds)) setTimeout(SFX.win, 150);
    if (e.elite && run.node) { run.node.enemy = null; run.node.reward = true; } else nodeDone();
    let evoMsg = '';
    if (e.boss && run.hero.evo < 2 && CFG().worlds > 1 && run.world < CFG().worlds) { run.hero.evo++; run.hero.maxHp += 15; heal(20); meta.evoUnlocked[run.hero.id + run.hero.evo] = true; const wa = CFG().worldAttacks && CFG().worldAttacks[run.world + 1]; evoMsg = `<div class="card center" style="margin-top:12px"><h3>Dein Monster entwickelt sich!</h3>${monsterSVG(heroSpec().shape, TYPES[heroSpec().type].color, run.hero.evo)}<p>Dein Monster ist jetzt <b>${esc(heroName())}</b>!</p>${wa ? `<p>Neue Attacken für die nächste Welt: ${wa.map((x) => esc(x.name)).join(', ')}</p>` : ''}</div>`; }
    saveAll();
    render(`<div class="screen">${topbar('Gewonnen!')}<div class="scroll"><div class="card center"><h2>${esc(e.name)} besiegt!</h2><p>+${xp} XP</p>${drops.map((d) => `<p>${ITEMS[d].icon} ${ITEMS[d].name} gefunden! <small class="muted" style="color:var(--ink-soft)">${esc(ITEMS[d].desc)}</small></p>`).join('')}${e.elite ? '<p>Als Beute suchst du dir gleich eine Belohnung aus.</p>' : ''}${msgs.map((m) => `<p style="color:var(--orange);font-weight:800">${m}</p>`).join('')}</div>${evoMsg}</div><div class="bottom"><button class="btn" id="next">${e.elite ? 'Beute aussuchen' : e.boss ? (run.world >= CFG().worlds ? 'Zum großen Finale' : 'Weiter zur nächsten Welt') : 'Weiter'}</button></div></div>`);
    $('#next').onclick = e.elite ? () => screenTreasure('elite') : advance;
  }

  /* ---------- Event ---------- */
  function screenEvent(resumeOpt) {
    const EV = CFG().events; if (!Number.isInteger(run.node && run.node.ev) || !EV[run.node.ev]) { if (run.node) run.node.ev = rnd(0, EV.length - 1); saveAll(); }
    const ev = run.node ? EV[run.node.ev] : pick(EV);
    render(`<div class="screen">${topbar('❓ Ereignis')}<div class="scroll"><div class="card"><h2>${esc(ev.title)}</h2><p style="font-size:20px">${esc(ev.text)}</p></div></div><div class="bottom"><div class="stack">${ev.opts.map((o, i) => `<button class="btn ${i ? 'secondary' : ''}" data-i="${i}">${esc(o.label)}</button>`).join('')}</div></div></div>`);
    const runOpt = (i) => { const o = ev.opts[i]; if (!o) return screenEvent();
      if (!o.task) { applyEffect(o.effect); showEffect(ev.title); return; }
      if (run.node) { run.node.opt = i; saveAll(); }
      const mod = o.task === 'any' || !enabledMods().includes(o.task) ? pick(enabledMods()) : o.task; const t = makeTask(mod, tierFor(mod), { g: o.g });
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
    if (eff.maxhp) { run.hero.maxHp += eff.maxhp; heal(eff.maxhp); lines.push(`💪 +${eff.maxhp} maximale Lebenspunkte`); }
    if (eff.item) { run.items.push(eff.item); lines.push(`${ITEMS[eff.item].icon} ${ITEMS[eff.item].name} erhalten`); }
    if (eff.xp) { const m = gainXp(eff.xp); lines.push(`⭐ +${eff.xp} XP`); lines.push(...m); }
    if (!lines.length) lines.push('Nichts passiert.');
    nodeDone(); saveAll(); return lines;
  }
  function showEffect(title) {
    const lines = (run.node && run.node.lines) || [];
    render(`<div class="screen">${topbar('❓ Ereignis')}<div class="scroll"><div class="card center"><h2>${esc(title)}</h2>${lines.map((l) => `<p>${l}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`);
    $('#next').onclick = advance;
  }

  /* ---------- Rest ---------- */
  function screenRest() {
    const weak = weakestModule(); const s = STATS()[weak]; const acc = s.t ? Math.round((s.c / s.t) * 100) : null; const MODULES = MODULES_OF();
    render(`<div class="screen">${topbar('🔥 Rast')}<div class="scroll"><div class="card center"><h2>Am Lagerfeuer</h2>${monsterSVG(heroSpec().shape, TYPES[heroSpec().type].color, run.hero.evo)}<p>❤️ ${run.hero.hp} / ${run.hero.maxHp}</p></div></div>
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
    if (run.node && !Array.isArray(run.node.chest)) { const [r1, r2] = shuffle(LOOT.rare); run.node.chest = [r1, elite ? r2 : pick(LOOT.chest.filter((x) => x !== r1)), free.length ? pick(free) : null]; saveAll(); }
    const [i1, i2, freeMod] = (run.node && run.node.chest) || [pick(LOOT.rare), pick(LOOT.chest), free.length ? pick(free) : null]; const itemOpt = (id) => ({ k: 'item', item: id, label: `${ITEMS[id].icon} ${ITEMS[id].name}`, desc: ITEMS[id].desc });
    const maxhp = { k: 'maxhp', label: '💪 +10 maximale LP', desc: 'Dein Monster wird zäher.' };
    const atkOpt = freeMod && free.includes(freeMod) ? { k: 'atk', mod: freeMod, label: `${MODULES[freeMod].icon} Neue Attacke: ${EXTRA_ATTACKS[freeMod]}`, desc: `${MODULES[freeMod].name} – ersetzt eine deiner Attacken.` } : null;
    const opts = elite ? [itemOpt(i1), itemOpt(i2), atkOpt || maxhp] : [itemOpt(i1), maxhp, atkOpt || itemOpt(i2)];
    render(`<div class="screen">${topbar(elite ? '💀 Beute' : '🎁 Schatz')}<div class="scroll"><p class="center">${elite ? 'Der Elitegegner hat etwas dagelassen. Wähle eine Belohnung:' : 'Du findest eine Truhe. Wähle eine Belohnung:'}</p><div class="stack">${opts.map((o, i) => `<button class="choice" data-i="${i}"><div class="meta"><div class="name">${o.label}</div><div class="desc">${o.desc}</div></div></button>`).join('')}</div></div></div>`);
    app.querySelectorAll('.choice').forEach((b) => { b.onclick = () => { const o = opts[+b.dataset.i]; if (o.k === 'item') run.items.push(o.item); if (o.k === 'maxhp') { run.hero.maxHp += 10; heal(10); } if (o.k === 'atk') { chooseSlot(o.mod); return; } saveAll(); advance(); }; });
  }
  function chooseSlot(mod) {
    const MODULES = MODULES_OF(); const EXTRA_ATTACKS = CFG().extra;
    render(`<div class="screen">${topbar('🎁 Neue Attacke')}<div class="scroll"><p class="center">Welche Attacke soll ${EXTRA_ATTACKS[mod]} ersetzen?</p><div class="stack">${heroAttacks().map((a, i) => `<button class="choice" data-i="${i}"><div class="meta"><div class="name">${esc(a.name)}</div><div class="desc">${MODULES[a.mod].icon} ${MODULES[a.mod].name} · Platz ${i + 1}</div></div></button>`).join('')}<button class="btn ghost" id="skip">Doch lieber behalten – dafür gibt es einen 🧪 Trank</button></div></div></div>`);
    app.querySelectorAll('.choice').forEach((b) => { b.onclick = () => { run.hero.attacks[+b.dataset.i] = { name: EXTRA_ATTACKS[mod], mod }; saveAll(); advance(); }; });
    $('#skip').onclick = () => { run.items.push('trank'); saveAll(); advance(); };
  }

  /* ---------- Zeichenschule ---------- */
  function screenSchool(step) {
    if (step > 6) { render(`<div class="screen">${topbar('✏️ Zeichenschule')}<div class="scroll"><div class="card center"><h2>Merk-Check</h2><p>Jetzt verschwinden die Namen. Weißt du noch, wie alle Teile heißen?</p>${potatoSVG({})}</div></div><div class="bottom"><button class="btn" id="go">Los!</button></div></div>`); $('#go').onclick = () => schoolCheck(MK.shuffle(MK.PARTS.map((p) => p.id)), 0); return; }
    render(`<div class="screen">${topbar(`✏️ Zeichenschule ${step} / 6`)}<div class="scroll"><div class="card"><h3>Schritt ${step}</h3><p>${esc(DRAW_STEPS[step - 1])}</p>${potatoSVG({ step, labels: true })}<p class="muted" style="color:var(--ink-soft)">Zeichne mit auf Papier. Die Namen stehen dabei.</p></div></div><div class="bottom"><div class="row">${step > 1 ? `<button class="btn secondary" id="prev">Zurück</button>` : ''}<button class="btn" id="next">${step < 6 ? 'Nächster Schritt' : 'Zum Merk-Check'}</button></div></div></div>`);
    $('#next').onclick = () => screenSchool(step + 1); if ($('#prev')) $('#prev').onclick = () => screenSchool(step - 1);
  }
  function schoolCheck(ids, i) {
    if (i >= ids.length) { const m = gainXp(20); nodeDone(); saveAll(); render(`<div class="screen">${topbar('✏️ Zeichenschule')}<div class="scroll"><div class="card center"><h2>Merk-Check bestanden</h2><p>⭐ +20 XP</p>${m.map((x) => `<p style="color:var(--orange);font-weight:800">${x}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`); $('#next').onclick = advance; return; }
    const part = MK.PARTS.find((p) => p.id === ids[i]); const others = MK.shuffle(MK.PARTS.filter((p) => p.id !== part.id)).slice(0, 3).map((p) => p.name);
    const t = { kind: 'parts', mod: 'parts', tier: 1, group: 'parts:1', note: 'teile', q: 'Wie heißt der leuchtende Teil?', part: part.id, options: MK.shuffle(others.concat([part.name])), answer: part.name, qid: 'p_' + part.id };
    render(`<div class="screen">${topbar(`✏️ Merk-Check ${i + 1} / ${ids.length}`)}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`);
    ensureTutorial(t, () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: 'Merk-Check', onResult: (ok) => { recordAnswer('parts', ok, t); saveAll(); } }, () => schoolCheck(ids, i + 1)));
  }

  /* ---------- End screens ---------- */
  function screenGameOver(b) {
    const world = run.world; const name = heroName(); const multi = CFG().worlds > 1;
    endRun(); run = null; setTimeout(SFX.lose, 200);
    render(`<div class="screen">${topbar('Besiegt')}<div class="scroll"><div class="card center"><h2>${esc(b.enemy.name)} war diesmal stärker.</h2><p>${esc(name)} muss sich ausruhen.${multi ? ` Du bist bis Welt ${world} gekommen.` : ''}</p><p>Alles, was du geübt hast, bleibt gespeichert. Das nächste Abenteuer beginnt bei Welt 1 mit einem ausgeruhten Monster.</p></div></div><div class="bottom"><div class="stack"><button class="btn" id="again">Neues Abenteuer</button><button class="btn ghost" id="home">Zum Titel</button></div></div></div>`);
    $('#again').onclick = screenStarter; $('#home').onclick = screenTitle;
  }
  function screenVictory() {
    meta.wins++; const name = heroName(); const spec = heroSpec(); const evo = run.hero.evo; const bs = CFG().enemies[CFG().worlds].boss; const bossName = bs.acc || bs.name;
    endRun(); run = null; setTimeout(SFX.finale, 300);
    render(`<div class="screen">${topbar('Sieg!')}<div class="confetti" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 6) * 0.35}s;--c:${['#FFC93C', '#4FC96A', '#3FA0FF', '#FF6A3D', '#FF6E8E'][i % 5]}"></i>`).join('')}</div><div class="scroll"><div class="card center"><h1 style="font-size:36px">${esc(bs.name)} ist besiegt!</h1>${monsterSVG(spec.shape, TYPES[spec.type].color, evo)}<p><b>${esc(name)}</b> ${CFG().worlds > 1 ? `hat ${CFG().worlds === 2 ? 'beide Welten' : 'alle drei Welten'} durchquert.` : 'ist am Ziel.'}</p><p>Gewonnene Abenteuer: ${meta.wins}</p></div></div><div class="bottom"><div class="stack"><button class="btn" id="again">Noch ein Abenteuer</button><button class="btn ghost" id="home">Zum Titel</button></div></div></div>`);
    $('#again').onclick = screenStarter; $('#home').onclick = screenTitle;
  }
  function screenDex() {
    const all = []; for (const m of MODE_KEYS) { const EN = MODES[m].enemies; for (const w of Object.keys(EN)) { for (const e of EN[w].normal) all.push(e); all.push(EN[w].elite); all.push(EN[w].boss); } }
    render(`<div class="screen">${topbar('Monsterbuch')}<div class="scroll"><div class="stack">${all.map((e) => { const seen = meta.dex[e.name]; return `<div class="choice" style="cursor:default">${seen ? monsterSVG(e.shape, TYPES[e.type].color, e.boss ? 1 : 0) : `<div class="mon" style="width:96px;height:96px;display:flex;align-items:center;justify-content:center;font-size:48px">❔</div>`}<div class="meta"><div class="name">${seen ? esc(e.name) : '???'}</div>${seen ? typeChip(e.type) : ''}<div class="desc">${seen ? `Welt ${seen.world}${e.boss ? ' · Boss' : ''}` : 'Noch nicht gesehen'}</div></div></div>`; }).join('')}</div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    $('#back').onclick = screenTitle;
  }
  function screenParent() {
    const tables = MODE_KEYS.map((m) => { const r = loadRun(m); const rows = Object.keys(MODES[m].modules).map((k) => { const s = meta.stats[m][k]; const acc = s.t ? Math.round((s.c / s.t) * 100) : 0; return `<tr><td>${MODES[m].modules[k].icon} ${MODES[m].modules[k].name}</td><td>${s.c} / ${s.t}</td><td><div class="bar" aria-label="${acc} %"><i style="width:${acc}%;background:${acc < 50 ? 'var(--red)' : acc < 80 ? 'var(--gold)' : 'var(--green)'}"></i></div></td><td>${acc} %</td><td>${r ? 'Stufe ' + (r.tiers[k] || 1) : '–'}</td></tr>`; }).join(''); return `<div class="card parent-stats" style="margin-bottom:12px"><h3>${MODES[m].icon} ${MODES[m].title}</h3><table><tr><th>Art</th><th>Richtig</th><th></th><th></th><th>Aktuell</th></tr>${rows}</table></div>`; }).join('');
    const weakFacts = Object.entries(meta.know).filter(([id, k]) => k.t >= 2 && k.c / k.t < 0.7).map(([id, k]) => { const q = MK.L_POOL.find((p) => p.id === id) || MK.K_POOL.find((p) => p.id === id.replace('_find', '')); return q ? `<div class="statrow"><span class="n">${esc(q.q)}</span><span>${k.c} / ${k.t}</span></div>` : ''; }).join('');
    const settings = `<div class="card parent-stats" style="margin-bottom:12px"><h3>🎛️ Was soll geübt werden?</h3><p class="muted" style="color:var(--ink-soft);margin:4px 0 8px">Ausgeschaltete Aufgabenarten kommen nicht mehr als Attacke, Ereignis oder Training vor. Mindestens zwei bleiben an. Gilt sofort, auch für laufende Abenteuer.</p>${MODE_KEYS.map((m) => `<h4 style="margin:10px 0 4px">${MODES[m].icon} ${MODES[m].title}</h4><div class="toggles">${Object.keys(MODES[m].modules).map((k) => { const on = !offList(m).includes(k); return `<button class="toggle ${on ? 'on' : ''}" data-m="${m}" data-k="${k}" aria-pressed="${on}">${on ? '✔' : '✖'} ${MODES[m].modules[k].icon} ${MODES[m].modules[k].name}</button>`; }).join('')}</div>`).join('')}<p id="tmsg" class="muted" role="status" style="color:var(--red);min-height:1em;margin:6px 0 0"></p></div>`;
    const soundCard = `<div class="card parent-stats" style="margin-bottom:12px"><h3>Töne</h3><p class="muted" style="color:var(--ink-soft);margin:4px 0 8px">Klick, Treffer, Fanfare und Applaus. Alle Klänge sind gemeinfrei (CC0).</p><button class="toggle ${meta.sound ? 'on' : ''}" id="psound" aria-pressed="${!!meta.sound}">${meta.sound ? '✔ Töne an' : '✖ Töne aus'}</button></div>`;
    render(`<div class="screen">${topbar('Elternbereich')}<div class="scroll">${settings}${soundCard}${tables}<div class="card parent-stats" style="margin-bottom:12px"><h3>Wissensfragen mit Schwierigkeiten</h3>${weakFacts || '<p class="muted" style="color:var(--ink-soft)">Noch keine – oder noch nicht genug gespielt.</p>'}</div>
      <p class="muted">Die Stufe passt sich an: 5 von 6 richtig → eine Stufe höher, weniger als die Hälfte → eine Stufe tiefer. Welt 1 in Mathe bleibt unter 100. Wissensfragen, die falsch waren, kommen schneller wieder.</p>
      <div class="stack" style="margin-top:14px"><button class="btn secondary" id="rtut">Alle Erklärungen wieder einmalig anzeigen</button><button class="btn secondary" id="rstats">Statistik zurücksetzen</button><button class="btn secondary" id="pfeedback">Idee oder Fehler melden</button><button class="btn ghost" id="rall">Alles löschen (Abenteuer, Monsterbuch, Statistik)</button></div></div><div class="bottom"><button class="btn" id="back">Zurück zum Spiel</button></div></div>`);
    $('#back').onclick = screenTitle;
    $('#rtut').onclick = () => { meta.seenTut = {}; saveAll(); screenParent(); };
    $('#rstats').onclick = () => { meta.stats = defaultMeta().stats; meta.know = {}; saveAll(); screenParent(); };
    $('#rall').onclick = () => { const ov = modal(`<h2>Wirklich alles löschen?</h2><p>Alle Abenteuer, das Monsterbuch, die Statistik und die Einstellungen werden gelöscht. Das kann man nicht rückgängig machen.</p><div class="stack"><button class="btn" id="yes" style="background:var(--red)">Ja, alles löschen</button><button class="btn secondary" id="no">Abbrechen</button></div>`); $('#no', ov).onclick = () => ov.remove(); $('#yes', ov).onclick = () => { meta = defaultMeta(); run = null; for (const m of MODE_KEYS) clear(KEY_RUN_FOR(m)); saveAll(); screenTitle(); }; };
    $('#pfeedback').onclick = () => screenFeedback(screenParent);
    $('#psound').onclick = () => { meta.sound = !meta.sound; saveAll(); if (meta.sound) { SFX.unlock(); setTimeout(SFX.right, 150); } screenParent(); };
    app.querySelectorAll('.toggle[data-k]').forEach((b) => { b.onclick = () => {
      const m = b.dataset.m, k = b.dataset.k; const off = offList(m).slice(); const i = off.indexOf(k);
      if (i >= 0) off.splice(i, 1); else { if (Object.keys(MODES[m].modules).length - off.length <= 2) { $('#tmsg').textContent = 'Mindestens zwei Aufgabenarten müssen an bleiben.'; return; } off.push(k); }
      meta.off[m] = off; saveAll(); const y = $('.scroll').scrollTop; screenParent(); $('.scroll').scrollTop = y; }; });
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

  screenTitle();
  window.__mq = { get run() { return run; }, get meta() { return meta; }, get mode() { return mode; }, screenMap, screenTitle };
})();
