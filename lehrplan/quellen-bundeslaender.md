# „Mein Bundesland“ – Quellen zu den Fakten

**Hinweis:** Diese Zusammenstellung wurde am 2026-11-25 von einem KI-Agenten aus den unten genannten Quellen erstellt.
Sie wurde nicht von einer Lehrkraft geprüft. Daten: `tests/fixtures/bundesland-fakten.json`; die Fragen daraus stehen in `src/bundesland.ts`.

Abrufdatum aller Quellen: 2026-11-25.

## Wie geprüft wurde

- **Hauptstadt, Nachbarn, Meer, Flüsse, Landschaften, Lage:** Wikipedia-Artikel des Landes (Zweitquelle), dazu – wo erreichbar –
  eine amtliche Seite des Landes. Wo nur Wikipedia vorlag, steht das dabei.
- **Städte:** Destatis, „Städte (Alle Gemeinden mit Stadtrecht) nach Fläche, Bevölkerung und Bevölkerungsdichte am 31.12.2024“
  (https://www.destatis.de/DE/Themen/Laender-Regionen/Regionales/Gemeindeverzeichnis/Administrativ/05-staedte.html, Excel-Datei ausgewertet).
  Eine Reihenfolge gilt nur als sicher, wenn die Abstände deutlich sind (`staedte_reihenfolge_sicher`).
- **Feiertage:** nur dann eingetragen, wenn der Gesetzestext selbst geöffnet werden konnte. Die juris-Landesrechtsportale
  (BW, BE, HH, HE, MV, RP, ST, SH) waren aus der Arbeitsumgebung nicht erreichbar (Verbindungsabbruch bzw. HTTP 503).
  Für diese Länder steht `feiertage: null`; was amtliche Seiten des Landes nennen, steht getrennt in `feiertage_unbestaetigt`.
  Ausnahmen: BW (Gesetzestext in der amtlichen Vorschriftensammlung der Gewerbeaufsicht geöffnet) und BE (Änderungsgesetz im
  Gesetz- und Verordnungsblatt geöffnet, dazu Seite der Senatsverwaltung für Inneres).
- **Gegenprobe Feiertage:** amtliche Übersicht der Hamburger Schulbehörde über alle Länder (Stand September 2018,
  https://www.hamburg.de/resource/blob/134374/7a4a9de67fd46caec0947c11bf23316d/bsb-feiertage-data.pdf) und
  https://de.wikipedia.org/wiki/Gesetzliche_Feiertage_in_Deutschland. Beide stimmen mit allen Einträgen überein
  (die Übersicht von 2018 kennt die späteren Frauentage in BE und MV noch nicht).

## Symmetrieprüfung der Nachbarländer (alle 16 Länder)

Per Skript geprüft: Nennt A das Land B, nennt B auch A. Ergebnis: **keine Abweichung, 29 Nachbarpaare.**
Quellen für die drei Länder ohne eigenes Paket: https://de.wikipedia.org/wiki/Thüringen (Hessen, Bayern, Sachsen, Sachsen-Anhalt,
Niedersachsen), https://de.wikipedia.org/wiki/Saarland (Rheinland-Pfalz; Frankreich, Luxemburg),
https://de.wikipedia.org/wiki/Freie_Hansestadt_Bremen (nur Niedersachsen).

Bewusst nicht als Nachbarstaat geführt: Österreich bei Baden-Württemberg und Schweiz bei Bayern (Berührung nur über den Bodensee,
Grenze dort nicht festgelegt – siehe unten).

## Baden-Württemberg (BW)

- Hauptstadt, Nachbarländer, Flüsse, Landschaften, Städte: https://www.baden-wuerttemberg.de/de/unser-land/land-und-leute/geografie ;
  https://de.wikipedia.org/wiki/Baden-Württemberg
- Lage „im Südwesten“: Wikipedia.
- Städte: Destatis (Stuttgart, Mannheim, Karlsruhe, Freiburg im Breisgau).
- Feiertage (Gesetzestext): FTG § 1, https://gewerbeaufsicht.baden-wuerttemberg.de/documents/20121/66937/1_3_1.pdf ;
  bestätigt durch https://im.baden-wuerttemberg.de/de/service/feiertage
- Weggelassen: Österreich als Nachbarstaat (Landesportal: Grenzen zu Österreich und der Schweiz auf dem Bodensee „nicht festgelegt“);
  Rangfolge Mannheim/Karlsruhe (zu knapp); Odenwald, Kraichgau, Hohenlohe (weniger bekannt); Gründonnerstag und Reformationsfest
  (kirchliche Feiertage, nur schulfrei).

## Bayern (BY)

- Hauptstadt, Nachbarn, Landschaften, Lage: https://de.wikipedia.org/wiki/Bayern
- Flüsse, Seen, Gebirge: Statistisches Jahrbuch für Bayern 2024, „Allgemeine Angaben“,
  https://www.statistik.bayern.de/mam/produkte/jahrbuch/jb2024_00_allgemeine_angaben_und_bayern_daten.pdf ;
  https://www.lfu.bayern.de/wasser/baeche_und_fluesse/index.htm
- Städte: Destatis (München, Nürnberg, Augsburg, Regensburg – Abstände deutlich).
- Feiertage (Gesetzestext): BayFTG Art. 1, https://www.gesetze-bayern.de/Content/Document/BayFTG-1
- Nur in Teilen: Mariä Himmelfahrt (Gemeinden mit überwiegend katholischer Bevölkerung), Friedensfest (nur Stadt Augsburg).
- Weggelassen: Schweiz als Nachbarstaat (nur über den Bodensee); Bodensee als bayerischer See; Nachbarliste nur aus Wikipedia
  (keine amtliche Seite mit vollständiger Liste gefunden).

## Berlin (BE)

- Stadtstaat, von Brandenburg umschlossen, Flüsse, Seen, Lage: https://de.wikipedia.org/wiki/Berlin
- Gewässer amtlich: https://www.berlin.de/sen/uvk/umwelt/wasser-und-geologie/oberflaechengewaesser/
- Feiertage: Änderungsgesetz vom 30.1.2019 (Frauentag als neue Nr. 2 in § 1 Abs. 1; vorher neun Nummern), GVBl. Nr. 3/2019,
  https://www.berlin.de/sen/justiz/service/gesetze-und-verordnungen/2019/ausgabe-nr-3-vom-6-2-2019-s-21-32.pdf ;
  vollständige Liste auf https://www.berlin.de/sen/inneres/buerger-und-staat/verfassungs-und-verwaltungsrecht/artikel.1435639.php .
  Der konsolidierte Text auf gesetze.berlin.de war nicht erreichbar.
- Weggelassen: 8. Mai (nur einmalig 2020 und 2025, laut Wikipedia); Lage „im Osten“ vs. „im Nordosten“ (beides üblich);
  „dass Berlin vollständig von Brandenburg umgeben ist“ nur über Wikipedia und brandenburg.de belegt.

## Brandenburg (BB)

- Hauptstadt, Nachbarn (vier Länder und Polen, dazu Berlin), Flüsse, Spreewald, Oderbruch: https://www.brandenburg.de/de/land/bb1.c.475252.de ;
  https://de.wikipedia.org/wiki/Brandenburg
- Uckermark, Havelland, Fläming, Lage: Wikipedia.
- Städte: Destatis (Potsdam, Cottbus, Brandenburg an der Havel, Frankfurt (Oder)).
- Feiertage (Gesetzestext): FTG § 2, https://bravors.brandenburg.de/gesetze/ftg_2015
- Weggelassen: Oder, Neiße, Elbe als „fließt durch“ (überwiegend Grenzflüsse); Lausitz (zusammen mit Sachsen, für Kinder uneindeutig).
- Hinweis: Ostersonntag und Pfingstsonntag sind laut Gesetz Feiertage, fallen aber immer auf einen Sonntag.

## Hamburg (HH)

- Stadtstaat, Nachbarn, Elbe/Alster/Bille, Neuwerk, Lage: https://de.wikipedia.org/wiki/Hamburg ;
  https://marketing.hamburg.de/de/hamburg-medien-service/ueber-hamburg (grenzt an Schleswig-Holstein und Niedersachsen; rund 100 km
  vor der Elbmündung in die Nordsee)
- Feiertage: **nicht verifiziert** (landesrecht-hamburg.de nicht erreichbar). Amtliche Seiten nennen den Reformationstag:
  https://www.hamburg.de/leben-in-hamburg/ferien-feiertage-termine-378818
- Weggelassen: „Hamburg liegt an der Nordsee“ (falsch – keine Meeresküste; nur die Insel Neuwerk liegt in der Nordsee);
  Vier- und Marschlande (nicht bestätigt).

## Hessen (HE)

- Hauptstadt, Nachbarn, Flüsse, Landschaften, Lage: https://de.wikipedia.org/wiki/Hessen
- Flüsse und Mittelgebirge amtlich: https://hessen.de/wissen/hessen-und-seine-fliessgewaesser ;
  https://www.hlnug.de/themen/geologie/geo-info-hessen/geologische-entwicklung-in-hessen/naturraum
  (hessen.de/wissen/fuer-kinder/stadt-land-fluss ließ sich nicht öffnen, HTTP 403)
- Städte: Destatis (Frankfurt am Main, Wiesbaden, Kassel, Darmstadt).
- Feiertage: **nicht verifiziert** (rv.hessenrecht.hessen.de nicht erreichbar). Amtliche Seite nennt Fronleichnam:
  https://innen.hessen.de/buerger-staat/feiertage
- Weggelassen: Rhein als „fließt durch“ (überwiegend Grenze zu Rheinland-Pfalz); Neckar, Weser, Werra (nur Randberührung);
  Edersee nur über Wikipedia belegt.

## Mecklenburg-Vorpommern (MV)

- Hauptstadt, Nachbarn, Ostsee, Inseln, Seen, Flüsse, Lage: https://de.wikipedia.org/wiki/Mecklenburg-Vorpommern ;
  Statistisches Amt MV, „Ein Porträt in Zahlen 2023“,
  https://www.laiv-mv.de/static/LAIV/Statistik/Dateien/Publikationen/Z%20Faltbl%C3%A4tter/Z%20911/Z911%202023%2000.pdf
- Städte: Destatis (Rostock, Schwerin, Neubrandenburg).
- Feiertage: **nicht verifiziert** (landesrecht-mv.de nicht erreichbar). Frauentag ist durch das Änderungsgesetz vom 7.7.2022 belegt
  (GVOBl. M-V Nr. 31/2022, https://www.dokumentation.landtag-mv.de/parldok/dokument/53736/gesetz_und_verordnungsblatt_31_2022.pdf);
  Reformationstag nur über die Hamburger Übersicht (2018) und Wikipedia.
- Weggelassen: Elbe (nur Grenzfluss); Platz 4 der Städte (Greifswald/Stralsund zu knapp).

## Niedersachsen (NI)

- Hauptstadt, neun Nachbarländer, Niederlande, Nordsee, Lage: https://de.wikipedia.org/wiki/Niedersachsen
- Flüsse, Seen, Inseln amtlich: https://www.niedersachsen.de/startseite/land_leute/das_land/zahlen_fakten/topografische_daten/topografische-daten-des-landes-niedersachsen-19758.html
- Harz, Lüneburger Heide, Wattenmeer: Wikipedia und niedersachsen.de (Suchergebnis „Vom Harz bis Neuharlingersiel“).
- Städte: Destatis (Hannover, Braunschweig, Oldenburg, Osnabrück).
- Feiertage (Gesetzestext): NFeiertagsG § 2, Fassung ab 29.06.2018,
  https://voris.wolterskluwer-online.de/browse/document/f74bc6e7-6ded-3c2c-9afb-b34620456e56
- Weggelassen: Aller (weniger bekannt); vollständige Nachbarliste nur aus Wikipedia.

## Nordrhein-Westfalen (NW)

- Hauptstadt, Nachbarn, Flüsse, Landschaften, Lage: https://de.wikipedia.org/wiki/Nordrhein-Westfalen ;
  Hauptstadt auch https://www.it.nrw/thema/gebiet-und-flaeche
- Teutoburger Wald: https://de.wikipedia.org/wiki/Teutoburger_Wald („liegt in Niedersachsen und Nordrhein-Westfalen“).
- Städte: Destatis (Köln; dann Düsseldorf, Dortmund, Essen dicht beieinander).
- Feiertage (Gesetzestext): Feiertagsgesetz NW § 2, geltende Fassung,
  https://recht.nrw.de/lrgv/gesetz/01012000-bekanntmachung-der-neufassung-des-gesetzes-ueber-die-sonn-und-feiertage/
- Weggelassen: Rangfolge Platz 2–4 der Städte; Weser (nur kurzer Abschnitt); Nachbarliste nur aus Wikipedia.

## Rheinland-Pfalz (RP)

- Hauptstadt, Nachbarn, Flüsse, Landschaften, Lage: https://de.wikipedia.org/wiki/Rheinland-Pfalz
- Landschaften amtlich: https://lvermgeo.rlp.de/service/gut-zu-wissen/rund-um-rheinland-pfalz ; Nachbarn mit Grenzlängen:
  Statistisches Landesamt, „Rheinland-Pfalz heute“, https://www.statistik.rlp.de/fileadmin/dokumente/kurzinformationen/RLP_heute_2025.pdf
  (nur über das Suchergebnis gelesen, nicht selbst geöffnet)
- Städte: Destatis (Mainz, Ludwigshafen am Rhein, Koblenz, Trier).
- Feiertage: **nicht verifiziert** (landesrecht.rlp.de nicht erreichbar). Amtliche Seite nennt Fronleichnam und Allerheiligen:
  https://mdi.rlp.de/themen/buerger-und-staat/verfassung-und-verwaltung/sonn-und-feiertagsrecht
- Weggelassen: Saar (nur kurzer Abschnitt); Rangfolge Koblenz/Trier; Lage „im Westen“ vs. „im Südwesten“ (beides üblich);
  Laacher See (weniger bekannt).

## Sachsen (SN)

- Hauptstadt, Nachbarn, Flüsse, Landschaften, Lage: https://de.wikipedia.org/wiki/Sachsen ; Nachbarn, Flüsse und Mittelgebirge auch in
  Veröffentlichungen der Staatskanzlei, https://publikationen.sachsen.de/bdb/artikel/11556/documents/11992
  (nur über das Suchergebnis gelesen, nicht selbst geöffnet)
- Städte: Destatis (Leipzig, Dresden, Chemnitz).
- Feiertage (Gesetzestext): SächsSFG § 1, https://www.revosax.sachsen.de/vorschrift/3997-SaechsSFG
- Nur in Teilen: Fronleichnam („nur in den … durch Rechtsverordnung bestimmten Regionen“).
- Weggelassen: Lausitzer Neiße (Grenzfluss); Seen (keine allgemein gelehrten).

## Sachsen-Anhalt (ST)

- Hauptstadt, vier Nachbarländer, Elbe, Altmark, Börde, Harz/Brocken, Städte:
  https://sachsen-anhalt.de/land-sachsenanhalt/land-und-leute/page/das-land-sachsenanhalt-kurz-und-knapp ;
  https://de.wikipedia.org/wiki/Sachsen-Anhalt
- Saale: Wikipedia und Statistisches Jahrbuch (Suchergebnis).
- Städte: Destatis (Magdeburg und Halle (Saale) dicht beieinander, dann Dessau-Roßlau).
- Feiertage: **nicht verifiziert** (landesrecht.sachsen-anhalt.de nicht erreichbar). Statistisches Landesamt nennt Heilige Drei
  Könige und Reformationstag: https://statistik.sachsen-anhalt.de/news/news-details/zahl-der-woche-253
- Weggelassen: Lage (weder „Mitte“ noch „Osten“ eindeutig); „größte Stadt“ (Magdeburg/Halle wechseln); Mulde, Unstrut, Havel.

## Schleswig-Holstein (SH)

- Hauptstadt, Nachbarn, Dänemark, Nord- und Ostsee, Eider, Wattenmeer, Holsteinische Schweiz, Helgoland:
  https://de.wikipedia.org/wiki/Schleswig-Holstein ; „zwischen zwei Meeren“, Fehmarn, Helgoland:
  https://www.schleswig-holstein.de/DE/landesregierung/themen/kueste-wasser-meer (über das Suchergebnis; die Seite selbst gab HTTP 503)
- Sylt: https://de.wikipedia.org/wiki/Sylt ; Trave: https://de.wikipedia.org/wiki/Trave
- Städte: Destatis (Kiel, Lübeck, Flensburg).
- Feiertage: **nicht verifiziert** (gesetze-rechtsprechung.sh.juris.de und schleswig-holstein.de nicht erreichbar). Reformationstag
  nur über die Hamburger Übersicht (2018) und Wikipedia.
- Weggelassen: Nord-Ostsee-Kanal als „Fluss“ (ist ein Kanal); Elbe (Grenzfluss); Lage ist „im Norden“ (nur aus der Karte bzw.
  Nachbarschaft zu Dänemark, im Wikipedia-Auszug kein wörtlicher Satz); Platz 4 der Städte.
