// Sachunterricht grade 3: Feuer und Feuerwehr. Not in the Saxon grade 3 plan; the states whose plans name fire, the
// candle and fire safety are listed in lehrplan/quellen-feuer.md, with the fire services' rules the safety tasks follow.
// Every experiment is one an adult does while the child predicts what happens. Registers its unit in MK.MODES.
import type { Unit } from './curriculum.ts';
import { MK as K, type GenOpts, type Know, type Question } from './knowledge.ts';
import { MS as S, type Experiment } from './sachkunde.ts';

// something that goes into the fire (b: it burns; lab: safe for an adult to hold into a candle flame with tongs)
interface Thing {
  id: string;
  label: string;
  ein: string;
  acc: string;
  nom: string;
  b: boolean;
  lab?: boolean;
  why: string;
}
type Side = 'stoff' | 'luft' | 'hitze';

export const MFE = (() => {
  const { shuffle, pick } = K;
  const { NS, STROKE, txt, choice, orderTask, wantsPool } = S;
  const f1 = (v: number) => +v.toFixed(1);

  /* ---------- pictures ---------- */
  const FLAME = '#FF8A3D',
    YELLOW = '#FFD23F',
    WAX = '#F6EED8',
    SMOKE = '#9A96A4';
  // a flame standing on (cx|by), h high
  const flamePath = (cx: number, by: number, h: number) =>
    `M${cx} ${by} Q${f1(cx - 0.5 * h)} ${by} ${f1(cx - 0.36 * h)} ${f1(by - 0.42 * h)} Q${f1(cx - 0.22 * h)} ${f1(by - 0.72 * h)} ${cx} ${by - h} Q${f1(cx + 0.22 * h)} ${f1(by - 0.72 * h)} ${f1(cx + 0.36 * h)} ${f1(by - 0.42 * h)} Q${f1(cx + 0.5 * h)} ${by} ${cx} ${by} Z`;
  const fire = (cx: number, by: number, h: number) =>
    `<path d="${flamePath(cx, by, h)}" fill="${FLAME}" stroke="${STROKE}" stroke-width="2" stroke-linejoin="round"/><path d="${flamePath(cx, by - 1, f1(h * 0.6))}" fill="${YELLOW}"/>`;
  const smoke = (x: number, y: number) =>
    `<path d="M${x} ${y} Q${x - 8} ${y - 10} ${x} ${y - 20} Q${x + 8} ${y - 30} ${x} ${y - 40}" fill="none" stroke="${SMOKE}" stroke-width="4" stroke-linecap="round" opacity=".75"/>`;
  // name tag that stands for the thing itself, as in Strom und Magnete
  const tag = (x: number, y: number, label: string, fill = '#FFE0B2') =>
    `<rect x="${x - 50}" y="${y - 12}" width="100" height="24" rx="12" fill="${fill}" stroke="${STROKE}" stroke-width="2"/>${txt(x, y + 4.5, label, { size: label.length > 11 ? 11.5 : 13 })}`;
  const svg = (box: string, label: string, inner: string) =>
    `<svg ${NS} class="pic" viewBox="${box}" aria-label="${label}">${inner}</svg>`;

  // the fire triangle: fuel at the bottom, oxygen on the left, heat on the right; missing: that side is dashed with a „?“
  const SIDES: { id: Side; name: string; col: string; why: string }[] = [
    {
      id: 'stoff',
      name: 'Brennstoff',
      col: '#8A5530',
      why: 'Ohne Brennstoff wie Holz, Papier oder Wachs gibt es nichts, was brennen kann.',
    },
    { id: 'luft', name: 'Sauerstoff', col: '#3B82F6', why: 'Ohne Sauerstoff aus der Luft geht jedes Feuer aus.' },
    { id: 'hitze', name: 'Hitze', col: '#E5484D', why: 'Ohne genug Hitze fängt nichts Feuer.' },
  ];
  function triangleSVG(missing?: Side) {
    const ends: Record<Side, string> = {
      stoff: 'M90 168 L230 168',
      luft: 'M90 168 L160 26',
      hitze: 'M160 26 L230 168',
    };
    const at: Record<Side, [number, number]> = { stoff: [160, 188], luft: [62, 92], hitze: [258, 92] };
    let s = '';
    for (const x of SIDES)
      s +=
        x.id === missing
          ? `<path d="${ends[x.id]}" stroke="#B8BCC8" stroke-width="5" stroke-dasharray="8 8" stroke-linecap="round"/>`
          : `<path d="${ends[x.id]}" stroke="${STROKE}" stroke-width="11" stroke-linecap="round"/><path d="${ends[x.id]}" stroke="${x.col}" stroke-width="7" stroke-linecap="round"/>`;
    s += missing
      ? `<circle cx="160" cy="126" r="12" fill="${SMOKE}" opacity=".5"/><circle cx="170" cy="112" r="9" fill="${SMOKE}" opacity=".4"/>`
      : fire(160, 150, 56);
    for (const x of SIDES)
      s += x.id === missing ? tag(...at[x.id], '?', '#E9EEF6') : tag(...at[x.id], x.name, '#FFFFFF');
    return svg('0 0 320 204', 'Verbrennungsdreieck', s);
  }

  // a candle as the worksheets draw it; arrow: the part it points to; labels: every part named on the left
  const PARTS = [
    {
      id: 'saum',
      name: 'Flammensaum',
      at: [178, 63],
      why: 'Der Flammensaum ist der äußere Rand der Flamme. Dort ist die Flamme am heißesten.',
    },
    {
      id: 'leucht',
      name: 'Leuchtende Zone',
      at: [160, 46],
      why: 'In der leuchtenden Zone glühen winzige Rußteilchen. Deshalb ist sie hell und gelb.',
    },
    {
      id: 'dunkel',
      name: 'Dunkle Zone',
      at: [153, 78],
      why: 'Um den Docht ist Wachsdampf, der noch nicht brennt. Diese Zone ist dunkel und am kühlsten.',
    },
    { id: 'docht', name: 'Docht', at: [151, 107], why: 'Im Docht steigt das flüssige Wachs nach oben.' },
    {
      id: 'schuessel',
      name: 'Brennschüssel',
      at: [174, 117],
      why: 'In der Brennschüssel sammelt sich das geschmolzene Wachs.',
    },
    { id: 'wachs', name: 'Wachs', at: [178, 160], why: 'Das Wachs ist der Brennstoff der Kerze.' },
  ];
  function candleSVG(arrow?: string, labels?: boolean) {
    let s = `<defs><linearGradient id="feWax" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E8DCB8"/></linearGradient></defs>`;
    s += `<rect x="104" y="198" width="92" height="10" rx="4" fill="#C9A25A" stroke="${STROKE}" stroke-width="2"/>`;
    s += `<rect x="120" y="117" width="60" height="83" rx="4" fill="url(#feWax)" stroke="${STROKE}" stroke-width="2.5"/>`;
    s += `<ellipse cx="150" cy="117" rx="30" ry="5" fill="#F2D27A" stroke="${STROKE}" stroke-width="2"/>`;
    s += `<path d="${flamePath(150, 98, 84)}" fill="#FF9F43" stroke="${STROKE}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<path d="${flamePath(150, 92, 64)}" fill="${YELLOW}"/>`;
    s += `<ellipse cx="150" cy="80" rx="7" ry="12" fill="#6B5A7A"/>`;
    s += `<path d="M137 94 Q150 104 163 94 Q150 98 137 94 Z" fill="#5AA7E8"/>`;
    s += `<path d="M150 116 L150 86" stroke="#3A2A1E" stroke-width="3" stroke-linecap="round"/>`;
    const p = PARTS.find((x) => x.id === arrow);
    if (p) {
      const [x, y] = p.at;
      const d = `M262 ${y} L${x + 8} ${y} M${x + 14} ${y - 7} L${x + 2} ${y} L${x + 14} ${y + 7}`;
      s += `<path d="${d}" fill="none" stroke="${STROKE}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#E0304A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" data-arrow="${p.id}"/>`;
    }
    if (labels)
      PARTS.forEach((x, i) => {
        const ly = [30, 54, 78, 102, 126, 160][i];
        s += `<path d="M108 ${ly - 4} L${300 - x.at[0]} ${x.at[1]}" stroke="${STROKE}" stroke-width="1.5"/><circle cx="${300 - x.at[0]}" cy="${x.at[1]}" r="2.5" fill="${STROKE}"/>`;
        s += txt(104, ly, x.name, { size: 12, anchor: 'end' });
      });
    return svg('0 0 300 212', 'Brennende Kerze', s);
  }

  // a small candle standing on (cx|by): lit, blown out with smoke, or (null) out under a snuffer
  const small = (cx: number, by: number, lit: boolean | null, h = 34) =>
    `<rect x="${cx - 11}" y="${by - h}" width="22" height="${h}" rx="3" fill="${WAX}" stroke="${STROKE}" stroke-width="2"/><path d="M${cx} ${by - h} L${cx} ${by - h - 7}" stroke="#3A2A1E" stroke-width="2.5" stroke-linecap="round"/>${lit ? fire(cx, by - h - 3, 28) : lit === false ? smoke(cx, by - h - 9) : ''}`;
  const glass = (cx: number, by: number, w: number, h: number) =>
    `<path d="M${cx - w / 2} ${by} L${cx - w / 2} ${by - h + 6} Q${cx - w / 2} ${by - h} ${cx - w / 2 + 6} ${by - h} L${cx + w / 2 - 6} ${by - h} Q${cx + w / 2} ${by - h} ${cx + w / 2} ${by - h + 6} L${cx + w / 2} ${by}" fill="#BFE3F5" fill-opacity=".35" stroke="${STROKE}" stroke-width="2.5" stroke-linejoin="round"/><path d="M${cx - w / 2 + 7} ${by - h + 12} L${cx - w / 2 + 7} ${by - 12}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
  const snuffer = (cx: number, by: number) =>
    `<path d="M${cx - 14} ${by} L${cx} ${by - 26} L${cx + 14} ${by} Z" fill="#C9CEDD" stroke="${STROKE}" stroke-width="2.5" stroke-linejoin="round"/><path d="M${cx + 6} ${by - 14} L${cx + 46} ${by - 40}" stroke="${STROKE}" stroke-width="6" stroke-linecap="round"/><path d="M${cx + 6} ${by - 14} L${cx + 46} ${by - 40}" stroke="#C9A25A" stroke-width="2.5" stroke-linecap="round"/>`;
  const TABLE = `<path d="M10 141 L190 141" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>`;
  // what an adult puts over the candle (over: the flame is cut off from the air)
  const COVERS = [
    { id: 'glas', acc: 'ein Glas über', over: true },
    { id: 'huetchen', acc: 'einen Kerzenlöscher auf', over: true },
    { id: 'neben', acc: 'ein Glas neben', over: false },
  ];
  function coverSVG(id: string, after?: boolean) {
    let s = TABLE;
    if (!after) s += small(80, 140, true) + (id === 'huetchen' ? snuffer(150, 140) : glass(150, 140, 50, 74));
    else if (id === 'huetchen') s += small(100, 140, null) + snuffer(100, 106);
    else if (id === 'glas') s += small(100, 140, false) + glass(100, 140, 60, 96);
    else s += small(80, 140, true) + glass(150, 140, 50, 74);
    return svg('0 0 200 150', 'Kerze und Glas', s);
  }
  // two candles, a big glass over the left one, a small glass over the right one; after: the right one is out
  function twoSVG(after?: boolean) {
    const s =
      `<path d="M10 141 L230 141" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>` +
      small(70, 140, true, 24) +
      glass(70, 140, 80, 112) +
      small(170, 140, !after, 24) +
      glass(170, 140, 46, 66);
    return svg('0 0 240 150', 'Zwei Kerzen unter einem großen und einem kleinen Glas', s);
  }
  // a candle that an adult blows out; after: the smoke rises
  function blowSVG(after?: boolean) {
    let s = TABLE;
    if (!after)
      s +=
        small(110, 140, true) +
        `<path d="M30 76 Q50 70 70 78 M26 90 Q50 86 74 92 M32 104 Q50 100 68 106" fill="none" stroke="#8FC6EA" stroke-width="3" stroke-linecap="round"/>`;
    else
      s +=
        small(110, 140, false) +
        smoke(110, 60) +
        `<path d="M150 90 L150 30 M140 42 L150 30 L160 42" fill="none" stroke="${STROKE}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    return svg('0 0 200 150', 'Ausgeblasene Kerze', s);
  }
  // burn: null = before, true = the thing burns, false = it stays as it was
  function tongsSVG(label: string, burn: boolean | null) {
    let s = TABLE + small(100, 140, true);
    s += `<path d="M150 56 L194 24 M150 60 L196 34" stroke="${STROKE}" stroke-width="6" stroke-linecap="round"/><path d="M150 56 L194 24 M150 60 L196 34" stroke="#C9CEDD" stroke-width="2.5" stroke-linecap="round"/>`;
    s += tag(100, 58, label, burn ? '#C9A88A' : '#FFE0B2');
    if (burn) s += fire(80, 48, 30) + fire(116, 48, 24);
    return svg('0 0 200 150', 'Ein Gegenstand in einer Zange über der Kerzenflamme', s);
  }

  /* ---------- things for the generated tasks and the Forscherlabor ---------- */
  const THINGS: Thing[] = [
    {
      id: 'papier',
      label: 'Papier',
      ein: 'Ein Blatt Papier',
      acc: 'ein Blatt Papier',
      nom: 'Das Papier',
      b: true,
      lab: true,
      why: 'Papier wird aus Holz gemacht und brennt leicht.',
    },
    {
      id: 'holz',
      label: 'Holzspan',
      ein: 'Ein trockener Holzspan',
      acc: 'einen trockenen Holzspan',
      nom: 'Der Holzspan',
      b: true,
      lab: true,
      why: 'Trockenes Holz brennt gut.',
    },
    {
      id: 'pappe',
      label: 'Pappe',
      ein: 'Ein Stück Pappe',
      acc: 'ein Stück Pappe',
      nom: 'Die Pappe',
      b: true,
      lab: true,
      why: 'Pappe wird wie Papier aus Holz gemacht.',
    },
    {
      id: 'baumwolle',
      label: 'Baumwollfaden',
      ein: 'Ein Baumwollfaden',
      acc: 'einen Baumwollfaden',
      nom: 'Der Baumwollfaden',
      b: true,
      lab: true,
      why: 'Baumwolle brennt leicht. Auch der Docht einer Kerze ist meist aus Baumwolle.',
    },
    {
      id: 'kork',
      label: 'Korken',
      ein: 'Ein Korken',
      acc: 'einen Korken',
      nom: 'Der Korken',
      b: true,
      lab: true,
      why: 'Kork ist die Rinde der Korkeiche und brennt.',
    },
    {
      id: 'stroh',
      label: 'Stroh',
      ein: 'Ein Büschel Stroh',
      acc: 'ein Büschel Stroh',
      nom: 'Das Stroh',
      b: true,
      why: 'Trockenes Stroh fängt sehr schnell Feuer.',
    },
    {
      id: 'laub',
      label: 'Laub',
      ein: 'Trockenes Laub',
      acc: 'trockenes Laub',
      nom: 'Das trockene Laub',
      b: true,
      why: 'Trockene Blätter brennen leicht.',
    },
    {
      id: 'tuete',
      label: 'Plastiktüte',
      ein: 'Eine Plastiktüte',
      acc: 'eine Plastiktüte',
      nom: 'Die Plastiktüte',
      b: true,
      why: 'Viele Kunststoffe brennen und machen dabei giftigen Rauch.',
    },
    {
      id: 'stein',
      label: 'Kieselstein',
      ein: 'Ein Kieselstein',
      acc: 'einen Kieselstein',
      nom: 'Der Kieselstein',
      b: false,
      lab: true,
      why: 'Steine brennen nicht. Sie werden nur heiß.',
    },
    {
      id: 'murmel',
      label: 'Glasmurmel',
      ein: 'Eine Glasmurmel',
      acc: 'eine Glasmurmel',
      nom: 'Die Glasmurmel',
      b: false,
      lab: true,
      why: 'Glas brennt nicht.',
    },
    {
      id: 'loeffel',
      label: 'Metalllöffel',
      ein: 'Ein Löffel aus Metall',
      acc: 'einen Löffel aus Metall',
      nom: 'Der Metalllöffel',
      b: false,
      lab: true,
      why: 'Der Löffel wird sehr heiß, aber er brennt nicht.',
    },
    {
      id: 'ton',
      label: 'Tonscherbe',
      ein: 'Eine Tonscherbe',
      acc: 'eine Tonscherbe',
      nom: 'Die Tonscherbe',
      b: false,
      lab: true,
      why: 'Ton wird im Ofen gebrannt und brennt danach nicht mehr.',
    },
    {
      id: 'sand',
      label: 'Sand',
      ein: 'Eine Handvoll Sand',
      acc: 'eine Handvoll Sand',
      nom: 'Der Sand',
      b: false,
      why: 'Sand brennt nicht. Mit Sand kann man sogar ein Feuer ersticken.',
    },
    {
      id: 'ziegel',
      label: 'Ziegelstein',
      ein: 'Ein Ziegelstein',
      acc: 'einen Ziegelstein',
      nom: 'Der Ziegelstein',
      b: false,
      why: 'Ziegel sind aus gebranntem Ton und brennen nicht.',
    },
  ];
  // ways to put out a fire and the side of the triangle they take away
  const LOESCH: { id: string; text: string; side: Side; why: string }[] = [
    {
      id: 'deckel',
      text: 'Ein Erwachsener legt einen Deckel auf eine brennende Pfanne.',
      side: 'luft',
      why: 'Unter dem Deckel kommt keine Luft mehr an das Feuer.',
    },
    {
      id: 'decke',
      text: 'Ein Erwachsener legt eine Löschdecke über ein kleines Feuer.',
      side: 'luft',
      why: 'Die Löschdecke hält die Luft vom Feuer fern.',
    },
    {
      id: 'glas',
      text: 'Ein Erwachsener stülpt ein Glas über eine brennende Kerze.',
      side: 'luft',
      why: 'Unter dem Glas wird die Luft verbraucht, und keine neue kommt nach.',
    },
    {
      id: 'huetchen',
      text: 'Ein Erwachsener setzt einen Kerzenlöscher auf die Flamme.',
      side: 'luft',
      why: 'Unter dem Kerzenlöscher fehlt die Luft.',
    },
    {
      id: 'sand',
      text: 'Ein Erwachsener schüttet Sand auf die Glut des Lagerfeuers.',
      side: 'luft',
      why: 'Der Sand deckt die Glut zu, und keine Luft kommt mehr heran.',
    },
    {
      id: 'wasser',
      text: 'Die Feuerwehr spritzt Wasser auf brennendes Holz.',
      side: 'hitze',
      why: 'Das Wasser kühlt das Holz ab.',
    },
    {
      id: 'lager',
      text: 'Ein Erwachsener gießt Wasser auf die Reste des Lagerfeuers.',
      side: 'hitze',
      why: 'Das Wasser kühlt die Glut ab.',
    },
    {
      id: 'schneise',
      text: 'Bei einem Waldbrand schlägt die Feuerwehr eine breite Schneise in den Wald.',
      side: 'stoff',
      why: 'In der Schneise steht kein Holz mehr, das brennen kann.',
    },
    {
      id: 'gas',
      text: 'Ein Erwachsener dreht am Gasherd den Gashahn zu.',
      side: 'stoff',
      why: 'Es strömt kein Gas mehr nach, das brennen kann.',
    },
    {
      id: 'wachs',
      text: 'Das Wachs der Kerze ist ganz aufgebraucht.',
      side: 'stoff',
      why: 'Ohne Wachs hat die Flamme keinen Brennstoff mehr.',
    },
  ];
  // in a fire: what is right and what never is (the rules of the fire services, lehrplan/quellen-feuer.md)
  const DOS = [
    'Sofort aus dem Raum gehen',
    'Die Tür hinter dir schließen',
    'Im Rauch am Boden kriechen',
    'Laut rufen und andere warnen',
    'Einem Erwachsenen Bescheid sagen',
    'Die Treppe nehmen',
    'Draußen zum Sammelplatz gehen',
    'Draußen bleiben, bis die Feuerwehr es erlaubt',
  ];
  const DONTS = [
    'Dich unter dem Bett verstecken',
    'Dich im Schrank verstecken',
    'Den Aufzug nehmen',
    'Dein Lieblingsspielzeug suchen',
    'Zurücklaufen, um etwas zu holen',
    'Die Tür offen lassen',
    'Aufrecht durch den Rauch laufen',
    'Wasser auf brennendes Fett gießen',
  ];
  // what a caller says on the emergency line and the question it answers
  const WS = [
    {
      q: 'Wo ist es?',
      says: ['In der Lindenstraße 4, im zweiten Stock.', 'Im Haus neben dem Bäcker, Hauptstraße 12.'],
    },
    {
      q: 'Was ist passiert?',
      says: [
        'In der Küche brennt es.',
        'Aus dem Keller kommt dichter Rauch.',
        'Auf dem Spielplatz brennt ein Mülleimer.',
      ],
    },
    { q: 'Wer ruft an?', says: ['Hier spricht Mia Schulz.', 'Ich heiße Ben Yilmaz.'] },
    { q: 'Gibt es Verletzte?', says: ['Niemand ist verletzt.', 'Ein Mann hat sich die Hand verbrannt.'] },
  ];
  // the four tasks of the fire service
  const AUFGABEN = [
    {
      name: 'Retten',
      why: 'Retten heißt: Menschen und Tiere aus Gefahr holen.',
      says: [
        'Die Feuerwehr holt Menschen aus einem brennenden Haus.',
        'Die Feuerwehr befreit einen Mann, der im Auto eingeklemmt ist.',
        'Die Feuerwehr holt einen Hund aus dem Eis.',
      ],
    },
    {
      name: 'Löschen',
      why: 'Löschen heißt: ein Feuer ausmachen.',
      says: [
        'Die Feuerwehr spritzt Wasser auf ein brennendes Dach.',
        'Die Feuerwehr bekämpft einen Brand auf dem Feld.',
      ],
    },
    {
      name: 'Bergen',
      why: 'Bergen heißt: Dinge, zum Beispiel ein Auto, aus einer schwierigen Lage holen.',
      says: [
        'Die Feuerwehr hebt nach einem Unfall ein Auto aus dem Graben.',
        'Die Feuerwehr zieht ein gesunkenes Boot aus dem See.',
      ],
    },
    {
      name: 'Schützen',
      why: 'Schützen heißt: Menschen, Häuser und die Umwelt vor Schaden bewahren.',
      says: ['Die Feuerwehr legt Sandsäcke gegen das Hochwasser.', 'Die Feuerwehr streut Bindemittel auf eine Ölspur.'],
    },
  ];

  /* ---------- generated tasks ---------- */
  const NAMES = SIDES.map((x) => x.name);
  function triangleTask(mod: string) {
    const x = pick(SIDES);
    return choice(
      mod,
      'dreieck',
      'Ein Feuer braucht drei Dinge. Welches fehlt im Dreieck?',
      x.name,
      NAMES.filter((n) => n !== x.name),
      'fdr_' + x.id,
      {
        why: x.why,
        pic: triangleSVG(x.id),
      },
    );
  }
  function loeschTask(mod: string) {
    const x = pick(LOESCH);
    const side = SIDES.find((v) => v.id === x.side)!.name;
    return choice(
      mod,
      'loeschen',
      `${x.text} Was fehlt dem Feuer jetzt?`,
      side,
      NAMES.filter((n) => n !== side),
      'flo_' + x.id,
      {
        tier: 2,
        group: mod + ':2',
        why: x.why,
      },
    );
  }
  function candleTask(mod: string) {
    const x = pick(PARTS);
    const wrong = shuffle(PARTS.filter((v) => v !== x)).slice(0, 2);
    return choice(
      mod,
      'flamme',
      'Wie heißt der Teil, auf den der Pfeil zeigt?',
      x.name,
      wrong.map((v) => v.name),
      'fkz_' + x.id,
      { why: x.why, pic: candleSVG(x.id) },
    );
  }
  const BURNS = ['Es brennt', 'Es brennt nicht'];
  function thingTask(mod: string) {
    const burns = Math.random() < 0.5;
    const x = pick(THINGS.filter((v) => v.b === burns));
    return choice(
      mod,
      'brennbar',
      `${x.ein} kommt ins Feuer. Brennt das?`,
      BURNS[x.b ? 0 : 1],
      [BURNS[x.b ? 1 : 0]],
      'fbr_' + x.id,
      {
        options: BURNS,
        cols: 2,
        why: `${x.nom} ${x.b ? 'brennt' : 'brennt nicht'}. ${x.why}`,
      },
    );
  }
  function ruleTask(mod: string) {
    const right = Math.random() < 0.6;
    const [yes, no] = right ? [DOS, DONTS] : [DONTS, DOS];
    const i = Math.floor(Math.random() * yes.length);
    return choice(
      mod,
      'brandfall',
      right ? 'Es brennt im Haus. Was ist richtig?' : 'Es brennt im Haus. Was tust du nie?',
      yes[i],
      shuffle(no).slice(0, 2),
      (right ? 'fbj_' : 'fbn_') + i,
    );
  }
  function wTask(mod: string) {
    const w = pick(WS);
    const says = pick(w.says);
    return choice(
      mod,
      'notruf',
      `Beim Notruf sagst du: „${says}“ Auf welche Frage antwortest du?`,
      w.q,
      shuffle(WS.filter((v) => v !== w).map((v) => v.q)).slice(0, 2),
      'fwf_' + WS.indexOf(w) + w.says.indexOf(says),
    );
  }
  function aufgabeTask(mod: string) {
    const a = pick(AUFGABEN);
    const says = pick(a.says);
    return choice(
      mod,
      'feuerwehr',
      `${says} Welche Aufgabe der Feuerwehr ist das?`,
      a.name,
      shuffle(AUFGABEN.filter((v) => v !== a).map((v) => v.name)).slice(0, 2),
      'fau_' + AUFGABEN.indexOf(a) + a.says.indexOf(says),
      { why: a.why },
    );
  }

  /* ---------- things in order ---------- */
  const steps = (p: string, list: string[]) => list.map((text, i) => ({ id: p + i, text }));
  const KERZE = steps('fk', [
    'Der Docht wird angezündet.',
    'Die Hitze der Flamme schmilzt das Wachs.',
    'Das flüssige Wachs steigt im Docht nach oben.',
    'Oben am Docht wird das Wachs zu Dampf.',
    'Der Wachsdampf brennt, und die Flamme brennt weiter.',
  ]);
  const ALARM = steps('fa', [
    'Der Feueralarm in der Schule klingelt.',
    'Du lässt alles liegen und stehst auf.',
    'Die Klasse geht mit der Lehrerin über den Fluchtweg nach draußen.',
    'Am Sammelplatz stellt ihr euch auf.',
    'Die Lehrerin zählt, ob alle da sind.',
  ]);
  const NOTRUF = steps('fn', [
    'Du bringst dich in Sicherheit.',
    'Du wählst die 112.',
    'Du sagst, wo es brennt und was passiert ist.',
    'Du beantwortest die Fragen der Leitstelle.',
    'Die Leitstelle beendet das Gespräch. Erst dann legst du auf.',
  ]);
  const EINSATZ = steps('fe', [
    'In der Leitstelle kommt ein Notruf an.',
    'Die Leitstelle alarmiert die Feuerwehr.',
    'Die Feuerwehrleute ziehen ihre Schutzkleidung an.',
    'Mit Blaulicht und Martinshorn fahren sie los.',
    'Am Brandort retten sie Menschen und löschen das Feuer.',
    'In der Wache machen sie Fahrzeug und Schläuche wieder bereit.',
  ]);
  const FRUEHER = steps('fh', [
    'In der Steinzeit machen Menschen Feuer mit Feuerstein und Zunder oder mit einem Feuerbohrer.',
    'Im alten Rom löschen Wächter in der Nacht Brände in der Stadt.',
    'Im Mittelalter reichen die Menschen Eimer mit Wasser in einer langen Kette weiter.',
    'Vor etwa 200 Jahren werden die Streichhölzer erfunden.',
    'Vor etwa 175 Jahren entsteht in Berlin die erste Berufsfeuerwehr Deutschlands.',
    'Heute fährt die Feuerwehr mit Löschfahrzeug und Drehleiter.',
  ]);
  // each: question, guess, experiment, observation, result; an adult does every experiment
  const EXPERIMENTS = [
    [
      'Geht eine Kerze unter einem Glas aus?',
      'Ich glaube, ja, weil ihr die Luft fehlt.',
      'Ein Erwachsener stülpt ein Glas über eine brennende Kerze.',
      'Nach kurzer Zeit geht die Flamme aus.',
      'Ohne neue Luft kann die Kerze nicht brennen.',
    ],
    [
      'Brennt ein Kieselstein?',
      'Ich glaube, nein.',
      'Ein Erwachsener hält den Stein mit einer Zange in die Kerzenflamme.',
      'Der Stein wird heiß, aber er brennt nicht.',
      'Ein Kieselstein ist nicht brennbar.',
    ],
    [
      'Fangen dünne Holzspäne schneller Feuer als ein dicker Holzklotz?',
      'Ich glaube, ja, weil sie dünner sind.',
      'Ein Erwachsener hält draußen dünne Späne und einen dicken Klotz an eine Flamme.',
      'Die Späne brennen sofort. Der Klotz fängt kaum Feuer.',
      'Kleine Stücke fangen schneller Feuer als große.',
    ],
  ].map((x, i) => steps(`fx${i}_`, x));
  const experimentTask = (mod: string, i: number) =>
    orderTask(
      mod,
      'versuch:1',
      'versuch',
      'Ein Versuch: Tippe die Sätze in der richtigen Reihenfolge an – Frage, Vermutung, Versuch, Beobachtung, Ergebnis.',
      EXPERIMENTS[i],
      `fxo${i}_`,
      5,
    );

  /* ---------- Notizkarten ---------- */
  const NOTES = {
    dreieck: {
      title: 'Was Feuer braucht',
      lines: [
        'Ein Feuer braucht drei Dinge zur gleichen Zeit: Brennstoff, Sauerstoff und Hitze.',
        'Brennstoff ist alles, was brennen kann, zum Beispiel Holz, Papier, Wachs oder Gas.',
        'Den Sauerstoff bekommt das Feuer aus der Luft.',
        'Hitze braucht es zum Anzünden, zum Beispiel von einem Streichholz.',
        'Zusammen heißen die drei das Verbrennungsdreieck.',
        'Fehlt eines davon, geht das Feuer aus.',
      ],
      fig: triangleSVG(),
    },
    loeschen: {
      title: 'Feuer löschen',
      lines: [
        'Löschen heißt: dem Feuer eines der drei Dinge wegnehmen.',
        'Luft weg: Deckel, Löschdecke, Sand oder ein Glas ersticken die Flamme.',
        'Hitze weg: Wasser kühlt das Feuer ab.',
        'Brennstoff weg: Der Gashahn wird zugedreht, beim Waldbrand wird eine Schneise geschlagen.',
        'Brennendes Fett nie mit Wasser löschen: Das Wasser verdampft sofort und schleudert das brennende Fett heraus. Ein Erwachsener legt einen Deckel auf.',
        'Feuerlöscher sind rot. Benutzen soll sie nur, wer weiß, wie sie funktionieren.',
      ],
    },
    kerze: {
      title: 'Die Kerze',
      lines: [
        'Eine Kerze besteht aus Wachs und einem Docht. Der Docht ist meist aus Baumwolle.',
        'Die Flamme schmilzt das Wachs. In der Brennschüssel oben sammelt es sich.',
        'Das flüssige Wachs steigt im Docht nach oben und wird dort zu Dampf.',
        'Nicht das feste Wachs brennt, sondern der Wachsdampf.',
        'Eine Kerze geht von allein aus, wenn das Wachs aufgebraucht ist.',
      ],
    },
    flamme: {
      title: 'Die Kerzenflamme',
      lines: [
        'Um den Docht liegt die dunkle Zone. Dort ist Wachsdampf, der noch nicht brennt. Sie ist am kühlsten.',
        'Darüber leuchtet die Flamme gelb. Dort glühen winzige Rußteilchen.',
        'Der äußere Rand heißt Flammensaum. Dort ist die Flamme am heißesten.',
        'Unten am Docht ist die Flamme blau.',
      ],
      fig: candleSVG(undefined, true),
    },
    brennbar: {
      title: 'Was brennt?',
      lines: [
        'Brennbar sind zum Beispiel Holz, Papier, Pappe, Stroh, trockenes Laub, Baumwolle und Wachs.',
        'Nicht brennbar sind zum Beispiel Steine, Sand, Glas, Ton und Ziegel.',
        'Ein Löffel aus Metall brennt nicht, er wird aber sehr heiß.',
        'Trockenes brennt besser als Nasses. Kleine, dünne Stücke fangen schneller Feuer als große.',
        'Viele Kunststoffe brennen und machen dabei dicken, giftigen Rauch.',
        'Von Holz bleibt nach dem Verbrennen Asche übrig.',
      ],
    },
    vorsicht: {
      title: 'Vorsicht mit Feuer',
      lines: [
        'Streichhölzer und Feuerzeuge benutzt du nur zusammen mit einem Erwachsenen.',
        'Findest du ein Feuerzeug oder Streichhölzer, gibst du sie einem Erwachsenen.',
        'Eine brennende Kerze lässt man nie allein. Sie steht fest in einem Halter auf einer Unterlage, die nicht brennt, und weit weg von Vorhängen.',
        'Ein Adventskranz wird mit der Zeit trocken und brennt dann sehr leicht.',
        'Ein kleines Feuer kann sich in wenigen Minuten im ganzen Zimmer ausbreiten.',
        'Benzin und Spiritus brennen sehr leicht. Spraydosen können in der Hitze platzen.',
      ],
    },
    brandfall: {
      title: 'Wenn es brennt',
      lines: [
        'Verstecke dich nie. Geh sofort aus dem Raum.',
        'Schließe die Tür hinter dir. So breiten sich Feuer und Rauch langsamer aus.',
        'Rufe laut, warne die anderen und sag einem Erwachsenen Bescheid.',
        'Nimm die Treppe, nie den Aufzug. Er kann stehen bleiben und sich mit Rauch füllen.',
        'Geh draußen zum Sammelplatz und geh nicht zurück, auch nicht für ein Spielzeug oder ein Haustier.',
        'Ist der Weg voller Rauch: zurück in ein Zimmer, Tür zu, am Fenster rufen und winken.',
        'Die Feuerwehr rufst du unter 112, wenn du in Sicherheit bist.',
      ],
    },
    rauch: {
      title: 'Rauch und Rauchmelder',
      lines: [
        'Bei einem Brand ist der Rauch meist gefährlicher als die Flammen. Er ist giftig.',
        'Rauch ist heiß und steigt nach oben. Unten am Boden ist die Luft länger besser.',
        'Deshalb kriechst du in einem verrauchten Raum am Boden.',
        'Im Schlaf riecht man keinen Rauch. Ein Rauchmelder an der Zimmerdecke piept dann laut.',
        'Piept der Rauchmelder, weckst du alle und gehst schnell nach draußen.',
        'Grüne Schilder mit einem laufenden Menschen zeigen den Fluchtweg.',
      ],
    },
    notruf: {
      title: 'Notruf 112',
      lines: [
        'Bei Feuer wählst du die 112. Die Polizei hat die 110.',
        'Die 112 kostet nichts, geht auch ohne Guthaben und gilt in ganz Europa.',
        'Am Telefon meldet sich die Leitstelle.',
        'Am wichtigsten ist, wo es brennt. Dann: Was ist passiert? Wer ruft an? Gibt es Verletzte?',
        'Warte auf weitere Fragen. Leg erst auf, wenn die Leitstelle das Gespräch beendet.',
        'Lern deine Adresse auswendig.',
        'Wer zum Spaß die 112 anruft, blockiert die Leitung für Menschen in Not.',
      ],
    },
    feuerwehr: {
      title: 'Die Feuerwehr',
      lines: [
        'Die vier Aufgaben der Feuerwehr: Retten, Löschen, Bergen, Schützen.',
        'Die meisten Feuerwehrleute in Deutschland arbeiten freiwillig. Bei Alarm eilen sie von ihrer Arbeit ins Gerätehaus.',
        'In großen Städten gibt es auch eine Berufsfeuerwehr mit einer Feuerwache.',
        'Mit dem Atemschutzgerät können Feuerwehrleute im Rauch atmen. Die Wärmebildkamera hilft, Menschen im Rauch zu finden.',
        'Mit der Drehleiter kommt die Feuerwehr an hohe Fenster. Löschwasser holt sie aus dem Hydranten.',
        'Kommt ein Fahrzeug mit Blaulicht und Martinshorn, machst du Platz.',
        'Die Feuerwehr hilft auch bei Unfällen, Sturm und Hochwasser.',
      ],
    },
    frueher: {
      title: 'Feuer früher',
      lines: [
        'Schon in der Steinzeit nutzten Menschen das Feuer: zum Wärmen, für Licht, zum Kochen und gegen wilde Tiere.',
        'Sie machten Feuer mit Feuerstein und Zunder oder rieben Holz mit einem Feuerbohrer heiß.',
        'Im Mittelalter waren viele Häuser aus Holz und standen dicht. Oft brannten ganze Stadtteile ab.',
        'Gelöscht wurde mit Eimern, die die Menschen in einer langen Kette weiterreichten.',
        'Streichhölzer gibt es seit etwa 200 Jahren. Die erste Berufsfeuerwehr Deutschlands entstand vor etwa 175 Jahren in Berlin.',
      ],
    },
    versuch: {
      title: 'Versuche mit Feuer',
      lines: [
        'Versuche mit Feuer machst du nur zusammen mit Erwachsenen.',
        '1. Frage: Was willst du herausfinden?',
        '2. Vermutung: Was glaubst du, bevor es losgeht?',
        '3. Versuch: Ein Erwachsener führt ihn vor, auf einer Unterlage, die nicht brennt. Wasser steht bereit.',
        '4. Beobachtung: Was passiert wirklich?',
        '5. Ergebnis: Was hast du herausgefunden? Stimmte deine Vermutung?',
      ],
    },
  };

  /* ---------- questions ---------- */
  const POOL: Question[] = [
    // what a fire needs, and putting it out
    {
      id: 'fedr1',
      mod: 'dreieck',
      g: 'dreieck',
      q: 'Was braucht ein Feuer zum Brennen?',
      o: ['Brennstoff, Sauerstoff und Hitze', 'Wasser, Sand und Hitze', 'Holz, Wasser und Wind'],
      a: 0,
      why: 'Zusammen heißen diese drei das Verbrennungsdreieck.',
    },
    {
      id: 'fedr2',
      mod: 'dreieck',
      g: 'dreieck',
      q: 'Fehlt eines der drei Dinge, geht das Feuer aus.',
      rf: true,
      a: true,
    },
    {
      id: 'fedr3',
      mod: 'dreieck',
      g: 'dreieck',
      q: 'Wie heißt das Bild mit den drei Dingen, die ein Feuer braucht?',
      o: ['Verbrennungsdreieck', 'Feuerkreis', 'Flammenviereck'],
      a: 0,
      why: 'Die drei Seiten des Dreiecks sind Brennstoff, Sauerstoff und Hitze.',
    },
    {
      id: 'fedr4',
      mod: 'dreieck',
      g: 'dreieck',
      q: 'Was ist bei einem Lagerfeuer der Brennstoff?',
      o: ['Das Holz', 'Die Luft', 'Die Steine rund um das Feuer'],
      a: 0,
      why: 'Das Holz brennt. Die Steine halten das Feuer nur zusammen.',
    },
    {
      id: 'fedr5',
      mod: 'dreieck',
      g: 'dreieck',
      q: 'Woher bekommt ein Feuer den Sauerstoff?',
      o: ['Aus der Luft', 'Aus dem Wasser', 'Aus der Asche'],
      a: 0,
      why: 'Luft besteht zu etwa einem Fünftel aus Sauerstoff.',
    },
    {
      id: 'fedr6',
      mod: 'dreieck',
      g: 'dreieck',
      q: 'Was liefert beim Anzünden einer Kerze die Hitze?',
      o: ['Die Flamme des Streichholzes', 'Das Wachs', 'Der Kerzenhalter'],
      a: 0,
    },
    {
      id: 'fedr7',
      mod: 'dreieck',
      g: 'dreieck',
      q: 'Ein Feuer kann ganz ohne Luft brennen.',
      rf: true,
      a: false,
      why: 'Ohne Sauerstoff aus der Luft geht jedes Feuer aus.',
    },
    {
      id: 'fedr8',
      mod: 'dreieck',
      g: 'dreieck',
      q: 'Eine Kerze geht von allein aus, wenn …',
      o: ['das Wachs aufgebraucht ist', 'es draußen dunkel wird', 'sie zu hell leuchtet'],
      a: 0,
      why: 'Dann fehlt der Brennstoff.',
    },
    {
      id: 'fedr9',
      mod: 'dreieck',
      g: 'loeschen',
      q: 'Warum löscht Wasser ein Feuer?',
      o: ['Es kühlt das Feuer ab', 'Es bringt mehr Luft', 'Es ist ein Brennstoff'],
      a: 0,
      why: 'Wasser nimmt dem Feuer die Hitze.',
    },
    {
      id: 'fedr10',
      mod: 'dreieck',
      g: 'loeschen',
      q: 'Warum geht ein Feuer unter einer Löschdecke aus?',
      o: ['Die Decke hält die Luft ab', 'Die Decke ist nass', 'Die Decke brennt selbst'],
      a: 0,
      why: 'Ohne Luft erstickt das Feuer.',
    },
    {
      id: 'fedr11',
      mod: 'dreieck',
      g: 'loeschen',
      q: 'Warum darf man brennendes Fett nie mit Wasser löschen?',
      o: [
        'Das Wasser verdampft sofort und schleudert brennendes Fett heraus',
        'Das Wasser macht das Fett nur kalt',
        'Das Wasser wird zu Eis',
      ],
      a: 0,
      why: 'Ein Erwachsener legt einen Deckel auf den Topf. So fehlt dem Feuer die Luft.',
    },
    {
      id: 'fedr12',
      mod: 'dreieck',
      g: 'loeschen',
      q: 'Bei einem Waldbrand schlägt die Feuerwehr eine breite Schneise. Was nimmt sie dem Feuer weg?',
      o: ['Den Brennstoff', 'Den Sauerstoff', 'Die Hitze'],
      a: 0,
      why: 'In der Schneise steht kein Holz mehr, das brennen kann.',
    },
    {
      id: 'fedr13',
      mod: 'dreieck',
      g: 'loeschen',
      q: 'Ein Erwachsener dreht am Gasherd den Gashahn zu. Warum geht die Flamme aus?',
      o: ['Es kommt kein Gas mehr nach', 'Es kommt mehr Luft dazu', 'Der Herd wird heiß'],
      a: 0,
      why: 'Ohne Gas hat die Flamme keinen Brennstoff mehr.',
    },
    {
      id: 'fedr14',
      mod: 'dreieck',
      g: 'loeschen',
      q: 'Woran erkennst du einen Feuerlöscher?',
      o: ['Er ist rot', 'Er ist blau und rund', 'Er ist grün und klein'],
      a: 0,
      why: 'Feuerlöscher sind rot, damit man sie schnell findet.',
    },
    {
      id: 'fedr15',
      mod: 'dreieck',
      g: 'loeschen',
      q: 'Wer benutzt einen Feuerlöscher?',
      o: ['Ein Erwachsener, der weiß, wie er funktioniert', 'Jedes Kind, das ihn findet', 'Niemand, er hängt nur da'],
      a: 0,
    },
    {
      id: 'fedr16',
      mod: 'dreieck',
      g: 'loeschen',
      q: 'Unter einem Glas geht eine Kerze aus, weil die Luft darin verbraucht wird und keine neue nachkommt.',
      rf: true,
      a: true,
    },
    // the candle
    {
      id: 'fekz1',
      mod: 'kerze',
      g: 'kerze',
      q: 'Woraus besteht eine Kerze?',
      o: ['Aus Wachs und einem Docht', 'Aus Holz und Papier', 'Aus Glas und Wasser'],
      a: 0,
    },
    {
      id: 'fekz2',
      mod: 'kerze',
      g: 'kerze',
      q: 'Woraus ist der Docht einer Kerze meist?',
      o: ['Aus Baumwolle', 'Aus Draht', 'Aus Plastik'],
      a: 0,
      why: 'Baumwolle saugt das flüssige Wachs gut auf.',
    },
    {
      id: 'fekz3',
      mod: 'kerze',
      g: 'kerze',
      q: 'Was brennt bei einer Kerze eigentlich?',
      o: ['Der Wachsdampf', 'Der Kerzenhalter', 'Das feste Wachs unten'],
      a: 0,
      why: 'Das Wachs schmilzt, steigt im Docht hoch und wird zu Dampf. Dieser Dampf brennt.',
    },
    {
      id: 'fekz4',
      mod: 'kerze',
      g: 'kerze',
      q: 'Ein Klumpen festes Wachs fängt mit einem Streichholz sofort Feuer.',
      rf: true,
      a: false,
      why: 'Das Wachs muss erst schmelzen und zu Dampf werden. Dafür hat die Kerze den Docht.',
    },
    {
      id: 'fekz5',
      mod: 'kerze',
      g: 'kerze',
      q: 'Wie heißt die Mulde mit flüssigem Wachs oben auf der Kerze?',
      o: ['Brennschüssel', 'Wachsdeckel', 'Dochtloch'],
      a: 0,
      why: 'Dort sammelt sich das geschmolzene Wachs, bevor es im Docht hochsteigt.',
    },
    {
      id: 'fekz6',
      mod: 'kerze',
      g: 'kerze',
      q: 'Was passiert mit dem Wachs, während die Kerze brennt?',
      o: ['Es wird weniger, denn es verbrennt', 'Es wird immer mehr', 'Es wird zu Wasser'],
      a: 0,
    },
    {
      id: 'fekz7',
      mod: 'kerze',
      g: 'flamme',
      q: 'Wo ist die Kerzenflamme am heißesten?',
      o: ['Am äußeren Rand, dem Flammensaum', 'In der dunklen Zone am Docht', 'Unten am Kerzenhalter'],
      a: 0,
      why: 'Am Rand bekommt die Flamme am meisten Sauerstoff aus der Luft.',
    },
    {
      id: 'fekz8',
      mod: 'kerze',
      g: 'flamme',
      q: 'Warum ist die Zone direkt um den Docht dunkel?',
      o: ['Dort ist Wachsdampf, der noch nicht brennt', 'Dort ist Asche vom Streichholz', 'Dort ist Wasser'],
      a: 0,
      why: 'Der Dampf kommt gerade erst aus dem Docht und hat noch keine Luft bekommen.',
    },
    {
      id: 'fekz9',
      mod: 'kerze',
      g: 'flamme',
      q: 'Warum leuchtet die Kerzenflamme gelb?',
      o: ['Winzige Rußteilchen glühen darin', 'Das Wachs ist gelb gefärbt', 'Die Luft um die Kerze ist gelb'],
      a: 0,
    },
    {
      id: 'fekz10',
      mod: 'kerze',
      g: 'vorsicht',
      q: 'Eine brennende Kerze lässt man nie allein im Zimmer.',
      rf: true,
      a: true,
    },
    {
      id: 'fekz11',
      mod: 'kerze',
      g: 'vorsicht',
      q: 'Wo steht eine brennende Kerze sicher?',
      o: [
        'Fest in einem Halter, weit weg von Vorhängen',
        'Auf dem Bett',
        'Auf dem Fensterbrett direkt neben der Gardine',
      ],
      a: 0,
      why: 'Ein Vorhang fängt an einer Kerze schnell Feuer.',
    },
    {
      id: 'fekz12',
      mod: 'kerze',
      g: 'vorsicht',
      q: 'Eine Kerze fällt um, und die Tischdecke fängt Feuer. Was tust du?',
      o: ['Sofort einen Erwachsenen rufen', 'Still im Zimmer warten', 'Die Decke unter das Bett schieben'],
      a: 0,
      why: 'Ein Erwachsener weiß, wie man so ein Feuer löscht.',
    },
    {
      id: 'fekz13',
      mod: 'kerze',
      g: 'vorsicht',
      q: 'Wie ist ein Adventskranz nach einigen Wochen?',
      o: ['Trocken, er brennt dann sehr leicht', 'Nass, er kann nicht brennen', 'Hart wie Stein'],
      a: 0,
      why: 'Die Zweige trocknen aus. Darum zündet man trockene Adventskränze nicht mehr an.',
    },
    {
      id: 'fekz14',
      mod: 'kerze',
      g: 'kerze',
      q: 'Wozu dient ein Kerzenlöscher?',
      o: ['Er erstickt die Flamme', 'Er zündet die Kerze an', 'Er macht das Wachs weich'],
      a: 0,
      why: 'Unter dem Hütchen fehlt der Flamme die Luft.',
    },
    {
      id: 'fekz15',
      mod: 'kerze',
      g: 'vorsicht',
      q: 'Brennende Teelichter gehören auf eine Unterlage, die nicht brennt.',
      rf: true,
      a: true,
    },
    {
      id: 'fekz16',
      mod: 'kerze',
      g: 'vorsicht',
      q: 'Wann wird eine Kerze ausgemacht?',
      o: ['Bevor alle das Zimmer verlassen', 'Erst wenn sie ganz heruntergebrannt ist', 'Nie'],
      a: 0,
    },
    // what burns, and care with fire
    {
      id: 'febr1',
      mod: 'brennbar',
      g: 'brennbar',
      q: 'Was brennt?',
      o: ['Papier', 'Ein Kieselstein', 'Eine Glasflasche'],
      a: 0,
    },
    {
      id: 'febr2',
      mod: 'brennbar',
      g: 'brennbar',
      q: 'Was brennt nicht?',
      o: ['Sand', 'Holz', 'Pappe'],
      a: 0,
      why: 'Mit Sand kann man sogar ein Feuer ersticken.',
    },
    {
      id: 'febr3',
      mod: 'brennbar',
      g: 'brennbar',
      q: 'Trockenes Holz brennt besser als nasses Holz.',
      rf: true,
      a: true,
    },
    {
      id: 'febr4',
      mod: 'brennbar',
      g: 'brennbar',
      q: 'Warum brennt nasses Holz schlecht?',
      o: ['Das Wasser darin kühlt es', 'Es ist zu leicht', 'Es hat keine Rinde mehr'],
      a: 0,
      why: 'Erst muss das Wasser verdampfen, dann kann das Holz brennen.',
    },
    {
      id: 'febr5',
      mod: 'brennbar',
      g: 'brennbar',
      q: 'Was fängt schneller Feuer?',
      o: ['Dünne Holzspäne', 'Ein dicker Holzklotz', 'Beide gleich schnell'],
      a: 0,
      why: 'Kleine Stücke werden schneller heiß. Deshalb legt man beim Lagerfeuer zuerst dünne Späne an.',
    },
    {
      id: 'febr6',
      mod: 'brennbar',
      g: 'brennbar',
      q: 'Ein Löffel aus Metall verbrennt in einer Kerzenflamme.',
      rf: true,
      a: false,
      why: 'Er brennt nicht, wird aber sehr heiß.',
    },
    {
      id: 'febr7',
      mod: 'brennbar',
      g: 'brennbar',
      q: 'Was entsteht, wenn Plastik brennt?',
      o: ['Dicker, giftiger Rauch', 'Frische Luft', 'Gar nichts'],
      a: 0,
    },
    {
      id: 'febr8',
      mod: 'brennbar',
      g: 'brennbar',
      q: 'Was bleibt übrig, wenn Holz verbrannt ist?',
      o: ['Asche', 'Sand', 'Wachs'],
      a: 0,
    },
    {
      id: 'febr9',
      mod: 'brennbar',
      g: 'brennbar',
      q: 'Ein Haufen trockenes Laub brennt leicht.',
      rf: true,
      a: true,
    },
    {
      id: 'febr10',
      mod: 'brennbar',
      g: 'vorsicht',
      q: 'Streichhölzer und Feuerzeuge …',
      o: ['benutzt du nur zusammen mit einem Erwachsenen', 'sind Spielzeug', 'nimmst du heimlich mit'],
      a: 0,
      why: 'Allein ist das zu gefährlich. Ein kleines Feuer wird schnell groß.',
    },
    {
      id: 'febr11',
      mod: 'brennbar',
      g: 'vorsicht',
      q: 'Du findest auf dem Schulhof ein Feuerzeug. Was tust du?',
      o: ['Ich gebe es einem Erwachsenen', 'Ich probiere es aus', 'Ich stecke es in meine Tasche'],
      a: 0,
      why: 'Feuerzeuge sind kein Spielzeug. Ein Erwachsener nimmt es an sich.',
    },
    {
      id: 'febr12',
      mod: 'brennbar',
      g: 'vorsicht',
      q: 'Ein kleines Feuer kann sich in wenigen Minuten im ganzen Zimmer ausbreiten.',
      rf: true,
      a: true,
    },
    {
      id: 'febr13',
      mod: 'brennbar',
      g: 'vorsicht',
      q: 'Was gehört nicht neben eine heiße Herdplatte?',
      o: ['Ein Geschirrtuch', 'Ein Topf', 'Ein Deckel'],
      a: 0,
      why: 'Das Tuch kann an der heißen Platte Feuer fangen.',
    },
    {
      id: 'febr14',
      mod: 'brennbar',
      g: 'vorsicht',
      q: 'Was ist in der Nähe von Feuer besonders gefährlich?',
      o: ['Benzin', 'Wasser', 'Sand'],
      a: 0,
      why: 'Benzin brennt sehr leicht. Schon sein Dampf kann Feuer fangen.',
    },
    {
      id: 'febr15',
      mod: 'brennbar',
      g: 'vorsicht',
      q: 'Warum zündet man einen Grill nie mit Spiritus an?',
      o: ['Es gibt eine Stichflamme', 'Der Grill wird nass', 'Das Essen wird kalt'],
      a: 0,
      why: 'Spiritus verdampft schnell. Der Dampf brennt mit einer großen Flamme auf.',
    },
    {
      id: 'febr16',
      mod: 'brennbar',
      g: 'vorsicht',
      q: 'Warum gehören Spraydosen nicht in die Nähe von Feuer?',
      o: ['Sie können in der Hitze platzen', 'Sie werden davon leer', 'Sie verlieren ihre Farbe'],
      a: 0,
    },
    // when there is a fire
    {
      id: 'febf1',
      mod: 'brandfall',
      g: 'rauch',
      q: 'Was ist bei einem Brand meist gefährlicher als die Flammen?',
      o: ['Der Rauch', 'Das Licht', 'Das Knistern'],
      a: 0,
      why: 'Brandrauch ist giftig. Schon wenige Atemzüge können gefährlich sein.',
    },
    {
      id: 'febf2',
      mod: 'brandfall',
      g: 'rauch',
      q: 'Warum kriechst du in einem verrauchten Raum am Boden?',
      o: ['Unten ist die Luft besser', 'Unten ist es heller', 'Unten ist es wärmer'],
      a: 0,
      why: 'Rauch ist heiß und steigt nach oben.',
    },
    {
      id: 'febf3',
      mod: 'brandfall',
      g: 'rauch',
      q: 'Rauch steigt nach oben und sammelt sich zuerst unter der Decke.',
      rf: true,
      a: true,
    },
    {
      id: 'febf4',
      mod: 'brandfall',
      g: 'brandfall',
      q: 'Warum versteckst du dich bei einem Brand nie?',
      o: [
        'Der Rauch kommt überall hin, und die Feuerwehr findet dich schwer',
        'Weil Verstecken langweilig ist',
        'Weil der Schrank zu klein ist',
      ],
      a: 0,
    },
    {
      id: 'febf5',
      mod: 'brandfall',
      g: 'brandfall',
      q: 'Warum schließt du beim Hinausgehen die Tür?',
      o: ['Feuer und Rauch breiten sich langsamer aus', 'Damit es leiser ist', 'Damit es im Flur warm bleibt'],
      a: 0,
      why: 'Eine geschlossene Tür hält Feuer und Rauch eine Zeit lang auf.',
    },
    {
      id: 'febf6',
      mod: 'brandfall',
      g: 'brandfall',
      q: 'Bei einem Brand nimmt man den Aufzug, weil er schneller ist.',
      rf: true,
      a: false,
      why: 'Der Aufzug kann stehen bleiben und sich mit Rauch füllen. Nimm die Treppe.',
    },
    {
      id: 'febf7',
      mod: 'brandfall',
      g: 'brandfall',
      q: 'Dein Weg nach draußen ist voller Rauch. Was tust du?',
      o: [
        'Zurück in ein Zimmer, Tür zu, am Fenster rufen und winken',
        'Schnell durch den Rauch rennen',
        'Mich unter dem Bett verstecken',
      ],
      a: 0,
      why: 'Die Feuerwehr holt dich mit der Leiter am Fenster ab.',
    },
    {
      id: 'febf8',
      mod: 'brandfall',
      g: 'brandfall',
      q: 'Du bist draußen, im Haus brennt es noch. Was tust du?',
      o: ['Ich bleibe draußen', 'Ich hole schnell mein Kuscheltier', 'Ich suche drinnen meine Schuhe'],
      a: 0,
      why: 'Geh nie zurück in ein brennendes Haus. Die Feuerwehr hat Schutzkleidung und Atemschutz.',
    },
    {
      id: 'febf9',
      mod: 'brandfall',
      g: 'brandfall',
      q: 'Wozu gibt es an der Schule einen Sammelplatz?',
      o: ['Dort wird gezählt, ob alle draußen sind', 'Dort ist die Hofpause', 'Dort steht der Feuerlöscher'],
      a: 0,
      why: 'Wer fehlt, könnte noch im Haus sein. Das muss die Feuerwehr wissen.',
    },
    {
      id: 'febf10',
      mod: 'brandfall',
      g: 'rauch',
      q: 'Was macht ein Rauchmelder?',
      o: ['Er piept laut, wenn Rauch kommt', 'Er löscht das Feuer', 'Er macht das Licht an'],
      a: 0,
    },
    {
      id: 'febf11',
      mod: 'brandfall',
      g: 'rauch',
      q: 'Warum sind Rauchmelder vor allem nachts wichtig?',
      o: ['Im Schlaf riecht man keinen Rauch', 'Nachts brennt Feuer heller', 'Nachts schläft die Feuerwehr'],
      a: 0,
      why: 'Der Rauchmelder weckt alle mit seinem lauten Piepen.',
    },
    {
      id: 'febf12',
      mod: 'brandfall',
      g: 'rauch',
      q: 'Wo hängt ein Rauchmelder?',
      o: ['An der Zimmerdecke', 'Auf dem Fußboden', 'Hinter dem Schrank'],
      a: 0,
      why: 'Der Rauch steigt nach oben. An der Decke kommt er zuerst an.',
    },
    {
      id: 'febf13',
      mod: 'brandfall',
      g: 'rauch',
      q: 'Der Rauchmelder piept mitten in der Nacht. Was tust du?',
      o: ['Alle wecken und schnell nach draußen gehen', 'Weiterschlafen', 'Mir die Ohren zuhalten'],
      a: 0,
      why: 'Der Rauchmelder piept nur, wenn er Rauch bemerkt.',
    },
    {
      id: 'febf14',
      mod: 'brandfall',
      g: 'rauch',
      q: 'Welches Schild zeigt dir den Fluchtweg?',
      o: [
        'Ein grünes Schild mit einem laufenden Menschen',
        'Ein rotes Schild mit einem Feuerlöscher',
        'Ein blaues Schild mit einem P',
      ],
      a: 0,
      why: 'Grüne Schilder zeigen den Weg nach draußen. Rote zeigen, wo Feuerlöscher hängen.',
    },
    {
      id: 'febf15',
      mod: 'brandfall',
      g: 'brandfall',
      q: 'Bei Feueralarm in der Schule packst du zuerst deine Schultasche.',
      rf: true,
      a: false,
      why: 'Du lässt alles liegen und gehst mit der Klasse hinaus.',
    },
    {
      id: 'febf16',
      mod: 'brandfall',
      g: 'brandfall',
      q: 'Wen warnst du, wenn es brennt?',
      o: ['Alle, die noch im Haus sind', 'Niemanden', 'Nur die Nachbarn im Nachbarort'],
      a: 0,
    },
    // the emergency call
    {
      id: 'fenr1',
      mod: 'notruf',
      g: 'notruf',
      q: 'Welche Nummer wählst du bei Feuer?',
      o: ['112', '110', '111'],
      a: 0,
      why: 'Die 112 ist der Notruf für Feuerwehr und Rettungsdienst.',
    },
    {
      id: 'fenr2',
      mod: 'notruf',
      g: 'notruf',
      q: 'Welche Notrufnummer hat die Polizei?',
      o: ['110', '112', '118'],
      a: 0,
      why: 'Die 110 ist der Notruf der Polizei. Bei Feuer wählst du die 112.',
    },
    {
      id: 'fenr3',
      mod: 'notruf',
      g: 'notruf',
      q: 'Die 112 kann man auch ohne Guthaben auf dem Handy anrufen.',
      rf: true,
      a: true,
    },
    {
      id: 'fenr4',
      mod: 'notruf',
      g: 'notruf',
      q: 'Die 112 gilt in ganz Europa.',
      rf: true,
      a: true,
    },
    {
      id: 'fenr5',
      mod: 'notruf',
      g: 'notruf',
      q: 'Was ist beim Notruf am wichtigsten?',
      o: ['Wo es brennt', 'Wie das Wetter ist', 'Wie alt das Haus ist'],
      a: 0,
      why: 'Die Feuerwehr muss den Weg finden. Sag Ort, Straße und Hausnummer.',
    },
    {
      id: 'fenr6',
      mod: 'notruf',
      g: 'notruf',
      q: 'Wann legst du beim Notruf auf?',
      o: ['Wenn die Leitstelle das Gespräch beendet', 'Sobald du die Adresse gesagt hast', 'Gleich nach dem Wählen'],
      a: 0,
      why: 'Die Leitstelle hat oft noch Fragen.',
    },
    {
      id: 'fenr7',
      mod: 'notruf',
      g: 'notruf',
      q: 'Wer meldet sich, wenn du die 112 wählst?',
      o: ['Die Leitstelle', 'Die Schule', 'Das Rathaus'],
      a: 0,
    },
    {
      id: 'fenr8',
      mod: 'notruf',
      g: 'notruf',
      q: 'Wer zum Spaß die 112 anruft, kann Menschen schaden, die wirklich Hilfe brauchen.',
      rf: true,
      a: true,
      why: 'Solange die Leitung belegt ist, kommt ein echter Notruf nicht durch. Ein falscher Notruf ist außerdem verboten.',
    },
    {
      id: 'fenr9',
      mod: 'notruf',
      g: 'notruf',
      q: 'Was solltest du für einen Notruf auswendig wissen?',
      o: ['Deine Adresse', 'Die Lieblingsfarbe deiner Lehrerin', 'Die Uhrzeit'],
      a: 0,
    },
    {
      id: 'fenr10',
      mod: 'notruf',
      g: 'notruf',
      q: 'Was kostet ein Anruf bei der 112?',
      o: ['Nichts', '1 €', '5 €'],
      a: 0,
    },
    {
      id: 'fenr11',
      mod: 'notruf',
      g: 'notruf',
      q: 'In deinem Zimmer brennt es. Wo rufst du die Feuerwehr an?',
      o: ['Draußen oder an einem sicheren Ort', 'Im brennenden Zimmer', 'Gar nicht'],
      a: 0,
      why: 'Erst bringst du dich in Sicherheit, dann rufst du an.',
    },
    {
      id: 'fenr12',
      mod: 'notruf',
      g: 'notruf',
      q: 'Die Leitstelle fragt: „Wer ruft an?“ Was sagst du?',
      o: ['Deinen Namen', 'Die Hausnummer', 'Was brennt'],
      a: 0,
      why: 'Die Leitstelle muss wissen, wer anruft, falls sie noch etwas fragen will.',
    },
    {
      id: 'fenr13',
      mod: 'notruf',
      g: 'notruf',
      q: 'Weißt du beim Notruf nicht weiter, hilft dir die Leitstelle mit Fragen.',
      rf: true,
      a: true,
    },
    {
      id: 'fenr14',
      mod: 'notruf',
      g: 'notruf',
      q: 'Warum fragt die Leitstelle, ob es Verletzte gibt?',
      o: ['Damit auch ein Rettungswagen kommt', 'Damit es in der Zeitung steht', 'Weil sie neugierig ist'],
      a: 0,
    },
    {
      id: 'fenr15',
      mod: 'notruf',
      g: 'notruf',
      q: 'Es brennt, und du hast kein Telefon. Was tust du?',
      o: [
        'Laut rufen und einen Erwachsenen um Hilfe bitten',
        'Abwarten, bis es aufhört',
        'Nach Hause gehen und nichts sagen',
      ],
      a: 0,
    },
    {
      id: 'fenr16',
      mod: 'notruf',
      g: 'notruf',
      q: 'Die Leitstelle fragt: „Was ist passiert?“ Welche Antwort passt?',
      o: ['In der Küche brennt es', 'Ich heiße Paul', 'In der Bergstraße 3'],
      a: 0,
      why: 'Was ist passiert? Das beantwortest du mit dem, was du siehst.',
    },
    // the fire service, and fire in former times
    {
      id: 'fefw1',
      mod: 'feuerwehr',
      g: 'feuerwehr',
      q: 'Was sind die vier Aufgaben der Feuerwehr?',
      o: ['Retten, Löschen, Bergen, Schützen', 'Kochen, Putzen, Waschen, Bügeln', 'Bauen, Malen, Singen, Lesen'],
      a: 0,
      why: 'Retten: Menschen und Tiere. Löschen: Brände. Bergen: Dinge. Schützen: Häuser und Umwelt.',
    },
    {
      id: 'fefw2',
      mod: 'feuerwehr',
      g: 'feuerwehr',
      q: 'Die meisten Feuerwehrleute in Deutschland arbeiten freiwillig.',
      rf: true,
      a: true,
      why: 'Sie gehören zur Freiwilligen Feuerwehr und haben daneben einen anderen Beruf.',
    },
    {
      id: 'fefw3',
      mod: 'feuerwehr',
      g: 'feuerwehr',
      q: 'Wo sind die Leute der Freiwilligen Feuerwehr, wenn kein Alarm ist?',
      o: ['Bei ihrer eigenen Arbeit oder zu Hause', 'In der Leitstelle', 'Immer im Feuerwehrauto'],
      a: 0,
      why: 'Bei Alarm eilen sie ins Gerätehaus und fahren von dort los.',
    },
    {
      id: 'fefw4',
      mod: 'feuerwehr',
      g: 'feuerwehr',
      q: 'Wozu tragen Feuerwehrleute ein Atemschutzgerät?',
      o: ['Damit sie im Rauch atmen können', 'Damit sie schneller laufen', 'Damit sie besser hören'],
      a: 0,
    },
    {
      id: 'fefw5',
      mod: 'feuerwehr',
      g: 'feuerwehr',
      q: 'Womit kommt die Feuerwehr an ein Fenster im vierten Stock?',
      o: ['Mit der Drehleiter', 'Mit einem Fahrrad', 'Mit einem Stuhl'],
      a: 0,
      why: 'Die Drehleiter fährt weit nach oben aus.',
    },
    {
      id: 'fefw6',
      mod: 'feuerwehr',
      g: 'feuerwehr',
      q: 'Was hilft der Feuerwehr, Menschen im dichten Rauch zu finden?',
      o: ['Eine Wärmebildkamera', 'Ein Fernglas', 'Eine Sonnenbrille'],
      a: 0,
      why: 'Sie zeigt, wo es warm ist, auch durch den Rauch.',
    },
    {
      id: 'fefw7',
      mod: 'feuerwehr',
      g: 'feuerwehr',
      q: 'Die Feuerwehr hilft auch bei Unfällen und Hochwasser.',
      rf: true,
      a: true,
    },
    {
      id: 'fefw8',
      mod: 'feuerwehr',
      g: 'feuerwehr',
      q: 'Woran erkennst du ein Feuerwehrauto auf Einsatzfahrt?',
      o: ['An Blaulicht und Martinshorn', 'An einem gelben Licht', 'An lauter Musik'],
      a: 0,
    },
    {
      id: 'fefw9',
      mod: 'feuerwehr',
      g: 'feuerwehr',
      q: 'Ein Feuerwehrauto mit Martinshorn kommt. Was tust du?',
      o: ['Am Rand stehen bleiben und Platz machen', 'Hinterherlaufen', 'Auf die Straße gehen und winken'],
      a: 0,
      why: 'Das Feuerwehrauto muss schnell und sicher durchkommen.',
    },
    {
      id: 'fefw10',
      mod: 'feuerwehr',
      g: 'feuerwehr',
      q: 'Wie heißt das Haus der Freiwilligen Feuerwehr, in dem die Fahrzeuge stehen?',
      o: ['Gerätehaus', 'Rathaus', 'Bahnhof'],
      a: 0,
    },
    {
      id: 'fefw11',
      mod: 'feuerwehr',
      g: 'feuerwehr',
      q: 'Was holt die Feuerwehr aus dem Hydranten?',
      o: ['Löschwasser', 'Strom', 'Benzin'],
      a: 0,
    },
    {
      id: 'fefw12',
      mod: 'feuerwehr',
      g: 'feuerwehr',
      q: 'Was tun Kinder in der Kinder- und Jugendfeuerwehr?',
      o: ['Sie lernen viel über Feuer und Helfen', 'Sie löschen echte Brände', 'Sie fahren das Löschfahrzeug'],
      a: 0,
    },
    {
      id: 'fefw13',
      mod: 'feuerwehr',
      g: 'frueher',
      q: 'Wozu nutzten die Menschen in der Steinzeit das Feuer?',
      o: ['Zum Wärmen, Kochen und gegen wilde Tiere', 'Zum Fernsehen', 'Zum Autofahren'],
      a: 0,
    },
    {
      id: 'fefw14',
      mod: 'feuerwehr',
      g: 'frueher',
      q: 'Womit machten Menschen Feuer, bevor es Streichhölzer gab?',
      o: ['Mit Feuerstein und Zunder', 'Mit Eiswürfeln', 'Mit Wasser und Sand'],
      a: 0,
      why: 'Schlägt man einen Feuerstein gegen ein bestimmtes Gestein, springen Funken in den trockenen Zunder.',
    },
    {
      id: 'fefw15',
      mod: 'feuerwehr',
      g: 'frueher',
      q: 'Streichhölzer gibt es seit etwa 200 Jahren.',
      rf: true,
      a: true,
    },
    {
      id: 'fefw16',
      mod: 'feuerwehr',
      g: 'frueher',
      q: 'Wie löschten die Menschen im Mittelalter Brände?',
      o: [
        'Sie reichten Eimer mit Wasser in einer langen Kette weiter',
        'Mit Löschfahrzeugen',
        'Mit Feuerlöschern aus dem Baumarkt',
      ],
      a: 0,
    },
    {
      id: 'fefw17',
      mod: 'feuerwehr',
      g: 'frueher',
      q: 'Warum brannten im Mittelalter oft ganze Stadtteile ab?',
      o: ['Die Häuser waren aus Holz und standen dicht', 'Es gab keine Fenster', 'Es regnete nie'],
      a: 0,
      why: 'Holz und Strohdächer brennen leicht, und das Feuer sprang von Haus zu Haus.',
    },
    {
      id: 'fefw18',
      mod: 'feuerwehr',
      g: 'frueher',
      q: 'Wo entstand vor etwa 175 Jahren die erste Berufsfeuerwehr Deutschlands?',
      o: ['In Berlin', 'In einem kleinen Dorf', 'Auf einer Burg'],
      a: 0,
    },
  ];

  const MODULES = {
    dreieck: { name: 'Was Feuer braucht', icon: '🔥', maxTier: 2, worldCap: [2], dmg: 14 },
    kerze: { name: 'Die Kerze', icon: '🕯️', maxTier: 1, worldCap: [1], dmg: 12 },
    brennbar: { name: 'Was brennt?', icon: '🪵', maxTier: 1, worldCap: [1], dmg: 12 },
    brandfall: { name: 'Wenn es brennt', icon: '🚪', maxTier: 1, worldCap: [1], dmg: 14 },
    notruf: { name: 'Notruf 112', icon: '📞', maxTier: 1, worldCap: [1], dmg: 12 },
    feuerwehr: { name: 'Die Feuerwehr', icon: '🚒', maxTier: 1, worldCap: [1], dmg: 14 },
  };
  const TUT = {
    'dreieck:1': {
      title: 'Was Feuer braucht',
      steps: [
        'Ein Feuer braucht drei Dinge: Brennstoff, Sauerstoff und Hitze.',
        'Im Bild ist jedes davon eine Seite des Dreiecks.',
        'Fehlt eine Seite, geht das Feuer aus. Tippe auf das, was fehlt.',
      ],
    },
    'dreieck:2': {
      title: 'Feuer löschen',
      steps: [
        'Jetzt wird ein Feuer gelöscht.',
        'Überlege: Nimmt das dem Feuer die Luft, die Hitze oder den Brennstoff?',
        'Tippe auf das, was dem Feuer jetzt fehlt.',
      ],
    },
    'kerze:1': {
      title: 'Die Kerze',
      steps: [
        'Eine Kerze hat Wachs, einen Docht und eine Brennschüssel. Die Flamme hat eine dunkle Zone, eine leuchtende Zone und den Flammensaum.',
        'Im Bild zeigt ein roter Pfeil auf einen Teil.',
        'Tippe auf seinen Namen.',
      ],
    },
    'brennbar:1': {
      title: 'Was brennt?',
      steps: [
        'Holz, Papier, Pappe und Stroh brennen.',
        'Steine, Sand, Glas und Metall brennen nicht. Metall wird aber heiß.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'brandfall:1': {
      title: 'Wenn es brennt',
      steps: [
        'Verstecke dich nie. Geh sofort hinaus und schließe die Tür hinter dir.',
        'Im Rauch kriechst du am Boden. Nimm die Treppe, nie den Aufzug.',
        'Lies genau, ob nach dem Richtigen gefragt ist oder nach dem, was du nie tust.',
      ],
    },
    'notruf:1': {
      title: 'Notruf 112',
      steps: [
        'Bei Feuer wählst du die 112.',
        'Sag, wo es brennt, was passiert ist und wer anruft. Sag auch, ob jemand verletzt ist.',
        'Leg erst auf, wenn die Leitstelle das Gespräch beendet.',
      ],
    },
    'feuerwehr:1': {
      title: 'Die Feuerwehr',
      steps: [
        'Die Feuerwehr rettet, löscht, birgt und schützt.',
        'Retten: Menschen und Tiere. Bergen: Dinge wie ein Auto. Schützen: Häuser und Umwelt.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'kerzeweg:1': {
      title: 'So brennt eine Kerze',
      steps: [
        'Die Sätze sind durcheinander.',
        'Beginne beim Anzünden und folge dem Wachs bis in die Flamme.',
        'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
    'alarm:1': {
      title: 'Feueralarm in der Schule',
      steps: [
        'Die Sätze sind durcheinander.',
        'Beginne beim Alarm und ende am Sammelplatz.',
        'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
    'notrufweg:1': {
      title: 'Der Notruf Schritt für Schritt',
      steps: [
        'Die Sätze sind durcheinander.',
        'Erst bist du in Sicherheit, dann rufst du an. Am Ende legst du auf.',
        'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
    'einsatz:1': {
      title: 'Ein Einsatz der Feuerwehr',
      steps: [
        'Die Sätze sind durcheinander.',
        'Beginne beim Notruf in der Leitstelle und ende in der Wache.',
        'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
    'frueher:1': {
      title: 'Feuer früher und heute',
      steps: [
        'Die Sätze sind durcheinander.',
        'Beginne in der Steinzeit und ende heute.',
        'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
    'versuch:1': {
      title: 'Versuch ordnen',
      steps: [
        'Die Schritte eines Versuchs sind durcheinander. Den Versuch macht ein Erwachsener.',
        'Erst die Frage, dann die Vermutung, dann der Versuch. Danach kommt, was du beobachtest, und am Ende das Ergebnis.',
        'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
  };
  function gen(cfg: Unit) {
    return (mod: string, tier: number, _know: Know, _seq: number, opts?: GenOpts) => {
      if (wantsPool(cfg, mod, opts)) return null;
      const r = Math.random();
      if (mod === 'dreieck' && tier >= 2 && r < 0.6) return loeschTask(mod);
      if (mod === 'dreieck' && r < 0.3) return triangleTask(mod);
      if (mod === 'dreieck' && r < 0.4) return experimentTask(mod, 0);
      if (mod === 'kerze' && r < 0.35) return candleTask(mod);
      if (mod === 'kerze' && r < 0.45)
        return orderTask(
          mod,
          'kerzeweg:1',
          'kerze',
          'So brennt eine Kerze: Tippe die Sätze in der richtigen Reihenfolge an.',
          KERZE,
          'fko_',
        );
      if (mod === 'brennbar' && r < 0.35) return thingTask(mod);
      if (mod === 'brennbar' && r < 0.45) return experimentTask(mod, r < 0.4 ? 1 : 2);
      if (mod === 'brandfall' && r < 0.4) return ruleTask(mod);
      if (mod === 'brandfall' && r < 0.5)
        return orderTask(
          mod,
          'alarm:1',
          'brandfall',
          'Feueralarm in der Schule: Tippe die Sätze in der richtigen Reihenfolge an.',
          ALARM,
          'fao_',
        );
      if (mod === 'notruf' && r < 0.35) return wTask(mod);
      if (mod === 'notruf' && r < 0.45)
        return orderTask(
          mod,
          'notrufweg:1',
          'notruf',
          'Der Notruf: Tippe die Sätze in der richtigen Reihenfolge an.',
          NOTRUF,
          'fno_',
        );
      if (mod === 'feuerwehr' && r < 0.3) return aufgabeTask(mod);
      if (mod === 'feuerwehr' && r < 0.4)
        return orderTask(
          mod,
          'einsatz:1',
          'feuerwehr',
          'Ein Einsatz: Tippe die Sätze in der richtigen Reihenfolge an.',
          EINSATZ,
          'feo_',
        );
      if (mod === 'feuerwehr' && r < 0.5)
        return orderTask(
          mod,
          'frueher:1',
          'frueher',
          'Von der Steinzeit bis heute: Tippe die Sätze in der richtigen Reihenfolge an.',
          FRUEHER,
          'fho_',
        );
      return null;
    };
  }

  /* ---------- Forscherlabor: an adult does each experiment, the child guesses first ---------- */
  const ADULT = 'Nur mit Erwachsenen: ';
  const OUT = ['Die Flamme geht aus', 'Die Flamme brennt weiter'];
  const IN_FIRE = ['Es brennt', 'Es brennt nicht'];
  function laborSet(): Experiment[] {
    const brennt = shuffle(THINGS.filter((x) => x.lab))
      .slice(0, 2)
      .map((x) => ({
        kind: 'brennt',
        topic: 'brennbar',
        q: `${ADULT}Ein Erwachsener hält ${x.acc} mit einer Zange in die Kerzenflamme. Was passiert?`,
        opts: IN_FIRE.slice(),
        a: x.b ? 0 : 1,
        note: `${x.nom} ${x.b ? 'brennt' : 'brennt nicht'}. ${x.why}`,
        pic: tongsSVG(x.label, null),
        after: tongsSVG(x.label, x.b),
      }));
    const c = pick(COVERS);
    const cover = {
      kind: 'deckel',
      topic: 'dreieck',
      q: `${ADULT}Ein Erwachsener stellt ${c.acc} die brennende Kerze. Was passiert?`,
      opts: OUT.slice(),
      a: c.over ? 0 : 1,
      note: c.over
        ? 'Die Flamme geht aus. Ihr fehlt die Luft.'
        : 'Die Flamme brennt weiter. Neben der Kerze nimmt das Glas ihr keine Luft weg.',
      pic: coverSVG(c.id),
      after: coverSVG(c.id, true),
    };
    const two = {
      kind: 'zwei',
      topic: 'dreieck',
      q: `${ADULT}Ein Erwachsener stülpt ein großes und ein kleines Glas über zwei gleiche Kerzen. Welche geht zuerst aus?`,
      opts: ['Die unter dem kleinen Glas', 'Die unter dem großen Glas'],
      a: 0,
      note: 'Im kleinen Glas ist weniger Luft. Diese Kerze geht zuerst aus.',
      pic: twoSVG(),
      after: twoSVG(true),
    };
    const blow = {
      kind: 'rauch',
      topic: 'rauch',
      q: `${ADULT}Ein Erwachsener bläst die Kerze aus. Wohin zieht der Rauch?`,
      opts: ['Nach oben', 'Nach unten'],
      a: 0,
      note: 'Der Rauch ist warm und steigt nach oben. Darum ist bei einem Brand die Luft unten am Boden länger gut.',
      pic: blowSVG(),
      after: blowSVG(true),
    };
    return shuffle<Experiment>([...brennt, cover, two, blow]);
  }

  const FE: Unit = {
    modules: MODULES,
    tut: TUT,
    notes: NOTES,
    pool: POOL,
    worlds: 1,
    grade: 3,
    subject: 'Sachkunde',
    title: 'Feuer und Feuerwehr',
    icon: '🔥',
    sub: 'Was Feuer braucht, die Kerze, was brennt, Verhalten im Brandfall, Notruf 112, die Feuerwehr und das Forscherlabor',
    swap: { from: 'event', to: 'labor' },
    labor: laborSet,
    starters: [
      {
        id: 'feuerwehrfrau',
        type: 'wasser',
        shape: 'feuerwehrfrau',
        names: ['Die Feuerwehrfrau', 'Die Feuerwehrfrau', 'Die Feuerwehrfrau'],
        hp: 70,
        desc: 'Sie kommt, wenn jemand die 112 wählt: Sie rettet Menschen, löscht Brände und erklärt Schulklassen, was bei Feuer zu tun ist.',
        perk: 'none',
        attacks: [
          { name: 'Löschdecke', mod: 'dreieck' },
          { name: 'Wärmebildkamera', mod: 'brennbar' },
          { name: 'Rauchmelder', mod: 'brandfall' },
          { name: 'Funkgerät', mod: 'notruf' },
        ],
      },
    ],
    extra: {
      dreieck: 'Feuerlöscher',
      kerze: 'Kerzenlöscher',
      brennbar: 'Sandeimer',
      brandfall: 'Fluchtwegschild',
      notruf: 'Leitstelle',
      feuerwehr: 'Drehleiter',
    },
    enemies: {
      1: {
        normal: [
          { name: 'Die Rauchwolke', type: 'normal', shape: 'rauchwolke', hp: 28, atk: 4 },
          { name: 'Das Feuerzeug', type: 'feuer', shape: 'feuerzeug', hp: 24, atk: 4 },
          { name: 'Die vergessene Kerze', type: 'feuer', shape: 'vergessenekerze', hp: 26, atk: 3 },
          { name: 'Der Funkenflug', type: 'feuer', shape: 'funkenflug', hp: 30, atk: 3 },
        ],
        elite: { name: 'Der Fettbrand', type: 'feuer', shape: 'fettbrand', hp: 45, atk: 5 },
        boss: {
          name: 'Der Dachstuhlbrand',
          acc: 'den Dachstuhlbrand',
          type: 'feuer',
          shape: 'dachstuhlbrand',
          hp: 70,
          atk: 6,
          boss: true,
        },
      },
    },
    moves: ['Rußwolke', 'Stichflamme', 'Hitzestau', 'Glutnest', 'Qualmschwade', 'Funkenregen'],
    events: [
      {
        title: 'Der Tag der offenen Tür',
        text: 'Die Feuerwache hat heute geöffnet. Ein Feuerwehrmann zeigt dir das Löschfahrzeug und fragt dich nach den Aufgaben der Feuerwehr. Für eine richtige Antwort gibt es einen Trank.',
        opts: [
          { label: 'Antworten', task: 'feuerwehr', g: 'feuerwehr', win: { item: 'trank' }, lose: { hp: -6 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Der Grillplatz',
        text: 'Am Grillplatz löscht ein Vater die Glut mit Sand. Er fragt dich, warum das Feuer ausgeht, und gibt dir einen Schild.',
        opts: [
          { label: 'Antworten', task: 'dreieck', g: 'loeschen', win: { item: 'schild' }, lose: { hp: -5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Der Adventskranz',
        text: 'Bei deiner Oma steht ein Adventskranz mit vier Kerzen. Sie fragt dich, was eine Kerze sicher macht, und schenkt dir eine Chilischote.',
        opts: [
          { label: 'Antworten', task: 'kerze', g: 'vorsicht', win: { item: 'keks' }, lose: { xp: 5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Die Probe im Schulflur',
        text: 'Im Schulflur hängt ein grünes Fluchtwegschild. Der Hausmeister prüft gerade den Rauchmelder. Er kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort.',
        opts: [
          { label: 'Antworten', task: 'brandfall', g: 'rauch', win: { item: 'lupe' }, lose: { xp: 5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Die Leitstelle',
        text: 'In der Leitstelle sitzt eine Frau vor vier Bildschirmen und nimmt Notrufe an. In einer ruhigen Minute fragt sie dich, was man am Telefon sagt.',
        opts: [
          { label: 'Antworten', task: 'notruf', g: 'notruf', win: { xp: 20 }, lose: { xp: 5 } },
          { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } },
        ],
      },
      {
        title: 'Das Gerätehaus',
        text: 'Im Gerätehaus hängen Helme und Jacken an ihren Haken. Auf der Bank davor ruhst du dich aus.',
        opts: [
          { label: 'Ausruhen (+15 LP)', effect: { hp: 15 } },
          { label: 'Weiter', effect: {} },
        ],
      },
    ],
  };
  FE.gen = gen(FE);
  K.MODES.feuer = FE;
  return {
    THINGS,
    LOESCH,
    SIDES,
    PARTS,
    DOS,
    DONTS,
    WS,
    AUFGABEN,
    KERZE,
    ALARM,
    NOTRUF,
    EINSATZ,
    FRUEHER,
    EXPERIMENTS,
    COVERS,
    triangleSVG,
    candleSVG,
    tongsSVG,
    coverSVG,
    twoSVG,
    laborSet,
  };
})();
