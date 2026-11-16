# Lernquest beyond Saxony: findings and content plan

Date of research: 2026-11-16. Compiled by AI agents (Claude) from the sources named in `lehrplan/laender/*.md`;
not checked by a teacher. Every claim below goes back to one of those files, where its origin is marked
(**[off]** read in the official document, **[sek]** secondary source, **[Praxis]** from memory). Section 9 lists
what is still unverified. Nothing in the app has been changed.

## 1. Short answer

1. **The feedback is right, but the fix is not 16 curricula.** Outside Saxony almost every state fixes content only
   for the end of grade 2 and the end of grade 4; each school splits grades 3 and 4 itself. A per-state "grade 3
   content set" would be precision that the plans do not contain.
2. **The differences fall on six axes** (section 3): which subjects exist, how subtraction is written, which grammar
   words are used, how early some topics come, regional content, and Christian content inside Ethik. Each axis needs
   one mechanism, not one profile per state.
3. **Ask for the Bundesland, optionally, and keep it switchable** (section 4). It is asked once when a parent
   sets up the app, can be skipped („Allgemein“), and can be changed in the Elternbereich at any time. It sets
   defaults; it never locks anything, because in most states the school decides, not the state.
4. **Three things should be fixed regardless of any state setting** (section 5, phase 0), one of them in Saxony
   itself: the app teaches written subtraction by the Ergänzungsverfahren, while the Saxon plan of 2025 describes
   „Entbündeln im Minuenden“.

## 2. What was researched

| File in `lehrplan/laender/` | State of the research |
|---|---|
| `_kmk-gemeinsamer-kern.md` | National standards (Deutsch, Mathematik 2022) and the 2024 agreement, read |
| `_uebersicht-tabellen.md` | Cross-check tables for all 16 states; several cells are low-certainty and say so |
| `sachsen-klasse-3-kurz.md` | Saxon baseline for grade 3 (the older notes cover grades 1/2 only) |
| `bayern.md`, `baden-wuerttemberg.md` | Official plans read |
| `nordrhein-westfalen.md`, `niedersachsen.md` | Official plans read |
| `berlin.md`, `brandenburg.md`, `mecklenburg-vorpommern.md` | Official plans read |
| `hamburg.md`, `schleswig-holstein.md` | Official plans read |
| `sachsen-anhalt.md` | Official plan (new, 01.08.2026) read |
| `thueringen.md` | **Partly.** Portal unreachable; describes the 2010/2015 plans, maths from secondary sources. A trial version 2026 applies to grades 1 and 3 and is unread |
| `bremen.md` | **Partly.** The five new plans (2025) could not be downloaded; rests on older overviews |
| `hessen.md`, `rheinland-pfalz.md`, `saarland.md` | HESSEN_RLP_SAAR_STATUS |

## 3. The six axes of difference

### 3.1 How firmly content belongs to a grade

| Fixes content … | States |
|---|---|
| per grade (1/2 as a block, then 3 and 4) | Sachsen; Mecklenburg-Vorpommern (maths only); Hamburg (maths only); Schleswig-Holstein (numbers and operations only) |
| only for end of grade 2 and end of grade 4 | Bayern, Baden-Württemberg, NRW, Niedersachsen, Sachsen-Anhalt, Thüringen, Bremen (old overviews name grades) |
| by levels, not grades | Berlin, Brandenburg |

Consequence: most of what the state files list as „fehlt in der App“ is band 3/4 material and may be grade 4 in
class. Lernquest has no grade 4. Until it has one, the honest claim is „passt zu Klasse 1 bis 3“, with a note
per topic where a state usually teaches it later.

Where a state does fix the grade, the app's grade 3 is ahead in a consistent set of task types:

| App task type (grade 3) | Later or absent in |
|---|---|
| `math.smul` written multiplication | grade 4 in MV, HH, SH, HB |
| `math.teilbar` divisibility, Quersumme | grade 4 in MV, SH; not in the plan in NRW, NI, BY, BW, HB; not in the national standards |
| `math.vorrang` Punkt vor Strich | grade 4 in HH, SH; not in NRW, NI, BY, BW |
| `math.rest` division with remainder | not in NI; only as notation in NRW; SH prefers another notation; fine in MV, HH, SN |
| `math.bruch` with thirds | most states name only ½, ¼, ¾ with quantities (NRW, ST, BE, MV, HH); not in NI |
| `bau.umfang`, `bau.flaeche` | grade 4 in MV, HH, HB; no Umfang in NI |
| `bau.lage` parallel/perpendicular | grade 4 in HH, HB; not in the primary plan in BY, BW |

And the app's grades 1/2 are ahead here:

| App task type (grade 1/2) | Later in |
|---|---|
| `groessen2.geld` money with comma | NRW, NI, BE/BB, MV, HH, BW, BY (comma notation only in 3/4); fits Bremen |
| `groessen2.laenge` mm and dm | NRW, NI, ST, BE/BB, HH, SH, BW, BY |
| clock to 5 minutes | NRW, SH, BW |
| `formen2.lage`, `formen2.linien` (right angle, parallel, Gerade/Strecke/Strahl) | NRW, NI, ST, BE/BB, HH, SH, BW, BY |

The opposite also occurs: `malteilen` (rows 2, 5, 10 first) is too cautious for Mecklenburg-Vorpommern and
Thüringen [sek], where the whole Einmaleins belongs to grade 2. It matches the „Kernaufgaben“ wording of BY, NI,
ST and SH closely.

### 3.2 Written subtraction

The app shows one method: Ergänzen, with the carry under the next column (`src/logic.ts`, tutorial `ssub`).

| Rule | States |
|---|---|
| Abziehen (Entbündeln) prescribed or described | Bayern („Abziehverfahren“); **Sachsen 2025** („Veranschaulichen des Entbündelns im Minuenden“) |
| School or teacher decides | Niedersachsen (plan's only example: Abziehen mit Entbündeln), Mecklenburg-Vorpommern, Bremen |
| Either, stated | Baden-Württemberg („Abziehen oder Ergänzen“) |
| Nothing prescribed | NRW, Sachsen-Anhalt, Berlin, Brandenburg, Hamburg, Schleswig-Holstein; the national standards |

Only the result is graded, so no child is marked wrong. But the tutorial explains a method that many classes do
not use, and since 2025 probably including Saxon ones. This cannot be derived from the Bundesland: it needs its
own setting („So rechnet die Klasse“), with the state only supplying the default.

### 3.3 Grammar words

The app uses one fixed set (Nomen, Selbstlaut/Mitlaut, Präsens/Präteritum, Subjekt/Prädikat, Grundstufe/
Mehrstufe/Meiststufe). The national standards say the labels „können unterschiedlich sein“.

| App says | Elsewhere |
|---|---|
| Nomen | Substantiv in Thüringen; „Nomen/Substantiv“ in MV |
| Selbstlaut, Mitlaut | Vokal, Konsonant in Niedersachsen and Bayern |
| Präsens, Präteritum | Gegenwart, 1. Vergangenheit … in Bayern; Vergangenheit/Gegenwart/Zukunft in BW; German Zeitstufen in NRW |
| Prädikat | Satzkern in Sachsen-Anhalt; „Satzkern (Prädikat)“ in NRW; both in Bayern |
| Grundstufe, Mehrstufe, Meiststufe | Positiv/Komparativ/Superlativ in MV and NI; likely unfamiliar in most states |
| „Zeitwörter“ for time adverbs | risky everywhere: many children know „Zeitwort“ as the word for verb |

Missing in the app but required in several states by the end of grade 4: Perfekt and Futur (NI, ST, TH, BE/BB,
HH), the four cases (TH, BE/BB, MV, HH), Objekte (NI, TH, BE/BB, MV; „Wen-/Wem-Ergänzung“ in BW),
Präposition (TH, BE/BB, MV, BW). Whether that is grade 3 or 4 is the school's decision.

### 3.4 Which subjects exist

| Subject | Finding |
|---|---|
| **Ethik** | A substitute subject everywhere, never for the whole class. From grade 1 in SN, BY, ST, TH; as Philosophieren mit Kindern in MV, Philosophie in SH, Werte und Normen in NI (compulsory from 2026/27, rising from grade 1), Ethik in RP and partly HE. **No such subject in grades 1–4** in BW, BE, BB, HH, HB, SL; NRW has a curriculum but had not introduced the subject as of 2024 |
| **Englisch** | From grade 3 in most states. Hamburg from grade 1. French instead of or beside English in the Saarland, Berlin (parents choose), MV (by school), parts of BW and RP |
| **Musik** | Own subject everywhere researched except Bremen (part of „Ästhetische Bildung“). The app's note values, metre and note names are binding content in ST, TH, MV, BY and BW – a better fit than in Saxony |
| **Sachunterricht** | Called „Heimat- und Sachunterricht“ in Bayern, „Heimat- und Sachkunde“ in Thüringen, „Sachunterricht“ elsewhere. The app's child-facing word is „Sachkunde“ |

### 3.5 Christian content inside Ethik

Half of the app's grade 3 Ethik is Luther and the church year (236 of 455 questions, 2 of 4 units). That follows
the Saxon Ethik plan, which names „christliche Feiertage in Sachsen“, Reformationstag and Luther. Elsewhere:

- Religion content, not Ethik: NRW, MV, SH (Luther is in the Protestant Religion plan), BW, BE/BB, HH, HB.
- Not in the Ethik plan at all: Sachsen-Anhalt (full-text search: no Luther, Reformation, church year).
- Fits loosely: Thüringen („ausgewählte Persönlichkeiten des Christentums“, „Ursprung der Feste“).
- Wanted instead, and missing in the app: festivals of several religions and worldviews (NI, BY, ST, HH, NRW).

### 3.6 Regional content

Nothing a child sees is false outside Saxony, but it is addressed to Saxons:

- „Nachbarland Sachsens“ (`frueher`), „bei uns in Sachsen“ (`baeume2`).
- `kirchenjahr`: Buß- und Bettag as the opening topic (holiday only in Saxony), the Sorben topic.
- `woerterwerkstatt.sachsen`: Saxon dialect words. Other plans name their own: Niederdeutsch (NI, SH, MV, NRW, ST),
  Friesisch (SH, NI).
- 3 of 44 Lesestube texts (Elbe, Barbarine, Schwibbogen) – harmless as reading texts.
- The Elternbereich prints „Lehrplan Sachsen:“ with a Saxon Lernbereich for every unit; README and changelog say
  the same. This is the one place that is plainly wrong for a family elsewhere.

Every state requires its own regional content in Sachunterricht (the state on the map, capital, Landkreise,
landscape), which the app does not have for any state, Saxony included (`LANDKREIS` hook is empty).

### 3.7 Sachunterricht topics

The order differs more than the content:

- `sinne` (app: grade 3) is grade 1/2 material in NRW, ST, TH, MV, HH, BW, BY.
- `wiese` (app: grade 3) is grade 1/2 in BY, TH, MV; grade 3/4 there is **Wald** and **Gewässer**, which the app
  lacks.
- `kartoffel`, `kornkammer`: named literally only in Saxony and Sachsen-Anhalt; optional examples or absent
  elsewhere.
- Missing in the app and required in many states by grade 4: Strom/Stromkreis, Magnetismus, Feuer/Verbrennung,
  Kinderrechte and Gemeinde, Müll, Sonnensystem, the state/Germany/Europe on the map.
- Fits well in several states: `kompass`, `wetterstation`, `verkehr`, `baeume2`.

## 4. Recommendation: the Bundesland setting

**Ask, optionally, at setup; switchable in the Elternbereich; „Allgemein“ when skipped.**

Why ask at all: three things cannot be right without it – the parent text „Lehrplan …“, whether Ethik and English
are shown by default, and regional content. Why optional and switchable: families move, the device may be a
grandparent's, a child should never be blocked by a question it cannot answer, and existing players have no value.

Why it must only set defaults: in most states the school decides the subtraction method, the script, the split
of grades 3/4 and the Sachunterricht topics. A parent must be able to say „our class does it differently“ for
each of these without changing the state.

What the setting controls:

| # | Effect | Mechanism |
|---|---|---|
| 1 | Parent text per unit: where it sits in *this* state's plan, or „In <Land> meist Klasse 4“, or „steht in <Land> nicht im Plan“ | text table per state beside `PLAN` |
| 2 | Default visibility of units and task types | computed when read, on top of the existing `meta.hidden` / `meta.off`; a parent's own choice always wins |
| 3 | Default for „So rechnet die Klasse“ (subtraction) | separate setting, section 5 phase 2 |
| 4 | Default grammar word set | separate setting, phase 3 |
| 5 | Subject names (Sachunterricht / Heimat- und Sachunterricht; Ethik / Philosophie / Werte und Normen) | label table |
| 6 | Regional pack („Mein Bundesland“, dialect words) | questions tagged with a state |

Rules that keep it safe:

- New save field `land` with default „not set“; nothing renamed (`normMeta` already makes this backward
  compatible). Existing players stay on „Allgemein“ and see what they see today, minus the Saxon framing.
- „Allgemein“ is a real, tested profile: the nationally common core, no regional pack.
- Existing Saxon families are not switched silently. They see one hint in the Elternbereich: „Wählen Sie Ihr
  Bundesland“.
- A state profile never deletes or renames a unit or task type id; ids are in saves and save codes.
- An empty result must not fall back to „all questions“ (every existing filter does that today, which would show
  Saxon questions in an empty state set).
- One table, e.g. `src/laender.ts`, holds everything per state. No second list of units.

What it deliberately does not do: move a unit to another grade. Where a topic is taught earlier elsewhere
(`sinne`), the cheaper answer is a parent switch „Themen aus Klasse 3 dazunehmen“ rather than per-state grades.

Wording for parents must stay honest: „orientiert sich am Lehrplan von <Land>“, never „geprüft“ or „deckt den
Lehrplan ab“.

## 5. Plan

Sizes: S = a day or two, M = about a week, L = several weeks. Every phase that a player can see needs
before/after screenshots and the owner's go-ahead, and a changelog entry.

### Phase 0 – Right for everyone, no setting needed (S)

1. **Decide the Saxon subtraction question.** The 2025 plan says „Entbündeln im Minuenden“; the app teaches
   Ergänzen. Check against the class worksheets the app follows. Outcome feeds phase 2.
2. Reword the two Saxon framings (`frueher`: „Nachbarland Deutschlands“; `baeume2`: drop „in Sachsen“).
3. Elternbereich: stop printing „Lehrplan Sachsen:“ as if it applied to every family; until phase 1 say
   „Lehrplan Sachsen (Grundlage der Inhalte)“. README: say plainly that the content was built on the Saxon plan.
4. Rename „Zeitwörter“ (time adverbs) to something unambiguous, e.g. „Zeitangaben“.

### Phase 1 – The setting and the „Allgemein“ profile (M)

1. Save field, setup question, Elternbereich switch, per-state table, read-time defaults, the fallback fix, tests in
   `tests/test_storage.js` and `tests/test_data.js`.
2. Fill the table for all 16 states with the three cheap effects: parent texts, subject names, default visibility.
   Default-hidden outside Saxony: Buß- und Bettag and Sorben topics, `woerterwerkstatt.sachsen`.
   Default-hidden where no Ethik-type subject exists: nothing – see phase 4.
3. Parent texts for Thüringen, Bremen and any other partly researched state say „Lehrplan noch nicht
   ausgewertet“ instead of guessing.

### Phase 2 – Mathematik (M–L)

1. Second rendering and tutorial for written subtraction (Abziehen with Entbündeln); setting „So rechnet die
   Klasse“; default per state, Saxony per the outcome of phase 0.
2. Timing table from 3.1 as default visibility for the states that fix grades (MV, HH, SH), and as parent hints
   („oft erst in Klasse 4“) for all others.
3. Grade 2: a variant of `groessen2` without comma money, mm/dm and 5-minute clock; `formen2.lage`/`linien`
   off by default outside Saxony and Bremen.
4. `malteilen`: let the tier ladder reach all rows earlier for MV and Thüringen (after Thüringen is verified).
5. New task types that many states require by grade 3/4 and that fit a phone: litres and millilitres, seconds,
   tonnes; brackets; circle terms. `math.bruch`: thirds only in Saxony.
6. `math.rest`: keep „Rest“; no change needed for most states.

### Phase 3 – Deutsch (L)

1. Word sets as data: one map from the app's terms to the state's (Nomen→Substantiv, Selbstlaut→Vokal,
   Präsens→Gegenwart, Prädikat→Satzkern …), applied where text is shown, the same way emojis are swapped for icons.
   Well over a thousand child-facing occurrences, so this must be a mechanism, not a rewrite. Parent can override.
2. Steigerung: show the state's words; „Grundstufe/Mehrstufe/Meiststufe“ only in Saxony.
3. New task types: Perfekt and Futur, the four cases, Objekte, Präposition – marked „oft Klasse 4“.
4. Grade 1/2 spelling follows the Sächsischer Rechtschreibrahmen (no ck, tz, silbentrennendes h), the cautious
   end. `schreiben2.doppel` is still too early for Niedersachsen and Bremen (double consonants there by grade 4):
   off by default there.
5. Grundwortschatz practice per state where an official list exists (BY, BW ~870, BE/BB ~700, NRW 533,
   SH 1429, MV). Check each list's licence first; this is the largest content job in Deutsch.
6. Dialect pack: `sachsen` only in Saxony; a Niederdeutsch pack for NI, SH, MV, HB, HH is the obvious second one.

### Phase 4 – Ethik, Religion, festivals (M)

1. Split by content, not by state: the secular units (`freunde`, `ichwelt`, `ichdu1`) are useful everywhere and
   fit Philosophie (SH) and Philosophieren mit Kindern (MV) well. Where no Ethik-type subject exists they keep
   showing, under a neutral subject name still to be chosen with the owner.
2. Luther and Kirchenjahr become an opt-in for everyone outside Saxony and Thüringen, described to parents as
   what it is: knowledge about Christianity, taught in Religion in most states.
3. New unit: festivals of the religions and worldviews (Zuckerfest, Opferfest, Pessach, Laubhüttenfest, Vesakh,
   Jugendweihe …), described, not preached. Required in NI, BY, ST, HH, NRW; fits every state.
4. Holidays as a small state-tagged topic (which days are free here), checked against each state's holiday law –
   the current table is from memory.

### Phase 5 – Sachunterricht (L)

1. Parent switch „Themen aus der nächsten Klasse dazunehmen“ so `sinne` and `wiese` can be used in grade 2.
2. New units in the order most states need them: Wald; Strom und Magnete; Feuer; Gewässer; Kinderrechte und
   Gemeinde; Sonnensystem.
3. „Mein Bundesland“: one small state-tagged pack per state (capital, coat of arms, neighbours, rivers,
   landscapes, a map). 16 packs of the same shape; Saxony first, since it is missing there too.
4. `kartoffel`, `kornkammer`: unchanged; parent text says where they are only an example.

### Phase 6 – Musik and Englisch (S–M)

1. Musik: only parent texts change; the unit fits most states better than Saxony.
2. Englisch: in Hamburg show the units from grade 1 (the vocabulary is their grade 1/2 material). For Bayern mark
   what goes beyond the binding 151-word list. No French for now; say so in the parent text for the Saarland
   and wherever French is chosen.

### Phase 7 – Close the research gaps (runs alongside)

Section 9. Nothing from a partly researched state goes into a default before its plan has been read.

## 6. Order and dependencies

Phase 0 now. Phase 1 before everything else, because phases 2–6 only fill its table. After that the phases are
independent; by effect per effort: 4 (Ethik split) and 2.1 (subtraction) first, then 5.3 („Mein Bundesland“,
the most visible answer to the feedback), then 3.1 (word sets), then new units.

## 7. Decisions for the owner

1. Subtraction in Saxony: follow the 2025 plan (Abziehen) or the class worksheets (Ergänzen) as the default?
2. Setup question: asked of the parent before the child starts, or only offered in the Elternbereich?
3. Is grade 4 in scope? Without it, much band-3/4 content stays out and „passt zu Klasse 3“ stays approximate.
4. Ethik outside Saxony: keep the name „Ethik“, or a neutral name where the subject does not exist?
5. French (Saarland, parts of Berlin, MV, BW, RP): out of scope for now?
6. Who checks a state's profile before the app says „orientiert sich am Lehrplan von <Land>“? AI research alone
   should not carry that sentence.

## 8. What stays as it is

- One list of units, one grade per unit, ids and storage keys untouched.
- No time pressure, whole numbers, comma only for money and lengths.
- Notation „·“ and „:“ is common to all plans read.
- The traffic unit rests on federal rules and fits everywhere.

## 9. Not verified

- **Thüringen:** the 2026 trial version (grades 1 and 3), the maths plan 2010, the foreign-language plan.
- **Bremen:** all five new plans (2025); Sachunterricht, Musik and Religion could not be compared.
- **Saarland:** French from grade 1 or 3 – sources disagree.
- **Holidays:** all from memory, not from the holiday laws.
- **Ethik-type subjects:** the national overview dates from 2020; status in NRW, HE, BW for 2026/27 is open.
- **Scripts and Grundwortschatz** for several states rest on secondary sources (`_uebersicht-tabellen.md`).
- **The grade 3 / grade 4 split** in every band state: common practice only, never from the plan.
- **Saxony:** whether versions newer than 2019 exist for Sachunterricht, Ethik, Musik and Englisch.
- Each state file ends with its own list.
