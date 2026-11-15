# Colours are tokens, the gallery shows the system

Every colour of the stylesheets is a custom property in `src/styles/tokens.css`: a palette (`--navy-800`,
`--gold-400` …) and, on top of it, names for what a colour is for (`--ink`, `--card`, `--focus` …). Rules use these;
Stylelint fails a hex value anywhere else. Before, 84 colours were spread over one 6,000-line file with nineteen of
them named, so the same green existed in three spellings and nothing said which were meant to be the same.
`docs/gallery.html` (built with the game) shows the palette, the purposes and every building block with the
classes the screens use; it is in the screenshot list and the accessibility check, so a change to a shared class
shows up there first.

Font sizes, corner radii and the space in and between things are tokens too (`--text-15`, `--radius-14`,
`--space-8`), and Stylelint fails a pixel value for a font size or a radius. These lists record what the screens
had: 31 text sizes, 14 radii, 18 spaces. Shortening them to a real scale changes what a child sees, so it is decided
with before-and-after pictures; from now on it is an edit of `tokens.css` and nothing else.

The stylesheets sit in two cascade layers, `tokens` and above it `app` (`tools/build.js`). Inside `app` the order of
`STYLES` still decides between equally specific rules, exactly as before; finer layers would change which rule
wins in places no test looks at. A sheet outside the layers, like the gallery's own, wins without a specificity fight.

Still open: colours written inside drawings and inline styles in `src/app/`.
