import { MK } from '../knowledge.js';
import { MQ } from '../logic.js';
import { MONART } from '../monsters.js';
import { MS } from '../sachkunde.js';
import { TOP, isObj } from '../save.ts';
import { LOOT } from './battle.js';
import { $, CFG, ITEMS, MODULES_OF, TYPES, app, esc, euro, pick, shuffle } from './core.js';
import { partOf } from './huette.js';
import { NODE_INFO, advance, nodeDone } from './map.js';
import {
  STATS,
  addMat,
  gainXp,
  heal,
  heroAttacks,
  heroSVG,
  heroSpec,
  makeTask,
  recordAnswer,
  taskTier,
  tierFor,
  tutKey,
  weakestModule,
} from './progress.js';
import { state } from './state.js';
import { enabledMods, extraOn, marketOn, saveAll } from './storage.js';
import { INK, POTATO, joined, lg, ln, plain, plantOf, rg, runTask, shadow, speakBtn } from './tasks.js';
import { SFX, ensureTutorial, render, showTutorial, topbar } from './ui.js';

/* ---------- Event ---------- */
export function screenEvent(resumeOpt) {
  // run.node.ev indexes the whole list, so new events are only ever appended; w = only in that world
  const EV = CFG().events;
  const geldEv = (ev) => ev.opts.some((o) => o.task === 'geld');
  const ids = EV.map((_, i) => i).filter(
    (i) => (!EV[i].w || EV[i].w === state.run.world) && (marketOn() || !geldEv(EV[i])),
  );
  if (!Number.isInteger(state.run.node && state.run.node.ev) || !EV[state.run.node.ev]) {
    if (state.run.node) state.run.node.ev = pick(ids);
    saveAll();
  }
  const ev = state.run.node ? EV[state.run.node.ev] : EV[pick(ids)];
  render(
    `<div class="screen">${topbar('❓ Ereignis')}<div class="scroll"><div class="card"><h2>${esc(ev.title)}</h2><p style="font-size:20px">${esc(ev.text)}</p>${ev.dilemma ? '<p><b>Was würdest du tun?</b> Hier gibt es kein Richtig oder Falsch.</p>' : ''}</div></div><div class="bottom"><div class="stack">${ev.opts.map((o, i) => `<button class="btn ${i || ev.dilemma ? 'secondary' : ''}" data-i="${i}">${esc(o.label)}</button>`).join('')}</div></div></div>`,
  );
  const runOpt = (i) => {
    const o = ev.opts[i];
    if (!o) return screenEvent();
    if (!o.task) {
      applyEffect(ev.dilemma ? ev.reward : o.effect);
      showEffect(ev.title, o);
      return;
    }
    if (state.run.node) {
      state.run.node.opt = i;
      saveAll();
    }
    const mod =
      o.task === 'geld' ? 'geld' : o.task === 'any' || !enabledMods().includes(o.task) ? pick(enabledMods()) : o.task;
    const t = makeTask(mod, taskTier(mod), { g: o.g });
    render(
      `<div class="screen">${topbar('❓ ' + esc(ev.title))}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`,
    );
    let won = false;
    ensureTutorial(t, () =>
      runTask(
        t,
        {
          container: $('#taskwrap'),
          bottom: $('#bottom'),
          onResult: (ok) => {
            won = ok;
            recordAnswer(mod, ok, t);
            applyEffect(ok ? o.win : o.lose);
          },
        },
        () => showEffect(won ? 'Richtig gelöst' : 'Daneben'),
      ),
    );
  };
  if (Number.isInteger(resumeOpt)) return runOpt(resumeOpt);
  speakBtn($('.card'), 'afterbegin', () =>
    joined(ev.title, ev.text, ev.dilemma && 'Was würdest du tun?', ...ev.opts.map((o) => o.label)),
  );
  app.querySelectorAll('.bottom .btn').forEach((btn) => {
    btn.onclick = () => runOpt(+btn.dataset.i);
  });
}
function applyEffect(eff) {
  const lines = [];
  state.run.node && (state.run.node.lines = lines);
  if (eff.hp) {
    if (eff.hp > 0) {
      heal(eff.hp);
      lines.push(`❤️ +${eff.hp} Lebenspunkte`);
    } else {
      state.run.hero.hp = Math.max(1, state.run.hero.hp + eff.hp);
      lines.push(`💔 −${Math.abs(eff.hp)} Lebenspunkte`);
    }
  }
  if (eff.maxhp) {
    state.run.hero.maxHp += eff.maxhp;
    heal(eff.maxhp);
    lines.push(`💪 +${eff.maxhp} maximale Lebenspunkte`);
  }
  if (eff.item) {
    state.run.items.push(eff.item);
    lines.push(`${ITEMS[eff.item].icon} ${ITEMS[eff.item].name} erhalten`);
  }
  if (eff.holz) {
    addMat('holz', eff.holz);
    lines.push(`🪵 +${eff.holz} Holz für die Werkbank`);
  }
  if (eff.xp) {
    const m = gainXp(eff.xp);
    lines.push(`⭐ +${eff.xp} XP`);
    lines.push(...m);
  }
  if (!lines.length) lines.push('Nichts passiert.');
  nodeDone();
  saveAll();
  return lines;
}
function showEffect(title, opt) {
  const lines = (state.run.node && state.run.node.lines) || [];
  render(
    `<div class="screen">${topbar('❓ Ereignis')}<div class="scroll"><div class="card center"><h2>${esc(title)}</h2>${opt && opt.then ? `<p>${esc(opt.then)}</p><p><b>Denk mal nach:</b> ${esc(opt.think)}</p>` : ''}${lines.map((l) => `<p>${l}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`,
  );
  speakBtn($('.card'), 'afterbegin', () =>
    joined(title, opt && opt.then, opt && opt.then && 'Denk mal nach: ' + opt.think, ...lines.map(plain)),
  );
  $('#next').onclick = advance;
}

/* ---------- Rest ---------- */
export function screenRest() {
  const weak = weakestModule();
  const s = STATS()[weak];
  const acc = s.t ? Math.round((s.c / s.t) * 100) : null;
  const MODULES = MODULES_OF();
  render(`<div class="screen">${topbar('🔥 Rast')}<div class="scroll"><div class="card center"><h2>Am Lagerfeuer</h2>${heroSVG(heroSpec(), state.run.hero.evo)}<p>❤️ ${state.run.hero.hp} / ${state.run.hero.maxHp}</p></div></div>
      <div class="bottom"><div class="stack"><button class="btn" id="heal">Ausruhen: +${Math.round(state.run.hero.maxHp * 0.4)} LP</button><button class="btn secondary" id="train">Training: ${MODULES[weak].icon} ${MODULES[weak].name}${acc !== null ? ` (${acc} % richtig)` : ''} – 3 Aufgaben, kein Risiko, +XP</button></div></div></div>`);
  $('#heal').onclick = () => {
    heal(Math.round(state.run.hero.maxHp * 0.4));
    saveAll();
    advance();
  };
  $('#train').onclick = () => training(weak, 3, 0);
}
function training(mod, total, done) {
  if (done >= total) {
    const m = gainXp(15);
    nodeDone();
    saveAll();
    render(
      `<div class="screen">${topbar('🔥 Training')}<div class="scroll"><div class="card center"><h2>Training beendet</h2><p>⭐ +15 XP</p>${m.map((x) => `<p style="color:var(--orange);font-weight:800">${x}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`,
    );
    $('#next').onclick = advance;
    return;
  }
  const t = makeTask(mod, taskTier(mod));
  render(
    `<div class="screen">${topbar(`🔥 Training ${done + 1} / ${total}`)}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`,
  );
  const s = STATS()[mod];
  const low = s.t >= 3 && s.c / s.t < 0.6;
  const go = () =>
    runTask(
      t,
      {
        container: $('#taskwrap'),
        bottom: $('#bottom'),
        subtitle: 'Übung',
        onResult: (ok) => {
          recordAnswer(mod, ok, t);
          saveAll();
        },
      },
      () => training(mod, total, done + 1),
    );
  if (low && done === 0 && state.meta.seenTut[tutKey(t.group)]) showTutorial(t.group, t.note, go);
  else ensureTutorial(t, go);
}

/* ---------- Treasure ---------- */
export function screenTreasure(kind) {
  const elite = kind === 'elite';
  const owned = heroAttacks().map((a) => a.mod);
  const free = enabledMods().filter((k) => !owned.includes(k));
  const MODULES = MODULES_OF();
  const EXTRA_ATTACKS = CFG().extra;
  if (state.run.node && !Array.isArray(state.run.node.chest)) {
    const [r1, r2] = shuffle(LOOT.rare);
    state.run.node.chest = [r1, elite ? r2 : pick(LOOT.chest.filter((x) => x !== r1)), free.length ? pick(free) : null];
    // chests in world 2 and 3 hold the Flammenring and the Kugelspitze, once
    const part =
      elite || !extraOn('kreisel')
        ? null
        : Object.keys(TOP)
            .flatMap((s) => TOP[s].filter((p) => p.chest === state.run.world).map((p) => `top-${s}-${p.id}`))
            .find((k) => !state.meta.owned[k]);
    if (part) {
      state.meta.owned[part] = true;
      state.run.node.part = part;
      state.meta.progressAt = new Date().toISOString();
    }
    saveAll();
  }
  const found = state.run.node && typeof state.run.node.part === 'string' && partOf(state.run.node.part);
  const [i1, i2, freeMod] = (state.run.node && state.run.node.chest) || [
    pick(LOOT.rare),
    pick(LOOT.chest),
    free.length ? pick(free) : null,
  ];
  const itemOpt = (id) => ({ k: 'item', item: id, label: `${ITEMS[id].icon} ${ITEMS[id].name}`, desc: ITEMS[id].desc });
  const maxhp = { k: 'maxhp', label: '💪 +10 maximale LP', desc: 'Dein Monster wird zäher.' };
  const atkOpt =
    freeMod && free.includes(freeMod)
      ? {
          k: 'atk',
          mod: freeMod,
          label: `${MODULES[freeMod].icon} Neue Attacke: ${EXTRA_ATTACKS[freeMod]}`,
          desc: `${MODULES[freeMod].name} – ersetzt eine deiner Attacken.`,
        }
      : null;
  const opts = elite ? [itemOpt(i1), itemOpt(i2), atkOpt || maxhp] : [itemOpt(i1), maxhp, atkOpt || itemOpt(i2)];
  render(
    `<div class="screen">${topbar(elite ? '💀 Beute' : '🎁 Schatz')}<div class="scroll"><p class="center">${elite ? `${state.run.node && state.run.node.type === 'weekboss' ? 'Der Wochenboss' : 'Der Elitegegner'} hat etwas dagelassen. Wähle eine Belohnung:` : 'Du findest eine Truhe. Wähle eine Belohnung:'}</p><div class="stack">${found ? `<div class="card center">${MONART.topSVG(TYPES[heroSpec().type].color, Object.assign({}, state.meta.top, { [found.slot]: found.id }))}<p>In der Truhe liegt noch etwas für deinen Kreisel: <b>${found.name}</b>. Einbauen kannst du es im Stempelheft.</p></div>` : ''}${opts.map((o, i) => `<button class="choice" data-i="${i}"><div class="meta"><div class="name">${o.label}</div><div class="desc">${o.desc}</div></div></button>`).join('')}</div></div></div>`,
  );
  app.querySelectorAll('.choice').forEach((b) => {
    b.onclick = () => {
      const o = opts[+b.dataset.i];
      if (o.k === 'item') state.run.items.push(o.item);
      if (o.k === 'maxhp') {
        state.run.hero.maxHp += 10;
        heal(10);
      }
      if (o.k === 'atk') {
        chooseSlot(o.mod);
        return;
      }
      saveAll();
      advance();
    };
  });
}
function chooseSlot(mod) {
  const MODULES = MODULES_OF();
  const EXTRA_ATTACKS = CFG().extra;
  render(
    `<div class="screen">${topbar('🎁 Neue Attacke')}<div class="scroll"><p class="center">Welche Attacke soll ${EXTRA_ATTACKS[mod]} ersetzen?</p><div class="stack">${heroAttacks()
      .map(
        (a, i) =>
          `<button class="choice" data-i="${i}"><div class="meta"><div class="name">${esc(a.name)}</div><div class="desc">${MODULES[a.mod].icon} ${MODULES[a.mod].name} · Platz ${i + 1}</div></div></button>`,
      )
      .join(
        '',
      )}<button class="btn ghost" id="skip">Doch lieber behalten – dafür gibt es einen 🧪 Trank</button></div></div></div>`,
  );
  app.querySelectorAll('.choice').forEach((b) => {
    b.onclick = () => {
      state.run.hero.attacks[+b.dataset.i] = { name: EXTRA_ATTACKS[mod], mod };
      saveAll();
      advance();
    };
  });
  $('#skip').onclick = () => {
    state.run.items.push('trank');
    saveAll();
    advance();
  };
}

/* ---------- Bergwerk ---------- */
// 12 covered blocks, three per visit. Each block is a division with remainder: no remainder means ore, otherwise stone,
// a wrong answer crumbles the block. The haul goes to meta.materials; the first ore ever unlocks the iron disc for the spinning top.
const MINE_PICKS = 3,
  MINE_LABEL = { erz: 'Erz', stein: 'Stein', leer: 'leer' };
const MB_DEFS = `<defs>${rg('mb-dirt', '#A87850', '#5E3D24')}${rg('mb-rock', '#C3C8CF', '#6E747C')}${rg('mb-ore', '#9AA0AA', '#4E545E')}${rg('mb-nug', '#F2A866', '#B4471E')}<radialGradient id="mb-hole" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#2E1C10"/><stop offset="1" stop-color="#6E4A2E"/></radialGradient></defs>`;
const glint = (x, y, s) =>
  `<path d="M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z" fill="#FFE27A"/>`;
const MB = {
  '': `<rect x="3" y="3" width="34" height="34" rx="6" fill="url(#mb-dirt)" ${ln(2)}/><path d="M7 13V9q0-3 3-3h18" fill="none" stroke="#D2A270" stroke-width="1.6" stroke-linecap="round" opacity=".8"/><path d="M9 12l6 5-2 8M27 8l-3 8 7 5M19 29l6 4" fill="none" stroke="#3E2816" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="30" cy="30" rx="2.6" ry="1.9" fill="#A9AFB8" ${ln(0.8)}/><ellipse cx="11" cy="31" rx="1.8" ry="1.4" fill="#A9AFB8" ${ln(0.8)}/><circle cx="21" cy="11" r=".9" fill="#D2A270"/><circle cx="33" cy="15" r=".8" fill="#D2A270"/><circle cx="16" cy="22" r=".8" fill="#3E2816"/>`,
  stein: `<rect x="3" y="3" width="34" height="34" rx="6" fill="url(#mb-rock)" ${ln(2)}/><path d="M4 18L13 12L22 15L29 8M13 12L12 4M22 15L24 25L36 27M24 25L17 36M24 25L11 27L4 24" fill="none" stroke="#6E747C" stroke-width="1.3" stroke-linejoin="round"/><path d="M6 15L12 11L12 5L8 5Q5 5 5 8Z" fill="#E1E5EA" opacity=".7"/><path d="M25 26L35 28L35 34Q35 36 33 36L19 36Z" fill="#4E545E" opacity=".35"/><circle cx="17" cy="20" r=".9" fill="#5E646E"/><circle cx="30" cy="16" r=".8" fill="#5E646E"/><circle cx="9" cy="31" r=".8" fill="#E1E5EA"/>`,
  erz: `<rect x="3" y="3" width="34" height="34" rx="6" fill="url(#mb-ore)" ${ln(2)}/><path d="M7 13V9q0-3 3-3h18" fill="none" stroke="#C3C8CF" stroke-width="1.6" stroke-linecap="round" opacity=".7"/><path d="M8 30Q15 22 20 23T33 12" fill="none" stroke="#B4471E" stroke-width="2.4" stroke-linecap="round"/><path d="M8 30Q15 22 20 23T33 12" fill="none" stroke="#E8A15A" stroke-width="1" stroke-linecap="round"/>
      <path d="M9 11l5-2 3 4-3 4-5-1z" fill="url(#mb-nug)" ${ln(1.2)}/><path d="M21 19l6-1 3 5-4 5-6-2z" fill="url(#mb-nug)" ${ln(1.2)}/><path d="M12 27l4-1 2 3-3 3-4-2z" fill="url(#mb-nug)" ${ln(1.2)}/><path d="M11 12l3-1M23 20l3-.5" stroke="#FFE0B8" stroke-width="1" stroke-linecap="round"/>${glint(29, 9, 3.4)}${glint(31, 31, 2.8)}${glint(17, 16, 2)}`,
  leer: `<rect x="3" y="3" width="34" height="34" rx="8" fill="#9C7048" stroke="#5E3D24" stroke-width="1.6"/><path d="M8 21Q7 12 16 11Q22 9 28 12Q34 15 32 23Q31 31 21 32Q10 32 8 21Z" fill="url(#mb-hole)" stroke="#4A2C18" stroke-width="1.4"/><path d="M10 17Q14 11 22 11.5Q28 12 31 17" fill="none" stroke="#C99A70" stroke-width="1.6" stroke-linecap="round" opacity=".8"/><ellipse cx="9" cy="33" rx="3" ry="2" fill="#B88A5E" stroke="#5E3D24" stroke-width=".9"/><ellipse cx="31" cy="34" rx="3.4" ry="2.2" fill="#B88A5E" stroke="#5E3D24" stroke-width=".9"/><ellipse cx="33" cy="8" rx="2" ry="1.4" fill="#B88A5E" stroke="#5E3D24" stroke-width=".8"/><circle cx="8" cy="9" r="1.2" fill="#6E4A2E"/><circle cx="20" cy="35" r="1" fill="#6E4A2E"/><circle cx="15" cy="7" r=".9" fill="#C99A70"/><ellipse cx="17" cy="26" rx="2.2" ry="1.3" fill="#7A5234"/>`,
};
const blockSVG = (k) => `<svg viewBox="0 0 40 40" aria-hidden="true">${MB_DEFS}${MB[k || '']}</svg>`;
function mineRecord(ok, t) {
  if (state.mode === 'math') return recordAnswer('rest', ok, t);
  const s = state.meta.stats.math.rest;
  s.t++;
  if (ok) s.c++; // other units count it as practice in Zahlenquest, without changing its levels
}
export function screenMine() {
  const n = state.run.node;
  if (!isObj(n.mine) || !Array.isArray(n.mine.cells) || !Array.isArray(n.mine.got)) {
    n.mine = { cells: Array(12).fill(''), got: [] };
    saveAll();
  }
  const mn = n.mine;
  if (isObj(mn.task) && isObj(mn.task.t)) return mineTask(mn);
  const left = MINE_PICKS - mn.got.length;
  const haul = (k) => mn.got.filter((x) => x === k).length;
  render(`<div class="screen">${topbar('⛏️ Bergwerk')}<div class="scroll"><div class="card"><p style="margin-top:0">Schlag ${MINE_PICKS} Blöcke auf. In jedem steckt eine Aufgabe zum Teilen mit Rest. Geht sie ohne Rest auf, findest du Erz, sonst Stein.</p>
      <div class="mine">${mn.cells.map((k, i) => `<button class="mblock ${k ? 'open' : 'covered'}" data-i="${i}" ${k || !left ? 'disabled' : ''} aria-label="${k ? MINE_LABEL[k] : 'Block ' + (i + 1)}">${blockSVG(k)}${k ? `<small>${MINE_LABEL[k]}</small>` : ''}</button>`).join('')}</div>
      <p class="center">${left ? `Noch ${left} ${left === 1 ? 'Block' : 'Blöcke'}.` : `Ausbeute: ${haul('erz')} Erz, ${haul('stein')} Stein.`}</p>${!left && mn.disc ? '<p class="center"><b>Aus deinem ersten Erz wird eine Eisenscheibe für den Kreisel.</b></p>' : ''}
      <p class="center muted" style="color:var(--ink-soft)">Im Lager: ${state.meta.materials.erz || 0} Erz, ${state.meta.materials.stein || 0} Stein</p></div></div>
      <div class="bottom">${left ? '<p class="center muted" style="margin:6px 0">Tippe auf einen Block.</p>' : '<button class="btn" id="next">Weiter</button>'}</div></div>`);
  app.querySelectorAll('.mblock.covered:not([disabled])').forEach((b) => {
    b.onclick = () => {
      const zero = Math.random() < 0.4;
      const t = MQ.generate('rest', state.mode === 'math' ? tierFor('rest') : Math.min(2, state.run.world), { zero });
      t.kind = 'num';
      t.group = 'rest:' + t.tier;
      mn.task = { i: +b.dataset.i, t };
      saveAll();
      mineTask(mn);
    };
  });
  if (!left)
    $('#next').onclick = () => {
      nodeDone();
      saveAll();
      advance();
    };
}
function mineTask(mn) {
  const { i, t } = mn.task;
  render(
    `<div class="screen">${topbar(`⛏️ Block ${mn.got.length + 1} / ${MINE_PICKS}`)}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`,
  );
  ensureTutorial(t, () =>
    runTask(
      t,
      {
        container: $('#taskwrap'),
        bottom: $('#bottom'),
        subtitle: 'Bergwerk',
        onResult: (ok) => {
          const k = !ok ? 'leer' : t.answers[1] === 0 ? 'erz' : 'stein';
          mn.cells[i] = k;
          mn.got.push(k);
          delete mn.task;
          mineRecord(ok, t);
          if (k !== 'leer') addMat(k, 1);
          if (k === 'erz' && !state.meta.owned['top-disc-eisen']) {
            state.meta.owned['top-disc-eisen'] = true;
            mn.disc = true;
          }
          saveAll();
        },
      },
      screenMine,
    ),
  );
}

/* ---------- Markt ---------- */
const STALL = `<svg class="stall" viewBox="0 0 220 120" aria-hidden="true"><defs>${lg('ms-r', '#EE6A55', '#C23A30')}${lg('ms-c', '#FFF8E8', '#E6D3AE')}${lg('ms-w', '#C99158', '#8E5A30')}${lg('ms-p', '#8E5A30', '#C08550', 1)}${rg('ms-sk', '#F8DABA', '#E0A980')}${lg('ms-sh', '#4FA66A', '#2F7A47')}${rg('ms-ap', '#F07A5E', '#B8322A')}${rg('ms-po', '#F3D48E', '#B88843')}${rg('ms-hr', '#9A6440', '#5E3A22')}
    <pattern id="ms-wv" width="8" height="6" patternUnits="userSpaceOnUse"><rect width="8" height="6" fill="#D2A458"/><path d="M0 3q2-3 4 0t4 0" stroke="#8E6A2C" stroke-width="1.1" fill="none"/></pattern></defs>
    ${shadow(110, 116, 102, 4)}<rect x="26" y="28" width="8" height="86" fill="url(#ms-p)" ${ln(2.5)}/><rect x="186" y="28" width="8" height="86" fill="url(#ms-p)" ${ln(2.5)}/>
    <path d="M84 113q2-32 26-36q24 4 26 36z" fill="url(#ms-sh)" ${ln(3)}/><path d="M99 86h22v27h-22z" fill="#FFF3D6" ${ln(2)}/><path d="M103 98h14v8h-14z" fill="none" stroke="#C9B48A" stroke-width="1.4"/>
    <ellipse cx="95" cy="62" rx="3.5" ry="4.5" fill="url(#ms-sk)" ${ln(2)}/><ellipse cx="125" cy="62" rx="3.5" ry="4.5" fill="url(#ms-sk)" ${ln(2)}/><circle cx="110" cy="61" r="15" fill="url(#ms-sk)" ${ln(3)}/>
    <circle cx="110" cy="42" r="6" fill="url(#ms-hr)" ${ln(2.2)}/><path d="M95 60q-1-17 15-17t15 17q-5-9-15-9t-15 9z" fill="url(#ms-hr)" ${ln(2.2)}/><path d="M102 47q5-2 9-1" stroke="#C49070" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <circle cx="104" cy="61" r="2.2" fill="${INK}"/><circle cx="116" cy="61" r="2.2" fill="${INK}"/><circle cx="103.3" cy="60.2" r=".8" fill="#FFFFFF"/><circle cx="115.3" cy="60.2" r=".8" fill="#FFFFFF"/><path d="M104 68q6 5 12 0" fill="none" ${ln(2.2)}/><ellipse cx="100" cy="67" rx="3" ry="1.8" fill="#FF7A9A" opacity=".45"/><ellipse cx="120" cy="67" rx="3" ry="1.8" fill="#FF7A9A" opacity=".45"/>
    ${[
      [42, 70],
      [52, 68],
      [62, 70],
      [47, 64],
      [57, 63],
    ]
      .map(
        ([x, y]) =>
          `<circle cx="${x}" cy="${y}" r="5.5" fill="url(#ms-ap)" ${ln(1.8)}/><path d="M${x} ${y - 5}l1-3" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="${x - 2}" cy="${y - 2}" rx="1.6" ry="1" fill="#FFE0D6" opacity=".7"/>`,
      )
      .join('')}<path d="M58 60q4-4 8-1q-4 3-8 1z" fill="#5FA34E" ${ln(1)}/>
    <path d="M34 72h38l-4 12h-30z" fill="url(#ms-wv)" ${ln(2.2)}/><rect x="32" y="70" width="42" height="5" rx="2.5" fill="#C99A4E" ${ln(1.8)}/>
    ${[
      [150, 70, 0],
      [162, 68, 15],
      [174, 70, -10],
      [156, 64, 8],
      [168, 63, -6],
    ]
      .map(
        ([x, y, a]) =>
          `<ellipse cx="${x}" cy="${y}" rx="7" ry="5" transform="rotate(${a} ${x} ${y})" fill="url(#ms-po)" ${ln(1.8)}/><circle cx="${x + 2}" cy="${y + 1}" r=".9" fill="#8A6030"/>`,
      )
      .join('')}
    <rect x="142" y="72" width="40" height="12" rx="2" fill="url(#ms-w)" ${ln(2.2)}/><path d="M142 78h40M162 72v12" stroke="#6E4526" stroke-width="1.2"/>
    <rect x="14" y="82" width="192" height="7" rx="3" fill="#DDA86B" ${ln(2.5)}/><path d="M18 84h184" stroke="#F2CE98" stroke-width="1.2" stroke-linecap="round"/><rect x="18" y="89" width="184" height="25" rx="3" fill="url(#ms-w)" ${ln(3)}/>${[48, 79, 110, 141, 172].map((x) => `<path d="M${x} 90v23" stroke="#6E4526" stroke-width="1.6"/>`).join('')}<path d="M24 97q10-2 18 0M56 104q12 2 18-1M90 96q10 1 16-1M118 106q12-2 18 0M150 98q10 2 16 0M180 105q10-2 18 0" stroke="#7A4A26" stroke-width="1" fill="none" opacity=".55"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${14 + i * 32} 12L${24 + i * 28.7} 3H${24 + (i + 1) * 28.7}L${14 + (i + 1) * 32} 12z" fill="url(#ms-${i % 2 ? 'c' : 'r'})" ${ln(2.2)}/>`).join('')}
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${14 + i * 32} 12h32v18a16 9 0 0 1-32 0z" fill="url(#ms-${i % 2 ? 'c' : 'r'})" ${ln(2.5)}/><path d="M${18 + i * 32} 15v13" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity=".35"/>`).join('')}<path d="M14 12h192" fill="none" ${ln(3)}/></svg>`;
const coinBtn = (v, attr) =>
  `<button class="coin ${v >= 500 ? 'note n' + v : v >= 100 ? 'euro' : v >= 10 ? 'brass' : 'copper'}" ${attr} aria-label="${euro(v)}">${euro(v)}</button>`;
// Kaufladen: the child serves three customers (world 1: count out the price, later: give the change) and gets a
// thank-you item. Nobody owns money here; adventures saved with the old market (node.offers, run.coins) open this one.
export function screenMarket(msg) {
  const n = state.run.node || {};
  const tier = state.run.world >= 2 ? 2 : 1;
  if (
    !Array.isArray(n.cust) ||
    n.cust.length !== 3 ||
    !n.cust.every((c) => isObj(c) && c.price > 0 && (c.paid || 0) >= 0)
  ) {
    n.cust = MQ.shopCustomers(state.run.world);
    n.i = 0;
    n.tries = 0;
  }
  if (!Array.isArray(n.gifts) || n.gifts.length !== 3 || !n.gifts.every((id) => ITEMS[id]))
    n.gifts = shuffle(MQ.SHOP_GIFTS).slice(0, 3);
  if (!Number.isInteger(n.i) || n.i < 0) n.i = 0;
  if (!Number.isInteger(n.tries)) n.tries = 0;
  state.run.tiers.geld = tier;
  saveAll();
  const seller = (t) =>
    `<div class="card seller">${STALL}<div class="row"><p class="say" id="say" role="status">${esc(t)}</p><button class="tut" type="button" id="mtut" aria-label="Erklärung anzeigen">🛈</button></div></div>`;
  if (n.i >= 3) {
    render(`<div class="screen market">${topbar('🧺 Kaufladen')}<div class="scroll"><div class="stack">${seller('Danke für deine Hilfe! Such dir zum Dank etwas aus.')}
        ${n.gifts.map((id, i) => `<button class="choice offer" data-i="${i}"><span class="ic" aria-hidden="true">${ITEMS[id].icon}</span><div class="meta"><div class="name">${ITEMS[id].name}</div><div class="desc">${esc(ITEMS[id].desc)}</div></div></button>`).join('')}</div></div></div>`);
    $('#mtut').onclick = () => showTutorial('geld:' + tier);
    app.querySelectorAll('.offer').forEach((b) => {
      b.onclick = () => {
        state.run.items.push(n.gifts[+b.dataset.i]);
        nodeDone();
        saveAll();
        advance();
      };
    });
    return;
  }
  const c = n.cust[n.i];
  const paid = tier === 2 && c.paid > c.price ? c.paid : 0;
  const want = paid ? paid - c.price : c.price;
  const kinds = MQ.COINS.concat(state.run.world >= 3 ? [1000, 500] : []).sort((a, b) => b - a);
  const counter = [];
  const sum = () => counter.reduce((a, b) => a + b, 0);
  const hello = paid
    ? 'Heute ist viel los. Hilfst du mir an der Kasse? Gib jedem Kunden das Rückgeld.'
    : 'Heute ist viel los. Hilfst du mir? Zähle für jeden Kunden das Geld passend ab.';
  render(`<div class="screen market" data-want="${want}">${topbar('🧺 Kaufladen')}<div class="scroll"><div class="stack">${seller(msg || hello)}
      <div class="card till"><div class="lbl">Kunde ${n.i + 1} von 3</div><p class="cust">${esc(c.who)} kauft ${esc(c.ware)} für <b>${euro(c.price)}</b>${paid ? ` und bezahlt mit <b>${euro(paid)}</b>. Lege das Rückgeld hin.` : `. Zähle ${euro(c.price)} passend ab.`}</p>
      <div class="lbl">Ladentisch</div><div class="counter" id="counter"></div><div class="lbl">${paid ? 'Kasse' : 'Münzen'}</div><div class="coins">${kinds.map((v) => coinBtn(v, `data-v="${v}"`)).join('')}</div></div>
      </div></div><div class="bottom"><div class="row"><button class="btn secondary" id="leave">Weitergehen</button><button class="btn" id="pay" disabled>✓ Prüfen</button></div></div></div>`);
  const paint = () => {
    $('#counter').innerHTML = counter.length
      ? counter.map((v, j) => coinBtn(v, `data-j="${j}"`)).join('')
      : '<span class="muted">Tippe auf Münzen, um sie hinzulegen.</span>';
    $('#pay').disabled = !counter.length;
    $('#counter')
      .querySelectorAll('.coin')
      .forEach((b) => {
        b.onclick = () => {
          counter.splice(+b.dataset.j, 1);
          paint();
        };
      });
  };
  paint();
  app.querySelectorAll('.coins .coin').forEach((b) => {
    b.onclick = () => {
      counter.push(+b.dataset.v);
      paint();
    };
  });
  $('#mtut').onclick = () => showTutorial('geld:' + tier);
  $('#leave').onclick = () => {
    nodeDone();
    saveAll();
    advance();
  };
  $('#pay').onclick = () => {
    const ok = sum() === want;
    // only the first try for a customer counts in the statistics: after a miss the answer is as good as given
    if (!n.tries) recordAnswer('geld', ok);
    if (ok) {
      n.i++;
      n.tries = 0;
      saveAll();
      return screenMarket(n.i < 3 ? 'Stimmt genau, danke! Da kommt schon der Nächste.' : '');
    }
    n.tries++;
    saveAll();
    const was = `Das sind ${euro(sum())}. `;
    counter.length = 0;
    paint();
    $('#say').textContent =
      was +
      (!paid
        ? `Gebraucht werden ${euro(c.price)}. Versuch es noch einmal.`
        : n.tries === 1
          ? `Prüfe mit Plus: ${euro(c.price)} und das Rückgeld sind zusammen ${euro(paid)}.`
          : `Das Rückgeld sind ${euro(want)}. Lege sie auf den Ladentisch.`);
    if ($('.seller').scrollIntoView) $('.seller').scrollIntoView({ block: 'nearest' });
  };
  if (!msg && !state.meta.seenTut[tutKey('geld:' + tier)]) showTutorial('geld:' + tier, null, null, true);
}

/* ---------- Zeichenschule ---------- */
// a unit can draw two pictures: the first on floor 2, the second later (see makeMapFor)
const schoolKey = () => {
  const s = CFG().school;
  return Array.isArray(s) ? s[state.run && state.run.floor > 2 ? 1 : 0] : s;
};
export function screenSchool(step) {
  const P = plantOf(schoolKey());
  const n = P.steps.length;
  if (step > n) {
    render(
      `<div class="screen">${topbar('✏️ Zeichenschule')}<div class="scroll"><div class="card center"><h2>Merk-Check</h2><p>Jetzt verschwinden die Namen. Weißt du noch, wie alle Teile heißen?</p>${P.svg({})}</div></div><div class="bottom"><button class="btn" id="go">Los!</button></div></div>`,
    );
    $('#go').onclick = () => schoolCheck(MK.shuffle(P.parts.map((p) => p.id)), 0);
    return;
  }
  render(
    `<div class="screen">${topbar(`✏️ Zeichenschule ${step} / ${n}`)}<div class="scroll"><div class="card"><h3>Schritt ${step}</h3><p>${esc(P.steps[step - 1])}</p>${P.svg({ step, labels: true })}<p class="muted" style="color:var(--ink-soft)">Zeichne mit auf Papier. Die Namen stehen dabei.</p></div></div><div class="bottom"><div class="row">${step > 1 ? `<button class="btn secondary" id="prev">Zurück</button>` : ''}<button class="btn" id="next">${step < n ? 'Nächster Schritt' : 'Zum Merk-Check'}</button></div></div></div>`,
  );
  $('#next').onclick = () => screenSchool(step + 1);
  if ($('#prev')) $('#prev').onclick = () => screenSchool(step - 1);
}
function schoolCheck(ids, i) {
  if (i >= ids.length) {
    const m = gainXp(20);
    nodeDone();
    saveAll();
    render(
      `<div class="screen">${topbar('✏️ Zeichenschule')}<div class="scroll"><div class="card center"><h2>Merk-Check bestanden</h2><p>⭐ +20 XP</p>${m.map((x) => `<p style="color:var(--orange);font-weight:800">${x}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`,
    );
    $('#next').onclick = advance;
    return;
  }
  const P = plantOf(schoolKey());
  const part = P.parts.find((p) => p.id === ids[i]);
  const others = MK.shuffle(P.parts.filter((p) => p.id !== part.id))
    .slice(0, 3)
    .map((p) => p.name);
  const t = {
    kind: 'parts',
    mod: 'parts',
    tier: 1,
    group: 'parts:1',
    note: P.note,
    q: 'Wie heißt der leuchtende Teil?',
    part: part.id,
    options: MK.shuffle(others.concat([part.name])),
    answer: part.name,
    qid: P.qid + part.id,
    plant: P === POTATO ? undefined : schoolKey(),
  };
  render(
    `<div class="screen">${topbar(`✏️ Merk-Check ${i + 1} / ${ids.length}`)}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`,
  );
  ensureTutorial(t, () =>
    runTask(
      t,
      {
        container: $('#taskwrap'),
        bottom: $('#bottom'),
        subtitle: 'Merk-Check',
        onResult: (ok) => {
          recordAnswer('parts', ok, t);
          saveAll();
        },
      },
      () => schoolCheck(ids, i + 1),
    ),
  );
}

/* ---------- Forscherlabor: guess first, then the result; a wrong guess costs nothing ---------- */
export function screenLabor() {
  const n = state.run.node;
  if (!isObj(n.lab) || !Array.isArray(n.lab.list)) {
    n.lab = { list: (CFG().labor || MS.laborSet)(), i: 0, right: 0, guess: null };
    saveAll();
  }
  const L = n.lab;
  if (L.i >= L.list.length) return laborEnd();
  const ex = L.list[L.i];
  const title = NODE_INFO[n.type === 'taeusch' ? 'taeusch' : 'labor'].join(' ');
  const guessed = Number.isInteger(L.guess);
  const ok = L.guess === ex.a;
  const result = guessed
    ? `<p class="labres"><b>${ok ? 'Deine Vermutung stimmt.' : `Du hast „${esc(ex.opts[L.guess])}“ vermutet.`}</b> Ergebnis: ${esc(ex.opts[ex.a])}.</p><div class="notecard"><div class="eyebrow">Notiz</div>${esc(ex.note)}</div>`
    : '<p>Was vermutest du? Tippe auf deine Vermutung.</p>';
  render(`<div class="screen">${topbar(title)}<div class="scroll"><div class="card labor"><div class="eyebrow">Versuch ${L.i + 1} von ${L.list.length}</div><h3>${esc(ex.q)}</h3>${(guessed && ex.after) || ex.pic || ''}${result}</div></div>
      <div class="bottom">${guessed ? '<button class="btn" id="next">Weiter</button>' : `<div class="options ${ex.opts.length === 2 ? 'two' : ''}">${ex.opts.map((o, i) => `<button class="opt guess" data-i="${i}">${esc(o)}</button>`).join('')}</div>`}</div></div>`);
  if (guessed) {
    $('#next').onclick = () => {
      L.i++;
      L.guess = null;
      saveAll();
      screenLabor();
    };
    return;
  }
  app.querySelectorAll('.opt.guess').forEach((b) => {
    b.onclick = () => {
      L.guess = +b.dataset.i;
      if (L.guess === ex.a) {
        L.right++;
        SFX.right();
      }
      saveAll();
      screenLabor();
    };
  });
}
// same reward level as an event
function laborEnd() {
  const L = state.run.node.lab;
  const title = NODE_INFO[state.run.node.type === 'taeusch' ? 'taeusch' : 'labor'].join(' ');
  const m = gainXp(20);
  nodeDone();
  saveAll();
  render(
    `<div class="screen">${topbar(title)}<div class="scroll"><div class="card"><h2>Deine Notizkarte</h2><p>${L.right} von ${L.list.length} Vermutungen ${L.right === 1 ? 'hat' : 'haben'} gestimmt.</p><div class="notecard">${L.list.map((x) => `<div>• ${esc(x.note)}</div>`).join('')}</div><p>⭐ +20 XP</p>${m.map((x) => `<p style="color:var(--orange);font-weight:800">${x}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`,
  );
  $('#next').onclick = advance;
}

/* ---------- Schatzkarte: instead of a treasure; found = chest, two misses = a berry ---------- */
export function screenKarte() {
  const n = state.run.node;
  if (!enabledMods().includes('karte') || n.found) return screenTreasure();
  if (!isObj(n.hunt)) n.hunt = { tries: 0, task: null };
  if (!isObj(n.hunt.task)) {
    n.hunt.task = makeTask('karte', taskTier('karte'));
    saveAll();
  }
  const t = n.hunt.task;
  render(
    `<div class="screen">${topbar('🗺️ Schatzkarte')}<div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`,
  );
  ensureTutorial(t, () =>
    runTask(
      t,
      {
        container: $('#taskwrap'),
        bottom: $('#bottom'),
        subtitle: `Versuch ${n.hunt.tries + 1} von 2`,
        onResult: (ok) => {
          recordAnswer('karte', ok, t);
          if (ok) n.found = true;
          else {
            n.hunt.tries++;
            n.hunt.task = null;
            if (n.hunt.tries >= 2) {
              state.run.items.push('beere');
              nodeDone();
            }
          }
          saveAll();
        },
      },
      (ok) => {
        if (ok || !n.done) return screenKarte();
        render(
          `<div class="screen">${topbar('🗺️ Schatzkarte')}<div class="scroll"><div class="card center"><h2>Der Schatz bleibt versteckt</h2><p>Unter einem Busch findest du ${ITEMS.beere.icon} eine Beere.</p></div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`,
        );
        $('#next').onclick = advance;
      },
    ),
  );
}
