# Short scales, roles, and one building block per job

`adr/0006` made every colour and size a token but kept the lists as long as the screens had grown them: 84
colours (55 used once), 31 text sizes, 14 radii, 18 spaces, and nothing for shadows, line widths, durations or
see-through colours. The gallery showed 74 of 471 classes. That recorded the design; it did not decide it.

Now `src/styles/tokens.css` holds decisions:

- **Palette:** 35 colours, one ramp per hue. Rules use **roles** (`--ink`, `--card`, `--gold` …) and **tones**, a
  light ground with its dark ink (`--good-tint`/`--good-ink`, and the same for `bad`, `warn`, `hot`, `info`).
  A palette step appears in a rule only for a drawing (coins, maps, the Turmwacht board).
- **Scales:** 10 text sizes, 4 line heights, 5 radii, 8 spaces, 3 line widths, 2 tap sizes, 7 durations, one bounce
  curve, 3 lip shadows and 3 rings. A value between two steps is not added; the nearer step is used.
- **See-through colours** are tokens (`--glass`, `--shade`, `--overlay` …) or `color-mix()` of a role, never `rgba()`.

One building block per job replaced the look-alikes: `pill` (was nine badge and tag classes), `chip` (grade chips,
parent filters and toggles), `bar` (three progress bars), `callout` (two hint boxes), one rule each for the round
helper buttons and the glass buttons of the title screen, and a button that lies flat and grey when it cannot be
tapped instead of fading.

Three things keep it from drifting. Stylelint fails a hex or `rgb()` colour, a pixel value in font, radius, border,
gap and padding, a raw transition time, a font family or weight outside the tokens. `tests/test_design.js` fails when
a scale grows past its limit, a token is unused, or a shared block has no specimen in the gallery. And the gallery
states the rule for each block next to it, with the number of uses beside every token.

Two exceptions, on purpose. Inside the Turmwacht board lengths are board units (`--u`), because the board is a
drawing that grows with the screen. And the fight choreography of Turmwacht and Kreisel keeps its own animation
times, which are tuned to the sounds; transitions everywhere use the duration tokens.

Still open: colours inside drawings in `src/app/` and `src/monsters.ts`.
