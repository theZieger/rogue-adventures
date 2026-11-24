import { MK } from '../knowledge.ts';
import { MONART } from '../monsters.ts';
import { PANTRY_MAX, TOP } from '../save.ts';
import { html, raw } from '../ui/html.ts';
import { TOP_KNOCK, topVal } from './battle.ts';
import { screenStamps } from './collection.ts';
import { $, CFG, ITEMS, TYPES, esc, rnd } from './core.ts';
import { type Crop, screenGarden } from './garten.ts';
import {
  OUTFITS,
  type Outfit,
  hasOutfit,
  heroSVG,
  heroes as allHeroes,
  markWeek,
  monsterSVG,
  showcase,
  wornBy,
} from './progress.ts';
import { state } from './state.ts';
import { type TopSlot, extraOn, hasPart, saveAll } from './storage.ts';
import { INK, lg, ln, rg, runTask, shadow } from './tasks.ts';
import { screenTitle } from './title.ts';
import { modal, screen, topbar } from './ui.ts';

/* ---------- Werkbank ---------- */
// the question is about the thing being built (a · b); the cost stays small and fixed, because a bed gives one crop a week
interface Recipe {
  id: string;
  need: Record<string, number>;
  q: (a: number, b: number) => string;
  // furniture only; a potion or shield takes name and text from ITEMS
  place?: string;
  name?: string;
  desc?: string;
}
export const RECIPES: Recipe[] = [
  {
    id: 'trank',
    need: { hafer: 1, holz: 1 },
    q: (a, b) =>
      `Für den Trank kochst du Haferbrei in ${a} Töpfen. In jeden Topf kommen ${b} Löffel Hafer. Wie viele Löffel Hafer brauchst du?`,
  },
  {
    id: 'grosstrank',
    need: { hafer: 2, kartoffel: 1, holz: 1 },
    q: (a, b) =>
      `Der große Trank kocht ${a} Stunden lang. In jeder Stunde rührst du ${b}-mal um. Wie oft rührst du um?`,
  },
  {
    id: 'schild',
    need: { holz: 2, erz: 1 },
    q: (a, b) =>
      `Der Schild hat ${a} Bretter. Jedes Brett schlägst du mit ${b} Nägeln fest. Wie viele Nägel brauchst du?`,
  },
  {
    id: 'keks',
    need: { roggen: 1, holz: 1 },
    q: (a, b) =>
      `Der Chilibauer tauscht eine Chilischote gegen Roggen. Zum Trocknen hängen bei ihm ${a} Schnüre mit je ${b} Schoten. Wie viele Schoten hängen da?`,
  },
  {
    id: 'hut-tisch',
    place: 'Tisch',
    name: 'Tisch mit Erntekorb',
    desc: 'Auf dem Tisch steht ein Korb mit deiner Ernte.',
    need: { holz: 4, kartoffel: 1 },
    q: (a, b) => `Im Erntekorb liegen ${a} Reihen Kartoffeln mit je ${b} Stück. Wie viele Kartoffeln liegen im Korb?`,
  },
  {
    id: 'hut-regal',
    place: 'Regal',
    name: 'Regal mit Monsterbuch',
    desc: 'Im Regal siehst du, wie viele Monster, Kreiselteile und Notizkarten du hast.',
    need: { holz: 4, stein: 1 },
    q: (a, b) => `Das Regal hat ${a} Bretter. Auf jedes Brett passen ${b} Bücher. Wie viele Bücher passen ins Regal?`,
  },
  {
    id: 'hut-haken',
    place: 'Haken',
    name: 'Wandhaken für den Kreisel',
    desc: 'Ein Haken aus Eisen. Daran hängt dein Kreisel, sobald du Kreiselteile hast.',
    need: { erz: 1, holz: 1 },
    q: (a, b) =>
      `Den Haken legst du ${a}-mal ins Feuer. Nach jedem Mal schlägst du ${b}-mal mit dem Hammer darauf. Wie oft schlägst du insgesamt?`,
  },
  {
    id: 'hut-bett',
    place: 'Bett',
    name: 'Bett',
    desc: 'Ein Holzbett mit einer Matratze aus Roggenstroh.',
    need: { holz: 5, roggen: 2 },
    q: (a, b) =>
      `Für die Matratze stopfst du ${a} Säcke mit je ${b} Armen voll Roggenstroh. Wie viele Arme voll Stroh sind das?`,
  },
  {
    id: 'hut-fenster',
    place: 'Fenster',
    name: 'Fenster',
    desc: 'Ein Fenster mit einer Fensterbank aus Stein.',
    need: { holz: 2, stein: 2 },
    q: (a, b) => `Das Fenster hat ${a} Reihen mit je ${b} kleinen Scheiben. Wie viele Scheiben hat das Fenster?`,
  },
];
const MATS = ['holz', 'stein', 'erz'].concat(Object.keys(MK.CROPS));
const matName = (k: string) =>
  MK.CROPS[k as Crop] ? MK.CROPS[k as Crop].name : { holz: 'Holz', stein: 'Stein', erz: 'Erz' }[k];
const andList = (a: string[]) => (a.length > 1 ? a.slice(0, -1).join(', ') + ' und ' + a[a.length - 1] : a[0] || '');
const isFurn = (r: Recipe) => r.id.startsWith('hut-');
const rName = (r: Recipe) => r.name || ITEMS[r.id].name;
const missing = (r: Recipe) =>
  Object.entries(r.need)
    .filter(([k, n]) => (state.meta.materials[k] || 0) < n)
    .map(([k, n]) => `${n - (state.meta.materials[k] || 0)} ${matName(k)}`);
const craftable = (r: Recipe) =>
  !missing(r).length && (isFurn(r) ? !state.meta.owned[r.id] : state.meta.pantry.length < PANTRY_MAX);
export function craft(r: Recipe) {
  if (!craftable(r)) return false;
  for (const [k, n] of Object.entries(r.need)) state.meta.materials[k] -= n;
  if (isFurn(r)) state.meta.owned[r.id] = true;
  else state.meta.pantry.push(r.id);
  state.meta.progressAt = new Date().toISOString();
  return true;
}
export function benchHtml() {
  const stock = MATS.filter((k) => state.meta.materials[k]).map((k) => `${state.meta.materials[k]} ${matName(k)}`);
  const row = (r: Recipe) => {
    const miss = missing(r);
    const prev = isFurn(r)
      ? raw(furnPreview(r.id))
      : html`<div class="rwprev" aria-hidden="true">${ITEMS[r.id].icon}</div>`;
    const action =
      isFurn(r) && state.meta.owned[r.id]
        ? html`<div class="rwhave">✔ Steht in deiner Hütte</div>`
        : html`<button class="btn small" data-action="craft" data-craft="${r.id}" ${craftable(r) ? '' : 'disabled'}>Bauen</button>${miss.length ? html`<div class="desc">Es fehlt: ${miss.join(', ')}</div>` : !isFurn(r) && !craftable(r) ? html`<div class="desc">Der Vorrat ist voll.</div>` : ''}`;
    return html`<div class="choice reward">${prev}<div class="meta"><div class="name">${rName(r)}</div><div class="desc">${isFurn(r) ? r.desc : ITEMS[r.id].desc}</div><div class="desc">Braucht ${andList(Object.entries(r.need).map(([k, n]) => `${n} ${matName(k)}`))}</div>${action}</div></div>`;
  };
  return html`<h2 id="werkbank">Werkbank</h2>
      <div class="card"><p>Im Lager: ${stock.length ? andList(stock) : 'noch nichts'}.</p><p>Im Vorrat: ${state.meta.pantry.length} von ${PANTRY_MAX}${state.meta.pantry.length ? ` (${state.meta.pantry.map((it) => `${ITEMS[it].icon} ${ITEMS[it].name}`).join(', ')})` : ''}. Der Vorrat kommt ins nächste Abenteuer mit.</p>
      <p class="pnote">Holz gibt es auf dem Holzplatz in Zahlenquest und für jeden Sieg in der Kartoffel-Werkstatt. Erz und Stein findest du im Bergwerk, Ernte im Schulgarten. Vor dem Bauen löst du eine Aufgabe.</p></div>
      <h3>Für dein nächstes Abenteuer</h3>
      ${RECIPES.filter((r) => !isFurn(r)).map(row)}
      <h3>Für deine Hütte</h3>${RECIPES.filter(isFurn).map(row)}`;
}
export function screenCraft(id: string | undefined) {
  state.depth = 2;
  const r = RECIPES.find((x) => x.id === id);
  if (!r || !craftable(r)) return screenStamps(true);
  const a = rnd(2, 6),
    b = rnd(3, 9);
  const t = { kind: 'num', mod: 'mul', tier: 1, group: 'mul:1', story: r.q(a, b), answers: [a * b] };
  screen(
    html`<div class="screen">${raw(topbar('Werkbank'))}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`,
    {},
  );
  let made = false;
  // counts as Einmaleins practice in Zahlenquest, without changing its levels (like the Bergwerk in other units)
  runTask(
    t,
    {
      container: $('#taskwrap'),
      bottom: $('#bottom'),
      subtitle: rName(r),
      onResult: (ok) => {
        const s = state.meta.stats.math.mul;
        s.t++;
        if (ok) s.c++;
        markWeek();
        made = ok && craft(r);
        saveAll();
      },
    },
    () => {
      screen(
        html`<div class="screen">${raw(topbar('Werkbank'))}<div class="scroll"><div class="card center">${
          made
            ? html`<h2>Gebaut: ${rName(r)}</h2>${isFurn(r) ? html`${raw(furnPreview(r.id))}<p>Das steht jetzt in deiner Hütte.</p>` : html`<p style="font-size:var(--text-48);margin:0" aria-hidden="true">${ITEMS[r.id].icon}</p><p>Das liegt jetzt im Vorrat und kommt ins nächste Abenteuer mit.</p>`}`
            : html`<h2>Nicht gebaut</h2><p>Die Rechnung hat nicht gestimmt. Deine Zutaten bleiben im Lager. Du kannst es mit neuen Zahlen wieder versuchen.</p>`
        }</div></div>
        <div class="bottom"><div class="row"><button class="btn${made && isFurn(r) ? ' secondary' : ''}" id="next" data-action="bench">Zur Werkbank</button>${made && isFurn(r) ? html`<button class="btn" id="hut" data-action="hut">Zur Hütte</button>` : ''}</div></div></div>`,
        { bench: () => screenStamps(true), hut: screenHut },
      );
    },
  );
}

/* ---------- Meine Hütte ---------- */
// furniture is drawn in room coordinates (viewBox 0 0 360 290); box = its place, also used to crop the preview
const plaque = (y: number, v: number) =>
  `<rect x="296" y="${y}" width="36" height="24" rx="6" fill="#FFF3D6" ${ln(2)}/><text x="314" y="${y + 18}" text-anchor="middle" font-size="18" font-weight="700" fill="${INK}">${v}</text>`;
// what the shelf shows: how many monsters, Kreisel parts and note cards there are
interface ShelfNums {
  dex: number;
  tops: number;
  notes: number;
}
const FURN: Record<string, { box: number[]; art: (n: ShelfNums) => string }> = {
  'hut-fenster': {
    box: [32, 82, 98, 78],
    art: () => `<defs>${lg('hf-w', '#C98F55', '#8E5A30')}${lg('hf-sky', '#8FCDF2', '#E2F3EC')}${lg('hf-st', '#CDD2D8', '#8C939C')}${lg('hf-cu', '#E66A55', '#B23A31', 1)}</defs>
      <rect x="43" y="92" width="84" height="62" rx="4" fill="#5A3A1E" opacity=".22"/><rect x="38" y="86" width="86" height="64" rx="4" fill="url(#hf-w)" ${ln(3)}/><path d="M42 90h30M88 146h30M120 96v20" stroke="#6E4526" stroke-width="1.2" opacity=".45"/>
      <rect x="46" y="93" width="70" height="50" fill="url(#hf-sky)" ${ln(2)}/><path d="M47 131q14-9 28-4t26-6t14 4v17h-68z" fill="#8CC56A"/><path d="M47 137q18-6 34 0t34-2v7h-68z" fill="#5FA34E"/>
      <path d="M53 106a4 4 0 0 1 7-3a5 5 0 0 1 9 2a3 3 0 0 1 0 6h-15a3 3 0 0 1 -1-5z" fill="#FFFDF5" opacity=".9"/><circle cx="104" cy="102" r="5" fill="#FFE27A"/>
      <path d="M81 93v50M46 118h70" stroke="${INK}" stroke-width="6"/><path d="M81 94v48M47 118h68" stroke="#B07A45" stroke-width="3"/><path d="M51 113l10-14M57 115l6-8M87 139l10-14" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>
      <path d="M36 86h15q-3 30 4 57q-11 4-20 0q4-28 1-57z" fill="url(#hf-cu)" ${ln(2.2)}/><path d="M41 92q-1 22 1 44M46 92q0 24 3 46" stroke="#8E2A24" stroke-width="1.2" fill="none" opacity=".6"/>
      <path d="M126 86h-15q3 30-4 57q11 4 20 0q-4-28-1-57z" fill="url(#hf-cu)" ${ln(2.2)}/><path d="M121 92q1 22-1 44M116 92q0 24-3 46" stroke="#8E2A24" stroke-width="1.2" fill="none" opacity=".6"/>
      <rect x="31" y="82" width="100" height="5" rx="2.5" fill="#7A4A26" ${ln(2)}/>
      <path d="M95 148l-2-10h14l-2 10z" fill="#D2733F" ${ln(2)}/><path d="M100 138q-6-8-2-13q4 5 2 13zM100 138q5-9 9-9q0 7-9 9z" fill="#5FA34E" ${ln(1.6)}/>
      <rect x="32" y="148" width="98" height="10" rx="3" fill="url(#hf-st)" ${ln(2.5)}/><path d="M36 151h90" stroke="#F0F2F5" stroke-width="1.5" stroke-linecap="round" opacity=".8"/><circle cx="50" cy="154" r="1" fill="#6E747C"/><circle cx="78" cy="155" r="1.2" fill="#6E747C"/><circle cx="112" cy="154" r="1" fill="#6E747C"/>`,
  },
  'hut-haken': {
    box: [148, 82, 56, 74],
    art: (n) => `<defs>${lg('hh-m', '#C4CAD3', '#5E646E')}</defs>
      <rect x="168" y="91" width="22" height="11" rx="3" fill="#5A3A1E" opacity=".22"/><rect x="165" y="87" width="22" height="11" rx="3" fill="url(#hh-m)" ${ln(2.2)}/><circle cx="170" cy="92.5" r="1.7" fill="#E6E9EE" ${ln(0.8)}/><circle cx="182" cy="92.5" r="1.7" fill="#E6E9EE" ${ln(0.8)}/>
      <path d="M180 98v10q0 7-5 7q-6 0-6-6" fill="none" ${ln(7)}/><path d="M180 98v10q0 7-5 7q-6 0-6-6" fill="none" stroke="#8C939C" stroke-width="3.6" stroke-linecap="round"/><path d="M181.2 100v7" stroke="#EEF1F5" stroke-width="1.2" stroke-linecap="round"/>
      ${n.tops ? `<path d="M175 114q-4 4 1 8" fill="none" stroke="#C8473B" stroke-width="2" stroke-linecap="round"/>${MONART.topSVG(TYPES.feuer.color, state.meta.top).replace('<svg ', '<svg x="152" y="104" width="48" height="48" ')}` : ''}`,
  },
  'hut-regal': {
    box: [234, 68, 112, 168],
    art: (
      n,
    ) => `<defs>${lg('hr-w', '#C68B55', '#8A5530', 1)}${lg('hr-b', '#5E3A1E', '#8E5E36')}${lg('hr-y', '#FFE27A', '#E0A82E')}</defs>
      ${shadow(289, 233, 58, 5)}<rect x="240" y="74" width="98" height="158" rx="3" fill="url(#hr-w)" ${ln(3)}/><rect x="248" y="80" width="82" height="146" fill="url(#hr-b)" ${ln(2)}/>
      <path d="M243 90v40M244 170v40M335 100v50M334 190v28" stroke="#6E4526" stroke-width="1.2" opacity=".5"/>
      ${[114, 156, 198].map((y) => `<rect x="248" y="${y + 7}" width="82" height="6" fill="${INK}" opacity=".2"/><rect x="246" y="${y}" width="86" height="7" rx="2" fill="#B98048" ${ln(2)}/><path d="M249 ${y + 2}h80" stroke="#E2B07A" stroke-width="1.2" stroke-linecap="round"/>`).join('')}
      <rect x="236" y="68" width="106" height="9" rx="3" fill="#9C6A3C" ${ln(2.5)}/><path d="M240 70.5h98" stroke="#D59E66" stroke-width="1.2" stroke-linecap="round"/>
      <rect x="252" y="84" width="18" height="30" rx="2" fill="#D94A3A" ${ln(2)}/><path d="M252 89h18M252 109h18" stroke="#FFC93C" stroke-width="2"/><circle cx="261" cy="99" r="3.5" fill="#FFC93C" ${ln(1.2)}/><path d="M254 86v26" stroke="#F08A78" stroke-width="1.4" stroke-linecap="round"/>
      <rect x="271" y="88" width="10" height="26" rx="2" fill="#3B7DD8" ${ln(2)}/><path d="M271 94h10" stroke="#BFD8F5" stroke-width="1.5"/><rect x="282" y="90" width="8" height="25" rx="2" fill="#4FA66A" ${ln(2)} transform="rotate(12 286 114)"/>${plaque(86, n.dex)}
      ${shadow(266, 155, 9, 1.6)}<path d="M266 155l-12-13h24z" fill="url(#hr-y)" ${ln(2)}/><ellipse cx="266" cy="142" rx="12" ry="4" fill="#FFE9A0" ${ln(2)}/><rect x="263" y="130" width="6" height="12" rx="2.5" fill="#E8483B" ${ln(1.8)}/>${plaque(127, n.tops)}
      <rect x="250" y="176" width="30" height="22" rx="2" fill="#E8DCC0" ${ln(2)} transform="rotate(-7 265 187)"/><rect x="254" y="174" width="30" height="22" rx="2" fill="#FFF7E6" ${ln(2)}/><path d="M259 181h20M259 186h20M259 191h12" stroke="#8A8FA3" stroke-width="1.6" stroke-linecap="round"/>${plaque(169, n.notes)}
      <path d="M256 226q-2-12 8-12q9 0 9 12z" fill="#8C939C" ${ln(2)}/><circle cx="262" cy="219" r="1.6" fill="#E07A3A"/><circle cx="267" cy="222" r="1.2" fill="#FFE27A"/><path d="M272 226q0-9 8-9q8 0 8 9z" fill="#A9AFB8" ${ln(2)}/><circle cx="281" cy="222" r="1.5" fill="#E07A3A"/>`,
  },
  'hut-bett': {
    box: [10, 190, 128, 86],
    art: () => `<defs>${lg('hb-w', '#BE824C', '#7E4E2A')}${lg('hb-m', '#F6E8C2', '#D8BC80')}${lg('hb-p', '#FFFDF5', '#E3DAC4')}${lg('hb-s', '#1C2541', '#1C2541')}
      <pattern id="hb-q" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#3B7DD8"/><rect width="6" height="12" fill="#2D63B4" opacity=".55"/><rect width="12" height="6" fill="#7AAEEB" opacity=".45"/><path d="M0 9h12M3 0v12" stroke="#FFF3D6" stroke-width=".8" opacity=".5"/></pattern></defs>
      ${shadow(76, 272, 64, 5)}<rect x="21" y="254" width="7" height="18" rx="2" fill="#6E4526" ${ln(2)}/><rect x="124" y="254" width="7" height="18" rx="2" fill="#6E4526" ${ln(2)}/>
      <path d="M14 270V205q0-9 9-9q9 0 9 9v65z" fill="url(#hb-w)" ${ln(3)}/><rect x="18" y="208" width="10" height="30" rx="3" fill="#8E5A30" stroke="#6E4526" stroke-width="1.4"/><circle cx="23" cy="197" r="4" fill="#9C6A3C" ${ln(2)}/>
      <rect x="30" y="228" width="98" height="14" rx="5" fill="url(#hb-m)" ${ln(2.5)}/><path d="M36 236l5-2M46 238l6-3M58 235l4 2" stroke="#C9A55E" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M34 226q-2-10 12-11q16-1 17 8q0 6-14 6q-13 0-15-3z" fill="url(#hb-p)" ${ln(2.2)}/><path d="M44 220q6 2 10 0" stroke="#C9BFA6" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <path d="M62 219q33-4 66 0v25q-34 6-66 0z" fill="url(#hb-q)" ${ln(2.5)}/><path d="M62 219q33-4 66 0v6q-33-4-66 0z" fill="#FFF3D6" ${ln(2)}/><path d="M63 238q32 5 64 0v6q-33 6-64 0z" fill="#1C2541" opacity=".18"/>
      <rect x="18" y="240" width="116" height="17" rx="3" fill="url(#hb-w)" ${ln(3)}/><path d="M24 245q30-2 52 1M84 251q20 2 44-1" stroke="#6E4526" stroke-width="1.2" fill="none" opacity=".55"/><path d="M22 243h108" stroke="#D9A066" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M125 268v-36q0-5 5-5q5 0 5 5v36z" fill="url(#hb-w)" ${ln(2.5)}/>`,
  },
  'hut-tisch': {
    box: [144, 160, 92, 118],
    art: () => `<defs>${lg('ht-w', '#C99158', '#8E5A30')}${lg('ht-t', '#E2AE70', '#BC834A')}${rg('ht-p', '#F3D48E', '#B88843')}
      <pattern id="ht-wv" width="8" height="6" patternUnits="userSpaceOnUse"><rect width="8" height="6" fill="#D2A458"/><path d="M0 3q2-3 4 0t4 0" stroke="#8E6A2C" stroke-width="1.1" fill="none"/><path d="M4 0v6" stroke="#B48A40" stroke-width=".8"/></pattern></defs>
      ${shadow(192, 274, 48, 5)}<path d="M158 224h8l-1 48h-6zM218 224h8l-1 48h-6z" fill="url(#ht-w)" ${ln(2.5)}/><rect x="164" y="252" width="56" height="5" rx="2" fill="#8E5A30" ${ln(2)}/>
      <path d="M170 190q22-34 44 0" fill="none" ${ln(6.5)}/><path d="M170 190q22-34 44 0" fill="none" stroke="#C99A4E" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M205 186l9-18" ${ln(3.5)}/><path d="M205 186l9-18" stroke="#E3B341" stroke-width="1.6" stroke-linecap="round"/>${[0, 1, 2, 3].map((i) => `<ellipse cx="${214 - i * 1.6 + (i % 2 ? 2.4 : -2.4)}" cy="${167 + i * 3.4}" rx="2.2" ry="3" fill="#EAC25A" ${ln(1)}/>`).join('')}
      <ellipse cx="178" cy="184" rx="10" ry="7" fill="url(#ht-p)" ${ln(2)}/><ellipse cx="196" cy="181" rx="10" ry="7" fill="url(#ht-p)" ${ln(2)}/><ellipse cx="208" cy="186" rx="8" ry="6" fill="url(#ht-p)" ${ln(2)}/><circle cx="175" cy="182" r="1.1" fill="#8A6030"/><circle cx="199" cy="179" r="1.1" fill="#8A6030"/><ellipse cx="192" cy="178" rx="3" ry="1.5" fill="#FFF7E0" opacity=".6"/>
      <path d="M164 189h56l-6 24h-44z" fill="url(#ht-wv)" ${ln(2.5)}/><path d="M168 205h48l-2 8h-44z" fill="${INK}" opacity=".15"/><rect x="162" y="185" width="60" height="7" rx="3.5" fill="#C99A4E" ${ln(2.2)}/><path d="M166 187h52" stroke="#EBCB85" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M148 216l4-6h80l4 6z" fill="url(#ht-t)" ${ln(2.5)}/><rect x="148" y="216" width="88" height="9" rx="2" fill="url(#ht-w)" ${ln(2.5)}/><path d="M156 220h30M196 221h32" stroke="#6E4526" stroke-width="1.1" opacity=".5"/>`,
  },
};
const ROOF = `<path d="M170 40L148 230h68L190 40z" fill="#FFF3C4" opacity=".22"/><circle cx="180" cy="28" r="16" fill="#9C6A3C" ${ln(2.5)}/><circle cx="180" cy="28" r="11" fill="url(#hu-sky)" ${ln(2)}/><path d="M169 28h22M180 17v22" stroke="${INK}" stroke-width="4.5"/><path d="M169.5 28h21M180 17.5v21" stroke="#B07A45" stroke-width="2"/><path d="M172 24l4-5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
const HUT_DEFS = `<defs>${lg('hu-log', '#EDD6A6', '#CDAA70')}${lg('hu-gab', '#8E5E36', '#6A4224')}${lg('hu-beam', '#A87442', '#6E4526')}${lg('hu-post', '#8E5E36', '#B07A45', 1)}${lg('hu-fl', '#BC8654', '#8E5E36')}${lg('hu-sky', '#8FCDF2', '#D9F0EE')}${lg('hu-sk', '#1C2541', '#1C2541')}
    <radialGradient id="hu-light" cx=".3" cy=".25" r=".85"><stop offset="0" stop-color="#FFF4D6" stop-opacity=".55"/><stop offset=".6" stop-color="#FFF4D6" stop-opacity="0"/><stop offset="1" stop-color="#5A3A1E" stop-opacity=".25"/></radialGradient>
    <linearGradient id="hu-sb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C2541" stop-opacity=".25"/><stop offset="1" stop-color="#1C2541" stop-opacity="0"/></linearGradient>
    <pattern id="hu-logs" width="180" height="52" patternUnits="userSpaceOnUse" y="48"><rect width="180" height="52" fill="url(#hu-log)"/><rect y="26" width="180" height="26" fill="#E6CB94"/><rect y="39" width="180" height="13" fill="#CDAA70" opacity=".5"/>
      <path d="M0 25h180M0 51h180" stroke="#9C7444" stroke-width="2"/><path d="M0 2h180M0 28h180" stroke="#F8E8C4" stroke-width="1.4"/><path d="M14 10q30-3 60 1M100 16q30 2 64-1M30 36q40 3 80-1M130 44q20-2 44 0" stroke="#C49B63" stroke-width="1.1" fill="none"/><ellipse cx="88" cy="13" rx="4" ry="2" fill="none" stroke="#B48A55" stroke-width="1.1"/><ellipse cx="152" cy="38" rx="3" ry="1.6" fill="none" stroke="#B48A55" stroke-width="1.1"/></pattern></defs>`;
const shelfNums = (): ShelfNums => ({
  dex: Object.keys(state.meta.dex).length,
  tops: Object.keys(state.meta.owned).filter((k) => k.startsWith('top-')).length,
  notes: Object.keys(state.meta.know).length,
});
const furnPreview = (id: string) => {
  const [x, y, w, h] = FURN[id].box;
  return `<svg class="rwprev furn" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true">${FURN[id].art(shelfNums())}</svg>`;
};
// room 1 shows a dashed place for every piece not built yet; hut.items are the pieces moved to room 2
function hutSVG(room: number) {
  const n = shelfNums();
  const here = Object.keys(FURN).filter(
    (id) => state.meta.owned[id] && (room === 2) === (state.meta.hut.rooms >= 2 && state.meta.hut.items.includes(id)),
  );
  const gaps = room === 1 ? Object.keys(FURN).filter((id) => !state.meta.owned[id]) : [];
  const label = here.length
    ? 'Im Zimmer: ' + here.map((id) => RECIPES.find((r) => r.id === id)!.name).join(', ')
    : 'Das Zimmer ist leer';
  return `<svg class="hutroom" viewBox="0 0 360 290" role="img" aria-label="${esc(label)}">${HUT_DEFS}
      <rect y="48" width="360" height="182" fill="url(#hu-logs)"/><rect width="360" height="48" fill="url(#hu-gab)"/>${[30, 75, 120, 240, 285, 330].map((x) => `<path d="M${x} 0V48" stroke="#4E3018" stroke-width="1.6"/>`).join('')}<path d="M180 6V48" stroke="#4E3018" stroke-width="5"/><path d="M0 48L180 4L360 48" fill="none" stroke="#4E3018" stroke-width="9" stroke-linejoin="round"/><path d="M0 44L180 1L360 44" fill="none" stroke="#B07A45" stroke-width="2"/>
      <rect y="230" width="360" height="60" fill="url(#hu-fl)"/>${[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => `<path d="M${180 + i * 30} 230L${180 + i * 42} 290" stroke="#7A4E2D" stroke-width="1.6"/>`).join('')}<path d="M40 250l14 1M120 268l18 1M228 246l12 0M290 272l20 1M70 282l16 0" stroke="#7A4E2D" stroke-width="1.1" opacity=".6"/>
      <rect y="233" width="360" height="10" fill="url(#hu-sb)"/><ellipse cx="190" cy="266" rx="78" ry="15" fill="#C8473B" ${ln(2.5)}/><ellipse cx="190" cy="266" rx="64" ry="11.5" fill="#E3B341"/><ellipse cx="190" cy="266" rx="48" ry="8.5" fill="#3B7DD8"/><ellipse cx="190" cy="266" rx="31" ry="5.5" fill="#F2E2BC"/>${[74, 57, 40].map((r) => `<ellipse cx="190" cy="266" rx="${r}" ry="${r * 0.19}" fill="none" stroke="#1C2541" stroke-width="1.2" stroke-dasharray="2 3" opacity=".3"/>`).join('')}
      <rect y="224" width="360" height="8" fill="#8E5E36" stroke="#5E3A1E" stroke-width="1.5"/><path d="M0 225.5h360" stroke="#C99158" stroke-width="1.2"/>
      <rect y="42" width="360" height="12" fill="url(#hu-beam)" ${ln(2.5)}/><path d="M20 46q60-2 120 1M200 50q70 2 140-1" stroke="#5E3A1E" stroke-width="1.1" fill="none" opacity=".6"/><circle cx="60" cy="48" r="2" fill="#4E3018"/><circle cx="300" cy="48" r="2" fill="#4E3018"/>
      <rect x="-2" y="54" width="12" height="176" fill="url(#hu-post)" ${ln(2)}/><rect x="350" y="54" width="12" height="176" fill="url(#hu-post)" ${ln(2)}/>
      <rect width="360" height="290" fill="url(#hu-light)"/>
      ${room === 1 && state.meta.owned['hut-dachfenster'] ? ROOF : ''}${gaps
        .map((id) => {
          const [x, y, w, h] = FURN[id].box;
          return `<rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="10" fill="#FFF7E6" fill-opacity=".55" stroke="#8A6A30" stroke-width="2.5" stroke-dasharray="7 6"/><text x="${x + w / 2}" y="${y + 30}" text-anchor="middle" font-size="15" font-weight="700" fill="#6B4A22">${RECIPES.find((r) => r.id === id)!.place}</text>`;
        })
        .join('')}${here.map((id) => FURN[id].art(n)).join('')}</svg>`;
}
export function screenHut() {
  state.depth = 1;
  const two = state.meta.hut.rooms >= 2;
  const n = shelfNums();
  const built = Object.keys(FURN).filter((id) => state.meta.owned[id]);
  const name = (id: string) => RECIPES.find((r) => r.id === id)!.name;
  screen(
    html`<div class="screen">${raw(topbar('Meine Hütte'))}<div class="scroll"><div class="stack">
      ${two ? html`<h3>Erstes Zimmer</h3>` : ''}${raw(hutSVG(1))}${two ? html`<h3>Zweites Zimmer</h3>${raw(hutSVG(2))}` : ''}
      <div class="card">${built.length ? '' : html`<p>Noch ist deine Hütte leer. Möbel baust du an der Werkbank im Stempelheft.</p>`}${state.meta.owned['hut-regal'] ? html`<p>Im Regal: ${n.dex} im Monsterbuch, ${n.tops} Kreiselteile, ${n.notes} Notizkarten.</p>` : ''}
      ${built.length && built.length < 5 ? html`<p class="pnote">Die gestrichelten Plätze warten noch auf Möbel von der Werkbank.</p>` : ''}${two ? '' : html`<p class="pnote">Ein zweites Zimmer gibt es im Stempelheft für 30 Stempel und 12 Stein.</p>`}${state.meta.owned['hut-dachfenster'] ? '' : html`<p class="pnote">Wer Zahlenquest durch alle drei Welten gewinnt, bekommt ein Dachfenster.</p>`}</div>
      <div class="row"><button class="btn ghost" id="bench" data-action="bench">Zur Werkbank</button>${extraOn('garten') ? html`<button class="btn ghost" id="garden" data-action="garden">Schulgarten</button>` : ''}</div>
      ${two && built.length ? html`<div class="card"><h3>Umräumen</h3><div class="stack">${built.map((id) => html`<button class="btn small secondary" data-action="move" data-move="${id}">${name(id)} ins ${state.meta.hut.items.includes(id) ? 'erste' : 'zweite'} Zimmer</button>`)}</div></div>` : ''}
      </div></div><div class="bottom"><button class="btn secondary" id="back" data-action="back">Zurück</button></div></div>`,
    {
      back: screenTitle,
      bench: () => screenStamps(true),
      garden: screenGarden,
      move: (button) => {
        const id = button.dataset.move!;
        const h = state.meta.hut;
        h.items = h.items.includes(id) ? h.items.filter((x) => x !== id) : h.items.concat(id);
        saveAll();
        screenHut();
      },
    },
  );
}
export function screenWardrobe(heroId?: string) {
  state.depth = 2;
  const heroes = allHeroes();
  const hero =
    heroes.find((s) => s.id === heroId) || heroes.find((s) => s.id === state.meta.lastStarter[state.mode]) || heroes[0];
  const worn = wornBy(hero.id);
  const tile = (o: Outfit) => {
    const has = hasOutfit(o);
    const act =
      o.id === worn
        ? html`<button class="btn small secondary" data-action="off" data-off="${o.id}">Ablegen</button>`
        : has
          ? html`<button class="btn small" data-action="wear" data-wear="${o.id}">Anziehen</button>`
          : o.price
            ? html`<button class="btn small" data-action="buy" data-buy="${o.id}" ${state.meta.stamps < o.price ? 'disabled' : ''}>Holen · ${o.price} 🏷️</button>`
            : html`<div class="desc">${o.need!()}</div>`;
    return html`<div class="kkitem${o.id === worn ? ' on' : ''}${has ? '' : ' locked'}">${raw(monsterSVG(hero.shape, 0, '', { outfit: o.id }))}<div class="name">${o.name}</div>${act}</div>`;
  };
  const wear = (id: string | null | undefined) => {
    if (id) state.meta.worn[hero.id] = id;
    else delete state.meta.worn[hero.id];
    saveAll();
    screenWardrobe(hero.id);
  };
  screen(
    html`<div class="screen">${raw(topbar('Kleiderkammer'))}<div class="scroll"><div class="stack">
      <div class="card center kkcard">${raw(heroSVG(hero, 0))}<div class="name">${hero.names[0]}</div>${showcase() === hero ? html`<span class="pill good">Auf der Startseite</span>` : html`<button class="btn small secondary" id="showcase" data-action="showcase">Auf der Startseite zeigen</button>`}<p>🏷️ ${state.meta.stamps} Stempel</p><p class="pnote">Kleidung ändert nichts am Kampf. Jeder Held trägt ein Teil.</p></div>
      ${heroes.length > 1 ? html`<div class="kkpick" role="group" aria-label="Held wählen">${heroes.map((s) => html`<button class="kkhero${s === hero ? ' on' : ''}" data-action="hero" data-hero="${s.id}" aria-pressed="${String(s === hero)}" aria-label="${s.names[0]}">${raw(heroSVG(s, 0))}</button>`)}</div>` : ''}
      <div class="kkgrid">${OUTFITS.map(tile)}</div>
      </div></div><div class="bottom"><button class="btn secondary" id="back" data-action="back">Zurück</button></div></div>`,
    {
      back: () => screenStamps(),
      hero: (button) => screenWardrobe(button.dataset.hero),
      showcase: () => {
        state.meta.showcase = hero.id;
        saveAll();
        screenWardrobe(hero.id);
      },
      wear: (button) => wear(button.dataset.wear),
      off: () => wear(null),
      buy: (button) => {
        // only pieces with a price have a button
        const o = OUTFITS.find((x) => x.id === button.dataset.buy) as Outfit & { price: number };
        const ov = modal(
          html`<h2>${o.name} holen?</h2><p>Das kostet ${o.price} Stempel. Danach hast du noch ${state.meta.stamps - o.price}.</p><div class="stack"><button class="btn" id="yes" data-action="yes">Holen und anziehen</button><button class="btn secondary" id="no" data-action="no">Zurück</button></div>`,
          {
            no: () => ov.remove(),
            yes: () => {
              if (!hasOutfit(o) && state.meta.stamps >= o.price) {
                state.meta.stamps -= o.price;
                state.meta.owned['outfit-' + o.id] = true;
                state.meta.progressAt = new Date().toISOString();
                state.meta.worn[hero.id] = o.id;
              }
              saveAll();
              screenWardrobe(hero.id);
            },
          },
        );
      },
    },
  );
}
// a Kreisel part and how it is got: bought, from a chest of that world, or from the first ore
export interface TopPart {
  id: string;
  name: string;
  val: number;
  price?: number;
  chest?: number;
  mine?: boolean;
}
export const partOf = (key: string) => {
  const [, slot, id] = key.split('-') as [string, TopSlot, string];
  const p = TOP[slot] && TOP[slot].find((x) => x.id === id);
  return p ? Object.assign({ slot }, p) : null;
};
// a function: TOP_KNOCK comes from battle.ts, which is not ready yet when this module loads
const topRows = (): [TopSlot, string, string, string][] => [
  ['tip', 'Spitze', 'Wucht', 'So viel Schwung verliert der andere Kreisel bei jeder richtigen Antwort.'],
  ['ring', 'Ring', 'Panzer', `Bei einer falschen Antwort verliert dein Kreisel ${TOP_KNOCK} Schwung minus Panzer.`],
  ['disc', 'Scheibe', 'Schwung', 'Mit so viel Schwung startet dein Kreisel in die Arena.'],
];
export function screenTop() {
  state.depth = 2;
  const s = CFG().starters.find((x) => x.id === state.meta.lastStarter[state.mode]) || CFG().starters[0];
  const color = TYPES[s.type].color;
  const need = (p: TopPart) =>
    p.chest
      ? `Liegt in einer Truhe in Welt ${p.chest}${p.chest > 2 ? ' von Zahlenquest' : ''}.`
      : 'Finde Erz im Bergwerk in Zahlenquest oder auf der Baustelle.';
  const tile = (slot: TopSlot, label: string, p: TopPart) => {
    const on = state.meta.top[slot] === p.id,
      has = hasPart(slot, p.id);
    const act = on
      ? html`<div class="rwhave">✔ Eingebaut</div>`
      : has
        ? html`<button class="btn small" data-action="fit" data-fit="${slot}:${p.id}">Einbauen</button>`
        : p.price
          ? html`<button class="btn small" data-action="buy" data-buy="${slot}:${p.id}" ${state.meta.stamps < p.price ? 'disabled' : ''}>Holen · ${p.price} 🏷️</button>`
          : html`<div class="desc">${need(p)}</div>`;
    return html`<div class="kkitem${on ? ' on' : ''}${has ? '' : ' locked'}">${raw(MONART.topSVG(color, Object.assign({}, state.meta.top, { [slot]: p.id })))}<div class="name">${p.name}</div><div class="partval">${label} ${p.val}</div>${act}</div>`;
  };
  const again = () => {
    const y = $('.scroll').scrollTop;
    screenTop();
    $('.scroll').scrollTop = y;
  };
  screen(
    html`<div class="screen">${raw(topbar('Kreisel bauen'))}<div class="scroll"><div class="stack">
      <div class="card center kkcard">${raw(MONART.topSVG(color, state.meta.top, 'live'))}<p class="topvals"><span>💥 Wucht ${topVal('tip')}</span><span>🛡️ Panzer ${topVal('ring')}</span><span>🌀 Schwung ${topVal('disc')}</span></p><p>🏷️ ${state.meta.stamps} Stempel</p><p class="pnote">Mit diesem Kreisel trittst du in der Kreisel-Arena an. Er hat den Typ deines Helden.</p></div>
      ${topRows().map(([slot, title, label, text]) => html`<div><h3>${title}: ${label}</h3><p class="toptext">${text}</p><div class="kkgrid topgrid">${TOP[slot].map((p) => tile(slot, label, p))}</div></div>`)}
      </div></div><div class="bottom"><button class="btn secondary" id="back" data-action="back">Zurück</button></div></div>`,
    {
      back: screenStamps as () => void, // the button it is handed counts as jump
      fit: (button) => {
        const [slot, id] = button.dataset.fit!.split(':') as [TopSlot, string];
        state.meta.top[slot] = id;
        saveAll();
        again();
      },
      buy: (button) => {
        const [slot, id] = button.dataset.buy!.split(':') as [TopSlot, string];
        // only parts with a price have a button
        const p = TOP[slot].find((x) => x.id === id) as TopPart & { price: number };
        const ov = modal(
          html`<h2>${p.name} holen?</h2><p>Das kostet ${p.price} Stempel. Danach hast du noch ${state.meta.stamps - p.price}.</p><div class="stack"><button class="btn" id="yes" data-action="yes">Holen und einbauen</button><button class="btn secondary" id="no" data-action="no">Zurück</button></div>`,
          {
            no: () => ov.remove(),
            yes: () => {
              if (!hasPart(slot, id) && state.meta.stamps >= p.price) {
                state.meta.stamps -= p.price;
                state.meta.owned[`top-${slot}-${id}`] = true;
                state.meta.progressAt = new Date().toISOString();
                state.meta.top[slot] = id;
                saveAll();
              }
              ov.remove();
              again();
            },
          },
        );
      },
    },
  );
}
