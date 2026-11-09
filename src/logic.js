const MQ = (() => {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- Modules ---------- */
  const MODULES = {
    add: { name: 'Addition', icon: '➕', maxTier: 5, worldCap: [2, 4, 5], dmg: 10 },
    sub: { name: 'Subtraktion', icon: '➖', maxTier: 5, worldCap: [2, 4, 5], dmg: 12 },
    mul: { name: 'Einmaleins', icon: '✖️', maxTier: 3, worldCap: [2, 3, 3], dmg: 12 },
    riddle: { name: 'Zahlenrätsel', icon: '🔍', maxTier: 3, worldCap: [1, 2, 3], dmg: 16 },
    seq: { name: 'Zahlenfolgen', icon: '🔢', maxTier: 4, worldCap: [2, 3, 4], dmg: 14 },
    nb: { name: 'Nachbarzahlen', icon: '↔️', maxTier: 3, worldCap: [1, 2, 3], dmg: 10 },
    grid: { name: 'Zahlengitter', icon: '🧩', maxTier: 3, worldCap: [1, 2, 3], dmg: 16 },
    div: { name: 'Teilen', icon: '➗', maxTier: 3, worldCap: [1, 2, 3], dmg: 14 },
    rest: { name: 'Teilen mit Rest', icon: '🧺', maxTier: 2, worldCap: [1, 2, 2], dmg: 16 },
    rund: { name: 'Runden', icon: '🎯', maxTier: 3, worldCap: [1, 2, 3], dmg: 10 },
    dopp: { name: 'Verdoppeln und Halbieren', icon: '🪞', maxTier: 2, worldCap: [1, 2, 2], dmg: 10 },
  };
  const MODULE_KEYS = Object.keys(MODULES);

  /* ---------- Generators ---------- */
  function genAdd(t) {
    let a, b, c;
    if (t === 1) { do { a = rnd(10, 89); b = rnd(3, 89 - a + 10); } while (a + b > 99 || (a % 10) + (b % 10) > 9); return task(`${a} + ${b} = ?`, [a + b]); }
    if (t === 2) { do { a = rnd(11, 88); b = rnd(2, 99 - a); } while ((a % 10) + (b % 10) < 10 || a + b > 99); return task(`${a} + ${b} = ?`, [a + b]); }
    if (t === 3) { do { a = rnd(100, 899); b = rnd(10, 999 - a); } while ((a % 10) + (b % 10) > 9 || (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) > 9); return task(`${a} + ${b} = ?`, [a + b]); }
    if (t === 4) { do { a = rnd(100, 899); b = rnd(10, 999 - a); } while ((a % 10) + (b % 10) < 10 && (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) < 10); return task(`${a} + ${b} = ?`, [a + b]); }
    do { a = rnd(50, 500); b = rnd(20, 300); c = rnd(5, 199); } while (a + b + c > 999); return task(`${a} + ${b} + ${c} = ?`, [a + b + c]);
  }
  function genSub(t) {
    let a, b;
    // tier 1: no ten-crossing (Einer reichen), b ≥ 2, result ≥ 2
    if (t === 1) { do { a = rnd(5, 19); b = rnd(2, 9); } while (a % 10 < b || a - b < 2); return task(`${a} − ${b} = ?`, [a - b]); }
    if (t === 2) { do { a = rnd(21, 99); b = rnd(2, 9); } while (a % 10 >= b || a % 10 === 0); return task(`${a} − ${b} = ?`, [a - b]); }
    if (t === 3) { do { a = rnd(30, 99); b = rnd(11, a - 1); } while (a % 10 >= b % 10); return task(`${a} − ${b} = ?`, [a - b]); }
    if (t === 4) { do { a = rnd(110, 999); b = rnd(5, 99); } while (a % 100 >= b % 100 && a % 10 >= b % 10); return task(`${a} − ${b} = ?`, [a - b]); }
    do { a = rnd(20, 99); b = rnd(2, 19); } while (a % 10 >= b % 10); return task(`${a} − ? = ${a - b}`, [b], { reverse: true });
  }
  function genMul(t) {
    if (t === 1) { const a = rnd(2, 5), b = rnd(2, 10); return task(`${a} · ${b} = ?`, [a * b]); }
    // tier 2 is still world 1 (results must stay under 100), so 10 · 10 is excluded
    if (t === 2) { let a, b; do { a = rnd(2, 10); b = rnd(2, 10); } while (a * b >= 100); return task(`${a} · ${b} = ?`, [a * b]); }
    const a = rnd(2, 10), b = rnd(2, 10); return task(`? · ${a} = ${a * b}`, [b], { reverse: true });
  }

  function digits(n) { return { h: Math.floor(n / 100) % 10, z: Math.floor(n / 10) % 10, e: n % 10 }; }
  const CLUE_TYPES_2 = [
    (d) => d.z > 0 && d.e % d.z === 0 && d.e / d.z >= 2 ? { text: `Mein Einer ist ${d.e / d.z}-mal so groß wie mein Zehner.`, test: (x) => x.z > 0 && x.e === d.e / d.z * x.z } : null,
    (d) => d.e > d.z ? { text: `Mein Einer ist um ${d.e - d.z} größer als mein Zehner.`, test: (x) => x.e - x.z === d.e - d.z } : null,
    (d) => d.e < d.z ? { text: `Mein Einer ist um ${d.z - d.e} kleiner als mein Zehner.`, test: (x) => x.z - x.e === d.z - d.e } : null,
    (d) => ({ text: `Mein Zehner ist ${d.z}.`, test: (x) => x.z === d.z }),
    (d) => ({ text: `Mein Einer ist ${d.e}.`, test: (x) => x.e === d.e }),
    (d) => d.e === d.z ? { text: `Mein Einer und mein Zehner sind gleich.`, test: (x) => x.e === x.z } : null,
    (d) => ({ text: d.e % 2 === 0 ? `Ich bin eine gerade Zahl.` : `Ich bin eine ungerade Zahl.`, test: (x) => x.e % 2 === d.e % 2 }),
  ];
  const CLUE_TYPES_3 = [
    (d) => d.z > 0 && d.e % d.z === 0 && d.e / d.z >= 2 ? { text: `Mein Einer ist ${d.e / d.z}-mal so groß wie mein Zehner.`, test: (x) => x.z > 0 && x.e === d.e / d.z * x.z } : null,
    (d) => d.e > d.z ? { text: `Mein Einer ist um ${d.e - d.z} größer als mein Zehner.`, test: (x) => x.e - x.z === d.e - d.z } : null,
    (d) => d.e < d.z ? { text: `Mein Einer ist um ${d.z - d.e} kleiner als mein Zehner.`, test: (x) => x.z - x.e === d.z - d.e } : null,
    (d) => d.h < d.z ? { text: `Mein Hunderter ist um ${d.z - d.h} kleiner als mein Zehner.`, test: (x) => x.z - x.h === d.z - d.h } : null,
    (d) => d.h > d.z ? { text: `Mein Hunderter ist um ${d.h - d.z} größer als mein Zehner.`, test: (x) => x.h - x.z === d.h - d.z } : null,
    (d) => d.h > 0 && d.z % d.h === 0 && d.z / d.h >= 2 ? { text: `Mein Zehner ist ${d.z / d.h}-mal so groß wie mein Hunderter.`, test: (x) => x.h > 0 && x.z === d.z / d.h * x.h } : null,
    (d) => ({ text: `Mein Hunderter ist ${d.h}.`, test: (x) => x.h === d.h }),
    (d) => ({ text: `Mein Zehner ist ${d.z}.`, test: (x) => x.z === d.z }),
    (d) => ({ text: `Mein Einer ist ${d.e}.`, test: (x) => x.e === d.e }),
    (d) => ({ text: d.e % 2 === 0 ? `Ich bin eine gerade Zahl.` : `Ich bin eine ungerade Zahl.`, test: (x) => x.e % 2 === d.e % 2 }),
  ];
  const isRel = (c) => c.text.includes('-mal') || c.text.includes('größer') || c.text.includes('kleiner');
  function countMatches(clues, lo, hi) {
    let n = 0;
    for (let x = lo; x <= hi; x++) { const dx = digits(x); if (clues.every((c) => c.test(dx))) { n++; if (n > 1) break; } }
    return n;
  }
  function genRiddle(t) {
    const three = t >= 2;
    const lo = three ? 100 : 10, hi = three ? 999 : 99;
    const types = three ? CLUE_TYPES_3 : CLUE_TYPES_2;
    const maxClues = t === 3 ? 4 : 3, minRel = t === 3 ? 2 : 1;
    for (let attempt = 0; attempt < 300; attempt++) {
      const n = rnd(lo, hi); const d = digits(n);
      let clues = types.map((f) => f(d)).filter(Boolean);
      if (t === 1) clues = clues.filter((c) => !c.text.startsWith('Ich bin'));
      clues = shuffle(clues);
      let rel = clues.filter(isRel);
      if (t === 1) rel = rel.slice(0, 1);
      const ordered = rel.concat(clues.filter((c) => !isRel(c)));
      let chosen = [];
      for (const c of ordered) { chosen.push(c); if (countMatches(chosen, lo, hi) === 1) break; }
      if (countMatches(chosen, lo, hi) !== 1) continue;
      // drop every clue that is not needed for a unique solution (plain clues first, then relations)
      for (const c of chosen.filter((x) => !isRel(x)).concat(chosen.filter(isRel))) {
        const rest = chosen.filter((x) => x !== c);
        if (countMatches(rest, lo, hi) === 1) chosen = rest;
      }
      if (chosen.length >= 2 && chosen.length <= maxClues && chosen.filter(isRel).length >= minRel) {
        return task(chosen.map((c) => c.text).join('\n'), [n], { riddle: true, digits: three ? 3 : 2 });
      }
    }
    // fallback: a fixed digit plus relations to it (always unique, nothing redundant)
    let n, d; do { n = rnd(lo, hi); d = digits(n); } while (d.e === d.z || (three && d.h === d.z));
    const lines = [`Mein Zehner ist ${d.z}.`, d.e > d.z ? `Mein Einer ist um ${d.e - d.z} größer als mein Zehner.` : `Mein Einer ist um ${d.z - d.e} kleiner als mein Zehner.`];
    if (three) lines.push(d.h > d.z ? `Mein Hunderter ist um ${d.h - d.z} größer als mein Zehner.` : `Mein Hunderter ist um ${d.z - d.h} kleiner als mein Zehner.`);
    return task(lines.join('\n'), [n], { riddle: true, digits: three ? 3 : 2 });
  }
  function genSeq(t) {
    let start, step, step2 = null;
    if (t === 1) { step = rnd(2, 10); start = rnd(1, 99 - step * 6); }
    else if (t === 2) { step = -rnd(2, 10); start = rnd(-step * 6 + 1, 99); }
    else if (t === 3) { step = pick([5, 10, 20, 25, 50, 100, 11, 15]) * pick([1, -1]); start = step > 0 ? rnd(100, 999 - step * 6) : rnd(100 - step * 6, 999); }
    else { step = rnd(2, 9); step2 = rnd(2, 9); while (step2 === step) step2 = rnd(2, 9); start = rnd(100, 999 - (step + step2) * 4); }
    const seq = [start];
    for (let i = 1; i < 7; i++) seq.push(seq[i - 1] + (step2 === null ? step : (i % 2 === 1 ? step : step2)));
    return task(seq.slice(0, 4).join(', ') + ', …', seq.slice(4, 7), { seq: seq.slice(0, 4) });
  }
  function genNb(t) {
    // tier 1 (world 1): n ≤ 89 so both neighbours stay under 100
    if (t === 1) { let n; do { n = rnd(11, 89); } while (n % 10 === 0); const lo = Math.floor(n / 10) * 10; return task(`${n}`, [lo, lo + 10], { nb: 'Zehner', n }); }
    if (t === 2) { let n; do { n = rnd(101, 899); } while (n % 100 === 0); const lo = Math.floor(n / 100) * 100; return task(`${n}`, [lo, lo + 100], { nb: 'Hunderter', n }); }
    let n; do { n = rnd(101, 899); } while (n % 10 === 0); const lo = Math.floor(n / 10) * 10; return task(`${n}`, [lo, lo + 10], { nb: 'Zehner', n });
  }
  function genGrid(t, elite) {
    const size = 3;
    // like the Hundertertafel: one step right = +1, one step down = +10 (tier 3: ×10, so +10 and +100)
    const stepR = t >= 3 ? 10 : 1, stepD = t >= 3 ? 100 : 10;
    const sr = rnd(0, size - 1), sc = rnd(0, size - 1);
    let tr, tc; do { tr = rnd(0, size - 1); tc = rnd(0, size - 1); } while ((tr === sr && tc === sc) || (!elite && Math.abs(tr - sr) + Math.abs(tc - sc) > 2) || (elite && Math.abs(tr - sr) + Math.abs(tc - sc) < 2));
    let base;
    if (t === 1) base = rnd(25, 75); else if (t === 2) base = rnd(120, 870); else base = rnd(230, 760);
    const value = base + (tr - sr) * stepD + (tc - sc) * stepR;
    return task('', [value], { grid: { size, sr, sc, tr, tc, base, stepR, stepD } });
  }
  function genDiv(t) {
    let a, b;
    // tier 1 is world 1: dividends stay under 100
    if (t === 1) { do { a = rnd(2, 10); b = rnd(2, 10); } while (a * b >= 100); return task(`${a * b} : ${a} = ?`, [b]); }
    if (t === 2) { a = rnd(2, 9); b = rnd(2, 9) * 10; return task(`${a * b} : ${a} = ?`, [b]); }
    a = rnd(2, 10); b = rnd(2, 10);
    return pick([() => task(`? · ${a} = ${a * b}`, [b], { reverse: true }), () => task(`${a} · ? = ${a * b}`, [b], { reverse: true }), () => task(`${a * b} : ${a} = ?`, [b])])();
  }
  // zero: the division goes up (remainder 0) – the Bergwerk needs those for ore
  function genRest(t, zero) {
    // the quotient stays within the Einmaleins (at most 10)
    const hi = t === 1 ? 50 : 99; let n, d;
    if (zero) do { d = rnd(2, 9); n = d * rnd(2, 10); } while (n < 10 || n > hi);
    else do { d = rnd(2, 9); n = rnd(10, hi); } while (n % d === 0 || n < 2 * d || n > 10 * d + d - 1);
    return task(`${n} : ${d} = ?`, [Math.floor(n / d), n % d], { rest: true, labels: ['Ergebnis', 'Rest'] });
  }
  function genRund(t) {
    const to = t === 1 ? 10 : t === 2 ? 100 : pick([10, 100]);
    // n ≤ 94 (world 1) or ≤ 949 keeps the rounded number under 100 or 1000
    let n; do { n = to === 10 && t === 1 ? rnd(11, 94) : rnd(101, to === 10 ? 994 : 949); } while (n % to === 0);
    return task(`${n}`, [Math.round(n / to) * to], { ask: `Runde auf ${to === 10 ? 'Zehner' : 'Hunderter'}.` });
  }
  function genDopp(t) {
    if (Math.random() < 0.5) { const n = t === 1 ? rnd(6, 49) : rnd(51, 499); return task(`${n}`, [2 * n], { ask: 'Verdopple die Zahl.' }); }
    const n = 2 * (t === 1 ? rnd(6, 49) : rnd(51, 499)); return task(`${n}`, [n / 2], { ask: 'Halbiere die Zahl.' });
  }
  function task(text, answers, extra) { return Object.assign({ text, answers }, extra || {}); }

  function generate(mod, tier, opts) {
    tier = Math.max(1, Math.min(MODULES[mod].maxTier, tier));
    const g = { add: genAdd, sub: genSub, mul: genMul, riddle: genRiddle, seq: genSeq, nb: genNb, grid: (t) => genGrid(t, opts && opts.elite), div: genDiv, rest: (t) => genRest(t, opts && opts.zero), rund: genRund, dopp: genDopp }[mod];
    const tk = g(tier); tk.mod = mod; tk.tier = tier; return tk;
  }

  /* ---------- Tutorials ---------- */
  const TUT = {
    add: {
      1: { title: 'Plus rechnen', steps: ['Rechne zuerst die Zehner, dann die Einer.', '23 + 45: Zehner 20 + 40 = 60, Einer 3 + 5 = 8.', 'Zusammen: 68.'] },
      2: { title: 'Plus über den Zehner', steps: ['Wenn die Einer über 10 gehen, fülle erst den Zehner auf.', '37 + 8: 37 + 3 = 40, dann noch 5 dazu.', '40 + 5 = 45.'] },
      3: { title: 'Plus mit Hundertern', steps: ['Rechne Hunderter, Zehner und Einer getrennt.', '234 + 152: 200 + 100 = 300, 30 + 50 = 80, 4 + 2 = 6.', 'Zusammen: 386.'] },
      4: { title: 'Plus über Zehner und Hunderter', steps: ['Rechne in Schritten: erst die Hunderter, dann Zehner, dann Einer.', '367 + 258: 367 + 200 = 567, dann + 50 = 617, dann + 8 = 625.', 'Schritt für Schritt kommst du sicher ans Ziel.'] },
      5: { title: 'Drei Zahlen addieren', steps: ['Rechne erst zwei Zahlen zusammen, dann die dritte dazu.', '120 + 45 + 30: 120 + 45 = 165, dann 165 + 30 = 195.', 'Tipp: Fang mit den Zahlen an, die leicht zusammenpassen.'] },
    },
    sub: {
      1: { title: 'Minus rechnen', steps: ['Zähle rückwärts oder denke: Was fehlt bis zur großen Zahl?', '9 − 4: Von 4 bis 9 sind es 5.', 'Also 9 − 4 = 5.'] },
      2: { title: 'Minus über den Zehner', steps: ['Gehe erst bis zum vollen Zehner, dann den Rest.', '22 − 7: Erst 22 − 2 = 20. Es bleiben noch 5.', '20 − 5 = 15.'] },
      3: { title: 'Zweistellig minus zweistellig', steps: ['Ziehe erst die Zehner ab, dann die Einer.', '63 − 28: 63 − 20 = 43, dann 43 − 8.', '43 − 3 = 40, 40 − 5 = 35. Also 35.'] },
      4: { title: 'Minus mit Hundertern', steps: ['Ziehe Schritt für Schritt ab: erst Zehner, dann Einer.', '304 − 9: 304 − 4 = 300, dann 300 − 5 = 295.', '512 − 67: 512 − 60 = 452, dann 452 − 7 = 445.'] },
      5: { title: 'Die fehlende Zahl', steps: ['Hier fehlt die Zahl in der Mitte.', '22 − ? = 15: Wie weit ist es von 15 bis 22?', 'Von 15 bis 22 sind es 7. Also ? = 7.'] },
    },
    mul: {
      1: { title: 'Das Einmaleins', steps: ['4 · 3 heißt: 4 + 4 + 4.', 'Das sind 12.', 'Tipp: Die 5er-Reihe endet immer auf 5 oder 0.'] },
      2: { title: 'Das große Einmaleins', steps: ['Wenn du eine Aufgabe nicht weißt, nimm eine Nachbaraufgabe.', '7 · 8: Du weißt 7 · 7 = 49. Dann noch 7 dazu.', '49 + 7 = 56.'] },
      3: { title: 'Die fehlende Zahl', steps: ['? · 6 = 42: Wie oft passt die 6 in 42?', 'Zähle in 6er-Schritten: 6, 12, 18, 24, 30, 36, 42. Das sind 7 Schritte.', 'Also ? = 7.'] },
    },
    riddle: {
      1: { title: 'Zahlenrätsel', steps: ['Eine Zahl hat Stellen: Zehner und Einer. Bei 47 ist der Zehner 4 und der Einer 7.', 'Lies die Hinweise und probiere Zahlen aus.', '„Mein Einer ist 2-mal so groß wie mein Zehner. Mein Zehner ist 3.“ → Einer ist 6. Die Zahl ist 36.'] },
      3: { title: 'Knifflige Zahlenrätsel', steps: ['Mehrere Hinweise, alle müssen stimmen.', 'Starte mit dem Hinweis, der am meisten verrät (z. B. „Mein Zehner ist 4“).', 'Dann prüfe die anderen Hinweise nacheinander.'] },
    },
    seq: {
      1: { title: 'Zahlenfolgen', steps: ['Finde heraus, wie viel jedes Mal dazukommt.', '3, 8, 13, 18: Jedes Mal + 5.', 'Also weiter: 23, 28, 33.'] },
      2: { title: 'Rückwärts-Folgen', steps: ['Hier wird jedes Mal etwas abgezogen.', '50, 44, 38, 32: Jedes Mal − 6.', 'Also weiter: 26, 20, 14.'] },
      3: { title: 'Große Schritte', steps: ['Der Schritt kann auch 25, 50 oder 100 sein.', '123, 173, 223, 273: Jedes Mal + 50.', 'Also weiter: 323, 373, 423.'] },
      4: { title: 'Wechsel-Folgen', steps: ['Manchmal wechseln sich zwei Schritte ab.', '100, 102, 107, 109, 114: Erst + 2, dann + 5, dann + 2 …', 'Also weiter: 116, 121, 123.'] },
    },
    nb: {
      1: { title: 'Zehner-Nachbarn', steps: ['Jede Zahl liegt zwischen zwei vollen Zehnern.', '15 liegt zwischen 10 und 20.', 'Zehner davor: 10. Zehner danach: 20.'] },
      2: { title: 'Hunderter-Nachbarn', steps: ['Jede Zahl liegt zwischen zwei vollen Hundertern.', '437 liegt zwischen 400 und 500.', 'Hunderter davor: 400. Hunderter danach: 500.'] },
      3: { title: 'Zehner-Nachbarn bei großen Zahlen', steps: ['Schau nur auf Zehner und Einer.', '437: Zwischen 430 und 440.', 'Davor: 430. Danach: 440.'] },
    },
    grid: {
      1: { title: 'Das Zahlengitter', steps: ['Ein Feld zeigt eine Zahl. Das Zielfeld leuchtet.', 'Wie in der Hundertertafel: nach rechts + 1, nach links − 1, nach unten + 10, nach oben − 10.', 'Beispiel: Start 45, ein Feld nach rechts (46), dann eins nach unten (56). Das Zielfeld ist 56.'] },
      2: { title: 'Zahlengitter mit Hundertern', steps: ['Gleiche Regeln: rechts + 1, links − 1, unten + 10, oben − 10.', 'Beispiel: Start 348, ein Feld nach links (347), dann eins nach oben (337).', 'Das Zielfeld ist 337.'] },
      3: { title: 'Zahlengitter mit 100er-Schritten', steps: ['Jetzt sind die Schritte zehnmal so groß: nach rechts + 10, nach links − 10, nach unten + 100, nach oben − 100.', 'Beispiel: Start 420, ein Feld nach rechts (430), dann eins nach unten (530).', 'Das Zielfeld ist 530.'] },
    },
  };
  Object.assign(TUT, {
    div: {
      1: { title: 'Teilen', steps: ['Teilen ist die Umkehraufgabe vom Malnehmen.', '42 : 6 = ?: Wie oft passt die 6 in 42?', 'Du weißt 7 · 6 = 42. Also 42 : 6 = 7.'] },
      2: { title: 'Teilen mit Zehnerzahlen', steps: ['Lass die Null erst weg und rechne mit dem Einmaleins.', '240 : 6: Rechne 24 : 6 = 4.', '24 Zehner : 6 = 4 Zehner. Also 240 : 6 = 40.'] },
      3: { title: 'Aufgabenfamilien', steps: ['Mal- und Geteiltaufgaben gehören zusammen: 7 · 8 = 56, 8 · 7 = 56, 56 : 7 = 8, 56 : 8 = 7.', '? · 7 = 56: Die fehlende Zahl findest du mit der Umkehraufgabe 56 : 7.', '56 : 7 = 8. Also ? = 8.'] },
    },
    rest: {
      1: { title: 'Teilen mit Rest', steps: ['Manchmal geht das Teilen nicht auf. Was übrig bleibt, ist der Rest.', '23 : 4: Die 4 passt 5-mal in 23, denn 5 · 4 = 20.', 'Von 20 bis 23 sind es 3. Also 23 : 4 = 5 Rest 3.'] },
      2: { title: 'Teilen mit Rest bis 100', steps: ['Suche die größte Malaufgabe, die noch hineinpasst. Der Rest ist immer kleiner als die Zahl, durch die du teilst.', '68 : 9: 7 · 9 = 63 passt, 8 · 9 = 72 ist zu groß.', 'Von 63 bis 68 sind es 5. Also 68 : 9 = 7 Rest 5.'] },
    },
    rund: {
      1: { title: 'Runden auf Zehner', steps: ['Schau auf den Einer.', 'Bei 0, 1, 2, 3 oder 4 rundest du ab. Bei 5, 6, 7, 8 oder 9 rundest du auf.', '67: Der Einer ist 7, also aufrunden. 67 wird zu 70.'] },
      2: { title: 'Runden auf Hunderter', steps: ['Schau auf den Zehner.', 'Bei 0, 1, 2, 3 oder 4 rundest du ab. Bei 5, 6, 7, 8 oder 9 rundest du auf.', '348: Der Zehner ist 4, also abrunden. 348 wird zu 300.'] },
      3: { title: 'Zehner oder Hunderter', steps: ['Lies genau, worauf du runden sollst.', 'Auf Zehner: Schau auf den Einer. 452 wird zu 450.', 'Auf Hunderter: Schau auf den Zehner. 452 wird zu 500.'] },
    },
    dopp: {
      1: { title: 'Verdoppeln und Halbieren', steps: ['Verdoppeln heißt: die Zahl zweimal nehmen. Halbieren heißt: in zwei gleiche Teile teilen.', 'Das Doppelte von 34: 30 + 30 = 60, 4 + 4 = 8. Zusammen 68.', 'Die Hälfte von 74: 74 = 60 + 14. Die Hälfte von 60 ist 30, von 14 ist 7. Zusammen 37.'] },
      2: { title: 'Verdoppeln und Halbieren bis 1000', steps: ['Zerlege die Zahl in Hunderter, Zehner und Einer.', 'Das Doppelte von 236: 400 + 60 + 12 = 472.', 'Die Hälfte von 470: 400 + 70. Die Hälfte von 400 ist 200, von 70 ist 35. Zusammen 235.'] },
    },
  });
  TUT.riddle[2] = { title: 'Zahlenrätsel mit Hundertern', steps: ['Jetzt gibt es auch einen Hunderter. Bei 258: Hunderter 2, Zehner 5, Einer 8.', '„Mein Einer ist 2-mal so groß wie mein Zehner. Mein Hunderter ist um 3 kleiner als mein Zehner. Mein Zehner ist 4.“', 'Zehner 4 → Einer 8 (2 · 4). Hunderter 4 − 3 = 1. Die Zahl ist 148.'] };

  /* ---------- Monsters ---------- */
  const TYPES = { feuer: { name: 'Feuer', icon: '🔥', color: '#FF6A3D' }, wasser: { name: 'Wasser', icon: '💧', color: '#3FA0FF' }, pflanze: { name: 'Pflanze', icon: '🌿', color: '#4FC96A' }, normal: { name: 'Normal', icon: '⭐', color: '#C9A227' } };
  const BEATS = { feuer: 'pflanze', pflanze: 'wasser', wasser: 'feuer' };

  const STARTERS = [
    { id: 'fuchs', type: 'feuer', shape: 'fox', names: ['Glutfuchs', 'Flammfuchs', 'Sonnenfuchs'], hp: 60, desc: 'Flink und mutig. Landet manchmal einen Volltreffer (doppelter Schaden).', perk: 'crit',
      attacks: [{ name: 'Funkenbiss', mod: 'add' }, { name: 'Flammenstoß', mod: 'sub' }, { name: 'Feuerreihe', mod: 'seq' }, { name: 'Glutgitter', mod: 'grid' }] },
    { id: 'kroete', type: 'wasser', shape: 'toad', names: ['Wellenkröte', 'Strudelkröte', 'Ozeankröte'], hp: 80, desc: 'Hält viel aus. Hat die meisten Lebenspunkte.', perk: 'tank',
      attacks: [{ name: 'Wasserschwall', mod: 'add' }, { name: 'Strudelzug', mod: 'sub' }, { name: 'Tiefseerätsel', mod: 'riddle' }, { name: 'Nachbarflut', mod: 'nb' }] },
    { id: 'baer', type: 'pflanze', shape: 'bear', names: ['Moosbär', 'Waldbär', 'Urwaldbär'], hp: 70, desc: 'Ruhig und stark. Jede richtige Antwort heilt ihn um 3 Lebenspunkte.', perk: 'heal',
      attacks: [{ name: 'Blätterhieb', mod: 'add' }, { name: 'Wurzelriss', mod: 'sub' }, { name: 'Honigrechnung', mod: 'mul' }, { name: 'Wabenteilung', mod: 'div' }] },
  ];
  const EXTRA_ATTACKS = { add: 'Blitzsumme', sub: 'Rückwärtsgang', mul: 'Malmühle', riddle: 'Zifferncode', seq: 'Treppenlauf', nb: 'Nachbarschlag', grid: 'Gitterblitz', div: 'Tortenschnitt', rest: 'Restkorb', rund: 'Meilenstein', dopp: 'Spiegelschlag' };

  const ENEMIES = {
    1: {
      normal: [
        { name: 'Sumpfbrocken', type: 'pflanze', shape: 'blob', hp: 26, atk: 3 },
        { name: 'Regenwicht', type: 'wasser', shape: 'drop', hp: 24, atk: 4 },
        { name: 'Streichholzkopf', type: 'feuer', shape: 'flame', hp: 22, atk: 4 },
        { name: 'Krabbelstein', type: 'normal', shape: 'rock', hp: 30, atk: 3 },
      ],
      elite: { name: 'Dornenigel', type: 'pflanze', shape: 'hedgehog', hp: 45, atk: 5 },
      boss: { name: 'Moorschlund', acc: 'den Moorschlund', type: 'wasser', shape: 'blob', hp: 70, atk: 6, boss: true },
    },
    2: {
      normal: [
        { name: 'Lavamolch', type: 'feuer', shape: 'newt', hp: 42, atk: 5 },
        { name: 'Nebelqualle', type: 'wasser', shape: 'jelly', hp: 40, atk: 6 },
        { name: 'Ranklerin', type: 'pflanze', shape: 'vine', hp: 44, atk: 5 },
        { name: 'Nachtschwinge', type: 'normal', shape: 'bat', hp: 38, atk: 6 },
      ],
      elite: { name: 'Glaspanzer', type: 'normal', shape: 'beetle', hp: 70, atk: 8 },
      boss: { name: 'Ofenwurm', acc: 'den Ofenwurm', type: 'feuer', shape: 'dragon', hp: 110, atk: 9, boss: true },
    },
    3: {
      normal: [
        { name: 'Frostblitz', type: 'wasser', shape: 'drop', hp: 60, atk: 8 },
        { name: 'Dschungelbrüller', type: 'pflanze', shape: 'bear', hp: 65, atk: 8 },
        { name: 'Magmagolem', type: 'feuer', shape: 'rock', hp: 70, atk: 7 },
        { name: 'Schattenwolf', type: 'normal', shape: 'fox', hp: 55, atk: 9 },
      ],
      elite: { name: 'Sturmreiter', type: 'normal', shape: 'ghost', hp: 100, atk: 11 },
      boss: { name: 'Rechenkönig', acc: 'den Rechenkönig', type: 'normal', shape: 'king', hp: 170, atk: 12, boss: true },
    },
  };
  const ENEMY_MOVES = ['Rempler', 'Kratzer', 'Zahlensalat', 'Rumpler', 'Schlammspritzer', 'Biss'];

  const ITEMS = {
    trank: { name: 'Trank', icon: '🧪', desc: 'Heilt 30 Lebenspunkte.', heal: 30 },
    grosstrank: { name: 'Großer Trank', icon: '🍶', desc: 'Heilt 60 Lebenspunkte.', heal: 60 },
    schild: { name: 'Schild', icon: '🛡️', desc: 'Blockt den nächsten Angriff des Gegners.', shield: true },
    beere: { name: 'Beere', icon: '🫐', desc: 'Heilt 15 Lebenspunkte.', heal: 15 },
    keks: { name: 'Chilischote', icon: '🌶️', desc: 'Scharf: Dein nächster Treffer macht doppelten Schaden. Kostet keinen Zug.', power: true },
    lupe: { name: 'Eselsbrücke', icon: '🌉', desc: 'Ein Tipp bei der nächsten Aufgabe im Kampf. Kostet keinen Zug.', hint: true },
    engel: { name: 'Schutzengel', icon: '👼', desc: 'Hilft von selbst: Fallen deine Lebenspunkte auf 0, rettet er dich einmal.', revive: true },
    stern: { name: 'Fleißbienchen', icon: '🐝', desc: 'Ein Stempel fürs Üben: Dein Monster bekommt sofort 25 XP.', xp: 25 },
  };

  const EVENTS = [
    { title: 'Die Brücke', text: 'Ein alter Troll bewacht eine Brücke. „Löse mein Rätsel, dann darfst du rüber und bekommst einen Trank!“', opts: [{ label: 'Rätsel lösen', task: 'riddle', win: { item: 'trank' }, lose: { hp: -8 } }, { label: 'Umweg nehmen (−5 LP)', effect: { hp: -5 } }] },
    { title: 'Der Zahlenbrunnen', text: 'Ein alter Brunnen. In den Rand ist eine Zahl geritzt. Rufe ihre beiden Nachbarzahlen in den Schacht, dann steigt Heilwasser auf.', opts: [{ label: 'Nachbarzahlen rufen', task: 'nb', win: { hp: 25 }, lose: { hp: 0 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Schatztruhe', text: 'Eine Truhe mit Zahlenschloss! Die Zahlenfolge öffnet sie.', opts: [{ label: 'Schloss knacken', task: 'seq', win: { item: 'grosstrank' }, lose: { hp: -10 } }, { label: 'Lieber nicht', effect: {} }] },
    { title: 'Die Händlerin', text: 'Eine Händlerin verkauft einen Schild. Sie nimmt 10 Lebenspunkte als Bezahlung.', opts: [{ label: 'Schild kaufen (−10 LP)', effect: { hp: -10, item: 'schild' } }, { label: 'Nein danke', effect: {} }] },
    { title: 'Der Rechenmeister', text: 'Auf dem Dorfplatz übt ein Rechenmeister mit seinen Schülern das Einmaleins. Wer mitmacht und richtig rechnet, lernt schneller.', opts: [{ label: 'Trainieren', task: 'mul', win: { xp: 25 }, lose: { xp: 5 } }, { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } }] },
    { title: 'Das Beerenfeld', text: 'Am Weg wachsen Heidelbeeren. Du kannst dir welche pflücken.', opts: [{ label: 'Beeren pflücken', effect: { item: 'beere' } }, { label: 'Schnell weiter', effect: {} }] },
    { title: 'Der hohle Baum', text: 'Aus einem hohlen Baum ruft eine Stimme: „Rechne eine Plusaufgabe für mich, dann mache ich dein Monster zäher.“', opts: [{ label: 'Plus rechnen', task: 'add', win: { maxhp: 8 }, lose: { hp: -6 } }, { label: 'Weglaufen', effect: {} }] },
    { title: 'Der Chilibauer', text: 'Ein Bauer hat Chilischoten geerntet, aber ein paar sind schon verkauft. „Rechne aus, wie viele noch da sind, dann bekommst du eine.“', opts: [{ label: 'Minus rechnen', task: 'sub', win: { item: 'keks' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Der Bienenstock', text: 'Vor einem Bienenstock summt es. Die Bienen fliegen in einer Zahlenreihe ein und aus. Setze die Reihe fort, dann bekommst du ein Fleißbienchen.', opts: [{ label: 'Reihe fortsetzen', task: 'seq', win: { item: 'stern' }, lose: { xp: 5 } }, { label: 'Lieber Abstand halten', effect: {} }] },
    { title: 'Die Gitterhöhle', text: 'In der Höhle leuchtet ein Zahlengitter an der Wand. Wer es löst, findet einen Schatz.', opts: [{ label: 'Gitter lösen', task: 'grid', win: { item: 'trank', xp: 10 }, lose: { hp: -5 } }, { label: 'Draußen bleiben', effect: {} }] },
  ];

  /* ---------- Map ----------
     Node: { t: type, c: lane 0–3, n: [indexes on the next floor] }.
     Rules: floor 1 fights, no elite before floor 3, rest only on floors 4–5 and as the camp before the boss (floor 7),
     rest/elite/event/treasure never twice in a row on a path, two treasures per map – preferably right behind an elite. */
  const LANES = 4, FLOORS = 8;
  function makeMap() {
    const used = Array.from({ length: FLOORS - 1 }, () => new Set());
    const edges = Array.from({ length: FLOORS - 1 }, () => Array.from({ length: LANES }, () => new Set()));
    const crosses = (f, c, n) => { for (let c2 = 0; c2 < LANES; c2++) { if (c2 === c) continue; for (const n2 of edges[f][c2]) if ((c2 < c && n2 > n) || (c2 > c && n2 < n)) return true; } return false; };
    for (let p = 0; p < 4; p++) {
      let c = p === 0 ? rnd(0, 1) : p === 1 ? rnd(2, 3) : rnd(0, LANES - 1);
      used[0].add(c);
      for (let f = 0; f < FLOORS - 2; f++) {
        let n = c, tries = 0;
        do { n = Math.max(0, Math.min(LANES - 1, c + rnd(-1, 1))); tries++; } while (crosses(f, c, n) && tries < 20);
        if (crosses(f, c, n)) n = c;
        edges[f][c].add(n); used[f + 1].add(n); c = n;
      }
    }
    const lanes = used.map((s) => [...s].sort((a, b) => a - b));
    const type = lanes.map(() => ({}));
    const parents = (f, c) => (f === 0 ? [] : lanes[f - 1].filter((p) => edges[f - 1][p].has(c)));
    const children = (f, c) => (f >= FLOORS - 2 ? [] : [...edges[f][c]]);
    for (const c of lanes[0]) type[0][c] = 'fight';
    for (const c of lanes[FLOORS - 2]) type[FLOORS - 2][c] = 'rest';
    const WEIGHT = { fight: 46, event: 16, elite: 16, rest: 8 };
    for (let f = 1; f < FLOORS - 2; f++) for (const c of lanes[f]) {
      const ps = parents(f, c).map((p) => type[f - 1][p]);
      const sib = new Set(); for (const p of parents(f, c)) for (const s of edges[f - 1][p]) if (s !== c && type[f][s]) sib.add(type[f][s]);
      const bag = [];
      for (const [k, w] of Object.entries(WEIGHT)) {
        if (k === 'elite' && f < 2) continue;
        if (k === 'rest' && (f < 3 || f > 4)) continue;
        if (k !== 'fight' && ps.includes(k)) continue;
        const n = Math.round(w * (sib.has(k) && k !== 'fight' ? 0.3 : 1)); for (let i = 0; i < n; i++) bag.push(k);
      }
      type[f][c] = pick(bag);
    }
    // two treasures on floors 4–6, behind an elite where possible
    const cand = [];
    for (let f = 3; f <= 5; f++) for (const c of lanes[f]) if (type[f][c] === 'fight' || type[f][c] === 'event') cand.push({ f, c, lure: parents(f, c).some((p) => type[f - 1][p] === 'elite') ? 1 : 0, r: Math.random() });
    cand.sort((a, b) => b.lure - a.lure || a.r - b.r);
    let placed = 0;
    for (const x of cand) {
      if (placed >= 2) break;
      if (parents(x.f, x.c).some((p) => type[x.f - 1][p] === 'treasure') || children(x.f, x.c).some((n) => type[x.f + 1][n] === 'treasure')) continue;
      type[x.f][x.c] = 'treasure'; placed++;
    }
    const map = lanes.map((cs, f) => cs.map((c) => ({ t: type[f][c], c, n: f < FLOORS - 2 ? [...edges[f][c]].sort((a, b) => a - b).map((n) => lanes[f + 1].indexOf(n)) : [0] })));
    map.push([{ t: 'boss', c: 1.5, n: [] }]);
    return map;
  }

  /* ---------- Die Baustelle (Raum und Form) ----------
     Task pictures are built here as SVG strings, so the tests can check them without a browser. */
  const BAU_MODULES = {
    wz: { name: 'Würfel zählen', icon: '🧊', maxTier: 2, worldCap: [1, 2], dmg: 12 },
    fq: { name: 'Quader ergänzen', icon: '📦', maxTier: 2, worldCap: [1, 2], dmg: 14 },
    netz: { name: 'Würfelnetze', icon: '🎲', maxTier: 1, worldCap: [1, 1], dmg: 16 },
    koerper: { name: 'Körper erkennen', icon: '🔺', maxTier: 1, worldCap: [1, 1], dmg: 10 },
    band: { name: 'Bandornamente', icon: '🔁', maxTier: 2, worldCap: [1, 2], dmg: 12 },
    lage: { name: 'Parallel oder senkrecht', icon: '📐', maxTier: 1, worldCap: [1, 1], dmg: 10 },
    umfang: { name: 'Umfang', icon: '📏', maxTier: 2, worldCap: [1, 2], dmg: 14 },
  };
  const INK = '#1C2541', LINE = `stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"`;
  const svgFig = (x, y, w, h, body, label) => `<svg viewBox="${x} ${y} ${w} ${h}" role="img" aria-label="${label}">${body}</svg>`;
  const sum = (a) => a.reduce((s, x) => s + x, 0);

  // isometric view from the front right: x = column (to the right), y = row (to the front), z = up
  const iso = (x, y, z) => `${(x - y) * 12},${(x + y) * 7 - z * 14}`;
  function boxFaces(x, y, z, dx, dy, dz, fills, attrs) {
    const X = x + dx, Y = y + dy, Z = z + dz;
    return [[[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]], [[x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z]], [[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]]]
      .map((f, i) => `<polygon points="${f.map((p) => iso(...p)).join(' ')}" fill="${fills ? fills[i] : 'none'}" ${attrs || LINE}/>`).join('');
  }
  const BRICK = ['#F6A36B', '#D9653B', '#B54E2A'];
  // full: height of the complete Quader, drawn as a dashed outline
  function isoView(plan, full) {
    const rows = plan.length, cols = plan[0].length, top = full || Math.max(...plan.flat());
    const cubes = []; plan.forEach((row, r) => row.forEach((n, c) => { for (let z = 0; z < n; z++) cubes.push([c, r, z]); }));
    // back to front, so nearer cubes cover farther ones
    cubes.sort((a, b) => sum(a) - sum(b) || a[2] - b[2]);
    const body = cubes.map(([x, y, z]) => boxFaces(x, y, z, 1, 1, 1, BRICK)).join('') + (full ? boxFaces(0, 0, 0, cols, rows, full, null, `stroke="${INK}" stroke-width="1.5" stroke-dasharray="4 3"`) : '');
    return svgFig(-rows * 12 - 2, -top * 14 - 2, (rows + cols) * 12 + 4, (rows + cols) * 7 + top * 14 + 4, body, 'Gebäude aus Würfeln');
  }
  function planView(plan) {
    const S = 24, rows = plan.length, cols = plan[0].length;
    const cells = plan.map((row, r) => row.map((n, c) => `<rect x="${c * S}" y="${r * S}" width="${S}" height="${S}" fill="${n ? '#FFF3C4' : '#fff'}" ${LINE}/><text x="${c * S + S / 2}" y="${r * S + 17}" text-anchor="middle" font-size="15" font-weight="700" fill="${INK}">${n}</text>`).join('')).join('');
    return svgFig(-2, -2, cols * S + 4, rows * S + 18, `${cells}<text x="${cols * S / 2}" y="${rows * S + 14}" text-anchor="middle" font-size="11" fill="${INK}">vorne</text>`, 'Bauplan von oben');
  }
  const figPair = (plan, full) => `<figure>${planView(plan)}<figcaption>Bauplan</figcaption></figure><figure>${isoView(plan, full)}<figcaption>Ansicht</figcaption></figure>`;

  function genWz(t) {
    let plan;
    do { const [rows, cols] = t === 1 ? pick([[2, 2], [2, 3]]) : pick([[3, 3], [2, 3], [3, 2]]); plan = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (t === 1 ? rnd(1, 3) : rnd(0, 4)))); }
    while (plan.flat().filter((n) => !n).length > 2 || plan[0].every((n) => !n) || plan.every((row) => !row[0]));
    return task('', [sum(plan.flat())], { svg: figPair(plan), ask: 'Wie viele Würfel sind es zusammen?', plan, sig: JSON.stringify(plan) });
  }
  function genFq(t) {
    const [rows, cols] = t === 1 ? pick([[2, 2], [2, 3]]) : pick([[2, 3], [3, 3]]); const full = t === 1 ? 2 : 3; let plan;
    do plan = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(0, full))); while (sum(plan.flat()) < 2 || rows * cols * full - sum(plan.flat()) < 2);
    return task('', [rows * cols * full - sum(plan.flat())], { svg: figPair(plan, full), ask: `Der Quader soll ${cols} Würfel lang, ${rows} breit und ${full} hoch werden. Wie viele Würfel fehlen?`, plan, full, sig: JSON.stringify(plan) });
  }

  // the 11 nets of a cube; rows separated by |, # is a square
  const NETS = ['#...|####|#...', '#...|####|.#..', '#...|####|..#.', '#...|####|...#', '.#..|####|.#..', '.#..|####|..#.',
    '##..|.###|.#..', '##..|.###|..#.', '##..|.###|...#', '##..|.##.|..##', '###..|..###'];
  const parseNet = (s) => s.split('|').flatMap((row, r) => [...row].map((ch, c) => (ch === '#' ? [r, c] : null)).filter(Boolean));
  const normCells = (cells) => { const r0 = Math.min(...cells.map((p) => p[0])), c0 = Math.min(...cells.map((p) => p[1])); return cells.map(([r, c]) => [r - r0, c - c0]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
  const SYM = [([r, c]) => [r, c], ([r, c]) => [c, -r], ([r, c]) => [-r, -c], ([r, c]) => [-c, r], ([r, c]) => [r, -c], ([r, c]) => [-c, -r], ([r, c]) => [-r, c], ([r, c]) => [c, r]];
  // same shape after turning or flipping → same key
  const shapeKey = (cells) => SYM.map((f) => JSON.stringify(normCells(cells.map(f)))).sort()[0];
  // Fold the squares around the first one like rolling a die: n is where the square ends up on the cube,
  // u and v are the grid's right and down directions on it. A net uses each of the 6 sides exactly once.
  function cubeNet(cells) {
    if (cells.length !== 6) return false;
    const key = ([r, c]) => r + ',' + c, at = new Set(cells.map(key)), neg = (a) => a.map((x) => -x);
    const frames = new Map([[key(cells[0]), { n: [0, 0, -1], u: [1, 0, 0], v: [0, 1, 0] }]]); const queue = [cells[0]];
    const roll = [[0, 1, (f) => ({ n: f.u, u: neg(f.n), v: f.v })], [0, -1, (f) => ({ n: neg(f.u), u: f.n, v: f.v })], [1, 0, (f) => ({ n: f.v, u: f.u, v: neg(f.n) })], [-1, 0, (f) => ({ n: neg(f.v), u: f.u, v: f.n })]];
    while (queue.length) { const [r, c] = queue.shift(); const f = frames.get(key([r, c]));
      for (const [dr, dc, g] of roll) { const k = key([r + dr, c + dc]); if (at.has(k) && !frames.has(k)) { frames.set(k, g(f)); queue.push([r + dr, c + dc]); } } }
    return frames.size === 6 && new Set([...frames.values()].map((f) => f.n.join())).size === 6;
  }
  const connected = (cells) => { const key = ([r, c]) => r + ',' + c, at = new Set(cells.map(key)), seen = new Set([key(cells[0])]), q = [cells[0]];
    while (q.length) { const [r, c] = q.pop(); for (const p of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) if (at.has(key(p)) && !seen.has(key(p))) { seen.add(key(p)); q.push(p); } } return seen.size === cells.length; };
  // a real net with one square moved: looks close, but does not fold
  function almostNet() {
    for (;;) {
      const net = parseNet(pick(NETS)); const i = rnd(0, 5); const rest = net.filter((_, j) => j !== i); if (!connected(rest)) continue;
      const free = []; for (const [r, c] of rest) for (const p of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) if (!net.some((q) => q[0] === p[0] && q[1] === p[1])) free.push(p);
      const shape = rest.concat([pick(free)]); if (!cubeNet(shape)) return normCells(shape);
    }
  }
  function netSVG(cells, size) {
    const S = 14, h = Math.max(...cells.map((p) => p[0])) + 1, w = Math.max(...cells.map((p) => p[1])) + 1, ox = (size - w) * S / 2, oy = (size - h) * S / 2;
    return svgFig(-2, -2, size * S + 4, size * S + 4, cells.map(([r, c]) => `<rect x="${ox + c * S}" y="${oy + r * S}" width="${S}" height="${S}" fill="#F4C542" ${LINE}/>`).join(''), 'Netz aus 6 Quadraten');
  }
  function genNetz() {
    const net = normCells(parseNet(pick(NETS)).map(pick(SYM))); const nets = [net]; const keys = new Set([shapeKey(net)]);
    while (nets.length < 3) { const n = almostNet(); if (!keys.has(shapeKey(n))) { keys.add(shapeKey(n)); nets.push(normCells(n.map(pick(SYM)))); } }
    const size = Math.max(...nets.flat().map((p) => Math.max(...p))) + 1; const order = shuffle([0, 1, 2]);
    const options = order.map((i) => netSVG(nets[i], size));
    return { kind: 'choice', q: 'Welches Netz lässt sich zu einem Würfel falten?', options, answer: options[order.indexOf(0)], nets: order.map((i) => nets[i]), svgOpts: true, why: 'Dieses Netz lässt sich falten:', sig: shapeKey(net) };
  }

  const SOLIDS = { wuerfel: ['Würfel', 'den'], quader: ['Quader', 'den'], kugel: ['Kugel', 'die'], pyramide: ['Pyramide', 'die'], kegel: ['Kegel', 'den'], zylinder: ['Zylinder', 'den'] };
  const SOLID_FILL = ['#8FD3FF', '#3FA0FF', '#2B78C2'];
  const solidSVG = (id) => {
    const D = `fill="none" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 3"`;
    const body = {
      wuerfel: () => `<g transform="translate(36 40) scale(1.6)">${boxFaces(0, 0, 0, 1, 1, 1, SOLID_FILL)}</g>`,
      quader: () => `<g transform="translate(26 38) scale(1.05)">${boxFaces(0, 0, 0, 3, 1, 1.4, SOLID_FILL)}</g>`,
      kugel: () => `<circle cx="36" cy="30" r="24" fill="${SOLID_FILL[0]}" ${LINE}/><path d="M12 30 a24 8 0 0 0 48 0" fill="none" ${LINE}/><path d="M12 30 a24 8 0 0 1 48 0" ${D}/>`,
      zylinder: () => `<path d="M16 12 v34 a20 7 0 0 0 40 0 v-34" fill="${SOLID_FILL[1]}" ${LINE}/><ellipse cx="36" cy="12" rx="20" ry="7" fill="${SOLID_FILL[0]}" ${LINE}/><path d="M16 46 a20 7 0 0 1 40 0" ${D}/>`,
      kegel: () => `<path d="M36 4 L16 46 a20 7 0 0 0 40 0 Z" fill="${SOLID_FILL[1]}" ${LINE}/><path d="M16 46 a20 7 0 0 1 40 0" ${D}/>`,
      pyramide: () => `<path d="M38 4 L12 46 L44 54 Z" fill="${SOLID_FILL[0]}" ${LINE}/><path d="M38 4 L44 54 L62 42 Z" fill="${SOLID_FILL[2]}" ${LINE}/><path d="M12 46 L30 36 L62 42 M38 4 L30 36" ${D}/>`,
    }[id]();
    return svgFig(0, 0, 72, 60, body, 'Körper');
  };
  function genKoerper() {
    const ids = Object.keys(SOLIDS); const id = pick(ids); const shown = shuffle([id].concat(shuffle(ids.filter((k) => k !== id)).slice(0, 2)));
    if (Math.random() < 0.5) { const options = shown.map((k) => SOLIDS[k][0]); return { kind: 'choice', q: 'Wie heißt dieser Körper?', pic: solidSVG(id), options, answer: SOLIDS[id][0], solid: id, shown, cols: 1, sig: 'n' + id }; }
    const options = shown.map(solidSVG);
    return { kind: 'choice', q: `Tippe auf ${SOLIDS[id][1]} ${SOLIDS[id][0]}.`, options, answer: solidSVG(id), solid: id, shown, svgOpts: true, why: `So sieht ${SOLIDS[id][1].replace('den', 'der')} ${SOLIDS[id][0]} aus:`, sig: 'p' + id };
  }

  // a tile is [shape, turn in degrees, colour]
  const TILE_COL = ['#E4572E', '#3FA0FF', '#4FB04F', '#F4C542'];
  const TILE = {
    dreieck: (col) => `<path d="M10 3 L17 17 L3 17 Z" fill="${col}"/>`,
    quadrat: (col) => `<rect x="4" y="4" width="12" height="12" fill="${col}"/>`,
    kreis: (col) => `<circle cx="10" cy="10" r="7" fill="${col}"/>`,
    bogen: (col) => `<path d="M3 15 A7 7 0 0 1 17 15 Z" fill="${col}"/>`,
  };
  const tileSVG = ([shape, rot, col], x) => `<g transform="translate(${x} 0) rotate(${rot} 10 10)" ${LINE}>${TILE[shape](TILE_COL[col])}</g>`;
  const tileKey = (t) => t.join();
  function genBand(t) {
    let alpha, seq;
    // tier 1: different shapes and colours; tier 2: one shape that is turned (like a real band ornament)
    do {
      if (t === 1) { const shapes = shuffle(['dreieck', 'quadrat', 'kreis']); const cols = shuffle([0, 1, 2, 3]); alpha = [0, 1, 2].map((i) => [shapes[i], 0, cols[i]]); }
      else { const shape = pick(['dreieck', 'bogen']); const col = rnd(0, 3); alpha = shuffle([0, 90, 180, 270]).map((r) => [shape, r, col]); }
      const p = t === 1 ? rnd(2, 3) : rnd(3, 4); seq = Array.from({ length: p }, () => pick(alpha));
    } while (new Set(seq.map(tileKey)).size < 2 || (seq.length === 4 && tileKey(seq[0]) === tileKey(seq[2]) && tileKey(seq[1]) === tileKey(seq[3])));
    const p = seq.length, shown = 2 * p + rnd(0, p - 1); const next = [seq[shown % p], seq[(shown + 1) % p]];
    const used = alpha.filter((a) => seq.some((s) => tileKey(s) === tileKey(a)));
    const pairs = []; for (const a of used) for (const b of used) pairs.push([a, b]);
    const wrong = shuffle(pairs.filter((pr) => pr.map(tileKey).join('|') !== next.map(tileKey).join('|'))).slice(0, 2);
    const pairSVG = (pr) => svgFig(-2, -2, 48, 24, pr.map((tl, i) => tileSVG(tl, i * 24)).join(''), 'zwei Teile des Musters');
    const options = shuffle([next].concat(wrong)).map(pairSVG);
    const band = Array.from({ length: shown }, (_, i) => tileSVG(seq[i % p], i * 22)).join('') + [0, 1].map((i) => `<rect x="${(shown + i) * 22 + 1}" y="1" width="18" height="18" rx="3" fill="#fff" stroke="${INK}" stroke-dasharray="3 2"/><text x="${(shown + i) * 22 + 10}" y="15" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}">?</text>`).join('');
    const w = (shown + 2) * 22;
    return { kind: 'choice', q: 'Wie geht das Muster weiter?', pic: svgFig(-4, -6, w + 6, 32, `<path d="M-2 -4 H${w} M-2 23 H${w}" stroke="${INK}" stroke-width="1.5"/>${band}`, 'Bandornament'), options, answer: pairSVG(next), seq, shown, next, svgOpts: true, why: 'So geht es weiter:', sig: seq.map(tileKey).join('|') };
  }

  const LAGE = { parallel: 'parallel', senkrecht: 'senkrecht', keins: 'weder noch' };
  function genLage() {
    const kind = pick(Object.keys(LAGE)); const a = pick([0, 30, 45, 60, 90, 120, 135, 150]);
    const b = a + (kind === 'parallel' ? 0 : kind === 'senkrecht' ? 90 : pick([30, 45, 60, 120, 135, 150]));
    const dir = (deg) => [Math.cos(deg * Math.PI / 180), -Math.sin(deg * Math.PI / 180)];
    const seg = ([cx, cy], deg, col) => { const [dx, dy] = dir(deg); const f = (v) => Math.round(v * 10) / 10; return `<line x1="${f(cx - dx * 30)}" y1="${f(cy - dy * 30)}" x2="${f(cx + dx * 30)}" y2="${f(cy + dy * 30)}" stroke="${col}" stroke-width="4" stroke-linecap="round"/>`; };
    let c1 = [0, 0], c2;
    if (kind === 'parallel') { const [nx, ny] = dir(a + 90), d = pick([-1, 1]) * rnd(14, 20); c1 = [-nx * d / 2, -ny * d / 2]; c2 = [nx * d / 2, ny * d / 2]; }
    else { const [ax, ay] = dir(a), [bx, by] = dir(b), t = pick([-12, 0, 12]), s = pick([-12, 0, 12]); c2 = [ax * t + bx * s, ay * t + by * s]; }
    return { kind: 'choice', q: 'Wie liegen die rote und die blaue Linie zueinander?', pic: svgFig(-56, -56, 112, 112, seg(c1, a, '#3FA0FF') + seg(c2, b, '#E4572E'), 'zwei Linien'), options: Object.values(LAGE), answer: LAGE[kind], angles: [a, b], cols: 1, sig: kind + a + ',' + b, why: { parallel: 'Die Linien sind überall gleich weit voneinander entfernt.', senkrecht: 'Die Linien treffen sich in einem rechten Winkel.', keins: 'Sie treffen sich schräg, nicht im rechten Winkel.' }[kind] };
  }

  // squares on a grid; the perimeter is the number of square sides that border the outside
  const edges = (cells) => { const at = new Set(cells.map((p) => p.join())); const out = [];
    for (const [r, c] of cells) for (const [dr, dc, x1, y1, x2, y2] of [[-1, 0, 0, 0, 1, 0], [1, 0, 0, 1, 1, 1], [0, -1, 0, 0, 0, 1], [0, 1, 1, 0, 1, 1]]) if (!at.has([r + dr, c + dc].join())) out.push([c + x1, r + y1, c + x2, r + y2]);
    return out; };
  // an empty square enclosed by the shape would count twice as edge, so shapes with holes are not used
  const hasHole = (cells) => { const at = new Set(cells.map((p) => p.join())); const seen = new Set(['-1,-1']); const q = [[-1, -1]];
    while (q.length) { const [r, c] = q.pop(); for (const p of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) if (p[0] >= -1 && p[0] <= 6 && p[1] >= -1 && p[1] <= 6 && !at.has(p.join()) && !seen.has(p.join())) { seen.add(p.join()); q.push(p); } }
    return seen.size + cells.length < 64; };
  function genUmfang(t) {
    let cells;
    if (t === 1) { const w = rnd(2, 5), h = rnd(1, 3); cells = []; for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) cells.push([r, c]); }
    else do { cells = [[rnd(1, 3), rnd(1, 3)]]; const n = rnd(5, 7);
      while (cells.length < n) { const [r, c] = pick(cells); const p = pick([[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]); if (p[0] >= 0 && p[0] <= 4 && p[1] >= 0 && p[1] <= 5 && !cells.some((q) => q.join() === p.join())) cells.push(p); }
      cells = normCells(cells); } while (hasHole(cells));
    const S = 16, H = Math.max(...cells.map((p) => p[0])) + 3, W = Math.max(...cells.map((p) => p[1])) + 3; const shift = cells.map(([r, c]) => [r + 1, c + 1]);
    let grid = ''; for (let i = 0; i <= W; i++) grid += `<path d="M${i * S} 0 V${H * S}" stroke="#C9D3E8"/>`; for (let i = 0; i <= H; i++) grid += `<path d="M0 ${i * S} H${W * S}" stroke="#C9D3E8"/>`;
    const fill = shift.map(([r, c]) => `<rect x="${c * S}" y="${r * S}" width="${S}" height="${S}" fill="#FFE08A"/>`).join('');
    const border = edges(shift).map(([x1, y1, x2, y2]) => `<path d="M${x1 * S} ${y1 * S} L${x2 * S} ${y2 * S}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join('');
    return task('', [edges(cells).length], { svg: svgFig(-2, -2, W * S + 4, H * S + 4, grid + fill + border, 'Fläche auf Kästchenpapier'), ask: 'Wie lang ist der Umfang? Zähle die Kästchenseiten am Rand.', cells, sig: JSON.stringify(cells) });
  }

  function bauGenerate(mod, tier) {
    tier = Math.max(1, Math.min(BAU_MODULES[mod].maxTier, tier));
    const tk = { wz: genWz, fq: genFq, netz: genNetz, koerper: genKoerper, band: genBand, lage: genLage, umfang: genUmfang }[mod](tier);
    if (!tk.kind) tk.kind = 'num';
    // one tutorial per task type
    return Object.assign(tk, { mod, tier, group: mod + ':1' });
  }
  const BAU_TUT = {
    'wz:1': { title: 'Würfel zählen', steps: ['Der Bauplan zeigt das Gebäude von oben. Die Zahl in einem Feld sagt, wie viele Würfel dort übereinander stehen.', 'Bauplan mit 2, 1, 3 und 1: Rechne 2 + 1 + 3 + 1.', 'Das Gebäude hat 7 Würfel.'] },
    'fq:1': { title: 'Quader ergänzen', steps: ['Im vollen Quader stehen in jedem Feld gleich viele Würfel übereinander. Die gestrichelte Linie zeigt ihn.', 'Quader 2 lang, 2 breit, 3 hoch. Bauplan 3, 1, 2, 3: Es fehlen 0 + 2 + 1 + 0 Würfel.', 'Es fehlen 3 Würfel.'] },
    'netz:1': { title: 'Würfelnetze', steps: ['Ein Würfelnetz hat 6 Quadrate. Beim Falten wird jedes Quadrat eine Seite des Würfels. Keine zwei dürfen auf derselben Seite landen.', 'Eine Reihe aus 4 Quadraten mit einem Quadrat oben und einem unten lässt sich immer falten.', 'Eine Reihe aus 5 Quadraten lässt sich nie falten: Das erste und das fünfte Quadrat landen aufeinander.'] },
    'koerper:1': { title: 'Körper erkennen', steps: ['Würfel: 6 gleich große Quadrate als Flächen. Quader: auch 6 Flächen, aber nicht alle gleich groß.', 'Kugel: rund, ohne Ecken und Kanten. Zylinder: oben und unten ein Kreis.', 'Kegel: unten ein Kreis, oben eine Spitze. Pyramide: unten ein Viereck, oben eine Spitze.'] },
    'band:1': { title: 'Bandornamente', steps: ['Ein Bandornament ist ein Muster, das sich immer wiederholt.', 'Suche das Stück, das sich wiederholt: ▲ ● ● ▲ ● ● ▲ … Das Stück ist ▲ ● ●.', 'Nach dem letzten ▲ kommen ● ●. Also geht es mit ● ● weiter.'] },
    'lage:1': { title: 'Parallel oder senkrecht', steps: ['Parallel: Die Linien sind überall gleich weit voneinander entfernt und treffen sich nie.', 'Senkrecht: Die Linien treffen sich in einem rechten Winkel. Prüfe ihn mit der Ecke eines Blatts Papier.', 'Beispiel Tür: Die linke und die rechte Kante sind parallel. Die obere und die linke Kante stehen senkrecht zueinander.', 'Treffen sich die Linien schräg, dann ist es weder noch.'] },
    'umfang:1': { title: 'Umfang', steps: ['Der Umfang ist der Weg einmal ganz um die Fläche herum.', 'Zähle jede Kästchenseite am Rand. Starte an einer Ecke und fahre mit dem Finger herum.', 'Rechteck 3 Kästchen lang und 2 hoch: 3 + 2 + 3 + 2 = 10. Der Umfang ist 10 Kästchenseiten.'] },
  };
  const BAU = {
    MODULES: BAU_MODULES, TUT: BAU_TUT, generate: bauGenerate, NETS, parseNet, cubeNet, shapeKey, edges, hasHole, SOLIDS, LAGE,
    STARTERS: [{ id: 'biber', type: 'wasser', shape: 'beaver', names: ['Dammbiber', 'Brückenbiber', 'Brückenbiber'], hp: 75, desc: 'Ein Biber mit Bauhelm. Misst jeden Stamm aus, bevor er ihn zersägt.', perk: 'tank',
      attacks: [{ name: 'Ziegelstapel', mod: 'wz' }, { name: 'Bauklotzwurf', mod: 'koerper' }, { name: 'Lotschnur', mod: 'lage' }, { name: 'Zollstock', mod: 'umfang' }] }],
    WORLD_ATTACKS: { 2: [{ name: 'Mauerlücke', mod: 'fq' }, { name: 'Faltkarton', mod: 'netz' }, { name: 'Fliesenband', mod: 'band' }, { name: 'Zollstock', mod: 'umfang' }] },
    EXTRA: { wz: 'Ziegelstapel', fq: 'Mauerlücke', netz: 'Faltkarton', koerper: 'Bauklotzwurf', band: 'Fliesenband', lage: 'Lotschnur', umfang: 'Zollstock' },
    ENEMIES: {
      1: {
        normal: [
          { name: 'Mörtelbatzen', type: 'normal', shape: 'blob', hp: 24, atk: 3 },
          { name: 'Schweißfunke', type: 'feuer', shape: 'flame', hp: 22, atk: 4 },
          { name: 'Schotterhaufen', type: 'normal', shape: 'rock', hp: 30, atk: 3 },
          { name: 'Pfützenmolch', type: 'wasser', shape: 'newt', hp: 26, atk: 4 },
        ],
        elite: { name: 'Brennnesselwall', type: 'pflanze', shape: 'vine', hp: 45, atk: 5 },
        boss: { name: 'Mischtrommel', acc: 'die Mischtrommel', type: 'normal', shape: 'rock', hp: 70, atk: 6, boss: true },
      },
      2: {
        normal: [
          { name: 'Kabelnatter', type: 'feuer', shape: 'newt', hp: 42, atk: 5 },
          { name: 'Staubfahne', type: 'normal', shape: 'ghost', hp: 40, atk: 6 },
          { name: 'Dachmarder', type: 'normal', shape: 'fox', hp: 44, atk: 5 },
          { name: 'Efeuranke', type: 'pflanze', shape: 'vine', hp: 38, atk: 6 },
        ],
        elite: { name: 'Rostkäfer', type: 'feuer', shape: 'beetle', hp: 70, atk: 8 },
        boss: { name: 'Abrissbirne', acc: 'die Abrissbirne', type: 'normal', shape: 'blob', hp: 110, atk: 9, boss: true },
      },
    },
    MOVES: ['Mörtelspritzer', 'Schotterregen', 'Rempler', 'Kabelschlag', 'Funkenregen', 'Rostbiss'],
    EVENTS: [
      { title: 'Der Kran', text: 'Die Kranführerin hat Ziegel gestapelt und will wissen, wie viele es sind. Für die richtige Zahl gibt sie dir einen Trank.', opts: [{ label: 'Würfel zählen', task: 'wz', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Bauzaun', text: 'Am Bauzaun fehlt ein bemaltes Brett. Wer das Muster fortsetzt, bekommt vom Maler einen Schild.', opts: [{ label: 'Muster fortsetzen', task: 'band', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Lieber nicht', effect: {} }] },
      { title: 'Die Kartons', text: 'Ein Lieferwagen bringt flache Kartons. Der Fahrer fragt, welcher sich zu einem Würfel falten lässt.', opts: [{ label: 'Netz aussuchen', task: 'netz', win: { xp: 20 }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Holzkiste', text: 'In der Werkstatt steht eine Kiste mit Holzkörpern. Der Schreiner fragt nach einem Namen und verrät dir dafür eine Eselsbrücke.', opts: [{ label: 'Antworten', task: 'koerper', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Randsteine', text: 'Ein Pflasterer legt Randsteine um einen Platz. Er fragt, wie lang der Rand wird.', opts: [{ label: 'Umfang zählen', task: 'umfang', win: { item: 'grosstrank' }, lose: { hp: -8 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Mittagspause', text: 'Die Bauleute machen Pause und teilen ihre Brote mit dir.', opts: [{ label: 'Mitessen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
    ],
  };

  return { rnd, pick, shuffle, MODULES, MODULE_KEYS, generate, TUT, TYPES, BEATS, STARTERS, EXTRA_ATTACKS, ENEMIES, ENEMY_MOVES, ITEMS, EVENTS, makeMap, FLOORS, digits, BAU };
})();
if (typeof module !== 'undefined') module.exports = MQ;
