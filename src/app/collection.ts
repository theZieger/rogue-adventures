import { type Foe, MODES, MODE_KEYS } from '../curriculum.ts';
import { MQ } from '../logic.ts';
import { MONART } from '../monsters.ts';
import { html, raw } from '../ui/html.ts';
import { $, CFG, TYPES } from './core.ts';
import { benchHtml, screenCraft, screenTop, screenWardrobe } from './huette.ts';
import { screenStarter } from './map.ts';
import {
  REWARDS,
  type Reward,
  canBuy,
  giveStamps,
  heroName,
  heroSVG,
  heroSpec,
  monsterSVG,
  owns,
  stampLine,
  typeChip,
} from './progress.ts';
import { state } from './state.ts';
import { endRun, extraOn, saveAll } from './storage.ts';
import { sayCard } from './tasks.ts';
import { screenTitle } from './title.ts';
import { SFX, modal, screen, topbar } from './ui.ts';

/* ---------- End screens ---------- */
export function screenGameOver(b: { enemy: { name: string }; stamps: number }) {
  const world = state.run.world;
  const name = heroName();
  const multi = CFG().worlds > 1;
  endRun();
  state.run = null;
  setTimeout(SFX.lose, 200);
  screen(
    html`<div class="screen">${raw(topbar('Besiegt'))}<div class="scroll"><div class="card center"><h2>${b.enemy.name} war diesmal stärker.</h2><p>${name} muss sich ausruhen.${multi ? ` Du bist bis Welt ${world} gekommen.` : ''}</p>${raw(stampLine(b.stamps))}<p>Alles, was du geübt hast, bleibt gespeichert. Das nächste Abenteuer beginnt bei Welt 1 mit einem ausgeruhten Monster.</p></div></div><div class="bottom"><div class="stack"><button class="btn" id="again" data-action="again">Neues Abenteuer</button><button class="btn ghost" id="home" data-action="home">Zum Titel</button></div></div></div>`,
    { again: () => screenStarter(), home: screenTitle },
  );
  sayCard();
}
export const CONFETTI = `<div class="confetti" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 6) * 0.35}s;--c:${['#FFC93C', '#4FC96A', '#3FA0FF', '#FF6A3D', '#FF6E8E'][i % 5]}"></i>`).join('')}</div>`;
export function screenVictory() {
  state.meta.wins++;
  giveStamps(10);
  state.meta.progressAt = new Date().toISOString();
  if (state.mode === 'kartoffel') state.meta.owned['beet-4'] = true;
  const roof = CFG().worlds >= 3 && !state.meta.owned['hut-dachfenster'];
  if (roof) state.meta.owned['hut-dachfenster'] = true;
  const name = heroName();
  const spec = heroSpec();
  const evo = state.run.hero.evo;
  const bs = CFG().enemies[CFG().worlds].boss;
  const bossName = bs.acc || bs.name;
  endRun();
  state.run = null;
  setTimeout(SFX.finale, 300);
  screen(
    html`<div class="screen">${raw(topbar('Sieg!'))}${raw(CONFETTI)}<div class="scroll"><div class="card center"><h1 style="font-size:var(--text-36)">${bs.name} ist besiegt!</h1>${raw(heroSVG(spec, evo))}<p><b>${name}</b> ${CFG().worlds > 1 ? `hat ${CFG().worlds === 2 ? 'beide Welten' : 'alle drei Welten'} durchquert.` : 'ist am Ziel.'}</p>${raw(stampLine(10))}${roof && extraOn('huette') ? html`<p>Für deine Hütte gibt es jetzt ein Dachfenster.</p>` : ''}<p>Gewonnene Abenteuer: ${state.meta.wins}</p></div></div><div class="bottom"><div class="stack"><button class="btn" id="again" data-action="again">Noch ein Abenteuer</button><button class="btn ghost" id="home" data-action="home">Zum Titel</button></div></div></div>`,
    { again: () => screenStarter(), home: screenTitle },
  );
}
export function screenDex() {
  state.depth = 1;
  const all: (Foe & { elite?: boolean })[] = [];
  for (const m of MODE_KEYS) {
    const EN = MODES[m].enemies;
    for (const w of Object.keys(EN)) {
      for (const e of EN[w].normal) all.push(e);
      all.push({ ...EN[w].elite, elite: true });
      all.push(EN[w].boss);
    }
  }
  for (let i = all.length - 1; i >= 0; i--) if (all.findIndex((e) => e.name === all[i].name) < i) all.splice(i, 1); // grade 1/2 units share their opponents
  screen(
    html`<div class="screen">${raw(topbar('Monsterbuch'))}<div class="scroll"><div class="stack">${all.map((e) => {
      const seen = state.meta.dex[e.name];
      return html`<div class="choice" style="cursor:default">${seen ? raw(monsterSVG(e.shape, TYPES[e.type].color, 0, '', { elite: e.elite, boss: e.boss })) : html`<div class="mon" style="width:96px;height:96px;display:flex;align-items:center;justify-content:center;font-size:var(--text-48)">❔</div>`}<div class="meta"><div class="name">${seen ? e.name : '???'}</div>${seen ? raw(typeChip(e.type)) : ''}<div class="desc">${seen ? `Welt ${seen.world}${e.boss ? ' · Boss' : e.elite ? ' · Elite' : ''}` : 'Noch nicht gesehen'}</div></div></div>`;
    })}</div></div><div class="bottom"><button class="btn secondary" id="back" data-action="back">Zurück</button></div></div>`,
    { back: screenTitle },
  );
}
export function screenStamps(jump?: boolean) {
  state.depth = 1;
  const now = MQ.isoWeek(new Date());
  const weeks = MQ.schoolWeeks(new Date());
  const y = +weeks[0].slice(0, 4);
  const cells = weeks.map((k) => {
    const v = state.meta.stampCard[k];
    return html`<span class="wk${v === 2 ? ' gold' : v ? ' done' : ''}${k === now ? ' now' : ''}" role="img" aria-label="Woche ${+k.slice(6)}${v === 2 ? ', Wochenaufgabe geschafft' : v ? ', geübt' : ''}${k === now ? ', diese Woche' : ''}">${v === 2 ? '★' : v ? '✓' : ''}</span>`;
  });
  const row = (r: Reward) => {
    const prev = r.icon
      ? html`<div class="rwprev" aria-hidden="true">${r.icon}</div>`
      : r.bg
        ? html`<div class="rwprev" style="background:${r.bg}" aria-hidden="true">⚔️</div>`
        : raw(monsterSVG(MQ.STARTERS.find((s) => s.id === r.hero)!.shape, TYPES.normal.color, 0));
    return html`<div class="choice reward">${prev}<div class="meta"><div class="name">${r.name}</div><div class="desc">${r.desc}</div>${owns(r) ? html`<div class="rwhave">✔ Schon geholt</div>` : r.price ? html`<button class="btn small" data-action="buy" data-buy="${r.id}" ${canBuy(r) ? '' : 'disabled'}>Holen · ${r.price} 🏷️${r.stein ? ` + ${r.stein} Stein` : ''}</button>` : ''}</div></div>`;
  };
  screen(
    html`<div class="screen">${raw(topbar('Stempelheft'))}<div class="scroll"><div class="stack">
      <div class="card center"><div class="stampbal">🏷️ ${state.meta.stamps}</div><p>Je 10 richtige Aufgaben in einem Abenteuer: 1 Stempel. Neues Monster im Monsterbuch: 2. Boss besiegt: 5. Abenteuer gewonnen: 10. Wochenziel: 3. Alle Wochenziele zusammen: 10.</p></div>
      <div class="card"><h3>Stempelkarte ${y}/${String(y + 1).slice(2)}</h3><p class="pnote">Ein Feld für jede Schulwoche. ✓ heißt: In dieser Woche hast du geübt. ★ heißt: Wochenaufgabe geschafft.</p><div class="wkgrid">${cells}</div></div>
      <h2 id="rewards">Belohnungen</h2>
      <div class="choice reward">${raw(monsterSVG('fox', TYPES.feuer.color, 0, '', { outfit: 'strohhut' }))}<div class="meta"><div class="name">Kleiderkammer</div><div class="desc">Hut, Schal, Brille und mehr für deine Helden.</div><button class="btn small" id="kk" data-action="wardrobe">Öffnen</button></div></div>
      ${extraOn('kreisel') ? html`<div class="choice reward">${raw(MONART.topSVG(TYPES.wasser.color, state.meta.top))}<div class="meta"><div class="name">Kreisel bauen</div><div class="desc">Spitze, Ring und Scheibe für die Kreisel-Arena.</div><button class="btn small" id="kb" data-action="top">Öffnen</button></div></div>` : ''}
      ${REWARDS.filter((r) => extraOn('huette') || !r.id.startsWith('hut-')).map(row)}
      ${extraOn('huette') ? benchHtml() : ''}
      </div></div><div class="bottom"><button class="btn secondary" id="back" data-action="back">Zurück</button></div></div>`,
    {
      back: screenTitle,
      wardrobe: () => screenWardrobe(),
      top: () => screenTop(),
      craft: (button) => screenCraft(button.dataset.craft),
      buy: (button) => {
        // only rewards with a price have a button
        const r = REWARDS.find((x) => x.id === button.dataset.buy) as Reward & { price: number };
        const ov = modal(
          html`<h2>${r.name} holen?</h2><p>Das kostet ${r.price} Stempel${r.stein ? ` und ${r.stein} Stein` : ''}. Danach hast du noch ${state.meta.stamps - r.price} Stempel.</p><div class="stack"><button class="btn" id="yes" data-action="yes">Holen</button><button class="btn secondary" id="no" data-action="no">Zurück</button></div>`,
          {
            no: () => ov.remove(),
            yes: () => {
              if (!owns(r) && canBuy(r)) {
                state.meta.stamps -= r.price;
                if (r.stein) state.meta.materials.stein -= r.stein;
                if (r.get) r.get();
                else state.meta.owned[r.id] = true;
                state.meta.progressAt = new Date().toISOString();
                saveAll();
              }
              screenStamps();
            },
          },
        );
      },
    },
  );
  if (jump && $('#werkbank') && $('#werkbank').scrollIntoView) $('#werkbank').scrollIntoView();
}
