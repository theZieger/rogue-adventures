// Cross-checks the game data of all modes: events, items, topics, shapes, attacks, enemy moves.
import { ELTERN } from '../src/eltern.ts';
import { ICONS } from '../src/icons.ts';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { open as openPage } from './page.js';
import { LAENDER, LAND_CODES } from '../src/laender.ts';
import { MQ } from '../src/logic.ts';
import { MK } from '../src/knowledge.ts';
import { UNITS as modes } from '../src/units.ts';
import { MONART } from '../src/monsters.ts';
const fails = [];
const fail = (msg) => fails.push(msg);
const shapes = new Set(MONART.shapes);

for (const [mode, cfg] of Object.entries(modes)) {
  const mods = new Set(Object.keys(cfg.modules));
  const topics = cfg.pool ? new Set(cfg.pool.map((e) => e.g)) : new Set();

  cfg.events.forEach((ev) => {
    if (ev.w !== undefined && !(cfg.worlds >= ev.w)) fail(`${mode} event „${ev.title}“: world ${ev.w} does not exist`);
    // dilemma cards: no task, no wrong answer, one reward for every choice, each choice explained
    if (ev.dilemma) {
      if (!ev.reward || ev.reward.hp < 0 || (ev.reward.item && !MQ.ITEMS[ev.reward.item]))
        fail(`${mode} dilemma „${ev.title}“: needs a reward without penalty`);
      if (ev.opts.length < 2 || ev.opts.length > 3) fail(`${mode} dilemma „${ev.title}“: needs 2 or 3 options`);
      ev.opts.forEach((o, i) => {
        if (o.task || o.effect || !o.label || !o.then || !o.think)
          fail(
            `${mode} dilemma „${ev.title}“ option ${i}: needs label, consequence and question, no task or own effect`,
          );
      });
    }
  });
  cfg.events.forEach((ev) =>
    ev.opts.forEach((o, i) => {
      const tag = `${mode} event „${ev.title}“ option ${i}`;
      if (o.task && o.task !== 'any' && !mods.has(o.task)) fail(`${tag}: unknown task ${o.task}`);
      for (const eff of [o.win, o.lose, o.effect])
        if (eff && eff.item && !MQ.ITEMS[eff.item]) fail(`${tag}: unknown item ${eff.item}`);
      if (o.g !== undefined) {
        if (!o.task) fail(`${tag}: g without task`);
        if (!topics.has(o.g)) fail(`${tag}: unknown topic g=${o.g}`);
        if (cfg.byWorld && !cfg.pool.some((e) => e.g === o.g && (!ev.w || (e.w || 1) === ev.w)))
          fail(`${tag}: topic g=${o.g} has no questions in world ${ev.w}`);
        if (o.task && o.task !== 'any' && !cfg.pool.some((e) => e.mod === o.task && e.g === o.g))
          fail(`${tag}: no ${o.task} question with g=${o.g}`);
      }
    }),
  );

  for (const [w, set] of Object.entries(cfg.enemies)) {
    for (const e of set.normal.concat([set.elite, set.boss])) {
      if (!shapes.has(e.shape)) fail(`${mode} world ${w}: enemy ${e.name} has unknown shape ${e.shape}`);
      if (!MQ.TYPES[e.type]) fail(`${mode} world ${w}: enemy ${e.name} has unknown type ${e.type}`);
    }
  }

  // attacks: starters and world attacks need 4 distinct, existing modules
  const lists = cfg.starters.map((s) => [`starter ${s.id}`, s.attacks]);
  for (const s of cfg.starters) if (!shapes.has(s.shape)) fail(`${mode} starter ${s.id}: unknown shape ${s.shape}`);
  for (const [w, list] of Object.entries(cfg.worldAttacks || {})) lists.push([`world ${w} attacks`, list]);
  for (const [name, list] of lists) {
    const ms = list.map((a) => a.mod);
    if (list.length !== 4) fail(`${mode} ${name}: needs 4 attacks, has ${list.length}`);
    if (new Set(ms).size !== ms.length) fail(`${mode} ${name}: modules not distinct (${ms.join(', ')})`);
    ms.forEach((m) => {
      if (!mods.has(m)) fail(`${mode} ${name}: unknown module ${m}`);
    });
    if (new Set(list.map((a) => a.name)).size !== list.length) fail(`${mode} ${name}: attack names not distinct`);
  }
  for (const m of mods)
    if (!cfg.extra[m] && !cfg.modules[m].shop) fail(`${mode}: no extra attack name for module ${m}`);

  if (!Array.isArray(cfg.moves) || !cfg.moves.length || cfg.moves.some((x) => typeof x !== 'string' || !x.trim()))
    fail(`${mode}: moves list empty or invalid`);

  // topic filter in MK.generate
  if (cfg.pool) {
    let seq = 0;
    for (const m of mods) {
      const own = new Set(cfg.pool.filter((e) => e.mod === m).map((e) => e.g));
      for (const g of own)
        for (let i = 0; i < 60; i++) {
          const world = cfg.pool.find((e) => e.g === g).w || 1;
          // a state's questions (Themengebiet land_<code>) only come up for that state
          const q = MK.generate(mode, m, 1, {}, ++seq, { g, world, land: g.replace('land_', '') });
          if (q.kind === 'order') continue; // order tasks (ord, grow, story) have no topic filter
          const e = cfg.pool.find((x) => x.id === q.qid);
          if (!e || e.g !== g) {
            fail(`${mode}/${m}: generate with g=${g} returned ${q.qid}`);
            break;
          }
        }
      // unknown topic falls back to the whole module
      const q = MK.generate(mode, m, 1, {}, ++seq, { g: 'gibt-es-nicht', land: 'SN' });
      if (!q || !q.qid) fail(`${mode}/${m}: fallback for unknown g failed`);
    }
  }
}

// Lesestube texts: 60–120 words, three questions with one right answer each
import { TEXTE } from '../src/texte.ts';
if (TEXTE.length < 12) fail('Lesestube: fewer than 12 texts');
const KINDS = [
  'Fabel',
  'Sachtext',
  'Witz',
  'Sprichwort',
  'Gedicht',
  'Erzählung',
  'Anleitung',
  'Rezept',
  'Lexikon',
  'Sage',
];
for (const k of KINDS) if (!TEXTE.some((t) => t.kind === k && !t.grade)) fail('Lesestube: no ' + k);
// shorter texts for younger readers; grade 1 and 2 texts have two questions
const WORDS = { 1: [8, 30], 2: [20, 60], 3: [60, 120] };
if (TEXTE.filter((t) => t.kind === 'Gedicht').some((t) => !t.by)) fail('Lesestube: a poem needs its author (by)');
TEXTE.forEach((t) => {
  const words = t.text.split(/\s+/).filter((x) => /[a-zäöüß0-9]/i.test(x)).length;
  const [lo, hi] = WORDS[t.grade || 3] || [0, -1];
  if (words < lo || words > hi) fail(`Lesestube ${t.id}: ${words} words for grade ${t.grade || 3}`);
  if (!t.title || !KINDS.includes(t.kind)) fail(`Lesestube ${t.id}: title or kind`);
  if (/["']/.test(t.text + t.title + (t.by || ''))) fail(`Lesestube ${t.id}: use German quotes „…“ and ’`);
  if (!Array.isArray(t.qs) || t.qs.length !== (t.grade ? 2 : 3))
    fail(`Lesestube ${t.id}: needs ${t.grade ? 2 : 3} questions`);
  (t.qs || []).forEach((q, i) => {
    if (!q.q || !Array.isArray(q.o) || q.o.length < 3) fail(`Lesestube ${t.id} q${i}: at least 3 options`);
    else if (new Set(q.o).size !== q.o.length) fail(`Lesestube ${t.id} q${i}: duplicate option`);
    if (!Number.isInteger(q.a) || !q.o || !q.o[q.a]) fail(`Lesestube ${t.id} q${i}: answer index`);
  });
});
TEXTE.map((t) => t.id)
  .filter((x, i, a) => a.indexOf(x) !== i)
  .forEach((x) => fail('Lesestube: duplicate id ' + x));
// grade 1 shows Sprechsilben: every word with more than one vowel sound is split, one vowel sound per syllable
const VOWEL = /ei|ai|au|eu|äu|ie|aa|ee|oo|[aeiouäöüy]/gi;
TEXTE.forEach((t) => {
  if (!!t.syl !== (t.grade === 1)) fail(`Lesestube ${t.id}: only and all grade-1 texts mark syllables`);
  if (!t.syl) return;
  if (t.syl.replace(/·/g, '') !== t.text || /·/.test(t.text))
    fail(`Lesestube ${t.id}: text differs from syllable text`);
  for (const w of t.syl.match(/[A-Za-zÄÖÜäöüß·]+/g)) {
    const parts = w.split('·'),
      n = (w.match(VOWEL) || []).length;
    if (parts.length !== n || parts.some((p) => (p.match(VOWEL) || []).length !== 1))
      fail(`Lesestube ${t.id}: syllables of „${w}“`);
  }
});

// the monster book and saved runs identify enemies by name, heroes by id
// a name or id may appear in several units only for the same opponent or hero (grade 1/2 share one set per subject;
// each unit gives the shared hero its own attacks)
const seen = new Map();
const same = (what, key, sig) => {
  const k = what + ':' + key;
  if (seen.has(k) && seen.get(k) !== sig) fail(`duplicate ${what}: ${key}`);
  seen.set(k, sig);
};
for (const cfg of Object.values(modes)) {
  for (const set of Object.values(cfg.enemies))
    for (const e of set.normal.concat([set.elite, set.boss]))
      same('enemy name', e.name, JSON.stringify([e.shape, e.type, e.hp, e.atk]));
  for (const s of cfg.starters) same('hero id', s.id, JSON.stringify([s.shape, s.names, s.type]));
}

// Kleiderkammer: every hero shape can wear every piece, and the result is well-formed SVG with the piece drawn
{
  const parser = new new JSDOM('').window.DOMParser();
  const dressable = new Set(MONART.dressable);
  for (const cfg of Object.values(modes))
    for (const s of cfg.starters)
      if (!dressable.has(s.shape)) fail(`hero ${s.id}: shape ${s.shape} has no clothing position`);
  for (const shape of MONART.dressable)
    for (const o of MONART.outfits)
      for (const evo of [0, 2]) {
        const bare = MONART.monsterSVG(shape, evo).replace(/mg\d+/g, ''),
          svg = MONART.monsterSVG(shape, evo, '', { outfit: o });
        const doc = parser.parseFromString(
          svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '),
          'image/svg+xml',
        );
        if (
          doc.getElementsByTagName('parsererror').length ||
          doc.documentElement.nodeName !== 'svg' ||
          /NaN|undefined/.test(svg)
        )
          fail(`${shape} with ${o} (evo ${evo}): broken SVG`);
        if (svg.replace(/mg\d+/g, '') === bare) fail(`${shape} with ${o}: piece not drawn`);
      }
  const enemy = MONART.shapes.find((s) => !dressable.has(s));
  if (
    MONART.monsterSVG(enemy, 0, '', { outfit: 'krone' }).replace(/mg\d+/g, '') !==
    MONART.monsterSVG(enemy, 0).replace(/mg\d+/g, '')
  )
    fail('enemies must not wear clothes');
}

// Turmwacht is an extra with its own run key, not a unit (MODE_KEYS is built from the units)
if (modes.turm) fail('turm must not be a unit');

// Turmwacht asks any unit's fight task in any of its worlds: every one must generate at tier 1
{
  const random = Math.random;
  let seed = 7;
  Math.random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  let seq = 0;
  for (const [mode, cfg] of Object.entries(modes))
    for (const [k, mod] of Object.entries(cfg.modules)) {
      if (mod.shop) continue;
      for (let w = 1; w <= (cfg.worlds || 1); w++) {
        if (!(mod.worldCap[Math.min(w, mod.worldCap.length) - 1] > 0)) continue;
        for (let i = 0; i < 5; i++) {
          let t;
          try {
            t =
              mode === 'math'
                ? MQ.generate(k, 1)
                : mode === 'bau'
                  ? MQ.BAU.generate(k, 1)
                  : cfg.numGen
                    ? cfg.numGen(k, 1)
                    : MK.generate(mode, k, 1, {}, ++seq, { world: w, land: 'SN' });
          } catch (e) {
            fail(`${mode}/${k} world ${w}: ${e.message}`);
            break;
          }
          if (!t || typeof t !== 'object') {
            fail(`${mode}/${k} world ${w}: no task`);
            break;
          }
          const e = cfg.byWorld && cfg.pool.find((x) => x.id === t.qid);
          if (e && (e.w || 1) !== w) {
            fail(`${mode}/${k} world ${w}: question ${t.qid} is from world ${e.w || 1}`);
            break;
          }
        }
      }
    }
  Math.random = random;
}

// parent area: every task type has its one-sentence explanation, every topic its place in the curriculum
{
  for (const [m, c] of Object.entries(modes)) {
    if (!ELTERN.PLAN[m]) fail(`eltern.js: PLAN.${m} is missing`);
    for (const k of Object.keys(c.modules))
      if (!(ELTERN.INFO[m] || {})[k]) fail(`eltern.js: INFO.${m}.${k} is missing`);
    for (const k of Object.keys(ELTERN.INFO[m] || {}))
      if (!c.modules[k]) fail(`eltern.js: INFO.${m}.${k} has no task type`);
  }
  for (const m of Object.keys(ELTERN.INFO)) if (!modes[m]) fail(`eltern.js: INFO.${m} has no topic`);
}

// drawn icons: all live in one document, so ids must be unique; nothing may load from outside
{
  const ids = Object.values(ICONS).flatMap((m) => [...m.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]));
  for (const id of new Set(ids.filter((x, i) => ids.indexOf(x) !== i))) fail(`icons.js: id ${id} is used twice`);
  for (const [k, m] of Object.entries(ICONS)) {
    if (/<(script|style|image)|href=|https?:/.test(m)) fail(`icons.js: ${k} must be plain shapes`);
    if (/\uFE0F/.test(k)) fail(`icons.js: key ${k} must not carry a variation selector`);
  }
}

// src/units.ts loads the unit files by name in Node: it must end up with the units the built page has
{
  const p = openPage();
  const inPage = p.w.eval('Object.keys(UNITS)');
  p.close();
  if (inPage.join() !== Object.keys(modes).join())
    fail(`src/units.ts: Node has the units ${Object.keys(modes)}, the page has ${inPage}`);
}

// src/laender.ts names units and task types by id and must offer exactly the 13 states that were read
{
  const FITS = ['passt', 'frueher', 'spaeter', 'nicht', 'offen'];
  if (LAND_CODES.join() !== 'BW,BY,BE,BB,HH,HE,MV,NI,NW,RP,SN,ST,SH')
    fail(`laender.ts: offers ${LAND_CODES}, expected the 13 states in the order of their names`);
  for (const [code, land] of Object.entries(LAENDER)) {
    for (const unit of land.hide) if (!modes[unit]) fail(`laender.ts ${code}: hides unknown unit ${unit}`);
    for (const [unit, types] of Object.entries(land.off))
      for (const type of types)
        if (!modes[unit]?.modules[type]) fail(`laender.ts ${code}: switches off unknown task type ${unit}.${type}`);
    for (const [unit, fit] of Object.entries(land.fit)) {
      if (!modes[unit]) fail(`laender.ts ${code}: fit for unknown unit ${unit}`);
      if (!FITS.includes(fit)) fail(`laender.ts ${code}: unknown fit ${fit} for ${unit}`);
    }
    for (const subject of Object.keys({ ...land.labels, ...land.long }))
      if (!modes.math || !Object.values(modes).some((unit) => unit.subject === subject))
        fail(`laender.ts ${code}: label for unknown subject ${subject}`);
    if (!['abz', 'erg'].includes(land.minus)) fail(`laender.ts ${code}: unknown subtraction method ${land.minus}`);
  }
  // every state says for every unit how it fits; nothing is left to the default. Outside Saxony the verdict and
  // the parents' note come from lehrplan/laender/_passung-je-thema.md, where each one has its source
  const table = {};
  let at = '';
  for (const line of fs
    .readFileSync(new URL('../lehrplan/laender/_passung-je-thema.md', import.meta.url), 'utf8')
    .split('\n')) {
    at = line.match(/^## .*\((\w\w)\)$/)?.[1] || at;
    const row = line.match(/^\| `(\w+)` \| (\w+) \| (.*?) \| (.*?) \| (.*?) \|$/);
    if (row) (table[at] ||= {})[row[1]] = { fit: row[2], note: row[3], src: row[4] };
  }
  for (const [code, land] of Object.entries(LAENDER)) {
    for (const unit of Object.keys(modes)) {
      const fit = land.fit[unit];
      if (!fit) fail(`laender.ts ${code}: no fit for ${unit} (add it, 'offen' until the plan has been compared)`);
      if (code === 'SN' || !fit) continue;
      const row = table[code]?.[unit];
      if (!row) {
        if (fit !== 'offen') fail(`laender.ts ${code}: ${unit} is '${fit}' without a line in _passung-je-thema.md`);
        continue;
      }
      if (row.fit !== fit || row.note !== (land.note[unit] || ''))
        fail(`laender.ts ${code}: ${unit} differs from _passung-je-thema.md (${fit} / ${row.fit})`);
      const file = row.src.match(/^lehrplan\/laender\/[\w-]+\.md(?= )/)?.[0];
      if (fit !== 'offen' && !(file && fs.existsSync(new URL('../' + file, import.meta.url))))
        fail(`_passung-je-thema.md ${code}: ${unit} is '${fit}' without a source in a state file`);
    }
    for (const [unit, note] of Object.entries(land.note)) {
      if (!modes[unit]) fail(`laender.ts ${code}: note for unknown unit ${unit}`);
      if (note.length > 140) fail(`laender.ts ${code}: the note for ${unit} has ${note.length} characters, 140 fit`);
    }
    for (const [key, gloss] of Object.entries(land.gloss || {})) {
      const [unit, type] = key.split('.');
      if (!modes[unit]?.modules[type]) fail(`laender.ts ${code}: gloss for unknown task type ${key}`);
      if (!gloss.kind || !gloss.eltern)
        fail(`laender.ts ${code}: gloss ${key} needs a line for the child and one for parents`);
    }
  }
  if (LAENDER.SN.gloss || Object.keys(LAENDER.SN.note).length)
    fail('laender.ts SN: Saxony is the baseline, no note or gloss');
  // a default-hidden unit or task type must not contradict the verdict
  for (const [code, land] of Object.entries(LAENDER))
    for (const unit of land.hide)
      if (land.fit[unit] !== 'nicht') fail(`laender.ts ${code}: hides ${unit}, but its fit is ${land.fit[unit]}`);
}

// Every Bundesland, every unit, every world: what the state switches off must leave a fight playable without the
// „fewer than two → all“ rescue of enabledMods, and every hero must keep as many different attacks as without a state.
{
  const p = openPage();
  const { meta, land } = p.w.__mq;
  const grades = [...new Set(Object.values(modes).map((unit) => unit.grade))];
  const attacksOf = (unit, starter, world) => {
    p.w.__mq.mode = unit;
    p.w.__mq.run = { mode: unit, world, hero: { attacks: (modes[unit].worldAttacks || {})[world] || starter.attacks } };
    return land.heroAttacks().map((attack) => attack.mod);
  };
  const distinct = {};
  for (const code of ['', ...LAND_CODES]) {
    meta.land = code;
    for (const grade of grades)
      if (!Object.keys(modes).some((unit) => modes[unit].grade === grade && land.shown(unit)))
        fail(`land ${code}: no unit left in grade ${grade}`);
    for (const [unit, cfg] of Object.entries(modes))
      for (let world = 1; world <= cfg.worlds; world++) {
        const off = land.offList(unit);
        const left = Object.keys(cfg.modules).filter(
          (k) =>
            !cfg.modules[k].shop &&
            cfg.modules[k].worldCap[Math.min(world, cfg.modules[k].worldCap.length) - 1] > 0 &&
            !off.includes(k),
        );
        if (left.length < 2) fail(`land ${code}: ${unit} world ${world} keeps only ${left.length} task types`);
        for (const starter of cfg.starters) {
          const mods = attacksOf(unit, starter, world);
          const key = `${unit}:${starter.id}:${world}`;
          if (mods.some((k) => off.includes(k))) fail(`land ${code}: ${key} attacks with a switched-off task type`);
          if (!code) distinct[key] = new Set(mods).size;
          else if (new Set(mods).size !== distinct[key] || mods.length !== 4)
            fail(
              `land ${code}: ${key} has ${new Set(mods).size} different attacks of ${mods.length}, without a state ${distinct[key]}`,
            );
          if (!code && world === 1 && cfg.grade === 3 && new Set(mods).size !== 4)
            fail(`${key}: a hero needs four different attacks, has ${mods}`);
        }
      }
  }
  p.w.__mq.run = null;
  p.close();
}

console.log('data fails', fails.length);
if (fails.length) {
  console.log(fails.join('\n'));
  process.exit(1);
}
