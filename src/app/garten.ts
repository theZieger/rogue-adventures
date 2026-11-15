import { MK } from '../knowledge.ts';
import { html, raw } from '../ui/html.ts';
import { $ } from './core.ts';
import { giveStamps, markWeek, stampLine } from './progress.ts';
import { state } from './state.ts';
import { saveAll } from './storage.ts';
import { INK, lg, ln, r1, rg, shadow } from './tasks.ts';
import { screenTitle } from './title.ts';
import { SFX, modal, screen, topbar } from './ui.ts';

/* ---------- Schulgarten ---------- */
const DAY = 864e5;
// tests set window.__mq.now; a clock set back or forward only changes what grows, nothing is lost
const clock = () => (Number.isFinite(window.__mq && window.__mq.now) ? window.__mq.now! : Date.now());
const bedDays = (b: { plantedAt: number }) => Math.max(0, Math.floor((clock() - b.plantedAt) / DAY));
const bedPhase = (b: { crop: string | null; plantedAt: number }) => {
  const d = bedDays(b);
  return d >= 7 ? 3 : d >= 5 ? 2 : d >= 2 ? 1 : 0;
};
// bed 4 is the reward for winning the Kartoffel-Werkstatt (owned['beet-4'], set in screenVictory)
const bedOpen = (i: number) => i < 3 || !!state.meta.owned['beet-4'];
const ripeBeds = () => state.meta.garden.beds.filter((b, i) => b.crop && bedOpen(i) && bedPhase(b) === 3);
export function gardenCard() {
  const r = ripeBeds();
  if (!r.length) return '';
  const crops = [...new Set(r.map((b) => b.crop!))];
  return `<div class="card gardencard"><p>${crops.length === 1 ? MK.CROPS[crops[0]].ripe : 'Im Schulgarten ist etwas reif.'}</p><button class="btn small" id="harvest">Ernten</button></div>`;
}
const PG_DEFS = `<defs>${lg('pg-soil', '#9A6640', '#6B4226')}${lg('pg-bd', '#C68B55', '#8A5530')}${lg('pg-lv', '#8DD16A', '#3E9640')}${lg('pg-dry', '#E6CE70', '#A8892E')}${rg('pg-tb', '#F3D48E', '#B88843')}</defs>`;
const gLeaf = (x: number, y: number, rx: number, ry: number, a: number, f: string) =>
  `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0Q${rx * 0.4} ${-ry * 1.5} ${rx * 2} 0Q${rx * 0.4} ${ry * 1.5} 0 0Z" fill="${f}" ${ln(1.1)}/><path d="M1 0H${rx * 1.6}" stroke="${INK}" stroke-width=".6" opacity=".45"/></g>`;
const gTuber = (x: number, y: number) =>
  `<ellipse cx="${x}" cy="${y}" rx="6" ry="4.2" fill="url(#pg-tb)" ${ln(1.5)}/><circle cx="${x + 2}" cy="${y + 1}" r=".8" fill="#8A6030"/><ellipse cx="${x - 2}" cy="${y - 1.6}" rx="2" ry="1" fill="#FFF7E0" opacity=".6"/>`;
const gStalk = (x: number, top: any, c: string) =>
  `<path d="M${x} 61V${top}" ${ln(3)}/><path d="M${x} 61V${top}" stroke="${c}" stroke-width="1.4" stroke-linecap="round"/>`;
const CROP_EAR = {
  weizen: (x: number, t: number, c: any) =>
    [5, 4, 3, 2, 1, 0]
      .map((j) => {
        const y = t + 3 + j * 2.4;
        return `<ellipse cx="${x - 1.7}" cy="${y}" rx="1.9" ry="2.6" transform="rotate(-20 ${x - 1.7} ${y})" fill="${c}"/><ellipse cx="${x + 1.7}" cy="${y}" rx="1.9" ry="2.6" transform="rotate(20 ${x + 1.7} ${y})" fill="${c}"/>`;
      })
      .join('') + `<ellipse cx="${x}" cy="${t + 1.5}" rx="1.6" ry="2.4" fill="${c}"/>`,
  roggen: (x: number, t: number, c: any) =>
    [6, 5, 4, 3, 2, 1, 0]
      .map((j) => {
        const y = t + 3 + j * 2.1;
        return `<path d="M${x - 1.2} ${y - 1}L${x - 3.5} ${y - 10}M${x + 1.2} ${y - 1}L${x + 3.5} ${y - 10}" stroke="#8A6A2A" stroke-width=".7" stroke-linecap="round"/><ellipse cx="${x - 1.2}" cy="${y}" rx="1.3" ry="2.1" fill="${c}"/><ellipse cx="${x + 1.2}" cy="${y}" rx="1.3" ry="2.1" fill="${c}"/>`;
      })
      .join(''),
  hafer: (x: number, t: number, c: any) =>
    `<path d="M${x} ${t + 18}V${t}" stroke="${INK}" stroke-width="1" stroke-linecap="round"/>` +
    [0, 1, 2, 3]
      .map((j) => {
        const y = t + 2 + j * 4,
          s = j % 2 ? 1 : -1;
        return `<path d="M${x} ${y}q${s * 4} 0 ${s * 6} 4" fill="none" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/><ellipse cx="${x + s * 6}" cy="${y + 7}" rx="1.7" ry="3.1" transform="rotate(${s * -12} ${x + s * 6} ${y + 7})" fill="${c}"/>`;
      })
      .join('') +
    `<ellipse cx="${x + 1}" cy="${t + 3}" rx="1.5" ry="2.8" fill="${c}"/>`,
};
const CROP_TOPS = { weizen: [24, 20, 17, 21, 25], roggen: [18, 14, 12, 15, 19], hafer: [22, 18, 15, 19, 23] };
function plantSVG(crop: string | null, ph: number) {
  const ripe = ph === 3;
  const lf = ripe ? 'url(#pg-dry)' : 'url(#pg-lv)';
  const stalk = ripe ? '#D9B04A' : '#5DA34A';
  const ear = ripe ? '#EBC254' : '#A6D879';
  let p = '';
  if (!crop)
    p =
      '<path d="M9 60Q40 57 71 60M12 63Q40 60 68 63" fill="none" stroke="#4A2C18" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>';
  else if (ph === 0)
    p =
      crop === 'kartoffel'
        ? `<ellipse cx="40" cy="60" rx="13" ry="3.6" fill="#4A2C18"/><g transform="translate(40 56.5) scale(1.35) translate(-40 -56.5)">${gTuber(40, 56.5)}</g><circle cx="35.5" cy="52" r="1.5" fill="#B86A9A" ${ln(0.6)}/><circle cx="44" cy="51.6" r="1.2" fill="#B86A9A" ${ln(0.6)}/><path d="M24 63Q30 59 34 60.5L46 60.5Q50 59 56 63Z" fill="url(#pg-soil)" ${ln(1.4)}/>`
        : `<path d="M9 60Q40 57 71 60" fill="none" stroke="#4A2C18" stroke-width="2.4" stroke-linecap="round"/>${[16, 26, 36, 46, 56, 66].map((x) => `<ellipse cx="${x}" cy="${58.6 + Math.abs(x - 40) / 25}" rx="2.3" ry="1.5" fill="#E8C97A" ${ln(0.8)}/>`).join('')}`;
  else if (ph === 1)
    p =
      crop === 'kartoffel'
        ? `<path d="M40 61Q39 53 40 46" ${ln(3.4)}/><path d="M40 61Q39 53 40 46" stroke="#5DA34A" stroke-width="1.8" stroke-linecap="round"/>${gLeaf(39, 50, 6, 3.6, -160, lf)}${gLeaf(41, 49, 6, 3.6, -20, lf)}${gLeaf(40, 47, 5, 3.2, -95, lf)}${gLeaf(39, 55, 4.5, 2.8, 170, lf)}`
        : [16, 28, 40, 52, 64]
            .map(
              (x, i) =>
                `<path d="M${x - 2} 61Q${x - 2} 52 ${x - 3.5} ${44 + (i % 2) * 3}Q${x + 1.5} 52 ${x + 1} 61Z" fill="${lf}" ${ln(0.9)}/><path d="M${x} 61Q${x + 1} 53 ${x + 5} ${48 + (i % 2) * 2}Q${x + 3} 55 ${x + 2.4} 61Z" fill="${lf}" ${ln(0.9)}/>`,
            )
            .join('');
  else if (crop === 'kartoffel') {
    const d = ripe ? 30 : 0;
    p = `<path d="M40 61V30M40 46L26 38M40 40L53 31M40 52L24 50M40 50L56 46" ${ln(3.2)}/><path d="M40 61V30M40 46L26 38M40 40L53 31M40 52L24 50M40 50L56 46" stroke="${stalk}" stroke-width="1.6" stroke-linecap="round"/>`;
    p += [
      [26, 38, -160],
      [53, 31, -20],
      [40, 30, -90],
      [24, 50, -175],
      [56, 46, -5],
      [32, 43, -130],
      [47, 37, -50],
      [33, 33, -120],
      [49, 51, 20],
      [31, 53, 160],
      [45, 27, -60],
    ]
      .map(([x, y, a]) => gLeaf(x, y, 6.5, 4.5, a + (a < -90 ? -d : d), lf))
      .join('');
    p += ripe
      ? `<circle cx="29" cy="40" r="1" fill="#8A6A2A"/><circle cx="51" cy="35" r="1" fill="#8A6A2A"/>${gTuber(22, 61)}${gTuber(57, 61.5)}${gTuber(39, 63)}`
      : [
          [34, 22, 3.6],
          [46, 21, 3.6],
          [40, 18, 2.8],
        ]
          .map(
            ([x, y, r]) =>
              `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cy="${-r * 0.55}" rx="${r * 0.5}" ry="${r * 0.62}" transform="rotate(${a})" fill="#F7F1FF" ${ln(0.8)}/>`).join('')}<circle r="${r * 0.32}" fill="#F5C93F" ${ln(0.6)}/></g>`,
          )
          .join('');
  } else
    p = CROP_TOPS[crop]
      .map((t: number, i: number) => {
        const x = 16 + i * 12,
          s = i % 2 ? 1 : -1;
        return `${gStalk(x, t + 6, stalk)}<path d="M${x} 50q${s * 5} -4 ${s * 10} -1q${s * -5} -1 ${s * -10} 4z" fill="${lf}" ${ln(0.9)}/><g stroke="${INK}" stroke-width=".75">${CROP_EAR[crop](x, t, ear)}</g>`;
      })
      .join('');
  return r1(`<svg class="plant-art" viewBox="0 0 80 80" aria-hidden="true">${PG_DEFS}${shadow(40, 76.5, 37, 3)}<path d="M4 64Q4 55 16 55H64Q76 55 76 64Z" fill="url(#pg-soil)" ${ln(2)}/><circle cx="12" cy="59" r=".9" fill="#C99A70"/><circle cx="31" cy="57.5" r=".8" fill="#C99A70"/><circle cx="62" cy="58" r=".9" fill="#C99A70"/><circle cx="50" cy="62" r=".8" fill="#3E2414"/><circle cx="21" cy="62" r=".8" fill="#3E2414"/>${p}
      <rect x="3" y="63" width="74" height="13" rx="3" fill="url(#pg-bd)" ${ln(2)}/><path d="M6 65.5h68" stroke="#E2B07A" stroke-width="1" stroke-linecap="round"/><path d="M10 70q18-2 32 0M46 73q12 1 24-1" stroke="#6E4526" stroke-width=".8" fill="none" opacity=".6"/><circle cx="7.5" cy="69.5" r="1" fill="#5E646E"/><circle cx="72.5" cy="69.5" r="1" fill="#5E646E"/></svg>`);
}
export function screenGarden() {
  state.depth = 1;
  const bed = (b: { crop: string | number }, i: unknown) => {
    if (!bedOpen(i))
      return html`<div class="bed locked"><div class="bedart" aria-hidden="true">🔒</div><div class="bedname">Beet ${i + 1}</div><div class="beddesc">Gewinne die Kartoffel-Werkstatt, dann gehört dir dieses Beet.</div></div>`;
    if (!b.crop)
      return html`<div class="bed">${raw(plantSVG(null, 0))}<div class="bedname">Beet ${i + 1}</div><div class="beddesc">Noch leer.</div><button class="btn small" data-action="plant" data-plant="${i}">Pflanzen</button></div>`;
    const c = MK.CROPS[b.crop];
    const ph = bedPhase(b);
    const d = bedDays(b);
    return html`<div class="bed${ph === 3 ? ' ripe' : ''}">${raw(plantSVG(b.crop, ph))}<div class="bedname">${c.name}</div><div class="beddesc">${ph === 3 ? 'Reif' : d ? html`${[c.put, 'Keimling', c.top][ph]}<br>Tag ${d} von 7` : `Heute ${c.put.toLowerCase()}`}</div>${ph === 3 ? html`<button class="btn small" data-action="harvest" data-harvest="${i}">Ernten</button>` : ''}</div>`;
  };
  const got = Object.keys(MK.CROPS)
    .filter((k) => state.meta.materials[k])
    .map((k) => `${MK.CROPS[k].name} ${state.meta.materials[k]}`);
  screen(
    html`<div class="screen">${raw(topbar('Schulgarten'))}<div class="scroll"><div class="stack">
      <div class="card"><p>Beete wachsen auch, wenn du Pause machst. Nach 7 Tagen kannst du ernten. Für jede Ernte gibt es 4 Stempel.</p>${got.length ? html`<p class="pnote">Schon geerntet: ${got.join(' · ')}</p>` : ''}</div>
      <div class="beds">${state.meta.garden.beds.map(bed)}</div>
      </div></div><div class="bottom"><button class="btn secondary" id="back" data-action="back">Zurück</button></div></div>`,
    {
      back: screenTitle,
      plant: (button) => plantDialog(+button.dataset.plant!),
      harvest: (button) => harvest(+button.dataset.harvest!),
    },
  );
}
function plantDialog(i: number) {
  const ov = modal(
    html`<h2>Was pflanzt du in Beet ${i + 1}?</h2><div class="stack">${Object.entries(MK.CROPS).map(
      ([k, c]) =>
        html`<button class="choice cropchoice" data-action="plant" data-crop="${k}">${raw(plantSVG(k, 3))}<div class="meta"><div class="name">${c.name}</div><div class="desc">${c.desc}</div></div></button>`,
    )}<button class="btn secondary" id="no" data-action="no">Zurück</button></div>`,
    {
      no: () => ov.remove(),
      plant: (choice) => {
        state.meta.garden.beds[i] = { crop: choice.dataset.crop!, plantedAt: clock() };
        markWeek();
        saveAll();
        screenGarden();
      },
    },
  );
}
function harvest(i: number) {
  const b = state.meta.garden.beds[i];
  if (!b.crop || bedPhase(b) !== 3 || !bedOpen(i)) return screenGarden();
  const c = MK.CROPS[b.crop];
  const t = MK.gardenQuestion(b.crop);
  const ov = modal(
    html`<h2>${c.name} ernten</h2><p>Erst eine Frage zur Pflanze:</p><div class="question">${t.q}</div><div class="options" style="margin-top:12px">${t.options.map((o, k) => html`<button class="opt" data-action="answer" data-i="${k}">${o}</button>`)}</div><div id="hfb" role="status" aria-live="polite"></div>`,
    {
      answer: (chosen) => {
        const ok = t.options[+chosen.dataset.i!] === t.answer;
        const first = !state.meta.owned['outfit-aehrenkranz'];
        // the harvest pays either way: the question is for learning, not a gate
        state.meta.garden.beds[i] = { crop: null, plantedAt: 0 };
        state.meta.materials[b.crop!] = (state.meta.materials[b.crop!] || 0) + 1;
        giveStamps(4);
        state.meta.owned['outfit-aehrenkranz'] = true;
        state.meta.progressAt = new Date().toISOString();
        markWeek();
        saveAll();
        if (ok) SFX.right();
        else SFX.wrong();
        ov.querySelectorAll<HTMLButtonElement>('.opt').forEach((o) => {
          o.disabled = true;
          if (t.options[+o.dataset.i!] === t.answer) o.classList.add('right');
          else if (o === chosen) o.classList.add('wrong');
        });
        $('#hfb', ov).innerHTML =
          html`${ok ? html`<div class="feedback good">Richtig! ✔</div>` : html`<div class="feedback bad">Daneben<small>Richtig wäre: ${t.answer}</small></div>`}<p>Du hast ${c.name} geerntet.</p>${raw(stampLine(4))}${first ? html`<p>Das war deine erste Ernte. Dafür bekommst du den Ährenkranz für die Kleiderkammer.</p>` : ''}<button class="btn" id="hnext" data-action="next">Weiter</button>`.text;
        $('#hnext', ov).focus();
      },
      next: screenGarden,
    },
  );
}
