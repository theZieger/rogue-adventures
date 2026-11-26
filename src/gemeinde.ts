// Sachunterricht grade 3: Kinderrechte und Gemeinde. Not in the Saxon grade 3 plan; the states whose plans name
// children's rights, the class council and the Gemeinde are listed in lehrplan/quellen-gemeinde.md.
// Everything here has to be true in every state: how a mayor is elected, what the council is called and the rules
// of children's parliaments differ by state and are left out. Registers its unit in MK.MODES like sachkunde.ts.
import type { Unit } from './curriculum.ts';
import { MK as K, type GenOpts, type Know, type Question } from './knowledge.ts';
import { MS as S } from './sachkunde.ts';

export const MG = (() => {
  const { shuffle, pick } = K;
  const { choice, orderTask, wantsPool } = S;
  const NS = 'xmlns="http://www.w3.org/2000/svg"';
  const OUT = '#1C2541';

  /* ---------- children's rights: what a situation is about ---------- */
  // group: only where the sources sort the right the same way (Schutz-, Förder-, Beteiligungsrechte, BMFSFJ)
  const RIGHTS: { id: string; name: string; group?: string }[] = [
    { id: 'gleich', name: 'Recht auf Gleichheit' },
    { id: 'gesund', name: 'Recht auf Gesundheit', group: 'Förderrecht' },
    { id: 'bildung', name: 'Recht auf Bildung', group: 'Förderrecht' },
    { id: 'freizeit', name: 'Recht auf Freizeit, Spiel und Erholung' },
    { id: 'meinung', name: 'Recht, gehört zu werden', group: 'Beteiligungsrecht' },
    { id: 'gewalt', name: 'Recht auf Schutz vor Gewalt', group: 'Schutzrecht' },
    { id: 'privat', name: 'Recht auf Privatsphäre' },
    { id: 'name', name: 'Recht auf einen Namen', group: 'Förderrecht' },
    { id: 'familie', name: 'Recht auf Familie' },
    { id: 'info', name: 'Recht auf Information', group: 'Beteiligungsrecht' },
    { id: 'behinderung', name: 'Recht auf besondere Hilfe bei einer Behinderung' },
    { id: 'arbeit', name: 'Recht auf Schutz vor Kinderarbeit', group: 'Schutzrecht' },
    { id: 'krieg', name: 'Recht auf Schutz im Krieg und auf der Flucht', group: 'Schutzrecht' },
  ];
  const GROUPS = ['Schutzrecht', 'Förderrecht', 'Beteiligungsrecht'];
  // a: the right the situation is about; skip: rights that fit it too and are never offered as wrong
  const CASES: { q: string; a: string; skip?: string[] }[] = [
    { q: 'Ein Kind darf nicht mitmachen, weil es aus einem anderen Land kommt.', a: 'gleich' },
    { q: 'Ein Kind hat hohes Fieber und wird von einer Ärztin behandelt.', a: 'gesund' },
    { q: 'Jedes Kind darf zur Schule gehen und lesen, schreiben und rechnen lernen.', a: 'bildung', skip: ['arbeit'] },
    { q: 'Nach den Hausaufgaben trifft sich Mia mit Freunden auf dem Bolzplatz.', a: 'freizeit' },
    {
      q: 'Die Stadt plant einen neuen Spielplatz und fragt die Kinder nach ihren Wünschen.',
      a: 'meinung',
      skip: ['freizeit', 'info'],
    },
    { q: 'Niemand darf ein Kind schlagen, auch nicht die Eltern.', a: 'gewalt' },
    { q: 'Paul schreibt Tagebuch. Seine Schwester darf es nicht einfach lesen.', a: 'privat' },
    { q: 'Ein Baby bekommt nach der Geburt einen Namen und wird beim Standesamt eingetragen.', a: 'name' },
    { q: 'Die Eltern von Lea leben getrennt. Lea darf beide regelmäßig sehen.', a: 'familie' },
    { q: 'In den Kindernachrichten erfährt Ben, was in der Welt passiert, in Worten, die er versteht.', a: 'info' },
    {
      q: 'Ein Kind im Rollstuhl bekommt Hilfe, damit es mit allen anderen lernen kann.',
      a: 'behinderung',
      skip: ['bildung', 'gleich'],
    },
    {
      q: 'Ein Kind muss nicht in einer Fabrik schuften, sondern darf zur Schule gehen.',
      a: 'arbeit',
      skip: ['bildung'],
    },
    {
      q: 'Eine Familie flieht vor dem Krieg. Die Kinder bekommen Schutz und Hilfe.',
      a: 'krieg',
      skip: ['gewalt', 'familie'],
    },
    { q: 'Die Klasse fragt Tom, was er über den Ausflug denkt, und hört ihm zu.', a: 'meinung' },
    { q: 'Ein Kind bekommt jeden Tag genug zu essen und sauberes Wasser.', a: 'gesund' },
    { q: 'Ohne Sarahs Erlaubnis werden keine Fotos von ihr ins Internet gestellt.', a: 'privat' },
  ];
  const rightOf = (id: string) => RIGHTS.find((r) => r.id === id)!;
  // pictograms like those on posters of the children's rights; only rights a picture shows without doubt
  const lin = (id: string, a: string, b: string) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const lw = (w: number) => `stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const ln = lw(2.4);
  const SIGNS: Record<string, string> = {
    bildung:
      `<defs>${lin('gmSb', '#FFFFFF', '#E6E0D0')}</defs><path d="M60 40 Q42 30 20 34 L20 88 Q42 84 60 94 Q78 84 100 88 L100 34 Q78 30 60 40 Z" fill="url(#gmSb)" ${ln}/><path d="M60 40 L60 94" ${ln}/>` +
      `<path d="M28 48 Q40 46 52 50 M28 58 Q40 56 52 60 M28 68 Q40 66 52 70 M68 50 Q80 46 92 48 M68 60 Q80 56 92 58" fill="none" stroke="#9AA3C2" stroke-width="2.4" stroke-linecap="round"/>` +
      `<g transform="rotate(35 84 70)"><rect x="78" y="40" width="12" height="44" rx="2" fill="#FFC93C" ${ln}/><path d="M78 84 L84 96 L90 84 Z" fill="#F4D9B0" ${ln}/><path d="M82.5 92 L84 96 L85.5 92 Z" fill="${OUT}"/></g>`,
    gesund:
      `<defs>${lin('gmSg', '#E8553A', '#B83A24')}</defs><path d="M46 38 L46 30 Q46 24 52 24 L68 24 Q74 24 74 30 L74 38" fill="none" ${lw(5)}/><rect x="18" y="38" width="84" height="58" rx="10" fill="url(#gmSg)" ${ln}/>` +
      `<path d="M54 50 H66 V61 H77 V73 H66 V84 H54 V73 H43 V61 H54 Z" fill="#fff" ${ln}/><path d="M26 46 Q30 42 38 42" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>`,
    meinung:
      `<defs>${lin('gmSm', '#FFFFFF', '#DDEBFA')}</defs><path d="M22 22 L98 22 Q106 22 106 30 L106 66 Q106 74 98 74 L54 74 L36 90 L38 74 L22 74 Q14 74 14 66 L14 30 Q14 22 22 22 Z" fill="url(#gmSm)" ${ln}/>` +
      `<circle cx="40" cy="48" r="5" fill="${OUT}"/><circle cx="60" cy="48" r="5" fill="${OUT}"/><circle cx="80" cy="48" r="5" fill="${OUT}"/>` +
      `<g transform="translate(-6 -16)"><path d="M84 116 L84 96 Q84 90 90 90 L104 90 Q110 90 110 96 L110 116" fill="#F4C9A0" ${ln}/><path d="M88 92 L88 80 M95 90 L95 76 M102 90 L102 78 M108 94 L110 84" fill="none" ${lw(5)}/><path d="M88 92 L88 80 M95 90 L95 76 M102 90 L102 78 M108 94 L110 84" fill="none" stroke="#F4C9A0" stroke-width="2.4" stroke-linecap="round"/></g>`,
    freizeit:
      `<defs>${lin('gmSf', '#FFD23F', '#F0A500')}</defs><path d="M70 14 L96 36 L76 64 L50 40 Z" fill="#5AA7E8" ${ln}/><path d="M70 14 L76 64 M96 36 L50 40" ${ln}/><path d="M76 64 Q70 76 78 84 Q86 92 78 102" fill="none" stroke="${OUT}" stroke-width="2"/><path d="M73 74 l6 2 M76 88 l6 -2" ${ln}/>` +
      `<circle cx="38" cy="84" r="22" fill="url(#gmSf)" ${ln}/><path d="M18 76 Q38 88 58 76 M38 62 Q30 84 38 106" fill="none" ${ln}/>`,
    privat:
      `<defs>${lin('gmSp', '#B06FD0', '#7A3E9A')}</defs><rect x="26" y="20" width="68" height="84" rx="6" fill="url(#gmSp)" ${ln}/><path d="M34 20 L34 104" ${ln}/><path d="M88 56 L102 56 L102 72 L88 72" fill="#C9CED8" ${ln}/>` +
      `<path d="M56 54 L56 46 Q56 36 64 36 Q72 36 72 46 L72 54" fill="none" ${lw(5)}/><rect x="50" y="54" width="28" height="24" rx="3" fill="#FFC93C" ${ln}/><circle cx="64" cy="64" r="3" fill="${OUT}"/><path d="M64 66 L64 72" ${ln}/>`,
    info:
      `<defs>${lin('gmSi', '#FFFFFF', '#E6E0D0')}</defs><rect x="16" y="22" width="88" height="76" rx="4" fill="url(#gmSi)" ${ln}/><rect x="24" y="30" width="72" height="12" rx="2" fill="#3B6FB5"/>` +
      `<rect x="24" y="50" width="32" height="26" rx="2" fill="#8FD0F2" ${ln}/><path d="M26 74 L36 62 L44 70 L50 64 L56 74" fill="#4FA868"/><circle cx="48" cy="58" r="3" fill="#FFC93C"/>` +
      `<path d="M64 54 H96 M64 62 H96 M64 70 H90 M24 84 H96 M24 91 H80" stroke="#9AA3C2" stroke-width="3" stroke-linecap="round"/>`,
  };
  const signSVG = (id: string) =>
    `<svg ${NS} class="pic" viewBox="0 0 120 120" style="max-width:150px" aria-label="Zeichen für ein Kinderrecht"><circle cx="60" cy="60" r="58" fill="#EEF4FA"/>${SIGNS[id]}</svg>`;

  /* ---------- votes in class: a tally on the board ---------- */
  const VOTES = [
    { q: 'Wohin geht der Klassenausflug?', o: ['Zoo', 'Kletterpark', 'Museum'] },
    { q: 'Was gibt es beim Klassenfest zu essen?', o: ['Pizza', 'Nudeln', 'Pfannkuchen'] },
    { q: 'Wie soll das Klassentier aus Stoff heißen?', o: ['Bruno', 'Flocke', 'Kiki'] },
    { q: 'Welche Pflanze kommt auf die Fensterbank?', o: ['Sonnenblume', 'Kresse', 'Tomate'] },
    { q: 'Was macht die Klasse am Wandertag?', o: ['Waldlauf', 'Schatzsuche', 'Bauernhof'] },
  ];
  // groups of five: four strokes and one across them
  function tallySVG(rows: [string, number][]) {
    const h = 26 + rows.length * 46;
    let s = '';
    rows.forEach(([label, n], i) => {
      const y = 22 + i * 46;
      s += `<text x="14" y="${y + 23}" font-size="15" font-weight="700" fill="${OUT}">${label}</text>`;
      for (let k = 0; k < n; k++) {
        const g = Math.floor(k / 5),
          x0 = 146 + g * 46;
        if (k % 5 === 4)
          s += `<path d="M${x0 - 4} ${y + 26} L${x0 + 32} ${y + 6}" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>`;
        else
          s += `<path d="M${x0 + (k % 5) * 8} ${y + 2} L${x0 + (k % 5) * 8} ${y + 30}" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>`;
      }
      if (i) s += `<path d="M10 ${y - 6} L290 ${y - 6}" stroke="#C9B48A" stroke-width="1.2"/>`;
    });
    return `<svg ${NS} class="pic" viewBox="0 0 300 ${h}" style="max-width:300px" aria-label="Strichliste mit ${rows.length} Vorschlägen"><rect x="2" y="2" width="296" height="${h - 4}" rx="10" fill="#FFF8E6" stroke="#C9B48A" stroke-width="2"/><path d="M134 12 L134 ${h - 12}" stroke="#C9B48A" stroke-width="1.2"/>${s}</svg>`;
  }
  // three different counts between 3 and 12, so there is exactly one winner
  const counts = () => shuffle([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).slice(0, 3);
  function voteTask(mod: string) {
    const v = pick(VOTES),
      n = counts(),
      rows = v.o.map((o, i) => [o, n[i]] as [string, number]);
    const best = rows.reduce((a, b) => (b[1] > a[1] ? b : a));
    const pic = tallySVG(rows);
    const r = Math.random();
    if (r < 0.5)
      return choice(mod, 'mehrheit', `${v.q} Die Klasse hat abgestimmt. Welcher Vorschlag gewinnt?`, best[0], [], '', {
        options: v.o.slice(),
        qid: 'gmvwin_' + VOTES.indexOf(v),
        why: `${best[0]} hat ${best[1]} Stimmen, mehr als jeder andere Vorschlag.`,
        pic,
      });
    const [label, c] = pick(rows);
    const all = n[0] + n[1] + n[2];
    if (r < 0.75)
      return choice(
        mod,
        'mehrheit',
        `${v.q} Wie viele Kinder haben für „${label}“ gestimmt?`,
        String(c),
        shuffle([c - 1, c + 1, c + 5].filter((x) => x > 0)).map(String),
        'gmvcnt_' + VOTES.indexOf(v),
        { why: `Ein Bündel sind 5 Striche. Bei „${label}“ stehen ${c} Striche.`, pic, cols: 2 },
      );
    return choice(
      mod,
      'mehrheit',
      `${v.q} Wie viele Kinder haben insgesamt abgestimmt?`,
      String(all),
      shuffle([all - 1, all + 1, all + 10]).map(String),
      'gmvall_' + VOTES.indexOf(v),
      { why: `${n[0]} + ${n[1]} + ${n[2]} = ${all}`, pic, cols: 2 },
    );
  }

  /* ---------- the Gemeinde: where you go for what ---------- */
  const PLACES = [
    'Bücherei',
    'Feuerwehr',
    'Rathaus',
    'Spielplatz',
    'Schwimmbad',
    'Wasserwerk',
    'Kläranlage',
    'Fundbüro',
    'Wertstoffhof',
  ];
  const NEEDS: { q: string; a: string; skip?: string[] }[] = [
    { q: 'Du willst dir ein Buch über Dinosaurier ausleihen. Wohin gehst du?', a: 'Bücherei' },
    { q: 'In der Nachbarschaft brennt eine Scheune. Wer hilft?', a: 'Feuerwehr' },
    { q: 'Familie Yilmaz ist neu in den Ort gezogen. Wo meldet sie sich an?', a: 'Rathaus' },
    { q: 'Die Kinder aus der Siedlung wollen schaukeln und rutschen. Wohin gehen sie?', a: 'Spielplatz' },
    { q: 'Du willst im Winter schwimmen üben. Wohin gehst du?', a: 'Schwimmbad' },
    { q: 'Woher kommt das saubere Trinkwasser, das durch die Leitungen in die Häuser fließt?', a: 'Wasserwerk' },
    { q: 'Wo wird das schmutzige Wasser aus Toilette und Spüle gereinigt?', a: 'Kläranlage' },
    { q: 'Du hast auf dem Gehweg eine Geldbörse gefunden. Wo gibst du sie ab?', a: 'Fundbüro', skip: ['Rathaus'] },
    { q: 'Eure kaputte Lampe und ein alter Schrank sollen weg. Wohin bringt ihr sie?', a: 'Wertstoffhof' },
    { q: 'Nach einem Unwetter steht der Keller unter Wasser. Wer hilft?', a: 'Feuerwehr' },
    { q: 'Du suchst ein Hörbuch und eine Kinderzeitschrift zum Ausleihen. Wohin gehst du?', a: 'Bücherei' },
    { q: 'Wo arbeiten die Bürgermeisterin und die Verwaltung der Gemeinde?', a: 'Rathaus' },
  ];

  /* ---------- who decides: the class, the Gemeinde, the state or Germany as a whole ---------- */
  const LEVELS = ['Die Klasse', 'Die Gemeinde oder Stadt', 'Das Bundesland', 'Der Bund für ganz Deutschland'];
  // each one is decided at the same level in every state
  const DECIDE: { q: string; l: number }[] = [
    { q: 'Wer diese Woche die Pflanzen im Klassenzimmer gießt.', l: 0 },
    { q: 'Welche Gesprächsregeln im Klassenrat gelten.', l: 0 },
    { q: 'Wie das Klassentier aus Stoff heißen soll.', l: 0 },
    { q: 'Ob im Ort ein neuer Spielplatz gebaut wird.', l: 1 },
    { q: 'Wie eine neue Straße im Ort heißen soll.', l: 1 },
    { q: 'Ob die Feuerwehr im Ort ein neues Löschfahrzeug bekommt.', l: 1 },
    { q: 'Wann die Stadtbücherei geöffnet hat.', l: 1 },
    { q: 'Wann in deiner Schule die Sommerferien beginnen.', l: 2 },
    { q: 'Was in Klasse 3 im Fach Mathe gelernt wird.', l: 2 },
    { q: 'Welche Lehrerinnen und Lehrer eingestellt werden.', l: 2 },
    { q: 'Welche Verkehrsregeln überall in Deutschland gelten.', l: 3 },
    { q: 'Wo eine neue Autobahn gebaut wird.', l: 3 },
    { q: 'Wie viel Kindergeld Familien bekommen.', l: 3 },
  ];

  /* ---------- things in order ---------- */
  const item = (pre: string) => (text: string, i: number) => ({ id: pre + (i + 1), text });
  const RAT = [
    'Die Leitung eröffnet den Klassenrat.',
    'Das Protokoll vom letzten Mal wird vorgelesen.',
    'Ein Kind liest ein neues Anliegen vor.',
    'Alle sammeln Vorschläge, wie man es lösen kann.',
    'Die Klasse stimmt über einen Vorschlag ab.',
    'Der Beschluss wird ins Protokoll geschrieben.',
  ].map(item('kr'));
  const SPRECHER = [
    'Kinder sagen, wer Klassensprecherin oder Klassensprecher werden möchte.',
    'Die Kandidaten erzählen, was sie für die Klasse tun wollen.',
    'Jedes Kind schreibt geheim einen Namen auf einen Zettel.',
    'Zwei Kinder zählen die Stimmen aus.',
    'Das Ergebnis wird der Klasse gesagt.',
  ].map(item('ks'));
  const WAHL = [
    'Mit der Post kommt die Wahlbenachrichtigung.',
    'Im Wahllokal bekommt man einen Stimmzettel.',
    'In der Wahlkabine kreuzt man allein und geheim an.',
    'Man faltet den Stimmzettel und wirft ihn in die Wahlurne.',
    'Nach der Wahl werden die Stimmen ausgezählt.',
  ].map(item('kw'));
  const WASSER = [
    'Das Wasserwerk holt Wasser aus der Erde oder aus einem See und reinigt es.',
    'Das Trinkwasser fließt durch Rohre unter der Straße zu den Häusern.',
    'Aus dem Wasserhahn kommt sauberes Trinkwasser.',
    'Das schmutzige Wasser fließt durch den Abfluss in den Kanal.',
    'In der Kläranlage wird das Abwasser gereinigt.',
    'Das gereinigte Wasser fließt in einen Bach oder Fluss.',
  ].map(item('kx'));

  /* ---------- Notizkarten ---------- */
  const NOTES = {
    konvention: {
      title: 'Die Kinderrechtskonvention',
      lines: [
        'Am 20. November 1989 haben die Vereinten Nationen (UN) die Kinderrechtskonvention beschlossen.',
        'Sie hat 54 Artikel. Fast alle Länder der Welt haben versprochen, sich daran zu halten, auch Deutschland.',
        'Als Kind gilt jeder Mensch unter 18 Jahren.',
        'Jedes Kind hat diese Rechte, von Geburt an und egal, wo es lebt. Man muss sie sich nicht verdienen.',
        'Der 20. November ist der Internationale Tag der Kinderrechte.',
      ],
    },
    rechte: {
      title: 'Wichtige Kinderrechte',
      lines: [
        'Gleichheit: Kein Kind darf benachteiligt werden, egal woher es kommt, welche Sprache es spricht oder woran es glaubt.',
        'Gesundheit: Ärztliche Hilfe, genug zu essen und sauberes Wasser.',
        'Bildung: Jedes Kind darf zur Schule gehen.',
        'Freizeit, Spiel und Erholung: Zeit für Freunde, Pausen und Ruhe.',
        'Gehört werden: Kinder dürfen ihre Meinung sagen, wenn es um sie geht. Erwachsene hören sie an.',
        'Schutz vor Gewalt: Niemand darf ein Kind schlagen oder quälen, auch nicht die Eltern.',
        'Privatsphäre: Briefe, Tagebuch und Nachrichten eines Kindes liest niemand einfach so.',
        'Dazu kommen das Recht auf einen Namen, auf Familie, auf Information und auf besondere Hilfe bei einer Behinderung.',
      ],
    },
    gruppen: {
      title: 'Schützen, fördern, beteiligen',
      lines: [
        'Die Kinderrechte werden oft in drei Gruppen geteilt.',
        'Schutzrechte: Schutz vor Gewalt, vor Kinderarbeit und im Krieg.',
        'Förderrechte: alles, was ein Kind zum Leben und Lernen braucht, zum Beispiel Gesundheit, Bildung und einen Namen.',
        'Beteiligungsrechte: Kinder dürfen ihre Meinung sagen, mitreden und sich informieren.',
      ],
    },
    hilfe: {
      title: 'Hilfe holen',
      lines: [
        'Wenn dir jemand wehtut oder Angst macht, erzähl es einem Erwachsenen, dem du vertraust.',
        'Hilfe holen ist kein Petzen. Ein Geheimnis, das dir Angst macht, darfst du erzählen.',
        'Bei der Nummer gegen Kummer hört dir jemand zu: 116 111. Der Anruf kostet nichts, und du musst deinen Namen nicht sagen.',
        'Im Notfall rufst du die 110 (Polizei) oder die 112 (Feuerwehr und Rettungsdienst).',
      ],
    },
    regeln: {
      title: 'Regeln in der Klasse',
      lines: [
        'Regeln helfen, damit alle gut zusammen lernen können.',
        'Die Klasse stellt ihre Regeln am besten gemeinsam auf. Sie gelten für alle.',
        'Gute Regeln sagen, was man tun soll: „Wir lassen andere ausreden.“',
        'Zu Rechten gehören Pflichten: Wer seine Meinung sagen darf, hört auch den anderen zu.',
        'Passt eine Regel nicht mehr, kann die Klasse sie gemeinsam ändern.',
      ],
    },
    streit: {
      title: 'Streit fair lösen',
      lines: [
        'Erst beruhigen sich alle. Dann erzählt jeder, was passiert ist, und der andere hört zu.',
        'Ich-Botschaften helfen: „Ich bin traurig, weil …“ statt „Du bist gemein!“',
        'Gemeinsam sucht ihr eine Lösung, mit der beide leben können.',
        'Keine Schimpfwörter, keine Gewalt, auch wenn man recht hat.',
        'Streitschlichter entscheiden nicht, wer schuld ist. Sie helfen, selbst eine Lösung zu finden.',
      ],
    },
    klassenrat: {
      title: 'Der Klassenrat',
      lines: [
        'Im Klassenrat trifft sich die Klasse regelmäßig und bespricht, was alle betrifft.',
        'Anliegen sammelt ihr vorher, zum Beispiel in einem Briefkasten oder an einer Wand.',
        'Kinder übernehmen die Ämter: Leitung, Protokoll, Zeitwächter und Regelwächter. Sie wechseln sich ab.',
        'Ablauf: eröffnen, das letzte Protokoll vorlesen, Anliegen besprechen, Vorschläge sammeln, beschließen.',
        'Im Protokoll steht, was die Klasse beschlossen hat.',
      ],
    },
    sprecher: {
      title: 'Klassensprecherin und Klassensprecher',
      lines: [
        'Die Klasse wählt ihre Klassensprecherin oder ihren Klassensprecher.',
        'Vor der Wahl sagen die Kandidaten, was sie für die Klasse tun wollen.',
        'Gewählt wird geheim: Jedes Kind schreibt einen Namen auf einen Zettel. So kann jedes Kind frei wählen.',
        'Die Klassensprecherin trägt die Wünsche der Klasse weiter. Bestimmen darf sie nicht mehr als die anderen.',
      ],
    },
    mehrheit: {
      title: 'Abstimmen',
      lines: [
        'Bei einer Abstimmung hat jedes Kind eine Stimme. Jede Stimme zählt gleich viel.',
        'Mehrheit heißt: mehr als die Hälfte. Stehen mehrere Vorschläge zur Wahl, gewinnt oft der mit den meisten Stimmen.',
        'Vor dem Abstimmen bespricht man die Vorschläge, damit sich jeder eine Meinung bilden kann.',
        'In der Strichliste ist jedes Bündel aus fünf Strichen fünf Stimmen.',
        'Steht es unentschieden, berät die Klasse noch einmal und stimmt neu ab.',
      ],
      fig: tallySVG([
        ['Zoo', 8],
        ['Museum', 4],
      ]),
    },
    fair: {
      title: 'Fair entscheiden',
      lines: [
        'Kompromiss: Beide Seiten geben etwas nach und finden eine gemeinsame Lösung.',
        'Minderheit: die kleinere Gruppe. Auch ihre Meinung wird angehört.',
        'Über die Rechte eines Kindes darf die Mehrheit nicht abstimmen. Niemand wird ausgeschlossen.',
        'Wer verliert, hält sich an den Beschluss und darf beim nächsten Mal wieder seine Meinung sagen.',
      ],
    },
    aufgaben: {
      title: 'Was die Gemeinde für alle tut',
      lines: [
        'Eine Gemeinde kann ein Dorf sein, eine Stadt oder mehrere Dörfer zusammen.',
        'Die Gemeinde sorgt für die Feuerwehr. In vielen Orten arbeiten die Feuerwehrleute freiwillig neben ihrem Beruf.',
        'Sie kümmert sich um Spielplätze, Straßen im Ort und meist um das Haus der Grundschule. Die Lehrerinnen und Lehrer bezahlt das Bundesland.',
        'Sauberes Trinkwasser kommt vom Wasserwerk, das Abwasser wird in der Kläranlage gereinigt.',
        'Viele Gemeinden haben eine Bücherei und ein Schwimmbad. Im Rathaus meldet man sich an, wenn man neu in den Ort zieht.',
        'Um die Müllabfuhr kümmern sich Gemeinden, Städte oder Landkreise.',
      ],
    },
    geld: {
      title: 'Wer bezahlt das?',
      lines: [
        'Die Gemeinde bekommt Geld aus Steuern, die die Menschen und Firmen zahlen.',
        'Für manche Leistungen zahlen die Familien Gebühren, zum Beispiel für die Müllabfuhr.',
        'Das Geld reicht nie für alles. Darum muss die Gemeinde entscheiden, was am wichtigsten ist.',
        'Bänke, Spielplätze und Bücher der Bücherei gehören allen. Darum gehen alle sorgsam damit um.',
      ],
    },
    rat: {
      title: 'Wer entscheidet in der Gemeinde?',
      lines: [
        'Die Menschen in der Gemeinde wählen eine Vertretung, die gemeinsam entscheidet. Meist heißt sie Gemeinderat oder Stadtrat.',
        'An der Spitze der Gemeinde steht die Bürgermeisterin oder der Bürgermeister.',
        'Im Rathaus arbeitet die Verwaltung. Sie setzt um, was beschlossen wurde.',
        'Kinder dürfen noch nicht wählen. Sie können aber ihre Wünsche sagen, zum Beispiel in einem Brief an die Bürgermeisterin.',
      ],
    },
    wahl: {
      title: 'Wählen',
      lines: [
        'Demokratie heißt: Die Menschen bestimmen gemeinsam, wer regiert und was gilt. Das Wort kommt aus dem Griechischen.',
        'Geheim: Niemand sieht, wen du ankreuzt.',
        'Gleich: Jede Stimme zählt gleich viel.',
        'Frei: Niemand darf dich zwingen, jemanden zu wählen.',
        'Ablauf: Wahlbenachrichtigung, Stimmzettel im Wahllokal, ankreuzen in der Wahlkabine, in die Wahlurne werfen, auszählen.',
      ],
    },
    land: {
      title: 'Gemeinde, Land und Bund',
      lines: [
        'Deutschland hat 16 Bundesländer. Die Hauptstadt ist Berlin.',
        'Die Flagge von Deutschland ist schwarz, rot und gold.',
        'Das Bundesland bestimmt zum Beispiel die Schulferien, die Lehrpläne und welche Lehrerinnen und Lehrer eingestellt werden.',
        'Der Bund ist für ganz Deutschland da: Verkehrsregeln, Autobahnen, Kindergeld.',
        'Die Gesetze für ganz Deutschland beschließt der Bundestag in Berlin.',
      ],
    },
  };

  /* ---------- fixed questions: rows only ever grow at the end of a block, the place of a row is its id ---------- */
  type Row = [q: string, a: string[] | boolean, why?: string];
  const P = (pre: string, mod: string, g: string, rows: Row[]): Question[] =>
    rows.map(([q, a, why], i) =>
      Object.assign(
        { id: pre + (i + 1), mod, g, q },
        Array.isArray(a) ? { o: a, a: 0 } : { rf: true, a },
        why ? { why } : {},
      ),
    );
  const POOL: Question[] = [
    ...P('gmre', 'rechte', 'konvention', [
      [
        'Wie heißt der Vertrag, in dem die Rechte aller Kinder stehen?',
        ['UN-Kinderrechtskonvention', 'Schulordnung', 'Straßenverkehrsordnung'],
        'UN steht für die Vereinten Nationen. Dort arbeiten fast alle Länder der Welt zusammen.',
      ],
      [
        'Für wen gelten die Kinderrechte?',
        ['Für alle Kinder unter 18 Jahren', 'Nur für Kinder in Deutschland', 'Nur für Kinder mit guten Noten'],
        'Als Kind gilt jeder Mensch unter 18 Jahren, egal wo er lebt.',
      ],
      ['Fast alle Länder der Welt haben versprochen, die Kinderrechte einzuhalten.', true],
      [
        'Kinderrechte muss man sich erst verdienen, zum Beispiel mit guten Noten.',
        false,
        'Jedes Kind hat diese Rechte von Geburt an. Niemand kann sie ihm wegnehmen.',
      ],
      [
        'An welchem Tag ist der Internationale Tag der Kinderrechte?',
        ['Am 20. November', 'Am 24. Dezember', 'Am 1. Mai'],
        'Am 20. November 1989 haben die Vereinten Nationen die Kinderrechtskonvention beschlossen.',
      ],
      [
        'Wie viele Artikel hat die UN-Kinderrechtskonvention?',
        ['54', '10', '100'],
        'In 54 Artikeln steht, welche Rechte Kinder haben und was die Länder dafür tun müssen.',
      ],
    ]),
    ...P('gmrk', 'rechte', 'rechte', [
      [
        'Kein Kind darf wegen seiner Herkunft, Sprache oder Religion benachteiligt werden. Wie heißt dieses Recht?',
        ['Recht auf Gleichheit', 'Recht auf Freizeit', 'Recht auf einen Namen'],
      ],
      [
        'Was gehört zum Recht auf Gesundheit?',
        ['Ärztliche Hilfe, wenn man krank ist', 'Jeden Tag Süßigkeiten', 'Ein eigenes Handy'],
      ],
      [
        'Eltern dürfen ihr Kind schlagen, wenn es nicht hört.',
        false,
        'Kinder haben ein Recht auf Erziehung ohne Gewalt. Das steht auch im deutschen Gesetz.',
      ],
      [
        'Was bedeutet das Recht auf Privatsphäre?',
        [
          'Andere dürfen deine Briefe und Nachrichten nicht einfach lesen',
          'Du musst nie dein Zimmer aufräumen',
          'Du darfst alles allein entscheiden',
        ],
      ],
      [
        'Was bedeutet das Recht, gehört zu werden?',
        [
          'Erwachsene fragen Kinder, wenn es um sie geht, und hören ihnen zu',
          'Kinder dürfen immer alles bestimmen',
          'Kinder müssen immer still sein',
        ],
        'Kinder dürfen ihre Meinung sagen. Oft entscheiden trotzdem die Erwachsenen, aber sie hören die Kinder vorher an.',
      ],
      ['Zu den Kinderrechten gehört auch das Recht auf Freizeit, Spiel und Erholung.', true],
      [
        'Warum haben Kinder eigene Rechte?',
        [
          'Kinder brauchen besonderen Schutz und Förderung',
          'Kinder sind mehr wert als Erwachsene',
          'Kinder haben keine Pflichten',
        ],
      ],
      [
        'Lena sitzt im Rollstuhl. Was steht ihr nach den Kinderrechten zu?',
        [
          'Besondere Hilfe, damit sie mit allen lernen und leben kann',
          'Nichts, weil sie anders ist',
          'Sie muss zu Hause bleiben',
        ],
      ],
    ]),
    ...P('gmrg', 'rechte', 'gruppen', [
      ['Welches Recht ist ein Schutzrecht?', ['Schutz vor Gewalt', 'Recht auf Bildung', 'Recht, gehört zu werden']],
      [
        'Welches Recht ist ein Beteiligungsrecht?',
        ['Recht, seine Meinung zu sagen', 'Recht auf Gesundheit', 'Schutz vor Kinderarbeit'],
      ],
      ['Welches Recht ist ein Förderrecht?', ['Recht auf Bildung', 'Schutz im Krieg', 'Recht auf Information']],
    ]),
    ...P('gmrh', 'rechte', 'hilfe', [
      [
        'Ein Kind hat Kummer und möchte mit jemandem reden. Welche Nummer kann es anrufen?',
        ['116 111', '111 116', '161 161'],
        'Bei der Nummer gegen Kummer hört dir jemand zu. Der Anruf kostet nichts, und du musst deinen Namen nicht sagen.',
      ],
      [
        'Jemand tut dir weh oder macht dir Angst. Was ist richtig?',
        ['Ich erzähle es einem Erwachsenen, dem ich vertraue', 'Ich behalte es für mich', 'Ich warte, bis es aufhört'],
      ],
      [
        'Wenn ein Kind von einem Geheimnis erzählt, das ihm Angst macht, ist das Petzen.',
        false,
        'Hilfe holen ist kein Petzen. Ein Geheimnis, das dir Angst macht oder wehtut, darfst du erzählen.',
      ],
    ]),
    ...P('gmrl', 'regeln', 'regeln', [
      [
        'Warum gibt es Regeln in der Klasse?',
        [
          'Damit alle gut zusammen lernen können',
          'Damit die Lehrerin weniger Arbeit hat',
          'Damit man jemanden bestrafen kann',
        ],
      ],
      [
        'Wer stellt die Klassenregeln am besten auf?',
        ['Alle in der Klasse gemeinsam', 'Nur das stärkste Kind', 'Nur die Eltern'],
      ],
      ['Eine Klassenregel gilt für alle in der Klasse, auch für die Klassensprecherin.', true],
      [
        'Welche Regel ist gut formuliert?',
        ['Wir lassen andere ausreden.', 'Nicht so laut, sonst passiert was!', 'Ole darf nie mitreden.'],
        'Eine gute Regel sagt, was man tun soll, und gilt für alle.',
      ],
      [
        'Du hast das Recht, deine Meinung zu sagen. Welche Pflicht gehört dazu?',
        ['Den anderen auch zuhören', 'Immer als Erstes reden', 'Nie eine Meinung haben'],
      ],
      [
        'Was ist eine Pflicht in der Klasse?',
        [
          'Den Klassendienst erledigen, wenn man dran ist',
          'In der Pause Süßigkeiten essen',
          'Jeden Tag ein neues Mäppchen mitbringen',
        ],
      ],
      ['Eine Regel, die nicht mehr passt, darf die Klasse gemeinsam ändern.', true],
      [
        'Eine Regel wird immer wieder gebrochen. Was hilft?',
        ['Im Klassenrat darüber sprechen', 'Die Regel heimlich abreißen', 'Nichts sagen und sich ärgern'],
      ],
      [
        'Was gehört zu den Gesprächsregeln?',
        [
          'Sich melden und warten, bis man dran ist',
          'Dazwischenrufen, wenn man es besser weiß',
          'Mit dem Nachbarn reden, während jemand spricht',
        ],
      ],
      [
        'Meine Freiheit hört dort auf, wo …',
        ['… die Freiheit der anderen anfängt.', '… mir langweilig wird.', '… die Pause anfängt.'],
      ],
    ]),
    ...P('gmst', 'regeln', 'streit', [
      [
        'Zwei Kinder streiten. Was ist der erste Schritt zu einer Lösung?',
        ['Beide beruhigen sich und hören einander zu', 'Beide schreien lauter', 'Einer gibt immer nach'],
      ],
      [
        'Welcher Satz ist eine Ich-Botschaft?',
        [
          '„Ich bin traurig, weil du mich nicht mitmachen lässt.“',
          '„Du bist gemein!“',
          '„Du machst immer alles falsch!“',
        ],
        'Eine Ich-Botschaft sagt, wie es dir geht, ohne den anderen zu beschimpfen.',
      ],
      [
        'Was macht eine Streitschlichterin?',
        [
          'Sie hilft zwei Kindern, selbst eine Lösung zu finden',
          'Sie entscheidet, wer schuld ist',
          'Sie bestraft beide Kinder',
        ],
      ],
      [
        'Bei einem Streit darf man den anderen beleidigen, wenn man recht hat.',
        false,
        'Auch wer recht hat, bleibt fair: keine Schimpfwörter, keine Gewalt.',
      ],
      [
        'Ben hat Ole aus Versehen umgerannt. Was ist fair?',
        ['Ben entschuldigt sich und hilft Ole auf', 'Ben rennt schnell weg', 'Ben lacht darüber'],
      ],
      ['Nach einem Streit kann man vereinbaren, wie es beim nächsten Mal besser klappt.', true],
    ]),
    ...P('gmkr', 'klassenrat', 'klassenrat', [
      [
        'Was ist der Klassenrat?',
        [
          'Eine regelmäßige Runde, in der die Klasse ihre Anliegen bespricht',
          'Eine Strafe für laute Kinder',
          'Ein Treffen nur der Lehrerinnen und Lehrer',
        ],
      ],
      [
        'Wer leitet den Klassenrat meistens?',
        ['Ein Kind aus der Klasse, jedes Mal ein anderes', 'Immer die Schulleiterin', 'Immer der Hausmeister'],
      ],
      [
        'Wo sammelt die Klasse ihre Anliegen für den Klassenrat?',
        ['In einem Briefkasten oder an einer Wand', 'Im Mülleimer', 'Im Lehrerzimmer'],
      ],
      [
        'Was schreibt das Kind auf, das das Protokoll führt?',
        ['Was die Klasse beschlossen hat', 'Wer am lautesten war', 'Was es zu Mittag gegessen hat'],
      ],
      [
        'Was macht der Zeitwächter im Klassenrat?',
        ['Er achtet darauf, dass die Zeit reicht', 'Er stellt alle Uhren der Schule', 'Er entscheidet, wer recht hat'],
      ],
      ['Im Klassenrat darf man auch sagen, was gut geklappt hat, und andere loben.', true],
      [
        'Im Klassenrat beschließt die Lehrerin alles allein.',
        false,
        'Im Klassenrat beraten und entscheiden die Kinder gemeinsam. Die Lehrerin oder der Lehrer hilft, wenn es nötig ist.',
      ],
      [
        'Welches Anliegen passt in den Klassenrat?',
        [
          'Die Großen nehmen uns in der Pause immer den Ball weg.',
          'Mein Bruder ärgert mich zu Hause.',
          'Ich habe zum Geburtstag ein Fahrrad bekommen.',
        ],
        'In den Klassenrat gehört, was die Klasse gemeinsam lösen kann.',
      ],
      [
        'Warum liest man am Anfang das Protokoll vom letzten Mal vor?',
        ['Um zu prüfen, ob die Beschlüsse geklappt haben', 'Um die Zeit zu füllen', 'Damit niemand mehr etwas sagt'],
      ],
    ]),
    ...P('gmks', 'klassenrat', 'sprecher', [
      [
        'Was macht eine Klassensprecherin?',
        [
          'Sie trägt die Wünsche der Klasse weiter',
          'Sie bestimmt, was die Klasse macht',
          'Sie passt auf, dass niemand redet',
        ],
      ],
      [
        'Wie wird der Klassensprecher bestimmt?',
        ['Die Klasse wählt ihn', 'Das größte Kind wird es', 'Wer zuerst ruft, wird es'],
      ],
      [
        'Warum schreibt jedes Kind den Namen geheim auf einen Zettel?',
        [
          'Damit jedes Kind frei wählen kann, ohne Druck',
          'Weil Zettel billig sind',
          'Damit das Auszählen länger dauert',
        ],
      ],
      [
        'Wer Klassensprecher ist, darf mehr bestimmen als die anderen Kinder.',
        false,
        'Der Klassensprecher spricht für die Klasse. Bei Abstimmungen hat er eine Stimme wie alle anderen.',
      ],
      [
        'Was ist eine gute Eigenschaft für eine Klassensprecherin?',
        ['Sie hört allen zu, auch denen, die sie nicht so mag', 'Sie ist die Stärkste', 'Sie hat die neuesten Schuhe'],
      ],
      [
        'Was sagt ein Kandidat vor der Wahl am besten?',
        [
          'Was er für die Klasse tun will',
          'Dass die anderen Kandidaten doof sind',
          'Dass er allen Süßigkeiten schenkt',
        ],
      ],
      ['Bei einer geheimen Wahl muss niemand sagen, wen er gewählt hat.', true],
    ]),
    ...P('gmab', 'abstimmen', 'mehrheit', [
      [
        'Bei einer Abstimmung mit drei Vorschlägen gewinnt oft der Vorschlag mit …',
        ['… den meisten Stimmen.', '… dem lautesten Kind.', '… dem längsten Namen.'],
      ],
      [
        '14 Kinder wollen in den Zoo, 10 Kinder ins Museum. Wohin geht der Ausflug?',
        ['In den Zoo', 'Ins Museum', 'Nirgendwohin'],
        '14 Stimmen sind mehr als 10 Stimmen.',
      ],
      [
        'Bei der Abstimmung steht es 12 zu 12. Was kann die Klasse tun?',
        [
          'Noch einmal beraten und neu abstimmen',
          'Das lauteste Kind entscheidet',
          'Die Stimme des größten Kindes zählt doppelt',
        ],
      ],
      ['Bei einer fairen Abstimmung zählt jede Stimme gleich viel.', true],
      [
        'In der Klasse sind 24 Kinder. Wie viele Stimmen sind mehr als die Hälfte?',
        ['Mindestens 13', 'Genau 12', 'Mindestens 20'],
        '12 ist genau die Hälfte von 24. Mehr als die Hälfte sind 13 Stimmen oder mehr.',
      ],
      [
        'Wozu stimmt man ab?',
        ['Damit eine Gruppe gemeinsam entscheiden kann', 'Damit einer allein bestimmt', 'Damit es länger dauert'],
      ],
      [
        'Warum bespricht man die Vorschläge, bevor man abstimmt?',
        ['Damit sich jeder eine Meinung bilden kann', 'Damit die Abstimmung ausfällt', 'Weil Abstimmen verboten ist'],
      ],
      [
        '7 Kinder wollen Pizza, 9 Kinder Nudeln und 8 Kinder Pfannkuchen. Was gewinnt?',
        ['Nudeln', 'Pfannkuchen', 'Pizza'],
        '9 ist die größte Zahl.',
      ],
      [
        'Wer die meisten Freunde in der Klasse hat, darf zweimal abstimmen.',
        false,
        'Jedes Kind hat genau eine Stimme.',
      ],
    ]),
    ...P('gmfa', 'abstimmen', 'fair', [
      [
        'Was ist ein Kompromiss?',
        [
          'Beide Seiten geben etwas nach und finden eine gemeinsame Lösung',
          'Einer bekommt alles',
          'Man hört auf, miteinander zu reden',
        ],
      ],
      [
        'Die halbe Klasse will im Sportunterricht Fußball, die andere Hälfte Völkerball. Was ist ein Kompromiss?',
        ['Diesmal Fußball, nächstes Mal Völkerball', 'Immer nur Fußball', 'Gar kein Sport mehr'],
      ],
      [
        'Die Mehrheit will, dass ein Kind beim Ausflug nicht mitdarf. Ist das in Ordnung?',
        [
          'Nein, über die Rechte eines Kindes darf die Mehrheit nicht abstimmen',
          'Ja, die Mehrheit hat immer recht',
          'Ja, wenn das Kind leise ist',
        ],
        'Abstimmen ist gut für gemeinsame Pläne. Niemanden auszuschließen, gehört zu den Rechten jedes Kindes.',
      ],
      ['Wer bei einer Abstimmung verliert, hält sich trotzdem an den Beschluss.', true],
      [
        'Du hast bei der Abstimmung verloren. Was ist fair?',
        [
          'Ich mache mit und sage beim nächsten Mal wieder meine Meinung',
          'Ich mache einfach nicht mit',
          'Ich schimpfe auf die anderen',
        ],
      ],
      [
        'Was ist eine Minderheit?',
        [
          'Die kleinere Gruppe bei einer Abstimmung',
          'Die jüngsten Kinder der Schule',
          'Die Kinder, die zu spät kommen',
        ],
      ],
      ['Auch die Meinung der Minderheit soll angehört werden.', true],
    ]),
    ...P('gmge', 'gemeinde', 'aufgaben', [
      [
        'Was ist eine Gemeinde?',
        ['Ein Dorf oder eine Stadt mit allen, die dort wohnen', 'Ein Raum in der Schule', 'Ein Verein für Sport'],
      ],
      [
        'Wer baut und pflegt die öffentlichen Spielplätze im Ort?',
        ['Die Gemeinde oder Stadt', 'Die Polizei', 'Die Kinder selbst'],
      ],
      [
        'Wer muss dafür sorgen, dass es im Ort eine Feuerwehr gibt?',
        ['Die Gemeinde oder Stadt', 'Jede Familie selbst', 'Die Schule'],
      ],
      ['In vielen Orten arbeiten die Feuerwehrleute freiwillig neben ihrem Beruf.', true],
      [
        'Das Haus der Grundschule gehört meist der Gemeinde. Wer bezahlt die Lehrerinnen und Lehrer?',
        ['Das Bundesland', 'Die Kinder', 'Der Hausmeister'],
      ],
      [
        'Was findest du in der Bücherei?',
        ['Bücher, Hörbücher und Zeitschriften zum Ausleihen', 'Brot und Brötchen', 'Fahrkarten für den Zug'],
      ],
      [
        'Wozu braucht ein Ort eine Kläranlage?',
        ['Sie reinigt das Abwasser', 'Sie macht das Wasser warm', 'Sie füllt Wasser in Flaschen'],
      ],
      [
        'Was erledigt man im Rathaus oder im Bürgerbüro?',
        ['Sich anmelden, wenn man neu in den Ort zieht', 'Ein Auto reparieren lassen', 'Zum Zahnarzt gehen'],
      ],
      ['Einen kaputten Spielplatz kann man der Gemeinde melden.', true],
      [
        'Woher kommt das Trinkwasser aus dem Wasserhahn?',
        ['Aus dem Wasserwerk, durch Leitungen', 'Aus der Regenrinne', 'Aus der Kläranlage'],
      ],
      ['Wer bringt den Müll aus den Mülltonnen weg?', ['Die Müllabfuhr', 'Die Feuerwehr', 'Die Post']],
      [
        'Was bedeutet „öffentlich“, zum Beispiel bei einem öffentlichen Spielplatz?',
        ['Alle dürfen ihn benutzen', 'Nur die Nachbarn dürfen ihn benutzen', 'Man muss Eintritt zahlen'],
      ],
      ['Eine Gemeinde kann ein Dorf sein, eine Stadt oder mehrere Dörfer zusammen.', true],
    ]),
    ...P('gmgd', 'gemeinde', 'geld', [
      [
        'Woher bekommt die Gemeinde Geld für Schwimmbad, Bücherei und Spielplätze?',
        [
          'Aus Steuern und Gebühren, die Menschen und Firmen zahlen',
          'Sie druckt eigenes Geld',
          'Aus dem Sparschwein der Bürgermeisterin',
        ],
      ],
      [
        'Was ist eine Gebühr?',
        [
          'Geld, das man für eine bestimmte Leistung zahlt, zum Beispiel für die Müllabfuhr',
          'Ein Geschenk der Gemeinde',
          'Eine Strafe für Kinder',
        ],
      ],
      [
        'Die Gemeinde hat so viel Geld, dass sie alle Wünsche erfüllen kann.',
        false,
        'Das Geld reicht nie für alles. Darum muss die Gemeinde entscheiden, was am wichtigsten ist.',
      ],
      [
        'Wie gehen alle mit Bänken, Spielplätzen und Büchern der Bücherei um?',
        ['Sorgsam, denn sie gehören allen', 'Egal, die Gemeinde kauft neue', 'Man darf sie mit nach Hause nehmen'],
      ],
    ]),
    ...P('gmra', 'rathaus', 'rat', [
      [
        'Wer steht an der Spitze einer Gemeinde?',
        ['Die Bürgermeisterin oder der Bürgermeister', 'Die Schulleiterin', 'Der Hausmeister des Rathauses'],
      ],
      ['Wie heißt das Haus, in dem die Gemeinde verwaltet wird?', ['Rathaus', 'Zollhaus', 'Gerichtshaus']],
      [
        'Wer entscheidet gemeinsam über wichtige Dinge im Ort, zum Beispiel über ein neues Schwimmbad?',
        [
          'Die gewählte Vertretung, zum Beispiel der Gemeinderat',
          'Die Kinder der ersten Klasse',
          'Die Geschäfte im Ort',
        ],
      ],
      ['Die Mitglieder des Gemeinderats oder Stadtrats werden von den Menschen im Ort gewählt.', true],
      [
        'Die Bürgermeisterin kann ganz allein bestimmen, was im Ort gebaut wird.',
        false,
        'Über wichtige Dinge beschließt der gewählte Rat. Die Bürgermeisterin sorgt mit der Verwaltung dafür, dass es umgesetzt wird.',
      ],
      [
        'Wie können Kinder in der Gemeinde ihre Wünsche sagen?',
        [
          'Sie schreiben der Bürgermeisterin einen Brief',
          'Sie wählen den Gemeinderat',
          'Gar nicht, Kinder haben keine Meinung',
        ],
        'Kinder dürfen noch nicht wählen. Aber sie dürfen ihre Meinung sagen, und Erwachsene sollen sie anhören.',
      ],
    ]),
    ...P('gmwa', 'rathaus', 'wahl', [
      [
        'Was bedeutet „geheim wählen“?',
        ['Niemand sieht, wen du ankreuzt', 'Man wählt nachts', 'Niemand weiß, dass Wahl ist'],
      ],
      [
        'Was bedeutet „gleich wählen“?',
        ['Jede Stimme zählt gleich viel', 'Alle müssen dasselbe wählen', 'Alle wählen zur gleichen Uhrzeit'],
      ],
      [
        'Was bedeutet „frei wählen“?',
        ['Niemand darf dich zwingen, jemanden zu wählen', 'Die Wahl kostet nichts', 'Man wählt draußen im Freien'],
      ],
      ['Kinder in deinem Alter dürfen bei den Wahlen in Deutschland noch nicht wählen.', true],
      ['Wohin wirft man den Stimmzettel?', ['In die Wahlurne', 'In den Briefkasten der Schule', 'In den Papierkorb']],
      [
        'Was heißt Demokratie?',
        [
          'Die Menschen bestimmen gemeinsam, wer regiert und was gilt',
          'Ein König bestimmt alles',
          'Die Stärksten bestimmen',
        ],
        'Das Wort kommt aus dem Griechischen und heißt Herrschaft des Volkes.',
      ],
      [
        'Bei einer Wahl darf jeder so oft abstimmen, wie er will.',
        false,
        'Bei einer Wahl hat jeder gleich viele Stimmen, keiner mehr als die anderen.',
      ],
    ]),
    ...P('gmla', 'rathaus', 'land', [
      ['Wie viele Bundesländer hat Deutschland?', ['16', '12', '20']],
      [
        'Wie heißt die Hauptstadt von Deutschland?',
        ['Berlin', 'Bonn', 'Hamburg'],
        'Das steht im Grundgesetz, der Verfassung von Deutschland.',
      ],
      ['Welche Farben hat die Flagge von Deutschland?', ['Schwarz, Rot, Gold', 'Rot, Weiß, Blau', 'Grün, Weiß, Rot']],
      [
        'Wo werden die Gesetze für ganz Deutschland beschlossen?',
        ['Im Bundestag in Berlin', 'Im Rathaus deines Ortes', 'In deiner Schule'],
      ],
      ['Die Schulferien legt jedes Bundesland selbst fest.', true],
    ]),
  ];

  const MODULES = {
    rechte: { name: 'Kinderrechte', icon: '📜', maxTier: 2, worldCap: [2], dmg: 14 },
    regeln: { name: 'Regeln und Streit', icon: '🤝', maxTier: 1, worldCap: [1], dmg: 10 },
    klassenrat: { name: 'Klassenrat', icon: '💬', maxTier: 1, worldCap: [1], dmg: 12 },
    abstimmen: { name: 'Abstimmen', icon: '🗳️', maxTier: 1, worldCap: [1], dmg: 14 },
    gemeinde: { name: 'Die Gemeinde', icon: '🏘️', maxTier: 1, worldCap: [1], dmg: 12 },
    rathaus: { name: 'Wer entscheidet?', icon: '🏛️', maxTier: 1, worldCap: [1], dmg: 12 },
  };
  const TUT = {
    'rechte:1': {
      title: 'Kinderrechte',
      steps: [
        'Alle Kinder auf der Welt haben Rechte. Sie stehen in der UN-Kinderrechtskonvention.',
        'Beispiel: Ein Kind ist krank und bekommt ärztliche Hilfe. Das ist das Recht auf Gesundheit.',
        'Lies, was passiert, und tippe auf das Recht, um das es geht.',
      ],
    },
    'rechte:2': {
      title: 'Drei Gruppen von Rechten',
      steps: [
        'Schutzrechte schützen Kinder, zum Beispiel vor Gewalt.',
        'Förderrechte geben Kindern, was sie zum Leben und Lernen brauchen, zum Beispiel Bildung.',
        'Beteiligungsrechte lassen Kinder mitreden, zum Beispiel ihre Meinung sagen.',
        'Tippe auf die Gruppe, zu der das Recht gehört.',
      ],
    },
    'regeln:1': {
      title: 'Regeln und Streit',
      steps: [
        'Regeln helfen, damit alle gut zusammen lernen. Sie gelten für alle.',
        'Bei Streit beruhigen sich erst alle, dann hört jeder dem anderen zu.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'klassenrat:1': {
      title: 'Klassenrat',
      steps: [
        'Im Klassenrat bespricht die Klasse, was alle angeht, und entscheidet gemeinsam.',
        'Kinder leiten ihn und schreiben das Protokoll.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'ratord:1': {
      title: 'Der Klassenrat der Reihe nach',
      steps: [
        'Die Sätze sind durcheinander.',
        'Der Klassenrat beginnt mit der Eröffnung und endet mit dem Beschluss im Protokoll.',
        'Tippe die Sätze der Reihe nach an. Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
    'sprecherord:1': {
      title: 'Die Klassensprecherwahl',
      steps: [
        'Die Sätze sind durcheinander.',
        'Erst stellen sich die Kandidaten vor, dann wird geheim gewählt und ausgezählt.',
        'Tippe die Sätze der Reihe nach an. Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
    'abstimmen:1': {
      title: 'Abstimmen',
      steps: [
        'Bei einer Abstimmung hat jedes Kind eine Stimme.',
        'In der Strichliste ist jeder Strich eine Stimme. Fünf Striche bilden ein Bündel: vier nebeneinander und einer quer darüber.',
        'Zähle die Bündel in Fünferschritten und dann die einzelnen Striche.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'gemeinde:1': {
      title: 'Die Gemeinde',
      steps: [
        'Die Gemeinde sorgt für vieles, was alle im Ort brauchen: Feuerwehr, Spielplätze, Wasser.',
        'Beispiel: Wer ein Buch ausleihen will, geht in die Bücherei.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'wasserord:1': {
      title: 'Der Weg des Wassers',
      steps: [
        'Die Sätze sind durcheinander.',
        'Beginne im Wasserwerk und folge dem Wasser durch das Haus bis zurück in den Fluss.',
        'Tippe die Sätze der Reihe nach an. Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
    'rathaus:1': {
      title: 'Wer entscheidet?',
      steps: [
        'Manches entscheidet die Klasse, manches die Gemeinde oder Stadt.',
        'Das Bundesland bestimmt zum Beispiel die Schulferien. Der Bund macht Regeln für ganz Deutschland.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'wahlord:1': {
      title: 'Eine Wahl der Reihe nach',
      steps: [
        'Die Sätze sind durcheinander.',
        'Erst kommt die Wahlbenachrichtigung, am Ende werden die Stimmen ausgezählt.',
        'Tippe die Sätze der Reihe nach an. Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
  };

  function caseTask(mod: string) {
    const c = pick(CASES);
    const wrong = shuffle(RIGHTS.filter((r) => r.id !== c.a && !(c.skip || []).includes(r.id))).slice(0, 2);
    return choice(
      mod,
      'rechte',
      `${c.q} Um welches Kinderrecht geht es?`,
      rightOf(c.a).name,
      wrong.map((r) => r.name),
      'gmfall_' + CASES.indexOf(c),
    );
  }
  function signTask(mod: string) {
    const id = pick(Object.keys(SIGNS));
    const wrong = shuffle(Object.keys(SIGNS).filter((x) => x !== id)).slice(0, 2);
    return choice(
      mod,
      'rechte',
      'Für welches Kinderrecht steht dieses Zeichen?',
      rightOf(id).name,
      wrong.map((x) => rightOf(x).name),
      'gmsign_' + id,
      { pic: signSVG(id) },
    );
  }
  function groupTask(mod: string) {
    const r = pick(RIGHTS.filter((x) => x.group));
    return choice(mod, 'gruppen', `${r.name}: Zu welcher Gruppe gehört dieses Recht?`, r.group!, [], '', {
      options: GROUPS.slice(),
      qid: 'gmgrp_' + r.id,
      tier: 2,
      group: 'rechte:2',
    });
  }
  function needTask(mod: string) {
    const n = pick(NEEDS);
    const wrong = shuffle(PLACES.filter((p) => p !== n.a && !(n.skip || []).includes(p))).slice(0, 2);
    return choice(mod, 'aufgaben', n.q, n.a, wrong, 'gmort_' + NEEDS.indexOf(n));
  }
  function decideTask(mod: string) {
    const d = pick(DECIDE);
    return choice(mod, 'land', `Wer entscheidet darüber? ${d.q}`, LEVELS[d.l], [], '', {
      options: LEVELS.slice(),
      qid: 'gmwer_' + DECIDE.indexOf(d),
    });
  }
  function gen(cfg: Unit) {
    return (mod: string, tier: number, _know: Know, _seq: number, opts?: GenOpts) => {
      if (wantsPool(cfg, mod, opts)) return null;
      const r = Math.random();
      if (mod === 'rechte') {
        if (tier >= 2 && r < 0.6) return groupTask(mod);
        if (r < 0.35) return caseTask(mod);
        if (r < 0.5) return signTask(mod);
      }
      if (mod === 'klassenrat' && r < 0.3)
        return r < 0.18
          ? orderTask(
              mod,
              'ratord:1',
              'klassenrat',
              'Wie läuft der Klassenrat ab? Tippe die Sätze der Reihe nach an.',
              RAT,
              'gmrat_',
            )
          : orderTask(
              mod,
              'sprecherord:1',
              'sprecher',
              'So wählt die Klasse ihre Klassensprecherin oder ihren Klassensprecher. Tippe die Sätze der Reihe nach an.',
              SPRECHER,
              'gmspr_',
            );
      if (mod === 'abstimmen' && r < 0.5) return voteTask(mod);
      if (mod === 'gemeinde' && r < 0.4) return needTask(mod);
      if (mod === 'gemeinde' && r < 0.52)
        return orderTask(
          mod,
          'wasserord:1',
          'aufgaben',
          'Der Weg des Wassers durch den Ort: Tippe die Sätze der Reihe nach an.',
          WASSER,
          'gmwas_',
        );
      if (mod === 'rathaus') {
        if (r < 0.4) return decideTask(mod);
        if (r < 0.52)
          return orderTask(
            mod,
            'wahlord:1',
            'wahl',
            'So läuft eine Wahl ab. Tippe die Sätze der Reihe nach an.',
            WAHL,
            'gmwahl_',
          );
      }
      return null;
    };
  }

  // dilemma cards as in Früher und heute: every choice gets the same reward
  const GM: Unit = {
    modules: MODULES,
    tut: TUT,
    notes: NOTES,
    pool: POOL,
    worlds: 1,
    grade: 3,
    subject: 'Sachkunde',
    title: 'Kinderrechte und Gemeinde',
    icon: '⚖️',
    sub: 'Kinderrechte, Klassenrat und Abstimmen, was die Gemeinde tut und wer entscheidet',
    starters: [
      {
        id: 'buergermeisterin',
        type: 'normal',
        shape: 'buergermeisterin',
        names: ['Die Bürgermeisterin', 'Die Bürgermeisterin', 'Die Bürgermeisterin'],
        hp: 70,
        desc: 'Sie leitet die Sitzungen im Rathaus und hat jeden Donnerstag eine Sprechstunde, in der auch Kinder ihre Wünsche vortragen.',
        perk: 'heal',
        attacks: [
          { name: 'Rechteplakat', mod: 'rechte' },
          { name: 'Redestein', mod: 'klassenrat' },
          { name: 'Stimmzettel', mod: 'abstimmen' },
          { name: 'Rathausschlüssel', mod: 'gemeinde' },
        ],
      },
    ],
    extra: {
      rechte: 'Rechteplakat',
      regeln: 'Regeltafel',
      klassenrat: 'Redestein',
      abstimmen: 'Stimmzettel',
      gemeinde: 'Rathausschlüssel',
      rathaus: 'Amtskette',
    },
    enemies: {
      1: {
        normal: [
          { name: 'Der Vordrängler', type: 'normal', shape: 'vordraengler', hp: 26, atk: 4 },
          { name: 'Der Dazwischenrufer', type: 'feuer', shape: 'dazwischenrufer', hp: 24, atk: 4 },
          { name: 'Die kaputte Schaukel', type: 'pflanze', shape: 'kaputteschaukel', hp: 30, atk: 3 },
          { name: 'Die Schmiererei', type: 'wasser', shape: 'schmiererei', hp: 28, atk: 3 },
        ],
        elite: { name: 'Der Zettelfresser', type: 'normal', shape: 'zettelfresser', hp: 45, atk: 5 },
        boss: {
          name: 'Der große Bestimmer',
          acc: 'den großen Bestimmer',
          type: 'feuer',
          shape: 'bestimmer',
          hp: 70,
          atk: 6,
          boss: true,
        },
      },
    },
    moves: ['Vordrängeln', 'Dazwischenrufen', 'Kettenquietschen', 'Farbspritzer', 'Zettelschlucken', 'Machtwort'],
    events: [
      {
        title: 'Das Rathaus',
        text: 'Im Rathaus hängt ein Plan für den neuen Spielplatz. Der Mann am Empfang fragt dich, wer im Ort entscheidet, und schenkt dir einen Trank.',
        opts: [
          { label: 'Antworten', task: 'rathaus', g: 'rat', win: { item: 'trank' }, lose: { hp: -6 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Die Stadtbücherei',
        text: 'Die Bibliothekarin stempelt Ausleihzettel. Sie gibt dir einen Schild, wenn du ihre Frage zur Gemeinde beantwortest.',
        opts: [
          { label: 'Antworten', task: 'gemeinde', g: 'aufgaben', win: { item: 'schild' }, lose: { hp: -5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Der Klassenrat-Briefkasten',
        text: 'Vor dem Klassenzimmer hängt ein Briefkasten aus Pappe. Ein Junge aus der 4b fragt dich, wie der Klassenrat abläuft, und gibt dir eine Chilischote.',
        opts: [
          { label: 'Antworten', task: 'klassenrat', g: 'klassenrat', win: { item: 'keks' }, lose: { xp: 5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Die Strichliste',
        text: 'An der Tafel steht eine Strichliste von der letzten Abstimmung. Die Lehrerin kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort.',
        opts: [
          { label: 'Antworten', task: 'abstimmen', g: 'mehrheit', win: { item: 'lupe' }, lose: { xp: 5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Das Plakat im Flur',
        text: 'Im Schulflur hängt ein großes Plakat mit den Kinderrechten. Ein Mädchen fragt dich, was eins davon bedeutet.',
        opts: [
          { label: 'Antworten', task: 'rechte', g: 'rechte', win: { xp: 20 }, lose: { xp: 5 } },
          { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } },
        ],
      },
      {
        title: 'Die Streitschlichter',
        text: 'Auf dem Schulhof tragen zwei Kinder gelbe Westen. Sie schlichten Streit und fragen dich, wie man fair streitet.',
        opts: [
          { label: 'Antworten', task: 'regeln', g: 'streit', win: { item: 'trank' }, lose: { hp: -5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Die verlorene Abstimmung',
        dilemma: true,
        reward: { hp: 5 },
        text: 'Die Klasse hat über den Ausflug abgestimmt. Du wolltest in den Kletterpark, aber die meisten haben für das Museum gestimmt.',
        opts: [
          {
            label: 'Ich gehe mit und schaue, was es im Museum gibt.',
            then: 'Im Museum gibt es einen Raum, in dem man alte Werkzeuge ausprobieren darf. Der Tag ist besser als gedacht.',
            think: 'Warum hält man sich an einen Beschluss, auch wenn man ihn nicht wollte?',
          },
          {
            label: 'Ich schlage im Klassenrat den Kletterpark für den nächsten Ausflug vor.',
            then: 'Dein Anliegen kommt ins Protokoll. Im Frühling stimmt die Klasse wieder ab.',
            think: 'Wie kann man für seine Meinung werben, ohne andere zu überreden?',
          },
          {
            label: 'Ich habe den ganzen Tag schlechte Laune.',
            then: 'Im Museum stehst du abseits. Am Abend ärgerst du dich, dass du den Tag verpasst hast.',
            think: 'Wem schadet schlechte Laune nach einer verlorenen Abstimmung?',
          },
        ],
      },
      {
        title: 'Die Gruppenarbeit',
        dilemma: true,
        reward: { hp: 5 },
        text: 'Ihr sollt in Vierergruppen ein Plakat machen. Deine Gruppe will Jonas nicht dabeihaben, weil er so langsam schreibt.',
        opts: [
          {
            label: 'Ich sage: „Jonas gehört zu uns. Er kann zum Beispiel die Bilder malen.“',
            then: 'Jonas malt die Bilder. Euer Plakat wird das bunteste der Klasse.',
            think: 'Was kann jedes Kind in deiner Gruppe besonders gut?',
          },
          {
            label: 'Ich frage die Lehrerin, wie wir die Gruppen fair einteilen.',
            then: 'Die Lehrerin lost die Gruppen aus. Niemand bleibt übrig.',
            think: 'Warum ist Losen manchmal fairer als Wählen?',
          },
          {
            label: 'Ich sage nichts, die anderen haben entschieden.',
            then: 'Jonas sitzt allein und schaut auf seinen Tisch. Am Ende kommt er in eine Gruppe, die ihn nicht gefragt hat.',
            think: 'Wie fühlt sich ein Kind, das niemand dabeihaben will?',
          },
        ],
      },
      {
        title: 'Der Platz am Fenster',
        dilemma: true,
        reward: { hp: 5 },
        text: 'Nach den Ferien wird die Sitzordnung neu gemacht. Fast alle wollen am Fenster sitzen, aber dort ist nur Platz für sechs Kinder.',
        opts: [
          {
            label: 'Wir losen die Plätze aus.',
            then: 'Jedes Kind zieht einen Zettel. Wer heute kein Glück hat, ärgert sich kurz, findet es aber gerecht.',
            think: 'Wann ist Losen eine gute Lösung?',
          },
          {
            label: 'Wir wechseln jeden Monat.',
            then: 'Im Klassenrat beschließt ihr einen Plan. Jeder kommt einmal ans Fenster.',
            think: 'Warum ist Abwechseln ein Kompromiss?',
          },
          {
            label: 'Wer zuerst da ist, bekommt den Platz.',
            then: 'Am Montag drängeln sich alle an der Tür. Zwei Kinder stolpern.',
            think: 'Ist schnell sein dasselbe wie fair sein?',
          },
        ],
      },
      {
        title: 'Die Klassensprecherwahl',
        dilemma: true,
        reward: { hp: 5 },
        text: 'Morgen wählt die Klasse. Dein bester Freund Elias will, dass du ihn wählst. Du findest aber, dass Aylin besser zuhören kann.',
        opts: [
          {
            label: 'Ich wähle Aylin. Die Wahl ist geheim.',
            then: 'Aylin wird gewählt. Elias fragt nicht nach, wen du gewählt hast, und ihr bleibt Freunde.',
            think: 'Warum ist es wichtig, dass eine Wahl geheim ist?',
          },
          {
            label: 'Ich sage Elias ehrlich, dass ich Aylin wähle.',
            then: 'Elias ist erst enttäuscht. Am Nachmittag fahrt ihr trotzdem zusammen Rad.',
            think: 'Kann man befreundet sein und verschiedene Meinungen haben?',
          },
          {
            label: 'Ich wähle Elias, weil er mein Freund ist.',
            then: 'Elias freut sich über deine Stimme. Gewählt wird trotzdem Aylin.',
            think: 'Was ist wichtiger bei einer Wahl: Freundschaft oder wer die Aufgabe gut macht?',
          },
        ],
      },
      {
        title: 'Die Bank im Stadtpark',
        text: 'Im Stadtpark steht eine frisch gestrichene Bank, die die Gemeinde aufgestellt hat. Hier ruhst du dich aus.',
        opts: [
          { label: 'Ausruhen (+15 LP)', effect: { hp: 15 } },
          { label: 'Weiter', effect: {} },
        ],
      },
    ],
  };
  GM.gen = gen(GM);
  K.MODES.gemeinde = GM;
  return {
    RIGHTS,
    GROUPS,
    CASES,
    VOTES,
    PLACES,
    NEEDS,
    LEVELS,
    DECIDE,
    RAT,
    SPRECHER,
    WAHL,
    WASSER,
    SIGNS,
    signSVG,
    tallySVG,
    counts,
  };
})();
