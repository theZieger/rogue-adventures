/*
  Wörter und Sätze für das Fach Englisch (Die Teestube und Der Doppeldecker), nach dem Lehrplan Englisch
  Grundschule Sachsen, Klasse 3. Eltern können hier die Wörter der Klasse ergänzen: eine Zeile kopieren, ändern,
  speichern, dann `npm run build`. `npm test` prüft, ob jede Zeile die nötigen Felder hat.

  Regeln für alle Listen:
  - Erst Englisch, dann Deutsch. Deutsche Nomen immer mit Artikel: ['dog', 'der Hund'].
  - Britische Schreibweise: colour, favourite, grey.
  - Texte in einfachen Anführungszeichen. Ein Apostroph im Text wird als ’ geschrieben (What’s), nie als '.
  - Jedes englische Wort nur einmal in der ganzen Datei; innerhalb eines Themas jede deutsche Bedeutung nur einmal
    (die falschen Antworten kommen aus demselben Thema).
  - Kein Wort, das auch zu einem anderen Thema passt (orange steht nur bei den Farben, fish nur bei den Tieren).

  DIE TEESTUBE (Wortschatz)
  woerter   { Thema: [[Englisch, Deutsch], …] } – ein neues Thema braucht mindestens vier Wörter
  farben    [Englisch, Deutsch, Farbe als #RRGGBB für das Farbfeld]
  zahlen    [Englisch, Deutsch, Zahl] – 1 bis 20 und die Zehner bis 100; Zahlen wie 42 baut das Spiel daraus
  tage      die Wochentage, monate die Monate – jeweils in der richtigen Reihenfolge (für „Wochentage und Monate“)

  DER DOPPELDECKER (Sätze und Wendungen)
  luecken   [Satz mit ___ als Lücke, richtiges Wort, falsches Wort, falsches Wort] – die falschen Wörter dürfen
            auf keinen Fall in die Lücke passen
  saetze    [englischer Satz, deutsche Bedeutung] für „Was bedeutet das?“
  fragen    [Frage, passende Antwort, unpassende Antwort, unpassende Antwort]

  Themen im Elternbereich: Ein Satz gehört zu jedem Thema, dessen Wörter in ihm oder seinen Antworten vorkommen
  (auch in der Mehrzahl). Ist eines davon ausgeschaltet, kommt der Satz nicht dran. Sätze ohne Themenwort sind
  „Allgemein“ und immer an.
*/
const ENG = {
  woerter: {
    'Schule': [
      ['pencil', 'der Bleistift'], ['pen', 'der Füller'], ['rubber', 'der Radiergummi'], ['ruler', 'das Lineal'],
      ['book', 'das Buch'], ['exercise book', 'das Heft'], ['schoolbag', 'die Schultasche'], ['pencil case', 'die Federtasche'],
      ['glue', 'der Kleber'], ['scissors', 'die Schere'], ['sharpener', 'der Anspitzer'], ['board', 'die Tafel'],
      ['table', 'der Tisch'], ['chair', 'der Stuhl'], ['window', 'das Fenster'], ['door', 'die Tür'],
      ['bin', 'der Mülleimer'], ['teacher', 'die Lehrerin'], ['classroom', 'das Klassenzimmer'],
    ],
    'Familie': [
      ['mum', 'die Mama'], ['dad', 'der Papa'], ['sister', 'die Schwester'], ['brother', 'der Bruder'],
      ['grandma', 'die Oma'], ['grandpa', 'der Opa'], ['baby', 'das Baby'], ['family', 'die Familie'],
      ['aunt', 'die Tante'], ['uncle', 'der Onkel'], ['friend', 'der Freund'],
    ],
    'Tiere': [
      ['dog', 'der Hund'], ['cat', 'die Katze'], ['rabbit', 'das Kaninchen'], ['guinea pig', 'das Meerschweinchen'],
      ['hamster', 'der Hamster'], ['mouse', 'die Maus'], ['bird', 'der Vogel'], ['fish', 'der Fisch'],
      ['horse', 'das Pferd'], ['cow', 'die Kuh'], ['pig', 'das Schwein'], ['sheep', 'das Schaf'],
      ['goat', 'die Ziege'], ['hen', 'das Huhn'], ['duck', 'die Ente'], ['goose', 'die Gans'],
      ['donkey', 'der Esel'], ['tortoise', 'die Schildkröte'],
    ],
    'Körper': [
      ['head', 'der Kopf'], ['hair', 'die Haare'], ['eye', 'das Auge'], ['ear', 'das Ohr'],
      ['nose', 'die Nase'], ['mouth', 'der Mund'], ['tooth', 'der Zahn'], ['arm', 'der Arm'],
      ['hand', 'die Hand'], ['finger', 'der Finger'], ['leg', 'das Bein'], ['foot', 'der Fuß'],
      ['knee', 'das Knie'], ['tummy', 'der Bauch'], ['neck', 'der Hals'], ['back', 'der Rücken'],
    ],
    'Kleidung': [
      ['T-shirt', 'das T-Shirt'], ['jumper', 'der Pullover'], ['trousers', 'die Hose'], ['jeans', 'die Jeans'],
      ['skirt', 'der Rock'], ['dress', 'das Kleid'], ['shoes', 'die Schuhe'], ['socks', 'die Socken'],
      ['jacket', 'die Jacke'], ['coat', 'der Mantel'], ['hat', 'der Hut'], ['cap', 'die Kappe'],
      ['scarf', 'der Schal'], ['gloves', 'die Handschuhe'], ['boots', 'die Stiefel'], ['shorts', 'die kurze Hose'],
    ],
    'Essen und Trinken': [
      ['apple', 'der Apfel'], ['banana', 'die Banane'], ['pear', 'die Birne'], ['strawberry', 'die Erdbeere'],
      ['grapes', 'die Weintrauben'], ['bread', 'das Brot'], ['butter', 'die Butter'], ['cheese', 'der Käse'],
      ['egg', 'das Ei'], ['sausage', 'die Wurst'], ['cake', 'der Kuchen'], ['biscuit', 'der Keks'],
      ['ice cream', 'das Eis'], ['chips', 'die Pommes'], ['sandwich', 'das Sandwich'], ['pizza', 'die Pizza'],
      ['carrot', 'die Möhre'], ['tomato', 'die Tomate'], ['potato', 'die Kartoffel'], ['milk', 'die Milch'],
      ['water', 'das Wasser'], ['juice', 'der Saft'], ['tea', 'der Tee'],
    ],
    'Wetter': [
      ['sun', 'die Sonne'], ['rain', 'der Regen'], ['snow', 'der Schnee'], ['wind', 'der Wind'],
      ['cloud', 'die Wolke'], ['fog', 'der Nebel'], ['rainbow', 'der Regenbogen'], ['storm', 'der Sturm'],
      ['sunny', 'sonnig'], ['rainy', 'regnerisch'], ['windy', 'windig'], ['cloudy', 'bewölkt'],
      ['cold', 'kalt'], ['hot', 'heiß'],
    ],
    'Hobbys': [
      ['football', 'der Fußball'], ['basketball', 'der Basketball'], ['tennis', 'das Tennis'], ['swimming', 'das Schwimmen'],
      ['reading', 'das Lesen'], ['painting', 'das Malen'], ['dancing', 'das Tanzen'], ['singing', 'das Singen'],
      ['cycling', 'das Radfahren'], ['riding', 'das Reiten'], ['piano', 'das Klavier'], ['guitar', 'die Gitarre'],
      ['drums', 'das Schlagzeug'],
    ],
    'In der Stadt': [
      ['school', 'die Schule'], ['park', 'der Park'], ['shop', 'der Laden'], ['supermarket', 'der Supermarkt'],
      ['zoo', 'der Zoo'], ['cinema', 'das Kino'], ['library', 'die Bücherei'], ['swimming pool', 'das Schwimmbad'],
      ['playground', 'der Spielplatz'], ['station', 'der Bahnhof'], ['hospital', 'das Krankenhaus'], ['museum', 'das Museum'],
      ['street', 'die Straße'], ['house', 'das Haus'], ['bakery', 'die Bäckerei'],
    ],
    'Verkehrsmittel': [
      ['bus', 'der Bus'], ['car', 'das Auto'], ['bike', 'das Fahrrad'], ['train', 'der Zug'],
      ['plane', 'das Flugzeug'], ['boat', 'das Boot'], ['ship', 'das Schiff'], ['taxi', 'das Taxi'],
      ['tram', 'die Straßenbahn'], ['underground', 'die U-Bahn'], ['lorry', 'der Lastwagen'], ['scooter', 'der Roller'],
    ],
  },
  farben: [
    ['red', 'rot', '#E0413A'], ['blue', 'blau', '#2F6FE0'], ['green', 'grün', '#3FA34D'], ['yellow', 'gelb', '#FFD83A'],
    ['orange', 'orange', '#FF8A1F'], ['pink', 'rosa', '#FF9CCB'], ['purple', 'lila', '#8A4FD0'], ['brown', 'braun', '#8A5A2B'],
    ['black', 'schwarz', '#151515'], ['white', 'weiß', '#FFFFFF'], ['grey', 'grau', '#9AA0A8'],
  ],
  zahlen: [
    ['one', 'eins', 1], ['two', 'zwei', 2], ['three', 'drei', 3], ['four', 'vier', 4], ['five', 'fünf', 5],
    ['six', 'sechs', 6], ['seven', 'sieben', 7], ['eight', 'acht', 8], ['nine', 'neun', 9], ['ten', 'zehn', 10],
    ['eleven', 'elf', 11], ['twelve', 'zwölf', 12], ['thirteen', 'dreizehn', 13], ['fourteen', 'vierzehn', 14],
    ['fifteen', 'fünfzehn', 15], ['sixteen', 'sechzehn', 16], ['seventeen', 'siebzehn', 17], ['eighteen', 'achtzehn', 18],
    ['nineteen', 'neunzehn', 19], ['twenty', 'zwanzig', 20], ['thirty', 'dreißig', 30], ['forty', 'vierzig', 40],
    ['fifty', 'fünfzig', 50], ['sixty', 'sechzig', 60], ['seventy', 'siebzig', 70], ['eighty', 'achtzig', 80],
    ['ninety', 'neunzig', 90], ['one hundred', 'hundert', 100],
  ],
  tage: [
    ['Monday', 'der Montag'], ['Tuesday', 'der Dienstag'], ['Wednesday', 'der Mittwoch'], ['Thursday', 'der Donnerstag'],
    ['Friday', 'der Freitag'], ['Saturday', 'der Samstag'], ['Sunday', 'der Sonntag'],
  ],
  monate: [
    ['January', 'der Januar'], ['February', 'der Februar'], ['March', 'der März'], ['April', 'der April'],
    ['May', 'der Mai'], ['June', 'der Juni'], ['July', 'der Juli'], ['August', 'der August'],
    ['September', 'der September'], ['October', 'der Oktober'], ['November', 'der November'], ['December', 'der Dezember'],
  ],

  luecken: [
    ['I have ___ a dog.', 'got', 'get', 'go'],
    ['This is my ___.', 'sister', 'blue', 'sing'],
    ['Can I have an ___, please?', 'apple', 'chair', 'Friday'],
    ['Can I have a ___, please?', 'sandwich', 'Monday', 'green'],
    ['Sit ___, please.', 'down', 'open', 'blue'],
    ['Open your ___.', 'books', 'red', 'go'],
    ['Close the ___, please.', 'door', 'happy', 'eat'],
    ['Stand ___, please.', 'up', 'yellow', 'cat'],
    ['My name ___ Tom.', 'is', 'are', 'am'],
    ['I ___ nine years old.', 'am', 'is', 'are'],
    ['How ___ are you? I am eight.', 'old', 'dog', 'Monday'],
    ['What ___ is it? It is blue.', 'colour', 'number', 'day'],
    ['It is ___. I can build a snowman.', 'snowing', 'sunny', 'hot'],
    ['Be ___, please.', 'quiet', 'eat', 'table'],
    ['I am wearing a red ___.', 'jumper', 'apple', 'Tuesday'],
    ['Anna is my ___. She is ten.', 'sister', 'brother', 'dad'],
    ['Ben is my ___. He is six.', 'brother', 'sister', 'mum'],
    ['I go to school by ___.', 'bus', 'tummy', 'cheese'],
    ['Let’s go to the ___.', 'park', 'pencil', 'nose'],
    ['I have got two ___.', 'cats', 'cat', 'red'],
    ['My favourite ___ is green.', 'colour', 'animal', 'food'],
    ['Look at the ___, please.', 'board', 'sing', 'happy'],
  ],
  saetze: [
    ['Good morning.', 'Guten Morgen.'], ['Hello, I am Tom.', 'Hallo, ich bin Tom.'], ['Goodbye.', 'Auf Wiedersehen.'],
    ['See you tomorrow.', 'Bis morgen.'], ['Thank you.', 'Danke.'], ['Sit down, please.', 'Setzt euch bitte hin.'],
    ['Stand up, please.', 'Steht bitte auf.'], ['Open your books.', 'Öffnet eure Bücher.'], ['Close your books.', 'Schließt eure Bücher.'],
    ['Listen.', 'Hört zu.'], ['Look at the board.', 'Schaut an die Tafel.'], ['Be quiet, please.', 'Seid bitte leise.'],
    ['Put up your hand.', 'Meldet euch.'], ['Come here, please.', 'Komm bitte her.'], ['Work with a partner.', 'Arbeitet zu zweit.'],
    ['Can you help me, please?', 'Kannst du mir bitte helfen?'], ['I don’t know.', 'Ich weiß es nicht.'],
    ['I don’t understand.', 'Ich verstehe das nicht.'], ['Can you say that again, please?', 'Kannst du das bitte noch einmal sagen?'],
    ['Let’s sing a song.', 'Lasst uns ein Lied singen.'], ['Let’s play a game.', 'Lasst uns ein Spiel spielen.'],
    ['Clean the board, please.', 'Wisch bitte die Tafel ab.'], ['Take out your pencil case.', 'Holt eure Federtasche heraus.'],
    ['Can I go to the toilet, please?', 'Darf ich bitte auf die Toilette gehen?'], ['Can I have a pencil, please?', 'Kann ich bitte einen Bleistift haben?'],
    ['I have got a dog.', 'Ich habe einen Hund.'], ['I have got two sisters.', 'Ich habe zwei Schwestern.'],
    ['This is my mum.', 'Das ist meine Mama.'], ['My name is Lea.', 'Ich heiße Lea.'], ['I am eight years old.', 'Ich bin acht Jahre alt.'],
    ['I like apples.', 'Ich mag Äpfel.'], ['I don’t like cheese.', 'Ich mag keinen Käse.'],
    ['My favourite colour is green.', 'Meine Lieblingsfarbe ist Grün.'], ['It is sunny today.', 'Heute ist es sonnig.'],
    ['It is cold and windy.', 'Es ist kalt und windig.'], ['I am wearing a blue jumper.', 'Ich trage einen blauen Pullover.'],
    ['My birthday is in June.', 'Ich habe im Juni Geburtstag.'], ['Today is Monday.', 'Heute ist Montag.'], ['I can swim.', 'Ich kann schwimmen.'],
    ['I go to school by bus.', 'Ich fahre mit dem Bus zur Schule.'], ['Let’s go to the zoo.', 'Lasst uns in den Zoo gehen.'],
    ['The station is next to the park.', 'Der Bahnhof ist neben dem Park.'], ['I play football on Saturday.', 'Am Samstag spiele ich Fußball.'],
    ['Touch your nose.', 'Fass dir an die Nase.'], ['Where is the cat?', 'Wo ist die Katze?'], ['The book is on the table.', 'Das Buch liegt auf dem Tisch.'],
    ['Happy birthday!', 'Alles Gute zum Geburtstag!'], ['I have got a red bike.', 'Ich habe ein rotes Fahrrad.'],
  ],
  fragen: [
    ['How old are you?', 'I am nine.', 'I am fine.', 'It is red.'],
    ['What’s your name?', 'My name is Tom.', 'I am nine.', 'It is Monday.'],
    ['How are you?', 'I am fine, thank you.', 'I am nine.', 'My name is Lea.'],
    ['What’s your favourite colour?', 'My favourite colour is blue.', 'I have got a cat.', 'It is Monday.'],
    ['Have you got a pet?', 'Yes, I have got a dog.', 'Yes, I am nine.', 'It is sunny.'],
    ['What’s the weather like?', 'It is sunny.', 'It is a dog.', 'I am fine.'],
    ['What day is it today?', 'It is Tuesday.', 'It is blue.', 'I am ten.'],
    ['When is your birthday?', 'It is in May.', 'It is green.', 'I have got a sister.'],
    ['Where do you live?', 'I live in Dresden.', 'I like pizza.', 'I am eight.'],
    ['Do you like apples?', 'Yes, I do.', 'Yes, I am.', 'It is a pear.'],
    ['Can you swim?', 'Yes, I can.', 'Yes, I do.', 'It is a fish.'],
    ['What colour is a banana?', 'It is yellow.', 'It is blue.', 'It is Friday.'],
    ['How many legs has a dog got?', 'It has got four legs.', 'It has got two legs.', 'It is brown.'],
    ['Who is this?', 'This is my brother.', 'It is sunny.', 'I like cake.'],
    ['What’s your favourite food?', 'I like pizza.', 'I like blue.', 'I am fine.'],
    ['What have you got in your schoolbag?', 'I have got a ruler and a book.', 'I am in the park.', 'It is cold.'],
    ['Is it cold today?', 'Yes, it is.', 'Yes, I can.', 'Yes, I do.'],
    ['How do you go to school?', 'I go by bike.', 'I go on Monday.', 'I am nine.'],
  ],
};
if (typeof module !== 'undefined') module.exports = ENG;
