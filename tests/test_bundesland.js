// „Mein Bundesland“ (src/bundesland.ts): the pack against the fact file it was copied from, and the task type
// kompass.land in the engine, which exists only while a Bundesland is chosen.
// tests/fixtures/bundesland-fakten.json is the web-checked fact file (sources: lehrplan/quellen-bundeslaender.md).
import fs from 'node:fs';
import path from 'node:path';
import { LANDFAKTEN, LAND_PACKS, NACHBARN, landNote, landQuestions } from '../src/bundesland.ts';
import { MK as K } from '../src/knowledge.ts';
import { LAND_CODES } from '../src/laender.ts';
import '../src/units.ts';
import * as page from './page.js';

const J = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'fixtures/bundesland-fakten.json'), 'utf8'));
const fails = [];
const fail = (msg) => fails.push(msg);
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
// „Alpen (Bayerische Alpen)“ is asked as „Alpen“
const strip = (s) => s.replace(/ \(.*\)$/, '');
const codeOf = Object.fromEntries(LAND_PACKS.map((c) => [LANDFAKTEN[c].name, c]));

/* ---------- the pack is the fact file ---------- */
if (!same(LAND_PACKS, LAND_CODES)) fail(`packs for ${LAND_PACKS}, offered are ${LAND_CODES}`);
// neighbours: all 16 as in the fact file, and symmetric
if (!same(Object.keys(NACHBARN), Object.keys(J.neighbours16))) fail('NACHBARN does not name the 16 Länder');
for (const [name, list] of Object.entries(NACHBARN)) {
  if (!same(list, J.neighbours16[name].nachbarlaender)) fail(`${name}: neighbours differ from the fact file`);
  for (const other of list) if (!NACHBARN[other]?.includes(name)) fail(`${name} names ${other}, but not the other way`);
}
for (const code of LAND_PACKS) {
  const f = LANDFAKTEN[code],
    j = J[code];
  for (const key of ['name', 'hauptstadt']) if (f[key] !== j[key]) fail(`${code}: ${key} differs`);
  for (const key of ['nachbarlaender', 'nachbarstaaten', 'meer', 'fluesse', 'staedte'])
    if (!same(f[key], j[key])) fail(`${code}: ${key} differs from the fact file`);
  if (!same(f.nachbarstaaten, J.neighbours16[f.name].nachbarstaaten)) fail(`${code}: neighbouring countries differ`);
  if (!same(f.landschaften, j.landschaften.map(strip))) fail(`${code}: landschaften differ from the fact file`);
  if ((f.lage || null) !== j.lage) fail(`${code}: lage differs (null in the fact file means: not asked)`);
  if (!!f.stadtstaat !== (j.hauptstadt === j.name)) fail(`${code}: stadtstaat flag`);
  if (f.bund && !/Hauptstadt Deutschlands/.test(j.hauptstadt_hinweis || '')) fail(`${code}: bund without a source`);
  // the largest city only where the ranking is marked safe, or the note says so in these words
  if (
    f.groesste &&
    (f.groesste !== j.staedte[0] ||
      !(
        j.staedte_reihenfolge_sicher || (j.staedte_hinweis || '').includes(`${f.groesste} ist sicher die größte Stadt`)
      ))
  )
    fail(`${code}: largest city ${f.groesste} is not marked safe`);
  // holidays: only from a law that was read, never the ones that hold in parts, and no Sundays
  if (f.feiertage.length && !j.feiertage) fail(`${code}: holidays although the law was not read`);
  for (const h of f.feiertage) {
    const src = (j.feiertage || []).find((x) => strip(x) === h.name);
    if (!src) fail(`${code}: holiday ${h.name} is not in the fact file`);
    else if (h.datum && !src.includes(h.datum)) fail(`${code}: date of ${h.name}`);
    if (/sonntag/i.test(h.name)) fail(`${code}: ${h.name} is always a Sunday, not asked`);
    if (j.feiertage_teilweise.some((x) => x.startsWith(h.name))) fail(`${code}: ${h.name} holds only in parts`);
  }
}

/* ---------- every question against the fact file ---------- */
// what the fact file says about a state, as one text: a wrong option must not occur in it at all, not even in
// the notes on what is true only in parts or disputed (nicht_fragen, *_hinweis, feiertage_teilweise/unbestaetigt)
const said = (code) => JSON.stringify(J[code]);
const facts = (code) => {
  const j = J[code];
  return [j.hauptstadt, ...j.nachbarlaender, ...j.nachbarstaaten, ...j.meer, ...j.fluesse, ...j.staedte].concat(
    j.landschaften.map(strip),
    (j.feiertage || []).map(strip),
  );
};
const neighbours = (code) => J[code].nachbarlaender.map((name) => J.neighbours16[name].code).filter((c) => J[c]);
// a river or a landscape of a neighbour may reach across the border: never a wrong option, never asked the other way
const reaches = (code, name) =>
  said(code).includes(name) ||
  neighbours(code).some((c) => J[c].fluesse.concat(J[c].landschaften.map(strip)).includes(name));
const total = {};
const allIds = new Set();
for (const code of LAND_PACKS) {
  const j = J[code],
    N = j.name,
    qs = landQuestions(code);
  total[code] = qs.length;
  if (new Set(qs.map((q) => q.q + '|' + q.o[0])).size < 20) fail(`${code}: fewer than 20 different questions`);
  for (const q of qs) {
    const [answer, ...wrong] = q.o,
      tag = q.id.split('_')[2],
      bad = (why) => fail(`${q.id}: ${why} (${q.q} → ${q.o.join(' | ')})`);
    if (allIds.has(q.id)) bad('id twice');
    allIds.add(q.id);
    if (!q.id.startsWith(`land_${code}_`)) bad('id without the state');
    if (q.a !== 0 || wrong.length < 2 || new Set(q.o).size !== q.o.length) bad('options');
    if (!q.why || q.why.length > 160 || !(q.q.includes(N) || answer.includes(N))) bad('why, or the state is not named');
    if (/Thüringen|Bremen|Saarland/.test(wrong.join())) bad('a state that is not offered as a wrong option');
    if (/\d/.test(q.q + q.o.join('').replace(/\(\d+\. [A-ZÄÖÜa-zäöü]+\)/g, ''))) bad('a number');

    if (['haupt', 'hauptland', 'hauptgross'].includes(tag)) {
      if (j.hauptstadt === N) bad('capital question for a city state');
      if (
        tag === 'haupt' &&
        (answer !== j.hauptstadt ||
          !wrong.every((w) => !j.staedte.includes(w) && LAND_PACKS.some((c) => c !== code && J[c].hauptstadt === w)))
      )
        bad('capital');
      if (tag === 'hauptland' && (answer !== N || wrong.some((w) => J[codeOf[w]].hauptstadt === j.hauptstadt)))
        bad('capital of');
      if (tag === 'hauptgross' && (!answer.endsWith(j.hauptstadt) || !wrong.every((w) => !w.endsWith(j.hauptstadt))))
        bad('capital and largest city');
    } else if (['stadtstaat', 'stadtland', 'bund'].includes(tag)) {
      if (j.hauptstadt !== N) bad('not a city state');
      if (tag === 'stadtland' && (answer !== N || wrong.some((w) => J[codeOf[w]].hauptstadt === w))) bad('city state');
      if (tag === 'bund' && (answer !== 'Berlin' || wrong.includes('Berlin'))) bad('capital of Germany');
    } else if (tag === 'nb') {
      if (!j.nachbarlaender.includes(answer) || wrong.some((w) => w === N || j.nachbarlaender.includes(w)))
        bad('neighbour');
    } else if (tag.startsWith('nbnicht')) {
      if (j.nachbarlaender.includes(answer) || answer === N || !wrong.every((w) => j.nachbarlaender.includes(w)))
        bad('not a neighbour');
    } else if (tag === 'st' && q.id.endsWith('_keins')) {
      if (j.nachbarstaaten.length || !answer.startsWith('Nein')) bad('no neighbouring country');
    } else if (tag === 'st') {
      if (!j.nachbarstaaten.includes(answer) || wrong.some((w) => said(code).includes(w))) bad('neighbouring country');
    } else if (tag === 'stnicht') {
      if (said(code).includes(answer) || !wrong.every((w) => j.nachbarstaaten.includes(w))) bad('not a country');
    } else if (tag === 'meer') {
      if (j.meer_hinweis) bad('sea question although the fact file warns');
      const right = !j.meer.length
        ? 'Nein'
        : j.meer.length > 1
          ? 'An der Nordsee und an der Ostsee'
          : `An der ${j.meer[0]}`;
      if (answer !== right) bad('sea');
    } else if (tag === 'meerland') {
      if (
        !j.meer.some((m) => q.q.includes(m)) ||
        wrong.some((w) => J[codeOf[w]].meer.length || J[codeOf[w]].meer_hinweis)
      )
        bad('state at the sea');
    } else if (['fl', 'la', 'sd', 'ft'].includes(tag)) {
      // only a holiday carries its date in brackets; Frankfurt (Oder) is a name
      const name = (label) => (tag === 'ft' ? strip(label) : label);
      if (!facts(code).includes(name(answer))) bad('the answer is not in the fact file');
      for (const w of wrong) {
        if (reaches(code, name(w))) bad(`wrong option ${w} is in the fact file of the state or of a neighbour`);
        const date = (w.match(/\((.+)\)$/) || [])[1];
        if (date && said(code).includes(date)) bad(`wrong option ${w}: that date is a holiday here`);
      }
      if (tag === 'ft' && !j.feiertage) bad('holiday question although the law was not read');
    } else if (['flnicht', 'lanicht'].includes(tag)) {
      if (reaches(code, answer) || !wrong.every((w) => facts(code).includes(w))) bad('what is not here');
    } else if (['flwo', 'lawo', 'sdwo', 'ftwo'].includes(tag)) {
      const subject = facts(code)
        .filter((x) => q.q.includes(x))
        .sort((a, b) => b.length - a.length)[0];
      if (answer !== N || !subject) bad('the question does not ask for a fact of the state');
      for (const w of wrong) {
        if (reaches(codeOf[w], subject)) bad(`${subject} is in the fact file of ${w} or of its neighbours`);
        if (tag === 'ftwo' && !J[codeOf[w]].feiertage) bad(`holidays of ${w} were not read`);
      }
    } else if (tag === 'gross') {
      if (answer !== LANDFAKTEN[code].groesste || !wrong.every((w) => j.staedte.includes(w))) bad('largest city');
    } else if (tag === 'lage') {
      if (answer[0].toLowerCase() + answer.slice(1) !== j.lage) bad('position');
      for (const w of wrong)
        if (said(code).includes(w.replace('Ganz ', '').replace(/^Im /, 'im ') + '“') || w === answer)
          bad(`position ${w} is also said of the state`);
    } else if (tag === 'lageland') {
      if (answer !== N || !q.q.includes(j.lage)) bad('state at a position');
      for (const w of wrong) {
        const other = J[codeOf[w]];
        if (!other.lage || other.lage === j.lage || (other.lage_hinweis || '').includes(j.lage))
          bad(`${w} lies there too`);
      }
    } else bad('unknown kind of question, add its check here');
  }
  // the Notizkarte says nothing the questions do not ask
  const note = landNote(code);
  if (!note.title.includes(N) || note.lines.length < 4) fail(`${code}: Notizkarte`);
  for (const other of LAND_PACKS)
    if (
      other !== code &&
      !j.nachbarlaender.includes(J[other].name) &&
      note.lines.join(' ').includes(J[other].hauptstadt)
    )
      fail(`${code}: Notizkarte names ${J[other].hauptstadt}`);
}

/* ---------- the generator is strict ---------- */
{
  let seq = 0;
  const cfg = K.MODES.kompass;
  for (const code of LAND_PACKS) {
    const seen = new Set();
    for (let i = 0; i < 600; i++) {
      const t = K.generate('kompass', 'land', 1, {}, ++seq, { land: code });
      if (!t.qid.startsWith(`land_${code}_`) || t.note !== 'land_' + code) fail(`${code}: got ${t.qid}`);
      if (t.options.filter((o) => o === t.answer).length !== 1 || !t.why) fail(`${code}: ${t.qid} options`);
      seen.add(t.qid);
    }
    if (seen.size < 20) fail(`${code}: the generator reached only ${seen.size} questions`);
    if (!cfg.notes['land_' + code]) fail(`${code}: no Notizkarte`);
  }
  // no state, an unknown one, a state that is not offered: no task, and never another state's questions
  for (const land of [undefined, '', 'XX', 'TH']) {
    let t = null;
    try {
      t = K.generate('kompass', 'land', 1, {}, ++seq, land === undefined ? undefined : { land });
    } catch {}
    if (t) fail(`land ${JSON.stringify(land)} produced ${t.qid}`);
  }
  // the other task types of the unit never draw a state's question
  for (const mod of Object.keys(cfg.modules).filter((k) => k !== 'land'))
    for (let i = 0; i < 300; i++) {
      const t = K.generate('kompass', mod, 1, {}, ++seq, { land: 'SN' });
      if (String(t.qid).startsWith('land_')) fail(`${mod} drew ${t.qid}`);
    }
}

/* ---------- the engine: on with a Bundesland, gone without one ---------- */
const META = 'mathquest_meta_v2',
  RUN = 'mathquest_run_kompass';
const SKIPPED = { setup: { done: false, skipped: true, at: 'x' }, grade: 3 };
let last = null;
const open = (storage) => {
  if (last) last.close();
  last = page.open(storage, { seed: 3 });
  return last;
};
const withMeta = (meta, more) => open({ [META]: JSON.stringify({ ...SKIPPED, ...meta }), ...more });
const mods = (p) => p.w.__mq.land.enabledMods('kompass');
const start = (p) => {
  p.click('[data-new="kompass"]');
  p.click('#go');
  return p.w.__mq.run.hero.attacks.map((a) => a.mod);
};
const check = (ok, msg) => {
  if (!ok) fail(msg);
};
{
  // without a Bundesland: off, whatever the save says, and the hero is the one it always was
  const practised = { kompass: { land: { c: 9, t: 9, hist: [] } } };
  const none = withMeta({
    stats: practised,
    forced: ['mod:kompass:land'],
    off: { kompass: ['rose', 'plan', 'karte', 'lt'] },
  });
  check(!mods(none).includes('land'), 'no Bundesland: land is on although nothing can be asked');
  check(none.w.__mq.land.offList('kompass').includes('land'), 'no Bundesland: land is not listed as off');
  none.w.__mq.land.setOn('mod:kompass:land', true);
  check(!mods(none).includes('land'), 'no Bundesland: a switch brought land back');
  const plain = withMeta({});
  check(start(plain).join() === 'richtung,rose,plan,karte', 'no Bundesland: the hero got other attacks');
  check(plain.errors.length === 0, 'no Bundesland: page errors ' + plain.errors.join(' '));

  // an old save has no statistics for the new task type
  const old = withMeta({ land: 'SN', stats: { kompass: { rose: { c: 1, t: 2, hist: [1, 0] } } } });
  check(old.w.__mq.meta.stats.kompass.land.t === 0 && old.w.__mq.meta.stats.kompass.rose.t === 2, 'old save: stats');

  // with a Bundesland: on for every state, and a new adventure brings the attack
  for (const code of LAND_CODES) {
    const p = withMeta({ land: code });
    check(mods(p).includes('land') && !p.w.__mq.land.offList('kompass').includes('land'), `${code}: land is off`);
    if (code !== 'SN' && code !== 'HH') continue;
    const attacks = start(p);
    check(
      attacks.length === 4 && new Set(attacks).size === 4 && attacks.includes('land'),
      `${code}: the hero starts with ${attacks}`,
    );
    check(p.w.__mq.run.hero.attacks.find((a) => a.mod === 'land').name === 'Heimatkarte', `${code}: attack name`);
    // the attack asks about this state, with its Notizkarte in the explanation
    const fight =
      [...p.d.querySelectorAll('.node.open')].find((n) => n.getAttribute('aria-label') === 'Kampf') ||
      p.$('.node.open');
    p.click(fight);
    const at = p.w.__mq.land.heroAttacks().findIndex((a) => a.mod === 'land');
    check(p.d.querySelectorAll('.atk').length === 4, `${code}: no fight with four attacks`);
    p.click(p.d.querySelectorAll('.atk')[at]);
    check(p.text().includes('Mein Bundesland') && p.text().includes(LANDFAKTEN[code].name), `${code}: task screen`);
    check(p.errors.length === 0, `${code}: page errors ${p.errors.join(' ')}`);

    // the Bundesland changes in the middle of the adventure: nothing breaks, the attack is swapped when read
    const saved = p.dump();
    for (const next of ['', code === 'SN' ? 'HH' : 'SN']) {
      const meta = { ...JSON.parse(saved[META]), land: next };
      const q = open({ ...saved, [META]: JSON.stringify(meta) });
      q.click('[data-cont="kompass"]');
      const now = q.w.__mq.land.heroAttacks().map((a) => a.mod);
      check(new Set(now).size === 4 && now.includes('land') === !!next, `${code} → ${next || 'none'}: attacks ${now}`);
      check(
        JSON.parse(q.dump()[RUN]).hero.attacks.some((a) => a.mod === 'land') && q.errors.length === 0,
        `${code} → ${next || 'none'}: the saved adventure was rewritten, or the page failed ${q.errors.join(' ')}`,
      );
    }
  }

  // Turmwacht: a practised land path, then the Bundesland is taken away while a monster waits with it
  const t = withMeta({ land: 'SN', turm: { on: true }, stats: { kompass: { land: { c: 5, t: 6, hist: [] } } } });
  const T = t.w.__mq.turm;
  T.start(['Sachkunde'], { m: 'kompass', id: 'kartenzeichnerin' });
  const run = t.w.__mq.run;
  check(
    run.turm.lanes.some((l) => l.src.some((s) => s.k === 'land')),
    'Turmwacht: a practised land is no source',
  );
  const x = run.turm.monsters.find((y) => T.TW.canTarget(run, y.id));
  Object.assign(x, { m: 'kompass', k: 'land' });
  delete x.again;
  t.w.__mq.meta.land = '';
  const task = T.ask(x.id);
  check(task && task.mod !== 'land' && run.turm.asking.k === task.mod, 'Turmwacht: land asked without a Bundesland');
  T.answer(true);
  check(t.w.__mq.meta.stats.kompass.land.t === 6 && t.errors.length === 0, 'Turmwacht: the answer counted for land');
  // and a new Turmwacht without a Bundesland takes no land path
  T.start(['Sachkunde'], { m: 'kompass', id: 'kartenzeichnerin' });
  check(
    !t.w.__mq.run.turm.lanes.some((l) => l.src.some((s) => s.k === 'land')),
    'Turmwacht: a land path without a Bundesland',
  );

  // parents: the row is there, and without a Bundesland the switch explains itself instead of switching
  const pa = withMeta({});
  pa.click('#parents');
  pa.click('[data-pt="practice"]');
  if (pa.d.querySelector('[data-ps="subjects"]')) pa.click('[data-ps="subjects"]');
  pa.click([...pa.d.querySelectorAll('[data-pf]')].find((b) => b.textContent.includes('Sachkunde')));
  pa.click('[data-pm="kompass"]');
  const sw = pa.d.querySelector('[data-k="land"]');
  check(sw && sw.getAttribute('aria-checked') === 'false', 'parents: no row for land, or it is on');
  if (sw) pa.click(sw);
  check(
    pa.text().includes('Wählen Sie zuerst unter „Alle Fächer“ ein Bundesland.') &&
      JSON.stringify(pa.w.__mq.meta.forced) === '[]',
    'parents: the switch saved something without a Bundesland',
  );
  check(pa.errors.length === 0, 'parents: page errors ' + pa.errors.join(' '));
  last.close();
}

console.log('bundesland questions', JSON.stringify(total));
console.log('bundesland fails', fails.length);
if (fails.length) {
  console.log(fails.slice(0, 40).join('\n'));
  process.exit(1);
}
