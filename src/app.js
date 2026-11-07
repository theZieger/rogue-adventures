/* ===== MathQuest App ===== */
(() => {
  const { rnd, pick, shuffle, TYPES, BEATS, ENEMY_MOVES, ITEMS, makeMap } = MQ;
  const MODES = {
    math: { modules: MQ.MODULES, starters: MQ.STARTERS, extra: MQ.EXTRA_ATTACKS, enemies: MQ.ENEMIES, events: MQ.EVENTS, tut: null, worlds: 3, title: 'Zahlenquest', icon: '🧮', sub: 'Mathe: Rechnen und Zahlen' },
    ethik: MK.MODES.ethik,
    kartoffel: MK.MODES.kartoffel,
  };
  const MODE_KEYS = ['math', 'ethik', 'kartoffel'];
  let mode = 'math';
  const CFG = () => MODES[mode];
  const MODULES_OF = () => CFG().modules;
  const MODKEYS = () => Object.keys(CFG().modules);
  const $ = (sel, el) => (el || document).querySelector(sel);
  const app = $('#app');
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Storage ---------- */
  const KEY_META = 'mathquest_meta_v2';
  const KEY_RUN_FOR = (m) => (m === 'math' ? 'mathquest_run_v1' : 'mathquest_run_' + m);
  function load(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } }
  function clear(key) { try { localStorage.removeItem(key); } catch (e) { } }

  const emptyStats = (m) => Object.fromEntries(Object.keys(MODES[m].modules).map((k) => [k, { c: 0, t: 0, hist: [] }]));
  const defaultMeta = () => ({ runs: 0, wins: 0, dex: {}, seenTut: {}, stats: Object.fromEntries(MODE_KEYS.map((m) => [m, emptyStats(m)])), know: {}, knowSeq: 0, evoUnlocked: {}, bestWorld: 0 });
  const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  // Load saved progress defensively: anything missing or of the wrong type falls back to the default,
  // so damaged storage can never stop the game from starting.
  function loadMeta() {
    const m = defaultMeta(); const raw = load(KEY_META, null);
    if (isObj(raw)) for (const k of Object.keys(m)) if (raw[k] != null && typeof raw[k] === typeof m[k] && Array.isArray(raw[k]) === Array.isArray(m[k])) m[k] = raw[k];
    for (const k of ['dex', 'seenTut', 'stats', 'know', 'evoUnlocked']) if (!isObj(m[k])) m[k] = {};
    return m;
  }
  let meta = loadMeta();
  (function migrate() { const old = load('mathquest_meta_v1', null); if (old && !load(KEY_META, null)) { meta.runs = old.runs || 0; meta.wins = old.wins || 0; meta.dex = old.dex || {}; meta.bestWorld = old.bestWorld || 0; for (const k in (old.stats || {})) if (meta.stats.math[k]) meta.stats.math[k] = old.stats[k]; for (const k in (old.seenTut || {})) meta.seenTut['math:' + k] = true; save(KEY_META, meta); } })();
  const okStat = (v) => isObj(v) && Number.isFinite(v.c) && Number.isFinite(v.t) && Array.isArray(v.hist);
  for (const m of MODE_KEYS) { if (!isObj(meta.stats[m])) meta.stats[m] = emptyStats(m); for (const k of Object.keys(MODES[m].modules)) if (!okStat(meta.stats[m][k])) meta.stats[m][k] = { c: 0, t: 0, hist: [] }; }
  if (!Number.isFinite(meta.knowSeq)) meta.knowSeq = 0;
  let run = null;
  // A saved adventure is only removed when it really ends (endRun) or is replaced by a new one –
  // never as a side effect of saving while no adventure is loaded.
  const saveAll = () => { save(KEY_META, meta); if (run && !run.over) save(KEY_RUN_FOR(run.mode), run); };
  function endRun() { if (run) { run.over = true; clear(KEY_RUN_FOR(run.mode)); } save(KEY_META, meta); }
  // A saved adventure must belong to a known hero and have the fields the game needs.
  function loadRun(m) {
    const r = load(KEY_RUN_FOR(m), null);
    const ok = isObj(r) && isObj(r.hero) && Array.isArray(r.map) && isObj(r.tiers) && Array.isArray(r.items) && Array.isArray(r.path) && Array.isArray(r.hero.attacks)
      && Number.isFinite(r.world) && Number.isFinite(r.floor) && Number.isFinite(r.hero.hp) && MODES[m].starters.some((s) => s.id === r.hero.id) && r.world >= 1 && r.world <= MODES[m].worlds && r.floor >= 1 && r.floor <= r.map.length;
    if (!ok) { if (r) clear(KEY_RUN_FOR(m)); return null; }
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
    // adapt the level, but never beyond what the current world uses – otherwise the next world would start at its hardest level
    if (run && recent.length >= 6) { const cur = tierFor(mod); if (acc >= 0.85) { run.tiers[mod] = Math.min(worldCapFor(mod), cur + 1); s.hist = []; } else if (acc < 0.5) { run.tiers[mod] = Math.max(1, cur - 1); s.hist = []; } }
  }
  function weakestModule() { let best = null, bestAcc = 2; for (const k of MODKEYS()) { const s = STATS()[k]; const acc = s.t === 0 ? 0.6 : s.c / s.t; if (acc < bestAcc) { bestAcc = acc; best = k; } } return best; }
  function makeTask(mod, tier, opts) {
    run.recent = run.recent || {}; const rec = run.recent[mod] = run.recent[mod] || [];
    let t, sig;
    for (let i = 0; i < 12; i++) {
      if (mode === 'math') { t = MQ.generate(mod, tier, opts); t.kind = 'num'; t.group = mod + ':' + t.tier; sig = t.grid ? JSON.stringify(t.grid) : t.text; }
      else { t = MK.generate(mode, mod, tier, meta.know, meta.knowSeq); sig = t.qid; }
      if (!rec.includes(sig)) break;
    }
    rec.push(sig); if (rec.length > 8) rec.shift();
    return t;
  }
  function heroAttacks() { const all = CFG().worldAttacks && run.world > 1; return run.hero.attacks.map((a, i) => Object.assign({}, a, { unlocked: all || run.hero.level >= [1, 3, 6, 10][i] })); }
  function gainXp(n) { run.hero.xp += n; let msgs = []; while (run.hero.xp >= xpNeeded(run.hero.level)) { run.hero.xp -= xpNeeded(run.hero.level); run.hero.level++; run.hero.maxHp += 8; run.hero.hp = Math.min(run.hero.maxHp, run.hero.hp + 8); msgs.push(`Level ${run.hero.level}!`); const idx = [1, 3, 6, 10].indexOf(run.hero.level); if (idx >= 0 && run.hero.attacks[idx]) msgs.push(`Neue Attacke: ${run.hero.attacks[idx].name}!`); } return msgs; }
  function heal(n) { run.hero.hp = Math.min(run.hero.maxHp, run.hero.hp + n); }

  /* ---------- Rendering primitives ---------- */
  let keyHandler = null; // set while a number task is open: physical keyboard works like the on-screen keypad
  function render(html) { keyHandler = null; app.innerHTML = html; }
  document.addEventListener('keydown', (e) => { if (keyHandler && !e.ctrlKey && !e.metaKey && !e.altKey && !$('.overlay')) keyHandler(e); });
  // one persistent live region, so screen readers reliably announce battle messages
  const live = document.createElement('div'); live.className = 'sr-only'; live.setAttribute('aria-live', 'polite'); live.setAttribute('role', 'status'); document.body.appendChild(live);
  function announce(text) { live.textContent = ''; setTimeout(() => { live.textContent = text; }, 50); }
  function topbar(title, extra) { return `<div class="topbar"><div class="title">${title}</div>${extra || ''}${run ? `<div class="world">${CFG().worlds > 1 ? `Welt ${run.world} · ` : ''}Etage ${run.floor}</div>` : ''}</div>`; }
  function modal(html) { const ov = document.createElement('div'); ov.className = 'overlay'; ov.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`; app.appendChild(ov); return ov; }

  /* ---------- Tutorials ---------- */
  function tutFor(group) { if (mode === 'math') { const [mod, tier] = group.split(':'); return Object.assign({ icon: MQ.MODULES[mod].icon }, MQ.TUT[mod][+tier] || MQ.TUT[mod][1]); } const t = CFG().tut[group]; const M = MODULES_OF()[group.split(':')[0]]; return Object.assign({ icon: M ? M.icon : '📖' }, t); }
  function showTutorial(group, note, onClose, auto) {
    const t = tutFor(group); const n = note && CFG().notes ? CFG().notes[note] : null;
    const ov = modal(`<h2>${t.icon} ${esc(t.title)}</h2><p class="muted" style="opacity:.8">${auto ? 'Das ist neu! So geht es:' : 'So geht es:'}</p><ol>${t.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>${n ? `<div class="ex"><div style="font-size:16px;color:var(--ink-soft)">📄 Aus deinen Notizen: ${esc(n.title)}</div>${n.lines.map((l) => `<div>• ${esc(l)}</div>`).join('')}</div>` : ''}<button class="btn" id="tutok" style="margin-top:12px">Verstanden!</button>`);
    $('#tutok', ov).focus();
    $('#tutok', ov).onclick = () => { ov.remove(); meta.seenTut[tutKey(group)] = true; if (note) meta.seenTut[tutKey('note:' + note)] = true; saveAll(); if (onClose) onClose(); };
  }
  function ensureTutorial(task, then) { const needGroup = !meta.seenTut[tutKey(task.group)]; const needNote = task.note && !meta.seenTut[tutKey('note:' + task.note)]; if (needGroup || needNote) showTutorial(task.group, task.note, then, true); else then(); }

  /* ---------- Task UI ---------- */
  // Renders a task card and numpad; calls done(ok)
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
      else if (task.grid) { const g = task.grid; let cells = ''; for (let r = 0; r < g.size; r++) for (let c = 0; c < g.size; c++) { const isS = r === g.sr && c === g.sc, isT = r === g.tr && c === g.tc; cells += `<div class="${isS ? 'start' : ''}${isT ? ' target' : ''}">${isS ? g.base : isT ? '?' : ''}</div>`; } body = `<div class="grid">${cells}</div><div class="legend"><span>⬇ +${g.stepD}</span><span>⬆ −${g.stepD}</span><span>➡ +${g.stepR}</span><span>⬅ −${g.stepR}</span></div><div class="prompt">Welche Zahl steht im Zielfeld?</div>`; }
      else body = `<div class="expr">${esc(task.text)}</div>`;
      let inputs = '';
      if (task.nb) inputs = `<div class="nbline"><div class="inpgroup"><div class="inp" data-i="0"></div><span>davor</span></div><div class="mid">${task.n}</div><div class="inpgroup"><div class="inp" data-i="1"></div><span>danach</span></div></div>`;
      else inputs = `<div class="inputs">${task.answers.map((_, i) => `<div class="inp" data-i="${i}"></div>`).join('')}</div>`;
      return `<div class="task"><div class="head">${MODULES[mod].icon} ${MODULES[mod].name}${opts.subtitle ? ` · ${esc(opts.subtitle)}` : ''}<button class="tut" type="button" aria-label="Erklärung anzeigen">🛈 Wie geht das?</button></div>${body}${inputs}<div id="fb" role="status" aria-live="polite"></div></div>`;
    }
    container.innerHTML = cardHtml();
    bottom.innerHTML = `<div class="numpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button data-k="${d}">${d}</button>`).join('')}<button class="del" data-k="del" aria-label="Löschen">⌫</button><button data-k="0">0</button><button class="ok" data-k="ok" aria-label="Antwort prüfen">✓</button>${opts.cancel ? `<button class="cancel" data-k="cancel" style="grid-column:1/-1">Abbrechen</button>` : ''}</div>`;
    const inps = Array.from(container.querySelectorAll('.inp'));
    function paint() { inps.forEach((el, i) => { el.textContent = values[i]; el.classList.toggle('active', i === active && !locked); }); }
    inps.forEach((el) => { el.onclick = () => { if (!locked) { active = +el.dataset.i; paint(); } }; });
    $('.tut', container).onclick = () => showTutorial(task.group, task.note);
    paint();
    bottom.onclick = (e) => {
      const b = e.target.closest('button'); if (!b || locked || !bottom.contains(b) || !b.dataset.k) return; press(b.dataset.k);
    };
    keyHandler = (e) => {
      if (locked) return; let k = null;
      if (/^[0-9]$/.test(e.key)) k = e.key; else if (e.key === 'Backspace' || e.key === 'Delete') k = 'del'; else if (e.key === 'Enter') k = 'ok';
      else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Tab') && nAns > 1) { e.preventDefault(); active = (active + ((e.key === 'ArrowLeft' || e.shiftKey) ? nAns - 1 : 1)) % nAns; paint(); return; }
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
      inps.forEach((el, i) => { el.classList.remove('active'); el.classList.add(parseInt(values[i], 10) === task.answers[i] ? 'ok' : 'bad'); });
      const fb = $('#fb', container);
      if (ok) { fb.innerHTML = `<div class="feedback good pop">Richtig! ✔</div>`; }
      else { const corr = task.answers.join(task.nb ? ' und ' : ', '); fb.innerHTML = `<div class="feedback bad ${reducedMotion ? '' : 'shake'}">Daneben<small>Richtig wäre: ${corr}</small></div>`; }
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
    const finish = (ok, extraHtml) => {
      locked = true; const fb = $('#fb', container);
      fb.innerHTML = ok ? `<div class="feedback good pop">Richtig! ✔</div>` : `<div class="feedback bad ${reducedMotion ? '' : 'shake'}">Daneben<small>${extraHtml}</small></div>`;
      if (fb.scrollIntoView) fb.scrollIntoView({ block: 'nearest' });
      bottom.innerHTML = `<button class="btn" id="next">Weiter</button>`; $('#next').focus(); $('#next').onclick = () => done(ok);
    };
    if (task.kind === 'choice') {
      container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q).replace('___', '<span class="blank">____</span>')}</div><div id="fb" role="status" aria-live="polite"></div></div>`;
      bottom.innerHTML = `<div class="options ${task.cols === 2 ? 'two' : ''}">${task.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
      bottom.querySelectorAll('.opt').forEach((b) => { b.onclick = () => { if (locked) return; const ok = task.options[+b.dataset.i] === task.answer; b.classList.add(ok ? 'right' : 'wrong'); finish(ok, `Richtig wäre: ${esc(task.answer)}${task.why ? ' – ' + esc(task.why) : ''}`); }; });
    } else if (task.kind === 'parts') {
      container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q)}</div>${potatoSVG({ highlight: task.part })}<div id="fb" role="status" aria-live="polite"></div></div>`;
      bottom.innerHTML = `<div class="options two">${task.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
      bottom.querySelectorAll('.opt').forEach((b) => { b.onclick = () => { if (locked) return; const ok = task.options[+b.dataset.i] === task.answer; b.classList.add(ok ? 'right' : 'wrong'); if (!ok) { const el = container.querySelector('[data-part="' + task.part + '"]'); if (el) el.classList.add('reveal'); } finish(ok, `Das ist: ${esc(task.answer)}`); }; });
    } else if (task.kind === 'parts-find') {
      container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q)}</div>${potatoSVG({ clickable: true })}<div id="fb" role="status" aria-live="polite"></div></div>`;
      bottom.innerHTML = `<p class="center muted" style="margin:6px 0">Tippe auf den Teil in der Pflanze.</p>`;
      container.querySelectorAll('[data-part]').forEach((g) => { g.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g.onclick(); } }; g.onclick = () => { if (locked) return; const ok = g.dataset.part === task.part; g.classList.add(ok ? 'hit-part' : 'miss-part'); if (!ok) { const el = container.querySelector('[data-part="' + task.part + '"]'); if (el) el.classList.add('reveal'); } finish(ok, `Hier leuchtet jetzt: ${esc(task.answer)}`); }; });
    } else if (task.kind === 'order') {
      const chosen = [];
      container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q)}</div><div class="orderlist" id="olist"></div><div id="fb" role="status" aria-live="polite"></div></div>`;
      const paint = () => { $('#olist', container).innerHTML = task.display.map((it) => { const pos = chosen.indexOf(it.id); return `<button class="oitem ${pos >= 0 ? 'picked' : ''}" data-id="${it.id}"><span class="num">${pos >= 0 ? pos + 1 : ''}</span><span>${esc(it.text)}</span></button>`; }).join(''); container.querySelectorAll('.oitem').forEach((b) => { b.onclick = () => { if (locked || chosen.includes(b.dataset.id)) return; chosen.push(b.dataset.id); paint(); }; }); $('#ocheck').disabled = chosen.length !== task.order.length; $('#oundo').disabled = chosen.length === 0; };
      bottom.innerHTML = `<div class="row"><button class="btn secondary" id="oundo">↶ Rückgängig</button><button class="btn" id="ocheck">✓ Prüfen</button></div>`;
      $('#oundo').onclick = () => { if (!locked) { chosen.pop(); paint(); } };
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
    render(`<div class="screen"><div class="scroll"><div class="hero"><div class="logo">🎒</div><h1 id="logo">Lern­quest</h1><div class="sub">Monster · Wissen · Abenteuer</div></div>
      <div class="stack" style="margin-top:16px">
        ${MODE_KEYS.map((m) => { const r = loadRun(m); const c = MODES[m]; return `<div class="card modecard"><div class="row" style="align-items:center;gap:12px"><div style="font-size:40px">${c.icon}</div><div style="flex:1"><h3>${c.title}</h3><div class="desc">${c.sub}</div></div></div><div class="row" style="margin-top:10px">${r ? `<button class="btn small" data-cont="${m}">Weiter (${c.worlds > 1 ? 'Welt ' + r.world + ', ' : ''}Etage ${r.floor})</button>` : ''}<button class="btn small ${r ? 'secondary' : ''}" data-new="${m}">${r ? 'Neu' : 'Starten'}</button></div></div>`; }).join('')}
        <button class="btn ghost" id="dex">Monsterbuch (${Object.keys(meta.dex).length})</button>
        <p class="center muted">Abenteuer gespielt: ${meta.runs} · Geschafft: ${meta.wins}</p>
      </div></div></div>`);
    let taps = 0; $('#logo').onclick = () => { taps++; if (taps >= 5) { taps = 0; screenParent(); } };
    app.querySelectorAll('[data-cont]').forEach((b) => { b.onclick = () => { mode = b.dataset.cont; run = loadRun(mode); if (run) resumeRun(); else screenTitle(); }; });
    app.querySelectorAll('[data-new]').forEach((b) => { b.onclick = () => { mode = b.dataset.new; const r = loadRun(mode); if (r) { const ov = modal(`<h2>Neues Abenteuer?</h2><p>Dein laufendes Abenteuer in „${MODES[mode].title}“ wird gelöscht.</p><div class="stack"><button class="btn" id="yes">Ja, neu starten</button><button class="btn secondary" id="no">Zurück</button></div>`); $('#yes', ov).onclick = () => { run = null; screenStarter(); /* old save is replaced only when the new adventure starts */ }; $('#no', ov).onclick = () => ov.remove(); } else screenStarter(); }; });
    $('#dex').onclick = screenDex;
  }

  function screenStarter() {
    let sel = CFG().starters.length === 1 ? CFG().starters[0].id : null;
    render(`<div class="screen">${topbar(CFG().starters.length === 1 ? 'Dein Held' : 'Wähle dein Monster')}<div class="scroll"><div class="stack">
      ${CFG().starters.map((s) => `<button class="choice ${CFG().starters.length === 1 ? 'selected' : ''}" data-id="${s.id}">${monsterSVG(s.shape, TYPES[s.type].color, 0)}<div class="meta"><div class="name">${s.names[0]}</div>${typeChip(s.type)}<div class="desc">${s.desc}<br>❤️ ${s.hp} LP · Attacken: ${[...new Set(s.attacks.map((a) => MODULES_OF()[a.mod].name))].join(', ')}</div></div></button>`).join('')}
      </div></div><div class="bottom"><div class="row"><button class="btn secondary" id="back">Zurück</button><button class="btn" id="go" ${sel ? '' : 'disabled'}>Los geht’s!</button></div></div></div>`);
    $('#back').onclick = screenTitle;
    app.querySelectorAll('.choice').forEach((b) => { b.onclick = () => { sel = b.dataset.id; app.querySelectorAll('.choice').forEach((x) => x.classList.toggle('selected', x === b)); $('#go').disabled = false; }; });
    $('#go').onclick = () => { if (!sel) return; const s = CFG().starters.find((x) => x.id === sel); run = { mode, world: 1, floor: 1, map: makeMapFor(1), hero: { id: s.id, evo: 0, level: 1, xp: 0, hp: s.hp, maxHp: s.hp, attacks: s.attacks.map((a) => ({ name: a.name, mod: a.mod })), combos: {} }, items: ['trank'], tiers: Object.fromEntries(MODKEYS().map((k) => [k, 1])), path: [], shield: false }; meta.runs++; saveAll(); screenMap(); };
  }
  function makeMapFor(world) { const m = makeMap(world); if (CFG().school && world === 1) { m[1] = ['school']; if (!m[4].includes('school')) m[4][0] = 'school'; } return m;
  }

  const NODE_INFO = { fight: ['⚔️', 'Kampf'], elite: ['💀', 'Elite'], event: ['❓', 'Ereignis'], rest: ['🔥', 'Rast'], treasure: ['🎁', 'Schatz'], boss: ['👑', 'Boss'], school: ['✏️', 'Zeichenschule'] };
  function screenMap() {
    const h = run.hero;
    const rows = run.map.map((nodes, fi) => { const f = fi + 1; const cls = f === run.floor ? 'current' : f < run.floor ? 'done' : 'future'; return `<div class="floor ${cls}"><div class="num">${f}</div>${nodes.map((n, ni) => `<button class="node ${run.path[fi] === ni ? 'taken' : ''}" data-f="${f}" data-n="${ni}" ${f !== run.floor ? 'tabindex="-1" disabled' : ''} aria-label="${NODE_INFO[n][1]}">${NODE_INFO[n][0]}<small>${NODE_INFO[n][1]}</small></button>`).join('')}</div>`; });
    render(`<div class="screen">${topbar(`${esc(heroName())} <span class="levelbadge">Lv ${h.level}</span>`)}
      <div style="padding:8px 16px 0"><div class="hpbar"><i style="width:${(h.hp / h.maxHp) * 100}%" class="${h.hp / h.maxHp < .3 ? 'low' : h.hp / h.maxHp < .6 ? 'mid' : ''}"></i></div><div class="row" style="justify-content:space-between;font-size:15px;font-weight:700"><span>❤️ ${h.hp} / ${h.maxHp}</span><span>⭐ ${h.xp} / ${xpNeeded(h.level)} XP</span></div></div>
      <div class="scroll"><p class="center muted">Wohin gehst du? Tippe auf ein Feld.</p><div class="map">${rows.join('')}</div></div>
      <div class="bottom"><div class="row"><button class="btn secondary small" id="bag">🎒 Beutel (${run.items.length})</button><button class="btn ghost small" id="home">Titel</button></div></div></div>`);
    app.querySelectorAll('.floor.current .node').forEach((b) => { b.onclick = () => { const ni = +b.dataset.n; run.path[run.floor - 1] = ni; const type = run.map[run.floor - 1][ni]; run.node = { type }; saveAll(); enterNode(type); }; });
    $('#home').onclick = screenTitle;
    $('#bag').onclick = () => showBag(null);
    const scroller = $('.scroll'); const cur = $('.floor.current'); if (cur && scroller) scroller.scrollTop = Math.max(0, cur.offsetTop - scroller.clientHeight / 2);
  }
  function showBag(inBattle) {
    const ov = modal(`<h2>🎒 Beutel</h2>${run.items.length ? `<div class="items">${run.items.map((it, i) => `<button class="item" data-i="${i}">${ITEMS[it].icon} ${ITEMS[it].name}</button>`).join('')}</div><p class="muted" style="opacity:.8;margin-top:10px" id="bagdesc">Tippe auf einen Gegenstand, um ihn zu benutzen.</p>` : '<p>Dein Beutel ist leer.</p>'}<button class="btn secondary" id="close" style="margin-top:10px">Schließen</button>`);
    $('#close', ov).onclick = () => ov.remove();
    ov.querySelectorAll('.item').forEach((b) => { b.onclick = () => { const it = ITEMS[run.items[+b.dataset.i]]; if (it.heal && run.hero.hp >= run.hero.maxHp) { $('#bagdesc', ov).textContent = 'Du hast schon volle Lebenspunkte.'; return; } if (it.shield && !inBattle) { $('#bagdesc', ov).textContent = 'Den Schild kannst du nur im Kampf benutzen.'; return; } run.items.splice(+b.dataset.i, 1); if (it.heal) heal(it.heal); if (it.shield) run.shield = true; saveAll(); ov.remove(); if (inBattle) inBattle(it); else screenMap(); }; });
  }

  // Continue a saved adventure exactly where it stopped: a node that was entered can't be swapped for another
  // one by closing the app, and a running fight continues with the same enemy and life points.
  function resumeRun() {
    const n = run.node;
    if (!isObj(n)) return screenMap();
    if (n.done) return advance();
    if (isObj(n.enemy) && n.enemy.hp > 0) return renderBattle({ enemy: n.enemy, log: 'Der Kampf geht weiter!', logCls: '', phase: 'choose' });
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
  function advance() { run.floor++; run.shield = false; run.node = null; if (run.floor > 8) { if (run.world >= CFG().worlds) { screenVictory(); return; } run.world++; run.floor = 1; run.map = makeMapFor(run.world); run.path = []; meta.bestWorld = Math.max(meta.bestWorld, run.world); if (CFG().worldAttacks && CFG().worldAttacks[run.world]) { run.hero.attacks = CFG().worldAttacks[run.world].map((x) => ({ name: x.name, mod: x.mod })); run.hero.combos = {}; } } saveAll(); screenMap(); }

  /* ---------- Battle ---------- */
  function startBattle(spec, hard) {
    const scale = 1 + (run.floor - 1) * 0.03;
    const enemy = { name: spec.name, type: spec.type, shape: spec.shape, maxHp: Math.round(spec.hp * scale), hp: Math.round(spec.hp * scale), atk: Math.round(spec.atk * (1 + (run.floor - 1) * 0.02)), boss: !!spec.boss, elite: hard && !spec.boss };
    meta.dex[spec.name] = { type: spec.type, shape: spec.shape, world: run.world, mode };
    if (run.node) { run.node.enemy = enemy; saveAll(); }
    const b = { enemy, log: `${enemy.name} taucht auf!`, logCls: '', phase: 'choose' };
    renderBattle(b);
  }
  function renderBattle(b) {
    const h = run.hero, e = b.enemy;
    const pct = (a, m) => Math.max(0, (a / m) * 100);
    const hpcls = (a, m) => a / m < .3 ? 'low' : a / m < .6 ? 'mid' : '';
    render(`<div class="screen">${topbar(e.boss ? '👑 Bosskampf' : e.elite ? '💀 Elitekampf' : '⚔️ Kampf')}
      <div class="arena">
        <div class="fighter" id="fh">${monsterSVG(heroSpec().shape, TYPES[heroSpec().type].color, h.evo)}<div class="name">${esc(heroName())} <span class="levelbadge">Lv ${h.level}</span></div><div class="hpbar"><i class="${hpcls(h.hp, h.maxHp)}" style="width:${pct(h.hp, h.maxHp)}%"></i></div><div class="hptext">❤️ ${h.hp} / ${h.maxHp} ${run.shield ? '🛡️' : ''}</div></div>
        <div class="fighter" id="fe">${monsterSVG(e.shape, TYPES[e.type].color, e.boss ? 1 : 0, 'enemy')}<div class="name">${esc(e.name)}</div>${typeChip(e.type)}<div class="hpbar"><i class="${hpcls(e.hp, e.maxHp)}" style="width:${pct(e.hp, e.maxHp)}%"></i></div><div class="hptext">❤️ ${e.hp} / ${e.maxHp}</div></div>
      </div>
      <div class="log ${b.logCls}">${b.log}</div>
      <div class="taskwrap" id="taskwrap"></div>
      <div class="bottom" id="bottom"></div></div>`);
    announce(b.log.replace(/<[^>]+>/g, ''));
    if (b.phase === 'choose') renderAttackChoice(b);
  }
  function renderAttackChoice(b) {
    const atks = heroAttacks(); const heroType = heroSpec().type; const MODULES = MODULES_OF();
    $('#bottom').innerHTML = `<div class="attacks">${atks.map((a, i) => { const eff = BEATS[heroType] === b.enemy.type; const combo = run.hero.combos[a.mod] || 0; return `<button class="atk ${a.unlocked ? '' : 'locked'}" data-i="${i}" ${a.unlocked ? '' : 'disabled'}><span class="n">${esc(a.name)}</span><span class="m">${MODULES[a.mod].icon} ${MODULES[a.mod].name}<span class="dmg">💥 ${MODULES[a.mod].dmg}${eff ? ' ×1,5' : ''}</span></span>${a.unlocked ? `<span class="combo" aria-label="Kombo ${combo} von 3">${[0, 1, 2].map((k) => `<b class="${k < combo ? 'on' : ''}"></b>`).join('')}</span>` : `<span class="m">🔒 ab Level ${[1, 3, 6, 10][i]}</span>`}</button>`; }).join('')}</div><div class="row" style="margin-top:8px"><button class="btn secondary small" id="bag">🎒 Beutel (${run.items.length})</button><span class="muted" style="align-self:center;font-size:14px">Kombo voll = Volltreffer</span></div>`;
    // a potion takes your turn; the shield doesn't – it waits for the enemy's next attack (also after a wrong answer)
    $('#bag').onclick = () => showBag((it) => { b.log = `${it.icon} ${it.name} benutzt!`; b.logCls = 'hit'; if (it.shield) { b.log = `${it.icon} Schild bereit! Der nächste Angriff wird geblockt.`; b.phase = 'choose'; renderBattle(b); } else enemyTurn(b, 1); });
    app.querySelectorAll('.atk:not(.locked)').forEach((btn) => { btn.onclick = () => chooseAttack(b, atks[+btn.dataset.i]); });
  }
  function chooseAttack(b, atk) {
    const tier = tierFor(atk.mod); const MODULES = MODULES_OF();
    let t = makeTask(atk.mod, tier, { elite: b.enemy.elite || b.enemy.boss });
    b.phase = 'task'; $('.screen').classList.add('tasking');
    ensureTutorial(t, () => {
      runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: atk.name }, (ok) => {
        recordAnswer(atk.mod, ok, t); const h = run.hero;
        if (ok) {
          let combo = (h.combos[atk.mod] || 0) + 1; let crit = false;
          if (combo >= 3) { crit = true; combo = 0; }
          h.combos[atk.mod] = combo;
          const eff = BEATS[heroSpec().type] === b.enemy.type;
          let dmg = MODULES[atk.mod].dmg + h.level * 2;
          if (eff) dmg = Math.round(dmg * 1.5);
          if (heroSpec().perk === 'crit' && !crit && Math.random() < 0.15) crit = true;
          if (crit) dmg *= 2;
          b.enemy.hp = Math.max(0, b.enemy.hp - dmg);
          if (heroSpec().perk === 'heal') heal(3);
          b.log = `${atk.name}: ${crit ? 'VOLLTREFFER! ' : eff ? 'Sehr effektiv! ' : 'Treffer! '}${dmg} Schaden`; b.logCls = crit ? 'crit' : 'hit';
          saveAll();
          if (b.enemy.hp <= 0) { renderBattle(b); $('#fe').classList.add('hurt'); setTimeout(() => { if (run) battleWon(b); }, 500); return; }
          renderBattle(b); $('#fe').classList.add('hurt');
          setTimeout(() => { if (run) enemyTurn(b, 1); }, 700);
        } else {
          h.combos[atk.mod] = 0;
          b.log = `${atk.name} geht daneben… ${b.enemy.name} hat einen freien Schlag!`; b.logCls = 'miss';
          saveAll(); renderBattle(b);
          setTimeout(() => { if (run) enemyTurn(b, 1.5); }, 900);
        }
      });
    });
  }
  function enemyTurn(b, mult) {
    const h = run.hero; const move = pick(ENEMY_MOVES);
    if (run.shield) { run.shield = false; b.log = `${b.enemy.name} greift mit ${move} an – dein Schild blockt alles! 🛡️`; b.logCls = 'hit'; }
    else { let dmg = Math.round(b.enemy.atk * mult * (0.85 + Math.random() * 0.3)); if (BEATS[b.enemy.type] === heroSpec().type) dmg = Math.round(dmg * 1.25); if (heroSpec().perk === 'tank') dmg = Math.round(dmg * 0.85); dmg = Math.max(1, dmg); h.hp = Math.max(0, h.hp - dmg); b.log = `${b.enemy.name} greift mit ${move} an: ${dmg} Schaden${mult > 1 ? ' (freier Schlag)' : ''}`; b.logCls = 'miss'; }
    b.phase = h.hp <= 0 ? 'over' : 'choose'; if (h.hp <= 0) endRun(); else saveAll(); renderBattle(b); $('#fh').classList.add('hurt');
    if (h.hp <= 0) setTimeout(() => screenGameOver(b), 600);
  }
  function battleWon(b) {
    const e = b.enemy; const xp = e.boss ? 60 : e.elite ? 35 : 18;
    const msgs = gainXp(xp); let drop = null;
    if (e.elite && Math.random() < 0.8) drop = pick(['trank', 'schild']); if (e.boss) drop = 'grosstrank'; if (!e.elite && !e.boss && Math.random() < 0.2) drop = 'beere';
    if (drop) run.items.push(drop);
    nodeDone();
    let evoMsg = '';
    if (e.boss && run.hero.evo < 2 && CFG().worlds > 1 && run.world < CFG().worlds) { run.hero.evo++; run.hero.maxHp += 15; heal(20); meta.evoUnlocked[run.hero.id + run.hero.evo] = true; const wa = CFG().worldAttacks && CFG().worldAttacks[run.world + 1]; evoMsg = `<div class="card center" style="margin-top:12px"><h3>✨ Entwicklung!</h3>${monsterSVG(heroSpec().shape, TYPES[heroSpec().type].color, run.hero.evo)}<p>Dein Monster ist jetzt <b>${esc(heroName())}</b>!</p>${wa ? `<p>Neue Attacken für die nächste Welt: ${wa.map((x) => esc(x.name)).join(', ')}</p>` : ''}</div>`; }
    saveAll();
    render(`<div class="screen">${topbar('Gewonnen!')}<div class="scroll"><div class="card center"><h2>🏆 ${esc(e.name)} besiegt!</h2><p>+${xp} XP${drop ? ` · ${ITEMS[drop].icon} ${ITEMS[drop].name} gefunden` : ''}</p>${msgs.map((m) => `<p style="color:var(--orange);font-weight:800">${m}</p>`).join('')}</div>${evoMsg}</div><div class="bottom"><button class="btn" id="next">${e.boss ? (run.world >= CFG().worlds ? 'Zum großen Finale' : 'Weiter zur nächsten Welt') : 'Weiter'}</button></div></div>`);
    $('#next').onclick = advance;
  }

  /* ---------- Event ---------- */
  function screenEvent() {
    const EV = CFG().events; if (!Number.isInteger(run.node && run.node.ev) || !EV[run.node.ev]) { if (run.node) run.node.ev = rnd(0, EV.length - 1); saveAll(); }
    const ev = run.node ? EV[run.node.ev] : pick(EV);
    render(`<div class="screen">${topbar('❓ Ereignis')}<div class="scroll"><div class="card"><h2>${esc(ev.title)}</h2><p style="font-size:20px">${esc(ev.text)}</p></div></div><div class="bottom"><div class="stack">${ev.opts.map((o, i) => `<button class="btn ${i ? 'secondary' : ''}" data-i="${i}">${esc(o.label)}</button>`).join('')}</div></div></div>`);
    app.querySelectorAll('.bottom .btn').forEach((btn) => { btn.onclick = () => { const o = ev.opts[+btn.dataset.i]; if (o.task) { const mod = o.task === 'any' ? pick(MODKEYS()) : o.task; const tier = tierFor(mod); const t = makeTask(mod, tier); render(`<div class="screen">${topbar('❓ ' + esc(ev.title))}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`); ensureTutorial(t, () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom') }, (ok) => { recordAnswer(mod, ok, t); applyEffect(ok ? o.win : o.lose, ok ? 'Geschafft!' : 'Leider daneben.'); })); } else applyEffect(o.effect, ev.title); }; });
  }
  function applyEffect(eff, title) {
    const lines = [];
    if (eff.hp) { if (eff.hp > 0) { heal(eff.hp); lines.push(`❤️ +${eff.hp} Lebenspunkte`); } else { run.hero.hp = Math.max(1, run.hero.hp + eff.hp); lines.push(`💔 ${eff.hp} Lebenspunkte`); } }
    if (eff.maxhp) { run.hero.maxHp += eff.maxhp; heal(eff.maxhp); lines.push(`💪 +${eff.maxhp} maximale Lebenspunkte`); }
    if (eff.item) { run.items.push(eff.item); lines.push(`${ITEMS[eff.item].icon} ${ITEMS[eff.item].name} erhalten`); }
    if (eff.xp) { const m = gainXp(eff.xp); lines.push(`⭐ +${eff.xp} XP`); lines.push(...m); }
    if (!lines.length) lines.push('Nichts passiert.');
    nodeDone(); saveAll();
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
    if (done >= total) { const m = gainXp(15); nodeDone(); saveAll(); render(`<div class="screen">${topbar('🔥 Training')}<div class="scroll"><div class="card center"><h2>Training geschafft!</h2><p>⭐ +15 XP</p>${m.map((x) => `<p style="color:var(--orange);font-weight:800">${x}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`); $('#next').onclick = advance; return; }
    const tier = tierFor(mod); const t = makeTask(mod, tier);
    render(`<div class="screen">${topbar(`🔥 Training ${done + 1} / ${total}`)}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`);
    const s = STATS()[mod]; const low = s.t >= 3 && s.c / s.t < 0.6;
    const go = () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: 'Übung' }, (ok) => { recordAnswer(mod, ok, t); saveAll(); training(mod, total, done + 1); });
    if (low && done === 0 && meta.seenTut[tutKey(t.group)]) showTutorial(t.group, t.note, go); else ensureTutorial(t, go);
  }

  /* ---------- Treasure ---------- */
  function screenTreasure() {
    const owned = run.hero.attacks.map((a) => a.mod); const free = MODKEYS().filter((k) => !owned.includes(k)); const MODULES = MODULES_OF(); const EXTRA_ATTACKS = CFG().extra;
    const opts = [{ k: 'item', label: `${ITEMS.trank.icon} Trank`, desc: ITEMS.trank.desc }, { k: 'maxhp', label: '💪 +10 maximale LP', desc: 'Dein Monster wird zäher.' }];
    if (free.length) { const m = pick(free); opts.push({ k: 'atk', mod: m, label: `${MODULES[m].icon} Neue Attacke: ${EXTRA_ATTACKS[m]}`, desc: `${MODULES[m].name} – ersetzt eine deiner Attacken.` }); } else opts.push({ k: 'shield', label: `${ITEMS.schild.icon} Schild`, desc: ITEMS.schild.desc });
    render(`<div class="screen">${topbar('🎁 Schatz')}<div class="scroll"><p class="center">Du findest eine Truhe. Wähle eine Belohnung:</p><div class="stack">${opts.map((o, i) => `<button class="choice" data-i="${i}"><div class="meta"><div class="name">${o.label}</div><div class="desc">${o.desc}</div></div></button>`).join('')}</div></div></div>`);
    app.querySelectorAll('.choice').forEach((b) => { b.onclick = () => { const o = opts[+b.dataset.i]; if (o.k === 'item') run.items.push('trank'); if (o.k === 'shield') run.items.push('schild'); if (o.k === 'maxhp') { run.hero.maxHp += 10; heal(10); } if (o.k === 'atk') { chooseSlot(o.mod); return; } saveAll(); advance(); }; });
  }
  function chooseSlot(mod) {
    const MODULES = MODULES_OF(); const EXTRA_ATTACKS = CFG().extra;
    render(`<div class="screen">${topbar('🎁 Neue Attacke')}<div class="scroll"><p class="center">Welche Attacke soll ${EXTRA_ATTACKS[mod]} ersetzen?</p><div class="stack">${heroAttacks().map((a, i) => `<button class="choice" data-i="${i}" ${a.unlocked ? '' : 'disabled'}><div class="meta"><div class="name">${esc(a.name)}</div><div class="desc">${MODULES[a.mod].icon} ${MODULES[a.mod].name} · Platz ${i + 1}${a.unlocked ? '' : ` · 🔒 erst ab Level ${[1, 3, 6, 10][i]}`}</div></div></button>`).join('')}<button class="btn ghost" id="skip">Doch lieber behalten</button></div></div></div>`);
    app.querySelectorAll('.choice:not([disabled])').forEach((b) => { b.onclick = () => { run.hero.attacks[+b.dataset.i] = { name: EXTRA_ATTACKS[mod], mod }; saveAll(); advance(); }; });
    $('#skip').onclick = () => { run.items.push('trank'); saveAll(); advance(); };
  }

  /* ---------- Zeichenschule ---------- */
  function screenSchool(step) {
    if (step > 6) { render(`<div class="screen">${topbar('✏️ Zeichenschule')}<div class="scroll"><div class="card center"><h2>Merk-Check</h2><p>Jetzt verschwinden die Namen. Weißt du noch, wie alle Teile heißen?</p>${potatoSVG({})}</div></div><div class="bottom"><button class="btn" id="go">Los!</button></div></div>`); $('#go').onclick = () => schoolCheck(MK.shuffle(MK.PARTS.map((p) => p.id)), 0); return; }
    render(`<div class="screen">${topbar(`✏️ Zeichenschule ${step} / 6`)}<div class="scroll"><div class="card"><h3>Schritt ${step}</h3><p>${esc(DRAW_STEPS[step - 1])}</p>${potatoSVG({ step, labels: true })}<p class="muted" style="color:var(--ink-soft)">Zeichne mit auf Papier. Die Namen stehen dabei.</p></div></div><div class="bottom"><div class="row">${step > 1 ? `<button class="btn secondary" id="prev">Zurück</button>` : ''}<button class="btn" id="next">${step < 6 ? 'Nächster Schritt' : 'Zum Merk-Check'}</button></div></div></div>`);
    $('#next').onclick = () => screenSchool(step + 1); if ($('#prev')) $('#prev').onclick = () => screenSchool(step - 1);
  }
  function schoolCheck(ids, i) {
    if (i >= ids.length) { const m = gainXp(20); nodeDone(); saveAll(); render(`<div class="screen">${topbar('✏️ Zeichenschule')}<div class="scroll"><div class="card center"><h2>Merk-Check geschafft!</h2><p>⭐ +20 XP</p>${m.map((x) => `<p style="color:var(--orange);font-weight:800">${x}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`); $('#next').onclick = advance; return; }
    const part = MK.PARTS.find((p) => p.id === ids[i]); const others = MK.shuffle(MK.PARTS.filter((p) => p.id !== part.id)).slice(0, 3).map((p) => p.name);
    const t = { kind: 'parts', mod: 'parts', tier: 1, group: 'parts:1', note: 'teile', q: 'Wie heißt der leuchtende Teil?', part: part.id, options: MK.shuffle(others.concat([part.name])), answer: part.name, qid: 'p_' + part.id };
    render(`<div class="screen">${topbar(`✏️ Merk-Check ${i + 1} / ${ids.length}`)}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`);
    ensureTutorial(t, () => runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: 'Merk-Check' }, (ok) => { recordAnswer('parts', ok, t); saveAll(); schoolCheck(ids, i + 1); }));
  }

  /* ---------- End screens ---------- */
  function screenGameOver(b) {
    const world = run.world; const name = heroName(); const multi = CFG().worlds > 1;
    endRun(); run = null;
    render(`<div class="screen">${topbar('Besiegt…')}<div class="scroll"><div class="card center"><h2>Oh nein!</h2><p>${esc(name)} wurde von ${esc(b.enemy.name)} besiegt.</p><p>${multi ? `Du bist bis Welt ${world} gekommen. ` : ''}Was du gelernt hast, bleibt – beim nächsten Mal klappt es bestimmt!</p></div></div><div class="bottom"><div class="stack"><button class="btn" id="again">Neues Abenteuer</button><button class="btn ghost" id="home">Zum Titel</button></div></div></div>`);
    $('#again').onclick = screenStarter; $('#home').onclick = screenTitle;
  }
  function screenVictory() {
    meta.wins++; const name = heroName(); const spec = heroSpec(); const evo = run.hero.evo; const bs = CFG().enemies[CFG().worlds].boss; const bossName = bs.acc || bs.name;
    endRun(); run = null;
    render(`<div class="screen">${topbar('Sieg!')}<div class="scroll"><div class="card center"><h1 style="font-size:36px">🎉 Du hast es geschafft!</h1>${monsterSVG(spec.shape, TYPES[spec.type].color, evo)}<p><b>${esc(name)}</b> hat ${esc(bossName)} besiegt${CFG().worlds > 1 ? ` und alle ${CFG().worlds === 3 ? 'drei' : 'zwei'} Welten gemeistert` : ''}!</p><p>Abenteuer geschafft: ${meta.wins}</p></div></div><div class="bottom"><div class="stack"><button class="btn" id="again">Noch ein Abenteuer</button><button class="btn ghost" id="home">Zum Titel</button></div></div></div>`);
    $('#again').onclick = screenStarter; $('#home').onclick = screenTitle;
  }
  function screenDex() {
    const all = []; for (const m of MODE_KEYS) { const EN = MODES[m].enemies; for (const w of Object.keys(EN)) { for (const e of EN[w].normal) all.push(e); all.push(EN[w].elite); all.push(EN[w].boss); } }
    render(`<div class="screen">${topbar('📖 Monsterbuch')}<div class="scroll"><div class="stack">${all.map((e) => { const seen = meta.dex[e.name]; return `<div class="choice" style="cursor:default">${seen ? monsterSVG(e.shape, TYPES[e.type].color, e.boss ? 1 : 0) : `<div class="mon" style="width:96px;height:96px;display:flex;align-items:center;justify-content:center;font-size:48px">❔</div>`}<div class="meta"><div class="name">${seen ? esc(e.name) : '???'}</div>${seen ? typeChip(e.type) : ''}<div class="desc">${seen ? `Welt ${seen.world}${e.boss ? ' · Boss' : ''}` : 'Noch nicht gesehen'}</div></div></div>`; }).join('')}</div></div><div class="bottom"><button class="btn secondary" id="back">Zurück</button></div></div>`);
    $('#back').onclick = screenTitle;
  }
  function screenParent() {
    const tables = MODE_KEYS.map((m) => { const r = loadRun(m); const rows = Object.keys(MODES[m].modules).map((k) => { const s = meta.stats[m][k]; const acc = s.t ? Math.round((s.c / s.t) * 100) : 0; return `<tr><td>${MODES[m].modules[k].icon} ${MODES[m].modules[k].name}</td><td>${s.c} / ${s.t}</td><td><div class="bar" aria-label="${acc} %"><i style="width:${acc}%;background:${acc < 50 ? 'var(--red)' : acc < 80 ? 'var(--gold)' : 'var(--green)'}"></i></div></td><td>${acc} %</td><td>${r ? 'Stufe ' + (r.tiers[k] || 1) : '–'}</td></tr>`; }).join(''); return `<div class="card parent-stats" style="margin-bottom:12px"><h3>${MODES[m].icon} ${MODES[m].title}</h3><table><tr><th>Art</th><th>Richtig</th><th></th><th></th><th>Aktuell</th></tr>${rows}</table></div>`; }).join('');
    const weakFacts = Object.entries(meta.know).filter(([id, k]) => k.t >= 2 && k.c / k.t < 0.7).map(([id, k]) => { const q = MK.L_POOL.find((p) => p.id === id) || MK.K_POOL.find((p) => p.id === id.replace('_find', '')); return q ? `<div class="statrow"><span class="n">${esc(q.q)}</span><span>${k.c} / ${k.t}</span></div>` : ''; }).join('');
    render(`<div class="screen">${topbar('👨‍👩‍👦 Elternbereich')}<div class="scroll">${tables}<div class="card parent-stats" style="margin-bottom:12px"><h3>Wissensfragen mit Schwierigkeiten</h3>${weakFacts || '<p class="muted" style="color:var(--ink-soft)">Noch keine – oder noch nicht genug gespielt.</p>'}</div>
      <p class="muted">Die Stufe passt sich an: 5 von 6 richtig → eine Stufe höher, weniger als die Hälfte → eine Stufe tiefer. Welt 1 in Mathe bleibt unter 100. Wissensfragen, die falsch waren, kommen schneller wieder.</p>
      <div class="stack" style="margin-top:14px"><button class="btn secondary" id="rtut">Alle Erklärungen wieder einmalig anzeigen</button><button class="btn secondary" id="rstats">Statistik zurücksetzen</button><button class="btn ghost" id="rall">Alles löschen (Abenteuer, Monsterbuch, Statistik)</button></div></div><div class="bottom"><button class="btn" id="back">Zurück zum Spiel</button></div></div>`);
    $('#back').onclick = screenTitle;
    $('#rtut').onclick = () => { meta.seenTut = {}; saveAll(); screenParent(); };
    $('#rstats').onclick = () => { meta.stats = defaultMeta().stats; meta.know = {}; saveAll(); screenParent(); };
    $('#rall').onclick = () => { meta = defaultMeta(); run = null; for (const m of MODE_KEYS) clear(KEY_RUN_FOR(m)); saveAll(); screenTitle(); };
  }

  screenTitle();
  window.__mq = { get run() { return run; }, get meta() { return meta; }, get mode() { return mode; }, screenMap, screenTitle };
})();
