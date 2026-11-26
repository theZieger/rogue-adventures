// Every Bundesland × every unit, at the level a fight needs: for each of the 14 profiles (13 states and none),
// every unit a child of that state can see, in every world, with every starter: four attacks from task types that
// are on, and a task of every task type that is on, at every tier the world allows, drawn as a fight draws it.
// The bot plays one unit per state in tests/playtests.js; playing all of them would take minutes.
import { test } from 'node:test';
import assert from 'node:assert';
import { LAENDER, LAND_CODES, labelOf } from '../src/laender.ts';
import { UNITS } from '../src/units.ts';
import { open } from './page.js';

const SAXON_WORDS = /Selbstlaut|Mitlaut/;

test('every state: every visible unit, world, task type and tier makes a task that shows', async () => {
  const p = open(
    { mathquest_meta_v2: JSON.stringify({ setup: { done: false, skipped: true, at: 'x' } }) },
    { seed: 7 },
  );
  const { meta, land } = p.w.__mq;
  const container = p.d.createElement('div'),
    bottom = p.d.createElement('div');
  // inside #app, where shown text is reworded for the state
  p.d.querySelector('#app').replaceChildren(container, bottom);
  const fails = [];
  const fail = (msg) => fails.length < 40 && fails.push(msg);
  let tasks = 0;
  for (const code of ['', ...LAND_CODES]) {
    meta.land = code;
    const visible = new Set();
    for (const grade of [1, 2, 3]) {
      meta.grade = grade;
      for (const { subject, modes } of land.visSubjects()) {
        if (land.subjectLabel(subject) !== labelOf(code, subject))
          fail(`${code}: ${subject} is not shown as labelOf says`);
        for (const unit of modes) visible.add(unit);
      }
    }
    const hides = (LAENDER[code]?.hide || []).slice().sort();
    const hidden = Object.keys(UNITS)
      .filter((unit) => !visible.has(unit))
      .sort();
    if (hidden.join() !== hides.join()) fail(`${code || 'none'}: hidden are ${hidden}, the profile hides ${hides}`);
    for (const unit of visible) {
      const cfg = UNITS[unit];
      p.w.__mq.mode = unit;
      for (let world = 1; world <= cfg.worlds; world++) {
        for (const starter of cfg.starters) {
          p.w.__mq.run = {
            mode: unit,
            world,
            tiers: {},
            hero: { attacks: (cfg.worldAttacks || {})[world] || starter.attacks },
          };
          const on = land.enabledMods(),
            mods = land.heroAttacks().map((attack) => attack.mod);
          const key = `${code || 'none'} ${unit}:${starter.id} world ${world}`;
          if (on.length < 2) fail(`${key}: only ${on} on`);
          if (on.some((k) => land.offList(unit).includes(k))) fail(`${key}: a switched-off task type is on`);
          if (mods.length !== 4 || mods.some((k) => !on.includes(k))) fail(`${key}: attacks ${mods}, on are ${on}`);
          if (new Set(mods).size < Math.min(4, on.length)) fail(`${key}: attacks ${mods} repeat while ${on} are on`);
        }
        for (const mod of land.enabledMods()) {
          const M = cfg.modules[mod];
          const top = Math.min(
            M.maxTier || Number.POSITIVE_INFINITY,
            M.worldCap[Math.min(world, M.worldCap.length) - 1],
          );
          for (let tier = 1; tier <= top; tier++) {
            const at = `${code || 'none'} ${unit}.${mod} world ${world} tier ${tier}`;
            try {
              const task = land.makeTask(mod, tier);
              task.mod = task.mod || mod;
              container.textContent = '';
              bottom.textContent = '';
              land.runTask(task, { container, bottom }, () => {});
              await null;
              const shown = container.textContent + bottom.textContent;
              tasks++;
              if (!shown.trim()) fail(`${at}: nothing on screen`);
              if (/undefined|NaN|\[object/.test(shown)) fail(`${at}: shows ${shown.slice(0, 120)}`);
              if (['BY', 'NI'].includes(code) && SAXON_WORDS.test(shown)) fail(`${at}: Selbstlaut or Mitlaut shown`);
            } catch (e) {
              fail(`${at}: ${e.message}`);
            }
          }
        }
      }
    }
  }
  p.w.__mq.run = null;
  fails.push(...p.errors.map((e) => `page error: ${e}`));
  p.close();
  console.log(`${tasks} tasks drawn`);
  assert.deepStrictEqual(fails, []);
});
