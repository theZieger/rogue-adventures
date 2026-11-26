// Vokal and Konsonant for Bayern and Niedersachsen (reword in src/laender.ts): every Selbstlaut and Mitlaut a child
// or parent can read must be in a form reword knows, because Konsonant is declined differently (den Konsonanten).
// DUMP=1 prints every rewritten sentence, to read them once after adding a new one.
import fs from 'fs';
import path from 'path';
import { ELTERN } from '../src/eltern.ts';
import { MK } from '../src/knowledge.ts';
import { LAND_CODES, reword } from '../src/laender.ts';
import { MQ } from '../src/logic.ts';
import { UNITS } from '../src/units.ts';

const fails = [];
const WORD = /selbstlaut|mitlaut/i;
const found = new Set();
const walk = (x, seen = new Set()) => {
  if (typeof x === 'string') {
    if (WORD.test(x)) found.add(x);
  } else if (x && typeof x === 'object' && !seen.has(x)) {
    seen.add(x);
    Object.values(x).forEach((v) => walk(v, seen));
  }
};

// what is written down: units with their pools, tutorials, Notizkarten and events, and the parent texts
walk([UNITS, ELTERN, MQ, MK]);
// what generators put together, and how such a task is answered
let seq = 0;
for (const [unit, cfg] of Object.entries(MK.MODES))
  for (const type of Object.keys(cfg.modules))
    for (let tier = 1; tier <= cfg.modules[type].maxTier; tier++)
      for (let i = 0; i < 300; i++) {
        const task = MK.generate(unit, type, tier, {}, ++seq);
        const before = found.size;
        walk(task);
        // the feedback line of a choice task (runChoiceTask in src/app/tasks.ts)
        if (WORD.test(task.answer)) found.add(`Richtig wäre: ${task.answer}${task.why ? ' – ' + task.why : ''}`);
        // the shown word is swapped, the comparison is not: fine while the child taps an option and never types the word
        if (found.size > before && !['choice', 'order', 'parts'].includes(task.kind))
          fails.push(`${unit}.${type}: a ${task.kind || 'typed'} task shows Selbstlaut or Mitlaut: ${task.q}`);
      }
// every string in the source, so a sentence built in a screen is seen too
const root = path.join(import.meta.dirname, '..');
const files = fs
  .readdirSync(path.join(root, 'src'), { recursive: true })
  .filter((f) => f.endsWith('.ts'))
  .map((f) => path.join('src', f));
for (const file of [...files, 'CHANGELOG.md'])
  for (const line of fs.readFileSync(path.join(root, file), 'utf8').split('\n')) {
    if (!WORD.test(line) || /^\s*\/\//.test(line)) continue;
    if (file.endsWith('.md')) found.add(line);
    else
      for (const m of line.matchAll(/'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g))
        if (!(m[1] ?? m[2]).includes('(?')) walk(m[1] ?? m[2]);
  }

if (found.size < 40)
  fails.push(`only ${found.size} strings with Selbstlaut or Mitlaut found: the collection is broken`);
// a text node ends at a tag and at the gap of a question
const pieces = (s) => s.split(/<[^>]+>|_{2,}/);
for (const s of found) {
  const said = reword(s, 'BY');
  if (WORD.test(said)) fails.push(`reword does not know this form: „${s}“ → „${said}“`);
  if (/(?<!\p{L})(den|dem|einen|einem|des|eines) (\p{L}+ )?Konsonant(?!en)/iu.test(said))
    fails.push(`wrong case of Konsonant: „${said}“`);
  if (
    pieces(s).length > 1 &&
    pieces(s)
      .map((p) => reword(p, 'BY'))
      .join('') !== pieces(said).join('')
  )
    fails.push(`a tag or gap splits the sentence so that the pieces are reworded differently: „${s}“`);
  if (reword(s, 'NI') !== said) fails.push(`Niedersachsen and Bayern differ: „${s}“`);
  if (reword(said, 'BY') !== said) fails.push(`reword changes its own result: „${said}“`);
  for (const land of ['', 'XX', ...LAND_CODES.filter((c) => c !== 'BY' && c !== 'NI')])
    if (reword(s, land) !== s) fails.push(`reword changes text for „${land}“: „${s}“`);
  if (process.env.DUMP) console.log(said);
}
for (const [from, to] of [
  ['Mitlaut', 'Konsonant'],
  [
    'Hörst du nur einen Mitlaut, schreibst du ihn doppelt.',
    'Hörst du nur einen Konsonanten, schreibst du ihn doppelt.',
  ],
  ['Der Selbstlaut ist kurz, der Mitlaut steht doppelt.', 'Der Vokal ist kurz, der Konsonant steht doppelt.'],
  ['des Mitlauts', 'des Konsonanten'],
  ['Von mehreren Mitlauten', 'Von mehreren Konsonanten'],
  ['mit doppeltem Selbstlaut', 'mit doppeltem Vokal'],
  // not listed: left alone, and the loop above fails for such a sentence in the app
  ['jeden Mitlaut', 'jeden Mitlaut'],
  ['Umlaut, Zwielaut', 'Umlaut, Zwielaut'],
])
  if (reword(from, 'BY') !== to) fails.push(`reword(„${from}“) is „${reword(from, 'BY')}“, expected „${to}“`);

if (fails.length) {
  console.log([...new Set(fails)].slice(0, 40).join('\n'));
  console.log(`laender tests: ${new Set(fails).size} failures`);
  process.exit(1);
}
console.log(`laender tests: all good (${found.size} strings with Selbstlaut or Mitlaut)`);
