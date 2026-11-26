// Browser tests against the built app in Chromium (npm run e2e): offline start and accessibility of every screen.
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert';
import { AxeBuilder } from '@axe-core/playwright';
import { withApp } from '../tools/browser.js';
import { open, SCREENS, visit } from '../tools/screens.js';
import { CURRICULUM } from '../src/curriculum.ts';
import { ELTERN } from '../src/eltern.ts';
import { LAENDER, LAND_CODES, fitOf, labelOf } from '../src/laender.ts';
import { UNITS } from '../src/units.ts';

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

test('Bayern reads Vokal and Konsonant, and a tapped answer still counts', () =>
  withApp(async (newPage) => {
    const page = await open(newPage, 'tutorial-vokal-by');
    const text = () => page.evaluate(() => document.querySelector('#app').textContent);
    assert.match(await text(), /Vokal oder Konsonant/);
    await page.click('#tutok');
    // the task keeps the Saxon words, the screen shows the Bavarian ones
    const answer = await page.evaluate(() => window.__task.answer);
    const shown = { Selbstlaut: 'Vokal', Mitlaut: 'Konsonant' }[answer] || answer;
    await page.click(`.opt:text-is("${shown}")`);
    assert.ok(await page.isVisible('.feedback.good'), 'the right option is right');
    assert.doesNotMatch(await text(), /Selbstlaut|Mitlaut/);
    const gloss = await open(newPage, 'tutorial-gloss-by');
    assert.match(await gloss.textContent('#tutgloss'), /Satzkern/);
  }));

// Every profile (13 states and none), set through the picker: the title of each grade and the parent area show the
// state's subject names, offer no state whose plan was not read, and never claim a check that did not happen
const WORDS_OF = /Thüringen|Bremen|Saarland/;
// a sentence about checking or expertise must say that it did not happen
const CLAIM = /geprüft|Expert|Lehrkr|Fachleute/;
const claims = (text) =>
  text
    .split(/(?<=[.!?:])\s+/)
    .filter((s) => CLAIM.test(s) && !/\bnicht\b|\bkein/.test(s))
    .map((s) => s.slice(0, 120));

test('every state: titles, subject names, parent area and picker', { concurrency: 4 }, (t) =>
  withApp(async (newPage) => {
    // the accessibility check: every page without a state, and the parent area and title of Klasse 3 with each state
    const profile = async (code) => {
      const problems = [];
      const axe = async (page, at) => {
        const { violations } = await new AxeBuilder({ page }).analyze();
        for (const { id, impact } of violations)
          if (impact === 'serious' || impact === 'critical') problems.push(`${at}: ${id}`);
      };
      const name = code || 'none';
      const page = await newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      await page.evaluate(() =>
        localStorage.setItem('mathquest_meta_v2', JSON.stringify({ setup: { done: false, skipped: true, at: 'x' } })),
      );
      await page.reload();
      const text = () => page.evaluate(() => document.querySelector('#app').innerText);
      const look = async (at, allowLater) => {
        const t = await text();
        if (WORDS_OF.test(allowLater ? t.replace(ELTERN.LAND.later, '') : t))
          problems.push(`${at}: names a state not offered`);
        for (const s of claims(t)) problems.push(`${at}: claims „${s}“`);
      };
      await visit(page, ['#parents', '[data-pt="practice"]', '#pland']);
      await look(`${name} picker`, true);
      if (!code) await axe(page, 'picker');
      const offered = await page.$$eval('[data-land]', (bs) => bs.map((b) => b.dataset.land));
      if (offered.join() !== ['', ...LAND_CODES].join()) problems.push(`picker offers ${offered}`);
      await page.click(`[data-land="${code}"]`);
      const note = await page.$$eval('.pnote', (ps) => ps.map((p) => p.textContent).join('\n'));
      const all = Object.keys(UNITS).every((unit) => fitOf(code, unit) !== 'offen');
      const claim = !code || code === 'SN' ? ELTERN.LAND.base : ELTERN.LAND.claim(LAENDER[code].name, all);
      if (!note.includes(claim) || !/Eine Lehrkraft hat (die Inhalte|das) nicht geprüft/.test(note))
        problems.push(`${name}: the claim paragraph is missing`);
      for (const { grade, subjects } of CURRICULUM) {
        if (await page.isVisible(`.chip[data-grade="${grade}"]`)) await page.click(`.chip[data-grade="${grade}"]`);
        const at = `${name} Klasse ${grade}`;
        const listed = await page.$$eval('.pnav[data-pf] b', (bs) => bs.map((b) => b.textContent.trim()));
        const want = subjects.map((s) => labelOf(code, s.subject));
        if (listed.join() !== want.join()) problems.push(`${at} parent area: ${listed}, expected ${want}`);
        await look(`${at} parent area`);
        if (grade === 3) await axe(page, `${at} parent area`);
        for (let i = 0; i < subjects.length; i++) {
          await page.click(`[data-pf="${i}"]`);
          const head = await text();
          // a subject with one unit shows that unit at once, under the unit's name
          if (subjects[i].modes.length > 1 && !head.includes(labelOf(code, subjects[i].subject, true)))
            problems.push(`${at} ${subjects[i].subject}: not named ${labelOf(code, subjects[i].subject, true)}`);
          await look(`${at} ${subjects[i].subject}`);
          if (grade === 3 && !code) await axe(page, `${at} ${subjects[i].subject}`);
          await page.click('#pback');
        }
      }
      await page.click('#back');
      for (const { grade } of CURRICULUM) {
        if (await page.isVisible(`.chip[data-grade="${grade}"]`)) await page.click(`.chip[data-grade="${grade}"]`);
        const at = `${name} title Klasse ${grade}`;
        const shown = await page.$$eval('[data-sub] .subjname', (ss) => ss.map((s) => s.textContent));
        const want = (await page.evaluate(() => window.__mq.land.visSubjects().map((s) => s.subject))).map((s) =>
          labelOf(code, s),
        );
        if (!shown.length || shown.join() !== want.join()) problems.push(`${at}: ${shown}, expected ${want}`);
        await look(at);
        if (grade === 3 || !code) await axe(page, at);
      }
      problems.push(...errors.map((e) => `${name}: ${e}`));
      await page.context().close();
      assert.deepStrictEqual(problems, []);
    };
    await Promise.all(['', ...LAND_CODES].map((code) => t.test(code || 'none', () => profile(code))));
  }),
);

// tests/fixtures/save-before-bundesland.json is what the build of a30e2b7, the last one without the Bundesland,
// saved for a child with a Zahlenquest adventure in a fight, a Wörterwerkstatt adventure on its map, practice in
// task types that some states hide or switch off, and parents who hid a unit and switched off task types
const OLD = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'fixtures/save-before-bundesland.json'), 'utf8'));

test('a save from before the Bundesland keeps everything, through every state and back', () =>
  withApp(async (newPage) => {
    const page = await newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.evaluate((all) => {
      localStorage.clear();
      for (const [k, v] of Object.entries(all)) localStorage.setItem(k, v);
    }, OLD);
    await page.reload();
    const stored = () =>
      page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])));
    const old = JSON.parse(OLD.mathquest_meta_v2);
    const practised = Object.entries(old.stats).flatMap(([unit, types]) =>
      Object.keys(types)
        .filter((k) => types[k].t > 0)
        .map((k) => [unit, k]),
    );
    const units = [...new Set([...practised.map(([unit]) => unit), ...Object.keys(old.started), 'wiese'])];
    // the first save after loading adds the task types and units that came later, and nothing else changes
    const loaded = await page.evaluate((old) => window.__mq.normMeta(old), old);
    for (const [unit, k] of practised) assert.deepStrictEqual(loaded.stats[unit][k], old.stats[unit][k]);
    const KEPT = ['stats', 'stamps', 'dex', 'know', 'level', 'started', 'hidden', 'off', 'grade', 'seenTut', 'weekly'];
    const check = async (at) => {
      const now = await stored();
      for (const k of ['mathquest_run_v1', 'mathquest_run_woerterwerkstatt'])
        assert.equal(now[k], OLD[k], `${at}: ${k} changed`);
      const meta = JSON.parse(now.mathquest_meta_v2);
      const want = now.mathquest_meta_v2 === OLD.mathquest_meta_v2 ? old : loaded;
      for (const k of KEPT) assert.deepStrictEqual(meta[k], want[k], `${at}: ${k} changed`);
      const seen = await page.evaluate(
        ([practised, units]) => {
          const L = window.__mq.land;
          return {
            hidden: units.filter((unit) => !L.shown(unit)),
            off: practised.filter(([unit, k]) => L.offList(unit).includes(k)).map((x) => x.join('.')),
            minus: L.minusMethod(),
            rund: L.offList('math').includes('rund'),
            steig: L.offList('satzbaustelle').includes('steig'),
          };
        },
        [practised, units],
      );
      assert.deepStrictEqual(
        seen,
        { hidden: ['wiese'], off: [], minus: 'erg', rund: true, steig: true },
        `${at}: what the child practised or the parents chose`,
      );
    };
    assert.ok(!(await page.isVisible('#setpin')), 'not sent back to the first start');
    const meta = await page.evaluate(() => window.__mq.meta);
    assert.equal(meta.land, '');
    assert.equal(meta.minus, 'erg', 'a child from before keeps Ergänzen');
    await check('loaded');
    for (const code of [...LAND_CODES, '']) {
      await page.evaluate((code) => window.__mq.land.set(code), code);
      await check(code || 'none');
    }
    // both adventures go on
    await page.evaluate(() => window.__mq.screenTitle());
    await visit(page, ['[data-sub="0"]', '[data-cont="math"]']);
    assert.ok(await page.isVisible('.atk, .node:not([disabled])'), 'Zahlenquest goes on');
    await page.evaluate(() => window.__mq.screenTitle());
    await visit(page, ['[data-sub="1"]', '[data-cont="woerterwerkstatt"]', '.node:not([disabled])']);
    assert.ok(await page.isVisible('.atk'), 'Wörterwerkstatt goes on into a fight');
    assert.deepStrictEqual(errors, []);
  }));
