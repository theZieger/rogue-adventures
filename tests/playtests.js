// The bot plays every unit: one tests/playtest.js process per row, a few at a time.
const { test } = require('node:test');
const { execFile } = require('node:child_process');
const path = require('node:path');

const RUNS = [
  { MODE: 'math', ACC: '0.9', RUNS: '3' },
  { MODE: 'math', W3: '1', ACC: '0.9', RUNS: '1' },
  { MODE: 'math', W3: '1', W3ATK: 'kopf,zmul,vergl,ueber', ACC: '0.9', RUNS: '1' },
  { MODE: 'bau', ACC: '0.9', RUNS: '2' },
  { MODE: 'ethik', ACC: '0.9', RUNS: '1' },
  { MODE: 'kirchenjahr', ACC: '0.9', RUNS: '1' },
  { MODE: 'kartoffel', ACC: '0.9', RUNS: '1' },
  { MODE: 'woerterwerkstatt', ACC: '0.9', RUNS: '1' },
  { MODE: 'satzbaustelle', ACC: '0.9', RUNS: '1' },
  { MODE: 'woerterwerkstatt', OFF: 'doppel,verl,dehn,zus,abc,rede', ACC: '0.9', RUNS: '1' },
  { MODE: 'satzbaustelle', OFF: 'wortart,zeit,steig,satzglied,umstell,ober,teekessel', ACC: '0.9', RUNS: '1' },
  { MODE: 'kornkammer', ACC: '0.9', RUNS: '1' },
  { MODE: 'wetterstation', ACC: '0.9', RUNS: '2' },
  { MODE: 'kompass', ACC: '0.9', RUNS: '2' },
  { MODE: 'wiese', ACC: '0.9', RUNS: '1' },
  { MODE: 'frueher', ACC: '0.9', RUNS: '2' },
  { MODE: 'freunde', ACC: '0.9', RUNS: '2' },
  { MODE: 'ichwelt', ACC: '0.9', RUNS: '2' },
  { MODE: 'jahrmarkt', ACC: '0.9', RUNS: '2' },
  { MODE: 'sinne', ACC: '0.9', RUNS: '2' },
  { MODE: 'verkehr', ACC: '0.9', RUNS: '2' },
  { MODE: 'musik', ACC: '0.9', RUNS: '2' },
  { MODE: 'teestube', ACC: '0.9', RUNS: '2' },
  { MODE: 'doppeldecker', ACC: '0.9', RUNS: '2' },
  { MODE: 'turm', GRADE: '3', ACC: '0.9', RUNS: '1' },
  { MODE: 'turm', GRADE: '2', ACC: '0.9', RUNS: '1' },
  { SEED: '1', MODE: 'turm', GRADE: '3', SUBJECTS: 'Mathe', ACC: '0.65', RUNS: '1' },
];

function play(script, env = {}) {
  return new Promise((resolve, reject) => {
    execFile(process.execPath, [path.join(__dirname, script)], { env: { ...process.env, ...env }, maxBuffer: 64 << 20 }, (error, stdout, stderr) =>
      error ? reject(new Error(`${stderr}\n${stdout.slice(-2000)}`)) : resolve());
  });
}

test('playtests', { concurrency: 4 }, async (t) => {
  const settings = (env) => Object.entries(env).map(([key, value]) => `${key}=${value}`).join(' ');
  await Promise.all([
    ...RUNS.map((env) => t.test(settings(env), () => play('playtest.js', env))),
    t.test('playtest_units', () => play('playtest_units.js')),
  ]);
});
