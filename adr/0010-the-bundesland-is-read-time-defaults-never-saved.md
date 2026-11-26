# The Bundesland sets defaults when a screen is drawn and is never written into the save

Lernquest was built from the Saxon curriculum. Families elsewhere need other subject names, a few task types
later, and Luther and the church year as an opt-in (`lehrplan/bundeslaender-entscheidungen.md`). The obvious
build is to apply a state's profile when it is chosen: add its hidden units to `meta.hidden` and its task types
to `meta.off`. That cannot be repaired later. The save would no longer tell „a parent switched this off“ from
„Hamburg switched this off“, so changing the state, or correcting a profile in a later release, would either keep
stale defaults or wipe a parent's own choices.

So the save holds three plain fields and the profile is computed every time it is read:

- `meta.land`: the chosen state, a key of `LAENDER` (`src/laender.ts`), or `''` for none („Allgemein“).
- `meta.hidden` and `meta.off` keep their meaning: a parent switched this off.
- `meta.forced`: a parent switched this on although the state hides it (`mode:<unit>`, `mod:<unit>:<task type>`),
  and the units a parent added from the next grade (`also:<grade>:<unit>`).
- `meta.minus`: the method of written subtraction a parent chose, or `''` to follow the state.

`shown`, `offList`, `visSubjects`, `subjectLabel` and `minusMethod` in `src/app/storage.ts` combine them. Three
rules hold there and nowhere else:

1. A parent's switch wins in both directions. `setOn` is the only writer; the switches in the parent area show the
   combined value and never copy a default into the save.
2. What the child has already practised is never hidden by a profile (a unit with an adventure or an answer, a
   task type with an answer).
3. Without a state nothing changes. The bot's recording of every unit is the same as before the setting existed,
   apart from the first-start screen, which gained the card that asks.

A profile may not leave a fight without task types. There is no „nothing left, show everything“ rescue for
profiles, because it would silently show what the state hides. Instead `tests/test_data.js` runs every state over
every unit, world and hero: at least two task types remain and every hero keeps its number of different attacks.
A running adventure needs no migration when the state changes, because `heroAttacks` already swaps an attack
whose task type is off when it is read.

A save from before the setting loads with no state and with `minus: 'erg'`, the method its child has learned
here; a new install follows the state. Choosing a state later pins the method for a child who has already done
written subtraction (`setLand`).

Consequences: changing the state is safe at any time and needs no clean-up; a profile can be corrected in the
table alone; subject keys (`Ethik`, `Sachkunde`) stay in data, saves and comparisons, and only `subjectLabel`
turns them into the shown name. The cost is that every place that prints a subject must call it, and that code
asking „is this off?“ must ask `offList`/`shown`, never the saved lists (`parentOff` is only what parents saved).

One task type is about the state itself („Mein Bundesland“, `kompass.land`, facts in `src/bundesland.ts`). It is
the one place where rules 1 and 2 do not hold: without a state there is nothing to ask, so `fightMods` leaves it
out whatever was switched or practised, and its generator takes only the questions of the chosen state.

Thüringen, Bremen and the Saarland are not in the table. An entry that says „not read yet“ would still be offered
as a choice.
