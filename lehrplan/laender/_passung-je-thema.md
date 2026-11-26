# Wie jedes Thema zum Lehrplan des Bundeslandes passt

Stand: 2026-11-26. Diese Tabelle hat ein KI-Agent (Claude) aus den Länderdateien in diesem Ordner
zusammengestellt. Keine Lehrkraft hat sie geprüft. Sie ist die Quelle für `fit` und `note` in `src/laender.ts`;
`tests/test_data.js` vergleicht beide.

Regeln:

- Ein Urteil außer „offen“ steht nur dort, wo die Zeile dahinter im amtlichen Dokument gelesen wurde (in der
  Länderdatei mit [off] markiert). Alles andere ist „offen“; die App zeigt dann „noch nicht verglichen“.
- „offen“ ist auch, was nur auf einem fakultativen Inhalt, auf einer pauschalen Zeile oder auf einem Plan ohne
  Klassenstufen ruht, und jedes Thema, bei dem weniger als die Hälfte der Aufgabenarten gestützt ist. Die letzte
  Spalte nennt, was die erste Auswertung gesagt hatte und warum es herabgestuft wurde.
- Urteile: `passt`, `frueher` (hier meist früher dran), `spaeter` (hier meist später dran), `nicht` (steht hier
  nicht im Plan), `offen` (noch nicht verglichen). Bei gemischten Themen zählt der größere Teil der Aufgabenarten.
- „Hinweis für Eltern“ ist der Satz, den der Elternbereich unter dem Urteil zeigt (höchstens 140 Zeichen).
- Quelle: Abschnitt und Zeilen der Länderdatei zum Zeitpunkt der Auswertung. Brandenburg verweist auf
  `berlin.md` (gemeinsamer Rahmenlehrplan).
- Sachsen fehlt hier: Dort ist jedes Thema `passt`, weil Lernquest aus dem sächsischen Lehrplan entstanden ist
  (Lernbereiche in `src/eltern.ts`, `PLAN`).

## Baden-Württemberg (BW)

| Thema | Urteil | Hinweis für Eltern | Quelle | Herabgestuft, weil |
|---|---|---|---|---|
| `math` | passt | Punkt vor Strich, Teilbarkeitsregeln und Drittel stehen hier nicht im Plan; ob schriftlich abgezogen oder ergänzt wird, stellt er frei. | lehrplan/laender/baden-wuerttemberg.md §5 Mathematik Z.239–241, 257–258; §4 Z.90–114; §3 Z.59 |  |
| `bau` | passt | Kegel, Pyramide, Parallelogramm sowie Verschieben und Drehen stehen hier nicht im Plan. | lehrplan/laender/baden-wuerttemberg.md §5 Mathematik Z.242–243, 255–256; §4 Z.98–101, 113 |  |
| `jahrmarkt` | passt |  | lehrplan/laender/baden-wuerttemberg.md §5 Mathematik Z.244; §4 Z.102–106 |  |
| `woerterwerkstatt` | offen | Für doppelte Mitlaute, Verlängern, Dehnungs-h und Trennen war die Klassenstufe im Plan nicht nachzulesen. | lehrplan/laender/baden-wuerttemberg.md §5 Deutsch Z.274, 283–285; §7 Z.401–402 | aus „passt“: fast die Hälfte der Aufgabenarten hängt am nicht gelesenen Rechtschreibrahmen (§7) |
| `satzbaustelle` | passt | Die Zeitformen heißen hier Gegenwart und Vergangenheit statt Präsens und Präteritum. | lehrplan/laender/baden-wuerttemberg.md §5 Deutsch Z.275, 280, 286; §4 Z.138–146 |  |
| `ethik` | nicht | In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik; Martin Luther ist Stoff des Religionsunterrichts. | lehrplan/laender/baden-wuerttemberg.md §4 Ethik und Religion Z.191–196; §5 Ethik Z.337–340 |  |
| `kirchenjahr` | nicht | In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik; das Kirchenjahr ist Stoff des Religionsunterrichts. | lehrplan/laender/baden-wuerttemberg.md §4 Ethik und Religion Z.191–196; §5 Ethik Z.337–340 |  |
| `freunde` | passt | In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik; Streit und Zusammenleben stehen im Sachunterricht. | lehrplan/laender/baden-wuerttemberg.md §5 Ethik Z.333–334; §4 Z.166, 193–194 |  |
| `ichwelt` | offen | In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik. | lehrplan/laender/baden-wuerttemberg.md §5 Ethik Z.333–338 (ichwelt wird keinem Planinhalt zugeordnet) |  |
| `kartoffel` | offen | Der Plan verlangt eine Nutzpflanze nach Wahl der Schule; dieses Thema ist möglich, aber nicht vorgeschrieben. | lehrplan/laender/baden-wuerttemberg.md §5 Sachunterricht Z.307–308, 313; §4 Z.171, 185–187 | aus „passt“: „zulässig, aber nicht vorgeschrieben“ (§5) |
| `kornkammer` | offen | Der Plan verlangt eine Nutzpflanze nach Wahl der Schule; dieses Thema ist möglich, aber nicht vorgeschrieben. | lehrplan/laender/baden-wuerttemberg.md §5 Sachunterricht Z.307–308, 313; §4 Z.171, 185–187 | aus „passt“: „zulässig, aber nicht vorgeschrieben“ (§5) |
| `wiese` | nicht | Die Wiese ist kein Pflichtthema, die Schule wählt den Lebensraum; Tierentwicklung und Naturschutz stehen im Plan. | lehrplan/laender/baden-wuerttemberg.md §5 Sachunterricht Z.307, 314; §4 Z.185–187 |  |
| `wetterstation` | passt | Bauernregeln stehen hier nicht im Plan. | lehrplan/laender/baden-wuerttemberg.md §5 Sachunterricht Z.303–304, 317; §4 Z.171–174 |  |
| `kompass` | passt | Baden-Württemberg auf der Karte steht hier im Plan der Klassen 3/4. | lehrplan/laender/baden-wuerttemberg.md §5 Sachunterricht Z.305; §4 Z.176–178 |  |
| `verkehr` | passt |  | lehrplan/laender/baden-wuerttemberg.md §5 Sachunterricht Z.306; §4 Z.178–179 |  |
| `frueher` | passt |  | lehrplan/laender/baden-wuerttemberg.md §5 Sachunterricht Z.306; §4 Z.166–168, 179–180 |  |
| `sinne` | frueher | Sinnesorgane und ihr Schutz sind hier Stoff der Klassen 1/2; Rauchen, Alkohol und Medikamente stehen nicht im Sachunterricht. | lehrplan/laender/baden-wuerttemberg.md §5 Sachunterricht Z.311–312; §4 Z.157–158 |  |
| `musik` | passt | Notenwerte sind hier schon in Klasse 1/2 verbindlich. | lehrplan/laender/baden-wuerttemberg.md §5 Musik Z.350–354; §4 Z.204–211 |  |
| `teestube` | passt | Auch Französisch kann hier erste Fremdsprache sein; die Zahlen 11 bis 19 sind nicht ausdrücklich genannt. | lehrplan/laender/baden-wuerttemberg.md §5 Englisch Z.367–372; §3 Z.63; §4 Z.223–228 |  |
| `doppeldecker` | passt | Auch Französisch kann hier erste Fremdsprache sein. | lehrplan/laender/baden-wuerttemberg.md §5 Englisch Z.367–369; §3 Z.63 |  |
| `ichdu1` | passt | In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik; Gefühle, Regeln, Streit und Familie stehen im Sachunterricht. | lehrplan/laender/baden-wuerttemberg.md §5 Ethik Z.333–334; §4 Z.155, 193–194 |  |
| `feste2` | nicht | In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik; christliche Feste gehören zum Religionsunterricht. | lehrplan/laender/baden-wuerttemberg.md §5 Ethik Z.334, 339–340; §4 Z.195–196 |  |
| `instrumente2` | passt |  | lehrplan/laender/baden-wuerttemberg.md §5 Musik Z.349; §4 Z.204–207 |  |
| `musik1` | passt |  | lehrplan/laender/baden-wuerttemberg.md §5 Musik Z.349; §4 Z.204–207 |  |
| `laute1` | passt |  | lehrplan/laender/baden-wuerttemberg.md §5 Deutsch Z.271; §4 Z.135 |  |
| `schreiben2` | passt | Für doppelte Mitlaute und das Verlängern war die Klassenstufe im Plan nicht nachzulesen. | lehrplan/laender/baden-wuerttemberg.md §5 Deutsch Z.271–272, 284–285; §4 Z.124–127 |  |
| `woerter2` | passt | Wortfamilien, Wortstamm und Wortfelder sind hier erst für Klasse 3/4 als Begriffe vorgesehen. | lehrplan/laender/baden-wuerttemberg.md §5 Deutsch Z.273, 281–282; §4 Z.135–138 |  |
| `zahlen20` | passt |  | lehrplan/laender/baden-wuerttemberg.md §5 Mathematik Z.235; §4 Z.75–80 |  |
| `formen1` | passt | Rechteck, Quadrat und Quader sind hier erst in Klasse 3/4 verbindlich. | lehrplan/laender/baden-wuerttemberg.md §5 Mathematik Z.237, 247–249; §4 Z.83–85 |  |
| `zahlen100` | passt |  | lehrplan/laender/baden-wuerttemberg.md §5 Mathematik Z.235; §4 Z.75–80 |  |
| `malteilen` | passt |  | lehrplan/laender/baden-wuerttemberg.md §5 Mathematik Z.236; §4 Z.77–79 |  |
| `groessen2` | passt | Kommabeträge, Millimeter und „sicher, möglich, unmöglich“ stehen hier erst in Klasse 3/4. | lehrplan/laender/baden-wuerttemberg.md §5 Mathematik Z.238, 252–254; §4 Z.86–88 |  |
| `formen2` | offen | Symmetrie und Würfelgebäude stehen hier in Klasse 1/2; parallel, senkrecht, Kanten und Flächen erst in Klasse 3/4. | lehrplan/laender/baden-wuerttemberg.md §5 Mathematik Z.237, 247–251; §4 Z.83–85, 98–99 | aus „hier meist später“: zwei Aufgabenarten passen, zwei liegen später, eine fehlt im Plan |
| `koerper1` | passt | Der Notruf steht hier erst in Klasse 3/4 beim Thema Feuer. | lehrplan/laender/baden-wuerttemberg.md §5 Sachunterricht Z.299, 318; §4 Z.155–157, 174 |  |
| `jahr1` | passt |  | lehrplan/laender/baden-wuerttemberg.md §5 Sachunterricht Z.299–300; §4 Z.162–164 |  |
| `baeume2` | passt | Bestimmte Baumarten, Frühblüher und Obstsorten schreibt der Plan nicht vor. | lehrplan/laender/baden-wuerttemberg.md §5 Sachunterricht Z.301, 315; §4 Z.158–159 |  |
| `tiere2` | offen | Tierhaltung steht im Plan; bestimmte Vogelarten und Kleintiere schreibt er nicht vor. | lehrplan/laender/baden-wuerttemberg.md §5 Sachunterricht Z.302, 315; §4 Z.158–160 | aus „passt“: nur zwei von fünf Aufgabenarten gestützt |
| `natur2` | offen | Licht, Luft und Pläne stehen im Plan; Sonne, Mond und Sterne, Thermometer und Warnzeichen nennt er nicht. | lehrplan/laender/baden-wuerttemberg.md §5 Sachunterricht Z.300, 316–317; §4 Z.160–162 | aus „passt“: nur drei von sieben Aufgabenarten gestützt |
| `wald` | offen | Der Plan verlangt einen Lebensraum nach Wahl der Schule; der Wald ist möglich, aber nicht vorgeschrieben. | lehrplan/laender/baden-wuerttemberg.md §4 Sachunterricht Z.169–170, 185–186 (Wald nicht genannt) | Lebensraum nach Wahl der Schule, der Wald ist nicht genannt |
| `strom` | passt | Stromkreis, Leiter und Energie stehen hier in Klasse 3/4; Magnete nennt der Plan nicht. | lehrplan/laender/baden-wuerttemberg.md §4 Sachunterricht Z.175–176 (Stromkreis, Leitfähigkeit, Wirkungen des Stroms, Energieträger), Z.185 (Magnete nicht genannt) |  |
| `religionen` | offen | In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik; Feste anderer Kulturen stehen im Sachunterricht der Klassen 1/2. | lehrplan/laender/baden-wuerttemberg.md §4 Ethik und Religion Z.191–195; Sachunterricht Z.156 | kein Fach Ethik; nur die pauschale Zeile „Feste anderer Kulturen“ (1/2) |

## Bayern (BY)

| Thema | Urteil | Hinweis für Eltern | Quelle | Herabgestuft, weil |
|---|---|---|---|---|
| `math` | passt | Vorgeschrieben ist hier das Abziehverfahren; Punkt vor Strich, Teilbarkeitsregeln und Drittel von Mengen stehen nicht im Plan. | lehrplan/laender/bayern.md §5 Mathematik Z.241–242, 248–250, 257–258; §4 Z.92–94 |  |
| `bau` | passt | Parallel und senkrecht, Parallelogramm sowie Verschieben und Drehen stehen hier nicht im Plan. | lehrplan/laender/bayern.md §5 Mathematik Z.243–244, 251–254; §4 Z.97–99 |  |
| `jahrmarkt` | passt |  | lehrplan/laender/bayern.md §5 Mathematik Z.245; §4 Z.100–104 |  |
| `woerterwerkstatt` | passt | Das Komma vor „aber“ und „denn“ nennt der Plan nicht. | lehrplan/laender/bayern.md §5 Deutsch Z.275, 288–290; §4 Z.122–125 |  |
| `satzbaustelle` | passt | Die Zeitformen heißen hier Gegenwart und 1. Vergangenheit statt Präsens und Präteritum. | lehrplan/laender/bayern.md §5 Deutsch Z.276–277, 282–283; §4 Z.130–136 |  |
| `ethik` | nicht | Martin Luther und die Reformation kommen im bayerischen Plan für Ethik nicht vor. | lehrplan/laender/bayern.md §4 Ethik und Religion Z.191; §5 Ethik Z.344–346 |  |
| `kirchenjahr` | nicht | Das Kirchenjahr kommt im bayerischen Plan für Ethik nicht vor. | lehrplan/laender/bayern.md §4 Ethik und Religion Z.191; §5 Ethik Z.344–346 |  |
| `freunde` | offen |  | lehrplan/laender/bayern.md §5 Ethik Z.341; §4 Z.187; Vorbehalt §7 Z.421 | aus „passt“: Ethik-Lernbereiche 1, 2 und 4 nur überflogen (§7) |
| `ichwelt` | offen |  | lehrplan/laender/bayern.md §5 Ethik Z.341; §4 Z.187–190; Vorbehalt §7 Z.421 | aus „passt“: Ethik-Lernbereiche 1, 2 und 4 nur überflogen (§7) |
| `kartoffel` | nicht | Die Kartoffel steht nicht im bayerischen Plan. | lehrplan/laender/bayern.md §5 HSU Z.316; §4 Z.173 |  |
| `kornkammer` | nicht | Getreide ist hier nur ein Beispiel für regionale Lebensmittel; Getreidearten sind nicht verlangt. | lehrplan/laender/bayern.md §5 HSU Z.317; §4 Z.160, 173 |  |
| `wiese` | frueher | Wiese oder Hecke ist hier Stoff der Klassen 1/2; in Klasse 3/4 folgen Wald und Gewässer. | lehrplan/laender/bayern.md §5 HSU Z.318; §4 Z.149–150, 159 |  |
| `wetterstation` | passt | Wetter beobachten ist hier Stoff der Klassen 1/2; Bauernregeln stehen nicht im Plan. | lehrplan/laender/bayern.md §5 HSU Z.308–309, 321; §4 Z.161–163 |  |
| `kompass` | passt | Bayern auf der Karte steht hier im Plan der Klassen 3/4. | lehrplan/laender/bayern.md §5 HSU Z.310; §4 Z.164–165 |  |
| `verkehr` | passt | Die Radfahrausbildung liegt hier in Klasse 4. | lehrplan/laender/bayern.md §5 HSU Z.311; §4 Z.166, 170 |  |
| `frueher` | passt |  | lehrplan/laender/bayern.md §5 HSU Z.312; §4 Z.157–158, 163–164 |  |
| `sinne` | frueher | Die Sinne sind hier Stoff der Klassen 1/2, in Klasse 3/4 folgt nur das Auge; Ohr und Suchtmittel stehen nicht im Plan. | lehrplan/laender/bayern.md §5 HSU Z.319–320; §4 Z.148–149, 158, 173 |  |
| `musik` | passt | Notennamen und italienische Wörter wie piano und forte sind hier nicht verlangt. | lehrplan/laender/bayern.md §5 Musik Z.360–369; §4 Z.205–212 |  |
| `teestube` | passt | Verbindlich sind hier nur die Zahlen 1 bis 12, 15, 30 und 45; Körperteile gehören nicht zum Pflichtwortschatz. | lehrplan/laender/bayern.md §5 Englisch Z.379–387; §4 Z.221–225 |  |
| `doppeldecker` | passt | Wochentage und Monate gehören hier nicht zum verbindlichen Wortschatz. | lehrplan/laender/bayern.md §5 Englisch Z.380–381, 385; §4 Z.225–227 |  |
| `ichdu1` | offen |  | lehrplan/laender/bayern.md §5 Ethik Z.338; §4 Z.182 | aus „passt“: Ethik-Lernbereiche 1, 2 und 4 nur überflogen (§7) |
| `feste2` | passt | St. Martin, Erntedank, Nikolaus und Advent nennt der Plan nicht; er verlangt auch Feste anderer Religionen. | lehrplan/laender/bayern.md §5 Ethik Z.339–340, 347; §4 Z.183–186 |  |
| `instrumente2` | passt | Die Form A – B – A steht hier nicht für Klasse 1/2; dort nur Strophe und Refrain. | lehrplan/laender/bayern.md §5 Musik Z.359, 368; §4 Z.201–204 |  |
| `musik1` | passt |  | lehrplan/laender/bayern.md §5 Musik Z.358; §4 Z.201–204 |  |
| `laute1` | passt | In Bayern zeigt Lernquest die Wörter Vokal und Konsonant, wie sie im Lehrplan stehen. | lehrplan/laender/bayern.md §5 Deutsch Z.272, 284; §4 Z.127, 135–136 |  |
| `schreiben2` | passt | Wörter mit aa, ee, oo und chs gehören hier zum Grundwortschatz der Klassen 3/4. | lehrplan/laender/bayern.md §5 Deutsch Z.272–273, 287; §4 Z.117–125 |  |
| `woerter2` | passt | Der Aufforderungssatz ist hier erst bis Ende Klasse 4 vorgesehen. | lehrplan/laender/bayern.md §5 Deutsch Z.274, 285–286; §4 Z.127–132 |  |
| `zahlen20` | passt |  | lehrplan/laender/bayern.md §5 Mathematik Z.234–236; §4 Z.71–73 |  |
| `formen1` | passt |  | lehrplan/laender/bayern.md §5 Mathematik Z.239; §4 Z.78–80 |  |
| `zahlen100` | passt |  | lehrplan/laender/bayern.md §5 Mathematik Z.234–236; §4 Z.71–76 |  |
| `malteilen` | passt |  | lehrplan/laender/bayern.md §5 Mathematik Z.237–238; §3 Z.53 |  |
| `groessen2` | passt | Millimeter und Kommabeträge stehen hier erst in Klasse 3/4; Dezimeter nennt der Plan nicht. | lehrplan/laender/bayern.md §5 Mathematik Z.240, 255; §4 Z.81–83, 100–101 |  |
| `formen2` | passt | Der rechte Winkel steht hier erst in Klasse 3/4; parallel, senkrecht, Gerade und Strahl nennt der Plan nicht. | lehrplan/laender/bayern.md §5 Mathematik Z.239, 251–254; §4 Z.78–80, 97–99 |  |
| `koerper1` | passt | Erste Hilfe und Notruf stehen hier erst in Klasse 3/4. | lehrplan/laender/bayern.md §5 HSU Z.305; §4 Z.148–149, 158–159 |  |
| `jahr1` | passt |  | lehrplan/laender/bayern.md §5 HSU Z.305–306; §4 Z.151–153 |  |
| `baeume2` | offen | Laub- und Nadelbäume gehören hier zum Wald in Klasse 3/4; Obst steht in Klasse 1/2. | lehrplan/laender/bayern.md §5 HSU Z.307, 322; §4 Z.150, 159 | aus „hier meist später“: ruht auf einer einzigen Zeile, vier Aufgabenarten sind nicht erwähnt |
| `tiere2` | offen | Im Plan stehen Haus- und Nutztiere; Vögel und Kleintiere nennt er nicht. | lehrplan/laender/bayern.md §5 HSU Z.307; §4 Z.149–150 | aus „passt“: nur zwei von fünf Aufgabenarten gestützt |
| `natur2` | offen | Luft, Wasser und Pläne stehen im Plan; Licht und Schatten, Sonne, Mond und Sterne und Warnzeichen nennt er nicht. | lehrplan/laender/bayern.md §5 HSU Z.306, 322–323; §4 Z.150–153 | aus „passt“: nur drei von sieben Aufgabenarten gestützt |
| `wald` | passt | Wald und Gewässer stehen hier im Plan der Klassen 3/4, mit Arten und Nahrungsbeziehungen. | lehrplan/laender/bayern.md §4 HSU Z.159 (3/4: Wald und Gewässer – Arten, Angepasstheit, Nahrungsbeziehungen: stock, baum, spur, kreislauf, pilz) |  |
| `strom` | passt | Magnete nennt der Plan nicht. Er verlangt Schaltzeichen; Lernquest zeigt den Stromkreis als Bild. | lehrplan/laender/bayern.md §4 HSU Z.160–161 (3/4: Leiter, Stromkreis mit Schaltzeichen, Stromerzeugung, Energiesparen), Z.173 (Magnete nicht genannt) |  |
| `religionen` | passt | Feste der Religionen stehen hier schon in Klasse 1/2; Gotteshäuser, Schriften und Zeichen in Klasse 3/4. | lehrplan/laender/bayern.md §4 Ethik und Religion Z.183–185 (1/2: religiöse Feste), Z.188–190 (3/4: Merkmale der Religionen mit Räumen, Schriften, Symbolen, Festen) |  |

## Berlin (BE)

| Thema | Urteil | Hinweis für Eltern | Quelle | Herabgestuft, weil |
|---|---|---|---|---|
| `math` | passt | Ein Drittel und Bruchteile von Mengen stehen hier nicht im Plan. | lehrplan/laender/berlin.md §5 Mathematik Z.184–185, 197–199; §4 Z.82–84 |  |
| `bau` | passt | Zylinder, Kegel und Pyramide sowie Dreiecksarten stehen hier bis Klasse 4 nicht im Plan. | lehrplan/laender/berlin.md §5 Mathematik Z.186, 194–196; §4 Z.86–90 |  |
| `jahrmarkt` | passt |  | lehrplan/laender/berlin.md §5 Mathematik Z.187; §4 Z.84–91 |  |
| `woerterwerkstatt` | passt | Komma vor „aber“ und „denn“ und das Nachschlagen nach der Grundform stehen hier erst in Klasse 5/6. | lehrplan/laender/berlin.md §5 Deutsch Z.217–218, 225–226; §4 Z.100–102 |  |
| `satzbaustelle` | passt | Sammelwörter, die Anrede im Brief und Wörter wie mein, dieser, kein stehen hier erst in Klasse 5/6. | lehrplan/laender/berlin.md §5 Deutsch Z.219–221, 227–229; §4 Z.103–111 |  |
| `ethik` | nicht | In Berlin gibt es in der Grundschule kein Fach Ethik; Martin Luther steht in keinem staatlichen Plan der Grundschule. | lehrplan/laender/berlin.md §4 Ethik / Religion Z.139–143; §5 Ethik Z.281–285 |  |
| `kirchenjahr` | nicht | In Berlin gibt es in der Grundschule kein Fach Ethik; das Kirchenjahr steht in keinem staatlichen Plan der Grundschule. | lehrplan/laender/berlin.md §4 Ethik / Religion Z.139–143; §5 Ethik Z.281–285 |  |
| `freunde` | offen | In Berlin gibt es in der Grundschule kein Fach Ethik; im Sachunterricht steht das Thema ohne Klassenstufe. | lehrplan/laender/berlin.md §5 Ethik Z.277–278; §4 Z.122–123, 139–140 | aus „passt“: Inhalte des Sachunterrichts ohne Klassenzuordnung; ichwelt nur „Teile“ |
| `ichwelt` | offen | In Berlin gibt es in der Grundschule kein Fach Ethik; im Sachunterricht steht das Thema ohne Klassenstufe. | lehrplan/laender/berlin.md §5 Ethik Z.277–278 („Teile von ichwelt“); §4 Z.139–140 | aus „passt“: Inhalte des Sachunterrichts ohne Klassenzuordnung; ichwelt nur „Teile“ |
| `kartoffel` | nicht | Die Kartoffel kommt im Plan nicht vor, nur „Obst und Gemüse“ und „Knollen“. | lehrplan/laender/berlin.md §5 Sachunterricht Z.255–256; §4 Z.134–135 |  |
| `kornkammer` | nicht | Getreide kommt im Plan nicht vor. | lehrplan/laender/berlin.md §5 Sachunterricht Z.255–256; §4 Z.134–135 |  |
| `wiese` | nicht | Die Wiese ist hier nur ein Lebensraum unter mehreren; Schichten der Wiese und Pflanzensammlung sind nicht verlangt. | lehrplan/laender/berlin.md §5 Sachunterricht Z.259–260; §4 Z.134–135 |  |
| `wetterstation` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/berlin.md §5 Sachunterricht Z.249, 261; §4 Z.119, 130 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `kompass` | nicht | Himmelsrichtungen, Windrose und Kompass nennt der Plan nicht; Stadtpläne und die Lage Berlins in Deutschland stehen im Plan. | lehrplan/laender/berlin.md §5 Sachunterricht Z.257–258; §4 Z.134–135; §4 Z.119–120 |  |
| `verkehr` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/berlin.md §5 Sachunterricht Z.247; §4 Z.126–128 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `frueher` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/berlin.md §5 Sachunterricht Z.250; §4 Z.123, 126–127, 132–133 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `sinne` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/berlin.md §5 Sachunterricht Z.248; §4 Z.122, 125 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `musik` | offen | Der Musikplan nennt nur mögliche Inhalte für Klasse 1 bis 4 und keine Klassenstufe. | lehrplan/laender/berlin.md §5 Musik Z.291–296; §4 Z.151–158 | aus „passt“: Musik: „mögliche Inhalte“ für die Jahrgangsstufen 1–4 insgesamt (berlin.md §4) |
| `teestube` | passt | Auch Französisch kann hier erste Fremdsprache sein. Der Plan gibt keinen Wortschatz vor. | lehrplan/laender/berlin.md §5 Englisch Z.303–308; §4 Z.162–170 |  |
| `doppeldecker` | passt | Auch Französisch kann hier erste Fremdsprache sein. Der Plan gibt keinen Wortschatz vor. | lehrplan/laender/berlin.md §5 Englisch Z.303–308; §4 Z.162–170 |  |
| `ichdu1` | offen | In Berlin gibt es in der Grundschule kein Fach Ethik; im Sachunterricht steht das Thema ohne Klassenstufe. | lehrplan/laender/berlin.md §5 Ethik Z.277–278; §4 Z.122–123 | aus „passt“: Inhalte des Sachunterrichts ohne Klassenzuordnung; ichwelt nur „Teile“ |
| `feste2` | nicht | In Berlin gibt es in der Grundschule kein Fach Ethik; christliche Feste stehen in keinem staatlichen Plan der Grundschule. | lehrplan/laender/berlin.md §5 Ethik Z.283–285; §4 Z.141–143 |  |
| `instrumente2` | offen | Der Musikplan nennt nur mögliche Inhalte für Klasse 1 bis 4 und keine Klassenstufe. | lehrplan/laender/berlin.md §5 Musik Z.291–297; §4 Z.151–157 | aus „passt“: Musik: „mögliche Inhalte“ für die Jahrgangsstufen 1–4 insgesamt (berlin.md §4) |
| `musik1` | offen | Der Musikplan nennt nur mögliche Inhalte für Klasse 1 bis 4 und keine Klassenstufe. | lehrplan/laender/berlin.md §5 Musik Z.292; §4 Z.151–155 | aus „passt“: Musik: „mögliche Inhalte“ für die Jahrgangsstufen 1–4 insgesamt (berlin.md §4) |
| `laute1` | passt |  | lehrplan/laender/berlin.md §5 Deutsch Z.215; §3 Z.60 |  |
| `schreiben2` | passt | Doppelte Mitlaute stehen hier erst in Klasse 3/4. | lehrplan/laender/berlin.md §5 Deutsch Z.215, 230–231; §4 Z.98–100 |  |
| `woerter2` | passt | Wortfamilien, Wortfelder und der Aufforderungssatz stehen hier erst in Klasse 3/4. | lehrplan/laender/berlin.md §5 Deutsch Z.216, 232–233; §4 Z.103–105 |  |
| `zahlen20` | passt |  | lehrplan/laender/berlin.md §5 Mathematik Z.180; §4 Z.73–76 |  |
| `formen1` | passt |  | lehrplan/laender/berlin.md §5 Mathematik Z.180; §4 Z.78–79 |  |
| `zahlen100` | passt |  | lehrplan/laender/berlin.md §5 Mathematik Z.180; §4 Z.73–76 |  |
| `malteilen` | passt |  | lehrplan/laender/berlin.md §5 Mathematik Z.181–182; §3 Z.53 |  |
| `groessen2` | passt | Kommabeträge sind hier in Klasse 1/2 ausdrücklich nicht vorgesehen; Millimeter und Dezimeter folgen in Klasse 3/4. | lehrplan/laender/berlin.md §5 Mathematik Z.183, 190–191; §3 Z.57 |  |
| `formen2` | passt | Parallel und senkrecht sowie Gerade und Strahl stehen hier erst in Klasse 3/4. | lehrplan/laender/berlin.md §5 Mathematik Z.183, 192–193; §4 Z.78–79, 87–88 |  |
| `koerper1` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/berlin.md §5 Sachunterricht Z.251; §4 Z.122–125 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `jahr1` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/berlin.md §5 Sachunterricht Z.251; §4 Z.132 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `baeume2` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/berlin.md §5 Sachunterricht Z.251, 263; §4 Z.124 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `tiere2` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/berlin.md §5 Sachunterricht Z.251; §4 Z.129 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `natur2` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/berlin.md §5 Sachunterricht Z.251–252, 262; §4 Z.119, 130 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `wald` | offen | Der Wald ist im Plan nur ein Stichwort zum Lebensraum, ohne feste Klasse; das legt die Schule fest. | lehrplan/laender/berlin.md §4 Sachunterricht Z.116–117, 135 | Themenfelder ohne Klassenzuordnung; Wald nur als Lebensraum-Stichwort |
| `strom` | offen | Den Stromkreis nennt der Plan beim Fahrrad, ohne feste Klasse; Magnete nennt er nicht. | lehrplan/laender/berlin.md §4 Sachunterricht Z.116–117, 127, 134 | Themenfelder ohne Klassenzuordnung; Magnete nicht im Text |
| `religionen` | offen | In Berlin gibt es in der Grundschule kein Fach Ethik; der Sachunterricht nennt Feste und Feiertage nur allgemein. | lehrplan/laender/berlin.md §4 Ethik / Religion Z.139–143 | kein Fach Ethik; der Sachunterricht nennt Feste nur allgemein |

## Brandenburg (BB)

| Thema | Urteil | Hinweis für Eltern | Quelle | Herabgestuft, weil |
|---|---|---|---|---|
| `math` | passt | Ein Drittel und Bruchteile von Mengen stehen hier nicht im Plan. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Mathematik Z.184–185, 197–199; §4 Z.82–84 |  |
| `bau` | passt | Zylinder, Kegel und Pyramide sowie Dreiecksarten stehen hier bis Klasse 4 nicht im Plan. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Mathematik Z.186, 194–196; §4 Z.86–90 |  |
| `jahrmarkt` | passt |  | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Mathematik Z.187; §4 Z.84–91 |  |
| `woerterwerkstatt` | passt | Komma vor „aber“ und „denn“ und das Nachschlagen nach der Grundform stehen hier erst in Klasse 5/6. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Deutsch Z.217–218, 225–226; §4 Z.100–102 |  |
| `satzbaustelle` | passt | Sammelwörter, die Anrede im Brief und Wörter wie mein, dieser, kein stehen hier erst in Klasse 5/6. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Deutsch Z.219–221, 227–229; §4 Z.103–111 |  |
| `ethik` | nicht | In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; Martin Luther steht in keinem staatlichen Plan der Grundschule. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §4 Ethik / Religion Z.139–143; §5 Ethik Z.281–285 |  |
| `kirchenjahr` | nicht | In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; das Kirchenjahr steht in keinem staatlichen Plan der Grundschule. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §4 Ethik / Religion Z.139–143; §5 Ethik Z.281–285 |  |
| `freunde` | offen | In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; im Sachunterricht steht das Thema ohne Klassenstufe. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Ethik Z.277–278; §4 Z.122–123, 139–140 | aus „passt“: Inhalte des Sachunterrichts ohne Klassenzuordnung; ichwelt nur „Teile“ |
| `ichwelt` | offen | In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; im Sachunterricht steht das Thema ohne Klassenstufe. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Ethik Z.277–278 („Teile von ichwelt“); §4 Z.139–140 | aus „passt“: Inhalte des Sachunterrichts ohne Klassenzuordnung; ichwelt nur „Teile“ |
| `kartoffel` | nicht | Die Kartoffel kommt im Plan nicht vor, nur „Obst und Gemüse“ und „Knollen“. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Sachunterricht Z.255–256; §4 Z.134–135 |  |
| `kornkammer` | nicht | Getreide kommt im Plan nicht vor. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Sachunterricht Z.255–256; §4 Z.134–135 |  |
| `wiese` | nicht | Die Wiese ist hier nur ein Lebensraum unter mehreren; Schichten der Wiese und Pflanzensammlung sind nicht verlangt. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Sachunterricht Z.259–260; §4 Z.134–135 |  |
| `wetterstation` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Sachunterricht Z.249, 261; §4 Z.119, 130 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `kompass` | nicht | Himmelsrichtungen, Windrose und Kompass nennt der Plan nicht; Karten und die Lage Brandenburgs in Deutschland stehen im Plan. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Sachunterricht Z.257–258; §4 Z.134–135; brandenburg.md §4 Z.62–63 |  |
| `verkehr` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Sachunterricht Z.247; §4 Z.126–128 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `frueher` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Sachunterricht Z.250; §4 Z.123, 126–127, 132–133 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `sinne` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Sachunterricht Z.248; §4 Z.122, 125 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `musik` | offen | Der Musikplan nennt nur mögliche Inhalte für Klasse 1 bis 4 und keine Klassenstufe. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Musik Z.291–296; §4 Z.151–158 | aus „passt“: Musik: „mögliche Inhalte“ für die Jahrgangsstufen 1–4 insgesamt (berlin.md §4) |
| `teestube` | passt | Der Plan gibt keinen Wortschatz vor. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Englisch Z.303–308; §4 Z.162–170 |  |
| `doppeldecker` | passt | Der Plan gibt keinen Wortschatz vor. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Englisch Z.303–308; §4 Z.162–170 |  |
| `ichdu1` | offen | In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; im Sachunterricht steht das Thema ohne Klassenstufe. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Ethik Z.277–278; §4 Z.122–123 | aus „passt“: Inhalte des Sachunterrichts ohne Klassenzuordnung; ichwelt nur „Teile“ |
| `feste2` | nicht | In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; christliche Feste stehen in keinem staatlichen Plan der Grundschule. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Ethik Z.283–285; §4 Z.141–143 |  |
| `instrumente2` | offen | Der Musikplan nennt nur mögliche Inhalte für Klasse 1 bis 4 und keine Klassenstufe. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Musik Z.291–297; §4 Z.151–157 | aus „passt“: Musik: „mögliche Inhalte“ für die Jahrgangsstufen 1–4 insgesamt (berlin.md §4) |
| `musik1` | offen | Der Musikplan nennt nur mögliche Inhalte für Klasse 1 bis 4 und keine Klassenstufe. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Musik Z.292; §4 Z.151–155 | aus „passt“: Musik: „mögliche Inhalte“ für die Jahrgangsstufen 1–4 insgesamt (berlin.md §4) |
| `laute1` | passt |  | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Deutsch Z.215; §3 Z.60 |  |
| `schreiben2` | passt | Doppelte Mitlaute stehen hier erst in Klasse 3/4. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Deutsch Z.215, 230–231; §4 Z.98–100 |  |
| `woerter2` | passt | Wortfamilien, Wortfelder und der Aufforderungssatz stehen hier erst in Klasse 3/4. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Deutsch Z.216, 232–233; §4 Z.103–105 |  |
| `zahlen20` | passt |  | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Mathematik Z.180; §4 Z.73–76 |  |
| `formen1` | passt |  | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Mathematik Z.180; §4 Z.78–79 |  |
| `zahlen100` | passt |  | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Mathematik Z.180; §4 Z.73–76 |  |
| `malteilen` | passt |  | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Mathematik Z.181–182; §3 Z.53 |  |
| `groessen2` | passt | Kommabeträge sind hier in Klasse 1/2 ausdrücklich nicht vorgesehen; Millimeter und Dezimeter folgen in Klasse 3/4. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Mathematik Z.183, 190–191; §3 Z.57 |  |
| `formen2` | passt | Parallel und senkrecht sowie Gerade und Strahl stehen hier erst in Klasse 3/4. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Mathematik Z.183, 192–193; §4 Z.78–79, 87–88 |  |
| `koerper1` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Sachunterricht Z.251; §4 Z.122–125 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `jahr1` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Sachunterricht Z.251; §4 Z.132 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `baeume2` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Sachunterricht Z.251, 263; §4 Z.124 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `tiere2` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Sachunterricht Z.251; §4 Z.129 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `natur2` | offen | Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest. | lehrplan/laender/brandenburg.md §5 Z.74–96 → berlin.md §5 Sachunterricht Z.251–252, 262; §4 Z.119, 130 | aus „passt“: Sachunterricht: Themenfelder „ohne Zuordnung zu Klassen“ (berlin.md §4) |
| `wald` | offen | Der Wald ist im Plan nur ein Stichwort zum Lebensraum, ohne feste Klasse; das legt die Schule fest. | lehrplan/laender/brandenburg.md §4 Z.62–64 → berlin.md §4 Sachunterricht Z.116–117, 135 | Themenfelder ohne Klassenzuordnung; Wald nur als Lebensraum-Stichwort |
| `strom` | offen | Den Stromkreis nennt der Plan beim Fahrrad, ohne feste Klasse; Magnete nennt er nicht. | lehrplan/laender/brandenburg.md §4 Z.62–64 → berlin.md §4 Sachunterricht Z.116–117, 127, 134 | Themenfelder ohne Klassenzuordnung; Magnete nicht im Text |
| `religionen` | offen | In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; der Sachunterricht nennt Feste nur allgemein. | lehrplan/laender/brandenburg.md §3 Z.50 → berlin.md §4 Ethik / Religion Z.142–143 | kein Fach Ethik in Klasse 1–4; der Sachunterricht nennt Feste nur allgemein |

## Hamburg (HH)

| Thema | Urteil | Hinweis für Eltern | Quelle | Herabgestuft, weil |
|---|---|---|---|---|
| `math` | passt | Schriftliches Malnehmen, Punkt vor Strich und Klammern stehen hier erst in Klasse 4; Teilbarkeitsregeln und Drittel nennt der Plan nicht. | lehrplan/laender/hamburg.md §5 Mathematik Z.173–174, 184–186; §4.1 Z.86–96; §4.1 Z.94 |  |
| `bau` | spaeter | Faltvorlagen, Ansichten, parallel und senkrecht, Umfang und Fläche stehen hier erst in Klasse 4; Körper und Symmetrie in Klasse 3. | lehrplan/laender/hamburg.md §5 Mathematik Z.175, 187–188; §4.1 Z.89–96 |  |
| `jahrmarkt` | passt | Liter und Milliliter stehen hier erst in Klasse 4. | lehrplan/laender/hamburg.md §5 Mathematik Z.175; §4.1 Z.88–92; §3 Z.60; §4.1 Z.95 |  |
| `woerterwerkstatt` | passt | Das Komma vor „aber“ und „denn“ steht hier nicht im Plan. | lehrplan/laender/hamburg.md §5 Deutsch Z.201–202, 207; §4.2 Z.105–108 |  |
| `satzbaustelle` | passt | Wörter wie dieser, jeder und kein nennt der Plan nicht; er kennt nur Personal- und Possessivpronomen. | lehrplan/laender/hamburg.md §5 Deutsch Z.202, 209–210; §4.2 Z.109–112 |  |
| `ethik` | nicht | In Hamburg gibt es in der Grundschule kein Fach Ethik; Martin Luther kommt im Plan für Religion nicht vor. | lehrplan/laender/hamburg.md §4.4 Z.134–144; §5 Ethik / Religion Z.245–246 |  |
| `kirchenjahr` | nicht | In Hamburg gibt es in der Grundschule kein Fach Ethik; das Kirchenjahr kommt im Plan für Religion nicht vor. | lehrplan/laender/hamburg.md §4.4 Z.134–144; §5 Ethik / Religion Z.245–246 |  |
| `freunde` | offen | In Hamburg gibt es in der Grundschule kein Fach Ethik; Freundschaft steht in Klasse 1/2 im Sachunterricht. | lehrplan/laender/hamburg.md §5 Ethik / Religion Z.241 („als allgemeines Sozialthema“, ohne Klassenstufe); §4.3 Z.121–122 |  |
| `ichwelt` | offen | In Hamburg gibt es in der Grundschule kein Fach Ethik; philosophische Fragen sind dort Teil des Fachs Religion. | lehrplan/laender/hamburg.md §5 Ethik / Religion Z.248 |  |
| `kartoffel` | offen | Nutzpflanzen sind hier Stoff der Klassen 1/2, und nur eine Pflanze nach Wahl der Schule. | lehrplan/laender/hamburg.md §5 Sachunterricht Z.225–226; §4.3 Z.124–125 | aus „hier meist früher“: „eine ausgewählte Nutzpflanze“; Kartoffel und Getreide sind nicht genannt |
| `kornkammer` | offen | Nutzpflanzen sind hier Stoff der Klassen 1/2, und nur eine Pflanze nach Wahl der Schule. | lehrplan/laender/hamburg.md §5 Sachunterricht Z.225–226; §4.3 Z.124–125 | aus „hier meist früher“: „eine ausgewählte Nutzpflanze“; Kartoffel und Getreide sind nicht genannt |
| `wiese` | nicht | Der Lebensraum Wiese ist in Hamburg kein Unterrichtsvorhaben. | lehrplan/laender/hamburg.md §5 Sachunterricht Z.227 |  |
| `wetterstation` | passt | Schwimmen und Sinken gehört hier zum Vorhaben „Wasser“ der Klasse 4. | lehrplan/laender/hamburg.md §5 Sachunterricht Z.221, 228; §4.3 Z.127–129 |  |
| `kompass` | passt |  | lehrplan/laender/hamburg.md §5 Sachunterricht Z.221; §4.3 Z.126 |  |
| `verkehr` | passt |  | lehrplan/laender/hamburg.md §5 Sachunterricht Z.221–222; §4.3 Z.131–132 |  |
| `frueher` | offen | „Früher“ macht Hamburg am Mittelalter und an der Hansezeit fest; Medien und andere Länder stehen im Plan. | lehrplan/laender/hamburg.md §5 Sachunterricht Z.222, 229; §4.3 Z.123–127 | aus „passt“: nur drei von sechs Aufgabenarten gestützt |
| `sinne` | frueher | Die fünf Sinne stehen hier in Klasse 1/2; der Bau von Auge und Ohr ist nicht genannt. | lehrplan/laender/hamburg.md §5 Sachunterricht Z.226; §4.3 Z.122–123 |  |
| `musik` | offen | Instrumentengruppen und Takt stehen im Plan; Notennamen, piano und forte und Komponisten sind nicht vorgeschrieben. | lehrplan/laender/hamburg.md §5 Musik Z.257, 260–262; §4.5 Z.148–152 | aus „passt“: nur drei von acht Aufgabenarten gestützt |
| `teestube` | frueher | Englisch beginnt hier in Klasse 1; Farben, Zahlen bis 20, Essen und Tiere sind Stoff der Klassen 1/2. | lehrplan/laender/hamburg.md §5 Englisch Z.270, 273–274; §4.6 Z.156–161 |  |
| `doppeldecker` | passt | Englisch beginnt hier schon in Klasse 1; Lesen und Schreiben kommen ab Klasse 3 dazu. | lehrplan/laender/hamburg.md §5 Englisch Z.270; §4.6 Z.156–163 |  |
| `ichdu1` | passt | In Hamburg gibt es in der Grundschule kein Fach Ethik; die Inhalte stehen in Religion und im Sachunterricht. | lehrplan/laender/hamburg.md §5 Ethik / Religion Z.241; §4.3 Z.121–122; §4.4 Z.139 |  |
| `feste2` | passt | In Hamburg gibt es in der Grundschule kein Fach Ethik; Feste stehen in Religion, St. Martin und Advent sind nicht genannt. | lehrplan/laender/hamburg.md §5 Ethik / Religion Z.242, 247; §4.4 Z.139–142 |  |
| `instrumente2` | passt | Die Form A – B – A steht hier erst in Klasse 3/4. | lehrplan/laender/hamburg.md §5 Musik Z.257, 262; §4.5 Z.148–151 |  |
| `musik1` | passt |  | lehrplan/laender/hamburg.md §5 Musik Z.257; §4.5 Z.148–149 |  |
| `laute1` | passt |  | lehrplan/laender/hamburg.md §5 Deutsch Z.199; §4.2 Z.101–104 |  |
| `schreiben2` | passt | ß, Dehnungs-h und Wörter mit aa, ee, oo und ai stehen hier erst in Klasse 3/4. | lehrplan/laender/hamburg.md §5 Deutsch Z.199, 205; §4.2 Z.101–106 |  |
| `woerter2` | passt | Hamburg nennt Aussage-, Frage- und Ausrufesatz, nicht den Aufforderungssatz. | lehrplan/laender/hamburg.md §5 Deutsch Z.199–200, 206; §4.2 Z.109–112 |  |
| `zahlen20` | passt | Cent-Münzen kommen hier erst in Klasse 2 dazu. | lehrplan/laender/hamburg.md §5 Mathematik Z.170, 178; §4.1 Z.72–76 |  |
| `formen1` | offen | Rechteck, Quadrat und Quader kommen hier erst in Klasse 2 dazu. | lehrplan/laender/hamburg.md §5 Mathematik Z.179; §4.1 Z.74–76, 82–83 (unter „Passt“ nicht aufgeführt) | aus „passt“: in §5 nicht unter „Passt“ geführt, nur abgeleitet |
| `zahlen100` | passt |  | lehrplan/laender/hamburg.md §5 Mathematik Z.170; §4.1 Z.78–79 |  |
| `malteilen` | passt |  | lehrplan/laender/hamburg.md §5 Mathematik Z.170–171; §4.1 Z.79–80 |  |
| `groessen2` | passt | Kommabeträge und Dezimeter stehen hier erst in Klasse 3, Millimeter in Klasse 4. | lehrplan/laender/hamburg.md §5 Mathematik Z.172, 180–181; §3 Z.60 |  |
| `formen2` | passt | Rechter Winkel, Gerade und Strecke stehen hier erst in Klasse 3, parallel und senkrecht in Klasse 4. | lehrplan/laender/hamburg.md §5 Mathematik Z.172, 182–183; §4.1 Z.82–83, 90–95 |  |
| `koerper1` | offen | Körperpflege und Ernährung stehen im Plan; Erste Hilfe, Notruf und Nein sagen stehen nicht im Sachunterricht. | lehrplan/laender/hamburg.md §5 Sachunterricht Z.219, 230; §4.3 Z.121–123 | aus „passt“: nur zwei von sechs Aufgabenarten gestützt |
| `jahr1` | passt | Halbe Stunden liest man hier erst in Klasse 2 ab. | lehrplan/laender/hamburg.md §5 Sachunterricht Z.219; §5 Mathematik Z.178; §4.3 Z.119–123 |  |
| `baeume2` | passt |  | lehrplan/laender/hamburg.md §5 Sachunterricht Z.219–220; §4.3 Z.120–121, 124 |  |
| `tiere2` | offen | Vögel und Nutztiere stehen im Plan; Heimtiere und Kleintiere nennt er nicht. | lehrplan/laender/hamburg.md §5 Sachunterricht Z.220; §4.3 Z.120–121, 124–125 | aus „passt“: nur zwei von fünf Aufgabenarten gestützt |
| `natur2` | nicht | Licht, Luft und Warnzeichen stehen hier nicht im Plan; das Thermometer folgt in Klasse 3/4. | lehrplan/laender/hamburg.md §5 Sachunterricht Z.220, 227–228 |  |
| `wald` | offen | Der Wald ist in Hamburg kein eigenes Unterrichtsvorhaben; Bäume stehen in Klasse 1/2 bei den Jahreszeiten. | lehrplan/laender/hamburg.md §4.3 Z.117–129 (Wald kein Vorhaben; Bäume in 1.4) | Vorhaben 4.x nur als Titel gelesen; Bäume stehen in 1.4 (1/2) |
| `strom` | offen | Magnetismus steht hier in Klasse 1/2, Stromkreise beim Thema Energie meist in Klasse 4. | lehrplan/laender/hamburg.md §4.3 Z.122 (2.1 Magnetismus), Z.129 (4.4 Energie: Stromkreise); §2 Z.43–46 | zwei von sechs Aufgabenarten in 1/2, Stromkreise nur als Titel eines Vorhabens 4.x gelesen |
| `religionen` | frueher | Feste aus mehreren Religionen stehen hier im Fach Religion schon in Klasse 1/2; Gotteshäuser in Klasse 3/4. | lehrplan/laender/hamburg.md §4.4 Religion Z.139–142 (1/2: Feste aus mindestens drei Religionen), Z.140 (3/4: Räume und Orte der Religionen) |  |

## Hessen (HE)

| Thema | Urteil | Hinweis für Eltern | Quelle | Herabgestuft, weil |
|---|---|---|---|---|
| `math` | passt | Der ältere Plan schreibt beim schriftlichen Abziehen das Ergänzen vor, Malnehmen erst in Klasse 4; Punkt vor Strich nennt er nicht. | lehrplan/laender/hessen.md §5 Mathematik Z.179–184, 190, 196–197; §3 Z.63; §3 Z.64 |  |
| `bau` | passt | Faltvorlagen stehen hier am Ende der Grundschulzeit; Parallelogramm, Verschieben und Drehen nennen die Pläne nicht. | lehrplan/laender/hessen.md §5 Mathematik Z.186–187, 198–200; §4 Z.93–98 |  |
| `jahrmarkt` | passt | Gewichte, Liter und Milliliter ordnet der Plan dem Ende der Klasse 4 zu. | lehrplan/laender/hessen.md §5 Mathematik Z.184–185, 195; §4 Z.78–87, 99–100; §4 Z.78, 87 |  |
| `woerterwerkstatt` | offen | Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest. | lehrplan/laender/hessen.md §5 Deutsch Z.210–212, 217, 220; §4 Z.109–115 | aus „passt“: Kerncurriculum beschreibt nur das Ende von Klasse 4 (§2) |
| `satzbaustelle` | offen | Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest. | lehrplan/laender/hessen.md §5 Deutsch Z.212–213, 218–219; §4 Z.116–118 | aus „passt“: Kerncurriculum beschreibt nur das Ende von Klasse 4 (§2) |
| `ethik` | nicht | Martin Luther ist im hessischen Plan für Ethik nicht enthalten; das ist Stoff des Religionsunterrichts. | lehrplan/laender/hessen.md §4 Ethik / Religion Z.149–150; §5 Ethik Z.252–253 |  |
| `kirchenjahr` | nicht | Kirche, Bibel und Kirchenjahr sind im hessischen Plan für Ethik nicht enthalten; das ist Stoff des Religionsunterrichts. | lehrplan/laender/hessen.md §4 Ethik / Religion Z.149–150; §5 Ethik Z.252–253 |  |
| `freunde` | offen | Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest. | lehrplan/laender/hessen.md §5 Ethik Z.248; §4 Z.146–148 | aus „passt“: Kerncurriculum beschreibt nur das Ende von Klasse 4 (§2) |
| `ichwelt` | offen | Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest. | lehrplan/laender/hessen.md §5 Ethik Z.248; §4 Z.146–148 | aus „passt“: Kerncurriculum beschreibt nur das Ende von Klasse 4 (§2) |
| `kartoffel` | offen | Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt. | lehrplan/laender/hessen.md §5 Sachunterricht Z.235–236; §4 Z.134–135 | aus „steht hier nicht im Plan“: gestützt nur vom Rahmenplan 1995, der nur noch für Schulen ohne Schulcurriculum gilt; das Kerncurriculum nennt keine Themen |
| `kornkammer` | offen | Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt. | lehrplan/laender/hessen.md §5 Sachunterricht Z.235–236; §4 Z.134–135 | aus „steht hier nicht im Plan“: gestützt nur vom Rahmenplan 1995, der nur noch für Schulen ohne Schulcurriculum gilt; das Kerncurriculum nennt keine Themen |
| `wiese` | offen | Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt. | lehrplan/laender/hessen.md §5 Sachunterricht Z.230–232; §4 Z.125–126, 134–135 |  |
| `wetterstation` | offen | Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt. | lehrplan/laender/hessen.md §5 Sachunterricht Z.230–232, 237; §4 Z.132 |  |
| `kompass` | offen | Karten und das Bundesland Hessen nennt der ältere Plan für Klasse 3/4; meist legt die Schule fest, was wann drankommt. | lehrplan/laender/hessen.md §5 Sachunterricht Z.230–232; §4 Z.128–129, 132 (Rahmenplan 1995); §4 Z.129 | aus „passt“: gestützt nur vom Rahmenplan 1995, der nur noch für Schulen ohne Schulcurriculum gilt; das Kerncurriculum nennt keine Themen |
| `verkehr` | offen | Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt. | lehrplan/laender/hessen.md §5 Sachunterricht Z.230–231; §4 Z.136–138 (Rahmenplan 1995) | aus „passt“: gestützt nur vom Rahmenplan 1995, der nur noch für Schulen ohne Schulcurriculum gilt; das Kerncurriculum nennt keine Themen |
| `frueher` | offen | Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt. | lehrplan/laender/hessen.md §5 Sachunterricht Z.230–232, 237; §4 Z.130–131 (Rahmenplan 1995) | aus „passt“: gestützt nur vom Rahmenplan 1995, der nur noch für Schulen ohne Schulcurriculum gilt; das Kerncurriculum nennt keine Themen |
| `sinne` | offen | Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt. | lehrplan/laender/hessen.md §5 Sachunterricht Z.230–232; §4 Z.125–126 |  |
| `musik` | offen | Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest. | lehrplan/laender/hessen.md §5 Musik Z.262, 265–267; §4 Z.156–163 | aus „passt“: Kerncurriculum beschreibt nur das Ende von Klasse 4 (§2) |
| `teestube` | passt | Auch Französisch kann hier erste Fremdsprache sein. | lehrplan/laender/hessen.md §5 Englisch Z.275, 280; §3 Z.68; §4 Z.167–169 |  |
| `doppeldecker` | offen | Auch Französisch kann hier erste Fremdsprache sein; verlangt ist bis Klasse 4 nur das Lesen vertrauter Sätze. | lehrplan/laender/hessen.md §5 Englisch Z.275, 278–280; §4 Z.170–172 | aus „passt“: drei von vier Aufgabenarten stehen in §5 unter „Zu früh“ |
| `ichdu1` | offen | Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest. | lehrplan/laender/hessen.md §5 Ethik Z.248; §4 Z.142, 146–148 | aus „passt“: Kerncurriculum beschreibt nur das Ende von Klasse 4 (§2) |
| `feste2` | offen | Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest. | lehrplan/laender/hessen.md §5 Ethik Z.248–249; §4 Z.146–148 | aus „passt“: Kerncurriculum beschreibt nur das Ende von Klasse 4 (§2) |
| `instrumente2` | offen | Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest. | lehrplan/laender/hessen.md §5 Musik Z.262; §4 Z.156–160 | aus „passt“: Kerncurriculum beschreibt nur das Ende von Klasse 4 (§2) |
| `musik1` | offen | Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest. | lehrplan/laender/hessen.md §5 Musik Z.262; §4 Z.156–160 | aus „passt“: Kerncurriculum beschreibt nur das Ende von Klasse 4 (§2) |
| `laute1` | offen | Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest. | lehrplan/laender/hessen.md §5 Deutsch Z.210; §4 Z.105–106 | aus „passt“: Kerncurriculum beschreibt nur das Ende von Klasse 4 (§2) |
| `schreiben2` | offen | Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest. | lehrplan/laender/hessen.md §5 Deutsch Z.210; §4 Z.109–115 | aus „passt“: Kerncurriculum beschreibt nur das Ende von Klasse 4 (§2) |
| `woerter2` | offen | Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest. | lehrplan/laender/hessen.md §5 Deutsch Z.210–211; §4 Z.109–118 | aus „passt“: Kerncurriculum beschreibt nur das Ende von Klasse 4 (§2) |
| `zahlen20` | passt |  | lehrplan/laender/hessen.md §5 Mathematik Z.179; §3 Z.59 |  |
| `formen1` | passt |  | lehrplan/laender/hessen.md §5 Mathematik Z.187; §4 Z.93–94 |  |
| `zahlen100` | passt |  | lehrplan/laender/hessen.md §5 Mathematik Z.179; §3 Z.59, 62 |  |
| `malteilen` | passt |  | lehrplan/laender/hessen.md §5 Mathematik Z.180; §3 Z.60–61 |  |
| `groessen2` | passt | Kommabeträge und Millimeter stehen hier erst in Klasse 3/4; Dezimeter nennt der Plan nicht. | lehrplan/laender/hessen.md §5 Mathematik Z.185–186, 193; §4 Z.80–86 |  |
| `formen2` | spaeter | Rechter Winkel, parallel, senkrecht, Gerade und Strahl stehen hier erst in Klasse 3/4; Symmetrie passt zu Klasse 1/2. | lehrplan/laender/hessen.md §5 Mathematik Z.187, 194; §4 Z.93–96 |  |
| `koerper1` | offen | Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt. | lehrplan/laender/hessen.md §5 Sachunterricht Z.230–232; §4 Z.125–126 |  |
| `jahr1` | offen | Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt. | lehrplan/laender/hessen.md §5 Sachunterricht Z.230–232; §4 Z.128–131 (Rahmenplan 1995) | aus „passt“: gestützt nur vom Rahmenplan 1995, der nur noch für Schulen ohne Schulcurriculum gilt; das Kerncurriculum nennt keine Themen |
| `baeume2` | offen | Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt. | lehrplan/laender/hessen.md §5 Sachunterricht Z.230–232; §4 Z.134–135 |  |
| `tiere2` | offen | Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt. | lehrplan/laender/hessen.md §5 Sachunterricht Z.230–232; §4 Z.134–135 |  |
| `natur2` | offen | Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt. | lehrplan/laender/hessen.md §5 Sachunterricht Z.230–232; §4 Z.128–133 |  |
| `wald` | offen | Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt. | lehrplan/laender/hessen.md §4 Sachunterricht Z.125–126 | Kerncurriculum ohne Themenliste und Jahrgang (§2) |
| `strom` | offen | Der ältere Plan nennt Stromquellen für Klasse 1/2 und Magnete ohne feste Klasse. | lehrplan/laender/hessen.md §4 Sachunterricht Z.132–133 (Rahmenplan 1995) | nur Rahmenplan 1995; Stromkreis nicht genannt, Magnete ohne Jahrgang |
| `religionen` | offen | Feste und das Miteinander der Religionen stehen im Plan bis Ende Klasse 4; was wann drankommt, legt die Schule fest. | lehrplan/laender/hessen.md §4 Ethik / Religion Z.146–148 | Kerncurriculum beschreibt nur das Ende von Klasse 4 (§2) |

## Mecklenburg-Vorpommern (MV)

| Thema | Urteil | Hinweis für Eltern | Quelle | Herabgestuft, weil |
|---|---|---|---|---|
| `math` | passt | Schriftliches Malnehmen und Teilbarkeitsregeln erst in Klasse 4, Drittel gar nicht; das Verfahren beim Abziehen wählt die Lehrkraft. | lehrplan/laender/mecklenburg-vorpommern.md §5 Mathematik Z.188–189, 195–196, 200; §3 Z.53, 55; §3 Z.54 |  |
| `bau` | passt | Umfang, Fläche und das Drehen stehen hier erst in Klasse 4; parallel und senkrecht schon in Klasse 1/2. | lehrplan/laender/mecklenburg-vorpommern.md §5 Mathematik Z.190–191, 197–199; §3 Z.57–58 |  |
| `jahrmarkt` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Mathematik Z.192; §3 Z.57; §4 Z.88–91 |  |
| `woerterwerkstatt` | passt | Das Komma vor „aber“ und „denn“ nennt der Plan nicht, nur das Komma bei Aufzählungen. | lehrplan/laender/mecklenburg-vorpommern.md §5 Deutsch Z.222–223, 230; §4 Z.100–107 |  |
| `satzbaustelle` | passt | Die Steigerung der Adjektive steht hier schon in Klasse 1/2. | lehrplan/laender/mecklenburg-vorpommern.md §5 Deutsch Z.220–221, 224–226, 231; §3 Z.61 |  |
| `ethik` | nicht | Martin Luther kommt im Plan für Philosophieren mit Kindern nicht vor; das gehört hier zum Religionsunterricht. | lehrplan/laender/mecklenburg-vorpommern.md §4 Philosophieren / Religion Z.151–154; §5 Ethik Z.287 |  |
| `kirchenjahr` | nicht | Das Kirchenjahr steht hier ausdrücklich beim Fach Religion, nicht beim Philosophieren mit Kindern. | lehrplan/laender/mecklenburg-vorpommern.md §4 Philosophieren / Religion Z.151–154; §5 Ethik Z.287 |  |
| `freunde` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Ethik Z.282; §4 Z.147–148 |  |
| `ichwelt` | offen | Nur die Frage nach Natur, Gemachtem und Gedachtem hat hier eine Entsprechung im Philosophieren mit Kindern. | lehrplan/laender/mecklenburg-vorpommern.md §5 Ethik Z.283 (nur ichwelt.welten, „nahe an“) |  |
| `kartoffel` | offen | Im Plan steht „Pflanzen auf dem Feld“ für Klasse 3/4; Kartoffel und Getreide sind dort nur Beispiele. | lehrplan/laender/mecklenburg-vorpommern.md §5 Sachunterricht Z.257–259; §4 Z.124–125, 139 | aus „passt“: nur Beispiele in der Hinweisspalte |
| `kornkammer` | offen | Im Plan steht „Pflanzen auf dem Feld“ für Klasse 3/4; Kartoffel und Getreide sind dort nur Beispiele. | lehrplan/laender/mecklenburg-vorpommern.md §5 Sachunterricht Z.257–259; §4 Z.124–125, 139 | aus „passt“: nur Beispiele in der Hinweisspalte |
| `wiese` | frueher | Wiesenpflanzen stehen hier in Klasse 1/2; Stockwerke kennt der Plan nur beim Wald. | lehrplan/laender/mecklenburg-vorpommern.md §5 Sachunterricht Z.255; §4 Z.120–121, 126 |  |
| `wetterstation` | passt | Schmelzen, Verdampfen, Kondensieren und Gefrieren stehen hier schon in Klasse 1/2. | lehrplan/laender/mecklenburg-vorpommern.md §5 Sachunterricht Z.246–247, 256; §4 Z.122–129 |  |
| `kompass` | passt | Mecklenburg-Vorpommern mit Landeshauptstadt, Flüssen, Seen und Meer steht hier im Plan der Klassen 3/4. | lehrplan/laender/mecklenburg-vorpommern.md §5 Sachunterricht Z.245; §4 Z.127–128, 133; §4 Z.132–134 |  |
| `verkehr` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Sachunterricht Z.248; §4 Z.131–132 |  |
| `frueher` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Sachunterricht Z.249; §4 Z.115–116, 131, 135 |  |
| `sinne` | frueher | Sinnesorgane und Hilfsmittel sind hier Stoff der Klassen 1/2; Süchte stehen in Klasse 3/4. | lehrplan/laender/mecklenburg-vorpommern.md §5 Sachunterricht Z.249, 254; §4 Z.117–119 |  |
| `musik` | offen | Ob Klasse 3 schon nach dem neuen Musikplan von 2024 arbeitet, war nicht nachzulesen. | lehrplan/laender/mecklenburg-vorpommern.md §5 Musik Z.299–304; §4 Z.159–166 | aus „passt“: Geltung des Plans in Klasse 3 unklar (§7) |
| `teestube` | passt | An manchen Schulen ist hier Französisch die erste Fremdsprache; der Plan gibt keine Wortliste vor. | lehrplan/laender/mecklenburg-vorpommern.md §5 Englisch Z.311–314; §4 Z.170–176 |  |
| `doppeldecker` | passt | An manchen Schulen ist hier Französisch die erste Fremdsprache; der Plan gibt keine Wortliste vor. | lehrplan/laender/mecklenburg-vorpommern.md §5 Englisch Z.311–314; §4 Z.170–179 |  |
| `ichdu1` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Ethik Z.279; §4 Z.144–145 |  |
| `feste2` | nicht | Christliche Feste stehen nicht im Plan für Philosophieren mit Kindern; Staunen über die Natur und Wachsen passen. | lehrplan/laender/mecklenburg-vorpommern.md §5 Ethik Z.280–281, 288–289; §4 Z.153–154 |  |
| `instrumente2` | passt | Die Form A – B – A entspricht hier den „Formmodellen“ der Klassen 3/4. | lehrplan/laender/mecklenburg-vorpommern.md §5 Musik Z.300; §4 Z.159–166 |  |
| `musik1` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Musik Z.300; §4 Z.159–161 |  |
| `laute1` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Deutsch Z.220; §4 Z.97–99 |  |
| `schreiben2` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Deutsch Z.220–221; §4 Z.97–99 |  |
| `woerter2` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Deutsch Z.220–221; §4 Z.102 |  |
| `zahlen20` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Mathematik Z.186–187; §4 Z.73–75 |  |
| `formen1` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Mathematik Z.186–187; §4 Z.78–80 |  |
| `zahlen100` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Mathematik Z.186–187; §4 Z.73–75 |  |
| `malteilen` | passt | Hier soll am Ende von Klasse 2 schon das ganze kleine Einmaleins sitzen. | lehrplan/laender/mecklenburg-vorpommern.md §5 Mathematik Z.186, 204–205; §3 Z.52 |  |
| `groessen2` | passt | Kommabeträge stehen hier erst in Klasse 3; Dezimeter ist nur ein Zusatzangebot. | lehrplan/laender/mecklenburg-vorpommern.md §5 Mathematik Z.187, 201–202; §3 Z.57 |  |
| `formen2` | passt | Den Strahl nennt der Plan nicht, nur Gerade und Strecke. | lehrplan/laender/mecklenburg-vorpommern.md §5 Mathematik Z.186, 203; §4 Z.78–80 |  |
| `koerper1` | passt | Erste Hilfe und Rettungskette stehen hier erst in Klasse 3/4. | lehrplan/laender/mecklenburg-vorpommern.md §5 Sachunterricht Z.250, 260; §4 Z.117–119 |  |
| `jahr1` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Sachunterricht Z.250; §4 Z.130–131 |  |
| `baeume2` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Sachunterricht Z.250–251; §4 Z.120–121 |  |
| `tiere2` | passt |  | lehrplan/laender/mecklenburg-vorpommern.md §5 Sachunterricht Z.251; §4 Z.121 |  |
| `natur2` | passt | Warnzeichen stehen nicht im Sachunterricht; Sonne, Mond und Sterne gehören hier zum Philosophieren mit Kindern. | lehrplan/laender/mecklenburg-vorpommern.md §5 Sachunterricht Z.251, 261–262; §4 Z.122–123 |  |
| `wald` | passt | Der Wald mit Waldarten, Stockwerken und Pilzen steht hier im Plan der Klassen 3/4. | lehrplan/laender/mecklenburg-vorpommern.md §4 Sachunterricht Z.125 (3/4: Lebensraum Wald – Waldarten, Stockwerke, Pilze: stock, baum, pilz, spur), Z.137 (Jahresübersicht 3: Wald) |  |
| `strom` | offen | Magnetismus steht hier im Plan der Klassen 1/2 und laut Jahresübersicht in Klasse 3; den Stromkreis nennt der Plan nicht. | lehrplan/laender/mecklenburg-vorpommern.md §4 Sachunterricht Z.120–123 (1/2: Magnetismus), Z.137 (Jahresübersicht 3) | nur zwei von sechs Aufgabenarten (Magnete) gestützt, Stromkreis nicht genannt |
| `religionen` | offen | Die Vielfalt der Religionen steht hier im Sachunterricht der Klassen 3/4; einzelne Feste nennt der Plan nicht. | lehrplan/laender/mecklenburg-vorpommern.md §4 Sachunterricht Z.115–116; Philosophieren Z.151–154 | nur die pauschale Zeile „Vielfalt der Kulturen und Religionen“ |

## Niedersachsen (NI)

| Thema | Urteil | Hinweis für Eltern | Quelle | Herabgestuft, weil |
|---|---|---|---|---|
| `math` | passt | Teilen mit Rest, Brüche, Punkt vor Strich und Teilbarkeit stehen nicht im Plan; wie schriftlich abgezogen wird, legt die Schule fest. | lehrplan/laender/niedersachsen.md §5 Mathematik Z.230–231, 238–240; §4 Z.79–88; §3 Z.59 |  |
| `bau` | passt | Umfang, Kegel, Parallelogramm und Dreiecksarten nennt der Plan nicht. | lehrplan/laender/niedersachsen.md §5 Mathematik Z.231–232, 248–249; §4 Z.107–111 |  |
| `jahrmarkt` | passt |  | lehrplan/laender/niedersachsen.md §5 Mathematik Z.232; §4 Z.96–97, 116 |  |
| `woerterwerkstatt` | passt | Komma vor „aber“ und „denn“ und das Trennen am Zeilenende nennt der Plan nicht ausdrücklich. | lehrplan/laender/niedersachsen.md §5 Deutsch Z.264–265, 274–275; §4 Z.124–132 |  |
| `satzbaustelle` | passt | Anrede im Brief, Redensarten und Wörter wie mein, dieser und kein nennt der Plan nicht ausdrücklich. | lehrplan/laender/niedersachsen.md §5 Deutsch Z.266–267, 275; §4 Z.133–139 |  |
| `ethik` | nicht | Martin Luther ist kein Inhalt des Fachs Werte und Normen. | lehrplan/laender/niedersachsen.md §4 Werte und Normen / Religion Z.186–187; §5 Z.322–323; Vorbehalt §7 Z.393–395 |  |
| `kirchenjahr` | nicht | Das Kirchenjahr ist kein Inhalt des Fachs Werte und Normen; es steht bei der Christlichen Religion. | lehrplan/laender/niedersachsen.md §4 Werte und Normen / Religion Z.186–187; §5 Z.322–323; Vorbehalt §7 Z.393–395 |  |
| `freunde` | offen | Verglichen wurden die Vorgaben von 2022; den neuen Plan für Werte und Normen von 2026 haben wir noch nicht gelesen. | lehrplan/laender/niedersachsen.md §5 Werte und Normen Z.318; §7 Z.393–395 (geltendes Kerncurriculum 2026 nicht gelesen) |  |
| `ichwelt` | offen | Verglichen wurden die Vorgaben von 2022; den neuen Plan für Werte und Normen von 2026 haben wir noch nicht gelesen. | lehrplan/laender/niedersachsen.md §5 Werte und Normen Z.319; §7 Z.393–395 (geltendes Kerncurriculum 2026 nicht gelesen) |  |
| `kartoffel` | nicht | Weder Kartoffel noch Getreide sind im niedersächsischen Plan genannt. | lehrplan/laender/niedersachsen.md §5 Sachunterricht Z.298–299; §4 Z.164–165 |  |
| `kornkammer` | nicht | Weder Kartoffel noch Getreide sind im niedersächsischen Plan genannt. | lehrplan/laender/niedersachsen.md §5 Sachunterricht Z.298–299; §4 Z.164–165 |  |
| `wiese` | offen | Die Wiese ist im Plan nur ein Beispiel für einen Lebensraum, bis Ende Klasse 2. | lehrplan/laender/niedersachsen.md §4 Sachunterricht Z.148–152 („Ende 2“); §5 Z.291 führt wiese unter „Passt“ | aus „hier meist früher“: Wiese steht nur als Beispiel in Klammern („etc.“); §5 und §4 widersprechen sich |
| `wetterstation` | passt | Wetterkarte und Bauernregeln stehen hier nicht im Plan. | lehrplan/laender/niedersachsen.md §5 Sachunterricht Z.291–292, 300; §4 Z.158–160 |  |
| `kompass` | passt | Karten und Kompass stehen hier bis Ende Klasse 4 im Plan; Niedersachsen selbst ist dort kein eigenes Thema. | lehrplan/laender/niedersachsen.md §5 Sachunterricht Z.293; §4 Z.160–161; §4 Z.164–165 |  |
| `verkehr` | offen | Verkehrszeichen und Fahrrad stehen hier nicht im Sachunterricht, sondern in den Vorgaben zu Mobilität und Sport. | lehrplan/laender/niedersachsen.md §5 Sachunterricht Z.301–302 [sek]; §4 Z.166–167 [sek] |  |
| `frueher` | passt |  | lehrplan/laender/niedersachsen.md §5 Sachunterricht Z.293; §4 Z.162–163 |  |
| `sinne` | frueher | Die Sinne und ihr Schutz stehen hier bis Ende Klasse 2; Sucht ist Thema bis Ende Klasse 4. | lehrplan/laender/niedersachsen.md §5 Sachunterricht Z.293, 296–297; §4 Z.149–150, 157 |  |
| `musik` | passt | Noten, Takt und Notennamen sind hier in Klasse 3/4 nur eine Kann-Bestimmung. | lehrplan/laender/niedersachsen.md §5 Musik Z.338–344; §4 Z.194–200 |  |
| `teestube` | passt | Lesen spielt hier eine untergeordnete Rolle; das Schriftbild kommt erst nach dem Sprechen. | lehrplan/laender/niedersachsen.md §5 Englisch Z.356–357, 362; §4 Z.210–215 |  |
| `doppeldecker` | offen | Ganze englische Sätze still zu lesen geht über das hinaus, was der Plan für das erste Lernjahr nahelegt. | lehrplan/laender/niedersachsen.md §5 Englisch Z.360–361 (nur unter „Zu früh“; Plan beschreibt nur Ende Klasse 4) |  |
| `ichdu1` | passt | Gefühle, Regeln, Streit und Familienformen stehen hier im Sachunterricht bis Ende Klasse 2. | lehrplan/laender/niedersachsen.md §4 Sachunterricht Z.153; §5 Werte und Normen Z.317; Vorbehalt §7 Z.393–395 |  |
| `feste2` | offen | Verglichen wurden die Vorgaben von 2022; den neuen Plan für Werte und Normen von 2026 haben wir noch nicht gelesen. | lehrplan/laender/niedersachsen.md §5 Werte und Normen Z.319, 326–327; §7 Z.393–395 (geltendes Kerncurriculum 2026 nicht gelesen) |  |
| `instrumente2` | passt | Der Plan trennt Streich- und Zupfinstrumente, statt von Saiteninstrumenten zu sprechen. | lehrplan/laender/niedersachsen.md §5 Musik Z.339–340, 345; §4 Z.194–196 |  |
| `musik1` | passt |  | lehrplan/laender/niedersachsen.md §5 Musik Z.339–340; §4 Z.194–199 |  |
| `laute1` | passt | In Niedersachsen zeigt Lernquest die Wörter Vokal und Konsonant, wie sie im Lehrplan stehen. | lehrplan/laender/niedersachsen.md §5 Deutsch Z.262, 270; §3 Z.63 |  |
| `schreiben2` | passt | Doppelte Mitlaute und das Dehnungs-h stehen hier erst bis Ende Klasse 4. | lehrplan/laender/niedersachsen.md §5 Deutsch Z.262–263, 271–272; §4 Z.124–127 |  |
| `woerter2` | passt |  | lehrplan/laender/niedersachsen.md §5 Deutsch Z.263; §4 Z.133–139 |  |
| `zahlen20` | passt |  | lehrplan/laender/niedersachsen.md §5 Mathematik Z.225; §4 Z.74–76 |  |
| `formen1` | passt | Den Quader nennt der Plan erst bis Ende Klasse 4; in Klasse 1/2 stehen Würfel, Kugel und Zylinder. | lehrplan/laender/niedersachsen.md §5 Mathematik Z.228, 245–246; §4 Z.104–106 |  |
| `zahlen100` | passt |  | lehrplan/laender/niedersachsen.md §5 Mathematik Z.225; §4 Z.74–76 |  |
| `malteilen` | passt |  | lehrplan/laender/niedersachsen.md §5 Mathematik Z.226–227; §4 Z.77–78 |  |
| `groessen2` | passt | Kommabeträge nennt der Plan nicht; Millimeter und Säulendiagramme folgen bis Ende Klasse 4. | lehrplan/laender/niedersachsen.md §5 Mathematik Z.228–229, 241–244; §4 Z.94–97, 114–116 |  |
| `formen2` | spaeter | Rechter Winkel, parallel, senkrecht, Kanten und Flächen stehen hier erst bis Ende Klasse 4. | lehrplan/laender/niedersachsen.md §5 Mathematik Z.228, 245–247; §4 Z.104–111 |  |
| `koerper1` | passt |  | lehrplan/laender/niedersachsen.md §5 Sachunterricht Z.289; §4 Z.149–150, 153 |  |
| `jahr1` | passt |  | lehrplan/laender/niedersachsen.md §5 Sachunterricht Z.289; §4 Z.152–155 |  |
| `baeume2` | passt |  | lehrplan/laender/niedersachsen.md §5 Sachunterricht Z.289; §4 Z.150–151, 154–155 |  |
| `tiere2` | passt |  | lehrplan/laender/niedersachsen.md §5 Sachunterricht Z.289; §4 Z.150–152 |  |
| `natur2` | passt |  | lehrplan/laender/niedersachsen.md §5 Sachunterricht Z.290; §4 Z.152 |  |
| `wald` | offen | Der Wald ist im Plan nur ein Beispiel für einen Lebensraum, bis Ende Klasse 2. | lehrplan/laender/niedersachsen.md §4 Sachunterricht Z.151 („Ende 2“, Beispiel in Klammern) | Wald nur als Beispiel in Klammern („etc.“) |
| `strom` | offen | Strom mit Licht, Wärme und Gefahren steht hier im Plan bis Ende Klasse 4; Magnete nennt er nicht. | lehrplan/laender/niedersachsen.md §4 Sachunterricht Z.156 (Ende 4: Elektrizität in Licht und Wärme, Gefahren), Z.164 (Magnete nicht genannt) | gestützt sind energie und sicher, der Stromkreis nur mittelbar; weniger als die Hälfte sicher |
| `religionen` | offen | Verglichen wurden die Vorgaben von 2022; den neuen Plan für Werte und Normen von 2026 haben wir noch nicht gelesen. | lehrplan/laender/niedersachsen.md §4 Werte und Normen Z.182–185; §7 Z.393–395 (geltendes Kerncurriculum 2026 nicht gelesen) | wie feste2: das geltende Kerncurriculum 2026 ist nicht gelesen |

## Nordrhein-Westfalen (NW)

| Thema | Urteil | Hinweis für Eltern | Quelle | Herabgestuft, weil |
|---|---|---|---|---|
| `math` | passt | Punkt vor Strich, Teilbarkeitsregeln und Drittel stehen hier nicht im Plan. | lehrplan/laender/nordrhein-westfalen.md §5 Mathematik Z.221–222, 236–238; §4 Z.84–95 |  |
| `bau` | passt | Den Kegel sowie Verschieben und Drehen nennt der Plan nicht. | lehrplan/laender/nordrhein-westfalen.md §5 Mathematik Z.222–223, 239–240; §4 Z.101–104 |  |
| `jahrmarkt` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Mathematik Z.223; §4 Z.109–114 |  |
| `woerterwerkstatt` | passt | Komma vor „aber“ und „denn“ und das Trennen am Zeilenende nennt der Plan nicht ausdrücklich. | lehrplan/laender/nordrhein-westfalen.md §5 Deutsch Z.253, 260–261; §4 Z.122–136 |  |
| `satzbaustelle` | passt | Die Zeitstufen heißen hier Gegenwart und Vergangenheit statt Präsens und Präteritum. | lehrplan/laender/nordrhein-westfalen.md §5 Deutsch Z.254, 259–261; §4 Z.132–137 |  |
| `ethik` | nicht | Martin Luther steht hier in der Evangelischen Religionslehre, nicht in der Praktischen Philosophie. | lehrplan/laender/nordrhein-westfalen.md §4 Praktische Philosophie und Religion Z.180–181; §5 Z.301 |  |
| `kirchenjahr` | nicht | Das Kirchenjahr steht hier in der Evangelischen Religionslehre, nicht in der Praktischen Philosophie. | lehrplan/laender/nordrhein-westfalen.md §4 Praktische Philosophie und Religion Z.180–181; §5 Z.301 |  |
| `freunde` | passt | Verglichen mit dem Lehrplan Praktische Philosophie; nicht jede Grundschule bietet das Fach an. | lehrplan/laender/nordrhein-westfalen.md §5 Ethik / Praktische Philosophie Z.296–297; §4 Z.166–170 [sek], 173–179 |  |
| `ichwelt` | offen | Verglichen mit dem Lehrplan Praktische Philosophie; nur ein Teil des Themas hat dort eine Entsprechung. | lehrplan/laender/nordrhein-westfalen.md §5 Ethik / Praktische Philosophie Z.296–298; §4 Z.166–170 [sek], 171–179 | aus „passt“: nur eine Aufgabenart „nahe an“ einem Planinhalt |
| `kartoffel` | nicht | Weder Kartoffel noch Getreide sind im nordrhein-westfälischen Plan genannt. | lehrplan/laender/nordrhein-westfalen.md §5 Sachunterricht Z.281–282; §4 Z.158–159 |  |
| `kornkammer` | nicht | Weder Kartoffel noch Getreide sind im nordrhein-westfälischen Plan genannt. | lehrplan/laender/nordrhein-westfalen.md §5 Sachunterricht Z.281–282; §4 Z.158–159 |  |
| `wiese` | nicht | Die Wiese ist im Plan nicht genannt; das Beispiel für einen Lebensraum ist dort der Wald. | lehrplan/laender/nordrhein-westfalen.md §5 Sachunterricht Z.276, 285; §4 Z.158–159 |  |
| `wetterstation` | nicht | Wetter, Wasserkreislauf und die Zustände des Wassers stehen nicht im nordrhein-westfälischen Plan. | lehrplan/laender/nordrhein-westfalen.md §5 Sachunterricht Z.283–284; §4 Z.158–159 |  |
| `kompass` | passt | Karten, Kompass und Nordrhein-Westfalen stehen hier im Plan bis Ende Klasse 4. | lehrplan/laender/nordrhein-westfalen.md §5 Sachunterricht Z.275; §4 Z.155–156 |  |
| `verkehr` | passt | Verkehrsregeln und Verkehrszeichen stehen hier schon bis Ende Klasse 2, die Fahrradausbildung bis Ende Klasse 4. | lehrplan/laender/nordrhein-westfalen.md §5 Sachunterricht Z.275; §4 Z.149–150, 156–157 |  |
| `frueher` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Sachunterricht Z.276; §4 Z.150–153 |  |
| `sinne` | frueher | Die Sinne stehen hier bis Ende Klasse 2; der Bau von Auge und Ohr ist nicht verlangt, Drogen sind Thema bis Ende Klasse 4. | lehrplan/laender/nordrhein-westfalen.md §5 Sachunterricht Z.276, 279–280; §4 Z.146, 153 |  |
| `musik` | passt | Takt und Notennamen sind hier nicht verlangt; Streich- und Zupfinstrumente zählen zusammen als Saiteninstrumente. | lehrplan/laender/nordrhein-westfalen.md §5 Musik Z.318, 321–323; §4 Z.188–195 |  |
| `teestube` | offen | Der Plan nennt Themen nur als Beispiele und keinen Wortschatz, nur den Stand am Ende von Klasse 4. | lehrplan/laender/nordrhein-westfalen.md §5 Englisch Z.332–333; §4 Z.199–205 (Beginn Klasse 3 nur [sek]) | aus „passt“: Beginn in Klasse 3 nur [sek]; kein Themenkatalog |
| `doppeldecker` | offen | Der Plan nennt Themen nur als Beispiele und keinen Wortschatz, nur den Stand am Ende von Klasse 4. | lehrplan/laender/nordrhein-westfalen.md §5 Englisch Z.332–333; §4 Z.199–205 (Beginn Klasse 3 nur [sek]) | aus „passt“: Beginn in Klasse 3 nur [sek]; kein Themenkatalog |
| `ichdu1` | passt | Verglichen mit dem Lehrplan Praktische Philosophie; nicht jede Grundschule bietet das Fach an. | lehrplan/laender/nordrhein-westfalen.md §5 Ethik / Praktische Philosophie Z.296–297; §4 Z.166–170 [sek], 173–176 |  |
| `feste2` | offen | Die Praktische Philosophie verlangt Feste unterschiedlicher Religionen und Kulturen, nicht nur christliche. | lehrplan/laender/nordrhein-westfalen.md §5 Ethik / Praktische Philosophie Z.298, 304–305; §4 Z.173–176 | aus „passt“: drei von fünf Aufgabenarten stehen in §5 unter „nicht im Plan“ |
| `instrumente2` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Musik Z.315–317; §4 Z.188–191 |  |
| `musik1` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Musik Z.316–317; §4 Z.190–191 |  |
| `laute1` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Deutsch Z.252; §4 Z.132 |  |
| `schreiben2` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Deutsch Z.252; §4 Z.122–128 |  |
| `woerter2` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Deutsch Z.252; §4 Z.129–136 |  |
| `zahlen20` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Mathematik Z.217; §4 Z.75–79 |  |
| `formen1` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Mathematik Z.219; §4 Z.98–100 |  |
| `zahlen100` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Mathematik Z.217; §4 Z.75–83 |  |
| `malteilen` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Mathematik Z.218; §4 Z.78–79 |  |
| `groessen2` | passt | Kommabeträge und Millimeter stehen hier erst bis Ende Klasse 4; Dezimeter kommt nicht vor. | lehrplan/laender/nordrhein-westfalen.md §5 Mathematik Z.220, 226–228; §4 Z.107–110 |  |
| `formen2` | passt | Rechter Winkel, parallel und senkrecht stehen hier erst bis Ende Klasse 4; Gerade, Strecke und Strahl nennt der Plan nicht. | lehrplan/laender/nordrhein-westfalen.md §5 Mathematik Z.219, 229–230; §4 Z.98–102 |  |
| `koerper1` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Sachunterricht Z.274; §4 Z.144–146 |  |
| `jahr1` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Sachunterricht Z.274; §4 Z.149–151 |  |
| `baeume2` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Sachunterricht Z.274; §4 Z.146–147 |  |
| `tiere2` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Sachunterricht Z.274; §4 Z.146–147 |  |
| `natur2` | passt |  | lehrplan/laender/nordrhein-westfalen.md §5 Sachunterricht Z.274; §4 Z.148–149 |  |
| `wald` | offen | Der Wald steht hier bis Ende Klasse 4 als Beispiel dafür, wie Tiere und Pflanzen an ihren Lebensraum angepasst sind. | lehrplan/laender/nordrhein-westfalen.md §4 Sachunterricht Z.154 (Ende 4: Angepasstheit „(u. a. Wald)“) | ruht auf einer Zeile zur Angepasstheit; weniger als die Hälfte der Aufgabenarten gestützt |
| `strom` | offen | Magnetismus steht hier schon bis Ende Klasse 2, einfache Stromkreise und Energieträger bis Ende Klasse 4. | lehrplan/laender/nordrhein-westfalen.md §4 Sachunterricht Z.148 (Ende 2: Magnetismus), Z.154–155 (Ende 4: einfache Stromkreise, Energieträger) | gemischt: zwei Aufgabenarten bis Ende 2, zwei bis Ende 4, zwei nicht genannt |
| `religionen` | offen | Feste und Merkmale der Religionen stehen in Praktischer Philosophie bis Ende Klasse 2; nicht jede Schule bietet das Fach an. | lehrplan/laender/nordrhein-westfalen.md §4 Praktische Philosophie Z.166–168 [sek], 174–176 (Ende 2), Z.179 (Ende 4: Judentum, Christentum, Islam) | Ende 2 nennt Feste und Merkmale, Ende 4 nennt die Religionen erneut; Fach an Grundschulen noch nicht eingeführt |

## Rheinland-Pfalz (RP)

| Thema | Urteil | Hinweis für Eltern | Quelle | Herabgestuft, weil |
|---|---|---|---|---|
| `math` | passt | Punkt vor Strich, Teilbarkeitsregeln und Drittel nennt der Plan nicht; wie schriftlich abgezogen wird, wählt die Schule. | lehrplan/laender/rheinland-pfalz.md §5 Mathematik Z.187–190, 195, 203–204; §4 Z.82–87; §3 Z.65 |  |
| `bau` | passt |  | lehrplan/laender/rheinland-pfalz.md §5 Mathematik Z.193–194; §4 Z.96–99 |  |
| `jahrmarkt` | passt |  | lehrplan/laender/rheinland-pfalz.md §5 Mathematik Z.193–194; §4 Z.91–92, 100–101 |  |
| `woerterwerkstatt` | offen | Der Plan für Deutsch nennt keine Klassenstufen, nur den Stand am Ende von Klasse 4. | lehrplan/laender/rheinland-pfalz.md §5 Deutsch Z.217–220, 226–227; §2 Z.47–49 | aus „passt“: Deutsch: „keine Jahrgangsziele“ (§2) |
| `satzbaustelle` | offen | Der Plan für Deutsch nennt keine Klassenstufen, nur den Stand am Ende von Klasse 4. | lehrplan/laender/rheinland-pfalz.md §5 Deutsch Z.218–219, 224–227; §4 Z.118–124 | aus „passt“: Deutsch: „keine Jahrgangsziele“ (§2) |
| `ethik` | nicht | Martin Luther kommt im Plan für Ethik nur als ein Beispiel für Zivilcourage vor, nicht als Lebensbild. | lehrplan/laender/rheinland-pfalz.md §4 Ethik / Religion Z.154–155; §5 Ethik Z.257 |  |
| `kirchenjahr` | nicht | Kirche, Bibel und Kirchenjahr stehen so nicht im Plan für Ethik; dort geht es um Weltreligionen im Vergleich. | lehrplan/laender/rheinland-pfalz.md §4 Ethik / Religion Z.154–155; §5 Ethik Z.258 |  |
| `freunde` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Ethik Z.254; §4 Z.148–150 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `ichwelt` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Ethik Z.254; §4 Z.148–150 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `kartoffel` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Sachunterricht Z.241–242; §4 Z.133 | aus „steht hier nicht im Plan“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `kornkammer` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Sachunterricht Z.241–242; §4 Z.133 | aus „steht hier nicht im Plan“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `wiese` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Sachunterricht Z.236–238; §4 Z.129–131 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `wetterstation` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Sachunterricht Z.236–237; §4 Z.130–133 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `kompass` | offen | Karten, Kompass und Rheinland-Pfalz nennt der Plan bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Sachunterricht Z.237; §4 Z.137–138; §4 Z.137–138 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `verkehr` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Sachunterricht Z.238, 243; §4 Z.136, 142 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `frueher` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Sachunterricht Z.237–238; §4 Z.140–141 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `sinne` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Sachunterricht Z.237 (in §4 nur „eigener Körper“, Z.130) | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `musik` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Musik Z.268–274; §4 Z.161–167 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `teestube` | offen | Der Plan ist für Englisch ab Klasse 1 geschrieben; seit 2024/25 beginnt die Fremdsprache erst in Klasse 3. | lehrplan/laender/rheinland-pfalz.md §5 Englisch Z.282–283, 288; §3 Z.69; §1 Z.30–34 | aus „passt“: Plan passt nicht mehr zum Beginn in Klasse 3 (§2) |
| `doppeldecker` | offen | Der Plan ist für Englisch ab Klasse 1 geschrieben; seit 2024/25 beginnt die Fremdsprache erst in Klasse 3. | lehrplan/laender/rheinland-pfalz.md §5 Englisch Z.286–288 (nur unter „Zu früh“; Plan beschreibt nur Ende Klasse 4) |  |
| `ichdu1` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Ethik Z.254; §4 Z.148–150 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `feste2` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Ethik Z.254; §4 Z.151–153 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `instrumente2` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Musik Z.268; §4 Z.161–163 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `musik1` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Musik Z.268; §4 Z.161–167 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `laute1` | offen | Der Plan für Deutsch nennt keine Klassenstufen, nur den Stand am Ende von Klasse 4. | lehrplan/laender/rheinland-pfalz.md §5 Deutsch Z.217; §3 Z.68 | aus „passt“: Deutsch: „keine Jahrgangsziele“ (§2) |
| `schreiben2` | offen | Der Plan für Deutsch nennt keine Klassenstufen, nur den Stand am Ende von Klasse 4. | lehrplan/laender/rheinland-pfalz.md §5 Deutsch Z.217–218; §2 Z.47–49 | aus „passt“: Deutsch: „keine Jahrgangsziele“ (§2) |
| `woerter2` | offen | Der Plan für Deutsch nennt keine Klassenstufen, nur den Stand am Ende von Klasse 4. | lehrplan/laender/rheinland-pfalz.md §5 Deutsch Z.217–218; §2 Z.47–49 | aus „passt“: Deutsch: „keine Jahrgangsziele“ (§2) |
| `zahlen20` | passt |  | lehrplan/laender/rheinland-pfalz.md §5 Mathematik Z.185; §4 Z.80–81 |  |
| `formen1` | passt |  | lehrplan/laender/rheinland-pfalz.md §5 Mathematik Z.192; §4 Z.93–95 |  |
| `zahlen100` | passt |  | lehrplan/laender/rheinland-pfalz.md §5 Mathematik Z.185; §4 Z.80–81 |  |
| `malteilen` | passt |  | lehrplan/laender/rheinland-pfalz.md §5 Mathematik Z.185–186; §3 Z.61–62 |  |
| `groessen2` | passt | Millimeter und Dezimeter stehen hier erst bis Ende Klasse 4; die Uhr bis Ende Klasse 2 nur auf Viertelstunden. | lehrplan/laender/rheinland-pfalz.md §5 Mathematik Z.191–192, 200–201; §4 Z.88–92 |  |
| `formen2` | spaeter | Rechter Winkel, parallel, senkrecht, Gerade sowie Kanten und Flächen stehen hier erst bis Ende Klasse 4. | lehrplan/laender/rheinland-pfalz.md §5 Mathematik Z.192, 198–202; §4 Z.93–99 |  |
| `koerper1` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Sachunterricht Z.236; §4 Z.130–133 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `jahr1` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Sachunterricht Z.236; §4 Z.130, 140 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `baeume2` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Sachunterricht Z.236; §4 Z.130–133 (keine Art vorgeschrieben) | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `tiere2` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Sachunterricht Z.236; §4 Z.133 (keine Art vorgeschrieben) | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `natur2` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §5 Sachunterricht Z.236; §4 Z.130–132, 138 | aus „passt“: Sachunterricht, Ethik, Musik: nur Ende Klasse 4, Themen als Beispiele (§2) |
| `wald` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §4 Sachunterricht Z.130–132; §2 Z.50 | Sachunterricht nur Ende Klasse 4, Themen als Beispiele (§2) |
| `strom` | offen | Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §4 Sachunterricht Z.130–132; §2 Z.50 | Sachunterricht nur Ende Klasse 4, Themen als Beispiele (§2) |
| `religionen` | offen | Feste und Merkmale der Weltreligionen stehen im Plan für Ethik bis Ende Klasse 4; die Klasse legt die Schule fest. | lehrplan/laender/rheinland-pfalz.md §4 Ethik / Religion Z.151–153; §2 Z.50 | Ethik nur Ende Klasse 4 (§2) |

## Sachsen-Anhalt (ST)

| Thema | Urteil | Hinweis für Eltern | Quelle | Herabgestuft, weil |
|---|---|---|---|---|
| `math` | passt | Ein Drittel ist hier nicht vorgesehen, nur Viertel, Hälfte und drei Viertel bei Größen. | lehrplan/laender/sachsen-anhalt.md §5 Mathematik Z.213–215, 221; §4 Z.89–98 |  |
| `bau` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Mathematik Z.214–215; §4 Z.93–96 |  |
| `jahrmarkt` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Mathematik Z.215; §4 Z.97–99 |  |
| `woerterwerkstatt` | passt | Doppelte Mitlaute, Dehnungs-h und doppelte Selbstlaute nennt der Plan nicht als einzelne Themen. | lehrplan/laender/sachsen-anhalt.md §5 Deutsch Z.239, 249–250; §4 Z.116–125 |  |
| `satzbaustelle` | passt | Statt Prädikat sagt der Plan hier Satzkern. | lehrplan/laender/sachsen-anhalt.md §5 Deutsch Z.240–241, 246; §4 Z.120–124 |  |
| `ethik` | nicht | Martin Luther und die Reformation werden im Ethikplan nicht genannt. | lehrplan/laender/sachsen-anhalt.md §4 Ethik und Religion Z.174–175; §5 Ethik Z.290–291 |  |
| `kirchenjahr` | nicht | Das Kirchenjahr wird im Ethikplan nicht genannt. | lehrplan/laender/sachsen-anhalt.md §4 Ethik und Religion Z.174–175; §5 Ethik Z.290–291 |  |
| `freunde` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Ethik Z.286; §4 Z.168, 171 |  |
| `ichwelt` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Ethik Z.286; §4 Z.166–173 |  |
| `kartoffel` | passt | Getreidearten und Kartoffel mit Anbau und Verwendung stehen hier ausdrücklich im Plan für Klasse 3/4. | lehrplan/laender/sachsen-anhalt.md §5 Sachunterricht Z.264, 274; §4 Z.142 |  |
| `kornkammer` | passt | Getreidearten und Kartoffel mit Anbau und Verwendung stehen hier ausdrücklich im Plan für Klasse 3/4. | lehrplan/laender/sachsen-anhalt.md §5 Sachunterricht Z.264; §4 Z.142 |  |
| `wiese` | nicht | Die Wiese wird nicht namentlich verlangt; die Schule wählt einen Lebensraum, genannt ist nur der Wald. | lehrplan/laender/sachsen-anhalt.md §5 Sachunterricht Z.272; §4 Z.157–158 |  |
| `wetterstation` | offen | Wettererscheinungen und die Zustandsformen von Wasser stehen hier schon in Klasse 1/2. | lehrplan/laender/sachsen-anhalt.md §4 Sachunterricht Z.136–137; §5 Z.265–266, 271, 274 | aus „hier meist früher“: §5 führt die Wasser- und Wetterteile unter „Passt“, §4 legt beides in 1/2 |
| `kompass` | passt | Das Bundesland mit Magdeburg, den Nachbarländern und dem Harz steht hier im Plan der Klassen 3/4. | lehrplan/laender/sachsen-anhalt.md §5 Sachunterricht Z.265; §4 Z.146–147; §4 Z.145–146 |  |
| `verkehr` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Sachunterricht Z.265; §4 Z.148–149 |  |
| `frueher` | passt | Kindheit früher und heute steht hier schon in Klasse 1/2; Erfindungen und Medien in Klasse 3/4. | lehrplan/laender/sachsen-anhalt.md §5 Sachunterricht Z.265; §4 Z.139, 152–155 |  |
| `sinne` | frueher | Sinnesorgane und ihr Schutz gehören hier in Klasse 1/2; Rauchen, Alkohol und Medikamente sind nicht genannt. | lehrplan/laender/sachsen-anhalt.md §5 Sachunterricht Z.269–270; §4 Z.134–135 |  |
| `musik` | passt | Piano, forte und crescendo stehen nicht im Plan; Viertel-, halbe und Achtelnoten schon in Klasse 1/2. | lehrplan/laender/sachsen-anhalt.md §5 Musik Z.299–303; §4 Z.183–190 |  |
| `teestube` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Englisch Z.310–311; §4 Z.194–201 |  |
| `doppeldecker` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Englisch Z.310–311; §4 Z.194–201 |  |
| `ichdu1` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Ethik Z.286; §4 Z.168 |  |
| `feste2` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Ethik Z.286–287; §4 Z.169–170 |  |
| `instrumente2` | passt | Instrumentengruppen und die Form A – B – A stehen hier erst in Klasse 3/4. | lehrplan/laender/sachsen-anhalt.md §5 Musik Z.299; §4 Z.183–187 |  |
| `musik1` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Musik Z.299; §4 Z.183–184 |  |
| `laute1` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Deutsch Z.237; §4 Z.110 |  |
| `schreiben2` | passt | Für Klasse 1/2 nennt der Plan nur Satzanfänge und Eigennamen groß; doppelte Mitlaute sind kein eigenes Thema. | lehrplan/laender/sachsen-anhalt.md §5 Deutsch Z.237, 247–250; §4 Z.107–109 |  |
| `woerter2` | passt | Das Adjektiv und Wortfamilien stehen hier erst in Klasse 3/4. | lehrplan/laender/sachsen-anhalt.md §5 Deutsch Z.238, 247; §4 Z.110–113, 120–122 |  |
| `zahlen20` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Mathematik Z.208; §4 Z.75–78 |  |
| `formen1` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Mathematik Z.208; §4 Z.79–80 |  |
| `zahlen100` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Mathematik Z.208; §4 Z.75–78 |  |
| `malteilen` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Mathematik Z.209–210; §3 Z.55 |  |
| `groessen2` | passt | Der Dezimeter steht hier erst in Klasse 3/4. | lehrplan/laender/sachsen-anhalt.md §5 Mathematik Z.211, 220; §4 Z.82–86 |  |
| `formen2` | passt | Rechter Winkel, parallel, senkrecht, Gerade und Strecke stehen hier erst in Klasse 3/4. | lehrplan/laender/sachsen-anhalt.md §5 Mathematik Z.212, 218–219; §4 Z.79–81 |  |
| `koerper1` | passt | Erste Hilfe und Notruf stehen hier erst in Klasse 3/4. | lehrplan/laender/sachsen-anhalt.md §5 Sachunterricht Z.262; §4 Z.134–135, 144 |  |
| `jahr1` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Sachunterricht Z.262; §4 Z.133–139 |  |
| `baeume2` | passt |  | lehrplan/laender/sachsen-anhalt.md §5 Sachunterricht Z.262; §4 Z.133–134 |  |
| `tiere2` | offen | Nutz- und Heimtiere stehen hier in Klasse 3/4; Vögel werden nicht namentlich verlangt. | lehrplan/laender/sachsen-anhalt.md §4 Sachunterricht Z.142–143, 157–158; §5 Z.272 (unter „Passt“ nicht aufgeführt) | aus „hier meist später“: in §5 nicht geführt; nur zwei von fünf Aufgabenarten gestützt |
| `natur2` | passt | Licht und Schatten, Schall und Warnzeichen kommen im Plan nicht ausdrücklich vor. | lehrplan/laender/sachsen-anhalt.md §5 Sachunterricht Z.262–263, 273; §4 Z.136–138 |  |
| `wald` | passt | Der Wald als Natur-, Lebens- und Wirtschaftsraum steht hier im Plan der Klassen 3/4. | lehrplan/laender/sachsen-anhalt.md §4 Sachunterricht Z.141–143 (3/4: Nahrungskette; Wald als Natur-, Lebens- und Wirtschaftsraum: stock, baum, spur, kreislauf, nutzen) |  |
| `strom` | nicht | Magnete und Stromkreis stehen hier nicht im Plan; elektrische Energie kommt in Klasse 3/4 vor. | lehrplan/laender/sachsen-anhalt.md §4 Sachunterricht Z.150–151 (3/4: „Magnetismus und Stromkreis kommen nicht vor“; elektrische Energie) |  |
| `religionen` | passt | Zeichen, Rituale und Gegenstände aus Judentum, Christentum und Islam stehen hier in Klasse 3/4; andere Religionen nicht. | lehrplan/laender/sachsen-anhalt.md §4 Ethik und Religion Z.166, 171–172 (3/4: Symbole, Rituale, Objekte im Christentum, Judentum, Islam); Z.169 (1/2: Feste im Jahreskreis) |  |

## Schleswig-Holstein (SH)

| Thema | Urteil | Hinweis für Eltern | Quelle | Herabgestuft, weil |
|---|---|---|---|---|
| `math` | passt | Schriftliches Malnehmen, halbschriftliches Teilen, Punkt vor Strich, Klammern und Teilbarkeit stehen hier erst in Klasse 4. | lehrplan/laender/schleswig-holstein.md §5 Mathematik Z.180–181, 185–188; §4.1 Z.87–94; §4.1 Z.93 |  |
| `bau` | passt | Verschieben und Drehen nennt der Plan nicht; ob die Geometrie in Klasse 3 oder 4 liegt, legt die Schule fest. | lehrplan/laender/schleswig-holstein.md §5 Mathematik Z.193–194; §4.1 Z.96–101 |  |
| `jahrmarkt` | passt |  | lehrplan/laender/schleswig-holstein.md §5 Mathematik Z.182, 193–194; §4.1 Z.90, 96–101 |  |
| `woerterwerkstatt` | passt | Doppelte Mitlaute, Dehnungs-h und Trennen nennt der Plan nicht einzeln; beim Komma nur die Aufzählung. | lehrplan/laender/schleswig-holstein.md §5 Deutsch Z.205, 210, 213–214; §4.2 Z.106–109 |  |
| `satzbaustelle` | passt | Anrede im Brief und Wörter wie mein, dieser und kein nennt der Plan nicht einzeln. | lehrplan/laender/schleswig-holstein.md §5 Deutsch Z.205–206, 213–214; §4.2 Z.110–113 |  |
| `ethik` | nicht | Martin Luther steht hier im Plan für Religion, nicht im Fach Philosophie. | lehrplan/laender/schleswig-holstein.md §4.4 Z.150–152; §5 Ethik (Philosophie) / Religion Z.247–248 |  |
| `kirchenjahr` | nicht | Die christlichen Feste stehen hier im Plan für Religion, nicht im Fach Philosophie. | lehrplan/laender/schleswig-holstein.md §4.4 Z.150–152; §5 Ethik (Philosophie) / Religion Z.247–248 |  |
| `freunde` | offen | Im Fach Philosophie ist das ein Wahlthema; die Schule legt fest, ob es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Ethik (Philosophie) / Religion Z.242; §4.4 Z.142–147 | aus „passt“: Philosophie: Themenlisten, aus denen eine Mindestzahl zu wählen ist (§2) |
| `ichwelt` | offen | Im Fach Philosophie ist das ein Wahlthema; die Schule legt fest, ob es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Ethik (Philosophie) / Religion Z.242–243; §4.4 Z.142–147 | aus „passt“: Philosophie: Themenlisten, aus denen eine Mindestzahl zu wählen ist (§2) |
| `kartoffel` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Sachunterricht Z.230; §4.3 Z.138 | aus „steht hier nicht im Plan“: Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `kornkammer` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Sachunterricht Z.222, 225; §4.3 Z.124; §2 Z.45–47 | aus „passt“: Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `wiese` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Sachunterricht Z.230; §4.3 Z.138 | aus „steht hier nicht im Plan“: Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `wetterstation` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Sachunterricht Z.222, 226, 231–232; §4.3 Z.127, 133–134 | aus „passt“: Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `kompass` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Sachunterricht Z.226, 230; §4.3 Z.135–138 | aus „passt“: Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `verkehr` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Sachunterricht Z.225; §4.3 Z.131–132 | aus „passt“: Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `frueher` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Sachunterricht Z.226; §4.3 Z.124–125, 137 | aus „passt“: Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `sinne` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Sachunterricht Z.222, 225; §4.3 Z.125; §2 Z.45–47 | aus „passt“: Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `musik` | nicht | Notenwerte, Takt, Notennamen, piano und forte sowie Komponisten nennt der Plan nicht; Instrumentengruppen stehen im Plan. | lehrplan/laender/schleswig-holstein.md §5 Musik Z.258–263; §4.5 Z.157–161 |  |
| `teestube` | passt | Lesen und Schreiben werden hier in der Grundschule nur angebahnt. | lehrplan/laender/schleswig-holstein.md §5 Englisch Z.271–275; §3 Z.69; §4.6 Z.165–170 |  |
| `doppeldecker` | passt | Lesen und Schreiben werden hier in der Grundschule nur angebahnt. | lehrplan/laender/schleswig-holstein.md §5 Englisch Z.271–275; §3 Z.69; §4.6 Z.165–170 |  |
| `ichdu1` | offen | Im Fach Philosophie ist das ein Wahlthema; die Schule legt fest, ob es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Ethik (Philosophie) / Religion Z.243, 250; §4.4 Z.143–145 | aus „passt“: Philosophie: Themenlisten, aus denen eine Mindestzahl zu wählen ist (§2) |
| `feste2` | nicht | Feste sind hier kein Thema des Fachs Philosophie; sie stehen im Plan für Religion. | lehrplan/laender/schleswig-holstein.md §5 Ethik (Philosophie) / Religion Z.244, 249; §4.4 Z.150–152 |  |
| `instrumente2` | offen | Der Musikplan gilt für alle vier Klassen zusammen und nennt keine Klassenstufe. | lehrplan/laender/schleswig-holstein.md §5 Musik Z.258; §4.5 Z.157–160 | aus „passt“: Musik: eine Tabelle für alle vier Jahre (§2) |
| `musik1` | offen | Der Musikplan gilt für alle vier Klassen zusammen und nennt keine Klassenstufe. | lehrplan/laender/schleswig-holstein.md §5 Musik Z.258; §4.5 Z.157–160 | aus „passt“: Musik: eine Tabelle für alle vier Jahre (§2) |
| `laute1` | passt |  | lehrplan/laender/schleswig-holstein.md §5 Deutsch Z.204, 207; §3 Z.68 |  |
| `schreiben2` | passt |  | lehrplan/laender/schleswig-holstein.md §5 Deutsch Z.204; §4.2 Z.106–109 |  |
| `woerter2` | passt | Genannt ist hier der Ausrufesatz, nicht der Aufforderungssatz. | lehrplan/laender/schleswig-holstein.md §5 Deutsch Z.204, 212; §4.2 Z.110–113 |  |
| `zahlen20` | passt |  | lehrplan/laender/schleswig-holstein.md §5 Mathematik Z.177; §4.1 Z.77–78 |  |
| `formen1` | passt |  | lehrplan/laender/schleswig-holstein.md §5 Mathematik Z.177; §4.1 Z.82–84 |  |
| `zahlen100` | passt |  | lehrplan/laender/schleswig-holstein.md §5 Mathematik Z.177; §4.1 Z.77–79 |  |
| `malteilen` | passt |  | lehrplan/laender/schleswig-holstein.md §5 Mathematik Z.177–178; §3 Z.58 |  |
| `groessen2` | passt | Millimeter und Dezimeter stehen hier erst in Klasse 3/4; die Uhr in Klasse 1/2 nur auf Viertelstunden. | lehrplan/laender/schleswig-holstein.md §5 Mathematik Z.179, 189–190; §3 Z.65; §7 Z.302–303 |  |
| `formen2` | passt | Rechter Winkel, parallel, senkrecht, Gerade und Strecke stehen hier erst in Klasse 3/4. | lehrplan/laender/schleswig-holstein.md §5 Mathematik Z.179, 191–192; §4.1 Z.82–85, 97–98 |  |
| `koerper1` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Sachunterricht Z.222–223; §4.3 Z.125; §2 Z.45–47 | aus „passt“: Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `jahr1` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Sachunterricht Z.222–223; §4.3 Z.124–125, 133, 135 | aus „passt“: Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `baeume2` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Sachunterricht Z.222–224; §4.3 Z.126–127; §2 Z.45–47 | aus „passt“: Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `tiere2` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Sachunterricht Z.222–223; §4.3 Z.126–127; §2 Z.45–47 | aus „passt“: Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `natur2` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §5 Sachunterricht Z.222–224; §4.3 Z.127, 133–135; §2 Z.45–47 | aus „passt“: Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `wald` | offen | Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt. | lehrplan/laender/schleswig-holstein.md §2 Z.45–47; §4.3 Z.121 | Sachunterricht: Inhalte „fakultativ gestellt“ (§2); Wald nicht genannt |
| `strom` | offen | Magnete und Stromkreis nennt der Plan nicht; erneuerbare Energien stehen dort für Klasse 3/4. | lehrplan/laender/schleswig-holstein.md §4.3 Z.134, 138; §2 Z.45–47 | Sachunterricht: Inhalte „fakultativ gestellt“ (§2) |
| `religionen` | nicht | Feste der Religionen sind hier kein Thema des Fachs Philosophie; christliche Feste stehen im Plan für Religion. | lehrplan/laender/schleswig-holstein.md §4.4 Philosophie Z.142–147 (Themenlisten ohne Feste), Z.150–152 (Feste im Plan für Religion) |  |
