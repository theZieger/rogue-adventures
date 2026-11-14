// Turmwacht drawings: the board scene, the Wissensturm, token marks and the Bauzeit card pictures.
// Same hand as monsters.js: ink #1C2541, round joins, gradients lit from the top left, one white highlight.
// Board units: the scene is drawn in a W × H box (geo); app.js places the HTML tokens with the same numbers.
const TWART = (() => {
  const INK = '#1C2541';
  let uid = 0;
  const shade = (hex, amt) => MONART.shade(hex, amt);
  const S = (w) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const F = (fill, w) => `fill="${fill}" ${S(w)}`;
  const N = (w) => `fill="none" ${S(w)}`;
  const r1 = (v) => Math.round(v * 10) / 10;
  // gradient factory per drawing, so ids stay unique when the same picture is on the page twice
  function defs() {
    const id = 'tw' + (uid++), list = [];
    const add = (tag, attrs, stops) => { const k = `${id}_${list.length}`; list.push(`<${tag} id="${k}" ${attrs}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a == null ? '' : ` stop-opacity="${a}"`}/>`).join('')}</${tag}>`); return `url(#${k})`; };
    return {
      lin: (a, b, h) => add('linearGradient', `x1="0" y1="0" x2="${h ? 1 : 0}" y2="${h ? 0 : 1}"`, [[0, a], [1, b]]),
      linS: (stops, h) => add('linearGradient', `x1="0" y1="0" x2="${h ? 1 : 0}" y2="${h ? 0 : 1}"`, stops),
      rad: (c) => add('radialGradient', 'cx=".36" cy=".3" r=".8"', [[0, shade(c, 0.42)], [0.55, c], [1, shade(c, -0.3)]]),
      radS: (attrs, stops) => add('radialGradient', attrs, stops),
      clip: (inner) => { const k = `${id}_${list.length}`; list.push(`<clipPath id="${k}">${inner}</clipPath>`); return `url(#${k})`; },
      out: () => `<defs>${list.join('')}</defs>`,
    };
  }
  const spark = (x, y, s, c) => `<path d="M${x} ${r1(y - s)} Q${x} ${y} ${r1(x + s)} ${y} Q${x} ${y} ${x} ${r1(y + s)} Q${x} ${y} ${r1(x - s)} ${y} Q${x} ${y} ${x} ${r1(y - s)} Z" fill="${c || '#FFE066'}"/>`;

  /* ---------- rooms: one tower floor per subject ---------- */
  // name = the floor's name in the Bauzeit; c = the subject's colour (paths, banners, boss shields)
  const ROOMS = {
    Mathe: { name: 'Rechenstube', c: '#3B7DD8' },
    Deutsch: { name: 'Schreibstube', c: '#E8833A' },
    Sachkunde: { name: 'Kartoffelkeller', c: '#4FA64F' },
    Ethik: { name: 'Druckerei', c: '#8E6AD0' },
    Musik: { name: 'Glockenstube', c: '#E0507A' },
    Englisch: { name: 'Plauderstube', c: '#22A39A' },
  };
  const subjColor = (s) => (ROOMS[s] || { c: '#8A93B0' }).c;
  // a subject split over several paths gets lighter/darker variants, so the boss shields stay apart
  function laneColors(lanes) {
    return lanes.map((l, i) => { const same = lanes.filter((x) => x.subject === l.subject); const k = same.indexOf(l); return same.length > 1 ? shade(subjColor(l.subject), [0, 0.38, -0.3][k]) : subjColor(l.subject); });
  }

  /* ---------- board geometry ---------- */
  // cells[0] is cell 1 (at the gate) … cells[4] cell 5; spots = the two guard pedestals; head = where the name chip sits
  // (anchor: 'l' left edge, 'r' right edge, 'c' centre); hp = the tower's ❤️ chip (anchor 'c' top centre, 'rb' bottom right corner); path = extra points before cell 5 (from the board edge) and after cell 1
  const W = 358;
  const LEFT = { cells: [[118, 270], [86, 236], [66, 194], [58, 148], [62, 101]], spots: [[30, 252], [106, 150]], from: [[70, -14], [64, 52]], to: [[146, 290]], head: [8, 8, 'l'] };
  const mirror = (g) => ({ cells: g.cells.map(([x, y]) => [W - x, y]), spots: g.spots.map(([x, y]) => [W - x, y]), from: g.from.map(([x, y]) => [W - x, y]), to: g.to.map(([x, y]) => [W - x, y]), head: [W - g.head[0], g.head[1], 'r'] });
  const BOTTOM = { cells: [[179, 326], [214, 358], [212, 404], [176, 434], [134, 452]], spots: [[120, 372], [262, 398]], from: [[58, 500], [92, 468]], to: [[179, 290]], head: [8, 404, 'l'] };
  function geo(L) {
    if (L >= 3) return { w: W, h: 470, gate: [179, 262], lanes: [LEFT, mirror(LEFT), BOTTOM], hp: [W - 8, 462, 'rb'] };
    if (L === 2) return { w: W, h: 340, gate: [179, 262], lanes: [LEFT, mirror(LEFT)], hp: [179, 302, 'c'] };
    return { w: W, h: 470, gate: [179, 262], lanes: [BOTTOM], hp: [W - 8, 462, 'rb'] };
  }

  // Catmull-Rom through the points as one smooth path
  function smooth(p) {
    let d = `M${p[0][0]} ${p[0][1]}`;
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
      d += ` C${r1(b[0] + (c[0] - a[0]) / 6)} ${r1(b[1] + (c[1] - a[1]) / 6)} ${r1(c[0] - (e[0] - b[0]) / 6)} ${r1(c[1] - (e[1] - b[1]) / 6)} ${c[0]} ${c[1]}`;
    }
    return d;
  }
  const tuft = (x, y, k, c) => `<path d="M${x - 5 * k} ${y} q${2 * k} ${-6 * k} ${1 * k} ${-10 * k} M${x} ${y} q0 ${-7 * k} ${2 * k} ${-12 * k} M${x + 5 * k} ${y} q${-1 * k} ${-5 * k} ${2 * k} ${-9 * k}" fill="none" stroke="${c}" stroke-width="${r1(1.8 * k)}" stroke-linecap="round"/>`;
  function bush(D, x, y, k) {
    const g = D.rad('#3F7A4E');
    return `<ellipse cx="${x}" cy="${y + 2}" rx="${22 * k}" ry="${5 * k}" fill="${INK}" opacity=".22"/><path d="M${x - 20 * k} ${y} q-4 ${-14 * k} ${8 * k} ${-16 * k} q${4 * k} ${-12 * k} ${16 * k} ${-8 * k} q${10 * k} ${-6 * k} ${16 * k} ${6 * k} q${10 * k} ${4 * k} ${2 * k} ${18 * k} Z" fill="${g}" ${S(2)}/>` +
      `<path d="M${x - 10 * k} ${y - 14 * k} q${5 * k} ${-5 * k} ${10 * k} ${-3 * k}" fill="none" stroke="#9FD38A" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
  }
  function tree(D, x, y, k) {
    const leaf = D.rad('#2F6B4A');
    return `<ellipse cx="${x}" cy="${y + 2}" rx="${18 * k}" ry="${5 * k}" fill="${INK}" opacity=".25"/><path d="M${x - 4 * k} ${y} L${x - 3 * k} ${y - 18 * k} L${x + 3 * k} ${y - 18 * k} L${x + 4 * k} ${y} Z" fill="#6E4A2E" ${S(2)}/>` +
      `<path d="M${x} ${y - 66 * k} C${x + 14 * k} ${y - 62 * k} ${x + 24 * k} ${y - 36 * k} ${x + 20 * k} ${y - 22 * k} C${x + 16 * k} ${y - 12 * k} ${x - 16 * k} ${y - 12 * k} ${x - 20 * k} ${y - 22 * k} C${x - 24 * k} ${y - 36 * k} ${x - 14 * k} ${y - 62 * k} ${x} ${y - 66 * k} Z" fill="${leaf}" ${S(2.2)}/>` +
      `<path d="M${x - 8 * k} ${y - 50 * k} q${3 * k} ${-6 * k} ${8 * k} ${-8 * k}" fill="none" stroke="#9FD38A" stroke-width="2" stroke-linecap="round" opacity=".55"/>`;
  }
  // the flagstone a monster stands on (cell), tinted with its path's colour
  const stone = (x, y, c) => `<ellipse cx="${x}" cy="${y + 2.5}" rx="21" ry="12" fill="${INK}" opacity=".28"/><ellipse cx="${x}" cy="${y}" rx="20" ry="11.5" fill="${shade(c, 0.55)}" ${S(2)}/><ellipse cx="${x}" cy="${y - 1.6}" rx="15.5" ry="7.6" fill="${shade(c, 0.72)}"/><path d="M${x - 12} ${y - 3.5} q5 -4 12 -4.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`;
  // guard pedestal: a dressed stone block seen from slightly above; its band carries the path colour
  function pedestal(D, x, y, c) {
    const face = D.linS([[0, '#9AA3BC'], [0.25, '#D3D8E4'], [1, '#7C86A2']], true);
    return `<ellipse cx="${x}" cy="${y + 12}" rx="20" ry="5" fill="${INK}" opacity=".3"/><rect x="${x - 15}" y="${y}" width="30" height="12" rx="2" fill="${face}" ${S(2.2)}/>` +
      `<path d="M${x - 14} ${y + 7.5} H${x + 14} M${x - 4} ${y + 7.5} V${y + 11} M${x + 7} ${y + 4} V${y + 7.5}" stroke="#6E7894" stroke-width="1.1" opacity=".7"/><rect x="${x - 15}" y="${y}" width="30" height="3.6" fill="${c}" stroke="${INK}" stroke-width="1.4"/>` +
      `<path d="M${x - 15} ${y} L${x - 11.5} ${y - 7} H${x + 11.5} L${x + 15} ${y} Z" fill="#E4E8F0" ${S(2.2)}/><path d="M${x - 10} ${y - 4.5} H${x + 2}" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`;
  }
  // background: meadow at dusk, the paths with their flagstones, the courtyard at the gate, pedestals
  function scene(lanes) {
    const G = geo(lanes.length), D = defs(), cols = laneColors(lanes), { w, h } = G, [gx, gy] = G.gate;
    const ground = D.radS(`cx=".5" cy=".55" r=".75"`, [[0, '#4C7A5A'], [0.6, '#3B664E'], [1, '#2A4A44']]);
    const dusk = D.linS([[0, '#24305A', 0.55], [0.35, '#24305A', 0]]);
    let s = `<rect width="${w}" height="${h}" fill="${ground}"/><rect width="${w}" height="${h}" fill="${dusk}"/>`;
    // calm ground detail: a few grass tufts and pale flowers, kept away from the paths
    const tufts = [[24, 40], [150, 30], [210, 22], [330, 60], [20, 340], [334, 330], [120, 100], [244, 108], [300, 200], [52, 300], [180, 186], [262, 300]].concat(lanes.length >= 3 ? [[300, 420], [240, 452], [60, 366], [150, 400], [250, 352]] : [[60, 324], [300, 322]]);
    s += tufts.filter(([x, y]) => y < h - 6).map(([x, y], i) => tuft(x, y, 1, i % 2 ? '#6FA067' : '#5E8F5B')).join('');
    s += [[36, 196], [324, 150], [200, 40], [140, 236], [16, 120]].filter(([x, y]) => y < h).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#FFF3C4" opacity=".8"/><circle cx="${x + 4}" cy="${y + 2}" r="1.6" fill="#F7B6D0" opacity=".8"/>`).join('');
    // fireflies
    s += [[96, 70], [270, 40], [330, 250], [24, 220], [200, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#FFE066" opacity=".18"/><circle cx="${x}" cy="${y}" r="1.4" fill="#FFF3B0"/>`).join('');
    // courtyard in front of the gate
    s += `<ellipse cx="${gx}" cy="${gy + 6}" rx="74" ry="24" fill="${INK}" opacity=".25"/><ellipse cx="${gx}" cy="${gy + 3}" rx="72" ry="22" fill="${D.lin('#CBBE9C', '#A8996F')}" ${S(2.4)}/>`;
    s += [[-44, 2], [-22, 12], [6, 15], [32, 10], [52, 0], [-56, -6], [58, -9], [-30, -6], [26, -4]].map(([dx, dy]) => `<ellipse cx="${gx + dx}" cy="${gy + 3 + dy}" rx="9" ry="4" fill="#B9AB82" stroke="#8C7E5A" stroke-width="1.1"/>`).join('');
    // paths: dark edge, sand band, path-colour wash, then the flagstones
    G.lanes.slice(0, lanes.length).forEach((g, i) => {
      const d = smooth([...g.from, ...g.cells.slice().reverse(), ...g.to]), c = cols[i];
      s += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="38" stroke-linecap="round" opacity=".9"/><path d="${d}" fill="none" stroke="#C9B98E" stroke-width="33" stroke-linecap="round"/>`;
      s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="33" stroke-linecap="round" opacity=".28"/><path d="${d}" fill="none" stroke="#FFF7E0" stroke-width="2" stroke-dasharray="2 9" stroke-linecap="round" opacity=".45" transform="translate(-6 -2)"/>`;
    });
    G.lanes.slice(0, lanes.length).forEach((g, i) => { s += g.cells.map(([x, y]) => stone(x, y, cols[i])).join(''); });
    // trees and bushes frame the free corners
    const deco = lanes.length >= 3 ? [['t', 30, 384, 0.62], ['b', 330, 300, 0.8], ['b', 30, 322, 0.7], ['t', 334, 384, 0.62], ['b', 186, 40, 0.6], ['b', 80, 470, 0.7]]
      : lanes.length === 2 ? [['t', 30, 334, 0.7], ['t', 330, 334, 0.7], ['b', 179, 36, 0.6], ['b', 92, 324, 0.6], ['b', 266, 324, 0.6]]
        : [['t', 40, 120, 0.8], ['t', 316, 140, 0.8], ['b', 60, 250, 0.7], ['b', 300, 250, 0.7], ['b', 180, 40, 0.6]];
    s += deco.map(([k, x, y, z]) => (k === 't' ? tree(D, x, y, z) : bush(D, x, y, z))).join('');
    G.lanes.slice(0, lanes.length).forEach((g, i) => { s += g.spots.map(([x, y]) => pedestal(D, x, y, cols[i])).join(''); });
    return `<svg class="tw-scene" viewBox="0 0 ${w} ${h}" aria-hidden="true" preserveAspectRatio="none">${D.out()}${s}</svg>`;
  }

  /* ---------- the Wissensturm ---------- */
  // tower units: viewBox 110 wide; the wall is x 17–93, the base 13–97. TOP = room above the parapet for the turret and flag.
  const TOP = 78, FLOOR = 38, BASE = 50, CX = 55;
  const towerH = (n) => TOP + FLOOR * n + BASE + 8;
  // ashlar courses on a wall section; light stones scattered so the wall isn't a grid
  function ashlar(x0, x1, y0, y1, row, seed) {
    let s = '';
    for (let y = y0 + row, k = 0; y < y1 - 1; y += row, k++) {
      s += `<path d="M${x0 + 1} ${y} H${x1 - 1}" stroke="#6E7894" stroke-width="1.1" opacity=".55"/>`;
      for (let x = x0 + ((k + seed) % 2 ? 9 : 17); x < x1 - 4; x += 16) s += `<path d="M${x} ${y} v${-row + 1}" stroke="#6E7894" stroke-width="1.1" opacity=".5"/>`;
    }
    return s;
  }
  const wallGrad = (D) => D.linS([[0, '#9AA3BC'], [0.22, '#D9DEEA'], [0.55, '#B6BED0'], [1, '#7C86A2']], true);
  // window cut into a floor: a dark room, sill, frame; inside() draws what's in the room
  function arch(x, y, w, h) { return `M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h} Z`; }
  const sill = (x, y, w) => `<rect x="${x - 3}" y="${y}" width="${w + 6}" height="4" rx="1.5" fill="#E2E6EF" ${S(1.8)}/>`;
  const shutter = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${c}" ${S(1.8)}/><path d="M${x + 1.5} ${y + h / 3} h${w - 3} M${x + 1.5} ${y + (2 * h) / 3} h${w - 3}" stroke="${shade(c, -0.35)}" stroke-width="1.2"/>`;
  const ROOM_ART = {
    // abacus in a wide window, blue shutters
    Mathe(D, y, c) {
      const wx = 33, wy = y + 8, ww = 44, wh = 22;
      let s = shutter(wx - 10, wy, 9, wh, c) + shutter(wx + ww + 1, wy, 9, wh, c);
      s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="2" fill="#2A2F4A" ${S(2)}/><rect x="${wx + 4}" y="${wy + 3}" width="${ww - 8}" height="${wh - 5}" rx="1.5" fill="none" stroke="#A8743E" stroke-width="2.2"/>`;
      s += [0, 1, 2].map((r) => { const ry = wy + 7.5 + r * 5.5, col = ['#FF6A3D', '#FFC93C', '#4FC96A'][r]; return `<path d="M${wx + 5} ${ry} H${wx + ww - 5}" stroke="#C9CED8" stroke-width="1"/>` + [0, 1, 2, 3, 4].map((b) => `<circle cx="${wx + 9 + b * 4.2 + (b > 1 + r % 2 ? 9 : 0)}" cy="${ry}" r="2.1" fill="${col}" stroke="${INK}" stroke-width=".8"/>`).join(''); }).join('');
      return s + sill(wx, wy + wh, ww);
    },
    // arched window, a lectern with a sheet and a quill
    Deutsch(D, y, c) {
      const wx = 39, wy = y + 5, ww = 32, wh = 27;
      let s = `<path d="${arch(wx - 4, wy - 3, ww + 8, wh + 3)}" fill="${c}" ${S(2)}/><path d="${arch(wx, wy, ww, wh)}" fill="#2A2F4A" ${S(2)}/>`;
      s += `<path d="M${wx + 7} ${wy + wh} L${wx + 12} ${wy + 16} L${wx + 25} ${wy + 16} L${wx + 22} ${wy + wh}" fill="#8E5E36" ${S(1.4)}/><path d="M${wx + 9} ${wy + 16} L${wx + 13} ${wy + 9} L${wx + 26} ${wy + 9} L${wx + 25} ${wy + 16} Z" fill="#FFF7E6" ${S(1.4)}/><path d="M${wx + 15} ${wy + 12} h8 M${wx + 14} ${wy + 14} h8" stroke="#8A8FA3" stroke-width=".9"/>`;
      s += `<path d="M${wx + 24} ${wy + 10} Q${wx + 30} ${wy + 1} ${wx + 29} ${wy - 2} Q${wx + 25} ${wy + 3} ${wx + 24} ${wy + 10} Z" fill="#FFFDF5" ${S(1.2)}/>`;
      return s + sill(wx, wy + wh, ww);
    },
    // half-timbered cellar floor: hatch with a potato sack
    Sachkunde(D, y, c) {
      let s = `<rect x="17" y="${y}" width="76" height="${FLOOR}" fill="${D.lin('#F2E4C4', '#D8C49A')}"/>`;
      s += `<path d="M17 ${y + 1.5} H93 M17 ${y + FLOOR - 1.5} H93 M23 ${y} V${y + FLOOR} M87 ${y} V${y + FLOOR} M23 ${y + 2} L35 ${y + FLOOR - 2} M87 ${y + 2} L75 ${y + FLOOR - 2}" stroke="#7A4E2D" stroke-width="3.2"/>`;
      s += `<rect x="38" y="${y + 6}" width="34" height="27" rx="2" fill="#7A4E2D" ${S(2)}/><rect x="41" y="${y + 9}" width="28" height="24" fill="#2A2F4A" ${S(1.4)}/><rect x="41" y="${y + 9}" width="28" height="3" fill="${c}"/>`;
      s += `<path d="M44 ${y + 33} Q43 ${y + 18} 50 ${y + 16} Q56 ${y + 14} 59 ${y + 19} Q63 ${y + 26} 62 ${y + 33} Z" fill="#C9A66B" ${S(1.6)}/><path d="M47 ${y + 18} q4 -3 9 0" fill="none" ${S(1.4)}/>` +
        [[61, y + 30], [66, y + 31], [64, y + 26]].map(([px, py]) => `<ellipse cx="${px}" cy="${py}" rx="3.2" ry="2.4" fill="#D9A55A" stroke="${INK}" stroke-width="1"/>`).join('');
      return s;
    },
    // a printing press behind a wide window, printed sheets on a line
    Ethik(D, y, c) {
      const wx = 30, wy = y + 6, ww = 50, wh = 25;
      let s = `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="2" fill="#2A2F4A" ${S(2)}/><path d="M${wx + 2} ${wy + 5} H${wx + ww - 2}" stroke="#C9CED8" stroke-width=".9"/>`;
      s += [0, 1, 2].map((k) => `<rect x="${wx + 6 + k * 7}" y="${wy + 5}" width="5.5" height="7" fill="#FFFDF5" stroke="${INK}" stroke-width=".8"/><path d="M${wx + 7 + k * 7} ${wy + 8} h3.5 M${wx + 7 + k * 7} ${wy + 10} h3.5" stroke="${c}" stroke-width=".9"/>`).join('');
      s += `<rect x="${wx + 30}" y="${wy + 6}" width="3" height="${wh - 6}" fill="#8E5E36" stroke="${INK}" stroke-width="1"/><rect x="${wx + 44}" y="${wy + 6}" width="3" height="${wh - 6}" fill="#8E5E36" stroke="${INK}" stroke-width="1"/><rect x="${wx + 29}" y="${wy + 5}" width="19" height="4" fill="#A87442" stroke="${INK}" stroke-width="1"/>`;
      s += `<path d="M${wx + 39} ${wy + 9} V${wy + 15}" stroke="#C9CED8" stroke-width="2.4"/><rect x="${wx + 33}" y="${wy + 15}" width="12" height="3" fill="#C9CED8" stroke="${INK}" stroke-width=".9"/><path d="M${wx + 39} ${wy + 11} L${wx + 30} ${wy + 9}" stroke="#E2B07A" stroke-width="1.8" stroke-linecap="round"/><rect x="${wx + 31}" y="${wy + 19}" width="15" height="3" fill="#FFFDF5" stroke="${INK}" stroke-width=".8"/>`;
      return s + `<rect x="${wx - 4}" y="${wy - 4}" width="${ww + 8}" height="5" rx="1.5" fill="${c}" ${S(1.8)}/>` + sill(wx, wy + wh, ww);
    },
    // open belfry: two arches and a golden bell
    Musik(D, y, c) {
      let s = `<path d="${arch(28, y + 4, 54, 30)}" fill="#2A2F4A" ${S(2.2)}/><path d="M55 ${y + 6} V${y + 34}" stroke="${INK}" stroke-width="0"/>`;
      s += `<path d="M30 ${y + 13} H80" stroke="#7A4E2D" stroke-width="3"/><path d="M55 ${y + 13} V${y + 15}" stroke="${INK}" stroke-width="2"/>`;
      s += `<path d="M46 ${y + 30} Q46 ${y + 16} 55 ${y + 15} Q64 ${y + 16} 64 ${y + 30} L66 ${y + 31} L44 ${y + 31} Z" fill="${D.rad('#F2C23C')}" ${S(1.8)}/><circle cx="55" cy="${y + 33}" r="2.2" fill="#B8862A" ${S(1.2)}/><path d="M49 ${y + 21} q1 -3 3 -4" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`;
      s += `<path d="M38 ${y + 21} q-3 3.5 0 7 M72 ${y + 21} q3 3.5 0 7" fill="none" stroke="#FFF3C4" stroke-width="1.8" stroke-linecap="round"/>`;
      return s + `<path d="M26 ${y + 34} H84" ${S(2.2)}/><rect x="25" y="${y + 33}" width="60" height="3.5" rx="1.5" fill="${c}" ${S(1.6)}/>`;
    },
    // window with a flower box, two speech bubbles in front
    Englisch(D, y, c) {
      const wx = 38, wy = y + 6, ww = 34, wh = 22;
      let s = `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="2" fill="#2A2F4A" ${S(2)}/><path d="M${wx + ww / 2} ${wy} V${wy + wh} M${wx} ${wy + 10} H${wx + ww}" stroke="#E2E6EF" stroke-width="2"/>`;
      s += `<rect x="${wx - 3}" y="${wy + wh}" width="${ww + 6}" height="6" rx="1.5" fill="${c}" ${S(1.8)}/>` + [0, 1, 2, 3].map((k) => `<circle cx="${wx + 3 + k * 9.5}" cy="${wy + wh - 1}" r="2.4" fill="${['#FF7A9A', '#FFE066', '#FF7A9A', '#FFE066'][k]}" stroke="${INK}" stroke-width=".9"/>`).join('');
      const bub = (x, by, w, txt, flip) => `<path d="M${x} ${by} h${w} a3 3 0 0 1 3 3 v6 a3 3 0 0 1 -3 3 h${-w + (flip ? 4 : 10)} l${flip ? 4 : -3} 4 l${flip ? -1 : -3} -4 h${flip ? -7 : -4} a3 3 0 0 1 -3 -3 v-6 a3 3 0 0 1 3 -3 Z" fill="#FFFDF5" ${S(1.6)}/><text x="${x + w / 2 + 1.5}" y="${by + 8.8}" text-anchor="middle" font-family="Andika, Verdana, sans-serif" font-size="8" font-weight="700" fill="${INK}">${txt}</text>`;
      return s + bub(20, y + 9, 14, 'Hi', false) + bub(77, y + 13, 12, '?', true);
    },
  };
  const ROOM_FALLBACK = (D, y) => `<path d="${arch(45, y + 7, 20, 24)}" fill="#2A2F4A" ${S(2)}/>`;
  // one floor of the tower (wall, string course, its room); x 17–93
  function floorArt(D, subject, y, i) {
    const c = subjColor(subject);
    let s = `<rect x="17" y="${y}" width="76" height="${FLOOR}" fill="${wallGrad(D)}" ${S(2.5)}/>` + ashlar(17, 93, y, y + FLOOR, 9.5, i);
    s += (ROOM_ART[subject] || ROOM_FALLBACK)(D, y, c);
    s += `<rect x="13" y="${y + FLOOR - 3}" width="84" height="6" rx="2" fill="#C9CFDD" ${S(2.2)}/><path d="M16 ${y + FLOOR - 1.5} H94" stroke="#fff" stroke-width="1.1" opacity=".6"/>`;
    return s;
  }
  // cracks by ❤️ thirds: one in the base below 2/3, more and a chipped merlon below 1/3
  function cracks(n, foot, lvl) {
    if (!lvl) return '';
    const crack = (x, y, s) => `<path d="M${x} ${y} l${4 * s} 6 l${-5 * s} 5 l${5 * s} 7 l${-2 * s} 6 M${x + 4 * s} ${y + 6} l${4 * s} 1" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/><path d="M${x + 1} ${y + 1.5} l${4 * s} 6" stroke="#fff" stroke-width="1" opacity=".55"/>`;
    let s = crack(24, foot - 44, 1) + crack(86, foot - 30, -1);
    if (lvl > 1) {
      s += crack(70, foot - 47, 1) + Array.from({ length: n }, (_, i) => crack(i % 2 ? 26 : 80, TOP + FLOOR * i + 6, i % 2 ? 1 : -1)).join('');
      s += `<path d="M97 ${foot - 18} l-6 -2 l-2 6 l4 4 Z" fill="#2A2F4A" ${S(1.4)}/>`; // a chunk out of the base corner
      s += [[8, foot + 2, 4], [16, foot + 4, 3], [101, foot + 3, 3.4]].map(([x, y, r]) => `<path d="M${x - r} ${y} l${r * 0.6} ${-r} l${r * 1.2} ${r * 0.2} l${r * 0.3} ${r * 0.8} Z" fill="#AEB6C8" ${S(1.2)}/>`).join('');
    }
    return s;
  }
  // floors: subjects bottom → top; dmg 0 | 1 | 2 (see cracks). Returns the back (tower) and front (parapet over the hero's feet) svgs.
  function tower(floors, hp, maxHp) {
    const n = floors.length, H = towerH(n), D = defs(), foot = H - 8, yb = foot - BASE, yt = TOP;
    const dmg = hp > (maxHp * 2) / 3 ? 0 : hp > maxHp / 3 ? 1 : 2;
    let s = `<ellipse cx="${CX}" cy="${foot + 1}" rx="50" ry="7" fill="${INK}" opacity=".3"/>`;
    // turret at the back right with its cone roof and the flag
    s += `<rect x="78" y="${yt - 34}" width="26" height="34" fill="${wallGrad(D)}" ${S(2.4)}/>${ashlar(78, 104, yt - 34, yt, 8.5, 1)}<path d="M89 ${yt - 26} v8" stroke="#2A2F4A" stroke-width="3.4" stroke-linecap="round"/>`;
    s += `<path d="M74 ${yt - 32} L91 ${yt - 58} L108 ${yt - 32} Z" fill="${D.linS([[0, '#F07A62'], [0.5, '#D9453B'], [1, '#A42E2A']], true)}" ${S(2.4)}/><path d="M80 ${yt - 36} L91 ${yt - 52} M86 ${yt - 34} L93 ${yt - 46}" stroke="#FFB4A0" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M91 ${yt - 56} V${yt - 76}" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/><path d="M91 ${yt - 57} V${yt - 75}" stroke="#E9ECF3" stroke-width="1.4" stroke-linecap="round"/><path d="M92 ${yt - 76} q7 -1 13 2 q-5 3 -1 7 q-6 -2 -12 1 Z" fill="${D.lin('#FF8A5C', '#E2502A')}" ${S(1.8)}/><circle cx="91" cy="${yt - 57}" r="2.6" fill="#FFC93C" ${S(1.4)}/>`;
    // the parapet back: the platform the hero stands on
    const merlon = (x, y, h) => `<rect x="${x}" y="${y}" width="13" height="${h}" fill="${wallGrad(D)}" ${S(2.4)}/>`;
    s += [12, 32, 52].map((x) => merlon(x, yt - 26, 12)).join('') + (dmg > 1 ? merlon(72, yt - 20, 6) : merlon(72, yt - 26, 12)) + `<rect x="10" y="${yt - 15}" width="90" height="16" fill="#8E97B0" ${S(2.4)}/><path d="M13 ${yt - 12} H97" stroke="#C9CFDD" stroke-width="1.4"/>`;
    // floors bottom → top
    for (let i = 0; i < n; i++) s += `<g class="tw-fl" data-floor="${i}" data-subject="${floors[i]}">${floorArt(D, floors[i], yb - FLOOR * (i + 1), i)}</g>`;
    // corbel band under the parapet
    s += `<rect x="13" y="${yt}" width="84" height="6" fill="#B6BED0" ${S(2.2)}/>` + [20, 32, 44, 56, 68, 80, 92].map((x) => `<path d="M${x - 3} ${yt + 6} q3 5 6 0" fill="#9AA3BC" ${S(1.6)}/>`).join('');
    // base with the gate
    s += `<rect x="13" y="${yb}" width="84" height="${BASE}" fill="${wallGrad(D)}" ${S(3)}/>${ashlar(13, 97, yb, foot, 10, 0)}`;
    s += `<rect x="9" y="${foot - 8}" width="92" height="9" rx="2" fill="${D.lin('#A9B1C5', '#7C86A2')}" ${S(2.6)}/>`;
    s += `<path d="${arch(38, yb + 12, 34, BASE - 20)}" fill="#C9CFDD" ${S(2.4)}/><path d="${arch(42, yb + 16, 26, BASE - 24)}" fill="${D.lin('#B5793E', '#7A4E2D')}" ${S(2.2)}/>`;
    s += `<path d="M48.5 ${yb + 20} V${foot - 8} M55 ${yb + 16} V${foot - 8} M61.5 ${yb + 20} V${foot - 8}" stroke="#5E3A1E" stroke-width="1.4"/><path d="M42.5 ${yb + 30} H67.5 M42 ${yb + 39} H68" stroke="#3A3F52" stroke-width="2.6"/><circle cx="62" cy="${yb + 34}" r="2" fill="none" stroke="#FFC93C" stroke-width="1.4"/>`;
    s += `<path d="M53 ${yb + 9} h4 l1 4 h-6 Z" fill="#E9ECF3" ${S(1.4)}/>`;
    // wall lamps either side of the gate
    s += [26, 84].map((x) => `<circle cx="${x}" cy="${yb + 22}" r="7" fill="#FFE066" opacity=".22"/><path d="M${x - 3} ${yb + 18} h6 l-1 8 h-4 Z" fill="#FFE27A" ${S(1.4)}/><path d="M${x - 4} ${yb + 18} h8" ${S(1.8)}/>`).join('');
    s += cracks(n, foot, dmg);
    // left rim light down the whole tower
    s += `<path d="M20 ${yt + 8} V${foot - 10}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".35"/>`;
    const front = `<rect x="9" y="${yt - 6}" width="92" height="10" rx="1.5" fill="${wallGrad(D)}" ${S(2.4)}/>` + [9, 88].map((x) => merlon(x, yt - 17, 12)).join('') + `<path d="M13 ${yt - 3} H96" stroke="#fff" stroke-width="1.2" opacity=".55"/>`;
    const vb = `viewBox="0 0 110 ${H}"`;
    return { h: H, feet: yt - 2, back: `<svg class="tw-towerart" ${vb} aria-hidden="true">${D.out()}${s}</svg>`, front: `<svg class="tw-parapet" ${vb} aria-hidden="true">${front}</svg>` };
  }

  /* ---------- small marks on the board ---------- */
  // walking speed: one drawn 👣 per field a turn (the icon sheet app.js puts in the page); faded = rests this turn
  // (boss) or stopped (Druckerei)
  const feet = (n, faded) => `<svg class="tw-feet${faded ? ' rest' : ''}" viewBox="0 0 ${n * 26 + 2} 28" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<use href="#i-1f463" x="${i * 26 - 1}" y="-1" width="30" height="30"/>`).join('')}</svg>`;
  // guard level 1–3 as gold rank chevrons
  function pips(lvl) {
    const w = 6 + lvl * 8;
    return `<svg class="tw-pips" viewBox="0 0 ${w} 12" aria-hidden="true">${Array.from({ length: lvl }, (_, i) => `<path d="M${4 + i * 8} 9.5 l3.5 -3 l3.5 3 v-3.5 l-3.5 -3 l-3.5 3 Z" fill="#FFC93C" ${S(1.2)}/>`).join('')}</svg>`;
  }
  // soap-bubble shield around a monster an elite protects
  function bubble() {
    const D = defs(), g = D.radS('cx=".5" cy=".5" r=".5"', [[0.6, '#BFE3FF', 0.05], [0.88, '#8FD0FF', 0.35], [1, '#E3F4FF', 0.75]]);
    return `<svg class="tw-bubble" viewBox="0 0 60 60" aria-hidden="true">${D.out()}<circle cx="30" cy="30" r="27" fill="${g}" stroke="#DDF1FF" stroke-width="2"/><path d="M12 22 A20 20 0 0 1 24 9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/><circle cx="44" cy="44" r="2" fill="#fff" opacity=".7"/></svg>`;
  }
  // final boss: one ring segment per path in its colour; cols = [colour of each remaining shield, current first], gone = broken count
  function shields(cols, gone) {
    const n = cols.length + gone, seg = 360 / n, R = 29;
    const pt = (a) => `${r1(32 + R * Math.cos((a - 90) * Math.PI / 180))} ${r1(32 + R * Math.sin((a - 90) * Math.PI / 180))}`;
    const arc = (i, c, cur, broken) => { const a0 = i * seg + 6, a1 = (i + 1) * seg - 6, d = `M${pt(a0)} A${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(a1)}`;
      return broken ? `<path d="${d}" fill="none" stroke="#FFF9EE" stroke-width="2" stroke-dasharray="2 5" stroke-linecap="round" opacity=".55"/>`
        : `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${cur ? 9 : 7.5}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${cur ? 5.5 : 4}" stroke-linecap="round"/>${cur ? `<path d="${d}" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>` : ''}`; };
    return `<svg class="tw-shields" viewBox="0 0 64 64" aria-hidden="true">${cols.map((c, i) => arc(i, c, i === 0, false)).join('')}${Array.from({ length: gone }, (_, i) => arc(cols.length + i, '', false, true)).join('')}</svg>`;
  }

  /* ---------- Bauzeit card pictures (viewBox 0 0 80 56) ---------- */
  const mini = (shape, color, x, y, s, o = {}) => MONART.monsterSVG(shape, color, 0, o.mirror ? 'enemy' : '', o).replace('<svg', `<svg x="${x}" y="${y}" width="${s}" height="${s}"`);
  const bolt = (x0, y0, x1, y1, c) => `<path d="M${x0} ${y0} Q${(x0 + x1) / 2} ${Math.min(y0, y1) - 10} ${x1} ${y1}" fill="none" stroke="${c || '#FFE066'}" stroke-width="2.4" stroke-dasharray="1 4.5" stroke-linecap="round"/><circle cx="${x1}" cy="${y1}" r="3.6" fill="${c || '#FFE066'}" ${S(1.4)}/>`;
  const PEDESTAL = (D, x, y) => pedestal(D, x, y, '#FFC93C');
  const ENEMY = ['schotterhaufen', '#9AA0B4'];
  const plus = (x, y, c) => `<path d="M${x - 5} ${y} h10 M${x} ${y - 5} v10" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/><path d="M${x - 5} ${y} h10 M${x} ${y - 5} v10" stroke="${c || '#4FC96A'}" stroke-width="2.8" stroke-linecap="round"/>`;
  const towerMini = (D, x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-14" y="-30" width="28" height="30" fill="${wallGrad(D)}" ${S(2)}/>${[-14, -5, 4].map((mx) => `<rect x="${mx}" y="-36" width="7" height="7" fill="${wallGrad(D)}" ${S(2)}/>`).join('')}<path d="${arch(-6, -14, 12, 14)}" fill="#8E5E36" ${S(1.8)}/></g>`;
  // „for every right answer“: a green tick badge
  const ok = (x, y) => `<circle cx="${x}" cy="${y}" r="7.5" fill="#4FC96A" ${S(1.8)}/><path d="M${x - 3.6} ${y} l2.6 2.8 l4.8 -5.4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  const brick = (x, y) => `<rect x="${x}" y="${y}" width="14" height="7" rx="1.2" fill="#D9653B" ${S(1.6)}/><path d="M${x + 2} ${y + 2} h6" stroke="#FFB08A" stroke-width="1.2" stroke-linecap="round"/>`;
  const PICS = {
    // a guard on its pedestal shooting at a monster
    guard: (D) => PEDESTAL(D, 18, 42) + mini('fox', '#FF6A3D', 2, 6, 34) + bolt(32, 22, 60, 28) + mini(...ENEMY, 50, 16, 30, { mirror: true }),
    // a guard with chevrons and an arrow up
    up: (D) => PEDESTAL(D, 30, 42) + mini('fox', '#FF6A3D', 14, 6, 34) + `<g transform="translate(43 1) scale(1.6)">${pips(2).replace(/<\/?svg[^>]*>/g, '')}</g><path d="M66 52 V30 M58 37 l8 -9 l8 9" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M66 52 V30 M58 37 l8 -9 l8 9" fill="none" stroke="#4FC96A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    // Mathe: one hit, and a second spark jumps to the front monster of another path
    chain: (D) => mini(...ENEMY, 4, 14, 28, { mirror: true }) + mini('regenwicht', '#3FA0FF', 48, 14, 28, { mirror: true }) + `<path d="M24 22 L34 14 L32 24 L44 20" fill="none" stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M24 22 L34 14 L32 24 L44 20" fill="none" stroke="#FFE066" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` + spark(18, 12, 5) + spark(62, 12, 4),
    // Ethik: the hit monster stops for a turn
    stun: (D) => mini(...ENEMY, 8, 12, 38, { mirror: true }) + `<circle cx="60" cy="24" r="13" fill="#FFF9EE" ${S(2.2)}/><rect x="54" y="17" width="4.4" height="14" rx="1.6" fill="${INK}"/><rect x="61.6" y="17" width="4.4" height="14" rx="1.6" fill="${INK}"/>` + spark(10, 14, 4) + spark(44, 8, 3.4),
    // Sachkunde: a right answer repairs the tower
    repair: (D) => ok(10, 12) + towerMini(D, 30, 50, 1.1) + `<path d="M58 10 C58 6 52 4 50 9 C48 4 42 6 42 10 C42 16 50 21 50 21 C50 21 58 16 58 10 Z" fill="#E8344A" ${S(1.8)}/>` + plus(66, 30),
    // Deutsch: one more brick
    brick: (D) => ok(12, 14) + brick(20, 34) + brick(36, 34) + brick(28, 26) + plus(60, 22, '#FFC93C'),
    // Musik: the bell rings and the front monster steps back
    push: (D) => `<path d="M10 30 Q10 12 20 11 Q30 12 30 30 L32 32 L8 32 Z" fill="${D.rad('#F2C23C')}" ${S(1.8)}/><circle cx="20" cy="35" r="2.6" fill="#B8862A" ${S(1.2)}/><path d="M36 16 q4 6 0 12 M41 13 q6 9 0 18" fill="none" stroke="#E0507A" stroke-width="2.2" stroke-linecap="round"/>` + mini(...ENEMY, 46, 12, 30, { mirror: true }) + `<path d="M50 48 H70 M64 43 l6 5 l-6 5" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 48 H70 M64 43 l6 5 l-6 5" fill="none" stroke="#FFF9EE" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    // Englisch: the guards on that path shoot twice
    volley: (D) => PEDESTAL(D, 16, 42) + mini('toad', '#3FA0FF', 0, 8, 32) + bolt(30, 22, 60, 22) + bolt(30, 30, 60, 34) + mini(...ENEMY, 50, 14, 30, { mirror: true }),
    // Mauer flicken: trowel and bricks on the wall
    fix: (D) => towerMini(D, 24, 50, 1.1) + brick(40, 38) + `<path d="M46 28 L66 12" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M46 28 L66 12" stroke="#8E5E36" stroke-width="2.6" stroke-linecap="round"/><path d="M40 30 L50 22 L54 30 L46 36 Z" fill="#C9CED8" ${S(1.8)}/>` + plus(66, 34, '#E8344A'),
  };
  const FX = { Mathe: 'chain', Ethik: 'stun', Sachkunde: 'repair', Deutsch: 'brick', Musik: 'push', Englisch: 'volley' };
  // kind: guard | up | fix | a floor effect (chain, stun, repair, brick, push, volley) | a subject name (its floor's effect)
  function picture(kind) {
    const D = defs(), f = PICS[FX[kind] || kind];
    if (!f) return '';
    const body = f(D);
    return `<svg class="tw-pic" viewBox="0 0 80 56" aria-hidden="true">${D.out()}${body}</svg>`;
  }

  return { ROOMS, laneColors, subjColor, geo, scene, tower, towerH, feet, pips, bubble, shields, picture, PICS: Object.keys(PICS) };
})();
if (typeof module !== 'undefined') module.exports = TWART;
