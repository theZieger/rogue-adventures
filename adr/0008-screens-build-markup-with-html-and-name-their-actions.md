# Screens build markup with html and name their actions

A screen builds its markup with the `html` template (`src/ui/html.ts`), which escapes everything it is given, and
hands it to `screen(markup, actions)` (`src/app/ui.ts`) together with what a tap does: `data-action="send"` on an
element calls `actions.send`. One listener on the page serves every screen. Before, a screen wrote a string, had
to remember `esc()` at each value, and after every render looked its buttons up by id to set `onclick` again; the
back button knew a list of ids by heart.

Every screen and dialog is written this way; `src/app/feedback.ts` is the shortest example. They were moved over
in one step, and the proof that nothing changed is a recording: a bot plays all units on a virtual clock and writes
down the page at every step (`TRACE_DIR` in `tests/playtests.js`), and the 5,734 pages were identical before and
after, apart from the new `data-action` attributes. `render()` with a string still exists for the few places that
update a part of a screen in place. Ids stay on elements the tests and the back button look for.

`html` adds nothing for `null`, `undefined` and `false`, so `${shown && html`…`}` works; an attribute that must say
"false" takes `String(flag)`.
