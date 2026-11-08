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

## What Lernquest does instead („Tafel und Heft“)

- Surface: chalkboard green with a faint dust texture; paper sheets on it. No gradients as decoration.
- Ink: pencil-dark outlines (2px), small radii (4–8px), paper offset shadow `3px 3px 0`; pressing pushes
  a sheet into its shadow (`translate: 2px 2px`), no lip.
- Colour from the classroom: fountain-pen blue as the primary, teacher's green/red pencil for right/wrong,
  highlighter yellow for hints, and the German exercise-book cover colours per subject
  (Mathe blue, Ethik red, Sachkunde green). Yellow is a highlight, never the main button.
- Type: Patrick Hand for chalk and headings, Andika for text and numerals (made for children learning
  to read; 1/l/I and 6/9 can't be confused). Numerals tabular.
- Title: an exercise-book cover with a paper label (Name / Klasse) and the fox from our own art, not an
  emoji mascot over a centred stack.
- Task card: squared paper (Karopapier). Keypad: chalk keys drawn on the board.
- Motion stays short and soft, and everything respects `prefers-reduced-motion`.

## Still on the list (not done in the first visual pass)

- The monsters follow the recipe above (big white eyes, glint, blush). A redraw is a separate decision.
- Map nodes, items and types still use emoji icons. Small drawn icons in the chalk style would fit better.
- App icon, iOS launch screens and install screenshots still use Baloo 2; regenerate after the look is approved.
