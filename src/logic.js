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
    // worldCap 0 = not offered in that world (written methods only in world 3)
    sadd: { name: 'Schriftlich addieren', icon: '📝', maxTier: 2, worldCap: [0, 0, 2], dmg: 18 },
    ssub: { name: 'Schriftlich subtrahieren', icon: '🗒️', maxTier: 2, worldCap: [0, 0, 2], dmg: 18 },
    smul: { name: 'Schriftlich multiplizieren', icon: '🧾', maxTier: 2, worldCap: [0, 0, 2], dmg: 18 },
    teilbar: { name: 'Teilbarkeit', icon: '✂️', maxTier: 3, worldCap: [1, 2, 3], dmg: 12 },
    mauer: { name: 'Zahlenmauern', icon: '🧱', maxTier: 3, worldCap: [1, 2, 3], dmg: 16 },
    bruch: { name: 'Bruchteile', icon: '🥧', maxTier: 3, worldCap: [1, 2, 3], dmg: 14 },
    vorrang: { name: 'Punkt vor Strich', icon: '🚦', maxTier: 2, worldCap: [1, 2, 2], dmg: 14 },
    zahlwort: { name: 'Zahlwörter und Stellenwerte', icon: '🔤', maxTier: 3, worldCap: [1, 2, 3], dmg: 10 },
    kopf: { name: 'Kopfrechnen bis 1000', icon: '💡', maxTier: 3, worldCap: [0, 2, 3], dmg: 12 },
    zmul: { name: 'Malnehmen mit großen Zahlen', icon: '✳️', maxTier: 2, worldCap: [0, 1, 2], dmg: 14 },
    vergl: { name: 'Zahlen vergleichen und ordnen', icon: '⚖️', maxTier: 2, worldCap: [0, 1, 2], dmg: 10 },
    ueber: { name: 'Überschlagen', icon: '💭', maxTier: 1, worldCap: [0, 0, 1], dmg: 14 },
    // practised at the market, never an attack
    geld: { name: 'Geld', icon: '🪙', maxTier: 2, worldCap: [1, 2, 2], dmg: 0, shop: true },
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
    // tier 1: two-digit minus two-digit without crossing the ten
    if (t === 1) { do { a = rnd(30, 99); b = rnd(11, a - 2); } while (a % 10 < b % 10); return task(`${a} − ${b} = ?`, [a - b]); }
    if (t === 2) { do { a = rnd(21, 99); b = rnd(2, 9); } while (a % 10 >= b || a % 10 === 0); return task(`${a} − ${b} = ?`, [a - b]); }
    if (t === 3) { do { a = rnd(30, 99); b = rnd(11, a - 1); } while (a % 10 >= b % 10); return task(`${a} − ${b} = ?`, [a - b]); }
    if (t === 4) { do { a = rnd(110, 999); b = rnd(5, 99); } while (a % 100 >= b % 100 && a % 10 >= b % 10); return task(`${a} − ${b} = ?`, [a - b]); }
    // tier 5: tens across the hundred (740 − 280), as a plain task or with the gap in the middle
    do { a = rnd(20, 99) * 10; b = rnd(11, 89) * 10; } while (a % 100 >= b % 100 || a - b < 20);
    return Math.random() < 0.5 ? task(`${a} − ${b} = ?`, [a - b]) : task(`${a} − ? = ${a - b}`, [b], { reverse: true });
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
    // tier 3: halbschriftlich, 96 : 3 = 90 : 3 + 6 : 3
    do { a = rnd(2, 9); b = rnd(11, 99); } while (b % 10 === 0 || a * b > 200 || a * b <= 50);
    return task(`${a * b} : ${a} = ?`, [b]);
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
  // column layout: carry[i] is the Übertrag written small under column i (0 = leftmost).
  // Subtraction uses the Saxon Ergänzungsverfahren: the carry goes to the subtrahend's next column.
  function columns(op, rows) {
    const res = op === '+' ? rows.reduce((a, b) => a + b, 0) : op === '·' ? rows[0] * rows[1] : rows[0] - rows[1];
    const w = Math.max(...rows.concat(res).map((n) => String(n).length));
    const dig = (n, i) => Math.floor(n / 10 ** (w - 1 - i)) % 10;
    const carry = Array(w).fill(0);
    for (let i = w - 1; i > 0; i--) carry[i - 1] = op === '+' ? Math.floor((rows.reduce((s, n) => s + dig(n, i), 0) + carry[i]) / 10) : op === '·' ? Math.floor((dig(rows[0], i) * rows[1] + carry[i]) / 10) : (dig(rows[0], i) < dig(rows[1], i) + carry[i] ? 1 : 0);
    return task(`${rows.join(` ${op} `)} = ?`, [res], { col: { op, rows, carry, w } });
  }
  const carries = (t) => t.col.carry.filter(Boolean).length;
  function genSadd(t) {
    let tk;
    do tk = t === 1 ? columns('+', [rnd(100, 899), rnd(10, 899)]) : columns('+', [rnd(100, 599), rnd(10, 399), rnd(10, 299)]);
    while (tk.answers[0] > 999 || !carries(tk));
    return tk;
  }
  function genSsub(t) {
    let tk;
    // tier 1: one Übertrag, tier 2: two (often with a zero in the minuend)
    do { const a = rnd(200, 999); tk = columns('−', [a, rnd(10, a - 10)]); } while (tk.answers[0] < 10 || carries(tk) !== t);
    return tk;
  }
  // multiplication: the second factor stands right of the first, the result goes under the first factor
  function genSmul(t) {
    let tk;
    do { const b = t === 1 ? rnd(2, 4) : rnd(2, 9); tk = columns('·', [rnd(100, Math.floor(999 / b)), b]); } while ((t === 1 ? carries(tk) : !carries(tk)) || tk.col.rows[0] % 100 === 0);
    return tk;
  }
  const choice = (q, options, answer, extra) => Object.assign({ kind: 'choice', text: q, q, options, answer }, extra);
  const DIV_TIP = { 2: 'Durch 2 teilbar: Die letzte Ziffer ist 0, 2, 4, 6 oder 8.', 3: 'Durch 3 teilbar: Die Quersumme ist durch 3 teilbar.', 5: 'Durch 5 teilbar: Die letzte Ziffer ist 0 oder 5.', 9: 'Durch 9 teilbar: Die Quersumme ist durch 9 teilbar.', 10: 'Durch 10 teilbar: Die letzte Ziffer ist 0.', 100: 'Durch 100 teilbar: Die letzten beiden Ziffern sind 00.' };
  const qsum = (n) => String(n).split('').reduce((s, c) => s + +c, 0);
  function genTeilbar(t) {
    if (t === 3 && Math.random() < 0.4) { const n = rnd(102, 999); return task(`${n}`, [qsum(n)], { ask: 'Wie groß ist die Quersumme? Zähle alle Ziffern zusammen.' }); }
    const d = pick(t < 3 ? [2, 5, 10] : [3, 9, 9, 100]); const lo = t === 1 ? 10 : 100, hi = t === 1 ? 99 : 999;
    const hit = () => d * rnd(Math.ceil(lo / d), Math.floor(hi / d)); const miss = () => { let n; do n = rnd(lo, hi); while (n % d === 0); return n; };
    if (t === 2) { const right = hit(); const wrong = []; while (wrong.length < 2) { const n = miss(); if (!wrong.includes(n)) wrong.push(n); }
      return choice(`Welche Zahl ist durch ${d} teilbar?`, shuffle([right, ...wrong]).map(String), String(right), { why: DIV_TIP[d], cols: 1 }); }
    const yes = Math.random() < 0.5; const n = yes ? hit() : miss();
    return choice(`Ist ${n} durch ${d} teilbar?`, ['ja', 'nein'], yes ? 'ja' : 'nein', { why: DIV_TIP[d] + (d === 3 || d === 9 ? ` Die Quersumme von ${n} ist ${qsum(n)}.` : ''), tip: DIV_TIP[d], cols: 2 });
  }
  // Zahlenmauer: every stone is the sum of the two below. Rechendreieck: each outer field is the sum of its two inner neighbours.
  const stone = (x, y, w, v, miss) => `<g data-v="${v}"><rect x="${x}" y="${y}" width="${w}" height="34" rx="4" fill="${miss ? '#FFE27A' : '#F3D9B1'}" stroke="#1C2541" stroke-width="2"/><text x="${x + w / 2}" y="${y + 24}" text-anchor="middle" font-size="20" font-weight="700" fill="#1C2541">${v}</text></g>`;
  function genMauer(t) {
    if (t === 3) {
      const inner = [0, 1, 2].map(() => rnd(20, 450)); const outer = [inner[0] + inner[1], inner[1] + inner[2], inner[0] + inner[2]];
      const k = rnd(0, 5); const vals = inner.concat(outer); const show = vals.map((v, i) => (i === k ? '?' : v));
      // inner fields at the corners of the triangle, outer fields beside the middle of each side
      const P = [[120, 78], [72, 164], [168, 164], [28, 96], [120, 216], [212, 96]];
      const box = (i) => { const [x, y] = P[i]; return `<g data-tri="${i}" data-v="${show[i]}"><rect x="${x - 30}" y="${y - 17}" width="60" height="34" rx="${i < 3 ? 17 : 4}" fill="${i === k ? '#FFE27A' : i < 3 ? '#FFFFFF' : '#CFE6FF'}" stroke="#1C2541" stroke-width="2"/><text x="${x}" y="${y + 8}" text-anchor="middle" font-size="22" font-weight="700" fill="#1C2541">${show[i]}</text></g>`; };
      const svg = `<svg class="mauer tri" viewBox="-4 0 248 238" role="img" aria-label="Rechendreieck: innen ${show.slice(0, 3).join(', ')}, außen ${show.slice(3).join(', ')}"><path d="M120 8 L14 192 L226 192 Z" fill="none" stroke="#1C2541" stroke-width="2.5" stroke-linejoin="round"/>${[0, 1, 2, 3, 4, 5].map(box).join('')}</svg>`;
      return task(`Rechendreieck ${show.join(' ')}`, [vals[k]], { svg, ask: 'Außen steht die Summe der beiden Zahlen innen daneben. Welche Zahl fehlt?' });
    }
    const max = t === 1 ? 99 : 999; let b;
    do b = t === 1 ? [rnd(2, 30), rnd(2, 30), rnd(2, 30)] : [rnd(20, 300), rnd(20, 300), rnd(20, 300)]; while (b[0] + 2 * b[1] + b[2] > max);
    const rows = [b, [b[0] + b[1], b[1] + b[2]], [b[0] + 2 * b[1] + b[2]]];
    // tier 1: a stone in the middle row (add) or at the bottom (subtract); tier 2 anywhere
    const r = t === 1 ? rnd(0, 1) : rnd(0, 2); const c = rnd(0, rows[r].length - 1);
    const show = rows.map((row, i) => row.map((v, j) => (i === r && j === c ? '?' : v)));
    const W = 64, svg = `<svg class="mauer" viewBox="0 0 ${3 * W + 4} ${3 * 36 + 4}" role="img" aria-label="Zahlenmauer: unten ${show[0].join(', ')}, Mitte ${show[1].join(', ')}, oben ${show[2][0]}">${show.map((row, i) => row.map((v, j) => stone(2 + (i * W) / 2 + j * W, 2 + (2 - i) * 36, W, v, v === '?').replace('<g ', `<g data-r="${i}" data-c="${j}" `)).join('')).join('')}</svg>`;
    return task(`Zahlenmauer ${show.map((row) => row.join(' ')).join(' / ')}`, [rows[r][c]], { svg, ask: 'Jeder Stein ist die Summe der beiden Steine darunter. Welche Zahl fehlt?' });
  }
  const FRAC = { '½': [1, 2, 'die Hälfte'], '¼': [1, 4, 'ein Viertel'], '¾': [3, 4, 'drei Viertel'], '⅓': [1, 3, 'ein Drittel'] };
  // ½ m = 50 cm, ¼ h = 15 min …: only pairs with a whole result
  const SIZES = [['m', 'cm', 100, 'einem Meter'], ['h', 'min', 60, 'einer Stunde'], ['kg', 'g', 1000, 'einem Kilogramm'], ['km', 'm', 1000, 'einem Kilometer']];
  function genBruch(t) {
    if (t === 3) { const [u, v, f, of] = pick(SIZES); const g = pick(['½', '¼', '¾']); const [z, n, word] = FRAC[g];
      return task(`${g} ${u} = ? ${v}`, [(f / n) * z], { ask: `Wie viel ist ${word} (${g}) von ${of}?` }); }
    const g = t === 1 ? pick(['½', '¼']) : pick(['¾', '⅓', '½', '¼']); const [z, n, word] = FRAC[g];
    // tier 1 stays under 100; tier 2 also takes ½ and ¼ of hundreds-and-tens numbers
    const whole = t === 1 || g === '¾' || g === '⅓' ? n * rnd(g === '½' ? 6 : 3, Math.floor(99 / n)) : n * 10 * rnd(3, Math.floor(99 / n));
    return task(`${g} von ${whole} = ?`, [(whole / n) * z], { ask: `Wie viel ist ${word} (${g}) von ${whole}?` });
  }
  // Punkt vor Strich, no brackets (not part of Klasse 3 in Saxony)
  function genVorrang(t) {
    const k = t === 1 ? 1 : 10; const hi = t === 1 ? 99 : 999;
    for (;;) {
      const x = rnd(2, 9) * k, y = rnd(2, 9); const div = Math.random() < 0.5; const p = div ? `${x * y} : ${y}` : `${x} · ${y}`; const pv = div ? x : x * y;
      const a = t === 1 ? rnd(2, 40) : rnd(2, 60) * 10; const plus = Math.random() < 0.5; const first = Math.random() < 0.5;
      const res = plus ? a + pv : first ? pv - a : a - pv;
      if (res < 0 || res > hi || (div && x * y > hi)) continue;
      return task(`${first ? `${p} ${plus ? '+' : '−'} ${a}` : `${a} ${plus ? '+' : '−'} ${p}`} = ?`, [res], { ask: 'Punkt vor Strich: Mal und geteilt rechnest du zuerst.', long: t === 2 });
    }
  }
  const ONES = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
  const TEENS = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
  const TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
  // „ein“ before „und“, „hundert“ and „tausend“, „eins“ at the end (101 = einhunderteins)
  function numWord(n) {
    if (n === 1000) return 'eintausend';
    if (n >= 100) { const h = Math.floor(n / 100), r = n % 100; return (h === 1 ? 'ein' : ONES[h]) + 'hundert' + (r ? numWord(r) : ''); }
    if (n < 10) return ONES[n]; if (n < 20) return TEENS[n - 10];
    const e = n % 10; return (e ? (e === 1 ? 'ein' : ONES[e]) + 'und' : '') + TENS[Math.floor(n / 10)];
  }
  const PV = [['H', 100], ['Z', 10], ['E', 1]];
  const digits3 = (n) => [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
  const pvText = (d, order) => order.map((i) => `${d[i]} ${PV[i][0]}`).join(' ');
  function genZahlwort(t) {
    if (t < 3) { const n = t === 1 ? rnd(13, 99) : rnd(101, 999); return task(numWord(n), [n], { word: true }); }
    let n; do n = rnd(102, 999); while (new Set(String(n)).size < 3);
    const d = digits3(n);
    if (Math.random() < 0.5) return task(`${pvText(d, Math.random() < 0.5 ? [0, 1, 2] : shuffle([0, 1, 2]))} = ?`, [n], { ask: 'Welche Zahl ist das? H = Hunderter, Z = Zehner, E = Einer.' });
    // wrong options swap two digits, so every place value has to be read
    const opts = [d, [d[1], d[0], d[2]], [d[0], d[2], d[1]], [d[2], d[1], d[0]]].map((x) => pvText(x, [0, 1, 2]));
    return choice(`${n} = ? H ? Z ? E`, shuffle([opts[0]].concat(shuffle(opts.slice(1)).slice(0, 2))), opts[0], { why: `${n} hat ${d[0]} Hunderter, ${d[1]} Zehner und ${d[2]} Einer.`, cols: 1 });
  }
  // tens and hundreds in the head; tier 3 fills up to 1000
  function genKopf(t) {
    let a, b;
    if (t === 3) { do a = Math.random() < 0.6 ? rnd(11, 99) * 10 : rnd(101, 999); while (a % 100 === 0); return task(`${a} + ? = 1000`, [1000 - a], { reverse: true }); }
    // tier 1 stays inside the hundred, tier 2 crosses it
    const cross = (x, y, plus) => (plus ? x % 100 + y % 100 >= 100 : x % 100 < y % 100);
    const plus = Math.random() < 0.5;
    do { a = rnd(11, 99) * 10; b = rnd(11, 89) * 10; } while ((plus ? a + b > 990 : a - b < 20) || cross(a, b, plus) !== (t === 2) || (t === 1 && (a % 100 === 0 || b % 100 === 0)));
    return task(`${a} ${plus ? '+' : '−'} ${b} = ?`, [plus ? a + b : a - b]);
  }
  function genZmul(t) {
    let a, b;
    if (t === 1) { a = rnd(2, 9); b = rnd(2, 9) * 10; }
    else do { a = rnd(2, 9); b = rnd(12, 99); } while (b % 10 < 2 || a * b > 999 || a * b < 60);
    return Math.random() < 0.5 ? task(`${a} · ${b} = ?`, [a * b]) : task(`${b} · ${a} = ?`, [a * b]);
  }
  // Überschlag: wrong options keep the Zehner and Einer, so only rounding to hundreds tells them apart.
  // Numbers whose rest is 40–60 are left out: rounding them is a close call.
  function genUeber() {
    const ok = (n) => n % 100 < 40 || n % 100 > 60; const r100 = (n) => Math.round(n / 100) * 100;
    let a, b, plus, res;
    do { plus = Math.random() < 0.5; a = rnd(101, 899); b = rnd(101, 899); res = plus ? a + b : a - b; } while (!ok(a) || !ok(b) || res < 100 || res > 999);
    const est = plus ? r100(a) + r100(b) : r100(a) - r100(b); const op = plus ? '+' : '−';
    const wrong = shuffle([-400, -300, -200, 200, 300, 400].map((d) => res + d).filter((n) => n >= 10 && n <= 999)).slice(0, 2);
    return choice(`Welches Ergebnis kann stimmen? ${a} ${op} ${b} = ___`, shuffle([res].concat(wrong)).map(String), String(res),
      { why: `Überschlag: ${r100(a)} ${op} ${r100(b)} = ${est}. Nah dran ist nur ${res}.` });
  }
  function genVergl(t) {
    const n = rnd(100, 999);
    if (t === 1) {
      // a close second number: one digit changed or two digits swapped; sometimes as H Z E (then also equal)
      const d = String(n).split('').map(Number); const i = rnd(0, 2);
      let m; do { const e = d.slice(); if (Math.random() < 0.5) { const j = (i + 1) % 3; [e[i], e[j]] = [e[j], e[i]]; } else e[i] = rnd(i ? 0 : 1, 9); m = +e.join(''); } while (m === n || m < 100);
      const pv = Math.random() < 0.3; if (pv && Math.random() < 0.4) m = n;
      const left = pv ? pvText(digits3(m), [0, 1, 2]) : String(m);
      const ans = m < n ? '<' : m > n ? '>' : '=';
      return choice(`Setze ein: <, > oder =. ${left} ___ ${n}`, ['<', '>', '='], ans, { why: `${m} ${ans} ${n}. Vergleiche zuerst die Hunderter, dann die Zehner, dann die Einer.` });
    }
    // four numbers with the same digits or the same hundreds, so every place has to be compared
    const nums = new Set(); const h = Math.floor(n / 100);
    while (nums.size < 4) nums.add(Math.random() < 0.5 ? +shuffle(String(n).split('')).join('') : h * 100 + rnd(0, 99));
    const list = [...nums].filter((x) => x >= 100); if (list.length < 4) return genVergl(2);
    const up = Math.random() < 0.5; const sorted = list.slice().sort((x, y) => (up ? x - y : y - x));
    const items = sorted.map((x) => ({ id: 'n' + x, text: String(x) }));
    const q = `Ordne die Zahlen. Tippe zuerst die ${up ? 'kleinste' : 'größte'} an.`;
    return { kind: 'order', text: q + ' ' + list.join(' '), q, items, order: items.map((x) => x.id), display: shuffle(items) };
  }
  // money is always shown as „3 € 50 ct“, never with a comma
  function euro(c) { const e = Math.floor(c / 100), ct = c % 100; return e ? `${e} €${ct ? ` ${String(ct).padStart(2, '0')} ct` : ''}` : `${ct} ct`; }
  const COINS = [200, 100, 50, 20, 10, 5, 2, 1];
  function genGeld(t) {
    if (t === 1) { const cs = Array.from({ length: rnd(2, 4) }, () => pick(COINS.slice(1))).sort((a, b) => b - a); const s = cs.reduce((a, b) => a + b, 0);
      return task(cs.map(euro).join(' + '), [Math.floor(s / 100), s % 100], { ask: 'Wie viel Geld ist das zusammen?', labels: ['€', 'ct'], money: true }); }
    const price = rnd(7, 99) * 5; const paid = pick([200, 500, 1000].filter((p) => p > price)); const c = paid - price;
    return task(`${euro(paid)} − ${euro(price)}`, [Math.floor(c / 100), c % 100], { ask: 'Wie viel Rückgeld bekommst du?', labels: ['€', 'ct'], money: true });
  }
  function task(text, answers, extra) { return Object.assign({ text, answers }, extra || {}); }

  function generate(mod, tier, opts) {
    tier = Math.max(1, Math.min(MODULES[mod].maxTier, tier));
    const g = { add: genAdd, sub: genSub, mul: genMul, riddle: genRiddle, seq: genSeq, nb: genNb, grid: (t) => genGrid(t, opts && opts.elite), div: genDiv, rest: (t) => genRest(t, opts && opts.zero), rund: genRund, dopp: genDopp, sadd: genSadd, ssub: genSsub, smul: genSmul, teilbar: genTeilbar, mauer: genMauer, bruch: genBruch, vorrang: genVorrang, zahlwort: genZahlwort, kopf: genKopf, zmul: genZmul, vergl: genVergl, ueber: genUeber, geld: genGeld }[mod];
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
      1: { title: 'Minus mit Zehnern und Einern', steps: ['Ziehe erst die Zehner ab, dann die Einer.', '58 − 23: 58 − 20 = 38.', 'Dann 38 − 3 = 35. Also 58 − 23 = 35.'] },
      2: { title: 'Minus über den Zehner', steps: ['Gehe erst bis zum vollen Zehner, dann den Rest.', '22 − 7: Erst 22 − 2 = 20. Es bleiben noch 5.', '20 − 5 = 15.'] },
      3: { title: 'Zweistellig minus zweistellig', steps: ['Ziehe erst die Zehner ab, dann die Einer.', '63 − 28: 63 − 20 = 43, dann 43 − 8.', '43 − 3 = 40, 40 − 5 = 35. Also 35.'] },
      4: { title: 'Minus mit Hundertern', steps: ['Ziehe Schritt für Schritt ab: erst Zehner, dann Einer.', '304 − 9: 304 − 4 = 300, dann 300 − 5 = 295.', '512 − 67: 512 − 60 = 452, dann 452 − 7 = 445.'] },
      5: { title: 'Minus mit Zehnerzahlen', steps: ['Ziehe erst die Hunderter ab, dann die Zehner.', '740 − 280: 740 − 200 = 540. Dann 540 − 40 = 500 und 500 − 40 = 460.', 'Fehlt die Zahl in der Mitte, rechne von unten nach oben: 620 − ? = 350. Von 350 bis 400 sind es 50, von 400 bis 620 sind es 220.', '50 + 220 = 270. Also ? = 270.'] },
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
      3: { title: 'Halbschriftlich teilen', steps: ['Zerlege die große Zahl in zwei Zahlen, die du leicht teilen kannst.', '96 : 3: 96 = 90 + 6. 90 : 3 = 30 und 6 : 3 = 2.', '30 + 2 = 32. Also 96 : 3 = 32.', '135 : 5: 135 = 100 + 35. 100 : 5 = 20 und 35 : 5 = 7. Zusammen 27.'] },
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
    geld: {
      1: { title: 'Passend bezahlen', steps: ['100 ct sind 1 €. Zähle erst die Euro, dann die Cent.', 'Tippe auf eine Ware. Lege dann Münzen auf den Ladentisch, bis es genau der Preis ist.', 'Beispiel: Die Chilischote kostet 85 ct. Du legst 50 ct, 20 ct, 10 ct und 5 ct hin.', '50 + 20 + 10 + 5 = 85. Das sind genau 85 ct. Dann tippst du auf „Bezahlen“.'] },
      2: { title: 'Rückgeld ausrechnen', steps: ['Du darfst auch mehr Geld hinlegen. Dann bekommst du Rückgeld.', 'Beispiel: Der Trank kostet 1 € 20 ct. Du gibst 2 €.', 'Von 1 € 20 ct bis 2 € fehlen 80 ct. Du bekommst 0 € und 80 ct zurück.', 'Zum Prüfen rechnest du plus: 1 € 20 ct + 80 ct = 2 €.'] },
    },
  });
  Object.assign(TUT, {
    sadd: {
      1: { title: 'Schriftlich addieren', steps: ['Die Zahlen stehen genau untereinander: Einer unter Einer, Zehner unter Zehner, Hunderter unter Hunderter. Du rechnest von rechts nach links.', '358 + 274: Einer 8 + 4 = 12. Schreibe 2. Die 1 kommt als Übertrag in das kleine Feld der Zehnerspalte.', 'Zehner: 1 + 5 + 7 = 13. Schreibe 3, Übertrag 1 in die Hunderterspalte.', 'Hunderter: 1 + 3 + 2 = 6. Schreibe 6. Ergebnis: 632.'] },
      2: { title: 'Drei Zahlen schriftlich addieren', steps: ['Alle drei Zahlen stehen stellengerecht untereinander. Du rechnest von rechts nach links.', '246 + 135 + 89: Einer 6 + 5 + 9 = 20. Schreibe 0, Übertrag 2.', 'Zehner: 2 + 4 + 3 + 8 = 17. Schreibe 7, Übertrag 1.', 'Hunderter: 1 + 2 + 1 = 4. Schreibe 4. Ergebnis: 470.'] },
    },
    ssub: {
      1: { title: 'Schriftlich subtrahieren', steps: ['Die kleinere Zahl steht stellengerecht unter der größeren. Du rechnest von rechts nach links und ergänzt von unten nach oben.', '742 − 318: Einer: 8 plus wie viel ist 2? Das geht nicht, also bis 12: 8 + 4 = 12. Schreibe 4, Übertrag 1 in die Zehnerspalte.', 'Zehner: 1 + 1 = 2. 2 plus wie viel ist 4? 2 + 2 = 4. Schreibe 2.', 'Hunderter: 3 plus wie viel ist 7? 3 + 4 = 7. Schreibe 4. Ergebnis: 424.'] },
      2: { title: 'Subtrahieren mit zwei Überträgen', steps: ['Ist die untere Zahl größer als die obere Ziffer, ergänzt du bis zur Zahl über 10 und schreibst 1 als Übertrag in die nächste Spalte.', '503 − 276: Einer: 6 + 7 = 13. Schreibe 7, Übertrag 1.', 'Zehner: 7 + 1 = 8. 8 plus wie viel ist 0? Das geht nicht, also bis 10: 8 + 2 = 10. Schreibe 2, Übertrag 1.', 'Hunderter: 2 + 1 = 3. 3 + 2 = 5. Schreibe 2. Ergebnis: 227.'] },
    },
  });
  Object.assign(TUT, {
    smul: {
      1: { title: 'Schriftlich multiplizieren', steps: ['Die Aufgabe steht in einer Zeile, zum Beispiel 213 · 3. Das Ergebnis schreibst du unter die erste Zahl. Du rechnest von rechts nach links, Stelle für Stelle.', 'Einer: 3 · 3 = 9. Schreibe 9 unter die Einer.', 'Zehner: 3 · 1 = 3. Schreibe 3. Hunderter: 3 · 2 = 6. Schreibe 6.', 'Ergebnis: 639.'] },
      2: { title: 'Multiplizieren mit Übertrag', steps: ['Ist ein Ergebnis 10 oder größer, schreibst du nur die Einer hin. Die Zehner merkst du dir als Übertrag im kleinen Feld der nächsten Spalte.', '247 · 3: Einer: 3 · 7 = 21. Schreibe 1, Übertrag 2.', 'Zehner: 3 · 4 = 12, plus Übertrag 2 = 14. Schreibe 4, Übertrag 1.', 'Hunderter: 3 · 2 = 6, plus Übertrag 1 = 7. Schreibe 7. Ergebnis: 741.'] },
    },
    teilbar: {
      1: { title: 'Teilbar durch 2, 5 und 10', steps: ['Eine Zahl ist durch eine andere teilbar, wenn beim Teilen kein Rest bleibt. Dafür schaust du auf die letzte Ziffer.', 'Durch 2: Die letzte Ziffer ist 0, 2, 4, 6 oder 8. Durch 5: 0 oder 5. Durch 10: 0.', 'Ist 48 durch 2 teilbar? Die letzte Ziffer ist 8, also ja: 48 : 2 = 24. Ist 48 durch 5 teilbar? 8 ist weder 0 noch 5, also nein.'] },
      2: { title: 'Die teilbare Zahl finden', steps: ['Prüfe jede Zahl einzeln an ihrer letzten Ziffer.', 'Welche Zahl ist durch 5 teilbar: 342, 415 oder 503?', '342 endet auf 2, 503 auf 3. Nur 415 endet auf 5. Also 415.'] },
      3: { title: 'Quersumme: teilbar durch 3 und 9', steps: ['Die Quersumme ist die Summe aller Ziffern. Quersumme von 342: 3 + 4 + 2 = 9.', 'Durch 3 teilbar: Die Quersumme ist durch 3 teilbar. Durch 9 teilbar: Die Quersumme ist durch 9 teilbar.', 'Ist 342 durch 9 teilbar? Die Quersumme 9 ist durch 9 teilbar, also ja: 342 : 9 = 38.', 'Durch 100 teilbar: Die letzten beiden Ziffern sind 00, wie bei 700.'] },
    },
    mauer: {
      1: { title: 'Zahlenmauern', steps: ['Jeder Stein ist die Summe der beiden Steine direkt darunter.', 'Unten 12, 7 und 15. Mitte: 12 + 7 = 19 und 7 + 15 = 22. Oben: 19 + 22 = 41.', 'Fehlt ein Stein unten, rechnest du minus: In der Mitte steht 19, unten links 12. 19 − 12 = 7.'] },
      2: { title: 'Große Zahlenmauern', steps: ['Die Regel bleibt: Jeder Stein ist die Summe der beiden darunter.', 'Unten stehen 120 und ein fehlender Stein, darüber 305. Der fehlende Stein: 305 − 120 = 185.', 'Fehlt der oberste Stein, addierst du die beiden Steine der Mitte: 305 + 410 = 715.'] },
      3: { title: 'Rechendreiecke', steps: ['Innen stehen drei Zahlen in den Ecken. Außen an jeder Seite steht die Summe der beiden Zahlen innen daneben.', 'Innen 140, 260 und 75. Außen: 140 + 260 = 400, 260 + 75 = 335, 140 + 75 = 215.', 'Fehlt eine Zahl innen, rechnest du minus: Außen steht 400, innen daneben 140. 400 − 140 = 260.'] },
    },
    bruch: {
      1: { title: 'Die Hälfte und ein Viertel', steps: ['Die Hälfte (½) heißt: in 2 gleiche Teile teilen. Ein Viertel (¼) heißt: in 4 gleiche Teile teilen.', 'Die Hälfte von 48: 48 : 2 = 24.', 'Ein Viertel von 36: 36 : 4 = 9.'] },
      2: { title: 'Drei Viertel und ein Drittel', steps: ['Ein Drittel (⅓) heißt: in 3 gleiche Teile teilen. Ein Drittel von 27: 27 : 3 = 9.', 'Drei Viertel (¾) sind drei von vier gleichen Teilen. Rechne erst ein Viertel aus, dann mal 3.', 'Drei Viertel von 20: 20 : 4 = 5, dann 5 · 3 = 15.'] },
      3: { title: 'Bruchteile von Größen', steps: ['Rechne zuerst in die kleinere Einheit um: 1 m = 100 cm, 1 h = 60 min, 1 kg = 1000 g, 1 km = 1000 m.', '½ m: Die Hälfte von 100 cm ist 50 cm.', '¾ h: Ein Viertel von 60 min ist 15 min. Drei Viertel sind 3 · 15 = 45 min.'] },
    },
    vorrang: {
      1: { title: 'Punkt vor Strich', steps: ['Mal (·) und geteilt (:) sind Punktrechnungen. Plus (+) und minus (−) sind Strichrechnungen.', 'Kommen beide in einer Aufgabe vor, rechnest du zuerst die Punktrechnung.', '3 + 4 · 2: Erst 4 · 2 = 8, dann 3 + 8 = 11.', '20 − 12 : 4: Erst 12 : 4 = 3, dann 20 − 3 = 17.'] },
      2: { title: 'Punkt vor Strich mit großen Zahlen', steps: ['Auch mit Zehnerzahlen gilt: zuerst · oder :, dann + oder −.', '500 − 40 · 6: Erst 40 · 6 = 240, dann 500 − 240 = 260.', '350 + 480 : 8: Erst 480 : 8 = 60, dann 350 + 60 = 410.'] },
    },
    zahlwort: {
      1: { title: 'Zahlwörter bis 100', steps: ['Im Zahlwort hörst du zuerst die Einer, dann die Zehner. Geschrieben wird aber zuerst der Zehner.', 'achtundvierzig: acht Einer und vierzig, also 4 Zehner. Die Zahl ist 48.', 'einundsechzig: ein Einer und sechzig. Die Zahl ist 61.'] },
      2: { title: 'Zahlwörter bis 1000', steps: ['Zuerst kommen die Hunderter. Danach geht es weiter wie bis 100: erst die Einer, dann die Zehner.', 'dreihundertachtundvierzig: dreihundert, acht Einer und vierzig.', '3 Hunderter, 4 Zehner, 8 Einer. Die Zahl ist 348.'] },
      3: { title: 'Die Stellenwerttafel', steps: ['H heißt Hunderter, Z Zehner, E Einer. Die Reihenfolge in der Aufgabe kann wechseln, lies die Buchstaben genau.', '3 H 4 Z 8 E: 300 + 40 + 8 = 348.', '5 H 0 E 6 Z: 5 Hunderter, 6 Zehner, 0 Einer. Die Zahl ist 560.', 'Umgekehrt: 348 hat 3 H, 4 Z und 8 E.'] },
    },
  });
  Object.assign(TUT, {
    kopf: {
      1: { title: 'Mit Zehnerzahlen rechnen', steps: ['Rechne erst die Hunderter, dann die Zehner.', '340 + 250: 300 + 200 = 500, 40 + 50 = 90. Zusammen 590.', '580 − 230: 580 − 200 = 380, dann 380 − 30 = 350.'] },
      2: { title: 'Über den Hunderter', steps: ['Gehe erst bis zum vollen Hunderter, dann den Rest.', '370 + 450: 370 + 400 = 770. Dann 770 + 30 = 800 und 800 + 20 = 820.', '700 − 260: 700 − 200 = 500. Dann 500 − 60 = 440.'] },
      3: { title: 'Ergänzen bis 1000', steps: ['Wie viel fehlt bis 1000? Gehe erst bis zum nächsten Hunderter.', '650 + ? = 1000: Von 650 bis 700 sind es 50. Von 700 bis 1000 sind es 300.', '50 + 300 = 350. Also ? = 350.', 'Mit Einern: 365 + ? = 1000. Bis 370 fehlen 5, bis 400 noch 30, bis 1000 noch 600. Zusammen 635.'] },
    },
    zmul: {
      1: { title: 'Malnehmen mit Zehnerzahlen', steps: ['Lass die Null erst weg und rechne mit dem Einmaleins.', '4 · 70: Rechne 4 · 7 = 28.', '4 · 7 Zehner sind 28 Zehner. Also 4 · 70 = 280.'] },
      2: { title: 'Halbschriftlich malnehmen', steps: ['Zerlege die große Zahl in Zehner und Einer.', '6 · 23 = 6 · 20 + 6 · 3.', '6 · 20 = 120 und 6 · 3 = 18.', '120 + 18 = 138. Also 6 · 23 = 138.'] },
    },
    vergl: {
      1: { title: 'Zahlen vergleichen', steps: ['< heißt „ist kleiner als“, > heißt „ist größer als“, = heißt „ist gleich“. Die Spitze zeigt immer zur kleineren Zahl.', 'Vergleiche zuerst die Hunderter. Sind sie gleich, die Zehner. Sind auch die gleich, die Einer.', '347 und 374: Hunderter gleich, Zehner 4 und 7. Also 347 < 374.', '3 H 5 Z 4 E ist die Zahl 354.'] },
      2: { title: 'Zahlen ordnen', steps: ['Suche zuerst die kleinste Zahl (oder die größte, wenn danach gefragt ist).', 'Schau auf die Hunderter, dann auf die Zehner, dann auf die Einer.', '528, 285, 582, 258: Am kleinsten ist 258, dann 285, dann 528, am größten 582.'] },
    },
    ueber: {
      1: { title: 'Überschlagen', steps: ['Beim Überschlag rundest du jede Zahl auf Hunderter und rechnest mit den runden Zahlen.', '387 + 412: 400 + 400 = 800. Das Ergebnis liegt nah bei 800.', 'Von 799, 599 und 999 liegt nur 799 nah bei 800. Also kann nur 799 stimmen.'] },
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
      attacks: [{ name: 'Wasserschwall', mod: 'add' }, { name: 'Strudelzug', mod: 'sub' }, { name: 'Tiefseerätsel', mod: 'riddle' }, { name: 'Uferdamm', mod: 'mauer' }] },
    { id: 'baer', type: 'pflanze', shape: 'bear', names: ['Moosbär', 'Waldbär', 'Urwaldbär'], hp: 70, desc: 'Ruhig und stark. Jede richtige Antwort heilt ihn um 3 Lebenspunkte.', perk: 'heal',
      attacks: [{ name: 'Blätterhieb', mod: 'add' }, { name: 'Wurzelriss', mod: 'sub' }, { name: 'Honigrechnung', mod: 'mul' }, { name: 'Wabenteilung', mod: 'div' }] },
    // unlocked in the Stempelheft; practises the task types the other three heroes have least
    { id: 'kauz', type: 'normal', shape: 'owl', names: ['Steinkauz', 'Waldkauz', 'Uhu'], hp: 70, desc: 'Jagt nachts und sieht im Dunkeln. Kein Typ ist stark gegen ihn, er ist aber auch gegen keinen stark.',
      attacks: [{ name: 'Federfächer', mod: 'mul' }, { name: 'Astsprung', mod: 'nb' }, { name: 'Nachtblick', mod: 'riddle' }, { name: 'Nachtruf', mod: 'zahlwort' }] },
  ];
  const EXTRA_ATTACKS = { add: 'Blitzsumme', sub: 'Rückwärtsgang', mul: 'Malmühle', riddle: 'Zifferncode', seq: 'Treppenlauf', nb: 'Nachbarschlag', grid: 'Gitterblitz', div: 'Tortenschnitt', rest: 'Restkorb', rund: 'Meilenstein', dopp: 'Spiegelschlag', sadd: 'Turmbau', ssub: 'Auffüller', smul: 'Lawine', teilbar: 'Kornsieb', mauer: 'Steinwall', bruch: 'Halbmond', vorrang: 'Vortritt', zahlwort: 'Ausrufer', kopf: 'Perlenkette', zmul: 'Holzstoß', vergl: 'Waagschale', ueber: 'Fernrohr' };

  const ENEMIES = {
    1: {
      normal: [
        { name: 'Sumpfbrocken', type: 'pflanze', shape: 'sumpfbrocken', hp: 26, atk: 3 },
        { name: 'Regenwicht', type: 'wasser', shape: 'regenwicht', hp: 24, atk: 4 },
        { name: 'Streichholzkopf', type: 'feuer', shape: 'streichholzkopf', hp: 22, atk: 4 },
        { name: 'Krabbelstein', type: 'normal', shape: 'krabbelstein', hp: 30, atk: 3 },
      ],
      elite: { name: 'Dornenigel', type: 'pflanze', shape: 'dornenigel', hp: 45, atk: 5 },
      boss: { name: 'Moorschlund', acc: 'den Moorschlund', type: 'wasser', shape: 'moorschlund', hp: 70, atk: 6, boss: true },
    },
    2: {
      normal: [
        { name: 'Lavamolch', type: 'feuer', shape: 'lavamolch', hp: 42, atk: 5 },
        { name: 'Nebelqualle', type: 'wasser', shape: 'nebelqualle', hp: 40, atk: 6 },
        { name: 'Ranklerin', type: 'pflanze', shape: 'ranklerin', hp: 44, atk: 5 },
        { name: 'Nachtschwinge', type: 'normal', shape: 'nachtschwinge', hp: 38, atk: 6 },
      ],
      elite: { name: 'Glaspanzer', type: 'normal', shape: 'glaspanzer', hp: 70, atk: 8 },
      boss: { name: 'Ofenwurm', acc: 'den Ofenwurm', type: 'feuer', shape: 'ofenwurm', hp: 110, atk: 9, boss: true },
    },
    3: {
      normal: [
        { name: 'Frostblitz', type: 'wasser', shape: 'frostblitz', hp: 60, atk: 8 },
        { name: 'Dschungelbrüller', type: 'pflanze', shape: 'dschungelbrueller', hp: 65, atk: 8 },
        { name: 'Magmagolem', type: 'feuer', shape: 'magmagolem', hp: 70, atk: 7 },
        { name: 'Schattenwolf', type: 'normal', shape: 'schattenwolf', hp: 55, atk: 9 },
      ],
      elite: { name: 'Sturmreiter', type: 'normal', shape: 'sturmreiter', hp: 100, atk: 11 },
      boss: { name: 'Rechenkönig', acc: 'den Rechenkönig', type: 'normal', shape: 'rechenkoenig', hp: 170, atk: 12, boss: true },
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

  // market prices in cents
  const PRICES = { trank: 120, beere: 60, schild: 205, keks: 85, lupe: 150, engel: 300 };
  // Kreisel parts: each changes one number (tip: Wucht, ring: Panzer, disc: Schwung). The first of each row is the starter part,
  // the others are owned['top-<slot>-<id>']: bought (price), found in a chest of that world (chest), or from the first ore (mine).
  const TOP_PARTS = {
    tip: [{ id: 'stahl', name: 'Stahlspitze', val: 5 }, { id: 'gummi', name: 'Gummispitze', val: 6, price: 8 }, { id: 'kugel', name: 'Kugelspitze', val: 7, chest: 3 }],
    ring: [{ id: 'zahn', name: 'Zahnring', val: 1 }, { id: 'welle', name: 'Wellenring', val: 2, price: 12 }, { id: 'flamme', name: 'Flammenring', val: 3, chest: 2 }],
    disc: [{ id: 'leicht', name: 'Leichte Scheibe', val: 20 }, { id: 'schwer', name: 'Schwere Scheibe', val: 24, price: 10 }, { id: 'eisen', name: 'Eisenscheibe', val: 28, mine: true }],
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
    { title: 'Die Spardose', text: 'Einem Jungen ist die Spardose heruntergefallen. Die Münzen liegen im Gras. Zähl mit ihm, wie viel Geld es ist, dann gibt er dir 50 ct Finderlohn.', opts: [{ label: 'Geld zählen', task: 'geld', win: { coins: 50 }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Der Fährmann', text: 'Am Fluss wartet ein Fährmann. Die Fahrt kostet 40 ct. Ohne Fähre musst du durchs kalte Wasser waten.', opts: [{ label: 'Fahrt bezahlen (40 ct)', effect: { coins: -40 } }, { label: 'Durchs Wasser (−6 LP)', effect: { hp: -6 } }] },
    { title: 'Die Backstube', text: 'Der Bäcker verteilt frische Brötchen auf seine Körbe: die Hälfte in den großen, ein Viertel in den kleinen. Rechnest du ihm einen Bruchteil aus, gibt er dir Beeren für unterwegs.', opts: [{ label: 'Bruchteil rechnen', task: 'bruch', win: { item: 'beere', xp: 10 }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Der Holzplatz', text: 'Eine Försterin stapelt Holzscheite in gleich langen Reihen. Wer ausrechnet, wie viele es sind, darf zwei Scheite für die Werkbank mitnehmen.', opts: [{ label: 'Scheite zählen', task: 'mul', win: { holz: 2 }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
  ];

  /* ---------- Calendar weeks ---------- */
  // ISO 8601: weeks start on Monday, week 1 holds the year's first Thursday. Keys look like "2026-W46".
  function isoWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const y = d.getUTCFullYear(); const w = Math.ceil(((d - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
    return y + '-W' + String(w).padStart(2, '0');
  }
  // school year on the stamp card: ISO week 36 to week 30 of the next year; in the summer gap the year that just ended
  function schoolWeeks(date) {
    const [y, w] = isoWeek(date).split('-W').map(Number); const start = w >= 36 ? y : y - 1;
    const jan4 = new Date(start, 0, 4); const d = new Date(start, 0, 4 - ((jan4.getDay() || 7) - 1) + 35 * 7);
    const out = []; const end = (start + 1) + '-W30';
    for (let k = isoWeek(d); ; d.setDate(d.getDate() + 7), k = isoWeek(d)) { out.push(k); if (k === end) return out; }
  }

  // mulberry32 over an FNV hash of the key: the same week key gives the same weekly goals on every device
  function seeded(key) {
    let a = 2166136261; for (const c of String(key)) a = Math.imul(a ^ c.charCodeAt(0), 16777619);
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* ---------- Map ----------
     Node: { t: type, c: lane 0–3, n: [indexes on the next floor] }.
     Rules (for the usual 8 floors): floor 1 fights, no elite before floor 3, rest only on floors 4–5 and as the camp
     before the boss (floor 7), rest/elite/event/treasure never twice in a row on a path, two treasures per map –
     preferably right behind an elite. Shorter maps lose floors in the middle. */
  const LANES = 4, FLOORS = 8;
  function makeMap(F = FLOORS) {
    const used = Array.from({ length: F - 1 }, () => new Set());
    const edges = Array.from({ length: F - 1 }, () => Array.from({ length: LANES }, () => new Set()));
    const crosses = (f, c, n) => { for (let c2 = 0; c2 < LANES; c2++) { if (c2 === c) continue; for (const n2 of edges[f][c2]) if ((c2 < c && n2 > n) || (c2 > c && n2 < n)) return true; } return false; };
    for (let p = 0; p < 4; p++) {
      let c = p === 0 ? rnd(0, 1) : p === 1 ? rnd(2, 3) : rnd(0, LANES - 1);
      used[0].add(c);
      for (let f = 0; f < F - 2; f++) {
        let n = c, tries = 0;
        do { n = Math.max(0, Math.min(LANES - 1, c + rnd(-1, 1))); tries++; } while (crosses(f, c, n) && tries < 20);
        if (crosses(f, c, n)) n = c;
        edges[f][c].add(n); used[f + 1].add(n); c = n;
      }
    }
    const lanes = used.map((s) => [...s].sort((a, b) => a - b));
    const type = lanes.map(() => ({}));
    const parents = (f, c) => (f === 0 ? [] : lanes[f - 1].filter((p) => edges[f - 1][p].has(c)));
    const children = (f, c) => (f >= F - 2 ? [] : [...edges[f][c]]);
    for (const c of lanes[0]) type[0][c] = 'fight';
    for (const c of lanes[F - 2]) type[F - 2][c] = 'rest';
    const WEIGHT = { fight: 46, event: 16, elite: 16, rest: 8 };
    for (let f = 1; f < F - 2; f++) for (const c of lanes[f]) {
      const ps = parents(f, c).map((p) => type[f - 1][p]);
      const sib = new Set(); for (const p of parents(f, c)) for (const s of edges[f - 1][p]) if (s !== c && type[f][s]) sib.add(type[f][s]);
      const bag = [];
      for (const [k, w] of Object.entries(WEIGHT)) {
        if (k === 'elite' && f < 2) continue;
        if (k === 'rest' && (f < 3 || f > F - 4)) continue;
        if (k !== 'fight' && ps.includes(k)) continue;
        const n = Math.round(w * (sib.has(k) && k !== 'fight' ? 0.3 : 1)); for (let i = 0; i < n; i++) bag.push(k);
      }
      type[f][c] = pick(bag);
    }
    // two treasures on floors 4–6 (of 8), behind an elite where possible
    const cand = [];
    for (let f = Math.max(2, F - 5); f <= F - 3; f++) for (const c of lanes[f]) if (type[f][c] === 'fight' || type[f][c] === 'event') cand.push({ f, c, lure: parents(f, c).some((p) => type[f - 1][p] === 'elite') ? 1 : 0, r: Math.random() });
    cand.sort((a, b) => b.lure - a.lure || a.r - b.r);
    let placed = 0;
    for (const x of cand) {
      if (placed >= 2) break;
      if (parents(x.f, x.c).some((p) => type[x.f - 1][p] === 'treasure') || children(x.f, x.c).some((n) => type[x.f + 1][n] === 'treasure')) continue;
      type[x.f][x.c] = 'treasure'; placed++;
    }
    const map = lanes.map((cs, f) => cs.map((c) => ({ t: type[f][c], c, n: f < F - 2 ? [...edges[f][c]].sort((a, b) => a - b).map((n) => lanes[f + 1].indexOf(n)) : [0] })));
    map.push([{ t: 'boss', c: 1.5, n: [] }]);
    return map;
  }

  /* ---------- Die Baustelle (Raum und Form) ----------
     Task pictures are built here as SVG strings, so the tests can check them without a browser. */
  const BAU_MODULES = {
    wz: { name: 'Würfel zählen', icon: '🧊', maxTier: 2, worldCap: [1, 2], dmg: 12 },
    fq: { name: 'Quader ergänzen', icon: '📦', maxTier: 2, worldCap: [1, 2], dmg: 14 },
    netz: { name: 'Würfel- und Quadernetze', icon: '🎲', maxTier: 2, worldCap: [1, 2], dmg: 16 },
    koerper: { name: 'Körper erkennen', icon: '🔺', maxTier: 1, worldCap: [1, 1], dmg: 10 },
    band: { name: 'Bandornamente', icon: '🔁', maxTier: 2, worldCap: [1, 2], dmg: 12 },
    lage: { name: 'Parallel oder senkrecht', icon: '📐', maxTier: 1, worldCap: [1, 1], dmg: 10 },
    umfang: { name: 'Umfang', icon: '📏', maxTier: 2, worldCap: [1, 2], dmg: 14 },
    flaeche: { name: 'Flächeninhalt', icon: '🟨', maxTier: 2, worldCap: [1, 2], dmg: 14 },
    spiegel: { name: 'Achsensymmetrie', icon: '🦋', maxTier: 2, worldCap: [1, 2], dmg: 12 },
    bewegung: { name: 'Spiegeln, drehen, schieben', icon: '🔄', maxTier: 1, worldCap: [1, 1], dmg: 12 },
    vieleck: { name: 'Dreiecke und Vierecke', icon: '🔷', maxTier: 2, worldCap: [1, 2], dmg: 12 },
    ansicht: { name: 'Ansichten', icon: '🧱', maxTier: 2, worldCap: [1, 2], dmg: 14 },
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

  // a view is a list of rows from top to bottom, '#' = square. Seen from the right, the front row is on the left.
  const colView = (hs) => { const H = Math.max(...hs); return Array.from({ length: H }, (_, i) => hs.map((h) => (h >= H - i ? '#' : '.')).join('')); };
  const sideHs = { vorn: (plan) => plan[0].map((_, c) => Math.max(...plan.map((row) => row[c]))), rechts: (plan) => plan.map((row) => Math.max(...row)).reverse() };
  const VIEWS = { vorn: (plan) => colView(sideHs.vorn(plan)), rechts: (plan) => colView(sideHs.rechts(plan)), oben: (plan) => plan.map((row) => row.map((n) => (n ? '#' : '.')).join('')) };
  const trimView = (rows) => {
    const cols = rows[0].length, used = (c) => rows.some((r) => r[c] === '#'); let c0 = 0, c1 = cols - 1; while (!used(c0)) c0++; while (!used(c1)) c1--;
    return rows.filter((r) => r.includes('#')).map((r) => r.slice(c0, c1 + 1));
  };
  function viewSVG(rows, W, H) {
    const S = 14, ox = (W - rows[0].length) * S / 2, oy = (H - rows.length) * S;
    return svgFig(-2, -2, W * S + 4, H * S + 4, rows.flatMap((row, r) => [...row].map((ch, c) => (ch === '#' ? `<rect x="${ox + c * S}" y="${oy + r * S}" width="${S}" height="${S}" fill="${BRICK[0]}" ${LINE}/>` : ''))).join(''), 'Ansicht aus Quadraten');
  }
  function genAnsicht(t) {
    const side = t === 1 ? pick(['vorn', 'oben']) : pick(['vorn', 'oben', 'rechts']); let plan;
    do { const [rows, cols] = t === 1 ? pick([[2, 2], [2, 3]]) : pick([[2, 3], [3, 3], [3, 2]]); plan = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(0, 3))); }
    while (plan.flat().filter((n) => !n).length > t || plan.some((row) => row.every((n) => !n)) || plan[0].some((_, c) => plan.every((row) => !row[c])));
    const right = trimView(VIEWS[side](plan)), mirror = (v) => v.map((r) => [...r].reverse().join(''));
    const others = shuffle(Object.keys(VIEWS).filter((k) => k !== side).map((k) => VIEWS[k](plan)).concat([mirror(VIEWS[side](plan))], side === 'oben' ? [VIEWS.oben(plan).slice().reverse()] : []));
    // fallback: one column a square higher or lower, or one square of the top view added or taken away
    const near = shuffle(side === 'oben' ? plan.flatMap((row, r) => row.map((_, c) => VIEWS.oben(plan.map((x, i) => x.map((n, j) => (i === r && j === c ? (n ? 0 : 1) : n)))))).filter((v) => v.join('').includes('#'))
      : sideHs[side](plan).flatMap((h, i, hs) => [h - 1, h + 1].filter((x) => x >= 1 && x <= 4).map((x) => colView(hs.map((y, j) => (j === i ? x : y))))));
    const views = [right], keys = new Set([right.join('|')]);
    for (const v of others.concat(near).map(trimView)) if (views.length < 3 && !keys.has(v.join('|'))) { keys.add(v.join('|')); views.push(v); }
    const W = Math.max(...views.map((v) => v[0].length)), H = Math.max(...views.map((v) => v.length)), order = shuffle([0, 1, 2]);
    const options = order.map((i) => viewSVG(views[i], W, H));
    return { kind: 'choice', q: `Welches Bild zeigt das Gebäude von ${side}?`, pic: figPair(plan), options, answer: options[order.indexOf(0)], views: order.map((i) => views[i]), plan, side, svgOpts: true, why: `So sieht das Gebäude von ${side} aus:`, sig: side + JSON.stringify(plan) };
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
  // fn(cell, frame, parent cell) is called in the order the squares are reached
  function fold(cells, fn) {
    const key = ([r, c]) => r + ',' + c, has = new Set(cells.map(key)), neg = (a) => a.map((x) => -x);
    const frames = new Map([[key(cells[0]), { n: [0, 0, -1], u: [1, 0, 0], v: [0, 1, 0] }]]); const queue = [cells[0]];
    const roll = [[0, 1, (f) => ({ n: f.u, u: neg(f.n), v: f.v })], [0, -1, (f) => ({ n: neg(f.u), u: f.n, v: f.v })], [1, 0, (f) => ({ n: f.v, u: f.u, v: neg(f.n) })], [-1, 0, (f) => ({ n: neg(f.v), u: f.u, v: f.n })]];
    if (fn) fn(cells[0], frames.get(key(cells[0])), null);
    while (queue.length) { const [r, c] = queue.shift(); const f = frames.get(key([r, c]));
      for (const [dr, dc, g] of roll) { const p = [r + dr, c + dc], k = key(p); if (has.has(k) && !frames.has(k)) { frames.set(k, g(f)); queue.push(p); if (fn) fn(p, frames.get(k), [r, c]); } } }
    return frames;
  }
  function cubeNet(cells) {
    if (cells.length !== 6) return false;
    const frames = fold(cells);
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
  // Quadernetz: the squares of a cube net become rectangles; each face lies along two edges of the Quader (L = length per axis)
  const axisOf = (v) => v.findIndex((x) => x !== 0);
  const noBlock = (cells) => !cells.some(([r, c]) => [[r, c + 1], [r + 1, c], [r + 1, c + 1]].every((p) => cells.some((q) => q.join() === p.join())));
  const normRects = (rs) => { const x0 = Math.min(...rs.map((r) => r[0])), y0 = Math.min(...rs.map((r) => r[1])); return rs.map(([x, y, w, h]) => [x - x0, y - y0, w, h]); };
  function boxRects(cells, L) {
    const rect = new Map(), key = (p) => p.join();
    fold(cells, (p, f, from) => { const w = L[axisOf(f.u)], h = L[axisOf(f.v)];
      if (!from) { rect.set(key(p), [0, 0, w, h]); return; }
      const [x, y, pw, ph] = rect.get(key(from)), dr = p[0] - from[0], dc = p[1] - from[1];
      rect.set(key(p), [dc > 0 ? x + pw : dc < 0 ? x - w : x, dr > 0 ? y + ph : dr < 0 ? y - h : y, w, h]); });
    return normRects(cells.map((p) => rect.get(key(p))));
  }
  const overlap = (rs) => rs.some((a, i) => rs.some((b, j) => j > i && a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3]));
  const rectKey = (rs) => JSON.stringify(rs.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]));
  function rectSVG(rs, size) {
    const S = 7, w = Math.max(...rs.map((r) => r[0] + r[2])), h = Math.max(...rs.map((r) => r[1] + r[3])), ox = (size - w) * S / 2, oy = (size - h) * S / 2;
    return svgFig(-2, -2, size * S + 4, size * S + 4, rs.map(([x, y, rw, rh]) => `<rect x="${ox + x * S}" y="${oy + y * S}" width="${rw * S}" height="${rh * S}" fill="#F4C542" ${LINE}/>`).join(''), `Netz aus ${rs.length} Rechtecken`);
  }
  function genQuader() {
    const L = shuffle(pick([[1, 2, 3], [2, 3, 4], [2, 3, 5], [2, 4, 5]])); let cells, good;
    do { cells = normCells(parseNet(pick(NETS)).map(pick(SYM))); good = boxRects(cells, L); } while (overlap(good));
    const nets = [good], keys = new Set([rectKey(good)]);
    while (nets.length < 3) {
      let n;
      // wrong nets: one face missing at an end, or six faces where two land on the same side
      if (nets.length === 1 && Math.random() < 0.5) { const leaves = cells.map((p, i) => i).filter((i) => cells.filter((q) => Math.abs(q[0] - cells[i][0]) + Math.abs(q[1] - cells[i][1]) === 1).length === 1); const i = pick(leaves); n = normRects(good.filter((_, j) => j !== i)); }
      else { const sh = almostNet(); if (!noBlock(sh)) continue; n = boxRects(normCells(sh.map(pick(SYM))), L); if (overlap(n)) continue; }
      if (!keys.has(rectKey(n))) { keys.add(rectKey(n)); nets.push(n); }
    }
    const size = Math.max(...nets.flat().map((r) => Math.max(r[0] + r[2], r[1] + r[3]))); const order = shuffle([0, 1, 2]);
    const options = order.map((i) => rectSVG(nets[i], size));
    return { kind: 'choice', q: 'Welches Netz lässt sich zu einem Quader falten?', options, answer: options[order.indexOf(0)], rects: order.map((i) => nets[i]), svgOpts: true, tall: true, why: 'Dieses Netz lässt sich zu einem Quader falten:', sig: rectKey(good) };
  }
  function genNetz(t) {
    if (t === 2) return genQuader();
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
      wuerfel: () => `<g transform="translate(36 30) scale(1.6)">${boxFaces(0, 0, 0, 1, 1, 1, SOLID_FILL)}</g>`,
      quader: () => `<g transform="translate(23.4 25.6) scale(1.05)">${boxFaces(0, 0, 0, 3, 1, 1.4, SOLID_FILL)}</g>`,
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
  // a connected shape of n squares in rows 0 … R−1 and columns 0 … C−1
  function blob(n, R, C) {
    const cells = [[rnd(0, R - 1), rnd(0, C - 1)]];
    while (cells.length < n) { const [r, c] = pick(cells); const p = pick([[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]); if (p[0] >= 0 && p[0] < R && p[1] >= 0 && p[1] < C && !cells.some((q) => q.join() === p.join())) cells.push(p); }
    return cells;
  }
  // squared paper W × H; shapes: { cells, fill, line } with line = thin lines between the squares stay visible
  const PS = 16;
  function paperSVG(W, H, shapes, extra, label) {
    let grid = ''; for (let i = 0; i <= W; i++) grid += `<path d="M${i * PS} 0 V${H * PS}" stroke="#C9D3E8"/>`; for (let i = 0; i <= H; i++) grid += `<path d="M0 ${i * PS} H${W * PS}" stroke="#C9D3E8"/>`;
    const body = shapes.map((s) => s.cells.map(([r, c]) => `<rect x="${c * PS}" y="${r * PS}" width="${PS}" height="${PS}" fill="${s.fill || '#FFE08A'}"${s.line ? ` stroke="${s.line}"` : ''}/>`).join('')
      + edges(s.cells).map(([x1, y1, x2, y2]) => `<path d="M${x1 * PS} ${y1 * PS} L${x2 * PS} ${y2 * PS}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join('')).join('');
    return svgFig(-2, -2, W * PS + 4, H * PS + 4, grid + body + (extra || ''), label);
  }
  const at = (cells, dr, dc) => cells.map(([r, c]) => [r + dr, c + dc]);
  const span = (cells) => [Math.max(...cells.map((p) => p[0])) + 1, Math.max(...cells.map((p) => p[1])) + 1];
  function genUmfang(t) {
    let cells;
    if (t === 1) { const w = rnd(2, 5), h = rnd(1, 3); cells = []; for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) cells.push([r, c]); }
    else do cells = normCells(blob(rnd(5, 7), 5, 6)); while (hasHole(cells));
    const [h, w] = span(cells);
    return task('', [edges(cells).length], { svg: paperSVG(w + 2, h + 2, [{ cells: at(cells, 1, 1) }], '', 'Fläche auf Kästchenpapier'), ask: 'Wie lang ist der Umfang? Zähle die Kästchenseiten am Rand.', cells, sig: JSON.stringify(cells) });
  }

  // Flächeninhalt: whole squares only
  function genFlaeche(t) {
    if (t === 1) {
      const area = normCells(blob(rnd(5, 12), 4, 6)); const [h, w] = span(area);
      return task('', [area.length], { svg: paperSVG(w + 2, h + 2, [{ cells: at(area, 1, 1), line: '#C9A227' }], '', 'Fläche auf Kästchenpapier'), ask: 'Wie groß ist der Flächeninhalt? Zähle die Kästchen.', area, sig: JSON.stringify(area) });
    }
    // about a third have the same area in a different shape
    const n = rnd(6, 11), same = Math.random() < 0.35; const a = normCells(blob(n, 4, 4)); let b;
    do b = normCells(blob(same ? n : n + pick([-2, -1, 1, 2]), 4, 4)); while (shapeKey(b) === shapeKey(a));
    const [ha, wa] = span(a), [hb, wb] = span(b), H = Math.max(ha, hb) + 2, W = wa + wb + 5;
    const name = (txt, c, w) => `<text x="${(c + w / 2) * PS}" y="${PS * 0.78}" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}">${txt}</text>`;
    const pic = paperSVG(W, H, [{ cells: at(a, 1, 1), line: '#C9A227' }, { cells: at(b, 1, wa + 3), fill: '#9ED0FF', line: '#5B8DC9' }], name('A', 1, wa) + name('B', wa + 3, wb), 'zwei Flächen A und B');
    const options = ['Figur A', 'Figur B', 'Beide gleich groß'];
    return { kind: 'choice', q: 'Welche Figur hat den größeren Flächeninhalt?', pic, options, answer: a.length === b.length ? options[2] : a.length > b.length ? options[0] : options[1], figs: [a, b], cols: 1, why: `Figur A hat ${a.length} Kästchen, Figur B hat ${b.length} Kästchen.`, sig: shapeKey(a) + shapeKey(b) };
  }

  // Achsensymmetrie: a half of k columns next to a vertical axis; srt gives a position-exact key
  const srt = (cells) => JSON.stringify(cells.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]));
  const mirrorAt = (cells, k) => cells.map(([r, c]) => [r, 2 * k - 1 - c]);
  const AXIS = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#C0392B" stroke-width="2.5" stroke-dasharray="6 4"/>`;
  function half(R, k) { let L; do L = blob(rnd(3, 6), R, k); while (!L.some((p) => p[1] === k - 1)); return L; }
  // one square moved to another free place next to the shape
  function nudge(cells, R, k) {
    for (;;) { const i = rnd(0, cells.length - 1); const rest = cells.filter((_, j) => j !== i); if (!connected(rest)) continue;
      const free = []; for (const [r, c] of rest) for (const p of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) if (p[0] >= 0 && p[0] < R && p[1] >= 0 && p[1] < k && !cells.some((q) => q.join() === p.join())) free.push(p);
      if (free.length) return rest.concat([pick(free)]); }
  }
  function genSpiegel(t) {
    const R = 4, k = 3;
    if (t === 1) {
      let L, shape, sym;
      do { L = half(R, k); sym = Math.random() < 0.5; const other = sym ? L : nudge(L, R, k); shape = L.concat(mirrorAt(other, k)); }
      while (!connected(shape) || (!sym && srt(shape) === srt(mirrorAt(shape, k))));
      // turned on its side half of the time: the axis is then horizontal
      const flat = Math.random() < 0.5; const cells = flat ? shape.map(([r, c]) => [c, r]) : shape;
      const [H, W] = flat ? [2 * k + 2, R + 2] : [R + 2, 2 * k + 2];
      const axis = flat ? AXIS(0, (k + 1) * PS, W * PS, (k + 1) * PS) : AXIS((k + 1) * PS, 0, (k + 1) * PS, H * PS);
      return { kind: 'choice', q: 'Ist die Figur achsensymmetrisch zur gestrichelten Linie?', pic: paperSVG(W, H, [{ cells: at(cells, 1, 1) }], axis, 'Figur mit Spiegelachse'), options: ['ja', 'nein'], answer: sym ? 'ja' : 'nein', shape: cells, k, flat, cols: 2,
        why: sym ? 'Jedes Kästchen hat auf der anderen Seite der Linie ein Spiegelbild.' : 'Klappst du die Figur an der Linie um, passen die beiden Hälften nicht aufeinander.', sig: srt(cells) };
    }
    // complete the mirror image: the right half in its own columns 0 … k−1, next to the axis
    let L, right, opts;
    do {
      L = half(R, k); right = L.map(([r, c]) => [r, k - 1 - c]);
      const cand = [L, right.map(([r, c]) => [R - 1 - r, c]), nudge(right, R, k), nudge(right, R, k), L.map(([r, c]) => [R - 1 - r, c])];
      opts = [right]; for (const x of cand) if (!opts.some((o) => srt(o) === srt(x))) opts.push(x);
    } while (opts.length < 3);
    const halves = shuffle(opts.slice(0, 3)), axisAt = (x) => AXIS(x, 0, x, (R + 2) * PS);
    const options = halves.map((hf) => paperSVG(k + 1, R + 2, [{ cells: at(hf, 1, 0) }], axisAt(0), 'rechte Hälfte'));
    const answer = options[halves.indexOf(right)];
    const pic = paperSVG(2 * k + 2, R + 2, [{ cells: at(L, 1, 1) }], axisAt((k + 1) * PS) + `<text x="${(k + 2.5) * PS}" y="${(R / 2 + 1.4) * PS}" text-anchor="middle" font-size="24" font-weight="700" fill="${INK}">?</text>`, 'linke Hälfte mit Spiegelachse');
    return { kind: 'choice', q: 'Welches Bild ergänzt die Figur zu einer achsensymmetrischen Figur?', pic, options, answer, left: L, halves, svgOpts: true, why: 'So sieht das Spiegelbild aus:', sig: srt(L) };
  }

  // gespiegelt, gedreht oder verschoben: the shape has no symmetry, so the three cases never look alike
  const TRANSFORMS = { verschoben: [SYM[0]], gedreht: [SYM[1], SYM[2], SYM[3]], gespiegelt: [SYM[4]] };
  function genBewegung() {
    let P; do P = normCells(blob(rnd(4, 5), 3, 3)); while (new Set(SYM.map((f) => JSON.stringify(normCells(P.map(f))))).size < 8);
    const kind = pick(Object.keys(TRANSFORMS)); const Q = normCells(P.map(pick(TRANSFORMS[kind])));
    const [hp, wp] = span(P), [hq, wq] = span(Q), dp = rnd(0, 1), dq = rnd(0, 1), H = Math.max(hp + dp, hq + dq) + 2, W = wp + wq + 5;
    const arrow = `<path d="M${(wp + 1.6) * PS} ${H * PS / 2} H${(wp + 3.4) * PS} m-6 -5 l6 5 l-6 5" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    const pic = paperSVG(W, H, [{ cells: at(P, 1 + dp, 1), fill: '#FF9A8B' }, { cells: at(Q, 1 + dq, wp + 4), fill: '#9ED0FF' }], arrow, 'rote Figur und blaue Figur');
    const options = Object.keys(TRANSFORMS).sort((x, y) => (x < y ? -1 : 1));
    return { kind: 'choice', q: 'Aus der roten Figur wird die blaue. Wurde sie gespiegelt, gedreht oder verschoben?', pic, options, answer: kind, from: P, to: Q, cols: 1,
      why: { verschoben: 'Die Figur liegt genauso da, nur an einer anderen Stelle.', gedreht: 'Die Figur wurde um eine Ecke gedreht, nicht umgeklappt.', gespiegelt: 'Die Figur wurde umgeklappt wie im Spiegel.' }[kind], sig: kind + JSON.stringify(P) };
  }

  // Dreiecke und Vierecke: corners on the grid points, x to the right, y down
  const SHAPES = ['Quadrat', 'Rechteck', 'Parallelogramm', 'Dreieck mit rechtem Winkel', 'Dreieck ohne rechten Winkel', 'Viereck ohne parallele Seiten'];
  // names that are true for a shape (a square is also a rectangle and a parallelogram)
  const TRUE_FOR = { Quadrat: ['Quadrat', 'Rechteck', 'Parallelogramm'], Rechteck: ['Rechteck', 'Parallelogramm'] };
  const cross = ([ax, ay], [bx, by]) => ax * by - ay * bx, vec = (p, q) => [q[0] - p[0], q[1] - p[1]];
  const sides = (pts) => pts.map((p, i) => vec(p, pts[(i + 1) % pts.length]));
  const convexOk = (pts) => { const s = sides(pts).map((v, i, a) => cross(v, a[(i + 1) % a.length])); return s.every((x) => x > 0) || s.every((x) => x < 0); };
  const rightAngles = (pts) => sides(pts).filter((v, i, a) => { const w = a[(i + 1) % a.length]; return v[0] * w[0] + v[1] * w[1] === 0; }).length;
  function polyPoints(id) {
    let pts;
    if (id === 'Quadrat') { const s = rnd(2, 4); pts = [[0, 0], [s, 0], [s, s], [0, s]]; }
    else if (id === 'Rechteck') { let w, h; do { w = rnd(2, 6); h = rnd(1, 4); } while (w === h); pts = [[0, 0], [w, 0], [w, h], [0, h]]; }
    else if (id === 'Parallelogramm') { const w = rnd(3, 4), h = rnd(2, 3), s = rnd(1, 2); pts = [[s, 0], [s + w, 0], [w, h], [0, h]]; }
    else if (id === 'Dreieck mit rechtem Winkel') { const a = rnd(2, 5), b = rnd(2, 4); pts = [[0, 0], [0, b], [a, b]]; }
    else if (id === 'Dreieck ohne rechten Winkel') do pts = [[rnd(0, 5), 0], [5, rnd(2, 4)], [0, rnd(3, 4)]]; while (!convexOk(pts) || rightAngles(pts) || Math.abs(cross(...sides(pts).slice(0, 2))) < 8);
    else do pts = [[rnd(1, 3), 0], [5, rnd(1, 3)], [rnd(2, 4), rnd(4, 5)], [0, rnd(2, 4)]]; while (!convexOk(pts) || sides(pts).some((v, i, a) => cross(v, a[(i + 2) % 4]) === 0));
    // turned by a quarter turn now and then
    for (let i = rnd(0, 3); i > 0; i--) pts = pts.map(([x, y]) => [-y, x]);
    const x0 = Math.min(...pts.map((p) => p[0])), y0 = Math.min(...pts.map((p) => p[1]));
    return pts.map(([x, y]) => [x - x0, y - y0]);
  }
  function polySVG(pts) {
    const W = Math.max(...pts.map((p) => p[0])) + 2, H = Math.max(...pts.map((p) => p[1])) + 2;
    let grid = ''; for (let i = 0; i <= W; i++) grid += `<path d="M${i * PS} 0 V${H * PS}" stroke="#C9D3E8"/>`; for (let i = 0; i <= H; i++) grid += `<path d="M0 ${i * PS} H${W * PS}" stroke="#C9D3E8"/>`;
    return svgFig(-2, -2, W * PS + 4, H * PS + 4, `${grid}<polygon points="${pts.map(([x, y]) => `${(x + 1) * PS},${(y + 1) * PS}`).join(' ')}" fill="#B5E48C" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`, 'Figur auf Kästchenpapier');
  }
  // tier 2: properties; each question lists the names that make it true
  const PROPS = [
    ['Welche Figur hat zwei Paar parallele Seiten?', ['Quadrat', 'Rechteck', 'Parallelogramm']],
    ['Welche Figur hat vier rechte Winkel und vier gleich lange Seiten?', ['Quadrat']],
    ['Welche Figur hat vier rechte Winkel, aber nicht vier gleich lange Seiten?', ['Rechteck']],
    ['Welche Figur hat zwei Paar parallele Seiten, aber keinen rechten Winkel?', ['Parallelogramm']],
    ['Welche Figur hat genau einen rechten Winkel?', ['Dreieck mit rechtem Winkel']],
    ['Welche Figur hat drei Ecken und keinen rechten Winkel?', ['Dreieck ohne rechten Winkel']],
  ];
  // quiz pool per question: names that are clearly false for it (a general Viereck may have one right angle)
  const PROP_FALSE = (q, yes) => SHAPES.filter((s) => !yes.includes(s) && !(q.includes('genau einen rechten') && s.startsWith('Viereck')));
  const COUNTS = [
    ['rechte Winkel', { Quadrat: 4, Rechteck: 4, Parallelogramm: 0, 'Dreieck mit rechtem Winkel': 1, 'Dreieck ohne rechten Winkel': 0 }, ['0', '1', '2', '4']],
    ['Paare paralleler Seiten', { Quadrat: 2, Rechteck: 2, Parallelogramm: 2, 'Dreieck mit rechtem Winkel': 0, 'Dreieck ohne rechten Winkel': 0 }, ['0', '1', '2']],
  ];
  function genVieleck(t) {
    if (t === 1) {
      const id = pick(SHAPES), yes = TRUE_FOR[id] || [id]; const tri = id.startsWith('Dreieck');
      const no = shuffle(SHAPES.filter((s) => !yes.includes(s))).sort((a, b) => (a.startsWith('Dreieck') === tri ? 0 : 1) - (b.startsWith('Dreieck') === tri ? 0 : 1));
      const pts = polyPoints(id);
      return { kind: 'choice', q: 'Wie heißt diese Figur?', pic: polySVG(pts), options: shuffle([id, no[0], pick(no.slice(1, 3))]), answer: id, shape: id, pts, cols: 1,
        why: { Quadrat: 'Vier gleich lange Seiten und vier rechte Winkel.', Rechteck: 'Vier rechte Winkel, aber nicht alle Seiten gleich lang.', Parallelogramm: 'Gegenüberliegende Seiten sind parallel. Dieses hat keinen rechten Winkel – hätte es welche, wäre es ein Rechteck.', 'Dreieck mit rechtem Winkel': 'Drei Ecken, eine davon ist ein rechter Winkel.', 'Dreieck ohne rechten Winkel': 'Drei Ecken, keine davon ist ein rechter Winkel.', 'Viereck ohne parallele Seiten': 'Vier Ecken, aber keine zwei Seiten sind parallel.' }[id], sig: 'n' + id + JSON.stringify(pts) };
    }
    if (Math.random() < 0.5) {
      const [q, yes] = pick(PROPS); const right = pick(yes);
      return { kind: 'choice', q, options: shuffle([right].concat(shuffle(PROP_FALSE(q, yes)).slice(0, 2))), answer: right, yes, cols: 1, sig: q };
    }
    const [what, val, opts] = pick(COUNTS); const id = pick(Object.keys(val)); const right = String(val[id]);
    return { kind: 'choice', q: `Wie viele ${what} hat dieses ${id}?`, pic: polySVG(polyPoints(id)), options: [right].concat(shuffle(opts.filter((o) => o !== right)).slice(0, 2)).sort(), answer: right, shape: id, cols: 1, sig: what + id };
  }

  function bauGenerate(mod, tier) {
    tier = Math.max(1, Math.min(BAU_MODULES[mod].maxTier, tier));
    const tk = { wz: genWz, fq: genFq, netz: genNetz, koerper: genKoerper, band: genBand, lage: genLage, umfang: genUmfang, flaeche: genFlaeche, spiegel: genSpiegel, bewegung: genBewegung, vieleck: genVieleck, ansicht: genAnsicht }[mod](tier);
    if (!tk.kind) tk.kind = 'num';
    if (tk.pic) tk.pic = `<div class="figure">${tk.pic}</div>`;
    // one tutorial per task type, a second one where a tier brings something new
    return Object.assign(tk, { mod, tier, group: BAU_TUT[mod + ':' + tier] ? mod + ':' + tier : mod + ':1' });
  }
  const BAU_TUT = {
    'wz:1': { title: 'Würfel zählen', steps: ['Der Bauplan zeigt das Gebäude von oben. Die Zahl in einem Feld sagt, wie viele Würfel dort übereinander stehen.', 'Bauplan mit 2, 1, 3 und 1: Rechne 2 + 1 + 3 + 1.', 'Das Gebäude hat 7 Würfel.'] },
    'fq:1': { title: 'Quader ergänzen', steps: ['Im vollen Quader stehen in jedem Feld gleich viele Würfel übereinander. Die gestrichelte Linie zeigt ihn.', 'Quader 2 lang, 2 breit, 3 hoch. Bauplan 3, 1, 2, 3: Es fehlen 0 + 2 + 1 + 0 Würfel.', 'Es fehlen 3 Würfel.'] },
    'netz:1': { title: 'Würfelnetze', steps: ['Ein Würfelnetz hat 6 Quadrate. Beim Falten wird jedes Quadrat eine Seite des Würfels. Keine zwei dürfen auf derselben Seite landen.', 'Eine Reihe aus 4 Quadraten mit einem Quadrat oben und einem unten lässt sich immer falten.', 'Eine Reihe aus 5 Quadraten lässt sich nie falten: Das erste und das fünfte Quadrat landen aufeinander.'] },
    'koerper:1': { title: 'Körper erkennen', steps: ['Würfel: 6 gleich große Quadrate als Flächen. Quader: auch 6 Flächen, aber nicht alle gleich groß.', 'Kugel: rund, ohne Ecken und Kanten. Zylinder: oben und unten ein Kreis.', 'Kegel: unten ein Kreis, oben eine Spitze. Pyramide: unten ein Viereck, oben eine Spitze.'] },
    'band:1': { title: 'Bandornamente', steps: ['Ein Bandornament ist ein Muster, das sich immer wiederholt.', 'Suche das Stück, das sich wiederholt: ▲ ● ● ▲ ● ● ▲ … Das Stück ist ▲ ● ●.', 'Nach dem letzten ▲ kommen ● ●. Also geht es mit ● ● weiter.'] },
    'lage:1': { title: 'Parallel oder senkrecht', steps: ['Parallel: Die Linien sind überall gleich weit voneinander entfernt und treffen sich nie.', 'Senkrecht: Die Linien treffen sich in einem rechten Winkel. Prüfe ihn mit der Ecke eines Blatts Papier.', 'Beispiel Tür: Die linke und die rechte Kante sind parallel. Die obere und die linke Kante stehen senkrecht zueinander.', 'Treffen sich die Linien schräg, dann ist es weder noch.'] },
    'netz:2': { title: 'Quadernetze', steps: ['Ein Quader hat 6 Rechtecke als Flächen. Je zwei gegenüberliegende sind gleich groß.', 'Ein Quadernetz hat also 6 Rechtecke, immer 3 Paare gleich große. Fehlt eins, kann der Quader nicht zugehen.', 'Wo zwei Rechtecke aneinanderstoßen, müssen die Kanten gleich lang sein. Beim Falten wird daraus eine Kante des Quaders.', 'Die Rechtecke liegen wie bei einem Würfelnetz: Eine Reihe aus 4 mit einem Rechteck oben und einem unten lässt sich falten.'] },
    'flaeche:1': { title: 'Flächeninhalt', steps: ['Der Flächeninhalt sagt, wie groß eine Fläche ist. Du zählst, wie viele Kästchen sie bedeckt.', 'Der Umfang ist etwas anderes: der Weg einmal um den Rand herum.', 'Rechteck 4 Kästchen lang und 2 hoch: 4 + 4 = 8 Kästchen. Der Flächeninhalt ist 8 Kästchen, der Umfang 12 Kästchenseiten.'] },
    'flaeche:2': { title: 'Flächen vergleichen', steps: ['Zähle bei beiden Figuren die Kästchen.', 'Figur A hat 7 Kästchen, Figur B hat 8. Figur B hat den größeren Flächeninhalt.', 'Zwei Figuren können ganz verschieden aussehen und trotzdem gleich viele Kästchen haben. Dann sind sie gleich groß.'] },
    'spiegel:1': { title: 'Achsensymmetrie', steps: ['Eine Figur ist achsensymmetrisch, wenn beide Hälften beim Umklappen genau aufeinanderpassen. Die Linie dazwischen heißt Spiegelachse.', 'Prüfe Kästchen für Kästchen: Ein Kästchen 2 Felder links von der Linie braucht ein Kästchen 2 Felder rechts davon, in derselben Reihe.', 'Fehlt auch nur ein Spiegelbild, ist die Figur nicht achsensymmetrisch.'] },
    'spiegel:2': { title: 'Spiegelbild ergänzen', steps: ['Die rechte Hälfte ist das Spiegelbild der linken Hälfte.', 'Was direkt an der Spiegelachse liegt, liegt auch im Spiegelbild direkt an der Achse. Was weit weg ist, bleibt weit weg.', 'Beispiel: Ein Kästchen ganz links in der obersten Reihe kommt im Spiegelbild ganz nach rechts, auch in die oberste Reihe.'] },
    'bewegung:1': { title: 'Spiegeln, drehen, schieben', steps: ['Verschoben: Die Figur liegt genauso da wie vorher, nur an einer anderen Stelle.', 'Gedreht: Die Figur wurde um eine Ecke gedreht, zum Beispiel eine Vierteldrehung. Sie wurde nicht umgeklappt.', 'Gespiegelt: Die Figur wurde umgeklappt. Zeigt bei einem L der Fuß vorher nach rechts und jetzt nach links, ist es gespiegelt.'] },
    'vieleck:1': { title: 'Dreiecke und Vierecke', steps: ['Quadrat: vier gleich lange Seiten und vier rechte Winkel. Rechteck: vier rechte Winkel, gegenüber gleich lange Seiten.', 'Parallelogramm: Gegenüberliegende Seiten sind parallel. Hat es rechte Winkel, ist es ein Rechteck.', 'Dreiecke haben drei Ecken. Beim Dreieck mit rechtem Winkel bilden zwei Seiten eine Ecke wie bei einem Blatt Papier.', 'Beispiel: 3 Kästchen lang, 3 Kästchen hoch, alle Ecken rechte Winkel: Das ist ein Quadrat.'] },
    'vieleck:2': { title: 'Eigenschaften von Vierecken', steps: ['Rechteck und Quadrat haben vier rechte Winkel und zwei Paar parallele Seiten.', 'Ein Parallelogramm hat auch zwei Paar parallele Seiten. Das Parallelogramm im Bild hat keinen rechten Winkel.', 'Ein Dreieck mit rechtem Winkel hat genau 1 rechten Winkel. Ein Dreieck hat nie parallele Seiten.'] },
    'ansicht:1': { title: 'Ansichten', steps: ['Bauplan und Bild zeigen dasselbe Gebäude. Unten im Bauplan ist vorn.', 'Von oben siehst du jedes Feld, auf dem mindestens ein Würfel steht. Von vorn siehst du in jeder Spalte den höchsten Turm.', 'Bauplan 2, 1 hinten und 1, 3 vorn: Von vorn sind die Türme 2 und 3 Würfel hoch.', 'Tippe auf das passende Bild.'] },
    'ansicht:2': { title: 'Ansicht von rechts', steps: ['Jetzt schaust du auch von der rechten Seite auf das Gebäude.', 'Von rechts siehst du in jeder Reihe des Bauplans den höchsten Turm. Die vordere Reihe ist dann links, die hintere rechts.', 'Bauplan hinten 1, 2 und vorn 3, 1: Von rechts siehst du links einen Turm mit 3 Würfeln, rechts einen mit 2.', 'Tippe auf das passende Bild.'] },
    'umfang:1': { title: 'Umfang', steps: ['Der Umfang ist der Weg einmal ganz um die Fläche herum.', 'Zähle jede Kästchenseite am Rand. Starte an einer Ecke und fahre mit dem Finger herum.', 'Rechteck 3 Kästchen lang und 2 hoch: 3 + 2 + 3 + 2 = 10. Der Umfang ist 10 Kästchenseiten.'] },
  };
  const BAU = {
    MODULES: BAU_MODULES, TUT: BAU_TUT, generate: bauGenerate, NETS, parseNet, cubeNet, shapeKey, normCells, edges, hasHole, SOLIDS, LAGE, SYM,
    STARTERS: [{ id: 'biber', type: 'wasser', shape: 'beaver', names: ['Dammbiber', 'Brückenbiber', 'Brückenbiber'], hp: 75, desc: 'Ein Biber mit Bauhelm. Misst jeden Stamm aus, bevor er ihn zersägt.', perk: 'tank',
      attacks: [{ name: 'Ziegelstapel', mod: 'wz' }, { name: 'Bauklotzwurf', mod: 'koerper' }, { name: 'Lotschnur', mod: 'lage' }, { name: 'Zollstock', mod: 'umfang' }] }],
    WORLD_ATTACKS: { 2: [{ name: 'Mauerlücke', mod: 'fq' }, { name: 'Faltkarton', mod: 'netz' }, { name: 'Fliesenband', mod: 'band' }, { name: 'Zollstock', mod: 'umfang' }] },
    EXTRA: { wz: 'Ziegelstapel', fq: 'Mauerlücke', netz: 'Faltkarton', koerper: 'Bauklotzwurf', band: 'Fliesenband', lage: 'Lotschnur', umfang: 'Zollstock', flaeche: 'Bodenplatten', spiegel: 'Fensterflügel', bewegung: 'Drehkran', vieleck: 'Winkeleisen', ansicht: 'Grundriss' },
    ENEMIES: {
      1: {
        normal: [
          { name: 'Mörtelbatzen', type: 'normal', shape: 'moertelbatzen', hp: 24, atk: 3 },
          { name: 'Schweißfunke', type: 'feuer', shape: 'schweissfunke', hp: 22, atk: 4 },
          { name: 'Schotterhaufen', type: 'normal', shape: 'schotterhaufen', hp: 30, atk: 3 },
          { name: 'Pfützenmolch', type: 'wasser', shape: 'pfuetzenmolch', hp: 26, atk: 4 },
        ],
        elite: { name: 'Brennnesselwall', type: 'pflanze', shape: 'brennnesselwall', hp: 45, atk: 5 },
        boss: { name: 'Mischtrommel', acc: 'die Mischtrommel', type: 'normal', shape: 'mischtrommel', hp: 70, atk: 6, boss: true },
      },
      2: {
        normal: [
          { name: 'Kabelnatter', type: 'feuer', shape: 'kabelnatter', hp: 42, atk: 5 },
          { name: 'Staubfahne', type: 'normal', shape: 'staubfahne', hp: 40, atk: 6 },
          { name: 'Dachmarder', type: 'normal', shape: 'fox', hp: 44, atk: 5 },
          { name: 'Efeuranke', type: 'pflanze', shape: 'efeuranke', hp: 38, atk: 6 },
        ],
        elite: { name: 'Rostkäfer', type: 'feuer', shape: 'rostkaefer', hp: 70, atk: 8 },
        boss: { name: 'Abrissbirne', acc: 'die Abrissbirne', type: 'normal', shape: 'abrissbirne', hp: 110, atk: 9, boss: true },
      },
    },
    MOVES: ['Mörtelspritzer', 'Schotterregen', 'Rempler', 'Kabelschlag', 'Funkenregen', 'Rostbiss'],
    EVENTS: [
      { title: 'Der Kran', text: 'Die Kranführerin hat Ziegel gestapelt und will wissen, wie viele es sind. Für die richtige Zahl gibt sie dir einen Trank.', opts: [{ label: 'Würfel zählen', task: 'wz', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Bauzaun', text: 'Am Bauzaun fehlt ein bemaltes Brett. Wer das Muster fortsetzt, bekommt vom Maler einen Schild.', opts: [{ label: 'Muster fortsetzen', task: 'band', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Lieber nicht', effect: {} }] },
      { title: 'Die Kartons', text: 'Ein Lieferwagen bringt flache Kartons. Der Fahrer fragt, welcher sich zu einem Würfel falten lässt.', opts: [{ label: 'Netz aussuchen', task: 'netz', win: { xp: 20 }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Holzkiste', text: 'In der Werkstatt steht eine Kiste mit Holzkörpern. Der Schreiner fragt nach einem Namen und verrät dir dafür eine Eselsbrücke.', opts: [{ label: 'Antworten', task: 'koerper', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Randsteine', text: 'Ein Pflasterer legt Randsteine um einen Platz. Er fragt, wie lang der Rand wird.', opts: [{ label: 'Umfang zählen', task: 'umfang', win: { item: 'grosstrank' }, lose: { hp: -8 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Das Fenster', text: 'Der Glaser setzt ein Fenster mit zwei Flügeln ein. Er will wissen, ob das Muster auf beiden Seiten gleich ist. Für die richtige Antwort gibt er dir einen Schild.', opts: [{ label: 'Muster prüfen', task: 'spiegel', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Mittagspause', text: 'Die Bauleute machen Pause und teilen ihre Brote mit dir.', opts: [{ label: 'Mitessen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
    ],
  };

  return { rnd, pick, shuffle, MODULES, MODULE_KEYS, generate, TUT, TYPES, BEATS, STARTERS, EXTRA_ATTACKS, ENEMIES, ENEMY_MOVES, ITEMS, EVENTS, makeMap, FLOORS, digits, numWord, qsum, isoWeek, schoolWeeks, seeded, euro, COINS, PRICES, TOP_PARTS, BAU };
})();
if (typeof module !== 'undefined') module.exports = MQ;
