// The bot also plays every unit the playtest script in package.json does not name, so a new unit needs no entry there.
const { execFileSync } = require('child_process'); const path = require('path');
const named = require('../package.json').scripts.playtest;
for (const m of require('./units.js').shipped) {
  if (named.includes(`MODE=${m} `)) continue;
  execFileSync('node', [path.join(__dirname, 'playtest.js')], { env: Object.assign({}, process.env, { MODE: m, ACC: '0.9', RUNS: '2' }), stdio: 'inherit' });
}
