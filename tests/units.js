// Every unit as the game sees it (app.js MODES): the files below register theirs in MK.MODES.
const MQ = require('../src/logic.js'); const MK = require('../src/knowledge.js');
for (const f of ['sachkunde', 'sachkunde2', 'sachkunde3', 'ethik', 'musik']) require(`../src/${f}.js`);
module.exports = Object.assign({
  math: { modules: MQ.MODULES, starters: MQ.STARTERS, extra: MQ.EXTRA_ATTACKS, enemies: MQ.ENEMIES, events: MQ.EVENTS, moves: MQ.ENEMY_MOVES, pool: null },
  bau: { modules: MQ.BAU.MODULES, starters: MQ.BAU.STARTERS, extra: MQ.BAU.EXTRA, enemies: MQ.BAU.ENEMIES, events: MQ.BAU.EVENTS, moves: MQ.BAU.MOVES, worldAttacks: MQ.BAU.WORLD_ATTACKS, pool: null },
  jahrmarkt: require('../src/jahrmarkt.js').MODE,
}, MK.MODES);
