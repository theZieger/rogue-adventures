// Klasse 1/2 mathe: checks beyond the generic ones in test_knowledge.js and test_data.js
const fails = [];
require('./units.js');
console.log('k12 mathe fails', fails.length, fails);
if (fails.length) process.exit(1);
