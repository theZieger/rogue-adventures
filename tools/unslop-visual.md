# Unslop profile: the look of Lernquest

What to avoid when changing the game's visual design.
Source: 20 generated single-file "German kids' maths monster-battle game" pages (unslop run, 2026-11-08),
rendered and read; numbers are samples out of 20 that showed the pattern. The blended default page the
analysis describes was, line for line, Lernquest's own first version. This file exists so we don't drift back.

## The template (don't rebuild it)

- Dark indigo/navy gradient or sky-blue gradient background (16): the only two background families.
- Gold/amber call-to-action with dark text (14 of 16 title screens); gold-on-indigo pairing (6).
- Baloo 2 or Fredoka (15), heavy rounded title with a solid offset text-shadow (13).
- "3D candy" buttons: solid lip `box-shadow: 0 Npx 0 darker` that sinks with `translateY` on press (19 + 20).
- 16–20px corner radius on everything (19).
- Title screen = centred stack: emoji mascot → h1 → subtitle „Besiege die Monster mit …“ → one yellow
  „Los geht's!“ button, with the top and bottom quarter of the screen empty (16 of 16).
- Emoji as the art: 🐉🦇👾👹👻 roster (13), ⚔️ as the battle symbol (6), 🔒 on locked map nodes (16).
- Hand-drawn SVG monster recipe: round body, two big white eyes with a glint, curved smile or two fangs,
  tiny horns/ears, pink blush circles, grey shadow ellipse (6).
- Zig-zag dotted path of round level nodes; ⭐ counter pill in the top bar (16).
- Same motion set everywhere: bob, shake/hit, pop, pulse (13–19); `prefers-reduced-motion` honoured in 1.
- `user-scalable=no` (15): don't block zoom.
- Feedback red #ff6b6b-ish and green #22c55e-ish (the same two hexes in most files).

## What was decided (2026-11-08)

The owner compared a full „Tafel und Heft“ proposal (chalkboard, paper buttons, fountain-pen blue, exercise-book
colours) with the existing look and kept the candy look on purpose. Taken over from the proposal:

- Patrick Hand (handwriting) for headings, monster and attack names, battle messages and feedback.
- Andika for all text and every number (made for children learning to read; 1/l/I and 6/9 unmistakable),
  tabular numerals on sums, inputs and the keypad.
- Squared paper (Karopapier) on the task card.

So the navy surface, gold buttons with a lip, rounded corners and the title stack stay by choice, not by default.
When something is redesigned later, this file is the list of what not to drift back into without deciding.

## Still on the list

- The monsters follow the recipe above (big white eyes, glint, blush). A redraw is a separate decision.
- Map nodes, items and types use emoji icons.
- App icon, iOS launch screens and install screenshots use Baloo 2; regenerate with Patrick Hand after the merge.
