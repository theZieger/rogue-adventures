/*
  Wörter und Sätze für das Fach Deutsch (Wörterwerkstatt und Satzbaustelle).
  Eltern können hier die Lernwörter der Klasse ergänzen: eine Zeile kopieren, ändern, speichern,
  dann `npm run build`. `npm test` prüft, ob jede Zeile die Felder hat, die ihre Aufgabe braucht.

  Regeln für alle Listen:
  - Nomen immer mit Artikel schreiben: 'der Hund'.
  - Texte in einfachen Anführungszeichen; ein Apostroph im Text ginge kaputt, also keinen verwenden.
  - Nur echte deutsche Wörter, keine Markennamen.

  WÖRTERWERKSTATT (Richtig schreiben)
  doppel       [richtig, falsch]                 doppelter Mitlaut, ck oder tz nach kurzem Selbstlaut
  verlaengern  [Wort, verlängert mit Silbenstrich] das Wort endet auf d/t, g/k oder b/p; gefragt wird der letzte Buchstabe
  dehnungsh    [richtig, falsch, in Silben]      silbentrennendes h
  zusammen     [Teil 1, Teil 2, zusammengesetzt] alle drei mit Artikel; der Artikel kommt vom letzten Teil
  abc          'Wort'                            für die Wörterbuch-Reihenfolge; die ersten drei Buchstaben ohne ä, ö, ü, ß
  rede         [Begleitsatz mit Doppelpunkt, Rede mit Satzzeichen]

  SATZBAUSTELLE (Sprache untersuchen)
  nomen, verben, adjektive, pronomen   Wortarten; die Nomen werden auch für „Groß oder klein“ und „Artikel“ benutzt
  zeitformen   [Präsens, Präteritum, falsche Form, die Kinder oft schreiben]
  steigerung   [Grundstufe, Mehrstufe, Meiststufe]
  vergleiche   [Satz mit ___ als Lücke, 'als' oder 'wie']
  saetze       'Teil | Teil | Teil': Satzglieder durch | getrennt, so geschrieben, wie sie mitten im Satz stehen
               (klein, außer Nomen und Namen). Das Subjekt steht in [eckigen Klammern], das Prädikat ist immer
               der zweite Teil. Sätze mit drei Teilen beginnen mit dem Subjekt und enden mit einer Orts- oder
               Zeitangabe – aus ihnen kommt auch die Umstellprobe.
  oberbegriffe { Oberbegriff: [mindestens drei Wörter] } – jedes Wort darf nur zu einem Oberbegriff passen
  teekessel    [Wort mit Artikel, Bedeutung 1, Bedeutung 2]
*/
const MW = {
  doppel: [
    ['die Sonne', 'die Sone'], ['die Mutter', 'die Muter'], ['der Teller', 'der Teler'], ['der Kamm', 'der Kam'],
    ['der Himmel', 'der Himel'], ['das Wasser', 'das Waser'], ['der Koffer', 'der Kofer'], ['die Puppe', 'die Pupe'],
    ['die Tasse', 'die Tase'], ['die Brille', 'die Brile'], ['schwimmen', 'schwimen'], ['rennen', 'renen'],
    ['das Bett', 'das Bet'], ['die Klasse', 'die Klase'], ['der Schlitten', 'der Schliten'], ['die Nuss', 'die Nus'],
    ['der Zucker', 'der Zukker'], ['die Decke', 'die Deke'], ['die Glocke', 'die Gloke'], ['die Jacke', 'die Jakke'],
    ['der Rücken', 'der Rüken'], ['backen', 'baken'], ['dick', 'dik'], ['der Stock', 'der Stok'],
    ['die Katze', 'die Kazze'], ['die Mütze', 'die Müze'], ['der Platz', 'der Plaz'], ['die Pfütze', 'die Pfüze'],
    ['sitzen', 'sizen'], ['der Blitz', 'der Bliz'], ['putzen', 'puzzen'], ['der Schatz', 'der Schaz'],
    ['das Netz', 'das Nez'], ['die Hitze', 'die Hize'],
  ],
  verlaengern: [
    ['der Hund', 'die Hun-de'], ['der Wald', 'die Wäl-der'], ['das Kind', 'die Kin-der'], ['das Bild', 'die Bil-der'],
    ['das Pferd', 'die Pfer-de'], ['das Rad', 'die Rä-der'], ['der Mund', 'die Mün-der'], ['der Freund', 'die Freun-de'],
    ['das Hemd', 'die Hem-den'], ['der Hut', 'die Hü-te'], ['das Brot', 'die Bro-te'], ['das Zelt', 'die Zel-te'],
    ['das Boot', 'die Boo-te'], ['das Wort', 'die Wör-ter'], ['bunt', 'die bun-ten Stifte'], ['kalt', 'der kal-te Wind'],
    ['der Berg', 'die Ber-ge'], ['der Zug', 'die Zü-ge'], ['der Weg', 'die We-ge'], ['der Tag', 'die Ta-ge'],
    ['der Zwerg', 'die Zwer-ge'], ['klug', 'die klu-ge Eule'], ['der Schrank', 'die Schrän-ke'], ['das Geschenk', 'die Ge-schen-ke'],
    ['krank', 'das kran-ke Kind'], ['stark', 'der star-ke Wind'], ['der Korb', 'die Kör-be'], ['der Dieb', 'die Die-be'],
    ['gelb', 'der gel-be Ball'], ['lieb', 'der lie-be Hund'], ['das Kalb', 'die Käl-ber'], ['das Werk', 'die Wer-ke'],
  ],
  dehnungsh: [
    ['gehen', 'geen', 'ge-hen'], ['sehen', 'seen', 'se-hen'], ['stehen', 'steen', 'ste-hen'], ['drehen', 'dreen', 'dre-hen'],
    ['nähen', 'näen', 'nä-hen'], ['ruhen', 'ruen', 'ru-hen'], ['ziehen', 'zieen', 'zie-hen'], ['blühen', 'blüen', 'blü-hen'],
    ['die Kühe', 'die Küe', 'die Kü-he'], ['die Ruhe', 'die Rue', 'die Ru-he'], ['die Mühe', 'die Müe', 'die Mü-he'],
    ['die Reihe', 'die Reie', 'die Rei-he'], ['die Höhe', 'die Höe', 'die Hö-he'], ['früher', 'früer', 'frü-her'],
    ['der Schuh', 'der Schu', 'die Schu-he'], ['die Kuh', 'die Ku', 'die Kü-he'], ['das Reh', 'das Re', 'die Re-he'],
    ['der Floh', 'der Flo', 'die Flö-he'], ['froh', 'fro', 'die fro-hen Kinder'], ['früh', 'frü', 'frü-her'], ['der Zeh', 'der Ze', 'die Ze-hen'],
  ],
  zusammen: [
    ['die Schule', 'der Hof', 'der Schulhof'], ['das Haus', 'die Tür', 'die Haustür'], ['der Apfel', 'der Baum', 'der Apfelbaum'],
    ['die Hand', 'der Schuh', 'der Handschuh'], ['der Schnee', 'der Mann', 'der Schneemann'], ['das Fenster', 'die Bank', 'die Fensterbank'],
    ['der Sand', 'die Burg', 'die Sandburg'], ['der Garten', 'das Tor', 'das Gartentor'], ['die Blume', 'der Topf', 'der Blumentopf'],
    ['das Wasser', 'die Flasche', 'die Wasserflasche'], ['die Sonne', 'der Schirm', 'der Sonnenschirm'], ['das Heft', 'der Umschlag', 'der Heftumschlag'],
    ['die Tafel', 'der Schwamm', 'der Tafelschwamm'], ['der Ball', 'das Spiel', 'das Ballspiel'], ['die Tasche', 'die Lampe', 'die Taschenlampe'],
    ['das Zimmer', 'die Pflanze', 'die Zimmerpflanze'], ['der Regen', 'der Bogen', 'der Regenbogen'], ['die Nacht', 'das Hemd', 'das Nachthemd'],
  ],
  abc: [
    'Ameise', 'Apfel', 'Affe', 'Anker', 'Ast', 'Baum', 'Ball', 'Banane', 'Bach', 'Berg', 'Birne', 'Blatt', 'Brot', 'Brief',
    'Dach', 'Dose', 'Dorf', 'Ente', 'Eimer', 'Esel', 'Fisch', 'Fenster', 'Fuchs', 'Gabel', 'Garten', 'Gans', 'Glas',
    'Hase', 'Haus', 'Hund', 'Heft', 'Igel', 'Insel', 'Kamm', 'Katze', 'Kerze', 'Kind', 'Kiste', 'Korb', 'Lampe', 'Laub',
    'Leiter', 'Maus', 'Mond', 'Nase', 'Nest', 'Ofen', 'Pinsel', 'Rabe', 'Rose', 'Sand', 'Sonne', 'Tisch', 'Turm', 'Uhr',
    'Vogel', 'Wolke', 'Zelt', 'Zug',
  ],
  rede: [
    ['Mia sagt:', 'Ich komme mit.'], ['Der Lehrer fragt:', 'Wer hat das Heft gefunden?'], ['Tom ruft:', 'Der Bus kommt!'],
    ['Oma fragt:', 'Hast du Hunger?'], ['Lena flüstert:', 'Ich weiß die Antwort.'], ['Papa sagt:', 'Wir gehen in den Park.'],
    ['Die Lehrerin bittet:', 'Schreibt das Datum auf.'], ['Ben antwortet:', 'Das Wort heißt Lineal.'], ['Ida ruft:', 'Schau mal, ein Regenbogen!'],
    ['Mama fragt:', 'Wo ist dein Turnbeutel?'], ['Der Hausmeister sagt:', 'Die Tür bleibt heute zu.'], ['Emil fragt:', 'Darf ich mitspielen?'],
    ['Opa erzählt:', 'Früher bin ich zu Fuß zur Schule gegangen.'], ['Frau Weber sagt:', 'Heute lesen wir eine Geschichte.'],
    ['Noah ruft:', 'Ich habe gewonnen!'], ['Jule fragt:', 'Leihst du mir deinen Radiergummi?'],
  ],

  nomen: [
    'der Hund', 'die Katze', 'das Buch', 'der Bleistift', 'die Schule', 'der Baum', 'die Blume', 'das Fenster', 'der Tisch',
    'die Tasche', 'das Lineal', 'der Radiergummi', 'die Lehrerin', 'der Garten', 'die Straße', 'das Fahrrad', 'der Apfel',
    'die Wolke', 'das Brot', 'der Vogel', 'die Brücke', 'das Zimmer', 'der Schnee', 'die Uhr', 'das Pferd', 'die Ameise', 'der Turm',
  ],
  verben: [
    'laufen', 'schreiben', 'lesen', 'malen', 'singen', 'springen', 'schwimmen', 'rechnen', 'spielen', 'lachen',
    'basteln', 'turnen', 'kochen', 'träumen', 'flüstern', 'bauen', 'tanzen', 'klettern', 'fragen', 'schlafen',
  ],
  adjektive: [
    'groß', 'klein', 'schnell', 'langsam', 'bunt', 'leise', 'warm', 'kalt', 'fröhlich', 'traurig',
    'mutig', 'hell', 'dunkel', 'weich', 'hart', 'süß', 'sauer', 'spitz', 'frisch', 'müde',
  ],
  pronomen: ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr'],
  zeitformen: [
    ['er läuft', 'er lief', 'er laufte'], ['sie singt', 'sie sang', 'sie singte'], ['ich gehe', 'ich ging', 'ich gehte'],
    ['er schreibt', 'er schrieb', 'er schreibte'], ['sie liest', 'sie las', 'sie leste'], ['wir fahren', 'wir fuhren', 'wir fahrten'],
    ['du siehst', 'du sahst', 'du sehtest'], ['er kommt', 'er kam', 'er kommte'], ['sie trinkt', 'sie trank', 'sie trinkte'],
    ['ich esse', 'ich aß', 'ich esste'], ['er schläft', 'er schlief', 'er schlafte'], ['sie ruft', 'sie rief', 'sie rufte'],
    ['er findet', 'er fand', 'er findete'], ['wir springen', 'wir sprangen', 'wir springten'], ['ich schwimme', 'ich schwamm', 'ich schwimmte'],
    ['sie gibt', 'sie gab', 'sie gebte'], ['er nimmt', 'er nahm', 'er nehmte'], ['ich sitze', 'ich saß', 'ich sitzte'],
    ['er hilft', 'er half', 'er helfte'], ['sie bringt', 'sie brachte', 'sie bringte'], ['ich denke', 'ich dachte', 'ich denkte'],
    ['er fliegt', 'er flog', 'er fliegte'],
  ],
  steigerung: [
    ['groß', 'größer', 'am größten'], ['klein', 'kleiner', 'am kleinsten'], ['schnell', 'schneller', 'am schnellsten'],
    ['langsam', 'langsamer', 'am langsamsten'], ['alt', 'älter', 'am ältesten'], ['jung', 'jünger', 'am jüngsten'],
    ['warm', 'wärmer', 'am wärmsten'], ['kalt', 'kälter', 'am kältesten'], ['lang', 'länger', 'am längsten'],
    ['kurz', 'kürzer', 'am kürzesten'], ['hoch', 'höher', 'am höchsten'], ['gut', 'besser', 'am besten'],
    ['viel', 'mehr', 'am meisten'], ['laut', 'lauter', 'am lautesten'], ['leise', 'leiser', 'am leisesten'],
    ['stark', 'stärker', 'am stärksten'], ['hell', 'heller', 'am hellsten'], ['süß', 'süßer', 'am süßesten'],
  ],
  vergleiche: [
    ['Der Elefant ist schwerer ___ die Maus.', 'als'], ['Mein Bleistift ist so lang ___ dein Bleistift.', 'wie'],
    ['Der Turm ist höher ___ das Haus.', 'als'], ['Lea rennt so schnell ___ Ben.', 'wie'],
    ['Im Sommer ist es wärmer ___ im Winter.', 'als'], ['Das Heft ist dünner ___ das Buch.', 'als'],
    ['Meine Tasche ist so schwer ___ deine.', 'wie'], ['Die Schnecke ist langsamer ___ der Hase.', 'als'],
    ['Opa ist älter ___ Papa.', 'als'], ['Der Mond ist so rund ___ ein Ball.', 'wie'],
    ['Heute ist es so kalt ___ gestern.', 'wie'], ['Das Lineal ist länger ___ der Radiergummi.', 'als'],
    ['Der Löwe brüllt lauter ___ die Katze.', 'als'], ['Ida ist so groß ___ ihre Schwester.', 'wie'],
    ['Die Suppe ist heißer ___ der Tee.', 'als'], ['Der Bach ist nicht so breit ___ der Fluss.', 'wie'],
  ],
  saetze: [
    '[der Hund] | schläft | im Korb', '[Mia] | malt | im Garten', '[die Katze] | klettert | auf den Baum',
    '[wir] | turnen | in der Halle', '[der Bus] | hält | an der Schule', '[Oma] | backt | am Sonntag',
    '[die Vögel] | singen | am Morgen', '[Ben] | liest | im Bett', '[der Wind] | weht | über das Feld',
    '[die Kinder] | spielen | auf dem Hof', '[Paul] | schwimmt | im See', '[die Lehrerin] | schreibt | an die Tafel',
    '[der Zug] | fährt | um acht Uhr', '[ich] | rechne | im Heft', '[die Sonne] | scheint | durch das Fenster',
    '[Lena] | wohnt | in Dresden',
    'am Morgen | packt | [Lena] | ihre Tasche', '[der Hausmeister] | repariert | heute | die Tür',
    'im Herbst | fallen | [die Blätter] | von den Bäumen', '[Tim] | schenkt | seiner Mutter | eine Blume',
    'nach der Schule | spielen | [die Kinder] | Fußball', '[der Bäcker] | backt | jeden Morgen | frische Brötchen',
    'gestern | fand | [Emma] | einen Schlüssel', '[meine Schwester] | baut | im Sand | eine Burg',
    'in der Pause | essen | [wir] | unser Brot', '[der Igel] | sucht | im Laub | nach Käfern',
    'heute | schreiben | [die Kinder] | einen Brief', '[der Hund] | holt | den Ball | aus dem Wasser',
  ],
  oberbegriffe: {
    Obst: ['Apfel', 'Birne', 'Kirsche', 'Pflaume', 'Banane'],
    Gemüse: ['Möhre', 'Gurke', 'Kohl', 'Erbse', 'Zwiebel'],
    Möbel: ['Tisch', 'Stuhl', 'Schrank', 'Bett', 'Regal'],
    Werkzeuge: ['Hammer', 'Säge', 'Zange', 'Schraubenzieher', 'Bohrer'],
    Fahrzeuge: ['Auto', 'Bus', 'Fahrrad', 'Zug', 'Traktor'],
    Musikinstrumente: ['Geige', 'Trommel', 'Flöte', 'Gitarre', 'Klavier'],
    Kleidung: ['Hose', 'Jacke', 'Pullover', 'Mütze', 'Kleid'],
    Blumen: ['Rose', 'Tulpe', 'Nelke', 'Sonnenblume', 'Gänseblümchen'],
    Vögel: ['Amsel', 'Spatz', 'Meise', 'Taube', 'Storch'],
    Schulsachen: ['Heft', 'Lineal', 'Füller', 'Radiergummi', 'Spitzer'],
    Getränke: ['Wasser', 'Milch', 'Saft', 'Tee', 'Kakao'],
    Körperteile: ['Arm', 'Bein', 'Kopf', 'Bauch', 'Knie'],
    Bäume: ['Eiche', 'Buche', 'Linde', 'Tanne', 'Birke'],
    Wetter: ['Regen', 'Schnee', 'Nebel', 'Wind', 'Hagel'],
  },
  teekessel: [
    ['die Bank', 'Darauf sitzt man im Park.', 'Dort bringt man sein Geld hin.'],
    ['das Schloss', 'Darin hat früher ein König gewohnt.', 'Damit schließt man eine Tür ab.'],
    ['die Maus', 'Das Tier frisst gern Körner.', 'Damit klickt man am Computer.'],
    ['die Birne', 'Das ist ein Obst.', 'Sie leuchtet in der Lampe.'],
    ['der Hahn', 'Er kräht am Morgen.', 'Aus ihm kommt in der Küche das Wasser.'],
    ['der Nagel', 'Man schlägt ihn mit dem Hammer in die Wand.', 'Er wächst an deinem Finger.'],
    ['der Schimmel', 'Das ist ein weißes Pferd.', 'Er wächst auf altem Brot.'],
    ['das Blatt', 'Es wächst am Baum.', 'Darauf schreibt man.'],
    ['der Strauß', 'Der große Vogel kann nicht fliegen.', 'So nennt man viele Blumen zusammen.'],
    ['der Flügel', 'Damit fliegt ein Vogel.', 'Das ist ein großes Klavier.'],
    ['der Zug', 'Er fährt auf Schienen.', 'Den macht man beim Schach mit einer Figur.'],
    ['die Decke', 'Damit deckt man sich im Bett zu.', 'Sie ist oben im Zimmer.'],
    ['die Mutter', 'Sie ist die Mama.', 'Sie wird auf eine Schraube gedreht.'],
    ['der Ball', 'Mit ihm spielt man Fußball.', 'Dort tanzen viele Menschen in festlichen Kleidern.'],
    ['das Pony', 'Das ist ein kleines Pferd.', 'So heißen die kurzen Haare über der Stirn.'],
    ['der Läufer', 'Er rennt bei einem Wettlauf.', 'Das ist ein langer, schmaler Teppich.'],
    ['die Schlange', 'Das Tier hat keine Beine.', 'Viele Menschen warten hintereinander.'],
    ['das Gericht', 'Dort entscheidet ein Richter.', 'Das isst man zum Mittag.'],
    ['die Kette', 'Sie hängt um den Hals.', 'Sie treibt das Fahrrad an.'],
  ],
};
if (typeof module !== 'undefined') module.exports = MW;
