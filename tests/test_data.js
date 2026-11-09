// Cross-checks the game data of all three modes: events, items, topics, shapes, attacks, enemy moves.
const MQ = require('../src/logic.js');
const MK = require('../src/knowledge.js');
require('../src/sachkunde.js'); // registers the Sachkunde units in MK.MODES
const MONART = require('../src/monsters.js');
const fails = [];
const fail = (msg) => fails.push(msg);
const shapes = new Set(MONART.shapes);

const modes = {
  math: { modules: MQ.MODULES, starters: MQ.STARTERS, extra: MQ.EXTRA_ATTACKS, enemies: MQ.ENEMIES, events: MQ.EVENTS, moves: MQ.ENEMY_MOVES, pool: null },
};
for (const [k, cfg] of Object.entries(MK.MODES)) modes[k] = cfg;
modes.jahrmarkt = require('../src/jahrmarkt.js').MODE;

for (const [mode, cfg] of Object.entries(modes)) {
  const mods = new Set(Object.keys(cfg.modules));
  const topics = cfg.pool ? new Set(cfg.pool.map((e) => e.g)) : new Set();

  cfg.events.forEach((ev) => {
    if (ev.w !== undefined && !(cfg.worlds >= ev.w)) fail(`${mode} event „${ev.title}“: world ${ev.w} does not exist`);
    // dilemma cards: no task, no wrong answer, one reward for every choice, each choice explained
    if (ev.dilemma) {
      if (!ev.reward || ev.reward.hp < 0 || (ev.reward.item && !MQ.ITEMS[ev.reward.item])) fail(`${mode} dilemma „${ev.title}“: needs a reward without penalty`);
      if (ev.opts.length < 2 || ev.opts.length > 3) fail(`${mode} dilemma „${ev.title}“: needs 2 or 3 options`);
      ev.opts.forEach((o, i) => { if (o.task || o.effect || !o.label || !o.then || !o.think) fail(`${mode} dilemma „${ev.title}“ option ${i}: needs label, consequence and question, no task or own effect`); });
    }
  });
  cfg.events.forEach((ev) => ev.opts.forEach((o, i) => {
    const tag = `${mode} event „${ev.title}“ option ${i}`;
    if (o.task && o.task !== 'any' && !mods.has(o.task)) fail(`${tag}: unknown task ${o.task}`);
    for (const eff of [o.win, o.lose, o.effect]) if (eff && eff.item && !MQ.ITEMS[eff.item]) fail(`${tag}: unknown item ${eff.item}`);
    if (o.g !== undefined) {
      if (!o.task) fail(`${tag}: g without task`);
      if (!topics.has(o.g)) fail(`${tag}: unknown topic g=${o.g}`);
      if (cfg.byWorld && !cfg.pool.some((e) => e.g === o.g && (!ev.w || (e.w || 1) === ev.w))) fail(`${tag}: topic g=${o.g} has no questions in world ${ev.w}`);
      if (o.task && o.task !== 'any' && !cfg.pool.some((e) => e.mod === o.task && e.g === o.g)) fail(`${tag}: no ${o.task} question with g=${o.g}`);
    }
  }));

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
    ms.forEach((m) => { if (!mods.has(m)) fail(`${mode} ${name}: unknown module ${m}`); });
    if (new Set(list.map((a) => a.name)).size !== list.length) fail(`${mode} ${name}: attack names not distinct`);
  }
  for (const m of mods) if (!cfg.extra[m]) fail(`${mode}: no extra attack name for module ${m}`);

  if (!Array.isArray(cfg.moves) || !cfg.moves.length || cfg.moves.some((x) => typeof x !== 'string' || !x.trim())) fail(`${mode}: moves list empty or invalid`);

  // topic filter in MK.generate
  if (cfg.pool) {
    let seq = 0;
    for (const m of mods) {
      const own = new Set(cfg.pool.filter((e) => e.mod === m).map((e) => e.g));
      for (const g of own) for (let i = 0; i < 60; i++) {
        const world = cfg.pool.find((e) => e.g === g).w || 1;
        const q = MK.generate(mode, m, 1, {}, ++seq, { g, world });
        if (q.kind === 'order') continue; // order tasks (ord, grow, story) have no topic filter
        const e = cfg.pool.find((x) => x.id === q.qid);
        if (!e || e.g !== g) { fail(`${mode}/${m}: generate with g=${g} returned ${q.qid}`); break; }
      }
      // unknown topic falls back to the whole module
      const q = MK.generate(mode, m, 1, {}, ++seq, { g: 'gibt-es-nicht' });
      if (!q || !q.qid) fail(`${mode}/${m}: fallback for unknown g failed`);
    }
  }
}

// the monster book and saved runs identify enemies by name, heroes by id
const enemyNames = [], heroIds = [];
for (const cfg of Object.values(modes)) {
  for (const set of Object.values(cfg.enemies)) enemyNames.push(...set.normal.map((e) => e.name), set.elite.name, set.boss.name);
  heroIds.push(...cfg.starters.map((s) => s.id));
}
for (const [what, list] of [['enemy name', enemyNames], ['hero id', heroIds]]) list.filter((x, i) => list.indexOf(x) !== i).forEach((x) => fail(`duplicate ${what}: ${x}`));

console.log('data fails', fails.length);
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
