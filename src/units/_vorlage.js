// Vorlage für eine neue Einheit, die nur aus Daten besteht. So geht es:
//   1. Datei kopieren, z. B. nach src/units/jahreszeiten.js (ohne Unterstrich – Dateien mit _ kommen nicht ins Spiel).
//   2. Den Namen in addUnit('…') ändern. Er ist der Speicher-Schlüssel der Einheit und darf sich später nie mehr ändern.
//   3. Inhalte eintragen, dann: npm run build && npm test && npm run playtest
// Mehr ist nicht nötig: Startseite (Klasse → Fach), Elternbereich, Wochenziele, Statistik, Tests und der Bot
// finden die Einheit von selbst. Was hier nicht geht, steht in der README unter „Neue Einheit“.
(typeof MK !== 'undefined' ? MK : require('../knowledge.js')).addUnit('vorlage', {
  grade: 2,                       // Klasse – eine neue Zahl ergibt von selbst einen neuen Klassen-Reiter
  subject: 'Sachkunde',           // Mathe, Deutsch, Ethik, Sachkunde, Musik oder Englisch
  title: 'Die Vorlage',
  icon: '🌱',                     // Emojis brauchen ein gezeichnetes Symbol in src/icons.js
  sub: 'Jahreszeiten, Monate, Wochentage und Wetter',
  plan: 'Sachunterricht, Klasse 1/2, Lernbereich 5 „Begegnung mit Raum und Zeit“.', // Elternbereich

  // Jedes Thema ist eine Aufgabenart und eine Attacke. Mindestens vier Themen; die ersten vier bekommt der Held.
  topics: {
    jahr: {
      name: 'Jahreszeiten', icon: '🌼', attack: 'Kalenderblatt',
      info: 'Fragen zu Frühling, Sommer, Herbst und Winter.',                      // ein Satz für Eltern
      explain: ['Das Jahr hat vier Jahreszeiten.', 'Tippe auf die richtige Antwort.'], // „Wie geht das?“
      note: ['Frühling, Sommer, Herbst, Winter.', 'Jede Jahreszeit dauert etwa drei Monate.'], // Tipp bei einer falschen Antwort
      questions: [
        { q: 'Wie viele Jahreszeiten hat das Jahr?', o: ['Vier', 'Drei', 'Zwölf'], a: 0 },   // a = Platz der richtigen Antwort, ab 0 gezählt
        { q: 'Im Winter sind die Tage länger als im Sommer.', rf: true, a: false, why: 'Im Winter wird es früh dunkel. Die Tage sind kurz.' },
        { q: 'Ordne die Jahreszeiten. Beginne mit dem Frühling.', order: ['Frühling', 'Sommer', 'Herbst', 'Winter'] },
        { q: 'Nach dem Herbst kommt der ___.', o: ['Winter', 'Sommer', 'Frühling'], a: 0 },  // ___ = Lücke
        { t: 2, q: 'In welcher Jahreszeit ziehen viele Vögel in den Süden?', o: ['Im Herbst', 'Im Frühling', 'Im Sommer'], a: 0 }, // t: 2 = schwerere Stufe
      ],
    },
    monat: {
      name: 'Monate', icon: '⏳', attack: 'Monatsrad',
      info: 'Die zwölf Monate kennen und ordnen.',
      explain: ['Das Jahr hat zwölf Monate.', 'Tippe auf die richtige Antwort.'],
      note: ['Das Jahr beginnt im Januar und endet im Dezember.'],
      questions: [
        { q: 'Welcher Monat ist der erste im Jahr?', o: ['Januar', 'Dezember', 'März'], a: 0 },
        { q: 'Ordne die Monate.', order: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] },
        { q: 'Das Jahr hat zwölf Monate.', rf: true, a: true },
      ],
    },
    woche: {
      name: 'Wochentage', icon: '📚', attack: 'Stundenplan',
      info: 'Die sieben Wochentage kennen und ordnen.',
      explain: ['Die Woche hat sieben Tage.', 'Tippe auf die richtige Antwort.'],
      note: ['Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag.'],
      questions: [
        { q: 'Welcher Tag kommt nach Dienstag?', o: ['Mittwoch', 'Montag', 'Freitag'], a: 0 },
        { q: 'Ordne die Wochentage.', order: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] },
        { q: 'Die Woche hat fünf Tage.', rf: true, a: false, why: 'Die Woche hat sieben Tage.' },
      ],
    },
    wetter: {
      name: 'Wetter', icon: '🌦️', attack: 'Wetterhahn',
      info: 'Fragen zu Regen, Schnee, Wind und Sonne.',
      explain: ['Das Wetter ändert sich jeden Tag.', 'Tippe auf die richtige Antwort.'],
      note: ['Regen fällt aus Wolken.', 'Schnee fällt, wenn es sehr kalt ist.'],
      questions: [
        { q: 'Was fällt aus den Wolken, wenn es sehr kalt ist?', o: ['Schnee', 'Laub', 'Sand'], a: 0 },
        { q: 'Regen fällt aus Wolken.', rf: true, a: true },
        { q: 'Was brauchst du bei Regen?', o: ['Einen Regenschirm', 'Eine Sonnenbrille', 'Einen Schlitten'], a: 0 },
      ],
    },
  },

  // Helden und Gegner brauchen eine Zeichnung (shape) aus src/monsters.js. Neue Figuren werden dort gezeichnet;
  // bis dahin darf eine vorhandene Zeichnung stehen. Heldenkennung (id) und Gegnernamen gibt es im ganzen Spiel nur einmal.
  heroes: [{ id: 'vorlagenheld', name: 'Die Kalenderforscherin', type: 'normal', shape: 'heimatforscherin', perk: 'crit', desc: 'Sie schreibt jeden Tag das Wetter in ihr Heft.' }],
  enemies: {
    normal: [
      { name: 'Der Regentag', type: 'wasser', shape: 'spinnennetz', hp: 24, atk: 4 },
      { name: 'Der Nachtfrost', type: 'wasser', shape: 'schimmelfleck', hp: 28, atk: 3 },
      { name: 'Die Hitzewelle', type: 'feuer', shape: 'stromausfall', hp: 26, atk: 4 },
      { name: 'Der Herbststurm', type: 'normal', shape: 'vorurteil', hp: 30, atk: 3 },
    ],
    elite: { name: 'Die Pfütze', type: 'wasser', shape: 'falschmeldung', hp: 45, atk: 5 },
    boss: { name: 'Der lange Winter', acc: 'den langen Winter', type: 'wasser', shape: 'vergessen', hp: 70, atk: 6, boss: true },
  },
  moves: ['Nieselregen', 'Windstoß', 'Kälteschauer', 'Nebelbank'], // Angriffe der Gegner

  // Ereignisse auf der Karte (freiwillig). Eine Bank zum Ausruhen kommt immer von selbst dazu.
  events: [
    { title: 'Der Wetterfrosch', text: 'Ein Laubfrosch sitzt auf einer Leiter und fragt dich nach dem Wetter. Für die richtige Antwort gibt er dir einen Trank.',
      opts: [{ label: 'Antworten', task: 'wetter', win: { item: 'trank' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
  ],
});
