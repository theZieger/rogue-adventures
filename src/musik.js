// Musik Klasse 3 (Lehrplan Sachsen Grundschule): Der Konzertsaal. Everything is seen, nothing is heard.
// Registers its unit in MK.MODES; app.js picks it up from there.
const MU = (() => {
  const K = typeof MK !== 'undefined' ? MK : require('./knowledge.js');
  const { shuffle, pick } = K;
  const NS = 'xmlns="http://www.w3.org/2000/svg"';
  const INK = '#1C2541', PAPER = '#FFFDF5';
  const choice = (mod, note, q, answer, wrongs, qid, extra) => Object.assign({ kind: 'choice', mod, tier: 1, group: mod + ':1', note, q, options: shuffle([answer].concat(wrongs)), answer, qid, cols: 1 }, extra || {});
  const others = (list, x, n) => shuffle(list.filter((y) => y !== x)).slice(0, n);

  /* ---------- Notenbilder ---------- */
  // Notensystem: unterste Linie y = 62, Abstand 10. Tonstufe s: 0 = c' (Hilfslinie) … 7 = c''
  const Y = (s) => 72 - 5 * s;
  const LINES = (x0, x1) => [22, 32, 42, 52, 62].map((y) => `<path d="M${x0} ${y} H${x1}" stroke="${INK}" stroke-width="1.4"/>`).join('');
  // Violinschlüssel: die Schnecke dreht sich um die g-Linie (y = 52)
  const CLEF = `<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round"><path d="M17 78 Q22 78 21.5 72 L18.5 12 Q18.6 5 22.6 8 Q28 14 23 24 Q18 32 11 41 Q4 51 9 60 Q14 67 22 64 Q29 60 27 53 Q24 47 18 49 Q13 52 16 57" stroke-width="2.6"/></g><circle cx="15.5" cy="76" r="3.4" fill="${INK}"/>`;
  const box = (w, h, inner, label, maxW) => `<svg ${NS} class="pic" viewBox="0 0 ${w} ${h}" style="max-width:${maxW || w * 2.4}px" role="img" aria-label="${label}"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="8" fill="${PAPER}" stroke="#C9CFDF" stroke-width="1.5"/>${inner}</svg>`;
  const staff = (w, inner, label, clef, maxW) => box(w, 84, LINES(6, w - 6) + (clef === false ? '' : CLEF) + inner, label, maxW);
  // answer pictures: no frame, cropped to the staff, as tall as the button allows
  const optStaff = (w, inner, clef) => `<svg ${NS} viewBox="0 6 ${w} 76" style="width:100%;height:104px" role="img" aria-label="Notensystem">${LINES(2, w - 2)}${clef ? CLEF : ''}${inner}</svg>`;

  // v: Wert in Achteln (8 ganze, 4 halbe, 2 Viertel, 1 Achtel); s: Tonstufe
  function noteSVG(x, s, v) {
    const y = Y(s), up = s < 6, hollow = v >= 4;
    let o = s <= 0 ? `<path d="M${x - 10} 72 H${x + 10}" stroke="${INK}" stroke-width="1.6"/>` : '';
    if (v === 8) return o + `<ellipse cx="${x}" cy="${y}" rx="7.2" ry="4.9" fill="${INK}"/><ellipse cx="${x}" cy="${y}" rx="2.6" ry="4" transform="rotate(-35 ${x} ${y})" fill="${PAPER}"/>`;
    o += `<ellipse cx="${x}" cy="${y}" rx="6" ry="4.3" transform="rotate(-20 ${x} ${y})" fill="${hollow ? PAPER : INK}" stroke="${INK}" stroke-width="${hollow ? 2.2 : 1}"/>`;
    const sx = up ? x + 5.4 : x - 5.4, sy = up ? y - 30 : y + 30;
    o += `<path d="M${sx} ${up ? y - 1 : y + 1} V${sy}" stroke="${INK}" stroke-width="1.8"/>`;
    if (v === 1) o += up ? `<path d="M${sx} ${sy} C${sx + 1} ${sy + 8} ${sx + 10} ${sy + 9} ${sx + 7} ${sy + 21}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`
      : `<path d="M${sx} ${sy} C${sx + 1} ${sy - 8} ${sx + 10} ${sy - 9} ${sx + 7} ${sy - 21}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    return o;
  }
  function restSVG(x, v) {
    if (v === 8) return `<rect x="${x - 6}" y="32" width="12" height="5" fill="${INK}"/>`; // hängt unter der vierten Linie
    if (v === 4) return `<rect x="${x - 6}" y="37" width="12" height="5" fill="${INK}"/>`; // sitzt auf der Mittellinie
    if (v === 2) return `<path d="M${x - 3} 24 L${x + 4} 32 Q${x - 3} 37 ${x + 1} 43 L${x + 4} 47 Q${x - 5} 44 ${x - 1} 55" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
    return `<circle cx="${x - 3}" cy="35" r="3" fill="${INK}"/><path d="M${x - 3} 37 Q${x + 2} 39 ${x + 5} 32 L${x - 1} 53" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  const timeSig = (x, top) => `<g font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700" fill="${INK}" text-anchor="middle"><text x="${x}" y="41">${top}</text><text x="${x}" y="61">4</text></g>`;

  // Notenwerte und Pausen: id, Wert in Achteln, Name
  const VALUES = [
    { id: 'ganze', v: 8, name: 'Ganze Note', acc: 'die ganze Note' }, { id: 'halbe', v: 4, name: 'Halbe Note', acc: 'die halbe Note' },
    { id: 'viertel', v: 2, name: 'Viertelnote', acc: 'die Viertelnote' }, { id: 'achtel', v: 1, name: 'Achtelnote', acc: 'die Achtelnote' },
    { id: 'gpause', v: 8, rest: true, name: 'Ganze Pause', acc: 'die ganze Pause' }, { id: 'hpause', v: 4, rest: true, name: 'Halbe Pause', acc: 'die halbe Pause' },
    { id: 'vpause', v: 2, rest: true, name: 'Viertelpause', acc: 'die Viertelpause' }, { id: 'apause', v: 1, rest: true, name: 'Achtelpause', acc: 'die Achtelpause' },
  ];
  const itemSVG = (x, it, s) => (it.rest ? restSVG(x, it.v) : noteSVG(x, s === undefined ? 4 : s, it.v));
  const valuePic = (it) => staff(96, itemSVG(64, it), 'Notensystem mit einem Zeichen', true, 230);
  const valueOpt = (it) => optStaff(44, itemSVG(22, it));

  // Takt: Wert in Achteln je Taktart (2/4 = 4 Achtel, 3/4 = 6, 4/4 = 8)
  const W = { 1: 24, 2: 30, 4: 40 };
  function barSVG(top, items, gap) {
    let x = 62, body = timeSig(44, top);
    for (const it of items) {
      if (it === gap) { body += `<rect x="${x - 2}" y="16" width="${W[it.v] - 4}" height="52" rx="5" fill="#FFF3C4" stroke="#E0A800" stroke-width="2" stroke-dasharray="5 3"/><text x="${x + W[it.v] / 2 - 4}" y="50" font-size="22" font-weight="700" text-anchor="middle" fill="${INK}">?</text>`; x += W[it.v]; continue; }
      body += it.rest ? restSVG(x + 8, it.v) : noteSVG(x + 8, it.s, it.v); x += W[it.v];
    }
    return staff(x + 14, body + `<path d="M${x + 6} 22 V62" stroke="${INK}" stroke-width="2"/>`, `Takt mit Taktangabe ${top}/4, eine Stelle ist leer`, true, 340);
  }
  const NOTE_OF = { 1: 'Achtelnote', 2: 'Viertelnote', 4: 'Halbe Note' };
  // tier 1: 2/4 or 3/4 with notes only; tier 2: also 4/4 and with rests
  function makeBar(tier) {
    const top = tier >= 2 ? pick([2, 3, 4]) : pick([2, 3]); const len = top * 2;
    const miss = pick([1, 2, 4].filter((v) => v < len));
    const items = []; let left = len - miss;
    while (left > 0) { const v = pick([1, 2, 2, 4].filter((x) => x <= left)); left -= v; items.push({ v, s: pick([2, 3, 4, 5]), rest: tier >= 2 && Math.random() < 0.25 }); }
    const gap = { v: miss }; items.splice(Math.floor(Math.random() * (items.length + 1)), 0, gap);
    return { top, items, gap };
  }

  // Tonhöhen c' bis c''
  const TONES = ['c', 'd', 'e', 'f', 'g', 'a', 'h', 'c'];
  const tonePic = (s, small) => (small ? optStaff(70, noteSVG(52, s, 2), true) : staff(96, noteSVG(64, s, 2), 'Notensystem mit einer Note', true, 230));

  // Gestaltungsmittel: Zeichen als Bild
  const sign = (inner, label) => box(110, 56, inner, label, 220);
  const dyn = (s) => sign(`<text x="55" y="38" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-weight="700" font-size="34" text-anchor="middle" fill="${INK}">${s}</text>`, 'Zeichen ' + s);
  const hairpin = (open) => sign(`<path d="${open ? 'M92 16 L18 28 L92 40' : 'M18 16 L92 28 L18 40'}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`, open ? 'Gabel, die sich öffnet' : 'Gabel, die sich schließt');
  const TERMS = [
    { t: 'piano', m: 'leise', pic: () => dyn('p') }, { t: 'forte', m: 'laut', pic: () => dyn('f') },
    { t: 'pianissimo', m: 'sehr leise', pic: () => dyn('pp') }, { t: 'fortissimo', m: 'sehr laut', pic: () => dyn('ff') },
    { t: 'crescendo', m: 'allmählich lauter werden', pic: () => hairpin(true) }, { t: 'decrescendo', m: 'allmählich leiser werden', pic: () => hairpin(false) },
  ];

  /* ---------- Instrumente ---------- */
  const FAM = { streich: 'Streichinstrumente', zupf: 'Zupfinstrumente', holz: 'Holzblasinstrumente', blech: 'Blechblasinstrumente', schlag: 'Schlaginstrumente', tasten: 'Tasteninstrumente' };
  const HOW = { streich: 'Ein Bogen streicht über die Saiten.', zupf: 'Die Saiten werden gezupft.', holz: 'Man bläst Luft hinein.', blech: 'Man bläst Luft hinein.', schlag: 'Man schlägt auf ein Fell oder eine Platte.', tasten: 'Man drückt Tasten.' };
  // keys and valves are pressed too, and organ and accordion are played with air
  const HOW_NOT = { streich: ['zupf'], zupf: [], holz: ['tasten'], blech: ['tasten'], schlag: [], tasten: ['holz', 'blech'] };
  // not: families that would also be a bit right (Klavier has strings, the Querflöte is metal, a clarinet has keys …)
  const INSTR = [
    { id: 'geige', name: 'Geige', art: 'die', fam: 'streich', not: ['zupf'], desc: 'Ein kleines Streichinstrument. Man hält es beim Spielen unter dem Kinn.' },
    { id: 'cello', name: 'Cello', art: 'das', fam: 'streich', not: ['zupf'], desc: 'Ein großes Streichinstrument. Man spielt es im Sitzen, es steht zwischen den Knien.' },
    { id: 'kontrabass', name: 'Kontrabass', art: 'der', fam: 'streich', not: ['zupf'], desc: 'Das größte Streichinstrument. Man spielt es im Stehen oder auf einem hohen Hocker.' },
    { id: 'gitarre', name: 'Gitarre', art: 'die', fam: 'zupf', not: ['streich'], desc: 'Sechs Saiten und ein rundes Schallloch. Die Saiten werden mit den Fingern gezupft.' },
    { id: 'harfe', name: 'Harfe', art: 'die', fam: 'zupf', not: ['streich'], desc: 'Ein großer Rahmen mit vielen Saiten, die man mit beiden Händen zupft.' },
    { id: 'blockfloete', name: 'Blockflöte', art: 'die', fam: 'holz', not: ['tasten'], desc: 'Ein Rohr aus Holz mit Löchern für die Finger. Viele Kinder lernen sie in der Schule.' },
    { id: 'querfloete', name: 'Querflöte', art: 'die', fam: 'holz', not: ['blech', 'tasten'], desc: 'Man hält sie quer zur Seite und bläst über ein Loch. Sie ist meist aus Metall.' },
    { id: 'klarinette', name: 'Klarinette', art: 'die', fam: 'holz', not: ['tasten'], desc: 'Ein schwarzes Rohr mit vielen Klappen. Am Mundstück schwingt ein dünnes Rohrblatt.' },
    { id: 'trompete', name: 'Trompete', art: 'die', fam: 'blech', not: ['tasten'], desc: 'Sie hat drei Ventile und klingt hell und strahlend.' },
    { id: 'posaune', name: 'Posaune', art: 'die', fam: 'blech', not: ['tasten'], desc: 'Sie hat einen langen Zug, den man vor- und zurückschiebt.' },
    { id: 'horn', name: 'Horn', art: 'das', fam: 'blech', not: ['tasten'], desc: 'Ein rund gewundenes Rohr aus Messing. Die rechte Hand steckt im Schalltrichter.' },
    { id: 'pauke', name: 'Pauke', art: 'die', fam: 'schlag', not: [], desc: 'Ein großer Kessel aus Kupfer, oben mit einem Fell bespannt.' },
    { id: 'trommel', name: 'Trommel', art: 'die', fam: 'schlag', not: [], desc: 'Oben und unten ist ein Fell gespannt. Man schlägt mit zwei Stöcken darauf.' },
    { id: 'xylofon', name: 'Xylofon', art: 'das', fam: 'schlag', not: [], desc: 'Große und kleine Holzplatten liegen in einer Reihe. Man schlägt mit Schlägeln darauf.' },
    { id: 'klavier', name: 'Klavier', art: 'das', fam: 'tasten', not: ['streich', 'zupf', 'schlag'], desc: 'Weiße und schwarze Tasten. Drückt man eine, schlägt innen ein Hammer auf eine Saite.' },
    { id: 'orgel', name: 'Orgel', art: 'die', fam: 'tasten', not: ['holz', 'blech'], desc: 'Tasten für die Hände und für die Füße und viele Pfeifen. Sie steht oft in der Kirche.' },
    { id: 'akkordeon', name: 'Akkordeon', art: 'das', fam: 'tasten', not: ['holz', 'blech'], desc: 'Man trägt es vor dem Bauch, zieht den Balg auseinander und drückt Tasten und Knöpfe.' },
  ];
  const nom = (i) => `${i.art} ${i.name}`;
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  function instrTask(tier) {
    const i = pick(INSTR);
    if (tier >= 2) {
      const how = HOW[i.fam]; const wrong = shuffle([...new Set(Object.keys(HOW).filter((f) => !HOW_NOT[i.fam].includes(f) && HOW[f] !== how).map((f) => HOW[f]))]).slice(0, 2);
      return Object.assign(choice('instr', 'familien', `Wie entsteht ${i.art === 'die' ? 'bei der' : 'beim'} ${i.name} der Ton?`, how, wrong, 'mhow_' + i.id), { tier: 2, group: 'instr:2' });
    }
    if (Math.random() < 0.5) return choice('instr', 'familien', `Zu welcher Familie gehört ${nom(i)}?`, FAM[i.fam], others(Object.keys(FAM).filter((f) => !i.not.includes(f)), i.fam, 2).map((f) => FAM[f]), 'mfam_' + i.id);
    const wrong = shuffle(INSTR.filter((x) => x.fam !== i.fam && !i.not.includes(x.fam))).slice(0, 2).map((x) => x.name);
    return choice('instr', 'familien', `Welches Instrument ist das? ${i.desc}`, i.name, wrong, 'mwer_' + i.id);
  }

  /* ---------- Komponisten ---------- */
  // Reihenfolge nach Geburtsjahr
  const KOMP = [
    { id: 'bach', text: 'Johann Sebastian Bach', year: 1685 }, { id: 'mozart', text: 'Wolfgang Amadeus Mozart', year: 1756 },
    { id: 'beethoven', text: 'Ludwig van Beethoven', year: 1770 }, { id: 'rschumann', text: 'Robert Schumann', year: 1810 },
    { id: 'wagner', text: 'Richard Wagner', year: 1813 }, { id: 'cschumann', text: 'Clara Schumann', year: 1819 },
  ];

  /* ---------- Musik anderer Länder ---------- */
  const WORLD = [
    { id: 'didgeridoo', name: 'das Didgeridoo', land: 'Australien', group: 'Blasinstrument' },
    { id: 'balalaika', name: 'die Balalaika', land: 'Russland', group: 'Zupfinstrument' },
    { id: 'bongos', name: 'die Bongos', land: 'Kuba', group: 'Schlaginstrument', plural: true },
    { id: 'panfloete', name: 'die Panflöte', land: 'Peru', group: 'Blasinstrument' },
    { id: 'dudelsack', name: 'der Dudelsack', land: 'Schottland', group: 'Blasinstrument' },
    { id: 'sitar', name: 'die Sitar', land: 'Indien', group: 'Zupfinstrument' },
  ];
  const DANCES = [
    { id: 'walzer', name: 'Walzer', land: 'Österreich' }, { id: 'polka', name: 'Polka', land: 'Tschechien' }, { id: 'flamenco', name: 'Flamenco', land: 'Spanien' },
    { id: 'samba', name: 'Samba', land: 'Brasilien' }, { id: 'tango', name: 'Tango', land: 'Argentinien' }, { id: 'sirtaki', name: 'Sirtaki', land: 'Griechenland' },
  ];
  const LANDS = WORLD.concat(DANCES).map((x) => x.land);

  /* ---------- Notizkarten ---------- */
  // fig: a drawing under the lines (generated markup)
  const tableFig = (() => {
    const col = (x, v, a, b) => `<path d="M${x - 30} 22 H${x + 30} M${x - 30} 32 H${x + 30} M${x - 30} 42 H${x + 30} M${x - 30} 52 H${x + 30} M${x - 30} 62 H${x + 30}" stroke="#9AA3C2" stroke-width="1"/>`
      + noteSVG(x - 14, 3, v) + restSVG(x + 16, v) + `<text x="${x}" y="84" font-size="12" font-weight="700" text-anchor="middle" fill="${INK}">${a}</text><text x="${x}" y="100" font-size="11" text-anchor="middle" fill="${INK}">${b}</text>`;
    return box(320, 110, col(40, 8, 'Ganze', '4 Viertel') + col(118, 4, 'Halbe', '2 Viertel') + col(196, 2, 'Viertel', '1 Viertel') + col(276, 1, 'Achtel', 'halbes Viertel'), 'Tabelle: Noten und Pausen mit ihrer Dauer', 360);
  })();
  const scaleFig = box(300, 96, LINES(6, 294) + CLEF + [0, 1, 2, 3, 4, 5, 6, 7].map((s) => noteSVG(64 + s * 30, s, 2) + `<text x="${64 + s * 30}" y="90" font-size="12" font-weight="700" text-anchor="middle" fill="#3B7DD8">${TONES[s]}</text>`).join(''), 'Notensystem mit den Tönen c, d, e, f, g, a, h, c', 360);
  const NOTES = {
    notenwerte: { title: 'Notenwerte', fig: tableFig, lines: ['Ganze Note: leerer Notenkopf ohne Hals. Sie dauert 4 Viertel.', 'Halbe Note: leerer Notenkopf mit Hals. Sie dauert 2 Viertel.', 'Viertelnote: ausgemalter Notenkopf mit Hals. Sie dauert 1 Viertel.', 'Achtelnote: ausgemalter Notenkopf mit Hals und Fähnchen. 2 Achtel dauern 1 Viertel.', 'Zu jeder Note gibt es eine Pause, die genauso lange dauert. Bei einer Pause wird nicht gespielt.', 'Die ganze Pause hängt unter einer Linie, die halbe Pause sitzt auf einer Linie.'] },
    takt: { title: 'Der Takt', lines: ['Die Taktangabe steht am Anfang: 2/4 heißt 2 Viertel in jedem Takt, 3/4 heißt 3 Viertel, 4/4 heißt 4 Viertel.', 'Taktstriche trennen die Takte.', 'Im 2/4-Takt zählt man 1 – 2, im 3/4-Takt 1 – 2 – 3, im 4/4-Takt 1 – 2 – 3 – 4.', 'Rechne in Vierteln: halbe Note 2, Viertelnote 1, Achtelnote die Hälfte. Pausen zählen genauso.'] },
    schluessel: { title: 'Der Violinschlüssel', fig: scaleFig, lines: ['Fünf Linien bilden das Notensystem. Man zählt sie von unten.', 'Der Violinschlüssel heißt auch G-Schlüssel. Seine Schnecke dreht sich um die zweite Linie: Dort steht das g.', 'Das c steht unter dem Notensystem auf einer Hilfslinie, das d darunter im Zwischenraum, das e auf der ersten Linie.', 'Die Töne heißen c, d, e, f, g, a, h, c. Je höher die Note steht, desto höher klingt der Ton.'] },
    familien: { title: 'Instrumentenfamilien', lines: ['Streichinstrumente: Geige, Cello, Kontrabass. Ein Bogen streicht über die Saiten.', 'Zupfinstrumente: Gitarre, Harfe. Die Saiten werden gezupft.', 'Holzblasinstrumente: Blockflöte, Querflöte, Klarinette. Die Querflöte ist meist aus Metall und gehört trotzdem dazu.', 'Blechblasinstrumente: Trompete, Posaune, Horn. Die Lippen schwingen am Mundstück.', 'Schlaginstrumente: Pauke, Trommel, Xylofon. Man schlägt auf ein Fell oder auf Platten.', 'Tasteninstrumente: Klavier, Orgel, Akkordeon. Man drückt Tasten.'] },
    begriffe: { title: 'Fachbegriffe', lines: ['piano (p): leise. pianissimo (pp): sehr leise.', 'forte (f): laut. fortissimo (ff): sehr laut.', 'crescendo: allmählich lauter werden. Das Zeichen ist eine Gabel, die sich öffnet.', 'decrescendo: allmählich leiser werden. Das Zeichen ist eine Gabel, die sich schließt.', 'Tempo: wie schnell oder langsam die Musik ist.', 'Hohe Töne klingen hell, tiefe Töne dunkel. Kurze Saiten und kleine Instrumente klingen höher.', 'Die Fachbegriffe kommen aus dem Italienischen.'] },
    komponisten: { title: 'Komponisten', lines: ['Johann Sebastian Bach, geboren 1685 in Eisenach: Thomaskantor in Leipzig. Er leitete den Thomanerchor und spielte Orgel.', 'Wolfgang Amadeus Mozart, geboren 1756 in Salzburg: spielte schon als Kind vor Königen. Er schrieb die Oper „Die Zauberflöte“.', 'Ludwig van Beethoven, geboren 1770 in Bonn: wurde taub und komponierte trotzdem weiter. „Für Elise“, „Ode an die Freude“.', 'Robert Schumann, geboren 1810 in Zwickau: studierte in Leipzig und schrieb das „Album für die Jugend“.', 'Richard Wagner, geboren 1813 in Leipzig: schrieb große Opern. In Bayreuth werden sie jeden Sommer gespielt.', 'Clara Schumann, geboren 1819 in Leipzig: berühmte Pianistin und Komponistin, verheiratet mit Robert Schumann.', 'Volkslieder: Wer sie erfunden hat, weiß man oft nicht. Sie wurden von Mensch zu Mensch weitergesungen.'] },
    laender: { title: 'Musik aus aller Welt', lines: ['Didgeridoo (Australien): ein langes Holzrohr, in das man hineinbläst.', 'Balalaika (Russland): dreieckiger Körper und drei Saiten, die man zupft.', 'Bongos (Kuba): zwei kleine Trommeln, die man mit den Händen spielt.', 'Panflöte (Peru und andere Länder in den Anden): verschieden lange Röhren, man bläst darüber.', 'Dudelsack (Schottland): Luft aus einem Sack strömt durch Pfeifen.', 'Sitar (Indien): langer Hals und viele Saiten, die man zupft.', 'Tänze: Walzer (Österreich), Polka (Tschechien), Flamenco (Spanien), Samba (Brasilien), Tango (Argentinien), Sirtaki (Griechenland).'] },
  };

  /* ---------- Fragen ---------- */
  const POOL = [
    // Notenwerte
    { id: 'mnw1', mod: 'noten', g: 'notenwerte', q: 'Welche Note dauert am längsten?', o: ['Die ganze Note', 'Die halbe Note', 'Die Achtelnote'], a: 0 },
    { id: 'mnw2', mod: 'noten', g: 'notenwerte', q: 'Welche Note hat einen ausgemalten Notenkopf, einen Hals und ein Fähnchen?', o: ['Die Achtelnote', 'Die Viertelnote', 'Die halbe Note'], a: 0 },
    { id: 'mnw3', mod: 'noten', g: 'notenwerte', q: 'Welche Note hat einen leeren Notenkopf und keinen Hals?', o: ['Die ganze Note', 'Die halbe Note', 'Die Viertelnote'], a: 0 },
    { id: 'mnw4', mod: 'noten', g: 'notenwerte', q: 'Welche Note hat einen leeren Notenkopf mit Hals?', o: ['Die halbe Note', 'Die ganze Note', 'Die Achtelnote'], a: 0 },
    { id: 'mnw5', mod: 'noten', g: 'notenwerte', q: 'Eine halbe Note dauert so lange wie zwei Viertelnoten.', rf: true, a: true },
    { id: 'mnw6', mod: 'noten', g: 'notenwerte', q: 'Eine Achtelnote dauert länger als eine Viertelnote.', rf: true, a: false, why: 'Eine Achtelnote dauert halb so lange wie eine Viertelnote.' },
    { id: 'mnw7', mod: 'noten', g: 'notenwerte', q: 'Was zeigt eine Pause in den Noten?', o: ['Hier wird nicht gespielt und nicht gesungen', 'Hier wird besonders laut gespielt', 'Hier ist das Lied zu Ende'], a: 0 },
    { id: 'mnw8', mod: 'noten', g: 'notenwerte', q: 'Eine Viertelpause dauert so lange wie eine Viertelnote.', rf: true, a: true },
    { id: 'mnw9', mod: 'noten', g: 'notenwerte', q: 'Wie heißt der Strich an einer Note?', o: ['Notenhals', 'Notenkopf', 'Notenschlüssel'], a: 0 },
    { id: 'mnw10', mod: 'noten', g: 'notenwerte', q: 'Zwei Achtelnoten werden oft mit einem Balken verbunden.', rf: true, a: true },
    // Takt
    { id: 'mtk1', mod: 'takt', g: 'takt', q: 'Was steht am Anfang nach dem Notenschlüssel und zeigt, wie viele Schläge in einen Takt passen?', o: ['Die Taktangabe', 'Der Taktstrich', 'Die Pause'], a: 0 },
    { id: 'mtk2', mod: 'takt', g: 'takt', q: 'Was trennt die Takte voneinander?', o: ['Der Taktstrich', 'Der Notenhals', 'Der Notenschlüssel'], a: 0 },
    { id: 'mtk3', mod: 'takt', g: 'takt', q: 'In jeden Takt eines 3/4-Takts passen drei Viertelnoten.', rf: true, a: true },
    { id: 'mtk4', mod: 'takt', g: 'takt', q: 'Wie viele Viertel hat ein 2/4-Takt?', o: ['2', '3', '4'], a: 0 },
    { id: 'mtk5', mod: 'takt', g: 'takt', q: 'Wie zählt man im 3/4-Takt?', o: ['1 – 2 – 3', '1 – 2', '1 – 2 – 3 – 4'], a: 0 },
    { id: 'mtk6', mod: 'takt', g: 'takt', q: 'Im 4/4-Takt füllt eine ganze Note genau einen Takt.', rf: true, a: true },
    { id: 'mtk7', mod: 'takt', g: 'takt', q: 'Wie viele Achtelnoten passen in einen 3/4-Takt?', o: ['6', '3', '8'], a: 0 },
    { id: 'mtk8', mod: 'takt', g: 'takt', q: 'In einen 2/4-Takt passt eine ganze Note.', rf: true, a: false, why: 'Eine ganze Note dauert 4 Viertel, ein 2/4-Takt hat nur 2.' },
    // Violinschlüssel
    { id: 'mvs1', mod: 'ton', g: 'schluessel', q: 'Wie heißt der Notenschlüssel, mit dem die meisten Kinderlieder geschrieben sind?', o: ['Violinschlüssel', 'Bassschlüssel', 'Tonschlüssel'], a: 0 },
    { id: 'mvs2', mod: 'ton', g: 'schluessel', q: 'Um welche Linie dreht sich die Schnecke des Violinschlüssels?', o: ['Um die zweite Linie von unten, die g-Linie', 'Um die unterste Linie', 'Um die oberste Linie'], a: 0 },
    { id: 'mvs3', mod: 'ton', g: 'schluessel', q: 'Wie viele Linien hat ein Notensystem?', o: ['5', '4', '6'], a: 0 },
    { id: 'mvs4', mod: 'ton', g: 'schluessel', q: 'Welcher Ton steht auf der Hilfslinie unter den fünf Linien?', o: ['c', 'e', 'g'], a: 0 },
    { id: 'mvs5', mod: 'ton', g: 'schluessel', q: 'Je höher eine Note im Notensystem steht, desto höher klingt der Ton.', rf: true, a: true },
    { id: 'mvs6', mod: 'ton', g: 'schluessel', q: 'Wie heißen die Töne von c bis c?', o: ['c, d, e, f, g, a, h, c', 'c, d, e, f, g, a, b, c', 'a, b, c, d, e, f, g, a'], a: 0 },
    { id: 'mvs7', mod: 'ton', g: 'schluessel', q: 'Wo steht das e?', o: ['Auf der untersten Linie', 'Auf der obersten Linie', 'Auf der mittleren Linie'], a: 0 },
    { id: 'mvs8', mod: 'ton', g: 'schluessel', q: 'Wo steht das h?', o: ['Auf der mittleren Linie', 'Auf der untersten Linie', 'Auf der obersten Linie'], a: 0 },
    // Instrumente
    { id: 'min1', mod: 'instr', g: 'familien', q: 'Womit streicht man über die Saiten der Geige?', o: ['Mit dem Bogen', 'Mit einem Schlägel', 'Mit dem Mundstück'], a: 0 },
    { id: 'min2', mod: 'instr', g: 'familien', q: 'Welches Streichinstrument ist das größte?', o: ['Der Kontrabass', 'Die Geige', 'Das Cello'], a: 0 },
    { id: 'min3', mod: 'instr', g: 'familien', q: 'Die Trompete ist ein Holzblasinstrument.', rf: true, a: false, why: 'Die Trompete ist aus Blech. Sie ist ein Blechblasinstrument.' },
    { id: 'min4', mod: 'instr', g: 'familien', q: 'Die Querflöte ist meist aus Metall und gehört trotzdem zu den Holzblasinstrumenten.', rf: true, a: true },
    { id: 'min5', mod: 'instr', g: 'familien', q: 'Welches Instrument hat einen Zug, den man vor- und zurückschiebt?', o: ['Die Posaune', 'Die Trompete', 'Die Klarinette'], a: 0 },
    { id: 'min6', mod: 'instr', g: 'familien', q: 'Welches Instrument hat viele Pfeifen und steht oft in der Kirche?', o: ['Die Orgel', 'Das Klavier', 'Die Harfe'], a: 0 },
    { id: 'min7', mod: 'instr', g: 'familien', q: 'Wie viele Tasten hat ein Klavier meistens?', o: ['88', '52', '100'], a: 0 },
    { id: 'min8', mod: 'instr', g: 'familien', q: 'Welches Instrument hat Holzplatten, auf die man mit Schlägeln schlägt?', o: ['Das Xylofon', 'Die Pauke', 'Die Harfe'], a: 0 },
    { id: 'min9', mod: 'instr', g: 'familien', q: 'Was schwingt bei der Gitarre, wenn sie klingt?', o: ['Die Saiten', 'Ein Fell', 'Die Tasten'], a: 0 },
    { id: 'min10', mod: 'instr', g: 'familien', q: 'Welche Instrumente gehören zu den Blechblasinstrumenten?', o: ['Trompete, Posaune und Horn', 'Geige, Cello und Kontrabass', 'Pauke, Trommel und Xylofon'], a: 0 },
    { id: 'min11', mod: 'instr', g: 'familien', q: 'Was haben Geige, Cello und Kontrabass gemeinsam?', o: ['Man streicht sie mit einem Bogen', 'Man bläst hinein', 'Man drückt Tasten'], a: 0 },
    { id: 'min12', mod: 'instr', g: 'familien', q: 'Die Harfe ist ein Zupfinstrument.', rf: true, a: true },
    { id: 'min13', mod: 'instr', g: 'familien', q: 'Bei welchem Instrument schwingt ein Fell?', o: ['Bei der Trommel', 'Bei der Gitarre', 'Bei der Blockflöte'], a: 0 },
    { id: 'min14', mod: 'instr', g: 'orchester', q: 'Was ist ein Orchester?', o: ['Viele Musikerinnen und Musiker, die zusammen spielen', 'Ein einzelnes Instrument', 'Ein Notenschlüssel'], a: 0 },
    { id: 'min15', mod: 'instr', g: 'orchester', q: 'Wer leitet das Orchester?', o: ['Die Dirigentin oder der Dirigent', 'Das Publikum', 'Der Notenwart'], a: 0 },
    { id: 'min16', mod: 'instr', g: 'orchester', q: 'Womit zeigt die Dirigentin dem Orchester den Takt?', o: ['Mit dem Taktstock', 'Mit der Stimmgabel', 'Mit dem Notenpult'], a: 0 },
    { id: 'min17', mod: 'instr', g: 'familien', q: 'Beim Akkordeon zieht man den Balg auseinander und drückt ihn wieder zusammen.', rf: true, a: true },
    // Fachbegriffe, Tempo, Tonhöhe
    { id: 'mfb1', mod: 'begriffe', g: 'begriffe', q: 'In welcher Sprache sind die Wörter piano und forte?', o: ['Italienisch', 'Englisch', 'Französisch'], a: 0 },
    { id: 'mfb2', mod: 'begriffe', g: 'begriffe', q: 'Wie nennt man, wie schnell oder langsam Musik ist?', o: ['Tempo', 'Takt', 'Tonhöhe'], a: 0 },
    { id: 'mfb3', mod: 'begriffe', g: 'begriffe', q: 'Ein Schlaflied singt man meistens langsam und leise.', rf: true, a: true },
    { id: 'mfb4', mod: 'begriffe', g: 'begriffe', q: 'Die Geige klingt höher als der Kontrabass.', rf: true, a: true },
    { id: 'mfb5', mod: 'begriffe', g: 'begriffe', q: 'Je kürzer eine Saite ist, desto tiefer klingt sie.', rf: true, a: false, why: 'Je kürzer die Saite, desto höher klingt der Ton.' },
    { id: 'mfb6', mod: 'begriffe', g: 'begriffe', q: 'Welches Instrument kann besonders tiefe Töne spielen?', o: ['Der Kontrabass', 'Die Querflöte', 'Die Geige'], a: 0 },
    { id: 'mfb7', mod: 'begriffe', g: 'begriffe', q: 'Welches Wort sagt etwas über die Lautstärke?', o: ['forte', 'Tempo', 'Takt'], a: 0 },
    { id: 'mfb8', mod: 'begriffe', g: 'begriffe', q: 'Große Instrumente klingen meist tiefer als kleine.', rf: true, a: true },
    { id: 'mfb9', mod: 'begriffe', g: 'begriffe', q: 'Wie klingen tiefe Töne?', o: ['Dunkel und brummig', 'Hell und piepsig', 'Gar nicht'], a: 0 },
    { id: 'mfb10', mod: 'begriffe', g: 'begriffe', q: 'Bei einem Crescendo wird die Musik allmählich leiser.', rf: true, a: false, why: 'Bei einem Crescendo wird die Musik allmählich lauter.' },
    // Komponisten
    { id: 'mko1', mod: 'komp', g: 'komponisten', q: 'Johann Sebastian Bach war Thomaskantor in Leipzig. Was machte er dort?', o: ['Er leitete den Thomanerchor und schrieb Musik für die Kirche', 'Er baute Klaviere', 'Er verkaufte Noten auf dem Markt'], a: 0 },
    { id: 'mko2', mod: 'komp', g: 'komponisten', q: 'Wie heißt der Knabenchor, den Bach in Leipzig leitete?', o: ['Der Thomanerchor', 'Der Kreuzchor', 'Die Wiener Sängerknaben'], a: 0 },
    { id: 'mko3', mod: 'komp', g: 'komponisten', q: 'Johann Sebastian Bach spielte sehr gut Orgel.', rf: true, a: true },
    { id: 'mko4', mod: 'komp', g: 'komponisten', q: 'Johann Sebastian Bach hatte 20 Kinder.', rf: true, a: true },
    { id: 'mko5', mod: 'komp', g: 'komponisten', q: 'Wolfgang Amadeus Mozart gab schon als Kind Konzerte vor Königen.', rf: true, a: true },
    { id: 'mko6', mod: 'komp', g: 'komponisten', q: 'Welche Oper hat Mozart geschrieben?', o: ['„Die Zauberflöte“', '„Der Ring des Nibelungen“', '„Hänsel und Gretel“'], a: 0 },
    { id: 'mko7', mod: 'komp', g: 'komponisten', q: 'In welcher Stadt wurde Mozart geboren?', o: ['Salzburg', 'Leipzig', 'Bonn'], a: 0 },
    { id: 'mko8', mod: 'komp', g: 'komponisten', q: 'Ludwig van Beethoven wurde taub. Was tat er trotzdem?', o: ['Er komponierte weiter', 'Er hörte mit der Musik auf', 'Er wurde Maler'], a: 0 },
    { id: 'mko9', mod: 'komp', g: 'komponisten', q: 'In welcher Stadt wurde Beethoven geboren?', o: ['Bonn', 'Salzburg', 'Zwickau'], a: 0 },
    { id: 'mko10', mod: 'komp', g: 'komponisten', q: 'Welche Melodie von Beethoven ist heute die Hymne Europas?', o: ['Die „Ode an die Freude“', '„Alle meine Entchen“', '„Der Mond ist aufgegangen“'], a: 0 },
    { id: 'mko11', mod: 'komp', g: 'komponisten', q: 'Wie heißt ein bekanntes Klavierstück von Beethoven?', o: ['„Für Elise“', '„Die Zauberflöte“', '„Album für die Jugend“'], a: 0 },
    { id: 'mko12', mod: 'komp', g: 'komponisten', q: 'In welcher Stadt wurde Robert Schumann geboren?', o: ['Zwickau', 'Salzburg', 'Bonn'], a: 0 },
    { id: 'mko13', mod: 'komp', g: 'komponisten', q: 'Robert Schumann schrieb Klavierstücke für Kinder, zum Beispiel das „Album für die Jugend“.', rf: true, a: true },
    { id: 'mko14', mod: 'komp', g: 'komponisten', q: 'Was war Clara Schumann?', o: ['Eine berühmte Pianistin und Komponistin', 'Eine Königin', 'Eine Ärztin'], a: 0 },
    { id: 'mko15', mod: 'komp', g: 'komponisten', q: 'In welcher Stadt wurde Clara Schumann geboren?', o: ['Leipzig', 'Bonn', 'Salzburg'], a: 0 },
    { id: 'mko16', mod: 'komp', g: 'komponisten', q: 'Clara und Robert Schumann waren verheiratet.', rf: true, a: true },
    { id: 'mko17', mod: 'komp', g: 'komponisten', q: 'In welcher Stadt wurde Richard Wagner geboren?', o: ['Leipzig', 'Salzburg', 'Zwickau'], a: 0 },
    { id: 'mko18', mod: 'komp', g: 'komponisten', q: 'Was schrieb Richard Wagner vor allem?', o: ['Große Opern', 'Kinderlieder', 'Klavierstücke für Anfänger'], a: 0 },
    { id: 'mko19', mod: 'komp', g: 'komponisten', q: 'In welcher Stadt werden jeden Sommer Opern von Richard Wagner gespielt, in einem Festspielhaus, das er bauen ließ?', o: ['Bayreuth', 'Bonn', 'Zwickau'], a: 0 },
    { id: 'mko20', mod: 'komp', g: 'komponisten', q: 'Was macht eine Komponistin oder ein Komponist?', o: ['Sie erfinden Musik und schreiben sie auf', 'Sie bauen Geigen', 'Sie verkaufen Eintrittskarten'], a: 0 },
    { id: 'mko21', mod: 'komp', g: 'komponisten', q: 'Was ist ein Volkslied?', o: ['Ein altes Lied, das viele Menschen kennen und weitersingen', 'Ein Lied, das nur ein einziger Mensch kennt', 'Ein Lied ohne Melodie'], a: 0 },
    { id: 'mko22', mod: 'komp', g: 'komponisten', q: 'Bei vielen Volksliedern weiß man nicht, wer sie erfunden hat.', rf: true, a: true },
    { id: 'mko23', mod: 'komp', g: 'komponisten', q: 'Johann Sebastian Bach lebte nach Robert Schumann.', rf: true, a: false, why: 'Bach wurde 1685 geboren, Robert Schumann erst 1810.' },
    // Musik anderer Länder
    { id: 'mml1', mod: 'laender', g: 'laender', q: 'Das Didgeridoo ist ein langes Holzrohr, in das man hineinbläst.', rf: true, a: true },
    { id: 'mml2', mod: 'laender', g: 'laender', q: 'Die Balalaika hat einen dreieckigen Körper und drei Saiten.', rf: true, a: true },
    { id: 'mml3', mod: 'laender', g: 'laender', q: 'Bongos spielt man mit den Händen.', rf: true, a: true },
    { id: 'mml4', mod: 'laender', g: 'laender', q: 'Wie entsteht beim Dudelsack der Ton?', o: ['Luft aus einem Sack strömt durch Pfeifen', 'Man zupft Saiten', 'Man schlägt auf ein Fell'], a: 0 },
    { id: 'mml5', mod: 'laender', g: 'laender', q: 'Die Sitar hat einen langen Hals und viele Saiten. Aus welchem Land kommt sie?', o: ['Aus Indien', 'Aus Kuba', 'Aus Schottland'], a: 0 },
    { id: 'mml6', mod: 'laender', g: 'laender', q: 'Die Panflöte besteht aus mehreren Röhren, die verschieden lang sind.', rf: true, a: true },
    { id: 'mml7', mod: 'laender', g: 'laender', q: 'Der Wiener Walzer steht im 3/4-Takt.', rf: true, a: true },
    { id: 'mml8', mod: 'laender', g: 'laender', q: 'Den Flamenco tanzt man vor allem in Schweden.', rf: true, a: false, why: 'Der Flamenco kommt aus Spanien.' },
    { id: 'mml9', mod: 'laender', g: 'laender', q: 'Welches Instrument kommt aus Australien?', o: ['Das Didgeridoo', 'Die Balalaika', 'Die Sitar'], a: 0 },
    { id: 'mml10', mod: 'laender', g: 'laender', q: 'Was sind Bongos?', o: ['Zwei kleine Trommeln', 'Eine Flöte aus Holz', 'Ein Instrument mit drei Saiten'], a: 0 },
    // Lückentext
    { id: 'mlt1', mod: 'lt', g: 'notenwerte', q: 'Eine ganze Note dauert so lange wie zwei ___ Noten.', o: ['halbe', 'ganze', 'viele'], a: 0 },
    { id: 'mlt2', mod: 'lt', g: 'schluessel', q: 'Der Violinschlüssel heißt auch ___.', o: ['G-Schlüssel', 'F-Schlüssel', 'Hausschlüssel'], a: 0 },
    { id: 'mlt3', mod: 'lt', g: 'takt', q: 'Die Takte werden durch den ___ getrennt.', o: ['Taktstrich', 'Notenhals', 'Bogen'], a: 0 },
    { id: 'mlt4', mod: 'lt', g: 'begriffe', q: 'Das Wort „forte“ bedeutet ___.', o: ['laut', 'leise', 'langsam'], a: 0 },
    { id: 'mlt5', mod: 'lt', g: 'begriffe', q: 'Wird die Musik allmählich leiser, heißt das ___.', o: ['decrescendo', 'crescendo', 'forte'], a: 0 },
    { id: 'mlt6', mod: 'lt', g: 'komponisten', q: 'Johann Sebastian Bach war Thomaskantor in ___.', o: ['Leipzig', 'Bonn', 'Salzburg'], a: 0 },
    { id: 'mlt7', mod: 'lt', g: 'komponisten', q: 'Robert Schumann wurde in ___ geboren.', o: ['Zwickau', 'Bayreuth', 'Salzburg'], a: 0 },
    { id: 'mlt8', mod: 'lt', g: 'familien', q: 'Bei der Geige streicht man mit dem ___ über die Saiten.', o: ['Bogen', 'Schlägel', 'Balg'], a: 0 },
    { id: 'mlt9', mod: 'lt', g: 'familien', q: 'Bei der Trommel schwingt das ___.', o: ['Fell', 'Mundstück', 'Rohrblatt'], a: 0 },
    { id: 'mlt10', mod: 'lt', g: 'schluessel', q: 'Das c steht unter den fünf Linien auf einer ___.', o: ['Hilfslinie', 'Taktlinie', 'Mittellinie'], a: 0 },
    { id: 'mlt11', mod: 'lt', g: 'laender', q: 'Die Bongos kommen aus ___.', o: ['Kuba', 'Schweden', 'Indien'], a: 0 },
    { id: 'mlt12', mod: 'lt', g: 'komponisten', q: 'Mozart wurde in ___ geboren.', o: ['Salzburg', 'Leipzig', 'Zwickau'], a: 0 },
  ];
  NOTES.orchester = { title: 'Das Orchester', lines: ['Im Orchester spielen viele Musikerinnen und Musiker zusammen.', 'Vorn stehen die Streichinstrumente, dahinter die Holzbläser, dann die Blechbläser. Ganz hinten stehen Pauken und Schlaginstrumente.', 'Die Dirigentin oder der Dirigent leitet das Orchester. Mit dem Taktstock zeigt sie den Takt, das Tempo und wie laut gespielt wird.'] };

  const MODULES = {
    noten: { name: 'Notenwerte', icon: '🎵', maxTier: 2, worldCap: [2], dmg: 12 },
    takt: { name: 'Takt ergänzen', icon: '🥁', maxTier: 2, worldCap: [2], dmg: 14 },
    ton: { name: 'Tonhöhen', icon: '🎼', maxTier: 2, worldCap: [2], dmg: 12 },
    instr: { name: 'Instrumente', icon: '🎻', maxTier: 2, worldCap: [2], dmg: 12 },
    begriffe: { name: 'Fachbegriffe', icon: '🔊', maxTier: 1, worldCap: [1], dmg: 12 },
    komp: { name: 'Komponisten', icon: '🎹', maxTier: 1, worldCap: [1], dmg: 12 },
    laender: { name: 'Musik der Welt', icon: '🌍', maxTier: 1, worldCap: [1], dmg: 10 },
    lt: { name: 'Lückentext', icon: '✏️', maxTier: 1, worldCap: [1], dmg: 10 },
  };
  const TUT = {
    'noten:1': { title: 'Notenwerte', steps: ['Schau dir den Notenkopf an: leer oder ausgemalt?', 'Dann den Hals und das Fähnchen: ganze Note ohne Hals, halbe Note leer mit Hals, Viertelnote ausgemalt mit Hals, Achtelnote mit Fähnchen.', 'Bei Pausen: Die ganze Pause hängt unter der Linie, die halbe Pause sitzt auf der Linie.', 'Tippe auf den richtigen Namen oder das richtige Bild.'] },
    'noten:2': { title: 'Notenwerte rechnen', steps: ['Rechne alles in Vierteln: ganze Note 4, halbe Note 2, Viertelnote 1. Zwei Achtel sind zusammen 1 Viertel.', 'Beispiel: halbe Note und Viertelnote sind 2 + 1 = 3 Viertel.', 'Beispiel: In einen 2/4-Takt passen 2 Viertel, also 4 Achtel.', 'Tippe die Zahl ein und drücke ✓.'] },
    'takt:1': { title: 'Takt ergänzen', steps: ['Die Taktangabe sagt, wie viele Viertel in den Takt passen: 2/4 sind 2, 3/4 sind 3.', 'Zähle, was schon da ist. Beispiel im 3/4-Takt: eine halbe Note ist 2 Viertel, es fehlt also 1 Viertel.', 'Tippe auf die Note, die genau in die Lücke passt.'] },
    'takt:2': { title: 'Takt ergänzen mit Pausen', steps: ['Jetzt kommt auch der 4/4-Takt: Dort passen 4 Viertel hinein.', 'Pausen zählen genauso lange wie ihre Noten. Eine Viertelpause ist 1 Viertel.', 'Beispiel im 4/4-Takt: halbe Note und Viertelpause sind 3 Viertel, es fehlt 1 Viertel.', 'Tippe auf die Note, die genau in die Lücke passt.'] },
    'ton:1': { title: 'Tonhöhen', steps: ['Zähle von unten: Das e steht auf der untersten Linie, das g auf der zweiten Linie, wo sich der Violinschlüssel dreht.', 'Die Töne gehen abwechselnd auf und zwischen die Linien: c (Hilfslinie), d, e, f, g, a, h, c.', 'Tippe auf den Namen der Note.'] },
    'ton:2': { title: 'Töne finden', steps: ['Oben steht der Name eines Tons.', 'Such die Linie oder den Zwischenraum: Das g sitzt auf der zweiten Linie von unten, das h auf der mittleren Linie.', 'Tippe auf das Notensystem mit diesem Ton.'] },
    'instr:1': { title: 'Instrumente', steps: ['Lies die Beschreibung oder den Namen des Instruments.', 'Überlege, wie man es spielt: streichen, zupfen, blasen, schlagen oder Tasten drücken. So findest du die Familie.', 'Tippe auf die richtige Antwort.'] },
    'instr:2': { title: 'Wie entsteht der Ton?', steps: ['Jedes Instrument bringt etwas zum Schwingen: eine Saite, die Luft, ein Fell oder eine Platte.', 'Beispiel: Beim Cello streicht ein Bogen über die Saiten. Bei der Trompete bläst man Luft hinein.', 'Tippe auf die richtige Antwort.'] },
    'begriffe:1': { title: 'Fachbegriffe', steps: ['piano heißt leise, forte heißt laut. Doppelt geschrieben (pp, ff) heißt es sehr leise oder sehr laut.', 'crescendo: allmählich lauter. decrescendo: allmählich leiser.', 'Tippe auf die richtige Bedeutung.'] },
    'komp:1': { title: 'Komponisten', steps: ['Fragen zu Bach, Mozart, Beethoven, Robert und Clara Schumann, Wagner und zu Volksliedern.', 'Merk dir zu jedem eine Stadt und ein Werk. Beispiel: Bach – Leipzig – Thomanerchor.', 'Tippe auf die richtige Antwort.'] },
    'kompord:1': { title: 'Wer lebte zuerst?', steps: ['Vier Komponisten sind durcheinander.', 'Tippe zuerst den an, der am frühesten geboren wurde. Bach (1685) war der erste, Clara Schumann (1819) die letzte.', 'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.'] },
    'laender:1': { title: 'Musik der Welt', steps: ['Instrumente und Tänze aus anderen Ländern.', 'Beispiel: Das Didgeridoo kommt aus Australien, der Flamenco aus Spanien.', 'Tippe auf die richtige Antwort.'] },
    'lt:1': { title: 'Lückentext', steps: ['Im Satz fehlt ein Wort (___).', 'Lies den Satz mit jedem Wort einmal durch.', 'Tippe auf das Wort, das passt.'] },
  };

  /* ---------- Aufgaben ---------- */
  // number task: picture and question in `fig`; beats (in eighths) and unit let tests and the bot recount it
  const num = (mod, q, svg, beats, unit, qid, show) => ({ kind: 'num', mod, tier: 2, group: mod + ':2', note: 'notenwerte', fig: `<div class="mus">${svg || ''}<div class="question">${q}</div></div>`, answers: [beats.reduce((a, b) => a + b, 0) / unit], beats, unit, maxLen: 2, qid, show });
  // [Frage, Dauer in Achteln, Einheit in Achteln]
  const FACTS = [
    ['Wie viele Viertelnoten dauern so lange wie eine halbe Note?', 4, 2], ['Wie viele Viertelnoten dauern so lange wie eine ganze Note?', 8, 2],
    ['Wie viele Achtelnoten dauern so lange wie eine Viertelnote?', 2, 1], ['Wie viele Achtelnoten dauern so lange wie eine halbe Note?', 4, 1],
    ['Wie viele Achtelnoten dauern so lange wie eine ganze Note?', 8, 1], ['Wie viele halbe Noten dauern so lange wie eine ganze Note?', 8, 4],
    ['Wie viele Achtel passen in einen 2/4-Takt?', 4, 1], ['Wie viele Achtel passen in einen 3/4-Takt?', 6, 1], ['Wie viele Achtel passen in einen 4/4-Takt?', 8, 1],
    ['Wie viele Viertel passen in einen 3/4-Takt?', 6, 2], ['Wie viele halbe Noten passen in einen 4/4-Takt?', 8, 4], ['Wie viele Viertelpausen dauern so lange wie eine halbe Pause?', 4, 2],
  ];
  const unitName = { 1: 'Achtel', 2: 'Viertel', 4: 'halbe Noten' };
  function notenTask(tier) {
    if (tier >= 2) {
      if (Math.random() < 0.5) { const [q, b, u] = pick(FACTS); const n = b / u; return num('noten', q, '', [b], u, 'mnz_' + FACTS.findIndex((f) => f[0] === q), `${n} ${unitName[u]}`); }
      // picture: two or three notes, counted in quarters (eighths come in pairs)
      const vs = shuffle([8, 4, 4, 2, 2, 2, 1]).slice(0, 2 + Math.floor(Math.random() * 2)); if (vs.includes(1)) vs.push(1);
      vs.sort((a, b) => b - a); let x = 30; const body = vs.map((v) => { const s = noteSVG(x, pick([2, 3, 4, 5]), v); x += W[v] || 44; return s; }).join('');
      const n = vs.reduce((a, b) => a + b, 0) / 2;
      return num('noten', 'Wie viele Viertel dauern diese Noten zusammen?', staff(x + 8, body, 'Noten im Notensystem', false, 300), vs, 2, 'mns_' + vs.join(''), `${n} Viertel`);
    }
    const it = pick(VALUES); const same = VALUES.filter((x) => x.rest === it.rest);
    if (Math.random() < 0.6) return choice('noten', 'notenwerte', it.rest ? 'Wie heißt diese Pause?' : 'Wie heißt diese Note?', it.name, others(same, it, 2).map((x) => x.name), 'mbild_' + it.id, { pic: valuePic(it) });
    const opts = [it].concat(others(same, it, 2));
    return { kind: 'choice', mod: 'noten', tier: 1, group: 'noten:1', note: 'notenwerte', q: `Tippe auf ${it.acc}.`, options: shuffle(opts.map(valueOpt)), answer: valueOpt(it), svgOpts: true, why: `So sieht ${it.acc} aus:`, qid: 'mfind_' + it.id };
  }
  function taktTask(tier) {
    const b = makeBar(tier);
    return { kind: 'choice', mod: 'takt', tier, group: 'takt:' + tier, note: 'takt', q: 'Welche Note fehlt, damit der Takt voll ist?', pic: barSVG(b.top, b.items, b.gap), options: shuffle(Object.values(NOTE_OF)), answer: NOTE_OF[b.gap.v], why: `In einen ${b.top}/4-Takt passen ${b.top} Viertel.`, bar: { top: b.top, items: b.items.map((x) => x.v), gap: b.items.indexOf(b.gap) }, qid: `mtakt_${b.top}_${b.gap.v}`, cols: 1 };
  }
  function tonTask(tier) {
    const s = Math.floor(Math.random() * 8); const name = TONES[s];
    if (tier >= 2) {
      const wrong = shuffle([0, 1, 2, 3, 4, 5, 6, 7].filter((x) => TONES[x] !== name)).slice(0, 2);
      return { kind: 'choice', mod: 'ton', tier: 2, group: 'ton:2', note: 'schluessel', q: `Tippe auf das ${name}.`, options: shuffle([s].concat(wrong).map((x) => tonePic(x, true))), answer: tonePic(s, true), svgOpts: true, why: `Hier steht das ${name}:`, step: s, qid: 'mtonf_' + s };
    }
    return choice('ton', 'schluessel', 'Wie heißt dieser Ton?', name, shuffle([...new Set(TONES)].filter((x) => x !== name)).slice(0, 2), 'mton_' + s, { pic: tonePic(s), step: s });
  }
  function begriffeTask() {
    const t = pick(TERMS); const r = Math.random();
    if (r < 0.35) return choice('begriffe', 'begriffe', `Was bedeutet „${t.t}“?`, cap(t.m), others(TERMS, t, 2).map((x) => cap(x.m)), 'mterm_' + t.t);
    if (r < 0.7) return choice('begriffe', 'begriffe', `Wie heißt „${t.m}“ in der Musik?`, t.t, others(TERMS, t, 2).map((x) => x.t), 'mwort_' + t.t);
    return choice('begriffe', 'begriffe', 'Was bedeutet dieses Zeichen?', cap(t.m), others(TERMS, t, 2).map((x) => cap(x.m)), 'mzeichen_' + t.t, { pic: t.pic() });
  }
  function kompTask() {
    if (Math.random() < 0.6) { const idx = shuffle(KOMP.map((_, i) => i)).slice(0, 4).sort((a, b) => a - b); const items = idx.map((i) => KOMP[i]);
      return { kind: 'order', mod: 'komp', tier: 1, group: 'kompord:1', note: 'komponisten', q: 'Wer lebte zuerst? Tippe die Komponisten der Reihe nach an: zuerst den, der am frühesten geboren wurde.', items, order: items.map((x) => x.id), display: shuffle(items), qid: 'mkord_' + idx.join('') }; }
    const [a, b] = shuffle(KOMP.slice()).slice(0, 2); const first = a.year < b.year ? a : b;
    return choice('komp', 'komponisten', `Wer wurde früher geboren: ${a.text} oder ${b.text}?`, first.text, [first === a ? b.text : a.text], 'mkpaar_' + [a.id, b.id].sort().join('_'), { cols: 1 });
  }
  function laenderTask() {
    if (Math.random() < 0.4) { const d = pick(DANCES); return choice('laender', 'laender', `Aus welchem Land kommt der Tanz ${d.name}?`, d.land, others(LANDS, d.land, 2), 'mtanz_' + d.id); }
    const x = pick(WORLD);
    if (Math.random() < 0.5) return choice('laender', 'laender', `Für welches Land ${x.plural ? 'sind' : 'ist'} ${x.name} typisch?`, x.land, others(LANDS, x.land, 2), 'mland_' + x.id);
    return choice('laender', 'laender', `Was ${x.plural ? 'sind' : 'ist'} ${x.name}?`, x.plural ? 'Schlaginstrumente' : 'Ein ' + x.group, ['Blasinstrument', 'Zupfinstrument', 'Schlaginstrument'].filter((g) => g !== x.group).map((g) => (x.plural ? g + 'e' : 'Ein ' + g)), 'mgrp_' + x.id);
  }
  // the topic filter (events) asks the pool; generated tasks only without a topic
  const wantsPool = (mod, opts) => !!(opts && opts.g && POOL.some((p) => p.mod === mod && p.g === opts.g));
  function gen(mod, tier, know, seq, opts) {
    if (wantsPool(mod, opts)) return null;
    const r = Math.random();
    if (mod === 'noten') return tier >= 2 || r < 0.75 ? notenTask(tier) : null;
    if (mod === 'takt') return r < 0.85 ? taktTask(Math.min(tier, 2)) : null;
    if (mod === 'ton') return tier >= 2 || r < 0.8 ? tonTask(tier) : null;
    if (mod === 'instr') return tier >= 2 ? (r < 0.8 ? instrTask(2) : null) : r < 0.65 ? instrTask(1) : null;
    if (mod === 'begriffe') return r < 0.6 ? begriffeTask() : null;
    if (mod === 'komp') return r < 0.45 ? kompTask() : null;
    if (mod === 'laender') return r < 0.6 ? laenderTask() : null;
    return null;
  }

  const MODE = { modules: MODULES, tut: TUT, notes: NOTES, pool: POOL, worlds: 1, title: 'Der Konzertsaal', icon: '🎻', sub: 'Noten und Takt, Tonhöhen, Instrumente, Komponisten und Musik der Welt', gen,
    starters: [{ id: 'dirigentin', type: 'normal', shape: 'dirigentin', names: ['Die Dirigentin', 'Die Dirigentin', 'Die Dirigentin'], hp: 75, desc: 'Sie leitet das Orchester. Mit dem Taktstock zeigt sie Takt, Tempo und Lautstärke. Treffer machen ihr weniger.', perk: 'tank',
      attacks: [{ name: 'Taktstock', mod: 'noten' }, { name: 'Metronom', mod: 'takt' }, { name: 'Stimmgabel', mod: 'ton' }, { name: 'Notenpult', mod: 'instr' }] }],
    extra: { noten: 'Notenbalken', takt: 'Taktstrich', ton: 'Tonleiter', instr: 'Orchestergraben', begriffe: 'Fortissimo', komp: 'Partitur', laender: 'Konzertreise', lt: 'Notenheft' },
    enemies: { 1: {
      normal: [
        { name: 'Der Misston', type: 'normal', shape: 'misston', hp: 26, atk: 3 },
        { name: 'Der Holzwurm', type: 'pflanze', shape: 'holzwurm', hp: 28, atk: 4 },
        { name: 'Die Quietschgeige', type: 'feuer', shape: 'quietschgeige', hp: 24, atk: 4 },
        { name: 'Der Hustenreiz', type: 'wasser', shape: 'hustenreiz', hp: 30, atk: 3 },
      ],
      elite: { name: 'Die Donnerpauke', type: 'feuer', shape: 'donnerpauke', hp: 45, atk: 5 },
      boss: { name: 'Der Krachmacher', acc: 'den Krachmacher', type: 'normal', shape: 'krachmacher', hp: 70, atk: 6, boss: true },
    } },
    moves: ['Schiefer Ton', 'Bohrloch', 'Quietschbogen', 'Hustenanfall', 'Paukenschlag', 'Beckenkrach'],
    events: [
      { title: 'Die Generalprobe', text: 'Das Orchester probt für das Konzert am Abend. Die Konzertmeisterin fragt dich nach den Notenwerten und schenkt dir einen Trank.', opts: [{ label: 'Antworten', task: 'noten', g: 'notenwerte', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Geigenbauwerkstatt', text: 'In der Werkstatt hängen halb fertige Geigen an der Wand. Der Geigenbauer gibt dir einen Schild, wenn du seine Frage zu den Instrumenten beantwortest.', opts: [{ label: 'Antworten', task: 'instr', g: 'familien', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Das Notenarchiv', text: 'Im Archiv liegen alte Noten von Bach und Schumann. Die Archivarin kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort.', opts: [{ label: 'Antworten', task: 'komp', g: 'komponisten', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Das Straßenfest', text: 'Vor dem Konzertsaal spielen Musikerinnen und Musiker aus vielen Ländern. Ein Trommler fragt dich, woher die Instrumente kommen.', opts: [{ label: 'Antworten', task: 'laender', g: 'laender', win: { xp: 20 }, lose: { xp: 5 } }, { label: 'Zuhören (+5 LP)', effect: { hp: 5 } }] },
      { title: 'Die Kasse', text: 'An der Kasse gibt es die letzte Karte für das Konzert. Die Kassiererin schenkt dir einen Schutzengel, wenn du ihre Frage beantwortest.', opts: [{ label: 'Antworten', task: 'any', win: { item: 'engel' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Das Foyer', text: 'In der Pause stehen im Foyer Stühle und ein Tisch mit Wasser. Hier ruhst du dich aus.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
    ] };
  K.MODES.musik = MODE;
  return { MODE, VALUES, TONES, INSTR, FAM, HOW, KOMP, WORLD, DANCES, TERMS, FACTS, makeBar, noteSVG };
})();
if (typeof module !== 'undefined') module.exports = MU;
