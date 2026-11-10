// Klasse 1 und 2, Fach mathe: units register themselves in MK.MODES (pattern: src/sachkunde3.js), using K12.SETS for hero and opponents.
(() => {
  const K = typeof MK !== 'undefined' ? MK : require('./knowledge.js');
  const S = typeof K12 !== 'undefined' ? K12 : require('./klasse12.js');
  void K; void S;
})();
