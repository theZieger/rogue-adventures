// Ethik grade 3: „Der Festkalender“ – festivals of the religions and of people without one. World 1: Judaism,
// Christianity (short, Das Kirchenjahr has the depth) and Islam; world 2: Hinduism, Buddhism, festivals without a
// religion, why dates move and what festivals share. Every fact has its sources in lehrplan/quellen-religionen.md.
// The texts describe („Viele Christen feiern …“), never address the child as a member of a religion and never rank.
// Registers its unit in MK.MODES; src/units.ts picks it up from there.
import { MK as K, type GenOpts, type Know, type Question } from './knowledge.ts';
export const MR = (() => {
  const { weightedPick, shuffle } = K;

  const NOTES = {
    glaube: {
      title: 'Religionen und Weltanschauungen',
      lines: [
        'In einer Religion glauben Menschen an Gott oder an mehrere Götter. Sie beten, feiern Feste und erzählen alte Geschichten weiter.',
        'Judentum, Christentum, Islam, Hinduismus und Buddhismus nennt man oft die fünf Weltreligionen. Es gibt noch viele weitere Religionen.',
        'Juden, Christen und Muslime glauben an einen einzigen Gott. Alle drei erzählen von Abraham. Im Islam heißt er Ibrahim.',
        'Viele Menschen gehören zu keiner Religion. Auch sie feiern Feste und denken darüber nach, was gut und richtig ist.',
        'Eine Weltanschauung ist die Art, wie ein Mensch die Welt sieht und was ihm im Leben wichtig ist.',
        'In Deutschland darf jeder Mensch selbst entscheiden, ob er an etwas glaubt und woran. Das steht im Grundgesetz.',
        'Niemand darf wegen seines Glaubens ausgelacht oder ausgeschlossen werden.',
      ],
    },
    judentum: {
      title: 'Das Judentum',
      lines: [
        'Jüdinnen und Juden beten in der Synagoge. Sie ist Gebetshaus und Treffpunkt der Gemeinde.',
        'Die heilige Schrift heißt Tora. Sie ist auf Hebräisch von Hand auf eine lange Rolle geschrieben.',
        'Eine Rabbinerin oder ein Rabbiner lehrt die Gemeinde und erklärt die Tora.',
        'Der Schabbat ist der Ruhetag der Woche. Er beginnt am Freitagabend und endet am Samstagabend.',
        'Am Freitagabend zünden viele Familien die Schabbatkerzen an und essen zusammen. Dazu gibt es oft einen Hefezopf, die Challa.',
        'Viele jüdische Männer und Jungen tragen beim Beten eine kleine Kappe, die Kippa.',
        'Der Davidstern aus zwei Dreiecken und die Menora, ein Leuchter mit sieben Armen, sind Zeichen des Judentums.',
        'Man wünscht sich „Schabbat Schalom“. Schalom heißt Frieden.',
      ],
    },
    juedfeste: {
      title: 'Jüdische Feste',
      lines: [
        'Rosch ha-Schana ist das Neujahrsfest im Herbst. Man isst Apfel mit Honig, damit das neue Jahr gut und süß wird. Das Widderhorn, der Schofar, wird geblasen.',
        'Jom Kippur ist der Versöhnungstag, zehn Tage nach dem Neujahrsfest: ein sehr ernster Feiertag. Viele Erwachsene fasten und bitten um Vergebung.',
        'Sukkot ist das Laubhüttenfest im Herbst. Familien bauen eine Hütte, die Sukka. Durch das Dach aus Zweigen sieht man die Sterne. Das Fest erinnert an die Wanderung durch die Wüste und ist auch ein Erntedankfest.',
        'Chanukka ist das Lichterfest im Winter. Es dauert acht Tage. Jeden Abend brennt ein Licht mehr am Leuchter, der Chanukkia. Sie hat acht Lichter und ein neuntes zum Anzünden, den Diener.',
        'Chanukka erinnert an die Einweihung des Tempels in Jerusalem vor mehr als 2000 Jahren. Erzählt wird: Ein Krug Öl reichte nur für einen Tag und brannte doch acht Tage.',
        'Zu Chanukka gibt es in Öl Gebackenes wie Kartoffelpuffer und Krapfen. Kinder kreiseln mit dem Dreidel.',
        'Pessach im Frühling dauert etwa eine Woche. Es erinnert an den Auszug aus Ägypten: Die Tora erzählt, wie Mose das Volk Israel aus der Sklaverei führte.',
        'Am Sederabend wird diese Geschichte vorgelesen. Das jüngste Kind stellt Fragen dazu. Man isst Mazzen, flaches Brot ohne Sauerteig.',
        'Ein Gruß zu den Festen ist „Chag Sameach“. Das heißt „Frohes Fest“.',
      ],
    },
    christentum: {
      title: 'Christliche Feste',
      lines: [
        'Christinnen und Christen feiern Gottesdienst in der Kirche. Ihre heilige Schrift ist die Bibel, ihr Zeichen ist das Kreuz.',
        'Der Sonntag ist für Christen der Ruhetag der Woche.',
        'An Weihnachten feiern Christen die Geburt von Jesus.',
        'An Ostern feiern sie, dass Jesus nach ihrem Glauben von den Toten auferstanden ist.',
        'Pfingsten ist 50 Tage nach Ostern. Christen feiern den Heiligen Geist. Das Fest gilt als Geburtstag der Kirche.',
        'Viele orthodoxe Christen feiern Weihnachten am 7. Januar, weil ihre Kirche die Feste nach einem älteren Kalender berechnet.',
        'Mehr über diese Feste steht im Thema „Das Kirchenjahr“.',
      ],
    },
    islam: {
      title: 'Der Islam',
      lines: [
        'Musliminnen und Muslime beten in der Moschee. Vor dem Gebetsraum zieht man die Schuhe aus.',
        'Viele Moscheen haben einen hohen, schlanken Turm, das Minarett.',
        'Die heilige Schrift heißt Koran. Er ist auf Arabisch geschrieben und hat 114 Abschnitte, die Suren.',
        'Muslime nennen Gott Allah.',
        'Der Imam betet in der Moschee vor. Gebetet wird in Richtung der Stadt Mekka.',
        'Am Freitag kommen besonders viele zum Freitagsgebet in die Moschee.',
        'Die Mondsichel ist oft auf Moscheen zu sehen. Vielen gilt sie als Zeichen für den Islam.',
      ],
    },
    islfeste: {
      title: 'Ramadan und die Feste im Islam',
      lines: [
        'Ramadan ist der neunte Monat im islamischen Kalender und der Fastenmonat. Er dauert 29 oder 30 Tage.',
        'Wer fastet, isst und trinkt von der Morgendämmerung bis zum Sonnenuntergang nichts.',
        'Am Abend kommen Familie und Freunde zum Fastenbrechen zusammen, dem Iftar. Viele beginnen mit Datteln und Wasser.',
        'Kinder, Kranke, Schwangere und Reisende müssen nicht fasten.',
        'Im Ramadan denken viele besonders an andere: Sie helfen und spenden.',
        'Nach dem Ramadan folgt das Fest des Fastenbrechens, auch Ramadanfest genannt. Es dauert drei Tage. Viele sagen Zuckerfest dazu, weil es viele Süßigkeiten gibt.',
        'Das Fest beginnt mit einem Gebet in der Moschee. Man besucht Verwandte und Freunde, Kinder bekommen Geschenke.',
        'Das Opferfest erinnert an Ibrahim (Abraham) und sein Vertrauen auf Gott. Es dauert mehrere Tage und ist der höchste Feiertag im Islam.',
        'Zum Opferfest wird Fleisch geteilt: mit der Familie, mit Nachbarn und Freunden und mit Menschen, die wenig haben. Viele spenden stattdessen Geld.',
        'Ein Gruß zu beiden Festen ist „Id Mubarak“, auch „Eid Mubarak“ geschrieben. Das heißt „Gesegnetes Fest“.',
      ],
    },
    hindu: {
      title: 'Hinduismus: Diwali und Holi',
      lines: [
        'Die meisten Hindus leben in Indien. Hindus verehren viele Göttinnen und Götter.',
        'Hindus beten im Tempel und zu Hause. In den Tempel bringen sie Blumen und andere Gaben mit.',
        'Diwali ist das Lichterfest im Herbst. Der Name bedeutet „Reihe von Lichtern“. Oft wird fünf Tage lang gefeiert.',
        'An Fenstern und Türen leuchten kleine Öllampen aus Ton, die Diyas. Das Fest steht für den Sieg des Lichts über die Dunkelheit.',
        'Vor die Tür legen viele ein Rangoli: ein Bodenbild aus buntem Pulver oder Blüten.',
        'Holi ist das Frühlingsfest, das Fest der Farben. Die Menschen bewerfen sich mit buntem Pulver und Wasser.',
        'Holi feiert den Frühling und den Sieg des Guten über das Böse.',
      ],
    },
    buddha: {
      title: 'Buddhismus: Vesakh',
      lines: [
        'Der Buddhismus geht auf Siddhartha Gautama zurück. Er lebte vor etwa 2500 Jahren und wurde in Lumbini geboren, das heute in Nepal liegt.',
        '„Buddha“ ist kein Name, sondern ein Ehrentitel. Er heißt „der Erwachte“.',
        'Viele Buddhistinnen und Buddhisten meditieren: Sie sitzen still und üben, ruhig und aufmerksam zu werden.',
        'Vesakh ist das wichtigste buddhistische Fest. Es erinnert an die Geburt des Buddha, an seine Erleuchtung und an seinen Tod.',
        'Gefeiert wird an einem Vollmondtag im Frühling, meist im Mai. Der Tag wechselt von Jahr zu Jahr und von Land zu Land.',
        'Tempel und Straßen werden mit Lichtern, Fahnen und Blumen geschmückt. Viele nehmen sich an diesem Tag gute Taten vor.',
        'Das Rad der Lehre mit acht Speichen ist ein Zeichen des Buddhismus.',
      ],
    },
    ohne: {
      title: 'Feste ohne Religion',
      lines: [
        'Manche Feste gehören zu keiner Religion: der Geburtstag, die Einschulung oder Neujahr am 1. Januar.',
        'Zur Einschulung bekommen Kinder in Deutschland eine Schultüte.',
        'Mit etwa 14 Jahren feiern viele Jugendliche, dass sie erwachsen werden.',
        'Die Jugendweihe, auch Jugendfeier genannt, ist dafür eine Feier ohne Religion. Besonders viele feiern sie im Osten Deutschlands.',
        'Evangelische Jugendliche feiern die Konfirmation. Jüdische Jugendliche feiern mit 12 oder 13 Jahren Bat Mizwa (Mädchen) oder Bar Mizwa (Jungen).',
        'Nicht jede Familie feiert jedes Fest. Manche feiern zum Beispiel keinen Geburtstag.',
        'Ein Feiertag ist ein Festtag, den viele Menschen gemeinsam begehen.',
      ],
    },
    kalender: {
      title: 'Warum Feste wandern',
      lines: [
        'Unser Kalender richtet sich nach der Sonne: Ein Jahr hat 365 Tage, in einem Schaltjahr 366.',
        'Der Mond braucht von Neumond zu Neumond etwa 29 und einen halben Tag. Darum hat ein Mondmonat 29 oder 30 Tage.',
        'Neumond: Der Mond ist nicht zu sehen. Dann wächst die Sichel zum Halbmond und zum Vollmond und nimmt wieder ab.',
        'Der islamische Kalender zählt nur nach dem Mond. Zwölf Mondmonate sind etwa 11 Tage kürzer als ein Sonnenjahr.',
        'Darum beginnt der Ramadan jedes Jahr etwa 11 Tage früher. Im Lauf vieler Jahre wandert er durch alle Jahreszeiten.',
        'Der jüdische Kalender richtet sich nach Mond und Sonne. In manchen Jahren kommt ein Schaltmonat dazu. So bleibt Pessach im Frühling und Chanukka im Winter.',
        'Im Judentum und im Islam beginnt ein Tag schon am Abend vorher. Deshalb fangen die Feste am Vorabend an.',
        'Auch Ostern wandert: Es ist am ersten Sonntag nach dem ersten Vollmond im Frühling. Weihnachten hat ein festes Datum.',
        'Wann ein Fest in diesem Jahr ist, steht im Kalender.',
      ],
    },
    gemeinsam: {
      title: 'Was Feste verbindet',
      lines: [
        'Zusammenkommen: Zu fast allen Festen treffen sich Familie, Freunde und Nachbarn.',
        'Essen: Zu vielen Festen gehören besondere Speisen, vom Apfel mit Honig bis zu den Datteln am Abend.',
        'Licht: Kerzen am Adventskranz, Lichter an der Chanukkia, Öllampen zu Diwali, Lichter zu Vesakh.',
        'Schenken und Teilen: Geschenke für Kinder, Spenden für Menschen in Not, geteiltes Essen.',
        'Erinnern: Viele Feste erzählen eine alte Geschichte weiter.',
        'Fasten gibt es in mehreren Religionen: im Ramadan, an Jom Kippur und in der christlichen Fastenzeit vor Ostern.',
        'Zu einem Fest darf man Glück wünschen, auch wenn man es selbst nicht feiert. Wer neugierig ist, fragt freundlich nach.',
        'Respekt heißt: Ich achte, was anderen wichtig ist, auch wenn ich es anders sehe.',
      ],
    },
  };

  const JAHR_J = [
    { id: 'rj1', text: 'Rosch ha-Schana: das Neujahrsfest im Herbst' },
    { id: 'rj2', text: 'Jom Kippur: der Versöhnungstag, zehn Tage später' },
    { id: 'rj3', text: 'Sukkot: das Laubhüttenfest, noch im Herbst' },
    { id: 'rj4', text: 'Chanukka: das Lichterfest im Winter' },
    { id: 'rj5', text: 'Pessach: das Fest im Frühling' },
  ];
  const RAMADAN = [
    { id: 'rr1', text: 'Die schmale Mondsichel zeigt sich: Der Ramadan beginnt.' },
    { id: 'rr2', text: 'Vor der Morgendämmerung gibt es ein frühes Frühstück.' },
    { id: 'rr3', text: 'Den Tag über wird gefastet.' },
    { id: 'rr4', text: 'Nach Sonnenuntergang kommt das Fastenbrechen, der Iftar.' },
    { id: 'rr5', text: 'Nach 29 oder 30 Tagen endet der Ramadan.' },
    { id: 'rr6', text: 'Das Fest des Fastenbrechens beginnt.' },
  ];
  const AUSZUG = [
    { id: 'ra1', text: 'Das Volk Israel muss in Ägypten als Sklaven arbeiten.' },
    { id: 'ra2', text: 'Mose fordert vom Pharao, das Volk ziehen zu lassen.' },
    { id: 'ra3', text: 'Das Volk bricht in großer Eile auf. Für Sauerteig bleibt keine Zeit.' },
    { id: 'ra4', text: 'Das Volk zieht durch das Meer in die Freiheit.' },
    { id: 'ra5', text: 'Es folgt eine lange Wanderung durch die Wüste.' },
  ];
  const MOND = [
    { id: 'rm1', text: 'Neumond: Der Mond ist nicht zu sehen.' },
    { id: 'rm2', text: 'Eine schmale Sichel erscheint.' },
    { id: 'rm3', text: 'Zunehmender Halbmond' },
    { id: 'rm4', text: 'Vollmond: Der Mond ist rund.' },
    { id: 'rm5', text: 'Abnehmender Halbmond' },
    { id: 'rm6', text: 'Die Sichel wird schmal und verschwindet.' },
  ];
  const LEBEN = [
    { id: 'rl1', text: 'Geburt' },
    { id: 'rl2', text: 'Erster Geburtstag' },
    { id: 'rl3', text: 'Einschulung mit der Schultüte' },
    { id: 'rl4', text: 'Jugendweihe, Konfirmation oder Bar Mizwa' },
    { id: 'rl5', text: 'Hochzeit' },
  ];

  // „Welche Religion?“: the three buttons of a world always stand in this order
  const WELCHE = [
    ['Judentum', 'Christentum', 'Islam'],
    ['Zum Hinduismus', 'Zum Buddhismus', 'Zu keiner Religion'],
  ];
  // only things that belong to exactly one of the three
  const SACHEN: [id: string, text: string, a: number, g: string, why: string][] = [
    ['syn', 'die Synagoge', 0, 'judentum', 'Die Synagoge ist das Gebetshaus der Juden.'],
    ['tora', 'die Tora', 0, 'judentum', 'Die Tora ist die heilige Schrift der Juden.'],
    ['schab', 'der Schabbat', 0, 'judentum', 'Der Schabbat ist der jüdische Ruhetag.'],
    ['kippa', 'die Kippa', 0, 'judentum', 'Die Kippa tragen viele jüdische Männer und Jungen beim Beten.'],
    ['rabb', 'die Rabbinerin', 0, 'judentum', 'Rabbinerinnen und Rabbiner lehren jüdische Gemeinden.'],
    ['pess', 'Pessach', 0, 'juedfeste', 'Pessach ist ein jüdisches Fest im Frühling.'],
    ['chan', 'Chanukka', 0, 'juedfeste', 'Chanukka ist das jüdische Lichterfest.'],
    ['jomk', 'Jom Kippur', 0, 'juedfeste', 'Jom Kippur ist der jüdische Versöhnungstag.'],
    ['sukk', 'das Laubhüttenfest Sukkot', 0, 'juedfeste', 'Sukkot ist ein jüdisches Fest im Herbst.'],
    ['rosch', 'Rosch ha-Schana', 0, 'juedfeste', 'Rosch ha-Schana ist das jüdische Neujahrsfest.'],
    ['kirche', 'die Kirche', 1, 'christentum', 'In der Kirche feiern Christen Gottesdienst.'],
    ['ostern', 'Ostern', 1, 'christentum', 'An Ostern feiern Christen die Auferstehung von Jesus.'],
    ['pfing', 'Pfingsten', 1, 'christentum', 'Pfingsten ist ein christliches Fest, 50 Tage nach Ostern.'],
    ['weih', 'Weihnachten', 1, 'christentum', 'An Weihnachten feiern Christen die Geburt von Jesus.'],
    ['kreuz', 'das Kreuz', 1, 'christentum', 'Das Kreuz ist das Zeichen der Christen.'],
    ['advent', 'der Advent', 1, 'christentum', 'Im Advent warten Christen auf Weihnachten.'],
    ['mosch', 'die Moschee', 2, 'islam', 'In der Moschee beten Muslime.'],
    ['koran', 'der Koran', 2, 'islam', 'Der Koran ist die heilige Schrift der Muslime.'],
    ['minar', 'das Minarett', 2, 'islam', 'Das Minarett ist der Turm einer Moschee.'],
    ['imam', 'der Imam', 2, 'islam', 'Der Imam betet in der Moschee vor.'],
    ['freitag', 'das Freitagsgebet', 2, 'islam', 'Zum Freitagsgebet kommen Muslime in die Moschee.'],
    ['ramad', 'der Fastenmonat Ramadan', 2, 'islfeste', 'Im Ramadan fasten viele Muslime.'],
    ['opfer', 'das Opferfest', 2, 'islfeste', 'Das Opferfest ist der höchste Feiertag im Islam.'],
    ['fbr', 'das Fest des Fastenbrechens', 2, 'islfeste', 'Mit diesem Fest endet für Muslime der Ramadan.'],
  ];
  const SACHEN2: typeof SACHEN = [
    ['diwali', 'Diwali', 0, 'hindu', 'Diwali ist das Lichterfest der Hindus.'],
    ['holi', 'Holi', 0, 'hindu', 'Holi ist das Frühlingsfest der Hindus.'],
    ['rangoli', 'das Rangoli', 0, 'hindu', 'Ein Rangoli legen viele Hindus zu Diwali vor die Tür.'],
    ['diya', 'die Öllampe Diya', 0, 'hindu', 'Diyas leuchten beim Lichterfest Diwali.'],
    ['vesakh', 'Vesakh', 1, 'buddha', 'Vesakh ist das wichtigste buddhistische Fest.'],
    ['rad', 'das Rad der Lehre', 1, 'buddha', 'Das Rad der Lehre ist ein Zeichen des Buddhismus.'],
    ['sidd', 'Siddhartha Gautama', 1, 'buddha', 'Auf ihn geht der Buddhismus zurück.'],
    ['erwacht', 'der Ehrentitel „Buddha“', 1, 'buddha', '„Buddha“ heißt „der Erwachte“.'],
    ['jw', 'die Jugendweihe', 2, 'ohne', 'Die Jugendweihe ist eine Feier ohne Religion.'],
    ['geb', 'der Geburtstag', 2, 'ohne', 'Den Geburtstag feiern Menschen mit und ohne Religion.'],
    ['einsch', 'die Einschulung', 2, 'ohne', 'Die Einschulung feiern Familien mit und ohne Religion.'],
    ['neuj', 'der Neujahrstag am 1. Januar', 2, 'ohne', 'Den 1. Januar feiern Menschen mit und ohne Religion.'],
  ];

  /* ---------- pictures: things and signs, never a person, a prophet or God ---------- */
  const NS = 'xmlns="http://www.w3.org/2000/svg"';
  const OUT = '#1C2541';
  const ST = `stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;
  const frame = (inner: string, bg = '#FFF8E7') =>
    `<svg ${NS} class="pic" viewBox="0 0 120 120" style="max-width:190px" role="img" aria-label="Bild zur Frage"><rect x="2" y="2" width="116" height="116" rx="12" fill="${bg}"/>${inner}</svg>`;
  const flame = (x: number, y: number, k = 1) =>
    `<g transform="translate(${x} ${y}) scale(${k})"><path d="M0 -13 Q7 -4 4 1 Q0 4 -4 1 Q-7 -4 0 -13 Z" fill="#FFB23F" ${ST}/><path d="M0 -7 Q3 -2 1.5 0 Q0 1 -1.5 0 Q-3 -2 0 -7 Z" fill="#FFF3B0"/></g>`;
  const candle = (x: number, y: number, h: number, c = '#FFFDF5') =>
    `<rect x="${x - 3.5}" y="${y}" width="7" height="${h}" rx="1.5" fill="${c}" ${ST}/>${flame(x, y - 2, 0.7)}`;
  const star = (x: number, y: number, r: number, fill: string) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2,
        rr = i % 2 ? r * 0.42 : r;
      d += `${i ? 'L' : 'M'}${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)} `;
    }
    return `<path d="${d}Z" fill="${fill}" ${ST}/>`;
  };
  const sky = (moon: string) =>
    frame(
      `${[
        [22, 26],
        [98, 30],
        [30, 92],
        [94, 88],
        [18, 60],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#FFF3B0"/>`)
        .join('')}${moon}`,
      '#27335C',
    );
  const PICS: Record<string, () => string> = {
    chanukkia: () => {
      const xs = [20, 30, 40, 50, 70, 80, 90, 100];
      const arms = xs.map((x) => `M${x} 58 Q${x} 88 60 88`).join(' ');
      return frame(
        `<path d="${arms} M60 96 L60 46" fill="none" stroke="${OUT}" stroke-width="6.5" stroke-linecap="round"/><path d="${arms} M60 96 L60 46" fill="none" stroke="#E8B93C" stroke-width="3" stroke-linecap="round"/><path d="M42 106 L78 106 L72 96 L48 96 Z" fill="#E8B93C" ${ST}/>${xs.map((x) => candle(x, 46, 12)).join('')}${candle(60, 32, 14, '#BFE3FF')}`,
      );
    },
    dreidel: () =>
      frame(
        `<rect x="55" y="18" width="10" height="22" rx="3" fill="#B5793F" ${ST}/><path d="M38 40 L82 40 L82 70 L60 100 L38 70 Z" fill="#4F8FE0" ${ST}/><path d="M60 40 L60 100 M38 70 L82 70" fill="none" ${ST} opacity=".45"/><path d="M44 46 L44 62" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="M22 96 Q30 106 44 108 M98 96 Q90 106 76 108" fill="none" ${ST} opacity=".5"/>`,
      ),
    schofar: () =>
      frame(
        `<path d="M22 84 Q26 42 68 36 Q100 32 104 54 Q106 66 94 64 Q92 50 70 52 Q44 56 36 88 Q28 92 22 84 Z" fill="#D2A76A" ${ST}/><path d="M40 62 Q46 66 50 60 M52 50 Q58 54 62 46 M68 44 Q74 48 78 42" fill="none" ${ST} opacity=".5"/><ellipse cx="99" cy="59" rx="5" ry="6.5" fill="#7A5230" ${ST}/><path d="M30 74 Q32 60 42 52" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>`,
      ),
    sukka: () =>
      frame(
        `<rect x="28" y="46" width="64" height="54" fill="#F3E3C0" ${ST}/><path d="M28 44 L28 102 M92 44 L92 102 M24 46 L96 46" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M28 44 L28 102 M92 44 L92 102 M24 46 L96 46" fill="none" stroke="#9A6236" stroke-width="3.5" stroke-linecap="round"/>${[
          26, 38, 50, 62, 74, 86,
        ]
          .map(
            (x, i) =>
              `<ellipse cx="${x + 4}" cy="${38 + (i % 2) * 3}" rx="11" ry="4.5" fill="${i % 2 ? '#5E9E4A' : '#7BB55A'}" ${ST} transform="rotate(${i % 2 ? 14 : -14} ${x + 4} 40)"/>`,
          )
          .join(
            '',
          )}<path d="M44 48 L44 58 M76 48 L76 60 M60 48 L60 54" ${ST}/><circle cx="44" cy="61" r="4" fill="#E8553A" ${ST}/><circle cx="76" cy="63" r="4" fill="#FFC93C" ${ST}/><circle cx="60" cy="57" r="3.5" fill="#B06FD0" ${ST}/><rect x="42" y="78" width="36" height="5" rx="2" fill="#B5793F" ${ST}/><path d="M46 83 L46 100 M74 83 L74 100" ${ST}/>`,
      ),
    tora: () =>
      frame(
        `<rect x="34" y="30" width="52" height="60" fill="#FFF8E0" ${ST}/>${[40, 48, 56, 64, 72, 80]
          .map(
            (y, i) =>
              `<path d="M${42 + (i % 3) * 3} ${y} L78 ${y}" stroke="#6B7390" stroke-width="2.2" stroke-linecap="round"/>`,
          )
          .join('')}${[30, 90]
          .map(
            (x) =>
              `<rect x="${x - 6}" y="24" width="12" height="72" rx="5" fill="#B5793F" ${ST}/><rect x="${x - 3}" y="12" width="6" height="12" rx="2" fill="#8A5530" ${ST}/><rect x="${x - 3}" y="96" width="6" height="12" rx="2" fill="#8A5530" ${ST}/><circle cx="${x}" cy="11" r="4" fill="#E8B93C" ${ST}/>`,
          )
          .join('')}`,
      ),
    moschee: () =>
      frame(
        `<rect x="90" y="32" width="12" height="68" fill="#F2EEE2" ${ST}/><path d="M88 32 L96 14 L104 32 Z" fill="#3E9C8F" ${ST}/><rect x="87" y="50" width="18" height="5" rx="2" fill="#E8B93C" ${ST}/><rect x="26" y="62" width="58" height="38" fill="#F2EEE2" ${ST}/><path d="M32 62 Q55 22 78 62 Z" fill="#3E9C8F" ${ST}/><path d="M55 40 L55 30" ${ST}/><path d="M58 22 A6 6 0 1 0 58 32 A4.6 4.6 0 1 1 58 22 Z" fill="#E8B93C" stroke="${OUT}" stroke-width="1.6"/><path d="M48 100 L48 84 Q55 74 62 84 L62 100 Z" fill="#8A5530" ${ST}/><path d="M32 74 Q36 68 40 74 L40 84 L32 84 Z M70 74 Q74 68 78 74 L78 84 L70 84 Z" fill="#BFE3FF" ${ST}/><path d="M14 100 L108 100" ${ST}/>`,
      ),
    kirche: () =>
      frame(
        `<rect x="22" y="66" width="52" height="34" fill="#F2EEE2" ${ST}/><path d="M18 66 L48 44 L78 66 Z" fill="#C2513F" ${ST}/><rect x="72" y="40" width="24" height="60" fill="#F2EEE2" ${ST}/><path d="M70 40 L84 14 L98 40 Z" fill="#C2513F" ${ST}/><path d="M84 14 L84 4 M80 8 L88 8" ${ST}/><circle cx="84" cy="54" r="5.5" fill="#fff" ${ST}/><path d="M84 54 L84 51 M84 54 L86.5 55" stroke="${OUT}" stroke-width="1.4" stroke-linecap="round"/><path d="M78 100 L78 84 Q84 76 90 84 L90 100 Z" fill="#8A5530" ${ST}/><path d="M30 76 Q34 70 38 76 L38 90 L30 90 Z M46 76 Q50 70 54 76 L54 90 L46 90 Z M60 76 Q64 70 68 76 L68 90 L60 90 Z" fill="#BFE3FF" ${ST}/><path d="M12 100 L108 100" ${ST}/>`,
      ),
    mondsichel: () =>
      frame(
        `<path d="M70 26 A36 36 0 1 0 70 94 A29 29 0 1 1 70 26 Z" fill="#E8B93C" ${ST}/>${star(86, 60, 12, '#E8B93C')}`,
      ),
    davidstern: () =>
      frame(
        `<path d="M60 20 L94 80 L26 80 Z M60 100 L26 40 L94 40 Z" fill="none" stroke="${OUT}" stroke-width="9" stroke-linejoin="round"/><path d="M60 20 L94 80 L26 80 Z M60 100 L26 40 L94 40 Z" fill="none" stroke="#4F8FE0" stroke-width="5" stroke-linejoin="round"/>`,
      ),
    kreuz: () =>
      frame(
        `<path d="M52 16 H68 V42 H92 V58 H68 V104 H52 V58 H28 V42 H52 Z" fill="#B5793F" ${ST}/><path d="M56 22 V40 M34 46 H50" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>`,
      ),
    datteln: () =>
      frame(
        `<ellipse cx="46" cy="88" rx="34" ry="11" fill="#FFFDF5" ${ST}/><ellipse cx="46" cy="87" rx="24" ry="6" fill="#E9E2D0"/>${[
          [32, 82, -18],
          [48, 79, 8],
          [60, 85, 24],
          [42, 88, -4],
        ]
          .map(
            ([x, y, r]) =>
              `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="#7A4424" ${ST} transform="rotate(${r} ${x} ${y})"/><path d="M${x - 4} ${y - 1.5} L${x + 3} ${y - 2}" stroke="#C98A5A" stroke-width="1.6" stroke-linecap="round" transform="rotate(${r} ${x} ${y})"/>`,
          )
          .join(
            '',
          )}<path d="M84 34 L108 34 L104 82 L88 82 Z" fill="#EAF6FF" ${ST}/><path d="M85.5 50 L106.5 50 L104 82 L88 82 Z" fill="#8CCBF5"/><path d="M84 34 L108 34 L104 82 L88 82 Z" fill="none" ${ST}/><path d="M90 40 L91.5 60" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`,
      ),
    schabbat: () =>
      frame(
        `<path d="M10 100 L110 100" ${ST}/>${[26, 48]
          .map(
            (x) =>
              `<path d="M${x - 9} 100 L${x + 9} 100 L${x + 4} 92 L${x - 4} 92 Z" fill="#C9CEDD" ${ST}/><rect x="${x - 2.5}" y="70" width="5" height="22" fill="#C9CEDD" ${ST}/><path d="M${x - 7} 70 L${x + 7} 70 L${x + 4} 64 L${x - 4} 64 Z" fill="#C9CEDD" ${ST}/><rect x="${x - 3.5}" y="38" width="7" height="26" rx="1.5" fill="#FFFDF5" ${ST}/>${flame(x, 36, 0.9)}`,
          )
          .join(
            '',
          )}<ellipse cx="86" cy="88" rx="24" ry="12" fill="#D9963F" ${ST}/><path d="M66 88 Q72 76 78 88 Q84 76 90 88 Q96 76 102 88 Q108 80 108 88" fill="none" ${ST}/><path d="M70 82 Q74 78 77 81 M82 81 Q86 77 89 80" stroke="#FFE2A8" stroke-width="2.2" stroke-linecap="round" fill="none"/>`,
      ),
    apfelhonig: () =>
      frame(
        `<path d="M42 44 Q40 34 46 28" fill="none" ${ST}/><path d="M46 32 Q58 24 62 34 Q52 40 46 32 Z" fill="#5E9E4A" ${ST}/><path d="M42 44 Q20 36 18 62 Q18 92 42 96 Q66 92 66 62 Q64 36 42 44 Z" fill="#E2412F" ${ST}/><path d="M26 58 Q28 50 34 48" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".6"/><rect x="74" y="56" width="30" height="40" rx="7" fill="#F0A93A" ${ST}/><rect x="72" y="48" width="34" height="10" rx="3" fill="#FFF3C4" ${ST}/><path d="M80 66 L80 86" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="M96 48 L106 26" stroke="${OUT}" stroke-width="5.5" stroke-linecap="round"/><path d="M96 48 L106 26" stroke="#B5793F" stroke-width="2.5" stroke-linecap="round"/>`,
      ),
    diya: () =>
      frame(
        `<circle cx="78" cy="48" r="20" fill="#FFE066" opacity=".35"/><path d="M22 66 Q60 56 98 66 Q94 98 60 100 Q26 98 22 66 Z" fill="#C8693A" ${ST}/><ellipse cx="60" cy="66" rx="38" ry="8" fill="#E9A06A" ${ST}/><ellipse cx="60" cy="66.5" rx="28" ry="4.5" fill="#F3C76A"/>${[
          36, 48, 60, 72, 84,
        ]
          .map((x) => `<circle cx="${x}" cy="${84 - Math.abs(x - 60) / 6}" r="2.4" fill="#FFE2A8"/>`)
          .join('')}<path d="M78 66 L78 58" ${ST}/>${flame(78, 56, 1.3)}`,
      ),
    holi: () =>
      frame(
        (
          [
            [30, 78, '#E84F9A'],
            [60, 92, '#F5C332'],
            [90, 78, '#3FA0FF'],
            [60, 60, '#5EC46A'],
          ] as [number, number, string][]
        )
          .map(
            ([x, y, c]) =>
              `<path d="M${x - 15} ${y} Q${x - 6} ${y - 24} ${x} ${y - 26} Q${x + 6} ${y - 24} ${x + 15} ${y} Z" fill="${c}" ${ST}/><path d="M${x - 18} ${y} L${x + 18} ${y} Q${x + 14} ${y + 14} ${x} ${y + 14} Q${x - 14} ${y + 14} ${x - 18} ${y} Z" fill="#C9CEDD" ${ST}/>`,
          )
          .join(''),
      ),
    rangoli: () =>
      frame(
        `<circle cx="60" cy="60" r="46" fill="#FFF3C4" ${ST}/>${[0, 1, 2, 3, 4, 5, 6, 7]
          .map(
            (i) =>
              `<ellipse cx="60" cy="32" rx="9" ry="18" fill="${['#E84F9A', '#F5A832'][i % 2]}" ${ST} transform="rotate(${i * 45} 60 60)"/><circle cx="60" cy="20" r="2.6" fill="#3FA0FF" transform="rotate(${i * 45 + 22.5} 60 60)"/>`,
          )
          .join(
            '',
          )}<circle cx="60" cy="60" r="12" fill="#5EC46A" ${ST}/><circle cx="60" cy="60" r="4.5" fill="#FFF3C4" ${ST}/>`,
      ),
    rad: () =>
      frame(
        `<circle cx="60" cy="60" r="36" fill="none" stroke="${OUT}" stroke-width="12"/><circle cx="60" cy="60" r="36" fill="none" stroke="#E8B93C" stroke-width="7"/>${[
          0, 1, 2, 3,
        ]
          .map(
            (i) =>
              `<path d="M60 22 L60 98" stroke="${OUT}" stroke-width="6.5" stroke-linecap="round" transform="rotate(${i * 45} 60 60)"/><path d="M60 22 L60 98" stroke="#E8B93C" stroke-width="3" stroke-linecap="round" transform="rotate(${i * 45} 60 60)"/>`,
          )
          .join('')}<circle cx="60" cy="60" r="9" fill="#E8B93C" ${ST}/><circle cx="60" cy="60" r="3" fill="${OUT}"/>`,
      ),
    vollmond: () => sky(`<circle cx="60" cy="60" r="30" fill="#FFF3B0" ${ST}/>`),
    halbmond: () =>
      sky(
        `<circle cx="60" cy="60" r="30" fill="#1C2541" stroke="#4A5788" stroke-width="1.5"/><path d="M60 30 A30 30 0 0 1 60 90 Z" fill="#FFF3B0" ${ST}/>`,
      ),
    sichel: () =>
      sky(
        `<circle cx="60" cy="60" r="30" fill="#1C2541" stroke="#4A5788" stroke-width="1.5"/><path d="M60 30 A30 30 0 0 1 60 90 A36 36 0 0 0 60 30 Z" fill="#FFF3B0" ${ST}/>`,
      ),
    schultuete: () =>
      frame(
        `<g transform="rotate(16 60 60)"><path d="M38 40 L82 40 L60 110 Z" fill="#4F8FE0" ${ST}/><path d="M45 62 L75 62 M51 82 L69 82" stroke="#FFC93C" stroke-width="5"/><path d="M38 40 L82 40 L60 110 Z" fill="none" ${ST}/><path d="M34 40 Q36 20 46 26 Q52 12 60 24 Q68 12 74 26 Q84 20 86 40 Z" fill="#FF8FB3" ${ST}/><path d="M40 40 Q60 48 80 40" fill="none" ${ST}/><circle cx="60" cy="51" r="3" fill="#FFF3B0"/><circle cx="60" cy="72" r="2.6" fill="#FFF3B0"/><circle cx="60" cy="92" r="2" fill="#FFF3B0"/></g>`,
      ),
  };
  // [id, world, topic, picture, question, right answer, two wrong ones, why]
  const BILDER: [string, number, string, string, string, string, string[], string][] = [
    [
      'chan',
      1,
      'juedfeste',
      'chanukkia',
      'Acht Lichter und ein Dienerlicht in der Mitte: Zu welchem Fest gehört dieser Leuchter?',
      'Chanukka',
      ['Pessach', 'Pfingsten'],
      'Die Chanukkia leuchtet an den acht Abenden von Chanukka.',
    ],
    [
      'dreidel',
      1,
      'juedfeste',
      'dreidel',
      'Mit diesem Kreisel kreiseln Kinder zu Chanukka. Wie heißt er?',
      'Dreidel',
      ['Schofar', 'Sukka'],
      'Der Dreidel ist ein Kreisel mit vier Seiten.',
    ],
    [
      'schofar',
      1,
      'juedfeste',
      'schofar',
      'Dieses Horn wird am jüdischen Neujahrsfest geblasen. Wie heißt es?',
      'Schofar',
      ['Dreidel', 'Minarett'],
      'Der Schofar ist das Horn eines Widders.',
    ],
    [
      'sukka',
      1,
      'juedfeste',
      'sukka',
      'Eine Hütte mit einem Dach aus Zweigen: Zu welchem Fest wird sie gebaut?',
      'Zum Laubhüttenfest Sukkot',
      ['Zum Opferfest', 'Zu Ostern'],
      'Die Hütte heißt Sukka. Durch ihr Dach sieht man die Sterne.',
    ],
    [
      'apfel',
      1,
      'juedfeste',
      'apfelhonig',
      'Apfel mit Honig: Zu welchem Fest gehört dieser Brauch?',
      'Zum Neujahrsfest Rosch ha-Schana',
      ['Zum Fest des Fastenbrechens', 'Zu Pfingsten'],
      'Das neue Jahr soll gut und süß werden.',
    ],
    [
      'tora',
      1,
      'judentum',
      'tora',
      'Was zeigt das Bild?',
      'Eine Torarolle',
      ['Einen Gebetsteppich', 'Ein Gesangbuch'],
      'Die Tora ist von Hand auf eine lange Rolle geschrieben.',
    ],
    [
      'schabbat',
      1,
      'judentum',
      'schabbat',
      'Kerzen und ein Hefezopf am Freitagabend: Welcher Tag beginnt hier?',
      'Der Schabbat',
      ['Der Ramadan', 'Der Advent'],
      'Der Schabbat beginnt am Freitagabend. Der Hefezopf heißt Challa.',
    ],
    [
      'stern',
      1,
      'judentum',
      'davidstern',
      'Für welche Religion steht dieses Zeichen aus zwei Dreiecken?',
      'Für das Judentum',
      ['Für das Christentum', 'Für den Islam'],
      'Das Zeichen heißt Davidstern.',
    ],
    [
      'kreuz',
      1,
      'christentum',
      'kreuz',
      'Für welche Religion steht dieses Zeichen?',
      'Für das Christentum',
      ['Für das Judentum', 'Für den Islam'],
      'Das Kreuz ist das Zeichen der Christen.',
    ],
    [
      'kirche',
      1,
      'christentum',
      'kirche',
      'Welches Gotteshaus zeigt das Bild?',
      'Eine Kirche',
      ['Eine Moschee', 'Eine Synagoge'],
      'Auf dem Turm steht ein Kreuz, das Zeichen der Christen.',
    ],
    [
      'moschee',
      1,
      'islam',
      'moschee',
      'Welches Gotteshaus zeigt das Bild?',
      'Eine Moschee',
      ['Eine Kirche', 'Eine Synagoge'],
      'Man erkennt die Kuppel und das Minarett.',
    ],
    [
      'minarett',
      1,
      'islam',
      'moschee',
      'Wie heißt der hohe, schlanke Turm rechts im Bild?',
      'Minarett',
      ['Kirchturm', 'Schofar'],
      'Viele Moscheen haben ein Minarett.',
    ],
    [
      'sichel',
      1,
      'islam',
      'mondsichel',
      'Dieses Zeichen ist oft auf Moscheen zu sehen. Vielen gilt es als Zeichen für welche Religion?',
      'Für den Islam',
      ['Für das Judentum', 'Für das Christentum'],
      'Die Mondsichel ist auf vielen Kuppeln und Minaretten zu sehen.',
    ],
    [
      'iftar',
      1,
      'islfeste',
      'datteln',
      'Mit Datteln und Wasser beginnen viele Muslime im Ramadan das Essen am Abend. Wie heißt dieses Essen?',
      'Fastenbrechen',
      ['Sederabend', 'Erntedank'],
      'Das Fastenbrechen heißt auf Arabisch Iftar.',
    ],
    [
      'diya',
      2,
      'hindu',
      'diya',
      'Solche Öllampen aus Ton leuchten beim Lichterfest der Hindus. Wie heißt das Fest?',
      'Diwali',
      ['Holi', 'Vesakh'],
      'Die Lampen heißen Diyas.',
    ],
    [
      'holi',
      2,
      'hindu',
      'holi',
      'Schalen mit buntem Farbpulver: Zu welchem Fest gehören sie?',
      'Zu Holi',
      ['Zu Diwali', 'Zur Jugendweihe'],
      'Holi ist das Fest der Farben im Frühling.',
    ],
    [
      'rangoli',
      2,
      'hindu',
      'rangoli',
      'Wie heißt so ein buntes Bodenbild, das viele Hindus zu Diwali vor die Tür legen?',
      'Rangoli',
      ['Dreidel', 'Schofar'],
      'Ein Rangoli wird aus buntem Pulver oder Blüten gelegt.',
    ],
    [
      'rad',
      2,
      'buddha',
      'rad',
      'Ein Rad mit acht Speichen: Für welche Religion steht dieses Zeichen?',
      'Für den Buddhismus',
      ['Für den Hinduismus', 'Für den Islam'],
      'Es heißt Rad der Lehre.',
    ],
    [
      'vollmond',
      2,
      'kalender',
      'vollmond',
      'Welche Mondphase zeigt das Bild?',
      'Vollmond',
      ['Halbmond', 'Mondsichel'],
      'Bei Vollmond ist der Mond ganz rund.',
    ],
    [
      'halbmond',
      2,
      'kalender',
      'halbmond',
      'Welche Mondphase zeigt das Bild?',
      'Halbmond',
      ['Vollmond', 'Mondsichel'],
      'Beim Halbmond leuchtet genau die Hälfte.',
    ],
    [
      'mondsichel',
      2,
      'kalender',
      'sichel',
      'Welche Mondphase zeigt das Bild?',
      'Mondsichel',
      ['Vollmond', 'Halbmond'],
      'Kurz nach dem Neumond ist nur eine schmale Sichel zu sehen.',
    ],
    [
      'vesakhmond',
      2,
      'buddha',
      'vollmond',
      'Bei dieser Mondphase im Frühling feiern Buddhisten ihr wichtigstes Fest. Wie heißt es?',
      'Vesakh',
      ['Diwali', 'Chanukka'],
      'Vesakh ist an einem Vollmondtag, meist im Mai.',
    ],
    [
      'tuete',
      2,
      'ohne',
      'schultuete',
      'Zu welchem Fest im Leben gehört die Schultüte?',
      'Zur Einschulung',
      ['Zur Jugendweihe', 'Zur Hochzeit'],
      'Am ersten Schultag bekommen Kinder in Deutschland eine Schultüte.',
    ],
  ];
  const PIC_OF = Object.fromEntries(BILDER.map((b) => ['rebi_' + b[0], b[3]]));

  // mod: rf = true/false, mc = multiple choice, lt = gap text, def = terms, ord = order, welche = which religion, bild = picture
  const POOL: Question[] = [
    // religions and world views
    {
      id: 'rerf1',
      mod: 'rf',
      g: 'glaube',
      q: 'Juden, Christen und Muslime glauben an einen einzigen Gott.',
      a: true,
    },
    {
      id: 'rerf2',
      mod: 'rf',
      g: 'glaube',
      q: 'Jeder Mensch auf der Welt gehört zu einer Religion.',
      a: false,
      why: 'Viele Menschen gehören zu keiner Religion.',
    },
    {
      id: 'rerf3',
      mod: 'rf',
      g: 'glaube',
      q: 'In Deutschland darf jeder Mensch selbst entscheiden, woran er glaubt.',
      a: true,
      why: 'Das steht im Grundgesetz.',
    },
    {
      id: 'rerf4',
      mod: 'rf',
      g: 'glaube',
      q: 'Nur wer zu einer Religion gehört, feiert Feste.',
      a: false,
      why: 'Auch Menschen ohne Religion feiern Feste, zum Beispiel Geburtstag und Neujahr.',
    },
    {
      id: 'remc1',
      mod: 'mc',
      g: 'glaube',
      q: 'Von wem erzählen Juden, Christen und Muslime gleichermaßen?',
      o: ['Von Abraham', 'Von Siddhartha Gautama', 'Vom Nikolaus'],
      a: 0,
      why: 'Im Islam heißt Abraham Ibrahim.',
    },
    {
      id: 'remc2',
      mod: 'mc',
      g: 'glaube',
      q: 'Welche gehören zu den fünf Weltreligionen?',
      o: ['Judentum, Christentum und Islam', 'Frühling, Sommer und Herbst', 'Ostern, Pfingsten und Advent'],
      a: 0,
      why: 'Dazu kommen der Hinduismus und der Buddhismus.',
    },
    {
      id: 'remc3',
      mod: 'mc',
      g: 'glaube',
      q: 'In eurer Klasse glauben Kinder Verschiedenes, manche glauben an keinen Gott. Was gilt?',
      o: ['Alle gehören gleich dazu.', 'Nur die größte Gruppe zählt.', 'Darüber darf man nie sprechen.'],
      a: 0,
      why: 'Niemand darf wegen seines Glaubens ausgeschlossen werden.',
    },
    {
      id: 'remc4',
      mod: 'mc',
      g: 'glaube',
      q: 'Wie heißt Abraham im Islam?',
      o: ['Ibrahim', 'Imam', 'Iftar'],
      a: 0,
      why: 'Abraham und Ibrahim sind zwei Namen für denselben Mann.',
    },
    {
      id: 'relt1',
      mod: 'lt',
      g: 'glaube',
      q: 'Juden, Christen und Muslime glauben an einen einzigen ___.',
      o: ['Gott', 'Monat', 'Kalender'],
      a: 0,
      why: 'Alle drei Religionen erzählen auch von Abraham.',
    },
    {
      id: 'relt2',
      mod: 'lt',
      g: 'glaube',
      q: 'Niemand darf wegen seines Glaubens ___ werden.',
      o: ['ausgelacht', 'eingeladen', 'begrüßt'],
      a: 0,
      why: 'Jeder darf glauben oder nicht glauben.',
    },
    {
      id: 'redef1',
      mod: 'def',
      g: 'glaube',
      q: 'Was ist eine Religion?',
      o: [
        'Menschen glauben an Gott oder Götter, beten und feiern Feste',
        'Ein Kalender mit zwölf Monaten',
        'Ein Fest mit Kuchen und Kerzen',
      ],
      a: 0,
    },
    {
      id: 'redef2',
      mod: 'def',
      g: 'glaube',
      q: 'Was ist eine Weltanschauung?',
      o: [
        'Die Art, wie ein Mensch die Welt sieht und was ihm wichtig ist',
        'Ein Blick durch ein Fernrohr',
        'Eine Reise um die Erde',
      ],
      a: 0,
    },

    // Judaism
    { id: 'rerf5', mod: 'rf', g: 'judentum', q: 'Die heilige Schrift der Juden heißt Tora.', a: true },
    {
      id: 'rerf6',
      mod: 'rf',
      g: 'judentum',
      q: 'Der Schabbat beginnt am Sonntagmorgen.',
      a: false,
      why: 'Der Schabbat beginnt am Freitagabend und endet am Samstagabend.',
    },
    {
      id: 'rerf7',
      mod: 'rf',
      g: 'judentum',
      q: 'Die Tora ist von Hand auf eine lange Rolle geschrieben.',
      a: true,
    },
    {
      id: 'rerf8',
      mod: 'rf',
      g: 'judentum',
      q: 'Die Menora ist ein Leuchter mit zwei Armen.',
      a: false,
      why: 'Die Menora hat sieben Arme.',
    },
    {
      id: 'remc5',
      mod: 'mc',
      g: 'judentum',
      q: 'Wie heißt das Gebetshaus der Juden?',
      o: ['Synagoge', 'Moschee', 'Kirche'],
      a: 0,
      why: 'Die Synagoge ist Gebetshaus und Treffpunkt der Gemeinde.',
    },
    {
      id: 'remc6',
      mod: 'mc',
      g: 'judentum',
      q: 'In welcher Sprache ist die Tora geschrieben?',
      o: ['Hebräisch', 'Arabisch', 'Englisch'],
      a: 0,
      why: 'Arabisch ist die Sprache des Koran.',
    },
    {
      id: 'remc7',
      mod: 'mc',
      g: 'judentum',
      q: 'Wer lehrt eine jüdische Gemeinde und erklärt die Tora?',
      o: ['Die Rabbinerin oder der Rabbiner', 'Der Imam', 'Die Pfarrerin oder der Pfarrer'],
      a: 0,
      why: 'In der Moschee betet der Imam vor.',
    },
    {
      id: 'remc8',
      mod: 'mc',
      g: 'judentum',
      q: 'Was bedeutet das hebräische Wort „Schalom“?',
      o: ['Frieden', 'Licht', 'Brot'],
      a: 0,
      why: '„Schabbat Schalom“ wünscht man sich zum Ruhetag.',
    },
    {
      id: 'relt3',
      mod: 'lt',
      g: 'judentum',
      q: 'Der Schabbat ist der jüdische ___ der Woche.',
      o: ['Ruhetag', 'Markttag', 'Waschtag'],
      a: 0,
      why: 'Er beginnt am Freitagabend und endet am Samstagabend.',
    },
    {
      id: 'relt4',
      mod: 'lt',
      g: 'judentum',
      q: 'Der Davidstern besteht aus zwei ___.',
      o: ['Dreiecken', 'Kreisen', 'Quadraten'],
      a: 0,
      why: 'Die beiden Dreiecke liegen übereinander und bilden einen Stern mit sechs Zacken.',
    },
    {
      id: 'redef3',
      mod: 'def',
      g: 'judentum',
      q: 'Was ist eine Kippa?',
      o: [
        'Eine kleine Kappe, die viele jüdische Männer und Jungen beim Beten tragen',
        'Ein Hefezopf für den Freitagabend',
        'Ein Leuchter mit sieben Armen',
      ],
      a: 0,
    },
    {
      id: 'redef4',
      mod: 'def',
      g: 'judentum',
      q: 'Was ist die Challa?',
      o: ['Ein Hefezopf, den es oft am Schabbat gibt', 'Eine Hütte aus Zweigen', 'Ein Horn zum Blasen'],
      a: 0,
    },
    {
      id: 'redef5',
      mod: 'def',
      g: 'judentum',
      q: 'Was ist eine Synagoge?',
      o: ['Gebetshaus und Treffpunkt einer jüdischen Gemeinde', 'Der Turm einer Moschee', 'Ein Fest im Frühling'],
      a: 0,
    },

    // Jewish festivals
    { id: 'rerf9', mod: 'rf', g: 'juedfeste', q: 'Chanukka dauert acht Tage.', a: true },
    {
      id: 'rerf10',
      mod: 'rf',
      g: 'juedfeste',
      q: 'Rosch ha-Schana ist das jüdische Neujahrsfest. Es wird im Herbst gefeiert.',
      a: true,
    },
    {
      id: 'rerf11',
      mod: 'rf',
      g: 'juedfeste',
      q: 'Pessach erinnert an den Auszug aus Ägypten.',
      a: true,
    },
    {
      id: 'rerf12',
      mod: 'rf',
      g: 'juedfeste',
      q: 'An Chanukka brennen vom ersten Abend an alle Lichter.',
      a: false,
      why: 'Jeden Abend wird ein Licht mehr angezündet. Erst am achten Abend brennen alle.',
    },
    {
      id: 'rerf13',
      mod: 'rf',
      g: 'juedfeste',
      q: 'Das Laubhüttenfest Sukkot wird im Frühling gefeiert.',
      a: false,
      why: 'Sukkot ist im Herbst. Im Frühling ist Pessach.',
    },
    {
      id: 'remc9',
      mod: 'mc',
      g: 'juedfeste',
      q: 'Was isst man an Rosch ha-Schana, damit das neue Jahr gut und süß wird?',
      o: ['Apfel mit Honig', 'Kartoffelpuffer', 'Mazzen'],
      a: 0,
      why: 'Kartoffelpuffer gibt es zu Chanukka, Mazzen an Pessach.',
    },
    {
      id: 'remc10',
      mod: 'mc',
      g: 'juedfeste',
      q: 'Welches flache Brot ohne Sauerteig gibt es an Pessach?',
      o: ['Mazzen', 'Challa', 'Krapfen'],
      a: 0,
      why: 'Die Tora erzählt: Beim Aufbruch aus Ägypten blieb keine Zeit, den Teig gehen zu lassen.',
    },
    {
      id: 'remc11',
      mod: 'mc',
      g: 'juedfeste',
      q: 'Was tun viele Erwachsene an Jom Kippur, dem Versöhnungstag?',
      o: ['Sie fasten und bitten um Vergebung.', 'Sie bauen eine Hütte aus Zweigen.', 'Sie kreiseln mit dem Dreidel.'],
      a: 0,
      why: 'Jom Kippur ist zehn Tage nach dem Neujahrsfest.',
    },
    {
      id: 'remc12',
      mod: 'mc',
      g: 'juedfeste',
      q: 'Woran erinnert das Laubhüttenfest Sukkot?',
      o: ['An die Wanderung durch die Wüste', 'An das Ende des Ramadan', 'An die Geburt von Jesus'],
      a: 0,
      why: 'Die Hütte erinnert an die Zeit unterwegs. Sukkot ist auch ein Erntedankfest.',
    },
    {
      id: 'remc13',
      mod: 'mc',
      g: 'juedfeste',
      q: 'Wer stellt am Sederabend Fragen zur Geschichte vom Auszug aus Ägypten?',
      o: ['Das jüngste Kind', 'Der älteste Gast', 'Niemand, es ist still'],
      a: 0,
      why: 'So lernen die Kinder die Geschichte jedes Jahr neu kennen.',
    },
    {
      id: 'remc14',
      mod: 'mc',
      g: 'juedfeste',
      q: 'Warum gibt es zu Chanukka Kartoffelpuffer und Krapfen?',
      o: [
        'Sie werden in Öl gebacken und erinnern an das Öl im Tempel.',
        'Sie sind rund wie der Mond.',
        'Sie wachsen im Herbst.',
      ],
      a: 0,
      why: 'Erzählt wird: Ein Krug Öl reichte für einen Tag und brannte acht Tage.',
    },
    {
      id: 'relt5',
      mod: 'lt',
      g: 'juedfeste',
      q: 'Jeden Abend von Chanukka brennt ein ___ mehr am Leuchter.',
      o: ['Licht', 'Blatt', 'Stern'],
      a: 0,
      why: 'Am achten Abend brennen alle Lichter.',
    },
    {
      id: 'relt6',
      mod: 'lt',
      g: 'juedfeste',
      q: 'Zum Laubhüttenfest bauen Familien eine ___ mit einem Dach aus Zweigen.',
      o: ['Hütte', 'Brücke', 'Mauer'],
      a: 0,
      why: 'Die Hütte heißt Sukka.',
    },
    {
      id: 'relt7',
      mod: 'lt',
      g: 'juedfeste',
      q: 'Am Neujahrsfest Rosch ha-Schana wird das Widderhorn, der ___, geblasen.',
      o: ['Schofar', 'Dreidel', 'Seder'],
      a: 0,
      why: 'Der Dreidel ist der Kreisel von Chanukka, der Seder der Abend zu Beginn von Pessach.',
    },
    {
      id: 'redef6',
      mod: 'def',
      g: 'juedfeste',
      q: 'Was ist der Sederabend?',
      o: [
        'Der Abend zu Beginn von Pessach, an dem die Geschichte vom Auszug vorgelesen wird',
        'Der letzte Abend von Chanukka',
        'Der Abend nach dem Fasten im Ramadan',
      ],
      a: 0,
    },
    {
      id: 'redef7',
      mod: 'def',
      g: 'juedfeste',
      q: 'Was ist eine Chanukkia?',
      o: [
        'Ein Leuchter mit acht Lichtern und einem neunten zum Anzünden',
        'Ein Kreisel mit vier Seiten',
        'Ein flaches Brot',
      ],
      a: 0,
    },
    {
      id: 'redef8',
      mod: 'def',
      g: 'juedfeste',
      q: 'Was bedeutet „Chag Sameach“?',
      o: ['Frohes Fest', 'Gute Nacht', 'Vielen Dank'],
      a: 0,
    },

    // Christian festivals, short
    { id: 'rerf14', mod: 'rf', g: 'christentum', q: 'An Weihnachten feiern Christen die Geburt von Jesus.', a: true },
    {
      id: 'rerf15',
      mod: 'rf',
      g: 'christentum',
      q: 'Pfingsten ist 50 Tage vor Ostern.',
      a: false,
      why: 'Pfingsten ist 50 Tage nach Ostern.',
    },
    {
      id: 'rerf16',
      mod: 'rf',
      g: 'christentum',
      q: 'Viele orthodoxe Christen feiern Weihnachten am 7. Januar.',
      a: true,
      why: 'Ihre Kirche berechnet die Feste nach einem älteren Kalender.',
    },
    {
      id: 'remc15',
      mod: 'mc',
      g: 'christentum',
      q: 'Was feiern Christen an Ostern?',
      o: ['Die Auferstehung von Jesus', 'Das Ende des Ramadan', 'Das Lichterfest im Winter'],
      a: 0,
      why: 'Christen glauben, dass Jesus von den Toten auferstanden ist.',
    },
    {
      id: 'remc16',
      mod: 'mc',
      g: 'christentum',
      q: 'Welcher Tag ist für Christen der Ruhetag der Woche?',
      o: ['Der Sonntag', 'Der Mittwoch', 'Der Montag'],
      a: 0,
      why: 'Im Judentum ist es der Schabbat von Freitagabend bis Samstagabend.',
    },
    {
      id: 'remc17',
      mod: 'mc',
      g: 'christentum',
      q: 'Welches christliche Fest gilt als Geburtstag der Kirche?',
      o: ['Pfingsten', 'Weihnachten', 'Erntedank'],
      a: 0,
      why: 'Pfingsten ist 50 Tage nach Ostern.',
    },
    {
      id: 'relt8',
      mod: 'lt',
      g: 'christentum',
      q: 'Die heilige Schrift der Christen heißt ___.',
      o: ['Bibel', 'Tora', 'Koran'],
      a: 0,
      why: 'Die Tora ist die heilige Schrift der Juden, der Koran die der Muslime.',
    },
    {
      id: 'relt9',
      mod: 'lt',
      g: 'christentum',
      q: 'Christen feiern Gottesdienst in der ___.',
      o: ['Kirche', 'Synagoge', 'Moschee'],
      a: 0,
      why: 'Die Synagoge ist das Gebetshaus der Juden, die Moschee das der Muslime.',
    },
    {
      id: 'redef9',
      mod: 'def',
      g: 'christentum',
      q: 'Was ist Pfingsten?',
      o: ['Ein christliches Fest 50 Tage nach Ostern', 'Das jüdische Neujahrsfest', 'Der Fastenmonat im Islam'],
      a: 0,
    },

    // Islam
    { id: 'rerf17', mod: 'rf', g: 'islam', q: 'Die heilige Schrift der Muslime heißt Koran.', a: true },
    {
      id: 'rerf18',
      mod: 'rf',
      g: 'islam',
      q: 'Der Koran ist auf Hebräisch geschrieben.',
      a: false,
      why: 'Der Koran ist auf Arabisch geschrieben. Hebräisch ist die Sprache der Tora.',
    },
    { id: 'rerf19', mod: 'rf', g: 'islam', q: 'Muslime nennen Gott Allah.', a: true },
    {
      id: 'rerf20',
      mod: 'rf',
      g: 'islam',
      q: 'In der Moschee behält man die Straßenschuhe im Gebetsraum an.',
      a: false,
      why: 'Vor dem Gebetsraum zieht man die Schuhe aus.',
    },
    {
      id: 'remc18',
      mod: 'mc',
      g: 'islam',
      q: 'Wie heißt das Gebetshaus der Muslime?',
      o: ['Moschee', 'Synagoge', 'Kirche'],
      a: 0,
      why: 'Die Synagoge ist das Gebetshaus der Juden, die Kirche das der Christen.',
    },
    {
      id: 'remc19',
      mod: 'mc',
      g: 'islam',
      q: 'An welchem Tag kommen besonders viele Muslime zum Gebet in die Moschee?',
      o: ['Am Freitag', 'Am Sonntag', 'Am Mittwoch'],
      a: 0,
      why: 'Das Gebet heißt Freitagsgebet.',
    },
    {
      id: 'remc20',
      mod: 'mc',
      g: 'islam',
      q: 'Wer betet in der Moschee vor?',
      o: ['Der Imam', 'Der Rabbiner', 'Der Küster'],
      a: 0,
      why: 'Die Gemeinde betet mit ihm.',
    },
    {
      id: 'remc21',
      mod: 'mc',
      g: 'islam',
      q: 'In Richtung welcher Stadt beten Muslime?',
      o: ['Mekka', 'Rom', 'Berlin'],
      a: 0,
      why: 'In Mekka steht die Heilige Moschee.',
    },
    {
      id: 'relt10',
      mod: 'lt',
      g: 'islam',
      q: 'Der Koran hat 114 Abschnitte. Sie heißen ___.',
      o: ['Suren', 'Mazzen', 'Diyas'],
      a: 0,
      why: 'Mazzen sind Brote an Pessach, Diyas Öllampen zu Diwali.',
    },
    {
      id: 'relt11',
      mod: 'lt',
      g: 'islam',
      q: 'Der hohe, schlanke Turm einer Moschee heißt ___.',
      o: ['Minarett', 'Kirchturm', 'Leuchtturm'],
      a: 0,
      why: 'Das Minarett ist oft schon von Weitem zu sehen.',
    },
    {
      id: 'redef10',
      mod: 'def',
      g: 'islam',
      q: 'Was ist das Freitagsgebet?',
      o: [
        'Das gemeinsame Gebet der Muslime am Freitag in der Moschee',
        'Der jüdische Ruhetag',
        'Ein Fest mit bunten Farben',
      ],
      a: 0,
    },
    {
      id: 'redef11',
      mod: 'def',
      g: 'islam',
      q: 'Was ist ein Imam?',
      o: ['Er betet in der Moschee vor', 'Er bläst das Widderhorn', 'Er läutet die Glocken'],
      a: 0,
    },

    // Ramadan and the Islamic festivals
    { id: 'rerf21', mod: 'rf', g: 'islfeste', q: 'Ramadan ist der Fastenmonat der Muslime.', a: true },
    {
      id: 'rerf22',
      mod: 'rf',
      g: 'islfeste',
      q: 'Im Ramadan müssen auch kleine Kinder und Kranke fasten.',
      a: false,
      why: 'Kinder, Kranke, Schwangere und Reisende müssen nicht fasten.',
    },
    {
      id: 'rerf23',
      mod: 'rf',
      g: 'islfeste',
      q: 'Wer im Ramadan fastet, isst erst nach Sonnenuntergang wieder.',
      a: true,
    },
    {
      id: 'rerf24',
      mod: 'rf',
      g: 'islfeste',
      q: 'Das Fest des Fastenbrechens wird vor dem Ramadan gefeiert.',
      a: false,
      why: 'Es wird gefeiert, wenn der Ramadan zu Ende ist.',
    },
    {
      id: 'rerf25',
      mod: 'rf',
      g: 'islfeste',
      q: 'Zum Opferfest wird Fleisch mit Nachbarn und mit armen Menschen geteilt.',
      a: true,
    },
    {
      id: 'remc22',
      mod: 'mc',
      g: 'islfeste',
      q: 'Wie nennen viele das Fest des Fastenbrechens noch?',
      o: ['Zuckerfest', 'Lichterfest', 'Laubhüttenfest'],
      a: 0,
      why: 'Es gibt viele Süßigkeiten. Ein anderer Name ist Ramadanfest.',
    },
    {
      id: 'remc23',
      mod: 'mc',
      g: 'islfeste',
      q: 'Womit beginnen viele Muslime im Ramadan das Essen am Abend?',
      o: ['Mit Datteln und Wasser', 'Mit Apfel und Honig', 'Mit Kartoffelpuffern'],
      a: 0,
      why: 'Apfel mit Honig gehört zum jüdischen Neujahrsfest.',
    },
    {
      id: 'remc24',
      mod: 'mc',
      g: 'islfeste',
      q: 'An wen erinnert das Opferfest?',
      o: ['An Ibrahim (Abraham)', 'An Siddhartha Gautama', 'An Martin Luther'],
      a: 0,
      why: 'Das Fest erinnert an sein Vertrauen auf Gott.',
    },
    {
      id: 'remc25',
      mod: 'mc',
      g: 'islfeste',
      q: 'Wie lange dauert der Ramadan?',
      o: ['29 oder 30 Tage', '8 Tage', '50 Tage'],
      a: 0,
      why: 'Der Ramadan ist ein Mondmonat.',
    },
    {
      id: 'remc26',
      mod: 'mc',
      g: 'islfeste',
      q: 'Was bedeutet der Gruß „Id Mubarak“?',
      o: ['Gesegnetes Fest', 'Guten Appetit', 'Bis morgen'],
      a: 0,
      why: 'Man wünscht es sich zum Fest des Fastenbrechens und zum Opferfest.',
    },
    {
      id: 'remc27',
      mod: 'mc',
      g: 'islfeste',
      q: 'Womit beginnt das Fest des Fastenbrechens?',
      o: ['Mit einem Gebet in der Moschee', 'Mit einem Umzug mit Laternen', 'Mit dem Blasen des Widderhorns'],
      a: 0,
      why: 'Danach besucht man Verwandte und Freunde.',
    },
    {
      id: 'relt12',
      mod: 'lt',
      g: 'islfeste',
      q: 'Wer im Ramadan fastet, isst und trinkt von der Morgendämmerung bis zum ___ nichts.',
      o: ['Sonnenuntergang', 'Mittag', 'Frühstück'],
      a: 0,
      why: 'Am Abend folgt das Fastenbrechen.',
    },
    {
      id: 'relt13',
      mod: 'lt',
      g: 'islfeste',
      q: 'Zum Fest des Fastenbrechens bekommen Kinder ___.',
      o: ['Geschenke', 'Hausaufgaben', 'Zeugnisse'],
      a: 0,
      why: 'Es gibt auch viele Süßigkeiten. Darum sagen viele Zuckerfest.',
    },
    {
      id: 'relt14',
      mod: 'lt',
      g: 'islfeste',
      q: 'Ramadan ist der ___ Monat im islamischen Kalender.',
      o: ['neunte', 'erste', 'zwölfte'],
      a: 0,
      why: 'Der islamische Kalender hat zwölf Mondmonate.',
    },
    {
      id: 'redef12',
      mod: 'def',
      g: 'islfeste',
      q: 'Was ist der Iftar?',
      o: ['Das Fastenbrechen am Abend im Ramadan', 'Das Gebet am Freitag', 'Der Turm einer Moschee'],
      a: 0,
    },
    {
      id: 'redef13',
      mod: 'def',
      g: 'islfeste',
      q: 'Was bedeutet „fasten“?',
      o: [
        'Eine Zeit lang auf Essen und Trinken oder auf bestimmte Speisen verzichten',
        'Sich besonders schnell bewegen',
        'Ein Fest drei Tage lang feiern',
      ],
      a: 0,
    },
    {
      id: 'redef14',
      mod: 'def',
      g: 'islfeste',
      q: 'Was ist das Opferfest?',
      o: [
        'Der höchste Feiertag im Islam, an dem geteilt und gespendet wird',
        'Das Lichterfest der Hindus',
        'Der jüdische Versöhnungstag',
      ],
      a: 0,
    },

    // world 2: Hinduism
    { id: 're2rf1', w: 2, mod: 'rf', g: 'hindu', q: 'Diwali ist das Lichterfest der Hindus.', a: true },
    {
      id: 're2rf2',
      w: 2,
      mod: 'rf',
      g: 'hindu',
      q: 'Holi wird im Herbst gefeiert.',
      a: false,
      why: 'Holi ist ein Frühlingsfest. Im Herbst ist Diwali.',
    },
    {
      id: 're2rf3',
      w: 2,
      mod: 'rf',
      g: 'hindu',
      q: 'An Holi bewerfen sich die Menschen mit buntem Pulver und Wasser.',
      a: true,
    },
    {
      id: 're2rf4',
      w: 2,
      mod: 'rf',
      g: 'hindu',
      q: 'Die meisten Hindus leben in Indien.',
      a: true,
    },
    {
      id: 're2mc1',
      w: 2,
      mod: 'mc',
      g: 'hindu',
      q: 'Was bedeutet der Name „Diwali“?',
      o: ['Reihe von Lichtern', 'Fest der Farben', 'Neues Jahr'],
      a: 0,
      why: 'An Fenstern und Türen leuchten viele kleine Öllampen.',
    },
    {
      id: 're2mc2',
      w: 2,
      mod: 'mc',
      g: 'hindu',
      q: 'Wofür steht das Licht an Diwali?',
      o: ['Für den Sieg des Lichts über die Dunkelheit', 'Für den längsten Tag im Sommer', 'Für den ersten Schnee'],
      a: 0,
      why: 'Deshalb heißt Diwali auch Lichterfest.',
    },
    {
      id: 're2mc3',
      w: 2,
      mod: 'mc',
      g: 'hindu',
      q: 'Welches Fest der Hindus heißt auch „Fest der Farben“?',
      o: ['Holi', 'Diwali', 'Vesakh'],
      a: 0,
      why: 'An Holi bewerfen sich die Menschen mit buntem Pulver und Wasser.',
    },
    {
      id: 're2mc4',
      w: 2,
      mod: 'mc',
      g: 'hindu',
      q: 'Woraus wird ein Rangoli gelegt?',
      o: ['Aus buntem Pulver oder Blüten', 'Aus Schnee', 'Aus Ziegelsteinen'],
      a: 0,
      why: 'Ein Rangoli liegt als Bodenbild vor der Tür.',
    },
    {
      id: 're2lt1',
      w: 2,
      mod: 'lt',
      g: 'hindu',
      q: 'Zu Diwali leuchten kleine ___ aus Ton an Fenstern und Türen.',
      o: ['Öllampen', 'Glocken', 'Trommeln'],
      a: 0,
      why: 'Die Lampen heißen Diyas.',
    },
    {
      id: 're2lt2',
      w: 2,
      mod: 'lt',
      g: 'hindu',
      q: 'Hindus beten zu Hause und im ___.',
      o: ['Tempel', 'Minarett', 'Kirchturm'],
      a: 0,
      why: 'Das Minarett gehört zur Moschee, der Kirchturm zur Kirche.',
    },
    {
      id: 're2def1',
      w: 2,
      mod: 'def',
      g: 'hindu',
      q: 'Was ist eine Diya?',
      o: ['Eine kleine Öllampe aus Ton', 'Ein Bodenbild aus Pulver', 'Ein Kreisel'],
      a: 0,
    },
    {
      id: 're2def2',
      w: 2,
      mod: 'def',
      g: 'hindu',
      q: 'Was ist ein Rangoli?',
      o: ['Ein buntes Bodenbild vor der Tür', 'Ein Hefezopf', 'Ein hoher Turm'],
      a: 0,
    },

    // Buddhism
    {
      id: 're2rf5',
      w: 2,
      mod: 'rf',
      g: 'buddha',
      q: 'Vesakh ist das wichtigste buddhistische Fest.',
      a: true,
    },
    {
      id: 're2rf6',
      w: 2,
      mod: 'rf',
      g: 'buddha',
      q: '„Buddha“ ist ein Ehrentitel und heißt „der Erwachte“.',
      a: true,
    },
    {
      id: 're2rf7',
      w: 2,
      mod: 'rf',
      g: 'buddha',
      q: 'Vesakh ist jedes Jahr am 24. Dezember.',
      a: false,
      why: 'Vesakh ist an einem Vollmondtag im Frühling, meist im Mai. Der Tag wechselt.',
    },
    {
      id: 're2rf8',
      w: 2,
      mod: 'rf',
      g: 'buddha',
      q: 'Siddhartha Gautama lebte vor etwa 2500 Jahren.',
      a: true,
    },
    {
      id: 're2mc5',
      w: 2,
      mod: 'mc',
      g: 'buddha',
      q: 'Woran erinnert Vesakh?',
      o: ['An Geburt, Erleuchtung und Tod des Buddha', 'An den Auszug aus Ägypten', 'An das Ende des Fastenmonats'],
      a: 0,
      why: 'Vesakh ist das wichtigste buddhistische Fest.',
    },
    {
      id: 're2mc6',
      w: 2,
      mod: 'mc',
      g: 'buddha',
      q: 'Womit werden zu Vesakh Tempel und Straßen geschmückt?',
      o: ['Mit Lichtern, Fahnen und Blumen', 'Mit Schneemännern', 'Mit Ostereiern'],
      a: 0,
      why: 'Viele nehmen sich an diesem Tag auch gute Taten vor.',
    },
    {
      id: 're2mc7',
      w: 2,
      mod: 'mc',
      g: 'buddha',
      q: 'In welchem Land liegt Lumbini, der Geburtsort von Siddhartha Gautama, heute?',
      o: ['In Nepal', 'In Ägypten', 'In Deutschland'],
      a: 0,
      why: 'Er lebte vor etwa 2500 Jahren.',
    },
    {
      id: 're2mc8',
      w: 2,
      mod: 'mc',
      g: 'buddha',
      q: 'Wie viele Speichen hat das Rad der Lehre?',
      o: ['Acht', 'Drei', 'Zwölf'],
      a: 0,
      why: 'Das Rad der Lehre ist ein Zeichen des Buddhismus.',
    },
    {
      id: 're2lt3',
      w: 2,
      mod: 'lt',
      g: 'buddha',
      q: 'Vesakh wird an einem ___ im Frühling gefeiert.',
      o: ['Vollmondtag', 'Regentag', 'Schultag'],
      a: 0,
      why: 'Meist ist das im Mai. Der Tag wechselt von Jahr zu Jahr.',
    },
    {
      id: 're2lt4',
      w: 2,
      mod: 'lt',
      g: 'buddha',
      q: 'Viele Buddhisten sitzen still und üben, ruhig zu werden. Sie ___.',
      o: ['meditieren', 'marschieren', 'musizieren'],
      a: 0,
      why: 'Beim Meditieren übt man, ruhig und aufmerksam zu werden.',
    },
    {
      id: 're2def3',
      w: 2,
      mod: 'def',
      g: 'buddha',
      q: 'Was bedeutet „meditieren“?',
      o: ['Still sitzen und üben, ruhig und aufmerksam zu werden', 'Laut singen und tanzen', 'Ein Fest vorbereiten'],
      a: 0,
    },
    {
      id: 're2def4',
      w: 2,
      mod: 'def',
      g: 'buddha',
      q: 'Was ist das Rad der Lehre?',
      o: ['Ein Zeichen des Buddhismus mit acht Speichen', 'Ein Kreisel für Chanukka', 'Ein Kalender mit zwölf Monaten'],
      a: 0,
    },

    // festivals without a religion
    {
      id: 're2rf9',
      w: 2,
      mod: 'rf',
      g: 'ohne',
      q: 'Die Jugendweihe ist eine Feier ohne Religion.',
      a: true,
    },
    {
      id: 're2rf10',
      w: 2,
      mod: 'rf',
      g: 'ohne',
      q: 'Jede Familie auf der Welt feiert Geburtstag.',
      a: false,
      why: 'Nicht jede Familie feiert jedes Fest. Manche feiern keinen Geburtstag.',
    },
    {
      id: 're2rf11',
      w: 2,
      mod: 'rf',
      g: 'ohne',
      q: 'Die Einschulung feiern Familien mit und ohne Religion.',
      a: true,
    },
    {
      id: 're2rf12',
      w: 2,
      mod: 'rf',
      g: 'ohne',
      q: 'Die Jugendweihe feiern Kinder in der ersten Klasse.',
      a: false,
      why: 'Die Jugendweihe feiern Jugendliche mit etwa 14 Jahren.',
    },
    {
      id: 're2mc9',
      w: 2,
      mod: 'mc',
      g: 'ohne',
      q: 'Was feiern Jugendliche bei der Jugendweihe?',
      o: ['Dass sie erwachsen werden', 'Dass die Ernte eingebracht ist', 'Dass der Winter vorbei ist'],
      a: 0,
      why: 'Sie feiern die Jugendweihe mit etwa 14 Jahren.',
    },
    {
      id: 're2mc10',
      w: 2,
      mod: 'mc',
      g: 'ohne',
      q: 'Welche Feier haben evangelische Jugendliche mit etwa 14 Jahren?',
      o: ['Die Konfirmation', 'Die Einschulung', 'Das Opferfest'],
      a: 0,
      why: 'Die Jugendweihe ist dafür eine Feier ohne Religion.',
    },
    {
      id: 're2mc11',
      w: 2,
      mod: 'mc',
      g: 'ohne',
      q: 'Wie heißt die Feier, mit der jüdische Jungen mit 13 Jahren in die Gemeinde aufgenommen werden?',
      o: ['Bar Mizwa', 'Jugendweihe', 'Vesakh'],
      a: 0,
      why: 'Bei Mädchen heißt die Feier Bat Mizwa.',
    },
    {
      id: 're2mc12',
      w: 2,
      mod: 'mc',
      g: 'ohne',
      q: 'Welches dieser Feste gehört zu keiner Religion?',
      o: ['Der Geburtstag', 'Pessach', 'Diwali'],
      a: 0,
      why: 'Pessach ist ein jüdisches Fest, Diwali ein Fest der Hindus.',
    },
    {
      id: 're2lt5',
      w: 2,
      mod: 'lt',
      g: 'ohne',
      q: 'Zur Einschulung bekommen Kinder in Deutschland eine ___.',
      o: ['Schultüte', 'Öllampe', 'Laubhütte'],
      a: 0,
      why: 'Die Einschulung feiern Familien mit und ohne Religion.',
    },
    {
      id: 're2lt6',
      w: 2,
      mod: 'lt',
      g: 'ohne',
      q: 'Die Jugendweihe wird auch ___ genannt.',
      o: ['Jugendfeier', 'Kinderfest', 'Lichterfest'],
      a: 0,
      why: 'Sie ist eine Feier ohne Religion für Jugendliche mit etwa 14 Jahren.',
    },
    {
      id: 're2def5',
      w: 2,
      mod: 'def',
      g: 'ohne',
      q: 'Was ist die Jugendweihe?',
      o: [
        'Eine Feier ohne Religion für Jugendliche, die erwachsen werden',
        'Ein Gebet am Freitag',
        'Ein Lichterfest im Herbst',
      ],
      a: 0,
    },
    {
      id: 're2def6',
      w: 2,
      mod: 'def',
      g: 'ohne',
      q: 'Was ist ein Feiertag?',
      o: ['Ein Festtag, den viele Menschen gemeinsam begehen', 'Jeder Tag in den Ferien', 'Ein Tag ohne Sonne'],
      a: 0,
    },

    // why dates move
    {
      id: 're2rf13',
      w: 2,
      mod: 'rf',
      g: 'kalender',
      q: 'Der islamische Kalender zählt nach dem Mond.',
      a: true,
    },
    {
      id: 're2rf14',
      w: 2,
      mod: 'rf',
      g: 'kalender',
      q: 'Der Ramadan ist jedes Jahr im selben Monat unseres Kalenders.',
      a: false,
      why: 'Der Ramadan beginnt jedes Jahr etwa 11 Tage früher und wandert durch alle Jahreszeiten.',
    },
    {
      id: 're2rf15',
      w: 2,
      mod: 'rf',
      g: 'kalender',
      q: 'Im Judentum und im Islam beginnt ein Fest schon am Abend vorher.',
      a: true,
      why: 'Der Tag beginnt dort am Abend.',
    },
    {
      id: 're2rf16',
      w: 2,
      mod: 'rf',
      g: 'kalender',
      q: 'Ostern ist jedes Jahr am selben Datum.',
      a: false,
      why: 'Ostern ist am ersten Sonntag nach dem ersten Vollmond im Frühling. Das Datum wechselt.',
    },
    {
      id: 're2rf17',
      w: 2,
      mod: 'rf',
      g: 'kalender',
      q: 'Pessach bleibt immer im Frühling, weil der jüdische Kalender manchmal einen Schaltmonat einfügt.',
      a: true,
    },
    {
      id: 're2mc13',
      w: 2,
      mod: 'mc',
      g: 'kalender',
      q: 'Wie viele Tage hat ein Mondmonat?',
      o: ['29 oder 30', '7', '365'],
      a: 0,
      why: 'Von Neumond zu Neumond vergehen etwa 29 und ein halber Tag.',
    },
    {
      id: 're2mc14',
      w: 2,
      mod: 'mc',
      g: 'kalender',
      q: 'Zwölf Mondmonate sind kürzer als ein Sonnenjahr. Um wie viele Tage ungefähr?',
      o: ['Um 11 Tage', 'Um 1 Tag', 'Um 100 Tage'],
      a: 0,
      why: 'Darum beginnt der Ramadan jedes Jahr etwa 11 Tage früher.',
    },
    {
      id: 're2mc15',
      w: 2,
      mod: 'mc',
      g: 'kalender',
      q: 'Wonach richtet sich der jüdische Kalender?',
      o: ['Nach Mond und Sonne', 'Nur nach der Sonne', 'Nach dem Wetter'],
      a: 0,
      why: 'In manchen Jahren kommt ein Schaltmonat dazu. So bleiben die Feste in ihrer Jahreszeit.',
    },
    {
      id: 're2mc16',
      w: 2,
      mod: 'mc',
      g: 'kalender',
      q: 'Welches dieser Feste hat in unserem Kalender ein festes Datum?',
      o: ['Weihnachten', 'Ostern', 'Der Beginn des Ramadan'],
      a: 0,
      why: 'Weihnachten ist immer am 25. Dezember. Ostern und der Ramadan wandern.',
    },
    {
      id: 're2mc17',
      w: 2,
      mod: 'mc',
      g: 'kalender',
      q: 'Du möchtest wissen, wann der Ramadan in diesem Jahr beginnt. Was tust du?',
      o: ['Ich schaue im Kalender nach.', 'Ich nehme das Datum vom letzten Jahr.', 'Ich rate.'],
      a: 0,
      why: 'Das Datum wechselt jedes Jahr.',
    },
    {
      id: 're2lt7',
      w: 2,
      mod: 'lt',
      g: 'kalender',
      q: 'Bei ___ ist der Mond am Himmel nicht zu sehen.',
      o: ['Neumond', 'Vollmond', 'Halbmond'],
      a: 0,
      why: 'Bei Vollmond ist er ganz rund zu sehen.',
    },
    {
      id: 're2lt8',
      w: 2,
      mod: 'lt',
      g: 'kalender',
      q: 'Unser Kalender richtet sich nach der ___.',
      o: ['Sonne', 'Uhr', 'Schule'],
      a: 0,
      why: 'Ein Sonnenjahr hat 365 Tage, in einem Schaltjahr 366.',
    },
    {
      id: 're2def7',
      w: 2,
      mod: 'def',
      g: 'kalender',
      q: 'Was ist ein Mondkalender?',
      o: [
        'Ein Kalender, dessen Monate dem Lauf des Mondes folgen',
        'Ein Kalender nur für die Nacht',
        'Ein Kalender mit Bildern vom Mond',
      ],
      a: 0,
    },
    {
      id: 're2def8',
      w: 2,
      mod: 'def',
      g: 'kalender',
      q: 'Was ist ein Schaltmonat?',
      o: [
        'Ein zusätzlicher Monat, damit die Feste in ihrer Jahreszeit bleiben',
        'Ein Monat ohne Feiertage',
        'Der kürzeste Monat des Jahres',
      ],
      a: 0,
    },

    // what festivals share
    {
      id: 're2rf18',
      w: 2,
      mod: 'rf',
      g: 'gemeinsam',
      q: 'Licht gehört zu Festen in mehreren Religionen.',
      a: true,
      why: 'Zum Beispiel zu Chanukka, Diwali, Vesakh und zum Advent.',
    },
    {
      id: 're2rf19',
      w: 2,
      mod: 'rf',
      g: 'gemeinsam',
      q: 'Fasten gibt es nur im Islam.',
      a: false,
      why: 'Gefastet wird auch an Jom Kippur und in der christlichen Fastenzeit vor Ostern.',
    },
    {
      id: 're2rf20',
      w: 2,
      mod: 'rf',
      g: 'gemeinsam',
      q: 'Zu einem Fest darf man nur Glück wünschen, wenn man es selbst feiert.',
      a: false,
      why: 'Glück wünschen darf jeder. Viele freuen sich darüber.',
    },
    {
      id: 're2rf21',
      w: 2,
      mod: 'rf',
      g: 'gemeinsam',
      q: 'Zu vielen Festen gehört es, zu teilen und zu spenden.',
      a: true,
    },
    {
      id: 're2mc18',
      w: 2,
      mod: 'mc',
      g: 'gemeinsam',
      q: 'Was haben Chanukka, Diwali und der Advent gemeinsam?',
      o: ['Es werden Lichter angezündet.', 'Es wird gefastet.', 'Sie sind immer am selben Tag.'],
      a: 0,
      why: 'Licht gehört zu Festen in mehreren Religionen.',
    },
    {
      id: 're2mc19',
      w: 2,
      mod: 'mc',
      g: 'gemeinsam',
      q: 'Deine Nachbarin feiert ein Fest, das du nicht kennst. Was passt?',
      o: ['Freundlich fragen, was gefeiert wird', 'Sagen, dass das kein richtiges Fest ist', 'So tun, als wäre nichts'],
      a: 0,
      why: 'Die meisten Menschen erzählen gern von ihrem Fest.',
    },
    {
      id: 're2mc20',
      w: 2,
      mod: 'mc',
      g: 'gemeinsam',
      q: 'Viele Feste erzählen eine alte Geschichte weiter. Wie nennt man das?',
      o: ['Erinnern', 'Vergessen', 'Verschieben'],
      a: 0,
      why: 'Pessach erinnert an den Auszug aus Ägypten, Weihnachten an die Geburt von Jesus.',
    },
    {
      id: 're2mc21',
      w: 2,
      mod: 'mc',
      g: 'gemeinsam',
      q: 'Was gehört zu fast jedem Fest, egal in welcher Religion?',
      o: ['Familie und Freunde kommen zusammen.', 'Alle bleiben allein zu Hause.', 'Niemand isst etwas.'],
      a: 0,
      why: 'Feste werden fast immer gemeinsam gefeiert.',
    },
    {
      id: 're2lt9',
      w: 2,
      mod: 'lt',
      g: 'gemeinsam',
      q: 'Ich achte, was anderen wichtig ist. Das nennt man ___.',
      o: ['Respekt', 'Neid', 'Eile'],
      a: 0,
      why: 'Respekt gilt auch dann, wenn man etwas anders sieht.',
    },
    {
      id: 're2lt10',
      w: 2,
      mod: 'lt',
      g: 'gemeinsam',
      q: 'Zu fast allen Festen kommen Familie und Freunde ___.',
      o: ['zusammen', 'zu spät', 'allein'],
      a: 0,
      why: 'Das haben fast alle Feste gemeinsam.',
    },
    {
      id: 're2def9',
      w: 2,
      mod: 'def',
      g: 'gemeinsam',
      q: 'Was bedeutet „Respekt“?',
      o: [
        'Achten, was anderen wichtig ist, auch wenn man es anders sieht',
        'Immer derselben Meinung sein wie alle anderen',
        'Über Fremdes lachen',
      ],
      a: 0,
    },
    {
      id: 're2def10',
      w: 2,
      mod: 'def',
      g: 'gemeinsam',
      q: 'Was ist ein Brauch?',
      o: [
        'Etwas, das Menschen zu einem Fest immer wieder auf dieselbe Weise tun',
        'Ein Werkzeug zum Brotbacken',
        'Ein Tag ohne Schule',
      ],
      a: 0,
    },

    ...SACHEN.map(([id, x, a, g, why]) => ({
      id: 'rew_' + id,
      mod: 'welche',
      g,
      q: `Zu welcher Religion gehört ${x}?`,
      o: WELCHE[0],
      a,
      why,
    })),
    ...SACHEN2.map(([id, x, a, g, why]) => ({
      id: 'rew2_' + id,
      w: 2,
      mod: 'welche',
      g,
      q: `Wozu gehört ${x}?`,
      o: WELCHE[1],
      a,
      why,
    })),
    ...BILDER.map(([id, w, g, , q, right, wrong, why]) => ({
      id: 'rebi_' + id,
      ...(w === 2 ? { w } : {}),
      mod: 'bild',
      g,
      q,
      o: [right, ...wrong],
      a: 0,
      why,
    })),
  ];

  const MODULES = Object.assign({}, K.MODES.ethik.modules, {
    welche: { name: 'Welche Religion?', icon: '🗂️', maxTier: 1, worldCap: [1, 1], dmg: 12 },
    bild: { name: 'Was zeigt das Bild?', icon: '🔎', maxTier: 1, worldCap: [1, 1], dmg: 12 },
  });
  const TUT = {
    'rf:1': {
      title: 'Richtig oder falsch',
      steps: [
        'Lies den Satz genau.',
        'Stimmt er mit dem, was du über die Feste und Religionen gelernt hast? Dann „Richtig“.',
        'Ist etwas vertauscht, zum Beispiel die Jahreszeit oder die Religion? Dann „Falsch“.',
      ],
    },
    'mc:1': {
      title: 'Wähle aus',
      steps: [
        'Lies die Frage. Nur eine Antwort stimmt.',
        'Überlege zuerst: Um welches Fest oder welche Religion geht es?',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'lt:1': {
      title: 'Lückentext',
      steps: [
        'Im Satz fehlt ein Wort (___).',
        'Lies den Satz mit jedem Wort einmal durch.',
        'Tippe auf das Wort, das passt.',
      ],
    },
    'def:1': {
      title: 'Begriffe',
      steps: [
        'Hier geht es um wichtige Wörter wie Synagoge, Kippa, Iftar, Diya, Jugendweihe, Mondkalender und Respekt.',
        'Überlege, was das Wort bedeutet.',
        'Tippe auf die richtige Erklärung.',
      ],
    },
    'ord:1': {
      title: 'Reihenfolge',
      steps: [
        'Vier Teile sind durcheinander: Feste im Jahr, Tage im Ramadan, eine Erzählung, Mondphasen oder Feste im Leben.',
        'Tippe sie in der richtigen Reihenfolge an: Was kommt zuerst?',
        'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
    'welche:1': {
      title: 'Welche Religion?',
      steps: [
        'Du liest ein Fest, ein Gebäude, eine Schrift oder ein Zeichen.',
        'Überlege: Zu welcher Religion gehört es? Die drei Knöpfe stehen immer in derselben Reihenfolge.',
        'Beispiel „die Synagoge“: Dort beten Jüdinnen und Juden. Also tippst du auf „Judentum“.',
        'In Welt 2 gibt es auch den Knopf „Zu keiner Religion“, zum Beispiel für den Geburtstag.',
      ],
    },
    'bild:1': {
      title: 'Was zeigt das Bild?',
      steps: [
        'Schau dir das Bild genau an: Ist es ein Gebäude, ein Zeichen oder etwas, das zu einem Fest gehört?',
        'Zähle nach, wenn es hilft: Die Chanukkia hat acht Lichter und eines in der Mitte, das Rad der Lehre acht Speichen.',
        'Lies die Frage und tippe auf die Antwort, die zum Bild passt.',
      ],
    },
  };
  const STARTERS = [
    {
      id: 'kalendermacherin',
      type: 'normal',
      shape: 'kalendermacherin',
      names: ['Die Kalendermacherin', 'Die Kalendermacherin', 'Die Kalendermacherin'],
      hp: 70,
      desc: 'Sie druckt einen Kalender für die ganze Straße. Darin stehen die Feste aller Nachbarn.',
      perk: 'none',
      attacks: [
        { name: 'Kalenderblatt', mod: 'rf' },
        { name: 'Abreißblock', mod: 'mc' },
        { name: 'Karteireiter', mod: 'welche' },
        { name: 'Bildkalender', mod: 'bild' },
      ],
    },
  ];
  const WORLD_ATTACKS = {
    2: [
      { name: 'Mondkalender', mod: 'lt' },
      { name: 'Nachschlageheft', mod: 'def' },
      { name: 'Jahresplaner', mod: 'ord' },
      { name: 'Wandkalender', mod: 'bild' },
    ],
  };
  const EXTRA = {
    rf: 'Merkzettel',
    mc: 'Terminkarte',
    lt: 'Setzkasten',
    def: 'Wörterliste',
    ord: 'Wochenplan',
    welche: 'Stempelkissen',
    bild: 'Druckstock',
  };
  // party things with nothing religious about them
  const ENEMIES = {
    1: {
      normal: [
        { name: 'Die Wimpelkette', type: 'normal', shape: 'wimpelkette', hp: 26, atk: 3 },
        { name: 'Der Konfettiregen', type: 'wasser', shape: 'konfettiregen', hp: 24, atk: 4 },
        { name: 'Der Papierhut', type: 'feuer', shape: 'papierhut', hp: 28, atk: 4 },
        { name: 'Die Luftschlange', type: 'pflanze', shape: 'luftschlange', hp: 30, atk: 3 },
      ],
      elite: { name: 'Die Tröte', type: 'normal', shape: 'troete', hp: 45, atk: 5 },
      boss: {
        name: 'Die große Trommel',
        acc: 'die große Trommel',
        type: 'normal',
        shape: 'grossetrommel',
        hp: 70,
        atk: 6,
        boss: true,
      },
    },
    2: {
      normal: [
        { name: 'Der Luftballon', type: 'wasser', shape: 'luftballon', hp: 42, atk: 5 },
        { name: 'Die Wunderkerze', type: 'feuer', shape: 'wunderkerze', hp: 40, atk: 6 },
        { name: 'Das Windrad', type: 'normal', shape: 'windrad', hp: 44, atk: 5 },
        { name: 'Die Girlande', type: 'pflanze', shape: 'girlande', hp: 38, atk: 6 },
      ],
      elite: { name: 'Das Knallbonbon', type: 'normal', shape: 'knallbonbon', hp: 70, atk: 8 },
      boss: {
        name: 'Das Feuerwerk',
        acc: 'das Feuerwerk',
        type: 'feuer',
        shape: 'feuerwerk',
        hp: 110,
        atk: 9,
        boss: true,
      },
    },
  };
  const MOVES = [
    'Papierschnipsel',
    'Tusch',
    'Paukenschlag',
    'Knoten',
    'Funkenregen',
    'Fahnenschlag',
    'Knall',
    'Dauerton',
  ];
  const HELP = 'Hol dir Hilfe bei einem Erwachsenen.';
  // dilemma cards: no right or wrong, every choice gets the same reward
  const EVENTS = [
    {
      w: 1,
      title: 'Das Klassenfrühstück',
      dilemma: true,
      reward: { hp: 5 },
      text: 'Eure Klasse plant für Freitag ein großes Frühstück. Elif sagt: „An dem Tag faste ich mit meiner Familie. Ich möchte es dieses Jahr ausprobieren.“',
      opts: [
        {
          label: 'Ich frage Elif, was ihr am liebsten wäre.',
          then: 'Elif überlegt. Sie möchte dabei sein und packt sich ihren Teil für den Abend ein.',
          think: 'Warum ist es gut, erst zu fragen, statt für jemanden zu entscheiden?',
        },
        {
          label: 'Ich schlage vor, das Frühstück zu verschieben.',
          then: 'Die Klasse stimmt ab. Das Frühstück findet zwei Wochen später statt, nach dem Fest.',
          think: 'Wann ist es fair, dass viele auf eine Rücksicht nehmen?',
        },
        {
          label: 'Ich sage: „Dann isst du eben nichts.“',
          then: 'Elif nickt, aber sie schaut auf ihren Tisch. Am Freitag sitzt sie am Rand.',
          think: 'Wie fühlt es sich an, wenn alle feiern und man selbst danebensitzt?',
        },
      ],
    },
    {
      w: 1,
      title: 'Die Kippa',
      dilemma: true,
      reward: { hp: 5 },
      text: 'Auf dem Schulfest trägt Davids großer Bruder eine Kippa. Zwei Kinder zeigen auf ihn und lachen über die Kappe.',
      opts: [
        {
          label: 'Ich sage: „Hört auf. Die Kippa gehört zu seinem Glauben.“',
          then: 'Die beiden werden still. David schaut dich an und lächelt kurz.',
          think: 'Warum braucht es Mut, so etwas laut zu sagen?',
        },
        {
          label: HELP,
          then: 'Eine Lehrerin spricht mit den beiden Kindern. Später erklärt Davids Bruder, warum er die Kippa trägt.',
          think: 'Wann ist es richtig, einen Erwachsenen dazuzuholen?',
        },
        {
          label: 'Ich lache mit, damit ich nicht auffalle.',
          then: 'David sieht es. In der nächsten Pause geht er dir aus dem Weg.',
          think: 'Was macht Mitlachen mit dem, über den gelacht wird?',
        },
      ],
    },
    {
      w: 1,
      title: 'Das Kopftuch',
      dilemma: true,
      reward: { hp: 5 },
      text: 'Samiras Mutter holt sie von der Schule ab. Sie trägt ein Kopftuch. Ein Kind aus der Nachbarklasse ruft: „Wie sieht die denn aus?“ und lacht über sie.',
      opts: [
        {
          label: 'Ich stelle mich neben Samira und sage: „Lass das.“',
          then: 'Das Kind verstummt. Samira hakt sich bei ihrer Mutter ein und winkt dir zu.',
          think: 'Was hilft jemandem, über dessen Familie gelacht wird?',
        },
        {
          label: HELP,
          then: 'Der Hausmeister hat es gehört und geht mit dem Kind zur Lehrerin.',
          think: 'Warum ist Hilfe holen kein Petzen, wenn jemand verletzt wird?',
        },
        {
          label: 'Ich tue so, als hätte ich nichts gehört.',
          then: 'Samira geht schnell zum Tor. Am nächsten Tag ist sie sehr still.',
          think: 'Was bedeutet es für Samira, wenn niemand etwas sagt?',
        },
      ],
    },
    {
      w: 1,
      title: 'Der Geburtstag',
      dilemma: true,
      reward: { hp: 5 },
      text: 'Du verteilst Einladungen zu deinem Geburtstag. Jonas sagt: „Danke, aber in meiner Familie feiern wir keine Geburtstage.“',
      opts: [
        {
          label: 'Ich frage, ob wir uns an einem anderen Tag treffen.',
          then: 'Jonas strahlt. Am Samstag darauf baut ihr zusammen eine Bude im Garten.',
          think: 'Wie kann man befreundet sein, auch wenn man nicht dasselbe feiert?',
        },
        {
          label: 'Ich frage Jonas, was seine Familie gern zusammen macht.',
          then: 'Jonas erzählt von einem großen Familientreffen im Sommer. Du hörst zu.',
          think: 'Was erfährt man, wenn man freundlich nachfragt?',
        },
        {
          label: 'Ich sage: „Das ist ja komisch.“',
          then: 'Jonas wird rot und geht weg. Über seine Familie spricht er danach nicht mehr mit dir.',
          think: 'Was ist der Unterschied zwischen „anders“ und „komisch“?',
        },
      ],
    },
    {
      w: 1,
      title: 'Die Einladung',
      dilemma: true,
      reward: { hp: 5 },
      text: 'Noa lädt dich zu Chanukka zu sich nach Hause ein. Du warst noch nie bei so einem Fest und weißt nicht, was dich erwartet.',
      opts: [
        {
          label: 'Ich gehe hin und frage, wenn ich etwas nicht kenne.',
          then: 'Du siehst zu, wie die Lichter angezündet werden. Noa zeigt dir den Kreisel, und es gibt Kartoffelpuffer.',
          think: 'Was kann man als Gast bei einem Fest lernen, das man nicht kennt?',
        },
        {
          label: 'Ich frage Noa vorher, wie das Fest abläuft.',
          then: 'Noa erzählt von den acht Abenden. Jetzt freust du dich auf den Besuch.',
          think: 'Warum fühlt man sich sicherer, wenn man vorher etwas weiß?',
        },
        {
          label: 'Ich sage ab, weil mir das zu fremd ist.',
          then: 'Du bleibst zu Hause. Am Montag erzählen die anderen vom Kreiseln.',
          think: 'Was verpasst man, wenn man Unbekanntem aus dem Weg geht?',
        },
      ],
    },
    {
      w: 1,
      title: 'Die große Frage',
      dilemma: true,
      reward: { hp: 5 },
      text: 'In der Pause streiten Mia und Karim. Mia sagt: „Gott gibt es nicht.“ Karim sagt: „Doch, natürlich!“ Beide werden laut.',
      opts: [
        {
          label: 'Ich sage: „Jeder von euch darf das für sich entscheiden.“',
          then: 'Die beiden schauen sich an. Mia sagt: „Stimmt. Erzählen darfst du mir trotzdem davon.“',
          think: 'Kann man verschiedener Meinung sein und trotzdem befreundet bleiben?',
        },
        {
          label: 'Ich frage beide, warum sie das denken.',
          then: 'Karim erzählt vom Beten mit seinem Opa, Mia von ihren Fragen an den Sternenhimmel. Keiner schreit mehr.',
          think: 'Was ändert sich, wenn man zuhört, statt recht haben zu wollen?',
        },
        {
          label: 'Ich sage, wer von beiden recht hat.',
          then: 'Jetzt streiten drei. Die Pause ist vorbei, und keiner hat den anderen überzeugt.',
          think: 'Gibt es Fragen, die niemand für alle entscheiden kann?',
        },
      ],
    },
    {
      w: 1,
      title: 'Das Wichteln',
      dilemma: true,
      reward: { hp: 5 },
      text: 'Eure Klasse wichtelt im Dezember. Aylin sagt: „Wir feiern kein Weihnachten. Darf ich trotzdem mitmachen?“',
      opts: [
        {
          label: 'Ich sage: „Klar, schenken darf jeder.“',
          then: 'Aylin zieht einen Zettel. Ihr Geschenk ist ein selbst gebasteltes Lesezeichen.',
          think: 'Gehört Schenken nur zu einem einzigen Fest?',
        },
        {
          label: 'Ich frage Aylin, zu welchem Fest sie Geschenke bekommt.',
          then: 'Aylin erzählt vom Fest nach dem Ramadan. Die Lehrerin trägt es in den Klassenkalender ein.',
          think: 'Welche Feste der Kinder aus deiner Klasse kennst du?',
        },
        {
          label: 'Ich sage: „Das ist nur für die, die Weihnachten feiern.“',
          then: 'Aylin setzt sich an ihren Platz. Beim Wichteln schaut sie aus dem Fenster.',
          think: 'Wer bestimmt, wer bei einem Klassenfest dazugehört?',
        },
      ],
    },
    {
      w: 1,
      title: 'Der Stadtrundgang',
      text: 'Eine Stadtführerin zeigt eurer Klasse die Synagoge. Sie stellt dir eine Frage und leiht dir einen Schild.',
      opts: [
        { label: 'Antworten', task: 'any', g: 'judentum', win: { item: 'schild' }, lose: { hp: -5 } },
        { label: 'Weitergehen', effect: {} },
      ],
    },
    {
      w: 1,
      title: 'Der lange Tisch',
      text: 'Im Hof der Moschee wird am Abend ein langer Tisch gedeckt. Ein Mann fragt dich etwas zum Ramadan und schenkt dir einen Trank.',
      opts: [
        { label: 'Antworten', task: 'any', g: 'islfeste', win: { item: 'trank' }, lose: { hp: -6 } },
        { label: 'Weitergehen', effect: {} },
      ],
    },
    {
      w: 1,
      title: 'Die Druckerei',
      text: 'In der Druckerei sind Kalenderblätter von drei Religionen durcheinandergeraten. Die Druckerin bittet dich, ein Blatt einzusortieren.',
      opts: [
        { label: 'Sortieren', task: 'welche', win: { item: 'lupe' }, lose: { hp: -5 } },
        { label: 'Weitergehen', effect: {} },
      ],
    },
    {
      w: 1,
      title: 'Der Bildband',
      text: 'In der Bücherei liegt ein Bildband über Feste. Die Bibliothekarin zeigt auf ein Bild und fragt dich danach.',
      opts: [
        { label: 'Anschauen', task: 'bild', win: { item: 'engel' }, lose: { xp: 5 } },
        { label: 'Weitergehen', effect: {} },
      ],
    },
    {
      w: 1,
      title: 'Die Parkbank',
      text: 'Im Stadtpark steht eine Bank unter einer Kastanie. Hier ruhst du dich aus.',
      opts: [
        { label: 'Ausruhen (+15 LP)', effect: { hp: 15 } },
        { label: 'Weiter', effect: {} },
      ],
    },
    {
      w: 2,
      title: 'Die Gummibärchen',
      dilemma: true,
      reward: { hp: 5 },
      text: 'Auf deinem Geburtstag gibt es Gummibärchen. Ravi sagt: „Die esse ich nicht. In meiner Familie essen wir kein Fleisch, und da ist Gelatine drin.“',
      opts: [
        {
          label: 'Ich schaue nach, was es sonst noch gibt.',
          then: 'In der Küche findest du Obst und Salzstangen. Ravi greift zu.',
          think: 'Wie zeigt ein Gastgeber, dass jeder willkommen ist?',
        },
        {
          label: 'Ich nehme mir vor, Ravi beim nächsten Mal vorher zu fragen.',
          then: 'Ravi nennt dir Fruchtgummi ohne Gelatine. Beim nächsten Fest liegt es auf dem Tisch.',
          think: 'Warum ist Nachfragen besser als Raten?',
        },
        {
          label: 'Ich sage: „Probier doch, merkt ja keiner.“',
          then: 'Ravi schüttelt den Kopf und rückt ein Stück weg.',
          think: 'Warum soll man niemanden zu etwas überreden, das er nicht möchte?',
        },
      ],
    },
    {
      w: 2,
      title: 'Die bunten Fotos',
      dilemma: true,
      reward: { hp: 5 },
      text: 'Meera zeigt Fotos vom Holi-Fest: Alle sind von oben bis unten voller Farbe. Ein Kind sagt: „Igitt, so eine Sauerei!“',
      opts: [
        {
          label: 'Ich frage Meera, wie sich das Farbpulver anfühlt.',
          then: 'Meera lacht: „Weich wie Mehl, und es duftet.“ Mehrere Kinder wollen jetzt die Fotos sehen.',
          think: 'Was passiert, wenn man aus Neugier fragt, statt zu urteilen?',
        },
        {
          label: 'Ich sage: „Beim Faschingsumzug fliegt bei uns auch Konfetti.“',
          then: 'Das andere Kind überlegt. So anders ist das Fest gar nicht.',
          think: 'Welche Feste, die du kennst, sind auch laut und bunt?',
        },
        {
          label: 'Ich verziehe auch das Gesicht.',
          then: 'Meera steckt die Fotos weg. Vom Fest erzählt sie nichts mehr.',
          think: 'Wie fühlt es sich an, wenn andere das eigene Fest eklig nennen?',
        },
      ],
    },
    {
      w: 2,
      title: 'Der Klassenkalender',
      dilemma: true,
      reward: { hp: 5 },
      text: 'Im Klassenkalender stehen Weihnachten und Ostern. Tarek fragt, warum sein Fest nicht darin steht.',
      opts: [
        {
          label: 'Ich schlage vor, die Feste aller Kinder einzutragen.',
          then: 'Am Ende stehen elf Feste im Kalender, dazu alle Geburtstage.',
          think: 'Was erfährt man aus so einem Kalender über die eigene Klasse?',
        },
        {
          label: 'Ich frage Tarek, wann sein Fest ist.',
          then: 'Tarek sagt: „Jedes Jahr an einem anderen Tag.“ Ihr schaut zusammen nach.',
          think: 'Warum wandern manche Feste durch das Jahr?',
        },
        {
          label: 'Ich sage: „Da stehen eben nur die wichtigen Feste.“',
          then: 'Tarek sagt nichts mehr. Für seine Familie ist sein Fest das wichtigste im Jahr.',
          think: 'Wer entscheidet, welches Fest wichtig ist?',
        },
      ],
    },
    {
      w: 2,
      title: 'Zwei Feiern',
      dilemma: true,
      reward: { hp: 5 },
      text: 'Deine Cousine feiert Jugendweihe, der Nachbarsjunge Konfirmation. Ein Freund fragt dich: „Welche von beiden ist denn die richtige Feier?“',
      opts: [
        {
          label: 'Ich sage: „Jede Familie feiert das, was zu ihr passt.“',
          then: 'Dein Freund nickt. Bei beiden Feiern gibt es Musik, Reden und ein großes Essen.',
          think: 'Was haben die beiden Feiern gemeinsam?',
        },
        {
          label: 'Ich frage die beiden, was ihnen an ihrer Feier gefällt.',
          then: 'Deine Cousine erzählt von der Feier im Theater, der Nachbarsjunge vom Gottesdienst. Beide waren aufgeregt.',
          think: 'Warum feiern Menschen, dass jemand erwachsen wird?',
        },
        {
          label: 'Ich sage: „Die, die meine Familie feiert.“',
          then: 'Dein Freund runzelt die Stirn. Seine Familie feiert die andere.',
          think: 'Kann eine Feier für die einen richtig sein und für andere eine andere?',
        },
      ],
    },
    {
      w: 2,
      title: 'Der stille Raum',
      dilemma: true,
      reward: { hp: 5 },
      text: 'Eure Klasse besucht einen Tempel. Im Gebetsraum sitzen Menschen ganz still. Zwei Kinder aus deiner Klasse fangen an zu kichern und zu rennen.',
      opts: [
        {
          label: 'Ich bleibe leise und winke die beiden zu mir.',
          then: 'Die beiden merken, dass alle schauen, und setzen sich neben dich.',
          think: 'Woran merkt man, wie man sich an einem fremden Ort verhält?',
        },
        {
          label: 'Ich sage es leise der Lehrerin.',
          then: 'Die Lehrerin geht mit den beiden kurz nach draußen. Danach hört ihr alle der Führung zu.',
          think: 'Warum ist Rücksicht an einem Ort wichtig, der anderen viel bedeutet?',
        },
        {
          label: 'Ich renne mit.',
          then: 'Ein Mann steht auf und geht. Die Führung endet früher als geplant.',
          think: 'Wie würdest du dir Gäste bei einem Fest deiner Familie wünschen?',
        },
      ],
    },
    {
      w: 2,
      title: 'Die Sternwarte',
      text: 'In der Sternwarte zeigt eine Forscherin den Mond durch das Fernrohr. Sie fragt dich etwas zum Kalender und leiht dir eine Lupe.',
      opts: [
        { label: 'Antworten', task: 'any', g: 'kalender', win: { item: 'lupe' }, lose: { hp: -5 } },
        { label: 'Weitergehen', effect: {} },
      ],
    },
    {
      w: 2,
      title: 'Der Blumenstand',
      text: 'Am Blumenstand werden Blütenketten für ein Lichterfest gebunden. Die Händlerin fragt dich nach den Festen der Hindus und schenkt dir einen Trank.',
      opts: [
        { label: 'Antworten', task: 'any', g: 'hindu', win: { item: 'trank' }, lose: { hp: -6 } },
        { label: 'Weitergehen', effect: {} },
      ],
    },
    {
      w: 2,
      title: 'Das Fotoalbum',
      text: 'Eine Nachbarin blättert in ihrem Fotoalbum: Einschulung, Jugendweihe, Hochzeit. Sie fragt dich etwas dazu.',
      opts: [
        { label: 'Antworten', task: 'any', g: 'ohne', win: { item: 'engel' }, lose: { xp: 5 } },
        { label: 'Weitergehen', effect: {} },
      ],
    },
    {
      w: 2,
      title: 'Der Stadtbrunnen',
      text: 'Am Brunnen auf dem Marktplatz ist es kühl. Hier ruhst du dich aus.',
      opts: [
        { label: 'Ausruhen (+15 LP)', effect: { hp: 15 } },
        { label: 'Weiter', effect: {} },
      ],
    },
  ];

  // welche: the fixed buttons of the world; bild: the question with its picture
  const gen = (mod: string, tier: number, know: Know, seqNow: number, opts?: GenOpts) => {
    if (mod !== 'welche' && mod !== 'bild') return null;
    const world = (opts && opts.world) || 1;
    let cands = POOL.filter((p) => p.mod === mod && (p.w || 1) === world);
    if (opts && opts.g) {
      const topic = cands.filter((p) => p.g === opts.g);
      if (topic.length) cands = topic;
    }
    const e = weightedPick(cands, know, seqNow);
    const answer = e.o![e.a as number];
    return {
      kind: 'choice',
      mod,
      tier: 1,
      group: mod + ':1',
      note: e.g,
      q: e.q,
      options: mod === 'welche' ? e.o!.slice() : shuffle(e.o!.slice()),
      answer,
      why: e.why || '',
      qid: e.id,
      cols: 1,
      ...(mod === 'bild' ? { pic: PICS[PIC_OF[e.id]]() } : {}),
    };
  };

  const MODE = {
    modules: MODULES,
    starters: STARTERS,
    extra: EXTRA,
    enemies: ENEMIES,
    events: EVENTS,
    moves: MOVES,
    tut: TUT,
    notes: NOTES,
    pool: POOL,
    worlds: 2,
    byWorld: true,
    worldAttacks: WORLD_ATTACKS,
    gen,
    grade: 3,
    subject: 'Ethik',
    title: 'Der Festkalender',
    icon: '🏮',
    sub: 'Welt 1: Feste im Judentum, Christentum und Islam. Welt 2: Diwali, Holi, Vesakh, Feste ohne Religion und warum Feste wandern',
    order: [
      {
        items: JAHR_J,
        note: 'juedfeste',
        q: 'Jüdische Feste im Lauf des jüdischen Jahres: Tippe sie in der richtigen Reihenfolge an. Das Jahr beginnt im Herbst.',
        qid: 'rej_',
      },
      {
        items: RAMADAN,
        note: 'islfeste',
        q: 'Vom Beginn des Ramadan bis zum Fest: Tippe die Teile in der richtigen Reihenfolge an.',
        qid: 'rer_',
      },
      {
        items: AUSZUG,
        note: 'juedfeste',
        q: 'Die Tora erzählt vom Auszug aus Ägypten: Tippe die Teile in der richtigen Reihenfolge an.',
        qid: 'rea_',
      },
      {
        w: 2,
        items: MOND,
        note: 'kalender',
        q: 'Ein Mondmonat beginnt mit dem Neumond: Tippe die Mondphasen in der richtigen Reihenfolge an.',
        qid: 'rem_',
      },
      {
        w: 2,
        items: LEBEN,
        note: 'ohne',
        q: 'Feste im Leben: Tippe sie in der Reihenfolge an, in der ein Mensch sie meist erlebt.',
        qid: 'rel_',
      },
    ],
  };
  K.MODES.religionen = MODE;
  return { MODE, WELCHE, SACHEN, SACHEN2, BILDER, PICS, JAHR_J, RAMADAN, AUSZUG, MOND, LEBEN, HELP };
})();
