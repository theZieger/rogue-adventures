// Sachkunde Klasse 3 (Lehrplan Sachsen, Lernbereiche 3–5): Kornkammer, Wetterstation, Kompass und Karte.
// Registers its units in MK.MODES; app.js picks them up from there.
const MS = (() => {
  const K = typeof MK !== 'undefined' ? MK : require('./knowledge.js');
  const { shuffle, pick, rnd, weightedPick } = K;
  const NS = 'xmlns="http://www.w3.org/2000/svg"';
  const STROKE = '#1C2541';
  const txt = (x, y, s, o) => `<text x="${x}" y="${y}" font-size="${(o && o.size) || 12}" font-weight="700" text-anchor="${(o && o.anchor) || 'middle'}" fill="${(o && o.fill) || STROKE}">${s}</text>`;
  const minus = (n) => (n < 0 ? '−' + Math.abs(n) : String(n));
  const choice = (mod, note, q, answer, wrongs, qid, extra) => Object.assign({ kind: 'choice', mod, tier: 1, group: mod + ':1', note, q, options: shuffle([answer].concat(wrongs)), answer, qid, cols: 1 }, extra || {});

  /* ---------- Pflanzen-Bilder (gleiche Schnittstelle wie potatoSVG: highlight, clickable, labels, step) ---------- */
  function partsSVG(P, opts, body, labels) {
    opts = opts || {}; const step = opts.step || 99;
    const g = (id, inner) => (step >= (P.stepOf[id] || 1) ? `<g data-part="${id}" class="part${opts.highlight === id ? ' glow' : ''}" ${opts.clickable ? `tabindex="0" role="button" aria-label="${P.label} Teil ${P.parts.findIndex((p) => p.id === id) + 1}"` : ''}>${inner}</g>` : '');
    const lab = opts.labels ? labels.filter(([id]) => step >= (P.stepOf[id] || 1)).map(([id, x, y, a]) => `<text class="plabel" x="${x}" y="${y}" text-anchor="${a || 'start'}">${P.parts.find((p) => p.id === id).name}</text>`).join('') : '';
    return `<svg ${NS} class="plant ${opts.clickable ? 'clickable' : ''}" viewBox="${P.box}" aria-label="${P.label}">${body(g)}${lab}</svg>`;
  }

  // Teile der Getreidepflanze (für Lehrkräfte anpassbar): id, name, desc (Notizkarte), tip (Hinweis beim Suchen)
  const GRAIN_PARTS = [
    { id: 'wurzeln', name: 'Wurzeln', desc: 'Halten die Pflanze im Boden fest und holen Wasser aus der Erde.', tip: 'Der Teil ist unter der Erde.' },
    { id: 'halm', name: 'Halm', desc: 'Der lange, hohle Stängel des Getreides.', tip: 'Der Teil verbindet die Wurzeln mit der Ähre.' },
    { id: 'knoten', name: 'Knoten', desc: 'Verdickte Stellen am Halm. Sie machen den Halm fest.', tip: 'Der Teil sitzt am Halm, dort wo die Blätter anfangen.' },
    { id: 'blaetter', name: 'Blätter', desc: 'Lang und schmal. Sie wachsen an den Knoten.', tip: 'Der Teil ist lang, schmal und grün.' },
    { id: 'aehre', name: 'Ähre', desc: 'Sitzt oben am Halm. In ihr wachsen die Körner.', tip: 'Der Teil ist ganz oben am Halm.' },
    { id: 'grannen', name: 'Grannen', desc: 'Lange, feine Borsten an der Ähre.', tip: 'Der Teil sieht aus wie lange Haare an der Ähre.' },
    { id: 'koerner', name: 'Körner', desc: 'Die Früchte des Getreides. Aus ihnen wird Mehl gemahlen.', tip: 'Der Teil ist im Kreis stark vergrößert.' },
  ];
  const GRAIN = { label: 'Getreidepflanze', box: '0 0 260 300', parts: GRAIN_PARTS, qid: 'kp_', note: 'teile',
    stepOf: { wurzeln: 1, halm: 2, knoten: 3, blaetter: 4, aehre: 5, grannen: 6, koerner: 6 },
    steps: ['Zeichne die Erdlinie und darunter die Wurzeln.', 'Zeichne den langen Halm nach oben.', 'Setze drei Knoten auf den Halm.', 'Zeichne an jeden Knoten ein langes, schmales Blatt.', 'Zeichne oben die Ähre mit den Körnern.', 'Zeichne die Grannen an die Ähre und daneben ein Korn, stark vergrößert.'],
    ask: () => 'Wie heißt der leuchtende Teil?', find: (p) => `Tippe auf: ${p.name}` };
  const grainSpike = (g) => { let k = '', a = ''; for (let i = 0; i < 6; i++) { const y = 72 - i * 8; k += `<ellipse cx="115" cy="${y}" rx="5.5" ry="7" fill="#E2B84A" stroke="#A07A1E" stroke-width="1.5"/><ellipse cx="127" cy="${y - 4}" rx="5.5" ry="7" fill="#E2B84A" stroke="#A07A1E" stroke-width="1.5"/>`; a += `<path d="M112 ${y - 5} L99 ${y - 32} M130 ${y - 9} L143 ${y - 36}"/>`; } return g('aehre', `<path d="M121 80 L121 26" stroke="#A07A1E" stroke-width="2"/>${k}`) + g('grannen', `<g stroke="#C9A227" stroke-width="1.6" fill="none" stroke-linecap="round">${a}</g>`); };
  GRAIN.svg = (opts) => partsSVG(GRAIN, opts, (g) => `
    <rect x="0" y="230" width="260" height="70" fill="#8B5E3C" opacity=".35"/><line x1="0" y1="230" x2="260" y2="230" stroke="#6B4423" stroke-width="3" stroke-dasharray="6 4"/>
    ${g('wurzeln', `<path d="M120 230 Q104 252 92 280 M120 230 Q112 258 108 290 M120 232 Q128 260 126 292 M120 230 Q138 254 150 282 M120 232 Q100 244 84 252 M120 232 Q142 244 158 250" stroke="#C7A27A" stroke-width="2.5" fill="none" stroke-linecap="round"/><path class="hitarea" d="M80 232 L162 232 L162 295 L80 295 Z" fill="transparent"/>`)}
    ${g('halm', `<path d="M120 230 Q118 150 121 80" stroke="#B5C95A" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M120 230 Q118 150 121 80" stroke="#7E9A2F" stroke-width="1.5" fill="none"/>`)}
    ${g('blaetter', `<g fill="#7CB342" stroke="#4E7A1E" stroke-width="1.5"><path d="M119 196 Q86 172 46 170 Q88 184 119 202 Z"/><path d="M120 156 Q154 132 194 130 Q154 146 120 162 Z"/><path d="M120 118 Q90 96 56 90 Q92 106 120 124 Z"/></g>`)}
    ${g('knoten', `<g fill="#6E8B2F" stroke="#4E6420" stroke-width="1.5"><ellipse cx="119" cy="198" rx="7" ry="4"/><ellipse cx="120" cy="158" rx="7" ry="4"/><ellipse cx="120" cy="120" rx="7" ry="4"/></g>`)}
    ${grainSpike(g)}
    ${g('koerner', `<path d="M132 50 L180 54" stroke="${STROKE}" stroke-width="1.5" stroke-dasharray="4 3"/><circle cx="210" cy="58" r="30" fill="#FFF8E1" stroke="${STROKE}" stroke-width="2.5"/><g fill="#E2B84A" stroke="#A07A1E" stroke-width="2"><ellipse cx="200" cy="58" rx="9" ry="15" transform="rotate(-15 200 58)"/><ellipse cx="221" cy="60" rx="9" ry="15" transform="rotate(15 221 60)"/></g><path d="M199 46 Q197 58 201 70 M222 48 Q224 60 220 72" stroke="#A07A1E" stroke-width="1.5" fill="none"/>`)}`,
  [['wurzeln', 160, 286], ['halm', 128, 184], ['knoten', 132, 210], ['blaetter', 6, 160], ['aehre', 92, 62, 'end'], ['grannen', 96, 14, 'end'], ['koerner', 210, 106, 'middle']]);

  // Wasserkreislauf: Stellen 1–5, beschriftbar wie eine Pflanze
  const CYCLE_PARTS = [
    { id: 'verdunsten', name: 'Wasser verdunstet', desc: 'Die Sonne erwärmt das Wasser im Meer, in Seen und Flüssen. Es verdunstet und steigt als unsichtbarer Wasserdampf auf.', tip: 'Schau, wo die Sonne auf das Meer scheint.' },
    { id: 'wolken', name: 'Wolken entstehen', desc: 'Oben ist die Luft kalt. Der Wasserdampf kondensiert zu winzigen Tröpfchen: Es entstehen Wolken.', tip: 'Schau in den Himmel über dem Meer.' },
    { id: 'wind', name: 'Der Wind treibt die Wolken', desc: 'Der Wind treibt die Wolken über das Land.', tip: 'Schau auf die Pfeile zwischen den Wolken.' },
    { id: 'regen', name: 'Es regnet', desc: 'Die Tröpfchen werden größer und schwerer. Sie fallen als Regen oder, wenn es kalt ist, als Schnee.', tip: 'Schau auf die dunkle Wolke über dem Berg.' },
    { id: 'fluss', name: 'Flüsse fließen ins Meer', desc: 'Das Wasser versickert im Boden oder fließt in Bächen und Flüssen zurück ins Meer. Dann beginnt alles von vorn.', tip: 'Schau auf das blaue Band zwischen Berg und Meer.' },
  ];
  const num = (n, x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="#fff" stroke="${STROKE}" stroke-width="2"/>${txt(x, y + 5, n, { size: 14 })}`;
  const cloud = (x, y, s, fill) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill || '#fff'}" stroke="#7A8AA8" stroke-width="2"><path d="M-26 8 Q-34 -4 -20 -8 Q-18 -22 -2 -18 Q8 -28 20 -14 Q34 -14 30 2 Q36 10 24 12 L-22 12 Q-32 12 -26 8 Z"/></g>`;
  const CYCLE = { label: 'Wasserkreislauf', box: '0 0 300 220', parts: CYCLE_PARTS, stepOf: {},
    ask: (p) => `Was passiert bei Nummer ${CYCLE_PARTS.indexOf(p) + 1}?`, find: (p) => `Tippe auf die Stelle: ${p.name}` };
  CYCLE.svg = (opts) => partsSVG(CYCLE, opts, (g) => `
    <rect width="300" height="220" fill="#E3F2FD"/><circle cx="34" cy="32" r="18" fill="#FFD54F" stroke="#F0A800" stroke-width="2"/>
    <path d="M180 220 L230 70 L262 120 L300 90 L300 220 Z" fill="#8D9E6B" stroke="#5E6E44" stroke-width="2"/><path d="M222 94 L230 70 L240 86 Z" fill="#fff"/>
    <path d="M0 176 Q40 170 80 176 T150 178 L170 220 L0 220 Z" fill="#3F8FD8" stroke="#2A6CB0" stroke-width="2"/>
    ${g('verdunsten', `<g stroke="#5B8FC9" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-dasharray="4 4"><path d="M40 166 Q34 146 42 128 Q50 112 44 96"/><path d="M80 166 Q74 146 82 128 Q90 112 84 96"/><path d="M120 166 Q114 146 122 128 Q130 112 124 96"/></g><path d="M38 100 L44 90 L50 100 M78 100 L84 90 L90 100 M118 100 L124 90 L130 100" stroke="#5B8FC9" stroke-width="2.5" fill="none"/>${num(1, 100, 140)}`)}
    ${g('wolken', `${cloud(84, 60, 1.1)}${num(2, 84, 60)}`)}
    ${g('wind', `<g stroke="${STROKE}" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M126 46 Q150 38 174 44"/><path d="M168 38 L176 44 L168 50"/><path d="M128 64 Q150 58 170 62"/></g>${num(3, 150, 84)}`)}
    ${g('regen', `${cloud(232, 40, 1.15, '#B0BEC5')}<g stroke="#2A6CB0" stroke-width="2.5" stroke-linecap="round"><path d="M214 58 L208 72 M226 58 L220 72 M238 58 L232 72 M250 58 L244 72 M220 78 L214 92 M244 78 L238 92"/></g>${num(4, 276, 66)}`)}
    ${g('fluss', `<path d="M236 112 Q214 136 226 156 Q238 176 196 186 Q170 192 150 186" stroke="#3F8FD8" stroke-width="7" fill="none" stroke-linecap="round"/>${num(5, 250, 150)}`)}`,
  [['verdunsten', 6, 116], ['wolken', 50, 96], ['wind', 120, 24], ['regen', 296, 108, 'end'], ['fluss', 296, 210, 'end']]);
  const PLANTS = { getreide: GRAIN, kreislauf: CYCLE };

  function plantTask(cfg, plantKey, mod, tier, know, seq) {
    const P = PLANTS[plantKey]; const e = weightedPick(cfg.pool.filter((x) => x.mod === mod), know, seq); const part = P.parts.find((p) => p.id === e.part);
    if (tier >= 2) return { kind: 'parts-find', mod, tier: 2, group: mod + ':2', note: e.g, plant: plantKey, q: P.find(part), part: part.id, answer: part.name, qid: e.id + '_find' };
    const options = shuffle(shuffle(P.parts.filter((p) => p.id !== part.id)).slice(0, 3).map((p) => p.name).concat([part.name]));
    return { kind: 'parts', mod, tier: 1, group: mod + ':1', note: e.g, plant: plantKey, q: P.ask(part), part: part.id, options, answer: part.name, qid: e.id };
  }
  const partPool = (plantKey, mod, g, prefix) => PLANTS[plantKey].parts.map((p) => ({ id: prefix + p.id, mod, g, part: p.id, plant: plantKey, q: plantKey === 'kreislauf' ? 'Was passiert an dieser Stelle im Wasserkreislauf?' : 'Wie heißt dieser Teil der Getreidepflanze?', a: p.name }));
  // the topic filter (events) asks the pool; generated pictures only without a topic
  const wantsPool = (cfg, mod, opts) => !!(opts && opts.g && cfg.pool.some((p) => p.mod === mod && p.g === opts.g));
  const orderTask = (mod, group, note, q, src, qid) => { const idx = shuffle(src.map((_, i) => i)).slice(0, 4).sort((a, b) => a - b); const items = idx.map((i) => src[i]); return { kind: 'order', mod, tier: 1, group, note, q, items, order: items.map((x) => x.id), display: shuffle(items), qid: qid + idx.join('') }; };

  /* ================= DIE KORNKAMMER (LB 3) ================= */
  // Ähren-Bilder: Weizen dicht ohne lange Grannen, Roggen schmal mit Grannen, Gerste mit sehr langen Grannen und geneigt, Hafer als Rispe, Mais als Kolben
  const CEREALS = [
    { id: 'weizen', name: 'Weizen', stand: 'Ähre' }, { id: 'roggen', name: 'Roggen', stand: 'Ähre' }, { id: 'gerste', name: 'Gerste', stand: 'Ähre' },
    { id: 'hafer', name: 'Hafer', stand: 'Rispe' }, { id: 'mais', name: 'Mais', stand: 'Kolben' },
  ];
  function earSVG(id) {
    const grain = (x, y, rx, ry, rot) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="#E2B84A" stroke="#A07A1E" stroke-width="1.5"/>`;
    const spike = (rows, rx, ry, gap, awn, w) => { let s = '', a = ''; for (let i = 0; i < rows; i++) { const y = 120 - i * gap; s += grain(60 - w, y, rx, ry, -12) + grain(60 + w, y - gap / 2, rx, ry, 12); if (awn) a += `<path d="M${60 - w - 2} ${y - ry} L${60 - w - 10} ${y - ry - awn} M${60 + w + 2} ${y - gap / 2 - ry} L${60 + w + 10} ${y - gap / 2 - ry - awn}"/>`; } return `<g stroke="#C9A227" stroke-width="1.5" fill="none" stroke-linecap="round">${a}</g><path d="M60 132 L60 ${120 - rows * gap}" stroke="#A07A1E" stroke-width="2"/>${s}`; };
    const stalk = '<path d="M60 200 L60 128" stroke="#B5C95A" stroke-width="5" stroke-linecap="round"/>';
    let art;
    if (id === 'weizen') art = stalk + spike(7, 6.5, 8, 11, 4, 6);
    else if (id === 'roggen') art = stalk + spike(10, 4.5, 7, 9, 18, 4.5);
    else if (id === 'gerste') art = `<path d="M60 200 Q60 150 66 128" stroke="#B5C95A" stroke-width="5" fill="none" stroke-linecap="round"/><g transform="rotate(35 64 130)">${spike(8, 5, 7, 9, 48, 4.5)}</g>`;
    else if (id === 'hafer') { let s = '<path d="M60 200 L60 40" stroke="#B5C95A" stroke-width="4" stroke-linecap="round"/>'; for (let i = 0; i < 5; i++) { const y = 56 + i * 22, d = i % 2 ? 1 : -1, x2 = 60 + d * (26 + i * 3); s += `<path d="M60 ${y} Q${60 + d * 14} ${y - 6} ${x2} ${y + 6}" stroke="#9DB04A" stroke-width="2" fill="none"/><path d="M${x2} ${y + 6} L${x2} ${y + 20}" stroke="#9DB04A" stroke-width="1.5"/>${grain(x2, y + 24, 4, 8, 0)}`; } art = s; }
    else art = `<path d="M60 210 L60 150" stroke="#7CB342" stroke-width="7" stroke-linecap="round"/><rect x="42" y="50" width="36" height="110" rx="18" fill="#F6C83B" stroke="#C99A12" stroke-width="2"/>${Array.from({ length: 9 }, (_, i) => `<path d="M44 ${64 + i * 11} L76 ${64 + i * 11}" stroke="#C99A12" stroke-width="1.2"/>`).join('')}<path d="M60 168 Q30 130 34 70 Q44 120 56 150 Z M60 168 Q92 130 86 74 Q76 120 64 150 Z" fill="#8BC34A" stroke="#4E7A1E" stroke-width="2"/><path d="M60 50 Q56 34 50 26 M60 50 Q62 32 70 24" stroke="#B5651D" stroke-width="2" fill="none"/>`;
    return `<svg ${NS} class="pic" viewBox="0 0 120 210" style="max-width:150px" aria-label="Bild eines Getreides">${art}</svg>`;
  }
  const BROT = [
    { id: 'b1', text: 'Der Bauer pflügt das Feld und sät die Körner.' },
    { id: 'b2', text: 'Aus den Körnern wachsen Halme mit Ähren.' },
    { id: 'b3', text: 'Im Sommer werden die Ähren reif und gelb.' },
    { id: 'b4', text: 'Der Mähdrescher mäht das Getreide und drischt die Körner aus.' },
    { id: 'b5', text: 'In der Mühle werden die Körner zu Mehl gemahlen.' },
    { id: 'b6', text: 'Der Bäcker knetet aus Mehl, Wasser, Salz und Hefe oder Sauerteig einen Teig.' },
    { id: 'b7', text: 'Der Teig geht auf und wird im Ofen gebacken.' },
    { id: 'b8', text: 'Das frische Brot wird verkauft und gegessen.' },
  ];
  const KO_NOTES = {
    teile: { title: 'Die Teile der Getreidepflanze', lines: GRAIN_PARTS.map((p) => `${p.name}: ${p.desc}`) },
    arten: { title: 'Getreidearten', lines: ['Getreide sind Gräser. Wir essen ihre Körner.', 'Weizen: dichte Ähre, meist ohne lange Grannen. Daraus werden helle Brötchen, Kuchen und Nudeln.', 'Roggen: lange, schmale Ähre mit Grannen und ein sehr langer Halm. Daraus wird dunkles Brot.', 'Gerste: Ähre mit sehr langen Grannen, die sich bei Reife nach unten neigt.', 'Hafer: keine Ähre, sondern eine Rispe. Die Körner hängen an feinen Stielen.', 'Mais: Die Körner sitzen an einem Kolben. Mais kommt aus Amerika.'] },
    brot: { title: 'Vom Korn zum Brot', lines: BROT.map((b, i) => `${i + 1}. ${b.text}`).concat(['Nach dem Dreschen bleibt Stroh übrig: die trockenen Halme. Es kommt als Einstreu in den Stall.']) },
    nutzen: { title: 'Was aus Getreide wird', lines: ['Weizen: Weißbrot, Brötchen, Kuchen, Nudeln, Grieß.', 'Roggen: dunkles, kräftiges Brot.', 'Gerste: Malz, zum Beispiel für Malzkaffee, Graupen und Tierfutter.', 'Hafer: Haferflocken und Futter für Pferde.', 'Mais: Popcorn, Cornflakes und Tierfutter.'] },
    wert: { title: 'Brot ist wertvoll', lines: ['In jedem Brot steckt die Arbeit von Bauern, Müllern und Bäckern, dazu Wasser, Land und viel Zeit.', 'Nimm nur so viel, wie du essen kannst.', 'Aus altem Brot werden Semmelbrösel, Brotsuppe oder Arme Ritter.', 'Ist das Mindesthaltbarkeitsdatum vorbei, ist ein Lebensmittel oft noch gut. Schimmeliges Brot gehört aber in den Müll.', 'Im Herbst feiern viele Menschen Erntedank.'] },
  };
  const KO_POOL = partPool('getreide', 'parts', 'teile', 'kp_').concat([
    // Getreidearten
    { id: 'koar1', mod: 'arten', g: 'arten', q: 'Welches Getreide hat statt einer Ähre eine Rispe?', o: ['Hafer', 'Weizen', 'Gerste'], a: 0 },
    { id: 'koar2', mod: 'arten', g: 'arten', q: 'Welches Getreide wächst als Kolben?', o: ['Mais', 'Roggen', 'Hafer'], a: 0 },
    { id: 'koar3', mod: 'arten', g: 'arten', q: 'Welches Getreide hat die längsten Grannen?', o: ['Gerste', 'Weizen', 'Mais'], a: 0 },
    { id: 'koar4', mod: 'arten', g: 'arten', q: 'Welche drei Getreidearten tragen ihre Körner in Ähren?', o: ['Weizen, Roggen und Gerste', 'Hafer, Mais und Weizen', 'Mais, Roggen und Hafer'], a: 0 },
    { id: 'koar5', mod: 'arten', g: 'arten', q: 'Getreide gehört zu den Gräsern.', rf: true, a: true },
    { id: 'koar6', mod: 'arten', g: 'arten', q: 'Mais kommt ursprünglich aus Europa.', rf: true, a: false, why: 'Mais kommt aus Amerika.' },
    { id: 'koar7', mod: 'arten', g: 'arten', q: 'Weizen hat immer sehr lange Grannen.', rf: true, a: false, why: 'Weizen hat meist keine oder nur kurze Grannen. Sehr lange Grannen hat die Gerste.' },
    { id: 'koar8', mod: 'arten', g: 'arten', q: 'Bei welchem Getreide hängen die Körner an feinen Stielen?', o: ['Hafer', 'Weizen', 'Roggen'], a: 0 },
    { id: 'koar9', mod: 'arten', g: 'arten', q: 'Bei reifer Gerste neigt sich die Ähre nach unten.', rf: true, a: true },
    { id: 'koar10', mod: 'arten', g: 'arten', q: 'Welches Getreide hat einen sehr langen Halm und eine schmale Ähre mit Grannen?', o: ['Roggen', 'Mais', 'Hafer'], a: 0 },
    { id: 'koar11', mod: 'arten', g: 'arten', q: 'Was sind Weizen, Roggen, Gerste, Hafer und Mais?', o: ['Getreidearten', 'Gemüsesorten', 'Obstbäume'], a: 0 },
    { id: 'koar12', mod: 'arten', g: 'teile', q: 'Wie heißen die langen, feinen Borsten an der Ähre?', o: ['Grannen', 'Knoten', 'Halme'], a: 0 },
    { id: 'koar13', mod: 'arten', g: 'teile', q: 'Der Halm des Getreides ist innen hohl.', rf: true, a: true },
    // Vom Korn zum Brot
    { id: 'kobr1', mod: 'brot', g: 'brot', q: 'Welche Maschine erntet das Getreide?', o: ['Der Mähdrescher', 'Der Kartoffelroder', 'Der Bagger'], a: 0 },
    { id: 'kobr2', mod: 'brot', g: 'brot', q: 'Was macht der Mähdrescher?', o: ['Er mäht das Getreide und trennt die Körner vom Halm', 'Er backt Brot', 'Er mahlt Mehl'], a: 0 },
    { id: 'kobr3', mod: 'brot', g: 'brot', q: 'Wo werden die Körner zu Mehl gemahlen?', o: ['In der Mühle', 'In der Bäckerei', 'Im Stall'], a: 0 },
    { id: 'kobr4', mod: 'brot', g: 'brot', q: 'Was braucht der Bäcker für einen Brotteig?', o: ['Mehl, Wasser, Salz und Hefe oder Sauerteig', 'Zucker, Milch und Kakao', 'Kartoffeln und Butter'], a: 0 },
    { id: 'kobr5', mod: 'brot', g: 'brot', q: 'Für Vollkornmehl wird das ganze Korn mit der Schale gemahlen.', rf: true, a: true },
    { id: 'kobr6', mod: 'brot', g: 'brot', q: 'Wie heißen die trockenen Halme, die nach dem Dreschen übrig bleiben?', o: ['Stroh', 'Heu', 'Mehl'], a: 0 },
    { id: 'kobr7', mod: 'brot', g: 'brot', q: 'Getreide wird bei uns im Winter geerntet.', rf: true, a: false, why: 'Getreide wird im Sommer geerntet.' },
    { id: 'kobr8', mod: 'brot', g: 'brot', q: 'Wann wird Wintergetreide gesät?', o: ['Im Herbst', 'Im Sommer', 'Im Juli'], a: 0 },
    { id: 'kobr9', mod: 'brot', g: 'brot', q: 'Wofür braucht man das Stroh?', o: ['Als Einstreu im Stall', 'Zum Brotbacken', 'Als Saatgut'], a: 0 },
    { id: 'kobr10', mod: 'brot', g: 'brot', q: 'Was macht der Teig, wenn Hefe oder Sauerteig darin ist?', o: ['Er geht auf und wird locker', 'Er wird hart wie Stein', 'Er wird grün'], a: 0 },
    { id: 'kobr11', mod: 'brot', g: 'brot', q: 'Wie nennt man das Trennen der Körner von Halm und Ähre?', o: ['Dreschen', 'Mahlen', 'Kneten'], a: 0 },
    { id: 'kobr12', mod: 'brot', g: 'brot', q: 'Wann ist bei uns Getreideernte?', o: ['Im Sommer', 'Im Winter', 'Im Frühling'], a: 0 },
    // Verwendung
    { id: 'konu1', mod: 'nutzen', g: 'nutzen', q: 'Aus welchem Getreide macht man Haferflocken?', o: ['Hafer', 'Mais', 'Roggen'], a: 0 },
    { id: 'konu2', mod: 'nutzen', g: 'nutzen', q: 'Aus welchem Getreide macht man Popcorn?', o: ['Mais', 'Weizen', 'Gerste'], a: 0 },
    { id: 'konu3', mod: 'nutzen', g: 'nutzen', q: 'Woraus wird Malz gemacht, zum Beispiel für Malzkaffee?', o: ['Aus Gerste', 'Aus Mais', 'Aus Hafer'], a: 0 },
    { id: 'konu4', mod: 'nutzen', g: 'nutzen', q: 'Aus welchem Getreide backt man dunkles, kräftiges Brot?', o: ['Roggen', 'Mais', 'Hafer'], a: 0 },
    { id: 'konu5', mod: 'nutzen', g: 'nutzen', q: 'Aus welchem Mehl backt man meistens helle Brötchen und Kuchen?', o: ['Weizenmehl', 'Roggenmehl', 'Maismehl'], a: 0 },
    { id: 'konu6', mod: 'nutzen', g: 'nutzen', q: 'Woraus werden Nudeln meistens gemacht?', o: ['Aus Weizen', 'Aus Hafer', 'Aus Roggen'], a: 0 },
    { id: 'konu7', mod: 'nutzen', g: 'nutzen', q: 'Welches Getreide ist ein bekanntes Futter für Pferde?', o: ['Hafer', 'Reis', 'Kakao'], a: 0 },
    { id: 'konu8', mod: 'nutzen', g: 'nutzen', q: 'Woraus macht man Cornflakes?', o: ['Aus Mais', 'Aus Gerste', 'Aus Roggen'], a: 0 },
    { id: 'konu9', mod: 'nutzen', g: 'nutzen', q: 'Viele Bauern füttern ihre Tiere mit Getreide.', rf: true, a: true },
    { id: 'konu10', mod: 'nutzen', g: 'nutzen', q: 'Aus Getreide kann man nur Brot machen.', rf: true, a: false, why: 'Auch Nudeln, Flocken, Grieß, Kuchen und Tierfutter.' },
    { id: 'konu11', mod: 'nutzen', g: 'nutzen', q: 'Was wird nicht aus Getreide gemacht?', o: ['Kartoffelbrei', 'Haferflocken', 'Nudeln'], a: 0 },
    { id: 'konu12', mod: 'nutzen', g: 'nutzen', q: 'Was ist Grieß?', o: ['Grob gemahlene Getreidekörner', 'Getrocknetes Gras', 'Gemahlener Zucker'], a: 0 },
    // Wertschätzung
    { id: 'kowe1', mod: 'wert', g: 'wert', q: 'Altes, trockenes Brot muss man sofort wegwerfen.', rf: true, a: false, why: 'Daraus werden zum Beispiel Semmelbrösel, Brotsuppe oder Arme Ritter.' },
    { id: 'kowe2', mod: 'wert', g: 'wert', q: 'In einem Brot steckt die Arbeit von Bauern, Müllern und Bäckern.', rf: true, a: true },
    { id: 'kowe3', mod: 'wert', g: 'wert', q: 'Was kannst du tun, damit weniger Essen im Müll landet?', o: ['Nur so viel auf den Teller nehmen, wie du essen kannst', 'Immer den ganzen Topf auf den Teller füllen', 'Brot offen im Regen liegen lassen'], a: 0 },
    { id: 'kowe4', mod: 'wert', g: 'wert', q: 'Was kann man aus altem Brot noch machen?', o: ['Semmelbrösel', 'Haferflocken', 'Popcorn'], a: 0 },
    { id: 'kowe5', mod: 'wert', g: 'wert', q: 'Ist das Mindesthaltbarkeitsdatum vorbei, ist ein Lebensmittel oft noch gut.', rf: true, a: true },
    { id: 'kowe6', mod: 'wert', g: 'wert', q: 'Wo bleibt Brot länger frisch?', o: ['Im Brotkasten', 'Offen auf der Heizung', 'In einem Glas Wasser'], a: 0 },
    { id: 'kowe7', mod: 'wert', g: 'wert', q: 'Welches Fest feiern viele Menschen im Herbst als Dank für die Ernte?', o: ['Erntedankfest', 'Fasching', 'Silvester'], a: 0 },
    { id: 'kowe8', mod: 'wert', g: 'wert', q: 'Schimmeliges Brot kann man essen, wenn man den Schimmel abkratzt.', rf: true, a: false, why: 'Schimmel kann giftig sein. Schimmeliges Brot gehört in den Müll.' },
    { id: 'kowe9', mod: 'wert', g: 'wert', q: 'Warum ist es schade, Essen wegzuwerfen?', o: ['Viel Arbeit, Wasser und Land stecken darin', 'Weil der Müll sonst zu leicht ist', 'Weil Essen nie schlecht wird'], a: 0 },
    { id: 'kowe10', mod: 'wert', g: 'wert', q: 'Alle Menschen auf der Welt haben jeden Tag genug zu essen.', rf: true, a: false, why: 'Viele Menschen auf der Welt haben nicht genug zu essen.' },
    // Lückentext
    { id: 'kolt1', mod: 'lt', g: 'arten', q: 'Getreide gehört zu den ___.', o: ['Gräsern', 'Bäumen', 'Pilzen'], a: 0 },
    { id: 'kolt2', mod: 'lt', g: 'teile', q: 'Der lange, hohle Stängel des Getreides heißt ___.', o: ['Halm', 'Ast', 'Wurzel'], a: 0 },
    { id: 'kolt3', mod: 'lt', g: 'teile', q: 'Die verdickten Stellen am Halm heißen ___.', o: ['Knoten', 'Knospen', 'Knollen'], a: 0 },
    { id: 'kolt4', mod: 'lt', g: 'arten', q: 'Hafer trägt seine Körner in einer ___.', o: ['Rispe', 'Ähre', 'Knolle'], a: 0 },
    { id: 'kolt5', mod: 'lt', g: 'arten', q: 'Die Körner des Maises sitzen an einem ___.', o: ['Kolben', 'Halm', 'Blatt'], a: 0 },
    { id: 'kolt6', mod: 'lt', g: 'teile', q: 'Die langen Borsten an der Ähre heißen ___.', o: ['Grannen', 'Wurzeln', 'Knoten'], a: 0 },
    { id: 'kolt7', mod: 'lt', g: 'brot', q: 'In der ___ wird das Korn zu Mehl gemahlen.', o: ['Mühle', 'Bäckerei', 'Scheune'], a: 0 },
    { id: 'kolt8', mod: 'lt', g: 'brot', q: 'Der ___ backt aus Mehl, Wasser, Salz und Hefe ein Brot.', o: ['Bäcker', 'Müller', 'Bauer'], a: 0 },
    { id: 'kolt9', mod: 'lt', g: 'brot', q: 'Der ___ erntet das Getreide und drischt die Körner aus.', o: ['Mähdrescher', 'Traktor', 'Kartoffelroder'], a: 0 },
    { id: 'kolt10', mod: 'lt', g: 'brot', q: 'Nach dem Dreschen bleibt das ___ auf dem Feld liegen.', o: ['Stroh', 'Mehl', 'Brot'], a: 0 },
    { id: 'kolt11', mod: 'lt', g: 'nutzen', q: 'Aus ___ macht man Haferflocken.', o: ['Hafer', 'Mais', 'Roggen'], a: 0 },
    { id: 'kolt12', mod: 'lt', g: 'nutzen', q: 'Brot aus ___ ist dunkel und kräftig.', o: ['Roggen', 'Weizen', 'Mais'], a: 0 },
  ]);
  const KO_MODULES = {
    parts: { name: 'Teile benennen', icon: '🌾', maxTier: 2, worldCap: [2], dmg: 12 },
    arten: { name: 'Getreidearten', icon: '🌽', maxTier: 1, worldCap: [1], dmg: 12 },
    brot: { name: 'Vom Korn zum Brot', icon: '🍞', maxTier: 1, worldCap: [1], dmg: 16 },
    nutzen: { name: 'Was daraus wird', icon: '🥣', maxTier: 1, worldCap: [1], dmg: 12 },
    wert: { name: 'Brot ist wertvoll', icon: '🧺', maxTier: 1, worldCap: [1], dmg: 10 },
    lt: { name: 'Lückentext', icon: '✏️', maxTier: 1, worldCap: [1], dmg: 12 },
  };
  const KO_TUT = {
    'parts:1': { title: 'Teile benennen', steps: ['Ein Teil der Getreidepflanze leuchtet gelb.', 'Von unten nach oben: Wurzeln, Halm mit Knoten, Blätter, Ähre mit Grannen. Im Kreis siehst du ein Korn ganz groß.', 'Tippe auf den richtigen Namen.'] },
    'parts:2': { title: 'Teile finden', steps: ['Jetzt andersherum: Oben steht ein Name.', 'Tippe direkt auf diesen Teil der Pflanze.', 'Die Körner findest du im Kreis neben der Ähre.'] },
    'arten:1': { title: 'Getreidearten', steps: ['Manchmal siehst du ein Bild: Welches Getreide ist das?', 'Weizen hat eine dichte Ähre, Roggen eine schmale mit Grannen, Gerste sehr lange Grannen. Hafer hat eine Rispe, Mais einen Kolben.', 'Tippe auf die richtige Antwort.'] },
    'brot:1': { title: 'Vom Korn zum Brot', steps: ['Fragen zu Ernte, Mühle und Bäckerei.', 'Überlege, wer was macht: Bauer, Mähdrescher, Müller, Bäcker.', 'Tippe auf die richtige Antwort.'] },
    'brotord:1': { title: 'Vom Korn zum Brot ordnen', steps: ['Die Schritte sind durcheinander.', 'Tippe sie der Reihe nach an: Es beginnt auf dem Feld und endet beim Brot.', 'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.'] },
    'nutzen:1': { title: 'Was daraus wird', steps: ['Aus jedem Getreide wird etwas anderes gemacht.', 'Weizen: Brötchen und Nudeln. Roggen: dunkles Brot. Gerste: Malz. Hafer: Flocken. Mais: Popcorn.', 'Tippe auf die richtige Antwort.'] },
    'wert:1': { title: 'Brot ist wertvoll', steps: ['Fragen dazu, wie man mit Essen gut umgeht.', 'Manchmal musst du „Richtig“ oder „Falsch“ wählen, manchmal eine von drei Antworten.', 'Lies genau – oft ist nur ein Wort anders.'] },
    'lt:1': { title: 'Lückentext', steps: ['Im Satz fehlt ein Wort (___).', 'Lies den Satz mit jedem Wort einmal durch.', 'Tippe auf das Wort, das passt.'] },
  };
  function koGen(cfg) {
    return (mod, tier, know, seq, opts) => {
      if (mod === 'parts') return plantTask(cfg, 'getreide', mod, tier, know, seq);
      if (wantsPool(cfg, mod, opts)) return null;
      if (mod === 'arten' && Math.random() < 0.5) {
        const c = pick(CEREALS);
        if (Math.random() < 0.6) return choice(mod, 'arten', 'Welches Getreide ist das?', c.name, shuffle(CEREALS.filter((x) => x !== c)).slice(0, 2).map((x) => x.name), 'kobild_' + c.id, { pic: earSVG(c.id) });
        return choice(mod, 'arten', `So wächst ${c.name}. Wie heißt das, woran die Körner sitzen?`, c.stand, ['Ähre', 'Rispe', 'Kolben'].filter((x) => x !== c.stand), 'kostand_' + c.id, { pic: earSVG(c.id) });
      }
      if (mod === 'brot' && Math.random() < 0.5) return orderTask(mod, 'brotord:1', 'brot', 'Vom Korn zum Brot: Tippe die Schritte der Reihe nach an.', BROT, 'kobrot_');
      return null;
    };
  }
  const KO = { modules: KO_MODULES, tut: KO_TUT, notes: KO_NOTES, pool: KO_POOL, worlds: 1, title: 'Die Kornkammer', icon: '🌾', sub: 'Getreidearten, Getreidepflanze, vom Korn zum Brot', school: 'getreide',
    starters: [{ id: 'muellerin', type: 'normal', shape: 'muellerin', names: ['Die Müllerin', 'Die Müllerin', 'Die Müllerin'], hp: 70, desc: 'Sie mahlt in der Wassermühle aus Korn das Mehl für das ganze Dorf.', perk: 'heal',
      attacks: [{ name: 'Sichel', mod: 'parts' }, { name: 'Dreschflegel', mod: 'arten' }, { name: 'Mühlrad', mod: 'brot' }, { name: 'Mehlsack', mod: 'nutzen' }] }],
    extra: { parts: 'Ährenkranz', arten: 'Saatkorn', brot: 'Mahlstein', nutzen: 'Vorratskammer', wert: 'Erntekrone', lt: 'Kornsieb' },
    enemies: { 1: {
      normal: [
        { name: 'Kornkäfer', type: 'normal', shape: 'beetle', hp: 26, atk: 3 },
        { name: 'Feldmaus', type: 'normal', shape: 'fox', hp: 24, atk: 4 },
        { name: 'Mehlmotte', type: 'normal', shape: 'bat', hp: 28, atk: 4 },
        { name: 'Getreiderost', type: 'feuer', shape: 'blob', hp: 30, atk: 3 },
      ],
      elite: { name: 'Mutterkorn', type: 'normal', shape: 'jelly', hp: 45, atk: 5 },
      boss: { name: 'Der Kornwolf', acc: 'den Kornwolf', type: 'feuer', shape: 'fox', hp: 70, atk: 6, boss: true },
    } },
    moves: ['Nagezahn', 'Mehlstaub', 'Rostfleck', 'Hagelkorn', 'Halmknick', 'Spelzenregen'],
    events: [
      { title: 'Die Wassermühle', text: 'Der Müller zeigt dir den großen Mühlstein. Beantworte seine Frage zum Brot, dann schenkt er dir einen Trank.', opts: [{ label: 'Antworten', task: 'brot', g: 'brot', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Das Weizenfeld', text: 'Ein Bauer steht am Rand seines Feldes und fragt dich nach den Getreidearten.', opts: [{ label: 'Antworten', task: 'arten', g: 'arten', win: { xp: 20 }, lose: { xp: 5 } }, { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } }] },
      { title: 'Die Backstube', text: 'In der Backstube riecht es nach frischem Brot. Die Bäckerin gibt dir einen Schild, wenn du ihre Frage beantwortest.', opts: [{ label: 'Antworten', task: 'any', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Das Erntedankfest', text: 'Im Dorf wird Erntedank gefeiert. Am Tisch fragt dich eine Frau, wie man gut mit Essen umgeht.', opts: [{ label: 'Antworten', task: 'wert', g: 'wert', win: { item: 'engel' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Kornspeicher', text: 'Der Speicherwart kennt eine Eselsbrücke. Er verrät sie dir für eine richtige Antwort.', opts: [{ label: 'Antworten', task: 'any', win: { item: 'lupe' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Scheune', text: 'In der Scheune liegt frisches Stroh. Hier kannst du dich ausruhen.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
    ] };
  KO.gen = koGen(KO);

  /* ================= DIE WETTERSTATION (LB 4) ================= */
  const STATES = ['fest', 'flüssig', 'gasförmig'];
  // s = Index in STATES
  const WATER = [
    { id: 'eis', label: 'Eis', s: 0, note: 'Eis ist gefrorenes Wasser. Es ist fest und behält seine Form.' },
    { id: 'schnee', label: 'Schnee', s: 0, note: 'Schneeflocken sind winzige Eiskristalle. Schnee ist fest.' },
    { id: 'hagel', label: 'Hagel', s: 0, note: 'Hagelkörner sind Kugeln aus Eis. Hagel ist fest.' },
    { id: 'eiszapfen', label: 'Ein Eiszapfen', s: 0, note: 'Ein Eiszapfen ist gefrorenes Wasser. Er ist fest.' },
    { id: 'raureif', label: 'Raureif', s: 0, note: 'Raureif sind feine Eiskristalle an Ästen und Gräsern. Er ist fest.' },
    { id: 'regen', label: 'Regen', s: 1, note: 'Regentropfen sind flüssiges Wasser.' },
    { id: 'tau', label: 'Tau', s: 1, note: 'Tau sind Wassertropfen, die morgens am Gras hängen. Sie sind flüssig.' },
    { id: 'pfuetze', label: 'Das Wasser in einer Pfütze', s: 1, note: 'Das Wasser in der Pfütze ist flüssig. Es fließt und passt sich jeder Form an.' },
    { id: 'dampf', label: 'Wasserdampf', s: 2, note: 'Wasserdampf ist Wasser als Gas. Man kann ihn nicht sehen.' },
  ];
  const TERMS = [
    { t: 'gefrieren', ex: 'Aus flüssigem Wasser wird festes Eis.', def: 'Flüssiges Wasser wird zu festem Eis' },
    { t: 'schmelzen', ex: 'Aus festem Eis wird flüssiges Wasser.', def: 'Festes Eis wird zu flüssigem Wasser' },
    { t: 'verdampfen', ex: 'Wasser kocht und wird schnell zu Wasserdampf.', def: 'Kochendes Wasser wird schnell zu Wasserdampf' },
    { t: 'verdunsten', ex: 'Wasser wird langsam, ohne zu kochen, zu Wasserdampf.', def: 'Wasser wird langsam, ohne zu kochen, zu Wasserdampf' },
    { t: 'kondensieren', ex: 'Aus Wasserdampf werden wieder Wassertropfen.', def: 'Wasserdampf wird wieder zu flüssigem Wasser' },
  ];
  const term = (t, others) => ({ o: [t].concat(others), a: 0 });
  const WE_NOTES = {
    zustand: { title: 'Wasser hat drei Zustandsformen', lines: ['Fest: Eis, Schnee, Hagel, Raureif.', 'Flüssig: Wasser, Regen, Tau.', 'Gasförmig: Wasserdampf. Man kann ihn nicht sehen.', 'Bei 0 °C gefriert Wasser zu Eis. Bei 100 °C kocht Wasser.'] },
    begriffe: { title: 'Fünf wichtige Wörter', lines: TERMS.map((x) => `${x.t}: ${x.def}.`).concat(['Verdunsten geht langsam, auch ohne Kochen – so trocknet eine Pfütze.']) },
    kreislauf: { title: 'Der Wasserkreislauf', lines: CYCLE_PARTS.map((p, i) => `${i + 1}. ${p.desc}`) },
    wetter: { title: 'Wetter und Wettervorhersage', lines: ['Zum Wetter gehören Temperatur, Niederschlag, Wind und Bewölkung.', 'Die Temperatur misst man mit dem Thermometer in Grad Celsius (°C).', 'Unter 0 °C spricht man von Minusgraden: −3 °C ist kälter als 0 °C.', 'Regen, Schnee und Hagel heißen zusammen Niederschlag. Man misst ihn mit dem Regenmesser.', 'Die Windfahne zeigt, woher der Wind weht. Meteorologen machen die Wettervorhersage.'] },
    regeln: { title: 'Bauernregeln', lines: ['Bauernregeln sind alte Sprüche über das Wetter.', 'Sie beruhen auf Beobachtungen der Bauern, stimmen aber nicht immer.', '„Abendrot – Schönwetterbot’.“ – „Morgenrot – Schlechtwetterbot’.“', '„April, April, der macht, was er will.“', '„Ist der Mai kühl und nass, füllt’s dem Bauern Scheun’ und Fass.“'] },
    schwimmen: { title: 'Schwimmen und Sinken', lines: ['Was leichter ist als gleich viel Wasser, schwimmt.', 'Was schwerer ist als gleich viel Wasser, sinkt.', 'Luft im Inneren hilft beim Schwimmen: Korken, Apfel und Tischtennisball schwimmen.', 'Metall, Glas und Stein sinken.'] },
    zufall: { title: 'Wahrscheinlich oder nicht?', lines: ['Sind in einem Beutel mehr rote als blaue Kugeln, ziehst du wahrscheinlich eine rote.', 'Sicher ist das aber nicht – es kann auch eine blaue kommen.', 'Sind gleich viele rote Kugeln in zwei gleich großen Beuteln, ist die Chance in beiden gleich.'] },
  };
  const WE_POOL = partPool('kreislauf', 'kreislauf', 'kreislauf', 'wk_').concat([
    // Zustandsformen
    { id: 'wezu1', mod: 'zustand', g: 'zustand', q: 'Bei wie viel Grad gefriert Wasser zu Eis?', o: ['0 °C', '100 °C', '20 °C'], a: 0 },
    { id: 'wezu2', mod: 'zustand', g: 'zustand', q: 'Bei wie viel Grad kocht Wasser?', o: ['100 °C', '0 °C', '50 °C'], a: 0 },
    { id: 'wezu3', mod: 'zustand', g: 'zustand', q: 'Wasserdampf kann man gut sehen.', rf: true, a: false, why: 'Wasserdampf ist ein unsichtbares Gas.' },
    { id: 'wezu4', mod: 'zustand', g: 'zustand', q: 'Wie viele Zustandsformen hat Wasser?', o: ['3', '2', '5'], a: 0 },
    { id: 'wezu5', mod: 'zustand', g: 'zustand', q: 'Eis, Wasser und Wasserdampf sind alles Wasser.', rf: true, a: true },
    { id: 'wezu6', mod: 'zustand', g: 'zustand', q: 'Was passt zu flüssigem Wasser?', o: ['Es fließt und passt sich jeder Form an', 'Es behält immer seine Form', 'Es ist unsichtbar'], a: 0 },
    // Begriffe in Alltagssituationen
    { id: 'webe1', mod: 'begriff', g: 'begriffe', q: 'Im Winter wird das Wasser im Teich zu Eis. Wie heißt das?', ...term('gefrieren', ['schmelzen', 'kondensieren']) },
    { id: 'webe2', mod: 'begriff', g: 'begriffe', q: 'Der Schneemann wird in der Sonne zu Wasser. Wie heißt das?', ...term('schmelzen', ['gefrieren', 'verdampfen']) },
    { id: 'webe3', mod: 'begriff', g: 'begriffe', q: 'Das Nudelwasser kocht. Es wird zu Wasserdampf. Wie heißt das?', ...term('verdampfen', ['schmelzen', 'gefrieren']) },
    { id: 'webe4', mod: 'begriff', g: 'begriffe', q: 'Nach dem Regen trocknet die Pfütze in der Sonne. Wie heißt das?', ...term('verdunsten', ['kondensieren', 'gefrieren']) },
    { id: 'webe5', mod: 'begriff', g: 'begriffe', q: 'Nach dem Duschen ist der Spiegel voller kleiner Tropfen. Wie heißt das?', ...term('kondensieren', ['verdunsten', 'schmelzen']) },
    { id: 'webe6', mod: 'begriff', g: 'begriffe', q: 'Die nasse Wäsche trocknet auf der Leine. Wie heißt das?', ...term('verdunsten', ['schmelzen', 'kondensieren']) },
    { id: 'webe7', mod: 'begriff', g: 'begriffe', q: 'Eine kalte Flasche aus dem Kühlschrank wird außen nass. Wie heißt das?', ...term('kondensieren', ['schmelzen', 'verdunsten']) },
    { id: 'webe8', mod: 'begriff', g: 'begriffe', q: 'Die Eiswürfel in der Limonade werden immer kleiner. Wie heißt das?', ...term('schmelzen', ['verdampfen', 'kondensieren']) },
    { id: 'webe9', mod: 'begriff', g: 'begriffe', q: 'Wasser in der Eiswürfelform wird im Gefrierfach hart. Wie heißt das?', ...term('gefrieren', ['verdunsten', 'schmelzen']) },
    { id: 'webe10', mod: 'begriff', g: 'begriffe', q: 'Hoch oben kühlt der Wasserdampf ab, und Wolken entstehen. Wie heißt das?', ...term('kondensieren', ['gefrieren', 'verdampfen']) },
    { id: 'webe11', mod: 'begriff', g: 'begriffe', q: 'Die Sonne erwärmt das Meer, und Wasser steigt unsichtbar in die Luft. Wie heißt das?', ...term('verdunsten', ['schmelzen', 'kondensieren']) },
    { id: 'webe12', mod: 'begriff', g: 'begriffe', q: 'Was bedeutet „kondensieren“?', o: ['Wasserdampf wird wieder zu flüssigem Wasser', 'Eis wird zu Wasser', 'Wasser wird zu Eis'], a: 0 },
    { id: 'webe13', mod: 'begriff', g: 'begriffe', q: 'Was ist der Unterschied zwischen verdampfen und verdunsten?', o: ['Verdampfen geht beim Kochen schnell, verdunsten langsam ohne Kochen', 'Es gibt keinen Unterschied', 'Verdunsten geht nur im Winter'], a: 0 },
    // Wettervorhersage
    { id: 'wewe1', mod: 'vorhersage', g: 'wetter', q: 'Womit misst man die Temperatur?', o: ['Mit dem Thermometer', 'Mit dem Kompass', 'Mit dem Lineal'], a: 0 },
    { id: 'wewe2', mod: 'vorhersage', g: 'wetter', q: 'In welcher Einheit gibt man bei uns die Temperatur an?', o: ['Grad Celsius (°C)', 'Meter (m)', 'Kilogramm (kg)'], a: 0 },
    { id: 'wewe3', mod: 'vorhersage', g: 'wetter', q: 'Wer macht die Wettervorhersage?', o: ['Meteorologen', 'Förster', 'Bäcker'], a: 0 },
    { id: 'wewe4', mod: 'vorhersage', g: 'wetter', q: 'Ein Westwind kommt aus dem Westen.', rf: true, a: true },
    { id: 'wewe5', mod: 'vorhersage', g: 'wetter', q: 'Was gehört zum Wetter?', o: ['Temperatur, Niederschlag, Wind und Bewölkung', 'Nur die Uhrzeit', 'Nur der Wochentag'], a: 0 },
    { id: 'wewe6', mod: 'vorhersage', g: 'wetter', q: '−3 °C ist wärmer als 2 °C.', rf: true, a: false, why: '−3 °C ist kälter als 0 °C und damit auch kälter als 2 °C.' },
    { id: 'wewe7', mod: 'vorhersage', g: 'wetter', q: 'Wie nennt man Regen, Schnee und Hagel zusammen?', o: ['Niederschlag', 'Nebel', 'Bewölkung'], a: 0 },
    { id: 'wewe8', mod: 'vorhersage', g: 'wetter', q: 'Womit misst man, wie viel Regen gefallen ist?', o: ['Mit dem Regenmesser', 'Mit dem Thermometer', 'Mit der Waage'], a: 0 },
    { id: 'wewe9', mod: 'vorhersage', g: 'wetter', q: 'Was zeigt eine Windfahne?', o: ['Woher der Wind weht', 'Wie warm es ist', 'Wie spät es ist'], a: 0 },
    // Bauernregeln
    { id: 'werg1', mod: 'regel', g: 'regeln', q: 'Abendrot – ___.', o: ['Schönwetterbot’', 'Schlechtwetterbot’', 'Schneewetterbot’'], a: 0 },
    { id: 'werg2', mod: 'regel', g: 'regeln', q: 'Morgenrot – ___.', o: ['Schlechtwetterbot’', 'Schönwetterbot’', 'Sonnenscheinbot’'], a: 0 },
    { id: 'werg3', mod: 'regel', g: 'regeln', q: 'April, April, der macht, was er ___.', o: ['will', 'kann', 'soll'], a: 0 },
    { id: 'werg4', mod: 'regel', g: 'regeln', q: 'Ist der Mai kühl und nass, füllt’s dem Bauern Scheun’ und ___.', o: ['Fass', 'Haus', 'Glas'], a: 0 },
    { id: 'werg5', mod: 'regel', g: 'regeln', q: 'Kräht der Hahn auf dem Mist, ändert sich das Wetter oder es bleibt, wie es ___.', o: ['ist', 'war', 'wird'], a: 0 },
    { id: 'werg6', mod: 'regel', g: 'regeln', q: 'Ist der Siebenschläfer nass, regnet’s ohne ___.', o: ['Unterlass', 'Regenschirm', 'Pause'], a: 0 },
    { id: 'werg7', mod: 'regel', g: 'regeln', q: 'Wenn die Schwalben niedrig fliegen, werden wir bald ___ kriegen.', o: ['Regen', 'Sonne', 'Schnee'], a: 0 },
    { id: 'werg8', mod: 'regel', g: 'regeln', q: 'Mairegen bringt ___.', o: ['Segen', 'Schnee', 'Hagel'], a: 0 },
    { id: 'werg9', mod: 'regel', g: 'regeln', q: 'Ist’s zu Lichtmess hell und rein, wird’s ein langer ___ sein.', o: ['Winter', 'Sommer', 'Frühling'], a: 0 },
    { id: 'werg10', mod: 'regel', g: 'regeln', q: 'Gewitter im Mai, singt der Bauer ___.', o: ['Juchhei', 'Ade', 'Hallo'], a: 0 },
    { id: 'werg11', mod: 'regel', g: 'regeln', q: 'Bauernregeln stimmen immer.', rf: true, a: false, why: 'Sie beruhen auf alten Beobachtungen und stimmen nicht immer.' },
    { id: 'werg12', mod: 'regel', g: 'regeln', q: 'Was sagt die Regel „Abendrot – Schönwetterbot’“?', o: ['Ist der Himmel abends rot, wird das Wetter schön', 'Morgens regnet es immer', 'Im Mai ist es kalt'], a: 0 },
  ]);
  // Wettervorhersage-Karte: vier Tage, jedes Symbol höchstens einmal, alle Temperaturen verschieden (sonst wären Fragen mehrdeutig)
  const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const WX = {
    sonne: { range: [12, 28], ask: 'scheint den ganzen Tag die Sonne' }, sonnewolke: { range: [8, 22], ask: 'gibt es Sonne und Wolken' },
    wolke: { range: [3, 16], ask: 'ist der Himmel ganz bedeckt' }, regen: { range: [4, 15], ask: 'regnet es' }, schnee: { range: [-5, 1], ask: 'schneit es' },
  };
  const sun = (x, y, r) => `<g stroke="#F0A800" stroke-width="2.5" stroke-linecap="round">${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<path d="M${(x + Math.cos(a) * (r + 3)).toFixed(1)} ${(y + Math.sin(a) * (r + 3)).toFixed(1)} L${(x + Math.cos(a) * (r + 8)).toFixed(1)} ${(y + Math.sin(a) * (r + 8)).toFixed(1)}"/>`; }).join('')}</g><circle cx="${x}" cy="${y}" r="${r}" fill="#FFD54F" stroke="#F0A800" stroke-width="2"/>`;
  function wxIcon(k, x, y) {
    if (k === 'sonne') return sun(x, y, 12);
    if (k === 'sonnewolke') return sun(x - 8, y - 6, 10) + cloud(x + 4, y + 4, 0.6);
    if (k === 'wolke') return cloud(x, y, 0.75, '#CFD8DC');
    if (k === 'regen') return cloud(x, y - 4, 0.7, '#B0BEC5') + `<g stroke="#2A6CB0" stroke-width="2.5" stroke-linecap="round"><path d="M${x - 10} ${y + 10} L${x - 13} ${y + 18} M${x} ${y + 10} L${x - 3} ${y + 18} M${x + 10} ${y + 10} L${x + 7} ${y + 18}"/></g>`;
    return cloud(x, y - 4, 0.7, '#CFD8DC') + `<g fill="#fff" stroke="#2A6CB0" stroke-width="1.5">${[-10, 0, 10].map((d) => `<circle cx="${x + d}" cy="${y + 15}" r="3"/>`).join('')}</g>`;
  }
  function forecast() {
    const start = rnd(0, 6); const kinds = shuffle(Object.keys(WX)).slice(0, 4); const used = new Set();
    const days = kinds.map((k, i) => { let t; do t = rnd(WX[k].range[0], WX[k].range[1]); while (used.has(t)); used.add(t); return { day: DAYS[(start + i) % 7], k, t }; });
    const svg = `<svg ${NS} class="pic" viewBox="0 0 300 120" aria-label="Wettervorhersage für vier Tage"><rect x="1" y="1" width="298" height="118" rx="12" fill="#fff" stroke="${STROKE}" stroke-width="2"/>${days.map((d, i) => { const x = 37 + i * 75; return `${i ? `<line x1="${x - 37}" y1="10" x2="${x - 37}" y2="110" stroke="#CFD8DC"/>` : ''}${txt(x, 24, d.day)}${wxIcon(d.k, x, 58)}${txt(x, 104, minus(d.t) + ' °C', { size: 16 })}`; }).join('')}</svg>`;
    return { days, svg };
  }
  function forecastTask(mod) {
    const { days, svg } = forecast(); const v = rnd(0, 3); const others = (d) => days.filter((x) => x !== d);
    if (v === 0) { const d = pick(days); return choice(mod, 'wetter', `Wie warm soll es am ${d.day} werden?`, minus(d.t) + ' °C', shuffle(others(d)).slice(0, 2).map((x) => minus(x.t) + ' °C'), 'wvtemp_' + d.k, { pic: svg }); }
    if (v === 1 || v === 2) { const sorted = days.slice().sort((a, b) => a.t - b.t); const d = v === 1 ? sorted[3] : sorted[0]; return choice(mod, 'wetter', `An welchem Tag soll es am ${v === 1 ? 'wärmsten' : 'kältesten'} werden?`, d.day, shuffle(others(d)).slice(0, 2).map((x) => x.day), 'wv' + (v === 1 ? 'warm' : 'kalt'), { pic: svg }); }
    const d = pick(days); return choice(mod, 'wetter', `An welchem Tag ${WX[d.k].ask}?`, d.day, shuffle(others(d)).slice(0, 2).map((x) => x.day), 'wvsym_' + d.k, { pic: svg });
  }
  const WE_MODULES = {
    zustand: { name: 'Fest, flüssig, gasförmig', icon: '🧊', maxTier: 1, worldCap: [1], dmg: 12 },
    begriff: { name: 'Die fünf Wörter', icon: '♨️', maxTier: 1, worldCap: [1], dmg: 14 },
    kreislauf: { name: 'Wasserkreislauf', icon: '🔄', maxTier: 2, worldCap: [2], dmg: 14 },
    vorhersage: { name: 'Wettervorhersage', icon: '🌦️', maxTier: 1, worldCap: [1], dmg: 12 },
    regel: { name: 'Bauernregeln', icon: '📜', maxTier: 1, worldCap: [1], dmg: 10 },
  };
  const WE_TUT = {
    'zustand:1': { title: 'Fest, flüssig, gasförmig', steps: ['Wasser gibt es in drei Formen.', 'Fest: Eis, Schnee, Hagel. Flüssig: Wasser, Regen, Tau. Gasförmig: Wasserdampf.', 'Tippe auf die richtige Antwort.'] },
    'begriff:1': { title: 'Die fünf Wörter', steps: ['gefrieren: flüssig wird fest. schmelzen: fest wird flüssig.', 'verdampfen: beim Kochen wird Wasser schnell gasförmig. verdunsten: langsam, ohne Kochen.', 'kondensieren: Wasserdampf wird wieder flüssig, zum Beispiel am kalten Spiegel.'] },
    'kreislauf:1': { title: 'Wasserkreislauf', steps: ['Im Bild sind fünf Stellen nummeriert. Eine davon leuchtet gelb.', 'Folge dem Wasser: Es verdunstet, bildet Wolken, der Wind treibt sie weiter, es regnet, Flüsse bringen das Wasser zurück ins Meer.', 'Tippe auf den Satz, der zur Nummer passt.'] },
    'kreislauf:2': { title: 'Wasserkreislauf: Stelle finden', steps: ['Jetzt andersherum: Oben steht, was passiert.', 'Tippe im Bild auf die passende Stelle.', 'Beginne beim Meer und folge dem Wasser.'] },
    'vorhersage:1': { title: 'Wettervorhersage', steps: ['Die Karte zeigt vier Tage: oben der Tag, in der Mitte das Wetter, unten die Temperatur.', 'Sonne, Wolken, Regentropfen oder Schneeflocken zeigen das Wetter. −2 °C heißt: 2 Grad unter null.', 'Lies genau ab und tippe auf die Antwort.'] },
    'regel:1': { title: 'Bauernregeln', steps: ['Bauernregeln sind alte Sprüche über das Wetter. Oft reimen sie sich.', 'Im Spruch fehlt ein Wort (___). Der Reim hilft dir.', 'Tippe auf das Wort, das passt.'] },
  };
  function weGen(cfg) {
    return (mod, tier, know, seq, opts) => {
      if (mod === 'kreislauf') return plantTask(cfg, 'kreislauf', mod, tier, know, seq);
      if (wantsPool(cfg, mod, opts)) return null;
      if (mod === 'zustand' && Math.random() < 0.6) { const w = pick(WATER); return choice(mod, 'zustand', `${w.label}: Ist das fest, flüssig oder gasförmig?`, STATES[w.s], STATES.filter((_, i) => i !== w.s), 'wzst_' + w.id); }
      if (mod === 'begriff' && Math.random() < 0.4) { const x = pick(TERMS); return choice(mod, 'begriffe', `${x.ex} Wie heißt das?`, x.t, shuffle(TERMS.filter((y) => y !== x)).slice(0, 2).map((y) => y.t), 'wterm_' + x.t); }
      if (mod === 'vorhersage' && Math.random() < 0.7) return forecastTask(mod);
      return null;
    };
  }

  /* ---------- Forscherlabor: erst vermuten, dann Ergebnis ---------- */
  const FLOAT = [
    { label: 'Kerze', acc: 'eine Kerze', nom: 'Die Kerze', f: true, why: 'Wachs ist leichter als gleich viel Wasser.' },
    { label: 'Stein', acc: 'einen Stein', nom: 'Der Stein', f: false, why: 'Stein ist schwerer als gleich viel Wasser.' },
    { label: 'Korken', acc: 'einen Korken', nom: 'Der Korken', f: true, why: 'Kork ist sehr leicht und voller winziger Luftkammern.' },
    { label: 'Münze', acc: 'eine Münze', nom: 'Die Münze', f: false, why: 'Metall ist viel schwerer als gleich viel Wasser.' },
    { label: 'Apfel', acc: 'einen Apfel', nom: 'Der Apfel', f: true, why: 'In einem Apfel steckt viel Luft.' },
    { label: 'Holzstück', acc: 'ein Holzstück', nom: 'Das Holzstück', f: true, why: 'Die meisten Hölzer sind leichter als gleich viel Wasser.' },
    { label: 'Schlüssel', acc: 'einen Schlüssel', nom: 'Der Schlüssel', f: false, why: 'Ein Schlüssel ist aus Metall, und das ist schwerer als gleich viel Wasser.' },
    { label: 'Kartoffel', acc: 'eine Kartoffel', nom: 'Die Kartoffel', f: false, why: 'Eine Kartoffel ist etwas schwerer als gleich viel Wasser.' },
    { label: 'Tischtennisball', acc: 'einen Tischtennisball', nom: 'Der Tischtennisball', f: true, why: 'Der Ball ist innen hohl und voller Luft.' },
    { label: 'Eiswürfel', acc: 'einen Eiswürfel', nom: 'Der Eiswürfel', f: true, why: 'Eis ist leichter als gleich viel flüssiges Wasser.' },
    { label: 'Glasmurmel', acc: 'eine Glasmurmel', nom: 'Die Glasmurmel', f: false, why: 'Glas ist schwerer als gleich viel Wasser.' },
    { label: 'Orange mit Schale', acc: 'eine Orange mit Schale', nom: 'Die Orange mit Schale', f: true, why: 'In der dicken Schale stecken viele Luftbläschen.' },
    { label: 'Geschälte Orange', acc: 'eine geschälte Orange', nom: 'Die geschälte Orange', f: false, why: 'Ohne die luftige Schale ist die Orange schwerer als gleich viel Wasser.' },
    { label: 'Frisches Ei', acc: 'ein frisches Ei', nom: 'Das frische Ei', f: false, why: 'Ein frisches Ei ist schwerer als gleich viel Wasser.' },
  ];
  function tankSVG(label, where) {
    const y = where === 'oben' ? 46 : where === 'unten' ? 112 : 2;
    return `<svg ${NS} class="pic" viewBox="0 0 200 150" aria-label="Glas mit Wasser"><rect x="30" y="30" width="140" height="114" rx="8" fill="#E3F2FD" stroke="${STROKE}" stroke-width="2.5"/><rect x="32" y="58" width="136" height="84" rx="6" fill="#64B5F6" opacity=".6"/><path d="M32 58 Q66 52 100 58 T168 58" stroke="#2A6CB0" stroke-width="2" fill="none"/><rect x="34" y="${y}" width="132" height="24" rx="12" fill="#FFE0B2" stroke="${STROKE}" stroke-width="2"/>${txt(100, y + 17, label, { size: label.length > 12 ? 11 : 13 })}</svg>`;
  }
  function urnSVG(a, b) {
    const bag = (x, r, n, title) => { const balls = Array.from({ length: n }, (_, i) => i < r); return `<path d="M${x + 10} 40 Q${x} 120 ${x + 20} 132 L${x + 100} 132 Q${x + 120} 120 ${x + 110} 40 Z" fill="#D7CCC8" stroke="${STROKE}" stroke-width="2.5"/><path d="M${x + 10} 40 L${x + 110} 40" stroke="#8D6E63" stroke-width="4"/>${balls.map((red, i) => `<circle cx="${x + 32 + (i % 3) * 28}" cy="${64 + Math.floor(i / 3) * 26}" r="11" fill="${red ? '#E5484D' : '#3B82F6'}" stroke="${STROKE}" stroke-width="2"/>`).join('')}${txt(x + 60, 24, title, { size: 15 })}`; };
    return `<svg ${NS} class="pic" viewBox="0 0 280 140" aria-label="Zwei Beutel mit Kugeln">${bag(10, a.r, a.n, 'Beutel 1')}${bag(150, b.r, b.n, 'Beutel 2')}</svg>`;
  }
  // both bags hold the same number of balls, so comparing the red ones is enough for a third grader
  function urnExperiment() {
    const n = rnd(4, 6); let r1 = rnd(1, n - 1), r2 = rnd(1, n - 1); if (Math.random() < 0.2) r2 = r1;
    const a = r1 > r2 ? 0 : r2 > r1 ? 1 : 2;
    const note = a === 2 ? `In beiden Beuteln sind ${r1} von ${n} Kugeln rot. Die Chance auf Rot ist gleich.` : `In Beutel ${a + 1} sind ${Math.max(r1, r2)} von ${n} Kugeln rot, in Beutel ${2 - a} nur ${Math.min(r1, r2)}. Aus Beutel ${a + 1} ziehst du wahrscheinlicher Rot.`;
    return { kind: 'urne', topic: 'zufall', q: 'Du ziehst mit geschlossenen Augen eine Kugel. Aus welchem Beutel bekommst du wahrscheinlicher eine rote?', opts: ['Beutel 1', 'Beutel 2', 'Beide gleich'], a, note, pic: urnSVG({ r: r1, n }, { r: r2, n }), r: [r1, r2], n };
  }
  function laborSet() {
    const fl = shuffle(FLOAT).slice(0, 2).map((x) => ({ kind: 'float', topic: 'schwimmen', q: `Du legst ${x.acc} ins Wasser. Schwimmt es oder sinkt es?`, opts: ['Schwimmt', 'Sinkt'], a: x.f ? 0 : 1, note: `${x.nom} ${x.f ? 'schwimmt' : 'sinkt'}. ${x.why}`, pic: tankSVG(x.label, null), after: tankSVG(x.label, x.f ? 'oben' : 'unten') }));
    const st = shuffle(WATER).slice(0, 2).map((w) => ({ kind: 'state', topic: 'zustand', q: `${w.label}: fest, flüssig oder gasförmig?`, opts: STATES.slice(), a: w.s, note: w.note }));
    return shuffle(fl.concat(st, [urnExperiment()]));
  }

  const WE = { modules: WE_MODULES, tut: WE_TUT, notes: WE_NOTES, pool: WE_POOL, worlds: 1, title: 'Die Wetterstation', icon: '🌦️', sub: 'Wasser, Wasserkreislauf, Wettervorhersage, Bauernregeln und das Forscherlabor', swap: { from: 'event', to: 'labor' },
    starters: [{ id: 'wetterwart', type: 'normal', shape: 'wetterwart', names: ['Der Wetterwart', 'Der Wetterwart', 'Der Wetterwart'], hp: 70, desc: 'Er liest jeden Morgen Thermometer, Regenmesser und Windfahne ab und schreibt alles auf.', perk: 'none',
      attacks: [{ name: 'Eiszapfen', mod: 'zustand' }, { name: 'Wasserkessel', mod: 'begriff' }, { name: 'Wolkenzug', mod: 'kreislauf' }, { name: 'Wetterhahn', mod: 'vorhersage' }] }],
    extra: { zustand: 'Hagelschlag', begriff: 'Taupunkt', kreislauf: 'Meeresbrise', vorhersage: 'Barometer', regel: 'Bauernkalender' },
    enemies: { 1: {
      normal: [
        { name: 'Nieselregen', type: 'wasser', shape: 'drop', hp: 24, atk: 3 },
        { name: 'Glatteis', type: 'wasser', shape: 'rock', hp: 30, atk: 3 },
        { name: 'Die Sturmböe', type: 'normal', shape: 'bat', hp: 26, atk: 4 },
        { name: 'Hitzeflimmern', type: 'feuer', shape: 'flame', hp: 28, atk: 4 },
      ],
      elite: { name: 'Die Gewitterzelle', type: 'wasser', shape: 'ghost', hp: 45, atk: 5 },
      boss: { name: 'Das Unwetter', acc: 'das Unwetter', type: 'wasser', shape: 'dragon', hp: 70, atk: 6, boss: true },
    } },
    moves: ['Platzregen', 'Graupelschauer', 'Donnergrollen', 'Glätte', 'Windhose', 'Nebelwand'],
    events: [
      { title: 'Die Wetterwarte', text: 'Auf dem Dach der Wetterwarte stehen Thermometer und Regenmesser. Die Meteorologin fragt dich nach dem Wetter.', opts: [{ label: 'Antworten', task: 'vorhersage', g: 'wetter', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Teich im Winter', text: 'Der Teich ist zugefroren. Ein Junge fragt dich, wie das passiert. Wer es weiß, bekommt einen Trank.', opts: [{ label: 'Antworten', task: 'begriff', g: 'begriffe', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Bauernkalender', text: 'Im Hof hängt ein alter Kalender mit Bauernregeln. Die Bäuerin kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort.', opts: [{ label: 'Antworten', task: 'regel', g: 'regeln', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Küche', text: 'In der Küche pfeift der Wasserkocher. Der Koch gibt dir eine Chilischote, wenn du seine Frage beantwortest.', opts: [{ label: 'Antworten', task: 'any', win: { item: 'keks' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Unterstand', text: 'Ein Schauer zieht vorbei. Unter dem Dach der Bushaltestelle ruhst du dich aus.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
    ] };
  WE.gen = weGen(WE);

  /* ================= KOMPASS UND KARTE (LB 5) ================= */
  // [Zeile, Spalte] je Schritt; Norden ist oben
  const DIRS = { N: [-1, 0, 'Norden'], NO: [-1, 1, 'Nordosten'], O: [0, 1, 'Osten'], SO: [1, 1, 'Südosten'], S: [1, 0, 'Süden'], SW: [1, -1, 'Südwesten'], W: [0, -1, 'Westen'], NW: [-1, -1, 'Nordwesten'] };
  const MAIN = ['N', 'O', 'S', 'W'], SIDE = ['NO', 'SO', 'SW', 'NW'], CLOCK = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
  const SIZE = 5;
  const inGrid = ([r, c]) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  function karteTarget(start, steps) { let [r, c] = start; for (const s of steps) { r += DIRS[s.d][0] * s.n; c += DIRS[s.d][1] * s.n; } return [r, c]; }
  const fields = (n) => (n === 1 ? '1 Feld' : `${n} Felder`);
  function karteText(steps, metres) { return 'Gehe ' + steps.map((s, i) => `${metres ? s.n * 100 + ' m' : fields(s.n)} nach ${DIRS[s.d][2]}`).join(' und dann ') + '.'; }
  function roseG(opts) {
    opts = opts || {}; const mark = opts.mark; const arm = (d, len, w) => { const a = CLOCK.indexOf(d) * Math.PI / 4; const x = 60 + Math.sin(a) * len, y = 60 - Math.cos(a) * len; const px = Math.cos(a) * w, py = Math.sin(a) * w; const hot = d === mark; return `<path d="M60 60 L${(60 + px).toFixed(1)} ${(60 + py).toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)} L${(60 - px).toFixed(1)} ${(60 - py).toFixed(1)} Z" fill="${hot ? '#FF8A3D' : d === 'N' ? '#E5484D' : '#fff'}" stroke="${STROKE}" stroke-width="2"/>`; };
    const lab = (d, len, size) => { const a = CLOCK.indexOf(d) * Math.PI / 4; return txt((60 + Math.sin(a) * len).toFixed(1), (60 - Math.cos(a) * len + size / 3).toFixed(1), d === mark ? '?' : d, { size }); };
    const side = opts.neben !== false;
    return `<circle cx="60" cy="60" r="34" fill="#FFF8E1" stroke="#B08D4A" stroke-width="1.5"/>${side ? SIDE.map((d) => arm(d, 30, 5)).join('') : ''}${MAIN.map((d) => arm(d, 42, 7)).join('')}<circle cx="60" cy="60" r="3" fill="${STROKE}"/>${MAIN.map((d) => lab(d, 52, 14)).join('')}${side ? SIDE.map((d) => lab(d, 42, 10)).join('') : ''}`;
  }
  const roseSVG = (opts) => `<svg ${NS} class="pic" viewBox="-4 -4 128 128" style="max-width:220px" aria-label="Windrose">${roseG(opts)}</svg>`;
  // Schatzkarte: 5 × 5 Felder, Zelt = Start, ✕ = Schatz; clickable cells carry data-cell="Zeile-Spalte"
  function mapSVG(o) {
    const C = 43, X0 = 6, Y0 = 6; let cells = '';
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) cells += `<rect class="cell" data-cell="${r}-${c}" x="${X0 + c * C}" y="${Y0 + r * C}" width="${C}" height="${C}" ${o.clickable ? `tabindex="0" role="button" aria-label="Feld in Zeile ${r + 1}, Spalte ${c + 1}"` : ''}/>`;
    const at = ([r, c]) => [X0 + c * C + C / 2, Y0 + r * C + C / 2];
    const [sx, sy] = at(o.start);
    const tent = `<path d="M${sx - 15} ${sy + 12} L${sx} ${sy - 14} L${sx + 15} ${sy + 12} Z" fill="#2E7D32" stroke="${STROKE}" stroke-width="2"/><path d="M${sx} ${sy - 14} L${sx - 5} ${sy + 12} L${sx + 5} ${sy + 12} Z" fill="#1B4D1E"/>`;
    const cross = o.goal ? (([x, y]) => `<path d="M${x - 11} ${y - 11} L${x + 11} ${y + 11} M${x + 11} ${y - 11} L${x - 11} ${y + 11}" stroke="#C62828" stroke-width="5" stroke-linecap="round"/>`)(at(o.goal)) : '';
    const scale = o.scale ? `${txt(262, 150, 'Maßstab', { size: 11 })}<path d="M240 160 L284 160" stroke="${STROKE}" stroke-width="3"/><path d="M240 154 L240 166 M284 154 L284 166" stroke="${STROKE}" stroke-width="2"/>${txt(262, 180, '1 Feld = 100 m', { size: 11 })}` : '';
    return `<svg ${NS} class="kmap ${o.clickable ? 'clickable' : ''}" viewBox="0 0 300 228" aria-label="Schatzkarte mit 5 mal 5 Feldern"><rect x="${X0 - 3}" y="${Y0 - 3}" width="${SIZE * C + 6}" height="${SIZE * C + 6}" rx="6" fill="#E9D49C"/>${cells}<g pointer-events="none">${tent}${cross}</g><g transform="translate(232 6) scale(.55)">${roseG({ neben: !!o.neben })}</g>${scale}</svg>`;
  }
  function makeKarte(tier) {
    for (;;) {
      const start = [rnd(0, SIZE - 1), rnd(0, SIZE - 1)]; let steps;
      if (tier <= 1) { steps = shuffle([{ d: pick(['O', 'W']), n: rnd(1, 3) }, { d: pick(['N', 'S']), n: rnd(1, 3) }]); if (Math.random() < 0.2) steps = steps.slice(0, 1); }
      else if (tier === 2) { steps = [{ d: pick(SIDE), n: rnd(1, 2) }]; if (Math.random() < 0.6) steps.push({ d: pick(MAIN), n: rnd(1, 2) }); steps = shuffle(steps); }
      else steps = shuffle([{ d: pick(['O', 'W']), n: rnd(1, 3) }, { d: pick(['N', 'S']), n: rnd(1, 3) }]); // metres only along main directions: a diagonal field is longer than 100 m
      let pos = start, ok = true; for (const s of steps) { pos = karteTarget(pos, [s]); if (!inGrid(pos)) ok = false; }
      if (!ok || (pos[0] === start[0] && pos[1] === start[1])) continue;
      const neben = steps.some((s) => SIDE.includes(s.d)) || tier >= 2;
      if (tier >= 3 && Math.random() < 0.5) {
        const dist = (Math.abs(pos[0] - start[0]) + Math.abs(pos[1] - start[1])) * 100; const wrong = [dist + 100, dist >= 200 ? dist - 100 : dist + 200, dist / 100].filter((x, i, a) => x !== dist && a.indexOf(x) === i).slice(0, 2);
        return { kind: 'choice', mod: 'karte', tier: 3, group: 'karte:3', note: 'karte', q: 'Wie weit ist es vom Zelt zum Schatz (✕), wenn du nur nach Norden, Süden, Osten oder Westen gehst?', options: shuffle([dist + ' m'].concat(wrong.map((x) => x + ' m'))), answer: dist + ' m', qid: 'kdist_' + start.join('') + pos.join(''), cols: 1, pic: mapSVG({ start, goal: pos, scale: true }) };
      }
      return { kind: 'karte', mod: 'karte', tier: Math.min(tier, 3), group: 'karte:' + Math.min(tier, 3), note: 'karte', q: `Du startest beim Zelt. ${karteText(steps, tier >= 3)} Tippe auf das Feld mit dem Schatz.`, start, steps, target: pos, neben, scale: tier >= 3, qid: 'karte_' + start.join('') + steps.map((s) => s.d + s.n).join('') };
    }
  }

  // Plan mit Legende: fünf Orte auf einem 3 × 3-Plan
  const PLACES = [
    { id: 'kirche', name: 'die Kirche', vom: 'von der Kirche', icon: (x, y) => `<rect x="${x - 12}" y="${y - 4}" width="24" height="18" fill="#BCAAA4" stroke="${STROKE}" stroke-width="2"/><path d="M${x - 5} ${y - 4} L${x - 5} ${y - 18} L${x + 5} ${y - 18} L${x + 5} ${y - 4}" fill="#BCAAA4" stroke="${STROKE}" stroke-width="2"/><path d="M${x} ${y - 28} L${x} ${y - 18} M${x - 4} ${y - 24} L${x + 4} ${y - 24}" stroke="${STROKE}" stroke-width="2"/>` },
    { id: 'schule', name: 'die Schule', vom: 'von der Schule', icon: (x, y) => `<rect x="${x - 15}" y="${y - 6}" width="30" height="20" fill="#FFE082" stroke="${STROKE}" stroke-width="2"/><path d="M${x - 18} ${y - 6} L${x} ${y - 18} L${x + 18} ${y - 6} Z" fill="#E57373" stroke="${STROKE}" stroke-width="2"/><path d="M${x} ${y - 18} L${x} ${y - 30}" stroke="${STROKE}" stroke-width="2"/><path d="M${x} ${y - 30} L${x + 10} ${y - 26} L${x} ${y - 22} Z" fill="#3B82F6"/>` },
    { id: 'wald', name: 'der Wald', vom: 'vom Wald', icon: (x, y) => [[-10, 2], [8, 0], [-1, -10]].map(([dx, dy]) => `<path d="M${x + dx} ${y + dy + 14} L${x + dx} ${y + dy + 6}" stroke="#6D4C41" stroke-width="3"/><circle cx="${x + dx}" cy="${y + dy}" r="9" fill="#43A047" stroke="#1B5E20" stroke-width="2"/>`).join('') },
    { id: 'teich', name: 'der Teich', vom: 'vom Teich', icon: (x, y) => `<ellipse cx="${x}" cy="${y}" rx="20" ry="12" fill="#64B5F6" stroke="#1E63B0" stroke-width="2"/>` },
    { id: 'spielplatz', name: 'der Spielplatz', vom: 'vom Spielplatz', icon: (x, y) => `<path d="M${x - 16} ${y + 14} L${x - 8} ${y - 14} L${x} ${y + 14} M${x + 16} ${y + 14} L${x + 8} ${y - 14} L${x} ${y + 14} M${x - 8} ${y - 14} L${x + 8} ${y - 14}" stroke="#8D6E63" stroke-width="3" fill="none"/><path d="M${x - 4} ${y - 14} L${x - 4} ${y + 4} M${x + 4} ${y - 14} L${x + 4} ${y + 4}" stroke="${STROKE}" stroke-width="1.5"/><rect x="${x - 6}" y="${y + 3}" width="12" height="4" fill="#E53935"/>` },
    { id: 'baeckerei', name: 'die Bäckerei', vom: 'von der Bäckerei', icon: (x, y) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="11" fill="#C68642" stroke="#7B4A1E" stroke-width="2"/><path d="M${x - 8} ${y - 6} L${x - 4} ${y + 6} M${x} ${y - 7} L${x + 4} ${y + 6} M${x + 8} ${y - 6} L${x + 11} ${y + 3}" stroke="#7B4A1E" stroke-width="2"/>` },
    { id: 'bahnhof', name: 'der Bahnhof', vom: 'vom Bahnhof', icon: (x, y) => `<path d="M${x - 20} ${y - 5} L${x + 20} ${y - 5} M${x - 20} ${y + 5} L${x + 20} ${y + 5}" stroke="#455A64" stroke-width="3"/>${[-15, -5, 5, 15].map((d) => `<path d="M${x + d} ${y - 9} L${x + d} ${y + 9}" stroke="#8D6E63" stroke-width="3"/>`).join('')}` },
  ];
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  function planTask(mod) {
    for (;;) {
      const spots = shuffle(Array.from({ length: 9 }, (_, i) => [Math.floor(i / 3), i % 3])).slice(0, 5); const places = shuffle(PLACES).slice(0, 5).map((p, i) => ({ p, rc: spots[i] }));
      const dirOf = (a, b) => { const dr = b.rc[0] - a.rc[0], dc = b.rc[1] - a.rc[1]; if (dr && dc && Math.abs(dr) !== Math.abs(dc)) return null; return CLOCK.find((d) => DIRS[d][0] === Math.sign(dr) && DIRS[d][1] === Math.sign(dc)) || null; };
      const pairs = []; for (const a of places) for (const b of places) if (a !== b && dirOf(a, b)) pairs.push([a, b, dirOf(a, b)]);
      if (!pairs.length) continue;
      const [a, b, d] = pick(pairs);
      const svg = `<svg ${NS} class="pic" viewBox="0 0 300 210" aria-label="Plan mit Legende"><rect x="4" y="4" width="200" height="200" rx="8" fill="#DCEDC8" stroke="${STROKE}" stroke-width="2"/><path d="M71 4 L71 204 M137 4 L137 204 M4 71 L204 71 M4 137 L204 137" stroke="#fff" stroke-width="7"/>${places.map(({ p, rc }) => p.icon(38 + rc[1] * 66, 42 + rc[0] * 66)).join('')}<path d="M226 34 L234 14 L242 34 L234 29 Z" fill="${STROKE}"/>${txt(234, 50, 'N', { size: 14 })}${txt(256, 74, 'Legende', { size: 12 })}${places.map(({ p }, i) => `<g transform="translate(228 ${98 + i * 24}) scale(.5)">${p.icon(0, 0)}</g>${txt(244, 102 + i * 24, cap(p.name.split(' ')[1]), { size: 11, anchor: 'start' })}`).join('')}</svg>`;
      // exact direction only, and nothing else lies in that direction, so exactly one answer fits
      const sameDir = places.filter((x) => x !== a && dirOf(a, x) === d);
      if (Math.random() < 0.5 || sameDir.length > 1) {
        return choice(mod, 'plan', `In welcher Himmelsrichtung liegt ${b.p.name}, ${a.p.vom} aus gesehen?`, 'Im ' + DIRS[d][2], shuffle(CLOCK.filter((x) => x !== d)).slice(0, 2).map((x) => 'Im ' + DIRS[x][2]), 'plandir_' + a.p.id + b.p.id, { pic: svg });
      }
      // wrong options must not lie even roughly in that direction (a place north-north-east would also count as „im Norden“)
      const rough = (x) => [0, 1].every((k) => !DIRS[d][k] || Math.sign(x.rc[k] - a.rc[k]) === DIRS[d][k]);
      const wrong = places.filter((x) => x !== a && x !== b && !rough(x)).map((x) => cap(x.p.name));
      if (wrong.length < 2) continue;
      return choice(mod, 'plan', `Was liegt im ${DIRS[d][2]}, ${a.p.vom} aus gesehen?`, cap(b.p.name), shuffle(wrong).slice(0, 2), 'planwhat_' + a.p.id + d, { pic: svg });
    }
  }
  function roseTask(mod) {
    const v = rnd(0, 4); const d = pick(CLOCK); const name = DIRS[d][2]; const others = (x) => shuffle(CLOCK.filter((y) => y !== x)).slice(0, 2);
    if (v <= 1) return choice(mod, 'neben', 'Welche Himmelsrichtung zeigt der orange Pfeil mit dem Fragezeichen?', name, others(d).map((x) => DIRS[x][2]), 'rosemark_' + d, { pic: roseSVG({ mark: d }) });
    if (v === 2) { const opp = CLOCK[(CLOCK.indexOf(d) + 4) % 8]; return choice(mod, 'neben', `Welche Himmelsrichtung liegt ${name} genau gegenüber?`, DIRS[opp][2], others(opp).filter((x) => x !== d).concat([d]).slice(0, 2).map((x) => DIRS[x][2]), 'roseopp_' + d, { pic: roseSVG({}) }); }
    if (v === 3) return choice(mod, 'neben', `Welche Abkürzung steht auf der Windrose für ${name}?`, d, others(d), 'roseabbr_' + d);
    const m = pick(MAIN); const turns = pick([[2, 'eine Vierteldrehung'], [4, 'eine halbe Drehung'], [6, 'eine Dreivierteldrehung']]); const to = CLOCK[(CLOCK.indexOf(m) + turns[0]) % 8];
    return choice(mod, 'richtung', `Du schaust nach ${DIRS[m][2]} und machst ${turns[1]} nach rechts, wie der Uhrzeiger. Wohin schaust du jetzt?`, 'Nach ' + DIRS[to][2], MAIN.filter((x) => x !== to).slice(0, 2).map((x) => 'Nach ' + DIRS[x][2]), 'roseturn_' + m + turns[0]);
  }
  // Orte im eigenen Landkreis für Heimat-Aufgaben. Nur mit echten Angaben aus dem Unterricht füllen (Ort, Kreisstadt
  // ja/nein, Fluss, Lage im Landkreis als Haupthimmelsrichtung). Solange die Liste leer ist, gibt es keine Landkreis-Aufgaben.
  // Beispiel: { ort: 'Musterstadt', kreisstadt: true, fluss: 'Musterbach', lage: 'Norden' },
  const LANDKREIS = [];
  function landkreisPool(list) {
    if (list.length < 3) return [];
    const out = []; const towns = list.map((x) => x.ort); const seat = list.find((x) => x.kreisstadt);
    if (seat) out.push({ id: 'lk_kreisstadt', mod: 'richtung', g: 'heimat', q: 'Welcher Ort ist die Kreisstadt unseres Landkreises?', o: [seat.ort].concat(towns.filter((t) => t !== seat.ort).slice(0, 2)), a: 0 });
    list.forEach((x, i) => {
      const rivers = [...new Set(list.map((y) => y.fluss).filter((f) => f && f !== x.fluss))];
      if (x.fluss && rivers.length >= 2) out.push({ id: 'lk_fluss' + i, mod: 'richtung', g: 'heimat', q: `An welchem Fluss liegt ${x.ort}?`, o: [x.fluss].concat(rivers.slice(0, 2)), a: 0 });
      if (MAIN.some((d) => DIRS[d][2] === x.lage)) out.push({ id: 'lk_lage' + i, mod: 'richtung', g: 'heimat', q: `In welchem Teil des Landkreises liegt ${x.ort}?`, o: ['Im ' + x.lage].concat(MAIN.map((d) => 'Im ' + DIRS[d][2]).filter((t) => t !== 'Im ' + x.lage).slice(0, 2)), a: 0 });
    });
    return out;
  }
  const KK_NOTES = {
    richtung: { title: 'Die Himmelsrichtungen', lines: ['Die vier Haupthimmelsrichtungen: Norden (N), Osten (O), Süden (S), Westen (W).', 'Merksatz im Uhrzeigersinn ab Norden: „Nie ohne Seife waschen.“', 'Gegenüber liegen Norden und Süden, Osten und Westen.', 'Der Kompass zeigt die Himmelsrichtungen. Seine Nadel zeigt mit der roten Spitze nach Norden.', 'Karte einnorden: die Karte so drehen, dass ihr Norden in die Richtung zeigt, in die die Kompassnadel zeigt.'] },
    neben: { title: 'Die Windrose', lines: ['Zwischen den Haupthimmelsrichtungen liegen die Nebenhimmelsrichtungen.', 'Nordosten (NO) liegt zwischen Norden und Osten, Südosten (SO) zwischen Süden und Osten.', 'Südwesten (SW) liegt zwischen Süden und Westen, Nordwesten (NW) zwischen Norden und Westen.', 'Die Windrose zeigt alle acht Richtungen.'] },
    sonne: { title: 'Der Lauf der Sonne', lines: ['„Im Osten geht die Sonne auf, im Süden nimmt sie ihren Lauf, im Westen will sie untergehn, im Norden ist sie nie zu sehn.“', 'Mittags steht die Sonne bei uns im Süden.', 'Nachts zeigt der Polarstern nach Norden.'] },
    plan: { title: 'Plan und Karte', lines: ['Ein Plan zeigt einen Ort von oben, viel kleiner als in Wirklichkeit.', 'Die Legende erklärt die Zeichen auf dem Plan.', 'Auf den meisten Karten ist Norden oben, Süden unten, Osten rechts und Westen links.', 'Der Maßstab zeigt, wie stark alles verkleinert ist.'] },
    karte: { title: 'Die Schatzkarte', lines: ['Norden ist oben, Süden unten, Osten rechts, Westen links.', 'Nordosten heißt: schräg nach oben rechts. Ein Feld nach Nordosten ist ein Feld nach Norden und eins nach Osten zugleich.', 'Maßstab 1 Feld = 100 m: 300 m sind 3 Felder.'] },
    heimat: { title: 'Unser Landkreis', lines: LANDKREIS.map((x) => `${x.ort}${x.kreisstadt ? ' (Kreisstadt)' : ''}: im ${x.lage}${x.fluss ? ', am Fluss ' + x.fluss : ''}.`) },
  };
  const KK_POOL = [
    { id: 'kkri1', mod: 'richtung', g: 'sonne', q: 'In welcher Himmelsrichtung geht die Sonne auf?', o: ['Im Osten', 'Im Westen', 'Im Norden'], a: 0 },
    { id: 'kkri2', mod: 'richtung', g: 'sonne', q: 'In welcher Himmelsrichtung geht die Sonne unter?', o: ['Im Westen', 'Im Osten', 'Im Süden'], a: 0 },
    { id: 'kkri3', mod: 'richtung', g: 'sonne', q: 'Wo steht die Sonne bei uns mittags?', o: ['Im Süden', 'Im Norden', 'Im Osten'], a: 0 },
    { id: 'kkri4', mod: 'richtung', g: 'sonne', q: 'Bei uns steht die Sonne mittags im Norden.', rf: true, a: false, why: 'Mittags steht sie im Süden. Im Norden ist sie nie zu sehen.' },
    { id: 'kkri5', mod: 'richtung', g: 'richtung', q: 'Wohin zeigt die rote Spitze der Kompassnadel?', o: ['Nach Norden', 'Nach Süden', 'Nach Osten'], a: 0 },
    { id: 'kkri6', mod: 'richtung', g: 'richtung', q: 'Was bedeutet es, eine Karte einzunorden?', o: ['Die Karte so drehen, dass ihr Norden nach Norden zeigt', 'Die Karte zusammenfalten', 'Das Wort „Norden“ auf die Karte schreiben'], a: 0 },
    { id: 'kkri7', mod: 'richtung', g: 'richtung', q: 'Wie viele Haupthimmelsrichtungen gibt es?', o: ['4', '8', '2'], a: 0 },
    { id: 'kkri8', mod: 'richtung', g: 'richtung', q: 'Was ist ein Kompass?', o: ['Ein Gerät, das die Himmelsrichtungen zeigt', 'Eine Uhr für das Wetter', 'Ein Fernglas'], a: 0 },
    { id: 'kkri9', mod: 'richtung', g: 'richtung', q: 'Die Haupthimmelsrichtungen sind Norden, Osten, Süden und Westen.', rf: true, a: true },
    { id: 'kkri10', mod: 'richtung', g: 'neben', q: 'Nordosten ist eine Haupthimmelsrichtung.', rf: true, a: false, why: 'Nordosten ist eine Nebenhimmelsrichtung zwischen Norden und Osten.' },
    { id: 'kkri11', mod: 'richtung', g: 'richtung', q: 'Mit welchem Merksatz kannst du dir die Himmelsrichtungen im Uhrzeigersinn merken?', o: ['Nie ohne Seife waschen', 'Alle Kinder lernen lesen', 'Morgens um sieben'], a: 0 },
    { id: 'kkri12', mod: 'richtung', g: 'sonne', q: 'Welcher helle Stern zeigt nachts die Richtung Norden?', o: ['Der Polarstern', 'Der Abendstern', 'Die Sonne'], a: 0 },
    { id: 'kkri13', mod: 'richtung', g: 'sonne', q: 'Im Norden ist die Sonne bei uns nie zu sehen.', rf: true, a: true },
    { id: 'kkri14', mod: 'richtung', g: 'sonne', q: 'Morgens scheint die Sonne in dein Fenster. In welche Richtung zeigt das Fenster?', o: ['Nach Osten', 'Nach Westen', 'Nach Norden'], a: 0 },
    { id: 'kkri15', mod: 'richtung', g: 'neben', q: 'Wie viele Richtungen zeigt eine Windrose mit Haupt- und Nebenhimmelsrichtungen?', o: ['8', '4', '6'], a: 0 },
    { id: 'kkri16', mod: 'richtung', g: 'richtung', q: 'Welche Himmelsrichtung liegt gegenüber von Norden?', o: ['Süden', 'Osten', 'Westen'], a: 0 },
    { id: 'kkri17', mod: 'richtung', g: 'richtung', q: 'Wofür steht die Abkürzung „O“ auf dem Kompass?', o: ['Osten', 'Oben', 'Ort'], a: 0 },
    { id: 'kkri18', mod: 'richtung', g: 'richtung', q: 'Mit dem Kompass findest du die Himmelsrichtungen auch bei Nebel.', rf: true, a: true },
    { id: 'kkri19', mod: 'richtung', g: 'sonne', q: 'Abends scheint die Sonne in dein Zimmer. In welche Richtung zeigt das Fenster?', o: ['Nach Westen', 'Nach Osten', 'Nach Norden'], a: 0 },
    { id: 'kkri20', mod: 'richtung', g: 'neben', q: 'Welche Richtung liegt zwischen Süden und Westen?', o: ['Südwesten', 'Südosten', 'Nordwesten'], a: 0 },
    { id: 'kkri21', mod: 'richtung', g: 'richtung', q: 'Die Sonne geht im Westen auf.', rf: true, a: false, why: 'Die Sonne geht im Osten auf und im Westen unter.' },
    { id: 'kkpl7', mod: 'plan', g: 'plan', q: 'Was ist auf einem Plan meistens blau gezeichnet?', o: ['Wasser wie Flüsse und Teiche', 'Wälder', 'Häuser'], a: 0 },
    { id: 'kkpl8', mod: 'plan', g: 'plan', q: 'Was brauchst du, um auf einer Karte die Zeichen zu verstehen?', o: ['Die Legende', 'Den Maßstab', 'Einen Wecker'], a: 0 },
    { id: 'kkpl9', mod: 'plan', g: 'plan', q: 'Ein Plan der Schule zeigt die Räume von oben.', rf: true, a: true },
    { id: 'kkpl10', mod: 'plan', g: 'plan', q: 'Was bedeutet der Maßstab „1 Kästchen = 100 m“?', o: ['Ein Kästchen auf dem Plan sind 100 m in Wirklichkeit', 'Der Plan ist 100 m groß', 'Man darf nur 100 m gehen'], a: 0 },
    { id: 'kkpl1', mod: 'plan', g: 'plan', q: 'Was ist die Legende einer Karte?', o: ['Die Erklärung der Zeichen', 'Eine alte Sage', 'Der Name der Stadt'], a: 0 },
    { id: 'kkpl2', mod: 'plan', g: 'plan', q: 'Wie ist ein Plan gezeichnet?', o: ['Von oben, wie ein Vogel es sieht', 'Von der Seite', 'Von unten'], a: 0 },
    { id: 'kkpl3', mod: 'plan', g: 'plan', q: 'Auf einem Plan ist alles kleiner gezeichnet als in Wirklichkeit.', rf: true, a: true },
    { id: 'kkpl4', mod: 'plan', g: 'plan', q: 'Auf den meisten Karten ist Süden oben.', rf: true, a: false, why: 'Auf den meisten Karten ist Norden oben.' },
    { id: 'kkpl5', mod: 'plan', g: 'plan', q: 'Was zeigt der Maßstab einer Karte?', o: ['Wie stark alles verkleinert ist', 'Wie warm es ist', 'Wie alt die Karte ist'], a: 0 },
    { id: 'kkpl6', mod: 'plan', g: 'plan', q: 'Auf einer Karte ist rechts Osten. Was ist links?', o: ['Westen', 'Norden', 'Süden'], a: 0 },
    { id: 'kklt1', mod: 'lt', g: 'sonne', q: 'Im Osten geht die Sonne auf, im ___ nimmt sie ihren Lauf.', o: ['Süden', 'Norden', 'Westen'], a: 0 },
    { id: 'kklt2', mod: 'lt', g: 'sonne', q: 'Im Westen will sie untergehn, im ___ ist sie nie zu sehn.', o: ['Norden', 'Süden', 'Osten'], a: 0 },
    { id: 'kklt3', mod: 'lt', g: 'sonne', q: 'Im ___ geht die Sonne auf.', o: ['Osten', 'Westen', 'Norden'], a: 0 },
    { id: 'kklt4', mod: 'lt', g: 'plan', q: 'Die Erklärung der Zeichen auf einer Karte heißt ___.', o: ['Legende', 'Märchen', 'Maßstab'], a: 0 },
    { id: 'kklt5', mod: 'lt', g: 'plan', q: 'Der ___ zeigt, wie stark eine Karte verkleinert ist.', o: ['Maßstab', 'Kompass', 'Fluss'], a: 0 },
    { id: 'kklt6', mod: 'lt', g: 'neben', q: 'Zwischen Norden und Osten liegt ___.', o: ['Nordosten', 'Südwesten', 'Nordwesten'], a: 0 },
    { id: 'kklt7', mod: 'lt', g: 'plan', q: 'Auf den meisten Karten ist ___ oben.', o: ['Norden', 'Süden', 'Osten'], a: 0 },
    { id: 'kklt8', mod: 'lt', g: 'richtung', q: 'Ein ___ zeigt die Himmelsrichtungen an.', o: ['Kompass', 'Thermometer', 'Wecker'], a: 0 },
    { id: 'kklt9', mod: 'lt', g: 'plan', q: 'Ein Plan zeigt einen Ort von ___.', o: ['oben', 'unten', 'der Seite'], a: 0 },
  ].concat(landkreisPool(LANDKREIS));
  const KK_MODULES = {
    richtung: { name: 'Himmelsrichtungen', icon: '🧭', maxTier: 1, worldCap: [1], dmg: 12 },
    rose: { name: 'Windrose', icon: '✳️', maxTier: 1, worldCap: [1], dmg: 12 },
    plan: { name: 'Plan mit Legende', icon: '🏘️', maxTier: 1, worldCap: [1], dmg: 14 },
    karte: { name: 'Schatzkarte', icon: '🗺️', maxTier: 3, worldCap: [3], dmg: 14 },
    lt: { name: 'Lückentext', icon: '✏️', maxTier: 1, worldCap: [1], dmg: 10 },
  };
  const KK_TUT = {
    'richtung:1': { title: 'Himmelsrichtungen', steps: ['Norden, Osten, Süden, Westen – im Uhrzeigersinn: „Nie ohne Seife waschen.“', 'Im Osten geht die Sonne auf, mittags steht sie im Süden, im Westen geht sie unter.', 'Tippe auf die richtige Antwort.'] },
    'rose:1': { title: 'Windrose', steps: ['Die Windrose zeigt acht Richtungen. Norden ist oben.', 'Zwischen Norden und Osten liegt Nordosten (NO), zwischen Süden und Westen Südwesten (SW).', 'Ist ein Pfeil orange, fragt die Aufgabe nach seiner Richtung.'] },
    'plan:1': { title: 'Plan mit Legende', steps: ['Der Plan zeigt fünf Orte von oben. Die Legende rechts erklärt die Zeichen.', 'Norden ist oben, Osten rechts, Süden unten, Westen links.', 'Such zuerst den Ort aus der Frage, dann schau in die Richtung.'] },
    'karte:1': { title: 'Schatzkarte', steps: ['Du startest beim Zelt.', 'Norden ist oben, Osten rechts, Süden unten, Westen links – wie auf der Windrose.', 'Zähle die Felder Schritt für Schritt und tippe auf das Feld, wo der Schatz liegt.'] },
    'karte:2': { title: 'Schatzkarte mit Nebenrichtungen', steps: ['Jetzt kommen Nordosten, Südosten, Südwesten und Nordwesten dazu.', 'Ein Feld nach Nordosten heißt: ein Feld schräg nach oben rechts.', 'Zähle Schritt für Schritt und tippe auf das Feld mit dem Schatz.'] },
    'karte:3': { title: 'Schatzkarte mit Maßstab', steps: ['Der Maßstab sagt: 1 Feld = 100 m. 200 m sind also 2 Felder.', 'Manchmal sollst du den Schatz finden, manchmal ausrechnen, wie weit der Weg ist.', 'Für die Länge zählst du die Felder nach oben oder unten und nach links oder rechts und rechnest mal 100 m.'] },
    'lt:1': { title: 'Lückentext', steps: ['Im Satz fehlt ein Wort (___).', 'Lies den Satz mit jedem Wort einmal durch.', 'Tippe auf das Wort, das passt.'] },
  };
  function kkGen(cfg) {
    return (mod, tier, know, seq, opts) => {
      if (mod === 'karte') return makeKarte(tier);
      if (mod === 'rose') return roseTask(mod);
      if (wantsPool(cfg, mod, opts)) return null;
      if (mod === 'plan' && Math.random() < 0.7) return planTask(mod);
      return null;
    };
  }
  const KK = { modules: KK_MODULES, tut: KK_TUT, notes: KK_NOTES, pool: KK_POOL, worlds: 1, title: 'Kompass und Karte', icon: '🧭', sub: 'Himmelsrichtungen, Windrose, Plan mit Legende und die Schatzkarte', swap: { from: 'treasure', to: 'karte' },
    starters: [{ id: 'kartenzeichnerin', type: 'normal', shape: 'kartenzeichnerin', names: ['Die Kartenzeichnerin', 'Die Kartenzeichnerin', 'Die Kartenzeichnerin'], hp: 70, desc: 'Sie vermisst Wege und Felder mit Kompass und Messkette und zeichnet daraus Karten.', perk: 'crit',
      attacks: [{ name: 'Sonnenstand', mod: 'richtung' }, { name: 'Kompassnadel', mod: 'rose' }, { name: 'Messkette', mod: 'plan' }, { name: 'Fernrohr', mod: 'karte' }] }],
    extra: { richtung: 'Polarstern', rose: 'Wetterfahne', plan: 'Grenzstein', karte: 'Wegweiser', lt: 'Merkvers' },
    enemies: { 1: {
      normal: [
        { name: 'Die Nebelbank', type: 'wasser', shape: 'ghost', hp: 26, atk: 3 },
        { name: 'Das Dornengestrüpp', type: 'pflanze', shape: 'vine', hp: 28, atk: 4 },
        { name: 'Der Morast', type: 'wasser', shape: 'blob', hp: 30, atk: 3 },
        { name: 'Die Elster', type: 'normal', shape: 'bat', hp: 24, atk: 4 },
      ],
      elite: { name: 'Der Kartendieb', type: 'normal', shape: 'merchant', hp: 45, atk: 5 },
      boss: { name: 'Der Magnetberg', acc: 'den Magnetberg', type: 'normal', shape: 'rock', hp: 70, atk: 6, boss: true },
    } },
    moves: ['Nebelschleier', 'Dornenranke', 'Schlammloch', 'Kompassstörung', 'Falscher Wegweiser', 'Steinschlag'],
    events: [
      { title: 'Der Wegweiser', text: 'An einer Kreuzung steht ein alter Wegweiser. Eine Wanderin fragt dich nach dem Lauf der Sonne und schenkt dir einen Trank.', opts: [{ label: 'Antworten', task: 'richtung', g: 'sonne', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Aussichtsturm', text: 'Vom Turm aus siehst du das ganze Dorf. Der Turmwärter zeigt dir einen Plan und stellt dir eine Frage.', opts: [{ label: 'Antworten', task: 'plan', g: 'plan', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Försterin', text: 'Die Försterin kennt eine Eselsbrücke. Sie verrät sie dir für eine richtige Antwort.', opts: [{ label: 'Antworten', task: 'any', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der verlorene Kompass', text: 'Im Gras liegt ein Kompass. Der Mann, der ihn sucht, gibt dir eine Chilischote, wenn du seine Frage beantwortest.', opts: [{ label: 'Antworten', task: 'any', win: { item: 'keks' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Schutzhütte', text: 'Am Waldrand steht eine Schutzhütte mit einer Bank. Hier ruhst du dich aus.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
    ] };
  KK.gen = kkGen(KK);

  K.MODES.kornkammer = KO; K.MODES.wetterstation = WE; K.MODES.kompass = KK;
  return { PLANTS, GRAIN_PARTS, CYCLE_PARTS, BROT, CEREALS, WATER, TERMS, FLOAT, DIRS, LANDKREIS, karteTarget, karteText, makeKarte, mapSVG, laborSet, urnExperiment, landkreisPool, inGrid };
})();
if (typeof module !== 'undefined') module.exports = MS;
