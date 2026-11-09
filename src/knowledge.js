const MK = (() => {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- ETHIK: Martin Luther ---------- */
  const L_NOTES = {
    leben: { title: 'Luthers Leben', lines: ['Am 10. November 1483 in Eisleben geboren.', 'Vor ungefähr 500 Jahren sind die Menschen sehr arm und häufig hungrig.', 'Lebt und arbeitet später in Wittenberg für die Kirche: Er ist Mönch, lehrt als Professor an der Universität und predigt in der Kirche.', 'Er ist sehr gläubig, wie die meisten anderen Menschen auch.', 'Die Kirche ist damals sehr mächtig.'] },
    ablass: { title: 'Ablassbriefe und 95 Thesen', lines: ['Die Kirche handelt mit Ablassbriefen: Man bezahlt für Briefe, um keine Strafen für schlechte Taten zu befürchten.', 'Luther protestiert dagegen.', 'Am 31.10.1517 hängt er 95 Thesen an die Tür der Schlosskirche in Wittenberg.', 'Viele Menschen sind begeistert von Luthers Ideen. Er macht sich aber auch viele Feinde.'] },
    wartburg: { title: 'Vogelfrei und Wartburg', lines: ['Luther wird für „vogelfrei“ erklärt: Er ist nicht durch das Gesetz geschützt. Man darf ihm etwas antun, ohne bestraft zu werden.', 'Er wird zum Schein auf die Wartburg bei Eisenach entführt.', 'Dort versteckt er sich 10 Monate als „Junker Jörg“.', 'Auf der Wartburg übersetzt er einen Teil der Bibel in die deutsche Sprache.'] },
    reformation: { title: 'Reformation', lines: ['Reformation bedeutet „Erneuerung“.', 'Luther will eine Reformation (Erneuerung) der Kirche.', 'Der Papst und viele Bischöfe sind gegen Luthers Ideen – sie werden seine Gegner.', 'Die Kirche spaltet sich in die katholische Kirche und die evangelische Kirche (Anhänger Luthers). Das war nicht Luthers Absicht.'] },
  };
  const L_EVENTS_ORDER = [
    { id: 'o1', text: 'Luther wird in Eisleben geboren' },
    { id: 'o2', text: 'Luther kommt nach Wittenberg und arbeitet dort für die Kirche' },
    { id: 'o4', text: 'Luther hängt 95 Thesen gegen den Ablasshandel an die Schlosskirche' },
    { id: 'o5', text: 'Luther wird für vogelfrei erklärt' },
    { id: 'o6', text: 'Luther versteckt sich als Junker Jörg auf der Wartburg und übersetzt dort einen Teil der Bibel ins Deutsche' },
    { id: 'o8', text: 'Die Kirche spaltet sich in katholisch und evangelisch' },
  ];
  // mod: rf = Richtig/Falsch, mc = Wähle aus, lt = Lückentext, def = Begriffe, ord = Reihenfolge
  const L_POOL = [
    // Richtig / Falsch
    { id: 'rf1', mod: 'rf', g: 'leben', q: 'Martin Luther wurde 1483 geboren.', a: true },
    { id: 'rf2', mod: 'rf', g: 'leben', q: 'Martin Luther wurde in Wittenberg geboren.', a: false, why: 'Er wurde in Eisleben geboren.' },
    { id: 'rf3', mod: 'rf', g: 'leben', q: 'Luther lebte und arbeitete später in Wittenberg.', a: true },
    { id: 'rf4', mod: 'rf', g: 'leben', q: 'Die Kirche war zu Luthers Zeit sehr mächtig.', a: true },
    { id: 'rf5', mod: 'rf', g: 'leben', q: 'Luther war nicht gläubig.', a: false, why: 'Er war sehr gläubig, wie die meisten Menschen.' },
    { id: 'rf6', mod: 'rf', g: 'ablass', q: 'Luther fand den Handel mit Ablassbriefen gut.', a: false, why: 'Er protestierte dagegen.' },
    { id: 'rf7', mod: 'rf', g: 'ablass', q: 'Luther hängte 95 Thesen an die Tür der Schlosskirche.', a: true },
    { id: 'rf8', mod: 'rf', g: 'ablass', q: 'Die Schlosskirche mit den Thesen steht in Eisleben.', a: false, why: 'Sie steht in Wittenberg.' },
    { id: 'rf9', mod: 'rf', g: 'wartburg', q: 'Luther versteckte sich 10 Monate auf der Wartburg.', a: true },
    { id: 'rf10', mod: 'rf', g: 'wartburg', q: 'Auf der Wartburg nannte sich Luther „Junker Jörg“.', a: true },
    { id: 'rf11', mod: 'rf', g: 'wartburg', q: 'Vogelfrei bedeutet: Luther durfte frei reisen wie ein Vogel.', a: false, why: 'Vogelfrei heißt: nicht durch das Gesetz geschützt.' },
    { id: 'rf12', mod: 'rf', g: 'wartburg', q: 'Luther wurde wirklich von Feinden auf die Wartburg entführt.', a: false, why: 'Die Entführung war nur zum Schein.' },
    { id: 'rf13', mod: 'rf', g: 'wartburg', q: 'Luther übersetzte einen Teil der Bibel ins Deutsche.', a: true },
    { id: 'rf14', mod: 'rf', g: 'reformation', q: 'Reformation bedeutet „Erneuerung“.', a: true },
    { id: 'rf15', mod: 'rf', g: 'reformation', q: 'Die Kirche spaltete sich in die katholische und die evangelische Kirche.', a: true },
    { id: 'rf16', mod: 'rf', g: 'reformation', q: 'Luther wollte eine ganz neue Religion gründen.', a: false, why: 'Er wollte die Kirche erneuern (Reformation).' },
    { id: 'rf17', mod: 'rf', g: 'leben', q: 'Luther wurde am 10. November 1483 geboren.', a: true },
    { id: 'rf18', mod: 'rf', g: 'ablass', q: 'Luther schlug seine Thesen am 31.10.1517 an.', a: true },
    { id: 'rf19', mod: 'rf', g: 'wartburg', q: 'Die Wartburg liegt bei Eisenach.', a: true },
    { id: 'rf20', mod: 'rf', g: 'leben', q: 'Luther lehrte in Wittenberg an der Universität und predigte in der Kirche.', a: true },
    { id: 'rf21', mod: 'rf', g: 'reformation', q: 'Die Spaltung der Kirche war Luthers Absicht.', a: false, why: 'Das war nicht Luthers Absicht.' },
    { id: 'rf22', mod: 'rf', g: 'leben', q: 'Vor 500 Jahren waren die meisten Menschen reich und satt.', a: false, why: 'Die Menschen waren sehr arm und häufig hungrig.' },
    { id: 'rf23', mod: 'rf', g: 'ablass', q: 'Luther hatte nur Freunde und keine Feinde.', a: false, why: 'Viele waren begeistert, aber er machte sich auch viele Feinde.' },
    // Wähle aus
    { id: 'mc1', mod: 'mc', g: 'leben', q: 'Wo wurde Martin Luther geboren?', o: ['Eisleben', 'Wittenberg', 'Eisenach'], a: 0 },
    { id: 'mc2', mod: 'mc', g: 'leben', q: 'In welchem Jahr wurde Luther geboren?', o: ['1483', '1517', '1348'], a: 0 },
    { id: 'mc3', mod: 'mc', g: 'leben', q: 'Wo lebte und arbeitete Luther später für die Kirche?', o: ['Wittenberg', 'Eisleben', 'Rom'], a: 0 },
    { id: 'mc4', mod: 'mc', g: 'ablass', q: 'Wogegen protestierte Luther?', o: ['Gegen den Handel mit Ablassbriefen', 'Gegen die Bibel', 'Gegen die Wartburg'], a: 0 },
    { id: 'mc5', mod: 'mc', g: 'ablass', q: 'Wie viele Thesen hängte Luther an die Kirchentür?', o: ['95', '10', '1483'], a: 0 },
    { id: 'mc6', mod: 'mc', g: 'ablass', q: 'Wofür bezahlten die Menschen bei einem Ablassbrief?', o: ['Um keine Strafen für schlechte Taten zu befürchten', 'Für eine Reise nach Wittenberg', 'Für eine deutsche Bibel'], a: 0 },
    { id: 'mc7', mod: 'mc', g: 'ablass', q: 'An welche Tür hängte Luther seine Thesen?', o: ['An die Tür der Schlosskirche in Wittenberg', 'An die Tür der Wartburg', 'An die Tür seines Hauses in Eisleben'], a: 0 },
    { id: 'mc8', mod: 'mc', g: 'wartburg', q: 'Wie lange versteckte sich Luther auf der Wartburg?', o: ['10 Monate', '10 Tage', '10 Jahre'], a: 0 },
    { id: 'mc9', mod: 'mc', g: 'wartburg', q: 'Unter welchem Namen versteckte sich Luther?', o: ['Junker Jörg', 'Ritter Martin', 'Bruder Hans'], a: 0 },
    { id: 'mc10', mod: 'mc', g: 'wartburg', q: 'Was machte Luther auf der Wartburg?', o: ['Er übersetzte einen Teil der Bibel ins Deutsche', 'Er schrieb Ablassbriefe', 'Er baute eine Kirche'], a: 0 },
    { id: 'mc11', mod: 'mc', g: 'wartburg', q: 'Warum wurde Luther auf die Wartburg gebracht?', o: ['Zum Schein entführt, um ihn zu verstecken', 'Als Strafe für die Thesen', 'Weil er dort geboren wurde'], a: 0 },
    { id: 'mc12', mod: 'mc', g: 'reformation', q: 'In welche zwei Kirchen spaltete sich die Kirche?', o: ['Katholisch und evangelisch', 'Alt und neu', 'Deutsch und römisch'], a: 0 },
    { id: 'mc13', mod: 'mc', g: 'reformation', q: 'Was wollte Luther für die Kirche?', o: ['Eine Erneuerung (Reformation)', 'Mehr Ablassbriefe', 'Mehr Macht'], a: 0 },
    { id: 'mc14', mod: 'mc', g: 'ablass', q: 'An welchem Tag schlug Luther seine 95 Thesen an?', o: ['31.10.1517', '10.11.1483', '24.12.1500'], a: 0 },
    { id: 'mc15', mod: 'mc', g: 'wartburg', q: 'Wo liegt die Wartburg?', o: ['Bei Eisenach', 'Bei Wittenberg', 'Bei Eisleben'], a: 0 },
    { id: 'mc16', mod: 'mc', g: 'leben', q: 'Wie ging es den Menschen vor ungefähr 500 Jahren?', o: ['Sie waren sehr arm und häufig hungrig', 'Sie waren reich', 'Sie hatten alle ein Auto'], a: 0 },
    { id: 'mc17', mod: 'mc', g: 'reformation', q: 'Wer gehört zur evangelischen Kirche?', o: ['Die Anhänger Luthers', 'Die Gegner Luthers', 'Nur der Papst'], a: 0 },
    { id: 'mc18', mod: 'mc', g: 'leben', q: 'Was machte Luther in Wittenberg?', o: ['Er lehrte an der Universität und predigte', 'Er war Bauer auf einem Acker', 'Er war Ritter auf einer Burg'], a: 0 },
    // Lückentext
    { id: 'lt1', mod: 'lt', g: 'leben', q: 'Martin Luther wurde ___ in Eisleben geboren.', o: ['1483', '1517', '1500'], a: 0 },
    { id: 'lt2', mod: 'lt', g: 'leben', q: 'Luther lebte und arbeitete später in ___ für die Kirche.', o: ['Wittenberg', 'Eisleben', 'Berlin'], a: 0 },
    { id: 'lt3', mod: 'lt', g: 'leben', q: 'Luther war sehr ___, wie die meisten Menschen auch.', o: ['gläubig', 'reich', 'mächtig'], a: 0 },
    { id: 'lt4', mod: 'lt', g: 'ablass', q: 'Luther protestierte gegen den Handel mit ___.', o: ['Ablassbriefen', 'Bibeln', 'Burgen'], a: 0 },
    { id: 'lt5', mod: 'lt', g: 'ablass', q: 'Luther hängte ___ Thesen an die Tür der Schlosskirche.', o: ['95', '59', '100'], a: 0 },
    { id: 'lt6', mod: 'lt', g: 'ablass', q: 'Die Thesen hingen an der Tür der ___ in Wittenberg.', o: ['Schlosskirche', 'Wartburg', 'Schule'], a: 0 },
    { id: 'lt7', mod: 'lt', g: 'wartburg', q: 'Luther wurde für ___ erklärt.', o: ['vogelfrei', 'heilig', 'reich'], a: 0 },
    { id: 'lt8', mod: 'lt', g: 'wartburg', q: 'Luther versteckte sich ___ Monate auf der Wartburg.', o: ['10', '2', '20'], a: 0 },
    { id: 'lt9', mod: 'lt', g: 'wartburg', q: 'Auf der Wartburg nannte er sich Junker ___.', o: ['Jörg', 'Martin', 'Karl'], a: 0 },
    { id: 'lt10', mod: 'lt', g: 'wartburg', q: 'Luther übersetzte einen Teil der ___ ins Deutsche.', o: ['Bibel', 'Thesen', 'Gesetze'], a: 0 },
    { id: 'lt11', mod: 'lt', g: 'reformation', q: 'Reformation bedeutet ___.', o: ['Erneuerung', 'Spaltung', 'Strafe'], a: 0 },
    { id: 'lt12', mod: 'lt', g: 'reformation', q: 'Die Kirche spaltete sich in die katholische und die ___ Kirche.', o: ['evangelische', 'deutsche', 'neue'], a: 0 },
    { id: 'lt13', mod: 'lt', g: 'leben', q: 'Am 10. ___ 1483 wird Martin Luther in Eisleben geboren.', o: ['November', 'Mai', 'Januar'], a: 0 },
    { id: 'lt14', mod: 'lt', g: 'wartburg', q: 'Luther versteckt sich auf der Wartburg bei ___.', o: ['Eisenach', 'Eisleben', 'Wittenberg'], a: 0 },
    { id: 'lt15', mod: 'lt', g: 'ablass', q: 'Am 31.10.___ schlägt Luther seine 95 Thesen an.', o: ['1517', '1483', '1500'], a: 0 },
    { id: 'lt16', mod: 'lt', g: 'reformation', q: 'Der Papst und viele Bischöfe wurden Luthers ___.', o: ['Gegner', 'Anhänger', 'Schüler'], a: 0 },
    // Begriffe
    { id: 'def1', mod: 'def', g: 'reformation', q: 'Was bedeutet „Reformation“?', o: ['Erneuerung', 'Entführung', 'Bestrafung'], a: 0 },
    { id: 'def2', mod: 'def', g: 'wartburg', q: 'Was bedeutet „vogelfrei“?', o: ['Nicht durch das Gesetz geschützt – man durfte ihm etwas antun, ohne bestraft zu werden', 'Frei wie ein Vogel reisen', 'Von der Kirche belohnt'], a: 0 },
    { id: 'def3', mod: 'def', g: 'wartburg', q: 'Was ist die Wartburg?', o: ['Die Burg, auf der sich Luther 10 Monate versteckte', 'Die Kirche mit den 95 Thesen', 'Luthers Geburtshaus'], a: 0 },
    { id: 'def4', mod: 'def', g: 'ablass', q: 'Was ist ein Ablassbrief?', o: ['Ein Brief, den man kauft, um keine Strafen für schlechte Taten zu befürchten', 'Ein Brief von Luther an den Papst', 'Eine deutsche Bibel'], a: 0 },
    { id: 'def5', mod: 'def', g: 'wartburg', q: 'Wer war „Junker Jörg“?', o: ['Luther selbst, unter falschem Namen auf der Wartburg', 'Ein Ritter, der Luther entführte', 'Ein Ablasshändler'], a: 0 },
    { id: 'def6', mod: 'def', g: 'ablass', q: 'Was sind die 95 Thesen?', o: ['Luthers Sätze gegen den Ablasshandel an der Kirchentür', '95 Ablassbriefe', '95 Seiten der Bibel'], a: 0 },
    { id: 'def7', mod: 'def', g: 'ablass', q: 'Was bedeutet „protestieren“?', o: ['Sagen, dass man etwas falsch findet, und sich dagegen wehren', 'Etwas ganz toll finden', 'Sich heimlich verstecken'], a: 0 },
    { id: 'def8', mod: 'def', g: 'ablass', q: 'Was ist die Schlosskirche?', o: ['Die Kirche in Wittenberg, an deren Tür Luther die 95 Thesen hängte', 'Die Burg, auf der sich Luther versteckte', 'Luthers Geburtshaus in Eisleben'], a: 0 },
    { id: 'def9', mod: 'def', g: 'wartburg', q: 'Was bedeutet „zum Schein entführt“?', o: ['Die Entführung war nur gespielt, um Luther zu verstecken', 'Luther wurde von echten Feinden gefangen', 'Luther ist selbst weggelaufen'], a: 0 },
    { id: 'def10', mod: 'def', g: 'wartburg', q: 'Was bedeutet es, die Bibel zu „übersetzen“?', o: ['Sie in eine andere Sprache bringen – Luther schrieb sie auf Deutsch', 'Sie abschreiben, ohne etwas zu ändern', 'Sie an eine Kirchentür hängen'], a: 0 },
    { id: 'def11', mod: 'def', g: 'reformation', q: 'Was ist die evangelische Kirche?', o: ['Die Kirche der Anhänger Luthers', 'Die Kirche des Papstes', 'Eine Kirche ohne Bibel'], a: 0 },
    { id: 'def12', mod: 'def', g: 'reformation', q: 'Wer sind die „Anhänger Luthers“?', o: ['Menschen, die Luthers Ideen gut finden und ihm folgen', 'Menschen, die gegen Luther kämpfen', 'Zettel, die an der Kirchentür hängen'], a: 0 },
    { id: 'def13', mod: 'def', g: 'leben', q: 'Was ist ein Professor?', o: ['Ein Lehrer an der Universität', 'Ein Ritter auf einer Burg', 'Ein Händler mit Ablassbriefen'], a: 0 },
  ];
  const L_MODULES = {
    rf: { name: 'Richtig oder falsch', icon: '✅', maxTier: 1, worldCap: [1], dmg: 10 },
    mc: { name: 'Wähle aus', icon: '🔘', maxTier: 1, worldCap: [1], dmg: 12 },
    lt: { name: 'Lückentext', icon: '✏️', maxTier: 1, worldCap: [1], dmg: 12 },
    def: { name: 'Begriffe', icon: '📖', maxTier: 1, worldCap: [1], dmg: 14 },
    ord: { name: 'Reihenfolge', icon: '🔢', maxTier: 1, worldCap: [1], dmg: 16 },
  };
  const L_TUT = {
    'rf:1': { title: 'Richtig oder falsch', steps: ['Lies den Satz genau.', 'Stimmt er mit dem, was du über Luther weißt, überein? Dann „Richtig“.', 'Ist etwas vertauscht oder falsch? Dann „Falsch“.'] },
    'mc:1': { title: 'Wähle aus', steps: ['Lies die Frage.', 'Nur eine der drei Antworten stimmt.', 'Tippe auf die richtige Antwort.'] },
    'lt:1': { title: 'Lückentext', steps: ['Im Satz fehlt ein Wort (___).', 'Lies den Satz mit jedem Wort einmal durch.', 'Tippe auf das Wort, das passt.'] },
    'def:1': { title: 'Begriffe', steps: ['Hier geht es um wichtige Wörter wie Reformation, vogelfrei, Ablassbrief, 95 Thesen, Junker Jörg, protestieren oder evangelisch.', 'Überlege, was das Wort bedeutet.', 'Tippe auf die richtige Erklärung.'] },
    'ord:1': { title: 'Reihenfolge', steps: ['Vier Ereignisse sind durcheinander.', 'Tippe sie in der richtigen Reihenfolge an: Was passierte zuerst?', 'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.'] },
  };
  const L_STARTERS = [
    { id: 'luther', type: 'normal', shape: 'luther', names: ['Martin Luther', 'Martin Luther', 'Martin Luther'], hp: 70, desc: 'Der Mönch in Wittenberg. Mutig gegen die mächtige Kirche.', perk: 'none',
      attacks: [{ name: 'Klare Worte', mod: 'rf' }, { name: 'Gute Antwort', mod: 'mc' }, { name: 'Federkiel', mod: 'lt' }, { name: 'Thesenschlag', mod: 'def' }] },
  ];
  const L_EXTRA = { rf: 'Wahrheitsblick', mc: 'Kluge Wahl', lt: 'Druckerpresse', def: 'Wörterbuch', ord: 'Zeitstrahl' };
  const L_ENEMIES = {
    1: {
      normal: [
        { name: 'Der Zweifler', type: 'normal', shape: 'ghost', hp: 26, atk: 3 },
        { name: 'Der Vergessliche', type: 'normal', shape: 'ghost', hp: 24, atk: 4 },
        { name: 'Der Verwechsler', type: 'normal', shape: 'bat', hp: 28, atk: 4 },
        { name: 'Der Schwindler', type: 'normal', shape: 'jelly', hp: 30, atk: 3 },
      ],
      elite: { name: 'Der strenge Richter', type: 'normal', shape: 'rock', hp: 45, atk: 5 },
      boss: { name: 'Der Ablasshändler', acc: 'den Ablasshändler', type: 'normal', shape: 'merchant', hp: 70, atk: 6, boss: true },
    },
  };
  // Gegner-Angriffe: „<Gegner> greift mit <Angriff> an“
  const L_MOVES = ['Bannspruch', 'Siegelstempel', 'Zweifelsnebel', 'Lateinvortrag', 'Drohbrief', 'Ablassrechnung'];
  const L_EVENTS = [
    { title: 'Der Mönch', text: 'Ein Mönch fragt dich: „Weißt du, was Luther wirklich wollte?“ Antworte richtig und er schenkt dir einen Trank.', opts: [{ label: 'Antworten', task: 'any', g: 'reformation', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Kirchentür', text: 'Du stehst vor einer großen Kirchentür. Ein Zettel hängt daran: eine Frage zu Luthers Thesen!', opts: [{ label: 'Frage lesen', task: 'any', g: 'ablass', win: { xp: 20 }, lose: { xp: 5 } }, { label: 'Nicht lesen (+5 LP)', effect: { hp: 5 } }] },
    { title: 'Der Bote', text: 'Ein Bote bringt dir eine Nachricht. Wenn du sie richtig verstehst, schenkt er dir einen Schild.', opts: [{ label: 'Nachricht lesen', task: 'any', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Ablehnen', effect: {} }] },
    { title: 'Die Bibliothek', text: 'Der Bibliothekar kennt eine Eselsbrücke. Er verrät sie dir, wenn du seine Frage beantwortest.', opts: [{ label: 'Antworten', task: 'any', win: { item: 'lupe' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Kapelle', text: 'In der Kapelle brennt nur eine Kerze. Eine Nonne stellt dir eine Frage und segnet dich.', opts: [{ label: 'Antworten', task: 'any', win: { item: 'engel' }, lose: { xp: 5 } }, { label: 'Leise weitergehen', effect: {} }] },
    { title: 'Das Gasthaus', text: 'Im Gasthaus kannst du dich ausruhen.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
  ];

  /* ---------- SACHKUNDE: Kartoffelpflanze ---------- */
  // Teile der Pflanze (für Lehrkräfte anpassbar): id, name, ground ('oben' = über, 'unten' = unter der Erde), desc (Notizkarte)
  // und wo = Frage für „Oben oder unten“ (fehlt sie, wird „Wo findest du „Name“ – über oder unter der Erde?“ gefragt).
  const PARTS = [
    { id: 'wurzeln', name: 'Wurzeln', ground: 'unten', wo: 'Wo wachsen die Wurzeln?', desc: 'Wachsen aus der Saatkartoffel und holen Wasser aus dem Boden.' },
    { id: 'mutterknolle', name: 'Saatkartoffel', ground: 'unten', wo: 'Wo liegt die Saatkartoffel?', desc: 'Die alte Kartoffel, die im Frühjahr gesetzt wird. Sie schrumpft später.' },
    { id: 'auslaeufer', name: 'Ausläufer', ground: 'unten', wo: 'Wo wachsen die Ausläufer?', desc: 'Wachsen unter der Erde aus der Saatkartoffel zur Seite. An ihrem Ende bilden sich die neuen Knollen.' },
    { id: 'tochterknollen', name: 'Knollen', ground: 'unten', wo: 'Wo wachsen die neuen Knollen?', desc: 'Die neuen Kartoffeln am Ende der Ausläufer. Sie werden im Herbst geerntet.' },
    { id: 'staengel', name: 'Stängel', ground: 'oben', wo: 'Wo wächst der Stängel?', desc: 'Trägt Blätter, Blüten und Beeren.' },
    { id: 'blaetter', name: 'Blätter', ground: 'oben', wo: 'Wo wachsen die Blätter?', desc: 'Ohne Blätter kann die Pflanze nicht überleben.' },
    { id: 'bluete', name: 'Blüten', ground: 'oben', wo: 'Wo wachsen die Blüten?', desc: 'Im Sommer blüht die Pflanze.' },
    { id: 'beere', name: 'Beeren', ground: 'oben', wo: 'Wo wachsen die Beeren?', desc: 'Grüne, giftige Beeren, die aus den Blüten entstehen.' },
  ];
  const GROW = [
    { id: 'g1', text: 'Im Frühjahr wird eine keimende Saatkartoffel in die Erde gesetzt' },
    { id: 'g2', text: 'Wenige Wochen später wachsen kleine Triebe (Keime) aus der Kartoffel' },
    { id: 'g3', text: 'Die Triebe durchbrechen die Erde und werden zur Kartoffelpflanze' },
    { id: 'g4', text: 'Unter der Erde wachsen Ausläufer, an ihrem Ende bilden sich kleine Knollen – die alte Kartoffel schrumpft' },
    { id: 'g5', text: 'Im Sommer blüht die Pflanze, aus den Blüten werden grüne, giftige Beeren' },
    { id: 'g6', text: 'Im Herbst verdorrt die Pflanze, die Knollen sind reif und werden geerntet' },
  ];
  const STORY = [
    { id: 's1', text: 'Das Bäuerlein findet auf seinem Acker einen kleinen schwarzen Teufel auf feurigen Kohlen' },
    { id: 's2', text: 'Der Teufel verspricht den Schatz, wenn er zwei Jahre die Hälfte der Ernte bekommt' },
    { id: 's3', text: 'Der Teufel wählt, was über der Erde wächst – der Bauer pflanzt Kartoffeln' },
    { id: 's4', text: 'Der Teufel bekommt nur gelbe, welke Blätter' },
    { id: 's5', text: 'Der Teufel wählt, was unter der Erde wächst – der Bauer sät Weizen' },
    { id: 's6', text: 'Der Teufel findet nur Stoppeln und fährt wütend in eine Felsenschlucht' },
    { id: 's7', text: 'Das Bäuerlein holt sich den Schatz' },
  ];
  const K_NOTES = {
    teile: { title: 'Die Teile der Kartoffelpflanze', lines: PARTS.map((p) => `${p.name}: ${p.desc}`) },
    boden: { title: 'Über und unter der Erde', lines: ['Unter der Erde: Wurzeln, Saatkartoffel, Ausläufer, Knollen.', 'Über der Erde: Stängel, Blätter, Blüten, Beeren.'] },
    wachstum: { title: 'Wie die Kartoffel wächst', lines: GROW.map((g, i) => `${i + 1}. ${g.text}.`) },
    herkunft: { title: 'Woher kommt die Kartoffel?', lines: ['Die Kartoffel kommt aus Südamerika, aus Peru.', 'Die Spanier lernten sie im 16. Jahrhundert bei den Inkas kennen, der Urbevölkerung der Anden.', 'Für die Inkas war die Kartoffel ein wichtiges Nahrungsmittel.', 'Die Spanier nahmen die Kartoffeln kistenweise an Bord ihrer Schiffe mit nach Europa.', 'Nach anfänglichen Schwierigkeiten wurde die Kartoffelpflanze in ganz Europa angebaut.', 'Heute ist die Kartoffel neben dem Brot ein wichtiges Grundnahrungsmittel.'] },
    ernte: { title: 'Die Kartoffelernte früher und heute', lines: ['Früher: mit großen Gabeln aus der Erde gehoben, kurz auf dem Feld getrocknet, dann aufgelesen und in Körbe und Säcke gefüllt.', 'Das Auflesen in gebückter Haltung war mühsam. Arme Leute und Kinder halfen und bekamen als Lohn Kartoffeln.', 'Heute: Maschinen ernten. Kartoffelroder fahren über das Feld und befreien die Kartoffeln von der anhaftenden Erde.', 'Eine Sortiermaschine sortiert sie der Größe nach in Säcke. Nur unförmige und grüne Kartoffeln werden von Hand aussortiert.'] },
    kaefer: { title: 'Der Kartoffelkäfer', lines: ['Früher war der Kartoffelkäfer die größte Bedrohung für die Kartoffelpflanze.', 'Ein Weibchen legt mehrere hundert Eier auf die Blätter, daraus schlüpfen gefräßige Larven.', 'Dreißig Larven können in einer Woche eine Pflanze kahl fressen.', 'Ohne Blätter kann die Pflanze nicht überleben – es wachsen kaum neue Kartoffeln.', 'Heute bekämpft man die Käfer mit Schädlingsvernichtungsmitteln, früher sammelte man sie mit der Hand ein.'] },
    woerter: { title: 'Kartoffelwörter', lines: ['die Bratkartoffel, die Salzkartoffel, die Saatkartoffel, die Frühkartoffel, die Pellkartoffel', 'der Kartoffelchip, die Kartoffelsuppe, die Kartoffelschale, der Kartoffelsalat, der Kartoffelbrei, das Kartoffelmehl'] },
    maerchen: { title: 'Der Bauer und der Teufel (nach den Brüdern Grimm)', lines: ['Die Geschichte ist nach einem Märchen der Brüder Grimm erzählt. Bei den Grimms sät der Bauer im ersten Jahr Rüben – bei uns pflanzt er Kartoffeln.', 'Der Bauer ist klug, verschmitzt, listig, vergnügt und klein (ein Bäuerlein).', 'Der Teufel ist klein, schwarz, feurig und am Ende wütend.', 'Der Teufel sitzt auf einem Schatz und will zwei Jahre lang die Hälfte der Ernte.', 'Erstes Jahr: Teufel bekommt, was über der Erde ist – der Bauer pflanzt Kartoffeln.', 'Zweites Jahr: Teufel bekommt, was unter der Erde ist – der Bauer sät Weizen.', 'Der Teufel fährt wütend in eine Felsenschlucht, der Bauer holt den Schatz.'] },
  };
  const K_POOL = [];
  PARTS.forEach((p) => { K_POOL.push({ id: 'p_' + p.id, mod: 'parts', g: 'teile', part: p.id, q: 'Wie heißt der leuchtende Teil?', a: p.name }); K_POOL.push({ id: 'gr_' + p.id, mod: 'ground', g: 'boden', q: p.wo || `Wo findest du „${p.name}“ – über oder unter der Erde?`, o: ['Über der Erde', 'Unter der Erde'], a: p.ground === 'oben' ? 0 : 1 }); });
  K_POOL.push(
    { id: 'kmc1', mod: 'wissen', g: 'teile', q: 'Welchen Teil der Kartoffelpflanze essen wir?', o: ['Die Knollen', 'Die Beeren', 'Die Blätter'], a: 0 },
    { id: 'kmc2', mod: 'wissen', g: 'teile', q: 'Woran wachsen die neuen Knollen?', o: ['Am Ende der Ausläufer', 'An den Blättern', 'An der Blüte'], a: 0 },
    { id: 'kmc3', mod: 'wissen', g: 'teile', q: 'Was wird aus den Blüten?', o: ['Grüne, giftige Beeren', 'Neue Knollen', 'Wurzeln'], a: 0 },
    { id: 'kmc4', mod: 'wissen', g: 'teile', q: 'Was wird im Frühjahr in die Erde gesetzt?', o: ['Eine keimende Saatkartoffel', 'Eine Beere', 'Ein Blatt'], a: 0 },
    { id: 'kmc5', mod: 'wissen', g: 'wachstum', q: 'Was passiert mit der alten Kartoffel, wenn die Pflanze wächst?', o: ['Sie schrumpft', 'Sie wird größer', 'Sie blüht'], a: 0 },
    { id: 'kmc6', mod: 'wissen', g: 'wachstum', q: 'Wann werden die Knollen geerntet?', o: ['Im Herbst', 'Im Frühjahr', 'Im Winter'], a: 0 },
    // Lückentext: Herkunft
    { id: 'lk1', mod: 'ltk', g: 'herkunft', q: 'Eigentlich kommt die Kartoffel aus ___, aus Peru.', o: ['Südamerika', 'Europa', 'Afrika'], a: 0 },
    { id: 'lk2', mod: 'ltk', g: 'herkunft', q: 'Eigentlich kommt die Kartoffel aus Südamerika, aus ___.', o: ['Peru', 'Spanien', 'Italien'], a: 0 },
    { id: 'lk3', mod: 'ltk', g: 'herkunft', q: 'Als die ___ im 16. Jahrhundert nach Südamerika zu den Inkas kamen, lernten sie die Kartoffel kennen.', o: ['Spanier', 'Deutschen', 'Inkas'], a: 0 },
    { id: 'lk4', mod: 'ltk', g: 'herkunft', q: 'Sie lernten die Kartoffel bei den ___ kennen, der Urbevölkerung der Anden.', o: ['Inkas', 'Spaniern', 'Bauern'], a: 0 },
    { id: 'lk5', mod: 'ltk', g: 'herkunft', q: 'Die Inkas waren die ___ der Anden.', o: ['Urbevölkerung', 'Könige', 'Seefahrer'], a: 0 },
    { id: 'lk6', mod: 'ltk', g: 'herkunft', q: 'Für die Inkas war die Kartoffel ein wichtiges ___.', o: ['Nahrungsmittel', 'Geschenk', 'Spielzeug'], a: 0 },
    { id: 'lk7', mod: 'ltk', g: 'herkunft', q: 'Die Spanier nahmen die Kartoffeln kistenweise an Bord ihrer ___ mit nach Hause.', o: ['Schiffe', 'Wagen', 'Flugzeuge'], a: 0 },
    { id: 'lk8', mod: 'ltk', g: 'herkunft', q: 'Nach anfänglichen ___ wurde die Kartoffelpflanze in ganz Europa angebaut.', o: ['Schwierigkeiten', 'Festen', 'Geschenken'], a: 0 },
    { id: 'lk9', mod: 'ltk', g: 'herkunft', q: 'Mittlerweile ist die Kartoffel neben dem Brot zu einem wichtigen ___ geworden.', o: ['Grundnahrungsmittel', 'Haustier', 'Gewürz'], a: 0 },
    { id: 'lk10', mod: 'ltk', g: 'herkunft', q: 'Die Spanier lernten die Kartoffel im ___ Jahrhundert bei den Inkas in Peru kennen.', o: ['16.', '20.', '10.'], a: 0 },
    // Lückentext: Ernte
    { id: 'le1', mod: 'ltk', g: 'ernte', q: 'Früher mussten die Kartoffeln mit großen ___ aus der Erde herausgehoben werden.', o: ['Gabeln', 'Maschinen', 'Löffeln'], a: 0 },
    { id: 'le2', mod: 'ltk', g: 'ernte', q: 'Man ließ sie kurze Zeit auf den Feldern ___.', o: ['trocknen', 'wachsen', 'schlafen'], a: 0 },
    { id: 'le3', mod: 'ltk', g: 'ernte', q: 'Dann wurden sie aufgelesen und in Körbe und ___ gefüllt.', o: ['Säcke', 'Flaschen', 'Tassen'], a: 0 },
    { id: 'le4', mod: 'ltk', g: 'ernte', q: 'Das Auflesen in ___ Haltung war eine mühsame Arbeit.', o: ['gebückter', 'aufrechter', 'sitzender'], a: 0 },
    { id: 'le5', mod: 'ltk', g: 'ernte', q: 'Arme Leute und auch ___ halfen den Bauern beim Auflesen.', o: ['Kinder', 'Könige', 'Maschinen'], a: 0 },
    { id: 'le6', mod: 'ltk', g: 'ernte', q: 'Als Lohn bekamen sie ___.', o: ['Kartoffeln', 'Geld', 'Brot'], a: 0 },
    { id: 'le7', mod: 'ltk', g: 'ernte', q: 'Heute werden die Kartoffeln mit ___ geerntet.', o: ['Maschinen', 'Gabeln', 'Händen'], a: 0 },
    { id: 'le8', mod: 'ltk', g: 'ernte', q: 'Große ___ fahren über das Feld und ernten die Kartoffeln.', o: ['Kartoffelroder', 'Busse', 'Rasenmäher'], a: 0 },
    { id: 'le9', mod: 'ltk', g: 'ernte', q: 'Sie befreien die Kartoffeln gleichzeitig von der anhaftenden ___.', o: ['Erde', 'Schale', 'Farbe'], a: 0 },
    { id: 'le10', mod: 'ltk', g: 'ernte', q: 'Mit Hilfe einer ___ werden sie der Größe nach sortiert.', o: ['Sortiermaschine', 'Waschmaschine', 'Nähmaschine'], a: 0 },
    { id: 'le11', mod: 'ltk', g: 'ernte', q: 'Nach dem Sortieren kommen die Kartoffeln in ___.', o: ['Säcke', 'Flaschen', 'Gläser'], a: 0 },
    { id: 'le12', mod: 'ltk', g: 'ernte', q: 'Nur die Aussortierung unförmiger und ___ Kartoffeln geschieht noch von Hand.', o: ['grüner', 'kleiner', 'dicker'], a: 0 },
    // Wissen: Käfer + Herkunft + Ernte (rf / mc); kmc1–6 oben gehören auch dazu
    { id: 'kw1', mod: 'wissen', g: 'kaefer', q: 'Früher war der Kartoffelkäfer die größte Bedrohung für die Kartoffelpflanze.', rf: true, a: true },
    { id: 'kw2', mod: 'wissen', g: 'kaefer', q: 'Wie viele Eier legt ein Kartoffelkäferweibchen?', o: ['Mehrere hundert', 'Nur eins', 'Etwa drei'], a: 0 },
    { id: 'kw3', mod: 'wissen', g: 'kaefer', q: 'Was schlüpft aus den Eiern des Kartoffelkäfers?', o: ['Gefräßige Larven', 'Kleine Schnecken', 'Fliegen'], a: 0 },
    { id: 'kw4', mod: 'wissen', g: 'kaefer', q: 'Wie viele Larven können in einer Woche eine Pflanze kahl fressen?', o: ['Dreißig', 'Drei', 'Dreihundert'], a: 0 },
    { id: 'kw5', mod: 'wissen', g: 'kaefer', q: 'Ohne Blätter kann die Kartoffelpflanze trotzdem gut überleben.', rf: true, a: false, why: 'Ohne Blätter kann sie nicht überleben.' },
    { id: 'kw6', mod: 'wissen', g: 'kaefer', q: 'Was passiert bei einer abgefressenen Pflanze unter der Erde?', o: ['Es wachsen nur wenige oder keine neuen Kartoffeln', 'Es wachsen besonders viele Kartoffeln', 'Nichts verändert sich'], a: 0 },
    { id: 'kw7', mod: 'wissen', g: 'kaefer', q: 'Wie bekämpft man den Kartoffelkäfer heute?', o: ['Mit Schädlingsvernichtungsmitteln', 'Mit Zucker', 'Mit lauter Musik'], a: 0 },
    { id: 'kw8', mod: 'wissen', g: 'kaefer', q: 'Früher sammelte man die Käfer mit der Hand ein.', rf: true, a: true },
    { id: 'kw9', mod: 'wissen', g: 'kaefer', q: 'Wo legt der Kartoffelkäfer seine Eier ab?', o: ['Auf dem Blatt', 'In der Erde', 'Auf der Knolle'], a: 0 },
    { id: 'kw10', mod: 'wissen', g: 'herkunft', q: 'Die Kartoffel ist eine Pflanze aus Europa.', rf: true, a: false, why: 'Sie kommt aus Südamerika, aus Peru.' },
    { id: 'kw11', mod: 'wissen', g: 'herkunft', q: 'Wer brachte die Kartoffel nach Europa?', o: ['Die Spanier', 'Die Inkas', 'Die Deutschen'], a: 0 },
    { id: 'kw12', mod: 'wissen', g: 'herkunft', q: 'Wer waren die Inkas?', o: ['Die Urbevölkerung der Anden', 'Spanische Seefahrer', 'Bauern aus Europa'], a: 0 },
    { id: 'kw13', mod: 'wissen', g: 'herkunft', q: 'Die Kartoffel wuchs in Europa sofort ohne Probleme.', rf: true, a: false, why: 'Es gab anfängliche Schwierigkeiten.' },
    { id: 'kw14', mod: 'wissen', g: 'ernte', q: 'Früher halfen auch Kinder beim Auflesen der Kartoffeln.', rf: true, a: true },
    { id: 'kw15', mod: 'wissen', g: 'ernte', q: 'Was machen Kartoffelroder?', o: ['Sie ernten die Kartoffeln und befreien sie von der Erde', 'Sie pflanzen die Kartoffeln', 'Sie kochen die Kartoffeln'], a: 0 },
    { id: 'kw16', mod: 'wissen', g: 'ernte', q: 'Welche Kartoffeln werden heute noch von Hand aussortiert?', o: ['Unförmige und grüne', 'Große und runde', 'Alle'], a: 0 },
    { id: 'kw17', mod: 'wissen', g: 'ernte', q: 'Früher wurden die Kartoffeln mit Maschinen geerntet.', rf: true, a: false, why: 'Früher mit großen Gabeln, heute mit Maschinen.' },
    // Kartoffelwörter
    { id: 'wo1', mod: 'woerter', g: 'woerter', q: 'Brat- + Kartoffel = ?', o: ['die Bratkartoffel', 'der Bratkartoffel', 'das Bratkartoffel'], a: 0 },
    { id: 'wo2', mod: 'woerter', g: 'woerter', q: 'Salz- + Kartoffel = ?', o: ['die Salzkartoffel', 'das Salzkartoffel', 'die Kartoffelsalz'], a: 0 },
    { id: 'wo3', mod: 'woerter', g: 'woerter', q: 'Saat- + Kartoffel = ?', o: ['die Saatkartoffel', 'der Saatkartoffel', 'die Kartoffelsaat'], a: 0 },
    { id: 'wo4', mod: 'woerter', g: 'woerter', q: 'Früh- + Kartoffel = ?', o: ['die Frühkartoffel', 'das Frühkartoffel', 'die Kartoffelfrüh'], a: 0 },
    { id: 'wo5', mod: 'woerter', g: 'woerter', q: 'Pell- + Kartoffel = ?', o: ['die Pellkartoffel', 'der Pellkartoffel', 'die Kartoffelpell'], a: 0 },
    { id: 'wo6', mod: 'woerter', g: 'woerter', q: 'Kartoffel + -chip = ?', o: ['der Kartoffelchip', 'die Kartoffelchip', 'die Chipkartoffel'], a: 0 },
    { id: 'wo7', mod: 'woerter', g: 'woerter', q: 'Kartoffel + -suppe = ?', o: ['die Kartoffelsuppe', 'der Kartoffelsuppe', 'das Kartoffelsuppe'], a: 0 },
    { id: 'wo8', mod: 'woerter', g: 'woerter', q: 'Kartoffel + -schale = ?', o: ['die Kartoffelschale', 'das Kartoffelschale', 'der Kartoffelschale'], a: 0 },
    { id: 'wo9', mod: 'woerter', g: 'woerter', q: 'Kartoffel + -salat = ?', o: ['der Kartoffelsalat', 'die Kartoffelsalat', 'das Kartoffelsalat'], a: 0 },
    { id: 'wo10', mod: 'woerter', g: 'woerter', q: 'Kartoffel + -brei = ?', o: ['der Kartoffelbrei', 'die Kartoffelbrei', 'das Kartoffelbrei'], a: 0 },
    { id: 'wo11', mod: 'woerter', g: 'woerter', q: 'Kartoffel + -mehl = ?', o: ['das Kartoffelmehl', 'der Kartoffelmehl', 'die Kartoffelmehl'], a: 0 },
    { id: 'wo12', mod: 'woerter', g: 'woerter', q: 'Welcher Artikel passt: ___ Kartoffelsalat', o: ['der', 'die', 'das'], a: 0 },
    { id: 'wo13', mod: 'woerter', g: 'woerter', q: 'Welcher Artikel passt: ___ Kartoffelmehl', o: ['das', 'der', 'die'], a: 0 },
    { id: 'wo14', mod: 'woerter', g: 'woerter', q: 'Welcher Artikel passt: ___ Kartoffelbrei', o: ['der', 'die', 'das'], a: 0 },
    { id: 'wo15', mod: 'woerter', g: 'woerter', q: 'Welcher Artikel passt: ___ Bratkartoffel', o: ['die', 'der', 'das'], a: 0 },
    // Märchen: Adjektive + Richtig/Falsch
    { id: 'ma1', mod: 'maerchen', g: 'maerchen', q: 'Wer ist klug?', o: ['Der Bauer', 'Der Teufel'], a: 0 },
    { id: 'ma2', mod: 'maerchen', g: 'maerchen', q: 'Wer ist verschmitzt?', o: ['Der Bauer', 'Der Teufel'], a: 0 },
    { id: 'ma3', mod: 'maerchen', g: 'maerchen', q: 'Wer ist listig?', o: ['Der Bauer', 'Der Teufel'], a: 0 },
    { id: 'ma4', mod: 'maerchen', g: 'maerchen', q: 'Wer ist schwarz?', o: ['Der Bauer', 'Der Teufel'], a: 1 },
    { id: 'ma5', mod: 'maerchen', g: 'maerchen', q: 'Wer ist am Ende wütend?', o: ['Der Bauer', 'Der Teufel'], a: 1 },
    { id: 'ma6', mod: 'maerchen', g: 'maerchen', q: 'Wer ist vergnügt?', o: ['Der Bauer', 'Der Teufel'], a: 0 },
    { id: 'ma7', mod: 'maerchen', g: 'maerchen', q: 'Wer sitzt auf feurigen Kohlen?', o: ['Der Bauer', 'Der Teufel'], a: 1 },
    { id: 'ma8', mod: 'maerchen', g: 'maerchen', q: 'Der Teufel sitzt auf einem Schatz.', rf: true, a: true },
    { id: 'ma9', mod: 'maerchen', g: 'maerchen', q: 'Der Teufel will drei Jahre lang die ganze Ernte.', rf: true, a: false, why: 'Zwei Jahre lang die Hälfte.' },
    { id: 'ma10', mod: 'maerchen', g: 'maerchen', q: 'Im ersten Jahr pflanzt der Bauer Kartoffeln, der Teufel bekommt nur welke Blätter.', rf: true, a: true },
    { id: 'ma11', mod: 'maerchen', g: 'maerchen', q: 'Im zweiten Jahr sät der Bauer Weizen.', rf: true, a: true },
    { id: 'ma12', mod: 'maerchen', g: 'maerchen', q: 'Am Ende bekommt der Teufel den Schatz.', rf: true, a: false, why: 'Der Bauer holt sich den Schatz.' },
    { id: 'ma13', mod: 'maerchen', g: 'maerchen', q: 'Was bekommt der Teufel im zweiten Jahr?', o: ['Nur die Stoppeln', 'Die vollen Halme', 'Die Kartoffeln'], a: 0 },
    { id: 'ma14', mod: 'maerchen', g: 'maerchen', q: 'Wohin fährt der Teufel am Ende?', o: ['In eine Felsenschlucht', 'In die Kirche', 'Nach Peru'], a: 0 },
    { id: 'ma15', mod: 'maerchen', g: 'maerchen', q: 'Wer hat das Märchen vom Bauern und dem Teufel aufgeschrieben?', o: ['Die Brüder Grimm', 'Martin Luther', 'Josef Guggenmos'], a: 0 },
  );
  const K_MODULES = {
    parts: { name: 'Teile benennen', icon: '🥔', maxTier: 2, worldCap: [2, 2], dmg: 12 },
    ground: { name: 'Oben oder unten', icon: '🌱', maxTier: 1, worldCap: [1, 1], dmg: 10 },
    grow: { name: 'Wachstum ordnen', icon: '🔢', maxTier: 1, worldCap: [1, 1], dmg: 16 },
    ltk: { name: 'Lückentext', icon: '✏️', maxTier: 1, worldCap: [1, 1], dmg: 12 },
    wissen: { name: 'Kartoffelwissen', icon: '🪲', maxTier: 1, worldCap: [1, 1], dmg: 12 },
    woerter: { name: 'Kartoffelwörter', icon: '🔤', maxTier: 1, worldCap: [1, 1], dmg: 10 },
    maerchen: { name: 'Bauer und Teufel', icon: '😈', maxTier: 1, worldCap: [1, 1], dmg: 14 },
  };
  const K_TUT = {
    'parts:1': { title: 'Teile benennen', steps: ['Ein Teil der Pflanze leuchtet gelb.', 'Unter der Erde: Wurzeln, Saatkartoffel, Ausläufer, Knollen. Über der Erde: Stängel, Blätter, Blüten, Beeren.', 'Tippe auf den richtigen Namen.'] },
    'parts:2': { title: 'Teile finden', steps: ['Jetzt andersherum: Oben steht ein Name.', 'Tippe direkt auf diesen Teil in der Pflanze.', 'Schau genau: Was ist über, was unter der Erde?'] },
    'ground:1': { title: 'Oben oder unten', steps: ['Die Kartoffelpflanze wächst halb unter, halb über der Erde.', 'Unten: Wurzeln, Saatkartoffel, Ausläufer und Knollen.', 'Oben: Stängel, Blätter, Blüten und Beeren.'] },
    'grow:1': { title: 'Wachstum ordnen', steps: ['Die Schritte sind durcheinander.', 'Tippe sie in der richtigen Reihenfolge an: Es beginnt im Frühjahr mit der Saatkartoffel.', 'Es endet im Herbst mit der Ernte.'] },
    'ltk:1': { title: 'Lückentext', steps: ['Im Satz fehlt ein Wort (___).', 'Die Sätze stammen aus deinen Arbeitsblättern „Woher kommt die Kartoffel?“ und „Die Kartoffelernte früher und heute“.', 'Tippe auf das Wort, das passt.'] },
    'wissen:1': { title: 'Kartoffelwissen', steps: ['Fragen zur Pflanze, zum Wachsen, zum Kartoffelkäfer, zur Herkunft und zur Ernte.', 'Manchmal musst du „Richtig“ oder „Falsch“ wählen, manchmal eine von drei Antworten.', 'Lies genau – oft ist nur ein kleines Wort vertauscht.'] },
    'woerter:1': { title: 'Kartoffelwörter', steps: ['Zwei Wortteile ergeben ein zusammengesetztes Wort: Brat- + Kartoffel = Bratkartoffel.', 'Der Artikel richtet sich nach dem letzten Teil: die Kartoffel → die Bratkartoffel, der Salat → der Kartoffelsalat.', 'Tippe auf das richtige Wort mit Artikel.'] },
    'maerchen:1': { title: 'Der Bauer und der Teufel', steps: ['Fragen zur Geschichte – erzählt nach einem Märchen der Brüder Grimm.', 'Welche Adjektive passen zum Bauern (klug, listig, verschmitzt, vergnügt) und welche zum Teufel (schwarz, wütend)?', 'Und: Was passiert im ersten Jahr, was im zweiten?'] },
    'story:1': { title: 'Märchen ordnen', steps: ['Die Teile der Geschichte sind durcheinander.', 'Tippe sie in der richtigen Reihenfolge an.', 'Erst Kartoffeln, dann Weizen, zum Schluss der Schatz.'] },
  };
  const K_STARTERS = [
    { id: 'knolli', type: 'pflanze', shape: 'potato', names: ['Knolli', 'Werkstatt-Knolli', 'Werkstatt-Knolli'], hp: 70, desc: 'Eine Kartoffel mit Keimen am Kopf. Will wissen, wie sie selbst gewachsen ist.', perk: 'heal',
      attacks: [{ name: 'Knollenstoß', mod: 'parts' }, { name: 'Erdblick', mod: 'ground' }, { name: 'Wachstumsschub', mod: 'grow' }, { name: 'Wörterbrei', mod: 'woerter' }] },
  ];
  const K_WORLD_ATTACKS = { 2: [{ name: 'Lückenfüller', mod: 'ltk' }, { name: 'Käferwissen', mod: 'wissen' }, { name: 'Rezeptbuch', mod: 'woerter' }, { name: 'Teufelstrick', mod: 'maerchen' }] };
  const K_EXTRA = { parts: 'Sprossenschlag', ground: 'Bodenblick', grow: 'Erntezeit', ltk: 'Satzschleuder', wissen: 'Forscherblick', woerter: 'Wortkette', maerchen: 'Bauernlist' };
  const K_ENEMIES = {
    1: {
      normal: [
        { name: 'Blattlaus', type: 'pflanze', shape: 'blob', hp: 24, atk: 3 },
        { name: 'Drahtwurm', type: 'normal', shape: 'newt', hp: 28, atk: 4 },
        { name: 'Wühlmaus', type: 'normal', shape: 'fox', hp: 30, atk: 4 },
        { name: 'Fäulewolke', type: 'wasser', shape: 'ghost', hp: 26, atk: 3 },
      ],
      elite: { name: 'Käferlarve', type: 'normal', shape: 'newt', hp: 45, atk: 5 },
      boss: { name: 'Kartoffelkäfer', acc: 'den Kartoffelkäfer', type: 'normal', shape: 'beetle', hp: 70, atk: 6, boss: true },
    },
    2: {
      normal: [
        { name: 'Blattfresser', type: 'pflanze', shape: 'beetle', hp: 42, atk: 5 },
        { name: 'Hagelwolke', type: 'wasser', shape: 'ghost', hp: 40, atk: 6 },
        { name: 'Ackerteufel', type: 'feuer', shape: 'flame', hp: 44, atk: 5 },
        { name: 'Eierhaufen', type: 'normal', shape: 'blob', hp: 38, atk: 6 },
      ],
      elite: { name: 'Riesenlarve', type: 'normal', shape: 'newt', hp: 70, atk: 8 },
      boss: { name: 'Käferkönigin', acc: 'die Käferkönigin', type: 'normal', shape: 'beetle', hp: 110, atk: 9, boss: true },
    },
  };
  const K_MOVES = ['Käferbiss', 'Blattfraß', 'Erdklumpen', 'Hagelschauer', 'Wühlattacke', 'Matschwurf'];
  const K_EVENTS = [
    { title: 'Der Bauer', text: 'Ein Bauer fragt dich etwas über seine Kartoffeln. Wenn du es weißt, schenkt er dir einen Trank.', opts: [{ label: 'Antworten', task: 'any', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Das Kartoffelfeld', text: 'Du findest ein Feld voller Pflanzen. Wer sich auskennt, erntet eine Belohnung.', opts: [{ label: 'Ernten', task: 'any', win: { xp: 20, item: 'trank' }, lose: { xp: 5 } }, { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } }] },
    { title: 'Die Gärtnerin', text: 'Eine Gärtnerin zeigt dir ihre Kartoffelpflanze und stellt eine Frage zu den Pflanzenteilen.', opts: [{ label: 'Antworten', task: 'any', g: 'teile', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Ablehnen', effect: {} }] },
    { title: 'Die Kartoffelküche', text: 'In der Küche brutzeln Kartoffelpuffer. Die Köchin gibt dir eine Chilischote aus ihrem Gewürzregal, wenn du ihre Frage beantwortest.', opts: [{ label: 'Antworten', task: 'any', win: { item: 'keks' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Der Gartenzwerg', text: 'Ein Gartenzwerg kennt eine Eselsbrücke. „Weißt du etwas über Kartoffeln? Dann verrate ich sie dir.“', opts: [{ label: 'Antworten', task: 'any', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Der Regen', text: 'Es regnet. Gut für die Pflanzen, und du kannst dich unterstellen und ausruhen.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
    { title: 'Das spanische Schiff', text: 'Ein Schiff aus Peru legt an. Der Kapitän stellt dir eine Frage über die Reise der Kartoffel.', opts: [{ label: 'Antworten', task: 'ltk', g: 'herkunft', win: { item: 'grosstrank' }, lose: { hp: -8 } }, { label: 'Weitergehen', effect: {} }] },
  ];

  /* ---------- ETHIK: Das Kirchenjahr ---------- */
  const KJ_NOTES = {
    busstag: { title: 'Buß- und Bettag', lines: ['Ein evangelischer Feiertag im November, immer an einem Mittwoch.', 'In Sachsen ist er ein Feiertag: Die Schule hat geschlossen.', 'Buße tun heißt: über eigene Fehler nachdenken, sie bereuen und es besser machen.', 'Christen beten an diesem Tag und bitten Gott um Vergebung.', 'Jeder Mensch kann an diesem Tag über sein Verhalten nachdenken und sich entschuldigen.'] },
    konflikt: { title: 'Konflikte', lines: ['Ein Konflikt ist ein Streit oder ein Problem, für das man eine Lösung sucht.', 'Äußerer Konflikt: Ich streite mit anderen Menschen, zum Beispiel um ein Spielzeug.', 'Innerer Konflikt: Ich bin mit mir selbst uneins. Ich will zwei Dinge, die nicht zusammenpassen, und muss mich entscheiden.', 'Konflikte kann man lösen: miteinander reden, zuhören, sich entschuldigen, gemeinsam eine Lösung suchen.'] },
    kreuz: { title: 'Das Kreuz', lines: ['Das Kreuz ist das wichtigste Zeichen (Symbol) der Christen.', 'Jesus ist am Kreuz gestorben.', 'Christen glauben, dass Jesus von den Toten auferstanden ist. Daran denken sie an Ostern.', 'Deshalb ist das Kreuz für Christen auch ein Zeichen der Hoffnung.', 'Kreuze gibt es auf Kirchtürmen, in Kirchen, auf Friedhöfen und als Kette am Hals.'] },
    kirche: { title: 'Die Kirche', lines: ['Die Kirche ist ein Gotteshaus. Hier feiern Christen Gottesdienst: Sie beten, singen und hören Texte aus der Bibel.', 'Im Kirchturm hängen die Glocken. Sie rufen zum Gottesdienst.', 'Der lange Hauptraum mit den Bänken heißt Kirchenschiff.', 'Der Altar ist der wichtigste Tisch vorn in der Kirche. Dort stehen oft Kerzen und ein Kreuz.', 'Von der Kanzel aus wird gepredigt. Am Taufbecken wird getauft. Die Orgel ist das große Musikinstrument der Kirche.'] },
    bibel: { title: 'Die Bibel', lines: ['Die Bibel ist das heilige Buch der Christen.', 'Das Wort Bibel kommt aus dem Griechischen und heißt „Bücher“: Sie ist eine Sammlung vieler Texte.', 'Viele Menschen haben über mehr als 1000 Jahre daran geschrieben.', 'Das Alte Testament erzählt von der Zeit vor Jesus. Seine Texte sind auch den Juden heilig.', 'Das Neue Testament erzählt von Jesus. Vier Evangelien berichten von seinem Leben: Matthäus, Markus, Lukas und Johannes.', 'Die Bibel ist ein Kulturgut: Sie wurde in sehr viele Sprachen übersetzt, und viele Bilder, Lieder und Redewendungen stammen aus ihr.'] },
    gebote: { title: 'Die Zehn Gebote', lines: ['Die Zehn Gebote stehen im Alten Testament.', 'Die Bibel erzählt: Gott gab sie Mose auf dem Berg Sinai, geschrieben auf zwei Steintafeln.', 'Sie sind Regeln für ein gutes Leben mit Gott und mit den Mitmenschen.', '1. nur einen Gott haben · 2. Gottes Namen achten · 3. den Feiertag heiligen · 4. Vater und Mutter ehren · 5. nicht töten', '6. die Ehe achten · 7. nicht stehlen · 8. nicht lügen · 9. und 10. nicht haben wollen, was anderen gehört', 'Manche Kirchen zählen die Gebote etwas anders.'] },
    advent: { title: 'Advent', lines: ['Advent heißt „Ankunft“. Christen warten auf das Fest der Geburt von Jesus.', 'Die Adventszeit hat vier Sonntage vor Weihnachten.', 'Am Adventskranz brennt jeden Sonntag eine Kerze mehr.', 'Mit dem 1. Advent beginnt das neue Kirchenjahr.'] },
    weihnachten: { title: 'Weihnachten', lines: ['An Weihnachten feiern Christen die Geburt von Jesus: am 24. Dezember (Heiligabend) und am 25. und 26. Dezember.', 'Die Weihnachtsgeschichte mit den Hirten steht im Lukas-Evangelium.', 'Kaiser Augustus befiehlt, alle Menschen zu zählen. Maria und Josef ziehen von Nazareth nach Bethlehem.', 'Dort wird Jesus geboren. In der Herberge ist kein Platz, darum liegt er in einer Futterkrippe.', 'Ein Engel verkündet den Hirten auf dem Feld die Geburt. Sie gehen zur Krippe und erzählen danach allen davon.'] },
    ethik: { title: 'Ethik und Religion', lines: ['Ethik: Wir denken darüber nach, was gut und richtig ist und wie Menschen gut zusammenleben.', 'Religion: Menschen glauben an Gott oder an mehrere Götter. Sie beten, feiern Feste und leben nach den Regeln ihres Glaubens.', 'Christentum, Judentum und Islam sind Religionen.', 'Im Fach Ethik denken Kinder gemeinsam nach, ob sie an Gott glauben oder nicht.'] },
  };
  // Zählung wie in Luthers Kleinem Katechismus (auch katholisch üblich)
  const KJ_GEBOTE = [
    { id: 'g1', text: 'Du sollst keine anderen Götter haben neben Gott.' },
    { id: 'g2', text: 'Du sollst den Namen Gottes nicht missbrauchen.' },
    { id: 'g3', text: 'Du sollst den Feiertag heiligen.' },
    { id: 'g4', text: 'Du sollst Vater und Mutter ehren.' },
    { id: 'g5', text: 'Du sollst nicht töten.' },
    { id: 'g6', text: 'Du sollst die Ehe nicht brechen.' },
    { id: 'g7', text: 'Du sollst nicht stehlen.' },
    { id: 'g8', text: 'Du sollst nicht lügen.' },
    { id: 'g9', text: 'Du sollst nicht das Haus deines Nächsten haben wollen.' },
    { id: 'g10', text: 'Du sollst nichts haben wollen, was sonst deinem Nächsten gehört.' },
  ];
  const KJ_STORY = [
    { id: 'w1', text: 'Kaiser Augustus befiehlt: Alle Menschen sollen gezählt werden.' },
    { id: 'w2', text: 'Maria und Josef ziehen von Nazareth nach Bethlehem.' },
    { id: 'w3', text: 'Jesus wird geboren. In der Herberge ist kein Platz, darum liegt er in einer Futterkrippe.' },
    { id: 'w4', text: 'Ein Engel verkündet den Hirten auf dem Feld die Geburt.' },
    { id: 'w5', text: 'Die Hirten gehen nach Bethlehem und finden das Kind in der Krippe.' },
    { id: 'w6', text: 'Die Hirten erzählen allen, was sie gehört und gesehen haben.' },
  ];
  const INNER = 'Ein innerer Konflikt', OUTER = 'Ein äußerer Konflikt';
  const KJ_POOL = [
    // Richtig / Falsch
    { id: 'kjrf1', mod: 'rf', g: 'busstag', q: 'Der Buß- und Bettag ist in Sachsen ein Feiertag.', a: true },
    { id: 'kjrf2', mod: 'rf', g: 'busstag', q: 'Der Buß- und Bettag ist immer an einem Sonntag.', a: false, why: 'Er ist immer an einem Mittwoch im November.' },
    { id: 'kjrf3', mod: 'rf', g: 'busstag', q: 'Buße tun heißt: über eigene Fehler nachdenken und es besser machen.', a: true },
    { id: 'kjrf4', mod: 'rf', g: 'konflikt', q: 'Bei einem inneren Konflikt streite ich mit einem anderen Kind.', a: false, why: 'Das ist ein äußerer Konflikt. Beim inneren Konflikt bin ich mit mir selbst uneins.' },
    { id: 'kjrf5', mod: 'rf', g: 'konflikt', q: 'Konflikte kann man lösen, zum Beispiel durch Reden und Zuhören.', a: true },
    { id: 'kjrf6', mod: 'rf', g: 'kreuz', q: 'Das Kreuz ist das wichtigste Zeichen der Christen.', a: true },
    { id: 'kjrf7', mod: 'rf', g: 'kreuz', q: 'Christen glauben, dass Jesus von den Toten auferstanden ist.', a: true },
    { id: 'kjrf8', mod: 'rf', g: 'kreuz', q: 'Kreuze gibt es nur in Kirchen.', a: false, why: 'Auch auf Kirchtürmen, auf Friedhöfen und als Kette am Hals.' },
    { id: 'kjrf9', mod: 'rf', g: 'kirche', q: 'Im Kirchturm hängen oft Glocken.', a: true },
    { id: 'kjrf10', mod: 'rf', g: 'kirche', q: 'Die Orgel ist ein Musikinstrument in der Kirche.', a: true },
    { id: 'kjrf11', mod: 'rf', g: 'kirche', q: 'Von der Kanzel aus wird getauft.', a: false, why: 'Von der Kanzel aus wird gepredigt. Getauft wird am Taufbecken.' },
    { id: 'kjrf12', mod: 'rf', g: 'bibel', q: 'Die Bibel ist ein einziger Text, den ein einziger Mensch geschrieben hat.', a: false, why: 'Sie ist eine Sammlung vieler Texte von vielen Menschen.' },
    { id: 'kjrf13', mod: 'rf', g: 'bibel', q: 'Die Bibel hat zwei Teile: das Alte und das Neue Testament.', a: true },
    { id: 'kjrf14', mod: 'rf', g: 'bibel', q: 'Das Neue Testament erzählt von Jesus.', a: true },
    { id: 'kjrf15', mod: 'rf', g: 'bibel', q: 'Die Bibel gibt es nur auf Deutsch.', a: false, why: 'Sie wurde in sehr viele Sprachen übersetzt.' },
    { id: 'kjrf16', mod: 'rf', g: 'gebote', q: 'Die Zehn Gebote stehen im Neuen Testament.', a: false, why: 'Sie stehen im Alten Testament.' },
    { id: 'kjrf17', mod: 'rf', g: 'gebote', q: 'Die Bibel erzählt, dass Mose die Zehn Gebote auf Steintafeln bekam.', a: true },
    { id: 'kjrf18', mod: 'rf', g: 'gebote', q: '„Du sollst nicht stehlen“ ist eines der Zehn Gebote.', a: true },
    { id: 'kjrf19', mod: 'rf', g: 'advent', q: 'Advent heißt „Ankunft“.', a: true },
    { id: 'kjrf20', mod: 'rf', g: 'advent', q: 'Die Adventszeit hat vier Sonntage.', a: true },
    { id: 'kjrf21', mod: 'rf', g: 'advent', q: 'Mit dem 1. Advent beginnt das neue Kirchenjahr.', a: true },
    { id: 'kjrf22', mod: 'rf', g: 'weihnachten', q: 'In der Weihnachtsgeschichte nach Lukas bringt ein Engel den Hirten die Nachricht von der Geburt.', a: true },
    { id: 'kjrf23', mod: 'rf', g: 'weihnachten', q: 'Nach der Weihnachtsgeschichte wurde Jesus in Nazareth geboren.', a: false, why: 'Er wurde in Bethlehem geboren.' },
    { id: 'kjrf24', mod: 'rf', g: 'weihnachten', q: 'An Weihnachten feiern Christen die Geburt von Jesus.', a: true },
    { id: 'kjrf25', mod: 'rf', g: 'ethik', q: 'Religion und Ethik bedeuten genau dasselbe.', a: false, why: 'Ethik fragt, was gut und richtig ist. Religion ist der Glaube an Gott oder Götter.' },
    { id: 'kjrf26', mod: 'rf', g: 'ethik', q: 'Im Fach Ethik denkt man darüber nach, wie Menschen gut zusammenleben.', a: true },
    // Wähle aus
    { id: 'kjmc1', mod: 'mc', g: 'busstag', q: 'In welchem Monat ist der Buß- und Bettag?', o: ['November', 'Dezember', 'Mai'], a: 0 },
    { id: 'kjmc2', mod: 'mc', g: 'busstag', q: 'An welchem Wochentag ist der Buß- und Bettag?', o: ['Mittwoch', 'Sonntag', 'Freitag'], a: 0 },
    { id: 'kjmc3', mod: 'mc', g: 'busstag', q: 'Was passt zum Buß- und Bettag?', o: ['Über eigene Fehler nachdenken und sich entschuldigen', 'Geschenke auspacken', 'Ostereier suchen'], a: 0 },
    { id: 'kjmc4', mod: 'mc', g: 'konflikt', q: 'Ben und Ali wollen beide mit demselben Ball spielen und streiten sich. Was ist das?', o: [OUTER, INNER], a: 0 },
    { id: 'kjmc5', mod: 'mc', g: 'konflikt', q: 'Mia ist zu einem Geburtstag eingeladen. Zur selben Zeit hat sie ein Fußballspiel. Sie will zu beidem. Was ist das?', o: [INNER, OUTER], a: 0 },
    { id: 'kjmc6', mod: 'mc', g: 'konflikt', q: 'Paul hat eine Vase zerbrochen. Soll er es sagen oder schweigen? Er weiß es nicht. Was ist das?', o: [INNER, OUTER], a: 0 },
    { id: 'kjmc7', mod: 'mc', g: 'konflikt', q: 'Zwei Geschwister streiten, wer die Fernbedienung bekommt. Was ist das?', o: [OUTER, INNER], a: 0 },
    { id: 'kjmc8', mod: 'mc', g: 'konflikt', q: 'Lea möchte sich Schokolade kaufen, will aber auch ihr Taschengeld sparen. Was ist das?', o: [INNER, OUTER], a: 0 },
    { id: 'kjmc9', mod: 'mc', g: 'konflikt', q: 'Die Klasse kann sich nicht einigen, wohin der Ausflug geht. Alle reden durcheinander. Was ist das?', o: [OUTER, INNER], a: 0 },
    { id: 'kjmc10', mod: 'mc', g: 'kreuz', q: 'Wofür ist das Kreuz für Christen ein Zeichen?', o: ['Für Jesus und die Hoffnung auf neues Leben', 'Für ein Weihnachtsgeschenk', 'Für den Sommeranfang'], a: 0 },
    { id: 'kjmc11', mod: 'mc', g: 'kreuz', q: 'Wo sieht man oft ein Kreuz?', o: ['Auf dem Kirchturm', 'Auf dem Ortsschild', 'Auf dem Fußball'], a: 0 },
    { id: 'kjmc12', mod: 'mc', g: 'kirche', q: 'Wozu läuten die Kirchenglocken?', o: ['Sie rufen die Menschen zum Gottesdienst', 'Sie zeigen an, dass es regnet', 'Sie beenden die Schulpause'], a: 0 },
    { id: 'kjmc13', mod: 'mc', g: 'kirche', q: 'Wo wird in der Kirche getauft?', o: ['Am Taufbecken', 'An der Orgel', 'Im Kirchturm'], a: 0 },
    { id: 'kjmc14', mod: 'mc', g: 'kirche', q: 'Wie heißt der lange Hauptraum der Kirche mit den Bänken?', o: ['Kirchenschiff', 'Kirchturm', 'Kanzel'], a: 0 },
    { id: 'kjmc15', mod: 'mc', g: 'bibel', q: 'Welche zwei Teile hat die Bibel?', o: ['Altes und Neues Testament', 'Anfang und Ende', 'Lieder und Gebete'], a: 0 },
    { id: 'kjmc16', mod: 'mc', g: 'bibel', q: 'Was bedeutet das Wort „Bibel“?', o: ['Bücher', 'Kirche', 'Kreuz'], a: 0 },
    { id: 'kjmc17', mod: 'mc', g: 'bibel', q: 'Welcher Teil der Bibel erzählt von der Zeit vor Jesus?', o: ['Das Alte Testament', 'Das Neue Testament', 'Das Lukas-Evangelium'], a: 0 },
    { id: 'kjmc18', mod: 'mc', g: 'bibel', q: 'Wer ist berühmt dafür, die Bibel ins Deutsche übersetzt zu haben?', o: ['Martin Luther', 'Mose', 'Kaiser Augustus'], a: 0 },
    { id: 'kjmc19', mod: 'mc', g: 'gebote', q: 'Auf welchem Berg bekam Mose nach der Bibel die Zehn Gebote?', o: ['Sinai', 'Zugspitze', 'Brocken'], a: 0 },
    { id: 'kjmc20', mod: 'mc', g: 'gebote', q: 'Tim nimmt heimlich den Radiergummi seiner Nachbarin. Welches Gebot passt?', o: ['Du sollst nicht stehlen.', 'Du sollst den Feiertag heiligen.', 'Du sollst nicht töten.'], a: 0 },
    { id: 'kjmc21', mod: 'mc', g: 'gebote', q: 'Jonas behauptet, Lisa habe die Tafel bemalt. Das stimmt aber nicht. Welches Gebot passt?', o: ['Du sollst nicht lügen.', 'Du sollst nicht stehlen.', 'Du sollst den Feiertag heiligen.'], a: 0 },
    { id: 'kjmc22', mod: 'mc', g: 'gebote', q: 'Welches Gebot ist das vierte?', o: ['Du sollst Vater und Mutter ehren.', 'Du sollst nicht stehlen.', 'Du sollst nicht töten.'], a: 0 },
    { id: 'kjmc23', mod: 'mc', g: 'gebote', q: 'Wie viele Gebote gab Gott Mose nach der Bibel?', o: ['10', '12', '7'], a: 0 },
    { id: 'kjmc24', mod: 'mc', g: 'gebote', q: 'Finn wünscht sich das neue Fahrrad seines Freundes so sehr, dass er neidisch wird. Welches Gebot passt?', o: ['Du sollst nichts haben wollen, was deinem Nächsten gehört.', 'Du sollst den Feiertag heiligen.', 'Du sollst nicht lügen.'], a: 0 },
    { id: 'kjmc25', mod: 'mc', g: 'gebote', q: 'Wofür sind die Zehn Gebote da?', o: ['Als Regeln für ein gutes Leben mit Gott und den Mitmenschen', 'Als Rezept für ein Festessen', 'Als Spielregeln für ein Brettspiel'], a: 0 },
    { id: 'kjmc26', mod: 'mc', g: 'advent', q: 'Wie viele Kerzen hat ein Adventskranz meistens?', o: ['4', '7', '24'], a: 0 },
    { id: 'kjmc27', mod: 'mc', g: 'advent', q: 'Worauf warten Christen in der Adventszeit?', o: ['Auf Weihnachten, das Fest der Geburt von Jesus', 'Auf Ostern', 'Auf die Sommerferien'], a: 0 },
    { id: 'kjmc28', mod: 'mc', g: 'weihnachten', q: 'Wo wurde Jesus nach der Weihnachtsgeschichte geboren?', o: ['In Bethlehem', 'In Nazareth', 'In Wittenberg'], a: 0 },
    { id: 'kjmc29', mod: 'mc', g: 'weihnachten', q: 'Wer erzählt in der Bibel die Weihnachtsgeschichte mit den Hirten?', o: ['Der Evangelist Lukas', 'Mose', 'Martin Luther'], a: 0 },
    { id: 'kjmc30', mod: 'mc', g: 'weihnachten', q: 'Wohin legte Maria das neugeborene Kind?', o: ['In eine Futterkrippe', 'In ein Himmelbett', 'In einen Korb am Fluss'], a: 0 },
    { id: 'kjmc31', mod: 'mc', g: 'weihnachten', q: 'Wer befahl, dass alle Menschen gezählt werden sollten?', o: ['Kaiser Augustus', 'Mose', 'Martin Luther'], a: 0 },
    { id: 'kjmc32', mod: 'mc', g: 'weihnachten', q: 'Wem verkündete der Engel auf dem Feld die Geburt von Jesus?', o: ['Den Hirten', 'Den Fischern', 'Den Soldaten'], a: 0 },
    { id: 'kjmc33', mod: 'mc', g: 'ethik', q: 'Welche Frage ist eine Frage der Ethik?', o: ['Wie verhalte ich mich gerecht?', 'Wie viel ist 7 mal 8?', 'Wie hoch ist der Kirchturm?'], a: 0 },
    { id: 'kjmc34', mod: 'mc', g: 'ethik', q: 'Was gehört zu einer Religion?', o: ['Der Glaube an Gott oder Götter, Gebete und Feste', 'Nur das Rechnen mit großen Zahlen', 'Nur das Turnen in der Halle'], a: 0 },
    // Lückentext
    { id: 'kjlt1', mod: 'lt', g: 'busstag', q: 'Der Buß- und Bettag ist immer an einem ___ im November.', o: ['Mittwoch', 'Sonntag', 'Montag'], a: 0 },
    { id: 'kjlt2', mod: 'lt', g: 'busstag', q: 'Buße tun heißt: Fehler einsehen, sie bereuen und es ___ machen.', o: ['besser', 'schneller', 'heimlich'], a: 0 },
    { id: 'kjlt3', mod: 'lt', g: 'konflikt', q: 'Streite ich mit anderen, ist das ein ___ Konflikt.', o: ['äußerer', 'innerer', 'stiller'], a: 0 },
    { id: 'kjlt4', mod: 'lt', g: 'konflikt', q: 'Kann ich mich zwischen zwei Wünschen nicht entscheiden, ist das ein ___ Konflikt.', o: ['innerer', 'äußerer', 'lauter'], a: 0 },
    { id: 'kjlt5', mod: 'lt', g: 'kreuz', q: 'Das Kreuz ist das wichtigste ___ der Christen.', o: ['Zeichen', 'Lied', 'Fest'], a: 0 },
    { id: 'kjlt6', mod: 'lt', g: 'kreuz', q: 'Christen glauben, dass Jesus von den Toten ___ ist.', o: ['auferstanden', 'geflohen', 'eingeschlafen'], a: 0 },
    { id: 'kjlt7', mod: 'lt', g: 'kirche', q: 'Im ___ hängen die Glocken.', o: ['Kirchturm', 'Kirchenschiff', 'Taufbecken'], a: 0 },
    { id: 'kjlt8', mod: 'lt', g: 'kirche', q: 'Von der ___ aus wird im Gottesdienst gepredigt.', o: ['Kanzel', 'Orgel', 'Glocke'], a: 0 },
    { id: 'kjlt9', mod: 'lt', g: 'bibel', q: 'Das Alte und das Neue ___ sind die zwei Teile der Bibel.', o: ['Testament', 'Gebot', 'Gesangbuch'], a: 0 },
    { id: 'kjlt10', mod: 'lt', g: 'bibel', q: 'Die Bibel ist eine ___ vieler Texte.', o: ['Sammlung', 'Rechnung', 'Zeichnung'], a: 0 },
    { id: 'kjlt11', mod: 'lt', g: 'gebote', q: 'Die Bibel erzählt: Mose bekam die Zehn Gebote auf zwei ___.', o: ['Steintafeln', 'Holzbrettern', 'Papierrollen'], a: 0 },
    { id: 'kjlt12', mod: 'lt', g: 'gebote', q: 'Das siebte Gebot heißt: Du sollst nicht ___.', o: ['stehlen', 'singen', 'spielen'], a: 0 },
    { id: 'kjlt13', mod: 'lt', g: 'gebote', q: 'Das fünfte Gebot heißt: Du sollst nicht ___.', o: ['töten', 'lachen', 'schlafen'], a: 0 },
    { id: 'kjlt14', mod: 'lt', g: 'advent', q: 'Am Adventskranz brennt jeden Sonntag eine ___ mehr.', o: ['Kerze', 'Lampe', 'Fackel'], a: 0 },
    { id: 'kjlt15', mod: 'lt', g: 'weihnachten', q: 'Maria und Josef zogen von Nazareth nach ___.', o: ['Bethlehem', 'Wittenberg', 'Rom'], a: 0 },
    { id: 'kjlt16', mod: 'lt', g: 'weihnachten', q: 'Der 24. Dezember heißt ___.', o: ['Heiligabend', 'Ostersonntag', 'Pfingsten'], a: 0 },
    { id: 'kjlt17', mod: 'lt', g: 'ethik', q: 'Im Fach ___ denken wir darüber nach, was gut und richtig ist.', o: ['Ethik', 'Mathematik', 'Musik'], a: 0 },
    // Begriffe
    { id: 'kjdef1', mod: 'def', g: 'busstag', q: 'Was bedeutet „Buße tun“?', o: ['Fehler einsehen, sie bereuen und es besser machen', 'Eine Geldstrafe bezahlen', 'Ganz laut singen'], a: 0 },
    { id: 'kjdef2', mod: 'def', g: 'konflikt', q: 'Was ist ein innerer Konflikt?', o: ['Ich bin mit mir selbst uneins und muss mich entscheiden', 'Ich streite mit meinem Bruder', 'Zwei Mannschaften streiten um den Sieg'], a: 0 },
    { id: 'kjdef3', mod: 'def', g: 'konflikt', q: 'Was ist ein äußerer Konflikt?', o: ['Ein Streit mit anderen Menschen', 'Ein Streit mit mir selbst in meinem Kopf', 'Ein Gewitter draußen'], a: 0 },
    { id: 'kjdef4', mod: 'def', g: 'kreuz', q: 'Was ist ein Symbol?', o: ['Ein Zeichen, das für etwas Wichtiges steht', 'Ein Musikinstrument', 'Ein Feiertag'], a: 0 },
    { id: 'kjdef5', mod: 'def', g: 'kirche', q: 'Was ist der Altar?', o: ['Der wichtigste Tisch vorn in der Kirche', 'Der Turm mit den Glocken', 'Das große Musikinstrument'], a: 0 },
    { id: 'kjdef6', mod: 'def', g: 'kirche', q: 'Was ist ein Gottesdienst?', o: ['Eine Feier, bei der Christen beten, singen und Texte aus der Bibel hören', 'Eine Putzstunde in der Kirche', 'Eine Schulstunde in Mathe'], a: 0 },
    { id: 'kjdef7', mod: 'def', g: 'kirche', q: 'Was ist eine Predigt?', o: ['Eine Rede im Gottesdienst über einen Text aus der Bibel', 'Ein Lied auf der Orgel', 'Der Platz im Kirchturm'], a: 0 },
    { id: 'kjdef8', mod: 'def', g: 'bibel', q: 'Was ist die Bibel?', o: ['Das heilige Buch der Christen, eine Sammlung vieler Texte', 'Ein Wörterbuch', 'Ein Kalender für das Kirchenjahr'], a: 0 },
    { id: 'kjdef9', mod: 'def', g: 'bibel', q: 'Was bedeutet „Kulturgut“?', o: ['Etwas Wertvolles, das Menschen seit langer Zeit bewahren und weitergeben', 'Ein Bauernhof', 'Ein neues Spielzeug'], a: 0 },
    { id: 'kjdef10', mod: 'def', g: 'bibel', q: 'Was ist ein Evangelium?', o: ['Ein Buch im Neuen Testament, das vom Leben Jesu erzählt', 'Ein Lied in der Adventszeit', 'Ein Teil der Orgel'], a: 0 },
    { id: 'kjdef11', mod: 'def', g: 'gebote', q: 'Was sind die Zehn Gebote?', o: ['Regeln aus der Bibel für ein gutes Leben mit Gott und den Mitmenschen', 'Zehn Lieder für Weihnachten', 'Zehn Bücher des Neuen Testaments'], a: 0 },
    { id: 'kjdef12', mod: 'def', g: 'gebote', q: 'Was bedeutet „Vater und Mutter ehren“?', o: ['Die Eltern achten und gut zu ihnen sein', 'Den Eltern Geschenke kaufen', 'Für immer bei den Eltern wohnen'], a: 0 },
    { id: 'kjdef13', mod: 'def', g: 'advent', q: 'Was bedeutet „Advent“?', o: ['Ankunft', 'Abschied', 'Abendessen'], a: 0 },
    { id: 'kjdef14', mod: 'def', g: 'weihnachten', q: 'Was ist eine Krippe?', o: ['Ein Futtertrog für Tiere, in dem das Jesuskind lag', 'Ein Bett im Gasthaus', 'Ein Korb für Brot'], a: 0 },
    { id: 'kjdef15', mod: 'def', g: 'ethik', q: 'Was bedeutet „Religion“?', o: ['Der Glaube an Gott oder Götter, mit Gebeten, Festen und Regeln', 'Nachdenken über Zahlen', 'Ein Fach für Sport'], a: 0 },
    { id: 'kjdef16', mod: 'def', g: 'ethik', q: 'Was bedeutet „Ethik“?', o: ['Nachdenken darüber, was gut und richtig ist', 'Die Lehre von den Pflanzen', 'Ein Fest im Dezember'], a: 0 },
  ];
  const KJ_TUT = {
    'rf:1': { title: 'Richtig oder falsch', steps: ['Lies den Satz genau.', 'Stimmt er mit dem, was du über Kirche, Bibel und Kirchenjahr weißt? Dann „Richtig“.', 'Ist etwas vertauscht oder falsch? Dann „Falsch“.'] },
    'mc:1': { title: 'Wähle aus', steps: ['Lies die Frage. Nur eine Antwort stimmt.', 'Bei Konflikten fragst du: Streite ich mit anderen (äußerer Konflikt) oder bin ich mit mir selbst uneins (innerer Konflikt)?', 'Tippe auf die richtige Antwort.'] },
    'lt:1': { title: 'Lückentext', steps: ['Im Satz fehlt ein Wort (___).', 'Lies den Satz mit jedem Wort einmal durch.', 'Tippe auf das Wort, das passt.'] },
    'def:1': { title: 'Begriffe', steps: ['Hier geht es um wichtige Wörter wie Buße, Symbol, Altar, Evangelium, Advent, Ethik und Religion.', 'Überlege, was das Wort bedeutet.', 'Tippe auf die richtige Erklärung.'] },
    'ord:1': { title: 'Reihenfolge', steps: ['Vier Teile sind durcheinander: Zehn Gebote oder Weihnachtsgeschichte.', 'Tippe sie in der richtigen Reihenfolge an: Was kommt zuerst?', 'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.'] },
  };
  const KJ_STARTERS = [
    { id: 'kuesterin', type: 'normal', shape: 'kuesterin', names: ['Die Küsterin', 'Die Küsterin', 'Die Küsterin'], hp: 70, desc: 'Sie schließt die Kirche auf, läutet die Glocken und zündet die Kerzen an.', perk: 'none',
      attacks: [{ name: 'Schlüsselbund', mod: 'rf' }, { name: 'Glockenseil', mod: 'mc' }, { name: 'Kerzenlicht', mod: 'lt' }, { name: 'Gesangbuch', mod: 'def' }] },
  ];
  const KJ_EXTRA = { rf: 'Turmuhr', mc: 'Liedtafel', lt: 'Lesepult', def: 'Altarbibel', ord: 'Adventskranz' };
  const KJ_ENEMIES = {
    1: {
      normal: [
        { name: 'Der Streithahn', type: 'feuer', shape: 'fox', hp: 26, atk: 3 },
        { name: 'Der Neidhammel', type: 'pflanze', shape: 'blob', hp: 28, atk: 4 },
        { name: 'Der Novembernebel', type: 'wasser', shape: 'jelly', hp: 24, atk: 4 },
        { name: 'Die Zugluft', type: 'normal', shape: 'bat', hp: 30, atk: 3 },
      ],
      elite: { name: 'Der Kerzenlöscher', type: 'normal', shape: 'rock', hp: 45, atk: 5 },
      boss: { name: 'Die längste Nacht', acc: 'die längste Nacht', type: 'wasser', shape: 'ghost', hp: 70, atk: 6, boss: true },
    },
  };
  const KJ_MOVES = ['Streitwort', 'Neidblick', 'Nebelwand', 'Windstoß', 'Kalter Hauch', 'Dunkelheit'];
  const KJ_EVENTS = [
    { title: 'Der Pausenhof', text: 'Zwei Kinder streiten um ein Springseil. Hilf ihnen mit einer Frage zu Konflikten, dann leihen sie dir einen Schild.', opts: [{ label: 'Helfen', task: 'mc', g: 'konflikt', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Weggabelung', text: 'Du willst beide Wege gehen und kannst dich nicht entscheiden: ein innerer Konflikt. Eine Frage hilft dir.', opts: [{ label: 'Nachdenken', task: 'mc', g: 'konflikt', win: { xp: 20 }, lose: { xp: 5 } }, { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } }] },
    { title: 'Der Kirchenchor', text: 'Der Chor probt Adventslieder. Die Chorleiterin stellt dir eine Frage zur Adventszeit und schenkt dir einen Trank.', opts: [{ label: 'Antworten', task: 'any', g: 'advent', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die alte Bibel', text: 'In der Stadtbibliothek liegt eine alte Bibel. Der Bibliothekar kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort.', opts: [{ label: 'Antworten', task: 'any', g: 'bibel', win: { item: 'lupe' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Krippe', text: 'In der Kirche steht eine Krippe mit Figuren. Ein Mädchen fragt dich nach der Weihnachtsgeschichte.', opts: [{ label: 'Antworten', task: 'any', g: 'weihnachten', win: { item: 'engel' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Steintafeln', text: 'Im Klassenzimmer hängt ein Plakat mit den Zehn Geboten. Die Lehrerin gibt dir eine Chilischote, wenn du ihre Frage beantwortest.', opts: [{ label: 'Antworten', task: 'any', g: 'gebote', win: { item: 'keks' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Der Weihnachtsmarkt', text: 'Am Stand gibt es warmen Tee. Du kannst dich aufwärmen.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
  ];

  /* ---------- Spaced repetition selection ---------- */
  function weightedPick(items, know, seqNow) {
    const w = items.map((it) => { const k = know[it.id]; if (!k) return 4; let x = 1 + k.ws * 3; if (k.t > 0 && k.c / k.t < 0.6) x += 2; if (seqNow - (k.last || 0) < 3) x *= 0.15; return x; });
    let total = w.reduce((a, b) => a + b, 0); let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; }
    return items[items.length - 1];
  }
  // opts (optional): { g } = nur Fragen zu diesem Thema (g der Pool-Fragen, z. B. 'herkunft'); gibt es keine, dann alle des Moduls
  function generate(mode, mod, tier, know, seqNow, opts) {
    const pool = MODES[mode].pool;
    if (mod === 'ord') { const o = pick(MODES[mode].order); const idx = shuffle(o.items.map((_, i) => i)).slice(0, 4).sort((a, b) => a - b); const items = idx.map((i) => o.items[i]); return { kind: 'order', mod, tier: 1, group: 'ord:1', note: o.note, q: o.q, items, order: items.map((x) => x.id), display: shuffle(items), qid: o.qid + idx.join('') }; }
    if (mod === 'grow') { const items = GROW.slice(); return { kind: 'order', mod, tier: 1, group: 'grow:1', note: 'wachstum', q: 'Wie wächst die Kartoffel? Tippe die Schritte der Reihe nach an.', items, order: items.map((x) => x.id), display: shuffle(items), qid: 'grow' }; }
    if (mod === 'maerchen' && Math.random() < 0.25) { const idx = shuffle(STORY.map((_, i) => i)).slice(0, 4).sort((a, b) => a - b); const items = idx.map((i) => STORY[i]); return { kind: 'order', mod, tier: 1, group: 'story:1', note: 'maerchen', q: 'Tippe die Teile des Märchens in der richtigen Reihenfolge an.', items, order: items.map((x) => x.id), display: shuffle(items), qid: 'story_' + idx.join('') }; }
    let cands = pool.filter((p) => p.mod === mod);
    if (opts && opts.g) { const topic = cands.filter((p) => p.g === opts.g); if (topic.length) cands = topic; }
    const e = weightedPick(cands, know, seqNow);
    if (mod === 'parts') {
      const part = PARTS.find((p) => p.id === e.part);
      if (tier >= 2) return { kind: 'parts-find', mod, tier: 2, group: 'parts:2', note: 'teile', q: `Tippe auf: ${part.name}`, part: part.id, answer: part.name, qid: e.id + '_find' };
      const others = shuffle(PARTS.filter((p) => p.id !== part.id)).slice(0, 3).map((p) => p.name);
      const options = shuffle(others.concat([part.name]));
      return { kind: 'parts', mod, tier: 1, group: 'parts:1', note: 'teile', q: e.q, part: part.id, options, answer: part.name, qid: e.id };
    }
    if (mod === 'rf' || e.rf) return { kind: 'choice', mod, tier: 1, group: mod + ':1', note: e.g, q: e.q, options: ['Richtig', 'Falsch'], answer: e.a ? 'Richtig' : 'Falsch', why: e.why || '', qid: e.id, cols: 2 };
    // mc, lt, def, ground
    const correct = e.o[e.a]; const options = shuffle(e.o.slice());
    return { kind: 'choice', mod, tier: 1, group: mod + ':1', note: e.g, q: e.q, options, answer: correct, qid: e.id, cols: options.length === 2 ? 2 : 1 };
  }
  function record(know, qid, ok, seqNow) { const k = know[qid] || (know[qid] = { c: 0, t: 0, ws: 0, last: 0 }); k.t++; if (ok) { k.c++; k.ws = 0; } else k.ws++; k.last = seqNow; }

  const MODES = {
    ethik: { modules: L_MODULES, starters: L_STARTERS, extra: L_EXTRA, enemies: L_ENEMIES, events: L_EVENTS, moves: L_MOVES, tut: L_TUT, notes: L_NOTES, pool: L_POOL, worlds: 1, title: 'Luthers Weg', icon: '⛪', sub: 'Martin Luther und die Reformation',
      order: [{ items: L_EVENTS_ORDER, note: 'leben', q: 'Tippe die Ereignisse in der richtigen Reihenfolge an.', qid: 'ord_' }] },
    kirchenjahr: { modules: L_MODULES, starters: KJ_STARTERS, extra: KJ_EXTRA, enemies: KJ_ENEMIES, events: KJ_EVENTS, moves: KJ_MOVES, tut: KJ_TUT, notes: KJ_NOTES, pool: KJ_POOL, worlds: 1, title: 'Das Kirchenjahr', icon: '🕯️', sub: 'Buß- und Bettag, Kirche, Bibel, Zehn Gebote, Advent und Weihnachten',
      order: [{ items: KJ_GEBOTE, note: 'gebote', q: 'Tippe die Gebote in der richtigen Reihenfolge an: zuerst das mit der kleinsten Nummer.', qid: 'kjg_' }, { items: KJ_STORY, note: 'weihnachten', q: 'Tippe die Teile der Weihnachtsgeschichte in der richtigen Reihenfolge an.', qid: 'kjw_' }] },
    kartoffel: { modules: K_MODULES, starters: K_STARTERS, extra: K_EXTRA, enemies: K_ENEMIES, events: K_EVENTS, moves: K_MOVES, tut: K_TUT, notes: K_NOTES, pool: K_POOL, worlds: 2, worldAttacks: K_WORLD_ATTACKS, title: 'Die Kartoffel-Werkstatt', icon: '🥔', sub: 'Pflanze, Herkunft, Ernte, Käfer, Wörter, Märchen', school: true },
  };
  return { MODES, PARTS, GROW, STORY, L_POOL, K_POOL, KJ_POOL, L_EVENTS_ORDER, KJ_GEBOTE, KJ_STORY, generate, record, shuffle, pick, rnd };
})();
if (typeof module !== 'undefined') module.exports = MK;
