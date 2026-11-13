// Klasse 1/2 sachkunde: checks beyond the generic ones in test_knowledge.js and test_data.js
const fails = [];
const fail = (m) => fails.push(m);
require('./units.js');
const K = require('../src/knowledge.js'); const S = require('../src/sachkunde.js'); const U = require('../src/k12_sachkunde.js'); const ICONS = require('../src/icons.js');
const UNITS = { koerper1: 1, jahr1: 1, baeume2: 2, tiere2: 2, natur2: 2 };
const words = (s) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
let seq = 0;

for (const [m, grade] of Object.entries(UNITS)) {
  const c = K.MODES[m]; if (!c) { fail('missing unit ' + m); continue; }
  const mods = Object.keys(c.modules);
  if (c.grade !== grade || c.subject !== 'Sachkunde' || c.worlds !== 1) fail(m + ' grade, subject or worlds');
  if (mods.length < 4 || mods.length > 7) fail(m + ' needs 4 to 7 task types');
  if (c.pool.length < 40) fail(m + ' has only ' + c.pool.length + ' questions');
  if (c.events.filter((e) => !e.dilemma && e.opts.some((o) => o.task)).length < 4) fail(m + ' needs 4 events with a task');
  for (const k of mods) if (!c.pool.some((e) => e.mod === k)) fail(m + ' no pool questions for ' + k);
  // short texts for beginning readers: questions up to 12 words, at most 4 options of 1–4 words
  for (const e of c.pool) {
    if (words(e.q) > 12) fail(`${m} question too long: ${e.q}`);
    if (e.o && (e.o.length > 4 || e.o.some((o) => words(o) > 4))) fail(`${m} options too long: ${e.o}`);
  }
  for (const k of mods) for (let t = 1; t <= c.modules[k].maxTier; t++) for (let i = 0; i < 300; i++) {
    const q = K.generate(m, k, t, {}, ++seq);
    if (words(q.q) > 12) fail(`${m} generated question too long: ${q.q}`);
    if (q.kind === 'choice' || q.kind === 'parts') {
      if (q.options.filter((o) => o === q.answer).length !== 1 || new Set(q.options).size !== q.options.length) fail(`${m} not exactly one right answer ${q.qid}`);
      if (q.options.length < 2 || q.options.length > 4) fail(`${m} option count ${q.qid}`);
      if (!q.svgOpts && q.options.some((o) => words(o) > 4)) fail(`${m} option too long ${q.options}`);
      if (q.svgOpts && !q.why) fail(`${m} picture options without why ${q.qid}`);
    }
    if (q.kind === 'parts' || q.kind === 'parts-find') { const P = S.PLANTS[q.plant]; if (!P || !P.parts.some((p) => p.id === q.part && p.name === q.answer) || !P.svg({}).includes(`data-part="${q.part}"`)) fail(`${m} bad picture part ${q.qid}`); }
    if (q.kind === 'order') { if (q.items.length < 4 || q.items.some((x) => words(x.text) > 5)) fail(`${m} order items ${q.qid}`); if (new Set(q.items.map((x) => x.id)).size !== q.items.length) fail(`${m} order ids ${q.qid}`); }
    if (/[0-9],[0-9]/.test(q.q + (q.svgOpts ? '' : (q.options || []).join('|')))) fail(`${m} comma number ${q.q}`);
    if (q.time) { const [h, half] = q.time; const ha = (h % 12) * 30 + (half ? 15 : 0); if (q.answer !== U.timeName(h, half) || !q.pic.includes(`data-angle="${ha}"`)) fail(`clock ${q.qid} ${q.answer}`); }
    if (q.temp !== undefined) {
      if (q.temp % 2 || q.temp < -10 || q.temp > 30) fail('thermometer value ' + q.temp);
      if (q.qid.startsWith('sk2n_th_') && (q.answer !== (q.temp < 0 ? '−' + -q.temp : q.temp) + ' °C' || q.options.some((o) => !/^−?\d+ °C$/.test(o)))) fail('thermometer answer ' + q.answer);
      if (q.qid.startsWith('sk2n_gp_') && (q.temp === 0 || q.answer.startsWith('Ja') !== q.temp < 0)) fail('freezing answer ' + q.temp);
    }
    if (q.qid.startsWith('sk1j_dt_') && q.options.includes('Morgens') && q.options.includes('Abends')) fail('morning and evening offered together');
  }
  // emojis in the unit's own texts need a drawn icon
  const text = JSON.stringify([c.title, c.icon, c.sub, c.modules, c.tut, c.notes, c.events, c.pool]);
  for (const e of new Set(text.match(/\p{Extended_Pictographic}/gu) || [])) if (!ICONS[e.replace(/️/g, '')]) fail(`${m} emoji without drawn icon: ${e}`);
}
if (K.MODES.koerper1.events.filter((e) => e.dilemma).length < 3) fail('koerper1 needs dilemma cards');

// pictures: every part is drawn and can be left out, the drawing school has one step per part group, every part is asked
for (const k of ['koerper12', 'gesicht12', 'baum12', 'bohne12']) {
  const P = S.PLANTS[k]; if (P.steps.length !== Math.max(...Object.values(P.stepOf))) fail(k + ' drawing steps');
  for (const p of P.parts) {
    if (!P.stepOf[p.id] || !p.tip) fail(k + ' part without step or tip ' + p.id);
    if (!P.svg({}).includes(`data-part="${p.id}"`) || P.svg({ omit: p.id }).includes(`data-part="${p.id}"`)) fail(k + ' part drawing ' + p.id);
    if (!Object.values(K.MODES).some((c) => c.pool.some((e) => e.plant === k && e.part === p.id && e.a === p.name))) fail(k + ' part not in pool ' + p.id);
  }
  if (/NaN|undefined/.test(P.svg({ labels: true }))) fail(k + ' broken drawing');
}
for (const [k, c] of [['koerper12', 'koerper1'], ['baum12', 'baeume2']]) if (![].concat(K.MODES[c].school).includes(k)) fail(c + ' school');
// the bird traits fit only their answer
for (let i = 0; i < 500; i++) {
  const q = K.generate('tiere2', 'vogel', 2, {}, ++seq); if (!q.qid.startsWith('sk2t_vm_')) continue; const t = U.BIRD_TRAITS[+q.qid.slice(8)];
  const fits = q.options.filter((o) => t.has.includes(U.BIRDS.find((b) => b.name === o).id)); if (fits.length !== 1 || fits[0] !== q.answer) fail('bird trait not unique ' + q.q);
}
// fruit classes match the notes; clothing answers belong to one weather each
for (const [name, k] of U.OBST) if (!K.MODES.baeume2.notes.obst.lines.some((l) => l.startsWith(U.OBST_ART[k]) && l.includes(name))) fail('obst not in its note: ' + name);
if (new Set(U.WEAR.map((w) => w[1])).size !== U.WEAR.length || U.WEAR.some((w) => !U.WX[w[0]])) fail('clothing per weather');
// order sources: distinct and long enough
for (const [n, src] of Object.entries({ HAENDE: U.HAENDE, ZAEHNE: U.ZAEHNE, NOTRUF: U.NOTRUF, TAG: U.TAG, QUEREN: U.QUEREN, KEIM: U.KEIM, BLUETE: U.BLUETE, SAEN: U.SAEN, NEST: U.NEST, STORCH: U.STORCH })) {
  if (src.length < 4 || new Set(src.map((x) => x.id)).size !== src.length || new Set(src.map((x) => x.text)).size !== src.length) fail('order source ' + n);
}
// Forscherlabor: five experiments, each with one result and a note
for (let i = 0; i < 200; i++) {
  const set = U.laborSet(); if (set.length !== 5) fail('labor set size ' + set.length);
  for (const x of set) if (!Number.isInteger(x.a) || x.a < 0 || x.a >= x.opts.length || !x.note || !K.MODES.natur2.notes[x.topic]) fail('labor experiment ' + x.q);
}
// Plan lesen: the asked place is in the legend, its neighbour is the only place on that side, every symbol is a different place
for (let i = 0; i < 300; i++) {
  const q = K.generate('natur2', 'plan', 1, {}, ++seq); if (!q.pic || !q.qid.startsWith('sk2n_p')) continue;
  const shown = S.PLACES.filter((p) => q.pic.includes(p.icon(0, 0)));
  if (shown.length !== 4 || !q.pic.includes('Legende')) fail('plan: legend ' + q.qid);
  if (q.svgOpts) { const hits = q.options.map((o) => S.PLACES.filter((p) => o.includes(p.icon(0, 0)))); if (hits.some((h) => h.length !== 1) || q.answer !== q.options[q.options.findIndex((o) => o.includes(S.PLACES.find((p) => p.id === q.qid.slice(8)).icon(0, 0)))]) fail('plan symbol ' + q.qid); }
  else {
    const spot = (id) => q.spots.find((x) => x[0] === id); const [from, dc] = q.ask; const [, r, c] = spot(from);
    const there = q.spots.filter(([, rr, cc]) => rr === r && cc === c + dc);
    if (there.length !== 1 || q.answer.toLowerCase() !== S.PLACES.find((p) => p.id === there[0][0]).name.toLowerCase() || q.options.some((o) => !shown.some((p) => p.name.toLowerCase() === o.toLowerCase()))) fail('plan neighbour ' + q.qid);
    if (q.spots.some(([id, rr, cc]) => !q.pic.includes(S.PLACES.find((p) => p.id === id).icon(38 + cc * 66, 42 + rr * 66)))) fail('plan places ' + q.qid);
  }
}
if (!/<svg[^>]*>.+<\/svg>$/.test(U.thermoSVG(-4)) || !U.thermoSVG(-4).includes('−10')) fail('thermometer drawing');

console.log('k12 sachkunde fails', fails.length, fails.slice(0, 20));
if (fails.length) process.exit(1);
