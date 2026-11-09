// Cross-checks the game data of all three modes: events, items, topics, shapes, attacks, enemy moves.
const MQ = require('../src/logic.js');
const MK = require('../src/knowledge.js');
const MONART = require('../src/monsters.js');
const fails = [];
const fail = (msg) => fails.push(msg);
const shapes = new Set(MONART.shapes);
const fs = require('fs');
const baked = (key) => fs.existsSync(require('path').join(__dirname, '../art/monsters/svg', key + '.svg'));

const modes = {
  math: { modules: MQ.MODULES, starters: MQ.STARTERS, extra: MQ.EXTRA_ATTACKS, enemies: MQ.ENEMIES, events: MQ.EVENTS, moves: MQ.ENEMY_MOVES, pool: null },
};
for (const [k, cfg] of Object.entries(MK.MODES)) modes[k] = cfg;

for (const [mode, cfg] of Object.entries(modes)) {
  const mods = new Set(Object.keys(cfg.modules));
  const topics = cfg.pool ? new Set(cfg.pool.map((e) => e.g)) : new Set();

  // events
  cfg.events.forEach((ev) => ev.opts.forEach((o, i) => {
    const tag = `${mode} event „${ev.title}“ option ${i}`;
    if (o.task && o.task !== 'any' && !mods.has(o.task)) fail(`${tag}: unknown task ${o.task}`);
    for (const eff of [o.win, o.lose, o.effect]) if (eff && eff.item && !MQ.ITEMS[eff.item]) fail(`${tag}: unknown item ${eff.item}`);
    if (o.g !== undefined) {
      if (!o.task) fail(`${tag}: g without task`);
      if (!topics.has(o.g)) fail(`${tag}: unknown topic g=${o.g}`);
      if (o.task && o.task !== 'any' && !cfg.pool.some((e) => e.mod === o.task && e.g === o.g)) fail(`${tag}: no ${o.task} question with g=${o.g}`);
    }
  }));

  // enemies
  for (const [w, set] of Object.entries(cfg.enemies)) {
    for (const e of set.normal.concat([set.elite, set.boss])) {
      if (!shapes.has(e.shape)) fail(`${mode} world ${w}: enemy ${e.name} has unknown shape ${e.shape}`);
      const key = MONART.bakedKey(e.shape, 0, '', { elite: e === cfg.enemies[w].elite, boss: !!e.boss });
      if (!baked(key)) fail(`${mode} world ${w}: no baked art for ${e.name} (art/monsters/svg/${key}.svg) – run npm run svg`);
      if (!MQ.TYPES[e.type]) fail(`${mode} world ${w}: enemy ${e.name} has unknown type ${e.type}`);
    }
  }

  // attacks: starters and world attacks need 4 distinct, existing modules
  const lists = cfg.starters.map((s) => [`starter ${s.id}`, s.attacks]);
  for (const s of cfg.starters) if (!shapes.has(s.shape)) fail(`${mode} starter ${s.id}: unknown shape ${s.shape}`);
  for (const s of cfg.starters) for (let e = 0; e < 3; e++) if (!baked(MONART.bakedKey(s.shape, e))) fail(`${mode} starter ${s.id}: no baked art for stage ${e + 1} – run npm run svg`);
  for (const [w, list] of Object.entries(cfg.worldAttacks || {})) lists.push([`world ${w} attacks`, list]);
  for (const [name, list] of lists) {
    const ms = list.map((a) => a.mod);
    if (list.length !== 4) fail(`${mode} ${name}: needs 4 attacks, has ${list.length}`);
    if (new Set(ms).size !== ms.length) fail(`${mode} ${name}: modules not distinct (${ms.join(', ')})`);
    ms.forEach((m) => { if (!mods.has(m)) fail(`${mode} ${name}: unknown module ${m}`); });
    if (new Set(list.map((a) => a.name)).size !== list.length) fail(`${mode} ${name}: attack names not distinct`);
  }
  for (const m of mods) if (!cfg.extra[m]) fail(`${mode}: no extra attack name for module ${m}`);

  // enemy moves
  if (!Array.isArray(cfg.moves) || !cfg.moves.length || cfg.moves.some((x) => typeof x !== 'string' || !x.trim())) fail(`${mode}: moves list empty or invalid`);

  // topic filter in MK.generate
  if (cfg.pool) {
    let seq = 0;
    for (const m of mods) {
      const own = new Set(cfg.pool.filter((e) => e.mod === m).map((e) => e.g));
      for (const g of own) for (let i = 0; i < 60; i++) {
        const q = MK.generate(mode, m, 1, {}, ++seq, { g });
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

console.log('data fails', fails.length);
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
