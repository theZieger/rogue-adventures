// What the engine parts share and change: the save (meta), the running adventure (run), the unit on screen (mode)
// and what several screens set. Everything else a part needs it imports.
import type { Attack } from '../curriculum.ts';
import type { Task } from '../logic.ts';
import { KEY_META, load, type Meta, normMeta } from '../save.ts';
import type { Enemy } from './battle.ts';
import type { Duel } from './duell.ts';
import type { MapNode } from './map.ts';
import type { Lab, Mine } from './nodes.ts';
import type { Run as TurmRun } from './turm.ts';

// A running adventure in one unit, as startRun (map.ts) builds it and loadRun (storage.ts) checks it. It is saved as it
// is, so fields are only ever added: the optional ones are missing in older saves or until they are first needed.
export interface Adventure {
  mode: string; // the unit
  world: number; // from 1
  floor: number; // from 1; one past the map's last floor between two worlds
  map: MapNode[][]; // the floors of this world
  path: number[]; // per floor passed: the index of the node taken
  hero: {
    id: string; // a starter of the unit
    evo: number; // 0 to 2
    level: number;
    xp: number;
    hp: number;
    maxHp: number;
    attacks: Attack[];
  };
  items: string[]; // the bag: keys of ITEMS
  tiers: Record<string, number>; // per task type: the level of its tasks
  shield: boolean; // the next hit is blocked
  power?: boolean; // the next attack hits twice as hard
  hint?: boolean; // the next task shows a tip
  node?: RunNode | null; // the place the hero is at; null on the map
  used?: Record<string, number>; // per task type: attacks made (the weak spot prefers the least used)
  recent?: Record<string, string[]>; // per task type: the last tasks, so they don't repeat
  right?: number; // right answers that have not paid a Stempel yet
  answered?: number;
  solved?: number;
  wb?: boolean; // the week's boss is on this adventure's map
  over?: boolean; // ended: never saved again
}
// The place the hero is at, saved so a reload opens it as it was. Every place has a type; the rest belongs to
// the screen of that type.
export interface RunNode {
  type: MapNode['t'];
  done?: boolean;
  // fights
  enemy?: Enemy | null;
  reward?: boolean; // elite beaten, reward not picked yet
  text?: number; // Lesestube: index in TEXTE
  // event: index in the unit's events, the option taken, what it did
  ev?: number;
  opt?: number;
  lines?: string[];
  // treasure: two items and a task type to learn, the part of a Kreisel found in it
  chest?: [string, string, string | null];
  part?: string;
  mine?: Mine;
  lab?: Lab;
  // Kaufladen: the customers, the one being served, wrong tries with that one, the gifts to choose from
  cust?: { who: string; ware: string; price: number; paid: number }[];
  i?: number;
  tries?: number;
  gifts?: string[];
  // Schatzkarte: the task open and the tries used; found = the treasure is dug up
  hunt?: { tries: number; task: Task | null };
  found?: boolean;
}
// What state.run reads as. The one slot holds an adventure, a Turmwacht run (mode 'turm') or null on the title, and
// takes any of the three. A screen belongs to one kind of run and only exists while that run does, so it reads the
// slot without asking: as there, and with the fields of both kinds. Code that can meet the other kind or none
// (saving, the task screen, the top bar) checks `state.run` and `state.run.mode === 'turm'` first.
export type Run = Adventure & TurmRun;

interface State {
  meta: Meta;
  get run(): Run;
  set run(run: Adventure | TurmRun | null);
  mode: string;
  // physical keyboard while a number task is open
  keyHandler: ((event: KeyboardEvent) => void) | null;
  // what the device's back button does on this screen, if not the screen's own „Zurück“
  backTo: (() => void) | null;
  depth: number;
  // as run: null outside a duel, and the duel's screens read it as there
  get duel(): Duel;
  set duel(duel: Duel | null);
  turmMode: string | null;
  turmSpeed: number | null;
}

export const state: State = {
  meta: normMeta(load(KEY_META, null)),
  run: null!,
  mode: 'math',
  keyHandler: null,
  backTo: null,
  depth: 0,
  duel: null!,
  turmMode: null,
  turmSpeed: null,
};
