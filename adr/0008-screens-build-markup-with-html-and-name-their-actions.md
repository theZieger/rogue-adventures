# Screens build markup with html and name their actions

A screen builds its markup with the `html` template (`src/ui/html.ts`), which escapes everything it is given, and
hands it to `screen(markup, actions)` (`src/app/ui.ts`) together with what a tap does: `data-action="send"` on an
element calls `actions.send`. One listener on the page serves every screen. Before, a screen wrote a string, had
to remember `esc()` at each value, and after every render looked its buttons up by id to set `onclick` again; the
back button knew a list of ids by heart.

The feedback screen is written this way and is the example to copy. The other screens still use `render()` with
strings and `onclick`, which keeps working beside it. A screen moves over when it is changed anyway, in the same
pull request, with its screenshots unchanged; a rewrite of all screens at once would risk the save and the tests
for no change a child can see. Ids stay on elements the tests and the back button look for.
