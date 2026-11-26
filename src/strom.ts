// Sachunterricht grade 3: Strom und Magnete. Not in the Saxon grade 3 plan; the states whose plans name the simple
// circuit and magnetism are listed in lehrplan/quellen-strom.md. Registers its unit in MK.MODES like sachkunde.ts.
import type { Unit } from './curriculum.ts';
import { MK as K, type GenOpts, type Know, type Question } from './knowledge.ts';
import { MS as S, type Experiment } from './sachkunde.ts';

type Pole = 'N' | 'S';
// something a child holds into the gap of a circuit (l: it conducts) or against a magnet (z: it is attracted)
interface Thing {
  id: string;
  label: string;
  ein?: string;
  acc: string;
  nom: string;
  l?: boolean;
  z?: boolean;
  why: string;
}
// a drawn circuit: a switch, a missing cable or both cables on one pole, a gap that is empty or holds a thing
interface Circuit {
  sw?: 'zu' | 'offen';
  wire?: 'fehlt' | 'pol';
  gap?: Thing | 'leer';
}

export const MST = (() => {
  const { shuffle, pick } = K;
  const { NS, STROKE, txt, choice, orderTask, wantsPool } = S;

  /* ---------- pictures ---------- */
  const RED = '#E5484D',
    BLUE = '#3B82F6',
    STEEL = '#C9CEDD',
    BRASS = '#E8C25A';
  const cable = (d: string, col: string) =>
    `<path d="${d}" fill="none" stroke="${STROKE}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  // name tag that stands for the thing itself, as on the glass of the Forscherlabor
  const tag = (x: number, y: number, label: string) =>
    `<rect x="${x - 50}" y="${y - 12}" width="100" height="24" rx="12" fill="#FFE0B2" stroke="${STROKE}" stroke-width="2"/>${txt(x, y + 4.5, label, { size: label.length > 11 ? 11.5 : 13 })}`;
  const contact = (x: number, y: number) =>
    `<circle cx="${x}" cy="${y}" r="3.5" fill="${BRASS}" stroke="${STROKE}" stroke-width="1.5"/>`;

  // In a task the lamp is always drawn dark: whether it lights is the question. lit: the result in the Forscherlabor.
  function circuitSVG(c: Circuit, lit?: boolean) {
    const X = 56;
    let s = '';
    if (c.gap) {
      s += cable(`M132 70 L${X} 70 L${X} 84`, BLUE) + cable(`M${X} 120 L${X} 132 L104 132`, BLUE);
      s +=
        c.gap === 'leer'
          ? `<path d="M${X} 86 L${X} 93 M${X} 118 L${X} 111" stroke="#D98A3D" stroke-width="3" stroke-linecap="round"/>`
          : `<rect x="${X - 5}" y="82" width="10" height="9" rx="2" fill="${STEEL}" stroke="${STROKE}" stroke-width="1.5"/><rect x="${X - 5}" y="113" width="10" height="9" rx="2" fill="${STEEL}" stroke="${STROKE}" stroke-width="1.5"/>${tag(X, 102, c.gap.label)}`;
    } else s += cable(`M132 70 L${X} 70 L${X} 132 L104 132`, BLUE);
    if (c.wire === 'pol') s += cable('M168 70 L250 70 L250 162 L90 162 L90 144 L104 144', RED);
    else if (c.wire !== 'fehlt' && !c.sw) s += cable('M168 70 L250 70 L250 136 L198 136', RED);
    else if (c.wire !== 'fehlt') {
      const lever = c.sw === 'zu' ? 'M250 114 L250 90' : 'M250 114 L272 97';
      s += cable('M168 70 L250 70 L250 90', RED) + cable('M250 114 L250 136 L198 136', RED);
      s += `<rect x="236" y="84" width="28" height="36" rx="6" fill="#E9EEF6" stroke="${STROKE}" stroke-width="2"/>${contact(250, 90)}${contact(250, 114)}<path d="${lever}" stroke="${STROKE}" stroke-width="6.5" stroke-linecap="round"/><path d="${lever}" stroke="${STEEL}" stroke-width="3" stroke-linecap="round"/>`;
      s += txt(230, 106, 'Schalter', { size: 13, anchor: 'end' });
    }
    // lamp: glass, filament, thread, holder with its two contacts
    if (lit)
      s += `<circle cx="150" cy="36" r="31" fill="#FFE45C" opacity=".35"/><g stroke="#F0A800" stroke-width="2.5" stroke-linecap="round">${[
        200, 235, 270, 305, 340,
      ]
        .map((deg) => {
          const a = (deg * Math.PI) / 180;
          return `<path d="M${(150 + Math.cos(a) * 25).toFixed(1)} ${(36 + Math.sin(a) * 25).toFixed(1)} L${(150 + Math.cos(a) * 33).toFixed(1)} ${(36 + Math.sin(a) * 33).toFixed(1)}"/>`;
        })
        .join('')}</g>`;
    s += `<circle cx="150" cy="36" r="20" fill="${lit ? '#FFE45C' : '#F4F7FB'}" stroke="${STROKE}" stroke-width="2.5"/><path d="M143 54 L143 40 Q146.5 31 150 40 Q153.5 31 157 40 L157 54" fill="none" stroke="${lit ? '#F08A00' : '#8E96B5'}" stroke-width="2"/>`;
    s += `<rect x="140" y="52" width="20" height="10" rx="2" fill="${STEEL}" stroke="${STROKE}" stroke-width="2"/><rect x="122" y="61" width="56" height="17" rx="4" fill="#8A5530" stroke="${STROKE}" stroke-width="2.5"/>${contact(132, 70)}${contact(168, 70)}`;
    s += txt(190, 32, 'Lämpchen', { size: 13, anchor: 'start' });
    // battery: minus plate on the left, plus cap on the right
    s += `<rect x="104" y="122" width="8" height="28" rx="2" fill="${STEEL}" stroke="${STROKE}" stroke-width="2"/><rect x="190" y="129" width="8" height="14" rx="2" fill="${STEEL}" stroke="${STROKE}" stroke-width="2"/><rect x="112" y="120" width="78" height="32" rx="4" fill="#F0A500" stroke="${STROKE}" stroke-width="2.5"/><path d="M116 121.5 L160 121.5 L160 150.5 L116 150.5 Q113.5 150.5 113.5 148 L113.5 124 Q113.5 121.5 116 121.5 Z" fill="#3A3F52"/>`;
    s += txt(126, 142, '−', { size: 17, fill: '#fff' }) + txt(175, 142, '+', { size: 17 });
    s += txt(150, 113, 'Batterie', { size: 13 });
    return `<svg ${NS} class="pic" viewBox="0 0 300 170" aria-label="Stromkreis mit Batterie und Lämpchen">${s}</svg>`;
  }

  // school magnets: north pole red, south pole green
  const POLE_COL = { N: '#E0304A', S: '#2E9E4C' };
  const other = (p: Pole): Pole => (p === 'N' ? 'S' : 'N');
  const bar = (x: number, l: Pole, r: Pole) =>
    `<rect x="${x}" y="28" width="100" height="34" rx="4" fill="${POLE_COL[r]}" stroke="${STROKE}" stroke-width="2.5"/><path d="M${x + 4} 29.5 L${x + 50} 29.5 L${x + 50} 60.5 L${x + 4} 60.5 Q${x + 1.5} 60.5 ${x + 1.5} 58 L${x + 1.5} 32 Q${x + 1.5} 29.5 ${x + 4} 29.5 Z" fill="${POLE_COL[l]}"/>${txt(x + 25, 51.5, l, { size: 18, fill: '#fff' })}${txt(x + 75, 51.5, r, { size: 18, fill: '#fff' })}`;
  // a: the pole at the right end of the left magnet, b: the pole at the left end of the right one;
  // after: where they end up (together, or pushed apart with arrows)
  function magnetsSVG(a: Pole, b: Pole, after?: boolean) {
    const [x1, x2] = !after ? [24, 176] : a !== b ? [50, 150] : [4, 196];
    const arrows =
      after && a === b
        ? `<path d="M142 45 L114 45 M122 38 L114 45 L122 52 M158 45 L186 45 M178 38 L186 45 L178 52" fill="none" stroke="${STROKE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
        : '';
    return `<svg ${NS} class="pic" viewBox="0 0 300 90" aria-label="Zwei Stabmagnete">${bar(x1, other(a), a)}${bar(x2, b, other(b))}${arrows}</svg>`;
  }
  // stuck: null = before the experiment, true = the thing hangs on the magnet, false = it stays where it was
  function pullSVG(label: string, stuck: boolean | null) {
    return `<svg ${NS} class="pic" viewBox="0 0 200 128" aria-label="Hufeisenmagnet über einem Gegenstand"><path d="M68 72 L68 40 Q68 8 100 8 Q132 8 132 40 L132 72 L112 72 L112 40 Q112 28 100 28 Q88 28 88 40 L88 72 Z" fill="${POLE_COL.N}" stroke="${STROKE}" stroke-width="2.5" stroke-linejoin="round"/><rect x="68" y="60" width="20" height="12" fill="${STEEL}" stroke="${STROKE}" stroke-width="2.5" stroke-linejoin="round"/><rect x="112" y="60" width="20" height="12" fill="${STEEL}" stroke="${STROKE}" stroke-width="2.5" stroke-linejoin="round"/>${tag(100, stuck ? 85 : 112, label)}</svg>`;
  }

  /* ---------- things for the generated tasks and the Forscherlabor ---------- */
  const THINGS: Thing[] = [
    {
      id: 'klammer',
      label: 'Büroklammer',
      ein: 'Eine Büroklammer aus Metall',
      acc: 'eine Büroklammer aus Metall',
      nom: 'Die Büroklammer',
      l: true,
      why: 'Sie ist aus Metall, und alle Metalle leiten.',
    },
    {
      id: 'nagel',
      label: 'Eisennagel',
      ein: 'Ein Eisennagel',
      acc: 'einen Eisennagel',
      nom: 'Der Eisennagel',
      l: true,
      why: 'Eisen ist ein Metall, und alle Metalle leiten.',
    },
    {
      id: 'muenze',
      label: 'Münze',
      ein: 'Eine Münze',
      acc: 'eine Münze',
      nom: 'Die Münze',
      l: true,
      why: 'Münzen sind aus Metall.',
    },
    {
      id: 'schluessel',
      label: 'Schlüssel',
      ein: 'Ein Schlüssel aus Metall',
      acc: 'einen Schlüssel aus Metall',
      nom: 'Der Schlüssel',
      l: true,
      why: 'Er ist aus Metall.',
    },
    {
      id: 'alufolie',
      label: 'Alufolie',
      ein: 'Ein Stück Alufolie',
      acc: 'ein Stück Alufolie',
      nom: 'Die Alufolie',
      l: true,
      why: 'Aluminium ist ein Metall.',
    },
    {
      id: 'kupfer',
      label: 'Kupferdraht',
      ein: 'Ein blanker Kupferdraht',
      acc: 'einen blanken Kupferdraht',
      nom: 'Der Kupferdraht',
      l: true,
      why: 'Kupfer leitet besonders gut. Deshalb steckt es in Kabeln.',
    },
    {
      id: 'loeffel',
      label: 'Metalllöffel',
      ein: 'Ein Löffel aus Metall',
      acc: 'einen Löffel aus Metall',
      nom: 'Der Metalllöffel',
      l: true,
      why: 'Er ist aus Metall.',
    },
    {
      id: 'gummi',
      label: 'Radiergummi',
      ein: 'Ein Radiergummi',
      acc: 'einen Radiergummi',
      nom: 'Der Radiergummi',
      l: false,
      why: 'Gummi ist ein Nichtleiter.',
    },
    {
      id: 'holz',
      label: 'Holzstäbchen',
      ein: 'Ein trockenes Holzstäbchen',
      acc: 'ein trockenes Holzstäbchen',
      nom: 'Das Holzstäbchen',
      l: false,
      why: 'Trockenes Holz ist ein Nichtleiter.',
    },
    {
      id: 'plastik',
      label: 'Plastiklöffel',
      ein: 'Ein Löffel aus Plastik',
      acc: 'einen Löffel aus Plastik',
      nom: 'Der Plastiklöffel',
      l: false,
      why: 'Plastik ist ein Nichtleiter.',
    },
    {
      id: 'wolle',
      label: 'Wollfaden',
      ein: 'Ein trockener Wollfaden',
      acc: 'einen trockenen Wollfaden',
      nom: 'Der Wollfaden',
      l: false,
      why: 'Trockene Wolle ist ein Nichtleiter.',
    },
    {
      id: 'glas',
      label: 'Glasmurmel',
      ein: 'Eine Glasmurmel',
      acc: 'eine Glasmurmel',
      nom: 'Die Glasmurmel',
      l: false,
      why: 'Glas ist ein Nichtleiter.',
    },
    {
      id: 'papier',
      label: 'Papier',
      ein: 'Ein trockenes Blatt Papier',
      acc: 'ein trockenes Blatt Papier',
      nom: 'Das Papier',
      l: false,
      why: 'Trockenes Papier ist ein Nichtleiter.',
    },
    {
      id: 'korken',
      label: 'Korken',
      ein: 'Ein Korken',
      acc: 'einen Korken',
      nom: 'Der Korken',
      l: false,
      why: 'Kork ist ein Nichtleiter.',
    },
  ];
  // only iron, nickel and cobalt are attracted; the coins show that „metal“ is not enough
  const PULL: Thing[] = [
    {
      id: 'nagel',
      label: 'Eisennagel',
      acc: 'einen Eisennagel',
      nom: 'Der Eisennagel',
      z: true,
      why: 'Er ist aus Eisen.',
    },
    {
      id: 'klammer',
      label: 'Büroklammer',
      acc: 'eine Büroklammer aus Stahl',
      nom: 'Die Büroklammer',
      z: true,
      why: 'Sie ist aus Stahl, und Stahl besteht vor allem aus Eisen.',
    },
    {
      id: 'stecknadel',
      label: 'Stecknadel',
      acc: 'eine Stecknadel aus Stahl',
      nom: 'Die Stecknadel',
      z: true,
      why: 'Sie ist aus Stahl, und Stahl besteht vor allem aus Eisen.',
    },
    {
      id: 'schraube',
      label: 'Eisenschraube',
      acc: 'eine Schraube aus Eisen',
      nom: 'Die Schraube',
      z: true,
      why: 'Sie ist aus Eisen.',
    },
    {
      id: 'cent5',
      label: '5-Cent-Münze',
      acc: 'eine 5-Cent-Münze',
      nom: 'Die 5-Cent-Münze',
      z: true,
      why: 'Unter dem Kupfer hat sie einen Kern aus Stahl.',
    },
    {
      id: 'cent10',
      label: '10-Cent-Münze',
      acc: 'eine 10-Cent-Münze',
      nom: 'Die 10-Cent-Münze',
      z: false,
      why: 'Sie ist aus einer Metallmischung ohne Eisen.',
    },
    {
      id: 'alufolie',
      label: 'Alufolie',
      acc: 'ein Stück Alufolie',
      nom: 'Die Alufolie',
      z: false,
      why: 'Aluminium ist ein Metall, wird aber vom Magneten nicht angezogen.',
    },
    {
      id: 'kupfer',
      label: 'Kupferdraht',
      acc: 'einen Kupferdraht',
      nom: 'Der Kupferdraht',
      z: false,
      why: 'Kupfer ist ein Metall, wird aber vom Magneten nicht angezogen.',
    },
    {
      id: 'goldring',
      label: 'Goldring',
      acc: 'einen Ring aus Gold',
      nom: 'Der Goldring',
      z: false,
      why: 'Gold ist ein Metall, wird aber vom Magneten nicht angezogen.',
    },
    {
      id: 'glas',
      label: 'Glasmurmel',
      acc: 'eine Glasmurmel',
      nom: 'Die Glasmurmel',
      z: false,
      why: 'Glas zieht ein Magnet nicht an.',
    },
    {
      id: 'holz',
      label: 'Holzstäbchen',
      acc: 'ein Holzstäbchen',
      nom: 'Das Holzstäbchen',
      z: false,
      why: 'Holz zieht ein Magnet nicht an.',
    },
    {
      id: 'gummi',
      label: 'Radiergummi',
      acc: 'einen Radiergummi',
      nom: 'Der Radiergummi',
      z: false,
      why: 'Gummi zieht ein Magnet nicht an.',
    },
    {
      id: 'plastik',
      label: 'Plastiklöffel',
      acc: 'einen Löffel aus Plastik',
      nom: 'Der Plastiklöffel',
      z: false,
      why: 'Plastik zieht ein Magnet nicht an.',
    },
  ];

  /* ---------- generated tasks ---------- */
  const LIT = ['Es leuchtet', 'Es leuchtet nicht'];
  // every drawn circuit: its key in the qid, whether the lamp lights, why, and at tier 2 the fault to name
  interface Drawn {
    key: string;
    c: Circuit;
    lit: boolean;
    why: string;
    fault?: string;
  }
  const CIRCUITS: Drawn[] = [
    { key: 'zu', c: {}, lit: true, why: 'Der Stromkreis ist geschlossen: von der Batterie zum Lämpchen und zurück.' },
    { key: 'an', c: { sw: 'zu' }, lit: true, why: 'Der Schalter ist geschlossen. Der Strom kann im Kreis fließen.' },
    {
      key: 'aus',
      c: { sw: 'offen' },
      lit: false,
      why: 'Der Schalter ist offen. Der Stromkreis ist unterbrochen.',
      fault: 'Der Schalter ist offen',
    },
    {
      key: 'fehlt',
      c: { wire: 'fehlt' },
      lit: false,
      why: 'Zum Lämpchen führt nur ein Kabel. Der Strom kommt nicht zurück zur Batterie.',
      fault: 'Ein Kabel fehlt',
    },
    {
      key: 'pol',
      c: { wire: 'pol' },
      lit: false,
      why: 'Beide Kabel hängen am selben Pol. Der Strom braucht den Weg von einem Pol zum anderen.',
      fault: 'Beide Kabel hängen am selben Pol',
    },
    {
      key: 'leer',
      c: { gap: 'leer' },
      lit: false,
      why: 'Das Kabel hat eine Lücke. Der Stromkreis ist unterbrochen.',
      fault: 'Das Kabel hat eine Lücke',
    },
    ...THINGS.map(
      (x): Drawn => ({
        key: x.id,
        c: { gap: x },
        lit: !!x.l,
        why: x.l
          ? `${x.nom} leitet den Strom. Der Stromkreis ist geschlossen.`
          : `${x.nom} leitet den Strom nicht. Der Stromkreis bleibt unterbrochen.`,
        fault: x.l ? undefined : 'In der Lücke steckt ein Nichtleiter',
      }),
    ),
  ];
  // faults a child could mix up in the drawing are never offered together
  const ALIKE = [
    ['Ein Kabel fehlt', 'Das Kabel hat eine Lücke'],
    ['Das Kabel hat eine Lücke', 'In der Lücke steckt ein Nichtleiter'],
  ];
  const FAULTS = [...new Set(CIRCUITS.flatMap((x) => (x.fault ? [x.fault] : [])))];
  function circuitTask(mod: string) {
    const lit = Math.random() < 0.5;
    const x = pick(CIRCUITS.filter((v) => v.lit === lit));
    return choice(mod, 'stromkreis', 'Leuchtet das Lämpchen?', LIT[lit ? 0 : 1], [LIT[lit ? 1 : 0]], 'skr_' + x.key, {
      options: LIT,
      cols: 2,
      why: x.why,
      pic: circuitSVG(x.c),
    });
  }
  function faultTask(mod: string) {
    const x = pick(CIRCUITS.filter((v) => v.fault));
    const fault = x.fault!;
    const wrong = FAULTS.filter((f) => f !== fault && !ALIKE.some((pair) => pair.includes(f) && pair.includes(fault)));
    return choice(
      mod,
      'stromkreis',
      'Das Lämpchen leuchtet nicht. Woran liegt es?',
      fault,
      shuffle(wrong).slice(0, 2),
      'skf_' + x.key,
      { tier: 2, group: mod + ':2', why: x.why, pic: circuitSVG(x.c) },
    );
  }
  const KINDS = ['Leiter', 'Nichtleiter'];
  function thingTask(mod: string) {
    const leads = Math.random() < 0.5;
    const x = pick(THINGS.filter((v) => !!v.l === leads));
    return choice(
      mod,
      'leiter',
      `${x.ein}: Leiter oder Nichtleiter?`,
      KINDS[x.l ? 0 : 1],
      [KINDS[x.l ? 1 : 0]],
      'slt_' + x.id,
      {
        options: KINDS,
        cols: 2,
        why: `${x.nom} ${x.l ? 'leitet den Strom' : 'leitet den Strom nicht'}. ${x.why}`,
      },
    );
  }
  const PULLS = ['Bleibt am Magneten hängen', 'Bleibt liegen'];
  const pullQ = (x: Thing) => `Du hältst einen Magneten an ${x.acc}. Was passiert?`;
  function pullTask(mod: string) {
    const pulled = Math.random() < 0.5;
    const x = pick(PULL.filter((v) => !!v.z === pulled));
    return choice(mod, 'anziehung', pullQ(x), PULLS[x.z ? 0 : 1], [PULLS[x.z ? 1 : 0]], 'smg_' + x.id, {
      options: PULLS,
      cols: 2,
      why: `${x.nom} ${x.z ? 'bleibt hängen' : 'bleibt liegen'}. ${x.why}`,
    });
  }
  const POLES: Pole[] = ['N', 'S'];
  const POLE_NAME = { N: 'Nordpol', S: 'Südpol' };
  const MOVES = ['Sie ziehen sich an', 'Sie stoßen sich ab'];
  const poleRule = (a: Pole, b: Pole) =>
    a === b
      ? `${POLE_NAME[a]} und ${POLE_NAME[b]} sind gleiche Pole. Gleiche Pole stoßen sich ab.`
      : 'Nordpol und Südpol sind verschiedene Pole. Verschiedene Pole ziehen sich an.';
  function poleTask(mod: string) {
    const a = pick(POLES),
      b = pick(POLES);
    return choice(
      mod,
      'pole',
      'Du schiebst die beiden Magnete aufeinander zu. Was passiert?',
      MOVES[a === b ? 1 : 0],
      [MOVES[a === b ? 0 : 1]],
      'spo_' + a + b,
      { options: MOVES, why: poleRule(a, b), pic: magnetsSVG(a, b) },
    );
  }

  /* ---------- things in order ---------- */
  const WEG = [
    'Im Kraftwerk wird der Strom erzeugt.',
    'Hochspannungsleitungen an hohen Masten bringen ihn über das Land.',
    'Im Umspannwerk wird die Spannung kleiner gemacht.',
    'Leitungen führen den Strom in die Straße und ins Haus.',
    'Der Stromzähler zählt, wie viel Strom das Haus verbraucht.',
    'An der Steckdose wird ein Gerät angeschlossen.',
  ].map((text, i) => ({ id: 'sw' + i, text }));
  // each: question, guess, experiment, observation, result (the steps of the Wetterstation's Forscherlabor)
  const EXPERIMENTS = [
    [
      'Leitet eine Büroklammer aus Metall den Strom?',
      'Ich glaube, ja, weil sie aus Metall ist.',
      'Ich klemme die Büroklammer in die Lücke im Stromkreis.',
      'Das Lämpchen leuchtet.',
      'Die Büroklammer ist ein Leiter.',
    ],
    [
      'Leitet ein Radiergummi den Strom?',
      'Ich glaube, nein.',
      'Ich klemme den Radiergummi in die Lücke im Stromkreis.',
      'Das Lämpchen bleibt dunkel.',
      'Der Radiergummi ist ein Nichtleiter.',
    ],
    [
      'Zieht ein Magnet alle Münzen an?',
      'Ich glaube, ja, weil alle aus Metall sind.',
      'Ich halte den Magneten nacheinander an jede Münze.',
      'Nur die Münzen zu 1, 2 und 5 Cent bleiben hängen.',
      'Ein Magnet zieht nicht alle Metalle an.',
    ],
    [
      'Wirkt ein Magnet durch Wasser hindurch?',
      'Ich glaube, das Wasser hält seine Kraft auf.',
      'Ich lege eine Büroklammer in ein Glas Wasser und halte den Magneten außen ans Glas.',
      'Die Büroklammer wandert mit dem Magneten an der Glaswand nach oben.',
      'Ein Magnet wirkt durch Glas und Wasser hindurch.',
    ],
  ].map((x, i) => x.map((text, j) => ({ id: `sx${i}_${j}`, text })));
  // i: the first two belong to the circuit, the last two to the magnet
  const experimentTask = (mod: string, i: number) =>
    orderTask(
      mod,
      'versuch:1',
      'versuch',
      'Ein Versuch: Tippe die Sätze in der richtigen Reihenfolge an – Frage, Vermutung, Versuch, Beobachtung, Ergebnis.',
      EXPERIMENTS[i],
      `sxo${i}_`,
      5,
    );

  /* ---------- Notizkarten ---------- */
  const NOTES = {
    stromkreis: {
      title: 'Der Stromkreis',
      lines: [
        'Zu einem einfachen Stromkreis gehören eine Batterie, Kabel und ein Lämpchen.',
        'Die Batterie hat zwei Pole: den Pluspol (+) und den Minuspol (−).',
        'Der Strom fließt nur im Kreis: von einem Pol durch ein Kabel zum Lämpchen und durch das zweite Kabel zurück zum anderen Pol.',
        'Ist der Kreis geschlossen, leuchtet das Lämpchen. Ist er an einer Stelle unterbrochen, bleibt es dunkel.',
        'Ein Schalter öffnet und schließt den Stromkreis.',
        'Kurzschluss: Ein Draht verbindet die beiden Pole direkt, ohne Lämpchen. Draht und Batterie werden heiß.',
      ],
      fig: circuitSVG({ sw: 'zu' }, true),
    },
    leiter: {
      title: 'Leiter und Nichtleiter',
      lines: [
        'Leiter lassen den Strom durch. Alle Metalle sind Leiter, zum Beispiel Kupfer, Eisen und Aluminium.',
        'Nichtleiter lassen keinen Strom durch: Plastik, Gummi, Glas und trockenes Holz, Papier oder Wolle. Sie heißen auch Isolatoren.',
        'Im Kabel leitet ein Draht aus Kupfer den Strom. Die Hülle aus Kunststoff schützt dich davor.',
        'So prüfst du einen Stoff: Klemme ihn in eine Lücke im Stromkreis mit Batterie. Leuchtet das Lämpchen, ist er ein Leiter.',
        'Auch Leitungswasser und der Körper des Menschen leiten Strom. Graphit, die Mine im Bleistift, leitet ebenfalls.',
      ],
    },
    herkunft: {
      title: 'Woher der Strom kommt',
      lines: [
        'Kraftwerke erzeugen Strom. Windräder nutzen den Wind, Wasserkraftwerke das fließende Wasser, Solarzellen das Sonnenlicht.',
        'Sonne, Wind und Wasser gehen nicht aus. Sie heißen erneuerbare Energien.',
        'Kohle und Erdgas werden verbrannt. Sie sind irgendwann aufgebraucht, und ihre Abgase schaden dem Klima.',
        'Der Weg des Stroms: Kraftwerk, Hochspannungsleitung, Umspannwerk, Leitung zum Haus, Stromzähler, Steckdose.',
        'Batterien und Akkus speichern Energie. Einen Akku kann man wieder aufladen.',
        'Der Dynamo am Fahrrad macht aus der Drehung des Rades Strom.',
        'Leere Batterien gehören in die Sammelbox, nicht in den Hausmüll.',
      ],
    },
    wirkung: {
      title: 'Was Strom kann',
      lines: [
        'Licht: Lampe und Bildschirm.',
        'Wärme: Herd, Toaster und Bügeleisen.',
        'Bewegung: Ventilator, Mixer und Bohrmaschine. In ihnen dreht sich ein Elektromotor.',
        'Töne: Türklingel, Radio und Lautsprecher.',
      ],
    },
    sparen: {
      title: 'Strom sparen',
      lines: [
        'Licht aus, wenn niemand im Zimmer ist.',
        'Geräte ganz ausschalten. Im Stand-by verbrauchen sie weiter Strom.',
        'LED-Lampen brauchen viel weniger Strom als alte Glühlampen.',
        'Die Kühlschranktür nur kurz öffnen, beim Kochen den Deckel auf den Topf legen.',
        'Wäsche trocknet auf der Leine ganz ohne Strom.',
        'Strom sparen schont die Umwelt und kostet weniger Geld.',
      ],
    },
    gefahr: {
      title: 'Sicher mit Strom',
      lines: [
        'Der Strom aus der Steckdose hat 230 Volt und ist lebensgefährlich.',
        'In die Steckdose gehört nur der Stecker eines Geräts, nie ein Nagel, eine Nadel oder ein Finger.',
        'Strom und Wasser gehören nie zusammen: keine Geräte mit nassen Händen anfassen, kein Föhn an der Badewanne.',
        'Kaputte Kabel, Stecker und Geräte nicht anfassen und einem Erwachsenen zeigen.',
        'Den Stecker am Stecker herausziehen, nicht am Kabel.',
        'Drachen nur auf freiem Feld steigen lassen, weit weg von Stromleitungen und nie bei Gewitter.',
        'Nie auf Strommasten oder Eisenbahnwagen klettern. Von Leitungen, die am Boden liegen, weit wegbleiben.',
        'Bei einem Stromunfall: den Menschen nicht anfassen, sofort einen Erwachsenen holen und die 112 rufen.',
      ],
    },
    batterie: {
      title: 'Versuche nur mit Batterien',
      lines: [
        'Für Versuche nimmst du nur Batterien, wie sie in Taschenlampen stecken. Ihre Spannung ist klein.',
        'Nie mit dem Strom aus der Steckdose forschen.',
        'Verbinde die beiden Pole nie direkt mit einem Draht. Das ist ein Kurzschluss: Draht und Batterie werden heiß.',
        'Batterien nicht öffnen und nie ins Feuer werfen. Ausgelaufene Batterien nicht anfassen.',
        'Knopfbatterien nie in den Mund nehmen. Wer eine verschluckt hat, muss sofort zum Arzt.',
      ],
    },
    pole: {
      title: 'Nordpol und Südpol',
      lines: [
        'Jeder Magnet hat zwei Pole: den Nordpol (N) und den Südpol (S). Bei vielen Schulmagneten ist der Nordpol rot und der Südpol grün.',
        'Gleiche Pole stoßen sich ab: Nordpol und Nordpol, Südpol und Südpol.',
        'Verschiedene Pole ziehen sich an: Nordpol und Südpol.',
        'An den Polen ist ein Magnet am stärksten, in der Mitte am schwächsten.',
        'Bricht ein Magnet durch, hat jedes Stück wieder einen Nordpol und einen Südpol.',
        'Ein Magnet wirkt schon aus der Entfernung. Je weiter weg, desto schwächer.',
      ],
      fig: magnetsSVG('N', 'S'),
    },
    kompass: {
      title: 'Die Kompassnadel',
      lines: [
        'Die Nadel im Kompass ist ein kleiner Magnet, der sich frei drehen kann.',
        'Die Erde wirkt wie ein riesiger Magnet. Deshalb zeigt die markierte Spitze der Nadel immer nach Norden.',
        'Ein Magnet oder viel Eisen in der Nähe lenkt die Nadel ab. Dann zeigt der Kompass falsch.',
        'Streichst du eine Nähnadel mehrmals in dieselbe Richtung über einen Magneten, wird sie selbst magnetisch.',
        'Auf einem Stück Kork im Wasser dreht sich diese Nadel in Nord-Süd-Richtung.',
      ],
    },
    anziehung: {
      title: 'Was ein Magnet anzieht',
      lines: [
        'Ein Magnet zieht Eisen, Nickel und Kobalt an. Stahl besteht vor allem aus Eisen.',
        'Andere Metalle bleiben liegen: Kupfer, Aluminium, Gold und Silber.',
        'Die Münzen zu 1, 2 und 5 Cent haben einen Kern aus Stahl und werden angezogen. Die Münzen zu 10, 20 und 50 Cent nicht.',
        'Holz, Glas, Plastik, Papier und Gummi werden nicht angezogen.',
        'Ein Magnet wirkt durch Papier, Pappe, Glas und Wasser hindurch.',
        'Eisen wird am Magneten selbst magnetisch: An einem Nagel bleibt ein zweiter hängen.',
        'Starke Hitze und harte Schläge machen einen Magneten schwächer.',
      ],
    },
    alltag: {
      title: 'Magnete im Alltag',
      lines: [
        'Magnete halten die Kühlschranktür zu und Zettel an der Tafel fest.',
        'In Lautsprechern, Kopfhörern und Elektromotoren stecken Magnete.',
        'Ein Elektromagnet wirkt nur, solange Strom fließt. So hebt der Kran auf dem Schrottplatz Eisen an und lässt es wieder fallen.',
        'So entsteht ein Elektromagnet: isolierten Draht um einen Eisennagel wickeln und kurz an eine Batterie anschließen.',
        'Starke Magnete von Bankkarten fernhalten. Kleine Magnete nie in den Mund nehmen.',
        'Magneteisenstein ist ein Stein, der von Natur aus magnetisch ist.',
      ],
    },
    versuch: {
      title: 'Ein Versuch Schritt für Schritt',
      lines: [
        '1. Frage: Was willst du herausfinden?',
        '2. Vermutung: Was glaubst du, bevor du es ausprobierst?',
        '3. Versuch: Du probierst es aus. Ändere nur eine Sache, alles andere bleibt gleich.',
        '4. Beobachtung: Was passiert wirklich? Schau genau hin und schreib es auf.',
        '5. Ergebnis: Was hast du herausgefunden? Stimmte deine Vermutung?',
      ],
    },
  };

  /* ---------- questions ---------- */
  const POOL: Question[] = [
    // the simple circuit
    {
      id: 'stkr1',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Was gehört zu einem einfachen Stromkreis?',
      o: ['Batterie, Kabel und Lämpchen', 'Batterie, Wasser und Lämpchen', 'Kabel, Magnet und Kompass'],
      a: 0,
      why: 'Die Batterie liefert den Strom, die Kabel leiten ihn, das Lämpchen leuchtet.',
    },
    {
      id: 'stkr2',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Das Lämpchen leuchtet auch, wenn nur ein Kabel von der Batterie zum Lämpchen führt.',
      rf: true,
      a: false,
      why: 'Der Strom braucht einen geschlossenen Kreis: ein Kabel hin und eins zurück.',
    },
    {
      id: 'stkr3',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Wie heißen die beiden Pole einer Batterie?',
      o: ['Pluspol und Minuspol', 'Nordpol und Südpol', 'Oberpol und Unterpol'],
      a: 0,
      why: 'Nordpol und Südpol hat ein Magnet. Die Batterie hat einen Pluspol und einen Minuspol.',
    },
    {
      id: 'stkr4',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Was macht ein Schalter?',
      o: ['Er öffnet und schließt den Stromkreis', 'Er macht den Strom stärker', 'Er lädt die Batterie auf'],
      a: 0,
      why: 'Ist der Schalter zu, kann der Strom fließen. Ist er offen, ist der Kreis unterbrochen.',
    },
    {
      id: 'stkr5',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Ist der Schalter offen, ist der Stromkreis unterbrochen.',
      rf: true,
      a: true,
    },
    {
      id: 'stkr6',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Du schaltest das Licht aus. Was passiert im Stromkreis?',
      o: ['Er wird unterbrochen', 'Er wird geschlossen', 'Der Strom fließt rückwärts'],
      a: 0,
      why: 'Der Schalter öffnet den Stromkreis. Es fließt kein Strom mehr.',
    },
    {
      id: 'stkr7',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Wann leuchtet das Lämpchen?',
      o: ['Wenn der Stromkreis geschlossen ist', 'Wenn der Stromkreis offen ist', 'Wenn kein Kabel angeschlossen ist'],
      a: 0,
      why: 'Nur im geschlossenen Kreis kann der Strom fließen.',
    },
    {
      id: 'stkr8',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Was liefert in der Taschenlampe den Strom?',
      o: ['Die Batterie', 'Das Lämpchen', 'Der Schalter'],
      a: 0,
      why: 'Die Batterie ist die Stromquelle. Das Lämpchen verbraucht den Strom, der Schalter schaltet ihn ein und aus.',
    },
    {
      id: 'stkr9',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Ein Stromkreis ohne Batterie bringt das Lämpchen trotzdem zum Leuchten.',
      rf: true,
      a: false,
      why: 'Ohne Stromquelle fließt kein Strom.',
    },
    {
      id: 'stkr10',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Warum heißt es Stromkreis?',
      o: [
        'Der Strom fließt im Kreis: hin zum Lämpchen und zurück zur Batterie',
        'Die Batterie ist rund',
        'Die Kabel müssen in einem runden Kreis liegen',
      ],
      a: 0,
      why: 'Der Strom braucht einen Weg hin und einen Weg zurück.',
    },
    {
      id: 'stkr11',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'In deinem Stromkreis hat sich ein Kabel vom Lämpchen gelöst. Was passiert?',
      o: ['Das Lämpchen geht aus', 'Das Lämpchen leuchtet heller', 'Nichts ändert sich'],
      a: 0,
      why: 'Der Stromkreis ist unterbrochen.',
    },
    {
      id: 'stkr12',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Wo findest du am Fahrrad einen Stromkreis?',
      o: ['Bei der Beleuchtung', 'Bei der Kette', 'Bei den Pedalen'],
      a: 0,
      why: 'Vom Dynamo oder Akku fließt der Strom zur Lampe und wieder zurück.',
    },
    {
      id: 'stkr13',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Was ist ein Kurzschluss?',
      o: [
        'Ein Draht verbindet die beiden Pole direkt, ohne Lämpchen dazwischen',
        'Ein Kabel ist zu kurz',
        'Der Schalter ist offen',
      ],
      a: 0,
      why: 'Beim Kurzschluss werden Draht und Batterie heiß, und die Batterie ist schnell leer.',
    },
    {
      id: 'stkr14',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Es ist egal, an welcher Stelle im Stromkreis der Schalter sitzt: Ist er offen, bleibt das Lämpchen dunkel.',
      rf: true,
      a: true,
    },
    {
      id: 'stkr15',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'Wozu sind die Kabel im Stromkreis da?',
      o: [
        'Sie leiten den Strom von der Batterie zum Lämpchen und zurück',
        'Sie speichern den Strom',
        'Sie machen den Strom',
      ],
      a: 0,
      why: 'In den Kabeln steckt Draht aus Metall, und Metall leitet.',
    },
    {
      id: 'stkr16',
      mod: 'kreis',
      g: 'stromkreis',
      q: 'In einer Taschenlampe gibt es einen Stromkreis mit Schalter.',
      rf: true,
      a: true,
    },
    // conductors and non-conductors
    {
      id: 'stle1',
      mod: 'leiter',
      g: 'leiter',
      q: 'Was ist ein Leiter?',
      o: [
        'Ein Stoff, durch den Strom fließen kann',
        'Ein Stoff, der den Strom aufhält',
        'Ein Gerät, das Strom erzeugt',
      ],
      a: 0,
      why: 'Leiter sind zum Beispiel alle Metalle.',
    },
    {
      id: 'stle2',
      mod: 'leiter',
      g: 'leiter',
      q: 'Was ist ein Nichtleiter?',
      o: ['Ein Stoff, durch den kein Strom fließt', 'Ein Kabel ohne Stecker', 'Eine leere Batterie'],
      a: 0,
      why: 'Nichtleiter sind zum Beispiel Plastik, Gummi und Glas.',
    },
    { id: 'stle3', mod: 'leiter', g: 'leiter', q: 'Alle Metalle leiten den Strom.', rf: true, a: true },
    {
      id: 'stle4',
      mod: 'leiter',
      g: 'leiter',
      q: 'Woraus ist der Draht im Inneren eines Kabels meistens?',
      o: ['Aus Kupfer', 'Aus Plastik', 'Aus Holz'],
      a: 0,
      why: 'Kupfer leitet den Strom sehr gut.',
    },
    {
      id: 'stle5',
      mod: 'leiter',
      g: 'leiter',
      q: 'Warum ist ein Kabel außen mit Kunststoff umhüllt?',
      o: [
        'Kunststoff leitet nicht und schützt vor dem Strom im Draht',
        'Mit Kunststoff fließt der Strom schneller',
        'Kunststoff macht das Kabel schwerer',
      ],
      a: 0,
      why: 'Die Hülle heißt Isolierung.',
    },
    {
      id: 'stle6',
      mod: 'leiter',
      g: 'leiter',
      q: 'Plastik, Gummi, Glas und trockenes Holz sind Nichtleiter.',
      rf: true,
      a: true,
    },
    {
      id: 'stle7',
      mod: 'leiter',
      g: 'leiter',
      q: 'Welcher Gegenstand leitet den Strom?',
      o: ['Ein Eisennagel', 'Ein Radiergummi', 'Ein Wollfaden'],
      a: 0,
      why: 'Der Nagel ist aus Metall. Gummi und Wolle sind Nichtleiter.',
    },
    {
      id: 'stle8',
      mod: 'leiter',
      g: 'leiter',
      q: 'Welcher Gegenstand leitet den Strom nicht?',
      o: ['Ein Löffel aus Plastik', 'Eine Büroklammer aus Metall', 'Ein Stück Alufolie'],
      a: 0,
      why: 'Plastik ist ein Nichtleiter. Büroklammer und Alufolie sind aus Metall.',
    },
    {
      id: 'stle9',
      mod: 'leiter',
      g: 'leiter',
      q: 'Du willst prüfen, ob ein Stoff den Strom leitet. Was tust du?',
      o: [
        'Ich klemme ihn in eine Lücke im Stromkreis mit Batterie und schaue auf das Lämpchen',
        'Ich halte ihn an einen Magneten',
        'Ich lege ihn ins Wasser',
      ],
      a: 0,
      why: 'Leuchtet das Lämpchen, ist der Stoff ein Leiter.',
    },
    {
      id: 'stle10',
      mod: 'leiter',
      g: 'leiter',
      q: 'Die Mine im Bleistift ist aus Graphit. Graphit leitet den Strom, obwohl es kein Metall ist.',
      rf: true,
      a: true,
    },
    {
      id: 'stle11',
      mod: 'leiter',
      g: 'leiter',
      q: 'Warum haben die Zangen von Elektrikern Griffe aus Kunststoff?',
      o: [
        'Kunststoff leitet nicht und schützt die Hände',
        'Kunststoff macht die Zange stärker',
        'Kunststoff zieht Metall an',
      ],
      a: 0,
      why: 'Berührt die Zange einen Draht mit Strom, hält der Griff den Strom von der Hand fern.',
    },
    {
      id: 'stle12',
      mod: 'leiter',
      g: 'leiter',
      q: 'Auch der Körper des Menschen leitet Strom.',
      rf: true,
      a: true,
    },
    {
      id: 'stle13',
      mod: 'leiter',
      g: 'leiter',
      q: 'Wasser aus der Leitung ist ein Nichtleiter.',
      rf: true,
      a: false,
      why: 'Leitungswasser leitet Strom. Deshalb gehören Strom und Wasser nie zusammen.',
    },
    {
      id: 'stle14',
      mod: 'leiter',
      g: 'leiter',
      q: 'Wie nennt man einen Nichtleiter noch?',
      o: ['Isolator', 'Generator', 'Kompass'],
      a: 0,
      why: 'Ein Isolator isoliert: Er lässt den Strom nicht durch.',
    },
    // where electricity comes from
    {
      id: 'sten1',
      mod: 'energie',
      g: 'herkunft',
      q: 'Wo wird der Strom für die Steckdose erzeugt?',
      o: ['Im Kraftwerk', 'Im Stromzähler', 'In der Steckdose selbst'],
      a: 0,
      why: 'Vom Kraftwerk kommt der Strom über Leitungen ins Haus.',
    },
    {
      id: 'sten2',
      mod: 'energie',
      g: 'herkunft',
      q: 'Welche Anlage macht Strom aus Wind?',
      o: ['Das Windrad', 'Die Solaranlage', 'Das Wasserkraftwerk'],
      a: 0,
      why: 'Der Wind dreht die Flügel, und im Windrad wird daraus Strom.',
    },
    {
      id: 'sten3',
      mod: 'energie',
      g: 'herkunft',
      q: 'Was machen die Solarzellen auf dem Dach?',
      o: ['Sie machen aus Sonnenlicht Strom', 'Sie sammeln Regenwasser', 'Sie halten das Dach kühl'],
      a: 0,
      why: 'Dafür brauchen sie nur Licht.',
    },
    {
      id: 'sten4',
      mod: 'energie',
      g: 'herkunft',
      q: 'Welche Energiequellen gehen nicht aus?',
      o: ['Sonne, Wind und Wasser', 'Kohle, Erdgas und Erdöl', 'Batterien'],
      a: 0,
      why: 'Sonne, Wind und Wasser heißen deshalb erneuerbare Energien.',
    },
    {
      id: 'sten5',
      mod: 'energie',
      g: 'herkunft',
      q: 'Kohle und Erdgas sind irgendwann aufgebraucht.',
      rf: true,
      a: true,
    },
    {
      id: 'sten6',
      mod: 'energie',
      g: 'herkunft',
      q: 'Warum soll weniger Strom aus Kohle gemacht werden?',
      o: [
        'Beim Verbrennen entstehen Abgase, die dem Klima schaden',
        'Kohle brennt nicht',
        'Strom aus Kohle ist schwächer',
      ],
      a: 0,
      why: 'Kohle ist außerdem irgendwann aufgebraucht.',
    },
    {
      id: 'sten7',
      mod: 'energie',
      g: 'herkunft',
      q: 'Was macht der Dynamo am Fahrrad?',
      o: ['Er macht aus der Drehung des Rades Strom für das Licht', 'Er pumpt Luft in den Reifen', 'Er ölt die Kette'],
      a: 0,
      why: 'Der Dynamo braucht keine Batterie. Er macht den Strom aus der Bewegung.',
    },
    {
      id: 'sten8',
      mod: 'energie',
      g: 'herkunft',
      q: 'Wie kommt der Strom vom Kraftwerk in die Stadt?',
      o: ['Über Stromleitungen an hohen Masten und über Kabel in der Erde', 'Mit Lastwagen', 'Durch Wasserrohre'],
      a: 0,
      why: 'Die Leitungen an den hohen Masten heißen Hochspannungsleitungen.',
    },
    {
      id: 'sten9',
      mod: 'energie',
      g: 'herkunft',
      q: 'Was zählt der Stromzähler im Haus?',
      o: ['Wie viel Strom verbraucht wird', 'Wie viele Lampen es gibt', 'Wie viele Steckdosen es gibt'],
      a: 0,
      why: 'Danach wird der Strom bezahlt.',
    },
    {
      id: 'sten10',
      mod: 'energie',
      g: 'herkunft',
      q: 'In einer Batterie ist Energie gespeichert.',
      rf: true,
      a: true,
    },
    {
      id: 'sten11',
      mod: 'energie',
      g: 'herkunft',
      q: 'Was ist ein Akku?',
      o: ['Eine Batterie, die man wieder aufladen kann', 'Ein sehr langes Kabel', 'Ein Schalter für zwei Lampen'],
      a: 0,
    },
    {
      id: 'sten12',
      mod: 'energie',
      g: 'herkunft',
      q: 'Wohin gehören leere Batterien?',
      o: ['In die Sammelbox im Geschäft', 'In den Hausmüll', 'In den Papierkorb'],
      a: 0,
      why: 'In Batterien stecken Stoffe, die der Umwelt schaden und die man wiederverwerten kann.',
    },
    // what electricity does
    {
      id: 'sten13',
      mod: 'energie',
      g: 'wirkung',
      q: 'Was macht der Strom im Toaster?',
      o: ['Wärme', 'Bewegung', 'Töne'],
      a: 0,
      why: 'Im Toaster glühen Drähte und rösten das Brot.',
    },
    {
      id: 'sten14',
      mod: 'energie',
      g: 'wirkung',
      q: 'Was macht der Strom im Ventilator?',
      o: ['Bewegung', 'Licht', 'Töne'],
      a: 0,
      why: 'Im Ventilator dreht ein Elektromotor die Flügel.',
    },
    {
      id: 'sten15',
      mod: 'energie',
      g: 'wirkung',
      q: 'Was macht der Strom in der Türklingel?',
      o: ['Töne', 'Wärme', 'Licht'],
      a: 0,
    },
    {
      id: 'sten16',
      mod: 'energie',
      g: 'wirkung',
      q: 'Welches Gerät braucht keinen Strom?',
      o: ['Die Sanduhr', 'Der Kühlschrank', 'Der Staubsauger'],
      a: 0,
      why: 'In der Sanduhr rieselt Sand. Kühlschrank und Staubsauger laufen mit Strom.',
    },
    {
      id: 'sten17',
      mod: 'energie',
      g: 'wirkung',
      q: 'Im Elektroherd wird aus Strom Wärme.',
      rf: true,
      a: true,
    },
    // saving electricity
    {
      id: 'sten18',
      mod: 'energie',
      g: 'sparen',
      q: 'Du gehst aus dem Zimmer. Wie sparst du Strom?',
      o: ['Ich schalte das Licht aus', 'Ich lasse das Licht an', 'Ich schalte noch den Fernseher ein'],
      a: 0,
    },
    {
      id: 'sten19',
      mod: 'energie',
      g: 'sparen',
      q: 'Ein Fernseher im Stand-by verbraucht keinen Strom.',
      rf: true,
      a: false,
      why: 'Im Stand-by wartet das Gerät und verbraucht weiter Strom. Ganz ausschalten spart.',
    },
    {
      id: 'sten20',
      mod: 'energie',
      g: 'sparen',
      q: 'Welche Lampe braucht für gleich viel Licht am wenigsten Strom?',
      o: ['Die LED-Lampe', 'Die alte Glühlampe', 'Beide brauchen gleich viel'],
      a: 0,
      why: 'Eine Glühlampe macht aus dem meisten Strom Wärme statt Licht.',
    },
    {
      id: 'sten21',
      mod: 'energie',
      g: 'sparen',
      q: 'Wie spart man am Kühlschrank Strom?',
      o: ['Die Tür nur kurz öffnen', 'Die Tür lange offen lassen', 'Warmes Essen hineinstellen'],
      a: 0,
      why: 'Bei offener Tür kommt warme Luft hinein. Dann muss der Kühlschrank länger kühlen.',
    },
    {
      id: 'sten22',
      mod: 'energie',
      g: 'sparen',
      q: 'Wie trocknet Wäsche ganz ohne Strom?',
      o: ['Auf der Wäscheleine', 'Im Wäschetrockner', 'Mit dem Föhn'],
      a: 0,
      why: 'Wäschetrockner und Föhn brauchen viel Strom.',
    },
    {
      id: 'sten23',
      mod: 'energie',
      g: 'sparen',
      q: 'Warum ist Strom sparen gut?',
      o: [
        'Es schont die Umwelt und kostet weniger Geld',
        'Dann leuchten die Lampen heller',
        'Dann werden die Kabel länger',
      ],
      a: 0,
    },
    {
      id: 'sten24',
      mod: 'energie',
      g: 'sparen',
      q: 'Beim Kochen spart ein Deckel auf dem Topf Strom.',
      rf: true,
      a: true,
    },
    // safety
    {
      id: 'stsi1',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Der Strom aus der Steckdose ist lebensgefährlich.',
      rf: true,
      a: true,
    },
    {
      id: 'stsi2',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Was darf in eine Steckdose gesteckt werden?',
      o: ['Nur der Stecker eines Geräts', 'Ein Nagel', 'Eine Stricknadel'],
      a: 0,
      why: 'Metall leitet. Wer einen Nagel oder eine Nadel hineinsteckt, bekommt einen lebensgefährlichen Stromschlag.',
    },
    {
      id: 'stsi3',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Deine Hände sind nass. Darfst du den Föhn anfassen?',
      o: ['Nein, erst die Hände gut abtrocknen', 'Ja, das macht nichts', 'Ja, aber nur kurz'],
      a: 0,
      why: 'Wasser leitet Strom. Durch nasse Haut kommt der Strom viel leichter in den Körper.',
    },
    {
      id: 'stsi4',
      mod: 'sicher',
      g: 'gefahr',
      q: 'In der Badewanne darf man einen Föhn benutzen, wenn man gut aufpasst.',
      rf: true,
      a: false,
      why: 'Fällt ein Gerät mit Stecker ins Wasser, ist das lebensgefährlich. Solche Geräte gehören nicht an die Wanne.',
    },
    {
      id: 'stsi5',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Am Kabel der Lampe schaut blanker Draht heraus. Was tust du?',
      o: [
        'Ich fasse nichts an und sage es einem Erwachsenen',
        'Ich klebe Papier darum',
        'Ich stecke den Stecker ein und probiere, ob sie noch geht',
      ],
      a: 0,
      why: 'Ohne die Hülle aus Kunststoff schützt nichts mehr vor dem Strom im Draht.',
    },
    {
      id: 'stsi6',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Wie ziehst du einen Stecker aus der Steckdose?',
      o: ['Ich fasse am Stecker an', 'Ich ziehe am Kabel', 'Ich reiße mit einem Ruck am Gerät'],
      a: 0,
      why: 'Wer am Kabel zieht, kann die Drähte im Stecker abreißen.',
    },
    {
      id: 'stsi7',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Wo lässt du deinen Drachen steigen?',
      o: [
        'Auf einem freien Feld, weit weg von Stromleitungen',
        'Neben den Strommasten',
        'Auf der Straße unter den Leitungen',
      ],
      a: 0,
      why: 'Kommt der Drachen oder seine Schnur an eine Stromleitung, kann der Strom durch die Schnur zu dir fließen.',
    },
    {
      id: 'stsi8',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Auf Strommasten und abgestellte Eisenbahnwagen darf man nicht klettern.',
      rf: true,
      a: true,
    },
    {
      id: 'stsi9',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Warum ist es lebensgefährlich, auf einen Eisenbahnwagen zu klettern?',
      o: [
        'Aus der Leitung über dem Gleis kann der Strom überspringen, auch ohne Berührung',
        'Der Wagen ist zu glatt',
        'Der Wagen ist zu leise',
      ],
      a: 0,
      why: 'Die Leitungen über den Gleisen haben 15 000 Volt.',
    },
    {
      id: 'stsi10',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Nach einem Sturm hängt eine Stromleitung bis auf den Boden. Was tust du?',
      o: ['Ich bleibe weit weg und hole einen Erwachsenen', 'Ich hebe sie auf', 'Ich steige vorsichtig darüber'],
      a: 0,
      why: 'Die Leitung kann noch unter Strom stehen. Auch der Boden um sie herum ist dann gefährlich.',
    },
    {
      id: 'stsi11',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Das Brot klemmt im Toaster. Was ist richtig?',
      o: [
        'Erst den Stecker ziehen, dann hilft ein Erwachsener',
        'Mit der Gabel hineinstechen',
        'Mit dem Messer nachhelfen',
      ],
      a: 0,
      why: 'Im Toaster liegen Drähte, durch die Strom fließt. Gabel und Messer sind aus Metall und leiten.',
    },
    {
      id: 'stsi12',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Jemand hat einen Stromschlag bekommen und hält das Gerät noch fest. Was tust du?',
      o: [
        'Ich fasse ihn nicht an, hole sofort einen Erwachsenen, und wir rufen die 112',
        'Ich ziehe ihn an der Hand weg',
        'Ich schütte Wasser darüber',
      ],
      a: 0,
      why: 'Solange Strom fließt, würde er auch durch dich fließen. Erst muss der Strom abgeschaltet werden.',
    },
    {
      id: 'stsi13',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Was macht die Sicherung im Sicherungskasten?',
      o: [
        'Sie schaltet den Strom ab, wenn zu viel Strom fließt',
        'Sie lädt Batterien auf',
        'Sie macht das Licht heller',
      ],
      a: 0,
      why: 'Zu viel Strom macht die Leitungen heiß. Die Sicherung verhindert, dass es brennt.',
    },
    {
      id: 'stsi14',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Ein kaputtes Elektrogerät repariert man am besten selbst.',
      rf: true,
      a: false,
      why: 'Das ist Arbeit für Fachleute. Ein kaputtes Gerät wird nicht mehr eingesteckt.',
    },
    {
      id: 'stsi15',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Warum sind Steckdosen in Wohnungen mit kleinen Kindern oft gesichert?',
      o: [
        'Damit kein Kind etwas hineinstecken kann',
        'Damit weniger Strom verbraucht wird',
        'Damit die Stecker fester sitzen',
      ],
      a: 0,
      why: 'Kleine Kinder wissen noch nicht, wie gefährlich Strom ist.',
    },
    {
      id: 'stsi16',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Wie viel Volt hat der Strom aus der Steckdose?',
      o: ['230 Volt', '9 Volt', '2 Volt'],
      a: 0,
      why: 'Batterien für Taschenlampen haben nur wenige Volt. Die Steckdose hat 230 Volt.',
    },
    {
      id: 'stsi17',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Bei Gewitter lässt man keinen Drachen steigen.',
      rf: true,
      a: true,
    },
    {
      id: 'stsi18',
      mod: 'sicher',
      g: 'gefahr',
      q: 'Warum steckt man nicht mehrere Steckdosenleisten hintereinander?',
      o: [
        'Die Leitung kann zu heiß werden und anfangen zu brennen',
        'Der Strom wird dann zu langsam',
        'Die Lampen leuchten dann zu hell',
      ],
      a: 0,
      why: 'Durch die erste Leiste fließt dann der Strom für zu viele Geräte.',
    },
    // experiments only with batteries
    {
      id: 'stsi19',
      mod: 'sicher',
      g: 'batterie',
      q: 'Womit darfst du Versuche zum Stromkreis machen?',
      o: ['Nur mit Batterien, wie sie in Taschenlampen stecken', 'Mit der Steckdose', 'Mit dem Kabel der Stehlampe'],
      a: 0,
      why: 'Der Strom aus der Steckdose ist lebensgefährlich. Eine Batterie für die Taschenlampe hat nur eine kleine Spannung.',
    },
    {
      id: 'stsi20',
      mod: 'sicher',
      g: 'batterie',
      q: 'Die beiden Pole einer Batterie darf man direkt mit einem Draht verbinden.',
      rf: true,
      a: false,
      why: 'Das ist ein Kurzschluss. Draht und Batterie können sehr heiß werden.',
    },
    {
      id: 'stsi21',
      mod: 'sicher',
      g: 'batterie',
      q: 'Warum gehören Knopfbatterien nicht in die Hände kleiner Kinder?',
      o: ['Sie können verschluckt werden, und das ist sehr gefährlich', 'Sie sind zu schwer', 'Sie sind zu laut'],
      a: 0,
      why: 'Wer eine Knopfbatterie verschluckt hat, muss sofort zum Arzt.',
    },
    {
      id: 'stsi22',
      mod: 'sicher',
      g: 'batterie',
      q: 'Batterien darf man aufschneiden, um hineinzuschauen.',
      rf: true,
      a: false,
      why: 'In Batterien sind ätzende Stoffe. Batterien bleiben zu und kommen nie ins Feuer.',
    },
    {
      id: 'stsi23',
      mod: 'sicher',
      g: 'batterie',
      q: 'Eine alte Batterie ist ausgelaufen. Was tust du?',
      o: [
        'Ich fasse sie nicht an und sage es einem Erwachsenen',
        'Ich wische sie mit den Fingern ab',
        'Ich lege sie zurück ins Gerät',
      ],
      a: 0,
      why: 'Was aus der Batterie läuft, reizt die Haut.',
    },
    {
      id: 'stsi24',
      mod: 'sicher',
      g: 'batterie',
      q: 'Warum sind Versuche mit einer Taschenlampenbatterie ungefährlich?',
      o: ['Ihre Spannung ist sehr klein', 'In ihr ist gar kein Strom', 'Sie ist aus Plastik'],
      a: 0,
      why: 'Die Steckdose hat 230 Volt, eine Taschenlampenbatterie nur wenige Volt.',
    },
    // poles
    {
      id: 'stpo1',
      mod: 'pole',
      g: 'pole',
      q: 'Wie heißen die beiden Pole eines Magneten?',
      o: ['Nordpol und Südpol', 'Pluspol und Minuspol', 'Ostpol und Westpol'],
      a: 0,
      why: 'Pluspol und Minuspol hat eine Batterie. Der Magnet hat einen Nordpol und einen Südpol.',
    },
    {
      id: 'stpo2',
      mod: 'pole',
      g: 'pole',
      q: 'Was passiert, wenn du zwei Nordpole aneinanderhältst?',
      o: ['Sie stoßen sich ab', 'Sie ziehen sich an', 'Nichts'],
      a: 0,
      why: 'Gleiche Pole stoßen sich ab.',
    },
    {
      id: 'stpo3',
      mod: 'pole',
      g: 'pole',
      q: 'Was passiert zwischen einem Nordpol und einem Südpol?',
      o: ['Sie ziehen sich an', 'Sie stoßen sich ab', 'Nichts'],
      a: 0,
      why: 'Verschiedene Pole ziehen sich an.',
    },
    {
      id: 'stpo4',
      mod: 'pole',
      g: 'pole',
      q: 'Gleiche Pole stoßen sich ab, verschiedene Pole ziehen sich an.',
      rf: true,
      a: true,
    },
    {
      id: 'stpo5',
      mod: 'pole',
      g: 'pole',
      q: 'Wo ist ein Stabmagnet am stärksten?',
      o: ['An den beiden Enden, den Polen', 'In der Mitte', 'Überall gleich'],
      a: 0,
      why: 'An den Polen bleiben die meisten Büroklammern hängen, in der Mitte fast keine.',
    },
    {
      id: 'stpo6',
      mod: 'pole',
      g: 'pole',
      q: 'Ein Stabmagnet bricht in der Mitte durch. Was hast du jetzt?',
      o: [
        'Zwei Magnete, jeder mit Nordpol und Südpol',
        'Einen einzelnen Nordpol und einen einzelnen Südpol',
        'Zwei Stücke ohne Magnetkraft',
      ],
      a: 0,
      why: 'Einen Pol allein gibt es nicht.',
    },
    {
      id: 'stpo7',
      mod: 'pole',
      g: 'pole',
      q: 'Es gibt Magnete mit nur einem Pol.',
      rf: true,
      a: false,
      why: 'Jeder Magnet hat immer einen Nordpol und einen Südpol.',
    },
    {
      id: 'stpo8',
      mod: 'pole',
      g: 'pole',
      q: 'Welche Farbe hat der Nordpol bei vielen Schulmagneten?',
      o: ['Rot', 'Grün', 'Gelb'],
      a: 0,
      why: 'Bei vielen Schulmagneten ist der Nordpol rot und der Südpol grün.',
    },
    {
      id: 'stpo9',
      mod: 'pole',
      g: 'pole',
      q: 'Du schiebst einen Südpol auf einen anderen Südpol zu. Was spürst du?',
      o: ['Die Magnete drücken sich weg', 'Die Magnete schnappen zusammen', 'Gar nichts'],
      a: 0,
      why: 'Gleiche Pole stoßen sich ab.',
    },
    {
      id: 'stpo10',
      mod: 'pole',
      g: 'pole',
      q: 'Ein Magnet wirkt schon, bevor er das Eisen berührt.',
      rf: true,
      a: true,
    },
    {
      id: 'stpo11',
      mod: 'pole',
      g: 'pole',
      q: 'Wie heißt ein Magnet, der wie ein U gebogen ist?',
      o: ['Hufeisenmagnet', 'Stabmagnet', 'Scheibenmagnet'],
      a: 0,
      why: 'Er sieht aus wie das Hufeisen eines Pferdes.',
    },
    // the compass needle
    {
      id: 'stpo12',
      mod: 'pole',
      g: 'kompass',
      q: 'Was ist die Nadel im Kompass?',
      o: ['Ein kleiner Magnet, der sich frei drehen kann', 'Ein Zeiger aus Holz', 'Ein Stück Kupferdraht'],
      a: 0,
    },
    {
      id: 'stpo13',
      mod: 'pole',
      g: 'kompass',
      q: 'Wohin zeigt die markierte Spitze der Kompassnadel?',
      o: ['Nach Norden', 'Nach Westen', 'Zur Sonne'],
      a: 0,
    },
    {
      id: 'stpo14',
      mod: 'pole',
      g: 'kompass',
      q: 'Warum richtet sich die Kompassnadel immer gleich aus?',
      o: ['Die Erde wirkt wie ein riesiger Magnet', 'Der Wind dreht sie', 'Sie ist festgeklebt'],
      a: 0,
      why: 'Die Nadel ist ein Magnet und richtet sich nach dem großen Magneten Erde.',
    },
    {
      id: 'stpo15',
      mod: 'pole',
      g: 'kompass',
      q: 'Du hältst einen Magneten neben den Kompass. Was passiert?',
      o: ['Die Nadel dreht sich zum Magneten hin', 'Nichts', 'Die Nadel fällt heraus'],
      a: 0,
      why: 'Die Nadel ist selbst ein Magnet. Der Magnet daneben lenkt sie ab, und der Kompass zeigt falsch.',
    },
    {
      id: 'stpo16',
      mod: 'pole',
      g: 'kompass',
      q: 'Neben einem großen Gegenstand aus Eisen kann ein Kompass falsch anzeigen.',
      rf: true,
      a: true,
    },
    {
      id: 'stpo17',
      mod: 'pole',
      g: 'kompass',
      q: 'Du streichst eine Nähnadel mehrmals in dieselbe Richtung über einen Magneten. Was ist sie danach?',
      o: ['Selbst ein schwacher Magnet', 'Viel schwerer', 'Aus Kupfer'],
      a: 0,
      why: 'So wird aus einer Nadel die Nadel für einen Kompass.',
    },
    {
      id: 'stpo18',
      mod: 'pole',
      g: 'kompass',
      q: 'Wie baust du einen einfachen Kompass?',
      o: [
        'Ich lasse eine magnetische Nadel auf einem Stück Kork im Wasser schwimmen',
        'Ich stecke einen Nagel in die Erde',
        'Ich hänge einen Magneten an die Wand',
      ],
      a: 0,
      why: 'Die schwimmende Nadel dreht sich in Nord-Süd-Richtung.',
    },
    // what a magnet attracts
    {
      id: 'stma1',
      mod: 'magnet',
      g: 'anziehung',
      q: 'Welche Stoffe zieht ein Magnet an?',
      o: ['Eisen, Nickel und Kobalt', 'Alle Metalle', 'Holz und Glas'],
      a: 0,
      why: 'Kupfer, Aluminium, Gold und Silber sind auch Metalle, bleiben aber liegen.',
    },
    {
      id: 'stma2',
      mod: 'magnet',
      g: 'anziehung',
      q: 'Ein Magnet zieht alle Metalle an.',
      rf: true,
      a: false,
      why: 'Angezogen werden nur Eisen, Nickel und Kobalt. Kupfer, Aluminium, Gold und Silber bleiben liegen.',
    },
    {
      id: 'stma3',
      mod: 'magnet',
      g: 'anziehung',
      q: 'Welcher Gegenstand bleibt am Magneten hängen?',
      o: ['Ein Eisennagel', 'Ein Stück Alufolie', 'Ein Kupferdraht'],
      a: 0,
      why: 'Aluminium und Kupfer sind Metalle, werden aber nicht angezogen.',
    },
    {
      id: 'stma4',
      mod: 'magnet',
      g: 'anziehung',
      q: 'Warum zieht der Magnet eine Büroklammer aus Stahl an?',
      o: ['Stahl besteht vor allem aus Eisen', 'Stahl ist besonders leicht', 'Die Büroklammer ist gebogen'],
      a: 0,
    },
    {
      id: 'stma5',
      mod: 'magnet',
      g: 'anziehung',
      q: 'Welche Münze wird vom Magneten angezogen?',
      o: ['Die 5-Cent-Münze', 'Die 10-Cent-Münze', 'Die 50-Cent-Münze'],
      a: 0,
      why: 'Die Münzen zu 1, 2 und 5 Cent haben einen Kern aus Stahl. Die Münzen zu 10, 20 und 50 Cent enthalten kein Eisen.',
    },
    {
      id: 'stma6',
      mod: 'magnet',
      g: 'anziehung',
      q: 'Zwischen Magnet und Büroklammer liegt ein Blatt Papier. Was passiert?',
      o: [
        'Der Magnet zieht die Büroklammer trotzdem an',
        'Das Papier hält die Magnetkraft auf',
        'Das Papier wird magnetisch',
      ],
      a: 0,
      why: 'Ein Magnet wirkt durch Papier hindurch.',
    },
    {
      id: 'stma7',
      mod: 'magnet',
      g: 'anziehung',
      q: 'Ein Magnet wirkt auch durch Glas, Pappe und Wasser hindurch.',
      rf: true,
      a: true,
    },
    {
      id: 'stma8',
      mod: 'magnet',
      g: 'anziehung',
      q: 'Eine Büroklammer aus Stahl liegt im Wasserglas. Wie holst du sie heraus, ohne nass zu werden?',
      o: [
        'Mit einem Magneten außen am Glas',
        'Mit einem Holzstab außen am Glas',
        'Mit einem Stück Alufolie außen am Glas',
      ],
      a: 0,
      why: 'Der Magnet wirkt durch Glas und Wasser. Du ziehst die Klammer an der Glaswand nach oben.',
    },
    {
      id: 'stma9',
      mod: 'magnet',
      g: 'anziehung',
      q: 'Du ziehst den Magneten langsam von der Büroklammer weg. Was passiert mit seiner Kraft auf die Klammer?',
      o: ['Sie wird schwächer', 'Sie wird stärker', 'Sie bleibt gleich'],
      a: 0,
      why: 'Je weiter der Magnet weg ist, desto schwächer wirkt er.',
    },
    {
      id: 'stma10',
      mod: 'magnet',
      g: 'anziehung',
      q: 'An einem Magneten hängt ein Eisennagel. An seiner Spitze bleibt ein zweiter Nagel hängen. Warum?',
      o: [
        'Der erste Nagel ist am Magneten selbst magnetisch geworden',
        'Die Nägel sind zusammengeklebt',
        'Der zweite Nagel ist leichter',
      ],
      a: 0,
    },
    {
      id: 'stma11',
      mod: 'magnet',
      g: 'anziehung',
      q: 'Was kann einen Magneten schwächer machen?',
      o: ['Starke Hitze oder harte Schläge', 'Kaltes Wasser', 'Dunkelheit'],
      a: 0,
      why: 'Deshalb lässt man Magnete nicht fallen und legt sie nicht auf die Heizung.',
    },
    {
      id: 'stma12',
      mod: 'magnet',
      g: 'anziehung',
      q: 'Glas, Holz und Plastik werden vom Magneten nicht angezogen.',
      rf: true,
      a: true,
    },
    // magnets in everyday life
    {
      id: 'stma13',
      mod: 'magnet',
      g: 'alltag',
      q: 'Wo steckt in der Küche ein Magnet?',
      o: ['In der Dichtung der Kühlschranktür', 'Im Kochlöffel aus Holz', 'In der Kaffeetasse'],
      a: 0,
      why: 'Der Magnetstreifen in der Dichtung hält die Tür zu.',
    },
    {
      id: 'stma14',
      mod: 'magnet',
      g: 'alltag',
      q: 'Warum halten Magnete an der Tafel im Klassenzimmer?',
      o: ['Unter der Tafelfläche ist Stahlblech', 'Die Tafel ist klebrig', 'Die Tafel ist aus Holz'],
      a: 0,
      why: 'Stahl besteht vor allem aus Eisen, und Eisen zieht der Magnet an.',
    },
    {
      id: 'stma15',
      mod: 'magnet',
      g: 'alltag',
      q: 'Was ist ein Elektromagnet?',
      o: [
        'Ein Magnet, der nur wirkt, solange Strom fließt',
        'Ein Magnet aus Plastik',
        'Eine Batterie mit zwei Nordpolen',
      ],
      a: 0,
      why: 'Ohne Strom ist er kein Magnet mehr.',
    },
    {
      id: 'stma16',
      mod: 'magnet',
      g: 'alltag',
      q: 'Wie entsteht ein einfacher Elektromagnet?',
      o: [
        'Isolierten Draht um einen Eisennagel wickeln und kurz an eine Batterie anschließen',
        'Einen Nagel lange in der Hand halten',
        'Zwei Magnete zusammenkleben',
      ],
      a: 0,
      why: 'Nur kurz anschließen, denn Draht und Batterie werden warm.',
    },
    {
      id: 'stma17',
      mod: 'magnet',
      g: 'alltag',
      q: 'Wozu hat der Kran auf dem Schrottplatz einen Elektromagneten?',
      o: [
        'Er hebt Eisen an und lässt es fallen, wenn der Strom abgeschaltet wird',
        'Er wärmt den Schrott',
        'Er wiegt den Schrott',
      ],
      a: 0,
    },
    {
      id: 'stma18',
      mod: 'magnet',
      g: 'alltag',
      q: 'In Lautsprechern und Elektromotoren stecken Magnete.',
      rf: true,
      a: true,
    },
    {
      id: 'stma19',
      mod: 'magnet',
      g: 'alltag',
      q: 'Was hältst du von starken Magneten fern?',
      o: ['Bankkarten mit Magnetstreifen', 'Kochlöffel aus Holz', 'Flaschen aus Glas'],
      a: 0,
      why: 'Ein starker Magnet kann den Magnetstreifen der Karte löschen.',
    },
    {
      id: 'stma20',
      mod: 'magnet',
      g: 'alltag',
      q: 'Warum nimmt man kleine Magnete nie in den Mund?',
      o: ['Verschluckte Magnete sind sehr gefährlich', 'Sie schmecken bitter', 'Sie werden im Mund schwächer'],
      a: 0,
      why: 'Verschluckte Magnete können sich im Bauch gegenseitig anziehen und den Darm verletzen. Dann muss man sofort zum Arzt.',
    },
    {
      id: 'stma21',
      mod: 'magnet',
      g: 'alltag',
      q: 'Was ist Magneteisenstein?',
      o: ['Ein Stein, der von Natur aus magnetisch ist', 'Ein Magnet aus Plastik', 'Ein Stück Kohle'],
      a: 0,
      why: 'Er heißt auch Magnetit.',
    },
  ];

  const MODULES = {
    kreis: { name: 'Der Stromkreis', icon: '🔋', maxTier: 2, worldCap: [2], dmg: 14 },
    leiter: { name: 'Leiter und Nichtleiter', icon: '🔌', maxTier: 1, worldCap: [1], dmg: 12 },
    energie: { name: 'Strom im Alltag', icon: '💡', maxTier: 1, worldCap: [1], dmg: 12 },
    sicher: { name: 'Sicher mit Strom', icon: '⚠️', maxTier: 1, worldCap: [1], dmg: 14 },
    pole: { name: 'Nordpol und Südpol', icon: '🧭', maxTier: 1, worldCap: [1], dmg: 12 },
    magnet: { name: 'Was Magnete anziehen', icon: '🧲', maxTier: 1, worldCap: [1], dmg: 14 },
  };
  const TUT = {
    'kreis:1': {
      title: 'Der Stromkreis',
      steps: [
        'Das Bild zeigt eine Batterie, Kabel und ein Lämpchen, manchmal auch einen Schalter.',
        'Folge mit dem Finger den Kabeln: von einem Pol der Batterie zum Lämpchen und zurück zum anderen Pol.',
        'Kommst du ohne Lücke einmal herum, leuchtet das Lämpchen. Im Bild ist es immer aus, denn das sollst du herausfinden.',
        'Steckt ein Gegenstand in der Lücke, überlege: Leitet er den Strom?',
      ],
    },
    'kreis:2': {
      title: 'Stromkreis: Fehler finden',
      steps: [
        'Jetzt leuchtet das Lämpchen nicht.',
        'Folge den Kabeln und suche die Stelle, an der der Kreis unterbrochen ist.',
        'Tippe auf den Satz, der den Fehler nennt.',
      ],
    },
    'leiter:1': {
      title: 'Leiter und Nichtleiter',
      steps: [
        'Ein Leiter lässt den Strom durch. Alle Metalle sind Leiter.',
        'Ein Nichtleiter hält den Strom auf: Plastik, Gummi, Glas und trockenes Holz, Papier oder Wolle.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'energie:1': {
      title: 'Strom im Alltag',
      steps: [
        'Strom kommt aus Kraftwerken, von Windrädern und Solaranlagen. Leitungen bringen ihn ins Haus.',
        'Strom macht Licht, Wärme, Bewegung und Töne.',
        'Wer das Licht löscht und Geräte ganz ausschaltet, spart Strom.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'sicher:1': {
      title: 'Sicher mit Strom',
      steps: [
        'Der Strom aus der Steckdose ist lebensgefährlich. Versuche machst du nur mit Batterien.',
        'Strom und Wasser gehören nie zusammen. Kaputte Kabel fasst du nicht an.',
        'Lies die Frage und tippe auf das, was sicher ist.',
      ],
    },
    'pole:1': {
      title: 'Nordpol und Südpol',
      steps: [
        'Jeder Magnet hat einen Nordpol (N, rot) und einen Südpol (S, grün).',
        'Gleiche Pole stoßen sich ab. Verschiedene Pole ziehen sich an.',
        'Liegen im Bild zwei Magnete, schau auf die Pole, die sich gegenüberliegen.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'magnet:1': {
      title: 'Was Magnete anziehen',
      steps: [
        'Ein Magnet zieht nur Eisen, Nickel und Kobalt an. Stahl besteht vor allem aus Eisen.',
        'Kupfer, Aluminium, Gold und Silber sind Metalle, bleiben aber liegen.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'stromweg:1': {
      title: 'Der Weg des Stroms',
      steps: [
        'Die Sätze sind durcheinander.',
        'Beginne beim Kraftwerk und folge dem Strom bis zur Steckdose.',
        'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
    'versuch:1': {
      title: 'Versuch ordnen',
      steps: [
        'Die Schritte eines Versuchs sind durcheinander.',
        'Erst die Frage, dann die Vermutung, dann der Versuch. Danach schreibst du auf, was du beobachtest, und am Ende das Ergebnis.',
        'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
  };
  function gen(cfg: Unit) {
    return (mod: string, tier: number, _know: Know, _seq: number, opts?: GenOpts) => {
      if (wantsPool(cfg, mod, opts)) return null;
      const r = Math.random();
      if (mod === 'kreis' && r < 0.6) return tier >= 2 ? faultTask(mod) : circuitTask(mod);
      if (mod === 'leiter' && r < 0.35) return thingTask(mod);
      if (mod === 'leiter' && r < 0.45) return experimentTask(mod, r < 0.4 ? 0 : 1);
      if (mod === 'energie' && r < 0.15)
        return orderTask(
          mod,
          'stromweg:1',
          'herkunft',
          'Vom Kraftwerk zur Steckdose: Tippe die Sätze in der richtigen Reihenfolge an.',
          WEG,
          'swo_',
        );
      if (mod === 'pole' && r < 0.4) return poleTask(mod);
      if (mod === 'magnet' && r < 0.35) return pullTask(mod);
      if (mod === 'magnet' && r < 0.45) return experimentTask(mod, r < 0.4 ? 2 : 3);
      return null;
    };
  }

  /* ---------- Forscherlabor: two things in the circuit, two at the magnet, one pair of magnets ---------- */
  function laborSet(): Experiment[] {
    const leit = shuffle(THINGS)
      .slice(0, 2)
      .map((x) => ({
        kind: 'leit',
        topic: 'leiter',
        q: `Du klemmst ${x.acc} in die Lücke im Stromkreis. Leuchtet das Lämpchen?`,
        opts: LIT.slice(),
        a: x.l ? 0 : 1,
        note: `${x.nom} ${x.l ? 'leitet den Strom' : 'leitet den Strom nicht'}. ${x.why}`,
        pic: circuitSVG({ gap: x }),
        after: circuitSVG({ gap: x }, x.l),
      }));
    const zieh = shuffle(PULL)
      .slice(0, 2)
      .map((x) => ({
        kind: 'zieh',
        topic: 'anziehung',
        q: pullQ(x),
        opts: PULLS.slice(),
        a: x.z ? 0 : 1,
        note: `${x.nom} ${x.z ? 'bleibt am Magneten hängen' : 'bleibt liegen'}. ${x.why}`,
        pic: pullSVG(x.label, null),
        after: pullSVG(x.label, !!x.z),
      }));
    const a = pick(POLES),
      b = pick(POLES);
    const pole = {
      kind: 'pole',
      topic: 'pole',
      q: 'Du schiebst die beiden Magnete aufeinander zu. Was passiert?',
      opts: MOVES.slice(),
      a: a === b ? 1 : 0,
      note: poleRule(a, b),
      pic: magnetsSVG(a, b),
      after: magnetsSVG(a, b, true),
      poles: a + b,
    };
    return shuffle<Experiment>([...leit, ...zieh, pole]);
  }

  const ST: Unit = {
    modules: MODULES,
    tut: TUT,
    notes: NOTES,
    pool: POOL,
    worlds: 1,
    grade: 3,
    subject: 'Sachkunde',
    title: 'Strom und Magnete',
    icon: '🧲',
    sub: 'Stromkreis, Leiter und Nichtleiter, Strom sparen, Sicherheit, Magnete und das Forscherlabor',
    swap: { from: 'event', to: 'labor' },
    labor: laborSet,
    starters: [
      {
        id: 'elektrikerin',
        type: 'normal',
        shape: 'elektrikerin',
        names: ['Die Elektrikerin', 'Die Elektrikerin', 'Die Elektrikerin'],
        hp: 70,
        desc: 'Sie verlegt Kabel, schließt Lampen an und prüft jeden Stromkreis, bevor sie den Strom einschaltet.',
        perk: 'none',
        attacks: [
          { name: 'Taschenlampe', mod: 'kreis' },
          { name: 'Kupferdraht', mod: 'leiter' },
          { name: 'Warnschild', mod: 'sicher' },
          { name: 'Hufeisenmagnet', mod: 'magnet' },
        ],
      },
    ],
    extra: {
      kreis: 'Kippschalter',
      leiter: 'Prüflämpchen',
      energie: 'Windrad',
      sicher: 'Sicherungskasten',
      pole: 'Kompassnadel',
      magnet: 'Eisenspäne',
    },
    enemies: {
      1: {
        normal: [
          { name: 'Der Kabelsalat', type: 'pflanze', shape: 'kabelsalat', hp: 26, atk: 3 },
          { name: 'Der Wackelkontakt', type: 'feuer', shape: 'wackelkontakt', hp: 24, atk: 4 },
          { name: 'Die leere Batterie', type: 'wasser', shape: 'leerebatterie', hp: 30, atk: 3 },
          { name: 'Der Schrottmagnet', type: 'normal', shape: 'schrottmagnet', hp: 28, atk: 4 },
        ],
        elite: { name: 'Der Kurzschluss', type: 'feuer', shape: 'kurzschluss', hp: 45, atk: 5 },
        boss: {
          name: 'Der Strommast',
          acc: 'den Strommast',
          type: 'feuer',
          shape: 'strommast',
          hp: 70,
          atk: 6,
          boss: true,
        },
      },
    },
    moves: ['Funkenregen', 'Kabelschlinge', 'Flackerlicht', 'Stromstoß', 'Schrottwurf', 'Brummton'],
    events: [
      {
        title: 'Die Fahrradwerkstatt',
        text: 'In der Werkstatt hängt ein Fahrrad am Haken, sein Licht geht nicht. Die Mechanikerin fragt dich nach dem Stromkreis und schenkt dir einen Trank.',
        opts: [
          { label: 'Antworten', task: 'kreis', g: 'stromkreis', win: { item: 'trank' }, lose: { hp: -6 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Der Schrottplatz',
        text: 'Auf dem Schrottplatz hebt ein Kran mit seinem Magneten alte Autotüren an. Der Kranführer gibt dir einen Schild, wenn du seine Frage beantwortest.',
        opts: [
          { label: 'Antworten', task: 'magnet', g: 'anziehung', win: { item: 'schild' }, lose: { hp: -5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Das Windrad',
        text: 'Am Feldweg steht ein Windrad. Die Technikerin am Fuß des Turms fragt dich, woher der Strom kommt, und gibt dir eine Chilischote.',
        opts: [
          { label: 'Antworten', task: 'energie', g: 'herkunft', win: { item: 'keks' }, lose: { xp: 5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Der Sicherungskasten',
        text: 'Im Keller der Schule öffnet der Hausmeister den Sicherungskasten. Er kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort.',
        opts: [
          { label: 'Antworten', task: 'sicher', g: 'gefahr', win: { item: 'lupe' }, lose: { xp: 5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Die Wanderhütte',
        text: 'Vor der Wanderhütte dreht ein Junge seinen Kompass hin und her. Er fragt dich, warum die Nadel immer in dieselbe Richtung zeigt.',
        opts: [
          { label: 'Antworten', task: 'pole', g: 'kompass', win: { xp: 20 }, lose: { xp: 5 } },
          { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } },
        ],
      },
      {
        title: 'Die Werkbank',
        text: 'Auf der Werkbank liegen Zangen, Draht und Lämpchen. Auf dem Hocker davor ruhst du dich aus.',
        opts: [
          { label: 'Ausruhen (+15 LP)', effect: { hp: 15 } },
          { label: 'Weiter', effect: {} },
        ],
      },
    ],
  };
  ST.gen = gen(ST);
  K.MODES.strom = ST;
  return { THINGS, PULL, WEG, EXPERIMENTS, CIRCUITS, circuitSVG, magnetsSVG, pullSVG, laborSet };
})();
