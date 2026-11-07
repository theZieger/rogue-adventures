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

Updates kommen automatisch: nach einem neuen Build lädt die App die neue Version beim nächsten Start.

## Modi

| Modus | Inhalt |
|---|---|
| 🧮 Zahlenquest | Addition/Subtraktion bis 1000, Einmaleins, Zahlenrätsel, Zahlenfolgen, Nachbarzahlen, Zahlengitter – 3 Welten, adaptive Schwierigkeit (Welt 1 unter 100) |
| ⛪ Luthers Weg | Ethik: Martin Luther und die Reformation – Richtig/Falsch, Wähle aus, Lückentext, Begriffe, Reihenfolge |
| 🥔 Kartoffel-Werkstatt | Sachkunde: Pflanzenteile (mit Zeichenschule), Wachstum, Herkunft, Ernte früher/heute, Kartoffelkäfer, Kartoffelwörter, „Der Bauer und der Teufel“ |

- Kein Zeitdruck. Volltreffer über eine Kombo-Leiste (3 richtige in Folge) oder Typ-Vorteil.
- Jede Aufgabenart hat eine Erklärung („🛈 Wie geht das?“), die beim ersten Mal automatisch erscheint.
- Falsch beantwortete Wissensfragen kommen schneller wieder (Spaced Repetition).
- Elternbereich: 5× auf den Titel tippen → Trefferquote pro Aufgabenart, Reset.
- Fortschritt wird im Browser gespeichert (localStorage), pro Modus ein Spielstand.

## Projektstruktur

```
src/style.css      Design (Portrait-first, eingebauter Ziffernblock, hoher Kontrast)
src/logic.js       Mathe-Generatoren, Monster-/Gegnerdaten, Karte
src/knowledge.js   Wissensinhalte Ethik + Kartoffel (Fragen, Notizkarten, Tutorials)
src/monsters.js    Handgezeichnete SVG-Monster
src/app.js         Spiel-Engine (Screens, Kampf, Aufgaben-UI, Speicherung)
src/sw.js          Service Worker (Offline-Cache, Version wird beim Build gesetzt)
src/manifest.webmanifest  App-Manifest (Name, Farben, Icons)
build.py           baut docs/index.html (eine Datei) + docs/sw.js + docs/manifest.webmanifest
tools/make_icons.js  erzeugt docs/icons/* aus der Sonnenfuchs-Grafik (Playwright, nur bei Icon-Änderungen)
tests/             Generator-Tests + automatischer Bot-Durchlauf (jsdom)
docs/index.html    gebaute Spieldatei → GitHub Pages
docs/icons/        App-Icons (Android maskable, iOS, Desktop, Favicon)
```

## Entwickeln

```bash
npm install          # nur jsdom für die Tests
npm run build        # src/* -> docs/index.html
npm test             # Generatoren + Wissensfragen prüfen
npm run playtest     # Bot spielt alle drei Modi durch
```

Inhalte anpassen:
- Pflanzenteil-Namen: `PARTS` in `src/knowledge.js`
- Fragen: `L_POOL` (Luther) und `K_POOL` (Kartoffel) in `src/knowledge.js`
- Schwierigkeitsstufen pro Welt: `worldCap` in `MODULES` (`src/logic.js`) bzw. `K_MODULES`
- Gegner/Balance: `ENEMIES` in `src/logic.js`, `L_ENEMIES`/`K_ENEMIES` in `src/knowledge.js`

## Veröffentlichen (GitHub Pages)

Repository → Settings → Pages → Source „Deploy from a branch“, Branch `main`, Ordner `/docs`.
Nach jedem `npm run build` die geänderte `docs/index.html` committen und pushen.

## Lizenz

MIT. Die Lerninhalte folgen den Arbeitsblättern der Klasse; das Kartoffelkäfergedicht (J. Guggenmos) ist bewusst nicht enthalten.
