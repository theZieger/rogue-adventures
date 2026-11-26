# Feuer und Feuerwehr: Quellen

Zusammengestellt von einem KI-Agenten am 2026-11-26. Keine Lehrkraft und keine Feuerwehr hat die Inhalte geprüft;
im Zweifel entscheidet das Heft der Klasse.

## Lehrpläne

Grundlage sind die Auszüge in `lehrplan/laender/`. Im sächsischen Plan für Klasse 3 kommt Feuer im Sachunterricht
nicht vor (`sachsen-klasse-3-kurz.md`: nur die „vier Elemente“ in Ethik); Brandschutz steht in Sachsen in Klasse 1/2
(`klasse-1-2-sachunterricht-ethik-musik.md`).

| Land | Was der Plan nennt | Klasse | Datei |
|---|---|---|---|
| Baden-Württemberg | Kerze, Feuer, Verbrennungsdreieck, Löschen, Notruf | 3/4 | `baden-wuerttemberg.md` |
| Bayern | Feuer und Verbrennung, Löschen (Feuergefahren und Brandschutz in der Schule schon 1/2) | 3/4 | `bayern.md` |
| Hamburg | Vorhaben 3.2 „Feuer“ (Feuer und Feuerwehr) | 3 | `hamburg.md` |
| Mecklenburg-Vorpommern | Feuer, Verbrennungsdreieck, Verhalten im Brandfall | 3 | `mecklenburg-vorpommern.md` |
| Sachsen-Anhalt | Feuerdreieck, Brandschutz, Feuerwehr | 3/4 | `sachsen-anhalt.md` |
| Niedersachsen | Verbrennung | bis Ende 4 | `niedersachsen.md` |
| Nordrhein-Westfalen | Verbrennung und Löschen | bis Ende 4 | `nordrhein-westfalen.md` |
| Rheinland-Pfalz | Kerzenflamme (Experiment), Feuerwehr | bis Ende 4 | `rheinland-pfalz.md` |
| Berlin, Brandenburg | Wohnen früher (Steinzeit, Feuer) | ohne feste Klasse | `berlin.md` |
| Schleswig-Holstein | „Feuer, Wasser, Luft und Erde“ als freigestelltes Beispiel | – | `schleswig-holstein.md` |
| Hessen | nicht namentlich genannt | – | `hessen.md` |

Kein gelesener Plan legt das Thema auf Klasse 4 fest. Deshalb wird es nirgends voreingestellt ausgeblendet; in
`src/laender.ts` steht es außerhalb Sachsens als „noch nicht verglichen“, in Sachsen als „steht hier nicht im Plan“.

## Verhalten im Brandfall und Notruf

Die Regeln im Thema folgen diesen Quellen der Feuerwehren:

- Landesfeuerwehrverband Sachsen, „Konzeption Brandschutzerziehung, Teil 2“ (lfv-sachsen.de), Abschnitt 5.3.2
  „Richtiges Verhalten bei einem Brand“ und die „Leitsätze der Brandschutzerziehung für Kinder im
  Grundschulalter“: nicht verstecken, sofort den Raum verlassen; Erwachsene rufen und andere warnen; Fenster und
  Türen schließen; nicht zurück in den Brandraum, auch nicht für ein Spielzeug; in verqualmten Räumen kriechen, weil
  der Rauch nach oben steigt; 112 wählen, Fragen beantworten, warten und nicht auflegen; ist der Fluchtweg
  versperrt, zurück, Tür schließen, am Fenster bemerkbar machen; nie den Fahrstuhl. Abschnitt 5.4: Sauerstoff,
  brennbarer Stoff und Zündtemperatur, das Verbrennungsdreieck und die Löscharten (Sauerstoff, Brennstoff oder
  Zündtemperatur entziehen; Schneise beim Waldbrand; Gashahn; Löschdecke). Lerneinheit 1: Wachs, Docht,
  Brennschüssel, Gaszone und Flammenzone der Kerze; Glas über einem Teelicht, verschieden große Gläser. Abschnitt
  5.5: Aufgaben der Feuerwehr, Freiwillige Feuerwehr und Berufsfeuerwehr.
- vfdb und Deutscher Feuerwehrverband, Fachempfehlung „Verhalten im Brandfall“ (November 2019, vfdb.de): Tür zum
  Brandraum schließen (auch einfache Türen halten Feuer eine Zeit auf); Notruf aus einem sicheren Bereich; am
  wichtigsten ist der Notfallort, dazu „Was ist passiert?“ und „Wer ruft an?“, ob es Verletzte gibt, auf Fragen
  warten und erst auflegen, wenn die Leitstelle das Gespräch beendet; nicht zurück ins Gebäude; Rauch sammelt sich
  an der Decke; Türritzen abdichten, am Fenster bemerkbar machen; kein Wasser auf Fettbrände, Deckel auflegen.
- Die Reihenfolge der W-Fragen unterscheidet sich zwischen den Quellen (die sächsische Konzeption beginnt mit
  „Wer ruft an?“, die vfdb mit „Wo?“). Deshalb fragt das Thema keine feste Reihenfolge der W-Fragen ab, nur dass
  der Ort am wichtigsten ist (vfdb) und dass man zuletzt auflegt (beide).
- Brandschutzerziehung lässt Kinder unter Aufsicht Streichhölzer anzünden (sächsische Konzeption, Lerneinheit 1).
  Das Thema sagt deshalb nicht „nie anfassen“, sondern „nur zusammen mit einem Erwachsenen“.

## Nachgeschlagene Fakten

- Rauchmelder: Im Schlaf riecht man keinen Rauch; die meisten Brandopfer sterben am Rauch, nicht an den Flammen
  (mehrere Ratgeber, unter anderem Innenministerium Baden-Württemberg „Rauchmelder retten Leben“). Genaue Zahlen
  weichen zwischen den Quellen ab und stehen deshalb nicht im Thema.
- Kerzenflamme: dunkle, kühlere Zone mit Wachsdampf um den Docht, leuchtende Zone mit glühenden Rußteilchen, am
  heißesten der Flammensaum; nur der Wachsdampf brennt (Wikibooks „Anorganische Chemie für Schüler: Die
  Kerzenflamme“, Material „Feuer und Flamme“ der QUA-LiS NRW, Kinderuni Wien „Was brennt bei einer Kerze“).
- Erste Berufsfeuerwehr Deutschlands: Berlin 1851 (Berliner Feuerwehr, Chronik 1851–2026; 175-Jahr-Feier 2026).
  Welche Freiwillige Feuerwehr die erste war, ist umstritten (Meißen 1841, Durlach 1846 und andere); das Thema
  nennt deshalb keine.
- Reibstreichhölzer gibt es seit 1826 (John Walker), also seit etwa 200 Jahren.
- Im alten Rom gab es Nachtwächter, die Brände löschten (die Vigiles, unter Augustus).
- Die 112 gilt in der ganzen EU, kostet nichts und geht auch ohne Guthaben.
