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
      { id: 'held-sachkunde12', type: 'pflanze', shape: 'lotte', names: ['Lotte', 'Lotte', 'Lotte'], hp: 65, perk: 'heal', desc: 'Lotte gießt jeden Morgen die Sonnenblume, die sie im Frühling selbst gesät hat.' },
      [
        { name: 'Die Karies', type: 'normal', shape: 'karies', hp: 20, atk: 3 },
        { name: 'Die Schlammpfütze', type: 'wasser', shape: 'schlammpfuetze', hp: 22, atk: 3 },
        { name: 'Der Sonnenbrand', type: 'feuer', shape: 'sonnenbrand', hp: 22, atk: 3 },
        { name: 'Die Klette', type: 'pflanze', shape: 'klette', hp: 24, atk: 3 },
      ],
      { name: 'Der Schnupfen', type: 'normal', shape: 'schnupfen', hp: 36, atk: 4 },
      { name: 'Der Schneesturm', acc: 'den Schneesturm', type: 'wasser', shape: 'schneesturm', hp: 55, atk: 5, boss: true },
      ['Zahnbelag', 'Spritzwasser', 'Mittagshitze', 'Widerhaken', 'Niesanfall', 'Eiswind']),
    ethik: set(
      { id: 'held-ethik12', type: 'feuer', shape: 'mats', names: ['Mats', 'Mats', 'Mats'], hp: 65, perk: 'crit', desc: 'Mats hat seine Laterne für den Martinsumzug aus Transparentpapier selbst gebastelt.' },
      [
        { name: 'Die zugeknallte Tür', type: 'normal', shape: 'knalltuer', hp: 20, atk: 3 },
        { name: 'Die schlechte Laune', type: 'wasser', shape: 'schlechtelaune', hp: 22, atk: 3 },
        { name: 'Der Wutanfall', type: 'feuer', shape: 'wutanfall', hp: 22, atk: 3 },
        { name: 'Die Langeweile', type: 'pflanze', shape: 'langeweile', hp: 24, atk: 3 },
      ],
      { name: 'Das Heimweh', type: 'wasser', shape: 'heimweh', hp: 36, atk: 4 },
      { name: 'Der große Streit', acc: 'den großen Streit', type: 'normal', shape: 'grosserstreit', hp: 55, atk: 5, boss: true },
      ['Türschlag', 'Trübsal', 'Wutgeschrei', 'Dauergähnen', 'Abschiedsschmerz', 'Gezanke']),
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
