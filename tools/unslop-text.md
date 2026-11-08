# Unslop profile: German in-game text for Lernquest

What to avoid when writing names, item blurbs, events, tutorials and messages for the game.
Source: 40 generated samples of "German in-game text for a children's educational monster-battle RPG"
(unslop run, 2026-11-08), counted and read; numbers are samples out of 40 that showed the pattern.
Most of this is about removing the model's defaults, not about adopting a new house style.

## Praise, defeat and reward lines

- No interjection pile-ups: „Super!" (10), „Toll!" (7), „Wow!" (6), „Klasse!" (4), „Juhu/Hurra!" (5),
  „Spitze/Prima/Bravo/Mega!" (8), „… gemacht!" (7). One plain „Richtig" is enough; the game shows the result.
- No identity praise: „du bist ein echter Held / Rechenprofi / Meister" (10). No „stolz" (6).
- No progress clichés: „immer besser/stärker", „mit jedem Versuch …", „richtig gut" (5 each).
- Defeat lines come from a ten-phrase bank in the samples: „nochmal", „probier es", „noch nicht ganz",
  „fast geschafft", „du schaffst das", „gleich klappt es", „knifflig", „drangeblieben". Don't use them.
  Say what happened and what is next, in plain words.
- „geschafft" (8), „Los geht's / Weiter geht's" (9), „Weiter so" and „Dein Abenteuer wartet" are the stock
  closers. Buttons say what they do: „Weiter", „Start", „Verstanden".
- Not every line needs „!". The samples average one exclamation mark per 35 words.

## Names (monsters, attacks, items)

- The default naming move is the alliterated hyphen compound: „Wort-Wurm", „Fehler-Frosch",
  „Plus-Pfeil" (10 of 17 naming samples), often praised afterwards as „leicht zu merken". Avoid it.
- No cute diminutives as the only idea: -i, -chen, -el („Klecksi", „Zündi", „Flatterfledi").
- Vocabulary the model reaches for every time: blubber, Tinte/Klecks, glitzer/funkel, kitzel/kicher/hihi,
  Zauber-, Lupe, Drache, Wirbel, Kuschel, Keks/Krümel, Sterne/Glitzermünzen as currency,
  Rucksack as inventory (each in 5–8 samples). Pick something from the game's own world instead
  (school, farm, Luther's time, the potato field, the worksheets).
- No „Einmaleins-X" or „Rechen-X" prefix names; no „Schlaumeier", „Profi", „Meister".
- Enemies are routinely defanged right after being named: „sieht gefährlich aus, ist aber lieb",
  „seine Stöße kitzeln nur" (9). An opponent may simply be an opponent.
- Attack names that are just a noun from the task („Zahlenwirbel") fit any game. Prefer a concrete
  image that belongs to this creature or era (a Latin lecture, a reverse gear, a printing press).

## Descriptions and events

- Monster blurbs default to „Er/Sie [verb] gern / am liebsten …" plus a cute quirk (6). State one
  specific fact instead.
- Item blurbs are always verb-first fragments („Heilt …", „Macht …"). That's fine for a UI list, but
  don't add the two-beat joke („… Meistens.") or the „X, aber Y" twist on every item.
- Event openers default to „… hörst du (plötzlich) ein leises …" (4 of 5 event samples), „hinter einem
  Busch", „Ein Brunnen glitzert". Start with the concrete place or person and what they want.
- Softeners are everywhere: „ein bisschen" (9), „klein/kleine" (17), „leise" (6), „ganz genau".
  Use exact numbers where the game has them („heilt 3 LP"), not „ein bisschen".
- No similes with „wie ein(e) …" as decoration (11); no reduplicated sounds („Plitsch-Platsch",
  „Klick, klack") (11); no „Hoppla / Oje / Ups / Huch" (7); no ellipsis for suspense (10) and no
  „[setup] – [payoff]" dash in every second line (11).
- No emoji as decoration on headings and sentences (11). Icons that mean something (the map node,
  the item, the type) stay.
- Generic subtitles and tricolons („Monster · Wissen · Abenteuer") say nothing. One concrete sentence
  about what the game does says more.

## Tutorials

- Short du-imperatives with a worked example are right for this age; keep them.
- Don't end a tutorial with praise or reassurance („Super! Mit jeder Reihe wirst du schneller",
  „Du schaffst das!"). End with the last step.

## Wrapper (when generating content with a model)

- Strip preambles („Hier sind 12 …"), rationale blocks („Worauf ich geachtet habe"), pedagogy
  justifications, „Soll ich …?" offers, character counts, gender caveats and unrequested variants.
  Ask for the list only, then read it against this file.
