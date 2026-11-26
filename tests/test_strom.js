// Strom und Magnete: checks beyond the generic ones in test_knowledge.js and test_data.js. The facts a child
// learns here are recomputed from the drawing or listed once more, so a slip in src/strom.ts does not pass.
import '../src/units.ts';
import * as page from './page.js';
import { ICONS } from '../src/icons.ts';
import { MK as K } from '../src/knowledge.ts';
import { MST as T } from '../src/strom.ts';
import { SAVECODE } from '../src/savecode.ts';

const fails = [];
const fail = (m) => fails.push(m);
const cfg = K.MODES.strom;
const mods = Object.keys(cfg.modules);
let seq = 0;

// the unit as a whole
if (cfg.grade !== 3 || cfg.subject !== 'Sachkunde' || cfg.worlds !== 1) fail('grade, subject or worlds');
if (cfg.pool.length < 80 || cfg.pool.length > 120) fail('needs 80 to 120 questions, has ' + cfg.pool.length);
for (const k of mods) if (cfg.pool.filter((e) => e.mod === k).length < 12) fail('fewer than 12 questions for ' + k);
for (const g of new Set(cfg.pool.map((e) => e.g))) if (!cfg.notes[g]) fail('no note ' + g);
if (cfg.events.filter((e) => e.opts.some((o) => o.task)).length < 4) fail('needs 4 events with a task');
if (cfg.pool.filter((e) => e.why).length < cfg.pool.length / 2) fail('at least half the questions explain themselves');
for (const k of mods)
  if (!ICONS[cfg.modules[k].icon.replace(/️/g, '')]) fail('no drawn icon for ' + cfg.modules[k].icon);
if (!ICONS[cfg.icon]) fail('no drawn icon for the unit');

// every text a child reads: whole numbers, German quotes, learning words
const texts = [
  ...cfg.pool.flatMap((e) => [e.q, e.why || '', ...(e.o || [])]),
  ...Object.values(cfg.notes).flatMap((n) => [n.title, ...n.lines]),
  ...Object.values(cfg.tut).flatMap((t) => [t.title, ...t.steps]),
  ...cfg.events.flatMap((e) => [e.title, e.text, ...e.opts.map((o) => o.label)]),
  ...T.THINGS.concat(T.PULL).flatMap((x) => [x.label, x.ein || '', x.acc, x.nom, x.why]),
  ...T.WEG.concat(T.EXPERIMENTS.flat()).map((x) => x.text),
  cfg.sub,
  ...cfg.starters.map((s) => s.desc),
];
for (const t of texts) {
  if (/[0-9],[0-9]/.test(t)) fail('comma number: ' + t);
  if (/["']/.test(t)) fail('use German quotes: ' + t);
  if (/(?<!Bei)spiel/i.test(t)) fail('learning, not playing: ' + t);
}

// a circuit lights exactly when nothing interrupts it; the drawing is checked against the same rule
const LIT = 'Es leuchtet',
  DARK = 'Es leuchtet nicht';
const lights = (c) => c.sw !== 'offen' && !c.wire && (!c.gap || (c.gap !== 'leer' && c.gap.l === true));
const lamps = (svg) => (svg.match(/#FFE45C/g) || []).length;
for (const x of T.CIRCUITS) {
  if (x.lit !== lights(x.c)) fail('circuit ' + x.key + ' lights wrongly');
  if (!x.lit !== !!x.fault) fail('circuit ' + x.key + ': a fault exactly when the lamp is dark');
  const svg = T.circuitSVG(x.c);
  if (svg.includes('Schalter') !== !!x.c.sw) fail('circuit ' + x.key + ': switch drawn wrongly');
  if (x.c.gap && x.c.gap !== 'leer' && !svg.includes('>' + x.c.gap.label + '<')) fail('circuit ' + x.key + ': no tag');
  if (lamps(svg)) fail('circuit ' + x.key + ': the task picture gives the answer away');
  if (!lamps(T.circuitSVG(x.c, true))) fail('circuit ' + x.key + ': the lit lamp is not drawn');
  // the cable of a missing or misplaced connection never reaches the plus pole
  if (svg.includes('L198 136') !== !x.c.wire) fail('circuit ' + x.key + ': cable to the plus pole');
}
if (T.CIRCUITS.filter((x) => x.lit).length < 4 || T.CIRCUITS.filter((x) => !x.lit).length < 6)
  fail('too few circuits of one kind');
const seen = { 1: new Set(), 2: new Set() };
for (let i = 0; i < 600; i++) {
  const q = K.generate('strom', 'kreis', 1, {}, ++seq);
  if (!q.qid.startsWith('skr_')) continue;
  const x = T.CIRCUITS.find((v) => v.key === q.qid.slice(4));
  seen[1].add(x.key);
  if (q.answer !== (x.lit ? LIT : DARK) || q.options.join() !== [LIT, DARK].join() || q.pic !== T.circuitSVG(x.c))
    fail('circuit task ' + q.qid);
  if (!q.why) fail('circuit task without explanation ' + q.qid);
}
for (let i = 0; i < 600; i++) {
  const q = K.generate('strom', 'kreis', 2, {}, ++seq);
  if (!q.qid.startsWith('skf_')) continue;
  const x = T.CIRCUITS.find((v) => v.key === q.qid.slice(4));
  seen[2].add(x.key);
  if (x.lit || q.answer !== x.fault || q.options.length !== 3 || q.group !== 'kreis:2') fail('fault task ' + q.qid);
  // a gap and a missing cable look alike, and so do a gap and a thing in it: never the answer next to its look-alike
  const GAP = 'Das Kabel hat eine Lücke';
  for (const [a, b] of [
    [GAP, 'Ein Kabel fehlt'],
    [GAP, 'In der Lücke steckt ein Nichtleiter'],
  ])
    if ([a, b].includes(q.answer) && q.options.includes(a) && q.options.includes(b))
      fail('fault task offers two answers that fit: ' + q.options);
}
if (seen[1].size !== T.CIRCUITS.length) fail('not every circuit is asked at tier 1');
if (seen[2].size !== T.CIRCUITS.filter((x) => !x.lit).length) fail('not every fault is asked at tier 2');

// conductors: the metals, and nothing else
const METAL = ['klammer', 'nagel', 'muenze', 'schluessel', 'alufolie', 'kupfer', 'loeffel'];
if (
  T.THINGS.filter((x) => x.l)
    .map((x) => x.id)
    .sort()
    .join() !== METAL.slice().sort().join()
)
  fail('conductors are exactly the metal things');
if (T.THINGS.filter((x) => !x.l).length < 5) fail('too few non-conductors');
// a magnet attracts iron and steel only: copper, aluminium, gold and the 10 cent coin are metal and stay
const IRON = ['nagel', 'klammer', 'stecknadel', 'schraube', 'cent5'];
if (
  T.PULL.filter((x) => x.z)
    .map((x) => x.id)
    .sort()
    .join() !== IRON.slice().sort().join()
)
  fail('attracted are exactly the things of iron or steel');
for (const id of ['cent10', 'alufolie', 'kupfer', 'goldring'])
  if (!T.PULL.some((x) => x.id === id && x.z === false)) fail('a metal that is not attracted is missing: ' + id);
for (const list of [T.THINGS, T.PULL]) {
  if (new Set(list.map((x) => x.id)).size !== list.length) fail('duplicate thing id');
  for (const x of list) if (x.label.length > 13) fail('label too long for its tag: ' + x.label);
}
if (!cfg.pool.some((e) => e.rf && e.a === false && /alle Metalle/.test(e.q) && e.mod === 'magnet'))
  fail('the pool must say that a magnet does not attract all metals');
for (let i = 0; i < 400; i++) {
  const q = K.generate('strom', 'leiter', 1, {}, ++seq);
  if (q.qid.startsWith('slt_')) {
    const x = T.THINGS.find((v) => v.id === q.qid.slice(4));
    if (q.answer !== (x.l ? 'Leiter' : 'Nichtleiter') || !q.q.startsWith(x.ein)) fail('conductor task ' + q.qid);
  }
  const m = K.generate('strom', 'magnet', 1, {}, ++seq);
  if (m.qid.startsWith('smg_')) {
    const x = T.PULL.find((v) => v.id === m.qid.slice(4));
    if (m.answer !== (x.z ? 'Bleibt am Magneten hängen' : 'Bleibt liegen') || !m.q.includes(x.acc))
      fail('magnet task ' + m.qid);
  }
}

// poles: the picture shows the two poles that face each other, and only different poles attract
const facing = (svg) => {
  const l = [...svg.matchAll(/>([NS])<\/text>/g)].map((m) => m[1]);
  return l.length === 4 && l[0] !== l[1] && l[2] !== l[3] ? l[1] + l[2] : '';
};
const pairs = new Set();
for (let i = 0; i < 300; i++) {
  const q = K.generate('strom', 'pole', 1, {}, ++seq);
  if (!q.qid.startsWith('spo_')) continue;
  const ab = q.qid.slice(4);
  pairs.add(ab);
  if (facing(q.pic) !== ab) fail('pole picture does not show ' + ab);
  if (q.answer !== (ab[0] === ab[1] ? 'Sie stoßen sich ab' : 'Sie ziehen sich an')) fail('pole task ' + ab);
  if (!q.why.includes(ab[0] === ab[1] ? 'stoßen sich ab' : 'ziehen sich an')) fail('pole rule ' + ab);
}
if (pairs.size !== 4) fail('pole tasks: all four pairs');
if (!T.magnetsSVG('N', 'N', true).includes('M142 45') || T.magnetsSVG('N', 'S', true).includes('M142 45'))
  fail('only magnets that repel are drawn apart with arrows');

// things in order: the way of the current, and experiments from question to result
if (T.WEG.length < 5 || !/Kraftwerk/.test(T.WEG[0].text) || !/Steckdose/.test(T.WEG.at(-1).text))
  fail('the way of the current runs from the power station to the socket');
for (const x of T.EXPERIMENTS)
  if (x.length !== 5 || !/\?$/.test(x[0].text) || !/^Ich glaube/.test(x[1].text))
    fail('experiment needs question, guess and three more steps: ' + x[0].text);
const orders = {};
for (const mod of ['leiter', 'magnet', 'energie'])
  for (let i = 0; i < 400; i++) {
    const q = K.generate('strom', mod, 1, {}, ++seq);
    if (q.kind !== 'order') continue;
    orders[mod] = (orders[mod] || 0) + 1;
    const src = q.qid.startsWith('swo_') ? T.WEG : T.EXPERIMENTS[+q.qid[3]];
    const ids = src.map((x) => x.id).filter((id) => q.order.includes(id));
    if (q.order.join() !== ids.join() || q.items.length < 4) fail('order task ' + q.qid);
    if ((mod === 'leiter') !== ['sxo0_', 'sxo1_'].some((p) => q.qid.startsWith(p)) && mod !== 'energie')
      fail('experiment in the wrong task type ' + q.qid);
  }
for (const mod of ['leiter', 'magnet', 'energie']) if (!orders[mod]) fail(mod + ' asks no order task');

// Forscherlabor: five experiments, the result follows from the thing or the poles, and the second picture shows it
for (let i = 0; i < 300; i++) {
  const set = cfg.labor();
  if (
    set
      .map((x) => x.kind)
      .sort()
      .join() !== 'leit,leit,pole,zieh,zieh'
  )
    fail('labor mix');
  for (const x of set) {
    if (!Number.isInteger(x.a) || !x.opts[x.a] || !x.note || !x.q || !x.pic || !x.after)
      fail('labor experiment ' + x.q);
    if (!cfg.notes[x.topic]) fail('labor topic without note ' + x.topic);
    if (x.kind === 'leit') {
      const t = T.THINGS.find((v) => x.q.includes(v.acc + ' in'));
      if (!t || (x.a === 0) !== t.l || !!lamps(x.after) !== t.l || lamps(x.pic)) fail('labor circuit ' + x.q);
    }
    if (x.kind === 'zieh') {
      const t = T.PULL.find((v) => x.q.includes(v.acc + '.'));
      if (!t || (x.a === 0) !== t.z || x.after.includes('y="73"') !== t.z) fail('labor magnet ' + x.q);
    }
    if (x.kind === 'pole' && ((x.a === 0) !== (x.poles[0] !== x.poles[1]) || facing(x.pic) !== x.poles))
      fail('labor poles ' + x.poles);
  }
}

// safety: what the unit calls right is never an experiment at the socket, and the rules are all asked
const right = cfg.pool.filter((e) => e.mod === 'sicher').map((e) => (e.rf ? (e.a ? e.q : e.why) : e.o[e.a]));
for (const rule of [
  /Steckdose/,
  /nass|Hände/,
  /Badewanne|Wanne/,
  /Drachen/,
  /Erwachsenen/,
  /112/,
  /Batterien/,
  /Kurzschluss/,
])
  if (
    !cfg.pool.some((e) => e.mod === 'sicher' && rule.test(e.q + (e.why || '') + (e.o || []).join())) ||
    !cfg.notes.gefahr.lines.concat(cfg.notes.batterie.lines).some((l) => rule.test(l))
  )
    fail('safety rule missing in questions or notes: ' + rule);
for (const a of right) if (/^(Mit der Steckdose|Ja)\b/.test(a)) fail('unsafe right answer: ' + a);
const battery = cfg.pool.find((e) => /Versuche zum Stromkreis/.test(e.q));
if (!battery || !/^Nur mit Batterien/.test(battery.o[battery.a])) fail('experiments only with batteries');

// saves: the new words keep their place at the end of the save code list, and an old save gains the unit
{
  const save = { stats: { strom: { kreis: { c: 3, t: 4 }, magnet: { c: 1, t: 1 } } }, dex: { 'Der Kurzschluss': 2 } };
  if (JSON.stringify(SAVECODE.grow(SAVECODE.shrink(save))) !== JSON.stringify(save)) fail('save code round trip');
  if (JSON.stringify(SAVECODE.shrink(save)).includes('strom')) fail('save code does not know the unit');
  const p0 = page.open();
  const old = JSON.parse(JSON.stringify(p0.w.__mq.meta));
  p0.close();
  delete old.stats.strom;
  const p1 = page.open({ mathquest_meta_v2: JSON.stringify(old) });
  if (p1.$('#later')) p1.click('#later');
  const stats = p1.w.__mq.meta.stats.strom;
  if (p1.errors.length || !stats || mods.some((k) => !stats[k] || stats[k].t !== 0))
    fail('an old save without the unit loads with empty stats');
  // the Forscherlabor is reopened with the same experiment
  p1.click('[data-new="strom"]');
  const yes = p1.$('.overlay #yes');
  if (yes) yes.click();
  p1.click('.choice');
  p1.click('#go');
  p1.w.__mq.run.map[0][0].t = 'labor';
  p1.w.__mq.screenMap();
  p1.click('.node.open');
  const ok = p1.$('.overlay #tutok');
  if (ok) ok.click();
  p1.click('.opt.guess');
  p1.click('#next');
  const second = p1.$('.labor h3').textContent;
  const p2 = page.open(p1.dump());
  p1.close();
  p2.click('[data-cont="strom"]');
  if (p2.errors.length || !p2.text().includes('Versuch 2 von 5') || p2.$('.labor h3').textContent !== second)
    fail('reopening the Forscherlabor continues with the same experiment');
  p2.close();
}

console.log('strom fails', fails.length, 'questions', cfg.pool.length);
if (fails.length) {
  console.log(fails.join('\n'));
  process.exit(1);
}
