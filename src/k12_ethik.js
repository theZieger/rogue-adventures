// Klasse 1 und 2, Ethik (Lehrplan Sachsen 2019): „Ich und die anderen“ (Klasse 1, LB 1 und 2) und „Feste und die Welt“
// (Klasse 2, LB 3 und 4). Dazu Musik Klasse 2 „Der Musikraum“ (LB 4: Instrumente und Stimmen), nur Bilder, keine Töne.
// Registers the units in MK.MODES with the shared hero and opponents of K12.SETS. Mode keys are save keys: never rename.
const K12E = (() => {
  const K = typeof MK !== 'undefined' ? MK : require('./knowledge.js');
  const S = typeof K12 !== 'undefined' ? K12 : require('./klasse12.js');
  const { shuffle, pick } = K;

  /* ---------- Zeichnungen ---------- */
  const NS = 'xmlns="http://www.w3.org/2000/svg"';
  const INK = '#1C2541', WOOD = '#E9A15B', DARK = '#8A5A2B', METAL = '#C9CEDD', GOLD = '#FFD25A', RED = '#E8344A', BLUE = '#7CC2FF', GREEN = '#4FC96A', WHITE = '#FFFFFF', PAPER = '#FFFDF5';
  const ln = (d, w, c) => `<path d="${d}" fill="none" stroke="${c || INK}" stroke-width="${w || 3}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const sh = (d, fill, w) => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${w || 2.5}" stroke-linejoin="round"/>`;
  const rect = (x, y, w, h, fill, rx) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx || 0}" fill="${fill}" stroke="${INK}" stroke-width="2.5"/>`;
  const circ = (cx, cy, r, fill, w) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${w === undefined ? 2.5 : w}"/>`;
  // one outline around overlapping shapes: thick ink first, the fill on top
  const union = (shapes, fill) => `<g fill="${INK}" stroke="${INK}" stroke-width="5">${shapes}</g><g fill="${fill}">${shapes}</g>`;
  const tube = (d, w, c) => ln(d, w + 4) + ln(d, w, c);
  const star = (cx, cy, R, r) => 'M' + Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 5 * i - Math.PI / 2, d = i % 2 ? r : R; return `${(cx + d * Math.cos(a)).toFixed(1)} ${(cy + d * Math.sin(a)).toFixed(1)}`; }).join(' L') + 'Z';
  // question picture with a paper frame, answer pictures plain; labels never name the answer
  const pic = (inner, label) => `<svg ${NS} class="pic" viewBox="-6 -6 112 112" style="max-width:150px" role="img" aria-label="${label}"><rect x="-5" y="-5" width="110" height="110" rx="10" fill="${PAPER}" stroke="#C9CFDF" stroke-width="1.5"/>${inner}</svg>`;
  const optPic = (inner, label) => `<svg ${NS} viewBox="0 0 100 100" role="img" aria-label="${label}">${inner}</svg>`;
  // smaller copy standing on the same ground line (hoch und tief)
  const scaled = (inner, s) => `<g transform="translate(${50 - 50 * s} ${100 - 100 * s}) scale(${s})">${inner}</g>`;

  /* Gesichter */
  const SKIN = '#FFD9A8';
  const HAIR = sh('M14 46 Q18 10 50 11 Q82 10 86 46 Q76 27 50 27 Q24 27 14 46 Z', DARK);
  const DOTS = circ(37, 54, 4, INK, 0) + circ(63, 54, 4, INK, 0);
  const FACES = {
    froehlich: { word: 'fröhlich', svg: circ(50, 52, 40, SKIN, 3) + HAIR + DOTS + sh('M32 66 Q50 88 68 66 Z', '#B8323F') + `<circle cx="27" cy="66" r="5" fill="#FF8A8A" opacity=".6"/><circle cx="73" cy="66" r="5" fill="#FF8A8A" opacity=".6"/>` },
    traurig: { word: 'traurig', svg: circ(50, 52, 40, SKIN, 3) + HAIR + DOTS + ln('M28 46 L42 41') + ln('M58 41 L72 46') + ln('M36 78 Q50 67 64 78', 3.5) + sh('M33 60 Q28 69 33 72 Q38 69 33 60 Z', BLUE, 2) },
    wuetend: { word: 'wütend', svg: circ(50, 52, 40, '#FFB08A', 3) + HAIR + DOTS + ln('M27 40 L43 48', 4.5) + ln('M57 48 L73 40', 4.5) + rect(35, 68, 30, 10, WHITE, 3) + ln('M35 73 H65', 1.5) + ln('M45 68 V78 M55 68 V78', 1.5) },
    aengstlich: { word: 'ängstlich', svg: circ(50, 52, 40, SKIN, 3) + HAIR + circ(37, 54, 7, WHITE) + circ(63, 54, 7, WHITE) + circ(37, 55, 3, INK, 0) + circ(63, 55, 3, INK, 0) + ln('M29 40 Q36 35 43 40') + ln('M57 40 Q64 35 71 40') + ln('M36 75 q3.5 -4 7 0 t7 0 t7 0 t7 0') + sh('M84 38 Q80 46 84 49 Q88 46 84 38 Z', BLUE, 2) },
  };
  const FACE_IDS = Object.keys(FACES);

  /* Zeichen der Feste */
  const FESTE = ['Geburtstag', 'Erntedank', 'St. Martin', 'Advent', 'Nikolaus', 'Weihnachten', 'Silvester', 'Ostern'];
  const SYMS = [
    { id: 'kuchen', fest: 'Geburtstag', note: 'geburtstag', svg: `<ellipse cx="50" cy="88" rx="42" ry="6" fill="${METAL}" stroke="${INK}" stroke-width="2.5"/>` + rect(18, 54, 64, 32, '#FFB3D9', 4)
      + sh('M18 58 Q18 52 24 52 H76 Q82 52 82 58 Q76 66 70 58 Q64 66 58 58 Q52 66 46 58 Q40 66 34 58 Q28 66 18 58 Z', WHITE)
      + [30, 47, 64].map((x) => rect(x, 34, 6, 19, BLUE, 1) + sh(`M${x + 3} 20 Q${x + 9} 28 ${x + 3} 32 Q${x - 3} 28 ${x + 3} 20 Z`, GOLD, 2)).join('') },
    { id: 'korb', fest: 'Erntedank', note: 'erntedank', svg: sh('M50 22 Q58 30 57 40 Q61 54 50 55 Q39 54 43 40 Q42 30 50 22 Z', '#C9E265') + circ(31, 44, 13, RED) + `<ellipse cx="70" cy="44" rx="15" ry="12" fill="#FF8A3D" stroke="${INK}" stroke-width="2.5"/>` + ln('M70 32 V56 M62 34 Q58 44 62 54 M78 34 Q82 44 78 54', 1.8) + ln('M31 31 Q32 26 36 24', 2.5, DARK) + ln('M70 32 Q71 27 74 26', 2.5, '#2E9E57')
      + sh('M10 52 H90 L79 90 H21 Z', WOOD) + ln('M14 64 H86 M17 76 H83', 2) + ln('M30 52 L32 90 M50 52 V90 M70 52 L68 90', 2) },
    { id: 'laterne', fest: 'St. Martin', note: 'martin', svg: ln('M50 30 V14 Q50 8 58 8 L92 4', 3, DARK) + ln('M38 32 Q50 18 62 32', 2) + circ(50, 60, 28, '#FF8A3D') + `<circle cx="50" cy="62" r="10" fill="${GOLD}" opacity=".9"/>` + `<ellipse cx="50" cy="60" rx="14" ry="28" fill="none" stroke="${INK}" stroke-width="1.5"/>` + ln('M50 32 V88', 1.5) + rect(37, 28, 26, 7, RED, 2) + rect(40, 85, 20, 6, RED, 2) },
    { id: 'kranz', fest: 'Advent', note: 'advent', not: ['Weihnachten', 'Nikolaus'], svg: `<ellipse cx="50" cy="72" rx="38" ry="14" fill="none" stroke="${INK}" stroke-width="18"/><ellipse cx="50" cy="72" rx="38" ry="14" fill="none" stroke="#2E9E57" stroke-width="13"/>`
      + [[22, 80], [44, 87], [66, 64], [80, 76]].map(([x, y]) => circ(x, y, 3, RED, 1.5)).join('')
      + [[32, 62], [68, 62], [24, 80], [76, 80]].map(([x, y]) => rect(x - 4, y - 24, 8, 24, RED, 1) + sh(`M${x} ${y - 36} Q${x + 6} ${y - 29} ${x} ${y - 25} Q${x - 6} ${y - 29} ${x} ${y - 36} Z`, GOLD, 2)).join('') },
    { id: 'stiefel', fest: 'Nikolaus', note: 'nikolaus', not: ['Advent', 'Weihnachten'], svg: circ(40, 20, 10, '#FF8A3D') + ln('M66 24 L62 36', 3) + circ(67, 15, 9, '#FFB3D9') + sh('M30 28 H64 V62 L84 68 Q93 72 88 86 H30 Z', RED) + rect(25, 22, 44, 12, WHITE, 4) + rect(28, 84, 62, 7, INK, 3) },
    { id: 'baum', fest: 'Weihnachten', note: 'weihnachten', not: ['Advent'], svg: rect(44, 80, 12, 12, DARK) + sh('M50 44 L86 82 H14 Z', '#2E9E57') + sh('M50 28 L77 62 H23 Z', '#3DB36A') + sh('M50 14 L68 44 H32 Z', GREEN)
      + [[34, 74, RED], [62, 72, BLUE], [50, 56, GOLD], [40, 50, BLUE], [60, 38, RED]].map(([x, y, c]) => circ(x, y, 4, c, 1.5)).join('') + sh(star(50, 11, 10, 4.5), GOLD, 2) },
    { id: 'klee', fest: 'Silvester', note: 'silvester', svg: ln('M50 52 Q55 76 68 92', 4.5, '#2E9E57') + union('<circle cx="37" cy="37" r="15"/><circle cx="63" cy="37" r="15"/><circle cx="37" cy="63" r="15"/><circle cx="63" cy="63" r="15"/>', GREEN) + ln('M50 50 L36 36 M50 50 L64 36 M50 50 L36 64 M50 50 L64 64', 1.8, '#2E9E57') },
    { id: 'ei', fest: 'Ostern', note: 'ostern', svg: sh('M50 12 C70 12 80 44 78 62 C76 80 64 90 50 90 C36 90 24 80 22 62 C20 44 30 12 50 12 Z', GOLD) + ln('M24 56 L31 49 L38 56 L45 49 L52 56 L59 49 L66 56 L73 49 L76 52', 3, RED) + ln('M26 70 H74', 3.5, BLUE) + [[40, 32], [50, 26], [60, 32]].map(([x, y]) => circ(x, y, 3, GREEN, 0)).join('') },
  ];
  const symFits = (a, b) => a.fest !== b.fest && !(a.not || []).includes(b.fest) && !(b.not || []).includes(a.fest);

  /* Instrumente */
  const drum = sh('M14 44 V64 A36 12 0 0 0 86 64 V44 Z', RED) + ln('M20 58 L31 72 L42 60 L53 75 L64 61 L75 73 L82 62', 2) + `<ellipse cx="50" cy="44" rx="36" ry="12" fill="#FBEBC8" stroke="${INK}" stroke-width="2.5"/>`;
  const recorder = `<g transform="rotate(35 50 50)">` + rect(44, 18, 12, 70, '#F3D6A4', 4) + rect(42, 6, 16, 16, WOOD, 5) + `<rect x="47" y="14" width="6" height="4" fill="${INK}"/>` + [32, 40, 48, 56, 64, 72].map((y) => circ(50, y, 2.6, INK, 0)).join('') + sh('M43 84 L40 95 H60 L57 84 Z', WOOD) + '</g>';
  const strBody = union('<ellipse cx="40" cy="44" rx="13" ry="13"/><ellipse cx="40" cy="68" rx="16" ry="16"/><rect x="33" y="46" width="14" height="20"/>', '#C8692E')
    + rect(37, 14, 6, 42, '#3B2A1E', 2) + circ(40, 10, 5, '#C8692E') + ln('M33 60 q-2.5 4 0 9 M47 60 q2.5 4 0 9', 1.8) + rect(34, 64, 12, 3, '#F3D6A4') + sh('M37 74 H43 L42 82 H38 Z', '#3B2A1E', 1.5) + ln('M39 12 V76 M41 12 V76', 0.8, '#F3D6A4');
  const BARS = ['#E8344A', '#FF8A3D', '#FFD25A', '#4FC96A', '#2BB3A0', '#7CC2FF', '#5B6CFF', '#B07CFF'];
  const INSTR = [
    { id: 'trommel', name: 'Handtrommel', acc: 'die Handtrommel', fam: 'schlag', how: 'schlagen', svg: drum + tube('M60 40 L88 12', 3, DARK) + circ(58, 42, 6, PAPER) },
    { id: 'triangel', name: 'Triangel', acc: 'die Triangel', fam: 'schlag', how: 'schlagen', svg: ln('M50 18 V5', 2) + tube('M43 30 L16 78 L84 78 L50 18', 4, METAL) + tube('M72 24 L96 10', 3.5, METAL) },
    { id: 'klanghoelzer', name: 'Klanghölzer', acc: 'die Klanghölzer', fam: 'schlag', how: 'schlagen', svg: [-28, 28].map((r) => `<rect x="10" y="44" width="80" height="12" rx="6" transform="rotate(${r} 50 50)" fill="${WOOD}" stroke="${INK}" stroke-width="2.5"/>`).join('') },
    { id: 'rassel', name: 'Rassel', acc: 'die Rassel', fam: 'schlag', how: 'schütteln', notHow: ['schlagen'], svg: '<g transform="rotate(-30 50 55)">' + rect(45, 56, 10, 38, DARK, 4) + `<ellipse cx="50" cy="36" rx="21" ry="25" fill="${GOLD}" stroke="${INK}" stroke-width="2.5"/>` + ln('M31 38 L37 32 L43 38 L49 32 L55 38 L61 32 L69 38', 2.5, RED) + [[42, 22], [56, 21], [45, 50], [58, 48]].map(([x, y]) => circ(x, y, 2.5, INK, 0)).join('') + '</g>' },
    { id: 'schellenkranz', name: 'Schellenkranz', acc: 'den Schellenkranz', fam: 'schlag', how: 'schütteln', notHow: ['schlagen'], svg: `<circle cx="50" cy="50" r="32" fill="none" stroke="${INK}" stroke-width="16"/><circle cx="50" cy="50" r="32" fill="none" stroke="${WOOD}" stroke-width="11"/>` + [0, 60, 120, 180, 240, 300].map((a) => { const x = 50 + 32 * Math.cos(a * Math.PI / 180), y = 50 + 32 * Math.sin(a * Math.PI / 180); return circ(x.toFixed(1), y.toFixed(1), 6.5, METAL, 2) + circ(x.toFixed(1), y.toFixed(1), 1.8, INK, 0); }).join('') },
    { id: 'glockenspiel', name: 'Glockenspiel', acc: 'das Glockenspiel', fam: 'schlag', how: 'schlagen', notFam: ['tasten'], notHow: ['Tasten drücken'], svg: tube('M8 36 L90 44', 4, DARK) + tube('M8 76 L90 66', 4, DARK) + BARS.map((c, i) => rect((12 + i * 9.6).toFixed(1), (26 + i * 2.6).toFixed(1), 7.5, (58 - i * 5.2).toFixed(1), c, 1.5)).join('') + tube('M80 91 L95 96', 3, WOOD) + circ(75, 89, 5.5, RED) },
    { id: 'blockfloete', name: 'Blockflöte', acc: 'die Blockflöte', fam: 'blas', how: 'blasen', svg: recorder },
    { id: 'trompete', name: 'Trompete', acc: 'die Trompete', fam: 'blas', how: 'blasen', notHow: ['Tasten drücken'], svg: tube('M30 52 V66 H66 V52', 4, GOLD) + rect(8, 46, 56, 6, GOLD, 2) + [34, 44, 54].map((x) => rect(x, 32, 7, 22, GOLD, 1) + rect(x - 1, 27, 9, 5, METAL, 1) + circ(x + 3.5, 24, 3, METAL, 2)).join('') + sh('M60 46 L91 30 Q96 49 91 68 L60 52 Z', GOLD) + sh('M3 42 L10 46 V52 L3 56 Z', METAL) },
    { id: 'gitarre', name: 'Gitarre', acc: 'die Gitarre', fam: 'saiten', how: 'zupfen', notHow: ['schlagen', 'streichen'], svg: rect(44, 4, 12, 12, DARK, 3) + circ(41, 8, 2, METAL, 1) + circ(59, 8, 2, METAL, 1) + circ(41, 13, 2, METAL, 1) + circ(59, 13, 2, METAL, 1) + rect(45.5, 14, 9, 36, DARK, 1)
      + union('<circle cx="50" cy="50" r="15"/><circle cx="50" cy="74" r="21"/>', WOOD) + circ(50, 58, 6.5, INK, 0) + rect(41, 79, 18, 4, DARK, 1) + ln('M47 8 V81 M49 8 V81 M51 8 V81 M53 8 V81', 0.8, PAPER) },
    { id: 'geige', name: 'Geige', acc: 'die Geige', fam: 'saiten', how: 'streichen', notHow: ['zupfen'], svg: strBody + tube('M62 6 L84 94', 2.5, DARK) + ln('M66 8 L87 90', 1.2, '#BFB7A8') + rect(80, 84, 7, 9, '#3B2A1E', 1) },
    { id: 'klavier', name: 'Klavier', acc: 'das Klavier', fam: 'tasten', how: 'Tasten drücken', notFam: ['saiten', 'schlag'], notHow: ['schlagen'], svg: rect(10, 14, 80, 46, '#6B3E26', 3) + rect(22, 22, 56, 18, DARK, 2) + rect(12, 72, 6, 20, '#6B3E26') + rect(82, 72, 6, 20, '#6B3E26') + rect(6, 56, 88, 16, WHITE, 1)
      + ln(Array.from({ length: 10 }, (_, i) => `M${14 + i * 8} 56 V72`).join(' '), 1.2) + [1, 2, 4, 5, 6, 8, 9].map((i) => `<rect x="${3.5 + i * 8}" y="56" width="5" height="9" fill="${INK}"/>`).join('') },
  ];
  const FAM = { saiten: 'Saiteninstrument', blas: 'Blasinstrument', schlag: 'Schlaginstrument', tasten: 'Tasteninstrument' };
  const HOWS = ['zupfen', 'streichen', 'blasen', 'schlagen', 'schütteln', 'Tasten drücken'];
  // hoch und tief: the same drawing small and big; the long bar of the Glockenspiel sounds lower
  const bar = (w) => rect(50 - w / 2, 42, w, 16, BLUE, 3) + circ(50 - w / 2 + 6, 50, 2, INK, 0) + circ(50 + w / 2 - 6, 50, 2, INK, 0);
  const PAIRS = [
    { id: 'trommel', q: 'Welche Trommel', small: scaled(drum, 0.55), big: drum },
    { id: 'floete', q: 'Welche Flöte', small: scaled(recorder, 0.55), big: recorder },
    { id: 'bass', q: 'Welches Instrument', small: scaled(strBody, 0.5), big: strBody + ln('M40 84 V97', 2.5) },
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

    { id: 'k1ef1', mod: 'familie', g: 'familie', q: 'Mia wohnt mit ihren zwei Mamas. Wie nennt man so eine Familie?', o: ['Regenbogenfamilie', 'Großfamilie'], a: 0 },
    { id: 'k1ef2', mod: 'familie', g: 'familie', q: 'Paul wohnt mit Eltern, Oma, Opa und Tante. Welche Familie?', o: ['Großfamilie', 'Kleinfamilie'], a: 0 },
    { id: 'k1ef3', mod: 'familie', g: 'familie', q: 'Lea wohnt mit Mama, Mamas neuem Mann und seiner Tochter. Welche Familie?', o: ['Patchworkfamilie', 'Großfamilie'], a: 0 },
    { id: 'k1ef4', mod: 'familie', g: 'familie', q: 'Ein Kind bekommt für immer neue Eltern. Wie heißt das?', o: ['Adoption', 'Geburtstag', 'Umzug'], a: 0 },
    { id: 'k1ef5', mod: 'familie', g: 'familie', q: 'Ole wohnt mit seinem Papa. Was stimmt?', o: ['Sie sind eine Familie.', 'Sie sind nur zu Besuch.'], a: 0 },
    { id: 'k1ef6', mod: 'familie', g: 'familie', q: 'Was ist in jeder Familie wichtig?', o: ['Sich lieb haben und helfen', 'Gleich aussehen', 'Viele Kinder haben'], a: 0 },
    { id: 'k1ef7', mod: 'familie', g: 'familie', q: 'Wer kann in einer Familie mithelfen?', o: ['Alle, auch die Kinder', 'Nur die Erwachsenen'], a: 0 },
    { id: 'k1ef8', mod: 'familie', g: 'familie', q: 'Wie viele Menschen gehören zu einer Familie?', o: ['Das ist verschieden', 'Immer vier', 'Immer zwei'], a: 0 },
    { id: 'k1ef9', mod: 'familie', g: 'familie', q: 'Nur Eltern und Kinder wohnen zusammen. Wie heißt das?', o: ['Kleinfamilie', 'Großfamilie'], a: 0 },
    { id: 'k1ef10', mod: 'familie', g: 'familie', q: 'Lina ist adoptiert. Was stimmt?', o: ['Ihre Eltern sorgen für immer für sie', 'Ihre Eltern sorgen nur eine Woche für sie'], a: 0 },
    { id: 'k1er9', mod: 'rf', g: 'familie', q: 'Alle Familien sehen gleich aus.', a: false, why: 'Familien sind verschieden. Jede ist eine richtige Familie.' },
    { id: 'k1er10', mod: 'rf', g: 'familie', q: 'In einer Großfamilie wohnen oft Oma und Opa mit.', a: true },

    { id: 'k1eh1', mod: 'hoeflich', g: 'hoeflich', q: 'Du möchtest einen Stift haben. Was sagst du dazu?', o: ['Bitte', 'Danke', 'Tschüss'], a: 0 },
    { id: 'k1eh2', mod: 'hoeflich', g: 'hoeflich', q: 'Jemand hilft dir. Was sagst du?', o: ['Danke', 'Tschüss', 'Hallo'], a: 0 },
    { id: 'k1eh3', mod: 'hoeflich', g: 'hoeflich', q: 'Du trittst aus Versehen auf einen Fuß. Was sagst du?', o: ['Entschuldigung', 'Danke', 'Hallo'], a: 0 },
    { id: 'k1eh4', mod: 'hoeflich', g: 'hoeflich', q: 'Du kommst morgens in die Klasse. Was sagst du?', o: ['Guten Morgen', 'Tschüss', 'Gute Nacht'], a: 0 },
    { id: 'k1eh5', mod: 'hoeflich', g: 'hoeflich', q: 'Ein Kind sagt: „Gib her!“ Ist das höflich?', o: ['unhöflich', 'höflich'], a: 0 },
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
    { id: 'k2fn13', mod: 'natur', g: 'schuetzen', q: 'Was braucht dein Haustier jeden Tag?', o: ['Futter, Wasser und Pflege', 'Nur Spielzeug', 'Gar nichts'], a: 0 },

    { id: 'k2fw1', mod: 'wachsen', g: 'wachsen', q: 'Was braucht eine Pflanze zum Wachsen?', o: ['Wasser, Licht und Erde', 'Nur Dunkelheit', 'Salz'], a: 0 },
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

  return { FACES, SYMS, FESTE, INSTR, FAM, HOWS, PAIRS, JAHR, WACHSEN, FESTORD, ORDER1, symFits };
})();
if (typeof module !== 'undefined') module.exports = K12E;
