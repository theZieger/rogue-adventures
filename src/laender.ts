// The Bundesländer a family can choose, and what each one changes: shown subject names, what is hidden until a
// parent switches it on, the usual way of written subtraction, and how each unit fits the state's plan.
// It also holds the words two states say differently (reword) and the lines that explain a state's own grammar words.
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
  // by unit; a unit without an entry is 'offen'. Anything but 'offen' only where the line behind it was read in the
  // state's official plan; the sources are in lehrplan/laender/_passung-je-thema.md, which a test compares
  fit: Record<string, Fit>;
  // by unit: one sentence for parents under the verdict
  note: Record<string, string>;
  // by '<unit>.<task type>': the state's plan has another word for what the task type teaches
  gloss?: Record<string, Gloss>;
}
// one line for the child where the tutorial explains the task type, one for the parents at the task type
export interface Gloss {
  kind: string;
  eltern: string;
}
const fits = (by: Partial<Record<Fit, string>>) =>
  Object.fromEntries(
    (Object.entries(by) as [Fit, string][]).flatMap(([fit, units]) => units.split(' ').map((unit) => [unit, fit])),
  ) as Record<string, Fit>;

const ZEIT = {
  'satzbaustelle.zeit': {
    kind: 'Präsens heißt bei euch auch Gegenwart. Das Präteritum ist eine Form der Vergangenheit.',
    eltern: 'Der Lehrplan hier sagt Gegenwart und Vergangenheit statt Präsens und Präteritum.',
  },
};
const ZEIT_BY = {
  'satzbaustelle.zeit': {
    kind: 'Präsens heißt bei euch auch Gegenwart, Präteritum heißt 1. Vergangenheit.',
    eltern: 'Der Lehrplan hier sagt Gegenwart und 1. Vergangenheit statt Präsens und Präteritum.',
  },
};
const kern = (eltern: string) => {
  const g = { kind: 'Das Prädikat heißt bei euch auch Satzkern.', eltern };
  return { 'satzbaustelle.satzglied': g, 'satzbaustelle.praedikat': g };
};
const KERN = kern('Der Lehrplan hier nennt das Prädikat auch Satzkern.');
// Grundstufe, Mehrstufe, Meiststufe are the words of the Saxon plan
const steig = (words: string) => ({
  'satzbaustelle.steig': {
    kind: `In der Schule heißt das vielleicht anders: ${words}.`,
    eltern: `Grundstufe, Mehrstufe und Meiststufe sind die Wörter aus Sachsen. Die Klasse sagt vielleicht ${words}.`,
  },
});
const STUFEN = steig('Grundform und Vergleichsstufen');
const FORMEN = steig('Grundform und Vergleichsformen');
const KOMPARATIV = steig('Grundform, Komparativ und Superlativ');
const POSITIV = steig('Positiv, Komparativ und Superlativ');

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
    gloss: { ...ZEIT, ...STUFEN },
    fit: fits({
      passt:
        'strom math bau jahrmarkt satzbaustelle freunde wetterstation kompass verkehr frueher musik teestube doppeldecker ichdu1 instrumente2 musik1 laute1 schreiben2 woerter2 zahlen20 formen1 zahlen100 malteilen groessen2 koerper1 jahr1 baeume2',
      frueher: 'sinne',
      nicht: 'ethik kirchenjahr wiese feste2',
      offen: 'feuer gemeinde religionen wald woerterwerkstatt ichwelt kartoffel kornkammer formen2 tiere2 natur2',
    }),
    note: {
      math: 'Punkt vor Strich, Teilbarkeitsregeln und Drittel stehen hier nicht im Plan; ob schriftlich abgezogen oder ergänzt wird, stellt er frei.',
      bau: 'Kegel, Pyramide, Parallelogramm sowie Verschieben und Drehen stehen hier nicht im Plan.',
      woerterwerkstatt:
        'Für doppelte Mitlaute, Verlängern, Dehnungs-h und Trennen war die Klassenstufe im Plan nicht nachzulesen.',
      satzbaustelle: 'Die Zeitformen heißen hier Gegenwart und Vergangenheit statt Präsens und Präteritum.',
      ethik:
        'In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik; Martin Luther ist Stoff des Religionsunterrichts.',
      kirchenjahr:
        'In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik; das Kirchenjahr ist Stoff des Religionsunterrichts.',
      freunde:
        'In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik; Streit und Zusammenleben stehen im Sachunterricht.',
      ichwelt: 'In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik.',
      kartoffel:
        'Der Plan verlangt eine Nutzpflanze nach Wahl der Schule; dieses Thema ist möglich, aber nicht vorgeschrieben.',
      kornkammer:
        'Der Plan verlangt eine Nutzpflanze nach Wahl der Schule; dieses Thema ist möglich, aber nicht vorgeschrieben.',
      wiese:
        'Die Wiese ist kein Pflichtthema, die Schule wählt den Lebensraum; Tierentwicklung und Naturschutz stehen im Plan.',
      wetterstation: 'Bauernregeln stehen hier nicht im Plan.',
      sinne:
        'Sinnesorgane und ihr Schutz sind hier Stoff der Klassen 1/2; Rauchen, Alkohol und Medikamente stehen nicht im Sachunterricht.',
      musik: 'Notenwerte sind hier schon in Klasse 1/2 verbindlich.',
      teestube:
        'Auch Französisch kann hier erste Fremdsprache sein; die Zahlen 11 bis 19 sind nicht ausdrücklich genannt.',
      doppeldecker: 'Auch Französisch kann hier erste Fremdsprache sein.',
      ichdu1:
        'In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik; Gefühle, Regeln, Streit und Familie stehen im Sachunterricht.',
      feste2:
        'In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik; christliche Feste gehören zum Religionsunterricht.',
      schreiben2: 'Für doppelte Mitlaute und das Verlängern war die Klassenstufe im Plan nicht nachzulesen.',
      woerter2: 'Wortfamilien, Wortstamm und Wortfelder sind hier erst für Klasse 3/4 als Begriffe vorgesehen.',
      formen1: 'Rechteck, Quadrat und Quader sind hier erst in Klasse 3/4 verbindlich.',
      groessen2: 'Kommabeträge, Millimeter und „sicher, möglich, unmöglich“ stehen hier erst in Klasse 3/4.',
      formen2:
        'Symmetrie und Würfelgebäude stehen hier in Klasse 1/2; parallel, senkrecht, Kanten und Flächen erst in Klasse 3/4.',
      koerper1: 'Der Notruf steht hier erst in Klasse 3/4 beim Thema Feuer.',
      baeume2: 'Bestimmte Baumarten, Frühblüher und Obstsorten schreibt der Plan nicht vor.',
      tiere2: 'Tierhaltung steht im Plan; bestimmte Vogelarten und Kleintiere schreibt er nicht vor.',
      natur2:
        'Licht, Luft und Pläne stehen im Plan; Sonne, Mond und Sterne, Thermometer und Warnzeichen nennt er nicht.',
      wald: 'Der Plan verlangt einen Lebensraum nach Wahl der Schule; der Wald ist möglich, aber nicht vorgeschrieben.',
      strom: 'Stromkreis, Leiter und Energie stehen hier in Klasse 3/4; Magnete nennt der Plan nicht.',
      religionen:
        'In Baden-Württemberg gibt es in der Grundschule kein Fach Ethik; Feste anderer Kulturen stehen im Sachunterricht der Klassen 1/2.',
      kompass: 'Baden-Württemberg auf der Karte steht hier im Plan der Klassen 3/4.',
    },
  },
  BY: {
    name: 'Bayern',
    labels: { Sachkunde: 'HSU' },
    long: { Sachkunde: 'Heimat- und Sachunterricht' },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'abz',
    wordlist: true,
    gloss: { ...ZEIT_BY, ...KERN, ...STUFEN },
    fit: fits({
      passt:
        'religionen strom wald math bau jahrmarkt woerterwerkstatt satzbaustelle wetterstation kompass verkehr frueher musik teestube doppeldecker feste2 instrumente2 musik1 laute1 schreiben2 woerter2 zahlen20 formen1 zahlen100 malteilen groessen2 formen2 koerper1 jahr1',
      frueher: 'wiese sinne',
      nicht: 'ethik kirchenjahr kartoffel kornkammer',
      offen: 'feuer gemeinde freunde ichwelt ichdu1 baeume2 tiere2 natur2',
    }),
    note: {
      math: 'Vorgeschrieben ist hier das Abziehverfahren; Punkt vor Strich, Teilbarkeitsregeln und Drittel von Mengen stehen nicht im Plan.',
      bau: 'Parallel und senkrecht, Parallelogramm sowie Verschieben und Drehen stehen hier nicht im Plan.',
      woerterwerkstatt: 'Das Komma vor „aber“ und „denn“ nennt der Plan nicht.',
      satzbaustelle: 'Die Zeitformen heißen hier Gegenwart und 1. Vergangenheit statt Präsens und Präteritum.',
      ethik: 'Martin Luther und die Reformation kommen im bayerischen Plan für Ethik nicht vor.',
      kirchenjahr: 'Das Kirchenjahr kommt im bayerischen Plan für Ethik nicht vor.',
      kartoffel: 'Die Kartoffel steht nicht im bayerischen Plan.',
      kornkammer: 'Getreide ist hier nur ein Beispiel für regionale Lebensmittel; Getreidearten sind nicht verlangt.',
      wiese: 'Wiese oder Hecke ist hier Stoff der Klassen 1/2; in Klasse 3/4 folgen Wald und Gewässer.',
      wetterstation: 'Wetter beobachten ist hier Stoff der Klassen 1/2; Bauernregeln stehen nicht im Plan.',
      verkehr: 'Die Radfahrausbildung liegt hier in Klasse 4.',
      sinne:
        'Die Sinne sind hier Stoff der Klassen 1/2, in Klasse 3/4 folgt nur das Auge; Ohr und Suchtmittel stehen nicht im Plan.',
      musik: 'Notennamen und italienische Wörter wie piano und forte sind hier nicht verlangt.',
      teestube:
        'Verbindlich sind hier nur die Zahlen 1 bis 12, 15, 30 und 45; Körperteile gehören nicht zum Pflichtwortschatz.',
      doppeldecker: 'Wochentage und Monate gehören hier nicht zum verbindlichen Wortschatz.',
      feste2:
        'St. Martin, Erntedank, Nikolaus und Advent nennt der Plan nicht; er verlangt auch Feste anderer Religionen.',
      instrumente2: 'Die Form A – B – A steht hier nicht für Klasse 1/2; dort nur Strophe und Refrain.',
      laute1: 'In Bayern zeigt Lernquest die Wörter Vokal und Konsonant, wie sie im Lehrplan stehen.',
      schreiben2: 'Wörter mit aa, ee, oo und chs gehören hier zum Grundwortschatz der Klassen 3/4.',
      woerter2: 'Der Aufforderungssatz ist hier erst bis Ende Klasse 4 vorgesehen.',
      groessen2: 'Millimeter und Kommabeträge stehen hier erst in Klasse 3/4; Dezimeter nennt der Plan nicht.',
      formen2:
        'Der rechte Winkel steht hier erst in Klasse 3/4; parallel, senkrecht, Gerade und Strahl nennt der Plan nicht.',
      koerper1: 'Erste Hilfe und Notruf stehen hier erst in Klasse 3/4.',
      baeume2: 'Laub- und Nadelbäume gehören hier zum Wald in Klasse 3/4; Obst steht in Klasse 1/2.',
      tiere2: 'Im Plan stehen Haus- und Nutztiere; Vögel und Kleintiere nennt er nicht.',
      natur2:
        'Luft, Wasser und Pläne stehen im Plan; Licht und Schatten, Sonne, Mond und Sterne und Warnzeichen nennt er nicht.',
      wald: 'Wald und Gewässer stehen hier im Plan der Klassen 3/4, mit Arten und Nahrungsbeziehungen.',
      strom: 'Magnete nennt der Plan nicht. Er verlangt Schaltzeichen; Lernquest zeigt den Stromkreis als Bild.',
      religionen:
        'Feste der Religionen stehen hier schon in Klasse 1/2; Gotteshäuser, Schriften und Zeichen in Klasse 3/4.',
      kompass: 'Bayern auf der Karte steht hier im Plan der Klassen 3/4.',
    },
  },
  BE: {
    name: 'Berlin',
    labels: { Ethik: 'Miteinander', Sachkunde: SU },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'erg',
    french: true,
    wordlist: true,
    gloss: POSITIV,
    fit: fits({
      passt:
        'math bau jahrmarkt woerterwerkstatt satzbaustelle teestube doppeldecker laute1 schreiben2 woerter2 zahlen20 formen1 zahlen100 malteilen groessen2 formen2',
      nicht: 'ethik kirchenjahr kartoffel kornkammer wiese kompass feste2',
      offen:
        'feuer gemeinde religionen strom wald freunde ichwelt wetterstation verkehr frueher sinne musik ichdu1 instrumente2 musik1 koerper1 jahr1 baeume2 tiere2 natur2',
    }),
    note: {
      math: 'Ein Drittel und Bruchteile von Mengen stehen hier nicht im Plan.',
      bau: 'Zylinder, Kegel und Pyramide sowie Dreiecksarten stehen hier bis Klasse 4 nicht im Plan.',
      woerterwerkstatt:
        'Komma vor „aber“ und „denn“ und das Nachschlagen nach der Grundform stehen hier erst in Klasse 5/6.',
      satzbaustelle:
        'Sammelwörter, die Anrede im Brief und Wörter wie mein, dieser, kein stehen hier erst in Klasse 5/6.',
      ethik:
        'In Berlin gibt es in der Grundschule kein Fach Ethik; Martin Luther steht in keinem staatlichen Plan der Grundschule.',
      kirchenjahr:
        'In Berlin gibt es in der Grundschule kein Fach Ethik; das Kirchenjahr steht in keinem staatlichen Plan der Grundschule.',
      freunde:
        'In Berlin gibt es in der Grundschule kein Fach Ethik; im Sachunterricht steht das Thema ohne Klassenstufe.',
      ichwelt:
        'In Berlin gibt es in der Grundschule kein Fach Ethik; im Sachunterricht steht das Thema ohne Klassenstufe.',
      kartoffel: 'Die Kartoffel kommt im Plan nicht vor, nur „Obst und Gemüse“ und „Knollen“.',
      kornkammer: 'Getreide kommt im Plan nicht vor.',
      wiese:
        'Die Wiese ist hier nur ein Lebensraum unter mehreren; Schichten der Wiese und Pflanzensammlung sind nicht verlangt.',
      wetterstation: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      kompass:
        'Himmelsrichtungen, Windrose und Kompass nennt der Plan nicht; Stadtpläne und die Lage Berlins in Deutschland stehen im Plan.',
      verkehr: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      frueher: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      sinne: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      musik: 'Der Musikplan nennt nur mögliche Inhalte für Klasse 1 bis 4 und keine Klassenstufe.',
      teestube: 'Auch Französisch kann hier erste Fremdsprache sein. Der Plan gibt keinen Wortschatz vor.',
      doppeldecker: 'Auch Französisch kann hier erste Fremdsprache sein. Der Plan gibt keinen Wortschatz vor.',
      ichdu1:
        'In Berlin gibt es in der Grundschule kein Fach Ethik; im Sachunterricht steht das Thema ohne Klassenstufe.',
      feste2:
        'In Berlin gibt es in der Grundschule kein Fach Ethik; christliche Feste stehen in keinem staatlichen Plan der Grundschule.',
      instrumente2: 'Der Musikplan nennt nur mögliche Inhalte für Klasse 1 bis 4 und keine Klassenstufe.',
      musik1: 'Der Musikplan nennt nur mögliche Inhalte für Klasse 1 bis 4 und keine Klassenstufe.',
      schreiben2: 'Doppelte Mitlaute stehen hier erst in Klasse 3/4.',
      woerter2: 'Wortfamilien, Wortfelder und der Aufforderungssatz stehen hier erst in Klasse 3/4.',
      groessen2:
        'Kommabeträge sind hier in Klasse 1/2 ausdrücklich nicht vorgesehen; Millimeter und Dezimeter folgen in Klasse 3/4.',
      formen2: 'Parallel und senkrecht sowie Gerade und Strahl stehen hier erst in Klasse 3/4.',
      koerper1: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      jahr1: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      baeume2: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      tiere2: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      natur2: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      wald: 'Der Wald ist im Plan nur ein Stichwort zum Lebensraum, ohne feste Klasse; das legt die Schule fest.',
      strom: 'Den Stromkreis nennt der Plan beim Fahrrad, ohne feste Klasse; Magnete nennt er nicht.',
      religionen:
        'In Berlin gibt es in der Grundschule kein Fach Ethik; der Sachunterricht nennt Feste und Feiertage nur allgemein.',
    },
  },
  BB: {
    name: 'Brandenburg',
    labels: { Ethik: 'Miteinander', Sachkunde: SU },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'erg',
    wordlist: true,
    gloss: POSITIV,
    fit: fits({
      passt:
        'math bau jahrmarkt woerterwerkstatt satzbaustelle teestube doppeldecker laute1 schreiben2 woerter2 zahlen20 formen1 zahlen100 malteilen groessen2 formen2',
      nicht: 'ethik kirchenjahr kartoffel kornkammer wiese kompass feste2',
      offen:
        'feuer gemeinde religionen strom wald freunde ichwelt wetterstation verkehr frueher sinne musik ichdu1 instrumente2 musik1 koerper1 jahr1 baeume2 tiere2 natur2',
    }),
    note: {
      math: 'Ein Drittel und Bruchteile von Mengen stehen hier nicht im Plan.',
      bau: 'Zylinder, Kegel und Pyramide sowie Dreiecksarten stehen hier bis Klasse 4 nicht im Plan.',
      woerterwerkstatt:
        'Komma vor „aber“ und „denn“ und das Nachschlagen nach der Grundform stehen hier erst in Klasse 5/6.',
      satzbaustelle:
        'Sammelwörter, die Anrede im Brief und Wörter wie mein, dieser, kein stehen hier erst in Klasse 5/6.',
      ethik:
        'In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; Martin Luther steht in keinem staatlichen Plan der Grundschule.',
      kirchenjahr:
        'In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; das Kirchenjahr steht in keinem staatlichen Plan der Grundschule.',
      freunde:
        'In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; im Sachunterricht steht das Thema ohne Klassenstufe.',
      ichwelt:
        'In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; im Sachunterricht steht das Thema ohne Klassenstufe.',
      kartoffel: 'Die Kartoffel kommt im Plan nicht vor, nur „Obst und Gemüse“ und „Knollen“.',
      kornkammer: 'Getreide kommt im Plan nicht vor.',
      wiese:
        'Die Wiese ist hier nur ein Lebensraum unter mehreren; Schichten der Wiese und Pflanzensammlung sind nicht verlangt.',
      wetterstation: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      kompass:
        'Himmelsrichtungen, Windrose und Kompass nennt der Plan nicht; Karten und die Lage Brandenburgs in Deutschland stehen im Plan.',
      verkehr: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      frueher: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      sinne: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      musik: 'Der Musikplan nennt nur mögliche Inhalte für Klasse 1 bis 4 und keine Klassenstufe.',
      teestube: 'Der Plan gibt keinen Wortschatz vor.',
      doppeldecker: 'Der Plan gibt keinen Wortschatz vor.',
      ichdu1:
        'In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; im Sachunterricht steht das Thema ohne Klassenstufe.',
      feste2:
        'In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; christliche Feste stehen in keinem staatlichen Plan der Grundschule.',
      instrumente2: 'Der Musikplan nennt nur mögliche Inhalte für Klasse 1 bis 4 und keine Klassenstufe.',
      musik1: 'Der Musikplan nennt nur mögliche Inhalte für Klasse 1 bis 4 und keine Klassenstufe.',
      schreiben2: 'Doppelte Mitlaute stehen hier erst in Klasse 3/4.',
      woerter2: 'Wortfamilien, Wortfelder und der Aufforderungssatz stehen hier erst in Klasse 3/4.',
      groessen2:
        'Kommabeträge sind hier in Klasse 1/2 ausdrücklich nicht vorgesehen; Millimeter und Dezimeter folgen in Klasse 3/4.',
      formen2: 'Parallel und senkrecht sowie Gerade und Strahl stehen hier erst in Klasse 3/4.',
      koerper1: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      jahr1: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      baeume2: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      tiere2: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      natur2: 'Der Plan ordnet dieses Thema keiner Klasse zu; das legt die Schule fest.',
      wald: 'Der Wald ist im Plan nur ein Stichwort zum Lebensraum, ohne feste Klasse; das legt die Schule fest.',
      strom: 'Den Stromkreis nennt der Plan beim Fahrrad, ohne feste Klasse; Magnete nennt er nicht.',
      religionen:
        'In Brandenburg gibt es in den Klassen 1 bis 4 kein Fach Ethik; der Sachunterricht nennt Feste nur allgemein.',
    },
  },
  HH: {
    name: 'Hamburg',
    labels: { Ethik: 'Miteinander', Sachkunde: SU },
    hide: CHRISTIAN,
    off: { ...SAXON, math: ['smul', 'vorrang', 'klammer'], bau: ['umfang', 'flaeche', 'lage'], jahrmarkt: ['liter'] },
    minus: 'erg',
    gloss: FORMEN,
    fit: fits({
      passt:
        'math jahrmarkt woerterwerkstatt satzbaustelle wetterstation kompass verkehr doppeldecker ichdu1 feste2 instrumente2 musik1 laute1 schreiben2 woerter2 zahlen20 zahlen100 malteilen groessen2 formen2 jahr1 baeume2',
      frueher: 'religionen sinne teestube',
      spaeter: 'bau',
      nicht: 'ethik kirchenjahr wiese natur2',
      offen: 'feuer gemeinde strom wald freunde ichwelt kartoffel kornkammer frueher musik formen1 koerper1 tiere2',
    }),
    note: {
      math: 'Schriftliches Malnehmen, Punkt vor Strich und Klammern stehen hier erst in Klasse 4; Teilbarkeitsregeln und Drittel nennt der Plan nicht.',
      bau: 'Faltvorlagen, Ansichten, parallel und senkrecht, Umfang und Fläche stehen hier erst in Klasse 4; Körper und Symmetrie in Klasse 3.',
      woerterwerkstatt: 'Das Komma vor „aber“ und „denn“ steht hier nicht im Plan.',
      satzbaustelle:
        'Wörter wie dieser, jeder und kein nennt der Plan nicht; er kennt nur Personal- und Possessivpronomen.',
      ethik:
        'In Hamburg gibt es in der Grundschule kein Fach Ethik; Martin Luther kommt im Plan für Religion nicht vor.',
      kirchenjahr:
        'In Hamburg gibt es in der Grundschule kein Fach Ethik; das Kirchenjahr kommt im Plan für Religion nicht vor.',
      freunde:
        'In Hamburg gibt es in der Grundschule kein Fach Ethik; Freundschaft steht in Klasse 1/2 im Sachunterricht.',
      ichwelt:
        'In Hamburg gibt es in der Grundschule kein Fach Ethik; philosophische Fragen sind dort Teil des Fachs Religion.',
      kartoffel: 'Nutzpflanzen sind hier Stoff der Klassen 1/2, und nur eine Pflanze nach Wahl der Schule.',
      kornkammer: 'Nutzpflanzen sind hier Stoff der Klassen 1/2, und nur eine Pflanze nach Wahl der Schule.',
      wiese: 'Der Lebensraum Wiese ist in Hamburg kein Unterrichtsvorhaben.',
      wetterstation: 'Schwimmen und Sinken gehört hier zum Vorhaben „Wasser“ der Klasse 4.',
      frueher:
        '„Früher“ macht Hamburg am Mittelalter und an der Hansezeit fest; Medien und andere Länder stehen im Plan.',
      sinne: 'Die fünf Sinne stehen hier in Klasse 1/2; der Bau von Auge und Ohr ist nicht genannt.',
      musik:
        'Instrumentengruppen und Takt stehen im Plan; Notennamen, piano und forte und Komponisten sind nicht vorgeschrieben.',
      teestube: 'Englisch beginnt hier in Klasse 1; Farben, Zahlen bis 20, Essen und Tiere sind Stoff der Klassen 1/2.',
      doppeldecker: 'Englisch beginnt hier schon in Klasse 1; Lesen und Schreiben kommen ab Klasse 3 dazu.',
      ichdu1:
        'In Hamburg gibt es in der Grundschule kein Fach Ethik; die Inhalte stehen in Religion und im Sachunterricht.',
      feste2:
        'In Hamburg gibt es in der Grundschule kein Fach Ethik; Feste stehen in Religion, St. Martin und Advent sind nicht genannt.',
      instrumente2: 'Die Form A – B – A steht hier erst in Klasse 3/4.',
      schreiben2: 'ß, Dehnungs-h und Wörter mit aa, ee, oo und ai stehen hier erst in Klasse 3/4.',
      woerter2: 'Hamburg nennt Aussage-, Frage- und Ausrufesatz, nicht den Aufforderungssatz.',
      zahlen20: 'Cent-Münzen kommen hier erst in Klasse 2 dazu.',
      formen1: 'Rechteck, Quadrat und Quader kommen hier erst in Klasse 2 dazu.',
      groessen2: 'Kommabeträge und Dezimeter stehen hier erst in Klasse 3, Millimeter in Klasse 4.',
      formen2: 'Rechter Winkel, Gerade und Strecke stehen hier erst in Klasse 3, parallel und senkrecht in Klasse 4.',
      koerper1:
        'Körperpflege und Ernährung stehen im Plan; Erste Hilfe, Notruf und Nein sagen stehen nicht im Sachunterricht.',
      jahr1: 'Halbe Stunden liest man hier erst in Klasse 2 ab.',
      tiere2: 'Vögel und Nutztiere stehen im Plan; Heimtiere und Kleintiere nennt er nicht.',
      natur2: 'Licht, Luft und Warnzeichen stehen hier nicht im Plan; das Thermometer folgt in Klasse 3/4.',
      wald: 'Der Wald ist in Hamburg kein eigenes Unterrichtsvorhaben; Bäume stehen in Klasse 1/2 bei den Jahreszeiten.',
      strom: 'Magnetismus steht hier in Klasse 1/2, Stromkreise beim Thema Energie meist in Klasse 4.',
      religionen:
        'Feste aus mehreren Religionen stehen hier im Fach Religion schon in Klasse 1/2; Gotteshäuser in Klasse 3/4.',
      jahrmarkt: 'Liter und Milliliter stehen hier erst in Klasse 4.',
    },
  },
  HE: {
    name: 'Hessen',
    labels: { Sachkunde: SU },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'erg',
    french: true,
    wordlist: true,
    gloss: STUFEN,
    fit: fits({
      passt: 'math bau jahrmarkt teestube zahlen20 formen1 zahlen100 malteilen groessen2',
      spaeter: 'formen2',
      nicht: 'ethik kirchenjahr',
      offen:
        'feuer gemeinde religionen strom wald woerterwerkstatt satzbaustelle freunde ichwelt kartoffel kornkammer wiese wetterstation kompass verkehr frueher sinne musik doppeldecker ichdu1 feste2 instrumente2 musik1 laute1 schreiben2 woerter2 koerper1 jahr1 baeume2 tiere2 natur2',
    }),
    note: {
      math: 'Der ältere Plan schreibt beim schriftlichen Abziehen das Ergänzen vor, Malnehmen erst in Klasse 4; Punkt vor Strich nennt er nicht.',
      bau: 'Faltvorlagen stehen hier am Ende der Grundschulzeit; Parallelogramm, Verschieben und Drehen nennen die Pläne nicht.',
      jahrmarkt: 'Gewichte, Liter und Milliliter ordnet der Plan dem Ende der Klasse 4 zu.',
      woerterwerkstatt:
        'Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest.',
      satzbaustelle:
        'Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest.',
      ethik: 'Martin Luther ist im hessischen Plan für Ethik nicht enthalten; das ist Stoff des Religionsunterrichts.',
      kirchenjahr:
        'Kirche, Bibel und Kirchenjahr sind im hessischen Plan für Ethik nicht enthalten; das ist Stoff des Religionsunterrichts.',
      freunde: 'Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest.',
      ichwelt: 'Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest.',
      kartoffel: 'Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt.',
      kornkammer: 'Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt.',
      wiese: 'Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt.',
      wetterstation: 'Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt.',
      kompass:
        'Karten und das Bundesland Hessen nennt der ältere Plan für Klasse 3/4; meist legt die Schule fest, was wann drankommt.',
      verkehr: 'Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt.',
      frueher: 'Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt.',
      sinne: 'Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt.',
      musik: 'Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest.',
      teestube: 'Auch Französisch kann hier erste Fremdsprache sein.',
      doppeldecker:
        'Auch Französisch kann hier erste Fremdsprache sein; verlangt ist bis Klasse 4 nur das Lesen vertrauter Sätze.',
      ichdu1: 'Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest.',
      feste2: 'Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest.',
      instrumente2: 'Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest.',
      musik1: 'Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest.',
      laute1: 'Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest.',
      schreiben2: 'Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest.',
      woerter2: 'Der Plan beschreibt nur den Stand am Ende von Klasse 4; was wann drankommt, legt die Schule fest.',
      groessen2: 'Kommabeträge und Millimeter stehen hier erst in Klasse 3/4; Dezimeter nennt der Plan nicht.',
      formen2:
        'Rechter Winkel, parallel, senkrecht, Gerade und Strahl stehen hier erst in Klasse 3/4; Symmetrie passt zu Klasse 1/2.',
      koerper1: 'Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt.',
      jahr1: 'Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt.',
      baeume2: 'Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt.',
      tiere2: 'Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt.',
      natur2: 'Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt.',
      wald: 'Der Plan nennt keine Themenliste und keinen Jahrgang; die Schule legt fest, was wann drankommt.',
      strom: 'Der ältere Plan nennt Stromquellen für Klasse 1/2 und Magnete ohne feste Klasse.',
      religionen:
        'Feste und das Miteinander der Religionen stehen im Plan bis Ende Klasse 4; was wann drankommt, legt die Schule fest.',
    },
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
    gloss: POSITIV,
    fit: fits({
      passt:
        'wald math bau jahrmarkt woerterwerkstatt satzbaustelle freunde wetterstation kompass verkehr frueher teestube doppeldecker ichdu1 instrumente2 musik1 laute1 schreiben2 woerter2 zahlen20 formen1 zahlen100 malteilen groessen2 formen2 koerper1 jahr1 baeume2 tiere2 natur2',
      frueher: 'wiese sinne',
      nicht: 'ethik kirchenjahr feste2',
      offen: 'feuer gemeinde religionen strom ichwelt kartoffel kornkammer musik',
    }),
    note: {
      math: 'Schriftliches Malnehmen und Teilbarkeitsregeln erst in Klasse 4, Drittel gar nicht; das Verfahren beim Abziehen wählt die Lehrkraft.',
      bau: 'Umfang, Fläche und das Drehen stehen hier erst in Klasse 4; parallel und senkrecht schon in Klasse 1/2.',
      woerterwerkstatt: 'Das Komma vor „aber“ und „denn“ nennt der Plan nicht, nur das Komma bei Aufzählungen.',
      satzbaustelle: 'Die Steigerung der Adjektive steht hier schon in Klasse 1/2.',
      ethik:
        'Martin Luther kommt im Plan für Philosophieren mit Kindern nicht vor; das gehört hier zum Religionsunterricht.',
      kirchenjahr: 'Das Kirchenjahr steht hier ausdrücklich beim Fach Religion, nicht beim Philosophieren mit Kindern.',
      ichwelt:
        'Nur die Frage nach Natur, Gemachtem und Gedachtem hat hier eine Entsprechung im Philosophieren mit Kindern.',
      kartoffel:
        'Im Plan steht „Pflanzen auf dem Feld“ für Klasse 3/4; Kartoffel und Getreide sind dort nur Beispiele.',
      kornkammer:
        'Im Plan steht „Pflanzen auf dem Feld“ für Klasse 3/4; Kartoffel und Getreide sind dort nur Beispiele.',
      wiese: 'Wiesenpflanzen stehen hier in Klasse 1/2; Stockwerke kennt der Plan nur beim Wald.',
      wetterstation: 'Schmelzen, Verdampfen, Kondensieren und Gefrieren stehen hier schon in Klasse 1/2.',
      sinne: 'Sinnesorgane und Hilfsmittel sind hier Stoff der Klassen 1/2; Süchte stehen in Klasse 3/4.',
      musik: 'Ob Klasse 3 schon nach dem neuen Musikplan von 2024 arbeitet, war nicht nachzulesen.',
      teestube: 'An manchen Schulen ist hier Französisch die erste Fremdsprache; der Plan gibt keine Wortliste vor.',
      doppeldecker:
        'An manchen Schulen ist hier Französisch die erste Fremdsprache; der Plan gibt keine Wortliste vor.',
      feste2:
        'Christliche Feste stehen nicht im Plan für Philosophieren mit Kindern; Staunen über die Natur und Wachsen passen.',
      instrumente2: 'Die Form A – B – A entspricht hier den „Formmodellen“ der Klassen 3/4.',
      malteilen: 'Hier soll am Ende von Klasse 2 schon das ganze kleine Einmaleins sitzen.',
      groessen2: 'Kommabeträge stehen hier erst in Klasse 3; Dezimeter ist nur ein Zusatzangebot.',
      formen2: 'Den Strahl nennt der Plan nicht, nur Gerade und Strecke.',
      koerper1: 'Erste Hilfe und Rettungskette stehen hier erst in Klasse 3/4.',
      natur2:
        'Warnzeichen stehen nicht im Sachunterricht; Sonne, Mond und Sterne gehören hier zum Philosophieren mit Kindern.',
      wald: 'Der Wald mit Waldarten, Stockwerken und Pilzen steht hier im Plan der Klassen 3/4.',
      strom:
        'Magnetismus steht hier im Plan der Klassen 1/2 und laut Jahresübersicht in Klasse 3; den Stromkreis nennt der Plan nicht.',
      religionen:
        'Die Vielfalt der Religionen steht hier im Sachunterricht der Klassen 3/4; einzelne Feste nennt der Plan nicht.',
      kompass:
        'Mecklenburg-Vorpommern mit Landeshauptstadt, Flüssen, Seen und Meer steht hier im Plan der Klassen 3/4.',
    },
  },
  NI: {
    name: 'Niedersachsen',
    labels: { Ethik: 'Werte und Normen', Sachkunde: SU },
    hide: CHRISTIAN,
    off: { ...SAXON, schreiben2: ['doppel'] },
    minus: 'abz',
    gloss: { ...KERN, ...KOMPARATIV },
    fit: fits({
      passt:
        'math bau jahrmarkt woerterwerkstatt satzbaustelle wetterstation kompass frueher musik teestube ichdu1 instrumente2 musik1 laute1 schreiben2 woerter2 zahlen20 formen1 zahlen100 malteilen groessen2 koerper1 jahr1 baeume2 tiere2 natur2',
      frueher: 'sinne',
      spaeter: 'formen2',
      nicht: 'ethik kirchenjahr kartoffel kornkammer',
      offen: 'feuer gemeinde religionen strom wald freunde ichwelt wiese verkehr doppeldecker feste2',
    }),
    note: {
      math: 'Teilen mit Rest, Brüche, Punkt vor Strich und Teilbarkeit stehen nicht im Plan; wie schriftlich abgezogen wird, legt die Schule fest.',
      bau: 'Umfang, Kegel, Parallelogramm und Dreiecksarten nennt der Plan nicht.',
      woerterwerkstatt: 'Komma vor „aber“ und „denn“ und das Trennen am Zeilenende nennt der Plan nicht ausdrücklich.',
      satzbaustelle:
        'Anrede im Brief, Redensarten und Wörter wie mein, dieser und kein nennt der Plan nicht ausdrücklich.',
      ethik: 'Martin Luther ist kein Inhalt des Fachs Werte und Normen.',
      kirchenjahr:
        'Das Kirchenjahr ist kein Inhalt des Fachs Werte und Normen; es steht bei der Christlichen Religion.',
      freunde:
        'Verglichen wurden die Vorgaben von 2022; den neuen Plan für Werte und Normen von 2026 haben wir noch nicht gelesen.',
      ichwelt:
        'Verglichen wurden die Vorgaben von 2022; den neuen Plan für Werte und Normen von 2026 haben wir noch nicht gelesen.',
      kartoffel: 'Weder Kartoffel noch Getreide sind im niedersächsischen Plan genannt.',
      kornkammer: 'Weder Kartoffel noch Getreide sind im niedersächsischen Plan genannt.',
      wiese: 'Die Wiese ist im Plan nur ein Beispiel für einen Lebensraum, bis Ende Klasse 2.',
      wetterstation: 'Wetterkarte und Bauernregeln stehen hier nicht im Plan.',
      verkehr:
        'Verkehrszeichen und Fahrrad stehen hier nicht im Sachunterricht, sondern in den Vorgaben zu Mobilität und Sport.',
      sinne: 'Die Sinne und ihr Schutz stehen hier bis Ende Klasse 2; Sucht ist Thema bis Ende Klasse 4.',
      musik: 'Noten, Takt und Notennamen sind hier in Klasse 3/4 nur eine Kann-Bestimmung.',
      teestube: 'Lesen spielt hier eine untergeordnete Rolle; das Schriftbild kommt erst nach dem Sprechen.',
      doppeldecker:
        'Ganze englische Sätze still zu lesen geht über das hinaus, was der Plan für das erste Lernjahr nahelegt.',
      ichdu1: 'Gefühle, Regeln, Streit und Familienformen stehen hier im Sachunterricht bis Ende Klasse 2.',
      feste2:
        'Verglichen wurden die Vorgaben von 2022; den neuen Plan für Werte und Normen von 2026 haben wir noch nicht gelesen.',
      instrumente2: 'Der Plan trennt Streich- und Zupfinstrumente, statt von Saiteninstrumenten zu sprechen.',
      laute1: 'In Niedersachsen zeigt Lernquest die Wörter Vokal und Konsonant, wie sie im Lehrplan stehen.',
      schreiben2: 'Doppelte Mitlaute und das Dehnungs-h stehen hier erst bis Ende Klasse 4.',
      formen1: 'Den Quader nennt der Plan erst bis Ende Klasse 4; in Klasse 1/2 stehen Würfel, Kugel und Zylinder.',
      groessen2: 'Kommabeträge nennt der Plan nicht; Millimeter und Säulendiagramme folgen bis Ende Klasse 4.',
      formen2: 'Rechter Winkel, parallel, senkrecht, Kanten und Flächen stehen hier erst bis Ende Klasse 4.',
      wald: 'Der Wald ist im Plan nur ein Beispiel für einen Lebensraum, bis Ende Klasse 2.',
      strom: 'Strom mit Licht, Wärme und Gefahren steht hier im Plan bis Ende Klasse 4; Magnete nennt er nicht.',
      religionen:
        'Verglichen wurden die Vorgaben von 2022; den neuen Plan für Werte und Normen von 2026 haben wir noch nicht gelesen.',
      kompass:
        'Karten und Kompass stehen hier bis Ende Klasse 4 im Plan; Niedersachsen selbst ist dort kein eigenes Thema.',
    },
  },
  NW: {
    name: 'Nordrhein-Westfalen',
    labels: { Ethik: 'Miteinander', Sachkunde: SU },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'erg',
    wordlist: true,
    gloss: { ...ZEIT, ...KERN, ...STUFEN },
    fit: fits({
      passt:
        'math bau jahrmarkt woerterwerkstatt satzbaustelle freunde kompass verkehr frueher musik ichdu1 instrumente2 musik1 laute1 schreiben2 woerter2 zahlen20 formen1 zahlen100 malteilen groessen2 formen2 koerper1 jahr1 baeume2 tiere2 natur2',
      frueher: 'sinne',
      nicht: 'ethik kirchenjahr kartoffel kornkammer wiese wetterstation',
      offen: 'feuer gemeinde religionen strom wald ichwelt teestube doppeldecker feste2',
    }),
    note: {
      math: 'Punkt vor Strich, Teilbarkeitsregeln und Drittel stehen hier nicht im Plan.',
      bau: 'Den Kegel sowie Verschieben und Drehen nennt der Plan nicht.',
      woerterwerkstatt: 'Komma vor „aber“ und „denn“ und das Trennen am Zeilenende nennt der Plan nicht ausdrücklich.',
      satzbaustelle: 'Die Zeitstufen heißen hier Gegenwart und Vergangenheit statt Präsens und Präteritum.',
      ethik: 'Martin Luther steht hier in der Evangelischen Religionslehre, nicht in der Praktischen Philosophie.',
      kirchenjahr:
        'Das Kirchenjahr steht hier in der Evangelischen Religionslehre, nicht in der Praktischen Philosophie.',
      freunde: 'Verglichen mit dem Lehrplan Praktische Philosophie; nicht jede Grundschule bietet das Fach an.',
      ichwelt:
        'Verglichen mit dem Lehrplan Praktische Philosophie; nur ein Teil des Themas hat dort eine Entsprechung.',
      kartoffel: 'Weder Kartoffel noch Getreide sind im nordrhein-westfälischen Plan genannt.',
      kornkammer: 'Weder Kartoffel noch Getreide sind im nordrhein-westfälischen Plan genannt.',
      wiese: 'Die Wiese ist im Plan nicht genannt; das Beispiel für einen Lebensraum ist dort der Wald.',
      wetterstation:
        'Wetter, Wasserkreislauf und die Zustände des Wassers stehen nicht im nordrhein-westfälischen Plan.',
      verkehr:
        'Verkehrsregeln und Verkehrszeichen stehen hier schon bis Ende Klasse 2, die Fahrradausbildung bis Ende Klasse 4.',
      sinne:
        'Die Sinne stehen hier bis Ende Klasse 2; der Bau von Auge und Ohr ist nicht verlangt, Drogen sind Thema bis Ende Klasse 4.',
      musik:
        'Takt und Notennamen sind hier nicht verlangt; Streich- und Zupfinstrumente zählen zusammen als Saiteninstrumente.',
      teestube: 'Der Plan nennt Themen nur als Beispiele und keinen Wortschatz, nur den Stand am Ende von Klasse 4.',
      doppeldecker:
        'Der Plan nennt Themen nur als Beispiele und keinen Wortschatz, nur den Stand am Ende von Klasse 4.',
      ichdu1: 'Verglichen mit dem Lehrplan Praktische Philosophie; nicht jede Grundschule bietet das Fach an.',
      feste2:
        'Die Praktische Philosophie verlangt Feste unterschiedlicher Religionen und Kulturen, nicht nur christliche.',
      groessen2: 'Kommabeträge und Millimeter stehen hier erst bis Ende Klasse 4; Dezimeter kommt nicht vor.',
      formen2:
        'Rechter Winkel, parallel und senkrecht stehen hier erst bis Ende Klasse 4; Gerade, Strecke und Strahl nennt der Plan nicht.',
      wald: 'Der Wald steht hier bis Ende Klasse 4 als Beispiel dafür, wie Tiere und Pflanzen an ihren Lebensraum angepasst sind.',
      strom:
        'Magnetismus steht hier schon bis Ende Klasse 2, einfache Stromkreise und Energieträger bis Ende Klasse 4.',
      religionen:
        'Feste und Merkmale der Religionen stehen in Praktischer Philosophie bis Ende Klasse 2; nicht jede Schule bietet das Fach an.',
      kompass: 'Karten, Kompass und Nordrhein-Westfalen stehen hier im Plan bis Ende Klasse 4.',
    },
  },
  RP: {
    name: 'Rheinland-Pfalz',
    labels: { Sachkunde: SU },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'erg',
    french: true,
    wordlist: true,
    gloss: { ...ZEIT, ...STUFEN },
    fit: fits({
      passt: 'math bau jahrmarkt zahlen20 formen1 zahlen100 malteilen groessen2',
      spaeter: 'formen2',
      nicht: 'ethik kirchenjahr',
      offen:
        'feuer gemeinde religionen strom wald woerterwerkstatt satzbaustelle freunde ichwelt kartoffel kornkammer wiese wetterstation kompass verkehr frueher sinne musik teestube doppeldecker ichdu1 feste2 instrumente2 musik1 laute1 schreiben2 woerter2 koerper1 jahr1 baeume2 tiere2 natur2',
    }),
    note: {
      math: 'Punkt vor Strich, Teilbarkeitsregeln und Drittel nennt der Plan nicht; wie schriftlich abgezogen wird, wählt die Schule.',
      woerterwerkstatt: 'Der Plan für Deutsch nennt keine Klassenstufen, nur den Stand am Ende von Klasse 4.',
      satzbaustelle: 'Der Plan für Deutsch nennt keine Klassenstufen, nur den Stand am Ende von Klasse 4.',
      ethik: 'Martin Luther kommt im Plan für Ethik nur als ein Beispiel für Zivilcourage vor, nicht als Lebensbild.',
      kirchenjahr:
        'Kirche, Bibel und Kirchenjahr stehen so nicht im Plan für Ethik; dort geht es um Weltreligionen im Vergleich.',
      freunde: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      ichwelt: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      kartoffel: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      kornkammer: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      wiese: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      wetterstation: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      kompass: 'Karten, Kompass und Rheinland-Pfalz nennt der Plan bis Ende Klasse 4; die Klasse legt die Schule fest.',
      verkehr: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      frueher: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      sinne: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      musik: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      teestube:
        'Der Plan ist für Englisch ab Klasse 1 geschrieben; seit 2024/25 beginnt die Fremdsprache erst in Klasse 3.',
      doppeldecker:
        'Der Plan ist für Englisch ab Klasse 1 geschrieben; seit 2024/25 beginnt die Fremdsprache erst in Klasse 3.',
      ichdu1: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      feste2: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      instrumente2: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      musik1: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      laute1: 'Der Plan für Deutsch nennt keine Klassenstufen, nur den Stand am Ende von Klasse 4.',
      schreiben2: 'Der Plan für Deutsch nennt keine Klassenstufen, nur den Stand am Ende von Klasse 4.',
      woerter2: 'Der Plan für Deutsch nennt keine Klassenstufen, nur den Stand am Ende von Klasse 4.',
      groessen2:
        'Millimeter und Dezimeter stehen hier erst bis Ende Klasse 4; die Uhr bis Ende Klasse 2 nur auf Viertelstunden.',
      formen2:
        'Rechter Winkel, parallel, senkrecht, Gerade sowie Kanten und Flächen stehen hier erst bis Ende Klasse 4.',
      koerper1: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      jahr1: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      baeume2: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      tiere2: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      natur2: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      wald: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      strom: 'Der Plan nennt Themen nur als Beispiele bis Ende Klasse 4; die Klasse legt die Schule fest.',
      religionen:
        'Feste und Merkmale der Weltreligionen stehen im Plan für Ethik bis Ende Klasse 4; die Klasse legt die Schule fest.',
    },
  },
  SN: {
    name: 'Sachsen',
    labels: {},
    hide: [],
    off: { jahrmarkt: ['liter'] },
    minus: 'abz',
    fit: fits({
      nicht: 'feuer wald strom',
      spaeter: 'gemeinde religionen',
      passt:
        'math bau jahrmarkt woerterwerkstatt satzbaustelle teestube doppeldecker ethik kirchenjahr freunde ichwelt kartoffel kornkammer wetterstation kompass sinne verkehr wiese frueher musik zahlen20 formen1 zahlen100 malteilen groessen2 formen2 laute1 schreiben2 woerter2 koerper1 jahr1 baeume2 tiere2 natur2 ichdu1 feste2 instrumente2 musik1',
    }),
    note: {},
  },
  ST: {
    name: 'Sachsen-Anhalt',
    labels: { Sachkunde: SU },
    hide: CHRISTIAN,
    off: SAXON,
    minus: 'erg',
    gloss: { ...kern('Der Lehrplan hier sagt Satzkern statt Prädikat.'), ...KOMPARATIV },
    fit: fits({
      passt:
        'religionen wald math bau jahrmarkt woerterwerkstatt satzbaustelle freunde ichwelt kartoffel kornkammer kompass verkehr frueher musik teestube doppeldecker ichdu1 feste2 instrumente2 musik1 laute1 schreiben2 woerter2 zahlen20 formen1 zahlen100 malteilen groessen2 formen2 koerper1 jahr1 baeume2 natur2',
      frueher: 'sinne',
      nicht: 'strom ethik kirchenjahr wiese',
      offen: 'feuer gemeinde wetterstation tiere2',
    }),
    note: {
      math: 'Ein Drittel ist hier nicht vorgesehen, nur Viertel, Hälfte und drei Viertel bei Größen.',
      woerterwerkstatt:
        'Doppelte Mitlaute, Dehnungs-h und doppelte Selbstlaute nennt der Plan nicht als einzelne Themen.',
      satzbaustelle: 'Statt Prädikat sagt der Plan hier Satzkern.',
      ethik: 'Martin Luther und die Reformation werden im Ethikplan nicht genannt.',
      kirchenjahr: 'Das Kirchenjahr wird im Ethikplan nicht genannt.',
      kartoffel:
        'Getreidearten und Kartoffel mit Anbau und Verwendung stehen hier ausdrücklich im Plan für Klasse 3/4.',
      kornkammer:
        'Getreidearten und Kartoffel mit Anbau und Verwendung stehen hier ausdrücklich im Plan für Klasse 3/4.',
      wiese: 'Die Wiese wird nicht namentlich verlangt; die Schule wählt einen Lebensraum, genannt ist nur der Wald.',
      wetterstation: 'Wettererscheinungen und die Zustandsformen von Wasser stehen hier schon in Klasse 1/2.',
      frueher: 'Kindheit früher und heute steht hier schon in Klasse 1/2; Erfindungen und Medien in Klasse 3/4.',
      sinne:
        'Sinnesorgane und ihr Schutz gehören hier in Klasse 1/2; Rauchen, Alkohol und Medikamente sind nicht genannt.',
      musik: 'Piano, forte und crescendo stehen nicht im Plan; Viertel-, halbe und Achtelnoten schon in Klasse 1/2.',
      instrumente2: 'Instrumentengruppen und die Form A – B – A stehen hier erst in Klasse 3/4.',
      schreiben2:
        'Für Klasse 1/2 nennt der Plan nur Satzanfänge und Eigennamen groß; doppelte Mitlaute sind kein eigenes Thema.',
      woerter2: 'Das Adjektiv und Wortfamilien stehen hier erst in Klasse 3/4.',
      groessen2: 'Der Dezimeter steht hier erst in Klasse 3/4.',
      formen2: 'Rechter Winkel, parallel, senkrecht, Gerade und Strecke stehen hier erst in Klasse 3/4.',
      koerper1: 'Erste Hilfe und Notruf stehen hier erst in Klasse 3/4.',
      tiere2: 'Nutz- und Heimtiere stehen hier in Klasse 3/4; Vögel werden nicht namentlich verlangt.',
      natur2: 'Licht und Schatten, Schall und Warnzeichen kommen im Plan nicht ausdrücklich vor.',
      wald: 'Der Wald als Natur-, Lebens- und Wirtschaftsraum steht hier im Plan der Klassen 3/4.',
      strom: 'Magnete und Stromkreis stehen hier nicht im Plan; elektrische Energie kommt in Klasse 3/4 vor.',
      religionen:
        'Zeichen, Rituale und Gegenstände aus Judentum, Christentum und Islam stehen hier in Klasse 3/4; andere Religionen nicht.',
      kompass: 'Das Bundesland mit Magdeburg, den Nachbarländern und dem Harz steht hier im Plan der Klassen 3/4.',
    },
  },
  SH: {
    name: 'Schleswig-Holstein',
    labels: { Ethik: 'Philosophie', Sachkunde: SU },
    hide: CHRISTIAN,
    off: { ...SAXON, math: ['smul', 'vorrang', 'teilbar', 'klammer'] },
    minus: 'erg',
    wordlist: true,
    gloss: FORMEN,
    fit: fits({
      passt:
        'math bau jahrmarkt woerterwerkstatt satzbaustelle teestube doppeldecker laute1 schreiben2 woerter2 zahlen20 formen1 zahlen100 malteilen groessen2 formen2',
      nicht: 'religionen ethik kirchenjahr musik feste2',
      offen:
        'feuer gemeinde strom wald freunde ichwelt kartoffel kornkammer wiese wetterstation kompass verkehr frueher sinne ichdu1 instrumente2 musik1 koerper1 jahr1 baeume2 tiere2 natur2',
    }),
    note: {
      math: 'Schriftliches Malnehmen, halbschriftliches Teilen, Punkt vor Strich, Klammern und Teilbarkeit stehen hier erst in Klasse 4.',
      bau: 'Verschieben und Drehen nennt der Plan nicht; ob die Geometrie in Klasse 3 oder 4 liegt, legt die Schule fest.',
      woerterwerkstatt:
        'Doppelte Mitlaute, Dehnungs-h und Trennen nennt der Plan nicht einzeln; beim Komma nur die Aufzählung.',
      satzbaustelle: 'Anrede im Brief und Wörter wie mein, dieser und kein nennt der Plan nicht einzeln.',
      ethik: 'Martin Luther steht hier im Plan für Religion, nicht im Fach Philosophie.',
      kirchenjahr: 'Die christlichen Feste stehen hier im Plan für Religion, nicht im Fach Philosophie.',
      freunde: 'Im Fach Philosophie ist das ein Wahlthema; die Schule legt fest, ob es drankommt.',
      ichwelt: 'Im Fach Philosophie ist das ein Wahlthema; die Schule legt fest, ob es drankommt.',
      kartoffel:
        'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      kornkammer:
        'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      wiese: 'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      wetterstation:
        'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      kompass: 'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      verkehr: 'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      frueher: 'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      sinne: 'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      musik:
        'Notenwerte, Takt, Notennamen, piano und forte sowie Komponisten nennt der Plan nicht; Instrumentengruppen stehen im Plan.',
      teestube: 'Lesen und Schreiben werden hier in der Grundschule nur angebahnt.',
      doppeldecker: 'Lesen und Schreiben werden hier in der Grundschule nur angebahnt.',
      ichdu1: 'Im Fach Philosophie ist das ein Wahlthema; die Schule legt fest, ob es drankommt.',
      feste2: 'Feste sind hier kein Thema des Fachs Philosophie; sie stehen im Plan für Religion.',
      instrumente2: 'Der Musikplan gilt für alle vier Klassen zusammen und nennt keine Klassenstufe.',
      musik1: 'Der Musikplan gilt für alle vier Klassen zusammen und nennt keine Klassenstufe.',
      woerter2: 'Genannt ist hier der Ausrufesatz, nicht der Aufforderungssatz.',
      groessen2:
        'Millimeter und Dezimeter stehen hier erst in Klasse 3/4; die Uhr in Klasse 1/2 nur auf Viertelstunden.',
      formen2: 'Rechter Winkel, parallel, senkrecht, Gerade und Strecke stehen hier erst in Klasse 3/4.',
      koerper1:
        'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      jahr1: 'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      baeume2: 'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      tiere2: 'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      natur2: 'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      wald: 'Im Plan ist das ein mögliches Thema ohne feste Klasse; die Schule legt fest, ob und wann es drankommt.',
      strom: 'Magnete und Stromkreis nennt der Plan nicht; erneuerbare Energien stehen dort für Klasse 3/4.',
      religionen:
        'Feste der Religionen sind hier kein Thema des Fachs Philosophie; christliche Feste stehen im Plan für Religion.',
    },
  },
};
// in the order of the picker: by name
export const LAND_CODES = Object.keys(LAENDER).sort((a, b) => LAENDER[a].name.localeCompare(LAENDER[b].name, 'de'));

const of = (land: string): Land | undefined =>
  Object.prototype.hasOwnProperty.call(LAENDER, land) ? LAENDER[land] : undefined;
export const isLand = (land: unknown): land is string => typeof land === 'string' && !!of(land);
// '' (no state chosen, „Allgemein“) and an unknown code change nothing, except for the task types in OWN
export const profileHides = (land: string, unit: string) => !!of(land)?.hide.includes(unit);
// Task types about the chosen Bundesland itself. Without one they have nothing to ask, so they are off and
// neither a parent's switch nor earlier practice brings them back.
const OWN: Record<string, string[]> = { kompass: ['land'] };
export const needsLand = (unit: string, type: string) => !!OWN[unit]?.includes(type);
export const profileOff = (land: string, unit: string): string[] =>
  of(land) ? of(land)!.off[unit] || [] : OWN[unit] || [];
export const fitOf = (land: string, unit: string): Fit => of(land)?.fit[unit] || 'offen';
export const labelOf = (land: string, subject: string, long?: boolean) =>
  (long && of(land)?.long?.[subject]) || of(land)?.labels[subject] || subject;
export const landName = (land: string) => of(land)?.name || '';
// without a state: Ergänzen, the method Lernquest has shown from the start
export const minusDefault = (land: string): Minus => of(land)?.minus || 'erg';
// why a unit is hidden by default: Religion content elsewhere, or taught later there
export const whyHides = (unit: string) => (CHRISTIAN.includes(unit) ? 'religion' : 'spaeter');
// why a task type is off by default: no Bundesland chosen, Saxon dialect, or taught later there
export const whyOff = (unit: string, type: string) =>
  needsLand(unit, type) ? 'land' : (SAXON as Record<string, string[]>)[unit]?.includes(type) ? 'mundart' : 'spaeter';
export const noteOf = (land: string, unit: string) => of(land)?.note[unit] || '';
export const glossOf = (land: string, unit: string, type: string): Gloss | undefined =>
  of(land)?.gloss?.[`${unit}.${type}`];

// Bayern and Niedersachsen teach Vokal and Konsonant where Lernquest says Selbstlaut and Mitlaut. Only shown and
// spoken text goes through here; data, answers and their comparison keep the Saxon words. Konsonant is a weak noun
// (den, dem, des Konsonanten), so a „Mitlaut“ is only swapped in a form listed here: with one of these articles,
// or alone at the start, after „oder“, „und“, a colon or an opening quote. Anything else stays as it is, and tests/test_laender.js fails for it.
const VOKAL = ['BY', 'NI'];
const SELBSTLAUT = /(?<!\p{L})Selbstlaut(e|en|s)?(?!\p{L})/gu;
const MITLAUTE = /(?<!\p{L})Mitlauten?(?!\p{L})/gu;
const ARTICLES = ['der', 'ein', 'den', 'einen', 'dem', 'einem', 'des', 'eines']
  .flatMap((a) => [a, a[0].toUpperCase() + a.slice(1)])
  .join('|');
// the article, then at most one adjective (ein doppelter, einen anderen)
const MITLAUT = new RegExp(
  `(?<!\\p{L})(?:(${ARTICLES}) (\\p{Ll}+(?:er|en) )?|(?<=^|oder |und |: |„))Mitlaut(s?)(?!\\p{L})`,
  'gu',
);
export const reword = (text: string, land: string) =>
  !VOKAL.includes(land) || !text.includes('laut')
    ? text
    : text
        .replace(SELBSTLAUT, 'Vokal$1')
        .replace(MITLAUTE, 'Konsonanten')
        .replace(
          MITLAUT,
          (_, article = '', adjective = '', s) =>
            `${article && article + ' '}${adjective}Konsonant${s || !/^(|der|ein)$/i.test(article) ? 'en' : ''}`,
        );
