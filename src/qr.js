// QR code, error correction level L only (enough for a link shown on a screen). Byte mode, and alphanumeric mode for
// the tail of the text made of 0–9, A–Z and space $%*+-./: (the save code in a link): 5.5 bits a character instead of 8.
const QR = (() => {
  // per version 1–40: error correction codewords per block, number of blocks (level L)
  const ECC = [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30];
  const BLOCKS = [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25];
  const rawCodewords = (v) => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; } return r >> 3; };
  const dataCodewords = (v) => rawCodewords(v) - ECC[v] * BLOCKS[v];
  const alignPos = (v) => { if (v === 1) return []; const n = Math.floor(v / 7) + 2; const step = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2; const r = [6]; for (let p = v * 4 + 10; r.length < n; p -= step) r.splice(1, 0, p); return r; };

  const gfMul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z; };
  function rsDivisor(deg) { const r = Array(deg).fill(0); r[deg - 1] = 1; let root = 1; for (let i = 0; i < deg; i++) { for (let j = 0; j < deg; j++) { r[j] = gfMul(r[j], root); if (j + 1 < deg) r[j] ^= r[j + 1]; } root = gfMul(root, 2); } return r; }
  function rsRemainder(data, div) { const r = div.map(() => 0); for (const b of data) { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => { r[i] ^= gfMul(c, f); }); } return r; }

  const ALNUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
  function codewords(text) {
    let cut = text.length; while (cut && ALNUM.includes(text[cut - 1])) cut--;
    const bytes = Array.from(unescape(encodeURIComponent(text.slice(0, cut))), (c) => c.charCodeAt(0)); const tail = text.slice(cut);
    const useBytes = bytes.length > 0 || !tail; const alnumCount = (v) => (v < 10 ? 9 : v < 27 ? 11 : 13);
    let v = 1; const fits = (v) => (useBytes ? 4 + (v < 10 ? 8 : 16) + bytes.length * 8 : 0) + (tail ? 4 + alnumCount(v) + Math.floor(tail.length / 2) * 11 + tail.length % 2 * 6 : 0) <= dataCodewords(v) * 8;
    while (v <= 40 && !fits(v)) v++;
    if (v > 40) return null;
    const bits = []; const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    if (useBytes) { put(4, 4); put(bytes.length, v < 10 ? 8 : 16); bytes.forEach((b) => put(b, 8)); }
    if (tail) { put(2, 4); put(tail.length, alnumCount(v)); for (let i = 0; i < tail.length; i += 2) { const a = ALNUM.indexOf(tail[i]); if (i + 1 < tail.length) put(a * 45 + ALNUM.indexOf(tail[i + 1]), 11); else put(a, 6); } }
    const cap = dataCodewords(v) * 8; put(0, Math.min(4, cap - bits.length)); put(0, (8 - bits.length % 8) % 8);
    for (let p = 0xEC; bits.length < cap; p ^= 0xEC ^ 0x11) put(p, 8);
    const data = []; for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
    const nb = BLOCKS[v], ec = ECC[v], raw = rawCodewords(v), short = nb - raw % nb, shortLen = Math.floor(raw / nb) - ec; const div = rsDivisor(ec);
    const blocks = []; for (let i = 0, k = 0; i < nb; i++) { const len = shortLen + (i < short ? 0 : 1); const d = data.slice(k, k + len); k += len; blocks.push([d, rsRemainder(d, div)]); }
    const out = []; for (let i = 0; i <= shortLen; i++) blocks.forEach(([d]) => { if (i < d.length) out.push(d[i]); });
    for (let i = 0; i < ec; i++) blocks.forEach(([, e]) => out.push(e[i]));
    return { v, out };
  }

  const MASKS = [(x, y) => (x + y) % 2, (x, y) => y % 2, (x, y) => x % 3, (x, y) => (x + y) % 3, (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2,
    (x, y) => x * y % 2 + x * y % 3, (x, y) => (x * y % 2 + x * y % 3) % 2, (x, y) => ((x + y) % 2 + x * y % 3) % 2];
  function penalty(m) {
    const n = m.length; let p = 0, dark = 0; const lines = [];
    for (let y = 0; y < n; y++) { lines.push(m[y].map(Number).join('')); lines.push(m.map((r) => +r[y]).join('')); }
    for (const l of lines) { for (const r of l.match(/0{5,}|1{5,}/g) || []) p += r.length - 2; p += 40 * (l.match(/(?=10111010000|00001011101)/g) || []).length; }
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { dark += m[y][x]; if (x && y && m[y][x] === m[y - 1][x] && m[y][x] === m[y][x - 1] && m[y][x] === m[y - 1][x - 1]) p += 3; }
    return p + 10 * (Math.ceil(Math.abs(dark * 20 - n * n * 10) / (n * n)) - 1);
  }

  // dark modules as rows of booleans, or null if the text is too long for a QR code
  function matrix(text) {
    const cw = codewords(text);
    if (!cw) return null;
    const { v, out } = cw; const n = v * 4 + 17;
    const m = Array.from({ length: n }, () => Array(n).fill(false)); const fn = m.map((r) => r.map(() => false));
    const set = (x, y, d) => { m[y][x] = d; fn[y][x] = true; };
    for (let i = 0; i < n; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    for (const [cx, cy] of [[3, 3], [n - 4, 3], [3, n - 4]]) for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)); const x = cx + dx, y = cy + dy; if (x >= 0 && x < n && y >= 0 && y < n) set(x, y, d !== 2 && d !== 4); }
    const al = alignPos(v); const last = al.length - 1;
    al.forEach((ay, i) => al.forEach((ax, j) => { if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }));
    const format = (mask, mm) => {
      const d = (1 << 3) | mask; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const b = ((d << 10) | r) ^ 0x5412; const bit = (i) => ((b >>> i) & 1) === 1; const s = (x, y, dd) => { mm[y][x] = dd; fn[y][x] = true; };
      for (let i = 0; i < 6; i++) s(8, i, bit(i));
      s(8, 7, bit(6)); s(8, 8, bit(7)); s(7, 8, bit(8));
      for (let i = 9; i < 15; i++) s(14 - i, 8, bit(i));
      for (let i = 0; i < 8; i++) s(n - 1 - i, 8, bit(i));
      for (let i = 8; i < 15; i++) s(8, n - 15 + i, bit(i));
      s(8, n - 8, true);
    };
    format(0, m);
    if (v >= 7) { let r = v; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25); const b = (v << 12) | r; for (let i = 0; i < 18; i++) { const d = ((b >>> i) & 1) === 1; set(n - 11 + i % 3, Math.floor(i / 3), d); set(Math.floor(i / 3), n - 11 + i % 3, d); } }
    let i = 0;
    for (let right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < n; vert++) for (let j = 0; j < 2; j++) {
        const x = right - j, y = ((right + 1) & 2) === 0 ? n - 1 - vert : vert;
        if (!fn[y][x] && i < out.length * 8) { m[y][x] = ((out[i >>> 3] >>> (7 - (i & 7))) & 1) === 1; i++; }
      }
    }
    let best = null, bestP = Infinity;
    MASKS.forEach((f, k) => { const mm = m.map((r, y) => r.map((d, x) => (fn[y][x] ? d : d !== (f(x, y) === 0)))); format(k, mm); const p = penalty(mm); if (p < bestP) { bestP = p; best = mm; } });
    return best;
  }

  function svg(text, label) {
    const m = matrix(text); if (!m) return null;
    const n = m.length + 8; let d = '';
    m.forEach((r, y) => r.forEach((on, x) => { if (on) d += `M${x + 4} ${y + 4}h1v1h-1z`; }));
    return `<svg class="qr" viewBox="0 0 ${n} ${n}" role="img" aria-label="${label}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
  }
  return { matrix, svg };
})();
if (typeof module !== 'undefined') module.exports = QR;
