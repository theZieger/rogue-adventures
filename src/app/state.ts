// What the engine parts share and change: the save (meta), the running adventure (run), the unit on screen (mode)
// and what several screens set. Everything else a part needs it imports.
import { KEY_META, load, type Meta, normMeta } from '../save.ts';

// The running adventure or Turmwacht. Screens that belong to one rely on it being there; it is null on the title.
// Its shape is still only written down in the code that builds it (startRun, startTurm).
// biome-ignore lint/suspicious/noExplicitAny: typed when the adventure's rules leave the screens
export type Run = any;

interface State {
  meta: Meta;
  run: Run;
  mode: string;
  // physical keyboard while a number task is open
  keyHandler: ((event: KeyboardEvent) => void) | null;
  // what the device's back button does on this screen, if not the screen's own „Zurück“
  backTo: (() => void) | null;
  depth: number;
  duel: Run;
  turmMode: string | null;
  turmSpeed: number | null;
}

export const state: State = {
  meta: normMeta(load(KEY_META, null)),
  run: null,
  mode: 'math',
  keyHandler: null,
  backTo: null,
  depth: 0,
  duel: null,
  turmMode: null,
  turmSpeed: null,
};
