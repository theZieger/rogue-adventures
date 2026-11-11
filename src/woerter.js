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
  rede         [Begleitsatz mit Doppelpunkt, Rede mit Satzzeichen] – auch für den Doppelpunkt in „Komma und Doppelpunkt“
  familien     [Wortstamm klein, Stammwort, [mindestens drei Wörter der Familie], [mindestens zwei ähnliche Wörter, die
               nicht dazugehören]]; jedes Familienwort enthält den Stamm (ä, ö, ü, äu zählen wie a, o, u, au)
  nachsilben   [Grundwort, Ableitung, falsch, falsch]: Nomen mit Artikel (-ung, -heit, -keit), sonst Adjektiv (-lich, -ig, -bar)
  vorsilben    [Satz mit ___, richtiges Wort, falsch, falsch] – ver-, be-, ent-, vor-; nur ein Wort darf in den Satz passen
  trennung     [richtig getrennt, falsch, falsch] – je ein Trennstrich; die falschen Stellen dürfen nirgends erlaubt sein
               (also nur Wörter, die man an genau einer Stelle trennen kann)
  aufzaehlung  'Satz mit Aufzählung': Kommas nur zwischen den Gliedern, vor dem letzten steht „und“ ohne Komma
  aberdenn     'Satz, aber/denn …' mit genau einem Komma direkt vor „aber“ oder „denn“
  grosssaetze  'Satz mit [Nomen]': das Nomen ist ein Gefühl, eine Farbe oder ein Verb oder Adjektiv als Nomen
               (die Freude, das Rot, das Lachen) und das einzige Wort im Satz, das man großschreiben muss –
               außer dem Satzanfang und Nomen, die schon groß dastehen
  grundform    [Wortform, Grundform, falsch, falsch]: Verbform → Grundform (er lief → laufen) oder Nomen in der
               Mehrzahl → Einzahl mit Artikel (die Bäume → der Baum); die falschen sind keine Grundform dieses Worts
  doppelvokal  [richtig, falsch] – Merkwort mit aa, ee oder oo; falsch = mit nur einem Selbstlaut
  saechsisch   [sächsisches Wort, Bedeutung, falsch, falsch, Erklärung]: nur Wörter, die in Sachsen wirklich so
               gesagt werden

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
  ersatz       [Nominalgruppe am Satzanfang, Rest des Satzes, Pronomen]: er, sie, es, wir, ihr oder 'sie (Mehrzahl)';
               der Rest passt nur zu dieser Nominalgruppe (Verb in Einzahl oder Mehrzahl)
  weglassen    'Teil | Teil | …' wie bei saetze; genau ein Teil steht in [eckigen Klammern]: das Wort oder Satzglied,
               das man weglassen kann (Adjektiv, Orts- oder Zeitangabe). Alles andere muss bleiben, deshalb
               nur Verben, die ein Objekt brauchen (tragen, brauchen, besuchen, mögen …)
  personen     regelmäßige Verben für die Personalpronomen: du …st, er …t (Stamm endet nicht auf s, ß, z, t oder d)
  redensarten  [Redensart oder Sprichwort, Bedeutung, falsch, falsch, Herkunft oder '' wenn unbekannt]
  trennbar     ['Satz mit [Verb] und [Verbteil] in Klammern.', Grundform]: das Prädikat hat zwei Teile (räumt … auf);
               zwischen den Teilen steht mindestens ein Wort
  zeitwoerter  ['Zeitwort ___ Rest.', Präsens, Präteritum]: der Satz beginnt mit Gestern, Damals, Früher oder Vorhin
               (dann Präteritum) oder mit Jetzt oder Morgen (dann Präsens)
  anrede       [Brief an …, Satz mit ___, richtig, falsch, falsch]: Sie, Ihnen, Ihr an Erwachsene, die man siezt;
               du, dich, dir, dein an Kinder und die Familie. Die falschen Wörter passen nicht zur Person.
  begleiter    [Satz mit ___, richtiges Artikelwort, falsch, falsch]: mein, dein, unser, dieser, jeder, kein;
               die falschen Formen passen nicht zum Nomen
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
  familien: [
    ['fahr', 'fahren', ['der Fahrer', 'die Fahrt', 'die Abfahrt', 'das Fahrrad'], ['die Gefahr', 'die Farbe', 'der Pfarrer']],
    ['spiel', 'spielen', ['der Spieler', 'das Spielzeug', 'verspielt', 'der Spielplatz'], ['der Spiegel', 'spitz']],
    ['les', 'lesen', ['der Leser', 'das Lesebuch', 'vorlesen'], ['lösen', 'leise']],
    ['back', 'backen', ['der Bäcker', 'die Bäckerei', 'das Backblech'], ['der Bach', 'packen']],
    ['schreib', 'schreiben', ['der Schreibtisch', 'abschreiben', 'die Schreibschrift'], ['schreien', 'der Schrank']],
    ['bau', 'bauen', ['der Bau', 'die Baustelle', 'der Neubau'], ['der Bauch', 'blau']],
    ['flieg', 'fliegen', ['der Flieger', 'abfliegen', 'wegfliegen'], ['die Fliese', 'fließen']],
    ['sing', 'singen', ['der Singvogel', 'vorsingen', 'die Singstimme'], ['sinken', 'die Sonne']],
    ['kalt', 'kalt', ['die Kälte', 'erkälten', 'die Erkältung'], ['das Kalb', 'die Kante']],
    ['hand', 'die Hand', ['der Handschuh', 'handlich', 'die Handschrift'], ['der Hund', 'die Wand']],
    ['sonn', 'die Sonne', ['sonnig', 'der Sonnenschein', 'die Sonnenblume'], ['der Sohn', 'sonst']],
    ['lauf', 'laufen', ['der Läufer', 'der Lauf', 'verlaufen'], ['das Laub', 'laut']],
    ['schnee', 'der Schnee', ['der Schneemann', 'die Schneeflocke', 'schneeweiß'], ['schnell', 'die Schnecke']],
    ['kind', 'das Kind', ['kindlich', 'die Kindheit', 'der Kindergarten'], ['das Kinn', 'das Rind']],
    ['wohn', 'wohnen', ['die Wohnung', 'der Bewohner', 'das Wohnzimmer'], ['die Bohne', 'der Mohn']],
    ['glück', 'das Glück', ['glücklich', 'der Glückwunsch', 'verunglücken'], ['die Glocke', 'die Lücke']],
    ['rechn', 'rechnen', ['die Rechnung', 'der Rechner', 'berechnen'], ['der Regen', 'die Rache']],
    ['schlaf', 'schlafen', ['der Schlaf', 'schläfrig', 'einschlafen'], ['schlapp', 'der Schal']],
    ['trink', 'trinken', ['trinkbar', 'austrinken', 'das Trinkglas'], ['tanken', 'die Tinte']],
    ['ess', 'essen', ['essbar', 'der Esstisch', 'das Essen'], ['der Esel', 'das Ende']],
    ['mal', 'malen', ['der Maler', 'das Malbuch', 'bemalen'], ['das Mehl', 'der Mann']],
  ],
  nachsilben: [
    ['fröhlich', 'die Fröhlichkeit', 'die Fröhlichheit', 'die Fröhlichnis'], ['krank', 'die Krankheit', 'die Krankkeit', 'die Kranknis'],
    ['gesund', 'die Gesundheit', 'die Gesundkeit', 'die Gesundnis'], ['frei', 'die Freiheit', 'die Freikeit', 'die Freinis'],
    ['schön', 'die Schönheit', 'die Schönkeit', 'die Schönnis'], ['klug', 'die Klugheit', 'die Klugkeit', 'die Klugnis'],
    ['ehrlich', 'die Ehrlichkeit', 'die Ehrlichheit', 'die Ehrlichnis'], ['freundlich', 'die Freundlichkeit', 'die Freundlichheit', 'die Freundlichnis'],
    ['dankbar', 'die Dankbarkeit', 'die Dankbarheit', 'die Dankbarnis'], ['pünktlich', 'die Pünktlichkeit', 'die Pünktlichheit', 'die Pünktlichnis'],
    ['sauber', 'die Sauberkeit', 'die Sauberheit', 'die Saubernis'], ['müde', 'die Müdigkeit', 'die Müdheit', 'die Müdnis'],
    ['wohnen', 'die Wohnung', 'die Wohnheit', 'die Wohnkeit'], ['rechnen', 'die Rechnung', 'die Rechnheit', 'die Rechnkeit'],
    ['zeichnen', 'die Zeichnung', 'die Zeichnheit', 'die Zeichnkeit'], ['warnen', 'die Warnung', 'die Warnheit', 'die Warnkeit'],
    ['landen', 'die Landung', 'die Landheit', 'die Landkeit'], ['hoffen', 'die Hoffnung', 'die Hoffheit', 'die Hoffkeit'],
    ['üben', 'die Übung', 'die Übheit', 'die Übkeit'], ['ordnen', 'die Ordnung', 'die Ordnheit', 'die Ordnkeit'],
    ['der Freund', 'freundlich', 'freundig', 'freundbar'], ['die Sonne', 'sonnig', 'sonnlich', 'sonnbar'],
    ['der Durst', 'durstig', 'durstlich', 'durstbar'], ['der Schmutz', 'schmutzig', 'schmutzlich', 'schmutzbar'],
    ['das Glück', 'glücklich', 'glückig', 'glückbar'], ['die Gefahr', 'gefährlich', 'gefahrig', 'gefahrbar'],
    ['der Mut', 'mutig', 'mutlich', 'mutbar'], ['der Wind', 'windig', 'windlich', 'windbar'],
    ['trinken', 'trinkbar', 'trinklich', 'trinkig'], ['waschen', 'waschbar', 'waschlich', 'waschig'],
    ['lesen', 'lesbar', 'leslich', 'lesig'], ['der Ärger', 'ärgerlich', 'ärgerig', 'ärgerbar'],
  ],
  vorsilben: [
    ['Ich darf mein Turnzeug nicht ___.', 'vergessen', 'begessen', 'entgessen'],
    ['Die Lehrerin will uns eine Geschichte ___.', 'vorlesen', 'entlesen', 'belesen'],
    ['Am Sonntag wollen wir Oma im Krankenhaus ___.', 'besuchen', 'versuchen', 'vorsuchen'],
    ['Der Wellensittich ist aus dem Käfig ___.', 'entflogen', 'verflogen', 'beflogen'],
    ['Ich muss mich bei Tim ___, weil ich ihn geschubst habe.', 'entschuldigen', 'beschuldigen', 'verschuldigen'],
    ['Ich will dir ein Geheimnis ___.', 'verraten', 'beraten', 'entraten'],
    ['Lena will ihr Gedicht der Klasse ___.', 'vortragen', 'betragen', 'entragen'],
    ['Kannst du mir den Weg zum Bahnhof ___?', 'beschreiben', 'verschreiben', 'entschreiben'],
    ['Ich habe meinen Schlüssel ___.', 'verloren', 'beloren', 'entloren'],
    ['Der Bus kommt gleich. Wir müssen uns ___.', 'beeilen', 'vereilen', 'voreilen'],
    ['Unser Hund ist ___. Wir suchen ihn überall.', 'entlaufen', 'belaufen', 'vorlaufen'],
    ['Die Feuerwehr will die Katze vom Dach ___.', 'befreien', 'verfreien', 'entfreien'],
  ],
  trennung: [
    ['Gar-ten', 'Ga-rten', 'Gart-en'], ['Blu-me', 'Bl-ume', 'Blum-e'], ['Ta-fel', 'Taf-el', 'T-afel'], ['Kin-der', 'Ki-nder', 'Kind-er'],
    ['Win-ter', 'Wi-nter', 'Wint-er'], ['Pin-sel', 'Pi-nsel', 'Pins-el'], ['Ho-se', 'Hos-e', 'H-ose'], ['Fe-der', 'Fed-er', 'F-eder'],
    ['Zu-cker', 'Zuc-ker', 'Zuck-er'], ['De-cke', 'Dec-ke', 'Deck-e'], ['Ja-cke', 'Jac-ke', 'Jack-e'], ['Glo-cke', 'Gloc-ke', 'Glock-e'],
    ['Brü-cke', 'Brüc-ke', 'Brück-e'], ['Schne-cke', 'Schnec-ke', 'Schneck-e'], ['ba-cken', 'bac-ken', 'back-en'],
    ['Kü-che', 'Küc-he', 'Küch-e'], ['Ku-chen', 'Kuc-hen', 'Kuch-en'], ['Ta-sche', 'Tas-che', 'Tasc-he'], ['Fla-sche', 'Flas-che', 'Flasc-he'],
    ['Wä-sche', 'Wäs-che', 'Wäsc-he'], ['Bü-cher', 'Büc-her', 'Büch-er'], ['Stro-phe', 'Strop-he', 'Stroph-e'],
    ['Fens-ter', 'Fen-ster', 'Fe-nster'], ['Kis-te', 'Ki-ste', 'Kist-e'], ['Kas-ten', 'Ka-sten', 'Kast-en'], ['Schwes-ter', 'Schwe-ster', 'Schwest-er'],
    ['Pflas-ter', 'Pfla-ster', 'Pflast-er'], ['Wes-te', 'We-ste', 'West-e'],
    ['Son-ne', 'So-nne', 'Sonn-e'], ['Tas-se', 'Ta-sse', 'Tass-e'], ['Kat-ze', 'Ka-tze', 'Katz-e'], ['Müt-ze', 'Mü-tze', 'Mütz-e'],
    ['Ap-fel', 'A-pfel', 'Apf-el'], ['Trop-fen', 'Tro-pfen', 'Tropf-en'], ['schwim-men', 'schwi-mmen', 'schwimm-en'],
    ['Ele-fant', 'E-lefant', 'Elef-ant'], ['Amei-se', 'A-meise', 'Am-eise'], ['Ra-dio', 'Radi-o', 'Rad-io'],
  ],
  aufzaehlung: [
    'Ich kaufe Äpfel, Birnen und Nüsse.', 'In meiner Federtasche sind Stifte, ein Lineal und ein Spitzer.',
    'Im Zoo sehen wir Löwen, Affen und Elefanten.', 'Zum Frühstück gibt es Brot, Käse und Tee.',
    'Lena, Ben und Mia spielen Fangen.', 'Im Garten wachsen Tomaten, Gurken, Möhren und Kartoffeln.',
    'Der Regenbogen ist rot, gelb, grün und blau.', 'Wir singen, tanzen und lachen.',
    'Ich packe Hose, Pullover und Mütze in den Koffer.', 'Auf dem Bauernhof leben Kühe, Schweine und Hühner.',
    'Im Herbst sammeln wir Kastanien, Eicheln und bunte Blätter.', 'Opa, Oma und Tante Ute kommen zu Besuch.',
    'Mein Hund kann sitzen, rollen und Pfötchen geben.', 'Im Wald wachsen Buchen, Eichen, Tannen und Birken.',
  ],
  aberdenn: [
    'Ich wollte draußen spielen, aber es regnete.', 'Ich bleibe heute zu Hause, denn ich bin krank.',
    'Der Hund bellt laut, aber er beißt nicht.', 'Wir ziehen Jacken an, denn es ist kalt.',
    'Ben ist klein, aber er rennt sehr schnell.', 'Lena trinkt viel Wasser, denn sie hat Durst.',
    'Die Suppe ist heiß, aber sie schmeckt gut.', 'Mia nimmt einen Schirm mit, denn es regnet.',
    'Ich habe gesucht, aber ich habe meinen Radiergummi nicht gefunden.', 'Tim geht früh ins Bett, denn er ist müde.',
  ],
  grosssaetze: [
    'Wir hatten großes [Glück] mit dem Wetter.', 'Beim [Lachen] tut mir der Bauch weh.', 'Die [Freude] über das Geschenk war groß.',
    'Das [Rot] der Ampel leuchtet hell.', 'Meine Oma hat viel [Geduld] mit mir.', 'Zum [Schwimmen] brauche ich eine Badekappe.',
    'Das [Lesen] macht mir großen Spaß.', 'Vor [Angst] hielt sich Ben die Augen zu.', 'Ich wünsche dir viel [Mut] für morgen.',
    'Beim [Malen] wird mein Pullover bunt.', 'Das [Blau] des Himmels ist heute besonders schön.', 'Die [Wut] im Bauch wird langsam kleiner.',
    'Nach dem [Essen] gehen wir spazieren.', 'Sie sagt immer die [Wahrheit].', 'Im [Dunkeln] leuchtet die Taschenlampe.',
    'Ich wünsche dir alles [Gute] zum Geburtstag.', 'Wir haben etwas [Schönes] erlebt.', 'Das [Singen] im Chor gefällt mir.',
    'Die [Ruhe] im Wald tut gut.', 'Vor [Müdigkeit] fallen mir die Augen zu.', 'Die [Kälte] kriecht in meine Finger.',
  ],
  grundform: [
    ['er lief', 'laufen', 'liefen', 'läufen'], ['sie ging', 'gehen', 'gingen', 'gangen'], ['er hat gesungen', 'singen', 'gesingen', 'sungen'],
    ['er fährt', 'fahren', 'fähren', 'fährten'], ['sie las', 'lesen', 'lasen', 'lisen'], ['er schrieb', 'schreiben', 'schrieben', 'schriben'],
    ['sie aß', 'essen', 'aßen', 'äßen'], ['er nimmt', 'nehmen', 'nimmen', 'nahmen'], ['du siehst', 'sehen', 'siehen', 'sahen'],
    ['er trank', 'trinken', 'tranken', 'trankten'], ['sie half', 'helfen', 'halfen', 'hilfen'], ['er hat geschlafen', 'schlafen', 'geschlafen', 'schliefen'],
    ['wir sind geschwommen', 'schwimmen', 'geschwommen', 'schwommen'], ['er gibt', 'geben', 'giben', 'gaben'], ['sie kam', 'kommen', 'kamen', 'kämen'],
    ['er fand', 'finden', 'fanden', 'fänden'], ['sie saß', 'sitzen', 'saßen', 'säßen'], ['er flog', 'fliegen', 'flogen', 'flögen'],
    ['du hast gerufen', 'rufen', 'gerufen', 'riefen'], ['sie wusste', 'wissen', 'wussten', 'wussen'], ['er trägt', 'tragen', 'trägen', 'trugen'],
    ['er rannte', 'rennen', 'rannten', 'ranten'],
    ['die Bäume', 'der Baum', 'der Bäum', 'der Baume'], ['die Mäuse', 'die Maus', 'die Mäus', 'die Mause'], ['die Häuser', 'das Haus', 'das Häus', 'das Hauser'],
    ['die Bücher', 'das Buch', 'das Büch', 'das Bucher'], ['die Hände', 'die Hand', 'die Händ', 'die Hande'], ['die Äpfel', 'der Apfel', 'der Äpfel', 'der Apf'],
    ['die Züge', 'der Zug', 'der Züg', 'der Zuge'], ['die Kälber', 'das Kalb', 'das Kälb', 'das Kalber'], ['die Gänse', 'die Gans', 'die Gäns', 'die Ganse'],
    ['die Wälder', 'der Wald', 'der Wäld', 'der Walder'], ['die Füße', 'der Fuß', 'der Füß', 'der Fuße'], ['die Blätter', 'das Blatt', 'das Blätt', 'das Blatter'],
  ],
  doppelvokal: [
    ['das Boot', 'das Bot'], ['das Meer', 'das Mer'], ['das Haar', 'das Har'], ['der See', 'der Se'], ['das Moos', 'das Mos'],
    ['der Tee', 'der Te'], ['der Saal', 'der Sal'], ['das Paar', 'das Par'], ['der Zoo', 'der Zo'], ['das Beet', 'das Bet'],
    ['der Klee', 'der Kle'], ['die Fee', 'die Fe'], ['der Schnee', 'der Schne'], ['leer', 'ler'], ['die Idee', 'die Ide'],
    ['der Aal', 'der Al'], ['das Moor', 'das Mor'], ['die Beere', 'die Bere'], ['der Kaffee', 'der Kaffe'],
  ],
  saechsisch: [
    ['die Bemme', 'die Scheibe Brot mit Belag', 'der Becher mit Kakao', 'die Mütze mit Bommel', 'Eine Bemme ist ein belegtes Brot, zum Beispiel ein Butterbrot.'],
    ['die Fettbemme', 'das Brot mit Schmalz', 'der dicke Kater', 'die Butterdose', 'Eine Fettbemme ist eine Brotscheibe mit Schmalz darauf.'],
    ['die Plinse', 'der Eierkuchen', 'die Pflaume', 'der Pinsel', 'Plinsen sind dünne Eierkuchen aus der Pfanne.'],
    ['nu', 'ja', 'nein', 'nie', '„Nu“ sagt man in Sachsen für „ja“: „Kommst du mit?“ – „Nu!“'],
    ['die Gusche', 'der Mund', 'die Gurke', 'die Dusche', 'Gusche ist ein derbes Wort für den Mund.'],
    ['die Hitsche', 'die Fußbank', 'die Hitze', 'der Schlitten', 'Eine Hitsche ist eine niedrige Fußbank, auf die man sich auch setzen kann.'],
    ['ditschen', 'eintauchen', 'niesen', 'flüstern', 'Wer den Keks in den Kakao tunkt, ditscht ihn.'],
    ['der Nischel', 'der Kopf', 'die Nase', 'der Nagel', 'In Chemnitz nennen viele das große Kopf-Denkmal in der Innenstadt den Nischel.'],
    ['der Blümchenkaffee', 'sehr dünner Kaffee', 'Kaffee mit Blüten darin', 'Tee aus Blumen', 'Der Kaffee ist so dünn, dass man das Blümchen am Boden der Tasse sieht.'],
    ['die Plauze', 'der Bauch', 'die Pause', 'der Pullover', 'Wer viel gegessen hat, hat eine volle Plauze.'],
    ['der Feez', 'der Spaß', 'die Fee', 'der Streit', '„Feez machen“ heißt Spaß und Unsinn machen.'],
    ['das Gelumpe', 'altes Zeug, das keiner braucht', 'ein Schatz aus Gold und Silber', 'Gemüse aus dem Garten', 'Gelumpe ist alter Kram, der nur herumliegt.'],
    ['mähren', 'trödeln', 'mähen', 'malen', '„Mähr nicht so rum!“ heißt: Trödel nicht so!'],
    ['der Ranft', 'das Endstück vom Brot', 'der Ranzen für die Schule', 'die Ranke am Zaun', 'Der Ranft ist das Anfangs- oder Endstück vom Brot, der Kanten.'],
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
  ersatz: [
    ['der kleine Hund', 'bellt laut', 'er'], ['die alte Katze', 'schläft auf dem Sofa', 'sie'], ['das neue Fahrrad', 'steht im Keller', 'es'],
    ['die Kinder', 'spielen auf dem Hof', 'sie (Mehrzahl)'], ['mein großer Bruder', 'fährt mit dem Bus', 'er'], ['unsere Lehrerin', 'liest eine Geschichte vor', 'sie'],
    ['das kleine Baby', 'weint in der Nacht', 'es'], ['die bunten Vögel', 'singen am Morgen', 'sie (Mehrzahl)'], ['Paul und ich', 'bauen eine Sandburg', 'wir'],
    ['Lena und du', 'habt heute Geburtstag', 'ihr'], ['der Bäcker', 'backt frische Brötchen', 'er'], ['die Sonne', 'scheint durch das Fenster', 'sie'],
    ['das Pferd', 'frisst Heu', 'es'], ['meine Freunde', 'kommen zu Besuch', 'sie (Mehrzahl)'], ['der Igel', 'sucht im Laub nach Käfern', 'er'],
    ['die Ameise', 'trägt ein Blatt', 'sie'], ['das Buch', 'liegt auf dem Tisch', 'es'], ['Oma und Opa', 'wohnen in Leipzig', 'sie (Mehrzahl)'],
    ['der Zug', 'fährt um acht Uhr ab', 'er'], ['die Blumen', 'blühen im Garten', 'sie (Mehrzahl)'], ['das Feuer', 'wärmt die Hände', 'es'],
    ['Mia und ich', 'gehen in dieselbe Klasse', 'wir'], ['Tim und du', 'habt heute Tischdienst', 'ihr'], ['der Schneemann', 'schmilzt in der Sonne', 'er'],
  ],
  weglassen: [
    'Lena | trägt | [heute] | eine Mütze', 'wir | besuchen | [am Sonntag] | unsere Oma', 'der | [kleine] | Hund | braucht | Futter',
    'Ben | bekommt | [zum Geburtstag] | ein Fahrrad', 'Mia | mag | [im Sommer] | Erdbeeren', 'Paul | hat | einen | [roten] | Ball',
    'ich | brauche | einen | [spitzen] | Bleistift', 'Emma | findet | einen | [glatten] | Stein', 'die Katze | fängt | [im Garten] | eine Maus',
    'die Lehrerin | lobt | [heute] | die Klasse', 'wir | besichtigen | [in Dresden] | die Frauenkirche', 'Mama | kauft | einen | [großen] | Kuchen',
    'Lea | braucht | [morgen] | eine Jacke', 'die | [freche] | Maus | mag | Käse', 'Jonas | besucht | [in den Ferien] | seinen Opa',
    'der Hund | trägt | einen | [langen] | Stock', 'Opa | repariert | [im Keller] | das Regal', 'die | [müde] | Katze | mag | Ruhe',
  ],
  personen: ['lachen', 'spielen', 'malen', 'singen', 'turnen', 'kochen', 'bauen', 'hüpfen', 'winken', 'rufen', 'schreiben', 'springen', 'schwimmen', 'trinken', 'kommen', 'gehen'],
  redensarten: [
    ['jemandem einen Bären aufbinden', 'jemandem eine Lüge erzählen', 'jemandem ein Kuscheltier schenken', 'jemandem beim Schuhebinden helfen', ''],
    ['die Katze im Sack kaufen', 'etwas kaufen, ohne es vorher anzusehen', 'eine Katze aus dem Tierheim holen', 'einen Sack voll Katzenfutter kaufen', 'Auf Märkten sollen Betrüger früher statt eines Ferkels eine Katze in den Sack gesteckt haben.'],
    ['Wer rastet, der rostet.', 'Wer sich nicht bewegt und nicht übt, verlernt vieles.', 'Wer Pause macht, wird nass.', 'Wer sich ausruht, wird reich.', 'Eisen, das lange herumliegt und nicht benutzt wird, bekommt Rost.'],
    ['Tomaten auf den Augen haben', 'etwas nicht sehen, das jeder sieht', 'sehr gern Tomaten essen', 'rote Augen vom Weinen haben', ''],
    ['jemandem die Daumen drücken', 'jemandem Glück wünschen', 'jemandem die Hand verletzen', 'jemandem ein Zeichen geben, dass er still sein soll', ''],
    ['ins Fettnäpfchen treten', 'aus Versehen etwas Unpassendes sagen oder tun', 'in der Küche ausrutschen', 'zu viel Butter essen', 'In Bauernhäusern stand früher ein Napf mit Fett für die Stiefel. Wer hineintrat, machte den Boden schmutzig.'],
    ['Hals- und Beinbruch!', 'Viel Glück!', 'Pass auf, du fällst gleich hin!', 'Gute Besserung!', 'Der Spruch kommt wahrscheinlich aus dem Jiddischen. Dort klingt ein Glückwunsch ganz ähnlich.'],
    ['jemandem auf den Leim gehen', 'auf einen Trick hereinfallen', 'an einem Klebstoff festkleben', 'jemandem beim Basteln helfen', 'Vogelfänger strichen früher Leim auf Äste. Die Vögel blieben daran kleben.'],
    ['etwas an die große Glocke hängen', 'etwas überall herumerzählen', 'etwas sehr laut läuten lassen', 'etwas ganz oben verstecken', 'Früher wurden wichtige Neuigkeiten mit einer Glocke angekündigt, damit alle zuhören.'],
    ['den Nagel auf den Kopf treffen', 'genau das Richtige sagen', 'mit dem Hammer auf den Daumen hauen', 'sehr gut werfen können', 'Wer den Nagel genau auf den Kopf trifft, schlägt ihn gerade in die Wand.'],
    ['Schwein haben', 'Glück haben', 'ein Haustier besitzen', 'unordentlich sein', 'Bei Wettkämpfen bekam früher manchmal der Letzte ein Ferkel als Trostpreis. Er hatte also Glück, obwohl er verloren hatte.'],
    ['jemandem reinen Wein einschenken', 'jemandem die volle Wahrheit sagen', 'jemandem ein Glas Saft geben', 'jemandem beim Abwaschen helfen', 'Manche Wirte mischten früher Wasser in den Wein. Ehrliche Wirte schenkten reinen Wein aus.'],
    ['sich etwas hinter die Ohren schreiben', 'sich etwas gut merken', 'sich einen Zettel hinter das Ohr klemmen', 'sich die Ohren waschen', ''],
    ['die Ohren steifhalten', 'durchhalten und nicht aufgeben', 'sehr gut zuhören', 'eine Mütze tragen', ''],
    ['Eulen nach Athen tragen', 'etwas tun, das niemand braucht', 'Tiere in den Zoo bringen', 'eine weite Reise machen', 'In Athen gab es früher sehr viele Eulen. Die Eule war sogar auf den Münzen der Stadt.'],
    ['Übung macht den Meister.', 'Wer viel übt, wird gut darin.', 'Nur Meister dürfen üben.', 'Üben ist langweilig.', ''],
    ['Lügen haben kurze Beine.', 'Mit Lügen kommt man nicht weit, sie kommen bald heraus.', 'Lügen sind lustige Geschichten.', 'Wer lügt, kann nicht schnell rennen.', ''],
    ['Viele Köche verderben den Brei.', 'Wenn zu viele mitbestimmen, wird es nichts.', 'In der Küche ist zu wenig Platz.', 'Brei schmeckt nur einem Koch.', ''],
    ['Der frühe Vogel fängt den Wurm.', 'Wer früh dran ist, hat einen Vorteil.', 'Vögel stehen früher auf als Menschen.', 'Würmer schlafen lange.', 'Der Spruch kommt aus dem Englischen.'],
    ['Aller Anfang ist schwer.', 'Wenn man etwas Neues lernt, ist es zuerst mühsam.', 'Am Anfang muss man schwere Sachen tragen.', 'Man soll nichts Neues anfangen.', ''],
    ['Ohne Fleiß kein Preis.', 'Wer etwas erreichen will, muss sich anstrengen.', 'Ohne Geld kann man nichts kaufen.', 'Fleißige Kinder gewinnen jedes Spiel.', ''],
    ['jemandem einen Korb geben', 'jemandem eine Absage geben', 'jemandem beim Einkaufen helfen', 'jemandem ein Geschenk machen', ''],
    ['etwas auf dem Kerbholz haben', 'etwas Verbotenes getan haben', 'gut schnitzen können', 'viel Brennholz haben', 'Früher ritzte man Schulden als Kerben in ein Holzstück, das Kerbholz.'],
    ['die Flinte ins Korn werfen', 'zu schnell aufgeben', 'im Feld etwas verlieren', 'auf die Jagd gehen', 'Soldaten warfen früher manchmal ihr Gewehr, die Flinte, ins Getreidefeld und liefen davon.'],
    ['mit dem linken Fuß zuerst aufgestanden sein', 'schlechte Laune haben', 'Linkshänder sein', 'sich den Fuß verstaucht haben', 'Früher glaubten viele Menschen, die linke Seite bringe Unglück.'],
    ['Was du heute kannst besorgen, das verschiebe nicht auf morgen.', 'Erledige deine Aufgaben gleich und nicht erst später.', 'Kaufe heute immer doppelt ein.', 'Morgen ist alles besser.', ''],
    ['Stille Wasser sind tief.', 'Ruhige Menschen wissen und können oft mehr, als man denkt.', 'In stillen Seen kann man nicht baden.', 'Man soll nicht ins Wasser springen.', ''],
    ['Wer zuletzt lacht, lacht am besten.', 'Wer am Ende gewinnt, freut sich am meisten.', 'Man soll nicht über Witze lachen.', 'Wer langsam versteht, hat mehr Spaß.', ''],
  ],
  trennbar: [
    ['Lea [räumt] ihr Zimmer [auf].', 'aufräumen'], ['Der Zug [kommt] pünktlich [an].', 'ankommen'], ['Tim [ruft] seine Oma [an].', 'anrufen'],
    ['Mama [kauft] im Supermarkt [ein].', 'einkaufen'], ['Die Sonne [geht] am Abend [unter].', 'untergehen'], ['Mia [zieht] ihre Jacke [an].', 'anziehen'],
    ['Der Bus [fährt] um acht Uhr [ab].', 'abfahren'], ['Ben [hebt] den Stift [auf].', 'aufheben'], ['Die Lehrerin [liest] eine Geschichte [vor].', 'vorlesen'],
    ['Papa [macht] das Licht [aus].', 'ausmachen'], ['Lukas [steigt] in den Bus [ein].', 'einsteigen'], ['Paul [schreibt] das Gedicht [ab].', 'abschreiben'],
    ['Ich [stehe] um sieben Uhr [auf].', 'aufstehen'], ['Emma [lädt] ihre Freunde zum Geburtstag [ein].', 'einladen'], ['Der Bäcker [macht] den Laden um sechs Uhr [auf].', 'aufmachen'],
    ['Jonas [packt] seine Schultasche [ein].', 'einpacken'], ['Die Katze [schläft] auf dem Sofa [ein].', 'einschlafen'], ['Lena [malt] das Bild bunt [aus].', 'ausmalen'],
    ['Opa [holt] uns vom Bahnhof [ab].', 'abholen'], ['Die Klasse [hört] der Lehrerin genau [zu].', 'zuhören'], ['Ich [schalte] den Fernseher [aus].', 'ausschalten'],
    ['Die Klasse [fängt] mit dem Lesen [an].', 'anfangen'],
  ],
  zeitwoerter: [
    ['Gestern ___ wir ins Schwimmbad.', 'gehen', 'gingen'], ['Jetzt ___ Mia ihre Hausaufgaben.', 'macht', 'machte'], ['Morgen ___ Opa zu Besuch.', 'kommt', 'kam'],
    ['Damals ___ die Kinder auf Schiefertafeln.', 'schreiben', 'schrieben'], ['Früher ___ man die Wäsche mit der Hand.', 'wäscht', 'wusch'], ['Vorhin ___ das Telefon.', 'klingelt', 'klingelte'],
    ['Gestern ___ es den ganzen Tag.', 'regnet', 'regnete'], ['Jetzt ___ der Bus um die Ecke.', 'biegt', 'bog'], ['Morgen ___ wir einen Ausflug.', 'machen', 'machten'],
    ['Damals ___ Oma auf einem Bauernhof.', 'wohnt', 'wohnte'], ['Gestern ___ ich ein spannendes Buch.', 'lese', 'las'], ['Jetzt ___ die Sonne durch die Wolken.', 'scheint', 'schien'],
    ['Früher ___ die Menschen bei Kerzenlicht.', 'lesen', 'lasen'], ['Morgen ___ Lena ihren Geburtstag.', 'feiert', 'feierte'], ['Vorhin ___ Ben einen Igel im Garten.', 'sieht', 'sah'],
    ['Gestern ___ der Hund die ganze Nacht.', 'bellt', 'bellte'], ['Jetzt ___ wir ein Lied.', 'singen', 'sangen'], ['Damals ___ es noch keine Handys.', 'gibt', 'gab'],
    ['Morgen ___ die Ferien.', 'beginnen', 'begannen'], ['Früher ___ die Bauern mit Pferden auf dem Feld.', 'arbeiten', 'arbeiteten'], ['Gestern ___ Paul sein Fahrrad.', 'putzt', 'putzte'],
    ['Jetzt ___ die Katze in der Sonne.', 'liegt', 'lag'],
  ],
  anrede: [
    ['Frau Weber, deine Lehrerin', 'Liebe Frau Weber, ich danke ___ für die schöne Klassenfahrt.', 'Ihnen', 'dir', 'ihnen'],
    ['Herrn Lange, euren Nachbarn', 'Lieber Herr Lange, können ___ bitte meine Katze füttern?', 'Sie', 'du', 'sie'],
    ['Herrn Lange, euren Nachbarn', 'Lieber Herr Lange, ich wünsche ___ gute Besserung.', 'Ihnen', 'dir', 'Sie'],
    ['Frau Weber, deine Lehrerin', 'Liebe Frau Weber, haben ___ meinen Brief bekommen?', 'Sie', 'du', 'ihr'],
    ['Frau Schmidt, die Schulleiterin', 'Sehr geehrte Frau Schmidt, ich möchte ___ zu unserem Schulfest einladen.', 'Sie', 'dich', 'Ihnen'],
    ['Frau Schmidt, die Schulleiterin', 'Sehr geehrte Frau Schmidt, wie geht es ___?', 'Ihnen', 'dir', 'Sie'],
    ['Herrn Lange, euren Nachbarn', 'Lieber Herr Lange, vielen Dank für ___ Hilfe.', 'Ihre', 'deine', 'ihre'],
    ['den Bürgermeister', 'Sehr geehrter Herr Bürgermeister, ich habe eine Frage an ___.', 'Sie', 'dich', 'sie'],
    ['Frau Weber, deine Lehrerin', 'Liebe Frau Weber, ___ Geschichte hat mir gut gefallen.', 'Ihre', 'deine', 'ihre'],
    ['Max, deinen Freund', 'Lieber Max, ich vermisse ___ sehr.', 'dich', 'Sie', 'Ihnen'],
    ['Ida, deine Freundin', 'Liebe Ida, kommst ___ am Samstag zu meinem Geburtstag?', 'du', 'Sie', 'ihr'],
    ['Max, deinen Freund', 'Lieber Max, ich schicke ___ ein Foto von meinem Hund.', 'dir', 'Ihnen', 'Sie'],
    ['Ida, deine Freundin', 'Liebe Ida, wie war ___ Urlaub?', 'dein', 'Ihr', 'Ihre'],
    ['deine Oma', 'Liebe Oma, ich freue mich auf ___!', 'dich', 'Sie', 'Ihnen'],
    ['deinen Opa', 'Lieber Opa, danke für ___ Brief!', 'deinen', 'Ihren', 'ihren'],
    ['Lena, deine Freundin', 'Liebe Lena, hast ___ Lust, mit mir zu basteln?', 'du', 'Sie', 'ihr'],
  ],
  begleiter: [
    ['___ Fahrrad ist rot.', 'Mein', 'Meine', 'Meinen'], ['Ist das ___ Mütze?', 'deine', 'dein', 'deinen'], ['___ Kind bekommt einen Apfel.', 'Jedes', 'Jeder', 'Jede'],
    ['___ Hund gehört meiner Tante.', 'Dieser', 'Diese', 'Dieses'], ['Ich mag ___ Buch sehr.', 'dieses', 'dieser', 'diese'], ['___ Tasche ist schwer.', 'Meine', 'Mein', 'Meinen'],
    ['Hast du ___ Turnbeutel dabei?', 'deinen', 'dein', 'deine'], ['___ Blume im Garten blüht.', 'Jede', 'Jeder', 'Jedes'], ['Wir besuchen ___ Oma.', 'unsere', 'unser', 'unseren'],
    ['___ Lehrer ist nett.', 'Unser', 'Unsere', 'Unseren'], ['Ich habe ___ Hunger.', 'keinen', 'kein', 'keine'], ['In ___ Schachtel liegen Murmeln.', 'dieser', 'diese', 'dieses'],
    ['Ich spiele mit ___ Ball.', 'meinem', 'meinen', 'meine'], ['___ Morgen trinke ich Milch.', 'Jeden', 'Jeder', 'Jedes'],
  ],
};
if (typeof module !== 'undefined') module.exports = MW;
