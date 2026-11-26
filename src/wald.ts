// Sachkunde grade 3: Der Wald. The forest is the habitat of grades 3/4 in several states (lehrplan/quellen-wald.md);
// it builds on the trees of grade 2 (baeume2 in k12_sachkunde.ts) and mirrors Die Wiese (sachkunde3.ts).
// Registers itself in MK.MODES; the two labelled pictures go into MS.PLANTS for the parts tasks.
import { MK as K, type GenOpts, type Know, type Question } from './knowledge.ts';
import type { Unit } from './curriculum.ts';
import { MS as S, type PartsPicture } from './sachkunde.ts';
export const MW = (() => {
  const { shuffle, pick } = K;
  const { choice, orderTask, wantsPool, partsSVG } = S;
  const NS = 'xmlns="http://www.w3.org/2000/svg"';
  const OUT = '#1C2541';
  const f1 = (v: number) => +v.toFixed(1);
  const pic = (box: string, inner: string, label: string, max: number) =>
    `<svg ${NS} class="pic" viewBox="${box}" style="max-width:${max}px" aria-label="${label}"><g stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
  const lgr = (id: string, a: string, b: string) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  // a line with the dark outline under it
  const line = (d: string, c: string, w: number) =>
    `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${w + 1.6}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  // texture strokes sit in style="" so a glowing part keeps them (the glow rule recolours stroke attributes only)
  const tex = (d: string, c: string, w: number, o?: number) =>
    `<path d="${d}" fill="none" style="stroke:${c};stroke-width:${w}"${o ? ` opacity="${o}"` : ''}/>`;

  /* ---------- conifer twigs: needles and cone are what tells the four apart ---------- */
  const TWIG =
    lgr('wdTw', '#B08A62', '#6E4A2E') + lgr('wdCo', '#C99A62', '#7A4E28') + lgr('wdCy', '#D9C08A', '#9A8A52');
  // point and direction (radians) at t on the twig from (x0|y0) to (x1|y1), sagging by `sag` in the middle
  const onTwig = (x0: number, y0: number, x1: number, y1: number, sag: number, t: number) => ({
    x: x0 + (x1 - x0) * t,
    y: y0 + (y1 - y0) * t - sag * 4 * t * (1 - t),
    a: Math.atan2(y1 - y0 - sag * 4 * (1 - 2 * t), x1 - x0),
  });
  const ray = (x: number, y: number, a: number, len: number) =>
    `M${f1(x)} ${f1(y)} L${f1(x + Math.cos(a) * len)} ${f1(y + Math.sin(a) * len)}`;
  // scales as rows of small arcs; up: the scales point to the top (a cone that stands)
  const cone = (cx: number, cy: number, rx: number, ry: number, fill: string, up?: boolean) => {
    let d = '';
    for (let y = cy - ry + 5; y < cy + ry - 2; y += 5.5) {
      const hw = rx * Math.sqrt(1 - ((y - cy) / ry) ** 2),
        n = Math.max(1, Math.round((hw * 2) / 6.5)),
        s = (hw * 2) / n;
      d +=
        `M${f1(cx - hw)} ${f1(y)}` +
        Array.from({ length: n }, () => `q${f1(s / 2)} ${up ? -4 : 4} ${f1(s)} 0`).join('');
    }
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${OUT}" stroke-width="1.4"/><path d="${d}" fill="none" stroke="#4E3018" stroke-width=".9"/>`;
  };
  const TWIGS: Record<string, () => string> = {
    // spruce: pointed needles all around the twig, a long cone that hangs
    fichte: () => {
      let n = '';
      for (let i = 0; i <= 17; i++) {
        const p = onTwig(12, 30, 98, 33, 6, i / 17);
        n +=
          ray(p.x, p.y, p.a - 1.05, 11) +
          ray(p.x, p.y, p.a + 1.05, 11) +
          ray(p.x + 3, p.y, p.a - 0.45, 8) +
          ray(p.x + 3, p.y, p.a + 0.45, 8);
      }
      return (
        line(n, '#3E8A3A', 1.1) +
        line('M12 30 Q56 18 102 33', 'url(#wdTw)', 3.4) +
        line('M72 27 L72 38', '#8A6238', 2) +
        cone(72, 72, 11.5, 35, 'url(#wdCo)')
      );
    },
    // fir: flat, blunt needles in two rows, a cone that stands on the twig
    tanne: () => {
      let n = '';
      for (let i = 0; i <= 14; i++) {
        const p = onTwig(14, 92, 106, 88, 4, i / 14);
        n += ray(p.x, p.y, p.a - 1.5, 12) + ray(p.x, p.y, p.a + 1.5, 12);
      }
      return (
        line(n, '#2E7A4A', 3.2) +
        tex(n, '#9AD0A0', 0.8, 0.9) +
        line('M10 92 Q60 82 110 88', 'url(#wdTw)', 3.4) +
        cone(64, 46, 12, 33, 'url(#wdCy)', true)
      );
    },
    // pine: long needles in pairs, a small egg-shaped cone
    kiefer: () => {
      let n = '';
      for (let i = 0; i <= 8; i++) {
        const p = onTwig(34, 87, 86, 84, 3, i / 8),
          a = -2.35 + (i / 8) * 1.56;
        n += ray(p.x, p.y, a - 0.1, 33) + ray(p.x, p.y, a + 0.1, 33);
      }
      return (
        line(n, '#4E9A4A', 1.4) +
        line('M26 88 Q60 78 94 84', 'url(#wdTw)', 3.6) +
        `<g transform="rotate(14 50 102)">${cone(50, 102, 10.5, 14, 'url(#wdCo)')}</g>`
      );
    },
    // larch: soft needles in bunches on short knobs, small cones that stand
    laerche: () => {
      let n = '',
        knobs = '';
      [0.06, 0.24, 0.42, 0.6, 0.78, 0.95].forEach((t, i) => {
        const p = onTwig(8, 66, 112, 62, 5, t),
          up = i % 2 ? 1 : -1;
        const kx = p.x,
          ky = p.y + up * 4;
        knobs += `<circle cx="${f1(kx)}" cy="${f1(ky)}" r="2.6" fill="#8A6238" stroke="${OUT}" stroke-width="1"/>`;
        for (let k = 0; k < 11; k++) n += ray(kx, ky, up * (Math.PI / 2) - 1.25 + (k / 10) * 2.5, 13);
      });
      return (
        line(n, '#8CC858', 1.3) +
        line('M8 66 Q60 54 112 62', 'url(#wdTw)', 3.2) +
        knobs +
        cone(34, 49, 7, 10, 'url(#wdCo)', true) +
        cone(84, 48, 7, 10, 'url(#wdCo)', true)
      );
    },
  };
  const twigSVG = (id: string) =>
    pic(
      '0 0 120 120',
      `<defs>${TWIG}</defs><ellipse cx="60" cy="60" rx="58" ry="56" fill="#EEF6E2"/>${TWIGS[id]()}`,
      'Zweig eines Nadelbaumes mit Zapfen',
      170,
    );
  const NADEL = [
    { id: 'fichte', name: 'Fichte' },
    { id: 'tanne', name: 'Tanne' },
    { id: 'kiefer', name: 'Kiefer' },
    { id: 'laerche', name: 'Lärche' },
  ];
  const TREES = NADEL.concat([
    { id: 'eiche', name: 'Eiche' },
    { id: 'buche', name: 'Buche' },
    { id: 'birke', name: 'Birke' },
    { id: 'ahorn', name: 'Ahorn' },
  ]);
  // has: the trees with this trait; skip: close enough to confuse as a wrong answer
  const TREE_TRAITS: { q: string; has: string[]; skip?: string[] }[] = [
    { q: 'Welcher Laubbaum hat eine glatte, silbergraue Rinde?', has: ['buche'], skip: ['tanne'] },
    { q: 'Welcher Baum hat eine weiße Rinde mit schwarzen Stellen?', has: ['birke'] },
    { q: 'Welcher Baum hat eine dicke Rinde mit tiefen Furchen und Blätter mit runden Buchten?', has: ['eiche'] },
    { q: 'Welcher Nadelbaum hat flache, stumpfe Nadeln mit zwei weißen Streifen auf der Unterseite?', has: ['tanne'] },
    {
      q: 'Bei welchem Baum stehen große Zapfen aufrecht auf dem Zweig und zerfallen am Baum?',
      has: ['tanne'],
      skip: ['laerche'],
    },
    {
      q: 'Bei welchem Baum hängen lange Zapfen nach unten und fallen als Ganzes ab?',
      has: ['fichte'],
      skip: ['kiefer'],
    },
    { q: 'Welcher Nadelbaum hat spitze Nadeln rund um den Zweig, die stechen?', has: ['fichte'], skip: ['kiefer'] },
    { q: 'Welcher Nadelbaum hat lange Nadeln, die immer zu zweit wachsen?', has: ['kiefer'] },
    { q: 'Welcher Nadelbaum hat weiche Nadeln in Büscheln und wirft sie im Herbst ab?', has: ['laerche'] },
    { q: 'Bei welchem Nadelbaum leuchtet der Stamm oben orangerot?', has: ['kiefer'], skip: ['fichte', 'laerche'] },
    { q: 'Welcher Baum trägt Bucheckern in einer stacheligen Hülle?', has: ['buche'] },
    { q: 'Welcher Baum hat Früchte mit zwei Flügeln, die sich beim Fallen drehen?', has: ['ahorn'] },
    { q: 'Von welchem Baum stammen die Eicheln, die Wildschweine im Herbst fressen?', has: ['eiche'] },
    { q: 'Welcher Nadelbaum hat kleine, eiförmige Zapfen und lange Nadeln?', has: ['kiefer'], skip: ['laerche'] },
  ];

  /* ---------- tracks: one print each, the arrow shows where the animal went ---------- */
  const PRINT = '#5E4028';
  const half = (s: number, w: number) =>
    `<path d="M${60 - s * 2} 88 Q${60 - s * w} 72 ${60 - s * (w - 4)} 48 Q${60 - s * (w - 8)} 36 ${60 - s * 3.5} 30 Q${60 - s * 1} 56 ${60 - s * 2} 88 Z"/>`;
  const toe = (x: number, y: number, rx: number, ry: number, rot: number) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})"/>`;
  const TRACKS: Record<string, string> = {
    reh: half(1, 13) + half(-1, 13),
    wildschwein: half(1, 17) + half(-1, 17) + toe(37, 99, 4.2, 6.5, 30) + toe(83, 99, 4.2, 6.5, -30),
    fuchs:
      `<path d="M60 67 Q72 70 73 82 Q60 91 47 82 Q48 70 60 67 Z"/>` +
      toe(53, 50, 5.4, 8, -4) +
      toe(67, 50, 5.4, 8, 4) +
      toe(42, 63, 5, 7.6, -22) +
      toe(78, 63, 5, 7.6, 22) +
      `<path d="M52 38 l1 -5 l2 5 Z M66 38 l1 -5 l2 5 Z M37 52 l-1 -5 l3 4 Z M83 52 l1 -5 l-3 4 Z"/>`,
    dachs:
      `<path d="M35 80 Q60 62 85 80 Q88 95 60 97 Q32 95 35 80 Z"/>` +
      [
        [33, 62, -24],
        [46, 55, -10],
        [60, 52, 0],
        [74, 55, 10],
        [87, 62, 24],
      ]
        .map(
          ([x, y, r]) =>
            toe(x, y, 5, 6.4, r) +
            `<path d="M${x} ${y - 9} L${x} ${y - 20}" fill="none" stroke="${PRINT}" stroke-width="2.6" transform="rotate(${r} ${x} ${y})"/>`,
        )
        .join(''),
    hase: toe(44, 40, 7, 21, -8) + toe(76, 40, 7, 21, 8) + toe(57, 82, 6, 8.5, 0) + toe(64, 103, 6, 8.5, 0),
  };
  const trackSVG = (id: string) =>
    pic(
      '0 0 120 120',
      `<rect x="3" y="3" width="114" height="114" rx="14" fill="#EBDDC0" stroke="#C9B48A" stroke-width="1.5"/><path d="M14 30 q4 -3 8 0 M92 104 q4 -3 8 0 M20 96 q3 -2 6 0" fill="none" stroke="#D2BE96" stroke-width="1.4"/><g fill="${PRINT}">${TRACKS[id]}</g><path d="M106 96 L106 30 M100 38 L106 28 L112 38" fill="none" stroke="#9A8460" stroke-width="2.4"/>`,
      'Abdruck im Boden, der Pfeil zeigt die Laufrichtung',
      170,
    );
  const SPUREN = [
    { id: 'reh', name: 'Reh' },
    { id: 'wildschwein', name: 'Wildschwein' },
    { id: 'fuchs', name: 'Fuchs' },
    { id: 'dachs', name: 'Dachs' },
    { id: 'hase', name: 'Hase' },
  ];
  // each trait fits exactly one of the five
  const TRACK_TRAITS = [
    { q: 'Welches Tier hinterlässt meist nur zwei schmale, spitze Hufabdrücke?', a: 'reh' },
    { q: 'Bei welcher Spur siehst du hinter den zwei Hufhälften noch zwei kleine Abdrücke?', a: 'wildschwein' },
    { q: 'Welche Spur hat vier Zehen mit Krallen und sieht aus wie von einem kleinen Hund?', a: 'fuchs' },
    { q: 'Welche Spur zeigt fünf Zehen nebeneinander und davor lange Krallen?', a: 'dachs' },
    { q: 'Bei welcher Spur liegen zwei lange Abdrücke nebeneinander vor zwei kleinen?', a: 'hase' },
    { q: 'Welches Tier setzt beim Hoppeln die langen Hinterpfoten vor die Vorderpfoten?', a: 'hase' },
    { q: 'Wessen Abdrücke liegen beim Traben hintereinander wie an einer Schnur?', a: 'fuchs' },
  ];

  /* ---------- the layers of the forest, bottom to top; labelled as a picture like the meadow ---------- */
  const LAYERS = [
    {
      id: 'wurzel',
      name: 'Wurzelschicht',
      desc: 'Unter der Erde. Die Wurzeln halten die Bäume fest und holen Wasser. Hier leben Regenwürmer und Käferlarven, der Dachs hat hier seinen Bau.',
      tip: 'Das Stockwerk liegt unter der Erde.',
    },
    {
      id: 'moos',
      name: 'Moosschicht',
      desc: 'Direkt auf dem Waldboden: Moose, Pilze und altes Laub. Hier laufen Ameisen, Asseln, Käfer und Schnecken. Sie heißt auch Bodenschicht.',
      tip: 'Das Stockwerk liegt direkt auf dem Waldboden.',
    },
    {
      id: 'kraut',
      name: 'Krautschicht',
      desc: 'Etwa so hoch wie ein Kind: Farne, Gräser und Waldblumen. Hier fliegen Hummeln und Schmetterlinge.',
      tip: 'Das Stockwerk ist ungefähr so hoch wie du.',
    },
    {
      id: 'strauch',
      name: 'Strauchschicht',
      desc: 'Bis etwa fünf Meter hoch: Sträucher wie Hasel und Holunder und junge Bäume. Viele Vögel bauen hier ihr Nest.',
      tip: 'Das Stockwerk liegt zwischen den Kräutern und den Baumkronen.',
    },
    {
      id: 'baum',
      name: 'Baumschicht',
      desc: 'Ganz oben: die Kronen der Bäume. Sie fangen das meiste Licht. Hier leben Eichhörnchen, Specht und Waldkauz.',
      tip: 'Das Stockwerk ist ganz oben.',
    },
  ];
  const WALD = {
    label: 'Stockwerke des Waldes',
    box: '0 0 300 260',
    parts: LAYERS,
    stepOf: {},
    tap: 'die Stelle im Bild',
    ask: () => 'Wie heißt das leuchtende Stockwerk des Waldes?',
    find: (p) => `Tippe auf das Stockwerk: ${p.name}`,
  } as Omit<PartsPicture, 'svg'> as PartsPicture;
  const GY = 212; // the forest floor
  const hit = (y: number, h: number) =>
    `<rect class="hitarea" x="0" y="${y}" width="300" height="${h}" fill="transparent"/>`;
  const blob = (x: number, y: number, rx: number, ry: number, fill: string) =>
    `<path d="M${x - rx} ${y + ry * 0.5} Q${x - rx * 1.15} ${y - ry * 0.3} ${x - rx * 0.62} ${y - ry * 0.62} Q${x - rx * 0.5} ${y - ry * 1.12} ${x} ${y - ry * 0.9} Q${x + rx * 0.5} ${y - ry * 1.14} ${x + rx * 0.66} ${y - ry * 0.56} Q${x + rx * 1.16} ${y - ry * 0.2} ${x + rx} ${y + ry * 0.5} Q${x + rx * 0.6} ${y + ry} ${x} ${y + ry * 0.86} Q${x - rx * 0.6} ${y + ry} ${x - rx} ${y + ry * 0.5} Z" fill="${fill}" stroke="${OUT}" stroke-width="1.5"/>`;
  const frond = (x: number, h: number, lean: number) =>
    `<path d="M${x} ${GY - 22} Q${f1(x + lean * 0.2 - 5)} ${f1(GY - 22 - h * 0.6)} ${x + lean} ${GY - 22 - h} Q${f1(x + lean * 0.7 + 5)} ${f1(GY - 22 - h * 0.5)} ${x} ${GY - 22} Z" fill="url(#wdFe)" stroke="${OUT}" stroke-width="1"/>` +
    tex(`M${x} ${GY - 22} Q${f1(x + lean * 0.4)} ${f1(GY - 22 - h * 0.55)} ${x + lean} ${GY - 22 - h}`, '#DDF0C0', 0.8);
  const fern = (x: number) => frond(x, 30, -18) + frond(x, 36, 2) + frond(x, 30, 20);
  const anemone = (x: number, y: number) =>
    tex(`M${x} ${GY - 22} L${x} ${y}`, '#4E8A32', 1.2) +
    `<g transform="translate(${x} ${y})" fill="#fff" stroke="${OUT}" stroke-width=".6">${[0, 60, 120, 180, 240, 300].map((r) => `<ellipse cy="-3.4" rx="1.9" ry="3.2" transform="rotate(${r})"/>`).join('')}<circle r="1.5" fill="#F2C230"/></g>`;
  const roots = (x: number) =>
    `M${x - 4} ${GY + 2} q-10 8 -22 12 M${x} ${GY + 2} q-3 16 2 30 M${x + 4} ${GY + 2} q12 8 20 18 M${x - 12} ${GY + 9} q-4 8 -2 16 M${x + 12} ${GY + 10} q8 4 12 12`;
  WALD.svg = (opts) =>
    partsSVG(
      WALD,
      opts,
      (
        g,
      ) => `<defs>${lgr('wdSky', '#D6ECF7', '#EEF6DC')}${lgr('wdSo', '#8A5E3C', '#553622')}${lgr('wdBk', '#A47C56', '#6A4A30')}${lgr('wdCr', '#9BD268', '#4C8C30')}${lgr('wdCn', '#5FA868', '#2C6A44')}${lgr('wdBu', '#B4D878', '#6A9E3A')}${lgr('wdFe', '#A8D86A', '#55963A')}${lgr('wdMo', '#B8D86A', '#6E9A2E')}
    <pattern id="wdCb" width="19" height="13" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.4" fill="#A97A50"/><circle cx="12" cy="8" r="1" fill="#3E2716"/><circle cx="16" cy="2" r=".8" fill="#B88C62"/><circle cx="7" cy="11" r="1.1" fill="#4A2F1C"/></pattern></defs>
    <rect width="300" height="260" fill="url(#wdSky)"/><g stroke-linecap="round" stroke-linejoin="round">
    <path d="M50 ${GY} Q53 140 53 70 L65 70 Q65 140 70 ${GY} Z M153 ${GY} L155 70 L161 70 L163 ${GY} Z M228 ${GY} Q232 140 231 74 L245 74 Q244 140 250 ${GY} Z" fill="url(#wdBk)" stroke="${OUT}" stroke-width="1.4"/>
    <path d="M57 190 v-22 M61 150 v-26 M236 196 v-20 M240 160 v-30 M158 180 v-30" fill="none" stroke="#5A3C24" stroke-width="1" opacity=".6"/>
    ${g(
      'wurzel',
      `${hit(GY, 48)}<rect y="${GY}" width="300" height="48" fill="url(#wdSo)"/><rect y="${GY}" width="300" height="48" fill="url(#wdCb)"/>${tex([60, 158, 239].map(roots).join(''), '#E6CFA2', 1.8, 0.9)}<path d="M92 244 Q102 233 116 240 T138 236" fill="none" stroke="${OUT}" stroke-width="7"/>${tex('M92 244 Q102 233 116 240 T138 236', '#E79AA4', 4.6)}${tex('M92 244 Q102 233 116 240 T138 236', '#B85A6A', 4.6, 0.45)}<ellipse cx="270" cy="238" rx="24" ry="13" fill="#2E1C10" stroke="${OUT}" stroke-width="1.4"/><ellipse cx="266" cy="240" rx="11" ry="7.5" fill="#F4F0E6" stroke="${OUT}" stroke-width="1.2"/>${tex('M258 236 Q262 239 263 244 M274 236 Q270 239 269 244', '#22222C', 3)}<circle cx="266" cy="245" r="1.8" fill="${OUT}"/><ellipse cx="196" cy="246" rx="9" ry="5.5" fill="#9AA0AC" stroke="${OUT}" stroke-width="1.2"/><path d="M22 236 A8 7.5 0 1 0 34 247" fill="none" stroke="${OUT}" stroke-width="8"/>${tex('M22 236 A8 7.5 0 1 0 34 247', '#F6EDD8', 5.6)}<circle cx="22" cy="235" r="3.4" fill="#C07A3A" stroke="${OUT}" stroke-width="1.1"/>`,
    )}
    ${g(
      'baum',
      `${hit(0, 92)}<path d="M158 4 L176 32 L168 32 L186 60 L176 60 L194 90 L122 90 L140 60 L130 60 L148 32 L140 32 Z" fill="url(#wdCn)" stroke="${OUT}" stroke-width="1.5"/>${tex('M150 34 q8 6 16 0 M138 62 q20 8 40 0 M146 22 q12 4 22 0 M134 78 q24 6 48 0', '#1E5236', 1, 0.6)}${blob(58, 44, 50, 40, 'url(#wdCr)')}${blob(240, 46, 50, 40, 'url(#wdCr)')}${tex('M26 44 q10 -10 22 -4 M54 28 q12 -8 24 0 M40 62 q14 -8 28 0 M208 46 q10 -10 22 -4 M236 28 q12 -8 24 0 M222 64 q14 -8 28 0', '#DDF2B8', 1.6, 0.8)}
      <path d="M64 84 Q84 86 104 80" fill="none" stroke="${OUT}" stroke-width="5.6"/>${tex('M64 84 Q84 86 104 80', '#8A6442', 3.4)}
      <g transform="translate(92 70)"><path d="M5 5 Q19 4 17 -11 Q13 -20 6 -14 Q12 -9 7 -1 Z" fill="#C4602A" stroke="${OUT}" stroke-width="1.1"/><ellipse cx="0" cy="3" rx="6.5" ry="8" fill="#DC7A3C" stroke="${OUT}" stroke-width="1.1"/><circle cx="-5" cy="-7" r="5" fill="#DC7A3C" stroke="${OUT}" stroke-width="1.1"/><path d="M-8 -10 l-1 -6 l4 4 Z M-3 -11 l2 -6 l2 5 Z" fill="#C4602A" stroke="${OUT}" stroke-width=".8"/><circle cx="-7" cy="-7.5" r="1.1" fill="${OUT}"/><ellipse cx="-2" cy="5" rx="2.8" ry="4" fill="#F8E6CC"/></g>
      <g transform="translate(224 84)"><path d="M-2 6 L-5 14" stroke="${OUT}" stroke-width="2.4"/><ellipse cx="0" cy="0" rx="5" ry="8.5" fill="#22222C" stroke="${OUT}" stroke-width="1" transform="rotate(12)"/><ellipse cx="1.8" cy="0" rx="2.4" ry="5.4" fill="#fff"/><circle cx="1.6" cy="6.5" r="2.2" fill="#D9342B"/><circle cx="2.5" cy="-10" r="4" fill="#fff" stroke="${OUT}" stroke-width="1"/><path d="M-1.5 -11 Q2.5 -16 6 -12 Q2.5 -13 -1.5 -11 Z" fill="#22222C"/><path d="M-1.6 -10 q-1 3 1 5" fill="none" style="stroke:#D9342B;stroke-width:2"/><path d="M6 -10.5 L11 -9.5 L6 -8.5 Z" fill="#5A5A66" stroke="${OUT}" stroke-width=".6"/><circle cx="3.6" cy="-10.4" r=".9" fill="${OUT}"/></g>`,
    )}
    ${g(
      'strauch',
      `${hit(92, 56)}${tex(`M16 ${GY} Q14 170 18 140 M24 ${GY} Q26 172 22 142 M108 ${GY} Q106 170 110 140 M116 ${GY} Q118 172 114 142 M196 ${GY} Q194 172 198 144 M204 ${GY} Q206 174 202 146 M288 ${GY} Q286 170 288 142`, '#5E4630', 2.2)}${blob(18, 124, 26, 26, 'url(#wdBu)')}${blob(112, 124, 28, 26, 'url(#wdBu)')}${blob(200, 127, 26, 24, 'url(#wdBu)')}${blob(290, 124, 22, 26, 'url(#wdBu)')}${tex('M6 120 q8 -8 18 -2 M98 118 q10 -8 22 -2 M104 134 q10 -6 20 0 M188 124 q10 -8 20 -2 M280 120 q8 -6 14 -2', '#E2F2BC', 1.4, 0.8)}
      ${[
        [100, 112],
        [104, 115],
        [100, 118],
        [106, 110],
        [124, 128],
        [128, 131],
        [122, 133],
        [127, 126],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.1" fill="#2A2238" stroke="${OUT}" stroke-width=".5"/>`)
        .join('')}${[
        [190, 132],
        [194, 136],
        [210, 118],
        [214, 122],
        [206, 138],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.3" fill="#D9342B" stroke="${OUT}" stroke-width=".5"/>`)
        .join('')}
      <g transform="translate(24 100)"><ellipse cx="0" cy="0" rx="8" ry="5.4" fill="#22222C" stroke="${OUT}" stroke-width="1"/><circle cx="7" cy="-3.5" r="3.8" fill="#22222C" stroke="${OUT}" stroke-width="1"/><path d="M10 -4 L15 -3 L10 -1.8 Z" fill="#F2B21E" stroke="${OUT}" stroke-width=".6"/><circle cx="8" cy="-4.2" r="1" fill="#F2B21E"/><path d="M-7 0 L-14 -3 L-13 2 Z" fill="#22222C" stroke="${OUT}" stroke-width=".8"/></g>`,
    )}
    ${g(
      'kraut',
      `${hit(148, 40)}${fern(88)}${fern(178)}${fern(268)}${anemone(34, 172)}${anemone(44, 166)}${anemone(132, 170)}${anemone(142, 176)}${tex(`M214 ${GY - 22} Q212 172 214 150`, '#4E8A32', 1.6)}${[
        [154, 0],
        [160, 1],
        [166, 0],
        [172, 1],
        [178, 0],
      ]
        .map(
          ([y, s]) =>
            `<ellipse cx="${s ? 218 : 210}" cy="${y}" rx="3" ry="4.4" fill="#D86AA8" stroke="${OUT}" stroke-width=".7" transform="rotate(${s ? -24 : 24} ${s ? 218 : 210} ${y})"/>`,
        )
        .join(
          '',
        )}${tex(`M8 ${GY - 22} q-2 -12 -5 -18 M10 ${GY - 22} q1 -12 4 -20 M236 ${GY - 22} q-2 -10 -5 -16 M238 ${GY - 22} q2 -12 5 -18 M60 ${GY - 22} q-1 -10 -4 -14 M62 ${GY - 22} q2 -10 5 -15`, '#5A9A36', 1.6)}
      <g transform="translate(122 152)"><path d="M0 0 Q-5 -11 -13 -9 Q-15 -2 -8 1 Q-3 2 0 0 Z M0 0 Q5 -11 13 -9 Q15 -2 8 1 Q3 2 0 0 Z" fill="#F2A23A" stroke="${OUT}" stroke-width="1"/><ellipse cx="0" cy="0" rx="1.3" ry="5.4" fill="${OUT}"/></g>`,
    )}
    ${g(
      'moos',
      `${hit(188, 24)}<path d="M0 ${GY} Q40 ${GY - 4} 80 ${GY - 1} T160 ${GY - 1} T240 ${GY - 2} T300 ${GY - 1} L300 ${GY + 3} L0 ${GY + 3} Z" fill="#4A2F1C"/><path d="M0 ${GY} Q40 ${GY - 4} 80 ${GY - 1} T160 ${GY - 1} T240 ${GY - 2} T300 ${GY - 1}" fill="none" stroke="${OUT}" stroke-width="1.8"/>${[
        [14, 14],
        [44, 10],
        [92, 13],
        [150, 10],
        [186, 14],
        [226, 11],
        [284, 13],
      ]
        .map(
          ([x, r]) =>
            `<path d="M${x - r} ${GY} Q${x - r} ${GY - r * 0.9} ${x} ${GY - r * 0.9} Q${x + r} ${GY - r * 0.9} ${x + r} ${GY} Z" fill="url(#wdMo)" stroke="${OUT}" stroke-width="1.1"/>`,
        )
        .join('')}${[
        [66, 204, -12],
        [206, 205, 14],
        [252, 204, -6],
      ]
        .map(
          ([x, y, r]) =>
            `<g transform="rotate(${r} ${x} ${y})"><path d="M${x - 10} ${y} Q${x} ${y - 7} ${x + 10} ${y} Q${x} ${y + 6} ${x - 10} ${y} Z" fill="#C98A46" stroke="${OUT}" stroke-width="1"/>${tex(`M${x - 8} ${y} L${x + 8} ${y}`, '#F2C88A', 0.8)}</g>`,
        )
        .join(
          '',
        )}<path d="M119 ${GY - 1} L120 ${GY - 12} L126 ${GY - 12} L127 ${GY - 1} Z" fill="#F6EDD8" stroke="${OUT}" stroke-width="1"/><path d="M110 ${GY - 11} Q112 ${GY - 23} 123 ${GY - 23} Q134 ${GY - 23} 136 ${GY - 11} Z" fill="#D9342B" stroke="${OUT}" stroke-width="1.2"/><circle cx="118" cy="${GY - 17}" r="1.4" fill="#fff"/><circle cx="126" cy="${GY - 19}" r="1.4" fill="#fff"/><circle cx="130" cy="${GY - 14}" r="1.2" fill="#fff"/>
      <g transform="translate(170 ${GY - 6})"><path d="M-9 5 Q-2 3 8 5 L12 3 Q13 -1 10 -3 L9 1 L-4 5 Z" fill="#E6D2A8" stroke="${OUT}" stroke-width="1"/><circle cx="-1" cy="-1" r="6.4" fill="#B8824A" stroke="${OUT}" stroke-width="1.1"/>${tex('M-1 -1 m-3.4 0 a3.4 3.4 0 1 1 3.4 3.4', '#6A4424', 1)}<path d="M10 -3 l1 -4 M12 -2 l3 -3" fill="none" stroke="${OUT}" stroke-width=".9"/></g>`,
    )}</g>`,
      [
        ['wurzel', 296, 256, 'end'],
        ['moos', 296, 205, 'end'],
        ['kraut', 296, 166, 'end'],
        ['strauch', 296, 106, 'end'],
        ['baum', 296, 14, 'end'],
      ],
    );
  S.PLANTS.wald = WALD;
  // who and what belongs to which layer (index in LAYERS); skip: a layer too close to offer as a wrong answer
  const HOME: { q: string; l: number; skip?: number[] }[] = [
    { q: 'Wo lebt der Regenwurm?', l: 0, skip: [1] },
    { q: 'Wo hat der Dachs seinen Bau?', l: 0 },
    { q: 'Wo frisst der Engerling, die Larve des Maikäfers, an den Wurzeln?', l: 0 },
    { q: 'Wo findest du die Assel unter feuchtem Laub?', l: 1 },
    { q: 'Wo steht der Ameisenhaufen der Waldameisen?', l: 1 },
    { q: 'Wo kriecht die Schnecke zwischen Moos und Pilzen?', l: 1 },
    { q: 'Wo wachsen die Moose?', l: 1 },
    { q: 'Wo wachsen die Farne?', l: 2 },
    { q: 'Wo blüht das Buschwindröschen?', l: 2, skip: [1] },
    { q: 'Wo holt die Hummel Nektar aus den Waldblumen?', l: 2 },
    { q: 'Wo wächst der Haselstrauch?', l: 3 },
    { q: 'Wo wächst der Holunder?', l: 3 },
    { q: 'Wo klettert die Haselmaus durch Hasel und Brombeere?', l: 3 },
    { q: 'Wo hackt der Buntspecht seine Höhle in den Stamm?', l: 4 },
    { q: 'Wo baut das Eichhörnchen seinen Kobel?', l: 4 },
    { q: 'Wo schläft der Waldkauz am Tag in seiner Höhle im alten Baum?', l: 4 },
  ];
  const LAYER_ORDER = LAYERS.map((l) => ({ id: 'wd' + l.id, text: l.name }));

  /* ---------- the mushroom: what is above the ground is only its fruiting body ---------- */
  const PILZ_PARTS = [
    {
      id: 'hut',
      name: 'Hut',
      desc: 'Der Hut schützt die Lamellen wie ein Schirm.',
      tip: 'Der Teil sitzt ganz oben.',
    },
    {
      id: 'lamellen',
      name: 'Lamellen',
      desc: 'Dünne Blättchen unter dem Hut. Dort entstehen die Sporen. Manche Pilze haben stattdessen Röhren.',
      tip: 'Der Teil sitzt unter dem Hut.',
    },
    { id: 'stiel', name: 'Stiel', desc: 'Der Stiel trägt den Hut.', tip: 'Der Teil trägt den Hut.' },
    {
      id: 'geflecht',
      name: 'Pilzgeflecht',
      desc: 'Feine weiße Fäden im Boden. Das ist der eigentliche Pilz. Was oben wächst, ist nur sein Fruchtkörper.',
      tip: 'Der Teil liegt unter der Erde.',
    },
  ];
  const PILZ = {
    label: 'Teile eines Pilzes',
    box: '0 0 240 220',
    parts: PILZ_PARTS,
    stepOf: {},
    tap: 'die Stelle im Bild',
    ask: () => 'Wie heißt der leuchtende Teil des Pilzes?',
    find: (p) => `Tippe auf: ${p.name}`,
  } as Omit<PartsPicture, 'svg'> as PartsPicture;
  const THREADS =
    'M120 158 q-6 14 -22 18 q-14 4 -26 16 M120 158 q8 16 26 20 q14 2 26 14 M120 158 q-2 20 -8 34 M120 158 q-20 6 -40 4 q-16 0 -30 10 M120 158 q22 4 44 0 q16 -2 30 8 M98 176 q-6 12 -4 24 M146 178 q8 10 6 24 M80 162 q-10 10 -12 22 M164 158 q12 14 12 26 M112 192 q-10 6 -14 16 M72 192 q-14 2 -22 12 M172 192 q14 4 20 14';
  PILZ.svg = (opts) =>
    partsSVG(
      PILZ,
      opts,
      (
        g,
      ) => `<defs>${lgr('wdPs', '#D6ECF7', '#EEF6DC')}${lgr('wdPg', '#8A5E3C', '#553622')}${lgr('wdPh', '#F0584A', '#B8201E')}${lgr('wdPt', '#FFFDF4', '#E2D6B8')}</defs>
    <rect width="240" height="220" fill="url(#wdPs)"/><g stroke-linecap="round" stroke-linejoin="round">
    ${g(
      'geflecht',
      `<rect class="hitarea" x="0" y="150" width="240" height="70" fill="transparent"/><path d="M0 152 Q60 146 120 151 T240 150 L240 220 L0 220 Z" fill="url(#wdPg)" stroke="${OUT}" stroke-width="1.6"/>${tex(THREADS, '#FBF4E2', 1.7)}${tex('M16 150 q2 -8 6 -12 M22 150 q0 -10 -3 -16 M212 150 q2 -9 6 -13 M218 150 q-1 -10 -4 -15 M52 150 q1 -7 4 -10 M186 150 q-1 -8 -4 -11', '#5A9A36', 1.8)}`,
    )}
    ${g(
      'stiel',
      `<rect class="hitarea" x="92" y="92" width="56" height="62" fill="transparent"/><path d="M106 154 Q112 122 110 88 L130 88 Q128 122 134 154 Q120 162 106 154 Z" fill="url(#wdPt)" stroke="${OUT}" stroke-width="1.8"/><path d="M106 108 Q120 102 134 108 Q132 120 138 124 Q120 116 102 124 Q108 120 106 108 Z" fill="#FFFDF4" stroke="${OUT}" stroke-width="1.4"/>${tex('M114 130 q-1 10 -3 18 M124 128 q1 12 3 20', '#D2C4A2', 1)}`,
    )}
    ${g(
      'lamellen',
      `<ellipse cx="120" cy="86" rx="64" ry="13" fill="#F3E8CE" stroke="${OUT}" stroke-width="1.8"/>${tex(
        Array.from({ length: 17 }, (_, i) => {
          const a = Math.PI * (0.04 + (i / 16) * 0.92);
          return `M${f1(120 + Math.cos(a) * 12)} ${f1(88 + Math.sin(a) * 2.4)} L${f1(120 + Math.cos(a) * 62)} ${f1(86 + Math.sin(a) * 12)}`;
        }).join(''),
        '#B8A47C',
        1,
      )}`,
    )}
    ${g(
      'hut',
      `<path d="M56 86 Q58 30 120 28 Q182 30 184 86 Q120 70 56 86 Z" fill="url(#wdPh)" stroke="${OUT}" stroke-width="1.8"/>${[
        [84, 62, 6, 4],
        [106, 44, 7, 4.4],
        [136, 40, 5.6, 3.6],
        [158, 58, 6.6, 4.2],
        [124, 62, 5, 3.2],
        [72, 76, 4, 2.6],
        [170, 74, 4.4, 2.8],
        [98, 72, 3.6, 2.4],
        [146, 70, 4, 2.6],
      ]
        .map(
          ([x, y, rx, ry]) =>
            `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#FFFDF4" style="stroke:#C9B8A0;stroke-width:.7"/>`,
        )
        .join('')}${tex('M70 58 Q80 40 100 36', '#FFB4A8', 2.4, 0.8)}`,
    )}</g>`,
      [
        ['hut', 236, 22, 'end', [176, 50]],
        ['lamellen', 236, 118, 'end', [174, 92]],
        ['stiel', 4, 134, 'start', [108, 136]],
        ['geflecht', 236, 214, 'end'],
      ],
    );
  S.PLANTS.waldpilz = PILZ;

  /* ---------- things with an order ---------- */
  const item = (pre: string) => (text: string, i: number) => ({ id: pre + (i + 1), text });
  // who is eaten by whom, starting with the plant
  const CHAINS = [
    { qid: 'wdke1_', items: ['Eichenblatt', 'Raupe', 'Kohlmeise', 'Sperber'].map(item('a')) },
    { qid: 'wdke2_', items: ['Blatt am Holunder', 'Blattlaus', 'Marienkäfer', 'Meise'].map(item('b')) },
    { qid: 'wdke3_', items: ['Buchecker', 'Waldmaus', 'Waldkauz'].map(item('c')) },
    { qid: 'wdke4_', items: ['Samen im Fichtenzapfen', 'Eichhörnchen', 'Baummarder'].map(item('d')) },
    { qid: 'wdke5_', items: ['Kräuter und Knospen', 'Reh', 'Luchs'].map(item('e')) },
    { qid: 'wdke6_', items: ['Rinde der Fichte', 'Borkenkäfer', 'Buntspecht', 'Habicht'].map(item('f')) },
  ];
  const LAUB = [
    'Im Herbst fallen die Blätter auf den Waldboden.',
    'Asseln, Schnecken und Regenwürmer fressen Löcher in das Laub.',
    'Pilze und Bakterien zersetzen, was vom Laub übrig ist.',
    'Aus dem Laub ist dunkle Erde geworden, der Humus.',
    'Die Wurzeln der Bäume nehmen Nährstoffe aus dem Humus auf.',
    'Im Frühling wachsen neue Blätter.',
  ].map(item('wl'));
  const HOLZ = [
    'Die Försterin markiert den Baum mit Farbe.',
    'Der Baum wird gefällt.',
    'Die Äste werden abgesägt.',
    'Der Stamm wird an den Waldweg gezogen.',
    'Ein Lastwagen bringt die Stämme ins Sägewerk.',
    'Im Sägewerk wird der Stamm zu Brettern gesägt.',
    'Die Bretter trocknen.',
    'In der Tischlerei wird aus den Brettern ein Tisch.',
  ].map(item('wh'));
  const PFLANZEN = [
    'Ein Loch in den Waldboden graben.',
    'Den jungen Baum mit den Wurzeln hineinstellen.',
    'Das Loch mit Erde füllen und die Erde festtreten.',
    'Einen Schutz gegen hungrige Rehe um den Baum stellen.',
  ].map(item('wp'));

  /* ---------- Notizkarten ---------- */
  const WA_NOTES = {
    stock: {
      title: 'Die Stockwerke des Waldes',
      lines: LAYERS.map((l, i) => `${i + 1}. ${l.name}: ${l.desc}`).concat([
        'Von unten nach oben: Wurzelschicht, Moosschicht, Krautschicht, Strauchschicht, Baumschicht.',
        'Je weiter unten, desto weniger Licht kommt an.',
      ]),
    },
    nadel: {
      title: 'Nadelbäume unterscheiden',
      lines: [
        'Fichte: spitze Nadeln rund um den Zweig. Die langen Zapfen hängen und fallen als Ganzes ab.',
        'Tanne: flache, stumpfe Nadeln mit zwei weißen Streifen unten. Die Zapfen stehen aufrecht und zerfallen am Baum.',
        'Merksatz: Fichte sticht, Tanne nicht.',
        'Kiefer: lange Nadeln, immer zu zweit. Kleine, eiförmige Zapfen. Der Stamm ist oben orangerot.',
        'Lärche: weiche Nadeln in Büscheln, kleine Zapfen. Im Herbst fallen die Nadeln ab.',
        'Die Samen sitzen unter den Schuppen der Zapfen. Bei Regen schließen sich die Schuppen.',
        'Harz verschließt Wunden in der Rinde.',
      ],
    },
    laub: {
      title: 'Laubbäume: Rinde und Früchte',
      lines: [
        'Buche: glatte, silbergraue Rinde. Frucht: dreikantige Bucheckern in einer stacheligen Hülle.',
        'Eiche: dicke Rinde mit tiefen Furchen. Frucht: die Eichel.',
        'Birke: weiße Rinde mit schwarzen Stellen.',
        'Ahorn: Früchte mit zwei Flügeln.',
        'Die Rinde schützt den Baum vor Verletzungen, Hitze und Kälte.',
        'Im Stamm steigt das Wasser von den Wurzeln zu den Blättern.',
        'Im Herbst werfen Laubbäume die Blätter ab. So sparen sie im Winter Wasser.',
        'Ein breiter Jahresring zeigt ein Jahr, in dem der Baum viel gewachsen ist.',
      ],
    },
    arten: {
      title: 'Laubwald, Nadelwald, Mischwald',
      lines: [
        'Laubwald: nur Laubbäume. Im Winter ist er kahl und hell.',
        'Nadelwald: nur Nadelbäume. Er ist fast das ganze Jahr dunkel.',
        'Mischwald: Laubbäume und Nadelbäume wachsen zusammen.',
        'Ein Mischwald übersteht Sturm, Trockenheit und Schädlinge meist besser.',
        'Etwa ein Drittel von Deutschland ist mit Wald bedeckt.',
      ],
    },
    tiere: {
      title: 'Tiere im Wald',
      lines: [
        'Reh: Bock, Ricke und Kitz. Reh und Hirsch sind verschiedene Tierarten.',
        'Hirsch: Sein Geweih fällt jedes Jahr ab und wächst neu.',
        'Wildschwein: Allesfresser. Die Jungen heißen Frischlinge und haben helle Streifen.',
        'Fuchs und Dachs wohnen in einem Bau unter der Erde. Der Dachs ist nachts unterwegs.',
        'Eichhörnchen: wohnt im Kobel, vergräbt Nüsse als Vorrat und hält Winterruhe.',
        'Igel: hält Winterschlaf.',
        'Buntspecht: hackt Höhlen in Bäume und holt Insekten unter der Rinde hervor.',
        'Waldkauz: eine Eule. Er jagt nachts Mäuse.',
        'Feuersalamander: schwarz mit gelben Flecken. Die Farben warnen: giftig.',
      ],
    },
    spuren: {
      title: 'Spuren lesen',
      lines: [
        'Reh: zwei schmale, spitze Hufhälften.',
        'Wildschwein: zwei Hufhälften und dahinter zwei kleine Abdrücke.',
        'Fuchs: vier Zehen mit Krallen, wie ein kleiner Hund. Die Abdrücke liegen in einer Reihe.',
        'Dachs: fünf Zehen nebeneinander, davor lange Krallen.',
        'Hase: zwei lange Hinterpfoten nebeneinander, dahinter zwei kleine Vorderpfoten.',
        'Zapfen mit Fransen: Eichhörnchen. Glatt abgenagt: Maus. In der Rinde festgeklemmt: Specht.',
        'Aufgewühlter Boden und Schlammbad (Suhle): Wildschwein.',
        'Gewölle: Ballen aus Haaren und Knochen, den eine Eule auswürgt.',
        'Im Schnee und im feuchten Boden siehst du Spuren am besten.',
      ],
    },
    kette: {
      title: 'Nahrungsketten',
      lines: [
        'Eine Nahrungskette zeigt, wer von wem gefressen wird.',
        'Sie beginnt immer mit einer Pflanze. Pflanzen stellen ihre Nahrung selbst her: aus Sonnenlicht, Wasser und Luft.',
        'Beispiel: Eichenblatt, Raupe, Kohlmeise, Sperber.',
        'Pflanzenfresser: Reh, Raupe. Fleischfresser: Sperber, Waldkauz, Luchs. Allesfresser: Wildschwein, Fuchs, Dachs.',
        'Viele Ketten hängen zusammen. Das ist ein Nahrungsnetz.',
        'Fehlt ein Tier, ändert sich viel: Ohne Meisen und Spechte gibt es mehr Raupen und Käfer.',
      ],
    },
    humus: {
      title: 'Vom Blatt zum Boden',
      lines: LAUB.map((l, i) => `${i + 1}. ${l.text}`).concat([
        'Das ist ein Kreislauf: Aus alten Blättern wird Nahrung für neue Blätter.',
        'Auch tote Bäume gehören dazu. Im Totholz leben Käfer, Asseln und Pilze.',
      ]),
    },
    pilze: {
      title: 'Pilze',
      lines: PILZ_PARTS.map((p) => `${p.name}: ${p.desc}`).concat([
        'Pilze sind weder Pflanzen noch Tiere. Sie brauchen kein Sonnenlicht.',
        'Sie vermehren sich mit Sporen.',
        'Pilze zersetzen Laub und totes Holz. Viele leben mit Bäumen zusammen und tauschen Wasser und Nährstoffe gegen Zucker.',
        'Iss nie einen Pilz, den du nicht sicher kennst. Manche Giftpilze sehen essbaren Pilzen sehr ähnlich.',
        'Der Fliegenpilz hat einen roten Hut mit weißen Flocken. Er ist giftig.',
        'Sammelt deine Familie Pilze, prüft eine Pilzberaterin oder ein Pilzberater den Korb.',
        'Giftpilze bleiben stehen. Auch sie gehören zum Wald.',
      ]),
    },
    nutzen: {
      title: 'Was der Wald für uns tut',
      lines: [
        'Holz: für Möbel, Häuser, Papier und zum Heizen. Holz wächst nach.',
        'Luft: Bäume geben Sauerstoff ab. Blätter und Nadeln fangen Staub aus der Luft.',
        'Wasser: Der Waldboden saugt Regen auf wie ein Schwamm und filtert ihn. So entsteht sauberes Grundwasser.',
        'Schatten: Im Sommer ist es im Wald kühler.',
        'Schutz: Am Berghang hält der Wald Lawinen und rutschende Erde auf.',
        'Erholung: Im Wald kann man wandern, toben und zur Ruhe kommen.',
        'Wer Papier spart und Altpapier sammelt, schont den Wald.',
      ],
    },
    forst: {
      title: 'Die Arbeit im Forst',
      lines: [
        'Försterinnen und Förster pflegen den Wald. Sie entscheiden, welche Bäume gefällt werden, und markieren sie mit Farbe.',
        'Nachhaltig heißt: nur so viel Holz ernten, wie nachwächst.',
        'Vom Baum zum Brett: markieren, fällen, Äste absägen, an den Weg ziehen, ins Sägewerk fahren, sägen, trocknen.',
        'Junge Bäume bekommen einen Schutz, damit Rehe die Knospen nicht abfressen.',
        'Der Borkenkäfer frisst unter der Rinde der Fichte. Bei Trockenheit kann sich der Baum schlecht mit Harz wehren.',
        'Manche toten Bäume bleiben stehen. Dort wohnen Käfer, Pilze und Spechte.',
        'Holzstapel und Hochsitze sind kein Klettergerüst. Gesperrte Wege betrittst du nicht.',
      ],
    },
    schutz: {
      title: 'Im Wald unterwegs',
      lines: [
        'Sei leise und bleib am besten auf den Wegen. So haben die Tiere ihre Ruhe.',
        'Kein Feuer im Wald. Bei Rauch ruft ein Erwachsener die 112.',
        'Nimm deinen Müll wieder mit.',
        'Junge Tiere fasst du nicht an. Die Mutter ist in der Nähe.',
        'Brich keine Äste ab und schnitze nicht in die Rinde. Zum Bauen nimmst du, was am Boden liegt.',
        'Ameisenhaufen bleiben heil. Waldameisen sind geschützt.',
        'Bei Sturm und Gewitter verlässt du den Wald.',
        'Lange Hose und feste Schuhe schützen vor Zecken. Zu Hause suchst du deine Haut ab.',
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
  const WA_POOL = [
    ...P('wdst', 'stock', 'stock', [
      [
        'Welches Stockwerk des Waldes liegt ganz oben?',
        ['Die Baumschicht', 'Die Strauchschicht', 'Die Krautschicht'],
        'Die Kronen der Bäume sind das Dach des Waldes.',
      ],
      ['Welches Stockwerk liegt unter der Erde?', ['Die Wurzelschicht', 'Die Moosschicht', 'Die Krautschicht']],
      [
        'In welchem Stockwerk wachsen Farne, Gräser und Waldblumen?',
        ['In der Krautschicht', 'In der Baumschicht', 'In der Wurzelschicht'],
      ],
      [
        'In welchem Stockwerk wachsen Hasel, Holunder und junge Bäume?',
        ['In der Strauchschicht', 'In der Moosschicht', 'In der Wurzelschicht'],
      ],
      ['Die Moosschicht heißt auch Bodenschicht.', true],
      [
        'Warum wachsen unter dichten Fichten nur wenige Kräuter?',
        ['Es kommt kaum Licht auf den Boden', 'Dort ist es zu warm', 'Fichten brauchen kein Wasser'],
        'Die dichten Kronen halten das Licht ab. Ohne Licht wachsen kaum Pflanzen.',
      ],
      ['Welches Stockwerk bekommt am meisten Sonnenlicht?', ['Die Baumschicht', 'Die Moosschicht', 'Die Krautschicht']],
      [
        'Warum blühen viele Waldblumen schon im Frühling?',
        [
          'Die Bäume haben noch kein Laub, am Boden ist es hell',
          'Im Sommer ist es ihnen zu kalt',
          'Sie brauchen Schnee',
        ],
      ],
      [
        'Die Krautschicht reicht bis in die Kronen der Bäume.',
        false,
        'Die Krautschicht wird nur etwa so hoch wie ein Kind.',
      ],
      [
        'Was machen die Wurzeln der Bäume?',
        ['Sie halten den Baum fest und holen Wasser', 'Sie fangen das Sonnenlicht ein', 'Sie tragen die Früchte'],
      ],
      [
        'Wie hoch werden die Sträucher in der Strauchschicht ungefähr?',
        ['Bis etwa 5 Meter', 'Bis etwa 50 Meter', 'So hoch wie ein Gänseblümchen'],
      ],
    ]),
    ...P('wdnd', 'baum', 'nadel', [
      ['Wie stehen die Zapfen der Tanne?', ['Aufrecht auf dem Zweig', 'Sie hängen nach unten', 'Sie wachsen am Stamm']],
      [
        'Auf dem Waldboden liegt ein langer, ganzer Zapfen. Von welchem Baum ist er wahrscheinlich?',
        ['Von der Fichte', 'Von der Tanne', 'Von der Buche'],
        'Tannenzapfen zerfallen oben am Baum. Fichtenzapfen fallen als Ganzes herunter.',
      ],
      [
        'Wie fühlen sich die Nadeln der Fichte an?',
        ['Spitz, sie stechen', 'Weich und stumpf', 'Klebrig und rund'],
        'Merksatz: Fichte sticht, Tanne nicht.',
      ],
      ['Was haben Tannennadeln auf der Unterseite?', ['Zwei weiße Streifen', 'Rote Punkte', 'Kleine Haken']],
      ['Wie wachsen die Nadeln der Lärche?', ['In Büscheln', 'Immer zu zweit', 'Einzeln rund um den Zweig']],
      ['Alle Nadelbäume behalten im Winter ihre Nadeln.', false, 'Die Lärche wirft ihre Nadeln im Herbst ab.'],
      [
        'Wozu dient dem Baum das klebrige Harz?',
        ['Es verschließt Wunden in der Rinde', 'Es lockt Rehe an', 'Es färbt die Nadeln grün'],
      ],
      ['Wo sitzen beim Zapfen die Samen?', ['Unter den Schuppen', 'In der Spitze', 'Im Stiel']],
      [
        'Was machen die Schuppen eines Kiefernzapfens bei Regen?',
        ['Sie schließen sich', 'Sie öffnen sich weit', 'Sie fallen ab'],
        'Bei trockenem Wetter öffnet sich der Zapfen. Dann trägt der Wind die Samen weit.',
      ],
      [
        'Tannenzapfen findest du selten ganz auf dem Waldboden.',
        true,
        'Sie zerfallen oben am Baum in einzelne Schuppen.',
      ],
    ]),
    ...P('wdlb', 'baum', 'laub', [
      ['Welcher Laubbaum hat eine glatte, silbergraue Rinde?', ['Die Buche', 'Die Eiche', 'Die Birke']],
      ['Wie ist die Rinde einer alten Eiche?', ['Dick mit tiefen Furchen', 'Glatt und weiß', 'Dünn und grün']],
      [
        'Wozu hat ein Baum seine Rinde?',
        [
          'Sie schützt ihn vor Verletzungen, Hitze und Kälte',
          'Sie hält die Blätter fest',
          'Sie saugt Wasser aus dem Boden',
        ],
      ],
      [
        'Wie kommt das Wasser von den Wurzeln zu den Blättern?',
        ['Es steigt im Stamm nach oben', 'Der Regen fällt von oben hinein', 'Vögel tragen es hinauf'],
      ],
      [
        'Warum werfen Laubbäume im Herbst ihre Blätter ab?',
        ['So sparen sie im Winter Wasser', 'Die Blätter sind ihnen zu schwer', 'Damit Vögel mehr sehen'],
        'Über die Blätter verdunstet viel Wasser. Aus gefrorenem Boden kann der Baum kaum Wasser nachholen.',
      ],
      ['Welcher Laubbaum wächst in deutschen Wäldern am häufigsten?', ['Die Buche', 'Die Kastanie', 'Die Linde']],
      [
        'Was zeigt ein breiter Jahresring im Holz?',
        ['Ein Jahr, in dem der Baum viel gewachsen ist', 'Ein Jahr ohne Sommer', 'Ein Jahr, in dem der Baum krank war'],
      ],
      [
        'Welche Tiere fressen im Herbst Eicheln und Bucheckern?',
        ['Wildschweine, Eichhörnchen und Eichelhäher', 'Waldkäuze und Sperber', 'Spinnen und Libellen'],
      ],
    ]),
    ...P('wdar', 'baum', 'arten', [
      ['Wie heißt ein Wald, in dem Laubbäume und Nadelbäume zusammen wachsen?', ['Mischwald', 'Laubwald', 'Nadelwald']],
      ['Welcher Wald ist im Winter kahl und hell?', ['Der Laubwald', 'Der Fichtenwald', 'Der Tannenwald']],
      ['Ein Mischwald übersteht Sturm und Schädlinge meist besser als ein Wald mit nur einer Baumart.', true],
      ['Wie viel von Deutschland ist mit Wald bedeckt?', ['Etwa ein Drittel', 'Fast alles', 'Fast nichts']],
    ]),
    ...P('wdti', 'spur', 'tiere', [
      [
        'Das Reh ist die Frau vom Hirsch.',
        false,
        'Reh und Hirsch sind zwei verschiedene Tierarten. Rehe sind viel kleiner.',
      ],
      ['Wie heißt das Junge vom Wildschwein?', ['Frischling', 'Kitz', 'Welpe']],
      [
        'Woran erkennst du einen Frischling?',
        ['An den hellen Streifen im Fell', 'An seinem Geweih', 'An seinen langen Ohren'],
      ],
      ['Wie heißt das Junge vom Reh?', ['Kitz', 'Frischling', 'Fohlen']],
      [
        'Was passiert jedes Jahr mit dem Geweih vom Hirsch?',
        ['Es fällt ab und wächst neu', 'Es bleibt ein Leben lang gleich', 'Es wird jedes Jahr kürzer'],
      ],
      [
        'Was macht das Eichhörnchen im Herbst mit Nüssen und Eicheln?',
        ['Es vergräbt sie als Vorrat', 'Es wirft sie in den Bach', 'Es baut daraus sein Nest'],
        'Manche findet es nicht wieder. Daraus wachsen neue Bäume.',
      ],
      [
        'Das Eichhörnchen hält Winterschlaf.',
        false,
        'Es hält Winterruhe: Es schläft viel, wacht aber auf und frisst von seinen Vorräten.',
      ],
      ['Welches Waldtier hält Winterschlaf?', ['Der Igel', 'Das Reh', 'Der Fuchs']],
      [
        'Wozu hackt der Buntspecht Löcher in Bäume?',
        ['Er sucht Insekten und baut seine Höhle', 'Er will den Baum fällen', 'Er sammelt dort Wasser'],
      ],
      ['Wann geht der Waldkauz auf die Jagd?', ['In der Nacht', 'Am Mittag', 'Nur im Winter']],
      [
        'Woraus bauen Waldameisen ihren Ameisenhaufen?',
        ['Aus Nadeln und kleinen Zweigen', 'Aus Steinen', 'Aus Schnee'],
      ],
      [
        'Wo zieht der Fuchs seine Jungen auf?',
        ['In seinem Bau unter der Erde', 'In einem Nest im Baum', 'In einer Höhle im Stamm'],
      ],
      ['Was frisst ein Wildschwein?', ['Fast alles: Eicheln, Wurzeln, Würmer und Pilze', 'Nur Gras', 'Nur Fleisch']],
      [
        'Der Feuersalamander ist schwarz mit gelben Flecken. Was zeigen seine Farben?',
        ['Vorsicht, ich bin giftig', 'Ich bin noch jung', 'Mir ist kalt'],
      ],
    ]),
    ...P('wdsp', 'spur', 'spuren', [
      [
        'Was ist ein Gewölle?',
        ['Ein Ballen aus Haaren und Knochen, den eine Eule auswürgt', 'Das Nest vom Eichhörnchen', 'Der Bau vom Fuchs'],
      ],
      [
        'Von einem Fichtenzapfen ist nur die Mitte mit ein paar Fransen übrig. Wer hat ihn abgenagt?',
        ['Das Eichhörnchen', 'Das Reh', 'Der Fuchs'],
        'Das Eichhörnchen reißt die Schuppen ab und frisst die Samen. Zurück bleibt ein zerfranster Rest.',
      ],
      ['Ein Zapfen ist ganz sauber und glatt abgenagt. Wer war das?', ['Eine Maus', 'Ein Wildschwein', 'Ein Dachs']],
      [
        'Ein Zapfen klemmt in einer Spalte der Rinde und ist zerhackt. Wer hat hier gefressen?',
        ['Der Buntspecht', 'Der Dachs', 'Das Reh'],
        'Der Specht klemmt den Zapfen fest und hackt die Samen heraus. Die Stelle heißt Spechtschmiede.',
      ],
      [
        'Der Waldboden ist aufgewühlt wie ein gepflügter Acker. Wer hat hier nach Futter gesucht?',
        ['Wildschweine', 'Eichhörnchen', 'Spechte'],
      ],
      [
        'An einem jungen Baum ist die Rinde abgerieben. Wer war das?',
        ['Ein Rehbock, der sein Geweih daran reibt', 'Eine Schnecke, die dort frisst', 'Eine Meise, die dort sitzt'],
      ],
      [
        'Wo siehst du Tierspuren besonders gut?',
        ['Im Schnee und im feuchten Boden', 'Auf trockenem Laub', 'Auf Steinen'],
      ],
      [
        'Wie viele Zehen siehst du in der Spur vom Dachs?',
        ['5', '2', '4'],
        'Davor siehst du die Abdrücke der langen Krallen.',
      ],
      [
        'Woran erkennst du die Spur vom Wildschwein?',
        ['Hinter dem Huf sind zwei kleine Abdrücke', 'Sie hat fünf Zehen', 'Sie ist rund und ohne Zehen'],
      ],
      [
        'Im Schlamm ist eine Mulde, daneben klebt Schlamm an einem Baum. Wer hat hier gebadet?',
        ['Ein Wildschwein', 'Ein Fuchs', 'Ein Waldkauz'],
        'Die Mulde heißt Suhle. Nach dem Bad reibt sich das Wildschwein an einem Baum.',
      ],
    ]),
    ...P('wdke', 'kreislauf', 'kette', [
      ['Womit beginnt eine Nahrungskette?', ['Mit einer Pflanze', 'Mit einem Raubtier', 'Mit einem Stein']],
      ['Was zeigt eine Nahrungskette?', ['Wer von wem gefressen wird', 'Wie alt ein Tier wird', 'Wo ein Tier wohnt']],
      ['Wie nennt man ein Tier, das nur Pflanzen frisst?', ['Pflanzenfresser', 'Fleischfresser', 'Allesfresser']],
      ['Welches Tier ist ein Allesfresser?', ['Das Wildschwein', 'Das Reh', 'Der Sperber']],
      [
        'Die Raupe frisst das Eichenblatt, die Meise frisst die Raupe. Wer frisst die Meise?',
        ['Der Sperber', 'Das Reh', 'Der Regenwurm'],
      ],
      [
        'Woraus stellen grüne Pflanzen ihre Nahrung selbst her?',
        ['Aus Sonnenlicht, Wasser und Luft', 'Aus kleinen Tieren', 'Aus anderen Pflanzen'],
      ],
      [
        'Viele Nahrungsketten hängen zusammen. Wie nennt man das?',
        ['Nahrungsnetz', 'Nahrungsknoten', 'Nahrungsleiter'],
      ],
      [
        'In einem Wald gibt es keine Meisen und Spechte mehr. Was passiert?',
        ['Raupen und Käfer vermehren sich stark', 'Die Bäume wachsen schneller', 'Es ändert sich nichts'],
      ],
      ['Ein Fuchs frisst nur Fleisch.', false, 'Der Fuchs frisst Mäuse, aber auch Beeren, Obst und Würmer.'],
    ]),
    ...P('wdhu', 'kreislauf', 'humus', [
      [
        'Was wird aus den Blättern, die im Herbst auf den Waldboden fallen?',
        ['Dunkle Erde, der Humus', 'Steine', 'Sie bleiben für immer liegen'],
      ],
      [
        'Welche Tiere zerkleinern das Laub auf dem Waldboden?',
        ['Regenwürmer, Asseln und Schnecken', 'Rehe und Hirsche', 'Spechte und Eulen'],
      ],
      ['Wer zersetzt die letzten Reste von Laub und totem Holz?', ['Pilze und Bakterien', 'Eichhörnchen', 'Füchse']],
      [
        'Was holen sich die Bäume mit ihren Wurzeln aus dem Humus?',
        ['Nährstoffe und Wasser', 'Blätter', 'Sonnenlicht'],
      ],
      [
        'Im Wald muss im Herbst jemand das Laub wegräumen.',
        false,
        'Kleine Tiere, Pilze und Bakterien machen aus dem Laub neue Erde.',
      ],
      [
        'Warum spricht man beim Laub von einem Kreislauf?',
        ['Aus alten Blättern wird Nahrung für neue Blätter', 'Die Blätter fallen im Kreis', 'Der Wald ist rund'],
      ],
      [
        'Ein toter Baumstamm im Wald ist nutzlos.',
        false,
        'Im Totholz leben Käfer, Asseln und Pilze. Spechte finden dort Futter.',
      ],
      ['Was zieht der Regenwurm in seine Gänge?', ['Alte Blätter', 'Kleine Steine', 'Tannenzapfen']],
    ]),
    ...P('wdpi', 'pilz', 'pilze', [
      [
        'Darfst du einen Pilz essen, den du nicht sicher kennst?',
        ['Nein, niemals', 'Ja, wenn er gut riecht', 'Ja, wenn eine Schnecke daran gefressen hat'],
        'Manche Giftpilze sehen essbaren Pilzen sehr ähnlich. Schnecken vertragen auch Pilze, die für Menschen giftig sind.',
      ],
      [
        'Giftige Pilze erkennt man immer an einer grellen Farbe.',
        false,
        'Der sehr giftige Grüne Knollenblätterpilz ist unauffällig grünlich und weiß.',
      ],
      [
        'Wie sieht der Fliegenpilz aus?',
        ['Roter Hut mit weißen Flocken', 'Brauner Hut ohne Punkte', 'Gelb und trichterförmig'],
      ],
      ['Der Fliegenpilz ist giftig.', true],
      ['Wo ist der größte Teil eines Pilzes?', ['Als feines Geflecht unter der Erde', 'Im Hut', 'Im Stiel']],
      ['Wie heißt der Teil des Pilzes, den wir über der Erde sehen?', ['Fruchtkörper', 'Wurzel', 'Blüte']],
      ['Womit vermehren sich Pilze?', ['Mit Sporen', 'Mit Samen', 'Mit Eiern']],
      ['Pilze sind Pflanzen.', false, 'Pilze sind weder Pflanzen noch Tiere. Sie bilden eine eigene Gruppe.'],
      [
        'Warum können Pilze im Dunkeln wachsen?',
        ['Sie brauchen kein Sonnenlicht für ihre Nahrung', 'Sie leuchten selbst', 'Sie wachsen nur nachts'],
        'Pilze haben kein Blattgrün. Sie leben von totem Holz und Laub oder zusammen mit Bäumen.',
      ],
      [
        'Viele Pilze leben mit Bäumen zusammen. Was gibt der Pilz dem Baum?',
        ['Wasser und Nährstoffe aus dem Boden', 'Schatten', 'Neue Blätter'],
        'Dafür bekommt der Pilz vom Baum Zucker.',
      ],
      [
        'Wer prüft, ob ein gesammelter Pilz essbar ist?',
        ['Eine Pilzberaterin oder ein Pilzberater', 'Ein Freund aus der Klasse', 'Niemand, man probiert einfach'],
      ],
      [
        'Was tust du mit einem giftigen Pilz im Wald?',
        ['Ich lasse ihn stehen', 'Ich trete ihn um', 'Ich nehme ihn mit nach Hause'],
        'Auch Giftpilze gehören zum Wald: Sie zersetzen Laub und Holz.',
      ],
      ['Was hat der Steinpilz unter seinem Hut?', ['Röhren, die wie ein Schwamm aussehen', 'Lamellen', 'Stacheln']],
      [
        'Jemand hat einen unbekannten Pilz gegessen und ihm wird schlecht. Was tust du?',
        ['Sofort einem Erwachsenen Bescheid sagen', 'Abwarten', 'Ihm etwas zu essen geben'],
        'Erwachsene rufen den Giftnotruf oder den Notruf 112 an.',
      ],
    ]),
    ...P('wdnu', 'nutzen', 'nutzen', [
      ['Was geben Bäume an die Luft ab, das wir zum Atmen brauchen?', ['Sauerstoff', 'Rauch', 'Staub']],
      ['Was wird aus Holz gemacht?', ['Möbel, Papier und Häuser', 'Glas', 'Eisen']],
      [
        'Warum ist es im Sommer im Wald kühler als in der Stadt?',
        ['Die Bäume geben Schatten und verdunsten Wasser', 'Im Wald weht immer Sturm', 'Der Waldboden ist gefroren'],
      ],
      ['Der Waldboden saugt Regenwasser auf wie ein Schwamm.', true],
      [
        'Was passiert mit Regenwasser, das durch den Waldboden sickert?',
        ['Es wird gefiltert und sauber', 'Es wird salzig', 'Es wird zu Harz'],
        'So entsteht Grundwasser. Daraus wird Trinkwasser gewonnen.',
      ],
      [
        'Wovor schützt ein Wald am Berghang die Häuser im Tal?',
        ['Vor Lawinen und rutschender Erde', 'Vor Regen', 'Vor Nebel'],
      ],
      [
        'Papier wird aus Holz gemacht. Wie schonst du den Wald?',
        [
          'Ich beschreibe beide Seiten und sammle Altpapier',
          'Ich nehme für jede Zeile ein neues Blatt',
          'Ich werfe Papier in den Restmüll',
        ],
      ],
      [
        'Der Wald ist nur für Tiere wichtig.',
        false,
        'Der Wald gibt Menschen Holz, saubere Luft, Wasser und einen Ort zum Erholen.',
      ],
    ]),
    ...P('wdfo', 'nutzen', 'forst', [
      [
        'Was macht eine Försterin?',
        [
          'Sie pflegt den Wald und entscheidet, welche Bäume gefällt werden',
          'Sie verkauft Möbel',
          'Sie füttert jeden Tag alle Waldtiere',
        ],
      ],
      [
        'Wie zeigt die Försterin, welcher Baum gefällt werden soll?',
        ['Sie markiert ihn mit Farbe', 'Sie pflanzt Blumen davor', 'Sie legt einen Stein darauf'],
      ],
      [
        'Warum werden einzelne Bäume aus einem dichten Wald herausgenommen?',
        ['Die anderen bekommen mehr Licht und Platz', 'Der Wald soll leerer aussehen', 'Bäume dürfen nicht alt werden'],
      ],
      [
        'Was bedeutet „nachhaltig“ im Wald?',
        ['Nur so viel Holz ernten, wie nachwächst', 'Alle Bäume auf einmal fällen', 'Nie einen Baum fällen'],
      ],
      [
        'Wohin kommen die Baumstämme, damit Bretter daraus werden?',
        ['Ins Sägewerk', 'In die Mühle', 'In die Bäckerei'],
      ],
      [
        'Warum bekommen junge Bäume oft einen Zaun oder eine Hülle?',
        ['Damit Rehe die Knospen nicht abfressen', 'Damit sie nicht nass werden', 'Damit sie nicht frieren'],
      ],
      ['Welcher Käfer schadet vor allem den Fichten?', ['Der Borkenkäfer', 'Der Marienkäfer', 'Der Mistkäfer']],
      [
        'Wann haben Borkenkäfer es besonders leicht?',
        ['Wenn Fichten durch Trockenheit geschwächt sind', 'Wenn es viel regnet', 'Wenn Schnee liegt'],
        'Ein gesunder Baum wehrt die Käfer mit Harz ab. Bei Trockenheit hat er zu wenig davon.',
      ],
      [
        'Darfst du auf einen Stapel Baumstämme am Wegrand klettern?',
        ['Nein, die Stämme können ins Rollen kommen', 'Ja, die liegen fest', 'Ja, wenn niemand zuschaut'],
      ],
      [
        'Ein Waldweg ist gesperrt, weil Bäume gefällt werden. Was tust du?',
        ['Ich kehre um und nehme einen anderen Weg', 'Ich gehe schnell hindurch', 'Ich schaue aus der Nähe zu'],
      ],
      [
        'Försterinnen und Förster lassen manche toten Bäume absichtlich stehen.',
        true,
        'In totem Holz leben Käfer und Pilze. Spechte bauen dort ihre Höhlen.',
      ],
    ]),
    ...P('wdsc', 'schutz', 'schutz', [
      [
        'Du findest ein Rehkitz allein im Gras. Was tust du?',
        ['Ich gehe leise weg und fasse es nicht an', 'Ich streichle es', 'Ich nehme es mit nach Hause'],
        'Die Mutter ist in der Nähe. Riecht das Kitz nach Mensch, nimmt sie es vielleicht nicht mehr an.',
      ],
      [
        'Darfst du im Wald ein Feuer anzünden?',
        ['Nein', 'Ja, wenn es klein ist', 'Ja, im Sommer'],
        'Laub, Nadeln und trockenes Holz brennen schnell. So entstehen Waldbrände.',
      ],
      ['Du siehst Rauch im Wald. Welche Nummer wählt ein Erwachsener?', ['112', '123', '999']],
      [
        'Warum bist du im Wald leise?',
        ['Damit die Tiere nicht erschrecken', 'Weil Bäume schlafen', 'Damit du schneller läufst'],
      ],
      [
        'Wohin kommt dein Müll nach der Pause im Wald?',
        ['Ich nehme ihn wieder mit', 'Unter einen Busch', 'In einen hohlen Baum'],
      ],
      [
        'Warum bleibst du im Wald am besten auf den Wegen?',
        [
          'Tiere haben ihre Ruhe und junge Pflanzen bleiben heil',
          'Neben den Wegen gibt es keine Luft',
          'Wege sind immer kürzer',
        ],
      ],
      [
        'Was tust du zu Hause nach einem Tag im Wald?',
        ['Ich suche meine Haut nach Zecken ab', 'Ich gieße meine Schuhe', 'Nichts Besonderes'],
      ],
      [
        'Eine Getränkedose im Wald verrottet in wenigen Wochen.',
        false,
        'Eine Dose bleibt viele Jahre liegen. Tiere können sich daran verletzen.',
      ],
      [
        'Ein Sturm zieht auf, während du im Wald bist. Was tust du?',
        ['Ich verlasse den Wald', 'Ich stelle mich unter den höchsten Baum', 'Ich klettere auf einen Baum'],
        'Bei Sturm brechen Äste ab und Bäume können umfallen.',
      ],
      [
        'Für eine Hütte darfst du Äste von lebenden Bäumen abbrechen.',
        false,
        'Das verletzt den Baum. Nimm Äste, die schon am Boden liegen.',
      ],
      [
        'Darfst du deinen Namen in die Rinde eines Baumes schnitzen?',
        ['Nein, durch die Wunde können Pilze eindringen', 'Ja, das wächst sofort zu', 'Ja, bei dicken Bäumen'],
      ],
      [
        'Ein Ameisenhaufen der Waldameisen darf nicht zerstört werden.',
        true,
        'Waldameisen sind geschützt. Sie fressen viele Schädlinge.',
      ],
    ]),
  ];

  const WA_MODULES = {
    stock: { name: 'Stockwerke', icon: '🏠', maxTier: 2, worldCap: [2], dmg: 14 },
    baum: { name: 'Waldbäume', icon: '🌲', maxTier: 2, worldCap: [2], dmg: 12 },
    spur: { name: 'Tiere und Spuren', icon: '👣', maxTier: 2, worldCap: [2], dmg: 12 },
    kreislauf: { name: 'Wer frisst wen?', icon: '🔁', maxTier: 1, worldCap: [1], dmg: 14 },
    pilz: { name: 'Pilze', icon: '🍄', maxTier: 2, worldCap: [2], dmg: 12 },
    nutzen: { name: 'Wald und Mensch', icon: '🪵', maxTier: 1, worldCap: [1], dmg: 10 },
    schutz: { name: 'Im Wald unterwegs', icon: '🌿', maxTier: 1, worldCap: [1], dmg: 10 },
  };
  const WA_TUT = {
    'stock:1': {
      title: 'Stockwerke des Waldes',
      steps: [
        'Ein Wald hat Stockwerke wie ein Haus. Von unten nach oben: Wurzelschicht, Moosschicht, Krautschicht, Strauchschicht, Baumschicht.',
        'Beispiel: Farne werden etwa so hoch wie ein Kind. Sie wachsen in der Krautschicht.',
        'Leuchtet im Bild ein Stockwerk, tippe auf seinen Namen. Fragt die Aufgabe nach einem Tier oder einer Pflanze, tippe auf das Stockwerk dazu.',
      ],
    },
    'stock:2': {
      title: 'Stockwerk finden',
      steps: [
        'Jetzt andersherum: Oben steht der Name eines Stockwerks.',
        'Beispiel: Die Strauchschicht liegt zwischen den Kräutern und den Baumkronen.',
        'Tippe im Bild auf dieses Stockwerk.',
      ],
    },
    'stockord:1': {
      title: 'Stockwerke ordnen',
      steps: [
        'Die Stockwerke sind durcheinander.',
        'Fang ganz unten an, unter der Erde, und geh Schritt für Schritt nach oben.',
        'Zuletzt kommt das höchste Stockwerk. Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
    'baum:1': {
      title: 'Waldbäume',
      steps: [
        'Schau dir den Zweig im Bild an: Wie wachsen die Nadeln? Hängt der Zapfen oder steht er?',
        'Beispiel: Spitze Nadeln rund um den Zweig und ein langer Zapfen, der hängt – das ist die Fichte.',
        'Ohne Bild beantwortest du Fragen zu Rinde, Früchten und Waldarten.',
      ],
    },
    'baum:2': {
      title: 'Merkmale',
      steps: [
        'Die Frage nennt ein Merkmal: Rinde, Nadeln, Zapfen oder Früchte.',
        'Beispiel: „Welcher Laubbaum hat eine glatte, silbergraue Rinde?“ Das ist die Buche.',
        'Tippe auf den Baum, der passt.',
      ],
    },
    'spur:1': {
      title: 'Tiere und Spuren',
      steps: [
        'Tiere im Wald siehst du selten. Ihre Spuren verraten sie.',
        'Im Bild siehst du einen Abdruck im Boden. Der Pfeil zeigt, wohin das Tier gelaufen ist.',
        'Beispiel: Zwei schmale, spitze Hufhälften – das war ein Reh. Tippe auf das Tier.',
      ],
    },
    'spur:2': {
      title: 'Spuren ohne Bild',
      steps: [
        'Jetzt gibt es kein Bild. Die Frage beschreibt die Spur.',
        'Beispiel: Fünf Zehen nebeneinander und lange Krallen davor – das ist der Dachs.',
        'Zähle in Gedanken die Zehen und tippe auf das Tier.',
      ],
    },
    'kreislauf:1': {
      title: 'Nahrungsketten',
      steps: [
        'Eine Nahrungskette zeigt, wer von wem gefressen wird. Sie beginnt mit einer Pflanze.',
        'Beispiel: Die Raupe frisst das Eichenblatt, die Meise frisst die Raupe.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'kette:1': {
      title: 'Kette ordnen',
      steps: [
        'Die Glieder einer Kette sind durcheinander.',
        'Fang mit der Pflanze an. Dann kommt das Tier, das sie frisst.',
        'Zuletzt kommt das Tier, das die anderen jagt.',
      ],
    },
    'laub:1': {
      title: 'Vom Blatt zum Boden',
      steps: [
        'Aus Laub wird neue Erde. Die Schritte sind durcheinander.',
        'Zuerst fällt das Blatt. Dann fressen kleine Tiere daran, Pilze und Bakterien erledigen den Rest.',
        'Am Ende nehmen die Wurzeln die Nährstoffe auf und neue Blätter wachsen.',
      ],
    },
    'pilz:1': {
      title: 'Pilze',
      steps: [
        'Leuchtet im Bild ein Teil des Pilzes, tippe auf seinen Namen.',
        'Beispiel: Die feinen weißen Fäden im Boden heißen Pilzgeflecht.',
        'Merke dir: Iss nie einen Pilz, den du nicht sicher kennst.',
      ],
    },
    'pilz:2': {
      title: 'Teil finden',
      steps: [
        'Jetzt andersherum: Oben steht der Name eines Teils.',
        'Beispiel: Die Lamellen sitzen unter dem Hut.',
        'Tippe im Bild auf diesen Teil.',
      ],
    },
    'nutzen:1': {
      title: 'Wald und Mensch',
      steps: [
        'Fragen dazu, was der Wald den Menschen gibt und wie Försterinnen und Förster ihn pflegen.',
        'Beispiel: Nachhaltig heißt, nur so viel Holz zu ernten, wie nachwächst.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'holz:1': {
      title: 'Arbeit im Forst ordnen',
      steps: [
        'Die Schritte einer Arbeit im Wald sind durcheinander.',
        'Beispiel: Erst wird der Baum markiert, dann gefällt.',
        'Überlege bei jedem Schritt: Was muss vorher fertig sein?',
      ],
    },
    'schutz:1': {
      title: 'Im Wald unterwegs',
      steps: [
        'Fragen dazu, wie du dich im Wald verhältst.',
        'Beispiel: Ein Rehkitz im Gras fasst du nicht an. Seine Mutter ist in der Nähe.',
        'Manchmal wählst du „Richtig“ oder „Falsch“, manchmal eine von drei Antworten.',
      ],
    },
  };

  const names = <T extends { name: string }>(list: T[]) => list.map((x) => x.name);
  function waGen(cfg: Unit) {
    return (mod: string, tier: number, know: Know, seq: number, opts?: GenOpts) => {
      if (wantsPool(cfg, mod, opts)) return null;
      const r = Math.random();
      if (mod === 'stock') {
        const part = pick(LAYERS);
        if (tier >= 2 && r < 0.5)
          return {
            kind: 'parts-find',
            mod,
            tier: 2,
            group: 'stock:2',
            note: 'stock',
            plant: 'wald',
            q: WALD.find(part),
            part: part.id,
            answer: part.name,
            qid: 'wdsf_' + part.id,
          };
        if (r < 0.25)
          return {
            kind: 'parts',
            mod,
            tier: 1,
            group: 'stock:1',
            note: 'stock',
            plant: 'wald',
            q: WALD.ask(part),
            part: part.id,
            options: shuffle(
              shuffle(names(LAYERS.filter((l) => l !== part)))
                .slice(0, 3)
                .concat(part.name),
            ),
            answer: part.name,
            qid: 'wds_' + part.id,
          };
        if (r < 0.55) {
          const h = pick(HOME);
          return choice(
            mod,
            'stock',
            h.q,
            'In der ' + LAYERS[h.l].name,
            shuffle(LAYERS.filter((_, i) => i !== h.l && !(h.skip || []).includes(i)))
              .slice(0, 2)
              .map((l) => 'In der ' + l.name),
            'wdhome_' + HOME.indexOf(h),
          );
        }
        if (r < 0.7)
          return orderTask(
            mod,
            'stockord:1',
            'stock',
            'Tippe die Stockwerke des Waldes von unten nach oben an.',
            LAYER_ORDER,
            'wdsord_',
          );
        return null;
      }
      if (mod === 'baum') {
        if (tier >= 2 && r < 0.7) {
          const t = pick(TREE_TRAITS);
          const ans = TREES.find((x) => x.id === t.has[0])!;
          return choice(
            mod,
            NADEL.includes(ans) ? 'nadel' : 'laub',
            t.q,
            ans.name,
            names(shuffle(TREES.filter((x) => !t.has.includes(x.id) && !(t.skip || []).includes(x.id))).slice(0, 2)),
            'wdmerk_' + TREE_TRAITS.indexOf(t),
            { group: 'baum:2', tier: 2 },
          );
        }
        if (r < 0.4) {
          const n = pick(NADEL);
          return choice(
            mod,
            'nadel',
            'Von welchem Nadelbaum ist dieser Zweig?',
            n.name,
            names(shuffle(NADEL.filter((x) => x !== n)).slice(0, 2)),
            'wdzweig_' + n.id,
            { pic: twigSVG(n.id) },
          );
        }
        return null;
      }
      if (mod === 'spur') {
        if (tier >= 2 && r < 0.6) {
          const t = pick(TRACK_TRAITS);
          return choice(
            mod,
            'spuren',
            t.q,
            SPUREN.find((x) => x.id === t.a)!.name,
            names(shuffle(SPUREN.filter((x) => x.id !== t.a)).slice(0, 2)),
            'wdspm_' + TRACK_TRAITS.indexOf(t),
            { group: 'spur:2', tier: 2 },
          );
        }
        if (r < 0.4) {
          const a = pick(SPUREN);
          return choice(
            mod,
            'spuren',
            'Welches Tier hat diese Spur hinterlassen?',
            a.name,
            names(shuffle(SPUREN.filter((x) => x !== a)).slice(0, 2)),
            'wdspur_' + a.id,
            { pic: trackSVG(a.id) },
          );
        }
        return null;
      }
      if (mod === 'kreislauf') {
        if (r < 0.3) {
          const c = pick(CHAINS);
          return orderTask(
            mod,
            'kette:1',
            'kette',
            'Wer wird von wem gefressen? Fang mit der Pflanze an.',
            c.items,
            c.qid,
          );
        }
        if (r < 0.45)
          return orderTask(
            mod,
            'laub:1',
            'humus',
            'Wie wird aus Laub neue Erde? Tippe die Schritte der Reihe nach an.',
            LAUB,
            'wdlaub_',
          );
        return null;
      }
      if (mod === 'pilz') {
        const part = pick(PILZ_PARTS);
        if (tier >= 2 && r < 0.4)
          return {
            kind: 'parts-find',
            mod,
            tier: 2,
            group: 'pilz:2',
            note: 'pilze',
            plant: 'waldpilz',
            q: PILZ.find(part),
            part: part.id,
            answer: part.name,
            qid: 'wdpf_' + part.id,
          };
        if (r < 0.3)
          return {
            kind: 'parts',
            mod,
            tier: 1,
            group: 'pilz:1',
            note: 'pilze',
            plant: 'waldpilz',
            q: PILZ.ask(part),
            part: part.id,
            options: shuffle(names(PILZ_PARTS)),
            answer: part.name,
            qid: 'wdp_' + part.id,
          };
        return null;
      }
      if (mod === 'nutzen' && r < 0.3)
        return r < 0.2
          ? orderTask(
              mod,
              'holz:1',
              'forst',
              'Vom Baum zum Tisch: Tippe die Schritte der Reihe nach an.',
              HOLZ,
              'wdholz_',
            )
          : orderTask(
              mod,
              'holz:1',
              'forst',
              'So wird ein junger Baum gepflanzt: Tippe die Schritte der Reihe nach an.',
              PFLANZEN,
              'wdpfl_',
            );
      return null;
    };
  }
  const WA: Unit = {
    modules: WA_MODULES,
    tut: WA_TUT,
    notes: WA_NOTES,
    pool: WA_POOL,
    worlds: 1,
    grade: 3,
    subject: 'Sachkunde',
    title: 'Der Wald',
    icon: '🌲',
    sub: 'Stockwerke, Waldbäume, Tierspuren, Nahrungsketten, Pilze und die Arbeit im Forst',
    starters: [
      {
        id: 'foersterin',
        type: 'pflanze',
        shape: 'foersterin',
        names: ['Die Försterin', 'Die Försterin', 'Die Försterin'],
        hp: 70,
        desc: 'Sie kennt jeden Baum in ihrem Revier. Sie entscheidet, welcher gefällt wird und wo junge Bäume gepflanzt werden.',
        perk: 'heal',
        attacks: [
          { name: 'Markierfarbe', mod: 'baum' },
          { name: 'Hochsitz', mod: 'stock' },
          { name: 'Fernglas', mod: 'spur' },
          { name: 'Laubhaufen', mod: 'kreislauf' },
        ],
      },
    ],
    extra: {
      baum: 'Markierfarbe',
      stock: 'Hochsitz',
      spur: 'Fernglas',
      kreislauf: 'Laubhaufen',
      pilz: 'Pilzkorb',
      nutzen: 'Holzstapel',
      schutz: 'Wegweiser',
    },
    enemies: {
      1: {
        normal: [
          { name: 'Der Borkenkäfer', type: 'normal', shape: 'borkenkaefer', hp: 26, atk: 3 },
          { name: 'Die Zigarettenkippe', type: 'feuer', shape: 'zigarettenkippe', hp: 28, atk: 4 },
          { name: 'Die Getränkedose', type: 'normal', shape: 'getraenkedose', hp: 24, atk: 4 },
          { name: 'Der Sturmschaden', type: 'wasser', shape: 'sturmschaden', hp: 30, atk: 3 },
        ],
        elite: { name: 'Der Kahlschlag', type: 'normal', shape: 'kahlschlag', hp: 45, atk: 5 },
        boss: {
          name: 'Der Waldbrand',
          acc: 'den Waldbrand',
          type: 'feuer',
          shape: 'waldbrand',
          hp: 70,
          atk: 6,
          boss: true,
        },
      },
    },
    moves: ['Funkenflug', 'Bohrmehl', 'Astbruch', 'Rauchfahne', 'Dosenwurf', 'Windstoß'],
    events: [
      {
        title: 'Der Hochsitz',
        text: 'Am Waldrand steht ein Hochsitz. Der Jäger zeigt auf einen Abdruck im Schlamm und fragt dich danach. Für die richtige Antwort gibt er dir einen Trank.',
        opts: [
          { label: 'Antworten', task: 'spur', g: 'spuren', win: { item: 'trank' }, lose: { hp: -6 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Der Ameisenhaufen',
        text: 'Neben dem Weg liegt ein Ameisenhaufen aus Fichtennadeln. Ein Mädchen fragt dich, in welchem Stockwerk des Waldes sie gerade steht.',
        opts: [
          { label: 'Antworten', task: 'stock', g: 'stock', win: { xp: 20 }, lose: { xp: 5 } },
          { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } },
        ],
      },
      {
        title: 'Der Holzstapel',
        text: 'Am Waldweg liegen frisch gefällte Stämme. Ein Waldarbeiter fragt dich nach seiner Arbeit und gibt dir einen Schild für die richtige Antwort.',
        opts: [
          { label: 'Antworten', task: 'nutzen', g: 'forst', win: { item: 'schild' }, lose: { hp: -5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Die Pilzberaterin',
        text: 'Vor dem Rathaus prüft die Pilzberaterin einen Korb voller Pilze. Sie kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort.',
        opts: [
          { label: 'Antworten', task: 'pilz', g: 'pilze', win: { item: 'lupe' }, lose: { xp: 5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Der morsche Stamm',
        text: 'Ein umgestürzter Baum liegt im Laub, Asseln laufen über das Holz. Ein Junge fragt dich, was hier passiert, und gibt dir eine Chilischote für die Antwort.',
        opts: [
          { label: 'Antworten', task: 'kreislauf', g: 'humus', win: { item: 'keks' }, lose: { hp: -5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Der Müll am Rastplatz',
        dilemma: true,
        reward: { hp: 5 },
        text: 'Am Rastplatz im Wald liegen eine leere Dose und Bonbonpapier. Von euch ist der Müll nicht.',
        opts: [
          {
            label: 'Ich stecke den Müll ein und werfe ihn zu Hause weg.',
            then: 'Dein Rucksack riecht nach Limonade. Der Rastplatz ist sauber, und kein Tier schneidet sich an der Dose.',
            think: 'Warum räumen manche Menschen Müll weg, der nicht von ihnen ist?',
          },
          {
            label: 'Ich sage es der Lehrerin.',
            then: 'Die Lehrerin holt eine Tüte heraus. Zu dritt ist der Müll schnell eingesammelt.',
            think: 'Wann ist es gut, einen Erwachsenen dazuzuholen?',
          },
          {
            label: 'Ich lasse ihn liegen, er ist ja nicht von mir.',
            then: 'Die Dose bleibt liegen. In einem Jahr liegt sie immer noch dort.',
            think: 'Wer räumt im Wald auf, wenn es niemand tut?',
          },
        ],
      },
      {
        title: 'Die Hütte im Wald',
        dilemma: true,
        reward: { hp: 5 },
        text: 'Ihr baut eine Hütte aus Ästen. Am Boden liegen nur noch krumme Äste. Tom will einen geraden Ast von einer jungen Buche abbrechen.',
        opts: [
          {
            label: 'Ich sage: „Lass den Baum, wir suchen weiter.“',
            then: 'Ihr sucht länger. Ein Stück weiter liegt ein ganzer Haufen Äste vom letzten Sturm.',
            think: 'Warum ist ein abgebrochener Ast für einen Baum eine Wunde?',
          },
          {
            label: 'Ich schlage vor, die krummen Äste zu nehmen.',
            then: 'Die Hütte wird schief. Sie hält trotzdem, und ihr gebt ihr einen Namen.',
            think: 'Muss eine Hütte gerade sein, damit sie gut ist?',
          },
          {
            label: 'Ich helfe Tom beim Abbrechen.',
            then: 'Der Ast reißt ein langes Stück Rinde mit ab. Die Hütte ist fertig, der junge Baum hat eine offene Stelle.',
            think: 'Was hättet ihr stattdessen nehmen können?',
          },
        ],
      },
      {
        title: 'Die Schutzhütte',
        text: 'An der Wegkreuzung steht eine Schutzhütte mit einer Bank. Hier ruhst du dich aus.',
        opts: [
          { label: 'Ausruhen (+15 LP)', effect: { hp: 15 } },
          { label: 'Weiter', effect: {} },
        ],
      },
    ],
  };
  WA.gen = waGen(WA);

  K.MODES.wald = WA;
  return {
    LAYERS,
    HOME,
    NADEL,
    TREES,
    TREE_TRAITS,
    SPUREN,
    TRACK_TRAITS,
    PILZ_PARTS,
    CHAINS,
    LAUB,
    HOLZ,
    PFLANZEN,
    twigSVG,
    trackSVG,
  };
})();
