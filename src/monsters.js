const MONART = (() => {
  const OUT = '#1C2541';
  let uid = 0;
  function shade(hex, amt) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = (c) => Math.max(0, Math.min(255, Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt)))); return '#' + [f(r), f(g), f(b)].map((c) => c.toString(16).padStart(2, '0')).join(''); }
  const S = (w) => `stroke="${OUT}" stroke-width="${w || 2.5}" stroke-linejoin="round" stroke-linecap="round"`;

  // eyes: two round eyes; look: 'normal' | 'angry' | 'happy' | 'sleepy' ; size scale
  function eyes(cx, cy, gap, r, look) {
    const l = cx - gap, rt = cx + gap; const pr = r * 0.55;
    if (look === 'happy') return `<path d="M${l - r} ${cy} Q${l} ${cy - r * 1.3} ${l + r} ${cy}" fill="none" ${S(3)}/><path d="M${rt - r} ${cy} Q${rt} ${cy - r * 1.3} ${rt + r} ${cy}" fill="none" ${S(3)}/>`;
    let brows = '';
    if (look === 'angry') brows = `<path d="M${l - r} ${cy - r * 1.35} L${l + r * 0.9} ${cy - r * 0.75}" fill="none" ${S(3)}/><path d="M${rt + r} ${cy - r * 1.35} L${rt - r * 0.9} ${cy - r * 0.75}" fill="none" ${S(3)}/>`;
    if (look === 'sleepy') brows = `<path d="M${l - r} ${cy - r * 0.6} L${l + r} ${cy - r * 0.6}" ${S(3)}/>`;
    return `<ellipse cx="${l}" cy="${cy}" rx="${r}" ry="${r * 1.1}" fill="#fff" ${S(2.2)}/><ellipse cx="${rt}" cy="${cy}" rx="${r}" ry="${r * 1.1}" fill="#fff" ${S(2.2)}/>
      <circle cx="${l + r * 0.2}" cy="${cy + r * 0.1}" r="${pr}" fill="${OUT}"/><circle cx="${rt + r * 0.2}" cy="${cy + r * 0.1}" r="${pr}" fill="${OUT}"/>
      <circle cx="${l}" cy="${cy - r * 0.25}" r="${pr * 0.38}" fill="#fff"/><circle cx="${rt}" cy="${cy - r * 0.25}" r="${pr * 0.38}" fill="#fff"/>${brows}`;
  }
  function eye1(cx, cy, r, look) { // single big eye
    return `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 1.05}" fill="#fff" ${S(2.5)}/><circle cx="${cx + r * 0.1}" cy="${cy + r * 0.1}" r="${r * 0.52}" fill="${OUT}"/><circle cx="${cx - r * 0.15}" cy="${cy - r * 0.3}" r="${r * 0.18}" fill="#fff"/>${look === 'angry' ? `<path d="M${cx - r * 1.1} ${cy - r * 1.2} L${cx + r * 1.1} ${cy - r * 1.0}" fill="none" ${S(3)}/>` : ''}`;
  }
  const mouth = {
    smile: (cx, cy, w) => `<path d="M${cx - w} ${cy} Q${cx} ${cy + w * 0.9} ${cx + w} ${cy}" fill="none" ${S(3)}/>`,
    grin: (cx, cy, w) => `<path d="M${cx - w} ${cy} Q${cx} ${cy + w * 1.3} ${cx + w} ${cy} Z" fill="#FF6E8E" ${S(2.5)}/><path d="M${cx - w * 0.6} ${cy + 1} Q${cx} ${cy + 4} ${cx + w * 0.6} ${cy + 1} L${cx + w * 0.6} ${cy} L${cx - w * 0.6} ${cy} Z" fill="#fff"/>`,
    open: (cx, cy, w) => `<ellipse cx="${cx}" cy="${cy + w * 0.3}" rx="${w * 0.55}" ry="${w * 0.7}" fill="#FF6E8E" ${S(2.5)}/>`,
    sad: (cx, cy, w) => `<path d="M${cx - w} ${cy + w * 0.6} Q${cx} ${cy - w * 0.4} ${cx + w} ${cy + w * 0.6}" fill="none" ${S(3)}/>`,
    fangs: (cx, cy, w) => `<path d="M${cx - w} ${cy} Q${cx} ${cy + w * 0.8} ${cx + w} ${cy}" fill="none" ${S(3)}/><path d="M${cx - w * 0.6} ${cy + 1} L${cx - w * 0.4} ${cy + w * 0.7} L${cx - w * 0.2} ${cy + 2} Z M${cx + w * 0.6} ${cy + 1} L${cx + w * 0.4} ${cy + w * 0.7} L${cx + w * 0.2} ${cy + 2} Z" fill="#fff" ${S(1.5)}/>`,
    flat: (cx, cy, w) => `<path d="M${cx - w} ${cy} L${cx + w} ${cy}" fill="none" ${S(3)}/>`,
  };
  function highlight(cx, cy, rx, ry) { return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".35"/>`; }

  const SHAPES = {
    fox: (c, g, d, l) => `
      <path d="M94 96 Q120 86 112 56 Q124 70 118 92 Q110 112 86 110 Z" fill="${g.flame}" ${S()}/>
      <path d="M26 58 L16 10 L50 40 Z" fill="${g.body}" ${S()}/><path d="M29 52 L24 22 L42 40 Z" fill="${g.inner}"/>
      <path d="M94 58 L104 10 L70 40 Z" fill="${g.body}" ${S()}/><path d="M91 52 L96 22 L78 40 Z" fill="${g.inner}"/>
      <ellipse cx="60" cy="72" rx="38" ry="34" fill="${g.body}" ${S()}/>
      <path d="M28 78 Q60 112 92 78 Q92 104 60 106 Q28 104 28 78 Z" fill="${g.inner}"/>
      ${highlight(44, 50, 10, 6)}
      <ellipse cx="60" cy="88" rx="6" ry="4" fill="${OUT}"/>${mouth.smile(60, 94, 9)}
      ${eyes(60, 64, 13, 8, 'normal')}`,
    toad: (c, g, d, l) => `
      <path d="M14 94 Q2 70 22 66 L42 80 Z" fill="${g.body}" ${S()}/><path d="M106 94 Q118 70 98 66 L78 80 Z" fill="${g.body}" ${S()}/>
      <ellipse cx="60" cy="74" rx="42" ry="32" fill="${g.body}" ${S()}/>
      <ellipse cx="60" cy="88" rx="26" ry="14" fill="${g.inner}"/>
      <circle cx="38" cy="44" r="15" fill="${g.body}" ${S()}/><circle cx="82" cy="44" r="15" fill="${g.body}" ${S()}/>
      ${highlight(34, 64, 10, 5)}
      ${eyes(60, 44, 22, 9, 'normal')}
      <circle cx="30" cy="64" r="4" fill="${d}"/><circle cx="90" cy="64" r="4" fill="${d}"/><circle cx="60" cy="58" r="3" fill="${d}"/>
      ${mouth.grin(60, 72, 20)}`,
    bear: (c, g, d, l) => `
      <circle cx="26" cy="34" r="14" fill="${g.body}" ${S()}/><circle cx="94" cy="34" r="14" fill="${g.body}" ${S()}/><circle cx="26" cy="34" r="7" fill="${g.inner}"/><circle cx="94" cy="34" r="7" fill="${g.inner}"/>
      <ellipse cx="60" cy="68" rx="40" ry="36" fill="${g.body}" ${S()}/>
      ${highlight(42, 44, 11, 6)}
      <ellipse cx="60" cy="80" rx="18" ry="13" fill="${g.inner}"/>
      <ellipse cx="60" cy="74" rx="6" ry="4" fill="${OUT}"/>${mouth.smile(60, 82, 8)}
      ${eyes(60, 58, 14, 7, 'normal')}
      <path d="M22 96 L30 108 M38 100 L42 112 M98 96 L90 108 M82 100 L78 112" fill="none" ${S(3)}/>`,
    owl: (c, g, d, l) => `
      <path d="M32 44 L24 12 L50 32 Z M88 44 L96 12 L70 32 Z" fill="${d}" ${S()}/>
      <ellipse cx="60" cy="68" rx="40" ry="40" fill="${g.body}" ${S()}/>
      <path d="M24 64 Q12 90 34 106 Q30 84 40 68 Z M96 64 Q108 90 86 106 Q90 84 80 68 Z" fill="${d}" ${S()}/>
      <ellipse cx="60" cy="90" rx="20" ry="15" fill="${g.inner}"/>
      <path d="M50 84 q4 4 8 0 M62 84 q4 4 8 0 M56 94 q4 4 8 0" fill="none" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="45" cy="56" r="15" fill="${g.inner}" ${S(2)}/><circle cx="75" cy="56" r="15" fill="${g.inner}" ${S(2)}/>
      ${eyes(60, 56, 15, 8, 'normal')}
      <path d="M55 66 L65 66 L60 76 Z" fill="#FF9F2E" ${S(2)}/>
      <path d="M48 106 L44 114 M54 107 L54 115 M66 107 L66 115 M72 106 L76 114" fill="none" ${S(3.5)}/>`,
    blob: (c, g, d, l) => `
      <path d="M16 74 Q10 30 54 24 Q100 22 104 70 Q104 100 60 102 Q18 102 16 74 Z" fill="${g.body}" ${S()}/>
      <path d="M30 30 Q20 24 26 14 M60 22 Q60 10 70 12 M90 34 Q96 24 104 30" fill="none" ${S(3)}/>
      ${highlight(38, 42, 12, 7)}
      <circle cx="84" cy="84" r="5" fill="${d}"/><circle cx="34" cy="88" r="3.5" fill="${d}"/>
      ${eyes(60, 56, 15, 9, 'normal')}${mouth.open(60, 76, 11)}`,
    drop: (c, g, d, l) => `
      <path d="M60 8 Q96 52 96 70 A36 36 0 0 1 24 70 Q24 52 60 8 Z" fill="${g.body}" ${S()}/>
      <path d="M40 46 Q32 60 34 72" fill="none" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/>
      <circle cx="18" cy="40" r="4" fill="${g.body}" ${S(2)}/><circle cx="104" cy="52" r="3" fill="${g.body}" ${S(2)}/>
      ${eyes(60, 68, 13, 8, 'normal')}${mouth.smile(60, 86, 8)}`,
    flame: (c, g, d, l) => `
      <path d="M60 6 Q88 34 78 56 Q96 60 90 84 A30 30 0 0 1 30 84 Q24 60 42 56 Q32 34 60 6 Z" fill="${g.body}" ${S()}/>
      <path d="M60 44 Q74 62 68 80 A9 9 0 0 1 52 80 Q46 62 60 44 Z" fill="${g.flame}"/>
      <path d="M16 26 Q24 18 26 30 M100 20 Q108 14 104 30" fill="none" stroke="${g.flame}" stroke-width="4" stroke-linecap="round"/>
      ${eyes(60, 70, 12, 7, 'angry')}${mouth.grin(60, 90, 10)}`,
    rock: (c, g, d, l) => `
      <path d="M16 88 L22 48 L44 26 L76 22 L100 44 L104 90 Z" fill="${g.body}" ${S()}/>
      <path d="M22 48 L44 26 L52 54 Z" fill="${g.inner}" opacity=".9"/><path d="M66 64 L104 90 L62 90 Z" fill="${d}" opacity=".8"/>
      <path d="M8 100 L28 92 M112 100 L92 92" fill="none" ${S(5)}/>
      <path d="M30 108 L44 96 M90 108 L76 96" fill="none" ${S(5)}/>
      ${eyes(60, 56, 14, 7, 'sleepy')}${mouth.flat(60, 76, 9)}`,
    hedgehog: (c, g, d, l) => `
      <path d="M10 76 L26 42 L34 60 L46 30 L56 54 L68 26 L78 54 L92 36 L104 76 Z" fill="${d}" ${S()}/>
      <path d="M18 74 L30 50 L36 64 L48 40 L56 60 L68 38 L78 62 L90 46 L98 74 Z" fill="${g.body}"/>
      <ellipse cx="60" cy="80" rx="40" ry="24" fill="${g.inner}" ${S()}/>
      ${highlight(44, 70, 10, 5)}
      <ellipse cx="60" cy="90" rx="6" ry="4" fill="${OUT}"/>${mouth.smile(60, 96, 7)}
      ${eyes(60, 76, 14, 6, 'normal')}`,
    newt: (c, g, d, l) => `
      <path d="M90 66 Q116 60 108 36" fill="none" stroke="${g.body}" stroke-width="12" stroke-linecap="round"/><path d="M90 66 Q116 60 108 36" fill="none" ${S(2)} stroke-dasharray="0"/>
      <ellipse cx="54" cy="70" rx="40" ry="26" fill="${g.body}" ${S()}/>
      <path d="M22 86 L12 100 M36 92 L30 108 M72 92 L78 108 M86 86 L96 100" fill="none" ${S(4)}/>
      <ellipse cx="54" cy="82" rx="22" ry="10" fill="${g.inner}"/>
      <circle cx="40" cy="52" r="4" fill="${g.flame}"/><circle cx="70" cy="56" r="3" fill="${g.flame}"/><circle cx="26" cy="68" r="3" fill="${g.flame}"/>
      ${eyes(56, 60, 12, 7, 'normal')}${mouth.smile(56, 76, 10)}`,
    jelly: (c, g, d, l) => `
      <path d="M24 62 q4 24 0 36 M44 62 q6 24 0 40 M60 62 q-4 26 2 42 M78 62 q-4 24 0 38 M96 62 q2 24 -2 34" fill="none" stroke="${g.inner}" stroke-width="7" stroke-linecap="round"/>
      <path d="M18 62 A42 42 0 0 1 102 62 Q102 70 90 68 Q80 72 70 66 Q60 72 50 66 Q40 72 30 68 Q18 70 18 62 Z" fill="${g.body}" ${S()}/>
      ${highlight(40, 36, 12, 7)}
      ${eyes(60, 46, 14, 8, 'normal')}${mouth.open(60, 58, 8)}`,
    vine: (c, g, d, l) => `
      <path d="M34 110 Q18 60 60 48 Q102 60 86 110 Z" fill="${g.body}" ${S()}/>
      <path d="M60 48 Q58 30 64 14" fill="none" ${S(3)}/>
      <ellipse cx="28" cy="46" rx="16" ry="9" fill="${g.inner}" ${S(2)} transform="rotate(-30 28 46)"/><ellipse cx="92" cy="46" rx="16" ry="9" fill="${g.inner}" ${S(2)} transform="rotate(30 92 46)"/>
      <ellipse cx="68" cy="14" rx="9" ry="14" fill="${g.inner}" ${S(2)} transform="rotate(20 68 14)"/>
      <path d="M22 82 Q6 76 10 60 M98 82 Q114 76 110 60" fill="none" ${S(4)}/>
      ${eyes(60, 74, 13, 7, 'normal')}${mouth.grin(60, 92, 10)}`,
    bat: (c, g, d, l) => `
      <path d="M8 56 Q24 36 40 54 L40 76 Q26 66 8 80 Z" fill="${d}" ${S()}/><path d="M112 56 Q96 36 80 54 L80 76 Q94 66 112 80 Z" fill="${d}" ${S()}/>
      <path d="M40 46 L44 26 L54 44 Z M80 46 L76 26 L66 44 Z" fill="${g.body}" ${S()}/>
      <ellipse cx="60" cy="66" rx="26" ry="28" fill="${g.body}" ${S()}/>
      ${highlight(50, 48, 8, 5)}
      ${eyes(60, 62, 11, 7, 'angry')}${mouth.fangs(60, 80, 9)}`,
    beetle: (c, g, d, l) => `
      <path d="M44 34 Q36 14 26 10 M76 34 Q84 14 94 10" fill="none" ${S(3)}/><circle cx="26" cy="10" r="3.5" fill="${OUT}"/><circle cx="94" cy="10" r="3.5" fill="${OUT}"/>
      <path d="M30 66 L10 56 M30 82 L8 90 M90 66 L110 56 M90 82 L112 90 M40 100 L26 114 M80 100 L94 114" fill="none" ${S(4)}/>
      <ellipse cx="60" cy="78" rx="36" ry="34" fill="${g.body}" ${S()}/>
      <path d="M60 44 L60 112" ${S(2.5)}/>
      <path d="M36 50 Q30 78 38 108 M48 46 Q42 78 48 111 M72 46 Q78 78 72 111 M84 50 Q90 78 82 108" fill="none" stroke="${d}" stroke-width="4" stroke-linecap="round"/>
      ${highlight(46, 58, 6, 10)}
      <ellipse cx="60" cy="38" rx="20" ry="14" fill="${g.inner}" ${S()}/>
      ${eyes(60, 37, 9, 5, 'angry')}${mouth.flat(60, 46, 5)}`,
    dragon: (c, g, d, l) => `
      <path d="M22 60 L6 30 L32 46 Z M98 60 L114 30 L88 46 Z" fill="${d}" ${S()}/>
      <path d="M92 76 Q112 70 108 52" fill="none" stroke="${g.body}" stroke-width="10" stroke-linecap="round"/><path d="M106 48 L116 44 L112 56 Z" fill="${g.flame}" ${S(2)}/>
      <ellipse cx="60" cy="66" rx="38" ry="32" fill="${g.body}" ${S()}/>
      <path d="M40 38 L46 18 L54 38 Z M56 36 L62 14 L70 36 Z M72 38 L80 20 L84 40 Z" fill="${g.flame}" ${S(2)}/>
      <ellipse cx="60" cy="80" rx="18" ry="11" fill="${g.inner}"/>
      ${highlight(44, 50, 9, 5)}
      <circle cx="56" cy="77" r="1.8" fill="${OUT}"/><circle cx="64" cy="77" r="1.8" fill="${OUT}"/>
      ${eyes(60, 60, 14, 7, 'angry')}${mouth.fangs(60, 88, 11)}
      <path d="M22 96 L30 110 M98 96 L90 110" fill="none" ${S(4)}/>`,
    ghost: (c, g, d, l) => `
      <path d="M20 60 A40 40 0 0 1 100 60 L100 106 L88 94 L76 108 L62 94 L48 108 L34 94 L20 106 Z" fill="${g.ghost}" ${S()}/>
      <path d="M30 60 A30 30 0 0 1 90 60" fill="none" stroke="#fff" stroke-width="4" opacity=".8"/>
      <path d="M8 70 Q0 60 10 52 M112 70 Q120 60 110 52" fill="none" stroke="${g.ghost}" stroke-width="5" stroke-linecap="round"/>
      ${eyes(60, 58, 14, 8, 'angry')}
      <ellipse cx="60" cy="80" rx="7" ry="9" fill="${OUT}"/><ellipse cx="60" cy="83" rx="4" ry="4" fill="#FF6E8E"/>`,
    king: (c, g, d, l) => `
      <rect x="20" y="40" width="80" height="66" rx="16" fill="${g.body}" ${S()}/>
      <path d="M20 42 L30 12 L44 32 L60 6 L76 32 L90 12 L100 42 Z" fill="#FFC93C" ${S()}/><circle cx="30" cy="12" r="3.5" fill="#FF6E8E"/><circle cx="60" cy="6" r="4" fill="#3FA0FF"/><circle cx="90" cy="12" r="3.5" fill="#FF6E8E"/>
      <rect x="32" y="84" width="56" height="16" rx="6" fill="${g.inner}" ${S(2)}/>
      <text x="60" y="97" text-anchor="middle" font-size="13" font-weight="800" fill="${OUT}" font-family="sans-serif">7·8=?</text>
      ${eyes(60, 60, 15, 8, 'angry')}${mouth.flat(60, 76, 8)}
      <path d="M12 108 L22 100 M108 108 L98 100" fill="none" ${S(4)}/>`,
    merchant: (c, g, d, l) => `
      <path d="M22 50 L98 50 L90 34 L30 34 Z" fill="#5A2A2A" ${S()}/><rect x="38" y="20" width="44" height="18" rx="5" fill="#5A2A2A" ${S()}/><rect x="38" y="30" width="44" height="5" fill="#FFC93C"/>
      <ellipse cx="60" cy="78" rx="36" ry="30" fill="${g.body}" ${S()}/>
      ${highlight(44, 62, 8, 5)}
      <rect x="66" y="78" width="28" height="24" rx="6" fill="#FFC93C" ${S()}/><text x="80" y="95" text-anchor="middle" font-size="13" font-weight="800" fill="${OUT}" font-family="sans-serif">€</text>
      <rect x="28" y="84" width="24" height="16" rx="3" fill="#FFF3C4" ${S(2)}/><path d="M32 89 L48 89 M32 94 L44 94" ${S(1.5)}/>
      ${eyes(60, 66, 13, 7, 'angry')}${mouth.grin(60, 84, 9)}`,
    luther: (c, g, d, l) => `
      <path d="M22 108 Q24 76 60 76 Q96 76 98 108 Z" fill="#2B2B2B" ${S()}/><path d="M50 84 L60 110 L70 84 Z" fill="#F5F0E6" ${S(2)}/>
      <circle cx="60" cy="54" r="28" fill="#F5C9A0" ${S()}/>
      <path d="M20 40 Q60 10 100 40 L100 48 Q60 32 20 48 Z" fill="#1C2541" ${S()}/><path d="M28 40 L92 40 L94 48 L26 48 Z" fill="#2B2B2B"/>
      <path d="M36 52 Q34 40 48 42 M84 52 Q86 40 72 42" fill="none" ${S(2.5)}/>
      ${eyes(60, 54, 11, 6, 'normal')}
      <path d="M60 60 L58 68 L63 68" fill="none" ${S(2)}/>${mouth.smile(60, 74, 7)}
      <path d="M66 92 L92 70" fill="none" stroke="#FFC93C" stroke-width="3" stroke-linecap="round"/><path d="M88 66 L96 68 L92 76 Z" fill="#FFF3C4" ${S(1.5)}/>`,
    kuesterin: (c, g, d, l) => `
      <path d="M22 108 Q24 76 60 76 Q96 76 98 108 Z" fill="#3B5B8C" ${S()}/><path d="M46 78 Q60 90 74 78" fill="#F5F0E6" ${S(2)}/>
      <circle cx="60" cy="24" r="11" fill="#7A4A2A" ${S()}/>
      <circle cx="60" cy="54" r="28" fill="#F5C9A0" ${S()}/>
      <path d="M32 50 Q32 24 60 24 Q88 24 88 50 Q78 34 60 34 Q42 34 32 50 Z" fill="#7A4A2A" ${S()}/>
      ${eyes(60, 54, 11, 6, 'normal')}
      <path d="M60 60 L58 68 L63 68" fill="none" ${S(2)}/>${mouth.smile(60, 74, 7)}
      <rect x="84" y="80" width="10" height="24" rx="2" fill="#FFF3C4" ${S(2)}/><path d="M89 80 L89 75" ${S(1.5)}/><path d="M89 64 Q95 72 89 76 Q83 72 89 64 Z" fill="#FFC93C" ${S(1.5)}/>`,
    friends: (c, g, d, l) => `
      <path d="M8 112 Q10 80 36 80 Q56 80 58 100 L58 112 Z" fill="#E86A5A" ${S()}/><path d="M62 112 L62 100 Q64 80 84 80 Q110 80 112 112 Z" fill="#3FA0A0" ${S()}/>
      <path d="M50 96 Q60 106 70 96" fill="none" stroke="#F5C9A0" stroke-width="7" stroke-linecap="round"/><path d="M50 96 Q60 106 70 96" fill="none" ${S(2)}/><path d="M57 101 L63 101" stroke="#FFC93C" stroke-width="3" stroke-linecap="round"/>
      <path d="M14 46 Q10 70 18 78 M58 46 Q62 70 54 78" fill="none" stroke="#7A4A2A" stroke-width="6" stroke-linecap="round"/>
      <circle cx="36" cy="50" r="22" fill="#F5C9A0" ${S()}/><path d="M14 48 Q14 26 36 26 Q58 26 58 48 Q48 36 36 36 Q24 36 14 48 Z" fill="#7A4A2A" ${S()}/>
      <circle cx="84" cy="50" r="22" fill="#E8B48A" ${S()}/><path d="M62 46 Q62 26 84 26 Q106 26 106 46 Q100 40 92 42 Q88 34 80 40 Q70 38 62 46 Z" fill="#E0B84A" ${S()}/>
      ${eyes(36, 52, 8, 4.5, 'happy')}${mouth.smile(36, 62, 6)}
      ${eyes(84, 52, 8, 4.5, 'normal')}${mouth.grin(84, 62, 7)}`,
    muellerin: (c, g, d, l) => `
      <path d="M22 108 Q24 76 60 76 Q96 76 98 108 Z" fill="#8D6E63" ${S()}/><path d="M42 80 L44 108 L76 108 L78 80 Q60 88 42 80 Z" fill="#F5F0E6" ${S(2)}/>
      <circle cx="60" cy="54" r="28" fill="#F5C9A0" ${S()}/>
      <path d="M30 50 Q30 22 60 22 Q90 22 90 50 Q80 36 60 36 Q40 36 30 50 Z" fill="#F5F0E6" ${S()}/><path d="M86 44 Q98 50 94 62" fill="none" stroke="#F5F0E6" stroke-width="5" stroke-linecap="round"/>
      ${eyes(60, 56, 11, 6, 'normal')}
      <path d="M60 62 L58 70 L63 70" fill="none" ${S(2)}/>${mouth.smile(60, 76, 7)}
      <path d="M82 84 Q80 70 92 70 Q104 70 102 84 L104 106 L80 106 Z" fill="#E6D3A3" ${S(2)}/><path d="M86 74 L98 74" ${S(2)}/>`,
    wetterwart: (c, g, d, l) => `
      <path d="M22 108 Q24 76 60 76 Q96 76 98 108 Z" fill="#2F6FB0" ${S()}/><path d="M60 78 L60 108" ${S(2)}/><circle cx="54" cy="90" r="2" fill="${OUT}"/><circle cx="54" cy="100" r="2" fill="${OUT}"/>
      <circle cx="60" cy="56" r="27" fill="#F5C9A0" ${S()}/>
      <path d="M24 42 Q60 30 96 42 Q100 52 92 50 Q60 42 28 50 Q20 52 24 42 Z" fill="#FFC93C" ${S()}/><path d="M36 42 Q36 18 60 18 Q84 18 84 42 Z" fill="#FFC93C" ${S()}/>
      ${eyes(60, 58, 11, 6, 'normal')}
      <path d="M60 64 L58 72 L63 72" fill="none" ${S(2)}/>${mouth.smile(60, 78, 7)}
      <rect x="92" y="62" width="8" height="34" rx="4" fill="#fff" ${S(2)}/><circle cx="96" cy="100" r="6" fill="#E5484D" ${S(2)}/><path d="M96 98 L96 78" stroke="#E5484D" stroke-width="3"/>`,
    kartenzeichnerin: (c, g, d, l) => `
      <path d="M22 108 Q24 76 60 76 Q96 76 98 108 Z" fill="#4E7A3A" ${S()}/><path d="M48 78 L60 92 L72 78" fill="none" ${S(2)}/>
      <circle cx="80" cy="30" r="10" fill="#5D3A1A" ${S()}/>
      <circle cx="60" cy="54" r="28" fill="#F5C9A0" ${S()}/>
      <path d="M32 50 Q30 24 60 24 Q90 24 88 50 Q78 34 60 36 Q42 34 32 50 Z" fill="#5D3A1A" ${S()}/>
      ${eyes(60, 54, 11, 6, 'normal')}
      <path d="M60 60 L58 68 L63 68" fill="none" ${S(2)}/>${mouth.smile(60, 74, 7)}
      <circle cx="26" cy="94" r="12" fill="#FFF8E1" ${S(2)}/><path d="M26 85 L29 94 L26 103 L23 94 Z" fill="#E5484D" ${S(1.2)}/>
      <rect x="80" y="84" width="26" height="9" rx="4" fill="#E6D3A3" ${S(2)} transform="rotate(-20 93 88)"/>`,
    potato: (c, g, d, l) => `
      <path d="M44 32 Q40 14 50 8 M72 30 Q74 14 84 10" fill="none" stroke="#3E8E41" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="48" cy="9" rx="9" ry="5" fill="#4FB04F" ${S(2)} transform="rotate(-30 48 9)"/><ellipse cx="84" cy="10" rx="9" ry="5" fill="#4FB04F" ${S(2)} transform="rotate(30 84 10)"/>
      <path d="M18 66 Q16 30 58 30 Q104 28 102 66 Q104 100 60 102 Q16 104 18 66 Z" fill="#D9B35E" ${S()}/>
      ${highlight(40, 48, 11, 6)}
      <circle cx="30" cy="80" r="2.5" fill="#8A6A3F"/><circle cx="88" cy="42" r="2.5" fill="#8A6A3F"/><circle cx="84" cy="88" r="2.5" fill="#8A6A3F"/><circle cx="40" cy="38" r="2" fill="#8A6A3F"/>
      <path d="M14 70 Q0 74 8 86 M106 70 Q120 74 112 86" fill="none" stroke="#D9B35E" stroke-width="7" stroke-linecap="round"/><path d="M14 70 Q0 74 8 86 M106 70 Q120 74 112 86" fill="none" ${S(2)}/>
      <path d="M44 102 L42 114 M76 102 L78 114" fill="none" ${S(5)}/>
      ${eyes(60, 62, 14, 8, 'normal')}${mouth.grin(60, 82, 12)}`,
    beaver: (c, g, d, l) => `
      <path d="M86 96 Q118 100 112 74 Q104 64 88 78 Z" fill="${d}" ${S()}/><path d="M94 82 L108 80 M92 90 L108 90" fill="none" stroke="${g.inner}" stroke-width="2"/>
      <circle cx="30" cy="44" r="10" fill="${g.body}" ${S()}/><circle cx="90" cy="44" r="10" fill="${g.body}" ${S()}/>
      <ellipse cx="60" cy="72" rx="38" ry="36" fill="${g.body}" ${S()}/>
      ${highlight(42, 56, 9, 5)}
      <ellipse cx="60" cy="86" rx="20" ry="14" fill="${g.inner}"/>
      <path d="M30 40 Q60 2 90 40 Z" fill="#FFC93C" ${S()}/><path d="M60 14 L60 38" ${S(2.5)}/><path d="M22 40 L98 40" ${S(5)}/>
      <ellipse cx="60" cy="76" rx="7" ry="5" fill="${OUT}"/>
      <rect x="53" y="84" width="7" height="10" rx="1" fill="#fff" ${S(2)}/><rect x="60" y="84" width="7" height="10" rx="1" fill="#fff" ${S(2)}/>
      ${eyes(60, 60, 14, 7, 'normal')}
      <path d="M32 102 L28 112 M88 102 L92 112" fill="none" ${S(4)}/>`,
    pencil: (c, g, d, l) => `
      <path d="M40 34 L60 4 L80 34 Z" fill="#F2D2A0" ${S()}/><path d="M53 15 L60 4 L67 15 Z" fill="#3A3A3A"/>
      <rect x="40" y="34" width="40" height="62" fill="${g.body}" ${S()}/><path d="M53 34 L53 96 M67 34 L67 96" fill="none" stroke="${d}" stroke-width="2"/>
      <rect x="38" y="96" width="44" height="9" fill="#B8BEC8" ${S(2)}/><rect x="40" y="105" width="40" height="11" rx="4" fill="#FF8FA8" ${S(2)}/>
      <path d="M40 66 L22 78 M80 66 L98 78" fill="none" ${S(4)}/>
      ${eyes(60, 54, 10, 6, 'normal')}${mouth.smile(60, 74, 7)}`,
    eraser: (c, g, d, l) => `
      <path d="M12 52 L34 30 L108 30 L108 88 L86 110 L12 110 Z" fill="${d}" ${S()}/>
      <rect x="12" y="52" width="74" height="58" rx="6" fill="${g.body}" ${S()}/><rect x="12" y="52" width="30" height="58" rx="6" fill="${g.inner}" ${S()}/>
      <circle cx="100" cy="114" r="3" fill="${g.inner}" ${S(1.5)}/><circle cx="110" cy="106" r="2.5" fill="${g.inner}" ${S(1.5)}/>
      ${eyes(62, 74, 11, 7, 'angry')}${mouth.fangs(62, 94, 10)}`,
    notebook: (c, g, d, l) => `
      <path d="M22 14 L84 14 L98 28 L98 106 L22 106 Z" fill="${g.body}" ${S()}/><path d="M84 14 L84 28 L98 28 Z" fill="${g.inner}" ${S(2)}/>
      <rect x="34" y="68" width="52" height="28" rx="3" fill="#FFFFFF" ${S(2)}/><path d="M40 78 L80 78 M40 87 L72 87" fill="none" stroke="#8FA3C8" stroke-width="2"/>
      <path d="M30 14 L30 106" fill="none" stroke="${d}" stroke-width="3"/>
      ${eyes(60, 44, 13, 7, 'angry')}${mouth.flat(60, 60, 7)}`,
    ruler: (c, g, d, l) => `
      <rect x="6" y="40" width="108" height="46" rx="6" fill="${g.body}" ${S()}/>
      <path d="M16 40 L16 52 M26 40 L26 47 M36 40 L36 52 M46 40 L46 47 M74 40 L74 47 M84 40 L84 52 M94 40 L94 47 M104 40 L104 52" fill="none" ${S(2)}/>
      <path d="M30 86 L26 106 M90 86 L94 106" fill="none" ${S(5)}/>
      ${highlight(30, 74, 10, 4)}
      ${eyes(60, 60, 13, 7, 'normal')}${mouth.smile(60, 74, 8)}`,
    letter: (c, g, d, l) => `
      <path d="M18 108 L48 12 L72 12 L102 108 L80 108 L73 86 L47 86 L40 108 Z M54 76 L66 76 L60 58 Z" fill="${g.body}" fill-rule="evenodd" ${S()}/>
      <path d="M48 12 L72 12 L76 24 L44 24 Z" fill="${g.inner}" opacity=".7"/>
      ${eyes(60, 38, 9, 6, 'angry')}${mouth.flat(60, 50, 5)}`,
  };

  // where clothes sit on each hero shape: head top [x, y, scale], eyes [cx, cy, gap, r] as in eyes(), neck [x, y, width], school bag [x, y]
  const FIT = {
    fox: { top: [60, 42, 1.2], eyes: [60, 64, 13, 8], neck: [60, 101, 50], pack: [20, 66] },
    toad: { top: [60, 33, 1.3], eyes: [60, 44, 22, 9], neck: [60, 98, 66], pack: [20, 72] },
    bear: { top: [60, 35, 1.2], eyes: [60, 58, 14, 7], neck: [60, 95, 62], pack: [20, 64] },
    owl: { top: [60, 32, 1.2], eyes: [60, 56, 15, 8], neck: [60, 76, 72], pack: [20, 66] },
    potato: { top: [60, 35, 1.25], eyes: [60, 62, 14, 8], neck: [60, 99, 70], pack: [20, 64] },
    luther: { top: [60, 28, 1.1], eyes: [60, 54, 11, 6], neck: [60, 81, 46], pack: [24, 84] },
    kuesterin: { top: [60, 30, 1.1], eyes: [60, 54, 11, 6], neck: [60, 81, 46], pack: [24, 84] },
    pencil: { top: [60, 24, 0.75], eyes: [60, 54, 10, 6], neck: [60, 86, 44], pack: [32, 72] },
    ruler: { top: [60, 42, 1.1], eyes: [60, 60, 13, 7], neck: [60, 84, 64], pack: [22, 44] },
    // the pair of friends: the left one wears it
    friends: { top: [36, 30, 0.8], eyes: [36, 52, 8, 4.5], neck: [36, 77, 34], pack: [14, 96] },
    // seen from the side with one eye: gap 0 draws a single lens
    horse: { top: [32, 23, 0.6], eyes: [30, 28, 0, 5], neck: [47, 58, 24], pack: [92, 58] },
    // these three have a hat of their own: the piece sits on its brim and covers it
    schaustellerin: { top: [60, 34, 1.3], eyes: [60, 56, 11, 6], neck: [60, 81, 46], pack: [24, 84] },
    beaver: { top: [60, 40, 1.35], eyes: [60, 60, 14, 7], neck: [60, 101, 52], pack: [20, 68] },
    muellerin: { top: [60, 25, 1.1], eyes: [60, 56, 11, 6], neck: [60, 81, 46], pack: [24, 84] },
    wetterwart: { top: [60, 44, 1.4], eyes: [60, 58, 11, 6], neck: [60, 83, 46], pack: [24, 86] },
    kartenzeichnerin: { top: [60, 27, 1.1], eyes: [60, 54, 11, 6], neck: [60, 81, 46], pack: [24, 84] },
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

  // outfit: optional clothing id; only hero shapes listed in FIT can wear it
  function monsterSVG(shape, color, evo, cls, outfit) {
    const id = 'mg' + (uid++);
    const g = { body: `url(#${id})`, inner: shade(color, 0.55), flame: shade(color, 0.3), ghost: `url(#${id}g)` };
    const d = shade(color, -0.3);
    const defs = `<defs><radialGradient id="${id}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="${shade(color, 0.35)}"/><stop offset=".6" stop-color="${color}"/><stop offset="1" stop-color="${shade(color, -0.25)}"/></radialGradient><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="${shade(color, 0.6)}"/></linearGradient></defs>`;
    const aura = evo >= 1 ? `<circle cx="60" cy="62" r="56" fill="${shade(color, 0.5)}" opacity=".18"/><circle cx="60" cy="62" r="56" fill="none" stroke="${shade(color, 0.5)}" stroke-width="2" opacity=".5"/>` : '';
    const fit = FIT[shape], o = fit && OUTFIT[outfit];
    const crown = evo >= 2 && !(o && o.head) && !['king', 'luther', 'merchant', 'friends'].includes(shape) ? `<path d="M40 22 L46 6 L54 18 L60 2 L66 18 L74 6 L80 22 Z" fill="#FFC93C" ${S(2)}/><circle cx="60" cy="4" r="2.5" fill="#FF6E8E"/>` : '';
    const sparkle = evo >= 1 ? `<path d="M12 18 L14 24 L20 26 L14 28 L12 34 L10 28 L4 26 L10 24 Z" fill="#FFC93C"/>` : '';
    const body = (SHAPES[shape] || SHAPES.blob)(color, g, d, null);
    return `<svg class="mon ${cls || ''}" viewBox="0 0 120 120" aria-hidden="true">${defs}${aura}${o && o.back ? o.back(fit) : ''}${body}${o ? o.front(fit) : ''}${crown}${sparkle}</svg>`;
  }
  return { monsterSVG, shapes: Object.keys(SHAPES), shade, outfits: Object.keys(OUTFIT), dressable: Object.keys(FIT) };
})();
if (typeof module !== 'undefined') module.exports = MONART;
