# ES modules, bundled into the one HTML file

The files of `src/` are ES modules that import what they use; `tools/build.js` lets esbuild bundle them into one
classic script inside `docs/index.html`. This replaces [0001](0001-one-html-file-without-a-bundler.md), which
kept every file as a global and the load order as a list in the build: that list, a second one in `src/units.ts`
and a Node-or-browser switch at the top of every file were three places to keep in step, and nothing could tell
which file used which. What 0001 wanted stays true: the page is one file with no runtime dependency, runs offline
and from `file://`, and a test imports a content file directly. The price is one build dependency (esbuild) and
that the shipped script is no longer the source text. The order of the units on screen is the order of the imports
in `src/units.ts`. The engine parts of `src/app/` are still joined into one function
([0002](0002-the-game-is-one-function-in-parts.md)).
