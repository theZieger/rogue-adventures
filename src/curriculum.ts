// What the title screen and the save are built from: every unit in a fixed order, the subjects, and the grades with
// their subjects and units.
import { UNITS } from './units.js';

export interface TaskType {
  name: string;
  icon: string;
  worldCap: number[];
  shop?: boolean;
}
export interface Unit {
  grade: number;
  subject: string;
  rank?: number;
  worlds: number;
  modules: Record<string, TaskType>;
  starters: { id: string }[];
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
