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
  function along(p0, p1, p2, n, fn) {
    let s = '';
    for (let i = 0; i < n; i++) { const t = i / (n - 1), u = 1 - t; s += fn(u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1], i, t); }
    return s;
  }
  const qmark = (x, y, k, c) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-5 -5 Q-5 -12 1 -12 Q7 -12 7 -6 Q7 -2 2 0 Q0 1 0 4" fill="none" stroke="${c || '#FFE066'}" stroke-width="3.4" stroke-linecap="round"/><circle cx="0" cy="9.5" r="2.1" fill="${c || '#FFE066'}"/></g>`;

  function fox(P, o, C) {
    const e = o.evo;
    const base = ['#FF6A3D', '#F24B2A', '#FF8A1F'][e];
    const body = C.grad(base), cream = '#FFF1DC', gold = '#FFC93C', flameG = C.lin('#FFE066', base);
    let s = '';
    if (e === 2) { // sun corona
      s += `<path d="${spikes(60, 64, 38, 50, -60, 300, 12)}" ${F('#FF9A2E', 2)}/><path d="${spikes(60, 64, 38, 56, -75, 285, 12)}" ${F(gold, 2)}/>`;
    }
    const tailSmall = `<path d="M76 104 Q104 106 106 82 Q106 66 96 58 Q98 76 88 86 Q80 92 74 96 Z" ${F(body)}/><path d="M96 58 Q107 64 106 80 Q99 72 92 70 Q97 66 96 58 Z" fill="#FFE066" ${S(2)}/>`;
    const tailFlame = `<path d="M74 104 Q112 106 110 74 Q114 58 102 42 Q102 56 96 60 Q100 46 90 34 Q92 58 84 70 Q76 82 72 96 Z" ${F(flameG)}/><path d="M80 98 Q100 96 100 78 Q100 70 96 66 Q94 78 86 84 Z" fill="#FFF3B0" opacity=".85"/>`;
    if (e === 0) s += tailSmall;
    if (e === 1) s += tailFlame;
    if (e === 2) s += [-34, -12, 10].map((r) => `<g transform="rotate(${r} 74 100)">${tailFlame}</g>`).join('');
    s += `<path d="M38 114 Q32 92 44 82 L76 82 Q88 92 82 114 Z" ${F(body)}/>`;
    s += `<path d="M46 86 Q60 96 74 86 L71 93 L75 98 L67 100 L60 107 L53 100 L45 98 L49 93 Z" fill="${cream}"/>`;
    s += `<ellipse cx="47" cy="112" rx="8" ry="4.5" ${F(cream, 2.2)}/><ellipse cx="73" cy="112" rx="8" ry="4.5" ${F(cream, 2.2)}/><path d="M45 110 L45 114 M49 110 L49 114 M71 110 L71 114 M75 110 L75 114" fill="none" stroke="#D9B48A" stroke-width="1.4" stroke-linecap="round"/>`;
    if (e >= 1) s += `<circle cx="12" cy="62" r="2.2" fill="#FFB23F"/><circle cx="18" cy="48" r="1.5" fill="#FFE066"/><circle cx="108" cy="50" r="1.8" fill="#FFB23F"/>`;
    s += `<path d="M30 52 L22 12 L54 38 Z" ${F(body)}/><path d="M33 45 L28 22 L46 37 Z" fill="${e === 2 ? gold : '#7A2A2A'}" opacity=".85"/>`;
    s += `<path d="M90 52 L98 12 L66 38 Z" ${F(body)}/><path d="M87 45 L92 22 L74 37 Z" fill="${e === 2 ? gold : '#7A2A2A'}" opacity=".85"/>`;
    if (e >= 1) { // flame ear tips
      s += `<path d="M22 18 Q14 10 19 1 Q22 8 27 9 Q30 14 24 20 Z" ${F(flameG, 2)}/><path d="M98 18 Q106 10 101 1 Q98 8 93 9 Q90 14 96 20 Z" ${F(flameG, 2)}/>`;
    }
    if (e >= 1) s += `<path d="M30 66 L12 70 L26 76 L14 84 L34 84 Z" ${F(cream, 2.2)}/><path d="M90 66 L108 70 L94 76 L106 84 L86 84 Z" ${F(cream, 2.2)}/>`;
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
    s += `<path d="M26 98 L58 102 L58 116 L26 112 Z" ${F('#FFF8E6', 2.2)}/><path d="M94 98 L62 102 L62 116 L94 112 Z" ${F('#FFF8E6', 2.2)}/><path d="M58 102 Q60 100 62 102 L62 116 Q60 114 58 116 Z" ${F('#8B2E2E', 2)}/>`;
    s += `<path d="M32 104 L52 106 M32 108 L52 110 M68 106 L88 104 M68 110 L88 108" fill="none" stroke="#9AA3C2" stroke-width="1.6" stroke-linecap="round"/>`;
    s += `<ellipse cx="30" cy="104" rx="6" ry="5" ${F(skin, 2)}/><ellipse cx="90" cy="104" rx="6" ry="5" ${F(skin, 2)}/>`;
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

  // irregular pebble around (x, y); k picks one of a few outlines so neighbours differ
  function bau_stone(x, y, r, fill, k) {
    const J = [[1, 0.8, 1.05, 0.9, 1, 0.85], [0.9, 1.05, 0.8, 1, 0.92, 1], [1.05, 0.9, 1, 0.8, 1.05, 0.95]][k % 3];
    const d = J.map((j, i) => { const a = (i / 6) * Math.PI * 2 + k; return `${i ? 'L' : 'M'}${f1(x + r * j * Math.cos(a))} ${f1(y + r * j * 0.8 * Math.sin(a))}`; }).join(' ');
    return `<path d="${d} Z" ${F(fill, 2)}/>`;
  }
  // serrated nettle leaf, base at (x, y), pointing up before rotation
  function bau_leaf(x, y, l, w, rot, fill) {
    const n = 5; let R = '', L = '';
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1), ww = w * Math.sin(Math.PI * Math.pow(t, 0.8)), tn = (i + 0.5) / (n + 1), wn = w * 0.78 * Math.sin(Math.PI * Math.pow(tn, 0.8));
      R += ` L${f1(ww)} ${f1(-l * t)} L${f1(wn)} ${f1(-l * tn)}`;
      L = ` L${f1(-wn)} ${f1(-l * tn)} L${f1(-ww)} ${f1(-l * t)}` + L;
    }
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0${R} L0 ${-l}${L} Z" ${F(fill, 2)}/><path d="M0 -2 L0 ${f1(-l * 0.8)}" fill="none" stroke="#C9F0A8" stroke-width="1.4" stroke-linecap="round" opacity=".8"/></g>`;
  }
  // small three-lobed ivy leaf, base at (x, y)
  function bau_ivy(x, y, k, rot, fill) {
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})"><path d="M0 0 Q-6 -2 -10 -4 Q-14 -10 -8 -12 Q-6 -18 0 -20 Q6 -18 8 -12 Q14 -10 10 -4 Q6 -2 0 0 Z" ${F(fill, 2 / k)}/><path d="M0 -1 L0 -14 M0 -4 L-6 -9 M0 -4 L6 -9" fill="none" stroke="#B9E8A0" stroke-width="${f1(1.2 / k)}" stroke-linecap="round"/></g>`;
  }

  function owl(P, o, C) {
    const e = o.evo;
    const base = ['#9C8466', '#A8693A', '#8E5E34'][e];
    const body = C.grad(base), wing = C.grad(shade(base, -0.2)), belly = ['#EDE2CC', '#F0D9B5', '#F2D2A2'][e], dk = shade(base, -0.4), disc = ['#E4D6BC', '#E9C9A0', '#EBC08C'][e];
    let s = '';
    if (e >= 1) s += `<path d="M98 10 A14 14 0 1 0 110 30 A11 11 0 1 1 98 10 Z" ${F('#FFE79A', 2)}/>`;
    if (e === 2) s += `<path d="M36 40 Q26 22 18 2 Q26 10 30 8 Q34 18 52 30 Z" ${F(body)}/><path d="M84 40 Q94 22 102 2 Q94 10 90 8 Q86 18 68 30 Z" ${F(body)}/><path d="M36 32 Q30 22 26 14 M84 32 Q90 22 94 14" fill="none" stroke="${dk}" stroke-width="2.2" stroke-linecap="round"/>`;
    // wings: folded on the small owls, half spread on the eagle-owl
    if (e === 2) s += `<path d="M30 60 Q4 62 2 96 Q14 90 16 100 Q24 92 28 102 Q32 94 36 98 Z" ${F(wing)}/><path d="M90 60 Q116 62 118 96 Q106 90 104 100 Q96 92 92 102 Q88 94 84 98 Z" ${F(wing)}/>`;
    else s += `<path d="M28 62 Q12 76 18 104 Q26 102 34 92 Z" ${F(wing)}/><path d="M92 62 Q108 76 102 104 Q94 102 86 92 Z" ${F(wing)}/>`;
    s += `<path d="M24 64 Q22 28 60 26 Q98 28 96 64 Q98 100 80 110 L40 110 Q22 100 24 64 Z" ${F(body)}/>`;
    s += shine(40, 38, 9, 4.5, -25);
    s += `<path d="M40 76 Q60 70 80 76 Q86 96 72 108 L48 108 Q34 96 40 76 Z" fill="${belly}"/>`;
    // plumage: Steinkauz dots, Waldkauz chevrons, Uhu streaks
    if (e === 0) s += [[34, 40], [44, 34], [76, 34], [86, 40], [30, 50], [90, 50], [48, 88], [60, 96], [72, 88], [54, 102], [66, 102]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#fff" opacity=".9"/>`).join('');
    if (e === 1) s += [[52, 86], [68, 86], [60, 96], [50, 102], [70, 102]].map(([x, y]) => `<path d="M${x - 4} ${y - 2} L${x} ${y + 2} L${x + 4} ${y - 2}" fill="none" stroke="${dk}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    if (e === 2) s += [[50, 82, 9], [60, 86, 11], [70, 82, 9], [54, 97, 8], [66, 97, 8]].map(([x, y, l]) => `<path d="M${x} ${y} Q${x + 2.4} ${y + l * 0.6} ${x} ${y + l} Q${x - 2.4} ${y + l * 0.6} ${x} ${y} Z" fill="${dk}"/>`).join('');
    // facial disc
    s += `<path d="M60 46 Q50 36 40 39 Q27 44 29 58 Q32 72 46 72 Q55 72 60 66 Q65 72 74 72 Q88 72 91 58 Q93 44 80 39 Q70 36 60 46 Z" fill="${disc}" ${S(2)}/>`;
    if (e === 0) s += `<path d="M36 44 Q46 38 56 46 M84 44 Q74 38 64 46" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>`;
    s += pair(60, 56, 14, 9, { iris: ['#F5C928', '#7A4A2A', '#FF8A1F'][e], dir: [0, 0.1], brow: e === 2 ? 'up' : null, bw: 2.6 });
    s += `<path d="M55 64 Q60 62 65 64 L60 74 Z" ${F('#F2B33D', 2)}/>`;
    s += `<path d="M44 108 L40 115 M48 109 L48 116 M52 108 L56 115 M68 108 L64 115 M72 109 L72 116 M76 108 L80 115" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M44 108 L40 115 M48 109 L48 116 M52 108 L56 115 M68 108 L64 115 M72 109 L72 116 M76 108 L80 115" fill="none" stroke="#F2B33D" stroke-width="2.4" stroke-linecap="round"/>`;
    if (e === 0) s += blush(60, 70, 24, 4.5);
    return s;
  }

  function beaver(P, o, C) {
    const e = o.evo;
    const fur = ['#9A6438', '#8C5A32', '#7E502C'][e];
    const body = C.grad(fur), muz = '#E9C79C', hat = C.grad(e === 2 ? '#FFD84A' : '#FFC93C'), tail = C.grad('#6B5648');
    let s = '';
    s += `<path d="M78 100 Q96 74 112 82 Q120 92 108 108 Q98 116 82 112 Z" ${F(tail)}/><path d="M90 92 L108 98 M86 100 L104 108 M98 82 L94 110 M106 86 L102 108" fill="none" stroke="#4A3A30" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`;
    if (e === 2) s += `<path d="M14 104 L34 66" fill="none" stroke="${OUT}" stroke-width="13" stroke-linecap="round"/><path d="M14 104 L34 66" fill="none" stroke="#5FA8E8" stroke-width="9" stroke-linecap="round"/><ellipse cx="34" cy="66" rx="5" ry="3" fill="#E6F3FF" ${S(2)} transform="rotate(-62 34 66)"/><path d="M18 92 L26 77" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;
    s += `<path d="M30 112 Q24 84 42 74 L78 74 Q96 84 90 112 Z" ${F(body)}/>`;
    s += `<ellipse cx="60" cy="96" rx="17" ry="13" fill="${muz}"/>`;
    if (e >= 1) { // high-vis vest
      s += `<path d="M34 78 Q42 74 50 76 L54 112 L32 112 Q28 92 34 78 Z M86 78 Q78 74 70 76 L66 112 L88 112 Q92 92 86 78 Z" ${F('#FF8A1F', 2.2)}/>`;
      s += `<path d="M32 96 L53 98 M33 104 L54 106 M88 96 L67 98 M87 104 L66 106" fill="none" stroke="#E8F2FF" stroke-width="3.2" stroke-linecap="square"/>`;
    }
    s += `<ellipse cx="45" cy="112" rx="10" ry="4.5" ${F('#5A3A22', 2.2)}/><ellipse cx="75" cy="112" rx="10" ry="4.5" ${F('#5A3A22', 2.2)}/>`;
    // folding ruler, zigzag of yellow segments with ticks
    const rp = 'M80 96 L104 80 L92 64 L112 50';
    s += `<path d="${rp}" fill="none" stroke="${OUT}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><path d="${rp}" fill="none" stroke="#FFE066" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += along([80, 96], [92, 88], [104, 80], 5, (x, y) => `<path d="M${f1(x)} ${f1(y)} l-1.5 -2.2" stroke="${OUT}" stroke-width="1.2"/>`) + along([92, 64], [102, 57], [112, 50], 4, (x, y) => `<path d="M${f1(x)} ${f1(y)} l-1.5 -2.2" stroke="${OUT}" stroke-width="1.2"/>`);
    s += `<circle cx="104" cy="80" r="1.6" fill="#B8C0CC"/><circle cx="92" cy="64" r="1.6" fill="#B8C0CC"/>`;
    s += `<ellipse cx="80" cy="96" rx="6" ry="5" ${F(body, 2.2)}/>`;
    s += `<ellipse cx="38" cy="92" rx="6" ry="5" ${F(body, 2.2)}/>`;
    s += `<circle cx="34" cy="46" r="7" ${F(body)}/><circle cx="86" cy="46" r="7" ${F(body)}/><circle cx="34" cy="46" r="3" fill="#5A3A22"/><circle cx="86" cy="46" r="3" fill="#5A3A22"/>`;
    s += `<ellipse cx="60" cy="58" rx="28" ry="24" ${F(body)}/>`;
    s += shine(44, 50, 7, 3.5, -20);
    s += `<ellipse cx="60" cy="72" rx="15" ry="10" fill="${muz}"/>`;
    s += `<path d="M53 64 Q60 60 67 64 Q66 69 60 70 Q54 69 53 64 Z" fill="${OUT}"/><circle cx="57" cy="64" r="1.3" fill="#fff" opacity=".7"/>`;
    s += M.buck(60, 73, 8);
    s += `<circle cx="49" cy="72" r="1" fill="#8A6A4A"/><circle cx="46" cy="75" r="1" fill="#8A6A4A"/><circle cx="71" cy="72" r="1" fill="#8A6A4A"/><circle cx="74" cy="75" r="1" fill="#8A6A4A"/>`;
    s += pair(60, 54, 11, 6, { iris: e === 2 ? '#6B8E3A' : null, brow: e ? 'up' : null, bw: 2.4 });
    // hard hat with a ridge; the foreman's has a lamp
    if (!o.bare) s += `<path d="M32 42 Q30 16 60 15 Q90 16 88 42 Z" ${F(hat)}/><path d="M54 16 Q60 14 66 16 L66 41 L54 41 Z" fill="#E0A52A" opacity=".8"/><path d="M54 16 L54 41 M66 16 L66 41" fill="none" stroke="${OUT}" stroke-width="1.6"/>`;
    if (!o.bare) s += `<path d="M24 42 Q60 36 96 42 Q99 47 92 47 L28 47 Q21 47 24 42 Z" ${F(hat)}/>` + shine(42, 24, 6, 3, -25);
    if (e === 2 && !o.bare) s += `<rect x="52" y="22" width="16" height="11" rx="4" ${F('#5A6070', 2)}/><circle cx="60" cy="27.5" r="4" fill="#FFF3B0" ${S(1.6)}/><path d="M46 20 L40 14 M74 20 L80 14 M60 16 L60 8" stroke="#FFE066" stroke-width="2.4" stroke-linecap="round"/>`;
    if (e === 0) s += blush(60, 66, 21, 4);
    return s;
  }

  function moertelbatzen(P, o, C) {
    const mud = C.grad('#A9AEB7'), grain = '#7F8590';
    return `<ellipse cx="60" cy="110" rx="50" ry="6" fill="#8A909A" opacity=".55"/>
      <path d="M98 22 L82 40" fill="none" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="M98 22 L82 40" fill="none" stroke="#C98B4E" stroke-width="5" stroke-linecap="round"/>
      <path d="M84 40 L76 48" ${N(3)}/><path d="M58 50 L74 26 L92 38 L76 56 Z" ${F(C.lin('#E4E9F0', '#9AA3B2'), 2.4)}/>
      <path d="M14 108 Q8 92 20 84 Q14 68 30 62 Q30 46 48 44 Q56 32 70 40 Q86 40 88 56 Q104 62 100 80 Q112 90 104 108 Z" ${F(mud)}/>
      <path d="M30 62 Q42 66 48 58 M88 56 Q80 62 82 70" fill="none" stroke="${grain}" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 84 Q16 94 20 100 M104 92 Q108 98 106 104" fill="none" stroke="#C6CBD3" stroke-width="3" stroke-linecap="round"/>
      ${shine(38, 56, 7, 4, -25)}
      ${[[28, 96], [40, 102], [86, 98], [94, 88], [72, 104], [52, 52], [80, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5" fill="${grain}"/>`).join('')}
      <path d="M8 74 Q4 68 10 66 Q14 70 8 74 Z M110 66 Q116 62 116 70 Q112 72 110 66 Z M18 54 Q14 50 18 48 Q22 50 18 54 Z" ${F('#B9BEC6', 1.8)}/>
      ${pair(58, 78, 13, 7.5, { lid: '#9DA3AD', lidRot: 14, lidY: -0.2, dir: [0.1, 0.25] })}
      ${M.frown(58, 95, 8)}`;
  }

  function schweissfunke(P, o, C) {
    const fl = C.lin('#FFE066', '#FF6A3D'), core = C.grad('#FFB23F');
    let s = `<ellipse cx="60" cy="112" rx="26" ry="4" fill="#FF8A3D" opacity=".35"/>`;
    s += `<path d="M16 30 L28 38 M104 26 L92 36 M10 74 L22 72 M110 78 L98 74 M30 104 L38 96 M92 104 L84 96" fill="none" stroke="#FF8A1F" stroke-width="3" stroke-linecap="round"/>`;
    s += spark(14, 28, 5, '#FFE066') + spark(106, 22, 4, '#FFB23F') + spark(8, 76, 3.5, '#FFB23F') + spark(112, 80, 4.5, '#FFE066') + spark(28, 106, 3, '#FFE066') + spark(94, 106, 3.5, '#FFB23F');
    s += `<path d="${burst(60, 64, 30, 50, 9)}" ${F(fl)}/>`;
    s += `<path d="${burst(60, 64, 24, 36, 9)}" fill="#FFF3B0" opacity=".85"/>`;
    s += `<circle cx="60" cy="66" r="24" ${F(core)}/>`;
    s += shine(50, 54, 6, 3, -25);
    // welding goggles pushed up on the forehead
    s += `<path d="M36 50 Q60 40 84 50" fill="none" stroke="${OUT}" stroke-width="5"/><path d="M36 50 Q60 40 84 50" fill="none" stroke="#5A4A3A" stroke-width="2.4"/>`;
    s += `<circle cx="50" cy="46" r="7" ${F('#2E6B5A', 2.4)}/><circle cx="70" cy="46" r="7" ${F('#2E6B5A', 2.4)}/><path d="M46 43 L49 40 M66 43 L69 40" stroke="#9FE0C8" stroke-width="2" stroke-linecap="round"/><path d="M57 46 L63 46" ${N(2.4)}/>`;
    s += pair(60, 64, 10, 6, { brow: 'angry', bw: 3, iris: '#E0581E' });
    s += M.grin(60, 76, 7);
    return s;
  }

  function schotterhaufen(P, o, C) {
    const pile = C.grad('#A39C90'), g = ['#B8B2A6', '#8E887C', '#C9C2B4', '#9AA1AE', '#7C766C'];
    let s = `<ellipse cx="60" cy="110" rx="54" ry="6" fill="#6E675C" opacity=".6"/>`;
    s += `<path d="M8 110 Q12 80 30 62 Q44 38 60 36 Q76 38 90 62 Q108 80 112 110 Z" ${F(pile)}/>`;
    s += shine(42, 56, 8, 4, -30);
    s += [[50, 46, 6], [70, 46, 5], [60, 35, 6.5], [32, 66, 5], [88, 66, 5.5], [40, 54, 4.5], [80, 56, 4], [24, 90, 6], [96, 92, 5.5], [16, 104, 5], [104, 106, 5.5], [34, 104, 4.5], [88, 106, 4.5]].map(([x, y, r], i) => bau_stone(x, y, r, g[i % 5], i)).join('');
    s += [[44, 94], [72, 100], [56, 104], [30, 82], [92, 84]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#6E675C"/>`).join('');
    s += bau_stone(4, 112, 3.5, g[1], 2) + bau_stone(114, 100, 3, g[0], 1) + `<path d="M118 92 q-4 -3 -8 -1" fill="none" stroke="${OUT}" stroke-width="1.6" stroke-linecap="round"/>`;
    s += pair(60, 72, 12, 7.5, { lid: '#8E887C', lidRot: -6, lidY: -0.35, dir: [-0.15, 0.15] });
    s += M.smirk(60, 90, 9);
    return s;
  }

  function pfuetzenmolch(P, o, C) {
    const skin = C.grad('#3E8FD6'), belly = '#FF9A3D', spot = '#FFB23F';
    let s = `<ellipse cx="60" cy="104" rx="54" ry="12" ${F(C.lin('#BFE6FF', '#5BB4FF'), 2.2)}/>`;
    s += `<ellipse cx="60" cy="104" rx="40" ry="7" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/><path d="M14 102 Q20 98 26 102 M94 108 Q100 104 106 108" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
    // tail with a wavy crest, curled up behind
    s += `<path d="M74 98 Q98 98 104 80 Q108 64 96 56 Q100 50 108 52 Q116 60 114 78 Q110 104 76 104 Z" ${F(skin)}/>`;
    s += `<path d="M96 56 Q100 50 108 52 L110 46 L114 54 L118 52 L116 62" ${F('#2E6FB0', 2)}/>`;
    s += `<ellipse cx="66" cy="94" rx="26" ry="12" ${F(skin)}/>`;
    s += `<path d="M44 98 L36 104 M40 102 L34 100 M40 102 L38 108 M84 98 L92 104 M88 102 L94 100 M88 102 L90 108" fill="none" stroke="${OUT}" stroke-width="4.5" stroke-linecap="round"/><path d="M44 98 L36 104 M40 102 L34 100 M40 102 L38 108 M84 98 L92 104 M88 102 L94 100 M88 102 L90 108" fill="none" stroke="#3E8FD6" stroke-width="2" stroke-linecap="round"/>`;
    s += [[70, 88, 3], [82, 92, 2.4], [98, 86, 2.4], [104, 72, 2], [58, 90, 2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${F(spot, 1.4)}/>`).join('');
    s += `<ellipse cx="46" cy="72" rx="26" ry="18" ${F(skin)}/>`;
    s += `<path d="M28 80 Q46 92 64 80 Q60 88 46 89 Q32 88 28 80 Z" fill="${belly}" opacity=".9"/>`;
    s += shine(36, 62, 7, 3.5, -20);
    s += `<circle cx="34" cy="56" r="9" ${F(skin)}/><circle cx="58" cy="56" r="9" ${F(skin)}/>`;
    s += pair(46, 56, 12, 6.5, { dir: [-0.2, 0.1] });
    s += M.tongue(46, 76, 10);
    s += `<circle cx="38" cy="70" r="1.2" fill="${OUT}"/><circle cx="54" cy="70" r="1.2" fill="${OUT}"/>`;
    return s;
  }

  function brennnesselwall(P, o, C) {
    const lf = C.grad('#4E9F3D'), lf2 = C.grad('#3D8A34'), brick = C.grad('#C0603A');
    let s = `<ellipse cx="60" cy="112" rx="56" ry="5" fill="#5B4A2E" opacity=".6"/>`;
    // leaves fanned out behind
    s += [[-62, 18, 72], [-40, 30, 54], [-18, 44, 44], [18, 76, 44], [40, 90, 54], [62, 102, 72]].map(([r, x, y], i) => bau_leaf(x, y + 30, 40, 12, r, i % 2 ? lf : lf2)).join('');
    s += bau_leaf(60, 50, 44, 14, 0, lf) + bau_leaf(44, 54, 38, 12, -22, lf2) + bau_leaf(76, 54, 38, 12, 22, lf2);
    // the wall: a hedge of nettles on a brick footing
    s += `<path d="M10 100 L10 62 Q10 52 22 50 Q40 44 60 46 Q80 44 98 50 Q110 52 110 62 L110 100 Z" ${F(lf)}/>`;
    s += shine(26, 58, 7, 3.5, -20);
    s += `<path d="M18 66 l-4 -3 M22 80 l-5 1 M100 70 l5 -2 M102 86 l5 2 M30 52 l-2 -4 M90 52 l2 -4 M60 46 l0 -4" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>`;
    s += `<path d="M24 92 L32 84 L40 92 L48 84 L56 92 L64 84 L72 92 L80 84 L88 92 L96 84" fill="none" stroke="#2F6E2A" stroke-width="2" stroke-linejoin="round" opacity=".7"/>`;
    s += `<path d="M28 60 Q24 72 30 80 M94 60 Q98 72 92 80" fill="none" stroke="#CDE88A" stroke-width="3" stroke-dasharray="1 4" stroke-linecap="round"/>`;
    s += `<rect x="6" y="98" width="108" height="16" rx="2" ${F(brick)}/><path d="M6 106 L114 106 M24 98 L24 106 M48 98 L48 106 M72 98 L72 106 M96 98 L96 106 M14 106 L14 114 M36 106 L36 114 M60 106 L60 114 M84 106 L84 114 M106 106 L106 114" fill="none" stroke="#8A3E22" stroke-width="1.6"/>`;
    s += pair(60, 66, 15, 8, { brow: 'angry', bw: 3.6, iris: '#C9E04A' });
    s += M.fangs(60, 84, 11);
    return s;
  }

  function mischtrommel(P, o, C) {
    const drum = C.grad('#F28C28'), steel = C.grad('#8C95A6'), mortar = C.grad('#A9AEB7');
    let s = `<ellipse cx="60" cy="112" rx="52" ry="5" fill="#5B4A2E" opacity=".5"/>`;
    s += `<path d="M36 98 L52 64 L72 64 L92 98" fill="none" stroke="${OUT}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><path d="M36 98 L52 64 L72 64 L92 98" fill="none" stroke="#6B7384" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += `<rect x="14" y="94" width="92" height="8" rx="3" ${F(steel)}/>`;
    s += `<circle cx="28" cy="104" r="10" ${F('#2E3140')}/><circle cx="28" cy="104" r="4" ${F('#B8C0CC', 2)}/><circle cx="92" cy="104" r="10" ${F('#2E3140')}/><circle cx="92" cy="104" r="4" ${F('#B8C0CC', 2)}/>`;
    // drum tilted up toward the opening; spiral stripes
    s += `<g transform="rotate(-22 60 58)">`;
    s += `<path d="M10 60 Q8 28 44 24 Q76 22 100 40 L100 80 Q76 98 44 96 Q8 92 10 60 Z" ${F(drum)}/>`;
    s += `<path d="M30 26 Q22 60 32 94 M54 23 Q46 60 56 96 M78 29 Q70 60 80 90" fill="none" stroke="#B9531A" stroke-width="4" stroke-linecap="round" opacity=".75"/>`;
    s += `<path d="M14 46 Q10 60 14 74" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/>`;
    s += `<ellipse cx="100" cy="60" rx="8" ry="20" ${F('#C9601A')}/><ellipse cx="101" cy="60" rx="5" ry="15" ${F(mortar, 2)}/>`;
    s += `</g>`;
    s += `<path d="M104 26 Q116 30 114 44 Q112 52 108 46 Q106 40 100 40 Z" ${F(mortar, 2.2)}/><path d="M112 50 Q114 58 110 60 Q106 58 110 52 Z" ${F(mortar, 2)}/>`;
    s += shine(30, 44, 8, 4, -40);
    s += pair(50, 54, 13, 8, { brow: 'angry', bw: 3.8, iris: '#7A4A2A' });
    s += M.roar(50, 72, 12, 12);
    return s;
  }

  function kabelnatter(P, o, C) {
    const cab = '#E0503A', plug = C.grad('#C2352C');
    const tube = (d, w) => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${cab}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#FFB49A" stroke-width="2.4" stroke-linecap="round" opacity=".7" transform="translate(-1 -2.5)"/>`;
    let s = `<ellipse cx="62" cy="110" rx="48" ry="6" fill="#5B4A2E" opacity=".45"/>`;
    // frayed copper end of the tail with a spark
    s += `<path d="M100 92 L110 86 M100 92 L112 92 M100 92 L108 98" fill="none" stroke="#D98A3A" stroke-width="2" stroke-linecap="round"/>${spark(114, 84, 4.5, '#FFE066')}`;
    s += tube('M100 92 Q114 104 92 108 Q60 114 30 106 Q14 100 28 94 Q60 86 86 92', 11);
    s += tube('M30 96 Q60 82 82 86 Q96 80 86 66 Q76 54 58 50', 11);
    s += `<rect x="96" y="89" width="7" height="6" rx="1.5" ${F('#3A3D4A', 1.8)} transform="rotate(30 100 92)"/>`;
    // head: a plug, prongs forward like a forked tongue
    s += `<rect x="6" y="34" width="16" height="4.5" rx="1.5" ${F('#E8C25A', 2)}/><rect x="6" y="45" width="16" height="4.5" rx="1.5" ${F('#E8C25A', 2)}/>`;
    s += `<path d="M20 30 Q22 24 40 22 L60 24 Q76 28 76 42 Q76 56 60 60 L40 62 Q22 60 20 54 Z" ${F(plug)}/>`;
    s += `<path d="M28 30 L28 54" fill="none" stroke="#8E241C" stroke-width="2.4" stroke-linecap="round"/>`;
    s += shine(44, 30, 8, 3, -8);
    s += spark(4, 30, 4, '#FFE066') + spark(10, 58, 3, '#FFB23F');
    s += pair(52, 38, 10, 6, { brow: 'angry', bw: 3, slit: true, iris: '#FFD23F' });
    s += M.smirk(48, 51, 7);
    return s;
  }

  function staubfahne(P, o, C) {
    const dust = C.lin('#F0E2C6', '#C7AE86'), dk = '#A88E66';
    let s = `<ellipse cx="54" cy="112" rx="40" ry="5" fill="#8A7454" opacity=".45"/>`;
    s += `<path d="M86 86 Q104 92 116 84 Q112 96 98 98 Q108 104 100 108 Q90 102 80 100 Z" ${F(dust, 2.2)}/>`;
    s += `<path d="M28 108 Q14 108 18 96 Q6 90 14 78 Q4 68 14 58 Q6 44 20 40 Q22 24 40 26 Q46 12 62 18 Q76 8 88 20 Q104 18 104 36 Q116 44 106 58 Q114 70 100 76 Q102 90 86 88 Q80 98 68 94 Q60 104 48 100 Q42 110 28 108 Z" ${F(dust)}/>`;
    s += `<path d="M24 50 Q34 40 46 46 M74 30 Q88 28 92 40 M22 84 Q30 90 40 86 M84 70 Q92 66 96 60" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;
    s += `<path d="M30 70 Q40 62 50 70 M66 82 Q78 78 84 84 M40 34 Q48 30 56 34" fill="none" stroke="${dk}" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>`;
    s += [[10, 30, 2], [112, 26, 2.4], [4, 96, 1.8], [116, 66, 1.6], [64, 6, 1.6], [24, 116, 1.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${dk}"/>`).join('');
    s += bau_stone(110, 110, 3.5, '#9A948A', 0) + bau_stone(8, 112, 3, '#B8B2A6', 1);
    s += pair(58, 56, 12, 7, { lid: '#D9C4A0', lidRot: -8, lidY: -0.1, dir: [-0.2, 0.15] });
    s += `<ellipse cx="58" cy="76" rx="5" ry="5.5" ${F('#7A2340', 2.4)}/>`;
    s += `<path d="M48 78 Q40 82 34 80 M50 84 Q44 90 36 90" fill="none" stroke="${dk}" stroke-width="2.4" stroke-linecap="round"/>`;
    return s;
  }

  function efeuranke(P, o, C) {
    const leaf = C.grad('#3F9A45'), small = C.grad('#4FB04F'), vine = '#6B4A2B';
    let s = `<ellipse cx="60" cy="112" rx="44" ry="5" fill="#5B4A2E" opacity=".5"/>`;
    // scaffold pipe the ivy climbs
    s += `<rect x="92" y="4" width="10" height="108" rx="3" ${F(C.lin('#C9D2E3', '#7E889A'))}/><rect x="88" y="30" width="18" height="9" rx="2.5" ${F('#9AA3B2', 2)}/><rect x="88" y="80" width="18" height="9" rx="2.5" ${F('#9AA3B2', 2)}/>`;
    const v = 'M60 100 Q60 110 50 112 M62 66 Q84 60 96 50 Q104 44 98 40 Q90 38 94 30 M58 76 Q34 80 22 66 Q14 56 20 46 M64 84 Q86 90 96 100 Q104 104 100 92';
    s += `<path d="${v}" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="${v}" fill="none" stroke="${vine}" stroke-width="3" stroke-linecap="round"/>`;
    s += bau_ivy(84, 58, 0.8, 30, small) + bau_ivy(100, 34, 0.7, 60, small) + bau_ivy(20, 46, 0.8, -20, small) + bau_ivy(28, 72, 0.7, -110, small) + bau_ivy(96, 96, 0.75, 80, small) + bau_ivy(84, 94, 0.6, 160, small);
    s += `<path d="M60 100 Q52 90 38 92 Q22 94 18 80 L28 74 Q14 64 16 48 L32 46 Q32 28 48 22 L56 32 Q60 18 60 14 Q60 18 64 32 L72 22 Q88 28 88 46 L104 48 Q106 64 92 74 L102 80 Q98 94 82 92 Q68 90 60 100 Z" ${F(leaf)}/>`;
    s += `<path d="M60 96 L60 30 M60 74 L30 56 M60 74 L90 56 M60 82 L32 84 M60 82 L88 84" fill="none" stroke="#9ED98A" stroke-width="2" stroke-linecap="round" opacity=".75"/>`;
    s += shine(40, 40, 7, 3.5, -30);
    s += pair(60, 58, 12, 7, { brow: 'flat', bw: 3, dir: [0.25, 0.1] });
    s += M.smirk(60, 76, 8);
    return s;
  }

  function rostkaefer(P, o, C) {
    const shell = C.grad('#B5602E'), iron = C.grad('#6E6A72'), rust = '#8A3E1C';
    let s = '';
    // antennae: screws with nuts
    s += `<path d="M48 30 Q40 16 30 10 M72 30 Q80 16 90 10" ${N(3)}/><path d="${burst(28, 9, 4, 6, 3)}" ${F('#9AA3B2', 1.8)}/><path d="${burst(92, 9, 4, 6, 3)}" ${F('#9AA3B2', 1.8)}/>`;
    // legs: bent nails
    const legs = 'M28 64 L10 54 L6 42 M26 82 L8 90 L6 104 M92 64 L110 54 L114 42 M94 82 L112 90 L114 104 M40 104 L32 116 M80 104 L88 116';
    s += `<path d="${legs}" fill="none" stroke="${OUT}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/><path d="${legs}" fill="none" stroke="#9AA3B2" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += [[6, 42], [6, 104], [114, 42], [114, 104]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2" ${F('#B8C0CC', 1.6)}/>`).join('');
    s += `<path d="M60 52 Q20 50 20 80 Q20 112 58 112 Z" ${F(shell)}/><path d="M60 52 Q100 50 100 80 Q100 112 62 112 Z" ${F(shell)}/>`;
    s += `<path d="M30 74 Q36 66 44 72 Q46 82 38 84 Q30 84 30 74 Z M76 90 Q84 84 90 92 Q88 100 80 100 Q74 96 76 90 Z M70 62 Q76 60 78 66 Q74 70 70 62 Z" fill="${rust}" opacity=".7"/>`;
    s += [[54, 60], [54, 72], [54, 84], [54, 96], [66, 60], [66, 72], [66, 84], [66, 96], [30, 96], [90, 68]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" ${F('#D9A070', 1.4)}/>`).join('');
    s += shine(34, 66, 4, 9, 10) + shine(86, 74, 3, 7, -10);
    s += `<path d="M24 98 l-3 6 M98 64 l4 -4" fill="none" stroke="#FF8A3D" stroke-width="2" stroke-linecap="round"/>`;
    s += `<path d="M34 56 Q34 42 60 40 Q86 42 86 56 Q86 62 60 62 Q34 62 34 56 Z" ${F(iron)}/>`;
    s += `<circle cx="44" cy="54" r="2" ${F('#B8C0CC', 1.2)}/><circle cx="76" cy="54" r="2" ${F('#B8C0CC', 1.2)}/><path d="M52 52 L68 52" fill="none" stroke="#4A4650" stroke-width="2" stroke-linecap="round"/>`;
    s += `<ellipse cx="60" cy="31" rx="20" ry="14" ${F(iron)}/>`;
    s += `<path d="M44 26 Q50 22 54 26" fill="none" stroke="${rust}" stroke-width="2" opacity=".7"/>`;
    s += pair(60, 29, 8.5, 5.5, { brow: 'angry', bw: 3.2, iris: '#FF8A3D' });
    s += `<path d="M50 39 L54 36 L58 39 L62 36 L66 39 L70 36" ${N(2)}/>`;
    return s;
  }

  function abrissbirne(P, o, C) {
    const ball = C.grad('#535A6B');
    let s = `<ellipse cx="60" cy="112" rx="50" ry="6" fill="#5B4A2E" opacity=".5"/>`;
    // swing lines and dust where it hit
    s += `<path d="M10 50 Q6 70 12 90 M18 44 Q12 66 18 88" fill="none" stroke="#9AA3B2" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M84 108 Q80 98 90 96 Q94 88 104 92 Q114 92 112 104 Q116 110 108 112 Z" ${F('#D9C4A0', 2)}/>`;
    s += `<rect x="96" y="76" width="12" height="7" rx="1.5" ${F('#C0603A', 2)} transform="rotate(-25 102 79)"/><rect x="108" y="90" width="9" height="6" rx="1.5" ${F('#C0603A', 2)} transform="rotate(20 112 93)"/>`;
    // chain from the crane
    s += [6, 16, 26].map((y, i) => i % 2 ? `<rect x="57" y="${y - 1}" width="6" height="12" rx="3" ${F('#9AA3B2', 2.2)}/>` : `<ellipse cx="60" cy="${y + 5}" rx="5" ry="7" fill="none" stroke="${OUT}" stroke-width="5.5"/><ellipse cx="60" cy="${y + 5}" rx="5" ry="7" fill="none" stroke="#B8C0CC" stroke-width="2.4"/>`).join('');
    s += `<path d="M52 44 Q52 32 60 32 Q68 32 68 44" fill="none" stroke="${OUT}" stroke-width="7"/><path d="M52 44 Q52 32 60 32 Q68 32 68 44" fill="none" stroke="#8C95A6" stroke-width="3.5"/>`;
    s += `<circle cx="60" cy="74" r="34" ${F(ball)}/>`;
    s += shine(46, 56, 10, 5, -35) + `<circle cx="40" cy="52" r="2.5" fill="#fff" opacity=".5"/>`;
    s += `<path d="M84 90 L76 86 L80 80 L74 76" fill="none" stroke="#2A2E3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += [[34, 82], [86, 64], [44, 98], [76, 100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" ${F('#7E8696', 1.4)}/>`).join('');
    s += pair(60, 70, 13, 8, { brow: 'angry', bw: 4, iris: '#FF8A1F' });
    s += M.grin(60, 86, 11);
    return s;
  }

  // thick outlined stroke (arm, leg, stick): dark outline under a coloured core
  const jm_limb = (d, col, w) => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${w + 4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

  function horse(P, o, C) {
    const e = o.evo;
    const coat = ['#C68A4E', '#F6EEE0', '#FFF8EE'][e], body = C.grad(coat), gold = '#FFC93C';
    const mane = ['#7A4A24', '#C0392B', gold][e], hoof = e ? gold : '#5A3A22', leg = e ? '#EDE2CF' : '#B57A42';
    let s = '';
    // the golden carousel pole runs right through the horse
    s += `<rect x="54" y="0" width="8" height="116" rx="3" ${F(C.lin('#FFE58A', '#D99A1E'), 2.2)}/>`;
    s += [6, 18, 30, 92, 104].map((y) => `<path d="M54.5 ${y + 6} L61.5 ${y}" stroke="#B9801A" stroke-width="2.2"/>`).join('');
    s += `<ellipse cx="58" cy="114" rx="30" ry="4" fill="${OUT}" opacity=".18"/>`;
    // tail
    s += `<path d="M30 64 Q12 62 8 78 Q6 92 14 100 Q16 88 22 82 Q20 94 28 98 Q26 84 32 74 Z" ${F(mane)}/>`;
    // far legs (darker), then near legs: galloping
    s += jm_limb('M42 80 L30 92 L22 92', shade(leg, -0.18), 6) + jm_limb('M80 78 L94 84 L96 94', shade(leg, -0.18), 6);
    s += jm_limb('M48 82 L46 100 L50 108', leg, 7) + jm_limb('M74 82 L82 96 L78 106', leg, 7);
    s += `<path d="M18 88 L24 86 L26 96 L19 97 Z M92 94 L100 92 L101 99 L94 100 Z M45 106 L53 105 L55 112 L46 113 Z M74 103 L82 103 L82 110 L74 111 Z" ${F(hoof, 2)}/>`;
    // body + neck
    s += `<path d="M28 70 Q28 54 48 54 L70 54 Q74 40 82 28 L100 42 Q92 52 88 66 Q90 86 66 88 L46 88 Q28 88 28 70 Z" ${F(body)}/>`;
    if (e === 0) s += `<path d="M36 64 Q48 60 60 64 M40 76 Q56 72 70 78 M76 46 Q80 40 84 36" fill="none" stroke="#9A6233" stroke-width="2" stroke-linecap="round"/><ellipse cx="66" cy="70" rx="3" ry="2" fill="#9A6233"/>`;
    else s += `<circle cx="38" cy="74" r="2.4" fill="#D9CBB4"/><circle cx="44" cy="80" r="1.8" fill="#D9CBB4"/><circle cx="34" cy="66" r="1.6" fill="#D9CBB4"/>`;
    s += shine(44, 61, 9, 3.5, -8);
    // saddle: bare wood → painted saddle and blanket → gold-trimmed saddle with jewels
    if (e === 0) s += `<path d="M46 56 Q58 62 70 56 L70 64 Q58 70 46 64 Z" ${F('#8E5A30', 2.2)}/>`;
    else {
      s += `<path d="M38 58 Q58 63 78 56 Q80 64 76 72 Q58 76 40 72 Q36 64 38 58 Z" ${F(e === 2 ? '#2E6FD8' : '#3B8FE0', 2.2)}/><path d="M41 69 Q58 73 75 68" fill="none" stroke="${gold}" stroke-width="2.6"/>`;
      s += [42, 49, 56, 63, 70].map((x) => `<path d="M${x} ${f1(73.6 - Math.abs(x - 58) * 0.08)} l2 4 l2 -4" ${F(gold, 1.4)}/>`).join('');
      s += `<path d="M42 48 Q46 56 58 57 Q70 56 74 47 L74 54 Q70 63 58 64 Q46 63 42 55 Z" ${F('#C0392B', 2.2)}/><path d="M48 54 Q58 50 66 54" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".5"/>`;
      if (e === 2) s += `<circle cx="58" cy="70" r="3.5" ${F('#E0304A', 1.6)}/><circle cx="57" cy="69" r="1" fill="#fff"/><circle cx="48" cy="68" r="2.4" ${F('#4FC96A', 1.4)}/><circle cx="68" cy="68" r="2.4" ${F('#4FC96A', 1.4)}/>`;
    }
    // stirrup
    s += `<path d="M58 66 L58 80" stroke="${OUT}" stroke-width="2"/><path d="M54 80 L62 80 L60 86 L56 86 Z" ${F(e ? gold : '#8E5A30', 1.8)}/>`;
    // head
    s += `<path d="M82 22 Q96 18 106 34 Q114 46 110 52 Q104 58 96 52 Q90 46 84 44 Q76 36 82 22 Z" ${F(body)}/>`;
    s += `<path d="M84 26 L82 12 L92 22 Z" ${F(body, 2.2)}/><path d="M85 22 L84 16 L89 21 Z" fill="${e ? '#F2A0B0' : '#8E5A30'}"/>`;
    // mane along the neck
    s += `<path d="M82 22 Q72 26 74 34 Q66 36 68 44 Q60 46 62 54 L70 54 Q74 40 82 30 Z" ${F(mane, 2.2)}/>`;
    if (e) s += `<path d="M76 30 Q72 34 74 38 M70 42 Q66 46 68 50" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".45"/>`;
    // bridle
    if (e) s += `<path d="M90 24 Q92 40 98 50 M88 40 Q98 38 108 42" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M90 24 Q92 40 98 50 M88 40 Q98 38 108 42" fill="none" stroke="${e === 2 ? gold : '#C0392B'}" stroke-width="2.6" stroke-linecap="round"/><circle cx="91" cy="40" r="2.6" ${F(gold, 1.4)}/>`;
    if (e === 2) s += `<path d="M86 22 Q80 6 92 2 Q90 10 96 12 Q94 18 88 22 Z" ${F('#E0304A', 2)}/><path d="M88 20 Q86 10 91 6" fill="none" stroke="#FF8FA0" stroke-width="1.6" stroke-linecap="round"/><circle cx="87" cy="22" r="3" ${F(gold, 1.6)}/>`;
    s += shine(92, 28, 5, 2.5, 30);
    s += `<ellipse cx="106" cy="46" rx="1.8" ry="2.4" fill="${OUT}"/><path d="M101 53 Q105 55 108 52" ${N(2)}/>`;
    s += eye(90, 34, 5, { dir: [0.3, 0.1], brow: e === 2 ? 'up' : null, bw: 2.2 });
    s += `<ellipse cx="96" cy="44" rx="3.6" ry="2.2" fill="#FF7A9A" opacity=".45"/>`;
    return s;
  }

  function schaustellerin(P, o, C) {
    const e = o.evo;
    const skin = C.grad('#F6CDA6'), jacket = '#D9343F', straw = C.lin('#F4D98A', '#D9AE4A'), hair = '#8A4A22', gold = '#FFC93C';
    let s = '';
    // jacket with candy stripes
    s += `<path d="M18 116 Q20 82 60 78 Q100 82 102 116 Z" ${F(C.grad(jacket))}/>`;
    s += [30, 42, 78, 90].map((x) => `<path d="M${x} ${x < 60 ? 116 : 116} Q${x + (x < 60 ? 2 : -2)} 96 ${x + (x < 60 ? 6 : -6)} 84" fill="none" stroke="#FFF3E6" stroke-width="4.5" stroke-linecap="round"/>`).join('');
    s += `<path d="M48 80 L60 100 L72 80 Z" ${F('#FFF8EE', 2)}/><path d="M54 84 L60 90 L66 84 L66 90 L60 87 L54 90 Z" ${F(e === 2 ? '#3B8FE0' : '#1C2541', 1.4)}/>`;
    s += `<circle cx="60" cy="104" r="2.2" ${F(gold, 1.2)}/><circle cx="60" cy="112" r="2.2" ${F(gold, 1.2)}/>`;
    if (e === 2) s += `<path d="${burst(80, 96, 3, 6.5, 5)}" ${F(gold, 1.6)}/>`;
    // roll of lottery tickets, a strip unrolling
    s += `<path d="M86 96 Q100 104 98 116 L108 116 Q110 100 94 90 Z" ${F('#FFD1DC', 2)}/><path d="M90 98 L98 94 M95 104 L104 101 M98 110 L107 108" stroke="#D9667E" stroke-width="1.4" stroke-dasharray="2 2"/>`;
    s += `<rect x="78" y="84" width="18" height="16" rx="3" ${F(e ? C.lin('#FFE58A', '#F2A93B') : C.lin('#FFF1A8', '#F2C94C'), 2.2)}/><ellipse cx="96" cy="92" rx="3.5" ry="8" ${F('#FFF1A8', 2)}/><circle cx="96" cy="92" r="1.6" fill="${OUT}"/>`;
    s += `<ellipse cx="80" cy="96" rx="6" ry="5" ${F(skin, 2)}/>`;
    if (e) s += `<path d="M24 98 L36 92 L42 104 L30 110 Z" ${F('#FFF1A8', 2)}/><path d="M28 96 L38 104" stroke="#D9AE4A" stroke-width="1.4" stroke-dasharray="2 2"/><ellipse cx="34" cy="104" rx="6" ry="5" ${F(skin, 2)}/>`;
    // head, hair, ears
    s += `<path d="M34 50 Q28 70 36 80 Q38 70 40 62 Z M86 50 Q92 70 84 80 Q82 70 80 62 Z" ${F(hair, 2.2)}/>`;
    s += `<ellipse cx="60" cy="56" rx="25" ry="26" ${F(skin)}/>`;
    s += `<path d="M36 46 Q44 38 60 40 Q76 38 84 46 Q84 38 78 34 L42 34 Q36 38 36 46 Z" ${F(hair, 2.2)}/>`;
    s += `<circle cx="36" cy="64" r="2.6" ${F(e ? gold : '#E0304A', 1.4)}/><circle cx="84" cy="64" r="2.6" ${F(e ? gold : '#E0304A', 1.4)}/>`;
    s += shine(47, 50, 6, 3.5, -20);
    // straw boater: flat crown, red band, wide brim
    if (!o.bare) s += `<path d="M44 34 L45 21 Q60 18 75 21 L76 34 Z" ${F(straw)}/><path d="M44.5 27 Q60 24 75.5 27 L76 33 Q60 30 44 33 Z" fill="#D9343F"/>`;
    if (!o.bare) s += `<ellipse cx="60" cy="21" rx="15" ry="3" ${F('#F7E3A0', 2)}/>`;
    if (!o.bare) s += `<path d="M24 36 Q60 26 96 36 Q98 40 90 40 Q60 34 30 40 Q22 40 24 36 Z" ${F(straw)}/><path d="M32 36 Q60 30 88 36" fill="none" stroke="#C99A2E" stroke-width="1.4"/>`;
    if (e >= 1 && !o.bare) s += `<g transform="translate(72 29)">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-3.6" rx="2.6" ry="3.6" ${F('#FFFFFF', 1.4)} transform="rotate(${r})"/>`).join('')}<circle r="2" ${F(gold, 1.2)}/></g>`;
    if (e === 2 && !o.bare) s += `<path d="M78 28 Q88 18 86 8 Q82 16 76 20 Z" ${F('#3B8FE0', 1.8)}/>`;
    s += pair(60, 57, 11, 5.5, { iris: '#4E8A3A', brow: 'up', bw: 2.4, dir: [0.15, 0.1] });
    s += `<path d="M60 61 Q58 67 61 68" ${N(2.2)}/>${M.grin(60, 72, 7)}`;
    s += blush(60, 67, 17, 4);
    return s;
  }

  function jahrmarktwespe(P, o, C) {
    const yel = C.grad('#FFC93C'), blk = '#2A2433', wing = C.lin('#F4FBFF', '#BFE3FF');
    let s = '';
    // candy floss she has stolen
    s += jm_limb('M34 86 L18 52', '#F4E6CC', 3);
    s += `<path d="M6 46 Q2 34 12 30 Q14 20 24 24 Q32 18 36 28 Q44 32 38 42 Q38 52 26 52 Q14 56 6 46 Z" ${F(C.grad('#FF9EC4'), 2.2)}/><path d="M12 38 Q16 32 22 34 M24 44 Q30 40 32 32" fill="none" stroke="#FFD3E6" stroke-width="2.4" stroke-linecap="round"/>`;
    // wings
    s += `<ellipse cx="72" cy="30" rx="14" ry="22" ${F(wing, 2.2)} opacity=".92" transform="rotate(28 72 30)"/><ellipse cx="90" cy="38" rx="11" ry="18" ${F(wing, 2.2)} opacity=".92" transform="rotate(52 90 38)"/>`;
    s += `<path d="M68 22 Q74 32 74 46 M86 34 Q90 40 92 48" fill="none" stroke="#9CC8E8" stroke-width="1.6" stroke-linecap="round"/>`;
    // legs
    s += `<path d="M58 84 L52 100 L46 104 M68 86 L68 104 L62 110 M78 84 L86 100 L84 108" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    // striped abdomen with stinger
    s += `<path d="M104 104 L114 112 L100 110 Z" ${F('#4A4458', 2)}/>`;
    s += `<g transform="rotate(32 84 86)"><ellipse cx="84" cy="86" rx="25" ry="17" ${F(yel)}/>`;
    s += `<path d="M72 70 Q66 86 72 102 L80 103 Q74 86 80 69 Z M88 69 Q82 86 88 103 L96 101 Q90 86 95 71 Z" fill="${blk}"/><path d="M104 76 Q108 86 104 96 Q100 86 100 76 Z" fill="${blk}"/>`;
    s += `<ellipse cx="84" cy="86" rx="25" ry="17" ${N()}/>${shine(80, 76, 8, 3, 0)}</g>`;
    // thorax and head
    s += `<ellipse cx="62" cy="76" rx="14" ry="12" ${F(C.grad('#4A4458'))}/>`;
    s += jm_limb('M52 78 L36 86', '#4A4458', 3.5);
    s += `<path d="M42 38 Q36 22 28 18 M58 36 Q62 20 72 14" ${N(2.6)}/><circle cx="28" cy="18" r="3" fill="${OUT}"/><circle cx="72" cy="14" r="3" fill="${OUT}"/>`;
    s += `<circle cx="48" cy="56" r="21" ${F(yel)}/>`;
    s += `<path d="M30 46 Q48 30 66 46 Q58 40 48 40 Q38 40 30 46 Z" fill="${blk}"/>`;
    s += shine(38, 48, 5, 3, -25);
    s += pair(48, 56, 9, 6, { brow: 'angry', bw: 3.2, iris: '#3C8A3A' });
    s += M.smirk(48, 68, 7);
    return s;
  }

  function bratwurstglut(P, o, C) {
    const wurst = C.grad('#C8562E'), coal = C.grad('#3A2E2E');
    let s = '';
    // glowing coals in the grill pan
    s += `<path d="M10 96 L110 96 L100 114 L20 114 Z" ${F(C.lin('#5A5560', '#2E2A33'))}/>`;
    s += `<path d="M18 100 Q60 108 102 100" fill="none" stroke="#FF8A2E" stroke-width="3" opacity=".7"/>`;
    // flames licking up
    s += `<path d="M18 96 Q12 82 22 72 Q22 82 28 84 Q28 74 36 68 Q34 82 40 96 Z M80 96 Q82 80 92 72 Q92 82 98 82 Q104 76 104 68 Q112 82 102 96 Z" ${F(C.lin('#FFE066', '#FF6A3D'), 2.2)}/>`;
    // the sausage, bent and grumpy
    s += `<path d="M30 90 Q22 50 46 30 Q60 20 76 26 Q90 32 86 46 Q80 54 72 50 Q58 50 56 70 Q56 84 58 90 Z" ${F(wurst)}/>`;
    s += `<path d="M28 88 Q24 92 30 94 Q56 96 62 94 Q66 90 60 88 Z" ${F('#A94422', 2.2)}/>`;
    s += `<path d="M38 56 L48 50 M36 70 L46 64 M40 82 L50 76 M66 32 L72 40 M78 30 L82 38" stroke="#6E2414" stroke-width="3" stroke-linecap="round"/>`;
    s += shine(36, 46, 4, 9, 20);
    s += `<path d="M44 34 Q54 24 66 26 Q74 30 76 24 Q84 28 80 34 Q72 34 62 32 Q52 34 46 40 Z" fill="#FFD23F" ${S(1.8)}/>`;
    // grill grate in front
    s += `<path d="M6 94 L114 94" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="M6 94 L114 94" stroke="#A3ABB8" stroke-width="2.6" stroke-linecap="round"/>`;
    s += [20, 34, 48, 62, 76, 90, 104].map((x) => `<path d="M${x} 90 L${x} 98" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>`).join('');
    s += `<circle cx="34" cy="106" r="5" ${F(coal, 1.8)}/><circle cx="58" cy="108" r="6" ${F(coal, 1.8)}/><circle cx="84" cy="106" r="5" ${F(coal, 1.8)}/><path d="M32 104 l3 2 M56 106 l4 2 M82 104 l3 2" stroke="#FF8A2E" stroke-width="2" stroke-linecap="round"/>`;
    // sizzle
    s += `<path d="M92 44 q6 -6 0 -12 q-6 -6 0 -12 M104 54 q5 -5 0 -10 q-5 -5 0 -10" fill="none" stroke="#C9CFDA" stroke-width="3" stroke-linecap="round" opacity=".85"/>`;
    s += spark(16, 60, 3.5, '#FFB23F') + spark(104, 70, 3, '#FFE066') + spark(26, 22, 2.6, '#FFB23F');
    s += pair(46, 62, 8, 6, { brow: 'angry', bw: 3.2, iris: '#FFB23F' });
    s += `<path d="M38 74 L44 78 L48 74 L52 78 L56 74" ${N(2.6)}/>`;
    return s;
  }

  function pfuetzenspritzer(P, o, C) {
    const water = C.grad('#3FA0FF'), lt = '#BFE6FF';
    let s = '';
    s += `<ellipse cx="60" cy="106" rx="56" ry="11" ${F(C.lin('#7CC4FF', '#2E7FD0'))}/><path d="M18 104 Q40 98 60 102 Q82 98 104 104" fill="none" stroke="${lt}" stroke-width="2.6" stroke-linecap="round"/>`;
    // flying droplets
    s += [[14, 54, 4], [20, 34, 3], [104, 44, 4.5], [108, 70, 3], [96, 22, 3], [8, 80, 3]].map(([x, y, r]) => `<path d="M${x} ${f1(y - r * 1.8)} Q${f1(x + r)} ${f1(y - r * 0.2)} ${f1(x + r)} ${y} A${r} ${r} 0 0 1 ${f1(x - r)} ${y} Q${f1(x - r)} ${f1(y - r * 0.2)} ${x} ${f1(y - r * 1.8)} Z" ${F(lt, 1.8)}/>`).join('');
    // splash crown
    s += `<path d="M24 100 Q20 64 30 40 Q34 54 38 48 Q42 30 50 22 Q52 40 58 36 Q64 18 72 22 Q72 40 78 40 Q86 30 90 38 Q92 50 96 52 Q102 70 96 100 Z" ${F(water)}/>`;
    s += `<path d="M34 60 Q30 74 34 88" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".55"/><circle cx="40" cy="50" r="2.6" fill="#fff" opacity=".6"/>`;
    s += `<circle cx="30" cy="34" r="3" ${F(lt, 1.6)}/><circle cx="50" cy="14" r="3.5" ${F(lt, 1.6)}/><circle cx="74" cy="12" r="2.6" ${F(lt, 1.6)}/><circle cx="92" cy="30" r="2.6" ${F(lt, 1.6)}/>`;
    // little arms splashing
    s += jm_limb('M28 80 Q14 76 12 66', '#3FA0FF', 5) + jm_limb('M92 80 Q106 78 110 88', '#3FA0FF', 5);
    s += pair(60, 66, 12, 7, { dir: [0.25, -0.1], brow: 'up', bw: 2.8 });
    s += M.tongue(60, 82, 9);
    s += `<path d="M44 102 Q48 108 54 104 M66 104 Q72 108 76 102" ${N(2.6)}/>`;
    return s;
  }

  function kuerbiskopf(P, o, C) {
    const pump = C.grad('#F28A22'), rib = '#C9601A', leaf = '#4FA84A';
    let s = '';
    s += `<ellipse cx="60" cy="110" rx="44" ry="6" fill="${OUT}" opacity=".18"/>`;
    // vine arms
    s += jm_limb('M22 74 Q8 70 10 56', '#4F9A3A', 4) + jm_limb('M98 74 Q112 72 112 60', '#4F9A3A', 4);
    s += `<path d="M10 56 Q4 50 8 46 Q12 50 10 56 Z M112 60 Q118 54 114 50 Q110 54 112 60 Z" ${F(leaf, 1.8)}/>`;
    // pumpkin body
    s += `<path d="M60 30 Q36 24 22 42 Q10 62 18 86 Q26 108 50 108 Q60 112 70 108 Q94 108 102 86 Q110 62 98 42 Q84 24 60 30 Z" ${F(pump)}/>`;
    s += `<path d="M42 32 Q30 56 34 80 Q36 98 48 106 M78 32 Q90 56 86 80 Q84 98 72 106 M60 32 Q56 70 60 108" fill="none" stroke="${rib}" stroke-width="2.6" stroke-linecap="round"/>`;
    s += shine(34, 48, 8, 4, -35);
    // stem, curl and leaf
    s += `<path d="M54 32 Q54 16 62 10 L68 14 Q62 20 64 32 Z" ${F(C.lin('#7A9A3A', '#4E6A26'), 2.2)}/>`;
    s += `<path d="M66 16 Q80 8 84 18 Q86 26 78 26" ${N(2.4)}/><path d="M50 22 Q36 10 28 18 Q34 30 50 26 Z" ${F(leaf, 2.2)}/><path d="M48 24 Q38 20 32 20" fill="none" stroke="#2E7A36" stroke-width="1.6"/>`;
    // prize rosette: biggest pumpkin of the fair
    s += `<path d="M90 82 L86 102 L92 98 L96 104 L98 84 Z" ${F('#3B7DD8', 1.8)}/><circle cx="94" cy="80" r="8" ${F('#3B7DD8', 2)}/><circle cx="94" cy="80" r="4" ${F('#FFC93C', 1.6)}/>`;
    s += pair(58, 62, 13, 7.5, { brow: 'angry', bw: 3.4, iris: '#C9601A' });
    s += `<path d="M60 70 L56 76 L64 76 Z" fill="${rib}" ${S(1.8)}/>`;
    s += `<path d="M38 84 Q58 98 80 84 L76 90 L70 87 L64 93 L58 88 L52 93 L46 87 L42 90 Z" ${F('#7A2340', 2.4)}/>`;
    return s;
  }

  function autoscooter(P, o, C) {
    const car = C.grad('#E8344A'), bump = C.lin('#3A3445', '#1E1A26'), gold = '#FFC93C';
    let s = '';
    // ceiling net contact: pole with sparks
    s += `<path d="M2 6 L118 6 M2 14 L118 14" stroke="#7A8194" stroke-width="2" opacity=".6"/>`;
    s += jm_limb('M78 56 L84 10', '#A3ABB8', 3);
    s += `<path d="M78 8 L90 8 L88 14 L80 14 Z" ${F('#5A5560', 1.8)}/><path d="${burst(84, 8, 2.5, 8, 6)}" fill="#FFE066" ${S(1.4)}/>${spark(98, 18, 3.5, '#8CF0FF')}${spark(70, 20, 2.6, '#FFE066')}`;
    s += `<ellipse cx="60" cy="112" rx="54" ry="6" fill="${OUT}" opacity=".22"/>`;
    // car body
    s += `<path d="M14 84 Q10 56 34 52 L86 52 Q110 56 106 84 Z" ${F(car)}/>`;
    s += `<path d="M30 52 Q40 32 60 32 Q74 32 82 52 Z" ${F(C.lin('#BFE6FF', '#7FB8E8'), 2.4)}/><path d="M42 46 Q46 38 54 37" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`;
    // steering wheel peeking above the hood
    s += `<ellipse cx="60" cy="50" rx="11" ry="4" ${N(3)}/>`;
    s += `<path d="M20 64 L30 58 L28 66 L38 60" fill="none" stroke="${gold}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M100 64 L90 58 L92 66 L82 60" fill="none" stroke="${gold}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += shine(30, 60, 8, 3, -10);
    // rubber bumper ring
    s += `<path d="M6 86 Q6 76 18 76 L102 76 Q114 76 114 86 L114 96 Q114 106 102 106 L18 106 Q6 106 6 96 Z" ${F(bump)}/>`;
    s += `<path d="M12 84 Q60 80 108 84" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".25"/>`;
    // headlight eyes and grille mouth
    s += pair(60, 70, 22, 8, { glow: '#FFF3B0', look: 'n', brow: 'angry', bw: 4, iris: '#3B7DD8' });
    s += `<path d="M42 86 Q60 80 78 86 L76 98 Q60 102 44 98 Z" ${F('#C9CCD6', 2.4)}/><path d="M50 86 L50 99 M60 84 L60 101 M70 86 L70 99" stroke="${OUT}" stroke-width="2"/>`;
    return s;
  }

  function ausrufer(P, o, C) {
    const coat = C.grad('#B0233A'), skin = C.grad('#F2C9A0'), hat = C.grad('#2E2A40'), gold = '#FFC93C', horn = C.lin('#FFE58A', '#E0A92A');
    let s = '';
    // tail coat
    s += `<path d="M6 116 Q8 74 50 70 Q92 74 96 116 Z" ${F(coat)}/>`;
    s += `<path d="M38 72 L50 110 L62 72 Z" fill="#FFF3E6" ${S(2)}/><path d="M42 76 L50 104 L58 76" fill="none" stroke="#3B7DD8" stroke-width="3"/>`;
    s += `<circle cx="34" cy="94" r="2.6" ${F(gold, 1.4)}/><circle cx="66" cy="94" r="2.6" ${F(gold, 1.4)}/><circle cx="34" cy="106" r="2.6" ${F(gold, 1.4)}/><circle cx="66" cy="106" r="2.6" ${F(gold, 1.4)}/>`;
    s += `<path d="M40 72 L50 78 L40 84 Z M60 72 L50 78 L60 84 Z" ${F('#FFC93C', 2)}/><circle cx="50" cy="78" r="3" ${F('#E0A92A', 1.6)}/>`;
    // arm holding the megaphone
    s += jm_limb('M78 82 Q88 82 86 70', '#B0233A', 9);
    // head
    s += `<ellipse cx="46" cy="50" rx="23" ry="23" ${F(skin)}/>`;
    s += `<ellipse cx="24" cy="52" rx="4" ry="6.5" ${F(skin, 2)}/>`;
    s += shine(36, 44, 5, 3, -20);
    s += pair(44, 46, 9, 5.5, { brow: 'angry', bw: 3.6, dir: [0.4, 0] });
    s += `<path d="M48 50 Q54 56 49 58" ${N(2.2)}/>`;
    // curly moustache
    s += `<path d="M48 61 Q40 56 32 60 Q26 58 28 52 Q24 62 34 64 Q42 64 48 62 Q54 64 60 63 Q66 62 64 56 Q64 62 58 60 Q54 56 48 61 Z" ${F('#5A3A22', 2)}/>`;
    // megaphone at the mouth, sound waves
    s += `<path d="M58 66 L102 42 Q112 56 108 76 L60 72 Z" ${F(horn)}/><ellipse cx="105" cy="59" rx="5" ry="17" ${F('#B5791E', 2.4)} transform="rotate(-8 105 59)"/>`;
    s += `<path d="M66 66 L98 50" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/><rect x="56" y="64" width="8" height="9" rx="2" ${F('#5A5560', 2)}/>`;
    s += `<ellipse cx="80" cy="76" rx="6" ry="5" ${F(skin, 2)}/>`;
    s += `<path d="M112 36 Q118 44 116 52 M114 70 Q120 76 116 86 M106 26 Q114 28 116 32" fill="none" stroke="${OUT}" stroke-width="2.8" stroke-linecap="round"/>`;
    // top hat
    s += `<path d="M28 34 L30 4 Q46 0 62 4 L64 34 Z" ${F(hat)}/><path d="M29.5 24 Q46 20 62.5 24 L63.2 31 Q46 27 28.8 31 Z" fill="${gold}"/><path d="M35 8 L34 20" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".35"/>`;
    s += `<path d="M16 34 Q46 26 76 34 Q76 40 66 38 Q46 34 26 38 Q16 40 16 34 Z" ${F(hat)}/>`;
    s += `<path d="${burst(56, 26, 2, 5, 5)}" ${F('#FF6E8E', 1.4)}/>`;
    return s;
  }

  function kirmesnebel(P, o, C) {
    const fog = C.lin('#E4EAFA', '#9AA9D6');
    let s = '';
    // coloured stage lights shining into the fog
    s += `<path d="M0 0 L30 0 L66 70 L44 76 Z" fill="#FF6EC7" opacity=".16"/><path d="M120 0 L92 0 L60 72 L82 78 Z" fill="#5BE0FF" opacity=".18"/>`;
    // fog machine
    s += `<ellipse cx="60" cy="113" rx="52" ry="5" fill="${OUT}" opacity=".18"/>`;
    s += `<rect x="4" y="92" width="34" height="20" rx="4" ${F(C.lin('#5A5560', '#2E2A33'))}/><rect x="36" y="96" width="10" height="8" rx="2" ${F('#7A8194', 2)}/><circle cx="14" cy="102" r="3" fill="#E0304A" ${S(1.4)}/><path d="M22 99 L32 99 M22 105 L32 105" stroke="#7A8194" stroke-width="2" stroke-linecap="round"/>`;
    // the fog itself, puffing out of the nozzle
    s += `<path d="M46 100 Q44 92 52 90 Q48 80 58 76 Q46 72 44 60 Q30 62 24 50 Q16 36 30 30 Q28 14 46 14 Q54 2 72 8 Q88 2 96 16 Q114 18 110 36 Q120 48 108 60 Q112 76 96 78 Q100 92 86 96 Q82 106 68 102 Q58 108 46 100 Z" ${F(fog)}/>`;
    s += `<path d="M30 40 Q36 34 44 36 M90 24 Q98 24 102 30 M96 66 Q102 62 104 56 M62 94 Q70 98 78 94" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
    s += shine(42, 24, 9, 4, -15);
    s += `<path d="M110 92 Q116 88 118 94 M100 104 Q106 100 110 106 M6 70 Q12 66 16 72" fill="none" stroke="#C9D2EA" stroke-width="3" stroke-linecap="round"/>`;
    s += pair(70, 46, 13, 7.5, { lid: '#B6C2E6', lidRot: -10, lidY: 0, dir: [0.3, 0.2] });
    s += M.smirk(70, 64, 9);
    s += blush(70, 58, 20, 4);
    return s;
  }

  function funkenrakete(P, o, C) {
    const red = C.grad('#E8344A'), stick = C.lin('#E8C38A', '#B07A42');
    let s = '';
    // spark trail
    s += `<path d="M48 92 Q36 104 40 118 L80 118 Q84 104 72 92 Z" ${F(C.lin('#FFE066', '#FF6A3D'), 2.2)}/><path d="M54 94 Q50 104 54 114 L66 114 Q70 104 66 94 Z" fill="#FFF3B0"/>`;
    s += spark(30, 106, 4, '#FFB23F') + spark(90, 104, 4.5, '#FFE066') + spark(22, 90, 2.6, '#FFE066') + spark(98, 88, 3, '#FFB23F');
    s += `<path d="M26 74 l-8 -4 M94 74 l8 -4 M30 58 l-8 -6 M90 58 l8 -6" stroke="#FFB23F" stroke-width="2.6" stroke-linecap="round"/>`;
    s += `<rect x="57" y="84" width="6" height="28" rx="2" ${F(stick, 2)}/>`;
    // fins
    s += `<path d="M42 70 L28 92 L44 88 Z M78 70 L92 92 L76 88 Z" ${F(C.grad('#3B7DD8'), 2.4)}/>`;
    // tube
    s += `<path d="M40 40 L80 40 L80 90 Q60 96 40 90 Z" ${F(red)}/>`;
    s += `<path d="M40 52 Q60 58 80 52 L80 58 Q60 64 40 58 Z M40 80 Q60 86 80 80 L80 86 Q60 92 40 86 Z" fill="#FFF3E6" ${S(1.6)}/>`;
    s += [[48, 70], [72, 72], [60, 76]].map(([x, y]) => `<path d="${burst(x, y, 1.2, 3, 5)}" fill="#FFE066"/>`).join('');
    s += shine(47, 66, 3, 9, 0);
    // nose cone and fuse
    s += `<path d="M36 42 Q44 14 60 6 Q76 14 84 42 Z" ${F(C.grad('#FFC93C'))}/><path d="M48 24 Q54 14 60 11" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`;
    s += `<path d="M84 26 Q96 22 98 12" ${N(2.4)}/><path d="${burst(99, 10, 2, 6, 6)}" fill="#FFE066" ${S(1.4)}/>`;
    s += pair(60, 66, 10, 6.5, { brow: 'angry', bw: 3.2, dir: [0, -0.3] });
    s += M.grin(60, 76, 7);
    return s;
  }

  function zerrbild(P, o, C) {
    const gold = C.lin('#FFE58A', '#D99A1E'), glass = C.lin('#E6F4FF', '#9DB6E0');
    // funhouse mirror: wide top, pinched waist, wide bottom
    const mirror = (k) => `M60 ${6 + k} Q${104 - k} ${6 + k} ${100 - k} 36 Q${94 - k} 52 ${82 - k} 58 Q${96 - k} 66 ${100 - k} 82 Q${104 - k} 106 60 ${106 - k} Q${16 + k} 106 ${20 + k} 82 Q${24 + k} 66 ${38 + k} 58 Q${26 + k} 52 ${20 + k} 36 Q${16 + k} ${6 + k} 60 ${6 + k} Z`;
    let s = '';
    s += `<path d="M34 102 L26 116 M86 102 L94 116" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="M34 102 L26 116 M86 102 L94 116" fill="none" stroke="#B9801A" stroke-width="2.6" stroke-linecap="round"/>`;
    s += `<path d="${mirror(0)}" ${F(gold)}/><path d="${mirror(7)}" ${F(glass, 2.2)}/>`;
    s += `<circle cx="60" cy="7" r="4" ${F('#E0304A', 1.8)}/><circle cx="18" cy="38" r="3" ${F('#E0304A', 1.6)}/><circle cx="102" cy="38" r="3" ${F('#E0304A', 1.6)}/><circle cx="18" cy="82" r="3" ${F('#E0304A', 1.6)}/><circle cx="102" cy="82" r="3" ${F('#E0304A', 1.6)}/>`;
    s += `<path d="M36 22 Q44 16 52 18 M34 30 Q38 26 42 26" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M30 64 q6 -4 12 0 t12 0 M68 64 q6 -4 12 0 t12 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
    // the stretched reflection: huge eyes up top, tiny nose in the waist, a wide wobbly grin below
    s += eye(46, 34, 10, { side: -1, tall: 1.4, dir: [0.2, 0.2] }) + eye(76, 36, 7, { side: 1, tall: 0.8, dir: [-0.2, 0.3] });
    s += `<path d="M34 18 L54 22 M68 26 L84 22" ${N(3)}/>`;
    s += `<ellipse cx="60" cy="58" rx="3" ry="2" fill="${OUT}"/>`;
    s += `<path d="M30 78 Q40 70 50 80 Q60 90 70 78 Q80 68 90 80 Q84 98 60 96 Q36 98 30 78 Z" ${F('#7A2340', 2.4)}/><path d="M42 90 Q60 98 78 90 Q66 96 60 96 Q50 96 42 90 Z" fill="#E8516F"/>`;
    s += `<path d="M38 80 L42 86 L46 80 Z M74 80 L78 86 L82 80 Z" ${F('#fff', 1.4)}/>`;
    return s;
  }

  function zaunranke(P, o, C) {
    const wood = C.lin('#D9B48A', '#A97A4A'), vine = '#3E8E41', leaf = C.grad('#5CC96A');
    const lf = (x, y, r) => `<path d="M0 0 Q6 -8 14 -2 Q8 6 0 0 Z" ${F(leaf, 1.8)} transform="translate(${x} ${y}) rotate(${r})"/>`;
    let s = '';
    // picket fence
    s += `<ellipse cx="60" cy="114" rx="56" ry="4" fill="${OUT}" opacity=".18"/>`;
    s += [10, 38, 82, 110].map((x) => `<path d="M${x - 9} 114 L${x - 9} 58 L${x} 48 L${x + 9} 58 L${x + 9} 114 Z" ${F(wood, 2.2)}/>`).join('');
    s += `<rect x="0" y="70" width="120" height="9" ${F('#B98A56', 2.2)}/><rect x="0" y="96" width="120" height="9" ${F('#B98A56', 2.2)}/>`;
    s += `<circle cx="10" cy="74.5" r="1.4" fill="${OUT}"/><circle cx="38" cy="74.5" r="1.4" fill="${OUT}"/><circle cx="82" cy="74.5" r="1.4" fill="${OUT}"/><circle cx="110" cy="74.5" r="1.4" fill="${OUT}"/>`;
    // vine winding along the fence and up to the head
    const d = 'M4 110 Q20 92 30 100 Q44 110 50 92 Q56 76 70 86 Q86 98 96 80 Q104 66 112 72 M56 80 Q54 66 60 58';
    s += jm_limb(d, vine, 4);
    s += `<path d="M30 100 Q24 112 32 116 M96 80 Q108 82 108 94 Q100 92 104 86" ${N(2.2)}/>`;
    s += lf(22, 96, -60) + lf(44, 104, 20) + lf(64, 82, -100) + lf(80, 94, 30) + lf(104, 70, -40) + lf(12, 104, 200);
    // the head: a leafy bud with curly tendrils
    s += `<path d="M36 34 Q24 30 22 18 Q34 16 40 26 Z M84 34 Q96 30 98 18 Q86 16 80 26 Z" ${F(leaf, 2.2)}/>`;
    s += `<path d="M44 18 Q40 6 46 2 Q52 6 50 12 M76 18 Q82 8 78 4 Q72 4 72 10" ${N(2.2)}/>`;
    s += `<path d="M60 62 Q34 62 34 40 Q34 18 60 16 Q86 18 86 40 Q86 62 60 62 Z" ${F(leaf)}/>`;
    s += `<path d="M60 18 Q56 26 60 34" fill="none" stroke="#2E7A36" stroke-width="2" stroke-linecap="round"/>`;
    s += shine(46, 28, 6, 3, -25);
    s += `<circle cx="96" cy="58" r="4.5" ${F('#FF8FB1', 1.6)}/><circle cx="96" cy="58" r="1.6" fill="#FFE066"/><circle cx="24" cy="86" r="4" ${F('#C9A0FF', 1.6)}/><circle cx="24" cy="86" r="1.4" fill="#FFE066"/>`;
    s += pair(60, 40, 10, 6, { brow: 'angry', bw: 3, dir: [0.3, 0.1] });
    s += M.smirk(60, 52, 7);
    return s;
  }

  function haudenlukas(P, o, C) {
    const red = C.grad('#D9343F'), wood = C.lin('#C08A52', '#7A4E26'), bell = C.grad('#FFC93C');
    let s = '';
    s += `<ellipse cx="60" cy="113" rx="54" ry="5" fill="${OUT}" opacity=".22"/>`;
    // tower with the scale, puck and bell
    s += `<rect x="40" y="16" width="18" height="70" rx="2" ${F('#FFF3E6')}/>`;
    s += ['#E0304A', '#FF8A3D', '#FFC93C', '#7ED957', '#3B8FE0'].map((c, i) => `<rect x="42" y="${20 + i * 12}" width="14" height="10" fill="${c}"/>`).join('');
    s += `<path d="M49 18 L49 84" stroke="${OUT}" stroke-width="1.6" opacity=".4"/><rect x="43" y="58" width="12" height="8" rx="2" ${F('#5A5560', 2)}/>`;
    s += `<path d="M38 18 Q36 2 49 2 Q62 2 60 18 Z" ${F(bell)}/><path d="M36 18 L62 18" ${N(3)}/><circle cx="49" cy="20" r="2.4" fill="${OUT}"/><path d="M42 8 Q44 4 48 4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
    s += `<path d="M30 6 L24 2 M30 14 L22 14 M68 6 L74 2 M68 14 L76 14" stroke="#FFB23F" stroke-width="2.6" stroke-linecap="round"/>`;
    // heavy base block with the face
    s += `<path d="M14 110 L18 80 Q20 74 28 74 L92 74 Q100 74 102 80 L106 110 Z" ${F(red)}/>`;
    s += `<path d="M28 74 L92 74 L88 66 L32 66 Z" ${F(wood, 2.4)}/><rect x="40" y="62" width="18" height="6" rx="1.5" ${F('#7A8194', 2)}/>`;
    s += `<path d="M14 104 L106 104" stroke="${OUT}" stroke-width="2.4"/><path d="M22 104 L22 110 M98 104 L98 110" stroke="${OUT}" stroke-width="2"/>`;
    s += shine(28, 84, 6, 3, -20);
    s += pair(60, 86, 14, 6.5, { brow: 'angry', bw: 4, iris: '#FFC93C' });
    s += M.grin(60, 96, 9);
    // arm swinging the mallet
    s += jm_limb('M100 84 Q112 76 108 60', '#D9343F', 8);
    s += `<g transform="rotate(-24 104 50)"><rect x="101" y="30" width="6" height="40" rx="2.5" ${F(wood, 2.2)}/><rect x="88" y="18" width="34" height="16" rx="4" ${F(C.grad('#9A6A40'))}/><path d="M92 18 L92 34 M118 18 L118 34" stroke="#5A3A22" stroke-width="2"/>${shine(98, 22, 5, 2, 0)}</g>`;
    s += `<circle cx="107" cy="60" r="6.5" ${F(red, 2.4)}/>`;
    return s;
  }

  function herrdergeisterbahn(P, o, C) {
    const ghost = C.grad('#EDE6FF'), cart = C.grad('#5E2E9A'), gold = '#FFC93C';
    let s = '';
    // rails
    s += [8, 30, 52, 74, 96].map((x) => `<rect x="${x}" y="108" width="14" height="5" rx="1.5" fill="#6B4528"/>`).join('');
    s += `<path d="M2 108 L118 108" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M2 108 L118 108" stroke="#A3ABB8" stroke-width="2" stroke-linecap="round"/>`;
    // little bat on a string
    s += `<path d="M14 66 L14 34" stroke="${OUT}" stroke-width="1.6"/><path d="M14 34 Q8 26 2 30 Q6 32 4 36 Q10 34 14 38 Q18 34 24 36 Q22 32 26 30 Q20 26 14 34 Z" ${F('#3A2E50', 1.8)}/><circle cx="12" cy="33" r="1.1" fill="#FFE066"/><circle cx="16" cy="33" r="1.1" fill="#FFE066"/>`;
    // cape with a stand-up collar
    s += `<path d="M20 80 Q18 40 40 30 L30 16 L50 26 Q60 22 70 26 L90 16 L80 30 Q102 40 100 80 Z" ${F(C.lin('#3A1F5E', '#24123E'))}/><path d="M28 78 Q28 46 44 36 L76 36 Q92 46 92 78 Z" fill="#B0233A"/>`;
    // ghost rising out of the cart, arms up: Buuh!
    s += `<path d="M32 80 Q28 44 42 30 Q60 14 78 30 Q92 44 88 80 Z" ${F(ghost)}/>`;
    s += jm_limb('M36 58 Q22 58 16 66', '#EDE6FF', 8) + jm_limb('M84 56 Q98 48 100 36', '#EDE6FF', 8);
    s += `<path d="M96 36 Q96 26 100 26 Q104 26 104 36 M92 34 L96 30 M108 34 L104 30" fill="none" stroke="${OUT}" stroke-width="2.4" stroke-linecap="round"/>`;
    s += shine(46, 38, 7, 4, -25);
    // wonky crown
    s += `<g transform="rotate(-12 60 24)"><path d="M44 28 L42 10 L52 20 L60 6 L68 20 L78 10 L76 28 Z" ${F(gold)}/><circle cx="60" cy="20" r="3" ${F('#3FE0A0', 1.4)}/><circle cx="50" cy="24" r="2" fill="#E0304A"/><circle cx="70" cy="24" r="2" fill="#E0304A"/></g>`;
    s += pair(60, 46, 11, 7, { look: 'glow', glow: '#8CF0A8' });
    s += M.open(60, 60, 9);
    // ghost-train car
    s += `<path d="M14 76 L106 76 L102 104 L18 104 Z" ${F(cart)}/>`;
    s += `<path d="M14 76 L106 76 L106 82 L14 82 Z" ${F(gold, 2.2)}/>`;
    s += `<path d="M30 90 Q36 84 42 90 M78 90 Q84 84 90 90" ${N(2.6)}/><circle cx="36" cy="92" r="2.6" fill="#8CF0A8"/><circle cx="84" cy="92" r="2.6" fill="#8CF0A8"/>`;
    s += `<path d="M52 92 Q56 96 60 92 Q64 96 68 92" fill="none" stroke="#8CF0A8" stroke-width="2.4" stroke-linecap="round"/>`;
    s += `<path d="M20 86 Q26 82 30 84" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".35"/>`;
    s += `<circle cx="30" cy="106" r="6" ${F('#3A3445', 2.2)}/><circle cx="90" cy="106" r="6" ${F('#3A3445', 2.2)}/><circle cx="30" cy="106" r="2" fill="${gold}"/><circle cx="90" cy="106" r="2" fill="${gold}"/>`;
    s += spark(110, 60, 3, '#C9A0FF') + spark(8, 84, 2.6, '#8CF0A8');
    return s;
  }

  function eth_arm(d, col) { return `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round"/>`; }
  function eth_key(x, y, r, col) { return `<g transform="rotate(${r} ${x} ${y})"><circle cx="${x}" cy="${y - 4}" r="3.2" fill="none" stroke="${OUT}" stroke-width="4.2"/><circle cx="${x}" cy="${y - 4}" r="3.2" fill="none" stroke="${col}" stroke-width="2"/><path d="M${x} ${y} L${x} ${y + 11} M${x} ${y + 7} L${x + 3.5} ${y + 7} M${x} ${y + 10} L${x + 3} ${y + 10}" fill="none" stroke="${OUT}" stroke-width="4.2" stroke-linecap="round"/><path d="M${x} ${y} L${x} ${y + 11} M${x} ${y + 7} L${x + 3.5} ${y + 7} M${x} ${y + 10} L${x + 3} ${y + 10}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round"/></g>`; }
  function eth_flame(x, y, k) { return `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="0" cy="-2" rx="9" ry="11" fill="#FFE066" opacity=".3"/><path d="M0 -12 Q7 -3 4 2 Q0 5 -4 2 Q-7 -3 0 -12 Z" fill="#FFB23F" ${S(1.8)}/><path d="M0 -6 Q3 -1 1.5 1.5 Q0 2.5 -1.5 1.5 Q-3 -1 0 -6 Z" fill="#FFF3B0"/></g>`; }

  function kuesterin(P, o, C) {
    const e = o.evo;
    const dress = C.grad(['#4F7BB5', '#3F68A0', '#35598C'][e]), skin = C.grad('#F6CDA6'), hair = C.grad('#8A5530'), brass = e === 2 ? '#FFC93C' : '#E0B24A';
    let s = '';
    if (e === 2) s += `<circle cx="96" cy="66" r="16" fill="#FFE066" opacity=".22"/>`;
    s += `<circle cx="40" cy="30" r="10" ${F(hair)}/><path d="M34 70 Q28 44 40 32 Q60 20 80 32 Q92 44 86 70 Q80 74 76 68 L44 68 Q40 74 34 70 Z" ${F(hair)}/>`; // bun and hair behind the head
    s += `<path d="M20 116 Q22 80 60 78 Q98 80 100 116 Z" ${F(dress)}/>`;
    if (e >= 1) { // warm cloak with a golden clasp
      const cloak = C.grad(e === 2 ? '#C2412F' : '#B5503A');
      s += `<path d="M16 116 Q16 80 46 77 L54 92 L44 116 Z M104 116 Q104 80 74 77 L66 92 L76 116 Z" ${F(cloak)}/>`;
      if (e === 2) s += `<path d="M44 116 L54 92 M76 116 L66 92" fill="none" stroke="#FFE7A8" stroke-width="3.5" stroke-linecap="round"/><path d="M16 116 Q16 80 46 77 M104 116 Q104 80 74 77" fill="none" stroke="#FFE7A8" stroke-width="3" stroke-linecap="round"/>`;
    }
    s += `<path d="M46 80 Q60 92 74 80 L70 88 Q60 96 50 88 Z" ${F('#FFF8E6', 2)}/>`;
    if (e >= 1) s += `<circle cx="60" cy="92" r="4" ${F(brass, 2)}/>`;
    s += `<path d="M38 98 Q60 104 82 98 L84 116 L36 116 Z" ${F('#F2EEE2', 2)}/>`; // apron
    // left hand: key ring, the bunch grows
    const keys = [[[22, 104, 10], [30, 104, -12]], [[18, 103, 25], [24, 106, 6], [32, 105, -14], [37, 101, -32]], [[16, 102, 30], [22, 106, 12], [30, 107, -4], [36, 104, -22], [40, 99, -40]]][e];
    s += `<circle cx="28" cy="98" r="${e ? 9 : 7}" fill="none" stroke="${OUT}" stroke-width="4.8"/><circle cx="28" cy="98" r="${e ? 9 : 7}" fill="none" stroke="${brass}" stroke-width="2.4"/>`;
    s += keys.map(([x, y, r]) => eth_key(x, y, r, brass)).join('');
    s += `<ellipse cx="28" cy="90" rx="6.5" ry="5.5" ${F(skin, 2)}/>`;
    // right hand: candle (stage 3 holds it in a little brass holder)
    s += `<rect x="88" y="62" width="10" height="${e === 2 ? 26 : 30}" rx="2" ${F(C.lin('#FFFDF5', '#EADFC4'), 2.2)}/><path d="M91 66 Q91 72 93 72" fill="none" stroke="#fff" stroke-width="1.6" opacity=".9"/>`;
    s += `<path d="M93 62 L93 58" ${N(1.8)}/>${eth_flame(93, 57, e === 2 ? 1.25 : 1)}`;
    if (e === 2) s += `<path d="M82 88 L104 88 L100 94 L86 94 Z" ${F('#FFC93C', 2)}/><path d="M104 90 Q112 92 106 98" ${N(2.4)}/>`;
    s += `<ellipse cx="93" cy="${e === 2 ? 98 : 96}" rx="6.5" ry="5.5" ${F(skin, 2)}/>`;
    if (e === 2) s += `<path d="M66 100 L66 106" ${N(2)}/><path d="M60 114 Q60 104 66 104 Q72 104 72 114 Z" ${F('#FFC93C', 2.2)}/><circle cx="66" cy="115" r="2" fill="${OUT}"/>${shine(63, 108, 1.5, 3)}`;
    // head
    s += `<path d="M37 50 Q37 30 60 30 Q83 30 83 50 Q83 78 60 79 Q37 78 37 50 Z" ${F(skin)}/>`;
    s += `<path d="M35 52 Q32 26 60 26 Q88 26 85 52 Q80 40 70 38 Q60 46 44 42 Q38 46 35 52 Z" ${F(hair)}/>`;
    s += `<path d="M46 32 Q56 28 66 30" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".3"/>`;
    if (e === 2) s += `<path d="${burst(76, 34, 2, 5, 5)}" fill="#FFE066" ${S(1.4)}/>`;
    s += shine(46, 50, 5, 3, -20);
    s += `<path d="M44 53 L41 50 M76 53 L79 50" ${N(2)}/>`; // lashes
    s += pair(60, 56, 10, 5.5, { iris: '#6B8E3A' });
    s += `<path d="M60 61 Q58 66 61 67" ${N(2)}/>${M.smile(60, 71, 7)}`;
    s += blush(60, 66, 16, 4);
    return s;
  }

  function friends(P, o, C) {
    const skin = C.grad('#F6CDA6'), skin2 = C.grad('#E8B48A');
    let s = '';
    // Ida (left): red pigtails, yellow dress
    s += `<path d="M22 116 Q22 82 40 80 Q56 82 58 116 Z" ${F(C.grad('#FFC23F'))}/><path d="M32 82 L40 92 L48 82" ${N(2)}/>`;
    // Ole (right): blue shirt with a stripe
    s += `<path d="M62 116 Q62 82 80 80 Q98 82 98 116 Z" ${F(C.grad('#4A8FE0'))}/><path d="M64 100 Q80 104 97 100" fill="none" stroke="#fff" stroke-width="4" opacity=".75"/>`;
    // holding hands in the middle
    s += eth_arm('M50 88 Q56 100 60 101', '#F6CDA6') + eth_arm('M70 88 Q64 100 60 101', '#E8B48A');
    s += `<circle cx="60" cy="101" r="5.5" ${F(skin, 2)}/>`;
    s += eth_arm('M28 88 Q22 98 24 106', '#F6CDA6') + eth_arm('M92 88 Q98 98 96 106', '#E8B48A');
    // Ida's pigtails
    s += `<path d="M24 50 Q12 54 14 70 Q22 64 26 58 Z M56 50 Q68 54 66 70 Q58 64 54 58 Z" ${F(C.grad('#D8572A'), 2.2)}/><circle cx="24" cy="52" r="3" ${F('#3FBF7F', 1.8)}/><circle cx="56" cy="52" r="3" ${F('#3FBF7F', 1.8)}/>`;
    s += `<circle cx="40" cy="58" r="18" ${F(skin)}/>`;
    s += `<path d="M22 56 Q20 38 40 38 Q60 38 58 56 Q50 46 40 48 Q30 46 22 56 Z" ${F(C.grad('#D8572A'), 2.4)}/>`;
    s += shine(33, 52, 4, 2.5, -20);
    s += pair(40, 60, 7, 4.5, { dir: [0.35, 0.1] });
    s += M.smile(40, 69, 5) + blush(40, 66, 11, 3);
    // Ole: messy blond hair
    s += `<circle cx="80" cy="58" r="18" ${F(skin2)}/>`;
    s += `<path d="M62 56 Q60 40 72 39 L70 32 L78 38 L80 30 L85 38 L92 33 L89 41 Q100 44 98 56 Q92 46 86 48 Q80 44 74 49 Q68 46 62 56 Z" ${F(C.grad('#F2CC55'), 2.4)}/>`;
    s += shine(73, 52, 4, 2.5, -20);
    s += pair(80, 60, 7, 4.5, { dir: [-0.35, 0.1] });
    s += M.grin(80, 68, 6) + blush(80, 66, 11, 3);
    s += `<path d="M76 70 l0 0" ${N(1)}/>`;
    s += `<path d="M53 30 Q53 25 57 25 Q60 25 60 29 Q60 25 63 25 Q67 25 67 30 Q67 35 60 39 Q53 35 53 30 Z" ${F('#FF6E8E', 2)}/>`;
    return s;
  }

  function neidhammel(P, o, C) {
    const wool = C.grad('#9BD77A'), face = C.grad('#7D8A72'), horn = C.lin('#E8D3A8', '#B8956A');
    let s = `<ellipse cx="60" cy="114" rx="34" ry="3.5" fill="${OUT}" opacity=".15"/>`;
    s += `<path d="M38 96 L36 112 M50 98 L50 113 M72 98 L72 113 M84 96 L86 112" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M38 96 L36 112 M50 98 L50 113 M72 98 L72 113 M84 96 L86 112" fill="none" stroke="#4E5A48" stroke-width="3.5" stroke-linecap="round"/>`;
    const puffs = [[30, 70], [36, 56], [50, 50], [66, 50], [82, 54], [92, 68], [88, 84], [72, 92], [54, 94], [36, 88]];
    s += puffs.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" ${F(wool)}/>`).join('');
    s += `<ellipse cx="62" cy="73" rx="28" ry="20" fill="#9BD77A"/>`;
    s += [[50, 64], [70, 66], [62, 82], [80, 76], [42, 78]].map(([x, y]) => `<path d="M${x - 4} ${y} q2 -4 4 0 q2 4 4 0" fill="none" stroke="#5FA64A" stroke-width="2" stroke-linecap="round"/>`).join('');
    s += shine(44, 52, 8, 4, -25);
    // head, glancing sideways (envy)
    s += `<path d="M14 42 Q4 50 12 60 Q18 64 22 58" ${N(5)}/>`;
    s += `<ellipse cx="26" cy="58" rx="16" ry="18" ${F(face)}/>`;
    s += `<path d="M16 46 Q2 36 8 24 Q16 16 24 26 Q26 34 20 36" fill="none" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="M16 46 Q2 36 8 24 Q16 16 24 26 Q26 34 20 36" fill="none" stroke="#D9BE8C" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M36 46 Q50 36 46 24 Q38 16 30 26 Q28 34 34 36" fill="none" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="M36 46 Q50 36 46 24 Q38 16 30 26 Q28 34 34 36" fill="none" stroke="#D9BE8C" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M14 44 Q18 34 26 38 Q32 32 38 42 Q30 46 26 44 Q20 48 14 44 Z" ${F(wool, 2)}/>`;
    s += pair(26, 54, 7, 5, { dir: [-0.5, 0], lid: '#6E7C66', lidY: -0.15, lidRot: 8, brow: 'angry', bw: 2.6 });
    s += `<ellipse cx="22" cy="66" rx="1.6" ry="1.2" fill="${OUT}"/><ellipse cx="30" cy="66" rx="1.6" ry="1.2" fill="${OUT}"/>`;
    s += M.frown(26, 70, 5);
    return s;
  }

  function novembernebel(P, o, C) {
    const fog = C.grad('#A9B8D6'), fog2 = C.lin('#C9D3E8', '#94A4C6');
    let s = '';
    s += `<path d="M8 100 Q24 94 40 100 T72 100 T104 100 T120 98" fill="none" stroke="#B9C5DE" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M24 88 Q14 84 16 72 Q12 58 26 54 Q26 36 46 36 Q54 22 72 28 Q90 26 94 44 Q108 48 104 64 Q112 76 100 84 Q104 96 88 96 Q80 104 66 98 Q54 106 44 98 Q28 102 24 88 Z" ${F(fog)}/>`;
    s += `<path d="M28 84 Q40 80 50 86 M70 88 Q82 82 94 86 M38 50 Q46 46 52 50" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>`;
    s += shine(42, 46, 9, 4.5, -20);
    s += `<path d="M20 108 Q36 104 50 110 Q66 104 80 110 Q96 104 108 108" fill="none" stroke="${OUT}" stroke-width="2.4" stroke-linecap="round"/><path d="M14 112 q16 -4 30 0" fill="none" stroke="#B9C5DE" stroke-width="4" stroke-linecap="round"/>`;
    // falling leaf
    s += `<g transform="rotate(-30 98 22)"><path d="M90 22 Q98 12 106 22 Q98 32 90 22 Z" ${F('#D9822B', 2)}/><path d="M90 22 L106 22" stroke="#9A5418" stroke-width="1.4"/></g>`;
    s += `<g transform="rotate(20 16 32)"><path d="M10 32 Q16 25 22 32 Q16 39 10 32 Z" ${F('#C8A23A', 1.8)}/></g>`;
    s += pair(60, 64, 12, 7, { lid: '#9AA9CA', lidY: 0.05, lidRot: -6, dir: [0, 0.2] });
    s += M.o(60, 82, 7);
    return s;
  }

  function zugluft(P, o, C) {
    const air = C.grad('#BFE3F2');
    let s = '';
    s += `<path d="M30 60 Q14 60 12 46 Q12 32 26 32 Q36 34 34 44" fill="none" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="M30 60 Q14 60 12 46 Q12 32 26 32 Q36 34 34 44" fill="none" stroke="#D9F0FA" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M38 90 Q20 100 24 112 Q30 118 36 110" fill="none" stroke="${OUT}" stroke-width="8" stroke-linecap="round"/><path d="M38 90 Q20 100 24 112 Q30 118 36 110" fill="none" stroke="#D9F0FA" stroke-width="4" stroke-linecap="round"/>`;
    s += `<path d="M26 72 Q24 44 50 38 Q66 26 80 40 Q96 40 94 58 Q102 72 90 84 Q86 98 66 96 Q50 104 40 94 Q22 90 26 72 Z" ${F(air)}/>`;
    s += `<path d="M40 74 Q40 60 54 60 Q64 62 62 70 Q58 76 52 72" fill="none" stroke="#7FB8D4" stroke-width="2.6" stroke-linecap="round"/>`;
    s += shine(46, 48, 8, 4, -20);
    // blowing to the right
    s += `<path d="M98 66 L116 62 M100 76 L118 78 M96 86 L110 94" fill="none" stroke="#8FCBE6" stroke-width="3.5" stroke-linecap="round"/>`;
    s += `<g transform="rotate(25 108 44)"><path d="M100 44 Q108 36 116 44 Q108 52 100 44 Z" ${F('#E07A2B', 2)}/></g>`;
    s += pair(62, 56, 11, 6.5, { dir: [0.4, 0], brow: 'angry', bw: 2.8 });
    s += `<ellipse cx="50" cy="72" rx="7" ry="5" fill="#FF7A9A" opacity=".45"/><ellipse cx="78" cy="72" rx="7" ry="5" fill="#FF7A9A" opacity=".45"/>`;
    s += M.o(86, 74, 6);
    return s;
  }

  function kerzenloescher(P, o, C) {
    const brass = C.grad('#E0AE3C'), wax = C.lin('#FFFDF5', '#E8DCC0');
    let s = '';
    // the candle it just snuffed, smoking
    s += `<rect x="12" y="78" width="14" height="30" rx="3" ${F(wax, 2.2)}/><path d="M19 78 L19 72" ${N(2)}/><path d="M8 108 L30 108 L28 114 L10 114 Z" ${F('#B5873A', 2)}/>`;
    s += `<path d="M19 70 Q14 62 20 56 Q26 50 20 42 Q16 36 22 30" fill="none" stroke="#9AA3B8" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M24 60 Q30 54 26 48" fill="none" stroke="#B9C0D0" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>`;
    // long handle as arm
    s += eth_arm('M84 72 Q104 66 110 46 Q114 34 104 32', '#C8952E');
    s += `<circle cx="104" cy="32" r="5" ${F('#E0AE3C', 2.2)}/>`;
    s += `<path d="M46 100 L42 112 M74 100 L78 112" fill="none" stroke="${OUT}" stroke-width="4.5" stroke-linecap="round"/><ellipse cx="40" cy="113" rx="7" ry="3.5" fill="${OUT}"/><ellipse cx="80" cy="113" rx="7" ry="3.5" fill="${OUT}"/>`;
    // cone body
    s += `<path d="M60 14 Q66 14 66 22 L90 98 Q60 108 30 98 L54 22 Q54 14 60 14 Z" ${F(brass)}/>`;
    s += `<circle cx="60" cy="13" r="5" ${F('#E0AE3C', 2.2)}/>`;
    s += `<path d="M30 98 Q60 108 90 98 L92 104 Q60 114 28 104 Z" ${F('#B5873A', 2.4)}/>`;
    s += `<path d="M52 32 L42 86" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".4"/>`;
    s += `<path d="M38 80 Q60 86 82 80" fill="none" stroke="#B5873A" stroke-width="2.5"/>`;
    s += pair(60, 58, 9, 6, { iris: '#7A4E26', brow: 'angry', bw: 3 });
    s += M.smirk(60, 72, 7);
    return s;
  }

  function laengstenacht(P, o, C) {
    const night = C.grad('#34428A');
    let s = '';
    s += `<ellipse cx="60" cy="113" rx="40" ry="4" fill="${OUT}" opacity=".18"/>`;
    s += `<path d="M18 110 Q8 70 26 44 Q42 22 66 24 Q98 28 104 62 Q110 90 102 110 Q92 104 82 110 Q72 104 60 110 Q48 104 38 110 Q28 104 18 110 Z" ${F(night)}/>`;
    s += [[30, 70, 3], [92, 80, 3.5], [40, 96, 2.5], [86, 50, 2.5], [76, 98, 2.5], [28, 52, 2], [62, 100, 2]].map(([x, y, r]) => spark(x, y, r, '#FFE58A')).join('');
    s += [[50, 92], [96, 66], [36, 84], [70, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#FFF6C8"/>`).join('');
    s += shine(40, 44, 10, 5, -25);
    // nightcap
    s += `<path d="M32 40 Q40 10 74 10 Q100 12 110 34 Q96 22 82 26 Q90 30 90 40 Q60 30 32 40 Z" ${F(C.grad('#5A6BC0'))}/>`;
    s += `<path d="M30 40 Q60 28 92 40 L92 46 Q60 36 30 46 Z" ${F('#E8ECFA', 2.2)}/>`;
    s += `<circle cx="110" cy="36" r="6" ${F('#E8ECFA', 2.2)}/>`;
    s += `<path d="M58 18 l2 -4 l2 4 l4 .6 l-3 3 l.8 4 l-3.8 -2 l-3.8 2 l.8 -4 l-3 -3 Z" fill="#FFE58A"/>`;
    // moon cradled in an arm
    s += `<path d="M14 58 Q-2 78 14 96 Q6 78 18 62 Q18 56 14 58 Z" ${F('#FFE58A', 2.2)}/>`;
    s += eth_arm('M26 74 Q16 82 18 92', '#34428A');
    s += pair(62, 62, 13, 7.5, { lid: '#4A58A8', lidY: 0.1, dir: [0, 0.3] });
    s += `<ellipse cx="62" cy="84" rx="7" ry="8" ${F('#1E2758', 2.4)}/><ellipse cx="62" cy="88" rx="4" ry="2.5" fill="#E8516F"/>`;
    s += C.glyph(16, `<text x="16" y="34" font-family="sans-serif" font-weight="900" font-size="16" fill="#E8ECFA" stroke="${OUT}" stroke-width="1.4" text-anchor="middle">Z</text><text x="24" y="16" font-family="sans-serif" font-weight="900" font-size="11" fill="#E8ECFA" stroke="${OUT}" stroke-width="1" text-anchor="middle">z</text>`);
    return s;
  }

  function spaetfrost(P, o, C) {
    const ice = C.grad('#9FD8F5');
    let s = '';
    // a branch with a frozen blossom
    s += `<path d="M6 108 Q30 100 46 104" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M6 108 Q30 100 46 104" fill="none" stroke="#8A5A3A" stroke-width="3.5" stroke-linecap="round"/>`;
    s += `<g transform="translate(18 98)">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-5" rx="3.6" ry="5" ${F('#F7C6DA', 1.6)} transform="rotate(${r})"/>`).join('')}<circle r="2.4" ${F('#FFE066', 1.2)}/></g>`;
    s += `<path d="M10 92 l2 2 M24 90 l-2 2 M14 106 l1 -3" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
    s += `<path d="M40 96 L36 112 M80 96 L84 112" fill="none" stroke="${OUT}" stroke-width="4.5" stroke-linecap="round"/><ellipse cx="34" cy="113" rx="6.5" ry="3" fill="${OUT}"/><ellipse cx="86" cy="113" rx="6.5" ry="3" fill="${OUT}"/>`;
    // ice crown
    s += `<path d="M36 40 L40 18 L48 34 L56 8 L64 32 L72 12 L78 34 L86 20 L86 42 Z" ${F(C.lin('#FFFFFF', '#9FD8F5'), 2.4)}/>`;
    s += eth_arm('M32 64 Q20 56 18 46', '#9FD8F5') + `<path d="M18 46 l-4 -6 M18 46 l0 -7 M18 46 l5 -5" ${N(2.4)}/>`;
    s += eth_arm('M88 64 Q100 56 102 46', '#9FD8F5');
    s += `<path d="M60 30 L92 48 L92 84 L60 102 L28 84 L28 48 Z" ${F(ice)}/>`;
    s += `<path d="M60 30 L60 44 M92 48 L80 54 M28 48 L40 54" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>`;
    s += shine(42, 52, 7, 3.5, -30);
    s += spark(102, 40, 5, '#fff') + spark(10, 30, 4, '#D9F2FF') + spark(108, 92, 3, '#fff');
    s += pair(60, 64, 11, 6.5, { iris: '#3F8FD0', brow: 'angry', bw: 3 });
    s += M.fangs(60, 80, 8);
    return s;
  }

  function maerzsturm(P, o, C) {
    const cloud = C.grad('#8C93B8');
    let s = '';
    s += `<path d="M24 74 Q8 72 10 56 Q10 42 26 42 Q30 22 52 24 Q62 10 80 18 Q98 18 100 36 Q114 40 112 56 Q112 72 96 74 Z" ${F(cloud)}/>`;
    s += `<path d="M26 74 Q18 64 26 56 M96 74 Q104 64 96 58" fill="none" stroke="#6E7598" stroke-width="2.4" stroke-linecap="round"/>`;
    s += shine(40, 36, 9, 4.5, -20);
    // whirling gusts and a bent umbrella below
    s += `<path d="M16 86 Q40 80 60 88 Q80 96 100 86 M24 98 Q44 92 64 100" fill="none" stroke="#A9C4E0" stroke-width="3.5" stroke-linecap="round"/>`;
    s += `<g transform="rotate(25 80 104)"><path d="M64 104 Q66 90 80 90 Q94 90 96 104 Q90 98 86 104 Q82 96 76 104 Q72 98 68 104 Q66 100 64 104 Z" ${F('#E8516F', 2.2)}/><path d="M80 104 L80 116 Q80 120 76 118" ${N(2.4)}/></g>`;
    s += `<path d="M30 112 L36 108 M18 104 l6 2" stroke="#8FD0FF" stroke-width="3" stroke-linecap="round"/>`;
    s += `<g transform="rotate(-30 18 102)"><path d="M12 102 Q18 94 24 102 Q18 110 12 102 Z" ${F('#FFD23F', 1.8)}/></g>`;
    s += pair(54, 46, 11, 6.5, { brow: 'angry', bw: 3, dir: [-0.3, 0.1] });
    s += `<ellipse cx="38" cy="60" rx="7" ry="5" fill="#FF7A9A" opacity=".45"/><ellipse cx="70" cy="60" rx="7" ry="5" fill="#FF7A9A" opacity=".45"/>`;
    s += M.o(54, 62, 7);
    return s;
  }

  function morgenmuffel(P, o, C) {
    const fur = C.grad('#7CB85A');
    let s = `<ellipse cx="60" cy="113" rx="34" ry="3.5" fill="${OUT}" opacity=".15"/>`;
    s += `<path d="M22 104 Q14 70 34 50 Q46 38 62 40 Q86 40 96 60 Q106 82 98 104 Q80 112 60 110 Q38 112 22 104 Z" ${F(fur)}/>`;
    s += `<path d="M34 50 L30 40 L40 46 L42 34 L50 42 L56 30 L60 40 L68 30 L70 42 L80 36 L78 48" ${F('#7CB85A', 2.4)}/>`;
    s += shine(40, 58, 8, 4, -25);
    // pyjama stripes and slippers
    s += `<ellipse cx="42" cy="110" rx="10" ry="5" ${F('#B58ED9', 2.2)}/><ellipse cx="80" cy="110" rx="10" ry="5" ${F('#B58ED9', 2.2)}/>`;
    // nightcap flopping over
    s += `<path d="M38 46 Q50 22 76 28 Q94 34 100 54 Q90 44 82 46 Q84 40 78 40 Q58 36 38 46 Z" ${F(C.grad('#B58ED9'), 2.4)}/><circle cx="100" cy="56" r="5" ${F('#FFF6DD', 2)}/>`;
    // coffee cup
    s += eth_arm('M28 82 Q20 88 24 96', '#7CB85A');
    s += `<path d="M12 84 L32 84 L30 102 L14 102 Z" ${F('#FFF6DD', 2.2)}/><path d="M32 88 Q38 90 31 97" ${N(2.2)}/><path d="M12 84 L32 84" stroke="#6B4A2B" stroke-width="3"/>`;
    s += `<path d="M18 80 Q16 74 20 70 M26 80 Q24 74 28 68" fill="none" stroke="#B9C0D0" stroke-width="2.2" stroke-linecap="round"/>`;
    s += `<ellipse cx="25" cy="94" rx="5.5" ry="4.5" ${F('#7CB85A', 2)}/>`;
    // tired eyes with bags
    s += `<path d="M42 74 Q48 78 54 74 M66 74 Q72 78 78 74" fill="none" stroke="#4A7A3A" stroke-width="2.2" stroke-linecap="round"/>`;
    s += pair(60, 66, 12, 6.5, { lid: '#6AA24A', lidY: 0.1, lidRot: -4, dir: [0, 0.25] });
    s += M.frown(60, 88, 8);
    return s;
  }

  function mauer(P, o, C) {
    const brick = C.grad('#C8654A');
    let s = `<ellipse cx="60" cy="114" rx="46" ry="3.5" fill="${OUT}" opacity=".15"/>`;
    s += `<path d="M30 108 L26 114 M90 108 L94 114" ${N(4)}/><ellipse cx="24" cy="114" rx="8" ry="3" fill="${OUT}"/><ellipse cx="96" cy="114" rx="8" ry="3" fill="${OUT}"/>`;
    s += `<path d="M14 26 L22 26 L22 20 L34 20 L34 26 L46 26 L46 20 L58 20 L58 26 L70 26 L70 20 L82 20 L82 26 L94 26 L94 20 L106 20 L106 110 L14 110 Z" ${F(brick)}/>`;
    s += [38, 50, 62, 74, 86, 98].map((y) => `<path d="M14 ${y} L106 ${y}" stroke="${OUT}" stroke-width="1.8"/>`).join('');
    s += [26, 38, 50, 62, 74, 86, 98].map((y, i) => [0, 1, 2, 3].map((k) => { const x = 14 + (i % 2 ? 12 : 24) + k * 24; return x < 106 ? `<path d="M${x} ${y} L${x} ${y + 12}" stroke="${OUT}" stroke-width="1.8"/>` : ''; }).join('')).join('');
    s += `<path d="M14 26 L106 26" stroke="${OUT}" stroke-width="1.8"/>`;
    s += `<path d="M14 98 Q20 92 26 98 Q24 104 30 106 L14 110 Z" fill="#5FA64A"/><path d="M106 40 Q98 44 100 52 L106 54 Z" fill="#5FA64A"/>`;
    s += shine(32, 34, 10, 4, -10);
    // crossed arms
    s += `<path d="M16 76 Q30 96 74 92" fill="none" stroke="${OUT}" stroke-width="13" stroke-linecap="round"/><path d="M16 76 Q30 96 74 92" fill="none" stroke="#B05440" stroke-width="8" stroke-linecap="round"/><circle cx="76" cy="91" r="7" ${F('#B05440', 2.4)}/>`;
    s += `<path d="M104 76 Q90 100 46 98" fill="none" stroke="${OUT}" stroke-width="13" stroke-linecap="round"/><path d="M104 76 Q90 100 46 98" fill="none" stroke="#D27A5E" stroke-width="8" stroke-linecap="round"/><circle cx="44" cy="97" r="7" ${F('#D27A5E', 2.4)}/>`;
    s += pair(60, 54, 12, 6.5, { brow: 'angry', bw: 3.5 });
    s += M.flat(60, 70, 8);
    return s;
  }

  function zankapfel(P, o, C) {
    const apple = C.grad('#E2412F');
    let s = `<ellipse cx="60" cy="113" rx="32" ry="3.5" fill="${OUT}" opacity=".15"/>`;
    s += `<path d="M44 100 L40 112 M76 100 L80 112" ${N(4.5)}/><ellipse cx="38" cy="113" rx="7" ry="3" fill="${OUT}"/><ellipse cx="82" cy="113" rx="7" ry="3" fill="${OUT}"/>`;
    s += eth_arm('M28 70 Q14 64 14 50', '#E2412F') + `<circle cx="14" cy="48" r="6" ${F('#E2412F', 2.2)}/>`;
    s += eth_arm('M92 70 Q106 64 106 50', '#E2412F') + `<circle cx="106" cy="48" r="6" ${F('#E2412F', 2.2)}/>`;
    s += `<path d="M60 40 Q74 28 90 38 Q106 52 98 78 Q90 104 70 104 Q64 102 60 104 Q56 102 50 104 Q30 104 22 78 Q14 52 30 38 Q46 28 60 40 Z" ${F(apple)}/>`;
    s += `<path d="M60 40 L62 24" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="M60 40 L62 24" fill="none" stroke="#7A4E26" stroke-width="3" stroke-linecap="round"/>`;
    s += `<path d="M62 30 Q72 18 84 22 Q76 34 62 30 Z" ${F('#5FB04A', 2.2)}/>`;
    s += shine(38, 52, 8, 4.5, -30);
    // steam puffs: it is fuming
    s += `<path d="M22 28 Q18 22 24 18 Q30 16 30 22 M96 22 Q98 14 104 16 Q110 20 104 26" fill="none" stroke="#C9CDD8" stroke-width="3" stroke-linecap="round"/>`;
    s += pair(60, 64, 11, 7, { brow: 'angry', bw: 3.5 });
    s += M.roar(60, 78, 10, 12);
    return s;
  }

  function neidwurm(P, o, C) {
    const body = C.grad('#7BC95A'), belly = '#D8F0A8';
    let s = `<ellipse cx="62" cy="112" rx="40" ry="3.5" fill="${OUT}" opacity=".15"/>`;
    const seg = [[98, 98, 11], [84, 104, 12], [68, 106, 13], [52, 102, 14], [40, 92, 15]];
    s += seg.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${F(body)}/>`).join('');
    s += seg.map(([x, y, r]) => `<path d="M${x - r * 0.6} ${y + r * 0.55} Q${x} ${y + r * 0.95} ${x + r * 0.6} ${y + r * 0.55}" fill="none" stroke="${belly}" stroke-width="3" stroke-linecap="round"/>`).join('');
    s += `<path d="M107 96 L114 92 L110 100 Z" ${F('#7BC95A', 2)}/>`;
    s += `<path d="M36 78 Q24 58 40 42" fill="none" stroke="${OUT}" stroke-width="27" stroke-linecap="round"/><path d="M36 78 Q24 58 40 42" fill="none" stroke="#7BC95A" stroke-width="22" stroke-linecap="round"/>`;
    s += `<ellipse cx="46" cy="40" rx="22" ry="20" ${F(body)}/>`;
    s += `<path d="M38 22 Q34 10 28 8 M54 22 Q58 10 66 8" ${N(2.6)}/><circle cx="28" cy="8" r="3.5" ${F('#FFD23F', 2)}/><circle cx="66" cy="8" r="3.5" ${F('#FFD23F', 2)}/>`;
    s += shine(38, 30, 6, 3, -25);
    s += [[60, 96], [76, 100], [92, 92]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#4E9A3A"/>`).join('');
    // squinting sideways at someone else's things
    s += pair(50, 38, 8, 6, { dir: [0.55, 0], lid: '#5FAE45', lidY: -0.1, lidRot: -10 });
    s += M.smirk(50, 50, 7);
    return s;
  }

  function flunkerei(P, o, C) {
    const body = C.grad('#5AA0E0');
    let s = `<ellipse cx="54" cy="113" rx="28" ry="3.5" fill="${OUT}" opacity=".15"/>`;
    s += `<path d="M42 100 L40 112 M66 100 L68 112" ${N(4.5)}/><ellipse cx="38" cy="113" rx="7" ry="3" fill="${OUT}"/><ellipse cx="70" cy="113" rx="7" ry="3" fill="${OUT}"/>`;
    // crossed fingers behind the back
    s += eth_arm('M28 80 Q16 86 18 98', '#5AA0E0') + `<path d="M15 98 L19 88 M21 98 L15 89" fill="none" stroke="${OUT}" stroke-width="5.5" stroke-linecap="round"/><path d="M15 98 L19 88 M21 98 L15 89" fill="none" stroke="#7FB8EA" stroke-width="2.6" stroke-linecap="round"/><circle cx="18" cy="99" r="4" ${F('#7FB8EA', 2)}/>`;
    s += `<path d="M54 22 Q86 56 86 76 A32 30 0 0 1 22 76 Q22 56 54 22 Z" ${F(body)}/>`;
    s += shine(40, 58, 6, 3.5, -30);
    // nose grows with every fib
    s += `<path d="M58 70 L104 62 Q110 64 104 68 L58 78 Z" ${F(C.lin('#8FC4F0', '#4A8ED0'), 2.4)}/>`;
    s += `<path d="M98 58 Q104 46 112 48 Q104 52 102 58" ${F('#5FB04A', 1.8)}/>`;
    s += pair(54, 60, 10, 6, { dir: [0.4, -0.2], brow: 'up', bw: 2.6 });
    s += M.cat(56, 88, 7);
    s += spark(20, 40, 4, '#FFE066') + spark(92, 30, 3, '#BFE6FF');
    return s;
  }

  function geruecht(P, o, C) {
    const body = C.grad('#9A6FC0');
    let s = `<ellipse cx="60" cy="113" rx="34" ry="3.5" fill="${OUT}" opacity=".15"/>`;
    // big ears that hear everything
    s += `<ellipse cx="22" cy="40" rx="12" ry="18" ${F(body)} transform="rotate(-25 22 40)"/><ellipse cx="22" cy="40" rx="6" ry="11" fill="#E39BC9" transform="rotate(-25 22 40)"/>`;
    s += `<ellipse cx="98" cy="40" rx="12" ry="18" ${F(body)} transform="rotate(25 98 40)"/><ellipse cx="98" cy="40" rx="6" ry="11" fill="#E39BC9" transform="rotate(25 98 40)"/>`;
    s += `<path d="M42 102 L40 112 M78 102 L80 112" ${N(4.5)}/><ellipse cx="38" cy="113" rx="7" ry="3" fill="${OUT}"/><ellipse cx="82" cy="113" rx="7" ry="3" fill="${OUT}"/>`;
    s += `<path d="M24 76 Q24 36 60 34 Q96 36 96 76 Q96 106 60 106 Q24 106 24 76 Z" ${F(body)}/>`;
    s += shine(42, 50, 8, 4, -25);
    // whispering behind a hand
    s += pair(54, 62, 11, 6.5, { dir: [0.5, 0], brow: 'up', bw: 2.8 });
    s += `<ellipse cx="74" cy="82" rx="5" ry="4" ${F('#7A2340', 2.2)}/>`;
    s += eth_arm('M92 98 Q100 92 90 84', '#9A6FC0');
    s += `<path d="M82 72 Q92 72 92 80 Q92 90 84 92 Q80 82 82 72 Z" ${F('#B48ADA', 2.2)}/>`;
    s += `<path d="M96 70 Q102 76 96 84 M102 64 Q112 76 102 90" fill="none" stroke="#C7A8E6" stroke-width="3" stroke-linecap="round"/>`;
    s += `<path d="M84 4 Q114 4 114 18 Q114 30 92 30 L86 36 L86 30 Q76 28 76 18 Q76 4 84 4 Z" ${F('#FFFFFF', 2.2)}/>`;
    s += C.glyph(95, `<text x="95" y="22" font-family="sans-serif" font-weight="900" font-size="11" fill="${OUT}" text-anchor="middle">psst</text>`);
    s += `<circle cx="70" cy="22" r="2" fill="#C7A8E6"/><circle cx="64" cy="28" r="1.4" fill="#C7A8E6"/>`;
    return s;
  }

  function keil(P, o, C) {
    const steel = C.lin('#B9C2D2', '#6E7890'), steelG = C.grad('#9AA4B8');
    let s = '';
    // the ground split into two halves, a heart torn apart
    s += `<path d="M4 104 L50 102 L56 112 L4 116 Z M116 104 L70 102 L64 112 L116 116 Z" ${F('#9A7A55', 2.2)}/>`;
    s += `<path d="M56 112 L60 118 L64 112" ${N(2.4)}/>`;
    s += `<g transform="rotate(-14 20 86)"><path d="M24 76 Q16 68 10 74 Q4 82 14 90 L22 96 L20 88 L24 84 Z" ${F('#FF6E8E', 2.2)}/></g>`;
    s += `<g transform="rotate(14 100 86)"><path d="M96 76 Q104 68 110 74 Q116 82 106 90 L98 96 L100 88 L96 84 Z" ${F('#FF6E8E', 2.2)}/></g>`;
    s += eth_arm('M32 40 Q18 44 16 58', '#8D97A8') + `<circle cx="16" cy="60" r="6" ${F('#9AA4B8', 2.2)}/>`;
    s += eth_arm('M88 40 Q102 44 104 58', '#8D97A8') + `<circle cx="104" cy="60" r="6" ${F('#9AA4B8', 2.2)}/>`;
    s += `<path d="M20 22 L100 22 Q104 22 102 28 L62 108 Q60 112 58 108 L18 28 Q16 22 20 22 Z" ${F(steelG)}/>`;
    s += `<path d="M20 22 L100 22 Q104 22 102 28 L98 34 L22 34 L18 28 Q16 22 20 22 Z" ${F(steel, 2.4)}/>`;
    s += `<path d="M30 40 L56 94" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".4"/>`;
    s += `<path d="M84 44 l-4 6 M76 76 l3 4" stroke="#5E6880" stroke-width="2" stroke-linecap="round"/>`;
    s += `<path d="M50 4 L52 14 M60 2 L60 14 M70 4 L68 14" stroke="#FFC93C" stroke-width="3" stroke-linecap="round"/>`;
    s += pair(60, 50, 11, 7, { iris: '#C2263F', brow: 'angry', bw: 3.5 });
    s += M.fangs(60, 66, 9);
    return s;
  }

  // stroke letters on a 6×10 grid (top at 0); the i-dot is drawn as a circle
  const DE_GL = {
    H: 'M0 0 L0 10 M6 0 L6 10 M0 5 L6 5', R: 'M0 10 L0 0 L3 0 Q6 0 6 2.75 Q6 5.5 3 5.5 L0 5.5 M3 5.5 L6 10',
    S: 'M6 1.5 Q5 0 3 0 Q0 0 0 2.6 Q0 5 3 5 Q6 5 6 7.5 Q6 10 3 10 Q1 10 0 8.5', W: 'M-0.5 0 L1.3 10 L3 3 L4.7 10 L6.5 0',
    a: 'M6 4 L6 10 M6 6.8 Q6 4 3 4 Q0 4 0 7 Q0 10 3 10 Q6 10 6 7.2', b: 'M0 0 L0 10 M0 6.8 Q0 4 3 4 Q6 4 6 7 Q6 10 3 10 Q0 10 0 7.2',
    d: 'M6 0 L6 10 M6 6.8 Q6 4 3 4 Q0 4 0 7 Q0 10 3 10 Q6 10 6 7.2', e: 'M0.2 6.6 L6 6.6 Q6 3.2 3 3.2 Q0 3.2 0 6.6 Q0 10 3 10 Q5 10 5.8 8.8',
    f: 'M5.5 1 Q4.5 0 3.5 0 Q2 0 2 2 L2 10 M0 4.5 L4.5 4.5', i: 'M3 4.5 L3 10', t: 'M2.5 0.5 L2.5 8.5 Q2.5 10 4.5 10 L5.5 9.6 M0.5 4 L5 4',
    z: 'M0 4 L6 4 L0 10 L6 10', 2: 'M0.4 2 Q1 0 3 0 Q6 0 6 3 Q6 5 0 10 L6 10', 3: 'M0.4 1 Q1.5 0 3 0 Q6 0 6 2.6 Q6 5 3 5 Q6 5 6 7.5 Q6 10 3 10 Q1 10 0 8.8',
  };
  // a word centred on cx (top at y, letter height h); always counter-mirrored so it reads right in battle
  function de_txt(C, str, cx, y, h, col, sw, rot) {
    const k = h / 10, w = (str.length * 8.5 - 2.5) * k, x0 = cx - w / 2;
    let d = '', dots = '';
    [...str].forEach((ch, i) => {
      const x = x0 + i * 8.5 * k;
      d += `<path d="${DE_GL[ch]}" transform="translate(${f1(x)} ${y}) scale(${k})" stroke-width="${f1(sw / k)}"/>`;
      if (ch === 'i') dots += `<circle cx="${f1(x + 3 * k)}" cy="${f1(y + 1.6 * k)}" r="${f1(sw * 0.62)}"/>`;
    });
    const g = (c, extra) => `<g fill="none" stroke="${c}" stroke-linecap="round" stroke-linejoin="round">${d.replace(/stroke-width="([\d.]+)"/g, (m, v) => `stroke-width="${f1(+v + extra / k)}"`)}</g><g fill="${c}" stroke="${c}" stroke-width="${extra}">${dots}</g>`;
    const body = col === OUT ? g(OUT, 0) : g(OUT, 2.2) + g(col, 0);
    return C.glyph(cx, rot ? `<g transform="rotate(${rot} ${cx} ${f1(y + h / 2)})">${body}</g>` : body);
  }
  // stick limb with an outline (like the arms of streichholzkopf)
  const de_limb = (d, c, w) => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${(w || 3.5) + 3.5}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w || 3.5}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const de_ground = (rx) => `<ellipse cx="60" cy="113" rx="${rx || 30}" ry="4.5" fill="${OUT}" opacity=".16"/>`;

  function pencil(P, o, C) {
    const e = o.evo;
    const yel = C.grad('#FFC93C'), wood = C.lin('#F7DDA8', '#DDAE6C');
    let s = de_ground(32);
    s += de_limb('M47 94 L43 110 M73 94 L77 110', OUT, 1.5);
    s += `<ellipse cx="40" cy="111" rx="8" ry="4.5" ${F('#E0413A', 2.2)}/><ellipse cx="80" cy="111" rx="8" ry="4.5" ${F('#E0413A', 2.2)}/><path d="M36 109.5 L40 108.5 M76 109.5 L80 108.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;
    s += `<path d="M40 92 L80 92 L63 108 Q60 111 57 108 Z" ${F(wood)}/>`;
    s += `<path d="M54.5 102.5 L65.5 102.5 L62.5 107.5 Q60 110 57.5 107.5 Z" fill="#4A4E5A"/><path d="M40 92 L57 108 Q60 111 63 108 L80 92" fill="none" ${S()}/>`;
    s += de_limb('M40 66 Q28 66 24 54', '#FFC93C') + de_limb('M80 68 Q92 74 94 84', '#FFC93C');
    s += `<circle cx="23" cy="50" r="5.5" ${F('#fff', 2.2)}/><circle cx="95" cy="87" r="5.5" ${F('#fff', 2.2)}/>`;
    s += `<rect x="40" y="36" width="40" height="58" rx="3" ${F(yel)}/>`;
    s += `<path d="M53 37 L53 92 M67 37 L67 92" stroke="#D9951C" stroke-width="2" opacity=".8"/><path d="M44 40 L44 88" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>`;
    s += `<path d="M40 92 Q46.7 97 53.3 92 Q60 97 66.7 92 Q73.3 97 80 92" ${F('#FFC93C', 2.2)}/>`;
    if (e === 2) s += `<path d="M41 82 L79 82 L79 88 L41 88 Z" fill="#4FB0FF"/><path d="M41 82 L79 82 M41 88 L79 88" ${N(2)}/>`;
    s += `<path d="M40 30 L40 18 Q40 12 60 12 Q80 12 80 18 L80 30 Z" ${F(C.grad('#FF8FB1'))}/>${shine(48, 18, 5, 2.5, -10)}`;
    s += `<rect x="38" y="28" width="44" height="10" rx="2" ${F(e ? C.lin('#FFE58A', '#D9A21E') : C.lin('#EEF1F6', '#9AA3B5'))}/><path d="M39 33 L81 33" stroke="${e ? '#B5841A' : '#7F889A'}" stroke-width="1.6"/>`;
    s += pair(60, 55, 10, 6.5, { brow: e ? 'up' : null, bw: 2.6, iris: e === 2 ? '#3F7FD8' : null });
    s += M.smile(60, 68, 7) + blush(60, 66, 15, 4);
    if (e === 2) s += spark(70, 104, 3, '#fff');
    return s;
  }

  function ruler(P, o, C) {
    const e = o.evo;
    const wood = C.grad('#EDBB6E'), blue = C.lin('#9FD8FF', '#3A8AD8');
    let s = de_ground(30);
    s += de_limb('M50 98 L48 110 M70 98 L72 110', OUT, 1.5);
    s += `<ellipse cx="45" cy="111" rx="8" ry="4.5" ${F('#3A8AD8', 2.2)}/><ellipse cx="75" cy="111" rx="8" ry="4.5" ${F('#3A8AD8', 2.2)}/>`;
    s += de_limb('M40 66 Q28 72 26 84', '#EDBB6E') + de_limb('M80 60 Q94 56 96 42', '#EDBB6E');
    s += `<circle cx="26" cy="87" r="5.5" ${F('#F7D49A', 2.2)}/><circle cx="96" cy="39" r="5.5" ${F('#F7D49A', 2.2)}/>`;
    s += `<rect x="38" y="14" width="44" height="88" rx="6" ${F(wood)}/>`;
    s += `<path d="M76 15 L76 101" stroke="${OUT}" stroke-width="2"/><path d="M77 16 L80 16 Q81 16 81 20 L81 96 Q81 100 78 100 L77 100 Z" fill="${blue}"/><path d="M79 22 L79 50" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;
    s += `<path d="M50 24 Q52 50 49 70 M66 76 Q64 88 66 96" fill="none" stroke="#C98E45" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`;
    let ticks = '';
    for (let i = 0; i <= 20; i++) { const y = 20 + i * 4; ticks += `M38 ${y} L${i % 5 ? 43 : 47} ${y} `; }
    s += `<path d="${ticks}" fill="none" stroke="${OUT}" stroke-width="1.6" stroke-linecap="round"/>`;
    s += de_txt(C, '2', 52, 60, 6, OUT, 1.6) + de_txt(C, '3', 52, 80, 6, OUT, 1.6);
    s += shine(46, 24, 3, 6, 0);
    s += pair(60, 38, 9, 6, { brow: e ? 'up' : null, bw: 2.6, iris: e === 2 ? '#3A8AD8' : null });
    s += M.smile(60, 50, 6) + blush(60, 48, 13, 3.5);
    if (e >= 1) s += `<path d="M63 66 Q70 76 70 80 A7 7 0 0 1 56 80 Q56 76 63 66 Z" ${F(blue, 2)}/><path d="M60 77 Q59 81 61 83" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`;
    if (e === 2) s += `<path d="M38 22 L38 18 Q38 14 44 14 L76 14 Q82 14 82 18 L82 22 Z M38 94 L82 94 L82 96 Q82 102 76 102 L44 102 Q38 102 38 96 Z" ${F('#FFC93C', 2)}/>`;
    return s;
  }

  function buchstabendreher(P, o, C) {
    const body = C.grad('#C46BD6'), lt = '#E7B3F0';
    const arrow = (d, tip) => `<path d="${d}" fill="none" stroke="#9C7BD0" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="7 5"/><path d="${tip}" fill="#9C7BD0"/>`;
    let s = arrow('M18 96 Q60 120 102 92', 'M104 86 L106 98 L96 96 Z') + arrow('M102 28 Q60 4 18 30', 'M14 24 L14 36 L24 32 Z');
    s += `<ellipse cx="60" cy="112" rx="12" ry="3" fill="${OUT}" opacity=".16"/>`;
    s += de_limb('M32 62 Q20 64 16 72', '#C46BD6', 3) + de_limb('M88 60 Q100 60 104 52', '#C46BD6', 3);
    s += `<path d="M24 34 Q60 22 96 34 Q100 46 86 58 Q78 72 70 82 Q66 94 62 106 Q60 111 58 106 Q54 94 48 82 Q36 70 32 58 Q18 46 24 34 Z" ${F(body)}/>`;
    s += `<ellipse cx="60" cy="34" rx="36" ry="9" ${F(lt, 2.2)}/><path d="M36 34 Q60 42 84 32" fill="none" stroke="#B25BC4" stroke-width="2.4" stroke-linecap="round"/>`;
    s += `<path d="M36 66 Q60 76 84 62 M46 82 Q60 88 72 80 M54 96 Q60 99 66 94" fill="none" stroke="${lt}" stroke-width="3" stroke-linecap="round"/>`;
    s += shine(36, 46, 6, 3, -25);
    s += pair(60, 50, 10, 7, { look: 'dizzy' }) + M.tongue(60, 61, 7);
    s += de_txt(C, 'b', 14, 64, 15, '#FFE066', 3, -18) + de_txt(C, 'd', 106, 36, 15, '#FFE066', 3, 18);
    s += de_txt(C, 'ie', 100, 96, 14, '#7FD3FF', 2.6, 12) + de_txt(C, 'ei', 20, 10, 14, '#7FD3FF', 2.6, -12);
    return s;
  }

  function eselsohr(P, o, C) {
    const cover = C.grad('#F2994A');
    let s = de_ground(34);
    s += de_limb('M46 100 L44 110 M74 100 L76 110', OUT, 1.5) + `<ellipse cx="41" cy="111" rx="7" ry="4" fill="${OUT}"/><ellipse cx="79" cy="111" rx="7" ry="4" fill="${OUT}"/>`;
    s += de_limb('M26 70 Q14 74 12 86', '#F2994A', 3) + de_limb('M94 72 Q106 68 108 56', '#F2994A', 3);
    s += `<circle cx="12" cy="88" r="5" ${F('#FFE3C2', 2.2)}/><circle cx="108" cy="54" r="5" ${F('#FFE3C2', 2.2)}/>`;
    s += `<rect x="28" y="24" width="70" height="80" rx="3" ${F('#FFFDF5')}/><path d="M97 30 L97 100 M94 102 L34 102" stroke="#C9CFDD" stroke-width="1.4"/>`;
    s += `<path d="M76 29 L94 29 M82 35 L94 35 M88 41 L94 41" stroke="#9EC3EE" stroke-width="1.6"/>`;
    s += `<path d="M26 25 Q26 22 29 22 L68 22 L94 48 L94 97 Q94 100 91 100 L29 100 Q26 100 26 97 Z" ${F(cover)}/>`;
    s += `<path d="M26 25 Q26 22 29 22 L35 22 L35 100 L29 100 Q26 100 26 97 Z" ${F('#C9692A', 2.2)}/><path d="M30.5 30 L30.5 34 M30.5 44 L30.5 48 M30.5 74 L30.5 78 M30.5 88 L30.5 92" stroke="#FFE3C2" stroke-width="2" stroke-linecap="round"/>`;
    // the folded corner that gives the book its name
    s += `<path d="M68 22 L94 48 Q80 50 70 46 Q64 34 68 22 Z" ${F('#FFE3C2', 2.4)}/><path d="M70 30 Q72 40 78 44" fill="none" stroke="#E0B48A" stroke-width="1.6" stroke-linecap="round"/>`;
    s += `<rect x="42" y="72" width="42" height="20" rx="3" ${F('#FFFDF5', 2.2)}/>${de_txt(C, 'Heft', 63, 77, 10, OUT, 2.2)}`;
    s += shine(42, 30, 6, 2.5, 0);
    s += pair(60, 54, 11, 6.5, { brow: 'worried', bw: 2.8, dir: [0.2, -0.3] }) + M.wavy(60, 66, 6);
    return s;
  }

  function stummel(P, o, C) {
    const red = C.grad('#E8553A'), wood = C.lin('#F7DDA8', '#DDAE6C');
    let s = de_ground(30);
    const puff = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-8 4 Q-12 -2 -6 -5 Q-4 -11 2 -9 Q8 -12 10 -5 Q14 0 9 4 Z" ${F('#F2F4F8', 2.2)}/></g>`;
    s += `<path d="M38 40 Q32 34 30 26 M82 40 Q88 34 90 26" fill="none" stroke="#C9CFDD" stroke-width="3" stroke-linecap="round"/>` + puff(26, 20, 1) + puff(94, 18, 1.1) + puff(14, 36, 0.6);
    s += de_limb('M48 98 L46 110 M72 98 L74 110', OUT, 1.5) + `<ellipse cx="43" cy="111" rx="7" ry="4" fill="${OUT}"/><ellipse cx="77" cy="111" rx="7" ry="4" fill="${OUT}"/>`;
    s += `<path d="M36 54 L84 54 L68 30 L52 30 Z" ${F(wood)}/>`;
    s += `<path d="M52 30 L68 30 L66 25 L63 27 L61 22 L58 26 L54 24 Z" ${F('#4A4E5A', 2.2)}/>`;
    s += `<path d="M36 54 L84 54 L84 92 Q80 98 76 93 Q72 99 68 94 Q63 99 59 94 Q54 99 50 93 Q46 98 42 93 Q38 97 36 92 Z" ${F(red)}/>`;
    s += `<path d="M52 56 L52 94 M68 56 L68 94" stroke="#B83A26" stroke-width="2" opacity=".8"/><path d="M40 58 L40 88" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".4"/>`;
    s += `<path d="M36 54 Q44 59 52 54 Q60 59 68 54 Q76 59 84 54" ${F('#E8553A', 2.2)}/>`;
    s += `<g transform="rotate(-35 72 42)"><rect x="63" y="38" width="18" height="8" rx="3" ${F('#F7C9A0', 2)}/><path d="M70 40 L70 44 M74 40 L74 44" stroke="#C9926A" stroke-width="1.2"/></g>`;
    s += de_limb('M36 66 Q24 70 28 80 L36 82', '#E8553A', 3) + de_limb('M84 66 Q96 70 92 80 L84 82', '#E8553A', 3);
    s += pair(60, 66, 10, 6, { brow: 'angry', bw: 3.2, lid: '#E8553A', lidY: -0.3, lidRot: 10 }) + M.frown(60, 80, 6);
    return s;
  }

  function kritzelei(P, o, C) {
    const ink = '#2E6BD8';
    let d = '';
    for (let i = 0; i <= 220; i++) {
      const t = (i / 220) * Math.PI * 2, x = 60 + 30 * Math.cos(t) + 11 * Math.cos(11 * t + 0.6), y = 66 + 28 * Math.sin(t) + 11 * Math.sin(11 * t + 0.6) * (0.85 + 0.15 * Math.cos(3 * t));
      d += `${i ? 'L' : 'M'}${f1(x)} ${f1(y)} `;
    }
    let s = `<ellipse cx="60" cy="112" rx="30" ry="4" fill="${OUT}" opacity=".16"/>`;
    s += `<ellipse cx="60" cy="66" rx="42" ry="40" fill="#DDEEFF" ${S(2.2)}/>`;
    s += `<path d="${d}" fill="none" stroke="#7FB2F5" stroke-width="5" stroke-linejoin="round" opacity=".6"/><path d="${d}" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<path d="M98 82 Q110 90 104 100 Q98 106 104 112" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`;
    s += `<g transform="rotate(30 102 98)"><rect x="98" y="70" width="9" height="30" rx="2" ${F('#3A8AD8', 2.2)}/><path d="M98 100 L107 100 L102.5 108 Z" ${F('#E6E9F0', 2)}/><rect x="98" y="66" width="9" height="6" rx="2" ${F('#1C2541', 2)}/></g>`;
    s += `<ellipse cx="60" cy="62" rx="24" ry="17" fill="#fff" opacity=".85"/>`;
    s += pair(60, 58, 10, 7, { dir: [0.3, 0.1], brow: 'up', bw: 2.8 }) + M.grin(60, 70, 7);
    s += de_limb('M22 72 Q12 70 10 60', ink, 2) + de_limb('M30 98 L26 110 M50 104 L48 112', ink, 2);
    return s;
  }

  function radierer(P, o, C) {
    const front = C.grad('#5CC96A'), top = '#9BE38E', side = '#2F8F45';
    let s = `<ellipse cx="60" cy="112" rx="48" ry="5" fill="${OUT}" opacity=".18"/>`;
    s += `<path d="M2 112 Q8 104 14 110 T26 110" fill="none" stroke="#5A6070" stroke-width="2.6" stroke-linecap="round"/><path d="M26 110 Q30 106 34 110" fill="none" stroke="#5A6070" stroke-width="2.6" stroke-linecap="round" opacity=".35"/>`;
    s += [[8, 30, 20], [14, 92, -30], [110, 96, 40], [104, 108, -10], [114, 74, 70], [4, 76, 10]].map(([x, y, r]) => `<path d="M${x - 3} ${y} Q${x} ${y - 3} ${x + 3} ${y}" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round" transform="rotate(${r} ${x} ${y})"/><path d="M${x - 3} ${y} Q${x} ${y - 3} ${x + 3} ${y}" fill="none" stroke="#A8D9A0" stroke-width="2.2" stroke-linecap="round" transform="rotate(${r} ${x} ${y})"/>`).join('');
    s += de_limb('M36 104 L34 112 M82 104 L84 112', OUT, 2);
    s += `<path d="M22 44 Q22 40 26 38 L40 28 L108 28 L108 92 L94 106 L26 106 Q22 106 22 102 Z" fill="${side}" ${S()}/>`;
    s += `<path d="M30 38 L44 28 L108 28 L94 38 Z" ${F(top)}/><path d="M94 38 L108 28 L108 92 L94 106 Z" ${F(side)}/>`;
    s += `<path d="M22 50 Q22 38 36 38 L94 38 L94 106 L26 106 Q22 106 22 102 Z" ${F(front)}/>`;
    s += `<path d="M22 72 L94 72 L108 58 L108 82 L94 96 L22 96 Z" fill="#FFFDF5" ${S()}/><path d="M94 72 L94 96" ${N(2.2)}/><path d="M22 80 L94 80 L108 66 M22 88 L94 88 L108 74" fill="none" stroke="#3FA0FF" stroke-width="3"/>`;
    s += `<path d="M24 98 Q34 102 46 100 M26 102 Q40 106 58 102" fill="none" stroke="#5A6070" stroke-width="2.6" stroke-linecap="round" opacity=".55"/>` + shine(34, 48, 6, 3, -15);
    s += de_limb('M22 64 Q10 60 8 48', '#5CC96A', 4.5) + de_limb('M100 58 Q116 52 112 38', '#2F8F45', 4.5);
    s += `<circle cx="8" cy="44" r="7" ${F('#5CC96A', 2.4)}/><circle cx="112" cy="34" r="7" ${F('#4FB05A', 2.4)}/>`;
    s += pair(58, 54, 13, 7, { brow: 'angry', bw: 4, iris: '#D9343F' });
    s += M.grin(58, 64, 10);
    return s;
  }

  function fehlerteufel(P, o, C) {
    const red = C.grad('#E8443A'), wing = C.lin('#B5304A', '#6E1A35');
    let s = `<path d="M40 56 Q20 30 4 34 Q12 42 8 50 Q18 50 16 60 Q26 56 30 66 Z M80 56 Q100 30 116 34 Q108 42 112 50 Q102 50 104 60 Q94 56 90 66 Z" ${F(wing)}/>`;
    s += `<path d="M12 40 Q24 44 32 58 M108 40 Q96 44 88 58" fill="none" stroke="#E86B7E" stroke-width="2" stroke-linecap="round"/>`;
    s += `<ellipse cx="60" cy="112" rx="26" ry="4" fill="${OUT}" opacity=".16"/>`;
    s += `<path d="M44 98 Q18 104 16 86 Q14 74 24 72" fill="none" stroke="${OUT}" stroke-width="6.5" stroke-linecap="round"/><path d="M44 98 Q18 104 16 86 Q14 74 24 72" fill="none" stroke="#E8443A" stroke-width="3" stroke-linecap="round"/><path d="M24 72 L32 68 L20 62 Z" ${F('#E8443A', 2.2)}/>`;
    s += de_limb('M50 98 L46 110 M70 98 L74 110', '#C2333A', 3) + `<path d="M38 112 Q44 106 50 112 Z M70 112 Q76 106 82 112 Z" ${F(OUT, 2)}/>`;
    s += `<path d="M38 102 Q34 74 60 72 Q86 74 82 102 Z" ${F(red)}/><ellipse cx="60" cy="90" rx="11" ry="9" fill="#F7A08C" opacity=".85"/>`;
    s += de_limb('M42 82 Q32 86 30 94', '#E8443A', 3.5) + `<circle cx="30" cy="96" r="5" ${F('#E8443A', 2.2)}/>`;
    // the quill it writes its mistakes with
    s += `<path d="M90 108 L100 66" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/><path d="M99 70 Q96 44 112 30 Q114 52 104 72 Z" ${F('#FFF8E6', 2.2)}/><path d="M101 68 Q104 50 110 36" fill="none" stroke="#C9B48A" stroke-width="1.4"/>`;
    s += `<path d="M90 108 Q88 112 90 114" fill="none" stroke="#2E2A60" stroke-width="2.6" stroke-linecap="round"/><circle cx="90" cy="116" r="2" fill="#2E2A60"/>`;
    s += de_limb('M78 82 L92 86', '#E8443A', 3.5) + `<circle cx="94" cy="86" r="5.5" ${F('#E8443A', 2.2)}/>`;
    s += `<path d="M42 30 Q34 16 40 4 Q46 16 52 24 Z M78 30 Q86 16 80 4 Q74 16 68 24 Z" ${F('#3A2A40', 2.2)}/>`;
    s += `<path d="M36 46 L20 38 L32 58 Z M84 46 L100 38 L88 58 Z" ${F(red)}/>`;
    s += `<ellipse cx="60" cy="48" rx="26" ry="23" ${F(red)}/>${shine(48, 36, 7, 3.5, -20)}`;
    s += pair(60, 46, 10, 6.5, { brow: 'angry', bw: 3.2, iris: '#FFC93C', dir: [0.2, 0.1] });
    s += M.tongue(60, 58, 10) + `<path d="M53 58 L55 62 L57 58.5 M63 58.5 L65 62 L67 58" fill="#fff" ${S(1.2)}/>`;
    s += de_txt(C, 'R', 104, 4, 13, '#FFE066', 3, 20) + de_txt(C, 'e', 14, 10, 14, '#FFE066', 3, -20) + de_txt(C, 'S', 12, 108 - 12, 11, '#FFE066', 2.8, 160);
    return s;
  }

  function satzverdreher(P, o, C) {
    const body = C.grad('#FF9A6A');
    let s = `<ellipse cx="60" cy="112" rx="30" ry="4.5" fill="${OUT}" opacity=".16"/>`;
    s += de_limb('M48 100 L44 110 M72 100 L76 110', OUT, 1.5) + `<ellipse cx="41" cy="111" rx="7" ry="4" fill="${OUT}"/><ellipse cx="79" cy="111" rx="7" ry="4" fill="${OUT}"/>`;
    s += `<ellipse cx="60" cy="78" rx="30" ry="27" ${F(body)}/>${shine(46, 64, 7, 3.5, -25)}`;
    s += `<ellipse cx="60" cy="90" rx="16" ry="10" fill="#FFD3B8"/>`;
    s += de_limb('M34 70 Q18 64 16 46', '#FF9A6A', 3.5) + de_limb('M86 70 Q102 64 104 46', '#FF9A6A', 3.5);
    // it wrings a sentence strip like a wet towel
    s += `<path d="M6 24 Q30 20 50 25 L60 32 L50 39 Q30 44 6 40 Z" ${F('#FFFDF5')}/><path d="M60 32 L70 25 Q90 20 114 24 L114 40 Q90 44 70 39 Z" ${F('#CFE0F5')}/>`;
    s += `<path d="M50 25 Q56 29 60 32 Q64 35 70 39 M50 39 Q56 35 60 32 Q64 29 70 25" fill="none" stroke="#9AA3C2" stroke-width="1.6"/>`;
    s += de_txt(C, 'Satz', 28, 27, 9, OUT, 2);
    s += `<path d="M76 31 L90 31 M96 31 L104 31" stroke="#7A86A8" stroke-width="2.6" stroke-linecap="round"/><circle cx="109" cy="34" r="2.4" fill="${OUT}"/>`;
    s += `<circle cx="16" cy="42" r="5.5" ${F('#FFC9A0', 2.2)}/><circle cx="104" cy="42" r="5.5" ${F('#FFC9A0', 2.2)}/>`;
    s += `<path d="M48 12 Q60 2 72 12" fill="none" stroke="#9C7BD0" stroke-width="3" stroke-linecap="round"/><path d="M68 6 L76 14 L66 16 Z" fill="#9C7BD0"/>`;
    s += pair(60, 72, 11, 6.5, { brow: 'up', bw: 2.8, dir: [0.3, -0.3] }) + M.smirk(60, 86, 8);
    return s;
  }

  function wortsalat(P, o, C) {
    const bowl = C.grad('#C98A4E'), leaf = C.grad('#6BCB4E'), leafD = '#3E9A47';
    const tile = (x, y, rot, ch) => `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - 9}" y="${y - 9}" width="18" height="18" rx="3" ${F('#FFF6DD', 2.2)}/></g>${de_txt(C, ch, x, y - 6, 12, OUT, 2.4, rot)}`;
    let s = `<ellipse cx="60" cy="112" rx="34" ry="4.5" fill="${OUT}" opacity=".16"/>`;
    s += `<path d="M22 58 Q12 38 28 30 Q34 44 40 50 Z M98 58 Q110 40 96 28 Q88 42 82 50 Z M46 52 Q44 26 60 20 Q70 36 66 54 Z" ${F(leaf, 2.2)}/>`;
    s += `<path d="M28 34 L34 50 M96 32 L88 50 M58 26 L58 50" stroke="${leafD}" stroke-width="1.8" stroke-linecap="round"/>`;
    s += tile(36, 40, -20, 'W') + tile(84, 38, 18, 'a') + tile(62, 30, 6, 'z') + tile(15, 52, -34, 'e') + tile(105, 52, 30, 'S');
    s += `<path d="M34 58 Q30 48 42 48 Q46 40 56 46 Q64 40 70 48 Q80 42 86 50 Q94 50 90 60 Z" ${F('#8EDB6A', 2.2)}/>`;
    s += `<circle cx="72" cy="54" r="7" ${F('#E8443A', 2.2)}/><path d="M72 49 L72 59 M67 54 L77 54" stroke="#FFB3A8" stroke-width="1.4"/>`;
    s += `<path d="M44 102 L76 102 L80 110 L40 110 Z" ${F('#A56C38', 2.4)}/>`;
    s += `<path d="M10 60 L110 60 Q108 102 60 104 Q12 102 10 60 Z" ${F(bowl)}/>`;
    s += `<ellipse cx="60" cy="60" rx="50" ry="6" ${F('#E0A86A', 2.4)}/>`;
    s += `<path d="M22 70 Q24 86 36 94" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/>`;
    s += pair(60, 78, 12, 6.5, { brow: 'angry', bw: 3, dir: [0.1, 0.2] }) + M.cat(60, 92, 6);
    return s;
  }

  function knickheft(P, o, C) {
    const cover = C.grad('#3F8BE0'), dark = '#2A66B0';
    let s = de_ground(34);
    s += de_limb('M46 100 L42 110 M74 100 L78 110', OUT, 1.5) + `<ellipse cx="39" cy="111" rx="7" ry="4" fill="${OUT}"/><ellipse cx="81" cy="111" rx="7" ry="4" fill="${OUT}"/>`;
    s += de_limb('M26 74 Q14 78 14 90', '#3F8BE0', 3) + de_limb('M94 70 Q106 74 108 86', '#3F8BE0', 3);
    s += `<circle cx="14" cy="92" r="5" ${F('#CFE6FF', 2.2)}/><circle cx="108" cy="88" r="5" ${F('#CFE6FF', 2.2)}/>`;
    s += `<path d="M28 30 L60 24 L94 30 L90 58 L96 64 L92 100 L60 104 L24 98 L28 66 L22 58 Z" fill="#FFFDF5" ${S()} transform="translate(4 3)"/>`;
    s += `<path d="M24 28 L44 22 L60 26 L78 22 L94 28 L88 56 L94 62 L90 98 L70 102 L56 98 L24 100 L26 66 L20 56 Z" ${F(cover)}/>`;
    s += `<path d="M20 56 L44 60 L66 54 L88 56 L94 62 L66 62 L44 66 L26 66 Z" fill="${dark}" opacity=".55"/><path d="M20 56 L44 60 L66 54 L88 56" ${N(2.2)}/>`;
    s += `<path d="M44 22 L50 34 M78 22 L72 32 M70 102 L66 90 M24 84 L34 80" stroke="#8EC2FF" stroke-width="2" stroke-linecap="round"/>`;
    s += [32, 44, 56, 68, 80].map((x) => `<path d="M${x} 30 Q${x - 4} 22 ${x + 1} 18 Q${x + 5} 18 ${x + 4} 24" ${N(2.2)}/>`).join('');
    s += `<g transform="rotate(-6 60 84)"><rect x="40" y="76" width="40" height="15" rx="3" ${F('#FFFDF5', 2.2)}/><path d="M45 81 L75 81 M45 86 L64 86" stroke="#9AA3C2" stroke-width="2" stroke-linecap="round"/></g>`;
    s += shine(32, 40, 3, 7, 10);
    s += pair(58, 44, 10, 6.5, { brow: 'worried', bw: 2.8 }) + M.wavy(58, 72, 6);
    s += `<path d="M90 36 Q94 42 92 45 A2.6 2.6 0 0 1 87 43 Q87 40 90 36 Z" fill="#BFE6FF" ${S(1.4)}/>`;
    return s;
  }

  function punktdieb(P, o, C) {
    const body = C.grad('#9AA6C9');
    let s = `<ellipse cx="60" cy="113" rx="34" ry="4" fill="${OUT}" opacity=".16"/>`;
    s += `<path d="M70 50 Q86 20 108 30 Q120 46 112 70 Q104 86 84 80 Z" ${F(C.grad('#E8D3A8'))}/><path d="M78 46 Q90 52 98 38" fill="none" stroke="#B89A66" stroke-width="2" stroke-linecap="round"/>`;
    s += [[94, 50, 4], [104, 60, 3.5], [92, 66, 3], [104, 42, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${OUT}"/>`).join('');
    s += `<circle cx="16" cy="108" r="3" fill="${OUT}"/><circle cx="26" cy="112" r="2.4" fill="${OUT}"/>`;
    s += de_limb('M46 96 L40 108 M74 96 L80 106', OUT, 1.5) + `<ellipse cx="38" cy="110" rx="7" ry="3.6" fill="${OUT}"/><ellipse cx="83" cy="108" rx="7" ry="3.6" fill="${OUT}" transform="rotate(-15 83 108)"/>`;
    s += `<path d="M32 78 Q28 46 60 42 Q92 46 88 78 Q90 102 60 102 Q30 102 32 78 Z" ${F(body)}/>`;
    s += `<path d="M33 74 Q60 80 87 74 L88 82 Q60 88 32 82 Z M32 90 Q60 96 88 90 Q86 98 78 100 Q60 104 42 100 Q34 98 32 90 Z" fill="${OUT}" opacity=".85"/>`;
    s += shine(42, 54, 6, 3, -25);
    s += de_limb('M84 64 Q92 52 88 44', '#9AA6C9', 3.5);
    s += de_limb('M36 70 Q22 72 20 84', '#9AA6C9', 3.5) + `<circle cx="20" cy="90" r="7" fill="${OUT}"/><circle cx="18" cy="88" r="2" fill="#fff" opacity=".5"/>`;
    s += `<path d="M30 40 Q30 18 56 18 Q80 18 82 40 Z" ${F('#2E2A40')}/><path d="M28 38 L84 38 L84 44 L28 44 Z" ${F('#3A3550', 2.2)}/><circle cx="56" cy="16" r="5" ${F('#E0304A', 2)}/>`;
    s += `<path d="M30 52 Q44 46 58 52 Q72 46 86 52 Q86 64 74 64 Q64 64 58 58 Q52 64 42 64 Q30 64 30 52 Z" ${F('#2E2A40')}/>`;
    s += eye(44, 56, 5.5, { side: -1, dir: [0.5, 0.1] }) + eye(72, 56, 5.5, { side: 1, dir: [0.5, 0.1] });
    s += M.smirk(60, 70, 7);
    return s;
  }

  function spitzer(P, o, C) {
    const metal = C.grad('#B8C2D4'), topC = '#E3E8F0', sideC = '#7E8AA0';
    const shaving = (x, y, rot, k) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})"><path d="M-10 0 Q-10 -9 0 -9 Q10 -9 10 0 Q10 6 4 6 L-4 6 Q-10 6 -10 0 Z" ${F('#F4D7A1', 2)}/><path d="M-10 0 Q-10 -9 0 -9 Q10 -9 10 0" fill="none" stroke="#E0413A" stroke-width="2.6"/><path d="M-5 0 Q0 -5 5 0" fill="none" stroke="#C99A5E" stroke-width="1.4"/></g>`;
    let s = `<ellipse cx="60" cy="112" rx="50" ry="5" fill="${OUT}" opacity=".18"/>`;
    s += shaving(12, 104, -15, 0.8) + shaving(108, 106, 20, 0.7) + shaving(20, 34, 25, 0.6);
    s += `<path d="M34 28 L50 16 L106 16 L90 28 Z" ${F(topC)}/><path d="M90 28 L106 16 L106 88 L90 104 Z" ${F(sideC)}/>`;
    s += [34, 46, 58, 70, 82].map((y) => `<path d="M94 ${y} L102 ${y - 7}" stroke="#5A6478" stroke-width="2.4" stroke-linecap="round"/>`).join('');
    s += `<rect x="18" y="28" width="72" height="76" rx="5" ${F(metal)}/>`;
    s += `<path d="M24 32 L70 32 L66 42 L24 42 Z" fill="#5A6478" ${S(2)}/><circle cx="30" cy="37" r="3.4" ${F('#E3E8F0', 1.6)}/><path d="M28 37 L32 37" stroke="${OUT}" stroke-width="1.4"/>`;
    s += shine(26, 54, 3, 10, 0);
    s += `<circle cx="54" cy="80" r="17" ${F('#2E2A40')}/><circle cx="54" cy="80" r="10" fill="#4A4560"/><circle cx="54" cy="80" r="4" fill="#1C1830"/>`;
    s += `<path d="M38 74 L70 74" stroke="#C9D2E6" stroke-width="2.4"/>`;
    s += `<path d="M58 88 Q70 100 82 92 Q90 86 84 80 Q78 76 74 84 Q72 90 64 86 Z" ${F('#F4D7A1', 2.2)}/><path d="M58 88 Q70 100 82 92 Q90 86 84 80" fill="none" stroke="#E0413A" stroke-width="2.4"/>`;
    s += pair(54, 54, 13, 7, { brow: 'angry', bw: 4, dir: [0, 0.2] });
    return s;
  }

  function rotstift(P, o, C) {
    const red = C.grad('#D9343F'), wood = C.lin('#F7DDA8', '#DDAE6C'), redMark = '#E0304A';
    const check = (x, y, k) => C.glyph(x, `<path d="M${x - 6 * k} ${y} L${x - 2 * k} ${y + 5 * k} L${x + 7 * k} ${y - 7 * k}" fill="none" stroke="${OUT}" stroke-width="${f1(3.4 * k + 2.6)}" stroke-linecap="round" stroke-linejoin="round"/><path d="M${x - 6 * k} ${y} L${x - 2 * k} ${y + 5 * k} L${x + 7 * k} ${y - 7 * k}" fill="none" stroke="${redMark}" stroke-width="${f1(3.4 * k)}" stroke-linecap="round" stroke-linejoin="round"/>`);
    let s = `<ellipse cx="60" cy="113" rx="32" ry="4.5" fill="${OUT}" opacity=".18"/>`;
    s += check(16, 30, 1.4) + de_txt(C, 'f', 104, 18, 16, redMark, 3.4) + de_txt(C, 'R', 106, 70, 13, redMark, 3) + `<path d="M4 104 q4 -4 8 0 t8 0 t8 0" fill="none" stroke="${redMark}" stroke-width="3" stroke-linecap="round"/>`;
    s += de_limb('M50 102 L46 112 M70 102 L74 112', OUT, 1.5) + `<ellipse cx="43" cy="113" rx="8" ry="4" fill="${OUT}"/><ellipse cx="77" cy="113" rx="8" ry="4" fill="${OUT}"/>`;
    s += de_limb('M42 70 Q28 76 22 64', '#D9343F', 3.5) + `<circle cx="20" cy="60" r="5.5" ${F('#fff', 2.2)}/><path d="M20 55 L18 46" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/><path d="M20 55 L18 46" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;
    s += de_limb('M78 72 Q90 80 94 92', '#D9343F', 3.5) + `<circle cx="95" cy="95" r="5.5" ${F('#fff', 2.2)}/>`;
    s += `<path d="M42 44 L78 44 L63 16 L57 16 Z" ${F(wood)}/><path d="M57 16 L63 16 L60 8 Z" ${F(redMark, 2.2)}/>`;
    s += `<rect x="42" y="44" width="36" height="52" ${F(red)}/>`;
    s += `<path d="M54 46 L54 94 M66 46 L66 94" stroke="#A82830" stroke-width="2"/><path d="M46 50 L46 90" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".4"/>`;
    s += `<path d="M42 44 Q48 49 54 44 Q60 49 66 44 Q72 49 78 44" ${F('#D9343F', 2.2)}/>`;
    s += `<rect x="40" y="94" width="40" height="9" rx="2" ${F(C.lin('#FFE58A', '#D9A21E'))}/><path d="M41 98.5 L79 98.5" stroke="#B5841A" stroke-width="1.6"/>`;
    s += pair(60, 60, 9, 5.5, { brow: 'angry', bw: 3.4, dir: [0, 0.2] });
    s += `<path d="M45 63 L75 63" stroke="${OUT}" stroke-width="2.2"/><path d="M46 63 Q46 70 52 70 Q57 70 57 63 M63 63 Q63 70 68 70 Q74 70 74 63" fill="#BFE3FF" fill-opacity=".45" ${S(2.4)}/>`;
    s += M.frown(60, 80, 7);
    return s;
  }

  function zeilenspringer(P, o, C) {
    const body = C.grad('#FF9A3D');
    let s = `<path d="M6 90 L104 78 L114 110 L12 116 Z" ${F('#FFFDF5')}/>`;
    s += [0, 1, 2, 3].map((i) => `<path d="M${16 + i * 1.5} ${92 + i * 6} L${98 + i * 3} ${83 + i * 6.5}" stroke="${i === 1 || i === 2 ? '#C9CFDD' : '#7A86A8'}" stroke-width="2.6" stroke-linecap="round"${i === 1 || i === 2 ? ' stroke-dasharray="6 4"' : ''}/>`).join('');
    s += `<path d="M18 90 Q20 40 46 34" fill="none" stroke="${OUT}" stroke-width="2.4" stroke-dasharray="2 5" stroke-linecap="round"/><path d="M84 52 Q98 70 96 98" fill="none" stroke="${OUT}" stroke-width="2.4" stroke-dasharray="2 5" stroke-linecap="round"/><path d="M90 96 L96 106 L102 95 Z" fill="${OUT}"/>`;
    // spring legs: it bounces over whole lines
    const coil = (x, y) => `<path d="M${x} ${y} l-5 3 l10 3 l-10 3 l10 3 l-10 3 l5 3" fill="none" stroke="${OUT}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M${x} ${y} l-5 3 l10 3 l-10 3 l10 3 l-10 3 l5 3" fill="none" stroke="#C9D2E6" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += coil(54, 62) + coil(72, 60);
    s += `<ellipse cx="53" cy="82" rx="8" ry="4" ${F('#FF9A3D', 2.2)}/><ellipse cx="73" cy="80" rx="8" ry="4" ${F('#FF9A3D', 2.2)}/>`;
    s += `<path d="M44 26 Q36 8 46 4 Q52 14 52 24 Z M76 24 Q84 6 76 2 Q68 12 68 22 Z" ${F(body)}/><path d="M46 22 Q42 12 46 9 M74 20 Q78 10 75 7" fill="none" stroke="#FFC9A0" stroke-width="2.4" stroke-linecap="round"/>`;
    s += de_limb('M40 44 Q28 40 26 30', '#FF9A3D', 3) + de_limb('M84 44 Q96 40 98 30', '#FF9A3D', 3);
    s += `<circle cx="26" cy="27" r="4.5" ${F('#FFC9A0', 2.2)}/><circle cx="98" cy="27" r="4.5" ${F('#FFC9A0', 2.2)}/>`;
    s += `<ellipse cx="62" cy="44" rx="24" ry="22" ${F(body)}/>${shine(52, 32, 6, 3, -20)}`;
    s += `<ellipse cx="62" cy="54" rx="13" ry="9" fill="#FFD9B0"/>`;
    s += pair(62, 40, 9, 6.5, { dir: [0.1, 0.4], brow: 'up', bw: 2.6 }) + M.open(62, 50, 6);
    s += spark(14, 20, 4) + spark(108, 50, 3);
    return s;
  }

  // wheat ear pointing up from (x, y), k = size
  function sk_ear(x, y, k, col) {
    const c = col || '#E8C25A';
    let s = `<path d="M${x} ${y} L${x} ${f1(y - 34 * k)}" fill="none" stroke="${OUT}" stroke-width="${f1(2.4 * k + 1)}" stroke-linecap="round"/>`;
    for (let i = 0; i < 4; i++) {
      const yy = f1(y - 10 * k - i * 7 * k);
      s += `<path d="M${f1(x - 6 * k)} ${f1(yy - 9 * k)} L${f1(x - 11 * k)} ${f1(yy - 20 * k)} M${f1(x + 6 * k)} ${f1(yy - 9 * k)} L${f1(x + 11 * k)} ${f1(yy - 20 * k)}" stroke="${OUT}" stroke-width="${f1(1.2 * k)}" stroke-linecap="round"/>`;
      s += `<ellipse cx="${f1(x - 4 * k)}" cy="${yy}" rx="${f1(3.6 * k)}" ry="${f1(6 * k)}" ${F(c, 1.6 * k)} transform="rotate(-24 ${f1(x - 4 * k)} ${yy})"/><ellipse cx="${f1(x + 4 * k)}" cy="${yy}" rx="${f1(3.6 * k)}" ry="${f1(6 * k)}" ${F(c, 1.6 * k)} transform="rotate(24 ${f1(x + 4 * k)} ${yy})"/>`;
    }
    return s + `<ellipse cx="${x}" cy="${f1(y - 40 * k)}" rx="${f1(3.2 * k)}" ry="${f1(5.5 * k)}" ${F(c, 1.6 * k)}/>`;
  }
  const sk_drop = (x, y, r, c) => `<path d="M${x} ${f1(y - r * 1.8)} Q${f1(x + r)} ${f1(y - r * 0.3)} ${f1(x + r)} ${y} A${r} ${r} 0 0 1 ${f1(x - r)} ${y} Q${f1(x - r)} ${f1(y - r * 0.3)} ${x} ${f1(y - r * 1.8)} Z" ${F(c || '#8FD0FF', 1.8)}/>`;
  const sk_bolt = (x, y, k, rot) => `<path d="M0 0 L-7 16 L1 15 L-5 32 L11 10 L3 11 L8 0 Z" ${F('#FFE066', 2)} transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${k})"/>`;

  function muellerin(P, o, C) {
    const skin = C.grad('#F6CDA6'), dress = C.grad('#4F7FC4'), apron = C.lin('#FFFFFF', '#E6DDCB'), scarf = C.grad('#D9453B'), sack = C.grad('#EAD7AE'), dust = '#FFFDF5';
    let s = `<path d="M18 116 Q20 80 60 78 Q100 80 102 116 Z" ${F(dress)}/>`;
    s += `<path d="M38 84 Q60 92 82 84 L88 116 L32 116 Z" ${F(apron, 2.2)}/><path d="M38 84 Q36 80 40 78 M82 84 Q84 80 80 78" fill="none" stroke="#E6DDCB" stroke-width="3" stroke-linecap="round"/>`;
    s += `<path d="M48 98 L60 98 L60 108 Q54 110 48 108 Z" ${F('#F2EBDD', 2)}/>`;
    s += [[44, 90, 3], [70, 104, 4], [76, 92, 2.5], [40, 110, 2.5], [54, 92, 1.8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#D8CCB4" opacity=".7"/>`).join('');
    // flour sack held on the right
    s += `<path d="M80 116 Q72 94 84 82 L84 74 L108 74 L108 82 Q120 94 116 116 Z" ${F(sack)}/>`;
    s += `<path d="M82 74 Q96 64 110 74 Q103 70 96 72 Q89 70 82 74 Z" ${F('#FFFDF5', 2)}/><path d="M84 81 Q96 86 108 81" fill="none" stroke="#B5864A" stroke-width="3.5" stroke-linecap="round"/>`;
    s += `<g transform="translate(98 112) scale(.75)">${sk_ear(0, 0, 0.9, '#E3A93C')}</g>`;
    s += `<circle cx="96" cy="64" r="3.5" fill="${dust}" ${S(1.2)}/><circle cx="105" cy="58" r="2.4" fill="${dust}" ${S(1.2)}/><circle cx="88" cy="60" r="2" fill="${dust}" opacity=".9"/>${spark(114, 62, 3.5, '#fff')}`;
    s += `<ellipse cx="82" cy="98" rx="6" ry="5" ${F(skin, 2)}/><ellipse cx="38" cy="104" rx="6" ry="5" ${F(skin, 2)}/>`;
    // braid behind the shoulder
    s += `<path d="M34 60 Q28 72 30 84" fill="none" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="M34 60 Q28 72 30 84" fill="none" stroke="#B5752E" stroke-width="5" stroke-linecap="round" stroke-dasharray="4 2"/><circle cx="30" cy="86" r="3" ${F('#D9453B', 1.6)}/>`;
    s += `<ellipse cx="60" cy="56" rx="25" ry="26" ${F(skin)}/>`;
    s += `<ellipse cx="35" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/><ellipse cx="85" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/>`;
    s += `<path d="M36 46 Q46 40 54 44 Q60 40 66 44 Q76 40 84 46 L84 50 Q72 44 60 47 Q48 44 36 50 Z" fill="#B5752E" ${S(2)}/>`;
    s += `<path d="M33 50 Q30 22 60 22 Q90 22 87 50 Q74 40 60 40 Q46 40 33 50 Z" ${F(scarf)}/>`;
    s += [[44, 32], [58, 28], [72, 32], [50, 38], [66, 37], [80, 42], [40, 42]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join('');
    s += `<path d="M56 23 Q46 12 52 10 Q58 12 60 21 Q62 12 68 10 Q74 12 64 23 Z" ${F(scarf, 2)}/><circle cx="60" cy="22" r="3" ${F('#B8342C', 1.8)}/>`;
    s += `<path d="M40 30 Q48 25 56 25" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".35"/>`;
    s += shine(46, 52, 5, 3, -20);
    s += pair(60, 58, 11, 5.5, { brow: 'up', bw: 2.4 });
    s += `<path d="M60 62 Q58 68 61 69" ${N(2.2)}/>${M.smile(60, 74, 7)}`;
    s += blush(60, 68, 16, 4);
    s += `<ellipse cx="74" cy="70" rx="3.5" ry="2" fill="${dust}" opacity=".85"/><ellipse cx="45" cy="47" rx="3" ry="1.6" fill="${dust}" opacity=".7"/>`;
    return s;
  }

  function wetterwart(P, o, C) {
    const skin = C.grad('#F2C49C'), coat = C.grad('#3E6E8E'), hat = C.grad('#FFC93C'), book = C.lin('#FFFFFF', '#E9EEF6');
    let s = `<path d="M18 116 Q20 80 60 78 Q100 80 102 116 Z" ${F(coat)}/>`;
    s += `<path d="M60 80 L60 116" ${N(2)}/>` + [88, 100, 112].map((y) => `<circle cx="66" cy="${y}" r="2.6" ${F('#FFC93C', 1.6)}/>`).join('');
    s += `<path d="M44 80 L56 92 L60 82 L64 92 L76 80" ${F('#F5F0E6', 2)}/>`;
    // notebook with a little weather drawing on the left
    s += `<g transform="rotate(-8 34 102)"><rect x="18" y="88" width="34" height="26" rx="2" ${F(book, 2.2)}/><path d="M35 88 L35 114" ${N(1.6)}/>`;
    s += `<circle cx="27" cy="97" r="4" ${F('#FFC93C', 1.4)}/><path d="M38 100 Q38 95 43 96 Q45 92 48 96 Q51 96 50 100 Z" ${F('#C9D6EA', 1.4)}/><path d="M22 106 L32 106 M22 110 L30 110 M39 106 L49 106 M39 110 L47 110" stroke="#9AA3C2" stroke-width="1.4" stroke-linecap="round"/></g>`;
    s += `<ellipse cx="46" cy="110" rx="6" ry="5" ${F(skin, 2)}/>`;
    // thermometer held up on the right
    s += `<rect x="94" y="56" width="12" height="48" rx="6" ${F('#FFFFFF', 2.4)}/><path d="M100 104 L100 72" stroke="#E0304A" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="106" r="7" ${F('#E0304A', 2.4)}/><circle cx="98" cy="104" r="2" fill="#fff" opacity=".6"/>`;
    s += `<path d="M104 62 L101 62 M104 68 L101 68 M104 74 L101 74 M104 80 L101 80 M104 86 L101 86" stroke="${OUT}" stroke-width="1.3" stroke-linecap="round"/>`;
    s += `<ellipse cx="91" cy="92" rx="6" ry="5.5" ${F(skin, 2)}/>`;
    s += `<ellipse cx="60" cy="56" rx="25" ry="25" ${F(skin)}/>`;
    s += `<ellipse cx="35" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/><ellipse cx="85" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/>`;
    s += `<path d="M36 52 Q34 62 38 66 L39 54 Z M84 52 Q86 62 82 66 L81 54 Z" ${F('#D9D9E3', 2)}/>`;
    // sou'wester rain hat
    if (!o.bare) s += `<path d="M34 46 Q32 20 60 18 Q88 20 86 46 Z" ${F(hat)}/><path d="M42 26 Q50 21 58 21" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".45"/>`;
    if (!o.bare) s += `<path d="M14 50 Q60 30 106 50 Q110 58 100 58 Q60 42 20 58 Q10 58 14 50 Z" ${F(hat)}/><path d="M24 52 Q60 38 96 52" fill="none" stroke="#D99A1E" stroke-width="1.8" stroke-linecap="round"/>`;
    s += shine(47, 62, 5, 3, -20);
    s += pair(60, 61, 11, 5.5, { brow: 'up', bw: 2.4, browColor: '#8A8A9A', dir: [0.2, 0.1] });
    s += `<path d="M60 64 Q57 70 61 71" ${N(2.2)}/>`;
    s += `<path d="M60 71 Q50 66 42 74 Q50 80 60 74 Q70 80 78 74 Q70 66 60 71 Z" ${F('#E3E3EC', 2)}/>${M.smile(60, 79, 4)}`;
    s += sk_drop(30, 52, 2.6) + sk_drop(94, 50, 2.2);
    s += blush(60, 70, 16, 4);
    return s;
  }

  function kartenzeichnerin(P, o, C) {
    const skin = C.grad('#E9B48A'), vest = C.grad('#4E9A5A'), hair = C.grad('#A0522D'), map = C.lin('#FFF4D6', '#E9D29E'), brass = C.grad('#E8B23A');
    let s = `<path d="M84 34 Q108 28 106 56 Q102 68 92 70 Q98 54 86 46 Z" ${F(hair)}/><path d="M86 38 L92 44" stroke="#3B7DD8" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M18 116 Q20 80 60 78 Q100 80 102 116 Z" ${F('#F5F0E6')}/>`;
    s += `<path d="M20 116 Q22 84 46 80 L52 116 Z M100 116 Q98 84 74 80 L68 116 Z" ${F(vest, 2.2)}/><rect x="28" y="96" width="12" height="9" rx="2" ${F('#3E8048', 1.8)}/><rect x="80" y="96" width="12" height="9" rx="2" ${F('#3E8048', 1.8)}/>`;
    // rolled-up map under the left arm
    s += `<g transform="rotate(-28 30 96)"><rect x="4" y="88" width="52" height="15" rx="7" ${F(map, 2.2)}/><ellipse cx="6" cy="95.5" rx="4" ry="7.5" ${F('#F7E6B8', 2)}/><path d="M6 92 Q4 95 6 99" fill="none" stroke="#C9A35A" stroke-width="1.4"/><path d="M38 88 L38 103" stroke="#D9453B" stroke-width="3"/></g>`;
    s += `<ellipse cx="36" cy="102" rx="6" ry="5" ${F(skin, 2)}/>`;
    // compass in the right hand
    s += `<circle cx="84" cy="100" r="13" ${F(brass, 2.4)}/><circle cx="84" cy="100" r="9.5" ${F('#FFFDF5', 1.8)}/><circle cx="84" cy="86" r="2.6" ${F('#E8B23A', 1.6)}/>`;
    s += `<path d="M84 100 L80 98 L86 92 Z" fill="#E0304A"/><path d="M84 100 L88 102 L82 108 Z" fill="#9AA3C2"/><circle cx="84" cy="100" r="1.6" fill="${OUT}"/><circle cx="80" cy="96" r="2" fill="#fff" opacity=".5"/>`;
    s += `<ellipse cx="98" cy="106" rx="6" ry="5" ${F(skin, 2)}/>`;
    s += `<ellipse cx="60" cy="56" rx="25" ry="26" ${F(skin)}/>`;
    s += `<ellipse cx="35" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/><ellipse cx="85" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/>`;
    s += `<path d="M33 58 Q28 26 60 26 Q92 26 87 58 Q84 46 76 42 Q70 48 60 44 Q50 48 44 42 Q36 46 33 58 Z" ${F(hair)}/>`;
    s += `<path d="M42 33 Q50 28 58 29" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".3"/>`;
    // pencil behind the ear
    s += `<path d="M24 46 L40 64" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="M26 48 L38 62" stroke="#FFC93C" stroke-width="3" stroke-linecap="round"/><path d="M22 44 L26 48" stroke="#E8516F" stroke-width="3" stroke-linecap="round"/>`;
    s += `<ellipse cx="35" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/>`;
    s += shine(47, 52, 5, 3, -20);
    s += pair(60, 58, 11, 5.5, { brow: 'up', bw: 2.4, iris: '#4E9A5A', browColor: '#6B3A1E' });
    s += `<path d="M60 62 Q58 68 61 69" ${N(2.2)}/>${M.smile(60, 74, 7)}`;
    s += blush(60, 68, 16, 4) + [[50, 68], [54, 70], [66, 70], [70, 68]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#B5752E"/>`).join('');
    return s;
  }

  function kornkaefer(P, o, C) {
    const shell = C.grad('#8A5A32'), head = C.grad('#6E4426'), grain = C.grad('#E8C25A');
    let s = `<ellipse cx="60" cy="112" rx="46" ry="5" fill="#5A3A22" opacity=".25"/>`;
    s += `<path d="M42 88 L34 110 L28 112 M62 92 L60 112 L54 113 M82 90 L92 110 L98 111" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<ellipse cx="46" cy="74" rx="36" ry="24" ${F(shell)} transform="rotate(6 46 74)"/>`;
    s += `<path d="M18 70 Q46 64 78 78" fill="none" stroke="#5A3A20" stroke-width="2.2" stroke-linecap="round"/>`;
    s += [[26, 62], [36, 58], [48, 58], [60, 62], [24, 80], [36, 82], [48, 84], [60, 84], [70, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#4A2E18"/>`).join('');
    s += shine(34, 60, 10, 4, -8);
    s += `<ellipse cx="80" cy="70" rx="14" ry="16" ${F(head)}/>`;
    // the long weevil snout with elbowed antennae
    s += `<path d="M90 70 Q104 74 112 90" fill="none" stroke="${OUT}" stroke-width="10" stroke-linecap="round"/><path d="M90 70 Q104 74 112 90" fill="none" stroke="#7A4C2A" stroke-width="5.5" stroke-linecap="round"/>`;
    s += `<path d="M102 78 L104 60 L114 48" ${N(2.4)}/><ellipse cx="115" cy="46" rx="3" ry="4.5" fill="${OUT}" transform="rotate(35 115 46)"/>`;
    s += eye(84, 62, 7, { dir: [0.35, 0.1], brow: 'angry', bw: 3, side: 1 });
    s += `<path d="M78 78 Q84 82 90 78" ${N(2.4)}/>`;
    // the grain kernel it is nibbling
    s += `<g transform="rotate(-20 106 104)"><ellipse cx="106" cy="104" rx="11" ry="7" ${F(grain, 2.2)}/><path d="M97 104 Q106 100 115 104" fill="none" stroke="#C9921E" stroke-width="1.6"/></g><path d="M108 96 Q112 99 115 97" fill="none" stroke="#C9921E" stroke-width="2"/>`;
    s += `<circle cx="14" cy="104" r="2.4" fill="#E8C25A" ${S(1.4)}/><circle cx="8" cy="98" r="1.6" fill="#E8C25A"/>`;
    return s;
  }

  function mehlmotte(P, o, C) {
    const inner = C.lin('#F2E6CC', '#D9C9A6'), outer = C.lin('#C98A4E', '#9A5E2E'), body = C.grad('#B8A88A');
    let s = `<path d="M24 114 Q34 98 50 100 Q60 92 72 100 Q88 98 96 114 Z" ${F(C.lin('#FFFFFF', '#E3DCCB'), 2.2)}/><path d="M40 106 Q46 104 50 106 M66 104 Q72 102 78 106" fill="none" stroke="#CFC5AE" stroke-width="1.8" stroke-linecap="round"/>`;
    s += [[22, 96, 3], [98, 94, 2.6], [106, 104, 2], [14, 106, 2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${F('#FFFDF5', 1.4)}/>`).join('');
    s += `<path d="M56 70 Q34 100 26 94 Q20 84 34 72 Z M64 70 Q86 100 94 94 Q100 84 86 72 Z" ${F(inner, 2.2)}/>`;
    s += `<path d="M56 50 Q30 24 10 34 Q4 56 22 70 Q40 78 56 70 Z" ${F(inner)}/><path d="M64 50 Q90 24 110 34 Q116 56 98 70 Q80 78 64 70 Z" ${F(inner)}/>`;
    s += `<path d="M34 36 Q22 30 10 34 Q4 56 22 70 Q28 52 34 36 Z" ${F(outer, 2)}/><path d="M86 36 Q98 30 110 34 Q116 56 98 70 Q92 52 86 36 Z" ${F(outer, 2)}/>`;
    s += `<path d="M38 40 Q30 54 30 70 M82 40 Q90 54 90 70" fill="none" stroke="#7A5232" stroke-width="2" stroke-linecap="round"/>`;
    s += `<circle cx="20" cy="50" r="2" fill="#5A3A22"/><circle cx="100" cy="50" r="2" fill="#5A3A22"/>`;
    s += shine(44, 46, 6, 3, -30);
    s += `<ellipse cx="60" cy="74" rx="10" ry="24" ${F(body)}/><path d="M51 70 Q60 74 69 70 M51 80 Q60 84 69 80 M53 90 Q60 93 67 90" fill="none" stroke="#8A7A5E" stroke-width="1.8" stroke-linecap="round"/>`;
    s += `<path d="M54 36 Q48 20 36 14 M66 36 Q72 20 84 14" ${N(2.4)}/>` + along([54, 36], [48, 20], [36, 14], 5, (x, y) => `<path d="M${f1(x)} ${f1(y)} l-3 -3 M${f1(x)} ${f1(y)} l3 -3" stroke="${OUT}" stroke-width="1.4" stroke-linecap="round"/>`) + along([66, 36], [72, 20], [84, 14], 5, (x, y) => `<path d="M${f1(x)} ${f1(y)} l-3 -3 M${f1(x)} ${f1(y)} l3 -3" stroke="${OUT}" stroke-width="1.4" stroke-linecap="round"/>`);
    s += `<circle cx="60" cy="46" r="15" ${F(body)}/><path d="M46 40 Q50 32 56 34 Q60 30 64 34 Q70 32 74 40" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
    s += pair(60, 46, 7, 5.5, { dir: [0.25, 0.1], brow: 'up', bw: 2.4 });
    s += M.smirk(60, 55, 5);
    s += `<circle cx="72" cy="52" r="2.2" fill="#fff"/><circle cx="48" cy="54" r="1.6" fill="#fff"/>`;
    return s;
  }

  function getreiderost(P, o, C) {
    const rust = C.grad('#D9622B'), leaf = C.lin('#8CCB5A', '#5E9A3A');
    let s = `<path d="M4 112 Q50 92 116 108 Q60 104 4 112 Z" ${F(leaf, 2.2)}/>`;
    s += `<path d="M18 102 Q8 84 20 72 Q16 52 34 48 Q40 30 58 36 Q74 26 84 42 Q100 48 94 66 Q104 82 92 100 Q60 112 18 102 Z" ${F(rust)}/>`;
    s += [[28, 62, 4], [36, 92, 3.5], [82, 52, 3.5], [86, 88, 4], [70, 98, 2.6], [24, 82, 2.6], [50, 44, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${F('#F08A3A', 1.6)}/><circle cx="${x}" cy="${y}" r="${f1(r * 0.4)}" fill="#8A3214"/>`).join('');
    s += shine(36, 52, 8, 4, -25);
    s += `<g transform="translate(104 108)">${sk_ear(0, 0, 0.95, '#E3B341')}</g>`;
    s += [[100, 82], [108, 72], [104, 92], [100, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#C9541E"/>`).join('');
    s += [[30, 26, 2.4], [42, 16, 1.8], [62, 22, 2.6], [76, 12, 2], [54, 8, 1.6], [86, 28, 1.6], [20, 38, 1.8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#E0763A" opacity=".85"/>`).join('');
    s += pair(56, 70, 12, 7, { brow: 'angry', bw: 3, iris: '#FFC93C', dir: [0.25, 0.1] });
    s += M.grin(56, 86, 9);
    return s;
  }

  function mutterkorn(P, o, C) {
    const spur = C.grad('#5A3A6E'), husk = C.grad('#E8C25A');
    let s = `<path d="M60 116 L60 92" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="M60 116 L60 92" stroke="#B59A3A" stroke-width="3" stroke-linecap="round"/>`;
    s += `<path d="M30 70 L14 48 M34 56 L22 30 M90 70 L106 48 M86 56 L98 30 M40 44 L34 16 M80 44 L86 16" fill="none" stroke="${OUT}" stroke-width="1.8" stroke-linecap="round"/>`;
    s += [[34, 86, -30], [86, 86, 30], [30, 70, -35], [90, 70, 35], [34, 54, -30], [86, 54, 30], [42, 42, -20], [78, 42, 20]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="12" ${F(husk, 2.2)} transform="rotate(${r} ${x} ${y})"/>`).join('');
    // the dark ergot spur growing out of the ear
    s += `<path d="M40 100 Q34 60 50 30 Q60 10 74 4 Q66 24 74 48 Q84 78 78 100 Q60 110 40 100 Z" ${F(spur)}/>`;
    s += `<path d="M48 94 Q46 70 52 50 M70 96 Q74 76 70 56" fill="none" stroke="#3A2448" stroke-width="2" stroke-linecap="round"/>`;
    s += `<path d="M54 40 Q60 26 68 16" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".3"/><circle cx="66" cy="36" r="2" fill="#B9A6C9" opacity=".7"/><circle cx="50" cy="84" r="1.6" fill="#B9A6C9" opacity=".7"/>`;
    s += [[26, 100, -40], [94, 100, 40]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="11" ${F(husk, 2.2)} transform="rotate(${r} ${x} ${y})"/>`).join('');
    s += pair(60, 66, 9, 6, { look: 'glow', glow: '#C9F05C', brow: 'angry', bw: 3.2 });
    s += M.fangs(60, 82, 8);
    s += spark(16, 20, 3, '#C9F05C') + spark(104, 22, 2.4, '#C9F05C');
    return s;
  }

  function nieselregen(P, o, C) {
    const cl = C.lin('#E4ECF6', '#A9B9CF');
    let s = '';
    for (let i = 0; i < 9; i++) { const x = 26 + i * 8.5, y = 76 + (i % 3) * 9; s += `<path d="M${f1(x)} ${y} l-1.5 6" stroke="#6FB4EE" stroke-width="2" stroke-linecap="round"/><path d="M${f1(x - 3)} ${y + 15} l-1.5 6" stroke="#6FB4EE" stroke-width="2" stroke-linecap="round"/>`; }
    s += `<ellipse cx="60" cy="114" rx="30" ry="4" fill="#8FD0FF" opacity=".55"/><path d="M42 114 Q60 110 78 114" fill="none" stroke="#6FB4EE" stroke-width="1.4"/>`;
    s += `<path d="M20 64 Q10 52 22 44 Q22 28 40 32 Q48 18 64 24 Q80 18 86 34 Q102 34 100 50 Q110 60 98 68 Q60 74 20 64 Z" ${F(cl)}/>`;
    s += `<path d="M28 62 Q44 56 60 62 Q76 56 94 62" fill="none" stroke="#98A9C2" stroke-width="2" stroke-linecap="round"/>`;
    s += shine(40, 38, 8, 4, -20);
    s += pair(60, 48, 11, 6, { lid: '#C9D5E6', lidY: -0.05, dir: [0.2, 0.3] });
    s += M.wavy(60, 60, 5);
    return s;
  }

  function glatteis(P, o, C) {
    const ice = C.grad('#BDE6FF'), sheet = C.lin('#E8F7FF', '#9CD3F2');
    let s = `<path d="M2 108 Q4 96 30 96 L92 94 Q118 96 118 106 Q116 116 90 116 L28 116 Q2 116 2 108 Z" ${F(sheet, 2.2)}/>`;
    s += `<path d="M14 108 L34 108 M80 110 L104 108" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".9"/><path d="M20 104 L28 100 L36 104 M92 104 L98 100" fill="none" stroke="#7FB7DA" stroke-width="1.4"/>`;
    s += `<path d="M22 102 Q18 60 40 42 Q60 28 80 42 Q102 60 98 102 Z" ${F(ice)}/>`;
    s += `<path d="M34 60 L44 70 L40 80 M78 56 L72 66 L80 72" fill="none" stroke="#7FB7DA" stroke-width="1.8" stroke-linecap="round"/>`;
    s += `<path d="M34 86 L36 96 L38 88 M84 84 L86 96 L88 86" ${F('#E8F7FF', 1.6)}/>`;
    s += `<path d="M34 56 Q40 44 52 40" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/><path d="M30 70 Q30 64 32 60" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
    s += pair(60, 64, 12, 7, { lid: '#9CD3F2', lidRot: -8, lidY: -0.2, dir: [0.35, 0.1] });
    s += M.smirk(60, 80, 9);
    s += spark(100, 30, 5, '#fff') + spark(18, 36, 3.5, '#fff') + spark(108, 88, 3, '#fff');
    s += `<path d="M6 92 L14 92 M2 98 L12 98" stroke="#9CD3F2" stroke-width="2.4" stroke-linecap="round"/>`;
    return s;
  }

  function sturmboee(P, o, C) {
    const air = C.grad('#CFE6F7');
    let s = `<path d="M18 78 Q4 70 10 56 Q16 46 26 52 Q20 58 26 62" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M18 78 Q4 70 10 56 Q16 46 26 52 Q20 58 26 62" fill="none" stroke="#CFE6F7" stroke-width="3" stroke-linecap="round"/>`;
    s += `<path d="M24 98 Q8 100 6 88 Q6 80 16 82" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M24 98 Q8 100 6 88 Q6 80 16 82" fill="none" stroke="#CFE6F7" stroke-width="3" stroke-linecap="round"/>`;
    s += `<path d="M22 72 Q14 46 36 36 Q50 22 70 32 Q88 32 90 52 Q96 68 84 82 Q80 100 58 100 Q34 104 26 92 Q16 86 22 72 Z" ${F(air)}/>`;
    s += `<path d="M38 52 Q34 64 44 70 Q54 74 56 64 Q56 58 50 58" fill="none" stroke="#9CC4E4" stroke-width="2.6" stroke-linecap="round"/><path d="M34 86 Q48 92 62 86" fill="none" stroke="#9CC4E4" stroke-width="2.6" stroke-linecap="round"/>`;
    s += shine(44, 40, 8, 4, -20);
    s += `<circle cx="80" cy="72" r="8" fill="#FF9AB0" opacity=".55"/>`;
    s += pair(66, 54, 9, 6, { brow: 'angry', bw: 3, dir: [0.4, 0] });
    s += M.o(88, 72, 9);
    // the gust blowing out, with a leaf and a flying hat
    s += `<path d="M96 66 L116 62 M96 74 L118 76 M94 82 L112 90" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M96 66 L116 62 M96 74 L118 76 M94 82 L112 90" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>`;
    s += `<path d="M98 36 Q108 26 114 34 Q108 42 98 36 Z" ${F('#E0763A', 2)} transform="rotate(-20 106 34)"/><path d="M99 36 L113 33" stroke="#A84A1E" stroke-width="1.2"/>`;
    s += `<g transform="rotate(25 100 104)"><path d="M90 106 Q90 94 100 94 Q110 94 110 106 Z" ${F('#5E6E8E', 2.2)}/><ellipse cx="100" cy="106" rx="15" ry="4" ${F('#5E6E8E', 2.2)}/><path d="M90 102 L110 102" stroke="#E0304A" stroke-width="3"/></g>`;
    return s;
  }

  function hitzeflimmern(P, o, C) {
    const heat = C.lin('#FFE48A', '#FF8A3D'), sand = C.lin('#F2C97A', '#D9A050');
    let s = `<circle cx="96" cy="22" r="12" ${F(C.grad('#FFD23F'), 2.2)}/><path d="${spikes(96, 22, 15, 21, 0, 360, 10)}" fill="#FFC93C" ${S(1.8)}/><circle cx="96" cy="22" r="12" ${F(C.grad('#FFD23F'), 2.2)}/>`;
    s += `<path d="M4 116 L4 104 Q60 94 116 104 L116 116 Z" ${F(sand, 2.2)}/>`;
    // wavy body: the sides wobble like air over hot ground
    s += `<path d="M26 104 Q16 94 28 86 Q40 78 28 70 Q18 62 32 54 Q44 46 34 38 Q28 28 44 22 Q56 18 60 8 Q66 18 76 22 Q92 28 86 38 Q76 46 88 54 Q102 62 92 70 Q80 78 92 86 Q104 94 94 104 Z" fill="${heat}" ${S()}/>`;
    s += [44, 60, 76, 92].map((y) => `<path d="M${36 + (100 - y) * 0.3} ${y} q6 -4 12 0 t12 0 t12 0" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>`).join('');
    s += pair(60, 52, 11, 6.5, { lid: '#FFB25C', lidY: 0, dir: [0.3, 0.2] });
    s += M.smirk(60, 70, 8);
    s += `<path d="M14 92 q4 -4 8 0 t8 0 M92 94 q4 -4 8 0 t8 0 M10 76 q4 -4 8 0 t8 0" fill="none" stroke="#FF8A3D" stroke-width="2.4" stroke-linecap="round"/>`;
    return s;
  }

  function gewitterzelle(P, o, C) {
    const cl = C.lin('#8E9CC0', '#3E4A72');
    let s = sk_bolt(38, 86, 0.9, 10) + sk_bolt(78, 84, 1.1, -8);
    s += [[26, 92], [56, 98], [96, 92], [68, 108]].map(([x, y]) => `<path d="M${x} ${y} l-3 8" stroke="#6FB4EE" stroke-width="3" stroke-linecap="round"/>`).join('');
    s += `<path d="M8 22 Q30 10 60 12 Q90 10 112 22 Q108 30 86 30 Q92 40 88 52 Q104 56 102 72 Q100 86 84 86 L34 86 Q16 86 16 72 Q16 56 32 52 Q28 40 34 30 Q12 30 8 22 Z" ${F(cl)}/>`;
    s += `<path d="M30 30 Q60 36 90 30" fill="none" stroke="#5E6A92" stroke-width="2.4" stroke-linecap="round"/><path d="M26 78 Q44 72 60 78 Q78 72 96 78" fill="none" stroke="#33405F" stroke-width="2.6" stroke-linecap="round"/>`;
    s += shine(34, 18, 10, 3.5, -5) + shine(42, 58, 6, 3, -20);
    s += pair(60, 54, 11, 7, { look: 'glow', glow: '#FFE45C', brow: 'angry', bw: 3.6 });
    s += M.roar(60, 68, 10, 11);
    s += spark(10, 44, 3, '#FFE066') + spark(112, 46, 3.5, '#FFE066');
    return s;
  }

  function unwetter(P, o, C) {
    const cl = C.lin('#6E6A9E', '#2A2850');
    let s = '';
    for (let i = 0; i < 10; i++) { const x = 14 + i * 10, y = 92 + (i % 3) * 7; s += `<path d="M${x} ${y} l-5 11" stroke="#6FB4EE" stroke-width="3" stroke-linecap="round"/>`; }
    s += sk_bolt(22, 78, 1.1, 18) + sk_bolt(90, 76, 1.2, -14) + sk_bolt(58, 86, 0.8, 4);
    s += `<path d="M8 50 Q0 40 10 34 M112 50 Q120 40 110 34" fill="none" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>`;
    s += `<path d="M6 70 Q-2 50 16 42 Q12 20 36 20 Q44 2 64 8 Q82 0 92 18 Q116 16 112 42 Q124 56 110 72 Q108 88 90 86 L30 86 Q8 88 6 70 Z" ${F(cl)}/>`;
    // storm swirl in the cloud
    s += `<path d="M86 30 Q98 30 98 40 Q98 48 90 48 Q84 48 84 42 Q84 38 88 38" fill="none" stroke="#9A96CC" stroke-width="3" stroke-linecap="round"/><path d="M20 40 Q28 30 38 34" fill="none" stroke="#9A96CC" stroke-width="3" stroke-linecap="round"/>`;
    s += `<path d="M16 78 Q38 70 60 78 Q82 70 104 78" fill="none" stroke="#1E1C3E" stroke-width="3" stroke-linecap="round"/>`;
    s += shine(40, 24, 10, 4, -15) + shine(70, 14, 6, 2.5, -5);
    s += pair(60, 46, 14, 8, { look: 'glow', glow: '#FFE45C', brow: 'angry', bw: 4.2 });
    s += M.roar(60, 60, 14, 16);
    s += `<circle cx="10" cy="104" r="4" ${F('#F2FAFF', 2)}/><circle cx="110" cy="108" r="4.5" ${F('#F2FAFF', 2)}/><circle cx="102" cy="96" r="3" ${F('#F2FAFF', 1.8)}/>`;
    return s;
  }

  function nebelbank(P, o, C) {
    const fog = C.lin('#F6F6FC', '#B9BCD2');
    let s = `<path d="M92 104 L92 14" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M92 104 L92 14" stroke="#A86B3A" stroke-width="3.5" stroke-linecap="round"/>`;
    s += `<path d="M92 18 L110 17 L116 23 L110 29 L92 29 Z" ${F('#E8C38A', 2.2)}/><path d="M92 33 L74 32 L68 38 L74 44 L92 44 Z" ${F('#E8C38A', 2.2)}/><path d="M96 23 L108 23 M76 38 L88 38" stroke="#B58A50" stroke-width="2" stroke-linecap="round"/>`;
    s += `<path d="M4 102 Q0 84 18 80 Q16 60 38 60 Q44 44 62 50 Q78 38 90 54 Q110 52 108 72 Q120 82 114 100 Q112 112 96 112 L18 112 Q4 112 4 102 Z" ${F(fog)}/>`;
    s += `<path d="M18 80 Q24 84 30 82 M90 54 Q92 62 88 66 M38 60 Q40 66 46 66" fill="none" stroke="#A3A7C2" stroke-width="2.2" stroke-linecap="round"/>`;
    s += `<path d="M14 100 Q34 94 56 100 Q80 106 106 98" fill="none" stroke="#A3A7C2" stroke-width="2.4" stroke-linecap="round"/>`;
    s += `<path d="M8 50 Q16 44 26 48 Q34 52 40 46 M2 64 Q8 60 14 62 M44 30 Q52 24 62 28" fill="none" stroke="${OUT}" stroke-width="5.5" stroke-linecap="round"/><path d="M8 50 Q16 44 26 48 Q34 52 40 46 M2 64 Q8 60 14 62 M44 30 Q52 24 62 28" fill="none" stroke="#E4E6F2" stroke-width="2.4" stroke-linecap="round"/>`;
    s += shine(44, 60, 9, 3.5, -15);
    s += pair(58, 80, 13, 7.5, { lid: '#D5D7E6', lidY: -0.1, lidRot: 8, dir: [0.35, 0] });
    s += M.cat(58, 96, 7);
    return s;
  }
  function dornengestruepp(P, o, C) {
    const bush = C.grad('#3E8E41'), vine = '#7A4A2A';
    let s = `<ellipse cx="60" cy="112" rx="50" ry="5" fill="#2C5E2E" opacity=".35"/>`;
    s += `<path d="M14 108 Q4 90 14 76 Q6 58 22 48 Q24 28 44 26 Q56 12 74 22 Q94 20 98 40 Q114 50 106 68 Q116 86 104 104 Q90 114 60 112 Q30 114 14 108 Z" ${F(bush)}/>`;
    s += [[28, 44], [80, 32], [100, 82], [22, 88], [58, 22]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="4" ${F('#5FB04F', 1.8)} transform="rotate(${i * 50} ${x} ${y})"/>`).join('');
    // tangled thorny canes looping through the bush
    const cane = 'M8 66 Q22 40 44 50 M76 48 Q98 40 110 62 M10 100 Q24 84 40 98 M82 100 Q98 86 112 96 M30 28 Q22 60 20 84 M92 24 Q102 56 104 80 M38 40 Q60 26 84 38';
    s += `<path d="${cane}" fill="none" stroke="${OUT}" stroke-width="6.5" stroke-linecap="round"/><path d="${cane}" fill="none" stroke="${vine}" stroke-width="3" stroke-linecap="round"/>`;
    s += [[18, 52, -40], [36, 46, 10], [86, 44, -20], [104, 52, 40], [24, 90, -30], [34, 94, 40], [92, 92, 20], [106, 92, -50], [24, 56, -80], [101, 66, 80], [60, 31, 0], [46, 35, -30], [74, 33, 30]].map(([x, y, r]) => `<path d="M-3 0 L0 -7 L3 0 Z" ${F('#F2E3C6', 1.3)} transform="translate(${x} ${y}) rotate(${r})"/>`).join('');
    s += [[24, 66], [30, 70], [94, 60], [100, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" ${F('#3A2050', 1.6)}/><circle cx="${x - 1}" cy="${y - 1.2}" r="1" fill="#fff" opacity=".7"/>`).join('');
    s += shine(44, 34, 7, 3.5, -20);
    s += pair(62, 70, 12, 7.5, { brow: 'angry', bw: 3.4, iris: '#E0B83A', dir: [0.3, 0.1] });
    s += M.fangs(62, 86, 9);
    return s;
  }

  function morast(P, o, C) {
    const mud = C.grad('#6E5A3E'), pool = C.lin('#6E7A5A', '#3E4A34');
    let s = `<path d="M2 100 Q10 86 40 88 Q60 84 80 88 Q112 86 118 100 Q116 116 60 116 Q4 116 2 100 Z" ${F(pool)}/>`;
    s += `<path d="M10 100 Q30 94 50 100 M70 100 Q90 94 108 100" fill="none" stroke="#8FA07A" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M10 92 L6 64 M14 92 L16 70 M106 92 L110 66" ${N(2.4)}/><ellipse cx="6" cy="62" rx="3" ry="7" ${F('#7A4E2A', 2)}/><ellipse cx="110" cy="64" rx="3" ry="7" ${F('#7A4E2A', 2)}/>`;
    s += `<path d="M24 96 Q20 60 40 46 Q60 34 80 46 Q100 60 96 96 Q60 104 24 96 Z" ${F(mud)}/>`;
    s += `<path d="M26 72 Q16 72 12 60 Q10 54 14 52 M94 68 Q104 66 106 54" fill="none" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="M26 72 Q16 72 12 60 Q10 54 14 52 M94 68 Q104 66 106 54" fill="none" stroke="#6E5A3E" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M36 50 Q36 58 34 62 M84 56 Q85 62 83 66" fill="none" stroke="#5A4A30" stroke-width="4" stroke-linecap="round"/>`;
    s += shine(44, 52, 7, 3.5, -25);
    s += `<circle cx="30" cy="104" r="4" ${F('none', 1.8)}/><circle cx="40" cy="108" r="2.4" ${F('none', 1.6)}/><circle cx="74" cy="108" r="3" ${F('none', 1.6)}/><circle cx="66" cy="28" r="3" ${F('none', 1.8)}/><circle cx="56" cy="22" r="2" ${F('none', 1.6)}/>`;
    // a lost boot sinking in the bog
    s += `<g transform="translate(4 10) rotate(-18 96 92)"><path d="M88 96 L88 78 L100 78 L100 90 L108 92 Q110 98 104 98 Z" ${F('#3B7DD8', 2.2)}/><path d="M88 80 L100 80" stroke="#2A5DAA" stroke-width="2"/></g>`;
    s += pair(60, 64, 13, 8, { lid: '#5E4A30', lidY: -0.1, dir: [0.25, 0.1] });
    s += M.tongue(60, 82, 10);
    return s;
  }

  function elster(P, o, C) {
    const black = C.grad('#2E3448'), white = C.grad('#FFFFFF'), tail = C.lin('#3E8FA8', '#2A3F7A');
    let s = `<ellipse cx="52" cy="112" rx="34" ry="4" fill="${OUT}" opacity=".18"/>`;
    s += `<path d="M44 82 L4 108 L10 114 L50 92 Z" ${F(tail)}/><path d="M42 86 L8 110" stroke="#7FD0E0" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`;
    s += `<path d="M48 96 L46 110 M58 96 L60 110 M42 110 L50 110 M56 110 L64 110" ${N(3)}/>`;
    s += `<path d="M30 76 Q32 52 56 48 Q80 48 82 70 Q82 96 56 98 Q34 98 30 76 Z" ${F(black)}/>`;
    s += `<path d="M56 64 Q80 62 80 76 Q78 94 58 96 Q50 82 56 64 Z" ${F(white, 2.2)}/>`;
    s += `<path d="M30 74 Q30 60 44 56 Q56 58 58 72 Q52 90 36 88 Q30 84 30 74 Z" ${F(black, 2.2)}/><path d="M36 64 Q42 60 50 62 Q44 70 36 72 Z" ${F('#FFFFFF', 1.8)}/><path d="M34 80 Q42 84 52 78" fill="none" stroke="#3E8FA8" stroke-width="2.4" stroke-linecap="round"/>`;
    s += `<circle cx="78" cy="40" r="18" ${F(black)}/>`;
    s += shine(72, 30, 6, 3, -20);
    s += `<path d="M94 38 L114 42 L94 48 Z" ${F('#3A3A46', 2.2)}/>`;
    // stolen shiny ring in the beak
    s += `<circle cx="110" cy="52" r="7" fill="none" stroke="${OUT}" stroke-width="5.5"/><circle cx="110" cy="52" r="7" fill="none" stroke="#FFC93C" stroke-width="2.6"/><path d="M105 45 L110 40 L115 45 L110 48 Z" ${F('#5FD0F0', 1.6)}/>${spark(102, 36, 3.5, '#FFE066')}${spark(118, 60, 2.4, '#FFE066')}`;
    s += eye(84, 38, 6.5, { dir: [0.35, 0.1], brow: 'angry', bw: 3, side: 1, iris: '#4A9A6A' });
    s += `<path d="M16 34 l0 0" />${spark(22, 24, 2.6, '#FFE066')}`;
    return s;
  }

  function kartendieb(P, o, C) {
    const skin = C.grad('#E9B48A'), shirt = C.grad('#FFFFFF'), cap = C.grad('#3A3550'), map = C.lin('#FFF4D6', '#E9D29E'), sack = C.grad('#8A6A44');
    let s = `<path d="M84 116 Q76 92 88 80 L94 72 L106 74 L106 82 Q118 94 112 116 Z" ${F(sack)}/><path d="M92 76 Q100 70 108 76" fill="none" stroke="${OUT}" stroke-width="2.4"/><path d="M98 96 l4 4 m0 -4 l-4 4" stroke="#FFC93C" stroke-width="2.4" stroke-linecap="round"/>`;
    s += `<path d="M16 116 Q18 78 56 76 Q94 78 96 116 Z" ${F(shirt)}/>`;
    s += [86, 96, 106].map((y) => `<path d="M${22 - (y - 86) * 0.1} ${y} Q56 ${y - 6} ${92 + (y - 86) * 0.1} ${y}" fill="none" stroke="#3A3550" stroke-width="4.5"/>`).join('');
    s += `<path d="M16 116 Q18 78 56 76 Q94 78 96 116 Z" ${N()}/>`;
    // stolen map, half unrolled, with a compass rose
    s += `<g transform="rotate(-10 34 96)"><path d="M10 84 L50 84 L50 108 L10 108 Z" ${F(map, 2.2)}/><path d="M18 102 Q26 92 34 98 Q40 102 46 92" fill="none" stroke="#D9453B" stroke-width="2" stroke-dasharray="3 2"/><path d="M38 88 L40 94 L46 96 L40 98 L38 104 L36 98 L30 96 L36 94 Z" fill="#3B7DD8"/><rect x="44" y="82" width="10" height="28" rx="5" ${F('#F7E6B8', 2)}/></g>`;
    s += `<ellipse cx="18" cy="96" rx="6" ry="5" ${F(skin, 2)}/>`;
    s += `<ellipse cx="54" cy="50" rx="25" ry="25" ${F(skin)}/>`;
    s += `<ellipse cx="30" cy="54" rx="4.5" ry="6.5" ${F(skin, 2)}/><ellipse cx="78" cy="54" rx="4.5" ry="6.5" ${F(skin, 2)}/>`;
    s += `<path d="M28 40 Q26 18 54 16 Q82 18 80 40 Q54 32 28 40 Z" ${F(cap)}/><path d="M60 36 Q84 32 100 40 Q96 46 80 42 Z" ${F(cap)}/><circle cx="54" cy="16" r="3" ${F('#3A3550', 1.8)}/><path d="M36 26 Q44 20 52 20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".3"/>`;
    // the robber's mask
    s += `<path d="M28 46 Q54 40 80 46 L80 56 Q66 60 54 54 Q42 60 28 56 Z" ${F('#1E1A26')}/><path d="M28 50 Q20 52 18 58" fill="none" stroke="#1E1A26" stroke-width="3" stroke-linecap="round"/>`;
    s += pair(54, 51, 11, 5, { dir: [0.5, 0], brow: 'angry', bw: 3.2 });
    s += `<path d="M54 56 Q52 62 56 63" ${N(2.2)}/>${M.smirk(56, 68, 9)}`;
    s += `<path d="M42 72 Q44 76 48 74 M64 74 Q66 76 68 72" fill="none" stroke="#8A6A44" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;
    return s;
  }

  function magnetberg(P, o, C) {
    const rock = C.grad('#8A8FA0');
    let s = `<path d="M30 30 Q12 46 14 70 M90 30 Q108 46 106 70 M22 22 Q0 44 4 76 M98 22 Q120 44 116 76" fill="none" stroke="#C04A5A" stroke-width="2.2" stroke-dasharray="5 4" stroke-linecap="round" opacity=".7"/>`;
    s += `<path d="M2 114 L30 46 L44 56 L60 30 L76 56 L90 46 L118 114 Z" ${F(rock)}/>`;
    s += `<path d="M30 46 L44 56 L36 72 Z M76 56 L90 46 L84 70 Z" fill="#fff" opacity=".28"/><path d="M60 30 L70 46 L58 52 Z" fill="#fff" opacity=".25"/><path d="M74 92 L118 114 L70 114 Z" fill="${OUT}" opacity=".16"/>`;
    s += `<path d="M18 98 L26 92 L28 100 M96 86 L104 94" fill="none" stroke="#5E6272" stroke-width="2" stroke-linecap="round"/>`;
    // the horseshoe magnet that crowns the mountain
    s += `<path d="M38 36 L38 22 Q38 2 60 2 Q82 2 82 22 L82 36 L70 36 L70 22 Q70 14 60 14 Q50 14 50 22 L50 36 Z" ${F(C.grad('#E0304A'))}/>`;
    s += `<rect x="38" y="30" width="12" height="9" rx="1.5" ${F('#D9DEE8', 2.2)}/><rect x="70" y="30" width="12" height="9" rx="1.5" ${F('#D9DEE8', 2.2)}/><path d="M44 8 Q50 4 56 4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>`;
    // compass needles and nails flying towards it
    s += `<g transform="rotate(-30 12 22)"><path d="M4 22 L12 19 L12 25 Z" fill="#E0304A" ${S(1.4)}/><path d="M20 22 L12 19 L12 25 Z" fill="#E9EEF6" ${S(1.4)}/></g>`;
    s += `<g transform="rotate(35 106 16)"><path d="M98 16 L106 13 L106 19 Z" fill="#E0304A" ${S(1.4)}/><path d="M114 16 L106 13 L106 19 Z" fill="#E9EEF6" ${S(1.4)}/></g>`;
    s += `<path d="M14 40 L22 48 M100 44 L108 36" stroke="${OUT}" stroke-width="2.6" stroke-linecap="round"/><path d="M12 38 L16 42 M98 46 L102 42" stroke="${OUT}" stroke-width="4.5" stroke-linecap="round"/>`;
    s += pair(60, 72, 13, 7.5, { look: 'glow', glow: '#FF6E8E', brow: 'angry', bw: 4 });
    s += M.roar(60, 88, 13, 12);
    return s;
  }

  function schulaerztin(P, o, C) {
    const skin = C.grad('#E8B590'), coat = C.grad('#FFFFFF'), hair = C.grad('#3B2A24'), shirt = C.grad('#5FB3A8'), chart = C.lin('#FFFFFF', '#EEF1F6');
    let s = `<path d="M18 116 Q20 80 60 78 Q100 80 102 116 Z" ${F(coat)}/>`;
    s += `<path d="M48 80 L60 98 L72 80 Z" ${F(shirt, 2)}/><path d="M60 98 L60 116" ${N(2)}/><path d="M38 84 L50 116 M82 84 L70 116" fill="none" stroke="#D7DEE8" stroke-width="2.4"/>`;
    // stethoscope round the neck
    s += `<path d="M46 80 Q42 100 52 106 Q60 110 64 102 M74 80 Q78 96 72 104" fill="none" stroke="${OUT}" stroke-width="4.5" stroke-linecap="round"/><path d="M46 80 Q42 100 52 106 Q60 110 64 102 M74 80 Q78 96 72 104" fill="none" stroke="#5A6A86" stroke-width="2" stroke-linecap="round"/><circle cx="64" cy="102" r="5" ${F('#C9D2E0', 2)}/>`;
    s += `<rect x="78" y="98" width="12" height="9" rx="2" ${F('#E9EEF6', 1.8)}/><path d="M82 98 L82 94" stroke="#E0304A" stroke-width="2.6" stroke-linecap="round"/>`;
    // eye chart held up on the left
    s += `<g transform="rotate(-6 26 92)"><rect x="8" y="70" width="34" height="42" rx="3" ${F(chart, 2.2)}/>`;
    s += `<path d="M18 76 L18 86 L28 86 M18 81 L26 81 M18 76 L28 76" fill="none" stroke="${OUT}" stroke-width="2.6" stroke-linecap="square"/><path d="M15 92 L35 92 M17 98 L33 98 M19 104 L31 104" stroke="${OUT}" stroke-width="2" stroke-dasharray="3 2"/></g>`;
    s += `<ellipse cx="40" cy="102" rx="6" ry="5" ${F(skin, 2)}/>`;
    s += `<path d="M34 54 Q30 26 60 24 Q90 26 86 54 Q80 40 60 40 Q40 40 34 54 Z" ${F(hair)}/><circle cx="60" cy="22" r="9" ${F(hair)}/>`;
    s += `<ellipse cx="60" cy="56" rx="25" ry="26" ${F(skin)}/>`;
    s += `<ellipse cx="35" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/><ellipse cx="85" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/>`;
    s += `<path d="M35 52 Q38 32 60 32 Q82 32 85 52 Q74 40 60 42 Q46 40 35 52 Z" ${F(hair)}/>`;
    s += `<path d="M44 36 Q52 31 60 31" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".25"/>`;
    s += shine(47, 52, 5, 3, -20);
    s += pair(60, 58, 11, 5.5, { brow: 'up', bw: 2.4, iris: '#6B4423', browColor: '#3B2A24' });
    // round glasses
    s += `<circle cx="49" cy="58" r="8.5" fill="none" ${S(2.2)}/><circle cx="71" cy="58" r="8.5" fill="none" ${S(2.2)}/><path d="M57.5 57 Q60 55 62.5 57" fill="none" ${S(2)}/>`;
    s += `<path d="M60 63 Q58 68 61 69" ${N(2.2)}/>${M.smile(60, 74, 7)}`;
    s += blush(60, 68, 16, 4);
    return s;
  }

  function verkehrspolizistin(P, o, C) {
    const skin = C.grad('#F2C49C'), uni = C.grad('#2F4A7A'), vest = C.grad('#E6F03A'), cap = C.grad('#2F4A7A'), hair = C.grad('#C98A3E');
    let s = `<path d="M30 52 Q24 74 30 86 L40 84 Q34 70 38 56 Z M90 52 Q96 74 90 86 L80 84 Q86 70 82 56 Z" ${F(hair)}/>`;
    s += `<path d="M18 116 Q20 80 60 78 Q100 80 102 116 Z" ${F(uni)}/>`;
    s += `<path d="M28 116 Q28 86 46 80 L60 92 L74 80 Q92 86 92 116 Z" ${F(vest, 2.2)}/>`;
    s += `<path d="M30 100 L90 100 M30 108 L90 108" stroke="#C9D2E0" stroke-width="4"/><path d="M30 100 L90 100 M30 108 L90 108" stroke="#fff" stroke-width="1.4" opacity=".8"/><path d="M28 116 Q28 86 46 80 L60 92 L74 80 Q92 86 92 116" ${N(2.2)}/>`;
    // signal paddle (Kelle) raised in the right hand
    s += `<path d="M98 108 L104 70" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M98 108 L104 70" stroke="#E9EEF6" stroke-width="3.5" stroke-linecap="round"/>`;
    s += `<circle cx="106" cy="54" r="15" ${F('#E0304A', 2.4)}/><circle cx="106" cy="54" r="9.5" ${F('#FFFFFF', 1.8)}/>`;
    s += `<ellipse cx="99" cy="98" rx="6" ry="5.5" ${F('#FFFFFF', 2)}/>`;
    s += `<ellipse cx="24" cy="104" rx="6" ry="5.5" ${F('#FFFFFF', 2)}/>`;
    s += `<ellipse cx="60" cy="56" rx="25" ry="25" ${F(skin)}/>`;
    s += `<ellipse cx="35" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/><ellipse cx="85" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/>`;
    s += `<path d="M36 52 Q38 40 60 40 Q82 40 84 52 Q72 46 60 47 Q48 46 36 52 Z" ${F(hair)}/>`;
    // peaked police cap
    if (!o.bare) {
      s += `<path d="M30 40 Q30 18 60 16 Q90 18 90 40 Z" ${F(cap)}/><rect x="31" y="34" width="58" height="8" rx="2" ${F('#F2F4F8', 2)}/><path d="M34 38 L86 38" stroke="#2F4A7A" stroke-width="2" stroke-dasharray="4 4"/>`;
      s += `<path d="M34 42 Q60 54 86 42 Q80 48 60 50 Q40 48 34 42 Z" ${F('#1C2541', 2)}/><path d="M56 24 L60 20 L64 24 L60 30 Z" ${F('#FFC93C', 1.6)}/>`;
    }
    s += shine(47, 60, 5, 3, -20);
    s += pair(60, 59, 11, 5.5, { brow: 'up', bw: 2.4, iris: '#3B7DD8', browColor: '#8A5A22' });
    s += `<path d="M60 63 Q58 68 61 69" ${N(2.2)}/>${M.smile(60, 74, 7)}`;
    s += blush(60, 68, 16, 4);
    return s;
  }

  function laerm(P, o, C) {
    const horn = C.grad('#F2A23A'), rim = C.grad('#E0304A');
    let s = `<ellipse cx="56" cy="114" rx="40" ry="4" fill="${OUT}" opacity=".18"/>`;
    s += [0, 1, 2].map((i) => `<path d="M${96 + i * 8} ${44 - i * 6} Q${108 + i * 9} 64 ${96 + i * 8} ${84 + i * 6}" fill="none" stroke="${OUT}" stroke-width="${4 - i}" stroke-linecap="round" opacity="${0.9 - i * 0.2}"/>`).join('');
    s += `<path d="M14 54 L48 50 L92 22 L92 106 L48 78 L14 74 Z" ${F(horn)}/>`;
    s += `<ellipse cx="92" cy="64" rx="10" ry="42" ${F(rim)}/><ellipse cx="92" cy="64" rx="5" ry="30" fill="#7A1F2E"/>`;
    s += `<rect x="6" y="52" width="12" height="24" rx="4" ${F('#5A6272')}/><path d="M30 78 L26 104 L38 104 L42 78" ${F('#5A6272')}/>`;
    s += shine(54, 50, 10, 4, -20);
    s += pair(54, 62, 10, 6, { brow: 'angry', bw: 3, dir: [0.3, 0] });
    s += M.open(56, 74, 9);
    s += `<path d="M104 20 L110 14 M112 34 L120 32 M104 106 L110 112 M112 94 L120 96" stroke="${OUT}" stroke-width="2.6" stroke-linecap="round"/>`;
    return s;
  }

  function blendlicht(P, o, C) {
    const core = C.grad('#FFF3A0');
    let s = `<circle cx="60" cy="62" r="52" fill="#FFE45C" opacity=".22"/>`;
    s += Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; const r1 = 34, r2 = i % 2 ? 50 : 56; return `<path d="M${f1(60 + Math.cos(a) * r1)} ${f1(62 + Math.sin(a) * r1)} L${f1(60 + Math.cos(a + 0.12) * r2)} ${f1(62 + Math.sin(a + 0.12) * r2)} L${f1(60 + Math.cos(a - 0.12) * r2)} ${f1(62 + Math.sin(a - 0.12) * r2)} Z" ${F('#FFD23C', 2)}/>`; }).join('');
    s += `<circle cx="60" cy="62" r="34" ${F(core)}/>`;
    s += shine(48, 48, 10, 5, -25);
    // squinting eyes: it is too bright even for itself
    s += `<path d="M40 58 L52 62 L40 66 M80 58 L68 62 L80 66" ${N(3.2)}/>`;
    s += M.grin(60, 74, 10);
    s += spark(20, 22, 6, '#fff') + spark(102, 100, 5, '#fff');
    return s;
  }

  function qualmwolke(P, o, C) {
    const smoke = C.grad('#8E8A94'), dark = C.grad('#5E5A66');
    let s = `<path d="M30 112 Q22 100 34 94 Q28 80 44 78 Q48 66 62 72 Q74 64 82 76 Q98 74 96 90 Q108 98 96 108 Q90 116 30 112 Z" ${F(dark)}/>`;
    s += `<path d="M18 70 Q4 58 16 46 Q14 28 34 30 Q40 12 60 18 Q78 8 88 26 Q108 24 106 44 Q118 56 104 68 Q100 84 80 82 Q66 92 50 84 Q30 90 18 70 Z" ${F(smoke)}/>`;
    s += `<path d="M30 50 Q40 40 52 48 M70 36 Q84 30 92 42 M40 72 Q56 64 74 72" fill="none" stroke="#C9C5CF" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>`;
    s += [[12, 20, 5], [104, 14, 4], [112, 84, 3.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${F('#A9A5B0', 1.8)}/>`).join('');
    s += shine(40, 34, 9, 4, -20);
    s += pair(60, 52, 12, 7, { lid: '#7A7682', lidY: -0.1, lidRot: 10, brow: 'angry', bw: 3, dir: [0.2, 0.2] });
    s += M.wavy(60, 70, 8);
    return s;
  }

  function gruppendruck(P, o, C) {
    const a = C.grad('#7A6A9A'), b = C.grad('#5E4E80'), c = C.grad('#8E7CB0');
    const head = (x, y, r, fill, look) => `<path d="M${x - r} ${y + r * 1.6} Q${x - r * 1.1} ${y - r * 0.2} ${x} ${y - r} Q${x + r * 1.1} ${y - r * 0.2} ${x + r} ${y + r * 1.6} Z" ${F(fill)}/>` + eye(x - r * 0.36, y, r * 0.22, { brow: 'angry', bw: 2.6, dir: look }) + eye(x + r * 0.36, y, r * 0.22, { brow: 'angry', bw: 2.6, dir: look });
    let s = `<ellipse cx="60" cy="114" rx="54" ry="5" fill="${OUT}" opacity=".2"/>`;
    s += head(26, 54, 22, b, [0.4, 0.1]) + head(94, 54, 22, b, [-0.4, 0.1]);
    s += head(60, 50, 30, a, [0, 0.2]);
    // pushing hands from all sides
    s += [[8, 92, 20], [112, 92, -20], [44, 104, 0], [76, 104, 0]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})"><path d="M${x - 8} ${y + 10} L${x - 8} ${y - 4} Q${x - 8} ${y - 10} ${x - 4} ${y - 8} L${x - 4} ${y - 14} Q${x} ${y - 18} ${x + 2} ${y - 13} Q${x + 6} ${y - 16} ${x + 8} ${y - 10} L${x + 8} ${y + 10} Z" ${F(c, 2)}/></g>`).join('');
    s += M.frown(60, 72, 10);
    s += `<path d="M20 26 L28 32 M100 26 L92 32 M60 8 L60 16" stroke="${OUT}" stroke-width="2.6" stroke-linecap="round"/>`;
    return s;
  }

  function schlagloch(P, o, C) {
    const road = C.lin('#8A8F98', '#6E737C'), hole = C.grad('#3A3440');
    let s = `<path d="M2 116 L8 52 Q60 40 112 52 L118 116 Z" ${F(road)}/>`;
    s += `<path d="M10 60 L30 58 M86 58 L108 60" stroke="#fff" stroke-width="4" stroke-dasharray="10 8" opacity=".8"/>`;
    s += `<path d="M18 88 Q16 70 38 66 Q60 58 84 66 Q104 72 100 90 Q96 108 60 108 Q22 108 18 88 Z" ${F(hole)}/>`;
    s += `<path d="M22 84 L10 78 L4 84 M98 86 L110 80 L116 88 M60 108 L56 116 M40 66 L34 56" fill="none" stroke="${OUT}" stroke-width="2.4" stroke-linecap="round"/>`;
    s += [[30, 76], [88, 78], [46, 100], [76, 102]].map(([x, y]) => `<path d="M${x - 4} ${y} L${x} ${y - 5} L${x + 5} ${y - 1} L${x + 2} ${y + 4} Z" ${F('#9AA0AA', 1.6)}/>`).join('');
    s += `<ellipse cx="60" cy="96" rx="22" ry="5" fill="#5A9BD5" opacity=".55"/>`;
    s += pair(60, 80, 12, 6.5, { look: 'glow', glow: '#FFE45C', brow: 'angry', bw: 3 });
    s += M.fangs(60, 92, 9);
    return s;
  }

  function daemmerung(P, o, C) {
    const sky = C.lin('#F7A35C', '#3E3A7A'), sun = C.grad('#FF8A3D');
    let s = `<circle cx="60" cy="60" r="46" ${F(sky)}/>`;
    s += `<path d="M24 82 Q60 70 96 82 L96 92 Q60 106 24 92 Z" fill="#2A2650" opacity=".75"/>`;
    s += `<path d="M38 82 A22 22 0 0 1 82 82 Z" ${F(sun, 2)}/>`;
    s += [[34, 30], [52, 22], [84, 30], [92, 46]].map(([x, y]) => spark(x, y, 3, '#FFF3C4')).join('');
    s += `<path d="M76 18 A14 14 0 1 0 92 34 A11 11 0 1 1 76 18 Z" ${F('#FFF3C4', 2)}/>`;
    s += shine(40, 40, 8, 4, -25);
    s += pair(60, 58, 13, 7, { lid: '#6A5A9A', lidY: 0.1, lidRot: 0, dir: [0, 0.4] });
    s += M.flat(60, 72, 6);
    s += `<path d="M18 104 Q40 96 60 104 Q80 112 102 104" fill="none" stroke="#3E3A7A" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;
    return s;
  }

  function totwinkel(P, o, C) {
    const shade1 = C.lin('#4A4E66', '#23263A');
    let s = `<path d="M4 112 L60 18 L116 112 Z" ${F(shade1)}/>`;
    s += `<path d="M18 104 L60 34 L102 104" fill="none" stroke="#6A6F8C" stroke-width="2" stroke-dasharray="6 5"/>`;
    // a mirror that cannot see into the corner
    s += `<path d="M84 30 L102 22 L108 40 L90 46 Z" ${F('#9FD3F0', 2.2)}/><path d="M90 30 L100 26" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M96 44 L92 56" ${N(3)}/>`;
    s += `<path d="M90 36 L100 32 M92 42 L104 38" stroke="${OUT}" stroke-width="1.8"/><path d="M89 33 L107 39" stroke="#E0304A" stroke-width="3" stroke-linecap="round"/>`;
    s += pair(60, 76, 13, 7.5, { look: 'glow', glow: '#FFE45C', brow: 'angry', bw: 3.4, dir: [-0.3, 0] });
    s += M.smirk(60, 94, 10);
    s += spark(20, 30, 4, '#FFE066') + spark(24, 48, 2.6, '#FFE066');
    return s;
  }

  function raser(P, o, C) {
    const body = C.grad('#E0304A'), glass = C.lin('#CFE8FF', '#7FB3E0');
    let s = `<path d="M2 66 L16 66 M0 78 L18 78 M4 90 L16 90" stroke="${OUT}" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;
    s += `<path d="M14 96 Q8 92 12 86 L20 84 Q8 78 14 74" ${F('#FF8A3D', 2)}/><path d="M16 90 Q12 88 16 84" ${F('#FFE066', 1.6)}/>`;
    s += `<path d="M18 92 Q16 70 34 66 L50 46 Q60 38 80 40 L96 58 Q114 60 116 76 L116 92 Z" ${F(body)}/>`;
    s += `<path d="M54 50 Q62 44 76 46 L88 60 L50 62 Z" ${F(glass, 2.2)}/>`;
    s += `<path d="M30 76 L110 76" stroke="#fff" stroke-width="4" opacity=".8"/><path d="M30 82 L110 82" stroke="#FFC93C" stroke-width="3"/>`;
    s += `<rect x="104" y="64" width="12" height="7" rx="2" ${F('#FFF3A0', 1.8)}/>`;
    s += `<circle cx="38" cy="94" r="13" ${F('#2A2D3A')}/><circle cx="38" cy="94" r="5.5" fill="#C9D2E0"/><circle cx="96" cy="94" r="13" ${F('#2A2D3A')}/><circle cx="96" cy="94" r="5.5" fill="#C9D2E0"/>`;
    s += shine(66, 48, 6, 2.5, -10);
    s += eye(62, 56, 5.5, { brow: 'angry', bw: 3, dir: [0.5, 0], side: -1 }) + eye(78, 56, 5.5, { brow: 'angry', bw: 3, dir: [0.5, 0], side: 1 });
    s += M.grin(96, 70, 7);
    return s;
  }

  const hexCell = (x, y, r) => `M${f1(x + r)} ${y} L${f1(x + r / 2)} ${f1(y + r * 0.87)} L${f1(x - r / 2)} ${f1(y + r * 0.87)} L${f1(x - r)} ${y} L${f1(x - r / 2)} ${f1(y - r * 0.87)} L${f1(x + r / 2)} ${f1(y - r * 0.87)} Z`;
  const sk_bee = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="-3" cy="-7" rx="5" ry="7" fill="#EAF6FF" ${S(1.4)} transform="rotate(-25 -3 -7)"/><ellipse cx="4" cy="-7" rx="5" ry="7" fill="#EAF6FF" ${S(1.4)} transform="rotate(25 4 -7)"/><ellipse cx="0" cy="0" rx="9" ry="6.5" ${F('#FFC93C', 1.8)}/><path d="M-3 -6 L-3 6 M3 -6 L3 6" stroke="${OUT}" stroke-width="2.6"/><circle cx="8" cy="-1" r="1.3" fill="${OUT}"/></g>`;

  function imkerin(P, o, C) {
    const skin = C.grad('#E2A57A'), suit = C.grad('#F6F3EA'), hat = C.grad('#E9DDB0'), comb = C.grad('#F2B33D'), hair = C.grad('#7A4A2A');
    let s = '';
    // veil thrown back over the shoulders, behind the head
    if (!o.bare) s += `<path d="M26 40 Q18 70 24 92 L96 92 Q102 70 94 40 Z" fill="#3A3F52" opacity=".28" ${S(2)}/><path d="M28 52 L92 52 M26 64 L94 64 M26 76 L94 76 M40 40 L36 92 M60 40 L60 92 M80 40 L84 92" stroke="#3A3F52" stroke-width="1" opacity=".5"/>`;
    s += `<path d="M18 116 Q20 80 60 78 Q100 80 102 116 Z" ${F(suit)}/><path d="M60 80 L60 116" ${N(2)}/><path d="M28 102 L40 100 M80 106 L92 104" stroke="#D9D2BE" stroke-width="2.4" stroke-linecap="round"/>`;
    s += `<path d="M46 80 L60 90 L74 80" ${F('#F2C94C', 2)}/>`;
    // honeycomb frame in the right hand
    s += `<rect x="76" y="82" width="32" height="32" rx="2" ${F('#B5763A', 2.4)}/><rect x="80" y="86" width="24" height="24" ${F(comb, 1.6)}/>`;
    s += `<path d="${[[85, 91], [93, 91], [101, 91], [89, 98], [97, 98], [85, 105], [93, 105], [101, 105]].map(([x, y]) => hexCell(x, y, 3.6)).join(' ')}" fill="none" stroke="#B5791A" stroke-width="1.2"/>`;
    s += `<path d="M95 110 Q96 116 94 118" fill="none" stroke="#E8A21E" stroke-width="2.4" stroke-linecap="round"/>`;
    s += `<ellipse cx="78" cy="100" rx="6" ry="5" ${F(skin, 2)}/><ellipse cx="34" cy="104" rx="6" ry="5" ${F(skin, 2)}/>`;
    s += `<path d="M38 50 Q32 66 36 78 L42 60 Z M82 50 Q88 66 84 78 L78 60 Z" ${F(hair, 2)}/>`;
    s += `<ellipse cx="60" cy="58" rx="25" ry="25" ${F(skin)}/>`;
    s += `<ellipse cx="35" cy="61" rx="4.5" ry="6.5" ${F(skin, 2)}/><ellipse cx="85" cy="61" rx="4.5" ry="6.5" ${F(skin, 2)}/>`;
    s += `<path d="M36 50 Q42 36 60 36 Q78 36 84 50 Q72 44 60 46 Q48 44 36 50 Z" ${F(hair, 2)}/>`;
    if (!o.bare) s += `<path d="M38 40 Q38 18 60 18 Q82 18 82 40 Z" ${F(hat)}/><path d="M40 34 L80 34" stroke="#C99A2E" stroke-width="3"/><ellipse cx="60" cy="40" rx="40" ry="8" ${F(hat)}/><path d="M28 40 Q60 47 92 40" fill="none" stroke="#C9B57A" stroke-width="1.8"/><path d="M46 24 Q52 21 58 21" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
    s += shine(47, 62, 5, 3, -20);
    s += pair(60, 60, 11, 5.5, { brow: 'up', bw: 2.4, iris: '#7A5A2A', browColor: '#5A3418' });
    s += `<path d="M60 64 Q58 70 61 71" ${N(2.2)}/>${M.smile(60, 76, 7)}`;
    s += blush(60, 70, 16, 4);
    s += sk_bee(16, 70, 0.8) + sk_bee(108, 58, 0.7);
    return s;
  }

  function heimatforscherin(P, o, C) {
    const skin = C.grad('#C98E68'), coat = C.grad('#8E3B46'), hair = C.grad('#3A2A22'), photo = C.lin('#F3E2C2', '#D9BE8E');
    let s = `<circle cx="60" cy="30" r="11" ${F(hair)}/>`;
    s += `<path d="M18 116 Q20 80 60 78 Q100 80 102 116 Z" ${F(coat)}/><path d="M50 80 L60 116 L70 80" ${F('#F5F0E6', 2)}/>` + [92, 104].map((y) => `<circle cx="${y === 92 ? 46 : 44}" cy="${y}" r="2.4" ${F('#E8C25A', 1.4)}/>`).join('');
    // old photo held up in the left hand
    s += `<g transform="rotate(-10 30 96)"><rect x="12" y="80" width="34" height="28" rx="1.5" ${F('#FFFDF5', 2.2)}/><rect x="16" y="84" width="26" height="18" fill="${photo}" stroke="#8A6A3F" stroke-width="1"/><circle cx="24" cy="91" r="3" fill="#8A6A3F"/><path d="M20 102 Q24 94 28 102 Z" fill="#8A6A3F"/><circle cx="34" cy="90" r="2.6" fill="#8A6A3F"/><path d="M30 102 Q34 95 38 102 Z" fill="#8A6A3F"/><path d="M16 96 L42 96" stroke="#A88A5A" stroke-width=".8"/></g>`;
    s += `<ellipse cx="40" cy="106" rx="6" ry="5" ${F(skin, 2)}/>`;
    // notebook and pencil in the right hand
    s += `<rect x="78" y="88" width="24" height="28" rx="2" ${F('#3E6E8E', 2.2)}/><path d="M82 96 L98 96 M82 102 L96 102 M82 108 L94 108" stroke="#CFE0F0" stroke-width="1.6" stroke-linecap="round"/>`;
    s += `<path d="M104 80 L92 104" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="M103 82 L93 102" stroke="#FFC93C" stroke-width="3" stroke-linecap="round"/><ellipse cx="94" cy="104" rx="6" ry="5" ${F(skin, 2)}/>`;
    s += `<ellipse cx="60" cy="57" rx="25" ry="26" ${F(skin)}/>`;
    s += `<ellipse cx="35" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/><ellipse cx="85" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/><circle cx="35" cy="68" r="2" ${F('#E8C25A', 1.2)}/><circle cx="85" cy="68" r="2" ${F('#E8C25A', 1.2)}/>`;
    s += `<path d="M34 56 Q30 30 60 30 Q90 30 86 56 Q80 44 70 40 Q62 46 50 42 Q40 46 34 56 Z" ${F(hair)}/>`;
    s += `<path d="M44 36 Q52 32 60 33" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".3"/>`;
    s += shine(47, 54, 5, 3, -20);
    s += pair(60, 59, 11, 5.5, { brow: 'up', bw: 2.4, iris: '#5A3A22', browColor: '#2A1A12' });
    s += `<path d="M60 63 Q58 69 61 70" ${N(2.2)}/>${M.smile(60, 75, 7)}`;
    s += blush(60, 69, 16, 4);
    return s;
  }

  function trampelpfad(P, o, C) {
    const dirt = C.grad('#B88A5A'), grass = '#6FAE3E';
    let s = `<path d="M8 112 Q4 80 30 68 Q60 56 90 68 Q116 80 112 112 Z" ${F(dirt)}/>`;
    s += [[22, 106], [36, 96], [84, 98], [98, 108]].map(([x, y]) => `<g transform="translate(${x} ${y}) rotate(${x < 60 ? -20 : 20})"><ellipse cx="0" cy="0" rx="4" ry="7" fill="#8A6236"/><ellipse cx="0" cy="-10" rx="3.4" ry="3.6" fill="#8A6236"/></g>`).join('');
    s += [[4, 112], [12, 104], [108, 104], [116, 112], [20, 70], [100, 70]].map(([x, y]) => `<path d="M${x} ${y} l-4 -14 M${x} ${y} l2 -16 M${x} ${y} l6 -10" stroke="${grass}" stroke-width="2.4" stroke-linecap="round"/>`).join('');
    s += `<path d="M30 66 L24 54 L36 62 M90 66 L98 52 L86 62" stroke="#6FAE3E" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M24 54 L18 58 M98 52 L104 56" stroke="#6FAE3E" stroke-width="2.6" stroke-linecap="round"/>`;
    s += shine(38, 74, 10, 4, -12);
    s += pair(60, 82, 12, 7, { brow: 'angry', bw: 3, dir: [0.2, 0.2] });
    s += M.grin(60, 98, 10);
    return s;
  }

  function trockenheit(P, o, C) {
    const earth = C.grad('#D9A35E');
    let s = `<circle cx="100" cy="18" r="10" ${F(C.grad('#FFD23F'), 2.2)}/><path d="${spikes(100, 18, 13, 19, 0, 360, 10)}" fill="#FFC93C" ${S(1.6)}/><circle cx="100" cy="18" r="10" ${F(C.grad('#FFD23F'), 2.2)}/>`;
    s += `<path d="M10 112 Q4 74 34 60 Q60 48 86 60 Q116 74 110 112 Z" ${F(earth)}/>`;
    s += `<path d="M22 100 L34 92 L30 82 M34 92 L46 96 M98 98 L86 90 L90 80 M86 90 L76 94 M54 108 L60 100 L68 106" fill="none" stroke="#8A5A2A" stroke-width="2" stroke-linecap="round"/>`;
    // wilted flower drooping from the top
    s += `<path d="M60 52 Q62 34 76 30 Q84 30 84 38" fill="none" stroke="#9AA04A" stroke-width="3" stroke-linecap="round"/><path d="M58 50 Q48 44 44 48 Q50 50 58 52 Z" ${F('#B5B85A', 1.6)}/>`;
    s += `<g transform="rotate(150 84 42)"><ellipse cx="84" cy="36" rx="3" ry="6" ${F('#D9B85A', 1.4)}/><ellipse cx="79" cy="40" rx="3" ry="6" ${F('#D9B85A', 1.4)} transform="rotate(-60 79 40)"/><ellipse cx="89" cy="40" rx="3" ry="6" ${F('#D9B85A', 1.4)} transform="rotate(60 89 40)"/></g><circle cx="84" cy="42" r="3" fill="#8A6A3F"/>`;
    s += shine(36, 70, 9, 4, -20);
    s += pair(58, 80, 12, 7, { lid: '#C98E4A', lidY: -0.1, dir: [0.2, 0.2] });
    s += M.flat(58, 96, 8);
    s += `<path d="M14 60 q4 -4 8 0 t8 0 M98 60 q4 -4 8 0 t8 0" fill="none" stroke="#E8A050" stroke-width="2.2" stroke-linecap="round"/>`;
    return s;
  }

  function plastiktuete(P, o, C) {
    const bag = C.lin('#F4F8FF', '#C9D6EA');
    let s = `<path d="M4 116 l4 -12 l3 12 M108 116 l3 -14 l4 14" stroke="#6FAE3E" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M34 38 Q30 14 42 14 Q52 14 48 38 M72 38 Q68 14 78 14 Q90 14 86 38" fill="none" ${S(7)}/><path d="M34 38 Q30 14 42 14 Q52 14 48 38 M72 38 Q68 14 78 14 Q90 14 86 38" fill="none" stroke="#F4F8FF" stroke-width="3.4"/>`;
    s += `<path d="M28 38 L92 38 Q100 70 96 98 Q94 112 80 112 L40 112 Q26 112 24 98 Q20 70 28 38 Z" fill="${bag}" ${S()}/>`;
    s += `<path d="M36 48 L44 60 L38 74 M84 50 L78 62 L86 78 M50 96 L60 102 L70 96" fill="none" stroke="#AEBBD2" stroke-width="1.8" stroke-linecap="round"/>`;
    s += `<path d="M34 44 Q32 62 34 80" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
    s += pair(60, 66, 11, 6.5, { brow: 'flat', bw: 2.6, dir: [0.3, 0.1] });
    s += M.smirk(60, 84, 8);
    return s;
  }

  function spritzmittel(P, o, C) {
    const tank = C.grad('#5FA8D3'), mist = '#C9E86A';
    let s = `<ellipse cx="88" cy="40" rx="20" ry="12" fill="${mist}" opacity=".45"/><ellipse cx="104" cy="28" rx="12" ry="9" fill="${mist}" opacity=".4"/>`;
    s += [[86, 34], [96, 44], [106, 34], [92, 24], [110, 46], [80, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" ${F('#B5D94A', 1.2)}/>`).join('');
    s += `<path d="M44 44 Q44 26 62 24 L76 32" fill="none" ${S(6)}/><path d="M44 44 Q44 26 62 24 L76 32" fill="none" stroke="#3A3F52" stroke-width="2.4"/><path d="M74 28 L82 34 L78 38 L70 32 Z" ${F('#E0304A', 2)}/>`;
    s += `<rect x="22" y="42" width="56" height="70" rx="14" ${F(tank)}/><rect x="36" y="34" width="28" height="10" rx="3" ${F('#3A6E9A', 2.2)}/>`;
    s += `<rect x="30" y="86" width="40" height="16" rx="3" ${F('#FFF3C4', 2)}/><path d="M36 94 L64 94" stroke="#C9A227" stroke-width="2.4" stroke-linecap="round"/>`;
    s += shine(34, 54, 5, 9, -10);
    s += pair(50, 66, 10, 6.5, { brow: 'angry', bw: 3, dir: [0.4, 0] });
    s += M.smirk(50, 80, 7);
    return s;
  }

  function maehmaschine(P, o, C) {
    const body = C.grad('#D9453B'), metal = C.lin('#E4E9F0', '#9AA3B5');
    let s = `<path d="M4 108 L116 108" stroke="#6FAE3E" stroke-width="3" stroke-linecap="round"/>`;
    // cutter bar with teeth along the front
    s += `<rect x="6" y="94" width="70" height="8" rx="2" ${F(metal, 2.2)}/><path d="${Array.from({ length: 9 }, (_, i) => `M${10 + i * 7.5} 94 L${13.5 + i * 7.5} 86 L${17 + i * 7.5} 94`).join(' ')}" ${F('#E4E9F0', 1.8)}/>`;
    s += `<path d="M30 92 Q60 28 104 40 L108 92 Z" ${F(body)}/><path d="M72 48 L90 48 L92 70 L70 70 Z" ${F('#BFE3FF', 2.2)}/>`;
    s += `<rect x="96" y="22" width="7" height="20" rx="2" ${F('#3A3F52', 2)}/><circle cx="100" cy="14" r="4" fill="#B0BEC5" opacity=".8"/><circle cx="106" cy="8" r="3" fill="#B0BEC5" opacity=".6"/>`;
    s += `<circle cx="92" cy="98" r="14" ${F('#3A3F52')}/><circle cx="92" cy="98" r="6" ${F('#C9CED8', 2)}/><circle cx="40" cy="104" r="7" ${F('#3A3F52', 2.2)}/>`;
    s += shine(54, 60, 9, 4, -35);
    s += pair(54, 74, 9, 6.5, { brow: 'angry', bw: 3.2, dir: [-0.3, 0.1] });
    s += M.fangs(54, 86, 8);
    s += [[16, 70, -30], [8, 80, 20], [26, 66, 60]].map(([x, y, r]) => `<path d="M${x} ${y} l0 -10" stroke="#6FAE3E" stroke-width="2.6" stroke-linecap="round" transform="rotate(${r} ${x} ${y})"/>`).join('');
    return s;
  }

  function strassenwalze(P, o, C) {
    const body = C.grad('#F2B12E'), drum = C.lin('#C9CED8', '#7A8294');
    let s = `<rect x="0" y="104" width="120" height="12" fill="#3A3F52"/><path d="M8 110 L24 110 M40 110 L56 110 M72 110 L88 110" stroke="#fff" stroke-width="2.4"/>`;
    s += `<path d="M86 24 L110 24 L112 76 L80 76 Z" ${F(body)}/><path d="M90 30 L106 30 L106 52 L88 52 Z" ${F('#BFE3FF', 2.2)}/>`;
    s += `<rect x="98" y="8" width="6" height="16" ${F('#3A3F52', 2)}/><circle cx="100" cy="4" r="4" fill="#5E6E8E" opacity=".7"/><circle cx="92" cy="0" r="3" fill="#5E6E8E" opacity=".5"/>`;
    s += `<circle cx="98" cy="92" r="13" ${F('#3A3F52')}/><circle cx="98" cy="92" r="5" ${F('#C9CED8', 2)}/>`;
    s += `<path d="M40 60 L86 60 L86 80 L40 80 Z" ${F(body)}/>`;
    s += `<ellipse cx="42" cy="78" rx="38" ry="28" ${F(drum)}/><path d="M12 64 Q42 54 72 64 M8 80 Q42 70 76 80 M12 94 Q42 86 72 94" fill="none" stroke="#6B7386" stroke-width="2"/>`;
    s += shine(26, 64, 10, 4, -15);
    s += pair(42, 72, 12, 7.5, { look: 'glow', glow: '#FF8A3D', brow: 'angry', bw: 4 });
    s += M.roar(42, 86, 11, 10);
    return s;
  }

  function spinnennetz(P, o, C) {
    const thread = '#E9EEF6';
    let s = `<path d="M6 4 L6 116 M114 4 L114 116" stroke="#8A6A3F" stroke-width="5" stroke-linecap="round"/>`;
    const spokes = Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return [60 + Math.cos(a) * 52, 58 + Math.sin(a) * 52, a]; });
    s += `<g stroke="${OUT}" stroke-width="3.4" fill="none" stroke-linecap="round">${spokes.map(([x, y]) => `<path d="M60 58 L${f1(x)} ${f1(y)}"/>`).join('')}</g>`;
    s += `<g stroke="${thread}" stroke-width="1.6" fill="none">${spokes.map(([x, y]) => `<path d="M60 58 L${f1(x)} ${f1(y)}"/>`).join('')}${[16, 28, 40, 50].map((r) => `<path d="M${spokes.map(([, , a]) => `${f1(60 + Math.cos(a) * r)} ${f1(58 + Math.sin(a) * r)}`).join(' L')} Z"/>`).join('')}</g>`;
    s += [[30, 34], [88, 82], [40, 92], [92, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#BFE3FF" ${S(1)}/>`).join('');
    s += `<circle cx="60" cy="58" r="16" fill="#C9D2E0" opacity=".55"/>`;
    s += pair(60, 56, 8, 5.5, { brow: 'angry', bw: 2.6 });
    s += M.smirk(60, 68, 6);
    return s;
  }

  function schimmelfleck(P, o, C) {
    const mold = C.grad('#8FAE7A'), paper = C.lin('#FFF8E8', '#E9D9B8');
    let s = `<path d="M8 116 L8 70 L60 64 L112 72 L112 116 Z" ${F(paper, 2.2)}/><path d="M18 82 L50 80 M18 92 L44 91 M70 86 L102 88" stroke="#C9B58A" stroke-width="2" stroke-linecap="round"/>`;
    s += `<path d="M26 104 Q14 90 26 74 Q24 52 44 50 Q50 32 68 40 Q88 34 92 54 Q108 62 100 82 Q106 100 88 106 Q60 116 26 104 Z" ${F(mold)}/>`;
    s += [[34, 60, 4], [86, 64, 3.5], [30, 90, 3], [92, 94, 3.5], [60, 44, 3], [72, 100, 2.6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${F('#C9D9B8', 1.4)}/>`).join('');
    s += [[22, 46], [40, 30], [62, 26], [82, 30], [100, 46], [12, 66]].map(([x, y]) => `<path d="M${x} ${y + 8} L${x} ${y}" stroke="${OUT}" stroke-width="1.6"/><circle cx="${x}" cy="${y - 2}" r="2.6" ${F('#6E8A5A', 1.4)}/>`).join('');
    s += shine(42, 62, 8, 3.5, -20);
    s += pair(62, 76, 11, 6.5, { lid: '#7A9A66', lidY: -0.15, dir: [0.2, 0.2] });
    s += M.wavy(62, 92, 7);
    return s;
  }

  function stromausfall(P, o, C) {
    const glass = C.grad('#B9C2CF');
    let s = `<path d="M60 116 Q40 112 30 116" fill="none" ${S(5)}/><path d="M60 116 Q40 112 30 116" fill="none" stroke="#3A3F52" stroke-width="2"/>`;
    s += `<rect x="46" y="88" width="28" height="20" rx="3" ${F('#9AA3B5')}/><path d="M46 94 L74 94 M46 100 L74 100" ${N(2)}/><path d="M52 108 Q60 116 68 108" ${F('#5E6E8E', 2)}/>`;
    s += `<path d="M46 90 Q22 70 26 46 Q32 14 60 12 Q88 14 94 46 Q98 70 74 90 Z" ${F(glass)}/>`;
    s += `<path d="M52 88 L52 70 Q56 62 60 70 Q64 62 68 70 L68 88" fill="none" stroke="#5E6E8E" stroke-width="2"/>`;
    s += `<path d="M70 18 L76 30 L70 34 L78 46" fill="none" stroke="${OUT}" stroke-width="2.2" stroke-linecap="round"/>`;
    s += sk_bolt(98, 72, 0.7, 20) + sk_bolt(10, 70, 0.6, -20);
    s += shine(40, 32, 6, 10, -20);
    s += pair(60, 48, 10, 6.5, { lid: '#8E98A8', lidY: 0.05, dir: [0, 0.3] });
    s += M.frown(60, 62, 7);
    return s;
  }

  function vorurteil(P, o, C) {
    const cloud = C.lin('#B9BCD2', '#7E829E'), blind = C.grad('#5A3A2A');
    let s = `<path d="M18 96 Q4 88 12 74 Q6 56 24 50 Q28 30 50 32 Q60 18 78 26 Q98 24 100 44 Q116 52 108 70 Q116 86 100 96 Q60 104 18 96 Z" ${F(cloud)}/>`;
    s += `<path d="M30 92 Q60 98 92 92" fill="none" stroke="#6B6F8E" stroke-width="2.2" stroke-linecap="round"/>`;
    // blinkers on both sides of the eyes
    s += `<path d="M32 50 L40 48 L42 74 L34 78 Z" ${F(blind, 2.4)}/><path d="M88 50 L80 48 L78 74 L86 78 Z" ${F(blind, 2.4)}/><path d="M40 52 L80 52" stroke="#5A3A2A" stroke-width="3"/>`;
    s += pair(60, 62, 10, 6, { brow: 'flat', bw: 3.2, dir: [0, 0.1], lid: '#9A9EBC', lidY: -0.2 });
    s += M.frown(60, 80, 8);
    // crossed arms
    s += `<path d="M34 100 Q60 88 84 104 M36 106 Q60 90 86 98" fill="none" ${S(8)}/><path d="M34 100 Q60 88 84 104 M36 106 Q60 90 86 98" fill="none" stroke="#9A9EBC" stroke-width="4.4" stroke-linecap="round"/>`;
    return s;
  }

  function falschmeldung(P, o, C) {
    const paper = C.lin('#FFFFFF', '#E3E6EE');
    let s = `<g transform="rotate(-6 60 64)"><path d="M18 14 L102 14 L106 112 L22 112 Z" ${F(paper)}/>`;
    s += `<path d="M26 22 L98 22" stroke="${OUT}" stroke-width="2"/><rect x="28" y="26" width="64" height="14" rx="2" fill="#E0304A"/><path d="M34 33 L48 33 M54 33 L70 33 M76 33 L86 33" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
    s += `<path d="M30 88 L58 88 M30 94 L54 94 M30 100 L58 100 M66 88 L96 88 M66 94 L92 94 M66 100 L96 100" stroke="#9AA3B5" stroke-width="2" stroke-linecap="round"/></g>`;
    s += `<path d="M100 26 L106 50 L112 26 Z M106 56 L106 58" fill="#E0304A" ${S(2.2)}/><circle cx="106" cy="58" r="3" ${F('#E0304A', 2)}/><path d="M8 34 L14 56 L20 34 Z" fill="#E0304A" ${S(2.2)}/><circle cx="14" cy="62" r="3" ${F('#E0304A', 2)}/>`;
    s += shine(36, 50, 8, 3.5, -10);
    s += pair(60, 58, 12, 7, { brow: 'angry', bw: 3.4, dir: [0.3, 0.1] });
    s += M.grin(60, 74, 10);
    return s;
  }

  function vergessen(P, o, C) {
    const fog = C.lin('#5E6A9E', '#232A52');
    let s = `<path d="M6 76 Q-4 56 14 46 Q10 20 36 20 Q46 2 66 8 Q86 0 96 18 Q120 18 114 44 Q126 60 112 76 Q116 100 94 104 Q60 118 26 104 Q4 100 6 76 Z" ${F(fog)}/>`;
    s += `<path d="M84 30 Q98 30 98 42 Q98 52 88 52 Q80 52 80 44 Q80 38 86 38 M24 42 Q32 30 44 34 M18 84 Q30 94 44 90" fill="none" stroke="#8E98CC" stroke-width="3" stroke-linecap="round"/>`;
    // pages and an empty photo frame fading into the fog
    s += `<g transform="rotate(-18 18 104)" opacity=".85"><rect x="6" y="94" width="20" height="16" rx="1.5" ${F('#E9D9B8', 2)}/><rect x="9" y="97" width="14" height="10" fill="none" stroke="#8A6A3F" stroke-width="1.2" stroke-dasharray="2 2"/></g>`;
    s += `<g transform="rotate(20 102 100)" opacity=".7"><path d="M92 92 L110 90 L112 108 L94 110 Z" ${F('#FFFDF5', 2)}/><path d="M96 96 L106 95 M96 100 L104 99" stroke="#9AA3B5" stroke-width="1.4"/></g>`;
    s += shine(40, 26, 10, 4, -15);
    s += pair(60, 56, 14, 8, { look: 'glow', glow: '#BFA8FF', brow: 'angry', bw: 4.2 });
    s += M.roar(60, 72, 13, 14);
    return s;
  }

  const SHAPES = {
    fox, toad, bear, luther, potato,
    sumpfbrocken, regenwicht, streichholzkopf, krabbelstein, dornenigel, moorschlund,
    lavamolch, nebelqualle, ranklerin, nachtschwinge, glaspanzer, ofenwurm,
    frostblitz, dschungelbrueller, magmagolem, schattenwolf, sturmreiter, rechenkoenig,
    zweifler, vergesslicher, verwechsler, schwindler, richter, ablasshaendler,
    blattlaus, drahtwurm, wuehlmaus, faeulewolke, kaeferlarve: (P, o, C) => larve(P, o, C, false), kartoffelkaefer: (P, o, C) => kaefer(P, o, C, false),
    blattfresser, hagelwolke, ackerteufel, eierhaufen, riesenlarve: (P, o, C) => larve(P, o, C, true), kaeferkoenigin: (P, o, C) => kaefer(P, o, C, true),
    owl, beaver, moertelbatzen, schweissfunke, schotterhaufen, pfuetzenmolch, brennnesselwall, mischtrommel, kabelnatter, staubfahne, efeuranke, rostkaefer, abrissbirne, horse, schaustellerin, jahrmarktwespe, bratwurstglut, pfuetzenspritzer, kuerbiskopf, autoscooter, ausrufer, kirmesnebel, funkenrakete, zerrbild, zaunranke, haudenlukas, herrdergeisterbahn, kuesterin, friends, neidhammel, novembernebel, zugluft, kerzenloescher, laengstenacht, spaetfrost, maerzsturm, morgenmuffel, mauer, zankapfel, neidwurm, flunkerei, geruecht, keil, pencil, ruler, buchstabendreher, eselsohr, stummel, kritzelei, radierer, fehlerteufel, satzverdreher, wortsalat, knickheft, punktdieb, spitzer, rotstift, zeilenspringer, muellerin, wetterwart, kartenzeichnerin, kornkaefer, mehlmotte, getreiderost, mutterkorn, nieselregen, glatteis, sturmboee, hitzeflimmern, gewitterzelle, unwetter, nebelbank, dornengestruepp, morast, elster, kartendieb, magnetberg,
    schulaerztin, verkehrspolizistin, laerm, blendlicht, qualmwolke, gruppendruck, schlagloch, daemmerung, totwinkel, raser,
    imkerin, heimatforscherin, trampelpfad, trockenheit, plastiktuete, spritzmittel, maehmaschine, strassenwalze, spinnennetz, schimmelfleck, stromausfall, vorurteil, falschmeldung, vergessen,
  };
  // old shape names (saved games from before the redraw)
  const ALIAS = { blob: 'sumpfbrocken', drop: 'regenwicht', flame: 'streichholzkopf', rock: 'krabbelstein', hedgehog: 'dornenigel', newt: 'lavamolch', jelly: 'nebelqualle', vine: 'ranklerin', bat: 'nachtschwinge', beetle: 'kartoffelkaefer', dragon: 'ofenwurm', ghost: 'zweifler', king: 'rechenkoenig', merchant: 'ablasshaendler', letter: 'buchstabendreher', notebook: 'eselsohr', eraser: 'radierer' };
  const HEROES = ['fox', 'toad', 'bear', 'luther', 'potato', 'owl', 'beaver', 'horse', 'schaustellerin', 'kuesterin', 'friends', 'pencil', 'ruler', 'muellerin', 'wetterwart', 'kartenzeichnerin', 'imkerin', 'heimatforscherin', 'schulaerztin', 'verkehrspolizistin'];


  // where clothes sit on each hero (drawing coordinates before the stage scaling): head top [x, y, scale],
  // eyes [cx, cy, gap, r] (gap 0 = one eye seen from the side), neck [x, y, width], school bag [x, y]
  const OWN_HAT = ['beaver', 'wetterwart', 'schaustellerin', 'imkerin', 'verkehrspolizistin'];
  const FIT = {
    fox: { top: [60, 42, 1.2], eyes: [60, 62, 15, 7.5], neck: [60, 101, 50], pack: [20, 66] },
    toad: { top: [60, 44, 1.3], eyes: [60, 54, 22, 9], neck: [60, 98, 66], pack: [20, 72] },
    bear: { top: [60, 35, 1.2], eyes: [60, 54, 14, 6.5], neck: [60, 95, 62], pack: [20, 64] },
    potato: { top: [60, 35, 1.25], eyes: [60, 60, 14, 8], neck: [60, 99, 70], pack: [20, 64] },
    luther: { top: [60, 28, 1.1], eyes: [60, 55, 11, 5.5], neck: [60, 81, 46], pack: [24, 84] },
    owl: { top: [60, 31, 1.2], eyes: [60, 56, 14, 9], neck: [60, 80, 50], pack: [20, 74] },
    beaver: { top: [60, 38, 1.15], eyes: [60, 54, 11, 6], neck: [60, 80, 48], pack: [22, 84] },
    horse: { top: [91, 24, 0.62], eyes: [90, 34, 0, 5], neck: [76, 52, 22], pack: [36, 64] },
    schaustellerin: { top: [60, 36, 1.05], eyes: [60, 57, 11, 5.5], neck: [60, 82, 40], pack: [24, 92] },
    kuesterin: { top: [60, 30, 1], eyes: [60, 56, 10, 5.5], neck: [60, 81, 44], pack: [24, 84] },
    friends: [{ top: [40, 42, 0.8], eyes: [40, 60, 7, 4.5], neck: [40, 79, 30], pack: [16, 92] }, { top: [80, 40, 0.8], eyes: [80, 60, 7, 4.5], neck: [80, 79, 30] }],
    pencil: { top: [60, 17, 0.75], eyes: [60, 55, 10, 6.5], neck: [60, 76, 44], pack: [28, 70] },
    ruler: { top: [60, 18, 0.75], eyes: [60, 38, 9, 6], neck: [60, 58, 46], pack: [30, 70] },
    muellerin: { top: [60, 28, 1.1], eyes: [60, 58, 11, 5.5], neck: [60, 81, 46], pack: [24, 84] },
    wetterwart: { top: [60, 35, 1.1], eyes: [60, 61, 11, 5.5], neck: [60, 81, 46], pack: [24, 84] },
    kartenzeichnerin: { top: [60, 30, 1.1], eyes: [60, 58, 11, 5.5], neck: [60, 81, 46], pack: [24, 84] },
    schulaerztin: { top: [60, 24, 1.1], eyes: [60, 58, 11, 5.5], neck: [60, 81, 46], pack: [24, 84] },
    verkehrspolizistin: { top: [60, 34, 1.1], eyes: [60, 59, 11, 5.5], neck: [60, 81, 46], pack: [24, 84] },
    imkerin: { top: [60, 34, 1.1], eyes: [60, 60, 11, 5.5], neck: [60, 81, 46], pack: [24, 84] },
    heimatforscherin: { top: [60, 32, 1.1], eyes: [60, 59, 11, 5.5], neck: [60, 81, 46], pack: [24, 84] },
  };
  const at = (p, body) => `<g transform="translate(${p[0]} ${p[1]}) scale(${p[2] || 1})">${body}</g>`;
  const STRAW = '#E8C25A';
  // drawn around (0, 0) = top of the head, about 60 wide
  const OUTFIT = {
    strohhut: { head: true, front: (f) => at(f.top, `<path d="M-18 -2 Q-19 -24 0 -24 Q19 -24 18 -2 Z" fill="${STRAW}" ${S(2.2)}/><path d="M-18.5 -8 L18.5 -8 L18 -2 L-18 -2 Z" fill="#D9453B"/><ellipse cx="0" cy="-1" rx="38" ry="8" fill="${STRAW}" ${S(2.2)}/><path d="M-30 -1 Q0 6 30 -1" fill="none" stroke="#C99A2E" stroke-width="2"/>`) },
    krone: { head: true, front: (f) => at(f.top, `<path d="M-20 0 L-23 -20 L-11 -9 L0 -26 L11 -9 L23 -20 L20 0 Z" fill="#FFC93C" ${S(2.2)}/><circle cx="0" cy="-8" r="3.5" fill="#3FA0FF"/><circle cx="-12" cy="-4" r="2.5" fill="#FF6E8E"/><circle cx="12" cy="-4" r="2.5" fill="#FF6E8E"/>`) },
    aehrenkranz: { head: true, front: (f) => at(f.top, `<path d="M-32 4 Q0 -18 32 4" fill="none" stroke="#7A9A3A" stroke-width="4" stroke-linecap="round"/>${[-28, -20, -11, -2, 7, 16, 25].map((x) => { const y = -0.0105 * x * x - 5; return `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="7" fill="#E3B341" ${S(1.6)} transform="rotate(${x * 2} ${x} ${y})"/>`; }).join('')}`) },
    brille: { front: (f) => { const [cx, cy, gap, r] = f.eyes; const lens = (x) => `<circle cx="${x}" cy="${cy}" r="${r * 1.5}" fill="#BFE3FF" fill-opacity=".25" ${S(3)}/>`;
      return gap ? `${lens(cx - gap)}${lens(cx + gap)}<path d="M${cx - gap + r * 1.5} ${cy} Q${cx} ${cy - r} ${cx + gap - r * 1.5} ${cy}" fill="none" ${S(3)}/>` : lens(cx); } },
    schal: { front: (f) => { const [x, y, w] = f.neck, h = w / 2; return `<path d="M${x + h * 0.3} ${y} l4 24 l12 -3 l-6 -21 Z" fill="#D9453B" ${S(2)}/><path d="M${x - h} ${y - 5} Q${x} ${y + 5} ${x + h} ${y - 5} L${x + h} ${y + 3} Q${x} ${y + 13} ${x - h} ${y + 3} Z" fill="#D9453B" ${S(2)}/><path d="M${x - h * 0.6} ${y + 1} Q${x} ${y + 8} ${x + h * 0.6} ${y + 1}" fill="none" stroke="#FFF3C4" stroke-width="2.5" stroke-linecap="round"/>`; } },
    ranzen: { back: (f) => { const [x, y] = f.pack; return `<rect x="${x - 17}" y="${y - 20}" width="30" height="38" rx="7" fill="#3B7DD8" ${S(2.2)}/><path d="M${x - 17} ${y - 8} Q${x - 2} ${y} ${x + 13} ${y - 8}" fill="none" ${S(2)}/><rect x="${x - 6}" y="${y - 4}" width="8" height="7" rx="2" fill="#FFC93C" ${S(1.5)}/>`; },
      front: (f) => { const [x, y] = f.pack; return `<path d="M${x + 4} ${y - 18} Q${x + 14} ${y} ${x + 8} ${y + 18}" fill="none" stroke="#2A5DAA" stroke-width="6" stroke-linecap="round"/><path d="M${x + 4} ${y - 18} Q${x + 14} ${y} ${x + 8} ${y + 18}" fill="none" stroke="#1C2541" stroke-width="1.5" stroke-dasharray="3 3"/>`; } },
  };
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
    const body = SHAPES[shape](P, { evo: e, elite, boss, bare: !!opts.bare }, C);
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
  // clothes go on top of the drawing (baked or live), scaled like the hero's stage
  function dress(svg, shape, evo, outfit) {
    const o = FIT[shape] && OUTFIT[outfit];
    if (!o) return svg;
    // the friends both wear the piece; only the first carries the school bag
    const fits = [].concat(FIT[shape]).slice(0, o.back ? 1 : undefined);
    const k = [0.8, 0.9, 1][Math.max(0, Math.min(2, evo || 0))];
    const g = (f) => `<g transform="translate(${f1(60 * (1 - k))} ${f1(116 * (1 - k))}) scale(${k})">${fits.map(f).join('')}</g>`;
    if (o.back) svg = svg.replace(/^(<svg[^>]*>)/, `$1${g(o.back)}`);
    return svg.replace(/<\/svg>$/, `${g(o.front)}</svg>`);
  }
  // opts: { elite, boss } for enemies, { outfit } for heroes
  function monsterSVG(shape, color, evo, cls, opts) {
    opts = opts || {};
    const bare = !!(OUTFIT[opts.outfit] && OUTFIT[opts.outfit].head && OWN_HAT.includes(shape));
    if (BAKED && !bare) {
      const k = bakedKey(shape, evo, cls, opts), mirrored = /\benemy\b/.test(cls || '') && BAKED[k + '-enemy'] ? k + '-enemy' : k, svg = BAKED[mirrored];
      // ids are "m-<key>__…" in the file; make them unique per copy on the page
      if (svg) return dress(svg.replace('<svg', `<svg class="mon ${cls || ''}"`).split(`m-${mirrored}__`).join(`m-${mirrored}-${uid++}__`), shape, evo, opts.outfit);
    }
    return dress(render(shape, color, evo, cls, { ...opts, bare }), shape, evo, opts.outfit);
  }
  // spinning top seen from the side: the disc face is a circle squashed into perspective, so its inner group can turn
  // with a plain CSS rotation (class spin); parts = { tip, ring, disc } ids from MQ.TOP_PARTS
  const DISC = { leicht: ['#E8C38A', 5], schwer: ['#9A6A45', 10], eisen: ['#A3ABB8', 8] };
  const around = (n, f) => Array.from({ length: n }, (_, k) => f((k / n) * 2 * Math.PI)).join('');
  const pt = (r, a) => `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
  const TIP = {
    stahl: `<path d="M50 70 L70 70 L60 102 Z" fill="#B8C0CC" ${S(3)}/>`,
    gummi: `<path d="M50 70 L70 70 L66 94 Q60 103 54 94 Z" fill="#3A3D4A" ${S(3)}/>`,
    kugel: `<path d="M52 70 L68 70 L63 88 L57 88 Z" fill="#B8C0CC" ${S(3)}/><circle cx="60" cy="95" r="7" fill="#E4E9F0" ${S(3)}/><circle cx="57.5" cy="92.5" r="2" fill="#fff"/>`,
  };
  const RING = {
    zahn: '<circle r="30" fill="none" stroke="#5A6070" stroke-width="8" stroke-dasharray="6 4"/>',
    welle: `<path d="M${around(48, (a) => pt(30 + 3.5 * Math.sin(8 * a), a) + ' L').slice(0, -2)}Z" fill="none" stroke="#2E86AB" stroke-width="6"/>`,
    flamme: around(10, (a) => `<path d="M${pt(24, a - 0.2)} L${pt(42, a + 0.12)} L${pt(24, a + 0.25)} Z" fill="#FF8A3D" stroke="#C8401A" stroke-width="2"/>`),
  };
  function topSVG(color, parts, cls) {
    const [fill, th] = DISC[parts.disc] || DISC.leicht; const dark = shade(fill, -0.3);
    return `<svg class="mon top ${cls || ''}" viewBox="0 0 120 120" aria-hidden="true"><g transform="translate(0 14)">${TIP[parts.tip] || TIP.stahl}
      <ellipse cx="60" cy="${66 + th}" rx="44" ry="15" fill="${dark}" ${S(3)}/><rect x="16" y="66" width="88" height="${th}" fill="${dark}"/><path d="M16 66v${th}M104 66v${th}" ${S(3)}/>
      <g transform="translate(60 66) scale(1 .34)"><g class="spin"><circle r="44" fill="${fill}" stroke="#1C2541" stroke-width="6"/>${around(4, (a) => `<circle cx="${pt(37, a).replace(' ', '" cy="')}" r="3.5" fill="${dark}"/>`)}${RING[parts.ring] || RING.zahn}<circle r="15" fill="${color}" stroke="#1C2541" stroke-width="5"/><circle cx="10" r="4" fill="#fff" opacity=".7"/></g></g>
      <rect x="54" y="30" width="12" height="34" rx="5" fill="${color}" ${S(3)}/><ellipse cx="60" cy="30" rx="9" ry="4" fill="${shade(color, 0.35)}" ${S(2.5)}/></g></svg>`;
  }
  /* ---------- Der Konzertsaal (musik.js) ---------- */
  const mu_note = (x, y, k, c) => `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="0" cy="0" rx="5" ry="3.6" transform="rotate(-20)" fill="${c || OUT}"/><path d="M4.4 -1 V-18 Q9 -14 10 -9" fill="none" stroke="${c || OUT}" stroke-width="2" stroke-linecap="round"/></g>`;
  function dirigentin(P, o, C) {
    const skin = C.grad('#F0C29A'), coat = C.grad('#2E3350'), hair = C.grad('#3A2A22'), shirt = '#FFFDF5';
    let s = `<path d="M18 116 Q20 80 60 78 Q100 80 102 116 Z" ${F(coat)}/>`;
    s += `<path d="M48 80 L60 104 L72 80 Z" ${F(shirt, 2)}/><path d="M53 82 L60 86 L67 82 L67 88 L60 85 L53 88 Z" ${F('#D9453B', 1.6)}/>`;
    s += `<path d="M46 80 L58 116 M74 80 L62 116" ${N(2)}/>` + [100, 110].map((y) => `<circle cx="60" cy="${y}" r="2" ${F('#FFC93C', 1.4)}/>`).join('');
    if (o.evo >= 1) s += `<g transform="translate(30 92)">${mu_note(0, 4, 0.7, '#FFC93C')}</g>`;
    // left hand open, right hand raises the baton
    s += `<path d="M24 104 Q14 92 12 82" fill="none" stroke="${OUT}" stroke-width="12" stroke-linecap="round"/><path d="M24 104 Q14 92 12 82" fill="none" stroke="#2E3350" stroke-width="8" stroke-linecap="round"/><ellipse cx="12" cy="78" rx="6" ry="6.5" ${F(skin, 2)}/>`;
    s += `<path d="M96 100 Q108 86 104 70" fill="none" stroke="${OUT}" stroke-width="12" stroke-linecap="round"/><path d="M96 100 Q108 86 104 70" fill="none" stroke="#2E3350" stroke-width="8" stroke-linecap="round"/>`;
    s += `<path d="M104 66 L116 18" stroke="${OUT}" stroke-width="4.5" stroke-linecap="round"/><path d="M104 66 L116 18" stroke="#FFFDF5" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="104" cy="66" rx="6" ry="6.5" ${F(skin, 2)}/>${spark(116, 14, 4, '#FFE066')}`;
    s += `<ellipse cx="60" cy="56" rx="25" ry="26" ${F(skin)}/>`;
    s += `<ellipse cx="35" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/><ellipse cx="85" cy="60" rx="4.5" ry="6.5" ${F(skin, 2)}/>`;
    // hair pulled back into a bun
    s += `<circle cx="60" cy="26" r="11" ${F(hair)}/><path d="M33 58 Q30 28 60 28 Q90 28 87 58 Q82 42 60 40 Q38 42 33 58 Z" ${F(hair)}/><path d="M44 34 Q52 30 60 31" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".3"/>`;
    s += shine(47, 52, 5, 3, -20);
    s += pair(60, 58, 11, 5.5, { brow: 'up', bw: 2.4, iris: '#5A7FC4', browColor: '#3A2A22', dir: [0.3, -0.1] });
    s += `<path d="M60 62 Q58 68 61 69" ${N(2.2)}/>${M.smile(60, 74, 7)}`;
    s += blush(60, 68, 16, 4);
    s += mu_note(20, 30, 0.9) + (o.evo >= 2 ? mu_note(96, 40, 0.8, '#3B7DD8') : '');
    return s;
  }
  function misston(P, o, C) {
    const head = C.grad('#5A4E8A');
    let s = `<ellipse cx="54" cy="112" rx="34" ry="4" fill="${OUT}" opacity=".16"/>`;
    s += `<path d="M14 54 q6 -6 0 -12 q-6 -6 0 -12 M24 60 q5 -5 0 -10 q-5 -5 0 -10" fill="none" stroke="#9A8FD0" stroke-width="2.4" stroke-linecap="round"/>`;
    // crooked stem and flag of an eighth note
    s += `<path d="M78 84 Q84 50 74 30 Q70 20 78 10" fill="none" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="M78 84 Q84 50 74 30 Q70 20 78 10" fill="none" stroke="#5A4E8A" stroke-width="4.5" stroke-linecap="round"/>`;
    s += `<path d="M78 10 Q86 26 104 30 Q114 36 106 52 Q104 40 92 38 Q80 36 76 22 Z" ${F(head)}/>`;
    s += `<ellipse cx="54" cy="88" rx="30" ry="21" ${F(head)} transform="rotate(-18 54 88)"/>`;
    s += shine(42, 76, 8, 4, -20);
    s += pair(54, 86, 10, 6, { look: 'glow', glow: '#FFE45C', brow: 'angry', bw: 3.4 });
    s += M.wavy(48, 100, 8);
    return s;
  }
  function holzwurm(P, o, C) {
    const wood = C.lin('#C98A4E', '#9A5E2E'), worm = C.grad('#F2D8B0');
    let s = `<ellipse cx="60" cy="113" rx="44" ry="4" fill="${OUT}" opacity=".16"/>`;
    // a violin scroll block with bore holes
    s += `<path d="M12 112 L16 70 Q18 60 30 58 L96 58 Q108 60 108 72 L108 112 Z" ${F(wood)}/>`;
    s += `<path d="M24 74 Q50 70 96 76 M20 94 Q56 88 104 96" fill="none" stroke="#8A5228" stroke-width="1.8" stroke-linecap="round"/>`;
    s += [[30, 84, 3], [86, 102, 3.5], [96, 70, 2.5], [40, 104, 2.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#4A2E18"/>`).join('');
    s += `<ellipse cx="60" cy="66" rx="13" ry="7" fill="#4A2E18"/>`;
    s += [[46, 50, 9], [52, 38, 10], [62, 28, 12]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${F(worm)}/>`).join('').replace(/^/, `<path d="M60 66 Q44 58 46 50" fill="none" stroke="${OUT}" stroke-width="20" stroke-linecap="round"/><path d="M60 66 Q44 58 46 50" fill="none" stroke="#F2D8B0" stroke-width="15" stroke-linecap="round"/>`);
    s += `<ellipse cx="66" cy="26" rx="18" ry="16" ${F(worm)}/>`;
    s += shine(58, 18, 5, 2.5, -20);
    s += pair(66, 24, 7, 5, { dir: [0.4, 0.2], brow: 'angry', bw: 2.8 });
    s += `<path d="M64 34 L80 34 L78 40 L66 40 Z" ${F('#7A2340', 2)}/><path d="M68 34 L70 38 L72 34 L74 38 L76 34" fill="#fff"/>`;
    s += [[86, 46], [92, 54], [30, 52]].map(([x, y]) => `<rect x="${x}" y="${y}" width="5" height="3" rx="1" fill="#E3B57A" ${S(1.2)} transform="rotate(25 ${x} ${y})"/>`).join('');
    return s;
  }
  function quietschgeige(P, o, C) {
    const wood = C.grad('#D9782E');
    let s = `<ellipse cx="58" cy="114" rx="30" ry="4" fill="${OUT}" opacity=".16"/>`;
    s += `<rect x="53" y="8" width="10" height="44" rx="3" ${F('#3A2A22')}/><path d="M58 10 q8 -6 8 2 q0 6 -6 4" ${N(2.2)}/>`;
    s += `<path d="M58 36 C30 34 26 54 38 62 C26 70 26 108 58 110 C90 108 90 70 78 62 C90 54 86 34 58 36 Z" ${F(wood)}/>`;
    s += `<path d="M44 66 q-4 6 0 12 M72 66 q4 6 0 12" ${N(2)}/>`;
    s += `<path d="M55 14 V96 M58 14 V96 M61 14 V96" stroke="#E8E8F0" stroke-width="1"/><rect x="50" y="94" width="16" height="4" rx="1" ${F('#3A2A22', 1.6)}/>`;
    s += shine(44, 46, 6, 3, -20);
    s += pair(58, 56, 9, 5.5, { brow: 'worried', bw: 3 });
    s += M.open(58, 74, 9);
    // a crooked bow scraping across
    s += `<path d="M6 104 L110 40" stroke="${OUT}" stroke-width="4.5" stroke-linecap="round"/><path d="M6 104 L110 40" stroke="#8A5A32" stroke-width="2.2" stroke-linecap="round"/><path d="M10 108 L112 46" stroke="#F5F0E6" stroke-width="1.6"/>`;
    s += `<path d="M90 18 l8 -6 l-2 8 l8 -4 M100 30 l10 -2 l-6 6 l10 0 M16 30 l-8 -6 l2 8 l-8 -2" fill="none" stroke="#E0304A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    return s;
  }
  function hustenreiz(P, o, C) {
    const body = C.grad('#E8667A');
    let s = `<ellipse cx="56" cy="112" rx="34" ry="4" fill="${OUT}" opacity=".16"/>`;
    s += `<path d="M24 104 Q8 102 12 86 Q4 72 18 64 Q16 46 34 44 Q42 30 60 36 Q76 28 86 44 Q102 46 100 64 Q110 76 98 90 Q100 106 82 106 Z" ${F(body)}/>`;
    s += shine(36, 54, 8, 4, -25);
    s += pair(52, 66, 11, 6.5, { brow: 'worried', bw: 3, lid: '#D9536A', lidY: -0.2, lidRot: 8 });
    s += sk_drop(36, 80, 2.4) + sk_drop(70, 80, 2.4);
    s += `<ellipse cx="66" cy="88" rx="9" ry="7" ${F('#7A2340')}/><path d="M60 92 Q66 96 72 92" stroke="#E8516F" stroke-width="3" fill="none"/>`;
    // the cough: puffs and droplets flying right
    s += `<path d="M80 86 Q92 80 104 84 M82 94 Q96 96 110 92" fill="none" stroke="#9AA3C2" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="4 4"/>`;
    s += sk_drop(108, 74, 2.6) + sk_drop(114, 100, 2.2) + sk_drop(100, 104, 1.8);
    return s;
  }
  function donnerpauke(P, o, C) {
    const copper = C.grad('#D9823A');
    let s = `<ellipse cx="60" cy="114" rx="40" ry="4" fill="${OUT}" opacity=".18"/>`;
    s += `<path d="M34 92 L28 114 M86 92 L92 114 M60 100 L60 114" ${N(3)}/>`;
    s += `<path d="M14 50 Q16 100 60 104 Q104 100 106 50 Z" ${F(copper)}/>`;
    s += `<ellipse cx="60" cy="50" rx="46" ry="12" ${F('#F5EBD6')}/><ellipse cx="60" cy="50" rx="40" ry="9" fill="none" stroke="#D8CCB4" stroke-width="1.6"/>`;
    s += [20, 40, 80, 100].map((x) => `<rect x="${x - 2.5}" y="56" width="5" height="10" rx="1.5" ${F('#B8C0CC', 1.6)}/>`).join('');
    s += shine(34, 70, 8, 4, -20);
    s += pair(60, 74, 12, 7, { look: 'glow', glow: '#FFE45C', brow: 'angry', bw: 4 });
    s += M.roar(60, 88, 11, 9);
    // mallets
    s += `<path d="M22 20 L44 46 M98 20 L76 46" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M22 20 L44 46 M98 20 L76 46" stroke="#C99A5A" stroke-width="2.4" stroke-linecap="round"/><circle cx="20" cy="18" r="7" ${F('#F2EBDD')}/><circle cx="100" cy="18" r="7" ${F('#F2EBDD')}/>`;
    s += sk_bolt(52, 4, 0.5, 10) + sk_bolt(4, 54, 0.5, -10);
    return s;
  }
  function krachmacher(P, o, C) {
    const brass = C.grad('#E8B23A'), body = C.grad('#B5442E');
    let s = `<ellipse cx="60" cy="114" rx="42" ry="4" fill="${OUT}" opacity=".18"/>`;
    s += `<path d="M40 96 L36 114 M80 96 L84 114" ${N(5)}/>`;
    s += `<ellipse cx="60" cy="72" rx="34" ry="32" ${F(body)}/>`;
    // arms with crashing cymbals
    s += `<path d="M30 70 Q16 64 14 50 M90 70 Q104 64 106 50" fill="none" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="M30 70 Q16 64 14 50 M90 70 Q104 64 106 50" fill="none" stroke="#B5442E" stroke-width="5" stroke-linecap="round"/>`;
    s += `<ellipse cx="14" cy="44" rx="14" ry="5" ${F(brass)} transform="rotate(-20 14 44)"/><ellipse cx="106" cy="44" rx="14" ry="5" ${F(brass)} transform="rotate(20 106 44)"/>`;
    s += `<path d="M2 26 l-2 -8 M12 24 l2 -10 M22 28 l6 -8 M98 28 l-6 -8 M108 24 l-2 -10 M118 26 l2 -8" ${N(2.4)}/>`;
    // a brass horn bell for a mouth, the crown of a noisy king
    s += `<path d="M36 40 L42 24 L52 36 L60 18 L68 36 L78 24 L84 40 Z" ${F(brass)}/>`;
    s += shine(44, 52, 8, 4, -25);
    s += pair(60, 58, 12, 7, { look: 'glow', glow: '#FFE45C', brow: 'angry', bw: 4 });
    s += `<path d="M48 76 L72 76 L80 98 Q60 106 40 98 Z" ${F(brass)}/><ellipse cx="60" cy="98" rx="20" ry="5" ${F('#7A2340')}/>`;
    s += mu_note(98, 92, 0.9, '#FFE066') + mu_note(14, 88, 0.8, '#FFE066');
    return s;
  }
  Object.assign(SHAPES, { dirigentin, misston, holzwurm, quietschgeige, hustenreiz, donnerpauke, krachmacher });
  HEROES.push('dirigentin');
  FIT.dirigentin = { top: [60, 30, 1.1], eyes: [60, 58, 11, 5.5], neck: [60, 81, 46], pack: [24, 84] };

  return { monsterSVG, topSVG, render, bakedKey, heroes: HEROES, shapes: Object.keys(SHAPES), shade, outfits: Object.keys(OUTFIT), dressable: Object.keys(FIT) };
})();
if (typeof module !== 'undefined') module.exports = MONART;
