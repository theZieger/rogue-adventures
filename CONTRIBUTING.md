# Contributing to Lernquest

Lernquest is a German learning app for primary-school children. Code, comments and these notes are in English;
everything a child or parent reads is German. Fixes to learning content are as welcome as code.

## Get it running

```bash
npm install
npm run build        # src/* -> docs/index.html (one file, open it in a browser)
npm test             # about two minutes; needs the build
npm run playtest     # a bot plays every unit
npm run format       # Biome formats JS, CSS and JSON
```

You need Node 20 or newer, nothing else. A pull request must be formatted and pass build, test and playtest;
CI checks all four.

## Find your way

- `README.md` lists every file and what it holds.
- `GLOSSARY.md` has the project's words (Einheit, Abenteuer, Aufgabenart …) and their names in the code. Use them.
- `adr/` records the architecture decisions and why they were made.
- `src/units.js` is the one list of units; `README.md` → „Neue Einheit“ explains how to add one.

## Rules that are not negotiable

- **Saves never break.** Never rename or repurpose a storage key or saved field. Add fields with defaults and cover
  the change in `tests/test_storage.js`.
- **No requests at runtime, no tracking.** The app works offline; files it needs go into `CORE` in `src/sw.js`.
- **No time pressure** in any task, and children see whole numbers (money and lengths excepted).
- **Learning content follows the curriculum** (`lehrplan/`). Say in the pull request where a fact comes from.
- **Copy is about learning, not gaming:** „loslegen“, „üben“, „Thema“, „Abenteuer“ – not „spielen“ or „Spiel“.
  Check new text against `tools/unslop-text.md`.

## Making a change

1. Edit `src/`. The built files in `docs/` are not committed; `art/` is (run `npm run build` and commit it when a
   monster changes).
2. A change a player or parent can notice gets one short German line in `CHANGELOG.md` under today's date
   (format in the file header).
3. A change a player can see needs before and after screenshots (phone size, 390×844) in the pull request.
4. Write the least code that solves the problem. Comment a non-obvious *why*, never what the code says.

## Licences

By contributing you agree that your work is published under the terms in `LICENSES.md`.
