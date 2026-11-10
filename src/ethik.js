// Ethik Klasse 3 (Lehrplan Sachsen, Lernbereiche 1 und 4): „Ich, wir und die Welt“, Welt 1 „Ich im Wir“, Welt 2 „Wir in der Welt“.
// Registers its unit in MK.MODES; app.js picks it up from there. Fragen und Reihenfolgen mit w: 2 kommen nur in Welt 2 dran.
const ME = (() => {
  const K = typeof MK !== 'undefined' ? MK : require('./knowledge.js');
  const { weightedPick } = K;

  const NOTES = {
    staerken: { title: 'Stärken und Schwächen', lines: ['Jeder Mensch hat Stärken: Dinge, die er gut kann oder die an ihm gut sind.', 'Jeder Mensch hat auch Schwächen: Dinge, die ihm schwerfallen.', 'Stärken sind zum Beispiel Ausdauer (lange durchhalten), Zuverlässigkeit (andere können sich auf dich verlassen), Geduld, Mut und Fröhlichkeit.', 'Schwächen sind zum Beispiel Vergesslichkeit und Nachlässigkeit (Dinge nicht sorgfältig machen). Wer schüchtern ist, traut sich nicht so leicht, auf andere zuzugehen.', 'Was kann ich tun, um besser zu werden? Üben, um Hilfe bitten, mir Zeit lassen und aus Fehlern lernen.', 'Verlieren können heißt: Ich bin enttäuscht, aber ich gratuliere dem Gewinner. Wer gewinnt, lacht niemanden aus.', 'Sich mit anderen freuen: Ich freue mich, wenn ein anderes Kind etwas schafft.'] },
    mut: { title: 'Mut und Angst', lines: ['Angst ist ein Gefühl, das jeder Mensch kennt, auch Erwachsene. Sie warnt uns vor Gefahr.', 'Mut heißt nicht, keine Angst zu haben. Mutig ist, wer trotz Angst etwas Wichtiges tut.', 'Wer sich ohne Grund in Gefahr bringt, ist leichtsinnig, nicht mutig.', 'Das hilft gegen Angst: darüber reden, tief und langsam atmen, in kleinen Schritten üben, Hilfe holen.', 'Auch Nein sagen oder einen Fehler zugeben braucht manchmal Mut.'] },
    erwachsen: { title: 'Kind und Erwachsener', lines: ['Kinder und Erwachsene haben vieles gemeinsam: Alle haben Gefühle und brauchen Essen, Schlaf, Freunde und Zuneigung.', 'Kinder haben besondere Rechte, zum Beispiel das Recht zu spielen, zu lernen und geschützt zu werden.', 'Erwachsene tragen mehr Verantwortung: Sie sorgen für Kinder, arbeiten und verdienen Geld.', 'Auch Kinder haben Pflichten, zum Beispiel Hausaufgaben machen oder im Haushalt helfen.', 'Kinder lernen beim Spielen. Auch Erwachsene spielen gern, und auch Kinder arbeiten, zum Beispiel in der Schule.', '„Typisch Kind“ und „typisch Erwachsener“ stimmt oft nicht: Jeder Mensch ist anders.'] },
    verschieden: { title: 'Gleich und verschieden', lines: ['Menschen unterscheiden sich in Herkunft, Sprache, Aussehen, Familie und Hobbys.', 'Gemeinsames verbindet: Wer dasselbe Hobby hat, kann zusammen spielen.', 'Verschiedenes kann bereichern: Von anderen lernt man neue Spiele, Wörter, Lieder und Gerichte.', 'Ein Vorurteil ist eine Meinung über Menschen, die man sich bildet, ohne sie zu kennen.', '„Jungen weinen nicht“ und „Mädchen können kein Fußball spielen“ sind Vorurteile.', 'Alle Kinder dürfen alles ausprobieren: weinen, Fußball spielen, tanzen, basteln oder klettern.'] },
    gutboese: { title: 'Gut und Böse im eigenen Handeln', lines: ['Trotzen: stur bleiben und sich wehren, oft aus Wut, auch wenn man merkt, dass der andere recht hat.', 'Nachgeben: auf etwas verzichten, damit ein Streit endet.', 'Verzeihen: dem anderen nicht mehr böse sein, wenn er sich entschuldigt hat.', 'Sich versöhnen: nach einem Streit wieder Frieden schließen.', 'Trösten: einem traurigen Menschen Mut machen. Beistehen: zu jemandem halten, der Hilfe braucht.', 'Kann jemand nur gut oder nur böse sein? Jeder Mensch tut mal Gutes und mal etwas, das nicht gut ist. Man kann daraus lernen.', 'Nein sagen ist erlaubt und wichtig, wenn etwas unrecht ist, wehtut oder sich falsch anfühlt.'] },
    zeichen: { title: 'Zeichen und Symbol', lines: ['Ein Zeichen sagt etwas Bestimmtes: Ein Verkehrsschild zeigt, was man tun soll.', 'Ein Symbol steht für etwas, das man nicht sehen kann, zum Beispiel Liebe, Frieden oder Hoffnung.', 'Ein Herz ist ein Symbol für Liebe, eine weiße Taube mit einem Ölzweig ein Symbol für Frieden.', 'Mehr Symbole lernst du im Kirchenjahr kennen.'] },
    dreiwelten: { title: 'Drei Welten', lines: ['Die natürliche Welt: alles, was es auch ohne Menschen gibt, zum Beispiel Bäume, Flüsse, Tiere, Wolken und Steine.', 'Die vom Menschen geschaffene Welt: alles, was Menschen gebaut oder gemacht haben und was man sehen, hören oder anfassen kann, zum Beispiel Häuser, Brücken, Handys und Lieder.', 'Die Gedankenwelt: alles, was es nur in unseren Köpfen und Herzen gibt, zum Beispiel Träume, Wünsche, Ideen, Gefühle, Freundschaft und Zahlen.', 'Der Mensch lebt in allen drei Welten.'] },
    natur: { title: 'Natur als Lebensgrundlage', lines: ['Die Natur gibt uns, was wir zum Leben brauchen: Luft zum Atmen, Wasser, Nahrung und Holz.', 'Der Mensch ist ein Teil der Natur. Er gestaltet sie auch: Er baut Häuser und legt Felder und Gärten an.', 'Naturgewalten können Menschen bedrohen: Hochwasser, Sturm und Dürre.', 'Hochwasser: Ein Fluss tritt nach viel Regen über die Ufer. Sturm: sehr starker Wind, der Bäume umwerfen kann. Dürre: Es regnet sehr lange nicht, die Pflanzen vertrocknen.', 'Die Bibel erzählt von Noah: Gott sagt ihm, er soll eine große Arche bauen. Noah bringt seine Familie und von allen Tieren je ein Paar hinein.', 'Es regnet 40 Tage und 40 Nächte. Eine große Flut bedeckt die Erde, aber die Arche schwimmt.', 'Eine Taube bringt einen frischen Ölzweig: Das Wasser geht zurück. Gott zeigt Noah den Regenbogen als Zeichen seines Versprechens.'] },
    bewahren: { title: 'Unsere Welt bewahren', lines: ['Müll trennen: Papier in die blaue Tonne, Verpackungen in die gelbe Tonne oder den gelben Sack, Essensreste in die Biotonne, Glas in den Glascontainer.', 'Aus getrenntem Müll können neue Dinge werden. Das nennt man Recycling.', 'Pfandflaschen bringt man in den Laden zurück und bekommt das Pfand, also Geld, wieder.', 'Wasser und Strom sparen: Licht ausschalten, beim Zähneputzen den Hahn zudrehen, lieber duschen als baden.', 'Zu Fuß gehen oder Rad fahren statt Auto fahren schont die Luft. Dinge reparieren, tauschen und teilen, statt sie wegzuwerfen.', 'Klimawandel: Die Erde wird wärmer, weil Menschen viel Kohle, Öl und Gas verbrennen. Dabei entsteht ein Gas, das die Wärme festhält.', 'Folgen: mehr Hitze und Dürre, stärkere Stürme und Hochwasser, das Eis an den Polen schmilzt.', 'Was Menschen tun können: Strom aus Sonne und Wind nutzen, weniger Energie verbrauchen, Bus, Bahn und Rad nehmen, Bäume pflanzen.'] },
    elemente: { title: 'Die vier Elemente', lines: ['Schon vor über 2000 Jahren sprachen Menschen von vier Elementen: Feuer, Wasser, Erde und Luft.', 'Ohne sie gibt es kein Leben: Feuer wärmt und kocht, Wasser löscht den Durst, auf der Erde wachsen Pflanzen, Luft brauchen wir zum Atmen.', 'Jedes Element hat zwei Seiten: Feuer wärmt und kann zerstören. Wasser spendet Leben und kann vernichten.', 'Die Erde trägt uns und lässt Pflanzen wachsen. Sie erinnert auch daran, dass alles vergänglich ist: Was wächst, vergeht wieder.', 'Luft ist leicht und unsichtbar. Als Sturm kann sie gewaltig sein.', 'Redewendungen: „Feuer und Flamme sein“ heißt begeistert sein. Etwas „fällt ins Wasser“ heißt, es findet nicht statt.', '„Mit beiden Beinen auf der Erde stehen“ heißt vernünftig sein. „Luft holen“ heißt eine Pause machen. „In der Luft hängen“ heißt nicht wissen, wie es weitergeht.'] },
  };

  const VERSOEHNEN = [
    { id: 'v1', text: 'Ich mache einen Fehler und tue jemandem weh.' },
    { id: 'v2', text: 'Ich merke, dass der andere traurig ist.' },
    { id: 'v3', text: 'Ich gebe den Fehler zu und entschuldige mich.' },
    { id: 'v4', text: 'Der andere verzeiht mir.' },
    { id: 'v5', text: 'Wir versöhnen uns und spielen wieder zusammen.' },
  ];
  const BESSER = [
    { id: 'b1', text: 'Ich überlege, was ich noch nicht gut kann.' },
    { id: 'b2', text: 'Ich nehme mir ein Ziel vor.' },
    { id: 'b3', text: 'Ich übe jeden Tag ein Stück.' },
    { id: 'b4', text: 'Ich schaue, was schon besser geworden ist.' },
    { id: 'b5', text: 'Ich nehme mir das nächste Ziel vor.' },
  ];
  const ARCHE = [
    { id: 'a1', text: 'Gott sagt Noah, er soll eine große Arche bauen.' },
    { id: 'a2', text: 'Noah bringt seine Familie und von allen Tieren je ein Paar in die Arche.' },
    { id: 'a3', text: 'Es regnet 40 Tage und 40 Nächte, das Wasser bedeckt die Erde.' },
    { id: 'a4', text: 'Noah lässt eine Taube fliegen. Sie bringt einen frischen Ölzweig zurück.' },
    { id: 'a5', text: 'Alle verlassen die Arche. Gott zeigt den Regenbogen.' },
  ];
  const PAPIER = [
    { id: 'p1', text: 'Ich werfe altes Papier in die blaue Tonne.' },
    { id: 'p2', text: 'Das Müllauto holt das Papier ab.' },
    { id: 'p3', text: 'In einer Fabrik wird das Papier mit Wasser zu Brei gemacht und gereinigt.' },
    { id: 'p4', text: 'Aus dem Brei wird neues Papier.' },
    { id: 'p5', text: 'Aus dem neuen Papier werden Hefte gemacht.' },
  ];

  // Drei Welten sortieren: die drei Knöpfe stehen immer in dieser Reihenfolge
  const WELTEN = ['Natürliche Welt', 'Vom Menschen geschaffene Welt', 'Gedankenwelt'];
  const DINGE = [
    ['baum', 'der Baum', 0], ['fluss', 'der Fluss', 0], ['wolke', 'die Wolke', 0], ['stein', 'der Stein', 0], ['igel', 'der Igel', 0], ['sonne', 'die Sonne', 0], ['regen', 'der Regen', 0], ['apfel', 'der Apfel', 0],
    ['bruecke', 'die Brücke', 1], ['handy', 'das Handy', 1], ['haus', 'das Haus', 1], ['lied', 'das Lied', 1, 'Menschen haben das Lied gedichtet. Man kann es hören und singen.'], ['fahrrad', 'das Fahrrad', 1], ['strasse', 'die Straße', 1], ['ball', 'der Ball', 1], ['brot', 'das Brot', 1, 'Das Korn wächst in der Natur, aber das Brot backen Menschen.'],
    ['traum', 'der Traum', 2], ['freundschaft', 'die Freundschaft', 2, 'Freundschaft kann man nicht anfassen. Es gibt sie in unseren Köpfen und Herzen.'], ['zahl', 'die Zahl', 2, 'Eine Zahl kann man sich denken. Aufschreiben kann man sie mit Ziffern.'], ['wunsch', 'der Wunsch', 2], ['idee', 'die Idee', 2], ['freude', 'die Freude', 2], ['hoffnung', 'die Hoffnung', 2],
  ];

  // mod: rf = Richtig/Falsch, mc = Wähle aus, lt = Lückentext, def = Begriffe, ord = Reihenfolge, welten = Drei Welten
  const POOL = [
    // Stärken und Schwächen, Erfolg und Misserfolg
    { id: 'iwrf1', mod: 'rf', g: 'staerken', q: 'Jeder Mensch hat Stärken und Schwächen.', a: true },
    { id: 'iwrf2', mod: 'rf', g: 'staerken', q: 'Ausdauer bedeutet, schnell aufzugeben.', a: false, why: 'Ausdauer heißt: lange durchhalten, auch wenn es anstrengend ist.' },
    { id: 'iwrf3', mod: 'rf', g: 'staerken', q: 'Wer zuverlässig ist, auf den kann man sich verlassen.', a: true },
    { id: 'iwrf4', mod: 'rf', g: 'staerken', q: 'Wer gewinnt, darf den Verlierer auslachen.', a: false, why: 'Ein guter Gewinner lacht niemanden aus. Er weiß, wie sich Verlieren anfühlt.' },
    { id: 'iwrf5', mod: 'rf', g: 'staerken', q: 'Durch Üben kann man in vielen Dingen besser werden.', a: true },
    { id: 'iwmc1', mod: 'mc', g: 'staerken', q: 'Lea übt jeden Tag Flöte, auch wenn es schwer ist. Welche Stärke zeigt sie?', o: ['Ausdauer', 'Vergesslichkeit', 'Nachlässigkeit'], a: 0 },
    { id: 'iwmc2', mod: 'mc', g: 'staerken', q: 'Tim vergisst oft seinen Turnbeutel. Welche Schwäche ist das?', o: ['Vergesslichkeit', 'Geduld', 'Zuverlässigkeit'], a: 0 },
    { id: 'iwmc3', mod: 'mc', g: 'staerken', q: 'Was kann ich tun, um in etwas besser zu werden?', o: ['Üben und um Hilfe bitten', 'Sofort aufgeben', 'Anderen die Schuld geben'], a: 0 },
    { id: 'iwmc4', mod: 'mc', g: 'staerken', q: 'Dein Team hat beim Staffellauf verloren. Was zeigt, dass du verlieren kannst?', o: ['Ich gratuliere dem anderen Team.', 'Ich werfe den Staffelstab weg.', 'Ich sage, die anderen haben geschummelt.'], a: 0 },
    { id: 'iwmc5', mod: 'mc', g: 'staerken', q: 'Deine Freundin hat beim Malwettbewerb gewonnen. Was heißt „sich mit anderen freuen“?', o: ['Ich gratuliere ihr und freue mich mit.', 'Ich sage, ihr Bild ist langweilig.', 'Ich rede nicht mehr mit ihr.'], a: 0 },
    { id: 'iwmc6', mod: 'mc', g: 'staerken', q: 'Welches Wort ist eine Stärke?', o: ['Geduld', 'Nachlässigkeit', 'Vergesslichkeit'], a: 0 },
    { id: 'iwlt1', mod: 'lt', g: 'staerken', q: 'Wer lange durchhält, auch wenn es anstrengend ist, hat ___.', o: ['Ausdauer', 'Angst', 'Glück'], a: 0 },
    { id: 'iwlt2', mod: 'lt', g: 'staerken', q: 'Wer gut verlieren kann, ___ dem Gewinner.', o: ['gratuliert', 'droht', 'schimpft mit'], a: 0 },
    { id: 'iwdef1', mod: 'def', g: 'staerken', q: 'Was bedeutet „Zuverlässigkeit“?', o: ['Andere können sich auf dich verlassen: Du hältst, was du versprichst.', 'Man ist sehr schnell beim Laufen.', 'Man vergisst oft etwas.'], a: 0 },
    { id: 'iwdef2', mod: 'def', g: 'staerken', q: 'Was bedeutet „Schüchternheit“?', o: ['Man traut sich nicht so leicht, auf andere zuzugehen oder vor anderen zu sprechen.', 'Man ist immer laut und lustig.', 'Man hat keine Lust zu lernen.'], a: 0 },
    { id: 'iwdef3', mod: 'def', g: 'staerken', q: 'Was bedeutet „Nachlässigkeit“?', o: ['Dinge nicht sorgfältig und ordentlich machen', 'Lange durchhalten', 'Anderen gern helfen'], a: 0 },
    { id: 'iwdef4', mod: 'def', g: 'staerken', q: 'Was bedeutet „Geduld“?', o: ['Ruhig warten können, ohne wütend zu werden', 'Alles sofort haben wollen', 'Laut schreien, wenn etwas nicht klappt'], a: 0 },
    { id: 'iwdef5', mod: 'def', g: 'staerken', q: 'Was bedeutet „Fröhlichkeit“?', o: ['Gute Laune haben und andere damit anstecken', 'Oft traurig und still sein', 'Schnell wütend werden'], a: 0 },
    { id: 'iwdef6', mod: 'def', g: 'staerken', q: 'Was bedeutet „Vergesslichkeit“?', o: ['Man vergisst oft Dinge, zum Beispiel die Hausaufgaben', 'Man merkt sich alles', 'Man ist immer pünktlich'], a: 0 },
    // Mut und Angst
    { id: 'iwrf6', mod: 'rf', g: 'mut', q: 'Auch Erwachsene haben manchmal Angst.', a: true },
    { id: 'iwrf7', mod: 'rf', g: 'mut', q: 'Mutig ist nur, wer gar keine Angst hat.', a: false, why: 'Mutig ist, wer trotz Angst etwas Wichtiges tut.' },
    { id: 'iwrf8', mod: 'rf', g: 'mut', q: 'Über Angst zu reden kann helfen.', a: true },
    { id: 'iwrf9', mod: 'rf', g: 'mut', q: 'Wer auf ein hohes Garagendach klettert, um anzugeben, ist mutig.', a: false, why: 'Wer sich ohne Grund in Gefahr bringt, ist leichtsinnig, nicht mutig.' },
    { id: 'iwmc7', mod: 'mc', g: 'mut', q: 'Paul hat Angst vor dem tiefen Becken. Was hilft ihm?', o: ['In kleinen Schritten üben, zuerst am Rand', 'Gleich vom Dreimeterbrett springen', 'Nie wieder ins Schwimmbad gehen'], a: 0 },
    { id: 'iwmc8', mod: 'mc', g: 'mut', q: 'Vor deinem Vortrag klopft dein Herz. Was kannst du tun?', o: ['Tief und langsam atmen', 'Schnell weglaufen', 'Die Luft anhalten'], a: 0 },
    { id: 'iwmc9', mod: 'mc', g: 'mut', q: 'Ein Kind hat nachts Angst im Dunkeln. Was hilft?', o: ['Mit den Eltern darüber reden', 'Die Angst für sich behalten', 'Sich über die Angst lustig machen'], a: 0 },
    { id: 'iwmc10', mod: 'mc', g: 'mut', q: 'Wozu ist Angst gut?', o: ['Sie warnt uns vor Gefahr.', 'Sie macht uns schneller im Rechnen.', 'Sie hat gar keinen Nutzen.'], a: 0 },
    { id: 'iwmc11', mod: 'mc', g: 'mut', q: 'Ein größeres Kind bedroht dich auf dem Schulweg. Was tust du?', o: ['Hilfe bei einem Erwachsenen holen', 'Allein dagegen kämpfen', 'Niemandem etwas erzählen'], a: 0 },
    { id: 'iwlt3', mod: 'lt', g: 'mut', q: 'Wer trotz Angst etwas Wichtiges tut, ist ___.', o: ['mutig', 'leichtsinnig', 'vergesslich'], a: 0 },
    { id: 'iwlt4', mod: 'lt', g: 'mut', q: 'Gegen Angst hilft es, tief und langsam zu ___.', o: ['atmen', 'rennen', 'schreien'], a: 0 },
    { id: 'iwlt5', mod: 'lt', g: 'mut', q: 'Etwas Schweres übt man am besten in kleinen ___.', o: ['Schritten', 'Ausreden', 'Streitereien'], a: 0 },
    { id: 'iwdef7', mod: 'def', g: 'mut', q: 'Was bedeutet „Mut“?', o: ['Etwas Wichtiges tun, obwohl man Angst hat', 'Nie Angst haben', 'Sich ohne Grund in Gefahr bringen'], a: 0 },
    { id: 'iwdef8', mod: 'def', g: 'mut', q: 'Was ist „Leichtsinn“?', o: ['Sich ohne Grund und ohne nachzudenken in Gefahr bringen', 'Etwas Schweres in kleinen Schritten üben', 'Einem Freund beistehen'], a: 0 },
    // Kind und Erwachsener
    { id: 'iwrf10', mod: 'rf', g: 'erwachsen', q: 'Kinder haben ein Recht auf Spielen.', a: true },
    { id: 'iwrf11', mod: 'rf', g: 'erwachsen', q: 'Nur Kinder haben Gefühle.', a: false, why: 'Kinder und Erwachsene haben Gefühle.' },
    { id: 'iwrf12', mod: 'rf', g: 'erwachsen', q: 'Auch Kinder haben Pflichten, zum Beispiel ihre Hausaufgaben.', a: true },
    { id: 'iwrf13', mod: 'rf', g: 'erwachsen', q: 'Erwachsene spielen nie.', a: false, why: 'Auch Erwachsene spielen gern, zum Beispiel Brettspiele oder Fußball.' },
    { id: 'iwmc12', mod: 'mc', g: 'erwachsen', q: 'Was haben Kinder und Erwachsene gemeinsam?', o: ['Alle brauchen Essen, Schlaf und Freunde.', 'Alle gehen zur Arbeit.', 'Alle gehen in die 3. Klasse.'], a: 0 },
    { id: 'iwmc13', mod: 'mc', g: 'erwachsen', q: 'Wer trägt die Verantwortung dafür, dass ein Kind sicher und versorgt ist?', o: ['Die Eltern oder andere Erwachsene, die für das Kind sorgen', 'Das Kind ganz allein', 'Niemand'], a: 0 },
    { id: 'iwmc14', mod: 'mc', g: 'erwachsen', q: 'Welche Pflicht hat ein Kind in der Schule?', o: ['Mitlernen und die Hausaufgaben machen', 'Das Schulhaus bauen', 'Geld für die Lehrerin verdienen'], a: 0 },
    { id: 'iwmc15', mod: 'mc', g: 'erwachsen', q: '„Nur Erwachsene können kochen.“ Was stimmt?', o: ['Das stimmt nicht: Auch Kinder können mit Hilfe kochen lernen.', 'Das stimmt immer.', 'Kinder dürfen nie in die Küche.'], a: 0 },
    { id: 'iwlt6', mod: 'lt', g: 'erwachsen', q: 'Kinder lernen viel beim ___.', o: ['Spielen', 'Schlafen', 'Streiten'], a: 0 },
    { id: 'iwlt7', mod: 'lt', g: 'erwachsen', q: 'Erwachsene tragen mehr ___: Sie sorgen für Kinder.', o: ['Verantwortung', 'Spielzeug', 'Ferien'], a: 0 },
    { id: 'iwdef9', mod: 'def', g: 'erwachsen', q: 'Was ist ein Recht?', o: ['Etwas, das man tun darf oder bekommen soll', 'Etwas, das man tun muss', 'Eine Strafe'], a: 0 },
    { id: 'iwdef10', mod: 'def', g: 'erwachsen', q: 'Was ist eine Pflicht?', o: ['Etwas, das man tun muss, weil es dazugehört', 'Etwas, das man nur zum Spaß tut', 'Ein Geschenk'], a: 0 },
    { id: 'iwdef11', mod: 'def', g: 'erwachsen', q: 'Was bedeutet „Verantwortung“?', o: ['Für etwas oder jemanden sorgen und dafür einstehen', 'Etwas Schweres in die Luft werfen', 'Auf jede Frage eine Antwort wissen'], a: 0 },
    // Gemeinsamkeiten und Unterschiede
    { id: 'iwrf14', mod: 'rf', g: 'verschieden', q: '„Jungen weinen nicht“ ist ein Vorurteil.', a: true },
    { id: 'iwrf15', mod: 'rf', g: 'verschieden', q: 'Mädchen können kein Fußball spielen.', a: false, why: 'Das ist ein Vorurteil. Alle Kinder dürfen Fußball spielen.' },
    { id: 'iwrf16', mod: 'rf', g: 'verschieden', q: 'Kinder, die verschiedene Sprachen sprechen, können Freunde werden.', a: true },
    { id: 'iwrf17', mod: 'rf', g: 'verschieden', q: 'Ein gemeinsames Hobby kann Menschen verbinden.', a: true },
    { id: 'iwmc16', mod: 'mc', g: 'verschieden', q: 'Welcher Satz ist ein Vorurteil?', o: ['„Wer eine Brille trägt, ist langweilig.“', '„Ole trägt eine Brille.“', '„Eine Brille hilft beim Sehen.“'], a: 0 },
    { id: 'iwmc17', mod: 'mc', g: 'verschieden', q: 'Ein neues Kind spricht zu Hause Polnisch. Wie kann das eure Klasse bereichern?', o: ['Ihr bringt euch gegenseitig Wörter aus eurer Sprache bei.', 'Ihr sprecht nicht miteinander.', 'Ihr lacht über seine Aussprache.'], a: 0 },
    { id: 'iwmc18', mod: 'mc', g: 'verschieden', q: 'Worin können sich Menschen unterscheiden?', o: ['In Sprache, Aussehen und Hobbys', 'Sie unterscheiden sich gar nicht', 'Nur in der Schuhgröße'], a: 0 },
    { id: 'iwmc19', mod: 'mc', g: 'verschieden', q: 'Ben möchte tanzen lernen. Ein Kind sagt: „Tanzen ist nur was für Mädchen.“ Was stimmt?', o: ['Das ist ein Vorurteil. Alle Kinder dürfen tanzen.', 'Das stimmt.', 'Ben muss stattdessen Fußball spielen.'], a: 0 },
    { id: 'iwlt8', mod: 'lt', g: 'verschieden', q: 'Gemeinsames ___, Verschiedenes kann bereichern.', o: ['verbindet', 'trennt', 'ärgert'], a: 0 },
    { id: 'iwlt9', mod: 'lt', g: 'verschieden', q: 'Alle Kinder dürfen alles ___.', o: ['ausprobieren', 'verbieten', 'vergessen'], a: 0 },
    { id: 'iwdef12', mod: 'def', g: 'verschieden', q: 'Was ist ein Vorurteil?', o: ['Eine Meinung über Menschen, die man sich bildet, ohne sie zu kennen', 'Ein Urteil vor Gericht', 'Ein Spiel vor dem Unterricht'], a: 0 },
    { id: 'iwdef13', mod: 'def', g: 'verschieden', q: 'Was bedeutet „Herkunft“?', o: ['Woher ein Mensch oder seine Familie kommt', 'Wohin jemand in den Urlaub fährt', 'Wie schnell jemand laufen kann'], a: 0 },
    { id: 'iwdef14', mod: 'def', g: 'verschieden', q: 'Was bedeutet „bereichern“?', o: ['Etwas wertvoller und vielfältiger machen', 'Etwas kaputt machen', 'Etwas wegnehmen'], a: 0 },
    // Gut und Böse im eigenen Handeln
    { id: 'iwrf18', mod: 'rf', g: 'gutboese', q: 'Jeder Mensch tut mal Gutes und mal etwas, das nicht gut ist.', a: true },
    { id: 'iwrf19', mod: 'rf', g: 'gutboese', q: 'Wer einmal etwas Böses getan hat, bleibt für immer ein schlechter Mensch.', a: false, why: 'Jeder Mensch kann aus Fehlern lernen und es besser machen.' },
    { id: 'iwrf20', mod: 'rf', g: 'gutboese', q: 'Nein sagen ist erlaubt, wenn etwas unrecht ist oder wehtut.', a: true },
    { id: 'iwrf21', mod: 'rf', g: 'gutboese', q: 'Verzeihen heißt: dem anderen nicht mehr böse sein.', a: true },
    { id: 'iwmc20', mod: 'mc', g: 'gutboese', q: 'Mia ist traurig, weil ihr Kaninchen krank ist. Du setzt dich zu ihr und machst ihr Mut. Was tust du?', o: ['Ich tröste sie.', 'Ich trotze ihr.', 'Ich gebe nach.'], a: 0 },
    { id: 'iwmc21', mod: 'mc', g: 'gutboese', q: 'Nach einem Streit geben sich Jonas und Ali die Hand und spielen wieder zusammen. Was haben sie getan?', o: ['Sie haben sich versöhnt.', 'Sie haben getrotzt.', 'Sie haben gepetzt.'], a: 0 },
    { id: 'iwmc22', mod: 'mc', g: 'gutboese', q: 'Ein Kind sagt: „Nimm dir heimlich Süßigkeiten aus dem Laden, merkt doch keiner.“ Was tust du?', o: ['Nein sagen', 'Mitmachen, damit es mich mag', 'Die Süßigkeiten für das Kind holen'], a: 0 },
    { id: 'iwmc23', mod: 'mc', g: 'gutboese', q: 'Leo stampft auf und will nicht nachgeben, obwohl er weiß, dass er unrecht hat. Was macht er?', o: ['Er trotzt.', 'Er verzeiht.', 'Er tröstet.'], a: 0 },
    { id: 'iwlt10', mod: 'lt', g: 'gutboese', q: 'Wer einem traurigen Kind Mut macht, ___ es.', o: ['tröstet', 'ärgert', 'verlässt'], a: 0 },
    { id: 'iwlt11', mod: 'lt', g: 'gutboese', q: 'Wenn sich jemand entschuldigt, kann ich ihm ___.', o: ['verzeihen', 'drohen', 'trotzen'], a: 0 },
    { id: 'iwdef15', mod: 'def', g: 'gutboese', q: 'Was bedeutet „nachgeben“?', o: ['Auf etwas verzichten, damit ein Streit endet', 'Immer auf seinem Willen bestehen', 'Jemandem hinterherlaufen'], a: 0 },
    { id: 'iwdef16', mod: 'def', g: 'gutboese', q: 'Was bedeutet „beistehen“?', o: ['Zu jemandem halten, der Hilfe braucht', 'Neben jemandem stehen und nichts tun', 'Jemanden auslachen'], a: 0 },
    { id: 'iwdef17', mod: 'def', g: 'gutboese', q: 'Was bedeutet „sich versöhnen“?', o: ['Nach einem Streit wieder Frieden schließen', 'Einen Streit anfangen', 'Sich verstecken'], a: 0 },
    { id: 'iwdef18', mod: 'def', g: 'gutboese', q: 'Was bedeutet „trotzen“?', o: ['Stur bleiben und sich wehren, oft aus Wut', 'Jemanden trösten', 'Anderen eine Freude machen'], a: 0 },

    // Welt 2: Zeichen und Symbol (kurz, die Symbole selbst kommen im Kirchenjahr dran)
    { id: 'iw2rf1', w: 2, mod: 'rf', g: 'zeichen', q: 'Ein Verkehrsschild ist ein Zeichen: Es sagt, was man tun soll.', a: true },
    { id: 'iw2mc1', w: 2, mod: 'mc', g: 'zeichen', q: 'Wofür ist ein Herz ein Symbol?', o: ['Für Liebe', 'Für Hunger', 'Für Regen'], a: 0 },
    { id: 'iw2mc2', w: 2, mod: 'mc', g: 'zeichen', q: 'Wofür ist eine weiße Taube mit einem Ölzweig ein Symbol?', o: ['Für Frieden', 'Für Streit', 'Für Schnee'], a: 0 },
    { id: 'iw2def1', w: 2, mod: 'def', g: 'zeichen', q: 'Was ist ein Symbol?', o: ['Ein Bild, das für etwas Unsichtbares steht, zum Beispiel für Liebe', 'Ein Schild, das sagt, wie schnell man fahren darf', 'Ein Wort, das man rückwärts liest'], a: 0 },
    // Drei Welten
    { id: 'iw2rf2', w: 2, mod: 'rf', g: 'dreiwelten', q: 'Ein Traum gehört zur Gedankenwelt.', a: true },
    { id: 'iw2rf3', w: 2, mod: 'rf', g: 'dreiwelten', q: 'Eine Brücke gehört zur natürlichen Welt.', a: false, why: 'Menschen haben die Brücke gebaut. Sie gehört zur vom Menschen geschaffenen Welt.' },
    { id: 'iw2mc3', w: 2, mod: 'mc', g: 'dreiwelten', q: 'In welchen Welten lebt der Mensch?', o: ['In allen drei Welten', 'Nur in der natürlichen Welt', 'Nur in der Gedankenwelt'], a: 0 },
    { id: 'iw2def2', w: 2, mod: 'def', g: 'dreiwelten', q: 'Was ist die natürliche Welt?', o: ['Alles, was es auch ohne Menschen gibt, wie Bäume, Flüsse und Tiere', 'Alles, was Menschen gebaut haben', 'Alles, was wir uns nur denken'], a: 0 },
    { id: 'iw2def3', w: 2, mod: 'def', g: 'dreiwelten', q: 'Was ist die Gedankenwelt?', o: ['Alles, was es nur in unseren Köpfen und Herzen gibt, wie Träume und Ideen', 'Alles, was im Wald wächst', 'Alles, was in einer Fabrik gebaut wird'], a: 0 },
    ...DINGE.map(([id, x, a, why]) => ({ id: 'iw2w_' + id, w: 2, mod: 'welten', g: 'dreiwelten', q: `Zu welcher Welt gehört „${x}“?`, o: WELTEN, a, why })),
    // Natur als Lebensgrundlage, Naturgewalten, Arche Noah
    { id: 'iw2rf4', w: 2, mod: 'rf', g: 'natur', q: 'Die Natur gibt uns Luft, Wasser und Nahrung.', a: true },
    { id: 'iw2rf5', w: 2, mod: 'rf', g: 'natur', q: 'Der Mensch gehört nicht zur Natur.', a: false, why: 'Der Mensch ist ein Teil der Natur. Er braucht sie zum Leben.' },
    { id: 'iw2rf6', w: 2, mod: 'rf', g: 'natur', q: 'Bei einer Dürre regnet es sehr lange nicht.', a: true },
    { id: 'iw2rf7', w: 2, mod: 'rf', g: 'natur', q: 'Die Bibel erzählt, dass es bei Noah 40 Tage und 40 Nächte regnete.', a: true },
    { id: 'iw2rf8', w: 2, mod: 'rf', g: 'natur', q: 'Noah nahm nur Hunde und Katzen mit in die Arche.', a: false, why: 'Die Bibel erzählt: Von allen Tieren kam je ein Paar in die Arche.' },
    { id: 'iw2mc4', w: 2, mod: 'mc', g: 'natur', q: 'Ein Fluss tritt nach viel Regen über die Ufer. Wie heißt das?', o: ['Hochwasser', 'Dürre', 'Sturm'], a: 0 },
    { id: 'iw2mc5', w: 2, mod: 'mc', g: 'natur', q: 'Welche Naturgewalt wirft Bäume um und deckt Dächer ab?', o: ['Sturm', 'Dürre', 'Nebel'], a: 0 },
    { id: 'iw2mc6', w: 2, mod: 'mc', g: 'natur', q: 'Was baute Noah, wie die Bibel erzählt?', o: ['Eine große Arche', 'Eine hohe Mauer', 'Eine Brücke über das Meer'], a: 0 },
    { id: 'iw2mc7', w: 2, mod: 'mc', g: 'natur', q: 'Was brachte die Taube Noah zurück?', o: ['Einen frischen Ölzweig', 'Einen Fisch', 'Einen Stein'], a: 0 },
    { id: 'iw2mc8', w: 2, mod: 'mc', g: 'natur', q: 'Wie gestaltet der Mensch die Natur?', o: ['Er legt Felder und Gärten an.', 'Er macht die Sonne heller.', 'Er bestimmt, wann es regnet.'], a: 0 },
    { id: 'iw2lt1', w: 2, mod: 'lt', g: 'natur', q: 'Bei einer ___ vertrocknen die Pflanzen, weil es lange nicht regnet.', o: ['Dürre', 'Flut', 'Ernte'], a: 0 },
    { id: 'iw2lt2', w: 2, mod: 'lt', g: 'natur', q: 'Die Bibel erzählt: Noah brachte von allen Tieren je ein ___ in die Arche.', o: ['Paar', 'Ei', 'Bild'], a: 0 },
    { id: 'iw2lt3', w: 2, mod: 'lt', g: 'natur', q: 'Der Mensch ist ein ___ der Natur.', o: ['Teil', 'Gegner', 'Besitzer'], a: 0 },
    { id: 'iw2def4', w: 2, mod: 'def', g: 'natur', q: 'Was ist eine Naturgewalt?', o: ['Eine große Kraft der Natur, die Menschen bedrohen kann, wie Sturm oder Hochwasser', 'Ein Gesetz für den Wald', 'Ein Tier im Zoo'], a: 0 },
    { id: 'iw2def5', w: 2, mod: 'def', g: 'natur', q: 'Was ist eine Arche?', o: ['Ein großes Schiff aus Holz, wie es die Bibel von Noah erzählt', 'Ein Haus auf einem Berg', 'Ein Garten mit Tieren'], a: 0 },
    { id: 'iw2def6', w: 2, mod: 'def', g: 'natur', q: 'Was bedeutet „Lebensgrundlage“?', o: ['Das, was man zum Leben unbedingt braucht', 'Der Boden in einem Keller', 'Ein Spiel auf dem Schulhof'], a: 0 },
    // Unsere Welt bewahren, Klimawandel
    { id: 'iw2rf9', w: 2, mod: 'rf', g: 'bewahren', q: 'Altes Papier gehört in die blaue Tonne.', a: true },
    { id: 'iw2rf10', w: 2, mod: 'rf', g: 'bewahren', q: 'Die Erde wird wärmer, weil Menschen viel Kohle, Öl und Gas verbrennen.', a: true },
    { id: 'iw2rf11', w: 2, mod: 'rf', g: 'bewahren', q: 'Wer das Licht in leeren Zimmern brennen lässt, spart Strom.', a: false, why: 'Wer das Licht ausschaltet, spart Strom.' },
    { id: 'iw2rf12', w: 2, mod: 'rf', g: 'bewahren', q: 'Kaputte Dinge kann man oft reparieren, statt sie wegzuwerfen.', a: true },
    { id: 'iw2rf13', w: 2, mod: 'rf', g: 'bewahren', q: 'Wegen des Klimawandels schmilzt das Eis an den Polen.', a: true },
    { id: 'iw2mc9', w: 2, mod: 'mc', g: 'bewahren', q: 'Wohin gehört ein leerer Joghurtbecher?', o: ['In die gelbe Tonne oder den gelben Sack', 'In die Biotonne', 'In den Glascontainer'], a: 0 },
    { id: 'iw2mc10', w: 2, mod: 'mc', g: 'bewahren', q: 'Wohin gehören Apfelreste und Kartoffelschalen?', o: ['In die Biotonne', 'In die blaue Tonne', 'In die gelbe Tonne'], a: 0 },
    { id: 'iw2mc11', w: 2, mod: 'mc', g: 'bewahren', q: 'Wie sparst du beim Zähneputzen Wasser?', o: ['Ich drehe den Hahn zu, solange ich putze.', 'Ich lasse das Wasser die ganze Zeit laufen.', 'Ich putze zweimal hintereinander.'], a: 0 },
    { id: 'iw2mc12', w: 2, mod: 'mc', g: 'bewahren', q: 'Was können Menschen gegen den Klimawandel tun?', o: ['Strom aus Sonne und Wind nutzen', 'Mehr Kohle verbrennen', 'Viele Bäume fällen'], a: 0 },
    { id: 'iw2mc13', w: 2, mod: 'mc', g: 'bewahren', q: 'Was macht man mit einer leeren Pfandflasche?', o: ['Man bringt sie in den Laden zurück und bekommt Geld wieder.', 'Man lässt sie im Park liegen.', 'Man wirft sie in die Biotonne.'], a: 0 },
    { id: 'iw2mc14', w: 2, mod: 'mc', g: 'bewahren', q: 'Welcher Schulweg schont die Luft am meisten?', o: ['Zu Fuß oder mit dem Rad', 'Allein mit dem Auto', 'Mit dem Motorrad'], a: 0 },
    { id: 'iw2mc15', w: 2, mod: 'mc', g: 'bewahren', q: 'Was ist eine Folge des Klimawandels?', o: ['Mehr Hitze und lange Dürren', 'Mehr Schnee im Sommer', 'Die Sonne geht nicht mehr unter'], a: 0 },
    { id: 'iw2lt4', w: 2, mod: 'lt', g: 'bewahren', q: 'Aus getrenntem Müll werden neue Dinge. Das nennt man ___.', o: ['Recycling', 'Reparatur', 'Raumfahrt'], a: 0 },
    { id: 'iw2lt5', w: 2, mod: 'lt', g: 'bewahren', q: 'Die Erde wird ___, weil Menschen viel Kohle, Öl und Gas verbrennen.', o: ['wärmer', 'kälter', 'kleiner'], a: 0 },
    { id: 'iw2lt6', w: 2, mod: 'lt', g: 'bewahren', q: 'Ein kaputtes Spielzeug kann man oft ___, statt es wegzuwerfen.', o: ['reparieren', 'verstecken', 'vergessen'], a: 0 },
    { id: 'iw2def7', w: 2, mod: 'def', g: 'bewahren', q: 'Was bedeutet „Recycling“?', o: ['Aus Altem, zum Beispiel aus Altpapier, wird etwas Neues gemacht', 'Mit dem Fahrrad fahren', 'Müll im Wald vergraben'], a: 0 },
    { id: 'iw2def8', w: 2, mod: 'def', g: 'bewahren', q: 'Was ist der Klimawandel?', o: ['Die Erde wird über viele Jahre immer wärmer', 'Das Wetter von heute auf morgen', 'Ein Fest im Frühling'], a: 0 },
    { id: 'iw2def9', w: 2, mod: 'def', g: 'bewahren', q: 'Was ist Pfand?', o: ['Geld, das man für eine Flasche bezahlt und beim Zurückbringen wiederbekommt', 'Ein Spiel mit Flaschen', 'Eine Strafe für Müll'], a: 0 },
    // Die vier Elemente, Redewendungen
    { id: 'iw2rf14', w: 2, mod: 'rf', g: 'elemente', q: 'Die vier Elemente heißen Feuer, Wasser, Erde und Luft.', a: true },
    { id: 'iw2rf15', w: 2, mod: 'rf', g: 'elemente', q: 'Luft kann man gut sehen.', a: false, why: 'Luft ist unsichtbar. Man spürt sie zum Beispiel als Wind.' },
    { id: 'iw2rf16', w: 2, mod: 'rf', g: 'elemente', q: 'Feuer kann wärmen und zerstören.', a: true },
    { id: 'iw2rf17', w: 2, mod: 'rf', g: 'elemente', q: '„Feuer und Flamme sein“ heißt, dass etwas brennt.', a: false, why: 'Die Redewendung heißt: von etwas begeistert sein.' },
    { id: 'iw2mc16', w: 2, mod: 'mc', g: 'elemente', q: 'Was bedeutet „Feuer und Flamme sein“?', o: ['Begeistert sein', 'Sehr müde sein', 'Krank sein'], a: 0 },
    { id: 'iw2mc17', w: 2, mod: 'mc', g: 'elemente', q: 'Das Sportfest „fällt ins Wasser“. Was heißt das?', o: ['Es findet nicht statt.', 'Es findet im Schwimmbad statt.', 'Alle werden nass.'], a: 0 },
    { id: 'iw2mc18', w: 2, mod: 'mc', g: 'elemente', q: 'Was bedeutet „mit beiden Beinen auf der Erde stehen“?', o: ['Vernünftig sein und wissen, was möglich ist', 'Nicht hüpfen dürfen', 'Im Garten arbeiten'], a: 0 },
    { id: 'iw2mc19', w: 2, mod: 'mc', g: 'elemente', q: 'Was bedeutet „in der Luft hängen“?', o: ['Nicht wissen, wie es weitergeht', 'Auf einen Baum klettern', 'Fliegen können'], a: 0 },
    { id: 'iw2mc20', w: 2, mod: 'mc', g: 'elemente', q: 'Nach dem Streit muss Tom erst einmal „Luft holen“. Was heißt das?', o: ['Eine Pause machen und durchatmen', 'Einen Luftballon kaufen', 'Das Fenster putzen'], a: 0 },
    { id: 'iw2mc21', w: 2, mod: 'mc', g: 'elemente', q: 'Welches Element brauchen wir zum Atmen?', o: ['Luft', 'Feuer', 'Erde'], a: 0 },
    { id: 'iw2mc22', w: 2, mod: 'mc', g: 'elemente', q: 'Welcher Satz zeigt die gefährliche Seite des Wassers?', o: ['Hochwasser kann Häuser zerstören.', 'Wasser löscht den Durst.', 'Pflanzen brauchen Wasser.'], a: 0 },
    { id: 'iw2lt7', w: 2, mod: 'lt', g: 'elemente', q: 'Auf der ___ wachsen die Pflanzen, die wir essen.', o: ['Erde', 'Luft', 'Flamme'], a: 0 },
    { id: 'iw2lt8', w: 2, mod: 'lt', g: 'elemente', q: 'Wasser spendet Leben und kann ___.', o: ['vernichten', 'singen', 'rechnen'], a: 0 },
    { id: 'iw2lt9', w: 2, mod: 'lt', g: 'elemente', q: 'Luft ist leicht und ___.', o: ['unsichtbar', 'schwer', 'bunt'], a: 0 },
    { id: 'iw2def10', w: 2, mod: 'def', g: 'elemente', q: 'Was ist eine Redewendung?', o: ['Ein fester Ausdruck, der etwas anderes meint, als die Wörter sagen', 'Ein Wort, das man rückwärts liest', 'Eine Rede vor der Klasse'], a: 0 },
    { id: 'iw2def11', w: 2, mod: 'def', g: 'elemente', q: 'Was bedeutet „vergänglich“?', o: ['Es bleibt nicht für immer, es vergeht wieder', 'Es hält ewig', 'Es ist sehr schnell'], a: 0 },
  ];

  const MODULES = Object.assign({}, K.MODES.ethik.modules, { welten: { name: 'Drei Welten', icon: '🌍', maxTier: 1, worldCap: [0, 1], dmg: 12 } });
  const TUT = {
    'rf:1': { title: 'Richtig oder falsch', steps: ['Lies den Satz genau.', 'Stimmt er mit dem, was du über dich, die anderen und die Welt gelernt hast? Dann „Richtig“.', 'Ist etwas vertauscht oder ist es ein Vorurteil? Dann „Falsch“.'] },
    'mc:1': { title: 'Wähle aus', steps: ['Lies die Frage. Nur eine Antwort stimmt.', 'Bei Redewendungen fragst du: Was ist gemeint? „Ins Wasser fallen“ heißt nicht, dass jemand nass wird.', 'Tippe auf die richtige Antwort.'] },
    'lt:1': { title: 'Lückentext', steps: ['Im Satz fehlt ein Wort (___).', 'Lies den Satz mit jedem Wort einmal durch.', 'Tippe auf das Wort, das passt.'] },
    'def:1': { title: 'Begriffe', steps: ['Hier geht es um wichtige Wörter wie Ausdauer, Zuverlässigkeit, Vorurteil, verzeihen, Recycling, Klimawandel und Redewendung.', 'Überlege, was das Wort bedeutet.', 'Tippe auf die richtige Erklärung.'] },
    'ord:1': { title: 'Reihenfolge', steps: ['Vier Schritte sind durcheinander: wie man sich versöhnt, wie man besser wird, die Erzählung von Noah oder der Weg des Altpapiers.', 'Tippe sie in der richtigen Reihenfolge an: Was kommt zuerst?', 'Mit „Rückgängig“ nimmst du dein letztes Tippen zurück.'] },
    'welten:1': { title: 'Drei Welten', steps: ['Natürliche Welt: Das gibt es auch ohne Menschen, zum Beispiel den Baum.', 'Vom Menschen geschaffene Welt: Das haben Menschen gebaut oder gemacht, und man kann es sehen, hören oder anfassen, zum Beispiel die Brücke.', 'Gedankenwelt: Das gibt es nur in unseren Köpfen und Herzen, zum Beispiel den Traum.', 'Beispiel „die Schaukel“: Gibt es Schaukeln ohne Menschen? Nein. Kann man sie anfassen? Ja. Also tippst du auf „Vom Menschen geschaffene Welt“.'] },
  };
  const STARTERS = [
    { id: 'pfadfinderin', type: 'pflanze', shape: 'pfadfinderin', names: ['Die Pfadfinderin', 'Die Gruppenleiterin', 'Die Gruppenleiterin'], hp: 70, desc: 'Sie kennt Knoten und Wanderwege und weiß, wie man ein Lagerfeuer sicher löscht.', perk: 'none',
      attacks: [{ name: 'Offenes Wort', mod: 'rf' }, { name: 'Kompassnadel', mod: 'mc' }, { name: 'Fahrtenbuch', mod: 'lt' }, { name: 'Halstuchknoten', mod: 'def' }] },
  ];
  const WORLD_ATTACKS = { 2: [{ name: 'Regentonne', mod: 'rf' }, { name: 'Wanderkarte', mod: 'mc' }, { name: 'Sammelkorb', mod: 'welten' }, { name: 'Feuerstelle', mod: 'def' }] };
  const EXTRA = { rf: 'Lagerfeuer', mc: 'Wegweiser', lt: 'Tagebuch', def: 'Taschenlampe', ord: 'Knotenseil', welten: 'Fundstücke' };
  const ENEMIES = {
    1: {
      normal: [
        { name: 'Das Lampenfieber', type: 'feuer', shape: 'lampenfieber', hp: 26, atk: 3 },
        { name: 'Der Trotzkopf', type: 'normal', shape: 'trotzkopf', hp: 28, atk: 4 },
        { name: 'Die Ausrede', type: 'wasser', shape: 'ausrede', hp: 24, atk: 4 },
        { name: 'Das Schubladendenken', type: 'pflanze', shape: 'schubladendenken', hp: 30, atk: 3 },
      ],
      elite: { name: 'Die Schadenfreude', type: 'normal', shape: 'schadenfreude', hp: 45, atk: 5 },
      boss: { name: 'Die große Angst', acc: 'die große Angst', type: 'wasser', shape: 'grosseangst', hp: 70, atk: 6, boss: true },
    },
    2: {
      normal: [
        { name: 'Der Müllberg', type: 'normal', shape: 'muellberg', hp: 42, atk: 5 },
        { name: 'Die Dürre', type: 'feuer', shape: 'duerre', hp: 40, atk: 6 },
        { name: 'Das Hochwasser', type: 'wasser', shape: 'hochwasser', hp: 44, atk: 5 },
        { name: 'Der Stromfresser', type: 'normal', shape: 'stromfresser', hp: 38, atk: 6 },
      ],
      elite: { name: 'Der Orkan', type: 'normal', shape: 'orkan', hp: 70, atk: 8 },
      boss: { name: 'Der Kohlequalm', acc: 'den Kohlequalm', type: 'feuer', shape: 'kohlequalm', hp: 110, atk: 9, boss: true },
    },
  };
  const MOVES = ['Kniezittern', 'Trotzanfall', 'Schulterzucken', 'Abstempeln', 'Müllwelle', 'Sturmbö', 'Qualmwolke', 'Hitzewelle'];
  const HELP = 'Hol dir Hilfe bei einem Erwachsenen.';
  // Dilemma-Karten: kein Richtig oder Falsch, jede Wahl bekommt dieselbe Belohnung (reward)
  const EVENTS = [
    { w: 1, title: 'Das Gedicht', dilemma: true, reward: { hp: 5 }, text: 'Morgen sollst du vor der Klasse ein Gedicht aufsagen. Schon heute kribbelt dein Bauch.', opts: [
      { label: 'Ich übe zu Hause vor meiner Familie.', then: 'Beim dritten Mal klappt es ohne Stocken. Am nächsten Tag zittert deine Stimme nur am Anfang.', think: 'Warum hilft Üben in kleinen Schritten gegen Angst?' },
      { label: 'Ich sage der Lehrerin, dass ich Angst habe.', then: 'Die Lehrerin nickt. Du darfst als Erste dran und von deinem Platz aus sprechen.', think: 'Warum braucht es Mut, über Angst zu reden?' },
      { label: 'Ich sage, ich bin krank.', then: 'Du bleibst zu Hause. Das Gedicht sagst du eine Woche später auf, und die Angst ist noch da.', think: 'Wird eine Angst kleiner, wenn man ihr ausweicht?' } ] },
    { w: 1, title: 'Das Brettspiel', dilemma: true, reward: { hp: 5 }, text: 'Beim Brettspiel verlierst du zum dritten Mal hintereinander. Deine Schwester jubelt laut.', opts: [
      { label: 'Ich werfe die Figuren um.', then: 'Die Figuren rollen unter das Sofa. Deine Schwester will nicht mehr mit dir spielen.', think: 'Wie kann man mit Ärger umgehen, ohne anderen den Spaß zu verderben?' },
      { label: '„Glückwunsch! Noch eine Runde?“', then: 'Deine Schwester grinst. In der vierten Runde gewinnst du.', think: 'Was bedeutet es, verlieren zu können?' },
      { label: 'Ich sage, dass ich traurig bin, und mache eine Pause.', then: 'Nach einem Glas Wasser geht es dir besser. Später spielt ihr etwas anderes.', think: 'Darf man traurig sein, wenn man verliert?' } ] },
    { w: 1, title: 'Die neue Sprache', dilemma: true, reward: { hp: 5 }, text: 'Amir ist neu in der Klasse und lernt gerade Deutsch. Beim Vorlesen verwechselt er Wörter, und ein paar Kinder lachen über ihn.', opts: [
      { label: 'Ich lache nicht mit und setze mich neben Amir.', then: 'Amir lächelt. In der Pause zeigt er dir, wie man in seiner Sprache bis zehn zählt.', think: 'Was können Kinder voneinander lernen, die verschiedene Sprachen sprechen?' },
      { label: HELP, then: 'Die Lehrerin spricht mit der Klasse darüber, wie schwer eine neue Sprache ist. Das Lachen hört auf.', think: 'Wie würdest du dich in einem Land fühlen, dessen Sprache du nicht kennst?' },
      { label: 'Ich lache mit, damit ich dazugehöre.', then: 'Amir schaut auf sein Buch und liest leiser. In der Pause steht er allein.', think: 'Was sagt die Goldene Regel dazu?' } ] },
    { w: 1, title: 'Die Rechenstunde', dilemma: true, reward: { hp: 5 }, text: 'Die Klasse rechnet schriftlich. Du hast nicht verstanden, wie es geht. Alle anderen scheinen es zu können.', opts: [
      { label: 'Ich melde mich und frage nach.', then: 'Die Lehrerin erklärt es noch einmal. Zwei andere Kinder sagen danach: „Gut, dass du gefragt hast.“', think: 'Warum ist es mutig, eine Schwäche zuzugeben?' },
      { label: 'Ich schreibe bei meinem Nachbarn ab.', then: 'Die Aufgaben stimmen. In der Probe am Freitag weißt du aber nicht weiter.', think: 'Was hilft dir mehr: Abschreiben oder Fragen?' },
      { label: 'Ich frage in der Pause meine Freundin.', then: 'Sie erklärt es dir mit ihren Worten. Danach klappt es.', think: 'Wen kannst du um Hilfe bitten, wenn dir etwas schwerfällt?' } ] },
    { w: 1, title: 'Omas Vase', dilemma: true, reward: { hp: 5 }, text: 'Beim Ballspielen im Wohnzimmer fällt Omas Vase herunter und zerbricht. Niemand hat es gesehen.', opts: [
      { label: 'Ich sage es Oma sofort.', then: 'Oma ist traurig über die Vase. Dann sagt sie: „Danke, dass du ehrlich bist.“ Ihr klebt sie zusammen.', think: 'Warum fällt es so schwer, einen Fehler zuzugeben?' },
      { label: 'Ich sage, die Katze war es.', then: 'Oma schimpft mit der Katze. Du fühlst dich den ganzen Abend schlecht.', think: 'Wie geht es dir, wenn ein anderer für deinen Fehler ausgeschimpft wird?' },
      { label: 'Ich schiebe die Scherben unter das Sofa.', then: 'Am Abend fragt Oma nach der Vase. Jetzt ist es noch schwerer, es zu sagen.', think: 'Wird ein Fehler kleiner, wenn man ihn versteckt?' } ] },
    { w: 1, title: 'Die Fernbedienung', dilemma: true, reward: { hp: 5 }, text: 'Du willst deine Lieblingssendung sehen, dein Bruder ein Fußballspiel. Ihr streitet um die Fernbedienung.', opts: [
      { label: 'Ich halte sie fest und gebe nicht nach.', then: 'Ihr zerrt, bis Papa den Fernseher ausmacht. Jetzt sieht keiner etwas.', think: 'Wann hilft Trotzen, und wann schadet es?' },
      { label: 'Ich gebe nach, er darf zuerst.', then: 'Dein Bruder ist überrascht. Am nächsten Tag darfst du bestimmen.', think: 'Ist Nachgeben eine Schwäche oder eine Stärke?' },
      { label: 'Ich schlage vor, dass wir abwechseln.', then: 'Ihr einigt euch: heute Fußball, morgen deine Sendung.', think: 'Wie findet man eine Lösung, mit der beide zufrieden sind?' } ] },
    { w: 1, title: 'Die Mutprobe', dilemma: true, reward: { hp: 5 }, text: 'Ein älteres Kind sagt: „Wenn du zu unserer Bande gehören willst, lässt du die Luft aus dem Fahrrad der Lehrerin.“', opts: [
      { label: 'Ich sage: „Nein, das mache ich nicht.“', then: 'Das ältere Kind zuckt mit den Schultern. Du gehst zu deinen Freunden zurück.', think: 'Warum ist Nein sagen manchmal mutiger als Mitmachen?' },
      { label: 'Ich mache es.', then: 'Die Lehrerin muss ihr Fahrrad nach Hause schieben. Zur Bande gehörst du trotzdem nicht.', think: 'Was ist eine Freundschaft wert, für die man Unrecht tun muss?' },
      { label: 'Ich gehe weg und erzähle es zu Hause.', then: 'Deine Mutter hört zu. Ihr überlegt zusammen, was du beim nächsten Mal sagen kannst.', think: 'Wem kannst du erzählen, wenn dich jemand zu etwas überreden will?' } ] },
    { w: 1, title: 'Die Treppe', dilemma: true, reward: { hp: 5 }, text: 'In der Pause hat Jonas dich geschubst. Jetzt sitzt er allein auf der Treppe und weint, weil sein Hund gestorben ist.', opts: [
      { label: 'Ich setze mich zu ihm und frage, was los ist.', then: 'Jonas erzählt von seinem Hund. Am Ende sagt er: „Tut mir leid wegen vorhin.“', think: 'Kann jemand nur gut oder nur böse sein?' },
      { label: 'Ich gehe vorbei. Er hat mich ja geschubst.', then: 'Jonas bleibt allein sitzen. Du denkst den ganzen Nachmittag an ihn.', think: 'Darf man jemanden trösten, über den man sich geärgert hat?' },
      { label: 'Ich hole seine Freunde.', then: 'Seine Freunde setzen sich zu ihm. Jonas nickt dir zu.', think: 'Wie kann man beistehen, wenn man selbst nicht weiß, was man sagen soll?' } ] },
    { w: 1, title: 'Das Sportfest', dilemma: true, reward: { hp: 5 }, text: 'Beim Sportfest werden Mannschaften gewählt. Ein Junge sagt: „Mädchen können kein Fußball spielen. Wir nehmen nur Jungen.“', opts: [
      { label: 'Ich sage: „Das ist ein Vorurteil. Alle dürfen mitspielen.“', then: 'Die Mannschaften werden gemischt. Lena schießt das erste Tor.', think: 'Woher kommen Vorurteile, und wie kann man sie ändern?' },
      { label: 'Ich sage nichts.', then: 'Die Mädchen spielen an einem anderen Tor. Einige schauen zum großen Spiel hinüber.', think: 'Was hätte den Mädchen geholfen?' },
      { label: 'Ich schlage vor, die Mannschaften auszulosen.', then: 'Jedes Kind zieht ein Los. Am Ende spielen alle gemischt.', think: 'Ist Losen eine gerechte Lösung?' } ] },
    { w: 1, title: 'Das Schwimmbad', text: 'Der Bademeister erklärt, was gegen Angst vor dem tiefen Wasser hilft. Beantworte seine Frage, dann gibt er dir einen Schild.', opts: [{ label: 'Antworten', task: 'any', g: 'mut', win: { item: 'schild' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { w: 1, title: 'Das Plakat', text: 'Die Klasse malt ein Plakat: „Was wir gemeinsam haben“. Die Lehrerin fragt dich etwas dazu und schenkt dir einen Trank.', opts: [{ label: 'Antworten', task: 'any', g: 'verschieden', win: { item: 'trank' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
    { w: 2, title: 'Die Pfandflasche', dilemma: true, reward: { hp: 5 }, text: 'Auf dem Spielplatz liegt eine leere Pfandflasche im Gras. Deine Freunde wollen weiterspielen.', opts: [
      { label: 'Ich bringe sie in den Laden.', then: 'Du bekommst das Pfand zurück, und aus der Flasche wird eine neue gemacht.', think: 'Warum lohnt es sich, Pfandflaschen zurückzubringen?' },
      { label: 'Ich lasse sie liegen.', then: 'Am nächsten Tag liegt sie immer noch da. Ein Hund schnüffelt daran.', think: 'Wer kümmert sich um einen Spielplatz, der allen gehört?' },
      { label: 'Wir suchen zusammen nach weiteren Flaschen.', then: 'Ihr findet noch zwei. Vom Pfand kauft ihr euch eine Kugel Eis zum Teilen.', think: 'Macht Aufräumen zusammen mehr Spaß?' } ] },
    { w: 2, title: 'Der Schulhof', dilemma: true, reward: { hp: 5 }, text: 'Nach der Pause liegen Bonbonpapiere auf dem Schulhof. Sie sind nicht von dir.', opts: [
      { label: 'Ich hebe sie auf und werfe sie in den Mülleimer.', then: 'Ein anderes Kind sieht es und hebt auch ein Papier auf.', think: 'Muss man nur seinen eigenen Müll aufheben?' },
      { label: 'Ich lasse sie liegen, es ist nicht mein Müll.', then: 'Der Wind weht die Papiere in die Büsche. Dort liegen sie noch lange.', think: 'Wer sorgt für einen sauberen Schulhof?' },
      { label: 'Ich schlage im Klassenrat einen Hofdienst vor.', then: 'Jede Woche räumt eine andere Klasse den Hof auf. Er bleibt sauberer.', think: 'Was kann eine ganze Klasse für die Umwelt tun?' } ] },
    { w: 2, title: 'Das Licht im Zimmer', dilemma: true, reward: { hp: 5 }, text: 'Du gehst zum Spielen nach draußen. In deinem Zimmer brennt noch das Licht, und das Radio läuft.', opts: [
      { label: 'Ich gehe zurück und schalte alles aus.', then: 'Das dauert nur einen Moment. Draußen warten deine Freunde auf dich.', think: 'Warum ist Strom sparen gut für die Erde?' },
      { label: 'Ich lasse alles an, ich komme ja wieder.', then: 'Du kommst erst am Abend zurück. Licht und Radio waren den ganzen Nachmittag an.', think: 'Wie viel Strom könnte man sparen, wenn alle das Licht ausschalten?' },
      { label: 'Ich rufe meinem Bruder zu, er soll es ausmachen.', then: 'Dein Bruder murrt, macht es aber. Morgen bist du dran.', think: 'Wer ist für das Licht in deinem Zimmer verantwortlich?' } ] },
    { w: 2, title: 'Das Spielzeugauto', dilemma: true, reward: { hp: 5 }, text: 'An deinem Spielzeugauto ist ein Rad abgefallen. Im Laden gibt es ein neues.', opts: [
      { label: 'Ich werfe es weg und wünsche mir ein neues.', then: 'Das neue Auto glänzt. Das alte liegt jetzt im Müll.', think: 'Was passiert mit all den Dingen, die wir wegwerfen?' },
      { label: 'Ich repariere es mit Opa.', then: 'Mit Kleber hält das Rad wieder. Das Auto fährt, und du hast etwas dazugelernt.', think: 'Was kann man alles reparieren?' },
      { label: 'Ich schenke es einem Kind, das gern bastelt.', then: 'Das Kind baut aus dem Auto einen Bagger und freut sich.', think: 'Kann ein kaputtes Ding für jemand anderen noch wertvoll sein?' } ] },
    { w: 2, title: 'Der Weg zum Sportverein', dilemma: true, reward: { hp: 5 }, text: 'Die Sonne scheint. Mama fragt, ob sie dich mit dem Auto zum Sportverein fahren soll. Zu Fuß ist es nicht weit.', opts: [
      { label: 'Ich fahre mit dem Rad.', then: 'Unterwegs triffst du ein Kind aus deiner Mannschaft. Ihr fahrt zusammen.', think: 'Was hat die Luft davon, wenn viele Rad fahren?' },
      { label: 'Ich lasse mich fahren.', then: 'Du bist schnell da. Das Auto steht danach eine Stunde auf dem Parkplatz.', think: 'Wann ist das Auto nötig, und wann nicht?' },
      { label: 'Ich frage, ob Mama mit mir läuft.', then: 'Ihr geht zusammen und redet über deinen Tag.', think: 'Was kann man zu Fuß alles entdecken?' } ] },
    { w: 2, title: 'Das Museum', text: 'Im Museum liegen ein Stein, ein Handy und ein Zettel mit einem Wunsch auf einem Tisch. Die Museumsführerin fragt dich, wohin etwas gehört.', opts: [{ label: 'Sortieren', task: 'welten', g: 'dreiwelten', win: { item: 'lupe' }, lose: { hp: -5 } }, { label: 'Weitergehen', effect: {} }] },
    { w: 2, title: 'Der Wertstoffhof', text: 'Am Wertstoffhof sortiert ein Mann alte Sachen in große Container. Er fragt dich etwas über Müll und schenkt dir einen Trank.', opts: [{ label: 'Antworten', task: 'any', g: 'bewahren', win: { item: 'trank' }, lose: { hp: -6 } }, { label: 'Weitergehen', effect: {} }] },
    { w: 2, title: 'Die Försterin', text: 'Im Wald erzählt die Försterin, warum Bäume Wasser, Erde und Luft brauchen. Sie stellt dir eine Frage und schenkt dir einen Schutzengel.', opts: [{ label: 'Antworten', task: 'any', g: 'elemente', win: { item: 'engel' }, lose: { xp: 5 } }, { label: 'Weitergehen', effect: {} }] },
    { title: 'Die Wiese', text: 'Unter einem Apfelbaum kannst du dich ausruhen.', opts: [{ label: 'Ausruhen (+15 LP)', effect: { hp: 15 } }, { label: 'Weiter', effect: {} }] },
  ];

  const gen = (mod, tier, know, seqNow, opts) => {
    if (mod !== 'welten') return null;
    let cands = POOL.filter((p) => p.mod === 'welten');
    if (opts && opts.g) { const topic = cands.filter((p) => p.g === opts.g); if (topic.length) cands = topic; }
    const e = weightedPick(cands, know, seqNow);
    return { kind: 'choice', mod, tier: 1, group: 'welten:1', note: e.g, q: e.q, options: WELTEN.slice(), answer: WELTEN[e.a], why: e.why || '', qid: e.id, cols: 1 };
  };

  const MODE = { modules: MODULES, starters: STARTERS, extra: EXTRA, enemies: ENEMIES, events: EVENTS, moves: MOVES, tut: TUT, notes: NOTES, pool: POOL, worlds: 2, byWorld: true, worldAttacks: WORLD_ATTACKS, gen,
    grade: 3, subject: 'Ethik', title: 'Ich, wir und die Welt', icon: '🌍', sub: 'Welt 1 „Ich im Wir“: Stärken, Mut, Vorurteile, Gut und Böse. Welt 2 „Wir in der Welt“: Natur, Umwelt, die vier Elemente',
    order: [{ items: VERSOEHNEN, note: 'gutboese', q: 'So versöhnt man sich: Tippe die Schritte in der richtigen Reihenfolge an.', qid: 'iwv_' }, { items: BESSER, note: 'staerken', q: 'So wirst du besser: Tippe die Schritte in der richtigen Reihenfolge an.', qid: 'iwb_' },
      { w: 2, items: ARCHE, note: 'natur', q: 'Die Bibel erzählt von Noah: Tippe die Teile in der richtigen Reihenfolge an.', qid: 'iwa_' }, { w: 2, items: PAPIER, note: 'bewahren', q: 'Vom Altpapier zum neuen Heft: Tippe die Schritte in der richtigen Reihenfolge an.', qid: 'iwp_' }] };
  K.MODES.ichwelt = MODE;
  return { MODE, WELTEN, DINGE, VERSOEHNEN, BESSER, ARCHE, PAPIER, HELP };
})();
if (typeof module !== 'undefined') module.exports = ME;
