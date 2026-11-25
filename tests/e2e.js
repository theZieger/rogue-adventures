// Browser tests against the built app in Chromium (npm run e2e): offline start and accessibility of every screen.
import { test } from 'node:test';
import assert from 'node:assert';
import { AxeBuilder } from '@axe-core/playwright';
import { withApp } from '../tools/browser.js';
import { open, SCREENS, visit } from '../tools/screens.js';

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

test('the feedback screen: choose a kind, an empty message is not sent, a failed send keeps the text', () =>
  withApp(async (newPage) => {
    const page = await open(newPage, 'feedback');
    await page.click('[data-kind="🐞 Fehler"]');
    assert.equal(await page.getAttribute('[data-kind="🐞 Fehler"]', 'aria-pressed'), 'true');
    assert.equal(await page.getAttribute('[data-kind="💡 Idee"]', 'aria-pressed'), 'false');
    await page.click('#fbsend');
    assert.match(await page.textContent('#fbmsg'), /zuerst etwas hineinschreiben/);
    await page.fill('#fbtext', 'Die Uhr <zeigt> falsch');
    await page.context().setOffline(true);
    await page.click('#fbsend');
    await page.waitForSelector('#fbmsg a');
    const link = await page.getAttribute('#fbmsg a', 'href');
    assert.ok(decodeURIComponent(link).includes('🐞 Fehler: Die Uhr <zeigt> falsch'), link);
    assert.equal(await page.inputValue('#fbtext'), 'Die Uhr <zeigt> falsch');
    assert.equal(await page.textContent('#fbsend'), 'Nochmal versuchen');
    await page.click('#back');
    assert.ok(await page.isVisible('#pfeedback'), 'back in the parent area');
  }));

test('no screen has a serious accessibility problem', () =>
  withApp(async (newPage) => {
    const problems = [];
    for (const name of Object.keys(SCREENS)) {
      const page = await open(newPage, name);
      const { violations } = await new AxeBuilder({ page }).analyze();
      for (const { id, impact, nodes } of violations) {
        if (impact !== 'serious' && impact !== 'critical') continue;
        problems.push(`${name}: ${id}`);
        console.log(`${name}: ${id} at ${nodes[0].target}`);
      }
      await page.context().close();
    }
    assert.deepStrictEqual(problems, []);
  }));
