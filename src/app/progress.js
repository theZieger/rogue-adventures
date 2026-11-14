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

