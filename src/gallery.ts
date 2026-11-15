// The design system on one page (docs/gallery.html): the palette and what each colour is for, read from the
// stylesheets, and every building block of the screens with the classes the screens use. It loads the engine's
// modules without starting the game, so icons and the top bar are the real ones.
import { app } from './app/core.ts';
import { typeChip } from './app/progress.ts';
import { topbar } from './app/ui.ts';

interface Token {
  name: string;
  value: string;
}

function tokens(): Token[] {
  const found: Token[] = [];
  const collect = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSLayerBlockRule) collect(rule.cssRules);
      else if (rule instanceof CSSStyleRule && rule.selectorText === ':root')
        for (const name of rule.style)
          if (name.startsWith('--')) found.push({ name, value: rule.style.getPropertyValue(name).trim() });
    }
  };
  for (const sheet of document.styleSheets) collect(sheet.cssRules);
  return found;
}

const isColour = ({ value }: Token) => /^#|^var\(--(?!hand|text)/.test(value);
const swatch = ({ name, value }: Token) =>
  `<li><i style="background:var(${name})"></i><code>${name}</code><small>${value.replace(/^var\((.*)\)$/, '$1')}</small></li>`;
const section = (title: string, body: string) => `<section><h2>${title}</h2>${body}</section>`;
const onCard = (body: string) => `<div class="card">${body}</div>`;

const all = tokens();
const palette = all.filter((token) => token.value.startsWith('#'));
const purposes = all.filter((token) => isColour(token) && !token.value.startsWith('#'));

const sizes = (kind: string) => all.filter((token) => token.name.startsWith(`--${kind}-`));
const TEXT_SIZES = sizes('text')
  .map(({ name, value }) => `<li style="font-size:var(${name})">Aa <code>${name}</code> <small>${value}</small></li>`)
  .join('');
const RADII = sizes('radius')
  .map(
    ({ name, value }) =>
      `<li><i style="border-radius:var(${name})"></i><code>${name}</code><small>${value}</small></li>`,
  )
  .join('');
const SPACES = sizes('space')
  .map(({ name, value }) => `<li><i style="width:var(${name})"></i><code>${name}</code><small>${value}</small></li>`)
  .join('');

const BUTTONS = ['btn', 'btn secondary', 'btn ghost', 'btn small', 'btn small secondary', 'btn small danger']
  .map((cls) => `<button class="${cls}">${cls.replace('btn', '').trim() || 'primary'}</button>`)
  .join('');

app.innerHTML = `<div class="gallery">
${topbar('Lernquest Design', '<span class="muted">Welt 1 · Etage 1</span>')}
${section('Farben: Palette', `<ul class="swatches">${palette.map(swatch).join('')}</ul>`)}
${section('Farben: Wofür', `<ul class="swatches">${purposes.map(swatch).join('')}</ul>`)}
${section('Größen: Schrift', `<ul class="sizes">${TEXT_SIZES}</ul>`)}
${section('Größen: Ecken', `<ul class="swatches corners">${RADII}</ul>`)}
${section('Größen: Abstände', `<ul class="swatches spaces">${SPACES}</ul>`)}
${section(
  'Schrift',
  onCard(
    `<h1>Überschrift 1 in Patrick Hand</h1><h2>Überschrift 2</h2><h3>Überschrift 3</h3><p>Fließtext in Andika: 1 l I und 6 9 sind nicht zu verwechseln.</p><p class="muted">Gedämpfter Text</p><p class="desc">Beschreibung</p>`,
  ),
)}
${section('Knöpfe', `<div class="stack">${BUTTONS}<button class="btn" disabled>disabled</button></div>`)}
${section(
  'Karten',
  `<div class="stack"><button class="card subjtile"><span class="subjicon" aria-hidden="true">🔢</span><span class="subjname">Mathe</span><span class="desc">3 Themen</span></button>
<button class="card weekcard"><span class="eyebrow">Diese Woche</span><span class="weekline"><b>2 von 6 Zielen erledigt</b><span>Neue Aufgaben am Montag</span></span><span class="bar" role="img" aria-label="33 %"><i style="width:33%"></i></span><span class="weekgo">Ziele ansehen und loslegen ›</span></button>
<div class="card modecard"><h3>Zahlenquest</h3><div class="desc">Rechnen und Zahlen</div><span class="startbadge">Hier anfangen</span><p class="goalbadge">⭐ Wochenziel: Löse 15 Aufgaben.</p><div class="row"><button class="btn small">Starten</button></div></div></div>`,
)}
${section(
  'Marken und Schalter',
  `<div class="row" style="flex-wrap:wrap;align-items:center"><button class="gradechip on" aria-pressed="true">Klasse 3</button><button class="gradechip" aria-pressed="false">Klasse 2</button>${typeChip('wasser')}<span class="levelbadge">Lv 3</span><span class="newbadge">Neu!</span><button class="stampbtn" aria-label="Stempelheft, 12 Stempel">🏷️ 12</button><button class="switch" role="switch" aria-checked="true" aria-label="an"><i></i></button><button class="switch" role="switch" aria-checked="false" aria-label="aus"><i></i></button></div>
<nav class="ptabs" role="tablist" aria-label="Bereiche"><button role="tab" aria-selected="true"><span>Überblick</span></button><button role="tab" aria-selected="false"><span>Inhalte</span></button><button role="tab" aria-selected="false"><span>Einstellungen</span></button></nav>`,
)}
${section(
  'Kampf',
  `<div class="row"><div class="plate hero"><div class="name">Glutfuchs <span class="levelbadge">Lv 1</span></div><div class="hpbar"><i style="width:70%"></i></div><div class="hptext">❤️ 42 / 60</div><div class="xpbar" role="progressbar" aria-label="Erfahrung" aria-valuenow="40"><i style="width:40%"></i></div></div>
<div class="plate enemy"><div class="name">Regenwicht</div><div class="plateline">${typeChip('wasser')}</div><div class="hpbar"><i class="low" style="width:20%"></i></div><div class="hptext">❤️ 7 / 34</div></div></div>
<div class="log">Regenwicht taucht auf! 🎯 Schwachstelle: Feuerreihe.</div>
<div class="attacks"><button class="atk" aria-label="Funkenbiss: Addition, 12 Schaden"><span class="n">Funkenbiss</span><span class="m">➕ Addition<span class="dmg">💥 12</span></span><span class="tags"></span></button>
<button class="atk weak" aria-label="Feuerreihe: Zahlenfolgen, 24, Schwachstelle – Schaden 24"><span class="n">Feuerreihe</span><span class="m">🔢 Zahlenfolgen<span class="dmg">💥 24</span></span><span class="tags"><span class="tag weak">🎯 Schwachstelle</span></span></button>
<button class="atk tired" aria-label="Flammenstoß: Subtraktion, 7, müde – Schaden 7"><span class="n">Flammenstoß</span><span class="m">➖ Subtraktion<span class="dmg">💥 7</span></span><span class="tags"><span class="tag tired">😮‍💨 müde</span></span></button>
<button class="atk" aria-label="Glutgitter: Zahlengitter, 18, Wochenziel – Schaden 18"><span class="n">Glutgitter</span><span class="m">🔢 Zahlengitter<span class="dmg">💥 18</span></span><span class="tags"><span class="tag goal">⭐ Wochenziel</span></span></button></div>`,
)}
${section(
  'Aufgabe',
  `<div class="task"><div class="head">➕ Addition · Funkenbiss<button class="tut" type="button" aria-label="Erklärung anzeigen">🛈<span class="lbl"> Wie geht das?</span></button></div><div class="expr">60 + 5 = ?</div><div class="inputs"><div class="inp active"></div></div></div>
<div class="options two"><button class="opt">backen</button><button class="opt">baken</button></div>
<div class="numpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button>${n}</button>`).join('')}<button class="del" aria-label="Löschen">⌫</button><button>0</button><button class="ok" aria-label="Antwort prüfen">✓</button></div>`,
)}
${section(
  'Elternbereich',
  `<div class="card pcard"><h3>Klassen</h3><p class="pnote">Ausgeschaltete Klassen verschwinden von der Startseite.</p><div class="prow"><div class="ptext"><b>Klasse 1</b><span>Mathe, Deutsch, Ethik, Sachkunde, Musik</span></div><button class="switch" role="switch" aria-checked="true" aria-label="Klasse 1"><i></i></button></div></div>`,
)}
</div>`;
