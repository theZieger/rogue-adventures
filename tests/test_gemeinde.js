// Kinderrechte und Gemeinde (grade 3 Sachkunde): checks beyond the generic ones in test_knowledge.js and test_data.js.
// The last block loads the built page: an old save gains the unit, and a started adventure survives a reload.
import '../src/units.ts';
import * as page from './page.js';
import { JSDOM } from 'jsdom';
import { MK as K } from '../src/knowledge.ts';
import { MG as G } from '../src/gemeinde.ts';
import { ELTERN } from '../src/eltern.ts';
import { ICONS } from '../src/icons.ts';
import { SAVECODE } from '../src/savecode.ts';
import { LAENDER } from '../src/laender.ts';
const fails = [];
const fail = (m) => fails.push(m);
const c = K.MODES.gemeinde;
const mods = Object.keys(c.modules);
let seq = 0;

if (c.grade !== 3 || c.subject !== 'Sachkunde' || c.worlds !== 1) fail('grade, subject or worlds');
if (c.pool.length < 80 || c.pool.length > 120) fail('needs 80 to 120 questions, has ' + c.pool.length);
for (const k of mods) {
  if (c.pool.filter((e) => e.mod === k).length < 8) fail('fewer than 8 questions for ' + k);
  if (!ICONS[c.modules[k].icon.replace('️', '')]) fail('no drawn icon for ' + k);
}
if (!ICONS[c.icon.replace('️', '')]) fail('no drawn icon for the unit');
for (const g of new Set(c.pool.map((e) => e.g))) if (!c.notes[g]) fail('no note ' + g);

// „spielen“ only where the right itself is named, and the Spielplatz
const play = (t) => t.replace(/Freizeit, Spiel und Erholung|Spielplatz|Spielplätze/g, '');
// every question: its id says the unit, one right answer, distinct options, a reason where the statement is false,
// German quotes, whole numbers
for (const e of c.pool) {
  const text = [e.q, e.why || ''].concat(e.o || []).join(' | ');
  if (!/^gm[a-z]{2}\d+$/.test(e.id)) fail('id ' + e.id);
  if (e.rf ? typeof e.a !== 'boolean' : !e.o || e.o.length !== 3 || e.a !== 0 || new Set(e.o).size !== 3)
    fail('answer of ' + e.id);
  if (e.rf && e.a === false && !e.why) fail('false statement without a reason: ' + e.id);
  if (/["']|[0-9],[0-9]|\bSpiel|spielen/.test(play(text))) fail('wording of ' + e.id);
  if (!/[.?…]$/.test(e.q)) fail('question mark or full stop missing: ' + e.id);
}
const copy = JSON.stringify([
  c.tut,
  c.notes,
  c.events,
  c.starters,
  c.sub,
  ELTERN.INFO.gemeinde,
  ELTERN.PLAN.gemeinde,
]).replace(/<svg.*?<\/svg>/g, '');
if (/\bSpiel|spielen|\\"|'/.test(play(copy))) fail('tutorials, notes, events or parent texts: quotes or „spielen“');
// state-neutral: no state's name for the council or the mayor's election, no party, no voting age
if (/Stadtverordnet|Oberbürgermeister|direkt gewählt|Partei|ab 1[68] Jahren|Kinderparlament|Landtag/.test(copy))
  fail('copy names something that differs by state');

// generated tasks: one right answer, a tutorial and a Notizkarte for each
const kinds = {};
for (const k of mods)
  for (let t = 1; t <= c.modules[k].maxTier; t++)
    for (let i = 0; i < 400; i++) {
      const q = K.generate('gemeinde', k, t, {}, ++seq);
      (kinds[k] ||= new Set()).add(q.kind + (q.pic ? '+pic' : ''));
      if (!c.tut[q.group]) fail('no tutorial ' + q.group);
      if (!c.notes[q.note]) fail('no note ' + q.note + ' for ' + q.qid);
      if (q.tier > t) fail(`tier ${q.tier} task in tier ${t}: ${q.qid}`);
      if (q.kind === 'choice') {
        if (q.options.filter((o) => o === q.answer).length !== 1 || new Set(q.options).size !== q.options.length)
          fail('not exactly one right answer ' + q.qid);
        if (q.options.length < 2 || q.options.length > 4) fail('option count ' + q.qid);
        if (!q.qid) fail('task without qid: ' + q.q);
      }
      if (q.kind === 'order' && q.items.length < 3) fail('order too short ' + q.qid);
    }
for (const a of c.starters[0].attacks) if (kinds[a.mod].size < 2) fail(`attack ${a.name}: only ${[...kinds[a.mod]]}`);

// a situation's right exists, and a right that fits it too is never offered
for (const x of G.CASES)
  if (![x.a, ...(x.skip || [])].every((id) => G.RIGHTS.some((r) => r.id === id))) fail('case ' + x.q);
for (let i = 0; i < 800; i++) {
  const q = K.generate('gemeinde', 'rechte', 1, {}, ++seq);
  if (!q.qid.startsWith('gmfall_')) continue;
  const x = G.CASES[+q.qid.slice(7)];
  const name = (id) => G.RIGHTS.find((r) => r.id === id).name;
  if (q.answer !== name(x.a)) fail('case answer ' + x.q);
  if ((x.skip || []).some((id) => q.options.includes(name(id)))) fail('case offers ' + q.options);
}
if (new Set(G.CASES.map((x) => x.a)).size !== G.RIGHTS.length) fail('a right without a situation');
for (const g of G.GROUPS) if (!G.RIGHTS.some((r) => r.group === g)) fail('group without a right ' + g);
for (const n of G.NEEDS) if (!G.PLACES.includes(n.a)) fail('need ' + n.q);
if (G.PLACES.some((p) => !G.NEEDS.some((n) => n.a === p))) fail('a place without a question');
for (const d of G.DECIDE) if (!G.LEVELS[d.l]) fail('decide ' + d.q);
if (G.LEVELS.some((_, l) => G.DECIDE.filter((d) => d.l === l).length < 3)) fail('a level with fewer than 3 examples');

// the tally: the answer is the row with most strokes; the strokes drawn are the votes counted
{
  const parser = new new JSDOM('').window.DOMParser();
  for (let i = 0; i < 600; i++) {
    const q = K.generate('gemeinde', 'abstimmen', 1, {}, ++seq);
    if (!q.qid.startsWith('gmv')) continue;
    const doc = parser.parseFromString(q.pic, 'image/svg+xml');
    if (doc.getElementsByTagName('parsererror').length || /NaN|undefined/.test(q.pic)) fail('broken tally ' + q.qid);
    const labels = [...doc.querySelectorAll('text')].map((t) => t.textContent);
    const strokes = doc.querySelectorAll('path').length - (labels.length - 1) - 1;
    const v = G.VOTES[+q.qid.split('_')[1]];
    if (labels.join() !== v.o.join()) fail('tally labels ' + labels);
    const total = q.why.match(/= (\d+)$/);
    if (total && +q.answer !== strokes) fail(`total ${q.answer}, ${strokes} strokes drawn`);
    if (q.qid.startsWith('gmvwin_') && !q.why.startsWith(q.answer + ' hat ')) fail('winner ' + q.why);
  }
  for (const id of Object.keys(G.SIGNS)) {
    const svg = G.signSVG(id);
    if (!G.RIGHTS.some((r) => r.id === id)) fail('sign for unknown right ' + id);
    if (
      parser.parseFromString(svg, 'image/svg+xml').getElementsByTagName('parsererror').length ||
      /NaN|undefined/.test(svg)
    )
      fail('broken sign ' + id);
  }
  const signIds = Object.values(G.SIGNS).flatMap((m) => [...m.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]));
  if (new Set(signIds).size !== signIds.length) fail('a gradient id is used twice in the signs');
  for (let i = 0; i < 200; i++) {
    const n = G.counts();
    if (new Set(n).size !== 3 || n.some((x) => x < 3 || x > 12)) fail('counts ' + n);
  }
}
// order sources: distinct ids and texts
const orderIds = [G.RAT, G.SPRECHER, G.WAHL, G.WASSER].flat().map((x) => x.id);
if (new Set(orderIds).size !== orderIds.length) fail('order ids not distinct');

// events: five with a task, four dilemma cards (fair decisions, being left out, a lost vote), one rest
if (c.events.filter((e) => !e.dilemma && e.opts.some((o) => o.task)).length < 5) fail('needs 5 events with a task');
if (c.events.filter((e) => e.dilemma).length < 4) fail('needs 4 dilemma cards');

// Bundesland: compared nowhere yet outside Saxony; in Saxony it is grade 4 material, so nothing is hidden
for (const [code, land] of Object.entries(LAENDER)) {
  if (land.fit.gemeinde !== (code === 'SN' ? 'spaeter' : 'offen')) fail('fit in ' + code);
  if (land.hide.includes('gemeinde')) fail('hidden in ' + code);
}

// save code: the unit, its task types, hero and opponents have their own words
for (const w of ['gemeinde', ...mods, 'buergermeisterin'].concat(
  Object.values(c.enemies).flatMap((set) => set.normal.concat(set.elite, set.boss).flatMap((e) => [e.name, e.shape])),
)) {
  const small = SAVECODE.shrink(w);
  if (small[0] !== '~' || SAVECODE.grow(small) !== w) fail('save code word ' + w);
}

// the built page: a save from before the unit loads with empty statistics, and a started adventure comes back
{
  const META = 'mathquest_meta_v2';
  const p0 = page.open();
  const old = JSON.parse(JSON.stringify(p0.w.__mq.meta));
  delete old.stats.gemeinde;
  p0.close();
  const p1 = page.open({ [META]: JSON.stringify(old) });
  if (p1.$('#later')) p1.click('#later');
  const stats = p1.w.__mq.meta.stats.gemeinde;
  if (p1.errors.length || !stats || mods.some((k) => !stats[k] || stats[k].t !== 0))
    fail('old save without the unit: ' + p1.errors);
  p1.click('[data-new="gemeinde"]');
  p1.click('[data-id="buergermeisterin"]');
  p1.click('#go');
  if (!p1.$('.node:not([disabled])') || p1.w.__mq.run.hero.id !== 'buergermeisterin') fail('adventure does not start');
  const kept = p1.dump();
  p1.close();
  const p2 = page.open(kept);
  if (p2.$('#later')) p2.click('#later');
  if (p2.errors.length || !p2.$('[data-cont="gemeinde"]')) fail('started adventure is not offered after a reload');
  p2.close();
}

console.log('gemeinde fails', fails.length, fails.slice(0, 20), 'questions', c.pool.length);
if (fails.length) process.exit(1);
