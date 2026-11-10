// Loads every unit, also the ones that register themselves, and returns them as the game sees them (app.js MODES).
// The template src/units/_vorlage.js is checked like a real unit but never shipped.
const fs = require('fs'); const path = require('path');
const MQ = require('../src/logic.js'); const MK = require('../src/knowledge.js');
for (const f of ['sachkunde', 'sachkunde2', 'sachkunde3', 'ethik', 'musik']) require(`../src/${f}.js`);
const dir = path.join(__dirname, '../src/units');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort();
const before = Object.keys(MK.MODES);
files.filter((f) => !f.startsWith('_')).forEach((f) => require(path.join(dir, f)));
const shipped = ['math', 'bau', 'jahrmarkt'].concat(Object.keys(MK.MODES));
files.filter((f) => f.startsWith('_')).forEach((f) => require(path.join(dir, f)));
const modes = Object.assign({
  math: { modules: MQ.MODULES, starters: MQ.STARTERS, extra: MQ.EXTRA_ATTACKS, enemies: MQ.ENEMIES, events: MQ.EVENTS, moves: MQ.ENEMY_MOVES, pool: null },
  bau: { modules: MQ.BAU.MODULES, starters: MQ.BAU.STARTERS, extra: MQ.BAU.EXTRA, enemies: MQ.BAU.ENEMIES, events: MQ.BAU.EVENTS, moves: MQ.BAU.MOVES, worldAttacks: MQ.BAU.WORLD_ATTACKS, pool: null },
  jahrmarkt: require('../src/jahrmarkt.js').MODE,
}, MK.MODES);
module.exports = { modes, shipped, added: Object.keys(MK.MODES).filter((m) => !before.includes(m)) };
