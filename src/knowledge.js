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
        { name: 'Der Zweifler', type: 'normal', shape: 'zweifler', hp: 26, atk: 3 },
        { name: 'Der Vergessliche', type: 'normal', shape: 'vergesslicher', hp: 24, atk: 4 },
        { name: 'Der Verwechsler', type: 'normal', shape: 'verwechsler', hp: 28, atk: 4 },
        { name: 'Der Schwindler', type: 'normal', shape: 'schwindler', hp: 30, atk: 3 },
      ],
      elite: { name: 'Der strenge Richter', type: 'normal', shape: 'richter', hp: 45, atk: 5 },
      boss: { name: 'Der Ablasshändler', acc: 'den Ablasshändler', type: 'normal', shape: 'ablasshaendler', hp: 70, atk: 6, boss: true },
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
        { name: 'Blattlaus', type: 'pflanze', shape: 'blattlaus', hp: 24, atk: 3 },
        { name: 'Drahtwurm', type: 'normal', shape: 'drahtwurm', hp: 28, atk: 4 },
        { name: 'Wühlmaus', type: 'normal', shape: 'wuehlmaus', hp: 30, atk: 4 },
        { name: 'Fäulewolke', type: 'wasser', shape: 'faeulewolke', hp: 26, atk: 3 },
      ],
      elite: { name: 'Käferlarve', type: 'normal', shape: 'kaeferlarve', hp: 45, atk: 5 },
      boss: { name: 'Kartoffelkäfer', acc: 'den Kartoffelkäfer', type: 'normal', shape: 'kartoffelkaefer', hp: 70, atk: 6, boss: true },
    },
    2: {
      normal: [
        { name: 'Blattfresser', type: 'pflanze', shape: 'blattfresser', hp: 42, atk: 5 },
        { name: 'Hagelwolke', type: 'wasser', shape: 'hagelwolke', hp: 40, atk: 6 },
        { name: 'Ackerteufel', type: 'feuer', shape: 'ackerteufel', hp: 44, atk: 5 },
        { name: 'Eierhaufen', type: 'normal', shape: 'eierhaufen', hp: 38, atk: 6 },
      ],
      elite: { name: 'Riesenlarve', type: 'normal', shape: 'riesenlarve', hp: 70, atk: 8 },
      boss: { name: 'Käferkönigin', acc: 'die Käferkönigin', type: 'normal', shape: 'kaeferkoenigin', hp: 110, atk: 9, boss: true },
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
    'def:1': { title: 'Begriffe', steps: ['Hier geht es um wichtige Wörter wie Buße, Symbol, Altar, Evangelium, Advent, Auferstehung, Pate und Prozession.', 'Überlege, was das Wort bedeutet.', 'Tippe auf die richtige Erklärung.'] },
    'ord:1': { title: 'Reihenfolge', steps: ['Vier Teile sind durcheinander: Zehn Gebote, Weihnachtsgeschichte oder Feste im Kirchenjahr.', 'Tippe sie in der richtigen Reihenfolge an: Was kommt zuerst?', 'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.'] },
  };
  const KJ_STARTERS = [
    { id: 'kuesterin', type: 'normal', shape: 'kuesterin', names: ['Die Küsterin', 'Die Oberküsterin', 'Die Oberküsterin'], hp: 70, desc: 'Sie schließt die Kirche auf, läutet die Glocken und zündet die Kerzen an.', perk: 'none',
      attacks: [{ name: 'Schlüsselbund', mod: 'rf' }, { name: 'Glockenseil', mod: 'mc' }, { name: 'Kerzenlicht', mod: 'lt' }, { name: 'Gesangbuch', mod: 'def' }] },
  ];
  const KJ_WORLD_ATTACKS = { 2: [{ name: 'Palmzweig', mod: 'rf' }, { name: 'Osterkerze', mod: 'mc' }, { name: 'Taufschale', mod: 'def' }, { name: 'Kirchenkalender', mod: 'ord' }] };
  const KJ_EXTRA = { rf: 'Turmuhr', mc: 'Liedtafel', lt: 'Lesepult', def: 'Altarbibel', ord: 'Adventskranz' };
  const KJ_ENEMIES = {
    1: {
      normal: [
        { name: 'Der Streithahn', type: 'feuer', shape: 'fox', hp: 26, atk: 3 },
        { name: 'Der Neidhammel', type: 'pflanze', shape: 'neidhammel', hp: 28, atk: 4 },
        { name: 'Der Novembernebel', type: 'wasser', shape: 'novembernebel', hp: 24, atk: 4 },
        { name: 'Die Zugluft', type: 'normal', shape: 'zugluft', hp: 30, atk: 3 },
      ],
      elite: { name: 'Der Kerzenlöscher', type: 'normal', shape: 'kerzenloescher', hp: 45, atk: 5 },
      boss: { name: 'Die längste Nacht', acc: 'die längste Nacht', type: 'wasser', shape: 'laengstenacht', hp: 70, atk: 6, boss: true },
    },
    2: {
      normal: [
        { name: 'Der Spätfrost', type: 'wasser', shape: 'spaetfrost', hp: 42, atk: 5 },
        { name: 'Die Naschkatze', type: 'normal', shape: 'fox', hp: 40, atk: 6 },
        { name: 'Der Märzsturm', type: 'normal', shape: 'maerzsturm', hp: 44, atk: 5 },
        { name: 'Der Morgenmuffel', type: 'pflanze', shape: 'morgenmuffel', hp: 38, atk: 6 },
      ],
      elite: { name: 'Die Mauer', type: 'normal', shape: 'mauer', hp: 70, atk: 8 },
      boss: { name: 'Der alte Winter', acc: 'den alten Winter', type: 'wasser', shape: 'bear', hp: 110, atk: 9, boss: true },
    },
  };
  const KJ_MOVES = ['Streitwort', 'Neidblick', 'Nebelwand', 'Windstoß', 'Kalter Hauch', 'Dunkelheit', 'Graupelschauer', 'Frostbiss'];
  const KJ_EVENTS = [
    { title: 'Der Pausenhof', text: 'Zwei Kinder streiten um ein Springseil. Hilf ihnen mit einer Frage zu Konflikten, dann leihen sie dir einen Schild.', opts: [{ label: 'Helfen', task: 'mc', g: 'konflikt', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Weggabelung', text: 'Du willst beide Wege gehen und kannst dich nicht entscheiden: ein innerer Konflikt. Eine Frage hilft dir.', opts: [{ label: 'Nachdenken', task: 'mc', g: 'konflikt', win: { xp: 20 }, lose: { xp: 5 } }, { label: 'Ausruhen (+5 LP)', effect: { hp: 5 } }] },
    { title: 'Der Kirchenchor', text: 'Der Chor probt Adventslieder. Die Chorleiterin stellt dir eine Frage zur Adventszeit und schenkt dir einen Trank.', opts: [{ label: 'Antworten', task: 'any', g: 'advent', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die alte Bibel', text: 'In der Stadtbibliothek liegt eine alte Bibel. Der Bibliothekar kennt eine Eselsbrücke und verrät sie dir für eine richtige Antwort.', opts: [{ label: 'Antworten', task: 'any', g: 'bibel', win: { item: 'lupe' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Krippe', text: 'In der Kirche steht eine Krippe mit Figuren. Ein Mädchen fragt dich nach der Weihnachtsgeschichte.', opts: [{ label: 'Antworten', task: 'any', g: 'weihnachten', win: { item: 'engel' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Steintafeln', text: 'Im Klassenzimmer hängt ein Plakat mit den Zehn Geboten. Die Lehrerin gibt dir eine Chilischote, wenn du ihre Frage beantwortest.', opts: [{ label: 'Antworten', task: 'any', g: 'gebote', win: { item: 'keks' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Der Weihnachtsmarkt', text: 'Am Stand gibt es warmen Tee. Du kannst dich aufwärmen.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
    { w: 2, title: 'Die Osterreiter', text: 'Festlich geschmückte Pferde kommen ins Dorf, die Reiter singen. Eine Frau am Wegrand fragt dich nach dem Osterreiten.', opts: [{ label: 'Antworten', task: 'any', g: 'sorben', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
    { w: 2, title: 'Das Taufbecken', text: 'In der Kirche wird heute ein Baby getauft. Die Patin stellt dir eine Frage zur Taufe und schenkt dir einen Schutzengel.', opts: [{ label: 'Antworten', task: 'any', g: 'taufe', win: { item: 'engel' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
    { w: 2, title: 'Der Kirchenkalender', text: 'Im Gemeindehaus hängt ein Kalender mit allen Festen des Jahres. Der Pfarrer fragt dich, welches Fest wann ist.', opts: [{ label: 'Antworten', task: 'any', g: 'festkreis', win: { item: 'lupe' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { w: 2, title: 'Das Osterfeuer', text: 'Am Abend brennt ein großes Osterfeuer. Du kannst dich wärmen.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
  ];

  // Teil 2 (Welt 2): Fragen und Reihenfolgen mit w: 2 kommen nur in Welt 2 dran, alle anderen nur in Welt 1
  Object.assign(KJ_NOTES, {
    fastenzeit: { title: 'Fastenzeit', lines: ['Am Rosenmontag feiern viele Menschen Fasching oder Karneval, mit Umzügen und Verkleidung.', 'Am Aschermittwoch danach beginnt die Fastenzeit. In katholischen Kirchen bekommen die Menschen ein Kreuz aus Asche auf die Stirn.', 'Die Fastenzeit dauert 40 Tage bis Ostern. Die Sonntage werden nicht mitgezählt.', 'Sie erinnert an die 40 Tage, die Jesus nach der Bibel in der Wüste verbrachte.', 'Viele Menschen verzichten in dieser Zeit auf etwas, zum Beispiel auf Süßigkeiten oder Fernsehen.', 'Verzichten schafft Zeit zum Nachdenken: Was ist mir wirklich wichtig? Wem kann ich helfen?'] },
    symbole: { title: 'Symbole', lines: ['Ein Zeichen sagt etwas ganz Bestimmtes, zum Beispiel ein Verkehrsschild oder ein Pfeil.', 'Ein Symbol steht für etwas, das man nicht sehen kann, zum Beispiel Hoffnung, Freundschaft oder Gott.', 'Regenbogen: Die Bibel erzählt, dass Gott ihn Noah nach der großen Flut als Zeichen seines Versprechens zeigte. Er steht für Hoffnung und Frieden.', 'Weg: Er steht für das Leben. Man geht Schritt für Schritt, manchmal bergauf, manchmal an einer Kreuzung.', 'Wasser: Ohne Wasser gibt es kein Leben. Es macht sauber. Bei der Taufe ist es ein Zeichen für neues Leben.', 'Brot: Es macht satt und wird geteilt. Es steht für Leben und Gemeinschaft.', 'Tür: Sie steht für einen Eingang, ein Willkommen und einen neuen Anfang.', 'Brücke: Sie verbindet, was getrennt ist. Sie steht für Versöhnung und Freundschaft.'] },
    ostern: { title: 'Karwoche und Ostern', lines: ['Die Karwoche ist die Woche vor Ostern. „Kar“ ist ein altes Wort für Trauer.', 'Palmsonntag: Jesus zieht in Jerusalem ein. Die Menschen jubeln ihm mit Palmzweigen zu.', 'Gründonnerstag: Jesus feiert mit seinen Jüngern das letzte Abendmahl. Er teilt Brot und Wein.', 'Karfreitag: Jesus stirbt am Kreuz.', 'Ostersonntag: Christen glauben, dass Jesus von den Toten auferstanden ist.', 'Ostern ist das höchste und wichtigste Fest der Christen. Die Osterkerze ist ein Zeichen für das Licht und das neue Leben.'] },
    himmelfahrt: { title: 'Christi Himmelfahrt', lines: ['Christi Himmelfahrt ist 40 Tage nach Ostern, immer an einem Donnerstag.', 'Christen glauben, dass Jesus an diesem Tag zu Gott in den Himmel zurückgekehrt ist.', 'Die Bibel erzählt: Vorher versprach Jesus seinen Jüngern, dass sie den Heiligen Geist bekommen.', 'In ganz Deutschland ist Himmelfahrt ein Feiertag.'] },
    pfingsten: { title: 'Pfingsten', lines: ['Pfingsten ist 50 Tage nach Ostern. Das Wort kommt aus dem Griechischen und heißt „der fünfzigste Tag“.', 'Die Bibel erzählt: Die Jünger saßen zusammen. Es kam ein Brausen wie von einem Sturm, und Flammen wie aus Feuer erschienen über ihnen.', 'Christen glauben, dass Gott ihnen so den Heiligen Geist geschickt hat. Er gab ihnen Mut.', 'Die Jünger erzählten in vielen Sprachen von Jesus, und alle verstanden sie. Viele Menschen ließen sich taufen.', 'Darum nennt man Pfingsten den „Geburtstag der Kirche“.', 'Zeichen für den Heiligen Geist sind die Taube, das Feuer und der Wind.'] },
    taufe: { title: 'Die Taufe', lines: ['Mit der Taufe wird ein Mensch in die Gemeinschaft der Christen aufgenommen.', 'Der Pfarrer oder die Pfarrerin gießt Wasser über den Kopf und sagt: „Ich taufe dich im Namen des Vaters und des Sohnes und des Heiligen Geistes.“', 'Getauft wird am Taufbecken in der Kirche. Oft werden Babys getauft, aber auch Kinder und Erwachsene.', 'Die Paten versprechen, dem Kind im Leben und im Glauben zu helfen.', 'Die Taufkerze wird an der Osterkerze angezündet.', 'Die Bibel erzählt: Jesus wurde von Johannes im Fluss Jordan getauft.'] },
    festkreis: { title: 'Feste im Kirchenjahr', lines: ['Das Kirchenjahr beginnt am 1. Advent und hat zwei große Festkreise: den Weihnachtsfestkreis und den Osterfestkreis.', 'Feste Feste sind jedes Jahr am selben Datum: Heiligabend am 24. Dezember, Weihnachten am 25. und 26. Dezember, der Reformationstag am 31. Oktober.', 'Bewegliche Feste wandern im Kalender. Ostern ist am ersten Sonntag nach dem ersten Vollmond im Frühling, also zwischen dem 22. März und dem 25. April.', 'Nach Ostern richten sich auch Aschermittwoch, Karfreitag, Himmelfahrt, Pfingsten und Fronleichnam.'] },
    sorben: { title: 'Ostern bei den Sorben', lines: ['Die Sorben sind ein kleines Volk in der Lausitz, in Sachsen und Brandenburg. Sie haben eine eigene Sprache.', 'Osterreiten: Am Ostersonntag reiten katholische Sorben in schwarzen Anzügen und mit Zylinder auf geschmückten Pferden von Dorf zu Dorf. Sie singen und erzählen so von der Auferstehung.', 'Bekannt sind auch die sorbischen Ostereier, die mit feinen Mustern verziert werden.', 'Saatreiten: In Ostritz in der Oberlausitz reiten am Ostersonntag Reiter um die Felder und bitten um Segen für die Saat.', 'Fronleichnam ist ein katholisches Fest 60 Tage nach Ostern, mit einer Prozession durch den Ort. In einigen sorbischen Gemeinden bei Bautzen ist an diesem Tag schulfrei.', 'Mariä Himmelfahrt am 15. August ist ein wichtiges Fest der katholischen Sorben. Katholische Christen glauben, dass Maria, die Mutter von Jesus, in den Himmel aufgenommen wurde.'] },
  });
  const KJ_OSTERWEG = [
    { id: 'k1', text: 'Aschermittwoch: Die Fastenzeit beginnt.' },
    { id: 'k2', text: 'Palmsonntag: Jesus zieht in Jerusalem ein.' },
    { id: 'k3', text: 'Gründonnerstag: Jesus feiert mit seinen Jüngern das letzte Abendmahl.' },
    { id: 'k4', text: 'Karfreitag: Jesus stirbt am Kreuz.' },
    { id: 'k5', text: 'Ostersonntag: Christen feiern die Auferstehung.' },
    { id: 'k6', text: 'Christi Himmelfahrt: 40 Tage nach Ostern.' },
    { id: 'k7', text: 'Pfingsten: 50 Tage nach Ostern.' },
  ];
  const KJ_JAHR = [
    { id: 'j1', text: '1. Advent: Beginn des Kirchenjahrs' },
    { id: 'j2', text: 'Weihnachten: die Geburt von Jesus' },
    { id: 'j3', text: 'Aschermittwoch: Beginn der Fastenzeit' },
    { id: 'j4', text: 'Ostern: die Auferstehung' },
    { id: 'j5', text: 'Pfingsten: der Geburtstag der Kirche' },
    { id: 'j6', text: 'Buß- und Bettag im November' },
  ];
  const FEST = 'Ein festes Fest', BEWEGLICH = 'Ein bewegliches Fest';
  KJ_POOL.push(
    // Fastenzeit
    { id: 'kj2rf1', w: 2, mod: 'rf', g: 'fastenzeit', q: 'Am Aschermittwoch beginnt die Fastenzeit.', a: true },
    { id: 'kj2rf2', w: 2, mod: 'rf', g: 'fastenzeit', q: 'Die Fastenzeit dauert 10 Tage.', a: false, why: 'Sie dauert 40 Tage, die Sonntage nicht mitgezählt.' },
    { id: 'kj2rf3', w: 2, mod: 'rf', g: 'fastenzeit', q: 'Der Rosenmontag ist nach dem Aschermittwoch.', a: false, why: 'Der Rosenmontag ist vorher, zwei Tage vor dem Aschermittwoch.' },
    { id: 'kj2mc1', w: 2, mod: 'mc', g: 'fastenzeit', q: 'Woran erinnern die 40 Tage der Fastenzeit?', o: ['An die 40 Tage, die Jesus in der Wüste verbrachte', 'An 40 Geschenke zu Weihnachten', 'An 40 Kerzen in der Kirche'], a: 0 },
    { id: 'kj2mc2', w: 2, mod: 'mc', g: 'fastenzeit', q: 'Was bekommen katholische Christen am Aschermittwoch auf die Stirn?', o: ['Ein Kreuz aus Asche', 'Einen Stern aus Glitzer', 'Einen Tropfen Öl'], a: 0 },
    { id: 'kj2mc3', w: 2, mod: 'mc', g: 'fastenzeit', q: 'Was machen viele Menschen in der Fastenzeit?', o: ['Sie verzichten bewusst auf etwas, zum Beispiel auf Süßigkeiten', 'Sie essen besonders viel Kuchen', 'Sie schmücken einen Tannenbaum'], a: 0 },
    { id: 'kj2lt1', w: 2, mod: 'lt', g: 'fastenzeit', q: 'Am ___ feiern viele Menschen Fasching mit Umzügen.', o: ['Rosenmontag', 'Karfreitag', 'Heiligabend'], a: 0 },
    { id: 'kj2lt2', w: 2, mod: 'lt', g: 'fastenzeit', q: 'Die Fastenzeit endet an ___.', o: ['Ostern', 'Weihnachten', 'Pfingsten'], a: 0 },
    { id: 'kj2def1', w: 2, mod: 'def', g: 'fastenzeit', q: 'Was bedeutet „verzichten“?', o: ['Freiwillig auf etwas nicht zugreifen, das man mag', 'Etwas verschenken, das man nicht mag', 'Etwas ganz schnell aufessen'], a: 0 },
    { id: 'kj2def2', w: 2, mod: 'def', g: 'fastenzeit', q: 'Wozu dient der Verzicht in der Fastenzeit?', o: ['Zum Nachdenken, was wirklich wichtig ist, und um an andere zu denken', 'Damit man an Ostern keinen Hunger hat', 'Damit die Geschäfte schließen können'], a: 0 },
    // Symbole
    { id: 'kj2rf4', w: 2, mod: 'rf', g: 'symbole', q: 'Ein Verkehrsschild ist ein Zeichen mit einer festen Bedeutung.', a: true },
    { id: 'kj2rf5', w: 2, mod: 'rf', g: 'symbole', q: 'Ein Symbol kann für etwas stehen, das man nicht sehen kann, zum Beispiel Hoffnung.', a: true },
    { id: 'kj2rf6', w: 2, mod: 'rf', g: 'symbole', q: 'Die Brücke ist ein Symbol für Streit und Trennung.', a: false, why: 'Die Brücke verbindet. Sie steht für Versöhnung und Freundschaft.' },
    { id: 'kj2rf7', w: 2, mod: 'rf', g: 'symbole', q: 'Nach der Bibel zeigte Gott Noah nach der großen Flut einen Regenbogen.', a: true },
    { id: 'kj2mc4', w: 2, mod: 'mc', g: 'symbole', q: 'Wofür steht der Regenbogen in der Geschichte von Noah?', o: ['Für Gottes Versprechen, für Hoffnung und Frieden', 'Für schlechtes Wetter', 'Für einen Streit'], a: 0 },
    { id: 'kj2mc5', w: 2, mod: 'mc', g: 'symbole', q: 'Welches Symbol steht für einen Eingang und einen neuen Anfang?', o: ['Die Tür', 'Das Brot', 'Der Regenbogen'], a: 0 },
    { id: 'kj2mc6', w: 2, mod: 'mc', g: 'symbole', q: 'Welches Symbol gehört besonders zur Taufe?', o: ['Das Wasser', 'Die Brücke', 'Die Tür'], a: 0 },
    { id: 'kj2mc7', w: 2, mod: 'mc', g: 'symbole', q: 'Welches Symbol steht für das Leben, das man Schritt für Schritt geht?', o: ['Der Weg', 'Das Brot', 'Das Wasser'], a: 0 },
    { id: 'kj2mc8', w: 2, mod: 'mc', g: 'symbole', q: 'Wofür steht das Brot als Symbol?', o: ['Für Leben und Gemeinschaft, weil es satt macht und geteilt wird', 'Für Krieg', 'Für Dunkelheit'], a: 0 },
    { id: 'kj2lt3', w: 2, mod: 'lt', g: 'symbole', q: 'Eine ___ verbindet, was getrennt ist. Sie steht für Versöhnung.', o: ['Brücke', 'Mauer', 'Tür'], a: 0 },
    { id: 'kj2lt4', w: 2, mod: 'lt', g: 'symbole', q: 'Ohne ___ gibt es kein Leben. Es macht auch sauber.', o: ['Wasser', 'Brot', 'Licht'], a: 0 },
    { id: 'kj2def3', w: 2, mod: 'def', g: 'symbole', q: 'Was ist der Unterschied zwischen Zeichen und Symbol?', o: ['Ein Zeichen sagt etwas Bestimmtes, ein Symbol steht für etwas Unsichtbares wie Hoffnung', 'Es gibt keinen Unterschied', 'Ein Symbol ist immer ein Verkehrsschild'], a: 0 },
    // Karwoche und Ostern
    { id: 'kj2rf8', w: 2, mod: 'rf', g: 'ostern', q: 'Ostern ist das höchste Fest der Christen.', a: true },
    { id: 'kj2rf9', w: 2, mod: 'rf', g: 'ostern', q: 'Am Karfreitag feiern Christen die Auferstehung von Jesus.', a: false, why: 'Am Karfreitag denken sie an den Tod von Jesus am Kreuz. Die Auferstehung feiern sie am Ostersonntag.' },
    { id: 'kj2rf10', w: 2, mod: 'rf', g: 'ostern', q: 'Die Karwoche ist die Woche vor Ostern.', a: true },
    { id: 'kj2mc9', w: 2, mod: 'mc', g: 'ostern', q: 'Was feierte Jesus am Gründonnerstag mit seinen Jüngern?', o: ['Das letzte Abendmahl', 'Seinen Geburtstag', 'Die Taufe im Jordan'], a: 0 },
    { id: 'kj2mc10', w: 2, mod: 'mc', g: 'ostern', q: 'Womit jubelten die Menschen Jesus am Palmsonntag zu?', o: ['Mit Palmzweigen', 'Mit Laternen', 'Mit Tannenzweigen'], a: 0 },
    { id: 'kj2mc11', w: 2, mod: 'mc', g: 'ostern', q: 'Was feiern Christen an Ostern?', o: ['Dass Jesus von den Toten auferstanden ist', 'Die Geburt von Jesus', 'Den Beginn der Fastenzeit'], a: 0 },
    { id: 'kj2mc12', w: 2, mod: 'mc', g: 'ostern', q: 'Welches Fest ist das wichtigste der Christen?', o: ['Ostern', 'Weihnachten', 'Rosenmontag'], a: 0 },
    { id: 'kj2lt5', w: 2, mod: 'lt', g: 'ostern', q: 'Am ___ stirbt Jesus am Kreuz.', o: ['Karfreitag', 'Palmsonntag', 'Ostersonntag'], a: 0 },
    { id: 'kj2lt6', w: 2, mod: 'lt', g: 'ostern', q: 'Die ___ ist ein Zeichen für das Licht und das neue Leben an Ostern.', o: ['Osterkerze', 'Adventskerze', 'Taschenlampe'], a: 0 },
    { id: 'kj2def4', w: 2, mod: 'def', g: 'ostern', q: 'Was bedeutet „Auferstehung“?', o: ['Christen glauben: Jesus ist nach seinem Tod wieder lebendig geworden', 'Morgens früh aufstehen', 'Auf einen Berg steigen'], a: 0 },
    { id: 'kj2def5', w: 2, mod: 'def', g: 'ostern', q: 'Was bedeutet das alte Wort „Kar“ in Karwoche und Karfreitag?', o: ['Trauer', 'Freude', 'Frühling'], a: 0 },
    // Himmelfahrt
    { id: 'kj2rf11', w: 2, mod: 'rf', g: 'himmelfahrt', q: 'Christi Himmelfahrt ist immer an einem Donnerstag.', a: true },
    { id: 'kj2rf12', w: 2, mod: 'rf', g: 'himmelfahrt', q: 'Christi Himmelfahrt ist 10 Tage nach Ostern.', a: false, why: 'Himmelfahrt ist 40 Tage nach Ostern.' },
    { id: 'kj2mc13', w: 2, mod: 'mc', g: 'himmelfahrt', q: 'Was glauben Christen über Christi Himmelfahrt?', o: ['Jesus ist zu Gott in den Himmel zurückgekehrt', 'Jesus wurde geboren', 'Jesus wurde getauft'], a: 0 },
    { id: 'kj2mc14', w: 2, mod: 'mc', g: 'himmelfahrt', q: 'Wie viele Tage nach Ostern ist Christi Himmelfahrt?', o: ['40', '50', '7'], a: 0 },
    { id: 'kj2lt7', w: 2, mod: 'lt', g: 'himmelfahrt', q: 'Christi Himmelfahrt ist immer an einem ___.', o: ['Donnerstag', 'Montag', 'Samstag'], a: 0 },
    { id: 'kj2def6', w: 2, mod: 'def', g: 'himmelfahrt', q: 'Was ist Christi Himmelfahrt?', o: ['Das Fest, an dem Christen an die Rückkehr von Jesus zu Gott denken', 'Ein Ausflug mit dem Flugzeug', 'Der erste Tag der Fastenzeit'], a: 0 },
    // Pfingsten
    { id: 'kj2rf13', w: 2, mod: 'rf', g: 'pfingsten', q: 'Pfingsten nennt man auch den „Geburtstag der Kirche“.', a: true },
    { id: 'kj2rf14', w: 2, mod: 'rf', g: 'pfingsten', q: 'Pfingsten ist vor Ostern.', a: false, why: 'Pfingsten ist 50 Tage nach Ostern.' },
    { id: 'kj2rf15', w: 2, mod: 'rf', g: 'pfingsten', q: 'Die Taube ist ein Zeichen für den Heiligen Geist.', a: true },
    { id: 'kj2mc15', w: 2, mod: 'mc', g: 'pfingsten', q: 'Wie viele Tage nach Ostern ist Pfingsten?', o: ['50', '40', '100'], a: 0 },
    { id: 'kj2mc16', w: 2, mod: 'mc', g: 'pfingsten', q: 'Warum heißt Pfingsten „Geburtstag der Kirche“?', o: ['Weil die Jünger von Jesus erzählten und sich viele Menschen taufen ließen', 'Weil an Pfingsten die erste Kirche gebaut wurde', 'Weil Jesus an Pfingsten geboren wurde'], a: 0 },
    { id: 'kj2mc17', w: 2, mod: 'mc', g: 'pfingsten', q: 'Wen schickte Gott nach dem Glauben der Christen an Pfingsten zu den Jüngern?', o: ['Den Heiligen Geist', 'Einen König', 'Die Hirten'], a: 0 },
    { id: 'kj2lt8', w: 2, mod: 'lt', g: 'pfingsten', q: 'Feuer, Wind und die ___ sind Zeichen für den Heiligen Geist.', o: ['Taube', 'Krippe', 'Palme'], a: 0 },
    { id: 'kj2def7', w: 2, mod: 'def', g: 'pfingsten', q: 'Was bedeutet das Wort „Pfingsten“?', o: ['Der fünfzigste Tag', 'Der erste Tag', 'Der heilige Wald'], a: 0 },
    // Taufe
    { id: 'kj2rf16', w: 2, mod: 'rf', g: 'taufe', q: 'Bei der Taufe wird ein Mensch in die Gemeinschaft der Christen aufgenommen.', a: true },
    { id: 'kj2rf17', w: 2, mod: 'rf', g: 'taufe', q: 'Taufen darf man nur Babys.', a: false, why: 'Auch Kinder und Erwachsene können getauft werden.' },
    { id: 'kj2mc18', w: 2, mod: 'mc', g: 'taufe', q: 'Womit wird getauft?', o: ['Mit Wasser', 'Mit Sand', 'Mit Asche'], a: 0 },
    { id: 'kj2mc19', w: 2, mod: 'mc', g: 'taufe', q: 'Wer taufte Jesus nach der Bibel im Jordan?', o: ['Johannes', 'Mose', 'Petrus'], a: 0 },
    { id: 'kj2mc20', w: 2, mod: 'mc', g: 'taufe', q: 'An welcher Kerze wird die Taufkerze angezündet?', o: ['An der Osterkerze', 'An der Geburtstagskerze', 'An der Adventskerze'], a: 0 },
    { id: 'kj2lt9', w: 2, mod: 'lt', g: 'taufe', q: 'Die ___ versprechen, dem Kind im Leben und im Glauben zu helfen.', o: ['Paten', 'Nachbarn', 'Lehrer'], a: 0 },
    { id: 'kj2def8', w: 2, mod: 'def', g: 'taufe', q: 'Was ist ein Pate oder eine Patin?', o: ['Ein Mensch, der verspricht, dem Täufling im Leben und im Glauben zu helfen', 'Der Mensch, der die Orgel spielt', 'Ein Kind, das getauft wird'], a: 0 },
    // Feste und bewegliche Feste
    { id: 'kj2rf18', w: 2, mod: 'rf', g: 'festkreis', q: 'Weihnachten ist jedes Jahr am selben Datum.', a: true },
    { id: 'kj2rf19', w: 2, mod: 'rf', g: 'festkreis', q: 'Ostern ist jedes Jahr am selben Datum.', a: false, why: 'Ostern ist ein bewegliches Fest: am ersten Sonntag nach dem ersten Vollmond im Frühling.' },
    { id: 'kj2mc21', w: 2, mod: 'mc', g: 'festkreis', q: 'Ist Heiligabend ein festes oder ein bewegliches Fest?', o: [FEST, BEWEGLICH], a: 0 },
    { id: 'kj2mc22', w: 2, mod: 'mc', g: 'festkreis', q: 'Ist Pfingsten ein festes oder ein bewegliches Fest?', o: [BEWEGLICH, FEST], a: 0 },
    { id: 'kj2mc23', w: 2, mod: 'mc', g: 'festkreis', q: 'Ist der Reformationstag am 31. Oktober ein festes oder ein bewegliches Fest?', o: [FEST, BEWEGLICH], a: 0 },
    { id: 'kj2mc24', w: 2, mod: 'mc', g: 'festkreis', q: 'Ist Christi Himmelfahrt ein festes oder ein bewegliches Fest?', o: [BEWEGLICH, FEST], a: 0 },
    { id: 'kj2mc25', w: 2, mod: 'mc', g: 'festkreis', q: 'Wann ist Ostern?', o: ['Am ersten Sonntag nach dem ersten Vollmond im Frühling', 'Immer am 1. April', 'Immer am letzten Tag im Mai'], a: 0 },
    { id: 'kj2lt10', w: 2, mod: 'lt', g: 'festkreis', q: 'Das Kirchenjahr hat zwei große Festkreise: den Weihnachtsfestkreis und den ___.', o: ['Osterfestkreis', 'Sommerfestkreis', 'Geburtstagskreis'], a: 0 },
    { id: 'kj2def9', w: 2, mod: 'def', g: 'festkreis', q: 'Was ist ein bewegliches Fest?', o: ['Ein Fest, das jedes Jahr an einem anderen Datum ist', 'Ein Fest, bei dem alle tanzen', 'Ein Fest, das immer am selben Tag ist'], a: 0 },
    // Sorben
    { id: 'kj2rf20', w: 2, mod: 'rf', g: 'sorben', q: 'Beim Osterreiten reiten katholische Sorben am Ostersonntag von Dorf zu Dorf.', a: true },
    { id: 'kj2rf21', w: 2, mod: 'rf', g: 'sorben', q: 'Die Sorben leben an der Ostsee.', a: false, why: 'Die Sorben leben in der Lausitz, in Sachsen und Brandenburg.' },
    { id: 'kj2mc26', w: 2, mod: 'mc', g: 'sorben', q: 'Wovon erzählen die Osterreiter mit ihren Liedern?', o: ['Von der Auferstehung von Jesus', 'Von der Geburt von Jesus', 'Vom Ende der Ferien'], a: 0 },
    { id: 'kj2mc27', w: 2, mod: 'mc', g: 'sorben', q: 'Wo leben die Sorben?', o: ['In der Lausitz', 'In den Alpen', 'Auf einer Insel'], a: 0 },
    { id: 'kj2mc28', w: 2, mod: 'mc', g: 'sorben', q: 'Worum bitten die Reiter beim Saatreiten in Ostritz?', o: ['Um Segen für die Saat auf den Feldern', 'Um neue Pferde', 'Um schönes Wetter für den Urlaub'], a: 0 },
    { id: 'kj2mc29', w: 2, mod: 'mc', g: 'sorben', q: 'Wann ist Mariä Himmelfahrt?', o: ['Am 15. August', 'Am 24. Dezember', 'Am 31. Oktober'], a: 0 },
    { id: 'kj2lt11', w: 2, mod: 'lt', g: 'sorben', q: 'An ___ ziehen katholische Christen in einer Prozession durch den Ort.', o: ['Fronleichnam', 'Rosenmontag', 'Heiligabend'], a: 0 },
    { id: 'kj2lt12', w: 2, mod: 'lt', g: 'sorben', q: 'Die Sorben haben eine eigene ___.', o: ['Sprache', 'Sonne', 'Uhrzeit'], a: 0 },
    { id: 'kj2def10', w: 2, mod: 'def', g: 'sorben', q: 'Was ist eine Prozession?', o: ['Ein feierlicher Umzug von Gläubigen, oft mit Fahnen, Gebeten und Liedern', 'Ein Pferderennen um einen Preis', 'Ein Gottesdienst ohne Musik'], a: 0 },
    { id: 'kj2def11', w: 2, mod: 'def', g: 'sorben', q: 'Wer sind die Sorben?', o: ['Ein kleines Volk in der Lausitz mit eigener Sprache', 'Ein Orden von Mönchen', 'Die Jünger von Jesus'], a: 0 },
  );

  /* ---------- ETHIK: Gute Freunde ---------- */
  const F_NOTES = {
    freundschaft: { title: 'Freundschaft', lines: ['Freunde findet man, wenn man auf andere zugeht: fragen, mitspielen, zuhören.', 'Ein guter Freund hält zu dir, hilft dir, hört dir zu und freut sich mit dir.', 'Freunde können verschieden sein: Freundschaft gibt es auch zwischen Jung und Alt, zum Beispiel mit der Oma oder dem Nachbarn.', 'Auch Mensch und Tier können Freunde sein. Ein Tier braucht dafür Futter, Pflege und Zeit.'] },
    echt: { title: 'Wahre und falsche Freundschaft', lines: ['Ein wahrer Freund mag dich so, wie du bist.', 'Er sagt dir auch ehrlich, wenn ihm etwas nicht gefällt, und bleibt trotzdem dein Freund.', 'Ein falscher Freund ist nur nett, wenn er etwas von dir haben will, zum Beispiel Süßigkeiten oder Spielsachen.', 'Ein falscher Freund überredet dich zu Dingen, die du nicht willst, oder lacht hinter deinem Rücken über dich.'] },
    versprechen: { title: 'Versprechen und Geheimnisse', lines: ['Ein Versprechen hält man. Dann können sich andere auf dich verlassen.', 'Kannst du ein Versprechen nicht halten, sag es früh und ehrlich.', 'Gute Geheimnisse machen Freude, zum Beispiel ein Geschenk für Mama. Sie werden bald gelüftet.', 'Schlechte Geheimnisse machen Angst oder Bauchweh. Die darfst du einem Erwachsenen erzählen, dem du vertraust, auch wenn du versprochen hast zu schweigen. Das ist kein Petzen.'] },
    streit: { title: 'Streitregeln', lines: ['Streit gibt es in jeder Freundschaft. Wichtig ist, wie man ihn löst.', '1. Ruhig werden: tief durchatmen, Abstand nehmen.', '2. Jeder erzählt, was passiert ist. Die anderen hören zu und unterbrechen nicht.', '3. Sagen, wie es mir geht: „Ich bin traurig, weil …“ statt „Du bist doof!“', '4. Gemeinsam Lösungen suchen und eine wählen, mit der beide leben können.', 'Ein Kompromiss heißt: Jeder gibt ein Stück nach, damit beide zufrieden sind.', 'Ein Schlichter oder eine Schlichterin hilft beim Streit. Er hört beiden zu, hält zu keinem und hilft, eine Lösung zu finden.'] },
    goldene: { title: 'Die Goldene Regel', lines: ['„Behandle andere so, wie du selbst behandelt werden möchtest.“', 'Oder: „Was du nicht willst, dass man dir tu, das füg auch keinem andern zu.“', 'Die Goldene Regel gibt es in vielen Religionen und Kulturen auf der ganzen Welt.', 'Frag dich vorher: Wie würde es mir gehen, wenn jemand das mit mir macht?'] },
    mobbing: { title: 'Mobbing mit Worten', lines: ['Mobbing heißt: Ein Kind wird immer wieder und mit Absicht geärgert, ausgelacht oder ausgeschlossen.', 'Auch Worte können sehr wehtun: Schimpfwörter, Auslachen, Gerüchte, gemeine Nachrichten.', 'Wer gemobbt wird, ist nicht schuld daran.', 'Hol dir Hilfe bei einem Erwachsenen, dem du vertraust: Eltern, Lehrerin, Lehrer oder Hortnerin. Das ist kein Petzen.', 'Wer zusieht, kann helfen: nicht mitlachen, zu dem Kind halten und einem Erwachsenen Bescheid sagen.'] },
    wahrheit: { title: 'Wahrheit', lines: ['Wer die Wahrheit sagt, dem kann man vertrauen.', 'Eine Lüge ist eine Aussage, von der man weiß, dass sie falsch ist, und die andere täuschen soll.', 'Eine Halbwahrheit erzählt nur einen Teil und lässt das Wichtige weg. Auch sie täuscht.', 'Eine Notlüge soll jemanden schonen oder aus einer Klemme helfen. Ob sie in Ordnung ist, darüber kann man nachdenken.', 'Vertrauen wächst langsam. Wer oft lügt, verliert es schnell.'] },
  };
  const F_SCHLICHTEN = [
    { id: 's1', text: 'Ruhig werden und tief durchatmen.' },
    { id: 's2', text: 'Jeder erzählt, was passiert ist. Die anderen hören zu.' },
    { id: 's3', text: 'Jeder sagt, wie es ihm geht.' },
    { id: 's4', text: 'Gemeinsam Lösungen sammeln.' },
    { id: 's5', text: 'Eine Lösung wählen, mit der beide leben können.' },
    { id: 's6', text: 'Sich die Hand geben und sich daran halten.' },
  ];
  const GOLD = 'Behandle andere so, wie du selbst behandelt werden möchtest.';
  const F_POOL = [
    // Freundschaft
    { id: 'gfrf1', mod: 'rf', g: 'freundschaft', q: 'Auch ein Kind und ein alter Mensch können Freunde sein.', a: true },
    { id: 'gfrf2', mod: 'rf', g: 'freundschaft', q: 'Ein Haustier braucht Futter, Pflege und Zeit.', a: true },
    { id: 'gfrf3', mod: 'rf', g: 'freundschaft', q: 'Freunde müssen immer genau dasselbe mögen.', a: false, why: 'Freunde können verschieden sein und trotzdem zusammenhalten.' },
    { id: 'gfmc1', mod: 'mc', g: 'freundschaft', q: 'Ein neues Kind steht allein auf dem Schulhof. Wie kann eine Freundschaft beginnen?', o: ['Hingehen und fragen, ob es mitspielen möchte', 'Es nicht beachten', 'Über seine Kleidung lachen'], a: 0 },
    { id: 'gfmc2', mod: 'mc', g: 'freundschaft', q: 'Was macht ein guter Freund?', o: ['Er hört zu und hilft dir', 'Er nimmt dir dein Pausenbrot weg', 'Er erzählt deine Geheimnisse herum'], a: 0 },
    { id: 'gfmc3', mod: 'mc', g: 'freundschaft', q: 'Was braucht eine Freundschaft mit einem Tier?', o: ['Pflege, Futter und Zeit', 'Nur ein schönes Halsband', 'Gar nichts'], a: 0 },
    { id: 'gflt1', mod: 'lt', g: 'freundschaft', q: 'Freunde findet man, wenn man auf andere ___.', o: ['zugeht', 'wartet', 'schimpft'], a: 0 },
    { id: 'gflt2', mod: 'lt', g: 'freundschaft', q: 'Freundschaft zwischen Jung und ___ gibt es auch, zum Beispiel mit der Oma.', o: ['Alt', 'Klein', 'Schnell'], a: 0 },
    { id: 'gfdef1', mod: 'def', g: 'freundschaft', q: 'Was ist Freundschaft?', o: ['Zwei oder mehr mögen sich, halten zusammen und helfen einander', 'Man sitzt nur zufällig nebeneinander', 'Einer bestimmt, der andere muss gehorchen'], a: 0 },
    // Wahre und falsche Freundschaft
    { id: 'gfrf4', mod: 'rf', g: 'echt', q: 'Ein wahrer Freund mag dich so, wie du bist.', a: true },
    { id: 'gfrf5', mod: 'rf', g: 'echt', q: 'Ein wahrer Freund ist nur nett, wenn du ihm Süßigkeiten gibst.', a: false, why: 'So verhält sich ein falscher Freund. Ein wahrer Freund mag dich auch ohne Geschenke.' },
    { id: 'gfrf6', mod: 'rf', g: 'echt', q: 'Ein wahrer Freund darf dir ehrlich sagen, wenn ihm etwas nicht gefällt.', a: true },
    { id: 'gfmc4', mod: 'mc', g: 'echt', q: 'Tom spielt nur mit Lena, wenn sie ihm ihre Sticker schenkt. Was für ein Freund ist Tom?', o: ['Ein falscher Freund', 'Ein wahrer Freund'], a: 0 },
    { id: 'gfmc5', mod: 'mc', g: 'echt', q: 'Mira tröstet Ben, als sein Hamster gestorben ist. Was für eine Freundin ist Mira?', o: ['Eine wahre Freundin', 'Eine falsche Freundin'], a: 0 },
    { id: 'gfmc6', mod: 'mc', g: 'echt', q: 'Jan lacht mit den anderen hinter Paulas Rücken über sie. Was für ein Freund ist Jan?', o: ['Ein falscher Freund', 'Ein wahrer Freund'], a: 0 },
    { id: 'gfmc7', mod: 'mc', g: 'echt', q: 'Woran erkennst du einen falschen Freund?', o: ['Er will dich zu Dingen überreden, die du nicht willst', 'Er hilft dir bei den Hausaufgaben', 'Er besucht dich, wenn du krank bist'], a: 0 },
    { id: 'gflt3', mod: 'lt', g: 'echt', q: 'Ein ___ Freund hält auch in schweren Zeiten zu dir.', o: ['wahrer', 'falscher', 'fremder'], a: 0 },
    { id: 'gfdef2', mod: 'def', g: 'echt', q: 'Was ist ein falscher Freund?', o: ['Jemand, der nur nett ist, wenn er etwas von dir will', 'Jemand, der dir ehrlich die Meinung sagt', 'Jemand, der in einer anderen Stadt wohnt'], a: 0 },
    // Versprechen und Geheimnisse
    { id: 'gfrf7', mod: 'rf', g: 'versprechen', q: 'Ein Geheimnis, das dir Angst macht, darfst du einem Erwachsenen erzählen, dem du vertraust.', a: true },
    { id: 'gfrf8', mod: 'rf', g: 'versprechen', q: 'Wer ein Versprechen hält, auf den kann man sich verlassen.', a: true },
    { id: 'gfrf9', mod: 'rf', g: 'versprechen', q: 'Wer einem Erwachsenen von einem schlechten Geheimnis erzählt, petzt.', a: false, why: 'Hilfe holen ist kein Petzen. Schlechte Geheimnisse darf man immer erzählen.' },
    { id: 'gfmc8', mod: 'mc', g: 'versprechen', q: 'Welches Geheimnis ist ein gutes Geheimnis?', o: ['Wir basteln heimlich ein Geschenk für Papas Geburtstag', 'Ein größeres Kind droht dir und sagt, du darfst es niemandem erzählen', 'Jemand hat dir wehgetan und sagt, du sollst schweigen'], a: 0 },
    { id: 'gfmc9', mod: 'mc', g: 'versprechen', q: 'Du hast versprochen zu helfen, aber du wirst krank. Was tust du?', o: ['Früh Bescheid sagen und es ehrlich erklären', 'Einfach nichts sagen', 'Behaupten, du hättest nie etwas versprochen'], a: 0 },
    { id: 'gflt4', mod: 'lt', g: 'versprechen', q: 'Ein Geheimnis, das Bauchweh macht, ist ein ___ Geheimnis.', o: ['schlechtes', 'gutes', 'lustiges'], a: 0 },
    { id: 'gflt5', mod: 'lt', g: 'versprechen', q: 'Ein Versprechen ___ man.', o: ['hält', 'vergisst', 'verkauft'], a: 0 },
    { id: 'gfdef3', mod: 'def', g: 'versprechen', q: 'Was ist ein Versprechen?', o: ['Man sagt fest zu, dass man etwas tun wird', 'Man spricht ein Wort falsch aus', 'Man erzählt ein Geheimnis weiter'], a: 0 },
    // Streitregeln, Kompromiss, Schlichter
    { id: 'gfrf10', mod: 'rf', g: 'streit', q: 'Bei einem Kompromiss gibt jeder ein Stück nach.', a: true },
    { id: 'gfrf11', mod: 'rf', g: 'streit', q: 'Ein Schlichter hält immer zu seinem besten Freund.', a: false, why: 'Ein Schlichter hält zu keinem. Er hört beiden zu und hilft bei der Lösung.' },
    { id: 'gfrf12', mod: 'rf', g: 'streit', q: 'Beim Streiten hilft es, erst einmal ruhig zu werden.', a: true },
    { id: 'gfrf13', mod: 'rf', g: 'streit', q: 'Wenn der andere erzählt, darf man ihn ruhig unterbrechen.', a: false, why: 'Eine Streitregel heißt: zuhören und nicht unterbrechen.' },
    { id: 'gfmc10', mod: 'mc', g: 'streit', q: 'Emma und Noah wollen beide auf die Schaukel. Welche Lösung ist ein Kompromiss?', o: ['Jeder schaukelt abwechselnd fünf Minuten', 'Emma schaukelt die ganze Pause', 'Keiner darf schaukeln, und beide sind sauer'], a: 0 },
    { id: 'gfmc11', mod: 'mc', g: 'streit', q: 'Welcher Satz passt zu den Streitregeln?', o: ['„Ich bin traurig, weil du mein Bild zerknüllt hast.“', '„Du bist doof!“', '„Mit dir rede ich nie wieder!“'], a: 0 },
    { id: 'gfmc12', mod: 'mc', g: 'streit', q: 'Was macht ein Schlichter?', o: ['Er hört beiden zu und hilft, eine Lösung zu finden', 'Er bestimmt, wer recht hat, und bestraft den anderen', 'Er streitet mit'], a: 0 },
    { id: 'gfmc13', mod: 'mc', g: 'streit', q: 'Was ist der erste Schritt, wenn ein Streit losgeht?', o: ['Ruhig werden und tief durchatmen', 'Sofort laut schreien', 'Weglaufen und nie wieder reden'], a: 0 },
    { id: 'gflt6', mod: 'lt', g: 'streit', q: 'Wenn jeder ein Stück nachgibt, nennt man das einen ___.', o: ['Kompromiss', 'Wettkampf', 'Zufall'], a: 0 },
    { id: 'gflt7', mod: 'lt', g: 'streit', q: 'Ein ___ hilft zwei Kindern, ihren Streit zu lösen.', o: ['Schlichter', 'Zuschauer', 'Schiedsrichterpfiff'], a: 0 },
    { id: 'gflt8', mod: 'lt', g: 'streit', q: 'Wenn der andere erzählt, höre ich zu und ___ nicht.', o: ['unterbreche', 'atme', 'sitze'], a: 0 },
    { id: 'gfdef4', mod: 'def', g: 'streit', q: 'Was ist ein Kompromiss?', o: ['Eine Lösung, bei der jeder ein Stück nachgibt, damit beide zufrieden sind', 'Wenn einer gewinnt und der andere verliert', 'Ein anderes Wort für Streit'], a: 0 },
    { id: 'gfdef5', mod: 'def', g: 'streit', q: 'Was ist ein Schlichter?', o: ['Jemand, der beim Streit hilft, beiden zuhört und zu keinem hält', 'Jemand, der einen Streit anfängt', 'Jemand, der beim Streit nur zuschaut'], a: 0 },
    { id: 'gfdef6', mod: 'def', g: 'streit', q: 'Was ist eine Ich-Botschaft?', o: ['Ich sage, wie es mir geht: „Ich bin wütend, weil …“', 'Ich sage, was der andere falsch gemacht hat: „Du bist schuld!“', 'Ich schreibe meinen Namen auf einen Zettel'], a: 0 },
    // Goldene Regel
    { id: 'gfrf14', mod: 'rf', g: 'goldene', q: 'Die Goldene Regel heißt: Behandle andere so, wie du selbst behandelt werden möchtest.', a: true },
    { id: 'gfrf15', mod: 'rf', g: 'goldene', q: 'Die Goldene Regel gibt es nur in einem einzigen Land.', a: false, why: 'Es gibt sie in vielen Religionen und Kulturen auf der ganzen Welt.' },
    { id: 'gfmc14', mod: 'mc', g: 'goldene', q: 'Wie heißt die Goldene Regel?', o: [GOLD, 'Wer zuerst kommt, mahlt zuerst.', 'Der Stärkere bestimmt.'], a: 0 },
    { id: 'gfmc15', mod: 'mc', g: 'goldene', q: 'Lukas möchte nicht ausgelacht werden. Was sagt die Goldene Regel?', o: ['Dann soll er auch andere nicht auslachen', 'Dann darf er die anderen zuerst auslachen', 'Das hat nichts miteinander zu tun'], a: 0 },
    { id: 'gfmc16', mod: 'mc', g: 'goldene', q: 'Welcher Spruch meint dasselbe wie die Goldene Regel?', o: ['Was du nicht willst, dass man dir tu, das füg auch keinem andern zu.', 'Morgenstund hat Gold im Mund.', 'Reden ist Silber, Schweigen ist Gold.'], a: 0 },
    { id: 'gflt9', mod: 'lt', g: 'goldene', q: 'Was du nicht willst, dass man dir tu, das füg auch keinem ___ zu.', o: ['andern', 'Freund', 'Tier'], a: 0 },
    { id: 'gflt10', mod: 'lt', g: 'goldene', q: 'Behandle andere so, wie du selbst ___ werden möchtest.', o: ['behandelt', 'gerufen', 'gesehen'], a: 0 },
    { id: 'gfdef7', mod: 'def', g: 'goldene', q: 'Was ist die Goldene Regel?', o: ['Eine Regel für alle: Behandle andere so, wie du behandelt werden möchtest', 'Eine Regel, wie man Gold findet', 'Die wichtigste Regel beim Fußball'], a: 0 },
    // Mobbing mit Worten
    { id: 'gfrf16', mod: 'rf', g: 'mobbing', q: 'Wer gemobbt wird, ist selbst schuld.', a: false, why: 'Wer gemobbt wird, ist nie schuld daran.' },
    { id: 'gfrf17', mod: 'rf', g: 'mobbing', q: 'Auch Worte und Gerüchte können sehr wehtun.', a: true },
    { id: 'gfrf18', mod: 'rf', g: 'mobbing', q: 'Wer gemobbt wird, soll sich Hilfe bei einem Erwachsenen holen.', a: true },
    { id: 'gfmc17', mod: 'mc', g: 'mobbing', q: 'Was ist Mobbing mit Worten?', o: ['Ein Kind wird immer wieder mit Absicht beschimpft oder ausgelacht', 'Zwei Kinder streiten einmal um einen Ball', 'Ein Kind sagt seine ehrliche Meinung'], a: 0 },
    { id: 'gfmc18', mod: 'mc', g: 'mobbing', q: 'Du siehst, wie ein Kind jeden Tag ausgelacht wird. Was hilft?', o: ['Nicht mitlachen und einem Erwachsenen Bescheid sagen', 'Mitlachen, damit man selbst dazugehört', 'So tun, als hätte man nichts gesehen'], a: 0 },
    { id: 'gflt11', mod: 'lt', g: 'mobbing', q: 'Hol dir Hilfe bei einem ___, dem du vertraust.', o: ['Erwachsenen', 'Fremden', 'Kuscheltier'], a: 0 },
    { id: 'gfdef8', mod: 'def', g: 'mobbing', q: 'Was ist ein Gerücht?', o: ['Etwas, das herumerzählt wird, obwohl niemand weiß, ob es stimmt', 'Ein starker Geruch', 'Eine Nachricht von der Lehrerin'], a: 0 },
    // Wahrheit
    { id: 'gfrf19', mod: 'rf', g: 'wahrheit', q: 'Wer oft lügt, dem vertraut man bald nicht mehr.', a: true },
    { id: 'gfrf20', mod: 'rf', g: 'wahrheit', q: 'Eine Halbwahrheit ist immer ganz ehrlich.', a: false, why: 'Eine Halbwahrheit lässt das Wichtige weg und täuscht dadurch.' },
    { id: 'gfmc19', mod: 'mc', g: 'wahrheit', q: 'Mama fragt, ob Max seine Hausaufgaben gemacht hat. Max sagt: „Mathe habe ich gemacht.“ Deutsch hat er nicht gemacht. Was ist das?', o: ['Eine Halbwahrheit', 'Die ganze Wahrheit', 'Ein Versprechen'], a: 0 },
    { id: 'gfmc20', mod: 'mc', g: 'wahrheit', q: 'Oma strickt Sophie einen kratzigen Pulli. Sophie sagt: „Der ist schön.“ Wie nennt man so eine Lüge, die jemanden schonen soll?', o: ['Eine Notlüge', 'Ein Gerücht', 'Ein Kompromiss'], a: 0 },
    { id: 'gfmc21', mod: 'mc', g: 'wahrheit', q: 'Was wächst, wenn man immer die Wahrheit sagt?', o: ['Das Vertrauen', 'Der Streit', 'Die Angst'], a: 0 },
    { id: 'gflt12', mod: 'lt', g: 'wahrheit', q: 'Wer die Wahrheit sagt, dem kann man ___.', o: ['vertrauen', 'misstrauen', 'drohen'], a: 0 },
    { id: 'gfdef9', mod: 'def', g: 'wahrheit', q: 'Was ist eine Notlüge?', o: ['Eine Lüge, die jemanden schonen oder aus einer Klemme helfen soll', 'Ein Anruf bei der Feuerwehr', 'Die ganze Wahrheit'], a: 0 },
    { id: 'gfdef10', mod: 'def', g: 'wahrheit', q: 'Was ist eine Halbwahrheit?', o: ['Man erzählt nur einen Teil und lässt das Wichtige weg', 'Man sagt alles ganz genau', 'Man flüstert die Wahrheit'], a: 0 },
    { id: 'gfdef11', mod: 'def', g: 'wahrheit', q: 'Was bedeutet „Vertrauen“?', o: ['Sich darauf verlassen, dass jemand ehrlich ist und zu einem hält', 'Jemandem etwas wegnehmen', 'Sich vor jemandem verstecken'], a: 0 },
  ];
  const F_TUT = {
    'rf:1': { title: 'Richtig oder falsch', steps: ['Lies den Satz genau.', 'Stimmt er mit dem, was du über Freundschaft, Streitregeln und Wahrheit gelernt hast? Dann „Richtig“.', 'Ist etwas vertauscht oder falsch? Dann „Falsch“.'] },
    'mc:1': { title: 'Wähle aus', steps: ['Lies die Frage. Nur eine Antwort stimmt.', 'Bei Geschichten fragst du dich: Wie verhält sich ein wahrer Freund? Was sagen die Streitregeln?', 'Tippe auf die richtige Antwort.'] },
    'lt:1': { title: 'Lückentext', steps: ['Im Satz fehlt ein Wort (___).', 'Lies den Satz mit jedem Wort einmal durch.', 'Tippe auf das Wort, das passt.'] },
    'def:1': { title: 'Begriffe', steps: ['Hier geht es um wichtige Wörter wie Kompromiss, Schlichter, Goldene Regel, Gerücht, Notlüge und Vertrauen.', 'Überlege, was das Wort bedeutet.', 'Tippe auf die richtige Erklärung.'] },
    'ord:1': { title: 'Reihenfolge', steps: ['Vier Schritte, wie man einen Streit löst, sind durcheinander.', 'Tippe sie in der richtigen Reihenfolge an: Was kommt zuerst?', 'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.'] },
  };
  const F_STARTERS = [
    { id: 'hofbande', type: 'normal', shape: 'friends', names: ['Die Hofbande', 'Die Hofbande', 'Die Hofbande'], hp: 70, desc: 'Ida und Ole, Nachbarskinder und seit dem Kindergarten befreundet. Sie streiten manchmal und vertragen sich wieder.', perk: 'none',
      attacks: [{ name: 'Ehrenwort', mod: 'rf' }, { name: 'Handschlag', mod: 'mc' }, { name: 'Zettelpost', mod: 'lt' }, { name: 'Klassenregel', mod: 'def' }] },
  ];
  const F_EXTRA = { rf: 'Offenes Ohr', mc: 'Freundschaftsband', lt: 'Brieffreundschaft', def: 'Friedensbank', ord: 'Streitschlichtung' };
  const F_ENEMIES = {
    1: {
      normal: [
        { name: 'Der Zankapfel', type: 'feuer', shape: 'zankapfel', hp: 26, atk: 3 },
        { name: 'Der Neidwurm', type: 'pflanze', shape: 'neidwurm', hp: 28, atk: 4 },
        { name: 'Die Flunkerei', type: 'wasser', shape: 'flunkerei', hp: 24, atk: 4 },
        { name: 'Der Großtuer', type: 'normal', shape: 'toad', hp: 30, atk: 3 },
      ],
      elite: { name: 'Das Gerücht', type: 'normal', shape: 'geruecht', hp: 45, atk: 5 },
      boss: { name: 'Der Keil', acc: 'den Keil', type: 'normal', shape: 'keil', hp: 70, atk: 6, boss: true },
    },
  };
  const F_MOVES = ['Stichelei', 'Prahlerei', 'Getuschel', 'Türknallen', 'Schmollblick', 'Halbwahrheit'];
  // Dilemma-Karten: kein Richtig oder Falsch, jede Wahl bekommt dieselbe Belohnung (reward)
  const F_EVENTS = [
    { title: 'Das verratene Geheimnis', dilemma: true, reward: { hp: 5 }, text: 'Deine Freundin Nele hat dir erzählt, dass sie in Tim verliebt ist. Jetzt fragt Tim dich, ob Nele ihn mag.', opts: [
      { label: 'Ich sage: „Frag sie selbst.“', then: 'Tim ist enttäuscht, aber Nele kann selbst entscheiden, was sie erzählt.', think: 'Wann darf man ein Geheimnis weitererzählen und wann nicht?' },
      { label: 'Ich erzähle es Tim.', then: 'Tim grinst. Nele erfährt davon und ist traurig, weil sie dir vertraut hat.', think: 'Wie würdest du dich fühlen, wenn jemand dein Geheimnis verrät?' },
      { label: 'Ich sage Nele, dass Tim gefragt hat.', then: 'Nele ist froh, dass sie es von dir weiß. Sie überlegt, was sie Tim sagen will.', think: 'Was macht eine gute Freundin aus?' } ] },
    { title: 'Das neue Kind', dilemma: true, reward: { hp: 5 }, text: 'Im Fußballspiel fehlt ein Spieler. Ein neues Kind schaut zu. Dein bester Freund sagt: „Die kennen wir nicht, die nehmen wir nicht.“', opts: [
      { label: 'Ich frage das neue Kind, ob es mitspielt.', then: 'Das neue Kind strahlt. Dein Freund murrt erst, dann spielt es richtig gut mit.', think: 'Wie hast du dich an deinem ersten Tag an einem neuen Ort gefühlt?' },
      { label: 'Ich höre auf meinen Freund.', then: 'Ihr spielt zu fünft weiter. Das neue Kind geht allein zur Bank.', think: 'Was hätte das neue Kind sich gewünscht?' },
      { label: 'Ich rede erst mit meinem Freund.', then: 'Dein Freund sagt: „Na gut, aber nur heute.“ Am Ende fragt er selbst, ob es morgen wieder mitspielt.', think: 'Wie kann man einen Freund umstimmen, ohne zu streiten?' } ] },
    { title: 'Die Gruppennachricht', dilemma: true, reward: { hp: 5 }, text: 'Auf dem Tablet deiner großen Schwester siehst du eine Gruppennachricht. Ein Kind aus deiner Klasse wird dort jeden Tag ausgelacht.', opts: [
      { label: 'Hol dir Hilfe bei einem Erwachsenen.', then: 'Du zeigst es deinen Eltern. Sie sprechen mit der Lehrerin, und die Klasse redet darüber.', think: 'Warum ist Hilfe holen kein Petzen?' },
      { label: 'Ich frage das Kind, wie es ihm geht.', then: 'Das Kind ist froh, dass jemand fragt. Ihr beschließt, es gemeinsam einem Erwachsenen zu erzählen.', think: 'Was kann ein einziges freundliches Wort bewirken?' },
      { label: 'Ich tue so, als hätte ich nichts gesehen.', then: 'Das Auslachen geht weiter. Du musst noch oft daran denken.', think: 'Was hätte das Kind gebraucht? Wem könntest du es noch erzählen?' } ] },
    { title: 'Das zerbrochene Lineal', dilemma: true, reward: { hp: 5 }, text: 'Du hast aus Versehen das Lineal deines Freundes zerbrochen. Er hat es noch nicht gemerkt.', opts: [
      { label: 'Ich sage es ihm sofort.', then: 'Er ist erst sauer. Dann sagt er: „Gut, dass du es gesagt hast.“ Du bringst ihm morgen ein neues mit.', think: 'Warum fällt die Wahrheit manchmal so schwer?' },
      { label: 'Ich lege es zurück und sage nichts.', then: 'Später findet er es. Er weiß nicht, wer es war, und schaut alle misstrauisch an.', think: 'Was passiert mit dem Vertrauen, wenn etwas verschwiegen wird?' },
      { label: 'Ich kaufe heimlich ein neues.', then: 'Er hat wieder ein Lineal, aber du hast ein ungutes Gefühl im Bauch.', think: 'Ist das Problem jetzt gelöst? Was fehlt noch?' } ] },
    { title: 'Der Pulli von Oma', dilemma: true, reward: { hp: 5 }, text: 'Oma hat dir einen Pulli gestrickt. Er kratzt, und die Farbe gefällt dir nicht. Oma fragt: „Gefällt er dir?“', opts: [
      { label: '„Ja, er ist schön!“', then: 'Oma freut sich und strickt dir gleich noch einen.', think: 'Ist eine Notlüge in Ordnung, wenn sie jemanden schont?' },
      { label: '„Er kratzt leider.“', then: 'Oma ist kurz traurig. Dann sagt sie: „Das nächste Mal nehme ich weichere Wolle.“', think: 'Wie kann man ehrlich sein, ohne zu verletzen?' },
      { label: '„Danke, dass du dir so viel Mühe gemacht hast.“', then: 'Oma lächelt. Du hast etwas Wahres gesagt, ohne über den Pulli zu reden.', think: 'Ist das ehrlich? Oder eine Halbwahrheit?' } ] },
    { title: 'Die Einladung', dilemma: true, reward: { hp: 5 }, text: 'Du hast deinem Freund versprochen, am Samstag mit ihm Rad zu fahren. Jetzt lädt dich ein anderes Kind zum Kino ein, am selben Tag.', opts: [
      { label: 'Ich halte mein Versprechen.', then: 'Ihr habt einen schönen Tag. Dein Freund weiß, dass er sich auf dich verlassen kann.', think: 'Warum sind Versprechen wichtig?' },
      { label: 'Ich gehe ins Kino.', then: 'Der Film ist spannend. Dein Freund wartet am Samstag vergeblich und ist enttäuscht.', think: 'Wie hättest du das besser lösen können?' },
      { label: 'Ich frage, ob wir alle zusammen etwas machen.', then: 'Ihr fahrt am Samstag Rad und geht am Sonntag zu dritt ins Kino.', think: 'Ist das ein Kompromiss? Wer hat dabei nachgegeben?' } ] },
    { title: 'Der Streit um die Schaukel', dilemma: true, reward: { hp: 5 }, text: 'Zwei Kinder aus deiner Klasse streiten laut um die Schaukel. Eins fängt an zu weinen.', opts: [
      { label: 'Ich biete an zu schlichten.', then: 'Beide erzählen nacheinander. Am Ende schaukelt jedes Kind abwechselnd fünf Minuten.', think: 'Warum darf ein Schlichter zu keinem halten?' },
      { label: 'Ich hole die Pausenaufsicht.', then: 'Die Lehrerin kommt und hilft den beiden, sich zu einigen.', think: 'Wann ist es gut, einen Erwachsenen zu holen?' },
      { label: 'Ich halte mich raus.', then: 'Der Streit geht weiter, bis die Pause vorbei ist. Keiner hat geschaukelt.', think: 'Was hätten die beiden gebraucht?' } ] },
    { title: 'Die Angeberei', dilemma: true, reward: { hp: 5 }, text: 'Ein Kind erzählt jeden Tag, wie toll seine Sachen sind, und lacht über deine alte Federtasche. Die anderen lachen mit.', opts: [
      { label: 'Ich sage ruhig: „Das tut mir weh.“', then: 'Es wird still. Das Kind murmelt: „War nicht so gemeint.“', think: 'Was ist eine Ich-Botschaft, und warum hilft sie?' },
      { label: 'Ich lache über seine Schuhe.', then: 'Jetzt lachen alle über das andere Kind. Ihr seid beide traurig.', think: 'Was sagt die Goldene Regel dazu?' },
      { label: 'Hol dir Hilfe bei einem Erwachsenen.', then: 'Die Lehrerin spricht mit der Klasse darüber, dass Auslachen wehtut. Es wird besser.', think: 'Wem kannst du erzählen, wenn dich etwas immer wieder ärgert?' } ] },
    { title: 'Der Hund vom Nachbarn', dilemma: true, reward: { hp: 5 }, text: 'Der alte Herr Krause von nebenan kann nicht mehr gut laufen. Sein Hund Bello will raus. Du wolltest eigentlich spielen.', opts: [
      { label: 'Ich frage meine Eltern und gehe mit Bello.', then: 'Herr Krause freut sich. Bello wedelt, und du hast einen neuen Freund, oder sogar zwei.', think: 'Können ein Kind, ein alter Mensch und ein Tier Freunde sein?' },
      { label: 'Ich spiele lieber.', then: 'Du hast Spaß beim Spielen. Herr Krause findet später jemand anderen, der hilft.', think: 'Muss man immer helfen? Wie kann man freundlich Nein sagen?' },
      { label: 'Ich lade meine Freunde zum Gassigehen ein.', then: 'Ihr geht zu dritt mit Bello zum Park und spielt dort weiter.', think: 'Wie lassen sich Helfen und Spielen verbinden?' } ] },
    { title: 'Die Freundschaftsbank', text: 'Auf dem Schulhof steht eine Bank. Wer dort sitzt, sucht jemanden zum Spielen. Die Hortnerin fragt dich etwas über Freundschaft.', opts: [{ label: 'Antworten', task: 'any', g: 'freundschaft', win: { item: 'trank' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Der Klassenrat', text: 'Im Klassenrat sammelt ihr Streitregeln für ein Plakat. Wer eine Frage richtig beantwortet, bekommt einen Schild.', opts: [{ label: 'Mitmachen', task: 'any', g: 'streit', win: { item: 'schild' }, lose: { xp: 5 } }, { label: 'Zuhören (+5 LP)', effect: { hp: 5 } }] },
  ];

  /* ---------- DEUTSCH: Wörterwerkstatt und Satzbaustelle (Wortlisten in woerter.js) ---------- */
  const W = typeof MW !== 'undefined' ? MW : require('./woerter.js');
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const noun = (w) => w.slice(w.indexOf(' ') + 1);
  const ARTS = ['der', 'die', 'das'];
  // a task's ids come from its words, so adding words to woerter.js keeps the learning history of the others
  const W_POOL = [];
  W.doppel.forEach(([r, f]) => W_POOL.push({ id: 'dk_' + r, mod: 'doppel', g: 'doppel', q: 'Welches Wort ist richtig geschrieben?', o: [r, f], a: 0,
    why: /ck/.test(r) ? 'Nach einem kurzen Selbstlaut schreibt man ck, nie kk.' : /tz/.test(r) ? 'Nach einem kurzen Selbstlaut schreibt man tz, nie zz.' : 'Nach einem kurzen Selbstlaut hört man einen Mitlaut, schreibt ihn aber doppelt.' }));
  const PAIR = { d: 't', t: 'd', g: 'k', k: 'g', b: 'p', p: 'b' };
  W.verlaengern.forEach(([w, l]) => { const x = w.slice(-1); W_POOL.push({ id: 'vl_' + w, mod: 'verl', g: 'verl', q: `Welcher Buchstabe fehlt? ${w.slice(0, -1)}___`, o: [x, PAIR[x]], a: 0, why: `Verlängert: ${l}`, tip: `Verlängere das Wort: ${l}` }); });
  W.dehnungsh.forEach(([r, f, s]) => W_POOL.push({ id: 'dh_' + r, mod: 'dehn', g: 'dehn', q: 'Welches Wort ist richtig geschrieben?', o: [r, f], a: 0, why: `In Silben: ${s}` }));
  W.nomen.forEach((n) => W_POOL.push({ id: 'gk_' + n, mod: 'gross', g: 'gross', q: 'Welches Wort schreibt man groß?', o: [noun(n).toLowerCase(), pick(W.verben), pick(W.adjektive)], a: 0, why: `${n} ist ein Nomen. Nomen schreibt man groß.` }));
  W.zusammen.forEach(([t1, t2, z]) => {
    const n = noun(z); const art = z.split(' ')[0]; const rest = ARTS.filter((x) => x !== art); const why = `Der Artikel kommt vom letzten Teil: ${t2}.`;
    W_POOL.push({ id: 'zs_' + z, mod: 'zus', g: 'zus', q: `${t1} + ${t2} = ?`, o: [z].concat(rest.map((x) => x + ' ' + n)), a: 0, why });
    W_POOL.push({ id: 'za_' + z, mod: 'zus', g: 'zus', q: `Welcher Artikel passt? ___ ${n}`, o: [art].concat(rest), a: 0, why });
  });
  W.rede.forEach(([b, r]) => { const words = r.split(' '); const wrong = [`„${b} ${r}“`, `„${b}“ ${r}`, `${b} „${words.slice(0, -1).join(' ')}“ ${words[words.length - 1]}`];
    W_POOL.push({ id: 'wr_' + r, mod: 'rede', g: 'rede', q: 'Wo stehen die Anführungszeichen richtig?', o: [`${b} „${r}“`].concat(shuffle(wrong).slice(0, 2)), a: 0, why: 'Nur das, was jemand sagt, steht in Anführungszeichen.' }); });
  const plain = (w) => w.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u');
  W.familien.forEach(([stem, word, fam, other]) => W_POOL.push({ id: 'wf_' + word, mod: 'stamm', g: 'stamm', q: `Welches Wort gehört zur Wortfamilie von „${word}“?`, o: [pick(fam)].concat(shuffle(other).slice(0, 2)), a: 0, why: `In allen Wörtern der Familie steckt der Wortstamm „${stem}“: ${fam.join(', ')}.` }));
  W.nachsilben.forEach(([w, r, f1, f2]) => { const nounForm = ARTS.includes(r.split(' ')[0]);
    W_POOL.push({ id: 'ns_' + w, t: 2, mod: 'stamm', g: 'stamm', q: `Bilde ${nounForm ? 'das Nomen' : 'das Adjektiv'} zu „${w}“.`, o: [r, f1, f2], a: 0 }); });
  W.vorsilben.forEach(([q, r, f1, f2]) => W_POOL.push({ id: 'vs_' + r, t: 2, mod: 'stamm', g: 'stamm', q: `Welches Wort passt? ${q}`, o: [r, f1, f2], a: 0 }));
  function trennWhy(r) {
    const [a, b] = r.split('-');
    if (/^(ck|ch|sch|ph)/.test(b)) return `${b.match(/^(ck|sch|ch|ph)/)[0]} bleibt zusammen: ${r}.`;
    if (/s$/.test(a) && /^t/.test(b)) return `st wird getrennt: ${r}.`;
    if (/[^aeiouäöü]$/i.test(a) && /^[^aeiouäöü]/i.test(b)) return `Von mehreren Mitlauten kommt nur der letzte in die neue Zeile: ${r}.`;
    if (/^[aeiouäöü]|[aeiouäöü]{2}$/i.test(r.replace('-', ''))) return `Ein einzelner Buchstabe wird nicht abgetrennt: ${r}.`;
    return `Sprich in Silben: ${r}.`;
  }
  W.trennung.forEach(([r, f1, f2]) => W_POOL.push({ id: 'tr_' + r, mod: 'trenn', g: 'trenn', q: `Wie trennst du „${r.replace('-', '')}“ am Zeilenende?`, o: [r, f1, f2], a: 0, why: trennWhy(r) }));
  W.aufzaehlung.forEach((x) => { const none = x.replace(/,/g, ''); const wrong = [none, x.replace(' und ', ', und '), none.replace(' und ', ', und ')];
    W_POOL.push({ id: 'ko_' + x, mod: 'komma', g: 'komma', q: 'Wo stehen die Kommas richtig?', o: [x].concat(shuffle(wrong).slice(0, 2)), a: 0, why: 'Zwischen den Teilen einer Aufzählung steht ein Komma. Vor „und“ steht keins.' }); });
  W.aberdenn.forEach((x) => { const c = x.match(/, (aber|denn) /)[1]; const none = x.replace(',', ''); const wrong = [none, none.replace(` ${c} `, ` ${c}, `), x.replace(` ${c} `, ` ${c}, `)];
    W_POOL.push({ id: 'ko_' + x, mod: 'komma', g: 'komma', q: 'Wo steht das Komma richtig?', o: [x].concat(shuffle(wrong).slice(0, 2)), a: 0, why: `Vor „${c}“ steht ein Komma.` }); });
  W.rede.forEach(([b, r]) => { const s = b.slice(0, -1);
    W_POOL.push({ id: 'kd_' + r, mod: 'komma', g: 'komma', q: 'Welches Satzzeichen gehört hinter den Begleitsatz?', o: [`${b} „${r}“`, `${s}, „${r}“`, `${s} „${r}“`], a: 0, why: 'Vor der wörtlichen Rede steht nach dem Begleitsatz ein Doppelpunkt.' }); });
  W.grosssaetze.forEach((x) => { const word = x.match(/\[(.+?)\]/)[1]; const shown = x.replace(`[${word}]`, word.toLowerCase());
    const small = shown.split(' ').slice(1).map((w) => w.replace(/[.,!?]/g, '')).filter((w) => w && w !== word.toLowerCase() && w === w.toLowerCase());
    W_POOL.push({ id: 'gs_' + x, t: 2, mod: 'gross', g: 'gross', q: `Welches Wort schreibt man groß? „${shown}“`, o: [word.toLowerCase()].concat(shuffle(small).slice(0, 2)), a: 0, why: `„${word}“ ist hier ein Nomen. Nomen schreibt man groß.` }); });
  // dictionary order only needs the first three letters; woerter.js keeps those free of umlauts
  const abcKey = (w) => w.slice(0, 3).toLowerCase();
  function abcTask() {
    const first = pick(W.abc)[0]; const same = W.abc.filter((w) => w[0] === first);
    const from = shuffle(same.length >= 4 && Math.random() < 0.5 ? same : W.abc); const words = [];
    for (const w of from.concat(shuffle(W.abc))) if (words.length < 4 && !words.some((x) => abcKey(x) === abcKey(w))) words.push(w);
    words.sort((a, b) => (abcKey(a) < abcKey(b) ? -1 : 1));
    const items = words.map((w) => ({ id: 'w_' + w, text: w }));
    return { kind: 'order', mod: 'abc', tier: 1, group: 'abc:1', note: 'abc', q: 'Tippe die Wörter so an, wie sie im Wörterbuch stehen.', items, order: items.map((x) => x.id), display: shuffle(items), qid: 'abc_' + words.join('_') };
  }
  const W_NOTES = {
    doppel: { title: 'Doppelte Mitlaute, ck und tz', lines: ['Nach einem kurzen Selbstlaut (a, e, i, o, u, ä, ö, ü) folgen zwei Mitlaute.', 'Hörst du nur einen Mitlaut, schreibst du ihn doppelt: die Sonne, die Tasse.', 'Statt kk schreibt man ck: die Jacke. Statt zz schreibt man tz: die Katze.'] },
    verl: { title: 'Verlängern', lines: ['Am Wortende klingen d und t, g und k, b und p gleich.', 'Verlängere das Wort, dann hörst du den Unterschied: der Hund, die Hun-de.', 'Bei Adjektiven hilft ein Nomen dahinter: gelb, der gel-be Ball.'] },
    dehn: { title: 'Silbentrennendes h', lines: ['Manchmal steht zwischen zwei Silben ein h: ge-hen, die Kü-he.', 'Man hört es kaum. Sprich das Wort deutlich in Silben.', 'Bei Wörtern mit einer Silbe hilft Verlängern: der Schuh, die Schu-he.'] },
    gross: { title: 'Großschreibung', lines: ['Nomen schreibt man groß: der Hund, die Tasche.', 'Vor ein Nomen passt ein Artikel: der, die oder das.', 'Verben (laufen) und Adjektive (bunt) schreibt man klein.', 'Auch Gefühle und Dinge, die man nicht anfassen kann, sind Nomen: die Freude, das Glück.', 'Steht ein Begleiter davor, wird ein Verb oder Adjektiv zum Nomen: das Lachen, beim Malen, das Rot, etwas Schönes.'] },
    zus: { title: 'Zusammengesetzte Wörter', lines: ['Aus zwei Nomen wird ein neues Wort: die Schule + der Hof = der Schulhof.', 'Der Artikel richtet sich nach dem letzten Teil.'] },
    abc: { title: 'Wörterbuch', lines: ['Im Wörterbuch stehen die Wörter nach dem ABC.', 'Ist der erste Buchstabe gleich, entscheidet der zweite, dann der dritte: Bach, Ball, Banane, Baum.'] },
    stamm: { title: 'Wortstamm und Wortfamilie', lines: ['Wörter mit demselben Wortstamm bilden eine Wortfamilie: fahren, der Fahrer, die Abfahrt.', 'Der Stamm wird in der ganzen Familie gleich geschrieben: packen, er packt. Aus a kann ä werden: kalt, die Kälte.', 'Vorsilben stehen vorn: ver-, be-, ent-, vor- (vergessen, besuchen).', 'Nachsilben stehen hinten. Mit -ung, -heit, -keit wird ein Nomen daraus (die Wohnung, die Freiheit), mit -lich, -ig, -bar ein Adjektiv (freundlich, sonnig, essbar).'] },
    trenn: { title: 'Worttrennung', lines: ['Man trennt nach Sprechsilben: Gar-ten, Blu-me.', 'Von mehreren Mitlauten kommt nur der letzte in die neue Zeile: Kin-der, Kat-ze, Fens-ter.', 'ck, ch, sch und ph bleiben zusammen: Zu-cker, Ku-chen, Ta-sche.', 'Ein einzelner Buchstabe am Anfang oder Ende wird nicht abgetrennt: Ele-fant, nicht E-lefant.'] },
    komma: { title: 'Komma und Doppelpunkt', lines: ['Bei Aufzählungen steht zwischen den Teilen ein Komma: Äpfel, Birnen und Nüsse.', 'Vor „und“ und „oder“ in der Aufzählung steht kein Komma.', 'Vor „aber“ und „denn“ steht ein Komma: Ich bleibe zu Hause, denn ich bin krank.', 'Vor der wörtlichen Rede steht nach dem Begleitsatz ein Doppelpunkt: Tom ruft: „Der Bus kommt!“'] },
    rede: { title: 'Wörtliche Rede', lines: ['Was jemand sagt, steht in Anführungszeichen: „…“.', 'Der Begleitsatz sagt, wer spricht. Danach steht ein Doppelpunkt.', 'Das Satzzeichen der Rede steht vor dem schließenden Anführungszeichen: Mia sagt: „Ich komme mit.“'] },
  };
  const W_MODULES = {
    doppel: { name: 'Doppelt, ck, tz', icon: '✌️', maxTier: 1, worldCap: [1], dmg: 12 },
    verl: { name: 'Verlängern', icon: '↔️', maxTier: 1, worldCap: [1], dmg: 12 },
    dehn: { name: 'Silbentrennendes h', icon: '🔡', maxTier: 1, worldCap: [1], dmg: 12 },
    gross: { name: 'Groß oder klein', icon: '🔠', maxTier: 2, worldCap: [2], dmg: 10 },
    zus: { name: 'Zusammengesetzte Wörter', icon: '🧩', maxTier: 1, worldCap: [1], dmg: 12 },
    abc: { name: 'Wörterbuch', icon: '📖', maxTier: 1, worldCap: [1], dmg: 16 },
    rede: { name: 'Wörtliche Rede', icon: '💬', maxTier: 1, worldCap: [1], dmg: 14 },
    stamm: { name: 'Wortfamilie', icon: '🌳', maxTier: 2, worldCap: [2], dmg: 12 },
    trenn: { name: 'Worttrennung', icon: '✂️', maxTier: 1, worldCap: [1], dmg: 12 },
    komma: { name: 'Komma und Doppelpunkt', icon: '🖋️', maxTier: 1, worldCap: [1], dmg: 14 },
  };
  const W_TUT = {
    'doppel:1': { title: 'Doppelt, ck, tz', steps: ['Zwei Schreibweisen, nur eine ist richtig.', 'Sprich das Wort langsam. Ist der Selbstlaut kurz, folgt ein doppelter Mitlaut, ck oder tz.', 'Beispiel: „die Sonne“ oder „die Sone“? Das o ist kurz, also: die Sonne.', 'Tippe auf das richtige Wort.'] },
    'verl:1': { title: 'Verlängern', steps: ['Am Ende fehlt ein Buchstabe: d oder t, g oder k, b oder p.', 'Verlängere das Wort, dann hörst du ihn.', 'Beispiel: der Hun_ → die Hun-de. Man hört ein d, also: der Hund.', 'Tippe auf den fehlenden Buchstaben.'] },
    'dehn:1': { title: 'Silbentrennendes h', steps: ['Zwei Schreibweisen, nur eine ist richtig.', 'Sprich das Wort in Silben. Gehört zwischen die Silben ein h?', 'Beispiel: „gehen“ oder „geen“? In Silben: ge-hen, also mit h.', 'Bei Wörtern mit einer Silbe verlängerst du: der Schuh, die Schu-he.'] },
    'gross:1': { title: 'Groß oder klein', steps: ['Drei Wörter, alle kleingeschrieben. Eines davon ist ein Nomen.', 'Probe: Passt der, die oder das davor?', 'Beispiel: hund, laufen, bunt. „Der Hund“ passt, also schreibt man Hund groß.', 'Tippe auf das Wort, das großgeschrieben wird.'] },
    'zus:1': { title: 'Zusammengesetzte Wörter', steps: ['Zwei Nomen werden zu einem Wort.', 'Der Artikel kommt immer vom letzten Teil.', 'Beispiel: die Schule + der Hof = der Schulhof, weil es „der Hof“ heißt.', 'Tippe auf die Antwort mit dem richtigen Artikel.'] },
    'abc:1': { title: 'Wörterbuch', steps: ['Vier Wörter sollen in die Reihenfolge wie im Wörterbuch.', 'Schau auf den ersten Buchstaben. Ist er gleich, schau auf den zweiten, dann auf den dritten.', 'Beispiel: Baum, Bach, Ball → Bach (c), Ball (l), Baum (u).', 'Tippe die Wörter der Reihe nach an. Nochmal tippen nimmt ein Wort wieder heraus.'] },
    'gross:2': { title: 'Groß im Satz', steps: ['Ein Satz, ein Wort darin ist falsch kleingeschrieben.', 'Auch Gefühle (die Freude) und Verben oder Adjektive mit Begleiter (beim Lachen, das Rot, etwas Schönes) sind Nomen.', 'Beispiel: „Beim lachen tut mir der Bauch weh.“ Beim heißt „bei dem“, also: beim Lachen.', 'Tippe auf das Wort, das großgeschrieben wird.'] },
    'stamm:1': { title: 'Wortfamilie', steps: ['Wörter mit demselben Wortstamm gehören zu einer Familie.', 'Der Stamm wird in der ganzen Familie gleich geschrieben: packen, er packt, die Packung. Ein verwandtes Wort hilft: der Hund mit d, weil man in „die Hunde“ das d hört.', 'Beispiel: fahren. Der Fahrer, die Fahrt und die Abfahrt haben den Stamm „fahr“. Die Farbe nicht.', 'Tippe auf das Wort aus der Wortfamilie.'] },
    'stamm:2': { title: 'Vorsilben und Nachsilben', steps: ['Mit Vorsilben und Nachsilben entstehen neue Wörter.', 'Vorsilben: ver-, be-, ent-, vor-. Nachsilben für Nomen: -ung, -heit, -keit. Für Adjektive: -lich, -ig, -bar.', 'Beispiel: fröhlich + keit = die Fröhlichkeit. Nach -lich und -ig steht -keit.', 'Tippe auf das richtige Wort.'] },
    'trenn:1': { title: 'Worttrennung', steps: ['Ein Wort passt nicht mehr in die Zeile. Wo setzt du den Trennstrich?', 'Sprich das Wort in Silben. ck, ch, sch und ph bleiben zusammen, st wird getrennt.', 'Beispiel: Zucker → Zu-cker. Fenster → Fens-ter.', 'Tippe auf das richtig getrennte Wort.'] },
    'komma:1': { title: 'Komma und Doppelpunkt', steps: ['Drei Sätze, nur einer hat die Satzzeichen an der richtigen Stelle.', 'Aufzählung: Komma zwischen den Teilen, vor „und“ keins. Vor „aber“ und „denn“ steht ein Komma.', 'Beispiel: Ich kaufe Äpfel, Birnen und Nüsse.', 'Tippe auf den richtigen Satz.'] },
    'rede:1': { title: 'Wörtliche Rede', steps: ['Jemand sagt etwas. Wo gehören die Anführungszeichen hin?', 'Nur das Gesagte steht in „…“. Davor steht der Begleitsatz mit Doppelpunkt.', 'Beispiel: Mia sagt: „Ich komme mit.“', 'Tippe auf den richtig geschriebenen Satz.'] },
  };
  const W_STARTERS = [
    { id: 'graphit', type: 'normal', shape: 'pencil', names: ['Graphit', 'Graphit', 'Graphit'], hp: 65, desc: 'Ein Bleistift mit frisch gespitzter Mine. Landet manchmal einen Volltreffer (doppelter Schaden).', perk: 'crit',
      attacks: [{ name: 'Doppelstrich', mod: 'doppel' }, { name: 'Silbenbogen', mod: 'verl' }, { name: 'Großbuchstabe', mod: 'gross' }, { name: 'Daumenregister', mod: 'abc' }] },
  ];
  const W_EXTRA = { doppel: 'Doppelstrich', verl: 'Silbenbogen', dehn: 'Silbenklatschen', gross: 'Großbuchstabe', zus: 'Wortkleber', abc: 'Daumenregister', rede: 'Gänsefüßchen', stamm: 'Wurzelgriff', trenn: 'Trennstrich', komma: 'Beistrich' };
  const W_ENEMIES = {
    1: {
      normal: [
        { name: 'Der Buchstabendreher', type: 'normal', shape: 'buchstabendreher', hp: 26, atk: 3 },
        { name: 'Das Eselsohr', type: 'normal', shape: 'eselsohr', hp: 24, atk: 4 },
        { name: 'Der Stummel', type: 'feuer', shape: 'stummel', hp: 28, atk: 4 },
        { name: 'Die Kritzelei', type: 'wasser', shape: 'kritzelei', hp: 30, atk: 3 },
      ],
      elite: { name: 'Der Radierer', type: 'pflanze', shape: 'radierer', hp: 45, atk: 5 },
      boss: { name: 'Der Fehlerteufel', acc: 'den Fehlerteufel', type: 'feuer', shape: 'fehlerteufel', hp: 70, atk: 6, boss: true },
    },
  };
  const W_MOVES = ['Buchstabentausch', 'Eselsohrknick', 'Radierspur', 'Kringel am Rand', 'Spitzerspäne', 'Zeilensprung'];
  const W_EVENTS = [
    { title: 'Die Schulbibliothek', text: 'Die Bibliothekarin stellt neue Bücher ins Regal. Hilfst du ihr bei der Reihenfolge, schenkt sie dir einen Trank.', opts: [{ label: 'Helfen', task: 'abc', win: { item: 'trank' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Das Diktat', text: 'Auf dem Lehrertisch liegt ein Diktat. Findest du das richtig geschriebene Wort, bekommst du einen Schild.', opts: [{ label: 'Nachsehen', task: 'any', win: { item: 'schild' }, lose: { hp: -6 } }, { label: 'Liegen lassen', effect: {} }] },
    { title: 'Der Briefträger', text: 'Der Briefträger hat eine Postkarte mit einem Fehler. Hilfst du ihm, verrät er dir eine Eselsbrücke.', opts: [{ label: 'Helfen', task: 'any', win: { item: 'lupe' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Der Vorlesetag', text: 'In der Aula liest die vierte Klasse vor. Wer eine Frage zur wörtlichen Rede beantwortet, bekommt 20 XP.', opts: [{ label: 'Mitmachen', task: 'rede', win: { xp: 20 }, lose: { xp: 5 } }, { label: 'Zuhören (+5 LP)', effect: { hp: 5 } }] },
    { title: 'Die Hofpause', text: 'Es klingelt zur großen Pause. Du setzt dich auf eine Bank und isst dein Brot.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
  ];

  const S_POOL = [];
  const KLASSEN = ['Nomen', 'Verb', 'Adjektiv', 'Pronomen', 'Artikel'];
  const wortart = (id, q, k) => S_POOL.push({ id, mod: 'wortart', g: 'wortart', q, o: [k].concat(shuffle(KLASSEN.filter((x) => x !== k)).slice(0, 2)), a: 0 });
  W.nomen.forEach((n) => wortart('wa_' + n, `Welche Wortart ist „${noun(n)}“?`, 'Nomen'));
  W.verben.forEach((w) => wortart('wa_' + w, `Welche Wortart ist „${w}“?`, 'Verb'));
  W.adjektive.forEach((w) => wortart('wa_' + w, `Welche Wortart ist „${w}“?`, 'Adjektiv'));
  W.pronomen.forEach((w) => wortart('wa_' + w, `Welche Wortart ist „${w}“?`, 'Pronomen'));
  // articles are asked with a noun, alone „das“ could also be a pronoun
  [['der', ['der']], ['die', ['die']], ['das', ['das']], ['ein', ['der', 'das']], ['eine', ['die']]].forEach(([a, of]) => {
    const n = noun(pick(W.nomen.filter((x) => of.includes(x.split(' ')[0])))); wortart('wa_art_' + a, `Welche Wortart ist „${a}“ in „${a} ${n}“?`, 'Artikel');
  });
  W.zeitformen.forEach(([p, t, f]) => {
    S_POOL.push(Math.random() < 0.5 ? { id: 'zt_' + p, mod: 'zeit', g: 'zeit', q: `Setze ins Präteritum: „${p}“`, o: [t, f, p], a: 0 } : { id: 'zt_' + p, mod: 'zeit', g: 'zeit', q: `Setze ins Präsens: „${t}“`, o: [p, t, f], a: 0 });
    const past = Math.random() < 0.5; S_POOL.push({ id: 'zb_' + p, mod: 'zeit', g: 'zeit', q: `In welcher Zeitform steht „${past ? t : p}“?`, o: past ? ['Präteritum', 'Präsens'] : ['Präsens', 'Präteritum'], a: 0 });
  });
  const STUFEN = ['Grundstufe', 'Mehrstufe', 'Meiststufe'];
  W.steigerung.forEach((s) => {
    const k = Math.floor(Math.random() * 3); const o = [s[k]].concat(s.filter((_, i) => i !== k));
    S_POOL.push({ id: 'st_' + s[0], mod: 'steig', g: 'steig', q: k === 0 ? `Wie heißt die Grundstufe von „${s[2]}“?` : `Wie heißt die ${STUFEN[k]} von „${s[0]}“?`, o, a: 0 });
    const j = Math.floor(Math.random() * 3); S_POOL.push({ id: 'ss_' + s[0], mod: 'steig', g: 'steig', q: `Welche Stufe ist „${s[j]}“?`, o: [STUFEN[j]].concat(STUFEN.filter((_, i) => i !== j)), a: 0 });
  });
  W.vergleiche.forEach(([q, x]) => S_POOL.push({ id: 'vg_' + q, mod: 'steig', g: 'steig', q: `Als oder wie? ${q}`, o: [x, x === 'als' ? 'wie' : 'als'], a: 0, why: x === 'als' ? 'Nach der Mehrstufe steht „als“.' : 'Nach „so“ und der Grundstufe steht „wie“.' }));
  // '[Subjekt] | Prädikat | …' → parts as written mid-sentence, subject index; the predicate is always the second part
  const SAETZE = W.saetze.map((s) => { const raw = s.split('|').map((x) => x.trim()); return { parts: raw.map((x) => x.replace(/^\[|\]$/g, '')), s: raw.findIndex((x) => x.startsWith('[')) }; });
  SAETZE.forEach(({ parts, s }) => {
    const shown = [cap(parts[0])].concat(parts.slice(1)); const key = parts.join(' ');
    S_POOL.push({ id: 'sg_s_' + key, mod: 'satzglied', g: 'satzglied', q: 'Tippe auf das Subjekt. Frage: Wer oder was?', o: shown, a: s, inline: true });
    S_POOL.push({ id: 'sg_p_' + key, mod: 'satzglied', g: 'satzglied', q: 'Tippe auf das Prädikat. Frage: Was tut jemand?', o: shown, a: 1, inline: true });
  });
  // three parts starting with the subject: the only other order with the verb second puts the last part first
  const UMSTELL = SAETZE.filter((x) => x.parts.length === 3 && x.s === 0).map((x) => x.parts);
  function umstellTask() {
    const parts = pick(UMSTELL); const items = [2, 1, 0].map((i) => ({ id: 'u' + i, text: parts[i] }));
    return { kind: 'order', mod: 'umstell', tier: 1, group: 'umstell:1', note: 'umstell', q: `Stelle den Satz um: „${cap(parts.join(' '))}.“ Tippe die Satzglieder in der neuen Reihenfolge an.`, items, order: items.map((x) => x.id), display: shuffle(items), qid: 'um_' + parts.join(' ') };
  }
  const OB = Object.keys(W.oberbegriffe);
  OB.forEach((o) => {
    const ws = W.oberbegriffe[o]; const rest = shuffle(OB.filter((x) => x !== o)).slice(0, 2);
    S_POOL.push({ id: 'ob_' + o, mod: 'ober', g: 'ober', q: `Welcher Oberbegriff passt zu: ${shuffle(ws).slice(0, 3).join(', ')}?`, o: [o].concat(rest), a: 0 });
    S_POOL.push({ id: 'og_' + o, mod: 'ober', g: 'ober', q: `Welches Wort gehört zu „${o}“?`, o: [pick(ws)].concat(rest.map((x) => pick(W.oberbegriffe[x]))), a: 0 });
  });
  W.teekessel.forEach(([w, b1, b2]) => S_POOL.push({ id: 'tk_' + w, mod: 'teekessel', g: 'teekessel', q: `Welches Wort passt zu beiden Sätzen? ${b1} ${b2}`, o: [w].concat(shuffle(W.teekessel.filter((x) => x[0] !== w)).slice(0, 2).map((x) => x[0])), a: 0 }));
  // 'sie (Mehrzahl)' and 'sie' are the same word but stand for different groups
  const word = (p) => p.split(' ')[0];
  W.ersatz.forEach(([ng, rest, p]) => {
    S_POOL.push({ id: 'er_' + ng, mod: 'ersatz', g: 'ersatz', q: `Welches Pronomen kann „${cap(ng)}“ ersetzen? „${cap(ng)} ${rest}.“`, o: [word(p)].concat(shuffle(['er', 'sie', 'es', 'wir', 'ihr'].filter((x) => x !== word(p))).slice(0, 2)), a: 0, why: `${cap(ng)} ${rest}. → ${cap(word(p))} ${rest}.` });
    S_POOL.push({ id: 'eb_' + ng, t: 2, mod: 'ersatz', g: 'ersatz', q: `Für wen steht das Pronomen? „${cap(word(p))} ${rest}.“`, o: [cap(ng)].concat(shuffle(W.ersatz.filter((x) => x[2] !== p)).slice(0, 2).map((x) => cap(x[0]))), a: 0 });
  });
  W.weglassen.forEach((x) => {
    const raw = x.split('|').map((y) => y.trim()); const a = raw.findIndex((y) => y.startsWith('[')); const parts = raw.map((y) => y.replace(/^\[|\]$/g, ''));
    const shown = [cap(parts[0])].concat(parts.slice(1)); const rest = parts.filter((_, i) => i !== a);
    S_POOL.push({ id: 'wl_' + parts.join(' '), mod: 'weglass', g: 'weglass', q: 'Welches Wort oder Satzglied kannst du weglassen? Der Satz muss richtig bleiben.', o: shown, a, inline: true, why: `${cap(rest.join(' '))}. Das ist immer noch ein richtiger Satz.` });
  });
  const conj = (v) => { const st = v.slice(0, -2); return { ich: `Ich ${st}e.`, du: `Du ${st}st.`, er: `Er ${st}t.`, sie: `Sie ${st}t.`, wir: `Wir ${v}.`, ihr: `Ihr ${st}t.`, sie2: `Sie ${v}.` }; };
  W.personen.forEach((v) => { const f = conj(v); const plural = [f.wir, f.ihr, f.sie2];
    [['ich', f.wir], ['du', f.ihr], ['er', f.sie2], ['sie', f.sie2]].forEach(([k, r]) => S_POOL.push({ id: `pp_${v}_${k}`, mod: 'pronomen', g: 'pronomen', q: `Setze in die Mehrzahl: „${f[k]}“`, o: [r].concat(plural.filter((x) => x !== r)), a: 0 }));
    [['wir', f.ich], ['ihr', f.du]].forEach(([k, r]) => S_POOL.push({ id: `pp_${v}_${k}`, mod: 'pronomen', g: 'pronomen', q: `Setze in die Einzahl: „${f[k]}“`, o: [r].concat([f.ich, f.du, f.er].filter((x) => x !== r)).slice(0, 3), a: 0 }));
  });
  W.redensarten.forEach(([r, m, f1, f2, h]) => S_POOL.push({ id: 'ra_' + r, mod: 'redensart', g: 'redensart', q: `Was bedeutet „${r}“?`, o: [m, f1, f2], a: 0, more: h }));
  const S_NOTES = {
    wortart: { title: 'Wortarten', lines: ['Nomen sind Namen für Menschen, Tiere und Dinge: der Hund, die Schule.', 'Verben sagen, was jemand tut: laufen, lesen.', 'Adjektive sagen, wie etwas ist: groß, bunt.', 'Pronomen stehen für ein Nomen: ich, du, er, sie, es, wir, ihr.', 'Artikel begleiten ein Nomen: der, die, das, ein, eine.'] },
    zeit: { title: 'Zeitformen', lines: ['Präsens (Gegenwart): Es passiert jetzt. Er läuft.', 'Präteritum (Vergangenheit): Es ist schon passiert. Er lief.', 'Viele Verben ändern im Präteritum ihren Selbstlaut: singen, sang.'] },
    steig: { title: 'Steigerung', lines: ['Grundstufe: groß. Mehrstufe: größer. Meiststufe: am größten.', 'Nach der Mehrstufe vergleicht man mit „als“: Der Turm ist höher als das Haus.', 'Mit „so“ und der Grundstufe vergleicht man mit „wie“: Lea ist so groß wie Ben.'] },
    satzglied: { title: 'Subjekt und Prädikat', lines: ['Das Prädikat ist das Verb im Satz. Es sagt, was jemand tut: Der Hund schläft.', 'Das Subjekt findest du mit der Frage „Wer oder was?“: Wer schläft? Der Hund.', 'Im Aussagesatz steht das Prädikat an zweiter Stelle.'] },
    umstell: { title: 'Umstellprobe', lines: ['Satzglieder sind Wörter, die beim Umstellen zusammenbleiben.', 'Der Hund | schläft | im Korb. Umgestellt: Im Korb | schläft | der Hund.', 'Das Prädikat bleibt an zweiter Stelle.'] },
    ober: { title: 'Oberbegriffe', lines: ['Ein Oberbegriff fasst Wörter zusammen: Apfel, Birne und Kirsche sind Obst.', 'Hammer, Säge und Zange sind Werkzeuge.'] },
    teekessel: { title: 'Teekesselwörter', lines: ['Ein Wort kann zwei Bedeutungen haben: die Bank im Park und die Bank für Geld.', 'Man schreibt und spricht beide gleich.'] },
    ersatz: { title: 'Ersatzprobe', lines: ['Eine Nominalgruppe kann man durch ein Pronomen ersetzen: Der kleine Hund bellt. → Er bellt.', 'der → er, die → sie, das → es. Mehrere → sie.', 'Paul und ich → wir. Lena und du → ihr.'] },
    weglass: { title: 'Weglassprobe', lines: ['Manche Wörter kann man weglassen, und der Satz bleibt richtig: Lena trägt heute eine Mütze. → Lena trägt eine Mütze.', 'Oft sind das Adjektive (der kleine Hund) oder Angaben zu Ort und Zeit (im Garten, am Sonntag).', 'Subjekt und Prädikat kann man nie weglassen.'] },
    pronomen: { title: 'Personalpronomen', lines: ['Einzahl: ich, du, er, sie, es.', 'Mehrzahl: wir, ihr, sie.', 'Das Verb ändert sich mit: ich lache, wir lachen, du lachst, ihr lacht.'] },
    redensart: { title: 'Redensarten und Sprichwörter', lines: ['Eine Redensart meint etwas anderes, als die Wörter sagen: „Schwein haben“ heißt Glück haben.', 'Ein Sprichwort ist ein ganzer Satz mit einem Rat: „Übung macht den Meister.“', 'Viele kommen aus alter Zeit. Woher, steht nach der Antwort.'] },
  };
  const S_MODULES = {
    wortart: { name: 'Wortarten', icon: '🏷️', maxTier: 1, worldCap: [1], dmg: 12 },
    zeit: { name: 'Zeitformen', icon: '⏳', maxTier: 1, worldCap: [1], dmg: 12 },
    steig: { name: 'Steigerung', icon: '📶', maxTier: 1, worldCap: [1], dmg: 12 },
    satzglied: { name: 'Subjekt und Prädikat', icon: '🎯', maxTier: 1, worldCap: [1], dmg: 14 },
    umstell: { name: 'Umstellprobe', icon: '🔀', maxTier: 1, worldCap: [1], dmg: 16 },
    ober: { name: 'Oberbegriffe', icon: '🗂️', maxTier: 1, worldCap: [1], dmg: 10 },
    teekessel: { name: 'Teekesselwörter', icon: '🫖', maxTier: 1, worldCap: [1], dmg: 12 },
    ersatz: { name: 'Ersatzprobe', icon: '🔁', maxTier: 2, worldCap: [2], dmg: 12 },
    weglass: { name: 'Weglassprobe', icon: '🧽', maxTier: 1, worldCap: [1], dmg: 14 },
    pronomen: { name: 'Personalpronomen', icon: '👥', maxTier: 1, worldCap: [1], dmg: 12 },
    redensart: { name: 'Redensarten', icon: '💭', maxTier: 1, worldCap: [1], dmg: 12 },
  };
  const S_TUT = {
    'wortart:1': { title: 'Wortarten', steps: ['Zu welcher Wortart gehört das Wort?', 'Nomen: der Hund. Verb: laufen. Adjektiv: bunt. Pronomen: er. Artikel: der, ein.', 'Beispiel: „schnell“. Wie ist etwas? Schnell. Also ein Adjektiv.', 'Tippe auf die richtige Wortart.'] },
    'zeit:1': { title: 'Zeitformen', steps: ['Präsens heißt: Es passiert jetzt. Präteritum heißt: Es ist schon passiert.', 'Setze „heute“ oder „gestern“ davor und hör, was passt.', 'Beispiel: „er lief“. Gestern lief er, also Präteritum.', 'Tippe auf die richtige Antwort.'] },
    'steig:1': { title: 'Steigerung', steps: ['Adjektive kann man steigern: Grundstufe, Mehrstufe, Meiststufe.', 'Beispiel: klein, kleiner, am kleinsten.', 'Nach der Mehrstufe steht „als“: kleiner als. Nach „so“ und der Grundstufe steht „wie“: so klein wie.', 'Tippe auf die richtige Antwort.'] },
    'satzglied:1': { title: 'Subjekt und Prädikat', steps: ['Das Prädikat ist das Verb. Es sagt, was jemand tut.', 'Das Subjekt findest du mit der Frage „Wer oder was?“.', 'Beispiel: Der Hund schläft im Korb. Wer schläft? Der Hund ist das Subjekt. Schläft ist das Prädikat.', 'Tippe im Satz auf das gesuchte Satzglied.'] },
    'umstell:1': { title: 'Umstellprobe', steps: ['Ein Satz hat drei Satzglieder. Stelle sie so um, dass ein neuer Satz entsteht.', 'Ein anderes Satzglied kommt nach vorn. Das Prädikat bleibt an zweiter Stelle.', 'Beispiel: der Hund | schläft | im Korb wird zu: im Korb | schläft | der Hund.', 'Tippe die Satzglieder in der neuen Reihenfolge an.'] },
    'ober:1': { title: 'Oberbegriffe', steps: ['Ein Oberbegriff fasst viele Wörter zusammen.', 'Beispiel: Apfel, Birne, Kirsche gehören zum Oberbegriff Obst.', 'Manchmal ist der Oberbegriff gegeben, dann suchst du ein Wort, das dazugehört.', 'Tippe auf die richtige Antwort.'] },
    'teekessel:1': { title: 'Teekesselwörter', steps: ['Ein Teekesselwort hat zwei Bedeutungen und wird gleich geschrieben.', 'Lies beide Sätze. Welches Wort passt zu beiden?', 'Beispiel: Darauf sitzt man im Park. Dort bringt man Geld hin. Das Wort ist: die Bank.', 'Tippe auf das Wort.'] },
    'ersatz:1': { title: 'Ersatzprobe', steps: ['Eine Nominalgruppe wird durch ein Pronomen ersetzt.', 'der → er, die → sie, das → es, mehrere → sie. Mit „ich“ → wir, mit „du“ → ihr.', 'Beispiel: Der kleine Hund bellt laut. → Er bellt laut.', 'Tippe auf das passende Pronomen.'] },
    'ersatz:2': { title: 'Ersatzprobe rückwärts', steps: ['Jetzt steht ein Pronomen im Satz. Für welche Nominalgruppe steht es?', 'Prüfe das Pronomen und das Verb: „Er bellt“ passt zu einem Wort mit „der“, „Sie spielen“ zu mehreren.', 'Beispiel: Er bellt laut. → Der kleine Hund bellt laut. „Die Kinder bellt laut“ passt nicht.', 'Tippe auf die passende Nominalgruppe.'] },
    'weglass:1': { title: 'Weglassprobe', steps: ['Ein Wort oder Satzglied kann weg, und der Satz bleibt richtig.', 'Lies den Satz ohne das Wort. Fehlt dann etwas Wichtiges?', 'Beispiel: Lena trägt heute eine Mütze. Ohne „heute“: Lena trägt eine Mütze. Ohne „eine Mütze“: Lena trägt heute. Das geht nicht.', 'Tippe auf das Wort oder Satzglied, das wegkann.'] },
    'pronomen:1': { title: 'Einzahl und Mehrzahl', steps: ['Aus einer Person werden mehrere oder aus mehreren eine.', 'ich → wir, du → ihr, er, sie, es → sie. Das Verb ändert sich mit.', 'Beispiel: Ich lache. → Wir lachen.', 'Tippe auf den richtigen Satz.'] },
    'redensart:1': { title: 'Redensarten', steps: ['Redensarten meinen etwas anderes, als die Wörter sagen.', 'Überlege: Wann sagt man das? Was ist dann passiert?', 'Beispiel: „Schwein haben“ sagt man, wenn jemand Glück hatte. Ein Schwein ist gar nicht da.', 'Tippe auf die Bedeutung.'] },
  };
  const S_STARTERS = [
    { id: 'elle', type: 'wasser', shape: 'ruler', names: ['Elle', 'Elle', 'Elle'], hp: 80, desc: 'Ein Holzlineal, 30 Zentimeter lang. Hält viel aus.', perk: 'tank',
      attacks: [{ name: 'Farbmarker', mod: 'wortart' }, { name: 'Fragetest', mod: 'satzglied' }, { name: 'Umstellschub', mod: 'umstell' }, { name: 'Sortierkasten', mod: 'ober' }] },
  ];
  const S_EXTRA = { wortart: 'Farbmarker', zeit: 'Kalenderblatt', steig: 'Siegertreppe', satzglied: 'Fragetest', umstell: 'Umstellschub', ober: 'Sortierkasten', teekessel: 'Doppelsinn', ersatz: 'Stellvertreter', weglass: 'Tafelschwamm', pronomen: 'Namensruf', redensart: 'Volksmund' };
  const S_ENEMIES = {
    1: {
      normal: [
        { name: 'Der Satzverdreher', type: 'normal', shape: 'satzverdreher', hp: 26, atk: 3 },
        { name: 'Der Wortsalat', type: 'pflanze', shape: 'wortsalat', hp: 28, atk: 4 },
        { name: 'Das Knickheft', type: 'wasser', shape: 'knickheft', hp: 24, atk: 4 },
        { name: 'Der Punktdieb', type: 'normal', shape: 'punktdieb', hp: 30, atk: 3 },
      ],
      elite: { name: 'Der Spitzer', type: 'normal', shape: 'spitzer', hp: 45, atk: 5 },
      boss: { name: 'Der Rotstift', acc: 'den Rotstift', type: 'feuer', shape: 'rotstift', hp: 70, atk: 6, boss: true },
    },
  };
  const S_MOVES = ['Satzverdrehung', 'Punktklau', 'Wortsalat', 'Scherenschnitt', 'Kommaregen', 'Rotstiftstrich'];
  const S_EVENTS = [
    { title: 'Die Klassenzeitung', text: 'Die Klassenzeitung sucht einen Satz für die Titelseite. Hilfst du, gibt es einen Trank.', opts: [{ label: 'Helfen', task: 'any', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Fundkiste', text: 'Der Hausmeister räumt die Fundkiste auf und braucht einen Oberbegriff für jedes Fach. Für deine Hilfe gibt er dir einen Schild.', opts: [{ label: 'Helfen', task: 'ober', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Vorlesestunde', text: 'Frau Weber liest eine Geschichte vor und stellt danach eine Frage. Wer sie beantwortet, bekommt einen Schutzengel.', opts: [{ label: 'Antworten', task: 'any', win: { item: 'engel' }, lose: { xp: 5 } }, { label: 'Weiterlesen', effect: {} }] },
    { title: 'Das Rätselheft', text: 'Im Rätselheft fehlt ein Teekesselwort. Findest du es, bekommst du ein Fleißbienchen.', opts: [{ label: 'Rätseln', task: 'teekessel', win: { item: 'stern' }, lose: { xp: 5 } }, { label: 'Zuklappen', effect: {} }] },
    { title: 'Der Trinkbrunnen', text: 'Am Trinkbrunnen im Flur machst du eine Pause.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
  ];

  /* ---------- Spaced repetition selection ---------- */
  function weightedPick(items, know, seqNow) {
    const w = items.map((it) => { const k = know[it.id]; if (!k) return 4; let x = 1 + k.ws * 3; if (k.t > 0 && k.c / k.t < 0.6) x += 2; if (seqNow - (k.last || 0) < 3) x *= 0.15; return x; });
    let total = w.reduce((a, b) => a + b, 0); let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; }
    return items[items.length - 1];
  }
  // opts (optional): { g } = nur Fragen zu diesem Thema (g der Pool-Fragen, z. B. 'herkunft'); gibt es keine, dann alle des Moduls.
  // { world }: in Modi mit byWorld kommen nur Fragen und Reihenfolgen dieser Welt dran (w fehlt = Welt 1)
  function generate(mode, mod, tier, know, seqNow, opts) {
    const cfg = MODES[mode]; const world = (opts && opts.world) || 1;
    const inWorld = (p) => !cfg.byWorld || (p.w || 1) === world;
    const pool = cfg.pool.filter(inWorld);
    if (MODES[mode].gen) { const t = MODES[mode].gen(mod, tier, know, seqNow, opts); if (t) return t; } // units with their own task types (sachkunde.js)
    if (mod === 'abc') return abcTask();
    if (mod === 'umstell') return umstellTask();
    if (mod === 'ord') { const o = pick(cfg.order.filter(inWorld)); const idx = shuffle(o.items.map((_, i) => i)).slice(0, 4).sort((a, b) => a - b); const items = idx.map((i) => o.items[i]); return { kind: 'order', mod, tier: 1, group: 'ord:1', note: o.note, q: o.q, items, order: items.map((x) => x.id), display: shuffle(items), qid: o.qid + idx.join('') }; }
    if (mod === 'grow') { const items = GROW.slice(); return { kind: 'order', mod, tier: 1, group: 'grow:1', note: 'wachstum', q: 'Wie wächst die Kartoffel? Tippe die Schritte der Reihe nach an.', items, order: items.map((x) => x.id), display: shuffle(items), qid: 'grow' }; }
    if (mod === 'maerchen' && Math.random() < 0.25) { const idx = shuffle(STORY.map((_, i) => i)).slice(0, 4).sort((a, b) => a - b); const items = idx.map((i) => STORY[i]); return { kind: 'order', mod, tier: 1, group: 'story:1', note: 'maerchen', q: 'Tippe die Teile des Märchens in der richtigen Reihenfolge an.', items, order: items.map((x) => x.id), display: shuffle(items), qid: 'story_' + idx.join('') }; }
    let cands = pool.filter((p) => p.mod === mod);
    const atTier = cands.filter((p) => (p.t || 1) === tier); if (atTier.length) cands = atTier; // t: 2 marks the harder questions of a module
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
    // inline: the options are the parts of a sentence and keep their order
    const correct = e.o[e.a]; const options = e.inline ? e.o.slice() : shuffle(e.o.slice());
    return { kind: 'choice', mod, tier: e.t || 1, group: mod + ':' + (e.t || 1), note: e.g, q: e.q, options, answer: correct, why: e.why || '', more: e.more, tip: e.tip, inline: e.inline, qid: e.id, cols: options.length === 2 ? 2 : 1 };
  }
  function record(know, qid, ok, seqNow) { const k = know[qid] || (know[qid] = { c: 0, t: 0, ws: 0, last: 0 }); k.t++; if (ok) { k.c++; k.ws = 0; } else k.ws++; k.last = seqNow; }

  // Schulgarten (Sachkunde LB 3): crops for the beds and the question asked at harvest time.
  // `top` is the name of growth phase 2; questions with crop 'getreide' are asked for every grain.
  const CROPS = {
    kartoffel: { name: 'Kartoffel', ripe: 'Deine Kartoffeln sind reif.', put: 'Gesetzt', top: 'Blüte', desc: 'Die Knollen wachsen unter der Erde.' },
    weizen: { name: 'Weizen', ripe: 'Dein Weizen ist reif.', put: 'Gesät', top: 'Ähre', desc: 'Aus Weizenmehl backt man Brötchen.' },
    roggen: { name: 'Roggen', ripe: 'Dein Roggen ist reif.', put: 'Gesät', top: 'Ähre', desc: 'Aus Roggenmehl backt man dunkles Brot.' },
    hafer: { name: 'Hafer', ripe: 'Dein Hafer ist reif.', put: 'Gesät', top: 'Rispe', desc: 'Aus Hafer macht man Haferflocken.' },
  };
  const GARDEN_POOL = [
    { id: 'gk1', crop: 'kartoffel', q: 'Welchen Teil der Kartoffelpflanze essen wir?', o: ['Die Knollen', 'Die Beeren', 'Die Blüten'], a: 0 },
    { id: 'gk2', crop: 'kartoffel', q: 'Wo wachsen die neuen Kartoffeln?', o: ['Unter der Erde', 'An den Blättern', 'In der Blüte'], a: 0 },
    { id: 'gk3', crop: 'kartoffel', q: 'Darf man die grünen Beeren der Kartoffelpflanze essen?', o: ['Nein, sie sind giftig.', 'Ja, sie sind süß.', 'Ja, aber nur im Winter.'], a: 0 },
    { id: 'gk4', crop: 'kartoffel', q: 'Was setzt man im Frühjahr in die Erde, damit eine Kartoffelpflanze wächst?', o: ['Eine Saatkartoffel', 'Ein Getreidekorn', 'Eine Beere'], a: 0 },
    { id: 'gw1', crop: 'weizen', q: 'Was backt man oft aus Weizenmehl?', o: ['Brötchen', 'Haferflocken', 'Pommes'], a: 0 },
    { id: 'gw2', crop: 'weizen', q: 'Wie heißt der Teil oben am Weizen, in dem die Körner sitzen?', o: ['Die Ähre', 'Die Knolle', 'Die Wurzel'], a: 0 },
    { id: 'gw3', crop: 'weizen', q: 'Was wird in der Mühle zu Mehl gemahlen?', o: ['Die Körner', 'Die Halme', 'Die Wurzeln'], a: 0 },
    { id: 'gr1', crop: 'roggen', q: 'Was backt man oft aus Roggenmehl?', o: ['Dunkles Brot', 'Haferflocken', 'Pudding'], a: 0 },
    { id: 'gr2', crop: 'roggen', q: 'Welches Getreide hat den längsten Halm?', o: ['Roggen', 'Weizen', 'Hafer'], a: 0 },
    { id: 'gr3', crop: 'roggen', q: 'Wie heißen die langen, feinen Borsten an der Roggenähre?', o: ['Grannen', 'Wurzeln', 'Knollen'], a: 0 },
    { id: 'gh1', crop: 'hafer', q: 'Was macht man aus Hafer?', o: ['Haferflocken', 'Zucker', 'Pommes'], a: 0 },
    { id: 'gh2', crop: 'hafer', q: 'Beim Hafer hängen die Körner locker an feinen Stielen. Wie heißt das?', o: ['Rispe', 'Ähre', 'Knolle'], a: 0 },
    { id: 'gh3', crop: 'hafer', q: 'Welches Tier frisst gern Hafer?', o: ['Das Pferd', 'Der Fuchs', 'Die Katze'], a: 0 },
    { id: 'gg1', crop: 'getreide', q: 'Zu welchen Pflanzen gehört das Getreide?', o: ['Zu den Gräsern', 'Zu den Bäumen', 'Zu den Pilzen'], a: 0 },
    { id: 'gg2', crop: 'getreide', q: 'Wie heißt der Stängel beim Getreide?', o: ['Halm', 'Stamm', 'Ast'], a: 0 },
    { id: 'gg3', crop: 'getreide', q: 'Was sät man auf das Feld, damit neues Getreide wächst?', o: ['Körner', 'Knollen', 'Beeren'], a: 0 },
  ];
  function gardenQuestion(crop) {
    const e = pick(GARDEN_POOL.filter((x) => x.crop === crop || (crop !== 'kartoffel' && x.crop === 'getreide')));
    return { q: e.q, options: shuffle(e.o.slice()), answer: e.o[e.a], qid: e.id };
  }

  const MODES = {
    ethik: { modules: L_MODULES, starters: L_STARTERS, extra: L_EXTRA, enemies: L_ENEMIES, events: L_EVENTS, moves: L_MOVES, tut: L_TUT, notes: L_NOTES, pool: L_POOL, worlds: 1, title: 'Luthers Weg', icon: '⛪', sub: 'Martin Luther und die Reformation',
      order: [{ items: L_EVENTS_ORDER, note: 'leben', q: 'Tippe die Ereignisse in der richtigen Reihenfolge an.', qid: 'ord_' }] },
    kirchenjahr: { modules: L_MODULES, starters: KJ_STARTERS, extra: KJ_EXTRA, enemies: KJ_ENEMIES, events: KJ_EVENTS, moves: KJ_MOVES, tut: KJ_TUT, notes: KJ_NOTES, pool: KJ_POOL, worlds: 2, byWorld: true, worldAttacks: KJ_WORLD_ATTACKS, title: 'Das Kirchenjahr', icon: '🕯️', sub: 'Von Buß- und Bettag bis Weihnachten, in Welt 2 von der Fastenzeit bis Pfingsten',
      order: [{ items: KJ_GEBOTE, note: 'gebote', q: 'Tippe die Gebote in der richtigen Reihenfolge an: zuerst das mit der kleinsten Nummer.', qid: 'kjg_' }, { items: KJ_STORY, note: 'weihnachten', q: 'Tippe die Teile der Weihnachtsgeschichte in der richtigen Reihenfolge an.', qid: 'kjw_' },
        { w: 2, items: KJ_OSTERWEG, note: 'ostern', q: 'Tippe die Tage in der Reihenfolge an, in der sie im Jahr kommen.', qid: 'kjo_' }, { w: 2, items: KJ_JAHR, note: 'festkreis', q: 'Tippe die Feste in der Reihenfolge des Kirchenjahrs an: Es beginnt mit dem 1. Advent.', qid: 'kjj_' }] },
    freunde: { modules: L_MODULES, starters: F_STARTERS, extra: F_EXTRA, enemies: F_ENEMIES, events: F_EVENTS, moves: F_MOVES, tut: F_TUT, notes: F_NOTES, pool: F_POOL, worlds: 1, title: 'Gute Freunde', icon: '🤝', sub: 'Freundschaft, Streitregeln, Goldene Regel, Wahrheit und Vertrauen',
      order: [{ items: F_SCHLICHTEN, note: 'streit', q: 'So löst ihr einen Streit: Tippe die Schritte in der richtigen Reihenfolge an.', qid: 'gfs_' }] },
    woerterwerkstatt: { modules: W_MODULES, starters: W_STARTERS, extra: W_EXTRA, enemies: W_ENEMIES, events: W_EVENTS, moves: W_MOVES, tut: W_TUT, notes: W_NOTES, pool: W_POOL, worlds: 1, title: 'Die Wörterwerkstatt', icon: '✏️', sub: 'Richtig schreiben: doppelte Mitlaute, Verlängern, Wortfamilie, Trennen, Komma, wörtliche Rede' },
    satzbaustelle: { modules: S_MODULES, starters: S_STARTERS, extra: S_EXTRA, enemies: S_ENEMIES, events: S_EVENTS, moves: S_MOVES, tut: S_TUT, notes: S_NOTES, pool: S_POOL, worlds: 1, title: 'Die Satzbaustelle', icon: '🏗️', sub: 'Wortarten, Zeitformen, Satzglieder, Ersatz- und Weglassprobe, Redensarten' },
    kartoffel: { modules: K_MODULES, starters: K_STARTERS, extra: K_EXTRA, enemies: K_ENEMIES, events: K_EVENTS, moves: K_MOVES, tut: K_TUT, notes: K_NOTES, pool: K_POOL, worlds: 2, worldAttacks: K_WORLD_ATTACKS, title: 'Die Kartoffel-Werkstatt', icon: '🥔', sub: 'Pflanze, Herkunft, Ernte, Käfer, Wörter, Märchen', school: true },
  };
  return { MODES, PARTS, GROW, STORY, L_POOL, K_POOL, KJ_POOL, F_POOL, L_EVENTS_ORDER, KJ_GEBOTE, KJ_STORY, KJ_OSTERWEG, KJ_JAHR, F_SCHLICHTEN, W, SAETZE, CROPS, GARDEN_POOL, gardenQuestion, generate, record, shuffle, pick, rnd, weightedPick };
})();
if (typeof module !== 'undefined') module.exports = MK;
