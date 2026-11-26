// Sachkunde grade 3: Am Wasser. Pond and stream as a habitat, band 3/4 content in several states
// (lehrplan/quellen-gewaesser.md). The water cycle and the states of water stay with Wetterstation and natur2.
// Registers itself in MK.MODES; the labelled pond goes into MS.PLANTS for the zone tasks.
import { MK as K, type GenOpts, type Know, type Question } from './knowledge.ts';
import type { Unit } from './curriculum.ts';
import { MS as S, type PartsPicture } from './sachkunde.ts';
export const MG = (() => {
  const { shuffle, pick } = K;
  const { choice, orderTask, wantsPool, partsSVG } = S;
  const NS = 'xmlns="http://www.w3.org/2000/svg"';
  const OUT = '#1C2541';
  const pic = (box: string, inner: string, label: string, max: number) =>
    `<svg ${NS} class="pic" viewBox="${box}" style="max-width:${max}px" aria-label="${label}"><g stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
  const lgr = (id: string, a: string, b: string) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const line = (d: string, c: string, w: number) =>
    `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${w + 1.6}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  // texture strokes sit in style="" so a glowing part keeps them (the glow rule recolours stroke attributes only)
  const tex = (d: string, c: string, w: number, o?: number) =>
    `<path d="${d}" fill="none" style="stroke:${c};stroke-width:${w}"${o ? ` opacity="${o}"` : ''}/>`;
  const sh = (d: string, fill: string, w = 1.6) =>
    `<path d="${d}" fill="${fill}" stroke="${OUT}" stroke-width="${w}"/>`;
  const el = (cx: number, cy: number, rx: number, ry: number, fill: string, w = 1.4, rot = 0) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${OUT}" stroke-width="${w}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;

  /* ---------- small pictures: a plant, an animal or a stage of the frog, one per task ---------- */
  const DEFS =
    lgr('gwSky', '#DDF0FA', '#F2F8EC') +
    lgr('gwWa', '#8CCBEA', '#3F86B8') +
    lgr('gwLf', '#8ED46A', '#3E8A3A') +
    lgr('gwSt', '#B6D98A', '#6A9E3A') +
    lgr('gwBr', '#A0683A', '#5E3A1E') +
    lgr('gwMu', '#7A5A3C', '#4A3424') +
    lgr('gwFr', '#9AD45E', '#4E9A32') +
    lgr('gwSh', '#C9B48E', '#7E6A4A');
  const WATER = (y: number) =>
    `<rect x="4" y="${y}" width="112" height="${116 - y}" rx="10" fill="url(#gwWa)"/>${tex(`M10 ${y + 6} q8 -3 16 0 M60 ${y + 10} q8 -3 16 0 M86 ${y + 4} q6 -2 12 0`, '#D8F0FF', 1.4, 0.8)}`;
  const BG = `<rect x="4" y="4" width="112" height="112" rx="14" fill="url(#gwSky)"/>`;
  const reedLeaf = (x: number, y: number, dx: number, dy: number) =>
    sh(
      `M${x} ${y} Q${x + dx * 0.5} ${y + dy * 0.2} ${x + dx} ${y + dy} Q${x + dx * 0.4} ${y + dy * 0.45} ${x} ${y + 4} Z`,
      'url(#gwLf)',
      1,
    );
  const DRAW: Record<string, () => string> = {
    // tall hollow stalks, long narrow leaves, a brown-violet plume on top
    schilf: () =>
      WATER(92) +
      [26, 52, 80]
        .map(
          (x, i) =>
            line(`M${x} 112 Q${x + 4} 60 ${x + 8} ${22 + i * 6}`, '#C9C27A', 2.4) +
            reedLeaf(x + 2, 86 - i * 4, -20, -22) +
            reedLeaf(x + 4, 62 - i * 2, 22, -18) +
            reedLeaf(x + 6, 44, -18, -10) +
            `<g transform="rotate(${18 - i * 8} ${x + 8} ${22 + i * 6})">${el(x + 8, 34 + i * 6, 6, 13, '#9A7A8A', 1.2)}${tex(`M${x + 8} ${24 + i * 6} L${x + 8} ${46 + i * 6} M${x + 8} ${30 + i * 6} l-5 6 M${x + 8} ${30 + i * 6} l5 6 M${x + 8} ${38 + i * 6} l-5 6 M${x + 8} ${38 + i * 6} l5 6`, '#E6D2DC', 1, 0.9)}</g>`,
        )
        .join(''),
    // flat leaves and a thick brown club on the stalk, a thin spike above it
    rohrkolben: () =>
      WATER(96) +
      [38, 74]
        .map(
          (x) =>
            reedLeaf(x - 2, 110, -26, -62) +
            reedLeaf(x + 2, 110, 24, -70) +
            line(`M${x} 112 L${x} 12`, '#7A9A3A', 2.2) +
            `<rect x="${x - 6}" y="22" width="12" height="36" rx="6" fill="url(#gwBr)" stroke="${OUT}" stroke-width="1.6"/>` +
            tex(`M${x - 3} 28 L${x - 3} 50`, '#C89A6A', 1.4, 0.8),
        )
        .join(''),
    // round floating leaves with a notch and a white flower
    seerose: () => {
      const pad = (x: number, y: number, r: number, rot: number) =>
        `<path d="M${x} ${y} L${x + r} ${y - r * 0.12} A${r} ${r * 0.42} 0 1 0 ${x + r} ${y + r * 0.12} Z" fill="url(#gwLf)" stroke="${OUT}" stroke-width="1.5" transform="rotate(${rot} ${x} ${y})"/>`;
      const petals = (r: number, n: number, fill: string, ry: number) =>
        Array.from(
          { length: n },
          (_, i) =>
            `<path d="M0 0 Q-${ry} -${r * 0.5} 0 -${r} Q${ry} -${r * 0.5} 0 0 Z" fill="${fill}" stroke="${OUT}" stroke-width="1" transform="rotate(${(360 / n) * i + (n === 6 ? 30 : 0)})"/>`,
        ).join('');
      return (
        WATER(40) +
        tex('M36 82 Q40 100 34 116 M86 86 Q80 102 88 116', '#5E8A3A', 2.2) +
        pad(36, 82, 26, 10) +
        pad(88, 88, 22, 200) +
        pad(84, 56, 18, 150) +
        `<g transform="translate(58 66) scale(1 .62)">${petals(26, 8, '#F4F2FA', 7)}${petals(18, 6, '#FFFFFF', 6)}<circle r="6" fill="#F2C230" stroke="${OUT}" stroke-width="1"/></g>`
      );
    },
    // tiny leaves floating side by side, each with one root hanging down
    wasserlinse: () => {
      let leaves = '',
        roots = '';
      for (let i = 0; i < 26; i++) {
        const x = 14 + ((i * 37) % 92),
          y = 52 + ((i * 13) % 12) - 6;
        roots += `M${x} ${y + 3} q${(i % 3) - 1} 10 ${(i % 2) * 2 - 1} 18 `;
        leaves += el(x, y, 6 + (i % 3), 4, i % 4 ? 'url(#gwFr)' : '#7EC24A', 1);
      }
      return WATER(50) + tex(roots, '#E8F4F0', 1, 0.9) + leaves;
    },
    // under water: thin stems with small leaves in whorls of three
    wasserpest: () => {
      let s = `<rect x="4" y="4" width="112" height="112" rx="14" fill="url(#gwWa)"/><path d="M4 104 Q60 96 116 104 L116 106 Q116 116 106 116 L14 116 Q4 116 4 106 Z" fill="url(#gwMu)"/>`;
      for (const [x0, bend] of [
        [34, 10],
        [62, -8],
        [88, 6],
      ]) {
        s += line(`M${x0} 108 Q${x0 + bend} 60 ${x0 - bend / 2} 12`, '#4E8A32', 1.6);
        for (let k = 0; k < 7; k++) {
          const t = 0.12 + k * 0.13,
            x = x0 + bend * 2 * t * (1 - t) * 2 - (bend / 2) * t * t,
            y = 108 - 96 * t;
          for (const a of [0, 120, 240])
            s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q4 -2 8 0 q-4 3 -8 0 Z" fill="url(#gwLf)" stroke="${OUT}" stroke-width=".8" transform="rotate(${a + k * 25} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
        }
      }
      return s + tex('M14 30 q3 -2 6 0 M96 50 q3 -2 6 0 M20 80 q2 -2 4 0', '#D8F0FF', 1.2, 0.8);
    },
    // a dragonfly from above: four clear wings, long abdomen, big eyes
    libelle: () => {
      const wing = (rot: number, len: number) =>
        `<path d="M60 44 Q${60 + len * 0.5} 30 ${60 + len} 38 Q${60 + len * 0.6} 50 60 48 Z" fill="#E6F4FF" fill-opacity=".85" stroke="${OUT}" stroke-width="1.2" transform="rotate(${rot} 60 46)"/>`;
      return (
        BG +
        wing(-8, 48) +
        wing(14, 44) +
        `<g transform="scale(-1 1) translate(-120 0)">${wing(-8, 48)}${wing(14, 44)}</g>` +
        tex('M70 40 L100 40 M70 52 L98 58 M50 40 L20 40 M50 52 L22 58', '#9AC4E8', 0.8) +
        Array.from({ length: 8 }, (_, i) =>
          el(60, 60 + i * 7, 4.2 - i * 0.2, 4.4, i % 2 ? '#2E7AB8' : '#4AA8E0', 1.1),
        ).join('') +
        el(60, 47, 7, 9, '#3E8AB8', 1.4) +
        el(53, 33, 7, 6, '#4EA84A', 1.4) +
        el(67, 33, 7, 6, '#4EA84A', 1.4) +
        `<circle cx="51" cy="31" r="1.8" fill="#fff"/><circle cx="65" cy="31" r="1.8" fill="#fff"/>`
      );
    },
    // a thin bug with long legs standing on the water, small dents under its feet
    wasserlaeufer: () =>
      WATER(64) +
      [
        [16, 82],
        [104, 82],
        [26, 96],
        [94, 96],
        [42, 70],
        [78, 70],
      ]
        .map(([x, y]) => el(x, y, 5, 1.6, '#6AB0DA', 0.8))
        .join('') +
      line(
        'M54 66 L42 70 M66 66 L78 70 M56 70 L30 78 L16 82 M64 70 L90 78 L104 82 M58 76 L40 88 L26 96 M62 76 L80 88 L94 96',
        '#4A3A2A',
        1.4,
      ) +
      el(60, 64, 5, 18, '#5E4A34', 1.4) +
      el(60, 44, 3.4, 4, '#4A3A2A', 1.2) +
      line('M58 41 L52 30 M62 41 L68 30', '#4A3A2A', 1),
    // a green frog seen from the front, with the long hind legs folded and webbed feet
    frosch: () =>
      WATER(92) +
      sh('M30 96 Q18 92 22 78 Q28 66 42 72 L48 92 Z M90 96 Q102 92 98 78 Q92 66 78 72 L72 92 Z', 'url(#gwFr)', 1.6) +
      sh('M16 98 l8 -6 l2 6 l6 -5 l2 6 l6 -3 Z M104 98 l-8 -6 l-2 6 l-6 -5 l-2 6 l-6 -3 Z', '#7EC24A', 1.2) +
      sh('M36 92 Q30 56 60 50 Q90 56 84 92 Q60 100 36 92 Z', 'url(#gwFr)', 1.8) +
      sh('M44 90 Q60 96 76 90 Q72 76 60 74 Q48 76 44 90 Z', '#F4EBC0', 1.2) +
      sh('M44 92 l-6 6 M50 94 l-2 6', 'none', 1.6) +
      sh('M76 92 l6 6 M70 94 l2 6', 'none', 1.6) +
      el(46, 50, 9, 9, 'url(#gwFr)', 1.6) +
      el(74, 50, 9, 9, 'url(#gwFr)', 1.6) +
      `<circle cx="46" cy="49" r="5" fill="#F2C230" stroke="${OUT}" stroke-width="1"/><circle cx="74" cy="49" r="5" fill="#F2C230" stroke="${OUT}" stroke-width="1"/><ellipse cx="46" cy="49" rx="3.4" ry="1.6" fill="${OUT}"/><ellipse cx="74" cy="49" rx="3.4" ry="1.6" fill="${OUT}"/>` +
      tex('M48 66 Q60 72 72 66', OUT, 1.4) +
      tex('M50 62 h.1 M70 62 h.1 M58 58 h.1 M64 84 h.1 M54 86 h.1', '#2E6A2A', 2.4),
    // a newt from the side: long tail, a wavy crest on the back, orange belly with dark spots
    molch: () =>
      WATER(36) +
      tex('M24 68 L18 80 M38 70 L36 84 M74 70 L72 84 M86 68 L92 80', '#5E4A34', 3) +
      sh(
        'M8 58 Q20 48 34 56 L36 48 L40 56 L44 46 L48 56 L52 46 L56 56 L60 46 L64 56 L68 48 L72 57 L76 50 L80 58 L84 52 L88 60 Q100 52 116 60 Q100 64 88 66 Q60 74 30 70 Q14 68 8 58 Z',
        '#7A6A4A',
        1.6,
      ) +
      sh('M30 66 Q60 74 88 64 Q60 78 30 70 Z', '#F08A2E', 1.2) +
      tex('M40 70 h.1 M52 72 h.1 M64 71 h.1 M76 68 h.1 M46 60 h.1 M70 60 h.1', '#2E2420', 2.6) +
      el(16, 58, 2.6, 2.6, '#F2C230', 1) +
      `<circle cx="16" cy="58" r="1.2" fill="${OUT}"/>`,
    // a long shell half in the mud, its growth rings, two tubes that suck in water
    teichmuschel: () =>
      `<rect x="4" y="4" width="112" height="112" rx="14" fill="url(#gwWa)"/>` +
      sh('M4 84 Q60 74 116 84 L116 106 Q116 116 106 116 L14 116 Q4 116 4 106 Z', 'url(#gwMu)', 0) +
      `<g transform="rotate(-24 60 74)">${sh('M18 76 Q20 50 58 46 Q98 44 104 70 Q100 90 60 92 Q24 92 18 76 Z', 'url(#gwSh)', 1.8)}${tex('M30 76 Q34 58 58 56 Q88 54 94 72 M42 78 Q46 66 60 64 Q80 62 84 74', '#5E4E34', 1.2)}${sh('M100 62 q10 -6 14 -2 q-4 6 -12 8 Z M101 70 q10 -2 13 3 q-6 4 -12 2 Z', '#E8D6B4', 1.1)}</g>` +
      tex('M14 30 q3 -2 6 0 M86 20 q3 -2 6 0', '#D8F0FF', 1.2, 0.8),
    // a mallard drake on the water: green head, white ring, brown chest, yellow bill
    stockente: () =>
      WATER(78) +
      sh('M22 80 Q20 56 46 56 L80 58 Q100 56 106 70 Q100 90 64 92 Q30 92 22 80 Z', '#B4B8C2', 1.8) +
      sh('M80 58 Q100 60 104 74 Q96 88 78 86 Q86 72 80 58 Z', '#7A4A30', 1.4) +
      sh('M22 80 Q14 70 16 60 Q24 66 30 70 Z', '#3A3F52', 1.2) +
      tex('M40 70 Q54 64 70 70 M46 76 Q56 72 66 76', '#7E828E', 1.4) +
      sh('M70 64 L56 64 L60 60 Z', '#3B5FB0', 1) +
      sh('M84 58 Q80 40 90 30 Q102 24 108 34 Q110 44 100 52 Q96 58 84 58 Z', '#2E8A5A', 1.6) +
      sh('M84 58 Q92 54 102 52 L102 56 Q94 60 84 62 Z', '#FFFFFF', 1.2) +
      sh('M106 36 L118 40 Q118 44 106 44 Z', '#F2C230', 1.2) +
      `<circle cx="100" cy="36" r="1.8" fill="${OUT}"/>`,
    // the stages of the frog
    laich: () => {
      let s = WATER(8);
      for (let i = 0; i < 22; i++) {
        const x = 26 + ((i * 29) % 70),
          y = 26 + ((i * 17) % 70);
        s += `<circle cx="${x}" cy="${y}" r="9" fill="#E8F6FF" fill-opacity=".75" stroke="${OUT}" stroke-width=".9"/><circle cx="${x + 1}" cy="${y + 1}" r="3" fill="#22222C"/>`;
      }
      return s;
    },
    kaulquappe: () =>
      WATER(8) +
      sh('M62 60 Q84 50 112 60 Q86 70 62 60 Z', '#6A6A5A', 1.4) +
      el(46, 60, 20, 15, '#3E3A30', 1.6) +
      `<circle cx="36" cy="54" r="3" fill="#fff"/><circle cx="35" cy="54" r="1.5" fill="${OUT}"/>` +
      tex('M44 70 q4 3 8 0', '#8A8070', 1.2),
    beine: () =>
      WATER(8) +
      sh('M62 60 Q84 50 112 60 Q86 70 62 60 Z', '#6A6A5A', 1.4) +
      line('M56 70 L66 82 L58 90 M54 72 L60 86 L52 94', '#5A5446', 2.4) +
      sh('M54 90 l-6 4 l8 2 Z M50 94 l-6 3 l8 2 Z', '#5A5446', 1) +
      el(46, 60, 20, 15, '#4A4636', 1.6) +
      `<circle cx="36" cy="54" r="3" fill="#fff"/><circle cx="35" cy="54" r="1.5" fill="${OUT}"/>`,
    jungfrosch: () =>
      WATER(80) +
      sh('M70 74 Q82 70 88 76 Q80 80 70 78 Z', '#5E8A3A', 1.2) +
      sh('M36 84 Q26 80 30 70 L44 78 Z M78 84 Q88 80 84 70 L70 78 Z', 'url(#gwFr)', 1.4) +
      sh('M40 82 Q36 56 57 52 Q78 56 74 82 Q57 88 40 82 Z', 'url(#gwFr)', 1.6) +
      el(48, 54, 6, 6, 'url(#gwFr)', 1.4) +
      el(66, 54, 6, 6, 'url(#gwFr)', 1.4) +
      `<circle cx="48" cy="53" r="2.4" fill="${OUT}"/><circle cx="66" cy="53" r="2.4" fill="${OUT}"/>` +
      tex('M50 66 Q57 70 64 66', OUT, 1.2),
  };
  const drawSVG = (id: string, label: string) => pic('0 0 120 120', `<defs>${DEFS}</defs>${DRAW[id]()}`, label, 170);
  const PLANTS = [
    { id: 'schilf', name: 'Schilf' },
    { id: 'rohrkolben', name: 'Rohrkolben' },
    { id: 'seerose', name: 'Seerose' },
    { id: 'wasserlinse', name: 'Wasserlinse' },
    { id: 'wasserpest', name: 'Wasserpest' },
  ];
  const ANIMALS = [
    { id: 'libelle', name: 'Libelle' },
    { id: 'wasserlaeufer', name: 'Wasserläufer' },
    { id: 'frosch', name: 'Frosch' },
    { id: 'molch', name: 'Molch' },
    { id: 'teichmuschel', name: 'Teichmuschel' },
    { id: 'stockente', name: 'Stockente' },
  ];
  const STAGES = [
    { id: 'laich', name: 'Froschlaich' },
    { id: 'kaulquappe', name: 'Kaulquappe ohne Beine' },
    { id: 'beine', name: 'Kaulquappe mit Hinterbeinen' },
    { id: 'jungfrosch', name: 'Junger Frosch mit Schwanzrest' },
  ];
  // has: the plants or animals with this trait; skip: close enough to confuse as a wrong answer
  const PLANT_TRAITS: { q: string; has: string[]; skip?: string[] }[] = [
    { q: 'Welche Pflanze hat große, runde Blätter, die auf dem Wasser schwimmen?', has: ['seerose'] },
    { q: 'Welche Pflanze hat weiße Blüten, die auf dem Wasser liegen?', has: ['seerose'] },
    {
      q: 'Welche Pflanze hat lange, hohle Halme und oben eine braunviolette Rispe?',
      has: ['schilf'],
      skip: ['rohrkolben'],
    },
    { q: 'Aus welcher Pflanze werden Reetdächer gedeckt?', has: ['schilf'], skip: ['rohrkolben'] },
    { q: 'Welche Pflanze trägt am Stängel einen dicken, braunen Kolben?', has: ['rohrkolben'] },
    { q: 'Welche winzige Pflanze schwimmt frei und bedeckt oft die ganze Wasseroberfläche?', has: ['wasserlinse'] },
    { q: 'Welche Pflanze heißt auch Entengrütze?', has: ['wasserlinse'] },
    {
      q: 'Welche Pflanze wächst ganz unter Wasser und hat kleine Blätter, immer zu dritt um den Stängel?',
      has: ['wasserpest'],
    },
  ];
  const ANIMAL_TRAITS = [
    { q: 'Welches Tier läuft auf dem Wasser, ohne unterzugehen?', a: 'wasserlaeufer' },
    { q: 'Welches Tier hat vier durchsichtige Flügel und fängt Mücken im Flug?', a: 'libelle' },
    { q: 'Wessen Larve lebt lange im Wasser und packt ihre Beute mit einer Fangmaske?', a: 'libelle' },
    { q: 'Welches Tier filtert mit seinen zwei Schalen das Wasser?', a: 'teichmuschel' },
    { q: 'Welches Tier steckt eingegraben im Schlamm am Grund?', a: 'teichmuschel' },
    { q: 'Bei welchem Tier bekommt das Männchen im Frühling einen Kamm auf dem Rücken?', a: 'molch' },
    { q: 'Aus wessen Eiern schlüpfen Kaulquappen?', a: 'frosch' },
    { q: 'Welches Tier springt weit mit seinen langen Hinterbeinen?', a: 'frosch' },
    { q: 'Welcher Vogel steckt den Kopf ins Wasser, sodass sein Hinterteil nach oben zeigt?', a: 'stockente' },
    { q: 'Bei welchem Tier hat das Männchen einen grün glänzenden Kopf?', a: 'stockente' },
  ];

  /* ---------- the pond in cross-section: four zones from the shore to the middle, and the ground ---------- */
  const ZONES = [
    {
      id: 'ufer',
      name: 'Uferzone',
      desc: 'Der nasse Boden rund um das Wasser. Hier wachsen Erlen, Weiden und die Sumpfdotterblume.',
      tip: 'Die Zone liegt noch an Land.',
    },
    {
      id: 'roehricht',
      name: 'Röhrichtzone',
      desc: 'Im flachen Wasser stehen Schilf und Rohrkolben dicht an dicht. Hier brüten Vögel und Libellenlarven klettern an den Halmen hoch. Sie heißt auch Schilfzone.',
      tip: 'Hier stehen hohe Halme im flachen Wasser.',
    },
    {
      id: 'schwimmblatt',
      name: 'Schwimmblattzone',
      desc: 'Die Blätter von Seerose und Teichrose schwimmen auf dem Wasser, ihre Wurzeln stecken im Schlamm. Frösche sitzen gern darauf.',
      tip: 'Hier liegen Blätter auf dem Wasser.',
    },
    {
      id: 'tauchblatt',
      name: 'Tauchblattzone',
      desc: 'Hier ist das Wasser tiefer. Wasserpest, Hornblatt und Tausendblatt wachsen ganz unter Wasser. Fische und Molche schwimmen zwischen ihnen.',
      tip: 'Hier wachsen die Pflanzen ganz unter Wasser.',
    },
    {
      id: 'boden',
      name: 'Bodenzone',
      desc: 'Der Schlamm am Grund. Hier stecken Teichmuscheln, Schlammröhrenwürmer und Mückenlarven.',
      tip: 'Die Zone liegt ganz unten, unter dem Wasser.',
    },
  ];
  const TEICH = {
    label: 'Zonen eines Teiches',
    box: '0 0 300 240',
    parts: ZONES,
    stepOf: {},
    tap: 'die Stelle im Bild',
    ask: () => 'Wie heißt die leuchtende Zone des Teiches?',
    find: (p) => `Tippe auf die Zone: ${p.name}`,
  } as Omit<PartsPicture, 'svg'> as PartsPicture;
  const WY = 100; // the water surface
  const hit = (x: number, y: number, w: number, h: number) =>
    `<rect class="hitarea" x="${x}" y="${y}" width="${w}" height="${h}" fill="transparent"/>`;
  const reed = (x: number, h: number) =>
    `<path d="M${x} ${WY + 40} Q${x + 2} ${WY - h / 2} ${x + 4} ${WY - h}" fill="none" stroke="${OUT}" stroke-width="3.6"/><path d="M${x} ${WY + 40} Q${x + 2} ${WY - h / 2} ${x + 4} ${WY - h}" fill="none" style="stroke:#C9C27A;stroke-width:2"/>`;
  const weed = (x: number, y0: number, h: number) =>
    tex(`M${x} ${y0} q-6 ${-h / 4} 0 ${-h / 2} q6 ${-h / 4} 0 ${-h / 2}`, '#3E7A2A', 2.2) +
    Array.from({ length: 5 }, (_, i) => {
      const y = y0 - (h / 6) * (i + 1);
      return `<path d="M${x} ${y} l-7 -3 M${x} ${y} l7 -3" fill="none" style="stroke:#6AB04A;stroke-width:2.2"/>`;
    }).join('');
  TEICH.svg = (opts) =>
    partsSVG(
      TEICH,
      opts,
      (g) => `<defs>${DEFS}${lgr('gwDeep', '#7CC0E4', '#2E6E9E')}</defs>
    <rect width="300" height="240" fill="url(#gwSky)"/>
    <path d="M58 ${WY} L300 ${WY} L300 208 L220 206 Q170 202 136 186 Q104 168 90 134 Q76 102 58 ${WY} Z" fill="url(#gwDeep)"/>
    <path d="M0 92 L58 96 Q76 102 90 134 Q104 168 136 186 Q170 202 220 206 L300 208 L300 240 L0 240 Z" fill="url(#gwMu)" stroke="${OUT}" stroke-width="1.6"/>
    <g stroke-linecap="round" stroke-linejoin="round">
    ${g(
      'ufer',
      `${hit(0, 20, 64, 80)}<path d="M0 92 L58 96 L62 ${WY} L0 ${WY} Z" fill="#7EB04A" stroke="${OUT}" stroke-width="1.2"/><path d="M18 92 L20 52 L28 52 L30 92 Z" fill="url(#gwBr)" stroke="${OUT}" stroke-width="1.4"/><path d="M4 56 Q2 30 24 24 Q46 22 46 46 Q50 62 30 62 Q8 66 4 56 Z" fill="url(#gwLf)" stroke="${OUT}" stroke-width="1.5"/>${tex('M12 40 q8 -8 18 -4 M22 54 q10 -6 18 0', '#DDF2B8', 1.6, 0.8)}${[
        [46, 86],
        [54, 90],
      ]
        .map(
          ([x, y]) =>
            `${tex(`M${x} ${y + 6} L${x} ${y}`, '#4E8A32', 1.4)}<circle cx="${x}" cy="${y}" r="4" fill="#F2C230" stroke="${OUT}" stroke-width="1"/>`,
        )
        .join('')}`,
    )}
    ${g(
      'roehricht',
      `${hit(64, 24, 62, 120)}${[68, 76, 86, 96, 106, 116].map((x, i) => reed(x, 54 + (i % 3) * 10)).join('')}<rect x="86" y="${WY - 52}" width="7" height="20" rx="3.5" fill="url(#gwBr)" stroke="${OUT}" stroke-width="1.2"/><rect x="112" y="${WY - 62}" width="7" height="20" rx="3.5" fill="url(#gwBr)" stroke="${OUT}" stroke-width="1.2"/>
      <g transform="translate(102 ${WY - 30})"><path d="M-10 0 L10 -2 L12 2 L-8 4 Z" fill="#4AA8E0" stroke="${OUT}" stroke-width=".8"/><path d="M-2 -1 l-4 -8 l8 0 Z M2 -1 l4 -8 l-8 0 Z" fill="#E6F4FF" fill-opacity=".9" stroke="${OUT}" stroke-width=".7"/><circle cx="12" cy="0" r="2.2" fill="#4EA84A" stroke="${OUT}" stroke-width=".7"/></g>`,
    )}
    ${g(
      'schwimmblatt',
      `${hit(126, 84, 76, 100)}${tex('M144 104 Q140 140 146 180 M176 104 Q182 150 176 194', '#5E8A3A', 2)}${[
        [144, 18],
        [178, 16],
        [196, 10],
      ]
        .map(
          ([x, r]) =>
            `<path d="M${x} ${WY} L${x + r} ${WY - 2} A${r} ${r * 0.3} 0 1 0 ${x + r} ${WY + 2} Z" fill="url(#gwLf)" stroke="${OUT}" stroke-width="1.4"/>`,
        )
        .join(
          '',
        )}<g transform="translate(160 ${WY - 4})"><path d="M-7 0 Q-9 -8 -4 -8 L4 -8 Q9 -8 7 0 Z" fill="#F4F2FA" stroke="${OUT}" stroke-width="1"/><circle cx="0" cy="-5" r="2.4" fill="#F2C230"/></g>
      <g transform="translate(180 ${WY - 6})"><path d="M-9 4 Q-10 -6 0 -7 Q10 -6 9 4 Z" fill="url(#gwFr)" stroke="${OUT}" stroke-width="1.1"/><circle cx="-4" cy="-7" r="2.6" fill="url(#gwFr)" stroke="${OUT}" stroke-width=".9"/><circle cx="4" cy="-7" r="2.6" fill="url(#gwFr)" stroke="${OUT}" stroke-width=".9"/><circle cx="-4" cy="-7.4" r="1" fill="${OUT}"/><circle cx="4" cy="-7.4" r="1" fill="${OUT}"/></g>`,
    )}
    ${g(
      'tauchblatt',
      `${hit(202, WY, 98, 96)}${weed(214, 204, 74)}${weed(244, 206, 90)}${weed(276, 207, 66)}
      <g transform="translate(258 140)"><path d="M-14 0 Q-4 -9 10 0 Q-4 9 -14 0 Z" fill="#C9B48E" stroke="${OUT}" stroke-width="1.1"/><path d="M10 0 L18 -6 L18 6 Z" fill="#C9B48E" stroke="${OUT}" stroke-width="1.1"/><circle cx="-8" cy="-1" r="1.3" fill="${OUT}"/></g>
      <g transform="translate(226 168)"><path d="M-12 0 Q0 -5 14 -2 L22 0 L14 2 Q0 5 -12 0 Z" fill="#7A6A4A" stroke="${OUT}" stroke-width="1"/><path d="M-6 2 l-2 4 M6 2 l2 4" style="stroke:#5E4A34;stroke-width:1.4"/><circle cx="-9" cy="-1" r="1" fill="#F2C230"/></g>`,
    )}
    ${g(
      'boden',
      `<path class="hitarea" d="M120 176 Q170 196 220 200 L300 202 L300 240 L120 240 Z" fill="transparent"/><path d="M112 176 Q124 182 136 186 Q170 202 220 206 L300 208 L300 240 L112 240 Z" fill="url(#gwMu)"/><path d="M112 176 Q124 182 136 186 Q170 202 220 206 L300 208" fill="none" stroke="${OUT}" stroke-width="1.6"/>${tex('M150 208 q4 4 8 0 M200 220 q4 4 8 0 M250 226 q4 4 8 0 M180 230 q3 3 6 0', '#9A7A5A', 1.4)}<g transform="translate(206 210) rotate(-14)"><path d="M-14 0 Q-12 -9 2 -9 Q16 -8 16 0 Q14 6 0 6 Q-12 6 -14 0 Z" fill="url(#gwSh)" stroke="${OUT}" stroke-width="1.3"/>${tex('M-8 0 Q-6 -5 2 -5 Q10 -5 11 0', '#5E4E34', 1)}</g>${tex('M262 214 q-3 -6 0 -12 q3 -6 0 -10 M270 216 q3 -6 0 -12', '#D04A4A', 1.8)}`,
    )}</g>
    <path d="M58 ${WY} L300 ${WY}" stroke="${OUT}" stroke-width="1.2" opacity=".5"/>`,
      [
        ['ufer', 4, 14, 'start'],
        ['roehricht', 66, 14, 'start'],
        ['schwimmblatt', 296, 70, 'end', [190, 94]],
        ['tauchblatt', 296, 126, 'end'],
        ['boden', 296, 234, 'end'],
      ],
    );
  S.PLANTS.teich = TEICH;
  // who and what lives in which zone (index in ZONES); skip: a zone too close to offer as a wrong answer
  const HOME: { q: string; z: number; skip?: number[] }[] = [
    { q: 'Wo wachsen Erlen und Weiden?', z: 0 },
    { q: 'Wo blüht die Sumpfdotterblume auf nassem Boden?', z: 0, skip: [1] },
    { q: 'Wo wächst das Schilf?', z: 1, skip: [0] },
    { q: 'Wo stehen die Rohrkolben im flachen Wasser?', z: 1, skip: [0] },
    { q: 'Wo baut der Teichrohrsänger sein Nest zwischen den Halmen?', z: 1 },
    { q: 'Wo schwimmen die Blätter der Seerose?', z: 2 },
    { q: 'Wo liegen die gelben Blüten der Teichrose auf dem Wasser?', z: 2 },
    { q: 'Wo sitzt der Frosch gern auf einem großen, runden Blatt?', z: 2 },
    { q: 'Wo wächst die Wasserpest?', z: 3, skip: [4] },
    { q: 'Wo wachsen Hornblatt und Tausendblatt ganz unter Wasser?', z: 3, skip: [4] },
    { q: 'Wo steckt die Teichmuschel im Schlamm?', z: 4, skip: [3] },
    { q: 'Wo leben die Schlammröhrenwürmer?', z: 4, skip: [3] },
  ];
  const ZONE_ORDER = ZONES.slice(0, 4).map((z) => ({ id: 'gwz' + z.id, text: z.name }));

  /* ---------- things with an order ---------- */
  const item = (pre: string) => (text: string, i: number) => ({ id: pre + (i + 1), text });
  const FROSCH = [
    'Der Frosch legt im Frühling Laich ins Wasser.',
    'Aus den Eiern schlüpfen Kaulquappen. Sie atmen mit Kiemen.',
    'Der Kaulquappe wachsen zuerst die Hinterbeine.',
    'Dann wachsen die Vorderbeine.',
    'Der Schwanz wird immer kürzer, eine Lunge wächst.',
    'Der junge Frosch geht an Land.',
  ].map(item('gf'));
  const LIBELLE = [
    'Die Libelle legt ihre Eier ins Wasser oder an eine Wasserpflanze.',
    'Aus dem Ei schlüpft eine Larve.',
    'Die Larve jagt im Wasser und häutet sich viele Male.',
    'Die Larve klettert an einem Halm aus dem Wasser.',
    'Die Haut platzt auf und die Libelle schlüpft heraus.',
    'Die Flügel trocknen, dann fliegt die Libelle los.',
  ].map(item('gl'));
  const MOLCH = [
    'Das Weibchen wickelt jedes Ei einzeln in ein Blatt unter Wasser.',
    'Aus dem Ei schlüpft eine Larve mit Kiemenbüscheln am Kopf.',
    'Der Larve wachsen zuerst die Vorderbeine.',
    'Dann wachsen die Hinterbeine.',
    'Die Kiemen verschwinden, der junge Molch geht an Land.',
  ].map(item('gm'));
  const ENTE = [
    'Die Ente baut ihr Nest am Ufer.',
    'Sie legt Eier und brütet sie aus.',
    'Die Küken schlüpfen.',
    'Die Küken folgen der Mutter ins Wasser.',
  ].map(item('gd'));
  const DEV = [
    { qid: 'gwfro_', q: 'Wie wird aus dem Laich ein Frosch? Tippe der Reihe nach an.', items: FROSCH },
    { qid: 'gwlib_', q: 'Wie wird aus dem Ei eine Libelle? Tippe der Reihe nach an.', items: LIBELLE },
    { qid: 'gwmol_', q: 'Wie wird aus dem Ei ein Molch? Tippe der Reihe nach an.', items: MOLCH },
    { qid: 'gwent_', q: 'Wie wachsen junge Stockenten auf? Tippe der Reihe nach an.', items: ENTE },
  ];
  // who is eaten by whom, starting with the plant
  const CHAINS = [
    { qid: 'gwke1_', items: ['Algen', 'Wasserfloh', 'Stichling', 'Hecht'].map(item('a')) },
    { qid: 'gwke2_', items: ['Algen', 'Kaulquappe', 'Gelbrandkäfer'].map(item('b')) },
    { qid: 'gwke3_', items: ['Algen', 'Mückenlarve', 'Libellenlarve', 'Barsch'].map(item('c')) },
    { qid: 'gwke4_', items: ['Wasserlinsen', 'Stockente', 'Fuchs'].map(item('d')) },
    { qid: 'gwke5_', items: ['Gras am Ufer', 'Heuschrecke', 'Frosch', 'Graureiher'].map(item('e')) },
  ];
  const BACH = [
    'An der Quelle kommt Wasser aus der Erde.',
    'Das Wasser fließt als schmaler Bach bergab.',
    'Mehrere Bäche fließen zu einem Fluss zusammen.',
    'Der Fluss wird breiter und fließt langsamer.',
    'An der Mündung fließt der Fluss ins Meer.',
  ].map(item('gb'));
  const KLAER = [
    'Schmutziges Wasser fließt aus Bad und Küche in den Kanal.',
    'Der Kanal bringt das Wasser zur Kläranlage.',
    'In der Kläranlage wird das Wasser gereinigt.',
    'Das gereinigte Wasser fließt in einen Bach oder Fluss.',
  ].map(item('gk'));
  // small animals in a stream tell how clean its water is
  const ZEIGER = [
    { many: 'Steinfliegenlarven', clean: true },
    { many: 'Eintagsfliegenlarven', clean: true },
    { many: 'Köcherfliegenlarven', clean: true },
    { many: 'rote Zuckmückenlarven', clean: false },
    { many: 'Schlammröhrenwürmer', clean: false },
  ];
  const CLEAN = 'Das Wasser ist sauber.',
    DIRTY = 'Das Wasser ist stark verschmutzt.',
    SALTY = 'Das Wasser ist salzig.';

  /* ---------- Notizkarten ---------- */
  const GW_NOTES = {
    zonen: {
      title: 'Die Zonen am Teich',
      lines: ZONES.map((z, i) => `${i + 1}. ${z.name}: ${z.desc}`).concat([
        'Vom Ufer zur Mitte: Uferzone, Röhrichtzone, Schwimmblattzone, Tauchblattzone. Unten am Grund liegt die Bodenzone.',
        'Manche Bücher sagen auch Sumpfzone, Flachwasserzone und Tiefwasserzone.',
      ]),
    },
    pflanzen: {
      title: 'Pflanzen am und im Wasser',
      lines: [
        'Schilf: lange, hohle Halme, oben eine braunviolette Rispe. Aus Schilf werden Reetdächer gemacht.',
        'Rohrkolben: flache Blätter und ein dicker, brauner Kolben am Stängel.',
        'Seerose: runde Schwimmblätter, weiße Blüten. Die Wurzeln stecken im Schlamm, die langen Stängel sind voller Luft.',
        'Wasserlinse oder Entengrütze: winzige Blättchen, die frei schwimmen. Ihre Wurzeln hängen ins Wasser.',
        'Wasserpest: wächst ganz unter Wasser, kleine Blätter immer zu dritt um den Stängel.',
        'Pflanzen unter Wasser geben Sauerstoff ins Wasser ab. Den brauchen Fische und andere Tiere zum Atmen.',
      ],
    },
    tiere: {
      title: 'Tiere am Teich',
      lines: [
        'Frosch: springt mit langen Hinterbeinen, Schwimmhäute zwischen den Zehen. Er atmet mit der Lunge und durch die Haut.',
        'Molch: hat einen langen Schwanz. Im Frühling bekommt das Männchen einen Kamm auf dem Rücken.',
        'Frosch und Molch sind Amphibien: Sie leben im Wasser und an Land. Alle Amphibien in Deutschland sind geschützt.',
        'Libelle: vier durchsichtige Flügel, große Augen. Sie fängt Mücken im Flug.',
        'Wasserläufer: Feine Härchen an den Beinen nehmen kein Wasser an. So geht er auf dem Wasser nicht unter.',
        'Teichmuschel: steckt im Schlamm am Grund und filtert mit ihren zwei Schalen das Wasser.',
        'Stockente: Das Männchen heißt Erpel und hat einen grünen Kopf. Das Weibchen ist braun und beim Brüten gut versteckt.',
        'Fische atmen mit Kiemen. Der Hecht jagt andere Fische.',
      ],
    },
    frosch: {
      title: 'Vom Laich zum Frosch',
      lines: FROSCH.map((f, i) => `${i + 1}. ${f.text}`).concat([
        'Laich, Kaulquappen und Frösche bleiben im Teich. Sie sind geschützt.',
        'Beim Molch wachsen zuerst die Vorderbeine, beim Frosch die Hinterbeine.',
        'Kröten legen lange Laichschnüre, Grasfrösche runde Laichballen.',
        'Viele Frösche überwintern in Winterstarre, manche im Schlamm am Grund, andere an Land.',
      ]),
    },
    libelle: {
      title: 'Wie eine Libelle groß wird',
      lines: LIBELLE.map((l, i) => `${i + 1}. ${l.text}`).concat([
        'Die Libelle hat keine Puppe. Ihre Larve häutet sich mehrmals.',
        'Die Larve lebt oft länger als ein Jahr im Wasser. Mit ihrer Fangmaske packt sie Beute.',
        'Am Halm bleibt die leere Larvenhaut hängen.',
      ]),
    },
    kette: {
      title: 'Wer frisst wen am Teich?',
      lines: [
        'Eine Nahrungskette beginnt mit einer Pflanze. Im Wasser sind das oft winzige Algen.',
        'Beispiel: Algen, Wasserfloh, Stichling, Hecht.',
        'Beispiel: Gras am Ufer, Heuschrecke, Frosch, Graureiher.',
        'Kaulquappen fressen vor allem Algen und Pflanzenreste. Der Frosch frisst Insekten und Würmer.',
        'Die Libellenlarve, der Gelbrandkäfer und der Hecht sind Räuber im Wasser.',
        'Viele Ketten hängen zusammen. Das ist ein Nahrungsnetz.',
      ],
    },
    bach: {
      title: 'Bach und Teich',
      lines: [
        'Im Bach fließt das Wasser. Bäche und Flüsse sind fließende Gewässer.',
        'Im Teich und im See steht das Wasser. Das sind stehende Gewässer.',
        BACH.map((b) => b.text.replace(/\.$/, '')).join(', ') + '.',
        'Ein Teich ist von Menschen angelegt. Ein Weiher ist von selbst entstanden. Beide sind flach, das Licht reicht bis zum Grund.',
        'Ein See ist groß und so tief, dass in der Mitte kein Licht bis zum Grund kommt.',
        'Ein Tümpel ist klein und trocknet manchmal aus.',
        'Bachwasser ist kühl und hat viel Sauerstoff. Bachtiere halten sich unter Steinen fest, damit sie nicht fortgespült werden.',
      ],
    },
    guete: {
      title: 'Wie sauber ist das Wasser?',
      lines: [
        'Steinfliegenlarven, Eintagsfliegenlarven und Köcherfliegenlarven leben nur in sauberem Wasser.',
        'Rote Zuckmückenlarven und Schlammröhrenwürmer halten es auch in sehr schmutzigem Wasser aus.',
        'Die Köcherfliegenlarve baut sich eine Hülle aus Steinchen oder Pflanzenteilen.',
        'Klares Wasser kann trotzdem schmutzig sein. Trink nie aus Bach oder Teich.',
        'Zu viel Dünger im Wasser lässt Algen stark wachsen. Sterben sie ab, fehlt Sauerstoff und Fische ersticken.',
        'Abwasser aus Häusern wird in der Kläranlage gereinigt, bevor es in einen Fluss kommt.',
        'Öl, Farbe und Medikamente gehören nicht in Toilette oder Ausguss.',
      ],
    },
    baden: {
      title: 'Die Baderegeln',
      lines: [
        'Ich gehe nur baden, wenn ich mich gut fühle.',
        'Ich gehe nur baden, wenn mir bei Problemen jemand helfen kann. Ich sage Bescheid, wenn ich ins Wasser gehe.',
        'Brauche ich Hilfe, rufe ich laut und winke mit den Armen. Ich rufe nie „Hilfe“, wenn alles in Ordnung ist.',
        'Ich gehe weder hungrig noch direkt nach dem Essen ins Wasser. Ich kühle mich vorher ab.',
        'Ich bade nur, wo es erlaubt ist. Ich springe nur, wo das Wasser tief und frei ist.',
        'Ich renne nicht, schubse nicht und drücke niemanden unter Wasser.',
        'Schwimmflügel, Schwimmtiere und Luftmatratzen schützen nicht vor dem Ertrinken.',
        'Blitzt oder donnert es, gehe ich sofort aus dem Wasser.',
      ],
    },
    eis: {
      title: 'Eis auf dem Wasser',
      lines: [
        'Betritt Eis auf Teich, See oder Fluss nur, wenn Erwachsene sagen, dass es freigegeben ist.',
        'Geh nie allein aufs Eis.',
        'Knistert oder knackt das Eis, leg dich flach hin und krieche auf deiner Spur zurück zum Ufer.',
        'Am Schilf und auf fließendem Wasser ist das Eis oft dünner.',
        'Bricht jemand ein: laut um Hilfe rufen und die 112 wählen. Vom Ufer aus einen langen Ast oder einen Schal reichen, nicht selbst aufs Eis gehen.',
      ],
    },
    schutz: {
      title: 'Das Wasser schützen',
      lines: [
        'Laich, Kaulquappen und Frösche bleiben im Teich.',
        'Füttere Enten nicht mit Brot. Brotreste machen das Wasser schmutzig und lassen Algen wachsen.',
        'Bleib im Frühling weg vom Schilf. Dort brüten Vögel.',
        'Nimm deinen Müll wieder mit.',
        'Setze keine Fische oder Tiere aus dem Aquarium im Teich aus.',
        'Ein naturnaher Bach mit Kurven, Steinen und Büschen am Ufer bietet vielen Tieren Platz.',
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
  const GW_POOL = [
    ...P('gwzo', 'zone', 'zonen', [
      [
        'In welcher Zone schwimmen die Blätter der Seerose?',
        ['In der Schwimmblattzone', 'In der Uferzone', 'In der Bodenzone'],
      ],
      [
        'In welcher Zone stehen Schilf und Rohrkolben?',
        ['In der Röhrichtzone', 'In der Tauchblattzone', 'In der Bodenzone'],
      ],
      [
        'Welche Zone liegt am weitesten vom Ufer entfernt?',
        ['Die Tauchblattzone', 'Die Röhrichtzone', 'Die Schwimmblattzone'],
        'Je weiter du zur Mitte kommst, desto tiefer wird das Wasser. Dort wachsen die Pflanzen ganz unter Wasser.',
      ],
      ['Die Röhrichtzone heißt auch Schilfzone.', true],
      [
        'Wo stecken die Wurzeln der Seerose?',
        ['Im Schlamm am Grund', 'Gar nicht, sie schwimmt frei', 'In der Luft'],
        'Die Blätter liegen auf dem Wasser, die langen Stängel reichen bis zum Grund.',
      ],
      [
        'Warum wachsen in der Mitte eines tiefen Sees am Grund keine Pflanzen?',
        ['Dort kommt kein Licht mehr an', 'Dort ist das Wasser zu warm', 'Dort fressen Enten alles ab'],
      ],
      [
        'Was ist die Bodenzone?',
        ['Der Schlamm am Grund des Teiches', 'Der trockene Weg am Teich', 'Die Wasseroberfläche'],
      ],
      [
        'Warum brüten viele Vögel im Röhricht?',
        [
          'Zwischen den dichten Halmen ist ihr Nest gut versteckt',
          'Dort ist es am lautesten',
          'Dort gibt es keine Insekten',
        ],
      ],
      [
        'Wo klettert die Libellenlarve aus dem Wasser?',
        ['An einem Halm im Röhricht', 'Am Grund im Schlamm', 'Mitten im tiefen Wasser'],
      ],
      [
        'In der Tauchblattzone wachsen die Pflanzen über das Wasser hinaus.',
        false,
        'Dort wachsen sie ganz unter Wasser, zum Beispiel die Wasserpest.',
      ],
      ['Welche Zone ist bei einem Teich noch an Land?', ['Die Uferzone', 'Die Schwimmblattzone', 'Die Bodenzone']],
      [
        'Ein Teich wächst langsam zu, wenn jedes Jahr Laub und tote Pflanzen auf den Grund sinken.',
        true,
        'Der Schlamm am Grund wird höher. Ohne Pflege wird aus einem flachen Teich mit der Zeit eine Wiese.',
      ],
    ]),
    ...P('gwpf', 'pflanze', 'pflanzen', [
      [
        'Was ist in den langen Stängeln der Seerose?',
        ['Viel Luft', 'Sand', 'Honig'],
        'Durch die Luftkanäle kommt Luft vom Blatt hinunter zu den Wurzeln im Schlamm.',
      ],
      ['Was geben Pflanzen unter Wasser ins Wasser ab?', ['Sauerstoff', 'Salz', 'Öl']],
      [
        'Warum brauchen Fische Pflanzen im Teich?',
        [
          'Die Pflanzen geben Sauerstoff und Verstecke',
          'Die Pflanzen wärmen das Wasser',
          'Fische brauchen keine Pflanzen',
        ],
      ],
      ['Die Wasserlinse hat Wurzeln, die frei ins Wasser hängen.', true],
      ['Welche Pflanze wächst ganz unter Wasser?', ['Die Wasserpest', 'Das Schilf', 'Die Sumpfdotterblume']],
      ['Welche Farbe haben die Blüten der Sumpfdotterblume?', ['Gelb', 'Blau', 'Weiß']],
      [
        'Warum sind die Halme des Schilfs hohl?',
        ['So kommt Luft zu den Wurzeln im nassen Boden', 'Damit Vögel darin wohnen', 'Damit sie schwerer sind'],
      ],
      ['Was wird aus Schilf gemacht?', ['Reetdächer', 'Fensterglas', 'Wolle']],
      [
        'Der Rohrkolben und das Schilf sind dieselbe Pflanze.',
        false,
        'Der Rohrkolben hat einen dicken, braunen Kolben. Das Schilf trägt oben eine Rispe.',
      ],
      [
        'Warum perlt Wasser von den Blättern der Seerose ab?',
        ['Sie haben oben eine glatte Wachsschicht', 'Sie sind innen heiß', 'Frösche wischen sie trocken'],
        'So bleibt die Oberseite trocken. Dort nimmt das Blatt Luft auf.',
      ],
      [
        'Was hält das Schilf am Ufer fest?',
        ['Lange Wurzeln im Boden', 'Die Enten', 'Sein Gewicht allein'],
        'Die Wurzeln des Schilfs halten auch den Boden am Ufer fest.',
      ],
      ['Entengrütze ist ein anderer Name für die Wasserlinse.', true],
    ]),
    ...P('gwti', 'tier', 'tiere', [
      [
        'Warum geht der Wasserläufer nicht unter?',
        ['Feine Härchen an seinen Beinen nehmen kein Wasser an', 'Er ist aus Holz', 'Er flattert die ganze Zeit'],
      ],
      ['Womit atmen Fische?', ['Mit Kiemen', 'Mit einer Nase über Wasser', 'Mit den Flossen']],
      [
        'Womit atmet ein erwachsener Frosch?',
        ['Mit der Lunge und durch die Haut', 'Nur mit Kiemen', 'Nur durch die Zehen'],
      ],
      ['Frösche, Kröten und Molche sind Amphibien.', true, 'Amphibien leben im Wasser und an Land.'],
      [
        'Was hilft dem Frosch und der Ente beim Schwimmen?',
        ['Schwimmhäute zwischen den Zehen', 'Lange Krallen', 'Ein dickes Fell'],
      ],
      [
        'Warum wird das Gefieder der Ente nicht nass?',
        [
          'Sie fettet es mit einem Öl aus einer Drüse ein',
          'Sie schwimmt nur bei Sonne',
          'Ihre Federn sind aus Plastik',
        ],
      ],
      ['Wie heißt das Männchen der Stockente?', ['Erpel', 'Hahn', 'Bock']],
      [
        'Warum ist das Weibchen der Stockente braun?',
        ['So ist es beim Brüten gut versteckt', 'Es badet im Schlamm', 'Es ist älter als das Männchen'],
      ],
      [
        'Was macht die Teichmuschel?',
        ['Sie filtert das Wasser', 'Sie springt von Blatt zu Blatt', 'Sie baut ein Nest im Schilf'],
        'Sie saugt Wasser ein und behält kleine Teilchen als Nahrung. Das Wasser wird dabei klarer.',
      ],
      ['Was frisst eine Libelle?', ['Mücken und andere Insekten', 'Seerosen', 'Algen']],
      ['Was frisst der Hecht?', ['Andere Fische', 'Nur Pflanzen', 'Schlamm']],
      [
        'Wie überwintern viele Frösche?',
        ['In Winterstarre im Schlamm oder unter Laub', 'Sie fliegen in den Süden', 'Sie bleiben die ganze Zeit wach'],
      ],
      [
        'Woran erkennst du im Frühling ein Teichmolch-Männchen?',
        ['An einem gewellten Kamm auf dem Rücken', 'An seinen Flügeln', 'An seinem grünen Kopf'],
      ],
      [
        'Alle Frösche, Kröten und Molche in Deutschland sind geschützt.',
        true,
        'Man darf sie nicht fangen und ihren Laich nicht mitnehmen.',
      ],
    ]),
    ...P('gwfr', 'entw', 'frosch', [
      ['Wie heißt das Junge vom Frosch?', ['Kaulquappe', 'Raupe', 'Küken']],
      ['Was legt der Frosch im Frühling ins Wasser?', ['Laich', 'Nüsse', 'Puppen']],
      ['Womit atmet eine junge Kaulquappe?', ['Mit Kiemen', 'Mit der Lunge', 'Mit dem Schwanz']],
      ['Welche Beine wachsen der Kaulquappe zuerst?', ['Die Hinterbeine', 'Die Vorderbeine', 'Alle vier gleichzeitig']],
      [
        'Was passiert mit dem Schwanz der Kaulquappe?',
        ['Er wird immer kürzer, bis er weg ist', 'Er fällt auf einmal ab', 'Er wird immer länger'],
      ],
      ['Was frisst eine junge Kaulquappe vor allem?', ['Algen und Pflanzenreste', 'Fische', 'Vögel']],
      [
        'Wie unterscheidet sich der Laich der Kröte vom Laich des Grasfroschs?',
        [
          'Die Kröte legt lange Schnüre, der Grasfrosch runde Ballen',
          'Krötenlaich ist rot',
          'Es gibt keinen Unterschied',
        ],
      ],
      [
        'Du darfst Froschlaich aus dem Teich mit nach Hause nehmen.',
        false,
        'Frösche sind geschützt. Laich und Kaulquappen bleiben im Teich.',
      ],
      ['Bei welchem Tier wachsen der Larve zuerst die Vorderbeine?', ['Beim Molch', 'Beim Frosch', 'Bei der Kröte']],
      [
        'Warum legt ein Frosch so viele Eier?',
        ['Viele Eier und Kaulquappen werden gefressen', 'Er kann nicht zählen', 'Die Eier sind sehr klein'],
        'Fische, Molche und Libellenlarven fressen Laich und Kaulquappen. Nur wenige werden zu Fröschen.',
      ],
    ]),
    ...P('gwli', 'entw', 'libelle', [
      ['Wo lebt die Larve der Libelle?', ['Im Wasser', 'In der Erde', 'In einem Kokon am Baum']],
      [
        'Wie fängt die Libellenlarve ihre Beute?',
        ['Mit einer Fangmaske, die sie vorschnellen lässt', 'Mit einem Netz', 'Mit ihren Flügeln'],
      ],
      [
        'Die Libelle hat eine Puppe wie der Schmetterling.',
        false,
        'Die Larve häutet sich mehrmals. Eine Puppe gibt es nicht.',
      ],
      ['Was findest du nach dem Schlüpfen einer Libelle am Halm?', ['Die leere Larvenhaut', 'Ein Nest', 'Ein Ei']],
      [
        'Was muss eine frisch geschlüpfte Libelle tun, bevor sie fliegen kann?',
        ['Ihre Flügel trocknen lassen', 'Erst ins Wasser springen', 'Ihre Beine abwerfen'],
      ],
      [
        'Die Larve einer Libelle lebt oft länger im Wasser als die fertige Libelle in der Luft.',
        true,
        'Die Larve lebt oft länger als ein Jahr im Wasser. Die Libelle fliegt meist nur einige Wochen.',
      ],
    ]),
    ...P('gwke', 'kreislauf', 'kette', [
      ['Womit beginnt eine Nahrungskette im Teich oft?', ['Mit Algen', 'Mit dem Hecht', 'Mit dem Graureiher']],
      [
        'Der Wasserfloh frisst Algen, der Stichling frisst den Wasserfloh. Wer frisst den Stichling?',
        ['Der Hecht', 'Die Seerose', 'Die Teichmuschel'],
      ],
      ['Wer frisst Frösche?', ['Der Graureiher', 'Die Wasserlinse', 'Der Wasserfloh']],
      ['Welches Tier ist ein Räuber im Wasser?', ['Der Gelbrandkäfer', 'Die Wasserlinse', 'Der Wasserfloh']],
      ['Was frisst ein Frosch?', ['Insekten und Würmer', 'Steine', 'Nur Seerosen']],
      [
        'Im Teich gibt es keine Algen mehr. Wer hat es zuerst schwer?',
        ['Die Tiere, die Algen fressen, wie der Wasserfloh', 'Nur der Graureiher', 'Niemand'],
      ],
      ['Wie nennt man viele Nahrungsketten, die zusammenhängen?', ['Nahrungsnetz', 'Nahrungsfaden', 'Nahrungsturm']],
      ['Die Stockente frisst Pflanzen und kleine Tiere. Sie ist ein Allesfresser.', true],
      [
        'Libellenlarven fressen auch Kaulquappen.',
        true,
        'Die Larven großer Libellen sind Räuber. Sie fressen Kaulquappen, Mückenlarven und sogar kleine Fische.',
      ],
      [
        'Warum stehen am Ende einer Nahrungskette nur wenige Tiere?',
        [
          'Ein Räuber braucht viele Beutetiere zum Satt werden',
          'Räuber leben nur kurz',
          'Räuber mögen keine anderen Räuber',
        ],
      ],
    ]),
    ...P('gwba', 'bach', 'bach', [
      ['Wo beginnt ein Bach?', ['An der Quelle', 'An der Mündung', 'Im Meer']],
      ['Wo fließt der Fluss ins Meer?', ['An der Mündung', 'An der Quelle', 'Am Wehr']],
      ['Welches Gewässer ist ein fließendes Gewässer?', ['Der Bach', 'Der Teich', 'Der Tümpel']],
      ['Welches Gewässer ist ein stehendes Gewässer?', ['Der Teich', 'Der Fluss', 'Der Bach']],
      [
        'Was ist der Unterschied zwischen einem Teich und einem See?',
        ['Ein See ist größer und tiefer', 'Ein Teich ist salzig', 'Ein See fließt'],
      ],
      [
        'Ein Teich ist von Menschen angelegt.',
        true,
        'Ein ähnlich flaches Gewässer, das von selbst entstanden ist, heißt Weiher.',
      ],
      ['Welches kleine Gewässer trocknet im Sommer manchmal aus?', ['Der Tümpel', 'Der See', 'Der Fluss']],
      [
        'Warum halten sich viele Tiere im Bach unter Steinen fest?',
        ['Sonst spült die Strömung sie fort', 'Weil es dort warm ist', 'Weil sie Steine fressen'],
      ],
      [
        'Wo ist das Wasser im Sommer meist kühler?',
        ['Im schattigen Bach', 'Im flachen Teich in der Sonne', 'In der Pfütze'],
        'Fließendes Wasser aus der Quelle ist kühl. Ein flacher Teich wärmt sich in der Sonne schnell auf.',
      ],
    ]),
    ...P('gwgu', 'bach', 'guete', [
      [
        'Welches Tier zeigt dir sauberes Wasser an?',
        ['Die Steinfliegenlarve', 'Der Schlammröhrenwurm', 'Die rote Zuckmückenlarve'],
      ],
      [
        'Klares Wasser ist immer sauber.',
        false,
        'Auch klares Wasser kann Keime oder Gift enthalten. Das sieht man nicht.',
      ],
      [
        'Darfst du aus einem Bach trinken?',
        ['Nein, das Wasser kann krank machen', 'Ja, wenn es klar ist', 'Ja, im Sommer'],
      ],
      [
        'Was passiert, wenn viel Dünger vom Feld in einen Teich gelangt?',
        ['Algen wachsen sehr stark', 'Das Wasser wird süß', 'Die Fische werden größer'],
        'Sterben die vielen Algen ab, verbraucht ihr Abbau den Sauerstoff im Wasser. Dann ersticken Fische.',
      ],
      ['Wo wird das Abwasser aus Bad und Küche gereinigt?', ['In der Kläranlage', 'Im Wasserturm', 'Im Schwimmbad']],
      [
        'Was darfst du nicht in die Toilette schütten?',
        ['Öl, Farbe und Medikamente', 'Wasser', 'Nichts davon, alles ist erlaubt'],
      ],
      [
        'Woraus baut die Köcherfliegenlarve ihre Hülle?',
        ['Aus Steinchen oder Pflanzenteilen', 'Aus Plastik', 'Aus Eis'],
      ],
      [
        'Warum finden sich in sehr schmutzigem Wasser nur wenige Tierarten?',
        ['Im schmutzigen Wasser fehlt Sauerstoff', 'Das Wasser ist zu kalt', 'Die Tiere sind dort unsichtbar'],
      ],
      [
        'Schlammröhrenwürmer halten es auch in sehr schmutzigem Wasser aus.',
        true,
        'Findest du nur sie und rote Zuckmückenlarven, ist das Wasser stark verschmutzt.',
      ],
    ]),
    ...P('gwbd', 'schutz', 'baden', [
      [
        'Wann gehst du baden?',
        ['Nur wenn mir bei Problemen jemand helfen kann', 'Am liebsten allein', 'Wenn es donnert'],
      ],
      [
        'Was tust du, bevor du ins Wasser gehst?',
        ['Ich sage Bescheid und kühle mich ab', 'Ich esse viel', 'Ich renne los und springe'],
      ],
      [
        'Du bist im Wasser und brauchst Hilfe. Was tust du?',
        ['Laut rufen und mit den Armen winken', 'Still warten', 'Untertauchen'],
      ],
      [
        'Zum Spaß „Hilfe!“ zu rufen, ist in Ordnung.',
        false,
        'Dann glaubt dir vielleicht niemand, wenn du wirklich Hilfe brauchst.',
      ],
      [
        'Eine Luftmatratze schützt dich vor dem Ertrinken.',
        false,
        'Luftmatratzen, Schwimmtiere und Schwimmflügel sind nicht sicher. Sie können wegtreiben oder Luft verlieren.',
      ],
      [
        'Es blitzt und donnert. Was tust du beim Baden draußen?',
        ['Sofort aus dem Wasser gehen', 'Unter Wasser tauchen', 'Weiterschwimmen'],
      ],
      ['Wo springst du ins Wasser?', ['Nur wo es erlaubt, tief genug und frei ist', 'Überall', 'Wo es flach ist']],
      ['Gehst du mit vollem Bauch direkt nach dem Essen schwimmen?', ['Nein', 'Ja', 'Ja, dann bin ich stärker']],
      ['Darfst du andere unter Wasser drücken?', ['Nein, niemals', 'Ja, kurz', 'Ja, wenn sie gut schwimmen']],
      [
        'Warum badest du nicht im Teich mit vielen Pflanzen und Schlamm?',
        [
          'Du kannst dich in Pflanzen verfangen und siehst den Grund nicht',
          'Das Wasser ist dort salzig',
          'Dort ist es zu hell',
        ],
      ],
    ]),
    ...P('gwei', 'schutz', 'eis', [
      [
        'Wann darfst du auf einen zugefrorenen Teich?',
        [
          'Nur wenn Erwachsene sagen, dass das Eis freigegeben ist',
          'Sobald Eis darauf ist',
          'Wenn andere Kinder darauf sind',
        ],
      ],
      ['Gehst du allein aufs Eis?', ['Nein, nie', 'Ja, wenn es dick aussieht', 'Ja, im Januar']],
      [
        'Das Eis knackt unter dir. Was tust du?',
        ['Mich flach hinlegen und zurück zum Ufer kriechen', 'Hüpfen, damit es hält', 'Schnell zur Mitte laufen'],
        'Flach liegend verteilt sich dein Gewicht. So bricht das Eis nicht so leicht.',
      ],
      [
        'Jemand ist ins Eis eingebrochen. Was tust du?',
        ['Laut um Hilfe rufen, 112 wählen und vom Ufer einen Ast reichen', 'Sofort zu ihm aufs Eis laufen', 'Weggehen'],
      ],
      [
        'Am Schilf ist das Eis oft dünner.',
        true,
        'Auch auf fließendem Wasser und wo ein Bach hineinfließt, ist das Eis dünner.',
      ],
      [
        'Auf einem Fluss ist das Eis genauso fest wie auf einem Teich.',
        false,
        'Unter dem Eis fließt das Wasser weiter. Das Eis ist dort oft dünner.',
      ],
    ]),
    ...P('gwsc', 'schutz', 'schutz', [
      [
        'Warum fütterst du Enten nicht mit Brot?',
        ['Brotreste machen das Wasser schmutzig', 'Enten mögen kein Brot', 'Brot ist zu teuer'],
        'Was nicht gefressen wird, sinkt auf den Grund. Es schimmelt und lässt Algen wachsen. Brot ist auch kein gutes Futter für Enten.',
      ],
      ['Warum bleibst du im Frühling vom Schilf weg?', ['Dort brüten Vögel', 'Dort ist Strom', 'Dort ist es zu laut']],
      [
        'Du darfst Fische aus deinem Aquarium im Teich aussetzen.',
        false,
        'Fremde Tiere fressen die Tiere im Teich oder bringen Krankheiten mit.',
      ],
      [
        'Was tust du mit deinem Müll am See?',
        ['Ich nehme ihn wieder mit', 'Ich werfe ihn ins Schilf', 'Ich vergrabe ihn am Ufer'],
      ],
      [
        'Ein Bach fließt in einem geraden Betonrohr. Was fehlt den Tieren?',
        ['Steine, Kurven und Pflanzen als Versteck', 'Nichts, das ist gut für sie', 'Mehr Beton'],
      ],
      [
        'Was hilft Fröschen im Frühling auf dem Weg zum Teich über die Straße?',
        ['Ein Krötenzaun mit Eimern', 'Laute Musik', 'Helles Licht'],
        'Helferinnen und Helfer tragen die Tiere in den Eimern sicher über die Straße.',
      ],
      [
        'Plastik, das in einen Bach fällt, verschwindet nach ein paar Tagen.',
        false,
        'Plastik bleibt sehr lange. Es zerfällt in winzige Stückchen, die Tiere fressen.',
      ],
    ]),
  ];

  const GW_MODULES = {
    zone: { name: 'Zonen am Teich', icon: '🏠', maxTier: 2, worldCap: [2], dmg: 14 },
    pflanze: { name: 'Wasserpflanzen', icon: '🪷', maxTier: 2, worldCap: [2], dmg: 12 },
    tier: { name: 'Tiere am Teich', icon: '🦆', maxTier: 2, worldCap: [2], dmg: 12 },
    entw: { name: 'Vom Laich zum Frosch', icon: '🐸', maxTier: 1, worldCap: [1], dmg: 14 },
    kreislauf: { name: 'Wer frisst wen?', icon: '🔁', maxTier: 1, worldCap: [1], dmg: 14 },
    bach: { name: 'Bach und Teich', icon: '🌊', maxTier: 1, worldCap: [1], dmg: 10 },
    schutz: { name: 'Sicher am Wasser', icon: '🛟', maxTier: 1, worldCap: [1], dmg: 10 },
  };
  const GW_TUT = {
    'zone:1': {
      title: 'Zonen am Teich',
      steps: [
        'Ein Teich hat Zonen. Vom Ufer zur Mitte: Uferzone, Röhrichtzone, Schwimmblattzone, Tauchblattzone. Unten am Grund liegt die Bodenzone.',
        'Beispiel: Die Blätter der Seerose schwimmen auf dem Wasser. Sie wächst in der Schwimmblattzone.',
        'Leuchtet im Bild eine Zone, tippe auf ihren Namen. Fragt die Aufgabe nach einer Pflanze oder einem Tier, tippe auf die Zone dazu.',
      ],
    },
    'zone:2': {
      title: 'Zone finden',
      steps: [
        'Jetzt andersherum: Oben steht der Name einer Zone.',
        'Beispiel: In der Röhrichtzone stehen hohe Halme im flachen Wasser.',
        'Tippe im Bild auf diese Zone.',
      ],
    },
    'zoneord:1': {
      title: 'Zonen ordnen',
      steps: [
        'Die Zonen sind durcheinander.',
        'Fang am Ufer an und geh Schritt für Schritt ins tiefere Wasser.',
        'Zuletzt kommt die Zone, in der die Pflanzen ganz unter Wasser wachsen. Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.',
      ],
    },
    'pflanze:1': {
      title: 'Wasserpflanzen',
      steps: [
        'Schau dir die Pflanze im Bild an: Wo wächst sie? Über, auf oder unter dem Wasser?',
        'Beispiel: Runde Blätter auf dem Wasser und eine weiße Blüte – das ist die Seerose.',
        'Ohne Bild beantwortest du Fragen dazu, wie Pflanzen im Wasser leben.',
      ],
    },
    'pflanze:2': {
      title: 'Merkmale',
      steps: [
        'Die Frage nennt ein Merkmal: Blätter, Halme, Blüten oder wo die Pflanze wächst.',
        'Beispiel: „Welche Pflanze trägt am Stängel einen dicken, braunen Kolben?“ Das ist der Rohrkolben.',
        'Tippe auf die Pflanze, die passt.',
      ],
    },
    'tier:1': {
      title: 'Tiere am Teich',
      steps: [
        'Schau dir das Tier im Bild genau an: Hat es Flügel, einen Schwanz, eine Schale?',
        'Beispiel: Ein Tier mit langen Beinen, das auf dem Wasser steht – das ist der Wasserläufer.',
        'Tippe auf das Tier.',
      ],
    },
    'tier:2': {
      title: 'Tiere ohne Bild',
      steps: [
        'Jetzt gibt es kein Bild. Die Frage beschreibt das Tier.',
        'Beispiel: „Welches Tier filtert mit seinen zwei Schalen das Wasser?“ Das ist die Teichmuschel.',
        'Tippe auf das Tier, das passt.',
      ],
    },
    'entw:1': {
      title: 'Vom Laich zum Frosch',
      steps: [
        'Aus dem Laich schlüpfen Kaulquappen. Ihnen wachsen erst die Hinterbeine, dann die Vorderbeine. Der Schwanz wird kürzer.',
        'Im Bild siehst du eine Stufe davon. Beispiel: Eine Kaulquappe mit zwei Beinen hinten – sie hat schon Hinterbeine.',
        'Ohne Bild beantwortest du Fragen zu Frosch, Molch und Libelle.',
      ],
    },
    'entword:1': {
      title: 'Entwicklung ordnen',
      steps: [
        'Die Stufen der Entwicklung sind durcheinander.',
        'Jede Entwicklung beginnt mit dem Ei und endet mit dem erwachsenen Tier.',
        'Merke dir: Beim Frosch wachsen zuerst die Hinterbeine, beim Molch die Vorderbeine.',
      ],
    },
    'kreislauf:1': {
      title: 'Wer frisst wen?',
      steps: [
        'Eine Nahrungskette zeigt, wer von wem gefressen wird. Sie beginnt mit einer Pflanze, im Wasser oft mit Algen.',
        'Beispiel: Der Wasserfloh frisst Algen, der Stichling frisst den Wasserfloh.',
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
    'bach:1': {
      title: 'Bach und Teich',
      steps: [
        'Im Bach fließt das Wasser, im Teich steht es.',
        'An den Tieren im Bach siehst du, wie sauber das Wasser ist. Beispiel: Steinfliegenlarven leben nur in sauberem Wasser.',
        'Tippe auf die richtige Antwort.',
      ],
    },
    'bachord:1': {
      title: 'Der Weg des Wassers',
      steps: [
        'Die Schritte sind durcheinander.',
        'Fang dort an, wo das Wasser aus der Erde kommt, oder dort, wo das Wasser schmutzig wird.',
        'Überlege bei jedem Schritt: Was kommt danach?',
      ],
    },
    'schutz:1': {
      title: 'Sicher am Wasser',
      steps: [
        'Fragen zu den Baderegeln, zum Eis und dazu, wie du Tiere am Wasser schützt.',
        'Beispiel: Ich gehe nur baden, wenn mir bei Problemen jemand helfen kann.',
        'Manchmal wählst du „Richtig“ oder „Falsch“, manchmal eine von drei Antworten.',
      ],
    },
  };

  const names = <T extends { name: string }>(list: T[]) => list.map((x) => x.name);
  function gwGen(cfg: Unit) {
    return (mod: string, tier: number, know: Know, seq: number, opts?: GenOpts) => {
      if (wantsPool(cfg, mod, opts)) return null;
      const r = Math.random();
      if (mod === 'zone') {
        const part = pick(ZONES);
        if (tier >= 2 && r < 0.5)
          return {
            kind: 'parts-find',
            mod,
            tier: 2,
            group: 'zone:2',
            note: 'zonen',
            plant: 'teich',
            q: TEICH.find(part),
            part: part.id,
            answer: part.name,
            qid: 'gwzf_' + part.id,
          };
        if (r < 0.25)
          return {
            kind: 'parts',
            mod,
            tier: 1,
            group: 'zone:1',
            note: 'zonen',
            plant: 'teich',
            q: TEICH.ask(part),
            part: part.id,
            options: shuffle(
              shuffle(names(ZONES.filter((z) => z !== part)))
                .slice(0, 3)
                .concat(part.name),
            ),
            answer: part.name,
            qid: 'gwz_' + part.id,
          };
        if (r < 0.55) {
          const h = pick(HOME);
          return choice(
            mod,
            'zonen',
            h.q,
            'In der ' + ZONES[h.z].name,
            shuffle(ZONES.filter((_, i) => i !== h.z && !(h.skip || []).includes(i)))
              .slice(0, 2)
              .map((z) => 'In der ' + z.name),
            'gwhome_' + HOME.indexOf(h),
          );
        }
        if (r < 0.7)
          return orderTask(
            mod,
            'zoneord:1',
            'zonen',
            'Tippe die Zonen vom Ufer bis zur Teichmitte der Reihe nach an.',
            ZONE_ORDER,
            'gwzord_',
          );
        return null;
      }
      if (mod === 'pflanze') {
        if (tier >= 2 && r < 0.7) {
          const t = pick(PLANT_TRAITS);
          return choice(
            mod,
            'pflanzen',
            t.q,
            PLANTS.find((x) => x.id === t.has[0])!.name,
            names(shuffle(PLANTS.filter((x) => !t.has.includes(x.id) && !(t.skip || []).includes(x.id))).slice(0, 2)),
            'gwpm_' + PLANT_TRAITS.indexOf(t),
            { group: 'pflanze:2', tier: 2 },
          );
        }
        if (r < 0.45) {
          const p = pick(PLANTS);
          return choice(
            mod,
            'pflanzen',
            'Welche Pflanze siehst du im Bild?',
            p.name,
            names(shuffle(PLANTS.filter((x) => x !== p)).slice(0, 2)),
            'gwpb_' + p.id,
            { pic: drawSVG(p.id, 'Eine Pflanze am oder im Wasser') },
          );
        }
        return null;
      }
      if (mod === 'tier') {
        if (tier >= 2 && r < 0.6) {
          const t = pick(ANIMAL_TRAITS);
          return choice(
            mod,
            'tiere',
            t.q,
            ANIMALS.find((x) => x.id === t.a)!.name,
            names(shuffle(ANIMALS.filter((x) => x.id !== t.a)).slice(0, 2)),
            'gwtm_' + ANIMAL_TRAITS.indexOf(t),
            { group: 'tier:2', tier: 2 },
          );
        }
        if (r < 0.45) {
          const a = pick(ANIMALS);
          return choice(
            mod,
            'tiere',
            'Welches Tier siehst du im Bild?',
            a.name,
            names(shuffle(ANIMALS.filter((x) => x !== a)).slice(0, 2)),
            'gwtb_' + a.id,
            { pic: drawSVG(a.id, 'Ein Tier am oder im Wasser') },
          );
        }
        return null;
      }
      if (mod === 'entw') {
        if (r < 0.3) {
          const d = pick(DEV);
          return orderTask(mod, 'entword:1', d === DEV[1] ? 'libelle' : 'frosch', d.q, d.items, d.qid);
        }
        if (r < 0.5) {
          const s = pick(STAGES);
          return choice(
            mod,
            'frosch',
            'Was siehst du im Bild?',
            s.name,
            names(shuffle(STAGES.filter((x) => x !== s)).slice(0, 2)),
            'gwsb_' + s.id,
            { pic: drawSVG(s.id, 'Eine Stufe vom Laich zum Frosch') },
          );
        }
        return null;
      }
      if (mod === 'kreislauf' && r < 0.4) {
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
      if (mod === 'bach') {
        if (r < 0.15)
          return orderTask(
            mod,
            'bachord:1',
            'bach',
            'Von der Quelle bis zum Meer: Tippe die Schritte der Reihe nach an.',
            BACH,
            'gwbord_',
          );
        if (r < 0.25)
          return orderTask(
            mod,
            'bachord:1',
            'guete',
            'So wird schmutziges Wasser wieder sauber: Tippe die Schritte der Reihe nach an.',
            KLAER,
            'gwklaer_',
          );
        if (r < 0.45) {
          const z = pick(ZEIGER);
          return choice(
            mod,
            'guete',
            `Im Bach findest du ${z.clean ? 'viele' : 'fast nur'} ${z.many}. Was sagt das über das Wasser?`,
            z.clean ? CLEAN : DIRTY,
            [z.clean ? DIRTY : CLEAN, SALTY],
            'gwzei_' + ZEIGER.indexOf(z),
          );
        }
      }
      return null;
    };
  }
  const GW: Unit = {
    modules: GW_MODULES,
    tut: GW_TUT,
    notes: GW_NOTES,
    pool: GW_POOL,
    worlds: 1,
    grade: 3,
    subject: 'Sachkunde',
    title: 'Am Wasser',
    icon: '🐸',
    sub: 'Zonen am Teich, Wasserpflanzen und -tiere, vom Laich zum Frosch, Bach und Teich, sicher am Wasser',
    starters: [
      {
        id: 'biologin',
        type: 'pflanze',
        shape: 'biologin',
        names: ['Die Biologin', 'Die Biologin', 'Die Biologin'],
        hp: 70,
        desc: 'Sie untersucht Teiche und Bäche mit Kescher und Wathose. An den Tieren im Wasser erkennt sie, wie sauber es ist.',
        perk: 'heal',
        attacks: [
          { name: 'Kescher', mod: 'tier' },
          { name: 'Wathose', mod: 'zone' },
          { name: 'Schilfhalm', mod: 'entw' },
          { name: 'Bestimmungsbuch', mod: 'pflanze' },
        ],
      },
    ],
    extra: {
      tier: 'Kescher',
      zone: 'Wathose',
      entw: 'Schilfhalm',
      pflanze: 'Bestimmungsbuch',
      kreislauf: 'Hechtsprung',
      bach: 'Wasserprobe',
      schutz: 'Rettungsring',
    },
    enemies: {
      1: {
        normal: [
          { name: 'Der Ölfleck', type: 'normal', shape: 'oelfleck', hp: 26, atk: 3 },
          { name: 'Die Plastikflasche', type: 'normal', shape: 'plastikflasche', hp: 24, atk: 4 },
          { name: 'Das dünne Eis', type: 'wasser', shape: 'duenneseis', hp: 30, atk: 3 },
          { name: 'Der Düngersack', type: 'feuer', shape: 'duengersack', hp: 28, atk: 4 },
        ],
        elite: { name: 'Die Algenblüte', type: 'normal', shape: 'algenbluete', hp: 45, atk: 5 },
        boss: {
          name: 'Das Abwasserrohr',
          acc: 'das Abwasserrohr',
          type: 'wasser',
          shape: 'abwasserrohr',
          hp: 70,
          atk: 6,
          boss: true,
        },
      },
    },
    moves: ['Ölfilm', 'Eisknacken', 'Algenteppich', 'Düngerregen', 'Flaschenwurf', 'Abwasserschwall'],
    events: [
      {
        title: 'Der Steg',
        text: 'Am Steg sitzt ein Angler. Er zeigt auf einen Frosch am Ufer und fragt dich nach den Tieren am Teich. Für die richtige Antwort gibt er dir einen Trank.',
        opts: [
          { label: 'Antworten', task: 'tier', g: 'tiere', win: { item: 'trank' }, lose: { hp: -6 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Der Kescher',
        text: 'Ein Mädchen hat mit dem Kescher eine Wasserpest aus dem Teich geholt. Sie fragt dich, in welcher Zone die Pflanze wächst.',
        opts: [
          { label: 'Antworten', task: 'zone', g: 'zonen', win: { xp: 20 }, lose: { xp: 5 } },
          { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } },
        ],
      },
      {
        title: 'Die Wasserprobe',
        text: 'Am Bach setzt eine Schulklasse kleine Tiere in eine weiße Schale. Die Lehrerin fragt dich, was die Tiere über das Wasser verraten, und gibt dir einen Schild für die richtige Antwort.',
        opts: [
          { label: 'Antworten', task: 'bach', g: 'guete', win: { item: 'schild' }, lose: { hp: -5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Das Reetdach',
        text: 'Am Ufer schneidet ein Mann Schilf für ein Reetdach. Er kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort.',
        opts: [
          { label: 'Antworten', task: 'pflanze', g: 'pflanzen', win: { item: 'lupe' }, lose: { xp: 5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Der Froschlaich',
        text: 'Im flachen Wasser liegen Klumpen aus Laich. Ein Junge fragt dich, was daraus wird, und gibt dir eine Chilischote für die Antwort.',
        opts: [
          { label: 'Antworten', task: 'entw', g: 'frosch', win: { item: 'keks' }, lose: { hp: -5 } },
          { label: 'Weitergehen', effect: {} },
        ],
      },
      {
        title: 'Die Kaulquappen',
        dilemma: true,
        reward: { hp: 5 },
        text: 'Im Teich schwimmen viele Kaulquappen. Lena hat ein Glas dabei und will ein paar mit nach Hause nehmen.',
        opts: [
          {
            label: 'Ich sage: „Die bleiben hier, Frösche sind geschützt.“',
            then: 'Lena schraubt das Glas zu. Ihr legt euch ans Ufer und zählt, wie vielen schon Beine wachsen.',
            think: 'Warum dürfen Kaulquappen nicht aus dem Teich mitgenommen werden?',
          },
          {
            label: 'Ich schlage vor, sie vom Steg aus zu zeichnen.',
            then: 'Ihr zeichnet die Kaulquappen. Auf Lenas Bild haben zwei schon Hinterbeine.',
            think: 'Was lernt man beim Beobachten, ohne ein Tier mitzunehmen?',
          },
          {
            label: 'Ich helfe Lena beim Einfangen.',
            then: 'Zu Hause steht das Glas auf dem Fensterbrett. Am nächsten Morgen ist das Wasser warm und trüb.',
            think: 'Was haben Kaulquappen im Teich, das ihnen im Glas fehlt?',
          },
        ],
      },
      {
        title: 'Die Enten am See',
        dilemma: true,
        reward: { hp: 5 },
        text: 'Am See schwimmen Enten. Ben hat eine Tüte mit altem Brot dabei und will sie füttern.',
        opts: [
          {
            label: 'Ich sage Ben, dass Brot den Enten nicht guttut.',
            then: 'Ben ist enttäuscht. Ihr seht zu, wie die Enten gründeln und selbst Futter finden.',
            think: 'Woher bekommen Enten auf dem See ihr Futter?',
          },
          {
            label: 'Ich frage einen Erwachsenen, was wir mit dem Brot machen.',
            then: 'Bens Opa nimmt die Tüte wieder mit nach Hause. Ihr setzt euch ans Ufer und zählt die Küken.',
            think: 'Wann ist es gut, einen Erwachsenen zu fragen?',
          },
          {
            label: 'Ich werfe mit Ben das Brot ins Wasser.',
            then: 'Die Enten schnappen zu. Viele Stücke sinken auf den Grund und werden dort weich und schimmlig.',
            think: 'Was passiert im Wasser mit dem Brot, das keine Ente frisst?',
          },
        ],
      },
      {
        title: 'Die Bank am Ufer',
        text: 'Am Ufer steht eine Bank unter einer Weide. Hier ruhst du dich aus.',
        opts: [
          { label: 'Ausruhen (+15 LP)', effect: { hp: 15 } },
          { label: 'Weiter', effect: {} },
        ],
      },
    ],
  };
  GW.gen = gwGen(GW);

  K.MODES.gewaesser = GW;
  return {
    ZONES,
    HOME,
    PLANTS,
    ANIMALS,
    STAGES,
    PLANT_TRAITS,
    ANIMAL_TRAITS,
    DEV,
    CHAINS,
    BACH,
    KLAER,
    ZEIGER,
    drawSVG,
  };
})();
