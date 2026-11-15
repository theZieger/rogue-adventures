# The game engine is one function, kept in parts

`src/app/*.js` are not modules: `tools/build.js` joins them in the order of `APP` inside one function, so every part sees
the same state (`meta`, `run`, `mode`) and the same helpers. `app.js` was split this way because one 350 KB file
could no longer be read or reviewed, while giving each screen a real interface would have meant passing that state
through hundreds of calls with nothing varying across the seam. A part earns a real interface only when it can live
without that state, as the Turmwacht rules (`src/turm.js`) and the save code (`src/savecode.js`) already do; until
then a part is a place to find things, and the order in `APP` matters only for values computed while the page loads.
