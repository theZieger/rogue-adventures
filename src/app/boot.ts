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
import { heroAttacks, recordAnswer, weeklyGoals } from './progress.ts';
import { state } from './state.ts';
import {
  enabledMods,
  minusMethod,
  offList,
  saveAll,
  setLand,
  setOn,
  shown,
  subjectLabel,
  visSubjects,
} from './storage.ts';
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
declare global {
  interface Window {
    // now: the page tests move the garden's clock with it
    __mq: { now?: number; [hook: string]: unknown };
  }
}
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
    board: (o?: Parameters<typeof screenTurmBoard>[0]) => screenTurmBoard(o || {}),
    motion: (speed: number | null) => {
      state.turmSpeed = speed == null ? null : speed;
    },
    say: {
      lines: (ev: Parameters<typeof turmLines>[0], names: Parameters<typeof turmLines>[1]) => turmLines(ev, names).all,
      elite: turmEliteText,
      blocked: turmBlocked,
      gate: turmGateText,
      acc: accName,
    },
  },
  subjectOf,
  // the Bundesland: what the profile tests ask and set
  land: { set: setLand, setOn, shown, offList, enabledMods, heroAttacks, minusMethod, subjectLabel, visSubjects },
  set mode(m: string) {
    state.mode = m;
  },
  set run(r: typeof state.run | null) {
    state.run = r;
  },
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
