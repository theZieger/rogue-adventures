// Sonne, Mond und Sterne (grade 3 Sachkunde): checks beyond the generic ones in test_knowledge.js and test_data.js.
// What a child reads off a picture is recomputed from the drawing's geometry, so a slip in src/himmel.ts does not pass.
import '../src/units.ts';
import * as page from './page.js';
import { JSDOM } from 'jsdom';
import { MK as K } from '../src/knowledge.ts';
import { MH as H } from '../src/himmel.ts';
import { ELTERN } from '../src/eltern.ts';
import { ICONS } from '../src/icons.ts';
import { SAVECODE } from '../src/savecode.ts';
const fails = [];
const fail = (m) => fails.push(m);
const c = K.MODES.himmel;
const mods = Object.keys(c.modules);
let seq = 0;

if (c.grade !== 3 || c.subject !== 'Sachkunde' || c.worlds !== 1) fail('grade, subject or worlds');
if (c.pool.length < 80 || c.pool.length > 120) fail('needs 80 to 120 questions, has ' + c.pool.length);
for (const k of mods) {
  if (c.pool.filter((e) => e.mod === k).length < 12) fail('fewer than 12 questions for ' + k);
  if (!ICONS[c.modules[k].icon]) fail('no drawn icon for ' + k);
}
if (!ICONS[c.icon]) fail('no drawn icon for the unit');
for (const g of new Set(c.pool.map((e) => e.g))) if (!c.notes[g]) fail('no note ' + g);

// every question: its id says the unit, one right answer, distinct options, German quotes, whole numbers, no „spielen“
for (const e of c.pool) {
  const text = [e.q, e.why || ''].concat(e.o || []).join(' | ');
  if (!/^hm[a-z]{2}\d+$/.test(e.id)) fail('id ' + e.id);
  if (e.rf ? typeof e.a !== 'boolean' : !e.o || e.o.length !== 3 || e.a !== 0 || new Set(e.o).size !== 3)
    fail('answer of ' + e.id);
  if (/["']|[0-9],[0-9]|\bSpiel|spielen/.test(text)) fail('wording of ' + e.id);
  if (!/[.?…]$/.test(e.q)) fail('question mark or full stop missing: ' + e.id);
}
const copy = JSON.stringify([
  c.tut,
  c.notes,
  c.events,
  c.starters,
  c.sub,
  ELTERN.INFO.himmel,
  ELTERN.PLAN.himmel,
]).replace(/<svg.*?<\/svg>/g, '');
if (/\bSpiel|spielen|\\"|'|[0-9],[0-9]/.test(copy))
  fail('tutorials, notes, events or parent texts: quotes, commas or „spielen“');
if (/Thüringen|Bremen|Saarland/.test(copy)) fail('a state that is not offered is named');

// facts that must never slip: the Sun does not circle the Earth, seasons are not about distance, eight planets
const all = c.pool.map((e) => ({ e, right: e.rf ? (e.a ? e.q : null) : e.o[e.a] }));
for (const { e, right } of all) {
  if (right && /Sonne kreist um die Erde|näher an der Sonne/.test(right))
    fail('a wrong idea is the right answer: ' + e.id);
}
const season = c.pool.find((e) => e.id === 'hmjr6');
if (!/schief/.test(season.o[season.a])) fail('seasons come from the tilted axis');
if (!c.pool.some((e) => e.rf && e.a === false && /näher an der Sonne/.test(e.q)))
  fail('the distance myth is asked as false');
if (
  H.NAMES.join() !== 'Merkur,Venus,Erde,Mars,Jupiter,Saturn,Uranus,Neptun' ||
  H.REIHE.map((x) => x.text).join() !== H.NAMES.join()
)
  fail('the planets in order from the Sun');
const ms = 'Mein Vater erklärt mir jeden Sonntag unseren Nachthimmel';
if (
  ms
    .split(' ')
    .map((w) => w[0].toUpperCase())
    .join('') !== H.NAMES.map((n) => n[0]).join('')
)
  fail('the planet mnemonic does not match the order');
if (!H.PLANETS.every((p, i) => i === 0 || p[1] > H.PLANETS[i - 1][1])) fail('planets drawn out of order');
if (H.PLANETS[4][2] !== Math.max(...H.PLANETS.map((p) => p[2]))) fail('Jupiter is drawn as the biggest');
if (H.PLANETS[0][2] !== Math.min(...H.PLANETS.map((p) => p[2]))) fail('Merkur is drawn as the smallest');

// generated tasks: one right answer, a tutorial and a Notizkarte for each, a tier never above the asked one
const kinds = {};
for (const k of mods)
  for (let t = 1; t <= c.modules[k].maxTier; t++)
    for (let i = 0; i < 400; i++) {
      const q = K.generate('himmel', k, t, {}, ++seq);
      (kinds[k] ||= new Set()).add(q.kind + (q.pic ? '+pic' : ''));
      if (!c.tut[q.group]) fail('no tutorial ' + q.group);
      if (!c.notes[q.note]) fail('no note ' + q.note + ' for ' + q.qid);
      if (q.tier > t) fail(`tier ${q.tier} task in tier ${t}: ${q.qid}`);
      if (q.kind === 'choice') {
        if (q.options.filter((o) => o === q.answer).length !== 1 || new Set(q.options).size !== q.options.length)
          fail('not exactly one right answer ' + q.qid);
        if (q.options.length < 2 || q.options.length > 4) fail('option count ' + q.qid);
      }
      if (q.kind === 'order' && q.items.length < 4) fail('order too short ' + q.qid);
    }
for (const a of c.starters[0].attacks) if (kinds[a.mod].size < 2) fail(`attack ${a.name}: only ${[...kinds[a.mod]]}`);
for (const k of mods) if (!kinds[k].has('choice+pic') && !kinds[k].has('order')) fail(k + ' has only plain questions');

// day and night: the dot is on the half towards the Sun (on the left) exactly when the answer is Tag
const sample = (mod, prefix, tier = 1, n = 800) => {
  const out = [];
  for (let i = 0; i < n; i++) {
    const q = K.generate('himmel', mod, tier, {}, ++seq);
    if (q.qid.startsWith(prefix)) out.push(q);
  }
  return out;
};
const dotAt = (svg) => {
  const m = svg.match(/<circle cx="([\d.]+)" cy="([\d.]+)" r="7" fill="#E5484D"/);
  return m && [+m[1], +m[2]];
};
const seenDeg = new Set();
for (const q of sample('tag', 'hmtn_')) {
  const deg = +q.qid.slice(5);
  seenDeg.add(deg);
  const [x] = dotAt(q.pic) || [NaN];
  const day = x < H.EARTH.x;
  if (Math.abs(x - H.EARTH.x) < 15) fail('dot too close to the line between day and night: ' + deg);
  if (q.answer !== (day ? 'Tag' : 'Nacht') || q.pic !== H.dayNightSVG(deg)) fail('day and night task ' + q.qid);
}
if (seenDeg.size !== H.DAY.length + H.NIGHT.length) fail('not every dot position is asked');
// seasons: the half with the dot leans towards the Sun exactly when the answer is Sommer
const seenSeason = new Set();
for (const q of sample('jahr', 'hmjz_')) {
  seenSeason.add(q.qid);
  const left = q.qid[5] === 'l',
    north = q.qid.endsWith('nord');
  // the axis leans right; left of the Sun the northern half faces it
  const towards = left === north;
  if (q.answer !== (towards ? 'Sommer' : 'Winter')) fail('season task ' + q.qid);
  if (!q.q.includes(north ? 'Deutschland' : 'Australien')) fail('season task names the wrong place ' + q.qid);
  const dot = q.pic.match(/<circle cx="([\d.]+)" cy="([\d.]+)" r="5.5"/);
  if (!dot || +dot[2] < 82 !== north) fail('season dot on the wrong half ' + q.qid);
}
if (seenSeason.size !== 4) fail('not every season picture is asked');
// the Moon: lit right means waxing, the names follow the picture
const litSide = (svg) => {
  const m = svg.match(/<path d="M60 30 A30 30 0 0 ([01]) 60 90/);
  return m ? (m[1] === '1' ? 'right' : 'left') : svg.includes('r="30" fill="#FFF3B0"') ? 'full' : 'none';
};
for (const p of H.PHASES) {
  const side = litSide(H.moonSVG(p));
  const want = p === 'voll' ? 'full' : p === 'neu' ? 'none' : p[0] === 'z' ? 'right' : 'left';
  if (side !== want) fail('moon phase drawn wrongly ' + p);
}
for (const q of sample('mond', 'hmmz_', 2)) {
  const side = litSide(q.pic);
  if (q.answer !== (side === 'right' ? 'Er nimmt zu' : 'Er nimmt ab') || q.group !== 'mond:2')
    fail('wax task ' + q.qid);
}
const seenPhase = new Set();
for (const q of sample('mond', 'hmmp_')) {
  seenPhase.add(q.qid);
  if (q.answer !== H.PHASE_NAME[q.qid.slice(5)]) fail('phase task ' + q.qid);
}
if (seenPhase.size !== 6) fail('not every phase is asked');
if (H.MONDLAUF.length !== 6 || !/^Neumond/.test(H.MONDLAUF[0].text) || !/^Vollmond/.test(H.MONDLAUF[3].text))
  fail('moon phases in order');
// planets: the arrow points at the planet that is the answer
for (const q of sample('planeten', 'hmpr_')) {
  const i = +q.qid.slice(5);
  const arrow = q.pic.match(
    /<path d="M([\d.]+) [\d.]+ L[\d.]+ [\d.]+ M[\d.]+ [\d.]+ L[\d.]+ [\d.]+ L[\d.]+ [\d.]+" fill="none" stroke="#E5484D"/,
  );
  if (!arrow || +arrow[1] !== H.PLANETS[i][1] || q.answer !== H.NAMES[i]) fail('planet arrow ' + q.qid);
}
// the Pole Star lies on the line from Merak through Dubhe, about five times as far; the decoys do not
{
  const [merak, dubhe] = [H.WAGEN[5], H.WAGEN[6]];
  const d = [dubhe[0] - merak[0], dubhe[1] - merak[1]];
  const len = Math.hypot(...d);
  const off = (p) => Math.abs(d[0] * (p[1] - merak[1]) - d[1] * (p[0] - merak[0])) / len;
  const k = Math.hypot(H.POLAR[0] - dubhe[0], H.POLAR[1] - dubhe[1]) / len;
  if (off(H.POLAR) > 3 || k < 4 || k > 6) fail('the Pole Star is not where the pointers lead');
  for (const p of H.DECOYS) if (off(p) < 25) fail('a decoy lies on the pointer line');
  for (const q of sample('sterne', 'hmps_')) {
    const letter = q.qid[5];
    if (q.answer !== 'Stern ' + letter) fail('pole star task ' + q.qid);
    const at = q.pic.match(new RegExp(`x="([\\d.]+)" y="([\\d.]+)"[^>]*>${letter}<`));
    if (!at || +at[1] - 12 !== H.POLAR[0]) fail('pole star letter misplaced ' + q.qid);
  }
}

// pictures: well-formed
{
  const parser = new new JSDOM('').window.DOMParser();
  const ok = (svg, what) => {
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    if (doc.getElementsByTagName('parsererror').length || /NaN|undefined/.test(svg)) fail('broken picture ' + what);
  };
  for (const d of [...H.DAY, ...H.NIGHT]) ok(H.dayNightSVG(d), 'day ' + d);
  ok(H.dayNightSVG(undefined, true), 'day note');
  for (const l of [true, false]) for (const dot of ['nord', 'sued', undefined]) ok(H.seasonSVG(l, dot), 'season');
  ok(H.seasonSVG(true, undefined, true), 'season note');
  for (const p of H.PHASES) ok(H.moonSVG(p), p);
  for (let i = 0; i < 8; i++) ok(H.planetsSVG(i), 'planet ' + i);
  ok(H.planetsSVG(undefined, true), 'planets note');
  for (const n of ['Erde', 'Mars', 'Jupiter', 'Saturn']) ok(H.lookSVG(n), n);
  for (const f of H.FIGURES) ok(H.figureSVG(f), f);
  ok(H.polarSVG(['A', 'B', 'C']), 'pole star');
  ok(H.polarSVG(), 'pole star note');
  for (const n of Object.values(c.notes)) if (n.fig) ok(n.fig, n.title);
}

// events: five with a task, one dilemma card, one rest
if (c.events.filter((e) => !e.dilemma && e.opts.some((o) => o.task)).length < 5) fail('needs 5 events with a task');
if (c.events.filter((e) => e.dilemma).length < 1) fail('needs a dilemma card');

// save code: the unit, its new task types, hero and opponents have their own words
for (const w of ['himmel', 'tag', 'jahr', 'mond', 'planeten', 'sterne', 'raumfahrt', 'astronomin'].concat(
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
  delete old.stats.himmel;
  p0.close();
  const p1 = page.open({ [META]: JSON.stringify(old) });
  if (p1.$('#later')) p1.click('#later');
  const stats = p1.w.__mq.meta.stats.himmel;
  if (p1.errors.length || !stats || mods.some((k) => !stats[k] || stats[k].t !== 0))
    fail('old save without the unit: ' + p1.errors);
  p1.click('[data-new="himmel"]');
  p1.click('[data-id="astronomin"]');
  p1.click('#go');
  if (!p1.$('.node:not([disabled])') || p1.w.__mq.run.hero.id !== 'astronomin') fail('adventure does not start');
  const kept = p1.dump();
  p1.close();
  const p2 = page.open(kept);
  if (p2.$('#later')) p2.click('#later');
  if (p2.errors.length || !p2.$('[data-cont="himmel"]')) fail('started adventure is not offered after a reload');
  p2.close();
}

console.log('himmel fails', fails.length, fails.slice(0, 20), 'questions', c.pool.length);
if (fails.length) process.exit(1);
