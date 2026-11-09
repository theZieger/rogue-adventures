/* ===== Monster art v3 (hand-drawn SVG) =====
   Every monster has its own drawing, designed from its name.
   monsterSVG(shape, color, evo, cls, opts)
     evo   hero stage 0–2 (each stage is drawn differently and grows)
     opts  { elite, boss } – elites get a jagged red aura and a heavier line, bosses golden rays.
   Enemies are mirrored in battle (class "enemy"); glyphs such as „?“ are counter-mirrored so they stay readable. */
const MONART = (() => {
  const OUT = '#1C2541';
  let uid = 0;
  function shade(hex, amt) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = (c) => Math.max(0, Math.min(255, Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt)))); return '#' + [f(r), f(g), f(b)].map((c) => c.toString(16).padStart(2, '0')).join(''); }
  let LW = 2.5; // outline width; elites draw a little heavier
  let CLASSIC = false; // round-1 look (flat eyes, no rim light) for the drawings the owner kept from round 1
  const CLASSIC_SHAPES = ['sumpfbrocken', 'moorschlund', 'ranklerin', 'blattlaus'];
  const S = (w) => `stroke="${OUT}" stroke-width="${(w || LW).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round"`;
  const F = (fill, w) => `fill="${fill}" ${S(w)}`;
  const N = (w) => `fill="none" ${S(w)}`;
  const f1 = (v) => Math.round(v * 10) / 10;

  /* ---------- faces ---------- */
  // eye: look 'n' | 'happy' | 'closed' | 'dizzy' | 'glow'; o: side (-1 left, 1 right), dir [dx,dy], iris, slit, pupil, brow, lid, lidRot, lidY, browColor, bw
  function eye(x, y, r, o = {}) {
    const look = o.look || 'n', side = o.side || 0, ry = r * (o.tall || 1.1);
    if (look === 'happy') return `<path d="M${f1(x - r)} ${f1(y + r * 0.25)} Q${x} ${f1(y - r * 1.3)} ${f1(x + r)} ${f1(y + r * 0.25)}" ${N(3)}/>`;
    if (look === 'closed') return `<path d="M${f1(x - r)} ${y} Q${x} ${f1(y + r * 0.9)} ${f1(x + r)} ${y}" ${N(3)}/>`;
    const dx = (o.dir ? o.dir[0] : 0.12) * r, dy = (o.dir ? o.dir[1] : 0.12) * r;
    let s = '';
    if (look === 'glow') {
      s += `<ellipse cx="${x}" cy="${y}" rx="${f1(r * 1.25)}" ry="${f1(ry * 1.25)}" fill="${o.glow || '#FFE45C'}" opacity=".35"/>`;
      s += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(ry)}" ${F(o.glow || '#FFE45C', 2.2)}/>`;
      s += `<ellipse cx="${f1(x + dx)}" cy="${f1(y + dy * 0.5)}" rx="${f1(r * 0.22)}" ry="${f1(ry * 0.68)}" fill="${OUT}"/>`;
      s += `<circle cx="${f1(x - r * 0.35)}" cy="${f1(y - r * 0.4)}" r="${f1(r * 0.2)}" fill="#fff"/>`;
    } else {
      s += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(ry)}" ${F(o.white || '#fff', 2.2)}/>`;
      if (look === 'dizzy') {
        s += `<path d="M${x} ${y} m${f1(r * 0.15)} 0 a${f1(r * 0.15)} ${f1(r * 0.15)} 0 1 0 ${f1(-r * 0.3)} 0 a${f1(r * 0.35)} ${f1(r * 0.35)} 0 1 0 ${f1(r * 0.7)} 0 a${f1(r * 0.6)} ${f1(r * 0.6)} 0 1 0 ${f1(-r * 1.15)} 0" ${N(2)}/>`;
      } else {
        const px = x + dx, py = y + dy;
        if (!CLASSIC) s += `<path d="M${f1(x - r * 0.82)} ${f1(y + ry * 0.38)} Q${x} ${f1(y + ry * 1.08)} ${f1(x + r * 0.82)} ${f1(y + ry * 0.38)} Q${x} ${f1(y + ry * 0.78)} ${f1(x - r * 0.82)} ${f1(y + ry * 0.38)} Z" fill="#D3DAEE"/>`;
        if (o.iris) s += CLASSIC ? `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(r * 0.66)}" fill="${o.iris}"/>` : `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(r * 0.66)}" fill="${o.iris}" stroke="${shade(o.iris, -0.42)}" stroke-width="${f1(r * 0.12)}"/>`;
        if (o.slit) s += `<ellipse cx="${f1(px)}" cy="${f1(py)}" rx="${f1(r * 0.18)}" ry="${f1(r * 0.62)}" fill="${OUT}"/>`;
        else s += `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(r * (o.pupil || (o.iris ? 0.36 : 0.55)))}" fill="${OUT}"/>`;
        s += `<circle cx="${f1(px - r * 0.28)}" cy="${f1(py - r * 0.3)}" r="${f1(r * 0.2)}" fill="#fff"/>${CLASSIC ? '' : `<circle cx="${f1(px + r * 0.24)}" cy="${f1(py + r * 0.26)}" r="${f1(r * 0.09)}" fill="#fff" opacity=".85"/>`}`;
      }
    }
    if (o.lid) { // eyelid: covers the top half, tilted by lidRot (positive = inner corner lower)
      const rot = (o.lidRot || 0) * (side === 1 ? -1 : 1), ly = y + r * (o.lidY || 0);
      s += `<path d="M${f1(x - r * 1.08)} ${f1(ly)} A${f1(r * 1.08)} ${f1(ry * 1.08)} 0 0 1 ${f1(x + r * 1.08)} ${f1(ly)} Z" ${F(o.lid, 2.2)} transform="rotate(${rot} ${x} ${f1(ly)})"/>`;
    }
    if (o.brow) {
      const inn = side === 1 ? -1 : 1, bw = o.bw || 3.2, col = o.browColor || OUT;
      const [yo, yi] = { angry: [1.45, 0.78], worried: [1.05, 1.6], flat: [1.4, 1.4], up: [1.55, 1.25] }[o.brow];
      const xo = x - inn * r * 1.1, xi = x + inn * r * 0.85;
      s += `<path d="M${f1(xo)} ${f1(y - ry * yo)} L${f1(xi)} ${f1(y - ry * yi)}" fill="none" stroke="${col}" stroke-width="${bw}" stroke-linecap="round"/>`;
    }
    return s;
  }
  const pair = (cx, cy, gap, r, o = {}) => eye(cx - gap, cy, r, { ...o, side: -1 }) + eye(cx + gap, cy, r, { ...o, side: 1 });
  const M = {
    smile: (x, y, w) => `<path d="M${x - w} ${y} Q${x} ${f1(y + w * 0.9)} ${x + w} ${y}" ${N(3)}/>`,
    cat: (x, y, w) => `<path d="M${x - w} ${y} Q${f1(x - w / 2)} ${f1(y + w * 0.6)} ${x} ${y} Q${f1(x + w / 2)} ${f1(y + w * 0.6)} ${x + w} ${y}" ${N(2.6)}/>`,
    grin: (x, y, w) => `<path d="M${x - w} ${y} Q${x} ${f1(y + w * 1.3)} ${x + w} ${y} Z" ${F('#E8516F')}/><path d="M${f1(x - w * 0.75)} ${f1(y + 0.8)} L${f1(x + w * 0.75)} ${f1(y + 0.8)} L${f1(x + w * 0.6)} ${f1(y + w * 0.3)} L${f1(x - w * 0.6)} ${f1(y + w * 0.3)} Z" fill="#fff"/><path d="M${x - w} ${y} L${x + w} ${y}" ${N(2.5)}/>`,
    open: (x, y, w) => `<ellipse cx="${x}" cy="${f1(y + w * 0.35)}" rx="${f1(w * 0.6)}" ry="${f1(w * 0.75)}" ${F('#7A2340')}/><ellipse cx="${x}" cy="${f1(y + w * 0.75)}" rx="${f1(w * 0.38)}" ry="${f1(w * 0.25)}" fill="#E8516F"/>`,
    o: (x, y, w) => `<ellipse cx="${x}" cy="${y}" rx="${f1(w * 0.45)}" ry="${f1(w * 0.55)}" ${F('#7A2340', 2.4)}/>`,
    flat: (x, y, w) => `<path d="M${x - w} ${y} L${x + w} ${y}" ${N(3)}/>`,
    frown: (x, y, w) => `<path d="M${x - w} ${f1(y + w * 0.45)} Q${x} ${f1(y - w * 0.35)} ${x + w} ${f1(y + w * 0.45)}" ${N(3)}/>`,
    wavy: (x, y, w) => `<path d="M${x - w} ${y} q${f1(w / 2)} ${f1(-w / 3)} ${w} 0 t${w} 0" ${N(2.8)}/>`,
    smirk: (x, y, w) => `<path d="M${x - w} ${f1(y + w * 0.05)} Q${f1(x + w * 0.1)} ${f1(y + w * 0.65)} ${x + w} ${f1(y - w * 0.45)}" ${N(3)}/>`,
    fangs: (x, y, w) => `<path d="M${x - w} ${y} Q${x} ${f1(y + w * 0.7)} ${x + w} ${y}" ${N(3)}/><path d="M${f1(x - w * 0.62)} ${f1(y + w * 0.18)} L${f1(x - w * 0.45)} ${f1(y + w * 0.75)} L${f1(x - w * 0.28)} ${f1(y + w * 0.3)} Z M${f1(x + w * 0.62)} ${f1(y + w * 0.18)} L${f1(x + w * 0.45)} ${f1(y + w * 0.75)} L${f1(x + w * 0.28)} ${f1(y + w * 0.3)} Z" ${F('#fff', 1.6)}/>`,
    buck: (x, y, w) => `<path d="M${f1(x - w * 0.42)} ${y} L${f1(x - w * 0.42)} ${f1(y + w * 0.62)} L${f1(x + w * 0.42)} ${f1(y + w * 0.62)} L${f1(x + w * 0.42)} ${y} Z" ${F('#fff', 2)}/><path d="M${x} ${y} L${x} ${f1(y + w * 0.62)}" ${N(1.6)}/><path d="M${x - w} ${f1(y - w * 0.15)} Q${f1(x - w * 0.5)} ${f1(y + w * 0.2)} ${x} ${y} Q${f1(x + w * 0.5)} ${f1(y + w * 0.2)} ${x + w} ${f1(y - w * 0.15)}" ${N(2.6)}/>`,
    roar: (x, y, w, h) => `<path d="M${x - w} ${y} Q${x} ${f1(y - h * 0.25)} ${x + w} ${y} Q${f1(x + w * 0.8)} ${y + h} ${x} ${y + h} Q${f1(x - w * 0.8)} ${y + h} ${x - w} ${y} Z" ${F('#6E1F3A')}/><ellipse cx="${x}" cy="${f1(y + h * 0.78)}" rx="${f1(w * 0.5)}" ry="${f1(h * 0.2)}" fill="#E8516F"/>` +
      `<path d="M${f1(x - w * 0.8)} ${f1(y + h * 0.02)} L${f1(x - w * 0.6)} ${f1(y + h * 0.42)} L${f1(x - w * 0.4)} ${f1(y - h * 0.06)} Z M${f1(x + w * 0.8)} ${f1(y + h * 0.02)} L${f1(x + w * 0.6)} ${f1(y + h * 0.42)} L${f1(x + w * 0.4)} ${f1(y - h * 0.06)} Z" ${F('#fff', 1.6)}/>`,
    tongue: (x, y, w) => `<path d="M${x - w} ${y} Q${x} ${f1(y + w * 0.8)} ${x + w} ${y}" ${N(3)}/><path d="M${f1(x - w * 0.1)} ${f1(y + w * 0.35)} Q${f1(x + w * 0.05)} ${f1(y + w * 1.1)} ${f1(x + w * 0.5)} ${f1(y + w * 0.25)}" ${F('#E8516F', 2.2)}/>`,
  };
  const blush = (x, y, gap, r) => `<ellipse cx="${x - gap}" cy="${y}" rx="${r}" ry="${f1(r * 0.6)}" fill="#FF7A9A" opacity=".45"/><ellipse cx="${x + gap}" cy="${y}" rx="${r}" ry="${f1(r * 0.6)}" fill="#FF7A9A" opacity=".45"/>`;
  const shine = (x, y, rx, ry, rot) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".38"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}/>`;
  const spark = (x, y, s, c) => `<path d="M${x} ${f1(y - s)} Q${x} ${y} ${f1(x + s)} ${y} Q${x} ${y} ${x} ${f1(y + s)} Q${x} ${y} ${f1(x - s)} ${y} Q${x} ${y} ${x} ${f1(y - s)} Z" fill="${c || '#FFE066'}"/>`;
  // star-shaped ring of spikes around (cx,cy) from angle a0 to a1 (degrees, 0 = right, 90 = down)
  function spikes(cx, cy, rIn, rOut, a0, a1, n) {
    let d = ''; const step = (a1 - a0) / n;
    for (let i = 0; i < n; i++) {
      const a = (a0 + step * i) * Math.PI / 180, b = (a0 + step * (i + 0.5)) * Math.PI / 180, c = (a0 + step * (i + 1)) * Math.PI / 180;
      d += `M${f1(cx + rIn * Math.cos(a))} ${f1(cy + rIn * Math.sin(a))} L${f1(cx + rOut * Math.cos(b))} ${f1(cy + rOut * Math.sin(b))} L${f1(cx + rIn * Math.cos(c))} ${f1(cy + rIn * Math.sin(c))} Z `;
    }
    return d;
  }
  function burst(cx, cy, rIn, rOut, n) {
    let d = '';
    for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? rIn : rOut; d += `${i ? 'L' : 'M'}${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))} `; }
    return d + 'Z';
  }
  // segments along a quadratic curve (worms, caterpillars)
  function along(p0, p1, p2, n, fn) {
    let s = '';
    for (let i = 0; i < n; i++) { const t = i / (n - 1), u = 1 - t; s += fn(u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1], i, t); }
    return s;
  }
  const qmark = (x, y, k, c) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-5 -5 Q-5 -12 1 -12 Q7 -12 7 -6 Q7 -2 2 0 Q0 1 0 4" fill="none" stroke="${c || '#FFE066'}" stroke-width="3.4" stroke-linecap="round"/><circle cx="0" cy="9.5" r="2.1" fill="${c || '#FFE066'}"/></g>`;

  /* ---------- heroes ---------- */
  function fox(P, o, C) {
    const e = o.evo;
    const base = ['#FF6A3D', '#F24B2A', '#FF8A1F'][e];
    const body = C.grad(base), cream = '#FFF1DC', gold = '#FFC93C', flameG = C.lin('#FFE066', base);
    let s = '';
    if (e === 2) { // sun corona
      s += `<path d="${spikes(60, 64, 38, 50, -60, 300, 12)}" ${F('#FF9A2E', 2)}/><path d="${spikes(60, 64, 38, 56, -75, 285, 12)}" ${F(gold, 2)}/>`;
    }
    // tail(s)
    const tailSmall = `<path d="M76 104 Q104 106 106 82 Q106 66 96 58 Q98 76 88 86 Q80 92 74 96 Z" ${F(body)}/><path d="M96 58 Q107 64 106 80 Q99 72 92 70 Q97 66 96 58 Z" fill="#FFE066" ${S(2)}/>`;
    const tailFlame = `<path d="M74 104 Q112 106 110 74 Q114 58 102 42 Q102 56 96 60 Q100 46 90 34 Q92 58 84 70 Q76 82 72 96 Z" ${F(flameG)}/><path d="M80 98 Q100 96 100 78 Q100 70 96 66 Q94 78 86 84 Z" fill="#FFF3B0" opacity=".85"/>`;
    if (e === 0) s += tailSmall;
    if (e === 1) s += tailFlame;
    if (e === 2) s += [-34, -12, 10].map((r) => `<g transform="rotate(${r} 74 100)">${tailFlame}</g>`).join('');
    // sitting body
    s += `<path d="M38 114 Q32 92 44 82 L76 82 Q88 92 82 114 Z" ${F(body)}/>`;
    s += `<path d="M46 86 Q60 96 74 86 L71 93 L75 98 L67 100 L60 107 L53 100 L45 98 L49 93 Z" fill="${cream}"/>`;
    s += `<ellipse cx="47" cy="112" rx="8" ry="4.5" ${F(cream, 2.2)}/><ellipse cx="73" cy="112" rx="8" ry="4.5" ${F(cream, 2.2)}/><path d="M45 110 L45 114 M49 110 L49 114 M71 110 L71 114 M75 110 L75 114" fill="none" stroke="#D9B48A" stroke-width="1.4" stroke-linecap="round"/>`;
    if (e >= 1) s += `<circle cx="12" cy="62" r="2.2" fill="#FFB23F"/><circle cx="18" cy="48" r="1.5" fill="#FFE066"/><circle cx="108" cy="50" r="1.8" fill="#FFB23F"/>`;
    // ears
    s += `<path d="M30 52 L22 12 L54 38 Z" ${F(body)}/><path d="M33 45 L28 22 L46 37 Z" fill="${e === 2 ? gold : '#7A2A2A'}" opacity=".85"/>`;
    s += `<path d="M90 52 L98 12 L66 38 Z" ${F(body)}/><path d="M87 45 L92 22 L74 37 Z" fill="${e === 2 ? gold : '#7A2A2A'}" opacity=".85"/>`;
    if (e >= 1) { // flame ear tips
      s += `<path d="M22 18 Q14 10 19 1 Q22 8 27 9 Q30 14 24 20 Z" ${F(flameG, 2)}/><path d="M98 18 Q106 10 101 1 Q98 8 93 9 Q90 14 96 20 Z" ${F(flameG, 2)}/>`;
    }
    // cheek tufts
    if (e >= 1) s += `<path d="M30 66 L12 70 L26 76 L14 84 L34 84 Z" ${F(cream, 2.2)}/><path d="M90 66 L108 70 L94 76 L106 84 L86 84 Z" ${F(cream, 2.2)}/>`;
    // head (with a little tuft)
    s += `<path d="M48 38 Q51 22 59 30 Q65 18 72 38 Z" ${F(body)}/>`;
    s += `<path d="M24 62 Q24 33 60 31 Q96 33 96 62 Q98 80 84 90 Q72 98 60 100 Q48 98 36 90 Q22 80 24 62 Z" ${F(body)}/>`;
    s += shine(42, 44, 10, 5, -20);
    s += `<path d="M37 77 Q48 69 60 73 Q72 69 83 77 Q81 92 60 99 Q39 92 37 77 Z" fill="${cream}"/>`;
    // forehead mark grows with each stage
    if (e === 0) s += `<path d="M60 38 Q65 44 62 50 Q60 52 58 50 Q55 44 60 38 Z" fill="#FFE066" ${S(1.8)}/>`;
    if (e === 1) s += `<path d="M60 33 Q69 42 64 52 Q60 56 56 52 Q51 42 60 33 Z" ${F(flameG, 2)}/><path d="M60 42 Q63 47 61 51 Q59 52 58 50 Q57 46 60 42 Z" fill="#FFF3B0"/>`;
    if (e === 2) s += `<path d="${burst(60, 45, 5, 9.5, 8)}" fill="${gold}" ${S(1.6)}/><circle cx="60" cy="45" r="4.5" fill="#FFF3B0" ${S(1.6)}/>`;
    s += `<ellipse cx="60" cy="78" rx="5.5" ry="3.8" fill="${OUT}"/><path d="M52 84 Q56 89 60 84.5 Q64 89 68 84" ${N(2.6)}/>`;
    s += pair(60, 62, 15, e === 2 ? 8 : 7.5, { iris: e === 2 ? '#D9861A' : e === 1 ? '#B5481E' : null, brow: e === 1 ? 'up' : null, bw: 2.6 });
    if (e === 0) s += blush(60, 72, 22, 5);
    return s;
  }

  function toad(P, o, C) {
    const e = o.evo;
    const base = ['#3FA0FF', '#2E86E8', '#1E68C8'][e];
    const body = C.grad(base), lt = shade(base, 0.55), belly = shade(base, 0.72);
    let s = '';
    if (e === 1) s += `<ellipse cx="60" cy="110" rx="56" ry="9" fill="none" stroke="${lt}" stroke-width="3" stroke-dasharray="14 8" opacity=".9"/><path d="M8 104 q8 -10 18 -2 M112 104 q-8 -10 -18 -2" fill="none" stroke="${lt}" stroke-width="3" stroke-linecap="round"/>`;
    if (e === 2) { // big wave behind
      s += `<ellipse cx="60" cy="111" rx="56" ry="8" ${F(C.lin('#BFE6FF', '#5BB4FF'), 2.2)}/><path d="M10 108 Q4 98 12 92 Q14 100 20 104 M110 108 Q116 98 108 92 Q106 100 100 104" ${F('#BFE6FF', 2)}/>`;
      // coral frills
      s += `<path d="M26 60 L10 40 M16 48 L6 50 M20 54 L12 62 M94 60 L110 40 M104 48 L114 50 M100 54 L108 62" fill="none" stroke="${OUT}" stroke-width="8" stroke-linecap="round"/><path d="M26 60 L10 40 M16 48 L6 50 M20 54 L12 62 M94 60 L110 40 M104 48 L114 50 M100 54 L108 62" fill="none" stroke="#FF8A7A" stroke-width="4" stroke-linecap="round"/>`;
    }
    s += `<path d="M18 106 Q4 94 14 78 Q22 70 32 84 Z" ${F(body)}/><path d="M102 106 Q116 94 106 78 Q98 70 88 84 Z" ${F(body)}/>`;
    s += `<circle cx="38" cy="56" r="16" ${F(body)}/><circle cx="82" cy="56" r="16" ${F(body)}/>`;
    s += `<ellipse cx="60" cy="84" rx="42" ry="27" ${F(body)}/>`;
    s += shine(36, 68, 9, 4.5, -15);
    s += [[24, 86, 4], [96, 84, 5], [86, 68, 3], [32, 72, 3], [102, 96, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade(base, -0.3)}" opacity=".5"/>`).join('');
    s += `<ellipse cx="60" cy="96" rx="27" ry="12" fill="${belly}"/>`;
    if (e === 2) s += `<path d="M42 92 q4.5 5 9 0 q4.5 5 9 0 q4.5 5 9 0 q4.5 5 9 0 M47 100 q4.5 5 9 0 q4.5 5 9 0 q4.5 5 9 0" fill="none" stroke="${shade(base, 0.35)}" stroke-width="2" stroke-linecap="round"/>`;
    else s += `<path d="M36 94 q6 -5 12 0 t12 0 t12 0 t12 0" fill="none" stroke="${shade(base, 0.3)}" stroke-width="2.5" stroke-linecap="round"/>`;
    // crest on the head: wave → double wave → water spout with pearl
    if (e === 0) s += `<path d="M50 46 Q50 34 62 33 Q72 34 71 42 Q66 37 61 40 Q58 44 50 46 Z" ${F(lt, 2)}/>`;
    if (e === 1) s += `<path d="M46 46 Q44 30 58 28 Q70 28 70 38 Q64 33 59 36 Q56 42 46 46 Z M60 46 Q62 34 72 34 Q80 36 78 44 Q74 40 70 42 Q68 46 60 46 Z" ${F(lt, 2)}/>` +
      `<path d="M30 86 m2 0 a2 2 0 1 0 -4 0 a5 5 0 1 0 10 0 a8 8 0 1 0 -15 0 M90 86 m-2 0 a2 2 0 1 1 4 0 a5 5 0 1 1 -10 0 a8 8 0 1 1 15 0" fill="none" stroke="${lt}" stroke-width="2.4" stroke-linecap="round"/>`;
    if (e === 2) s += `<path d="M54 44 Q52 26 44 14 Q53 18 60 6 Q67 18 76 14 Q68 26 66 44 Z" ${F(C.lin('#E6F6FF', '#5BB4FF'), 2)}/>` +
      `<circle cx="38" cy="10" r="3.5" ${F('#BFE6FF', 1.8)}/><circle cx="84" cy="8" r="3" ${F('#BFE6FF', 1.8)}/><circle cx="30" cy="24" r="2.5" ${F('#BFE6FF', 1.6)}/><circle cx="91" cy="22" r="2.5" ${F('#BFE6FF', 1.6)}/>` +
      `<circle cx="60" cy="49" r="5" ${F('#FFF6FA', 2)}/><circle cx="58.5" cy="47.5" r="1.6" fill="#fff"/>`;
    s += pair(60, 54, 22, 9, { iris: e === 2 ? '#F2B233' : null, brow: e >= 1 ? 'up' : null, bw: 2.6 });
    s += `<path d="M30 76 Q60 96 90 76" ${N(3)}/><path d="M50 84 Q60 92 70 84 Q64 90 60 90 Q56 90 50 84 Z" fill="#E8516F"/>`;
    s += [31, 40, 49, 71, 80, 89].map((x) => `<circle cx="${x}" cy="111" r="4.4" ${F(body, 2.2)}/>`).join('') + `<ellipse cx="40" cy="107" rx="10" ry="5" fill="${body}"/><ellipse cx="80" cy="107" rx="10" ry="5" fill="${body}"/>`;
    if (e === 0) s += blush(60, 74, 30, 5);
    return s;
  }

  function bear(P, o, C) {
    const e = o.evo;
    const fur = ['#9A6A40', '#865A35', '#6B4528'][e];
    const body = C.grad(fur), muz = '#E9C99C', moss = C.grad('#5CC96A'), mossL = e === 2 ? C.grad('#86DE6E') : moss, mossD = '#2F8F45', leaf = '#4FC96A';
    let s = '';
    if (e === 2) { // mossy mane + branch antlers
      s += `<path d="M26 26 L18 6 M22 16 L10 12 M94 26 L102 6 M98 16 L110 12" fill="none" stroke="${OUT}" stroke-width="8" stroke-linecap="round"/><path d="M26 26 L18 6 M22 16 L10 12 M94 26 L102 6 M98 16 L110 12" fill="none" stroke="#8A5A2B" stroke-width="4" stroke-linecap="round"/>`;
      s += `<ellipse cx="18" cy="5" rx="7" ry="4" ${F(leaf, 2)} transform="rotate(-50 18 5)"/><ellipse cx="9" cy="12" rx="6" ry="3.5" ${F(leaf, 2)}/><ellipse cx="102" cy="5" rx="7" ry="4" ${F(leaf, 2)} transform="rotate(50 102 5)"/><ellipse cx="111" cy="12" rx="6" ry="3.5" ${F(leaf, 2)}/>`;
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; s += `<circle cx="${f1(60 + 36 * Math.cos(a))}" cy="${f1(60 + 33 * Math.sin(a))}" r="10" ${F(i % 2 ? moss : mossL, 2.2)}/>`; }
    }
    s += `<path d="M28 114 Q22 84 40 74 L80 74 Q98 84 92 114 Z" ${F(body)}/>`;
    s += `<ellipse cx="60" cy="98" rx="19" ry="13" fill="${muz}"/><path d="M52 90 l2.7 4 l2.7 -4 l2.7 4 l2.7 -4 l2.7 4" fill="none" stroke="#C9A578" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (e >= 1) s += `<path d="M24 86 Q30 74 42 78 Q38 86 30 90 Z M96 86 Q90 74 78 78 Q82 86 90 90 Z" ${F(moss, 2)}/>`;
    if (e === 2) s += `<path d="M40 82 Q60 92 80 82" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="M40 82 Q60 92 80 82" fill="none" stroke="${mossD}" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="87" r="3.5" ${F('#FF8FB1', 1.6)}/><circle cx="70" cy="87" r="3.5" ${F('#FFE066', 1.6)}/>`;
    s += `<ellipse cx="44" cy="112" rx="11" ry="5" ${F(body)}/><ellipse cx="76" cy="112" rx="11" ry="5" ${F(body)}/>`;
    s += [38, 44, 50, 70, 76, 82].map((x, i) => `<circle cx="${x}" cy="${i % 3 === 1 ? 109.5 : 110.5}" r="1.8" fill="#5A3A22"/>`).join('');
    s += `<circle cx="30" cy="36" r="12" ${F(body)}/><circle cx="90" cy="36" r="12" ${F(body)}/><circle cx="30" cy="36" r="6" fill="${muz}"/><circle cx="90" cy="36" r="6" fill="${muz}"/>`;
    s += `<ellipse cx="60" cy="58" rx="34" ry="30" ${F(body)}/>`;
    s += shine(44, 42, 9, 4.5, -20);
    // moss on the head grows; stage 2 gets a sapling, stage 3 flowers
    s += `<path d="M40 36 Q42 26 52 29 Q58 21 67 27 Q76 23 80 32 Q82 39 74 38 Q67 42 59 38 Q50 42 44 40 Q38 41 40 36 Z" ${F(moss, 2)}/><circle cx="52" cy="33" r="1.6" fill="${mossD}"/><circle cx="66" cy="31" r="1.6" fill="${mossD}"/>`;
    s += `<path d="M82 30 Q88 22 96 28 Q96 34 88 34 Z" ${F(moss, 2)}/>`;
    if (e === 1) s += `<path d="M60 28 Q58 18 62 8" ${N(3)}/><path d="M61 16 Q50 8 46 14 Q52 20 61 16 Z M62 10 Q70 0 76 6 Q70 12 62 10 Z" ${F(leaf, 2)}/>`;
    if (e === 2) s += `<circle cx="44" cy="31" r="4" ${F('#FF8FB1', 1.8)}/><circle cx="44" cy="31" r="1.5" fill="#FFE066"/><circle cx="74" cy="27" r="4" ${F('#FFFFFF', 1.8)}/><circle cx="74" cy="27" r="1.5" fill="#FFE066"/>`;
    s += `<ellipse cx="60" cy="71" rx="15" ry="11" fill="${muz}"/>`;
    s += `<path d="M53.5 65 Q60 61 66.5 65 Q63 71 60 71 Q57 71 53.5 65 Z" fill="${OUT}"/><path d="M53 75 Q56.5 79 60 75 Q63.5 79 67 75" ${N(2.6)}/>`;
    s += pair(60, 54, 14, 6.5, { iris: e === 2 ? '#6BB84A' : null, brow: e === 2 ? 'up' : null, bw: 2.4 });
    if (e === 0) s += blush(60, 66, 22, 4.5);
    return s;
  }

  function luther(P, o, C) {
    let s = '';
    const gown = C.grad('#3A3A46'), skin = C.grad('#F6CDA6');
    s += `<path d="M18 116 Q20 80 60 78 Q100 80 102 116 Z" ${F(gown)}/>`;
    s += `<path d="M48 80 L60 98 L72 80 Z" ${F('#F5F0E6', 2)}/>`;
    // open book in his hands
    s += `<path d="M26 98 L58 102 L58 116 L26 112 Z" ${F('#FFF8E6', 2.2)}/><path d="M94 98 L62 102 L62 116 L94 112 Z" ${F('#FFF8E6', 2.2)}/><path d="M58 102 Q60 100 62 102 L62 116 Q60 114 58 116 Z" ${F('#8B2E2E', 2)}/>`;
    s += `<path d="M32 104 L52 106 M32 108 L52 110 M68 106 L88 104 M68 110 L88 108" fill="none" stroke="#9AA3C2" stroke-width="1.6" stroke-linecap="round"/>`;
    s += `<ellipse cx="30" cy="104" rx="6" ry="5" ${F(skin, 2)}/><ellipse cx="90" cy="104" rx="6" ry="5" ${F(skin, 2)}/>`;
    // head + doctor's cap
    s += `<ellipse cx="60" cy="54" rx="26" ry="27" ${F(skin)}/>`;
    s += `<path d="M35 40 Q27 50 33 62 L38 50 Z M85 40 Q93 50 87 62 L82 50 Z" ${F('#4A3526', 2)}/>`;
    s += `<ellipse cx="34" cy="58" rx="4.5" ry="7" ${F(skin, 2)}/><ellipse cx="86" cy="58" rx="4.5" ry="7" ${F(skin, 2)}/>`;
    s += `<path d="M30 44 Q28 30 40 26 L80 26 Q92 30 90 44 Q60 38 30 44 Z" ${F('#24242E')}/>`;
    s += `<path d="M20 36 Q60 8 100 36 Q102 42 92 42 Q60 30 28 42 Q18 42 20 36 Z" ${F('#2E2E3A')}/>`;
    s += `<path d="M36 28 Q60 18 84 28" fill="none" stroke="#4A4A5A" stroke-width="2.5" stroke-linecap="round"/><path d="M30 33 Q44 24 56 23" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".25"/>`;
    s += shine(46, 50, 6, 3.5, -20);
    s += pair(60, 55, 11, 5.5, { brow: 'up', bw: 2.4 });
    s += `<path d="M60 60 Q58 67 61 68" ${N(2.2)}/>${M.smile(60, 73, 7)}`;
    s += blush(60, 66, 17, 4);
    // quill behind the book
    s += `<path d="M98 112 L112 74" fill="none" stroke="${OUT}" stroke-width="2.4" stroke-linecap="round"/><path d="M112 74 Q122 80 112 96 Q108 88 104 92 Q104 80 112 74 Z" ${F('#FFFDF5', 2)}/>`;
    return s;
  }

  function potato(P, o, C) {
    const e = o.evo;
    const skin = C.grad('#D9B35E'), dot = '#8A6A3F', leaf = '#4FB04F';
    let s = '';
    // sprouts: little shoots → a plant with a potato flower
    if (e === 0) s += `<path d="M46 32 Q42 16 50 8 M72 30 Q74 16 84 12" fill="none" stroke="#3E8E41" stroke-width="4" stroke-linecap="round"/><ellipse cx="49" cy="9" rx="8" ry="4.5" ${F(leaf, 2)} transform="rotate(-30 49 9)"/><ellipse cx="84" cy="12" rx="8" ry="4.5" ${F(leaf, 2)} transform="rotate(30 84 12)"/>`;
    else s += `<path d="M60 30 Q58 16 62 6 M60 22 Q48 18 42 10 M61 18 Q72 14 78 8" fill="none" stroke="#3E8E41" stroke-width="4" stroke-linecap="round"/><path d="M42 10 Q34 6 34 14 Q40 16 42 10 Z M78 8 Q86 2 88 10 Q82 14 78 8 Z" ${F(leaf, 2)}/>` +
      `<g transform="translate(62 6)">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-5" rx="3.6" ry="5" ${F('#E9DBFF', 1.6)} transform="rotate(${r})"/>`).join('')}<circle r="2.6" ${F('#FFD23F', 1.4)}/></g>`;
    s += `<path d="M14 72 Q2 76 6 88" fill="none" stroke="${OUT}" stroke-width="10" stroke-linecap="round"/><path d="M14 72 Q2 76 6 88" fill="none" stroke="#D9B35E" stroke-width="6" stroke-linecap="round"/>`;
    s += `<path d="M106 72 Q118 76 114 88" fill="none" stroke="${OUT}" stroke-width="10" stroke-linecap="round"/><path d="M106 72 Q118 76 114 88" fill="none" stroke="#D9B35E" stroke-width="6" stroke-linecap="round"/>`;
    s += `<path d="M44 100 L42 112 M76 100 L78 112" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>`;
    s += `<ellipse cx="40" cy="113" rx="8" ry="4" ${F(e ? '#6B4A2B' : '#8A6A3F', 2)}/><ellipse cx="80" cy="113" rx="8" ry="4" ${F(e ? '#6B4A2B' : '#8A6A3F', 2)}/>`;
    s += `<path d="M18 66 Q14 34 56 30 Q100 26 102 64 Q106 102 60 104 Q16 104 18 66 Z" ${F(skin)}/>`;
    s += shine(38, 46, 11, 5.5, -20);
    s += `<path d="M28 82 q3 -2 5 0 M90 46 q2 -3 5 -1 M86 90 q3 -2 5 0 M38 40 q2 -2 4 0" fill="none" stroke="${dot}" stroke-width="2.4" stroke-linecap="round"/>`;
    s += [[30, 60], [92, 72], [72, 98], [46, 96], [80, 38], [24, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#B08D4A"/>`).join('');
    if (e >= 1) { // workshop apron with pocket and pencil
      s += `<path d="M30 84 Q60 88 90 84 L86 102 Q60 108 34 102 Z" ${F('#5B7FC7', 2.2)}/><path d="M30 84 Q24 70 30 66 M90 84 Q96 70 90 66" fill="none" stroke="#5B7FC7" stroke-width="3" stroke-linecap="round"/>`;
      s += `<rect x="66" y="89" width="14" height="10" rx="2.5" ${F('#4A6AAF', 2)}/><path d="M70 89 L72 81" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M70 89 L72 81" fill="none" stroke="#FFC93C" stroke-width="2.6" stroke-linecap="round"/>`;
      s += `<path d="M42 92 L56 92" ${N(2)}/>`;
    }
    s += pair(60, 60, 14, 8, { brow: e ? 'up' : null, bw: 2.6 });
    if (e >= 1) { // goggles pushed up on the forehead
      s += `<path d="M22 46 Q60 36 98 46" fill="none" stroke="${OUT}" stroke-width="5"/><path d="M22 46 Q60 36 98 46" fill="none" stroke="#7A5230" stroke-width="2.4"/>`;
      s += `<circle cx="47" cy="40" r="8" ${F('#9FE0FF', 2.4)}/><circle cx="73" cy="40" r="8" ${F('#9FE0FF', 2.4)}/><path d="M43 37 L46 34 M69 37 L72 34" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M55 40 L65 40" ${N(2.4)}/>`;
    }
    s += e ? M.grin(60, 76, 11) : M.smile(60, 76, 10);
    s += blush(60, 72, 24, 5);
    return s;
  }

  /* ---------- Zahlenquest, Welt 1 ---------- */
  function sumpfbrocken(P, o, C) {
    const mud = C.grad('#7B8A45'), moss = '#4E9A3A';
    return `<ellipse cx="60" cy="108" rx="54" ry="8" fill="#5B4A2E" opacity=".9"/>
      <path d="M90 46 Q92 24 96 6" ${N(2.6)}/><ellipse cx="96" cy="14" rx="4.5" ry="10" ${F('#7A4E2A', 2.2)} transform="rotate(8 96 14)"/>
      <path d="M86 50 Q80 32 74 22" ${N(2.6)}/><path d="M74 22 Q66 16 70 28 Z" ${F('#6BBF4E', 2)}/>
      <path d="M12 106 Q6 76 22 62 Q24 42 44 38 Q58 26 76 36 Q98 36 102 60 Q116 74 108 106 Z" ${F(mud)}/>
      <path d="M24 60 Q30 44 46 44 Q58 34 74 42 Q92 42 96 58 Q88 54 84 62 Q78 54 70 60 Q62 50 54 60 Q46 52 40 62 Q34 54 24 60 Z" ${F(moss, 2)}/>
      <path d="M40 62 Q40 68 38 70 M70 60 Q71 66 69 69" fill="none" stroke="${moss}" stroke-width="4" stroke-linecap="round"/>
      ${shine(32, 70, 7, 4, -25)}
      <circle cx="24" cy="92" r="3.5" fill="#55602D"/><circle cx="92" cy="88" r="4.5" fill="#55602D"/><circle cx="82" cy="98" r="2.5" fill="#55602D"/>
      <circle cx="10" cy="56" r="4" ${F('none', 2)}/><circle cx="16" cy="46" r="2.5" ${F('none', 1.8)}/><circle cx="110" cy="48" r="3" ${F('none', 1.8)}/>
      ${pair(60, 76, 15, 8, { lid: '#6A7A3A', lidRot: 12, lidY: -0.15 })}
      <path d="M46 94 Q53 89 60 94 Q67 99 74 94" ${N(3)}/><path d="M64 96 L66 101 L69 96.5 Z" ${F('#fff', 1.6)}/>`;
  }
  function regenwicht(P, o, C) {
    const water = C.grad('#4DA8FF');
    let rain = '';
    [[22, 64], [14, 82], [100, 66], [106, 84], [30, 44], [92, 46]].forEach(([x, y]) => { rain += `<path d="M${x} ${y} l-3 8" stroke="#8FD0FF" stroke-width="3" stroke-linecap="round"/>`; });
    return `${rain}<ellipse cx="60" cy="115" rx="22" ry="3" fill="#8FD0FF" opacity=".45"/>
      <path d="M38 78 L18 66 L36 88 Z M82 78 L102 66 L84 88 Z" ${F(water)}/>
      <path d="M60 30 Q88 62 88 82 A28 28 0 0 1 32 82 Q32 62 60 30 Z" ${F(water)}/>
      <path d="M44 66 Q38 76 40 86" fill="none" stroke="#fff" stroke-width="4.5" opacity=".6" stroke-linecap="round"/><circle cx="76" cy="98" r="2.5" fill="#fff" opacity=".45"/>
      <path d="M34 34 Q30 22 42 20 Q46 8 60 10 Q72 6 78 18 Q92 18 88 32 Q84 38 74 36 L46 36 Q36 40 34 34 Z" ${F(C.lin('#FFFFFF', '#C9D6EA'), 2.4)}/><path d="M44 32 Q52 36 60 32 Q68 36 78 32" fill="none" stroke="#AFC0DA" stroke-width="2" stroke-linecap="round"/>
      ${pair(60, 78, 12, 7, { dir: [0.3, 0.05], brow: 'up', bw: 2.6 })}
      ${M.smirk(60, 94, 8)}
      <path d="M44 112 L42 116 M76 112 L78 116" ${N(3)}/>`;
  }
  function streichholzkopf(P, o, C) {
    const wood = C.lin('#F4D7A1', '#D7A866'), head = C.grad('#E0413A'), fl = C.lin('#FFE066', '#FF6A3D');
    return `<path d="M50 4 Q30 22 40 38 Q46 46 60 46 Q74 46 80 38 Q90 22 70 4 Q72 16 66 20 Q64 10 58 2 Q58 16 52 18 Q50 12 50 4 Z" ${F(fl, 2.4)}/>
      <path d="M60 20 Q70 30 66 40 Q60 44 54 40 Q50 30 60 20 Z" fill="#FFF3B0"/>${spark(28, 22, 3.5, '#FFB23F')}${spark(94, 14, 2.8, '#FFE066')}${spark(98, 36, 2, '#FFB23F')}
      <rect x="50" y="62" width="20" height="44" rx="5" ${F(wood)}/>
      <path d="M56 70 L56 98 M64 74 L64 102" fill="none" stroke="#C08B4A" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="60" cy="69" rx="10" ry="3.5" fill="#5A3A22" opacity=".55"/><ellipse cx="58" cy="88" rx="1.6" ry="2.6" fill="#C08B4A"/>
      <path d="M50 74 L32 64 M70 74 L88 66" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M50 74 L32 64 M70 74 L88 66" fill="none" stroke="#E8C38A" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="30" cy="63" r="4.5" ${F('#E8C38A', 2.2)}/><circle cx="90" cy="65" r="4.5" ${F('#E8C38A', 2.2)}/>
      <path d="M54 104 L50 114 M66 104 L70 114" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="47" cy="114" rx="6" ry="3" fill="${OUT}"/><ellipse cx="73" cy="114" rx="6" ry="3" fill="${OUT}"/>
      <ellipse cx="60" cy="50" rx="25" ry="20" ${F(head)}/>
      ${shine(48, 40, 7, 3.5, -20)}
      ${pair(60, 49, 10, 6.5, { brow: 'angry', bw: 3 })}
      ${M.grin(60, 59, 8)}`;
  }
  function krabbelstein(P, o, C) {
    const rock = C.grad('#9AA1AE');
    return `<path d="M30 92 L12 84 L4 98 M30 100 L14 102 L10 114 M90 92 L108 84 L116 98 M90 100 L106 102 L110 114" fill="none" stroke="${OUT}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M32 74 Q16 66 16 50" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M88 74 Q104 66 104 50" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>
      <path d="M16 52 Q4 46 8 32 Q14 38 18 36 Q14 28 22 24 Q28 36 16 52 Z" ${F('#B7BDC8', 2.2)}/><path d="M104 52 Q116 46 112 32 Q106 38 102 36 Q106 28 98 24 Q92 36 104 52 Z" ${F('#B7BDC8', 2.2)}/>
      <path d="M52 50 L46 30 M68 50 L74 30" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M20 100 L24 70 L40 52 L64 46 L88 56 L100 78 L98 102 Z" ${F(rock)}/>
      <path d="M24 70 L40 52 L46 70 Z" fill="#fff" opacity=".28"/><path d="M70 82 L98 102 L64 102 Z" fill="${OUT}" opacity=".18"/>
      <path d="M36 88 L44 82 L42 92 M80 64 L86 70" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="34" cy="66" rx="5" ry="3" fill="#6FAE5A" opacity=".9"/><ellipse cx="86" cy="92" rx="4" ry="2.4" fill="#6FAE5A" opacity=".8"/>
      <circle cx="52" cy="62" r="1.4" fill="#737A88"/><circle cx="72" cy="56" r="1.2" fill="#737A88"/><circle cx="58" cy="94" r="1.4" fill="#737A88"/><circle cx="30" cy="84" r="1.2" fill="#737A88"/><circle cx="90" cy="72" r="1.4" fill="#737A88"/>
      ${eye(46, 28, 7, { dir: [0.2, 0.2] })}${eye(74, 28, 7, { dir: [0.2, 0.2] })}
      ${M.cat(60, 80, 7)}`;
  }
  function dornenigel(P, o, C) {
    const sp = C.lin('#3C6E2E', '#24451C'), face = C.grad('#E9C89A'), thorn = '#6B3B1F';
    let s = `<path d="${spikes(60, 74, 30, 56, 160, 380, 11)}" ${F(sp)}/>`;
    s += `<path d="${spikes(60, 74, 26, 44, 172, 368, 9)}" fill="#5FA247" opacity=".9"/>`;
    s += `<path d="M14 64 Q40 40 64 50 Q88 40 106 62" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="M14 64 Q40 40 64 50 Q88 40 106 62" fill="none" stroke="${thorn}" stroke-width="3" stroke-linecap="round"/>`;
    s += `<path d="M26 52 l-2 -6 l5 3 Z M44 45 l1 -6 l3 5 Z M78 46 l0 -6 l4 4 Z M96 52 l3 -5 l1 6 Z" ${F('#F2E3C6', 1.4)}/>`;
    s += `<ellipse cx="54" cy="46" rx="6" ry="3" ${F('#6BBF4E', 1.6)} transform="rotate(-25 54 46)"/><ellipse cx="74" cy="44" rx="6" ry="3" ${F('#6BBF4E', 1.6)} transform="rotate(25 74 44)"/>`;
    s += `<circle cx="34" cy="50" r="4" ${F('#E0304A', 1.8)}/><circle cx="33" cy="48.6" r="1.1" fill="#fff" opacity=".8"/><circle cx="88" cy="48" r="4" ${F('#E0304A', 1.8)}/><circle cx="92" cy="54" r="3.2" ${F('#E0304A', 1.6)}/>`;
    s += `<path d="M18 92 Q14 70 36 66 L84 66 Q106 70 102 92 Q100 110 60 110 Q20 110 18 92 Z" ${F(face)}/>`;
    s += `<path d="M28 108 L22 116 M36 110 L34 116 M84 110 L86 116 M92 108 L98 116" ${N(3)}/>`;
    s += `<path d="M40 90 L56 84 M48 82 L52 92" fill="none" stroke="#C0472E" stroke-width="2.4" stroke-linecap="round"/>`;
    s += pair(60, 82, 15, 7, { brow: 'angry', bw: 3.6, slit: true, iris: '#E0B83A' });
    s += `<ellipse cx="60" cy="94" rx="6" ry="4" fill="${OUT}"/>${M.fangs(60, 100, 10)}`;
    return s;
  }
  function moorschlund(P, o, C) {
    const bog = C.grad('#3F8F7E'), dk = '#2A5E52';
    return `<ellipse cx="60" cy="110" rx="58" ry="9" fill="#4A3B22"/>
      <path d="M6 108 Q0 60 30 46 Q60 34 90 46 Q120 60 114 108 Z" ${F(bog)}/>
      <path d="M8 98 L4 110 M112 98 L116 110" ${N(3)}/>
      <circle cx="34" cy="34" r="16" ${F(bog)}/><circle cx="86" cy="34" r="16" ${F(bog)}/>
      ${pair(60, 32, 26, 9.5, { brow: 'angry', bw: 3.8, iris: '#E4C93A', slit: true })}
      <path d="M44 46 Q46 40 54 40 Q60 34 66 40 Q74 40 76 46 Q66 44 60 48 Q54 44 44 46 Z" ${F('#5DBF6A', 2)}/><circle cx="60" cy="40" r="3.5" ${F('#FF8FB1', 1.6)}/>
      ${shine(22, 62, 7, 4, -30)}
      <path d="M18 66 Q60 52 102 66 Q100 100 60 104 Q20 100 18 66 Z" ${F('#5A1B34')}/>
      <path d="M28 66 L34 78 L40 63 L46 76 L52 61 L58 74 L64 61 L70 74 L76 62 L82 76 L88 64 L94 76 L96 66" ${F('#FFF8E6', 2)}/>
      <path d="M34 98 L40 88 L46 99 M74 99 L80 88 L86 98" ${F('#FFF8E6', 2)}/>
      <path d="M40 94 Q60 82 80 94 Q72 100 60 100 Q48 100 40 94 Z" fill="#E8516F"/>
      <path d="M22 84 Q20 92 24 98 M100 82 Q102 92 98 98" fill="none" stroke="${dk}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="8" cy="44" r="4" ${F('none', 2)}/><circle cx="112" cy="40" r="3" ${F('none', 2)}/><circle cx="104" cy="28" r="2" ${F('none', 1.6)}/>`;
  }

  /* ---------- Zahlenquest, Welt 2 ---------- */
  function lavamolch(P, o, C) {
    const skin = C.grad('#B8382A'), glow = '#FFB23F';
    return `<path d="M82 92 Q110 96 112 72 Q112 58 102 54 Q104 70 94 76 Q86 80 80 80 Z" ${F(skin)}/>
      <path d="M30 96 L14 106 L18 112 M90 96 L106 106 L102 112 M40 102 L32 116 M80 102 L88 116" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 96 L14 106 L18 112 M90 96 L106 106 L102 112 M40 102 L32 116 M80 102 L88 116" fill="none" stroke="#B8382A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="60" cy="88" rx="38" ry="20" ${F(skin)}/>
      <path d="M30 70 L36 58 L42 68 L50 54 L56 66 L64 52 L70 66 L78 56 L82 70" ${F(glow, 2)}/>
      <ellipse cx="60" cy="64" rx="30" ry="24" ${F(skin)}/>
      <circle cx="40" cy="44" r="11" ${F(skin)}/><circle cx="80" cy="44" r="11" ${F(skin)}/>
      ${shine(44, 58, 7, 3.5, -20)}
      <circle cx="30" cy="92" r="7" fill="${glow}" opacity=".3"/><circle cx="84" cy="98" r="8" fill="${glow}" opacity=".3"/>
      <circle cx="30" cy="92" r="4" ${F(glow, 1.6)}/><circle cx="46" cy="100" r="3" ${F(glow, 1.6)}/><circle cx="84" cy="98" r="4.5" ${F(glow, 1.6)}/><circle cx="100" cy="70" r="3" ${F(glow, 1.4)}/>
      <path d="M70 86 L76 92 L74 98 M48 86 L44 92" fill="none" stroke="${glow}" stroke-width="2.4" stroke-linecap="round"/>
      ${pair(60, 44, 20, 7.5, { iris: '#FF9A2E', brow: 'angry', bw: 3 })}
      <path d="M38 70 Q60 82 82 70" ${N(3)}/><path d="M50 74 L52 79 L55 75.5 Z M70 74 L68 79 L65 75.5 Z" ${F('#fff', 1.4)}/>`;
  }
  function nebelqualle(P, o, C) {
    const bell = C.grad('#9DB6FF'), mist = '#E6ECFF';
    return `<path d="M4 50 Q14 40 24 48 Q32 40 40 46 M84 30 Q94 22 104 30 Q110 26 116 30 M2 92 Q12 84 22 90 M96 98 Q106 90 116 96" fill="none" stroke="${mist}" stroke-width="4" stroke-linecap="round" opacity=".55"/>
      <path d="M30 60 q6 18 -2 30 q-6 10 2 22 M46 64 q-6 20 2 34 M60 64 q6 22 -2 46 M74 64 q-6 20 2 34 M90 60 q-6 18 2 30 q6 10 -2 22" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round" opacity=".9"/>
      <path d="M30 60 q6 18 -2 30 q-6 10 2 22 M46 64 q-6 20 2 34 M60 64 q6 22 -2 46 M74 64 q-6 20 2 34 M90 60 q-6 18 2 30 q6 10 -2 22" fill="none" stroke="#C9B8FF" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M50 66 Q44 84 52 96 Q46 86 56 80 Z M70 66 Q76 84 68 96 Q74 86 64 80 Z" fill="#E7DDFF" ${S(1.8)}/>
      <path d="M16 62 A44 44 0 0 1 104 62 Q104 70 94 68 Q86 74 78 68 Q70 74 60 68 Q50 74 42 68 Q34 74 26 68 Q16 70 16 62 Z" ${F(bell)} opacity=".94"/>
      <circle cx="36" cy="44" r="4" fill="#fff" opacity=".5"/><circle cx="84" cy="40" r="3" fill="#fff" opacity=".5"/><circle cx="74" cy="28" r="2" fill="#fff" opacity=".5"/>
      <path d="M60 20 Q42 36 32 66 M60 20 Q50 40 48 68 M60 20 Q70 40 72 68 M60 20 Q78 36 88 66" fill="none" stroke="#fff" stroke-width="1.6" opacity=".3"/>
      ${shine(40, 32, 11, 6, -25)}
      ${pair(60, 50, 13, 7.5, { lid: '#8AA3F0', lidRot: -6, lidY: 0.05, dir: [-0.1, 0.25] })}
      ${M.o(60, 62, 7)}`;
  }
  function ranklerin(P, o, C) {
    const leafG = C.grad('#4FC96A'), stem = '#2F8F45', petal = C.grad('#FF7FAF');
    return `<path d="M42 70 Q20 66 16 48 Q14 36 24 34 Q32 36 28 44 Q24 50 30 50" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M42 70 Q20 66 16 48 Q14 36 24 34 Q32 36 28 44 Q24 50 30 50" fill="none" stroke="${stem}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M78 70 Q100 66 104 48 Q106 36 96 34 Q88 36 92 44 Q96 50 90 50" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M78 70 Q100 66 104 48 Q106 36 96 34 Q88 36 92 44 Q96 50 90 50" fill="none" stroke="${stem}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M22 64 Q12 70 14 78 Q22 76 22 64 Z M98 64 Q108 70 106 78 Q98 76 98 64 Z" ${F('#7EDB7A', 2)}/>
      <path d="M60 64 Q24 74 30 116 Q46 104 60 112 Q74 104 90 116 Q96 74 60 64 Z" ${F(leafG)}/>
      <path d="M60 70 L60 110 M60 84 L46 96 M60 84 L74 96" fill="none" stroke="${stem}" stroke-width="2.4" stroke-linecap="round"/>
      ${[0, 45, 90, 135, 180, 225, 270, 315].map((r) => `<ellipse cx="60" cy="18" rx="10" ry="14" ${F(petal, 2.2)} transform="rotate(${r} 60 42)"/>`).join('')}
      <circle cx="60" cy="42" r="21" ${F(C.grad('#9BE68F'))}/>
      ${shine(52, 32, 6, 3.5, -20)}
      ${pair(60, 42, 9, 6, { lid: '#7BCF74', lidRot: -10, lidY: -0.1, dir: [0.25, 0.1] })}
      <path d="M45 33 L42 30 M48 31.5 L46.5 28 M75 33 L78 30 M72 31.5 L73.5 28" ${N(2)}/>
      ${M.smirk(60, 53, 6)}
      ${blush(60, 49, 14, 3.5)}`;
  }
  function nachtschwinge(P, o, C) {
    const fur = C.grad('#5D4FA3'), wing = C.lin('#4A3D8A', '#2C2460');
    return `<path d="M42 56 Q20 30 2 40 Q6 52 4 62 Q12 58 16 66 Q22 60 28 70 Q34 64 42 74 Z" ${F(wing)}/>
      <path d="M78 56 Q100 30 118 40 Q114 52 116 62 Q108 58 104 66 Q98 60 92 70 Q86 64 78 74 Z" ${F(wing)}/>
      <path d="M42 58 L16 66 M42 62 L28 70 M78 58 L104 66 M78 62 L92 70" fill="none" stroke="#7B6CC9" stroke-width="1.8" stroke-linecap="round"/>
      ${spark(14, 48, 2.5, '#FFE066')}${spark(104, 46, 2.5, '#FFE066')}
      <path d="M40 46 L36 20 L52 36 Z M80 46 L84 20 L68 36 Z" ${F(fur)}/><path d="M41 40 L39 27 L48 36 Z M79 40 L81 27 L72 36 Z" fill="#A99BEA"/>
      <ellipse cx="60" cy="70" rx="27" ry="30" ${F(fur)}/>
      <path d="M44 80 Q60 104 76 80 Q74 98 60 100 Q46 98 44 80 Z" fill="#8C7FD6"/>
      <path d="M50 108 L48 116 M70 108 L72 116" ${N(3)}/>
      <path d="M52 92 l2.7 4 l2.7 -4 l2.7 4 l2.7 -4 l2.7 4" fill="none" stroke="#6B5EB8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      ${shine(48, 52, 7, 4, -25)}
      ${pair(60, 62, 11, 8, { look: 'glow', glow: '#FFD84A' })}
      <path d="M44 52 L56 56 M76 52 L64 56" ${N(3)}/>
      ${M.fangs(60, 78, 8)}
      <path d="M100 6 A10 10 0 1 0 112 20 A8 8 0 1 1 100 6 Z" fill="#FFE8A0" ${S(1.8)}/>`;
  }
  function glaspanzer(P, o, C) {
    const glass = C.lin('#E2FBFF', '#6CCBE0'), dark = C.grad('#3A4A70');
    return `<path d="M30 70 L8 58 L4 46 M28 86 L6 92 L2 106 M90 70 L112 58 L116 46 M92 86 L114 92 L118 106 M40 102 L28 116 M80 102 L92 116" fill="none" stroke="${OUT}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M60 40 L48 6 L60 14 L72 6 Z" ${F(glass, 2.6)}/><path d="M60 14 L60 38" stroke="#fff" stroke-width="2" opacity=".8"/>
      <ellipse cx="60" cy="78" rx="38" ry="34" ${F(dark)}/>
      <path d="M58 48 L24 62 L22 88 L38 108 L58 112 Z" ${F(glass, 2.4)} opacity=".95"/>
      <path d="M62 48 L96 62 L98 88 L82 108 L62 112 Z" ${F(glass, 2.4)} opacity=".95"/>
      <path d="M58 48 L40 78 L58 112 M24 62 L40 78 L22 88 M40 78 L38 108 M62 48 L80 78 L62 112 M96 62 L80 78 L98 88 M80 78 L82 108" fill="none" stroke="#3E9DB5" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M30 66 L40 62 L36 74 Z M68 56 L78 60 L72 66 Z" fill="#fff" opacity=".8"/>
      ${spark(100, 70, 4, '#fff')}${spark(18, 92, 3, '#fff')}
      <path d="M36 46 Q60 30 84 46 Q84 58 60 58 Q36 58 36 46 Z" ${F(dark)}/>
      ${pair(60, 47, 11, 6.5, { look: 'glow', glow: '#8CF0FF', dir: [0, 0.1] })}
      <path d="M44 38 L56 43 M76 38 L64 43" ${N(3.4)}/>
      <path d="M52 56 L56 52 L60 56 L64 52 L68 56" ${N(2.4)}/>`;
  }
  function ofenwurm(P, o, C) {
    const iron = C.grad('#C2452B'), band = '#7E2A1A', fire = C.lin('#FFE066', '#FF6A3D');
    let seg = along([18, 104], [10, 70], [40, 76], 4, (x, y, i) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${12 + i * 2}" ${F(iron)}/><path d="M${f1(x - 8)} ${f1(y - 6)} Q${f1(x)} ${f1(y + 2)} ${f1(x + 8)} ${f1(y - 6)}" fill="none" stroke="${band}" stroke-width="2.4"/>`);
    return `${seg}
      <path d="M40 112 Q34 72 60 64 Q88 60 94 84 L98 112 Z" ${F(iron)}/>
      <rect x="50" y="80" width="34" height="26" rx="5" ${F('#3A3A44')}/>
      <rect x="54" y="84" width="26" height="18" rx="3" fill="${fire}"/><path d="M60 84 L60 102 M67 84 L67 102 M74 84 L74 102" stroke="${OUT}" stroke-width="2.4"/>
      <circle cx="80" cy="93" r="2.2" fill="#C9CCD6"/><ellipse cx="67" cy="110" rx="18" ry="3.5" fill="#FFB23F" opacity=".35"/>
      <circle cx="53" cy="83" r="1.3" fill="#8A8A96"/><circle cx="81" cy="83" r="1.3" fill="#8A8A96"/><circle cx="53" cy="103" r="1.3" fill="#8A8A96"/><circle cx="81" cy="103" r="1.3" fill="#8A8A96"/>
      <circle cx="46" cy="76" r="2" fill="${band}"/><circle cx="90" cy="76" r="2" fill="${band}"/>
      <path d="M42 30 L34 10 L52 22 Z" ${F('#5A5A66')}/>
      <path d="M30 44 Q30 18 62 18 Q94 18 94 44 Q94 64 62 66 Q30 64 30 44 Z" ${F(iron)}/>
      <rect x="74" y="4" width="13" height="20" rx="2" ${F('#4A4A55')}/><rect x="71" y="2" width="19" height="6" rx="2" ${F('#5A5A66', 2.2)}/>
      <circle cx="94" cy="6" r="5" ${F('#C9CCD6', 2)}/><circle cx="104" cy="12" r="6.5" ${F('#DADCE4', 2)}/><circle cx="113" cy="4" r="4" ${F('#E8EAF0', 1.8)}/>
      ${shine(44, 28, 8, 4, -20)}
      <ellipse cx="62" cy="54" rx="18" ry="9" fill="#E47A55"/>
      <circle cx="56" cy="51" r="2" fill="${OUT}"/><circle cx="68" cy="51" r="2" fill="${OUT}"/>
      ${pair(62, 36, 14, 7.5, { iris: '#FFB23F', brow: 'angry', bw: 3.6 })}
      ${M.fangs(62, 58, 11)}`;
  }

  /* ---------- Zahlenquest, Welt 3 ---------- */
  function frostblitz(P, o, C) {
    const ice = C.lin('#F2FCFF', '#7CCBF2');
    const flake = (x, y, r) => `<path d="M${x - r} ${y} L${x + r} ${y} M${x} ${y - r} L${x} ${y + r} M${f1(x - r * 0.7)} ${f1(y - r * 0.7)} L${f1(x + r * 0.7)} ${f1(y + r * 0.7)} M${f1(x - r * 0.7)} ${f1(y + r * 0.7)} L${f1(x + r * 0.7)} ${f1(y - r * 0.7)}" stroke="#DFF6FF" stroke-width="2.2" stroke-linecap="round"/>`;
    return `${flake(16, 26, 7)}${flake(104, 96, 6)}${flake(102, 18, 4)}
      <path d="M18 70 l8 -6 l-2 8 l8 -5 M96 46 l8 -4 l-4 7 l8 -3" fill="none" stroke="#FFE066" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M66 4 L28 62 L54 62 L40 116 L94 46 L68 46 L86 4 Z" fill="none" stroke="#8FD8FF" stroke-width="10" stroke-linejoin="round" opacity=".3"/>
      <path d="M66 4 L28 62 L54 62 L40 116 L94 46 L68 46 L86 4 Z" ${F(ice, 2.8)}/>
      <path d="M74 12 L70 22 L76 26 M48 92 L52 84 M80 52 L74 58" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>
      <path d="M66 4 L52 26 L66 26 Z M54 62 L48 86 L60 74 Z" fill="#fff" opacity=".7"/>
      <path d="M38 62 L36 70 L42 64 M70 70 L72 80 M78 58 L82 64" fill="none" stroke="#5FB4E0" stroke-width="2" stroke-linecap="round"/>
      ${pair(62, 46, 9, 6, { iris: '#3FA0FF', brow: 'angry', bw: 3 })}
      ${M.grin(64, 58, 7)}`;
  }
  function dschungelbrueller(P, o, C) {
    const mane = C.grad('#3DAE55'), face = C.grad('#E8B44E'), leafL = '#7EDB7A';
    let leaves = '';
    for (let i = 0; i < 14; i++) { const a = i * (360 / 14); leaves += `<g transform="rotate(${a} 60 56)"><ellipse cx="60" cy="18" rx="9" ry="17" ${F(i % 2 ? mane : leafL, 2.2)}/><path d="M60 4 L60 30" stroke="${i % 2 ? '#2A8A40' : '#4FAE52'}" stroke-width="1.4" stroke-linecap="round"/></g>`; }
    return `${leaves}
      <path d="M30 116 Q30 88 60 86 Q90 88 90 116 Z" ${F(face)}/>
      <circle cx="60" cy="56" r="30" ${F(mane)}/>
      <circle cx="34" cy="34" r="8" ${F(face)}/><circle cx="86" cy="34" r="8" ${F(face)}/>
      <ellipse cx="60" cy="58" rx="24" ry="25" ${F(face)}/>
      ${shine(48, 42, 6, 3.5, -20)}
      ${pair(60, 50, 10, 6, { brow: 'angry', bw: 3.4, iris: '#7A4A1A' })}
      <ellipse cx="60" cy="62" rx="5.5" ry="4" fill="${OUT}"/>
      ${M.roar(60, 68, 13, 14)}
      <path d="M36 112 L36 116 M42 110 L42 116 M78 110 L78 116 M84 112 L84 116" ${N(2)}/><path d="M50 96 l3.3 5 l3.3 -5 l3.3 5 l3.3 -5 l3.3 5" fill="none" stroke="#B9852E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  function magmagolem(P, o, C) {
    const rock = C.grad('#5B4A52'), lava = '#FF8A2A', hot = '#FFD23F';
    return `<path d="M22 58 L6 70 L4 96 L22 102 L30 74 Z" ${F(rock)}/><path d="M98 58 L114 70 L116 96 L98 102 L90 74 Z" ${F(rock)}/>
      <path d="M2 94 L8 112 L26 112 L26 98 Z M118 94 L112 112 L94 112 L94 98 Z" ${F(rock)}/>
      <path d="M10 78 L18 86 L14 94 M110 78 L102 86 L106 94" fill="none" stroke="${lava}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M28 114 L22 60 L38 40 L82 40 L98 60 L92 114 Z" ${F(rock)}/>
      <path d="M40 66 L50 78 L46 92 L56 104 M80 62 L72 76 L78 88 L70 100 M60 86 L62 96" fill="none" stroke="${lava}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" opacity=".22"/>
      <path d="M40 66 L50 78 L46 92 L56 104 M80 62 L72 76 L78 88 L70 100 M60 86 L62 96" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 66 L50 78 L46 92 L56 104 M80 62 L72 76 L78 88 L70 100 M60 86 L62 96" fill="none" stroke="${lava}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M44 22 L40 40 L80 40 L76 22 L66 14 L52 14 Z" ${F(rock)}/>
      <path d="M52 14 L56 4 L60 12 L64 2 L66 14 Z" ${F(hot, 2)}/>
      <path d="M22 60 L38 40 L46 52 Z" fill="#fff" opacity=".15"/>
      <rect x="44" y="24" width="32" height="10" rx="3" fill="#2A1E24"/>
      <ellipse cx="52" cy="29" rx="5" ry="3.2" fill="${hot}"/><ellipse cx="68" cy="29" rx="5" ry="3.2" fill="${hot}"/>
      <ellipse cx="52" cy="29" rx="8" ry="5" fill="${lava}" opacity=".35"/><ellipse cx="68" cy="29" rx="8" ry="5" fill="${lava}" opacity=".35"/>
      <path d="M50 50 L54 54 L60 50 L66 54 L70 50" fill="none" stroke="${lava}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  function schattenwolf(P, o, C) {
    const fur = C.grad('#4B4782'), smoke = '#6E66B8';
    return `<path d="M100 8 A12 12 0 1 0 114 24 A9 9 0 1 1 100 8 Z" fill="#FFE8A0" ${S(1.8)}/>
      ${spark(14, 30, 3, '#C9C3FF')}${spark(24, 14, 2, '#C9C3FF')}${spark(86, 4, 1.8, '#C9C3FF')}
      <path d="M14 96 Q4 86 12 78 Q6 70 16 64 M106 96 Q116 86 108 78 Q114 70 104 64" fill="none" stroke="${smoke}" stroke-width="6" stroke-linecap="round" opacity=".6"/>
      <path d="M30 116 Q24 86 42 78 L78 78 Q96 86 90 116 Q80 108 72 116 Q66 108 60 116 Q54 108 48 116 Q40 108 30 116 Z" ${F(fur)}/>
      <path d="M28 50 L20 6 L52 32 Z M92 50 L100 6 L68 32 Z" ${F(fur)}/><path d="M31 44 L26 18 L44 32 Z M89 44 L94 18 L76 32 Z" fill="#2A2650"/>
      <path d="M22 66 Q14 40 36 28 Q60 18 84 28 Q106 40 98 66 L110 70 L96 78 L104 86 L86 86 Q74 100 60 100 Q46 100 34 86 L16 86 L24 78 L10 70 Z" ${F(fur)}/>
      ${shine(42, 40, 9, 4.5, -20)}
      <path d="M40 74 Q60 64 80 74 Q76 92 60 96 Q44 92 40 74 Z" fill="#8A84C9"/>
      <ellipse cx="60" cy="74" rx="6" ry="4.2" fill="${OUT}"/>
      ${pair(60, 56, 15, 8, { look: 'glow', glow: '#FFD84A' })}
      <path d="M38 46 L52 52 M82 46 L68 52" ${N(3.4)}/>
      ${M.fangs(60, 84, 9)}`;
  }
  function sturmreiter(P, o, C) {
    const cloud = C.lin('#A9B4CC', '#5A6684'), steel = C.grad('#C9D2E3'), cape = '#B0303C';
    return `<path d="M14 26 Q28 18 40 24 M86 14 Q98 6 112 14 M90 24 Q100 20 108 24" fill="none" stroke="#DCE4F4" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>
      <path d="M34 92 L28 104 L36 104 L30 118 M60 96 L54 108 L62 108 L56 118 M86 92 L80 104 L88 104 L82 118" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M34 92 L28 104 L36 104 L30 118 M60 96 L54 108 L62 108 L56 118 M86 92 L80 104 L88 104 L82 118" fill="none" stroke="#FFE066" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M58 54 Q40 54 30 74 Q24 66 18 74 L56 76 Z" ${F(cape)}/>
      <path d="M8 86 Q2 70 18 68 Q18 54 34 58 Q42 48 56 56 Q70 48 82 58 Q100 54 102 70 Q118 72 112 88 Q108 98 94 96 Q80 104 64 98 Q46 104 32 96 Q12 100 8 86 Z" ${F(cloud)}/>
      ${shine(30, 70, 9, 4, -15)}
      <path d="M44 62 Q42 40 60 36 Q78 40 76 62 Z" ${F(steel)}/>
      <path d="M50 58 L50 70 L70 70 L70 58" ${F('#8E99B3', 2.2)}/>
      <path d="M42 34 Q40 12 60 10 Q80 12 78 34 Q78 44 60 44 Q42 44 42 34 Z" ${F(steel)}/>
      <path d="M60 10 Q72 0 86 4 Q76 6 74 14 Q70 8 60 10 Z" ${F(cape, 2.2)}/>
      <path d="M46 28 L74 28 L72 36 L48 36 Z" fill="${OUT}"/><path d="M47 22 Q50 14 58 13" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
      <path d="M50 31 L57 33 M70 31 L63 33" stroke="#8CF0FF" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M60 12 L60 26" stroke="#8E99B3" stroke-width="2"/>
      <path d="M76 60 L104 24 L98 40 L112 34 L84 72 Z" ${F('#FFE066', 2.4)}/>
      <circle cx="74" cy="62" r="5" ${F(steel, 2.2)}/>`;
  }
  function rechenkoenig(P, o, C) {
    const robe = C.grad('#7446B8'), gold = '#FFC93C', face = C.grad('#F6CDA6');
    const plus = (x, y, k) => `<path d="M${x - k} ${y} L${x + k} ${y} M${x} ${y - k} L${x} ${y + k}" stroke="${OUT}" stroke-width="2.6" stroke-linecap="round"/>`;
    const times = (x, y, k) => `<path d="M${x - k} ${y - k} L${x + k} ${y + k} M${x + k} ${y - k} L${x - k} ${y + k}" stroke="${OUT}" stroke-width="2.6" stroke-linecap="round"/>`;
    return `<path d="M14 116 Q14 66 60 62 Q106 66 106 116 Z" ${F(robe)}/>
      <path d="M30 70 Q60 84 90 70 Q92 80 86 84 Q60 96 34 84 Q28 80 30 70 Z" ${F('#FFFDF5')}/>
      <circle cx="40" cy="80" r="1.8" fill="${OUT}"/><circle cx="56" cy="86" r="1.8" fill="${OUT}"/><circle cx="72" cy="84" r="1.8" fill="${OUT}"/><circle cx="84" cy="78" r="1.8" fill="${OUT}"/>
      <path d="M30 98 Q34 108 30 116 M90 98 Q86 108 90 116" fill="none" stroke="#5A3590" stroke-width="2" stroke-linecap="round"/>
      <path d="M40 96 L80 96" fill="none" stroke="#5A3590" stroke-width="5"/>
      ${[44, 52, 60, 68, 76].map((x, i) => `<circle cx="${x}" cy="96" r="3.4" ${F(['#FF6E8E', '#3FA0FF', '#4FC96A', '#FFC93C', '#FF8A3D'][i], 1.6)}/>`).join('')}
      <circle cx="60" cy="108" r="7" ${F(gold, 2.2)}/>${times(60, 108, 3)}
      <path d="M104 116 L104 44" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M104 116 L104 44" stroke="${gold}" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="94" y="30" width="20" height="16" rx="4" ${F(gold, 2.2)}/><path d="M99 35.5 L109 35.5 M99 40.5 L109 40.5" stroke="${OUT}" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="104" cy="66" r="6" ${F(face, 2.2)}/>
      <ellipse cx="60" cy="46" rx="26" ry="24" ${F(face)}/>
      <path d="M30 32 L34 4 L46 20 L60 0 L74 20 L86 4 L90 32 Z" ${F(gold)}/>
      <path d="M30 32 L90 32 L90 38 L30 38 Z" ${F('#E0A92A', 2.2)}/>
      <circle cx="46" cy="24" r="4.5" ${F('#FF6E8E', 1.8)}/><circle cx="74" cy="24" r="4.5" ${F('#3FA0FF', 1.8)}/>
      <circle cx="60" cy="16" r="5.5" ${F('#4FC96A', 1.8)}/>${plus(60, 16, 2.6)}<circle cx="44.6" cy="22.6" r="1.3" fill="#fff"/><circle cx="72.6" cy="22.6" r="1.3" fill="#fff"/>
      ${pair(60, 48, 11, 6, { brow: 'angry', bw: 3.8, browColor: '#7A7A8A' })}
      <path d="M60 56 Q48 52 40 60 Q48 58 54 62 Q58 60 60 58 Q62 60 66 62 Q72 58 80 60 Q72 52 60 56 Z" ${F('#E9E6F2', 2)}/>
      ${M.frown(60, 64, 6)}`;
  }

  /* ---------- Luthers Weg ---------- */
  function zweifler(P, o, C) {
    const body = C.grad('#9CA9CC');
    return `${C.glyph(18, qmark(18, 30, 1.3))}${C.glyph(102, qmark(102, 22, 1))}${C.glyph(96, qmark(96, 50, 0.7, '#C9D2EA'))}
      <path d="M24 66 A36 36 0 0 1 96 66 L98 108 Q90 100 84 110 Q76 100 70 110 Q62 100 56 110 Q48 100 42 110 Q34 100 26 108 Z" ${F(body)}/>
      ${shine(42, 48, 9, 5, -25)}
      <path d="M90 74 Q104 62 96 46" fill="none" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="M90 74 Q104 62 96 46" fill="none" stroke="#9CA9CC" stroke-width="5" stroke-linecap="round"/>
      <circle cx="94" cy="44" r="6.5" ${F('#B3BEDB', 2.2)}/>
      <path d="M28 84 Q18 92 24 100" fill="none" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="M28 84 Q18 92 24 100" fill="none" stroke="#9CA9CC" stroke-width="5" stroke-linecap="round"/>
      <path d="M34 50 Q38 56 36 60 A3 3 0 0 1 31 58 Q31 54 34 50 Z" fill="#BFE6FF" ${S(1.4)}/>
      ${pair(58, 64, 12, 7.5, { brow: 'worried', bw: 3, dir: [-0.2, -0.3] })}
      ${M.wavy(58, 84, 7)}`;
  }
  function vergesslicher(P, o, C) {
    const body = C.grad('#B79BDB');
    return `<path d="M90 30 Q86 14 100 12 Q104 2 114 8 Q122 16 116 26 Q118 36 104 36 Q94 40 90 30 Z" fill="#fff" ${S(2)}/>
      <circle cx="84" cy="44" r="3" fill="#fff" ${S(1.6)}/><circle cx="78" cy="52" r="2" fill="#fff" ${S(1.4)}/>
      <circle cx="98" cy="24" r="2" fill="#B9B0D0"/><circle cx="104" cy="24" r="2" fill="#B9B0D0"/><circle cx="110" cy="24" r="2" fill="#B9B0D0"/>
      <path d="M18 80 Q12 52 34 46 Q38 30 56 34 Q72 26 82 42 Q102 46 100 70 Q110 86 96 100 Q86 114 60 112 Q30 114 22 102 Q10 94 18 80 Z" ${F(body)}/>
      ${shine(36, 56, 9, 5, -25)}
      <path d="M32 40 L52 36 L54 54 L34 56 Z" ${F('#FFE97A', 2)} transform="rotate(-8 44 46)"/>
      <path d="M38 46 L48 44" stroke="#C9B24A" stroke-width="2" stroke-linecap="round" transform="rotate(-8 44 46)"/>
      ${spark(24, 40, 3.5, '#FFE066')}${spark(96, 58, 2.6, '#FFE066')}${spark(18, 62, 2, '#FFE066')}
      ${pair(60, 70, 13, 8, { look: 'dizzy' })}
      ${M.o(60, 92, 7)}
      <path d="M20 82 Q10 76 12 68 M100 82 Q110 76 108 68" ${N(3)}/>`;
  }
  function verwechsler(P, o, C) {
    const a = C.grad('#FF9A3D'), b = C.grad('#38BFB0');
    return `<path d="M36 40 Q22 12 30 6 Q40 6 46 34 Z" ${F(a)}/><path d="M33 34 Q28 16 32 12 Q36 14 40 32 Z" fill="#FFD3A8"/>
      <circle cx="86" cy="30" r="11" ${F(b)}/><circle cx="86" cy="30" r="5" fill="#9FEDE3"/>
      <path d="M60 30 Q24 30 22 70 Q20 108 60 110 Z" ${F(a)}/>
      <path d="M60 30 Q96 30 98 70 Q100 108 60 110 Z" ${F(b)}/>
      <circle cx="32" cy="80" r="3" fill="#FFC889"/><circle cx="40" cy="98" r="3.5" fill="#FFC889"/><circle cx="30" cy="94" r="2.2" fill="#FFC889"/><circle cx="50" cy="104" r="2.4" fill="#FFC889"/>
      <path d="M72 96 Q82 94 92 98 M70 104 Q80 102 88 106 M76 88 Q86 86 94 90" fill="none" stroke="#2A9C90" stroke-width="3" stroke-linecap="round"/>
      <path d="M60 30 Q56 50 62 70 Q66 90 60 110" fill="none" stroke="${OUT}" stroke-width="2" stroke-dasharray="4 4"/>
      <path d="M60 30 Q24 30 22 70 Q20 108 60 110 Q100 108 98 70 Q96 30 60 30 Z" ${N()}/>
      ${shine(38, 48, 7, 4, -25)}
      ${eye(44, 62, 10, { side: -1, dir: [0.4, -0.2] })}${eye(78, 64, 6, { side: 1, dir: [-0.4, 0.3] })}
      <path d="M68 56 L86 54" ${N(3)}/>
      <path d="M40 86 Q48 80 56 88 Q64 96 72 86 Q76 82 80 86" ${N(3)}/>
      <path d="M30 108 L28 116 L42 116 M88 108 L92 116 L100 112" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="34" cy="116" rx="8" ry="3" fill="#E8516F"/><ellipse cx="96" cy="114" rx="7" ry="3" fill="#3FA0FF"/>`;
  }
  function schwindler(P, o, C) {
    const body = C.grad('#8A63C9');
    return `<path d="M26 112 Q14 64 38 46 Q60 34 82 46 Q106 64 94 112 Z" ${F(body)}/>
      ${shine(40, 58, 8, 4.5, -25)}
      <g transform="translate(0 12)"><path d="M36 26 L40 2 L80 2 L84 26 Z" ${F('#2E2A40')}/><path d="M38 17 L82 17 L83 24 L37 24 Z" fill="#E0304A"/><path d="M44 6 L43 14" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".35"/><path d="M22 24 L98 24 Q100 32 90 34 L30 34 Q20 32 22 24 Z" ${F('#2E2A40')}/></g>
      <path d="M28 56 Q44 48 60 56 Q76 48 92 56 Q92 70 78 70 Q66 70 60 62 Q54 70 42 70 Q28 70 28 56 Z" ${F('#2E2A40')}/>
      ${eye(44, 60, 6, { side: -1, dir: [0.55, 0.1] })}${eye(76, 60, 6, { side: 1, dir: [0.55, 0.1] })}
      <path d="M60 76 Q52 70 42 76 Q38 82 32 78 Q38 86 48 82 Q56 80 60 78 Q64 80 72 82 Q82 86 88 78 Q82 82 78 76 Q68 70 60 76 Z" ${F('#3A2A1A', 2)}/>
      ${M.smirk(62, 90, 9)}<circle cx="60" cy="100" r="2.2" ${F('#FFC93C', 1.4)}/><circle cx="60" cy="108" r="2.2" ${F('#FFC93C', 1.4)}/>
      <path d="M96 92 L108 72" ${N(3)}/><ellipse cx="110" cy="66" rx="9" ry="7" ${F('#FFE066', 2.2)}/><circle cx="107" cy="65" r="1.6" fill="${OUT}"/><circle cx="113" cy="65" r="1.6" fill="${OUT}"/><path d="M106 69 Q110 72 114 69" ${N(1.6)}/>`;
  }
  function richter(P, o, C) {
    const robe = C.grad('#3A3550'), skin = C.grad('#F2C9A0'), cap = C.grad('#C0303C');
    return `<path d="M6 116 Q8 62 60 58 Q112 62 114 116 Z" ${F(robe)}/>
      <path d="M50 62 L60 74 L70 62 Z" ${F('#fff', 2)}/><path d="M54 70 L52 88 L59 88 L58 74 Z M66 70 L68 88 L61 88 L62 74 Z" ${F('#fff', 2)}/>
      <path d="M30 76 L28 108 M90 76 L92 108" fill="none" stroke="#52496E" stroke-width="3" stroke-linecap="round"/>
      <path d="M98 74 L110 40" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M98 74 L110 40" fill="none" stroke="#A86B3A" stroke-width="3.5" stroke-linecap="round"/>
      <g transform="rotate(20 110 30)"><rect x="96" y="22" width="28" height="16" rx="4" ${F('#8A5428')}/><path d="M103 22 L103 38 M117 22 L117 38" stroke="#E0B060" stroke-width="2.4"/></g>
      <circle cx="98" cy="76" r="7" ${F(skin, 2.2)}/>
      <ellipse cx="54" cy="44" rx="27" ry="26" ${F(skin)}/>
      <path d="M26 30 Q24 8 54 8 Q84 8 82 30 Q54 22 26 30 Z" ${F(cap)}/><path d="M34 20 Q40 12 50 11" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".35"/><path d="M26 30 Q54 22 82 30 L82 34 Q54 26 26 34 Z" ${F('#8E2230', 2)}/>
      <path d="M28 40 Q20 48 26 58 M80 40 Q88 48 82 58" fill="none" stroke="#D9D9E3" stroke-width="7" stroke-linecap="round"/>
      ${pair(54, 46, 11, 5.5, { brow: 'angry', bw: 5.2, browColor: '#C9C9D6', dir: [0, 0.15] })}
      <path d="M54 50 Q51 58 56 58" ${N(2.2)}/>
      ${M.frown(54, 63, 8)}`;
  }
  function ablasshaendler(P, o, C) {
    const robe = C.grad('#8A5A3A'), skin = C.grad('#F2C9A0'), box = C.lin('#B07A42', '#7A4E26'), gold = '#FFC93C';
    const coin = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" ${F(gold, 2)}/><circle cx="${x}" cy="${y}" r="${f1(r * 0.5)}" fill="none" stroke="#C9921E" stroke-width="1.4"/>${spark(f1(x + r * 0.9), f1(y - r * 0.9), f1(r * 0.6), '#fff')}`;
    return `<path d="M12 116 Q12 66 60 62 Q108 66 108 116 Z" ${F(robe)}/>
      <path d="M48 64 Q60 76 72 64" fill="none" stroke="#5E3A22" stroke-width="4" stroke-linecap="round"/>
      <path d="M8 66 Q2 60 8 54 L30 58 L28 98 Q10 96 8 86 Z" ${F('#FFF6DD', 2.2)}/><path d="M12 64 L24 66 M12 72 L24 74 M12 80 L22 82" stroke="#9AA3C2" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="18" cy="92" r="6" ${F('#D9343F', 2)}/>
      <rect x="62" y="80" width="44" height="34" rx="4" ${F(box)}/><path d="M62 92 L106 92" stroke="${OUT}" stroke-width="2.2"/><rect x="76" y="83" width="16" height="4" rx="2" fill="${OUT}"/>
      <path d="M68 80 L68 114 M100 80 L100 114" stroke="#4A4A55" stroke-width="3"/>
      <circle cx="84" cy="102" r="4" ${F('#C9CCD6', 1.8)}/>
      ${coin(84, 70, 6)}${coin(100, 60, 5)}${coin(70, 58, 4.5)}
      <ellipse cx="44" cy="44" rx="26" ry="25" ${F(skin)}/>
      <path d="M16 34 Q14 14 44 12 Q74 14 72 34 Q44 26 16 34 Z" ${F('#3A2A1E')}/>
      <path d="M8 36 Q44 20 80 36 Q80 42 72 40 Q44 30 16 40 Q8 42 8 36 Z" ${F('#4A3526')}/>
      ${pair(44, 46, 10, 6, { iris: gold, brow: 'up', bw: 3, dir: [0.35, 0] })}
      <path d="M44 50 Q41 57 46 57" ${N(2.2)}/>
      ${M.grin(44, 62, 10)}
      ${blush(44, 58, 18, 4)}`;
  }

  /* ---------- Kartoffel-Werkstatt ---------- */
  function blattlaus(P, o, C) {
    const body = C.grad('#8EDB6A');
    return `<path d="M4 108 Q60 82 116 108 Q60 120 4 108 Z" ${F('#3E9A47', 2.2)}/><path d="M10 107 Q60 98 112 106" fill="none" stroke="#2C7A36" stroke-width="2"/>
      <path d="M44 48 Q30 18 14 14 M76 48 Q90 18 106 14" ${N(2.4)}/>
      <path d="M34 86 L20 94 L18 104 M40 94 L32 104 M86 86 L100 94 L102 104 M80 94 L88 104 M50 100 L48 106 M70 100 L72 106" ${N(3)}/>
      <ellipse cx="60" cy="78" rx="32" ry="26" ${F(body)}/>
      <path d="M34 62 L26 54 M86 62 L94 54" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="M34 62 L26 54 M86 62 L94 54" fill="none" stroke="#6CBF4E" stroke-width="3" stroke-linecap="round"/>
      <path d="M36 86 Q60 96 84 86" fill="none" stroke="#5FAF48" stroke-width="2"/>
      <circle cx="60" cy="52" r="17" ${F(body)}/>
      ${shine(52, 44, 5, 3, -20)}${shine(42, 70, 8, 4, -20)}
      ${pair(60, 52, 8, 5.5, { brow: 'angry', bw: 2.8, iris: '#C0303C' })}
      ${M.cat(60, 62, 5)}`;
  }
  function drahtwurm(P, o, C) {
    const seg = C.grad('#E3A93C');
    const segs = along([100, 106], [6, 116], [58, 62], 11, (x, y, i) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(10 + i * 0.3)}" ry="${f1(9 + i * 0.25)}" ${F(seg)}/><path d="M${f1(x - 3)} ${f1(y - 6)} L${f1(x + 3)} ${f1(y - 6)}" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/>`);
    return `<path d="M6 116 Q30 108 54 114 Q80 108 114 116 Z" fill="#6B4A2B" opacity=".9"/>${segs}
      <circle cx="60" cy="46" r="20" ${F(C.grad('#9C5A2A'))}/>
      <path d="M46 62 Q40 72 48 76 M74 62 Q80 72 72 76" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M46 62 Q40 72 48 76 M74 62 Q80 72 72 76" fill="none" stroke="#5A3418" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M52 28 Q48 16 40 14 M68 28 Q72 16 80 14" ${N(2.4)}/>
      ${shine(52, 36, 5, 3, -20)}
      ${pair(60, 44, 8, 5.5, { brow: 'angry', bw: 2.8 })}
      ${M.flat(60, 56, 5)}`;
  }
  function wuehlmaus(P, o, C) {
    const fur = C.grad('#A57A55'), dirt = C.lin('#8A5E3A', '#5E3E22');
    return `<path d="M22 32 Q16 8 34 12 Q44 16 40 36 Z M98 32 Q104 8 86 12 Q76 16 80 36 Z" ${F(fur)}/><path d="M26 28 Q24 16 33 18 Q38 22 36 32 Z M94 28 Q96 16 87 18 Q82 22 84 32 Z" fill="#F2B4B4"/>
      <path d="M94 90 Q114 84 110 66 Q108 58 102 60" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="M94 90 Q114 84 110 66 Q108 58 102 60" fill="none" stroke="#F2B4B4" stroke-width="3" stroke-linecap="round"/>
      <path d="M22 96 Q18 52 60 42 Q102 52 98 96 Z" ${F(fur)}/>
      <path d="M38 84 Q60 74 82 84 L82 96 L38 96 Z" fill="#E9D3B6"/>
      <ellipse cx="60" cy="52" rx="32" ry="26" ${F(fur)}/>
      ${shine(44, 40, 7, 4, -20)}
      <ellipse cx="60" cy="64" rx="13" ry="9" fill="#E9D3B6"/>
      <ellipse cx="60" cy="60" rx="4.5" ry="3.5" ${F('#FF8FA8', 2)}/>
      <path d="M46 62 L28 58 M46 66 L28 68 M74 62 L92 58 M74 66 L92 68" ${N(1.6)}/>
      ${pair(60, 48, 13, 4.5, { pupil: 0.75 })}
      ${M.buck(60, 66, 6)}
      <ellipse cx="60" cy="92" rx="12" ry="9" ${F('#D9B35E', 2.2)}/><circle cx="56" cy="90" r="1.3" fill="#8A6A3F"/><circle cx="64" cy="94" r="1.3" fill="#8A6A3F"/>
      <ellipse cx="46" cy="90" rx="6" ry="5" ${F(fur, 2)}/><ellipse cx="74" cy="90" rx="6" ry="5" ${F(fur, 2)}/>
      <path d="M2 116 Q10 92 30 96 Q44 88 60 98 Q76 88 90 96 Q110 92 118 116 Z" ${F(dirt)}/>
      <circle cx="22" cy="106" r="2.5" fill="#4A3220"/><circle cx="94" cy="108" r="3" fill="#4A3220"/><circle cx="60" cy="110" r="2" fill="#4A3220"/>`;
  }
  function faeulewolke(P, o, C) {
    const cl = C.grad('#9DB36A');
    const fly = (x, y) => `<ellipse cx="${x - 4}" cy="${y - 4}" rx="4" ry="2.6" fill="#E6F4FF" ${S(1.4)} transform="rotate(-25 ${x - 4} ${y - 4})"/><ellipse cx="${x + 4}" cy="${y - 4}" rx="4" ry="2.6" fill="#E6F4FF" ${S(1.4)} transform="rotate(25 ${x + 4} ${y - 4})"/><ellipse cx="${x}" cy="${y}" rx="2.8" ry="3.6" fill="#2A3A2A" ${S(1.2)}/>`;
    return `<path d="M30 8 q-6 6 0 12 t0 12 M60 2 q-6 6 0 12 t0 12 M90 8 q-6 6 0 12 t0 12" fill="none" stroke="#9DB36A" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>
      ${fly(12, 52)}${fly(108, 44)}${fly(100, 98)}
      <path d="M14 76 Q4 56 24 50 Q26 32 46 36 Q56 22 74 32 Q94 28 96 48 Q116 54 106 76 Q110 92 92 92 Q86 100 74 96 Q66 104 54 96 Q40 102 34 92 Q14 94 14 76 Z" ${F(cl)}/>
      <path d="M40 96 Q40 106 36 108 Q32 104 36 96 M80 94 Q82 104 78 108 Q74 102 76 94" ${F('#8AA058', 2)}/>
      <circle cx="30" cy="70" r="4" fill="#7A8A4A"/><circle cx="20" cy="104" r="3" ${F('#C6DA8E', 1.6)}/><circle cx="96" cy="108" r="2.4" ${F('#C6DA8E', 1.4)}/><circle cx="58" cy="110" r="2" ${F('#C6DA8E', 1.4)}/><circle cx="92" cy="62" r="5" fill="#7A8A4A"/><circle cx="84" cy="80" r="3" fill="#7A8A4A"/>
      ${shine(36, 50, 9, 5, -25)}
      ${pair(60, 62, 13, 7, { lid: '#8AA058', lidRot: 6, lidY: -0.1, dir: [0, 0.2] })}
      ${M.tongue(60, 78, 10)}`;
  }
  function larve(P, o, C, big) {
    const body = C.grad(big ? '#C2352C' : '#E8613E'), spot = '#2A2230';
    if (!big) { // plump larva, crawling sideways
      return `<path d="M100 108 L104 116 M84 110 L86 116 M68 110 L68 116" ${N(3.4)}/>
        <path d="M24 108 Q12 84 30 66 Q50 40 80 46 Q108 52 112 80 Q114 104 98 110 Z" ${F(body)}/>
        <path d="M44 56 Q52 82 46 108 M62 48 Q70 80 64 110 M80 48 Q88 80 82 110 M96 56 Q102 80 98 108" fill="none" stroke="#B8402A" stroke-width="2.2"/>
        ${[[54, 62], [72, 58], [90, 62], [54, 84], [74, 82], [94, 84], [104, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${spot}"/>`).join('')}
        ${shine(68, 52, 10, 4, -10)}
        <path d="M24 108 L18 116 M36 110 L34 116" ${N(3.4)}/>
        <circle cx="28" cy="80" r="20" ${F(C.grad('#54465E'))}/>
        <path d="M14 94 L8 100 L16 100 M38 96 L44 102 L36 102" ${F('#5A4A30', 2)}/>
        ${pair(28, 78, 8, 6, { brow: 'angry', bw: 3.4, iris: '#FF9A2E' })}
        ${M.fangs(28, 90, 7)}
        <path d="M2 116 Q30 104 60 116 Z" ${F('#4FB04F', 2)}/><path d="M6 116 Q12 110 18 114 Q24 108 30 112" fill="none" stroke="${OUT}" stroke-width="2"/>`;
    }
    // giant larva: rearing up, armoured rings, bigger spots
    const rings = [[60, 104, 40, 12], [60, 90, 36, 13], [60, 74, 32, 13], [60, 58, 27, 12]];
    return `<path d="M18 114 L12 118 M102 114 L108 118" ${N(4)}/>
      ${rings.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" ${F(body)}/>`).join('')}
      ${[[28, 102], [92, 102], [32, 88], [88, 88], [38, 72], [82, 72], [44, 58], [76, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${spot}"/>`).join('')}
      <path d="${spikes(60, 70, 34, 44, 150, 210, 3)} ${spikes(60, 70, 34, 44, -30, 30, 3)}" ${F('#5A1E1E', 2)}/>
      ${shine(48, 56, 8, 3.5, -10)}
      <path d="M48 46 L30 40 L28 48 M72 46 L90 40 L92 48" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="60" cy="34" r="22" ${F(C.grad('#54465E'))}/>
      <path d="M44 48 Q34 58 44 62 Q46 56 52 52 Z M76 48 Q86 58 76 62 Q74 56 68 52 Z" ${F('#6A5A40', 2.2)}/>
      ${pair(60, 30, 10, 7, { brow: 'angry', bw: 4, iris: '#FF9A2E', slit: true })}
      <path d="M42 26 L48 22 M50 18 L54 14" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>
      ${M.fangs(60, 44, 9)}`;
  }
  function kaefer(P, o, C, queen) {
    const shell = C.grad(queen ? '#FFE07A' : '#F4D56E'), orange = C.grad('#EE8F3A'), black = '#1E1A26';
    let s = '';
    if (queen) s += `<path d="M18 50 Q4 80 12 114 L108 114 Q116 80 102 50 Q60 66 18 50 Z" ${F(C.lin('#9B5CD9', '#5E2E9A'))}/><path d="M14 112 L106 112" stroke="#FFFDF5" stroke-width="5"/>`;
    s += `<path d="M44 32 Q36 14 24 10 M76 32 Q84 14 96 10" ${N(3)}/>` + [[24, 10, 3.6], [30, 12, 2.6], [35, 16, 2.2], [96, 10, 3.6], [90, 12, 2.6], [85, 16, 2.2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${OUT}"/>`).join('');
    s += `<path d="M28 64 L8 54 L4 44 M26 82 L6 90 L4 102 M92 64 L112 54 L116 44 M94 82 L114 90 L116 102 M40 104 L30 116 M80 104 L90 116" fill="none" stroke="${OUT}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += `<path d="M60 52 Q22 50 22 80 Q22 110 58 112 Z" ${F(shell)}/><path d="M60 52 Q98 50 98 80 Q98 110 62 112 Z" ${F(shell)}/>`;
    // the ten black stripes of the Colorado potato beetle
    s += `<path d="M54 58 Q50 84 54 108 M44 58 Q36 84 42 106 M34 64 Q26 84 32 102" fill="none" stroke="${black}" stroke-width="3.6" stroke-linecap="round"/>`;
    s += `<path d="M66 58 Q70 84 66 108 M76 58 Q84 84 78 106 M86 64 Q94 84 88 102" fill="none" stroke="${black}" stroke-width="3.6" stroke-linecap="round"/>`;
    s += shine(36, 70, 5, 10, 10) + shine(84, 70, 3, 7, -10);
    s += [[8, 54], [6, 90], [112, 54], [114, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${OUT}"/>`).join('');
    s += `<path d="M34 56 Q34 42 60 40 Q86 42 86 56 Q86 62 60 62 Q34 62 34 56 Z" ${F(orange)}/>`;
    s += `<circle cx="46" cy="54" r="2.4" fill="${black}"/><circle cx="74" cy="54" r="2.4" fill="${black}"/><circle cx="60" cy="52" r="2.8" fill="${black}"/><circle cx="53" cy="58" r="1.8" fill="${black}"/><circle cx="67" cy="58" r="1.8" fill="${black}"/>`;
    s += `<ellipse cx="60" cy="31" rx="19" ry="14" ${F(orange)}/>`;
    s += pair(60, 28, 8, 5.5, { brow: 'angry', bw: 3, iris: queen ? '#9B5CD9' : null });
    s += `<path d="M52 38 L56 35 L60 38 L64 35 L68 38" ${N(2)}/>`;
    if (queen) s += `<path d="M44 20 L46 4 L54 14 L60 0 L66 14 L74 4 L76 20 Z" ${F('#FFC93C', 2.2)}/><circle cx="60" cy="13" r="2.8" ${F('#E0304A', 1.4)}/>`;
    return s;
  }
  function blattfresser(P, o, C) {
    const seg = C.grad('#7ED957');
    const body = along([104, 104], [86, 58], [44, 84], 6, (x, y, i) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(11 + i * 0.6)}" ${F(seg)}/><circle cx="${f1(x - 2)}" cy="${f1(y + 4)}" r="2.4" fill="#FFE066" ${S(1.2)}/><path d="M${f1(x - 3)} ${f1(y - 10 - i * 0.6)} l-1 -4 M${f1(x + 3)} ${f1(y - 10 - i * 0.6)} l1 -4" stroke="${OUT}" stroke-width="1.4" stroke-linecap="round"/>`);
    return `<path d="M2 92 Q20 66 34 80 Q30 88 40 94 Q34 102 40 110 Q20 116 2 92 Z" ${F('#3E9A47', 2.2)}/><path d="M12 80 L18 90 M22 74 L22 88" stroke="#2C7A36" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M2 92 Q20 94 36 102" fill="none" stroke="#2C7A36" stroke-width="2"/>
      <path d="M104 112 L102 118 M90 108 L88 114 M76 104 L74 110" ${N(3)}/>
      ${body}
      <circle cx="40" cy="70" r="22" ${F(seg)}/>
      <path d="M32 50 Q28 38 20 36 M48 50 Q52 38 60 36" ${N(2.4)}/><circle cx="20" cy="36" r="3" fill="${OUT}"/><circle cx="60" cy="36" r="3" fill="${OUT}"/>
      ${shine(32, 60, 6, 3.5, -20)}
      ${pair(40, 66, 8, 6, { brow: 'angry', bw: 3 })}
      <path d="M28 80 Q40 92 52 80 Q46 86 40 86 Q34 86 28 80 Z" ${F('#7A2340', 2.2)}/><path d="M34 81 L36 85 L38 81.5 M42 81.5 L44 85 L46 81" fill="#fff"/>`;
  }
  function hagelwolke(P, o, C) {
    const cl = C.lin('#AFC0DD', '#5E7096');
    const hail = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" ${F('#F2FAFF', 2)}/><circle cx="${f1(x - r * 0.35)}" cy="${f1(y - r * 0.35)}" r="${f1(r * 0.3)}" fill="#fff"/>`;
    return `${hail(26, 98, 5)}${hail(46, 110, 4.5)}${hail(72, 104, 5.5)}${hail(94, 112, 4)}${hail(100, 94, 3.5)}${hail(36, 118, 3)}
      <path d="M12 74 Q2 54 22 48 Q22 26 46 30 Q56 12 76 24 Q100 18 100 44 Q120 50 110 72 Q112 88 94 88 L28 88 Q10 88 12 74 Z" ${F(cl)}/>
      <path d="M20 80 Q40 72 60 80 Q80 72 102 80" fill="none" stroke="#4E5E82" stroke-width="3" stroke-linecap="round"/>
      ${shine(38, 40, 10, 5, -20)}${shine(76, 32, 6, 3, -10)}
      ${pair(60, 56, 14, 7.5, { brow: 'angry', bw: 3.6, dir: [0, 0.25] })}
      ${M.frown(60, 72, 9)}
      <path d="M92 86 L86 100 L94 98 L88 112" fill="none" stroke="#FFE066" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  function ackerteufel(P, o, C) {
    const red = C.grad('#E2463A'), soil = C.lin('#8A5E3A', '#5E3E22');
    return `<path d="M2 116 L2 106 Q60 96 118 106 L118 116 Z" ${F(soil)}/><path d="M14 108 Q60 100 106 108" fill="none" stroke="#4A3220" stroke-width="2"/>
      <path d="M84 96 Q110 96 108 70 Q106 56 98 50" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="M84 96 Q110 96 108 70 Q106 56 98 50" fill="none" stroke="#E2463A" stroke-width="3" stroke-linecap="round"/>
      <path d="M98 50 L90 44 L104 40 Z" ${F('#E2463A', 2.2)}/>
      <path d="M20 112 L20 22" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M20 112 L20 22" stroke="#A86B3A" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M10 26 L10 12 M20 24 L20 8 M30 26 L30 12 M10 26 Q20 32 30 26" ${N(3)}/>
      <path d="M40 106 Q34 74 60 70 Q86 74 80 106 Z" ${F(red)}/>
      <ellipse cx="60" cy="92" rx="11" ry="10" fill="#F0857A" opacity=".8"/>
      <path d="M46 106 L44 112 L50 112 Z M74 106 L76 112 L70 112 Z" fill="${OUT}"/>
      <path d="M100 104 L100 94 M100 98 Q94 92 92 96 Q96 100 100 98 M100 96 Q106 88 110 92 Q106 98 100 96" ${F('#4FB04F', 1.8)}/>
      <path d="M40 80 L24 66" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M40 80 L24 66" fill="none" stroke="#E2463A" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M38 34 Q30 18 36 8 Q42 22 48 28 Z M82 34 Q90 18 84 8 Q78 22 72 28 Z" ${F('#FFF1DC', 2.2)}/>
      <path d="M32 48 L18 40 L30 56 Z M88 48 L102 40 L90 56 Z" ${F(red)}/>
      <ellipse cx="60" cy="50" rx="28" ry="24" ${F(red)}/>
      ${shine(48, 36, 7, 3.5, -20)}
      ${pair(60, 46, 11, 6.5, { brow: 'angry', bw: 3.2, iris: '#FFC93C' })}
      <path d="M44 60 Q60 72 76 58" ${N(3)}/><path d="M68 62 L70 68 L72 61.5 Z" ${F('#fff', 1.4)}/>
      <path d="M54 72 Q60 80 66 72" fill="none" stroke="${OUT}" stroke-width="2"/>`;
  }
  function eierhaufen(P, o, C) {
    const egg = C.grad('#F7BE45');
    const e = (x, y, rx, ry, rot) => `<g transform="rotate(${rot || 0} ${x} ${y + ry})"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" ${F(egg)}/><circle cx="${f1(x + rx * 0.45)}" cy="${f1(y + ry * 0.5)}" r="1.2" fill="#D98A1E"/><circle cx="${f1(x - rx * 0.5)}" cy="${f1(y + ry * 0.2)}" r="1" fill="#D98A1E"/>${shine(f1(x - rx * 0.35), f1(y - ry * 0.45), f1(rx * 0.25), f1(ry * 0.16), -20)}</g>`;
    return `<path d="M4 110 Q60 94 116 110 Q60 122 4 110 Z" ${F('#3E9A47', 2.2)}/><path d="M12 109 Q60 102 108 109" fill="none" stroke="#2C7A36" stroke-width="2"/>
      ${e(44, 54, 12, 18, -8)}${e(76, 54, 12, 18, 8)}
      <path d="M66 46 L71 41 L76 47 L81 40 L86 45" fill="none" stroke="${OUT}" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="73" cy="41" r="2.4" fill="${OUT}"/><circle cx="80" cy="40" r="2.4" fill="${OUT}"/><circle cx="73.6" cy="40.4" r=".8" fill="#fff"/><circle cx="80.6" cy="39.4" r=".8" fill="#fff"/>
      ${e(28, 88, 14, 20, -10)}${pair(28, 86, 6, 4, { brow: 'angry', bw: 2.6 })}${M.cat(28, 96, 4.5)}
      ${e(92, 88, 14, 20, 10)}${pair(92, 86, 6, 4, { look: 'happy' })}${M.smile(92, 96, 4.5)}
      ${e(60, 82, 16, 23, 0)}${pair(60, 80, 7, 5, { brow: 'angry', bw: 3 })}${M.fangs(60, 92, 6)}`;
  }

  /* ---------- registry ---------- */
  const SHAPES = {
    fox, toad, bear, luther, potato,
    sumpfbrocken, regenwicht, streichholzkopf, krabbelstein, dornenigel, moorschlund,
    lavamolch, nebelqualle, ranklerin, nachtschwinge, glaspanzer, ofenwurm,
    frostblitz, dschungelbrueller, magmagolem, schattenwolf, sturmreiter, rechenkoenig,
    zweifler, vergesslicher, verwechsler, schwindler, richter, ablasshaendler,
    blattlaus, drahtwurm, wuehlmaus, faeulewolke, kaeferlarve: (P, o, C) => larve(P, o, C, false), kartoffelkaefer: (P, o, C) => kaefer(P, o, C, false),
    blattfresser, hagelwolke, ackerteufel, eierhaufen, riesenlarve: (P, o, C) => larve(P, o, C, true), kaeferkoenigin: (P, o, C) => kaefer(P, o, C, true),
  };
  // old shape names (saved games from before the redraw)
  const ALIAS = { blob: 'sumpfbrocken', drop: 'regenwicht', flame: 'streichholzkopf', rock: 'krabbelstein', hedgehog: 'dornenigel', newt: 'lavamolch', jelly: 'nebelqualle', vine: 'ranklerin', bat: 'nachtschwinge', beetle: 'kartoffelkaefer', dragon: 'ofenwurm', ghost: 'zweifler', king: 'rechenkoenig', merchant: 'ablasshaendler' };
  const HEROES = ['fox', 'toad', 'bear', 'luther', 'potato'];

  // the drawing code: the source of truth, used by tools/svg.js to bake art/monsters/raw/*.svg
  function render(shape, color, evo, cls, opts) {
    opts = opts || {};
    shape = SHAPES[shape] ? shape : ALIAS[shape] || 'sumpfbrocken';
    const id = opts.id || 'mg' + (uid++); const defs = []; let n = 0;
    const C = {
      grad(c) { const k = `${id}_${n++}`; defs.push(`<radialGradient id="${k}" cx="36%" cy="30%" r="80%">${CLASSIC ? `<stop offset="0" stop-color="${shade(c, 0.38)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -0.32)}"/>` : `<stop offset="0" stop-color="${shade(c, 0.42)}"/><stop offset=".5" stop-color="${c}"/><stop offset=".86" stop-color="${shade(c, -0.3)}"/><stop offset="1" stop-color="${shade(c, -0.14)}"/>`}</radialGradient>`); return `url(#${k})`; },
      lin(a, b) { const k = `${id}_${n++}`; defs.push(`<linearGradient id="${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`); return `url(#${k})`; },
      // counter-mirror glyphs on mirrored (enemy) sprites so „?“ stays readable
      glyph(x, svg) { return /\benemy\b/.test(cls || '') ? `<g transform="translate(${2 * x} 0) scale(-1 1)">${svg}</g>` : svg; },
    };
    const hero = HEROES.includes(shape);
    const e = hero ? Math.max(0, Math.min(2, evo || 0)) : 0;
    const elite = !hero && !!opts.elite, boss = !hero && (!!opts.boss || (!opts.elite && evo >= 1));
    LW = elite || boss ? 3 : 2.5; CLASSIC = CLASSIC_SHAPES.includes(shape);
    const P = { c: color };
    const body = SHAPES[shape](P, { evo: e, elite, boss }, C);
    LW = 2.5; CLASSIC = false;
    // heroes grow with each stage; normal enemies are a bit smaller than elites and bosses
    const k = hero ? [0.8, 0.9, 1][e] : elite || boss ? 1 : 0.88;
    let back = '', front = '';
    if (elite) back = `<path d="${burst(60, 64, 44, 60, 12)}" fill="#C2263F" opacity=".22"/><path d="${burst(60, 64, 44, 60, 12)}" fill="none" stroke="#E0304A" stroke-width="2" stroke-linejoin="round" opacity=".55"/>`;
    if (boss) back = `<circle cx="60" cy="62" r="58" fill="#FFC93C" opacity=".14"/><path d="${spikes(60, 62, 30, 60, -90, 270, 16)}" fill="#FFC93C" opacity=".22"/>`;
    if (hero && e === 1 && !opts.plain) front = spark(12, 22, 5) + spark(106, 30, 3.5);
    if (hero && e === 2 && !opts.plain) front = spark(10, 20, 6) + spark(110, 26, 4.5) + spark(16, 96, 3.5) + spark(106, 92, 4);
    const tf = k === 1 ? '' : ` transform="translate(${f1(60 * (1 - k))} ${f1(116 * (1 - k))}) scale(${k})"`;
    return `<svg class="mon ${cls || ''}" viewBox="0 0 120 120" aria-hidden="true"><defs>${defs.join('')}</defs>${back}<g${tf}>${body}</g>${front}</svg>`;
  }

  /* Baked art: build.py inlines the svgo-optimised files from art/monsters/svg/ as MONBAKED.
     Keys: hero "<shape>-<stage>", enemy "<shape>[-elite|-boss]", plus "-enemy" when the mirrored battle sprite differs. */
  const BAKED = typeof MONBAKED !== 'undefined' ? MONBAKED : null;
  function bakedKey(shape, evo, cls, opts) {
    opts = opts || {};
    shape = SHAPES[shape] ? shape : ALIAS[shape] || 'sumpfbrocken';
    if (HEROES.includes(shape)) return `${shape}-${Math.max(0, Math.min(2, evo || 0))}`;
    const boss = !!opts.boss || (!opts.elite && evo >= 1);
    return shape + (opts.elite ? '-elite' : boss ? '-boss' : '');
  }
  function monsterSVG(shape, color, evo, cls, opts) {
    if (BAKED) {
      const k = bakedKey(shape, evo, cls, opts), mirrored = /\benemy\b/.test(cls || '') && BAKED[k + '-enemy'] ? k + '-enemy' : k, svg = BAKED[mirrored];
      // ids are "m-<key>__…" in the file; make them unique per copy on the page
      if (svg) return svg.replace('<svg', `<svg class="mon ${cls || ''}"`).split(`m-${mirrored}__`).join(`m-${mirrored}-${uid++}__`);
    }
    return render(shape, color, evo, cls, opts);
  }
  return { monsterSVG, render, bakedKey, heroes: HEROES, shapes: Object.keys(SHAPES), shade };
})();
if (typeof module !== 'undefined') module.exports = MONART;
