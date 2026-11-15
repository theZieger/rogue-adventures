// Browser tests against the built app in Chromium (npm run e2e): offline start and accessibility of every screen.
const { test } = require('node:test');
const assert = require('node:assert');
const { AxeBuilder } = require('@axe-core/playwright');
const { withApp } = require('../tools/browser.js');
const { SCREENS, visit } = require('../tools/screens.js');

test('starts and runs a fight offline, and never asks another server', () =>
  withApp(async (newPage, url) => {
    const page = await newPage();
    const foreign = [];
    page.on('request', (request) => {
      if (!request.url().startsWith(url)) foreign.push(request.url());
    });
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.context().setOffline(true);
    await page.reload();
    await visit(page, SCREENS['task-number']);
    assert.ok(await page.isVisible('.numpad'), 'a task is on screen');
    assert.ok(await page.evaluate(() => document.fonts.check('19px Andika')), 'the font came from the cache');
    assert.deepStrictEqual(foreign, []);
  }));

// Found when the check was introduced and not fixed yet. Remove a line when it is fixed; never add one.
const KNOWN_PROBLEMS = [
  'battle-tutorial: aria-dialog-name',
  'battle: aria-prohibited-attr',
  'battle: label-content-name-mismatch',
  'task-tutorial: aria-dialog-name',
  'dex: scrollable-region-focusable',
  'news: color-contrast',
  'news: scrollable-region-focusable',
  'feedback: color-contrast',
];

test('no screen has a new serious accessibility problem', () =>
  withApp(async (newPage) => {
    const problems = [];
    for (const [name, taps] of Object.entries(SCREENS)) {
      const page = await newPage();
      await visit(page, taps);
      const { violations } = await new AxeBuilder({ page }).analyze();
      for (const { id, impact, nodes } of violations) {
        if (impact !== 'serious' && impact !== 'critical') continue;
        problems.push(`${name}: ${id}`);
        console.log(`${name}: ${id} at ${nodes[0].target}`);
      }
      await page.context().close();
    }
    assert.deepStrictEqual(problems.sort(), [...KNOWN_PROBLEMS].sort());
  }));
