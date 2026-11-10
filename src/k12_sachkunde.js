// Sachkunde Klasse 1 und 2 (Lehrplan Sachsen 2019, Sachunterricht Kl. 1/2): Mein Körper, Durch das Jahr (Klasse 1),
// Bäume und Blumen, Tiere bei uns, Licht, Luft und Wasser (Klasse 2). Units register in MK.MODES like sachkunde3.js;
// hero and opponents come from the shared set K12.SETS.sachkunde, the tap-a-part pictures go into MS.PLANTS.
const MSK12 = (() => {
  const K = typeof MK !== 'undefined' ? MK : require('./knowledge.js');
  const S12 = typeof K12 !== 'undefined' ? K12 : require('./klasse12.js');
  const S = typeof MS !== 'undefined' ? MS : require('./sachkunde.js');
  const J = typeof MJ !== 'undefined' ? MJ : require('./jahrmarkt.js');
  const { shuffle, pick, rnd } = K;
  const { NS, choice, orderTask, wantsPool, partsSVG, plantTask, partPool } = S;
  const OUT = '#1C2541';
  const SET = S12.SETS.sachkunde;

  /* ---------- helpers ---------- */
  // pool rows: [question, [answer, wrong, wrong]] or [statement, true] or [statement, false, why].
  // ids follow the position in the list, so new questions go at the end.
  const P = (pre, mod, g, rows) => rows.map((r, i) => Object.assign({ id: pre + (i + 1), mod, g, q: r[0] }, Array.isArray(r[1]) ? { o: r[1], a: 0 } : { rf: true, a: r[1], why: r[2] || '' }));
  const unit = (o) => Object.assign(o, { worlds: 1, subject: 'Sachkunde', enemies: SET.enemies, moves: SET.moves,
    starters: [Object.assign({}, SET.hero, { attacks: o.attacks })], extra: Object.fromEntries(Object.entries(o.modules).map(([k, m]) => [k, m.atk])) });
  const mod = (name, icon, atk, dmg, maxTier) => ({ name, icon, atk, maxTier: maxTier || 1, worldCap: [maxTier || 1], dmg });
  const others = (list, keep, n) => shuffle(list.filter((x) => x !== keep)).slice(0, n || 2);
  const HELP = 'Hol dir Hilfe bei einem Erwachsenen.';
  const minus = (n) => (n < 0 ? '−' + -n : String(n));

  /* ---------- drawings ---------- */
  const ln = (w) => `stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const pic = (box, inner, label, w) => `<svg ${NS} class="pic" viewBox="${box}"${w ? ` style="max-width:${w}px"` : ''} aria-label="${label}">${inner}</svg>`;
  // a thick coloured line with an ink outline; the colour sits in style="" so a glowing part keeps it
  const twin = (d, c, w) => `<path d="${d}" fill="none" ${ln(w + 3)}/><path d="${d}" fill="none" style="stroke:${c};stroke-width:${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const at = (x, y, rot, s, inner) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${inner}</g>`;
  const pt = (x, y, a, r) => `${+(x + Math.cos(a) * r).toFixed(1)} ${+(y + Math.sin(a) * r).toFixed(1)}`;
  const sun = (x, y, r) => `<path d="${Array.from({ length: 8 }, (_, i) => `M${pt(x, y, i * Math.PI / 4, r + 4)} L${pt(x, y, i * Math.PI / 4, r + 11)}`).join('')}" stroke="#F0A500" stroke-width="3" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="${r}" fill="#FFD43B" ${ln(2)}/>`;
  const cloud = (x, y, s, fill) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-26 10 Q-36 10 -34 0 Q-32 -10 -22 -8 Q-20 -22 -4 -20 Q8 -30 20 -16 Q34 -16 32 -2 Q38 10 26 10 Z" fill="${fill || '#fff'}" ${ln(+(2 / s).toFixed(2))}/>`;
  const flake = (x, y) => `M${x - 5} ${y} L${x + 5} ${y} M${x - 2.5} ${y - 4.3} L${x + 2.5} ${y + 4.3} M${x - 2.5} ${y + 4.3} L${x + 2.5} ${y - 4.3}`;
  const SOIL = (y, w) => `<path d="M0 ${y} Q${w / 2} ${y - 4} ${w} ${y} L${w} ${y + 40} L0 ${y + 40} Z" fill="#B88A5E"/><path d="M0 ${y} Q${w / 2} ${y - 4} ${w} ${y}" fill="none" ${ln(2)}/>`;

  // Wetterzeichen wie an der Wetterwand der Klasse
  const WX = {
    sonnig: { name: 'Sonnig', art: sun(50, 40, 16) },
    bewoelkt: { name: 'Bewölkt', art: cloud(62, 32, 0.9, '#C9D1DD') + cloud(44, 46, 1.1) },
    regen: { name: 'Regen', art: cloud(50, 32, 1.2, '#B7C3D3') + `<path d="M34 54 l-4 9 M46 54 l-4 9 M58 54 l-4 9 M70 54 l-4 9 M40 66 l-3 7 M64 66 l-3 7" stroke="#2478D6" stroke-width="3" stroke-linecap="round"/>` },
    schnee: { name: 'Schnee', art: cloud(50, 30, 1.2, '#E4E9F0') + `<path d="${flake(34, 58) + flake(52, 66) + flake(68, 56) + flake(44, 74)}" stroke="#5B8FC9" stroke-width="2" stroke-linecap="round"/>` },
    gewitter: { name: 'Gewitter', art: cloud(50, 30, 1.2, '#7D8798') + `<path d="M50 44 L40 60 L49 60 L43 76 L60 54 L51 54 L57 44 Z" fill="#FFD21F" ${ln(1.6)}/>` },
    windig: { name: 'Wind', art: `<path d="M12 28 H58 Q70 28 70 18 Q70 10 62 10 Q55 10 55 17 M12 42 H78 Q90 42 90 52 Q90 60 82 60 Q75 60 75 53 M12 56 H50" fill="none" stroke="#5B8FC9" stroke-width="4" stroke-linecap="round"/><path d="M78 24 Q86 18 92 24 Q86 30 78 24 Z" fill="#7CC35B" ${ln(1.4)}/>` },
    nebel: { name: 'Nebel', art: `<path d="M14 24 H86 M22 38 H78 M14 52 H86 M26 66 H74" stroke="#9AA4B2" stroke-width="6" stroke-linecap="round"/>` },
  };
  const wxSVG = (k) => pic('0 0 100 80', WX[k].art, 'Wetterzeichen', 160);

  // ein Baum in den vier Jahreszeiten
  const SEASONS = ['Frühling', 'Sommer', 'Herbst', 'Winter'];
  function seasonSVG(i) {
    const crown = (fill) => `<path d="M60 22 Q86 18 94 40 Q108 50 100 68 Q98 84 78 84 Q60 92 42 84 Q22 84 20 68 Q12 50 26 40 Q34 18 60 22 Z" fill="${fill}" ${ln(2)}/>`;
    const dots = (cols, n) => Array.from({ length: n }, (_, k) => `<circle cx="${30 + (k * 37) % 66}" cy="${32 + (k * 23) % 48}" r="3.2" fill="${cols[k % cols.length]}" ${ln(0.8)}/>`).join('');
    const trunk = `<path d="M54 118 L56 76 L64 76 L66 118 Z" fill="#8A5A34" ${ln(2)}/>`;
    const art = [
      `<rect width="120" height="130" fill="#E6F6FF"/>${SOIL(116, 120).replace('#B88A5E', '#8CCB5E')}${trunk}${crown('#A8DB7A')}${dots(['#FFFFFF', '#F7B8D2'], 14)}<path d="M14 116 v-6 M20 116 v-5 M102 116 v-6" stroke="#4E9A32" stroke-width="2"/><circle cx="14" cy="108" r="3" fill="#FFD43B"/><circle cx="102" cy="108" r="3" fill="#F7B8D2"/>`,
      `<rect width="120" height="130" fill="#CFEBFF"/>${sun(102, 16, 9)}${SOIL(116, 120).replace('#B88A5E', '#6DB24A')}${trunk}${crown('#4E9A32')}${dots(['#E8344A'], 6)}`,
      `<rect width="120" height="130" fill="#F4EDE0"/>${SOIL(116, 120).replace('#B88A5E', '#C9A26A')}${trunk}${crown('#F0A23A')}${dots(['#E8603A', '#FFD43B', '#B8562A'], 16)}${[[18, 100, 20], [96, 98, -30], [84, 110, 60], [30, 112, -10]].map(([x, y, r]) => at(x, y, r, 1, `<path d="M0 -5 Q5 0 0 5 Q-5 0 0 -5 Z" fill="#E8603A" ${ln(1)}/>`)).join('')}`,
      `<rect width="120" height="130" fill="#DCE6F2"/>${SOIL(116, 120).replace('#B88A5E', '#FFFFFF')}${trunk}<path d="M60 78 L40 46 M60 78 L82 44 M60 70 L60 30 M48 60 L30 54 M74 58 L94 50 M40 46 L34 32 M82 44 L88 30" fill="none" ${ln(4)}/><path d="M40 46 L34 32 M82 44 L88 30 M60 30 L60 40" fill="none" stroke="#fff" stroke-width="2"/><path d="${flake(16, 24) + flake(104, 34) + flake(24, 70) + flake(98, 86) + flake(70, 14)}" stroke="#5B8FC9" stroke-width="1.6" stroke-linecap="round"/>`,
    ][i];
    return pic('0 0 120 130', art, 'Ein Baum in einer Jahreszeit', 170);
  }

  // Tageszeiten: Morgen und Abend sehen ähnlich aus und kommen nie zusammen als Antwort vor
  const DAYTIMES = [
    { name: 'Morgens', sky: '#FFE7B8', art: sun(96, 58, 12), lit: false, not: 'Abends' },
    { name: 'Mittags', sky: '#BFE3FF', art: sun(64, 18, 12), lit: false, not: '' },
    { name: 'Abends', sky: '#F6A26B', art: sun(96, 58, 12), lit: true, not: 'Morgens' },
    { name: 'Nachts', sky: '#24305E', art: `<path d="M72 10 A12 12 0 1 0 84 28 A10 10 0 1 1 72 10 Z" fill="#FFF3B0" ${ln(1.5)}/><path d="M50 14 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 Z M104 30 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1 Z M60 40 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1 Z" fill="#FFF3B0"/>`, lit: true, not: '' },
  ];
  const daySVG = (d) => pic('0 0 120 80', `<rect width="120" height="80" fill="${d.sky}"/>${d.art}<path d="M14 60 V42 L26 34 L38 42 V60 Z" fill="#E3DED0" ${ln(1.6)}/><rect x="22" y="46" width="8" height="7" fill="${d.lit ? '#FFD43B' : '#9CC9F0'}" ${ln(1)}/><path d="M0 62 Q60 56 120 62 V80 H0 Z" fill="${d.name === 'Nachts' ? '#2F4A2A' : '#7CC35B'}" ${ln(1.6)}/>`, 'Landschaft zu einer Tageszeit', 200);

  // Fußgängerampel: das leuchtende Männchen ist farbig, das andere grau
  const AMPEL = { rot: { col: '#E8344A', mean: 'Du musst warten' }, gruen: { col: '#3DBE5A', mean: 'Du darfst gehen' } };
  function ampelSVG(lit) {
    const man = (y, col, walk) => `<g fill="${col}"><circle cx="40" cy="${y - 11}" r="4"/><rect x="36" y="${y - 6}" width="8" height="12" rx="2"/>${walk ? `<path d="M37 ${y + 5} L31 ${y + 15} M43 ${y + 5} L48 ${y + 15} M37 ${y - 4} L31 ${y + 3} M43 ${y - 4} L49 ${y + 1}" stroke="${col}" stroke-width="3.4" stroke-linecap="round"/>` : `<path d="M38 ${y + 5} V${y + 15} M42 ${y + 5} V${y + 15} M36 ${y - 4} V${y + 5} M44 ${y - 4} V${y + 5}" stroke="${col}" stroke-width="3.4" stroke-linecap="round"/>`}</g>`;
    return pic('0 0 80 130', `<rect x="36" y="110" width="8" height="20" fill="#8E96B5" ${ln(1.5)}/><rect x="16" y="6" width="48" height="106" rx="9" fill="#3A3F4F" ${ln(2)}/><circle cx="40" cy="34" r="19" fill="#22252E"/><circle cx="40" cy="84" r="19" fill="#22252E"/>${man(34, lit === 'rot' ? AMPEL.rot.col : '#5A5F6E', false)}${man(84, lit === 'gruen' ? AMPEL.gruen.col : '#5A5F6E', true)}`, 'Fußgängerampel', 110);
  }

  // Essen zum Antippen: gesund (Frühstück, Brotdose) und süß
  const FOOD = {
    apfel: `<path d="M30 20 Q12 12 10 32 Q10 52 30 52 Q50 52 50 32 Q48 12 30 20 Z" fill="#E8344A" ${ln(2)}/><path d="M30 20 Q30 12 34 8" fill="none" ${ln(2)}/><path d="M34 12 Q42 6 46 12 Q40 16 34 12 Z" fill="#7CC35B" ${ln(1.4)}/><ellipse cx="20" cy="30" rx="4" ry="6" fill="#fff" opacity=".6"/>`,
    moehre: `<path d="M24 18 L40 18 L31 56 Z" fill="#F28C28" ${ln(2)}/><path d="M27 26 h6 M28 34 h5 M29 42 h3" stroke="#C0601A" stroke-width="1.4"/><path d="M28 18 Q22 8 18 6 M32 18 Q32 8 32 4 M36 18 Q40 8 46 6" fill="none" stroke="#4E9A32" stroke-width="3" stroke-linecap="round"/>`,
    brot: `<path d="M10 52 V30 Q8 12 30 12 Q52 12 50 30 V52 Z" fill="#C8894A" ${ln(2)}/><path d="M15 48 V31 Q14 17 30 17 Q46 17 45 31 V48 Z" fill="#F2D3A0"/><path d="M22 28 l2 1 M34 26 l2 -1 M28 36 l1 2 M38 38 l2 1 M20 42 l2 0" stroke="#8A5A34" stroke-width="2" stroke-linecap="round"/>`,
    lolli: `<path d="M30 30 L30 58" ${ln(3)}/><circle cx="30" cy="22" r="16" fill="#F7B8D2" ${ln(2)}/><path d="M30 22 m-3 0 a3 3 0 1 1 6 0 a6 6 0 1 1 -12 0 a9 9 0 1 1 18 0 a12 12 0 1 1 -24 0" fill="none" stroke="#E8344A" stroke-width="2"/>`,
    schoko: `<rect x="12" y="8" width="36" height="46" rx="3" fill="#6B3E22" ${ln(2)}/><path d="M24 8 V30 M36 8 V30 M12 19 H48" stroke="#4A2A16" stroke-width="2"/><path d="M12 30 H48 V54 H12 Z" fill="#C9CEDD" ${ln(2)}/><path d="M16 38 H44 M16 46 H36" stroke="#8E96B5" stroke-width="2"/>`,
    limo: `<path d="M24 6 H36 V14 Q44 20 44 30 V54 Q44 58 40 58 H20 Q16 58 16 54 V30 Q16 20 24 14 Z" fill="#FF9A3D" ${ln(2)}/><rect x="16" y="32" width="28" height="12" fill="#FFE27A" ${ln(1.4)}/><circle cx="26" cy="24" r="1.8" fill="#fff"/><circle cx="33" cy="20" r="1.4" fill="#fff"/><circle cx="30" cy="50" r="1.6" fill="#fff"/>`,
  };
  const foodSVG = (k) => `<svg ${NS} viewBox="0 0 60 60" aria-hidden="true">${FOOD[k]}</svg>`;
  const HEALTHY = ['apfel', 'moehre', 'brot'], SWEET = ['lolli', 'schoko', 'limo'];

  /* ================= MEIN KÖRPER (Klasse 1, LB 2) ================= */
  const SKIN = '#F6C9A0';
  const BODY_PARTS = [
    { id: 'kopf', name: 'Kopf', desc: 'Oben auf dem Hals. Im Kopf denkst du.', tip: 'Der Teil ist ganz oben.' },
    { id: 'hals', name: 'Hals', desc: 'Er verbindet den Kopf mit dem Körper.', tip: 'Der Teil ist zwischen Kopf und Körper.' },
    { id: 'arm', name: 'Arm', desc: 'Du hast zwei Arme. Sie hängen an den Schultern.', tip: 'Der Teil hängt an der Schulter.' },
    { id: 'hand', name: 'Hand', desc: 'Jede Hand hat fünf Finger.', tip: 'Der Teil ist am Ende vom Arm.' },
    { id: 'bauch', name: 'Bauch', desc: 'Vorn in der Mitte des Körpers. Dort ist der Bauchnabel.', tip: 'Schau auf den Bauchnabel.' },
    { id: 'bein', name: 'Bein', desc: 'Mit den Beinen läufst und springst du.', tip: 'Der Teil ist unter der Badehose.' },
    { id: 'fuss', name: 'Fuß', desc: 'Ganz unten. Jeder Fuß hat fünf Zehen.', tip: 'Der Teil ist ganz unten.' },
  ];
  const BODY = { label: 'Körper', box: '0 0 200 300', parts: BODY_PARTS, qid: 'sk1k_kt_', note: 'koerper',
    stepOf: { kopf: 1, hals: 2, bauch: 3, arm: 4, hand: 5, bein: 6, fuss: 7 },
    steps: ['Zeichne einen runden Kopf mit Augen und Mund.', 'Zeichne den Hals unter den Kopf.', 'Zeichne den Körper mit dem Bauch und dem Bauchnabel.', 'Zeichne zwei Arme an die Schultern.', 'Zeichne an jeden Arm eine Hand.', 'Zeichne zwei Beine unter die Badehose.', 'Zeichne unten die Füße.'],
    ask: () => 'Wie heißt der leuchtende Teil?', find: (p) => `Tippe auf: ${p.name}`, poolQ: 'Wie heißt dieser Körperteil?', tap: 'den Körperteil' };
  BODY.svg = (opts) => partsSVG(BODY, opts, (g) => {
    const step = (opts && opts.step) || 99;
    const limb = (d) => twin(d, SKIN, 16) + `<path class="hitarea" d="${d}" fill="none" stroke="transparent" stroke-width="26"/>`;
    return `${step >= 3 ? `<path d="M68 98 Q100 90 132 98 Q136 140 126 186 H74 Q64 140 68 98 Z" fill="${SKIN}" ${ln(2.5)}/>` : ''}
      ${g('bein', limb('M88 196 L86 262') + limb('M112 196 L114 262'))}
      ${g('fuss', `<path d="M74 268 Q74 260 86 260 Q90 268 90 276 H70 Q66 276 74 268 Z" fill="${SKIN}" ${ln(2.2)}/><path d="M126 268 Q126 260 114 260 Q110 268 110 276 H130 Q134 276 126 268 Z" fill="${SKIN}" ${ln(2.2)}/>`)}
      ${step >= 6 ? `<path d="M72 176 H128 L130 204 H104 L100 196 L96 204 H70 Z" fill="#3B82F6" ${ln(2.2)}/>` : ''}
      ${g('bauch', `<ellipse cx="100" cy="148" rx="22" ry="20" fill="#F2BC90" ${ln(1.6)}/><path d="M98 150 q2 3 4 0" fill="none" ${ln(1.6)}/>`)}
      ${g('arm', limb('M72 104 Q58 132 48 166') + limb('M128 104 Q142 132 152 166'))}
      ${g('hand', `<circle cx="46" cy="176" r="9" fill="${SKIN}" ${ln(2.2)}/><path d="M38 170 l-5 -4" ${ln(2.2)}/><circle cx="154" cy="176" r="9" fill="${SKIN}" ${ln(2.2)}/><path d="M162 170 l5 -4" ${ln(2.2)}/>`)}
      ${g('hals', `<rect x="91" y="74" width="18" height="22" fill="${SKIN}" ${ln(2.2)}/><rect class="hitarea" x="84" y="74" width="32" height="22" fill="transparent"/>`)}
      ${g('kopf', `<circle cx="100" cy="48" r="30" fill="${SKIN}" ${ln(2.5)}/><path d="M71 44 Q72 16 100 16 Q128 16 129 44 Q118 30 100 32 Q84 30 71 44 Z" fill="#8A5A34" ${ln(2)}/><circle cx="90" cy="50" r="3" fill="${OUT}"/><circle cx="110" cy="50" r="3" fill="${OUT}"/><path d="M90 62 Q100 70 110 62" fill="none" ${ln(2)}/>`)}`;
  }, [['kopf', 196, 30, 'end', [130, 40]], ['hals', 196, 88, 'end', [110, 86]], ['bauch', 196, 150, 'end', [124, 150]], ['fuss', 196, 290, 'end', [128, 274]], ['arm', 4, 116, 'start', [62, 124]], ['hand', 4, 200, 'start', [40, 184]], ['bein', 4, 240, 'start', [84, 236]]]);
  S.PLANTS.koerper12 = BODY;

  const FACE_PARTS = [
    { id: 'haare', name: 'Haare', desc: 'Sie wachsen oben auf dem Kopf.', tip: 'Der Teil ist ganz oben.' },
    { id: 'auge', name: 'Auge', desc: 'Mit den Augen siehst du.', tip: 'Davon hast du zwei, über der Nase.' },
    { id: 'ohr', name: 'Ohr', desc: 'Mit den Ohren hörst du.', tip: 'Davon hast du zwei, an den Seiten.' },
    { id: 'nase', name: 'Nase', desc: 'Mit der Nase riechst du.', tip: 'Der Teil ist in der Mitte vom Gesicht.' },
    { id: 'mund', name: 'Mund', desc: 'Mit dem Mund isst und sprichst du. Darin sind die Zähne.', tip: 'Der Teil ist unter der Nase.' },
    { id: 'kinn', name: 'Kinn', desc: 'Ganz unten im Gesicht, unter dem Mund.', tip: 'Der Teil ist ganz unten im Gesicht.' },
  ];
  const FACE = { label: 'Gesicht', box: '0 0 200 210', parts: FACE_PARTS, qid: 'sk1k_kg_', note: 'gesicht',
    stepOf: { kinn: 1, ohr: 2, auge: 3, nase: 4, mund: 5, haare: 6 },
    steps: ['Zeichne ein großes Oval für das Gesicht. Unten ist das Kinn.', 'Zeichne rechts und links die Ohren.', 'Zeichne zwei Augen.', 'Zeichne die Nase in die Mitte.', 'Zeichne den Mund unter die Nase.', 'Zeichne oben die Haare.'],
    ask: () => 'Wie heißt der leuchtende Teil?', find: (p) => `Tippe auf: ${p.name}`, poolQ: 'Wie heißt dieser Teil des Gesichts?', tap: 'den Teil im Gesicht' };
  FACE.svg = (opts) => partsSVG(FACE, opts, (g) => `<ellipse cx="100" cy="112" rx="66" ry="80" fill="${SKIN}" ${ln(2.5)}/>
    ${g('ohr', `<ellipse cx="32" cy="112" rx="11" ry="18" fill="${SKIN}" ${ln(2.2)}/><path d="M34 104 q-6 8 0 16" fill="none" ${ln(1.6)}/><ellipse cx="168" cy="112" rx="11" ry="18" fill="${SKIN}" ${ln(2.2)}/><path d="M166 104 q6 8 0 16" fill="none" ${ln(1.6)}/>`)}
    ${g('kinn', `<path d="M78 180 Q100 194 122 180" fill="none" ${ln(2)}/><ellipse class="hitarea" cx="100" cy="182" rx="30" ry="12" fill="transparent"/>`)}
    ${g('auge', `<ellipse cx="74" cy="100" rx="14" ry="10" fill="#fff" ${ln(2)}/><circle cx="76" cy="100" r="6" fill="#4A7FC9"/><circle cx="76" cy="100" r="2.6" fill="${OUT}"/><ellipse cx="126" cy="100" rx="14" ry="10" fill="#fff" ${ln(2)}/><circle cx="124" cy="100" r="6" fill="#4A7FC9"/><circle cx="124" cy="100" r="2.6" fill="${OUT}"/>`)}
    ${g('nase', `<path d="M100 108 Q94 128 92 132 Q100 138 108 132" fill="#F2BC90" ${ln(2)}/>`)}
    ${g('mund', `<path d="M78 152 Q100 172 122 152 Q100 160 78 152 Z" fill="#E36A6A" ${ln(2)}/><path d="M86 155 Q100 160 114 155 V158 Q100 163 86 158 Z" fill="#fff"/>`)}
    ${g('haare', `<path d="M34 98 Q30 30 100 28 Q170 30 166 98 Q154 64 120 58 Q104 72 80 62 Q50 68 34 98 Z" fill="#8A5A34" ${ln(2.2)}/>`)}`,
  [['haare', 196, 22, 'end', [150, 50]], ['auge', 4, 70, 'start', [64, 92]], ['ohr', 4, 150, 'start', [26, 126]], ['nase', 196, 128, 'end', [108, 126]], ['mund', 196, 168, 'end', [120, 158]], ['kinn', 196, 204, 'end', [116, 186]]]);
  S.PLANTS.gesicht12 = FACE;

  const HAENDE = [{ id: 'h1', text: 'Hände nass machen' }, { id: 'h2', text: 'Mit Seife einreiben' }, { id: 'h3', text: 'Zwischen den Fingern reiben' }, { id: 'h4', text: 'Mit Wasser abspülen' }, { id: 'h5', text: 'Mit dem Handtuch abtrocknen' }];
  const ZAEHNE = [{ id: 'z1', text: 'Zahnpasta auf die Bürste' }, { id: 'z2', text: 'Kauflächen putzen' }, { id: 'z3', text: 'Außenflächen putzen' }, { id: 'z4', text: 'Innenflächen putzen' }, { id: 'z5', text: 'Zahnpasta ausspucken' }];
  const NOTRUF = [{ id: 'n1', text: '112 wählen' }, { id: 'n2', text: 'Sagen, wo du bist' }, { id: 'n3', text: 'Sagen, was passiert ist' }, { id: 'n4', text: 'Auf Fragen warten' }];
  // Kleidung zum Wetter: jede Antwort passt nur zu ihrem Wetter
  const WEAR = [['regen', 'Regenjacke und Gummistiefel'], ['schnee', 'Mütze, Schal und Handschuhe'], ['sonnig', 'Sonnenhut und T-Shirt']];
  const KO_NOTES = {
    koerper: { title: 'Mein Körper', lines: BODY_PARTS.map((p) => `${p.name}: ${p.desc}`) },
    gesicht: { title: 'Mein Gesicht', lines: FACE_PARTS.map((p) => `${p.name}: ${p.desc}`) },
    pflege: { title: 'Sauber und gesund', lines: ['Hände waschen: nass machen, einseifen, auch zwischen den Fingern reiben, abspülen, abtrocknen.', 'Hände wäschst du nach der Toilette, vor dem Essen und nach dem Spielen draußen.', 'Niesen und husten in die Armbeuge.', 'Kinder brauchen viel Schlaf und jeden Tag Bewegung an der frischen Luft.'] },
    zaehne: { title: 'Zähne putzen', lines: ['Putze morgens und abends etwa 2 Minuten.', 'Erst die Kauflächen, dann die Außenflächen, dann die Innenflächen.', 'Danach spuckst du die Zahnpasta aus.', 'Jeder hat seine eigene Zahnbürste. Alle paar Monate gibt es eine neue.', 'Zweimal im Jahr schaut die Zahnärztin nach deinen Zähnen.'] },
    essen: { title: 'Gesund essen', lines: ['Ein gutes Frühstück gibt dir Kraft für die Schule.', 'In die Brotdose gehören Vollkornbrot, Obst oder Gemüse.', 'Iss jeden Tag fünfmal Obst oder Gemüse.', 'Grundnahrungsmittel sind zum Beispiel Brot, Kartoffeln, Milch und Gemüse.', 'Süßigkeiten nur ab und zu und nur wenig.', 'Werbung will dir etwas verkaufen. Sie zeigt oft Süßes.'] },
    trinken: { title: 'Viel trinken', lines: ['Trinke über den Tag verteilt etwa 6 Gläser.', 'Wasser löscht den Durst am besten.', 'In Limonade und Cola steckt viel Zucker.'] },
    kleidung: { title: 'Kleidung zum Wetter', lines: ['Regen: Regenjacke und Gummistiefel.', 'Schnee und Frost: Mütze, Schal und Handschuhe.', 'Sonne und Hitze: Sonnenhut, T-Shirt und Sonnencreme.', 'Wenn es mal warm, mal kalt ist: mehrere dünne Schichten.', 'Im Dunkeln: helle Sachen und Reflektoren.'] },
    nein: { title: 'Nein sagen', lines: ['Dein Körper gehört dir.', 'Du darfst Nein sagen, auch zu Erwachsenen.', 'Gute Geheimnisse machen Freude, zum Beispiel ein Geschenk.', 'Ein Geheimnis, das dir Angst oder Bauchweh macht, darfst du immer erzählen.', 'Erzähle es Mama, Papa, der Lehrerin oder einem anderen Erwachsenen, dem du vertraust.', 'Nummer gegen Kummer: 116 111. Der Anruf kostet nichts.'] },
    erstehilfe: { title: 'Erste Hilfe', lines: ['Bei jeder Verletzung: einen Erwachsenen holen.', 'Kleine Wunde: sauber machen, ein Pflaster darauf.', 'Nasenbluten: Kopf nach vorn beugen, kalten Lappen in den Nacken.', 'Kleine Verbrennung: unter kühles, fließendes Wasser halten. Kein Eis, keine Butter.', 'Im Erste-Hilfe-Kasten sind Pflaster und Verband.'] },
    notruf: { title: 'Der Notruf', lines: ['112: Feuerwehr und Rettungsdienst.', '110: Polizei.', 'Sag, wo du bist und was passiert ist.', 'Leg erst auf, wenn die Leitstelle es sagt.', 'Der Notruf kostet nichts und ist nur für echte Notfälle.'] },
  };
  const KO_POOL = partPool('koerper12', 'parts', 'koerper', 'sk1k_kt_').concat(partPool('gesicht12', 'parts', 'gesicht', 'sk1k_kg_'),
    P('sk1k_pf', 'pflege', 'pflege', [
      ['Wann wäschst du dir die Hände?', ['Nach der Toilette', 'Vor dem Fernsehen', 'Beim Malen']],
      ['Womit wäschst du die Hände richtig?', ['Mit Wasser und Seife', 'Nur mit Wasser', 'Mit Saft']],
      ['Nach dem Niesen wäschst du dir die Hände.', true],
      ['Wohin niest du ohne Taschentuch?', ['In die Armbeuge', 'In die Hand', 'In die Luft']],
      ['Kinder brauchen viel Schlaf.', true],
      ['Wie sitzt du gut am Tisch?', ['Gerade, Füße am Boden', 'Ganz krumm', 'Auf einem Bein']],
      ['Bewegung an der frischen Luft hält dich gesund.', true],
      ['Was tust du nach dem Spielen im Matsch?', ['Hände waschen', 'Gleich essen', 'Ins Bett gehen']],
      ['Nasse Sportsachen ziehst du nach dem Sport aus.', true],
      ['Jeden Tag nur sitzen ist gut für deinen Körper.', false, 'Dein Körper braucht jeden Tag Bewegung.'],
    ]),
    P('sk1k_za', 'pflege', 'zaehne', [
      ['Wann putzt du deine Zähne?', ['Morgens und abends', 'Nur am Sonntag', 'Einmal im Monat']],
      ['Wie lange putzt du deine Zähne?', ['2 Minuten', '10 Sekunden', '1 Stunde']],
      ['Was ist schlecht für die Zähne?', ['Viel Süßes', 'Wasser', 'Möhren']],
      ['Wer schaut zweimal im Jahr nach deinen Zähnen?', ['Die Zahnärztin', 'Der Bäcker', 'Die Busfahrerin']],
      ['Was brauchst du zum Zähneputzen?', ['Zahnbürste und Zahnpasta', 'Kamm und Seife', 'Löffel und Gabel']],
      ['Deine Zahnbürste darfst du mit Freunden teilen.', false, 'Jeder hat seine eigene Zahnbürste. So werden keine Krankheiten weitergegeben.'],
      ['Wann bekommst du eine neue Zahnbürste?', ['Alle paar Monate', 'Jeden Tag', 'Nie']],
      ['Milchzähne fallen aus, dann wachsen neue Zähne.', true],
      ['Was putzt du zuerst?', ['Die Kauflächen', 'Die Zunge', 'Die Nase']],
    ]),
    P('sk1k_es', 'essen', 'essen', [
      ['Was gehört in eine gesunde Brotdose?', ['Vollkornbrot und Apfel', 'Chips und Kekse', 'Schokoriegel']],
      ['Wie oft am Tag isst du Obst oder Gemüse?', ['Fünfmal', 'Nie', 'Einmal pro Woche']],
      ['Was ist ein Grundnahrungsmittel?', ['Brot', 'Gummibärchen', 'Limonade']],
      ['Süßigkeiten darfst du essen, aber nur wenig.', true],
      ['Woraus wird Brot gebacken?', ['Aus Mehl', 'Aus Zucker', 'Aus Milch']],
      ['Woraus wird Käse gemacht?', ['Aus Milch', 'Aus Mehl', 'Aus Äpfeln']],
      ['Was ist Gemüse?', ['Die Möhre', 'Die Banane', 'Die Kirsche']],
      ['Was ist Obst?', ['Der Apfel', 'Die Gurke', 'Die Kartoffel']],
      ['Warum ist ein Frühstück wichtig?', ['Es gibt dir Kraft', 'Es macht dich müde', 'Es ist unwichtig']],
      ['Was willst du mit Obst vor dem Essen tun?', ['Waschen', 'Wegwerfen', 'Einfrieren']],
      ['Welches ist ein Gewürzkraut?', ['Schnittlauch', 'Tulpe', 'Efeu']],
      ['Beim Essen sitzt du am Tisch und nimmst dir Zeit.', true],
      ['Was will Werbung im Fernsehen?', ['Dir etwas verkaufen', 'Dir helfen', 'Dich gesund machen']],
      ['Was in der Werbung gezeigt wird, ist immer gesund.', false, 'Werbung will etwas verkaufen. Oft zeigt sie Süßes.'],
    ]),
    P('sk1k_tr', 'essen', 'trinken', [
      ['Was löscht den Durst am besten?', ['Wasser', 'Limonade', 'Cola']],
      ['Du solltest jeden Tag genug trinken.', true],
      ['In Limonade steckt viel Zucker.', true],
      ['Wie viele Gläser trinkst du ungefähr am Tag?', ['Etwa 6 Gläser', '1 Glas', '30 Gläser']],
      ['Trinken brauchst du nur im Sommer.', false, 'Dein Körper braucht jeden Tag Wasser, auch im Winter.'],
    ]),
    P('sk1k_kl', 'kleidung', 'kleidung', [
      ['Was schützt im Sommer vor Sonnenbrand?', ['Sonnencreme und Hut', 'Ein Schal', 'Gummistiefel']],
      ['Was ziehst du an, wenn es dunkel ist?', ['Helle Sachen mit Reflektoren', 'Nur dunkle Sachen', 'Eine Sonnenbrille']],
      ['Warum ziehst du im Winter Handschuhe an?', ['Gegen kalte Hände', 'Zum Schwimmen', 'Gegen Sonnenbrand']],
      ['Bei Regen ziehst du Sandalen an.', false, 'Bei Regen halten Gummistiefel die Füße trocken.'],
      ['Was ziehst du im Herbst an, wenn es kühl ist?', ['Eine warme Jacke', 'Eine Badehose', 'Nur ein Unterhemd']],
      ['Was hilft, wenn es mal warm, mal kalt ist?', ['Mehrere dünne Schichten', 'Nur ein T-Shirt', 'Ein dicker Wintermantel']],
      ['Was setzt du bei großer Hitze auf?', ['Einen Sonnenhut', 'Eine Wollmütze', 'Eine Taucherbrille']],
      ['Eine Mütze schützt im Winter die Ohren vor Kälte.', true],
      ['Wozu ist ein Regenschirm gut?', ['Er hält dich trocken', 'Er wärmt dich', 'Er leuchtet']],
      ['Mit nassen Socken bekommst du schnell kalte Füße.', true],
    ]),
    P('sk1k_ne', 'schutz', 'nein', [
      ['Jemand fasst dich an. Du willst das nicht. Was sagst du?', ['Laut „Nein!“', 'Gar nichts', '„Danke schön“']],
      ['Dein Körper gehört dir.', true],
      ['Ein Geheimnis, das Angst macht, musst du für dich behalten.', false, 'Ein Geheimnis, das dir Angst oder Bauchweh macht, darfst du immer erzählen.'],
      ['Wem erzählst du, wenn dich etwas bedrückt?', ['Mama, Papa oder Lehrerin', 'Niemandem', 'Einem Fremden']],
      ['Wie heißt das Telefon für Kinder mit Sorgen?', ['Nummer gegen Kummer', 'Zeitansage', 'Wetterdienst']],
      ['Wie lautet die Nummer gegen Kummer?', ['116 111', '110', '112']],
      ['Bei der Nummer gegen Kummer kostet der Anruf nichts.', true],
      ['Ein Geschenk für Mama ist ein gutes Geheimnis.', true],
      ['Was ist mutig?', ['Hilfe holen', 'Alles für dich behalten', 'Trotzdem mitmachen']],
      ['Wenn dir jemand wehtut, bist du schuld.', false, 'Du bist nie schuld. Erzähl es einem Erwachsenen, dem du vertraust.'],
      ['Ein Kind hört nicht auf, obwohl du „Stopp“ sagst. Was tust du?', ['Hilfe holen', 'Lachen', 'Still sein']],
      ['Du darfst Nein sagen, auch zu Erwachsenen.', true],
      ['Woran merkst du, dass etwas nicht stimmt?', ['Am Bauchgefühl', 'An der Uhr', 'Am Wetter']],
    ]),
    P('sk1k_eh', 'hilfe', 'erstehilfe', [
      ['Deine Nase blutet. Wie hältst du den Kopf?', ['Nach vorn beugen', 'In den Nacken legen', 'Auf die Seite legen']],
      ['Was kühlt bei Nasenbluten den Nacken?', ['Ein kalter, nasser Lappen', 'Eine warme Mütze', 'Ein Föhn']],
      ['Du hast dich leicht verbrannt. Was tust du?', ['Mit kühlem Wasser kühlen', 'Butter daraufschmieren', 'Nichts tun']],
      ['Auf eine Verbrennung legst du Eis.', false, 'Eis ist zu kalt. Kühle mit kühlem, fließendem Wasser.'],
      ['Du hast dir das Knie aufgeschürft. Was hilft?', ['Sauber machen, Pflaster drauf', 'Erde darauf reiben', 'Daran kratzen']],
      ['Bei einer Wunde holst du einen Erwachsenen.', true],
      ['Was ist im Erste-Hilfe-Kasten?', ['Pflaster und Verband', 'Spielzeug', 'Süßigkeiten']],
      ['Ein Kind ist hingefallen und weint. Was tust du?', ['Einen Erwachsenen holen', 'Weitergehen', 'Auslachen']],
      ['Dich hat eine Wespe in den Arm gestochen. Was hilft?', ['Kühlen', 'Kratzen', 'Reiben']],
    ]),
    P('sk1k_nr', 'hilfe', 'notruf', [
      ['Welche Nummer hat der Rettungsdienst?', ['112', '110', '116 111']],
      ['Welche Nummer hat die Polizei?', ['110', '112', '116 111']],
      ['Den Notruf kannst du auch ohne Geld anrufen.', true],
      ['Was sagst du beim Notruf?', ['Wo du bist', 'Deine Lieblingsfarbe', 'Wie spät es ist']],
      ['Beim Notruf legst du erst auf, wenn die Leitstelle es sagt.', true],
      ['Den Notruf darf man zum Spaß wählen.', false, 'Der Notruf ist nur für echte Notfälle. Sonst fehlt die Hilfe woanders.'],
    ]));
  const KO_TUT = {
    'parts:1': { title: 'Körperteile', steps: ['Ein Teil im Bild leuchtet gelb.', 'Beispiel: Ganz oben leuchtet der Kopf.', 'Tippe auf den richtigen Namen.'] },
    'parts:2': { title: 'Körperteile finden', steps: ['Oben steht ein Name.', 'Beispiel: „Tippe auf: Hand“. Die Hand ist am Ende vom Arm.', 'Tippe im Bild auf diesen Teil.'] },
    'pflege:1': { title: 'Sauber und gesund', steps: ['Fragen zum Waschen, Zähneputzen und Schlafen.', 'Beispiel: Vor dem Essen wäschst du die Hände mit Seife.', 'Tippe auf die richtige Antwort.'] },
    'pflegeord:1': { title: 'Der Reihe nach', steps: ['Die Schritte sind durcheinander.', 'Tippe den ersten Schritt an, dann den zweiten.', 'Beim Händewaschen machst du die Hände zuerst nass.'] },
    'essen:1': { title: 'Gesund essen und trinken', steps: ['Fragen zu Frühstück, Brotdose und Trinken.', 'Beispiel: Wasser löscht den Durst am besten.', 'Tippe auf die richtige Antwort.'] },
    'essen:2': { title: 'Was ist gesund?', steps: ['Du siehst drei Bilder.', 'Nur eins davon ist gesund. Die anderen haben viel Zucker.', 'Tippe auf das gesunde Essen.'] },
    'kleidung:1': { title: 'Kleidung zum Wetter', steps: ['Manchmal siehst du ein Wetterzeichen.', 'Beispiel: Bei Regen ziehst du Regenjacke und Gummistiefel an.', 'Tippe auf die Kleidung, die passt.'] },
    'schutz:1': { title: 'Nein sagen', steps: ['Dein Körper gehört dir. Du darfst Nein sagen.', 'Beispiel: Wenn dich etwas bedrückt, erzählst du es einem Erwachsenen, dem du vertraust.', 'Tippe auf die richtige Antwort.'] },
    'hilfe:1': { title: 'Erste Hilfe', steps: ['Fragen zu kleinen Verletzungen und zum Notruf.', 'Beispiel: Bei Nasenbluten beugst du den Kopf nach vorn.', 'Tippe auf die richtige Antwort.'] },
    'hilfeord:1': { title: 'Der Notruf', steps: ['Die Schritte beim Notruf sind durcheinander.', 'Zuerst wählst du 112.', 'Dann sagst du, wo du bist und was passiert ist.'] },
  };
  function koGen(cfg) {
    return (m, tier, know, seq, opts) => {
      if (m === 'parts') return plantTask(cfg, 'koerper12', m, tier, know, seq, opts);
      if (wantsPool(cfg, m, opts)) return null;
      const r = Math.random();
      if (m === 'pflege' && r < 0.3) return Math.random() < 0.5 ? orderTask(m, 'pflegeord:1', 'pflege', 'Wie wäschst du die Hände? Tippe der Reihe nach an.', HAENDE, 'sk1k_ohand_')
        : orderTask(m, 'pflegeord:1', 'zaehne', 'Wie putzt du die Zähne? Tippe der Reihe nach an.', ZAEHNE, 'sk1k_ozahn_');
      if (m === 'essen' && r < 0.35) { const h = pick(HEALTHY), s = shuffle(SWEET).slice(0, 2);
        return { kind: 'choice', mod: m, tier: 1, group: 'essen:2', note: 'essen', q: 'Was ist gesund? Tippe darauf.', options: shuffle([h].concat(s)).map(foodSVG), answer: foodSVG(h), svgOpts: true, why: 'Gesund ist zum Beispiel das:', qid: 'sk1k_food_' + h }; }
      if (m === 'kleidung' && r < 0.5) { const w = pick(WEAR); return choice(m, 'kleidung', 'So ist das Wetter. Was ziehst du an?', w[1], others(WEAR, w).map((x) => x[1]), 'sk1k_wear_' + w[0], { pic: wxSVG(w[0]) }); }
      if (m === 'hilfe' && r < 0.2) return orderTask(m, 'hilfeord:1', 'notruf', 'So geht der Notruf. Tippe der Reihe nach an.', NOTRUF, 'sk1k_onot_');
      return null;
    };
  }
  const dil = (title, text, opts) => ({ title, dilemma: true, reward: { hp: 5 }, text, opts: opts.map(([label, then, think]) => ({ label, then, think })) });
  const ask = (title, text, task, g, win, lose) => ({ title, text, opts: [{ label: 'Antworten', task, g, win, lose: lose || { hp: -5 } }, { label: 'Weitergehen', effect: {} }] });
  const rest = (title, text) => ({ title, text, opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] });
  const KO = unit({ grade: 1, title: 'Mein Körper', icon: '🙂', sub: 'Körperteile, Zähne putzen, gesund essen, Kleidung, Nein sagen und Erste Hilfe', school: ['koerper12', 'gesicht12'],
    modules: { parts: mod('Körperteile', '🙂', 'Hampelmann', 12, 2), pflege: mod('Sauber und gesund', '💧', 'Zahnbürste', 12), essen: mod('Gesund essen', '🍞', 'Brotdose', 12),
      kleidung: mod('Kleidung zum Wetter', '🌦', 'Gummistiefel', 12), schutz: mod('Nein sagen', '🛑', 'Lautes Nein', 10), hilfe: mod('Erste Hilfe', '🦺', 'Pflaster', 14) },
    attacks: [{ name: 'Hampelmann', mod: 'parts' }, { name: 'Zahnbürste', mod: 'pflege' }, { name: 'Brotdose', mod: 'essen' }, { name: 'Pflaster', mod: 'hilfe' }],
    tut: KO_TUT, notes: KO_NOTES, pool: KO_POOL,
    events: [
      ask('Beim Kinderarzt', 'Die Kinderärztin misst, wie groß du bist. Sie fragt dich nach deinem Körper und schenkt dir einen Trank.', 'parts', 'koerper', { item: 'trank' }, { hp: -6 }),
      ask('Das Zahnputzplakat', 'Im Waschraum der Schule hängt ein Plakat mit einer Zahnbürste. Die Schulzahnärztin gibt dir einen Schild für eine richtige Antwort.', 'pflege', 'zaehne', { item: 'schild' }),
      ask('Das Klassenfrühstück', 'Heute frühstückt die Klasse zusammen. Die Lehrerin fragt dich nach gesundem Essen und gibt dir eine Chilischote.', 'essen', 'essen', { item: 'keks' }, { xp: 5 }),
      ask('Der Erste-Hilfe-Kasten', 'Der Hausmeister zeigt dir den Erste-Hilfe-Kasten. Er fragt dich, was man bei kleinen Verletzungen tut.', 'hilfe', 'erstehilfe', { item: 'engel' }),
      ask('Die Garderobe', 'An der Garderobe hängen Jacken, Mützen und Regenhosen. Ein Junge fragt dich, was man bei welchem Wetter anzieht.', 'kleidung', 'kleidung', { xp: 20 }, { xp: 5 }),
      rest('Die Turnhalle', 'In der Turnhalle liegen dicke Matten. Hier ruhst du dich aus.'),
      dil('Die Umarmung', 'Tante Gisela will dich zur Begrüßung fest drücken. Du hast heute keine Lust auf eine Umarmung.', [
        ['Ich gebe ihr die Hand.', 'Tante Gisela lächelt und schüttelt deine Hand. Das ist auch eine schöne Begrüßung.', 'Wie kannst du jemanden begrüßen, ohne ihn zu umarmen?'],
        ['Ich sage: „Heute lieber nicht.“', 'Mama nickt dir zu. Tante Gisela sagt: „Na gut, dann winken wir.“', 'Warum darfst du selbst entscheiden, wer dich umarmt?'],
        ['Ich lasse es geschehen.', 'Du fühlst dich nicht wohl dabei. Später erzählst du es Mama.', 'Was könntest du beim nächsten Mal sagen?']]),
      dil('Das Geheimnis', 'Ein älteres Kind sagt: „Ich zeig dir was. Aber du darfst es keinem erzählen!“ Dir ist dabei mulmig.', [
        ['„Nein, ich will das nicht.“', 'Du gehst zu deinen Freunden. Das mulmige Gefühl wird kleiner.', 'Woran erkennst du ein schlechtes Geheimnis?'],
        [HELP, 'Du erzählst es deiner Lehrerin. Sie hört dir zu und kümmert sich darum.', 'Wem kannst du alles erzählen?'],
        ['Ich gehe einfach weg.', 'Zu Hause erzählst du Papa davon. Er hört dir zu und ist froh, dass du es ihm gesagt hast.', 'Warum ist Weggehen auch ein Nein?']]),
      dil('Die Frühstücksflocken', 'Im Fernsehen läuft Werbung für bunte Frühstücksflocken mit Spielzeug in der Packung. Du willst sie unbedingt haben.', [
        ['Ich frage Papa, ob wir sie kaufen.', 'Papa liest dir vor, wie viel Zucker darin ist. Ihr kauft sie als Ausnahme für Sonntag.', 'Warum steckt Spielzeug in der Packung?'],
        ['Ich esse lieber Haferflocken mit Obst.', 'Das hält lange satt. Die Werbung hast du bald vergessen.', 'Was macht ein Frühstück gesund?'],
        ['Ich schaue mir die Packung im Laden an.', 'Vorn ist ein lachender Löwe, aber innen ist vor allem Zucker.', 'Was will Werbung von dir?']]),
      dil('Die Mütze', 'Draußen ist es kalt. Deine Freundin lacht: „Mützen sind doch doof!“', [
        ['Ich setze sie trotzdem auf.', 'Deine Ohren bleiben warm. Nach der Pause setzt deine Freundin ihre Kapuze auf.', 'Warum ist dir dein Körper wichtiger als ein Spruch?'],
        ['Ich stecke sie in die Tasche.', 'Nach der Pause sind deine Ohren eiskalt und rot.', 'Was hättest du deiner Freundin sagen können?'],
        ['Ich frage: „Was ist daran doof?“', 'Sie zuckt mit den Schultern. Eigentlich weiß sie es selbst nicht.', 'Warum macht man manchmal einfach mit, was andere sagen?']]),
    ] });
  KO.gen = koGen(KO);

  /* ================= DURCH DAS JAHR (Klasse 1, LB 5 mit Jahreszeiten aus LB 3 und Wetter aus LB 4) ================= */
  const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  // Monate je Jahreszeit, wie im Sachunterricht üblich: Frühling März bis Mai
  const seasonOf = (m) => Math.floor(((m + 10) % 12) / 3);
  const TAG = ['Aufstehen', 'Frühstücken', 'In die Schule gehen', 'Mittag essen', 'Hausaufgaben machen', 'Abendbrot essen', 'Schlafen gehen'].map((text, i) => ({ id: 't' + i, text }));
  const QUEREN = [{ id: 'q1', text: 'Am Bordstein stehen bleiben' }, { id: 'q2', text: 'Nach links schauen' }, { id: 'q3', text: 'Nach rechts schauen' }, { id: 'q4', text: 'Noch einmal links schauen' }, { id: 'q5', text: 'Zügig geradeaus gehen' }];
  const hourName = (h) => ((h - 1 + 12) % 12) + 1;
  const timeName = (h, half) => (half ? `halb ${hourName(h + 1)}` : `${hourName(h)} Uhr`);
  const JA_NOTES = {
    zeiten: { title: 'Die Jahreszeiten', lines: ['Frühling: März, April, Mai. Die ersten Blumen blühen, die Bäume bekommen Blätter.', 'Sommer: Juni, Juli, August. Es ist warm, die Tage sind lang.', 'Herbst: September, Oktober, November. Die Blätter werden bunt und fallen ab. Viele Vögel ziehen in den Süden.', 'Winter: Dezember, Januar, Februar. Es ist kalt, manchmal schneit es. Laubbäume sind kahl.'] },
    monate: { title: 'Die Monate', lines: ['Ein Jahr hat 12 Monate und 365 Tage.', MONTHS.join(', ') + '.', 'Der Februar hat die wenigsten Tage.', 'Ein Monat hat ungefähr 4 Wochen.'] },
    woche: { title: 'Die Woche', lines: ['Eine Woche hat 7 Tage.', DAYS.join(', ') + '.', 'Samstag und Sonntag sind das Wochenende.', 'Vorgestern, gestern, heute, morgen, übermorgen.'] },
    tag: { title: 'Mein Tag', lines: ['Morgens geht die Sonne auf. Du stehst auf und frühstückst.', 'Mittags steht die Sonne am höchsten.', 'Nachmittags machst du Hausaufgaben und spielst.', 'Abends geht die Sonne unter. Es gibt Abendbrot.', 'Nachts siehst du Mond und Sterne. Du schläfst etwa 10 Stunden.'] },
    uhr: { title: 'Die Uhr', lines: ['Der kleine Zeiger zeigt die Stunde.', 'Zeigt der große Zeiger auf die 12, ist es eine volle Stunde, zum Beispiel 3 Uhr.', 'Zeigt der große Zeiger auf die 6, ist es halb. Halb 4 ist eine halbe Stunde vor 4 Uhr.', 'Ein Tag hat 24 Stunden, eine Stunde hat 60 Minuten.'] },
    wetter: { title: 'Das Wetter', lines: [Object.values(WX).map((w) => w.name).join(', ') + ': Diese Zeichen hängen an der Wetterwand.', 'Das Thermometer zeigt, wie warm es ist.', 'Bei Gewitter gehst du in ein Haus. Stell dich nie unter einen einzelnen Baum.', 'Bei Nebel siehst du nicht weit. Auf nasser Straße bremsen Autos schlechter.'] },
    weg: { title: 'Sicher zur Schule', lines: ['Am Bordstein bleibst du stehen. Du schaust links, rechts und noch einmal links. Ist alles frei, gehst du zügig geradeaus.', 'Am sichersten gehst du an der Ampel oder am Zebrastreifen über die Straße.', 'Rot heißt warten, Grün heißt gehen.', 'An der Haltestelle wartest du mit Abstand zur Straße, bis der Bus hält.', 'Im Dunkeln trägst du helle Sachen und Reflektoren.'] },
    fremde: { title: 'Nicht mit Fremden mitgehen', lines: ['Mit Fremden gehst du nie mit und steigst nie in ein fremdes Auto.', 'Sag laut „Nein!“ und geh weg.', 'Erzähle es sofort deinen Eltern oder der Lehrerin.'] },
  };
  const JA_POOL = [].concat(
    P('sk1j_ze', 'zeiten', 'zeiten', [
      ['Wie viele Jahreszeiten gibt es?', ['4', '2', '12']],
      ['Welche Jahreszeit kommt nach dem Winter?', ['Frühling', 'Sommer', 'Herbst']],
      ['Wann fallen die bunten Blätter von den Bäumen?', ['Im Herbst', 'Im Frühling', 'Im Sommer']],
      ['Wann blühen die ersten Blumen?', ['Im Frühling', 'Im Herbst', 'Im Winter']],
      ['Wann ist es am wärmsten?', ['Im Sommer', 'Im Winter', 'Im Herbst']],
      ['Wann baust du einen Schneemann?', ['Im Winter', 'Im Sommer', 'Im Frühling']],
      ['Im Sommer sind die Tage lang.', true],
      ['Im Winter tragen Laubbäume grüne Blätter.', false, 'Im Winter sind Laubbäume kahl. Die Blätter fallen im Herbst ab.'],
      ['Wann ernten wir viele Äpfel?', ['Im Herbst', 'Im Winter', 'Im Frühling']],
      ['In welcher Jahreszeit ist Weihnachten?', ['Im Winter', 'Im Sommer', 'Im Frühling']],
      ['In welcher Jahreszeit ist Ostern?', ['Im Frühling', 'Im Herbst', 'Im Winter']],
      ['Welche Monate gehören zum Sommer?', ['Juni, Juli, August', 'Dezember, Januar, Februar', 'März, April, Mai']],
      ['Im Herbst fliegen viele Vögel in den Süden.', true],
    ]),
    P('sk1j_mo', 'kalender', 'monate', [
      ['Wie viele Monate hat ein Jahr?', ['12', '7', '4']],
      ['Was ist der erste Monat im Jahr?', ['Januar', 'Dezember', 'März']],
      ['Was ist der letzte Monat im Jahr?', ['Dezember', 'Januar', 'November']],
      ['Wie viele Tage hat ein Jahr?', ['365', '7', '30']],
      ['Welcher Monat hat die wenigsten Tage?', ['Februar', 'Juli', 'Dezember']],
      ['Silvester ist am letzten Tag im Dezember.', true],
      ['Ein Monat hat ungefähr 4 Wochen.', true],
      ['Wo siehst du, welcher Tag heute ist?', ['Auf dem Kalender', 'Im Kochbuch', 'Auf der Landkarte']],
    ]),
    P('sk1j_wo', 'kalender', 'woche', [
      ['Wie viele Tage hat eine Woche?', ['7', '5', '12']],
      ['Welche Tage sind das Wochenende?', ['Samstag und Sonntag', 'Montag und Dienstag', 'Freitag und Montag']],
      ['Nach Sonntag beginnt die neue Woche mit Montag.', true],
      ['An welchen Tagen hast du meistens Schule?', ['Montag bis Freitag', 'Samstag und Sonntag', 'Nur am Mittwoch']],
      ['Wie heißt der Tag vor gestern?', ['Vorgestern', 'Übermorgen', 'Morgen']],
      ['Wie heißt der Tag nach morgen?', ['Übermorgen', 'Vorgestern', 'Gestern']],
    ]),
    P('sk1j_ta', 'tag', 'tag', [
      ['Wann frühstückst du?', ['Morgens', 'Abends', 'Nachts']],
      ['Wann isst du Abendbrot?', ['Abends', 'Morgens', 'Mittags']],
      ['Wann steht die Sonne am höchsten?', ['Mittags', 'Morgens', 'Abends']],
      ['Wann siehst du die Sterne?', ['Nachts', 'Mittags', 'Morgens']],
      ['Morgens geht die Sonne auf.', true],
      ['Wann geht die Sonne unter?', ['Abends', 'Morgens', 'Mittags']],
      ['Was machst du, bevor du schlafen gehst?', ['Zähne putzen', 'Frühstücken', 'Zur Schule gehen']],
      ['Was machst du gleich nach dem Aufstehen?', ['Waschen und anziehen', 'Abendbrot essen', 'Schlafen gehen']],
      ['Kinder brauchen nachts etwa 10 Stunden Schlaf.', true],
      ['Was kommt nach dem Mittag?', ['Der Nachmittag', 'Der Morgen', 'Die Nacht']],
      ['Was kommt nach dem Abend?', ['Die Nacht', 'Der Mittag', 'Der Morgen']],
      ['Nach langem Sitzen tut Bewegung gut.', true],
    ]),
    P('sk1j_uh', 'uhr', 'uhr', [
      ['Welcher Zeiger zeigt die Stunden?', ['Der kleine Zeiger', 'Der große Zeiger', 'Keiner']],
      ['Wohin zeigt der große Zeiger bei „halb“?', ['Auf die 6', 'Auf die 12', 'Auf die 3']],
      ['Um 3 Uhr zeigt der große Zeiger auf die ___.', ['12', '3', '6']],
      ['Wie viele Stunden hat ein Tag?', ['24', '12', '60']],
      ['Wie viele Minuten hat eine Stunde?', ['60', '100', '24']],
      ['Halb 8 ist eine halbe Stunde vor 8 Uhr.', true],
      ['Um halb 5 zeigt der kleine Zeiger genau auf die 5.', false, 'Um halb 5 steht der kleine Zeiger zwischen der 4 und der 5.'],
      ['Was ist eine halbe Stunde nach 9 Uhr?', ['halb 10', 'halb 9', '10 Uhr']],
      ['Es ist 7 Uhr. Wie spät ist es eine Stunde später?', ['8 Uhr', '6 Uhr', 'halb 8']],
      ['Womit siehst du, wie spät es ist?', ['Mit der Uhr', 'Mit dem Lineal', 'Mit dem Thermometer']],
      ['Wo stehen um 12 Uhr beide Zeiger?', ['Beide auf der 12', 'Beide auf der 6', 'Auf 3 und 9']],
    ]),
    P('sk1j_we', 'wetter', 'wetter', [
      ['Womit misst man, wie warm es ist?', ['Mit dem Thermometer', 'Mit der Uhr', 'Mit der Waage']],
      ['Was fällt im Winter oft vom Himmel?', ['Schnee', 'Blätter', 'Sand']],
      ['Was siehst du manchmal, wenn Sonne und Regen zusammenkommen?', ['Einen Regenbogen', 'Den Mond', 'Schnee']],
      ['Bei Gewitter suchst du Schutz in einem Haus.', true],
      ['Bei Gewitter stellst du dich unter einen einzelnen Baum.', false, 'Blitze schlagen oft in hohe Bäume ein. Geh in ein Haus oder Auto.'],
      ['Woran siehst du, dass es windig ist?', ['Die Blätter bewegen sich', 'Die Sonne scheint', 'Es ist dunkel']],
      ['Wie weit siehst du bei Nebel?', ['Nicht weit', 'Sehr weit', 'Bis zum Mond']],
      ['Warum ist eine nasse Straße gefährlich?', ['Autos bremsen schlechter', 'Sie ist zu laut', 'Sie ist zu warm']],
      ['Woraus besteht Hagel?', ['Aus Eiskörnern', 'Aus Sand', 'Aus Zucker']],
      ['Wolken bestehen aus winzigen Wassertröpfchen.', true],
      ['Wo erfährst du, wie das Wetter morgen wird?', ['In der Wettervorhersage', 'Im Kochbuch', 'Auf dem Stundenplan']],
      ['Woran erkennst du morgens Frost?', ['Eis auf den Pfützen', 'Warme Luft', 'Grünes Laub']],
    ]),
    P('sk1j_sw', 'weg', 'weg', [
      ['Wo gehst du am sichersten über die Straße?', ['An der Ampel', 'Zwischen parkenden Autos', 'Hinter einer Kurve']],
      ['Was tust du am Zebrastreifen, bevor du gehst?', ['Warten, bis Autos halten', 'Sofort losrennen', 'Aufs Handy schauen']],
      ['Zwischen parkenden Autos sehen dich Autofahrer schlecht.', true],
      ['Wo wartest du an der Haltestelle?', ['Mit Abstand zur Straße', 'Ganz vorn am Bordstein', 'Auf der Fahrbahn']],
      ['Der Bus kommt. Was tust du?', ['Warten, bis er hält', 'Zum Bus rennen', 'Drängeln']],
      ['Im Bus hältst du dich gut fest.', true],
      ['Was macht dich im Dunkeln gut sichtbar?', ['Helle Farben', 'Schwarze Sachen', 'Eine Sonnenbrille']],
      ['Bei Rot darfst du gehen, wenn kein Auto kommt.', false, 'Bei Rot bleibst du stehen. Andere Kinder schauen auf dich und machen es nach.'],
      ['Wohin schaust du am Bordstein zuerst?', ['Nach links', 'Nach rechts', 'Nach oben']],
      ['Dein Ball rollt auf die Straße. Was tust du?', ['Stehen bleiben, Erwachsenen holen', 'Hinterherrennen', 'Die Augen zumachen']],
    ]),
    P('sk1j_fr', 'weg', 'fremde', [
      ['Ein Fremder sagt: „Steig ein, ich fahr dich heim.“ Was tust du?', ['„Nein!“ sagen und weggehen', 'Einsteigen', 'Mitgehen, er ist nett']],
      ['Mit Fremden gehst du nie mit, auch nicht für Süßigkeiten.', true],
      ['Wem sagst du, dass dich ein Fremder angesprochen hat?', ['Deinen Eltern', 'Niemandem', 'Nur deinem Teddy']],
    ]));
  const JA_TUT = {
    'zeiten:1': { title: 'Jahreszeiten', steps: ['Es gibt vier Jahreszeiten: Frühling, Sommer, Herbst und Winter.', 'Beispiel: Ein Baum mit bunten Blättern zeigt den Herbst.', 'Tippe auf die richtige Antwort.'] },
    'zeitenord:1': { title: 'Jahreszeiten ordnen', steps: ['Die Jahreszeiten sind durcheinander.', 'Fang mit dem Frühling an.', 'Dann kommen Sommer, Herbst und Winter.'] },
    'kalender:1': { title: 'Monate und Wochentage', steps: ['Fragen zu den Tagen der Woche und den Monaten im Jahr.', 'Beispiel: Nach Montag kommt Dienstag. Nach März kommt April.', 'Tippe auf die richtige Antwort.'] },
    'kalenderord:1': { title: 'Der Reihe nach', steps: ['Tage oder Monate sind durcheinander.', 'Sprich die Reihe leise mit: Montag, Dienstag, Mittwoch …', 'Tippe sie in dieser Reihenfolge an.'] },
    'tag:1': { title: 'Mein Tag', steps: ['Morgens, mittags, abends, nachts: Was passiert wann?', 'Beispiel: Steht die Sonne ganz oben, ist es mittags.', 'Tippe auf die richtige Antwort.'] },
    'tagord:1': { title: 'Mein Tag der Reihe nach', steps: ['Die Dinge eines Tages sind durcheinander.', 'Was machst du zuerst? Fang mit dem Morgen an.', 'Tippe der Reihe nach bis zum Abend.'] },
    'uhr:1': { title: 'Die Uhr', steps: ['Der kleine Zeiger zeigt die Stunde.', 'Steht der große Zeiger auf der 12, ist es „Uhr“. Steht er auf der 6, ist es „halb“.', 'Beispiel: Kleiner Zeiger zwischen 3 und 4, großer auf der 6: halb 4.'] },
    'wetter:1': { title: 'Wetterzeichen', steps: ['Manchmal siehst du ein Wetterzeichen.', 'Beispiel: Eine Wolke mit Tropfen bedeutet Regen.', 'Tippe auf das passende Wetter.'] },
    'weg:1': { title: 'Sicher zur Schule', steps: ['Fragen zum Schulweg, zur Ampel und zur Haltestelle.', 'Beispiel: Am Bordstein bleibst du stehen und schaust zuerst nach links.', 'Tippe auf die richtige Antwort.'] },
    'wegord:1': { title: 'Über die Straße', steps: ['Die Schritte sind durcheinander.', 'Zuerst bleibst du am Bordstein stehen.', 'Dann links, rechts, noch einmal links schauen. Zuletzt gehst du.'] },
  };
  function jaGen(cfg) {
    return (m, tier, know, seq, opts) => {
      if (wantsPool(cfg, m, opts)) return null;
      const r = Math.random();
      if (m === 'zeiten') {
        if (r < 0.35) { const i = rnd(0, 3); return choice(m, 'zeiten', 'Welche Jahreszeit zeigt das Bild?', SEASONS[i], others(SEASONS, SEASONS[i]), 'sk1j_jz_' + i, { pic: seasonSVG(i) }); }
        if (r < 0.55) { const mo = rnd(0, 11), s = seasonOf(mo); return choice(m, 'zeiten', `Zu welcher Jahreszeit gehört der ${MONTHS[mo]}?`, SEASONS[s], others(SEASONS, SEASONS[s]), 'sk1j_mz_' + mo); }
        if (r < 0.65) return orderTask(m, 'zeitenord:1', 'zeiten', 'Tippe die Jahreszeiten der Reihe nach an. Fang mit dem Frühling an.', SEASONS.map((text, i) => ({ id: 's' + i, text })), 'sk1j_oz_');
      }
      if (m === 'kalender') {
        if (r < 0.25) { const d = rnd(0, 6), k = rnd(0, 3), off = [1, -1, 2, -2][k], word = ['morgen', 'gestern', 'übermorgen', 'vorgestern'][k], a = DAYS[(d + off + 7) % 7];
          return choice(m, 'woche', `Heute ist ${DAYS[d]}. Welcher Tag ist ${word}?`, a, others(DAYS.filter((x) => x !== DAYS[d]), a), 'sk1j_dw_' + d + k); }
        if (r < 0.45) { const mo = rnd(0, 11), after = Math.random() < 0.6, a = MONTHS[(mo + (after ? 1 : 11)) % 12];
          return choice(m, 'monate', `Welcher Monat kommt ${after ? 'nach dem' : 'vor dem'} ${MONTHS[mo]}?`, a, others(MONTHS.filter((x) => x !== MONTHS[mo]), a), 'sk1j_mn_' + mo + (after ? 'n' : 'v')); }
        if (r < 0.6) return Math.random() < 0.5 ? orderTask(m, 'kalenderord:1', 'woche', 'Tippe die Wochentage der Reihe nach an.', DAYS.map((text, i) => ({ id: 'd' + i, text })), 'sk1j_od_')
          : orderTask(m, 'kalenderord:1', 'monate', 'Tippe die Monate der Reihe nach an.', MONTHS.map((text, i) => ({ id: 'm' + i, text })), 'sk1j_om_');
      }
      if (m === 'tag') {
        if (r < 0.35) { const d = pick(DAYTIMES), c = shuffle(DAYTIMES.filter((x) => x !== d && x.name !== d.not));
          return choice(m, 'tag', 'Welche Tageszeit zeigt das Bild?', d.name, [c[0], c.find((x, i) => i && x.not !== c[0].name)].map((x) => x.name), 'sk1j_dt_' + d.name, { pic: daySVG(d) }); }
        if (r < 0.55) return orderTask(m, 'tagord:1', 'tag', 'Was machst du zuerst? Tippe der Reihe nach an.', TAG, 'sk1j_ot_');
      }
      if (m === 'uhr' && r < 0.7) {
        const h = rnd(1, 12), half = Math.random() < 0.5, a = timeName(h, half);
        const wrong = half ? [`halb ${hourName(h)}`, `${hourName(h)} Uhr`, `${hourName(h + 1)} Uhr`] : [`halb ${hourName(h)}`, `${hourName(h + 1)} Uhr`, `halb ${hourName(h + 1)}`];
        return choice(m, 'uhr', 'Wie spät ist es?', a, shuffle(wrong).slice(0, 2), 'sk1j_uhr_' + h + (half ? 'h' : ''), { pic: J.clockSVG(h % 12, half ? 30 : 0), time: [h, half] });
      }
      if (m === 'wetter' && r < 0.6) { const k = pick(Object.keys(WX)); return choice(m, 'wetter', 'Welches Wetter zeigt das Zeichen?', WX[k].name, others(Object.values(WX), WX[k]).map((x) => x.name), 'sk1j_wx_' + k, { pic: wxSVG(k) }); }
      if (m === 'weg') {
        if (r < 0.25) { const k = pick(['rot', 'gruen']); return choice(m, 'weg', 'Die Ampel zeigt das. Was bedeutet es?', AMPEL[k].mean, [AMPEL[k === 'rot' ? 'gruen' : 'rot'].mean, 'Du musst rennen'], 'sk1j_amp_' + k, { pic: ampelSVG(k) }); }
        if (r < 0.45) return orderTask(m, 'wegord:1', 'weg', 'So gehst du über die Straße. Tippe der Reihe nach an.', QUEREN, 'sk1j_oq_', 5);
      }
      return null;
    };
  }
  const JA = unit({ grade: 1, title: 'Durch das Jahr', icon: '📅', sub: 'Jahreszeiten, Monate, Wochentage, die Uhr, Wetterzeichen und der sichere Schulweg',
    modules: { zeiten: mod('Jahreszeiten', '🌳', 'Herbstlaub', 12), kalender: mod('Monate und Wochentage', '📅', 'Kalenderblatt', 12), tag: mod('Mein Tag', '☀', 'Wecker', 10),
      uhr: mod('Die Uhr', '🕰', 'Kuckucksuhr', 14), wetter: mod('Wetterzeichen', '🌦', 'Regenschirm', 12), weg: mod('Sicher zur Schule', '🚦', 'Zebrastreifen', 14) },
    attacks: [{ name: 'Herbstlaub', mod: 'zeiten' }, { name: 'Kalenderblatt', mod: 'kalender' }, { name: 'Kuckucksuhr', mod: 'uhr' }, { name: 'Zebrastreifen', mod: 'weg' }],
    tut: JA_TUT, notes: JA_NOTES, pool: JA_POOL,
    events: [
      ask('Der Kalender im Flur', 'Im Schulflur hängt ein großer Kalender. Der Hausmeister fragt dich nach den Monaten und schenkt dir einen Trank.', 'kalender', 'monate', { item: 'trank' }, { hp: -6 }),
      ask('Die Turmuhr', 'Am Marktplatz schlägt die Turmuhr. Ein Opa fragt dich nach der Uhr und gibt dir einen Schild.', 'uhr', 'uhr', { item: 'schild' }),
      ask('Die Schülerlotsin', 'Vor der Schule hilft eine Schülerlotsin über die Straße. Sie fragt dich nach einer Regel.', 'weg', 'weg', { item: 'engel' }),
      ask('Die Wetterwand', 'An der Wetterwand der Klasse hängen bunte Zeichen. Die Lehrerin kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort.', 'wetter', 'wetter', { item: 'lupe' }, { xp: 5 }),
      ask('Der Apfelbaum', 'Auf dem Schulhof steht ein Apfelbaum. Ein Mädchen fragt dich nach den Jahreszeiten.', 'zeiten', 'zeiten', { xp: 20 }, { xp: 5 }),
      rest('Die Bank am Schulhof', 'Auf dem Schulhof steht eine Bank in der Sonne. Hier ruhst du dich aus.'),
      dil('Die Abkürzung', 'Dein Freund will zwischen parkenden Autos über die Straße. Der Weg zur Ampel ist länger.', [
        ['Ich gehe zur Ampel.', 'Du kommst zwei Minuten später an. Dein Freund wartet schon und winkt.', 'Warum ist der längere Weg manchmal der bessere?'],
        ['Ich frage ihn, ob er mitkommt.', 'Ihr geht zusammen zur Ampel und erzählt euch unterwegs Witze.', 'Wie kannst du einen Freund überzeugen?'],
        ['Ich gehe mit ihm.', 'Zwischen den Autos seht ihr nichts. Ein Auto bremst laut, ihr erschreckt euch sehr.', 'Warum sehen Autofahrer Kinder zwischen parkenden Autos schlecht?']]),
    ] });
  JA.gen = jaGen(JA);

  /* ================= BÄUME UND BLUMEN (Klasse 2, LB 3) ================= */
  const LEAF = '#7CC35B', LEAF_D = '#4E9A32', BARK = '#8A5A34';
  const TREE_PARTS = [
    { id: 'wurzeln', name: 'Wurzeln', desc: 'Sie halten den Baum im Boden fest und holen Wasser aus der Erde.', tip: 'Der Teil ist unter der Erde.' },
    { id: 'stamm', name: 'Stamm', desc: 'Der dicke Teil zwischen Wurzeln und Krone. Außen ist die Rinde.', tip: 'Der Teil ist dick und braun und steht auf der Erde.' },
    { id: 'ast', name: 'Ast', desc: 'Dicke Äste wachsen aus dem Stamm.', tip: 'Der Teil wächst direkt aus dem Stamm.' },
    { id: 'zweig', name: 'Zweig', desc: 'Dünne Zweige wachsen aus den Ästen. An ihnen hängen die Blätter.', tip: 'Der Teil ist dünn und wächst aus einem Ast.' },
    { id: 'krone', name: 'Krone', desc: 'Alle Äste, Zweige und Blätter oben zusammen.', tip: 'Der Teil ist oben, groß und grün.' },
    { id: 'blatt', name: 'Blatt', desc: 'Ein Laubblatt. Laubbäume verlieren ihre Blätter im Herbst.', tip: 'Der Teil ist im Kreis stark vergrößert.' },
  ];
  const TREE = { label: 'Baum', box: '0 0 260 300', parts: TREE_PARTS, qid: 'sk2b_bt_', note: 'baumteile',
    stepOf: { wurzeln: 1, stamm: 2, ast: 3, zweig: 4, krone: 5, blatt: 6 },
    steps: ['Zeichne die Erdlinie und darunter die Wurzeln.', 'Zeichne den dicken Stamm nach oben.', 'Zeichne oben am Stamm zwei dicke Äste.', 'Zeichne an die Äste dünne Zweige.', 'Male um die Äste die grüne Krone.', 'Zeichne daneben ein Blatt, stark vergrößert.'],
    ask: () => 'Wie heißt der leuchtende Teil?', find: (p) => `Tippe auf: ${p.name}`, poolQ: 'Wie heißt dieser Teil des Baumes?', tap: 'den Teil des Baumes' };
  const BLOBS = [[130, 92, 62], [82, 104, 40], [178, 100, 40], [104, 60, 40], [158, 58, 40], [130, 44, 34]];
  TREE.svg = (opts) => partsSVG(TREE, opts, (g) => `${SOIL(240, 260)}
    ${g('wurzeln', `${twin('M130 240 Q112 258 96 282 M130 240 Q126 264 120 292 M130 240 Q140 264 146 290 M130 240 Q150 254 168 276 M130 242 Q104 248 86 254 M130 242 Q156 248 176 252', '#D9B98E', 3)}<rect class="hitarea" x="80" y="242" width="100" height="54" fill="transparent"/>`)}
    ${g('krone', `${BLOBS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${LEAF}" ${ln(2.5)}/>`).join('')}${BLOBS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r - 1.5}" fill="${LEAF}"/>`).join('')}<path d="M70 100 q6 -6 12 0 M150 120 q6 -6 12 0 M110 50 q6 -6 12 0 M176 70 q6 -6 12 0" fill="none" stroke="${LEAF_D}" stroke-width="2" stroke-linecap="round"/>`)}
    ${g('stamm', `<path d="M114 241 Q122 190 120 132 L140 132 Q138 190 146 241 Z" fill="${BARK}" ${ln(2.5)}/><path d="M126 220 q4 -10 0 -20 M134 180 q-3 -8 0 -16" fill="none" stroke="#5E3C22" stroke-width="2"/>`)}
    ${g('ast', twin('M124 140 Q104 118 84 96 M136 140 Q158 116 178 92', BARK, 9) + `<path class="hitarea" d="M124 140 Q104 118 84 96 M136 140 Q158 116 178 92" fill="none" stroke="transparent" stroke-width="22"/>`)}
    ${g('zweig', twin('M84 96 Q74 80 70 62 M84 96 Q70 96 58 104 M178 92 Q188 76 190 58 M178 92 Q192 94 204 102 M130 134 Q130 100 132 66', BARK, 3.5) + `<path class="hitarea" d="M84 96 Q74 80 70 62 M84 96 Q70 96 58 104 M178 92 Q188 76 190 58 M178 92 Q192 94 204 102 M130 126 Q130 100 132 66" fill="none" stroke="transparent" stroke-width="16"/>`)}
    ${g('blatt', `<path d="M72 160 L56 236" stroke="${OUT}" stroke-width="1.5" stroke-dasharray="4 3"/><circle cx="44" cy="262" r="32" fill="#FFF8E1" ${ln(2.5)}/>${at(44, 286, 0, 0.5, `<path d="M0 0 L0 -8 Q-28 -24 -24 -54 Q-18 -80 0 -92 Q18 -80 24 -54 Q28 -24 0 -8" fill="${LEAF}" ${ln(3)}/><path d="M0 -8 L0 -88 M0 -30 L-16 -42 M0 -30 L16 -42 M0 -52 L-14 -64 M0 -52 L14 -64" fill="none" stroke="${LEAF_D}" stroke-width="3"/>`)}`)}`,
  [['wurzeln', 184, 290], ['stamm', 150, 210], ['ast', 14, 132, 'start', [92, 106]], ['zweig', 256, 120, 'end', [200, 100]], ['krone', 256, 22, 'end', [186, 40]], ['blatt', 4, 222]]);
  S.PLANTS.baum12 = TREE;

  const BEAN_PARTS = [
    { id: 'wurzel', name: 'Wurzel', desc: 'Sie hält die Pflanze fest und holt Wasser aus der Erde.', tip: 'Der Teil ist unter der Erde.' },
    { id: 'staengel', name: 'Stängel', desc: 'Er trägt Blätter und Blüten und leitet das Wasser nach oben.', tip: 'Der Teil wächst von der Erde gerade nach oben.' },
    { id: 'blatt', name: 'Blatt', desc: 'Mit den grünen Blättern macht die Pflanze aus Licht ihre Nahrung. Bei der Bohne wachsen immer drei zusammen.', tip: 'Der Teil ist grün und breit.' },
    { id: 'bluete', name: 'Blüte', desc: 'Bienen und Hummeln besuchen sie. Aus der Blüte wird die Frucht.', tip: 'Der Teil ist weiß-lila.' },
    { id: 'frucht', name: 'Frucht', desc: 'Bei der Bohne ist es die lange Hülse. In ihr wachsen die Samen.', tip: 'Der Teil ist lang und hängt nach unten.' },
    { id: 'samen', name: 'Samen', desc: 'Die Bohnen in der Hülse. Aus jedem Samen kann eine neue Pflanze wachsen.', tip: 'Der Teil ist im Kreis stark vergrößert.' },
  ];
  const BEAN = { label: 'Bohnenpflanze', box: '0 0 260 300', parts: BEAN_PARTS, qid: 'sk2b_pt_', note: 'pflanzenteile',
    stepOf: { wurzel: 1, staengel: 2, blatt: 3, bluete: 4, frucht: 5, samen: 6 },
    steps: ['Zeichne die Erdlinie und darunter die Wurzel.', 'Zeichne den Stängel nach oben.', 'Zeichne Blätter an den Stängel. Bei der Bohne sind es immer drei zusammen.', 'Zeichne oben kleine Blüten.', 'Zeichne die langen Hülsen. Das ist die Frucht.', 'Zeichne daneben die Samen, stark vergrößert: die Bohnen.'],
    ask: () => 'Wie heißt der leuchtende Teil?', find: (p) => `Tippe auf: ${p.name}`, poolQ: 'Wie heißt dieser Teil der Pflanze?', tap: 'den Teil der Pflanze' };
  const trio = (x, y, rot, s) => at(x, y, rot, s, [-50, 0, 50].map((r) => at(0, 0, r, 1, `<path d="M0 0 Q-13 -10 -11 -26 Q-6 -38 0 -40 Q6 -38 11 -26 Q13 -10 0 0 Z" fill="${LEAF}" ${ln(1.8)}/><path d="M0 -2 L0 -34" stroke="${LEAF_D}" stroke-width="1.5"/>`)).join(''));
  const bloom = (x, y) => `<g transform="translate(${x} ${y})"><path d="M0 0 Q-10 -4 -9 -12 Q0 -14 0 -4 Q0 -14 9 -12 Q10 -4 0 0 Z" fill="#F2E9FF" ${ln(1.4)}/><path d="M-4 -1 Q0 6 4 -1" fill="#C9A6E8" ${ln(1.2)}/></g>`;
  const pod = (d) => `<path d="${d}" fill="none" ${ln(11)}/><path d="${d}" fill="none" style="stroke:#8BCB4F;stroke-width:8" stroke-linecap="round"/>`;
  const bean = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-10 -5 Q-12 -12 -2 -11 Q4 -9 8 -10 Q14 -8 12 2 Q10 10 0 9 Q-12 8 -10 -5 Z" fill="#E8D7C0" ${ln(1.6)}/><path d="M-1 -10 q-2 4 1 6" fill="none" stroke="${BARK}" stroke-width="1.4"/></g>`;
  BEAN.svg = (opts) => partsSVG(BEAN, opts, (g) => `${SOIL(214, 260)}
    ${g('wurzel', `${twin('M130 214 Q122 236 112 262 M130 214 Q134 240 132 274 M130 214 Q142 234 154 254 M126 230 l-12 6 M133 246 l10 4 M120 248 l-10 2', '#EAD7B0', 2.4)}<rect class="hitarea" x="100" y="216" width="64" height="64" fill="transparent"/>`)}
    ${g('staengel', twin('M130 214 Q127 150 130 100 Q133 70 128 46', '#6DB24A', 5) + `<path class="hitarea" d="M130 214 Q127 150 130 100 Q133 70 128 46" fill="none" stroke="transparent" stroke-width="18"/>`)}
    ${g('blatt', trio(129, 200, -105, 1.1) + trio(130, 192, 105, 1.1) + trio(130, 82, -75, 0.95) + trio(131, 72, 75, 0.95))}
    ${g('bluete', bloom(128, 46) + bloom(140, 56) + bloom(117, 58))}
    ${g('frucht', pod('M129 116 Q108 124 102 154') + pod('M131 108 Q152 116 158 146') + `<path class="hitarea" d="M129 116 Q108 124 102 154 M131 108 Q152 116 158 146" fill="none" stroke="transparent" stroke-width="20"/>`)}
    ${g('samen', `<path d="M160 140 L192 94" stroke="${OUT}" stroke-width="1.5" stroke-dasharray="4 3"/><circle cx="216" cy="64" r="34" fill="#FFF8E1" ${ln(2.5)}/>${bean(202, 54, -10)}${bean(228, 58, 15)}${bean(214, 80, 0)}`)}`,
  [['wurzel', 172, 270], ['staengel', 4, 120, 'start', [126, 170]], ['blatt', 4, 236, 'start', [86, 204]], ['bluete', 4, 30, 'start', [112, 50]], ['frucht', 4, 168, 'start', [104, 150]], ['samen', 216, 116, 'middle']]);
  S.PLANTS.bohne12 = BEAN;

  // Blätter, Nadelzweige und Früchte mit den Merkmalen aus dem Bestimmungsbuch (Blattform, Nadeln, Zapfen, Frucht)
  const leafletK = 'M0 0 Q-9 -16 -8 -34 Q-6 -44 0 -46 Q6 -44 8 -34 Q9 -16 0 0 Z';
  const LEAVES = {
    eiche: `<path d="M50 100 Q40 100 38 92 Q30 92 30 84 Q36 78 34 72 Q24 70 26 60 Q34 56 34 50 Q26 44 30 36 Q38 34 40 28 Q38 18 50 12 Q62 18 60 28 Q62 34 70 36 Q74 44 66 50 Q66 56 74 60 Q76 70 66 72 Q64 78 70 84 Q70 92 62 92 Q60 100 50 100 Z" fill="${LEAF}" ${ln(2)}/><path d="M50 112 L50 16 M50 82 L36 80 M50 82 L64 80 M50 64 L32 62 M50 64 L68 62 M50 44 L34 40 M50 44 L66 40" fill="none" stroke="${LEAF_D}" stroke-width="1.6"/>`,
    buche: `<path d="M50 102 Q22 82 26 52 Q32 22 50 10 Q68 22 74 52 Q78 82 50 102 Z" fill="${LEAF}" ${ln(2)}/><path d="M50 114 L50 14 ${[90, 76, 62, 48, 34].map((y) => `M50 ${y} L${32 + (y - 34) / 8} ${y - 12} M50 ${y} L${68 - (y - 34) / 8} ${y - 12}`).join(' ')}" fill="none" stroke="${LEAF_D}" stroke-width="1.6"/>`,
    ahorn: `<path d="M50 102 L48 84 Q36 90 30 88 L22 92 L24 82 L12 78 L20 70 L8 58 L22 56 L20 44 L32 50 L34 36 L28 26 L40 30 L50 8 L60 30 L72 26 L66 36 L68 50 L80 44 L78 56 L92 58 L80 70 L88 78 L76 82 L78 92 L70 88 Q64 90 52 84 Z" fill="#E8A23A" ${ln(2)}/><path d="M50 114 L50 84 L50 12 M50 84 L12 60 M50 84 L88 60 M50 84 L18 84 M50 84 L82 84" fill="none" stroke="#B8562A" stroke-width="1.6"/>`,
    linde: `<path d="M50 92 Q30 104 18 86 Q8 62 30 42 Q44 30 50 10 Q56 30 70 42 Q92 62 82 86 Q70 104 50 92 Z" fill="${LEAF}" ${ln(2)}/><path d="M50 114 L50 92 L50 16 M50 80 L24 74 M50 80 L76 74 M50 62 L32 50 M50 62 L68 50" fill="none" stroke="${LEAF_D}" stroke-width="1.6"/>`,
    birke: `<path d="M50 96 L26 70 L32 66 L28 60 L36 54 L34 48 L42 40 L42 32 L50 10 L58 32 L58 40 L66 48 L64 54 L72 60 L68 66 L74 70 Z" fill="#A8DB7A" ${ln(2)}/><path d="M50 114 L50 16 M50 74 L32 66 M50 74 L68 66 M50 58 L38 50 M50 58 L62 50" fill="none" stroke="${LEAF_D}" stroke-width="1.6"/>`,
    kastanie: `<path d="M50 116 L50 70" ${ln(3)}/>${[[-84, 0.85], [-56, 1.1], [-28, 1.3], [0, 1.4], [28, 1.3], [56, 1.1], [84, 0.85]].map(([r, s]) => at(50, 70, r, s, `<path d="${leafletK}" fill="${LEAF}" ${ln(+(1.8 / s).toFixed(2))}/><path d="M0 -2 L0 -42" stroke="${LEAF_D}" stroke-width="${+(1.4 / s).toFixed(2)}"/>`)).join('')}`,
  };
  const twig = `<path d="M8 106 Q60 60 112 18" fill="none" ${ln(4)}/><path d="M8 106 Q60 60 112 18" fill="none" stroke="${BARK}" stroke-width="2"/>`;
  // points along the twig (a quadratic curve from 8|106 over 60|60 to 112|18)
  const along = (n, f) => Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n, u = 1 - t; return f(+(u * u * 8 + 2 * u * t * 60 + t * t * 112).toFixed(1), +(u * u * 106 + 2 * u * t * 60 + t * t * 18).toFixed(1), i); }).join('');
  const NEEDLES = {
    fichte: `${along(16, (x, y) => `<path d="M${x} ${y} l-6 -6 M${x} ${y} l6 -6 M${x} ${y} l-7 2 M${x} ${y} l3 7" stroke="#2E7A3A" stroke-width="2" stroke-linecap="round"/>`)}${twig}<path d="M74 52 L76 58" ${ln(2)}/><ellipse cx="76" cy="84" rx="9" ry="24" fill="#9A6B3E" ${ln(2)}/><path d="${[66, 74, 82, 90, 98].map((y) => `M68 ${y} q8 5 16 0`).join(' ')}" fill="none" stroke="#5E3C22" stroke-width="1.4"/>`,
    kiefer: `${along(8, (x, y, i) => `<path d="M${x} ${y} l${i % 2 ? -8 : -16} -22 M${x} ${y} l${i % 2 ? 16 : 8} -22" stroke="#4E8A6A" stroke-width="2" stroke-linecap="round"/>`)}${twig}<ellipse cx="34" cy="96" rx="9" ry="12" fill="#A08A6A" ${ln(2)}/><path d="M26 92 l8 6 l8 -6 M26 100 l8 6 l8 -6" fill="none" stroke="#6E5A40" stroke-width="1.4"/>`,
    laerche: `${twig}${along(5, (x, y) => `${Array.from({ length: 11 }, (_, k) => `<path d="M${x} ${y} L${pt(x, y, -Math.PI + k * Math.PI / 10, 13)}" stroke="#8FD16A" stroke-width="1.8" stroke-linecap="round"/>`).join('')}<circle cx="${x}" cy="${y}" r="2" fill="${BARK}"/>`)}<ellipse cx="96" cy="20" rx="6" ry="8" fill="#B08A5A" ${ln(1.8)}/><ellipse cx="50" cy="56" rx="6" ry="8" fill="#B08A5A" ${ln(1.8)}/>`,
  };
  const FRUITS = {
    eiche: `<path d="M50 10 L52 30" ${ln(3)}/><ellipse cx="50" cy="64" rx="16" ry="24" fill="#B98A4A" ${ln(2)}/><path d="M32 52 Q32 30 50 30 Q68 30 68 52 Z" fill="#8A6A3F" ${ln(2)}/><path d="M38 42 h3 M46 38 h3 M54 42 h3 M42 48 h3 M52 48 h3 M60 46 h2" stroke="#5E4426" stroke-width="2" stroke-linecap="round"/><ellipse cx="44" cy="68" rx="3" ry="8" fill="#fff" opacity=".5"/>`,
    buche: `${[0, 90, 180, 270].map((r) => at(50, 60, r + 45, 1, `<path d="M0 0 Q-10 -18 0 -34 Q10 -18 0 0 Z" fill="#9A6B3E" ${ln(1.8)}/><path d="M-5 -14 l-4 -2 M5 -14 l4 -2 M-4 -24 l-4 -2 M4 -24 l4 -2" stroke="#5E3C22" stroke-width="1.4"/>`)).join('')}<path d="M42 66 L48 40 L54 66 Z M50 66 L56 42 L62 66 Z" fill="#6B3E22" ${ln(1.8)}/>`,
    ahorn: `<path d="M50 60 Q30 66 14 40 Q30 34 46 54 Z M50 60 Q70 66 86 40 Q70 34 54 54 Z" fill="#C9D97A" ${ln(2)}/><path d="M22 44 Q34 50 44 56 M78 44 Q66 50 56 56" fill="none" stroke="#8A9A3A" stroke-width="1.4"/><circle cx="44" cy="60" r="7" fill="#A8B84A" ${ln(2)}/><circle cx="56" cy="60" r="7" fill="#A8B84A" ${ln(2)}/><path d="M50 56 L50 36" ${ln(2)}/>`,
    kastanie: `<path d="M20 70 Q18 40 44 34 L46 72 Q34 82 20 70 Z" fill="#8BCB4F" ${ln(2)}/><path d="M22 52 l-6 -3 M26 42 l-5 -5 M34 36 l-2 -6 M22 62 l-6 0" stroke="${OUT}" stroke-width="1.6" stroke-linecap="round"/><circle cx="62" cy="62" r="22" fill="#7A3E1E" ${ln(2)}/><ellipse cx="62" cy="76" rx="12" ry="6" fill="#D9B98E"/><ellipse cx="54" cy="52" rx="6" ry="3" fill="#fff" opacity=".6" transform="rotate(-30 54 52)"/>`,
  };
  const LAUB = [{ id: 'eiche', name: 'Eiche' }, { id: 'buche', name: 'Buche' }, { id: 'ahorn', name: 'Ahorn' }, { id: 'linde', name: 'Linde' }, { id: 'birke', name: 'Birke' }, { id: 'kastanie', name: 'Kastanie' }];
  const NADEL = [{ id: 'fichte', name: 'Fichte' }, { id: 'kiefer', name: 'Kiefer' }, { id: 'laerche', name: 'Lärche' }];
  const treeSVG = (id) => pic('0 0 120 120', LEAVES[id] ? `<g transform="translate(10 4)">${LEAVES[id]}</g>` : NEEDLES[id], LEAVES[id] ? 'Blatt eines Baumes' : 'Zweig eines Nadelbaumes', 150);
  const fruitSVG = (id) => pic('0 0 100 100', FRUITS[id], 'Frucht eines Baumes', 140);

  const stalk = (d) => `<path d="${d}" fill="none" ${ln(5)}/><path d="${d}" fill="none" stroke="#6DB24A" stroke-width="2.6" stroke-linecap="round"/>`;
  const blade = (x, h, l, w) => `<path d="M${x - w} 120 Q${x + l * 0.3} ${120 - h * 0.6} ${x + l} ${120 - h} Q${x + w + l * 0.3} ${120 - h * 0.6} ${x + w} 120 Z" fill="${LEAF}" ${ln(1.6)}/>`;
  const FLOWERS = {
    schneegloeckchen: `${blade(44, 60, -6, 3)}${blade(56, 64, 8, 3)}${stalk('M50 120 Q52 60 62 40 Q68 32 72 42')}<path d="M72 42 Q60 52 64 70 Q70 74 72 60 Z M72 42 Q84 52 80 70 Q74 74 72 60 Z" fill="#fff" ${ln(1.8)}/><path d="M72 42 Q66 56 72 68 Q78 56 72 42 Z" fill="#fff" ${ln(1.6)}/><path d="M69 64 q3 3 6 0" fill="none" stroke="${LEAF_D}" stroke-width="2"/>`,
    krokus: `${blade(40, 50, -8, 2.5)}${blade(50, 56, 2, 2.5)}${blade(62, 52, 10, 2.5)}<path d="M38 80 L42 108 M52 72 L51 110 M70 82 L66 108" stroke="#fff" stroke-width="1" opacity=".8"/>${stalk('M52 120 L52 74')}<path d="M52 76 Q34 64 38 36 Q46 32 52 44 Q58 32 66 36 Q70 64 52 76 Z" fill="#A77BD8" ${ln(2)}/><path d="M52 76 Q46 56 52 30 Q58 56 52 76 Z" fill="#C9A6E8" ${ln(1.6)}/><path d="M52 52 L50 40 M52 52 L54 40" stroke="#F28C28" stroke-width="2.4" stroke-linecap="round"/>`,
    tulpe: `<path d="M50 120 Q26 96 30 60 Q44 82 50 104 Z" fill="${LEAF}" ${ln(1.8)}/><path d="M52 120 Q78 100 74 70 Q60 88 52 106 Z" fill="${LEAF}" ${ln(1.8)}/>${stalk('M50 120 L50 54')}<path d="M50 58 Q30 56 32 30 Q34 18 40 24 Q44 14 50 22 Q56 14 60 24 Q66 18 68 30 Q70 56 50 58 Z" fill="#E8344A" ${ln(2)}/><path d="M50 58 Q42 40 50 22 Q58 40 50 58 Z" fill="#F25A6A" ${ln(1.4)}/>`,
    osterglocke: `${blade(42, 80, -6, 3)}${blade(60, 74, 10, 3)}${stalk('M50 120 Q50 70 54 54')}${Array.from({ length: 6 }, (_, k) => at(54, 40, k * 60, 1, `<path d="M0 0 Q-8 -10 0 -22 Q8 -10 0 0 Z" fill="#FFF09A" ${ln(1.6)}/>`)).join('')}<circle cx="54" cy="40" r="10" fill="#F5B800" ${ln(2)}/><circle cx="54" cy="40" r="6" fill="#E89A00" ${ln(1.2)}/>`,
  };
  const SPRING = [{ id: 'schneegloeckchen', name: 'Schneeglöckchen' }, { id: 'krokus', name: 'Krokus' }, { id: 'tulpe', name: 'Tulpe' }, { id: 'osterglocke', name: 'Osterglocke' }];
  const flowerSVG = (id) => pic('0 0 100 130', `${FLOWERS[id]}${SOIL(120, 100)}`, 'Bild einer Frühlingsblume', 150);

  // Obstarten: k = Kernobst, s = Steinobst, b = Beerenobst
  const OBST = [['Apfel', 'k'], ['Birne', 'k'], ['Quitte', 'k'], ['Kirsche', 's'], ['Pflaume', 's'], ['Pfirsich', 's'], ['Aprikose', 's'], ['Erdbeere', 'b'], ['Johannisbeere', 'b'], ['Stachelbeere', 'b'], ['Himbeere', 'b'], ['Heidelbeere', 'b']];
  const OBST_ART = { k: 'Kernobst', s: 'Steinobst', b: 'Beerenobst' };
  const art = (name) => (['Apfel', 'Pfirsich'].includes(name) ? 'der' : 'die');
  const KEIM = ['Samen in feuchte Erde', 'Der Samen quillt auf', 'Eine Wurzel wächst', 'Der Keimling wächst', 'Erste grüne Blätter', 'Die Pflanze blüht', 'Früchte mit neuen Samen'].map((text, i) => ({ id: 'k' + i, text }));
  const BLUETE = ['Der Baum blüht', 'Bienen besuchen die Blüten', 'Die Blütenblätter fallen ab', 'Die Frucht wächst', 'Die Frucht ist reif'].map((text, i) => ({ id: 'b' + i, text }));
  const SAEN = ['Erde lockern', 'Eine Rille ziehen', 'Samen hineinlegen', 'Mit Erde bedecken', 'Gießen'].map((text, i) => ({ id: 's' + i, text }));
  const BA_NOTES = {
    laub: { title: 'Laubbäume', lines: ['Eiche: Blatt mit runden Buchten. Frucht: die Eichel mit Hütchen.', 'Buche: glattes, ovales Blatt. Frucht: Bucheckern in einer stacheligen Hülle.', 'Ahorn: Blatt mit fünf spitzen Lappen. Frucht: Flügelfrüchte, die sich drehen.', 'Linde: herzförmiges Blatt. Aus den Blüten macht man Tee.', 'Birke: kleines, spitzes Blatt mit gezacktem Rand. Weiße Rinde mit schwarzen Streifen.', 'Kastanie: Blatt aus fünf bis sieben Blättchen. Die Frucht steckt in einer grünen, stacheligen Hülle.', 'Laubbäume verlieren im Herbst ihre Blätter.'] },
    nadel: { title: 'Nadelbäume', lines: ['Nadeln sind besondere Blätter. Die meisten Nadelbäume bleiben im Winter grün.', 'Fichte: kurze, spitze Nadeln, einzeln rund um den Zweig. Die Zapfen hängen nach unten.', 'Kiefer: lange Nadeln, immer zu zweit.', 'Lärche: weiche Nadeln in Büscheln. Im Herbst werden sie gelb und fallen ab.', 'In den Zapfen stecken die Samen.'] },
    baumteile: { title: 'Die Teile des Baumes', lines: TREE_PARTS.map((p) => `${p.name}: ${p.desc}`).concat(['Am gefällten Baum zählst du die Jahresringe. Jeder Ring ist ein Jahr.']) },
    pflanzenteile: { title: 'Die Teile der Pflanze', lines: BEAN_PARTS.map((p) => `${p.name}: ${p.desc}`) },
    frueh: { title: 'Frühblüher', lines: ['Frühblüher blühen am Ende des Winters, wenn im Wald noch viel Licht auf den Boden fällt.', 'Ihre Nahrung haben sie in einer Zwiebel oder Knolle gespeichert.', 'Schneeglöckchen: weiße, hängende Blüte, blüht oft im Schnee. Der Märzenbecher sieht ähnlich aus.', 'Krokus: lila, weiße oder gelbe Blüte, schmale Blätter mit weißem Streifen. Er wächst aus einer Knolle.', 'Tulpe: große Blüte in vielen Farben, wächst aus einer Zwiebel.', 'Osterglocke (Narzisse): gelbe Blüte mit langer Röhre in der Mitte.', 'Viele Frühblüher sind giftig. Im Wald gräbst du sie nicht aus.'] },
    keim: { title: 'Vom Samen zur Pflanze', lines: KEIM.map((k, i) => `${i + 1}. ${k.text}.`).concat(['Zum Keimen braucht ein Samen Wasser, Wärme und Luft.', 'Zum Wachsen braucht die Pflanze dann auch Licht.']) },
    obst: { title: 'Obst', lines: ['Kernobst hat ein Kerngehäuse mit Kernen: Apfel, Birne, Quitte.', 'Steinobst hat einen harten Stein in der Mitte: Kirsche, Pflaume, Pfirsich, Aprikose.', 'Beerenobst ist klein und weich: Erdbeere, Johannisbeere, Stachelbeere, Himbeere, Heidelbeere.', 'Aus der Blüte wird die Frucht. Bienen bringen den Blütenstaub von Blüte zu Blüte.', 'Aus Obst macht man Saft, Marmelade und Kompott.'] },
    garten: { title: 'Im Garten', lines: SAEN.map((s, i) => `${i + 1}. ${s.text}.`).concat(['Gießkanne: zum Gießen. Spaten und Schaufel: zum Graben. Harke: zum Glätten.', 'Wildkräuter zupfst du, damit das Gemüse Platz und Wasser hat.', 'Im Sommer gießt du morgens oder abends.', 'Geräte legst du mit den Zinken nach unten hin.']) },
  };
  const BA_POOL = partPool('baum12', 'parts', 'baumteile', 'sk2b_bt_').concat(partPool('bohne12', 'parts', 'pflanzenteile', 'sk2b_pt_'),
    P('sk2b_lb', 'baum', 'laub', [
      ['Welcher Baum hat Eicheln?', ['Eiche', 'Buche', 'Birke']],
      ['Welcher Baum hat eine weiße Rinde mit schwarzen Streifen?', ['Birke', 'Eiche', 'Fichte']],
      ['Welcher Baum hat herzförmige Blätter?', ['Linde', 'Kastanie', 'Kiefer']],
      ['Welcher Baum hat Früchte mit Flügeln, die sich drehen?', ['Ahorn', 'Eiche', 'Kastanie']],
      ['Wie heißen die Früchte der Buche?', ['Bucheckern', 'Eicheln', 'Zapfen']],
      ['Welches Blatt besteht aus fünf bis sieben Blättchen?', ['Kastanie', 'Buche', 'Eiche']],
      ['Welcher Baum hat Blätter mit runden Buchten?', ['Eiche', 'Birke', 'Linde']],
      ['Laubbäume verlieren im Herbst ihre Blätter.', true],
      ['Kastanien vom Kastanienbaum im Park kann man essen.', false, 'Das sind Rosskastanien. Sie sind leicht giftig. Essen kann man nur Esskastanien, die Maronen.'],
      ['Aus den Blüten welches Baumes macht man Tee?', ['Linde', 'Fichte', 'Eiche']],
      ['Woran erkennst du das Alter eines gefällten Baumes?', ['An den Jahresringen', 'An der Farbe', 'An den Blättern']],
      ['Ein Baumstumpf hat 20 Jahresringe. Wie alt war der Baum?', ['20 Jahre', '2 Jahre', '200 Jahre']],
    ]),
    P('sk2b_nd', 'baum', 'nadel', [
      ['Was trägt ein Nadelbaum statt Laubblättern?', ['Nadeln', 'Blüten', 'Stacheln']],
      ['Welcher Nadelbaum verliert im Herbst seine Nadeln?', ['Lärche', 'Fichte', 'Kiefer']],
      ['Welcher Nadelbaum hat lange Nadeln, immer zu zweit?', ['Kiefer', 'Fichte', 'Lärche']],
      ['Welcher Baum hat kurze, spitze Nadeln einzeln am Zweig?', ['Fichte', 'Kiefer', 'Lärche']],
      ['Was steckt im Zapfen?', ['Die Samen', 'Wasser', 'Honig']],
      ['Die meisten Nadelbäume bleiben im Winter grün.', true],
    ]),
    P('sk2b_fb', 'frueh', 'frueh', [
      ['Welche Blume blüht oft schon im Schnee?', ['Schneeglöckchen', 'Tulpe', 'Sonnenblume']],
      ['Welche Frühlingsblume heißt auch Narzisse?', ['Osterglocke', 'Krokus', 'Tulpe']],
      ['Woraus wächst eine Tulpe?', ['Aus einer Zwiebel', 'Aus einem Ei', 'Aus einem Zapfen']],
      ['Woraus wächst ein Krokus?', ['Aus einer Knolle', 'Aus einem Kern', 'Aus einem Zapfen']],
      ['Wo speichert ein Frühblüher seine Nahrung?', ['In Zwiebel oder Knolle', 'In der Blüte', 'Im Schnee']],
      ['Warum blühen Frühblüher im Wald so früh?', ['Viel Licht am Boden', 'Es ist schön warm', 'Die Bienen schlafen']],
      ['Frühblüher im Wald darfst du nicht ausgraben.', true],
      ['Welche Farbe hat die Blüte vom Schneeglöckchen?', ['Weiß', 'Rot', 'Blau']],
      ['Was hat die Osterglocke in der Mitte der Blüte?', ['Eine lange Röhre', 'Einen Zapfen', 'Eine Beere']],
      ['Frühblüher blühen im Hochsommer.', false, 'Frühblüher blühen am Ende des Winters und im Frühling.'],
      ['Welche Blume sieht dem Schneeglöckchen ähnlich?', ['Märzenbecher', 'Tulpe', 'Löwenzahn']],
      ['Schneeglöckchen und Osterglocken sind giftig.', true],
      ['Wie sind die Blätter vom Krokus?', ['Schmal mit weißem Streifen', 'Rund und groß', 'Stachelig']],
    ]),
    P('sk2b_ke', 'keim', 'keim', [
      ['Was braucht ein Samen zum Keimen?', ['Wasser, Wärme und Luft', 'Nur Zucker', 'Kälte und Eis']],
      ['Eine Bohne keimt auch ohne Wasser.', false, 'Ohne Wasser quillt der Samen nicht auf und keimt nicht.'],
      ['Was wächst beim Keimen zuerst aus dem Samen?', ['Die Wurzel', 'Die Blüte', 'Die Frucht']],
      ['Wie heißt die junge Pflanze aus dem Samen?', ['Keimling', 'Zapfen', 'Knolle']],
      ['Was macht der Samen, wenn er Wasser aufnimmt?', ['Er quillt auf', 'Er schrumpft', 'Er schmilzt']],
      ['Pflanzen brauchen zum Wachsen Licht.', true],
      ['Wohin wächst die Wurzel?', ['Nach unten', 'Nach oben', 'Zum Licht']],
      ['Wohin wächst der Stängel?', ['Nach oben zum Licht', 'Nach unten', 'In den Samen']],
      ['Wozu hat eine Pflanze Wurzeln?', ['Halt und Wasser', 'Zum Blühen', 'Zum Fliegen']],
      ['Was wird aus der Blüte?', ['Die Frucht', 'Die Wurzel', 'Der Stängel']],
      ['Wo stecken die Samen einer Bohne?', ['In der Hülse', 'In der Wurzel', 'Im Blatt']],
      ['Eine Pflanze im dunklen Schrank wird lang, dünn und blass.', true],
      ['Ein Samen liegt im Eisfach. Was passiert?', ['Er keimt nicht', 'Er keimt schnell', 'Er blüht']],
    ]),
    P('sk2b_ob', 'obst', 'obst', [
      ['Was hat eine Kirsche in der Mitte?', ['Einen harten Stein', 'Viele kleine Kerne', 'Nichts']],
      ['Was findest du im Kerngehäuse vom Apfel?', ['Kerne', 'Einen Stein', 'Saft']],
      ['Erdbeeren wachsen an hohen Bäumen.', false, 'Erdbeeren wachsen an kleinen Pflanzen dicht am Boden.'],
      ['Was kann man aus Obst machen?', ['Marmelade und Saft', 'Brot', 'Käse']],
      ['Wann blühen die Obstbäume?', ['Im Frühling', 'Im Winter', 'Im Herbst']],
      ['Wer bringt den Blütenstaub von Blüte zu Blüte?', ['Bienen und Hummeln', 'Regenwürmer', 'Schnecken']],
      ['Ohne Bienen gäbe es viel weniger Äpfel.', true],
      ['Was wird aus der Apfelblüte?', ['Ein Apfel', 'Eine Kirsche', 'Ein Blatt']],
      ['Welches Obst wächst bei uns in Sachsen?', ['Apfel', 'Banane', 'Ananas']],
      ['Woher kommt die Banane?', ['Aus warmen Ländern', 'Aus dem Schulgarten', 'Aus Sachsen']],
      ['Pflaumen und Kirschen sind Steinobst.', true],
      ['Wie bleibt Obst lange haltbar?', ['Als Marmelade eingekocht', 'Draußen im Regen', 'Mit Seife gewaschen']],
    ]),
    P('sk2b_ga', 'garten', 'garten', [
      ['Womit gießt du die Pflanzen?', ['Mit der Gießkanne', 'Mit dem Spaten', 'Mit der Harke']],
      ['Womit gräbst du ein Loch für eine Pflanze?', ['Mit der Schaufel', 'Mit der Gießkanne', 'Mit der Harke']],
      ['Warum zupft man Wildkräuter im Beet?', ['Damit Gemüse Platz hat', 'Weil sie stinken', 'Damit es regnet']],
      ['Eine Harke legst du mit den Zinken nach unten hin.', true],
      ['Wann gießt du im Sommer am besten?', ['Morgens oder abends', 'In der Mittagshitze', 'Nie']],
      ['Was steckst du in die Erde, damit Zwiebeln wachsen?', ['Steckzwiebeln', 'Eier', 'Steine']],
      ['Nach der Gartenarbeit wäschst du dir die Hände.', true],
      ['Was braucht ein Beet, wenn es lange nicht regnet?', ['Wasser', 'Schnee', 'Sand']],
      ['Was machen Regenwürmer im Beet?', ['Sie lockern die Erde', 'Sie fressen Gemüse', 'Sie gießen']],
      ['Welche Samen legst du gut einzeln in die Erde?', ['Bohnen und Erbsen', 'Mehl', 'Puderzucker']],
      ['Wann erntet man Kartoffeln?', ['Im Herbst', 'Im Winter', 'Im Frühling']],
    ]));
  const BA_TUT = {
    'baum:1': { title: 'Laub- und Nadelbäume', steps: ['Schau dir das Blatt oder den Zweig im Bild genau an.', 'Beispiel: Ein Blatt mit runden Buchten ist von der Eiche. Lange Nadeln zu zweit hat die Kiefer.', 'Tippe auf den richtigen Baum.'] },
    'baum:2': { title: 'Früchte der Bäume', steps: ['Jetzt siehst du eine Frucht.', 'Beispiel: Die Eichel mit dem Hütchen ist von der Eiche.', 'Tippe auf den Baum, zu dem die Frucht gehört.'] },
    'parts:1': { title: 'Teile benennen', steps: ['Ein Teil vom Baum oder von der Bohnenpflanze leuchtet gelb.', 'Baum: Wurzeln, Stamm, Ast, Zweig, Krone, Blatt. Pflanze: Wurzel, Stängel, Blatt, Blüte, Frucht, Samen.', 'Tippe auf den richtigen Namen.'] },
    'parts:2': { title: 'Teile finden', steps: ['Jetzt andersherum: Oben steht ein Name.', 'Tippe direkt auf diesen Teil im Bild.', 'Was im Kreis stark vergrößert ist, ist das Blatt oder die Samen.'] },
    'frueh:1': { title: 'Frühblüher', steps: ['Frühblüher blühen schon am Ende des Winters.', 'Beispiel: Die weiße, hängende Blüte ist das Schneeglöckchen.', 'Tippe auf den richtigen Namen.'] },
    'keim:1': { title: 'Vom Samen zur Pflanze', steps: ['Fragen dazu, wie aus einem Samen eine Pflanze wird.', 'Beispiel: Zum Keimen braucht der Samen Wasser, Wärme und Luft.', 'Tippe auf die richtige Antwort.'] },
    'keimord:1': { title: 'Der Reihe nach', steps: ['Die Schritte sind durcheinander.', 'Es beginnt mit dem Samen in der Erde.', 'Zuletzt kommen Blüten und Früchte mit neuen Samen.'] },
    'obst:1': { title: 'Obst', steps: ['Kernobst hat Kerne, Steinobst einen harten Stein, Beerenobst ist klein und weich.', 'Beispiel: Die Kirsche hat einen Stein, sie ist Steinobst.', 'Tippe auf die richtige Antwort.'] },
    'obstord:1': { title: 'Von der Blüte zur Frucht', steps: ['Die Schritte sind durcheinander.', 'Zuerst blüht der Baum.', 'Zuletzt ist die Frucht reif.'] },
    'garten:1': { title: 'Im Garten', steps: ['Fragen zu Gartengeräten und zur Arbeit im Beet.', 'Beispiel: Mit der Gießkanne gießt du die Pflanzen.', 'Tippe auf die richtige Antwort.'] },
    'gartenord:1': { title: 'Säen', steps: ['Die Schritte sind durcheinander.', 'Zuerst lockerst du die Erde.', 'Zuletzt gießt du.'] },
  };
  function baGen(cfg) {
    return (m, tier, know, seq, opts) => {
      if (m === 'parts') return plantTask(cfg, 'baum12', m, tier, know, seq, opts);
      if (wantsPool(cfg, m, opts)) return null;
      const r = Math.random();
      if (m === 'baum') {
        if (tier >= 2 && r < 0.5) { const t = pick(LAUB.filter((x) => FRUITS[x.id])); return choice(m, 'laub', 'Von welchem Baum ist diese Frucht?', t.name, others(LAUB, t).map((x) => x.name), 'sk2b_fr_' + t.id, { pic: fruitSVG(t.id), group: 'baum:2', tier: 2 }); }
        if (r < 0.4) { const t = pick(LAUB); return choice(m, 'laub', 'Von welchem Baum ist dieses Blatt?', t.name, others(LAUB, t).map((x) => x.name), 'sk2b_bl_' + t.id, { pic: treeSVG(t.id) }); }
        if (r < 0.55) { const t = pick(NADEL); return choice(m, 'nadel', 'Welcher Nadelbaum ist das?', t.name, others(NADEL, t).map((x) => x.name), 'sk2b_nz_' + t.id, { pic: treeSVG(t.id) }); }
        if (r < 0.7) { const t = pick(LAUB.concat(NADEL)), n = NADEL.includes(t); return choice(m, n ? 'nadel' : 'laub', 'Laubbaum oder Nadelbaum?', n ? 'Nadelbaum' : 'Laubbaum', [n ? 'Laubbaum' : 'Nadelbaum'], 'sk2b_ln_' + t.id, { pic: treeSVG(t.id), cols: 2 }); }
        return null;
      }
      if (m === 'frueh' && r < 0.5) { const f = pick(SPRING); return choice(m, 'frueh', 'Wie heißt dieser Frühblüher?', f.name, others(SPRING, f).map((x) => x.name), 'sk2b_fb_' + f.id, { pic: flowerSVG(f.id) }); }
      if (m === 'keim' && r < 0.35) return orderTask(m, 'keimord:1', 'keim', 'Wie wächst eine Bohne? Tippe der Reihe nach an.', KEIM, 'sk2b_ok_');
      if (m === 'obst') {
        if (r < 0.4) { const [name, k] = pick(OBST); return choice(m, 'obst', `Zu welchem Obst gehört ${art(name)} ${name}?`, OBST_ART[k], Object.values(OBST_ART).filter((x) => x !== OBST_ART[k]), 'sk2b_oa_' + name); }
        if (r < 0.55) return orderTask(m, 'obstord:1', 'obst', 'Von der Blüte zur Frucht: Tippe der Reihe nach an.', BLUETE, 'sk2b_ob_');
      }
      if (m === 'garten' && r < 0.3) return orderTask(m, 'gartenord:1', 'garten', 'So säst du Bohnen. Tippe der Reihe nach an.', SAEN, 'sk2b_os_');
      return null;
    };
  }
  const BA = unit({ grade: 2, title: 'Bäume und Blumen', icon: '🌳', sub: 'Laub- und Nadelbäume, Teile von Baum und Pflanze, Frühblüher, Keimung, Obst und Garten', school: ['baum12', 'bohne12'],
    modules: { baum: mod('Laub- und Nadelbäume', '🌳', 'Eichelhagel', 12, 2), parts: mod('Teile benennen', '🌿', 'Jahresring', 12, 2), frueh: mod('Frühblüher', '🌼', 'Krokusknolle', 12),
      keim: mod('Vom Samen zur Pflanze', '🌱', 'Bohnenkeim', 14), obst: mod('Obst', '🫐', 'Kirschkern', 12), garten: mod('Im Garten', '🪣', 'Gießkanne', 10) },
    attacks: [{ name: 'Eichelhagel', mod: 'baum' }, { name: 'Jahresring', mod: 'parts' }, { name: 'Krokusknolle', mod: 'frueh' }, { name: 'Bohnenkeim', mod: 'keim' }],
    tut: BA_TUT, notes: BA_NOTES, pool: BA_POOL,
    events: [
      ask('Der Waldlehrpfad', 'Am Waldlehrpfad stehen Schilder an den Bäumen. Die Försterin fragt dich nach einem Baum und schenkt dir einen Trank.', 'baum', 'laub', { item: 'trank' }, { hp: -6 }),
      ask('Der Schulgarten', 'Im Schulgarten gießt der Hausmeister die Beete. Er gibt dir einen Schild, wenn du seine Frage beantwortest.', 'garten', 'garten', { item: 'schild' }),
      ask('Die Obstwiese', 'Auf der Obstwiese pflückt eine Bäuerin Pflaumen. Sie gibt dir eine Chilischote für eine richtige Antwort.', 'obst', 'obst', { item: 'keks' }, { xp: 5 }),
      ask('Das Keimglas', 'Auf der Fensterbank steht ein Glas mit keimenden Bohnen. Die Lehrerin kennt eine Eselsbrücke und verrät sie dir.', 'keim', 'keim', { item: 'lupe' }, { xp: 5 }),
      ask('Der Stadtpark', 'Im Stadtpark blühen die ersten Krokusse. Ein Gärtner fragt dich nach den Frühblühern.', 'frueh', 'frueh', { xp: 20 }, { xp: 5 }),
      rest('Der Baumstumpf', 'Am Waldrand steht ein breiter Baumstumpf. Du zählst die Jahresringe und ruhst dich aus.'),
      dil('Der Blumenstrauß', 'Im Park blühen viele Tulpen. Deine Schwester will für Mama einen Strauß pflücken.', [
        ['Wir malen Mama ein Tulpenbild.', 'Mama hängt das Bild an den Kühlschrank. Die Tulpen im Park blühen weiter.', 'Welche Geschenke kann man selbst machen?'],
        ['Wir fragen den Gärtner.', 'Der Gärtner erklärt: Die Tulpen sind für alle da. Er schenkt euch eine Tulpenzwiebel für den Balkon.', 'Warum gehören Blumen im Park allen?'],
        ['Wir pflücken eine Tulpe.', 'Die Tulpe welkt schnell. Im Beet fehlt jetzt eine Blüte.', 'Was ist schöner: eine Blume im Beet oder in der Vase?']]),
    ] });
  BA.gen = baGen(BA);

  /* ================= TIERE BEI UNS (Klasse 2, LB 3) ================= */
  // Singvögel aus einer Form, gefärbt nach dem Gefieder; Storch und Schwalbe haben eigene Umrisse
  const SONG = {
    amsel: { body: '#2A2A2E', belly: '#2A2A2E', head: '#2A2A2E', wing: '#1E1E22', tail: '#1E1E22', beak: '#F2A20C', ring: '#F2A20C' },
    meise: { body: '#8AA04A', belly: '#F5D33B', head: '#1C1C22', cheek: '#FFFFFF', wing: '#6C8CA8', tail: '#6C8CA8', beak: '#333', stripe: true },
    spatz: { body: '#9A6B3E', belly: '#CFC5B5', head: '#8E8E8E', cheek: '#E8E2D6', bib: true, wing: '#7A5230', tail: '#7A5230', beak: '#555', bar: true },
    rotkehlchen: { body: '#8B7A55', belly: '#F1EAD8', head: '#8B7A55', breast: '#E8742C', wing: '#75653F', tail: '#75653F', beak: '#333' },
    schwalbe: { body: '#1F2E6B', belly: '#F3E6D0', head: '#1F2E6B', throat: '#B8322A', wing: '#16214D', tail: '#16214D', beak: '#222', fork: true },
  };
  function birdSVG(id) {
    const ground = `<path d="M4 88 Q60 82 116 90" fill="none" ${ln(7)}/><path d="M4 88 Q60 82 116 90" fill="none" stroke="${BARK}" stroke-width="4"/>`;
    if (id === 'storch') return pic('0 0 120 120', `<path d="M0 116 H120" ${ln(2)}/><path d="M52 70 L50 114 M62 70 L66 114" fill="none" ${ln(5)}/><path d="M52 70 L50 114 M62 70 L66 114" fill="none" stroke="#E8344A" stroke-width="2.6"/><ellipse cx="56" cy="58" rx="28" ry="16" fill="#fff" ${ln(2)}/><path d="M28 56 Q44 74 74 66 Q60 78 36 74 Q24 68 28 56 Z" fill="${OUT}"/>${twin('M74 52 Q86 40 82 24', '#fff', 7)}<circle cx="84" cy="22" r="8" fill="#fff" ${ln(2)}/><path d="M90 19 L116 29 L90 25 Z" fill="#E8344A" ${ln(1.6)}/><circle cx="86" cy="20" r="1.8" fill="${OUT}"/>`, 'Bild eines Vogels', 150);
    const o = SONG[id];
    const tail = o.fork ? `<path d="M40 60 L2 64 L22 68 L4 80 L44 68 Z" fill="${o.tail}" ${ln(2)}/>` : `<path d="M38 62 L10 76 L16 84 L44 68 Z" fill="${o.tail}" ${ln(2)}/>`;
    const wing = o.fork ? `<path d="M44 50 Q72 44 78 54 L20 70 Z" fill="${o.wing}" ${ln(2)}/>` : `<path d="M40 52 Q58 44 72 56 Q58 72 40 64 Z" fill="${o.wing}" ${ln(2)}/>${o.bar ? '<path d="M48 58 Q58 54 66 58" fill="none" stroke="#fff" stroke-width="2.4"/>' : ''}`;
    return pic('0 0 120 100', `${ground}<path d="M56 74 L54 86 M64 74 L64 86" fill="none" ${ln(2.4)}/>${tail}<ellipse cx="58" cy="58" rx="26" ry="18" fill="${o.body}" ${ln(2)} transform="rotate(-20 58 58)"/><ellipse cx="66" cy="66" rx="16" ry="10" fill="${o.belly}" transform="rotate(-20 66 66)"/>${o.breast ? `<ellipse cx="76" cy="54" rx="12" ry="14" fill="${o.breast}"/>` : ''}${o.stripe ? `<path d="M78 50 L68 76" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>` : ''}${wing}<circle cx="80" cy="38" r="14" fill="${o.head}" ${ln(2)}/>${o.breast ? `<path d="M74 50 Q74 36 86 34 Q94 40 90 50 Z" fill="${o.breast}"/>` : ''}${o.cheek ? `<ellipse cx="82" cy="42" rx="7" ry="5" fill="${o.cheek}"/>` : ''}${o.bib ? `<ellipse cx="86" cy="51" rx="5" ry="5" fill="${OUT}"/>` : ''}${o.throat ? `<ellipse cx="88" cy="46" rx="6" ry="5" fill="${o.throat}"/>` : ''}<path d="M93 36 L103 39 L93 42 Z" fill="${o.beak}" ${ln(1.4)}/>${o.ring ? `<circle cx="85" cy="35" r="4" fill="${o.ring}"/>` : ''}<circle cx="85" cy="35" r="2.4" fill="${o.ring ? OUT : '#fff'}"/>${o.ring ? '' : `<circle cx="85" cy="35" r="1.4" fill="${OUT}"/>`}`, 'Bild eines Vogels', 150);
  }
  const BIRDS = [{ id: 'amsel', name: 'Amsel' }, { id: 'meise', name: 'Kohlmeise' }, { id: 'spatz', name: 'Spatz' }, { id: 'rotkehlchen', name: 'Rotkehlchen' }, { id: 'storch', name: 'Storch' }, { id: 'schwalbe', name: 'Schwalbe' }];
  // has: Vögel mit diesem Merkmal; skip: ähnlich genug, um als falsche Antwort zu verwirren
  const BIRD_TRAITS = [
    { q: 'Welcher Vogel hat eine orange-rote Brust?', has: ['rotkehlchen'] },
    { q: 'Welcher Vogel hat einen gelben Bauch und weiße Wangen?', has: ['meise'] },
    { q: 'Welcher Vogel ist schwarz und hat einen gelben Schnabel?', has: ['amsel'] },
    { q: 'Welcher Vogel hat lange rote Beine und einen roten Schnabel?', has: ['storch'] },
    { q: 'Welcher Vogel hat einen Schwanz mit zwei langen Spitzen?', has: ['schwalbe'] },
    { q: 'Welcher Vogel baut sein Nest auf Dächern und Masten?', has: ['storch'] },
    { q: 'Welcher Vogel klebt sein Nest aus Lehm in den Stall?', has: ['schwalbe'] },
    { q: 'Welcher Vogel brütet gern im Nistkasten?', has: ['meise'], skip: ['spatz'] },
    { q: 'Welcher Vogel fliegt im Herbst nach Afrika?', has: ['storch', 'schwalbe'] },
    { q: 'Welcher kleine braune Vogel badet gern im Staub?', has: ['spatz'], skip: ['amsel'] },
  ];
  const SMALL = {
    igel: `<path d="M8 80 H112" ${ln(2)}/>${Array.from({ length: 17 }, (_, k) => { const a = Math.PI + 0.15 + k * (Math.PI - 0.6) / 16; return `<path d="M${pt(56, 76, a, 28)} L${pt(56, 76, a + 0.08, 42)} L${pt(56, 76, a + 0.2, 28)}" fill="#5A3E26" ${ln(1.4)}/>`; }).join('')}<path d="M18 78 Q18 40 56 38 Q86 40 92 62 L92 78 Z" fill="#6B4A2E" ${ln(2)}/><path d="M86 52 Q106 60 112 68 Q104 76 86 76 Z" fill="#D9B98E" ${ln(2)}/><circle cx="112" cy="68" r="3.4" fill="${OUT}"/><circle cx="98" cy="60" r="2.2" fill="${OUT}"/><path d="M40 78 v4 M80 78 v4" ${ln(3)}/>`,
    regenwurm: `<rect x="0" y="62" width="120" height="28" fill="#B88A5E"/><path d="M0 62 H120" ${ln(2)}/>${twin('M10 70 Q26 40 46 56 Q66 74 84 50 Q96 36 110 46', '#E8909A', 10)}<path d="M10 70 Q26 40 46 56 Q66 74 84 50 Q96 36 110 46" fill="none" stroke="#C26A78" stroke-width="10" stroke-dasharray="1.2 5"/><circle cx="108" cy="45" r="1.6" fill="${OUT}" opacity=".5"/>`,
    schnecke: `<path d="M4 80 H116" ${ln(2)}/><path d="M104 52 L98 30 M110 52 L116 30" fill="none" ${ln(2.4)}/><circle cx="98" cy="29" r="3" fill="${OUT}"/><circle cx="116" cy="29" r="3" fill="${OUT}"/><path d="M8 80 Q10 68 28 68 H86 Q96 68 98 58 Q100 50 106 50 Q114 52 112 62 Q108 78 90 80 Z" fill="#C9B79A" ${ln(2)}/><circle cx="54" cy="48" r="24" fill="#B8763E" ${ln(2)}/><path d="M54 48 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 1 1 8 8 a12 12 0 1 1 -12 -12 a16 16 0 1 1 16 16" fill="none" stroke="#7A4A22" stroke-width="2"/>`,
    marienkaefer: `<path d="M38 40 L22 32 M36 54 L18 56 M40 68 L24 80 M82 40 L98 32 M84 54 L102 56 M80 68 L96 80 M54 18 L48 8 M66 18 L72 8" fill="none" ${ln(2.4)}/><circle cx="60" cy="52" r="27" fill="#E8344A" ${ln(2.2)}/><path d="M48 26 A12 10 0 0 1 72 26 Z" fill="${OUT}"/><circle cx="54" cy="22" r="2" fill="#fff"/><circle cx="66" cy="22" r="2" fill="#fff"/><path d="M60 26 L60 79" ${ln(2)}/>${[[60, 33, 5], [46, 42, 5], [74, 42, 5], [40, 58, 5], [80, 58, 5], [50, 70, 4.5], [70, 70, 4.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${OUT}"/>`).join('')}<ellipse cx="48" cy="34" rx="5" ry="3" fill="#fff" opacity=".5"/>`,
  };
  const SMALL_LIST = [{ id: 'igel', name: 'Igel' }, { id: 'regenwurm', name: 'Regenwurm' }, { id: 'schnecke', name: 'Schnecke' }, { id: 'marienkaefer', name: 'Marienkäfer' }];
  const smallSVG = (id) => pic('0 0 120 90', SMALL[id], 'Bild eines kleinen Tieres', 160);
  const NEST = ['Ein Nest bauen', 'Eier legen', 'Eier ausbrüten', 'Junge füttern', 'Die Jungen fliegen aus'].map((text, i) => ({ id: 'n' + i, text }));
  const STORCH = ['Rückkehr im Frühling', 'Das Nest ausbessern', 'Junge aufziehen', 'Abflug im Herbst'].map((text, i) => ({ id: 's' + i, text }));
  const TI_NOTES = {
    vogel: { title: 'Vögel erkennen', lines: ['Amsel: Das Männchen ist schwarz mit gelbem Schnabel, das Weibchen braun.', 'Kohlmeise: gelber Bauch mit schwarzem Streifen, schwarzer Kopf, weiße Wangen.', 'Spatz: braun und grau, das Männchen hat einen schwarzen Latz. Spatzen leben in Gruppen.', 'Rotkehlchen: orange-rote Brust und Kehle.', 'Storch: weiß mit schwarzen Flügelfedern, lange rote Beine, roter Schnabel.', 'Schwalbe: dunkelblauer Rücken, rote Kehle, langer Schwanz mit zwei Spitzen.'] },
    zug: { title: 'Vögel im Jahr', lines: ['Zugvögel fliegen im Herbst in warme Länder, weil sie im Winter hier kein Futter finden. Im Frühling kommen sie zurück.', 'Zugvögel: Storch, Schwalbe, Kuckuck.', 'Standvögel bleiben das ganze Jahr hier: Amsel, Kohlmeise, Spatz.', 'Im Winter helfen Vögeln ein Futterhaus und frisches Wasser. Kein salziges Brot.'] },
    nest: { title: 'Nest und Junge', lines: NEST.map((n, i) => `${i + 1}. ${n.text}.`).concat(['Nester sind aus Halmen, Moos und Zweigen.', 'Ein Vogelnest fasst du nicht an.', 'Nesthocker bleiben lange im Nest, zum Beispiel junge Amseln. Nestflüchter laufen gleich los, zum Beispiel Küken.', 'Der Kuckuck legt seine Eier in fremde Nester.']) },
    heim: { title: 'Heimtiere pflegen', lines: ['Jedes Heimtier braucht jeden Tag Futter und frisches Wasser.', 'Hund: jeden Tag lange Spaziergänge.', 'Meerschweinchen und Kaninchen: Heu, Gemüse und Kräuter, viel Platz und einen Artgenossen.', 'Hamster: Er ist abends und nachts wach.', 'Ein Tier ist kein Spielzeug. Bei Krankheit hilft die Tierärztin.', 'Körpersprache: Faucht eine Katze und macht einen Buckel, will sie in Ruhe gelassen werden. Knurrt ein Hund, droht er.'] },
    hof: { title: 'Auf dem Bauernhof', lines: ['Kuh: Milch, daraus Käse, Butter und Joghurt. Ihr Junges ist das Kalb.', 'Huhn: Eier. Das Männchen ist der Hahn. Das Huhn ist ein Vogel.', 'Schaf: Wolle. Sein Junges ist das Lamm.', 'Schwein: Fleisch und Wurst. Sein Junges ist das Ferkel.', 'Pferd: Früher zog es Pflug und Wagen. Sein Junges ist das Fohlen.', 'Biene: Honig.', 'Kühe sind Säugetiere: Die Kälber trinken Milch.'] },
    klein: { title: 'Kleine Tiere draußen', lines: ['Igel: Er frisst Käfer und Würmer und hält Winterschlaf in einem Laubhaufen. Keine Milch geben.', 'Regenwurm: Er lebt in der Erde und lockert den Boden. Er hat keine Beine.', 'Schnecke: Sie trägt ihr Haus auf dem Rücken. Ihre Augen sitzen oben an den Fühlern.', 'Marienkäfer: Er frisst Blattläuse. Der Siebenpunkt hat sieben Punkte.', 'Käfer haben sechs Beine.', 'Beobachte kleine Tiere vorsichtig und lass sie danach frei.'] },
  };
  const TI_POOL = [].concat(
    P('sk2t_vo', 'vogel', 'vogel', [
      ['Welcher Vogel hat eine rote Kehle und einen langen Schwanz?', ['Schwalbe', 'Amsel', 'Spatz']],
      ['Welche Farbe hat das Amselmännchen?', ['Schwarz', 'Gelb', 'Weiß']],
      ['Welche Farbe hat der Bauch der Kohlmeise?', ['Gelb', 'Rot', 'Schwarz']],
      ['Welcher Vogel lebt gern in Gruppen in der Stadt?', ['Spatz', 'Storch', 'Kuckuck']],
      ['Woran erkennst du einen Vogel?', ['An Gefieder und Form', 'An seinem Namen', 'An der Uhrzeit']],
      ['Welcher große Vogel klappert mit dem Schnabel?', ['Storch', 'Rotkehlchen', 'Meise']],
    ]),
    P('sk2t_zu', 'zug', 'zug', [
      ['Wie heißen Vögel, die im Herbst in den Süden fliegen?', ['Zugvögel', 'Standvögel', 'Raubvögel']],
      ['Wie heißen Vögel, die das ganze Jahr hierbleiben?', ['Standvögel', 'Zugvögel', 'Seevögel']],
      ['Warum fliegen Zugvögel im Herbst weg?', ['Im Winter fehlt Futter', 'Sie suchen Schnee', 'Sie sind gelangweilt']],
      ['Wohin fliegen Störche im Herbst?', ['Nach Afrika', 'Zum Nordpol', 'Auf den Mond']],
      ['Wann kommen die Schwalben zurück?', ['Im Frühling', 'Im Herbst', 'Im Winter']],
      ['Die Amsel bleibt auch im Winter bei uns.', true],
      ['Der Storch bleibt im Winter bei uns.', false, 'Der Storch ist ein Zugvogel. Er fliegt im Herbst nach Afrika.'],
      ['Wie hilfst du Vögeln im Winter?', ['Futter ins Futterhaus', 'Salziges Brot streuen', 'Das Nest wegnehmen']],
    ]),
    P('sk2t_ne', 'zug', 'nest', [
      ['Woraus bauen viele Vögel ihr Nest?', ['Halme, Moos, Zweige', 'Plastik und Steine', 'Glas']],
      ['Was machen Vogeleltern mit den Eiern?', ['Sie brüten sie aus', 'Sie verstecken sie', 'Sie essen sie']],
      ['Was bringen Vogeleltern ihren Jungen ins Nest?', ['Raupen und Insekten', 'Spielzeug', 'Steine']],
      ['Wie heißt das Holzhäuschen, in dem Meisen brüten?', ['Nistkasten', 'Hundehütte', 'Bienenstock']],
      ['Ein Vogelnest mit Jungen darfst du nicht anfassen.', true],
      ['Welcher Vogel legt seine Eier in fremde Nester?', ['Der Kuckuck', 'Die Amsel', 'Der Storch']],
      ['Wie heißen Vögel, deren Junge lange im Nest bleiben?', ['Nesthocker', 'Nestflüchter', 'Zugvögel']],
      ['Küken vom Huhn laufen gleich nach dem Schlüpfen los.', true],
    ]),
    P('sk2t_he', 'heim', 'heim', [
      ['Welches Tier braucht jeden Tag lange Spaziergänge?', ['Der Hund', 'Der Goldfisch', 'Der Hamster']],
      ['Was frisst ein Meerschweinchen?', ['Heu, Gemüse, Kräuter', 'Schokolade', 'Wurst']],
      ['Ein Meerschweinchen lebt am liebsten ganz allein.', false, 'Meerschweinchen leben gern mit Artgenossen. Allein werden sie einsam.'],
      ['Wann ist ein Hamster wach?', ['Abends und nachts', 'Morgens früh', 'Nur mittags']],
      ['Eine Katze faucht und macht einen Buckel. Was heißt das?', ['„Lass mich in Ruhe!“', '„Streichle mich!“', '„Ich bin müde.“']],
      ['Ein Hund wedelt locker mit dem Schwanz. Was zeigt er meist?', ['Er freut sich', 'Er ist krank', 'Er ist müde']],
      ['Ein Hund knurrt und zeigt die Zähne. Was zeigt er?', ['Er droht', 'Er freut sich', 'Er schläft']],
      ['Einen fremden Hund streichelst du nur, wenn der Besitzer es erlaubt.', true],
      ['Was braucht jedes Heimtier jeden Tag?', ['Futter und frisches Wasser', 'Ein Bad mit Seife', 'Fernsehen']],
      ['Ein Tier ist kein Spielzeug.', true],
      ['Wer hilft einem kranken Tier?', ['Die Tierärztin', 'Der Bäcker', 'Die Friseurin']],
      ['Was musst du im Käfig regelmäßig tun?', ['Sauber machen', 'Bunt anmalen', 'Abschließen und vergessen']],
      ['Welches Heimtier lebt im Wasser?', ['Der Goldfisch', 'Der Wellensittich', 'Das Kaninchen']],
      ['Wie viel Platz braucht ein Kaninchen?', ['Viel Platz zum Hoppeln', 'Einen Schuhkarton', 'Gar keinen']],
      ['Ein Heimtier kostet Geld für Futter und Tierarzt.', true],
    ]),
    P('sk2t_ho', 'hof', 'hof', [
      ['Welches Tier gibt uns Milch?', ['Kuh', 'Huhn', 'Schwein']],
      ['Welches Tier legt Eier?', ['Huhn', 'Kuh', 'Schaf']],
      ['Welches Tier gibt uns Wolle?', ['Schaf', 'Huhn', 'Schwein']],
      ['Was wird aus Milch gemacht?', ['Käse und Butter', 'Eier', 'Wolle']],
      ['Was wird aus Wolle gemacht?', ['Pullover und Mützen', 'Brot', 'Saft']],
      ['Wie heißt das junge Tier der Kuh?', ['Kalb', 'Fohlen', 'Ferkel']],
      ['Wie heißt das junge Tier vom Pferd?', ['Fohlen', 'Lamm', 'Küken']],
      ['Wie heißt das junge Tier vom Schwein?', ['Ferkel', 'Kalb', 'Lamm']],
      ['Wie heißt das junge Tier vom Schaf?', ['Lamm', 'Fohlen', 'Ferkel']],
      ['Was fressen Kühe auf der Weide?', ['Gras', 'Fleisch', 'Fisch']],
      ['Schweine wälzen sich im Schlamm, um sich zu kühlen.', true],
      ['Wie heißt das männliche Huhn?', ['Hahn', 'Bulle', 'Eber']],
      ['Welches Tier ist ein Säugetier?', ['Die Kuh', 'Das Huhn', 'Die Gans']],
      ['Das Huhn ist ein Vogel.', true],
      ['Was bekommen wir von der Biene?', ['Honig', 'Milch', 'Eier']],
      ['Tiere im Stall brauchen Licht, Platz und frisches Wasser.', true],
      ['Was zog das Pferd früher auf dem Hof?', ['Pflug und Wagen', 'Eier', 'Milch']],
      ['Woraus wird Leder gemacht?', ['Aus Tierhaut', 'Aus Holz', 'Aus Milch']],
      ['Wo fressen Kühe im Sommer draußen?', ['Auf der Weide', 'Im Keller', 'Im Hühnerstall']],
    ]),
    P('sk2t_kl', 'klein', 'klein', [
      ['Was macht der Igel im Winter?', ['Winterschlaf', 'Er fliegt nach Süden', 'Er sammelt Nüsse']],
      ['Was frisst der Igel gern?', ['Käfer und Würmer', 'Milch und Brot', 'Gras']],
      ['Einem Igel darfst du Milch geben.', false, 'Igel vertragen keine Milch. Sie bekommen davon Bauchweh. Gib ihnen nur Wasser.'],
      ['Wie viele Punkte hat der Siebenpunkt-Marienkäfer?', ['7', '2', '10']],
      ['Was frisst der Marienkäfer?', ['Blattläuse', 'Blätter', 'Regenwürmer']],
      ['Wo lebt der Regenwurm?', ['In der Erde', 'Im Baum', 'Im Wasser']],
      ['Warum ist der Regenwurm nützlich?', ['Er lockert den Boden', 'Er frisst Blattläuse', 'Er bestäubt Blüten']],
      ['Was trägt die Schnecke auf dem Rücken?', ['Ihr Haus', 'Ein Blatt', 'Ihre Jungen']],
      ['Wo hat die Schnecke ihre Augen?', ['Oben an den Fühlern', 'Am Bauch', 'Am Haus']],
      ['Wann kommen Schnecken gern heraus?', ['Wenn es feucht ist', 'Bei großer Hitze', 'Bei Frost']],
      ['Regenwürmer haben Beine.', false, 'Regenwürmer haben keine Beine. Sie ziehen ihren Körper zusammen und strecken ihn wieder.'],
      ['Was macht der Marienkäfer im Winter?', ['Er überwintert versteckt', 'Er fliegt nach Afrika', 'Er frisst nur Schnee']],
      ['Wie schützt sich der Igel?', ['Er rollt sich zusammen', 'Er fliegt davon', 'Er taucht unter']],
      ['Kleine Tiere beobachtest du vorsichtig und lässt sie danach frei.', true],
      ['Wie viele Beine hat ein Käfer?', ['6', '8', '100']],
      ['Wo kann ein Igel im Garten überwintern?', ['In einem Laubhaufen', 'Im Teich', 'Auf dem Dach']],
    ]));
  const TI_TUT = {
    'vogel:1': { title: 'Vögel erkennen', steps: ['Schau auf die Farben: Kopf, Brust, Rücken und Schnabel.', 'Beispiel: Eine orange-rote Brust hat das Rotkehlchen.', 'Tippe auf den richtigen Namen.'] },
    'vogel:2': { title: 'Merkmale', steps: ['Jetzt gibt es kein Bild. Die Frage nennt ein Merkmal.', 'Beispiel: Lange rote Beine und einen roten Schnabel hat der Storch.', 'Tippe auf den Vogel, der passt.'] },
    'zug:1': { title: 'Vögel im Jahr', steps: ['Zugvögel fliegen im Herbst fort, Standvögel bleiben hier.', 'Beispiel: Die Schwalbe ist ein Zugvogel, die Amsel ein Standvogel.', 'Tippe auf die richtige Antwort.'] },
    'zugord:1': { title: 'Der Reihe nach', steps: ['Die Schritte sind durcheinander.', 'Bei den Vögeln beginnt es mit dem Nest oder mit der Rückkehr im Frühling.', 'Tippe sie der Reihe nach an.'] },
    'heim:1': { title: 'Heimtiere pflegen', steps: ['Fragen zu Futter, Pflege und Körpersprache der Tiere.', 'Beispiel: Jedes Heimtier braucht jeden Tag Futter und frisches Wasser.', 'Tippe auf die richtige Antwort.'] },
    'hof:1': { title: 'Auf dem Bauernhof', steps: ['Fragen zu den Tieren auf dem Bauernhof und was sie uns geben.', 'Beispiel: Das Schaf gibt uns Wolle.', 'Tippe auf die richtige Antwort.'] },
    'klein:1': { title: 'Kleine Tiere draußen', steps: ['Manchmal siehst du ein Bild von einem kleinen Tier.', 'Beispiel: Rot mit schwarzen Punkten ist der Marienkäfer.', 'Tippe auf die richtige Antwort.'] },
  };
  function tiGen(cfg) {
    return (m, tier, know, seq, opts) => {
      if (wantsPool(cfg, m, opts)) return null;
      const r = Math.random();
      if (m === 'vogel') {
        if (tier >= 2 && r < 0.6) { const t = pick(BIRD_TRAITS), id = pick(t.has), ans = BIRDS.find((b) => b.id === id);
          return choice(m, 'vogel', t.q, ans.name, shuffle(BIRDS.filter((b) => !t.has.includes(b.id) && !(t.skip || []).includes(b.id))).slice(0, 2).map((b) => b.name), 'sk2t_vm_' + BIRD_TRAITS.indexOf(t), { group: 'vogel:2', tier: 2 }); }
        if (r < 0.7) { const b = pick(BIRDS); return choice(m, 'vogel', 'Wie heißt dieser Vogel?', b.name, others(BIRDS, b).map((x) => x.name), 'sk2t_vb_' + b.id, { pic: birdSVG(b.id) }); }
      }
      if (m === 'zug' && r < 0.3) return Math.random() < 0.6 ? orderTask(m, 'zugord:1', 'nest', 'Vom Nest bis zum Ausfliegen: Tippe der Reihe nach an.', NEST, 'sk2t_on_')
        : orderTask(m, 'zugord:1', 'zug', 'Das Jahr des Storches: Tippe der Reihe nach an.', STORCH, 'sk2t_os_');
      if (m === 'klein' && r < 0.4) { const t = pick(SMALL_LIST); return choice(m, 'klein', 'Wie heißt dieses Tier?', t.name, others(SMALL_LIST, t).map((x) => x.name), 'sk2t_kb_' + t.id, { pic: smallSVG(t.id) }); }
      return null;
    };
  }
  const TI = unit({ grade: 2, title: 'Tiere bei uns', icon: '🕊', sub: 'Vögel im Jahr, Heimtiere pflegen, Tiere auf dem Bauernhof und kleine Tiere draußen',
    modules: { vogel: mod('Vögel erkennen', '🕊', 'Federkleid', 12, 2), zug: mod('Vögel im Jahr', '🧭', 'Vogelzug', 14), heim: mod('Heimtiere pflegen', '🏠', 'Futternapf', 12),
      hof: mod('Auf dem Bauernhof', '🧺', 'Melkeimer', 12), klein: mod('Kleine Tiere draußen', '🐞', 'Igelstacheln', 12) },
    attacks: [{ name: 'Federkleid', mod: 'vogel' }, { name: 'Vogelzug', mod: 'zug' }, { name: 'Futternapf', mod: 'heim' }, { name: 'Melkeimer', mod: 'hof' }],
    tut: TI_TUT, notes: TI_NOTES, pool: TI_POOL,
    events: [
      ask('Der Nistkasten', 'Am Schulhof hängt ein neuer Nistkasten. Der Hausmeister fragt dich nach Nestern und schenkt dir einen Trank.', 'zug', 'nest', { item: 'trank' }, { hp: -6 }),
      ask('Der Melkstand', 'Auf dem Bauernhof melkt die Bäuerin gerade die Kühe. Sie gibt dir einen Schild für eine richtige Antwort.', 'hof', 'hof', { item: 'schild' }),
      ask('Die Tierarztpraxis', 'In der Tierarztpraxis wartet ein Junge mit seinem Kaninchen. Die Tierärztin kennt eine Eselsbrücke und verrät sie dir.', 'heim', 'heim', { item: 'lupe' }, { xp: 5 }),
      ask('Der Laubhaufen', 'Im Garten liegt ein großer Laubhaufen. Ein Mädchen fragt dich nach den Tieren darin und gibt dir eine Chilischote.', 'klein', 'klein', { item: 'keks' }, { xp: 5 }),
      ask('Das Futterhaus', 'Am Futterhaus im Park picken Meisen und Spatzen. Ein Opa fragt dich nach den Vögeln.', 'vogel', 'vogel', { xp: 20 }, { xp: 5 }),
      rest('Der Heuboden', 'Auf dem Heuboden ist es warm und weich. Hier ruhst du dich aus.'),
      dil('Der Hundewunsch', 'Dein Freund bekommt einen jungen Hund. Du willst auch einen. Mama fragt: „Wer geht dann jeden Tag mit ihm raus?“', [
        ['Ich verspreche, jeden Tag zu gehen.', 'Mama schlägt vor: Du gehst eine Woche lang mit dem Hund der Nachbarin. Danach redet ihr weiter.', 'Was braucht ein Hund jeden Tag?'],
        ['Ich helfe erst im Tierheim mit.', 'Im Tierheim gehst du mit einem alten Hund spazieren. Du merkst, wie viel Arbeit ein Hund macht.', 'Warum landen manche Tiere im Tierheim?'],
        ['Ich frage, ob ein kleineres Tier passt.', 'Ihr lest zusammen, was Meerschweinchen brauchen. Auch das ist viel Arbeit.', 'Welches Tier passt zu deiner Familie?']]),
      dil('Die Nachbarskatze', 'Die Katze der Nachbarn sitzt vor deiner Tür und miaut laut.', [
        ['Ich gebe ihr eine Schale Milch.', 'Die Katze trinkt. Später hat sie Bauchweh, denn viele Katzen vertragen keine Kuhmilch.', 'Was trinken Katzen am besten?'],
        ['Ich klingle bei den Nachbarn.', 'Die Nachbarin bedankt sich. Die Katze war ausgesperrt.', 'Wem gehört die Katze, und wer sorgt für sie?'],
        ['Ich streichle sie vorsichtig.', 'Die Katze schnurrt und läuft nach einer Weile nach Hause.', 'Woran merkst du, ob eine Katze gestreichelt werden will?']]),
    ] });
  TI.gen = tiGen(TI);

  /* ================= LICHT, LUFT UND WASSER (Klasse 2, LB 4) ================= */
  const OBJ = {
    baum: `<rect x="76" y="46" width="8" height="28" fill="${BARK}" ${ln(1.6)}/><circle cx="80" cy="38" r="16" fill="${LEAF}" ${ln(2)}/>`,
    kind: `<circle cx="80" cy="38" r="7" fill="${SKIN}" ${ln(1.6)}/><rect x="74" y="46" width="12" height="16" rx="3" fill="#3B82F6" ${ln(1.6)}/><path d="M77 62 V74 M83 62 V74" ${ln(3)}/>`,
    haus: `<rect x="66" y="50" width="28" height="24" fill="#E3DED0" ${ln(1.8)}/><path d="M62 52 L80 36 L98 52 Z" fill="#E8603A" ${ln(1.8)}/><rect x="76" y="60" width="8" height="14" fill="${BARK}"/>`,
  };
  // side: wo die Sonne steht ('l' oder 'r'); der Schatten fällt auf die andere Seite
  const shadowSVG = (obj, side, showSun) => pic('0 0 160 90', `<rect width="160" height="90" fill="#DFF1FF"/><rect y="74" width="160" height="16" fill="#9CD06E"/><path d="M0 74 H160" ${ln(1.6)}/>${showSun ? sun(side === 'l' ? 22 : 138, 22, 10) : `<ellipse cx="${side === 'l' ? 110 : 50}" cy="77" rx="30" ry="4" fill="#3A3F4F" opacity=".55"/>`}${OBJ[obj]}`, 'Gegenstand in der Sonne', 220);
  function thermoSVG(t) {
    const y = (v) => +(172 - (v + 10) * 3.6).toFixed(1);
    let ticks = '';
    for (let v = -10; v <= 30; v += 2) ticks += `<path d="M52 ${y(v)} H${v % 10 ? 58 : 62}" stroke="${OUT}" stroke-width="${v % 10 ? 1 : 1.8}"/>`;
    for (let v = -10; v <= 30; v += 10) ticks += `<text x="66" y="${y(v) + 4}" font-size="11" font-weight="700" fill="${OUT}">${minus(v)}</text>`;
    return pic('0 0 100 220', `<rect x="36" y="8" width="16" height="182" rx="8" fill="#F4F8FF" ${ln(2)}/>${ticks}<rect x="41" y="${y(t)}" width="6" height="${+(186 - y(t)).toFixed(1)}" fill="#E8344A"/><circle cx="44" cy="198" r="12" fill="#E8344A" ${ln(2)}/><text x="66" y="200" font-size="11" font-weight="700" fill="${OUT}">°C</text>`, 'Thermometer', 130);
  }
  const GHS = {
    flamme: { mean: 'Brennt leicht', art: `<path d="M40 60 Q24 56 28 40 Q32 32 36 36 Q34 24 44 16 Q42 30 52 34 Q56 44 50 56 Q46 60 40 60 Z" fill="${OUT}"/><path d="M26 62 H54" ${ln(3)}/>` },
    gift: { mean: 'Giftig', art: `<circle cx="40" cy="32" r="12" fill="${OUT}"/><rect x="33" y="38" width="14" height="8" rx="2" fill="${OUT}"/><circle cx="35" cy="31" r="3.4" fill="#fff"/><circle cx="45" cy="31" r="3.4" fill="#fff"/><path d="M26 50 L54 62 M54 50 L26 62" ${ln(4)}/>` },
    aetzend: { mean: 'Ätzt die Haut', art: `<rect x="24" y="12" width="8" height="18" rx="3" fill="#fff" ${ln(2)} transform="rotate(-40 28 21)"/><rect x="44" y="12" width="8" height="18" rx="3" fill="#fff" ${ln(2)} transform="rotate(-40 48 21)"/><path d="M33 32 l-1 4 M33 40 l-1 3 M53 32 l-1 4 M53 40 l-1 3" ${ln(2.6)}/><path d="M20 48 H38 V56 H20 Z M24 48 v-2 M30 48 v-3" fill="${OUT}" ${ln(1.5)}/><path d="M42 58 V50 Q42 46 46 46 H60 V58 Z M48 46 v-3 M54 46 v-2" fill="${OUT}" ${ln(1.5)}/>` },
    achtung: { mean: 'Reizt Haut und Augen', art: `<path d="M40 20 V46" ${ln(7)}/><circle cx="40" cy="58" r="4" fill="${OUT}"/>` },
    umwelt: { mean: 'Schadet Tieren im Wasser', art: `<path d="M30 52 V24 M30 34 L22 26 M30 30 L38 22" fill="none" ${ln(2.6)}/><path d="M38 60 Q48 52 58 60 Q48 66 38 60 Z M58 60 L64 55 V65 Z" fill="${OUT}"/><path d="M20 66 H60" ${ln(2)}/>` },
  };
  const ghsSVG = (k) => pic('0 0 80 80', `<path d="M40 4 L76 40 L40 76 L4 40 Z" fill="#fff" stroke="#E8344A" stroke-width="5" stroke-linejoin="round"/>${GHS[k].art}`, 'Warnzeichen', 120);
  // Forscherlabor: erst vermuten, dann zeigt das Bild das Ergebnis
  const glass = (label, state) => pic('0 0 200 150', `<rect x="56" y="24" width="88" height="118" rx="8" fill="#E3F2FD" ${ln(2.5)}/><rect x="58" y="52" width="84" height="88" rx="6" fill="#64B5F6" opacity="${state === 'klar' ? 0.4 : 0.6}"/>${state === 'unten' ? `<path d="M62 136 Q80 124 100 130 Q120 124 138 136 Z" fill="#C9A26A" ${ln(1.6)}/>` : ''}${state === 'oben' ? `<rect x="66" y="8" width="68" height="20" rx="10" fill="#FFE0B2" ${ln(2)}/>` : ''}${state === 'oben' ? S.txt(100, 22, label, { size: 12 }) : S.txt(100, 18, label, { size: 12 })}`, 'Glas mit Wasser', 220);
  const SOLVE = [['Zucker', true], ['Salz', true], ['Sand', false], ['Kieselsteine', false], ['Mehl', false], ['Brausepulver', true]];
  const SHINE = [['eine Glasscheibe', 'Die Glasscheibe', true], ['ein Holzbrett', 'Das Holzbrett', false], ['Klarsichtfolie', 'Die Klarsichtfolie', true], ['ein Stück Pappe', 'Die Pappe', false], ['Alufolie', 'Die Alufolie', false]];
  const lamp = (label, through) => pic('0 0 200 110', `<rect x="8" y="44" width="34" height="20" rx="4" fill="#8E96B5" ${ln(2)}/><path d="M42 40 L52 34 V74 L42 68 Z" fill="#C9CEDD" ${ln(2)}/><path d="M52 42 L96 46 M52 66 L96 62" stroke="#FFD43B" stroke-width="3"/><rect x="96" y="22" width="10" height="66" fill="#F2E3C6" ${ln(2)}/>${S.txt(101, 104, label, { size: 11 })}<rect x="176" y="10" width="10" height="90" fill="#E3DED0" ${ln(2)}/>${through ? `<path d="M106 46 L176 52 M106 62 L176 58" stroke="#FFD43B" stroke-width="3"/><ellipse cx="174" cy="55" rx="5" ry="12" fill="#FFE27A"/>` : through === false ? '<ellipse cx="174" cy="55" rx="5" ry="12" fill="#3A3F4F" opacity=".5"/>' : ''}`, 'Taschenlampe und Wand', 260);
  const AIR = [
    { q: 'Du drückst ein Glas mit Papier darin umgedreht ins Wasser. Bleibt das Papier trocken?', opts: ['Bleibt trocken', 'Wird nass'], a: 0, note: 'Das Papier bleibt trocken. Im Glas ist Luft, sie braucht Platz und lässt das Wasser nicht hinein.' },
    { q: 'Auf einer leeren Flasche sitzt ein Luftballon. Du stellst die Flasche in warmes Wasser. Was passiert?', opts: ['Der Ballon richtet sich auf', 'Nichts passiert'], a: 0, note: 'Die Luft in der Flasche wird warm und dehnt sich aus. Sie bläst den Ballon ein Stück auf.' },
    { q: 'Du lässt ein glattes Blatt Papier und eine Papierkugel fallen. Was landet zuerst?', opts: ['Die Papierkugel', 'Das glatte Blatt', 'Beide gleich'], a: 0, note: 'Die Papierkugel landet zuerst. Das glatte Blatt wird von der Luft stärker gebremst.' },
  ];
  function laborSet() {
    const sol = shuffle(SOLVE).slice(0, 2).map(([x, l]) => ({ kind: 'loesen', topic: 'loesen', q: `Du rührst ${x} in ein Glas Wasser. Löst es sich auf?`, opts: ['Löst sich auf', 'Löst sich nicht'], a: l ? 0 : 1, note: `${x} löst sich ${l ? 'im Wasser auf. Du siehst es nicht mehr, aber es ist noch da.' : 'nicht auf. Es sinkt auf den Boden.'}`, pic: glass(x, 'oben'), after: glass(x, l ? 'klar' : 'unten') }));
    const li = shuffle(SHINE).slice(0, 2).map(([acc, nom, d]) => ({ kind: 'licht', topic: 'licht', q: `Du hältst ${acc} vor die Taschenlampe. Kommt das Licht hindurch?`, opts: ['Licht kommt durch', 'Kein Licht kommt durch'], a: d ? 0 : 1, note: `${nom} ist ${d ? 'durchsichtig. Das Licht kommt hindurch.' : 'undurchsichtig. Dahinter ist ein Schatten.'}`, pic: lamp(nom.replace(/^(Die|Das) /, '')), after: lamp(nom.replace(/^(Die|Das) /, ''), d) }));
    const air = Object.assign({ kind: 'luft', topic: 'luft' }, pick(AIR));
    return shuffle(sol.concat(li, [air]));
  }
  const NA_NOTES = {
    licht: { title: 'Licht', lines: ['Die Sonne ist eine natürliche Lichtquelle. Kerze, Fackel und Glühlampe sind künstliche Lichtquellen.', 'Durchsichtig: Glas, Klarsichtfolie. Undurchsichtig: Holz, Pappe, Metall.', 'Reflektoren werfen das Licht zurück. So sehen Autofahrer dich im Dunkeln.', 'Schau nie direkt in die Sonne. Gegen Sonnenbrand helfen Hut, Creme und Schatten.'] },
    schatten: { title: 'Schatten', lines: ['Ein Schatten entsteht, wenn etwas das Licht verdeckt.', 'Der Schatten fällt immer auf die Seite, die von der Lampe oder Sonne weg zeigt.', 'Mittags ist dein Schatten kurz, morgens und abends lang.', 'Nah an der Lampe wird der Schatten groß.', 'Eine Sonnenuhr zeigt mit dem Schatten die Uhrzeit.'] },
    himmel: { title: 'Sonne, Mond und Sterne', lines: ['Die Sonne ist ein Stern. Sie gibt uns Licht und Wärme.', 'Der Mond leuchtet nicht selbst. Er wirft das Licht der Sonne zurück.', 'Der Mond kreist um die Erde. Von Vollmond zu Vollmond dauert es etwa einen Monat.', 'Am Tag ist die Sonne so hell, dass du die anderen Sterne nicht siehst.', 'Ein Sternbild ist eine Gruppe von Sternen, zum Beispiel der Große Wagen.'] },
    luft: { title: 'Luft und Wind', lines: ['Luft ist unsichtbar, aber sie ist überall und braucht Platz.', 'Warme Luft dehnt sich aus.', 'Luft bremst: Darum fällt ein Fallschirm langsam.', 'Wind ist bewegte Luft. Er treibt Windräder und Segelboote an.', 'Bei Sturm können Äste herabfallen.'] },
    schall: { title: 'Schall', lines: ['Töne entstehen, wenn etwas schwingt, zum Beispiel die Luft in einer Flöte.', 'Ein Echo ist ein Ruf, der von einer Wand zurückkommt.', 'Beim Gewitter siehst du zuerst den Blitz, dann hörst du den Donner.', 'Fledermäuse rufen und hören auf das Echo. So finden sie im Dunkeln ihren Weg.'] },
    thermo: { title: 'Das Thermometer', lines: ['Das Thermometer zeigt die Temperatur in Grad Celsius (°C).', 'Die Linie mit den Zahlen heißt Skala.', 'Wird es wärmer, steigt die rote Flüssigkeit.', 'Bei 0 °C gefriert Wasser zu Eis. Das ist der Gefrierpunkt.', 'Über 0 °C schmilzt Eis. Das ist der Schmelzpunkt, auch bei 0 °C.', 'Minus 5 Grad heißt: 5 Grad unter null.'] },
    loesen: { title: 'Wasser löst', lines: ['Zucker und Salz lösen sich in Wasser auf. Sand, Kieselsteine und Mehl nicht.', 'In warmem Wasser und beim Umrühren geht es schneller.', 'Sand trennst du mit einem Filter vom Wasser.', 'Verdunstet Salzwasser, bleiben Salzkristalle übrig.', 'Öl und Wasser mischen sich nicht.'] },
    sparen: { title: 'Wasser sparen', lines: ['Wasser brauchen wir zum Trinken, Kochen und Waschen.', 'Beim Zähneputzen drehst du den Hahn zu.', 'Duschen braucht weniger Wasser als ein volles Bad.', 'Blumen gießt du mit Regenwasser.', 'In manchen Ländern ist sauberes Wasser knapp.'] },
    gefahr: { title: 'Gefährliche Flüssigkeiten', lines: ['Warnzeichen haben einen roten Rand in Form einer Raute.', Object.values(GHS).map((g) => g.mean).join(', ') + '.', 'Putzmittel stehen hoch und verschlossen in ihrer eigenen Flasche.', 'Unbekannte Flaschen fasst du nicht an. Hol einen Erwachsenen.', 'Spritzt etwas ins Auge: mit viel Wasser ausspülen und Hilfe holen.'] },
  };
  const NA_POOL = [].concat(
    P('sk2n_li', 'licht', 'licht', [
      ['Was ist eine natürliche Lichtquelle?', ['Die Sonne', 'Die Taschenlampe', 'Die Kerze']],
      ['Was ist eine künstliche Lichtquelle?', ['Die Glühlampe', 'Die Sonne', 'Ein Blitz']],
      ['Was ist durchsichtig?', ['Fensterglas', 'Ein Holzbrett', 'Pappe']],
      ['Was lässt kein Licht durch?', ['Ein Holzbrett', 'Eine Glasscheibe', 'Klarsichtfolie']],
      ['Was macht ein Reflektor am Ranzen?', ['Er wirft Licht zurück', 'Er macht Musik', 'Er wärmt']],
      ['Du darfst nie direkt in die Sonne schauen.', true],
      ['Wie schützt du dich vor zu viel Sonne?', ['Hut, Creme, Schatten', 'Mittags in die Sonne', 'Ohne T-Shirt rennen']],
      ['Womit machten Menschen Licht, bevor es Glühlampen gab?', ['Kerzen und Fackeln', 'Taschenlampen', 'Handys']],
    ]),
    P('sk2n_sc', 'licht', 'schatten', [
      ['Wann entsteht ein Schatten?', ['Etwas verdeckt das Licht', 'Es regnet', 'Es ist windig']],
      ['Mittags ist dein Schatten kürzer als am Abend.', true],
      ['Du hältst die Hand nah an die Lampe. Wie wird der Schatten?', ['Größer', 'Kleiner', 'Bunt']],
      ['Ein Schatten hat die Farbe des Gegenstandes.', false, 'Ein Schatten ist dunkel, egal welche Farbe der Gegenstand hat.'],
      ['Was zeigt eine Sonnenuhr mit dem Schatten?', ['Die Uhrzeit', 'Das Wetter', 'Die Temperatur']],
    ]),
    P('sk2n_hi', 'himmel', 'himmel', [
      ['Welcher Stern ist uns am nächsten?', ['Die Sonne', 'Der Mond', 'Der Polarstern']],
      ['Der Mond leuchtet selbst.', false, 'Der Mond wird von der Sonne angestrahlt. Er wirft ihr Licht zurück.'],
      ['Die Sonne ist ein Stern.', true],
      ['Was kreist um die Erde?', ['Der Mond', 'Die Sonne', 'Alle Sterne']],
      ['Woher kommt das Licht vom Mond?', ['Von der Sonne', 'Aus dem Mond', 'Von den Lampen']],
      ['Wie sieht der Mond bei Vollmond aus?', ['Ganz rund', 'Schmal und krumm', 'Eckig']],
      ['Warum siehst du am Tag keine Sterne?', ['Die Sonne strahlt heller', 'Sterne schlafen am Tag', 'Sterne fehlen am Tag']],
      ['Wie heißt eine Gruppe von Sternen, die ein Bild ergibt?', ['Sternbild', 'Sternschnuppe', 'Mondfinsternis']],
      ['Wie heißt ein bekanntes Sternbild?', ['Großer Wagen', 'Kleiner Löffel', 'Roter Ball']],
      ['Die Sonne gibt uns Licht und Wärme.', true],
      ['Wie lange dauert es von Vollmond zu Vollmond?', ['Etwa einen Monat', 'Einen Tag', 'Ein Jahr']],
      ['Womit siehst du Sterne genauer?', ['Mit einem Fernrohr', 'Mit einer Lupe', 'Mit einem Spiegel']],
      ['Ohne Sonne könnten Pflanzen nicht wachsen.', true],
    ]),
    P('sk2n_lu', 'luft', 'luft', [
      ['Ein leeres Glas ist voller Luft.', true],
      ['Warum wird ein Luftballon beim Aufblasen größer?', ['Luft braucht Platz', 'Er wächst von allein', 'Er saugt Wasser']],
      ['Womit pumpst du Luft in einen Fahrradreifen?', ['Mit der Luftpumpe', 'Mit dem Föhn', 'Mit dem Strohhalm']],
      ['Warum fällt ein Fallschirm langsam?', ['Die Luft bremst ihn', 'Er ist aus Gold', 'Er ist schwer']],
      ['Was ist Wind?', ['Bewegte Luft', 'Kaltes Wasser', 'Ein Geräusch']],
      ['Was wird vom Wind angetrieben?', ['Das Windrad', 'Der Kühlschrank', 'Die Waschmaschine']],
      ['Was ist bei Sturm gefährlich?', ['Herabfallende Äste', 'Warme Luft', 'Schatten']],
      ['Was treibt ein Segelboot an?', ['Der Wind', 'Die Sonne', 'Der Mond']],
      ['Luft kann man sehen.', false, 'Luft ist unsichtbar. Du spürst sie aber, zum Beispiel als Wind.'],
      ['Warme Luft dehnt sich aus.', true],
      ['Was spürst du beim Radfahren im Gesicht?', ['Den Fahrtwind', 'Den Regenbogen', 'Den Schatten']],
    ]),
    P('sk2n_sl', 'luft', 'schall', [
      ['Wie entsteht ein Ton bei der Flöte?', ['Luft schwingt darin', 'Wasser fließt', 'Licht scheint']],
      ['Wie heißt ein Ruf, der von einer Felswand zurückkommt?', ['Echo', 'Gewitter', 'Wind']],
      ['Was bemerkst du beim Gewitter zuerst?', ['Den Blitz', 'Den Donner', 'Beides gleich']],
      ['Wie finden Fledermäuse im Dunkeln ihren Weg?', ['Mit Rufen und Echo', 'Mit einer Taschenlampe', 'Mit ihrer Nase']],
      ['Wozu ist ein Sprachrohr gut?', ['Man hört dich weiter', 'Man sieht besser', 'Es kühlt']],
    ]),
    P('sk2n_th', 'waerme', 'thermo', [
      ['Bei wie viel Grad gefriert Wasser?', ['0 °C', '10 °C', '100 °C']],
      ['Was passiert mit Eis über 0 °C?', ['Es schmilzt', 'Es wächst', 'Es wird härter']],
      ['Wie heißt die Linie mit Zahlen am Thermometer?', ['Skala', 'Zeiger', 'Lineal']],
      ['Wie heißt die Temperatur, bei der Eis schmilzt?', ['Schmelzpunkt', 'Startpunkt', 'Mittelpunkt']],
      ['Wie heißt die Temperatur, bei der Wasser zu Eis wird?', ['Gefrierpunkt', 'Startpunkt', 'Mittelpunkt']],
      ['Gefrierpunkt und Schmelzpunkt von Wasser liegen beide bei 0 °C.', true],
      ['Was steigt im Thermometer, wenn es wärmer wird?', ['Die rote Flüssigkeit', 'Der Zeiger', 'Das Glas']],
      ['Was bedeutet „minus 5 Grad“?', ['5 Grad unter null', '5 Grad über null', '5 Stunden']],
      ['Bei welcher Temperatur gehst du ins Freibad?', ['25 °C', '0 °C', '−5 °C']],
      ['Bei welcher Temperatur kannst du Schlitten fahren?', ['−3 °C', '20 °C', '30 °C']],
      ['Was zeigt ein Thermometer an?', ['Wie warm es ist', 'Wie spät es ist', 'Wie schwer etwas ist']],
      ['Ein Eiswürfel in der warmen Hand schmilzt.', true],
      ['Was wird aus Wasser im Gefrierfach?', ['Eis', 'Dampf', 'Saft']],
      ['Ein digitales Thermometer zeigt die Temperatur als Zahl.', true],
    ]),
    P('sk2n_lo', 'wasser', 'loesen', [
      ['Was passiert mit Zucker in warmem Tee?', ['Er löst sich auf', 'Er schwimmt oben', 'Er wird zu Eis']],
      ['Was löst sich nicht in Wasser auf?', ['Sand', 'Salz', 'Zucker']],
      ['Was löst sich in Wasser auf?', ['Salz', 'Sand', 'Kieselsteine']],
      ['Wo löst sich Zucker schneller auf?', ['In warmem Wasser', 'In kaltem Wasser', 'In Eis']],
      ['Was hilft, damit sich Zucker schneller löst?', ['Umrühren', 'Stillhalten', 'Einfrieren']],
      ['Wie trennst du Sand vom Wasser?', ['Mit einem Kaffeefilter', 'Mit einem Löffel Zucker', 'Mit Umrühren']],
      ['Salzwasser steht lange in der Sonne. Was bleibt übrig?', ['Salzkristalle', 'Sand', 'Zucker']],
      ['Öl und Wasser mischen sich nicht.', true],
      ['Was kann Wasser, was ein Stein nicht kann?', ['Fließen', 'Hart sein', 'Kanten haben']],
    ]),
    P('sk2n_sp', 'wasser', 'sparen', [
      ['Wie sparst du beim Zähneputzen Wasser?', ['Wasserhahn zudrehen', 'Wasser laufen lassen', 'Zweimal spülen']],
      ['Was braucht weniger Wasser?', ['Duschen', 'Ein volles Bad', 'Den Hahn laufen lassen']],
      ['Trinkwasser ist kostbar, auch wenn es aus dem Hahn kommt.', true],
      ['Wozu brauchen Menschen jeden Tag Wasser?', ['Trinken und Waschen', 'Nur zum Baden', 'Zum Heizen']],
      ['Womit gießt du Blumen, um Trinkwasser zu sparen?', ['Mit Regenwasser', 'Mit Saft', 'Mit Milch']],
      ['In manchen Ländern ist sauberes Wasser knapp.', true],
    ]),
    P('sk2n_gf', 'gefahr', 'gefahr', [
      ['Wo stehen Putzmittel am sichersten?', ['Hoch und verschlossen', 'Neben dem Saft', 'Auf dem Fußboden']],
      ['Putzmittel füllt man in leere Saftflaschen um.', false, 'Dann verwechselt sie jemand mit Saft. Putzmittel bleiben in ihrer Flasche.'],
      ['Du findest eine unbekannte Flasche. Was tust du?', ['Nicht anfassen, Erwachsenen holen', 'Daran riechen', 'Probieren']],
      ['Welche Form haben Warnzeichen auf Flaschen?', ['Eine rote Raute', 'Ein grüner Kreis', 'Ein blaues Viereck']],
      ['Spülmaschinentabs sehen aus wie Bonbons, sind aber gefährlich.', true],
      ['Was bedeutet ein Totenkopf auf einer Flasche?', ['Giftig', 'Lecker', 'Leer']],
      ['Wen rufst du, wenn ein Kind Putzmittel getrunken hat?', ['Den Notruf 112', 'Die Freundin', 'Niemanden']],
      ['Lampenöl sieht aus wie Wasser, ist aber giftig.', true],
      ['Warum haben Putzmittel oft einen Kinderschutz-Deckel?', ['Kinder öffnen ihn schwer', 'Er sieht schön aus', 'Er hält warm']],
      ['Putzmittel spritzt dir ins Auge. Was tust du?', ['Mit Wasser ausspülen', 'Fest reiben', 'Nichts tun']],
      ['Was bedeutet „ätzend“?', ['Es verletzt die Haut', 'Es schmeckt süß', 'Es riecht gut']],
    ]));
  const NA_TUT = {
    'licht:1': { title: 'Licht und Schatten', steps: ['Ein Schatten entsteht, wo etwas das Licht verdeckt.', 'Beispiel: Steht die Sonne links, fällt der Schatten nach rechts.', 'Tippe auf die richtige Antwort.'] },
    'himmel:1': { title: 'Sonne, Mond und Sterne', steps: ['Fragen zu Sonne, Mond und Sternen.', 'Beispiel: Die Sonne ist ein Stern. Der Mond wirft ihr Licht zurück.', 'Tippe auf die richtige Antwort.'] },
    'luft:1': { title: 'Luft und Schall', steps: ['Fragen zu Luft, Wind und Tönen.', 'Beispiel: Wind ist bewegte Luft.', 'Tippe auf die richtige Antwort.'] },
    'waerme:1': { title: 'Das Thermometer', steps: ['Lies ab, wie hoch die rote Säule steigt.', 'Zwischen zwei Zahlen liegen 10 Grad. Jeder kleine Strich sind 2 Grad.', 'Beispiel: Zwei kleine Striche über der 10 sind 14 °C.'] },
    'wasser:1': { title: 'Wasser', steps: ['Fragen dazu, was sich in Wasser löst und wie du Wasser sparst.', 'Beispiel: Zucker löst sich auf, Sand nicht.', 'Tippe auf die richtige Antwort.'] },
    'gefahr:1': { title: 'Warnzeichen', steps: ['Gefährliche Flüssigkeiten tragen ein Warnzeichen mit rotem Rand.', 'Beispiel: Der Totenkopf heißt giftig.', 'Tippe auf die richtige Antwort.'] },
  };
  function naGen(cfg) {
    return (m, tier, know, seq, opts) => {
      if (wantsPool(cfg, m, opts)) return null;
      const r = Math.random();
      if (m === 'licht' && r < 0.45) {
        const obj = pick(Object.keys(OBJ)), side = pick(['l', 'r']);
        if (Math.random() < 0.5) return choice(m, 'schatten', 'Wohin fällt der Schatten?', side === 'l' ? 'Nach rechts' : 'Nach links', [side === 'l' ? 'Nach links' : 'Nach rechts'], 'sk2n_sw_' + obj + side, { pic: shadowSVG(obj, side, true), cols: 2 });
        return choice(m, 'schatten', 'Auf welcher Seite steht die Sonne?', side === 'l' ? 'Links' : 'Rechts', [side === 'l' ? 'Rechts' : 'Links'], 'sk2n_ss_' + obj + side, { pic: shadowSVG(obj, side, false), cols: 2 });
      }
      if (m === 'waerme' && r < 0.6) {
        const t = 2 * rnd(-5, 15);
        if (t !== 0 && Math.random() < 0.3) return choice(m, 'thermo', 'Gefriert bei dieser Temperatur eine Pfütze?', t < 0 ? 'Ja, sie gefriert' : 'Nein, sie bleibt flüssig', [t < 0 ? 'Nein, sie bleibt flüssig' : 'Ja, sie gefriert'], 'sk2n_gp_' + t, { pic: thermoSVG(t), cols: 2, temp: t });
        const wrong = shuffle([t - 2, t + 2, t - 10, t + 10].filter((v) => v >= -10 && v <= 30)).slice(0, 2);
        return choice(m, 'thermo', 'Wie warm ist es? Lies ab.', minus(t) + ' °C', wrong.map((v) => minus(v) + ' °C'), 'sk2n_th_' + t, { pic: thermoSVG(t), temp: t });
      }
      if (m === 'gefahr' && r < 0.5) { const k = pick(Object.keys(GHS)); return choice(m, 'gefahr', 'Was bedeutet dieses Warnzeichen?', GHS[k].mean, others(Object.keys(GHS), k).map((x) => GHS[x].mean), 'sk2n_ghs_' + k, { pic: ghsSVG(k) }); }
      return null;
    };
  }
  const NA = unit({ grade: 2, title: 'Licht, Luft und Wasser', icon: '💡', sub: 'Licht und Schatten, Sonne und Mond, Luft und Schall, Thermometer, Wasser und Warnzeichen', swap: { from: 'event', to: 'labor' }, labor: laborSet,
    modules: { licht: mod('Licht und Schatten', '💡', 'Taschenlampe', 12), himmel: mod('Sonne, Mond und Sterne', '☀', 'Mondsichel', 12), luft: mod('Luft und Schall', '👂', 'Luftballon', 12),
      waerme: mod('Das Thermometer', '🧊', 'Frostnacht', 14), wasser: mod('Wasser', '💧', 'Zuckerwürfel', 12), gefahr: mod('Warnzeichen', '🧪', 'Warnschild', 12) },
    attacks: [{ name: 'Taschenlampe', mod: 'licht' }, { name: 'Luftballon', mod: 'luft' }, { name: 'Frostnacht', mod: 'waerme' }, { name: 'Zuckerwürfel', mod: 'wasser' }],
    tut: NA_TUT, notes: NA_NOTES, pool: NA_POOL,
    events: [
      ask('Die Sternwarte', 'In der Sternwarte zeigt eine Astronomin den Mond im Fernrohr. Sie schenkt dir einen Trank für eine richtige Antwort.', 'himmel', 'himmel', { item: 'trank' }, { hp: -6 }),
      ask('Die Putzkammer', 'In der Putzkammer der Schule stehen viele Flaschen. Die Reinigungskraft fragt dich nach den Warnzeichen und gibt dir einen Schild.', 'gefahr', 'gefahr', { item: 'schild' }),
      ask('Das Fensterthermometer', 'Am Fenster der Klasse hängt ein Thermometer. Ein Mitschüler kennt eine Eselsbrücke und verrät sie dir.', 'waerme', 'thermo', { item: 'lupe' }, { xp: 5 }),
      ask('Das Schattentheater', 'In der Turnhalle zeigt eine Klasse Schattentheater. Die Lehrerin gibt dir eine Chilischote für eine richtige Antwort.', 'licht', 'schatten', { item: 'keks' }, { xp: 5 }),
      ask('Die Windmühle', 'Auf dem Hügel dreht sich eine alte Windmühle. Der Müller fragt dich nach dem Wind.', 'luft', 'luft', { xp: 20 }, { xp: 5 }),
      rest('Der Dorfbrunnen', 'Am Dorfbrunnen trinkst du frisches Wasser und ruhst dich aus.'),
      dil('Der tropfende Wasserhahn', 'Im Waschraum der Schule tropft ein Wasserhahn. Deine Freundin sagt: „Das sind doch nur Tropfen.“', [
        ['Ich drehe ihn fest zu.', 'Es tropft langsamer, aber es tropft weiter.', 'Wer kann einen kaputten Wasserhahn reparieren?'],
        ['Ich sage es dem Hausmeister.', 'Er wechselt eine Dichtung. Jetzt tropft nichts mehr.', 'Warum lohnt es sich, auch kleine Dinge zu melden?'],
        ['Ich lasse ihn tropfen.', 'Am nächsten Morgen ist unter dem Hahn ein ganzer Eimer voll Wasser verloren.', 'Wie viel Wasser kann in einer Nacht verloren gehen?']]),
      dil('Die Sonnencreme', 'Am Badesee will Ben keine Sonnencreme: „Die klebt so.“ Die Sonne scheint sehr stark.', [
        ['Ich leihe ihm mein T-Shirt.', 'Ben zieht es an. Sein Rücken bleibt geschützt.', 'Was schützt außer Sonnencreme noch vor Sonne?'],
        ['Wir setzen uns in den Schatten.', 'Unter dem Baum ist es kühler. Ihr baut dort eine Sandburg.', 'Wann ist die Sonne am stärksten?'],
        ['Ich sage nichts.', 'Abends hat Ben einen roten, brennenden Rücken.', 'Wie hättest du Ben helfen können?']]),
    ] });
  NA.gen = naGen(NA);

  K.MODES.koerper1 = KO; K.MODES.jahr1 = JA; K.MODES.baeume2 = BA; K.MODES.tiere2 = TI; K.MODES.natur2 = NA;
  return { WX, SEASONS, DAYTIMES, MONTHS, DAYS, WEAR, HEALTHY, SWEET, LAUB, NADEL, FRUITS, SPRING, OBST, OBST_ART, BIRDS, BIRD_TRAITS, SMALL_LIST, GHS, SOLVE, SHINE, AIR,
    HAENDE, ZAEHNE, NOTRUF, TAG, QUEREN, KEIM, BLUETE, SAEN, NEST, STORCH, laborSet, thermoSVG, timeName };
})();
if (typeof module !== 'undefined') module.exports = MSK12;
