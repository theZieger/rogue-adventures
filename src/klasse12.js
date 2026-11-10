// Klasse 1 und 2: one hero and one set of opponents per subject, shared by all units of that subject in both grades
// (fewer drawings; the owner's choice). A shared opponent counts once in the Monsterbuch. A unit gives the hero its own
// four attacks: Object.assign({}, K12.SETS.<fach>.hero, { attacks }).
// Hero ids and opponent names are stored in saves: never rename them once released.
const K12 = (() => {
  const set = (hero, normal, elite, boss, moves) => ({ hero, enemies: { 1: { normal, elite, boss } }, moves });
  const SETS = {
    mathe: set(
      { id: 'held-mathe12', type: 'normal', shape: 'kauffrau', names: ['Die Kauffrau', 'Die Kauffrau', 'Die Kauffrau'], hp: 65, perk: 'crit', desc: 'Sie führt den Kaufladen der Klasse: Sie zählt Münzen, wiegt Äpfel ab und rechnet Preise zusammen.' },
      [
        { name: 'Der Wackelturm', type: 'normal', shape: 'wackelturm', hp: 20, atk: 3 },
        { name: 'Das Maßband', type: 'pflanze', shape: 'massband', hp: 22, atk: 3 },
        { name: 'Der Schummelwürfel', type: 'feuer', shape: 'schummelwuerfel', hp: 22, atk: 3 },
        { name: 'Der Kuckuck', type: 'wasser', shape: 'kuckuck', hp: 24, atk: 3 },
      ],
      { name: 'Die schiefe Waage', type: 'normal', shape: 'schiefewaage', hp: 36, atk: 4 },
      { name: 'Der Kaugummiautomat', acc: 'den Kaugummiautomaten', type: 'feuer', shape: 'kaugummiautomat', hp: 55, atk: 5, boss: true },
      ['Umkippen', 'Zurückschnellen', 'Sieben Augen', 'Kuckucksruf', 'Waagschale', 'Münzschlucker']),
    deutsch: set(
      { id: 'held-deutsch12', type: 'normal', shape: 'lesepatin', names: ['Die Lesepatin', 'Die Lesepatin', 'Die Lesepatin'], hp: 68, perk: 'heal', desc: 'Sie kommt jede Woche in die Klasse, liest mit den Kindern in der Fibel und hört zu, wie sie Wörter lautieren.' },
      [
        { name: 'Das Spiegel-S', type: 'wasser', shape: 'spiegels', hp: 20, atk: 3 },
        { name: 'Die Bastelschere', type: 'normal', shape: 'bastelschere', hp: 22, atk: 3 },
        { name: 'Die Buchstabensuppe', type: 'feuer', shape: 'buchstabensuppe', hp: 24, atk: 3 },
        { name: 'Der Papierflieger', type: 'pflanze', shape: 'papierflieger', hp: 20, atk: 3 },
      ],
      { name: 'Der Wackelzahn', type: 'normal', shape: 'wackelzahn', hp: 36, atk: 4 },
      { name: 'Die Bücherlawine', acc: 'die Bücherlawine', type: 'pflanze', shape: 'buecherlawine', hp: 55, atk: 5, boss: true },
      ['Spiegelschrift', 'Falscher Schnitt', 'Suppenkelle', 'Bruchlandung', 'Lispeln', 'Bücherrutsch']),
    sachkunde: set(
      { id: 'held-sachkunde12', type: 'normal', shape: 'heimatforscherin', names: ['Held Sachkunde', 'Held Sachkunde', 'Held Sachkunde'], hp: 60, perk: 'crit', desc: 'Platzhalter, bis die Zeichnung fertig ist.' },
      [
        { name: 'Gegner Sachkunde 1', type: 'normal', shape: 'spinnennetz', hp: 20, atk: 3 },
        { name: 'Gegner Sachkunde 2', type: 'wasser', shape: 'schimmelfleck', hp: 22, atk: 3 },
        { name: 'Gegner Sachkunde 3', type: 'feuer', shape: 'stromausfall', hp: 22, atk: 3 },
        { name: 'Gegner Sachkunde 4', type: 'pflanze', shape: 'vorurteil', hp: 24, atk: 3 },
      ],
      { name: 'Gegner Sachkunde Elite', type: 'normal', shape: 'falschmeldung', hp: 36, atk: 4 },
      { name: 'Gegner Sachkunde Boss', acc: 'Gegner Sachkunde Boss', type: 'wasser', shape: 'vergessen', hp: 55, atk: 5, boss: true },
      ['Rempler', 'Stups', 'Schubser', 'Kniff']),
    ethik: set(
      { id: 'held-ethik12', type: 'normal', shape: 'heimatforscherin', names: ['Held Ethik', 'Held Ethik', 'Held Ethik'], hp: 60, perk: 'crit', desc: 'Platzhalter, bis die Zeichnung fertig ist.' },
      [
        { name: 'Gegner Ethik 1', type: 'normal', shape: 'spinnennetz', hp: 20, atk: 3 },
        { name: 'Gegner Ethik 2', type: 'wasser', shape: 'schimmelfleck', hp: 22, atk: 3 },
        { name: 'Gegner Ethik 3', type: 'feuer', shape: 'stromausfall', hp: 22, atk: 3 },
        { name: 'Gegner Ethik 4', type: 'pflanze', shape: 'vorurteil', hp: 24, atk: 3 },
      ],
      { name: 'Gegner Ethik Elite', type: 'normal', shape: 'falschmeldung', hp: 36, atk: 4 },
      { name: 'Gegner Ethik Boss', acc: 'Gegner Ethik Boss', type: 'wasser', shape: 'vergessen', hp: 55, atk: 5, boss: true },
      ['Rempler', 'Stups', 'Schubser', 'Kniff']),
    musik: set(
      { id: 'held-musik12', type: 'normal', shape: 'musiklehrerin', names: ['Die Musiklehrerin', 'Die Musiklehrerin', 'Die Musiklehrerin'], hp: 65, perk: 'crit', desc: 'Sie spielt zu jedem Lied Gitarre, und die Kinder klopfen mit Rassel, Triangel und Trommel den Takt.' },
      [
        { name: 'Die Knarrtür', type: 'pflanze', shape: 'knarrtuer', hp: 22, atk: 3 },
        { name: 'Die gerissene Saite', type: 'normal', shape: 'gerissenesaite', hp: 20, atk: 3 },
        { name: 'Der Laubbläser', type: 'feuer', shape: 'laubblaeser', hp: 24, atk: 3 },
        { name: 'Der Wasserhahn', type: 'wasser', shape: 'wasserhahn', hp: 22, atk: 3 },
      ],
      { name: 'Die Pausenklingel', type: 'feuer', shape: 'pausenklingel', hp: 36, atk: 4 },
      { name: 'Der Presslufthammer', acc: 'den Presslufthammer', type: 'normal', shape: 'presslufthammer', hp: 58, atk: 5, boss: true },
      ['Türknarren', 'Saitenpeitsche', 'Laubgebläse', 'Tropfen', 'Dauerklingeln', 'Rüttelstoß']),
  };
  return { SETS };
})();
if (typeof module !== 'undefined') module.exports = K12;
