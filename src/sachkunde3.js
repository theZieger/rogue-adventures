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
  const ray = (cx, cy, n, len, w, fill, stroke, r0) => Array.from({ length: n }, (_, i) => { const a = (360 / n) * i; return `<ellipse cx="${cx}" cy="${cy - (r0 || 0) - len / 2}" rx="${w}" ry="${len / 2}" fill="${fill}" stroke="${stroke}" stroke-width="1" transform="rotate(${a} ${cx} ${cy})"/>`; }).join('');
  const stem = (d, w, c) => `<path d="${d}" stroke="${c || '#5E9A3A'}" stroke-width="${w || 3}" fill="none" stroke-linecap="round"/>`;
  const leafE = (x, y, rx, ry, rot, fill) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="${fill || '#6BAA3A'}" stroke="#3E6E22" stroke-width="1.5"/>`;
  // Blatt, das von (0,0) nach oben zeigt; wird mit transform an seinen Platz gedreht
  const at = (x, y, rot, inner) => `<g transform="translate(${x} ${y}) rotate(${rot})">${inner}</g>`;
  const LEAF = { fill: '#6BAA3A', stroke: '#3E6E22' };
  const toothed = `<path d="M0 0 L-5 -8 L-2 -10 L-9 -18 L-4 -20 L-11 -30 L-5 -31 L-9 -42 L0 -50 L9 -42 L5 -31 L11 -30 L4 -20 L9 -18 L2 -10 L5 -8 Z" fill="${LEAF.fill}" stroke="${LEAF.stroke}" stroke-width="1.5" stroke-linejoin="round"/><path d="M0 0 L0 -46" stroke="#3E6E22" stroke-width="1"/>`;
  const lance = (len, w) => `<path d="M0 0 Q${w} -${len / 2} 0 -${len} Q-${w} -${len / 2} 0 0 Z" fill="${LEAF.fill}" stroke="${LEAF.stroke}" stroke-width="1.5"/><path d="M0 -2 L0 -${len - 4} M-${w / 3} -6 Q-${w / 2.2} -${len / 2} -1 -${len - 8} M${w / 3} -6 Q${w / 2.2} -${len / 2} 1 -${len - 8}" stroke="#3E6E22" stroke-width=".9" fill="none"/>`;
  const arrowLeaf = `<path d="M0 -46 Q10 -24 7 -4 L13 6 L3 2 L0 8 L-3 2 L-13 6 L-7 -4 Q-10 -24 0 -46 Z" fill="${LEAF.fill}" stroke="${LEAF.stroke}" stroke-width="1.5" stroke-linejoin="round"/><path d="M0 4 L0 -42" stroke="#3E6E22" stroke-width="1"/>`;
  const handLeaf = `${[-60, -30, 0, 30, 60].map((a) => `<g transform="rotate(${a})"><path d="M0 0 L-4 -10 L-2 -12 L-5 -18 L0 -24 L5 -18 L2 -12 L4 -10 Z" fill="${LEAF.fill}" stroke="${LEAF.stroke}" stroke-width="1.3" stroke-linejoin="round"/></g>`).join('')}`;
  const feather = (n, s) => `<path d="M0 0 L0 -${n * 9 + 6}" stroke="#3E6E22" stroke-width="1.6"/>${Array.from({ length: n }, (_, i) => `<ellipse cx="-${4 * s}" cy="-${i * 9 + 6}" rx="${3.6 * s}" ry="${2.6 * s}" fill="${LEAF.fill}" stroke="${LEAF.stroke}" stroke-width="1"/><ellipse cx="${4 * s}" cy="-${i * 9 + 6}" rx="${3.6 * s}" ry="${2.6 * s}" fill="${LEAF.fill}" stroke="${LEAF.stroke}" stroke-width="1"/>`).join('')}<ellipse cx="0" cy="-${n * 9 + 8}" rx="${3.6 * s}" ry="${4 * s}" fill="${LEAF.fill}" stroke="${LEAF.stroke}" stroke-width="1"/>`;
  const trefoil = `${[-50, 0, 50].map((a) => `<g transform="rotate(${a})"><ellipse cx="0" cy="-9" rx="6" ry="9" fill="${LEAF.fill}" stroke="${LEAF.stroke}" stroke-width="1.3"/><path d="M-3 -10 L0 -6 L3 -10" stroke="#DDEFC8" stroke-width="1.6" fill="none"/></g>`).join('')}`;
  const cup = (x, y, r) => `${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${x}" cy="${y - r}" rx="${r * 0.62}" ry="${r * 0.8}" fill="#FFD60A" stroke="#C99A00" stroke-width="1.2" transform="rotate(${a} ${x} ${y})"/>`).join('')}<circle cx="${x}" cy="${y}" r="${r * 0.4}" fill="#9AA22A"/><ellipse cx="${x - r * 0.5}" cy="${y - r * 0.9}" rx="${r * 0.25}" ry="${r * 0.15}" fill="#fff" opacity=".8"/>`;
  const cross4 = (x, y, r) => `${[45, 135, 225, 315].map((a) => `<ellipse cx="${x}" cy="${y - r}" rx="${r * 0.6}" ry="${r * 0.85}" fill="#E6CFF2" stroke="#9A6DB5" stroke-width="1" transform="rotate(${a} ${x} ${y})"/>`).join('')}<circle cx="${x}" cy="${y}" r="${r * 0.3}" fill="#E8C33A"/>`;
  const GROUND = `<path d="M0 160 L120 160" stroke="#6B4423" stroke-width="2.5"/><path d="M4 160 l3 -9 l2 9 M18 160 l-2 -8 l5 8 M100 160 l3 -10 l2 10 M112 160 l-3 -7 l5 7" stroke="#7CB342" stroke-width="1.6" fill="none"/>`;
  function floraSVG(id) {
    let a = '';
    if (id === 'loewenzahn') a = at(60, 158, -70, toothed) + at(60, 158, 70, toothed) + at(60, 158, -30, toothed) + at(60, 158, 25, toothed) + stem('M58 156 Q54 100 46 52', 4, '#8DBE5A') + stem('M62 156 Q72 110 86 70', 3, '#8DBE5A')
      + ray(46, 46, 28, 14, 1.8, '#FFD23F', '#D9A300') + ray(46, 46, 20, 9, 1.6, '#FFC300', '#D9A300') + `<circle cx="46" cy="46" r="4" fill="#E8A800"/>`
      + `<g stroke="#B9C2CF" stroke-width="1">${Array.from({ length: 18 }, (_, i) => { const t = (i / 18) * Math.PI * 2; return `<path d="M86 60 L${(86 + Math.cos(t) * 15).toFixed(1)} ${(60 + Math.sin(t) * 15).toFixed(1)}"/>`; }).join('')}</g>`
      + Array.from({ length: 18 }, (_, i) => { const t = (i / 18) * Math.PI * 2; return `<circle cx="${(86 + Math.cos(t) * 16).toFixed(1)}" cy="${(60 + Math.sin(t) * 16).toFixed(1)}" r="1.8" fill="#fff" stroke="#9AA3B5" stroke-width=".6"/>`; }).join('') + `<circle cx="86" cy="60" r="3" fill="#8A6A3F"/>`;
    else if (id === 'gaensebluemchen') a = [-70, -35, 0, 35, 70].map((r) => at(60, 158, r, '<ellipse cx="0" cy="-12" rx="6" ry="11" fill="#6BAA3A" stroke="#3E6E22" stroke-width="1.5"/>')).join('') + stem('M58 156 Q56 132 50 112', 2.5) + stem('M62 156 Q68 138 76 126', 2.2)
      + ray(50, 106, 22, 10, 2, '#fff', '#B9A9C9') + `<circle cx="50" cy="106" r="5" fill="#FFC300" stroke="#C99A00"/>` + ray(76, 121, 18, 7, 1.6, '#fff', '#C9A9C9') + `<circle cx="76" cy="121" r="3.5" fill="#FFC300" stroke="#C99A00"/>`
      + `<path d="M44 102 l2 -4 M54 101 l-1 -4" stroke="#E58EA6" stroke-width="1.5"/>`;
    else if (id === 'klee') a = stem('M60 158 Q58 110 62 70', 3) + stem('M60 128 Q46 120 38 112', 2) + stem('M61 104 Q74 96 82 90', 2) + at(38, 112, -20, trefoil) + at(82, 90, 15, trefoil) + at(60, 156, 0, trefoil)
      + `<circle cx="62" cy="58" r="15" fill="#E07BA4" stroke="#A3466F" stroke-width="1.5"/>${Array.from({ length: 16 }, (_, i) => { const t = (i / 16) * Math.PI * 2, r = i % 2 ? 9 : 13; return `<path d="M${(62 + Math.cos(t) * (r - 5)).toFixed(1)} ${(58 + Math.sin(t) * (r - 5)).toFixed(1)} L${(62 + Math.cos(t) * r).toFixed(1)} ${(58 + Math.sin(t) * r).toFixed(1)}" stroke="#F7C1D6" stroke-width="2.2" stroke-linecap="round"/>`; }).join('')}` + leafE(52, 72, 3, 7, -40) + leafE(72, 72, 3, 7, 40);
    else if (id === 'spitzwegerich') a = [-55, -30, -10, 12, 34, 58].map((r) => at(60, 158, r, lance(52, 7))).join('') + stem('M60 156 Q58 96 62 46', 2.4, '#7E9A4A')
      + `<ellipse cx="62" cy="34" rx="7" ry="15" fill="#7A5A32" stroke="#4A3418" stroke-width="1.5"/>${[24, 30, 36, 42].map((y) => `<path d="M55 ${y} l7 2 l7 -2" stroke="#5A3E20" stroke-width="1" fill="none"/>`).join('')}${[-1, 1].flatMap((d) => [28, 33, 38].map((y) => `<path d="M${62 + d * 6} ${y} l${d * 7} -2" stroke="#E9E4D0" stroke-width="1.2"/><circle cx="${62 + d * 13}" cy="${y - 2}" r="1.8" fill="#FFFBEA" stroke="#B5A77A" stroke-width=".6"/>`)).join('')}`;
    else if (id === 'schaumkraut') a = at(60, 158, -60, feather(4, 1)) + at(60, 158, 60, feather(4, 1)) + at(60, 158, -20, feather(3, 1)) + stem('M60 156 Q58 100 60 58', 2.6)
      + at(59, 118, -50, feather(3, 0.7)) + at(60, 92, 50, feather(3, 0.7)) + stem('M60 60 L48 44 M60 60 L60 38 M60 60 L72 44 M60 60 L52 56 M60 60 L70 58', 1.6)
      + cross4(48, 40, 8) + cross4(60, 32, 8) + cross4(72, 40, 8) + cross4(50, 56, 7) + cross4(70, 56, 7);
    else if (id === 'margerite') a = stem('M60 158 Q58 100 60 40', 3) + at(59, 140, -55, lance(30, 6)) + at(60, 118, 50, lance(26, 5)) + at(60, 92, -45, lance(20, 4)) + at(60, 156, 15, lance(28, 6))
      + `<path d="M48 136 l-3 -2 M44 128 l-3 0 M70 108 l3 -2 M74 100 l3 0" stroke="#3E6E22" stroke-width="1.4"/>`
      + ray(60, 36, 20, 20, 3.4, '#fff', '#B9A9C9', 6) + `<circle cx="60" cy="36" r="9" fill="#FFC300" stroke="#C99A00" stroke-width="1.5"/><circle cx="57" cy="33" r="2" fill="#FFE27A"/>`;
    else if (id === 'hahnenfuss') a = at(60, 158, -45, `<path d="M0 0 L0 -16" stroke="#3E6E22" stroke-width="1.6"/><g transform="translate(0 -16)">${handLeaf}</g>`) + at(60, 158, 40, `<path d="M0 0 L0 -14" stroke="#3E6E22" stroke-width="1.6"/><g transform="translate(0 -14)">${handLeaf}</g>`)
      + stem('M60 156 Q60 110 60 90 Q48 70 38 50 M60 90 Q72 66 84 48 M60 90 Q62 60 60 34', 2.6) + at(60, 92, 0, `<g transform="scale(.7)">${handLeaf}</g>`)
      + cup(38, 46, 8) + cup(84, 44, 8) + cup(60, 30, 8);
    else a = stem('M60 156 Q58 110 60 40', 3, '#8A4A3A') + at(58, 156, -40, arrowLeaf) + at(62, 156, 35, arrowLeaf) + at(60, 120, -50, '<g transform="scale(.65)">' + arrowLeaf + '</g>') + at(60, 98, 45, '<g transform="scale(.55)">' + arrowLeaf + '</g>')
      + stem('M60 70 L46 56 M60 60 L74 46 M60 52 L50 40 M60 82 L76 70', 1.6, '#8A4A3A') + [[46, 56], [50, 40], [60, 40], [74, 46], [76, 70], [42, 52], [54, 34], [66, 36], [70, 64], [80, 66], [44, 60], [78, 42]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#B5473A" stroke="#7A2A22" stroke-width=".8"/>`).join('');
    return `<svg ${NS} class="pic" viewBox="0 0 120 165" style="max-width:170px" aria-label="Bild einer Wiesenpflanze">${a}${GROUND}</svg>`;
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
  WIESE.svg = (opts) => partsSVG(WIESE, opts, (g) => `
    <rect width="300" height="240" fill="#E3F2FD"/>
    ${g('wurzel', `${hit(186, 54)}<rect y="186" width="300" height="54" fill="#8B5E3C" opacity=".5"/><g stroke="#C7A27A" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="M40 186 Q34 204 38 222 M40 186 Q48 200 46 214 M130 186 Q124 206 128 230 M130 186 Q140 202 136 220 M230 186 Q224 200 228 218 M230 186 Q240 206 238 228 M272 186 Q268 200 272 214"/></g><path d="M66 224 Q80 214 94 224 T122 222" stroke="${OUT}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M66 224 Q80 214 94 224 T122 222" stroke="#E58E9A" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="180" cy="226" rx="9" ry="6" fill="#9E9E9E" stroke="#616161" stroke-width="1.5"/>`)}
    ${g('boden', `${hit(164, 22)}<path d="M0 186 L300 186" stroke="#6B4423" stroke-width="3"/><g fill="#B5763A" stroke="#7A4A1E" stroke-width="1.2"><ellipse cx="20" cy="181" rx="10" ry="4" transform="rotate(-10 20 181)"/><ellipse cx="96" cy="182" rx="9" ry="3.5" transform="rotate(12 96 182)"/><ellipse cx="160" cy="181" rx="10" ry="4"/><ellipse cx="262" cy="181" rx="9" ry="4" transform="rotate(-8 262 181)"/></g><g fill="#6E9A3A"><circle cx="58" cy="183" r="4"/><circle cx="64" cy="181" r="4"/><circle cx="70" cy="183" r="4"/><circle cx="244" cy="183" r="4"/><circle cx="250" cy="181" r="4"/></g><g stroke="${OUT}" stroke-width="1.5"><path d="M200 176 l-6 -4 M200 180 l-7 0 M200 184 l-6 3 M214 176 l6 -4 M214 180 l7 0 M214 184 l6 3"/></g><ellipse cx="207" cy="180" rx="8" ry="6" fill="#2E3A5E" stroke="${OUT}" stroke-width="1.5"/><circle cx="216" cy="178" r="3" fill="#2E3A5E"/>`)}
    ${g('staengel', `${hit(72, 92)}<g stroke="#6BAA3A" stroke-width="3" fill="none" stroke-linecap="round"><path d="M14 186 Q10 140 22 96"/><path d="M28 186 Q34 150 26 110"/><path d="M50 186 Q48 120 50 64"/><path d="M76 186 Q84 140 70 104"/><path d="M110 186 Q104 150 116 98"/><path d="M140 186 Q138 120 140 58"/><path d="M168 186 Q176 140 160 100"/><path d="M196 186 Q190 150 204 106"/><path d="M230 186 Q228 120 230 62"/><path d="M256 186 Q262 140 252 96"/><path d="M286 186 Q280 150 292 104"/></g><g stroke="#A9B4C2" stroke-width=".8" fill="none"><path d="M78 120 L104 140 M90 112 L90 150 M78 136 L104 120 M76 128 L106 130"/><circle cx="90" cy="130" r="6"/><circle cx="90" cy="130" r="11"/></g><circle cx="90" cy="130" r="2.8" fill="${OUT}"/><g transform="translate(186 128)"><path d="M-14 4 Q-18 -10 -4 -8 L10 -2" stroke="${OUT}" stroke-width="1.5" fill="#7CC04A"/><ellipse cx="0" cy="0" rx="14" ry="5" fill="#7CC04A" stroke="${OUT}" stroke-width="1.5"/><path d="M6 2 L2 12 M-2 3 L-6 11 M-8 0 L-20 -12 L-16 10" stroke="${OUT}" stroke-width="1.5" fill="none"/><circle cx="10" cy="-1" r="1.5" fill="${OUT}"/><path d="M12 -3 Q22 -14 28 -16" stroke="${OUT}" stroke-width="1" fill="none"/></g>`)}
    ${g('bluete', `${hit(8, 64)}${ray(50, 56, 14, 9, 2, '#FFD23F', '#D9A300')}<circle cx="50" cy="56" r="3" fill="#E8A800"/>${ray(140, 50, 16, 12, 2.6, '#fff', '#B9A9C9', 4)}<circle cx="140" cy="50" r="5" fill="#FFC300"/><circle cx="230" cy="54" r="10" fill="#E07BA4" stroke="#A3466F" stroke-width="1.2"/><g transform="translate(190 28)"><ellipse cx="-8" cy="-4" rx="9" ry="7" fill="#F28C28" stroke="${OUT}" stroke-width="1.4"/><ellipse cx="8" cy="-4" rx="9" ry="7" fill="#F28C28" stroke="${OUT}" stroke-width="1.4"/><ellipse cx="-6" cy="7" rx="6" ry="5" fill="#F7B267" stroke="${OUT}" stroke-width="1.4"/><ellipse cx="6" cy="7" rx="6" ry="5" fill="#F7B267" stroke="${OUT}" stroke-width="1.4"/><ellipse cx="0" cy="2" rx="2" ry="9" fill="${OUT}"/><path d="M-1 -7 Q-4 -14 -8 -16 M1 -7 Q4 -14 8 -16" stroke="${OUT}" stroke-width="1" fill="none"/></g><g transform="translate(96 28)"><ellipse cx="-3" cy="-7" rx="5" ry="7" fill="#E3F2FD" stroke="#7A8AA8" stroke-width="1" transform="rotate(-25 -3 -7)"/><ellipse cx="4" cy="-7" rx="5" ry="7" fill="#E3F2FD" stroke="#7A8AA8" stroke-width="1" transform="rotate(25 4 -7)"/><ellipse cx="0" cy="0" rx="9" ry="6" fill="#FFC93C" stroke="${OUT}" stroke-width="1.4"/><path d="M-3 -5.5 L-3 5.5 M3 -5.5 L3 5.5" stroke="${OUT}" stroke-width="2.4"/></g>`)}`,
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
