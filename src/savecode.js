// Save code LQ2: the save as JSON, made smaller before deflate. Known words become tokens („~“ and their place in WORDS in
// base 36), an object whose values are objects with the same keys (know, stats, dex) becomes columns, and a column of whole
// numbers is stored as differences. Everything comes back exactly; a string that starts with „~“ gets a second one.
const SAVECODE = (() => {
  // WORDS may only ever grow at the end and never change an entry: a word's place is its token in codes that already exist.
  // Words contain no „:“ or „|“.
  const WORDS = (
    'runs|wins|dex|seenTut|stats|add|hist|sub|mul|riddle|seq|grid|div|rest|rund|dopp|sadd|ssub|smul|teilbar|mauer|bruch|vorrang|zahlwort|kopf|zmul|vergl|' +
    'ueber|geld|netz|koerper|band|lage|umfang|flaeche|spiegel|bewegung|vieleck|ansicht|def|ord|parts|ground|grow|ltk|wissen|woerter|maerchen|doppel|verl|' +
    'dehn|gross|zus|abc|rede|stamm|trenn|komma|grund|vokal|sachsen|wortart|zeit|steig|satzglied|umstell|ober|teekessel|ersatz|weglass|pronomen|redensart|' +
    'praedikat|anrede|begleiter|arten|brot|nutzen|wert|zustand|begriff|kreislauf|vorhersage|regel|forschen|richtung|rose|plan|karte|uhr|laenge|masse|rad|' +
    'los|tafel|sach|fahrplan|pflanze|stock|entw|herbar|schutz|sinne|geraet|alltag|kultur|medien|pruefen|hilfe|drogen|zeichen|vorfahrt|fehlt|weg|noten|takt|' +
    'ton|instr|begriffe|komp|laender|welten|en_de|de_en|zahl|farbe|odd|luecke|bedeutung|reihe|frage|menge|zerlegen|vergleich|nachbar|rechnen|geschichte|' +
    'strahl|formen|muster|bauen|stelle|zehner|gerade|folge|plus|minus|dreieck|bild|teilen|strategie|kalender|daten|zufall|kombi|linien|anlaut|laute|lautpos|' +
    'silben|alphabet|reim|lesen|besonders|satzz|kleinw|mehrzahl|artikel|familie|feld|satzart|pflege|essen|kleidung|zeiten|tag|wetter|baum|frueh|keim|obst|' +
    'garten|vogel|zug|heim|hof|klein|licht|himmel|luft|waerme|wasser|gefahr|gefuehl|hoeflich|fest|symbol|jahr|natur|wachsen|spielen|laut|hoch|stimme|form|' +
    'gegen|know|knowSeq|evoUnlocked|bestWorld|seenNews|grade|off|lastStarter|sound|speak|setup|done|skipped|pin|storage|persisted|warnedAt|stamps|' +
    'stampsTotal|stampCard|owned|worn|backupAt|progressAt|garden|beds|crop|plantedAt|materials|pantry|hut|rooms|items|top|tip|ring|disc|weekly|week|' +
    'progress|beaten|tally|hidden|level|type|shape|world|mode|last|floor|map|hero|evo|maxHp|attacks|name|mod|coins|tiers|path|shield|node|enemy|fresh|atk|' +
    'boss|elite|weekboss|weak|lastMod|reps|used|recent|hint|right|answered|solved|power|start|spin|max|wucht|panzer|math|bau|jahrmarkt|ethik|kirchenjahr|' +
    'freunde|woerterwerkstatt|satzbaustelle|teestube|doppeldecker|kartoffel|kornkammer|wetterstation|kompass|verkehr|wiese|frueher|ichwelt|musik|zahlen20|' +
    'formen1|zahlen100|malteilen|groessen2|formen2|laute1|schreiben2|woerter2|koerper1|jahr1|baeume2|tiere2|natur2|ichdu1|feste2|instrumente2|musik1|feuer|' +
    'normal|trank|grosstrank|schild|beere|keks|lupe|engel|stern|fight|event|treasure|school|labor|taeusch|markt|bergwerk|arena|weizen|roggen|hafer|fuchs|' +
    'kroete|baer|kauz|biber|holzpferd|schaustellerin|luther|kuesterin|hofbande|graphit|elle|teapot|bigred|knolli|muellerin|wetterwart|kartenzeichnerin|' +
    'schulaerztin|verkehrspolizistin|imkerin|heimatforscherin|pfadfinderin|dirigentin|held-mathe12|held-deutsch12|held-sachkunde12|held-ethik12|' +
    'held-musik12|Sumpfbrocken|sumpfbrocken|Regenwicht|regenwicht|Streichholzkopf|streichholzkopf|Krabbelstein|krabbelstein|Dornenigel|dornenigel|' +
    'Moorschlund|moorschlund|Lavamolch|lavamolch|Nebelqualle|nebelqualle|Ranklerin|ranklerin|Nachtschwinge|nachtschwinge|Glaspanzer|glaspanzer|Ofenwurm|' +
    'ofenwurm|Frostblitz|frostblitz|Dschungelbrüller|dschungelbrueller|Magmagolem|magmagolem|Schattenwolf|schattenwolf|Sturmreiter|sturmreiter|Rechenkönig|' +
    'rechenkoenig|Mörtelbatzen|moertelbatzen|Schweißfunke|schweissfunke|Schotterhaufen|schotterhaufen|Pfützenmolch|pfuetzenmolch|Brennnesselwall|' +
    'brennnesselwall|Mischtrommel|mischtrommel|Kabelnatter|kabelnatter|Staubfahne|staubfahne|Dachmarder|fox|Efeuranke|efeuranke|Rostkäfer|rostkaefer|' +
    'Abrissbirne|abrissbirne|Die Jahrmarktwespe|jahrmarktwespe|Die Bratwurstglut|bratwurstglut|Der Pfützenspritzer|pfuetzenspritzer|Der Kürbiskopf|' +
    'kuerbiskopf|Der Autoscooter|autoscooter|Der Ausrufer|ausrufer|Der Kirmesnebel|kirmesnebel|Die Funkenrakete|funkenrakete|Das Zerrbild|zerrbild|' +
    'Die Zaunranke|zaunranke|Der Hau-den-Lukas|haudenlukas|Der Herr der Geisterbahn|herrdergeisterbahn|Der Zweifler|zweifler|Der Vergessliche|vergesslicher|' +
    'Der Verwechsler|verwechsler|Der Schwindler|schwindler|Der strenge Richter|richter|Der Ablasshändler|ablasshaendler|Der Streithahn|Der Neidhammel|' +
    'neidhammel|Der Novembernebel|novembernebel|Die Zugluft|zugluft|Der Kerzenlöscher|kerzenloescher|Die längste Nacht|laengstenacht|Der Spätfrost|' +
    'spaetfrost|Die Naschkatze|Der Märzsturm|maerzsturm|Der Morgenmuffel|morgenmuffel|Die Mauer|Der alte Winter|bear|Der Zankapfel|zankapfel|Der Neidwurm|' +
    'neidwurm|Die Flunkerei|flunkerei|Der Großtuer|toad|Das Gerücht|geruecht|Der Keil|keil|Der Buchstabendreher|buchstabendreher|Das Eselsohr|eselsohr|' +
    'Der Stummel|stummel|Die Kritzelei|kritzelei|Der Radierer|radierer|Der Fehlerteufel|fehlerteufel|Der Satzverdreher|satzverdreher|Der Wortsalat|' +
    'wortsalat|Das Knickheft|knickheft|Der Punktdieb|punktdieb|Der Spitzer|spitzer|Der Rotstift|rotstift|Die Möwe|moewe|Der Teefleck|teefleck|' +
    'Der Umklappschirm|umklappschirm|Die Bulldogge|bulldogge|Der Pfeifkessel|pfeifkessel|Der Wappenlöwe|wappenloewe|Die Taube|taube|Die Telefonzelle|' +
    'telefonzelle|Die Ampel|ampel|Die Hecke|hecke|Die Zugbrücke|zugbruecke|Der Uhrturm|uhrturm|Blattlaus|blattlaus|Drahtwurm|drahtwurm|Wühlmaus|wuehlmaus|' +
    'Fäulewolke|faeulewolke|Käferlarve|kaeferlarve|Kartoffelkäfer|kartoffelkaefer|Blattfresser|blattfresser|Hagelwolke|hagelwolke|Ackerteufel|ackerteufel|' +
    'Eierhaufen|eierhaufen|Riesenlarve|riesenlarve|Käferkönigin|kaeferkoenigin|Kornkäfer|kornkaefer|Feldmaus|Mehlmotte|mehlmotte|Getreiderost|getreiderost|' +
    'Mutterkorn|mutterkorn|Der Kornwolf|Nieselregen|nieselregen|Glatteis|glatteis|Die Sturmböe|sturmboee|Hitzeflimmern|hitzeflimmern|Die Gewitterzelle|' +
    'gewitterzelle|Das Unwetter|unwetter|Die Nebelbank|nebelbank|Das Dornengestrüpp|dornengestruepp|Der Morast|morast|Die Elster|elster|Der Kartendieb|' +
    'kartendieb|Der Magnetberg|magnetberg|Der Lärm|laerm|Das Blendlicht|blendlicht|Die Brennnessel|Der Schimmel|Die Qualmwolke|qualmwolke|Der Gruppendruck|' +
    'gruppendruck|Der dichte Nebel|Das Glatteis|Das Schlagloch|schlagloch|Die Dämmerung|daemmerung|Der tote Winkel|totwinkel|Der Raser|raser|' +
    'Der Trampelpfad|trampelpfad|Die Trockenheit|trockenheit|Die Plastiktüte|plastiktuete|Das Spritzmittel|spritzmittel|Die Mähmaschine|maehmaschine|' +
    'Die Straßenwalze|strassenwalze|Das Spinnennetz|spinnennetz|Der Schimmelfleck|schimmelfleck|Der Stromausfall|stromausfall|Das Vorurteil|vorurteil|' +
    'Die Falschmeldung|falschmeldung|Das große Vergessen|vergessen|Das Lampenfieber|lampenfieber|Der Trotzkopf|trotzkopf|Die Ausrede|ausrede|' +
    'Das Schubladendenken|schubladendenken|Die Schadenfreude|schadenfreude|Die große Angst|grosseangst|Der Müllberg|muellberg|Die Dürre|duerre|' +
    'Das Hochwasser|hochwasser|Der Stromfresser|stromfresser|Der Orkan|orkan|Der Kohlequalm|kohlequalm|Der Misston|misston|Der Holzwurm|holzwurm|' +
    'Die Quietschgeige|quietschgeige|Der Hustenreiz|hustenreiz|Die Donnerpauke|donnerpauke|Der Krachmacher|krachmacher|Der Wackelturm|wackelturm|' +
    'Das Maßband|massband|Der Schummelwürfel|schummelwuerfel|Der Kuckuck|kuckuck|Die schiefe Waage|schiefewaage|Der Kaugummiautomat|kaugummiautomat|' +
    'Das Spiegel-S|spiegels|Die Bastelschere|bastelschere|Die Buchstabensuppe|buchstabensuppe|Der Papierflieger|papierflieger|Der Wackelzahn|wackelzahn|' +
    'Die Bücherlawine|buecherlawine|Die Karies|karies|Die Schlammpfütze|schlammpfuetze|Der Sonnenbrand|sonnenbrand|Die Klette|klette|Der Schnupfen|' +
    'schnupfen|Der Schneesturm|schneesturm|Die zugeknallte Tür|knalltuer|Die schlechte Laune|schlechtelaune|Der Wutanfall|wutanfall|Die Langeweile|' +
    'langeweile|Das Heimweh|heimweh|Der große Streit|grosserstreit|Die Knarrtür|knarrtuer|Die gerissene Saite|gerissenesaite|Der Laubbläser|laubblaeser|' +
    'Der Wasserhahn|wasserhahn|Die Pausenklingel|pausenklingel|Der Presslufthammer|presslufthammer'  ).split('|');
  const NUM = new Map(WORDS.map((w, i) => [w, i]));
  const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const word = (s) => (NUM.has(s) ? '~' + NUM.get(s).toString(36) : s[0] === '~' ? '~' + s : s);
  const unword = (s) => { if (s[0] !== '~') return s; if (s[1] === '~') return s.slice(1); const w = WORDS[parseInt(s.slice(1), 36)]; if (w === undefined) throw new Error('unknown word ' + s); return w; };
  // the parts of 'math:seq' (weekly tally) and 'math:seq:1' (tutorials) one by one
  const str = (s) => s.split(':').map(word).join(':');
  const unstr = (s) => s.split(':').map(unword).join(':');
  const sameKeys = (rows) => { const ks = Object.keys(rows[0]); return ks.length && rows.every((r) => isObj(r) && Object.keys(r).length === ks.length && Object.keys(r).every((k, i) => k === ks[i])) && ks; };
  // whole numbers as base-36 differences in one string: know.last counts up, so its steps are small
  const column = (col) => { const d = col.map((x, i) => x - (i ? col[i - 1] : 0)); return col.every(Number.isSafeInteger) && d.every(Number.isSafeInteger) ? d.map((x) => x.toString(36)).join(',') : col.map(shrink); };
  const uncolumn = (c) => { if (typeof c !== 'string') return c.map(grow); const n = c.split(',').map((x) => parseInt(x, 36)); for (let i = 1; i < n.length; i++) n[i] += n[i - 1]; return n; };
  function shrink(v) {
    if (typeof v === 'string') return str(v);
    if (Array.isArray(v)) return v.map(shrink);
    if (!isObj(v)) return v;
    const ids = Object.keys(v), rows = Object.values(v); const cols = rows.length > 1 && isObj(rows[0]) && sameKeys(rows);
    return cols ? ['~', cols.map(str), ids.map(str), ...cols.map((c) => column(rows.map((r) => r[c])))] : Object.fromEntries(ids.map((k) => [str(k), shrink(v[k])]));
  }
  function grow(v) {
    if (typeof v === 'string') return unstr(v);
    if (isObj(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [unstr(k), grow(x)]));
    if (!Array.isArray(v)) return v;
    if (v[0] !== '~') return v.map(grow);
    const cols = v[1].map(unstr), data = v.slice(3).map(uncolumn);
    return Object.fromEntries(v[2].map((id, i) => [unstr(id), Object.fromEntries(cols.map((c, j) => [c, data[j][i]]))]));
  }
  // A QR code stores 0–9, A–Z and a few signs in 5.5 bits instead of 8. Two bytes become three of these characters
  // (42³ > 65535, like base45 in RFC 9285, but without space, „%“ and „+“, which links do not keep as they are).
  const B42 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$*-./:';
  function to42(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 2) { const two = i + 1 < bytes.length; let n = two ? bytes[i] * 256 + bytes[i + 1] : bytes[i]; for (let k = two ? 3 : 2; k--; n = Math.floor(n / 42)) s += B42[n % 42]; }
    return s;
  }
  function from42(s) {
    const out = []; if (s.length % 3 === 1) throw new Error('base42 length');
    for (let i = 0; i < s.length; i += 3) {
      const c = s.slice(i, i + 3); let n = 0;
      for (let j = c.length; j--;) { const d = B42.indexOf(c[j]); if (d < 0) throw new Error('base42 character'); n = n * 42 + d; }
      if (n > (c.length === 3 ? 65535 : 255)) throw new Error('base42 value');
      if (c.length === 3) out.push(n >> 8, n & 255); else out.push(n);
    }
    return Uint8Array.from(out);
  }
  return { shrink, grow, to42, from42 };
})();
if (typeof module !== 'undefined') module.exports = SAVECODE;
