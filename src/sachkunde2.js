// Sachkunde Klasse 3 (Lehrplan Sachsen LB 2 und LB 5): Die fünf Sinne, Sicher im Verkehr.
// Uses the picture and task helpers of sachkunde.js and registers its units in MK.MODES.
const MS2 = (() => {
  const K = typeof MK !== 'undefined' ? MK : require('./knowledge.js');
  const S = typeof MS !== 'undefined' ? MS : require('./sachkunde.js');
  const { shuffle, pick, rnd } = K;
  const { NS, STROKE, txt, choice, partsSVG, plantTask, partPool, wantsPool, orderTask, PLANTS } = S;
  const HIT = (d) => `<path class="hitarea" d="${d}" fill="transparent"/>`;

  /* ================= DIE FÜNF SINNE (LB 2) ================= */
  // Teile von Auge und Ohr (für Lehrkräfte anpassbar): id, name, desc (Notizkarte), tip (Hinweis beim Suchen)
  const EYE_PARTS = [
    { id: 'braue', name: 'Augenbraue', desc: 'Der Haarbogen über dem Auge. Er lenkt Schweiß und Regen zur Seite ab.', tip: 'Der Teil ist ganz oben, über dem Auge.' },
    { id: 'lid', name: 'Augenlid', desc: 'Es schließt sich beim Blinzeln, verteilt die Tränenflüssigkeit und schützt das Auge.', tip: 'Der Teil ist die Hautfalte, die oben über dem Auge liegt.' },
    { id: 'wimpern', name: 'Wimpern', desc: 'Kurze Haare am Rand des Augenlids. Sie halten Staub und kleine Fliegen ab.', tip: 'Der Teil sind kurze Haare am Rand des Lids.' },
    { id: 'iris', name: 'Regenbogenhaut (Iris)', desc: 'Der farbige Ring um die Pupille. Sie macht die Pupille größer oder kleiner.', tip: 'Der Teil ist der farbige Ring.' },
    { id: 'pupille', name: 'Pupille', desc: 'Das schwarze Loch in der Mitte. Durch sie fällt Licht ins Auge. Im Hellen wird sie klein, im Dunkeln groß.', tip: 'Der Teil ist der schwarze Kreis in der Mitte.' },
    { id: 'traenen', name: 'Tränen', desc: 'Sie halten das Auge feucht und spülen Staub heraus.', tip: 'Der Teil sind Tropfen am Augenwinkel.' },
  ];
  const EYE = { label: 'Auge', box: '0 0 300 200', parts: EYE_PARTS, qid: 'sa_', note: 'auge', poolQ: 'Wie heißt dieser Teil des Auges?', tap: 'den Teil des Auges',
    stepOf: { lid: 1, iris: 2, pupille: 3, wimpern: 4, braue: 5, traenen: 6 },
    steps: ['Zeichne die Form des Auges und darüber das Augenlid.', 'Zeichne in die Mitte einen Kreis: die Regenbogenhaut.', 'Male in die Mitte der Regenbogenhaut die schwarze Pupille.', 'Zeichne die Wimpern an den Rand des Augenlids.', 'Zeichne über das Auge die Augenbraue.', 'Zeichne am Augenwinkel zwei Tränen.'],
    ask: () => 'Wie heißt der leuchtende Teil des Auges?', find: (p) => `Tippe auf: ${p.name}` };
  // points on the edges of the eye opening: quadratic curves from 60|110 over 150|cy to 240|110 (cy 44 above, 170 below)
  const lidAt = (t, cy) => [(1 - t) ** 2 * 60 + 2 * t * (1 - t) * 150 + t * t * 240, (1 - t) ** 2 * 110 + 2 * t * (1 - t) * cy + t * t * 110];
  const f1 = (v) => Math.round(v * 10) / 10;
  // texture strokes sit in style="" so a glowing part keeps them (the glow rule recolours stroke attributes only)
  const tex = (d, c, w, o) => `<path d="${d}" fill="none" style="stroke:${c};stroke-width:${w}" stroke-linecap="round"${o ? ` opacity="${o}"` : ''}/>`;
  const lashes = (cy, ts, len) => ts.map((t) => { const [x, y] = lidAt(t, cy), dx = (t - 0.5) * 26, l = len * (1 - Math.abs(t - 0.5)) * (cy < 110 ? -1 : 1); return `M${f1(x)} ${f1(y)} q${f1(dx * 0.1)} ${f1(l * 0.8)} ${f1(dx)} ${f1(l)}`; }).join(' ');
  const ray = (cx, cy, n, r0, r1, odd) => Array.from({ length: n }, (_, i) => { const a = (i * 2 + odd) * Math.PI / n + (i % 3) * 0.04, a1 = r0 + (i % 3), b = r1 - (i % 4) * 2.5; return `M${f1(cx + Math.cos(a) * a1)} ${f1(cy + Math.sin(a) * a1)} L${f1(cx + Math.cos(a) * b)} ${f1(cy + Math.sin(a) * b)}`; }).join(' ');
  const EYE_OPEN = 'M60 110 Q150 44 240 110 Q150 170 60 110 Z';
  EYE.svg = (opts) => partsSVG(EYE, opts, (g) => `<defs>
    <radialGradient id="eySk" cx="45%" cy="40%" r="75%"><stop offset="0" stop-color="#FBE3CB"/><stop offset=".6" stop-color="#F3CDAA"/><stop offset="1" stop-color="#E2AE88"/></radialGradient>
    <radialGradient id="eySo" cx="50%" cy="55%" r="50%"><stop offset=".55" stop-color="#C98466" stop-opacity=".32"/><stop offset="1" stop-color="#C98466" stop-opacity="0"/></radialGradient>
    <radialGradient id="eyWh" cx="50%" cy="62%" r="58%"><stop offset=".5" stop-color="#FFFFFF"/><stop offset=".85" stop-color="#F1EBEC"/><stop offset="1" stop-color="#DCCFD3"/></radialGradient>
    <radialGradient id="eyIr" cx="50%" cy="50%" r="50%"><stop offset=".3" stop-color="#C79A4E"/><stop offset=".48" stop-color="#7FAE9A"/><stop offset=".62" stop-color="#4E95C4"/><stop offset=".86" stop-color="#2F6EA3"/><stop offset="1" stop-color="#1A3E63"/></radialGradient>
    <radialGradient id="eyPu" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#2C3350"/><stop offset="1" stop-color="#0A0D18"/></radialGradient>
    <linearGradient id="eyLd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6D3B2"/><stop offset=".7" stop-color="#EBB792"/><stop offset="1" stop-color="#D99878"/></linearGradient>
    <linearGradient id="eyBr" x1="0" y1="0" x2="1" y2=".3"><stop offset="0" stop-color="#5A3820"/><stop offset=".55" stop-color="#7A4E2C"/><stop offset="1" stop-color="#9A6A42"/></linearGradient>
    <radialGradient id="eyTr" cx="38%" cy="62%" r="65%"><stop offset="0" stop-color="#F4FCFF"/><stop offset=".6" stop-color="#A9DCF6"/><stop offset="1" stop-color="#5FA8DA"/></radialGradient>
    <clipPath id="eyCl"><path d="${EYE_OPEN}"/></clipPath></defs>
    <rect width="300" height="200" rx="14" fill="url(#eySk)"/>
    <ellipse cx="150" cy="104" rx="128" ry="78" fill="url(#eySo)"/>
    <path d="M44 118 Q150 196 256 114" fill="none" stroke="#D7A07E" stroke-width="2" stroke-linecap="round" opacity=".7"/>
    <path d="M58 116 Q150 182 242 114 Q150 170 58 116 Z" fill="#E7A99A" opacity=".8"/>
    <path d="${EYE_OPEN}" fill="url(#eyWh)"/>
    <g clip-path="url(#eyCl)"><ellipse cx="68" cy="111" rx="9" ry="6" fill="#E88E95"/><ellipse cx="66" cy="109" rx="3" ry="1.8" fill="#fff" opacity=".7"/><path d="M200 128 Q214 122 226 116 M96 128 Q86 122 80 117" fill="none" stroke="#E3A3A8" stroke-width="1" opacity=".6"/></g>
    ${g('iris', `<g clip-path="url(#eyCl)"><circle cx="150" cy="108" r="31" fill="url(#eyIr)" stroke="#173757" stroke-width="2.5"/>${tex(ray(150, 108, 36, 14, 29, 0), '#D8F0FA', 0.9, 0.55)}${tex(ray(150, 108, 36, 14, 28, 1), '#1F4F7E', 0.9, 0.5)}${tex(Array.from({ length: 29 }, (_, i) => { const a = i * Math.PI / 14, r = i % 2 ? 16.5 : 19; return `${i ? 'L' : 'M'}${f1(150 + Math.cos(a) * r)} ${f1(108 + Math.sin(a) * r)}`; }).join('') + 'Z', '#E7C27A', 1.1, 0.7)}</g>`)}
    ${g('pupille', `<circle cx="150" cy="108" r="12.5" fill="url(#eyPu)" stroke="#05070D" stroke-width="1.5"/><ellipse cx="142" cy="99" rx="5.5" ry="4.5" fill="#fff" transform="rotate(-25 142 99)"/><circle cx="160" cy="116" r="2.2" fill="#fff" opacity=".85"/>`)}
    ${g('lid', `<g clip-path="url(#eyCl)"><path d="M60 110 Q150 44 240 110 Q150 66 60 110 Z" style="stroke:none" fill="#6E4A52" opacity=".22"/></g><path d="M52 110 Q150 4 248 110 Q150 42 52 110 Z" fill="url(#eyLd)" stroke="${STROKE}" stroke-width="2.5" stroke-linejoin="round"/>${tex('M70 100 Q150 40 230 100', '#C8876A', 2, 0.7)}${tex('M104 62 Q150 44 194 58', '#FFF4E6', 3.5, 0.55)}`)}
    <path d="M60 110 Q150 170 240 110" fill="none" stroke="${STROKE}" stroke-width="2.5" stroke-linecap="round"/>
    ${g('wimpern', `<path d="${lashes(44, [0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.88, 0.95], 18)}" stroke="#2B1D14" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="${lashes(170, [0.22, 0.34, 0.46, 0.58, 0.7, 0.8, 0.88], 7)}" stroke="#3A2A1E" stroke-width="1.4" fill="none" stroke-linecap="round"/>${HIT('M60 104 Q150 30 240 104 L246 80 Q150 4 54 80 Z')}`)}
    ${g('braue', `<path d="M66 52 Q70 34 102 24 Q160 6 238 34 Q240 40 232 40 Q166 24 112 38 Q84 46 74 56 Q66 60 66 52 Z" fill="url(#eyBr)" stroke="${STROKE}" stroke-width="2" stroke-linejoin="round"/>${tex(Array.from({ length: 20 }, (_, i) => { const t = 0.03 + i * 0.045, x = (1 - t) ** 2 * 72 + 2 * t * (1 - t) * 140 + t * t * 234, y = (1 - t) ** 2 * 52 + 2 * t * (1 - t) * 8 + t * t * 37; return `M${f1(x - 3)} ${f1(y + 3 - t * 2)} l${f1(6 + t * 3)} ${f1(-5 + t * 4)}`; }).join(' '), '#3C2414', 1.2, 0.7)}${tex('M110 28 Q160 14 210 24', '#B88A60', 1.6, 0.6)}${HIT('M60 62 Q150 0 244 44 L244 18 Q150 -20 60 30 Z')}`)}
    ${g('traenen', `<path d="M52 120 Q61 134 61 141 A9 9 0 0 1 43 141 Q43 134 52 120 Z" fill="url(#eyTr)" stroke="${STROKE}" stroke-width="2"/><path d="M46 157 Q53 167 53 172 A7 7 0 0 1 39 172 Q39 167 46 157 Z" fill="url(#eyTr)" stroke="${STROKE}" stroke-width="2"/><ellipse cx="48.5" cy="137" rx="2" ry="3.5" fill="#fff" style="stroke:none"/><circle cx="43.5" cy="169" r="1.6" fill="#fff" style="stroke:none"/>${HIT('M30 118 L70 118 L70 184 L30 184 Z')}`)}`,
  [['braue', 296, 22, 'end'], ['lid', 296, 76, 'end', [230, 92]], ['wimpern', 6, 60, 'start', [84, 80]], ['iris', 296, 168, 'end', [176, 126]], ['pupille', 150, 192, 'middle', [150, 123]], ['traenen', 74, 176]]);

  const EAR_PARTS = [
    { id: 'muschel', name: 'Ohrmuschel', desc: 'Der Teil außen am Kopf. Sie fängt den Schall auf wie ein Trichter.', tip: 'Der Teil ist außen am Kopf.' },
    { id: 'gang', name: 'Gehörgang', desc: 'Ein kurzer Gang, der den Schall nach innen leitet. Hier entsteht das Ohrenschmalz.', tip: 'Der Teil ist der Gang von außen nach innen.' },
    { id: 'trommelfell', name: 'Trommelfell', desc: 'Eine dünne Haut am Ende des Gehörgangs. Der Schall bringt sie zum Schwingen.', tip: 'Der Teil ist die dünne Haut am Ende des Gangs.' },
    { id: 'knochen', name: 'Gehörknöchelchen', desc: 'Hammer, Amboss und Steigbügel: drei winzige Knochen. Sie geben die Schwingungen weiter.', tip: 'Der Teil sind drei winzige Knochen hinter der dünnen Haut.' },
    { id: 'schnecke', name: 'Hörschnecke', desc: 'Sie sieht aus wie ein Schneckenhaus und ist mit Flüssigkeit gefüllt. Hier wird aus dem Schall ein Signal für das Gehirn.', tip: 'Der Teil sieht aus wie ein Schneckenhaus.' },
  ];
  const EAR = { label: 'Ohr', box: '0 0 300 200', parts: EAR_PARTS, qid: 'so_', note: 'ohr', poolQ: 'Wie heißt dieser Teil des Ohrs?', tap: 'den Teil des Ohrs',
    stepOf: { muschel: 1, gang: 2, trommelfell: 3, knochen: 4, schnecke: 5 },
    steps: ['Zeichne außen die Ohrmuschel. Sie sieht aus wie ein Trichter.', 'Zeichne den Gehörgang nach innen.', 'Zeichne am Ende des Gangs das Trommelfell.', 'Zeichne dahinter drei winzige Knochen: die Gehörknöchelchen.', 'Zeichne ganz innen die Hörschnecke.'],
    ask: () => 'Wie heißt der leuchtende Teil des Ohrs?', find: (p) => `Tippe auf: ${p.name}` };
  // the cochlea: two turns spiralling in from the oval window (left) to its tip
  const COCHLEA = Array.from({ length: 49 }, (_, i) => { const a = Math.PI + i * Math.PI / 12, r = 27 - i * 0.4; return `${i ? 'L' : 'M'}${f1(246 + Math.cos(a) * r)} ${f1(112 - Math.sin(a) * r)}`; }).join('');
  EAR.svg = (opts) => partsSVG(EAR, opts, (g) => `<defs>
    <radialGradient id="eaSk" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#FBE0C6"/><stop offset=".6" stop-color="#F2C29C"/><stop offset="1" stop-color="#DFA27C"/></radialGradient>
    <linearGradient id="eaBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F9DEC4"/><stop offset="1" stop-color="#EDC3A0"/></linearGradient>
    <linearGradient id="eaBn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6EEDF"/><stop offset="1" stop-color="#E4D6BE"/></linearGradient>
    <pattern id="eaDt" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="#CDBB9C"/><circle cx="9" cy="8" r=".8" fill="#D6C6AA"/><circle cx="5" cy="10" r=".6" fill="#C7B393"/></pattern>
    <radialGradient id="eaAi" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E3E1EE"/></radialGradient>
    <linearGradient id="eaCa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C77468"/><stop offset=".35" stop-color="#F6C3B4"/><stop offset=".7" stop-color="#EDA796"/><stop offset="1" stop-color="#B9645A"/></linearGradient>
    <radialGradient id="eaCo" cx="60%" cy="40%" r="70%"><stop offset="0" stop-color="#C47460"/><stop offset="1" stop-color="#E8A688"/></radialGradient>
    <linearGradient id="eaDr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF7EC"/><stop offset="1" stop-color="#D9C3CF"/></linearGradient>
    <radialGradient id="eaOs" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#FFFDF6"/><stop offset=".6" stop-color="#F3E6C8"/><stop offset="1" stop-color="#D8C298"/></radialGradient>
    <linearGradient id="eaSn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9FDCEB"/><stop offset="1" stop-color="#4FA8C4"/></linearGradient></defs>
    <rect width="300" height="200" rx="14" fill="url(#eaBg)"/>
    <path d="M64 20 L300 20 L300 190 L64 190 Q80 150 70 106 Q80 60 64 20 Z" fill="url(#eaBn)"/><path d="M64 20 L300 20 L300 190 L64 190 Q80 150 70 106 Q80 60 64 20 Z" fill="url(#eaDt)" stroke="#B49F80" stroke-width="2"/>
    <path d="M168 76 Q190 64 214 76 Q224 92 220 116 Q214 134 192 136 Q170 134 166 118 Z" fill="url(#eaAi)" stroke="#B9A88E" stroke-width="1.5"/>
    <path d="M190 134 Q186 160 176 190 L192 190 Q198 160 202 134 Z" fill="#EFD7CF" stroke="#C9AFA2" stroke-width="1.2"/>
    <path d="M252 118 Q272 128 300 120" fill="none" stroke="${STROKE}" stroke-width="7" stroke-linecap="round"/><path d="M252 118 Q272 128 300 120" fill="none" stroke="#F2C14E" stroke-width="4" stroke-linecap="round"/><path d="M256 117 Q272 125 298 118" fill="none" stroke="#FFE7A0" stroke-width="1.2"/>
    ${g('muschel', `<path d="M74 46 C66 18 38 8 20 28 C6 46 8 84 16 110 C22 128 30 136 30 152 C30 170 40 180 52 178 C64 176 68 164 66 150 C64 138 70 128 72 120 Z" fill="url(#eaSk)" stroke="${STROKE}" stroke-width="2.8" stroke-linejoin="round"/>${tex('M66 40 C58 24 38 20 28 34 C18 50 20 82 26 104 C30 118 38 126 40 142', '#FFEBDA', 4, 0.7)}${tex('M68 44 C60 30 40 26 31 38 C22 52 23 82 29 104 C33 118 41 126 43 142', '#C98466', 2, 0.9)}${tex('M62 56 C52 48 42 54 40 68 C38 84 42 96 50 108 M48 60 C44 48 50 40 60 42', '#D49274', 3)}${tex('M60 54 C51 47 43 52 42 66', '#FFF0E2', 1.5, 0.8)}<path d="M50 84 C40 92 42 112 54 118 C62 122 70 116 72 112 L72 92 C66 84 58 80 50 84 Z" fill="url(#eaCo)" stroke="#9E5A48" stroke-width="1.5"/><path d="M72 116 Q80 118 78 108" fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round"/>${tex('M38 160 Q44 170 54 168', '#E89C8A', 3, 0.5)}`)}
    ${g('gang', `<path d="M66 96 C96 88 128 98 160 94 L160 118 C128 122 96 112 66 118 Z" fill="url(#eaCa)" stroke="${STROKE}" stroke-width="2.5" stroke-linejoin="round"/>${tex('M76 101 C100 96 130 104 156 101', '#FFE1D6', 2, 0.8)}${tex('M72 96 l4 5 M80 94 l3 5 M76 118 l3 -5 M84 116 l2 -5', '#9E5A48', 1)}<ellipse cx="104" cy="113" rx="5" ry="2.8" fill="#D9A441" stroke="#9E7424" stroke-width="1"/><ellipse cx="103" cy="112" rx="1.8" ry="1" fill="#FFE29A" style="stroke:none"/>`)}
    ${g('trommelfell', `<ellipse cx="163" cy="106" rx="4.5" ry="20" fill="url(#eaDr)" stroke="${STROKE}" stroke-width="2.2" transform="rotate(-10 163 106)"/><path d="M163 108 L166 120 L161 120 Z" fill="#fff" opacity=".9" style="stroke:none"/>${HIT('M152 82 L172 82 L172 130 L152 130 Z')}`)}
    ${g('knochen', `<g fill="url(#eaOs)" stroke="${STROKE}" stroke-width="2" stroke-linejoin="round"><path d="M163 119 Q161 113 164 108 L170 90 Q167 78 175 71 Q185 66 189 75 Q191 85 181 89 L174 92 L169 113 Q167 120 163 119 Z"/><path d="M188 73 Q195 64 205 68 L214 63 Q217 70 208 77 Q209 86 204 92 L202 104 Q204 109 199 111 Q194 110 196 104 L196 93 Q190 90 188 83 Z"/><path d="M198 105 L203 104 Q208 97 216 97 L220 97 L220 123 L216 123 Q208 123 203 115 L198 114 Z M206 110 Q209 103 215 102 L215 118 Q209 117 206 112 Z" fill-rule="evenodd"/></g>${tex('M172 76 Q176 71 182 72 M193 70 Q198 67 203 70 M208 101 Q212 99 216 99', '#FFFFFF', 1.5, 0.9)}${HIT('M162 72 L222 72 L222 122 L162 122 Z')}`)}
    ${g('schnecke', `<ellipse cx="225" cy="110" rx="7" ry="11" fill="url(#eaSn)" stroke="${STROKE}" stroke-width="2"/><path d="${COCHLEA}" fill="none" stroke="${STROKE}" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round"/><path d="${COCHLEA}" fill="none" style="stroke:url(#eaSn);stroke-width:7.5" stroke-linecap="round" stroke-linejoin="round"/>${tex(COCHLEA, '#DDF4FA', 1.6, 0.8)}${HIT('M214 80 L278 80 L278 144 L214 144 Z')}`)}`,
  [['muschel', 8, 192], ['gang', 112, 84, 'middle'], ['trommelfell', 160, 150, 'middle', [163, 128]], ['knochen', 196, 54, 'middle', [194, 66]], ['schnecke', 250, 162, 'middle', [250, 143]]]);
  PLANTS.auge = EYE; PLANTS.ohr = EAR;

  const SENSES = [
    { organ: 'Das Auge', sinn: 'Sehen', ex: ['Am Himmel steht ein Regenbogen.', 'Die Blume ist gelb.', 'Im Buch stehen viele Buchstaben.'] },
    { organ: 'Das Ohr', sinn: 'Hören', ex: ['Der Wecker klingelt.', 'Ein Hund bellt.', 'Die Kirchenglocke läutet.'] },
    { organ: 'Die Nase', sinn: 'Riechen', ex: ['In der Bäckerei duftet es nach Brötchen.', 'Die Rose duftet.', 'Es riecht nach Rauch.'] },
    { organ: 'Die Zunge', sinn: 'Schmecken', ex: ['Die Zitrone schmeckt sauer.', 'Die Suppe schmeckt salzig.', 'Der Honig schmeckt süß.'] },
    { organ: 'Die Haut', sinn: 'Fühlen', ex: ['Das Katzenfell ist weich.', 'Der Schnee ist kalt.', 'Der Igel ist stachelig.'] },
  ];
  function senseTask(mod) {
    const s = pick(SENSES); const others = (k) => shuffle(SENSES.filter((x) => x !== s)).slice(0, 2).map((x) => x[k]); const v = rnd(0, 2);
    if (v === 0) { const ex = pick(s.ex); return choice(mod, 'sinne', `„${ex}“ Welches Sinnesorgan merkt das?`, s.organ, others('organ'), 'ssex_' + s.sinn + s.ex.indexOf(ex)); }
    if (v === 1) return choice(mod, 'sinne', `Welcher Sinn gehört zum Sinnesorgan ${s.organ.split(' ')[1]}?`, s.sinn, others('sinn'), 'sssinn_' + s.sinn);
    return choice(mod, 'sinne', `Welches Sinnesorgan brauchst du zum ${s.sinn}?`, s.organ, others('organ'), 'ssorg_' + s.sinn);
  }

  const SI_NOTES = {
    sinne: { title: 'Die fünf Sinne', lines: ['Mit den Augen sehen wir.', 'Mit den Ohren hören wir.', 'Mit der Nase riechen wir.', 'Mit der Zunge schmecken wir: süß, sauer, salzig und bitter.', 'Mit der Haut fühlen und tasten wir: warm und kalt, weich und hart, Schmerz.', 'Die Sinnesorgane schicken ihre Meldungen an das Gehirn. Erst dort wissen wir, was wir sehen, hören, riechen, schmecken und fühlen.'] },
    auge: { title: 'Das Auge', lines: EYE_PARTS.map((p) => `${p.name}: ${p.desc}`) },
    ohr: { title: 'Das Ohr', lines: EAR_PARTS.map((p) => `${p.name}: ${p.desc}`) },
    schutz: { title: 'Sinne schützen', lines: ['Schau nie direkt in die Sonne, auch nicht mit Sonnenbrille. Eine Sonnenbrille schützt vor grellem Licht.', 'Reibe deine Augen nicht. Ist etwas hineingekommen, blinzle oder spüle mit klarem Wasser.', 'Lies und male bei gutem Licht und mach Pausen vor dem Bildschirm.', 'Hör Musik nicht zu laut, auch nicht mit Kopfhörern. Bei großem Lärm helfen Ohrenschützer.', 'Steck nichts in deine Ohren, auch keine Wattestäbchen.', 'Nase und Zunge warnen dich: Riecht oder schmeckt etwas muffig oder sauer, iss es nicht.', 'Puste heißes Essen, bevor du es probierst. Schütze deine Haut mit Sonnencreme und im Winter mit Handschuhen.'] },
    hilfen: { title: 'Menschen mit Behinderung', lines: ['Blinde Menschen lesen die Blindenschrift (Brailleschrift) mit den Fingerspitzen. Sie besteht aus erhabenen Punkten.', 'Ein Blindenführhund führt einen blinden Menschen. Wenn er arbeitet, darf man ihn nicht streicheln oder ablenken.', 'Viele blinde Menschen tasten sich mit einem weißen Stock voran. Rillen im Boden zeigen ihnen den Weg.', 'Gehörlose Menschen sprechen oft mit Gebärdensprache: mit Händen, Gesicht und Körper.', 'Ein Hörgerät macht Töne lauter. Sprich deutlich und schau die Person an, schreien musst du nicht.', 'Menschen im Rollstuhl brauchen Rampen und Aufzüge statt Treppen.', 'Wie kann ich helfen? Frag zuerst: „Kann ich Ihnen helfen?“ Und hilf so, wie die Person es möchte.'] },
    drogen: { title: 'Gesund bleiben: Nein zu Drogen', lines: ['Rauchen schadet Lunge und Herz. Das Nikotin im Tabak macht süchtig.', 'Auch Passivrauchen schadet: wenn man den Rauch anderer einatmet.', 'Alkohol schadet dem Gehirn und der Leber. Für Kinder ist er besonders gefährlich, schon wenig kann sie vergiften.', 'Medikamente nimmst du nur, wenn deine Eltern oder ein Arzt sie dir geben. Tabletten sind keine Bonbons.', 'Du darfst immer Nein sagen. Ein echter Freund akzeptiert dein Nein.', 'Gruppendruck heißt: Andere drängen dich, etwas zu tun, was du nicht willst. Hol dir Hilfe bei einem Erwachsenen, dem du vertraust.'] },
    taeuschung: { title: 'Sinnestäuschungen', lines: ['Manchmal irren sich unsere Sinne. Das nennt man Sinnestäuschung.', 'Augen lassen sich von der Umgebung täuschen: von Pfeilspitzen, großen oder kleinen Kreisen, hellem oder dunklem Grund.', 'Die Haut spürt vor allem, ob etwas wärmer oder kälter ist als vorher.', 'Nase und Zunge arbeiten zusammen. Mit zugehaltener Nase schmeckt vieles fast gleich.', 'Nachmessen hilft: Ein Lineal lässt sich nicht täuschen.'] },
  };
  const SI_POOL = partPool('auge', 'parts', 'auge', 'sa_').concat(partPool('ohr', 'parts', 'ohr', 'so_'), [
    // Die fünf Sinne
    { id: 'sise1', mod: 'sinne', g: 'sinne', q: 'Wie viele Sinne lernst du in der Schule kennen?', o: ['5', '3', '10'], a: 0 },
    { id: 'sise2', mod: 'sinne', g: 'sinne', q: 'Welches ist das größte Sinnesorgan?', o: ['Die Haut', 'Das Auge', 'Die Nase'], a: 0 },
    { id: 'sise3', mod: 'sinne', g: 'sinne', q: 'Wohin schicken die Sinnesorgane ihre Meldungen?', o: ['An das Gehirn', 'An den Magen', 'An die Füße'], a: 0 },
    { id: 'sise4', mod: 'sinne', g: 'sinne', q: 'Was kann die Zunge schmecken?', o: ['Süß, sauer, salzig und bitter', 'Laut und leise', 'Hell und dunkel'], a: 0 },
    { id: 'sise5', mod: 'sinne', g: 'sinne', q: 'Mit der Haut kannst du fühlen, ob etwas warm oder kalt ist.', rf: true, a: true },
    { id: 'sise6', mod: 'sinne', g: 'sinne', q: 'Mit der Nase kannst du hören.', rf: true, a: false, why: 'Mit der Nase riechst du. Hören kannst du mit den Ohren.' },
    { id: 'sise7', mod: 'sinne', g: 'sinne', q: 'An welcher Stelle spürt die Haut besonders fein?', o: ['An den Fingerspitzen', 'Am Rücken', 'An den Ellenbogen'], a: 0 },
    { id: 'sise8', mod: 'sinne', g: 'sinne', q: 'Wenn du Schnupfen hast, schmeckst du weniger.', rf: true, a: true },
    { id: 'sise9', mod: 'sinne', g: 'auge', q: 'Was macht die Pupille im Dunkeln?', o: ['Sie wird größer', 'Sie wird kleiner', 'Sie wird bunt'], a: 0 },
    { id: 'sise10', mod: 'sinne', g: 'ohr', q: 'Was bringt der Schall im Ohr zum Schwingen?', o: ['Das Trommelfell', 'Die Augenbraue', 'Die Zunge'], a: 0 },
    { id: 'sise11', mod: 'sinne', g: 'auge', q: 'Wozu sind die Wimpern da?', o: ['Sie halten Staub vom Auge fern', 'Sie helfen beim Hören', 'Sie machen das Auge bunt'], a: 0 },
    { id: 'sise12', mod: 'sinne', g: 'ohr', q: 'Die Ohrmuschel fängt den Schall auf wie ein Trichter.', rf: true, a: true },
    // Sinne schützen
    { id: 'sisch1', mod: 'schutz', g: 'schutz', q: 'Mit einer Sonnenbrille darf man direkt in die Sonne schauen.', rf: true, a: false, why: 'Schau nie direkt in die Sonne, auch nicht mit Sonnenbrille. Das kann die Augen für immer schädigen.' },
    { id: 'sisch2', mod: 'schutz', g: 'schutz', q: 'Dir ist Sand ins Auge geflogen. Was tust du?', o: ['Blinzeln oder mit klarem Wasser ausspülen', 'Fest mit der Faust reiben', 'Mit dem Finger hineingreifen'], a: 0 },
    { id: 'sisch3', mod: 'schutz', g: 'schutz', q: 'Sehr laute Musik kann den Ohren schaden.', rf: true, a: true },
    { id: 'sisch4', mod: 'schutz', g: 'schutz', q: 'Wie hörst du Musik mit Kopfhörern?', o: ['So leise, dass du deine Umgebung noch hörst', 'So laut wie möglich', 'Die ganze Nacht'], a: 0 },
    { id: 'sisch5', mod: 'schutz', g: 'schutz', q: 'Man sollte mit Wattestäbchen tief in den Gehörgang bohren.', rf: true, a: false, why: 'Nichts gehört in den Gehörgang. Das Trommelfell kann verletzt werden.' },
    { id: 'sisch6', mod: 'schutz', g: 'schutz', q: 'Die Milch riecht sauer und muffig. Was machst du?', o: ['Ich trinke sie nicht und sage es einem Erwachsenen', 'Ich trinke sie schnell aus', 'Ich gebe sie meinem kleinen Bruder'], a: 0 },
    { id: 'sisch7', mod: 'schutz', g: 'schutz', q: 'Welche Sinne warnen dich vor verdorbenem Essen?', o: ['Nase und Zunge', 'Ohren und Haut', 'Nur die Ohren'], a: 0 },
    { id: 'sisch8', mod: 'schutz', g: 'schutz', q: 'Wie schützt du deine Ohren bei großem Lärm, zum Beispiel beim Feuerwerk?', o: ['Mit Ohrenschützern oder Gehörschutz', 'Mit einer Mütze aus Papier', 'Gar nicht, das muss man nicht'], a: 0 },
    { id: 'sisch9', mod: 'schutz', g: 'schutz', q: 'Lesen bei schlechtem Licht strengt die Augen an.', rf: true, a: true },
    { id: 'sisch10', mod: 'schutz', g: 'schutz', q: 'Was tut deinen Augen gut, wenn du lange am Bildschirm sitzt?', o: ['Pausen machen und in die Ferne schauen', 'Noch näher an den Bildschirm gehen', 'Das Licht im Zimmer ausmachen'], a: 0 },
    { id: 'sisch11', mod: 'schutz', g: 'schutz', q: 'Wie schützt du deine Haut im Sommer in der Sonne?', o: ['Mit Sonnencreme, Mütze und Schatten', 'Mit Wasser im Gesicht', 'Gar nicht'], a: 0 },
    { id: 'sisch12', mod: 'schutz', g: 'schutz', q: 'Heiße Suppe probierst du am besten sofort mit einem großen Löffel.', rf: true, a: false, why: 'Puste erst und probiere vorsichtig. Sonst verbrennst du dir die Zunge.' },
    { id: 'sisch13', mod: 'schutz', g: 'schutz', q: 'Warum soll man die Augen nicht reiben?', o: ['Schmutz und Keime können das Auge verletzen', 'Weil die Wimpern sonst blau werden', 'Weil man dann schlechter hört'], a: 0 },
    // Menschen mit Behinderung, Hilfen
    { id: 'sihi1', mod: 'hilfe', g: 'hilfen', q: 'Wie lesen blinde Menschen die Blindenschrift?', o: ['Mit den Fingerspitzen', 'Mit den Ohren', 'Mit einer Lupe'], a: 0 },
    { id: 'sihi2', mod: 'hilfe', g: 'hilfen', q: 'Woraus besteht die Blindenschrift?', o: ['Aus erhabenen Punkten', 'Aus bunten Strichen', 'Aus Tönen'], a: 0 },
    { id: 'sihi3', mod: 'hilfe', g: 'hilfen', q: 'Ein Blindenführhund arbeitet gerade. Darfst du ihn streicheln?', o: ['Nein, er darf nicht abgelenkt werden', 'Ja, immer', 'Ja, wenn du ihm Wurst gibst'], a: 0 },
    { id: 'sihi4', mod: 'hilfe', g: 'hilfen', q: 'Womit sprechen viele gehörlose Menschen?', o: ['Mit Gebärdensprache', 'Mit Blindenschrift', 'Mit Morsezeichen'], a: 0 },
    { id: 'sihi5', mod: 'hilfe', g: 'hilfen', q: 'Was macht ein Hörgerät?', o: ['Es macht Töne lauter', 'Es macht Bilder schärfer', 'Es misst die Temperatur'], a: 0 },
    { id: 'sihi6', mod: 'hilfe', g: 'hilfen', q: 'Was hilft Menschen im Rollstuhl, in ein Haus zu kommen?', o: ['Eine Rampe oder ein Aufzug', 'Eine steile Treppe', 'Eine Drehtür mit Stufe'], a: 0 },
    { id: 'sihi7', mod: 'hilfe', g: 'hilfen', q: 'Du möchtest einem blinden Menschen helfen. Was tust du zuerst?', o: ['Ich frage: „Kann ich Ihnen helfen?“', 'Ich ziehe ihn einfach am Arm', 'Ich nehme ihm den Stock weg'], a: 0 },
    { id: 'sihi8', mod: 'hilfe', g: 'hilfen', q: 'Mit einem Kind mit Hörgerät musst du schreien.', rf: true, a: false, why: 'Sprich deutlich und schau es an. Schreien ist nicht nötig.' },
    { id: 'sihi9', mod: 'hilfe', g: 'hilfen', q: 'Gebärdensprache ist eine richtige Sprache mit eigenen Wörtern.', rf: true, a: true },
    { id: 'sihi10', mod: 'hilfe', g: 'hilfen', q: 'Wozu sind die Rillen und Noppen im Boden an Bahnhöfen?', o: ['Blinde Menschen ertasten damit den Weg', 'Damit Fahrräder schneller fahren', 'Damit der Boden schöner aussieht'], a: 0 },
    { id: 'sihi11', mod: 'hilfe', g: 'hilfen', q: 'Woran erkennst du oft einen blinden Menschen?', o: ['Am weißen Stock', 'An einer roten Mütze', 'An einem grünen Schal'], a: 0 },
    { id: 'sihi12', mod: 'hilfe', g: 'hilfen', q: 'Menschen mit Behinderung können vieles selbst. Man fragt, ob sie Hilfe möchten.', rf: true, a: true },
    { id: 'sihi13', mod: 'hilfe', g: 'hilfen', q: 'Manche Ampeln klackern oder piepen. Für wen ist das?', o: ['Für blinde Menschen', 'Für Autofahrer', 'Für Vögel'], a: 0 },
    // Drogen
    { id: 'sidr1', mod: 'drogen', g: 'drogen', q: 'Welchen Teilen des Körpers schadet Rauchen besonders?', o: ['Lunge und Herz', 'Haaren und Nägeln', 'Nur den Zähnen'], a: 0 },
    { id: 'sidr2', mod: 'drogen', g: 'drogen', q: 'Was ist Passivrauchen?', o: ['Wenn man den Rauch anderer einatmet', 'Wenn man eine Zigarette wegwirft', 'Wenn man einen Rauchmelder testet'], a: 0 },
    { id: 'sidr3', mod: 'drogen', g: 'drogen', q: 'Auch Passivrauchen schadet der Gesundheit.', rf: true, a: true },
    { id: 'sidr4', mod: 'drogen', g: 'drogen', q: 'Welcher Stoff im Tabak macht süchtig?', o: ['Nikotin', 'Vitamin C', 'Zucker'], a: 0 },
    { id: 'sidr5', mod: 'drogen', g: 'drogen', q: 'Welchen Teilen des Körpers schadet Alkohol besonders?', o: ['Gehirn und Leber', 'Ohren und Nase', 'Nur den Füßen'], a: 0 },
    { id: 'sidr6', mod: 'drogen', g: 'drogen', q: 'Für Kinder ist ein kleiner Schluck Schnaps harmlos.', rf: true, a: false, why: 'Alkohol ist für Kinder besonders gefährlich. Schon wenig kann sie vergiften.' },
    { id: 'sidr7', mod: 'drogen', g: 'drogen', q: 'Wann darfst du ein Medikament nehmen?', o: ['Wenn meine Eltern oder ein Arzt es mir geben', 'Wenn es schön bunt ist', 'Wenn ein Freund es mir schenkt'], a: 0 },
    { id: 'sidr8', mod: 'drogen', g: 'drogen', q: 'Tabletten, die herumliegen, kann man wie Bonbons lutschen.', rf: true, a: false, why: 'Tabletten sind keine Bonbons. Fremde Tabletten können gefährlich sein. Sag einem Erwachsenen Bescheid.' },
    { id: 'sidr9', mod: 'drogen', g: 'drogen', q: 'Was bedeutet Gruppendruck?', o: ['Andere drängen dich, etwas zu tun, was du nicht willst', 'Alle drücken zusammen eine Tür auf', 'Eine Gruppe malt ein Bild'], a: 0 },
    { id: 'sidr10', mod: 'drogen', g: 'drogen', q: 'Ein echter Freund akzeptiert, wenn du Nein sagst.', rf: true, a: true },
    { id: 'sidr11', mod: 'drogen', g: 'drogen', q: 'Ältere Kinder bieten dir eine Zigarette an. Was kannst du tun?', o: ['Nein sagen und weggehen', 'Sie nehmen, damit sie nicht lachen', 'Sie für später einstecken'], a: 0 },
    { id: 'sidr12', mod: 'drogen', g: 'drogen', q: 'Wem kannst du erzählen, wenn dich jemand zu etwas drängt?', o: ['Einem Erwachsenen, dem ich vertraue', 'Niemandem', 'Nur dem, der mich drängt'], a: 0 },
    { id: 'sidr13', mod: 'drogen', g: 'drogen', q: 'Nikotin macht süchtig. Das heißt: Man kann kaum wieder damit aufhören.', rf: true, a: true },
    // Lückentext
    { id: 'silt1', mod: 'lt', g: 'sinne', q: 'Mit der ___ riechen wir.', o: ['Nase', 'Zunge', 'Haut'], a: 0 },
    { id: 'silt2', mod: 'lt', g: 'sinne', q: 'Mit der ___ schmecken wir.', o: ['Zunge', 'Nase', 'Hand'], a: 0 },
    { id: 'silt3', mod: 'lt', g: 'auge', q: 'Der farbige Ring im Auge heißt ___.', o: ['Regenbogenhaut', 'Trommelfell', 'Wimper'], a: 0 },
    { id: 'silt4', mod: 'lt', g: 'auge', q: 'Durch die ___ fällt Licht ins Auge.', o: ['Pupille', 'Augenbraue', 'Träne'], a: 0 },
    { id: 'silt5', mod: 'lt', g: 'ohr', q: 'Am Ende des Gehörgangs liegt das ___.', o: ['Trommelfell', 'Augenlid', 'Nasenloch'], a: 0 },
    { id: 'silt6', mod: 'lt', g: 'hilfen', q: 'Blinde Menschen lesen die ___ mit den Fingerspitzen.', o: ['Blindenschrift', 'Zeitung', 'Gebärdensprache'], a: 0 },
    { id: 'silt7', mod: 'lt', g: 'hilfen', q: 'Gehörlose Menschen sprechen oft mit der ___.', o: ['Gebärdensprache', 'Blindenschrift', 'Trommel'], a: 0 },
    { id: 'silt8', mod: 'lt', g: 'drogen', q: 'Rauchen schadet ___ und Herz.', o: ['Lunge', 'Haaren', 'Fingernägeln'], a: 0 },
    { id: 'silt9', mod: 'lt', g: 'drogen', q: 'Alkohol schadet dem Gehirn und der ___.', o: ['Leber', 'Nase', 'Haut'], a: 0 },
    { id: 'silt10', mod: 'lt', g: 'schutz', q: 'Eine ___ schützt die Augen vor grellem Licht.', o: ['Sonnenbrille', 'Mütze', 'Taschenlampe'], a: 0 },
  ]);
  const SI_MODULES = {
    parts: { name: 'Auge und Ohr', icon: '👁️', maxTier: 2, worldCap: [2], dmg: 12 },
    sinne: { name: 'Die fünf Sinne', icon: '👃', maxTier: 1, worldCap: [1], dmg: 12 },
    schutz: { name: 'Sinne schützen', icon: '🕶️', maxTier: 1, worldCap: [1], dmg: 14 },
    hilfe: { name: 'Hilfen im Alltag', icon: '🦮', maxTier: 1, worldCap: [1], dmg: 12 },
    drogen: { name: 'Nein zu Drogen', icon: '🚭', maxTier: 1, worldCap: [1], dmg: 14 },
    lt: { name: 'Lückentext', icon: '✏️', maxTier: 1, worldCap: [1], dmg: 10 },
  };
  const SI_TUT = {
    'parts:1': { title: 'Auge und Ohr', steps: ['Du siehst ein Auge von vorn oder ein Ohr von innen. Ein Teil leuchtet gelb.', 'Beispiel: Leuchtet der schwarze Kreis in der Mitte des Auges, ist das die Pupille.', 'Tippe auf den richtigen Namen.'] },
    'parts:2': { title: 'Teile finden', steps: ['Jetzt andersherum: Oben steht ein Name.', 'Beispiel: „Trommelfell“ ist die dünne Haut am Ende des Gehörgangs.', 'Tippe direkt auf diesen Teil im Bild.'] },
    'sinne:1': { title: 'Die fünf Sinne', steps: ['Auge – sehen, Ohr – hören, Nase – riechen, Zunge – schmecken, Haut – fühlen.', 'Beispiel: „Der Wecker klingelt.“ Das hörst du, also merkt es das Ohr.', 'Tippe auf die richtige Antwort.'] },
    'schutz:1': { title: 'Sinne schützen', steps: ['Fragen dazu, wie du Augen, Ohren, Nase, Zunge und Haut schützt.', 'Beispiel: Sand im Auge? Nicht reiben, sondern blinzeln oder mit Wasser ausspülen.', 'Manchmal wählst du „Richtig“ oder „Falsch“, manchmal eine von drei Antworten.'] },
    'hilfe:1': { title: 'Hilfen im Alltag', steps: ['Hier geht es um Blindenschrift, Blindenführhund, Gebärdensprache, Hörgerät und Rampe.', 'Beispiel: Blindenschrift liest man mit den Fingerspitzen, sie besteht aus erhabenen Punkten.', 'Tippe auf die richtige Antwort.'] },
    'drogen:1': { title: 'Nein zu Drogen', steps: ['Fragen zu Rauchen, Alkohol, Medikamenten und zum Nein sagen.', 'Beispiel: Rauchen schadet Lunge und Herz, auch wer den Rauch nur einatmet.', 'Tippe auf die richtige Antwort.'] },
    'lt:1': { title: 'Lückentext', steps: ['Im Satz fehlt ein Wort (___).', 'Beispiel: „Mit der ___ riechen wir.“ Hier passt „Nase“.', 'Tippe auf das Wort, das passt.'] },
  };

  /* ---------- Sinnestäuschungen: erst vermuten, dann Ergebnis (wie das Forscherlabor) ---------- */
  const pic = (inner, label, box) => `<svg ${NS} class="pic" viewBox="${box || '0 0 240 150'}" aria-label="${label}"><rect width="${(box || '0 0 240 150').split(' ')[2]}" height="${(box || '0 0 240 150').split(' ')[3]}" rx="10" fill="#fff"/>${inner}</svg>`;
  const guide = (x, y1, y2) => `<path d="M${x} ${y1} L${x} ${y2}" stroke="#E5484D" stroke-width="2" stroke-dasharray="5 4"/>`;
  const fins = (x1, x2, y, out) => { const d = out ? -16 : 16; return `<path d="M${x1} ${y} L${x2} ${y} M${x1} ${y} l${d} -12 M${x1} ${y} l${d} 12 M${x2} ${y} l${-d} -12 M${x2} ${y} l${-d} 12" stroke="${STROKE}" stroke-width="4" stroke-linecap="round" fill="none"/>`; };
  const ring = (cx, cy, r, n, R) => Array.from({ length: n }, (_, i) => { const a = i * 2 * Math.PI / n; return `<circle cx="${(cx + Math.cos(a) * R).toFixed(1)}" cy="${(cy + Math.sin(a) * R).toFixed(1)}" r="${r}" fill="#9AA3C2"/>`; }).join('');
  const bowl = (x, label, fill) => `<path d="M${x - 34} 70 Q${x - 34} 120 ${x} 120 Q${x + 34} 120 ${x + 34} 70 Z" fill="${fill}" stroke="${STROKE}" stroke-width="2.5"/>${txt(x, 140, label, { size: 13 })}`;
  const ILLUSIONS = [
    { id: 'pfeile', look: true, q: 'Welche Linie ist länger?', opts: ['Die obere', 'Die untere', 'Beide sind gleich lang'], a: 2,
      note: 'Beide Linien sind gleich lang. Die Pfeilspitzen an den Enden täuschen das Auge.',
      pic: pic(`${fins(60, 180, 45, false)}${fins(60, 180, 110, true)}`, 'Zwei Linien mit Pfeilspitzen'),
      after: pic(`${fins(60, 180, 45, false)}${fins(60, 180, 110, true)}${guide(60, 20, 135)}${guide(180, 20, 135)}`, 'Zwei gleich lange Linien mit Hilfslinien') },
    { id: 'kreise', look: true, q: 'Welcher orange Kreis in der Mitte ist größer?', opts: ['Der linke', 'Der rechte', 'Beide sind gleich groß'], a: 2,
      note: 'Beide orangen Kreise sind gleich groß. Zwischen großen Kreisen wirkt ein Kreis klein, zwischen kleinen Kreisen groß.',
      pic: pic(`${ring(62, 75, 20, 6, 46)}<circle cx="62" cy="75" r="14" fill="#FF8A3D"/>${ring(180, 75, 6, 8, 26)}<circle cx="180" cy="75" r="14" fill="#FF8A3D"/>`, 'Zwei orange Kreise, umgeben von großen und kleinen Kreisen'),
      after: pic(`<circle cx="62" cy="75" r="14" fill="#FF8A3D"/><circle cx="180" cy="75" r="14" fill="#FF8A3D"/><path d="M62 61 L180 61 M62 89 L180 89" stroke="#E5484D" stroke-width="2" stroke-dasharray="5 4"/>`, 'Die zwei orangen Kreise ohne Umgebung') },
    { id: 'tlinie', look: true, q: 'Welche Linie ist länger: die senkrechte oder die waagerechte?', opts: ['Die senkrechte', 'Die waagerechte', 'Beide sind gleich lang'], a: 2,
      note: 'Beide Linien sind gleich lang. Senkrechte Linien wirken für unser Auge länger als gleich lange waagerechte.',
      pic: pic(`<path d="M70 130 L170 130 M120 130 L120 30" stroke="${STROKE}" stroke-width="5" stroke-linecap="round"/>`, 'Eine senkrechte und eine waagerechte Linie'),
      after: pic(`<path d="M70 110 L170 110" stroke="${STROKE}" stroke-width="5" stroke-linecap="round"/><path d="M70 132 L170 132" stroke="#E5484D" stroke-width="5" stroke-linecap="round"/>${txt(120, 26, 'Die senkrechte Linie, hingelegt:', { size: 12 })}<path d="M120 36 L120 100" stroke="#E5484D" stroke-width="2" stroke-dasharray="5 4"/>${guide(70, 98, 144)}${guide(170, 98, 144)}`, 'Die senkrechte Linie liegt jetzt unter der waagerechten') },
    { id: 'grau', look: true, q: 'Welches graue Quadrat in der Mitte ist heller?', opts: ['Das linke', 'Das rechte', 'Beide sind gleich hell'], a: 2,
      note: 'Beide Quadrate haben genau dasselbe Grau. Auf dunklem Grund wirkt Grau heller, auf hellem Grund dunkler.',
      pic: pic(`<rect x="14" y="18" width="100" height="114" fill="#1C2541"/><rect x="126" y="18" width="100" height="114" fill="#F1F3F8" stroke="#CCD2E0"/><rect x="44" y="55" width="40" height="40" fill="#8A8F9C"/><rect x="156" y="55" width="40" height="40" fill="#8A8F9C"/>`, 'Zwei graue Quadrate auf dunklem und hellem Grund'),
      after: pic(`<rect x="14" y="18" width="100" height="114" fill="#1C2541"/><rect x="126" y="18" width="100" height="114" fill="#F1F3F8" stroke="#CCD2E0"/><rect x="44" y="55" width="152" height="40" fill="#8A8F9C"/>`, 'Ein grauer Streifen verbindet beide Quadrate') },
    { id: 'haende', q: 'Du hältst eine Hand in warmes und eine in kaltes Wasser. Dann legst du beide in lauwarmes Wasser. Was spürst du?', opts: ['Beide Hände spüren dasselbe', 'Die warme Hand spürt kühl, die kalte Hand spürt warm', 'Beide Hände spüren heiß'], a: 1,
      note: 'Die Haut spürt vor allem, ob etwas wärmer oder kälter ist als vorher. Darum fühlt sich dasselbe Wasser für jede Hand anders an.',
      pic: pic(`${bowl(46, 'warm', '#FFB199')}${bowl(120, 'lauwarm', '#D7E8F7')}${bowl(194, 'kalt', '#8FC8F2')}`, 'Drei Schüsseln mit warmem, lauwarmem und kaltem Wasser') },
    { id: 'nase', q: 'Du hältst dir die Nase zu und schließt die Augen. Dann isst du ein Stück Apfel und ein Stück Birne. Kannst du sie gut unterscheiden?', opts: ['Ja, ganz leicht', 'Nein, das ist viel schwerer'], a: 1,
      note: 'Zunge und Nase arbeiten zusammen. Mit zugehaltener Nase schmecken Apfel und Birne fast gleich.' },
    { id: 'ruecken', q: 'Jemand drückt dir zwei Finger ganz nah nebeneinander auf den Rücken. Du schaust nicht hin. Was spürst du?', opts: ['Meistens nur einen Finger', 'Immer deutlich zwei Finger'], a: 0,
      note: 'Am Rücken liegen die Tastpunkte der Haut weit auseinander. An den Fingerspitzen spürst du dagegen sofort zwei.' },
  ];
  // three things to look at and two to feel or taste, five in all like the Forscherlabor
  const illusionSet = () => shuffle(shuffle(ILLUSIONS.filter((x) => x.look)).slice(0, 3).concat(shuffle(ILLUSIONS.filter((x) => !x.look)).slice(0, 2))).map((x) => ({ kind: x.id, topic: 'taeuschung', q: x.q, opts: x.opts.slice(), a: x.a, note: x.note, pic: x.pic, after: x.after }));

  function siGen(cfg) {
    return (mod, tier, know, seq, opts) => {
      if (mod === 'parts') return plantTask(cfg, 'auge', mod, tier, know, seq, opts);
      if (wantsPool(cfg, mod, opts)) return null;
      if (mod === 'sinne' && Math.random() < 0.6) return senseTask(mod);
      return null;
    };
  }
  // Dilemma-Karten: kein Richtig oder Falsch, jede Wahl bekommt dieselbe Belohnung; nie eine Wahl, bei der das Kind eine Droge nimmt
  const HELP = 'Hol dir Hilfe bei einem Erwachsenen.';
  const SI = { modules: SI_MODULES, tut: SI_TUT, notes: SI_NOTES, pool: SI_POOL, worlds: 1, grade: 3, subject: 'Sachkunde', title: 'Die fünf Sinne', icon: '👁️', sub: 'Auge, Ohr, Sinne schützen, Hilfen im Alltag, Nein zu Drogen und Sinnestäuschungen', school: ['auge', 'ohr'], swap: { from: 'event', to: 'taeusch' }, labor: illusionSet,
    starters: [{ id: 'schulaerztin', type: 'normal', shape: 'schulaerztin', names: ['Die Schulärztin', 'Die Schulärztin', 'Die Schulärztin'], hp: 70, desc: 'Sie prüft bei allen Kindern, wie gut sie sehen und hören, und erklärt, wie man Augen und Ohren schützt.', perk: 'heal',
      attacks: [{ name: 'Sehtafel', mod: 'parts' }, { name: 'Stimmgabel', mod: 'sinne' }, { name: 'Ohrenschützer', mod: 'schutz' }, { name: 'Frische Luft', mod: 'drogen' }] }],
    extra: { parts: 'Augenspiegel', sinne: 'Duftprobe', schutz: 'Sonnenhut', hilfe: 'Leitlinie', drogen: 'Klares Nein', lt: 'Merkzettel' },
    enemies: { 1: {
      normal: [
        { name: 'Der Lärm', type: 'normal', shape: 'laerm', hp: 26, atk: 4 },
        { name: 'Das Blendlicht', type: 'feuer', shape: 'blendlicht', hp: 24, atk: 4 },
        { name: 'Die Brennnessel', type: 'pflanze', shape: 'brennnesselwall', hp: 28, atk: 3 },
        { name: 'Der Schimmel', type: 'pflanze', shape: 'faeulewolke', hp: 30, atk: 3 },
      ],
      elite: { name: 'Die Qualmwolke', type: 'normal', shape: 'qualmwolke', hp: 45, atk: 5 },
      boss: { name: 'Der Gruppendruck', acc: 'den Gruppendruck', type: 'normal', shape: 'gruppendruck', hp: 70, atk: 6, boss: true },
    } },
    moves: ['Dröhnen', 'Grelles Licht', 'Brennhaare', 'Muffiger Geruch', 'Qualm', 'Drängeln'],
    events: [
      { title: 'Der Sehtest', text: 'Im Gesundheitsamt zeigt dir eine Ärztin die Sehtafel. Beantworte ihre Frage zum Auge, dann schenkt sie dir einen Trank.', opts: [{ label: 'Antworten', task: 'parts', g: 'auge', win: { item: 'trank' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Fühlkasten', text: 'In der Klasse steht ein Kasten mit Loch. Du tastest hinein. Die Lehrerin fragt dich nach den Sinnen.', opts: [{ label: 'Antworten', task: 'sinne', g: 'sinne', win: { xp: 20 }, lose: { xp: 5 } }, { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } }] },
      { title: 'Das Freibad', text: 'Die Sonne brennt. Der Bademeister gibt dir einen Schild, wenn du weißt, wie man die Sinne schützt.', opts: [{ label: 'Antworten', task: 'schutz', g: 'schutz', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Bücherei', text: 'In der Bücherei steht ein Buch in Blindenschrift. Die Bibliothekarin kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort.', opts: [{ label: 'Antworten', task: 'hilfe', g: 'hilfen', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Duftgarten', text: 'Im Garten der Schule riecht es nach Minze und Lavendel. Hier ruhst du dich aus.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
      { title: 'Hinter der Turnhalle', dilemma: true, reward: { hp: 5 }, text: 'Ältere Kinder rauchen hinter der Turnhalle. Einer hält dir eine Zigarette hin: „Probier mal, sei kein Baby.“', opts: [
        { label: '„Nein danke, ich will nicht.“', then: 'Sie lachen kurz, dann reden sie über etwas anderes. Du gehst zu deinen Freunden.', think: 'Warum braucht ein klares Nein Mut?' },
        { label: 'Ich bleibe stehen und sage nichts.', then: 'Der Rauch zieht dir ins Gesicht, du musst husten. Später gehst du weg.', think: 'Was ist Passivrauchen? Wie hättest du schneller wegkommen können?' },
        { label: HELP, then: 'Du erzählst es der Lehrerin. Sie spricht mit den älteren Kindern und ihren Eltern.', think: 'Warum ist Hilfe holen kein Petzen?' } ] },
      { title: 'Die Familienfeier', dilemma: true, reward: { hp: 5 }, text: 'Auf einer Familienfeier sagt dein großer Cousin: „Trink mal einen Schluck Bier. Merkt doch keiner.“', opts: [
        { label: '„Nein, ich trinke lieber Saft.“', then: 'Dein Cousin zuckt mit den Schultern. Ihr spielt danach zusammen Tischtennis.', think: 'Warum ist Alkohol für Kinder besonders gefährlich?' },
        { label: 'Ich gehe zu den anderen Kindern.', then: 'Du spielst mit deinen Cousinen Fangen. Das Bier ist schnell vergessen.', think: 'Ist Weggehen auch eine Art, Nein zu sagen?' },
        { label: HELP, then: 'Du erzählst es deiner Mama. Sie redet mit deinem Cousin, und er entschuldigt sich.', think: 'Welchem Erwachsenen kannst du so etwas erzählen?' } ] },
      { title: 'Die bunten Tabletten', dilemma: true, reward: { hp: 5 }, text: 'Im Badezimmer liegt eine offene Packung Tabletten. Dein kleiner Bruder ruft: „Guck mal, Bonbons!“', opts: [
        { label: 'Ich sage: „Das sind keine Bonbons. Finger weg!“', then: 'Dein Bruder legt die Tabletten weg. Er schaut dich groß an.', think: 'Woran merkst du, dass etwas ein Medikament ist?' },
        { label: HELP, then: 'Du holst sofort Papa. Er räumt die Tabletten weg, so hoch, dass keiner drankommt.', think: 'Wann nimmt man Medikamente, und wer gibt sie einem?' } ] },
      { title: 'Die Mutprobe', dilemma: true, reward: { hp: 5 }, text: 'Ein paar Kinder sagen: „Wer in unsere Bande will, muss an der E-Zigarette von Jonas’ großem Bruder ziehen.“', opts: [
        { label: '„Dann eben nicht.“', then: 'Du spielst mit anderen Kindern Fußball. Am nächsten Tag fragt ein Junge aus der Bande, ob er mitspielen darf.', think: 'Sind das Freunde, die so etwas verlangen?' },
        { label: 'Ich schlage eine andere Mutprobe vor.', then: 'Du schlägst vor, auf einem Bein über den Schulhof zu hüpfen. Zwei Kinder machen mit und lachen.', think: 'Was ist eine gute Mutprobe, bei der niemand Schaden nimmt?' },
        { label: HELP, then: 'Du erzählst es deinem Papa. Er spricht mit Jonas’ Eltern.', think: 'Warum ist es gut, so etwas einem Erwachsenen zu erzählen?' } ] },
      { title: 'Rauch im Auto', dilemma: true, reward: { hp: 5 }, text: 'Dein Onkel fährt dich nach Hause. Unterwegs zündet er sich eine Zigarette an. Du sitzt hinten.', opts: [
        { label: '„Kannst du bitte damit warten, bis wir da sind?“', then: 'Dein Onkel macht die Zigarette aus. „Gut, dass du was sagst“, meint er.', think: 'Wie kann man höflich und trotzdem deutlich sein?' },
        { label: 'Ich sage nichts.', then: 'Das Auto ist voller Rauch. Deine Augen brennen und deine Sachen riechen danach.', think: 'Wem schadet Passivrauchen?' },
        { label: HELP, then: 'Zu Hause erzählst du es deinen Eltern. Sie reden mit deinem Onkel.', think: 'Wann ist ein Erwachsener die richtige Hilfe?' } ] },
      { title: 'Das neue Kind', dilemma: true, reward: { hp: 5 }, text: 'Ein neues Kind in deiner Klasse trägt ein Hörgerät. Zwei Kinder tuscheln und lachen über das Hörgerät.', opts: [
        { label: 'Ich setze mich in der Pause zu ihm.', then: 'Es erzählt dir: „Schau mich an, wenn du redest, dann verstehe ich dich gut.“ Ihr spielt zusammen.', think: 'Wie kannst du gut mit jemandem reden, der ein Hörgerät trägt?' },
        { label: 'Ich sage: „Hört auf damit, das ist gemein.“', then: 'Die beiden werden still. Das neue Kind lächelt dir zu.', think: 'Was sagt die Goldene Regel dazu?' },
        { label: HELP, then: 'Die Lehrerin spricht mit der Klasse über Hörgeräte. Das neue Kind darf zeigen, wie seins funktioniert.', think: 'Warum hilft es, wenn alle mehr darüber wissen?' } ] },
      { title: 'An der Ampel', dilemma: true, reward: { hp: 5 }, text: 'An der Ampel wartet ein Mann mit einem weißen Stock. Die Ampel klackert leise.', opts: [
        { label: 'Ich frage: „Kann ich Ihnen helfen?“', then: '„Danke, ich schaffe das. Die Ampel sagt mir, wann Grün ist.“ Ihr geht zusammen hinüber.', think: 'Warum ist es gut, zuerst zu fragen?' },
        { label: 'Ich nehme ihn einfach am Arm.', then: 'Der Mann erschrickt. Dann sagt er freundlich: „Fragen Sie mich bitte vorher.“', think: 'Wie würdest du dich fühlen, wenn dich jemand ungefragt anfasst?' },
        { label: 'Ich warte und gehe bei Grün.', then: 'Der Mann geht beim Klackern los und kommt gut auf der anderen Seite an.', think: 'Brauchen Menschen mit Behinderung immer Hilfe?' } ] },
    ] };
  SI.gen = siGen(SI);

  /* ================= SICHER IM VERKEHR (LB 5) ================= */
  // Verkehrszeichen nach StVO im Kasten 0–100: weißer Rand, Tusche-Umriss, Emailglanz von links oben
  const disc = (r) => `M${50 - r} 50 A${r} ${r} 0 1 0 ${50 + r} 50 A${r} ${r} 0 1 0 ${50 - r} 50 Z`;
  const box = (x, y, w, h, r) => `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} H${x + r} A${r} ${r} 0 0 1 ${x} ${y + h - r} V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`;
  const poly = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' L') + ' Z';
  const around = (pts, k, cx, cy) => poly(pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]));
  const OCT = (R) => poly(Array.from({ length: 8 }, (_, i) => [50 + R * Math.cos((22.5 + 45 * i) * Math.PI / 180), 50 + R * Math.sin((22.5 + 45 * i) * Math.PI / 180)]));
  const TRI = [[5, 12], [95, 12], [50, 89.9]], DIA = [[50, 3], [97, 50], [50, 97], [3, 50]];
  const vg = (id, a, b) => `<linearGradient id="vz-${id}" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const SIGN_DEFS = `<defs>${vg('red', '#E8424A', '#B3141E')}${vg('blue', '#3474C8', '#164C94')}${vg('yellow', '#FFD84A', '#EBA600')}${vg('white', '#FFFFFF', '#E3E8EF')}${vg('case', '#4A5560', '#1F262C')}` +
    '<radialGradient id="vz-sheen" cx="28%" cy="20%" r="90%"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#0B1020" stop-opacity=".12"/></radialGradient></defs>';
  // outer: the whole plate (white rim included); inner: the coloured field
  const sign = (outer, inner, col, sym) => `${SIGN_DEFS}<path d="${outer}" fill="${STROKE}" opacity=".18" transform="translate(1.5 2.5)"/><path d="${outer}" fill="url(#vz-white)" stroke="${STROKE}" stroke-width="3" stroke-linejoin="round"/>${inner ? `<path d="${inner}" fill="${col}"/>` : ''}${sym}<path d="${outer}" fill="url(#vz-sheen)"/>`;
  const LINE = (c, w) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  // facing right like on the signs 237 and 254
  const BIKE = (c, w) => `<g ${LINE(c, w || 4.5)}><circle cx="30" cy="61" r="13"/><circle cx="70" cy="61" r="13"/><path d="M30 61 L47 61 L41 41 M30 61 L42.2 45 L64.4 45 M47 61 L64 45 M70 61 L62 38 L58 33 M62 38 L69 36 M36 39 L47 39"/></g>`;
  const SANS = 'style="font-family:\'Arial Narrow\',Arial,Helvetica,sans-serif"';
  const SIGN_ART = {
    stopp: sign(OCT(48), OCT(43.5), 'url(#vz-red)', `<text x="50" y="58.5" font-size="23" font-weight="700" text-anchor="middle" textLength="68" lengthAdjust="spacingAndGlyphs" fill="#fff" ${SANS}>STOP</text>`),
    vorfahrtgewaehren: sign(poly(TRI), around(TRI, 0.93, 50, 38), 'url(#vz-red)', `<path d="${around(TRI, 0.53, 50, 38)}" fill="url(#vz-white)" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>`),
    vorfahrtstrasse: sign(poly(DIA), '', '', `<path d="${around(DIA, 0.93, 50, 50)}" fill="none" stroke="#2B2F36" stroke-width="1.2"/><path d="${around(DIA, 0.62, 50, 50)}" fill="url(#vz-yellow)" stroke="#C98E00" stroke-width="1" stroke-linejoin="round"/>`),
    radweg: sign(disc(47.5), disc(43.5), 'url(#vz-blue)', `<g transform="translate(50 50) scale(.95) translate(-50 -51)">${BIKE('#fff')}</g>`),
    gehweg: sign(disc(47.5), disc(43.5), 'url(#vz-blue)', `<g fill="#fff"><circle cx="40" cy="25" r="6"/><path d="M35 33 Q40 31 45 33 L46 47 L52 63 L28 63 L34 47 Z"/><circle cx="62" cy="44" r="4.6"/><path d="M58 51 Q62 49.5 66 51 L67 64 L57 64 Z"/></g>` +
      `<path d="M37 63 L37 79 M43 63 L43 79 M60 63 L59.5 76 M64 63 L65 76" ${LINE('#fff', 4.2)}/><path d="M35.5 36 L31 52 M44.5 36 L52 50 L58.5 53 M66.5 53 L69 60" ${LINE('#fff', 3.6)}/>`),
    zebra: sign(box(4, 4, 92, 92, 9), box(7.5, 7.5, 85, 85, 6.5), 'url(#vz-blue)', `<path d="M50 13 L87 80 L13 80 Z" fill="#fff" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>` +
      `<path d="${[0, 1, 2, 3, 4].map((i) => { const x = 22 + i * 12.4; return `M${x} 76 L${f1(x + 7.4)} 76 L${f1(x + 6.4 + (50 - x) * 0.1)} 69 L${f1(x + 1.4 + (50 - x) * 0.1)} 69 Z`; }).join(' ')}" fill="#1A1A1A"/>` +
      `<circle cx="51" cy="33" r="4.6" fill="#1A1A1A"/><path d="M50 40 L48 54 L43 61 L39 70 M48 54 L54 61 L57 70 M50 43 L44 51 M50 43 L56 49" ${LINE('#1A1A1A', 4.6)}/>`),
    einbahn: sign(box(3, 33, 94, 34, 4), box(5.5, 35.5, 89, 29, 2.5), 'url(#vz-blue)', `<path d="M9 42.5 L67 42.5 L65.5 37.5 Q65.5 36 67 37 L91 49 Q92.5 50 91 51 L67 63 Q65.5 64 65.5 62.5 L67 57.5 L9 57.5 Z" fill="#fff"/>` +
      `<text x="38" y="53.4" font-size="10" font-weight="700" text-anchor="middle" textLength="54" lengthAdjust="spacingAndGlyphs" fill="#1A1A1A" ${SANS}>Einbahnstraße</text>`),
    radverbot: sign(disc(47.5), disc(45), 'url(#vz-red)', `<path d="${disc(36.5)}" fill="url(#vz-white)"/><g transform="translate(50 50) scale(.78) translate(-50 -51)">${BIKE('#1A1A1A', 5)}</g>`),
    spielstrasse: sign(box(3, 17, 94, 66, 5), box(6, 20, 88, 60, 3), 'url(#vz-blue)', `<g fill="#fff"><path d="M10 64 L10 42 L19.5 33 L29 42 L29 64 Z"/><circle cx="40" cy="38" r="4.2"/><path d="M36.5 44 Q40 42.5 43.5 44 L44.5 56 L35.5 56 Z"/><circle cx="54" cy="51" r="3.4"/><path d="M51.5 56 Q54 55 56.5 56 L57 64 L51 64 Z"/><circle cx="63.5" cy="67" r="3.3"/>` +
      `<path d="M66 73 L69 65.5 Q70 64 72 64 L84 64 Q86 64 87 65.5 L90 73 Z"/></g><path d="M38 56 L37 70 M42 56 L44 70 M52.5 64 L52 72 M55.5 64 L57 71.5 M43.5 46 L47 53 M36.5 46 L34 53 M56.5 57 L60.5 63" ${LINE('#fff', 3)}/><path d="M64 73 L92 73" ${LINE('#fff', 4.5)}/><circle cx="70.5" cy="74" r="3.2" fill="#fff"/><circle cx="85.5" cy="74" r="3.2" fill="#fff"/>` +
      `<path d="M15.5 49 L15.5 55 L23.5 55 L23.5 49 Z" fill="url(#vz-blue)"/>`),
    radfrei: sign(box(7, 19, 86, 62, 5), '', '', `<path d="${box(10.5, 22.5, 79, 55, 3)}" fill="none" stroke="#1A1A1A" stroke-width="2.6"/><g transform="translate(50 42) scale(.56) translate(-50 -51)">${BIKE('#1A1A1A', 6)}</g>` +
      `<text x="50" y="73" font-size="16" font-weight="700" text-anchor="middle" fill="#1A1A1A" ${SANS}>frei</text>`),
  };
  // traffic light; the lit lamp glows, the others stay dark
  const LAMPS = [['rot', '#FF5A4E', 20], ['gelb', '#FFD23A', 50], ['gruen', '#3FD27A', 80]];
  const lamp = (lit) => `${SIGN_DEFS}<rect x="31" y="3" width="38" height="94" rx="9" fill="${STROKE}" opacity=".18" transform="translate(1.5 2.5)"/><rect x="31" y="3" width="38" height="94" rx="9" fill="url(#vz-case)" stroke="${STROKE}" stroke-width="3"/>` +
    LAMPS.map(([k, c, y]) => { const on = k === lit;
      return `${on ? `<circle cx="50" cy="${y}" r="16" fill="${c}" opacity=".35"/>` : ''}<circle cx="50" cy="${y}" r="12.5" fill="#111518" stroke="${STROKE}" stroke-width="1.5"/><circle cx="50" cy="${y}" r="10.5" fill="${on ? c : '#3A4248'}"/>` +
        `${on ? `<circle cx="50" cy="${y}" r="10.5" fill="url(#vz-sheen)"/><circle cx="46" cy="${y - 4}" r="3" fill="#fff" opacity=".8"/>` : `<circle cx="47" cy="${y - 3.5}" r="2" fill="#fff" opacity=".12"/>`}<path d="M37 ${y - 9} Q50 ${y - 18} 63 ${y - 9}" fill="none" stroke="#11161A" stroke-width="3" stroke-linecap="round"/>`; }).join('') +
    '<rect x="31" y="3" width="38" height="94" rx="9" fill="url(#vz-sheen)" opacity=".7"/>';
  SIGN_ART.ampelrot = lamp('rot'); SIGN_ART.ampelgelb = lamp('gelb'); SIGN_ART.ampelgruen = lamp('gruen');
  const SIGNS = [
    { id: 'stopp', name: 'Stoppschild', mean: 'Stopp: Ganz anhalten und die anderen zuerst fahren lassen' },
    { id: 'vorfahrtgewaehren', name: 'Vorfahrt gewähren', mean: 'Vorfahrt gewähren: Die anderen dürfen zuerst fahren' },
    { id: 'vorfahrtstrasse', name: 'Vorfahrtstraße', mean: 'Vorfahrtstraße: Du darfst an den Kreuzungen zuerst fahren' },
    { id: 'radweg', name: 'Radweg', mean: 'Radweg: Hier fahren nur Radfahrer' },
    { id: 'gehweg', name: 'Gehweg', mean: 'Gehweg: Dieser Weg ist für Fußgänger' },
    { id: 'zebra', name: 'Fußgängerüberweg', mean: 'Fußgängerüberweg: Hier ist ein Zebrastreifen' },
    { id: 'einbahn', name: 'Einbahnstraße', mean: 'Einbahnstraße: Fahren nur in Pfeilrichtung' },
    { id: 'radverbot', name: 'Verbot für Radfahrer', mean: 'Verbot für Radfahrer: Hier darfst du nicht Rad fahren' },
    { id: 'spielstrasse', name: 'Verkehrsberuhigter Bereich', mean: 'Verkehrsberuhigter Bereich: Kinder dürfen auf der Straße spielen, Autos fahren Schritt' },
    { id: 'radfrei', name: 'Radfahrer frei', mean: 'Radfahrer frei: Hier dürfen auch Radfahrer fahren' },
    { id: 'ampelrot', name: 'Ampel Rot', mean: 'Rot: Stehen bleiben' },
    { id: 'ampelgelb', name: 'Ampel Gelb', mean: 'Gelb: Anhalten, gleich kommt Rot' },
    { id: 'ampelgruen', name: 'Ampel Grün', mean: 'Grün: Fahren, wenn die Kreuzung frei ist' },
  ];
  // these two both mean „let the others go first“, so neither is a wrong option for the other
  const ALIKE = ['stopp', 'vorfahrtgewaehren'];
  const signSVG = (id, opt) => `<svg ${NS} class="${opt ? '' : 'pic'}" viewBox="0 0 100 100" ${opt ? '' : 'style="max-width:140px"'} aria-label="Verkehrszeichen">${SIGN_ART[id]}</svg>`;
  function signTask(mod, tier) {
    const s = pick(SIGNS); const others = shuffle(SIGNS.filter((x) => x !== s && !(ALIKE.includes(x.id) && ALIKE.includes(s.id)))).slice(0, 2);
    if (tier >= 2) return { kind: 'choice', mod, tier: 2, group: mod + ':2', note: 'zeichen', q: `Welches Zeichen bedeutet: „${s.mean}“?`, options: shuffle([s].concat(others).map((x) => signSVG(x.id, true))), answer: signSVG(s.id, true), svgOpts: true, why: `So sieht das Zeichen „${s.name}“ aus:`, qid: 'vzpick_' + s.id, cols: 1 };
    return Object.assign(choice(mod, 'zeichen', 'Was bedeutet dieses Zeichen?', s.mean, others.map((x) => x.mean), 'vzmean_' + s.id), { pic: signSVG(s.id) });
  }

  // Kreuzung von oben, Norden oben; alle fahren geradeaus. rightOf = von wo der Verkehr von rechts kommt (aus Sicht des Fahrers)
  const ARMS = { S: { x: 132, y: 196, rot: 0 }, N: { x: 108, y: 44, rot: 180 }, W: { x: 44, y: 132, rot: 90 }, E: { x: 196, y: 108, rot: 270 } };
  const RIGHT_OF = { S: 'E', E: 'N', N: 'W', W: 'S' };
  // on the grass to the driver's right, before the crossing
  const SIGN_AT = { S: [166, 168], N: [74, 60], W: [74, 168], E: [166, 60] };
  const VEHICLES = [
    { id: 'rot', name: 'Das rote Auto', art: '<rect x="-10" y="-17" width="20" height="34" rx="5" fill="#E53935" stroke="#1C2541" stroke-width="2"/><rect x="-7" y="-9" width="14" height="8" rx="2" fill="#BBDEFB"/><rect x="-7" y="6" width="14" height="5" rx="2" fill="#BBDEFB"/>' },
    { id: 'blau', name: 'Das blaue Auto', art: '<rect x="-10" y="-17" width="20" height="34" rx="5" fill="#1E88E5" stroke="#1C2541" stroke-width="2"/><rect x="-7" y="-9" width="14" height="8" rx="2" fill="#E3F2FD"/><rect x="-7" y="6" width="14" height="5" rx="2" fill="#E3F2FD"/>' },
    { id: 'rad', name: 'Das Fahrrad', art: '<rect x="-2" y="-17" width="4" height="12" rx="2" fill="#333"/><rect x="-2" y="5" width="4" height="12" rx="2" fill="#333"/><path d="M-9 -9 L9 -9" stroke="#333" stroke-width="3" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="7" ry="5" fill="#FF8A3D" stroke="#1C2541" stroke-width="2"/><circle cx="0" cy="-5" r="4.5" fill="#FFD54F" stroke="#1C2541" stroke-width="2"/>' },
    { id: 'traktor', name: 'Der Traktor', art: '<rect x="-14" y="2" width="6" height="14" rx="2" fill="#333"/><rect x="8" y="2" width="6" height="14" rx="2" fill="#333"/><rect x="-11" y="-16" width="4" height="8" rx="1" fill="#333"/><rect x="7" y="-16" width="4" height="8" rx="1" fill="#333"/><rect x="-8" y="-18" width="16" height="34" rx="3" fill="#43A047" stroke="#1C2541" stroke-width="2"/><rect x="-7" y="2" width="14" height="12" rx="2" fill="#C8E6C9" stroke="#1C2541" stroke-width="1.5"/>' },
  ];
  const vehicleAt = (arm, v) => { const a = ARMS[arm]; return `<g transform="translate(${a.x} ${a.y}) rotate(${a.rot})">${v.art}<path d="M0 -24 L0 -42 M-6 -36 L0 -43 L6 -36" stroke="#FFC93C" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`; };
  const smallSign = (arm, art) => { const [x, y] = SIGN_AT[arm]; return `<path d="M${x} ${y + 10} L${x} ${y + 24}" stroke="#555" stroke-width="2"/><g transform="translate(${x - 11} ${y - 12}) scale(.22)">${art}</g>`; };
  function crossingSVG(cars, extras) {
    const road = '<rect x="90" width="60" height="240" fill="#8A8F98"/><rect y="90" width="240" height="60" fill="#8A8F98"/><path d="M120 0 L120 88 M120 152 L120 240 M0 120 L88 120 M152 120 L240 120" stroke="#fff" stroke-width="2.5" stroke-dasharray="10 8"/>';
    return `<svg ${NS} class="pic" viewBox="0 0 240 240" style="max-width:280px" aria-label="Kreuzung von oben"><rect width="240" height="240" rx="12" fill="#9CCC65"/>${road}${extras || ''}${cars.map((c) => vehicleAt(c.arm, c.v)).join('')}<g transform="translate(222 22)"><path d="M0 -12 L6 4 L0 0 L-6 4 Z" fill="${STROKE}"/>${txt(0, 18, 'N', { size: 11 })}</g></svg>`;
  }
  // tier 1: rechts vor links with two cars at a right angle or three cars; tier 2: Vorfahrtstraße / Vorfahrt gewähren / Stopp or traffic lights
  function rightOfWayTask(mod, tier) {
    const vs = shuffle(VEHICLES);
    if (tier <= 1) {
      const arms = Math.random() < 0.5 ? shuffle(['S', 'W', 'N', 'E']).slice(0, 3) : (([a]) => [a, RIGHT_OF[a]])(shuffle(['S', 'W', 'N', 'E']));
      const cars = arms.map((arm, i) => ({ arm, v: vs[i] })); const first = cars.find((c) => !arms.includes(RIGHT_OF[c.arm]));
      return choice(mod, 'vorfahrt', 'Alle fahren geradeaus. Es gibt kein Schild und keine Ampel. Wer darf zuerst fahren?', first.v.name, cars.filter((c) => c !== first).map((c) => c.v.name), 'vfr_' + arms.join(''), { pic: crossingSVG(cars) });
    }
    const main = pick([['S', 'N'], ['W', 'E']]); const side = ['S', 'N', 'W', 'E'].filter((a) => !main.includes(a));
    // one car on the main road, one or two on the side road; on the side road the car from the right would win without signs
    const first = { arm: pick(main), v: vs[0] }; const others = (Math.random() < 0.5 ? side : [pick(side)]).map((arm, i) => ({ arm, v: vs[i + 1] }));
    const cars = [first].concat(others);
    if (Math.random() < 0.4) {
      const lights = cars.map((c) => { const [x, y] = SIGN_AT[c.arm]; return `<path d="M${x} ${y + 10} L${x} ${y + 24}" stroke="#555" stroke-width="2"/><g transform="translate(${x - 18} ${y - 22}) scale(.36)">${lamp(c === first ? 'gruen' : 'rot')}</g>`; }).join('');
      return choice(mod, 'vorfahrt', 'Alle fahren geradeaus. Schau auf die Ampeln. Wer darf zuerst fahren?', first.v.name, others.map((c) => c.v.name), 'vfa_' + cars.map((c) => c.arm).join(''), { tier: 2, group: mod + ':2', pic: crossingSVG(cars, lights) });
    }
    const wait = pick(['vorfahrtgewaehren', 'stopp']);
    const signs = main.map((a) => smallSign(a, SIGN_ART.vorfahrtstrasse)).join('') + side.map((a) => smallSign(a, SIGN_ART[wait])).join('');
    return choice(mod, 'vorfahrt', 'Alle fahren geradeaus. Schau auf die Schilder. Wer darf zuerst fahren?', first.v.name, others.map((c) => c.v.name), 'vfs_' + cars.map((c) => c.arm).join('') + wait, { tier: 2, group: mod + ':2', pic: crossingSVG(cars, signs) });
  }

  // Das verkehrssichere Fahrrad (StVZO): Teile zum Beschriften und für „Was fehlt?“
  const BIKE_PARTS = [
    { id: 'klingel', name: 'Klingel', desc: 'Eine helle Klingel am Lenker, damit dich andere hören.', tip: 'Der Teil ist am Lenker.' },
    { id: 'vbremse', name: 'Vorderradbremse', desc: 'Das Fahrrad braucht zwei Bremsen, die unabhängig voneinander wirken. Eine bremst das Vorderrad.', tip: 'Der Teil sitzt am Vorderrad.' },
    { id: 'hbremse', name: 'Hinterradbremse', desc: 'Die zweite Bremse bremst das Hinterrad. Fällt eine Bremse aus, hält dich die andere.', tip: 'Der Teil sitzt am Hinterrad.' },
    { id: 'licht', name: 'Scheinwerfer', desc: 'Vorn leuchtet ein weißes Licht, damit du siehst und gesehen wirst.', tip: 'Der Teil leuchtet vorn weiß.' },
    { id: 'frontrefl', name: 'Weißer Frontreflektor', desc: 'Ein weißer Reflektor vorn wirft das Licht der Autos zurück.', tip: 'Der Teil ist vorn und weiß, aber er leuchtet nicht selbst.' },
    { id: 'ruecklicht', name: 'Rücklicht', desc: 'Hinten leuchtet ein rotes Licht.', tip: 'Der Teil leuchtet hinten rot.' },
    { id: 'rueckstrahler', name: 'Roter Rückstrahler', desc: 'Ein großer roter Reflektor hinten wirft Licht zurück.', tip: 'Der Teil ist hinten, rot und eckig.' },
    { id: 'speichen', name: 'Speichenreflektoren', desc: 'Gelbe Reflektoren in den Speichen, an jedem Rad zwei. Statt ihnen gehen auch weiße Streifen an den Reifen.', tip: 'Der Teil ist in den Rädern.' },
    { id: 'pedal', name: 'Pedalreflektoren', desc: 'Gelbe Reflektoren an beiden Pedalen.', tip: 'Der Teil ist an den Pedalen.' },
  ];
  const pol = (cx, cy, a, r) => `${f1(cx + Math.cos(a) * r)} ${f1(cy + Math.sin(a) * r)}`;
  // tyre with tread and sheen, silver rim, 18 crossed spokes
  const wheel = (cx) => `<circle cx="${cx}" cy="140" r="46" fill="none" stroke="${STROKE}" stroke-width="10.5"/><circle cx="${cx}" cy="140" r="46" fill="none" stroke="#3B404C" stroke-width="7.5"/><circle cx="${cx}" cy="140" r="49.2" fill="none" stroke="#5B6271" stroke-width="1.6" stroke-dasharray="2.2 2.4"/><path d="M${pol(cx, 140, 3.5, 47)} A47 47 0 0 1 ${pol(cx, 140, 4.6, 47)}" fill="none" stroke="#9AA3B4" stroke-width="1.8" stroke-linecap="round"/>`
    + `<circle cx="${cx}" cy="140" r="40.5" fill="none" stroke="url(#bkRm)" stroke-width="3.6"/><circle cx="${cx}" cy="140" r="38.6" fill="none" stroke="#6E7887" stroke-width=".8"/>`
    + `<path d="${Array.from({ length: 18 }, (_, i) => { const a = i * Math.PI / 9; return `M${pol(cx, 140, a + (i % 2 ? 0.5 : -0.5), 5)} L${pol(cx, 140, a, 38.5)}`; }).join('')}" stroke="#B9C2CF" stroke-width="1"/>`
    + `<path d="${Array.from({ length: 6 }, (_, i) => { const a = 3.4 + i * 0.16; return `M${pol(cx, 140, a + 0.5, 6)} L${pol(cx, 140, a, 37)}`; }).join('')}" stroke="#F4F7FB" stroke-width="1"/>`
    + `<circle cx="${cx}" cy="140" r="6.5" fill="url(#bkHb)" stroke="${STROKE}" stroke-width="1.5"/><circle cx="${cx}" cy="140" r="2" fill="#4A5260"/>`;
  // frame tube: ink edge, coloured body, a thin glossy line along the top
  const tube = (d, w, c, hi) => `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${d}" stroke="${STROKE}" stroke-width="${w + 3}"/><path d="${d}" stroke="${c}" stroke-width="${w}"/><path d="${d}" stroke="${hi}" stroke-width="1.3" opacity=".8" transform="translate(-.6 -1.3)"/></g>`;
  const glint = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" style="stroke:none"/>`;
  const amber = (x, y, w, h, rot) => `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="2" fill="url(#bkAm)" stroke="${STROKE}" stroke-width="1.5"/>${tex(`M${x - w / 2 + 3} ${y - h / 2 + 1.5} L${x - w / 2 + 3} ${y + h / 2 - 1.5} M${x} ${y - h / 2 + 1.5} L${x} ${y + h / 2 - 1.5} M${x + w / 2 - 3} ${y - h / 2 + 1.5} L${x + w / 2 - 3} ${y + h / 2 - 1.5}`, '#B86E00', 0.8, 0.7)}${glint(x - w / 2 + 2.5, y - h / 2 + 2, 1.1)}</g>`;
  const spokeRefl = (cx) => [-0.6, 2.5].map((a) => amber(+f1(cx + Math.cos(a) * 26), +f1(140 + Math.sin(a) * 26), 15, 7, f1(a * 180 / Math.PI))).join('');
  const caliper = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x - 7} ${y - 3} Q${x} ${y - 8} ${x + 7} ${y - 3} L${x + 6} ${y + 6} L${x + 3} ${y + 6} L${x + 3} ${y} L${x - 3} ${y} L${x - 3} ${y + 6} L${x - 6} ${y + 6} Z" fill="url(#bkDk)" stroke="${STROKE}" stroke-width="1.6" stroke-linejoin="round"/><rect x="${x - 5.5}" y="${y + 4}" width="3" height="4" fill="#7A4A32"/><rect x="${x + 2.5}" y="${y + 4}" width="3" height="4" fill="#7A4A32"/></g>`;
  const BIKEP = { label: 'Fahrrad', box: '-30 -6 380 246', parts: BIKE_PARTS, qid: 'vr_', note: 'fahrrad', poolQ: 'Wie heißt dieser Teil des Fahrrads?', tap: 'den Teil am Fahrrad',
    stepOf: { klingel: 1, vbremse: 2, hbremse: 2, licht: 3, frontrefl: 3, ruecklicht: 4, rueckstrahler: 4, speichen: 5, pedal: 5 },
    steps: ['Zeichne zwei Räder, den Rahmen, den Sattel, den Lenker und daran die Klingel.', 'Zeichne die zwei Bremsen: eine am Vorderrad, eine am Hinterrad.', 'Zeichne vorn den Scheinwerfer und darunter den weißen Reflektor.', 'Zeichne hinten das rote Rücklicht und den roten Rückstrahler.', 'Zeichne die gelben Reflektoren in die Speichen und an die Pedale.'],
    ask: () => 'Wie heißt der leuchtende Teil am Fahrrad?', find: (p) => `Tippe auf: ${p.name}` };
  BIKEP.svg = (opts) => partsSVG(BIKEP, opts, (g) => `<defs>
    <linearGradient id="bkSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4EEF6"/><stop offset="1" stop-color="#F6F1E6"/></linearGradient>
    <linearGradient id="bkGr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCD3C2"/><stop offset="1" stop-color="#EDE6D8"/></linearGradient>
    <linearGradient id="bkFr" gradientUnits="userSpaceOnUse" x1="0" y1="70" x2="0" y2="150"><stop offset="0" stop-color="#4FB0CC"/><stop offset="1" stop-color="#1E6482"/></linearGradient>
    <linearGradient id="bkRm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2F5F9"/><stop offset=".5" stop-color="#AEB7C4"/><stop offset="1" stop-color="#E1E6EE"/></linearGradient>
    <radialGradient id="bkHb" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#8E98A6"/></radialGradient>
    <linearGradient id="bkDk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B6372"/><stop offset="1" stop-color="#22262F"/></linearGradient>
    <linearGradient id="bkAm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD866"/><stop offset=".55" stop-color="#FFAA1F"/><stop offset="1" stop-color="#E07800"/></linearGradient>
    <linearGradient id="bkRd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF7A6B"/><stop offset=".55" stop-color="#E0302C"/><stop offset="1" stop-color="#A11C1C"/></linearGradient>
    <linearGradient id="bkWh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9D2DE"/></linearGradient>
    <radialGradient id="bkGl" cx="40%" cy="40%" r="60%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#FFF6C8"/><stop offset="1" stop-color="#F2D36B"/></radialGradient>
    <linearGradient id="bkBm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFE680" stop-opacity=".75"/><stop offset="1" stop-color="#FFE680" stop-opacity="0"/></linearGradient>
    <radialGradient id="bkBe" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#FFF4B8"/><stop offset=".5" stop-color="#F2BE3A"/><stop offset="1" stop-color="#A8720E"/></radialGradient>
    <linearGradient id="bkSd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A5038"/><stop offset="1" stop-color="#3A2418"/></linearGradient></defs>
    <rect x="-30" y="-6" width="380" height="246" rx="12" fill="url(#bkSky)"/><path d="M-30 190 L350 190 L350 228 Q350 240 338 240 L-18 240 Q-30 240 -30 228 Z" fill="url(#bkGr)"/><path d="M-30 190 L350 190" stroke="#C4B8A2" stroke-width="1.5"/>
    <ellipse cx="160" cy="192" rx="128" ry="5" fill="${STROKE}" opacity=".14"/>
    <g id="bkW">${wheel(80)}</g><use href="#bkW" x="160"/>
    <path d="M80 135 L150 135 M80 145 L150 157" fill="none" stroke="${STROKE}" stroke-width="3.4" stroke-linecap="round"/><path d="M80 135 L150 135 M80 145 L150 157" fill="none" stroke="#9AA4B2" stroke-width="2" stroke-dasharray="2.4 1.2"/>
    <circle cx="150" cy="146" r="12" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-dasharray="2 1.4"/><circle cx="150" cy="146" r="10.5" fill="none" stroke="${STROKE}" stroke-width="4"/><circle cx="150" cy="146" r="10.5" fill="none" stroke="url(#bkRm)" stroke-width="2.4"/><circle cx="80" cy="140" r="5.5" fill="none" stroke="#5B6372" stroke-width="2"/>
    ${tube('M124 84 L56 88 L80 140', 2.4, '#AEB7C4', '#F2F5F9')}
    ${tube('M214 82 L208 64 L190 58', 3.5, '#AEB7C4', '#F2F5F9')}${tube('M219 94 Q230 118 240 140', 4, '#AEB7C4', '#F2F5F9')}${tube('M128 76 L124 63', 3.5, '#AEB7C4', '#F2F5F9')}
    ${tube('M80 140 L150 146 L128 78 L80 140 M128 78 L214 82 M150 146 L217 90 M214 82 L219 94', 5.5, 'url(#bkFr)', '#A6E0EE')}
    <path d="M190 58 L180 60" stroke="${STROKE}" stroke-width="9" stroke-linecap="round"/><path d="M190 58 L180 60" stroke="#3B404C" stroke-width="6" stroke-linecap="round"/><path d="M188 56.8 L182 58" stroke="#7D8595" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M102 61 Q104 55 118 56 Q132 56 141 59 Q144 64 137 66 Q124 68 109 67 Q100 66 102 61 Z" fill="url(#bkSd)" stroke="${STROKE}" stroke-width="2.2" stroke-linejoin="round"/><path d="M108 59 Q120 57 134 59" fill="none" stroke="#B88A6A" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M214 75 L219 72" stroke="${STROKE}" stroke-width="4" stroke-linecap="round"/><path d="M214 75 L219 72" stroke="#AEB7C4" stroke-width="2" stroke-linecap="round"/>
    ${tube('M150 146 L166 170 M150 146 L136 124', 3, '#AEB7C4', '#F2F5F9')}<circle cx="150" cy="146" r="3.5" fill="url(#bkHb)" stroke="${STROKE}" stroke-width="1.4"/>
    <rect x="158" y="168" width="20" height="7" rx="2" fill="url(#bkDk)" stroke="${STROKE}" stroke-width="1.5"/><rect x="126" y="120" width="20" height="7" rx="2" fill="url(#bkDk)" stroke="${STROKE}" stroke-width="1.5"/>
    ${g('klingel', `<path d="M196 58 L196 53" stroke="${STROKE}" stroke-width="2.4"/><path d="M196 56 L203 53" stroke="#5B6372" stroke-width="2" stroke-linecap="round"/><path d="M188 52 Q188 39 196 39 Q204 39 204 52 Z" fill="url(#bkBe)" stroke="${STROKE}" stroke-width="2" stroke-linejoin="round"/><circle cx="196" cy="38" r="1.8" fill="url(#bkBe)" stroke="${STROKE}" stroke-width="1.2"/>${glint(192.5, 44, 1.8)}${HIT('M182 30 L210 30 L210 60 L182 60 Z')}`)}
    ${g('vbremse', `<path d="M186 61 L181 70" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round"/><path d="M186 64 Q208 68 220 90" fill="none" stroke="#2E333D" stroke-width="1.6"/>${caliper(221, 95, 24)}${HIT('M208 84 L234 84 L234 108 L208 108 Z')}`)}
    ${g('hbremse', `<path d="M188 61 L184 71" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round"/><path d="M188 63 Q199 70 200 85 L134 83 Q119 85 111 96" fill="none" stroke="#2E333D" stroke-width="1.6"/>${caliper(109, 101, -38)}${HIT('M96 86 L122 86 L122 112 L96 112 Z')}`)}
    ${g('licht', `<path d="M233 59 L268 46 L268 86 L233 75 Z" fill="url(#bkBm)" style="stroke:none"/><path d="M218 62 L229 59 Q236 59 236 67 Q236 75 229 75 L218 72 Z" fill="url(#bkDk)" stroke="${STROKE}" stroke-width="2" stroke-linejoin="round"/><ellipse cx="234" cy="67" rx="3.2" ry="7.6" fill="url(#bkGl)" stroke="${STROKE}" stroke-width="1.6"/>${glint(233.2, 63.5, 1.2)}<path d="M221 63.5 L228 61.5" stroke="#8D96A6" stroke-width="1.2" stroke-linecap="round"/>${HIT('M214 50 L262 50 L262 80 L214 80 Z')}`)}
    ${g('frontrefl', `<rect x="230" y="104" width="10" height="16" rx="2.5" fill="url(#bkWh)" stroke="${STROKE}" stroke-width="2"/>${tex('M232 109 L238 109 M232 114 L238 114 M235 106 L235 118', '#AEB9C8', 0.8)}${glint(232.6, 106.6, 1.1)}<path d="M228 109 L231 109" stroke="#5B6372" stroke-width="2"/>${HIT('M224 98 L246 98 L246 126 L224 126 Z')}`)}
    ${g('ruecklicht', `<path d="M40 76 L24 70 M40 83 L22 83 M40 90 L24 96" stroke="#FF8A80" stroke-width="3" stroke-linecap="round" opacity=".85"/><path d="M58 80 L46 79 Q41 79 41 84 Q41 89 46 89 L58 88 Z" fill="url(#bkDk)" stroke="${STROKE}" stroke-width="1.8" stroke-linejoin="round"/><ellipse cx="44" cy="84" rx="3" ry="5" fill="url(#bkRd)" stroke="${STROKE}" stroke-width="1.5"/>${glint(43.4, 81.5, 1)}${HIT('M20 66 L60 66 L60 92 L20 92 Z')}`)}
    ${g('rueckstrahler', `<rect x="39" y="95" width="17" height="15" rx="2.5" fill="url(#bkRd)" stroke="${STROKE}" stroke-width="2"/>${tex('M41 99 L54 99 M41 103 L54 103 M41 107 L54 107 M43.5 96.5 L43.5 109 M47.5 96.5 L47.5 109 M51.5 96.5 L51.5 109', '#FF9A8E', 0.7, 0.8)}${glint(42, 97.6, 1.3)}${HIT('M34 93 L60 93 L60 114 L34 114 Z')}`)}
    ${g('speichen', `${spokeRefl(80)}${spokeRefl(240)}`)}
    ${g('pedal', `${[[161, 169], [169, 169], [129, 121], [137, 121]].map(([x, y]) => `<rect x="${x}" y="${y}" width="7" height="5" rx="1.2" fill="url(#bkAm)" stroke="${STROKE}" stroke-width="1"/>${glint(x + 1.8, y + 1.5, 0.9)}`).join('')}${HIT('M122 114 L182 114 L182 182 L122 182 Z')}`)}`,
  [['klingel', 196, 26, 'middle'], ['licht', 262, 18, 'start', [236, 60]], ['vbremse', 346, 82, 'end', [226, 94]], ['hbremse', 86, 34, 'middle', [107, 94]], ['ruecklicht', -26, 52, 'start', [44, 78]], ['rueckstrahler', -26, 232, 'start', [44, 110]], ['frontrefl', 346, 232, 'end', [238, 121]], ['speichen', 132, 214, 'middle', [217, 157]], ['pedal', 182, 196]]);
  PLANTS.fahrrad = BIKEP;
  function missingTask(mod) {
    const p = pick(BIKE_PARTS); const others = shuffle(BIKE_PARTS.filter((x) => x !== p)).slice(0, 2).map((x) => x.name);
    return choice(mod, 'fahrrad', 'Was fehlt an diesem Fahrrad?', p.name, others, 'vfehlt_' + p.id, { pic: BIKEP.svg({ omit: p.id }) });
  }

  const ABBIEGEN = [
    { id: 'a1', text: 'Über die linke Schulter nach hinten schauen.' },
    { id: 'a2', text: 'Mit dem linken Arm ein Handzeichen geben.' },
    { id: 'a3', text: 'Zur Straßenmitte hin einordnen.' },
    { id: 'a4', text: 'Den Gegenverkehr vorbeifahren lassen.' },
    { id: 'a5', text: 'In einem weiten Bogen nach links abbiegen.' },
  ];
  const QUEREN = [
    { id: 'q1', text: 'Am Bordstein stehen bleiben.' },
    { id: 'q2', text: 'Nach links schauen.' },
    { id: 'q3', text: 'Nach rechts schauen.' },
    { id: 'q4', text: 'Noch einmal nach links schauen.' },
    { id: 'q5', text: 'Wenn die Straße frei ist, zügig hinübergehen – nicht rennen.' },
  ];
  const VE_NOTES = {
    zeichen: { title: 'Verkehrszeichen', lines: ['Runde Schilder mit rotem Rand verbieten etwas.', 'Runde blaue Schilder sagen, was du tun musst, zum Beispiel Radweg oder Gehweg benutzen.', 'Eckige blaue Schilder geben Hinweise, zum Beispiel Fußgängerüberweg oder Einbahnstraße.', 'Das Stoppschild ist achteckig und rot: anhalten und die anderen fahren lassen.', 'Ein Dreieck mit der Spitze nach unten heißt: Vorfahrt gewähren. Die gelbe Raute heißt: Vorfahrtstraße.', 'Im verkehrsberuhigten Bereich dürfen Kinder auf der Straße spielen. Autos fahren Schritt.', 'Ampel: Rot – stehen bleiben. Gelb – anhalten, gleich kommt Rot. Grün – fahren, wenn die Kreuzung frei ist.'] },
    vorfahrt: { title: 'Vorfahrt', lines: ['Gibt es kein Schild und keine Ampel, gilt: rechts vor links.', 'Stell dich in jedes Fahrzeug: Kommt von rechts jemand, musst du warten.', 'Schilder gehen vor „rechts vor links“: Auf der Vorfahrtstraße (gelbe Raute) fährst du zuerst.', 'Vor dem Dreieck mit der Spitze nach unten und vor dem Stoppschild wartest du.', 'Eine Ampel geht vor den Schildern: Grün fährt, Rot wartet.', 'Ein Polizist, der den Verkehr regelt, geht vor allem anderen.', 'Auch auf dem Fahrrad gelten diese Regeln.'] },
    fahrrad: { title: 'Das verkehrssichere Fahrrad', lines: BIKE_PARTS.map((p) => `${p.name}: ${p.desc}`) },
    abbiegen: { title: 'Links abbiegen mit dem Fahrrad', lines: ABBIEGEN.map((x, i) => `${i + 1}. ${x.text}`).concat(['Beim Handzeichen den Arm deutlich ausstrecken. Wer noch unsicher ist, steigt ab und schiebt über die Straße.']) },
    fussweg: { title: 'Zu Fuß unterwegs', lines: ['Geh auf dem Gehweg. Gibt es keinen Gehweg, geh am linken Straßenrand, dann siehst du die Autos kommen.'].concat(QUEREN.map((x, i) => `${i + 1}. ${x.text}`), ['Am besten gehst du über den Zebrastreifen oder bei Grün über die Ampel.', 'Geh nie zwischen parkenden Autos hindurch über die Straße: Dort sieht dich niemand.', 'Am Zebrastreifen gehst du erst, wenn die Autos angehalten haben.']) },
    helm: { title: 'Der Fahrradhelm', lines: ['Ein Helm schützt deinen Kopf bei einem Sturz.', 'Er sitzt gerade und bedeckt die Stirn: Zwischen Helm und Augenbrauen passen etwa zwei Finger.', 'Die Riemen bilden unter jedem Ohr ein V.', 'Der Kinnriemen ist so fest, dass gerade ein Finger darunter passt.', 'Nach einem Sturz braucht man einen neuen Helm, auch wenn man nichts sieht.'] },
    sicht: { title: 'Gut sichtbar', lines: ['Helle Kleidung sieht man im Dunkeln viel früher als dunkle.', 'Reflektoren an Jacke, Ranzen und Fahrrad werfen das Licht der Autos zurück.', 'Eine Warnweste hilft besonders im Herbst und Winter, wenn es früh dunkel wird.', 'Im Dunkeln und bei Regen fährst du mit Licht.'] },
    radweg: { title: 'Wo fahren Kinder Rad?', lines: ['Bis zu deinem 8. Geburtstag musst du mit dem Rad auf dem Gehweg fahren. Einen Radweg, der von der Straße getrennt ist, darfst du auch benutzen.', 'Bis zu deinem 10. Geburtstag darfst du auf dem Gehweg fahren.', 'Danach fährst du auf dem Radweg oder auf der Straße.', 'Auf dem Gehweg nimmst du Rücksicht auf Fußgänger und fährst langsam.', 'Willst du über die Straße, steigst du vom Gehweg aus ab und schiebst.'] },
  };
  const VE_POOL = partPool('fahrrad', 'parts', 'fahrrad', 'vr_').concat([
    // Verkehrszeichen
    { id: 'vezei1', mod: 'zeichen', g: 'zeichen', q: 'Was zeigen runde Schilder mit rotem Rand?', o: ['Ein Verbot', 'Einen Hinweis', 'Eine Vorfahrtstraße'], a: 0 },
    { id: 'vezei2', mod: 'zeichen', g: 'zeichen', q: 'Welche Form hat das Stoppschild?', o: ['Achteckig', 'Dreieckig', 'Rund'], a: 0 },
    { id: 'vezei3', mod: 'zeichen', g: 'zeichen', q: 'Welche Farbe hat das Schild „Vorfahrtstraße“ in der Mitte?', o: ['Gelb', 'Rot', 'Blau'], a: 0 },
    { id: 'vezei4', mod: 'zeichen', g: 'zeichen', q: 'Was zeigen runde blaue Schilder?', o: ['Was man tun muss, zum Beispiel einen Radweg benutzen', 'Ein Verbot', 'Eine Gefahr'], a: 0 },
    { id: 'vezei5', mod: 'zeichen', g: 'zeichen', q: 'Am Stoppschild darf man langsam weiterrollen, wenn niemand kommt.', rf: true, a: false, why: 'Am Stoppschild muss man immer ganz anhalten.' },
    { id: 'vezei6', mod: 'zeichen', g: 'zeichen', q: 'Im verkehrsberuhigten Bereich dürfen Kinder auf der Straße spielen.', rf: true, a: true },
    { id: 'vezei7', mod: 'zeichen', g: 'zeichen', q: 'Wie schnell fahren Autos im verkehrsberuhigten Bereich?', o: ['Schrittgeschwindigkeit', 'So schnell sie wollen', '100 km/h'], a: 0 },
    { id: 'vezei8', mod: 'zeichen', g: 'zeichen', q: 'Die Ampel zeigt Gelb. Was tust du?', o: ['Anhalten, denn gleich kommt Rot', 'Schnell losfahren', 'Weiterfahren und klingeln'], a: 0 },
    { id: 'vezei9', mod: 'zeichen', g: 'zeichen', q: 'Bei Grün darf man fahren, ohne zu schauen.', rf: true, a: false, why: 'Auch bei Grün schaust du, ob die Kreuzung frei ist.' },
    { id: 'vezei10', mod: 'zeichen', g: 'zeichen', q: 'Welches Zeichen zeigt einen Zebrastreifen an?', o: ['Fußgängerüberweg', 'Einbahnstraße', 'Stoppschild'], a: 0 },
    { id: 'vezei11', mod: 'zeichen', g: 'zeichen', q: 'In einer Einbahnstraße darf man in beide Richtungen fahren.', rf: true, a: false, why: 'Man darf nur in Pfeilrichtung fahren. Steht darunter „Radfahrer frei“, dürfen Radfahrer auch andersherum fahren.' },
    // Vorfahrt
    { id: 'vevo1', mod: 'vorfahrt', g: 'vorfahrt', q: 'Was gilt an einer Kreuzung ohne Schilder und Ampel?', o: ['Rechts vor links', 'Links vor rechts', 'Der Schnellste fährt zuerst'], a: 0 },
    { id: 'vevo2', mod: 'vorfahrt', g: 'vorfahrt', q: 'Wer geht vor: das Schild oder die Ampel?', o: ['Die Ampel', 'Das Schild', 'Keins von beiden'], a: 0 },
    { id: 'vevo3', mod: 'vorfahrt', g: 'vorfahrt', q: 'Ein Polizist regelt den Verkehr. Seine Zeichen gehen vor Ampel und Schildern.', rf: true, a: true },
    { id: 'vevo4', mod: 'vorfahrt', g: 'vorfahrt', q: '„Rechts vor links“ gilt nur für Autos, nicht für Fahrräder.', rf: true, a: false, why: 'Die Regel gilt auch für Radfahrer.' },
    { id: 'vevo5', mod: 'vorfahrt', g: 'vorfahrt', q: 'Du fährst auf der Vorfahrtstraße. Darfst du an der Kreuzung zuerst fahren?', o: ['Ja', 'Nein, ich muss immer warten', 'Nur wenn ich klingle'], a: 0 },
    { id: 'vevo6', mod: 'vorfahrt', g: 'vorfahrt', q: 'Vor dir steht ein Dreieck mit der Spitze nach unten. Was tust du?', o: ['Warten und die anderen zuerst fahren lassen', 'Schneller fahren', 'Ohne zu schauen weiterfahren'], a: 0 },
    { id: 'vevo7', mod: 'vorfahrt', g: 'vorfahrt', q: 'Von rechts kommt ein Auto, es gibt kein Schild. Was tust du mit dem Fahrrad?', o: ['Ich warte und lasse es zuerst fahren', 'Ich fahre zuerst', 'Ich klingle und fahre los'], a: 0 },
    // Sicher unterwegs: zu Fuß, Helm, Sichtbarkeit, Rad fahren auf Gehweg und Radweg
    { id: 'vewe1', mod: 'weg', g: 'fussweg', q: 'Wo gehst du, wenn es keinen Gehweg gibt?', o: ['Am linken Straßenrand', 'Mitten auf der Straße', 'Am rechten Straßenrand mit dem Rücken zu den Autos'], a: 0 },
    { id: 'vewe2', mod: 'weg', g: 'fussweg', q: 'Wohin schaust du, bevor du über die Straße gehst?', o: ['Links, rechts und noch einmal links', 'Nur nach oben', 'Nur nach rechts'], a: 0 },
    { id: 'vewe3', mod: 'weg', g: 'fussweg', q: 'Zwischen parkenden Autos ist eine gute Stelle, um über die Straße zu gehen.', rf: true, a: false, why: 'Zwischen parkenden Autos sieht dich niemand. Such dir eine Stelle, an der du alles überblickst.' },
    { id: 'vewe4', mod: 'weg', g: 'fussweg', q: 'Am Zebrastreifen gehst du los, …', o: ['… wenn die Autos angehalten haben', '… sobald ein Auto kommt', '… ohne zu schauen'], a: 0 },
    { id: 'vewe5', mod: 'weg', g: 'fussweg', q: 'Über die Straße soll man rennen, damit es schnell geht.', rf: true, a: false, why: 'Geh zügig, aber renn nicht. Beim Rennen kann man stolpern.' },
    { id: 'vewe6', mod: 'weg', g: 'fussweg', q: 'Wo überquerst du die Straße am sichersten?', o: ['Am Zebrastreifen oder an der Ampel bei Grün', 'In einer Kurve', 'Hinter einem Bus'], a: 0 },
    { id: 'vewe7', mod: 'weg', g: 'helm', q: 'Wie fest ist der Kinnriemen des Helms?', o: ['Ein Finger passt gerade darunter', 'Eine ganze Hand passt darunter', 'Er ist offen'], a: 0 },
    { id: 'vewe8', mod: 'weg', g: 'helm', q: 'Wie sitzt der Helm richtig?', o: ['Gerade auf dem Kopf, er bedeckt die Stirn', 'Weit hinten im Nacken', 'Schief über einem Ohr'], a: 0 },
    { id: 'vewe9', mod: 'weg', g: 'helm', q: 'Nach einem Sturz braucht man einen neuen Helm, auch wenn man nichts sieht.', rf: true, a: true },
    { id: 'vewe10', mod: 'weg', g: 'helm', q: 'Was schützt der Fahrradhelm?', o: ['Den Kopf', 'Die Knie', 'Die Füße'], a: 0 },
    { id: 'vewe11', mod: 'weg', g: 'helm', q: 'Unter jedem Ohr bilden die Riemen des Helms ein V.', rf: true, a: true },
    { id: 'vewe12', mod: 'weg', g: 'sicht', q: 'Welche Kleidung sieht ein Autofahrer im Dunkeln am frühesten?', o: ['Helle Kleidung mit Reflektoren', 'Schwarze Kleidung', 'Dunkelblaue Kleidung'], a: 0 },
    { id: 'vewe13', mod: 'weg', g: 'sicht', q: 'Was machen Reflektoren?', o: ['Sie werfen das Licht der Autos zurück', 'Sie leuchten von selbst', 'Sie machen das Fahrrad schneller'], a: 0 },
    { id: 'vewe14', mod: 'weg', g: 'sicht', q: 'Im Herbst wird es früh dunkel. Was hilft dir auf dem Schulweg?', o: ['Eine Warnweste oder Reflektoren am Ranzen', 'Eine Sonnenbrille', 'Ein dunkler Mantel'], a: 0 },
    { id: 'vewe15', mod: 'weg', g: 'sicht', q: 'Im Dunkeln fährst du mit Licht.', rf: true, a: true },
    { id: 'vewe16', mod: 'weg', g: 'radweg', q: 'Wo müssen Kinder bis zu ihrem 8. Geburtstag Rad fahren?', o: ['Auf dem Gehweg', 'Auf der Straße', 'Auf der Autobahn'], a: 0 },
    { id: 'vewe17', mod: 'weg', g: 'radweg', q: 'Bis zu welchem Geburtstag dürfen Kinder auf dem Gehweg Rad fahren?', o: ['Bis zum 10. Geburtstag', 'Bis zum 5. Geburtstag', 'Bis zum 18. Geburtstag'], a: 0 },
    { id: 'vewe18', mod: 'weg', g: 'radweg', q: 'Auf dem Gehweg nimmst du mit dem Rad Rücksicht auf Fußgänger.', rf: true, a: true },
    { id: 'vewe19', mod: 'weg', g: 'radweg', q: 'Du fährst auf dem Gehweg und willst über die Straße. Was tust du?', o: ['Absteigen und schieben', 'Schnell hinüberfahren', 'Klingeln und losfahren'], a: 0 },
    { id: 'vewe20', mod: 'weg', g: 'radweg', q: 'Ein 11-jähriges Kind darf noch auf dem Gehweg Rad fahren.', rf: true, a: false, why: 'Nur bis zum 10. Geburtstag. Danach fährt man auf dem Radweg oder auf der Straße.' },
    { id: 'vewe21', mod: 'weg', g: 'abbiegen', q: 'Was tust du zuerst, bevor du mit dem Rad links abbiegst?', o: ['Über die linke Schulter nach hinten schauen', 'Sofort nach links lenken', 'Die Augen schließen'], a: 0 },
    { id: 'vewe22', mod: 'weg', g: 'abbiegen', q: 'Mit welchem Arm zeigst du, dass du links abbiegst?', o: ['Mit dem linken Arm', 'Mit dem rechten Arm', 'Mit beiden Armen'], a: 0 },
    { id: 'vewe23', mod: 'weg', g: 'abbiegen', q: 'Beim Linksabbiegen lässt du den Gegenverkehr zuerst fahren.', rf: true, a: true },
    { id: 'vewe24', mod: 'weg', g: 'fahrrad', q: 'Wie viele Bremsen braucht ein verkehrssicheres Fahrrad?', o: ['Zwei, die unabhängig voneinander wirken', 'Eine', 'Gar keine'], a: 0 },
    { id: 'vewe25', mod: 'weg', g: 'fahrrad', q: 'Welche Farbe hat das Licht vorn am Fahrrad?', o: ['Weiß', 'Rot', 'Grün'], a: 0 },
    { id: 'vewe26', mod: 'weg', g: 'fahrrad', q: 'Welche Farbe hat das Rücklicht?', o: ['Rot', 'Weiß', 'Blau'], a: 0 },
    { id: 'vewe27', mod: 'weg', g: 'fahrrad', q: 'Welche Farbe haben die Reflektoren an den Pedalen?', o: ['Gelb', 'Blau', 'Grün'], a: 0 },
    { id: 'vewe28', mod: 'weg', g: 'fahrrad', q: 'Eine Klingel gehört an jedes Fahrrad.', rf: true, a: true },
    // Lückentext
    { id: 'velt1', mod: 'lt', g: 'vorfahrt', q: 'Ohne Schild und Ampel gilt: rechts vor ___.', o: ['links', 'rechts', 'oben'], a: 0 },
    { id: 'velt2', mod: 'lt', g: 'zeichen', q: 'Das ___ ist achteckig und rot.', o: ['Stoppschild', 'Radwegschild', 'Gehwegschild'], a: 0 },
    { id: 'velt3', mod: 'lt', g: 'fussweg', q: 'Vor dem Überqueren schaust du links, rechts und noch einmal ___.', o: ['links', 'rechts', 'nach oben'], a: 0 },
    { id: 'velt4', mod: 'lt', g: 'helm', q: 'Der ___ schützt beim Radfahren den Kopf.', o: ['Helm', 'Schal', 'Handschuh'], a: 0 },
    { id: 'velt5', mod: 'lt', g: 'sicht', q: '___ werfen das Licht der Autos zurück.', o: ['Reflektoren', 'Klingeln', 'Bremsen'], a: 0 },
    { id: 'velt6', mod: 'lt', g: 'fahrrad', q: 'Hinten am Fahrrad leuchtet ein ___ Licht.', o: ['rotes', 'weißes', 'grünes'], a: 0 },
    { id: 'velt7', mod: 'lt', g: 'radweg', q: 'Bis zum 8. Geburtstag fahren Kinder auf dem ___.', o: ['Gehweg', 'Parkplatz', 'Fahrbahn'], a: 0 },
    { id: 'velt8', mod: 'lt', g: 'abbiegen', q: 'Vor dem Linksabbiegen gibst du mit dem linken Arm ein ___.', o: ['Handzeichen', 'Klingelzeichen', 'Lichtzeichen'], a: 0 },
    { id: 'velt9', mod: 'lt', g: 'zeichen', q: 'Bei ___ bleibst du an der Ampel stehen.', o: ['Rot', 'Grün', 'Blau'], a: 0 },
  ]);
  const VE_MODULES = {
    zeichen: { name: 'Verkehrszeichen', icon: '🛑', maxTier: 2, worldCap: [2], dmg: 12 },
    vorfahrt: { name: 'Vorfahrt', icon: '🚦', maxTier: 2, worldCap: [2], dmg: 14 },
    parts: { name: 'Das sichere Fahrrad', icon: '🚲', maxTier: 2, worldCap: [2], dmg: 12 },
    fehlt: { name: 'Was fehlt?', icon: '🔧', maxTier: 1, worldCap: [1], dmg: 12 },
    weg: { name: 'Sicher unterwegs', icon: '🦺', maxTier: 1, worldCap: [1], dmg: 14 },
    lt: { name: 'Lückentext', icon: '✏️', maxTier: 1, worldCap: [1], dmg: 10 },
  };
  const VE_TUT = {
    'zeichen:1': { title: 'Verkehrszeichen', steps: ['Du siehst ein Verkehrszeichen. Was bedeutet es?', 'Beispiel: Ein rundes blaues Schild mit weißem Fahrrad heißt „Radweg: Hier fahren nur Radfahrer“.', 'Rund mit rotem Rand: Verbot. Rund und blau: Gebot. Eckig und blau: Hinweis.'] },
    'zeichen:2': { title: 'Das richtige Zeichen', steps: ['Jetzt andersherum: Oben steht, was das Zeichen bedeutet.', 'Beispiel: „Anhalten und die anderen zuerst fahren lassen“ ist das rote, achteckige Stoppschild.', 'Tippe auf das passende Bild.'] },
    'vorfahrt:1': { title: 'Rechts vor links', steps: ['Du siehst eine Kreuzung von oben. Die gelben Pfeile zeigen: Alle fahren geradeaus.', 'Stell dich in jedes Fahrzeug. Kommt von deiner rechten Seite jemand, musst du warten.', 'Beispiel: Das Fahrrad kommt von unten, das Auto von links. Rechts vom Fahrrad ist niemand: Das Fahrrad fährt zuerst.'] },
    'vorfahrt:2': { title: 'Schilder und Ampeln', steps: ['Jetzt gibt es Schilder oder Ampeln. Sie gehen vor „rechts vor links“.', 'Die gelbe Raute heißt Vorfahrtstraße: Wer dort fährt, fährt zuerst. Vor Dreieck oder Stoppschild wartet man.', 'Bei Ampeln fährt, wer Grün hat. Rot wartet.'] },
    'parts:1': { title: 'Das sichere Fahrrad', steps: ['Ein Teil des Fahrrads leuchtet gelb.', 'Beispiel: Leuchtet die runde gelbe Glocke am Lenker, ist das die Klingel.', 'Tippe auf den richtigen Namen.'] },
    'parts:2': { title: 'Teile finden', steps: ['Jetzt andersherum: Oben steht ein Name.', 'Beispiel: Das Rücklicht ist hinten und leuchtet rot.', 'Tippe direkt auf diesen Teil am Fahrrad.'] },
    'fehlt:1': { title: 'Was fehlt?', steps: ['An diesem Fahrrad fehlt ein Teil, das für die Sicherheit wichtig ist.', 'Geh alles durch: Klingel, zwei Bremsen, Scheinwerfer, weißer Reflektor vorn, Rücklicht, roter Rückstrahler, Reflektoren in Speichen und an Pedalen.', 'Beispiel: Ist am Lenker keine gelbe Glocke, fehlt die Klingel.'] },
    'weg:1': { title: 'Sicher unterwegs', steps: ['Fragen zum Schulweg, zum Helm, zu Reflektoren und dazu, wo Kinder Rad fahren.', 'Beispiel: Bis zum 8. Geburtstag fährst du mit dem Rad auf dem Gehweg.', 'Manchmal wählst du „Richtig“ oder „Falsch“, manchmal eine von drei Antworten.'] },
    'wegord:1': { title: 'Der Reihe nach', steps: ['Die Schritte sind durcheinander.', 'Beispiel Straße überqueren: Zuerst bleibst du am Bordstein stehen, dann schaust du links, rechts und noch einmal links.', 'Tippe die Schritte der Reihe nach an. Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.'] },
    'lt:1': { title: 'Lückentext', steps: ['Im Satz fehlt ein Wort (___).', 'Beispiel: „Ohne Schild und Ampel gilt: rechts vor ___.“ Hier passt „links“.', 'Tippe auf das Wort, das passt.'] },
  };
  function veGen(cfg) {
    return (mod, tier, know, seq, opts) => {
      if (mod === 'parts') return plantTask(cfg, 'fahrrad', mod, tier, know, seq, opts);
      if (mod === 'fehlt') return missingTask(mod);
      if (wantsPool(cfg, mod, opts)) return null;
      if (mod === 'zeichen' && (tier >= 2 || Math.random() < 0.75)) return signTask(mod, tier);
      if (mod === 'vorfahrt' && (tier >= 2 || Math.random() < 0.8)) return rightOfWayTask(mod, tier);
      if (mod === 'weg' && Math.random() < 0.3) return Math.random() < 0.5 ? orderTask(mod, 'wegord:1', 'abbiegen', 'Links abbiegen mit dem Fahrrad: Tippe die Schritte der Reihe nach an.', ABBIEGEN, 'veab_', 5) : orderTask(mod, 'wegord:1', 'fussweg', 'Über die Straße gehen: Tippe die Schritte der Reihe nach an.', QUEREN, 'vequ_', 5);
      return null;
    };
  }
  const VE = { modules: VE_MODULES, tut: VE_TUT, notes: VE_NOTES, pool: VE_POOL, worlds: 1, grade: 3, subject: 'Sachkunde', title: 'Sicher im Verkehr', icon: '🚲', sub: 'Verkehrszeichen, Vorfahrt, das sichere Fahrrad, Schulweg und Helm', school: 'fahrrad',
    starters: [{ id: 'verkehrspolizistin', type: 'normal', shape: 'verkehrspolizistin', names: ['Die Verkehrspolizistin', 'Die Verkehrspolizistin', 'Die Verkehrspolizistin'], hp: 70, desc: 'Sie übt mit Schulkindern auf dem Übungsplatz das Radfahren und prüft, ob jedes Fahrrad verkehrssicher ist.', perk: 'crit',
      attacks: [{ name: 'Kelle', mod: 'zeichen' }, { name: 'Trillerpfeife', mod: 'vorfahrt' }, { name: 'Luftpumpe', mod: 'parts' }, { name: 'Warnweste', mod: 'weg' }] }],
    extra: { zeichen: 'Schilderwald', vorfahrt: 'Handzeichen', parts: 'Fahrradcheck', fehlt: 'Werkzeugkasten', weg: 'Schulwegplan', lt: 'Verkehrsfibel' },
    enemies: { 1: {
      normal: [
        { name: 'Der dichte Nebel', type: 'wasser', shape: 'nebelbank', hp: 26, atk: 3 },
        { name: 'Das Glatteis', type: 'wasser', shape: 'glatteis', hp: 28, atk: 4 },
        { name: 'Das Schlagloch', type: 'normal', shape: 'schlagloch', hp: 30, atk: 3 },
        { name: 'Die Dämmerung', type: 'normal', shape: 'daemmerung', hp: 24, atk: 4 },
      ],
      elite: { name: 'Der tote Winkel', type: 'normal', shape: 'totwinkel', hp: 45, atk: 5 },
      boss: { name: 'Der Raser', acc: 'den Raser', type: 'feuer', shape: 'raser', hp: 70, atk: 6, boss: true },
    } },
    moves: ['Nebelschwade', 'Rutschpartie', 'Holperloch', 'Zwielicht', 'Blinder Fleck', 'Vollgas'],
    events: [
      { title: 'Der Übungsplatz', text: 'Auf dem Übungsplatz der Verkehrsschule stehen viele Schilder. Der Polizist gibt dir einen Schild, wenn du eins erklärst.', opts: [{ label: 'Antworten', task: 'zeichen', g: 'zeichen', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Fahrradcheck', text: 'Vor der Schule prüft eine Polizistin die Fahrräder. Wer ihre Frage beantwortet, bekommt einen Trank.', opts: [{ label: 'Antworten', task: 'parts', g: 'fahrrad', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Der Schülerlotse', text: 'Ein Schülerlotse mit Kelle hilft am Zebrastreifen. Er kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort.', opts: [{ label: 'Antworten', task: 'weg', g: 'fussweg', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Kreuzung', text: 'An einer Kreuzung ohne Ampel hält ein Lieferwagen. Der Fahrer fragt dich, wer zuerst fahren darf.', opts: [{ label: 'Antworten', task: 'vorfahrt', g: 'vorfahrt', win: { item: 'keks' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
      { title: 'Die Bushaltestelle', text: 'Unter dem Dach der Bushaltestelle ist es trocken. Hier wartest du und ruhst dich aus.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
      { title: 'Der Helm', dilemma: true, reward: { hp: 5 }, text: 'Deine Freunde fahren ohne Helm zum Spielplatz. Einer ruft: „Mit dem Helm siehst du aus wie ein Pilz!“', opts: [
        { label: 'Ich behalte den Helm auf.', then: 'Du fährst mit. Auf dem Kies rutscht du weg, aber dein Kopf bleibt heil. Die anderen staunen.', think: 'Was ist wichtiger: wie man aussieht oder wie man geschützt ist?' },
        { label: 'Ich frage, warum sie keinen Helm tragen.', then: 'Einer sagt: „Meiner ist zu klein.“ Er nimmt sich vor, zu Hause nach einem neuen zu fragen.', think: 'Warum ist es gut, nachzufragen statt mitzumachen?' },
        { label: HELP, then: 'Du erzählst es deiner Mama. Sie spricht mit den anderen Eltern, und bald fahren alle mit Helm.', think: 'Wer kann dir helfen, wenn du dich nicht traust?' } ] },
    ] };
  VE.gen = veGen(VE);

  K.MODES.sinne = SI; K.MODES.verkehr = VE;
  return { EYE_PARTS, EAR_PARTS, BIKE_PARTS, SENSES, ILLUSIONS, SIGNS, VEHICLES, RIGHT_OF, ABBIEGEN, QUEREN, illusionSet, signTask, rightOfWayTask, missingTask, senseTask, signSVG };
})();
if (typeof module !== 'undefined') module.exports = MS2;
