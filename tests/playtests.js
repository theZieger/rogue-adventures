// The bot plays every unit: one tests/playtest.js process per row, a few at a time.
// A unit without a row of its own is played once, so a new unit needs no entry here.
import { UNITS } from '../src/units.ts';
import { test } from 'node:test';
import { execFile } from 'node:child_process';
import path from 'node:path';

const RUNS = [
  { MODE: 'math', ACC: '0.9', RUNS: '3' },
  { MODE: 'math', W3: '1', ACC: '0.9', RUNS: '1' },
  { MODE: 'math', W3: '1', W3ATK: 'kopf,zmul,vergl,ueber', ACC: '0.9', RUNS: '1' },
  { MODE: 'math', W3: '1', W3ATK: 'klammer,vorrang,add,sub', ACC: '0.9', RUNS: '1' },
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
  { MODE: 'strom', ACC: '0.9', RUNS: '2' },
  { MODE: 'gemeinde', ACC: '0.9', RUNS: '2' },
  { MODE: 'feuer', ACC: '0.9', RUNS: '2' },
  { MODE: 'kompass', ACC: '0.9', RUNS: '2' },
  { MODE: 'wiese', ACC: '0.9', RUNS: '1' },
  { MODE: 'wald', ACC: '0.9', RUNS: '2' },
  { MODE: 'gewaesser', ACC: '0.9', RUNS: '2' },
  { MODE: 'frueher', ACC: '0.9', RUNS: '2' },
  { MODE: 'freunde', ACC: '0.9', RUNS: '2' },
  { MODE: 'ichwelt', ACC: '0.9', RUNS: '2' },
  { MODE: 'religionen', ACC: '0.9', RUNS: '2' },
  { MODE: 'jahrmarkt', ACC: '0.9', RUNS: '2' },
  { MODE: 'jahrmarkt', LITER: '1', ACC: '0.9', RUNS: '1' },
  { MODE: 'sinne', ACC: '0.9', RUNS: '2' },
  { MODE: 'verkehr', ACC: '0.9', RUNS: '2' },
  { MODE: 'musik', ACC: '0.9', RUNS: '2' },
  { MODE: 'teestube', ACC: '0.9', RUNS: '2' },
  { MODE: 'doppeldecker', ACC: '0.9', RUNS: '2' },
  { MODE: 'turm', GRADE: '3', ACC: '0.9', RUNS: '1' },
  { MODE: 'turm', GRADE: '2', ACC: '0.9', RUNS: '1' },
  { SEED: '1', MODE: 'turm', GRADE: '3', SUBJECTS: 'Mathe', ACC: '0.65', RUNS: '1' },
  // Hamburg switches off the most; the written methods are attacks of the world 3 hero and must be swapped
  { MODE: 'math', LAND: 'HH', ACC: '0.9', RUNS: '1' },
  { MODE: 'math', LAND: 'HH', W3: '1', ACC: '0.9', RUNS: '1' },
  { MODE: 'bau', LAND: 'HH', ACC: '0.9', RUNS: '1' },
  { MODE: 'woerterwerkstatt', LAND: 'HH', ACC: '0.9', RUNS: '1' },
  { MODE: 'freunde', LAND: 'HH', ACC: '0.9', RUNS: '1' },
  { MODE: 'turm', LAND: 'HH', GRADE: '3', ACC: '0.9', RUNS: '1' },
  // Bayern: Vokal and Konsonant in the shown text, the answers keep the Saxon words
  { MODE: 'laute1', ACC: '0.9', RUNS: '1' },
  { MODE: 'laute1', LAND: 'BY', ACC: '0.9', RUNS: '1' },
  { MODE: 'satzbaustelle', LAND: 'BY', ACC: '0.9', RUNS: '1' },
  // a family that starts in Bayern subtracts by Abziehen (Entbündeln)
  { MODE: 'math', LAND: 'BY', MINUS: 'new', W3: '1', ACC: '0.9', RUNS: '1' },
  // hidden everywhere but in Sachsen
  { MODE: 'kirchenjahr', LAND: 'SN', ACC: '0.9', RUNS: '1' },
  // „Mein Bundesland“ is an attack of the hero as soon as a Bundesland is chosen; a city state has the fewest questions
  { MODE: 'kompass', LAND: 'SN', ACC: '0.9', RUNS: '2' },
  { MODE: 'kompass', LAND: 'HH', ACC: '0.9', RUNS: '2' },
  // one unit per remaining state, chosen for what that state changes (every unit in every state: tests/test_profiles.js)
  { MODE: 'satzbaustelle', LAND: 'BW', ACC: '0.9', RUNS: '1' },
  { MODE: 'satzbaustelle', LAND: 'NW', ACC: '0.9', RUNS: '1' },
  { MODE: 'satzbaustelle', LAND: 'RP', ACC: '0.9', RUNS: '1' },
  { MODE: 'satzbaustelle', LAND: 'ST', ACC: '0.9', RUNS: '1' },
  { MODE: 'woerterwerkstatt', LAND: 'HE', ACC: '0.9', RUNS: '1' },
  { MODE: 'woerterwerkstatt', LAND: 'SN', ACC: '0.9', RUNS: '1' },
  { MODE: 'ethik', LAND: 'SN', ACC: '0.9', RUNS: '1' },
  { MODE: 'schreiben2', LAND: 'NI', ACC: '0.9', RUNS: '1' },
  { MODE: 'freunde', LAND: 'BE', ACC: '0.9', RUNS: '1' },
  { MODE: 'ichwelt', LAND: 'BB', ACC: '0.9', RUNS: '1' },
  { MODE: 'math', LAND: 'MV', W3: '1', ACC: '0.9', RUNS: '1' },
  { MODE: 'math', LAND: 'SH', W3: '1', ACC: '0.9', RUNS: '1' },
  // the parents change the Bundesland again and again while an adventure runs
  { MODE: 'math', SWITCH: '1', ACC: '0.9', RUNS: '1' },
  { MODE: 'math', SWITCH: '1', W3: '1', ACC: '0.9', RUNS: '1' },
  { MODE: 'bau', SWITCH: '1', ACC: '0.9', RUNS: '1' },
  { MODE: 'ethik', SWITCH: '1', ACC: '0.9', RUNS: '1' },
  { MODE: 'woerterwerkstatt', SWITCH: '1', ACC: '0.9', RUNS: '1' },
  { MODE: 'jahrmarkt', SWITCH: '1', LITER: '1', ACC: '0.9', RUNS: '1' },
  { MODE: 'turm', SWITCH: '1', GRADE: '3', ACC: '0.9', RUNS: '1' },
];

const named = new Set(RUNS.map((run) => run.MODE));
const others = Object.keys(UNITS).filter((unit) => !named.has(unit));
const ALL_RUNS = [...RUNS, ...others.map((unit) => ({ MODE: unit, ACC: '0.9', RUNS: '1' }))];

function play(env) {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [path.join(import.meta.dirname, 'playtest.js')],
      { env: { ...process.env, ...env }, maxBuffer: 64 << 20 },
      (error, stdout, stderr) => (error ? reject(new Error(`${stderr}\n${stdout.slice(-2000)}`)) : resolve()),
    );
  });
}

test('playtests', { concurrency: 4 }, async (t) => {
  const settings = (env) =>
    Object.entries(env)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');
  // TRACE_DIR=folder: every run records what the bot saw (see trace in playtest.js)
  const traced = (env) =>
    process.env.TRACE_DIR ? { ...env, TRACE: path.join(process.env.TRACE_DIR, `${settings(env)}.txt`) } : env;
  await Promise.all(ALL_RUNS.map((env) => t.test(settings(env), () => play(traced(env)))));
});
