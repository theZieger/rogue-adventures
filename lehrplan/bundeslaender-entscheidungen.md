# Lernquest beyond Saxony: decisions taken

Date: 2026-11-25. The open questions of `bundeslaender-plan.md` (section 7) and the doubts that came up while
building were put to three independent AI judges (teaching and parents; engineering and saves; product scope and
honesty). Where they split, the majority decided; where the owner's instruction „implement all steps“ and a
majority disagreed about volume, the step is built but later and behind the others. The owner can overrule any of
this; nothing visible goes to `main` without the owner's go-ahead.

**Offered states:** Allgemein (no state chosen) and BW, BY, BE, BB, HH, HE, MV, NI, NW, RP, SN, ST, SH.
Thüringen, Bremen and the Saarland are not offered until their plans have been read.

| # | Question | Decision |
|---|---|---|
| 1 | Written subtraction | Both methods are built; parents choose („So rechnet die Klasse“). A save that existed before this change keeps Ergänzen. New default: Abziehen in Sachsen, Bayern and Niedersachsen; Ergänzen in Hessen, in every state that prescribes nothing and without a state. Only the result is checked, as before |
| 2 | Where the state is asked | One optional card on the first-start screen (it already addresses parents) and a row in the Elternbereich; never blocking; nothing chosen = Allgemein |
| 3 | Grade 4 | Not in scope. Content that only exists for band 3/4 and is clearly grade 4 stays out |
| 4 | Subject names | The saved keys stay. Shown name per state: Ethik (SN, BY, ST, RP, HE, Allgemein), Werte und Normen (NI), Philosophie (SH), Philosophieren (MV), Miteinander (BW, BE, BB, HH, NW). Sachkunde is shown as Sachunterricht outside Saxony, HSU in Bayern |
| 5 | French | Not in scope. Where French may be the first language (BE, MV, HE, RP, BW) the English page tells parents they can hide English |
| 6 | The claim | Outside Saxony never „orientiert sich am Lehrplan von …“. The parent area says the state's plan was read and every Thema compared (with the date), that no teacher checked it, and that the class's exercise book decides. Per Thema one fixed verdict: passt / hier meist früher / hier meist später / steht hier nicht im Plan / noch nicht verglichen, with the Saxon Lernbereich below as the basis |
| 7 | Grammar words | No general word-swap (Präsens→Gegenwart and Prädikat→Satzkern change the article; no state offered needs Substantiv). Only Selbstlaut→Vokal and Mitlaut→Konsonant in Bayern and Niedersachsen, as checked whole forms. Everything else is a short explanation line for the child and the parent |
| 8 | Grundwortschatz lists | Left out: the lists are not in the repo and their licences are unchecked. The parent area says so |
| 9 | New Themen | Full grade 3 units. First Wald, Strom und Magnete, Feste der Religionen (two of three judges); then Feuer, Kinderrechte und Gemeinde; Gewässer and Sonnensystem last |
| 10 | „Mein Bundesland“ | Built for the 13 offered states from a closed list of facts (capital, neighbours, sea, big rivers, landscapes with a source, state-wide public holidays), each cross-checked on the web with the source noted; a fact that cannot be confirmed is dropped. No coats of arms, no numbers |
| 11 | Themen of the next grade | A parent can add single Themen of the next grade; never on by default; progress stays with the Thema. No English for Hamburg's grade 1 (the tasks need reading) |
| 12 | Hiding by state | Hidden by default only where a read plan fixes the content to grade 4 (written multiplication in MV, HH, SH; Punkt vor Strich in HH, SH; Teilbarkeit in MV, SH; Umfang and Fläche in MV, HH; parallel/senkrecht of grade 3 in HH), the Saxon dialect words and the two Christian Themen outside Saxony, double consonants of grade 2 in NI. Never hidden once a child has practised it; a parent's switch wins in both directions. Everything else stays visible with a note for parents |
| 13 | Not built now | Perfekt/Futur, the four cases, Objekte and Präposition (grade 4 in most classes); a Niederdeutsch pack; a comma-free variant of the grade 2 Größen; an earlier Einmaleins ladder for MV; English from grade 1 in Hamburg. Of the new maths task types only litres/millilitres and brackets |

Proof obligations: without a state the child sees what it saw before (the bot's recording is compared); every
state profile leaves at least two task types per Thema and world; the bot also runs under the strictest profile.
