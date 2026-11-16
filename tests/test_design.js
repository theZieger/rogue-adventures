// The design system does not drift: the scales stay short, no token lies around unused, and every shared building
// block has a specimen on the gallery page. Raising a limit here is a design decision (CLAUDE.md „Design system“).
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const SRC = path.join(import.meta.dirname, '..', 'src');
const read = (...parts) => fs.readFileSync(path.join(SRC, ...parts), 'utf8');
const sheets = fs.readdirSync(path.join(SRC, 'styles')).map((name) => read('styles', name));
const tokens = [...new Set([...read('styles', 'tokens.css').matchAll(/^\s*(--[\w-]+):/gm)].map((match) => match[1]))];
const LIMITS = {
  'palette colours': [/^--(navy|blue|cream|gold|green|moss|red|orange|violet)-\d+$|^--white$/, 35],
  'text sizes': [/^--text-/, 10],
  'line heights': [/^--leading-/, 4],
  'corner radii': [/^--radius-/, 5],
  spaces: [/^--space-/, 8],
  'line widths': [/^--line/, 3],
  durations: [/^--t-/, 7],
};
const BLOCKS = [
  ...[
    'btn',
    'tut',
    'speak',
    'soundbtn',
    'stampbtn',
    'newsbtn',
    'parentbtn',
    'pill',
    'chip',
    'switch',
    'callout',
    'notecard',
    'bar',
  ],
  ...['ptabs', 'psubtabs', 'card', 'choice', 'modal', 'plate', 'log', 'atk', 'node', 'task', 'inp', 'opt', 'oitem'],
  ...['feedback', 'numpad', 'nameinput', 'pcard', 'tw-card'],
];

test('the scales stay as short as they were decided', () => {
  for (const [name, [pattern, most]] of Object.entries(LIMITS)) {
    const count = tokens.filter((token) => pattern.test(token)).length;
    assert.ok(count <= most, `${count} ${name}, at most ${most}`);
  }
});

test('every token is used', () => {
  const css = sheets.join('');
  assert.deepStrictEqual(
    tokens.filter((token) => !css.includes(`var(${token})`)),
    [],
  );
});

test('every shared building block has a specimen in the gallery', () => {
  const gallery = read('gallery.ts');
  assert.deepStrictEqual(
    BLOCKS.filter((name) => !new RegExp(`class="[^"]*\\b${name}\\b`).test(gallery)),
    [],
  );
});
