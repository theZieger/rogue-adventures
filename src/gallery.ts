// The design system on one page (docs/gallery.html): every token with how often the stylesheets use it, and every
// shared building block in each of its states with the rule for using it. It loads the engine's modules without
// starting the game, so icons, monsters and the top bar are the real ones.
import { app, TYPES } from './app/core.ts';
import { monsterSVG, typeChip } from './app/progress.ts';
import { topbar } from './app/ui.ts';
import { ICONS } from './icons.ts';

interface Token {
  name: string;
  value: string;
  uses: number;
}

function tokens(): Token[] {
  const found = new Map<string, string>();
  let css = '';
  const collect = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSLayerBlockRule) collect(rule.cssRules);
      else {
        css += rule.cssText;
        if (rule instanceof CSSStyleRule && rule.selectorText === ':root')
          for (const name of rule.style)
            if (name.startsWith('--') && !found.has(name)) found.set(name, rule.style.getPropertyValue(name).trim());
      }
    }
  };
  for (const sheet of document.styleSheets) collect(sheet.cssRules);
  return [...found].map(([name, value]) => ({ name, value, uses: css.split(`var(${name})`).length - 1 }));
}

const all = tokens();
const named = (pattern: RegExp) => all.filter((token) => pattern.test(token.name));
const uses = ({ uses: n }: Token) => `<small class="${n ? '' : 'unused'}">${n ? `${n}×` : 'unbenutzt'}</small>`;
const label = (token: Token, show = token.value.replace(/^var\((.*)\)$/, '$1')) =>
  `<code>${token.name}</code><small>${show}</small>${uses(token)}`;
const list = (cls: string, items: Token[], sample: (token: Token) => string) =>
  `<ul class="tokens ${cls}">${items.map((token) => `<li>${sample(token)}${label(token)}</li>`).join('')}</ul>`;
const swatches = (items: Token[]) => list('swatches', items, ({ name }) => `<i style="background:var(${name})"></i>`);

const section = (title: string, rule: string, body: string) =>
  `<section><h2>${title}</h2><p class="rule">${rule}</p>${body}</section>`;
// one building block: the classes that make it, when to use it, and how it looks
const block = (classes: string, rule: string, body: string, cls = 'stack') =>
  `<div class="block"><h3><code>${classes}</code></h3><p class="rule">${rule}</p><div class="${cls}">${body}</div></div>`;
const onCard = (body: string) => `<div class="card">${body}</div>`;
const row = (body: string) => `<div class="row specimen">${body}</div>`;

const PALETTE = named(/^--(navy|blue|cream|gold|green|moss|red|orange|violet)-\d+$|^--white$/);
const HUES = [...new Set(PALETTE.map(({ name }) => name.split('-')[2]))];
const ROLES = named(/^--(bg2?|card2?|ink(-soft)?|paper-ink|gold|green|red|blue|orange|key(-ink)?|focus|grid)$/);
const TONES = named(/^--(good|bad|warn|hot|info)-/);
const ALPHAS = named(/^--(glass|shade|overlay|halo|.*-glow)/);

const fox = monsterSVG('fox', TYPES.feuer.color, 0);
const drop = monsterSVG('regenwicht', TYPES.wasser.color, 0, 'enemy');
const BUTTONS = ['btn', 'btn secondary', 'btn ghost', 'btn danger', 'btn small', 'btn small secondary']
  .map((cls) => `<button class="${cls}">${cls}</button>`)
  .join('');
const PILLS = [
  ['pill', 'Lv 3'],
  ['pill new', 'Neu!'],
  ['pill good', 'Hier anfangen'],
  ['pill warn', '⭐ Wochenziel'],
  ['pill hot', '😮‍💨 müde'],
  ['pill bad', '⚠️ gesperrt'],
  ['pill info', '🔁 von vorhin'],
]
  .map(([cls, text]) => `<span class="${cls}">${text}</span>`)
  .join('');
const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button>${n}</button>`).join('');
const MOVES = named(/^--t-/)
  .map((token) => `<li><i class="mover" style="transition-duration:var(${token.name})"></i>${label(token)}</li>`)
  .join('');

app.innerHTML = `<div class="gallery">
${topbar('Lernquest Design', '<span class="muted">Welt 1 · Etage 1</span>')}
<p class="rule lead">Alles, woraus die Bildschirme gebaut sind. Eine Regel nimmt eine Rolle oder eine Stufe von hier; was fehlt, kommt zuerst hierher und dann auf den Bildschirm.</p>

${section(
  'Farben: Palette',
  'Eine Reihe pro Farbton, hell nach dunkel. Regeln benutzen Rollen; eine Palettenfarbe direkt nur in Zeichnungen (Münzen, Karten, das Turmwacht-Brett).',
  HUES.map((hue) => swatches(PALETTE.filter(({ name }) => name.split('-')[2] === hue))).join(''),
)}
${section(
  'Farben: Rollen',
  'Flächen, Tinte und die fünf Signalfarben. Gold ist die Hauptaktion und die Auswahl, Grün richtig, Rot falsch, Blau die Eingabe, Orange neu.',
  swatches(ROLES),
)}
${section(
  'Farben: Töne',
  'Ein Ton ist ein heller Grund mit dunkler Schrift darauf: gut, schlecht, Hinweis, anstrengend, Information. Immer als Paar verwenden.',
  `${swatches(TONES)}<div class="row specimen">${['good', 'warn', 'hot', 'bad', 'info'].map((tone) => `<span class="pill lg ${tone}">${tone}</span>`).join('')}</div>`,
)}
${section(
  'Farben: Durchscheinend',
  'Glas liegt auf dem dunklen Grund, Schatten unter hellen Flächen. Eine eigene Durchsichtigkeit entsteht mit color-mix aus einer Rolle, nie als rgba-Wert.',
  swatches(ALPHAS),
)}
${section(
  'Schrift',
  'Patrick Hand für Überschriften, Namen und Rückmeldungen. Andika für alles, was gelesen oder gerechnet wird. Nur normal und fett.',
  `${onCard(`<h1>Überschrift 1</h1><h2>Überschrift 2</h2><h3>Überschrift 3</h3><p>Fließtext in Andika: 1 l I und 6 9 sind nicht zu verwechseln.</p><p><b>Fett für das Wichtige.</b></p><p class="muted">Gedämpfter Text</p><p class="eyebrow">Dachzeile</p>`)}
${list('sizes', named(/^--text-/), ({ name }) => `<b style="font-size:var(${name})">Aa 12</b>`)}
${list('sizes', named(/^--leading-/), ({ name }) => `<span class="lines" style="line-height:var(${name})">Zeile eins<br>Zeile zwei</span>`)}`,
)}
${section(
  'Ecken, Abstände, Linien',
  'Feste Stufen. Ein Wert zwischen zwei Stufen wird nicht ergänzt, es gilt die nähere Stufe.',
  `${list('swatches corners', named(/^--radius-/), ({ name }) => `<i style="border-radius:var(${name})"></i>`)}
${list('swatches spaces', named(/^--space-/), ({ name }) => `<i style="width:var(${name})"></i>`)}
${list('swatches lines', named(/^--line/), ({ name }) => `<i style="border-top-width:var(${name})"></i>`)}
${list('swatches taps', named(/^--tap/), ({ name }) => `<i style="width:var(${name});height:var(${name})"></i>`)}`,
)}
${section(
  'Schatten und Ringe',
  'Was man antippen kann, steht auf einer Kante und sinkt beim Drücken. Ein Ring zeigt die Auswahl (Gold), reif (Grün) oder die aktive Eingabe (Blau).',
  list('swatches shadows', named(/^--(shadow|ring)/), ({ name }) => `<i style="box-shadow:var(${name})"></i>`),
)}
${section(
  'Bewegung',
  'Antippen, um die Dauern zu sehen. Übergänge nehmen immer eine dieser Stufen; nur die Kampf-Choreografie von Turmwacht und Kreisel behält ihre eigenen, auf die Töne abgestimmten Zeiten. Ohne Bewegung muss alles genauso verständlich sein.',
  `<ul class="tokens moves" tabindex="0">${MOVES}</ul>`,
)}

${section(
  'Knöpfe',
  'Ein goldener Knopf pro Bildschirm: der nächste Schritt. Alles andere ist weiß oder nur umrandet.',
  `${block('btn', 'Größen: normal und <code>small</code>. Töne: Gold, <code>secondary</code>, <code>ghost</code> (nur auf dunklem Grund), <code>danger</code> (löschen). Gesperrt liegt er flach und grau.', `${BUTTONS}<button class="btn" disabled>btn disabled</button><button class="btn ghost" disabled>btn ghost disabled</button>`)}
${block('tut · speak', 'Kleine Helfer auf einer Karte: erklären und vorlesen.', row(`<button class="tut" type="button">🛈<span> Wie geht das?</span></button><button class="speak" type="button" aria-label="Vorlesen">🔊</button>`))}
${block('titlebar: soundbtn · stampbtn · newsbtn · parentbtn', 'Die leisen runden Knöpfe oben auf der Startseite; sie rollen mit der Seite weg. ein neuer Eintrag in „Was ist neu?“ zeigt „Neu!“, ein ungesicherter Spielstand einen goldenen Punkt am Zahnrad.', `<div class="titlebar"><button class="soundbtn" aria-label="Töne ausschalten">🔊</button><button class="stampbtn" aria-label="Stempelheft, 12 Stempel">🏷️ 12</button><button class="newsbtn" aria-label="Was ist neu?">✨<span class="pill new">Neu!</span></button><button class="parentbtn" aria-label="Eltern"><svg class="gear" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="3.6" stroke-dasharray="3.4 3.35"/><circle cx="12" cy="12" r="6.2" fill="none" stroke="currentColor" stroke-width="3.2"/></svg><span class="dot" aria-hidden="true"></span></button></div>`)}`,
)}
${section(
  'Marken, Auswahl, Hinweise',
  'Eine Marke sagt etwas, eine Auswahl tut etwas. Sie sehen deshalb verschieden aus.',
  `${block('pill', 'Ein kurzes Wort, das einen Zustand markiert. Nie antippbar. <code>lg</code> für Typen und Turmwacht-Karten.', row(`${PILLS}${typeChip('wasser')}${typeChip('feuer')}`))}
${block('chip', 'Eine Wahl unter wenigen; die gewählte ist gold. Auf einer Karte ist der Rand in Tinte.', `${row(`<button class="chip on" aria-pressed="true">Klasse 3</button><button class="chip" aria-pressed="false">Klasse 2</button>`)}${onCard(`<div class="toggles"><button class="chip on" aria-pressed="true">Idee</button><button class="chip" aria-pressed="false">Fehler</button></div>`)}`)}
${block('switch', 'An oder aus, wirkt sofort. Nur im Elternbereich.', onCard(row(`<button class="switch" role="switch" aria-checked="true" aria-label="an"><i></i></button><button class="switch" role="switch" aria-checked="false" aria-label="aus"><i></i></button>`)))}
${block('callout · notecard', 'Ein Satz Rat in einer Karte; die Notizkarte für das, was man sich merken soll.', onCard(`<p class="callout">⭐ Wochenziel: Löse 15 Aufgaben.</p><p class="callout center">🌉 Tipp: Lies die Frage noch einmal.</p><div class="notecard">Der Zehner bleibt, der Einer wächst.</div>`))}
${block('bar', 'Wie viel von etwas da ist. <code>hp</code> ist Leben (erst gold, dann rot), <code>xp</code> Erfahrung.', `${onCard(`<span class="bar" role="img" aria-label="33 %"><i style="width:33%"></i></span>`)}<div class="bar hp"><i style="width:80%"></i></div><div class="bar hp"><i class="mid" style="width:45%"></i></div><div class="bar hp"><i class="low" style="width:15%"></i></div><div class="bar xp"><i style="width:40%"></i></div>`)}
${block('ptabs · psubtabs', 'Bereiche des Elternbereichs und ihre Unterseiten.', `<nav class="ptabs" role="tablist" aria-label="Bereiche"><button role="tab" aria-selected="true"><span>Überblick</span></button><button role="tab" aria-selected="false"><span>Inhalte</span></button><button role="tab" aria-selected="false"><span>Einstellungen</span></button></nav><div class="psubtabs" role="tablist" aria-label="Zeitraum"><button role="tab" aria-selected="true">Diese Woche</button><button role="tab" aria-selected="false">Insgesamt</button></div>`)}`,
)}
${section(
  'Karten',
  'Helle Fläche auf dunklem Grund. Eine Karte mit dunklem Rand kann man antippen, eine ohne Rand liest man.',
  `${block('card', 'Der Behälter für alles Helle.', `<div class="card"><h3>Karte</h3><p>Text auf einer Karte.</p></div><div class="card flat"><p><code>flat</code>: ohne Kante, in einer anderen Karte.</p></div>`)}
${block(
  'card subjtile · weekcard · modecard',
  'Die Karten der Startseite. <code>subjects more</code>: Monsterbuch, Hütte und Co. unter den Fächern, gleich groß wie diese, mit Abstand davor; „neu“ zählt, was dazugekommen ist.',
  `<button class="card subjtile"><span class="subjicon" aria-hidden="true">🔢</span><span class="subjname">Mathe</span><span class="desc">3 Themen</span></button>
<div class="subjects more"><button class="card subjtile"><span class="subjicon" aria-hidden="true">📗</span><span class="subjname">Monsterbuch</span><span class="desc">12 Monster</span><span class="pill new">3 neu</span></button><button class="card subjtile"><span class="subjicon" aria-hidden="true">🏡</span><span class="subjname">Meine Hütte</span><span class="desc">Möbel aufstellen</span></button></div>
<button class="card weekcard"><span class="eyebrow">Diese Woche</span><span class="weekline"><b>2 von 6 Zielen erledigt</b><span>Neue Aufgaben am Montag</span></span><span class="bar" role="img" aria-label="33 %"><i style="width:33%"></i></span><span class="weekgo">Ziele ansehen und loslegen ›</span></button>
<div class="card modecard"><h3>Zahlenquest</h3><div class="desc">Rechnen und Zahlen</div><span class="pill good">Hier anfangen</span><p class="callout">⭐ Wochenziel: Löse 15 Aufgaben.</p><div class="row"><button class="btn small">Starten</button></div></div>`,
)}
${block('choice', 'Eine Wahl mit Bild. <code>selected</code> trägt den goldenen Ring, <code>locked</code> ist noch nicht zu haben.', `<button class="choice selected">${fox}<span class="meta"><span class="name">Glutfuchs</span><span class="desc">Ein Fuchs mit warmem Fell.</span></span></button><button class="choice locked">${drop}<span class="meta"><span class="name">Regenwicht</span><span class="desc">Kommt später dazu.</span></span></button>`)}
${block('overlay · modal', 'Ein Dialog von unten: eine Frage, höchstens drei Knöpfe, der goldene zuerst.', `<div class="modal"><h2>Neues Abenteuer?</h2><p>Dein laufendes Abenteuer wird gelöscht.</p><div class="stack"><button class="btn">Ja, neu starten</button><button class="btn secondary">Zurück</button></div></div>`)}`,
)}
${section(
  'Kampf',
  'Oben der Gegner, unten der Held, dazwischen die Meldung in Handschrift.',
  `${block(
    'plate · log',
    'Die Schilder der Kämpfer und die Meldung: <code>hit</code>, <code>miss</code>, <code>crit</code>.',
    `<div class="row"><div class="plate hero"><div class="name">Glutfuchs <span class="pill">Lv 1</span></div><div class="bar hp"><i style="width:70%"></i></div><div class="hptext">❤️ 42 / 60</div><div class="bar xp" role="progressbar" aria-label="Erfahrung" aria-valuenow="40"><i style="width:40%"></i></div></div>
<div class="plate enemy"><div class="name">Regenwicht</div><div class="plateline">${typeChip('wasser')}</div><div class="bar hp"><i class="low" style="width:20%"></i></div><div class="hptext">❤️ 7 / 34</div></div></div>
<div class="log">Regenwicht taucht auf! 🎯 Schwachstelle: Feuerreihe.</div><div class="log hit">Treffer! 12 Schaden.</div><div class="log miss">Daneben.</div><div class="log crit">Volltreffer!</div>`,
  )}
${block(
  'atk',
  'Eine Attacke ist eine Aufgabenart. Zustände: <code>weak</code>, <code>tired</code>, <code>locked</code>.',
  `<div class="attacks"><button class="atk" aria-label="Funkenbiss: Addition, 12 Schaden"><span class="n">Funkenbiss</span><span class="m">➕ Addition<span class="dmg">💥 12</span></span><span class="tags"></span></button>
<button class="atk weak" aria-label="Feuerreihe: Zahlenfolgen, 24, Schwachstelle – Schaden 24"><span class="n">Feuerreihe</span><span class="m">🔢 Zahlenfolgen<span class="dmg">💥 24</span></span><span class="tags"><span class="pill">🎯 Schwachstelle</span></span></button>
<button class="atk tired" aria-label="Flammenstoß: Subtraktion, 7, müde – Schaden 7"><span class="n">Flammenstoß</span><span class="m">➖ Subtraktion<span class="dmg">💥 7</span></span><span class="tags"><span class="pill hot">😮‍💨 müde</span></span></button>
<button class="atk locked" aria-label="Glutgitter: Zahlengitter, 18, Wochenziel – Schaden 18" disabled><span class="n">Glutgitter</span><span class="m">🔢 Zahlengitter<span class="dmg">💥 18</span></span><span class="tags"><span class="pill warn">⭐ Wochenziel</span></span></button></div>`,
)}
${block('node', 'Ein Ort auf der Karte: <code>open</code> ist dran, <code>taken</code> gegangen, <code>past</code> vorbei, <code>future</code> kommt noch, <code>dead</code> ist versperrt.', row(['open', 'taken', 'future', 'past', 'dead'].map((state) => `<button class="node ${state}" ${state === 'open' ? '' : 'disabled tabindex="-1"'}>⚔️<small>${state}</small></button>`).join('')))}`,
)}
${section(
  'Aufgabe',
  'Die Aufgabe steht auf Karopapier. Blau ist, wo man gerade schreibt; Grün und Rot kommen erst nach der Antwort.',
  `${block('task · inp', 'Die Karte mit der Frage und den Feldern: <code>active</code>, <code>ok</code>, <code>bad</code>.', `<div class="task"><div class="head">➕ Addition · Funkenbiss<button class="tut" type="button" aria-label="Erklärung anzeigen">🛈<span class="lbl"> Wie geht das?</span></button></div><div class="expr">60 + 5 = ?</div><div class="inputs"><div class="inp active">6</div><div class="inp ok">65</div><div class="inp bad">56</div></div></div>`)}
${block('options · opt', 'Antworten zum Antippen: <code>right</code>, <code>wrong</code>, <code>struck</code> (vom Tipp gestrichen).', `<div class="options two"><button class="opt">backen</button><button class="opt struck">bakken</button><button class="opt right">backen</button><button class="opt wrong">baken</button></div>`)}
${block('orderlist · oitem', 'In die richtige Reihenfolge tippen: <code>picked</code>, <code>right</code>, <code>wrong</code>.', onCard(`<div class="orderlist"><button class="oitem"><span class="num"></span>Samen</button><button class="oitem picked"><span class="num">1</span>Keimling</button><button class="oitem right"><span class="num">2</span>Pflanze</button><button class="oitem wrong"><span class="num">3</span>Blüte</button></div>`))}
${block('feedback', 'Die Rückmeldung nach der Antwort, mit der richtigen Lösung, wenn es daneben ging.', onCard(`<div class="feedback good">Richtig! ✔</div><div class="feedback bad">Daneben<small>Richtig wäre: 65</small></div>`))}
${block('numpad', 'Zahlen eintippen. Löschen links, prüfen rechts in Grün.', `<div class="numpad">${KEYS}<button class="del" aria-label="Löschen">⌫</button><button>0</button><button class="ok" aria-label="Antwort prüfen">✓</button></div>`)}
${block('nameinput', 'Das einzige Textfeld für Kinder.', onCard(`<input class="nameinput" aria-label="Name" value="Mia">`))}`,
)}
${section(
  'Elternbereich',
  'Derselbe Baukasten, ruhiger: Überschriften in Andika, keine Bewegung, Schalter statt Knöpfe.',
  `<div class="card pcard"><h3>Klassen</h3><p class="pnote">Ausgeschaltete Klassen verschwinden von der Startseite.</p><div class="prow"><div class="ptext"><b>Klasse 1</b><span>Mathe, Deutsch, Ethik, Sachkunde, Musik</span></div><button class="switch" role="switch" aria-checked="true" aria-label="Klasse 1"><i></i></button></div><div class="statrow"><span class="n">Einmaleins</span><span class="pill good">sicher</span></div><div class="statrow"><span class="n">Zahlenfolgen</span><span class="pill warn">fast sicher</span></div><div class="statrow"><span class="n">Subtraktion</span><span class="pill bad">übt noch</span></div></div>`,
)}
${section(
  'Turmwacht',
  'Das Brett ist eine Zeichnung und wächst mit dem Bildschirm; darin zählen Längen in Bretteinheiten (<code>--u</code>). Alles um das Brett herum kommt aus diesem Baukasten.',
  `<div class="tw-card"><div class="tw-cardhead">${drop}<div class="tw-cardinfo"><div class="tw-namerow"><div class="name">Regenwicht</div><span class="tw-cardhp" aria-label="24 von 24 Lebenspunkten">❤️ 24</span></div><div class="tw-from">Aufgabe aus: 🧮 Zahlenquest</div></div></div><div class="tags"><span class="pill lg">🎯 Doppelte Ziegel</span><span class="pill lg info">🔁 Aufgabe von vorhin</span><span class="pill lg hot">👑 Boss: langsam, aber stark</span></div></div>`,
)}
${section(
  'Bilder',
  'Kleine Zeichen sind gezeichnete Icons aus <code>src/icons.ts</code> (Umriss in Tinte, Verlauf, ein Glanzlicht), keine Geräte-Emojis. Monster kommen aus <code>src/monsters.ts</code>.',
  `<div class="icons">${Object.keys(ICONS).join(' ')}</div><div class="row specimen monsters">${fox}${drop}${monsterSVG('fox', TYPES.feuer.color, 1)}</div>`,
)}
</div>`;
