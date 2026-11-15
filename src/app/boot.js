import { MJ } from '../jahrmarkt.js';
import { MK } from '../knowledge.js';
import { MQ } from '../logic.js';
import { normMeta } from '../save.ts';
import { TEXTE } from '../texte.js';
import { TW } from '../turm.js';
import { UNITS } from '../units.js';
import { importFromLink, mergeMeta, packSave, unpackSave } from './backup.js';
import { RECIPES, craft, screenTop, screenWardrobe } from './huette.js';
import { screenMap } from './map.js';
import { recordAnswer, weeklyGoals } from './progress.js';
import { state } from './state.js';
import { saveAll } from './storage.js';
import { screenTitle, subjectOf } from './title.js';
import { screenTurm, screenTurmBoard, turmLines } from './turm_screens.js';
import {
  accName,
  loadTurm,
  startTurm,
  turmAnswer,
  turmAsk,
  turmBlocked,
  turmBuy,
  turmEliteText,
  turmGateText,
  turmNextWave,
  turmRetry,
  turmReward,
  turmStep,
} from './turm.js';

if (navigator.storage && navigator.storage.persist && !state.meta.storage.persisted)
  navigator.storage
    .persist()
    .then((ok) => {
      if (ok) {
        state.meta.storage.persisted = true;
        saveAll();
      }
    })
    .catch(() => {});
screenTitle();
importFromLink();
// turm: the rules without the screens, for the page tests; modules: what the tests look up by name in the page
window.__mq = {
  modules: { MQ, MK, MJ, TEXTE, UNITS },
  get run() {
    return state.run;
  },
  normMeta,
  turm: {
    TW,
    start: startTurm,
    resume: () => (state.run = loadTurm()),
    ask: turmAsk,
    answer: turmAnswer,
    step: turmStep,
    reward: turmReward,
    buy: turmBuy,
    nextWave: turmNextWave,
    retry: turmRetry,
    screen: screenTurm,
    board: (o) => screenTurmBoard(o || {}),
    motion: (speed) => {
      state.turmSpeed = speed == null ? null : speed;
    },
    say: {
      lines: (ev, names) => turmLines(ev, names).all,
      elite: turmEliteText,
      blocked: turmBlocked,
      gate: turmGateText,
      acc: accName,
    },
  },
  subjectOf,
  recordAnswer,
  get meta() {
    return state.meta;
  },
  get mode() {
    return state.mode;
  },
  screenMap,
  screenTitle,
  packSave,
  unpackSave,
  mergeMeta,
  weeklyGoals,
  screenWardrobe,
  screenTop,
  RECIPES,
  craft,
};
