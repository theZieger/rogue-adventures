# Contributing to Lernquest

Lernquest is a German learning app for primary-school children. Code, comments, commit messages and everything
written for developers are in English; everything a child or parent reads is German (the app's text, the learning
content, `CHANGELOG.md`, `README.md`). German words in code are the product's own names from `GLOSSARY.md`
(Turmwacht, Jahrmarkt, Eltern …). Fixes to learning content are as welcome as code.

## Get it running

```bash
npm install          # tools for build and tests only (once after it: npx playwright install chromium)
npm run build        # src/* -> docs/index.html (one file, open it in a browser)
npm test             # generators, knowledge questions, saving and loading (needs the build, about half a minute)
npm run playtest     # a bot plays every unit (the list is in tests/playtests.js) on a virtual clock:
                     # same SEED = same run; TRACE_DIR=folder records every page to compare two states
npm run e2e          # browser tests (Playwright): start without a network, accessibility of every screen
npm run screenshots before   # screenshots of every screen in tools/screens.js; with two folders: what changed
VIEWPORT=1180x820 npm run screenshots tablet   # the same at another size, e.g. a tablet held sideways
npm run typecheck    # tsc, strict, over every .ts file
npm run lint         # Biome (undeclared names) and Stylelint (colours, sizes and spaces only from src/styles/tokens.css)
npm run format       # Biome formats JS, TS, CSS and JSON (CI checks it)
MODE=turm GRADE=3 SUBJECTS=Mathe,Deutsch ACC=0.9 RUNS=1 node tests/playtest.js   # Turmwacht only (SEED=n, NAIVE=1 taps any monster like a child)
```

You need Node 22.22 or newer, nothing else. A pull request must be formatted and pass build, test, playtest
and e2e; CI checks all five.

## Find your way

- „Project structure“ below lists every file and what it holds. `README.md` is the German page for parents.
- `GLOSSARY.md` has the project's words (Einheit, Abenteuer, Aufgabenart …) and their names in the code. Use them.
- `adr/` records the architecture decisions and why they were made.
- `docs/gallery.html` (after a build) shows the design system: every colour and building block. A colour is a
  token in `src/styles/tokens.css`, never a hex value in a rule.
- `src/units.ts` is the one list of units; „Adding a unit“ below explains how to add one.

## Project structure

```
src/styles/        The look (portrait first, built-in number pad, high contrast): tokens.css with every colour, size and
                   space, then one file per area; the order is in `STYLES` (tools/build.js)
src/logic.ts       maths generators, monster and enemy data, the map
src/jahrmarkt.ts   maths unit Der Jahrmarkt (generators; clock, wheel of fortune, scales and charts as SVG)
src/woerter.ts     word lists and sentences for Deutsch – parents can add practice words here (format in the file header)
src/english.ts     words and sentences for Englisch – parents can add their class's words here (format in the file header)
src/texte.ts       Lesestube texts with three questions each (fables, public-domain poems, stories, instructions,
                   a recipe, encyclopedia and factual texts, a legend, jokes, proverbs)
src/knowledge.ts   knowledge content for Ethik, the potato unit, Deutsch and Englisch (questions, Notizkarten, tutorials)
src/ethik.ts       Ethik unit Ich, wir und die Welt (questions, Drei Welten, dilemma cards)
src/sachkunde.ts   Sachkunde units Kornkammer, Wetterstation, Kompass und Karte (questions, pictures, Forscherlabor, Schatzkarte)
src/sachkunde2.ts  Sachkunde units Die fünf Sinne and Sicher im Verkehr (eye, ear, bicycle, traffic signs, crossing, illusions)
src/sachkunde3.ts  Sachkunde units Die Wiese and Früher und heute (questions, plant pictures, meadow layers, dilemma cards)
src/wald.ts        Sachkunde unit Der Wald (questions, forest layers, conifer twigs, tracks, mushroom, dilemma cards)
src/musik.ts       Musik unit Der Konzertsaal (questions, note and bar pictures, instruments, composers)
src/klasse12.ts    grades 1/2: one shared hero with opponents per subject
src/k12_*.ts       grade 1/2 units: Mathe, Deutsch, Sachkunde, Ethik (Musik lives in k12_ethik.ts)
src/turm.ts        Turmwacht rules (waves, guards, floors, Bauzeit, restart from the last Bauzeit), no UI
src/turmart.ts     Turmwacht pictures: lanes, the tower with its floors, card pictures
src/monsters.ts    hand-drawn SVG monsters (drawing code, the game draws them when it shows them)
src/units.ts       the one list of all units (`UNITS`) – game, tests, bot and monster art read it
src/curriculum.ts  order of units, subjects and grades (`MODES`, `MODE_KEYS`, `SUBJECTS`, `CURRICULUM`) with the types `Unit` and `TaskType`
src/save.ts        the save: type `Meta`, defaults, loading/saving and the repair on load (`normMeta`)
src/savecode.ts    save code (shrinking, base 42); src/qr.ts draws the QR code
src/main.ts        entry: loads the engine's parts in the order they start
src/app/           the engine as modules, each importing what it needs. What several parts change (save `meta`,
                   running adventure `run`, unit `mode`) lives in state.ts:
                   core (units, curriculum, icons) · storage (load and repair the save) · progress (levels, stamps,
                   weekly goals) · ui (rendering, back, sounds, tutorials) · tasks (task UI, reading aloud) ·
                   title (title screen, PIN, „Was ist neu?“) · backup (save code) · map (hero choice, map) ·
                   battle (fight, Kreisel-Arena, Lesestube) · nodes (map nodes) · collection (end screens, Monsterbuch,
                   Stempelheft) · huette (Werkbank, Hütte, Kleiderkammer) · duell · turm, turm_screens (Turmwacht) ·
                   garten · elternbereich · feedback · boot
src/sw.js          service worker (offline cache, the version is set at build time)
src/manifest.webmanifest  app manifest (name, colours, icons)
CHANGELOG.md       changes by date, in German – shown in the app under „Was ist neu?“
tools/build.js     builds docs/index.html (one file, bundled with esbuild) + docs/sw.js + docs/manifest.webmanifest
tools/make_icons.js  makes docs/icons/*, docs/favicon.ico, the iOS launch screens docs/splash/* and the install
                   screenshots docs/screenshots/* (needs Playwright with Chromium and ImageMagick; only when the
                   artwork changes, after `npm run build`)
GLOSSARY.md        the project's words and their names in the code
adr/               recorded architecture decisions
lehrplan/          excerpts from the Saxon curricula, in German (research for new grades)
tests/             generator tests + the bot's playthrough (jsdom); page.js loads the built page for the page tests;
                   Turmwacht: test_turm.js (rules + balance table), test_turm_pages.js (screens, save)
docs/index.html    the built app (not committed, CI builds and publishes it)
docs/gallery.html  the design system on one page: every token, building block and rule (built from src/gallery.ts, not committed)
docs/icons/        app icons (Android maskable, iOS, desktop, favicon)
docs/splash/       iOS/iPadOS launch screens
docs/screenshots/  pictures for the install dialog (Android/desktop)
docs/sounds/       sounds (CC0, sources in SOURCES.md)
docs/fonts/        fonts Patrick Hand and Andika (SIL OFL) – self-hosted, no request to Google
```

## Adjusting content

- Plant part names: `PARTS` in `src/knowledge.ts`
- Grain and water cycle: `GRAIN_PARTS`, `CYCLE_PARTS` in `src/sachkunde.ts`; eye, ear and bicycle: `EYE_PARTS`,
  `EAR_PARTS`, `BIKE_PARTS` in `src/sachkunde2.ts`; places in the child's own district: `LANDKREIS` (empty = no
  district tasks)
- Questions: `L_POOL` (Luther), `KJ_POOL` (Kirchenjahr, questions with `w: 2` only in world 2), `F_POOL` (Gute
  Freunde) and `K_POOL` (potato) in `src/knowledge.ts`; dilemma cards in `F_EVENTS`; Ich, wir und die Welt in
  `src/ethik.ts` (`POOL`, things for Drei Welten in `DINGE`, dilemma cards in `EVENTS`)
- German words and sentences: `src/woerter.ts`, English: `src/english.ts` (then `npm run build && npm test`)
- Tiers per world: `worldCap` in `MODULES` (`src/logic.ts`) or `K_MODULES`
- Enemies and balance: `ENEMIES` in `src/logic.ts`, `L_ENEMIES`/`KJ_ENEMIES`/`F_ENEMIES`/`K_ENEMIES` in
  `src/knowledge.ts`
- Kreisel parts and their values: `TOP_PARTS` in `src/logic.ts`
- What parents hide is stored in `meta.hidden` as `grade:<n>`, `extra:<name>` and `en:<theme>`; the Turmwacht
  switch is `meta.turm.on`. The Kaufladen is the map node `markt`.
- Units of a subject that carry a `rank` (Mathe and Englisch in grade 3) are listed from easy to hard on the title
  screen; nothing is ever locked.

## Adding a unit

Every unit carries its grade (`grade`) and subject (`subject`) itself and adds itself to `MK.MODES` (example:
`src/sachkunde3.ts`). `src/units.ts` turns that into the one list `UNITS`: title screen, grade tabs, statistics,
save, bot and monster art read it. To add one: import the new file in `src/units.ts` (the order there is the order
of the units), add the parent texts in `src/eltern.ts`, drawings for hero and opponents in `src/monsters.ts` and
new emojis in `src/icons.ts`. The tests tell you what is missing. A new subject is one line in `SUBJECTS`
(`src/app/core.ts`).

## Publishing (GitHub Pages)

Repository → Settings → Pages → Source „GitHub Actions“. CI (`.github/workflows/ci.yml`) builds on every push to
`main`, tests and publishes `docs/`. The built files `docs/index.html`, `docs/sw.js` and
`docs/manifest.webmanifest` are not committed.

## The feedback form

„Idee senden“ posts the message to a Google Form. To use another form, put its address (up to, not including,
`/viewform`) and the field ID into `FEEDBACK` (`src/app/feedback.ts`). The field ID is in ⋮ → „Get pre-filled
link“ (the part `entry.123456789`). The form must not require sign-in and may have only one required question
(a paragraph).

## Names and copy

`tools/unslop-text.md` and `tools/unslop-visual.md` list the phrases, naming patterns and looks the app avoids
(from an analysis of 40 generated text samples and 20 generated pages). Check new opponents, attacks, items,
messages and designs against them.

## Rules that are not negotiable

- **Saves never break.** Never rename or repurpose a storage key or saved field. Add fields with defaults and cover
  the change in `tests/test_storage.js`.
- **No requests at runtime, no tracking.** The app works offline; files it needs go into `CORE` in `src/sw.js`.
- **No time pressure** in any task, and children see whole numbers (money and lengths excepted).
- **Learning content follows the curriculum** (`lehrplan/`). Say in the pull request where a fact comes from.
- **Copy is about learning, not gaming:** „loslegen“, „üben“, „Thema“, „Abenteuer“ – not „spielen“ or „Spiel“.
  Check new text against `tools/unslop-text.md`.

## Making a change

1. Edit `src/`. The built files in `docs/` are not committed.
2. A change a player or parent can notice gets one short German line in `CHANGELOG.md` under today's date
   (format in the file header).
3. A change a player can see needs before and after screenshots in the pull request: `npm run screenshots before`,
   make the change, `npm run screenshots after`, then `npm run screenshots before after` lists what changed.
4. Write the least code that solves the problem. Comment a non-obvious *why*, never what the code says.

## Licences

By contributing you agree that your work is published under the terms in `LICENSES.md`.
