// Solves a Jahrmarkt task from what the child sees: the question text and the data attributes of the drawing.
// Used by tests/test_jahrmarkt.js (against the generator's answers) and by the playtest bot (in the page).
const UNIT = { km: 100000, m: 100, cm: 1, kg: 1000, g: 1 };
const qty = (s) => { let v = 0; for (const [, n, u] of s.matchAll(/(½|\d+) (km|m|cm|kg|g)\b/g)) v += n === '½' ? UNIT[u] / 2 : +n * UNIT[u]; return v; };
const tags = (html, cls) => [...html.matchAll(/<[a-z]+\b[^>]*>/g)].map((m) => m[0]).filter((t) => new RegExp(`class="${cls}"`).test(t))
  .map((t) => Object.fromEntries([...t.matchAll(/data-([a-z0-9-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]])));
const textOf = (html) => html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const COLOR = { Rot: 'rot', Blau: 'blau', Gelb: 'gelb', 'Grün': 'gruen' };
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const money = (ct) => [Math.floor(ct / 100), ct % 100];
const mins = (q) => [...q.matchAll(/(\d+):(\d+) Uhr/g)].map((m) => 60 * m[1] + +m[2]);
// numbers in reading order; money is turned into cent
const tokens = (q) => [...q.matchAll(/(\d+) € (\d+) ct|(\d+) €|(\d+) ct|(\d+)/g)].map((m) => (m[1] ? 100 * m[1] + +m[2] : m[3] ? 100 * m[3] : +(m[4] || m[5])));

function solve(html, options, REF) {
  const t = (html.match(/data-t="([^"]+)"/) || [])[1]; const q = textOf(html);
  const counts = {}; tags(html, 'sector').forEach((s) => { counts[s.color] = (counts[s.color] || 0) + 1; });
  const named = () => [...q.matchAll(/\b(Rot|Blau|Gelb|Grün)\b/g)].map((m) => COLOR[m[1]]);
  const T = tokens(q);
  switch (t) {
    case 'clock': { const h = +tags(html, 'hand-h')[0].angle, m = +tags(html, 'hand-m')[0].angle; return [Math.floor(h / 30) || 12, Math.round(m / 6)]; }
    case 'span': { const [a, b] = mins(q); return [b - a]; }
    case 'end': { const s = mins(q)[0]; const d = q.includes('Dreiviertelstunde') ? 45 : q.includes('halbe Stunde') ? 30 : q.includes('Viertelstunde') ? 15 : +q.match(/(\d+) Minuten/)[1]; return [Math.floor((s + d) / 60), (s + d) % 60]; }
    case 'quarter': return [15 * +q.match(/(\d+) Viertelstunden/)[1]];
    case 'conv': {
      const sides = q.split(' = ').map((s) => ({ v: qty(s), slots: [...s.matchAll(/\? (km|m|cm|kg|g)\b/g)].map((m) => m[1]) }));
      const [S, O] = sides[0].slots.length ? sides : [sides[1], sides[0]]; const v = O.v - S.v;
      return S.slots.length === 1 ? [v / UNIT[S.slots[0]]] : [Math.floor(v / UNIT[S.slots[0]]), (v % UNIT[S.slots[0]]) / UNIT[S.slots[1]]];
    }
    case 'ruler': { const r = tags(html, 'thing')[0]; return [(r.x1 - r.x0) / r.px]; }
    case 'scale': case 'scale2': { const s = tags(html, 'weight').reduce((a, w) => a + +w.g, 0); return t === 'scale' ? [s] : [Math.floor(s / 1000), s % 1000]; }
    case 'per': return [T[0] * T[1]];
    case 'perkg': return [qty(q.match(/zusammen (\d+ kg)/)[1]) / T[0]];
    case 'cmpl': case 'cmpm': { const [a, b, same] = options; return qty(a) === qty(b) ? same : qty(a) > qty(b) ? a : b; }
    case 'guess': { const r = REF.find((x) => q.includes(`ungefähr ${x[0]}?`)); return r[1]; }
    case 'wheel1': { const ask = named(); const hit = ask.reduce((n, c) => n + (counts[c] || 0), 0); const all = Object.values(counts).reduce((a, b) => a + b, 0); return hit === all ? 'sicher' : hit ? 'möglich' : 'unmöglich'; }
    case 'wheel2': { const [a, b] = named(); const ca = counts[a] || 0, cb = counts[b] || 0; return ca === cb ? 'Beide gleich wahrscheinlich' : options.find((o) => COLOR[o] === (ca > cb ? a : b)); }
    case 'wheel3': { const best = q.includes('unwahrscheinlichsten') ? Math.min : Math.max; const vals = options.map((o) => counts[COLOR[o]] || 0); return options[vals.indexOf(best(...vals))]; }
    case 'los': return [T.reduce((a, b) => a * b, 1)];
    case 'order': return [fact(q.split(' setzen')[0].split(/, | und /).length)];
    case 'digits': { const k = q.match(/nur die Ziffern (.+?), jede/)[1].match(/\d/g).length; return [k * (k - 1)]; }
    case 'bar': {
      const bars = tags(html, 'jm-bar').map((b) => ({ at: q.indexOf(b.label), v: +b.value })).filter((b) => b.at >= 0).sort((a, b) => a.at - b.at);
      return [q.includes(' mehr ') ? bars[0].v - bars[1].v : q.includes('zusammen') ? bars[0].v + bars[1].v : bars[0].v];
    }
    case 's_mul': return [T[0] * T[1] / 100];
    case 's_sub': return [T[0] - T[1]];
    case 's_add': return [T[0] + T[1]];
    case 's_div': return [T[1] / T[0]];
    case 'm_add': return money(T[0] + T[1]);
    case 'm_change': return money(T.length === 2 ? T[1] - T[0] : T[2] - T[0] * T[1]);
    case 'm_mul': return money(T[0] * T[1]);
    case 's_two': return [(T[0] * T[1] + T[2]) / 100];
    case 's_left': return [(T[0] - T[1] * T[2]) / 100];
    case 's_ceil': return [Math.ceil(T[0] / T[1])];
    case 's_len': return [T[0] * T[1]];
  }
  throw new Error('unknown Jahrmarkt task ' + t + ': ' + q);
}
if (typeof module !== 'undefined') module.exports = { solve, textOf };
