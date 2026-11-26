# Sonne, Mond und Sterne: Quellen

Zusammengestellt von einem KI-Agenten am 2026-11-26. Keine Lehrkraft hat die Inhalte geprüft; im Zweifel
entscheidet das Heft der Klasse.

## Lehrpläne

Grundlage sind die Auszüge in `lehrplan/laender/`. Im sächsischen Plan für Klasse 3 kommen Sonne, Mond, Planeten
und Sterne nicht vor (`sachsen-klasse-3-kurz.md`, kein Treffer). In Klasse 1/2 gibt es dort die Aufgabenart
„Sonne, Mond und Sterne“ in `natur2`; dieses Thema baut darauf auf und widerspricht ihr nicht.

| Land | Was der Plan nennt | Klasse | Datei |
|---|---|---|---|
| Berlin, Brandenburg | Themenfeld Erde: Sonnensystem, Tag und Nacht | ohne feste Klasse (Schule entscheidet) | `berlin.md`, `brandenburg.md` |
| Rheinland-Pfalz | Raum: „Planet Erde im Sonnensystem“; Zeit: Tag, Nacht, Jahreszeiten | nur Ende Klasse 4 | `rheinland-pfalz.md` |
| Schleswig-Holstein | Phänomene der unbelebten Natur: „astronomische Grundkenntnisse“, Astronomie | 3/4 | `schleswig-holstein.md` |
| Sachsen-Anhalt | Sonne, Mond, Planeten, Mondphasen; Tag/Nacht, Jahreszeiten | Schuleingangsphase (1/2) | `sachsen-anhalt.md` |
| Hamburg | 2.3 Rund um die Zeit: Tag und Nacht, Jahreszeiten | 1/2 | `hamburg.md` |
| Hessen | Zeit: Tag und Nacht, Jahreszeiten | 1/2 | `hessen.md` |
| Mecklenburg-Vorpommern | Tagbogen der Sonne (3/4); Sonne, Mond und Sterne nur im Philosophieren 1/2 | 3/4 | `mecklenburg-vorpommern.md` |
| Nordrhein-Westfalen | Sonnenstand (Orientierung), Jahreszeiten | Ende 4 / Ende 2 | `nordrhein-westfalen.md` |
| Thüringen (nicht angeboten) | Tag/Nacht, Mond, Sonne und Planeten, Galilei und Kopernikus | bis Ende Klasse 4 | `thueringen.md` |
| Baden-Württemberg, Bayern, Niedersachsen | kein Treffer in den Auszügen | – | jeweilige Datei |

In keinem angebotenen Land legt ein gelesener Plan das Thema ausdrücklich auf Klasse 4 fest, deshalb wird es
nirgends ausgeblendet. In `src/laender.ts` steht es außerhalb Sachsens auf „noch nicht verglichen“, in Sachsen auf
„steht hier nicht im Plan“.

## Nachgeschlagene Fakten

- Reihenfolge der acht Planeten; Merkur kleinster Planet und sonnennah; Venus etwa 470 Grad Celsius durch die dichte
  Lufthülle (Merkur höchstens 430 Grad), nach Sonne und Mond der hellste Himmelskörper; Erde einziger Planet mit
  stabilem flüssigem Wasser und Leben; Mars „Roter Planet“; Merkur bis Mars mit fester Oberfläche, Jupiter bis
  Neptun Gasplaneten; Jupiter größter Planet mit dem Großen Roten Fleck (Wirbelsturm); Saturn „Planet der Ringe“,
  Uranus’ Ringe dunkler; Uranus „rollt“ mit 98 Grad geneigter Achse; Neptun äußerster Planet mit den stärksten
  Winden; Pluto seit 2006 Zwergplanet; die Jahreszeiten entstehen durch die Neigung der Erdachse; wir sehen vom Mond
  immer dieselbe Seite; die Sonne als glühend heißer Gasball. DLR, Poster „Das Sonnensystem“ 2020
  (solarsystem.dlr.de, Poster_Sonnensystem_2020_web.pdf).
- Mars: rötlicher Staub durch oxidiertes Eisen (Rost). DLR_next, Mitmach-Experiment „Der Rost-Planet“, und
  DLR-Meldung zu Mars Express vom 2. Juni 2023.
- Die Sonne ist ein Stern der Milchstraße; ihr Licht braucht etwas mehr als 8 Minuten zur Erde. DLR_next,
  Lernmodul „Sonnensystem“.
- Mondphasen und ihre Reihenfolge, von der Nordhalbkugel aus gesehen (zunehmend rechts hell); auf der Südhalbkugel
  umgekehrt. IAU Office of Astronomy for Education, Diagramm „Mondphasen (nördliche Hemisphäre)“ (astro4edu.org);
  Lernarchiv Hessen, Arbeitsblatt „Mond“. Merkhilfe a wie abnehmend (Bauch eines kleinen a = linke Seite hell):
  Studyflix „Mondphasen“. Die z-Hälfte der Regel hängt von der Schreibschrift ab und ist deshalb weggelassen.
- Großer Wagen: sieben hellere Sterne, Teil des Großen Bären; Polarstern an der Deichselspitze des Kleinen Wagens;
  in Europa das ganze Jahr zu sehen. DLR_next, „Wo sind der Kleine Wagen und der Große Wagen geblieben?“.
  Hintere Wand des Wagens etwa fünfmal verlängern: Planetarium Freiburg, Arbeitsblätter Sternbilder; Spektrum
  „Wissenschaft in die Schulen“.
- Sternschnuppen sind verglühende, höchstens millimetergroße Teilchen (Meteore), keine Sterne. DLR_next,
  „Was sind Sternschnuppen?“.
- ISS: seit November 2000 ständig bewohnt, Forschung in Schwerelosigkeit; Matthias Maurer flog im November 2021 zur
  ISS. DLR, „Die Internationale Raumstation ISS“. Täglich Training gegen Muskel- und Knochenabbau: DLR, deutsche
  Astronautinnen und Astronauten. Etwa alle 90 Minuten eine Erdumrundung, etwa 16 Sonnenaufgänge am Tag,
  Schlafsack an der Wand: ESA „A good night’s sleep in orbit“, DLR-Blog „Alltag auf der ISS“.
- Juri Gagarin 1961 erster Mensch im All; Neil Armstrong 1969 erster Mensch auf dem Mond (Apollo 11). ESA,
  „Juri Gagarin – 50 Jahre bemannte Raumfahrt“; DLR_next, Apollo-11-Special.
- Sigmund Jähn 1978 erster Deutscher im All; Alexander Gerst 2018 erster deutscher Kommandant der ISS. DLR,
  „Deutsche Astronautinnen und Astronauten und ihre Missionen“; deutschland.de.

## Nicht nachgeschlagen (Schulwissen, nicht einzeln belegt)

Erdrotation in etwa 24 Stunden von West nach Ost, Sonnenaufgang im Osten, Mittag im Süden, kürzester Schatten am
Mittag; Görlitz vor Aachen; Jahr mit 365 Tagen und etwa 6 Stunden, Schaltjahr; längster Tag um den 21. Juni,
kürzester um den 21. Dezember, Tagundnachtgleiche im März und September; die Erde ist der Sonne Anfang Januar am
nächsten; umgekehrte Jahreszeiten auf der Südhalbkugel; Mond ohne Luft, Einschlagkrater, schwächere Anziehung;
etwa 29 und ein halber Tag von Vollmond zu Vollmond (wie in `religionen.ts`); Merksatz „Mein Vater erklärt mir
jeden Sonntag unseren Nachthimmel“; Kassiopeia als W, die drei Gürtelsterne des Orion; mehr Sterne auf dem Land
als in der Stadt; nicht in die Sonne schauen; Wasser schwebt in Schwerelosigkeit als Kugel.

## Bewusst weggelassen

- Zahlen, die sich ändern oder ein Komma brauchen: Zahl der Monde, Entfernungen, Höhe und Geschwindigkeit der ISS,
  Zahl der Menschen auf dem Mond oder im All, das geplante Ende der ISS.
- Die Achsneigung in Grad, Temperaturen und Durchmesser der Planeten.
- Galilei und Kopernikus (nur im Plan von Thüringen, das nicht angeboten wird).
