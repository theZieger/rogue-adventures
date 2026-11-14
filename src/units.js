// Every unit of Lernquest by id, in the order the units register. The game, the tests, the bot and the monster art
// (tools/svg.js) all read this one list. A unit adds itself to MK.MODES in its own file (README „Neue Einheit“);
// Zahlenquest, Baustelle and Jahrmarkt come from the two files that are loaded before MK exists.
const UNITS = (() => {
  const node = typeof module !== 'undefined';
  // Node has no page that loads every file: tests/test_data.js checks this list against the built page
  if (node) for (const f of ['sachkunde', 'sachkunde2', 'sachkunde3', 'ethik', 'musik', 'k12_mathe', 'k12_deutsch', 'k12_sachkunde', 'k12_ethik']) require(`./${f}.js`);
  const Q = node ? require('./logic.js') : MQ, J = node ? require('./jahrmarkt.js') : MJ, K = node ? require('./knowledge.js') : MK;
  return Object.assign({ math: Q.MODE, bau: Q.BAU.MODE, jahrmarkt: J.MODE }, K.MODES);
})();
if (typeof module !== 'undefined') module.exports = UNITS;
