// „Mein Bundesland“: what Kompass und Karte asks about the Bundesland a family has chosen (src/laender.ts).
// The facts are copied from tests/fixtures/bundesland-fakten.json (sources: lehrplan/quellen-bundeslaender.md);
// tests/test_bundesland.js compares every answer and every wrong option with that file. Add nothing from memory:
// a fact goes into the fixture with its source first. This file imports nothing.
//
// Left out on purpose (see the sources file): holidays of states whose law could not be opened, holidays that hold
// only in some places, Easter and Whit Sunday in Brandenburg, the position of Sachsen-Anhalt, city rankings that
// are close, border rivers.

export interface LandFacts {
  name: string;
  hauptstadt: string;
  // a city that is a state: no capital question, no list of cities
  stadtstaat?: boolean;
  // Berlin
  bund?: boolean;
  nachbarlaender: string[];
  nachbarstaaten: string[];
  meer: string[];
  // Hamburg has no coast, but an island in the North Sea: „Liegt Hamburg am Meer?“ has no clean answer
  ohneMeer?: boolean;
  fluesse: string[];
  // mountains, lakes, islands and regions, as children find them on the map
  landschaften: string[];
  staedte: string[];
  // only where the gap to the second city is clear
  groesste?: string;
  lage?: string;
  // statutory in the whole state, beyond the days all of Germany has
  feiertage: { name: string; datum?: string }[];
  // never a wrong option here: it touches the state after all, or is true in parts of it
  tabu?: string[];
}

export const LANDFAKTEN: Record<string, LandFacts> = {
  BW: {
    name: 'Baden-Württemberg',
    hauptstadt: 'Stuttgart',
    nachbarlaender: ['Bayern', 'Hessen', 'Rheinland-Pfalz'],
    nachbarstaaten: ['Frankreich', 'Schweiz'],
    meer: [],
    fluesse: ['Rhein', 'Neckar', 'Donau'],
    landschaften: ['Schwarzwald', 'Schwäbische Alb', 'Bodensee', 'Oberrheinische Tiefebene'],
    staedte: ['Stuttgart', 'Mannheim', 'Karlsruhe', 'Freiburg im Breisgau'],
    groesste: 'Stuttgart',
    lage: 'im Südwesten',
    feiertage: [
      { name: 'Heilige Drei Könige', datum: '6. Januar' },
      { name: 'Fronleichnam' },
      { name: 'Allerheiligen', datum: '1. November' },
    ],
    // the border to Austria runs through the Bodensee; Reformationsfest is free of school here
    tabu: ['Österreich', 'Reformationstag', 'Reformationsfest'],
  },
  BY: {
    name: 'Bayern',
    hauptstadt: 'München',
    nachbarlaender: ['Baden-Württemberg', 'Hessen', 'Thüringen', 'Sachsen'],
    nachbarstaaten: ['Österreich', 'Tschechien'],
    meer: [],
    fluesse: ['Donau', 'Main', 'Isar', 'Inn'],
    landschaften: ['Alpen', 'Alpenvorland', 'Bayerischer Wald', 'Chiemsee', 'Starnberger See'],
    staedte: ['München', 'Nürnberg', 'Augsburg', 'Regensburg'],
    groesste: 'München',
    lage: 'im Süden',
    feiertage: [
      { name: 'Heilige Drei Könige', datum: '6. Januar' },
      { name: 'Fronleichnam' },
      { name: 'Allerheiligen', datum: '1. November' },
    ],
    // Switzerland only across the Bodensee; the Saale rises here; Buß- und Bettag is free of school here
    tabu: ['Schweiz', 'Bodensee', 'Saale', 'Buß- und Bettag'],
  },
  BE: {
    name: 'Berlin',
    hauptstadt: 'Berlin',
    stadtstaat: true,
    bund: true,
    nachbarlaender: ['Brandenburg'],
    nachbarstaaten: [],
    meer: [],
    fluesse: ['Spree', 'Havel'],
    landschaften: ['Müggelsee', 'Wannsee', 'Tegeler See', 'Grunewald'],
    staedte: [],
    lage: 'im Nordosten',
    feiertage: [{ name: 'Frauentag', datum: '8. März' }],
  },
  BB: {
    name: 'Brandenburg',
    hauptstadt: 'Potsdam',
    nachbarlaender: ['Berlin', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Sachsen-Anhalt', 'Sachsen'],
    nachbarstaaten: ['Polen'],
    meer: [],
    fluesse: ['Havel', 'Spree'],
    landschaften: ['Spreewald', 'Oderbruch', 'Uckermark', 'Havelland', 'Fläming'],
    staedte: ['Potsdam', 'Cottbus', 'Brandenburg an der Havel', 'Frankfurt (Oder)'],
    groesste: 'Potsdam',
    lage: 'im Nordosten',
    feiertage: [{ name: 'Reformationstag', datum: '31. Oktober' }],
    tabu: ['Elbe'],
  },
  HH: {
    name: 'Hamburg',
    hauptstadt: 'Hamburg',
    stadtstaat: true,
    nachbarlaender: ['Niedersachsen', 'Schleswig-Holstein'],
    nachbarstaaten: [],
    meer: [],
    ohneMeer: true,
    fluesse: ['Elbe', 'Alster', 'Bille'],
    landschaften: ['Außenalster und Binnenalster', 'Harburger Berge', 'Insel Neuwerk'],
    staedte: [],
    lage: 'im Norden',
    feiertage: [],
  },
  HE: {
    name: 'Hessen',
    hauptstadt: 'Wiesbaden',
    nachbarlaender: [
      'Baden-Württemberg',
      'Bayern',
      'Niedersachsen',
      'Nordrhein-Westfalen',
      'Rheinland-Pfalz',
      'Thüringen',
    ],
    nachbarstaaten: [],
    meer: [],
    fluesse: ['Main', 'Fulda', 'Lahn'],
    landschaften: ['Taunus', 'Rhön', 'Odenwald', 'Vogelsberg', 'Edersee'],
    staedte: ['Frankfurt am Main', 'Wiesbaden', 'Kassel', 'Darmstadt'],
    groesste: 'Frankfurt am Main',
    lage: 'in der Mitte',
    feiertage: [],
    tabu: ['Rhein', 'Neckar', 'Weser'],
  },
  MV: {
    name: 'Mecklenburg-Vorpommern',
    hauptstadt: 'Schwerin',
    nachbarlaender: ['Brandenburg', 'Niedersachsen', 'Schleswig-Holstein'],
    nachbarstaaten: ['Polen'],
    meer: ['Ostsee'],
    fluesse: ['Warnow', 'Peene', 'Elde'],
    landschaften: ['Rügen', 'Usedom', 'Mecklenburgische Seenplatte', 'Müritz', 'Hiddensee'],
    staedte: ['Rostock', 'Schwerin', 'Neubrandenburg'],
    groesste: 'Rostock',
    lage: 'im Nordosten',
    feiertage: [],
    tabu: ['Elbe'],
  },
  NI: {
    name: 'Niedersachsen',
    hauptstadt: 'Hannover',
    nachbarlaender: [
      'Bremen',
      'Hamburg',
      'Schleswig-Holstein',
      'Mecklenburg-Vorpommern',
      'Brandenburg',
      'Sachsen-Anhalt',
      'Thüringen',
      'Hessen',
      'Nordrhein-Westfalen',
    ],
    nachbarstaaten: ['Niederlande'],
    meer: ['Nordsee'],
    fluesse: ['Weser', 'Elbe', 'Ems', 'Leine'],
    landschaften: ['Harz', 'Lüneburger Heide', 'Ostfriesische Inseln', 'Wattenmeer', 'Steinhuder Meer'],
    staedte: ['Hannover', 'Braunschweig', 'Oldenburg', 'Osnabrück'],
    groesste: 'Hannover',
    lage: 'im Nordwesten',
    feiertage: [{ name: 'Reformationstag', datum: '31. Oktober' }],
  },
  NW: {
    name: 'Nordrhein-Westfalen',
    hauptstadt: 'Düsseldorf',
    nachbarlaender: ['Niedersachsen', 'Hessen', 'Rheinland-Pfalz'],
    nachbarstaaten: ['Belgien', 'Niederlande'],
    meer: [],
    fluesse: ['Rhein', 'Ruhr', 'Lippe', 'Ems'],
    landschaften: ['Sauerland', 'Eifel', 'Münsterland', 'Ruhrgebiet', 'Teutoburger Wald'],
    staedte: ['Köln', 'Düsseldorf', 'Dortmund', 'Essen'],
    groesste: 'Köln',
    lage: 'im Westen',
    feiertage: [{ name: 'Fronleichnam' }, { name: 'Allerheiligen', datum: '1. November' }],
  },
  RP: {
    name: 'Rheinland-Pfalz',
    hauptstadt: 'Mainz',
    nachbarlaender: ['Nordrhein-Westfalen', 'Hessen', 'Baden-Württemberg', 'Saarland'],
    nachbarstaaten: ['Frankreich', 'Luxemburg', 'Belgien'],
    meer: [],
    fluesse: ['Rhein', 'Mosel', 'Nahe', 'Lahn'],
    landschaften: ['Eifel', 'Hunsrück', 'Pfälzerwald', 'Westerwald'],
    staedte: ['Mainz', 'Ludwigshafen am Rhein', 'Koblenz', 'Trier'],
    lage: 'im Südwesten',
    feiertage: [],
  },
  SN: {
    name: 'Sachsen',
    hauptstadt: 'Dresden',
    nachbarlaender: ['Bayern', 'Thüringen', 'Sachsen-Anhalt', 'Brandenburg'],
    nachbarstaaten: ['Polen', 'Tschechien'],
    meer: [],
    fluesse: ['Elbe', 'Mulde', 'Spree', 'Weiße Elster'],
    landschaften: ['Erzgebirge', 'Elbsandsteingebirge', 'Vogtland', 'Lausitz', 'Zittauer Gebirge'],
    staedte: ['Leipzig', 'Dresden', 'Chemnitz'],
    groesste: 'Leipzig',
    lage: 'im Osten',
    feiertage: [{ name: 'Reformationsfest', datum: '31. Oktober' }, { name: 'Buß- und Bettag' }],
    // a holiday in some regions of Saxony only; the Sächsische Schweiz is a landscape here
    tabu: ['Fronleichnam', 'Schweiz'],
  },
  ST: {
    name: 'Sachsen-Anhalt',
    hauptstadt: 'Magdeburg',
    nachbarlaender: ['Niedersachsen', 'Brandenburg', 'Sachsen', 'Thüringen'],
    nachbarstaaten: [],
    meer: [],
    fluesse: ['Elbe', 'Saale'],
    landschaften: ['Harz', 'Brocken', 'Altmark', 'Magdeburger Börde'],
    staedte: ['Magdeburg', 'Halle (Saale)', 'Dessau-Roßlau'],
    feiertage: [],
  },
  SH: {
    name: 'Schleswig-Holstein',
    hauptstadt: 'Kiel',
    nachbarlaender: ['Hamburg', 'Niedersachsen', 'Mecklenburg-Vorpommern'],
    nachbarstaaten: ['Dänemark'],
    meer: ['Nordsee', 'Ostsee'],
    fluesse: ['Eider', 'Trave'],
    landschaften: ['Sylt', 'Fehmarn', 'Helgoland', 'Wattenmeer', 'Holsteinische Schweiz'],
    staedte: ['Kiel', 'Lübeck', 'Flensburg'],
    groesste: 'Kiel',
    lage: 'im Norden',
    feiertage: [],
    // the Holsteinische Schweiz is a landscape here
    tabu: ['Elbe', 'Schweiz'],
  },
};
const CODES = Object.keys(LANDFAKTEN);
const F = LANDFAKTEN;

// Which Länder touch, by name, for all 16: the three that are not offered are neighbours all the same.
export const NACHBARN: Record<string, string[]> = {
  ...Object.fromEntries(CODES.map((c) => [F[c].name, F[c].nachbarlaender])),
  Bremen: ['Niedersachsen'],
  Saarland: ['Rheinland-Pfalz'],
  Thüringen: ['Hessen', 'Bayern', 'Sachsen', 'Sachsen-Anhalt', 'Niedersachsen'],
};
const STAATEN = [...new Set(CODES.flatMap((c) => F[c].nachbarstaaten))];

export interface LandQuestion {
  id: string;
  q: string;
  // the first one is right
  o: string[];
  a: 0;
  why: string;
}

const MASCULINE = ['Rhein', 'Main', 'Neckar', 'Inn'];
const den = (river: string) => (MASCULINE.includes(river) ? 'den ' : 'die ') + river;
const list = (a: string[]) => (a.length > 1 ? a.slice(0, -1).join(', ') + ' und ' + a[a.length - 1] : a[0]);
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z]/g, '');
const day = (h: { name: string; datum?: string }) => (h.datum ? `${h.name} (${h.datum})` : h.name);
// two days with different names on the same date are one holiday (Reformationstag, Reformationsfest)
const dayKey = (h: { name: string; datum?: string }) => h.datum || h.name;
const ROSE = [
  'im Norden',
  'im Nordosten',
  'im Osten',
  'im Südosten',
  'im Süden',
  'im Südwesten',
  'im Westen',
  'im Nordwesten',
];
// where a state certainly is not: the opposite side of the compass rose and the two directions next to it
const farSide = (lage: string) =>
  lage === 'in der Mitte'
    ? ['im Norden', 'im Süden']
    : [4, 3, 5].map((step) => ROSE[(ROSE.indexOf(lage) + step) % ROSE.length]);

type Listed = 'fluesse' | 'landschaften';
// A river or a mountain range may cross a border, so it is a wrong option only for a state that neither lists it
// nor touches a state that lists it. `tabu` holds what this rule misses.
const absent = (key: Listed, name: string, code: string) =>
  !F[code].tabu?.includes(name) &&
  CODES.filter((c) => F[c][key].includes(name)).every((c) => c !== code && !NACHBARN[F[c].name].includes(F[code].name));
const everything = (key: Listed) => [...new Set(CODES.flatMap((c) => F[c][key]))];

export function landQuestions(code: string): LandQuestion[] {
  const f = F[code],
    N = f.name,
    out: LandQuestion[] = [];
  const rest = CODES.filter((c) => c !== code);
  let turn = 0;
  // two wrong options, a different pair each time
  const two = <T>(from: T[]) => {
    turn += 3;
    return from.length < 2 ? [] : [from[turn % from.length], from[(turn + 1) % from.length]];
  };
  const add = (id: string, q: string, answer: string, wrong: string[], why: string) => {
    if (wrong.length >= 2) out.push({ id: `land_${code}_${id}`, q, o: [answer, ...wrong], a: 0, why });
  };
  const capitals = rest.map((c) => F[c].hauptstadt);

  if (f.stadtstaat) {
    const why = `${N} ist ein Stadtstaat: eine Stadt, die zugleich ein Bundesland ist.`;
    add(
      'stadtstaat',
      `${N} ist eine Stadt und zugleich ein Bundesland. Wie nennt man das?`,
      'Stadtstaat',
      ['Inselstaat', 'Nachbarstaat'],
      why,
    );
    add(
      'stadtland',
      'Welches Bundesland ist zugleich eine einzige Stadt?',
      N,
      two(rest.filter((c) => !F[c].stadtstaat).map((c) => F[c].name)),
      why,
    );
    if (f.bund)
      add(
        'bund',
        'Welche Stadt ist die Hauptstadt von Deutschland?',
        N,
        two(capitals.filter((c) => c !== N)),
        `${N} ist die Hauptstadt von Deutschland und zugleich ein Bundesland.`,
      );
  } else {
    const why = `${f.hauptstadt} ist die Hauptstadt von ${N}.`;
    add('haupt', `Wie heißt die Hauptstadt von ${N}?`, f.hauptstadt, two(capitals), why);
    add(
      'hauptland',
      `Von welchem Bundesland ist ${f.hauptstadt} die Hauptstadt?`,
      N,
      two(rest.map((c) => F[c].name)),
      why,
    );
    if (f.groesste && f.groesste !== f.hauptstadt)
      add(
        'hauptgross',
        `${f.groesste} ist die größte Stadt in ${N}. Ist ${f.groesste} auch die Hauptstadt?`,
        `Nein, die Hauptstadt ist ${f.hauptstadt}`,
        [
          `Ja, ${f.groesste} ist die Hauptstadt`,
          `Nein, die Hauptstadt ist ${f.staedte.find((s) => s !== f.groesste && s !== f.hauptstadt)}`,
        ],
        `${why} Die größte Stadt ist ${f.groesste}.`,
      );
  }

  const far = rest.map((c) => F[c].name).filter((name) => !f.nachbarlaender.includes(name));
  const nbWhy = `${N} grenzt an ${list(f.nachbarlaender)}.`;
  for (const nb of f.nachbarlaender) add('nb_' + slug(nb), `Welches Bundesland grenzt an ${N}?`, nb, two(far), nbWhy);
  if (f.nachbarlaender.length >= 2)
    for (const i of [0, 1])
      add(
        'nbnicht' + i,
        `Welches Bundesland grenzt nicht an ${N}?`,
        far[i * (far.length - 1)],
        two(f.nachbarlaender.filter((name) => rest.some((c) => F[c].name === name))),
        nbWhy,
      );

  const abroad = STAATEN.filter((s) => !f.nachbarstaaten.includes(s) && !f.tabu?.includes(s));
  if (f.nachbarstaaten.length) {
    const why = `${N} grenzt an ${list(f.nachbarstaaten)}.`;
    for (const s of f.nachbarstaaten)
      add('st_' + slug(s), `Welches Nachbarland von Deutschland grenzt an ${N}?`, s, two(abroad), why);
    if (f.nachbarstaaten.length >= 2)
      add(
        'stnicht',
        `Welches Nachbarland von Deutschland grenzt nicht an ${N}?`,
        abroad[0],
        f.nachbarstaaten.slice(0, 2),
        why,
      );
  } else
    add(
      'st_keins',
      `Grenzt ${N} an ein Nachbarland von Deutschland?`,
      'Nein, nur an deutsche Bundesländer',
      two(abroad.filter((s) => !['Schweiz', 'Niederlande'].includes(s))).map((s) => `Ja, an ${s}`),
      `${N} hat keine Grenze zu einem anderen Staat. ${nbWhy}`,
    );

  if (f.meer.length) {
    const both = f.meer.length > 1;
    add(
      'meer',
      `An welchem Meer liegt ${N}?`,
      both ? 'An der Nordsee und an der Ostsee' : `An der ${f.meer[0]}`,
      both
        ? ['Nur an der Nordsee', 'Nur an der Ostsee']
        : [`An der ${f.meer[0] === 'Ostsee' ? 'Nordsee' : 'Ostsee'}`, 'An keinem Meer'],
      `${N} liegt an der ${f.meer.join(' und an der ')}.`,
    );
    add(
      'meerland',
      `Welches Bundesland liegt an der ${f.meer[0]}?`,
      N,
      two(rest.filter((c) => !F[c].meer.length && !F[c].ohneMeer).map((c) => F[c].name)),
      `${N} liegt an der ${f.meer.join(' und an der ')}.`,
    );
  } else if (!f.ohneMeer)
    add(
      'meer',
      `Liegt ${N} am Meer?`,
      'Nein',
      ['Ja, an der Nordsee', 'Ja, an der Ostsee'],
      `${N} hat keine Küste am Meer.`,
    );

  const found = (key: Listed, tag: string, ask: string, askNot: string, where: (name: string) => string) => {
    const own = f[key],
      wrong = everything(key).filter((name) => absent(key, name, code)),
      why = `In ${N} findest du: ${list(own)}.`;
    for (const name of own) {
      add(`${tag}_${slug(name)}`, ask, name, two(wrong), why);
      add(
        `${tag}wo_${slug(name)}`,
        where(name),
        N,
        two(rest.filter((c) => absent(key, name, c)).map((c) => F[c].name)),
        why,
      );
    }
    if (own.length >= 2) add(tag + 'nicht', askNot, wrong[code.charCodeAt(1) % wrong.length], two(own), why);
  };
  found(
    'fluesse',
    'fl',
    `Welchen Fluss findest du in ${N}?`,
    `Welchen Fluss findest du nicht in ${N}?`,
    (name) => `Wo findest du ${den(name)}?`,
  );
  found(
    'landschaften',
    'la',
    `Was findest du in ${N}?`,
    `Was findest du nicht in ${N}?`,
    (name) => `Auf einer Karte steht „${name}“. Welches Bundesland zeigt die Karte?`,
  );

  // two cities with the same first word (Frankfurt am Main, Frankfurt (Oder)) are never set against each other
  const first = (city: string) => city.split(' ')[0];
  const cities = [...new Set(rest.flatMap((c) => F[c].staedte.concat(F[c].stadtstaat ? [] : F[c].hauptstadt)))];
  for (const city of f.staedte) {
    add(
      'sd_' + slug(city),
      `Welche Stadt liegt in ${N}?`,
      city,
      two(cities.filter((c) => !f.staedte.some((own) => first(own) === first(c)))),
      `${city} liegt in ${N}.`,
    );
    if (city !== f.hauptstadt)
      add(
        'sdwo_' + slug(city),
        `In welchem Bundesland liegt ${city}?`,
        N,
        two(rest.map((c) => F[c].name)),
        `${city} liegt in ${N}.`,
      );
  }
  if (f.groesste)
    add(
      'gross',
      `Welche Stadt ist die größte in ${N}?`,
      f.groesste,
      f.staedte.filter((s) => s !== f.groesste).slice(0, 2),
      `${f.groesste} ist die größte Stadt in ${N}.`,
    );

  if (f.lage) {
    const why = `${N} liegt ${f.lage} von Deutschland.`,
      wrong = farSide(f.lage);
    const side = (lage: string) => (f.lage === 'in der Mitte' ? 'Ganz ' + lage : cap(lage));
    add('lage', `Wo in Deutschland liegt ${N}?`, cap(f.lage), wrong.map(side), why);
    add(
      'lageland',
      `Welches Bundesland liegt ${f.lage} von Deutschland?`,
      N,
      two(rest.filter((c) => wrong.includes(F[c].lage!)).map((c) => F[c].name)),
      why,
    );
  }

  // only states whose law was read count, for the answer and for the wrong options
  const read = CODES.filter((c) => F[c].feiertage.length);
  const has = (c: string, h: { name: string; datum?: string }) =>
    F[c].feiertage.some((x) => dayKey(x) === dayKey(h)) || !!F[c].tabu?.includes(h.name);
  const days = read
    .flatMap((c) => F[c].feiertage)
    .filter((h, i, all) => !has(code, h) && all.findIndex((x) => dayKey(x) === dayKey(h)) === i)
    .map(day);
  for (const h of f.feiertage) {
    const why = `„${h.name}“${h.datum ? ` (${h.datum})` : ''} ist in ${N} ein gesetzlicher Feiertag.`;
    add('ft_' + slug(h.name), `Welcher Tag ist in ${N} ein Feiertag?`, day(h), two(days), why);
    add(
      'ftwo_' + slug(h.name),
      `In welchem Bundesland ist „${h.name}“ ein Feiertag?`,
      N,
      two(read.filter((c) => !has(c, h)).map((c) => F[c].name)),
      why,
    );
  }
  return out;
}
const abroadName = (s: string) => (s === 'Schweiz' || s === 'Niederlande' ? 'die ' + s : s);
// the Notizkarte of one state, from the same facts
export function landNote(code: string) {
  const f = F[code],
    N = f.name;
  return {
    title: 'Mein Bundesland: ' + N,
    lines: [
      f.stadtstaat
        ? `${N} ist ein Stadtstaat: eine Stadt, die zugleich ein Bundesland ist.${f.bund ? ` ${N} ist auch die Hauptstadt von Deutschland.` : ''}`
        : `Die Hauptstadt von ${N} ist ${f.hauptstadt}.`,
      f.lage ? `${N} liegt ${f.lage} von Deutschland.` : '',
      `Nachbarn in Deutschland: ${list(f.nachbarlaender)}.`,
      f.nachbarstaaten.length
        ? `${N} grenzt außerdem an ${list(f.nachbarstaaten.map(abroadName))}.`
        : `${N} hat keine Grenze zu einem anderen Staat.`,
      f.meer.length ? `${N} liegt an der ${f.meer.join(' und an der ')}.` : '',
      `Flüsse: ${list(f.fluesse)}.`,
      `Auf der Karte findest du: ${list(f.landschaften)}.`,
      f.staedte.length ? `Städte: ${list(f.staedte)}.${f.groesste ? ` Die größte ist ${f.groesste}.` : ''}` : '',
      f.feiertage.length ? `Feiertage, die es nicht überall gibt: ${list(f.feiertage.map(day))}.` : '',
    ].filter(Boolean),
  };
}
export const LAND_PACKS = CODES;
