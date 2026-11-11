// Klasse 1/2 mathe: checks beyond the generic ones in test_knowledge.js and test_data.js.
// Every answer is worked out again from what the child sees (text and picture data), numbers stay in the grade's range.
const fails = [];
require('./units.js');
const MK = require('../src/knowledge.js');
const MQ = require('../src/logic.js');
const fail = (m) => { if (!fails.includes(m)) fails.push(m); };
const UNITS = { zahlen20: 20, formen1: 20, zahlen100: 100, malteilen: 100, groessen2: 100, formen2: 100 };
// Kommaschreibweise and money in cent go past 100 (1,35 € = 135 ct)
// choice kinds answered from fixed tables (names of forms and solids, sentences, facts): no recomputation
const FIXED = ['form_formen1_name', 'form_formen1_finden', 'form_formen2_name', 'form_formen2_finden', 'form_koerper', 'gr2_laenge2_schaetzen', 'gr2_zufall1_satz', 'form2_koerper2_form'];
const OVER_100 = ['gr2_laenge2_komma', 'gr2_laenge2_zwei'];
const tags = (html, cls) => [...html.matchAll(/<[a-z]+\b[^>]*>/g)].map((m) => m[0]).filter((t) => new RegExp(`class="${cls}"`).test(t))
  .map((t) => Object.fromEntries([...t.matchAll(/data-([a-z0-9-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]])));
const dv = (svg) => [...svg.matchAll(/data-v="([^"]*)"/g)].map((m) => m[1]);
const nums = (s) => (s.match(/\d+/g) || []).map(Number);
const count = (s, re) => (s.match(re) || []).length;
const plain = (s) => s.replace(/ /g, ' ');
const sum = (a) => a.reduce((x, y) => x + y, 0);
const WD = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const ECKEN = { Dreieck: 3, Kreis: 0, Quadrat: 4, Rechteck: 4, Viereck: 4 };
const CHANGE = { '1 € 10-ct': 10, '1 € 20-ct': 5, '1 € 50-ct': 2, '2 € 1-€': 2, '2 € 50-ct': 4, '5 € 1-€': 5, '10 € 2-€': 5, '10 € 1-€': 10, '1 € 5-ct': 20 };
const FACTS = { Woche: 7, Jahr: 12, Stunde: 60, Tag: 24 };
const EKF = { Ecken: 8, Kanten: 12, Flächen: 6 };
const attrs = (t) => Object.fromEntries([...t.matchAll(/([a-z0-9-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]]));
// squares and a line on the picture: is the figure the same after folding at the line?
const folds = (sq, a) => { const at = new Set(sq.map((r) => `${r.x},${r.y}`)), w = +sq[0].width;
  return sq.every((r) => at.has(a.x1 === a.x2 ? `${2 * a.x1 - +r.x - w},${r.y}` : `${r.x},${2 * a.y1 - +r.y - w}`)); };
const line = (d) => { const m = d.match(/^M(-?[\d.]+) (-?[\d.]+) L(-?[\d.]+) (-?[\d.]+)$/); return { x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4] }; };
const cosine = (u, v) => (u[0] * v[0] + u[1] * v[1]) / Math.hypot(...u) / Math.hypot(...v);
const legs = (svg) => [...svg.matchAll(/<line class="leg"[^>]*>/g)].map((m) => { const a = attrs(m[0]); return [+a.x2 - +a.x1, +a.y2 - +a.y1]; });
const isRight = (svg) => { const l = legs(svg); return l.length === 2 && Math.abs(cosine(...l)) < 0.01; };
// Gerade, Strecke, Strahl from the ends the child sees: points and arrow tips
const lineKinds = (svg) => svg.split('<g class="lin">').slice(1).map((g) => { const p = count(g, /class="pt"/g), t = count(g, /class="tip"/g); return p === 2 && !t ? 'Strecke' : t === 2 && !p ? 'Gerade' : p === 1 && t === 1 ? 'Strahl' : '?'; });
const one = (opts, ok) => { const r = opts.filter(ok); return r.length === 1 ? r[0] : null; };

function expr(s) {
  let m; s = plain(s);
  if ((m = s.match(/^(\d+) ([+−·:]) (\d+) = \?$/))) { const [a, b] = [+m[1], +m[3]]; return { '+': a + b, '−': a - b, '·': a * b, ':': a / b }[m[2]]; }
  if ((m = s.match(/^(\d+) \+ \? = (\d+)$/))) return m[2] - m[1];
  if ((m = s.match(/^(\d+) · (\d+) = (\d+) · \?$/))) return m[1] * m[2] / m[3];
  if ((m = s.match(/^(\d+) · (\d+) = (\d+) · (\d+) ([+−]) \?$/))) return (m[5] === '+' ? 1 : -1) * (m[1] * m[2] - m[3] * m[4]);
  if ((m = s.match(/^(\d+) − \? = (\d+)$/))) return m[1] - m[2];
  if ((m = s.match(/^\? · (\d+) = (\d+)$/) || s.match(/^(\d+) · \? = (\d+)$/))) return m[2] / m[1];
  if ((m = s.match(/^(\d+) = (\d+) \+ \?$/) || s.match(/^(\d+) = \? \+ (\d+)$/))) return m[1] - m[2];
  if ((m = s.match(/^(\d+), \?, (\d+)$/))) return +m[2] - +m[1] === 2 ? +m[1] + 1 : NaN;
  if ((m = s.match(/^(\d) Z (\d) E = \?$/))) return 10 * m[1] + +m[2];
  if ((m = s.match(/^(\d+),(\d\d) € = \? ct$/))) return 100 * m[1] + +m[2];
  if ((m = s.match(/^1,(\d\d) m = \? cm$/) || s.match(/^1 m (\d+) cm = \? cm$/))) return 100 + +m[1];
  if ((m = s.match(/^(\d+) (m|dm|cm) = \? (dm|cm|mm)$/))) { const U = { m: 1000, dm: 100, cm: 10, mm: 1 }; return m[1] * U[m[2]] / U[m[3]]; }
  if ((m = s.match(/^(\d+) cm \+ \? cm = 1 m$/))) return 100 - m[1];
  return undefined;
}
// the answers as the child can work them out from the screen
function solve(q) {
  const svg = q.svg || q.fig || '', ask = plain(q.ask || ''), story = plain(q.story || '');
  if (q.plan && q.full) { const m = ask.match(/soll (\d+) lang, (\d+) breit, (\d+) hoch/); if (!m || +m[1] !== q.plan[0].length || +m[2] !== q.plan.length || +m[3] !== q.full) fail('Quader size ' + ask); return [m[1] * m[2] * m[3] - sum(q.plan.flat())]; }
  if (q.plan) { if (q.qid.endsWith('reihe') && count(svg, /class="cube"/g) !== sum(q.plan.flat())) fail('tower drawing ' + q.qid); return [sum(q.plan.flat())]; }
  if (q.nb) return q.nb === 'Zehner' ? [q.n - (q.n % 10), q.n - (q.n % 10) + 10] : [q.n - 1, q.n + 1];
  if (q.seq) { const d = q.seq[1] - q.seq[0]; if (q.seq.some((x, i) => i && x - q.seq[i - 1] !== d)) return null; return [1, 2, 3].map((k) => q.seq[3] + k * d); }
  if (svg.includes('class="mauer')) {
    const v = dv(svg), n = v.map(Number), k = v.indexOf('?');
    if (q.qid.startsWith('z20_mauer1') && Math.max(...q.answers, ...n.filter((x) => x === x)) > 10) fail('Klasse 1 Zahlenmauer over 10 on tier 1: ' + q.qid);
    const rules = svg.includes('data-tri') ? [[3, 0, 1], [4, 1, 2], [5, 0, 2]] : [[3, 0, 1], [4, 1, 2], [5, 3, 4]]; const r = rules.find((x) => x.includes(k));
    return [r[0] === k ? n[r[1]] + n[r[2]] : n[r[0]] - n[r[1] === k ? r[2] : r[1]]];
  }
  if (q.sum) { const v = dv(svg); const k = v.indexOf('?'), row = Math.floor(k / 3); return [q.sum - sum([0, 1, 2].filter((c) => 3 * row + c !== k).map((c) => +v[3 * row + c]))]; }
  if (svg.includes('hand-h')) { const h = +tags(svg, 'hand-h')[0].angle, m = +tags(svg, 'hand-m')[0].angle; return [Math.floor(h / 30) || 12, Math.round(m / 6)]; }
  if (svg.includes('jm-bar')) {
    const qt = plain(svg.match(/<div class="question">([^<]*)</)[1]); const bars = tags(svg, 'jm-bar').map((b) => ({ at: qt.indexOf(b.label === 'Fahrrad' || b.label === 'Bus' || b.label === 'Auto' ? 'dem ' + b.label : b.label), v: +b.value })).filter((b) => b.at >= 0).sort((a, b) => a.at - b.at);
    return [qt.includes(' mehr ') ? bars[0].v - bars[1].v : bars[0].v];
  }
  if (svg.includes('class="tally"')) {
    for (const row of svg.split('<g class="tally"').slice(1)) if (count(row.split('</g>')[0], /class="s"/g) !== +row.match(/data-n="(\d+)"/)[1]) fail('tally strokes ' + q.qid);
    const rows = [...svg.matchAll(/<g class="tally" data-n="(\d+)"><text[^>]*>([^<]+)</g)].map((m) => ({ n: +m[1], label: m[2] }));
    const hit = rows.filter((r) => ask.includes(r.label === 'Fahrrad' || r.label === 'Bus' || r.label === 'Auto' ? 'dem ' + r.label : r.label)); return hit.length === 1 ? [hit[0].n] : null;
  }
  if (svg.includes('class="money"')) { const ct = sum(tags(svg, 'money').map((x) => +x['ct'])); return q.labels.join() === '€,ct' ? [Math.floor(ct / 100), ct % 100] : q.labels[0] === '€' ? [ct / 100] : [ct]; }
  if (svg.includes('class="thing"')) { const r = tags(svg, 'thing')[0]; return [(r.x1 - r.x0) / r.px]; }
  if (svg.includes('class="arrow"')) { const at = +tags(svg, 'arrow')[0].at; const labels = nums(svg.replace(/<[^>]+>/g, ' ')); return labels[0] < at && at < labels[2] ? [at] : null; }
  if (svg.includes('data-day')) {
    const days = [...svg.matchAll(/data-day="(\d+)" data-wd="(\d)"/g)].map((m) => ({ d: +m[1], wd: +m[2] }));
    const m = ask.match(/der (erste|zweite|dritte) (\w+)\?/); const k = ['erste', 'zweite', 'dritte'].indexOf(m[1]); return [days.filter((x) => x.wd === WD.indexOf(m[2]))[k].d];
  }
  if (svg.includes('class="ten"') || svg.includes('class="one"')) return [10 * count(svg, /class="ten"/g) + count(svg, /class="one"/g)];
  if (svg.includes('data-form')) { const want = { Dreiecke: 'dreieck', Kreise: 'kreis', Quadrate: 'quadrat' }[ask.match(/viele (\w+)/)[1]]; return [count(svg, new RegExp(`data-form="${want}"`, 'g'))]; }
  let m;
  if (q.word) { const n = MQ.numWord ? [...Array(101).keys()].filter((k) => k && MQ.numWord(k) === q.text) : []; return n.length === 1 ? n : null; }
  if (/sind es jetzt\?$|bleiben\?$/.test(ask)) { const [a, b] = nums(ask), plus = ask.endsWith('jetzt?'), dots = count(svg, /class="dot"/g), gone = count(svg, /class="gone"/g);
    if (dots !== (plus ? a + b : a) || gone !== (plus ? 0 : b)) fail('story picture does not match ' + ask); return [plus ? a + b : a - b]; }
  if (svg.includes('class="lin"')) { const want = { Strecken: 'Strecke', Strahlen: 'Strahl', Geraden: 'Gerade' }[ask.match(/viele (\w+)/)[1]]; const ks = lineKinds(svg); return ks.includes('?') ? null : [ks.filter((k) => k === want).length]; }
  if ((m = ask.match(/^Wie viele (Ecken|Kanten|Flächen) hat der (Würfel|Quader)\?$/))) return svg.includes('class="mark"') ? null : [EKF[m[1]]];
  if ((m = ask.match(/^Wie viele (Ecken|Kanten|Flächen) haben sie zusammen\?$/)) && (m.n = plain(q.text).match(/^(\d+) Würfel$/))) return [m.n[1] * EKF[m[1]]];
  if ((m = ask.match(/^Wie viele Ecken hat (?:das|der) (Dreieck|Kreis|Quadrat|Rechteck|Viereck)\?$/))) return [ECKEN[m[1]]];
  if (svg.includes('class="dot"')) { const n = count(svg, /class="dot"/g); return ask.includes('fehlen bis 100') ? [100 - n] : [n]; }
  if (story) {
    const n = nums(story);
    if ((m = story.match(/wechselst (\d+ €) in ([\d]+-(?:ct|€))-Münzen/))) return [CHANGE[m[1] + ' ' + m[2]]];
    if (story.includes('zurück')) return [n[1] - n[0]];
    if ((m = story.match(/^Von (\d+) Uhr bis (\d+) Uhr/))) return [m[2] - m[1]];
    if ((m = story.match(/^Von (\d+):(\d+) Uhr bis (\d+):(\d+) Uhr/))) { if (m[1] !== m[3]) fail('time span across the full hour: ' + story); return [60 * m[3] + +m[4] - 60 * m[1] - +m[2]]; }
    if (story.startsWith('Wie viele')) return [FACTS[story.match(/(\w+)\?$/)[1]]];
    if (story.includes('Paare')) return [n[0] * n[1]];
    if (story.includes('Hand')) return [n[0] * (n[0] - 1) / 2];
    if (story.includes('Ziffer')) { const k = new Set(story.split('jede')[0].match(/\d/g)).size; return [k * (k - 1)]; }
    if (q.op === '·') return [n[0] * n[1]];
    if (q.op === ':') return n[0] % n[1] ? null : [n[0] / n[1]];
  }
  if (q.labels && q.labels[0] === 'Zehner') return [Math.floor(+q.text / 10), +q.text % 10];
  if (q.labels && q.labels.join() === '€,ct' && q.text) { const m = plain(q.text).match(/^(\d+),(\d\d) €$/); return m ? [+m[1], +m[2]] : null; }
  if (ask === 'Verdopple die Zahl.') return [2 * +q.text];
  if (ask === 'Halbiere die Zahl.') return +q.text % 2 ? null : [+q.text / 2];
  const e = q.text && expr(q.text); return e === undefined ? undefined : [e];
}
// the right option as the child can work it out
function choose(q) {
  const s = plain(q.q); let m;
  if ((m = s.match(/^(\d+)(?: \+ (\d+))? ___ (\d+)(?: \+ (\d+))?$/))) { const l = +m[1] + +(m[2] || 0), r = +m[3] + +(m[4] || 0); return l < r ? '<' : l > r ? '>' : '='; }
  if ((m = s.match(/^Ist (\d+) gerade oder ungerade\?$/))) return m[1] % 2 ? 'ungerade' : 'gerade';
  if ((m = s.match(/^Welche Zahl ist (gerade|ungerade)\?$/))) { const ok = q.options.filter((o) => (+o % 2 === 0) === (m[1] === 'gerade')); return ok.length === 1 ? ok[0] : null; }
  if ((m = s.match(/^Welche Aufgabe ist die Tauschaufgabe zu (\d+) \+ (\d+)\?$/))) return `${m[2]} + ${m[1]}`;
  if ((m = s.match(/^Welche Aufgabe ist die Umkehraufgabe zu (\d+) \+ (\d+) = (\d+)\?$/))) return +m[1] + +m[2] === +m[3] ? `${m[3]} − ${m[2]}` : null;
  if ((m = s.match(/^Welche Aufgabe ist die Tauschaufgabe zu (\d+) · (\d+)\?$/))) return `${m[2]} · ${m[1]}`;
  if ((m = s.match(/^Welche Aufgabe ist die Umkehraufgabe zu (\d+) · (\d+) = (\d+)\?$/))) return m[1] * m[2] === +m[3] ? one(q.options.map(plain), (o) => [`${m[3]} : ${m[1]}`, `${m[3]} : ${m[2]}`].includes(o)) : null;
  if ((m = s.match(/^Wie schreibt man (\d+) als Wort\?$/))) return MQ.numWord(+m[1]);
  if (s === 'Ist die Figur achsensymmetrisch zur gestrichelten Linie?') { const sq = [...q.pic.matchAll(/<rect [^>]*width="16"[^>]*>/g)].map((x) => attrs(x[0])); const ax = q.pic.match(/<path d="([^"]+)" stroke="#C0392B"/); return folds(sq, line(ax[1])) ? 'ja' : 'nein'; }
  if (s === 'Welche Linie ist die Spiegelachse?') { const sq = tags(q.pic, 'sq').length && [...q.pic.matchAll(/<rect class="sq"[^>]*>/g)].map((x) => attrs(x[0])); const axes = [...q.pic.matchAll(/<path class="axis"[^>]*>/g)].map((x) => attrs(x[0]));
    const ok = axes.filter((a) => folds(sq, line(a.d))); return ok.length === 1 ? `Linie ${ok[0]['data-name']}` : null; }
  if (s === 'Ist das ein rechter Winkel?') return isRight(q.pic) ? 'ja' : 'nein';
  if (s === 'Tippe auf den rechten Winkel.') return one(q.options, isRight);
  if (s === 'Wie liegen die rote und die blaue Linie zueinander?') { const [u, v] = [...q.pic.matchAll(/<line [^>]*>/g)].map((x) => { const a = attrs(x[0]); return [+a.x2 - +a.x1, +a.y2 - +a.y1]; }); const c = Math.abs(cosine(u, v)); return c > 0.999 ? 'parallel' : c < 0.01 ? 'senkrecht' : c < 0.98 && c > 0.05 ? 'weder noch' : null; }
  if (s === 'Wie heißt diese Linie?') { const k = lineKinds(q.pic); return k.length === 1 ? k[0] : null; }
  if ((m = s.match(/^Tippe auf (?:die|den) (Gerade|Strecke|Strahl)\.$/))) return one(q.options, (o) => lineKinds(o).join() === m[1]);
  if (s === 'Was ist rot markiert?') { const k = [...q.pic.matchAll(/<(circle|path|polygon) class="mark"/g)].map((x) => ({ circle: 'Ecke', path: 'Kante', polygon: 'Fläche' }[x[1]])); return k.length === 1 ? k[0] : null; }
  if ((m = s.match(/^Tippe auf das Feld mit (\d+) Punkten\.$/))) return one(q.options, (o) => count(o, /class="dot"/g) === +m[1]);
  if (s === 'Welche Uhrzeit zeigt die Uhr?') { const h = +tags(q.pic, 'hand-h')[0].angle, mm = Math.round(+tags(q.pic, 'hand-m')[0].angle / 6); return `${Math.floor(h / 30) || 12}:${String(mm).padStart(2, '0')} Uhr`; }
  if (q.pic && q.pic.includes('class="tally"')) { const rows = [...q.pic.matchAll(/<g class="tally" data-n="(\d+)"><text[^>]*>([^<]+)</g)].map((x) => ({ n: +x[1], label: x[2] })); const top = Math.max(...rows.map((r) => r.n)); const r = rows.filter((x) => x.n === top); return r.length === 1 ? r[0].label : null; }
  if (s === 'Welche Malaufgabe passt zum Bild?') { const dots = [...q.pic.matchAll(/class="dot" cx="([\d.]+)" cy="([\d.]+)"/g)]; const r = new Set(dots.map((d) => d[2])).size; return `${r} · ${dots.length / r}`; }
  if ((m = s.match(/^Welcher (Tag|Monat) kommt (nach|vor) ([A-Za-zÄÖÜäöüß]+)\?$/))) { const L = m[1] === 'Tag' ? WD : MONTHS; return L[(L.indexOf(m[3]) + (m[2] === 'nach' ? 1 : -1) + L.length) % L.length]; }
  if ((m = s.match(/^Heute ist ([A-Za-zÄÖÜäöüß]+)\. Welcher Tag ist ([A-Za-zÄÖÜäöüß]+)\?$/))) return WD[(WD.indexOf(m[1]) + { morgen: 1, übermorgen: 2, gestern: 6 }[m[2]]) % 7];
  if ((m = s.match(/^Welcher Wochentag ist der (\d+)\. ([A-Za-zÄÖÜäöüß]+)\?$/))) { const x = q.pic.match(new RegExp(`data-day="${m[1]}" data-wd="(\\d)"`)); return WD[+x[1]]; }
  if ((m = s.match(/^Wie schreibt man (\d+) (ct|cm) mit Komma\?$/))) return `${Math.floor(m[1] / 100)},${String(m[1] % 100).padStart(2, '0')} ${m[2] === 'ct' ? '€' : 'm'}`;
  if (s === 'Was ist länger?') { const v = (o) => { const x = o.match(/^(\d+) (m|dm|cm|mm)$/); return x ? x[1] * { m: 1000, dm: 100, cm: 10, mm: 1 }[x[2]] : null; }; const [a, b] = q.options.filter((o) => v(o) !== null); return v(a) === v(b) ? 'Beide gleich lang' : v(a) > v(b) ? a : b; }
  if ((m = s.match(/^Der Zeiger bleibt auf ([A-Za-zÄÖÜäöüß]+) stehen/))) { const c = { Rot: 'rot', Blau: 'blau', Gelb: 'gelb', Grün: 'gruen' }[m[1]]; const sec = tags(q.pic, 'sector').map((x) => x.color); const k = sec.filter((x) => x === c).length; return k === sec.length ? 'sicher' : k ? 'möglich' : 'unmöglich'; }
  if (q.things) { const names = q.things.map((k) => ({ kreis: 'Kreis', dreieck: 'Dreieck', quadrat: 'Quadrat', stern: 'Stern' }[k])); const at = (w) => names.findIndex((n) => s.includes(`dem ${n}`) && s.indexOf(`dem ${n}`) === s.indexOf(w) + w.length);
    if (/links\?$|oben\?$/.test(s)) return names[0]; if (/Mitte\?$/.test(s)) return names[1]; if (/rechts\?$|unten\?$/.test(s)) return names[2];
    if (s.startsWith('Was ist zwischen')) return names.find((n, i) => !s.includes(`dem ${n}`) && i === 1); if (s.includes('links neben')) return names[at('links neben ') - 1]; if (s.includes('rechts neben')) return names[at('rechts neben ') + 1];
    if (s.includes('über')) return names[at('über ') - 1]; if (s.includes('unter')) return names[at('unter ') + 1]; }
  if (q.shown) { const seq = q.shown; for (let p = 1; p <= seq.length / 2; p++) if (seq.every((x, i) => x === seq[i % p])) return q.next === seq[seq.length % p] ? q.options.find((o) => o.includes(`data-k="${q.next}"`)) : null; return null; }
  return undefined;
}

const seen = {};
for (const [mode, max] of Object.entries(UNITS)) {
  const cfg = MK.MODES[mode]; const g1 = cfg.grade === 1;
  if (!cfg) { fail('unit missing: ' + mode); continue; }
  for (const mod of Object.keys(cfg.modules)) for (let t = 1; t <= cfg.modules[mod].maxTier; t++) for (let i = 0; i < 600; i++) {
    const q = MK.generate(mode, mod, t, {}, i); const tag = `${q.qid}`; seen[tag] = (seen[tag] || 0) + 1;
    if (q.mod !== mod || q.tier > t) fail(`${mode}/${mod}: wrong module or tier ${tag}`);
    const words = [q.q, q.ask, q.story, (q.fig || '').match(/class="question">([^<]*)/)?.[1]].filter(Boolean).join(' ');
    for (const part of [q.q, q.ask, q.story].filter(Boolean)) if (part.split(/\s+/).filter((w) => /[a-zäöüß]/i.test(w)).length > 12) fail(`more than 12 words: ${part}`);
    if (/\d,\d/.test(words + (q.text || '') + (q.options || []).join(' ')) && mode !== 'groessen2') fail(`comma number outside money and length: ${tag}`);
    // Klasse 1 crosses ten only in rechnen tier 3
    if (mode === 'zahlen20' && t < 3 && ['zerlegen', 'vergleich'].includes(mod)) { const s = plain(q.text || q.q || ''); let m;
      if (((m = s.match(/(\d+) \+ (\d+)/)) && +m[1] < 10 && +m[2] < 10 && +m[1] + +m[2] > 10) || ((m = s.match(/^(\d+) = (\d+) \+ \?$/)) && +m[2] < 10 && m[1] - m[2] < 10 && +m[1] > 10)) fail('crosses ten: ' + s); }
    // number stories: the result stays in the same ten as the start (no crossing in Klasse 1 outside „Plus und minus“ level 3)
    if (mode === 'zahlen20' && mod === 'geschichte') { const [x] = nums(q.ask || ''); const r = q.answers[0]; const d = Math.abs(r - x); if (x !== undefined && (r > x ? x % 10 + d > 10 : x !== 10 && x % 10 < d)) fail(`number story crosses ten: ${q.ask} = ${r}`); }
    if (g1) for (const n of nums([words, q.text, ...(q.svgOpts ? [] : q.options || [])].join(' '))) if (n > 20) fail(`Klasse 1 number over 20 in ${tag}: ${n}`);
    if (q.kind === 'num') {
      if (!q.answers.every((a) => Number.isInteger(a) && a >= 0)) fail(`answer not a whole number ≥ 0: ${tag} ${q.answers}`);
      if (q.answers.some((a) => a > (OVER_100.includes(q.qid) ? 299 : max))) fail(`answer out of range: ${tag} ${q.answers}`);
      const want = solve(q);
      if (want === undefined) fail(`no independent check for ${tag}`);
      else if (!want || want.join() !== q.answers.join()) fail(`wrong answer ${tag}: ${q.text || q.ask || q.story} gives ${q.answers}, expected ${want}`);
    } else if (q.kind === 'choice') {
      if (q.options.length < 2 || q.options.length > 4) fail(`${tag}: ${q.options.length} options`);
      if (new Set(q.options).size !== q.options.length || q.options.filter((o) => o === q.answer).length !== 1) fail(`${tag}: duplicate options or not exactly one right`);
      if (!q.svgOpts && q.options.some((o) => o.split(/\s+/).length > 4)) fail(`${tag}: option longer than 4 words`);
      const want = choose(q); if (want === undefined) { if (!FIXED.some((p) => q.qid.startsWith(p))) fail(`no independent check for choice ${tag}`); } else if (want !== plain(q.answer)) fail(`wrong choice ${tag}: ${q.q} → ${q.answer}, expected ${want}`);
    } else if (q.kind === 'order') {
      const txt = q.order.map((id) => q.items.find((x) => x.id === id).text); const L = q.mod === 'nachbar' ? null : txt.every((x) => WD.includes(x)) ? WD : MONTHS;
      if (L ? txt.some((x, i) => i && L.indexOf(x) !== L.indexOf(txt[i - 1]) + 1) : txt.some((x, i) => i && +x <= +txt[i - 1])) fail('order wrong ' + tag + ' ' + txt);
    } else fail(`${tag}: unknown kind ${q.kind}`);
  }
}
// every kind of choice task with a computable answer is checked; the others (names of forms, solids, sentences) come from fixed tables
if (Object.keys(seen).length < 160) fail('fewer task kinds than expected: ' + Object.keys(seen).length);
console.log('k12 mathe fails', fails.length, fails.slice(0, 30), Object.keys(seen).length, 'task kinds');
if (fails.length) process.exit(1);
