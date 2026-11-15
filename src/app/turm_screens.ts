import { MODES, SUBJECTS } from '../curriculum.ts';
import { MQ } from '../logic.ts';
import { isObj, own } from '../save.ts';
import { TW } from '../turm.ts';
import { TWART } from '../turmart.ts';
import { CONFETTI } from './collection.ts';
import { $, ITEMS, TYPES, app, esc, reducedMotion } from './core.ts';
import { confirmBox } from './elternbereich.ts';
import { showBag } from './map.ts';
import { heroSVG, monsterSVG, stampLine } from './progress.ts';
import { state } from './state.ts';
import { curGrade, endRun, saveAll, visSubjects } from './storage.ts';
import { joined, runTask, speakBtn } from './tasks.ts';
import { screenTitle } from './title.ts';
import {
  TURM_BAG,
  laneName,
  loadTurm,
  midName,
  startTurm,
  turmAnswer,
  turmAsk,
  turmBlocked,
  turmBuy,
  turmCtx,
  turmEliteText,
  turmEvoText,
  turmGateLine,
  turmGateText,
  turmHero,
  turmHeroes,
  turmLeave,
  turmNames,
  turmNextWave,
  turmRetry,
  turmReward,
  turmSources,
  turmStep,
  turmSubjAcc,
} from './turm.ts';
import { SFX, announce, ensureTutorial, fx, modal, render, topbar } from './ui.ts';

// start: a saved run first, else subjects and hero
export function screenTurm() {
  state.depth = 1;
  state.run = null;
  const r = loadTurm();
  if (!r) return screenTurmNew();
  const t = r.turm,
    h = r.hero,
    W = TW.WAVES.length;
  const phaseText =
    t.phase === 'fallen'
      ? 'Der Turm ist gefallen.'
      : t.phase === 'won'
        ? 'Alle Wellen sind vorbei.'
        : t.phase === 'build' || t.phase === 'reward'
          ? `Bauzeit nach Welle ${t.wave} von ${W}`
          : `Welle ${t.wave} von ${W}`;
  render(`<div class="screen">${topbar('🏰 Turmwacht')}<div class="scroll"><div class="card center tw-saved"><h2>Deine Turmwacht läuft</h2>${heroSVG(turmHero(h), h.evo)}<p>${phaseText}<br>❤️ ${h.hp} / ${h.maxHp}</p><p class="pnote">${[...new Set<string>(t.lanes.map((l) => l.subject))].map((s) => `${SUBJECTS[s]} ${esc(s)}`).join(' · ')}</p>${state.meta.turm.best ? `<p>Rekord: Welle ${state.meta.turm.best}</p>` : ''}</div></div>
      <div class="bottom"><div class="stack"><button class="btn" id="cont">Weiter (${r.grade !== curGrade().grade ? `Klasse ${r.grade}, ` : ''}Welle ${t.wave})</button><div class="row"><button class="btn secondary" id="back">Zurück</button><button class="btn secondary" id="new">Neu</button></div></div></div></div>`);
  $('#cont').onclick = () => {
    state.run = loadTurm();
    if (state.run) resumeTurm();
    else screenTurm();
  };
  $('#new').onclick = () =>
    confirmBox(
      'Neue Turmwacht?',
      '<p>Deine laufende Turmwacht wird gelöscht, sobald du die neue startest.</p>',
      'Ja, neu anfangen',
      screenTurmNew,
    );
  $('#back').onclick = screenTitle;
}
function screenTurmNew() {
  state.depth = 1;
  state.run = null;
  const grade = curGrade().grade,
    saved = !!loadTurm();
  const subs = visSubjects().filter((s) => turmSources(s.subject, grade).length);
  if (!subs.length) return screenTitle();
  const fixed = ((state.meta.turm.subjects || {})[grade] || []).filter((x) => subs.some((s) => s.subject === x));
  // the weakest subjects first: lowest share right, then least practised
  const weak = subs
    .map((s) => turmSubjAcc(s.subject, grade))
    .sort((a, b) => a.acc - b.acc || a.t - b.t)
    .slice(0, 3);
  const tip = weak.filter((x) => x.t > 0).map((x) => x.subject);
  let sel = fixed.length ? fixed : weak.map((x) => x.subject);
  const heroes = turmHeroes(grade);
  let hero = heroes[0];
  const subj = (s, fix?) =>
    `<${fix ? 'div' : 'button'} class="tw-subj${fix ? ' on fixed' : ''}" data-subj="${esc(s.subject)}"${fix ? '' : ' aria-pressed="false"'}><span class="ic" aria-hidden="true">${s.icon}</span><span class="nm">${esc(s.subject)}${!fix && tip.includes(s.subject) ? '<small>Hier kannst du stärker werden</small>' : ''}</span>${fix ? '' : '<span class="tick" aria-hidden="true">✓</span>'}</${fix ? 'div' : 'button'}>`;
  render(`<div class="screen">${topbar('🏰 Turmwacht')}<div class="scroll"><div class="stack">
      <p class="center tw-lead">Monster laufen auf den Wissensturm zu. Jede richtige Antwort trifft eins.</p>
      <div class="card"><h3>Fächer</h3>${
        fixed.length
          ? `<p class="pnote">Diese Fächer haben deine Eltern ausgewählt.</p><div class="tw-subjs">${subs
              .filter((s) => fixed.includes(s.subject))
              .map((s) => subj(s, true))
              .join('')}</div>`
          : `<p class="pnote" id="subnote" aria-live="polite">Wähle ein bis drei Fächer. Jedes Fach bekommt einen eigenen Weg.</p><div class="tw-subjs">${subs.map((s) => subj(s)).join('')}</div>`
      }<p class="pnote tw-review">Gefragt wird, was du schon geübt hast. Ein neues Fach beginnt mit seinem ersten Thema.</p></div>
      <div class="card"><h3>Dein Held</h3><div class="tw-heroes">${heroes.map((h, i) => `<button class="tw-hero" data-h="${i}" aria-pressed="false">${heroSVG(h.s, 0)}<span>${esc(h.s.names[0])}</span></button>`).join('')}</div><div id="evo"></div></div>
      </div></div><div class="bottom"><div class="row"><button class="btn secondary" id="back">Zurück</button><button class="btn" id="go">Start</button></div></div></div>`);
  const paint = () => {
    app.querySelectorAll<HTMLElement>('button[data-subj]').forEach((b) => {
      const on = sel.includes(b.dataset.subj);
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on as unknown as string);
    });
    app.querySelectorAll<HTMLElement>('[data-h]').forEach((b) => {
      const on = heroes[+b.dataset.h!] === hero;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on as unknown as string);
    });
    $('#evo').innerHTML =
      `<div class="tw-stages" aria-hidden="true">${[0, 1, 2].map((e) => heroSVG(hero.s, e)).join('')}</div><p class="pnote center">${esc(hero.s.names[0])} bekommt nach jedem Boss eine neue Gestalt.</p>`;
    $<HTMLButtonElement>('#go').disabled = !sel.length;
  };
  app.querySelectorAll<HTMLElement>('button[data-subj]').forEach((b) => {
    b.onclick = () => {
      const s = b.dataset.subj;
      if (sel.includes(s)) sel = sel.filter((x) => x !== s);
      else if (sel.length < 3) sel = sel.concat(s);
      else {
        $('#subnote').textContent = 'Höchstens drei Fächer. Tippe erst eins weg.';
        return;
      }
      paint();
    };
  });
  app.querySelectorAll<HTMLElement>('[data-h]').forEach((b) => {
    b.onclick = () => {
      hero = heroes[+b.dataset.h!];
      paint();
    };
  });
  $('#back').onclick = () => (saved ? screenTurm() : screenTitle());
  $('#go').onclick = () => {
    if (!sel.length) return;
    startTurm(
      subs.map((s) => s.subject).filter((s) => sel.includes(s)),
      { m: hero.m, id: hero.s.id },
    );
    turmSel = null;
    screenTurmBoard({
      ev: [{ t: 'wave', wave: 1 }].concat(
        state.run.turm.monsters.map((x) => ({ t: 'enter', id: x.id, lane: x.lane, cell: x.cell })),
      ),
    });
  };
  paint();
}
// resume exactly where it stopped: the saved question, the monsters' step after an answer, or the screen of the phase
function resumeTurm() {
  turmSel = null;
  state.turmMode = null;
  const t = state.run.turm;
  if (t.phase === 'task') {
    const names = turmNames();
    screenTurmBoard();
    return turmTask(turmAsk(), names);
  }
  if (t.phase === 'step') {
    const names = turmNames();
    return screenTurmBoard({ ev: turmStep(), names });
  }
  screenTurmBoard({ lines: ['Die Turmwacht geht weiter.'], quiet: true });
}

/* the board: an illustrated scene (TWART) with the Wissensturm in the middle and up to three paths to its gate.
     Everything is placed in board units (--x/--y of TWART.geo); CSS turns them into percentages of the board. */
let turmSel: number | null = null; // id of the monster whose card is open
let turmLost = 0; // ❤️ the tower lost in the turn on screen: stays marked at the tower until the next action
const turmTop = () => {
  const t = state.run.turm,
    n = t.monsters.length + t.queue.length;
  return topbar(
    `🏰 Welle ${t.wave}/${TW.WAVES.length}`,
    `<div class="world tw-res">${n && t.phase !== 'build' ? `<span class="tw-left">Noch ${n} Monster</span>` : ''}<span class="tw-bricks" aria-label="${t.ziegel} Ziegel">🧱 <b>${t.ziegel}</b></span></div>`,
  );
};
function turmMonLabel(x) {
  const t = state.run.turm;
  return [
    x.name,
    `Weg ${laneName(x.lane)}`,
    `noch ${x.cell} ${x.cell === 1 ? 'Feld' : 'Felder'} bis zum Turm`,
    TW.threats(state.run).includes(x.id) && (x.boss ? 'schlägt gleich wieder zu' : 'gleich am Turm'),
    `${x.hp} Lebenspunkte`,
    t.weak === x.id && 'doppelte Ziegel',
    x.again && 'Aufgabe von vorhin',
    !TW.canTarget(state.run, x.id) && 'geschützt',
    x.fresh && 'neu im Monsterbuch',
  ]
    .filter(Boolean)
    .join(', ');
}
// a monster faces the gate: the plain sprite looks right, the mirrored enemy sprite (flipped back by CSS) looks left
function turmMon(x, cols, right, ghost?) {
  const t = state.run.turm,
    sel = x.id === turmSel,
    pct = Math.max(4, (x.hp / x.maxHp) * 100),
    free = ghost || TW.canTarget(state.run, x.id);
  const threat = !ghost && TW.threats(state.run).includes(x.id);
  const tags = [threat && '⚠️', t.weak === x.id && '🎯', x.again && '🔁']
    .filter(Boolean)
    .map((e) => `<i>${e}</i>`)
    .join('');
  const ring = x.final
    ? TWART.shields(
        x.shields.map((l) => cols[l]),
        Math.round(x.maxHp / x.part) - x.shields.length,
      )
    : '';
  // guided wave 1: the first monster is marked until it is tapped
  const guide = t.wave === 1 && t.turn === 0 && turmSel === null && t.phase === 'choose';
  return (
    `<button class="tw-mon${sel ? ' sel' : ''}${free ? '' : ' guarded'}${t.weak === x.id ? ' weak' : ''}${right ? ' r' : ''}${x.boss || x.elite ? ' big' : ''}${guide ? ' guide' : ''}${threat ? ' threat' : ''}" data-id="${x.id}" aria-pressed="${sel}" aria-label="${esc(turmMonLabel(x))}">${monsterSVG(x.shape, TYPES[x.type].color, 0, right ? '' : 'enemy', { elite: x.elite, boss: x.boss })}${ring}${free ? '' : TWART.bubble()}` +
    `<span class="tw-stat">${x.steps > 1 || x.stun ? TWART.feet(x.steps, x.stun) : ''}<i class="tw-hp"><b class="${pct < 30 ? 'low' : pct < 60 ? 'mid' : ''}" style="width:${pct}%"></b></i></span>${tags ? `<span class="tw-tags" aria-hidden="true">${tags}</span>` : ''}</button>`
  );
}
// guards: the three typed starters or a boss from the Monsterbuch (look = its shape)
interface Guard {
  look: string;
  type: string;
  lvl: number;
}
const GUARD_LOOK = { fuchs: ['fox', 'feuer'], kroete: ['toad', 'wasser'], baer: ['bear', 'pflanze'] };
const turmGuardSVG = (g) => {
  const [shape, type] = GUARD_LOOK[g.look] || [g.look, g.type in TYPES ? g.type : 'normal'];
  return monsterSVG(shape, TYPES[type].color, 0, '', { boss: !GUARD_LOOK[g.look] });
};
// outro: the last turn of a wave on the board, without the Bauzeit marks
function turmBoardHtml(outro?) {
  const t = state.run.turm,
    h = state.run.hero,
    G = TWART.geo(t.lanes.length),
    cols = TWART.laneColors(t.lanes),
    pct = (h.hp / h.maxHp) * 100,
    build = t.phase === 'build' && !outro;
  const at = ([x, y]: (string | number)[]) => `--x:${x};--y:${y}`,
    pv = build && TW.preview(state.run, turmCtx(state.run.hero));
  const pick = (gd) =>
    build && (state.turmMode === 'guard' || (state.turmMode === 'up' && gd && gd.lvl < TW.GUARD_DMG.length));
  const tw = TWART.tower(t.floors, h.hp, h.maxHp);
  const lanes = G.lanes
    .slice(0, t.lanes.length)
    .map((g, i) => {
      const [hx, hy, side] = g.head;
      const cells = g.cells
        .map((c, k) => {
          const x = t.monsters.find((y) => y.lane === i && y.cell === k + 1);
          return `<div class="tw-cell" data-lane="${i}" data-cell="${k + 1}" style="${at(c)}">${x ? turmMon(x, cols, c[0] < G.gate[0] - 4) : ''}</div>`;
        })
        .join('');
      const spots = g.spots
        .map((p, s) => {
          const gd = t.guards[i + ':' + s],
            tag = pick(gd) ? 'button' : 'div';
          return `<${tag} class="tw-spot${gd ? ' on' : ''}${tag === 'button' ? ' pick' : ''}" data-lane="${i}" data-spot="${s}" style="${at(p)}"${tag === 'button' ? ` aria-label="${esc(`Wachplatz ${s + 1} am Weg ${laneName(i)}: ${gd ? `Wache Stufe ${gd.lvl}` : 'frei'}`)}"` : ' aria-hidden="true"'}>${gd ? `${turmGuardSVG(gd)}${TWART.pips(gd.lvl)}` : ''}</${tag}>`;
        })
        .join('');
      return `<div class="tw-lane" data-lane="${i}" role="group" aria-label="Weg ${esc(laneName(i))}" style="--c:${cols[i]}"><div class="tw-lanehead ${side}" style="${at([hx, hy])}"><span class="nm">${SUBJECTS[t.lanes[i].subject]} ${esc(laneName(i))}</span>${pv ? turmComing(pv[i]) : ''}</div>${spots}${cells}</div>`;
    })
    .join('');
  return `<div class="tw-board">${TWART.scene(t.lanes)}
      <div class="tw-tower" id="twt" style="--x:${G.gate[0]};--y:${G.gate[1] + 8};--th:${tw.h};--feet:${tw.feet}" data-floors="${t.floors.length}">${tw.back}<div class="tw-heroslot">${heroSVG(turmHero(), h.evo)}</div>${tw.front}</div>
      ${lanes}
      <div class="tw-hpbox ${G.hp[2]}${turmLost ? ' hurt' : ''}" style="${at(G.hp)}"><span class="hptext" aria-label="Turm: ${h.hp} von ${h.maxHp} Lebenspunkten">Turm ❤️ <b>${h.hp}</b>${state.run.shield ? ' 🛡️' : ''}${turmLost ? `<em class="tw-lost">−${turmLost}</em>` : ''}</span><span class="hpbar" aria-hidden="true"><i class="${turmBar(pct)}" style="width:${pct}%"></i></span></div>
      <div class="tw-fx" aria-hidden="true"><svg viewBox="0 0 ${G.w} ${G.h}" preserveAspectRatio="none"></svg></div></div>`;
}
const turmBar = (pct) => (pct < 30 ? 'low' : pct < 60 ? 'mid' : '');
// o: { ev: engine events to show, names: id → { name, acc, x } from before the answer, lines: extra log lines first, quiet: no auto-reading }
// o.still: the same screen again (a Bauzeit card was tapped), without the enter animation; o.bau: what was just bought (motion)
interface BoardOpts {
  ev?: any[];
  names?: Record<string, any>;
  lines?: string[];
  quiet?: boolean;
  still?: boolean;
  bau?: { guard?: string; up?: string; floor?: string; fix?: number };
}
export function screenTurmBoard(o: BoardOpts = {}) {
  state.depth = 2;
  const t = state.run.turm;
  const end = t.phase === 'fallen' || t.phase === 'won',
    next = end ? () => screenTurmEnd(o) : () => screenTurmCleared(o);
  const outro = o.ev && o.ev.some((e) => e.t === 'cleared' || e.t === 'fallen');
  // the wave's last turn plays on the board first; without motion the next screen comes at once
  if ((end || t.phase === 'reward' || outro) && !(outro && turmMotion(true))) return next();
  if (!t.monsters.some((x) => x.id === turmSel)) turmSel = null;
  if (t.phase !== 'build' || outro) state.turmMode = null;
  turmLost = (o.ev || []).reduce((a, e) => a + (e.t === 'tower' ? e.dmg : 0), 0);
  document.querySelectorAll<HTMLElement>('.floatnum').forEach((f) => f.remove()); // numbers of the turn before don't hang over this one
  const L = o.ev ? turmLines(o.ev, o.names || {}) : { hits: [], key: [], all: [] },
    own = o.lines || [];
  const hurt = L.hits.join(' '),
    rest = own.concat(L.key).join(' '),
    text = own.concat(L.all).join(' ');
  render(
    `<div class="screen tw-screen">${turmTop()}<div class="tw-main" style="--W:${TWART.geo(t.lanes.length).w};--H:${TWART.geo(t.lanes.length).h}">${turmBoardHtml(outro)}</div>${hurt || rest ? `<div class="log tw-log${hurt ? ' hurt' : ''}">${hurt ? `<p class="tw-hurtline">${esc(hurt)}</p>` : ''}${rest ? `<p>${esc(rest)}</p>` : ''}</div>` : ''}<div class="taskwrap" id="taskwrap"></div><div class="bottom tw-panel" id="bottom"></div></div>`,
    !!o.ev || !!o.still,
  );
  state.backTo = state.turmMode
    ? () => {
        state.turmMode = null;
        screenTurmBoard({ still: true });
      }
    : () => turmLeave(screenTurm);
  if (t.phase === 'build' && !outro) $('.tw-screen').classList.add('build');
  if (text) announce(text);
  if (hurt || rest) {
    const vis = joined(hurt, rest);
    speakBtn($('.tw-log'), 'afterbegin', () => vis, o.quiet ? null : () => vis, [], state.run.grade);
  }
  turmBind();
  const bauTut = t.phase === 'build' && !outro && !state.meta.seenTut['turm:bau'];
  if (outro) $('#bottom').innerHTML = '<button class="btn" id="twon">Weiter</button>';
  else turmPanel(t.phase === 'build' && !hurt && !rest && !o.still && !bauTut);
  const big = o.ev && o.ev.find((e) => e.t === 'enter' && (e.boss || e.elite)),
    bx = big && t.monsters.find((x) => x.id === big.id);
  const intro = t.phase === 'choose' && !state.meta.seenTut['turm:intro'];
  const hitTut = turmLost && !outro && !state.meta.seenTut['turm:hit'] ? () => turmHitTut(o) : null;
  if (o.ev && !intro && turmMotion()) turmPlay(o, outro ? next : bx ? () => turmBanner(bx, true) : hitTut);
  else if (o.ev) turmFx(o.ev);
  if (o.bau) turmBuilt(o.bau);
  if (intro) turmIntro();
  else if (bauTut) turmBauTut();
  else if (bx && !$('.tw-screen.playing')) turmBanner(bx);
  else if (hitTut && !$('.tw-screen.playing')) hitTut();
}
const turmBind = () =>
  app.querySelectorAll<HTMLElement>('button.tw-mon').forEach((b) => {
    b.onclick = () => {
      turmSel = +b.dataset.id!;
      turmPick();
    };
  });
function turmPick() {
  app.querySelectorAll<HTMLElement>('.tw-mon').forEach((b) => {
    const on = +b.dataset.id! === turmSel;
    b.classList.toggle('sel', on);
    b.classList.remove('guide');
    b.setAttribute('aria-pressed', on as unknown as string);
  });
  turmPanel(true);
}
// the panel under the board: monster card, hint or Bauzeit
function turmPanel(say) {
  const t = state.run.turm,
    bot = $('#bottom'),
    x = t.phase === 'choose' && t.monsters.find((y) => y.id === turmSel);
  $('.tw-screen').classList.toggle('carded', !!x);
  const row = (main) =>
    `<div class="row tw-baurow"><button class="btn secondary small" id="bag" aria-label="Beutel, ${state.run.items.length}">🎒 ${state.run.items.length}</button><button class="btn ghost small" id="home">Titel</button>${main}</div>`;
  if (t.phase === 'build') return turmBau(bot, say);
  if (!x) {
    const warn = turmGateText(t.monsters.filter((y) => TW.threats(state.run).includes(y.id)));
    const hint = warn
      ? `⚠️ ${warn}`
      : t.turn === 0 && t.wave === 1
        ? 'Tippe auf das Monster auf dem Weg.'
        : 'Tippe auf ein Monster.';
    bot.innerHTML = row(`<p class="tw-hint${warn ? ' warn' : ''}">${hint}</p>`);
  } else {
    const c = TW.card(state.run, x.id, turmCtx(state.run.hero))!,
      M = MODES[x.m],
      by = c.blockedBy && t.monsters.find((y) => y.id === c.blockedBy),
      cols = TWART.laneColors(t.lanes);
    const gate = TW.threats(state.run).includes(x.id) && turmGateLine(x);
    // only what changes the child's choice: the warning, the double Ziegel, a question from before, how a special monster behaves
    const tags = [
      gate && `<span class="tag gate">⚠️ ${gate}</span>`,
      c.weak && '<span class="tag weak">🎯 Doppelte Ziegel</span>',
      c.again && '<span class="tag again">🔁 Aufgabe von vorhin</span>',
      state.run.power && '<span class="tag power">🌶️ Doppelter Schaden</span>',
      x.boss && '<span class="tag boss">👑 Boss: langsam, aber stark</span>',
      x.elite && '<span class="tag elite">🛡️ schützt die Monster hinter sich</span>',
      x.steps > 1 && '<span class="tag boss">👣 Schnell: 2 Felder auf einmal</span>',
    ]
      .filter(Boolean)
      .join('');
    // the final boss: which subject the question comes from now, and how many shields are left
    const sh = x.final && x.shields[0],
      shield = x.final
        ? `<p class="tw-shieldnow"><i class="dot" style="background:${cols[sh]}" aria-hidden="true"></i><span>Die Aufgabe kommt aus ${SUBJECTS[t.lanes[sh].subject]} ${esc(laneName(sh))}. ${x.shields.length === 1 ? 'Das ist der letzte Schild.' : `Noch ${x.shields.length} Schilde.`}</span></p>`
        : '';
    bot.innerHTML = `<div class="card tw-card" id="twcard"><div class="tw-cardhead">${monsterSVG(x.shape, TYPES[x.type].color, 0, 'enemy', { elite: x.elite, boss: x.boss })}<div class="tw-cardinfo"><div class="tw-namerow"><div class="name">${esc(x.name)}</div><span class="tw-cardhp" aria-label="${x.hp} von ${x.maxHp} Lebenspunkten">❤️ ${x.hp}</span></div><div class="tw-from">Aufgabe aus: ${M.icon} ${esc(M.title)}</div></div></div>
        ${tags ? `<div class="tags">${tags}</div>` : ''}${shield}${by ? `<p class="tw-guard">${esc(turmBlocked(by))}</p>` : ''}</div>${row(`<button class="btn" id="atk"${by ? ' disabled' : ''}>Angreifen</button>`)}`;
    const said = () =>
      joined(
        x.name,
        'Aufgabe aus: ' + M.title,
        `${x.hp} Lebenspunkte`,
        gate,
        c.weak && 'Doppelte Ziegel',
        c.again && 'Aufgabe von vorhin',
        x.boss && 'Boss: langsam, aber stark',
        x.steps > 1 && 'schnell',
        x.final && `Die Aufgabe kommt aus ${laneName(sh)}`,
        by && turmBlocked(by),
      );
    speakBtn($('.tw-cardinfo .name', bot), 'beforeend', said, say ? said : null, [], state.run.grade);
    if (by) {
      const b = $(`.tw-mon[data-id="${x.id}"] .tw-bubble`);
      if (b) {
        b.classList.remove('flash');
        void b.getBoundingClientRect();
        b.classList.add('flash');
      }
    }
  }
  const on = (s, f) => {
    const el = $(s, bot);
    if (el) el.onclick = f;
  };
  on('#atk', () => {
    const names = turmNames(),
      task = turmAsk(turmSel);
    if (task) turmTask(task, names);
  });
  on('#bag', turmBag);
  on('#home', () => turmLeave(screenTitle));
}
/* Bauzeit: cards under the board; a guard card waits for a spot on the board, then for the guard's look */
// 'guard' | 'up' while a card waits for a spot (not saved: a reload shows the cards again)
const FLOOR_FX = {
  chain: 'trifft auch das vorderste Monster auf einem anderen Weg.',
  stun: 'Das Monster bleibt einen Zug stehen.',
  repair: `Der Turm bekommt ${TW.REPAIR_HP} ❤️.`,
  brick: '1 🧱 mehr.',
  push: 'Das vorderste Monster geht ein Feld zurück.',
  volley: 'Die Wachen schießen zweimal.',
};
// the coming wave on a path's name chip
function turmComing(p) {
  if (!p.n) return '';
  const said = `Nächste Welle: ${p.n} Monster${p.final ? ', der letzte Boss' : p.boss ? ', ein Boss' : ''}${p.elite ? ', ein Elitemonster' : ''}${p.fast ? `, ${p.fast} schnell` : ''}`;
  return `<span class="tw-queue tw-coming" aria-label="${said}">${p.n} ${p.n === 1 ? 'kommt' : 'kommen'}${p.boss || p.final ? ' 👑' : ''}${p.elite ? ' 🛡️' : ''}${p.fast ? ' 👣' : ''}</span>`;
}
function turmComingText() {
  const pv = TW.preview(state.run, turmCtx(state.run.hero)),
    n = pv.reduce((a, p) => a + p.n, 0);
  const extra = pv.some((p) => p.final)
    ? ', darunter der letzte Boss'
    : pv.some((p) => p.boss)
      ? ', darunter ein Boss'
      : pv.some((p) => p.elite)
        ? ', darunter ein Elitemonster'
        : '';
  return `Welle ${state.run.turm.wave + 1} von ${TW.WAVES.length}: ${n} Monster${extra}.`;
}
// every card with its price (null: nothing to pay) and why it can't be used now
interface BauCard {
  id: string;
  name: string;
  pic: string;
  price: number;
  desc: string;
  label?: string | null;
  note?: string;
  why?: string;
  // Ziegel still missing
  short?: number;
}
function turmCards() {
  const t = state.run.turm,
    G = Object.values<Guard>(t.guards),
    ups = G.filter((g) => g.lvl < TW.GUARD_DMG.length),
    free = TW.price(state.run, { kind: 'guard', lane: 0, spot: 0 }) === 0;
  const upP = [...new Set(ups.map((g) => TW.COST.up[g.lvl - 1]))].sort((a, b) => a - b);
  const full = G.length === t.lanes.length * TW.SPOTS;
  const cards = (
    [
      {
        id: 'guard',
        name: 'Wache aufstellen',
        pic: 'guard',
        price: free ? 0 : TW.COST.guard,
        desc: 'Die Wache schießt mit, wenn du auf ihrem Weg richtig antwortest.',
        note: full ? 'Alle Plätze sind besetzt. Eine neue Wache ersetzt eine alte.' : '',
      },
      {
        id: 'up',
        name: 'Wache verbessern',
        pic: 'up',
        price: upP[0] ?? TW.COST.up[0],
        label: upP.length > 1 ? upP.join(' / ') : null,
        desc: 'Die Wache trifft stärker.',
        why: !G.length ? 'Stell zuerst eine Wache auf.' : !ups.length ? 'Alle Wachen haben Stufe 3.' : '',
      },
    ] as BauCard[]
  )
    .concat(
      [...new Set<string>(t.lanes.map((l) => l.subject))].map((s) => ({
        id: 'floor:' + s,
        name: TWART.ROOMS[s].name,
        pic: s,
        price: TW.COST.floor,
        desc: `Richtig in ${s}: ${FLOOR_FX[TW.FLOORS[s]]}`,
        why: t.floors.includes(s) ? 'Schon gebaut.' : '',
      })),
    )
    .concat({
      id: 'fix',
      name: 'Mauer flicken',
      pic: 'fix',
      price: TW.COST.fix,
      desc: `Der Turm bekommt ${TW.FIX_HP} ❤️.`,
      why: state.run.hero.hp >= state.run.hero.maxHp ? 'Der Turm ist heil.' : '',
    });
  for (const c of cards) c.short = c.why ? 0 : Math.max(0, c.price - t.ziegel);
  return cards;
}
function turmBau(bot: HTMLElement, say) {
  const t = state.run.turm,
    home = () => turmLeave(screenTitle);
  if (state.turmMode) {
    const text =
      state.turmMode === 'guard'
        ? `Tippe auf einen Platz am Weg.${Object.keys(t.guards).length ? ' Steht dort schon eine Wache, wird sie ersetzt.' : ''}`
        : 'Tippe auf die Wache, die stärker werden soll.';
    bot.innerHTML = `<div class="card tw-card tw-pickhint"><p>${text}</p><p class="tw-bmsg" role="status"></p><button class="btn secondary" id="pickno">Zurück</button></div>`;
    speakBtn(
      $('.tw-pickhint p'),
      'beforeend',
      () => text,
      () => text,
      [],
      state.run.grade,
    );
    $('#pickno', bot).onclick = state.backTo;
    app.querySelectorAll<HTMLElement>('button.tw-spot').forEach((b) => {
      b.onclick = () => turmSpot(+b.dataset.lane!, +b.dataset.spot!);
    });
    return;
  }
  const cards = turmCards(),
    coming = turmComingText();
  bot.innerHTML = `<div class="tw-bau"><div class="tw-bauhead"><h3>Bauzeit</h3><p>${coming}</p></div>
      <div class="tw-cards" role="list">${cards.map((c) => `<div role="listitem"><button class="tw-buy${c.why ? ' off' : c.short ? ' short' : ''}" data-card="${esc(c.id)}" aria-disabled="${!!(c.why || c.short)}">${TWART.picture(c.pic)}<b>${esc(c.name)}</b><span class="tw-price${c.why ? ' done' : ''}">${c.why ? '' : c.short ? `Noch ${c.short} 🧱` : c.price ? `${c.label || c.price} 🧱` : 'geschenkt'}</span></button></div>`).join('')}</div>
      <div class="row tw-baurow"><button class="btn secondary small" id="bag" aria-label="Beutel, ${state.run.items.length}">🎒 ${state.run.items.length}</button><button class="btn ghost small" id="home">Titel</button><button class="btn" id="nextwave">Welle ${t.wave + 1} starten</button></div></div>`;
  const said = () =>
    joined(
      'Bauzeit',
      coming,
      ...cards.map((c) => joined(c.name, c.why || (c.price ? `${c.label || c.price} Ziegel` : 'geschenkt'))),
    );
  speakBtn($('.tw-bauhead h3'), 'beforeend', said, say ? said : null, [], state.run.grade);
  bot.querySelectorAll<HTMLElement>('[data-card]').forEach((b) => {
    b.onclick = () => turmSheet(cards.find((x) => x.id === b.dataset.card));
  });
  $('#bag', bot).onclick = turmBag;
  $('#home', bot).onclick = home;
  $('#nextwave', bot).onclick = () => {
    const names = turmNames(),
      ev = turmNextWave();
    screenTurmBoard({ ev, names });
  };
}
function turmSheet(c) {
  const t = state.run.turm,
    pick = c.id === 'guard' || c.id === 'up',
    no = c.why || (c.short ? `Dafür fehlen dir noch ${c.short} Ziegel.` : '');
  const cost = no
    ? ''
    : !c.price
      ? 'Die erste Wache ist geschenkt.'
      : pick && c.label
        ? `Kostet ${c.label} 🧱, je nach Stufe.`
        : `Kostet ${c.price} 🧱. Danach hast du noch ${t.ziegel - c.price} 🧱.`;
  const text = [c.desc, c.note, cost].filter(Boolean).join(' ');
  const ov = modal(
    `<div class="tw-sheet">${TWART.picture(c.pic)}<h2>${esc(c.name)}</h2><p>${esc(text)}</p><p class="tw-bmsg" role="status">${esc(no)}</p></div><div class="row"><button class="btn secondary" id="no">Zurück</button><button class="btn" id="build"${no ? ' disabled' : ''}>${pick ? 'Platz aussuchen' : 'Bauen'}</button></div>`,
  );
  const said = () => joined(c.name, text, no);
  speakBtn($('h2', ov), 'beforeend', said, said, [], state.run.grade);
  $('#no', ov).onclick = () => ov.remove();
  $('#build', ov).onclick = () => {
    ov.remove();
    if (pick) {
      state.turmMode = c.id;
      return screenTurmBoard({ still: true });
    }
    if (c.id === 'fix') {
      const hp = state.run.hero.hp;
      if (turmBuy({ kind: 'fix' }))
        screenTurmBoard({
          still: true,
          bau: { fix: hp },
          lines: [`Die Mauer ist geflickt: ❤️ ${state.run.hero.hp} / ${state.run.hero.maxHp}.`],
        });
      return;
    }
    const sub = c.id.slice(6);
    if (turmBuy({ kind: 'floor', subject: sub })) {
      SFX.levelup();
      screenTurmBoard({ still: true, bau: { floor: sub }, lines: [`${TWART.ROOMS[sub].name} ist fertig. ${c.desc}`] });
    }
  };
}
function turmSpot(lane, spot) {
  const t = state.run.turm,
    k = lane + ':' + spot,
    g = t.guards[k];
  if (state.turmMode === 'guard') return turmLooks(lane, spot);
  const p = TW.price(state.run, { kind: 'up', lane, spot });
  if (p < 0) return;
  if (p > t.ziegel) {
    $('.tw-bmsg').textContent = `Dafür fehlen dir noch ${p - t.ziegel} Ziegel.`;
    return;
  }
  turmBuy({ kind: 'up', lane, spot });
  state.turmMode = null;
  screenTurmBoard({
    still: true,
    bau: { up: k },
    lines: [`Die Wache am Weg ${laneName(lane)} ist jetzt auf Stufe ${g.lvl}.`],
  });
}
// the three typed guards, and the bosses of this grade from the Monsterbuch as normal-type guards
function turmGuardLooks() {
  const typed = Object.entries(GUARD_LOOK).map(([look, [, type]]) => ({
    look,
    type,
    name: MQ.STARTERS.find((s) => s.id === look)!.names[0],
  }));
  const isBoss = (m, name) => Object.values(MODES[m].enemies).some((w) => isObj(w) && w.boss && w.boss.name === name);
  const bosses = Object.entries(state.meta.dex)
    .filter(
      ([name, e]) =>
        isObj(e) &&
        typeof e.shape === 'string' &&
        own(MODES, e.mode) &&
        MODES[e.mode].grade === state.run.grade &&
        isBoss(e.mode, name),
    )
    .map(([name, e]) => ({ look: e.shape, type: 'normal', name }))
    .filter((x, i, a) => !GUARD_LOOK[x.look] && a.findIndex((y) => y.look === x.look) === i);
  return typed.concat(bosses);
}
function turmLooks(lane, spot) {
  const t = state.run.turm,
    p = TW.price(state.run, { kind: 'guard', lane, spot }),
    old = t.guards[lane + ':' + spot],
    looks = turmGuardLooks();
  const head = `Wache am Weg ${laneName(lane)}. ${p ? `Kostet ${p} 🧱.` : 'Die erste Wache ist geschenkt.'}${old ? ' Die Wache auf diesem Platz geht dafür weg.' : ''}`;
  const ov = modal(
    `<h2>Welche Wache?</h2><p class="pnote">${esc(head)}</p><div class="tw-looks">${looks.map((x, i) => `<button class="choice tw-look" data-l="${i}">${turmGuardSVG({ look: x.look, type: x.type })}<span class="name">${esc(x.name)}</span></button>`).join('')}</div><button class="btn secondary" id="no">Zurück</button>`,
  );
  const said = () => joined('Welche Wache', head, ...looks.map((x) => x.name));
  speakBtn($('h2', ov), 'beforeend', said, said, [], state.run.grade);
  $('#no', ov).onclick = () => ov.remove();
  ov.querySelectorAll<HTMLElement>('[data-l]').forEach((b) => {
    b.onclick = () => {
      const x = looks[+b.dataset.l!];
      ov.remove();
      if (!turmBuy({ kind: 'guard', lane, spot, look: x.look, type: x.type })) return;
      state.turmMode = null;
      screenTurmBoard({
        still: true,
        bau: { guard: lane + ':' + spot },
        lines: [GUARD_LOOK[x.look] ? `${x.name} steht jetzt am Weg ${laneName(lane)}.` : `${x.name} hilft dir jetzt.`],
      });
    };
  });
}
function turmBauTut() {
  const steps = [
    'Mit Ziegeln 🧱 machst du den Turm stärker. Die erste Wache ist geschenkt.',
    'Eine Wache hilft dir auf ihrem Weg.',
    `Bist du fertig, tippe auf „Welle ${state.run.turm.wave + 1} starten“.`,
  ];
  const ov = modal(
    `<h2>🧱 Bauzeit</h2><ol>${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol><button class="btn" id="tutok" style="margin-top:12px">Verstanden</button>`,
  );
  speakBtn($('h2', ov), 'afterbegin', () => joined(...steps), undefined, [], state.run.grade);
  $('#tutok', ov).focus({ preventScroll: true });
  $('#tutok', ov).onclick = () => {
    ov.remove();
    state.meta.seenTut['turm:bau'] = true;
    saveAll();
  };
}
// after the wave-3 boss: half of the run is done, a good moment to stop
function turmPause() {
  const text = 'Gute Stelle für eine Pause – alles ist gespeichert.';
  const ov = modal(
    `<p class="tw-pause">${text}</p><div class="row"><button class="btn secondary" id="ptitle">Zum Titel</button><button class="btn" id="tutok">Weiter</button></div>`,
  );
  speakBtn(
    $('.tw-pause', ov),
    'beforeend',
    () => text,
    () => text,
    [],
    state.run.grade,
  );
  $('#tutok', ov).focus({ preventScroll: true });
  $('#tutok', ov).onclick = () => ov.remove();
  $('#ptitle', ov).onclick = () => {
    ov.remove();
    turmLeave(screenTitle);
  };
}
// the normal task view; answered → the engine's events and the monsters' step are shown on the board
function turmTask(task, names) {
  const a = state.run.turm.asking,
    x = state.run.turm.monsters.find((y) => y.id === a.id);
  $('.screen').classList.add('tasking');
  $('#bottom').innerHTML = '';
  state.backTo = () => {}; // a question stays until it is answered
  const hint = !!state.run.hint;
  state.run.hint = false;
  let ev = [];
  ensureTutorial(task, () =>
    runTask(
      task,
      {
        container: $('#taskwrap'),
        bottom: $('#bottom'),
        subtitle: x ? x.name : '',
        hint,
        onResult: (ok) => {
          ev = turmAnswer(ok);
        },
      },
      () => {
        turmSel = null;
        screenTurmBoard({ ev: ev.concat(turmStep()), names });
      },
    ),
  );
}
function turmBag() {
  if (state.run.turm.phase !== 'choose')
    return showBag(
      null,
      Object.assign(
        {
          done: (it) =>
            screenTurmBoard({ still: true, lines: [`${it.name} benutzt: Der Turm hat jetzt ${state.run.hero.hp} ❤️.`] }),
        },
        TURM_BAG,
      ),
    );
  // a potion takes the turn, like in a fight; the other items don't
  showBag((it) => {
    if (it.heal) {
      const hp = state.run.hero.hp,
        names = turmNames();
      return screenTurmBoard({ lines: [`${it.name} benutzt: Der Turm hat jetzt ${hp} ❤️.`], ev: turmStep(), names });
    }
    screenTurmBoard({
      lines: [
        it.shield
          ? 'Der Schild hält das nächste Monster am Turm auf.'
          : it.power
            ? 'Dein nächster Treffer macht doppelten Schaden.'
            : 'Bei der nächsten Aufgabe gibt es einen Tipp.',
      ],
    });
  }, TURM_BAG);
}
// the log under the board, one short sentence per thing that happened. names: id → { name, acc } from before the answer
// → { hits: the tower's losses, key: what matters and is easy to miss, all: everything (for screen readers) }
export function turmLines(ev, names) {
  const t = state.run.turm,
    cur = turmNames(),
    who = (id) => names[id] || cur[id] || { name: 'Ein Monster', acc: 'ein Monster' };
  const n = (id) => who(id).name,
    acc = (id) => who(id).acc,
    all: any[] = [],
    key: any[] = [],
    L = {
      push: (s, k?) => {
        all.push(s);
        if (k) key.push(s);
      },
    },
    hits: any[] = [];
  let fresh = 0,
    z = 0;
  ev.forEach((e, i) => {
    const next = ev[i + 1],
      gone = next && next.t === 'beaten' && next.id === e.id;
    if (e.t === 'wave') L.push(`Welle ${e.wave} von ${TW.WAVES.length}.`);
    else if (e.t === 'wrong') L.push('Die Monster rücken vor.');
    else if (e.t === 'again' && t.wave < TW.WAVES.length && !state.meta.seenTut['turm:again']) {
      state.meta.seenTut['turm:again'] = true;
      L.push('🔁 Diese Aufgabe kommt in der nächsten Welle noch einmal.', true);
    } else if (e.t === 'hit') L.push(`${n(e.id)} bekommt ${e.dmg} Schaden${gone ? ' und ist besiegt' : ''}.`);
    else if (e.t === 'shot') {
      // the guards of a path fire one after another at the same monster: one sentence for all of them
      if (ev[i - 1] && ev[i - 1].t === 'shot' && ev[i - 1].id === e.id) return;
      let k = i,
        d = 0;
      while (ev[k] && ev[k].t === 'shot' && ev[k].id === e.id) d += ev[k++].dmg;
      L.push(`${k - i > 1 ? 'Die Wachen treffen' : 'Die Wache trifft'} ${acc(e.id)}: ${d} Schaden.`);
    } else if (e.t === 'chain') L.push(`Die Rechenstube trifft auch ${acc(e.id)}: ${e.dmg} Schaden.`, true);
    else if (e.t === 'beaten') {
      const p = ev[i - 1];
      if (!(p && p.t === 'hit' && p.id === e.id)) L.push(`${n(e.id)} ist besiegt.`);
    } else if (e.t === 'shield') {
      const x = t.monsters.find((y) => y.id === e.id);
      L.push(
        `Der Schild für ${laneName(e.lane)} ist zerbrochen.${x ? ` Jetzt kommen die Aufgaben aus ${laneName(x.shields[0])}.` : ''}`,
        true,
      );
    } else if (e.t === 'stun') L.push(`Die Druckerei hält ${acc(e.id)} kurz auf.`, true);
    else if (e.t === 'push') L.push(`Die Glockenstube schiebt ${acc(e.id)} ein Feld zurück.`, true);
    else if (e.t === 'floor' && e.fx === 'volley') L.push('Die Plauderstube: Die Wachen schießen noch einmal.', true);
    else if (e.t === 'heal') L.push(`Der Kartoffelkeller repariert den Turm: +${e.n} ❤️.`, true);
    else if (e.t === 'patch') L.push(`Nach der Welle wird die Mauer geflickt: +${e.n} ❤️.`, true);
    else if (e.t === 'tower') hits.push(`${n(e.id)} ist am Turm angekommen: −${e.dmg} ❤️.`);
    else if (e.t === 'hold') L.push(`${n(e.id)} kommt nicht durch die Mauer.`, true);
    else if (e.t === 'block') L.push(`${n(e.id)} prallt am Schild ab.`, true);
    else if (e.t === 'enter') {
      if (e.boss || e.elite) L.push(`${n(e.id)} kommt.`);
      else if (!ev.some((x) => x.t === 'wave')) fresh++;
    } else if (e.t === 'cleared') L.push(`Welle ${e.wave} ist vorbei.`);
    else if (e.t === 'ziegel') z += e.n;
  });
  if (fresh) L.push(fresh === 1 ? 'Ein neues Monster kommt.' : `${fresh} neue Monster kommen.`);
  // guided wave 1: the first step is explained once it has happened
  if (
    t.wave === 1 &&
    t.turn === 1 &&
    t.phase === 'choose' &&
    ev.some((e) => e.t === 'move') &&
    !ev.some((e) => e.t === 'wrong')
  )
    L.push('Nach jeder Aufgabe gehen die Monster ein Feld weiter.', true);
  if (z) L.push(`+${z} 🧱${ev.some((e) => e.t === 'ziegel' && e.why === 'weak') ? ', doppelt durch 🎯' : ''}.`);
  const seen = t.monsters.filter((x) => x.fresh).map((x) => midName(x.name));
  if (seen.length) L.push(`Neu im Monsterbuch: ${seen.join(', ')}.`);
  return { hits, key, all: hits.concat(all) };
}
/* Motion. The board is drawn in its final state first (saved, tappable, what screen readers and tests see); turmPlay then
     replays the turn on top of it in short beats. A tap on the board jumps to the end. Timers only touch a board that is still
     on screen and not covered by a task. Without layout (tests) or with „Bewegung reduzieren“ everything is shown at once. */
// test hook: a number forces the motion, at that speed factor
// some callers pass an argument; it is ignored
const turmMotion: (outro?: boolean) => boolean = () =>
  state.turmSpeed != null || (!reducedMotion && app.clientWidth > 0);
const TW_STEP = 300; // one field of walking, ms
function turmPlay(o, after) {
  const t = state.run.turm,
    scr = $('.tw-screen'),
    board = $('.tw-board', scr),
    G = TWART.geo(t.lanes.length),
    cols = TWART.laneColors(t.lanes);
  const names = o.names || {},
    ev = o.ev,
    k = state.turmSpeed || 1,
    timers: any[] = [],
    fx = $('.tw-fx', board),
    fsvg = $('svg', fx),
    flyers: any[] = [];
  const alive = () => board.isConnected && !scr.classList.contains('tasking');
  let stopped = false;
  const later = (ms, f) =>
    timers.push(
      setTimeout(() => {
        if (!stopped && alive()) f();
      }, ms * k),
    );
  const at = (p) => `--x:${p[0]};--y:${p[1]}`;
  const add = (html, p, ms?) => {
    const d = document.createElement('div');
    d.className = 'tw-fxi';
    d.setAttribute('style', at(p));
    d.innerHTML = html;
    fx.appendChild(d);
    if (ms) later(ms, () => d.remove());
    return d;
  };
  // numbers that pop at the same spot while earlier ones still show (hero, then guards) move aside instead of covering them
  const live = {},
    SHIFT = [
      [0, 0],
      [26, -18],
      [-26, -30],
      [0, -44],
    ];
  const num = (p, n, cls) => {
    const key = Math.round(p[0]) + ':' + Math.round(p[1]),
      i = (live[key] = (live[key] || 0) + 1),
      [dx, dy] = SHIFT[(i - 1) % SHIFT.length];
    later(1000, () => {
      live[key]--;
    });
    return add(`<span class="tw-num ${cls || ''}">${n}</span>`, [p[0] + dx, p[1] - 14 + dy], 1000);
  };
  const again = (el, cls) => {
    if (!el) return;
    el.classList.remove(cls);
    void el.getBoundingClientRect();
    el.classList.add(cls);
  };
  // a thrown thing: an arc from p to q (board units) with the Web Animations API; lands after ms
  const throwIt = (html, p, q, ms, h, spin) => {
    const d = add(html, p),
      u = board.clientWidth / G.w,
      dx = (q[0] - p[0]) * u,
      dy = (q[1] - p[1]) * u,
      up = h * u;
    if (d.animate)
      d.animate(
        [0, 0.25, 0.5, 0.75, 1].map((f) => ({
          translate: `${dx * f}px ${dy * f - up * 4 * f * (1 - f)}px`,
          rotate: spin ? `${spin * f}deg` : '0deg',
        })),
        { duration: ms * k, easing: 'linear', fill: 'forwards' },
      );
    later(ms, () => d.remove());
    return d;
  };
  // where things are: monster bodies, the hero, the tower's rooms, the gate
  const cellP = (lane, c) => G.lanes[lane].cells[c - 1];
  const body = (p) => [p[0], p[1] - 20];
  const n = t.floors.length,
    top = G.gate[1] + 8 - TWART.towerH(n);
  const heroP = [G.gate[0] - 9, top + TWART.TOWER.TOP - 26],
    roomP = (s) => [G.gate[0], G.gate[1] - 69 - 38 * Math.max(0, t.floors.indexOf(s))];
  const towerP = [G.gate[0], G.gate[1] - 40];
  // every token: its element, the point it is anchored at and where it shows now
  const tok: Record<string, any> = {},
    anchor = {},
    cur = {};
  const place = (id, p, ms?) => {
    const el = tok[id];
    if (!el) return;
    const a = anchor[id];
    el.style.transition = ms ? `translate ${ms * k}ms ease-in-out, opacity ${ms * k}ms` : 'none';
    el.style.translate = `calc(${p[0] - a[0]} * var(--u)) calc(${p[1] - a[1]} * var(--u))`;
    cur[id] = p;
  };
  const pre = (id) => names[id] && names[id].x;
  board.querySelectorAll<HTMLElement>('button.tw-mon').forEach((b) => {
    const id = +b.dataset.id!,
      x = t.monsters.find((y) => y.id === id);
    tok[id] = b;
    anchor[id] = cur[id] = cellP(x.lane, x.cell);
  });
  // beaten monsters and those that walked into the gate come back as ghosts where they stood
  for (const id of new Set<number>(ev.filter((e) => e.t === 'beaten' || e.gone).map((e) => e.id))) {
    const x = pre(id);
    if (!x || !x.cell || tok[id]) continue;
    const c = cellP(x.lane, x.cell),
      cell = board.querySelector<HTMLElement>(`.tw-cell[data-lane="${x.lane}"][data-cell="${x.cell}"]`)!;
    cell.insertAdjacentHTML(
      'beforeend',
      turmMon(x, cols, c[0] < G.gate[0] - 4, true)
        .replace('<button class="tw-mon', '<div aria-hidden="true" class="tw-mon tw-ghost')
        .replace(/<\/button>$/, '</div>'),
    );
    tok[id] = cell.lastElementChild;
    anchor[id] = cur[id] = c;
  }
  // back to how it looked before the answer
  const entering = ev.filter((e) => e.t === 'enter');
  for (const id of Object.keys(tok)) {
    const x = pre(id),
      first = ev.find((e) => e.id === +id && (e.t === 'move' || e.t === 'push'));
    if (entering.some((e) => e.id === +id)) {
      const L = t.monsters.find((y) => y.id === +id).lane;
      place(id, G.lanes[L].from[0]);
      tok[id].style.opacity = 0;
    } else if (x && x.cell) place(id, cellP(x.lane, x.cell));
    else if (first) place(id, cellP(t.monsters.find((y) => y.id === +id).lane, first.from));
    const bar = $('.tw-hp b', tok[id]);
    if (x && bar && !tok[id].classList.contains('tw-ghost'))
      bar.style.width = Math.max(4, (x.hp / x.maxHp) * 100) + '%';
  }
  const res = (cls) => $(`.topbar .${cls} b`, scr),
    hpBox = $('.tw-hpbox', board),
    hpNow = $('.hptext b', hpBox),
    hpBar = $('.hpbar i', hpBox),
    twt = $('#twt', board);
  const setHp = (hp) => {
    const pct = (hp / state.run.hero.maxHp) * 100;
    hpNow.textContent = hp;
    hpBar.style.width = pct + '%';
    hpBar.className = turmBar(pct);
  };
  const towerArt = (hp) => {
    const tw = TWART.tower(t.floors, hp, state.run.hero.maxHp);
    twt.querySelector<HTMLElement>('.tw-towerart')!.outerHTML = tw.back;
    twt.querySelector<HTMLElement>('.tw-parapet')!.outerHTML = tw.front;
  };
  const level = (hp) => (hp > (state.run.hero.maxHp * 2) / 3 ? 0 : hp > state.run.hero.maxHp / 3 ? 1 : 2);
  const hpEv = ev.find((e) => e.t === 'tower' || e.t === 'heal' || e.t === 'patch');
  let hp = hpEv ? (hpEv.t === 'tower' ? hpEv.hp + hpEv.dmg : hpEv.hp - hpEv.n) : state.run.hero.hp;
  if (hp !== state.run.hero.hp) {
    setHp(hp);
    if (level(hp) !== level(state.run.hero.hp)) towerArt(hp);
  }
  // the „−7“ at the tower's ❤️ counts up with each hit
  const lostEl = $('.tw-lost', hpBox);
  let lostNow = 0;
  const hurtLog = $('.tw-log.hurt', scr);
  const showLost = () => {
    if (!lostEl) return;
    lostEl.hidden = !lostNow;
    lostEl.textContent = '−' + lostNow;
    hpBox.classList.toggle('hurt', !!lostNow);
    if (hurtLog) hurtLog.style.visibility = lostNow ? '' : 'hidden';
  };
  showLost();
  let bricks = t.ziegel - ev.filter((e) => e.t === 'ziegel').reduce((a, e) => a + e.n, 0);
  res('tw-bricks').textContent = bricks as unknown as string;
  const evo = ev.find((e) => e.t === 'evolve'),
    slot = $('.tw-heroslot', board);
  if (evo) slot.innerHTML = heroSVG(turmHero(), evo.evo - 1);
  const shieldEv = ev.find((e) => e.t === 'shield'),
    ringNow = shieldEv && tok[shieldEv.id] && $('.tw-shields', tok[shieldEv.id]);
  if (ringNow) {
    const x = pre(shieldEv.id);
    ringNow.insertAdjacentHTML(
      'afterend',
      TWART.shields(
        x.shields.map((l) => cols[l]),
        Math.round(x.maxHp / x.part) - x.shields.length,
      ),
    );
    ringNow.hidden = true;
  }

  /* the beats: [ms until the next one, what happens] */
  const hit = (id, dmg, big, crit, hp1) => {
    const el = tok[id];
    again(el, 'tw-hit');
    num(body(cur[id] || [0, 0]), '−' + dmg, crit ? 'crit' : '');
    const x = pre(id),
      bar = el && $('.tw-hp b', el);
    if (bar && x) {
      const pct = Math.max(4, (Math.max(0, hp1) / x.maxHp) * 100);
      bar.style.width = pct + '%';
      bar.className = pct < 30 ? 'low' : pct < 60 ? 'mid' : '';
    }
    if (big) {
      add('<i class="tw-burst"></i>', body(cur[id]), 600);
      SFX.crit();
    } else if (crit) SFX.crit();
    else SFX.hit();
  };
  const heroType = TYPES[turmHero().type].color,
    B: any[] = [];
  const walk = (id, path, ms) =>
    path.forEach((p, i) =>
      later(i * ms, () => {
        place(id, p, ms);
        again(tok[id], 'tw-step');
      }),
    );
  const lastHit: Record<string, any> = {}; // who was hit last, so the Ziegel fly from there
  for (let i = 0; i < ev.length; i++) {
    const e = ev[i];
    if (e.t === 'hit')
      B.push([
        e.weak ? 520 : 450,
        () => {
          again(slot, 'tw-throw');
          SFX.swish();
          lastHit.p = body(cur[e.id]);
          throwIt(TWART.orb(heroType, e.weak), [heroP[0], heroP[1] - 6], body(cur[e.id]), 340, 34, 0);
          later(340, () => hit(e.id, e.dmg, e.weak, e.weak || e.strong, e.hp));
        },
      ]);
    else if (e.t === 'shot') {
      const [L, sp] = e.from.split(':').map(Number),
        g = t.guards[e.from],
        p = G.lanes[L].spots[sp];
      B.push([
        ev[i + 1] && ev[i + 1].t === 'shot' ? 200 : 300,
        () => {
          again(board.querySelector<HTMLElement>(`.tw-spot[data-lane="${L}"][data-spot="${sp}"]`), 'tw-fire');
          SFX.shot(g ? g.lvl : 1);
          throwIt(
            TWART.orb(TYPES[g ? g.type : 'normal'].color, g && g.lvl > 2).replace('tw-orb', `tw-orb g${g ? g.lvl : 1}`),
            [p[0], p[1] - 24],
            body(cur[e.id]),
            260,
            18,
            0,
          );
          later(260, () => hit(e.id, e.dmg, false, e.strong, e.hp));
        },
      ]);
    } else if (e.t === 'chain')
      B.push([
        380,
        () => {
          const a = body(cur[e.from] || lastHit.p || towerP),
            b = body(cur[e.id]),
            mid = (f, j) => [a[0] + (b[0] - a[0]) * f + j, a[1] + (b[1] - a[1]) * f - j];
          const d = [a, mid(0.25, 9), mid(0.45, -8), mid(0.65, 8), mid(0.82, -6), b].map((p) => p.join(' ')).join(' L');
          fsvg.insertAdjacentHTML(
            'beforeend',
            `<g class="tw-zap"><path d="M${d}" fill="none" stroke="#1C2541" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="M${d}" fill="none" stroke="#FFE066" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/></g>`,
          );
          const z = fsvg.lastElementChild!;
          later(520, () => z.remove());
          SFX.shot(3);
          later(160, () => hit(e.id, e.dmg, false, false, e.hp));
        },
      ]);
    else if (e.t === 'beaten')
      B.push([
        300,
        () => {
          const p = body(cur[e.id] || [0, 0]);
          if (tok[e.id]) tok[e.id].classList.add('tw-gone');
          add(TWART.poof(), p, 800);
          add('<span class="tw-say win">Besiegt!</span>', [p[0], p[1] - 26], 900);
          SFX.pop();
        },
      ]);
    else if (e.t === 'shield')
      B.push([
        520,
        () => {
          if (ringNow) {
            ringNow.nextElementSibling.remove();
            ringNow.hidden = false;
          }
          const p = body(cur[e.id]);
          again(tok[e.id], 'tw-hit');
          SFX.shatter();
          add(`<i class="tw-burst" style="border-color:${cols[e.lane]}"></i>`, p, 600);
          for (let j = 0; j < 8; j++) {
            const a = (j / 8) * Math.PI * 2 + 0.3;
            const d = add(`<i class="tw-shard" style="background:${cols[e.lane]}"></i>`, p, 750);
            (d.firstChild as HTMLElement).style.setProperty('--dx', Math.cos(a) * 64 + 'px');
            (d.firstChild as HTMLElement).style.setProperty('--dy', Math.sin(a) * 64 + 'px');
          }
        },
      ]);
    else if (e.t === 'floor')
      B.push([
        e.fx === 'volley' ? 380 : 260,
        () => {
          const r = roomP(e.subject),
            f = twt.querySelector<HTMLElement>(`.tw-fl[data-subject="${e.subject}"]`);
          again(f, 'tw-glow');
          if (e.fx === 'volley') {
            add('<span class="tw-say">Hi!</span>', [r[0] - 40, r[1] - 8], 900);
            later(140, () => add('<span class="tw-say r">Yes!</span>', [r[0] + 40, r[1] - 14], 760));
            SFX.chime();
          } else if (e.fx === 'brick') add('<span class="tw-say">+🧱</span>', [r[0] + 44, r[1] - 10], 900);
        },
      ]);
    else if (e.t === 'stun')
      B.push([
        560,
        () => {
          const r = roomP(t.lanes.find((l) => TW.FLOORS[l.subject] === 'stun').subject),
            q = body(cur[e.id]);
          SFX.swish();
          [0, 1, 2].forEach((j) =>
            later(j * 90, () =>
              throwIt(
                TWART.leaflet(TWART.ROOMS.Ethik.c),
                [r[0] + (j - 1) * 12, r[1]],
                [q[0] + (j - 1) * 12, q[1] - 20 + j * 6],
                420,
                30,
                (j - 1) * 160 + 40,
              ),
            ),
          );
          later(520, () => {
            add(`<span class="tw-read">${TWART.leaflet(TWART.ROOMS.Ethik.c)}</span>`, [q[0], q[1] - 14], 900);
            again(tok[e.id], 'tw-dizzy');
          });
        },
      ]);
    else if (e.t === 'heal')
      B.push([
        560,
        () => {
          const r = roomP(t.lanes.find((l) => TW.FLOORS[l.subject] === 'repair').subject);
          SFX.chime();
          throwIt('<span class="tw-heart">❤️</span>', r, [heroP[0] + 9, heroP[1] + 30], 460, 26, 0);
          later(460, () => {
            hp = e.hp;
            setHp(hp);
            if (level(hp) !== level(hp - e.n)) towerArt(hp);
            again(twt, 'tw-heal');
            num(towerP, '+' + e.n, 'heal');
          });
        },
      ]);
    else if (e.t === 'patch')
      B.push([
        560,
        () => {
          hp = e.hp;
          setHp(hp);
          if (level(hp) !== level(hp - e.n)) towerArt(hp);
          again(twt, 'tw-heal');
          num(towerP, '+' + e.n, 'heal');
          SFX.chime();
        },
      ]);
    else if (e.t === 'push')
      B.push([
        540,
        () => {
          const r = roomP(t.lanes.find((l) => TW.FLOORS[l.subject] === 'push').subject),
            x = t.monsters.find((y) => y.id === e.id) || pre(e.id);
          SFX.bell();
          fsvg.insertAdjacentHTML(
            'beforeend',
            `<g class="tw-rings">${[0, 1, 2].map((j) => `<circle cx="${r[0]}" cy="${r[1]}" r="22" style="animation-delay:${j * 0.12 * k}s"/>`).join('')}</g>`,
          );
          const g = fsvg.lastElementChild!;
          later(900, () => g.remove());
          later(240, () => {
            place(e.id, cellP(x.lane, e.to), 320);
            again(tok[e.id], 'tw-dizzy');
          });
        },
      ]);
    else if (e.t === 'ziegel') {
      const list: any[] = [];
      for (; ev[i] && ev[i].t === 'ziegel'; i++) list.push(ev[i]);
      i--;
      const all = list.flatMap((z) => Array.from({ length: z.n }, () => z.why)),
        from = (why) =>
          why === 'floor' ? roomP(t.lanes.find((l) => TW.FLOORS[l.subject] === 'brick').subject) : lastHit.p || towerP;
      B.push([150, () => all.forEach((why, j) => later(j * 120, () => fly(from(why), j)))]);
    } else if (e.t === 'wrong') B.push([380, () => again(tok[e.id], 'tw-taunt')]);
    else if (['move', 'stunned', 'enter', 'tower', 'block', 'hold'].includes(e.t)) {
      // the monsters' step: everyone walks at once, new ones come in from the edge meanwhile; a monster already
      // at the gate hits the tower without a move before it
      const group: any[] = [];
      for (; ev[i] && ['move', 'stunned', 'enter', 'tower', 'block', 'hold'].includes(ev[i].t); i++) group.push(ev[i]);
      i--;
      const moves = group.filter((g) => g.t === 'move'),
        ins = group.filter((g) => g.t === 'enter'),
        hits = group.filter((g) => ['tower', 'block', 'hold'].includes(g.t));
      const boss = ins.some((g) => g.boss || g.elite),
        wIn = boss ? 1.5 * TW_STEP : 1.2 * TW_STEP;
      const len = Math.max(0, ...moves.map((m) => m.from - m.to)) * TW_STEP,
        inLen = ins.length ? 2 * wIn + 140 * (ins.length - 1) : 0;
      const walkBeat = () => {
        for (const m of moves) {
          const x = t.monsters.find((y) => y.id === m.id) || pre(m.id);
          if (!x) continue;
          walk(
            m.id,
            Array.from({ length: m.from - m.to }, (_, s) => cellP(x.lane, m.from - s - 1)),
            TW_STEP,
          );
        }
        for (const g of group.filter((x) => x.t === 'stunned')) again(tok[g.id], 'tw-dizzy');
        if (boss) {
          again(board, 'tw-dim');
        }
        ins.forEach((g, j) =>
          later(j * 140, () => {
            const L = G.lanes[g.lane];
            tok[g.id].style.opacity = 1;
            if (g.boss || g.elite) tok[g.id].classList.add('tw-star');
            walk(g.id, [L.from[1], L.cells[4]], wIn);
            if (g.boss || g.elite)
              later(2 * wIn, () => {
                SFX.thud();
                again(tok[g.id], 'tw-land');
              });
          }),
        );
      };
      if (moves.length || ins.length) B.push([Math.max(len, inLen, 200) + 60, walkBeat]);
      for (const h of hits) B.push([h.t === 'tower' ? 1500 : 460, () => impact(h)]); // a hit on the tower gets time to sink in
    } else if (e.t === 'cleared')
      B.push([
        850,
        () => {
          again(board, 'tw-won');
          add(
            `<div class="tw-wavebanner">${t.phase === 'won' ? 'Alle Wellen sind vorbei.' : `Welle ${e.wave} ist vorbei.`}</div>`,
            [G.w / 2, G.gate[1] - 150],
            1400,
          );
          SFX.chime();
        },
      ]);
    else if (e.t === 'evolve')
      B.push([
        900,
        () => {
          again(slot, 'tw-evolve');
          later(380, () => {
            slot.innerHTML = heroSVG(turmHero(), e.evo);
          });
          [0, 1, 2, 3, 4].forEach((j) =>
            add(
              TWART.spark(j % 2 ? '#fff' : '#FFE066'),
              [heroP[0] + Math.cos(j * 1.26) * 30, heroP[1] + Math.sin(j * 1.26) * 26],
              900,
            ),
          );
          SFX.levelup();
        },
      ]);
    else if (e.t === 'won')
      B.push([
        1300,
        () => {
          board.insertAdjacentHTML('beforeend', CONFETTI);
        },
      ]);
    else if (e.t === 'fallen')
      B.push([
        1100,
        () => {
          again(twt, 'tw-fall');
          add(TWART.poof(), [G.gate[0], G.gate[1] - 10], 1000);
          SFX.thud();
        },
      ]);
  }
  // a monster at the gate: it runs at the tower; a shield or the wall can stop it
  function impact(h) {
    const x = t.monsters.find((y) => y.id === h.id) || pre(h.id);
    if (!x) return;
    const g = G.lanes[x.lane].to[0],
      c = cur[h.id] || cellP(x.lane, 1),
      p = [c[0] + (g[0] - c[0]) * 0.7, c[1] + (g[1] - c[1]) * 0.7];
    place(h.id, p, 180);
    later(180, () => {
      if (h.t === 'tower') {
        again(twt, 'tw-shake');
        again(board, 'tw-alarm');
        hp = h.hp;
        setHp(hp);
        if (level(hp) !== level(hp + h.dmg)) towerArt(hp);
        add(`<span class="tw-num hurt">−${h.dmg} ❤️</span>`, [towerP[0], towerP[1] - 30], 1600);
        lostNow += h.dmg;
        showLost();
        SFX.hurt();
      } else if (h.t === 'block') {
        add(TWART.guardShield(), [g[0], g[1] - 18], 700);
        SFX.block();
      } else {
        add('<i class="tw-dust"></i>', g, 600);
        SFX.thud();
      }
      if (h.gone && h.t === 'tower') {
        place(h.id, [G.gate[0], G.gate[1] - 4], 300);
        tok[h.id].classList.add('tw-in');
      } else if (h.gone) {
        tok[h.id].classList.add('tw-gone');
        add(TWART.poof(), body(p), 700);
      } else place(h.id, c, 260);
    });
  }
  // a Ziegel flies from the board to the counter in the top bar, which ticks up when it lands
  function fly(p, j) {
    const counter = $('.topbar .tw-bricks', scr),
      sr = scr.getBoundingClientRect(),
      br = board.getBoundingClientRect(),
      cr = counter.getBoundingClientRect(),
      u = br.width / G.w;
    const x0 = br.left - sr.left + p[0] * u,
      y0 = br.top - sr.top + p[1] * u,
      x1 = cr.left - sr.left + 12,
      y1 = cr.top - sr.top + cr.height / 2;
    const d = document.createElement('span');
    d.className = 'tw-fly';
    d.innerHTML = TWART.brickOne();
    d.style.left = x0 + 'px';
    d.style.top = y0 + 'px';
    scr.appendChild(d);
    flyers.push(d);
    const dx = x1 - x0,
      dy = y1 - y0;
    if (d.animate)
      d.animate(
        [0, 0.25, 0.5, 0.75, 1].map((f) => ({
          translate: `${dx * f}px ${dy * f - 60 * 4 * f * (1 - f)}px`,
          scale: String(1 + 0.4 * Math.sin(f * Math.PI)),
        })),
        { duration: 520 * k, easing: 'ease-in', fill: 'forwards' },
      );
    later(520, () => {
      d.remove();
      bricks++;
      res('tw-bricks').textContent = bricks as unknown as string;
      again(counter, 'tw-tick');
      SFX.clink(j);
    });
  }
  const finish = () => {
    if (stopped) return;
    stopped = true;
    timers.forEach(clearTimeout);
    flyers.forEach((d) => d.remove());
    scr.removeEventListener('click', tap, true);
    scr.classList.remove('playing');
    state.backTo = keepBack;
    if (hurtLog) hurtLog.style.visibility = '';
    if (!board.isConnected) return;
    if (after) return after();
    if (alive()) {
      $('.tw-main', scr).innerHTML = turmBoardHtml();
      $('.topbar', scr).outerHTML = turmTop();
      turmBind();
    }
  };
  // a tap skips; a tap on a monster also selects it (its own handler runs after the board is redrawn)
  const tap = (e) => {
    const real = e.target.closest && e.target.closest('button.tw-mon');
    if (!real && e.target.closest && e.target.closest('.tw-main, #twon')) {
      e.stopPropagation();
      e.preventDefault();
    }
    finish();
  };
  scr.addEventListener('click', tap, true);
  scr.classList.add('playing');
  const keepBack = state.backTo;
  state.backTo = finish;
  let b = 0;
  const beat = () => {
    if (stopped) return;
    if (!alive()) {
      stopped = true;
      return;
    }
    const x = B[b++];
    if (!x) return finish();
    x[1]();
    timers.push(setTimeout(beat, x[0] * k));
  };
  timers.push(setTimeout(beat, 80 * k));
}
// Bauzeit: what was just bought moves into place (CSS only, nothing waits)
function turmBuilt(bau) {
  if (!turmMotion()) {
    if (bau.guard) SFX.right();
    return;
  }
  const twt = $('#twt'),
    spot = (key) => $(`.tw-spot[data-lane="${key[0]}"][data-spot="${key[2]}"]`);
  if (bau.guard) {
    const s = spot(bau.guard);
    if (s) s.classList.add('tw-arrive');
    SFX.thud();
    setTimeout(SFX.right, 380);
  }
  if (bau.up) {
    const s = spot(bau.up);
    if (s) s.classList.add('tw-upnow');
    SFX.chime();
  }
  if (bau.floor) {
    const f = $(`.tw-fl[data-subject="${bau.floor}"]`, twt);
    if (f) {
      f.classList.add('new');
      twt.classList.add('tw-grow');
      twt.insertAdjacentHTML(
        'beforeend',
        `<i class="tw-dustpuff" style="--fy:${TWART.TOWER.BASE + 8 + TWART.TOWER.FLOOR * (+f.dataset.floor!)}"></i>`,
      );
      setTimeout(() => SFX.thud(), 620);
    }
  }
  if (bau.fix != null) {
    const old = TWART.tower(state.run.turm.floors, bau.fix, state.run.hero.maxHp);
    $('.tw-towerart', twt).insertAdjacentHTML(
      'afterend',
      old.back.replace('class="tw-towerart"', 'class="tw-towerart tw-oldart"'),
    );
    twt.classList.add('tw-mend');
    [0, 1, 2].forEach((j) => setTimeout(() => SFX.clink(j * 3), 150 + j * 160));
  }
}
// without motion: the numbers and the sound at once
function turmFx(ev) {
  for (const e of ev)
    if (e.t === 'hit' || e.t === 'shot' || e.t === 'chain')
      fx(`.tw-mon[data-id="${e.id}"]`, '−' + e.dmg, e.weak ? 'crit' : '');
  const hurt = ev.filter((e) => e.t === 'tower');
  if (hurt.length) {
    $('#twt').classList.add('hurt');
    $('.tw-board').classList.add('tw-alarm');
    SFX.hurt();
  } else if (ev.some((e) => e.t === 'hit')) SFX.hit();
}
function turmIntro() {
  const steps = [
    'Tippe auf ein Monster und dann auf „Angreifen“. Löse die Aufgabe.',
    'Richtig gelöst? Dein Held trifft das Monster und du bekommst Ziegel 🧱.',
    'Kommt ein Monster am Turm an, verliert der Turm ❤️. Pass auf bei ⚠️!',
  ];
  const ov = modal(
    `<h2>🏰 Turmwacht</h2><ol>${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol><button class="btn" id="tutok" style="margin-top:12px">Verstanden</button>`,
  );
  speakBtn($('h2', ov), 'afterbegin', () => joined(...steps), undefined, [], state.run.grade);
  $('#tutok', ov).focus({ preventScroll: true });
  $('#tutok', ov).onclick = () => {
    ov.remove();
    state.meta.seenTut['turm:intro'] = true;
    saveAll();
  };
}
// children took a monster vanishing at the gate for a win: the first time the tower loses ❤️, say so
function turmHitTut(o) {
  const e = o.ev.find((y) => y.t === 'tower'),
    w = (o.names || {})[e.id],
    x = w && w.x;
  const text = `${w ? w.name : 'Ein Monster'} ist am Turm angekommen. Der Turm hat ${turmLost} ❤️ verloren.`,
    tip = 'Tipp: Greif zuerst das Monster mit ⚠️ an.';
  const ov = modal(
    `<div class="tw-banner">${x ? monsterSVG(x.shape, TYPES[x.type].color, 0, 'enemy', { elite: x.elite, boss: x.boss }) : ''}<h2>Oh nein!</h2></div><p>${esc(text)}</p><p>${tip}</p><button class="btn" id="tutok">Weiter</button>`,
  );
  ov.classList.add('tw-bannerov');
  const said = () => joined('Oh nein', text, tip);
  speakBtn($('h2', ov), 'beforeend', said, said, [], state.run.grade);
  $('#tutok', ov).focus({ preventScroll: true });
  $('#tutok', ov).onclick = () => {
    ov.remove();
    state.meta.seenTut['turm:hit'] = true;
    saveAll();
  };
}
// a boss or the elite arrives: a still banner over the board until it is tapped away (no timer)
function turmBanner(x, slide?) {
  const t = state.run.turm,
    cols = TWART.laneColors(t.lanes);
  const text = x.final
    ? 'Für jedes Fach trägt der Boss einen Schild. Die Aufgaben kommen der Reihe nach aus diesen Fächern:'
    : x.boss
      ? 'Der Boss geht nur jeden zweiten Zug ein Feld. Am Tor bleibt er stehen und trifft den Turm, bis er besiegt ist.'
      : turmEliteText(x);
  const list = x.final
    ? `<div class="tw-shieldlist">${x.shields.map((l) => `<span><i class="dot" style="background:${cols[l]}" aria-hidden="true"></i>${SUBJECTS[t.lanes[l].subject]} ${esc(laneName(l))}</span>`).join('')}</div>`
    : '';
  const ov = modal(
    `<div class="tw-banner">${monsterSVG(x.shape, TYPES[x.type].color, 0, 'enemy', { elite: x.elite, boss: x.boss })}<h2>${esc(x.name)} kommt.</h2></div><p>${esc(text)}</p>${list}<button class="btn" id="tutok">Weiter</button>`,
  );
  ov.classList.add('tw-bannerov');
  if (slide) ov.classList.add('slide');
  const said = () => joined(`${x.name} kommt`, text, x.final && x.shields.map(laneName).join(', '));
  speakBtn($('h2', ov), 'beforeend', said, said, [], state.run.grade);
  const close = () => ov.remove();
  $('#tutok', ov).focus({ preventScroll: true });
  $('#tutok', ov).onclick = close;
  ov.onclick = (e) => {
    if (e.target === ov) close();
  };
}
// after a wave: the Ziegel with their reasons and the Stempel; after the wave-3 boss also the new shape and the item choice
// called with the board's options, which it does not use
function screenTurmCleared(o?: BoardOpts): void;
function screenTurmCleared() {
  state.depth = 2;
  const t = state.run.turm,
    boss = TW.WAVES[t.wave - 1].boss != null,
    H = turmHero();
  const why = {
    right: 'Richtige Antworten',
    weak: '🎯 Doppelte Ziegel',
    floor: 'Schreibstube',
    wave: 'Welle vorbei',
    clean: 'Der Turm blieb heil',
  };
  const rows = Object.keys(why)
    .filter((k) => t.earned[k])
    .map((k) => `<li><span>${why[k]}</span><b>+${t.earned[k]} 🧱</b></li>`)
    .join('');
  const evo = boss
    ? `<div class="card center tw-evo"><h3>Neue Gestalt</h3><div class="evo-row">${heroSVG(H, state.run.hero.evo - 1, 'before')}<span aria-hidden="true">➜</span>${heroSVG(H, state.run.hero.evo, 'after')}</div><p>${esc(turmEvoText(state.run.hero.evo))}</p></div>`
    : '';
  const offer = t.phase === 'reward' && t.offer;
  render(`<div class="screen">${turmTop()}<div class="scroll"><div class="stack"><div class="card center tw-cleared"><h2>Welle ${t.wave} ist vorbei.</h2>${rows ? `<ul class="tw-earned">${rows}</ul>` : ''}<p>Du hast jetzt ${t.ziegel} 🧱.</p>${stampLine(t.stamps)}<p class="pnote">Gleich ist Bauzeit: Mit Ziegeln machst du den Turm stärker.</p></div>${evo}</div></div>
      <div class="bottom">${offer ? '<button class="btn" id="pick">Belohnung aussuchen</button>' : '<button class="btn" id="tobuild">Zur Bauzeit</button>'}</div></div>`);
  state.backTo = () => turmLeave(screenTurm);
  speakBtn(
    $('.tw-cleared h2'),
    'beforeend',
    () =>
      joined(`Welle ${t.wave} ist vorbei`, `Du hast jetzt ${t.ziegel} Ziegel`, boss && turmEvoText(state.run.hero.evo)),
    undefined,
    [],
    state.run.grade,
  );
  setTimeout(boss ? SFX.levelup : SFX.win, 150);
  if (!offer) {
    $('#tobuild').onclick = () => screenTurmBoard();
    return;
  }
  $('#pick').onclick = () => {
    const ov = modal(
      `<h2>Belohnung</h2><p>Für den Boss ist schon ${ITEMS.grosstrank.icon} ${ITEMS.grosstrank.name} in deinem Beutel. Such dir noch etwas aus:</p><div class="stack">${offer.map((id, i) => `<button class="choice tw-item" data-r="${i}"><span class="tw-itemic" aria-hidden="true">${ITEMS[id].icon}</span><span class="meta"><span class="name">${ITEMS[id].name}</span><span class="desc">${esc(TURM_BAG.desc[id] || ITEMS[id].desc)}</span></span></button>`).join('')}<button class="btn secondary" id="no">Zurück</button></div>`,
    );
    $('#no', ov).onclick = () => ov.remove();
    ov.querySelectorAll<HTMLElement>('[data-r]').forEach((b) => {
      b.onclick = () => {
        const id = t.offer[+b.dataset.r!];
        ov.remove();
        if (turmReward(+b.dataset.r!)) {
          screenTurmBoard({ lines: [`${ITEMS[id].icon} ${ITEMS[id].name} ist jetzt in deinem Beutel.`], quiet: true });
          if (state.run.turm.wave === 3) turmPause();
        }
      };
    });
  };
}
// fallen or won: first what was practised, then the result
function screenTurmEnd(o: BoardOpts = {}) {
  state.depth = 2;
  const t = state.run.turm,
    won = t.phase === 'won',
    retry = TW.canRetry(state.run),
    left = TW.CP_USES - t.cpUsed,
    H = turmHero();
  const rows = [...new Set<string>(t.lanes.map((l) => l.subject))]
    .map((s) => {
      const v = t.score[s] || { c: 0, t: 0 };
      return `<li><span>${SUBJECTS[s]} ${esc(s)}</span><b>${v.c} von ${v.t} richtig</b></li>`;
    })
    .join('');
  if (!retry) endRun(); // over for good; record and scores are already in meta
  if (o.ev) setTimeout(won ? SFX.finale : SFX.lose, 150);
  if (won && o.ev && !reducedMotion)
    setTimeout(() => {
      const e = $('.tw-endtower');
      if (e) e.classList.add('rise');
    }, 0);
  // the finished tower with every floor built in this run and the hero in its last shape on top
  const tw = TWART.tower(t.floors, state.run.hero.hp, state.run.hero.maxHp);
  const pic = won
    ? `<div class="tw-endtower"><div class="tw-tower" style="--th:${tw.h};--feet:${tw.feet}">${tw.back}<div class="tw-heroslot">${heroSVG(H, state.run.hero.evo)}</div>${tw.front}</div></div>`
    : heroSVG(H, state.run.hero.evo);
  const result = won
    ? 'Der Wissensturm hat allen Wellen standgehalten.'
    : `Der Turm ist gefallen. Du bist bis Welle ${t.wave} gekommen.`;
  render(`<div class="screen">${topbar('🏰 Turmwacht')}${won ? CONFETTI : ''}<div class="scroll"><div class="stack"><div class="card center tw-end"><h2>Das hast du geübt</h2><ul class="tw-score">${rows}</ul></div>
      <div class="card center tw-end${won ? ' won' : ''}">${pic}<p class="tw-result">${result}</p>${won ? `<p>${esc(H.names[state.run.hero.evo])} steht ganz oben auf dem Turm.</p>` : ''}${stampLine(t.stamps)}<p>Rekord: Welle ${state.meta.turm.best}</p></div></div></div>
      <div class="bottom"><div class="stack tw-endbtns">${retry ? `<button class="btn" id="retry">Ab Welle ${t.cp.turm.wave + 1} weitermachen</button><p class="pnote center">Das geht in dieser Turmwacht noch ${left === 1 ? 'einmal' : 'zweimal'}.</p>` : ''}${
        won
          ? '<button class="btn" id="home">Zum Titel</button><button class="btn secondary" id="again">Neue Turmwacht</button>'
          : `<button class="btn${retry ? ' secondary' : ''}" id="again">Neue Turmwacht</button><button class="btn ghost" id="home">Zum Titel</button>`
      }</div></div></div>`);
  speakBtn(
    $('.tw-end h2'),
    'beforeend',
    () =>
      joined(
        'Das hast du geübt',
        ...[...app.querySelectorAll<HTMLElement>('.tw-score li')].map((li) => li.textContent.replace(/^\S+\s/, '')),
        result,
      ),
    undefined,
    [],
    state.run.grade,
  );
  const home = () => turmLeave(screenTitle);
  state.backTo = home;
  $('#home').onclick = home;
  $('#again').onclick = () => {
    endRun();
    state.run = null;
    screenTurmNew();
  };
  if (retry)
    $('#retry').onclick = () => {
      turmRetry();
      screenTurmBoard({ lines: [`Der Turm ist wieder heil. Gleich kommt Welle ${state.run.turm.wave + 1}.`] });
    };
}
