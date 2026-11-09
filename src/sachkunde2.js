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
  // a point on the upper edge of the eye (quadratic curve from 60|110 over 150|44 to 240|110)
  const lidAt = (t) => [(1 - t) ** 2 * 60 + 2 * t * (1 - t) * 150 + t * t * 240, (1 - t) ** 2 * 110 + 2 * t * (1 - t) * 44 + t * t * 110];
  const lashes = () => [0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86].map((t) => { const [x, y] = lidAt(t); const dx = (t - 0.5) * 22; return `M${x.toFixed(1)} ${y.toFixed(1)} q${(dx * 0.4).toFixed(1)} -10 ${dx.toFixed(1)} -16`; }).join(' ');
  EYE.svg = (opts) => partsSVG(EYE, opts, (g) => `
    <rect width="300" height="200" rx="14" fill="#F7D9BC"/>
    <path d="M60 110 Q150 44 240 110 Q150 170 60 110 Z" fill="#FFFFFF" stroke="${STROKE}" stroke-width="2.5"/>
    ${g('iris', `<circle cx="150" cy="108" r="30" fill="#4E8FD0" stroke="#24508A" stroke-width="2.5"/>${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M${(150 + Math.cos(a) * 15).toFixed(1)} ${(108 + Math.sin(a) * 15).toFixed(1)} L${(150 + Math.cos(a) * 27).toFixed(1)} ${(108 + Math.sin(a) * 27).toFixed(1)}" stroke="#2F6DB0" stroke-width="1.5"/>`; }).join('')}`)}
    ${g('pupille', `<circle cx="150" cy="108" r="13" fill="#111"/><circle cx="145" cy="102" r="4" fill="#fff"/>`)}
    ${g('lid', `<path d="M56 110 Q150 20 244 110 Q150 44 56 110 Z" fill="#EDBE95" stroke="${STROKE}" stroke-width="2.5"/><path d="M84 88 Q150 50 216 88" stroke="#C99A72" stroke-width="2" fill="none"/>`)}
    ${g('wimpern', `<path d="${lashes()}" stroke="#2B1D14" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M96 152 l-4 8 M150 142 l0 9 M204 152 l4 8" stroke="#2B1D14" stroke-width="2.4" stroke-linecap="round"/>${HIT('M60 104 Q150 30 240 104 L240 70 Q150 4 60 70 Z')}`)}
    ${g('braue', `<path d="M74 52 Q150 4 232 48" stroke="#6B4423" stroke-width="13" fill="none" stroke-linecap="round"/>${HIT('M64 56 Q150 -10 242 52 L242 30 Q150 -24 64 34 Z')}`)}
    ${g('traenen', `<path d="M52 122 Q60 136 60 142 A8 8 0 0 1 44 142 Q44 136 52 122 Z" fill="#8FD0FF" stroke="#2A6CB0" stroke-width="2"/><path d="M46 158 Q52 168 52 172 A6 6 0 0 1 40 172 Q40 168 46 158 Z" fill="#8FD0FF" stroke="#2A6CB0" stroke-width="2"/>${HIT('M30 118 L70 118 L70 184 L30 184 Z')}`)}`,
  [['braue', 296, 22, 'end'], ['lid', 250, 84], ['wimpern', 6, 60], ['iris', 296, 168, 'end', [176, 126]], ['pupille', 150, 192, 'middle'], ['traenen', 74, 176]]);

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
  EAR.svg = (opts) => partsSVG(EAR, opts, (g) => `
    <rect width="300" height="200" rx="14" fill="#F7D9BC"/>
    <path d="M64 20 L300 20 L300 190 L64 190 Q80 150 70 106 Q80 60 64 20 Z" fill="#EFE6D8" stroke="#B9A88E" stroke-width="2"/>
    <ellipse cx="190" cy="104" rx="32" ry="30" fill="#FFF8EE" stroke="#B9A88E" stroke-width="1.5"/>
    <path d="M246 112 Q270 118 300 110" stroke="#F0B429" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${g('muschel', `<path d="M74 58 Q40 10 18 60 Q4 104 28 146 Q42 170 62 158 Q72 150 64 134 Q52 116 72 114 L72 96 Q48 84 74 58 Z" fill="#F2BE98" stroke="${STROKE}" stroke-width="2.5"/><path d="M58 50 Q34 36 28 70 Q24 100 40 128" stroke="#C98E66" stroke-width="2.5" fill="none" stroke-linecap="round"/>`)}
    ${g('gang', `<path d="M70 94 Q110 90 160 96 L160 116 Q110 120 70 116 Z" fill="#F4B8A8" stroke="${STROKE}" stroke-width="2.5"/><circle cx="104" cy="112" r="3" fill="#D9A441"/>`)}
    ${g('trommelfell', `<ellipse cx="162" cy="106" rx="4" ry="20" fill="#F7E3B0" stroke="${STROKE}" stroke-width="2.5"/>${HIT('M152 82 L172 82 L172 130 L152 130 Z')}`)}
    ${g('knochen', `<g fill="#FFFDF5" stroke="${STROKE}" stroke-width="2"><path d="M166 112 L176 92 Q180 84 186 88 Q190 92 184 98 L170 116 Z"/><path d="M184 86 Q196 78 202 88 Q204 96 196 100 Q188 98 184 86 Z"/><path d="M198 98 L212 98 L216 116 L194 116 Z M200 102 L210 102 L212 112 L198 112 Z" fill-rule="evenodd"/></g>${HIT('M164 78 L220 78 L220 122 L164 122 Z')}`)}
    ${g('schnecke', `<path d="M218 112 a22 22 0 1 1 22 22 a16 16 0 1 1 -16 -16 a10 10 0 1 1 10 10 a5 5 0 1 1 -5 -5" fill="none" stroke="#2A8CA8" stroke-width="7" stroke-linecap="round"/><path d="M218 112 a22 22 0 1 1 22 22 a16 16 0 1 1 -16 -16 a10 10 0 1 1 10 10 a5 5 0 1 1 -5 -5" fill="none" stroke="#BFE8F2" stroke-width="3" stroke-linecap="round"/>${HIT('M214 82 L268 82 L268 140 L214 140 Z')}`)}`,
  [['muschel', 8, 188], ['gang', 112, 84, 'middle'], ['trommelfell', 160, 150, 'middle'], ['knochen', 196, 66, 'middle'], ['schnecke', 244, 162, 'middle']]);
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
    { id: 'sise1', mod: 'sinne', g: 'sinne', q: 'Wie viele Sinne hat der Mensch?', o: ['5', '3', '10'], a: 0 },
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
  const SI = { modules: SI_MODULES, tut: SI_TUT, notes: SI_NOTES, pool: SI_POOL, worlds: 1, title: 'Die fünf Sinne', icon: '👁️', sub: 'Auge, Ohr, Sinne schützen, Hilfen im Alltag, Nein zu Drogen und Sinnestäuschungen', school: ['auge', 'ohr'], swap: { from: 'event', to: 'taeusch' }, labor: illusionSet,
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
  // Verkehrszeichen nach StVO, schematisch im Kasten 0–100
  const BIKE = (c, w) => `<g fill="none" stroke="${c}" stroke-width="${w || 4}" stroke-linecap="round" stroke-linejoin="round"><circle cx="30" cy="62" r="12"/><circle cx="70" cy="62" r="12"/><path d="M30 62 L46 62 L40 44 L62 44 L70 62 M46 62 L62 44 M38 40 L46 40 M62 44 L60 36 L68 36"/></g>`;
  const WALKER = (x, y, k, c) => `<g transform="translate(${x} ${y}) scale(${k})" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="0" cy="-26" r="5" fill="${c}"/><path d="M0 -19 L0 0 M0 0 L-7 16 M0 0 L7 16 M0 -14 L-9 -3 M0 -14 L9 -4"/></g>`;
  const SIGN_ART = {
    stopp: `<path d="M33 8 L67 8 L92 33 L92 67 L67 92 L33 92 L8 67 L8 33 Z" fill="#D32F2F" stroke="#fff" stroke-width="3"/><text x="50" y="59" font-size="23" font-weight="800" text-anchor="middle" fill="#fff">STOP</text>`,
    vorfahrtgewaehren: '<path d="M6 12 L94 12 L50 92 Z" fill="#D32F2F" stroke="#7A1414" stroke-width="1" stroke-linejoin="round"/><path d="M22 21 L78 21 L50 72 Z" fill="#fff"/>',
    vorfahrtstrasse: '<path d="M50 4 L96 50 L50 96 L4 50 Z" fill="#fff" stroke="#333" stroke-width="1.5"/><path d="M50 16 L84 50 L50 84 L16 50 Z" fill="#FDD835" stroke="#333" stroke-width="1"/>',
    radweg: `<circle cx="50" cy="50" r="44" fill="#1565C0" stroke="#fff" stroke-width="3"/>${BIKE('#fff')}`,
    gehweg: `<circle cx="50" cy="50" r="44" fill="#1565C0" stroke="#fff" stroke-width="3"/>${WALKER(40, 62, 1.15, '#fff')}${WALKER(62, 66, 0.8, '#fff')}<path d="M50 52 L56 55" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`,
    zebra: `<rect x="8" y="8" width="84" height="84" rx="6" fill="#1565C0" stroke="#fff" stroke-width="3"/><path d="M50 16 L86 82 L14 82 Z" fill="#fff"/><path d="M30 76 L70 76 M34 70 L66 70" stroke="${STROKE}" stroke-width="3"/>${WALKER(50, 62, 0.85, STROKE)}`,
    einbahn: '<rect x="4" y="30" width="92" height="40" rx="3" fill="#1565C0" stroke="#fff" stroke-width="2.5"/><path d="M10 42 L68 42 L68 35 L90 50 L68 65 L68 58 L10 58 Z" fill="#fff"/><text x="39" y="53.5" font-size="8.5" font-weight="800" text-anchor="middle" fill="#111">Einbahnstraße</text>',
    radverbot: `<circle cx="50" cy="50" r="42" fill="#fff" stroke="#D32F2F" stroke-width="9"/>${BIKE('#111')}`,
    spielstrasse: `<rect x="4" y="16" width="92" height="68" rx="4" fill="#1565C0" stroke="#fff" stroke-width="2.5"/><path d="M12 54 L12 34 L24 24 L36 34 L36 54 Z" fill="#fff"/>${WALKER(48, 62, 0.75, '#fff')}${WALKER(60, 66, 0.55, '#fff')}<circle cx="70" cy="70" r="3.5" fill="#fff"/><path d="M66 78 L70 72 L86 72 L90 78 Z M62 78 L92 78" fill="#fff" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>`,
    radfrei: `<rect x="6" y="26" width="88" height="48" rx="4" fill="#fff" stroke="#111" stroke-width="2.5"/><g transform="translate(-2 18) scale(.62)">${BIKE('#111', 5)}</g><text x="74" y="58" font-size="16" font-weight="800" text-anchor="middle" fill="#111">frei</text>`,
  };
  const lamp = (lit) => `<rect x="33" y="4" width="34" height="92" rx="8" fill="#263238" stroke="#111" stroke-width="2"/>${[['rot', '#E53935', 21], ['gelb', '#FDD835', 50], ['gruen', '#43A047', 79]].map(([k, c, y]) => `<circle cx="50" cy="${y}" r="11" fill="${k === lit ? c : '#4A5459'}" stroke="#111" stroke-width="1.5"/>`).join('')}`;
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
  const wheel = (cx) => `<circle cx="${cx}" cy="140" r="46" fill="none" stroke="#333" stroke-width="7"/><circle cx="${cx}" cy="140" r="42" fill="none" stroke="#777" stroke-width="1.5"/>${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M${cx} 140 L${(cx + Math.cos(a) * 42).toFixed(1)} ${(140 + Math.sin(a) * 42).toFixed(1)}" stroke="#AAB2BD" stroke-width="1"/>`; }).join('')}<circle cx="${cx}" cy="140" r="4" fill="#555"/>`;
  const spokeRefl = (cx) => [-0.6, 2.5].map((a) => { const x = cx + Math.cos(a) * 28, y = 140 + Math.sin(a) * 28; return `<rect x="${(x - 7).toFixed(1)}" y="${(y - 3.5).toFixed(1)}" width="14" height="7" rx="2" fill="#FFB300" stroke="#8A5A00" stroke-width="1.5" transform="rotate(${(a * 180 / Math.PI).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }).join('');
  const BIKEP = { label: 'Fahrrad', box: '-30 -6 380 246', parts: BIKE_PARTS, qid: 'vr_', note: 'fahrrad', poolQ: 'Wie heißt dieser Teil des Fahrrads?', tap: 'den Teil am Fahrrad',
    stepOf: { klingel: 1, vbremse: 2, hbremse: 2, licht: 3, frontrefl: 3, ruecklicht: 4, rueckstrahler: 4, speichen: 5, pedal: 5 },
    steps: ['Zeichne zwei Räder, den Rahmen, den Sattel, den Lenker und daran die Klingel.', 'Zeichne die zwei Bremsen: eine am Vorderrad, eine am Hinterrad.', 'Zeichne vorn den Scheinwerfer und darunter den weißen Reflektor.', 'Zeichne hinten das rote Rücklicht und den roten Rückstrahler.', 'Zeichne die gelben Reflektoren in die Speichen und an die Pedale.'],
    ask: () => 'Wie heißt der leuchtende Teil am Fahrrad?', find: (p) => `Tippe auf: ${p.name}` };
  BIKEP.svg = (opts) => partsSVG(BIKEP, opts, (g) => `
    <rect x="-30" y="-6" width="380" height="246" rx="12" fill="#EEF3F8"/>
    ${wheel(80)}${wheel(240)}
    <g stroke="#2E7D9A" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M80 140 L150 146 L128 78 L80 140 M128 78 L214 82 L150 146"/></g>
    <path d="M214 82 L240 140" stroke="#5A6470" stroke-width="5" stroke-linecap="round"/>
    <path d="M214 82 L208 62 L192 58" stroke="#5A6470" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M192 58 L180 60" stroke="#333" stroke-width="7" stroke-linecap="round"/>
    <path d="M128 78 L124 66" stroke="#5A6470" stroke-width="5" stroke-linecap="round"/><path d="M106 62 Q122 56 138 62 Q124 70 106 62 Z" fill="#333"/>
    <path d="M124 84 L56 88 L80 140" stroke="#8A939E" stroke-width="3.5" fill="none" stroke-linejoin="round"/>
    <circle cx="150" cy="146" r="10" fill="none" stroke="#555" stroke-width="3"/><path d="M150 146 L166 170 M150 146 L136 124" stroke="#444" stroke-width="5" stroke-linecap="round"/>
    <rect x="158" y="168" width="20" height="7" rx="2" fill="#555"/><rect x="126" y="120" width="20" height="7" rx="2" fill="#555"/>
    ${g('klingel', `<path d="M196 56 L196 50" stroke="#555" stroke-width="2"/><circle cx="196" cy="47" r="7" fill="#FFC93C" stroke="${STROKE}" stroke-width="2"/>${HIT('M184 34 L208 34 L208 58 L184 58 Z')}`)}
    ${g('vbremse', `<path d="M186 62 L180 68" stroke="#111" stroke-width="3" stroke-linecap="round"/><path d="M186 64 Q206 76 230 96" stroke="#111" stroke-width="1.5" fill="none"/><rect x="226" y="90" width="12" height="10" rx="2" fill="#111" transform="rotate(25 232 95)"/>${HIT('M218 82 L246 82 L246 108 L218 108 Z')}`)}
    ${g('hbremse', `<path d="M188 60 Q160 76 110 90" stroke="#111" stroke-width="1.5" fill="none"/><rect x="100" y="88" width="12" height="10" rx="2" fill="#111" transform="rotate(-35 106 93)"/>${HIT('M92 80 L120 80 L120 106 L92 106 Z')}`)}
    ${g('licht', `<path d="M218 66 L232 62 L232 78 L218 74 Z" fill="#fff" stroke="${STROKE}" stroke-width="2"/><path d="M238 62 L254 56 M238 70 L256 70 M238 78 L254 84" stroke="#FFD54F" stroke-width="3" stroke-linecap="round"/>${HIT('M214 52 L258 52 L258 88 L214 88 Z')}`)}
    ${g('frontrefl', `<rect x="222" y="98" width="9" height="14" rx="2" fill="#fff" stroke="${STROKE}" stroke-width="2"/><path d="M224 102 L229 102 M224 106 L229 106" stroke="#B0BEC5" stroke-width="1.2"/>${HIT('M216 94 L238 94 L238 116 L216 116 Z')}`)}
    ${g('ruecklicht', `<rect x="44" y="80" width="12" height="10" rx="2" fill="#E53935" stroke="${STROKE}" stroke-width="2"/><path d="M40 78 L28 72 M40 85 L26 85 M40 92 L28 98" stroke="#FF8A80" stroke-width="3" stroke-linecap="round"/>${HIT('M22 66 L58 66 L58 94 L22 94 Z')}`)}
    ${g('rueckstrahler', `<rect x="40" y="96" width="16" height="13" rx="2" fill="#C62828" stroke="${STROKE}" stroke-width="2"/><path d="M42 100 L54 100 M42 104 L54 104 M48 97 L48 108" stroke="#FF8A80" stroke-width="1"/>${HIT('M34 94 L60 94 L60 114 L34 114 Z')}`)}
    ${g('speichen', `${spokeRefl(80)}${spokeRefl(240)}`)}
    ${g('pedal', `<rect x="161" y="169" width="7" height="5" rx="1" fill="#FFB300"/><rect x="129" y="121" width="7" height="5" rx="1" fill="#FFB300"/><rect x="169" y="169" width="7" height="5" rx="1" fill="#FFB300"/><rect x="137" y="121" width="7" height="5" rx="1" fill="#FFB300"/>${HIT('M122 114 L182 114 L182 182 L122 182 Z')}`)}`,
  [['klingel', 196, 30, 'middle'], ['licht', 262, 18, 'start', [236, 62]], ['vbremse', 346, 82, 'end', [240, 94]], ['hbremse', 106, 34, 'middle', [106, 88]], ['ruecklicht', -26, 52, 'start', [46, 80]], ['rueckstrahler', -26, 232, 'start', [46, 110]], ['frontrefl', 346, 232, 'end', [228, 112]], ['speichen', 132, 214, 'middle', [216, 158]], ['pedal', 182, 196]]);
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
  const VE = { modules: VE_MODULES, tut: VE_TUT, notes: VE_NOTES, pool: VE_POOL, worlds: 1, title: 'Sicher im Verkehr', icon: '🚲', sub: 'Verkehrszeichen, Vorfahrt, das sichere Fahrrad, Schulweg und Helm', school: 'fahrrad',
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
