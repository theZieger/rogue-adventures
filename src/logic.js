/* ===== MathQuest Logic (generators, data) ===== */
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
    (d) => ({ text: `Meine Quersumme ist ${d.z + d.e}.`, test: (x) => x.z + x.e === d.z + d.e }),
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
    (d) => ({ text: `Meine Quersumme ist ${d.h + d.z + d.e}.`, test: (x) => x.h + x.z + x.e === d.h + d.z + d.e }),
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
      // prefer relation clues first (more interesting)
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
    const stepR = t >= 3 ? 100 : 10, stepD = 1;
    const sr = rnd(0, size - 1), sc = rnd(0, size - 1);
    let tr, tc; do { tr = rnd(0, size - 1); tc = rnd(0, size - 1); } while ((tr === sr && tc === sc) || (!elite && Math.abs(tr - sr) + Math.abs(tc - sc) > 2) || (elite && Math.abs(tr - sr) + Math.abs(tc - sc) < 2));
    let base;
    if (t === 1) base = rnd(25, 75); else if (t === 2) base = rnd(120, 870); else base = rnd(230, 760);
    const value = base + (tr - sr) * stepD + (tc - sc) * stepR;
    return task('', [value], { grid: { size, sr, sc, tr, tc, base, stepR, stepD } });
  }
  function task(text, answers, extra) { return Object.assign({ text, answers }, extra || {}); }

  function generate(mod, tier, opts) {
    tier = Math.max(1, Math.min(MODULES[mod].maxTier, tier));
    const g = { add: genAdd, sub: genSub, mul: genMul, riddle: genRiddle, seq: genSeq, nb: genNb, grid: (t) => genGrid(t, opts && opts.elite) }[mod];
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
      1: { title: 'Das Zahlengitter', steps: ['Ein Feld zeigt eine Zahl. Das Zielfeld leuchtet.', 'Gehe von Feld zu Feld: nach unten + 1, nach oben − 1, nach rechts + 10, nach links − 10.', 'Beispiel: Start 45, ein Feld nach rechts (55), dann eins nach unten (56). Das Zielfeld ist 56.'] },
      2: { title: 'Zahlengitter mit Hundertern', steps: ['Gleiche Regeln: unten + 1, oben − 1, rechts + 10, links − 10.', 'Beispiel: Start 348, ein Feld nach links (338), dann eins nach oben (337).', 'Das Zielfeld ist 337.'] },
      3: { title: 'Zahlengitter mit 100er-Schritten', steps: ['Jetzt gilt: nach rechts + 100, nach links − 100. Oben und unten bleiben − 1 und + 1.', 'Beispiel: Start 420, zwei Felder nach rechts (620), dann eins nach unten (621).', 'Das Zielfeld ist 621.'] },
    },
  };
  TUT.riddle[2] = { title: 'Zahlenrätsel mit Hundertern', steps: ['Jetzt gibt es auch einen Hunderter. Bei 258: Hunderter 2, Zehner 5, Einer 8.', '„Mein Einer ist 2-mal so groß wie mein Zehner. Mein Hunderter ist um 3 kleiner als mein Zehner. Mein Zehner ist 4.“', 'Zehner 4 → Einer 8 (2 · 4). Hunderter 4 − 3 = 1. Die Zahl ist 148.'] };

  /* ---------- Monsters ---------- */
  const TYPES = { feuer: { name: 'Feuer', icon: '🔥', color: '#FF6A3D' }, wasser: { name: 'Wasser', icon: '💧', color: '#3FA0FF' }, pflanze: { name: 'Pflanze', icon: '🌿', color: '#4FC96A' }, normal: { name: 'Normal', icon: '⭐', color: '#C9A227' } };
  const BEATS = { feuer: 'pflanze', pflanze: 'wasser', wasser: 'feuer' };

  const STARTERS = [
    { id: 'fuchs', type: 'feuer', shape: 'fox', names: ['Glutfuchs', 'Flammfuchs', 'Sonnenfuchs'], hp: 60, desc: 'Flink und mutig. Landet manchmal einen Volltreffer (doppelter Schaden).', perk: 'crit',
      attacks: [{ name: 'Funkenbiss', mod: 'add' }, { name: 'Flammenstoß', mod: 'sub' }, { name: 'Feuerreihe', mod: 'seq' }, { name: 'Glutgitter', mod: 'grid' }] },
    { id: 'kroete', type: 'wasser', shape: 'toad', names: ['Wellenkröte', 'Strudelkröte', 'Ozeankröte'], hp: 80, desc: 'Hält viel aus. Hat die meisten Lebenspunkte.', perk: 'tank',
      attacks: [{ name: 'Wasserschwall', mod: 'add' }, { name: 'Strudelzug', mod: 'sub' }, { name: 'Blubberrätsel', mod: 'riddle' }, { name: 'Nachbarflut', mod: 'nb' }] },
    { id: 'baer', type: 'pflanze', shape: 'bear', names: ['Moosbär', 'Waldbär', 'Urwaldbär'], hp: 70, desc: 'Ruhig und stark. Heilt sich bei jeder richtigen Antwort ein bisschen.', perk: 'heal',
      attacks: [{ name: 'Blätterhieb', mod: 'add' }, { name: 'Wurzelriss', mod: 'sub' }, { name: 'Rankenrechnen', mod: 'mul' }, { name: 'Moosgitter', mod: 'grid' }] },
  ];
  const EXTRA_ATTACKS = { add: 'Blitzsumme', sub: 'Schattenschnitt', mul: 'Sternenmal', riddle: 'Geheimrätsel', seq: 'Reihenrausch', nb: 'Nachbarschlag', grid: 'Gitterblitz' };

  const ENEMIES = {
    1: {
      normal: [
        { name: 'Flummibatz', type: 'pflanze', shape: 'blob', hp: 26, atk: 3 },
        { name: 'Tropfling', type: 'wasser', shape: 'drop', hp: 24, atk: 4 },
        { name: 'Zündi', type: 'feuer', shape: 'flame', hp: 22, atk: 4 },
        { name: 'Krabbelstein', type: 'normal', shape: 'rock', hp: 30, atk: 3 },
      ],
      elite: { name: 'Dornenigel', type: 'pflanze', shape: 'hedgehog', hp: 45, atk: 5 },
      boss: { name: 'Großglibber', acc: 'den Großglibber', type: 'wasser', shape: 'blob', hp: 70, atk: 6, boss: true },
    },
    2: {
      normal: [
        { name: 'Lavamolch', type: 'feuer', shape: 'newt', hp: 42, atk: 5 },
        { name: 'Nebelqualle', type: 'wasser', shape: 'jelly', hp: 40, atk: 6 },
        { name: 'Ranklerin', type: 'pflanze', shape: 'vine', hp: 44, atk: 5 },
        { name: 'Flatterfledi', type: 'normal', shape: 'bat', hp: 38, atk: 6 },
      ],
      elite: { name: 'Kristallkäfer', type: 'normal', shape: 'beetle', hp: 70, atk: 8 },
      boss: { name: 'Aschendrache', acc: 'den Aschendrachen', type: 'feuer', shape: 'dragon', hp: 110, atk: 9, boss: true },
    },
    3: {
      normal: [
        { name: 'Frostblitz', type: 'wasser', shape: 'drop', hp: 60, atk: 8 },
        { name: 'Dschungelbrüller', type: 'pflanze', shape: 'bear', hp: 65, atk: 8 },
        { name: 'Magmagolem', type: 'feuer', shape: 'rock', hp: 70, atk: 7 },
        { name: 'Schattenwolf', type: 'normal', shape: 'fox', hp: 55, atk: 9 },
      ],
      elite: { name: 'Sturmgeist', type: 'normal', shape: 'ghost', hp: 100, atk: 11 },
      boss: { name: 'Rechenkönig', acc: 'den Rechenkönig', type: 'normal', shape: 'king', hp: 170, atk: 12, boss: true },
    },
  };
  const ENEMY_MOVES = ['Rempler', 'Kratzer', 'Zahlenwirbel', 'Rumpler', 'Knuffpuff', 'Stupser'];

  const ITEMS = {
    trank: { name: 'Trank', icon: '🧪', desc: 'Heilt 30 Lebenspunkte.', heal: 30 },
    grosstrank: { name: 'Großer Trank', icon: '🍶', desc: 'Heilt 60 Lebenspunkte.', heal: 60 },
    schild: { name: 'Schild', icon: '🛡️', desc: 'Blockt den nächsten Angriff des Gegners.', shield: true },
    beere: { name: 'Beere', icon: '🫐', desc: 'Heilt 15 Lebenspunkte.', heal: 15 },
    keks: { name: 'Kraftkeks', icon: '🍪', desc: 'Dein nächster Treffer macht doppelten Schaden. Kostet keinen Zug.', power: true },
    lupe: { name: 'Lupe', icon: '🔎', desc: 'Gibt dir einen Tipp bei der nächsten Aufgabe im Kampf. Kostet keinen Zug.', hint: true },
    engel: { name: 'Schutzengel', icon: '👼', desc: 'Hilft von selbst: Fallen deine Lebenspunkte auf 0, rettet er dich einmal.', revive: true },
    stern: { name: 'Sternenstaub', icon: '✨', desc: 'Gibt deinem Monster sofort 25 XP.', xp: 25 },
  };

  const EVENTS = [
    { title: 'Die Brücke', text: 'Ein alter Troll bewacht eine Brücke. „Löse mein Rätsel, dann darfst du rüber und bekommst einen Trank!“', opts: [{ label: 'Rätsel lösen', task: 'riddle', win: { item: 'trank' }, lose: { hp: -8 } }, { label: 'Umweg nehmen (−5 LP)', effect: { hp: -5 } }] },
    { title: 'Der Zahlenbrunnen', text: 'Ein Brunnen glitzert. Wenn du die richtige Zahl rufst, sprudelt Heilwasser.', opts: [{ label: 'Zahl rufen', task: 'nb', win: { hp: 25 }, lose: { hp: 0 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Schatztruhe', text: 'Eine Truhe mit Zahlenschloss! Die Zahlenfolge öffnet sie.', opts: [{ label: 'Schloss knacken', task: 'seq', win: { item: 'grosstrank' }, lose: { hp: -10 } }, { label: 'Lieber nicht', effect: {} }] },
    { title: 'Die Händlerin', text: 'Eine Händlerin verkauft einen Schild. Sie nimmt 10 Lebenspunkte als Bezahlung.', opts: [{ label: 'Schild kaufen (−10 LP)', effect: { hp: -10, item: 'schild' } }, { label: 'Nein danke', effect: {} }] },
    { title: 'Das Trainingslager', text: 'Ein freundlicher Trainer bietet dir eine Übungsrunde an. Wenn du es schaffst, lernt dein Monster schneller.', opts: [{ label: 'Trainieren', task: 'mul', win: { xp: 25 }, lose: { xp: 5 } }, { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } }] },
    { title: 'Das Beerenfeld', text: 'Überall wachsen Beeren! Du kannst dir welche pflücken.', opts: [{ label: 'Beeren pflücken', effect: { item: 'beere' } }, { label: 'Schnell weiter', effect: {} }] },
    { title: 'Der Zahlengeist', text: 'Ein Geist flüstert: „Zeig mir, dass du rechnen kannst, dann stärke ich dein Monster.“', opts: [{ label: 'Rechnen', task: 'add', win: { maxhp: 8 }, lose: { hp: -6 } }, { label: 'Weglaufen', effect: {} }] },
    { title: 'Der Bäcker', text: 'Ein Bäcker hat frische Kraftkekse gebacken. „Wer mir beim Abwiegen hilft, bekommt einen!“', opts: [{ label: 'Helfen', task: 'sub', win: { item: 'keks' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Der Sternenhimmel', text: 'Eine Sternschnuppe fällt vom Himmel. Setze die leuchtende Zahlenreihe fort, dann gehört der Sternenstaub dir.', opts: [{ label: 'Zählen', task: 'seq', win: { item: 'stern' }, lose: { xp: 5 } }, { label: 'Nur anschauen', effect: {} }] },
    { title: 'Die Gitterhöhle', text: 'In der Höhle leuchtet ein Zahlengitter an der Wand. Wer es löst, findet einen Schatz.', opts: [{ label: 'Gitter lösen', task: 'grid', win: { item: 'trank', xp: 10 }, lose: { hp: -5 } }, { label: 'Draußen bleiben', effect: {} }] },
  ];

  /* ---------- Map ---------- */
  function makeMap(world) {
    const floors = [];
    for (let f = 1; f <= 8; f++) {
      let nodes;
      if (f === 1) nodes = ['fight'];
      else if (f === 8) nodes = ['boss'];
      else {
        const count = rnd(2, 3);
        nodes = [];
        const pool = ['fight', 'fight', 'fight', 'fight', 'event', 'event', 'rest', 'treasure', 'elite'];
        for (let i = 0; i < count; i++) nodes.push(pick(pool));
        if (f === 4 && !nodes.includes('rest')) nodes[0] = 'rest';
        if (f === 7 && !nodes.includes('rest')) nodes[nodes.length - 1] = 'rest';
        if (f < 3) nodes = nodes.map((n) => (n === 'elite' ? 'fight' : n));
        if (!nodes.includes('fight') && f !== 4 && f !== 7) nodes[0] = 'fight';
        if (f === 6 && !nodes.includes('treasure') && Math.random() < 0.5) nodes[0] = 'treasure';
      }
      floors.push(nodes);
    }
    return floors;
  }

  return { rnd, pick, shuffle, MODULES, MODULE_KEYS, generate, TUT, TYPES, BEATS, STARTERS, EXTRA_ATTACKS, ENEMIES, ENEMY_MOVES, ITEMS, EVENTS, makeMap, digits };
})();
if (typeof module !== 'undefined') module.exports = MQ;
