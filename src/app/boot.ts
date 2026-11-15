import { MJ } from '../jahrmarkt.ts';
import { MK } from '../knowledge.ts';
import { MQ } from '../logic.ts';
import { normMeta } from '../save.ts';
import { TEXTE } from '../texte.ts';
import { TW } from '../turm.ts';
import { UNITS } from '../units.ts';
import { importFromLink, mergeMeta, packSave, unpackSave } from './backup.ts';
import { RECIPES, craft, screenTop, screenWardrobe } from './huette.ts';
import { screenMap } from './map.ts';
import { recordAnswer, weeklyGoals } from './progress.ts';
import { state } from './state.ts';
import { saveAll } from './storage.ts';
import { screenTitle, subjectOf } from './title.ts';
import { screenTurm, screenTurmBoard, turmLines } from './turm_screens.ts';
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
} from './turm.ts';

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
