// What the engine parts share and change: the save (meta), the running adventure (run), the unit on screen (mode)
// and what several screens set. Everything else a part needs it imports.
export const state = {
  meta: undefined,
  run: null,
  mode: 'math',
  keyHandler: null,
  backTo: null,
  depth: 0,
  duel: null,
  turmMode: null,
  turmSpeed: null,
};
