# Lernquest 🎒

Ein Roguelike-Lernspiel für Grundschüler (ca. 3. Klasse) – Monster, Karte, Attacken.
Jede Attacke ist eine Aufgabe: richtig gelöst = Treffer, falsch = der Gegner schlägt zu.
Komplett in einer HTML-Datei, kein Server, kein Account. Deutsch.

**Spielen:** https://thezieger.github.io/rogue-adventures/

## Als App installieren

Lernquest ist eine Web-App (PWA) – einmal installiert, startet es wie eine normale App mit eigenem Symbol und läuft auch **offline**.

| Gerät | So geht's |
|---|---|
| Android (Chrome, Edge, Samsung Internet) | Seite öffnen → Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“ |
| iPhone / iPad (Safari) | Seite öffnen → Teilen-Symbol → „Zum Home-Bildschirm“ |
| Windows / macOS / Linux / ChromeOS (Chrome, Edge) | Installieren-Symbol rechts in der Adressleiste oder Menü → „App installieren“ |
| Mac (Safari 17+) | Ablage → „Zum Dock hinzufügen“ |

Updates kommen automatisch: Beim Öffnen holt die App (mit Internet) normalerweise sofort die neueste Version – bei sehr langsamer Verbindung startet nach 3–4 Sekunden die gespeicherte und das Update folgt beim nächsten Mal. Wird ein Update veröffentlicht, während die App offen ist, wird es eingespielt, sobald sie in den Hintergrund geht – nie mitten im Kampf. Ohne Internet startet die zuletzt geladene Version.

## Modi

| Modus | Inhalt |
|---|---|
| 🧮 Zahlenquest | Addition/Subtraktion bis 1000, Einmaleins, Zahlenrätsel, Zahlenfolgen, Nachbarzahlen, Zahlengitter – 3 Welten, adaptive Schwierigkeit (Welt 1 unter 100) |
| 🎪 Der Jahrmarkt | Mathe, Größen und Daten: Uhrzeit auf die Minute und Zeitspannen (Uhr als Bild), m/cm/km, g/kg mit Waage und Stützpunkten, Glücksrad (sicher, möglich, unmöglich, wahrscheinlicher), Kombinationen zählen, Säulendiagramm, Sachaufgaben mit „3 € 50 ct“ – 2 Welten |
| ⛪ Luthers Weg | Ethik: Martin Luther und die Reformation – Richtig/Falsch, Wähle aus, Lückentext, Begriffe, Reihenfolge |
| 🕯️ Das Kirchenjahr | Ethik: Buß- und Bettag, innere und äußere Konflikte, Kreuz, Kirche, Bibel, Zehn Gebote, Advent und Weihnachten (Lukas), Ethik und Religion |
| ✏️ Wörterwerkstatt | Deutsch, Richtig schreiben: doppelte Mitlaute/ck/tz, Verlängern (d/t, g/k, b/p), silbentrennendes h, Groß oder klein, zusammengesetzte Wörter mit Artikel, Wörterbuch-Reihenfolge, wörtliche Rede |
| 🏗️ Satzbaustelle | Deutsch, Sprache untersuchen: Wortarten, Zeitformen (Präsens/Präteritum), Steigerung mit „als“/„wie“, Subjekt und Prädikat, Umstellprobe, Oberbegriffe, Teekesselwörter |
| 🥔 Kartoffel-Werkstatt | Sachkunde: Pflanzenteile (mit Zeichenschule), Wachstum, Herkunft, Ernte früher/heute, Kartoffelkäfer, Kartoffelwörter, „Der Bauer und der Teufel“ |
| 🌾 Die Kornkammer | Sachkunde: Weizen, Roggen, Gerste, Hafer, Mais (Ähre, Rispe, Kolben), Teile der Getreidepflanze mit Zeichenschule, vom Korn zum Brot, Verwendung, Wertschätzung von Lebensmitteln |
| 🌦️ Die Wetterstation | Sachkunde: fest/flüssig/gasförmig, gefrieren, schmelzen, verdampfen, verdunsten, kondensieren, Wasserkreislauf als Bild, Wettervorhersage lesen, Bauernregeln; Kartenfeld „Forscherlabor“ (erst vermuten, dann Ergebnis) |
| 🧭 Kompass und Karte | Sachkunde: Haupt- und Nebenhimmelsrichtungen, Windrose, Lauf der Sonne, Plan mit Legende; Kartenfeld „Schatzkarte“ (5 × 5 Felder, Stufe 2 mit Nebenrichtungen, Stufe 3 mit Maßstab) |

- Kein Zeitdruck. Alle vier Attacken sind von Anfang an da; der Schaden steht als ganze Zahl auf dem Knopf.
- Abwechseln lohnt sich: Dieselbe Attacke direkt nochmal wird „müde“ und macht weniger Schaden. „stark!“ zeigt den Typ-Vorteil.
- Gegenstände: Trank, Großer Trank, Beere, Schild, Chilischote (doppelter Schaden), Eselsbrücke (Tipp), Schutzengel, Fleißbienchen (XP).
- „Was ist neu?“ im Spiel zeigt `CHANGELOG.md`.
- Jede Aufgabenart hat eine Erklärung („🛈 Wie geht das?“), die beim ersten Mal automatisch erscheint.
- Falsch beantwortete Wissensfragen kommen schneller wieder (Spaced Repetition).
- Elternbereich: 5× auf den Titel tippen → Trefferquote pro Aufgabenart, Aufgabenarten an/aus, Töne, Reset.
- Startseite: Klasse → Fach → Einheit. Neue Klassen/Fächer in `CURRICULUM` (`src/app.js`) eintragen.
- „Idee senden“ schickt Ideen, Fehler und Lob direkt aus dem Spiel an ein Google-Formular (kein Konto nötig) – siehe „Feedback“.
- Töne sind gemeinfreie Clips (CC0) in `docs/sounds/` (Quellen in `docs/sounds/SOURCES.md`); Animationen respektieren „Bewegung reduzieren“.
- Fortschritt wird im Browser gespeichert (localStorage), pro Modus ein Spielstand – auch mitten im Kampf. Beim Weiterspielen geht es genau dort weiter.
- Keine Daten verlassen das Gerät: keine Konten, kein Tracking, keine externen Schriften. Einzige Ausnahme: eine Nachricht, die man selbst mit „Idee senden“ abschickt.
- Bedienbar per Touch, Maus oder Tastatur (Ziffern, ⌫, Enter); hoch- und querformattauglich.

## Projektstruktur

```
src/style.css      Design (Portrait-first, eingebauter Ziffernblock, hoher Kontrast)
src/logic.js       Mathe-Generatoren, Monster-/Gegnerdaten, Karte
src/jahrmarkt.js   Mathe-Einheit Der Jahrmarkt (Generatoren, Uhr/Glücksrad/Waage/Diagramm als SVG)
src/woerter.js     Wortlisten und Sätze für Deutsch – hier können Eltern Lernwörter ergänzen (Aufbau im Dateikopf)
src/knowledge.js   Wissensinhalte Ethik, Kartoffel und Deutsch (Fragen, Notizkarten, Tutorials)
src/sachkunde.js   Sachkunde-Einheiten Kornkammer, Wetterstation, Kompass und Karte (Fragen, Bilder, Forscherlabor, Schatzkarte)
src/monsters.js    Handgezeichnete SVG-Monster
src/app.js         Spiel-Engine (Screens, Kampf, Aufgaben-UI, Speicherung)
src/sw.js          Service Worker (Offline-Cache, Version wird beim Build gesetzt)
src/manifest.webmanifest  App-Manifest (Name, Farben, Icons)
CHANGELOG.md       Änderungen nach Datum – wird im Spiel unter „Was ist neu?“ angezeigt
build.py           baut docs/index.html (eine Datei) + docs/sw.js + docs/manifest.webmanifest
tools/make_icons.js  erzeugt docs/icons/*, docs/favicon.ico, die iOS-Startbildschirme docs/splash/* und die Installations-Screenshots docs/screenshots/* (braucht Playwright mit Chromium und ImageMagick; nur bei Grafik-Änderungen, nach `npm run build`)
tests/             Generator-Tests + automatischer Bot-Durchlauf (jsdom)
docs/index.html    gebaute Spieldatei → GitHub Pages
docs/icons/        App-Icons (Android maskable, iOS, Desktop, Favicon)
docs/splash/       iOS/iPadOS-Startbildschirme
docs/screenshots/  Bilder für den Installieren-Dialog (Android/Desktop)
docs/sounds/       Töne (CC0, Quellen in SOURCES.md)
docs/fonts/        Schriften Patrick Hand und Andika (SIL OFL) – lokal eingebunden, keine Verbindung zu Google
```

## Entwickeln

```bash
npm install          # nur jsdom für die Tests
npm run build        # src/* -> docs/index.html
npm test             # Generatoren, Wissensfragen, Speichern/Laden prüfen (braucht gebautes docs/)
npm run playtest     # Bot spielt alle Modi durch
```

Inhalte anpassen:
- Pflanzenteil-Namen: `PARTS` in `src/knowledge.js`
- Getreide und Wasserkreislauf: `GRAIN_PARTS`, `CYCLE_PARTS` in `src/sachkunde.js`; Orte im eigenen Landkreis: `LANDKREIS` (leer = keine Landkreis-Aufgaben)
- Fragen: `L_POOL` (Luther), `KJ_POOL` (Kirchenjahr) und `K_POOL` (Kartoffel) in `src/knowledge.js`
- Deutsch-Wörter und -Sätze: `src/woerter.js` (danach `npm run build && npm test`)
- Schwierigkeitsstufen pro Welt: `worldCap` in `MODULES` (`src/logic.js`) bzw. `K_MODULES`
- Gegner/Balance: `ENEMIES` in `src/logic.js`, `L_ENEMIES`/`KJ_ENEMIES`/`K_ENEMIES` in `src/knowledge.js`

## Veröffentlichen (GitHub Pages)

Repository → Settings → Pages → Source „Deploy from a branch“, Branch `main`, Ordner `/docs`.
Nach jedem `npm run build` das geänderte `docs/` committen und pushen. Die CI prüft, dass `docs/` zum Stand von `src/` passt.

## Feedback

„💡 Idee senden“ (Startseite und Elternbereich) schickt die Nachricht direkt aus dem Spiel an das Google-Formular „Feedback“ – kein Konto nötig, man verlässt das Spiel nicht. Klappt das Senden nicht (z. B. offline), bleibt der Text stehen und es gibt einen Link, der das Formular mit vorausgefülltem Text in einem neuen Tab öffnet.

Ein anderes Formular verwenden: In `FEEDBACK` (`src/app.js`) die Formular-Adresse (bis vor `/viewform`) und die Feld-ID eintragen. Die Feld-ID findet man über ⋮ → „Vorausgefüllten Link abrufen“ (Teil `entry.123456789` im Link). Das Formular darf keine Anmeldung verlangen und nur eine Pflichtfrage (Absatz) haben.

## Texte und Namen

`tools/unslop-text.md` und `tools/unslop-visual.md` listen die Floskeln und Namensmuster, die im Spiel vermieden werden (Ergebnis einer Analyse von 40 generierten Text- und 20 Spielproben). Neue Gegner, Attacken, Gegenstände, Meldungen und Gestaltung bitte daran prüfen.

## Lizenz

MIT. Die Lerninhalte folgen den Arbeitsblättern der Klasse; das Kartoffelkäfergedicht (J. Guggenmos) ist bewusst nicht enthalten.
