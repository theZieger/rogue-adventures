const MJ = (() => {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // Lehrplan Mathematik Klasse 3: Größen und Messen, Daten und Zufall
  const MODULES = {
    uhr: { name: 'Uhrturm', icon: '🕰️', maxTier: 4, worldCap: [2, 4], dmg: 12 },
    laenge: { name: 'Messlatte', icon: '📏', maxTier: 3, worldCap: [2, 3], dmg: 12 },
    masse: { name: 'Waage', icon: '⚖️', maxTier: 3, worldCap: [2, 3], dmg: 12 },
    rad: { name: 'Glücksrad', icon: '🎲', maxTier: 3, worldCap: [2, 3], dmg: 10 },
    los: { name: 'Losbude', icon: '🎟️', maxTier: 2, worldCap: [1, 2], dmg: 14 },
    tafel: { name: 'Schautafel', icon: '📊', maxTier: 2, worldCap: [1, 2], dmg: 12 },
    sach: { name: 'Sachaufgaben', icon: '🎪', maxTier: 3, worldCap: [2, 3], dmg: 16 },
  };

  /* ---------- Units and formats (never a comma number) ---------- */
  const UNIT = { km: 100000, m: 100, cm: 1, kg: 1000, g: 1 };
  // "2 m 35 cm", "½ kg" → cm or g
  const qty = (s) => { let v = 0; s.replace(/(½|\d+) (km|m|cm|kg|g)\b/g, (_, n, u) => { v += n === '½' ? UNIT[u] / 2 : +n * UNIT[u]; }); return v; };
  const two = (v, big, small) => { const a = Math.floor(v / UNIT[big]), b = (v % UNIT[big]) / UNIT[small]; return a && b ? `${a} ${big} ${b} ${small}` : a ? `${a} ${big}` : `${b} ${small}`; };
  // amounts and times never break across lines (non-breaking spaces)
  const euro = (ct) => (typeof MQ !== 'undefined' ? MQ : require('./logic.js')).euro(ct).replace(/ /g, '\u00a0');
  const pad = (m) => String(m).padStart(2, '0');
  const tm = (min) => `${Math.floor(min / 60)}:${pad(min % 60)}\u00a0Uhr`;
  const NAMES = ['Mia', 'Ole', 'Lena', 'Tim', 'Emil', 'Lotta', 'Can', 'Aylin', 'Jonas', 'Paula'];

  /* ---------- Drawings (data attributes let the test bot read them) ---------- */
  const OUT = '#1C2541';
  function clockSVG(h, m) {
    const ha = (h % 12) * 30 + m / 2, ma = m * 6; let marks = '';
    for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, big = i % 5 === 0, r1 = big ? 46 : 50; marks += `<line x1="${(60 + r1 * Math.sin(a)).toFixed(1)}" y1="${(60 - r1 * Math.cos(a)).toFixed(1)}" x2="${(60 + 54 * Math.sin(a)).toFixed(1)}" y2="${(60 - 54 * Math.cos(a)).toFixed(1)}" stroke="${OUT}" stroke-width="${big ? 2.6 : 1}"/>`; }
    for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6; marks += `<text x="${(60 + 37 * Math.sin(a)).toFixed(1)}" y="${(64.5 - 37 * Math.cos(a)).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="${OUT}">${i}</text>`; }
    return `<svg class="jm-fig jm-clock" viewBox="0 0 120 120" role="img" aria-label="Turmuhr mit Zeigern"><circle cx="60" cy="60" r="57" fill="#FFF8E1" stroke="${OUT}" stroke-width="3"/>${marks}
      <g class="hand-h" data-angle="${ha}" transform="rotate(${ha} 60 60)"><line x1="60" y1="66" x2="60" y2="32" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/></g>
      <g class="hand-m" data-angle="${ma}" transform="rotate(${ma} 60 60)"><line x1="60" y1="68" x2="60" y2="11" stroke="#C0392B" stroke-width="3" stroke-linecap="round"/></g><circle cx="60" cy="60" r="4" fill="${OUT}"/></svg>`;
  }
  function rulerSVG(cm, thing) {
    const px = 18, x0 = 16; let marks = '';
    for (let i = 0; i <= 15; i++) marks += `<line x1="${x0 + i * px}" y1="52" x2="${x0 + i * px}" y2="${i % 5 ? 62 : 66}" stroke="${OUT}" stroke-width="1.5"/><text x="${x0 + i * px}" y="78" text-anchor="middle" font-size="10" fill="${OUT}">${i}</text>`;
    const x1 = x0 + cm * px;
    return `<svg class="jm-fig jm-wide" viewBox="0 0 300 86" role="img" aria-label="Lineal mit ${thing}"><rect x="6" y="50" width="288" height="32" rx="4" fill="#F7E3A1" stroke="${OUT}" stroke-width="2"/>${marks}
      <rect class="thing" data-x0="${x0}" data-x1="${x1}" data-px="${px}" x="${x0}" y="22" width="${x1 - x0}" height="22" rx="10" fill="#FF8FA3" stroke="${OUT}" stroke-width="2"/><path d="M${x0 + 8} 26 L${x0 + 16} 40 M${x0 + 24} 26 L${x0 + 32} 40" stroke="#fff" stroke-width="3" opacity=".7"/>
      <line x1="${x0}" y1="16" x2="${x0}" y2="52" stroke="${OUT}" stroke-dasharray="3 3"/><line x1="${x1}" y1="16" x2="${x1}" y2="52" stroke="${OUT}" stroke-dasharray="3 3"/></svg>`;
  }
  const WEIGHT_TXT = (g) => (g >= 1000 ? `${g / 1000} kg` : `${g} g`);
  function scaleSVG(weights, thing) {
    const blocks = weights.map((g, i) => { const x = 178 + (i % 2) * 56, y = 62 - Math.floor(i / 2) * 26; return `<g class="weight" data-g="${g}"><rect x="${x}" y="${y}" width="52" height="24" rx="4" fill="#8E9AAF" stroke="${OUT}" stroke-width="2"/><text x="${x + 26}" y="${y + 17}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${WEIGHT_TXT(g)}</text></g>`; }).join('');
    return `<svg class="jm-fig jm-wide" viewBox="0 0 300 140" role="img" aria-label="Waage im Gleichgewicht"><path d="M150 40 L150 122 M118 130 L182 130" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="M40 40 L260 40" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><circle cx="150" cy="40" r="6" fill="#FFC93C" stroke="${OUT}" stroke-width="2"/>
      <path d="M60 40 L30 88 M60 40 L90 88 M232 40 L170 88 M232 40 L294 88" stroke="${OUT}" stroke-width="1.5"/><path d="M14 88 L106 88 L96 98 L24 98 Z M166 88 L298 88 L288 98 L176 98 Z" fill="#C9A227" stroke="${OUT}" stroke-width="2"/>
      <rect x="34" y="54" width="52" height="34" rx="6" fill="#FF8C42" stroke="${OUT}" stroke-width="2"/><text x="60" y="78" text-anchor="middle" font-size="20" font-weight="700" fill="${OUT}">?</text><text x="60" y="118" text-anchor="middle" font-size="12" fill="${OUT}">${thing}</text>${blocks}</svg>`;
  }
  const COLORS = { rot: { name: 'Rot', fill: '#E8453C' }, blau: { name: 'Blau', fill: '#3F7FE0' }, gelb: { name: 'Gelb', fill: '#F5C518' }, gruen: { name: 'Grün', fill: '#3DAA55' } };
  // each colour also gets its own mark, so the wheel works without telling colours apart
  const MARK = { rot: (x, y) => `<circle cx="${x}" cy="${y}" r="5"/>`, blau: (x, y) => `<rect x="${x - 5}" y="${y - 5}" width="10" height="10"/>`, gelb: (x, y) => `<path d="M${x} ${y - 6} L${x + 6} ${y + 5} L${x - 6} ${y + 5} Z"/>`, gruen: (x, y) => `<path d="M${x} ${y - 7} L${x + 6} ${y} L${x} ${y + 7} L${x - 6} ${y} Z"/>` };
  function wheelSVG(sectors) {
    const n = sectors.length, P = (a, r) => [(60 + r * Math.sin(a)).toFixed(1), (64 - r * Math.cos(a)).toFixed(1)];
    const parts = sectors.map((c, i) => { const a0 = i * 2 * Math.PI / n, a1 = (i + 1) * 2 * Math.PI / n, [x0, y0] = P(a0, 52), [x1, y1] = P(a1, 52), [mx, my] = P((a0 + a1) / 2, 34);
      return `<path class="sector" data-color="${c}" d="M60 64 L${x0} ${y0} A52 52 0 0 1 ${x1} ${y1} Z" fill="${COLORS[c].fill}" stroke="${OUT}" stroke-width="2"/><g fill="#fff" stroke="${OUT}" stroke-width="1.5">${MARK[c](+mx, +my)}</g>`; }).join('');
    return `<svg class="jm-fig jm-wheel" viewBox="0 0 120 120" role="img" aria-label="Glücksrad mit ${n} gleich großen Feldern">${parts}<circle cx="60" cy="64" r="6" fill="#FFC93C" stroke="${OUT}" stroke-width="2"/><path d="M52 2 L68 2 L60 18 Z" fill="${OUT}"/></svg>`;
  }
  function chartSVG(title, bars, step, top) {
    const H = 120, y0 = 140, x0 = 36, w = 274 / bars.length, Y = (v) => y0 - (v / top) * H; let grid = '';
    for (let v = 0; v <= top; v += step) grid += `<line x1="${x0}" y1="${Y(v)}" x2="312" y2="${Y(v)}" stroke="${v ? '#B8C2D9' : OUT}" stroke-width="${v ? 1 : 2}"/><text x="${x0 - 5}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="${OUT}">${v}</text>`;
    const cols = ['#3F7FE0', '#E8453C', '#3DAA55', '#F5A623'];
    const rects = bars.map((b, i) => { const x = x0 + i * w + w * 0.2; return `<rect class="jm-bar" data-label="${b.label}" data-value="${b.value}" x="${x.toFixed(1)}" y="${Y(b.value)}" width="${(w * 0.6).toFixed(1)}" height="${y0 - Y(b.value)}" fill="${cols[i]}" stroke="${OUT}" stroke-width="1.5"/><text x="${(x + w * 0.3).toFixed(1)}" y="${y0 + 15}" text-anchor="middle" font-size="11" fill="${OUT}">${b.label}</text>`; }).join('');
    return `<svg class="jm-fig jm-wide" viewBox="0 0 320 162" role="img" aria-label="Säulendiagramm: ${title}"><text x="${x0}" y="11" font-size="12" font-weight="700" fill="${OUT}">${title}</text>${grid}${rects}</svg>`;
  }

  /* ---------- Task builders ---------- */
  // number task: question (and drawing) come as ready HTML in `fig`; answers are typed on the keypad
  const num = (id, q, svg, answers, labels, show) => ({ kind: 'num', text: id + '|' + q + '|' + (svg || '').length + answers.join(), answers, labels, show, maxLen: 4,
    fig: `<div class="jm" data-t="${id}">${svg || ''}<div class="question">${q}</div></div>` });
  const choice = (id, q, svg, options, answer, why, sig) => ({ kind: 'choice', text: id + '|' + q + '|' + (sig || ''), q, options, answer, why, cols: 1, fig: `<div class="jm" data-t="${id}">${svg || ''}</div>` });
  // "2 m 35 cm = ? cm", "235 cm = ? m ? cm"
  function conv(lhs, big, small) {
    const v = qty(lhs);
    if (!small) return num('conv', `${lhs} = ? ${big}`, '', [v / UNIT[big]], [big], `${v / UNIT[big]} ${big}`);
    return num('conv', `${lhs} = ? ${big} ? ${small}`, '', [Math.floor(v / UNIT[big]), (v % UNIT[big]) / UNIT[small]], [big, small], two(v, big, small));
  }
  // "65 cm + ? cm = 1 m"
  function missing(have, unit, whole) { const a = (qty(whole) - qty(have)) / UNIT[unit]; return num('conv', `${have} + ? ${unit} = ${whole}`, '', [a], [unit], `${a} ${unit}`); }
  function compare(id, a, b, adj, same) {
    const [x, y] = shuffle([a, b]); const va = qty(a), vb = qty(b);
    const answer = va === vb ? same : va > vb ? a : b, u = id === 'cmpl' ? 'cm' : 'g';
    return choice(id, `Was ist ${adj}?`, '', [x, y, same], answer, `${a} sind ${va} ${u}, ${b} sind ${vb} ${u}.`);
  }

  /* ---------- Generators ---------- */
  function genUhr(t) {
    if (t <= 3) {
      const h = rnd(1, 12); let m;
      if (t === 1) m = pick([0, 15, 30, 45]); else if (t === 2) m = 5 * rnd(0, 11); else do { m = rnd(1, 59); } while (m % 5 === 0);
      return num('clock', 'Wie spät ist es auf der Turmuhr?', clockSVG(h, m), [h, m], ['Stunden', 'Minuten'], `${h}:${pad(m)} Uhr`);
    }
    const k = rnd(0, 2);
    if (k === 0) {
      const s = 5 * rnd(108, 228), d = 5 * rnd(3, 11);
      return num('span', `Die Fahrt mit ${pick(['dem Riesenrad', 'der Achterbahn', 'dem Kettenflieger', 'der Geisterbahn', 'dem Autoscooter'])} beginnt um ${tm(s)} und endet um ${tm(s + d)}. Wie viele Minuten dauert sie?`, '', [d], ['Minuten'], `${d} Minuten`);
    }
    if (k === 1) {
      const s = 5 * rnd(108, 228); const [d, dt] = pick([[15, 'eine Viertelstunde'], [30, 'eine halbe Stunde'], [45, 'eine Dreiviertelstunde'], ...[2, 3, 4, 5, 7, 8, 10].map((x) => [5 * x, `${5 * x} Minuten`])]); const e = s + d;
      return num('end', `${pick(['Das Puppentheater', 'Das Konzert der Blaskapelle', 'Die Vorstellung im Zirkuszelt'])} beginnt um ${tm(s)} und dauert ${dt}. Wann ist es zu Ende?`, '', [Math.floor(e / 60), e % 60], ['Stunden', 'Minuten'], tm(e));
    }
    const n = rnd(2, 7);
    return num('quarter', `Das Kettenkarussell dreht sich ${n} Viertelstunden lang. Wie viele Minuten sind das?`, '', [15 * n], ['Minuten'], `${15 * n} Minuten`);
  }
  const THINGS = ['Zuckerstange', 'Lakritzschnecke', 'Brezel', 'Lebkuchenstange'];
  function genLaenge(t) {
    if (t === 1) return pick([
      () => conv(`${rnd(1, 9)} m`, 'cm'),
      () => conv(`${100 * rnd(2, 9)} cm`, 'm'),
      () => conv('½ m', 'cm'),
      () => missing(`${5 * rnd(2, 18)} cm`, 'cm', '1 m'),
      () => { const cm = rnd(3, 14), th = pick(THINGS); return num('ruler', `Wie lang ist die ${th}?`, rulerSVG(cm, th), [cm], ['cm'], `${cm} cm`); },
    ])();
    if (t === 2) return pick([
      () => conv(`${rnd(1, 9)} m ${rnd(1, 99)} cm`, 'cm'),
      () => { let v; do { v = rnd(101, 999); } while (v % 100 === 0); return conv(`${v} cm`, 'm', 'cm'); },
      () => { const m = rnd(1, 8), c = rnd(1, 9); const other = pick([m * 100 + c * 10, m * 100 + c, m * 100 - 10 * rnd(1, 5)]); return compare('cmpl', `${m} m ${c} cm`, `${other} cm`, 'länger', 'Beide gleich lang'); },
    ])();
    return pick([
      () => conv(`${rnd(1, 9)} km`, 'm'),
      () => conv(`${1000 * rnd(2, 9)} m`, 'km'),
      () => conv('½ km', 'm'),
      () => conv(`${rnd(1, 8)} km ${50 * rnd(1, 19)} m`, 'm'),
      () => { let v; do { v = 50 * rnd(21, 199); } while (v % 1000 === 0); return conv(`${v} m`, 'km', 'm'); },
      () => missing(`${50 * rnd(1, 19)} m`, 'm', '1 km'),
    ])();
  }
  // estimate from reference weights: first option is right, the others are off by a factor of 10 or more
  const REF = [
    ['eine Packung Mehl', '1 kg', '10 g', '50 kg'], ['ein Apfel', '150 g', '15 kg', '2 g'], ['eine Tafel Schokolade', '100 g', '10 kg', '1 g'],
    ['ein Stück Butter', '250 g', '25 kg', '3 g'], ['ein großer Kürbis', '5 kg', '50 g', '500 kg'], ['ein Fahrrad', '15 kg', '150 g', '1500 kg'],
    ['ein voller Schulranzen', '4 kg', '40 g', '400 kg'], ['ein Luftballon', '5 g', '5 kg', '50 kg'], ['eine große Flasche Wasser', '1 kg', '10 g', '100 kg'],
    ['ein Hühnerei', '60 g', '6 kg', '1 g'], ['ein Pony', '200 kg', '2 kg', '20 g'], ['ein Kind aus der 3. Klasse', '30 kg', '300 g', '300 kg'],
  ];
  const PER = [['Ein Stück Butter', 'Stück Butter', 250], ['Eine Tafel Schokolade', 'Tafeln Schokolade', 100], ['Ein Glas Honig', 'Gläser Honig', 500], ['Ein Apfel', 'Äpfel', 125], ['Ein Beutel Bonbons', 'Beutel Bonbons', 200]];
  const SCALE_THINGS = [['der Kürbis', 'Kürbis'], ['das Paket', 'Paket'], ['der Sack Nüsse', 'Sack Nüsse'], ['das Brot', 'Brot'], ['die Melone', 'Melone']];
  function genMasse(t) {
    if (t === 1) return pick([
      () => { let ws; do { ws = Array.from({ length: rnd(2, 4) }, () => pick([500, 200, 200, 100, 50, 20, 10])).sort((a, b) => b - a); } while (ws.reduce((a, b) => a + b, 0) >= 1000); const s = ws.reduce((a, b) => a + b, 0), th = pick(SCALE_THINGS);
        return num('scale', `Die Waage ist im Gleichgewicht. Wie viel Gramm wiegt ${th[0]}?`, scaleSVG(ws, th[1]), [s], ['g'], `${s} g`); },
      () => conv(`${rnd(1, 9)} kg`, 'g'),
      () => conv(`${1000 * rnd(2, 9)} g`, 'kg'),
      () => conv('½ kg', 'g'),
      () => missing(`${50 * rnd(1, 19)} g`, 'g', '1 kg'),
    ])();
    if (t === 2) return pick([
      () => { const ws = [1000 * rnd(1, 2)].concat(Array.from({ length: rnd(1, 3) }, () => pick([500, 200, 100, 50, 20]))).sort((a, b) => b - a); const s = ws.reduce((a, b) => a + b, 0);
        return num('scale2', 'Die Waage ist im Gleichgewicht. Wie schwer ist das Paket? Schreibe kg und g.', scaleSVG(ws, 'Paket'), [Math.floor(s / 1000), s % 1000], ['kg', 'g'], two(s, 'kg', 'g')); },
      () => conv(`${rnd(1, 4)} kg ${pick([5 * rnd(1, 19), 10 * rnd(10, 99)])} g`, 'g'),
      () => { let v; do { v = 10 * rnd(101, 499); } while (v % 1000 === 0); return conv(`${v} g`, 'kg', 'g'); },
      () => { const k = rnd(1, 3), c = rnd(1, 9); const other = pick([k * 1000 + c * 100, k * 1000 + c * 10, k * 1000 - 100 * rnd(1, 5)]); return compare('cmpm', `${k} kg ${c * 10} g`, `${other} g`, 'schwerer', 'Beide gleich schwer'); },
    ])();
    return pick([
      () => { const r = pick(REF); return choice('guess', `Wie schwer ist ungefähr ${r[0]}?`, '', shuffle(r.slice(1)), r[1], `${r[0][0].toUpperCase() + r[0].slice(1)} wiegt ungefähr ${r[1]}.`, r[0]); },
      () => { const [one, many, w] = pick(PER); let n; do { n = rnd(2, 8); } while (n * w > 2000); return num('per', `${one} wiegt ${w} g. Wie viel Gramm wiegen ${n} ${many}?`, '', [n * w], ['g'], `${n * w} g`); },
      () => { const [one, many, w] = pick(PER); const k = rnd(1, 2); return num('perkg', `${one} wiegt ${w} g. Wie viele ${many} wiegen zusammen ${k} kg?`, '', [k * 1000 / w], [many.split(' ')[0]], `${k * 1000 / w} ${many}`); },
    ])();
  }
  function genRad(t) {
    // with 4 fields and 3 colours there is never a single least likely one
    const n = t === 3 ? pick([6, 8]) : pick([4, 6, 8]); const cols = shuffle(Object.keys(COLORS)); const name = (c) => COLORS[c].name, adj = (c) => COLORS[c].name.toLowerCase();
    // counts for k colours summing to n, all ≥ 1
    const split = (k) => { const c = Array(k).fill(1); for (let i = k; i < n; i++) c[rnd(0, k - 1)]++; return c; };
    const wheel = (counts) => shuffle(counts.flatMap((x, i) => Array(x).fill(cols[i])));
    const fields = (k) => (k === 1 ? '1 Feld' : `${k} Felder`);
    if (t === 1) {
      const kind = pick(['sicher', 'möglich', 'unmöglich']); let sec, phrase, why;
      if (kind === 'sicher' && Math.random() < 0.4) { sec = Array(n).fill(cols[0]); phrase = name(cols[0]); why = `Alle Felder sind ${adj(cols[0])}.`; }
      else if (kind === 'sicher') { sec = wheel(split(2)); phrase = `${name(cols[0])} oder ${name(cols[1])}`; why = `Alle Felder sind ${adj(cols[0])} oder ${adj(cols[1])}.`; }
      else { const k = rnd(2, 3); sec = wheel(split(k)); const c = kind === 'möglich' ? cols[rnd(0, k - 1)] : cols[k]; const cnt = sec.filter((x) => x === c).length; phrase = name(c); why = cnt ? `${fields(cnt)} ${cnt === 1 ? 'ist' : 'sind'} ${adj(c)}, die anderen nicht.` : `Kein Feld ist ${adj(c)}.`; }
      return choice('wheel1', `Ist es sicher, möglich oder unmöglich, dass der Zeiger auf ${phrase} stehen bleibt?`, wheelSVG(sec), ['sicher', 'möglich', 'unmöglich'], kind, why, sec.join());
    }
    if (t === 2) {
      let counts; do { counts = split(rnd(2, 3)); } while (Math.random() < 0.6 && counts[0] === counts[1]);
      const sec = wheel(counts), [a, b] = [cols[0], cols[1]], [ca, cb] = [counts[0], counts[1]];
      return choice('wheel2', `Was ist wahrscheinlicher: Der Zeiger bleibt auf ${name(a)} oder auf ${name(b)} stehen?`, wheelSVG(sec), [name(a), name(b), 'Beide gleich wahrscheinlich'], ca === cb ? 'Beide gleich wahrscheinlich' : ca > cb ? name(a) : name(b), `${fields(ca)} ${adj(a)}, ${fields(cb)} ${adj(b)}.`, sec.join());
    }
    const most = Math.random() < 0.5; let counts;
    do { counts = split(3); } while (counts.filter((c) => c === (most ? Math.max(...counts) : Math.min(...counts))).length !== 1);
    const sec = wheel(counts), target = cols[counts.indexOf(most ? Math.max(...counts) : Math.min(...counts))];
    return choice('wheel3', `Auf welcher Farbe bleibt der Zeiger am ${most ? 'wahrscheinlichsten' : 'unwahrscheinlichsten'} stehen?`, wheelSVG(sec), cols.slice(0, 3).map(name).sort(), name(target), cols.slice(0, 3).map((c, i) => `${counts[i]} ${adj(c)}`).join(', ') + '.', sec.join());
  }
  function genLos(t) {
    if (t === 1) {
      let a, b; do { a = rnd(2, 5); b = rnd(2, 5); } while (a * b > 20);
      return pick([
        () => num('los', `An der Losbude darfst du dir ein Stofftier und einen Ball aussuchen. Es gibt ${a} Stofftiere und ${b} Bälle. Wie viele verschiedene Paare kannst du wählen?`, '', [a * b], null, `${a} · ${b} = ${a * b}`),
        () => num('los', `Am Eisstand gibt es ${a} Sorten Eis und ${b} Sorten Waffeln. Jedes Kind nimmt eine Kugel in einer Waffel. Wie viele verschiedene Eiswaffeln sind möglich?`, '', [a * b], null, `${a} · ${b} = ${a * b}`),
        () => num('los', `Am Hutstand gibt es ${a} Hüte und ${b} Bänder. Jeder Hut bekommt ein Band. Wie viele verschiedene Hüte mit Band kann man zusammenstellen?`, '', [a * b], null, `${a} · ${b} = ${a * b}`),
        () => num('los', `Beim Kinderschminken wählst du ein Tier und eine Farbe. Es gibt ${a} Tiere und ${b} Farben. Wie viele verschiedene Gesichter sind möglich?`, '', [a * b], null, `${a} · ${b} = ${a * b}`),
      ])();
    }
    const [a, b, c] = [rnd(2, 3), rnd(2, 3), rnd(2, 3)];
    return pick([
      () => num('los', `Für den Imbissteller wählst du eine Wurst, eine Beilage und ein Getränk. Es gibt ${a} Würste, ${b} Beilagen und ${c} Getränke. Wie viele verschiedene Teller sind möglich?`, '', [a * b * c], null, `${a} · ${b} · ${c} = ${a * b * c}`),
      () => num('los', `Zum Verkleiden gibt es ${a} Hüte, ${b} Umhänge und ${c} Masken. Jedes Kind nimmt von allem eins. Wie viele verschiedene Verkleidungen gibt es?`, '', [a * b * c], null, `${a} · ${b} · ${c} = ${a * b * c}`),
      () => { const ns = shuffle(NAMES).slice(0, 3); return num('order', `${ns[0]}, ${ns[1]} und ${ns[2]} setzen sich nebeneinander in eine Gondel. Wie viele verschiedene Sitzordnungen gibt es?`, '', [6], null, '3 · 2 · 1 = 6'); },
      () => { const k = rnd(3, 4); const ds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, k).sort(); return num('digits', `Die Losnummern haben zwei Ziffern. Erlaubt sind nur die Ziffern ${ds.slice(0, -1).join(', ')} und ${ds[k - 1]}, jede höchstens einmal pro Nummer. Wie viele verschiedene Losnummern gibt es?`, '', [k * (k - 1)], null, `${k} · ${k - 1} = ${k * (k - 1)}`); },
    ])();
  }
  // q: a few words that work in all question forms; one/many: shown on the chart
  const CHARTS = [
    { title: 'Fahrten am Samstag', bars: [['Riesenrad', 'das Riesenrad'], ['Karussell', 'das Karussell'], ['Achterbahn', 'die Achterbahn'], ['Autoscooter', 'der Autoscooter']],
      read: (a) => `Wie viele Fahrten hatte ${a}?`, diff: (a, b) => `Wie viele Fahrten hatte ${a} mehr als ${b}?`, sum: (a, b) => `Wie viele Fahrten hatten ${a} und ${b} zusammen?` },
    { title: 'Verkaufte Lose', bars: [['Donnerstag', 'Donnerstag'], ['Freitag', 'Freitag'], ['Samstag', 'Samstag'], ['Sonntag', 'Sonntag']],
      read: (a) => `Wie viele Lose wurden am ${a} verkauft?`, diff: (a, b) => `Wie viele Lose wurden am ${a} mehr verkauft als am ${b}?`, sum: (a, b) => `Wie viele Lose wurden am ${a} und am ${b} zusammen verkauft?` },
    { title: 'Gewonnene Preise', bars: [['Bälle', 'Bälle'], ['Hüte', 'Hüte'], ['Flöten', 'Flöten'], ['Bücher', 'Bücher']],
      read: (a) => `Wie viele ${a} wurden gewonnen?`, diff: (a, b) => `Wie viele ${a} wurden mehr gewonnen als ${b}?`, sum: (a, b) => `Wie viele ${a} und ${b} wurden zusammen gewonnen?` },
  ];
  function genTafel(t) {
    const C = pick(CHARTS); const step = t === 1 ? pick([2, 5, 10]) : 10, top = step * (t === 1 ? rnd(6, 10) : 10), unit = t === 1 ? step : 5;
    let vals; do { vals = C.bars.map(() => unit * rnd(1, top / unit)); } while (new Set(vals).size < vals.length || (t === 2 && vals.every((v) => v % 10 === 0)));
    const bars = C.bars.map((b, i) => ({ label: b[0], value: vals[i] })); const svg = chartSVG(C.title, bars, step, top);
    const [i, j] = shuffle([0, 1, 2, 3]); const [hi, lo] = vals[i] > vals[j] ? [i, j] : [j, i];
    if (t === 1 || Math.random() < 0.2) { const k = t === 2 ? vals.findIndex((v) => v % 10) : i; return num('bar', C.read(C.bars[k][1]), svg, [vals[k]], null, `${vals[k]}`); }
    if (Math.random() < 0.5) return num('bar', C.diff(C.bars[hi][1], C.bars[lo][1]), svg, [vals[hi] - vals[lo]], null, `${vals[hi]} − ${vals[lo]} = ${vals[hi] - vals[lo]}`);
    return num('bar', C.sum(C.bars[i][1], C.bars[j][1]), svg, [vals[i] + vals[j]], null, `${vals[i]} + ${vals[j]} = ${vals[i] + vals[j]}`);
  }
  const SNACKS = [['Eine Zuckerwatte', 'eine Zuckerwatte'], ['Ein Liebesapfel', 'einen Liebesapfel'], ['Eine Tüte gebrannte Mandeln', 'eine Tüte gebrannte Mandeln'], ['Ein Lebkuchenherz', 'ein Lebkuchenherz'], ['Eine Bratwurst', 'eine Bratwurst'], ['Ein Becher Kinderpunsch', 'einen Becher Kinderpunsch']];
  function genSach(t) {
    const who = pick(NAMES);
    if (t === 1) return pick([
      () => { const p = rnd(2, 5), n = rnd(2, 9); return num('s_mul', `Eine Fahrt mit dem Kettenkarussell kostet ${p} €. Wie viel Euro kosten ${n} Fahrten?`, '', [p * n], ['€'], `${p * n} €`); },
      () => { const a = rnd(20, 60), b = rnd(5, a - 5); return num('s_sub', `Am Dosenwerfen stehen ${a} Dosen, ${who} wirft ${b} davon um. Wie viele Dosen stehen noch?`, '', [a - b], null, `${a} − ${b} = ${a - b}`); },
      () => { const a = rnd(12, 60), b = rnd(8, 99 - a); return num('s_add', `Im Riesenrad sitzen ${a} Kinder und ${b} Erwachsene. Wie viele Menschen sitzen im Riesenrad?`, '', [a + b], null, `${a} + ${b} = ${a + b}`); },
      () => { const g = rnd(3, 6), k = rnd(3, 9); return num('s_div', `In eine Gondel passen ${g} Kinder. Wie viele Gondeln brauchen ${g * k} Kinder?`, '', [k], null, `${g * k} : ${g} = ${k}`); },
    ])();
    const money = (ct) => [Math.floor(ct / 100), ct % 100];
    if (t === 2) return pick([
      () => { const [x, y] = shuffle(SNACKS); const p1 = 10 * rnd(11, 45), p2 = 10 * rnd(5, 45); return num('m_add', `${x[0]} kostet ${euro(p1)}, ${y[0][0].toLowerCase() + y[0].slice(1)} kostet ${euro(p2)}. Wie viel kostet beides zusammen?`, '', money(p1 + p2), ['€', 'ct'], euro(p1 + p2)); },
      () => { const s = pick(SNACKS), p = 10 * rnd(11, 48), pay = pick([5, 10].filter((x) => x * 100 - p >= 100)); return num('m_change', `${who} kauft ${s[1]} für ${euro(p)} und bezahlt mit ${pay} €. Wie viel Rückgeld bekommt ${who}?`, '', money(pay * 100 - p), ['€', 'ct'], euro(pay * 100 - p)); },
      () => { let p, n; do { p = pick([20, 30, 40, 50, 60, 70, 80, 90]); n = rnd(2, 9); } while (p * n < 100 || p * n % 100 === 0); return num('m_mul', `Ein Los kostet ${p} ct. Wie viel kosten ${n} Lose?`, '', money(p * n), ['€', 'ct'], euro(p * n)); },
    ])();
    return pick([
      () => { const n = rnd(2, 5), p = rnd(2, 4), d = rnd(2, 4); return num('s_two', `${who} fährt ${n}-mal Autoscooter für je ${p} € und kauft ein Getränk für ${d} €. Wie viel Euro gibt ${who} aus?`, '', [n * p + d], ['€'], `${n} · ${p} € + ${d} € = ${n * p + d} €`); },
      () => { const s = pick([10, 20]), n = rnd(2, 4), p = rnd(1, 2); return num('s_left', `${who} hat ${s} € dabei und kauft ${n} Lose für je ${p} €. Wie viel Euro bleiben übrig?`, '', [s - n * p], ['€'], `${s} € − ${n} · ${p} € = ${s - n * p} €`); },
      () => { const g = rnd(3, 6); let n; do { n = rnd(10, 40); } while (n % g === 0); return num('s_ceil', `${n} Kinder wollen Riesenrad fahren, in eine Gondel passen ${g} Kinder. Wie viele Gondeln brauchen sie mindestens?`, '', [Math.ceil(n / g)], null, `${Math.floor(n / g)} volle Gondeln und noch eine: ${Math.ceil(n / g)}`); },
      () => { const l = 50 * rnd(6, 18), r = rnd(2, 5); return num('s_len', `Die Achterbahn ist ${l} m lang. Wie viele Meter fährt ein Wagen in ${r} Runden?`, '', [l * r], ['m'], `${r} · ${l} m = ${l * r} m`); },
      () => { const p = 10 * rnd(15, 45), n = 2, pay = 10; return num('m_change', `${who} kauft ${n} Lebkuchenherzen für je ${euro(p)} und bezahlt mit ${pay} €. Wie viel Rückgeld bekommt ${who}?`, '', money(pay * 100 - n * p), ['€', 'ct'], euro(pay * 100 - n * p)); },
    ])();
  }
  const GEN = { uhr: genUhr, laenge: genLaenge, masse: genMasse, rad: genRad, los: genLos, tafel: genTafel, sach: genSach };
  function generate(mod, tier) {
    tier = Math.max(1, Math.min(MODULES[mod].maxTier, tier));
    const tk = GEN[mod](tier); tk.mod = mod; tk.tier = tier; return tk;
  }

  /* ---------- Tutorials ---------- */
  const TUT = {
    uhr: {
      1: { title: 'Die Uhr lesen', steps: ['Der kurze Zeiger zeigt die Stunden, der lange Zeiger die Minuten.', 'Langer Zeiger auf der 12: volle Stunde. Auf der 3: Viertel nach, 15 Minuten. Auf der 6: halb, 30 Minuten. Auf der 9: Viertel vor, 45 Minuten.', 'Beispiel: Der kurze Zeiger steht zwischen 4 und 5, der lange auf der 6. Es ist 4 Uhr und 30 Minuten.', 'Am Uhrturm schreibst du die Stunden von 1 bis 12.'] },
      2: { title: 'Uhrzeit in 5-Minuten-Schritten', steps: ['Von einer Zahl zur nächsten sind es 5 Minuten.', 'Zähle in 5er-Schritten: Der lange Zeiger auf der 1 heißt 5 Minuten, auf der 2 heißt 10 Minuten, auf der 7 heißt 35 Minuten.', 'Beispiel: Der kurze Zeiger steht zwischen 8 und 9, der lange auf der 4. Es ist 8 Uhr und 20 Minuten.'] },
      3: { title: 'Uhrzeit auf die Minute', steps: ['Zwischen zwei Zahlen liegen 5 Striche. Jeder Strich ist eine Minute.', 'Zähle bis zur letzten Zahl in 5er-Schritten, dann die Striche einzeln weiter.', 'Beispiel: Der lange Zeiger steht 2 Striche hinter der 4. Das sind 20 + 2 = 22 Minuten.'] },
      4: { title: 'Zeitspannen', steps: ['Eine Stunde hat 60 Minuten. Eine Viertelstunde sind 15 Minuten, eine halbe Stunde 30, eine Dreiviertelstunde 45.', 'Von 14:50 Uhr bis 15:15 Uhr: Bis 15:00 Uhr sind es 10 Minuten, dann noch 15. Zusammen 25 Minuten.', 'Beginn 16:40 Uhr, Dauer 45 Minuten: Bis 17:00 Uhr sind es 20 Minuten, dann noch 25. Ende 17:25 Uhr.'] },
    },
    laenge: {
      1: { title: 'Meter und Zentimeter', steps: ['1 m = 100 cm. Ein halber Meter, ½ m, sind 50 cm.', '3 m sind 3 · 100 cm = 300 cm. Umgekehrt: 400 cm sind 4 m.', 'Am Lineal liegt der Gegenstand bei 0 an. Lies ab, wo er endet.'] },
      2: { title: 'Längen mit zwei Einheiten', steps: ['Längen kann man mit zwei Einheiten schreiben: 2 m 35 cm.', '2 m 35 cm = 200 cm + 35 cm = 235 cm.', 'Umgekehrt: 108 cm = 1 m 8 cm. Zum Vergleichen schreibst du beide Längen in cm.'] },
      3: { title: 'Kilometer und Meter', steps: ['1 km = 1000 m. Ein halber Kilometer, ½ km, sind 500 m.', '1 km 200 m = 1000 m + 200 m = 1200 m.', 'Von 650 m bis 1 km fehlen 350 m, denn 650 + 350 = 1000.'] },
    },
    masse: {
      1: { title: 'Gramm und Kilogramm', steps: ['1 kg = 1000 g. Ein halbes Kilogramm, ½ kg, sind 500 g.', 'Ist die Waage im Gleichgewicht, liegt links und rechts gleich viel.', 'Rechts liegen 500 g, 200 g und 50 g. Dann wiegt das Ding links 500 + 200 + 50 = 750 g.'] },
      2: { title: 'Gewichte mit zwei Einheiten', steps: ['Gewichte kann man mit zwei Einheiten schreiben: 1 kg 250 g.', '1 kg 250 g = 1000 g + 250 g = 1250 g. Umgekehrt: 2300 g = 2 kg 300 g.', 'Zum Vergleichen schreibst du beide Gewichte in g: 1 kg 20 g sind 1020 g, das ist weniger als 1200 g.'] },
      3: { title: 'Schätzen mit Stützpunkten', steps: ['Merke dir Stützpunkte: eine Packung Mehl wiegt 1 kg, ein Stück Butter 250 g, eine Tafel Schokolade 100 g.', 'Ein Apfel ist leichter als ein Stück Butter, aber schwerer als eine Tafel Schokolade: ungefähr 150 g.', '4 Stück Butter wiegen 4 · 250 g = 1000 g, also so viel wie eine Packung Mehl.'] },
    },
    rad: {
      1: { title: 'Sicher, möglich, unmöglich', steps: ['Alle Felder auf dem Glücksrad sind gleich groß. Zähle sie.', 'Sicher: Jedes Feld passt. Unmöglich: Kein Feld passt. Möglich: Manche Felder passen, andere nicht.', 'Beispiel: 3 rote und 3 blaue Felder. Rot ist möglich, Gelb ist unmöglich, „Rot oder Blau“ ist sicher.'] },
      2: { title: 'Was ist wahrscheinlicher?', steps: ['Je mehr Felder eine Farbe hat, desto wahrscheinlicher bleibt der Zeiger dort stehen.', 'Beispiel: 5 rote und 3 blaue Felder. Rot ist wahrscheinlicher als Blau.', 'Haben beide Farben gleich viele Felder, sind sie gleich wahrscheinlich.'] },
      3: { title: 'Am wahrscheinlichsten', steps: ['Zähle die Felder jeder Farbe.', 'Die Farbe mit den meisten Feldern ist am wahrscheinlichsten, die mit den wenigsten am unwahrscheinlichsten.', 'Beispiel: 4 gelbe, 3 grüne, 1 rotes Feld. Am wahrscheinlichsten ist Gelb, am unwahrscheinlichsten Rot.'] },
    },
    los: {
      1: { title: 'Alle Möglichkeiten zählen', steps: ['Du wählst aus zwei Gruppen je ein Ding.', 'Beispiel: 3 Hüte und 2 Schals. Zu jedem Hut passen 2 Schals, also 3 · 2 = 6 Paare.', 'Zum Prüfen kannst du alle aufschreiben: Hut 1 mit Schal 1, Hut 1 mit Schal 2, Hut 2 mit Schal 1 und so weiter.'] },
      2: { title: 'Drei Gruppen und Reihenfolgen', steps: ['Bei drei Gruppen rechnest du zweimal mal: 2 Würste, 3 Beilagen, 2 Getränke ergeben 2 · 3 · 2 = 12 Teller.', 'Sitzordnungen für 3 Kinder: Für den ersten Platz gibt es 3 Kinder, für den zweiten 2, für den letzten 1. Also 3 · 2 · 1 = 6.', 'Zweistellige Zahlen aus 3 Ziffern, jede nur einmal: 3 Ziffern für vorn, dann je 2 für hinten. Also 3 · 2 = 6.'] },
    },
    tafel: {
      1: { title: 'Säulendiagramm lesen', steps: ['Unter jeder Säule steht, wofür sie steht.', 'Geh vom oberen Ende der Säule waagerecht nach links zur Zahl.', 'Beispiel: Die Säule vom Riesenrad endet auf der Linie bei 30. Das Riesenrad hatte 30 Fahrten.'] },
      2: { title: 'Mit dem Diagramm rechnen', steps: ['Endet eine Säule zwischen zwei Linien, liegt ihr Wert genau in der Mitte: Zwischen 20 und 30 liegt 25.', '„Wie viele mehr“: Ziehe den kleineren Wert vom größeren ab, zum Beispiel 45 − 30 = 15.', '„Zusammen“: Rechne beide Werte plus, zum Beispiel 45 + 30 = 75.'] },
    },
    sach: {
      1: { title: 'Sachaufgaben', steps: ['Lies die Aufgabe genau. Was weißt du, und was ist gefragt?', 'Beispiel: Eine Fahrt kostet 3 €. Wie viel kosten 4 Fahrten? Du rechnest 4 · 3 € = 12 €.', 'Schreib nur die Zahl in das Feld. Die Einheit steht darunter.'] },
      2: { title: 'Rechnen mit Geld', steps: ['100 ct = 1 €. Man schreibt 3 € 50 ct.', 'Zusammen: 2 € 50 ct + 1 € 80 ct. Euro: 2 + 1 = 3. Cent: 50 + 80 = 130 ct = 1 € 30 ct. Also 4 € 30 ct.', 'Rückgeld von 5 € bei 3 € 40 ct: Bis 4 € fehlen 60 ct, bis 5 € noch 1 €. Rückgeld 1 € 60 ct.'] },
      3: { title: 'Aufgaben mit zwei Schritten', steps: ['Manche Aufgaben brauchen zwei Rechenschritte.', '3 Fahrten für je 2 € und ein Getränk für 3 €: Erst 3 · 2 € = 6 €, dann 6 € + 3 € = 9 €.', 'Gondeln: 26 Kinder, 4 passen in eine Gondel. 6 Gondeln reichen für 24 Kinder, für die letzten 2 braucht es noch eine. Also 7.'] },
    },
  };

  /* ---------- Heroes, enemies, events ---------- */
  const STARTERS = [
    { id: 'holzpferd', type: 'pflanze', shape: 'horse', names: ['Holzpferd', 'Karussellpferd', 'Karussellpferd'], hp: 75, desc: 'Aus Eichenholz geschnitzt, seit 60 Jahren im Karussell. Hält viel aus: Treffer machen ihm weniger.', perk: 'tank',
      attacks: [{ name: 'Glockenschlag', mod: 'uhr' }, { name: 'Galoppsprung', mod: 'laenge' }, { name: 'Hufeisen', mod: 'masse' }, { name: 'Karussellrunde', mod: 'sach' }] },
    { id: 'schaustellerin', type: 'normal', shape: 'schaustellerin', names: ['Die Schaustellerin', 'Die Schaustellerin', 'Die Schaustellerin'], hp: 65, desc: 'Ihr gehört die Losbude. Landet manchmal einen Volltreffer (doppelter Schaden).', perk: 'crit',
      attacks: [{ name: 'Drehscheibe', mod: 'rad' }, { name: 'Lostrommel', mod: 'los' }, { name: 'Preistafel', mod: 'tafel' }, { name: 'Wechselgeld', mod: 'sach' }] },
  ];
  const EXTRA = { uhr: 'Pendelschlag', laenge: 'Zollstock', masse: 'Sandsack', rad: 'Drehpfeil', los: 'Glückslos', tafel: 'Säulenblick', sach: 'Kassenbon' };
  const ENEMIES = {
    1: {
      normal: [
        { name: 'Die Jahrmarktwespe', type: 'normal', shape: 'jahrmarktwespe', hp: 26, atk: 3 },
        { name: 'Die Bratwurstglut', type: 'feuer', shape: 'bratwurstglut', hp: 24, atk: 4 },
        { name: 'Der Pfützenspritzer', type: 'wasser', shape: 'pfuetzenspritzer', hp: 26, atk: 4 },
        { name: 'Der Kürbiskopf', type: 'pflanze', shape: 'kuerbiskopf', hp: 30, atk: 3 },
      ],
      elite: { name: 'Der Autoscooter', type: 'normal', shape: 'autoscooter', hp: 45, atk: 5 },
      boss: { name: 'Der Ausrufer', acc: 'den Ausrufer', type: 'normal', shape: 'ausrufer', hp: 70, atk: 6, boss: true },
    },
    2: {
      normal: [
        { name: 'Der Kirmesnebel', type: 'wasser', shape: 'kirmesnebel', hp: 42, atk: 5 },
        { name: 'Die Funkenrakete', type: 'feuer', shape: 'funkenrakete', hp: 40, atk: 6 },
        { name: 'Das Zerrbild', type: 'normal', shape: 'zerrbild', hp: 38, atk: 6 },
        { name: 'Die Zaunranke', type: 'pflanze', shape: 'zaunranke', hp: 44, atk: 5 },
      ],
      elite: { name: 'Der Hau-den-Lukas', type: 'normal', shape: 'haudenlukas', hp: 70, atk: 8 },
      boss: { name: 'Der Herr der Geisterbahn', acc: 'den Herrn der Geisterbahn', type: 'normal', shape: 'herrdergeisterbahn', hp: 110, atk: 9, boss: true },
    },
  };
  const MOVES = ['Ellbogenstoß', 'Konfettikanone', 'Lautsprecherruf', 'Schubser', 'Senfspritzer', 'Rempler am Ausgang'];
  const EVENTS = [
    { title: 'Der Turmwärter', text: 'Der Turmwärter am Uhrturm fragt, wie spät es ist. Wer die Uhr richtig liest, bekommt einen Trank.', opts: [{ label: 'Uhr lesen', task: 'uhr', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Das Dosenwerfen', text: 'Neben dem Dosenwerfen hängt eine Tafel mit den Preisen von gestern. Lies sie richtig, dann gibt es eine Chilischote.', opts: [{ label: 'Tafel lesen', task: 'tafel', win: { item: 'keks' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Lostrommel', text: 'Die Losverkäuferin will wissen, wie viele Möglichkeiten es gibt. Wer richtig zählt, bekommt einen Schutzengel.', opts: [{ label: 'Zählen', task: 'los', win: { item: 'engel' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Der Obststand', text: 'Die Obsthändlerin wiegt Äpfel und Kürbisse. Hilf ihr beim Wiegen, dann leiht sie dir einen Schild.', opts: [{ label: 'Helfen', task: 'masse', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Ablehnen', effect: {} }] },
    { title: 'Das Glücksrad', text: 'Am Glücksrad darf jeder einmal raten. Wer richtig rät, bekommt eine Eselsbrücke.', opts: [{ label: 'Raten', task: 'rad', win: { item: 'lupe' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Kasse', text: 'An der Kasse vom Kettenkarussell ist viel los. Hilf beim Rechnen, dann darfst du einmal umsonst mitfahren.', opts: [{ label: 'Mitrechnen', task: 'sach', win: { xp: 20 }, lose: { xp: 5 } }, { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } }] },
    { title: 'Die Bank am Riesenrad', text: 'Neben dem Riesenrad steht eine Bank im Schatten. Du kannst dich ausruhen.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
  ];

  const MODE = { modules: MODULES, starters: STARTERS, extra: EXTRA, enemies: ENEMIES, events: EVENTS, moves: MOVES, numGen: generate, numTut: TUT, worlds: 2, title: 'Der Jahrmarkt', icon: '🎪', sub: 'Uhrzeit, Längen, Gewichte, Zufall und Sachaufgaben' };
  return { MODE, MODULES, generate, TUT, STARTERS, EXTRA, ENEMIES, MOVES, EVENTS, REF, qty, clockSVG, wheelSVG, chartSVG };
})();
if (typeof module !== 'undefined') module.exports = MJ;
