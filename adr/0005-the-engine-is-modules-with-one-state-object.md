# The engine is modules with one state object

The files of `src/app/` are ES modules: each imports what it uses and exports what others use, and `src/main.js`
lists them in the order they start. The few variables that several of them assign (the save `meta`, the running
adventure `run`, the unit on screen `mode`, and a handful of screen flags) are properties of one object, `state`
in `src/app/state.js`. This replaces [0002](0002-the-game-is-one-function-in-parts.md), where the parts were joined
into one function so that all of them saw the same variables: nothing showed which part used or changed what, and no
tool could check a name. Now a missing import fails the lint, and "who changes the adventure" is a search for
`state.run =`. The modules still import each other in circles (a screen opens another screen); that is fine for
functions, and code that runs while a module loads may only use what `src/main.js` has loaded before it. Giving
screens narrower interfaces is a later step and no longer needs a rewrite to start.
