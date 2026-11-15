import { MODES } from '../curriculum.ts';
import { $, MODULES_OF, TYPES, app, esc } from './core.ts';
import { goalDone, heroLocked, heroSVG, makeTask, weekly, weeklyGoals } from './progress.ts';
import { state } from './state.ts';
import { enabledMods, extraOn, heroShown, loadRun, visSubjects } from './storage.ts';
import { runTask } from './tasks.ts';
import { screenTitle } from './title.ts';
import { SFX, announce, fx, render, topbar } from './ui.ts';

/* ---------- Duell ---------- */
// Two children on one device. Nothing is saved: no run, no stamps, and no statistics, because
// the device statistics belong to one child and a duel would mix in the other child's answers.
const DUEL_HP = 60,
  DUEL_HIT = 12;
const duelSpec = (p) => MODES[p.mode].starters.find((s) => s.id === p.hero);
// each child plays at the level of the running adventure in that unit, otherwise level 1
const duelTiers = (m) => {
  const r = loadRun(m);
  return Object.fromEntries(
    Object.entries(MODES[m].modules).map(([k, M]) => [k, Math.max(1, Math.min(M.maxTier, (r && r.tiers[k]) || 1))]),
  );
};
const duelAttacks = (p) => {
  const on = enabledMods(p.mode);
  const a = duelSpec(p).attacks.filter((x) => on.includes(x.mod));
  return a.length ? a : on.slice(0, 4).map((k) => ({ name: MODES[p.mode].extra[k], mod: k }));
};
export function screenDuel(players) {
  const i = players.length;
  const p = { name: '', mode: null, hero: null };
  state.depth = i ? 2 : 1;
  const units = visSubjects().flatMap((s) => s.modes);
  const heroes = () => (p.mode ? MODES[p.mode].starters.filter((s) => !heroLocked(s) && heroShown(p.mode, s)) : []);
  render(`<div class="screen">${topbar(`Duell · Kind ${i + 1} von 2`)}<div class="scroll"><div class="stack">
      ${i ? `<p class="center">${esc(players[0].name)} ist bereit. Jetzt wählt das zweite Kind.</p>` : '<p class="center">Zwei Kinder, ein Gerät. Ihr löst abwechselnd Aufgaben. Jede richtige Antwort trifft den Helden des anderen Kindes.</p>'}
      <div class="card"><h3><label for="dname">Dein Name</label></h3><input id="dname" class="nameinput" maxlength="12" autocomplete="off" placeholder="Kind ${i + 1}"><p class="pnote">Der Name wird nicht gespeichert.</p></div>
      <div class="card"><h3>Einheit</h3><div class="toggles" role="group" aria-label="Einheit">${units.map((m) => `<button class="toggle" data-unit="${m}" aria-pressed="false">${MODES[m].icon} ${esc(MODES[m].title)}</button>`).join('')}</div></div>
      <div id="dheroes"></div>
      </div></div><div class="bottom"><div class="row"><button class="btn secondary" id="back">Zurück</button><button class="btn" id="go" disabled>${i ? 'Duell starten' : 'Weiter'}</button></div></div></div>`);
  const paint = () => {
    app.querySelectorAll<HTMLElement>('[data-unit]').forEach((b) => {
      const on = b.dataset.unit === p.mode;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
    });
    $('#dheroes').innerHTML = p.mode
      ? `<h3>Dein Held</h3><div class="stack">${heroes()
          .map(
            (s) =>
              `<button class="choice ${p.hero === s.id ? 'selected' : ''}" data-hero="${s.id}" aria-pressed="${p.hero === s.id}">${heroSVG(s, 0)}<div class="meta"><div class="name">${s.names[0]}</div><div class="desc">Attacken: ${[...new Set(s.attacks.map((a) => MODES[p.mode].modules[a.mod].name))].join(', ')}</div></div></button>`,
          )
          .join('')}</div>`
      : '';
    app.querySelectorAll<HTMLElement>('[data-hero]').forEach((b) => {
      b.onclick = () => {
        p.hero = b.dataset.hero;
        paint();
      };
    });
    $('#go').disabled = !p.hero;
  };
  app.querySelectorAll<HTMLElement>('[data-unit]').forEach((b) => {
    b.onclick = () => {
      p.mode = b.dataset.unit;
      const h = heroes();
      p.hero = h.length === 1 ? h[0].id : null;
      paint();
    };
  });
  $('#back').onclick = () => (i ? screenDuel([]) : screenTitle());
  $('#go').onclick = () => {
    if (!p.hero) return;
    p.name = $('#dname').value.trim().slice(0, 12) || `Kind ${i + 1}`;
    if (i === 0) screenDuel([p]);
    else startDuel([players[0], p], 0);
  };
}
function startDuel(players, first) {
  state.run = null;
  state.duel = { p: players.map((p) => Object.assign(p, { hp: DUEL_HP, tiers: duelTiers(p.mode) })), turn: first };
  duelTurn(`${esc(state.duel.p[first].name)} fängt an.`, '');
}
// child 1 stands at the bottom like the hero in a fight, child 2 at the top
function renderDuel(log, cls) {
  const plate = (p, side) => {
    const pct = (p.hp / DUEL_HP) * 100;
    return `<div class="plate ${side}"><div class="name">${esc(p.name)}${state.duel.p[state.duel.turn] === p ? ' <span class="levelbadge">am Zug</span>' : ''}</div><div class="plateline"><span class="chip" style="background:${TYPES[duelSpec(p).type].color};color:#1C2541">${MODES[p.mode].icon} ${esc(duelSpec(p).names[0])}</span></div><div class="hpbar"><i class="${pct < 30 ? 'low' : pct < 60 ? 'mid' : ''}" style="width:${pct}%"></i></div><div class="hptext">❤️ ${p.hp} / ${DUEL_HP}</div></div>`;
  };
  const sprite = (p, side, id) =>
    `<div class="sprite ${side}" id="${id}">${heroSVG(duelSpec(p), 0, side === 'enemy' ? 'enemy' : undefined)}<i class="ground"></i></div>`;
  const [a, b] = state.duel.p;
  render(
    `<div class="screen">${topbar('⚔️ Duell')}<div class="arena">${plate(b, 'enemy')}${sprite(b, 'enemy', 'fe')}${sprite(a, 'hero', 'fh')}${plate(a, 'hero')}</div><div class="log ${cls}">${log}</div><div class="taskwrap" id="taskwrap"></div><div class="bottom" id="bottom"></div></div>`,
    true,
  );
  announce(log.replace(/<[^>]+>/g, ''));
}
function duelTurn(log, cls) {
  const p = state.duel.p[state.duel.turn];
  state.mode = p.mode;
  const atks = duelAttacks(p);
  const M = MODULES_OF();
  renderDuel(log, cls);
  $('#bottom').innerHTML =
    `<div class="attacks">${atks.map((a, i) => `<button class="atk" data-i="${i}" aria-label="${esc(a.name)}: ${M[a.mod].name}, ${DUEL_HIT} Schaden"><span class="n">${esc(a.name)}</span><span class="m">${M[a.mod].icon} ${M[a.mod].name}<span class="dmg">💥 ${DUEL_HIT}</span></span></button>`).join('')}</div>`;
  app.querySelectorAll<HTMLElement>('.atk').forEach((btn) => {
    btn.onclick = () => duelAttack(atks[+btn.dataset.i]);
  });
}
function duelAttack(atk) {
  const p = state.duel.p[state.duel.turn],
    o = state.duel.p[1 - state.duel.turn];
  const t = makeTask(atk.mod, p.tiers[atk.mod] || 1);
  $('.screen').classList.add('tasking');
  $('#bottom').innerHTML = '';
  let hit = false;
  runTask(
    t,
    {
      container: $('#taskwrap'),
      bottom: $('#bottom'),
      subtitle: `${p.name}: ${atk.name}`,
      onResult: (ok) => {
        hit = ok;
        if (ok) o.hp = Math.max(0, o.hp - DUEL_HIT);
      },
    },
    () => {
      const log = hit
        ? `${esc(atk.name)} trifft: ${DUEL_HIT} Schaden für ${esc(o.name)}.`
        : `${esc(atk.name)} geht daneben.`;
      const show = () => {
        if (hit) {
          const sel = state.duel.p.indexOf(o) ? '#fe' : '#fh';
          $(sel).classList.add('hurt');
          fx(sel, '−' + DUEL_HIT);
          SFX.hit();
        }
      };
      if (o.hp <= 0) {
        renderDuel(log, 'hit');
        show();
        setTimeout(() => screenDuelEnd(p), 1500);
        return;
      }
      state.duel.turn = 1 - state.duel.turn;
      duelTurn(`${log} Jetzt ist ${esc(o.name)} dran.`, hit ? 'hit' : 'miss');
      show();
    },
  );
}
function screenDuelEnd(w) {
  const players = state.duel.p;
  const l = players.find((x) => x !== w);
  state.duel = null;
  setTimeout(SFX.win, 150);
  render(
    `<div class="screen">${topbar('⚔️ Duell')}<div class="scroll"><div class="card center"><h2>${esc(w.name)} gewinnt das Duell.</h2>${heroSVG(duelSpec(w), 0)}<p>${esc(duelSpec(w).names[0])} hat noch ${w.hp} von ${DUEL_HP} Lebenspunkten.</p><p>Im nächsten Duell fängt ${esc(l.name)} an.</p></div></div><div class="bottom"><div class="stack"><button class="btn" id="again">Noch ein Duell</button><button class="btn ghost" id="home">Zum Titel</button></div></div></div>`,
  );
  $('#again').onclick = () => startDuel(players, players.indexOf(l));
  $('#home').onclick = screenTitle;
}

// this week for parents: practised task types, the weakest one, the goals; the text has no names in it
export function weekReport() {
  const w = weekly();
  const goals = weeklyGoals();
  const wk = +w.week.slice(6);
  const all = Object.entries(w.tally)
    .map(([k, v]) => {
      const [m, mod] = k.split(':');
      const M = MODES[m] && MODES[m].modules[mod];
      return M && v.t ? { m, name: M.name, icon: M.icon, c: v.c, t: v.t } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.t - a.t);
  // Luther and Kirchenjahr share task type names
  const rows = all.map((r) =>
    Object.assign(r, {
      label: all.some((x) => x.name === r.name && x.m !== r.m) ? `${r.name} (${MODES[r.m].title})` : r.name,
    }),
  );
  const weak = rows.filter((r) => r.t >= 3).sort((a, b) => a.c / a.t - b.c / b.t)[0];
  const done = goals.filter(goalDone).length;
  const text = [
    `Lernquest, Woche ${wk}`,
    rows.length
      ? 'Geübt (richtig von gesamt): ' + rows.map((r) => `${r.label} ${r.c} von ${r.t}`).join(', ')
      : 'Diese Woche noch nichts geübt.',
    weak ? `Schwächste Aufgabenart: ${weak.label} (${weak.c} von ${weak.t} richtig)` : '',
    extraOn('wochenziele') ? `Wochenziele: ${done} von ${goals.length} erledigt` : '',
  ]
    .filter(Boolean)
    .join('\n');
  return { text, wk, rows, goals, done };
}
