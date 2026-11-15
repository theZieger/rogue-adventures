// Every unit of Lernquest by id, in the order the units register. The game, the tests, the bot and the monster art
// (tools/svg.js) all read this one list. A unit adds itself to MK.MODES in its own file (README „Neue Einheit“);
// Zahlenquest, Baustelle and Jahrmarkt come from the two files that are loaded before MK exists.
// The imports below are the order of the units on screen.
import './sachkunde.js';
import './sachkunde2.js';
import './sachkunde3.js';
import './ethik.js';
import './musik.js';
import './k12_mathe.js';
import './k12_deutsch.js';
import './k12_sachkunde.js';
import './k12_ethik.js';
import { MJ } from './jahrmarkt.js';
import { MK } from './knowledge.js';
import { MQ } from './logic.js';

export const UNITS = { math: MQ.MODE, bau: MQ.BAU.MODE, jahrmarkt: MJ.MODE, ...MK.MODES };
