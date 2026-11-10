// Sachkunde Klasse 3 (Lehrplan Sachsen, LB 3 „Lebensraum Wiese“ und LB 1 „Zusammen leben und lernen“): Die Wiese, Früher und heute.
// Registers its units in MK.MODES like sachkunde.js; the Stockwerke picture goes into MS.PLANTS for the parts tasks.
const MS3 = (() => {
  const K = typeof MK !== 'undefined' ? MK : require('./knowledge.js');
  const S = typeof MS !== 'undefined' ? MS : require('./sachkunde.js');
  const { shuffle, pick, rnd } = K;
  const { choice, orderTask, wantsPool, partsSVG } = S;
  const NS = 'xmlns="http://www.w3.org/2000/svg"';
  const OUT = '#1C2541';

  /* ================= DIE WIESE (LB 3) ================= */
  // Merkmale stehen in den Notizkarten und in TRAITS; das Bild zeigt sie
  const FLORA = [
    { id: 'loewenzahn', name: 'Löwenzahn', note: 'Löwenzahn: gelbe Blüte aus vielen schmalen Blütenblättern, tief gezähnte Blätter. Aus der Blüte wird die Pusteblume. Im Stängel ist weißer Milchsaft.' },
    { id: 'gaensebluemchen', name: 'Gänseblümchen', note: 'Gänseblümchen: klein, weiße Blütenblätter mit gelber Mitte, rundliche Blätter dicht am Boden. Es blüht fast das ganze Jahr.' },
    { id: 'klee', name: 'Wiesen-Klee', note: 'Wiesen-Klee: rosa-rote, kugelige Blütenköpfe, jedes Blatt besteht aus drei Teilen. Hummeln und Bienen holen dort Nektar.' },
    { id: 'spitzwegerich', name: 'Spitzwegerich', note: 'Spitzwegerich: schmale, lange Blätter mit Längsrippen, eine braune Ähre auf einem langen Stiel.' },
    { id: 'schaumkraut', name: 'Wiesen-Schaumkraut', note: 'Wiesen-Schaumkraut: blasslila Blüten mit vier Blütenblättern, gefiederte Blätter. Es wächst auf feuchten Wiesen und blüht im Frühling.' },
    { id: 'margerite', name: 'Margerite', note: 'Margerite: große weiße Blüte mit gelber Mitte auf einem hohen Stängel, längliche, gezähnte Blätter.' },
    { id: 'hahnenfuss', name: 'Scharfer Hahnenfuß', note: 'Scharfer Hahnenfuß: glänzend gelbe Blüten mit fünf Blütenblättern, handförmig geteilte Blätter. Er ist giftig, Kühe lassen ihn stehen.' },
    { id: 'sauerampfer', name: 'Sauerampfer', note: 'Sauerampfer: pfeilförmige Blätter, viele kleine rötliche Blüten. Die Blätter schmecken sauer.' },
  ];
  // has: Pflanzen mit diesem Merkmal; skip: ähnlich genug, um als falsche Antwort zu verwirren
  const TRAITS = [
    { q: 'Welche Pflanze hat gelbe Blüten?', has: ['loewenzahn', 'hahnenfuss'] },
    { q: 'Welche Pflanze hat weiße Blütenblätter und eine gelbe Mitte?', has: ['gaensebluemchen', 'margerite'] },
    { q: 'Welche Pflanze hat Blätter, die aus drei Teilen bestehen?', has: ['klee'] },
    { q: 'Welche Pflanze hat gefiederte Blätter?', has: ['schaumkraut'] },
    { q: 'Welche Pflanze hat schmale, lange Blätter mit Längsrippen?', has: ['spitzwegerich'] },
    { q: 'Welche Pflanze hat pfeilförmige Blätter?', has: ['sauerampfer'] },
    { q: 'Welche Pflanze hat handförmig geteilte Blätter?', has: ['hahnenfuss'] },
    { q: 'Welche Pflanze hat tief gezähnte Blätter, die am Boden liegen?', has: ['loewenzahn'], skip: ['margerite'] },
    { q: 'Aus welcher Blüte wird eine Pusteblume?', has: ['loewenzahn'] },
    { q: 'Welche Pflanze hat rosa-rote, kugelige Blütenköpfe?', has: ['klee'] },
    { q: 'Welche Pflanze hat blasslila Blüten mit vier Blütenblättern?', has: ['schaumkraut'] },
    { q: 'Welche Pflanze hat eine braune Ähre auf einem langen Stiel?', has: ['spitzwegerich'] },
    { q: 'Welche Pflanze hat glänzend gelbe Blüten mit fünf Blütenblättern?', has: ['hahnenfuss'] },
    { q: 'Welche Pflanze heißt so, weil ihre Blätter sauer schmecken?', has: ['sauerampfer'] },
    { q: 'Welche Pflanze ist giftig und wird von Kühen auf der Weide stehen gelassen?', has: ['hahnenfuss'] },
    { q: 'Welche Pflanze blüht fast das ganze Jahr, manchmal sogar im Winter?', has: ['gaensebluemchen'] },
    { q: 'Welche Pflanze hat eine große weiße Blüte auf einem hohen Stängel?', has: ['margerite'], skip: ['gaensebluemchen'] },
    { q: 'Welche Pflanze ist klein, blüht weiß mit gelber Mitte und hat ihre Blätter dicht am Boden?', has: ['gaensebluemchen'], skip: ['margerite'] },
  ];
  const f1 = (v) => +v.toFixed(1);
  const pt = (cx, cy, a, r) => `${f1(cx + Math.cos(a) * r)} ${f1(cy + Math.sin(a) * r)}`;
  // a right-hand outline from the base (0|0) to the tip, mirrored into a closed leaf pointing up
  const sym = (pts) => `M0 0 L${pts.map(([x, y]) => `${x} ${y}`).join(' L')} L${pts.slice(0, -1).reverse().map(([x, y]) => `${-x} ${y}`).join(' L')} Z`;
  const at = (x, y, rot, s, inner) => `<g transform="translate(${x} ${y}) rotate(${rot})${s !== 1 ? ` scale(${s})` : ''}">${inner}</g>`;
  // both pictures set round caps and joins once on a wrapping group
  const ROUND = '<g stroke-linecap="round" stroke-linejoin="round">';
  const leaf = (d, fill, w) => `<path d="${d}" fill="${fill || 'url(#flLf)'}" stroke="${OUT}" stroke-width="${w || 1.1}"/>`;
  const vein = (d, c, w) => `<path d="${d}" fill="none" stroke="${c || '#DDEFC0'}" stroke-width="${w || 0.8}"/>`;
  const stem = (d, w, c) => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${(w || 2.2) + 1.8}"/><path d="${d}" fill="none" stroke="${c || '#6EA842'}" stroke-width="${w || 2.2}"/>`;
  // n petals of length len and half-width w around cx|cy, starting r0 from the centre
  const petals = (cx, cy, n, len, w, fill, r0, off, sw, sc) => `<g transform="translate(${cx} ${cy})" fill="${fill}" stroke="${sc || OUT}" stroke-width="${sw || 0.6}">${Array.from({ length: n }, (_, i) => `<ellipse cy="${f1(-(r0 || 0) - len / 2)}" rx="${w}" ry="${len / 2}" transform="rotate(${f1((360 / n) * i + (off || 0))})"/>`).join('')}</g>`;
  const shine = (x, y, rx, ry, rot) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".75" transform="rotate(${rot || 0} ${x} ${y})"/>`;
  const FL_DEFS = {
    Lf: '<linearGradient id="flLf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9FD162"/><stop offset="1" stop-color="#4A872C"/></linearGradient>',
    So: '<linearGradient id="flSo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9C6B43"/><stop offset="1" stop-color="#65412A"/></linearGradient>',
    Bg: '<radialGradient id="flBg" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#EEF7DD"/><stop offset="1" stop-color="#EEF7DD" stop-opacity="0"/></radialGradient>',
    Ye: '<radialGradient id="flYe" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#FFF2A0"/><stop offset=".45" stop-color="#FFD21F"/><stop offset="1" stop-color="#E89A00"/></radialGradient>',
    Wt: '<linearGradient id="flWt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#FBFAFD"/><stop offset="1" stop-color="#DCD6E6"/></linearGradient>',
    Ds: '<linearGradient id="flDs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EE8FB0"/><stop offset=".3" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E9E4EF"/></linearGradient>',
    Kl: '<radialGradient id="flKl" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#F7BCD3"/><stop offset=".6" stop-color="#DC6496"/><stop offset="1" stop-color="#A2386A"/></radialGradient>',
    Li: '<linearGradient id="flLi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAF2FD"/><stop offset="1" stop-color="#D2B3E6"/></linearGradient>',
    Br: '<radialGradient id="flBr" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#B08A5A"/><stop offset="1" stop-color="#5A3E22"/></radialGradient>',
    Rd: '<radialGradient id="flRd" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#E8806A"/><stop offset="1" stop-color="#8E2C24"/></radialGradient>',
  };
  const disc = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#flYe)" stroke="${OUT}" stroke-width="${r > 6 ? 1.1 : 0.8}"/><path d="${Array.from({ length: Math.round(r * 2) }, (_, i) => { const a = i * 2.4, rr = Math.sqrt(i / (r * 2)) * r * 0.8; return `M${pt(x, y, a, rr)} h.1`; }).join('')}" stroke="#C98500" stroke-width="${f1(r / 6)}" opacity=".7"/>${shine(x - r * 0.35, y - r * 0.4, r * 0.3, r * 0.18, -30)}`;
  const daisy = (x, y, r, pink) => petals(x, y, 24, f1(r * 0.72), f1(r * 0.13), pink ? 'url(#flDs)' : 'url(#flWt)', f1(r * 0.28), 0, 0.5) + disc(x, y, r * 0.32);
  const dandelion = (x, y, r) => petals(x, y, 24, f1(r * 0.62), f1(r * 0.12), '#FFD84A', f1(r * 0.36), 0, 0.5) + petals(x, y, 18, f1(r * 0.52), f1(r * 0.12), '#FFC61A', f1(r * 0.2), 10, 0.4, '#C98A00') + petals(x, y, 12, f1(r * 0.38), f1(r * 0.12), '#F5AE00', f1(r * 0.08), 5, 0.4, '#C98A00') + `<circle cx="${x}" cy="${y}" r="${f1(r * 0.12)}" fill="#E39A00"/>`;
  const clover = (x, y, r) => { const fl = (k, rr, n, o) => Array.from({ length: n }, (_, i) => { const a = o + (i / n) * Math.PI * 2; return `M${pt(x, y, a, rr - r * 0.3)} L${pt(x, y, a, rr)}`; }).join(''); const d = fl(0, r * 0.98, 18, 0) + fl(0, r * 0.68, 12, 0.25) + fl(0, r * 0.36, 6, 0.5); return `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#flKl)" stroke="${OUT}" stroke-width="1"/><path d="${d}" stroke="#B5487E" stroke-width="${f1(r * 0.17)}"/><path d="${d}" stroke="#FAD3E3" stroke-width="${f1(r * 0.07)}"/>${shine(x - r * 0.4, y - r * 0.45, r * 0.25, r * 0.14, -35)}`; };
  const GRASS = `<path d="M0 157 Q60 152 120 157 L120 165 L0 165 Z" fill="url(#flSo)"/><path d="M0 157 Q60 152 120 157" fill="none" stroke="${OUT}" stroke-width="1.3"/><path d="M14 156 q2 -4 6 -1 M30 155 q2 -3 5 -1 M92 155 q3 -3 6 0 M76 160 q2 -2 4 0 M44 160 q2 -2 4 0" fill="none" stroke="#C49A6C" stroke-width="1"/>`
    + [[6, 18, -4], [11, 12, 4], [103, 15, 5], [110, 20, -3], [115, 11, 3]].map(([x, h, l]) => `<path d="M${x - 2} 157 Q${x + l * 0.3} ${157 - h * 0.6} ${x + l} ${157 - h} Q${x + 1 + l * 0.3} ${157 - h * 0.6} ${x + 2} 157 Z" fill="url(#flLf)" stroke="${OUT}" stroke-width=".7"/>`).join('');
  const LEAVES = {
    lz: sym([[2, -4], [5, -12], [13, -10], [7, -20], [15, -21], [8, -31], [14, -33], [6, -41], [9, -45], [3, -50], [0, -56]]),
    spoon: 'M0 0 Q1.5 -8 2.5 -14 Q9 -19 8 -27 Q6 -34 0 -34 Q-6 -34 -8 -27 Q-9 -19 -2.5 -14 Q-1.5 -8 0 0 Z',
    trio: 'M0 0 Q7 -3 7 -11 Q6 -19 0 -19 Q-6 -19 -7 -11 Q-7 -3 0 0 Z',
    lance: 'M0 0 Q8 -20 7 -36 Q5 -50 0 -62 Q-5 -50 -7 -36 Q-8 -20 0 0 Z',
    serr: sym([[2.5, -3], [5, -8], [7, -8], [6, -13], [8, -14], [6, -19], [7.5, -21], [5, -25], [5.5, -28], [0, -33]]),
    lobe: sym([[1.2, -3], [3, -9], [5.5, -10], [4, -14], [6, -17], [2.5, -18], [3, -21], [0, -24]]),
    arrow: 'M0 0 Q-3 5 -7 13 Q-10 5 -6 -3 Q-10 -18 -7 -32 Q-4 -44 0 -52 Q4 -44 7 -32 Q10 -18 6 -3 Q10 5 7 13 Q3 5 0 0 Z',
  };
  const trefoil = [-58, 0, 58].map((r) => at(0, 0, r, 1, leaf(LEAVES.trio) + vein('M-3.5 -10 Q0 -6 3.5 -10', '#E6F4D4', 1.6))).join('');
  const hand = (n, spread) => Array.from({ length: n }, (_, i) => at(0, 0, f1(-spread + (2 * spread * i) / (n - 1)), 1, leaf(LEAVES.lobe, null, 0.9) + vein('M0 -2 L0 -20'))).join('');
  const pinnate = (n, round) => `<path d="M0 0 L0 -${n * 8 + 6}" stroke="${OUT}" stroke-width="2.2"/><path d="M0 0 L0 -${n * 8 + 6}" stroke="#6EA842" stroke-width="1.1"/>`
    + Array.from({ length: n }, (_, i) => [-1, 1].map((d) => round ? `<ellipse cx="${d * 4.5}" cy="-${i * 8 + 6}" rx="3.6" ry="3" fill="url(#flLf)" stroke="${OUT}" stroke-width=".8"/>` : `<ellipse cx="${d * 5}" cy="-${i * 8 + 7}" rx="5" ry="1.3" fill="url(#flLf)" stroke="${OUT}" stroke-width=".7" transform="rotate(${d * -30} ${d * 5} -${i * 8 + 7})"/>`).join('')).join('')
    + `<ellipse cx="0" cy="-${n * 8 + 9}" rx="${round ? 5 : 1.6}" ry="${round ? 4.4 : 5}" fill="url(#flLf)" stroke="${OUT}" stroke-width=".8"/>`;
  const cross = (x, y, r) => [45, 135, 225, 315].map((a) => `<path d="M${x} ${y} Q${x - r * 0.75} ${y - r * 0.7} ${x - r * 0.45} ${y - r * 1.1} Q${x} ${y - r * 1.3} ${x + r * 0.45} ${y - r * 1.1} Q${x + r * 0.75} ${y - r * 0.7} ${x} ${y} Z" fill="url(#flLi)" stroke="${OUT}" stroke-width=".7" transform="rotate(${a} ${x} ${y})"/>`).join('')
    + `<path d="${[45, 135, 225, 315].map((a) => `M${pt(x, y, (a - 90) * Math.PI / 180, r * 0.3)} L${pt(x, y, (a - 90) * Math.PI / 180, r * 0.9)}`).join('')}" stroke="#9A6DB5" stroke-width=".6"/><circle cx="${x}" cy="${y}" r="${f1(r * 0.24)}" fill="#E8C33A" stroke="${OUT}" stroke-width=".5"/>`;
  const cup = (x, y, r, rot) => `<g transform="rotate(${rot || 0} ${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<path d="M${x} ${y} Q${x - r * 0.95} ${y - r * 0.5} ${x - r * 0.62} ${y - r * 1.05} Q${x} ${y - r * 1.4} ${x + r * 0.62} ${y - r * 1.05} Q${x + r * 0.95} ${y - r * 0.5} ${x} ${y} Z" fill="url(#flYe)" stroke="${OUT}" stroke-width=".8" transform="rotate(${a} ${x} ${y})"/>${shine(...pt(x, y, (a - 105) * Math.PI / 180, r * 0.82).split(' ').map(Number), r * 0.22, r * 0.12, a)}`).join('')}<circle cx="${x}" cy="${y}" r="${f1(r * 0.34)}" fill="#A9B83A" stroke="${OUT}" stroke-width=".6"/><path d="${Array.from({ length: 10 }, (_, i) => `M${pt(x, y, i * 0.63, r * 0.42)} h.1`).join('')}" stroke="#E08A00" stroke-width="1.6"/></g>`;
  // ribwort plantain: stamens on long filaments around the spike (side, height, length)
  const STAMEN = [[-1, 30, 7], [-1, 35, 8], [-1, 40, 7], [1, 31, 8], [1, 36, 7], [1, 41, 6], [-1, 25, 5], [1, 26, 5]];
  function floraSVG(id) {
    let a = '', d = ['Ye'];
    if (id === 'loewenzahn') {
      a = [[-64, 0.9], [62, 0.85], [-42, 1], [40, 1], [-18, 0.8], [16, 0.78]].map(([r, s]) => at(60, 156, r, s, leaf(LEAVES.lz) + vein('M0 -2 L0 -53', '#EBD9C6', 1.2))).join('')
        + stem('M62 154 Q72 100 88 46', 1.9, '#86B85A') + stem('M58 154 Q54 104 42 60', 2.2, '#86B85A') + stem('M66 154 Q74 128 78 112', 1.8, '#86B85A')
        + `<path d="M74 110 Q72 98 78 92 Q84 98 82 110 Z" fill="url(#flLf)" stroke="${OUT}" stroke-width=".9"/><path d="M76 96 Q78 90 80 96" fill="#FFD21F" stroke="${OUT}" stroke-width=".6"/><path d="M75 109 l-3 4 M81 109 l3 4" stroke="#4A872C" stroke-width="1.2"/>`
        + `<path d="M36 58 q-4 4 -5 9 M40 60 q-1 5 -3 9 M48 58 q4 4 5 9 M44 60 q1 5 3 9" fill="none" stroke="#4A872C" stroke-width="1.4"/>` + dandelion(42, 46, 17)
        + `<circle cx="88" cy="38" r="15" fill="#fff" opacity=".45"/><path d="${Array.from({ length: 26 }, (_, i) => `M${pt(88, 38, i * 0.2417, 2.5)} L${pt(88, 38, i * 0.2417, 13)}`).join('')}" stroke="#B8C2CF" stroke-width=".6"/>`
        + `<path d="${Array.from({ length: 26 }, (_, i) => { const t = i * 0.2417; return [-0.18, 0, 0.18].map((o) => `M${pt(88, 38, t, 13)} L${pt(88, 38, t + o, 16)}`).join(''); }).join('')}" stroke="#E3E8EF" stroke-width=".7"/><circle cx="88" cy="38" r="3" fill="#8A6A3F" stroke="${OUT}" stroke-width=".6"/>`
        + `<path d="M108 14 L104 22 M108 14 l-3 -3 M108 14 l1 -4 M108 14 l3 -2 M108 14 l4 1" stroke="#B8C2CF" stroke-width=".7"/><circle cx="104" cy="22" r=".9" fill="#8A6A3F"/>`;
    } else if (id === 'gaensebluemchen') {
      d.push('Ds', 'Wt');
      a = [[-84, 0.7], [84, 0.72], [-58, 0.85], [58, 0.82], [-28, 0.8], [28, 0.78], [0, 0.66]].map(([r, s]) => at(60, 156, r, s, leaf(LEAVES.spoon, null, 1.3) + vein('M0 -1 L0 -30', '#DDEFC0', 1.2))).join('')
        + stem('M58 154 Q54 120 48 92', 1.7) + stem('M63 154 Q72 132 82 116', 1.5) + stem('M56 154 Q46 140 38 132', 1.4)
        + daisy(48, 88, 22, true) + daisy(82, 112, 15, true)
        + `<ellipse cx="37" cy="128" rx="4.5" ry="5.5" fill="url(#flLf)" stroke="${OUT}" stroke-width=".8" transform="rotate(-30 37 128)"/><path d="M34 125 Q36 121 39 124" fill="#EE8FB0" stroke="${OUT}" stroke-width=".6"/>`;
    } else if (id === 'klee') {
      d.push('Kl');
      a = stem('M60 156 Q56 110 60 56', 2.2) + stem('M59 130 Q46 124 36 116', 1.4) + stem('M60 104 Q74 98 84 90', 1.4) + stem('M58 154 Q50 148 44 146', 1.3)
        + at(36, 116, -30, 1.15, trefoil) + at(84, 90, 25, 1.1, trefoil) + at(44, 146, -60, 0.95, trefoil)
        + at(58, 62, -50, 0.75, trefoil) + at(62, 62, 50, 0.75, trefoil) + clover(60, 44, 17);
    } else if (id === 'spitzwegerich') {
      d.push('Br');
      a = [[-70, 0.85], [68, 0.9], [-46, 1], [44, 1.05], [-22, 0.95], [20, 0.9], [0, 0.75]].map(([r, s]) => at(60, 156, r, s, leaf(LEAVES.lance, null, 1.2) + vein('M0 -2 L0 -60 M-2.8 -4 Q-5 -30 -1 -57 M2.8 -4 Q5 -30 1 -57', '#D6EDB2', 0.8))).join('')
        + stem('M60 154 Q57 100 62 42', 1.8, '#7FA34E') + `<path d="M60.5 150 Q57.8 100 62.5 44" fill="none" stroke="#B9D58A" stroke-width=".6"/>`
        + `<ellipse cx="62" cy="30" rx="6.5" ry="15" fill="url(#flBr)" stroke="${OUT}" stroke-width="1.2"/><path d="${[19, 23, 27, 31, 35, 39].map((y) => `M57 ${y} l2.5 2 l2.5 -2 l2.5 2 l2.5 -2`).join('')}" fill="none" stroke="#3E2A16" stroke-width=".6" opacity=".7"/>`
        + `<path d="${STAMEN.map(([s, y, l]) => `M${62 + s * 5.5} ${y} q${s * l * 0.6} -1 ${s * l} -${l * 0.5}`).join('')}" fill="none" stroke="#B7A776" stroke-width=".6"/>`
        + STAMEN.map(([s, y, l]) => `<ellipse cx="${f1(62 + s * (5.5 + l))}" cy="${y - l * 0.5}" rx="2.2" ry="1.3" fill="#FFF6D2" stroke="#8E7E4A" stroke-width=".5" transform="rotate(${s * 30} ${f1(62 + s * (5.5 + l))} ${y - l * 0.5})"/>`).join('');
    } else if (id === 'schaumkraut') {
      d.push('Li');
      a = [[-72, 0.95], [70, 0.9], [-36, 0.8], [34, 0.85]].map(([r, s]) => at(60, 156, r, s, pinnate(3, true))).join('')
        + stem('M60 154 Q57 100 60 52', 1.8) + at(59, 118, -48, 0.8, pinnate(3)) + at(60, 92, 46, 0.7, pinnate(3))
        + stem('M60 54 Q52 52 46 46 M60 54 L60 36 M60 54 Q68 52 74 46 M60 62 Q54 64 49 62 M60 62 Q66 64 71 62', 1)
        + `<ellipse cx="57" cy="28" rx="2.6" ry="3.6" fill="#E3CFF0" stroke="${OUT}" stroke-width=".6"/><ellipse cx="63" cy="27" rx="2.6" ry="3.6" fill="#E3CFF0" stroke="${OUT}" stroke-width=".6"/><ellipse cx="60" cy="24" rx="2.2" ry="3" fill="#B9D88E" stroke="${OUT}" stroke-width=".6"/>`
        + cross(49, 62, 8) + cross(71, 62, 8) + cross(46, 44, 9) + cross(74, 44, 9) + cross(60, 36, 9);
    } else if (id === 'margerite') {
      d.push('Wt');
      a = at(58, 156, -62, 1, `<path d="M0 0 L0 -18" stroke="${OUT}" stroke-width="2.4"/><path d="M0 0 L0 -18" stroke="#6EA842" stroke-width="1.2"/>${at(0, -16, 0, 0.6, leaf(LEAVES.serr, null, 1.6))}`) + at(62, 156, 60, 1, `<path d="M0 0 L0 -16" stroke="${OUT}" stroke-width="2.4"/><path d="M0 0 L0 -16" stroke="#6EA842" stroke-width="1.2"/>${at(0, -14, 0, 0.55, leaf(LEAVES.serr, null, 1.6))}`)
        + stem('M60 156 Q56 100 60 42', 2.2) + at(58, 132, -55, 1, leaf(LEAVES.serr) + vein('M0 -1 L0 -30')) + at(59, 108, 50, 0.85, leaf(LEAVES.serr) + vein('M0 -1 L0 -30')) + at(58, 84, -45, 0.7, leaf(LEAVES.serr) + vein('M0 -1 L0 -30'))
        + petals(60, 34, 21, 18, 3.6, 'url(#flWt)', 7, 0, 0.7) + disc(60, 34, 8.5);
    } else if (id === 'hahnenfuss') {
      a = at(60, 156, -40, 1, stem('M0 0 L0 -20', 1.1) + at(0, -20, 0, 0.95, hand(5, 60))) + at(60, 156, 38, 1, stem('M0 0 L0 -18', 1.1) + at(0, -18, 0, 0.85, hand(5, 60)))
        + stem('M60 156 Q60 120 60 92 Q50 72 38 52 M60 92 Q72 70 84 50 M60 92 Q62 62 60 34', 1.6) + at(60, 92, 0, 0.6, hand(3, 40))
        + cup(38, 48, 10, 20) + cup(84, 46, 10, -10) + cup(60, 30, 11, 0);
    } else {
      d.push('Rd');
      a = at(57, 156, -50, 1, stem('M0 0 L0 -24', 1.1, '#9A5A3E') + at(0, -24, 0, 0.85, leaf(LEAVES.arrow) + vein('M0 0 L0 -46'))) + at(63, 156, 46, 1, stem('M0 0 L0 -22', 1.1, '#9A5A3E') + at(0, -22, 0, 0.8, leaf(LEAVES.arrow) + vein('M0 0 L0 -46')))
        + stem('M60 156 Q57 110 60 34', 2, '#A4503C') + at(59, 124, -34, 0.6, leaf(LEAVES.arrow) + vein('M0 0 L0 -46')) + at(60, 102, 32, 0.5, leaf(LEAVES.arrow) + vein('M0 0 L0 -46'))
        + stem('M60 84 Q70 76 78 66 M60 72 Q50 64 44 54 M60 60 Q68 52 72 42 M60 50 Q53 44 50 36', 1, '#A4503C')
        + [[78, 66], [75, 70], [72, 74], [80, 62], [44, 54], [47, 58], [51, 62], [42, 50], [72, 42], [70, 46], [67, 50], [73, 38], [50, 36], [52, 40], [55, 44], [49, 32], [60, 34], [60, 30], [61, 26], [66, 54], [56, 66], [65, 79], [54, 47], [57, 39]]
          .map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="${i % 3 ? 2 : 2.4}" ry="${i % 3 ? 1.6 : 2}" fill="${i % 4 ? 'url(#flRd)' : '#B9A24A'}" stroke="${OUT}" stroke-width=".5"/>`).join('');
    }
    return `<svg ${NS} class="pic" viewBox="0 0 120 165" style="max-width:170px" aria-label="Bild einer Wiesenpflanze"><defs>${['Lf', 'So', 'Bg'].concat(d).map((k) => FL_DEFS[k]).join('')}</defs><ellipse cx="60" cy="84" rx="58" ry="80" fill="url(#flBg)"/>${ROUND}${a}${GRASS}</g></svg>`;
  }

  // Stockwerke der Wiese, von unten nach oben; als Bild beschriftbar wie der Wasserkreislauf
  const LAYERS = [
    { id: 'wurzel', name: 'Wurzelschicht', desc: 'Im Boden zwischen den Wurzeln. Hier leben Regenwurm, Maulwurf und Engerlinge.', tip: 'Das Stockwerk liegt unter der Erde.' },
    { id: 'boden', name: 'Bodenschicht', desc: 'Auf dem Boden zwischen Moos und abgestorbenen Blättern, der Streu. Darum heißt sie auch Streuschicht. Hier laufen Laufkäfer und Asseln.', tip: 'Das Stockwerk liegt direkt auf der Erde.' },
    { id: 'staengel', name: 'Stängel- und Blattschicht', desc: 'Zwischen Halmen, Stängeln und Blättern. Hier sitzen Heuschrecken, Marienkäfer und Raupen, Spinnen bauen ihre Netze.', tip: 'Das Stockwerk liegt zwischen den Halmen.' },
    { id: 'bluete', name: 'Blütenschicht', desc: 'Ganz oben bei den Blüten. Bienen, Hummeln und Schmetterlinge holen hier Nektar.', tip: 'Das Stockwerk ist ganz oben.' },
  ];
  const WIESE = { label: 'Stockwerke der Wiese', box: '0 0 300 240', parts: LAYERS, stepOf: {}, tap: 'die Stelle im Bild',
    ask: () => 'Wie heißt das leuchtende Stockwerk der Wiese?', find: (p) => `Tippe auf das Stockwerk: ${p.name}` };
  const hit = (y, h) => `<rect class="hitarea" x="0" y="${y}" width="300" height="${h}" fill="transparent"/>`;
  // texture strokes sit in style="" so a glowing layer keeps them (the glow rule recolours stroke attributes only)
  const tex = (d, c, w, o, dash) => `<path d="${d}" fill="none" style="stroke:${c};stroke-width:${w}"${o ? ` opacity="${o}"` : ''}${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  const blade = (x, h, l) => `M${x - 2.6} 187 Q${x + l * 0.3} ${187 - h * 0.6} ${x + l} ${187 - h} Q${x + 1.2 + l * 0.3} ${187 - h * 0.6} ${x + 2.6} 187 Z`;
  const BLADES = [[8, 92, -8], [18, 70, 6], [30, 100, 4], [40, 64, -6], [64, 80, 8], [76, 104, -4], [104, 74, -9], [118, 96, 6], [128, 62, -5], [160, 88, 7], [170, 70, -8], [200, 98, -5], [214, 66, 8], [250, 84, -7], [262, 104, 5], [284, 76, -6], [294, 96, 4]];
  const roots = (x, l) => `M${x} 187 q-3 ${l * 0.5} 1 ${l} M${x} 190 q-8 6 -12 15 M${x} 192 q7 6 10 16 M${x - 1} ${187 + l * 0.6} q-6 4 -8 10 M${x} ${187 + l * 0.45} q6 3 9 9`;
  WIESE.svg = (opts) => partsSVG(WIESE, opts, (g) => `<defs>${FL_DEFS.Ye}${FL_DEFS.Wt}${FL_DEFS.Kl}${FL_DEFS.Lf}
    <linearGradient id="wiSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D3EAF8"/><stop offset=".35" stop-color="#E8F4F2"/><stop offset=".78" stop-color="#EEF6DC"/></linearGradient>
    <linearGradient id="wiSo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E603C"/><stop offset="1" stop-color="#583824"/></linearGradient>
    <pattern id="wiCr" width="19" height="13" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.4" fill="#A97A50"/><circle cx="12" cy="8" r="1" fill="#3E2716"/><circle cx="16" cy="2" r=".8" fill="#B88C62"/><circle cx="7" cy="11" r="1.1" fill="#4A2F1C"/></pattern>
    <linearGradient id="wiGr" gradientUnits="userSpaceOnUse" x1="0" y1="80" x2="0" y2="187"><stop offset="0" stop-color="#B2DA6E"/><stop offset="1" stop-color="#4C8A2E"/></linearGradient>
    <linearGradient id="wiWm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7B3B8"/><stop offset="1" stop-color="#C9707E"/></linearGradient>
    <linearGradient id="wiLt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCA25A"/><stop offset="1" stop-color="#8E5526"/></linearGradient>
    <radialGradient id="wiGy" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#D4D8DE"/><stop offset="1" stop-color="#6E7480"/></radialGradient>
    <radialGradient id="wiBt" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#7C97CC"/><stop offset=".6" stop-color="#2E3E6E"/><stop offset="1" stop-color="#151C33"/></radialGradient>
    <radialGradient id="wiRd" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#FF8A78"/><stop offset="1" stop-color="#C4231E"/></radialGradient>
    <linearGradient id="wiHp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B4DE72"/><stop offset="1" stop-color="#4E9A32"/></linearGradient>
    <linearGradient id="wiOr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFC678"/><stop offset="1" stop-color="#E2661B"/></linearGradient></defs>
    <rect width="300" height="240" fill="url(#wiSky)"/>${ROUND}
    ${g('wurzel', `${hit(186, 54)}<rect y="186" width="300" height="54" fill="url(#wiSo)"/><rect y="186" width="300" height="54" fill="url(#wiCr)"/>${tex('M0 206 Q75 201 150 206 T300 204 M0 226 Q80 222 160 227 T300 225', '#3E2716', 1, 0.35)}${tex([24, 50, 86, 140, 232, 268].map((x, i) => roots(x, 26 + (i % 3) * 8)).join(''), '#EBD6AC', 1.6, 0.9)}<path d="M62 224 Q72 213 86 220 T110 222 T128 215" fill="none" stroke="${OUT}" stroke-width="7.5"/><path d="M62 224 Q72 213 86 220 T110 222 T128 215" fill="none" style="stroke:url(#wiWm);stroke-width:5"/>${tex('M62 224 Q72 213 86 220 T110 222 T128 215', '#B85A6A', 5, 0.5, '.8 2.6')}${tex('M108 221.6 Q112 221 116 219.5', '#D9707E', 5.4)}${tex('M66 219 Q74 212 84 217', '#FFE1E3', 1.2, 0.8)}<path d="M182 213 A9 8.5 0 1 0 195 226" fill="none" stroke="${OUT}" stroke-width="9"/><path d="M182 213 A9 8.5 0 1 0 195 226" fill="none" style="stroke:#F6EDD8;stroke-width:6.5"/>${tex('M182 213 A9 8.5 0 1 0 195 226', '#CDBB98', 6.5, 0.8, '.7 2.4')}<circle cx="182" cy="212" r="4" fill="#C07A3A" stroke="${OUT}" stroke-width="1.2"/><path d="M184 217 l4 2 M182 219 l3 3 M180 220 l1 4" stroke="${OUT}" stroke-width="1"/><ellipse cx="150" cy="229" rx="10" ry="6" fill="url(#wiGy)" stroke="${OUT}" stroke-width="1.4"/><ellipse cx="252" cy="214" rx="6.5" ry="4.2" fill="url(#wiGy)" stroke="${OUT}" stroke-width="1.2"/>`)}
    ${g('staengel', `${hit(72, 92)}<path d="${BLADES.map(([x, h, l]) => blade(x, h, l)).join('')}" fill="url(#wiGr)" style="stroke:#3E7A2A;stroke-width:.7"/>${stem('M50 186 Q46 130 50 68', 2)}${stem('M140 186 Q136 120 140 58', 2.2)}${stem('M232 186 Q236 130 232 68', 2)}${at(232, 120, 40, 0.85, trefoil)}${at(139, 128, -55, 0.75, leaf(LEAVES.serr))}${at(138, 100, 50, 0.6, leaf(LEAVES.serr))}${at(49, 116, -60, 0.55, leaf(LEAVES.lz))}
      ${tex('M70 112 L102 146 M86 108 L86 150 M70 146 L102 112 M66 129 L106 129 M86 121 L94 129 L86 137 L78 129 Z M86 114 L101 129 L86 144 L71 129 Z', '#8E9BB0', 0.6)}<path d="M84 126 l-6 -5 M84 128 l-7 0 M84 131 l-6 4 M88 126 l6 -5 M88 128 l7 0 M88 131 l6 4" stroke="${OUT}" stroke-width=".9"/><circle cx="86" cy="126" r="2.4" fill="${OUT}"/><ellipse cx="86" cy="131" rx="3.2" ry="3.8" fill="#5E4A3A" stroke="${OUT}" stroke-width="1"/>
      <g transform="translate(184 130) scale(1.15)"><path d="M-4 1 Q-12 -13 -19 -12 Q-18 -6 -7 4 Z" fill="url(#wiHp)" stroke="${OUT}" stroke-width="1.2"/><path d="M-18 -11 L-22 8 M4 4 L2 11 M9 4 L10 10" fill="none" stroke="${OUT}" stroke-width="1.2"/><path d="M-15 3 Q-13 -4 -1 -4 L10 -4 Q16 -4 16 1 Q16 5 10 5 L-10 6 Q-15 6 -15 3 Z" fill="url(#wiHp)" stroke="${OUT}" stroke-width="1.3"/><path d="M-14 1 Q-4 -6 7 -3" fill="none" stroke="#3E7A2A" stroke-width="1"/><circle cx="12" cy="-1" r="1.4" fill="${OUT}"/><path d="M14 -3 Q22 -14 30 -16 M13 -4 Q18 -14 24 -19" fill="none" stroke="${OUT}" stroke-width=".8"/>${tex('M-10 -1 Q0 -4 8 -2', '#E6F6C8', 1, 0.8)}</g>
      <g transform="translate(47 104)"><ellipse cx="0" cy="0" rx="5" ry="4.2" fill="url(#wiRd)" stroke="${OUT}" stroke-width="1.1"/><circle cx="4.6" cy="-1.5" r="2.2" fill="${OUT}"/><path d="M-4.6 0 L4.2 0" stroke="${OUT}" stroke-width=".8"/><circle cx="-2" cy="-2" r="1" fill="${OUT}"/><circle cx="1.4" cy="2" r="1" fill="${OUT}"/><circle cx="-2.2" cy="2.2" r=".8" fill="${OUT}"/>${shine(-1.5, -2.6, 1.4, 0.7, -20)}</g>`)}
    ${g('boden', `${hit(164, 22)}<path d="M0 187 Q40 183 80 186 T160 186 T240 185 T300 186 L300 190 L0 190 Z" fill="#4A2F1C"/><path d="M0 187 Q40 183 80 186 T160 186 T240 185 T300 186" fill="none" stroke="${OUT}" stroke-width="2"/>${[[20, 181, -12], [96, 182, 14], [160, 181, -4], [262, 181, 9]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})"><path d="M${x - 11} ${y} Q${x} ${y - 7} ${x + 11} ${y} Q${x} ${y + 6} ${x - 11} ${y} Z" fill="url(#wiLt)" stroke="${OUT}" stroke-width="1.1"/>${tex(`M${x - 9} ${y} L${x + 9} ${y}`, '#F2C88A', 0.8)}</g>`).join('')}${[0, 6, 12, 3, 9].map((dx, i) => `<circle cx="${56 + dx}" cy="${183 - (i > 2 ? 3 : 0)}" r="4" fill="url(#flLf)" stroke="${OUT}" stroke-width=".9"/>`).join('')}<g transform="translate(196 178) scale(1.25)"><path d="M-6 -3 l-5 -4 M-2 -4 l-2 -6 M3 -4 l2 -6 M-6 3 l-6 3 M-1 4 l-2 6 M4 4 l3 5 M10 -2 q5 -5 9 -4 M10 1 q6 -1 9 2" fill="none" stroke="${OUT}" stroke-width="1.2"/><ellipse cx="-1" cy="0" rx="9" ry="5.6" fill="url(#wiBt)" stroke="${OUT}" stroke-width="1.3"/><ellipse cx="9" cy="0" rx="3.4" ry="3" fill="#24305A" stroke="${OUT}" stroke-width="1.1"/>${tex('M-9 0 L7 0', '#0E1426', 0.8)}${tex('M-6 -3 Q-1 -5 4 -3.5', '#B8CCF2', 1.1, 0.8)}</g><g transform="translate(124 180) scale(1.25)"><path d="M7 -2 q4 -3 7 -2 M7 1 q4 0 7 2" fill="none" stroke="${OUT}" stroke-width="1"/><ellipse rx="8.5" ry="4.6" fill="url(#wiGy)" stroke="${OUT}" stroke-width="1.2"/>${tex('M-5 -4 L-5 4 M-2 -4.5 L-2 4.5 M1 -4.5 L1 4.5 M4 -4 L4 4', '#4E535E', 0.8, 0.8)}</g>`)}
    ${g('bluete', `${hit(8, 64)}${petals(50, 58, 16, 7, 1.9, '#FFD84A', 4.5, 0, 0.5)}${petals(50, 58, 10, 4.5, 1.8, '#F5AE00', 1.2, 9, 0.4, '#C98A00')}${petals(140, 48, 20, 15, 2.8, 'url(#flWt)', 6, 0, 0.5)}${disc(140, 48, 6.5)}${clover(232, 58, 11)}
      <g transform="translate(96 26)"><ellipse cx="-4" cy="-7" rx="5" ry="7.5" fill="#EEF6FF" fill-opacity=".85" stroke="${OUT}" stroke-width=".9" transform="rotate(-25 -4 -7)"/><ellipse cx="4" cy="-7" rx="5" ry="7.5" fill="#EEF6FF" fill-opacity=".85" stroke="${OUT}" stroke-width=".9" transform="rotate(25 4 -7)"/><ellipse cx="0" cy="0" rx="9.5" ry="6" fill="url(#flYe)" stroke="${OUT}" stroke-width="1.3"/><path d="M-3 -5.6 Q-4.5 0 -3 5.6 M2.5 -5.8 Q1 0 2.5 5.8" fill="none" stroke="${OUT}" stroke-width="2.2"/><circle cx="10" cy="0" r="3.4" fill="${OUT}"/><path d="M12 -2 q3 -4 6 -4 M12 -1 q4 -2 6 0" fill="none" stroke="${OUT}" stroke-width=".8"/><path d="M-9.5 0 l-3 0" stroke="${OUT}" stroke-width="1.2"/></g>
      <g transform="translate(186 26)"><path d="M0 -2 Q-6 -16 -18 -14 Q-22 -6 -14 0 Q-4 2 0 -2 Z M0 -2 Q6 -16 18 -14 Q22 -6 14 0 Q4 2 0 -2 Z" fill="url(#wiOr)" stroke="${OUT}" stroke-width="1.3"/><path d="M0 1 Q-6 2 -11 8 Q-8 13 -3 9 Q0 6 0 1 Z M0 1 Q6 2 11 8 Q8 13 3 9 Q0 6 0 1 Z" fill="#F7B267" stroke="${OUT}" stroke-width="1.2"/><circle cx="-14" cy="-10" r="1.6" fill="#fff"/><circle cx="14" cy="-10" r="1.6" fill="#fff"/><ellipse cx="0" cy="0" rx="1.8" ry="9" fill="${OUT}"/><path d="M-1 -8 Q-4 -15 -8 -17 M1 -8 Q4 -15 8 -17" fill="none" stroke="${OUT}" stroke-width=".9"/></g>
      <g transform="translate(244 42)"><ellipse cx="-3" cy="-7" rx="4.5" ry="6.5" fill="#EEF6FF" fill-opacity=".85" stroke="${OUT}" stroke-width=".9" transform="rotate(-20 -3 -7)"/><ellipse cx="0" cy="0" rx="8.5" ry="6.5" fill="#2A2A35" stroke="${OUT}" stroke-width="1.2"/><path d="M-2 -6 Q-3 0 -2 6 L3 6 Q4 0 3 -6 Z" fill="#FFC93C"/><path d="M-8.5 0 Q-7 -5 -5 -5.8 L-5 5.8 Q-7 5 -8.5 0 Z" fill="#FFF6E0"/><circle cx="9" cy="0.5" r="3" fill="${OUT}"/>${shine(-1, -3.5, 2.2, 1, -10)}</g>`)}</g>`,
  [['wurzel', 296, 234, 'end'], ['boden', 296, 176, 'end'], ['staengel', 296, 92, 'end'], ['bluete', 296, 20, 'end']]);
  S.PLANTS.wiese = WIESE;
  // Tiere und ihr Stockwerk (Index in LAYERS): nur Tiere, deren Platz eindeutig ist
  const ANIMALS = [
    { name: 'der Regenwurm', l: 0 }, { name: 'der Maulwurf', l: 0 }, { name: 'der Engerling', l: 0 },
    { name: 'der Laufkäfer', l: 1 }, { name: 'die Assel', l: 1 },
    { name: 'die Heuschrecke', l: 2 }, { name: 'die Spinne', l: 2 }, { name: 'die Blattlaus', l: 2 }, { name: 'die Raupe', l: 2 },
    { name: 'der Schmetterling', l: 3 }, { name: 'die Biene', l: 3 }, { name: 'die Hummel', l: 3 },
  ];
  const LAYER_ORDER = LAYERS.map((l) => ({ id: 'sw' + l.id, text: l.name }));
  const DEV = [
    { qid: 'enschm_', q: 'Wie entwickelt sich ein Schmetterling? Tippe der Reihe nach an.', items: [{ id: 's1', text: 'Ei' }, { id: 's2', text: 'Raupe' }, { id: 's3', text: 'Puppe' }, { id: 's4', text: 'Schmetterling (Falter)' }] },
    { qid: 'enmar_', q: 'Wie entwickelt sich ein Marienkäfer? Tippe der Reihe nach an.', items: [{ id: 'm1', text: 'Ei' }, { id: 'm2', text: 'Larve' }, { id: 'm3', text: 'Puppe' }, { id: 'm4', text: 'Marienkäfer' }] },
    { qid: 'enheu_', q: 'Wie entwickelt sich eine Heuschrecke? Tippe der Reihe nach an.', items: [{ id: 'h1', text: 'Ei im Boden' }, { id: 'h2', text: 'Kleine Larve ohne Flügel' }, { id: 'h3', text: 'Die Larve häutet sich mehrmals und wächst' }, { id: 'h4', text: 'Erwachsene Heuschrecke mit Flügeln' }] },
  ];
  const HERBAR = [
    { id: 'hb1', text: 'Nur häufige Pflanzen pflücken, geschützte stehen lassen.' },
    { id: 'hb2', text: 'Die Pflanze glatt zwischen Zeitungspapier legen.' },
    { id: 'hb3', text: 'Schwere Bücher darauflegen und die Pflanze pressen.' },
    { id: 'hb4', text: 'Ein bis zwei Wochen trocknen lassen und das Papier ab und zu wechseln.' },
    { id: 'hb5', text: 'Die trockene Pflanze mit Klebestreifen auf ein Blatt kleben.' },
    { id: 'hb6', text: 'Name, Fundort und Datum daneben schreiben.' },
  ];
  const WI_NOTES = {
    pflanzen: { title: 'Wiesenpflanzen erkennen', lines: ['Achte auf die Farbe der Blüte und die Form der Blätter.'].concat(FLORA.map((p) => p.note)) },
    stock: { title: 'Die Stockwerke der Wiese', lines: LAYERS.map((l, i) => `${i + 1}. ${l.name}: ${l.desc}`).concat(['Von unten nach oben: Wurzelschicht, Bodenschicht, Stängel- und Blattschicht, Blütenschicht.']) },
    entw: { title: 'Wie Kleintiere sich entwickeln', lines: ['Schmetterling: Ei, Raupe, Puppe, Falter.', 'Marienkäfer: Ei, Larve, Puppe, Käfer.', 'Mit Puppe heißt das vollständige Verwandlung.', 'Heuschrecke: Ei, Larve, die Larve häutet sich mehrmals, erwachsene Heuschrecke mit Flügeln.', 'Ohne Puppe heißt das unvollständige Verwandlung.'] },
    herbar: { title: 'Ein Herbarium anlegen', lines: HERBAR.map((h, i) => `${i + 1}. ${h.text}`).concat(['Ein Herbarium ist eine Sammlung gepresster, getrockneter Pflanzen.', 'Mit einem Bestimmungsbuch findest du den Namen einer Pflanze.']) },
    schutz: { title: 'Die Wiese schützen', lines: ['Geschützte Pflanzen wie Orchideen und Schlüsselblumen bleiben stehen.', 'Bleib auf den Wegen und tritt die Wiese nicht nieder.', 'Eine Blühwiese mit vielen Blumen gibt Bienen, Hummeln und Schmetterlingen Nahrung.', 'Wird nur ein- bis zweimal im Jahr gemäht, können die Blumen blühen und Samen bilden.', 'Nimm deinen Müll wieder mit.'] },
    sinne: { title: 'Die Wiese mit allen Sinnen', lines: ['Sehen: bunte Blüten, Tiere auf den Halmen. Mit der Becherlupe siehst du kleine Tiere groß.', 'Hören: Bienen summen, Heuschrecken zirpen.', 'Riechen: Blüten duften, frisch gemähtes Gras und Heu.', 'Tasten: weiche Gräser, raue Blätter. Vorsicht bei Brennnesseln.', 'Schmecken: Iss nie eine Pflanze, die du nicht sicher kennst. Manche sind giftig.'] },
    wiese: { title: 'Was ist eine Wiese?', lines: ['Auf einer Wiese wachsen vor allem Gräser und Kräuter.', 'Eine Wiese wird gemäht. Auf einer Weide fressen Tiere das Gras.', 'Heu ist getrocknetes Gras. Es ist Futter für Kühe, Pferde und Schafe im Winter.', 'Insekten haben sechs Beine, Spinnen haben acht.'] },
  };
  const WI_POOL = [
    // Pflanzen
    { id: 'wipf1', mod: 'pflanze', g: 'pflanzen', q: 'Was wird aus der gelben Blüte des Löwenzahns?', o: ['Eine Pusteblume', 'Eine Beere', 'Eine Ähre'], a: 0 },
    { id: 'wipf2', mod: 'pflanze', g: 'pflanzen', q: 'Wie verbreitet der Löwenzahn seine Samen?', o: ['Der Wind trägt sie an kleinen Fallschirmen fort', 'Tiere vergraben sie im Boden', 'Sie fallen direkt neben die Pflanze'], a: 0 },
    { id: 'wipf3', mod: 'pflanze', g: 'pflanzen', q: 'Was kommt heraus, wenn man einen Löwenzahnstängel abbricht?', o: ['Weißer Milchsaft', 'Roter Saft', 'Gar nichts'], a: 0 },
    { id: 'wipf4', mod: 'pflanze', g: 'pflanzen', q: 'Ein Kleeblatt besteht meistens aus drei Teilen.', rf: true, a: true },
    { id: 'wipf5', mod: 'pflanze', g: 'pflanzen', q: 'Der Scharfe Hahnenfuß ist giftig.', rf: true, a: true },
    { id: 'wipf6', mod: 'pflanze', g: 'pflanzen', q: 'Die Margerite ist kleiner als das Gänseblümchen.', rf: true, a: false, why: 'Die Margerite ist viel größer und wächst auf einem hohen Stängel.' },
    { id: 'wipf7', mod: 'pflanze', g: 'pflanzen', q: 'Auf welchen Wiesen wächst das Wiesen-Schaumkraut gern?', o: ['Auf feuchten Wiesen', 'Auf trockenem Sand', 'Im tiefen Wald'], a: 0 },
    { id: 'wipf8', mod: 'pflanze', g: 'pflanzen', q: 'Woran erkennst du eine Wiesenpflanze?', o: ['An der Blüte und an der Form der Blätter', 'Nur an der Größe', 'Nur am Geruch'], a: 0 },
    { id: 'wipf9', mod: 'pflanze', g: 'pflanzen', q: 'Welche Form haben die Blätter vom Sauerampfer?', o: ['Pfeilförmig', 'Rund', 'Gefiedert'], a: 0 },
    { id: 'wipf10', mod: 'pflanze', g: 'pflanzen', q: 'Was wächst auf einer Wiese vor allem?', o: ['Gräser und Kräuter', 'Bäume und Sträucher', 'Getreide und Kartoffeln'], a: 0 },
    { id: 'wipf11', mod: 'pflanze', g: 'wiese', q: 'Was ist der Unterschied zwischen Wiese und Weide?', o: ['Eine Wiese wird gemäht, auf einer Weide fressen Tiere das Gras', 'Es gibt keinen Unterschied', 'Auf einer Wiese wachsen nur Bäume'], a: 0 },
    { id: 'wipf12', mod: 'pflanze', g: 'wiese', q: 'Was ist Heu?', o: ['Getrocknetes Gras', 'Gepresstes Stroh vom Getreide', 'Frische Blätter vom Baum'], a: 0 },
    { id: 'wipf13', mod: 'pflanze', g: 'pflanzen', q: 'Wie viele Blütenblätter hat eine Blüte vom Scharfen Hahnenfuß?', o: ['5', '4', '20'], a: 0 },
    // Stockwerke
    { id: 'wist1', mod: 'stock', g: 'stock', q: 'Wie viele Stockwerke hat eine Wiese?', o: ['4', '2', '6'], a: 0 },
    { id: 'wist2', mod: 'stock', g: 'stock', q: 'Welches Stockwerk liegt ganz oben?', o: ['Die Blütenschicht', 'Die Bodenschicht', 'Die Wurzelschicht'], a: 0 },
    { id: 'wist3', mod: 'stock', g: 'stock', q: 'Welches Stockwerk liegt unter der Erde?', o: ['Die Wurzelschicht', 'Die Blütenschicht', 'Die Stängel- und Blattschicht'], a: 0 },
    { id: 'wist4', mod: 'stock', g: 'stock', q: 'Wie heißt die Bodenschicht auch, weil dort abgestorbene Blätter liegen?', o: ['Streuschicht', 'Blütenschicht', 'Laubdach'], a: 0 },
    { id: 'wist5', mod: 'stock', g: 'stock', q: 'Der Regenwurm lockert und düngt den Boden.', rf: true, a: true },
    { id: 'wist6', mod: 'stock', g: 'stock', q: 'Der Maulwurf frisst vor allem Wurzeln.', rf: true, a: false, why: 'Der Maulwurf frisst Regenwürmer, Larven und andere Kleintiere.' },
    { id: 'wist7', mod: 'stock', g: 'wiese', q: 'Wie viele Beine hat ein Insekt?', o: ['6', '8', '4'], a: 0 },
    { id: 'wist8', mod: 'stock', g: 'wiese', q: 'Eine Spinne ist ein Insekt.', rf: true, a: false, why: 'Spinnen haben acht Beine. Insekten haben sechs.' },
    { id: 'wist9', mod: 'stock', g: 'stock', q: 'Was holen Bienen und Schmetterlinge aus den Blüten?', o: ['Nektar', 'Erde', 'Wasser aus dem Boden'], a: 0 },
    { id: 'wist10', mod: 'stock', g: 'stock', q: 'Wozu baut die Spinne zwischen den Halmen ein Netz?', o: ['Damit sich Insekten darin fangen', 'Damit sie darin schlafen kann', 'Damit es nicht regnet'], a: 0 },
    { id: 'wist11', mod: 'stock', g: 'stock', q: 'Was fressen Marienkäfer gern?', o: ['Blattläuse', 'Regenwürmer', 'Wurzeln'], a: 0 },
    // Entwicklung
    { id: 'wien1', mod: 'entw', g: 'entw', q: 'Was kommt beim Schmetterling nach der Raupe?', o: ['Die Puppe', 'Das Ei', 'Die Larve'], a: 0 },
    { id: 'wien2', mod: 'entw', g: 'entw', q: 'Was frisst eine Raupe?', o: ['Blätter', 'Nektar', 'Andere Raupen'], a: 0 },
    { id: 'wien3', mod: 'entw', g: 'entw', q: 'Welches Tier entwickelt sich ohne Puppe?', o: ['Die Heuschrecke', 'Der Schmetterling', 'Der Marienkäfer'], a: 0 },
    { id: 'wien4', mod: 'entw', g: 'entw', q: 'Wie heißt die Entwicklung mit Ei, Larve, Puppe und erwachsenem Tier?', o: ['Vollständige Verwandlung', 'Unvollständige Verwandlung', 'Keimung'], a: 0 },
    { id: 'wien5', mod: 'entw', g: 'entw', q: 'Eine Heuschrecke macht eine unvollständige Verwandlung durch.', rf: true, a: true },
    { id: 'wien6', mod: 'entw', g: 'entw', q: 'Die Larve des Marienkäfers sieht schon genauso aus wie ein Marienkäfer.', rf: true, a: false, why: 'Die Larve ist länglich, dunkel und hat keine Punkte auf Flügeln. Erst nach der Puppe sieht sie aus wie ein Marienkäfer.' },
    { id: 'wien7', mod: 'entw', g: 'entw', q: 'Was macht eine Heuschreckenlarve, wenn ihre Haut zu eng wird?', o: ['Sie häutet sich', 'Sie verpuppt sich', 'Sie legt Eier'], a: 0 },
    { id: 'wien8', mod: 'entw', g: 'entw', q: 'Was passiert in der Puppe?', o: ['Die Raupe verwandelt sich in einen Schmetterling', 'Die Raupe schläft den Winter über und bleibt eine Raupe', 'Es wachsen Eier darin'], a: 0 },
    { id: 'wien9', mod: 'entw', g: 'entw', q: 'Womit saugt ein Schmetterling Nektar?', o: ['Mit seinem Rüssel', 'Mit seinen Flügeln', 'Mit seinen Fühlern'], a: 0 },
    { id: 'wien10', mod: 'entw', g: 'entw', q: 'Wie heißt das junge Tier, das beim Schmetterling aus dem Ei schlüpft?', o: ['Raupe', 'Puppe', 'Falter'], a: 0 },
    // Herbarium
    { id: 'wihe1', mod: 'herbar', g: 'herbar', q: 'Was ist ein Herbarium?', o: ['Eine Sammlung gepresster, getrockneter Pflanzen', 'Ein Garten für Kräuter', 'Ein Buch über Tiere'], a: 0 },
    { id: 'wihe2', mod: 'herbar', g: 'herbar', q: 'Was schreibst du zu einer Pflanze im Herbarium?', o: ['Name, Fundort und Datum', 'Nur deinen Namen', 'Die Uhrzeit und das Wetter'], a: 0 },
    { id: 'wihe3', mod: 'herbar', g: 'herbar', q: 'Womit findest du heraus, wie eine Pflanze heißt?', o: ['Mit einem Bestimmungsbuch', 'Mit einem Kochbuch', 'Mit einem Wörterbuch'], a: 0 },
    { id: 'wihe4', mod: 'herbar', g: 'herbar', q: 'Wie lange muss eine gepresste Pflanze ungefähr trocknen?', o: ['Ein bis zwei Wochen', 'Eine Stunde', 'Ein ganzes Jahr'], a: 0 },
    { id: 'wihe5', mod: 'herbar', g: 'herbar', q: 'Fürs Herbarium darfst du jede Pflanze pflücken, die dir gefällt.', rf: true, a: false, why: 'Nur häufige Pflanzen. Geschützte Pflanzen bleiben stehen.' },
    { id: 'wihe6', mod: 'herbar', g: 'herbar', q: 'Warum legt man die Pflanze zwischen Zeitungspapier?', o: ['Das Papier saugt die Feuchtigkeit auf', 'Damit sie weiterwächst', 'Damit sie bunter wird'], a: 0 },
    { id: 'wihe7', mod: 'herbar', g: 'herbar', q: 'Warum wechselt man das Papier beim Trocknen ab und zu?', o: ['Damit die Pflanze nicht schimmelt', 'Damit die Pflanze grüner wird', 'Damit sie schneller wächst'], a: 0 },
    // Schutz
    { id: 'wisc1', mod: 'schutz', g: 'schutz', q: 'Welche Pflanzen musst du auf der Wiese stehen lassen?', o: ['Geschützte Pflanzen wie Orchideen', 'Löwenzahn', 'Gänseblümchen'], a: 0 },
    { id: 'wisc2', mod: 'schutz', g: 'schutz', q: 'Warum soll man eine Wiese nicht niedertreten?', o: ['Pflanzen knicken um und Tiere verlieren ihr Zuhause', 'Weil das Gras sonst zu schnell wächst', 'Weil man sonst nasse Schuhe bekommt'], a: 0 },
    { id: 'wisc3', mod: 'schutz', g: 'schutz', q: 'Wem hilft eine Blühwiese mit vielen Blumen?', o: ['Bienen, Hummeln und Schmetterlingen', 'Nur den Rasenmähern', 'Niemandem'], a: 0 },
    { id: 'wisc4', mod: 'schutz', g: 'schutz', q: 'Wenn eine Wiese jede Woche gemäht wird, finden Insekten viele Blüten.', rf: true, a: false, why: 'Dann können die Blumen nicht blühen. Insekten finden kaum Nahrung.' },
    { id: 'wisc5', mod: 'schutz', g: 'schutz', q: 'Was machst du mit deinem Müll nach dem Picknick auf der Wiese?', o: ['Ich nehme ihn wieder mit', 'Ich lasse ihn im Gras liegen', 'Ich vergrabe ihn'], a: 0 },
    { id: 'wisc6', mod: 'schutz', g: 'schutz', q: 'Ohne Bienen und andere Insekten tragen viele Pflanzen keine Früchte.', rf: true, a: true },
    { id: 'wisc7', mod: 'schutz', g: 'schutz', q: 'Was bringen Bienen von Blüte zu Blüte?', o: ['Blütenstaub', 'Regenwasser', 'Erde'], a: 0 },
    { id: 'wisc8', mod: 'schutz', g: 'schutz', q: 'Was kannst du für Insekten tun?', o: ['Eine Ecke im Garten wild blühen lassen', 'Alle Blumen abpflücken', 'Den Rasen jede Woche mähen'], a: 0 },
    // Sinne
    { id: 'wisi1', mod: 'sinne', g: 'sinne', q: 'Welches Tier hörst du auf der Wiese zirpen?', o: ['Die Heuschrecke', 'Den Regenwurm', 'Den Schmetterling'], a: 0 },
    { id: 'wisi2', mod: 'sinne', g: 'sinne', q: 'Womit siehst du kleine Tiere auf der Wiese größer?', o: ['Mit der Becherlupe', 'Mit dem Kompass', 'Mit dem Thermometer'], a: 0 },
    { id: 'wisi3', mod: 'sinne', g: 'sinne', q: 'Du darfst jede Pflanze auf der Wiese probieren.', rf: true, a: false, why: 'Manche Pflanzen sind giftig. Iss nur, was ein Erwachsener sicher kennt.' },
    { id: 'wisi4', mod: 'sinne', g: 'sinne', q: 'Welche Pflanze brennt auf der Haut, wenn du sie berührst?', o: ['Die Brennnessel', 'Das Gänseblümchen', 'Der Klee'], a: 0 },
    { id: 'wisi5', mod: 'sinne', g: 'sinne', q: 'Mit welchem Sinn bemerkst du den Duft von frischem Heu?', o: ['Mit dem Riechen', 'Mit dem Hören', 'Mit dem Sehen'], a: 0 },
    { id: 'wisi6', mod: 'sinne', g: 'sinne', q: 'Mit welchem Sinn hörst du das Summen der Bienen?', o: ['Mit dem Hören', 'Mit dem Tasten', 'Mit dem Schmecken'], a: 0 },
    { id: 'wisi7', mod: 'sinne', g: 'sinne', q: 'Was spürst du, wenn du mit geschlossenen Augen über die Gräser streichst?', o: ['Wie weich oder rau sie sind', 'Welche Farbe sie haben', 'Wie sie heißen'], a: 0 },
    { id: 'wisi8', mod: 'sinne', g: 'sinne', q: 'Warum solltest du auf einer blühenden Wiese vorsichtig barfuß laufen?', o: ['Auf den Blüten sitzen Bienen', 'Das Gras ist zu heiß', 'Die Wiese ist zu laut'], a: 0 },
    { id: 'wisi9', mod: 'sinne', g: 'sinne', q: 'Wie viele Sinne hat der Mensch?', o: ['5', '3', '7'], a: 0 },
  ];
  const WI_MODULES = {
    pflanze: { name: 'Wiesenpflanzen', icon: '🌼', maxTier: 2, worldCap: [2], dmg: 12 },
    stock: { name: 'Stockwerke der Wiese', icon: '🏠', maxTier: 2, worldCap: [2], dmg: 14 },
    entw: { name: 'Vom Ei zum Tier', icon: '🦋', maxTier: 1, worldCap: [1], dmg: 14 },
    herbar: { name: 'Herbarium', icon: '📗', maxTier: 1, worldCap: [1], dmg: 14 },
    schutz: { name: 'Die Wiese schützen', icon: '🐝', maxTier: 1, worldCap: [1], dmg: 10 },
    sinne: { name: 'Mit allen Sinnen', icon: '👂', maxTier: 1, worldCap: [1], dmg: 10 },
  };
  const WI_TUT = {
    'pflanze:1': { title: 'Wiesenpflanzen', steps: ['Schau dir die Pflanze im Bild an: zuerst die Blüte, dann die Blätter.', 'Beispiel: Gelbe Blüte mit vielen schmalen Blütenblättern und daneben eine Pusteblume – das ist der Löwenzahn.', 'Tippe auf den richtigen Namen.'] },
    'pflanze:2': { title: 'Merkmale', steps: ['Jetzt gibt es kein Bild. Die Frage nennt ein Merkmal.', 'Beispiel: „Welche Pflanze hat Blätter, die aus drei Teilen bestehen?“ Das ist der Wiesen-Klee.', 'Denk an Blütenfarbe und Blattform und tippe auf die Pflanze, die passt.'] },
    'stock:1': { title: 'Stockwerke der Wiese', steps: ['Eine Wiese hat vier Stockwerke, von unten nach oben: Wurzelschicht, Bodenschicht, Stängel- und Blattschicht, Blütenschicht.', 'Beispiel: Der Regenwurm lebt im Boden zwischen den Wurzeln, also in der Wurzelschicht.', 'Leuchtet im Bild ein Stockwerk, tippe auf seinen Namen. Fragt die Aufgabe nach einem Tier, tippe auf sein Stockwerk.'] },
    'stock:2': { title: 'Stockwerk finden', steps: ['Jetzt andersherum: Oben steht der Name eines Stockwerks.', 'Beispiel: Die Blütenschicht ist ganz oben bei den Blüten.', 'Tippe im Bild auf dieses Stockwerk.'] },
    'stockord:1': { title: 'Stockwerke ordnen', steps: ['Die vier Stockwerke sind durcheinander.', 'Fang ganz unten an: Wurzelschicht, dann Bodenschicht, dann Stängel- und Blattschicht.', 'Zuletzt kommt die Blütenschicht. Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.'] },
    'entw:1': { title: 'Vom Ei zum Tier', steps: ['Fragen dazu, wie Schmetterling, Marienkäfer und Heuschrecke groß werden.', 'Beispiel: Aus dem Ei des Schmetterlings schlüpft eine Raupe. Die Raupe verpuppt sich, aus der Puppe kommt der Falter.', 'Tippe auf die richtige Antwort.'] },
    'entword:1': { title: 'Entwicklung ordnen', steps: ['Die Stufen der Entwicklung sind durcheinander.', 'Jede Entwicklung beginnt mit dem Ei und endet mit dem erwachsenen Tier.', 'Die Heuschrecke hat keine Puppe: Ihre Larve häutet sich mehrmals.'] },
    'herbar:1': { title: 'Herbarium', steps: ['Ein Herbarium ist eine Sammlung gepresster Pflanzen.', 'Beispiel: Zu jeder Pflanze gehören Name, Fundort und Datum.', 'Tippe auf die richtige Antwort.'] },
    'herbord:1': { title: 'Herbarium Schritt für Schritt', steps: ['Die Schritte sind durcheinander.', 'Erst pflücken, dann zwischen Papier legen, pressen und trocknen lassen.', 'Zuletzt aufkleben und beschriften.'] },
    'schutz:1': { title: 'Die Wiese schützen', steps: ['Fragen dazu, wie Pflanzen und Tiere auf der Wiese geschützt werden.', 'Beispiel: Geschützte Pflanzen wie Orchideen bleiben stehen.', 'Manchmal wählst du „Richtig“ oder „Falsch“, manchmal eine von drei Antworten.'] },
    'sinne:1': { title: 'Mit allen Sinnen', steps: ['Auf der Wiese kannst du sehen, hören, riechen und tasten.', 'Beispiel: Das Zirpen der Heuschrecken nimmst du mit den Ohren wahr, also mit dem Hören.', 'Tippe auf die richtige Antwort.'] },
  };
  function wiGen(cfg) {
    return (mod, tier, know, seq, opts) => {
      if (wantsPool(cfg, mod, opts)) return null;
      if (mod === 'pflanze') {
        if (tier >= 2 && Math.random() < 0.7) {
          const t = pick(TRAITS); const id = pick(t.has); const ans = FLORA.find((p) => p.id === id);
          const wrong = shuffle(FLORA.filter((p) => !t.has.includes(p.id) && !(t.skip || []).includes(p.id))).slice(0, 2).map((p) => p.name);
          return choice(mod, 'pflanzen', t.q, ans.name, wrong, 'wimerk_' + TRAITS.indexOf(t), { group: 'pflanze:2', tier: 2 });
        }
        if (Math.random() < 0.65) { const p = pick(FLORA); return choice(mod, 'pflanzen', 'Wie heißt diese Wiesenpflanze?', p.name, shuffle(FLORA.filter((x) => x !== p)).slice(0, 2).map((x) => x.name), 'wibild_' + p.id, { pic: floraSVG(p.id) }); }
        return null;
      }
      if (mod === 'stock') {
        const part = pick(LAYERS);
        if (tier >= 2 && Math.random() < 0.5) return { kind: 'parts-find', mod, tier: 2, group: 'stock:2', note: 'stock', plant: 'wiese', q: WIESE.find(part), part: part.id, answer: part.name, qid: 'wsf_' + part.id };
        const r = Math.random();
        if (r < 0.3) return { kind: 'parts', mod, tier: 1, group: 'stock:1', note: 'stock', plant: 'wiese', q: WIESE.ask(part), part: part.id, options: shuffle(LAYERS.map((l) => l.name)), answer: part.name, qid: 'ws_' + part.id };
        if (r < 0.6) { const an = pick(ANIMALS); return choice(mod, 'stock', `In welchem Stockwerk der Wiese lebt vor allem ${an.name}?`, LAYERS[an.l].name, shuffle(LAYERS.filter((_, i) => i !== an.l)).slice(0, 2).map((l) => l.name), 'wstier_' + ANIMALS.indexOf(an)); }
        if (r < 0.8) return orderTask(mod, 'stockord:1', 'stock', 'Tippe die Stockwerke der Wiese von unten nach oben an.', LAYER_ORDER, 'wsord_');
        return null;
      }
      if (mod === 'entw' && Math.random() < 0.5) { const d = pick(DEV); return orderTask(mod, 'entword:1', 'entw', d.q, d.items, d.qid); }
      if (mod === 'herbar' && Math.random() < 0.5) return orderTask(mod, 'herbord:1', 'herbar', 'So legst du ein Herbarium an: Tippe die Schritte der Reihe nach an.', HERBAR, 'wiherb_');
      return null;
    };
  }
  const WI = { modules: WI_MODULES, tut: WI_TUT, notes: WI_NOTES, pool: WI_POOL, worlds: 1, title: 'Die Wiese', icon: '🌼', sub: 'Wiesenpflanzen, Stockwerke, wie Kleintiere wachsen, Herbarium und Naturschutz',
    starters: [{ id: 'imkerin', type: 'pflanze', shape: 'imkerin', names: ['Die Imkerin', 'Die Imkerin', 'Die Imkerin'], hp: 70, desc: 'Ihre Bienenkästen stehen am Rand der Wiese. Sie weiß, welche Blumen ihre Bienen besuchen.', perk: 'heal',
      attacks: [{ name: 'Blütenstaub', mod: 'pflanze' }, { name: 'Bienenschwarm', mod: 'stock' }, { name: 'Honigwabe', mod: 'entw' }, { name: 'Imkerpfeife', mod: 'herbar' }] }],
    extra: { pflanze: 'Blütenstaub', stock: 'Bienenschwarm', entw: 'Honigwabe', herbar: 'Imkerpfeife', schutz: 'Blühstreifen', sinne: 'Wiesenduft' },
    enemies: { 1: {
      normal: [
        { name: 'Der Trampelpfad', type: 'normal', shape: 'trampelpfad', hp: 26, atk: 3 },
        { name: 'Die Trockenheit', type: 'feuer', shape: 'trockenheit', hp: 28, atk: 4 },
        { name: 'Die Plastiktüte', type: 'normal', shape: 'plastiktuete', hp: 24, atk: 4 },
        { name: 'Das Spritzmittel', type: 'wasser', shape: 'spritzmittel', hp: 30, atk: 3 },
      ],
      elite: { name: 'Die Mähmaschine', type: 'normal', shape: 'maehmaschine', hp: 45, atk: 5 },
      boss: { name: 'Die Straßenwalze', acc: 'die Straßenwalze', type: 'feuer', shape: 'strassenwalze', hp: 70, atk: 6, boss: true },
    } },
    moves: ['Mähbalken', 'Dürre', 'Trittspur', 'Sprühregen', 'Knisterfolie', 'Walzenstoß'],
    events: [
      { title: 'Die Bienenkästen', text: 'Ein Imker öffnet seinen Bienenkasten. Er fragt dich nach einer Wiesenpflanze und schenkt dir einen Trank.', opts: [{ label: 'Antworten', task: 'pflanze', g: 'pflanzen', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Becherlupe', text: 'Ein Mädchen hat eine Heuschrecke in der Becherlupe. Sie fragt dich, wo das Tier auf der Wiese lebt.', opts: [{ label: 'Antworten', task: 'stock', g: 'stock', win: { xp: 20 }, lose: { xp: 5 } }, { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } }] },
      { title: 'Das Herbarium', text: 'Im Klassenzimmer liegt ein dickes Buch mit gepressten Pflanzen. Die Lehrerin gibt dir einen Schild für eine richtige Antwort.', opts: [{ label: 'Antworten', task: 'herbar', g: 'herbar', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Blühstreifen', text: 'Am Feldrand hat eine Bäuerin einen Streifen voller Blumen gesät. Sie kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort.', opts: [{ label: 'Antworten', task: 'schutz', g: 'schutz', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Raupe am Blatt', text: 'An einem Blatt frisst eine grüne Raupe. Ein Junge fragt dich, was aus ihr wird, und gibt dir eine Chilischote für die Antwort.', opts: [{ label: 'Antworten', task: 'entw', g: 'entw', win: { item: 'keks' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Heuhaufen', text: 'Am Wiesenrand liegt frisches Heu. Hier ruhst du dich aus.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
    ] };
  WI.gen = wiGen(WI);

  /* ================= FRÜHER UND HEUTE (LB 1) ================= */
  // [früher, heute]: jedes „heute“ kommt nur einmal vor, damit jede Frage genau eine richtige Antwort hat
  const TOOLS = [
    ['Sense', 'Mähdrescher'], ['Pflug mit Pferden', 'Traktor mit Pflug'], ['Waschbrett', 'Waschmaschine'], ['Petroleumlampe', 'Elektrisches Licht'],
    ['Brunnen auf dem Hof', 'Wasserleitung mit Wasserhahn'], ['Backofen im Dorf', 'Bäckerei'], ['Schiefertafel und Griffel', 'Heft und Stift'], ['Eisschrank mit Eisblöcken', 'Kühlschrank'],
    ['Kohleofen im Zimmer', 'Heizung'], ['Pferdewagen', 'Auto'], ['Plumpsklo im Hof', 'Toilette mit Spülung'], ['Waschschüssel und Krug', 'Dusche'],
  ];
  const LINES = [
    { qid: 'zlver_', note: 'zeit', q: 'Was gab es zuerst? Tippe vom ältesten zum neuesten an.', items: [{ id: 'v1', text: 'Pferdewagen' }, { id: 'v2', text: 'Dampflok' }, { id: 'v3', text: 'Auto' }, { id: 'v4', text: 'Elektroauto' }] },
    { qid: 'zlnach_', note: 'zeit', q: 'Wie haben Menschen sich Nachrichten geschickt? Tippe vom ältesten zum neuesten an.', items: [{ id: 'n1', text: 'Brief' }, { id: 'n2', text: 'Telefon' }, { id: 'n3', text: 'Handy' }, { id: 'n4', text: 'Smartphone' }] },
    { qid: 'zllic_', note: 'zeit', q: 'Womit wurde es abends hell? Tippe vom ältesten zum neuesten an.', items: [{ id: 'l1', text: 'Kerze' }, { id: 'l2', text: 'Petroleumlampe' }, { id: 'l3', text: 'Glühbirne' }, { id: 'l4', text: 'LED-Lampe' }] },
    { qid: 'zlmus_', note: 'zeit', q: 'Womit hörte man Musik? Tippe vom ältesten zum neuesten an.', items: [{ id: 'u1', text: 'Grammophon' }, { id: 'u2', text: 'Kassettenrekorder' }, { id: 'u3', text: 'CD-Spieler' }, { id: 'u4', text: 'Musik aus dem Internet' }] },
    { qid: 'zlsch_', note: 'zeit', q: 'Womit wurde geschrieben? Tippe vom ältesten zum neuesten an.', items: [{ id: 'c1', text: 'Gänsefeder' }, { id: 'c2', text: 'Füller' }, { id: 'c3', text: 'Kugelschreiber' }, { id: 'c4', text: 'Tablet' }] },
  ];
  // Wo schlägst du nach? a = Quelle, die passt; skip = Quellen, die hier auch passen könnten
  const SOURCES = ['Sachbuch', 'Lexikon', 'Wörterbuch', 'Kindersuchmaschine', 'Kinderzeitschrift', 'Kindernachrichten im Fernsehen', 'Atlas'];
  const LOOKUP = [
    { q: 'Du weißt nicht, wie man „Rhythmus“ schreibt.', a: 'Wörterbuch', skip: ['Lexikon', 'Kindersuchmaschine'] },
    { q: 'Du willst ganz viel über Bienen erfahren und Bilder dazu ansehen.', a: 'Sachbuch', skip: ['Lexikon', 'Kindersuchmaschine', 'Kinderzeitschrift'] },
    { q: 'Du willst wissen, was heute in der Welt passiert ist.', a: 'Kindernachrichten im Fernsehen', skip: ['Kindersuchmaschine', 'Kinderzeitschrift'] },
    { q: 'Du suchst, wo das Land Polen liegt.', a: 'Atlas', skip: ['Lexikon', 'Kindersuchmaschine', 'Sachbuch'] },
    { q: 'Du willst im Internet sichere Seiten über Igel finden.', a: 'Kindersuchmaschine', skip: [] },
    { q: 'Du willst kurz nachschlagen, was ein Vulkan ist. Die Stichwörter stehen nach dem Abc geordnet.', a: 'Lexikon', skip: ['Kindersuchmaschine', 'Sachbuch', 'Wörterbuch'] },
    { q: 'Du willst jeden Monat neue Berichte, Rätsel und Bastelideen lesen.', a: 'Kinderzeitschrift', skip: [] },
    { q: 'Du suchst den Artikel zum Wort „Rucksack“: der, die oder das?', a: 'Wörterbuch', skip: ['Lexikon', 'Kindersuchmaschine'] },
    { q: 'Du willst sehen, durch welche Länder die Donau fließt.', a: 'Atlas', skip: ['Lexikon', 'Kindersuchmaschine', 'Sachbuch'] },
  ];
  const FR_NOTES = {
    geraete: { title: 'Geräte früher und heute', lines: TOOLS.map(([a, b]) => `Früher: ${a} – heute: ${b}.`) },
    kinder: { title: 'Kinder früher und heute', lines: ['Früher mussten Kinder auf dem Land viel mithelfen: Tiere füttern, Holz holen, bei der Ernte helfen.', 'Den Schulweg gingen fast alle zu Fuß, oft sehr weit.', 'In der Schule schrieben sie mit dem Griffel auf eine Schiefertafel.', 'Heute haben Kinder mehr freie Zeit. Viele fahren mit dem Bus oder Rad zur Schule.'] },
    berufe: { title: 'Berufe früher und heute', lines: ['Früher gab es in jedem Dorf Schmied, Stellmacher, Müller und Bäcker.', 'Viele Menschen arbeiteten in der Landwirtschaft.', 'Heute arbeiten weniger Menschen auf dem Land, aber mit großen Maschinen.', 'Neue Berufe sind dazugekommen, zum Beispiel in der Arbeit mit Computern.', 'Früher arbeiteten meist nur die Männer außer Haus. Heute arbeiten Frauen und Männer.'] },
    freizeit: { title: 'Freizeit früher und heute', lines: ['Früher spielten Kinder vor allem draußen und ohne Strom: Murmeln, Seilspringen, Kreisel, Verstecken.', 'Spielzeug war oft selbst gebaut, aus Holz oder Stoff.', 'Heute gibt es auch Fernsehen, Computer und Tablet.', 'Viele Spiele von früher spielen Kinder heute noch.'] },
    zeit: { title: 'Die Zeitleiste', lines: ['Auf einer Zeitleiste steht das Älteste links, das Neueste rechts.', 'Pferdewagen, Dampflok, Auto, Elektroauto.', 'Brief, Telefon, Handy, Smartphone.', 'Kerze, Petroleumlampe, Glühbirne, LED-Lampe.', 'Gänsefeder, Füller, Kugelschreiber, Tablet.'] },
    kultur: { title: 'Viele Sprachen', lines: ['„Hallo“ heißt auf Englisch „Hello“, auf Französisch „Bonjour“, auf Spanisch „Hola“.', 'Auf Türkisch sagt man „Merhaba“, auf Italienisch „Ciao“.', 'Auf Polnisch sagt man „Dzień dobry“, auf Tschechisch „Dobrý den“. Beides heißt „Guten Tag“.', 'Viele Kinder sprechen zu Hause eine andere Sprache als in der Schule. Wer zwei Sprachen spricht, ist zweisprachig.', 'Vieles, was wir für ganz unseres halten, kam von weit her: die Kartoffel und die Tomate aus Amerika, unsere Ziffern über arabische Länder.'] },
    feste: { title: 'Feste in aller Welt', lines: ['Weihnachten: Christen feiern die Geburt von Jesus.', 'Zuckerfest: Muslime feiern das Ende des Fastenmonats Ramadan, besuchen die Familie und schenken Süßigkeiten.', 'Chanukka: Juden feiern acht Tage lang ein Lichterfest. Jeden Abend wird ein Licht mehr am Leuchter angezündet.', 'Diwali: Hindus feiern das Lichterfest mit vielen Öllampen. Das Licht besiegt die Dunkelheit.', 'Neujahr feiern nicht alle am 1. Januar: Das chinesische Neujahrsfest ist im Januar oder Februar, das persische Neujahrsfest Nouruz im März.'] },
    essen: { title: 'Essen aus aller Welt', lines: ['Pizza und Spaghetti kommen aus Italien.', 'Sushi kommt aus Japan, Tacos aus Mexiko, Paella aus Spanien.', 'Pierogi sind gefüllte Teigtaschen aus Polen. Knödel isst man auch in Tschechien.', 'Die Kartoffel kam aus Südamerika zu uns.'] },
    medien: { title: 'Wo schlage ich nach?', lines: ['Wörterbuch: Wie schreibt man ein Wort?', 'Lexikon: kurze Erklärungen zu vielen Stichwörtern, nach dem Abc geordnet.', 'Sachbuch: viel Wissen und Bilder zu einem Thema.', 'Atlas: Karten von Ländern, Flüssen und Gebirgen.', 'Kindersuchmaschine: sucht im Internet nur auf geprüften Seiten für Kinder.', 'Kinderzeitschrift: erscheint regelmäßig mit neuen Berichten. Kindernachrichten: was heute in der Welt passiert ist.'] },
    suche: { title: 'Gut suchen', lines: ['Gib Stichwörter ein, keinen ganzen Satz: „Igel Winterschlaf“.', 'Prüfe, ob du das Wort richtig geschrieben hast.', 'Lies mehrere Quellen und vergleiche sie.'] },
    pruefen: { title: 'Kann das stimmen?', lines: ['Wer hat es geschrieben? Weiß diese Person oder Zeitung gut Bescheid?', 'Steht es auch woanders, zum Beispiel in einem Sachbuch?', 'Ist es Werbung? Werbung will etwas verkaufen.', 'Fotos können verändert sein.', 'Wenn du unsicher bist, frag einen Erwachsenen.'] },
  };
  const FR_POOL = [
    // Geräte
    { id: 'frge1', mod: 'geraet', g: 'geraete', q: 'Wozu brauchte man früher das Waschbrett?', o: ['Zum Wäschewaschen mit der Hand', 'Zum Brotschneiden', 'Zum Schreiben'], a: 0 },
    { id: 'frge2', mod: 'geraet', g: 'geraete', q: 'Woher holten viele Familien früher ihr Wasser?', o: ['Aus dem Brunnen', 'Aus dem Wasserhahn in der Küche', 'Aus dem Kühlschrank'], a: 0 },
    { id: 'frge3', mod: 'geraet', g: 'geraete', q: 'Womit mähte man früher das Getreide?', o: ['Mit der Sense', 'Mit dem Rasenmäher', 'Mit der Schere'], a: 0 },
    { id: 'frge4', mod: 'geraet', g: 'geraete', q: 'Was zog früher den Pflug über das Feld?', o: ['Pferde oder Ochsen', 'Ein Traktor', 'Ein Auto'], a: 0 },
    { id: 'frge5', mod: 'geraet', g: 'geraete', q: 'Wie wurde früher im Winter geheizt?', o: ['Mit einem Ofen, in dem Holz oder Kohle brannte', 'Mit Strom aus der Steckdose', 'Gar nicht'], a: 0 },
    { id: 'frge6', mod: 'geraet', g: 'geraete', q: 'Früher gab es in jedem Haus elektrisches Licht.', rf: true, a: false, why: 'Früher brannten Kerzen und Petroleumlampen. Strom kam erst nach und nach in die Häuser.' },
    { id: 'frge7', mod: 'geraet', g: 'geraete', q: 'Wie hielt man früher Essen kühl?', o: ['Im Keller oder im Eisschrank mit Eisblöcken', 'Im Kühlschrank mit Strom', 'Auf dem warmen Ofen'], a: 0 },
    { id: 'frge8', mod: 'geraet', g: 'geraete', q: 'Viele Arbeiten, die heute Maschinen machen, machten Menschen früher mit der Hand.', rf: true, a: true },
    { id: 'frge9', mod: 'geraet', g: 'geraete', q: 'Wo wurde früher in vielen Dörfern das Brot gebacken?', o: ['Im gemeinsamen Backofen des Dorfes', 'Im Supermarkt', 'Im Kühlschrank'], a: 0 },
    // Alltag
    { id: 'fral1', mod: 'alltag', g: 'kinder', q: 'Wie kamen Kinder früher auf dem Land meistens zur Schule?', o: ['Zu Fuß', 'Mit dem Schulbus', 'Mit dem Flugzeug'], a: 0 },
    { id: 'fral2', mod: 'alltag', g: 'kinder', q: 'Was mussten Kinder auf dem Land früher oft tun?', o: ['Auf dem Feld und im Stall mithelfen', 'Jeden Tag fernsehen', 'Mit dem Handy spielen'], a: 0 },
    { id: 'fral3', mod: 'alltag', g: 'kinder', q: 'Worauf schrieben Kinder früher in der Schule?', o: ['Auf eine Schiefertafel', 'Auf ein Tablet', 'Auf eine Tafel aus Glas'], a: 0 },
    { id: 'fral4', mod: 'alltag', g: 'freizeit', q: 'Welches Spiel spielten Kinder schon früher ohne Strom?', o: ['Murmeln', 'Videospiele', 'Spiele auf dem Tablet'], a: 0 },
    { id: 'fral5', mod: 'alltag', g: 'freizeit', q: 'Spielzeug war früher oft selbst gebaut, aus Holz oder Stoff.', rf: true, a: true },
    { id: 'fral6', mod: 'alltag', g: 'freizeit', q: 'Was gibt es heute in der Freizeit, was es früher nicht gab?', o: ['Fernsehen und Computer', 'Seilspringen', 'Verstecken spielen'], a: 0 },
    { id: 'fral7', mod: 'alltag', g: 'berufe', q: 'Was machte früher der Schmied?', o: ['Er schmiedete Hufeisen und Werkzeug aus Eisen', 'Er backte Brot', 'Er nähte Kleider'], a: 0 },
    { id: 'fral8', mod: 'alltag', g: 'berufe', q: 'Früher arbeiteten viel mehr Menschen in der Landwirtschaft als heute.', rf: true, a: true },
    { id: 'fral9', mod: 'alltag', g: 'berufe', q: 'Wer arbeitet heute außer Haus?', o: ['Frauen und Männer', 'Nur Männer', 'Nur Frauen'], a: 0 },
    { id: 'fral10', mod: 'alltag', g: 'berufe', q: 'Früher arbeiteten meist nur die Männer außer Haus.', rf: true, a: true },
    { id: 'fral11', mod: 'alltag', g: 'berufe', q: 'Welchen Beruf gab es früher noch nicht?', o: ['Programmiererin am Computer', 'Bäcker', 'Müllerin'], a: 0 },
    { id: 'fral12', mod: 'alltag', g: 'kinder', q: 'Wen kannst du fragen, wenn du wissen willst, wie Kinder früher gelebt haben?', o: ['Oma und Opa', 'Ein Baby', 'Den Wetterbericht'], a: 0 },
    { id: 'fral13', mod: 'alltag', g: 'kinder', q: 'Wo kann man sich Dinge aus früherer Zeit ansehen?', o: ['Im Heimatmuseum', 'Im Supermarkt', 'Im Schwimmbad'], a: 0 },
    // Zeit
    { id: 'frze1', mod: 'zeit', g: 'zeit', q: 'Was gab es zuerst?', o: ['Die Dampflok', 'Das Auto', 'Das Elektroauto'], a: 0 },
    { id: 'frze2', mod: 'zeit', g: 'zeit', q: 'Was ist am neuesten?', o: ['Das Smartphone', 'Das Telefon', 'Der Brief'], a: 0 },
    { id: 'frze3', mod: 'zeit', g: 'zeit', q: 'Wo steht auf einer Zeitleiste das Älteste?', o: ['Am Anfang, links', 'In der Mitte', 'Am Ende, rechts'], a: 0 },
    { id: 'frze4', mod: 'zeit', g: 'zeit', q: 'Die Glühbirne gab es vor der Kerze.', rf: true, a: false, why: 'Kerzen gibt es schon sehr lange. Die Glühbirne ist viel jünger.' },
    { id: 'frze5', mod: 'zeit', g: 'zeit', q: 'Womit schrieb man, bevor es den Füller gab?', o: ['Mit einer Gänsefeder und Tinte', 'Mit dem Kugelschreiber', 'Mit dem Tablet'], a: 0 },
    // Kultur
    { id: 'frku1', mod: 'kultur', g: 'kultur', q: 'In welcher Sprache sagt man „Bonjour“?', o: ['Französisch', 'Englisch', 'Polnisch'], a: 0 },
    { id: 'frku2', mod: 'kultur', g: 'kultur', q: 'In welcher Sprache sagt man „Hola“?', o: ['Spanisch', 'Türkisch', 'Tschechisch'], a: 0 },
    { id: 'frku3', mod: 'kultur', g: 'kultur', q: 'In welcher Sprache sagt man „Merhaba“ zur Begrüßung?', o: ['Türkisch', 'Französisch', 'Polnisch'], a: 0 },
    { id: 'frku4', mod: 'kultur', g: 'kultur', q: 'In welchem Nachbarland Sachsens sagt man „Dzień dobry“?', o: ['Polen', 'Frankreich', 'Spanien'], a: 0 },
    { id: 'frku5', mod: 'kultur', g: 'kultur', q: 'In welchem Nachbarland Sachsens sagt man „Dobrý den“?', o: ['Tschechien', 'Italien', 'England'], a: 0 },
    { id: 'frku6', mod: 'kultur', g: 'kultur', q: 'Wie nennt man ein Kind, das zwei Sprachen spricht?', o: ['Zweisprachig', 'Zweifarbig', 'Zweiseitig'], a: 0 },
    { id: 'frku7', mod: 'kultur', g: 'kultur', q: 'Woher kam die Kartoffel zu uns?', o: ['Aus Südamerika', 'Aus Sachsen', 'Aus China'], a: 0 },
    { id: 'frku8', mod: 'kultur', g: 'kultur', q: 'Ein Kind, das noch wenig Deutsch spricht, kann trotzdem gut mitspielen.', rf: true, a: true },
    { id: 'frku9', mod: 'kultur', g: 'kultur', q: 'Auf welchem Weg kamen unsere Ziffern 0 bis 9 zu uns?', o: ['Über arabische Länder', 'Aus Amerika', 'Sie wurden in Sachsen erfunden'], a: 0 },
    { id: 'frku10', mod: 'kultur', g: 'feste', q: 'Was feiern Christen an Weihnachten?', o: ['Die Geburt von Jesus', 'Das Ende des Ramadan', 'Den Beginn des Frühlings'], a: 0 },
    { id: 'frku11', mod: 'kultur', g: 'feste', q: 'Was feiern Muslime beim Zuckerfest?', o: ['Das Ende des Fastenmonats Ramadan', 'Die Geburt von Jesus', 'Das neue Jahr im März'], a: 0 },
    { id: 'frku12', mod: 'kultur', g: 'feste', q: 'Wie lange feiern Juden Chanukka?', o: ['Acht Tage', 'Einen Tag', 'Einen Monat'], a: 0 },
    { id: 'frku13', mod: 'kultur', g: 'feste', q: 'Welches Fest feiern Hindus mit vielen Öllampen als Lichterfest?', o: ['Diwali', 'Ostern', 'Das Zuckerfest'], a: 0 },
    { id: 'frku14', mod: 'kultur', g: 'feste', q: 'Alle Menschen auf der Welt feiern Neujahr am 1. Januar.', rf: true, a: false, why: 'Das chinesische Neujahrsfest ist im Januar oder Februar, das persische Neujahrsfest Nouruz im März.' },
    { id: 'frku15', mod: 'kultur', g: 'feste', q: 'Bei Chanukka wird jeden Abend ein Licht mehr angezündet.', rf: true, a: true },
    { id: 'frku16', mod: 'kultur', g: 'feste', q: 'Wann ist das persische Neujahrsfest Nouruz?', o: ['Im März, wenn der Frühling beginnt', 'Am 24. Dezember', 'Im August'], a: 0 },
    { id: 'frku17', mod: 'kultur', g: 'essen', q: 'Aus welchem Land kommt die Pizza?', o: ['Italien', 'Japan', 'Mexiko'], a: 0 },
    { id: 'frku18', mod: 'kultur', g: 'essen', q: 'Aus welchem Land kommt Sushi?', o: ['Japan', 'Spanien', 'Polen'], a: 0 },
    { id: 'frku19', mod: 'kultur', g: 'essen', q: 'Was sind Pierogi aus Polen?', o: ['Gefüllte Teigtaschen', 'Eine Suppe aus Fisch', 'Ein Kuchen aus Reis'], a: 0 },
    { id: 'frku20', mod: 'kultur', g: 'essen', q: 'Aus welchem Land kommen Tacos?', o: ['Mexiko', 'Italien', 'Tschechien'], a: 0 },
    // Medien
    { id: 'frme1', mod: 'medien', g: 'medien', q: 'Wie sind die Stichwörter in einem Lexikon geordnet?', o: ['Nach dem Abc', 'Nach der Farbe', 'Nach der Länge'], a: 0 },
    { id: 'frme2', mod: 'medien', g: 'medien', q: 'Was ist das Besondere an einer Kindersuchmaschine?', o: ['Sie zeigt nur geprüfte Seiten für Kinder', 'Sie findet alles auf der Welt', 'Sie funktioniert ohne Internet'], a: 0 },
    { id: 'frme3', mod: 'medien', g: 'medien', q: 'Ein Wörterbuch erklärt dir ausführlich, wie Bienen leben.', rf: true, a: false, why: 'Im Wörterbuch steht, wie man ein Wort schreibt. Über Bienen erfährst du mehr im Sachbuch.' },
    { id: 'frme4', mod: 'medien', g: 'medien', q: 'Wo findest du Karten von Ländern und Flüssen?', o: ['Im Atlas', 'Im Wörterbuch', 'In der Kinderzeitschrift'], a: 0 },
    { id: 'frme5', mod: 'medien', g: 'medien', q: 'Was ist ein Sachbuch?', o: ['Ein Buch mit Wissen und Bildern zu einem Thema', 'Ein Märchenbuch', 'Ein Heft zum Ausmalen'], a: 0 },
    { id: 'frme6', mod: 'medien', g: 'suche', q: 'Du willst wissen, wie lange Igel Winterschlaf halten. Was tippst du in die Kindersuchmaschine?', o: ['Igel Winterschlaf', 'Hallo, ich möchte gern etwas wissen', 'Tiere'], a: 0 },
    { id: 'frme7', mod: 'medien', g: 'suche', q: 'Warum gibt man in eine Suchmaschine Stichwörter statt eines ganzen Satzes ein?', o: ['Die wichtigen Wörter führen schneller zum Ziel', 'Sätze sind verboten', 'Lange Sätze machen das Internet langsam'], a: 0 },
    { id: 'frme8', mod: 'medien', g: 'suche', q: 'Die Suchmaschine findet nichts. Was prüfst du zuerst?', o: ['Ob das Stichwort richtig geschrieben ist', 'Ob der Bildschirm sauber ist', 'Wie spät es ist'], a: 0 },
    // Prüfen
    { id: 'frpr1', mod: 'pruefen', g: 'pruefen', q: 'Was ist eine gute Frage, wenn du etwas Seltsames im Internet liest?', o: ['Wer hat das geschrieben?', 'Welche Farbe hat die Seite?', 'Wie viele Bilder sind darauf?'], a: 0 },
    { id: 'frpr2', mod: 'pruefen', g: 'pruefen', q: 'Alles, was im Internet steht, ist wahr.', rf: true, a: false, why: 'Jeder kann etwas ins Internet schreiben. Vergleiche mit anderen Quellen.' },
    { id: 'frpr3', mod: 'pruefen', g: 'pruefen', q: 'Wie prüfst du, ob eine Nachricht stimmt?', o: ['Ich schaue, ob es auch woanders steht', 'Ich glaube es, weil es spannend klingt', 'Ich schicke es sofort weiter'], a: 0 },
    { id: 'frpr4', mod: 'pruefen', g: 'pruefen', q: 'Fotos können verändert sein.', rf: true, a: true },
    { id: 'frpr5', mod: 'pruefen', g: 'pruefen', q: 'Was will Werbung?', o: ['Etwas verkaufen', 'Dir ehrlich alles erklären', 'Dir bei den Hausaufgaben helfen'], a: 0 },
    { id: 'frpr6', mod: 'pruefen', g: 'pruefen', q: 'Eine Seite sagt: „Kühe können fliegen!“ Was machst du?', o: ['Im Sachbuch nachsehen und einen Erwachsenen fragen', 'Es allen in der Klasse weitererzählen', 'Es glauben, weil es im Internet steht'], a: 0 },
    { id: 'frpr7', mod: 'pruefen', g: 'pruefen', q: 'Welche Quelle ist für eine Sachfrage meistens verlässlicher?', o: ['Ein Sachbuch aus der Bücherei', 'Ein Spruch auf einer Werbetafel', 'Ein Gerücht auf dem Schulhof'], a: 0 },
    { id: 'frpr8', mod: 'pruefen', g: 'suche', q: 'Warum vergleichst du mehrere Quellen?', o: ['Damit ich merke, ob etwas stimmt', 'Damit ich länger lesen muss', 'Weil eine Quelle immer falsch ist'], a: 0 },
  ];
  const FR_MODULES = {
    geraet: { name: 'Geräte früher und heute', icon: '🪣', maxTier: 1, worldCap: [1], dmg: 12 },
    alltag: { name: 'Leben früher und heute', icon: '🏡', maxTier: 1, worldCap: [1], dmg: 12 },
    zeit: { name: 'Zeitleiste', icon: '⏳', maxTier: 1, worldCap: [1], dmg: 16 },
    kultur: { name: 'Sprachen, Feste, Essen', icon: '🌍', maxTier: 1, worldCap: [1], dmg: 12 },
    medien: { name: 'Wo schlage ich nach?', icon: '📚', maxTier: 1, worldCap: [1], dmg: 14 },
    pruefen: { name: 'Kann das stimmen?', icon: '🔎', maxTier: 1, worldCap: [1], dmg: 12 },
  };
  const FR_TUT = {
    'geraet:1': { title: 'Geräte früher und heute', steps: ['Vieles, was heute eine Maschine macht, wurde früher mit der Hand oder mit einfachen Geräten gemacht.', 'Beispiel: Früher wusch man die Wäsche auf dem Waschbrett, heute in der Waschmaschine.', 'Tippe auf das Gerät, das dieselbe Arbeit macht.'] },
    'alltag:1': { title: 'Leben früher und heute', steps: ['Fragen zu Kindern, Berufen und Freizeit früher und heute.', 'Beispiel: Früher halfen Kinder auf dem Land im Stall und bei der Ernte.', 'Tippe auf die richtige Antwort.'] },
    'zeit:1': { title: 'Zeitleiste', steps: ['Fragen dazu, was es zuerst gab.', 'Beispiel: Die Kerze ist viel älter als die Glühbirne.', 'Tippe auf die richtige Antwort.'] },
    'zeitord:1': { title: 'Zeitleiste ordnen', steps: ['Vier Dinge sind durcheinander.', 'Tippe zuerst das Älteste an, dann das Nächste.', 'Beispiel: Kerze, Petroleumlampe, Glühbirne, LED-Lampe.'] },
    'kultur:1': { title: 'Sprachen, Feste, Essen', steps: ['Menschen aus vielen Ländern leben bei uns. Sie sprechen andere Sprachen und feiern andere Feste.', 'Beispiel: „Bonjour“ heißt auf Französisch „Guten Tag“. Beim Zuckerfest feiern Muslime das Ende des Ramadan.', 'Tippe auf die richtige Antwort.'] },
    'medien:1': { title: 'Wo schlage ich nach?', steps: ['Für jede Frage gibt es eine passende Quelle.', 'Beispiel: Wie man ein Wort schreibt, steht im Wörterbuch. Wo ein Land liegt, zeigt der Atlas.', 'Tippe auf die Quelle, die am besten passt.'] },
    'pruefen:1': { title: 'Kann das stimmen?', steps: ['Nicht alles, was man liest, ist wahr.', 'Frag dich: Wer hat es geschrieben? Steht es auch woanders? Ist es Werbung?', 'Tippe auf die richtige Antwort.'] },
  };
  function frGen(cfg) {
    return (mod, tier, know, seq, opts) => {
      if (wantsPool(cfg, mod, opts)) return null;
      if (mod === 'geraet' && Math.random() < 0.6) {
        const i = rnd(0, TOOLS.length - 1); const others = shuffle(TOOLS.filter((_, j) => j !== i)).slice(0, 2);
        if (Math.random() < 0.6) return choice(mod, 'geraete', `Früher: ${TOOLS[i][0]}. Was benutzt man heute dafür?`, TOOLS[i][1], others.map((x) => x[1]), 'frneu_' + i);
        return choice(mod, 'geraete', `Heute: ${TOOLS[i][1]}. Was benutzte man früher dafür?`, TOOLS[i][0], others.map((x) => x[0]), 'fralt_' + i);
      }
      if (mod === 'zeit' && Math.random() < 0.7) { const l = pick(LINES); return orderTask(mod, 'zeitord:1', l.note, l.q, l.items, l.qid); }
      if (mod === 'medien' && Math.random() < 0.5) {
        const x = pick(LOOKUP); const wrong = shuffle(SOURCES.filter((s) => s !== x.a && !x.skip.includes(s))).slice(0, 2);
        return choice(mod, 'medien', `${x.q} Wo schlägst du nach?`, x.a, wrong, 'frquel_' + LOOKUP.indexOf(x));
      }
      return null;
    };
  }
  // Dilemma-Karten wie bei Gute Freunde: jede Wahl bekommt dieselbe Belohnung
  const FR = { modules: FR_MODULES, tut: FR_TUT, notes: FR_NOTES, pool: FR_POOL, worlds: 1, title: 'Früher und heute', icon: '🕰️', sub: 'Leben auf dem Land früher, Zeitleiste, Sprachen und Feste, Nachschlagen und Prüfen',
    starters: [{ id: 'heimatforscherin', type: 'normal', shape: 'heimatforscherin', names: ['Die Heimatforscherin', 'Die Heimatforscherin', 'Die Heimatforscherin'], hp: 70, desc: 'Sie sammelt alte Fotos und Geräte für das Heimatmuseum und schreibt auf, was die Großeltern erzählen.', perk: 'crit',
      attacks: [{ name: 'Petroleumlampe', mod: 'geraet' }, { name: 'Fotoalbum', mod: 'zeit' }, { name: 'Weltkarte', mod: 'kultur' }, { name: 'Karteikasten', mod: 'medien' }] }],
    extra: { geraet: 'Petroleumlampe', alltag: 'Schiefertafel', zeit: 'Fotoalbum', kultur: 'Weltkarte', medien: 'Karteikasten', pruefen: 'Zeitungsarchiv' },
    enemies: { 1: {
      normal: [
        { name: 'Das Spinnennetz', type: 'normal', shape: 'spinnennetz', hp: 24, atk: 4 },
        { name: 'Der Schimmelfleck', type: 'pflanze', shape: 'schimmelfleck', hp: 28, atk: 3 },
        { name: 'Der Stromausfall', type: 'feuer', shape: 'stromausfall', hp: 26, atk: 4 },
        { name: 'Das Vorurteil', type: 'normal', shape: 'vorurteil', hp: 30, atk: 3 },
      ],
      elite: { name: 'Die Falschmeldung', type: 'normal', shape: 'falschmeldung', hp: 45, atk: 5 },
      boss: { name: 'Das große Vergessen', acc: 'das große Vergessen', type: 'wasser', shape: 'vergessen', hp: 70, atk: 6, boss: true },
    } },
    moves: ['Staubschicht', 'Spinnfaden', 'Stockflecken', 'Kurzschluss', 'Schlagzeile', 'Gedächtnislücke'],
    events: [
      { title: 'Das Heimatmuseum', text: 'Im Heimatmuseum steht ein Waschbrett neben einer Sense. Der Museumswärter fragt dich nach den Geräten und schenkt dir einen Trank.', opts: [{ label: 'Antworten', task: 'geraet', g: 'geraete', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Bücherei', text: 'Die Bibliothekarin sortiert Lexika ins Regal. Sie gibt dir einen Schild, wenn du ihre Frage beantwortest.', opts: [{ label: 'Antworten', task: 'medien', g: 'medien', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Das Straßenfest', text: 'Auf dem Straßenfest gibt es Essen aus vielen Ländern. Ein Koch fragt dich nach einem Fest und gibt dir eine Chilischote.', opts: [{ label: 'Antworten', task: 'kultur', g: 'feste', win: { item: 'keks' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Opa erzählt', text: 'Opa sitzt auf der Bank vor dem Haus und erzählt, wie er als Kind gelebt hat. Er kennt eine Eselsbrücke.', opts: [{ label: 'Antworten', task: 'alltag', g: 'kinder', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } }] },
      { title: 'Ein neues Kind in der Klasse', dilemma: true, reward: { hp: 5 }, text: 'In deine Klasse kommt Daria. Sie ist mit ihrer Familie aus einem anderen Land gekommen und spricht noch wenig Deutsch. In der Pause steht sie allein am Zaun.', opts: [
        { label: 'Ich zeige ihr unser Fangspiel.', then: 'Für Fangen braucht man kaum Worte. Daria rennt mit und lacht.', think: 'Wie kann man sich verständigen, ohne dieselbe Sprache zu sprechen?' },
        { label: 'Ich frage, wie man in ihrer Sprache „Hallo“ sagt.', then: 'Daria bringt dir ein Wort bei und du ihr eins. Morgen grüßt ihr euch in beiden Sprachen.', think: 'Welche Wörter aus anderen Sprachen kennst du schon?' },
        { label: 'Ich spiele weiter mit meinen Freunden.', then: 'Ihr habt Spaß. Daria schaut zu und geht nach der Pause allein ins Klassenzimmer.', think: 'Wie fühlt man sich an einem neuen Ort, wenn man fast niemanden versteht?' } ] },
      { title: 'Das fremde Essen', dilemma: true, reward: { hp: 5 }, text: 'Beim Klassenfest hat Emre ein Gericht von zu Hause mitgebracht. Du kennst es nicht und es riecht ungewohnt.', opts: [
        { label: 'Ich probiere ein kleines Stück.', then: 'Es schmeckt anders als gedacht. Emre erzählt, dass seine Oma es immer an Festtagen kocht.', think: 'Welches Essen von zu Hause würdest du mitbringen?' },
        { label: 'Ich frage Emre, was darin ist.', then: 'Emre erklärt es dir. Jetzt weißt du, worauf du dich einlässt.', think: 'Warum hilft Fragen, wenn etwas fremd ist?' },
        { label: 'Ich sage freundlich: „Nein danke.“', then: 'Emre nickt. Jeder darf selbst entscheiden, was er isst.', think: 'Wie kann man etwas ablehnen, ohne jemanden zu kränken?' } ] },
      { title: 'Der freie Tag', dilemma: true, reward: { hp: 5 }, text: 'Leyla erzählt, dass sie morgen nicht zur Schule kommt, weil ihre Familie das Zuckerfest feiert. Ein Kind sagt: „Das ist doch kein richtiges Fest.“', opts: [
        { label: 'Ich frage Leyla, wie sie das Fest feiert.', then: 'Leyla erzählt von Besuchen bei der Familie, neuen Kleidern und Süßigkeiten. Das klingt nach einem Fest.', think: 'Welche Feste feiert deine Familie?' },
        { label: 'Ich sage: „Jede Familie feiert andere Feste.“', then: 'Das andere Kind überlegt. Später fragt es Leyla selbst nach dem Fest.', think: 'Was haben Weihnachten und das Zuckerfest gemeinsam?' },
        { label: 'Ich sage nichts.', then: 'Leyla schaut traurig auf ihren Tisch. Niemand hat für sie etwas gesagt.', think: 'Wie hättest du dich an Leylas Stelle gefühlt?' } ] },
      { title: 'Die Kettennachricht', dilemma: true, reward: { hp: 5 }, text: 'Auf dem Tablet deines Bruders steht: „Schick diese Nachricht an zehn Leute, sonst hast du eine Woche lang Pech!“', opts: [
        { label: 'Ich schicke sie weiter, sicher ist sicher.', then: 'Zehn Leute bekommen die Nachricht und schicken sie wieder weiter. Pech hatte am Ende niemand.', think: 'Kann eine Nachricht wirklich Pech bringen?' },
        { label: 'Ich zeige sie meiner Mutter.', then: 'Deine Mutter erklärt dir, dass solche Nachrichten nur Angst machen wollen. Ihr löscht sie zusammen.', think: 'Wen kannst du fragen, wenn dir eine Nachricht komisch vorkommt?' },
        { label: 'Ich lösche sie einfach.', then: 'Die Woche vergeht ganz normal. Die Nachricht hatte keine Macht.', think: 'Woran erkennst du, dass eine Nachricht nicht stimmt?' } ] },
      { title: 'Das Gespräch in der Pause', dilemma: true, reward: { hp: 5 }, text: 'Linh und Minh sprechen in der Pause Vietnamesisch miteinander. Dein Freund sagt: „Die reden bestimmt über uns.“', opts: [
        { label: 'Ich frage die beiden, worüber sie reden.', then: 'Sie lachen: Es ging um ihren Hund. Minh bringt euch das vietnamesische Wort für Hund bei.', think: 'Warum sprechen Geschwister miteinander oft die Sprache von zu Hause?' },
        { label: 'Ich sage: „Die reden so, wie sie es zu Hause gewohnt sind.“', then: 'Dein Freund zuckt mit den Schultern. Er hatte gar nicht daran gedacht.', think: 'Was denkst du, wenn du jemanden nicht verstehst?' },
        { label: 'Ich nicke meinem Freund zu.', then: 'Ihr schaut die beiden komisch an. Linh und Minh merken es und hören auf zu reden.', think: 'Wie entsteht ein Vorurteil?' } ] },
      { title: 'Die Bank am Dorfplatz', text: 'Unter der alten Linde am Dorfplatz steht eine Bank. Hier ruhst du dich aus.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
    ] };
  FR.gen = frGen(FR);

  K.MODES.wiese = WI; K.MODES.frueher = FR;
  return { FLORA, TRAITS, LAYERS, ANIMALS, DEV, HERBAR, TOOLS, LINES, SOURCES, LOOKUP, floraSVG };
})();
if (typeof module !== 'undefined') module.exports = MS3;
