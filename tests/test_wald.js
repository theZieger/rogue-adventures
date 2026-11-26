// Der Wald (grade 3 Sachkunde): checks beyond the generic ones in test_knowledge.js and test_data.js.
// The last block loads the built page: an old save gains the unit, and a started adventure survives a reload.
import '../src/units.ts';
import * as page from './page.js';
import { JSDOM } from 'jsdom';
import { MK as K } from '../src/knowledge.ts';
import { MS as S } from '../src/sachkunde.ts';
import { MW as W } from '../src/wald.ts';
import { ELTERN } from '../src/eltern.ts';
import { ICONS } from '../src/icons.ts';
import { SAVECODE } from '../src/savecode.ts';
const fails = [];
const fail = (m) => fails.push(m);
const c = K.MODES.wald;
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
  if (!/^wd[a-z]{2}\d+$/.test(e.id)) fail('id ' + e.id);
  if (e.rf ? typeof e.a !== 'boolean' : !e.o || e.o.length !== 3 || e.a !== 0 || new Set(e.o).size !== 3)
    fail('answer of ' + e.id);
  if (e.rf && e.a === false && !e.why) fail('false statement without a reason: ' + e.id);
  if (/["']|[0-9],[0-9]|\bSpiel|spielen/.test(text)) fail('wording of ' + e.id);
  if (!/[.?…]$/.test(e.q)) fail('question mark or full stop missing: ' + e.id);
}
const copy = JSON.stringify([c.tut, c.notes, c.events, c.starters, c.sub, ELTERN.INFO.wald, ELTERN.PLAN.wald]).replace(
  /<svg.*?<\/svg>/g,
  '',
);
if (/\bSpiel|spielen|\\"|'/.test(copy)) fail('tutorials, notes, events or parent texts: quotes or „spielen“');

// generated tasks: one right answer, a tutorial and a Notizkarte for each, pictures only of known parts
const kinds = {};
for (const k of mods)
  for (let t = 1; t <= c.modules[k].maxTier; t++)
    for (let i = 0; i < 400; i++) {
      const q = K.generate('wald', k, t, {}, ++seq);
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

// a tree trait fits exactly one of the trees offered
for (let i = 0; i < 600; i++) {
  const q = K.generate('wald', 'baum', 2, {}, ++seq);
  if (!q.qid.startsWith('wdmerk_')) continue;
  const t = W.TREE_TRAITS[+q.qid.slice(7)];
  const fits = q.options.filter((o) => t.has.includes(W.TREES.find((x) => x.name === o).id));
  if (fits.length !== 1 || fits[0] !== q.answer) fail('tree trait not unique: ' + q.q + ' ' + q.options);
}
for (const t of W.TREE_TRAITS)
  if (t.has.length !== 1 || ![...t.has, ...(t.skip || [])].every((id) => W.TREES.some((x) => x.id === id)))
    fail('tree trait ' + t.q);
for (const t of W.TRACK_TRAITS) if (!W.SPUREN.some((x) => x.id === t.a)) fail('track trait ' + t.q);
if (new Set(W.TRACK_TRAITS.map((t) => t.a)).size !== W.SPUREN.length) fail('a track without a trait');
// who lives where: the layer exists, and a layer too close to it is never offered
for (const h of W.HOME) if (!W.LAYERS[h.l] || (h.skip || []).includes(h.l)) fail('home ' + h.q);
for (let i = 0; i < 600; i++) {
  const q = K.generate('wald', 'stock', 1, {}, ++seq);
  if (!q.qid.startsWith('wdhome_')) continue;
  const h = W.HOME[+q.qid.slice(7)];
  if (q.answer !== 'In der ' + W.LAYERS[h.l].name) fail('home answer ' + q.q);
  if ((h.skip || []).some((l) => q.options.includes('In der ' + W.LAYERS[l].name))) fail('home offers ' + q.options);
}
// a food chain starts with a plant part and has no animal twice
for (const ch of W.CHAINS)
  if (ch.items.length < 3 || new Set(ch.items.map((x) => x.text)).size !== ch.items.length) fail('chain ' + ch.qid);
const orderIds = [W.LAUB, W.HOLZ, W.PFLANZEN, ...W.CHAINS.map((x) => x.items)].flat().map((x) => x.id);
if (new Set(orderIds).size !== orderIds.length) fail('order ids not distinct');

// pictures: well-formed, and every part can be lit and tapped
{
  const parser = new new JSDOM('').window.DOMParser();
  const ok = (svg, what) => {
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    if (doc.getElementsByTagName('parsererror').length || /NaN|undefined/.test(svg)) fail('broken picture ' + what);
    return doc;
  };
  for (const n of W.NADEL) ok(W.twigSVG(n.id), n.id);
  for (const a of W.SPUREN) ok(W.trackSVG(a.id), a.id);
  if (new Set(W.NADEL.map((n) => W.twigSVG(n.id))).size !== 4) fail('twigs look alike');
  if (new Set(W.SPUREN.map((a) => W.trackSVG(a.id))).size !== 5) fail('tracks look alike');
  for (const key of ['wald', 'waldpilz']) {
    const P = S.PLANTS[key];
    const doc = ok(P.svg({ clickable: true, labels: true }), key);
    for (const p of P.parts) {
      if (!doc.querySelector(`[data-part="${p.id}"][data-action="taskPart"]`)) fail(`${key}: ${p.id} cannot be tapped`);
      if (!P.svg({ highlight: p.id }).includes(`class="part glow"`)) fail(`${key}: ${p.id} does not light up`);
      if (![...doc.querySelectorAll('.plabel')].some((t) => t.textContent === p.name))
        fail(`${key}: no label ${p.name}`);
    }
    if (P.svg({}).includes('plabel')) fail(key + ' shows its labels in a task');
  }
}

// events: five with a task, two dilemma cards, one rest
if (c.events.filter((e) => !e.dilemma && e.opts.some((o) => o.task)).length < 5) fail('needs 5 events with a task');
if (c.events.filter((e) => e.dilemma).length < 2) fail('needs 2 dilemma cards');

// save code: the unit, its new task types, hero and opponents have their own words
for (const w of ['wald', 'spur', 'pilz', 'foersterin'].concat(
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
  delete old.stats.wald;
  p0.close();
  const p1 = page.open({ [META]: JSON.stringify(old) });
  if (p1.$('#later')) p1.click('#later');
  const stats = p1.w.__mq.meta.stats.wald;
  if (p1.errors.length || !stats || mods.some((k) => !stats[k] || stats[k].t !== 0))
    fail('old save without the unit: ' + p1.errors);
  p1.click('[data-new="wald"]');
  p1.click('[data-id="foersterin"]');
  p1.click('#go');
  if (!p1.$('.node:not([disabled])') || p1.w.__mq.run.hero.id !== 'foersterin') fail('adventure does not start');
  const kept = p1.dump();
  p1.close();
  const p2 = page.open(kept);
  if (p2.$('#later')) p2.click('#later');
  if (p2.errors.length || !p2.$('[data-cont="wald"]')) fail('started adventure is not offered after a reload');
  p2.close();
}

console.log('wald fails', fails.length, fails.slice(0, 20), 'questions', c.pool.length);
if (fails.length) process.exit(1);
