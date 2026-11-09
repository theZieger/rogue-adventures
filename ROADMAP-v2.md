# Lernquest v2 – Bauplan für alle Arbeitsschritte

Dieses Dokument ist die gemeinsame Spezifikation für die v2-Entwicklung. Jede Code-Session bekommt genau
einen Schritt aus Abschnitt C zugewiesen, liest vorher Abschnitt A und B vollständig und README.md sowie CLAUDE.md.
Design-Hintergrund (Recherche, Lehrplan Sachsen Klasse 3, Wireframes) liegt beim Eigentümer; die hier
beschriebenen Entscheidungen sind verbindlich. Wo etwas offen ist, steht es als „Entscheidung der Session“.

## A. Arbeitsweise

### Branches und Pull Requests
- Integrationsbranch ist `v2`. **Nie direkt auf `v2` oder `main` pushen.**
- Jeder Schritt arbeitet auf seinem eigenen Branch `v2-NN-kurzname` (Bindestrich, nicht Schrägstrich: GitHub erlaubt kein `v2/…`, solange der Branch `v2` existiert) (Nummer wie in Abschnitt C), abgezweigt
  von der aktuellen Spitze von `origin/v2`.
- Am Ende: Pull Request **gegen `v2`** (nicht gegen `main`). Titel: `v2/NN: <was der Spieler bekommt>`.
  PR-Text: was gebaut wurde, welche Entscheidungen getroffen wurden, wie getestet, bekannte Lücken.
- Die CI (`.github/workflows/ci.yml`) läuft auf jedem Push: `npm ci`, `npm run build`, Prüfung dass `docs/` zum
  Stand von `src/` passt, `npm test`, `npm run playtest`. Der PR muss grün sein.
- Vor dem Öffnen des PR: `git fetch origin v2 && git rebase origin/v2`, dann `npm run build && npm test &&
  npm run playtest`, dann erst pushen. Konflikte in `docs/index.html`, `docs/sw.js` oder `docs/manifest.webmanifest`
  **nie von Hand lösen**: eigene Version verwerfen (`git checkout --theirs` bzw. Datei löschen), `npm run build`
  ausführen und das Ergebnis committen. Konflikte in `CHANGELOG.md`: beide Seiten behalten, Einträge unter dem
  passenden Datum zusammenführen, Datumsreihenfolge prüfen (der Build bricht sonst ab).
- Wenn die Session fertig ist, meldet sie sich beim Orchestrator (Session-ID steht im Auftrag) mit PR-Nummer,
  Branch und einer Zusammenfassung in drei Sätzen. Danach bleibt sie erreichbar: Fragen, CI-Fehler und
  Konflikte kommen als Nachricht zurück und werden von der Session auf demselben Branch behoben.
- Keine neuen Abhängigkeiten (`package.json` nur für Tests anfassen), keine neuen Build-Schritte, alles bleibt eine
  HTML-Datei plus Service Worker. Neue Dateien in `src/` müssen in `build.py` eingebunden werden; neue Assets, die
  offline gebraucht werden, in `CORE` in `src/sw.js`.

### Qualitätsregeln (Kurzfassung von CLAUDE.md, dort gilt der volle Text)
- Nur `src/*` editieren, `docs/*` wird gebaut und mitcommittet.
- **Jede sichtbare Änderung bekommt einen Eintrag in `CHANGELOG.md`** unter dem heutigen Datum, Gruppen
  `### Neu`, `### Verbessert`, `### Behoben`, kurze deutsche Sätze für Kinder und Eltern, keine Technikwörter.
  Der Eintrag vom 2026-11-07 bleibt unverändert.
- **Spielstände dürfen nie kaputtgehen.** Storage-Schlüssel und vorhandene Felder nie umbenennen. Neue Felder nur
  mit Default in `defaultMeta()` und defensivem Laden. Jede Änderung am Spielstand wird in
  `tests/test_storage.js` abgedeckt (alter Spielstand lädt, neues Feld hat Default, Reload mitten im Spiel).
- Code: so wenig wie nötig, keine spekulativen Abstraktionen, Kommentare nur für ein nicht offensichtliches Warum.
  Der bestehende Stil (eine IIFE in `app.js`, Daten in `logic.js`/`knowledge.js`, Template-Strings, `render()`)
  wird fortgeführt. Keine Frameworks.
- Alle Spielertexte deutsch, kindgerecht, deutsche Typografie („…“, –), ganze Zahlen, kein Zeitdruck, keine
  Countdowns. Neue Namen und Texte gegen `tools/unslop-text.md` prüfen (keine Bindestrich-Alliterationen,
  keine Verniedlichungen, kein Lobgewitter, keine Emojis als Schmuck).
- Keine Anfragen nach außen zur Laufzeit außer dem Feedback-Formular. Keine Markennamen fremder Spiele oder Apps
  im Spiel (eigene Namen, eigene Grafik).
- Bedienbar per Touch, Maus und Tastatur, Portrait zuerst, `prefers-reduced-motion` respektieren, Kontrast hoch.
- Vorher-Nachher-Screenshots (390×844 bei 2×, Playwright ist in der Cloud-Session vorinstalliert) jeder
  geänderten Ansicht gehören in den PR-Text als kurze Beschreibung; wenn möglich als Artefakt-Seite veröffentlichen
  und verlinken. Der Eigentümer prüft `v2` lokal.
- Tests: Generatoren in `tests/test_generators.js`, Wissensfragen in `tests/test_knowledge.js`, Daten in
  `tests/test_data.js`, Speichern in `tests/test_storage.js`, Bot in `tests/playtest.js`. Neue Mechaniken, die
  der Bot erreichen kann, muss er auch spielen können, sonst bricht `npm run playtest`.

## B. Gemeinsames Datenmodell (meta)

Alle neuen Felder leben im bestehenden Meta-Objekt (`KEY_META`), bekommen Defaults in `defaultMeta()` und werden
beim Laden defensiv geprüft wie die vorhandenen. Der Export (Schritt 02) nimmt das ganze Meta-Objekt plus alle
Run-Speicherstände mit, deshalb gehört **alles Persistente in meta oder die Run-Keys**, nirgendwo sonst.

| Feld | Typ | Default | Schritt | Bedeutung |
|---|---|---|---|---|
| `setup` | `{ done: bool, skipped: bool, at: string }` | `{done:false,skipped:false,at:''}` | 01 | Einrichtungsdialog gesehen |
| `pin` | `string` | `''` | 01 | Hash der Eltern-PIN (leer = keine PIN) |
| `storage` | `{ persisted: bool, warnedAt: string }` | `{persisted:false,warnedAt:''}` | 01 | Dauerspeicher angefragt, Hinweis gezeigt |
| `backupAt` | `string` ISO-Datum | `''` | 02 | letzter Export |
| `progressAt` | `string` ISO-Datum | `''` | 02 | letzter Sieg oder Kauf (steuert die Sicherungs-Erinnerung); jeder Schritt, der etwas Wertvolles hinzufügt (Kauf, Ernte, Wochenaufgabe), setzt es |
| `stamps` | `number` | `0` | 03 | Stempel-Guthaben |
| `stampsTotal` | `number` | `0` | 03 | je verdient (für Belohnungen nach Taten) |
| `stampCard` | `{ [yyyy-Www]: 1 \| 2 }` | `{}` | 03/04 | 1 = in der Woche gespielt, 2 = Wochenaufgabe geschafft |
| `weekly` | `{ week: string, progress: number[], done: bool, beaten: {[mode]: bool}, tally: {...} }` | `{week:'',progress:[],done:false,beaten:{},tally:{}}` | 04 | Fortschritt der aktuellen Woche; `beaten` = Wochenboss je Einheit besiegt, `tally` = geübte Aufgabenarten dieser Woche für den Wochenbericht |
| `owned` | `{ [id]: true }` | `{}` | 05+ | gekaufte/erspielte Dinge (Kleidung, Helden, Karten, Kreiselteile, Möbel) |
| `worn` | `{ [heroId]: outfitId }` | `{}` | 05 | angezogene Kleidung je Held |
| `garden` | `{ beds: [{ crop: string \| null, plantedAt: number }] }` | 4 Beete, leer | 09 | Schulgarten |
| `top` | `{ tip: string, ring: string, disc: string }` | Standardteile | 10 | zusammengebauter Kreisel |
| `materials` | `{ [id]: number }` | `{}` | 12/13 | Holz, Stein, Erz, Ernte |
| `pantry` | `string[]` (Ids aus `ITEMS`) | `[]` | 13 | Vorrat aus der Werkbank, höchstens drei; kommt beim Start des nächsten Abenteuers in `run.items` und wird geleert |
| `hut` | `{ rooms: number, items: string[] }` | `{rooms:1,items:[]}` | 13 | Meine Hütte: `rooms` 1 oder 2 (Zweites Zimmer), `items` = Möbel-Ids, die im zweiten Zimmer stehen; gebaute Möbel selbst stehen in `owned['hut-…']` |

Kalenderwoche: ISO-Woche nach ISO 8601, Schlüssel `2026-W46`. Eine kleine Hilfsfunktion `isoWeek(date)` kommt in
Schritt 03 nach `logic.js` und wird von allen späteren Schritten benutzt. Wochenaufgaben werden aus dem
Wochenschlüssel mit einem festen kleinen PRNG (z. B. mulberry32 über einen Hash des Schlüssels) erzeugt, damit alle
Geräte dieselben Aufgaben zeigen.

Im Run (`run`): `coins` (Cent als ganze Zahl, Schritt 08), `arena`/`top`-Zustand nur im Kampfknoten (Schritt 10).

## C. Schritte

Reihenfolge ist Priorität. Abhängigkeiten stehen dabei. Jeder Schritt ist ein PR.

### 01 Elternbereich neu, Einrichtungsdialog mit PIN, Speicher-Sicherheit
Ziel: Einstellungen sind für neue Besucher sofort auffindbar, nur Eltern ändern sie, und ein Spielstand geht nicht
mehr unbemerkt verloren.
- **Einrichtungsdialog beim ersten Start** (wenn `meta.setup.done` und `.skipped` beide falsch): Vollbild-Karte
  „Willkommen bei Lernquest“, Absatz für Eltern. Drei Wege: „PIN festlegen“ (vierstellig, Ziffernblock wie bei
  Aufgaben, zweimal eingeben), „Spielstand laden“ (ab Schritt 02 aktiv; in Schritt 01 als Knopf vorsehen, der zu
  einem Platzhalter im Elternbereich führt) und „Später“ (setzt `skipped`, Dialog kommt nicht wieder; im Elternbereich
  steht dann oben ein Hinweis „Noch keine PIN“). Kinder sollen trotzdem sofort spielen können: „Später“ ist nicht
  versteckt.
- **Sichtbarer Zugang:** Zahnrad-Knopf oben rechts auf dem Titelbild mit Text „Eltern“ (nicht nur Icon). Der
  5-Tipp-Trick auf den Titel kann bleiben, ist aber nicht mehr nötig. Mit PIN: PIN-Abfrage per Ziffernblock, drei
  Fehlversuche → kurze Pause von 30 Sekunden (einzige Ausnahme von „kein Zeitdruck“, betrifft nur Eltern).
  „PIN vergessen?“: Elternschranke mit einer Multiplikation zweier zweistelliger Zahlen (z. B. 23 · 17), danach neue
  PIN setzen. PIN wird nicht im Klartext gespeichert (einfacher Hash reicht; es ist eine Elternschranke, keine
  Verschlüsselung; das steht so als Kommentar dran).
- **Elternbereich neu strukturiert** in vier Reiter oder klar getrennte Abschnitte mit Sprungleiste oben:
  1. **Üben**: Klasse, Fach, Aufgabenarten an/aus (bestehende Toggles), Hinweis zur Anpassung der Stufe.
  2. **Fortschritt**: Trefferquote pro Aufgabenart (bestehende Tabellen), Wissensfragen mit Schwierigkeiten,
     ab Schritt 04 der Wochenbericht.
  3. **Spielstand**: Sichern und Laden (Schritt 02), Statistik zurücksetzen, Alles löschen, Dauerspeicher-Status.
  4. **App**: Töne, Erklärungen zurücksetzen, PIN ändern oder entfernen, Idee senden, Version.
  Bestehende Funktionen bleiben alle erhalten; `tests/test_storage.js` Test 1 (Elternbereich löscht kein Abenteuer)
  muss weiter laufen.
- **Speicher-Sicherheit:** beim Start `navigator.storage.persist()` anfragen (einmal, Ergebnis in `meta.storage`).
  Wenn die App im Browser (nicht installiert, `display-mode: browser`) auf iOS/Safari läuft, einmal pro Monat auf dem
  Titelbild eine schließbare Karte: „Safari löscht gespeicherte Spiele nach 7 Tagen Pause. Installiere Lernquest auf
  dem Startbildschirm oder sichere den Spielstand im Elternbereich.“ Mit Knopf zum Elternbereich.
- Playtest-Bot und Storage-Tests müssen den Dialog überspringen können (z. B. Bot setzt `setup.skipped` oder klickt
  „Später“). Neue Tests: PIN setzen, falsche PIN, Elternschranke, Dialog erscheint nur einmal.

### 02 Spielstand-Code: Sichern, Laden, Zusammenlegen (hängt von 01 ab)
- **Export:** Knopf „Spielstand sichern“ im Reiter Spielstand. Inhalt: `{ v: 1, at: ISO, meta, runs: { math, ethik,
  kartoffel, … } }` → JSON → deflate mit `CompressionStream('deflate-raw')` wenn vorhanden, sonst unkomprimiert →
  base64url. Präfix `LQ1.` (komprimiert) bzw. `LQ0.` (roh). Anzeige als Textblock, Knöpfe „Kopieren“ (Clipboard mit
  Fallback: Text markieren) und „Teilen“ (`navigator.share` mit Text, sonst ausblenden). Darunter die
  Zusammenfassung: Stempel, Siege, Monsterbuch-Einträge, laufende Abenteuer, Datum.
- **QR-Code:** Link `https://thezieger.github.io/rogue-adventures/#lade=<code>` als QR anzeigen. QR-Erzeugung als
  kleine eigene Implementierung in `src/qr.js` (Byte-Modus, Fehlerkorrektur L, nur so viel wie nötig) oder, wenn der
  Code für QR zu lang ist (> 2 900 Zeichen), stattdessen eine **Kurzfassung** ohne `stats.hist` und ohne laufende
  Abenteuer als QR und der volle Code als Text. Keine Kamera, kein Scanner in der App: der Link wird mit der
  Kamera-App des anderen Geräts geöffnet.
- **Import:** Beim Start `location.hash` auf `#lade=` prüfen → Dialog „Spielstand gefunden“ mit der gleichen
  Zusammenfassung und den Knöpfen „Zusammenlegen“, „Ersetzen“, „Nicht laden“; Hash danach entfernen. Im Reiter
  Spielstand ein Textfeld „Code einfügen“ mit denselben Knöpfen. Im Einrichtungsdialog (Schritt 01) wird „Spielstand
  laden“ aktiv und führt direkt zu diesem Textfeld.
- **Zusammenlegen-Regel:** Zähler (`runs`, `wins`, `stamps`, `stampsTotal`, `bestWorld`, `knowSeq`) → Maximum;
  Mengen (`dex`, `owned`, `seenTut`, `evoUnlocked`, `stampCard`) → Vereinigung (bei `stampCard` der höhere Wert);
  `stats` → Summe von `c` und `t`, `hist` vom Gerät behalten; `know` → pro Frage Summe von `c`/`t` und spätere
  Werte; Einstellungen (`off`, `sound`, `grade`, `pin`, `setup`) → vom Gerät behalten, außer das Gerät hat keine PIN
  und der Code eine; laufende Abenteuer → nur übernehmen, wo das Gerät keins hat. „Ersetzen“ überschreibt alles
  inklusive Run-Keys. Beides schreibt sofort und lädt den Titel neu.
- **Erinnerung:** Wenn `backupAt` älter als 30 Tage und mindestens ein Sieg oder Kauf seitdem: kleiner Punkt am
  Eltern-Knopf und ein Satz oben im Reiter Spielstand.
- Tests: Export→Import ergibt gleichen Spielstand, Zusammenlegen-Regeln, kaputter Code wird abgelehnt mit
  Meldung, Hash-Import. Beachte: jsdom hat eventuell keinen `CompressionStream` → Fallback `LQ0.` muss getestet sein.

### 03 Stempelheft (Währung) und Stempelkarte
- `meta.stamps`, `meta.stampsTotal`, `meta.stampCard`, `isoWeek()`.
- Verdienen: je 10 richtige Antworten in einem Abenteuer 1 Stempel (Zähler im Run, bei jedem Kampfende
  ausgewertet, verlorene Abenteuer zahlen also auch); Boss besiegt 5; Abenteuer gewonnen 10; neuer Eintrag im
  Monsterbuch 2. Wochenaufgabe (Schritt 04) 10. Anzeige „+n 🏷“ auf dem Gewonnen-Bildschirm, Symbol ist 🏷
  („Stempel“), kein Stern und keine Münze.
- Jede Spielaktion setzt `stampCard[aktuelleWoche]` auf mindestens 1.
- **Stempelheft-Bildschirm** vom Titel aus: Guthaben, Stempelkarte des Schuljahres (Wochen ab ISO-Woche 36 bis Woche
  30 des Folgejahres, 10 pro Reihe; leer = nichts, 1 = grüner Haken, 2 = goldener Stern, laufende Woche umrandet;
  nichts markiert eine verpasste Woche), darunter Liste „Belohnungen“ mit Preis und Knopf „Holen“; in diesem Schritt
  nur Einträge, die ohne weitere Schritte funktionieren: zweite Kartenoptik je Mathe-Welt (nur Farbwechsel des
  Hintergrunds, `owned['map-w1-winter']` usw., 25 Stempel) und ein vierter Mathe-Held (40 Stempel, neues
  Monster in `monsters.js` und `STARTERS`, Typ normal, Attacken auf den bisher am wenigsten vertretenen Aufgabenarten
  `mul`, `nb`, `riddle`, `seq`). Weitere Belohnungen tragen die späteren Schritte ein.
- Titelbild: Stempelzähler oben neben dem Ton-Knopf, Knopf „Stempelheft“ neben „Monsterbuch“.
- Elternbereich Fortschritt: Zeile „Stempel verdient insgesamt“.
- Tests: Verdienregeln, Kartenwoche, Kauf zieht ab und schaltet frei, alter Spielstand hat 0.

### 04 Wochenaufgabe, Wochenboss, Wochenbericht (hängt von 03 ab)
- Ein Ziel je Fach der aktuellen Klasse pro ISO-Woche (mit Deutsch also vier Ziele; Texte sagen „alle Ziele“, nicht
  „drei“), deterministisch aus dem Wochenschlüssel, nur aus eingeschalteten Aufgabenarten. Zieltypen: „N richtige Aufgaben der Art X“ (N = 15–25), „ein Abenteuer in Y
  gewinnen“, „N Elitegegner in Y besiegen“ (N = 2–3), „den Wochenboss in Y besiegen“. Fortschritt in `meta.weekly`;
  Wochenwechsel setzt zurück (nichts wird abgezogen, alte Woche bleibt in `stampCard`).
- Alle drei fertig → `stampCard[woche] = 2`, 10 Stempel, kurze Karte „Wochenaufgabe geschafft“ (ein Satz, kein
  Lobgewitter).
- **Wochenboss:** pro Woche ein Gegner aus dem Pool der aktuellen Welt mit festem Beinamen („… der Woche“), fester
  Schwachstelle aus dem Wochenseed und 25 % mehr Lebenspunkten; erscheint einmal pro Abenteuer als eigener
  Knotentyp `weekboss` auf Etage 5–6 statt eines Kampfknotens, solange er in dieser Woche noch nicht besiegt wurde.
  Belohnung wie Elite plus Wochenstempel-Fortschritt.
- Titelbild: Karte „Diese Woche“ mit Balken und „Neue Aufgaben am Montag“. Eigener Bildschirm „Wochenaufgabe“
  mit den drei Zielen, Fortschritt in ganzen Zahlen, Satz „Nichts geht verloren, wenn du eine Woche aussetzt.“
- **Wochenbericht** im Elternbereich → Fortschritt: geübte Aufgabenarten dieser Woche mit richtig/gesamt, schwächste
  Aufgabenart, Stand der drei Ziele, ein Knopf „Als Text kopieren“ (drei bis fünf Zeilen, ohne Namen).
- Playtest-Bot: erreicht den Wochenboss und beendet in einem Lauf mindestens ein Wochenziel.
- Tests: Determinismus (gleicher Wochenschlüssel → gleiche Ziele auf zwei „Geräten“), Fortschritt, Wochenwechsel,
  Elternfilter.

### 05 Kleiderkammer (hängt von 03 ab)
- `monsters.js`: `monsterSVG(shape, color, evo, cls, outfit)` bekommt einen optionalen Kleidungs-Layer, der über
  dem Körper gezeichnet wird, für alle Starter-Formen passend positioniert (Kopfposition pro Form als Tabelle).
  Sechs Teile: Strohhut, Schal, Brille, Ranzen, Krone, Ährenkranz. Preise/Bedingungen: Strohhut 15, Schal 10,
  Brille 12; Ranzen nach 4 geschafften Wochenaufgaben, Krone nach Sieg in allen Welten eines Fachs, Ährenkranz nach
  der ersten Ernte (Schritt 09; bis dahin als „bald“ markiert).
- Bildschirm „Kleiderkammer“ aus dem Stempelheft: Held mit aktueller Kleidung, Raster der Teile mit Preis oder
  Bedingung, „Anziehen“/„Ablegen“, ein Teil pro Held gleichzeitig. Text: „Kleidung ändert nichts am Kampf.“
- Kleidung sichtbar im Kampf, auf der Karte (Topbar-Name reicht nicht: kleines Monsterbild in der Topbar oder im
  Startbildschirm), im Starter-Bildschirm.
- Tests: Kauf, Anziehen, Bedingungen, Spielstand ohne `owned` lädt.

### 06 Ethik: Das Kirchenjahr, Teil 1
- Neue Einheit `kirchenjahr` in `knowledge.js`, Fach Ethik, eine Welt, Held Martin Luther kann wiederverwendet werden
  oder ein neuer Held (Entscheidung der Session, Name ohne Verniedlichung). Inhalte nach Lehrplan Sachsen Ethik
  Klasse 3, Lernbereich 3 „Voneinander“ und der Reihenfolge im Stoffverteilungsplan (Wochen 12–18): Buß- und Bettag,
  innere und äußere Konflikte (als Ereigniskarten), das Kreuz als Symbol, die Kirche als Gebäude, die Bibel (Altes
  und Neues Testament, Sammlung vieler Texte, Kulturgut), die Zehn Gebote (Reihenfolge- und Zuordnungsaufgaben, Text
  in kindgerechter Kurzform), Weihnachtszeit und Weihnachtsgeschichte (Lukas), Begriffe Ethik und Religion.
  Aufgabenarten wie bei Luther (rf, mc, lt, def, ord) wiederverwenden. Mindestens 60 Fragen, sachlich korrekt,
  konfessionell neutral formuliert („Christen glauben, dass …“).
- Notizkarten (Tutorial-Stil) zu Kreuz, Kirche, Bibel, Zehn Gebote, Weihnachten. Gegner und Boss aus der Welt der
  Kirche und des Kirchenjahres, ohne Spott über Religion.
- Tests in `test_knowledge.js` (jede Frage hat genau eine richtige Antwort, Pools vollständig), Bot spielt die Einheit.

### 07 Mathe: Division, Rest, Runden, Verdoppeln und Halbieren
- Neue Module in `MODULES` (`logic.js`): `div` (Teilen; Stufe 1 Einmaleins-Umkehr bis 100, Stufe 2 mit Zehnerzahlen
  wie 240 : 6, Stufe 3 Aufgabenfamilie „? · 7 = 56“ gemischt mit Division), `rest` (Division mit Rest, Eingabe
  zweier Felder „Ergebnis“ und „Rest“, Stufe 1 bis 50, Stufe 2 bis 100), `rund` (Runden auf Zehner und Hunderter,
  Stufe 1 Zehner bis 100, Stufe 2 Hunderter bis 1000, Stufe 3 gemischt), `dopp` (Verdoppeln und Halbieren, Stufe 1 bis
  100, Stufe 2 bis 1000, nur gerade Zahlen beim Halbieren). `worldCap` so, dass Welt 1 unter 100 bleibt.
- Tutorials (`TUT`) mit einem durchgerechneten Beispiel je Stufe, ohne Lob am Ende. Attackennamen in `EXTRA_ATTACKS`
  passend zur Welt des Spiels (kein „Rechen-X“). Mindestens ein Starter bekommt `div` als Attacke; der vierte Held aus
  Schritt 03 kann umverteilt werden.
- Elternbereich: neue Aufgabenarten erscheinen automatisch in den Toggles und der Statistik (prüfen, dass
  `emptyStats` sie kennt und alte Spielstände sie beim Laden ergänzen).
- Tests: Generatoren liefern lösbare Aufgaben in den Grenzen, Rest < Divisor, Runden korrekt, keine Kommazahlen.

### 08 Markt-Knoten mit Münzen (hängt von 07 nicht ab, aber von 03 wegen Belohnungen)
- `run.coins` in Cent. Kämpfe geben Münzen (normal 30–80 ct, Elite 1–2 €, Boss 2–3 €), Ereignisse können welche
  kosten oder geben. Anzeige als „3 € 50 ct“, nie mit Komma.
- Knotentyp `markt` einmal pro Welt auf Etage 3–6 statt eines Ereignisses. Bildschirm: Händlerin, drei Angebote aus
  `ITEMS` mit Preisen (Trank 1 € 20 ct, Beere 60 ct, Schild 2 € 05 ct, Chilischote 85 ct, Eselsbrücke 1 € 50 ct,
  Schutzengel 3 €), Geldbeutel, Bezahlen durch Antippen von Münzen und Scheinen (2 €, 1 €, 50, 20, 10, 5, 2, 1 ct;
  5 € und 10 € Schein in Welt 3). Stufe 1: passend bezahlen (Bonus: eine Beere). Stufe 2 (Welt 2+): auch überzahlen
  und Rückgeld selbst ausrechnen (Eingabe), richtig = Kauf, falsch = Händlerin gibt den Betrag zurück, Aufgabe
  zählt in der Statistik als Modul `geld`.
- Modul `geld` in `MODULES` für Statistik und Eltern-Toggle (ist das Modul aus, gibt es keinen Markt).
- Bot: kauft am Markt genau eine Sache.
- Tests: Münzsummen, Rückgeld, kein Kauf ohne Geld, Spielstand mit Markt-Knoten lädt.

### 09 Schulgarten (hängt von 03 ab)
- `meta.garden.beds` (4 Beete: Beet 1–3 frei, Beet 4 nach Sieg in der Kartoffel-Werkstatt). Pflanzen: Kartoffel,
  Weizen, Roggen, Hafer (passend zu Sachkunde LB 3). Wachstum nach echter Zeit: 2 Tage Keimling, 5 Tage Blüte/Ähre,
  7 Tage reif; nie verwelkt. Ernte: eine Wissensfrage zur Pflanze (aus einem kleinen Pool in `knowledge.js`), dann
  4 Stempel und `materials[ernte]++` (für Schritt 13). Erste Ernte schaltet den Ährenkranz (Schritt 05) frei.
- Bildschirm „Schulgarten“ vom Titel aus; Titelbild zeigt eine Karte, wenn etwas reif ist. Text „Beete wachsen auch,
  wenn du nicht spielst.“ Kein Countdown in Stunden, nur „Tag 5 von 7“.
- Uhrzeit-Manipulation ist egal; keine Strafen. Zeitquelle `Date.now()`, im Test injizierbar.
- Tests: Wachstumsphasen, Ernte, Beet 4 gesperrt, alter Spielstand ohne `garden`.

### 10 Kreisel-Arena (hängt von 03 und 05 ab)
- Eigene Namen, keine Marken. `meta.top` mit drei Teilen; Starterteile: Stahlspitze, Zahnring, Leichte Scheibe.
  Weitere Teile als `owned`-Einträge: Gummispitze (8 Stempel), Wellenring (12), Schwere Scheibe (10), Flammenring
  (Truhe Welt 2), Kugelspitze (Truhe Welt 3), Eisenscheibe (Bergwerk, Schritt 12). Jedes Teil ändert eine Zahl:
  Spitze → Wucht (Schaden), Ring → Panzer (verringert Schwungverlust), Scheibe → Schwung (Startwert). Typ des Kreisels
  = Typ des Helden.
- Knotentyp `arena` einmal pro Welt (Etage 4–6). Kampf nutzt die Kampf-Engine (`startBattle` mit Flag), aber:
  „Schwung“ statt Lebenspunkte für beide Seiten, Startphase mit drei Aufgaben (jede richtige +4 Schwung), dann Runden:
  richtig = Gegner verliert Wucht an Schwung, falsch = eigener Kreisel verliert 6 minus Panzer. Keine Gegenstände im
  Kreiselkampf. Sieg gibt XP und 1 Stempel, Niederlage kostet nichts außer dem Knoten.
- Bildschirm „Kreisel bauen“ aus dem Stempelheft: aktuelle Werte, drei Reihen Teile, Preis oder Bedingung.
- Arena-Grafik: zwei rotierende Kreisel als SVG (CSS-Rotation, bei `prefers-reduced-motion` still).
- Bot: spielt die Arena durch. Tests: Werte, Kauf, Spielstand ohne `top`.

### 11 Deutsch als neues Fach: Wörterwerkstatt und Satzbaustelle
- `CURRICULUM` bekommt das Fach Deutsch mit zwei Einheiten. Wortlisten liegen in einer neuen Datei
  `src/woerter.js` (in `build.py` einbinden), damit Eltern die Lernwörter der Klasse ergänzen können; Struktur im
  Dateikopf erklären. Grundlage: Sächsischer Rechtschreibrahmen Klasse 3 und Lehrplan Deutsch 2025, Lernbereiche
  „Richtig schreiben“ und „Sprache untersuchen“.
- **Wörterwerkstatt** (Rechtschreibung), Aufgabenarten: Doppelkonsonant/ck/tz (richtige Schreibung aus zwei wählen),
  Verlängern (d/t, g/k, b/p am Wortende: „der Hun_“ mit Hilfe „Hun-de“), silbentrennendes h, Großschreibung (welches
  Wort wird großgeschrieben), Zusammensetzungen mit Artikel (Logik aus `woerter` der Kartoffel-Werkstatt
  verallgemeinern), Wörterbuch-Reihenfolge (vier Wörter alphabetisch antippen, bis zum dritten Buchstaben), wörtliche
  Rede (wo gehören die Anführungszeichen hin, Auswahl aus drei Varianten).
- **Satzbaustelle** (Sprache untersuchen): Wortart bestimmen (Nomen, Verb, Adjektiv, Pronomen, Artikel), Zeitform
  (Präsens ↔ Präteritum, Auswahl), Steigerung (Grundstufe, Mehrstufe, Meiststufe; „als“ oder „wie“), Subjekt und
  Prädikat finden (Wort im Satz antippen), Umstellprobe (Satzglieder in neuer Reihenfolge antippen), Oberbegriff,
  Teekesselwörter.
- Mindestens 150 Wörter/Sätze insgesamt, kindgerecht, ohne Markennamen. Helden und Gegner aus der Welt der Schreibstube
  (Tinte, Feder, Druckerpresse sind schon bei Luther belegt, also anders: Heft, Bleistift, Radiergummi, Lineal,
  Buchstaben) mit eigenen Namen, keine Verniedlichungen.
- Tutorials pro Aufgabenart, Tests für jede Aufgabenart (genau eine richtige Antwort, alle Wörter aus der Liste
  haben die nötigen Felder), Bot spielt beide Einheiten.

### 12 Baustelle (Geometrie) und Bergwerk-Knoten (hängt von 07 ab)
- **Baustelle** als neue Mathe-Einheit „Die Baustelle“ (Fach Mathe, 2 Welten) oder als Aufgabenarten in Zahlenquest
  (Entscheidung der Session; Einheit bevorzugt, damit Zahlenquest nicht überladen wird). Aufgabenarten nach Lehrplan
  Raum und Form: Würfel zählen (Bauplan von oben mit Zahlen, Ansicht aus Blöcken als SVG), fehlende Würfel bis zum
  vollen Quader, welches Netz lässt sich zum Würfel falten (Auswahl aus drei, mit den 11 gültigen Netzen),
  Körper erkennen (Würfel, Quader, Kugel, Pyramide, Kegel, Zylinder als einfache SVGs), Bandornament fortsetzen,
  parallel oder senkrecht, Umfang aus Kästchen zählen.
- **Bergwerk-Knoten** `bergwerk` (einmal pro Welt in Zahlenquest und Baustelle statt eines Schatzes): Raster 4×3
  verdeckter Blöcke, jeder Block eine Aufgabe (Division mit Rest aus Schritt 07): Rest 0 → Erz, sonst Stein; drei
  Blöcke pro Besuch, Erz und Stein landen in `meta.materials`, eine Stufe Erz schaltet die Eisenscheibe (Schritt 10)
  frei.
- Tests für jede Aufgabenart (Netze korrekt, Zählungen stimmen), Bot spielt die Einheit und den Knoten.

### 13 Werkbank und Meine Hütte (hängt von 09 und 12 ab)
- **Werkbank** im Stempelheft: Rezepte als kleine Sachaufgaben („Drei Tränke, jeder braucht zwei Beeren: wie viele
  Beeren?“ → Eingabe), Zutaten aus `materials` (Ernte, Holz, Stein, Erz). Ergebnisse: Trank, Großer Trank, Schild
  und Chilischote als Startgegenstände für das nächste Abenteuer (`meta.pantry`, wird beim Start in `run.items`
  übernommen, maximal drei), Möbel für die Hütte. Holz kommt aus Ereigniskarten (neu: „Der Holzplatz“) und aus
  Siegen in der Kartoffel-Werkstatt.
- **Meine Hütte** vom Titel aus: ein Raum als SVG-Szene mit Platz für Möbel (Tisch mit Erntekorb, Regal mit
  Monsterbuch, Wandhaken für den Kreisel, Bett, Fenster), Erweiterung „Zweites Zimmer“ für 30 Stempel + 12 Stein,
  „Dachfenster“ nach Sieg in allen Welten. Im Regal stehen Zahlen: Monsterbuch, Kreiselteile, Notizkarten. Knopf zum
  Schulgarten. Belohnungen eintragen in die Stempelheft-Liste.
- Tests: Rezepte, Vorratsübernahme, Hütte lädt ohne Feld.

### 14 Ethik: Gute Freunde und Kirchenjahr Teil 2 (hängt von 06 ab)
- **Gute Freunde** als Einheit (Lehrplan LB 1 und 2, Stoffverteilungsplan Wochen 19–24): Freunde finden und sein,
  wahre und falsche Freundschaft, Streitregeln, Goldene Regel, Mobbing mit Worten, Versprechen und Geheimnisse,
  Wahrheit, Halbwahrheit und Notlüge. Dilemma-Karten als Ereignisse **ohne falsche Antwort**: zwei oder drei
  Handlungen, jede führt zu einer kurzen Folge und einem Denkanstoß, keine Lebenspunkte-Strafe. Wissensfragen nur zu
  Begriffen (Goldene Regel, Kompromiss, Schlichter). Keine Ratschläge, die ein Kind in Gefahr bringen könnten;
  bei Mobbing immer „Hol dir Hilfe bei einem Erwachsenen“ als Option.
- **Kirchenjahr Teil 2** erweitert Einheit 06 um eine zweite Welt: Fastenzeit, Symbole (Regenbogen, Weg, Wasser,
  Brot, Tür, Brücke), Osterzeit, Himmelfahrt, Pfingsten, Taufe, Kirchenjahr mit festen und beweglichen Festen,
  sorbische Feiertage (Fronleichnam, Osterreiten, Saatreiten) als regionaler Bezug.
- Tests wie bei 06.

### 15 Der Jahrmarkt: Zeit, Länge, Masse, Zufall, Sachaufgaben (hängt von 07 ab)
- Neue Mathe-Einheit „Der Jahrmarkt“, 2 Welten, Stände als Aufgabenarten: Uhrturm (Uhrzeit ablesen auf Minute,
  Zeitspannen, Viertelstunden; Uhr als SVG), Messlatte (Längen umrechnen m/cm/km, zwei Einheiten, ½ m), Waage
  (g und kg, Vergleiche, Schätzen aus Stützpunkten), Glücksrad (sicher, möglich, unmöglich, wahrscheinlicher),
  Losbude (Kombinatorik: alle Kombinationen zählen), Schautafel (Säulendiagramm ablesen), Sachaufgaben in zwei
  Sätzen aus der Jahrmarktwelt. Keine Kommazahlen für Kinder: „2 m 35 cm“, nicht „2,35 m“.
- Tests und Bot wie oben.

### 16 Sachkunde: Kornkammer, Wetterstation mit Forscherlabor, Kompass und Karte
- **Die Kornkammer** (LB 3): drei Getreidearten (Weizen, Roggen, Gerste; Hafer und Mais als Zusatz), Ähre, Rispe,
  Kolben, Teile der Getreidepflanze (Zeichenschule wie bei der Kartoffel wiederverwenden), vom Korn zum Brot als
  Reihenfolge, Verwendung, Wertschätzung von Nahrungsmitteln.
- **Die Wetterstation** (LB 4): Zustandsformen des Wassers und die fünf Begriffe (gefrieren, schmelzen, verdampfen,
  verdunsten, kondensieren), Wasserkreislauf als beschriftbares Bild, Wettervorhersage lesen (Symbole, Temperatur),
  Bauernregeln als Lückentext. **Forscherlabor-Knoten** `labor`: Vermutung zuerst (schwimmt/sinkt, fest/flüssig/
  gasförmig, welche Urne), dann Ergebnis mit kurzer Erklärung als Notizkarte; falsche Vermutung kostet nichts, fünf
  Versuche je Besuch, am Ende eine Notizkarte ins Buch.
- **Kompass und Karte** (LB 5): Haupt- und Nebenhimmelsrichtungen, Windrose, Plan mit Legende, Karte einnorden.
  **Schatzkarten-Knoten** `karte` (statt eines Schatzes): 5×5-Raster, Anweisung wie „2 Felder nach Osten, 1 nach
  Norden“, Ziel antippen; Stufe 2 Nebenhimmelsrichtungen, Stufe 3 Maßstab „1 Feld = 100 m“. Landkreis-Inhalte
  (Städte, Flüsse) als leere Datenstruktur mit Beispiel vorbereiten, nicht erfinden.
- Tests und Bot wie oben.

### 17 Duell, Lesestube, schriftliche Rechenverfahren
- **Duell** vom Titel aus: zwei Kinder, ein Gerät, jedes wählt Fach, Einheit und Held; abwechselnd eine Aufgabe auf
  der eigenen Stufe (Stufe pro Kind aus der Statistik der zuletzt gespielten Einheit, sonst 1); richtig = Treffer
  beim anderen Held, falsch = nichts passiert; Lebenspunkte wie im Kampf; kein Spielstand, kein Eintrag in
  Statistik oder Stempel (Entscheidung der Session: Statistik ja, wenn es ohne Vermischung geht). Namen frei eingeben
  (nur Anzeige, nicht gespeichert).
- **Lesestube-Knoten** `lesen` (einmal pro Welt in Deutsch- und Ethik-Einheiten): ein kurzer Text (Fabel, Sachtext,
  Witz mit Pointe, Sprichwort erklärt; 60–120 Wörter, eigene Texte oder gemeinfreie Fabeln nacherzählt), dann drei
  Fragen als Angriff auf einen Gegner; Texte in `src/texte.js`.
- **Schriftliche Addition und Subtraktion** als Aufgabenarten in Zahlenquest nur in Welt 3: Spalteneingabe mit
  Übertragsfeldern (Addition bis drei Summanden, Subtraktion mit einem Subtrahenden, Übertrag), Tutorial mit
  Beispiel nach dem in Sachsen üblichen Verfahren (Ergänzen bei der Subtraktion).
- Tests und Bot wie oben.

## D. Nach dem letzten Schritt (Orchestrator)
- CHANGELOG für den Release auf ein Datum zusammenziehen, Eigentümer prüft `v2` lokal, dann PR `v2` → `main`.
