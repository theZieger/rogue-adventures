// Every unit of Lernquest by id, in the order the units register. The game, the tests, the bot and the monster art
// (tools/svg.js) all read this one list. A unit adds itself to MK.MODES in its own file (README „Neue Einheit“);
// Zahlenquest, Baustelle and Jahrmarkt come from the two files that are loaded before MK exists.
// The imports below are the order of the units on screen.
import './sachkunde.ts';
import './sachkunde2.ts';
import './sachkunde3.ts';
import './ethik.ts';
import './musik.ts';
import './k12_mathe.ts';
import './k12_deutsch.ts';
import './k12_sachkunde.ts';
import './k12_ethik.ts';
import { MJ } from './jahrmarkt.ts';
import { MK } from './knowledge.ts';
import { MQ } from './logic.ts';
import type { Unit } from './curriculum.ts';

export const UNITS = { math: MQ.MODE, bau: (MQ.BAU as typeof MQ.BAU & { MODE: Unit }).MODE, jahrmarkt: MJ.MODE, ...MK.MODES };
