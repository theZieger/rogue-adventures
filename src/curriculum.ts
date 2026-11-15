// What the title screen and the save are built from: every unit in a fixed order, the subjects, and the grades with
// their subjects and units.
import { UNITS } from './units.ts';

import type { GenOpts, Know, Question, Sequence } from './knowledge.ts';
import type { Task, Tutorial } from './logic.ts';
import type { Experiment } from './sachkunde.ts';

// one attack of a hero: its name and the task type it asks
export interface Attack {
  name: string;
  mod: string;
}
// a monster to start with; names: one per evolution. Its id is stored in saves.
export interface Starter {
  id: string;
  type: string;
  shape: string;
  names: string[];
  hp: number;
  desc: string;
  perk?: string; // 'crit', 'tank' or 'heal'
  attacks: Attack[];
}
// an opponent; acc: its name in the accusative, where that differs. Its name is stored in saves.
export interface Foe {
  name: string;
  acc?: string;
  type: string;
  shape: string;
  hp: number;
  atk: number;
  boss?: boolean;
}
// the opponents of one world
export interface Foes {
  normal: Foe[];
  elite: Foe;
  boss: Foe;
}
// what an event hands out or takes
export interface Effect {
  hp?: number;
  maxhp?: number;
  item?: string;
  holz?: number;
  xp?: number;
}
// with a task: win or lose; without: effect (in a dilemma the event's reward) and what to think about
export interface EventOpt {
  label: string;
  task?: string;
  g?: string;
  win?: Effect;
  lose?: Effect;
  effect?: Effect;
  then?: string;
  think?: string;
}
// w = only in that world
export interface GameEvent {
  title: string;
  text: string;
  opts: EventOpt[];
  w?: number;
  dilemma?: boolean;
  reward?: Effect;
}
// a page of the child's notes, shown under the tutorial and as a tip
export interface Note {
  title: string;
  lines: string[];
  fig?: string;
}
// a task type of a unit; worldCap: the highest tier per world (0 = not in that world), dmg: what a right answer hits for
export interface TaskType {
  name: string;
  icon: string;
  worldCap: number[];
  maxTier: number;
  dmg: number;
  shop?: boolean; // only in the Kaufladen, never an attack
  atk?: string; // Klasse 1/2: the name of its attack (becomes `extra`)
}
// A unit (Thema) as its file registers it. The first block is what every unit has; the rest only some.
export interface Unit {
  title: string;
  icon: string;
  sub: string;
  grade: number;
  subject: string;
  rank?: number; // orders the units of a subject from easy to hard
  worlds: number;
  modules: Record<string, TaskType>;
  starters: Starter[];
  enemies: Record<string, Foes>; // by world, from 1
  moves: string[]; // names of the opponents' attacks
  extra: Record<string, string>; // per task type: the name of the attack that is learned later or swapped in
  events: GameEvent[];

  // knowledge units: the questions, things to put in order, and the unit's own task types (null: not one of them)
  pool?: Question[];
  order?: Sequence[];
  byWorld?: boolean; // questions and orders carry their world in `w`
  gen?: (mod: string, tier: number, know: Know, seq: number, opts?: GenOpts) => Task | null | undefined;
  tut?: Record<string, Tutorial>; // by tutorial group, e.g. 'wissen:1'
  notes?: Record<string, Note>;
  // number units other than Zahlenquest: tasks and tutorials by task type and tier
  numGen?: (mod: string, tier: number, opts?: { elite?: boolean; zero?: boolean; g?: string }) => Task;
  numTut?: Record<string, Record<number, Tutorial>>;
  worldAttacks?: Record<number, Attack[]>; // the hero's attacks change with the world
  school?: boolean | string | string[]; // Zeichenschule: the picture(s) to draw
  swap?: { from: string; to: string }; // one node of type `from` per world becomes a `to`
  mine?: boolean; // a treasure can become a Bergwerk
  labor?: () => Experiment[]; // the experiments of its Forscherlabor
  speakOptions?: boolean; // false: the options are not read aloud
  noLetters?: boolean; // single letters are not read aloud
}
export type Subject = keyof typeof SUBJECTS;

export const MODES: Record<string, Unit> = UNITS;

// the Monsterbuch and the hero lists keep this order; new units follow in the order they register
const FIRST = [
  'math',
  'bau',
  'ethik',
  'kirchenjahr',
  'kartoffel',
  'woerterwerkstatt',
  'satzbaustelle',
  'kornkammer',
  'wetterstation',
  'kompass',
  'freunde',
  'jahrmarkt',
  'wiese',
  'frueher',
  'sinne',
  'verkehr',
  'musik',
  'ichwelt',
  'teestube',
  'doppeldecker',
];
export const MODE_KEYS = FIRST.concat(Object.keys(MODES).filter((m) => !FIRST.includes(m)));
// the title screen builds itself from grade and subject of the units; `rank` orders the themes of a subject from easy to hard
export const SUBJECTS = { Mathe: '🔢', Deutsch: '📖', Ethik: '🕊️', Sachkunde: '🌱', Musik: '🎵', Englisch: '💬' };
export const CURRICULUM = [...new Set(MODE_KEYS.map((m) => MODES[m].grade))]
  .sort((a, b) => a - b)
  .map((grade) => ({
    grade,
    label: 'Klasse ' + grade,
    subjects: (Object.keys(SUBJECTS) as Subject[])
      .map((subject) => ({
        subject,
        icon: SUBJECTS[subject],
        modes: MODE_KEYS.filter((m) => MODES[m].grade === grade && MODES[m].subject === subject).sort(
          (a, b) => (MODES[a].rank || 0) - (MODES[b].rank || 0),
        ),
      }))
      .filter((x) => x.modes.length),
  }));
