// Klasse 1/2 ethik (and the Musik units of Klasse 1 and 2): checks beyond the generic ones in test_knowledge.js and test_data.js
const fails = [];
const fail = (m) => fails.push(m);
const MK = require('../src/knowledge.js');
const ICONS = require('../src/icons.js');
require('./units.js');
const E = require('../src/k12_ethik.js');

const UNITS = { ichdu1: [1, 'Ethik'], feste2: [2, 'Ethik'], instrumente2: [2, 'Musik'], musik1: [1, 'Musik'] };
const words = (s) => s.split(/\s+/).filter((w) => /[a-zäöüß0-9]/i.test(w)).length;
const icon = (e) => ICONS[e.replace(/️/g, '')];
let seq = 0;
const samples = {};
for (const [m, [grade, subject]] of Object.entries(UNITS)) {
  const c = MK.MODES[m];
  if (!c) { fail(m + ': not registered'); continue; }
  if (c.grade !== grade || c.subject !== subject || c.worlds !== 1) fail(`${m}: grade, subject or worlds wrong`);
  const mods = Object.keys(c.modules);
  if (mods.length < 4 || mods.length > 7) fail(`${m}: ${mods.length} task types`);
  if (c.events.length < 4) fail(`${m}: fewer than 4 events`);
  if (subject === 'Ethik' && c.events.filter((e) => e.dilemma).length < 4) fail(`${m}: fewer than 4 dilemma cards`);
  for (const e of [c.icon].concat(mods.map((k) => c.modules[k].icon))) if (!icon(e)) fail(`${m}: emoji ${e} has no drawn icon`);
  // read aloud in grade 1/2: short questions, at most three short answers
  const qids = new Set(), perNote = {};
  samples[m] = [];
  for (const mod of mods) for (let i = 0; i < 500; i++) {
    const t = MK.generate(m, mod, 1, {}, ++seq);
    samples[m].push(t); qids.add(t.qid); (perNote[t.note] = perNote[t.note] || new Set()).add(t.qid);
    if (words(t.q) > 12) fail(`${m}: question longer than 12 words: ${t.q}`);
    if (t.kind === 'choice') {
      if (t.options.length < 2 || t.options.length > 3) fail(`${m}: ${t.options.length} options in ${t.qid}`);
      if (t.options.filter((o) => o === t.answer).length !== 1) fail(`${m}: answer not exactly once in ${t.qid}`);
      if (!t.svgOpts && t.options.some((o) => words(o) > 7)) fail(`${m}: long option in ${t.qid}`);
    } else if (t.kind === 'order') { if (t.items.length !== 4 || t.items.some((x) => words(x.text) > 8)) fail(`${m}: order items in ${t.qid}`); }
    else fail(`${m}: unexpected task kind ${t.kind}`);
  }
  if (qids.size < 40) fail(`${m}: only ${qids.size} different questions`);
  for (const n of Object.keys(c.notes)) if (!perNote[n] || perNote[n].size < 3) fail(`${m}: note ${n} has fewer than 3 questions`);
  for (const p of c.pool) if (!p.id.startsWith({ ichdu1: 'k1e', feste2: 'k2f', instrumente2: 'k2m', musik1: 'k1m' }[m])) fail(`${m}: question id ${p.id} without unit prefix`);
}

// pictures: each drawing is unique, and a picture task has exactly one fitting answer
const uniq = (name, list) => { if (new Set(list).size !== list.length) fail(name + ': two drawings are the same'); };
uniq('faces', Object.values(E.FACES).map((f) => f.svg)); uniq('symbols', E.SYMS.map((s) => s.svg)); uniq('instruments', E.INSTR.map((i) => i.svg));
const byPic = (list, svg) => list.filter((x) => svg.includes(x.svg));
for (const t of samples.ichdu1.filter((x) => x.mod === 'gefuehl')) {
  if (t.face && E.FACES[t.face].word !== t.answer) fail('face picture and answer differ: ' + t.qid);
  if (t.faces) { const want = t.faces.map((id) => E.FACES[id].svg); if (t.options.some((o) => want.filter((s) => o.includes(s)).length !== 1)) fail('face options unclear: ' + t.qid); if (!t.answer.includes(E.FACES[t.faces[0]].svg) || !t.q.includes(E.FACES[t.faces[0]].word)) fail('face tap answer: ' + t.qid); }
}
for (const t of samples.feste2.filter((x) => x.mod === 'symbol')) {
  if (t.sym) { const s = E.SYMS.find((x) => x.id === t.sym); if (byPic(E.SYMS, t.pic).length !== 1 || t.answer !== s.fest || t.options.some((o) => o !== s.fest && !E.symFits(s, { fest: o }))) fail('symbol picture: ' + t.qid); }
  if (t.syms) { const ss = t.syms.map((id) => E.SYMS.find((x) => x.id === id)); if (t.options.some((o) => byPic(E.SYMS, o).length !== 1) || !t.answer.includes(ss[0].svg) || ss.slice(1).some((x) => !E.symFits(ss[0], x))) fail('symbol tap: ' + t.qid); }
}
for (const t of samples.instrumente2) {
  if (t.instr) {
    const hits = byPic(E.INSTR, t.pic); const i = hits[0];
    if (hits.length !== 1 || i.id !== t.instr) { fail('instrument picture unclear: ' + t.qid); continue; }
    const right = { bild: i.name, familie: E.FAM[i.fam], spielen: i.how }[t.mod];
    if (t.answer !== right) fail(`instrument ${i.id}: answer ${t.answer}, expected ${right}`);
    const also = t.options.filter((o) => o !== right && (o === i.name || o === i.how || o === E.FAM[i.fam] || (i.notHow || []).includes(o) || (i.notFam || []).some((f) => E.FAM[f] === o)));
    if (also.length) fail(`instrument ${i.id}: option ${also} is also right`);
  }
  if (t.instrs) { if (t.options.some((o) => byPic(E.INSTR, o).length !== 1) || byPic(E.INSTR, t.answer)[0].acc !== t.q.slice(10, -1)) fail('instrument tap: ' + t.qid); }
  // Wiederholung und Gegensatz: the beginning comes back exactly once among the options, the form fits the parts
  if (t.mod === 'form') {
    const [a, b, v] = t.parts; const kinds = (c) => [...c].every((x) => E.SHAPES[x]) && c.length === 3;
    if (!kinds(a) || !kinds(b) || a === b || new Set(a).size < 2) fail('form parts: ' + t.qid);
    if (t.form) { if (!E.FORMS.includes(t.form) || t.answer !== [...t.form].join(' – ') || t.options.length !== 3) fail('form name: ' + t.qid); }
    else if (!kinds(v) || new Set([a, b, v]).size !== 3 || [...a].filter((x, j) => x !== v[j]).length !== 1 || t.options.indexOf(t.answer) < 0 || !t.pic.includes('stroke-dasharray')) fail('form repeat: ' + t.qid);
  }
  if (t.sizes) { const k = t.options.indexOf(t.answer); const want = t.q.includes('tiefer') ? 2 : 1; if (t.sizes[k] !== want) fail('hoch/tief: wrong size picked in ' + t.qid); }
}
if (!samples.instrumente2.some((t) => t.form) || !samples.instrumente2.some((t) => t.mod === 'form' && !t.form)) fail('form: both task kinds');
// Miteinander in Klasse 2: Ausgrenzung and anders sein
if (!['Die Mannschaftswahl', 'Das fremde Pausenbrot', 'Der Geheimclub'].every((n) => MK.MODES.feste2.events.some((e) => e.dilemma && e.title === n))) fail('feste2: Miteinander dilemma cards missing');
if (E.INSTR.length < 10) fail('fewer than 10 instruments');
for (const id of ['trommel', 'triangel', 'klanghoelzer', 'rassel', 'schellenkranz', 'glockenspiel']) if (!E.INSTR.some((i) => i.id === id)) fail('Orff instrument missing: ' + id);
for (const i of E.INSTR) { if (!E.FAM[i.fam] || !E.HOWS.includes(i.how)) fail('instrument data: ' + i.id); if (Object.keys(E.FAM).filter((f) => f !== i.fam && !(i.notFam || []).includes(f)).length < 1) fail('no wrong family for ' + i.id); }

// Klasse 1 Musik: unique drawings, every picture task has exactly one fitting answer
{
  const lists = { instr: E.ORFF, opp: E.OPP, mood: E.MOODS, body: E.BODY, sign: E.SIGNS, pat: E.PATS };
  const pics = Object.values(lists).flat().map((x) => x.svg);
  uniq('musik1 pictures', pics);
  for (const a of pics) if (pics.some((b) => b !== a && b.includes(a))) fail('musik1: one drawing contains another');
  const one = (list, svg) => { const h = byPic(list, svg); return h.length === 1 ? h[0] : null; };
  // options: each shows exactly one drawing of the list, in the order of ids; the first id is the answer
  const tap = (t, list, ids) => { const shown = t.options.map((o) => one(list, o)); if (shown.some((x) => !x) || new Set(shown).size !== shown.length || !ids.every((id) => shown.some((x) => x.id === id)) || one(list, t.answer).id !== ids[0]) { fail('musik1 picture options: ' + t.qid); return null; } return shown; };
  for (const t of samples.musik1) {
    if (t.instr) {
      const i = one(E.SPIEL1, t.pic); if (!i || i.id !== t.instr) { fail('musik1 instrument picture: ' + t.qid); continue; }
      if (t.answer !== (t.mod === 'instr' ? i.name : i.how)) fail('musik1 instrument answer: ' + t.qid);
      if (t.mod === 'instr' && t.options.some((o) => !E.ORFF.some((x) => x.name === o))) fail('musik1 non-Orff option: ' + t.qid);
      if (t.mod === 'spielen' && t.options.some((o) => o !== i.how && !E.wrongHow(i, o))) fail(`musik1 ${i.id}: option also right in ${t.qid}`);
    }
    if (t.instrs) { const shown = tap(t, E.SPIEL1, t.instrs); if (shown && t.mod === 'instr' && !t.q.includes(shown.find((x) => x.id === t.instrs[0]).acc)) fail('musik1 instrument tap: ' + t.qid);
      if (shown && t.how && (shown[t.options.indexOf(t.answer)].how !== t.how || shown.some((x) => x.id !== t.instrs[0] && !E.wrongHow(x, t.how)))) fail('musik1 how tap: ' + t.qid); }
    if (t.opp && (one(E.OPP, t.pic) || {}).word !== t.answer) fail('musik1 opposite picture: ' + t.qid);
    if (t.opps) { const shown = tap(t, E.OPP, t.opps); if (shown && (shown[0].dim !== shown[1].dim || E.OPP.find((x) => x.id === t.opps[0]).tap !== t.q)) fail('musik1 opposite tap: ' + t.qid); }
    if (t.mood) { const m = one(E.MOODS, t.pic); if (!m || m.music !== t.answer || t.options.some((o) => o !== m.music && !E.moodFits(m, E.MOODS.find((x) => x.music === o)))) fail('musik1 mood picture: ' + t.qid); }
    if (t.moods) { const shown = tap(t, E.MOODS, t.moods); if (shown && (!shown[0].qs.concat(shown.slice(1).flatMap((x) => x.qs)).includes(t.q) || !E.MOODS.find((x) => x.id === t.moods[0]).qs.includes(t.q) || t.moods.slice(1).some((id) => !E.moodFits(E.MOODS.find((x) => x.id === t.moods[0]), E.MOODS.find((x) => x.id === id))))) fail('musik1 mood tap: ' + t.qid); }
    if (t.body && (one(E.BODY, t.pic) || {}).word !== t.answer) fail('musik1 body picture: ' + t.qid);
    if (t.bodies) { const shown = tap(t, E.BODY, t.bodies); if (shown && !t.q.includes(E.BODY.find((x) => x.id === t.bodies[0]).noun)) fail('musik1 body tap: ' + t.qid); }
    if (t.sign && (one(E.SIGNS, t.pic) || {}).mean !== t.answer) fail('musik1 sign picture: ' + t.qid);
    if (t.signs) tap(t, E.SIGNS, t.signs);
    if (t.pats) { const shown = tap(t, E.PATS, t.pats); const want = t.q.split('? ')[1].toLowerCase().replace('.', '').split(', ').map((w) => (w === 'lang' ? 'L' : 'K')).join('');
      if (shown && (t.pats[0] !== want || new Set(t.pats).size !== 3 || t.pats.some((id) => [...id].sort().join('') !== [...want].sort().join('')))) fail('musik1 pattern: ' + t.qid); }
  }
  const kinds = new Set(samples.musik1.map((t) => t.qid.replace(/_.*/, '')));
  for (const k of ['k1mb', 'k1mt', 'k1ms', 'k1mst', 'k1mgt', 'k1mgb', 'k1mf0', 'k1mf1', 'k1mfb', 'k1mkb', 'k1mkt', 'k1mzt', 'k1mzb', 'k1mzp']) if (!kinds.has(k)) fail('musik1: picture task never generated: ' + k);
  if (MK.MODES.musik1.events.filter((e) => e.dilemma).length !== 1) fail('musik1: needs exactly one dilemma card');
}

// order: festivals by date, every order list long enough and without repeats
if (E.JAHR.some((x, i) => i && E.JAHR[i - 1].m >= x.m)) fail('JAHR is not in calendar order');
for (const o of E.ORDER1.concat(E.WACHSEN, E.FESTORD, [{ items: E.JAHR }])) {
  if (o.items.length < 4) fail('order list shorter than 4: ' + o.items[0].text);
  if (new Set(o.items.map((x) => x.id)).size !== o.items.length || new Set(o.items.map((x) => x.text)).size !== o.items.length) fail('order list repeats: ' + o.items[0].text);
}
for (const t of samples.feste2.filter((x) => x.group === 'jahrord:1')) { const ms = t.order.map((id) => E.JAHR.find((x) => x.id === id).m); if (ms.some((v, i) => i && ms[i - 1] >= v)) fail('jahr order task: ' + t.qid); }

console.log('k12 ethik fails', fails.length, fails);
if (fails.length) process.exit(1);
