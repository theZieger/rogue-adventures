// Sachunterricht grade 3: Sonne, Mond und Sterne. Not in the Saxon grade 3 plan; the states whose plans name the
// solar system, day and night and the Moon are listed in lehrplan/quellen-himmel.md, with the sources of the facts.
// Registers its unit in MK.MODES like strom.ts. The moon is drawn as in religionen.ts (lit side right = waxing).
import type { Unit } from './curriculum.ts';
import { MK as K, type GenOpts, type Know, type Question } from './knowledge.ts';
import { MS as S } from './sachkunde.ts';

type Phase = 'neu' | 'zsichel' | 'zhalb' | 'voll' | 'ahalb' | 'asichel';

export const MH = (() => {
  const { shuffle, pick } = K;
  const { NS, STROKE, txt, choice, orderTask, wantsPool } = S;

  /* ---------- pictures ---------- */
  const SKY = '#27335C',
    DARK = '#1C2541',
    RIM = '#4A5788',
    LIT = '#FFF3B0',
    SUN = '#FFC93C',
    RED = '#E5484D';
  const ST = `stroke="${STROKE}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;
  const f1 = (v: number) => Math.round(v * 10) / 10;
  const svg = (box: string, label: string, inner: string, max?: number) =>
    `<svg ${NS} class="pic" viewBox="${box}"${max ? ` style="max-width:${max}px"` : ''} role="img" aria-label="${label}">${inner}</svg>`;
  const dots = (pts: number[][]) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="${LIT}"/>`).join('');
  const sunRays = (x: number, y: number, r: number) =>
    Array.from({ length: 10 }, (_, i) => {
      const a = (i * Math.PI) / 5;
      return `<path d="M${f1(x + Math.cos(a) * (r + 4))} ${f1(y + Math.sin(a) * (r + 4))} L${f1(x + Math.cos(a) * (r + 11))} ${f1(y + Math.sin(a) * (r + 11))}" stroke="#F0A500" stroke-width="3" stroke-linecap="round"/>`;
    }).join('');
  const sun = (x: number, y: number, r: number) =>
    `${sunRays(x, y, r)}<circle cx="${x}" cy="${y}" r="${r}" fill="${SUN}" ${ST}/>`;

  // the Earth seen from above the North Pole, the Sun on the left: the half towards the Sun has day.
  // deg: where the red dot sits (180 = straight towards the Sun, 0 = straight away from it)
  const EARTH = { x: 205, y: 80, r: 52 };
  function dayNightSVG(deg?: number, labels?: boolean) {
    const { x, y, r } = EARTH;
    let s = `<rect x="0" y="0" width="300" height="160" rx="12" fill="${SKY}"/>${dots([
      [118, 22],
      [282, 30],
      [130, 140],
      [276, 142],
    ])}`;
    s += sun(40, 80, 24);
    s += [58, 80, 102]
      .map(
        (yy) =>
          `<path d="M78 ${yy} L136 ${yy}" stroke="${SUN}" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round"/><path d="M134 ${yy - 5} L142 ${yy} L134 ${yy + 5}" fill="none" stroke="${SUN}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
      )
      .join('');
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#2C3D6E" ${ST}/><path d="M${x} ${y - r} A${r} ${r} 0 0 0 ${x} ${y + r} Z" fill="#7CC2FF"/>`;
    s += `<path d="M${x - 30} ${y - 22} q10 -8 18 0 t6 16 q-8 8 -18 2 Z M${x + 14} ${y + 8} q12 -6 20 4 q-4 14 -16 12 Z M${x - 24} ${y + 24} q10 -2 14 8 q-8 8 -16 0 Z" fill="#4FC96A" opacity=".55"/>`;
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="none" ${ST}/><circle cx="${x}" cy="${y}" r="3" fill="${STROKE}"/>`;
    if (labels) {
      // seen from above the North Pole the Earth turns anticlockwise: its top moves to the left
      s += `<path d="M${x + 34} ${y - r - 6} Q${x} ${y - r - 20} ${x - 34} ${y - r - 6}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M${x - 26} ${y - r - 14} L${x - 35} ${y - r - 6} L${x - 25} ${y - r - 2}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      s +=
        txt(x - 24, y + 5, 'Tag', { size: 14 }) +
        txt(x + 26, y + 5, 'Nacht', { size: 14, fill: '#fff' }) +
        txt(40, 140, 'Sonne', { size: 13, fill: '#fff' });
    }
    if (deg !== undefined) {
      const a = (deg * Math.PI) / 180,
        px = f1(x + Math.cos(a) * (r - 9)),
        py = f1(y + Math.sin(a) * (r - 9));
      s += `<circle cx="${px}" cy="${py}" r="7" fill="${RED}" stroke="#fff" stroke-width="2.5"/>`;
    }
    return svg('0 0 300 160', 'Die Erde von oben und die Sonne', s);
  }

  // the Earth on its way round the Sun, seen from the side; the axis always leans to the right.
  // left: the Earth stands left of the Sun, its northern half leans towards the Sun (summer in the north).
  // dot: 'nord' marks Germany, 'sued' marks Australia
  const TILT = (23 * Math.PI) / 180;
  function seasonSVG(left: boolean, dot?: 'nord' | 'sued', labels?: boolean) {
    const cx = left ? 42 : 258,
      cy = 82,
      r = 25;
    const n = [Math.sin(TILT), -Math.cos(TILT)],
      e = [Math.cos(TILT), Math.sin(TILT)];
    const at = (k: number, v: number[]) => [f1(cx + v[0] * k), f1(cy + v[1] * k)];
    let s = `<rect x="0" y="0" width="300" height="164" rx="12" fill="${SKY}"/>${dots([
      [30, 20],
      [272, 22],
      [214, 148],
      [100, 26],
    ])}`;
    s += `<ellipse cx="150" cy="82" rx="108" ry="40" fill="none" stroke="#9AA8D8" stroke-width="2" stroke-dasharray="5 6"/>`;
    s += sun(150, 82, 22);
    // the half towards the Sun is lit
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2C3D6E" ${ST}/><path d="M${cx} ${cy - r} A${r} ${r} 0 0 ${left ? 1 : 0} ${cx} ${cy + r} Z" fill="#7CC2FF"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" ${ST}/>`;
    const [e1x, e1y] = at(r, e),
      [e2x, e2y] = at(-r, e),
      [a1x, a1y] = at(r + 11, n),
      [a2x, a2y] = at(-(r + 11), n),
      [tx, ty] = at(r + 20, n);
    s += `<path d="M${e1x} ${e1y} L${e2x} ${e2y}" stroke="${STROKE}" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    s += `<path d="M${a2x} ${a2y} L${a1x} ${a1y}" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>${txt(tx, ty + 4, 'N', { size: 13, fill: '#fff' })}`;
    if (dot) {
      const [dx, dy] = at(dot === 'nord' ? 15 : -14, n);
      s += `<circle cx="${dx}" cy="${dy}" r="5.5" fill="${RED}" stroke="#fff" stroke-width="2"/>`;
    }
    if (labels)
      s +=
        txt(cx, 150, left ? 'Juni' : 'Dezember', { size: 13, fill: '#fff' }) +
        txt(150, 150, 'Sonne', { size: 13, fill: '#fff' });
    return svg('0 0 300 164', 'Die Erde mit ihrer schiefen Achse auf dem Weg um die Sonne', s);
  }

  // phases as seen from Germany: waxing is lit on the right
  const MOON: Record<Phase, string> = {
    neu: '',
    zsichel: `<path d="M60 30 A30 30 0 0 1 60 90 A36 36 0 0 0 60 30 Z" fill="${LIT}" ${ST}/>`,
    zhalb: `<path d="M60 30 A30 30 0 0 1 60 90 Z" fill="${LIT}" ${ST}/>`,
    voll: `<circle cx="60" cy="60" r="30" fill="${LIT}" ${ST}/>`,
    ahalb: `<path d="M60 30 A30 30 0 0 0 60 90 Z" fill="${LIT}" ${ST}/>`,
    asichel: `<path d="M60 30 A30 30 0 0 0 60 90 A36 36 0 0 1 60 30 Z" fill="${LIT}" ${ST}/>`,
  };
  const moonDisc = (p: Phase) =>
    `<circle cx="60" cy="60" r="30" fill="${DARK}" stroke="${RIM}" stroke-width="1.5"/>${MOON[p]}`;
  const moonSVG = (p: Phase) =>
    svg(
      '0 0 120 120',
      'Der Mond am Himmel',
      `<rect x="2" y="2" width="116" height="116" rx="12" fill="${SKY}"/>${dots([
        [22, 26],
        [98, 30],
        [30, 92],
        [94, 88],
        [18, 60],
      ])}${moonDisc(p)}`,
      190,
    );
  const PHASES: Phase[] = ['neu', 'zsichel', 'zhalb', 'voll', 'ahalb', 'asichel'];
  const moonRowSVG = () =>
    svg(
      '0 0 360 84',
      'Die Mondphasen der Reihe nach',
      `<rect x="0" y="0" width="360" height="84" rx="12" fill="${SKY}"/>${PHASES.map(
        (p, i) =>
          `<g transform="translate(${8 + i * 58} 4) scale(0.5)">${moonDisc(p)}</g>${txt(38 + i * 58, 78, ['Neu', 'Sichel', 'Halb', 'Voll', 'Halb', 'Sichel'][i], { size: 11, fill: '#fff' })}`,
      ).join('')}`,
    );

  /* planets, not to scale: [name, x, radius, colour] */
  const PLANETS: [string, number, number, string][] = [
    ['Merkur', 30, 4.5, '#A8A3A0'],
    ['Venus', 46, 6.5, '#F2D29B'],
    ['Erde', 64, 7, '#3B82F6'],
    ['Mars', 82, 5.5, '#D9603B'],
    ['Jupiter', 114, 19, '#D9A66B'],
    ['Saturn', 166, 15, '#E8C98A'],
    ['Uranus', 214, 10, '#9FE0E6'],
    ['Neptun', 248, 10, '#4F7FE0'],
  ];
  const NAMES = PLANETS.map((p) => p[0]);
  function planetsSVG(mark?: number, labels?: boolean) {
    let s = `<rect x="0" y="0" width="270" height="104" rx="12" fill="${SKY}"/><circle cx="-28" cy="48" r="46" fill="${SUN}" ${ST}/>`;
    PLANETS.forEach(([name, x, r, col], i) => {
      if (name === 'Saturn')
        s += `<ellipse cx="${x}" cy="48" rx="${r + 11}" ry="5" fill="none" stroke="${STROKE}" stroke-width="5"/><ellipse cx="${x}" cy="48" rx="${r + 11}" ry="5" fill="none" stroke="#F3E3B8" stroke-width="2.5"/>`;
      s += `<circle cx="${x}" cy="48" r="${r}" fill="${col}" stroke="${STROKE}" stroke-width="2"/>`;
      if (name === 'Jupiter')
        s += `<path d="M${x - 17} 42 L${x + 17} 42 M${x - 18} 53 L${x + 18} 53" stroke="#A86A3A" stroke-width="2.5"/><ellipse cx="${x + 6}" cy="56" rx="4" ry="2.5" fill="#C2513F"/>`;
      if (name === 'Saturn')
        s += `<path d="M${x - r - 11} 48 A${r + 11} 5 0 0 0 ${x + r + 11} 48" fill="none" stroke="${STROKE}" stroke-width="5"/><path d="M${x - r - 11} 48 A${r + 11} 5 0 0 0 ${x + r + 11} 48" fill="none" stroke="#F3E3B8" stroke-width="2.5"/>`;
      if (name === 'Erde') s += `<path d="M${x - 3} 45 q3 -3 5 0 q-1 4 -4 3 Z" fill="#4FC96A"/>`;
      if (labels) s += txt(x, i % 2 ? 98 : 84, name, { size: 10, fill: '#fff' });
      if (i === mark) {
        const top = 48 - r - (name === 'Saturn' ? 4 : 5);
        s += `<path d="M${x} ${top - 22} L${x} ${top - 2} M${x - 6} ${top - 9} L${x} ${top - 2} L${x + 6} ${top - 9}" fill="none" stroke="${RED}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
    });
    return svg('0 0 270 104', 'Die Sonne und die acht Planeten, nicht maßstabsgetreu', s);
  }
  // four planets a child can tell by their look
  const LOOK: Record<string, string> = {
    Erde: `<circle cx="60" cy="60" r="34" fill="#3B82F6" ${ST}/><path d="M36 46 q10 -12 22 -6 q6 10 -4 16 q-10 2 -10 12 q-8 -4 -8 -22 Z M66 64 q12 -6 20 4 q-2 14 -14 18 q-10 -8 -6 -22 Z" fill="#4FC96A" stroke="${STROKE}" stroke-width="1.5"/><path d="M44 34 q12 -4 22 2 M70 44 q8 0 12 6 M40 82 q10 4 18 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".85"/>`,
    Mars: `<circle cx="60" cy="60" r="34" fill="#D9603B" ${ST}/><path d="M47 32 q13 -6 26 0 q-13 5 -26 0 Z" fill="#fff"/><path d="M38 58 q10 -6 18 2 q-6 10 -18 -2 Z M66 70 q10 -4 16 4 q-8 8 -16 -4 Z M58 44 q6 -2 10 2 q-4 4 -10 -2 Z" fill="#A8412A"/>`,
    Jupiter: `<circle cx="60" cy="60" r="34" fill="#F0D6A8" ${ST}/><path d="M28 48 L92 48 M26 60 L94 60 M30 74 L90 74" stroke="#C08A52" stroke-width="5"/><path d="M34 40 L86 40" stroke="#C08A52" stroke-width="3"/><ellipse cx="72" cy="67" rx="9" ry="5" fill="#C2513F" stroke="${STROKE}" stroke-width="1.5"/>`,
    Saturn: `<ellipse cx="60" cy="62" rx="52" ry="12" fill="none" stroke="${STROKE}" stroke-width="7"/><ellipse cx="60" cy="62" rx="52" ry="12" fill="none" stroke="#F3E3B8" stroke-width="4"/><circle cx="60" cy="60" r="26" fill="#E8C98A" ${ST}/><path d="M36 52 L84 52 M35 64 L85 64" stroke="#C9A25A" stroke-width="3"/><path d="M8 62 A52 12 0 0 0 112 62" fill="none" stroke="${STROKE}" stroke-width="7"/><path d="M8 62 A52 12 0 0 0 112 62" fill="none" stroke="#F3E3B8" stroke-width="4"/>`,
  };
  const lookSVG = (name: string) =>
    svg(
      '0 0 120 120',
      'Ein Planet',
      `<rect x="2" y="2" width="116" height="116" rx="12" fill="${SKY}"/>${dots([
        [16, 18],
        [104, 22],
        [20, 104],
        [102, 100],
      ])}${LOOK[name]}`,
      190,
    );

  // constellations as seen in the sky, the stars drawn bright, the lines thin
  const star = (x: number, y: number, r = 3.2) =>
    `<circle cx="${x}" cy="${y}" r="${r + 3}" fill="${LIT}" opacity=".25"/><circle cx="${x}" cy="${y}" r="${r}" fill="${LIT}"/>`;
  const lines = (pts: number[][], path: number[][]) =>
    path
      .map(
        ([a, b]) =>
          `<path d="M${pts[a][0]} ${pts[a][1]} L${pts[b][0]} ${pts[b][1]}" stroke="#9AA8D8" stroke-width="1.5"/>`,
      )
      .join('');
  const SHAPES: Record<string, { pts: number[][]; path: number[][] }> = {
    // Alkaid, Mizar, Alioth, Megrez, Phecda, Merak, Dubhe
    'Großer Wagen': {
      pts: [
        [18, 58],
        [42, 48],
        [62, 50],
        [84, 52],
        [88, 76],
        [126, 78],
        [124, 50],
      ],
      path: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 6],
        [6, 5],
        [5, 4],
        [4, 3],
      ],
    },
    Kassiopeia: {
      pts: [
        [22, 42],
        [50, 76],
        [78, 52],
        [106, 80],
        [136, 44],
      ],
      path: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
      ],
    },
    // Beteigeuze, Bellatrix, the belt, Saiph, Rigel
    Orion: {
      pts: [
        [52, 20],
        [108, 26],
        [70, 58],
        [80, 56],
        [90, 54],
        [60, 98],
        [112, 94],
      ],
      path: [
        [0, 2],
        [1, 4],
        [2, 3],
        [3, 4],
        [2, 5],
        [4, 6],
        [0, 1],
      ],
    },
  };
  const FIGURES = Object.keys(SHAPES);
  const figureSVG = (name: string) => {
    const f = SHAPES[name];
    return svg(
      '0 0 160 120',
      'Sterne am Nachthimmel',
      `<rect x="0" y="0" width="160" height="120" rx="12" fill="${SKY}"/>${lines(f.pts, f.path)}${f.pts.map(([x, y]) => star(x, y)).join('')}`,
      240,
    );
  };
  // the Big Dipper low in the picture; the line from Merak through Dubhe, five times as long, ends at the Pole Star
  const WAGEN = [
    [30, 128],
    [52, 118],
    [72, 120],
    [94, 122],
    [98, 142],
    [134, 142],
    [132, 120],
  ];
  const POLAR = [122, 12];
  const DECOYS = [
    [36, 30],
    [168, 70],
  ];
  // letters: which of A, B, C stands at the Pole Star, the first decoy and the second
  function polarSVG(letters?: string[]) {
    let s = `<rect x="0" y="0" width="200" height="156" rx="12" fill="${SKY}"/>${lines(WAGEN, SHAPES['Großer Wagen'].path)}${WAGEN.map(([x, y]) => star(x, y)).join('')}`;
    const spots = [POLAR, ...DECOYS];
    if (letters)
      s += spots
        .map(
          ([x, y], i) =>
            `${star(x, y, 3.6)}${txt(x + 12, y + 5, letters[i], { size: 14, fill: '#fff', anchor: 'start' })}`,
        )
        .join('');
    else
      s += `<path d="M134 142 L${POLAR[0]} ${POLAR[1] + 6}" stroke="${SUN}" stroke-width="2" stroke-dasharray="4 5"/>${star(POLAR[0], POLAR[1], 3.6)}${txt(POLAR[0] + 10, POLAR[1] + 5, 'Polarstern', { size: 12, fill: '#fff', anchor: 'start' })}${txt(60, 152, 'Großer Wagen', { size: 11, fill: '#fff' })}`;
    return svg('0 0 200 156', 'Der Große Wagen und helle Sterne', s, 300);
  }

  /* ---------- generated tasks ---------- */
  const DN = ['Tag', 'Nacht'];
  // dot positions on the day side and on the night side, never close to the line between them
  const DAY = [125, 150, 180, 210, 235],
    NIGHT = [55, 30, 0, 330, 305];
  function dayNightTask(mod: string) {
    const day = Math.random() < 0.5;
    const deg = pick(day ? DAY : NIGHT);
    return choice(
      mod,
      'erde',
      'Der rote Punkt ist Mias Zuhause. Ist es dort gerade Tag oder Nacht?',
      DN[day ? 0 : 1],
      [DN[day ? 1 : 0]],
      'hmtn_' + deg,
      {
        options: DN,
        cols: 2,
        why: day
          ? 'Der Punkt liegt auf der Seite, die zur Sonne zeigt. Dort ist Tag.'
          : 'Der Punkt liegt auf der Seite, die von der Sonne weg zeigt. Dort ist Nacht.',
        pic: dayNightSVG(deg),
      },
    );
  }
  const SEASONS = ['Sommer', 'Winter'];
  function seasonTask(mod: string) {
    const left = Math.random() < 0.5,
      dot = pick<'nord' | 'sued'>(['nord', 'sued']);
    const summer = left === (dot === 'nord');
    const place = dot === 'nord' ? 'Deutschland' : 'Australien';
    return choice(
      mod,
      'jahreszeiten',
      `Der rote Punkt zeigt, wo ${place} liegt. Welche Jahreszeit ist dort gerade?`,
      SEASONS[summer ? 0 : 1],
      [SEASONS[summer ? 1 : 0]],
      `hmjz_${left ? 'l' : 'r'}${dot}`,
      {
        options: SEASONS,
        cols: 2,
        why: summer
          ? `Die Hälfte der Erde mit ${place} ist zur Sonne geneigt. Die Sonne steht dort hoch und scheint lange: Es ist Sommer.`
          : `Die Hälfte der Erde mit ${place} ist von der Sonne weg geneigt. Die Sonne steht dort tief und scheint kurz: Es ist Winter.`,
        pic: seasonSVG(left, dot),
      },
    );
  }
  const PHASE_NAME: Record<Phase, string> = {
    neu: 'Neumond',
    zsichel: 'Mondsichel',
    zhalb: 'Halbmond',
    voll: 'Vollmond',
    ahalb: 'Halbmond',
    asichel: 'Mondsichel',
  };
  const PHASE_WHY: Record<string, string> = {
    Neumond: 'Bei Neumond zeigt die beleuchtete Seite des Mondes von uns weg. Wir sehen ihn nicht.',
    Mondsichel: 'Nur ein schmaler Streifen ist hell. Das ist eine Sichel.',
    Halbmond: 'Genau die Hälfte ist hell. Das ist ein Halbmond.',
    Vollmond: 'Der Mond ist ganz rund und hell. Das ist Vollmond.',
  };
  function phaseTask(mod: string) {
    const p = pick(PHASES);
    const a = PHASE_NAME[p];
    return choice(
      mod,
      'phasen',
      'Welche Mondphase zeigt das Bild?',
      a,
      shuffle(['Neumond', 'Mondsichel', 'Halbmond', 'Vollmond'].filter((x) => x !== a)).slice(0, 2),
      'hmmp_' + p,
      { why: PHASE_WHY[a], pic: moonSVG(p) },
    );
  }
  const WAX = ['Er nimmt zu', 'Er nimmt ab'];
  function waxTask(mod: string) {
    const p = pick<Phase>(['zsichel', 'zhalb', 'ahalb', 'asichel']);
    const waxing = p[0] === 'z';
    return choice(
      mod,
      'phasen',
      'So siehst du den Mond bei uns in Deutschland. Nimmt er zu oder ab?',
      WAX[waxing ? 0 : 1],
      [WAX[waxing ? 1 : 0]],
      'hmmz_' + p,
      {
        options: WAX,
        cols: 2,
        tier: 2,
        group: mod + ':2',
        why: waxing
          ? 'Die rechte Seite ist hell. Bei uns heißt das: Der Mond nimmt zu.'
          : 'Die linke Seite ist hell, rund wie der Bauch eines kleinen a. a wie abnehmend: Der Mond nimmt ab.',
        pic: moonSVG(p),
      },
    );
  }
  const NTH = ['erste', 'zweite', 'dritte', 'vierte', 'fünfte', 'sechste', 'siebte', 'achte'];
  function rowTask(mod: string) {
    const i = Math.floor(Math.random() * 8);
    // neighbours make the counting matter; the rest are planets from the other end
    const near = [i - 1, i + 1].filter((j) => j >= 0 && j < 8);
    const wrong = shuffle(near)
      .slice(0, 1)
      .concat(shuffle(NAMES.map((_, j) => j).filter((j) => j !== i && !near.includes(j))).slice(0, 1))
      .map((j) => NAMES[j]);
    return choice(mod, i < 4 ? 'innen' : 'aussen', 'Welcher Planet ist markiert?', NAMES[i], wrong, 'hmpr_' + i, {
      why: `Der markierte Planet ist der ${NTH[i]} von der Sonne aus: ${NAMES[i]}.`,
      pic: planetsSVG(i),
    });
  }
  const LOOK_WHY: Record<string, string> = {
    Erde: 'Blaue Meere, grünes Land und weiße Wolken: Das ist die Erde.',
    Mars: 'Rötlicher Staub bedeckt ihn: Das ist der Mars, der Rote Planet.',
    Jupiter: 'Streifen aus Wolken und der Große Rote Fleck: Das ist der Jupiter.',
    Saturn: 'Große, helle Ringe: Das ist der Saturn.',
  };
  function lookTask(mod: string) {
    const name = pick(Object.keys(LOOK));
    return choice(
      mod,
      name === 'Erde' || name === 'Mars' ? 'innen' : 'aussen',
      'Welcher Planet ist das?',
      name,
      shuffle(Object.keys(LOOK).filter((x) => x !== name)).slice(0, 2),
      'hmpl_' + name,
      { why: LOOK_WHY[name], pic: lookSVG(name) },
    );
  }
  const FIGURE_WHY: Record<string, string> = {
    'Großer Wagen': 'Vier Sterne bilden den Kasten, drei die Deichsel: der Große Wagen.',
    Kassiopeia: 'Fünf Sterne bilden ein großes W: die Kassiopeia.',
    Orion: 'In der Mitte stehen drei Sterne in einer Reihe, der Gürtel des Orion.',
  };
  function figureTask(mod: string) {
    const name = pick(FIGURES);
    return choice(
      mod,
      'sternbilder',
      'Welche Sterngruppe zeigt das Bild?',
      name,
      FIGURES.filter((x) => x !== name),
      'hmsb_' + FIGURES.indexOf(name),
      { why: FIGURE_WHY[name], pic: figureSVG(name) },
    );
  }
  const LETTERS = ['Stern A', 'Stern B', 'Stern C'];
  function polarTask(mod: string) {
    const letters = shuffle(['A', 'B', 'C']);
    return choice(
      mod,
      'sternbilder',
      'Welcher Stern ist der Polarstern?',
      'Stern ' + letters[0],
      LETTERS.filter((x) => x !== 'Stern ' + letters[0]),
      'hmps_' + letters.join(''),
      {
        options: LETTERS,
        why: 'Verlängere die hintere Wand des Kastens etwa fünfmal nach oben. Dort steht der Polarstern.',
        pic: polarSVG(letters),
      },
    );
  }

  /* ---------- things in order ---------- */
  const SONNENLAUF = [
    'Morgens geht die Sonne im Osten auf.',
    'Am Vormittag steigt sie höher.',
    'Mittags steht sie im Süden am höchsten.',
    'Am Nachmittag sinkt sie nach Westen.',
    'Abends geht sie im Westen unter.',
  ].map((text, i) => ({ id: 'hsl' + i, text }));
  const MONDLAUF = [
    'Neumond: Der Mond ist nicht zu sehen.',
    'Rechts zeigt sich eine schmale Sichel.',
    'Zunehmender Halbmond: Die rechte Hälfte ist hell.',
    'Vollmond: Der Mond ist ganz rund.',
    'Abnehmender Halbmond: Die linke Hälfte ist hell.',
    'Links ist nur noch eine schmale Sichel hell.',
  ].map((text, i) => ({ id: 'hml' + i, text }));
  const REIHE = NAMES.map((text, i) => ({ id: 'hpr' + i, text }));
  const RAUMFLUG = [
    'Die Astronautin trainiert lange auf der Erde.',
    'Sie steigt in die Raumkapsel oben auf der Rakete.',
    'Die Rakete startet ins All.',
    'Die Kapsel dockt an der ISS an.',
    'Monatelang forscht die Astronautin an Bord.',
    'Die Kapsel kehrt zurück und landet an Fallschirmen.',
  ].map((text, i) => ({ id: 'hrf' + i, text }));

  /* ---------- Notizkarten ---------- */
  const NOTES = {
    erde: {
      title: 'Tag und Nacht',
      lines: [
        'Die Erde ist eine Kugel. Sie dreht sich in etwa 24 Stunden einmal um sich selbst.',
        'Die Sonne beleuchtet immer nur eine Hälfte der Erde. Dort ist Tag, auf der anderen Hälfte ist Nacht.',
        'Die Sonne kreist nicht um die Erde. Es sieht nur so aus, weil wir uns mit der Erde drehen.',
        'Wir spüren die Drehung nicht, weil sie ganz gleichmäßig ist.',
      ],
      fig: dayNightSVG(undefined, true),
    },
    sonnenlauf: {
      title: 'Der Weg der Sonne am Himmel',
      lines: [
        'Die Erde dreht sich von Westen nach Osten. Deshalb geht die Sonne im Osten auf und im Westen unter.',
        'Mittags steht die Sonne bei uns im Süden am höchsten. Dann ist dein Schatten am kürzesten.',
        'Im Osten Deutschlands geht die Sonne etwas früher auf als im Westen.',
      ],
    },
    umlauf: {
      title: 'Ein Jahr um die Sonne',
      lines: [
        'Die Erde kreist um die Sonne. Für einen Weg braucht sie ein Jahr.',
        'Ein Jahr hat 365 Tage. Genauer sind es 365 Tage und fast 6 Stunden.',
        'Nach vier Jahren sind die übrigen Stunden fast ein ganzer Tag. Dann bekommt der Februar einen 29. Tag. So ein Jahr heißt Schaltjahr.',
      ],
    },
    jahreszeiten: {
      title: 'Warum es Jahreszeiten gibt',
      lines: [
        'Die Achse der Erde steht schief und zeigt immer in dieselbe Richtung.',
        'Im Sommer ist unsere Hälfte der Erde zur Sonne geneigt. Die Sonne steht hoch und scheint lange. Es wird warm.',
        'Im Winter ist unsere Hälfte von der Sonne weg geneigt. Die Sonne steht tief und scheint kurz. Es wird kalt.',
        'Die Entfernung zur Sonne ist nicht der Grund: Im Januar ist die Erde der Sonne sogar am nächsten.',
        'Der längste Tag ist bei uns um den 21. Juni, der kürzeste um den 21. Dezember. Im März und im September sind Tag und Nacht etwa gleich lang.',
        'Auf der Südhalbkugel, zum Beispiel in Australien, ist es umgekehrt: Wenn bei uns Winter ist, ist dort Sommer.',
      ],
      fig: seasonSVG(true, undefined, true),
    },
    mond: {
      title: 'Der Mond',
      lines: [
        'Der Mond kreist um die Erde. Für einen Weg braucht er etwa einen Monat.',
        'Er leuchtet nicht selbst. Er wirft das Licht der Sonne zurück.',
        'Wir sehen vom Mond immer dieselbe Seite.',
        'Auf dem Mond gibt es keine Luft und kein Wetter. Krater zeigen, wo Gesteinsbrocken aus dem All eingeschlagen sind.',
        'Der Mond zieht schwächer an als die Erde. Darum kann man dort viel höher springen.',
        'Neil Armstrong betrat 1969 als erster Mensch den Mond.',
      ],
    },
    phasen: {
      title: 'Die Mondphasen',
      lines: [
        'Die Sonne beleuchtet immer eine Hälfte des Mondes. Während er um die Erde kreist, sehen wir davon mal mehr, mal weniger.',
        'Die Reihenfolge: Neumond, zunehmende Sichel, zunehmender Halbmond, Vollmond, abnehmender Halbmond, abnehmende Sichel.',
        'Von Vollmond zu Vollmond vergehen etwa 29 und ein halber Tag.',
        'Bei uns gilt: Ist die rechte Seite hell, nimmt der Mond zu. Ist die linke Seite hell, nimmt er ab.',
        'Merkhilfe: Die abnehmende Sichel ist rund wie der Bauch eines kleinen geschriebenen a. a wie abnehmend.',
        'Auf der Südhalbkugel, zum Beispiel in Australien, ist es andersherum.',
      ],
      fig: moonRowSVG(),
    },
    innen: {
      title: 'Die Planeten nahe der Sonne',
      lines: [
        'Acht Planeten kreisen um die Sonne: Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus und Neptun.',
        'Merksatz: Mein Vater erklärt mir jeden Sonntag unseren Nachthimmel.',
        'Merkur ist der Sonne am nächsten und der kleinste Planet.',
        'Venus ist der heißeste Planet. Ihre dicke Lufthülle hält die Wärme fest. Nach Sonne und Mond leuchtet sie am hellsten am Himmel.',
        'Die Erde ist der dritte Planet. Nur auf ihr kennen wir Leben.',
        'Mars heißt der Rote Planet. In seinem Staub steckt Eisen, das gerostet ist.',
        'Merkur, Venus, Erde und Mars haben eine feste Oberfläche aus Gestein.',
      ],
      fig: planetsSVG(undefined, true),
    },
    aussen: {
      title: 'Die großen Gasplaneten',
      lines: [
        'Jupiter, Saturn, Uranus und Neptun bestehen vor allem aus Gas. Man kann auf ihnen nicht landen.',
        'Jupiter ist der größte Planet. Der Große Rote Fleck ist ein riesiger Wirbelsturm.',
        'Saturn hat die größten und hellsten Ringe. Auch Jupiter, Uranus und Neptun haben Ringe, aber dünne und dunkle.',
        'Uranus liegt fast auf der Seite. So rollt er auf seinem Weg um die Sonne.',
        'Neptun ist der äußerste Planet. Dort wehen die stärksten Winde.',
        'Pluto zählt seit 2006 nicht mehr als Planet. Er ist ein Zwergplanet.',
      ],
    },
    sonne: {
      title: 'Die Sonne ist ein Stern',
      lines: [
        'Die Sonne ist ein Stern: eine riesige, glühend heiße Kugel aus Gas.',
        'Sie ist der Stern, der uns am nächsten ist. Ihr Licht braucht etwas mehr als 8 Minuten bis zur Erde.',
        'Die anderen Sterne sind so weit weg, dass sie nur als Punkte leuchten. Viele sind größer als die Sonne.',
        'Am Tag ist die Sonne so hell, dass du die anderen Sterne nicht siehst.',
        'Die Sonne gehört zur Milchstraße, einer riesigen Gruppe von Sternen.',
        'Schau nie direkt in die Sonne, auch nicht mit Fernglas oder Fernrohr. Das kann deine Augen für immer verletzen.',
        'Eine Sternschnuppe ist kein Stern: Ein winziges Teilchen aus dem All verglüht hoch in der Luft.',
      ],
    },
    sternbilder: {
      title: 'Sternbilder und der Polarstern',
      lines: [
        'In einem Sternbild verbinden wir helle Sterne in Gedanken zu einem Bild.',
        'Der Große Wagen besteht aus sieben hellen Sternen und gehört zum Sternbild Großer Bär. Bei uns ist er das ganze Jahr zu sehen.',
        'Verlängere die hintere Wand des Wagens etwa fünfmal. Dort steht der Polarstern. Er zeigt nach Norden.',
        'Der Polarstern ist der letzte Stern in der Deichsel des Kleinen Wagens.',
        'Die Kassiopeia sieht aus wie ein W. Im Orion stehen drei Sterne in einer Reihe, sein Gürtel.',
        'In der Stadt machen die vielen Lampen den Himmel hell. Auf dem Land siehst du viel mehr Sterne.',
      ],
      fig: polarSVG(),
    },
    iss: {
      title: 'Die Raumstation ISS',
      lines: [
        'Die ISS ist eine Raumstation. Sie kreist um die Erde, für eine Runde braucht sie etwa 90 Minuten.',
        'Seit dem Jahr 2000 leben ständig Astronautinnen und Astronauten an Bord. Sie forschen und machen Versuche.',
        'In der ISS sind alle schwerelos: Was nicht festgemacht ist, schwebt.',
        'Sie schlafen in Schlafsäcken, die an der Wand festgemacht sind, und trinken aus Beuteln.',
        'Jeden Tag treiben sie Sport. Ohne Schwerkraft werden Muskeln und Knochen sonst schwächer.',
        'Am Tag sehen sie etwa 16 Sonnenaufgänge.',
        'Im All gibt es keine Luft zum Atmen. Draußen brauchen sie einen Raumanzug.',
      ],
    },
    pioniere: {
      title: 'Die ersten Menschen im All',
      lines: [
        'Juri Gagarin flog 1961 als erster Mensch ins All.',
        'Neil Armstrong betrat 1969 als erster Mensch den Mond.',
        'Sigmund Jähn flog 1978 als erster Deutscher ins All.',
        'Alexander Gerst war 2018 der erste deutsche Kommandant der ISS. Matthias Maurer flog 2021 zur ISS.',
        'Astronauten fliegen mit einer Rakete ins All. Die Raumkapsel sitzt oben auf der Rakete.',
      ],
    },
  };

  /* ---------- questions ---------- */
  const POOL: Question[] = [
    // day and night
    {
      id: 'hmtg1',
      mod: 'tag',
      g: 'erde',
      q: 'Warum gibt es Tag und Nacht?',
      o: ['Die Erde dreht sich um sich selbst', 'Die Sonne kreist um die Erde', 'Die Sonne geht nachts aus'],
      a: 0,
      why: 'Die Seite der Erde, die zur Sonne zeigt, hat Tag. Die andere Seite hat Nacht.',
    },
    {
      id: 'hmtg2',
      mod: 'tag',
      g: 'erde',
      q: 'Die Sonne wandert jeden Tag einmal um die Erde.',
      rf: true,
      a: false,
      why: 'Es sieht nur so aus. In Wirklichkeit dreht sich die Erde um sich selbst.',
    },
    {
      id: 'hmtg3',
      mod: 'tag',
      g: 'erde',
      q: 'Wie lange braucht die Erde, um sich einmal um sich selbst zu drehen?',
      o: ['Etwa einen Tag', 'Etwa eine Woche', 'Etwa ein Jahr'],
      a: 0,
      why: 'Eine Drehung dauert etwa 24 Stunden: einen Tag und eine Nacht.',
    },
    {
      id: 'hmtg4',
      mod: 'tag',
      g: 'erde',
      q: 'Wenn bei uns Tag ist, ist auf der anderen Seite der Erde Nacht.',
      rf: true,
      a: true,
      why: 'Die Sonne kann immer nur eine Hälfte der Erde beleuchten.',
    },
    {
      id: 'hmtg5',
      mod: 'tag',
      g: 'erde',
      q: 'Welche Form hat die Erde?',
      o: ['Eine Kugel', 'Eine Scheibe', 'Einen Würfel'],
      a: 0,
      why: 'Fotos aus dem Weltall zeigen die Erde als Kugel.',
    },
    {
      id: 'hmtg6',
      mod: 'tag',
      g: 'erde',
      q: 'Was zeigt ein Globus?',
      o: ['Die Erde als kleine Kugel', 'Den Sternenhimmel', 'Den Mond'],
      a: 0,
      why: 'Am Globus siehst du, dass die Sonne nur eine Hälfte der Erde beleuchten kann.',
    },
    {
      id: 'hmtg7',
      mod: 'tag',
      g: 'erde',
      q: 'Wir spüren nicht, dass sich die Erde dreht.',
      rf: true,
      a: true,
      why: 'Wir drehen uns mit, und die Drehung ist ganz gleichmäßig.',
    },
    {
      id: 'hmtg8',
      mod: 'tag',
      g: 'erde',
      q: 'Wie viel von der Erde beleuchtet die Sonne gleichzeitig?',
      o: ['Eine Hälfte', 'Die ganze Erde', 'Nur Europa'],
      a: 0,
      why: 'Die andere Hälfte liegt im Schatten. Dort ist Nacht.',
    },
    {
      id: 'hmtg9',
      mod: 'tag',
      g: 'erde',
      q: 'Wie viele Stunden haben ein Tag und eine Nacht zusammen?',
      o: ['24', '12', '60'],
      a: 0,
      why: 'So lange braucht die Erde für eine Drehung um sich selbst.',
    },
    {
      id: 'hmtg10',
      mod: 'tag',
      g: 'sonnenlauf',
      q: 'In welcher Himmelsrichtung geht die Sonne auf?',
      o: ['Im Osten', 'Im Westen', 'Im Norden'],
      a: 0,
      why: 'Die Sonne geht im Osten auf und im Westen unter.',
    },
    {
      id: 'hmtg11',
      mod: 'tag',
      g: 'sonnenlauf',
      q: 'In welcher Himmelsrichtung geht die Sonne unter?',
      o: ['Im Westen', 'Im Osten', 'Im Süden'],
      a: 0,
    },
    {
      id: 'hmtg12',
      mod: 'tag',
      g: 'sonnenlauf',
      q: 'Wo steht die Sonne bei uns mittags?',
      o: ['Im Süden', 'Im Norden', 'Im Osten'],
      a: 0,
      why: 'Mittags steht sie im Süden am höchsten.',
    },
    {
      id: 'hmtg13',
      mod: 'tag',
      g: 'sonnenlauf',
      q: 'Mittags ist dein Schatten am kürzesten.',
      rf: true,
      a: true,
      why: 'Die Sonne steht dann am höchsten.',
    },
    {
      id: 'hmtg14',
      mod: 'tag',
      g: 'sonnenlauf',
      q: 'Warum sieht es so aus, als ob die Sonne über den Himmel wandert?',
      o: ['Weil sich die Erde dreht', 'Weil die Sonne um uns herumläuft', 'Weil der Wind sie schiebt'],
      a: 0,
    },
    {
      id: 'hmtg15',
      mod: 'tag',
      g: 'sonnenlauf',
      q: 'Die Erde dreht sich von Westen nach Osten.',
      rf: true,
      a: true,
      why: 'Darum taucht der Osten zuerst ins Sonnenlicht, und die Sonne geht im Osten auf.',
    },
    {
      id: 'hmtg16',
      mod: 'tag',
      g: 'sonnenlauf',
      q: 'Wo geht die Sonne früher auf?',
      o: ['In Görlitz im Osten', 'In Aachen im Westen', 'Überall in Deutschland gleichzeitig'],
      a: 0,
      why: 'Die Erde dreht sich nach Osten. Der Osten kommt zuerst ins Sonnenlicht.',
    },
    // the year and the seasons
    {
      id: 'hmjr1',
      mod: 'jahr',
      g: 'umlauf',
      q: 'Wie lange braucht die Erde für einen Weg um die Sonne?',
      o: ['Ein Jahr', 'Einen Monat', 'Einen Tag'],
      a: 0,
    },
    {
      id: 'hmjr2',
      mod: 'jahr',
      g: 'umlauf',
      q: 'Wie viele Tage hat ein Jahr?',
      o: ['365', '100', '1000'],
      a: 0,
      why: 'Genauer sind es 365 Tage und fast 6 Stunden.',
    },
    {
      id: 'hmjr3',
      mod: 'jahr',
      g: 'umlauf',
      q: 'Warum gibt es alle vier Jahre einen 29. Februar?',
      o: [
        'Die Erde braucht etwas länger als 365 Tage für ihren Weg',
        'Der Mond braucht einen Tag Pause',
        'Die Sonne dreht sich langsamer',
      ],
      a: 0,
      why: 'Jedes Jahr bleiben fast 6 Stunden übrig. Nach vier Jahren ist das fast ein ganzer Tag. Dieses Jahr heißt Schaltjahr.',
    },
    {
      id: 'hmjr4',
      mod: 'jahr',
      g: 'umlauf',
      q: 'Die Erde kreist um die Sonne.',
      rf: true,
      a: true,
    },
    {
      id: 'hmjr5',
      mod: 'jahr',
      g: 'umlauf',
      q: 'Was steht in der Mitte unseres Sonnensystems?',
      o: ['Die Sonne', 'Die Erde', 'Der Mond'],
      a: 0,
      why: 'Die Erde und die anderen Planeten kreisen um die Sonne.',
    },
    {
      id: 'hmjr6',
      mod: 'jahr',
      g: 'jahreszeiten',
      q: 'Warum gibt es Jahreszeiten?',
      o: [
        'Die Achse der Erde steht schief',
        'Die Erde ist im Sommer näher an der Sonne',
        'Die Sonne ist im Winter kleiner',
      ],
      a: 0,
      why: 'Durch die schiefe Achse ist unsere Hälfte der Erde im Sommer zur Sonne geneigt und im Winter von ihr weg.',
    },
    {
      id: 'hmjr7',
      mod: 'jahr',
      g: 'jahreszeiten',
      q: 'Im Sommer ist es warm, weil die Erde dann näher an der Sonne ist.',
      rf: true,
      a: false,
      why: 'Warm wird es, weil die Sonne hoch steht und lange scheint. Im Januar ist die Erde der Sonne sogar am nächsten.',
    },
    {
      id: 'hmjr8',
      mod: 'jahr',
      g: 'jahreszeiten',
      q: 'Wie steht die Sonne bei uns im Sommer mittags?',
      o: ['Hoch am Himmel', 'Tief über dem Horizont', 'Gar nicht am Himmel'],
      a: 0,
    },
    {
      id: 'hmjr9',
      mod: 'jahr',
      g: 'jahreszeiten',
      q: 'In welcher Jahreszeit sind bei uns die Tage am längsten?',
      o: ['Im Sommer', 'Im Winter', 'Im Herbst'],
      a: 0,
    },
    {
      id: 'hmjr10',
      mod: 'jahr',
      g: 'jahreszeiten',
      q: 'In welchem Monat ist bei uns der längste Tag des Jahres?',
      o: ['Im Juni', 'Im Dezember', 'Im März'],
      a: 0,
      why: 'Um den 21. Juni. Der kürzeste Tag ist um den 21. Dezember.',
    },
    {
      id: 'hmjr11',
      mod: 'jahr',
      g: 'jahreszeiten',
      q: 'Im Winter steht die Sonne bei uns tiefer und scheint kürzer.',
      rf: true,
      a: true,
      why: 'Deshalb ist es im Winter kälter.',
    },
    {
      id: 'hmjr12',
      mod: 'jahr',
      g: 'jahreszeiten',
      q: 'Wenn bei uns Sommer ist, ist in Australien …',
      o: ['Winter', 'auch Sommer', 'Frühling'],
      a: 0,
      why: 'Australien liegt auf der Südhalbkugel. Dort ist es genau umgekehrt.',
    },
    {
      id: 'hmjr13',
      mod: 'jahr',
      g: 'jahreszeiten',
      q: 'In Australien ist Weihnachten im Sommer.',
      rf: true,
      a: true,
      why: 'Im Dezember ist die Südhalbkugel zur Sonne geneigt. Dort ist dann Sommer.',
    },
    {
      id: 'hmjr14',
      mod: 'jahr',
      g: 'jahreszeiten',
      q: 'Was ist im März und im September besonders?',
      o: ['Tag und Nacht sind etwa gleich lang', 'Der Tag ist am längsten', 'Die Sonne geht nicht unter'],
      a: 0,
      why: 'Diese Tage heißen Tagundnachtgleiche.',
    },
    {
      id: 'hmjr15',
      mod: 'jahr',
      g: 'jahreszeiten',
      q: 'Die Achse der Erde zeigt das ganze Jahr in dieselbe Richtung.',
      rf: true,
      a: true,
      why: 'Deshalb ist mal die Nordhälfte zur Sonne geneigt und mal die Südhälfte.',
    },
    {
      id: 'hmjr16',
      mod: 'jahr',
      g: 'jahreszeiten',
      q: 'Warum ist es bei uns im Winter kälter?',
      o: ['Die Sonne steht tiefer und scheint kürzer', 'Die Sonne ist weiter weg', 'Die Sonne ist schwächer geworden'],
      a: 0,
    },
    // the Moon
    {
      id: 'hmmo1',
      mod: 'mond',
      g: 'mond',
      q: 'Woher kommt das Licht des Mondes?',
      o: ['Von der Sonne', 'Der Mond leuchtet selbst', 'Von den Sternen'],
      a: 0,
      why: 'Der Mond wirft das Licht der Sonne zurück.',
    },
    {
      id: 'hmmo2',
      mod: 'mond',
      g: 'mond',
      q: 'Wie lange braucht der Mond ungefähr für einen Weg um die Erde?',
      o: ['Einen Monat', 'Einen Tag', 'Ein Jahr'],
      a: 0,
    },
    {
      id: 'hmmo3',
      mod: 'mond',
      g: 'mond',
      q: 'Der Mond kreist um die Erde.',
      rf: true,
      a: true,
    },
    {
      id: 'hmmo4',
      mod: 'mond',
      g: 'mond',
      q: 'Was gibt es auf dem Mond nicht?',
      o: ['Luft zum Atmen', 'Krater', 'Staub und Gestein'],
      a: 0,
      why: 'Der Mond hat keine Luft. Deshalb tragen Astronauten dort einen Raumanzug.',
    },
    {
      id: 'hmmo5',
      mod: 'mond',
      g: 'mond',
      q: 'Woher kommen die vielen Krater auf dem Mond?',
      o: [
        'Gesteinsbrocken aus dem All sind eingeschlagen',
        'Astronauten haben sie gegraben',
        'Regen hat sie ausgespült',
      ],
      a: 0,
    },
    {
      id: 'hmmo6',
      mod: 'mond',
      g: 'mond',
      q: 'Wir sehen vom Mond immer dieselbe Seite.',
      rf: true,
      a: true,
      why: 'Er dreht sich genau so schnell um sich selbst, wie er um die Erde kreist.',
    },
    {
      id: 'hmmo7',
      mod: 'mond',
      g: 'mond',
      q: 'Wer betrat als erster Mensch den Mond?',
      o: ['Neil Armstrong', 'Juri Gagarin', 'Alexander Gerst'],
      a: 0,
      why: 'Das war 1969 mit Apollo 11.',
    },
    {
      id: 'hmmo8',
      mod: 'mond',
      g: 'mond',
      q: 'Auf dem Mond kann man höher springen als auf der Erde.',
      rf: true,
      a: true,
      why: 'Der Mond zieht schwächer an als die Erde.',
    },
    {
      id: 'hmmo9',
      mod: 'mond',
      g: 'mond',
      q: 'Der Mond ist ein Stern.',
      rf: true,
      a: false,
      why: 'Der Mond kreist um die Erde und leuchtet nicht selbst. Sterne leuchten selbst.',
    },
    {
      id: 'hmmo10',
      mod: 'mond',
      g: 'phasen',
      q: 'Wie heißt es, wenn der Mond nicht zu sehen ist?',
      o: ['Neumond', 'Vollmond', 'Halbmond'],
      a: 0,
    },
    {
      id: 'hmmo11',
      mod: 'mond',
      g: 'phasen',
      q: 'Wie heißt es, wenn der Mond ganz rund ist?',
      o: ['Vollmond', 'Neumond', 'Mondsichel'],
      a: 0,
    },
    {
      id: 'hmmo12',
      mod: 'mond',
      g: 'phasen',
      q: 'Warum sieht der Mond nicht immer gleich aus?',
      o: [
        'Wir sehen von seiner hellen Hälfte mal mehr, mal weniger',
        'Die Erde wirft ihren Schatten auf ihn',
        'Wolken verdecken jedes Mal ein Stück',
      ],
      a: 0,
      why: 'Die Sonne beleuchtet immer eine Hälfte des Mondes. Während er um die Erde kreist, sehen wir davon mal mehr, mal weniger.',
    },
    {
      id: 'hmmo13',
      mod: 'mond',
      g: 'phasen',
      q: 'Was kommt nach dem Vollmond?',
      o: ['Der abnehmende Mond', 'Sofort der Neumond', 'Der zunehmende Mond'],
      a: 0,
      why: 'Nach dem Vollmond wird der helle Teil wieder kleiner, bis zum Neumond.',
    },
    {
      id: 'hmmo14',
      mod: 'mond',
      g: 'phasen',
      q: 'Wie lange dauert es ungefähr von Vollmond zu Vollmond?',
      o: ['Einen Monat', 'Eine Woche', 'Ein Jahr'],
      a: 0,
      why: 'Es sind etwa 29 und ein halber Tag.',
    },
    {
      id: 'hmmo15',
      mod: 'mond',
      g: 'phasen',
      q: 'Bei uns gilt: Ist beim Mond die rechte Seite hell, nimmt er zu.',
      rf: true,
      a: true,
    },
    {
      id: 'hmmo16',
      mod: 'mond',
      g: 'phasen',
      q: 'Die Mondsichel ist links hell und rund wie der Bauch eines kleinen a. Was macht der Mond?',
      o: ['Er nimmt ab', 'Er nimmt zu', 'Er ist voll'],
      a: 0,
      why: 'a wie abnehmend. Diese Merkhilfe gilt bei uns auf der Nordhalbkugel.',
    },
    {
      id: 'hmmo17',
      mod: 'mond',
      g: 'phasen',
      q: 'In Australien sieht der zunehmende Mond andersherum aus als bei uns.',
      rf: true,
      a: true,
      why: 'Auf der Südhalbkugel wird zuerst die linke Seite hell.',
    },
    {
      id: 'hmmo18',
      mod: 'mond',
      g: 'phasen',
      q: 'Bei welcher Mondphase steht der Mond zwischen Erde und Sonne?',
      o: ['Neumond', 'Vollmond', 'Halbmond'],
      a: 0,
      why: 'Dann zeigt seine beleuchtete Seite von uns weg.',
    },
    // the planets
    {
      id: 'hmpl1',
      mod: 'planeten',
      g: 'innen',
      q: 'Wie viele Planeten kreisen um die Sonne?',
      o: ['Acht', 'Neun', 'Zwölf'],
      a: 0,
      why: 'Pluto zählt seit 2006 nicht mehr dazu. Er ist ein Zwergplanet.',
    },
    {
      id: 'hmpl2',
      mod: 'planeten',
      g: 'innen',
      q: 'Welcher Planet ist der Sonne am nächsten?',
      o: ['Merkur', 'Venus', 'Mars'],
      a: 0,
    },
    {
      id: 'hmpl3',
      mod: 'planeten',
      g: 'innen',
      q: 'Welcher Planet ist der kleinste?',
      o: ['Merkur', 'Mars', 'Neptun'],
      a: 0,
    },
    {
      id: 'hmpl4',
      mod: 'planeten',
      g: 'innen',
      q: 'Welcher Planet ist der heißeste?',
      o: ['Venus', 'Merkur', 'Mars'],
      a: 0,
      why: 'Ihre dicke Lufthülle hält die Wärme fest. Darum ist sie heißer als Merkur, obwohl Merkur näher an der Sonne ist.',
    },
    {
      id: 'hmpl5',
      mod: 'planeten',
      g: 'innen',
      q: 'Welcher Planet leuchtet nach Sonne und Mond am hellsten am Himmel?',
      o: ['Venus', 'Jupiter', 'Mars'],
      a: 0,
      why: 'Man nennt sie Abendstern oder Morgenstern. Sie ist aber ein Planet.',
    },
    {
      id: 'hmpl6',
      mod: 'planeten',
      g: 'innen',
      q: 'Der wievielte Planet von der Sonne aus ist die Erde?',
      o: ['Der dritte', 'Der erste', 'Der fünfte'],
      a: 0,
      why: 'Merkur, Venus, dann die Erde.',
    },
    {
      id: 'hmpl7',
      mod: 'planeten',
      g: 'innen',
      q: 'Die Erde ist der einzige Planet, auf dem wir Leben kennen.',
      rf: true,
      a: true,
      why: 'Von allen Planeten hat nur die Erde Meere aus flüssigem Wasser.',
    },
    {
      id: 'hmpl8',
      mod: 'planeten',
      g: 'innen',
      q: 'Warum heißt der Mars der Rote Planet?',
      o: ['Sein Staub ist rötlich wie Rost', 'Er ist glühend heiß', 'Er hat rote Wolken'],
      a: 0,
      why: 'Im Staub steckt Eisen, das gerostet ist.',
    },
    {
      id: 'hmpl9',
      mod: 'planeten',
      g: 'innen',
      q: 'Welche Planeten haben eine feste Oberfläche aus Gestein?',
      o: ['Merkur, Venus, Erde und Mars', 'Jupiter und Saturn', 'Alle acht'],
      a: 0,
    },
    {
      id: 'hmpl10',
      mod: 'planeten',
      g: 'innen',
      q: 'Merksatz: Mein Vater erklärt mir jeden Sonntag unseren Nachthimmel. Wofür steht das erste M?',
      o: ['Merkur', 'Mars', 'Mond'],
      a: 0,
      why: 'Die Anfangsbuchstaben sind die Planeten der Reihe nach: Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus, Neptun.',
    },
    {
      id: 'hmpl11',
      mod: 'planeten',
      g: 'aussen',
      q: 'Welcher Planet ist der größte?',
      o: ['Jupiter', 'Saturn', 'Erde'],
      a: 0,
    },
    {
      id: 'hmpl12',
      mod: 'planeten',
      g: 'aussen',
      q: 'Wofür ist der Saturn besonders bekannt?',
      o: ['Für seine großen, hellen Ringe', 'Für seine rote Farbe', 'Für seine Meere'],
      a: 0,
    },
    {
      id: 'hmpl13',
      mod: 'planeten',
      g: 'aussen',
      q: 'Nur der Saturn hat Ringe.',
      rf: true,
      a: false,
      why: 'Auch Jupiter, Uranus und Neptun haben Ringe. Sie sind aber dünn und dunkel.',
    },
    {
      id: 'hmpl14',
      mod: 'planeten',
      g: 'aussen',
      q: 'Welcher Planet ist am weitesten von der Sonne entfernt?',
      o: ['Neptun', 'Uranus', 'Saturn'],
      a: 0,
    },
    {
      id: 'hmpl15',
      mod: 'planeten',
      g: 'aussen',
      q: 'Was ist der Große Rote Fleck auf dem Jupiter?',
      o: ['Ein riesiger Wirbelsturm', 'Ein Vulkan', 'Ein See'],
      a: 0,
    },
    {
      id: 'hmpl16',
      mod: 'planeten',
      g: 'aussen',
      q: 'Woraus bestehen Jupiter, Saturn, Uranus und Neptun vor allem?',
      o: ['Aus Gas', 'Aus Gestein', 'Aus Eisen'],
      a: 0,
      why: 'Sie heißen Gasplaneten.',
    },
    {
      id: 'hmpl17',
      mod: 'planeten',
      g: 'aussen',
      q: 'Auf dem Jupiter könnte man landen und spazieren gehen.',
      rf: true,
      a: false,
      why: 'Jupiter ist ein Gasplanet und hat keinen festen Boden.',
    },
    {
      id: 'hmpl18',
      mod: 'planeten',
      g: 'aussen',
      q: 'Welcher Planet liegt fast auf der Seite?',
      o: ['Uranus', 'Mars', 'Venus'],
      a: 0,
      why: 'Seine Achse ist so stark gekippt, dass er auf seinem Weg um die Sonne rollt.',
    },
    {
      id: 'hmpl19',
      mod: 'planeten',
      g: 'aussen',
      q: 'Auf welchem Planeten wehen die stärksten Winde?',
      o: ['Neptun', 'Erde', 'Merkur'],
      a: 0,
    },
    // the Sun and the stars
    {
      id: 'hmst1',
      mod: 'sterne',
      g: 'sonne',
      q: 'Was ist die Sonne?',
      o: ['Ein Stern', 'Ein Planet', 'Ein Mond'],
      a: 0,
    },
    {
      id: 'hmst2',
      mod: 'sterne',
      g: 'sonne',
      q: 'Welcher Stern ist der Erde am nächsten?',
      o: ['Die Sonne', 'Der Polarstern', 'Ein Stern im Großen Wagen'],
      a: 0,
    },
    {
      id: 'hmst3',
      mod: 'sterne',
      g: 'sonne',
      q: 'Warum sieht die Sonne viel größer aus als die anderen Sterne?',
      o: ['Sie ist uns viel näher', 'Sie ist der größte Stern', 'Die anderen Sterne sind winzig'],
      a: 0,
      why: 'Die anderen Sterne sind sehr weit weg. Viele von ihnen sind größer als die Sonne.',
    },
    {
      id: 'hmst4',
      mod: 'sterne',
      g: 'sonne',
      q: 'Wie lange ist das Licht von der Sonne bis zur Erde unterwegs?',
      o: ['Etwas mehr als 8 Minuten', 'Einen ganzen Tag', 'Gar keine Zeit'],
      a: 0,
    },
    {
      id: 'hmst5',
      mod: 'sterne',
      g: 'sonne',
      q: 'Woraus besteht die Sonne?',
      o: ['Aus glühend heißem Gas', 'Aus Gestein', 'Aus Eis'],
      a: 0,
    },
    {
      id: 'hmst6',
      mod: 'sterne',
      g: 'sonne',
      q: 'Mit einem Fernglas darfst du kurz in die Sonne schauen.',
      rf: true,
      a: false,
      why: 'Schau nie direkt in die Sonne, auch nicht mit Fernglas oder Fernrohr. Das Licht kann deine Augen für immer verletzen.',
    },
    {
      id: 'hmst7',
      mod: 'sterne',
      g: 'sonne',
      q: 'Warum siehst du am Tag keine Sterne?',
      o: ['Die Sonne ist viel heller', 'Die Sterne sind am Tag nicht da', 'Die Sterne gehen am Morgen aus'],
      a: 0,
    },
    {
      id: 'hmst8',
      mod: 'sterne',
      g: 'sonne',
      q: 'Eine Sternschnuppe ist ein Stern, der vom Himmel fällt.',
      rf: true,
      a: false,
      why: 'Ein winziges Teilchen aus dem All verglüht hoch in der Luft. Das leuchtet kurz auf.',
    },
    {
      id: 'hmst9',
      mod: 'sterne',
      g: 'sonne',
      q: 'Zu welcher riesigen Gruppe von Sternen gehört unsere Sonne?',
      o: ['Zur Milchstraße', 'Zum Großen Wagen', 'Zum Orion'],
      a: 0,
    },
    {
      id: 'hmst10',
      mod: 'sterne',
      g: 'sternbilder',
      q: 'Was ist ein Sternbild?',
      o: [
        'Helle Sterne, die man in Gedanken zu einem Bild verbindet',
        'Ein Foto vom Himmel',
        'Ein einzelner heller Stern',
      ],
      a: 0,
    },
    {
      id: 'hmst11',
      mod: 'sterne',
      g: 'sternbilder',
      q: 'Aus wie vielen hellen Sternen besteht der Große Wagen?',
      o: ['Aus sieben', 'Aus drei', 'Aus zwölf'],
      a: 0,
      why: 'Vier bilden den Kasten, drei die Deichsel.',
    },
    {
      id: 'hmst12',
      mod: 'sterne',
      g: 'sternbilder',
      q: 'Zu welchem Sternbild gehört der Große Wagen?',
      o: ['Zum Großen Bären', 'Zum Orion', 'Zur Kassiopeia'],
      a: 0,
    },
    {
      id: 'hmst13',
      mod: 'sterne',
      g: 'sternbilder',
      q: 'Wie findest du den Polarstern?',
      o: [
        'Die hintere Wand des Großen Wagens etwa fünfmal verlängern',
        'Der Deichsel des Großen Wagens folgen',
        'Den hellsten Stern am Himmel suchen',
      ],
      a: 0,
      why: 'Der Polarstern ist nicht der hellste Stern. Man findet ihn mit dem Großen Wagen.',
    },
    {
      id: 'hmst14',
      mod: 'sterne',
      g: 'sternbilder',
      q: 'In welche Himmelsrichtung zeigt der Polarstern?',
      o: ['Nach Norden', 'Nach Süden', 'Nach Osten'],
      a: 0,
    },
    {
      id: 'hmst15',
      mod: 'sterne',
      g: 'sternbilder',
      q: 'Den Großen Wagen siehst du bei uns in jeder klaren Nacht des Jahres.',
      rf: true,
      a: true,
      why: 'In Deutschland geht er nie unter.',
    },
    {
      id: 'hmst16',
      mod: 'sterne',
      g: 'sternbilder',
      q: 'Warum siehst du in der Stadt weniger Sterne als auf dem Land?',
      o: [
        'Die vielen Lampen machen den Himmel hell',
        'Über der Stadt gibt es weniger Sterne',
        'Die Häuser sind zu hoch',
      ],
      a: 0,
    },
    {
      id: 'hmst17',
      mod: 'sterne',
      g: 'sternbilder',
      q: 'Mit welchem Stern endet die Deichsel des Kleinen Wagens?',
      o: ['Mit dem Polarstern', 'Mit der Sonne', 'Mit dem Abendstern'],
      a: 0,
    },
    // astronauts and the ISS
    {
      id: 'hmrf1',
      mod: 'raumfahrt',
      g: 'iss',
      q: 'Was ist die ISS?',
      o: ['Eine Raumstation, die um die Erde kreist', 'Eine Rakete zum Mars', 'Ein Fernrohr auf einem Berg'],
      a: 0,
    },
    {
      id: 'hmrf2',
      mod: 'raumfahrt',
      g: 'iss',
      q: 'Warum schweben die Astronauten in der ISS?',
      o: ['Sie sind schwerelos', 'Die ISS ist voll Wasser', 'Sie tragen Luftballons'],
      a: 0,
      why: 'In der Raumstation schwebt alles, was nicht festgemacht ist.',
    },
    {
      id: 'hmrf3',
      mod: 'raumfahrt',
      g: 'iss',
      q: 'Wie schlafen Astronauten auf der ISS?',
      o: ['In einem Schlafsack, der an der Wand festgemacht ist', 'In einem Himmelbett', 'Auf dem Boden'],
      a: 0,
      why: 'Sonst würden sie im Schlaf durch die Station treiben.',
    },
    {
      id: 'hmrf4',
      mod: 'raumfahrt',
      g: 'iss',
      q: 'Wie oft sehen die Astronauten der ISS an einem Tag die Sonne aufgehen?',
      o: ['Etwa 16-mal', 'Einmal', 'Nie'],
      a: 0,
      why: 'Die ISS kreist so schnell um die Erde, dass sie etwa alle 90 Minuten vom Dunkeln ins Sonnenlicht kommt.',
    },
    {
      id: 'hmrf5',
      mod: 'raumfahrt',
      g: 'iss',
      q: 'Wie lange braucht die ISS für eine Runde um die Erde?',
      o: ['Etwa 90 Minuten', 'Einen Tag', 'Ein Jahr'],
      a: 0,
    },
    {
      id: 'hmrf6',
      mod: 'raumfahrt',
      g: 'iss',
      q: 'Auf der ISS leben seit vielen Jahren ständig Menschen.',
      rf: true,
      a: true,
      why: 'Seit dem Jahr 2000 ist immer eine Besatzung an Bord.',
    },
    {
      id: 'hmrf7',
      mod: 'raumfahrt',
      g: 'iss',
      q: 'Was machen die Astronauten auf der ISS vor allem?',
      o: ['Sie forschen und machen Versuche', 'Sie machen Urlaub', 'Sie zählen Sterne'],
      a: 0,
    },
    {
      id: 'hmrf8',
      mod: 'raumfahrt',
      g: 'iss',
      q: 'Warum treiben Astronauten auf der ISS jeden Tag Sport?',
      o: [
        'Ohne Schwerkraft werden Muskeln und Knochen sonst schwächer',
        'Damit die ISS schneller fliegt',
        'Weil es dort sehr kalt ist',
      ],
      a: 0,
    },
    {
      id: 'hmrf9',
      mod: 'raumfahrt',
      g: 'iss',
      q: 'Wozu braucht ein Astronaut draußen im All einen Raumanzug?',
      o: ['Im All gibt es keine Luft zum Atmen', 'Damit er schneller fliegt', 'Gegen den Regen'],
      a: 0,
      why: 'Der Anzug gibt ihm Luft und schützt ihn vor Hitze und Kälte.',
    },
    {
      id: 'hmrf10',
      mod: 'raumfahrt',
      g: 'iss',
      q: 'Was passiert mit Wasser, das auf der ISS aus einem Becher kommt?',
      o: ['Es schwebt als Kugel davon', 'Es fällt auf den Boden', 'Es gefriert sofort'],
      a: 0,
      why: 'Deshalb trinken die Astronauten aus Beuteln mit Strohhalm.',
    },
    {
      id: 'hmrf11',
      mod: 'raumfahrt',
      g: 'pioniere',
      q: 'Wer flog als erster Mensch ins All?',
      o: ['Juri Gagarin', 'Neil Armstrong', 'Sigmund Jähn'],
      a: 0,
      why: 'Das war 1961.',
    },
    {
      id: 'hmrf12',
      mod: 'raumfahrt',
      g: 'pioniere',
      q: 'Wer flog als erster Deutscher ins All?',
      o: ['Sigmund Jähn', 'Alexander Gerst', 'Neil Armstrong'],
      a: 0,
      why: 'Das war 1978.',
    },
    {
      id: 'hmrf13',
      mod: 'raumfahrt',
      g: 'pioniere',
      q: 'Welcher deutsche Astronaut war 2018 Kommandant der ISS?',
      o: ['Alexander Gerst', 'Sigmund Jähn', 'Juri Gagarin'],
      a: 0,
      why: 'Er war der erste Deutsche in dieser Aufgabe.',
    },
    {
      id: 'hmrf14',
      mod: 'raumfahrt',
      g: 'pioniere',
      q: 'Womit fliegen Astronauten ins All?',
      o: ['Mit einer Rakete', 'Mit einem Flugzeug', 'Mit einem Heißluftballon'],
      a: 0,
    },
    {
      id: 'hmrf15',
      mod: 'raumfahrt',
      g: 'pioniere',
      q: 'Welcher deutsche Astronaut flog 2021 zur ISS?',
      o: ['Matthias Maurer', 'Sigmund Jähn', 'Juri Gagarin'],
      a: 0,
    },
  ];

  const MODULES = {
    tag: { name: 'Tag und Nacht', icon: '☀', maxTier: 1, worldCap: [1], dmg: 12 },
    jahr: { name: 'Jahr und Jahreszeiten', icon: '📅', maxTier: 1, worldCap: [1], dmg: 12 },
    mond: { name: 'Der Mond', icon: '🌙', maxTier: 2, worldCap: [2], dmg: 14 },
    planeten: { name: 'Die Planeten', icon: '🪐', maxTier: 1, worldCap: [1], dmg: 14 },
    sterne: { name: 'Sonne und Sterne', icon: '⭐', maxTier: 1, worldCap: [1], dmg: 12 },
    raumfahrt: { name: 'Astronauten und die ISS', icon: '🚀', maxTier: 1, worldCap: [1], dmg: 12 },
  };
  const TAP = 'Tippe auf die richtige Antwort.';
  const UNDO = 'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.';
  const TUT = {
    'tag:1': {
      title: 'Tag und Nacht',
      steps: [
        'Die Erde dreht sich einmal am Tag um sich selbst. Die Seite zur Sonne hat Tag, die andere Nacht.',
        'Im Bild siehst du die Erde von oben. Die Sonne steht links.',
        'Liegt der rote Punkt auf der hellen Seite, ist dort Tag.',
        TAP,
      ],
    },
    'sonnenlauf:1': {
      title: 'Der Weg der Sonne',
      steps: ['Die Sätze sind durcheinander.', 'Beginne am Morgen im Osten und folge der Sonne bis zum Abend.', UNDO],
    },
    'jahr:1': {
      title: 'Jahr und Jahreszeiten',
      steps: [
        'Die Erde kreist in einem Jahr um die Sonne. Ihre Achse steht schief und zeigt immer in dieselbe Richtung.',
        'Ist eine Hälfte der Erde zur Sonne geneigt, ist dort Sommer. Ist sie weggeneigt, ist dort Winter.',
        'Im Bild markiert N den Nordpol. Deutschland liegt auf der Nordhälfte, Australien auf der Südhälfte.',
        TAP,
      ],
    },
    'mond:1': {
      title: 'Der Mond',
      steps: [
        'Der Mond kreist in etwa einem Monat um die Erde. Er leuchtet nicht selbst, die Sonne strahlt ihn an.',
        'Neumond: nicht zu sehen. Mondsichel: ein schmaler Streifen. Halbmond: eine Hälfte. Vollmond: ganz rund.',
        TAP,
      ],
    },
    'mond:2': {
      title: 'Nimmt der Mond zu oder ab?',
      steps: [
        'Bei uns gilt: Ist die rechte Seite hell, nimmt der Mond zu.',
        'Ist die linke Seite hell, nimmt er ab. Die Sichel ist dann rund wie der Bauch eines kleinen a: a wie abnehmend.',
        TAP,
      ],
    },
    'phasen:1': {
      title: 'Die Mondphasen ordnen',
      steps: [
        'Die Mondphasen sind durcheinander.',
        'Beginne beim Neumond. Erst wird der Mond rechts hell und wächst bis zum Vollmond, dann wird er von rechts her wieder schmaler.',
        UNDO,
      ],
    },
    'planeten:1': {
      title: 'Die Planeten',
      steps: [
        'Acht Planeten kreisen um die Sonne. Der Merksatz hilft: Mein Vater erklärt mir jeden Sonntag unseren Nachthimmel.',
        'Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus, Neptun.',
        'Zeigt ein Pfeil auf einen Planeten, zähle von der Sonne aus.',
        TAP,
      ],
    },
    'reihe:1': {
      title: 'Planeten ordnen',
      steps: [
        'Die Namen sind durcheinander.',
        'Beginne mit dem Planeten, der der Sonne am nächsten ist. Der Merksatz hilft dir.',
        UNDO,
      ],
    },
    'sterne:1': {
      title: 'Sonne und Sterne',
      steps: [
        'Die Sonne ist ein Stern. Die anderen Sterne sind viel weiter weg.',
        'In Sternbildern verbinden wir helle Sterne zu Bildern, zum Beispiel zum Großen Wagen.',
        'Den Polarstern findest du, wenn du die hintere Wand des Großen Wagens etwa fünfmal nach oben verlängerst.',
        TAP,
      ],
    },
    'raumfahrt:1': {
      title: 'Astronauten und die ISS',
      steps: [
        'Die ISS ist eine Raumstation, die um die Erde kreist. Dort leben und forschen Astronauten.',
        'An Bord sind alle schwerelos.',
        TAP,
      ],
    },
    'raumflug:1': {
      title: 'Der Flug zur ISS',
      steps: ['Die Sätze sind durcheinander.', 'Beginne mit dem Training auf der Erde und ende mit der Landung.', UNDO],
    },
  };

  function gen(cfg: Unit) {
    return (mod: string, tier: number, _know: Know, _seq: number, opts?: GenOpts) => {
      if (wantsPool(cfg, mod, opts)) return null;
      const r = Math.random();
      if (mod === 'tag' && r < 0.35) return dayNightTask(mod);
      if (mod === 'tag' && r < 0.45)
        return orderTask(
          mod,
          'sonnenlauf:1',
          'sonnenlauf',
          'Von morgens bis abends: Tippe die Sätze in der richtigen Reihenfolge an.',
          SONNENLAUF,
          'hmsl_',
        );
      if (mod === 'jahr' && r < 0.35) return seasonTask(mod);
      if (mod === 'mond') {
        if (tier >= 2 && r < 0.35) return waxTask(mod);
        if (r < 0.25) return phaseTask(mod);
        if (r < 0.35)
          return orderTask(
            mod,
            'phasen:1',
            'phasen',
            'Ein Monat am Himmel: Tippe die Mondphasen in der richtigen Reihenfolge an. Fang beim Neumond an.',
            MONDLAUF,
            'hmml_',
          );
      }
      if (mod === 'planeten' && r < 0.2) return rowTask(mod);
      if (mod === 'planeten' && r < 0.3) return lookTask(mod);
      if (mod === 'planeten' && r < 0.4)
        return orderTask(
          mod,
          'reihe:1',
          'innen',
          'Tippe die Planeten der Reihe nach an. Fang mit dem an, der der Sonne am nächsten ist.',
          REIHE,
          'hmpo_',
          5,
        );
      if (mod === 'sterne' && r < 0.2) return figureTask(mod);
      if (mod === 'sterne' && r < 0.3) return polarTask(mod);
      if (mod === 'raumfahrt' && r < 0.2)
        return orderTask(
          mod,
          'raumflug:1',
          'iss',
          'Eine Reise zur ISS: Tippe die Sätze in der richtigen Reihenfolge an.',
          RAUMFLUG,
          'hmrf_',
        );
      return null;
    };
  }

  const HI: Unit = {
    modules: MODULES,
    tut: TUT,
    notes: NOTES,
    pool: POOL,
    worlds: 1,
    grade: 3,
    subject: 'Sachkunde',
    title: 'Sonne, Mond und Sterne',
    icon: '🔭',
    sub: 'Tag und Nacht, Jahreszeiten, Mondphasen, die acht Planeten, Sternbilder und die Raumstation ISS',
    starters: [
      {
        id: 'astronomin',
        type: 'normal',
        shape: 'astronomin',
        names: ['Die Astronomin', 'Die Astronomin', 'Die Astronomin'],
        hp: 70,
        desc: 'Sie arbeitet nachts in der Sternwarte. Mit ihrem Fernrohr beobachtet sie Mond, Planeten und Sterne.',
        perk: 'none',
        attacks: [
          { name: 'Globus', mod: 'tag' },
          { name: 'Mondkarte', mod: 'mond' },
          { name: 'Planetenmodell', mod: 'planeten' },
          { name: 'Fernrohr', mod: 'sterne' },
        ],
      },
    ],
    extra: {
      tag: 'Sonnenuhr',
      jahr: 'Erdachse',
      mond: 'Kraterkarte',
      planeten: 'Saturnring',
      sterne: 'Sternkarte',
      raumfahrt: 'Raumanzug',
    },
    enemies: {
      1: {
        normal: [
          { name: 'Die Wolkendecke', type: 'wasser', shape: 'wolkendecke', hp: 26, atk: 3 },
          { name: 'Die Straßenlaterne', type: 'feuer', shape: 'strassenlaterne', hp: 24, atk: 4 },
          { name: 'Der Weltraumschrott', type: 'normal', shape: 'weltraumschrott', hp: 28, atk: 4 },
          { name: 'Der Staubsturm', type: 'pflanze', shape: 'staubsturm', hp: 30, atk: 3 },
        ],
        elite: { name: 'Der Sonnensturm', type: 'feuer', shape: 'sonnensturm', hp: 45, atk: 5 },
        boss: {
          name: 'Der Asteroid',
          acc: 'den Asteroiden',
          type: 'normal',
          shape: 'asteroid',
          hp: 70,
          atk: 6,
          boss: true,
        },
      },
    },
    moves: ['Nebelschleier', 'Lichtkegel', 'Trümmerhagel', 'Staubwolke', 'Sonnenwind', 'Einschlag'],
    events: [
      {
        title: 'Die Sternwarte',
        text: 'Auf dem Dach der Sternwarte öffnet sich die Kuppel. Die Astronomin am Fernrohr fragt dich nach den Sternen und schenkt dir einen Trank.',
        opts: [
          { label: 'Antworten', task: 'sterne', g: 'sternbilder', win: { item: 'trank' }, lose: { hp: -6 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Das Planetarium',
        text: 'Unter der Kuppel des Planetariums wandern die Planeten über die Decke. Die Sprecherin gibt dir einen Schild, wenn du ihre Frage beantwortest.',
        opts: [
          { label: 'Antworten', task: 'planeten', g: 'aussen', win: { item: 'schild' }, lose: { hp: -5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Der Balkon',
        text: 'Opa steht abends auf dem Balkon und zeigt auf den Mond. Er fragt dich, wie der Mond gerade aussieht, und gibt dir eine Chilischote.',
        opts: [
          { label: 'Antworten', task: 'mond', g: 'phasen', win: { item: 'keks' }, lose: { xp: 5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Die Sonnenuhr im Park',
        text: 'Im Park steht eine Sonnenuhr. Der Gärtner kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort zum Weg der Sonne.',
        opts: [
          { label: 'Antworten', task: 'tag', g: 'sonnenlauf', win: { item: 'lupe' }, lose: { xp: 5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Das Raumfahrtmuseum',
        text: 'Im Museum hängt eine echte Raumkapsel. Ein Junge fragt dich, wie man auf der ISS lebt.',
        opts: [
          { label: 'Antworten', task: 'raumfahrt', g: 'iss', win: { xp: 20 }, lose: { xp: 5 } },
          { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } },
        ],
      },
      {
        title: 'Der Kalender',
        text: 'In der Klasse hängt ein Kalender. Die Lehrerin fragt, warum es Jahreszeiten gibt, und gibt dir einen Trank für die richtige Antwort.',
        opts: [
          { label: 'Antworten', task: 'jahr', g: 'jahreszeiten', win: { item: 'trank' }, lose: { hp: -5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Die Sternschnuppennacht',
        dilemma: true,
        reward: { hp: 5 },
        text: 'Im August wollt ihr im Garten Sternschnuppen beobachten. Im Nachbargarten brennt eine helle Lampe, und der Himmel ist dadurch heller.',
        opts: [
          {
            label: 'Ich frage den Nachbarn, ob er die Lampe für eine Stunde ausmacht.',
            then: 'Der Nachbar macht die Lampe aus und setzt sich zu euch. Nach einer Weile seht ihr die erste Sternschnuppe.',
            think: 'Warum fällt es manchen Menschen leicht, um etwas zu bitten, und anderen schwer?',
          },
          {
            label: 'Ich schlage vor, auf die Wiese hinter dem Haus zu gehen.',
            then: 'Hinter dem Haus ist es dunkler. Ihr nehmt Decken mit und seht mehr Sterne als im Garten.',
            think: 'Welche Orte in deiner Nähe sind nachts besonders dunkel?',
          },
          {
            label: 'Ich bleibe im Garten und schaue trotzdem.',
            then: 'Ihr seht nur die hellsten Sterne. Eine helle Sternschnuppe zieht trotzdem über den Himmel.',
            think: 'Wie viel Licht braucht man nachts draußen wirklich?',
          },
        ],
      },
      {
        title: 'Die Liegewiese',
        text: 'Auf der Liegewiese vor der Sternwarte liegen Decken. Du ruhst dich aus und schaust in den Himmel.',
        opts: [
          { label: 'Ausruhen (+15 LP)', effect: { hp: 15 } },
          { label: 'Weiter', effect: {} },
        ],
      },
    ],
  };
  HI.gen = gen(HI);
  K.MODES.himmel = HI;
  return {
    PLANETS,
    NAMES,
    PHASES,
    PHASE_NAME,
    FIGURES,
    SHAPES,
    WAGEN,
    POLAR,
    DECOYS,
    DAY,
    NIGHT,
    EARTH,
    SONNENLAUF,
    MONDLAUF,
    REIHE,
    RAUMFLUG,
    dayNightSVG,
    seasonSVG,
    moonSVG,
    planetsSVG,
    lookSVG,
    figureSVG,
    polarSVG,
  };
})();
