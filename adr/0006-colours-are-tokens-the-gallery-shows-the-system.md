# Colours are tokens, the gallery shows the system

Every colour of the stylesheets is a custom property in `src/styles/tokens.css`: a palette (`--navy-800`,
`--gold-400` …) and, on top of it, names for what a colour is for (`--ink`, `--card`, `--focus` …). Rules use these;
Stylelint fails a hex value anywhere else. Before, 84 colours were spread over one 6,000-line file with nineteen of
them named, so the same green existed in three spellings and nothing said which were meant to be the same.
`docs/gallery.html` (built with the game) shows the palette, the purposes and every building block with the
classes the screens use; it is in the screenshot list and the accessibility check, so a change to a shared class
shows up there first.

Deliberately not done here, because each would change what a child sees and needs before-and-after approval:
one scale for font sizes (31 values today), radii and spacing; cascade layers (the files of `src/styles/` are joined
in the order of `STYLES` in `tools/build.js`, and later files still win by order); and colours written inside drawings
and inline styles in `src/app/`.
