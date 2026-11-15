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

  /* ---------- Changelog (CHANGELOG.md via tools/build.js) ---------- */
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

