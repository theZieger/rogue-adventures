// Klasse 1 und 2, Mathe: Zahlen bis 20 und Formen (Klasse 1); Zahlen bis 100, Malnehmen und Teilen, Größen (Klasse 2).
// Units register themselves in MK.MODES (pattern: src/sachkunde3.js) and share hero and opponents (K12.SETS.mathe).
// Number tasks marked k12 are typed in by the bot from task.answers; tests/test_k12_mathe.js recomputes those answers
// from the text and the pictures. Unmarked ones (sums, Zahlenmauer, Bauplan, Zahlenfolge) the bot works out itself.
(() => {
  const K = typeof MK !== 'undefined' ? MK : require('./knowledge.js');
  const S = typeof K12 !== 'undefined' ? K12 : require('./klasse12.js');
  const Q = typeof MQ !== 'undefined' ? MQ : require('./logic.js');
  const J = typeof MJ !== 'undefined' ? MJ : require('./jahrmarkt.js');
  const { shuffle, pick, rnd } = K;
  const OUT = '#1C2541', NB = ' ';

  const svgOf = (w, h, body, label, attrs) => `<svg viewBox="0 0 ${w} ${h}"${attrs || ''} role="img" aria-label="${label}">${body}</svg>`;
  const pic = (s) => `<div class="figure">${s}</div>`;
  const height = (px) => ` style="height:${px}px"`;
  // k different numbers close to right, inside lo … hi
  const near = (right, lo, hi, k) => { for (let d = 2; ; d++) { const c = []; for (let x = Math.max(lo, right - d); x <= Math.min(hi, right + d); x++) if (x !== right) c.push(x); if (c.length >= k) return shuffle(c).slice(0, k); } };
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  // qid names the kind of task, not the numbers: saves keep one entry per kind
  function maker(p) {
    const base = (mod, tier, sub) => ({ mod, tier, group: `${mod}:${tier}`, note: mod, qid: `${p}_${mod}${tier}_${sub}` });
    return {
      num: (mod, tier, sub, answers, extra) => Object.assign(base(mod, tier, sub), { kind: 'num', answers, k12: true }, extra),
      choice: (mod, tier, sub, q, answer, wrong, extra) => Object.assign(base(mod, tier, sub), { kind: 'choice', q, answer, options: shuffle([answer].concat(wrong)), why: '', cols: 1 }, extra),
      order: (mod, tier, sub, q, texts) => { const items = texts.map((text, i) => ({ id: 'o' + i, text: String(text) })); return Object.assign(base(mod, tier, sub), { kind: 'order', q, items, order: items.map((x) => x.id), display: shuffle(items) }); },
    };
  }
  function register(key, def, gen) {
    const set = S.SETS.mathe; const { attacks, ...rest } = def;
    const mode = Object.assign({ worlds: 1, subject: 'Mathe', pool: [], starters: [Object.assign({}, set.hero, { attacks })], enemies: set.enemies, moves: set.moves }, rest);
    mode.gen = (mod, tier) => gen(mod, Math.max(1, Math.min(mode.modules[mod].maxTier, tier)));
    K.MODES[key] = mode;
  }
  const restEv = (title, text) => ({ title, text, opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] });
  const ev = (title, text, label, task, win, lose) => ({ title, text, opts: [{ label, task, win, lose }, { label: 'Weitergehen', effect: {} }] });

  /* ---------- Drawings ---------- */
  const RED = '#E8453C', BLUE = '#3F7FE0';
  const dot = (x, y, r, fill) => `<circle class="dot" cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${OUT}" stroke-width="1.5"/>`;
  // Zehnerfeld (2 × 5) or Zwanzigerfeld (2 × 10), filled row by row: red up to five, then blue
  function fieldSVG(n, cols) {
    const C = 26; let b = '';
    for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) { const x = 2 + c * C + (c >= 5 ? 6 : 0), y = 2 + r * C;
      b += `<rect x="${x}" y="${y}" width="${C}" height="${C}" fill="#fff" stroke="${OUT}" stroke-width="1.5"/>${r * cols + c < n ? dot(x + C / 2, y + C / 2, 9, c < 5 ? RED : BLUE) : ''}`; }
    return svgOf(cols * C + (cols > 5 ? 10 : 4), 2 * C + 4, b, cols > 5 ? 'Zwanzigerfeld mit Punkten' : 'Zehnerfeld mit Punkten');
  }
  const PIPS = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
  const diceSVG = (ns) => svgOf(ns.length * 64, 62, ns.map((n, k) => `<rect x="${k * 64 + 3}" y="3" width="56" height="56" rx="10" fill="#fff" stroke="${OUT}" stroke-width="2.5"/>${PIPS[n].map(([c, r]) => dot(k * 64 + 15 + c * 16, 15 + r * 16, 5.5, OUT)).join('')}`).join(''), 'Zwei Würfel');
  // Zahlenmauer and Rechendreieck in the markup of src/logic.js, so the bot reads them the same way
  const stone = (x, y, w, v) => `<g data-v="${v}"><rect x="${x}" y="${y}" width="${w}" height="34" rx="4" fill="${v === '?' ? '#FFE27A' : '#F3D9B1'}" stroke="${OUT}" stroke-width="2"/><text x="${x + w / 2}" y="${y + 24}" text-anchor="middle" font-size="20" font-weight="700" fill="${OUT}">${v}</text></g>`;
  function mauerTask(m, mod, t, b, r, c) {
    const rows = [b, [b[0] + b[1], b[1] + b[2]], [b[0] + 2 * b[1] + b[2]]];
    const show = rows.map((row, i) => row.map((v, j) => (i === r && j === c ? '?' : v)));
    const svg = `<svg class="mauer" viewBox="0 0 196 112" role="img" aria-label="Zahlenmauer">${show.map((row, i) => row.map((v, j) => stone(2 + i * 32 + j * 64, 2 + (2 - i) * 36, 64, v)).join('')).join('')}</svg>`;
    return m.num(mod, t, r ? 'oben' : 'unten', [rows[r][c]], { svg, ask: 'Zwei Steine zusammen ergeben den Stein darüber. Welche Zahl fehlt?', k12: false });
  }
  function triTask(m, mod, t, inner, k) {
    const vals = inner.concat([inner[0] + inner[1], inner[1] + inner[2], inner[0] + inner[2]]); const show = vals.map((v, i) => (i === k ? '?' : v));
    const P = [[120, 78], [72, 164], [168, 164], [28, 96], [120, 216], [212, 96]];
    const box = (i) => { const [x, y] = P[i]; return `<g data-tri="${i}" data-v="${show[i]}"><rect x="${x - 30}" y="${y - 17}" width="60" height="34" rx="${i < 3 ? 17 : 4}" fill="${i === k ? '#FFE27A' : i < 3 ? '#FFFFFF' : '#CFE6FF'}" stroke="${OUT}" stroke-width="2"/><text x="${x}" y="${y + 8}" text-anchor="middle" font-size="22" font-weight="700" fill="${OUT}">${show[i]}</text></g>`; };
    const svg = `<svg class="mauer tri" viewBox="-4 0 248 238" role="img" aria-label="Rechendreieck"><path d="M120 8 L14 192 L226 192 Z" fill="none" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>${range(0, 5).map(box).join('')}</svg>`;
    return m.num(mod, t, k < 3 ? 'innen' : 'aussen', [vals[k]], { svg, ask: 'Außen steht, was die zwei Nachbarn zusammen ergeben. Welche Zahl fehlt?', k12: false });
  }

  /* ================= ZAHLEN BIS 20 (Klasse 1) ================= */
  const z = maker('z20');
  function genZ20(mod, t) {
    if (mod === 'menge') {
      const lo = t === 1 ? 1 : 11, hi = t === 1 ? 10 : 20, cols = t === 1 ? 5 : 10; const r = Math.random();
      if (t === 1 && r < 0.35) { const a = rnd(1, 6), b = rnd(1, 6); return z.num(mod, t, 'wuerfel', [a + b], { svg: diceSVG([a, b]), ask: 'Wie viele Punkte sind es zusammen?' }); }
      if (r < 0.7) { const n = rnd(lo, hi); return z.num(mod, t, 'feld', [n], { svg: fieldSVG(n, cols), ask: 'Wie viele Punkte siehst du?' }); }
      const n = rnd(Math.max(2, lo), hi); const opts = [n].concat(near(n, Math.max(2, lo - 2), hi, 2)).map((x) => fieldSVG(x, cols));
      return z.choice(mod, t, 'bild', `Tippe auf das Feld mit ${n} Punkten.`, opts[0], opts.slice(1), { svgOpts: true, tall: t === 2, n, why: `So sehen ${n} Punkte aus:` });
    }
    if (mod === 'zerlegen') {
      if (t === 1) { const s = rnd(3, 10), a = rnd(1, s - 1); return z.num(mod, t, 'zerlegen', [s - a], { text: Math.random() < 0.5 ? `${s} = ${a} + ?` : `${s} = ? + ${a}`, ask: 'Welche Zahl fehlt?' }); }
      if (Math.random() < 0.4) { const s = rnd(11, 20); return z.num(mod, t, 'zehn', [s - 10], { text: `${s} = 10 + ?`, ask: 'Welche Zahl fehlt?' }); }
      const s = rnd(11, 18), a = rnd(s - 9, 9); return z.num(mod, t, 'zerlegen', [s - a], { text: `${s} = ${a} + ?`, ask: 'Welche Zahl fehlt?' });
    }
    if (mod === 'vergleich') {
      let left;
      if (t === 1) { const v = rnd(0, 10); left = { txt: `${v}`, v }; }
      else if (Math.random() < 0.4) { const v = rnd(0, 20); left = { txt: `${v}`, v }; }
      else { const a = rnd(1, 10), b = rnd(1, 20 - a); left = { txt: `${a} + ${b}`, v: a + b }; }
      const w = Math.random() < 0.25 ? left.v : near(left.v, 0, t === 1 ? 10 : 20, 1)[0]; const right = { txt: `${w}`, v: w };
      const [A, B] = Math.random() < 0.5 ? [left, right] : [right, left]; const sign = A.v < B.v ? '<' : A.v > B.v ? '>' : '=';
      const sum = [A, B].find((x) => x.txt.includes('+'));
      const why = `${sum ? `${sum.txt} = ${sum.v}. ` : ''}${A.v} ist ${{ '<': 'kleiner als', '>': 'größer als', '=': 'genauso groß wie' }[sign]} ${B.v}.`;
      return z.choice(mod, t, sum ? 'summe' : 'zahlen', `${A.txt} ___ ${B.txt}`, sign, [], { options: ['<', '>', '='], why });
    }
    if (mod === 'nachbar') {
      if (t === 2) { const ns = shuffle(range(0, 20)).slice(0, 4).sort((a, b) => a - b); return z.order(mod, t, 'ordnen', 'Tippe die Zahlen an. Fang mit der kleinsten an.', ns); }
      const n = rnd(1, 19);
      if (Math.random() < 0.6) return z.num(mod, t, 'nachbarn', [n - 1, n + 1], { nb: 'Nachbar', n, text: `${n}` });
      return z.num(mod, t, 'zwischen', [n], { text: `${n - 1}, ?, ${n + 1}`, ask: 'Welche Zahl liegt dazwischen?' });
    }
    if (mod === 'dopp') {
      const lo = t === 1 ? 1 : 6, hi = t === 1 ? 5 : 10;
      if (Math.random() < 0.5) { const n = rnd(lo, hi); return z.num(mod, t, 'verdoppeln', [2 * n], { text: `${n}`, ask: 'Verdopple die Zahl.' }); }
      const n = 2 * rnd(lo, hi); return z.num(mod, t, 'halbieren', [n / 2], { text: `${n}`, ask: 'Halbiere die Zahl.' });
    }
    if (mod === 'rechnen') {
      const r = Math.random();
      if (t >= 2 && r < 0.2) {
        let a, b; do { a = rnd(1, 9); b = rnd(1, 20 - a); } while (a === b || (t === 3 && a + b < 11) || a + b > 20);
        if (t === 2) return z.choice(mod, t, 'tausch', `Welche Aufgabe ist die Tauschaufgabe zu ${a} + ${b}?`, `${b} + ${a}`, [`${Math.max(a, b)} − ${Math.min(a, b)}`, `${a} + ${b + 1 > 20 - a ? b - 1 : b + 1}`], { why: 'Bei der Tauschaufgabe tauschen die Zahlen ihren Platz. Das Ergebnis bleibt gleich.' });
        return z.choice(mod, t, 'umkehr', `Welche Aufgabe ist die Umkehraufgabe zu ${a} + ${b} = ${a + b}?`, `${a + b} − ${b}`, [`${b} + ${a}`, `${Math.max(a, b)} − ${Math.min(a, b)}`], { why: `Die Umkehraufgabe rechnet zurück: ${a + b} − ${b} = ${a}.` });
      }
      if (t === 3 && r < 0.4) { const a = rnd(2, 9), s = rnd(11, a + 9); return z.num(mod, t, 'ergaenzen', [s - a], { text: `${a} + ? = ${s}` }); }
      const plus = Math.random() < 0.5; let a, b;
      if (t === 1) { if (plus) { a = rnd(0, 9); b = rnd(1, 10 - a); } else { a = rnd(2, 10); b = rnd(1, a); } }
      else if (t === 2) { const e = rnd(0, 8); if (plus) { a = 10 + e; b = rnd(1, 9 - e); if (Math.random() < 0.3) [a, b] = [b, a]; } else { a = 10 + rnd(1, 9); b = rnd(1, a - 10); } }
      else if (plus) { a = rnd(2, 9); b = rnd(11 - a, 9); } else { a = rnd(11, 18); b = rnd(a - 9, 9); }
      return z.num(mod, t, plus ? 'plus' : 'minus', [plus ? a + b : a - b], { text: `${a} ${plus ? '+' : '−'} ${b} = ?`, k12: false });
    }
    // mauer: bottom row small enough that the top stone stays at most 20
    let b; do b = [rnd(1, 6), rnd(1, 5), rnd(1, 6)]; while (b[0] + 2 * b[1] + b[2] > 20 || b[0] + 2 * b[1] + b[2] < 6);
    const r = t === 1 ? rnd(1, 2) : Math.random() < 0.7 ? 0 : 1;
    return mauerTask(z, mod, t, b, r, rnd(0, 2 - r));
  }
  register('zahlen20', {
    grade: 1, title: 'Zahlen bis 20', icon: '🧮', sub: 'Punkte zählen, zerlegen, vergleichen, verdoppeln, plus und minus bis 20',
    modules: {
      menge: { name: 'Blitzblick', icon: '🎲', maxTier: 2, worldCap: [2], dmg: 10 },
      zerlegen: { name: 'Zahlen zerlegen', icon: '🧩', maxTier: 2, worldCap: [2], dmg: 12 },
      vergleich: { name: 'Größer oder kleiner', icon: '⚖️', maxTier: 2, worldCap: [2], dmg: 10 },
      nachbar: { name: 'Nachbarzahlen', icon: '↔️', maxTier: 2, worldCap: [2], dmg: 10 },
      dopp: { name: 'Verdoppeln und halbieren', icon: '🪞', maxTier: 2, worldCap: [2], dmg: 12 },
      rechnen: { name: 'Plus und minus', icon: '➕', maxTier: 3, worldCap: [3], dmg: 14 },
      mauer: { name: 'Zahlenmauern', icon: '🧱', maxTier: 2, worldCap: [2], dmg: 14 },
    },
    attacks: [{ name: 'Würfelwurf', mod: 'menge' }, { name: 'Schüttelbox', mod: 'zerlegen' }, { name: 'Perlenschnur', mod: 'rechnen' }, { name: 'Mauerstein', mod: 'mauer' }],
    extra: { menge: 'Würfelwurf', zerlegen: 'Schüttelbox', vergleich: 'Waagebalken', nachbar: 'Hausnummer', dopp: 'Spiegelbild', rechnen: 'Perlenschnur', mauer: 'Mauerstein' },
    tut: {
      'menge:1': { title: 'Punkte zählen', steps: ['Ein Zehnerfeld hat zwei Reihen mit je 5 Kästchen.', 'Eine volle Reihe sind 5 Punkte. Zähle von 5 aus weiter.', 'Beispiel: oben 5 Punkte, unten 2 Punkte. Das sind 7.'] },
      'menge:2': { title: 'Das Zwanzigerfeld', steps: ['Im Zwanzigerfeld hat jede Reihe 10 Kästchen.', 'Die obere Reihe ist voll: Das sind 10 Punkte.', 'Beispiel: oben 10, unten 4 Punkte. Das sind 14.'] },
      'zerlegen:1': { title: 'Zahlen zerlegen', steps: ['Eine Zahl kann man in zwei Teile zerlegen.', 'Beispiel: 7 = 3 + 4. Zu 3 fehlen noch 4 bis 7.', 'Zähle von der kleinen Zahl bis zur großen weiter.'] },
      'zerlegen:2': { title: 'Zerlegen bis 20', steps: ['Zahlen ab 10 bestehen aus 10 und dem Rest.', 'Beispiel: 16 = 10 + 6.', 'Bei 15 = 8 + ? rechnest du: Von 8 bis 10 sind es 2, dann noch 5. Zusammen 7.'] },
      'vergleich:1': { title: 'Größer, kleiner, gleich', steps: ['< heißt kleiner als. > heißt größer als. = heißt gleich.', 'Die offene Seite zeigt immer zur größeren Zahl.', 'Beispiel: 3 < 8, denn 3 ist kleiner als 8.'] },
      'vergleich:2': { title: 'Aufgaben vergleichen', steps: ['Rechne zuerst die Plusaufgabe aus.', 'Beispiel: 4 + 5 ___ 8. Es ist 4 + 5 = 9.', '9 ist größer als 8. Also: 4 + 5 > 8.'] },
      'nachbar:1': { title: 'Nachbarzahlen', steps: ['Jede Zahl hat zwei Nachbarn.', 'Davor steht die Zahl, die um 1 kleiner ist. Danach die Zahl, die um 1 größer ist.', 'Beispiel: Die Nachbarn von 12 sind 11 und 13.'] },
      'nachbar:2': { title: 'Zahlen ordnen', steps: ['Suche zuerst die kleinste Zahl und tippe sie an.', 'Dann die nächstgrößere, bis alle Zahlen dran waren.', 'Beispiel: 4, 9, 13, 18.'] },
      'dopp:1': { title: 'Verdoppeln und halbieren', steps: ['Verdoppeln heißt: die Zahl noch einmal dazu. 3 verdoppelt ist 3 + 3 = 6.', 'Halbieren heißt: in zwei gleiche Teile teilen.', 'Beispiel: 8 halbiert ist 4, denn 4 + 4 = 8.'] },
      'dopp:2': { title: 'Verdoppeln bis 20', steps: ['Verdoppeln: 7 + 7 = 14.', 'Halbieren: 16 halbiert ist 8, denn 8 + 8 = 16.', 'Tipp: 10 halbiert ist 5. 12 halbiert ist 5 + 1 = 6.'] },
      'rechnen:1': { title: 'Plus und minus bis 10', steps: ['Plus heißt dazu. Minus heißt weg.', 'Beispiel: 6 + 3 = 9. Zähle von 6 aus drei weiter: 7, 8, 9.', 'Beispiel: 8 − 2 = 6. Zähle von 8 aus zwei zurück: 7, 6.'] },
      'rechnen:2': { title: 'Plus und minus bis 20', steps: ['Rechne mit den Einern und lass die 10 stehen.', 'Beispiel: 13 + 4. Es ist 3 + 4 = 7, also 17.', 'Die Tauschaufgabe zu 3 + 9 ist 9 + 3. Das Ergebnis bleibt gleich.'] },
      'rechnen:3': { title: 'Über die 10', steps: ['Rechne zuerst bis zur 10, dann weiter.', 'Beispiel: 8 + 5. Von 8 bis 10 sind es 2, dann noch 3. Also 13.', 'Beispiel: 13 − 5. Von 13 bis 10 sind es 3, dann noch 2 weg. Also 8.', 'Die Umkehraufgabe zu 8 + 5 = 13 ist 13 − 5 = 8.'] },
      'mauer:1': { title: 'Zahlenmauern', steps: ['Zwei Steine nebeneinander ergeben zusammen den Stein darüber.', 'Beispiel: unten 2 und 3, darüber 5.', 'Rechne von unten nach oben.'] },
      'mauer:2': { title: 'Steine unten finden', steps: ['Fehlt ein Stein unten, rechnest du minus.', 'Beispiel: Oben steht 9, unten links 4. Dann fehlt 9 − 4 = 5.', 'Prüfe: 4 + 5 = 9.'] },
    },
    notes: {
      menge: { title: 'Zehnerfeld', lines: ['Eine Reihe im Zehnerfeld hat 5 Kästchen.', 'Zwei volle Reihen sind 10.'] },
      zerlegen: { title: 'Zerlegen', lines: ['7 = 3 + 4 = 2 + 5 = 1 + 6', '16 = 10 + 6'] },
      vergleich: { title: 'Zeichen', lines: ['< kleiner als', '> größer als', '= gleich'] },
      nachbar: { title: 'Nachbarzahlen', lines: ['Davor: 1 weniger. Danach: 1 mehr.', '11 – 12 – 13'] },
      dopp: { title: 'Verdoppeln', lines: ['Verdoppeln: 6 + 6 = 12', 'Halbieren: 12 = 6 + 6'] },
      rechnen: { title: 'Über die 10', lines: ['8 + 5 = 8 + 2 + 3 = 13', '13 − 5 = 13 − 3 − 2 = 8'] },
      mauer: { title: 'Zahlenmauer', lines: ['Zwei Steine zusammen ergeben den Stein darüber.', 'Fehlt unten ein Stein: oben minus daneben.'] },
    },
    events: [
      ev('Der Würfelbecher', 'Ein Junge würfelt mit zwei Würfeln. Zählst du die Punkte, schenkt er dir einen Trank.', 'Punkte zählen', 'menge', { item: 'trank' }, { hp: -5 }),
      ev('Die Hausnummern', 'An einem Haus fehlt die Nummer. Die Nachbarn fragen dich, welche es ist.', 'Nummer finden', 'nachbar', { xp: 20 }, { xp: 5 }),
      ev('Die Gartenmauer', 'Ein Maurer baut eine Mauer aus Zahlensteinen. Findest du den fehlenden Stein, leiht er dir einen Schild.', 'Stein finden', 'mauer', { item: 'schild' }, { hp: -5 }),
      ev('Die Bäckerei', 'Die Bäckerin zählt Brötchen in Tüten. Rechne mit, dann verrät sie dir eine Eselsbrücke.', 'Mitrechnen', 'rechnen', { item: 'lupe' }, { xp: 5 }),
      restEv('Die Leseecke', 'In der Klasse liegt eine Ecke voller Kissen. Hier ruhst du dich aus.'),
    ],
  }, genZ20);

  /* ================= FORMEN UND LAGE (Klasse 1) ================= */
  const f = maker('form');
  const FILLS = ['#FFD84A', '#7CC2FF', '#FF8FA3', '#8FE3A0', '#C3A6FF', '#FFB870'];
  const FORMS = {
    dreieck: { name: 'Dreieck', acc: 'das Dreieck', many: 'Dreiecke', ecken: 3, draw: () => `<path d="${pick(['M30 5 L56 54 L4 54 Z', 'M6 6 L6 54 L56 54 Z', 'M4 54 L44 6 L56 54 Z'])}"` },
    kreis: { name: 'Kreis', acc: 'den Kreis', many: 'Kreise', ecken: 0, draw: () => '<circle cx="30" cy="30" r="25"' },
    quadrat: { name: 'Quadrat', acc: 'das Quadrat', many: 'Quadrate', ecken: 4, draw: () => '<rect x="7" y="7" width="46" height="46"' },
    rechteck: { name: 'Rechteck', acc: 'das Rechteck', many: 'Rechtecke', ecken: 4, draw: () => pick(['<rect x="2" y="16" width="56" height="28"', '<rect x="16" y="2" width="28" height="56"', '<rect x="3" y="11" width="54" height="38"']) },
    viereck: { name: 'Viereck', acc: 'das Viereck', many: 'Vierecke', ecken: 4, draw: () => `<path d="${pick(['M8 14 L50 4 L56 54 L14 46 Z', 'M4 40 L22 6 L56 18 L44 56 Z'])}"` },
  };
  // a Quadrat is also a Rechteck and a Viereck, a Rechteck also a Viereck: such names never count as wrong
  const IS_ALSO = { quadrat: ['rechteck', 'viereck'], rechteck: ['viereck'] };
  const fits = (shape, name) => shape === name || (IS_ALSO[shape] || []).includes(name);
  const formG = (k, fill) => `${FORMS[k].draw()} fill="${fill || pick(FILLS)}" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>`;
  const formSVG = (k) => svgOf(60, 60, formG(k), 'Form');
  const STAR = 'M30 4 L37.6 19.5 L54.7 22 L42.4 34 L45.3 51 L30 43 L14.7 51 L17.6 34 L5.3 22 L22.4 19.5 Z';
  // things for the Lage tasks: one colour each, so they are easy to tell apart
  const THINGS = {
    kreis: { name: 'Kreis', dat: 'dem Kreis', g: `<circle cx="30" cy="30" r="24" fill="${BLUE}" stroke="${OUT}" stroke-width="2.5"/>` },
    dreieck: { name: 'Dreieck', dat: 'dem Dreieck', g: `<path d="M30 6 L55 52 L5 52 Z" fill="#FFD84A" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>` },
    quadrat: { name: 'Quadrat', dat: 'dem Quadrat', g: `<rect x="8" y="8" width="44" height="44" fill="${RED}" stroke="${OUT}" stroke-width="2.5"/>` },
    stern: { name: 'Stern', dat: 'dem Stern', g: `<path d="${STAR}" fill="#8FE3A0" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>` },
  };
  const at = (x, y, s, inner) => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
  const rowSVG = (ks) => svgOf(210, 74, `<path d="M4 70 H206" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>${ks.map((k, i) => `<g data-at="${i}" data-thing="${k}">${at(8 + i * 68, 6, 1, THINGS[k].g)}</g>`).join('')}`, 'Drei Formen in einer Reihe');
  const shelfSVG = (ks) => svgOf(96, 214, `<rect x="4" y="4" width="88" height="206" rx="4" fill="#F2C27E" stroke="${OUT}" stroke-width="2.5"/>${[72, 140].map((y) => `<path d="M6 ${y} H90" stroke="${OUT}" stroke-width="3"/>`).join('')}${ks.map((k, i) => `<g data-at="${i}" data-thing="${k}">${at(20, 12 + i * 68, 0.95, THINGS[k].g)}</g>`).join('')}`, 'Regal mit drei Fächern', height(170));
  const SOLIDS = { wuerfel: ['Würfel', 'den'], quader: ['Quader', 'den'], kugel: ['Kugel', 'die'] };
  const solidSVG = (k) => svgOf(68, 62, {
    wuerfel: `<path d="M10 22 L22 10 L56 10 L44 22 Z" fill="#8FD3FF" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/><path d="M44 22 L56 10 L56 44 L44 56 Z" fill="#2B78C2" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/><rect x="10" y="22" width="34" height="34" fill="#3FA0FF" stroke="${OUT}" stroke-width="2"/>`,
    quader: `<path d="M4 30 L14 20 L64 20 L54 30 Z" fill="#8FD3FF" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/><path d="M54 30 L64 20 L64 44 L54 54 Z" fill="#2B78C2" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/><rect x="4" y="30" width="50" height="24" fill="#3FA0FF" stroke="${OUT}" stroke-width="2"/>`,
    kugel: `<circle cx="34" cy="31" r="26" fill="#3FA0FF" stroke="${OUT}" stroke-width="2"/><path d="M8 31 a26 8 0 0 0 52 0" fill="none" stroke="${OUT}" stroke-width="1.5"/><ellipse cx="25" cy="21" rx="7" ry="4" fill="#fff" opacity=".6" transform="rotate(-30 25 21)"/>`,
  }[k], 'Körper');
  const OBJECTS = [['einem Ball', 'kugel'], ['einer Murmel', 'kugel'], ['einer Orange', 'kugel'], ['einem Spielwürfel', 'wuerfel'], ['einem Zuckerwürfel', 'wuerfel'], ['einem Schuhkarton', 'quader'], ['einem Ziegelstein', 'quader'], ['einer Milchtüte', 'quader']];
  const SOLID_FACTS = [['Welcher Körper kann gut rollen?', 'kugel'], ['Welcher Körper hat keine Ecken?', 'kugel'], ['Welcher Körper hat 6 gleich große Quadrate als Flächen?', 'wuerfel'], ['Welcher Körper sieht aus wie ein langer Kasten?', 'quader']];
  const SOLID_COUNTS = [['Ecken', 'wuerfel', 8], ['Ecken', 'quader', 8], ['Flächen', 'wuerfel', 6], ['Flächen', 'quader', 6], ['Ecken', 'kugel', 0]];
  // pattern pieces: shape and colour together, so the pattern also works without telling colours apart
  const TOKENS = { kreis: `<circle cx="20" cy="20" r="15" fill="${BLUE}"`, dreieck: '<path d="M20 4 L36 34 L4 34 Z" fill="#FFD84A"', quadrat: `<rect x="6" y="6" width="28" height="28" fill="${RED}"`, stern: `<path d="${STAR}" transform="translate(-2 -1) scale(.73)" fill="#8FE3A0"`, raute: '<path d="M20 3 L36 20 L20 37 L4 20 Z" fill="#C3A6FF"' };
  const tokenG = (k) => `${TOKENS[k]} stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>`;
  const tokenSVG = (k) => svgOf(40, 40, `<g data-k="${k}">${tokenG(k)}</g>`, 'Musterteil');
  const PATTERNS = { 1: ['AB', 'ABC'], 2: ['AAB', 'ABB', 'AABB', 'ABAC'] };
  // a row of cubes seen from the front: every cube shows its front face
  function towerSVG(hs) {
    const C = 24, D = 8, H = Math.max(...hs); let b = '';
    hs.forEach((h, c) => { for (let k = 0; k < h; k++) { const x = 2 + c * C, y = 2 + D + (H - k - 1) * C;
      b += `<path d="M${x + C} ${y} l${D} ${-D} v${C} l${-D} ${D} Z" fill="#B54E2A" stroke="${OUT}" stroke-width="1.5" stroke-linejoin="round"/><path d="M${x} ${y} l${D} ${-D} h${C} l${-D} ${D} Z" fill="#F6A36B" stroke="${OUT}" stroke-width="1.5" stroke-linejoin="round"/><rect class="cube" x="${x}" y="${y}" width="${C}" height="${C}" fill="#D9653B" stroke="${OUT}" stroke-width="1.5"/>`; } });
    return svgOf(hs.length * C + D + 4, H * C + D + 4, b, 'Würfel in einer Reihe');
  }
  function genForm(mod, t) {
    if (mod === 'lage') {
      const ks = shuffle(Object.keys(THINGS)).slice(0, 3); const names = ks.map((k) => THINGS[k].name); const wrong = (i) => names.filter((_, j) => j !== i);
      const row = Math.random() < 0.6; const s = pic(row ? rowSVG(ks) : shelfSVG(ks));
      const ask = (sub, q, i) => f.choice(mod, t, sub, q, names[i], wrong(i), { pic: s, things: ks });
      if (t === 1) { const i = rnd(0, 2); return row ? ask('reihe', ['Was ist ganz links?', 'Was ist in der Mitte?', 'Was ist ganz rechts?'][i], i) : ask('regal', ['Was liegt oben?', 'Was liegt in der Mitte?', 'Was liegt unten?'][i], i); }
      if (!row) return Math.random() < 0.5 ? ask('ueber', `Was liegt über ${THINGS[ks[1]].dat}?`, 0) : ask('unter', `Was liegt unter ${THINGS[ks[1]].dat}?`, 2);
      const k = rnd(0, 2);
      if (k === 0) { const [a, b] = shuffle([0, 2]); return ask('zwischen', `Was ist zwischen ${THINGS[ks[a]].dat} und ${THINGS[ks[b]].dat}?`, 1); }
      if (k === 1) { const i = rnd(1, 2); return ask('links', `Was ist links neben ${THINGS[ks[i]].dat}?`, i - 1); }
      const i = rnd(0, 1); return ask('rechts', `Was ist rechts neben ${THINGS[ks[i]].dat}?`, i + 1);
    }
    if (mod === 'formen') {
      const kinds = t === 1 ? ['dreieck', 'kreis', 'quadrat', 'rechteck'] : Object.keys(FORMS); const r = Math.random();
      if (t === 2 && r < 0.3) {
        const k = pick(['dreieck', 'kreis', 'quadrat']); let ks; do ks = Array.from({ length: rnd(6, 9) }, () => pick(['dreieck', 'kreis', 'quadrat'])); while (!ks.includes(k));
        const cells = shuffle(range(0, 11)).slice(0, ks.length);
        const s = svgOf(250, 190, ks.map((x, i) => `<g data-form="${x}">${at(6 + (cells[i] % 4) * 62 + rnd(0, 6), 4 + Math.floor(cells[i] / 4) * 62 + rnd(0, 6), 0.8, formG(x))}</g>`).join(''), 'Viele Formen', height(160));
        return f.num(mod, t, 'zaehlen', [ks.filter((x) => x === k).length], { svg: s, ask: `Wie viele ${FORMS[k].many} siehst du?` });
      }
      if (t === 2 && r < 0.5) { const k = pick(['dreieck', 'quadrat', 'rechteck', 'viereck', 'kreis']); return f.num(mod, t, 'ecken', [FORMS[k].ecken], { svg: formSVG(k), ask: `Wie viele Ecken hat ${FORMS[k].acc.replace('den ', 'der ')}?` }); }
      const k = pick(kinds);
      if (Math.random() < 0.5) {
        const wrong = shuffle(kinds.filter((x) => !fits(k, x))).slice(0, 2).map((x) => FORMS[x].name);
        return f.choice(mod, t, 'name', 'Wie heißt diese Form?', FORMS[k].name, wrong, { pic: pic(formSVG(k)), why: { quadrat: 'Vier gleich lange Seiten und vier gerade Ecken.', rechteck: 'Vier gerade Ecken, zwei lange und zwei kurze Seiten.', viereck: 'Vier Ecken und vier Seiten.', dreieck: 'Drei Ecken und drei Seiten.', kreis: 'Rund, ohne Ecken.' }[k] });
      }
      const others = shuffle(kinds.filter((x) => !fits(x, k))).slice(0, 2); const opts = [k].concat(others).map(formSVG);
      return f.choice(mod, t, 'finden', `Tippe auf ${FORMS[k].acc}.`, opts[0], opts.slice(1), { svgOpts: true, form: k, why: `So sieht ${FORMS[k].acc.replace('den ', 'der ')} aus:` });
    }
    if (mod === 'koerper') {
      const names = Object.values(SOLIDS).map((x) => x[0]);
      if (t === 1) {
        const k = pick(Object.keys(SOLIDS));
        if (Math.random() < 0.5) return f.choice(mod, t, 'name', 'Wie heißt dieser Körper?', SOLIDS[k][0], names.filter((x) => x !== SOLIDS[k][0]), { pic: pic(solidSVG(k)), why: `Das ist ${SOLIDS[k][1] === 'den' ? 'ein' : 'eine'} ${SOLIDS[k][0]}.` });
        const opts = [k].concat(Object.keys(SOLIDS).filter((x) => x !== k)).map(solidSVG);
        return f.choice(mod, t, 'finden', `Tippe auf ${SOLIDS[k][1]} ${SOLIDS[k][0]}.`, opts[0], opts.slice(1), { svgOpts: true, solid: k, why: `So sieht ${SOLIDS[k][1].replace('den', 'der')} ${SOLIDS[k][0]} aus:` });
      }
      const r = Math.random();
      if (r < 0.4) { const [o, k] = pick(OBJECTS); return f.choice(mod, t, 'ding', `Welcher Körper passt zu ${o}?`, SOLIDS[k][0], names.filter((x) => x !== SOLIDS[k][0]), { why: `Die Form passt zu ${SOLIDS[k][1] === 'den' ? 'einem' : 'einer'} ${SOLIDS[k][0]}.` }); }
      if (r < 0.7) { const [q, k] = pick(SOLID_FACTS); return f.choice(mod, t, 'merkmal', q, SOLIDS[k][0], names.filter((x) => x !== SOLIDS[k][0])); }
      const [what, k, n] = pick(SOLID_COUNTS); return f.num(mod, t, 'zaehlen', [n], { svg: solidSVG(k), ask: `Wie viele ${what} hat ${SOLIDS[k][1] === 'den' ? 'der' : 'die'} ${SOLIDS[k][0]}?`, solid: k, what });
    }
    if (mod === 'muster') {
      const unit = pick(PATTERNS[t]); const letters = [...new Set(unit)]; const kinds = shuffle(Object.keys(TOKENS)); const of = (ch) => kinds[letters.indexOf(ch)];
      const L = unit.length, n = 2 * L + rnd(0, L - 1); const seq = range(0, n - 1).map((i) => of(unit[i % L])); const next = of(unit[n % L]);
      const wrong = shuffle(letters.map(of).filter((k) => k !== next)).concat(shuffle(kinds.slice(letters.length))).slice(0, 2);
      const opts = [next].concat(wrong).map(tokenSVG);
      const row = svgOf((n + 1) * 42 + 2, 44, seq.map((k, i) => `<g data-k="${k}">${at(2 + i * 42, 2, 1, tokenG(k))}</g>`).join('') + `<rect x="${4 + n * 42}" y="3" width="36" height="36" rx="6" fill="#FFF3C4" stroke="${OUT}" stroke-width="2" stroke-dasharray="4 3"/><text x="${22 + n * 42}" y="29" text-anchor="middle" font-size="22" font-weight="700" fill="${OUT}">?</text>`, 'Muster');
      return f.choice(mod, t, 'weiter', 'Was kommt als Nächstes?', opts[0], opts.slice(1), { svgOpts: true, pic: pic(row), shown: seq, next, why: 'So geht das Muster weiter:' });
    }
    // bauen: tier 1 a row of cubes, tier 2 a building with its Bauplan from Die Baustelle
    if (t === 1) { const hs = Array.from({ length: rnd(2, 4) }, () => rnd(1, 3)); return f.num(mod, t, 'reihe', [hs.reduce((a, b) => a + b, 0)], { svg: towerSVG(hs), ask: 'Wie viele Würfel sind es?', plan: [hs], k12: false }); }
    const w = Q.BAU.generate('wz', 1); return f.num(mod, t, 'bauplan', w.answers, { svg: w.svg, ask: w.ask, plan: w.plan, k12: false });
  }
  register('formen1', {
    grade: 1, title: 'Formen und Lage', icon: '🔷', sub: 'Links und rechts, Dreieck, Quadrat und Kreis, Würfel und Kugel, Muster und Würfeltürme',
    modules: {
      lage: { name: 'Wo ist was?', icon: '🧭', maxTier: 2, worldCap: [2], dmg: 10 },
      formen: { name: 'Flache Formen', icon: '🔺', maxTier: 2, worldCap: [2], dmg: 12 },
      koerper: { name: 'Körper', icon: '📦', maxTier: 2, worldCap: [2], dmg: 12 },
      muster: { name: 'Muster', icon: '🔁', maxTier: 2, worldCap: [2], dmg: 12 },
      bauen: { name: 'Würfeltürme', icon: '🏗️', maxTier: 2, worldCap: [2], dmg: 14 },
    },
    attacks: [{ name: 'Wegweiser', mod: 'lage' }, { name: 'Dreieckstuch', mod: 'formen' }, { name: 'Murmelbahn', mod: 'koerper' }, { name: 'Bauklotzturm', mod: 'bauen' }],
    extra: { lage: 'Wegweiser', formen: 'Dreieckstuch', koerper: 'Murmelbahn', muster: 'Mosaikstein', bauen: 'Bauklotzturm' },
    tut: {
      'lage:1': { title: 'Oben, unten, links, rechts', steps: ['Links ist die Seite, wo du beim Lesen anfängst. Rechts ist die andere Seite.', 'Im Regal: Oben ist das obere Fach, unten das untere.', 'Die Mitte liegt zwischen den beiden anderen.'] },
      'lage:2': { title: 'Neben, über, unter, zwischen', steps: ['Links neben dem Kreis ist das, was direkt links vom Kreis steht.', 'Über dem Stern liegt das, was im Regal direkt darüber liegt.', 'Zwischen zwei Dingen ist das, was in der Mitte steht.'] },
      'formen:1': { title: 'Formen erkennen', steps: ['Dreieck: drei Ecken. Kreis: rund, keine Ecken.', 'Quadrat: vier gleich lange Seiten.', 'Rechteck: zwei lange und zwei kurze Seiten.'] },
      'formen:2': { title: 'Ecken und Vierecke', steps: ['Jede Form mit vier Ecken ist ein Viereck. Quadrat und Rechteck sind besondere Vierecke.', 'Zähle die Ecken mit dem Finger: Das Dreieck hat 3.', 'Beim Zählen tippst du jede Form nur einmal an.'] },
      'koerper:1': { title: 'Würfel, Quader, Kugel', steps: ['Ein Würfel hat 6 gleich große Quadrate als Flächen.', 'Ein Quader sieht aus wie ein Kasten. Seine Flächen sind nicht alle gleich groß.', 'Eine Kugel ist rund und hat keine Ecken.'] },
      'koerper:2': { title: 'Körper um uns herum', steps: ['Ein Ball ist eine Kugel. Ein Schuhkarton ist ein Quader.', 'Würfel und Quader haben 8 Ecken und 6 Flächen.', 'Manche Ecken sind im Bild versteckt. Denk sie dir hinten dazu.'] },
      'muster:1': { title: 'Muster fortsetzen', steps: ['Ein Muster wiederholt sich immer wieder.', 'Beispiel: Kreis, Dreieck, Kreis, Dreieck. Danach kommt wieder ein Kreis.', 'Sprich das Muster leise mit.'] },
      'muster:2': { title: 'Längere Muster', steps: ['Suche das Stück, das sich wiederholt.', 'Beispiel: Kreis, Kreis, Stern, Kreis, Kreis, Stern. Das Stück ist Kreis, Kreis, Stern.', 'Zähle, wo du im Stück gerade bist.'] },
      'bauen:1': { title: 'Würfel zählen', steps: ['Zähle jeden Turm von unten nach oben.', 'Rechne dann alle Türme zusammen.', 'Beispiel: 2 Würfel und 3 Würfel sind 5 Würfel.'] },
      'bauen:2': { title: 'Der Bauplan', steps: ['Der Bauplan zeigt das Gebäude von oben.', 'Die Zahl in einem Feld sagt, wie viele Würfel dort übereinander stehen.', 'Rechne alle Zahlen zusammen: 2 + 1 + 3 = 6.'] },
    },
    notes: {
      lage: { title: 'Wo ist was?', lines: ['links – Mitte – rechts', 'oben – Mitte – unten'] },
      formen: { title: 'Flache Formen', lines: ['Dreieck: 3 Ecken', 'Quadrat und Rechteck: 4 Ecken', 'Kreis: keine Ecke'] },
      koerper: { title: 'Körper', lines: ['Würfel und Quader: 8 Ecken, 6 Flächen', 'Kugel: rund, keine Ecke'] },
      muster: { title: 'Muster', lines: ['Ein Muster wiederholt sich.', 'Suche das Stück, das immer wiederkommt.'] },
      bauen: { title: 'Würfel zählen', lines: ['Jeden Turm von unten zählen.', 'Dann alle Türme zusammenrechnen.'] },
    },
    events: [
      ev('Das Spielzeugregal', 'Im Klassenzimmer räumt eine Lehrerin das Regal auf. Sagst du ihr, wo alles liegt, schenkt sie dir einen Trank.', 'Helfen', 'lage', { item: 'trank' }, { hp: -5 }),
      ev('Die Bastelecke', 'Ein Mädchen schneidet Formen aus Papier aus. Sie fragt dich nach einem Namen.', 'Antworten', 'formen', { xp: 20 }, { xp: 5 }),
      ev('Die Perlenkette', 'Am Basteltisch fädelt ein Junge ein Muster auf. Wer es fortsetzt, bekommt eine Chilischote.', 'Muster fortsetzen', 'muster', { item: 'keks' }, { hp: -5 }),
      ev('Die Bauklötze', 'In der Bauecke steht ein Turm aus Würfeln. Zählst du die Würfel, bekommst du einen Schild.', 'Würfel zählen', 'bauen', { item: 'schild' }, { hp: -5 }),
      restEv('Die Turnmatte', 'In der Turnhalle liegt eine weiche Matte. Du legst dich kurz hin.'),
    ],
  }, genForm);

  /* ================= ZAHLEN BIS 100 (Klasse 2) ================= */
  const h = maker('z100');
  // Zehnerstangen and Einerwürfel
  function blocksSVG(n) {
    const tens = Math.floor(n / 10), ones = n % 10, U = 11; let b = '';
    for (let i = 0; i < tens; i++) b += `<g class="ten">${range(0, 9).map((k) => `<rect x="${2 + i * 16}" y="${2 + k * U}" width="${U}" height="${U}" fill="#7CC2FF" stroke="${OUT}" stroke-width="1.2"/>`).join('')}</g>`;
    const x0 = 2 + tens * 16 + 8;
    for (let k = 0; k < ones; k++) b += `<rect class="one" x="${x0 + (k % 3) * 14}" y="${2 + 10 * U - (Math.floor(k / 3) + 1) * 14 + 3}" width="${U}" height="${U}" fill="#FFD84A" stroke="${OUT}" stroke-width="1.2"/>`;
    return svgOf(x0 + 44, 10 * U + 4, b, 'Zehnerstangen und Einerwürfel');
  }
  function hundredSVG(n) {
    const C = 12; let b = '';
    for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), c = i % 10, x = 8 + c * C + (c >= 5 ? 4 : 0), y = 8 + r * C + (r >= 5 ? 4 : 0);
      b += i < n ? dot(x, y, 4.6, c < 5 ? RED : BLUE) : `<circle cx="${x}" cy="${y}" r="4.6" fill="#fff" stroke="#B8C2D9" stroke-width="1"/>`; }
    return svgOf(130, 130, b, 'Hunderterfeld', height(170));
  }
  // a piece of the Zahlenstrahl from one Zehner to the next, arrow at `at`
  function lineSVG(from, at) {
    const C = 26, X = (v) => 14 + (v - from) * C; let b = `<path d="M6 40 H${X(from + 10) + 8}" stroke="${OUT}" stroke-width="2.5"/>`;
    for (let v = from; v <= from + 10; v++) b += `<path d="M${X(v)} ${v % 5 ? 34 : 30} V46" stroke="${OUT}" stroke-width="${v % 5 ? 1.5 : 2.5}"/>` + (v % 5 ? '' : `<text x="${X(v)}" y="62" text-anchor="middle" font-size="13" font-weight="700" fill="${OUT}">${v}</text>`);
    return svgOf(X(from + 10) + 16, 66, `${b}<path class="arrow" data-at="${at}" d="M${X(at)} 30 l-7 -14 h14 Z" fill="${RED}" stroke="${OUT}" stroke-width="1.5" stroke-linejoin="round"/>`, 'Zahlenstrahl mit Pfeil');
  }
  // Lo-Shu square, turned or mirrored, times k plus c: every row, column and diagonal has the same sum
  const LOSHU = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
  function magicTask(t) {
    const k = rnd(1, 5), c = rnd(0, Math.floor((99 - 15 * k) / 3)); let g = LOSHU.map((r) => r.slice());
    for (let i = rnd(0, 3); i > 0; i--) g = g[0].map((_, j) => g.map((r) => r[j]).reverse());
    if (Math.random() < 0.5) g = g.map((r) => r.slice().reverse());
    g = g.map((r) => r.map((v) => v * k + c)); const sum = 3 * (5 * k + c), miss = rnd(0, 8);
    const cells = g.flat().map((v, i) => `<g data-v="${i === miss ? '?' : v}"><rect x="${2 + (i % 3) * 44}" y="${2 + Math.floor(i / 3) * 44}" width="44" height="44" fill="${i === miss ? '#FFE27A' : '#fff'}" stroke="${OUT}" stroke-width="2"/><text x="${24 + (i % 3) * 44}" y="${31 + Math.floor(i / 3) * 44}" text-anchor="middle" font-size="20" font-weight="700" fill="${OUT}">${i === miss ? '?' : g.flat()[i]}</text></g>`).join('');
    return h.num('dreieck', t, 'zauber', [g.flat()[miss]], { svg: svgOf(136, 136, cells, 'Zauberquadrat', height(150)), ask: `Jede Reihe und jede Spalte ergibt ${sum}. Welche Zahl fehlt?`, sum });
  }
  function genZ100(mod, t) {
    if (mod === 'stelle') {
      const n = rnd(11, 99);
      if (t === 1) {
        const r = Math.random();
        if (r < 0.5) return h.num(mod, t, 'stangen', [n], { svg: blocksSVG(n), ask: 'Welche Zahl ist das?' });
        if (r < 0.75) return h.num(mod, t, 'ze', [n], { text: `${Math.floor(n / 10)} Z ${n % 10} E = ?`, ask: 'Z heißt Zehner, E heißt Einer.' });
        return h.num(mod, t, 'zerlegen', [Math.floor(n / 10), n % 10], { text: `${n}`, ask: 'Wie viele Zehner und Einer?', labels: ['Zehner', 'Einer'] });
      }
      const k = rnd(21, 99);
      if (Math.random() < 0.5) return h.num(mod, t, 'feld', [k], { svg: hundredSVG(k), ask: 'Wie viele Punkte sind es?' });
      return h.num(mod, t, 'bis100', [100 - k], { svg: hundredSVG(k), ask: 'Wie viele Punkte fehlen bis 100?' });
    }
    if (mod === 'zehner') {
      const r = Math.random();
      if (r < 0.45) { let n; do n = rnd(11, 99); while (n % 10 === 0); const lo = n - (n % 10); return h.num(mod, t, 'zehner', [lo, lo + 10], { nb: 'Zehner', n, text: `${n}`, k12: false }); }
      if (r < 0.65) { const n = rnd(2, 98); return h.num(mod, t, 'nachbarn', [n - 1, n + 1], { nb: 'Nachbar', n, text: `${n}` }); }
      const from = 10 * rnd(0, 9); let a; do a = from + rnd(1, 9); while (a === from + 5);
      return h.num(mod, t, 'strahl', [a], { svg: lineSVG(from, a), ask: 'Welche Zahl zeigt der Pfeil?' });
    }
    if (mod === 'gerade') {
      const r = Math.random(); const odd = (n) => n % 2 === 1;
      if (r < 0.35) { const n = rnd(1, 99); return h.choice(mod, t, 'gu', `Ist ${n} gerade oder ungerade?`, odd(n) ? 'ungerade' : 'gerade', [], { options: ['gerade', 'ungerade'], cols: 2, why: `${n} endet auf ${n % 10}. ${n % 10} ist ${odd(n) ? 'ungerade' : 'gerade'}.` }); }
      if (r < 0.65) {
        const want = Math.random() < 0.5; const one = () => { let n; do n = rnd(1, 99); while (odd(n) !== !want); return n; };
        const right = one(); let w; do w = [rnd(1, 99), rnd(1, 99)]; while (w.some((n) => odd(n) === !want) || w[0] === w[1]);
        return h.choice(mod, t, 'welche', `Welche Zahl ist ${want ? 'gerade' : 'ungerade'}?`, `${right}`, w.map(String), { why: `${right} endet auf ${right % 10}.` });
      }
      if (r < 0.85) { const n = 2 * rnd(6, 50); return h.num(mod, t, 'halbieren', [n / 2], { text: `${n}`, ask: 'Halbiere die Zahl.', k12: false }); }
      const n = rnd(6, 50); return h.num(mod, t, 'verdoppeln', [2 * n], { text: `${n}`, ask: 'Verdopple die Zahl.', k12: false });
    }
    if (mod === 'folge') {
      let step, start;
      if (t === 1) { step = pick([2, 5, 10]); start = step === 2 ? rnd(0, 88) : step * rnd(0, Math.floor((100 - 6 * step) / step)); }
      else { step = pick([3, 4, 10, -2, -5, -10]); start = step < 0 ? rnd(-6 * step, 100) : rnd(1, 100 - 6 * step); }
      const seq = range(0, 6).map((i) => start + i * step);
      return h.num(mod, t, step < 0 ? 'rueckwaerts' : 'vorwaerts', seq.slice(4), { seq: seq.slice(0, 4), text: seq.slice(0, 4).join(', ') + ', …', k12: false });
    }
    if (mod === 'plus' || mod === 'minus') {
      // a + b for plus, (a + b) − b for minus: the same pairs cross a Zehner or not in both directions
      const r = Math.random(); let a, b;
      const two = (crossing) => { const za = rnd(1, 7), zb = rnd(1, 8 - za), ea = crossing ? rnd(1, 9) : rnd(0, 8), eb = crossing ? rnd(10 - ea, 9) : rnd(1, 9 - ea); return [10 * za + ea, 10 * zb + eb]; };
      if (t === 1) {
        if (r < 0.4) { a = 10 * rnd(1, 8) + rnd(0, 8); b = rnd(1, 9 - (a % 10)); }
        else if (r < 0.7) { a = 10 * rnd(1, 8); b = 10 * rnd(1, 10 - a / 10); }
        else { a = 10 * rnd(1, 7) + rnd(1, 9); b = 10 * rnd(1, 9 - Math.floor(a / 10)); }
      } else if (t === 2) {
        if (r < 0.5) { a = 10 * rnd(1, 8) + rnd(2, 9); b = rnd(10 - (a % 10), 9); } else [a, b] = two(false);
      } else {
        if (r < 0.25) { a = rnd(11, 98); if (a % 10 === 0) a++; const goal = Math.random() < 0.5 ? 100 : a - (a % 10) + 10; return h.num(mod, t, 'ergaenzen', [goal - a], { text: `${a} + ? = ${goal}` }); }
        [a, b] = two(true);
      }
      if (mod === 'plus') return h.num(mod, t, 'plus', [a + b], { text: `${a} + ${b} = ?`, k12: false });
      if (t === 3 && Math.random() < 0.3) return h.num(mod, t, 'luecke', [b], { text: `${a + b} − ? = ${a}`, k12: false });
      return h.num(mod, t, 'minus', [a], { text: `${a + b} − ${b} = ?`, k12: false });
    }
    // dreieck: Rechendreieck, in tier 2 also the Zauberquadrat
    if (t === 2 && Math.random() < 0.5) return magicTask(t);
    const hi = t === 1 ? 25 : 45; return triTask(h, mod, t, [rnd(1, hi), rnd(1, hi), rnd(1, hi)], t === 1 ? rnd(3, 5) : rnd(0, 2));
  }
  register('zahlen100', {
    grade: 2, title: 'Zahlen bis 100', icon: '🔢', sub: 'Zehner und Einer, Zahlenstrahl, gerade Zahlen, Zahlenfolgen, plus und minus bis 100',
    modules: {
      stelle: { name: 'Zehner und Einer', icon: '🧮', maxTier: 2, worldCap: [2], dmg: 10 },
      zehner: { name: 'Zahlenstrahl', icon: '↔️', maxTier: 1, worldCap: [1], dmg: 10 },
      gerade: { name: 'Gerade und ungerade', icon: '✌️', maxTier: 1, worldCap: [1], dmg: 10 },
      folge: { name: 'Zahlenfolgen', icon: '📶', maxTier: 2, worldCap: [2], dmg: 12 },
      plus: { name: 'Plus bis 100', icon: '➕', maxTier: 3, worldCap: [3], dmg: 14 },
      minus: { name: 'Minus bis 100', icon: '➖', maxTier: 3, worldCap: [3], dmg: 14 },
      dreieck: { name: 'Rechendreiecke', icon: '🔺', maxTier: 2, worldCap: [2], dmg: 16 },
    },
    attacks: [{ name: 'Zehnerstange', mod: 'stelle' }, { name: 'Hunderterkette', mod: 'plus' }, { name: 'Rückwärtsschritt', mod: 'minus' }, { name: 'Dreieckszacke', mod: 'dreieck' }],
    extra: { stelle: 'Zehnerstange', zehner: 'Zehnersprung', gerade: 'Paarweise', folge: 'Hüpfkästchen', plus: 'Hunderterkette', minus: 'Rückwärtsschritt', dreieck: 'Dreieckszacke' },
    tut: {
      'stelle:1': { title: 'Zehner und Einer', steps: ['Eine Stange hat 10 Würfel: Das ist ein Zehner. Ein einzelner Würfel ist ein Einer.', 'Zähle erst die Zehner: 10, 20, 30. Dann die Einer dazu.', 'Beispiel: 4 Stangen und 7 Würfel sind 47. 47 hat 4 Zehner und 7 Einer.'] },
      'stelle:2': { title: 'Das Hunderterfeld', steps: ['Das Hunderterfeld hat 10 Reihen mit je 10 Punkten.', 'Jede volle Reihe ist ein Zehner. Zähle die vollen Reihen, dann die Punkte in der letzten Reihe.', 'Bis 100 fehlen die leeren Kreise: 100 − 63 = 37.'] },
      'zehner:1': { title: 'Nachbarzehner und Zahlenstrahl', steps: ['Die Nachbarzehner von 47 sind 40 und 50.', 'Auf dem Zahlenstrahl ist jeder Strich eine Zahl weiter. Der lange Strich in der Mitte ist die 5.', 'Beispiel: Der Pfeil steht 2 Striche hinter der 30. Er zeigt auf 32.'] },
      'gerade:1': { title: 'Gerade und ungerade', steps: ['Gerade Zahlen enden auf 0, 2, 4, 6 oder 8. Ungerade auf 1, 3, 5, 7 oder 9.', 'Gerade Zahlen kann man halbieren, ohne dass etwas übrig bleibt.', 'Beispiel: 46 ist gerade. 46 halbiert ist 23, denn 23 + 23 = 46.'] },
      'folge:1': { title: 'In Schritten zählen', steps: ['Schau, wie viel von einer Zahl zur nächsten dazukommt.', 'Beispiel: 15, 20, 25, 30. Es kommen immer 5 dazu.', 'Weiter geht es mit 35, 40, 45.'] },
      'folge:2': { title: 'Zahlenfolgen', steps: ['Manchmal kommt etwas dazu, manchmal geht etwas weg.', 'Beispiel: 80, 75, 70, 65. Es gehen immer 5 weg.', 'Weiter geht es mit 60, 55, 50.'] },
      'plus:1': { title: 'Plus mit Zehnern', steps: ['Zehner rechnest du wie Einer: 30 + 40 = 70, denn 3 + 4 = 7.', 'Einer dazu: 34 + 5. Rechne 4 + 5 = 9, also 39.', 'Zehner dazu: 34 + 20. Rechne 30 + 20 = 50, also 54.'] },
      'plus:2': { title: 'Plus bis 100', steps: ['Über den Zehner: 38 + 5. Bis 40 sind es 2, dann noch 3. Also 43.', 'Zwei Zahlen mit Zehnern: 34 + 25. Erst 34 + 20 = 54, dann + 5 = 59.', 'Rechne in Schritten und schreib dir Zwischenergebnisse auf.'] },
      'plus:3': { title: 'Plus in Schritten', steps: ['38 + 27: Erst die Zehner dazu, 38 + 20 = 58.', 'Dann die Einer: 58 + 2 = 60, dann noch 5. Also 65.', 'Ergänzen: 64 + ? = 100. Bis 70 sind es 6, bis 100 noch 30. Also 36.'] },
      'minus:1': { title: 'Minus mit Zehnern', steps: ['Zehner weg: 70 − 30 = 40, denn 7 − 3 = 4.', 'Einer weg: 48 − 5. Rechne 8 − 5 = 3, also 43.', 'Zehner weg: 56 − 20. Rechne 50 − 20 = 30, also 36.'] },
      'minus:2': { title: 'Minus bis 100', steps: ['Über den Zehner: 43 − 5. Bis 40 sind es 3, dann noch 2 weg. Also 38.', 'Zwei Zahlen mit Zehnern: 59 − 25. Erst 59 − 20 = 39, dann − 5 = 34.', 'Prüfe mit Plus: 34 + 25 = 59.'] },
      'minus:3': { title: 'Minus in Schritten', steps: ['65 − 27: Erst die Zehner weg, 65 − 20 = 45.', 'Dann die Einer: 45 − 5 = 40, dann noch 2 weg. Also 38.', 'Bei 65 − ? = 38 fragst du: Was muss weg, damit 38 übrig bleibt?'] },
      'dreieck:1': { title: 'Rechendreiecke', steps: ['Innen stehen drei Zahlen. Außen steht, was die zwei Zahlen innen daneben zusammen ergeben.', 'Beispiel: innen 12 und 7. Außen dazwischen steht 19.', 'Fehlt außen eine Zahl, rechnest du plus.'] },
      'dreieck:2': { title: 'Rätsel mit Rechendreiecken', steps: ['Fehlt innen eine Zahl, rechnest du minus: außen 30, innen daneben 12. Dann fehlt 30 − 12 = 18.', 'Im Zauberquadrat ergibt jede Reihe und jede Spalte dieselbe Zahl.', 'Rechne die zwei Zahlen neben dem Fragezeichen zusammen. Was fehlt bis zur Summe, ist die Lösung.'] },
    },
    notes: {
      stelle: { title: 'Zehner und Einer', lines: ['47 = 4 Zehner und 7 Einer', '47 = 40 + 7'] },
      zehner: { title: 'Nachbarzehner', lines: ['Die Nachbarzehner von 47 sind 40 und 50.', 'Die Nachbarzahlen von 47 sind 46 und 48.'] },
      gerade: { title: 'Gerade Zahlen', lines: ['gerade: endet auf 0, 2, 4, 6, 8', 'ungerade: endet auf 1, 3, 5, 7, 9'] },
      folge: { title: 'Zahlenfolgen', lines: ['Was kommt jedes Mal dazu oder geht weg?', '15, 20, 25, 30 – immer + 5'] },
      plus: { title: 'Plus in Schritten', lines: ['38 + 27 = 38 + 20 + 7', '58 + 7 = 58 + 2 + 5 = 65'] },
      minus: { title: 'Minus in Schritten', lines: ['65 − 27 = 65 − 20 − 7', '45 − 7 = 45 − 5 − 2 = 38'] },
      dreieck: { title: 'Rechendreieck', lines: ['Außen: die zwei Zahlen innen daneben zusammen.', 'Fehlt innen etwas: außen minus innen.'] },
    },
    events: [
      ev('Der Bücherturm', 'In der Schulbücherei stapelt ein Bibliothekar Bücher in Zehnerpacken. Zählst du mit, gibt er dir einen Trank.', 'Mitzählen', 'stelle', { item: 'trank' }, { hp: -5 }),
      ev('Das Hüpfkästchen', 'Auf dem Schulhof sind Zahlen auf den Boden gemalt. Ein Mädchen fragt, wie die Reihe weitergeht.', 'Weiterzählen', 'folge', { xp: 20 }, { xp: 5 }),
      ev('Die Schulkasse', 'Die Sekretärin zählt das Geld für den Wandertag. Rechnest du mit, verrät sie dir eine Eselsbrücke.', 'Mitrechnen', 'plus', { item: 'lupe' }, { xp: 5 }),
      ev('Das Rätselheft', 'Auf einer Bank liegt ein Heft mit Rechendreiecken. Löst du eins, findest du darin einen Schild.', 'Rätsel lösen', 'dreieck', { item: 'schild' }, { hp: -5 }),
      restEv('Die Bank im Schulgarten', 'Unter dem Apfelbaum im Schulgarten steht eine Bank. Du ruhst dich aus.'),
    ],
  }, genZ100);

  /* ================= MALNEHMEN UND TEILEN (Klasse 2) ================= */
  const m = maker('mal');
  const CORE = [2, 5, 10];
  // neighbour tasks: the row asked for and the core row next to it
  const NEAR = [[3, 2], [4, 5], [6, 5], [9, 10]];
  function arraySVG(r, c) {
    const C = 20; let b = '';
    for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) b += dot(12 + j * C + (j >= 5 ? 6 : 0), 12 + i * C, 7, i % 2 ? BLUE : RED);
    return svgOf(c * C + (c > 5 ? 10 : 4), r * C + 4, b, 'Punktefeld');
  }
  const STORIES_MAL = [
    (a, b) => [`${a} Teller mit je ${b} Äpfeln. Wie viele Äpfel sind es?`],
    (a, b) => [`${a} Kinder haben je ${b} Murmeln. Wie viele Murmeln sind das zusammen?`],
    (a, b) => [`Ein Heft kostet ${b} €. Wie viel kosten ${a} Hefte?`, ['€']],
    (a, b) => [`In ${a} Tüten sind je ${b} Brötchen. Wie viele Brötchen sind es?`],
  ];
  const STORIES_TEIL = [
    (n, k) => `${n} Bonbons werden an ${k} Kinder verteilt. Wie viele bekommt jedes Kind?`,
    (n, k) => `${n} Kinder bilden Gruppen zu je ${k}. Wie viele Gruppen gibt es?`,
    (n, k) => `${n} Eier kommen in Schachteln zu je ${k}. Wie viele Schachteln werden voll?`,
  ];
  function genMal(mod, t) {
    if (mod === 'reihe') {
      const a = pick(CORE), b = rnd(1, 10); const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
      if (t === 1) return m.num(mod, t, 'mal', [x * y], { text: `${x} · ${y} = ?`, k12: false });
      return m.num(mod, t, 'luecke', [b], { text: x === a ? `${a} · ? = ${a * b}` : `? · ${a} = ${a * b}`, k12: false });
    }
    if (mod === 'nachbar') {
      const b = rnd(2, 10);
      if (t === 1) { const [row, core] = pick(NEAR); return m.num(mod, t, 'nachbar', [row * b], { text: `${row} · ${b} = ?`, ask: `Tipp: ${core} · ${b} = ${core * b}`, k12: false }); }
      const [row, half] = pick([[4, 2], [6, 3], [8, 4]]); return m.num(mod, t, 'doppelt', [row * b], { text: `${row} · ${b} = ?`, ask: `Tipp: Das Doppelte von ${half} · ${b} = ${half * b}`, k12: false });
    }
    if (mod === 'bild') {
      let r, c; do { r = rnd(2, 5); c = rnd(2, 10); } while (r === c && r === 2);
      const svg = arraySVG(r, c);
      if (Math.random() < 0.5) return m.num(mod, t, 'zaehlen', [r * c], { svg, ask: 'Wie viele Punkte sind es? Rechne mal.' });
      return m.choice(mod, t, 'aufgabe', 'Welche Malaufgabe passt zum Bild?', `${r} · ${c}`, [`${r} + ${c}`, `${r} · ${c + 1}`], { pic: pic(svg), why: `${r} Reihen mit je ${c} Punkten: ${r} · ${c} = ${r * c}.` });
    }
    if (mod === 'teilen') {
      const d = t === 1 ? pick(CORE) : pick([3, 4, 6, 7, 8, 9]), q = rnd(1, 10);
      return m.num(mod, t, 'teilen', [q], t === 1 ? { text: `${d * q} : ${d} = ?`, k12: false } : { text: `${d * q} : ${d} = ?`, ask: `Tipp: ? · ${d} = ${d * q}`, k12: false });
    }
    // sach: tier 1 malnehmen, tier 2 teilen
    if (t === 1) { const a = rnd(2, 9), b = pick(CORE); const [story, labels] = pick(STORIES_MAL)(a, b); return m.num(mod, t, 'mal', [a * b], { story, labels, op: '·' }); }
    const k = pick([2, 3, 4, 5, 10]), q = rnd(2, 9); return m.num(mod, t, 'teilen', [q], { story: pick(STORIES_TEIL)(k * q, k), op: ':' });
  }
  register('malteilen', {
    grade: 2, title: 'Malnehmen und Teilen', icon: '✖️', sub: 'Die Reihen mit 2, 5 und 10, Nachbaraufgaben, Punktefelder, teilen und Sachaufgaben',
    modules: {
      reihe: { name: 'Reihen 2, 5, 10', icon: '✖️', maxTier: 2, worldCap: [2], dmg: 12 },
      nachbar: { name: 'Nachbaraufgaben', icon: '🔄', maxTier: 2, worldCap: [2], dmg: 14 },
      bild: { name: 'Punktefelder', icon: '🔘', maxTier: 1, worldCap: [1], dmg: 10 },
      teilen: { name: 'Teilen', icon: '➗', maxTier: 2, worldCap: [2], dmg: 14 },
      sach: { name: 'Sachaufgaben', icon: '🧺', maxTier: 2, worldCap: [2], dmg: 16 },
    },
    attacks: [{ name: 'Zehnerpack', mod: 'reihe' }, { name: 'Eierkarton', mod: 'bild' }, { name: 'Kuchenteller', mod: 'teilen' }, { name: 'Einkaufskorb', mod: 'sach' }],
    extra: { reihe: 'Zehnerpack', nachbar: 'Nachbarhaus', bild: 'Eierkarton', teilen: 'Kuchenteller', sach: 'Einkaufskorb' },
    tut: {
      'reihe:1': { title: 'Malaufgaben', steps: ['3 · 5 heißt: dreimal die 5. Also 5 + 5 + 5 = 15.', 'In der Reihe mit 10 hängst du eine 0 an: 4 · 10 = 40.', 'Die Fünferreihe ist die Hälfte der Zehnerreihe: 4 · 5 = 20, die Hälfte von 40.'] },
      'reihe:2': { title: 'Die fehlende Zahl', steps: ['Bei 5 · ? = 35 fragst du: Wie oft passt die 5 in 35?', 'Zähle in Fünferschritten: 5, 10, 15, 20, 25, 30, 35. Das sind 7 Schritte.', 'Also 5 · 7 = 35.'] },
      'nachbar:1': { title: 'Nachbaraufgaben', steps: ['Aus einer leichten Aufgabe wird eine schwere.', 'Beispiel: 4 · 7. Du weißt 5 · 7 = 35. Eine 7 weniger: 35 − 7 = 28.', 'Beispiel: 6 · 7. Eine 7 mehr als 5 · 7: 35 + 7 = 42.'] },
      'nachbar:2': { title: 'Verdoppeln', steps: ['4 · 6 ist das Doppelte von 2 · 6.', '2 · 6 = 12. Verdoppelt: 12 + 12 = 24.', 'Genauso: 8 · 6 ist das Doppelte von 4 · 6.'] },
      'bild:1': { title: 'Malaufgaben im Bild', steps: ['Zähle die Reihen und die Punkte in einer Reihe.', '3 Reihen mit je 4 Punkten: 3 · 4 = 12.', 'Plus passt nicht: 3 + 4 zählt nur eine Reihe und eine Spalte.'] },
      'teilen:1': { title: 'Teilen', steps: ['20 : 5 heißt: 20 in Fünfer aufteilen.', 'Frag dich: Wie oft passt die 5 in die 20? 4 · 5 = 20.', 'Also 20 : 5 = 4.'] },
      'teilen:2': { title: 'Teilen mit der Umkehraufgabe', steps: ['Zu jeder Geteiltaufgabe gehört eine Malaufgabe.', '24 : 4 = ? Frag dich: ? · 4 = 24.', '6 · 4 = 24. Also 24 : 4 = 6.'] },
      'sach:1': { title: 'Sachaufgaben', steps: ['Lies genau: Wie viele Gruppen gibt es, und wie viele sind in jeder?', '4 Teller mit je 5 Äpfeln: 4 · 5 = 20.', 'Schreib nur die Zahl in das Feld.'] },
      'sach:2': { title: 'Sachaufgaben mit Teilen', steps: ['Wird etwas gerecht verteilt, rechnest du geteilt.', '15 Bonbons an 3 Kinder: 15 : 3 = 5. Jedes Kind bekommt 5.', 'Prüfe mit der Malaufgabe: 3 · 5 = 15.'] },
    },
    notes: {
      reihe: { title: 'Kernaufgaben', lines: ['1 · 5 = 5, 2 · 5 = 10, 5 · 5 = 25, 10 · 5 = 50', 'Zehnerreihe: eine 0 anhängen.'] },
      nachbar: { title: 'Nachbaraufgaben', lines: ['4 · 7 = 5 · 7 − 7', '6 · 7 = 5 · 7 + 7', '9 · 7 = 10 · 7 − 7'] },
      bild: { title: 'Punktefeld', lines: ['Reihen mal Punkte in einer Reihe.', '3 Reihen mit je 4 Punkten: 3 · 4'] },
      teilen: { title: 'Teilen', lines: ['24 : 4 = 6, denn 6 · 4 = 24.'] },
      sach: { title: 'Sachaufgaben', lines: ['je … zusammen: mal', 'gerecht verteilen: geteilt'] },
    },
    events: [
      ev('Der Eierstand', 'Auf dem Wochenmarkt packt eine Bäuerin Eier in Kartons. Zählst du mit, schenkt sie dir einen Trank.', 'Mitzählen', 'bild', { item: 'trank' }, { hp: -5 }),
      ev('Die Geburtstagstorte', 'Ein Junge will seine Torte gerecht verteilen. Hilfst du ihm, bekommst du eine Chilischote.', 'Verteilen', 'teilen', { item: 'keks' }, { hp: -5 }),
      ev('Der Einkaufszettel', 'Ein Vater steht mit einem langen Zettel im Laden. Rechnest du mit, verrät er dir eine Eselsbrücke.', 'Mitrechnen', 'sach', { item: 'lupe' }, { xp: 5 }),
      ev('Das Turnier', 'Der Sportlehrer stellt Mannschaften auf. Wer die Reihe kennt, bekommt einen Schild.', 'Antworten', 'reihe', { item: 'schild' }, { hp: -5 }),
      restEv('Die Picknickdecke', 'Im Park liegt eine Picknickdecke in der Sonne. Du ruhst dich aus.'),
    ],
  }, genMal);

  /* ================= GELD, LÄNGE, ZEIT (Klasse 2) ================= */
  const g = maker('gr2');
  const pad = (n) => String(n).padStart(2, '0');
  const komma = (ct) => `${Math.floor(ct / 100)},${pad(ct % 100)}${NB}€`;
  // coins and notes in cent: label, colour, coin radius or note width; sizes follow the real coins and notes.
  // Euro coins have two metals: 1 € gold ring and silver core, 2 € the other way round.
  const GOLDC = '#F2C14E', SILVER = '#D3D8E3';
  const MONEY = { 1: ['1 ct', '#D9864A', 13], 2: ['2 ct', '#D9864A', 15], 5: ['5 ct', '#D9864A', 17], 10: ['10 ct', GOLDC, 16], 20: ['20 ct', GOLDC, 18], 50: ['50 ct', GOLDC, 20],
    100: ['1 €', GOLDC, 19, SILVER], 200: ['2 €', SILVER, 21, GOLDC], 500: ['5 €', '#C3C7CF', 0, 64], 1000: ['10 €', '#F2A0A0', 0, 67], 2000: ['20 €', '#9CC4F0', 0, 70], 5000: ['50 €', '#F7B877', 0, 73] };
  function moneySVG(vals) {
    let x = 4, y = 4, rowH = 0, b = '';
    for (const v of vals) { const [label, fill, r, extra] = MONEY[v]; const w = r ? 2 * r : extra, hh = r ? 2 * r : Math.round(extra * 0.53); if (x + w > 300) { x = 4; y += rowH + 6; rowH = 0; }
      const coin = r && `<circle cx="${x + r}" cy="${y + r}" r="${r}" fill="${fill}" stroke="${OUT}" stroke-width="2"/>${extra ? `<circle cx="${x + r}" cy="${y + r}" r="${r - 5}" fill="${extra}" stroke="${OUT}" stroke-width="1"/>` : `<circle cx="${x + r}" cy="${y + r}" r="${r - 2.5}" fill="none" stroke="#fff" stroke-width="1" opacity=".5"/>`}`;
      const note = !r && `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="4" fill="${fill}" stroke="${OUT}" stroke-width="2"/><path d="M${x + 5} ${y + 5} h${w - 10} v${hh - 10} h${-(w - 10)} Z" fill="none" stroke="#fff" stroke-width="1.2" opacity=".7"/><circle cx="${x + w - 12}" cy="${y + hh / 2}" r="6" fill="#fff" opacity=".45"/>`;
      b += `<g class="money" data-ct="${v}">${coin || note}<text x="${x + (r ? w / 2 : w / 2 - 5)}" y="${y + hh / 2 + 5}" text-anchor="middle" font-size="${r ? 11 : 15}" font-weight="700" fill="${OUT}">${label}</text></g>`;
      x += w + 6; rowH = Math.max(rowH, hh); }
    return svgOf(304, y + rowH + 4, b, 'Geld');
  }
  // 1 and c hundredths written wrongly: digits swapped, comma one place off, a zero too many
  const mixups = (c, u) => { const right = `1,${pad(c)}${NB}${u}`; return [...new Set([`1,${pad(c).split('').reverse().join('')}${NB}${u}`, `${10 + Math.floor(c / 10)},${c % 10}${NB}${u}`, `10,${pad(c)}${NB}${u}`])].filter((x) => x !== right).slice(0, 2); };
  const coins = (from, k, max) => { let vs; do vs = Array.from({ length: k }, () => pick(from)).sort((a, b) => b - a); while (vs.reduce((a, b) => a + b, 0) > max); return vs; };
  function rulerSVG(cm) {
    const px = 22, x0 = 14, x1 = x0 + cm * px; let marks = '';
    for (let i = 0; i <= 12; i++) marks += `<path d="M${x0 + i * px} 52 V${i % 5 ? 62 : 66}" stroke="${OUT}" stroke-width="1.5"/><text x="${x0 + i * px}" y="78" text-anchor="middle" font-size="10" fill="${OUT}">${i}</text>`;
    return svgOf(300, 86, `<rect x="4" y="50" width="292" height="32" rx="4" fill="#F7E3A1" stroke="${OUT}" stroke-width="2"/>${marks}<g class="thing" data-x0="${x0}" data-x1="${x1}" data-px="${px}"><path d="M${x0} 24 H${x1 - 14} L${x1} 33 L${x1 - 14} 42 H${x0} Z" fill="#FFD84A" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/><path d="M${x1 - 5} 30 L${x1} 33 L${x1 - 5} 36 Z" fill="${OUT}"/><path d="M${x0} 24 h6 v18 h-6 Z" fill="#FF8FA3" stroke="${OUT}" stroke-width="2"/></g>`, 'Lineal mit Stift');
  }
  // estimate: first option is right, the others are off by a factor of 10 or more
  const LENGTHS = [['ein Bleistift', '15 cm', '15 m', '15 mm'], ['eine Tür', '2 m', '2 cm', '20 m'], ['eine Ameise', '5 mm', '5 cm', '5 m'], ['ein Schulheft', '30 cm', '3 m', '3 mm'], ['ein Bus', '12 m', '12 cm', '120 m'],
    ['eine Büroklammer', '3 cm', '3 m', '3 mm'], ['ein Kind aus der 2. Klasse', '1,25 m', '12 cm', '12 m'], ['ein Radiergummi', '4 cm', '4 m', '4 mm'], ['ein Fußballtor', '7 m', '7 cm', '70 m']];
  const WD = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const FACTS = [['Wie viele Tage hat eine Woche?', 7], ['Wie viele Monate hat ein Jahr?', 12], ['Wie viele Minuten hat eine Stunde?', 60], ['Wie viele Stunden hat ein Tag?', 24]];
  const ORD = ['erste', 'zweite', 'dritte'];
  function calSVG(mi, first) {
    const C = 30; let b = `<text x="${3.5 * C + 2}" y="18" text-anchor="middle" font-size="16" font-weight="700" fill="${OUT}">${MONTHS[mi]}</text>`;
    WD.forEach((d, i) => { b += `<text x="${2 + i * C + C / 2}" y="40" text-anchor="middle" font-size="12" font-weight="700" fill="${i > 4 ? RED : OUT}">${d.slice(0, 2)}</text>`; });
    for (let d = 1; d <= MDAYS[mi]; d++) { const i = first + d - 1, x = 2 + (i % 7) * C, y = 46 + Math.floor(i / 7) * 26;
      b += `<g data-day="${d}" data-wd="${i % 7}"><rect x="${x}" y="${y}" width="${C}" height="26" fill="#fff" stroke="#B8C2D9"/><text x="${x + C / 2}" y="${y + 18}" text-anchor="middle" font-size="13" fill="${OUT}">${d}</text></g>`; }
    return svgOf(7 * C + 4, 46 + Math.ceil((first + MDAYS[mi]) / 7) * 26 + 4, b, `Kalenderblatt ${MONTHS[mi]}`, height(180));
  }
  // Strichliste: four strokes and the fifth across them
  function tallySVG(rows) {
    let b = '';
    rows.forEach(([label, n], i) => { const y = 8 + i * 32; let s = '';
      for (let k = 0; k < n; k++) { const grp = Math.floor(k / 5), x = 104 + grp * 40 + (k % 5) * 7; s += k % 5 === 4 ? `<path class="s" d="M${x - 31} ${y + 18} L${x + 1} ${y + 4}" stroke="${OUT}" stroke-width="2.5" stroke-linecap="round"/>` : `<path class="s" d="M${x} ${y} V${y + 22}" stroke="${OUT}" stroke-width="2.5" stroke-linecap="round"/>`; }
      b += `<g class="tally" data-n="${n}"><text x="4" y="${y + 17}" font-size="14" font-weight="700" fill="${OUT}">${label}</text>${s}</g><path d="M2 ${y + 28} H298" stroke="#B8C2D9"/>`; });
    return svgOf(300, rows.length * 32 + 8, b, 'Strichliste');
  }
  // label on the chart, what the question says, and the question
  const DATA = [
    { title: 'Lieblingsobst', rows: ['Äpfel', 'Birnen', 'Bananen', 'Kirschen'], read: (x) => `Wie viele Kinder mögen ${x} am liebsten?`, top: 'Welches Obst mögen die meisten Kinder?', diff: (x, y) => `Wie viele Kinder mehr mögen ${x} als ${y}?` },
    { title: 'So kommen wir zur Schule', rows: ['zu Fuß', 'Fahrrad', 'Bus', 'Auto'], say: { 'zu Fuß': 'zu Fuß', Fahrrad: 'mit dem Fahrrad', Bus: 'mit dem Bus', Auto: 'mit dem Auto' }, read: (x) => `Wie viele Kinder kommen ${x}?`, top: 'Wie kommen die meisten Kinder zur Schule?', diff: (x, y) => `Wie viele Kinder mehr kommen ${x} als ${y}?` },
  ];
  const COLORS = { rot: 'Rot', blau: 'Blau', gelb: 'Gelb', gruen: 'Grün' };
  const EVENTS = [['Du würfelst eine 7.', 'unmöglich'], ['Du würfelst eine Zahl unter 7.', 'sicher'], ['Du würfelst eine 6.', 'möglich'], ['Nach Montag kommt Dienstag.', 'sicher'], ['Morgen regnet es.', 'möglich'],
    ['Eine Katze fliegt zum Mond.', 'unmöglich'], ['Eine Münze zeigt Zahl.', 'möglich'], ['Nach dem Winter kommt der Frühling.', 'sicher'], ['Ein Jahr hat 13 Monate.', 'unmöglich'], ['Du würfelst eine gerade Zahl.', 'möglich']];
  const SMU = ['sicher', 'möglich', 'unmöglich'];
  function genGr2(mod, t) {
    if (mod === 'geld') {
      const r = Math.random();
      if (t === 1) {
        if (r < 0.5) { const vs = coins([100, 200, 500, 1000, 2000, 5000], rnd(2, 5), 10000); return g.num(mod, t, 'euro', [vs.reduce((a, b) => a + b, 0) / 100], { svg: moneySVG(vs), ask: 'Wie viel Geld ist das?', labels: ['€'] }); }
        const vs = coins([1, 2, 5, 10, 20, 50], rnd(2, 5), 99); return g.num(mod, t, 'cent', [vs.reduce((a, b) => a + b, 0)], { svg: moneySVG(vs), ask: 'Wie viel Geld ist das?', labels: ['ct'] });
      }
      if (r < 0.25) { const ct = 100 + 5 * rnd(1, 19); return g.num(mod, t, 'komma', [ct], { text: `${komma(ct)} = ? ct`, long: true }); }
      if (r < 0.45) { const c = 5 * rnd(1, 19), ct = 100 + c; return g.choice(mod, t, 'schreiben', `Wie schreibt man ${ct} ct mit Komma?`, komma(ct), mixups(c, '€'), { why: `${ct} ct = 1 € und ${c} ct = ${komma(ct)}` }); }
      if (r < 0.65) { const [from, coin, n] = pick([['1 €', '10-ct', 10], ['1 €', '20-ct', 5], ['1 €', '50-ct', 2], ['2 €', '1-€', 2], ['2 €', '50-ct', 4], ['5 €', '1-€', 5], ['10 €', '2-€', 5], ['10 €', '1-€', 10], ['1 €', '5-ct', 20]]); return g.num(mod, t, 'wechseln', [n], { story: `Du wechselst ${from.replace(' ', NB)} in ${coin}-Münzen. Wie viele Münzen bekommst du?`, change: [from, coin] }); }
      if (r < 0.85) { const pay = pick([10, 20, 50, 100]), p = rnd(Math.ceil(pay / 2), pay - 1); return g.num(mod, t, 'rueckgeld', [pay - p], { story: `${pick(['Ein Ball', 'Ein Buch', 'Ein Puzzle', 'Eine Mütze'])} kostet ${p}${NB}€. Du gibst ${pay}${NB}€. Wie viel bekommst du zurück?`, labels: ['€'] }); }
      const vs = coins([200, 100], rnd(1, 2), 200).concat(coins([50, 20, 10, 5, 2, 1], rnd(1, 3), 99)); const s = vs.reduce((a, b) => a + b, 0);
      return g.num(mod, t, 'gemischt', [s], { svg: moneySVG(vs), ask: 'Wie viel Cent sind das?', labels: ['ct'], show: `${s} ct = ${komma(s)}` });
    }
    if (mod === 'laenge') {
      const r = Math.random();
      if (t === 1) {
        if (r < 0.3) { const cm = rnd(3, 12); return g.num(mod, t, 'lineal', [cm], { svg: rulerSVG(cm), ask: 'Wie lang ist der Stift?', labels: ['cm'] }); }
        if (r < 0.75) { const d = rnd(1, 9), c = rnd(1, 9), a = 10 * rnd(1, 9); const [text, ans] = pick([['1 m = ? cm', 100], ['1 m = ? dm', 10], [`${d} dm = ? cm`, 10 * d], [`${10 * d} cm = ? dm`, d], [`${c} cm = ? mm`, 10 * c], [`${a} cm + ? cm = 1 m`, 100 - a]]); return g.num(mod, t, 'umrechnen', [ans], { text, long: true }); }
        const [A, va, B, vb] = pick([() => { const d = rnd(1, 9), c = pick([10 * d, 10 * d + rnd(1, 9), 10 * d - rnd(1, 9)]); return [`${d} dm`, 10 * d, `${c} cm`, c]; }, () => { const c = pick([100, 10 * rnd(5, 9), rnd(91, 99)]); return ['1 m', 100, `${c} cm`, c]; }, () => { const c = rnd(1, 9), mm = pick([10 * c, 10 * c + rnd(1, 9), 10 * c - rnd(1, 9)]); return [`${c} cm`, 10 * c, `${mm} mm`, mm]; }])();
        const [x, y] = shuffle([[A, va], [B, vb]]); const same = 'Beide gleich lang';
        return g.choice(mod, t, 'vergleich', 'Was ist länger?', va === vb ? same : va > vb ? A : B, [], { options: [x[0], y[0], same], why: `${A} und ${B}: ${va === vb ? 'gleich lang' : `${va > vb ? A : B} ist länger`}.` });
      }
      if (r < 0.3) { const c = 5 * rnd(1, 19); return g.num(mod, t, 'komma', [100 + c], { text: `1,${pad(c)} m = ? cm`, long: true }); }
      if (r < 0.5) { const c = rnd(1, 99); return g.num(mod, t, 'zwei', [100 + c], { text: `1 m ${c} cm = ? cm`, long: true }); }
      if (r < 0.7) { const c = 5 * rnd(1, 19), cm = 100 + c; return g.choice(mod, t, 'schreiben', `Wie schreibt man ${cm} cm mit Komma?`, `1,${pad(c)}${NB}m`, mixups(c, 'm'), { why: `${cm} cm = 1 m und ${c} cm = 1,${pad(c)}${NB}m` }); }
      const e = pick(LENGTHS); return g.choice(mod, t, 'schaetzen', `Wie lang ist ungefähr ${e[0]}?`, e[1], e.slice(2), { why: `${e[0][0].toUpperCase() + e[0].slice(1)}: ungefähr ${e[1]}.` });
    }
    if (mod === 'uhr') {
      const hh = rnd(1, 12), mm = t === 1 ? pick([0, 30, 15, 45]) : 5 * rnd(0, 11); const show = `${hh}:${pad(mm)} Uhr`;
      if (t === 2 && Math.random() < 0.25) { const s = 5 * rnd(0, 6), d = 5 * rnd(2, 9), h0 = rnd(7, 15), e = s + d; return g.num(mod, t, 'dauer', [d], { story: `Von ${h0}:${pad(s)} Uhr bis ${h0 + Math.floor(e / 60)}:${pad(e % 60)} Uhr. Wie viele Minuten sind das?`, labels: ['Minuten'] }); }
      if (t === 2 && Math.random() < 0.35) {
        // hands mixed up, the minutes read from the other side, the hour after
        const wrong = [...new Set([`${mm / 5 || 12}:${pad((hh % 12) * 5)} Uhr`, `${hh}:${pad(mm % 30 ? 60 - mm : 30 - mm)} Uhr`, `${(hh % 12) + 1}:${pad(mm)} Uhr`])].filter((x) => x !== show).slice(0, 2);
        return g.choice(mod, t, 'welche', 'Welche Uhrzeit zeigt die Uhr?', show, wrong, { pic: pic(J.clockSVG(hh, mm)), why: `Der kurze Zeiger zeigt die Stunde, der lange die Minuten: ${show}.`, h: hh, m: mm });
      }
      return g.num(mod, t, 'ablesen', [hh, mm], { fig: `<div class="jm">${J.clockSVG(hh, mm)}<div class="question">Wie spät ist es?</div></div>`, labels: ['Stunden', 'Minuten'], show, h: hh, m: mm });
    }
    if (mod === 'kalender') {
      const r = Math.random();
      if (t === 1) {
        if (r < 0.25) { const [q, n] = pick(FACTS); return g.num(mod, t, 'fakt', [n], { story: q }); }
        if (r < 0.6) { const i = rnd(0, 6), dir = pick([['nach', 1], ['vor', -1]]); const right = WD[(i + dir[1] + 7) % 7]; return g.choice(mod, t, 'tag', `Welcher Tag kommt ${dir[0]} ${WD[i]}?`, right, shuffle(WD.filter((x) => x !== right && x !== WD[i])).slice(0, 2), { why: WD.join(', ') + '.' }); }
        if (r < 0.8) { const i = rnd(0, 6), [word, d] = pick([['morgen', 1], ['übermorgen', 2], ['gestern', -1]]); const right = WD[(i + d + 7) % 7]; return g.choice(mod, t, 'heute', `Heute ist ${WD[i]}. Welcher Tag ist ${word}?`, right, shuffle(WD.filter((x) => x !== right && x !== WD[i])).slice(0, 2), { why: WD.join(', ') + '.' }); }
        const s = rnd(0, 3); return g.order(mod, t, 'woche', 'Tippe die Tage der Reihe nach an.', WD.slice(s, s + 4));
      }
      if (r < 0.25) { const i = rnd(0, 11), dir = pick([['nach', 1], ['vor', -1]]); const right = MONTHS[(i + dir[1] + 12) % 12]; return g.choice(mod, t, 'monat', `Welcher Monat kommt ${dir[0]} ${MONTHS[i]}?`, right, shuffle(MONTHS.filter((x) => x !== right && x !== MONTHS[i])).slice(0, 2), { why: MONTHS.join(', ') + '.' }); }
      if (r < 0.45) { const s = rnd(0, 8); return g.order(mod, t, 'monate', 'Tippe die Monate der Reihe nach an.', MONTHS.slice(s, s + 4)); }
      let mi; do mi = rnd(0, 11); while (mi === 1); const first = rnd(0, 6), svg = calSVG(mi, first);
      if (r < 0.75) { const d = rnd(1, MDAYS[mi]), wd = (first + d - 1) % 7; return g.choice(mod, t, 'wochentag', `Welcher Wochentag ist der ${d}.${NB}${MONTHS[mi]}?`, WD[wd], shuffle(WD.filter((_, i) => i !== wd)).slice(0, 2), { pic: pic(svg), why: `Der ${d}. steht in der Spalte ${WD[wd].slice(0, 2)}.` }); }
      const wd = rnd(0, 6), k = rnd(0, 2); return g.num(mod, t, 'datum', [((wd - first + 7) % 7) + 1 + 7 * k], { svg, ask: `Welches Datum hat der ${ORD[k]} ${WD[wd]}?` });
    }
    if (mod === 'daten') {
      const D = pick(DATA), say = (x) => (D.say ? D.say[x] : x); let vals;
      if (t === 1) {
        do vals = D.rows.map(() => rnd(1, 12)); while (new Set(vals).size < vals.length);
        const svg = tallySVG(D.rows.map((x, i) => [x, vals[i]]));
        if (Math.random() < 0.7) { const i = rnd(0, 3); return g.num(mod, t, 'strich', [vals[i]], { svg, ask: D.read(say(D.rows[i])), rows: D.rows, vals }); }
        const i = vals.indexOf(Math.max(...vals)); return g.choice(mod, t, 'meiste', D.top, D.rows[i], shuffle(D.rows.filter((_, j) => j !== i)).slice(0, 2), { pic: pic(svg), why: `${D.rows[i]}: ${vals[i]} Striche, so viele hat keine andere Zeile.` });
      }
      const top = 2 * rnd(7, 10); do vals = D.rows.map(() => 2 * rnd(1, top / 2)); while (new Set(vals).size < vals.length);
      const fig = (q) => `<div class="jm">${J.chartSVG(D.title, D.rows.map((x, i) => ({ label: x, value: vals[i] })), 2, top)}<div class="question">${q}</div></div>`;
      const [i, j] = shuffle([0, 1, 2, 3]); const [hi, lo] = vals[i] > vals[j] ? [i, j] : [j, i];
      if (Math.random() < 0.5) return g.num(mod, t, 'saeule', [vals[i]], { fig: fig(D.read(say(D.rows[i]))), rows: D.rows, vals });
      return g.num(mod, t, 'mehr', [vals[hi] - vals[lo]], { fig: fig(D.diff(say(D.rows[hi]), say(D.rows[lo]))), rows: D.rows, vals });
    }
    // zufall: Glücksrad from the Jahrmarkt, or a sentence from everyday life
    if (Math.random() < 0.35) { const [s, a] = pick(EVENTS); return g.choice(mod, t, 'satz', `${s} Sicher, möglich oder unmöglich?`, a, [], { options: SMU, why: { sicher: 'Das passiert auf jeden Fall.', möglich: 'Das kann passieren, muss aber nicht.', unmöglich: 'Das kann nie passieren.' }[a] }); }
    const n = pick([4, 6, 8]), cols = shuffle(Object.keys(COLORS)), kind = pick(SMU), k = rnd(2, 3);
    const split = () => { const c = Array(k).fill(1); for (let i = k; i < n; i++) c[rnd(0, k - 1)]++; return shuffle(c.flatMap((x, i) => Array(x).fill(cols[i]))); };
    const sec = kind === 'sicher' ? Array(n).fill(cols[0]) : split(); const c = kind === 'möglich' ? cols[rnd(0, k - 1)] : kind === 'sicher' ? cols[0] : cols[3];
    const cnt = sec.filter((x) => x === c).length;
    return g.choice(mod, t, 'rad', `Der Zeiger bleibt auf ${COLORS[c]} stehen. Sicher, möglich oder unmöglich?`, kind, [], { options: SMU, pic: pic(J.wheelSVG(sec)), sec, color: c,
      why: cnt === n ? `Alle Felder sind ${COLORS[c].toLowerCase()}.` : cnt ? `${cnt} von ${n} Feldern sind ${COLORS[c].toLowerCase()}.` : `Kein Feld ist ${COLORS[c].toLowerCase()}.` });
  }
  register('groessen2', {
    grade: 2, title: 'Geld, Länge und Zeit', icon: '📏', sub: 'Euro und Cent, Zentimeter und Meter, Uhr und Kalender, Strichlisten und Zufall',
    modules: {
      geld: { name: 'Euro und Cent', icon: '🪙', maxTier: 2, worldCap: [2], dmg: 12 },
      laenge: { name: 'Längen', icon: '📏', maxTier: 2, worldCap: [2], dmg: 12 },
      uhr: { name: 'Die Uhr', icon: '🕰️', maxTier: 2, worldCap: [2], dmg: 12 },
      kalender: { name: 'Tage und Monate', icon: '📅', maxTier: 2, worldCap: [2], dmg: 10 },
      daten: { name: 'Strichliste und Diagramm', icon: '📊', maxTier: 2, worldCap: [2], dmg: 12 },
      zufall: { name: 'Sicher oder möglich', icon: '🎲', maxTier: 1, worldCap: [1], dmg: 10 },
    },
    attacks: [{ name: 'Sparschwein', mod: 'geld' }, { name: 'Maßband', mod: 'laenge' }, { name: 'Weckerklingeln', mod: 'uhr' }, { name: 'Säulenturm', mod: 'daten' }],
    extra: { geld: 'Sparschwein', laenge: 'Maßband', uhr: 'Weckerklingeln', kalender: 'Kalenderblatt', daten: 'Säulenturm', zufall: 'Kreiselwurf' },
    tut: {
      'geld:1': { title: 'Geld zählen', steps: ['Fang mit dem größten Schein oder der größten Münze an.', 'Zähle dann die kleineren dazu.', 'Beispiel: 10 €, 5 € und 2 € sind 17 €.'] },
      'geld:2': { title: 'Euro und Cent', steps: ['1 € = 100 ct. 1,50 € heißt 1 Euro und 50 Cent, also 150 ct.', 'Wechseln: 1 € sind zum Beispiel 5 Münzen zu 20 ct.', 'Rückgeld: Der Ball kostet 13 €, du gibst 20 €. Von 13 bis 20 sind es 7 €.'] },
      'laenge:1': { title: 'Zentimeter und Meter', steps: ['1 m = 100 cm. 1 dm = 10 cm. 1 cm = 10 mm.', 'Am Lineal liegt der Stift bei 0 an. Lies ab, wo die Spitze endet.', 'Zum Vergleichen schreibst du beide Längen in cm.'] },
      'laenge:2': { title: 'Längen mit Komma', steps: ['1,20 m heißt 1 Meter und 20 Zentimeter, also 120 cm.', 'Umgekehrt: 135 cm sind 1 m und 35 cm, also 1,35 m.', 'Schätzen: Ein Bleistift ist ungefähr 15 cm lang, eine Tür ungefähr 2 m hoch.'] },
      'uhr:1': { title: 'Die Uhr lesen', steps: ['Der kurze Zeiger zeigt die Stunden, der lange Zeiger die Minuten.', 'Langer Zeiger auf der 12: volle Stunde. Auf der 6: halb, also 30 Minuten.', 'Auf der 3 sind es 15 Minuten, auf der 9 sind es 45 Minuten.'] },
      'uhr:2': { title: 'Auf 5 Minuten genau', steps: ['Von einer Zahl zur nächsten sind es 5 Minuten.', 'Zähle in Fünferschritten: Der lange Zeiger auf der 4 heißt 20 Minuten.', 'Von 8:15 Uhr bis 8:40 Uhr sind es 25 Minuten.'] },
      'kalender:1': { title: 'Die Wochentage', steps: ['Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag.', 'Eine Woche hat 7 Tage. Nach Sonntag beginnt sie wieder mit Montag.', 'Heute ist Mittwoch: Morgen ist Donnerstag, gestern war Dienstag.'] },
      'kalender:2': { title: 'Monate und Kalender', steps: ['Ein Jahr hat 12 Monate, von Januar bis Dezember.', 'Im Kalenderblatt steht jeder Wochentag in einer Spalte.', 'Suche das Datum und schau oben in der Spalte nach dem Wochentag.'] },
      'daten:1': { title: 'Strichlisten', steps: ['In einer Strichliste ist jeder Strich ein Kind.', 'Vier Striche und ein Strich quer sind 5.', 'Zähle in Fünfern und dann die einzelnen Striche dazu: 5, 10, 11, 12.'] },
      'daten:2': { title: 'Säulendiagramme', steps: ['Geh vom oberen Ende der Säule waagerecht nach links zur Zahl.', 'Die Linien zählen in Zweierschritten: 2, 4, 6, 8.', '„Wie viele mehr“: Ziehe den kleineren Wert vom größeren ab.'] },
      'zufall:1': { title: 'Sicher, möglich, unmöglich', steps: ['Sicher: Es passiert auf jeden Fall.', 'Möglich: Es kann passieren, muss aber nicht.', 'Unmöglich: Es kann nie passieren. Auf dem Glücksrad zählst du die Felder jeder Farbe.'] },
    },
    notes: {
      geld: { title: 'Geld', lines: ['1 € = 100 ct', '1,50 € = 1 € und 50 ct = 150 ct'] },
      laenge: { title: 'Längen', lines: ['1 m = 100 cm', '1 dm = 10 cm', '1 cm = 10 mm'] },
      uhr: { title: 'Die Uhr', lines: ['kurzer Zeiger: Stunden', 'langer Zeiger: Minuten, von Zahl zu Zahl 5'] },
      kalender: { title: 'Zeit', lines: ['1 Woche = 7 Tage, 1 Jahr = 12 Monate', '1 Tag = 24 Stunden, 1 Stunde = 60 Minuten'] },
      daten: { title: 'Strichliste', lines: ['Vier Striche und einer quer sind 5.'] },
      zufall: { title: 'Zufall', lines: ['sicher: passiert immer', 'möglich: kann passieren', 'unmöglich: passiert nie'] },
    },
    events: [
      ev('Der Kiosk', 'Am Kiosk vor der Schule zählt die Verkäuferin ihre Kasse. Zählst du mit, schenkt sie dir einen Trank.', 'Mitzählen', 'geld', { item: 'trank' }, { hp: -5 }),
      ev('Die Schulglocke', 'Der Hausmeister will wissen, wie spät es auf der großen Uhr ist. Er gibt dir einen Schild für die richtige Zeit.', 'Uhr lesen', 'uhr', { item: 'schild' }, { hp: -5 }),
      ev('Der Klassenkalender', 'An der Tafel hängt der Klassenkalender. Die Lehrerin fragt nach einem Tag und verrät dir eine Eselsbrücke.', 'Antworten', 'kalender', { item: 'lupe' }, { xp: 5 }),
      ev('Die Umfrage', 'Die Klasse hat eine Strichliste gemacht. Liest du sie richtig, bekommst du eine Chilischote.', 'Liste lesen', 'daten', { item: 'keks' }, { hp: -5 }),
      restEv('Die Hofpause', 'Es klingelt zur Hofpause. Du setzt dich auf die Treppe und ruhst dich aus.'),
    ],
  }, genGr2);
})();
