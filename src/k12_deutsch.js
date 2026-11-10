// Klasse 1 und 2, Deutsch: Laute und Buchstaben (Kl. 1), Richtig schreiben und Wörter und Sätze (Kl. 2).
// Content follows the Sächsischer Rechtschreibrahmen 2025 for Kl. 1/2: no ck, tz, silbentrennendes h, Komma or
// wörtliche Rede; no rule like „Verben schreibt man klein“ (the Rahmen asks to avoid it).
// Task ids come from the words, so adding words keeps the learning history of the others.
const K12D = (() => {
  const K = typeof MK !== 'undefined' ? MK : require('./knowledge.js');
  const S = typeof K12 !== 'undefined' ? K12 : require('./klasse12.js');
  const { shuffle, pick, weightedPick } = K;
  const others = (arr, not, n) => shuffle(arr.filter((x) => !not.includes(x))).slice(0, n);
  const choice = (mod, tier, note, q, answer, wrongs, qid, extra) => Object.assign({ kind: 'choice', mod, tier, group: mod + ':' + tier, note, q, options: shuffle([answer].concat(wrongs)), answer, qid, cols: wrongs.length === 1 ? 2 : 1 }, extra || {});
  // gen items: { id, make(id) } – weightedPick brings back what went wrong
  const ask = (items, know, seq) => { const it = weightedPick(items, know, seq); return it.make(it.id); };
  const hero = (attacks) => [Object.assign({}, S.SETS.deutsch.hero, { attacks })];
  const set = { enemies: S.SETS.deutsch.enemies, moves: S.SETS.deutsch.moves, worlds: 1, subject: 'Deutsch' };

  /* ---------- Bilder für Klasse 1: ein Ding je Bild, eindeutig benannt ---------- */
  const O = '#1C2541';
  const p = (d, fill, w) => `<path d="${d}" fill="${fill}" stroke="${O}" stroke-width="${w || 2}"/>`;
  const ci = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${O}" stroke-width="2"/>`;
  const el = (x, y, rx, ry, fill) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${O}" stroke-width="2"/>`;
  const rect = (x, y, w, h, fill, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r || 0}" fill="${fill}" stroke="${O}" stroke-width="2"/>`;
  const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c || O}" stroke-width="${w || 2}"/>`;
  const shine = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".6"/>`;
  const around = (n, cx, cy, f) => Array.from({ length: n }, (_, i) => f(cx, cy, (i / n) * Math.PI * 2)).join('');
  const r1 = (v) => Math.round(v * 10) / 10;
  const RED = '#E8344A', YEL = '#FFD43B', GRN = '#4FC96A', BRN = '#A8682F', BLU = '#7CC2FF', GRY = '#B8BECC';
  const spikes = Array.from({ length: 9 }, (_, i) => { const a = (196 + i * 18) * Math.PI / 180; const pt = (d, r) => `${r1(36 + Math.cos(a + d) * 21 * r)} ${r1(40 + Math.sin(a + d) * 13 * r)}`; return `M${pt(-0.16, 0.9)} L${pt(0, 1.5)} L${pt(0.16, 0.9)}`; }).join(' ');
  // w: the word as it is spoken and written, syl: in syllables
  const PICS = {
    sonne: { w: 'Sonne', syl: 'Son-ne', svg: around(8, 32, 32, (x, y, a) => line(`M${r1(x + Math.cos(a) * 18)} ${r1(y + Math.sin(a) * 18)} L${r1(x + Math.cos(a) * 28)} ${r1(y + Math.sin(a) * 28)}`, O, 6) + line(`M${r1(x + Math.cos(a) * 18)} ${r1(y + Math.sin(a) * 18)} L${r1(x + Math.cos(a) * 28)} ${r1(y + Math.sin(a) * 28)}`, '#F0A500', 3)) + ci(32, 32, 14, YEL) + shine(27, 26, 4, 3) },
    mond: { w: 'Mond', syl: 'Mond', svg: p('M36 5 A27 27 0 1 0 58 46 A22 22 0 1 1 36 5 Z', '#FFE27A') + shine(16, 26, 3, 7) },
    haus: { w: 'Haus', syl: 'Haus', svg: rect(14, 30, 36, 26, '#F4E3C3') + p('M8 32 L32 10 L56 32 Z', RED) + rect(28, 40, 9, 16, BRN) + rect(17, 36, 8, 8, BLU) + rect(41, 36, 7, 7, BLU) },
    maus: { w: 'Maus', syl: 'Maus', svg: line('M52 46 Q62 42 58 32', O, 2) + el(36, 44, 18, 11, GRY) + ci(19, 38, 10, GRY) + ci(21, 27, 7, '#D3D7E2') + `<circle cx="21" cy="27" r="3.5" fill="#F7A8B8"/>` + `<circle cx="15" cy="36" r="1.8" fill="${O}"/>` + ci(9.5, 41, 2.2, '#F7A8B8') + line('M10 44 L2 47 M10 42 L1 42', O, 1) + shine(30, 38, 5, 3) },
    ball: { w: 'Ball', syl: 'Ball', svg: ci(32, 32, 22, RED) + p('M11 27 Q32 40 53 27 L54 35 Q32 48 10 35 Z', '#fff') + shine(24, 18, 5, 3) },
    fisch: { w: 'Fisch', syl: 'Fisch', svg: p('M42 32 L58 20 L58 44 Z', '#FF9F43') + p('M24 23 Q30 14 38 23 Z', '#FF9F43') + el(28, 32, 19, 12, '#FF9F43') + ci(17, 29, 3, '#fff') + `<circle cx="16.5" cy="29" r="1.4" fill="${O}"/>` + line('M28 24 Q32 32 28 40', O, 1.5) + shine(24, 26, 4, 2) },
    tisch: { w: 'Tisch', syl: 'Tisch', svg: rect(18, 22, 4, 26, '#9A5E2E', 1) + rect(50, 22, 4, 26, '#9A5E2E', 1) + rect(8, 30, 5, 26, '#B8763E', 1) + rect(42, 30, 5, 26, '#B8763E', 1) + p('M48 26 L58 16 V20 L48 30 Z', '#B8763E') + rect(4, 26, 44, 4, '#C98A4E') + p('M4 26 L14 16 H58 L48 26 Z', '#E5B47A') },
    apfel: { w: 'Apfel', syl: 'Ap-fel', svg: line('M32 20 Q32 12 36 7', O, 3) + p('M32 20 C20 12 8 20 10 34 C12 48 22 56 32 52 C42 56 52 48 54 34 C56 20 44 12 32 20 Z', RED) + p('M35 13 Q43 5 49 11 Q43 17 35 13 Z', GRN) + shine(20, 28, 4, 6) },
    igel: { w: 'Igel', syl: 'I-gel', svg: line('M24 50 L23 56 M46 50 L47 56', O, 3) + p(spikes, '#5A3E22', 1.5) + el(36, 40, 21, 13, '#8A5530') + p('M20 48 Q10 48 3 43 Q8 35 20 33 Z', '#E9C9A0') + ci(4, 43, 2, O) + `<circle cx="12" cy="40" r="1.6" fill="${O}"/>` },
    uhr: { w: 'Uhr', syl: 'Uhr', svg: `<circle cx="32" cy="32" r="25" fill="${BLU}" stroke="${O}" stroke-width="2"/>` + ci(32, 32, 20, '#fff') + around(12, 32, 32, (x, y, a) => line(`M${r1(x + Math.cos(a) * 16)} ${r1(y + Math.sin(a) * 16)} L${r1(x + Math.cos(a) * 18.5)} ${r1(y + Math.sin(a) * 18.5)}`, O, 1.5)) + line('M32 32 L32 17 M32 32 L23 37', O, 3) + ci(32, 32, 2, O) },
    ente: { w: 'Ente', syl: 'En-te', svg: el(36, 42, 21, 13, YEL) + ci(20, 28, 10, YEL) + p('M11 26 L2 30 L11 33 Z', '#FF9F43') + `<circle cx="18" cy="25" r="1.8" fill="${O}"/>` + p('M30 38 Q42 32 50 41 Q40 47 30 38 Z', '#F5C400') },
    rakete: { w: 'Rakete', syl: 'Ra-ke-te', svg: p('M26 48 Q32 63 38 48 Z', '#FFB347') + p('M21 36 L11 52 L21 48 Z', RED) + p('M43 36 L53 52 L43 48 Z', RED) + p('M32 4 Q44 16 44 36 L44 48 L20 48 L20 36 Q20 16 32 4 Z', '#E9EEF6') + p('M32 4 Q39 10 42 19 L22 19 Q25 10 32 4 Z', RED) + ci(32, 30, 5, BLU) },
    banane: { w: 'Banane', syl: 'Ba-na-ne', svg: p('M10 14 Q12 44 38 50 Q52 52 58 44 Q50 46 40 42 Q22 34 17 13 Z', YEL) + p('M10 14 L11 8 L17 13 Z', '#8A5530') + line('M20 22 Q26 38 42 44', '#E0A800', 1.5) },
    tomate: { w: 'Tomate', syl: 'To-ma-te', svg: el(32, 37, 23, 19, RED) + p('M32 14 L36 20 L45 18 L38 24 L32 22 L26 24 L19 18 L28 20 Z', GRN) + line('M32 14 L32 8', O, 3) + shine(22, 30, 5, 3) },
    leiter: { w: 'Leiter', syl: 'Lei-ter', svg: [12, 24, 36, 48].map((y) => rect(19, y, 26, 4, '#D9A066')).join('') + rect(14, 4, 6, 56, '#B8763E', 2) + rect(44, 4, 6, 56, '#B8763E', 2) },
    kerze: { w: 'Kerze', syl: 'Ker-ze', svg: el(32, 58, 16, 3.5, GRY) + rect(24, 26, 16, 31, RED, 2) + line('M32 26 L32 21', O, 2) + p('M32 5 Q40 15 32 22 Q24 15 32 5 Z', '#FFB347') + `<path d="M32 12 Q35 17 32 20 Q29 17 32 12 Z" fill="#FFE27A"/>` + shine(28, 34, 1.5, 5) },
    wolke: { w: 'Wolke', syl: 'Wol-ke', svg: p('M14 46 Q3 46 5 35 Q7 26 18 28 Q20 15 33 18 Q43 11 49 24 Q61 24 59 37 Q58 46 48 46 Z', '#E9EEF6') + shine(26, 26, 5, 3) },
    hut: { w: 'Hut', syl: 'Hut', svg: el(32, 47, 27, 7, '#3E3E52') + p('M18 47 L20 18 Q32 13 44 18 L46 47 Z', '#55556E') + p('M19 37 L45 37 L46 44 L18 44 Z', RED) },
    gabel: { w: 'Gabel', syl: 'Ga-bel', svg: rect(29, 32, 6, 28, GRY, 3) + [19, 26.5, 34, 41].map((x) => rect(x, 4, 4, 20, GRY, 2)).join('') + p('M18 22 Q18 35 32 35 Q46 35 46 22 Z', GRY) },
    pilz: { w: 'Pilz', syl: 'Pilz', svg: p('M24 36 L22 58 L42 58 L40 36 Z', '#FFF3D6') + p('M6 38 Q8 10 32 10 Q56 10 58 38 Z', RED) + `<g fill="#fff">${[[20, 24, 4], [36, 18, 3.5], [46, 30, 3], [30, 30, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>` },
    zitrone: { w: 'Zitrone', syl: 'Zi-tro-ne', svg: p('M3 34 Q6 30 9 28 Q16 16 32 16 Q48 16 55 28 Q58 30 61 34 Q58 38 55 40 Q48 52 32 52 Q16 52 9 40 Q6 38 3 34 Z', YEL) + p('M32 16 Q35 5 46 6 Q43 15 32 16 Z', GRN) + shine(22, 26, 6, 3) },
    krone: { w: 'Krone', syl: 'Kro-ne', svg: p('M8 50 L8 18 L20 32 L32 10 L44 32 L56 18 L56 50 Z', YEL) + rect(8, 42, 48, 9, '#F0A500') + ci(32, 46.5, 2.6, RED) + ci(19, 46.5, 2.2, BLU) + ci(45, 46.5, 2.2, BLU) + ci(8, 16, 2.5, YEL) + ci(32, 8, 2.5, YEL) + ci(56, 16, 2.5, YEL) },
    baum: { w: 'Baum', syl: 'Baum', svg: rect(27, 36, 10, 24, BRN, 2) + p('M14 40 Q4 36 8 26 Q6 14 18 12 Q24 2 36 6 Q48 4 52 16 Q62 22 56 32 Q58 42 46 42 Q32 46 14 40 Z', GRN) + shine(22, 20, 6, 3) },
    nest: { w: 'Nest', syl: 'Nest', svg: el(25, 33, 5, 6.5, '#BFE3FF') + el(39, 33, 5, 6.5, '#BFE3FF') + el(32, 30, 5, 6.5, '#BFE3FF') + p('M3 32 Q4 58 32 58 Q60 58 61 32 Q48 40 32 40 Q16 40 3 32 Z', '#B8763E') + line('M6 38 Q30 50 58 37 M9 46 Q32 55 55 45 M4 33 L1 28 M60 33 L63 27 M14 39 L10 34 M50 39 L55 34 M20 55 L16 60 M44 55 L48 60', '#7A4A20', 1.6) },
    herz: { w: 'Herz', syl: 'Herz', svg: p('M32 55C14 42 5 32 5 22a13 13 0 0 1 27-4 13 13 0 0 1 27 4c0 10-9 20-27 33Z', RED) + shine(17, 18, 5, 3) },
    blume: { w: 'Blume', syl: 'Blu-me', svg: line('M32 34 L32 60', O, 5) + line('M32 34 L32 60', GRN, 2.5) + p('M32 50 Q42 40 50 46 Q42 54 32 50 Z', GRN) + around(6, 32, 22, (x, y, a) => ci(r1(x + Math.cos(a) * 11), r1(y + Math.sin(a) * 11), 8, '#FF8FC7')) + ci(32, 22, 6.5, YEL) },
    tasse: { w: 'Tasse', syl: 'Tas-se', svg: el(30, 54, 27, 6, '#E9EEF6') + line('M46 32 Q58 30 56 40 Q53 47 42 45', O, 7) + line('M46 32 Q58 30 56 40 Q53 47 42 45', '#fff', 3) + p('M8 26 H52 Q52 50 30 52 Q8 50 8 26 Z', '#fff') + p('M9 32 H51 Q50 38 49 40 H11 Q10 38 9 32 Z', BLU, 1.5) + el(30, 26, 22, 3.5, '#C9A27A') + line('M22 19 Q18 14 22 9 M34 19 Q30 14 34 9', '#8E96B5', 2) },
    ananas: { w: 'Ananas', syl: 'A-na-nas', svg: p('M32 26 L16 8 L27 15 L25 1 L32 12 L39 1 L37 15 L48 8 Z', GRN) + el(32, 42, 16, 20, '#FFC94D') + `<g stroke="#B8763E" stroke-width="1.5">${[[26, 32], [38, 32], [32, 40], [22, 44], [42, 44], [26, 50], [38, 50], [32, 56], [32, 26]].map(([x, y]) => `<path d="M${x - 2.5} ${y - 2.5} L${x + 2.5} ${y + 2.5} M${x + 2.5} ${y - 2.5} L${x - 2.5} ${y + 2.5}"/>`).join('')}</g>` },
    wal: { w: 'Wal', syl: 'Wal', svg: line('M20 20 Q18 12 12 9 M20 20 Q22 12 28 9 M20 20 V8', '#2478D6', 2.5) + p('M42 42 Q54 36 53 22 Q46 22 41 15 Q50 14 55 18 Q58 13 63 11 Q61 20 57 24 Q59 38 47 47 Z', '#3F7FC7') + p('M3 40 Q3 23 24 22 Q42 22 50 37 Q46 51 28 52 Q5 53 3 40 Z', '#4A90D9') + p('M7 45 Q24 50 45 44 Q38 51 27 51 Q12 51 7 45 Z', '#BFE3FF', 1.5) + line('M4 41 Q11 43 17 41', O, 1.5) + p('M24 46 Q30 54 36 50 Q32 46 24 46 Z', '#3F7FC7', 1.5) + `<circle cx="13" cy="35" r="2" fill="${O}"/>` + shine(24, 28, 7, 2.5) },
    topf: { w: 'Topf', syl: 'Topf', svg: rect(4, 29, 9, 5, '#8E96B5', 2) + rect(51, 29, 9, 5, '#8E96B5', 2) + rect(11, 25, 42, 30, GRY, 4) + p('M9 26 Q32 12 55 26 Z', '#C9CEDD') + ci(32, 16, 3, '#8E96B5') + shine(20, 34, 2, 6) },
  };
  const svgOf = (id) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${PICS[id].svg}</svg>`;
  // the picture in the task, with its name for the read-aloud voice (it reads .prompt, not the drawing)
  const picOf = (id) => `<div class="pic" style="max-width:130px">${svgOf(id)}</div><span class="prompt sr-only">${PICS[id].w}</span>`;
  const optPic = (id) => `${svgOf(id)}<span class="sr-only">${PICS[id].w}</span>`;
  const PIC_IDS = Object.keys(PICS);
  const first = (id) => PICS[id].w[0];
  const LETTERS = [...new Set(PIC_IDS.map(first))];

  /* ================= KLASSE 1: Laute und Buchstaben ================= */
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const VOW = ['A', 'E', 'I', 'O', 'U'], UML = { Ä: 'A', Ö: 'O', Ü: 'U' };
  const CONS = 'BDFGHKLMNPRSTWZ'.split('');
  // Lautposition: the letter is heard exactly once in the word
  const LAUTPOS = [['mond', 'M', 0], ['baum', 'M', 2], ['tomate', 'M', 1], ['maus', 'S', 2], ['haus', 'H', 0], ['haus', 'S', 2], ['ball', 'B', 0], ['ball', 'L', 2],
    ['fisch', 'F', 0], ['tisch', 'T', 0], ['igel', 'G', 1], ['igel', 'L', 2], ['ente', 'N', 1], ['rakete', 'R', 0], ['rakete', 'K', 1], ['leiter', 'L', 0], ['kerze', 'Z', 1],
    ['kerze', 'K', 0], ['wolke', 'L', 1], ['wolke', 'W', 0], ['hut', 'T', 2], ['hut', 'H', 0], ['gabel', 'B', 1], ['gabel', 'L', 2], ['pilz', 'L', 1], ['pilz', 'P', 0], ['zitrone', 'Z', 0],
    ['krone', 'N', 1], ['nest', 'N', 0], ['nest', 'T', 2], ['blume', 'M', 1], ['topf', 'F', 2], ['sonne', 'S', 0], ['wal', 'W', 0], ['wal', 'L', 2], ['apfel', 'A', 0], ['apfel', 'L', 2], ['tasse', 'T', 0], ['herz', 'H', 0], ['herz', 'Z', 2]];
  const POS = ['am Anfang', 'in der Mitte', 'am Ende'];
  const SILBEN = PIC_IDS.map((id) => [PICS[id].w, PICS[id].syl, id]).concat([['Schule', 'Schu-le'], ['Tafel', 'Ta-fel'], ['Fenster', 'Fens-ter'], ['Hund', 'Hund'], ['Kinder', 'Kin-der'],
    ['Lineal', 'Li-ne-al'], ['Elefant', 'E-le-fant'], ['Papagei', 'Pa-pa-gei'], ['Bus', 'Bus'], ['Stift', 'Stift'], ['Mama', 'Ma-ma'], ['Kakao', 'Ka-ka-o'], ['Giraffe', 'Gi-raf-fe'],
    ['Sofa', 'So-fa'], ['Hose', 'Ho-se'], ['Schaf', 'Schaf'], ['Melone', 'Me-lo-ne'], ['Garten', 'Gar-ten'], ['Brot', 'Brot'], ['Schokolade', 'Scho-ko-la-de']]);
  const SYL = ['1 Silbe', '2 Silben', '3 Silben', '4 Silben'];
  // rhyme groups: words of one group rhyme, words of different groups don't
  const REIME = [['Haus', 'Maus', 'Laus'], ['Hand', 'Sand', 'Wand'], ['Topf', 'Kopf', 'Knopf'], ['Ball', 'Stall', 'Knall'], ['Fisch', 'Tisch'], ['Hose', 'Rose', 'Dose'],
    ['Nase', 'Hase', 'Vase'], ['Bein', 'Stein', 'Schwein'], ['Kuh', 'Schuh'], ['Baum', 'Traum', 'Schaum'], ['Krone', 'Zitrone', 'Bohne'], ['Tanne', 'Kanne', 'Pfanne'],
    ['Hut', 'gut', 'Mut'], ['Zug', 'Krug'], ['Nest', 'Fest'], ['Bett', 'nett'], ['Sonne', 'Tonne'], ['Ei', 'zwei', 'drei'], ['Brot', 'rot', 'Boot'], ['Wal', 'Schal']];
  const PIC_REIME = [['haus', 'maus'], ['fisch', 'tisch'], ['krone', 'zitrone']];
  // first vowel of a picture word, if it is a single vowel (not au, ei, ie)
  const vowelGap = (w) => { const i = w.search(/[aeiou]/i); return /^(au|ei|eu|ie)/i.test(w.slice(i, i + 2)) ? null : i; };
  const DIPH = { haus: 'au', maus: 'au', baum: 'au', leiter: 'ei' };

  const L1_ITEMS = {
    anlaut: PIC_IDS.map((id) => ({ id: 'l1an_' + id, make: (qid) => choice('anlaut', 1, 'anlaut', 'Mit welchem Buchstaben fängt das Wort an?', first(id), others(LETTERS, [first(id)], 2), qid, { pic: picOf(id), why: `${PICS[id].w} fängt mit ${first(id)} an.` }) })),
    anlaut2: PIC_IDS.map((id) => ({ id: 'l1ab_' + id, make: (qid) => { const wrong = []; for (const x of shuffle(PIC_IDS)) if (wrong.length < 2 && first(x) !== first(id) && !wrong.some((y) => first(y) === first(x))) wrong.push(x);
      return choice('anlaut', 2, 'anlaut', `Welches Bild fängt mit ${first(id)} an?`, optPic(id), wrong.map(optPic), qid, { svgOpts: true, cols: 1, why: `${PICS[id].w} fängt mit ${first(id)} an.` }); } })),
    laute: VOW.map((v) => ({ id: 'l1sl_' + v, make: (qid) => choice('laute', 1, 'laute', 'Welcher Buchstabe ist ein Selbstlaut?', v, others(CONS, [], 2), qid, { why: 'Selbstlaute sind A, E, I, O, U.' }) }))
      .concat(CONS.map((c) => ({ id: 'l1ml_' + c, make: (qid) => choice('laute', 1, 'laute', 'Welcher Buchstabe ist ein Mitlaut?', c, others(VOW, [], 2), qid, { why: `${c} ist ein Mitlaut. Selbstlaute sind A, E, I, O, U.` }) })))
      .concat(Object.keys(UML).map((u) => ({ id: 'l1ul_' + u, make: (qid) => choice('laute', 1, 'laute', 'Welcher Buchstabe ist ein Umlaut?', u, [UML[u], pick(CONS)], qid, { why: 'Umlaute haben zwei Punkte: Ä, Ö, Ü.' }) })))
      .concat(VOW.concat(Object.keys(UML), others(CONS, [], 6)).map((x) => ({ id: 'l1la_' + x, make: (qid) => { const a = VOW.includes(x) ? 'Selbstlaut' : UML[x] ? 'Umlaut' : 'Mitlaut';
        return choice('laute', 1, 'laute', `Was für ein Buchstabe ist das ${x}?`, a, ['Selbstlaut', 'Mitlaut', 'Umlaut'].filter((y) => y !== a), qid); } }))),
    laute2: PIC_IDS.filter((id) => DIPH[id] || vowelGap(PICS[id].w) !== null).map((id) => ({ id: 'l1fv_' + id, make: (qid) => {
      const w = PICS[id].w; const d = DIPH[id]; const i = d ? w.indexOf(d) : vowelGap(w); const v = d || w[i];
      // the gapped word gets its own line (in the question it would wrap at the gap); „__“ is read as „Lücke“
      const pic = `<div class="expr">${w.slice(0, i)}<span style="display:inline-block;width:1.1em;border-bottom:4px solid var(--blue);color:transparent">__</span>${w.slice(i + v.length)}</div>${picOf(id)}`;
      const vs = d ? ['au', 'ei', 'eu'] : i === 0 ? VOW : VOW.map((x) => x.toLowerCase());
      return choice('laute', 2, 'laute', d ? 'Welcher Zwielaut fehlt?' : 'Welcher Selbstlaut fehlt?', v, others(vs, [v], 2), qid, { pic, why: `Es heißt: ${w}.` });
    } })),
    lautpos: LAUTPOS.map(([id, l, pos]) => ({ id: 'l1lp_' + id + l, make: (qid) => choice('lautpos', 1, 'lautpos', `Wo hörst du das ${l} in „${PICS[id].w}“?`, POS[pos], POS.filter((_, j) => j !== pos), qid, { pic: picOf(id) }) })),
    silben: SILBEN.map(([w, syl, id]) => ({ id: 'l1si_' + w, make: (qid) => { const n = syl.split('-').length; const a = SYL[n - 1];
      return choice('silben', 1, 'silben', `Wie viele Silben hat „${w}“?`, a, others(n === 4 ? SYL : SYL.slice(0, 3), [a], 2), qid, Object.assign({ why: `${syl}: ${a}.` }, id ? { pic: picOf(id) } : {})); } })),
    alphabet: ABC.slice(1, 24).map((x, i) => ({ id: 'l1na_' + x, make: (qid) => choice('alphabet', 1, 'alphabet', `Welcher Buchstabe kommt nach ${x}?`, ABC[i + 2], [ABC[i], ABC[i + 3]], qid, { why: `${ABC[i]}, ${x}, ${ABC[i + 2]}` }) }))
      .concat(ABC.slice(2, 25).map((x, i) => ({ id: 'l1vo_' + x, make: (qid) => choice('alphabet', 1, 'alphabet', `Welcher Buchstabe kommt vor ${x}?`, ABC[i + 1], [ABC[i + 3], ABC[i]], qid, { why: `${ABC[i + 1]}, ${x}, ${ABC[i + 3]}` }) }))),
    alphabet2: ABC.slice(1, 22).map((x, j) => { const i = j + 1; return { id: 'l1fe_' + ABC[i + 2], make: (qid) => choice('alphabet', 2, 'alphabet', `Welcher Buchstabe fehlt? ${ABC[i]}, ${ABC[i + 1]}, ___, ${ABC[i + 3]}`, ABC[i + 2], [ABC[i - 1], ABC[i + 4]], qid, { why: ABC.slice(i, i + 4).join(', ') }) }; }),
    reim: REIME.flatMap((g, gi) => g.map((w) => ({ id: 'l1re_' + w, make: (qid) => {
      const wrong = shuffle(REIME.filter((_, j) => j !== gi)).slice(0, 2).map((x) => pick(x));
      return choice('reim', 1, 'reim', `Was reimt sich auf „${w}“?`, pick(g.filter((x) => x !== w)), wrong, qid);
    } })))
      .concat(PIC_REIME.flatMap((pair) => pair.map((id) => ({ id: 'l1rb_' + id, make: (qid) => { const partner = pair.find((x) => x !== id);
        const wrong = others(PIC_IDS, PIC_REIME.find((x) => x.includes(id)), 2);
        return choice('reim', 1, 'reim', `Was reimt sich auf „${PICS[id].w}“?`, optPic(partner), wrong.map(optPic), qid, { svgOpts: true, cols: 1, pic: picOf(id), why: `${PICS[id].w} – ${PICS[partner].w}` }); } })))),
  };
  const L1_NOTES = {
    anlaut: { title: 'Der Anlaut', lines: ['Der Anlaut ist der erste Laut in einem Wort.', 'Sprich das Wort langsam und deutlich: Mmmond. Du hörst zuerst ein M.', 'In der Anlauttabelle findest du zu jedem Buchstaben ein Bild.'] },
    laute: { title: 'Selbstlaute, Umlaute, Mitlaute', lines: ['Selbstlaute: A, E, I, O, U. Man kann sie lange singen: Aaaa.', 'Umlaute haben zwei Punkte: Ä, Ö, Ü.', 'Zwielaute sind zwei Selbstlaute, die zusammen klingen: au, ei, eu.', 'Alle anderen Buchstaben sind Mitlaute: B, M, S, T …'] },
    lautpos: { title: 'Wo hörst du den Laut?', lines: ['Sprich das Wort langsam, Laut für Laut: M-o-n-d.', 'Hörst du den Laut zuerst? Dann ist er am Anfang.', 'Hörst du ihn zuletzt? Dann ist er am Ende. Sonst ist er in der Mitte.'] },
    silben: { title: 'Silben', lines: ['Sprich das Wort und klatsche bei jeder Silbe: Ba-na-ne.', 'Jedes Klatschen ist eine Silbe. Banane hat 3 Silben.', 'In jeder Silbe steckt ein Selbstlaut, ein Umlaut oder ein Zwielaut.'] },
    alphabet: { title: 'Das Abc', lines: ['Das Abc hat 26 Buchstaben, von A bis Z.', 'A, B, C, D, E, F, G, H, I, J, K, L, M,', 'N, O, P, Q, R, S, T, U, V, W, X, Y, Z.', 'Sing das Abc-Lied, dann findest du den Nachbarn.'] },
    reim: { title: 'Reimwörter', lines: ['Reimwörter klingen am Ende gleich: Haus – Maus.', 'Nur der Anfang ist anders: H-aus, M-aus.', 'Sprich beide Wörter laut. Klingt das Ende gleich?'] },
  };
  const L1_TUT = {
    'anlaut:1': { title: 'Der erste Buchstabe', steps: ['Schau dir das Bild an. Wie heißt das Ding?', 'Sprich das Wort langsam. Welchen Laut hörst du zuerst?', 'Beispiel: Sonne. Sssonne. Zuerst hörst du ein S.', 'Tippe auf den Buchstaben.'] },
    'anlaut:2': { title: 'Das passende Bild', steps: ['Ein Buchstabe ist vorgegeben.', 'Sprich zu jedem Bild das Wort. Welches fängt mit dem Buchstaben an?', 'Beispiel: M. Mond fängt mit M an, Ball und Sonne nicht.', 'Tippe auf das Bild.'] },
    'laute:1': { title: 'Selbstlaut oder Mitlaut', steps: ['Selbstlaute sind A, E, I, O, U.', 'Umlaute haben zwei Punkte: Ä, Ö, Ü. Alle anderen sind Mitlaute.', 'Beispiel: M ist ein Mitlaut, O ist ein Selbstlaut.', 'Tippe auf die richtige Antwort.'] },
    'laute:2': { title: 'Der fehlende Laut', steps: ['Im Wort fehlt ein Selbstlaut oder ein Zwielaut.', 'Sprich das Wort zum Bild langsam. Was hörst du an der Lücke?', 'Beispiel: M__nd. Mooond. Es fehlt ein o.', 'Tippe auf den fehlenden Laut.'] },
    'lautpos:1': { title: 'Wo hörst du den Laut?', steps: ['Sprich das Wort langsam, Laut für Laut.', 'Ist der Laut ganz vorn, ganz hinten oder in der Mitte?', 'Beispiel: M in Baum. B-au-m. Das M hörst du am Ende.', 'Tippe auf die richtige Stelle.'] },
    'silben:1': { title: 'Silben klatschen', steps: ['Sprich das Wort und klatsche dazu.', 'Jedes Klatschen ist eine Silbe.', 'Beispiel: To-ma-te. Dreimal klatschen, also 3 Silben.', 'Tippe auf die richtige Zahl.'] },
    'alphabet:1': { title: 'Das Abc', steps: ['Sag das Abc auf, bis du zum Buchstaben kommst.', 'Welcher Buchstabe kommt direkt davor, welcher direkt danach?', 'Beispiel: nach D kommt E. Vor D kommt C.', 'Tippe auf den Buchstaben.'] },
    'alphabet:2': { title: 'Lücke im Abc', steps: ['In der Reihe fehlt ein Buchstabe.', 'Sag die Reihe auf und hör auf die Lücke.', 'Beispiel: D, E, __, G. Es fehlt das F.', 'Tippe auf den fehlenden Buchstaben.'] },
    'reim:1': { title: 'Reimwörter', steps: ['Reimwörter klingen am Ende gleich.', 'Sprich das Wort und jede Antwort laut.', 'Beispiel: Haus reimt sich auf Maus, nicht auf Hund.', 'Tippe auf das Reimwort.'] },
  };
  const L1_MODULES = {
    anlaut: { name: 'Erster Buchstabe', icon: '🔤', maxTier: 2, worldCap: [2], dmg: 12 },
    laute: { name: 'Selbstlaut und Mitlaut', icon: '🔡', maxTier: 2, worldCap: [2], dmg: 12 },
    lautpos: { name: 'Wo hörst du den Laut?', icon: '👂', maxTier: 1, worldCap: [1], dmg: 14 },
    silben: { name: 'Silben klatschen', icon: '🥁', maxTier: 1, worldCap: [1], dmg: 12 },
    alphabet: { name: 'Das Abc', icon: '🔠', maxTier: 2, worldCap: [2], dmg: 12 },
    reim: { name: 'Reimwörter', icon: '🎵', maxTier: 1, worldCap: [1], dmg: 14 },
  };
  const LAUTE1 = Object.assign({}, set, { grade: 1, title: 'Laute und Buchstaben', icon: '🔤', sub: 'Erster Buchstabe, Selbstlaute, Silben, das Abc und Reimwörter',
    modules: L1_MODULES, tut: L1_TUT, notes: L1_NOTES, pool: [],
    starters: hero([{ name: 'Anlauttabelle', mod: 'anlaut' }, { name: 'Silbenklatschen', mod: 'silben' }, { name: 'Abc-Lied', mod: 'alphabet' }, { name: 'Kinderreim', mod: 'reim' }]),
    extra: { anlaut: 'Anlauttabelle', laute: 'Buchstabenhaus', lautpos: 'Lautgebärde', silben: 'Silbenklatschen', alphabet: 'Abc-Lied', reim: 'Kinderreim' },
    events: [
      { title: 'Die Buchstabenkiste', text: 'Frau Klein hat eine Kiste mit Buchstaben aus Holz. Sie hält ein Bild hoch und fragt nach dem ersten Buchstaben. Wer ihn findet, bekommt einen Trank.', opts: [{ label: 'Antworten', task: 'anlaut', win: { item: 'trank' }, lose: { hp: -4 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Morgenkreis', text: 'Im Morgenkreis klatscht die Klasse Silben. Jetzt bist du dran. Klappt es, bekommst du einen Schild.', opts: [{ label: 'Klatschen', task: 'silben', win: { item: 'schild' }, lose: { hp: -4 } }, { label: 'Zuschauen', effect: {} }] },
      { title: 'Das Gedicht an der Tafel', text: 'An der Tafel steht ein Gedicht. Am Ende einer Zeile fehlt das Reimwort. Findest du es, klebt Frau Klein dir ein Fleißbienchen ins Heft.', opts: [{ label: 'Reimwort suchen', task: 'reim', win: { item: 'stern' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Buchstabenreihe', text: 'Über der Tafel hängen die Buchstaben von A bis Z. Einer ist heruntergefallen. Hängst du ihn an die richtige Stelle, bekommst du eine Lupe.', opts: [{ label: 'Aufhängen', task: 'alphabet', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Liegen lassen', effect: {} }] },
      { title: 'Der Hörtest', text: 'Die Schulärztin sagt Wörter ganz leise. Du sollst sagen, wo du einen Laut hörst. Für die richtige Antwort gibt es einen Keks.', opts: [{ label: 'Zuhören', task: 'lautpos', win: { item: 'keks' }, lose: { xp: 5 } }, { label: 'Später', effect: {} }] },
      { title: 'Die Leseecke', text: 'In der Leseecke liegen Kissen und Bilderbücher. Du ruhst dich aus.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
    ] });
  LAUTE1.gen = (mod, tier, know, seq) => {
    const key = mod + (tier === 2 ? '2' : ''); const items = L1_ITEMS[key] || L1_ITEMS[mod];
    return items ? ask(items, know, seq) : null;
  };

  /* ================= KLASSE 2: Richtig schreiben ================= */
  // [richtig, falsch, Merkmal]
  const BESONDERS = [['Stuhl', 'Schtuhl', 'st'], ['Stein', 'Schtein', 'st'], ['Straße', 'Schtraße', 'st'], ['stehen', 'schtehen', 'st'], ['Stift', 'Schtift', 'st'], ['Stern', 'Schtern', 'st'],
    ['Spinne', 'Schpinne', 'sp'], ['springen', 'schpringen', 'sp'], ['Sport', 'Schport', 'sp'], ['Spiegel', 'Schpiegel', 'sp'],
    ['Bank', 'Bangk', 'nk'], ['Onkel', 'Ongkel', 'nk'], ['trinken', 'tringken', 'nk'], ['Schrank', 'Schrangk', 'nk'], ['danken', 'dangken', 'nk'], ['krank', 'krangk', 'nk'],
    ['Quelle', 'Kwelle', 'qu'], ['Qualle', 'Kwalle', 'qu'], ['quaken', 'kwaken', 'qu'], ['Quark', 'Kwark', 'qu'], ['bequem', 'bekwem', 'qu'],
    ['Hexe', 'Hekse', 'x'], ['Taxi', 'Taksi', 'x'], ['Nixe', 'Nikse', 'x'], ['boxen', 'boksen', 'x'], ['Axt', 'Akst', 'x'],
    ['Wiese', 'Wise', 'ie'], ['Liebe', 'Libe', 'ie'], ['Brief', 'Brif', 'ie'], ['Riese', 'Rise', 'ie'], ['Ziege', 'Zige', 'ie'], ['fliegen', 'fligen', 'ie'], ['sieben', 'siben', 'ie'], ['tief', 'tif', 'ie'], ['Papier', 'Papir', 'ie'],
    ['Kiste', 'Kieste', 'i'], ['Tinte', 'Tiente', 'i'], ['Pinsel', 'Piensel', 'i'], ['Kinder', 'Kiender', 'i'], ['Winter', 'Wienter', 'i'], ['finden', 'fienden', 'i']];
  const WHY_B = { st: 'Am Anfang hörst du scht, du schreibst st.', sp: 'Am Anfang hörst du schp, du schreibst sp.', nk: 'Du hörst ngk, du schreibst nk.', qu: 'Du hörst kw, du schreibst qu.',
    x: 'Hier schreibt man für ks ein x. Das Wort merkst du dir.', ie: 'Das i klingt lang. Dann schreibst du meist ie.', i: 'Das i klingt kurz. Dann schreibst du nur i.' };
  // [richtig, falsch, Erklärung]
  const DOPPEL = [['Affe', 'Afe', 'Af-fe'], ['Tasse', 'Tase', 'Tas-se'], ['Himmel', 'Himel', 'Him-mel'], ['kommen', 'komen', 'kom-men'], ['Sonne', 'Sone', 'Son-ne'], ['Wasser', 'Waser', 'Was-ser'],
    ['Teller', 'Teler', 'Tel-ler'], ['Mutter', 'Muter', 'Mut-ter'], ['Suppe', 'Supe', 'Sup-pe'], ['Puppe', 'Pupe', 'Pup-pe'], ['Brille', 'Brile', 'Bril-le'], ['Butter', 'Buter', 'But-ter'],
    ['schwimmen', 'schwimen', 'schwim-men'], ['essen', 'esen', 'es-sen'], ['Hammer', 'Hamer', 'Ham-mer'], ['Wolle', 'Wole', 'Wol-le'], ['Ball', 'Bal', 'die Bäl-le'], ['Bett', 'Bet', 'die Bet-ten'],
    ['Nuss', 'Nus', 'die Nüs-se'], ['Fell', 'Fel', 'die Fel-le'], ['toll', 'tol', 'tol-le'], ['Schiff', 'Schif', 'die Schif-fe'],
    ['Hose', 'Hosse', 'Ho-se'], ['Name', 'Namme', 'Na-me'], ['Blume', 'Blumme', 'Blu-me'], ['Nase', 'Nasse', 'Na-se'], ['Igel', 'Iggel', 'I-gel']];
  const whyDoppel = (r, s) => (s.startsWith('die ') || r === 'toll' ? `Verlängere das Wort: ${s}. Jetzt hörst du den kurzen Selbstlaut.` : /(.)\1/.test(r) ? `Sprich in Silben: ${s}. Der Selbstlaut ist kurz, der Mitlaut steht doppelt.` : `Sprich in Silben: ${s}. Der Selbstlaut ist lang, der Mitlaut steht nur einmal.`);
  // [Wort, Verlängerung]
  const VERL = [['Hund', 'die Hun-de'], ['Wald', 'die Wäl-der'], ['Kind', 'die Kin-der'], ['Mund', 'die Mün-der'], ['Pferd', 'die Pfer-de'], ['Bild', 'die Bil-der'], ['Hand', 'die Hän-de'],
    ['Rad', 'die Rä-der'], ['Brot', 'die Bro-te'], ['Hut', 'die Hü-te'], ['Zelt', 'die Zel-te'], ['Berg', 'die Ber-ge'], ['Zug', 'die Zü-ge'], ['Tag', 'die Ta-ge'], ['Weg', 'die We-ge'],
    ['Korb', 'die Kör-be'], ['Dieb', 'die Die-be'], ['Kalb', 'die Käl-ber'], ['Schrank', 'die Schrän-ke'], ['Bank', 'die Bän-ke'], ['gelb', 'der gel-be Ball'], ['klug', 'das klu-ge Kind'],
    ['rund', 'der run-de Tisch'], ['lieb', 'der lie-be Hund'], ['Zwerg', 'die Zwer-ge'], ['Licht', 'die Lich-ter']];
  const PAIR = { d: 't', t: 'd', g: 'k', k: 'g', b: 'p', p: 'b' };
  // [richtig, falsch, verwandtes Wort mit a/au]
  const ABLEIT = [['Bäume', 'Beume', 'der Baum'], ['Häuser', 'Heuser', 'das Haus'], ['Mäuse', 'Meuse', 'die Maus'], ['Träume', 'Treume', 'der Traum'], ['Räuber', 'Reuber', 'rauben'],
    ['Äpfel', 'Epfel', 'der Apfel'], ['Äste', 'Este', 'der Ast'], ['Hände', 'Hende', 'die Hand'], ['Wälder', 'Welder', 'der Wald'], ['Gläser', 'Gleser', 'das Glas'], ['Bälle', 'Belle', 'der Ball'],
    ['Dächer', 'Decher', 'das Dach'], ['Räder', 'Reder', 'das Rad'], ['älter', 'elter', 'alt'], ['wärmer', 'wermer', 'warm'], ['Gänse', 'Gense', 'die Gans'], ['Zähne', 'Zehne', 'der Zahn'], ['Läuse', 'Leuse', 'die Laus']];
  // the [marked] word is a Nomen (n) or Name (e) and never starts the sentence
  const GROSS = [['Der [Hund] bellt laut.', 'n'], ['Mia isst einen [Apfel].', 'n'], ['Heute scheint die [Sonne].', 'n'], ['Im Garten blüht eine [Blume].', 'n'], ['Wir fahren mit dem [Bus].', 'n'],
    ['Papa kauft einen [Kuchen].', 'n'], ['Am Abend lese ich ein [Buch].', 'n'], ['Die [Maus] frisst Käse.', 'n'], ['Morgen besucht [Tom] seine Oma.', 'e'], ['Mein Bruder heißt [Paul].', 'e'],
    ['Wir wohnen in [Dresden].', 'e'], ['Lena malt ein großes [Haus].', 'n'], ['Das [Kind] baut eine Burg.', 'n'], ['Oma trägt einen roten [Schal].', 'n'], ['Auf dem Dach singt ein [Vogel].', 'n'],
    ['Im Winter fällt viel [Schnee].', 'n'], ['Ben wohnt an der [Elbe].', 'e'], ['Heute kommt [Frau Richter] zu Besuch.', 'e'], ['Der kleine [Igel] schläft.', 'n'], ['Ich trinke gern [Milch].', 'n']];
  const SATZZ = [['Ich gehe heute in die Schule', '.'], ['Der Hund schläft im Korb', '.'], ['Mama kocht eine Suppe', '.'], ['Wir haben zwei Hasen', '.'], ['Im Sommer ist es warm', '.'], ['Lisa malt einen Baum', '.'],
    ['Wie heißt du', '?'], ['Wo wohnst du', '?'], ['Kommst du mit', '?'], ['Hast du einen Stift', '?'], ['Was malst du', '?'], ['Wann beginnt die Pause', '?'],
    ['Pass auf', '!'], ['Komm schnell her', '!'], ['Hör mir zu', '!'], ['Mach bitte die Tür zu', '!'], ['Hilfe', '!'], ['Räum dein Zimmer auf', '!']];
  const MARKS = { '.': 'Punkt .', '?': 'Fragezeichen ?', '!': 'Ausrufezeichen !' };
  const WHY_Z = { '.': 'Der Satz erzählt etwas. Am Ende steht ein Punkt.', '?': 'Der Satz fragt etwas. Am Ende steht ein Fragezeichen.', '!': 'Der Satz ist eine Bitte, eine Aufforderung oder ein Ruf. Am Ende steht ein Ausrufezeichen.' };
  // Wörterbuch: in each group the second letters differ, no umlaut in the first two letters
  const ABC_WORDS = { A: ['Affe', 'Ameise', 'Apfel', 'Arm', 'Auto'], B: ['Ball', 'Bett', 'Biene', 'Boot', 'Brot', 'Buch'], F: ['Fahrrad', 'Feder', 'Fisch', 'Fuchs', 'Frosch', 'Flasche'],
    H: ['Hase', 'Heft', 'Himmel', 'Hose', 'Hund'], K: ['Kamm', 'Kerze', 'Kind', 'Krone', 'Kuh', 'Kleid'], L: ['Lampe', 'Leiter', 'Licht', 'Loch', 'Luft'], M: ['Maus', 'Mehl', 'Milch', 'Mond', 'Mund'],
    N: ['Nase', 'Nest', 'Nixe', 'Nudel'], R: ['Rad', 'Regen', 'Ring', 'Rose', 'Rutsche'], S: ['Sand', 'Seife', 'Sieb', 'Sonne', 'Suppe'], T: ['Tasse', 'Teller', 'Tisch', 'Tomate', 'Turm', 'Traum'],
    W: ['Wal', 'Wetter', 'Wiese', 'Wolke', 'Wurm'], D: ['Dach', 'Dino', 'Dose', 'Drache'], G: ['Gabel', 'Geld', 'Gras', 'Glas', 'Gurke'], P: ['Papa', 'Pferd', 'Pilz', 'Post', 'Puppe'] };
  const abcKey = (w) => w.slice(0, 2).toLowerCase();
  function abcOrder(tier) {
    let words;
    if (tier === 2) { const g = pick(Object.values(ABC_WORDS).filter((x) => x.length >= 4)); words = shuffle(g).slice(0, 4); }
    else words = shuffle(Object.keys(ABC_WORDS)).slice(0, 4).map((l) => pick(ABC_WORDS[l]));
    words.sort((a, b) => (abcKey(a) < abcKey(b) ? -1 : 1));
    const items = words.map((w) => ({ id: 'w_' + w, text: w }));
    return { kind: 'order', mod: 'alphabet', tier, group: 'alphabet:' + tier, note: 'alphabet', q: tier === 2 ? 'Ordne nach dem Abc. Schau auf den zweiten Buchstaben.' : 'Tippe die Wörter nach dem Abc an.', items, order: items.map((x) => x.id), display: shuffle(items), qid: 's2abc_' + words.join('_') };
  }
  function abcFirst() {
    const words = shuffle(Object.keys(ABC_WORDS)).slice(0, 3).map((l) => pick(ABC_WORDS[l])); const a = words.slice().sort((x, y) => (abcKey(x) < abcKey(y) ? -1 : 1))[0];
    return choice('alphabet', 1, 'alphabet', 'Welches Wort steht im Wörterbuch zuerst?', a, words.filter((w) => w !== a), 's2abf_' + words.slice().sort().join('_'), { why: `${a[0]} kommt im Abc zuerst.` });
  }
  // häufige kleine Wörter (Funktionswörter aus dem Rechtschreibrahmen): [Satz mit ___, richtig, falsch]
  const KLEIN = [['Tim ___ Lea malen ein Bild.', 'und', 'unt'], ['Ich gehe ___ Mama einkaufen.', 'mit', 'mitt'], ['Das ___ mein Ball.', 'ist', 'is'], ['Ich kann das ___.', 'nicht', 'nich'],
    ['Ich will ___ mit.', 'auch', 'auh'], ['Möchtest du Saft ___ Tee?', 'oder', 'oda'], ['___ gehen wir nach Hause.', 'Dann', 'Dan'], ['Das ist ___ Fahrrad.', 'mein', 'main'],
    ['Der Hund wohnt ___.', 'hier', 'hir'], ['___ heißt du?', 'Wie', 'Wi'], ['Wo ist ___ Tasche?', 'die', 'di'], ['Ich ___ sieben Jahre alt.', 'bin', 'bien'], ['___ spielen Fußball.', 'Wir', 'Wier'],
    ['Gib ___ bitte das Buch.', 'mir', 'mier'], ['Ich habe ___ Hunger.', 'immer', 'imer'], ['Der Ball liegt ___ dem Bett.', 'unter', 'unta'], ['Die Lampe hängt ___ dem Tisch.', 'über', 'üba'],
    ['Das Buch ist ___ Opa.', 'von', 'fon'], ['___ wohnst du?', 'Wo', 'Woh'], ['Lisa ist ___ da.', 'schon', 'schohn'], ['Ich möchte ___ Eis.', 'mehr', 'mer'], ['Das Geschenk ist ___ dich.', 'für', 'führ'],
    ['___ ist mein Freund.', 'Er', 'Ehr'], ['Wir gehen ___ Hause.', 'zu', 'zuh'], ['Ich male ___ Bild.', 'ein', 'ain'], ['Was machst ___ da?', 'du', 'duh'], ['Ich habe ___ Hund.', 'einen', 'ainen'],
    ['Das Eis ist ___ für dich.', 'nur', 'nuhr'], ['Ich bin ___ dir.', 'bei', 'bai'], ['Wir fahren ___ das Meer.', 'an', 'ann']];
  const S2_POOL = [];
  BESONDERS.forEach(([r, f, k]) => S2_POOL.push({ id: 's2be_' + r, mod: 'besonders', g: k === 'ie' || k === 'i' ? 'ie' : 'besonders', q: 'Welches Wort ist richtig geschrieben?', o: [r, f], a: 0, why: WHY_B[k] }));
  DOPPEL.forEach(([r, f, s]) => S2_POOL.push({ id: 's2dk_' + r, mod: 'doppel', g: 'doppel', q: 'Welches Wort ist richtig geschrieben?', o: [r, f], a: 0, why: whyDoppel(r, s) }));
  VERL.forEach(([w, l]) => { const x = w.slice(-1); S2_POOL.push({ id: 's2vl_' + w, mod: 'verl', g: 'verl', q: `Welcher Buchstabe fehlt? ${w.slice(0, -1)}___`, o: [x, PAIR[x]], a: 0, why: `${l}: Jetzt hörst du ein ${x}.`, tip: `Verlängere das Wort: ${l}` }); });
  ABLEIT.forEach(([r, f, b]) => S2_POOL.push({ id: 's2ab_' + r, t: 2, mod: 'verl', g: 'verl', q: 'Welches Wort ist richtig geschrieben?', o: [r, f], a: 0, why: `Es kommt von ${b}.`, tip: `Denk an ${b}.` }));
  GROSS.forEach(([s, k]) => { const word = s.match(/\[(.+?)\]/)[1]; const ok = s.replace(`[${word}]`, word);
    S2_POOL.push({ id: 's2gs_' + ok, mod: 'gross', g: 'gross', q: 'Welcher Satz ist richtig geschrieben?', o: [ok, ok[0].toLowerCase() + ok.slice(1), s.replace(`[${word}]`, word.toLowerCase())], a: 0,
      why: `Groß schreibt man den Satzanfang und ${k === 'e' ? 'Namen' : 'Nomen'} wie „${word}“.` }); });
  SATZZ.forEach(([s, m]) => S2_POOL.push({ id: 's2sz_' + s, mod: 'satzz', g: 'satzz', q: `Welches Zeichen fehlt? ${s}___`, o: [MARKS[m]].concat(Object.values(MARKS).filter((x) => x !== MARKS[m])), a: 0, why: WHY_Z[m] }));
  KLEIN.forEach(([s, r, f]) => S2_POOL.push({ id: 's2kw_' + r, mod: 'kleinw', g: 'kleinw', q: `Welches Wort ist richtig? ${s}`, o: [r, f], a: 0 }));
  const S2_NOTES = {
    besonders: { title: 'st, sp, nk, qu, x', lines: ['Am Wortanfang hörst du scht und schp, du schreibst st und sp: Stuhl, Spinne.', 'Du hörst ngk, du schreibst nk: Bank, trinken.', 'Du hörst kw, du schreibst qu: Quelle.', 'Für ks steht in manchen Wörtern ein x: Hexe, Taxi.'] },
    ie: { title: 'i oder ie', lines: ['Sprich das Wort in Silben: Wie-se, Kis-te.', 'Klingt das i lang, schreibst du meist ie: Wiese, Liebe.', 'Klingt das i kurz, schreibst du nur i: Kiste, Pinsel.'] },
    doppel: { title: 'Doppelte Mitlaute', lines: ['Sprich das Wort in Silben: Son-ne.', 'Ist der Selbstlaut kurz, hörst du den Mitlaut in beiden Silben. Du schreibst ihn doppelt: Sonne.', 'Ist der Selbstlaut lang, schreibst du ihn nur einmal: Ho-se.', 'Bei kurzen Wörtern hilft Verlängern: Ball, die Bäl-le.'] },
    verl: { title: 'Verlängern und ableiten', lines: ['Am Wortende klingen d und t, g und k, b und p gleich.', 'Verlängere das Wort, dann hörst du den Unterschied: der Hund, die Hun-de. Bei gelb hilft: der gel-be Ball.', 'Hörst du e oder eu, kann es auch ä oder äu sein. Such ein verwandtes Wort mit a oder au.', 'Baum, also Bäume. Apfel, also Äpfel. Gibt es keins, schreibst du e oder eu.'] },
    gross: { title: 'Groß schreiben', lines: ['Den Satzanfang schreibt man groß.', 'Nomen schreibt man groß: der Hund, die Blume. Vor ein Nomen passt der, die oder das.', 'Namen schreibt man groß: Tom, Frau Richter, Dresden, die Elbe.'] },
    satzz: { title: 'Satzzeichen', lines: ['Am Ende eines Satzes steht ein Satzschlusszeichen.', 'Punkt: Der Satz erzählt etwas. Ich male ein Bild.', 'Fragezeichen: Der Satz fragt etwas. Wie heißt du?', 'Ausrufezeichen: eine Bitte, eine Aufforderung oder ein Ruf. Komm her!'] },
    alphabet: { title: 'Das Wörterbuch', lines: ['Im Wörterbuch stehen die Wörter nach dem Abc.', 'Zuerst zählt der erste Buchstabe: Apfel, Ball, Fisch.', 'Ist er gleich, zählt der zweite: Ball, Bett, Biene, Brot.'] },
    kleinw: { title: 'Häufige kleine Wörter', lines: ['Kleine Wörter wie und, mit, nicht und ist kommen in fast jedem Text vor.', 'Man schreibt sie immer gleich. Präge dir ihr Wortbild ein.', 'Beispiele: und, mit, ist, nicht, auch, oder, dann, hier, wie, die, bin, mir, über, von.'] },
  };
  const S2_TUT = {
    'besonders:1': { title: 'st, sp, nk, qu, x, ie', steps: ['Zwei Schreibweisen, nur eine ist richtig.', 'Am Anfang hörst du scht, du schreibst st. Für kw schreibst du qu. Klingt das i lang, schreibst du meist ie.', 'Beispiel: „Stuhl“ oder „Schtuhl“? Richtig ist Stuhl.', 'Tippe auf das richtige Wort.'] },
    'doppel:1': { title: 'Doppelte Mitlaute', steps: ['Zwei Schreibweisen, nur eine ist richtig.', 'Sprich das Wort in Silben. Ist der Selbstlaut kurz, steht der Mitlaut doppelt.', 'Beispiel: Son-ne. Das o ist kurz, also: Sonne. Ho-se: Das o ist lang, also nur ein s.', 'Tippe auf das richtige Wort.'] },
    'verl:1': { title: 'Verlängern', steps: ['Am Ende fehlt ein Buchstabe: d oder t, g oder k, b oder p.', 'Verlängere das Wort, dann hörst du ihn.', 'Beispiel: der Hun_ wird zu die Hun-de. Du hörst ein d, also: Hund.', 'Tippe auf den fehlenden Buchstaben.'] },
    'verl:2': { title: 'Ableiten', steps: ['Zwei Schreibweisen: mit ä oder e, mit äu oder eu.', 'Such ein verwandtes Wort mit a oder au.', 'Beispiel: Bäume oder Beume? Es kommt von Baum, also: Bäume.', 'Tippe auf das richtige Wort.'] },
    'gross:1': { title: 'Groß oder klein', steps: ['Drei Sätze, nur einer ist richtig geschrieben.', 'Ist der Satzanfang groß? Sind alle Nomen und Namen groß?', 'Beispiel: Der Hund bellt laut. „Der“ steht am Anfang, „Hund“ ist ein Nomen.', 'Tippe auf den richtigen Satz.'] },
    'satzz:1': { title: 'Satzzeichen', steps: ['Am Satzende fehlt ein Zeichen.', 'Erzählt der Satz etwas? Punkt. Fragt er? Fragezeichen. Ist es eine Bitte oder ein Ruf? Ausrufezeichen.', 'Beispiel: Wie heißt du? Das ist eine Frage.', 'Tippe auf das passende Zeichen.'] },
    'alphabet:1': { title: 'Wörterbuch', steps: ['Die Wörter sollen in die Reihenfolge wie im Wörterbuch.', 'Schau auf den ersten Buchstaben und sag das Abc auf.', 'Beispiel: Fisch, Apfel, Ball wird zu Apfel, Ball, Fisch.', 'Tippe die Wörter der Reihe nach an. Nochmal tippen nimmt ein Wort wieder heraus.'] },
    'alphabet:2': { title: 'Wörterbuch: der zweite Buchstabe', steps: ['Alle Wörter fangen mit demselben Buchstaben an.', 'Dann entscheidet der zweite Buchstabe.', 'Beispiel: Brot, Ball, Bett. Zweite Buchstaben r, a, e. Also: Ball, Bett, Brot.', 'Tippe die Wörter der Reihe nach an.'] },
    'kleinw:1': { title: 'Kleine Wörter', steps: ['Im Satz fehlt ein kleines Wort.', 'Zwei Schreibweisen, nur eine ist richtig. Diese Wörter merkst du dir.', 'Beispiel: Tim und Lea malen. Richtig ist „und“, nicht „unt“.', 'Tippe auf das richtige Wort.'] },
  };
  const S2_MODULES = {
    besonders: { name: 'st, sp, qu, ie', icon: '📝', maxTier: 1, worldCap: [1], dmg: 12 },
    doppel: { name: 'Doppelte Mitlaute', icon: '✌️', maxTier: 1, worldCap: [1], dmg: 12 },
    verl: { name: 'Verlängern und ableiten', icon: '↔️', maxTier: 2, worldCap: [2], dmg: 12 },
    gross: { name: 'Groß oder klein', icon: '🔠', maxTier: 1, worldCap: [1], dmg: 14 },
    satzz: { name: 'Satzzeichen', icon: '❔', maxTier: 1, worldCap: [1], dmg: 12 },
    alphabet: { name: 'Wörterbuch', icon: '📖', maxTier: 2, worldCap: [2], dmg: 16 },
    kleinw: { name: 'Kleine Wörter', icon: '🗒️', maxTier: 1, worldCap: [1], dmg: 10 },
  };
  const SCHREIBEN2 = Object.assign({}, set, { grade: 2, title: 'Richtig schreiben', icon: '📝', sub: 'st und sp, ie, doppelte Mitlaute, Verlängern, groß und klein, Satzzeichen, Wörterbuch',
    modules: S2_MODULES, tut: S2_TUT, notes: S2_NOTES, pool: S2_POOL,
    starters: hero([{ name: 'Silbengelenk', mod: 'doppel' }, { name: 'Verlängerung', mod: 'verl' }, { name: 'Großbuchstabe', mod: 'gross' }, { name: 'Schlusspunkt', mod: 'satzz' }]),
    extra: { besonders: 'Wörterkartei', doppel: 'Silbengelenk', verl: 'Verlängerung', gross: 'Großbuchstabe', satzz: 'Schlusspunkt', alphabet: 'Daumenregister', kleinw: 'Blitzlesekarte' },
    events: [
      { title: 'Das Diktat', text: 'Auf dem Lehrertisch liegt ein Diktat. Findest du das richtig geschriebene Wort, bekommst du einen Schild.', opts: [{ label: 'Nachsehen', task: 'any', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Liegen lassen', effect: {} }] },
      { title: 'Der Brief an Oma', text: 'Du schreibst Oma einen Brief. Am Ende eines Satzes fehlt noch ein Zeichen. Setzt du das richtige, bekommst du einen Trank.', opts: [{ label: 'Weiterschreiben', task: 'satzz', win: { item: 'trank' }, lose: { hp: -4 } }, { label: 'Später', effect: {} }] },
      { title: 'Das Klassenwörterbuch', text: 'Herr Lange sortiert neue Wortkarten in das Klassenwörterbuch. Hilfst du ihm, schenkt er dir eine Lupe.', opts: [{ label: 'Helfen', task: 'alphabet', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Einkaufszettel', text: 'Auf Papas Einkaufszettel steht ein Wort falsch. Wenn du es findest, bekommst du einen Keks.', opts: [{ label: 'Nachsehen', task: 'doppel', win: { item: 'keks' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Wortkartei', text: 'In der Wortkartei sind die Karten mit d und t durcheinander. Sortierst du eine richtig ein, klebt dir Herr Lange ein Fleißbienchen ins Heft.', opts: [{ label: 'Sortieren', task: 'verl', win: { item: 'stern' }, lose: { hp: -4 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Schulgarten', text: 'Im Schulgarten steht eine Bank unter dem Apfelbaum. Du setzt dich und ruhst dich aus.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
    ] });
  SCHREIBEN2.gen = (mod, tier) => (mod !== 'alphabet' ? null : tier === 1 && Math.random() < 0.4 ? abcFirst() : abcOrder(tier));

  /* ================= KLASSE 2: Wörter und Sätze ================= */
  const NOMEN = ['der Ball', 'der Hund', 'der Baum', 'der Tisch', 'der Mond', 'der Apfel', 'der Stuhl', 'der Bus', 'der Vogel', 'der Schuh', 'der Fisch', 'der Teller',
    'die Sonne', 'die Maus', 'die Blume', 'die Tasche', 'die Lampe', 'die Schule', 'die Ente', 'die Kerze', 'die Wolke', 'die Uhr', 'die Hose', 'die Nase',
    'das Haus', 'das Buch', 'das Auto', 'das Bett', 'das Ei', 'das Kind', 'das Pferd', 'das Brot', 'das Bild', 'das Fenster', 'das Heft', 'das Schaf'];
  const VERBEN = ['laufen', 'malen', 'singen', 'lesen', 'schreiben', 'springen', 'essen', 'trinken', 'schlafen', 'lachen', 'rennen', 'bauen', 'kochen', 'tanzen', 'rufen', 'schwimmen', 'fliegen', 'hüpfen'];
  const ADJEKTIVE = ['groß', 'klein', 'rot', 'blau', 'schnell', 'langsam', 'laut', 'leise', 'warm', 'kalt', 'lustig', 'nett', 'nass', 'dünn', 'süß', 'sauer', 'hell', 'dunkel', 'weich', 'hart', 'alt', 'neu'];
  const WORTARTEN = ['Nomen', 'Verb', 'Adjektiv', 'Artikel'];
  // [Grundform, er/sie/es, du]
  const VERBFORMEN = [['laufen', 'läuft', 'läufst'], ['fahren', 'fährt', 'fährst'], ['schlafen', 'schläft', 'schläfst'], ['singen', 'singt', 'singst'], ['malen', 'malt', 'malst'],
    ['springen', 'springt', 'springst'], ['trinken', 'trinkt', 'trinkst'], ['rufen', 'ruft', 'rufst'], ['schreiben', 'schreibt', 'schreibst'], ['geben', 'gibt', 'gibst'], ['sehen', 'sieht', 'siehst'],
    ['helfen', 'hilft', 'hilfst'], ['nehmen', 'nimmt', 'nimmst'], ['lachen', 'lacht', 'lachst'], ['kochen', 'kocht', 'kochst'], ['bauen', 'baut', 'baust'], ['werfen', 'wirft', 'wirfst']];
  // [Einzahl, Mehrzahl, falsch, falsch]
  const MEHRZAHL = [['der Baum', 'die Bäume', 'die Baume', 'die Baums'], ['das Haus', 'die Häuser', 'die Hause', 'die Hauser'], ['die Maus', 'die Mäuse', 'die Mause', 'die Mäuser'],
    ['der Ball', 'die Bälle', 'die Balle', 'die Balls'], ['das Kind', 'die Kinder', 'die Kinde', 'die Kinds'], ['die Blume', 'die Blumen', 'die Blumes', 'die Blümen'],
    ['der Apfel', 'die Äpfel', 'die Apfels', 'die Apfeln'], ['das Buch', 'die Bücher', 'die Buchs', 'die Büche'], ['die Hand', 'die Hände', 'die Handen', 'die Hands'],
    ['der Stuhl', 'die Stühle', 'die Stuhle', 'die Stuhls'], ['das Bett', 'die Betten', 'die Bette', 'die Betts'], ['die Tasche', 'die Taschen', 'die Tasches', 'die Täsche'],
    ['das Ei', 'die Eier', 'die Eien', 'die Eie'], ['der Vogel', 'die Vögel', 'die Vogels', 'die Vogeln'], ['das Auto', 'die Autos', 'die Auten', 'die Autoe'],
    ['die Gans', 'die Gänse', 'die Ganse', 'die Gänsen'], ['der Fisch', 'die Fische', 'die Fischs', 'die Fisch'], ['die Uhr', 'die Uhren', 'die Uhre', 'die Uhrs'],
    ['das Bild', 'die Bilder', 'die Bilde', 'die Bilds'], ['der Zahn', 'die Zähne', 'die Zahne', 'die Zahns']];
  // zusammengesetzte Nomen ohne Fugenelement: [erstes, zweites, Zusammensetzung]
  const ZUSAMMEN = [['das Haus', 'die Tür', 'die Haustür'], ['die Hand', 'der Schuh', 'der Handschuh'], ['der Apfel', 'der Baum', 'der Apfelbaum'], ['der Fuß', 'der Ball', 'der Fußball'],
    ['der Schnee', 'der Mann', 'der Schneemann'], ['der Regen', 'der Schirm', 'der Regenschirm'], ['der Zahn', 'die Bürste', 'die Zahnbürste'], ['die Hand', 'das Tuch', 'das Handtuch'],
    ['der Regen', 'die Wolke', 'die Regenwolke'], ['der Vogel', 'das Nest', 'das Vogelnest'], ['der Sand', 'der Kasten', 'der Sandkasten'], ['der Tee', 'die Kanne', 'die Teekanne'],
    ['das Brot', 'die Dose', 'die Brotdose'], ['das Wasser', 'der Ball', 'der Wasserball'], ['das Eis', 'der Bär', 'der Eisbär'], ['das Haus', 'der Schuh', 'der Hausschuh'],
    ['der Baum', 'das Haus', 'das Baumhaus'], ['der Garten', 'die Tür', 'die Gartentür'], ['das Haus', 'das Tier', 'das Haustier'], ['der Apfel', 'der Saft', 'der Apfelsaft'], ['das Wasser', 'das Glas', 'das Wasserglas']];
  const ARTS = ['der', 'die', 'das'];
  const art = (w) => w.split(' ')[0], noun = (w) => w.split(' ')[1];
  // [Wortstamm, Wort, Familie (3+), ähnlich aussehende Wörter aus anderen Familien]
  const FAMILIEN = [['fahr', 'fahren', ['das Fahrrad', 'der Fahrer', 'abfahren'], ['die Farbe', 'fallen']], ['spiel', 'spielen', ['der Spieler', 'das Spielzeug', 'mitspielen'], ['die Spinne', 'der Spiegel']],
    ['mal', 'malen', ['der Maler', 'der Malstift', 'bemalen'], ['der Mantel', 'die Maus']], ['schreib', 'schreiben', ['der Schreibtisch', 'aufschreiben', 'die Schreibschrift'], ['schreien', 'die Scheibe']],
    ['haus', 'das Haus', ['die Hausaufgabe', 'die Haustür', 'das Baumhaus'], ['die Hose', 'heiß']], ['les', 'lesen', ['das Lesebuch', 'vorlesen', 'der Leser'], ['der Besen', 'leise']],
    ['hund', 'der Hund', ['die Hündin', 'die Hundeleine', 'die Hundehütte'], ['die Hand', 'der Mund']], ['trink', 'trinken', ['die Trinkflasche', 'austrinken', 'der Trinkhalm'], ['die Tinte', 'trennen']],
    ['schne', 'der Schnee', ['der Schneemann', 'schneien', 'der Schneeball'], ['die Schere', 'der Schnabel']], ['sonn', 'die Sonne', ['sonnig', 'die Sonnenblume', 'der Sonnenhut'], ['der Sohn', 'der Sand']],
    ['schul', 'die Schule', ['der Schüler', 'der Schulhof', 'die Schultasche'], ['der Schuh', 'der Schal']], ['schlaf', 'schlafen', ['der Schlafanzug', 'einschlafen', 'das Schlafzimmer'], ['die Schlange', 'das Schaf']],
    ['flieg', 'fliegen', ['der Flieger', 'abfliegen', 'wegfliegen'], ['die Flasche', 'die Flöte']], ['blum', 'die Blume', ['die Blumenvase', 'die Blumenwiese', 'der Blumentopf'], ['blau', 'das Blut']]];
  const VORSILBEN = ['auf', 'be', 'ein', 'er', 'ver', 'vor'];
  const VS_WORDS = [['aufstehen', 'auf'], ['aufmachen', 'auf'], ['aufräumen', 'auf'], ['besuchen', 'be'], ['bemalen', 'be'], ['bekommen', 'be'], ['einkaufen', 'ein'], ['einsteigen', 'ein'],
    ['einschlafen', 'ein'], ['erzählen', 'er'], ['erklären', 'er'], ['erleben', 'er'], ['verlieren', 'ver'], ['vergessen', 'ver'], ['verraten', 'ver'], ['vorlesen', 'vor'], ['vorsingen', 'vor'], ['vormachen', 'vor']];
  const WORTFELDER = { gehen: ['laufen', 'rennen', 'schleichen', 'hüpfen', 'wandern', 'spazieren', 'marschieren'], sagen: ['rufen', 'flüstern', 'fragen', 'schreien', 'erzählen', 'antworten', 'sprechen'],
    sehen: ['schauen', 'anschauen', 'beobachten', 'starren', 'betrachten'], essen: ['futtern', 'naschen', 'kauen', 'beißen', 'knabbern'], fröhlich: ['lustig', 'froh', 'heiter', 'vergnügt', 'munter'] };
  const SATZARTEN = { Aussagesatz: ['Der Hund schläft.', 'Ich male ein Bild.', 'Heute regnet es.', 'Lena hat einen Hasen.', 'Wir gehen in den Zoo.', 'Das Eis ist kalt.'],
    Fragesatz: ['Wo ist mein Stift?', 'Kommst du mit?', 'Wie alt bist du?', 'Was isst du gern?', 'Hast du Hunger?', 'Wann kommt Oma?'],
    Aufforderungssatz: ['Komm bitte her!', 'Mach die Tür zu!', 'Hör gut zu!', 'Räum dein Zimmer auf!', 'Gib mir bitte den Ball!', 'Wasch dir die Hände!'] };
  const KINDS = Object.keys(SATZARTEN);

  const W2_POOL = [];
  const wa = (id, q, k, why) => W2_POOL.push({ id, mod: 'wortart', g: 'wortart', q, o: [k].concat(others(WORTARTEN, [k], 2)), a: 0, why });
  NOMEN.forEach((n) => wa('w2wa_' + noun(n), `Welche Wortart ist „${noun(n)}“?`, 'Nomen', `Davor passt ein Artikel: ${n}.`));
  VERBEN.forEach((v) => wa('w2wa_' + v, `Welche Wortart ist „${v}“?`, 'Verb', `„${v}“ sagt, was jemand tut.`));
  ADJEKTIVE.forEach((a) => wa('w2wa_' + a, `Welche Wortart ist „${a}“?`, 'Adjektiv', `„${a}“ sagt, wie etwas ist.`));
  // articles are asked with a noun: alone „das“ could be another word
  ['der Ball', 'die Sonne', 'das Haus', 'ein Hund', 'eine Maus'].forEach((x) => wa('w2wa_art_' + art(x), `Welche Wortart ist „${art(x)}“ in „${x}“?`, 'Artikel', `„${art(x)}“ begleitet das Nomen ${noun(x)}.`));
  VERBFORMEN.forEach(([g, er, du]) => {
    W2_POOL.push({ id: 'w2gf_' + g, t: 2, mod: 'wortart', g: 'wortart', q: `Wie heißt die Grundform von „er ${er}“?`, o: [g, er, du], a: 0, why: `Die Grundform ist: ${g}.` });
    W2_POOL.push({ id: 'w2pf_' + g, t: 2, mod: 'wortart', g: 'wortart', q: `Welche Form passt? „du ___“`, o: [du, er, g], a: 0, why: `du ${du}, er ${er}` });
  });
  MEHRZAHL.forEach(([e, m, f1, f2]) => {
    W2_POOL.push({ id: 'w2mz_' + noun(e), mod: 'mehrzahl', g: 'mehrzahl', q: `Wie heißt die Mehrzahl von „${e}“?`, o: [m, f1, f2], a: 0, why: `${e}, ${m}` });
    const showPlural = Math.random() < 0.5;
    W2_POOL.push({ id: 'w2em_' + noun(e), mod: 'mehrzahl', g: 'mehrzahl', q: `Einzahl oder Mehrzahl? „${showPlural ? m : e}“`, o: showPlural ? ['Mehrzahl', 'Einzahl'] : ['Einzahl', 'Mehrzahl'], a: 0, why: `Einzahl: ${e}. Mehrzahl: ${m}.` });
  });
  NOMEN.forEach((n) => {
    W2_POOL.push({ id: 'w2ar_' + noun(n), mod: 'artikel', g: 'artikel', q: `Welcher Artikel passt? ___ ${noun(n)}`, o: [art(n)].concat(ARTS.filter((x) => x !== art(n))), a: 0, why: `Es heißt: ${n}.` });
    const u = art(n) === 'die' ? 'eine' : 'ein';
    W2_POOL.push({ id: 'w2ue_' + noun(n), t: 2, mod: 'artikel', g: 'artikel', q: `Ein oder eine? ___ ${noun(n)}`, o: [u, u === 'ein' ? 'eine' : 'ein'], a: 0, why: `${n}, also: ${u} ${noun(n)}.` });
  });
  [['der', 'der Ball'], ['die', 'die Sonne'], ['das', 'das Haus'], ['ein', 'ein Hund'], ['eine', 'eine Maus']].forEach(([a, x]) => {
    const b = ARTS.includes(a) ? 'bestimmter Artikel' : 'unbestimmter Artikel';
    W2_POOL.push({ id: 'w2bu_' + a, t: 2, mod: 'artikel', g: 'artikel', q: `Was für ein Artikel ist „${a}“ in „${x}“?`, o: [b, b === 'bestimmter Artikel' ? 'unbestimmter Artikel' : 'bestimmter Artikel'], a: 0, why: 'Bestimmte Artikel: der, die, das. Unbestimmte Artikel: ein, eine.' });
  });
  ZUSAMMEN.forEach(([t1, t2, z]) => {
    const why = `Der Artikel kommt vom letzten Wort: ${t2}.`; const rest = ARTS.filter((x) => x !== art(z));
    W2_POOL.push({ id: 'w2zs_' + noun(z), mod: 'zus', g: 'zus', q: `${noun(t1)} + ${noun(t2)} = ?`, o: [z].concat(rest.map((x) => x + ' ' + noun(z))), a: 0, why });
    W2_POOL.push({ id: 'w2za_' + noun(z), mod: 'zus', g: 'zus', q: `Welcher Artikel passt? ___ ${noun(z)}`, o: [art(z)].concat(rest), a: 0, why });
  });
  FAMILIEN.forEach(([stem, w, members, other]) => W2_POOL.push({ id: 'w2wf_' + w, mod: 'familie', g: 'familie', q: `Welches Wort gehört zur Wortfamilie „${w}“?`, o: [pick(members)].concat(other), a: 0, why: `Verwandt mit „${w}“: ${members.join(', ')}.` }));
  VS_WORDS.forEach(([w, v]) => W2_POOL.push({ id: 'w2vs_' + w, t: 2, mod: 'familie', g: 'familie', q: `Welche Vorsilbe hat „${w}“?`, o: [v + '-'].concat(others(VORSILBEN, [v], 2).map((x) => x + '-')), a: 0, why: `${v} + ${w.slice(v.length)}` }));
  const FELDER = Object.keys(WORTFELDER);
  FELDER.forEach((f) => {
    WORTFELDER[f].forEach((w) => W2_POOL.push({ id: 'w2fe_' + w, mod: 'feld', g: 'feld', q: `Welches Wort gehört zum Wortfeld „${f}“?`, o: [w].concat(others(FELDER, [f], 2).map((x) => pick(WORTFELDER[x]))), a: 0, why: `Wortfeld „${f}“: ${WORTFELDER[f].join(', ')}.` }));
    W2_POOL.push({ id: 'w2fz_' + f, mod: 'feld', g: 'feld', q: `Welches Wortfeld passt zu: ${shuffle(WORTFELDER[f]).slice(0, 3).join(', ')}?`, o: [f].concat(others(FELDER, [f], 2)), a: 0 });
  });
  KINDS.forEach((k) => SATZARTEN[k].forEach((s) => {
    W2_POOL.push({ id: 'w2sa_' + s, mod: 'satzart', g: 'satzart', q: `Welche Satzart ist das? „${s}“`, o: [k].concat(KINDS.filter((x) => x !== k)), a: 0, why: `Am Ende steht ${{ '.': 'ein Punkt', '?': 'ein Fragezeichen', '!': 'ein Ausrufezeichen' }[s.slice(-1)]}.` });
  }));
  KINDS.forEach((k) => W2_POOL.push({ id: 'w2sw_' + k, mod: 'satzart', g: 'satzart', q: `Welcher Satz ist ein ${k}?`, o: [k].concat(KINDS.filter((x) => x !== k)).map((x) => pick(SATZARTEN[x])), a: 0 }));
  const W2_NOTES = {
    wortart: { title: 'Die vier Wortarten', lines: ['Nomen sind Namen für Menschen, Tiere, Pflanzen und Dinge: der Hund, die Blume.', 'Verben sagen, was jemand tut oder was passiert: laufen, schlafen.', 'Adjektive sagen, wie etwas ist: groß, rot, lustig.', 'Artikel begleiten ein Nomen: der, die, das, ein, eine.', 'Verben haben eine Grundform (laufen) und Personalformen: ich laufe, du läufst, er läuft.'] },
    mehrzahl: { title: 'Einzahl und Mehrzahl', lines: ['Einzahl: ein Ding. der Baum.', 'Mehrzahl: mehrere Dinge. die Bäume.', 'In der Mehrzahl heißt der Artikel immer „die“.', 'Oft ändert sich auch das Wort: das Haus, die Häuser.'] },
    artikel: { title: 'Artikel', lines: ['Bestimmte Artikel: der, die, das. der Ball, die Sonne, das Haus.', 'Unbestimmte Artikel: ein, eine. ein Ball, eine Sonne, ein Haus.', 'Zu „die“ gehört „eine“, zu „der“ und „das“ gehört „ein“.'] },
    zus: { title: 'Zusammengesetzte Nomen', lines: ['Aus zwei Nomen wird ein neues Nomen: das Haus + die Tür = die Haustür.', 'Der Artikel kommt vom letzten Wort.', 'Das neue Wort schreibt man zusammen und groß.'] },
    familie: { title: 'Wortfamilie', lines: ['Wörter mit demselben Wortstamm gehören zu einer Familie.', 'fahren: das Fahrrad, der Fahrer, abfahren. In allen steckt „fahr“.', 'Wörter, die nur ähnlich aussehen, gehören nicht dazu: die Farbe.', 'Vorsilben stehen vorn: auf-, be-, ein-, er-, ver-, vor-. Aus lesen wird vorlesen, der Stamm bleibt gleich.'] },
    feld: { title: 'Wortfeld', lines: ['Ein Wortfeld sind Wörter mit ähnlicher Bedeutung.', 'Wortfeld „sagen“: rufen, flüstern, fragen, erzählen.', 'Wortfeld „gehen“: laufen, rennen, schleichen, hüpfen.', 'Mit dem Wortfeld wird ein Text abwechslungsreicher.'] },
    satzart: { title: 'Satzarten', lines: ['Aussagesatz: Er erzählt etwas. Am Ende steht ein Punkt.', 'Fragesatz: Er fragt etwas. Am Ende steht ein Fragezeichen.', 'Aufforderungssatz: Er bittet oder fordert auf. Am Ende steht meist ein Ausrufezeichen.'] },
  };
  const W2_TUT = {
    'wortart:1': { title: 'Wortarten', steps: ['Zu welcher Wortart gehört das Wort?', 'Passt der, die oder das davor? Nomen. Tut man es? Verb. Sagt es, wie etwas ist? Adjektiv.', 'Beispiel: „schnell“. Wie ist das Auto? Schnell. Also ein Adjektiv.', 'Tippe auf die richtige Wortart.'] },
    'wortart:2': { title: 'Grundform und Personalform', steps: ['Ein Verb hat eine Grundform und Personalformen.', 'Grundform: laufen. Personalformen: ich laufe, du läufst, er läuft.', 'Beispiel: Die Grundform von „er singt“ ist „singen“.', 'Tippe auf die richtige Form.'] },
    'mehrzahl:1': { title: 'Einzahl und Mehrzahl', steps: ['Einzahl heißt: ein Ding. Mehrzahl heißt: mehrere.', 'In der Mehrzahl heißt der Artikel „die“. Oft ändert sich das Wort mit.', 'Beispiel: der Baum, die Bäume.', 'Tippe auf die richtige Antwort.'] },
    'artikel:1': { title: 'Der, die oder das', steps: ['Vor dem Nomen fehlt der Artikel.', 'Sprich alle drei: der Sonne, die Sonne, das Sonne. Was klingt richtig?', 'Beispiel: die Sonne.', 'Tippe auf den Artikel.'] },
    'artikel:2': { title: 'Ein oder eine', steps: ['Unbestimmte Artikel sind ein und eine.', 'Zu „die“ passt „eine“, zu „der“ und „das“ passt „ein“.', 'Beispiel: die Maus, also: eine Maus. Der Hund, also: ein Hund.', 'Tippe auf die richtige Antwort.'] },
    'zus:1': { title: 'Zusammengesetzte Nomen', steps: ['Zwei Nomen werden zu einem Wort.', 'Der Artikel kommt immer vom letzten Wort.', 'Beispiel: das Haus + die Tür = die Haustür, weil es „die Tür“ heißt.', 'Tippe auf die richtige Antwort.'] },
    'familie:1': { title: 'Wortfamilie', steps: ['Wörter einer Familie haben denselben Wortstamm.', 'Such den Stamm im Wort: fahr in fahren.', 'Beispiel: das Fahrrad gehört zu fahren. Die Farbe nicht.', 'Tippe auf das verwandte Wort.'] },
    'familie:2': { title: 'Vorsilben', steps: ['Manche Wörter haben vorn eine Vorsilbe: auf-, be-, ein-, er-, ver-, vor-.', 'Deck den Anfang ab. Was bleibt übrig?', 'Beispiel: vorlesen = vor + lesen.', 'Tippe auf die Vorsilbe.'] },
    'feld:1': { title: 'Wortfeld', steps: ['Ein Wortfeld sind Wörter mit ähnlicher Bedeutung.', 'Frag dich: Kann ich das Wort statt „sagen“ oder „gehen“ benutzen?', 'Beispiel: flüstern gehört zum Wortfeld „sagen“.', 'Tippe auf die richtige Antwort.'] },
    'satzart:1': { title: 'Satzarten', steps: ['Es gibt Aussagesätze, Fragesätze und Aufforderungssätze.', 'Schau auf das Zeichen am Ende: Punkt, Fragezeichen oder Ausrufezeichen.', 'Beispiel: Kommst du mit? Das ist ein Fragesatz.', 'Tippe auf die richtige Antwort.'] },
  };
  const W2_MODULES = {
    wortart: { name: 'Wortarten', icon: '🏷️', maxTier: 2, worldCap: [2], dmg: 12 },
    mehrzahl: { name: 'Einzahl und Mehrzahl', icon: '👥', maxTier: 1, worldCap: [1], dmg: 12 },
    artikel: { name: 'Artikel', icon: '📌', maxTier: 2, worldCap: [2], dmg: 10 },
    zus: { name: 'Zusammengesetzte Nomen', icon: '🧩', maxTier: 1, worldCap: [1], dmg: 12 },
    familie: { name: 'Wortfamilie', icon: '🌳', maxTier: 2, worldCap: [2], dmg: 14 },
    feld: { name: 'Wortfeld', icon: '☀️', maxTier: 1, worldCap: [1], dmg: 12 },
    satzart: { name: 'Satzarten', icon: '💬', maxTier: 1, worldCap: [1], dmg: 14 },
  };
  const WOERTER2 = Object.assign({}, set, { grade: 2, title: 'Wörter und Sätze', icon: '🏷️', sub: 'Nomen, Verb, Adjektiv und Artikel, Einzahl und Mehrzahl, Wortfamilien und Satzarten',
    modules: W2_MODULES, tut: W2_TUT, notes: W2_NOTES, pool: W2_POOL,
    starters: hero([{ name: 'Textmarker', mod: 'wortart' }, { name: 'Begleiterkarte', mod: 'artikel' }, { name: 'Wortfamilienhaus', mod: 'familie' }, { name: 'Satzmelodie', mod: 'satzart' }]),
    extra: { wortart: 'Textmarker', mehrzahl: 'Mengenbild', artikel: 'Begleiterkarte', zus: 'Leimtube', familie: 'Wortfamilienhaus', feld: 'Wortfeldsonne', satzart: 'Satzmelodie' },
    events: [
      { title: 'Das Wortfamilienhaus', text: 'An der Klassenwand hängt ein Wortfamilienhaus aus Pappe. Ein Wort hat sich ins falsche Zimmer verirrt. Findest du das richtige, bekommst du einen Trank.', opts: [{ label: 'Suchen', task: 'familie', win: { item: 'trank' }, lose: { hp: -4 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Im Zoo', text: 'Beim Ausflug in den Zoo zählt ihr die Tiere: ein Löwe, zwei Löwen. Die Tierpflegerin fragt dich nach der Mehrzahl und gibt dir einen Schild.', opts: [{ label: 'Antworten', task: 'mehrzahl', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Erzählkiste', text: 'In der Erzählkiste liegen Wortkarten für „sagen“ und „gehen“. Sortierst du eine richtig ein, bekommst du eine Lupe.', opts: [{ label: 'Sortieren', task: 'feld', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Später', effect: {} }] },
      { title: 'Die Fragestunde', text: 'Frau Wolf hat Sätze an die Tafel geschrieben: Fragen, Bitten und Aussagen. Wer eine Satzart erkennt, bekommt ein Fleißbienchen.', opts: [{ label: 'Mitmachen', task: 'satzart', win: { item: 'stern' }, lose: { xp: 5 } }, { label: 'Zuhören (+5 LP)', effect: { hp: 5 } }] },
      { title: 'Der Bastelnachmittag', text: 'Beim Basteln entstehen neue Wörter: Papier und Hut, Schere und Kleber. Bildest du ein zusammengesetztes Nomen, gibt es einen Keks.', opts: [{ label: 'Mitmachen', task: 'zus', win: { item: 'keks' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Hofpause', text: 'Es klingelt zur Hofpause. Du setzt dich auf die Mauer und isst dein Pausenbrot.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
    ] });

  K.MODES.laute1 = LAUTE1; K.MODES.schreiben2 = SCHREIBEN2; K.MODES.woerter2 = WOERTER2;
  return { PICS, LAUTPOS, SILBEN, REIME, PIC_REIME, BESONDERS, DOPPEL, VERL, ABLEIT, GROSS, SATZZ, ABC_WORDS, KLEIN, NOMEN, VERBEN, ADJEKTIVE, VERBFORMEN, MEHRZAHL, ZUSAMMEN, FAMILIEN, VS_WORDS, WORTFELDER, SATZARTEN };
})();
if (typeof module !== 'undefined') module.exports = K12D;
