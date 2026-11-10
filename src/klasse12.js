// Klasse 1 und 2: one hero and one set of opponents per subject, shared by all units of that subject in both grades
// (fewer drawings; the owner's choice). A shared opponent counts once in the Monsterbuch. A unit gives the hero its own
// four attacks: Object.assign({}, K12.SETS.<fach>.hero, { attacks }).
// Hero ids and opponent names are stored in saves: never rename them once released.
const K12 = (() => {
  const set = (hero, normal, elite, boss, moves) => ({ hero, enemies: { 1: { normal, elite, boss } }, moves });
  const SETS = {
    mathe: set(
      { id: 'held-mathe12', type: 'normal', shape: 'heimatforscherin', names: ['Held Mathe', 'Held Mathe', 'Held Mathe'], hp: 60, perk: 'crit', desc: 'Platzhalter, bis die Zeichnung fertig ist.' },
      [
        { name: 'Gegner Mathe 1', type: 'normal', shape: 'spinnennetz', hp: 20, atk: 3 },
        { name: 'Gegner Mathe 2', type: 'wasser', shape: 'schimmelfleck', hp: 22, atk: 3 },
        { name: 'Gegner Mathe 3', type: 'feuer', shape: 'stromausfall', hp: 22, atk: 3 },
        { name: 'Gegner Mathe 4', type: 'pflanze', shape: 'vorurteil', hp: 24, atk: 3 },
      ],
      { name: 'Gegner Mathe Elite', type: 'normal', shape: 'falschmeldung', hp: 36, atk: 4 },
      { name: 'Gegner Mathe Boss', acc: 'Gegner Mathe Boss', type: 'wasser', shape: 'vergessen', hp: 55, atk: 5, boss: true },
      ['Rempler', 'Stups', 'Schubser', 'Kniff']),
    deutsch: set(
      { id: 'held-deutsch12', type: 'normal', shape: 'heimatforscherin', names: ['Held Deutsch', 'Held Deutsch', 'Held Deutsch'], hp: 60, perk: 'crit', desc: 'Platzhalter, bis die Zeichnung fertig ist.' },
      [
        { name: 'Gegner Deutsch 1', type: 'normal', shape: 'spinnennetz', hp: 20, atk: 3 },
        { name: 'Gegner Deutsch 2', type: 'wasser', shape: 'schimmelfleck', hp: 22, atk: 3 },
        { name: 'Gegner Deutsch 3', type: 'feuer', shape: 'stromausfall', hp: 22, atk: 3 },
        { name: 'Gegner Deutsch 4', type: 'pflanze', shape: 'vorurteil', hp: 24, atk: 3 },
      ],
      { name: 'Gegner Deutsch Elite', type: 'normal', shape: 'falschmeldung', hp: 36, atk: 4 },
      { name: 'Gegner Deutsch Boss', acc: 'Gegner Deutsch Boss', type: 'wasser', shape: 'vergessen', hp: 55, atk: 5, boss: true },
      ['Rempler', 'Stups', 'Schubser', 'Kniff']),
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
      { id: 'held-musik12', type: 'normal', shape: 'heimatforscherin', names: ['Held Musik', 'Held Musik', 'Held Musik'], hp: 60, perk: 'crit', desc: 'Platzhalter, bis die Zeichnung fertig ist.' },
      [
        { name: 'Gegner Musik 1', type: 'normal', shape: 'spinnennetz', hp: 20, atk: 3 },
        { name: 'Gegner Musik 2', type: 'wasser', shape: 'schimmelfleck', hp: 22, atk: 3 },
        { name: 'Gegner Musik 3', type: 'feuer', shape: 'stromausfall', hp: 22, atk: 3 },
        { name: 'Gegner Musik 4', type: 'pflanze', shape: 'vorurteil', hp: 24, atk: 3 },
      ],
      { name: 'Gegner Musik Elite', type: 'normal', shape: 'falschmeldung', hp: 36, atk: 4 },
      { name: 'Gegner Musik Boss', acc: 'Gegner Musik Boss', type: 'wasser', shape: 'vergessen', hp: 55, atk: 5, boss: true },
      ['Rempler', 'Stups', 'Schubser', 'Kniff']),
  };
  return { SETS };
})();
if (typeof module !== 'undefined') module.exports = K12;
