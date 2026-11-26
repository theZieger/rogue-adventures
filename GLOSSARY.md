# Lernquest

The words of Lernquest: a learning roguelike for primary-school children, in which every attack is a task.
Each term gives the German word players and parents see and, where the code or a save uses another name, that name.
Names stored in saves never change (see CLAUDE.md „Saves must never break“), which is why some old ones remain.

## Language

### Curriculum

**Klasse** (code: `grade`):
A school year, 1 to 3. The title screen shows one Klasse at a time.

**Fach** (code: `subject`):
A school subject such as Mathe or Sachkunde. A Fach exists in a Klasse as soon as one Einheit names it.
Its key never changes; the name on screen follows the Bundesland (`subjectLabel`), e.g. Sachunterricht.

**Bundesland** (code: `land`, the table is `LAENDER`):
The state the child goes to school in, chosen by the parents; none chosen is „Allgemein“. It only sets defaults
and never locks anything.

**Profil** (code: the entry of a Bundesland in `LAENDER`):
What a Bundesland changes by default: the shown names of subjects, the units and Aufgabenarten that are hidden
until parents switch them on, the usual method of written subtraction, and how each Einheit fits the state's plan
(`fit`). A Profil is read when a screen is drawn and never saved.
_Avoid_: writing a Profil into `meta.hidden` or `meta.off`

**Einheit** (players see „Thema“; code: `mode`, the list is `UNITS`):
One self-contained piece of learning content with its own hero, opponents and Aufgabenarten, such as Zahlenquest
or Die Wiese. It belongs to exactly one Klasse and one Fach.
_Avoid_: Spiel, Modus, game; „Thema“ for anything inside an Einheit

**Aufgabenart** (code: `module`, `mod`):
One kind of task inside an Einheit, such as Einmaleins or Lückentext. Parents can switch each one on and off;
progress and statistics are counted per Aufgabenart.
_Avoid_: Modul, task type as a second name in new code

**Stufe** (code: `tier`):
The difficulty step of an Aufgabenart, from 1 upward. It rises with right answers and is capped per Welt.
_Avoid_: Level (that is the hero's)

**Aufgabe** (code: `task`):
A single question put to the child, made by an Aufgabenart at a Stufe.

**Wissensfrage** (code: an entry of a unit's `pool`):
A fixed question with a stored answer, as opposed to a generated Aufgabe. Wrong ones come back sooner.

**Themengebiet** (code: `g`, as key `note`):
A topic inside an Einheit that groups its Wissensfragen, with one Notizkarte.
_Avoid_: Thema (taken by Einheit on screen), Lernbereich (a section of the Saxon curriculum)

**Notizkarte** (code: `notes`):
The short summary of a Themengebiet that the child can read again.

**Erklärung** (code: `tut`):
The „Wie geht das?“ explanation of an Aufgabenart at a Stufe, shown before its first Aufgabe.

### Adventure

**Abenteuer** (code: `run`):
One journey of a hero through the Welten of an Einheit, from choosing the hero to victory or defeat.
One Abenteuer per Einheit can be saved and continued.
_Avoid_: Spiel, Runde, Durchlauf

**Welt** (code: `world`):
A stage of an Abenteuer with its own Karte and opponents; an Einheit has one to three.
_Avoid_: Level. Not the „Drei Welten“ of the Ethik content.

**Karte** (code: `map`):
The paths of one Welt, floor by floor, ending at the Boss.

**Kartenfeld** (code: `node`):
One stop on the Karte: Kampf, Ereignis, Rast, Schatz, Boss or a special field such as Bergwerk or Lesestube.

**Held** (code: `hero`; the choices of an Einheit are its `starters`):
The creature the child fights with. It gains experience, levels up and can take a new Gestalt.

**Attacke** (code: `attack`):
A hero's move. Each Attacke belongs to one Aufgabenart: choosing it asks an Aufgabe of that kind.

**Gegner** (code: `enemy`):
An opponent in a Kampf: normal, Elite or Boss.

**Gegenstand** (code: `item`):
Something the hero carries and uses in a Kampf, such as a Trank or the Eselsbrücke.

**Ereignis** (code: `event`):
A Kartenfeld with a short scene and a choice. A **Dilemma-Karte** is an Ereignis without a wrong answer.

### Progress

**Spielstand** (code: `meta`, plus the saved Abenteuer):
Everything a child has reached on this device. It never leaves the device except as a Spielstand-Code.

**Spielstand-Code** (code: save code):
The Spielstand as text or QR code, to carry it to another device, where it is merged or replaces what is there.

**Stempel** (code: `stamps`):
What learning earns. Stempel fill the Stempelheft and pay for things there; there is no money in Lernquest.
_Avoid_: Geld, Münzen, Punkte

**Monsterbuch** (code: `dex`):
The collection of every Gegner the child has met.

**Wochenziel** (code: `weekly`):
One of the goals set anew each week, the same on every device.

**Extra** (code: `extra:<name>` in `meta.hidden`):
A part of Lernquest outside the Abenteuer that parents can hide: Schulgarten, Hütte, Kreisel-Arena, Duell,
Wochenziele, Kaufladen.
_Not_: `extra` on a unit, which names the Attacke of each Aufgabenart.

### Turmwacht

**Turmwacht**:
Revision across Einheiten: monsters walk towards the Wissensturm and every right answer hits one.

**Weg** (code: `lane`):
The path of one Fach in a Turmwacht; its Aufgaben come from Aufgabenarten the child has already practised.

**Welle** (code: `wave`):
One round of monsters. Between two Wellen is the **Bauzeit**, in which Ziegel are spent.

**Ziegel**:
What right answers earn inside one Turmwacht, spent on Wachen, Stockwerke and repairs. Gone when it ends.
