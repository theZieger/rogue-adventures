// The Bundesländer a family can choose, and what each one changes: shown subject names, what is hidden until a
// parent switches it on, the usual way of written subtraction, and how each unit fits the state's plan.
// Everything here is a default read when a screen is drawn (adr/0010); nothing of it is ever written into a save.
// This file imports nothing, so a unit file may read it too. Units and task types are named by their ids;
// tests/test_data.js fails for an id that does not exist. Thüringen, Bremen and the Saarland are not offered
// until their plans have been read (lehrplan/bundeslaender-entscheidungen.md).

// how a unit fits the state's plan: fits, usually taught earlier, usually later, not in the plan, not compared yet
export type Fit = 'passt' | 'frueher' | 'spaeter' | 'nicht' | 'offen';
export type Minus = 'abz' | 'erg';
export interface Land {
  name: string;
  // shown names of subjects, by the subject's key; a subject without an entry keeps its key as its name
  labels: Record<string, string>;
  // the full name for parents, where the shown one is short
  long?: Record<string, string>;
  // units hidden by default
  hide: string[];
  // task types switched off by default, by unit
  off: Record<string, string[]>;
  // written subtraction: Abziehen (Entbündeln) or Ergänzen
  minus: Minus;
  // French may be the first foreign language instead of English
  french?: boolean;
  // the state has an official word list (Grundwortschatz); it is not built in
  wordlist?: boolean;
  // by unit; a unit without an entry is 'offen'. 'passt' only where the state's plan was read from the source.
  fit: Record<string, Fit>;
}

// outside Saxony: Luther and the church year are Religion content, the Saxon dialect words are regional
const CHRISTIAN = ['ethik', 'kirchenjahr'];
const SAXON = { woerterwerkstatt: ['sachsen'] };
const SU = 'Sachunterricht';

export const LAENDER: Record<string, Land> = {
  BW: {
    name: 'Baden-Württemberg',
    labels: { Ethik: 'Miteinander', Sachkunde: SU },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'erg',
    french: true,
    wordlist: true,
    fit: {},
  },
  BY: {
    name: 'Bayern',
    labels: { Sachkunde: 'HSU' },
    long: { Sachkunde: 'Heimat- und Sachunterricht' },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'abz',
    wordlist: true,
    fit: {},
  },
  BE: {
    name: 'Berlin',
    labels: { Ethik: 'Miteinander', Sachkunde: SU },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'erg',
    french: true,
    wordlist: true,
    fit: {},
  },
  BB: {
    name: 'Brandenburg',
    labels: { Ethik: 'Miteinander', Sachkunde: SU },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'erg',
    wordlist: true,
    fit: {},
  },
  HH: {
    name: 'Hamburg',
    labels: { Ethik: 'Miteinander', Sachkunde: SU },
    hide: CHRISTIAN,
    off: { ...SAXON, math: ['smul', 'vorrang'], bau: ['umfang', 'flaeche', 'lage'] },
    minus: 'erg',
    fit: {},
  },
  HE: {
    name: 'Hessen',
    labels: { Sachkunde: SU },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'erg',
    french: true,
    wordlist: true,
    fit: {},
  },
  MV: {
    name: 'Mecklenburg-Vorpommern',
    labels: { Ethik: 'Philosophieren', Sachkunde: SU },
    long: { Ethik: 'Philosophieren mit Kindern' },
    hide: CHRISTIAN,
    off: { ...SAXON, math: ['smul', 'teilbar'], bau: ['umfang', 'flaeche'] },
    minus: 'erg',
    french: true,
    wordlist: true,
    fit: {},
  },
  NI: {
    name: 'Niedersachsen',
    labels: { Ethik: 'Werte und Normen', Sachkunde: SU },
    hide: CHRISTIAN,
    off: { ...SAXON, schreiben2: ['doppel'] },
    minus: 'abz',
    fit: {},
  },
  NW: {
    name: 'Nordrhein-Westfalen',
    labels: { Ethik: 'Miteinander', Sachkunde: SU },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'erg',
    wordlist: true,
    fit: {},
  },
  RP: {
    name: 'Rheinland-Pfalz',
    labels: { Sachkunde: SU },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'erg',
    french: true,
    wordlist: true,
    fit: {},
  },
  SN: {
    name: 'Sachsen',
    labels: {},
    hide: [],
    off: {},
    minus: 'abz',
    fit: {
      math: 'passt',
      bau: 'passt',
      jahrmarkt: 'passt',
      woerterwerkstatt: 'passt',
      satzbaustelle: 'passt',
      teestube: 'passt',
      doppeldecker: 'passt',
      ethik: 'passt',
      kirchenjahr: 'passt',
      freunde: 'passt',
      ichwelt: 'passt',
      kartoffel: 'passt',
      kornkammer: 'passt',
      wetterstation: 'passt',
      kompass: 'passt',
      sinne: 'passt',
      verkehr: 'passt',
      wiese: 'passt',
      frueher: 'passt',
      wald: 'nicht',
      musik: 'passt',
      zahlen20: 'passt',
      formen1: 'passt',
      zahlen100: 'passt',
      malteilen: 'passt',
      groessen2: 'passt',
      formen2: 'passt',
      laute1: 'passt',
      schreiben2: 'passt',
      woerter2: 'passt',
      koerper1: 'passt',
      jahr1: 'passt',
      baeume2: 'passt',
      tiere2: 'passt',
      natur2: 'passt',
      ichdu1: 'passt',
      feste2: 'passt',
      instrumente2: 'passt',
      musik1: 'passt',
    },
  },
  ST: {
    name: 'Sachsen-Anhalt',
    labels: { Sachkunde: SU },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'erg',
    fit: {},
  },
  SH: {
    name: 'Schleswig-Holstein',
    labels: { Ethik: 'Philosophie', Sachkunde: SU },
    hide: CHRISTIAN,
    off: { ...SAXON, math: ['smul', 'vorrang', 'teilbar'] },
    minus: 'erg',
    wordlist: true,
    fit: {},
  },
};
// in the order of the picker: by name
export const LAND_CODES = Object.keys(LAENDER).sort((a, b) => LAENDER[a].name.localeCompare(LAENDER[b].name, 'de'));

const of = (land: string): Land | undefined =>
  Object.prototype.hasOwnProperty.call(LAENDER, land) ? LAENDER[land] : undefined;
export const isLand = (land: unknown): land is string => typeof land === 'string' && !!of(land);
// '' (no state chosen, „Allgemein“) and an unknown code change nothing
export const profileHides = (land: string, unit: string) => !!of(land)?.hide.includes(unit);
export const profileOff = (land: string, unit: string): string[] => of(land)?.off[unit] || [];
export const fitOf = (land: string, unit: string): Fit => of(land)?.fit[unit] || 'offen';
export const labelOf = (land: string, subject: string, long?: boolean) =>
  (long && of(land)?.long?.[subject]) || of(land)?.labels[subject] || subject;
export const landName = (land: string) => of(land)?.name || '';
// without a state: Ergänzen, the method Lernquest has shown from the start
export const minusDefault = (land: string): Minus => of(land)?.minus || 'erg';
// why a unit is hidden by default: Religion content elsewhere, or taught later there
export const whyHides = (unit: string) => (CHRISTIAN.includes(unit) ? 'religion' : 'spaeter');
// why a task type is off by default: Saxon dialect, or taught later there
export const whyOff = (unit: string, type: string) =>
  (SAXON as Record<string, string[]>)[unit]?.includes(type) ? 'mundart' : 'spaeter';
