// Am Wasser (grade 3 Sachkunde): checks beyond the generic ones in test_knowledge.js and test_data.js.
// The last block loads the built page: an old save gains the unit, and a started adventure survives a reload.
import '../src/units.ts';
import * as page from './page.js';
import { JSDOM } from 'jsdom';
import { MK as K } from '../src/knowledge.ts';
import { MS as S } from '../src/sachkunde.ts';
import { MG as G } from '../src/gewaesser.ts';
import { ELTERN } from '../src/eltern.ts';
import { ICONS } from '../src/icons.ts';
import { SAVECODE } from '../src/savecode.ts';
const fails = [];
const fail = (m) => fails.push(m);
const c = K.MODES.gewaesser;
const mods = Object.keys(c.modules);
let seq = 0;

if (c.grade !== 3 || c.subject !== 'Sachkunde' || c.worlds !== 1) fail('grade, subject or worlds');
if (c.pool.length < 80 || c.pool.length > 120) fail('needs 80 to 120 questions, has ' + c.pool.length);
for (const k of mods) {
  if (c.pool.filter((e) => e.mod === k).length < 8) fail('fewer than 8 questions for ' + k);
  if (!ICONS[c.modules[k].icon]) fail('no drawn icon for ' + k);
}
if (!ICONS[c.icon]) fail('no drawn icon for the unit');
for (const g of new Set(c.pool.map((e) => e.g))) if (!c.notes[g]) fail('no note ' + g);

// every question: its id says the unit, one right answer, distinct options, a reason where the statement is false,
// German quotes, whole numbers, and learning words instead of „spielen“
for (const e of c.pool) {
  const text = [e.q, e.why || ''].concat(e.o || []).join(' | ');
  if (!/^gw[a-z]{2}\d+$/.test(e.id)) fail('id ' + e.id);
  if (e.rf ? typeof e.a !== 'boolean' : !e.o || e.o.length !== 3 || e.a !== 0 || new Set(e.o).size !== 3)
    fail('answer of ' + e.id);
  if (e.rf && e.a === false && !e.why) fail('false statement without a reason: ' + e.id);
  if (/["']|[0-9],[0-9]|\bSpiel|spielen/.test(text)) fail('wording of ' + e.id);
  if (!/[.?…]$/.test(e.q)) fail('question mark or full stop missing: ' + e.id);
}
const copy = JSON.stringify([
  c.tut,
  c.notes,
  c.events,
  c.starters,
  c.sub,
  ELTERN.INFO.gewaesser,
  ELTERN.PLAN.gewaesser,
]).replace(/<svg.*?<\/svg>/g, '');
if (/\bSpiel|spielen|\\"|'/.test(copy)) fail('tutorials, notes, events or parent texts: quotes or „spielen“');

// generated tasks: one right answer, a tutorial and a Notizkarte for each, pictures only of known parts
const kinds = {};
for (const k of mods)
  for (let t = 1; t <= c.modules[k].maxTier; t++)
    for (let i = 0; i < 400; i++) {
      const q = K.generate('gewaesser', k, t, {}, ++seq);
      (kinds[k] ||= new Set()).add(q.kind + (q.pic ? '+pic' : ''));
      if (!c.tut[q.group]) fail('no tutorial ' + q.group);
      if (!c.notes[q.note]) fail('no note ' + q.note + ' for ' + q.qid);
      if (q.tier > t) fail(`tier ${q.tier} task in tier ${t}: ${q.qid}`);
      if (q.kind === 'choice' || q.kind === 'parts') {
        if (q.options.filter((o) => o === q.answer).length !== 1 || new Set(q.options).size !== q.options.length)
          fail('not exactly one right answer ' + q.qid);
        if (q.options.length < 2 || q.options.length > 4) fail('option count ' + q.qid);
      }
      if (q.kind === 'parts' || q.kind === 'parts-find') {
        const P = S.PLANTS[q.plant];
        if (!P || !P.parts.some((p) => p.id === q.part && p.name === q.answer)) fail('picture part ' + q.qid);
      }
      if (q.kind === 'order' && q.items.length < 3) fail('order too short ' + q.qid);
    }
// the four attacks of the hero each bring more than plain questions
for (const a of c.starters[0].attacks) if (kinds[a.mod].size < 2) fail(`attack ${a.name}: only ${[...kinds[a.mod]]}`);

// a trait fits exactly one of the plants or animals offered
for (const [mod, prefix, list, has] of [
  ['pflanze', 'gwpm_', G.PLANT_TRAITS, (t) => t.has],
  ['tier', 'gwtm_', G.ANIMAL_TRAITS, (t) => [t.a]],
]) {
  const all = mod === 'pflanze' ? G.PLANTS : G.ANIMALS;
  for (let i = 0; i < 600; i++) {
    const q = K.generate('gewaesser', mod, 2, {}, ++seq);
    if (!q.qid.startsWith(prefix)) continue;
    const t = list[+q.qid.slice(prefix.length)];
    const fits = q.options.filter((o) => has(t).includes(all.find((x) => x.name === o).id));
    if (fits.length !== 1 || fits[0] !== q.answer) fail('trait not unique: ' + q.q + ' ' + q.options);
  }
  for (const t of list)
    if (![...has(t), ...(t.skip || [])].every((id) => all.some((x) => x.id === id))) fail('trait ' + t.q);
  for (const x of all) if (!list.some((t) => has(t).includes(x.id))) fail('no trait for ' + x.id);
}
// who lives where: the zone exists, and a zone too close to it is never offered
for (const h of G.HOME) if (!G.ZONES[h.z] || (h.skip || []).includes(h.z)) fail('home ' + h.q);
for (let i = 0; i < 600; i++) {
  const q = K.generate('gewaesser', 'zone', 1, {}, ++seq);
  if (!q.qid.startsWith('gwhome_')) continue;
  const h = G.HOME[+q.qid.slice(7)];
  if (q.answer !== 'In der ' + G.ZONES[h.z].name) fail('home answer ' + q.q);
  if ((h.skip || []).some((z) => q.options.includes('In der ' + G.ZONES[z].name))) fail('home offers ' + q.options);
}
// the frog grows its hind legs first, the newt its front legs
const at = (list, word) => list.findIndex((x) => x.text.includes(word));
const [frog, , newt] = G.DEV.map((d) => d.items);
if (!(at(frog, 'Hinterbeine') < at(frog, 'Vorderbeine'))) fail('frog: hind legs first');
if (!(at(newt, 'Vorderbeine') < at(newt, 'Hinterbeine'))) fail('newt: front legs first');
// a food chain has no animal twice; the stream animals say clean or dirty, and both kinds exist
for (const ch of G.CHAINS)
  if (ch.items.length < 3 || new Set(ch.items.map((x) => x.text)).size !== ch.items.length) fail('chain ' + ch.qid);
if (new Set(G.ZEIGER.map((z) => z.clean)).size !== 2) fail('indicator animals need clean and dirty');
const orderIds = [G.BACH, G.KLAER, ...G.DEV.map((d) => d.items), ...G.CHAINS.map((x) => x.items)]
  .flat()
  .map((x) => x.id);
if (new Set(orderIds).size !== orderIds.length) fail('order ids not distinct');

// pictures: well-formed, all different, and every zone of the pond can be lit and tapped
{
  const parser = new new JSDOM('').window.DOMParser();
  const ok = (svg, what) => {
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    if (doc.getElementsByTagName('parsererror').length || /NaN|undefined/.test(svg)) fail('broken picture ' + what);
    return doc;
  };
  const drawn = [...G.PLANTS, ...G.ANIMALS, ...G.STAGES].map((x) => G.drawSVG(x.id, x.name));
  drawn.forEach((svg, i) => ok(svg, i));
  if (new Set(drawn).size !== drawn.length) fail('two pictures look alike');
  const P = S.PLANTS.teich;
  const doc = ok(P.svg({ clickable: true, labels: true }), 'teich');
  for (const p of P.parts) {
    if (!doc.querySelector(`[data-part="${p.id}"][data-action="taskPart"]`)) fail(`teich: ${p.id} cannot be tapped`);
    if (!P.svg({ highlight: p.id }).includes(`class="part glow"`)) fail(`teich: ${p.id} does not light up`);
    if (![...doc.querySelectorAll('.plabel')].some((t) => t.textContent === p.name)) fail(`teich: no label ${p.name}`);
  }
  if (P.svg({}).includes('plabel')) fail('teich shows its labels in a task');
}

// events: five with a task, two dilemma cards, one rest
if (c.events.filter((e) => !e.dilemma && e.opts.some((o) => o.task)).length < 5) fail('needs 5 events with a task');
if (c.events.filter((e) => e.dilemma).length < 2) fail('needs 2 dilemma cards');

// save code: the unit, its new task types, hero and opponents have their own words
for (const w of ['gewaesser', 'zone', 'tier', 'bach', 'biologin'].concat(
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
  delete old.stats.gewaesser;
  p0.close();
  const p1 = page.open({ [META]: JSON.stringify(old) });
  if (p1.$('#later')) p1.click('#later');
  const stats = p1.w.__mq.meta.stats.gewaesser;
  if (p1.errors.length || !stats || mods.some((k) => !stats[k] || stats[k].t !== 0))
    fail('old save without the unit: ' + p1.errors);
  p1.click('[data-new="gewaesser"]');
  p1.click('[data-id="biologin"]');
  p1.click('#go');
  if (!p1.$('.node:not([disabled])') || p1.w.__mq.run.hero.id !== 'biologin') fail('adventure does not start');
  const kept = p1.dump();
  p1.close();
  const p2 = page.open(kept);
  if (p2.$('#later')) p2.click('#later');
  if (p2.errors.length || !p2.$('[data-cont="gewaesser"]')) fail('started adventure is not offered after a reload');
  p2.close();
}

console.log('gewaesser fails', fails.length, fails.slice(0, 20), 'questions', c.pool.length);
if (fails.length) process.exit(1);
