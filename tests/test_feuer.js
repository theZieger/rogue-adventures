// Feuer und Feuerwehr: checks beyond the generic ones in test_knowledge.js and test_data.js. The safety rules a child
// learns here are listed once more, so a slip in src/feuer.ts that would teach something dangerous does not pass.
import '../src/units.ts';
import * as page from './page.js';
import { ICONS } from '../src/icons.ts';
import { MK as K } from '../src/knowledge.ts';
import { MFE as T } from '../src/feuer.ts';
import { SAVECODE } from '../src/savecode.ts';

const fails = [];
const fail = (m) => fails.push(m);
const cfg = K.MODES.feuer;
const mods = Object.keys(cfg.modules);
let seq = 0;

// the unit as a whole
if (cfg.grade !== 3 || cfg.subject !== 'Sachkunde' || cfg.worlds !== 1) fail('grade, subject or worlds');
if (cfg.pool.length < 80 || cfg.pool.length > 120) fail('needs 80 to 120 questions, has ' + cfg.pool.length);
for (const k of mods) if (cfg.pool.filter((e) => e.mod === k).length < 12) fail('fewer than 12 questions for ' + k);
for (const g of new Set(cfg.pool.map((e) => e.g))) if (!cfg.notes[g]) fail('no note ' + g);
if (new Set(cfg.pool.map((e) => e.id)).size !== cfg.pool.length) fail('duplicate question id');
if (cfg.events.filter((e) => e.opts.some((o) => o.task)).length < 4) fail('needs 4 events with a task');
if (cfg.pool.filter((e) => e.why).length < cfg.pool.length / 2) fail('at least half the questions explain themselves');
for (const k of mods)
  if (!ICONS[cfg.modules[k].icon.replace(/️/g, '')]) fail('no drawn icon for ' + cfg.modules[k].icon);
if (!ICONS[cfg.icon]) fail('no drawn icon for the unit');
for (const e of cfg.pool) if (!e.rf && e.a !== 0) fail('the right answer comes first in the source: ' + e.id);

// every text a child reads: whole numbers, German quotes, learning words
const texts = [
  ...cfg.pool.flatMap((e) => [e.q, e.why || '', ...(e.o || [])]),
  ...Object.values(cfg.notes).flatMap((n) => [n.title, ...n.lines]),
  ...Object.values(cfg.tut).flatMap((t) => [t.title, ...t.steps]),
  ...cfg.events.flatMap((e) => [e.title, e.text, ...e.opts.map((o) => o.label)]),
  ...T.THINGS.flatMap((x) => [x.label, x.ein, x.acc, x.nom, x.why]),
  ...T.LOESCH.flatMap((x) => [x.text, x.why]),
  ...T.DOS,
  ...T.DONTS,
  ...T.WS.flatMap((w) => [w.q, ...w.says]),
  ...T.AUFGABEN.flatMap((a) => [a.name, a.why, ...a.says]),
  ...[T.KERZE, T.ALARM, T.NOTRUF, T.EINSATZ, T.FRUEHER, ...T.EXPERIMENTS].flat().map((x) => x.text),
  cfg.sub,
  ...cfg.starters.map((s) => s.desc),
];
for (const t of texts) {
  if (/[0-9],[0-9]/.test(t)) fail('comma number: ' + t);
  if (/["']/.test(t)) fail('use German quotes: ' + t);
  if (/(?<!Bei)spiel(?!zeug|platz)/i.test(t)) fail('learning, not playing: ' + t);
}

// the fire triangle: the picture leaves out exactly the side that is asked, and every way to put out a fire names one
const SIDE_NAMES = T.SIDES.map((x) => x.name);
const sides = new Set();
for (let i = 0; i < 300; i++) {
  const q = K.generate('feuer', 'dreieck', 1, {}, ++seq);
  if (!q.qid.startsWith('fdr_')) continue;
  const x = T.SIDES.find((v) => v.id === q.qid.slice(4));
  sides.add(x.id);
  if (q.answer !== x.name || q.options.slice().sort().join() !== SIDE_NAMES.slice().sort().join())
    fail('triangle ' + q.qid);
  if (q.pic.includes('>' + x.name + '<') || !q.pic.includes('>?<') || q.pic.includes('#FF8A3D'))
    fail('the triangle picture shows the missing side or a fire: ' + q.qid);
}
if (sides.size !== 3) fail('not every side is asked');
if (!T.triangleSVG().includes('#FF8A3D') || SIDE_NAMES.some((n) => !T.triangleSVG().includes('>' + n + '<')))
  fail('the full triangle shows its three sides and a fire');
const kinds = {};
for (const x of T.LOESCH) kinds[x.side] = (kinds[x.side] || 0) + 1;
if (Object.keys(kinds).length !== 3 || Object.values(kinds).some((n) => n < 2)) fail('ways to put out a fire per side');
for (const x of T.LOESCH)
  if (x.side === 'luft' && !/Deckel|Decke|Glas|Kerzenlöscher|Sand/i.test(x.text)) fail('cover ' + x.id);
for (let i = 0; i < 400; i++) {
  const q = K.generate('feuer', 'dreieck', 2, {}, ++seq);
  if (!q.qid.startsWith('flo_')) continue;
  const x = T.LOESCH.find((v) => v.id === q.qid.slice(4));
  if (q.answer !== T.SIDES.find((v) => v.id === x.side).name || q.group !== 'dreieck:2' || !q.why)
    fail('loesch ' + q.qid);
}

// the candle: the arrow points at the part that is asked, and the picture names nothing
const parts = new Set();
for (let i = 0; i < 400; i++) {
  const q = K.generate('feuer', 'kerze', 1, {}, ++seq);
  if (!q.qid.startsWith('fkz_')) continue;
  const id = q.qid.slice(4);
  parts.add(id);
  const p = T.PARTS.find((v) => v.id === id);
  if (
    q.answer !== p.name ||
    !q.pic.includes(`data-arrow="${id}"`) ||
    T.PARTS.some((v) => q.pic.includes('>' + v.name + '<'))
  )
    fail('candle task ' + q.qid);
}
if (parts.size !== T.PARTS.length) fail('not every part of the candle is asked');
if (T.PARTS.some((v) => !T.candleSVG(undefined, true).includes('>' + v.name + '<'))) fail('the note names every part');
if (!cfg.pool.some((e) => /heißesten/.test(e.q) && /Flammensaum/.test(e.o[e.a])))
  fail('hottest part is the outer edge');

// what burns: paper, wood and their kin burn; stone, sand, glass, metal, clay and brick do not
const BURN = ['papier', 'holz', 'pappe', 'baumwolle', 'kork', 'stroh', 'laub', 'tuete'];
if (
  T.THINGS.filter((x) => x.b)
    .map((x) => x.id)
    .sort()
    .join() !== BURN.slice().sort().join()
)
  fail('burnable are exactly the listed things');
for (const x of T.THINGS) {
  if (x.label.length > 13) fail('label too long for its tag: ' + x.label);
  // an adult holds only small, harmless things into a candle flame: no plastic, nothing that flares up
  if (x.lab && ['tuete', 'stroh', 'laub'].includes(x.id)) fail('not for the Forscherlabor: ' + x.id);
}
if (new Set(T.THINGS.map((x) => x.id)).size !== T.THINGS.length) fail('duplicate thing id');
for (let i = 0; i < 300; i++) {
  const q = K.generate('feuer', 'brennbar', 1, {}, ++seq);
  if (!q.qid.startsWith('fbr_')) continue;
  const x = T.THINGS.find((v) => v.id === q.qid.slice(4));
  if (q.answer !== (x.b ? 'Es brennt' : 'Es brennt nicht') || !q.q.startsWith(x.ein)) fail('burn task ' + q.qid);
}

// safety: the rules of the fire services, and none of the wrong ones ever called right
const RULES = [
  [/versteck/i, 'never hide'],
  [/Tür.*schließ|Tür zu/, 'close the door'],
  [/kriech/, 'crawl under smoke'],
  [/Aufzug/, 'never the lift'],
  [/Sammelplatz/, 'assembly point'],
  [/112/, 'call 112'],
  [/Rauchmelder/, 'smoke detector'],
  [/zurück/i, 'never go back'],
  [/Erwachsen/, 'tell an adult'],
  [/Feuerzeug|Streichh/, 'matches and lighters'],
];
const safetyText = cfg.pool
  .filter((e) => ['brandfall', 'notruf', 'brennbar', 'kerze'].includes(e.mod))
  .map((e) => e.q + (e.why || '') + (e.o || []).join())
  .concat(T.DOS, T.DONTS)
  .join(' ');
const noteText = ['brandfall', 'rauch', 'notruf', 'vorsicht'].flatMap((n) => cfg.notes[n].lines).join(' ');
for (const [rule, name] of RULES)
  if (!rule.test(safetyText) || !rule.test(noteText)) fail('safety rule missing in questions or notes: ' + name);
const rights = cfg.pool.map((e) => (e.rf ? (e.a ? e.q : '') : e.o[e.a])).concat(T.DOS);
for (const r of rights)
  if (/versteck|Aufzug nehmen|Aufzug, weil|holen\b.*Kuscheltier|ausprobier|heimlich|Spielzeug sind/i.test(r))
    fail('unsafe right answer: ' + r);
for (const d of T.DONTS) if (T.DOS.includes(d)) fail('a rule is both right and wrong: ' + d);
for (let i = 0; i < 300; i++) {
  const q = K.generate('feuer', 'brandfall', 1, {}, ++seq);
  if (!/^fb[jn]_/.test(q.qid)) continue;
  const right = q.qid.startsWith('fbj_');
  if ((right ? T.DOS : T.DONTS).indexOf(q.answer) < 0) fail('rule task answer ' + q.qid);
  if (q.options.filter((o) => (right ? T.DOS : T.DONTS).includes(o)).length !== 1) fail('rule task options ' + q.qid);
}
// the emergency call: 112, where it burns first, hang up only when the control room ends the call
if (!cfg.pool.some((e) => /Nummer.*Feuer/.test(e.q) && e.o[e.a] === '112')) fail('fire is 112');
if (!/112/.test(T.NOTRUF[1].text) || !/Sicherheit/.test(T.NOTRUF[0].text) || !/auf\.$/.test(T.NOTRUF.at(-1).text))
  fail('the call: safe first, then 112, hang up last');
for (let i = 0; i < 300; i++) {
  const q = K.generate('feuer', 'notruf', 1, {}, ++seq);
  if (!q.qid.startsWith('fwf_')) continue;
  const w = T.WS[+q.qid[4]];
  if (q.answer !== w.q || !q.q.includes(w.says[+q.qid[5]])) fail('W task ' + q.qid);
}
for (let i = 0; i < 300; i++) {
  const q = K.generate('feuer', 'feuerwehr', 1, {}, ++seq);
  if (!q.qid.startsWith('fau_')) continue;
  const a = T.AUFGABEN[+q.qid[4]];
  if (q.answer !== a.name || !q.q.startsWith(a.says[+q.qid[5]])) fail('task of the fire service ' + q.qid);
}

// things in order
for (const x of T.EXPERIMENTS) {
  if (x.length !== 5 || !/\?$/.test(x[0].text) || !/^Ich glaube/.test(x[1].text))
    fail('experiment steps: ' + x[0].text);
  if (!/Erwachsener/.test(x[2].text)) fail('an adult does the experiment: ' + x[2].text);
}
const orders = {};
for (const mod of mods)
  for (let i = 0; i < 400; i++) {
    const q = K.generate('feuer', mod, 1, {}, ++seq);
    if (q.kind !== 'order') continue;
    orders[mod] = (orders[mod] || 0) + 1;
    const src = {
      fko: T.KERZE,
      fao: T.ALARM,
      fno: T.NOTRUF,
      feo: T.EINSATZ,
      fho: T.FRUEHER,
      fxo: T.EXPERIMENTS[+q.qid[3]],
    }[q.qid.slice(0, 3)];
    const ids = src.map((x) => x.id).filter((id) => q.order.includes(id));
    if (q.order.join() !== ids.join() || q.items.length < 4) fail('order task ' + q.qid);
  }
for (const mod of mods) if (!orders[mod]) fail(mod + ' asks no order task');

// Forscherlabor: five experiments, each one done by an adult, the result follows from the thing and the picture shows it
const flames = (svg) => (svg.match(/#FF8A3D/g) || []).length;
for (let i = 0; i < 300; i++) {
  const set = cfg.labor();
  if (
    set
      .map((x) => x.kind)
      .sort()
      .join() !== 'brennt,brennt,deckel,rauch,zwei'
  )
    fail('labor mix');
  for (const x of set) {
    if (!Number.isInteger(x.a) || !x.opts[x.a] || !x.note || !x.q || !x.pic || !x.after)
      fail('labor experiment ' + x.q);
    if (!x.q.startsWith('Nur mit Erwachsenen: Ein Erwachsener')) fail('labor without an adult: ' + x.q);
    if (!cfg.notes[x.topic]) fail('labor topic without note ' + x.topic);
    if (x.kind === 'brennt') {
      const t = T.THINGS.find((v) => x.q.includes(v.acc + ' mit'));
      if (!t || !t.lab || (x.a === 0) !== t.b || (flames(x.after) === 3) !== t.b || flames(x.pic) !== 1)
        fail('labor burn ' + x.q);
    }
    if (x.kind === 'deckel') {
      const c = T.COVERS.find((v) => x.q.includes(v.acc));
      if (!c || (x.a === 0) !== c.over || (flames(x.after) === 0) !== c.over || flames(x.pic) !== 1)
        fail('labor cover ' + x.q);
    }
    if (x.kind === 'zwei' && (x.a !== 0 || flames(x.pic) !== 2 || flames(x.after) !== 1)) fail('labor two glasses');
  }
}

// saves: the new words keep their place at the end of the save code list, and an old save gains the unit
{
  const save = { stats: { feuer: { dreieck: { c: 3, t: 4 }, notruf: { c: 1, t: 1 } } }, dex: { 'Der Fettbrand': 2 } };
  if (JSON.stringify(SAVECODE.grow(SAVECODE.shrink(save))) !== JSON.stringify(save)) fail('save code round trip');
  if (/Fettbrand|notruf/.test(JSON.stringify(SAVECODE.shrink(save)))) fail('save code does not know the unit');
  const p0 = page.open();
  const old = JSON.parse(JSON.stringify(p0.w.__mq.meta));
  p0.close();
  delete old.stats.feuer;
  const p1 = page.open({ mathquest_meta_v2: JSON.stringify(old) });
  if (p1.$('#later')) p1.click('#later');
  const stats = p1.w.__mq.meta.stats.feuer;
  if (p1.errors.length || !stats || mods.some((k) => !stats[k] || stats[k].t !== 0))
    fail('an old save without the unit loads with empty stats');
  p1.click('[data-new="feuer"]');
  const yes = p1.$('.overlay #yes');
  if (yes) yes.click();
  p1.click('.choice');
  p1.click('#go');
  p1.w.__mq.run.map[0][0].t = 'labor';
  p1.w.__mq.screenMap();
  p1.click('.node.open');
  const ok = p1.$('.overlay #tutok');
  if (ok) ok.click();
  if (!p1.text().includes('Nur mit Erwachsenen')) fail('the Forscherlabor says „Nur mit Erwachsenen“');
  p1.click('.opt.guess');
  p1.click('#next');
  const second = p1.$('.labor h3').textContent;
  const p2 = page.open(p1.dump());
  p1.close();
  p2.click('[data-cont="feuer"]');
  if (p2.errors.length || !p2.text().includes('Versuch 2 von 5') || p2.$('.labor h3').textContent !== second)
    fail('reopening the Forscherlabor continues with the same experiment');
  p2.close();
}

console.log('feuer fails', fails.length, 'questions', cfg.pool.length);
if (fails.length) {
  console.log(fails.join('\n'));
  process.exit(1);
}
