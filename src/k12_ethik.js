// Klasse 1 und 2, Ethik (Lehrplan Sachsen 2019): „Ich und die anderen“ (Klasse 1, LB 1 und 2) und „Feste und die Welt“
// (Klasse 2, LB 3 und 4). Dazu Musik Klasse 2 „Der Musikraum“ (LB 4: Instrumente und Stimmen) und Klasse 1 „Die Klangkiste“
// (LB 2 bis 4: Orff-Instrumente, Gegensätze, Stimmungen, Körperinstrumente, eigene Zeichen), nur Bilder, keine Töne.
// Registers the units in MK.MODES with the shared hero and opponents of K12.SETS. Mode keys are save keys: never rename.
const K12E = (() => {
  const K = typeof MK !== 'undefined' ? MK : require('./knowledge.js');
  const S = typeof K12 !== 'undefined' ? K12 : require('./klasse12.js');
  const { shuffle, pick } = K;

  /* ---------- Zeichnungen ---------- */
  const NS = 'xmlns="http://www.w3.org/2000/svg"';
  const INK = '#1C2541', WOOD = '#E9A15B', DARK = '#8A5A2B', EBONY = '#3B2A26', METAL = '#C9CEDD', GOLD = '#FFD25A', RED = '#E8344A', BLUE = '#7CC2FF', GREEN = '#4FC96A', FIR = '#2E9E57', WHITE = '#FFFFFF', PAPER = '#FFFDF5';
  // every flat colour becomes a soft light-to-shade gradient of itself (defs added by pic and optPic)
  const tone = (hex, t) => '#' + [16, 8, 0].map((s) => { const v = (parseInt(hex.slice(1), 16) >> s) & 255; return Math.round(t > 0 ? v + (255 - v) * t : v * (1 + t)).toString(16).padStart(2, '0'); }).join('');
  const USED = new Set();
  const fl = (c) => (/^#[0-9A-F]{6}$/i.test(c) && c !== INK ? (USED.add(c.toUpperCase()), `url(#ke${c.slice(1).toUpperCase()})`) : c);
  const ln = (d, w, c) => `<path d="${d}" fill="none" stroke="${c || INK}" stroke-width="${w || 3}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const sh = (d, fill, w) => `<path d="${d}" fill="${fl(fill)}" stroke="${INK}" stroke-width="${w || 2.5}" stroke-linejoin="round"/>`;
  const rect = (x, y, w, h, fill, rx, sw) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx || 0}" fill="${fl(fill)}" stroke="${INK}" stroke-width="${sw || 2.5}"/>`;
  const circ = (cx, cy, r, fill, w) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fl(fill)}" stroke="${INK}" stroke-width="${w === undefined ? 2.5 : w}"/>`;
  const oval = (cx, cy, rx, ry, fill, w, rot) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fl(fill)}" stroke="${INK}" stroke-width="${w === undefined ? 2.5 : w}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  // white gloss: a soft spot or a stroke along the lit edge
  const gloss = (cx, cy, rx, ry, rot) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".55"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  const lit = (d, w) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w || 2}" stroke-linecap="round" opacity=".6"/>`;
  const tube = (d, w, c) => ln(d, w + 4) + ln(d, w, c);
  const star = (cx, cy, R, r) => 'M' + Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 5 * i - Math.PI / 2, d = i % 2 ? r : R; return `${(cx + d * Math.cos(a)).toFixed(1)} ${(cy + d * Math.sin(a)).toFixed(1)}`; }).join(' L') + 'Z';
  const flame = (x, y) => sh(`M${x} ${y - 13} Q${x + 6} ${y - 5} ${x} ${y} Q${x - 6} ${y - 5} ${x} ${y - 13} Z`, '#FFB347', 2) + `<path d="M${x} ${y - 8} Q${x + 2.5} ${y - 3} ${x} ${y - 1} Q${x - 2.5} ${y - 3} ${x} ${y - 8} Z" fill="#FFF3B0"/>`;
  const defs = () => `<defs>${[...USED].map((c) => `<linearGradient id="ke${c.slice(1)}" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="${tone(c, 0.3)}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${tone(c, -0.16)}"/></linearGradient>`).join('')}</defs>`;
  // question picture with a paper frame, answer pictures plain; labels never name the answer
  const pic = (inner, label) => `<svg ${NS} class="pic" viewBox="-6 -6 112 112" style="max-width:150px" role="img" aria-label="${label}">${defs()}<rect x="-5" y="-5" width="110" height="110" rx="10" fill="${PAPER}" stroke="#C9CFDF" stroke-width="1.5"/>${inner}</svg>`;
  const optPic = (inner, label) => `<svg ${NS} viewBox="0 0 100 100" role="img" aria-label="${label}">${defs()}${inner}</svg>`;
  // smaller copy standing on the same ground line (hoch und tief)
  const scaled = (inner, s) => `<g transform="translate(${50 - 50 * s} ${100 - 100 * s}) scale(${s})">${inner}</g>`;

  /* Gesichter */
  const SKIN = '#FFD9A8';
  const HAIR = sh('M14 46 Q18 10 50 11 Q82 10 86 46 Q76 27 50 27 Q24 27 14 46 Z', DARK) + lit('M30 20 Q40 15 52 15', 2.5);
  const HEAD = (skin) => circ(11, 56, 7, skin) + circ(89, 56, 7, skin) + circ(50, 52, 40, skin, 3) + HAIR;
  const DOTS = circ(37, 54, 4.5, INK, 0) + circ(63, 54, 4.5, INK, 0) + '<circle cx="38.5" cy="52.5" r="1.4" fill="#fff"/><circle cx="64.5" cy="52.5" r="1.4" fill="#fff"/>';
  const CHEEKS = '<circle cx="27" cy="66" r="5.5" fill="#FF8A8A" opacity=".5"/><circle cx="73" cy="66" r="5.5" fill="#FF8A8A" opacity=".5"/>';
  const FACES = {
    froehlich: { word: 'fröhlich', svg: HEAD(SKIN) + DOTS + ln('M30 44 Q37 40 44 44', 2.5) + ln('M56 44 Q63 40 70 44', 2.5) + sh('M32 65 Q50 90 68 65 Z', '#B8323F') + '<path d="M36 67 H64 Q62 71 50 71 Q38 71 36 67 Z" fill="#fff"/>' + CHEEKS },
    traurig: { word: 'traurig', svg: HEAD(SKIN) + DOTS + ln('M28 46 L42 41') + ln('M58 41 L72 46') + ln('M36 78 Q50 67 64 78', 3.5) + sh('M33 60 Q28 69 33 72 Q38 69 33 60 Z', BLUE, 2) },
    wuetend: { word: 'wütend', svg: HEAD('#FFB08A') + DOTS + ln('M27 40 L43 48', 4.5) + ln('M57 48 L73 40', 4.5) + rect(35, 68, 30, 10, WHITE, 3) + ln('M35 73 H65', 1.5) + ln('M45 68 V78 M55 68 V78', 1.5) },
    aengstlich: { word: 'ängstlich', svg: HEAD(SKIN) + circ(37, 54, 7.5, WHITE) + circ(63, 54, 7.5, WHITE) + circ(37, 55, 3, INK, 0) + circ(63, 55, 3, INK, 0) + ln('M29 40 Q36 35 43 40') + ln('M57 40 Q64 35 71 40') + ln('M36 75 q3.5 -4 7 0 t7 0 t7 0 t7 0') + sh('M84 34 Q80 42 84 45 Q88 42 84 34 Z', BLUE, 2) },
  };
  const FACE_IDS = Object.keys(FACES);

  /* Zeichen der Feste */
  const FESTE = ['Geburtstag', 'Erntedank', 'St. Martin', 'Advent', 'Nikolaus', 'Weihnachten', 'Silvester', 'Ostern'];
  const candle = (x, y, h, c) => rect(x - 4, y - h, 8, h, c, 1.5, 2) + lit(`M${x - 1.5} ${y - h + 3} V${y - 3}`, 1.5) + ln(`M${x} ${y - h} v-3`, 1.5) + flame(x, y - h - 2);
  // Ähre: stalk and two rows of grains, tip at (x, y)
  const ear = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y})">${ln(`M${x} ${y} V${y + 40}`, 2, '#B8862E')}${[0, 6, 12, 18].map((d) => oval(x - 2.6, y + 4 + d, 2.6, 4, '#F2C14E', 1.2, -25) + oval(x + 2.6, y + 4 + d, 2.6, 4, '#F2C14E', 1.2, 25)).join('')}${oval(x, y + 1, 2.4, 4, '#F2C14E', 1.2)}</g>`;
  const heart = 'M0 0 C-4 -6 -17 -9 -17 -20 C-17 -27 -9 -30 -4.5 -26.5 Q-1.5 -24 0 -20 Q1.5 -24 4.5 -26.5 C9 -30 17 -27 17 -20 C17 -9 4 -6 0 0 Z';
  const SYMS = [
    { id: 'kuchen', fest: 'Geburtstag', note: 'geburtstag', svg: oval(50, 88, 44, 7, METAL) + rect(16, 54, 68, 32, '#FFB3D9', 5) + ln('M18 74 H82', 2.5, '#E86AA8')
      + [24, 38, 52, 66, 78].map((x, i) => circ(x, 74, 2, i % 2 ? GOLD : BLUE, 1)).join('')
      + sh('M16 59 Q16 52 23 52 H77 Q84 52 84 59 Q84 66 79 66 Q75 66 75 61 Q71 68 66 61 Q61 69 56 61 Q51 68 46 61 Q41 69 36 61 Q31 68 26 61 Q24 66 20 66 Q16 66 16 59 Z', WHITE)
      + lit('M22 80 V60', 2.5) + [30, 50, 70].map((x, i) => candle(x, 54, 18, [BLUE, '#FF8A3D', GREEN][i])).join('') },
    { id: 'korb', fest: 'Erntedank', note: 'erntedank', svg: ear(20, 6, -24) + ear(80, 6, 24) + ear(50, 2, 0)
      + sh('M58 20 Q66 28 64 38 Q68 52 58 54 Q48 52 52 38 Q50 28 58 20 Z', '#C9E265') + ln('M58 20 Q58 16 62 14', 2.2, DARK) + gloss(55, 34, 2, 5)
      + circ(32, 44, 13, RED) + ln('M32 31 Q33 26 37 24', 2.5, DARK) + gloss(27, 39, 3, 4.5, 30)
      + oval(73, 45, 15, 12, '#FF8A3D') + ln('M73 33 V57 M65 35 Q61 45 65 55 M81 35 Q85 45 81 55', 1.6) + ln('M73 33 Q74 28 77 27', 2.5, FIR)
      + sh('M8 52 H92 L80 92 H20 Z', WOOD) + ln('M12 65 H88 M16 78 H84', 2, DARK) + ln('M30 52 L33 92 M50 52 V92 M70 52 L67 92', 2, DARK) + rect(6, 48, 88, 8, '#D58A44', 4) + lit('M12 51 H88', 1.5) },
    { id: 'laterne', fest: 'St. Martin', note: 'martin', svg: ln('M52 22 L66 8 L95 2', 3.5, DARK) + ln('M33 34 Q50 12 67 34', 1.8)
      + oval(50, 60, 30, 27, '#FF8A3D') + `<ellipse cx="50" cy="62" rx="20" ry="18" fill="#FFD25A" opacity=".75"/><ellipse cx="50" cy="64" rx="10" ry="9" fill="#FFF3B0" opacity=".9"/>`
      + rect(46.5, 62, 7, 12, WHITE, 1, 1.5) + flame(50, 60)
      + `<path d="M50 33 Q30 60 50 87 M50 33 Q70 60 50 87 M50 33 Q12 60 50 87 M50 33 Q88 60 50 87" fill="none" stroke="#C85A1E" stroke-width="1.3"/>`
      + rect(34, 29, 32, 8, RED, 3) + rect(36, 84, 28, 7, RED, 3) + lit('M38 32 H62', 1.5) + circ(66, 8, 2, METAL, 1.2) },
    { id: 'kranz', fest: 'Advent', note: 'advent', not: ['Weihnachten', 'Nikolaus'], svg: `<ellipse cx="50" cy="72" rx="38" ry="14" fill="none" stroke="${INK}" stroke-width="19"/><ellipse cx="50" cy="72" rx="38" ry="14" fill="none" stroke="${fl(FIR)}" stroke-width="14"/>`
      + `<path d="${Array.from({ length: 28 }, (_, i) => { const a = i * Math.PI / 14, x = 50 + 38 * Math.cos(a), y = 72 + 14 * Math.sin(a); return `M${(x - 4).toFixed(1)} ${(y - 3).toFixed(1)} L${(x + 3).toFixed(1)} ${(y + 3).toFixed(1)}`; }).join(' ')}" stroke="#7FD49A" stroke-width="1.4" stroke-linecap="round"/>`
      + [[22, 62], [80, 64], [64, 85], [34, 85]].map(([x, y]) => circ(x, y, 3, RED, 1.5)).join('')
      + [[33, 62], [67, 62], [24, 78], [76, 78]].map(([x, y]) => candle(x, y, 22, RED)).join('')
      + sh('M50 84 Q38 76 38 84 Q38 92 50 86 Z M50 84 Q62 76 62 84 Q62 92 50 86 Z', '#C9283B', 2) + sh('M48 86 L43 97 L47 95 L49 98 L50 87 Z M52 86 L57 97 L53 95 L51 98 L50 87 Z', '#C9283B', 1.5) + circ(50, 85, 3, RED, 1.8) },
    { id: 'stiefel', fest: 'Nikolaus', note: 'nikolaus', not: ['Advent', 'Weihnachten'], svg: tube('M36 34 V14 Q36 6 43 6 Q50 6 50 13', 4, WHITE) + ln('M36 30 l0 -4 M36 20 l0 -4 M39 8 l3 -2 M48 9 l2 2', 4, RED)
      + circ(57, 24, 11, '#FF8A3D') + `<circle cx="57" cy="24" r="1.5" fill="${DARK}"/>` + gloss(53, 20, 3, 2.5, -30) + circ(72, 28, 9, RED) + ln('M72 19 Q73 15 76 14', 2, DARK) + gloss(69, 25, 2, 3, 30)
      + sh('M28 30 H66 V64 L84 69 Q95 73 90 88 H28 Z', RED) + lit('M33 40 V82', 3) + rect(23, 24, 48, 13, WHITE, 6) + rect(26, 86, 66, 7, EBONY, 3) },
    { id: 'baum', fest: 'Weihnachten', note: 'weihnachten', not: ['Advent'], svg: rect(44, 80, 12, 10, DARK) + rect(34, 88, 32, 8, RED, 2) + sh('M50 42 L88 82 H12 Z', FIR) + sh('M50 27 L78 62 H22 Z', '#3DB36A') + sh('M50 13 L69 44 H31 Z', GREEN)
      + ln('M27 72 Q50 80 73 70 M33 54 Q50 60 66 52', 2, GOLD)
      + [[32, 76, RED], [62, 74, BLUE], [50, 57, GOLD], [38, 50, BLUE], [61, 38, RED], [44, 34, GOLD]].map(([x, y, c]) => circ(x, y, 4.5, c, 1.5) + '<circle cx="' + (x - 1.5) + '" cy="' + (y - 1.5) + '" r="1.3" fill="#fff" opacity=".8"/>').join('') + sh(star(50, 11, 11, 4.8), GOLD, 2) },
    { id: 'klee', fest: 'Silvester', note: 'silvester', svg: ln('M50 48 Q56 76 70 94', 5, INK) + ln('M50 48 Q56 76 70 94', 2.5, FIR)
      + [45, 135, 225, 315].map((a) => `<g transform="translate(50 46) rotate(${a})">${sh(heart, GREEN, 2.5)}${ln('M0 -3 V-19', 1.5, '#2E9E57')}${lit('M-12 -22 Q-11 -26 -7 -26', 1.8)}</g>`).join('') + circ(50, 46, 2.5, '#2E9E57', 1) },
    { id: 'ei', fest: 'Ostern', note: 'ostern', svg: sh('M50 10 C71 10 82 44 80 62 C78 81 65 92 50 92 C35 92 22 81 20 62 C18 44 29 10 50 10 Z', GOLD) + ln('M23 54 L30 47 L37 54 L44 47 L51 54 L58 47 L65 54 L72 47 L78 53', 3.5, RED)
      + ln('M22 70 Q50 76 78 70', 4, BLUE) + [[40, 30], [50, 23], [60, 30], [35, 82], [50, 85], [65, 82]].map(([x, y]) => circ(x, y, 3, GREEN, 1.2)).join('') + gloss(34, 30, 5, 10, 20) },
  ];
  const symFits = (a, b) => a.fest !== b.fest && !(a.not || []).includes(b.fest) && !(b.not || []).includes(a.fest);

  /* Instrumente */
  // Handtrommel: flat wooden frame with a skin, played with the hand or a soft beater
  const drum = sh('M8 46 V58 A42 16 0 0 0 92 58 V46 Z', WOOD) + ln('M8 52 A42 16 0 0 0 92 52', 1.5, DARK)
    + [18, 34, 50, 66, 82].map((x) => { const y = 55 + 16 * Math.sqrt(1 - ((x - 50) / 42) ** 2); return rect(x - 2.5, (y - 4).toFixed(1), 5, 8, METAL, 1, 1.2); }).join('')
    + oval(50, 46, 42, 16, '#FBEBC8') + `<ellipse cx="50" cy="46" rx="35" ry="12" fill="none" stroke="#E2C78F" stroke-width="1.5"/>` + lit('M20 41 Q32 34 50 33', 2.5);
  const recorder = '<g transform="rotate(35 50 50)">' + sh('M44.5 80 L43.5 93 Q50 97 56.5 93 L55.5 80 Z', '#E9C08A') + rect(45, 26, 10, 56, '#F3D6A4', 2)
    + sh('M44 28 L44 14 Q45 5 50 3 Q55 5 56 14 L56 28 Z', '#E9C08A') + sh('M46.5 17 H53.5 L52.5 21 H47.5 Z', INK, 1) + rect(43.5, 26, 13, 4, '#D9A766', 2, 1.8) + rect(44, 78, 12, 4, '#D9A766', 2, 1.8)
    + `<ellipse cx="45.3" cy="34" rx="0.9" ry="2.2" fill="${DARK}"/>`
    + [36, 42, 48, 57, 63].map((y) => `<circle cx="50" cy="${y}" r="2.1" fill="${INK}"/>`).join('') + [[69, 50], [87, 51.5]].map(([y, x]) => `<circle cx="${x - 1.6}" cy="${y}" r="1.2" fill="${INK}"/><circle cx="${x + 1.6}" cy="${y}" r="1.2" fill="${INK}"/>`).join('')
    + lit('M47 31 V76', 1.5) + '</g>';
  // violin (Geige) without bow, 42 wide 90 tall, standing on y 92
  const violinBody = 'M42 42 C49 42 55 45 55 52 C55 57 52 59 50 60 Q48 64 50 69 C54 70 58 74 58 80 C58 88 51 92 42 92 C33 92 26 88 26 80 C26 74 30 70 34 69 Q36 64 34 60 C32 59 29 57 29 52 C29 45 35 42 42 42 Z';
  const violin = sh(violinBody, '#C8692E') + lit('M31 51 Q32 46 37 44 M29 78 Q29 74 32 72', 2)
    + ln('M35 63 Q32.5 69 35.5 75 M49 63 Q51.5 69 48.5 75', 1.4) + [[35, 63], [35.5, 75], [49, 63], [48.5, 75]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="${INK}"/>`).join('')
    + sh('M39.5 10 H44.5 V17 H39.5 Z', '#A9521F', 1.8) + circ(42, 6, 4.2, '#A9521F', 1.8) + ln('M42 6 m-2 0 a2 2 0 1 1 2 2', 1) + [[37, 11], [47, 11], [37, 15], [47, 15]].map(([x, y]) => oval(x, y, 2.6, 1.4, EBONY, 1)).join('')
    + sh('M40 15 L44 15 L45.2 64 L38.8 64 Z', EBONY, 1.8) + sh('M39.5 78 H44.5 L45.3 88 Q42 90.5 38.7 88 Z', EBONY, 1.8) + sh('M27.5 84 Q29 79 36 80 Q38.5 85 35.5 89 Q30.5 90 27.5 84 Z', EBONY, 1.5)
    + sh('M36.5 75 H47.5 L46.5 71.5 H37.5 Z', '#F3D6A4', 1.4) + ln([0, 1, 2, 3].map((i) => `M${(40.9 + i * 0.73).toFixed(2)} 15 L${(39.6 + i * 1.6).toFixed(2)} 79`).join(' '), 0.6, '#EDE6D6');
  // bow: stick, light hair, frog at the lower end
  const bow = tube('M62 4 L87 93', 2, DARK) + ln('M65.5 7 L84.5 85', 3, INK) + ln('M65.5 7 L84.5 85', 1.6, '#F7F1E1') + sh('M61 2.5 L66.5 3 L66.8 8.5 L63.3 8 Z', '#F3D6A4', 1.2) + rect(81, 82, 6, 9, EBONY, 1.5, 1.5) + `<circle cx="84" cy="86.5" r="1.3" fill="#fff"/>`;
  // Kontrabass: much taller, sloping shoulders, stands on its spike
  const bass = sh('M50 36 C53 36 55 37 57 40 L64 51 C67 55 66 58 63 61 Q60 65 62 69 C69 70 73 75 73 81 C73 89 62 93 50 93 C38 93 27 89 27 81 C27 75 31 70 38 69 Q40 65 37 61 C34 58 33 55 36 51 L43 40 C45 37 47 36 50 36 Z', '#B55A24')
    + lit('M38 53 L44 43 M31 81 Q31 76 35 73', 2.2) + ln('M42.5 66 Q40 72 43 78 M57.5 66 Q60 72 57 78', 1.5) + [[42.5, 66], [43, 78], [57.5, 66], [57, 78]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.1" fill="${INK}"/>`).join('')
    + ln('M50 93 V99', 2.5) + sh('M47.5 6 H52.5 V15 H47.5 Z', '#8F431A', 1.8) + circ(50, 4, 3.4, '#8F431A', 1.6) + [[44.5, 8.5], [55.5, 8.5], [44.5, 12.5], [55.5, 12.5]].map(([x, y]) => oval(x, y, 2.4, 1.3, METAL, 1)).join('')
    + sh('M48.3 13 H51.7 L53.2 67 H46.8 Z', EBONY, 1.8) + sh('M47 80 H53 L54 89 Q50 91.5 46 89 Z', EBONY, 1.8) + sh('M44 76 H56 L55 72.5 H45 Z', '#F3D6A4', 1.4)
    + ln([0, 1, 2, 3].map((i) => `M${(48.9 + i * 0.73).toFixed(2)} 13 L${(47.4 + i * 1.7).toFixed(2)} 81`).join(' '), 0.7, '#EDE6D6');
  const BARS = ['#E8344A', '#FF8A3D', '#FFD25A', '#4FC96A', '#2BB3A0', '#7CC2FF', '#5B6CFF', '#B07CFF'];
  // Glockenspiel bars: long and low on the left, short and high on the right
  const glock = sh('M5 28 L95 40 L95 46 L5 36 Z', DARK, 2) + sh('M5 78 L95 66 L95 72 L5 86 Z', DARK, 2)
    + BARS.map((c, i) => { const x = 10 + i * 10.4, t = 32 + (x - 5) * 0.133 - 5, b = 82 - (x - 5) * 0.155 + 5; return rect(x, t.toFixed(1), 8, (b - t).toFixed(1), c, 1.5, 2) + lit(`M${x + 2.2} ${(t + 4).toFixed(1)} V${(b - 4).toFixed(1)}`, 1.3) + `<circle cx="${x + 4}" cy="${(t + 4.5).toFixed(1)}" r="1.1" fill="${INK}"/><circle cx="${x + 4}" cy="${(b - 4.5).toFixed(1)}" r="1.1" fill="${INK}"/>`; }).join('');
  const mallet = (x1, y1, x2, y2) => tube(`M${x1} ${y1} L${x2} ${y2}`, 2.4, WOOD) + circ(x1, y1, 5, RED, 2) + gloss(x1 - 1.5, y1 - 1.5, 1.5, 1.2);
  const INSTR = [
    { id: 'trommel', name: 'Handtrommel', acc: 'die Handtrommel', fam: 'schlag', how: 'schlagen', svg: drum + tube('M64 40 L90 12', 3, DARK) + circ(61, 43, 7, RED) + gloss(59, 41, 2, 1.5) },
    { id: 'triangel', name: 'Triangel', acc: 'die Triangel', fam: 'schlag', how: 'schlagen', svg: ln('M50 20 Q45 10 50 4 Q55 10 50 20', 1.8, RED) + rect(45, 1, 10, 5, RED, 2, 1.5)
      + tube('M25 82 L84 82 L50 22 L18 77', 4, METAL) + lit('M50 27 L80 79', 1.2) + tube('M58 68 L92 46', 2.5, METAL) + rect(84, 45, 12, 6, EBONY, 3, 1.5) },
    { id: 'klanghoelzer', name: 'Klanghölzer', acc: 'die Klanghölzer', fam: 'schlag', how: 'schlagen', svg: '<g transform="rotate(-28 50 50)">' + [33, 55].map((y) => rect(6, y, 88, 12, WOOD, 6) + oval(88, y + 6, 3, 6, '#F6CC94', 1.8) + lit(`M14 ${y + 3.5} H80`, 1.8) + ln(`M20 ${y + 8} H44 M54 ${y + 8.5} H74`, 1, DARK)).join('') + '</g>' },
    { id: 'rassel', name: 'Rassel', acc: 'die Rassel', fam: 'schlag', how: 'schütteln', notHow: ['schlagen'], svg: '<g transform="rotate(-30 50 55)">' + rect(45, 56, 10, 38, DARK, 4) + ln('M45 66 H55 M45 70 H55', 1.5) + oval(50, 35, 22, 26, '#FF8A3D')
      + ln('M29 37 L35 31 L41 37 L47 31 L53 37 L59 31 L65 37 L71 33', 3, GOLD) + [[41, 21], [57, 20], [43, 49], [57, 48], [50, 14]].map(([x, y]) => circ(x, y, 2.4, GREEN, 1)).join('') + gloss(40, 25, 4, 7, 20) + '</g>' },
    { id: 'schellenkranz', name: 'Schellenkranz', acc: 'den Schellenkranz', fam: 'schlag', how: 'schütteln', notHow: ['schlagen'], svg: `<path d="M50 14 a36 36 0 1 0 0.01 0 Z M50 27 a23 23 0 1 0 0.01 0 Z" fill="${fl(WOOD)}" fill-rule="evenodd" stroke="${INK}" stroke-width="2.5"/>` + lit('M22 36 Q30 22 44 17', 2.2)
      + [0, 72, 144, 216, 288].map((a) => `<g transform="translate(${(50 + 29.5 * Math.cos((a - 90) * Math.PI / 180)).toFixed(1)} ${(50 + 29.5 * Math.sin((a - 90) * Math.PI / 180)).toFixed(1)}) rotate(${a})">${rect(-9, -5, 18, 10, '#6B3E1C', 1.5, 1.5)}${circ(-3.2, 0, 4.6, METAL, 1.5)}${circ(3.2, 0, 4.6, METAL, 1.5)}${ln('M-9 0 H9', 1)}</g>`).join('') },
    { id: 'glockenspiel', name: 'Glockenspiel', acc: 'das Glockenspiel', fam: 'schlag', how: 'schlagen', notFam: ['tasten'], notHow: ['Tasten drücken'], svg: glock + mallet(62, 90, 96, 80) + mallet(74, 96, 98, 90) },
    { id: 'blockfloete', name: 'Blockflöte', acc: 'die Blockflöte', fam: 'blas', how: 'blasen', svg: recorder },
    { id: 'trompete', name: 'Trompete', acc: 'die Trompete', fam: 'blas', how: 'blasen', notHow: ['Tasten drücken'], svg: tube('M14 48 H78 Q86 48 86 55 Q86 62 78 62 H66', 3.5, GOLD) + tube('M38 58 H26 Q16 58 16 47 Q16 36 26 36 H62', 4, GOLD)
      + sh('M60 33.5 C72 33 82 27 90 17 L90 55 C82 45 72 39 60 38.5 Z', GOLD) + oval(90, 36, 4.5, 19, '#E9B33A') + lit('M64 33 Q78 30 87 21', 1.5)
      + tube('M42 66 V72 Q42 76 46 76 H50 Q54 76 54 72 V66', 3, GOLD)
      + [36, 46, 56].map((x) => rect(x, 29, 8, 37, GOLD, 2, 2) + rect(x - 0.5, 63, 9, 4, '#E9B33A', 1, 1.5) + rect(x + 2.5, 21, 3, 8, METAL, 0.5, 1.2) + oval(x + 4, 20, 5, 2.2, WHITE, 1.5) + lit(`M${x + 2.3} 33 V60`, 1.3)).join('')
      + sh('M2 44 L6 46 L15 47 V49 L6 50 L2 52 Z', METAL, 1.8) },
    { id: 'gitarre', name: 'Gitarre', acc: 'die Gitarre', fam: 'saiten', how: 'zupfen', notHow: ['schlagen', 'streichen'], svg: [6, 10.5, 15].map((y) => oval(38.5, y, 2.6, 1.6, METAL, 1) + oval(61.5, y, 2.6, 1.6, METAL, 1)).join('')
      + sh('M43 2 H57 L56 18 H44 Z', '#6B3E1C', 2) + [6, 10.5, 15].map((y) => `<circle cx="46.5" cy="${y}" r="1" fill="${METAL}"/><circle cx="53.5" cy="${y}" r="1" fill="${METAL}"/>`).join('')
      + rect(45.5, 18, 9, 34, '#6B3E1C', 1, 2) + ln([22, 25.8, 29.4, 32.8, 36, 39, 41.8, 44.4].map((y) => `M46 ${y} H54`).join(' '), 1, '#D7DCE8') + rect(44.5, 17, 11, 2.2, '#F3EBD8', 0.5, 1)
      + sh('M50 37.5 C59 37.5 65.5 44 65.5 52 C65.5 58 62 61 61.5 64 C61.5 66 71 69 71 77 C71 89 61 96 50 96 C39 96 29 89 29 77 C29 69 38.5 66 38.5 64 C38 61 34.5 58 34.5 52 C34.5 44 41 37.5 50 37.5 Z', '#F0B46A') + lit('M38 50 Q39 44 44 41 M33 80 Q33 73 37 69', 2)
      + rect(46, 48, 8, 6, '#6B3E1C', 1, 1.5) + circ(50, 61, 8.5, 'none', 1.5) + circ(50, 61, 6.5, '#2A1A10', 1.5) + rect(41, 79, 18, 4.5, '#6B3E1C', 1.5, 1.8) + ln('M43 80.3 H57', 1, '#F3EBD8')
      + ln([0, 1, 2, 3, 4, 5].map((i) => `M${(46.6 + i * 1.36).toFixed(2)} 18 V80.5`).join(' '), 0.6, '#F3EBD8') },
    { id: 'geige', name: 'Geige', acc: 'die Geige', fam: 'saiten', how: 'streichen', notHow: ['zupfen'], svg: violin + bow },
    { id: 'klavier', name: 'Klavier', acc: 'das Klavier', fam: 'tasten', how: 'Tasten drücken', notFam: ['saiten', 'schlag'], notHow: ['schlagen'], svg: rect(10, 12, 80, 44, '#6B3E26', 3) + rect(6, 7, 88, 7, '#7E4A2E', 2) + rect(20, 19, 60, 20, '#8A5536', 2, 2)
      + rect(38, 21, 24, 15, PAPER, 1, 1.2) + ln('M41 25 H59 M41 29 H59 M41 33 H59', 0.7, '#9AA3B8') + `<circle cx="45" cy="29" r="1.4" fill="${INK}"/><circle cx="52" cy="25" r="1.4" fill="${INK}"/>` + lit('M14 16 H86', 1.5)
      + rect(6, 52, 88, 6, '#5B3420', 1, 2) + rect(8, 57, 84, 15, WHITE, 1, 2) + ln(Array.from({ length: 13 }, (_, i) => `M${14 + i * 6} 57 V72`).join(' '), 1)
      + [0, 1, 3, 4, 5, 7, 8, 10, 11, 12].map((i) => `<rect x="${(12.2 + i * 6).toFixed(1)}" y="57" width="3.6" height="9" rx=".6" fill="${INK}"/>`).join('')
      + rect(10, 72, 7, 22, '#6B3E26', 1, 2) + rect(83, 72, 7, 22, '#6B3E26', 1, 2) + rect(17, 80, 66, 12, '#5B3420', 1, 2) + rect(43, 89, 5, 4, GOLD, 1, 1.2) + rect(52, 89, 5, 4, GOLD, 1, 1.2) },
  ];
  const FAM = { saiten: 'Saiteninstrument', blas: 'Blasinstrument', schlag: 'Schlaginstrument', tasten: 'Tasteninstrument' };
  const HOWS = ['zupfen', 'streichen', 'blasen', 'schlagen', 'schütteln', 'Tasten drücken'];
  // hoch und tief: the same drawing small and big; the long bar of the Glockenspiel sounds lower; Geige against Kontrabass
  const bar = (w) => rect(50 - w / 2, 42, w, 16, BLUE, 3) + lit(`M${50 - w / 2 + 4} 46 H${50 + w / 2 - 4}`, 1.5) + circ(50 - w / 2 + 6, 50, 2, INK, 0) + circ(50 + w / 2 - 6, 50, 2, INK, 0);
  const PAIRS = [
    { id: 'trommel', q: 'Welche Trommel', small: scaled(drum, 0.55), big: drum },
    { id: 'floete', q: 'Welche Flöte', small: scaled(recorder, 0.55), big: recorder },
    { id: 'bass', q: 'Welches Instrument', small: `<g transform="translate(32.4 57.5) scale(.42)">${violin}</g>`, big: bass },
    { id: 'platte', q: 'Welche Platte', small: bar(36), big: bar(84) },
  ];

  /* ---------- gemeinsame Bausteine ---------- */
  const choice = (mod, note, q, answer, wrongs, qid, extra) => Object.assign({ kind: 'choice', mod, tier: 1, group: mod + ':1', note, q, options: shuffle([answer].concat(wrongs)), answer, qid, cols: wrongs.length === 1 ? 2 : 1 }, extra || {});
  const some = (list, n) => shuffle(list.slice()).slice(0, n);
  const ord = (mod, group, src, qid) => { const idx = shuffle(src.items.map((_, i) => i)).slice(0, 4).sort((a, b) => a - b); const items = idx.map((i) => src.items[i]);
    return { kind: 'order', mod, tier: 1, group, note: src.note, q: src.q, items, order: items.map((x) => x.id), display: shuffle(items), qid: qid + idx.join('') }; };
  const steps = (prefix, texts) => texts.map((text, i) => ({ id: prefix + (i + 1), text }));
  // events ask for one topic (opts.g): those questions come from the pool
  const wantsPool = (pool, mod, opts) => !!(opts && opts.g && pool.some((p) => p.mod === mod && p.g === opts.g));
  const unit = (set, attacks, o) => Object.assign({ worlds: 1, starters: [Object.assign({}, S.SETS[set].hero, { attacks })], enemies: S.SETS[set].enemies, moves: S.SETS[set].moves }, o);
  const RF = ['Hör dir den Satz an.', 'Stimmt er? Dann tippe auf „Richtig“.', 'Stimmt er nicht? Dann tippe auf „Falsch“.'];
  const UNDO = 'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.';
  const rest = (title, text) => ({ title, text, opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] });
  const ask = (title, text, task, g, win, lose) => ({ title, text, opts: [{ label: 'Antworten', task, g, win, lose }, { label: 'Weitergehen', effect: {} }] });
  // Dilemma-Karten: kein Richtig oder Falsch, jede Wahl bekommt dieselbe Belohnung
  const dilemma = (title, text, opts) => ({ title, dilemma: true, reward: { hp: 5 }, text, opts: opts.map(([label, then, think]) => ({ label, then, think })) });

  /* ======================= Klasse 1: Ich und die anderen ======================= */
  const NOTES1 = {
    einmalig: { title: 'Ich bin einmalig', lines: ['Jeder Mensch ist einmalig. Dich gibt es nur einmal.', 'Deine Fingerabdrücke hat niemand sonst.', 'Jeder kann etwas gut. Manches fällt schwer, das darf so sein.', 'Was du noch nicht kannst, kannst du üben.', 'Menschen sind verschieden: groß und klein, laut und leise.', 'Manche Kinder sitzen im Rollstuhl, hören schlecht oder tragen eine Brille. Sie gehören dazu wie alle.'] },
    gefuehle: { title: 'Gefühle', lines: ['Fröhlich: Du lachst und freust dich.', 'Traurig: Du möchtest weinen.', 'Wütend: Du ärgerst dich sehr.', 'Ängstlich: Du hast Angst und fühlst dich unsicher.', 'Alle Gefühle sind erlaubt. Man sieht sie oft am Gesicht.', 'Wenn du wütend bist: tief atmen, kurz weggehen, darüber reden. Hauen ist nicht erlaubt.', 'Über Gefühle reden hilft.'] },
    familie: { title: 'Familien sind verschieden', lines: ['Kleinfamilie: Eltern und ihre Kinder. Manche Kinder wohnen mit einer Mama oder einem Papa allein. Das ist auch eine Familie.', 'Großfamilie: Auch Oma, Opa, Tante oder Onkel wohnen mit im Haus.', 'Patchworkfamilie: Mama oder Papa hat einen neuen Partner. Oft bringt jeder Kinder mit.', 'Regenbogenfamilie: Ein Kind hat zwei Mamas oder zwei Papas.', 'Adoption: Ein Kind bekommt neue Eltern, die für immer für es sorgen.', 'In jeder Familie ist wichtig: sich lieb haben, sich aufeinander verlassen und einander helfen.'] },
    hoeflich: { title: 'Bitte, danke, Entschuldigung', lines: ['„Bitte“ sagst du, wenn du etwas möchtest.', '„Danke“ sagst du, wenn du etwas bekommst oder dir jemand hilft.', '„Entschuldigung“ sagst du, wenn du etwas falsch gemacht hast.', '„Guten Morgen“ oder „Hallo“ sagst du zur Begrüßung, „Tschüss“ zum Abschied.', 'Höflich ist auch: anklopfen, zuhören, ausreden lassen, die Tür aufhalten.'] },
    regeln: { title: 'Regeln', lines: ['Regeln helfen, dass alle gut zusammen lernen und sich wohlfühlen.', 'Gesprächsregeln: Ich melde mich. Ich lasse andere ausreden. Ich höre zu.', 'Im Schulhaus gehen wir langsam, damit sich niemand wehtut.', 'Wir räumen gemeinsam auf.', 'Fällt dir eine Regel schwer, kannst du um Hilfe bitten.'] },
    streit: { title: 'Streiten und versöhnen', lines: ['Streit kommt vor. Wichtig ist, wie man ihn löst.', 'Erst eine Pause machen und ruhig werden.', 'Dann sagt jeder, was ihn ärgert. Der andere hört zu.', 'Wer etwas falsch gemacht hat, entschuldigt sich.', 'Sich versöhnen heißt: wieder Frieden schließen.', 'Niemand darf ausgeschlossen werden. Fragt Kinder, die allein sind, ob sie mitmachen wollen.'] },
  };
  // mod: gefuehl, hoeflich, familie, mc = Was passt?, rf = Richtig oder falsch, ord = Reihenfolge
  const POOL1 = [
    { id: 'k1eg1', mod: 'gefuehl', g: 'gefuehle', q: 'Dein Eis fällt auf den Boden. Wie fühlst du dich?', o: ['traurig', 'fröhlich'], a: 0 },
    { id: 'k1eg2', mod: 'gefuehl', g: 'gefuehle', q: 'Oma kommt zu Besuch. Wie fühlst du dich?', o: ['fröhlich', 'wütend'], a: 0 },
    { id: 'k1eg3', mod: 'gefuehl', g: 'gefuehle', q: 'Jemand macht absichtlich deinen Turm kaputt. Wie fühlst du dich?', o: ['wütend', 'fröhlich'], a: 0 },
    { id: 'k1eg4', mod: 'gefuehl', g: 'gefuehle', q: 'Nachts donnert es laut. Wie fühlst du dich vielleicht?', o: ['ängstlich', 'fröhlich'], a: 0 },
    { id: 'k1eg5', mod: 'gefuehl', g: 'gefuehle', q: 'Du bist wütend. Was hilft?', o: ['Tief durchatmen', 'Jemanden hauen', 'Etwas kaputt machen'], a: 0 },
    { id: 'k1eg6', mod: 'gefuehl', g: 'gefuehle', q: 'Deine Freundin weint. Was kannst du tun?', o: ['Sie trösten', 'Sie auslachen', 'Schnell weggehen'], a: 0 },
    { id: 'k1eg7', mod: 'gefuehl', g: 'gefuehle', q: 'Du hast Angst. Was hilft?', o: ['Mit jemandem darüber reden', 'Die Angst verschweigen'], a: 0 },
    { id: 'k1eg8', mod: 'gefuehl', g: 'gefuehle', q: 'Woran sieht man oft, wie sich jemand fühlt?', o: ['Am Gesicht', 'An den Schuhen', 'An der Mütze'], a: 0 },
    { id: 'k1eg9', mod: 'gefuehl', g: 'gefuehle', q: 'Ein Kind bekommt Geburtstagsgeschenke. Wie fühlt es sich wohl?', o: ['fröhlich', 'ängstlich'], a: 0 },
    { id: 'k1eg10', mod: 'gefuehl', g: 'gefuehle', q: 'Dein Hamster ist gestorben. Wie fühlst du dich?', o: ['traurig', 'fröhlich'], a: 0 },
    { id: 'k1er1', mod: 'rf', g: 'gefuehle', q: 'Alle Gefühle sind erlaubt.', a: true },
    { id: 'k1er2', mod: 'rf', g: 'gefuehle', q: 'Wer wütend ist, darf hauen.', a: false, why: 'Wütend sein ist erlaubt, hauen nicht. Atme tief oder geh kurz weg.' },
    { id: 'k1er3', mod: 'rf', g: 'gefuehle', q: 'Auch Erwachsene sind manchmal traurig.', a: true },
    { id: 'k1er4', mod: 'rf', g: 'gefuehle', q: 'Über Gefühle reden hilft.', a: true },

    { id: 'k1em1', mod: 'mc', g: 'einmalig', q: 'Was hat kein anderer Mensch auf der Welt?', o: ['Deine Fingerabdrücke', 'Zwei Augen', 'Eine Nase'], a: 0 },
    { id: 'k1em2', mod: 'mc', g: 'einmalig', q: 'Mia kann noch nicht Rad fahren. Was hilft?', o: ['Üben', 'Gleich aufgeben', 'Andere auslachen'], a: 0 },
    { id: 'k1em3', mod: 'mc', g: 'einmalig', q: 'Ben sitzt im Rollstuhl. Was könnt ihr zusammen machen?', o: ['Zusammen lachen und spielen', 'Gar nichts'], a: 0 },
    { id: 'k1em4', mod: 'mc', g: 'einmalig', q: 'Lena hört schlecht. Wie hilfst du ihr?', o: ['Sie anschauen und deutlich sprechen', 'Leise flüstern', 'Wegschauen'], a: 0 },
    { id: 'k1em5', mod: 'mc', g: 'einmalig', q: 'Tom malt gut, Ida rechnet gut. Was stimmt?', o: ['Jeder kann etwas gut', 'Nur Tom kann etwas'], a: 0 },
    { id: 'k1em6', mod: 'mc', g: 'einmalig', q: 'Ein Kind sieht anders aus als du. Was tust du?', o: ['Freundlich sein', 'Es auslachen', 'Es wegschicken'], a: 0 },
    { id: 'k1er5', mod: 'rf', g: 'einmalig', q: 'Jeder Mensch ist einmalig.', a: true },
    { id: 'k1er6', mod: 'rf', g: 'einmalig', q: 'Alle Kinder können das Gleiche gut.', a: false, why: 'Jeder kann etwas anderes gut. Das macht uns verschieden.' },
    { id: 'k1er7', mod: 'rf', g: 'einmalig', q: 'Was man noch nicht kann, kann man üben.', a: true },
    { id: 'k1er8', mod: 'rf', g: 'einmalig', q: 'Kinder mit Brille gehören nicht dazu.', a: false, why: 'Alle Kinder gehören dazu, mit oder ohne Brille.' },

    { id: 'k1ef1', mod: 'familie', g: 'familie', q: 'Mia wohnt mit ihren zwei Mamas. Was stimmt?', o: ['Sie sind eine Familie.', 'Eine Familie braucht einen Papa.'], a: 0 },
    { id: 'k1ef2', mod: 'familie', g: 'familie', q: 'Paul wohnt mit Eltern, Oma, Opa und Tante. Was stimmt?', o: ['Alle gehören zu seiner Familie.', 'Nur die Eltern sind Familie.'], a: 0 },
    { id: 'k1ef3', mod: 'familie', g: 'familie', q: 'Lea wohnt mit Mama, Mamas neuem Mann und seiner Tochter. Was stimmt?', o: ['Sie sind jetzt eine Familie.', 'Sie können keine Familie sein.'], a: 0 },
    { id: 'k1ef4', mod: 'familie', g: 'familie', q: 'Ein Kind bekommt für immer neue Eltern. Was stimmt?', o: ['Sie sind jetzt seine Familie.', 'Sie passen nur kurz auf.'], a: 0 },
    { id: 'k1ef5', mod: 'familie', g: 'familie', q: 'Ole wohnt mit seinem Papa. Was stimmt?', o: ['Sie sind eine Familie.', 'Sie sind nur zu Besuch.'], a: 0 },
    { id: 'k1ef6', mod: 'familie', g: 'familie', q: 'Was ist in jeder Familie wichtig?', o: ['Sich lieb haben und helfen', 'Gleich aussehen', 'Viele Kinder haben'], a: 0 },
    { id: 'k1ef7', mod: 'familie', g: 'familie', q: 'Wer kann in einer Familie mithelfen?', o: ['Alle, auch die Kinder', 'Nur die Erwachsenen'], a: 0 },
    { id: 'k1ef8', mod: 'familie', g: 'familie', q: 'Wie viele Menschen gehören zu einer Familie?', o: ['Das ist verschieden', 'Immer vier', 'Immer zwei'], a: 0 },
    { id: 'k1ef9', mod: 'familie', g: 'familie', q: 'Bei Tom wohnen Eltern und Kinder, bei Ali auch Oma. Was stimmt?', o: ['Beides sind Familien.', 'Nur Tom hat eine Familie.'], a: 0 },
    { id: 'k1ef10', mod: 'familie', g: 'familie', q: 'Lina ist adoptiert. Was stimmt?', o: ['Ihre Eltern sorgen immer für sie.', 'Ihre Eltern sorgen nur kurz für sie.'], a: 0 },
    { id: 'k1er9', mod: 'rf', g: 'familie', q: 'Alle Familien sehen gleich aus.', a: false, why: 'Familien sind verschieden. Jede ist eine richtige Familie.' },
    { id: 'k1er10', mod: 'rf', g: 'familie', q: 'In einer Großfamilie wohnen oft Oma und Opa mit.', a: true },

    { id: 'k1eh1', mod: 'hoeflich', g: 'hoeflich', q: 'Du möchtest einen Stift haben. Was sagst du dazu?', o: ['Bitte', 'Danke', 'Tschüss'], a: 0 },
    { id: 'k1eh2', mod: 'hoeflich', g: 'hoeflich', q: 'Jemand hilft dir. Was sagst du?', o: ['Danke', 'Tschüss', 'Hallo'], a: 0 },
    { id: 'k1eh3', mod: 'hoeflich', g: 'hoeflich', q: 'Du trittst aus Versehen auf einen Fuß. Was sagst du?', o: ['Entschuldigung', 'Danke', 'Hallo'], a: 0 },
    { id: 'k1eh4', mod: 'hoeflich', g: 'hoeflich', q: 'Du kommst morgens in die Klasse. Was sagst du?', o: ['Guten Morgen', 'Tschüss', 'Gute Nacht'], a: 0 },
    { id: 'k1eh5', mod: 'hoeflich', g: 'hoeflich', q: 'Ein Kind sagt: „Gib her!“ Ist das höflich oder unhöflich?', o: ['unhöflich', 'höflich'], a: 0 },
    { id: 'k1eh6', mod: 'hoeflich', g: 'hoeflich', q: 'Ein Kind sagt: „Gibst du mir bitte die Schere?“ Ist das höflich?', o: ['höflich', 'unhöflich'], a: 0 },
    { id: 'k1eh7', mod: 'hoeflich', g: 'hoeflich', q: 'Jemand redet gerade. Was ist höflich?', o: ['Zuhören und ausreden lassen', 'Laut dazwischenrufen'], a: 0 },
    { id: 'k1eh8', mod: 'hoeflich', g: 'hoeflich', q: 'Du willst in ein fremdes Zimmer. Was tust du zuerst?', o: ['Anklopfen', 'Hineinrennen'], a: 0 },
    { id: 'k1eh9', mod: 'hoeflich', g: 'hoeflich', q: 'Hinter dir kommt jemand mit vollen Händen. Was ist höflich?', o: ['Die Tür aufhalten', 'Die Tür zuwerfen'], a: 0 },
    { id: 'k1eh10', mod: 'hoeflich', g: 'hoeflich', q: 'Du gehst nach Hause. Was sagst du?', o: ['Tschüss', 'Guten Morgen', 'Bitte'], a: 0 },
    { id: 'k1eh11', mod: 'hoeflich', g: 'hoeflich', q: 'Ein Kind rempelt dich an und entschuldigt sich. Was sagst du?', o: ['Schon gut', 'Du bist doof'], a: 0 },

    { id: 'k1erg1', mod: 'mc', g: 'regeln', q: 'Warum gibt es Regeln in der Klasse?', o: ['Damit alle gut zusammen lernen', 'Damit es langweilig ist', 'Damit niemand lacht'], a: 0 },
    { id: 'k1erg2', mod: 'mc', g: 'regeln', q: 'Du möchtest im Unterricht etwas sagen. Was tust du?', o: ['Mich melden', 'Laut rufen', 'Einfach losreden'], a: 0 },
    { id: 'k1erg3', mod: 'mc', g: 'regeln', q: 'Warum gehen wir im Schulhaus langsam?', o: ['Damit sich niemand wehtut', 'Weil wir müde sind'], a: 0 },
    { id: 'k1erg4', mod: 'mc', g: 'regeln', q: 'Nach dem Basteln liegt Papier am Boden. Was tut ihr?', o: ['Wir räumen zusammen auf', 'Wir lassen es liegen'], a: 0 },
    { id: 'k1erg5', mod: 'mc', g: 'regeln', q: 'Dir fällt eine Regel schwer. Was kannst du tun?', o: ['Um Hilfe bitten', 'Die Regel vergessen'], a: 0 },
    { id: 'k1erg6', mod: 'mc', g: 'regeln', q: 'Stell dir vor, alle reden gleichzeitig. Was passiert?', o: ['Keiner versteht etwas', 'Alle verstehen alles'], a: 0 },
    { id: 'k1er11', mod: 'rf', g: 'regeln', q: 'Zu den Gesprächsregeln gehört: andere ausreden lassen.', a: true },
    { id: 'k1er12', mod: 'rf', g: 'regeln', q: 'Regeln gelten nur für die anderen.', a: false, why: 'Regeln gelten für alle, auch für dich.' },

    { id: 'k1es1', mod: 'mc', g: 'streit', q: 'Ihr streitet. Was hilft zuerst?', o: ['Eine Pause machen und ruhig werden', 'Weiter schreien', 'Hauen'], a: 0 },
    { id: 'k1es2', mod: 'mc', g: 'streit', q: 'Du hast etwas falsch gemacht. Was sagst du?', o: ['Es tut mir leid', 'Selber schuld', 'Na und'], a: 0 },
    { id: 'k1es3', mod: 'mc', g: 'streit', q: 'Ein Kind steht allein auf dem Schulhof. Was tust du?', o: ['Fragen, ob es mitspielt', 'Es auslachen', 'Es wegschicken'], a: 0 },
    { id: 'k1es4', mod: 'mc', g: 'streit', q: 'Ein Kind darf nie mitmachen. Wie fühlt es sich wohl?', o: ['traurig', 'fröhlich'], a: 0 },
    { id: 'k1es5', mod: 'mc', g: 'streit', q: 'Was heißt „sich versöhnen“?', o: ['Wieder Frieden schließen', 'Weiter streiten', 'Weglaufen'], a: 0 },
    { id: 'k1es6', mod: 'mc', g: 'streit', q: 'Zwei Kinder wollen dieselbe Schaukel. Was ist eine gute Lösung?', o: ['Abwechseln', 'Schubsen', 'Sich anschreien'], a: 0 },
    { id: 'k1er13', mod: 'rf', g: 'streit', q: 'Streit kommt in jeder Klasse mal vor.', a: true },
    { id: 'k1er14', mod: 'rf', g: 'streit', q: 'Nach einem Streit kann man wieder Freunde sein.', a: true },
    { id: 'k1er15', mod: 'rf', g: 'streit', q: 'Ein Kind auszuschließen ist in Ordnung.', a: false, why: 'Niemand soll ausgeschlossen werden. Alle gehören dazu.' },
  ];
  const ORDER1 = [
    { items: steps('kv', ['Wir streiten uns.', 'Wir machen eine Pause.', 'Jeder sagt, was ihn ärgert.', 'Wir entschuldigen uns.', 'Wir geben uns die Hand.']), note: 'streit', q: 'So versöhnt ihr euch: Tippe die Schritte der Reihe nach an.', qid: 'k1eov_' },
    { items: steps('km', ['Ich habe eine Frage.', 'Ich melde mich.', 'Die Lehrerin ruft mich auf.', 'Ich stelle meine Frage.', 'Ich höre die Antwort.']), note: 'regeln', q: 'So fragst du im Unterricht: Tippe die Schritte der Reihe nach an.', qid: 'k1eom_' },
    { items: steps('kt', ['Ein Kind weint.', 'Ich gehe zu ihm hin.', 'Ich frage: „Was ist los?“', 'Ich höre gut zu.', 'Ich tröste es.']), note: 'gefuehle', q: 'So tröstest du: Tippe die Schritte der Reihe nach an.', qid: 'k1eot_' },
  ];
  function gen1(mod, tier, know, seq, opts) {
    if (mod !== 'gefuehl' || wantsPool(POOL1, mod, opts) || Math.random() < 0.4) return null;
    const id = pick(FACE_IDS), f = FACES[id];
    if (Math.random() < 0.5) return choice('gefuehl', 'gefuehle', 'Wie fühlt sich das Kind?', f.word, some(FACE_IDS.filter((x) => x !== id), 2).map((x) => FACES[x].word), 'k1egb_' + id, { pic: pic(f.svg, 'Gesicht eines Kindes'), face: id });
    const ids = [id].concat(some(FACE_IDS.filter((x) => x !== id), 2)); const opt = (x) => optPic(FACES[x].svg, 'Gesicht');
    return choice('gefuehl', 'gefuehle', `Tippe auf das ${f.word}e Gesicht.`, opt(id), ids.slice(1).map(opt), 'k1egt_' + id, { svgOpts: true, why: `So sieht ein ${f.word}es Kind aus:`, faces: ids });
  }
  K.MODES.ichdu1 = unit('ethik', [{ name: 'Spiegelblick', mod: 'gefuehl' }, { name: 'Händedruck', mod: 'hoeflich' }, { name: 'Familienfoto', mod: 'familie' }, { name: 'Sitzkreis', mod: 'mc' }], {
    grade: 1, subject: 'Ethik', title: 'Ich und die anderen', icon: '🙂', sub: 'Gefühle, Familien, bitte und danke, Regeln, streiten und versöhnen',
    modules: {
      gefuehl: { name: 'Gefühle', icon: '🙂', maxTier: 1, worldCap: [1], dmg: 12 },
      hoeflich: { name: 'Bitte und danke', icon: '💬', maxTier: 1, worldCap: [1], dmg: 10 },
      familie: { name: 'Familien', icon: '🏠', maxTier: 1, worldCap: [1], dmg: 12 },
      mc: { name: 'Was passt?', icon: '🔘', maxTier: 1, worldCap: [1], dmg: 12 },
      rf: { name: 'Richtig oder falsch', icon: '✅', maxTier: 1, worldCap: [1], dmg: 10 },
      ord: { name: 'Reihenfolge', icon: '🔢', maxTier: 1, worldCap: [1], dmg: 14 },
    },
    extra: { gefuehl: 'Stimmungsbarometer', hoeflich: 'Morgengruß', familie: 'Küchentisch', mc: 'Klassenrat', rf: 'Erzählstein', ord: 'Friedenstreppe' },
    tut: {
      'gefuehl:1': { title: 'Gefühle', steps: ['Schau dir das Gesicht genau an: Mund, Augen und Augenbrauen.', 'Der Mund lacht: fröhlich. Der Mund hängt nach unten, eine Träne fließt: traurig.', 'Böse Augenbrauen und zusammengebissene Zähne: wütend. Große Augen und ein zittriger Mund: ängstlich.', 'Tippe auf das passende Wort oder Gesicht.'] },
      'hoeflich:1': { title: 'Bitte und danke', steps: ['Hör dir an, was gerade passiert.', 'Du möchtest etwas: „Bitte“. Du bekommst etwas: „Danke“. Du hast etwas falsch gemacht: „Entschuldigung“.', 'Tippe auf die Antwort, die passt.'] },
      'familie:1': { title: 'Familien', steps: ['Hör genau zu: Wer wohnt in der Familie?', 'Zwei Mamas oder zwei Papas: Regenbogenfamilie. Oma und Opa wohnen mit: Großfamilie.', 'Kinder aus zwei Familien leben zusammen: Patchworkfamilie.', 'Tippe auf die passende Antwort.'] },
      'mc:1': { title: 'Was passt?', steps: ['Hör dir die Frage an.', 'Überlege: Was ist gut für dich und für die anderen?', 'Tippe auf die Antwort, die passt.'] },
      'rf:1': { title: 'Richtig oder falsch', steps: RF },
      'ord:1': { title: 'Reihenfolge', steps: ['Vier Schritte sind durcheinander.', 'Was passiert zuerst? Tippe es zuerst an, dann das Nächste.', UNDO] },
    },
    notes: NOTES1, pool: POOL1, order: ORDER1, gen: gen1,
    events: [
      dilemma('Das letzte Stück Kuchen', 'Auf dem Teller liegt noch ein Stück Kuchen. Du und dein Bruder wollt es beide.', [
        ['Wir teilen es.', 'Jeder bekommt eine Hälfte. Ihr esst zusammen.', 'Ist Teilen gerecht?'],
        ['Ich nehme es mir schnell.', 'Du isst es auf. Dein Bruder schaut dir zu.', 'Wie fühlt sich dein Bruder?'],
        ['Er darf es haben.', 'Dein Bruder freut sich. Morgen darfst du zuerst wählen.', 'Wie fühlt es sich an, etwas abzugeben?']]),
      dilemma('Der Turm', 'Ein Kind stößt aus Versehen deinen Turm aus Bausteinen um.', [
        ['Ich schimpfe laut.', 'Das Kind erschrickt und läuft weg. Der Turm bleibt kaputt.', 'Wusste das Kind, was passiert?'],
        ['Ich frage: „Hilfst du mir beim Aufbauen?“', 'Ihr baut zusammen einen noch höheren Turm.', 'Was ist der Unterschied zwischen aus Versehen und absichtlich?'],
        ['Ich sage, dass ich wütend bin.', 'Das Kind sagt: „Entschuldigung, das wollte ich nicht.“', 'Warum hilft es, Gefühle auszusprechen?']]),
      dilemma('Das neue Kind', 'Ein neues Kind steht in der Pause allein am Zaun.', [
        ['Ich frage, wie es heißt.', 'Es heißt Emil. Er zeigt dir, wie man Himmel und Hölle hüpft.', 'Wie fühlt man sich an einem neuen Ort?'],
        ['Ich bleibe bei meinen Freunden.', 'Emil steht weiter allein. Nach der Pause sitzt er still auf seinem Platz.', 'Was hätte Emil sich gewünscht?'],
        ['Ich hole meine Freunde dazu.', 'Zu viert spielt ihr Fangen. Emil lacht.', 'Wie wird aus einem Ich ein Wir?']]),
      dilemma('Das Bild', 'Deine Freundin hat ein schönes Bild gemalt. Die Lehrerin lobt sie. Dein Bild hat niemand angeschaut.', [
        ['Ich sage: „Dein Bild ist schön.“', 'Deine Freundin strahlt. Sie fragt, was du gemalt hast.', 'Kann man sich für andere freuen?'],
        ['Ich bin still und ärgere mich.', 'Der Ärger bleibt den ganzen Vormittag.', 'Was hilft gegen Neid?'],
        ['Ich zeige der Lehrerin mein Bild auch.', 'Sie schaut es an und fragt, was es zeigt.', 'Darf man zeigen, was man gemacht hat?']]),
      dilemma('Das Fangspiel', 'Ihr spielt Fangen. Mara sitzt im Rollstuhl und möchte mitmachen.', [
        ['Wir ändern die Regeln, damit sie mitmachen kann.', 'Ab jetzt wird nur gegangen, nicht gerannt. Mara fängt drei Kinder.', 'Wie kann ein Spiel für alle passen?'],
        ['Wir fragen Mara, was sie gern spielt.', 'Mara schlägt ein Ballspiel vor. Alle machen mit.', 'Warum ist es gut, nachzufragen?'],
        ['Wir spielen weiter wie immer.', 'Mara schaut zu. Nach einer Weile rollt sie weg.', 'Wie fühlt man sich, wenn man nicht mitmachen kann?']]),
      dilemma('Die neue Regel', 'Die Klasse darf sich eine neue Regel aussuchen. Welche schlägst du vor?', [
        ['Wir lassen andere ausreden.', 'Im Sitzkreis wird es ruhiger. Alle kommen dran.', 'Stell dir vor, es gäbe gar keine Regeln. Was wäre dann?'],
        ['Wir helfen einander.', 'Wer fertig ist, hilft dem Nachbarn.', 'Warum lernt man zusammen besser?'],
        ['Wir räumen gemeinsam auf.', 'Nach dem Basteln ist der Raum in fünf Minuten sauber.', 'Welche Regel fällt dir schwer?']]),
      dilemma('Der Spitzname', 'Zwei Kinder rufen Luis einen gemeinen Spitznamen nach. Luis senkt den Kopf.', [
        ['Ich sage: „Hört auf damit!“', 'Die Kinder hören auf. Luis schaut dich an und nickt.', 'Woher nimmt man den Mut, etwas zu sagen?'],
        ['Ich hole Hilfe bei einem Erwachsenen.', 'Die Lehrerin spricht mit den Kindern. Der Spitzname hört auf.', 'Ist Hilfe holen petzen?'],
        ['Ich gehe zu Luis und rede mit ihm.', 'Luis erzählt, wie weh das tut. Ihr geht zusammen in die Klasse.', 'Was hilft einem Kind, das ausgelacht wird?']]),
      ask('Der Sitzkreis', 'Im Sitzkreis liegt ein Stimmungsbarometer. Die Lehrerin fragt dich etwas zu Gefühlen und schenkt dir einen Trank.', 'gefuehl', 'gefuehle', { item: 'trank' }, { hp: -4 }),
      ask('Bei Oma und Opa', 'Oma blättert mit dir im Fotoalbum der Familie. Sie stellt dir eine Frage und gibt dir einen Schild.', 'familie', 'familie', { item: 'schild' }, { hp: -4 }),
      ask('Die Pausenaufsicht', 'Auf dem Schulhof hat die Pausenaufsicht einen Streit geschlichtet. Sie fragt dich etwas und schenkt dir einen Schutzengel.', 'any', 'streit', { item: 'engel' }, { xp: 5 }),
      rest('Die Leseecke', 'In der Leseecke liegen Kissen auf dem Teppich. Hier ruhst du dich aus.'),
    ],
  });

  /* ======================= Klasse 2: Feste und die Welt ======================= */
  const NOTES2 = {
    geburtstag: { title: 'Geburtstag', lines: ['Am Geburtstag feiern wir den Tag, an dem ein Mensch geboren wurde.', 'Jedes Jahr wird man ein Jahr älter.', 'Auf dem Kuchen brennen Kerzen. Die Kerze ist ein Zeichen für das Leben, das Lebenslicht.', 'Viele Klassen feiern Geburtstag mit einem Lied, einer Kerze oder einem Geburtstagsstuhl.'] },
    erntedank: { title: 'Erntedank', lines: ['Im Herbst ist Erntezeit. Beim Erntedankfest sagen Menschen Danke für die Ernte.', 'Viele feiern es Anfang Oktober.', 'Kirchen werden mit Obst, Gemüse und Getreide geschmückt. Manche binden eine Erntekrone aus Ähren.', 'Danke sagen kann man auch den Bäuerinnen und Bauern und allen, die für unser Essen arbeiten.'] },
    martin: { title: 'St. Martin', lines: ['Martin lebte vor langer Zeit. Er war ein römischer Soldat.', 'An einem kalten Tag traf er einen frierenden Bettler. Martin teilte seinen Mantel mit dem Schwert und gab ihm eine Hälfte.', 'Später wurde Martin Bischof. Eine Legende erzählt: Er versteckte sich in einem Gänsestall, weil er nicht Bischof werden wollte. Die Gänse schnatterten und verrieten ihn.', 'Am 11. November denken viele an Martin. Kinder ziehen mit Laternen durch die Straßen.', 'Martin erinnert uns: helfen, teilen, danken.'] },
    advent: { title: 'Advent', lines: ['Advent heißt Ankunft. Christen warten auf das Fest der Geburt von Jesus.', 'Die Adventszeit hat vier Sonntage vor Weihnachten.', 'Auf dem Adventskranz brennt an jedem Adventssonntag eine Kerze mehr.', 'Der Adventskalender hat 24 Türchen, bis zum 24. Dezember.', 'Advent ist eine Zeit der Stille, der Vorfreude und des Wartens.'] },
    nikolaus: { title: 'Nikolaus', lines: ['Am 6. Dezember ist Nikolaustag.', 'Nikolaus lebte vor langer Zeit. Er war Bischof in der Stadt Myra. Sie liegt heute in der Türkei.', 'Er half armen Menschen und schenkte heimlich. Eine Legende erzählt: Er warf nachts Goldstücke für drei arme Mädchen durch das Fenster.', 'Darum stellen Kinder am Abend vorher ihre geputzten Stiefel vor die Tür.'] },
    weihnachten: { title: 'Weihnachten', lines: ['An Weihnachten feiern Christen die Geburt von Jesus.', 'Lukas erzählt in der Bibel: Maria und Josef mussten nach Bethlehem gehen.', 'In der Herberge war kein Platz. Maria legte das Kind in eine Futterkrippe. Viele stellen sich dazu einen Stall vor.', 'Ein Engel erzählte den Hirten auf dem Feld davon. Die Hirten gingen zum Stall und fanden das Kind.', 'Heiligabend ist am 24. Dezember. Viele schmücken einen Weihnachtsbaum und beschenken sich.'] },
    silvester: { title: 'Silvester und Neujahr', lines: ['Silvester ist am 31. Dezember, dem letzten Tag des Jahres. Der Tag heißt nach dem Heiligen Silvester.', 'Um Mitternacht beginnt das neue Jahr. Am 1. Januar ist Neujahr.', 'Man wünscht sich Glück für das neue Jahr.', 'Glückssymbole sind das Kleeblatt mit vier Blättern, der Schornsteinfeger, das Glücksschwein und das Hufeisen.', 'Viele nehmen sich etwas vor. Das heißt ein guter Vorsatz.'] },
    ostern: { title: 'Ostern', lines: ['An Ostern feiern Christen, dass Jesus von den Toten auferstanden ist.', 'Die Bibel erzählt: Am Karfreitag starb Jesus am Kreuz. Am Ostersonntag war sein Grab leer.', 'Ostern ist im Frühling, im März oder April.', 'Das Ei ist ein Zeichen für neues Leben. Kinder suchen bunte Ostereier.', 'Weitere Osterbräuche: Osterhase, Osterfeuer und Osterlamm.'] },
    jahr: { title: 'Feste im Jahr', lines: ['1. Januar: Neujahr', 'März oder April: Ostern', 'Anfang Oktober: Erntedank', '11. November: St. Martin', 'Ende November oder Anfang Dezember: 1. Advent', '6. Dezember: Nikolaus', '24. Dezember: Heiligabend, dann Weihnachten', '31. Dezember: Silvester', 'Den Geburtstag feiert jeder an seinem eigenen Tag.'] },
    staunen: { title: 'Staunen über die Natur', lines: ['Die Sonne gibt Licht und Wärme. Ohne sie gäbe es kein Leben auf der Erde.', 'Der Mond leuchtet nicht selbst. Die Sonne strahlt ihn an. Mal sehen wir ihn rund, mal als schmale Sichel.', 'Sterne sind Sonnen, die sehr weit weg sind.', 'Ein Regenbogen entsteht, wenn die Sonne in Regentropfen scheint. Für viele Menschen ist er ein Zeichen der Hoffnung.', 'Jeder Schneekristall hat sechs Spitzen.', 'Kleine Tiere, große Meister: Die Spinne webt ein Netz, die Biene baut Waben aus Wachs.'] },
    schuetzen: { title: 'Natur und Tiere schützen', lines: ['Müll gehört in den Mülleimer, nicht in den Wald.', 'Blumen im Park und auf der Wiese lässt man stehen. Dort finden Bienen Futter.', 'Vogelnester und junge Tiere nicht anfassen und nicht stören.', 'Wasser und Strom sparen schützt die Natur.', 'Ein Insektenhotel und eine Blumenwiese helfen Bienen und Käfern.', 'Wer ein Haustier hat, sorgt jeden Tag für Futter, Wasser und Pflege.'] },
    wachsen: { title: 'Werden, wachsen, vergehen', lines: ['Aus einem Samen wird ein Keimling, dann eine Pflanze. Sie blüht und bildet Früchte mit neuen Samen.', 'Eine Pflanze braucht Wasser, Licht, Erde und Wärme.', 'Aus dem Ei schlüpft eine Raupe. Sie wird zur Puppe, dann schlüpft ein Schmetterling.', 'Aus dem Froschlaich werden Kaulquappen. Sie bekommen Beine und werden zu Fröschen.', 'Menschen wachsen auch: Baby, Kind, Erwachsener, alter Mensch.', 'Alles Leben vergeht einmal. Ein Blatt fällt im Herbst und wird zu Erde. Daraus wächst Neues.', 'Tiere können sich von der Stelle bewegen. Pflanzen bleiben an ihrem Platz.'] },
  };
  // mod: fest, symbol, jahr, natur, wachsen, rf
  const POOL2 = [
    { id: 'k2ff1', mod: 'fest', g: 'geburtstag', q: 'Wofür steht die Kerze auf dem Geburtstagskuchen?', o: ['Für das Leben', 'Für den Winter', 'Für das Essen'], a: 0 },
    { id: 'k2ff2', mod: 'fest', g: 'geburtstag', q: 'Was feiern wir am Geburtstag?', o: ['Den Tag, an dem man geboren wurde', 'Den ersten Schultag', 'Das neue Jahr'], a: 0 },
    { id: 'k2ff3', mod: 'fest', g: 'geburtstag', q: 'Wie nennt man die Kerze als Zeichen für das Leben?', o: ['Lebenslicht', 'Nachtlicht', 'Taschenlampe'], a: 0 },
    { id: 'k2ff4', mod: 'fest', g: 'erntedank', q: 'Wofür sagen Menschen beim Erntedankfest Danke?', o: ['Für die Ernte', 'Für den Schnee', 'Für die Ferien'], a: 0 },
    { id: 'k2ff5', mod: 'fest', g: 'erntedank', q: 'Womit wird die Kirche zu Erntedank geschmückt?', o: ['Mit Obst, Gemüse und Getreide', 'Mit Ostereiern', 'Mit Laternen'], a: 0 },
    { id: 'k2ff6', mod: 'fest', g: 'erntedank', q: 'Woraus binden manche Menschen eine Erntekrone?', o: ['Aus Ähren', 'Aus Papier', 'Aus Plastik'], a: 0 },
    { id: 'k2ff7', mod: 'fest', g: 'martin', q: 'Was teilte Martin mit dem Bettler?', o: ['Seinen Mantel', 'Sein Pferd', 'Sein Schwert'], a: 0 },
    { id: 'k2ff8', mod: 'fest', g: 'martin', q: 'Womit teilte Martin seinen Mantel?', o: ['Mit dem Schwert', 'Mit einer Schere', 'Mit einem Messer'], a: 0 },
    { id: 'k2ff9', mod: 'fest', g: 'martin', q: 'Welche Tiere verrieten Martin in der Legende?', o: ['Gänse', 'Hühner', 'Katzen'], a: 0 },
    { id: 'k2ff10', mod: 'fest', g: 'martin', q: 'Was war Martin, als er den Mantel teilte?', o: ['Ein Soldat', 'Ein Bäcker', 'Ein König'], a: 0 },
    { id: 'k2ff11', mod: 'fest', g: 'advent', q: 'Was heißt das Wort Advent?', o: ['Ankunft', 'Abschied', 'Abendessen'], a: 0 },
    { id: 'k2ff12', mod: 'fest', g: 'advent', q: 'Wie viele Kerzen hat ein Adventskranz meistens?', o: ['Vier', 'Zwei', 'Sieben'], a: 0 },
    { id: 'k2ff13', mod: 'fest', g: 'advent', q: 'Wie viele Türchen hat ein Adventskalender meistens?', o: ['24', '12', '31'], a: 0 },
    { id: 'k2ff14', mod: 'fest', g: 'advent', q: 'Was für eine Zeit ist der Advent?', o: ['Eine Zeit des Wartens und der Vorfreude', 'Die Zeit der Ernte', 'Die Zeit der Sommerferien'], a: 0 },
    { id: 'k2ff15', mod: 'fest', g: 'nikolaus', q: 'Wo war Nikolaus Bischof?', o: ['In Myra', 'In Rom', 'In Berlin'], a: 0 },
    { id: 'k2ff16', mod: 'fest', g: 'nikolaus', q: 'Was stellen Kinder am Abend vor dem Nikolaustag vor die Tür?', o: ['Ihre geputzten Stiefel', 'Ihre Schultasche', 'Einen Weihnachtsbaum'], a: 0 },
    { id: 'k2ff17', mod: 'fest', g: 'nikolaus', q: 'Wem half Nikolaus?', o: ['Armen Menschen', 'Nur dem König'], a: 0 },
    { id: 'k2ff18', mod: 'fest', g: 'weihnachten', q: 'Was feiern Christen an Weihnachten?', o: ['Die Geburt von Jesus', 'Die Ernte', 'Das neue Jahr'], a: 0 },
    { id: 'k2ff19', mod: 'fest', g: 'weihnachten', q: 'Wo kam Jesus zur Welt, wie man es oft erzählt?', o: ['In einem Stall', 'In einem Schloss', 'In einem Zelt'], a: 0 },
    { id: 'k2ff20', mod: 'fest', g: 'weihnachten', q: 'Wohin legte Maria das Kind?', o: ['In eine Futterkrippe', 'In ein Himmelbett', 'In einen Korb'], a: 0 },
    { id: 'k2ff21', mod: 'fest', g: 'weihnachten', q: 'Wem erzählte der Engel von der Geburt?', o: ['Den Hirten', 'Den Soldaten', 'Den Fischern'], a: 0 },
    { id: 'k2ff22', mod: 'fest', g: 'weihnachten', q: 'In welche Stadt gingen Maria und Josef?', o: ['Nach Bethlehem', 'Nach Myra', 'Nach Rom'], a: 0 },
    { id: 'k2ff23', mod: 'fest', g: 'silvester', q: 'Was ist ein guter Vorsatz?', o: ['Etwas, das man sich vornimmt', 'Ein Geschenk', 'Ein Lied'], a: 0 },
    { id: 'k2ff24', mod: 'fest', g: 'silvester', q: 'Nach wem heißt der Silvestertag?', o: ['Nach dem Heiligen Silvester', 'Nach einem Feuerwerk', 'Nach einem König'], a: 0 },
    { id: 'k2ff25', mod: 'fest', g: 'ostern', q: 'Was feiern Christen an Ostern?', o: ['Die Auferstehung von Jesus', 'Die Geburt von Jesus', 'Die Ernte'], a: 0 },
    { id: 'k2ff26', mod: 'fest', g: 'ostern', q: 'Wofür ist das Osterei ein Zeichen?', o: ['Für neues Leben', 'Für den Winter', 'Für Streit'], a: 0 },
    { id: 'k2ff27', mod: 'fest', g: 'ostern', q: 'Was erzählt die Bibel vom Ostersonntag?', o: ['Das Grab von Jesus war leer.', 'Jesus wurde geboren.', 'Martin teilte den Mantel.'], a: 0 },

    { id: 'k2fs1', mod: 'symbol', g: 'ostern', q: 'Was gehört zu Ostern?', o: ['Bunte Eier', 'Laternen', 'Ein Adventskranz'], a: 0 },
    { id: 'k2fs2', mod: 'symbol', g: 'nikolaus', q: 'Was gehört zum Nikolaustag?', o: ['Geputzte Stiefel', 'Eine Erntekrone', 'Ein Osterfeuer'], a: 0 },
    { id: 'k2fs3', mod: 'symbol', g: 'martin', q: 'Was gehört zu St. Martin?', o: ['Die Laterne', 'Das Osterei', 'Das Kleeblatt'], a: 0 },
    { id: 'k2fs4', mod: 'symbol', g: 'silvester', q: 'Was ist ein Glückssymbol zu Neujahr?', o: ['Der Schornsteinfeger', 'Der Osterhase', 'Die Laterne'], a: 0 },
    { id: 'k2fs5', mod: 'symbol', g: 'erntedank', q: 'Was gehört zum Erntedankfest?', o: ['Die Erntekrone', 'Der Weihnachtsbaum', 'Die Laterne'], a: 0 },
    { id: 'k2fs6', mod: 'symbol', g: 'geburtstag', q: 'Was gehört zum Geburtstag?', o: ['Ein Kuchen mit Kerzen', 'Ein Osternest', 'Ein Adventskranz'], a: 0 },

    { id: 'k2fj1', mod: 'jahr', g: 'jahr', q: 'Welches Fest ist im Frühling?', o: ['Ostern', 'Nikolaus', 'Erntedank'], a: 0 },
    { id: 'k2fj2', mod: 'jahr', g: 'jahr', q: 'Welches Fest ist im Herbst?', o: ['Erntedank', 'Ostern', 'Silvester'], a: 0 },
    { id: 'k2fj3', mod: 'jahr', g: 'jahr', q: 'Wann ist Nikolaustag?', o: ['Am 6. Dezember', 'Am 1. Januar', 'Am 11. November'], a: 0 },
    { id: 'k2fj4', mod: 'jahr', g: 'jahr', q: 'Wann ist Martinstag?', o: ['Am 11. November', 'Am 6. Dezember', 'Am 24. Dezember'], a: 0 },
    { id: 'k2fj5', mod: 'jahr', g: 'jahr', q: 'Wann ist Silvester?', o: ['Am 31. Dezember', 'Am 1. Januar', 'Am 6. Dezember'], a: 0 },
    { id: 'k2fj6', mod: 'jahr', g: 'jahr', q: 'Welches Fest ist am 1. Januar?', o: ['Neujahr', 'Silvester', 'Ostern'], a: 0 },
    { id: 'k2fj7', mod: 'jahr', g: 'jahr', q: 'Was kommt zuerst: Advent oder Weihnachten?', o: ['Advent', 'Weihnachten'], a: 0 },
    { id: 'k2fj8', mod: 'jahr', g: 'jahr', q: 'Was kommt zuerst: St. Martin oder Nikolaus?', o: ['St. Martin', 'Nikolaus'], a: 0 },
    { id: 'k2fj9', mod: 'jahr', g: 'jahr', q: 'Welches Fest feiert jeder an einem anderen Tag?', o: ['Den Geburtstag', 'Weihnachten', 'Silvester'], a: 0 },
    { id: 'k2fj10', mod: 'jahr', g: 'jahr', q: 'Wann ist Heiligabend?', o: ['Am 24. Dezember', 'Am 31. Dezember', 'Am 6. Dezember'], a: 0 },

    { id: 'k2fn1', mod: 'natur', g: 'staunen', q: 'Was gibt uns die Sonne?', o: ['Licht und Wärme', 'Regen und Schnee', 'Nebel'], a: 0 },
    { id: 'k2fn2', mod: 'natur', g: 'staunen', q: 'Warum leuchtet der Mond?', o: ['Die Sonne strahlt ihn an.', 'Er hat eine Lampe.', 'Er brennt.'], a: 0 },
    { id: 'k2fn3', mod: 'natur', g: 'staunen', q: 'Was sind Sterne?', o: ['Sonnen, die sehr weit weg sind', 'Lampen am Himmel', 'Glühwürmchen'], a: 0 },
    { id: 'k2fn4', mod: 'natur', g: 'staunen', q: 'Wann siehst du einen Regenbogen?', o: ['Wenn die Sonne in den Regen scheint', 'Mitten in der Nacht', 'Wenn es schneit'], a: 0 },
    { id: 'k2fn5', mod: 'natur', g: 'staunen', q: 'Wie viele Spitzen hat ein Schneekristall?', o: ['Sechs', 'Drei', 'Zehn'], a: 0 },
    { id: 'k2fn6', mod: 'natur', g: 'staunen', q: 'Wer baut Waben aus Wachs?', o: ['Die Biene', 'Die Spinne', 'Die Ameise'], a: 0 },
    { id: 'k2fn7', mod: 'natur', g: 'staunen', q: 'Wer webt ein Netz?', o: ['Die Spinne', 'Die Biene', 'Der Regenwurm'], a: 0 },
    { id: 'k2fn8', mod: 'natur', g: 'staunen', q: 'Wofür ist der Regenbogen für viele Menschen ein Zeichen?', o: ['Für Hoffnung', 'Für Streit', 'Für Hunger'], a: 0 },
    { id: 'k2fn9', mod: 'natur', g: 'schuetzen', q: 'Du findest ein Vogelnest. Was tust du?', o: ['Ich lasse es in Ruhe.', 'Ich nehme die Eier mit.'], a: 0 },
    { id: 'k2fn10', mod: 'natur', g: 'schuetzen', q: 'Wohin gehört dein Bonbonpapier im Wald?', o: ['In meine Tasche, später in den Müll', 'Unter einen Baum', 'In den Bach'], a: 0 },
    { id: 'k2fn11', mod: 'natur', g: 'schuetzen', q: 'Warum lässt man Blumen auf der Wiese stehen?', o: ['Bienen finden dort Futter.', 'Damit sie schneller welken.'], a: 0 },
    { id: 'k2fn12', mod: 'natur', g: 'schuetzen', q: 'Was hilft Bienen und Käfern?', o: ['Ein Insektenhotel', 'Ein Parkplatz', 'Gift im Garten'], a: 0 },
    { id: 'k2fn13', mod: 'natur', g: 'schuetzen', q: 'Was braucht dein Haustier jeden Tag?', o: ['Futter, Wasser und Pflege', 'Nur einmal pro Woche Futter', 'Nur Spielzeug und Leckerli'], a: 0 },

    { id: 'k2fw1', mod: 'wachsen', g: 'wachsen', q: 'Was braucht eine Pflanze zum Wachsen?', o: ['Wasser, Licht und Erde', 'Nur Wasser im Dunkeln', 'Viel Salz und Zucker'], a: 0 },
    { id: 'k2fw2', mod: 'wachsen', g: 'wachsen', q: 'Was wächst aus einem Samen?', o: ['Eine Pflanze', 'Ein Stein', 'Ein Vogel'], a: 0 },
    { id: 'k2fw3', mod: 'wachsen', g: 'wachsen', q: 'Was schlüpft aus der Puppe?', o: ['Ein Schmetterling', 'Eine Raupe', 'Ein Frosch'], a: 0 },
    { id: 'k2fw4', mod: 'wachsen', g: 'wachsen', q: 'Was wird aus einer Kaulquappe?', o: ['Ein Frosch', 'Ein Fisch', 'Ein Vogel'], a: 0 },
    { id: 'k2fw5', mod: 'wachsen', g: 'wachsen', q: 'Was kann ein Tier, aber eine Pflanze nicht?', o: ['Sich von der Stelle bewegen', 'Wachsen', 'Wasser brauchen'], a: 0 },
    { id: 'k2fw6', mod: 'wachsen', g: 'wachsen', q: 'Was passiert mit dem Laub im Herbst?', o: ['Es fällt ab und wird zu Erde.', 'Es wird blau.', 'Es fliegt in den Süden.'], a: 0 },
    { id: 'k2fw7', mod: 'wachsen', g: 'wachsen', q: 'Was schlüpft aus einem Hühnerei?', o: ['Ein Küken', 'Eine Raupe', 'Ein Kätzchen'], a: 0 },

    { id: 'k2fr1', mod: 'rf', g: 'martin', q: 'Martin teilte seinen Mantel mit einem Bettler.', a: true },
    { id: 'k2fr2', mod: 'rf', g: 'nikolaus', q: 'Nikolaustag ist am 24. Dezember.', a: false, why: 'Nikolaustag ist am 6. Dezember.' },
    { id: 'k2fr3', mod: 'rf', g: 'advent', q: 'Der Adventskranz hat meistens vier Kerzen.', a: true },
    { id: 'k2fr4', mod: 'rf', g: 'ostern', q: 'Ostern ist im Herbst.', a: false, why: 'Ostern ist im Frühling, im März oder April.' },
    { id: 'k2fr5', mod: 'rf', g: 'erntedank', q: 'Beim Erntedankfest sagen Menschen Danke für die Ernte.', a: true },
    { id: 'k2fr6', mod: 'rf', g: 'weihnachten', q: 'Lukas erzählt: Maria legte das Kind in eine Futterkrippe.', a: true },
    { id: 'k2fr7', mod: 'rf', g: 'staunen', q: 'Der Mond leuchtet von selbst.', a: false, why: 'Der Mond leuchtet nicht selbst. Die Sonne strahlt ihn an.' },
    { id: 'k2fr8', mod: 'rf', g: 'wachsen', q: 'Pflanzen brauchen Licht zum Wachsen.', a: true },
    { id: 'k2fr9', mod: 'rf', g: 'wachsen', q: 'Aus einer Raupe wird ein Schmetterling.', a: true },
    { id: 'k2fr10', mod: 'rf', g: 'schuetzen', q: 'Müll darf man im Wald liegen lassen.', a: false, why: 'Müll schadet Tieren und Pflanzen. Er gehört in den Mülleimer.' },
    { id: 'k2fr11', mod: 'rf', g: 'silvester', q: 'Silvester ist der letzte Tag im Jahr.', a: true },
    { id: 'k2fr12', mod: 'rf', g: 'geburtstag', q: 'Die Geburtstagskerze ist ein Zeichen für das Leben.', a: true },
  ];
  // m: Monat.Tag, nur für die Reihenfolge (der 1. Advent liegt immer zwischen dem 27. November und dem 3. Dezember)
  const JAHR = [['Neujahr', 1.01], ['Ostern', 3.22], ['Erntedank', 10.01], ['St. Martin', 11.11], ['1. Advent', 11.27], ['Nikolaus', 12.06], ['Weihnachten', 12.24], ['Silvester', 12.31]].map(([text, m], i) => ({ id: 'fj' + (i + 1), text, m }));
  const FESTORD = [
    { items: steps('fl', ['Maria und Josef gehen nach Bethlehem.', 'In der Herberge ist kein Platz.', 'Jesus wird geboren und in eine Krippe gelegt.', 'Ein Engel erscheint den Hirten.', 'Die Hirten finden das Kind in der Krippe.']), note: 'weihnachten', q: 'Die Weihnachtsgeschichte nach Lukas: Tippe der Reihe nach an.' },
    { items: steps('fm', ['Martin reitet als Soldat durch die Kälte.', 'Am Stadttor friert ein Bettler.', 'Martin teilt seinen Mantel mit dem Schwert.', 'Er gibt dem Bettler eine Hälfte.', 'Später wird Martin Bischof.']), note: 'martin', q: 'Die Geschichte von Martin: Tippe der Reihe nach an.' },
    { items: steps('fo', ['Jesus stirbt am Karfreitag am Kreuz.', 'Er wird in ein Grab gelegt.', 'Am Ostersonntag ist das Grab leer.', 'Christen feiern die Auferstehung.']), note: 'ostern', q: 'Was die Bibel von Ostern erzählt: Tippe der Reihe nach an.' },
  ];
  const WACHSEN = [
    { items: steps('wp', ['Ein Samen liegt in der Erde.', 'Ein Keimling wächst.', 'Die Pflanze bekommt Blätter.', 'Die Pflanze blüht.', 'Eine Frucht mit Samen wächst.']), q: 'Vom Samen zur Frucht: Tippe der Reihe nach an.' },
    { items: steps('ws', ['Ein Ei liegt auf dem Blatt.', 'Eine Raupe schlüpft.', 'Die Raupe frisst und wächst.', 'Die Raupe wird zur Puppe.', 'Ein Schmetterling schlüpft.']), q: 'Vom Ei zum Schmetterling: Tippe der Reihe nach an.' },
    { items: steps('wf', ['Im Teich liegt Froschlaich.', 'Kaulquappen schlüpfen.', 'Die Kaulquappen bekommen Beine.', 'Der Schwanz wird kürzer.', 'Ein Frosch hüpft an Land.']), q: 'Vom Laich zum Frosch: Tippe der Reihe nach an.' },
    { items: steps('wm', ['Ein Baby wird geboren.', 'Das Kind lernt laufen.', 'Das Kind geht zur Schule.', 'Der Mensch ist erwachsen.', 'Der Mensch ist alt.']), q: 'Ein Menschenleben: Tippe der Reihe nach an.' },
    { items: steps('wb', ['Im Frühling wächst ein grünes Blatt.', 'Im Sommer ist das Blatt groß.', 'Im Herbst wird das Blatt bunt.', 'Das Blatt fällt auf den Boden.', 'Das Blatt wird zu Erde.']), q: 'Ein Blatt im Jahr: Tippe der Reihe nach an.' },
  ].map((o) => Object.assign(o, { note: 'wachsen' }));
  function gen2(mod, tier, know, seq, opts) {
    if (wantsPool(POOL2, mod, opts)) return null;
    const r = Math.random();
    if (mod === 'jahr' && r < 0.55) return ord('jahr', 'jahrord:1', { items: JAHR, note: 'jahr', q: 'Welches Fest kommt zuerst im Jahr? Tippe der Reihe nach an.' }, 'k2fjo_');
    if (mod === 'wachsen' && r < 0.55) { const i = Math.floor(Math.random() * WACHSEN.length); return ord('wachsen', 'wachsord:1', WACHSEN[i], `k2fwo${i}_`); }
    if (mod === 'fest' && r < 0.3) { const i = Math.floor(Math.random() * FESTORD.length); return ord('fest', 'festord:1', FESTORD[i], `k2ffo${i}_`); }
    if (mod !== 'symbol' || r < 0.3) return null;
    const s = pick(SYMS); const others = some(SYMS.filter((x) => symFits(s, x)), 2);
    if (Math.random() < 0.5) return choice('symbol', s.note, 'Zu welchem Fest gehört das?', s.fest, some(FESTE.filter((f) => symFits(s, { fest: f })), 2), 'k2fsb_' + s.id, { pic: pic(s.svg, 'Zeichen eines Festes'), sym: s.id });
    const opt = (x) => optPic(x.svg, 'Zeichen');
    return choice('symbol', s.note, `Tippe auf das Zeichen für ${s.fest}.`, opt(s), others.map(opt), 'k2fst_' + s.id, { svgOpts: true, why: `Das gehört zu ${s.fest}:`, syms: [s.id].concat(others.map((x) => x.id)) });
  }
  K.MODES.feste2 = unit('ethik', [{ name: 'Erntekrone', mod: 'fest' }, { name: 'Laternenlicht', mod: 'symbol' }, { name: 'Adventskalender', mod: 'jahr' }, { name: 'Samentüte', mod: 'wachsen' }], {
    grade: 2, subject: 'Ethik', title: 'Feste und die Welt', icon: '🕯️', sub: 'Feste von Erntedank bis Ostern, Staunen über die Natur, werden und wachsen',
    modules: {
      fest: { name: 'Feste', icon: '🎁', maxTier: 1, worldCap: [1], dmg: 12 },
      symbol: { name: 'Zeichen der Feste', icon: '🕯️', maxTier: 1, worldCap: [1], dmg: 12 },
      jahr: { name: 'Feste im Jahr', icon: '📅', maxTier: 1, worldCap: [1], dmg: 14 },
      natur: { name: 'Staunen und schützen', icon: '🌼', maxTier: 1, worldCap: [1], dmg: 12 },
      wachsen: { name: 'Werden und wachsen', icon: '🌱', maxTier: 1, worldCap: [1], dmg: 14 },
      rf: { name: 'Richtig oder falsch', icon: '✅', maxTier: 1, worldCap: [1], dmg: 10 },
    },
    extra: { fest: 'Martinsmantel', symbol: 'Osterfeuer', jahr: 'Wandkalender', natur: 'Sternenhimmel', wachsen: 'Gießkanne', rf: 'Glücksklee' },
    tut: {
      'fest:1': { title: 'Feste', steps: ['Hör dir die Frage zu einem Fest an.', 'Denk an deine Notizen: Was erzählt man von Martin, Nikolaus, Weihnachten oder Ostern?', 'Tippe auf die richtige Antwort.'] },
      'festord:1': { title: 'Geschichten zu Festen', steps: ['Vier Teile einer Geschichte sind durcheinander: von Martin, von Weihnachten oder von Ostern.', 'Was passiert zuerst? Tippe es zuerst an, dann das Nächste.', UNDO] },
      'symbol:1': { title: 'Zeichen der Feste', steps: ['Jedes Fest hat seine Zeichen: die Laterne für St. Martin, der Adventskranz für den Advent, das Osterei für Ostern.', 'Schau dir das Bild an und überlege, wann du so etwas siehst.', 'Tippe auf das passende Fest oder Bild.'] },
      'jahr:1': { title: 'Feste im Jahr', steps: ['Hör dir die Frage an: Wann im Jahr ist das Fest?', 'Das Jahr beginnt am 1. Januar mit Neujahr und endet am 31. Dezember mit Silvester.', 'Tippe auf die richtige Antwort.'] },
      'jahrord:1': { title: 'Feste im Jahr ordnen', steps: ['Vier Feste sind durcheinander.', 'Das Jahr beginnt im Januar. Tippe zuerst das Fest an, das als Erstes kommt.', 'Beispiel: Ostern im Frühling kommt vor St. Martin im November.', UNDO] },
      'natur:1': { title: 'Staunen und schützen', steps: ['Hör dir die Frage über Sonne, Mond, Sterne oder Tiere an.', 'Überlege: Was stimmt, und was ist gut für die Natur?', 'Tippe auf die richtige Antwort.'] },
      'wachsen:1': { title: 'Werden und wachsen', steps: ['Hör dir die Frage an: Wie wächst eine Pflanze oder ein Tier?', 'Denk an den Weg vom Samen zur Pflanze und vom Ei zum Schmetterling.', 'Tippe auf die richtige Antwort.'] },
      'wachsord:1': { title: 'Werden, wachsen, vergehen', steps: ['Vier Schritte sind durcheinander: wie etwas entsteht, wächst und vergeht.', 'Tippe zuerst an, was am Anfang passiert. Beispiel: Zuerst kommt der Samen, dann der Keimling.', UNDO] },
      'rf:1': { title: 'Richtig oder falsch', steps: RF },
    },
    notes: NOTES2, pool: POOL2, gen: gen2,
    events: [
      dilemma('Die Einladung', 'Du feierst Geburtstag und darfst fünf Kinder einladen. Ella ist neu in der Klasse und kennt noch niemanden.', [
        ['Ich lade Ella auch ein.', 'Ella bringt ein selbst gemaltes Bild mit. Beim Topfschlagen lacht sie am lautesten.', 'Wie fühlt sich jemand, der eingeladen wird?'],
        ['Ich lade nur meine Freunde ein.', 'Die Feier ist schön. Am Montag fragt Ella, wie es war.', 'Wen würdest du gern noch kennenlernen?'],
        ['Ich frage Mama, ob noch ein Kind mehr kommen darf.', 'Mama nickt. Jetzt kommen sechs Kinder.', 'Kann man eine Lösung für alle finden?']]),
      dilemma('Die Martinsbrezel', 'Nach dem Laternenumzug bekommst du eine große Martinsbrezel. Dein Freund hat keine bekommen.', [
        ['Ich teile sie mit ihm.', 'Jeder isst eine Hälfte, so wie Martin seinen Mantel geteilt hat.', 'Warum ist Teilen an St. Martin so wichtig?'],
        ['Ich esse sie allein.', 'Die Brezel schmeckt. Dein Freund schaut zu.', 'Wann fällt Teilen schwer?'],
        ['Wir fragen, ob noch Brezeln da sind.', 'Am Stand liegt noch eine. Jetzt hat jeder seine eigene.', 'Muss man immer teilen, oder kann man auch fragen?']]),
      dilemma('Der Nikolausstiefel', 'Am Nikolausmorgen ist im Stiefel deiner Schwester mehr Schokolade als in deinem.', [
        ['Ich sage, das ist ungerecht.', 'Mama zeigt dir die Mandarinen in deinem Stiefel. Am Ende hat jeder gleich viel.', 'Was ist gerecht: genau gleich viel oder für jeden das Passende?'],
        ['Ich freue mich über meinen Stiefel.', 'Du isst ein Stück und hebst den Rest auf.', 'Worüber freust du dich am Nikolaustag am meisten?'],
        ['Ich nehme mir heimlich etwas.', 'Deine Schwester merkt es und ist traurig.', 'Wie hat Nikolaus in der Legende geschenkt?']]),
      dilemma('Der Wunschzettel', 'Du schreibst deinen Wunschzettel. Das große Spielzeugschloss ist sehr teuer.', [
        ['Ich wünsche es mir trotzdem.', 'Deine Eltern sagen, es ist zu teuer. Unter dem Baum liegt ein kleineres Geschenk.', 'Was macht Weihnachten zu Weihnachten?'],
        ['Ich wünsche mir einen Nachmittag mit Papa zum Plätzchenbacken.', 'Ihr backt einen ganzen Nachmittag. Die Küche duftet.', 'Welche Geschenke kosten nichts?'],
        ['Ich bastle selbst Geschenke für die Familie.', 'Oma hängt deinen Papierstern ans Fenster.', 'Ist Schenken schöner als beschenkt werden?']]),
      dilemma('Der Vorsatz', 'Es ist Silvester. Deine Familie überlegt sich gute Vorsätze für das neue Jahr.', [
        ['Ich will jeden Tag mein Zimmer aufräumen.', 'Im Januar klappt es oft. Im Februar vergisst du es manchmal.', 'Wie hält man einen Vorsatz durch?'],
        ['Ich will Oma öfter anrufen.', 'Oma freut sich jeden Sonntag auf deinen Anruf.', 'Wem möchtest du im neuen Jahr eine Freude machen?'],
        ['Ich nehme mir nichts vor.', 'Du feierst einfach mit. Um Mitternacht wünschst du allen Glück.', 'Braucht man einen Vorsatz?']]),
      dilemma('Die Tulpen im Park', 'Im Park blühen rote Tulpen. Du möchtest Mama einen Strauß mitbringen.', [
        ['Ich pflücke ein paar Tulpen.', 'Am nächsten Tag fehlen viele Tulpen. Andere Kinder haben auch gepflückt.', 'Was wäre, wenn alle Blumen pflücken?'],
        ['Ich male Mama ein Bild von den Tulpen.', 'Mama hängt das Bild an den Kühlschrank. Die Tulpen blühen weiter.', 'Wie kann man Schönes mitnehmen, ohne es zu pflücken?'],
        ['Ich zeige Mama die Tulpen beim Spaziergang.', 'Ihr steht zusammen vor dem Beet. Eine Hummel fliegt von Blüte zu Blüte.', 'Wem gehören die Blumen im Park?']]),
      dilemma('Der Käfer', 'Im Klassenzimmer krabbelt ein Käfer über den Boden. Ein Kind will ihn zertreten.', [
        ['Ich trage ihn vorsichtig nach draußen.', 'Auf dem Fensterbrett breitet er die Flügel aus und fliegt davon.', 'Ist ein kleines Tier weniger wert als ein großes?'],
        ['Ich sage: „Lass ihn leben!“', 'Das Kind hält inne. Zusammen schaut ihr dem Käfer zu.', 'Können Tiere Angst haben?'],
        ['Ich schaue weg.', 'Der Käfer krabbelt unter einen Schrank.', 'Was kannst du für Tiere tun?']]),
      ask('Der Laternenumzug', 'Vor der Kirche sammeln sich Kinder mit Laternen. Ein Mann im roten Mantel fragt dich nach Martin und schenkt dir einen Trank.', 'fest', 'martin', { item: 'trank' }, { hp: -5 }),
      ask('Das Erntefest', 'Auf dem Dorfplatz hängt eine Erntekrone. Die Bäuerin am Gemüsestand fragt dich etwas und gibt dir einen Schild.', 'any', 'erntedank', { item: 'schild' }, { hp: -5 }),
      ask('Die Sternwarte', 'In der Sternwarte zeigt dir eine Forscherin den Mond durch ein Fernrohr. Sie stellt dir eine Frage und schenkt dir einen Schutzengel.', 'natur', 'staunen', { item: 'engel' }, { xp: 5 }),
      ask('Der Schulgarten', 'Im Schulgarten keimen die Bohnen. Der Hausmeister fragt dich, wie Pflanzen wachsen, und leiht dir seine Lupe.', 'wachsen', 'wachsen', { item: 'lupe' }, { xp: 5 }),
      rest('Die Bank am Teich', 'Am Teich steht eine Bank in der Sonne. Hier ruhst du dich aus.'),
    ],
  });

  /* ======================= Klasse 2 Musik: Der Musikraum ======================= */
  const NOTES3 = {
    instrumente: { title: 'Instrumente aus dem Musikraum', lines: ['In der Schule spielen Kinder oft Orff-Instrumente: Handtrommel, Triangel, Klanghölzer, Rassel, Schellenkranz und Glockenspiel.', 'Die Handtrommel hat ein Fell. Die Triangel ist ein Dreieck aus Metall.', 'Klanghölzer sind zwei runde Stäbe aus Holz. Man schlägt sie aneinander.', 'Rassel und Schellenkranz schüttelt man.', 'Das Glockenspiel hat Platten aus Metall. Man schlägt mit einem Schlägel darauf.', 'Weitere Instrumente: Blockflöte, Trompete, Gitarre, Geige und Klavier.'] },
    familien: { title: 'Instrumentenfamilien', lines: ['Saiteninstrumente haben Saiten: Gitarre, Geige und Kontrabass.', 'Blasinstrumente: Man bläst hinein, zum Beispiel in Blockflöte und Trompete.', 'Schlaginstrumente schlägt oder schüttelt man: Trommel, Triangel, Klanghölzer, Glockenspiel, Rassel und Schellenkranz.', 'Tasteninstrumente haben Tasten: Klavier und Orgel.', 'Im Klavier sind auch Saiten. Weil man es mit Tasten spielt, zählt es zu den Tasteninstrumenten.'] },
    spielen: { title: 'So spielt man', lines: ['Zupfen: Die Finger ziehen an der Saite und lassen sie los. So spielt man Gitarre.', 'Streichen: Ein Bogen streicht über die Saiten. So spielt man Geige.', 'Blasen: Man bläst Luft hinein. So spielt man Blockflöte und Trompete.', 'Schlagen: mit der Hand oder einem Schlägel. So spielt man Trommel, Triangel und Glockenspiel.', 'Schütteln: So spielt man Rassel und Schellenkranz.', 'Tasten drücken: So spielt man Klavier.'] },
    laut: { title: 'Laut und leise, schnell und langsam', lines: ['Musik kann laut, mittellaut oder leise sein.', 'Ein Schlaflied singt man leise und langsam.', 'Ein Marsch oder ein Gewitter in der Musik klingt laut.', 'Musik kann schnell, mäßig oder langsam sein.', 'Zu einer flinken Maus passt schnelle Musik, zu einer Schnecke langsame.'] },
    hoch: { title: 'Hohe und tiefe Töne', lines: ['Große Instrumente klingen meist tief, kleine Instrumente hoch.', 'Der Kontrabass klingt tief, die Geige hoch.', 'Eine große Trommel brummt tief, eine kleine klingt höher.', 'Beim Glockenspiel klingen lange Platten tief und kurze Platten hoch.', 'Ein Bär brummt tief, eine Maus piepst hoch.'] },
    stimmen: { title: 'Stimmen', lines: ['Die Stimme ist auch ein Instrument. Jeder hat sie immer dabei.', 'Männer haben meist die tiefsten Stimmen. Frauen- und Kinderstimmen klingen höher.', 'Singt einer allein, heißt das Solo. Singen viele zusammen, ist das ein Chor.', 'Singt die ganze Klasse zusammen, singt sie wie ein Chor.', 'Vor dem Singen: aufrecht stehen oder sitzen und ruhig atmen.'] },
  };
  const POOL3 = [
    { id: 'k2mf1', mod: 'familie', g: 'familien', q: 'Welches Instrument hat Saiten?', o: ['Die Gitarre', 'Die Trommel', 'Die Blockflöte'], a: 0 },
    { id: 'k2mf2', mod: 'familie', g: 'familien', q: 'In welches Instrument bläst man hinein?', o: ['In die Trompete', 'In die Triangel', 'In das Klavier'], a: 0 },
    { id: 'k2mf3', mod: 'familie', g: 'familien', q: 'Welches Instrument hat Tasten?', o: ['Das Klavier', 'Die Geige', 'Die Rassel'], a: 0 },
    { id: 'k2mf4', mod: 'familie', g: 'familien', q: 'Welches Instrument ist ein Schlaginstrument?', o: ['Die Handtrommel', 'Die Gitarre', 'Die Blockflöte'], a: 0 },
    { id: 'k2mf5', mod: 'familie', g: 'instrumente', q: 'Was hat die Handtrommel?', o: ['Ein Fell', 'Saiten', 'Tasten'], a: 0 },
    { id: 'k2mf6', mod: 'familie', g: 'instrumente', q: 'Woraus sind Klanghölzer?', o: ['Aus Holz', 'Aus Glas', 'Aus Papier'], a: 0 },
    { id: 'k2mf7', mod: 'familie', g: 'instrumente', q: 'Welche Form hat die Triangel?', o: ['Ein Dreieck', 'Ein Kreis', 'Ein Viereck'], a: 0 },
    { id: 'k2mf8', mod: 'familie', g: 'instrumente', q: 'Was hat ein Glockenspiel?', o: ['Platten aus Metall', 'Saiten', 'Ein Fell'], a: 0 },
    { id: 'k2ms1', mod: 'spielen', g: 'spielen', q: 'Wie spielt man Gitarre?', o: ['zupfen', 'blasen', 'schütteln'], a: 0 },
    { id: 'k2ms2', mod: 'spielen', g: 'spielen', q: 'Womit streicht man über die Saiten der Geige?', o: ['Mit dem Bogen', 'Mit dem Schlägel', 'Mit einem Löffel'], a: 0 },
    { id: 'k2ms3', mod: 'spielen', g: 'spielen', q: 'Womit schlägt man auf das Glockenspiel?', o: ['Mit dem Schlägel', 'Mit dem Bogen'], a: 0 },
    { id: 'k2ms4', mod: 'spielen', g: 'spielen', q: 'Was tust du mit der Rassel?', o: ['schütteln', 'streichen', 'zupfen'], a: 0 },
    { id: 'k2ms5', mod: 'spielen', g: 'spielen', q: 'Was braucht man, um Blockflöte zu spielen?', o: ['Luft zum Blasen', 'Einen Bogen', 'Einen Schlägel'], a: 0 },
    { id: 'k2ms6', mod: 'spielen', g: 'spielen', q: 'Wie bringt man Klanghölzer zum Klingen?', o: ['Man schlägt sie aneinander.', 'Man bläst hinein.', 'Man zupft sie.'], a: 0 },
    { id: 'k2ml1', mod: 'laut', g: 'laut', q: 'Ein Baby schläft. Wie singst du?', o: ['leise', 'laut'], a: 0 },
    { id: 'k2ml2', mod: 'laut', g: 'laut', q: 'Wie klingt ein Schlaflied meistens?', o: ['leise und langsam', 'laut und schnell'], a: 0 },
    { id: 'k2ml3', mod: 'laut', g: 'laut', q: 'In der Musik zieht ein Gewitter auf. Wie klingt sie?', o: ['laut', 'leise'], a: 0 },
    { id: 'k2ml4', mod: 'laut', g: 'laut', q: 'Welche Musik passt zu einer flinken Maus?', o: ['schnelle Musik', 'langsame Musik'], a: 0 },
    { id: 'k2ml5', mod: 'laut', g: 'laut', q: 'Welche Musik passt zu einer Schnecke?', o: ['langsame Musik', 'schnelle Musik'], a: 0 },
    { id: 'k2ml6', mod: 'laut', g: 'laut', q: 'Welche Musik passt zu einem stampfenden Elefanten?', o: ['laut und langsam', 'leise und schnell'], a: 0 },
    { id: 'k2ml7', mod: 'laut', g: 'laut', q: 'Musik ist nicht laut und nicht leise. Wie heißt das?', o: ['mittellaut', 'sehr laut', 'sehr leise'], a: 0 },
    { id: 'k2ml8', mod: 'laut', g: 'laut', q: 'Musik ist nicht schnell und nicht langsam. Wie heißt das?', o: ['mäßig', 'sehr schnell', 'sehr langsam'], a: 0 },
    { id: 'k2ml9', mod: 'laut', g: 'laut', q: 'Zu welcher Musik marschiert man?', o: ['Zu lauter, fester Musik', 'Zu einem leisen Schlaflied'], a: 0 },
    { id: 'k2ml10', mod: 'laut', g: 'laut', q: 'Welche Musik passt zu einem Vogel, der davonflattert?', o: ['schnelle Musik', 'langsame Musik'], a: 0 },
    { id: 'k2mh1', mod: 'hoch', g: 'hoch', q: 'Welches Tier brummt tief?', o: ['Der Bär', 'Die Maus', 'Das Küken'], a: 0 },
    { id: 'k2mh2', mod: 'hoch', g: 'hoch', q: 'Welches Tier piepst hoch?', o: ['Die Maus', 'Der Bär', 'Die Kuh'], a: 0 },
    { id: 'k2mh3', mod: 'hoch', g: 'hoch', q: 'Was klingt tiefer: Geige oder Kontrabass?', o: ['Der Kontrabass', 'Die Geige'], a: 0 },
    { id: 'k2mh4', mod: 'hoch', g: 'hoch', q: 'Wie klingen große Instrumente meistens?', o: ['tief', 'hoch'], a: 0 },
    { id: 'k2mh5', mod: 'hoch', g: 'hoch', q: 'Welche Platte am Glockenspiel klingt höher?', o: ['Die kurze Platte', 'Die lange Platte'], a: 0 },
    { id: 'k2mh6', mod: 'hoch', g: 'hoch', q: 'Welche Trommel klingt tiefer?', o: ['Die große Trommel', 'Die kleine Trommel'], a: 0 },
    { id: 'k2mv1', mod: 'stimme', g: 'stimmen', q: 'Wer singt meist am tiefsten?', o: ['Ein Mann', 'Eine Frau', 'Ein Kind'], a: 0 },
    { id: 'k2mv2', mod: 'stimme', g: 'stimmen', q: 'Wer hat meist die höhere Stimme?', o: ['Ein Kind', 'Ein Mann'], a: 0 },
    { id: 'k2mv3', mod: 'stimme', g: 'stimmen', q: 'Ein Kind singt ganz allein. Wie heißt das?', o: ['Solo', 'Chor'], a: 0 },
    { id: 'k2mv4', mod: 'stimme', g: 'stimmen', q: 'Viele Menschen singen zusammen. Wie heißt das?', o: ['Chor', 'Solo'], a: 0 },
    { id: 'k2mv5', mod: 'stimme', g: 'stimmen', q: 'Die ganze Klasse singt zusammen. Ist das ein Solo?', o: ['Nein, das ist ein Chor.', 'Ja, das ist ein Solo.'], a: 0 },
    { id: 'k2mv6', mod: 'stimme', g: 'stimmen', q: 'Singt eine Frau höher als ein Mann?', o: ['Ja, meistens', 'Nein, nie'], a: 0 },
    { id: 'k2mv7', mod: 'stimme', g: 'stimmen', q: 'Wie stehst du beim Singen?', o: ['Aufrecht und locker', 'Krumm und gebückt'], a: 0 },
    { id: 'k2mv8', mod: 'stimme', g: 'stimmen', q: 'Welches Instrument hat jeder Mensch immer dabei?', o: ['Die Stimme', 'Die Trompete', 'Das Klavier'], a: 0 },
    { id: 'k2mv9', mod: 'stimme', g: 'stimmen', q: 'Wie atmest du vor dem Singen?', o: ['Ruhig und tief', 'Ganz schnell', 'Gar nicht'], a: 0 },
  ];
  function gen3(mod, tier, know, seq, opts) {
    if (wantsPool(POOL3, mod, opts)) return null;
    const r = Math.random(); const i = pick(INSTR);
    const look = { pic: pic(i.svg, 'Bild eines Instruments'), instr: i.id };
    if (mod === 'bild') {
      if (r < 0.5) return choice('bild', 'instrumente', 'Wie heißt das Instrument auf dem Bild?', i.name, some(INSTR.filter((x) => x !== i), 2).map((x) => x.name), 'k2mb_' + i.id, look);
      const others = some(INSTR.filter((x) => x !== i), 2); const opt = (x) => optPic(x.svg, 'Instrument');
      return choice('bild', 'instrumente', `Tippe auf ${i.acc}.`, opt(i), others.map(opt), 'k2mt_' + i.id, { svgOpts: true, why: `So sieht ${i.acc} aus:`, instrs: [i.id].concat(others.map((x) => x.id)) });
    }
    if (mod === 'familie' && r < 0.7) return choice('familie', 'familien', 'Zu welcher Familie gehört dieses Instrument?', FAM[i.fam], some(Object.keys(FAM).filter((f) => f !== i.fam && !(i.notFam || []).includes(f)), 2).map((f) => FAM[f]), 'k2mfb_' + i.id, look);
    if (mod === 'spielen' && r < 0.7) return choice('spielen', 'spielen', 'Wie spielt man dieses Instrument?', i.how, some(HOWS.filter((h) => h !== i.how && !(i.notHow || []).includes(h)), 2), 'k2msb_' + i.id, look);
    if (mod === 'hoch' && r < 0.6) {
      const p = pick(PAIRS), low = Math.random() < 0.5; const opt = (inner) => optPic(inner, 'Instrument');
      const sizes = shuffle([1, 2]);
      return { kind: 'choice', mod: 'hoch', tier: 1, group: 'hoch:1', note: 'hoch', q: `${p.q} klingt ${low ? 'tiefer' : 'höher'}?`, options: sizes.map((s) => opt(s === 2 ? p.big : p.small)), answer: opt(low ? p.big : p.small), sizes, svgOpts: true, why: low ? 'Das größere klingt tiefer:' : 'Das kleinere klingt höher:', qid: `k2mp_${p.id}_${low ? 't' : 'h'}`, cols: 2 };
    }
    return null;
  }
  K.MODES.instrumente2 = unit('musik', [{ name: 'Instrumentenschrank', mod: 'bild' }, { name: 'Trommelwirbel', mod: 'spielen' }, { name: 'Glockenspiel', mod: 'hoch' }, { name: 'Paukenschlag', mod: 'laut' }], {
    grade: 2, subject: 'Musik', title: 'Der Musikraum', icon: '🥁', sub: 'Welches Instrument ist das? Wie spielt man es? Laut und leise, hoch und tief, Stimmen',
    modules: {
      bild: { name: 'Welches Instrument?', icon: '🎻', maxTier: 1, worldCap: [1], dmg: 12 },
      familie: { name: 'Instrumentenfamilien', icon: '🎹', maxTier: 1, worldCap: [1], dmg: 12 },
      spielen: { name: 'So spielt man', icon: '🥁', maxTier: 1, worldCap: [1], dmg: 12 },
      laut: { name: 'Laut und leise', icon: '🔊', maxTier: 1, worldCap: [1], dmg: 10 },
      hoch: { name: 'Hoch und tief', icon: '🎵', maxTier: 1, worldCap: [1], dmg: 12 },
      stimme: { name: 'Stimmen', icon: '👥', maxTier: 1, worldCap: [1], dmg: 10 },
    },
    extra: { bild: 'Musikkoffer', familie: 'Stimmgabel', spielen: 'Klanghölzer', laut: 'Becken', hoch: 'Kontrabass', stimme: 'Kanon' },
    tut: {
      'bild:1': { title: 'Welches Instrument?', steps: ['Schau dir das Bild genau an.', 'Hat es Saiten, Tasten, ein Fell oder Löcher für die Finger? Ist es aus Holz oder aus Metall?', 'Tippe auf den richtigen Namen oder das richtige Bild.'] },
      'familie:1': { title: 'Instrumentenfamilien', steps: ['Saiteninstrumente haben Saiten. In Blasinstrumente bläst man hinein.', 'Schlaginstrumente schlägt oder schüttelt man. Tasteninstrumente haben Tasten.', 'Tippe auf die richtige Antwort.'] },
      'spielen:1': { title: 'So spielt man', steps: ['Überlege: Was muss man tun, damit das Instrument klingt?', 'Gitarre: zupfen. Geige: streichen. Flöte und Trompete: blasen.', 'Trommel und Triangel: schlagen. Rassel: schütteln. Klavier: Tasten drücken.', 'Tippe auf die richtige Antwort.'] },
      'laut:1': { title: 'Laut und leise', steps: ['Stell dir die Musik vor: Wer oder was kommt darin vor?', 'Ein schlafendes Baby braucht leise Musik, ein Gewitter klingt laut.', 'Eine Maus huscht schnell, eine Schnecke kriecht langsam.', 'Tippe auf die passende Antwort.'] },
      'hoch:1': { title: 'Hoch und tief', steps: ['Große Instrumente klingen tief, kleine Instrumente hoch.', 'Bei zwei Bildern vergleichst du die Größe: Das größere klingt tiefer.', 'Beim Glockenspiel klingt die lange Platte tief, die kurze hoch.', 'Tippe auf die richtige Antwort.'] },
      'stimme:1': { title: 'Stimmen', steps: ['Männerstimmen sind meist tief, Frauen- und Kinderstimmen höher.', 'Einer singt allein: Solo. Viele singen zusammen: Chor.', 'Tippe auf die richtige Antwort.'] },
    },
    notes: NOTES3, pool: POOL3, gen: gen3,
    events: [
      ask('Der Instrumentenschrank', 'Im Musikraum steht ein Schrank voller Instrumente. Die Musiklehrerin hält eins hoch und schenkt dir einen Trank, wenn du es erkennst.', 'bild', undefined, { item: 'trank' }, { hp: -5 }),
      ask('Die Musikschule', 'In der Musikschule übt eine Gitarrengruppe. Der Lehrer fragt dich, wie man Instrumente spielt, und gibt dir einen Schild.', 'spielen', 'spielen', { item: 'schild' }, { hp: -5 }),
      ask('Der Kinderchor', 'Vor der Kirche singt ein Kinderchor. Die Chorleiterin stellt dir eine Frage und schenkt dir einen Schutzengel.', 'stimme', 'stimmen', { item: 'engel' }, { xp: 5 }),
      { title: 'Das Schulkonzert', text: 'Beim Schulkonzert ist die Aula voll. Ein Junge aus der vierten Klasse fragt dich, wie die Musik klingen soll.', opts: [{ label: 'Antworten', task: 'laut', g: 'laut', win: { xp: 20 }, lose: { xp: 5 } }, { label: 'Zuhören (+5 LP)', effect: { hp: 5 } }] },
      dilemma('Die Blockflöte', 'Dein Bruder übt Blockflöte. Du möchtest in Ruhe lesen.', [
        ['Ich bitte ihn, später zu üben.', 'Er übt nach dem Abendessen. Du liest dein Kapitel zu Ende.', 'Wie findet man eine Zeit, die für beide passt?'],
        ['Ich setze mich dazu und höre zu.', 'Nach drei Versuchen klingt das Lied schon sicherer. Er spielt es dir vor.', 'Wie lernt man ein Instrument?'],
        ['Ich gehe in ein anderes Zimmer.', 'Durch die Tür hörst du die Flöte nur noch leise.', 'Warum klingt Musik hinter einer Tür leiser?']]),
      rest('Das Treppenhaus', 'Auf der Treppe vor dem Musikraum ist es still. Du setzt dich hin und ruhst dich aus.'),
    ],
  });


  /* ======================= Klasse 1 Musik: Die Klangkiste ======================= */
  const SKIN1 = '#FFD9A8', BEAR = '#A8683A', MOUSE = '#B8BFD0', HARE = '#D8C3A5', SKY = '#3A4A7A', LINE = '#2478D6';
  const cloud = (fill) => sh('M24 60 Q8 60 9 47 Q10 35 23 35 Q25 19 42 19 Q53 8 67 18 Q84 15 87 33 Q97 40 92 52 Q89 60 78 60 Z', fill) + lit('M17 43 Q20 38 26 38 M44 25 Q52 18 60 22', 2.5);
  const drop = (x, y) => sh(`M${x} ${y - 9} Q${x + 7} ${y + 1} ${x} ${y + 5} Q${x - 7} ${y + 1} ${x} ${y - 9} Z`, BLUE, 2);
  // hand seen from the palm side, fingers up, wrist at 0 0
  const hand = oval(-12.5, -15, 4.5, 10, SKIN1, 2.2, -30) + [[-8.6, 15], [-2.9, 18], [2.8, 17], [8.4, 13]].map(([x, h]) => rect(x - 2.8, -20 - h, 5.6, h + 6, SKIN1, 2.8, 2.2)).join('') + rect(-11.5, -24, 23, 24, SKIN1, 7, 2.2);
  const at = (x, y, rot, s, inner) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${inner}</g>`;
  const left = `<g transform="scale(-1 1)">${hand}</g>`;
  // Gegensätze: two pictures per pair, the answer is always one of the two
  const OPP = [
    { id: 'gewitter', dim: 'laut', word: 'laut', tap: 'Was klingt laut?', why: 'Das klingt laut:', svg: cloud('#7A86A8') + sh('M54 50 L41 76 L51 76 L44 97 L67 66 L56 66 L63 50 Z', GOLD, 2.2) + ln('M22 68 L18 78 M28 82 L24 92 M80 68 L76 78 M86 82 L82 92', 3, LINE) },
    { id: 'pst', dim: 'laut', word: 'leise', tap: 'Was klingt leise?', why: 'Das klingt leise:', svg: `<g transform="translate(5 0) scale(.9)">${HEAD(SKIN)}${DOTS}${ln('M30 44 Q37 41 44 44', 2.5)}${ln('M56 44 Q63 41 70 44', 2.5)}${oval(50, 74, 4.5, 3.5, '#B8323F', 1.8)}</g>`
      + rect(46, 54, 8, 28, SKIN1, 4, 2.2) + oval(50, 88, 13, 9, SKIN1, 2.2) + ln('M40 84 Q44 88 41 93 M60 84 Q56 88 59 93', 1.5) },
    { id: 'hase', dim: 'tempo', word: 'schnell', tap: 'Wer ist schnell?', why: 'Der Hase ist schnell:', svg: ln('M2 46 H18 M6 58 H20 M2 70 H16', 3, '#9AA3B8')
      + oval(30, 74, 15, 5, HARE, 2.5, -18) + oval(64, 22, 5, 16, HARE, 2.5, -40) + oval(64, 22, 2, 10, '#FFB3C7', 0, -40) + oval(52, 60, 27, 16, HARE, 2.5, -8) + circ(25, 54, 7, WHITE)
      + oval(78, 72, 12, 4.5, HARE, 2.5, 25) + oval(74, 20, 5, 16, HARE, 2.5, -20) + oval(74, 20, 2, 10, '#FFB3C7', 0, -20) + circ(78, 42, 13, HARE) + circ(83, 39, 2.6, INK, 0) + circ(91, 45, 2.2, '#FF8AA8', 1.2) + gloss(46, 52, 8, 4, -8) + ln('M86 50 l8 2 M86 48 l8 -2', 1) },
    { id: 'schnecke', dim: 'tempo', word: 'langsam', tap: 'Wer ist langsam?', why: 'Die Schnecke ist langsam:', svg: ln('M4 84 H96', 2.5, '#9AA3B8')
      + sh('M10 82 Q10 72 22 72 H74 Q76 58 84 56 Q92 56 92 66 V78 Q92 82 86 82 Z', '#C9E265') + ln('M82 58 L76 40 M88 58 L90 40', 2.5) + circ(76, 39, 3.5, INK, 0) + circ(90, 39, 3.5, INK, 0) + ln('M84 70 Q87 72 90 70', 1.8)
      + circ(46, 50, 25, '#F2B05E', 3) + ln('M46 50 m0 -5 a5 5 0 1 1 -5 5 a10 10 0 1 1 10 10 a16 16 0 1 1 -16 -16', 2.5, '#B8862E') + gloss(36, 36, 5, 3, -30) },
    { id: 'maus', dim: 'hoch', word: 'hoch', tap: 'Wer hat eine hohe Stimme?', why: 'Die Maus piepst hoch:', svg: ln('M24 80 Q6 78 8 64 Q10 54 18 56', 2.5, '#E58FA8')
      + oval(46, 70, 24, 16, MOUSE) + oval(36, 86, 6, 3, '#FFB3C7', 1.8) + oval(56, 86, 6, 3, '#FFB3C7', 1.8) + circ(64, 44, 10, MOUSE) + circ(64, 44, 6, '#FFB3C7', 1.5)
      + sh('M60 62 Q60 46 74 46 Q86 48 92 60 Q84 68 72 68 Q62 68 60 62 Z', MOUSE) + circ(76, 54, 2.5, INK, 0) + circ(92, 60, 2.5, '#FF8AA8', 1.5) + ln('M86 62 L98 58 M86 64 L98 66', 1) + gloss(40, 62, 8, 4, -10) },
    { id: 'baer', dim: 'hoch', word: 'tief', tap: 'Wer hat eine tiefe Stimme?', why: 'Der Bär brummt tief:', svg: circ(24, 24, 11, BEAR) + circ(24, 24, 6, '#E8C094', 1.5) + circ(76, 24, 11, BEAR) + circ(76, 24, 6, '#E8C094', 1.5)
      + circ(50, 56, 38, BEAR, 3) + oval(50, 72, 17, 13, '#E8C094') + oval(50, 64, 6.5, 4.5, INK, 0) + circ(36, 48, 4, INK, 0) + circ(64, 48, 4, INK, 0) + sh('M43 75 Q50 84 57 75 Z', '#B8323F', 2) + gloss(34, 32, 8, 4, -30) },
  ];
  const OPP_Q = { laut: 'Klingt das laut oder leise?', tempo: 'Ist dieses Tier schnell oder langsam?', hoch: 'Hat dieses Tier eine hohe oder tiefe Stimme?' };
  // Musik und Gefühle: calm and sad, cheerful and wild never stand side by side, so exactly one picture fits
  const MOODS = [
    { id: 'sonne', music: 'fröhliche Musik', not: ['wind'], qs: ['Ein Lied klingt fröhlich und hell. Welches Bild passt?', 'Die Musik klingt lustig, alle lachen. Welches Bild passt?'],
      svg: sh(Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, p = (r, d) => `${(50 + r * Math.cos(a + d)).toFixed(1)} ${(50 + r * Math.sin(a + d)).toFixed(1)}`; return `M${p(30, -0.2)} L${p(47, 0)} L${p(30, 0.2)} Z`; }).join(' '), '#FFB347', 2)
        + circ(50, 50, 30, GOLD, 3) + ln('M36 44 Q40 38 44 44', 2.5) + ln('M56 44 Q60 38 64 44', 2.5) + sh('M36 56 Q50 74 64 56 Z', '#B8323F') + '<circle cx="31" cy="56" r="4.5" fill="#FF8A8A" opacity=".5"/><circle cx="69" cy="56" r="4.5" fill="#FF8A8A" opacity=".5"/>' + gloss(38, 32, 6, 3.5, -30) },
    { id: 'regen', music: 'traurige Musik', not: ['mond'], qs: ['Ein Lied klingt traurig und langsam. Welches Bild passt?', 'Die Musik klingt, als ob jemand weint. Welches Bild passt?'],
      svg: cloud('#B7C3DD') + circ(41, 42, 3, INK, 0) + circ(61, 42, 3, INK, 0) + ln('M33 36 L44 32 M58 32 L69 36', 2.5) + ln('M42 54 Q51 47 60 54', 3) + drop(26, 74) + drop(50, 84) + drop(74, 74) },
    { id: 'mond', music: 'ruhige Musik', not: ['regen'], qs: ['Ein Lied klingt ruhig und leise. Welches Bild passt?', 'Die Musik ist ein leises Schlaflied. Welches Bild passt?'],
      svg: rect(3, 3, 94, 94, SKY, 14) + sh('M60 16 A34 34 0 1 0 60 84 A42 42 0 0 1 60 16 Z', GOLD) + ln('M31 46 Q35 50 39 46', 2.5) + ln('M33 62 Q37 65 41 61', 2.2) + sh(star(78, 26, 8, 3.4), GOLD, 1.5) + sh(star(84, 60, 5.5, 2.4), GOLD, 1.5) + sh(star(68, 84, 4.5, 2), GOLD, 1.2) + lit('M44 24 Q36 30 33 38', 2) },
    { id: 'wind', music: 'wilde Musik', not: ['sonne'], qs: ['Die Musik klingt wild und laut. Welches Bild passt?', 'Die Musik braust und stürmt. Welches Bild passt?'],
      svg: sh('M12 54 Q2 44 12 34 Q12 18 30 20 Q40 8 54 18 Q68 18 66 34 Q76 44 66 56 Q60 68 44 64 Q30 72 22 62 Q12 64 12 54 Z', '#C9D6EE') + ln('M24 34 L31 38 L24 42 M48 34 L41 38 L48 42', 2.5) + '<circle cx="24" cy="50" r="6" fill="#FF8A8A" opacity=".5"/><circle cx="50" cy="50" r="6" fill="#FF8A8A" opacity=".5"/>' + oval(62, 46, 5, 6, '#B8323F', 2.2)
        + ln('M70 38 Q82 30 96 36 M72 47 Q84 47 98 43 M70 56 Q82 64 94 56', 3.5, LINE) + oval(86, 18, 6, 3.5, GREEN, 2, -30) + oval(84, 80, 6, 3.5, '#FF8A3D', 2, 30) + oval(94, 66, 5, 3, GREEN, 2, 50) + lit('M18 30 Q22 24 30 24', 2.5) },
  ];
  const moodFits = (a, b) => a.id !== b.id && !a.not.includes(b.id) && !b.not.includes(a.id);
  const BODY = [
    { id: 'klatschen', noun: 'Klatschen', svg: at(32, 92, 16, 1.55, hand) + at(68, 92, -16, 1.55, left) + ln('M50 14 V4 M38 18 L31 9 M62 18 L69 9', 3, '#FF8A3D') },
    { id: 'stampfen', noun: 'Stampfen', svg: ln('M30 8 V24 M70 8 V24', 2.5, '#9AA3B8') + rect(38, -2, 24, 52, '#5B6CFF', 3) + lit('M43 4 V44', 2)
      + sh('M34 48 H64 V56 Q82 56 86 66 Q88 74 80 74 H32 Q26 74 26 66 V54 Q26 48 34 48 Z', RED) + rect(24, 72, 64, 7, EBONY, 3, 2) + ln('M4 84 H96', 3)
      + ln('M16 78 L6 70 M20 72 L16 62 M92 76 L98 68 M90 68 L92 60', 2.5, '#FF8A3D') },
    { id: 'schnipsen', noun: 'Schnipsen', svg: rect(36, 80, 30, 20, BLUE, 3) + lit('M41 84 V96', 2)
      + tube('M60 52 L78 24', 9, SKIN1) + oval(68, 60, 7, 5, SKIN1, 2.2) + oval(68, 71, 7, 5, SKIN1, 2.2)
      + tube('M42 66 Q26 58 28 40', 11, SKIN1) + tube('M52 56 Q52 28 32 36', 9, SKIN1) + rect(34, 48, 34, 36, SKIN1, 12, 2.2) + ln('M22 32 L13 26 M28 26 L24 15 M20 42 L9 43', 3, '#FF8A3D') },
    { id: 'patschen', noun: 'Patschen', svg: rect(10, 6, 36, 100, '#5B6CFF', 16) + rect(54, 6, 36, 100, '#5B6CFF', 16) + lit('M16 20 V90 M60 20 V90', 2)
      + at(28, 34, 180, 1.15, hand) + at(72, 34, 180, 1.15, left) + ln('M14 14 Q28 4 42 14 M58 14 Q72 4 86 14', 2.5, '#FF8A3D') },
  ];
  BODY.forEach((b) => { b.word = b.noun.toLowerCase(); });
  // eigene Zeichen: long line = long tone, dots = short tones, big = loud, small = quiet; read from left to right
  const dash = (x1, x2, w) => tube(`M${x1} 50 H${x2}`, w || 6, BLUE);
  const SIGNS = [
    { id: 'lang', dim: 'len', mean: 'ein langer Ton', tap: 'Welches Zeichen passt zu einem langen Ton?', why: 'Ein langer Strich ist ein langer Ton:', svg: dash(12, 88) },
    { id: 'kurz', dim: 'len', mean: 'kurze Töne', tap: 'Welches Zeichen passt zu kurzen Tönen?', why: 'Punkte sind kurze Töne:', svg: [20, 40, 60, 80].map((x) => circ(x, 50, 6.5, BLUE)).join('') },
    { id: 'laut', dim: 'vol', mean: 'laut', tap: 'Welches Zeichen passt zu einem lauten Ton?', why: 'Ein großes Zeichen ist laut:', svg: sh(star(50, 54, 44, 19), GOLD) + gloss(40, 40, 4, 7, 30) },
    { id: 'leise', dim: 'vol', mean: 'leise', tap: 'Welches Zeichen passt zu einem leisen Ton?', why: 'Ein kleines Zeichen ist leise:', svg: sh(star(50, 54, 13, 5.6), GOLD, 2) },
  ];
  // lang-kurz-Muster: the three orders of the same signs, exactly one matches the words
  const PATS = ['LKK', 'KLK', 'KKL', 'KLL', 'LKL', 'LLK'].map((id) => ({ id, svg: [...id].map((c, i) => { const x = 16 + i * 34; return c === 'L' ? dash(x - 8, x + 8, 7) : circ(x, 50, 7.5, BLUE); }).join('') }));
  const patWords = (id) => [...id].map((c, i) => (c === 'L' ? (i ? 'lang' : 'Lang') : (i ? 'kurz' : 'Kurz'))).join(', ');
  const ORFF = ['trommel', 'triangel', 'klanghoelzer', 'rassel', 'schellenkranz', 'glockenspiel'].map((id) => INSTR.find((i) => i.id === id));
  const SPIEL1 = ORFF.concat(INSTR.filter((i) => i.id === 'gitarre'));
  // a way of playing is only offered as wrong if it is neither the instrument's own nor also possible (notHow)
  const wrongHow = (i, h) => h !== i.how && !(i.notHow || []).includes(h);
  const NOTES4 = {
    instrumente: { title: 'Instrumente aus der Klangkiste', lines: ['Die Triangel ist ein Dreieck aus Metall.', 'Die Handtrommel hat ein Fell.', 'Klanghölzer sind zwei runde Stäbe aus Holz.', 'In der Rassel sind kleine Körner.', 'Der Schellenkranz ist ein Ring mit kleinen Schellen.', 'Das Glockenspiel hat bunte Platten aus Metall.'] },
    spielen: { title: 'So spielt man', lines: ['Schlagen: Handtrommel, Triangel, Klanghölzer und Glockenspiel.', 'Zum Schlagen nimmst du die Hand oder einen Schlägel.', 'Schütteln: Rassel und Schellenkranz.', 'Zupfen: Die Finger ziehen an den Saiten der Gitarre.'] },
    gegensatz: { title: 'Laut und leise, schnell und langsam, hoch und tief', lines: ['Ein Gewitter ist laut. Flüstern ist leise.', 'Ein Hase rennt schnell. Eine Schnecke kriecht langsam.', 'Eine Maus piepst hoch. Ein Bär brummt tief.', 'Auch Musik kann laut oder leise, schnell oder langsam, hoch oder tief sein.'] },
    gefuehle: { title: 'Gefühle in der Musik', lines: ['Musik kann fröhlich klingen, zum Beispiel ein Geburtstagslied.', 'Traurige Musik ist oft langsam.', 'Ein Schlaflied klingt ruhig und leise.', 'Wilde Musik ist laut und schnell. Dazu passt ein Sturm.', 'Jeder darf Musik anders fühlen.'] },
    koerper: { title: 'Körperinstrumente', lines: ['Dein Körper ist auch ein Instrument.', 'Klatschen: Die Hände schlagen aneinander.', 'Stampfen: Die Füße treten fest auf den Boden.', 'Schnipsen: Der Mittelfinger rutscht am Daumen ab und knackt.', 'Patschen: Die Hände klopfen auf die Oberschenkel.'] },
    zeichen: { title: 'Zeichen für Klänge', lines: ['Klänge kann man aufmalen.', 'Ein langer Strich ist ein langer Ton.', 'Punkte sind kurze Töne.', 'Ein großes Zeichen ist laut, ein kleines Zeichen leise.', 'Die Zeichen liest du von links nach rechts.'] },
  };
  const POOL4 = [
    { id: 'k1mi1', mod: 'instr', g: 'instrumente', q: 'Welches Instrument ist ein Dreieck aus Metall?', o: ['Die Triangel', 'Die Rassel', 'Die Handtrommel'], a: 0 },
    { id: 'k1mi2', mod: 'instr', g: 'instrumente', q: 'Welches Instrument hat ein Fell?', o: ['Die Handtrommel', 'Die Triangel', 'Die Klanghölzer'], a: 0 },
    { id: 'k1mi3', mod: 'instr', g: 'instrumente', q: 'Welches Instrument hat bunte Platten aus Metall?', o: ['Das Glockenspiel', 'Die Rassel', 'Die Handtrommel'], a: 0 },
    { id: 'k1mi4', mod: 'instr', g: 'instrumente', q: 'Was sind zwei runde Stäbe aus Holz?', o: ['Klanghölzer', 'Eine Triangel', 'Eine Rassel'], a: 0 },
    { id: 'k1mi5', mod: 'instr', g: 'instrumente', q: 'Welches Instrument ist ein Ring mit kleinen Schellen?', o: ['Der Schellenkranz', 'Das Glockenspiel', 'Die Triangel'], a: 0 },
    { id: 'k1ms1', mod: 'spielen', g: 'spielen', q: 'Was tust du mit der Rassel?', o: ['schütteln', 'zupfen'], a: 0 },
    { id: 'k1ms2', mod: 'spielen', g: 'spielen', q: 'Was tust du mit den Saiten der Gitarre?', o: ['zupfen', 'schütteln'], a: 0 },
    { id: 'k1ms3', mod: 'spielen', g: 'spielen', q: 'Womit schlägst du auf das Glockenspiel?', o: ['Mit einem Schlägel', 'Mit einer Feder'], a: 0 },
    { id: 'k1ms4', mod: 'spielen', g: 'spielen', q: 'Wie bringst du Klanghölzer zum Klingen?', o: ['Ich schlage sie aneinander.', 'Ich zupfe sie.'], a: 0 },
    { id: 'k1ms5', mod: 'spielen', g: 'spielen', q: 'Womit schlägst du auf die Handtrommel?', o: ['Mit der Hand', 'Mit dem Fuß'], a: 0 },
    { id: 'k1mg1', mod: 'gegen', g: 'gegensatz', q: 'Dein kleiner Bruder schläft. Wie singst du?', o: ['leise', 'laut'], a: 0 },
    { id: 'k1mg2', mod: 'gegen', g: 'gegensatz', q: 'Welche Musik passt zu einer Schnecke?', o: ['langsame Musik', 'schnelle Musik'], a: 0 },
    { id: 'k1mg3', mod: 'gegen', g: 'gegensatz', q: 'Welche Musik passt zu einem rennenden Hasen?', o: ['schnelle Musik', 'langsame Musik'], a: 0 },
    { id: 'k1mg4', mod: 'gegen', g: 'gegensatz', q: 'Ein Bär brummt. Klingt das hoch oder tief?', o: ['tief', 'hoch'], a: 0 },
    { id: 'k1mg5', mod: 'gegen', g: 'gegensatz', q: 'Was ist das Gegenteil von laut?', o: ['leise', 'schnell'], a: 0 },
    { id: 'k1mg6', mod: 'gegen', g: 'gegensatz', q: 'Was ist das Gegenteil von schnell?', o: ['langsam', 'tief'], a: 0 },
    { id: 'k1mf1', mod: 'gefuehl', g: 'gefuehle', q: 'Welche Musik passt zu einem Geburtstag?', o: ['fröhliche Musik', 'traurige Musik'], a: 0 },
    { id: 'k1mf2', mod: 'gefuehl', g: 'gefuehle', q: 'Welche Musik passt zum Einschlafen?', o: ['ruhige Musik', 'wilde Musik'], a: 0 },
    { id: 'k1mf3', mod: 'gefuehl', g: 'gefuehle', q: 'Wie klingt ein Schlaflied?', o: ['ruhig und leise', 'wild und laut'], a: 0 },
    { id: 'k1mf4', mod: 'gefuehl', g: 'gefuehle', q: 'Zu welcher Musik tanzt du wild herum?', o: ['Zu lauter, schneller Musik', 'Zu einem Schlaflied'], a: 0 },
    { id: 'k1mf5', mod: 'gefuehl', g: 'gefuehle', q: 'Zwei Kinder hören dasselbe Lied. Fühlen beide immer gleich?', o: ['Nicht immer', 'Ja, immer'], a: 0 },
    { id: 'k1mk1', mod: 'koerper', g: 'koerper', q: 'Womit klatschst du?', o: ['Mit den Händen', 'Mit den Füßen'], a: 0 },
    { id: 'k1mk2', mod: 'koerper', g: 'koerper', q: 'Womit stampfst du?', o: ['Mit den Füßen', 'Mit den Händen'], a: 0 },
    { id: 'k1mk3', mod: 'koerper', g: 'koerper', q: 'Womit schnipst du?', o: ['Mit den Fingern', 'Mit den Füßen'], a: 0 },
    { id: 'k1mk4', mod: 'koerper', g: 'koerper', q: 'Du klopfst mit den Händen auf deine Beine. Wie heißt das?', o: ['patschen', 'stampfen', 'schnipsen'], a: 0 },
    { id: 'k1mk5', mod: 'koerper', g: 'koerper', q: 'Welches Instrument hast du immer dabei?', o: ['Deinen Körper', 'Eine Trommel', 'Eine Triangel'], a: 0 },
    { id: 'k1mk6', mod: 'koerper', g: 'koerper', q: 'Was klingt leiser: schnipsen oder stampfen?', o: ['schnipsen', 'stampfen'], a: 0 },
    { id: 'k1mz1', mod: 'zeichen', g: 'zeichen', q: 'Was bedeutet ein langer Strich?', o: ['ein langer Ton', 'kurze Töne'], a: 0 },
    { id: 'k1mz2', mod: 'zeichen', g: 'zeichen', q: 'Was bedeuten viele Punkte?', o: ['kurze Töne', 'ein langer Ton'], a: 0 },
    { id: 'k1mz3', mod: 'zeichen', g: 'zeichen', q: 'Was bedeutet ein großes Zeichen?', o: ['laut', 'leise'], a: 0 },
    { id: 'k1mz4', mod: 'zeichen', g: 'zeichen', q: 'Was bedeutet ein kleines Zeichen?', o: ['leise', 'laut'], a: 0 },
    { id: 'k1mz5', mod: 'zeichen', g: 'zeichen', q: 'In welche Richtung liest du die Zeichen?', o: ['von links nach rechts', 'von rechts nach links'], a: 0 },
  ];
  function gen4(mod, tier, know, seq, opts) {
    if (wantsPool(POOL4, mod, opts) || Math.random() < 0.25) return null;
    const r = Math.random(); const opt = (x) => optPic(x.svg, 'Bild');
    if (mod === 'instr') {
      const i = pick(ORFF), others = some(ORFF.filter((x) => x !== i), 2);
      if (r < 0.5) return choice('instr', 'instrumente', 'Wie heißt das Instrument?', i.name, others.map((x) => x.name), 'k1mb_' + i.id, { pic: pic(i.svg, 'Bild eines Instruments'), instr: i.id });
      return choice('instr', 'instrumente', `Tippe auf ${i.acc}.`, opt(i), others.map(opt), 'k1mt_' + i.id, { svgOpts: true, why: `So sieht ${i.acc} aus:`, instrs: [i.id].concat(others.map((x) => x.id)) });
    }
    if (mod === 'spielen') {
      if (r < 0.6) { const i = pick(SPIEL1); return choice('spielen', 'spielen', 'Wie spielt man dieses Instrument?', i.how, ['schlagen', 'schütteln', 'zupfen'].filter((h) => wrongHow(i, h)), 'k1ms_' + i.id, { pic: pic(i.svg, 'Bild eines Instruments'), instr: i.id }); }
      const h = pick(['schütteln', 'zupfen']), i = pick(SPIEL1.filter((x) => x.how === h)), others = some(SPIEL1.filter((x) => wrongHow(x, h)), 2), verb = h === 'zupfen' ? 'zupft' : 'schüttelt';
      return choice('spielen', 'spielen', `Welches Instrument ${verb} man?`, opt(i), others.map(opt), 'k1mst_' + i.id, { svgOpts: true, why: `Das ${verb} man:`, how: h, instrs: [i.id].concat(others.map((x) => x.id)) });
    }
    if (mod === 'gegen') {
      const x = pick(OPP), y = OPP.find((o) => o.dim === x.dim && o !== x);
      if (r < 0.5) return choice('gegen', 'gegensatz', x.tap, opt(x), [opt(y)], 'k1mgt_' + x.id, { svgOpts: true, why: x.why, opps: [x.id, y.id] });
      return choice('gegen', 'gegensatz', OPP_Q[x.dim], x.word, [y.word], 'k1mgb_' + x.id, { pic: pic(x.svg, 'Bild'), opp: x.id });
    }
    if (mod === 'gefuehl') {
      const m = pick(MOODS), others = MOODS.filter((o) => moodFits(m, o));
      if (r < 0.6) { const k = pick([0, 1]); return choice('gefuehl', 'gefuehle', m.qs[k], opt(m), others.map(opt), `k1mf${k}_${m.id}`, { svgOpts: true, why: 'Dieses Bild passt:', moods: [m.id].concat(others.map((o) => o.id)) }); }
      return choice('gefuehl', 'gefuehle', 'Welche Musik passt zu diesem Bild?', m.music, others.map((o) => o.music), 'k1mfb_' + m.id, { pic: pic(m.svg, 'Bild'), mood: m.id });
    }
    if (mod === 'koerper') {
      const b = pick(BODY), others = some(BODY.filter((x) => x !== b), 2);
      if (r < 0.5) return choice('koerper', 'koerper', 'Was macht das Kind?', b.word, others.map((x) => x.word), 'k1mkb_' + b.id, { pic: pic(b.svg, 'Bild'), body: b.id });
      return choice('koerper', 'koerper', `Tippe auf das Bild zum ${b.noun}.`, opt(b), others.map(opt), 'k1mkt_' + b.id, { svgOpts: true, why: `So sieht ${b.noun} aus:`, bodies: [b.id].concat(others.map((x) => x.id)) });
    }
    if (mod === 'zeichen') {
      const s = pick(SIGNS), y = SIGNS.find((o) => o.dim === s.dim && o !== s);
      if (r < 0.35) return choice('zeichen', 'zeichen', s.tap, opt(s), [opt(y)], 'k1mzt_' + s.id, { svgOpts: true, why: s.why, signs: [s.id, y.id] });
      if (r < 0.7) return choice('zeichen', 'zeichen', 'Was bedeutet dieses Zeichen?', s.mean, [y.mean], 'k1mzb_' + s.id, { pic: pic(s.svg, 'Zeichen'), sign: s.id });
      const p = pick(PATS), same = PATS.filter((o) => o !== p && [...o.id].sort().join('') === [...p.id].sort().join(''));
      return choice('zeichen', 'zeichen', `Welches Zeichen passt? ${patWords(p.id)}.`, opt(p), same.map(opt), 'k1mzp_' + p.id, { svgOpts: true, why: 'So passt es:', pats: [p.id].concat(same.map((o) => o.id)) });
    }
    return null;
  }
  K.MODES.musik1 = unit('musik', [{ name: 'Triangelschlag', mod: 'spielen' }, { name: 'Stampftanz', mod: 'koerper' }, { name: 'Wiegenlied', mod: 'gefuehl' }, { name: 'Kreidestrich', mod: 'zeichen' }], {
    grade: 1, subject: 'Musik', title: 'Die Klangkiste', icon: '🥁', sub: 'Instrumente der Klasse, laut und leise, Gefühle in der Musik, klatschen und stampfen, Klänge aufmalen',
    modules: {
      instr: { name: 'Welches Instrument?', icon: '🔍', maxTier: 1, worldCap: [1], dmg: 12 },
      spielen: { name: 'So spielt man', icon: '🎵', maxTier: 1, worldCap: [1], dmg: 12 },
      gegen: { name: 'Gegensätze', icon: '🔊', maxTier: 1, worldCap: [1], dmg: 10 },
      gefuehl: { name: 'Musik und Gefühle', icon: '🙂', maxTier: 1, worldCap: [1], dmg: 12 },
      koerper: { name: 'Körperinstrumente', icon: '👏', maxTier: 1, worldCap: [1], dmg: 10 },
      zeichen: { name: 'Zeichen für Klänge', icon: '✏', maxTier: 1, worldCap: [1], dmg: 12 },
    },
    extra: { instr: 'Instrumentenregal', spielen: 'Schellenkranz', gegen: 'Donnergrollen', gefuehl: 'Schlaflied', koerper: 'Fingerschnipsen', zeichen: 'Klangbild' },
    tut: {
      'instr:1': { title: 'Welches Instrument?', steps: ['Schau dir das Bild genau an.', 'Ist es aus Holz oder aus Metall? Hat es ein Fell, Schellen oder bunte Platten?', 'Tippe auf den richtigen Namen oder das richtige Bild.'] },
      'spielen:1': { title: 'So spielt man', steps: ['Überlege: Was tust du, damit das Instrument klingt?', 'Trommel, Triangel, Klanghölzer und Glockenspiel: schlagen.', 'Rassel und Schellenkranz: schütteln. Gitarre: zupfen.', 'Tippe auf die richtige Antwort.'] },
      'gegen:1': { title: 'Gegensätze', steps: ['Hör dir die Frage an und schau dir die Bilder an.', 'Laut oder leise? Schnell oder langsam? Hoch oder tief?', 'Ein Gewitter ist laut. Ein Hase ist schnell. Eine Maus piepst hoch.', 'Tippe auf das passende Bild oder Wort.'] },
      'gefuehl:1': { title: 'Musik und Gefühle', steps: ['Hör dir an, wie die Musik klingt.', 'Fröhlich: die lachende Sonne. Traurig: die weinende Wolke.', 'Ruhig: der schlafende Mond. Wild: der Sturm.', 'Tippe auf das Bild, das passt.'] },
      'koerper:1': { title: 'Körperinstrumente', steps: ['Schau, was Hände, Finger und Füße tun.', 'Hände schlagen aneinander: klatschen. Füße treten fest auf: stampfen.', 'Finger knacken: schnipsen. Hände klopfen auf die Beine: patschen.', 'Mach es selbst einmal vor und tippe dann auf die Antwort.'] },
      'zeichen:1': { title: 'Zeichen für Klänge', steps: ['Ein langer Strich ist ein langer Ton. Ein Punkt ist ein kurzer Ton.', 'Ein großes Zeichen ist laut, ein kleines leise.', 'Lies die Zeichen von links nach rechts.', 'Tippe auf das passende Zeichen oder Wort.'] },
    },
    notes: NOTES4, pool: POOL4, gen: gen4,
    events: [
      ask('Das Instrumentenregal', 'Im Musikraum steht ein Regal mit Trommeln, Rasseln und Triangeln. Die Musiklehrerin zeigt auf ein Instrument und schenkt dir einen Trank, wenn du es erkennst.', 'instr', undefined, { item: 'trank' }, { hp: -5 }),
      ask('Die Turnhalle', 'In der Turnhalle klatscht und stampft die Klasse zu einem Lied. Der Sportlehrer stellt dir eine Frage und gibt dir einen Schild.', 'koerper', 'koerper', { item: 'schild' }, { hp: -5 }),
      { title: 'Der Malkreis', text: 'Im Kunstraum malen Kinder Bilder zu einem Lied. Ein Mädchen fragt dich, welches Bild zur Musik passt.', opts: [{ label: 'Antworten', task: 'gefuehl', g: 'gefuehle', win: { xp: 20 }, lose: { xp: 5 } }, { label: 'Zuschauen (+5 LP)', effect: { hp: 5 } }] },
      dilemma('Der schiefe Ton', 'Im Morgenkreis singt dein Freund Ben laut mit. Einige Töne klingen schief. Zwei Kinder lachen.', [
        ['Ich singe mit Ben weiter.', 'Ihr singt das Lied zusammen zu Ende. Ben lächelt dich an.', 'Was ist beim Singen wichtiger: die Freude oder jeder Ton?'],
        ['Ich sage Ben später, welcher Ton anders klang.', 'Ben hört genau hin und singt die Stelle noch einmal mit dir.', 'Wie sagt man so etwas, ohne dass es wehtut?'],
        ['Ich lache mit den anderen.', 'Ben hört auf zu singen und schaut auf den Boden.', 'Wie fühlt sich Ben jetzt?']]),
      rest('Die Sitzkissen', 'Im Musikraum liegen Sitzkissen im Kreis. Hier ruhst du dich aus.'),
    ],
  });

  return { FACES, SYMS, FESTE, INSTR, FAM, HOWS, PAIRS, JAHR, WACHSEN, FESTORD, ORDER1, symFits, ORFF, SPIEL1, OPP, MOODS, BODY, SIGNS, PATS, moodFits, wrongHow };
})();
if (typeof module !== 'undefined') module.exports = K12E;
