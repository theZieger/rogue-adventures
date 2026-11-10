// Klasse 1/2 sachkunde: checks beyond the generic ones in test_knowledge.js and test_data.js
const fails = [];
require('./units.js');
console.log('k12 sachkunde fails', fails.length, fails);
if (fails.length) process.exit(1);
