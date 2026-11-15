import { MODES } from '../curriculum.ts';
import { MQ } from '../logic.ts';
import { PANTRY_MAX, isObj } from '../save.ts';
import { TEXTE } from '../texte.ts';
import { battleWon, enemyTurn, readEnd, renderBattle, screenRead, startBattle, topEnd } from './battle.ts';
import { screenVictory } from './collection.ts';
import { $, CFG, ITEMS, MODKEYS, MODULES_OF, app, esc, makeMap, pick } from './core.ts';
import {
  screenEvent,
  screenKarte,
  screenLabor,
  screenMarket,
  screenMine,
  screenRest,
  screenSchool,
  screenTreasure,
} from './nodes.ts';
import {
  REWARDS,
  gainXp,
  goalText,
  heal,
  heroLocked,
  heroName,
  heroSVG,
  heroSpec,
  levelOf,
  markWeek,
  monsterSVG,
  seededOrder,
  showWeeklyNews,
  typeChip,
  weekly,
  xpNeeded,
} from './progress.ts';
import { state } from './state.ts';
import { enabledMods, extraOn, heroShown, marketOn, offList, practice, saveAll } from './storage.ts';
import { screenSubject, screenTitle, screenWeekly, subjectOf } from './title.ts';
import { modal, render, topbar } from './ui.ts';

// goal: the weekly goal this adventure was started for; its task type is offered as an attack
export function screenStarter(goal?) {
  state.depth = 2;
  const vis = CFG().starters.filter((s) => heroShown(state.mode, s));
  const S = vis.filter((s) => !heroLocked(s));
  const last = state.meta.lastStarter[state.mode];
  let sel = S.length === 1 ? S[0].id : null;
  const want = goal && goal.kind === 'right' ? goal.mod : null;
  // Klasse 1 starts small: 2 attacks in the first adventure of a theme, 3 in the second, then all 4; a goal's attack comes first
  const kit = (s) => {
    if (CFG().grade !== 1) return s.attacks;
    const a = s.attacks.slice(),
      i = a.findIndex((x) => x.mod === want);
    if (i > 0) a.unshift(a.splice(i, 1)[0]);
    return a.slice(0, 2 + (state.meta.started[state.mode] || 0));
  };
  // recommend the monster whose attacks were practised least (and not the one played last time); for a goal one that has its task type
  const score = (s) =>
    s.attacks.reduce((n, a) => n + practice(a.mod), 0) +
    (s.id === last ? 1e6 : 0) -
    (want && s.attacks.some((a) => a.mod === want) ? 1e9 : 0);
  const rec = S.length > 1 ? S.slice().sort((a, b) => score(a) - score(b))[0].id : null;
  // offer to swap the most practised attack for the goal's task type or one that was hardly practised yet
  let swap = null,
    swapOn = true;
  const swapFor = (s) => {
    if (!s) return null;
    const have = kit(s).map((a) => a.mod);
    const most = have.filter((k) => enabledMods().includes(k)).sort((a, b) => practice(b) - practice(a))[0];
    if (want) return have.includes(want) || !most ? null : { from: most, to: want, goal: true };
    const cand = enabledMods()
      .filter((k) => !have.includes(k))
      .sort((a, b) => practice(a) - practice(b))[0];
    return cand && most && practice(most) >= practice(cand) + 3 ? { from: most, to: cand } : null;
  };
  const paintSwap = () => {
    const s = S.find((x) => x.id === sel);
    swap = swapFor(s);
    const box = $('#swapbox');
    if (!box) return;
    const M = MODULES_OF();
    box.innerHTML = swap
      ? `<button class="choice swap ${swapOn ? 'selected' : ''}" id="swap" aria-pressed="${swapOn}"><div class="meta"><div class="name">${swap.goal ? '⭐ Für dein Wochenziel' : '🎯 Neues üben'}: ${M[swap.to].icon} ${M[swap.to].name}</div><div class="desc">Statt ${M[swap.from].name}${swap.goal ? '' : ' (schon oft geübt)'} bekommst du die Attacke „${esc(CFG().extra[swap.to])}“. 🐝 Bonus: Fleißbienchen</div></div><span class="tick" aria-hidden="true">${swapOn ? '✔' : ''}</span></button>`
      : '';
    if (swap)
      $('#swap').onclick = () => {
        swapOn = !swapOn;
        paintSwap();
      };
  };
  render(`<div class="screen">${topbar(S.length === 1 ? 'Dein Held' : 'Wähle dein Monster')}<div class="scroll"><div class="stack">
      ${goal ? `<p class="center goalbadge">⭐ Wochenziel: ${esc(goalText(goal))}</p>` : ''}
      ${S.map((s) => `<button class="choice ${S.length === 1 ? 'selected' : ''}" data-id="${s.id}">${heroSVG(s, 0)}<div class="meta">${rec === s.id ? `<div class="recbadge">${want ? `⭐ Empfohlen: hat ${MODULES_OF()[want].name} · 🐝 Bonus` : '⭐ Empfohlen: übt Neues · 🐝 Bonus'}</div>` : ''}<div class="name">${s.names[0]}</div>${typeChip(s.type)}<div class="desc">${s.desc}<br>❤️ ${s.hp} LP · Attacken: ${[...new Set(kit(s).map((a) => MODULES_OF()[a.mod].name))].join(', ')}</div></div></button>`).join('')}
      ${vis
        .filter(heroLocked)
        .map(
          (s) =>
            `<div class="choice locked">${monsterSVG(s.shape, '#8A8FA3', 0)}<div class="meta"><div class="name">🔒 ${s.names[0]}</div><div class="desc">Im Stempelheft für ${REWARDS.find((r) => r.hero === s.id).price} 🏷️ zu holen.</div></div></div>`,
        )
        .join('')}
      <div id="swapbox"></div>
      ${state.meta.pantry.length ? `<p class="center">Aus deinem Vorrat kommt mit: ${state.meta.pantry.map((it) => `${ITEMS[it].icon} ${ITEMS[it].name}`).join(', ')}</p>` : ''}
      </div></div><div class="bottom"><div class="row"><button class="btn secondary" id="back">Zurück</button><button class="btn" id="go" ${sel ? '' : 'disabled'}>Start</button></div></div></div>`);
  $('#back').onclick = () => (goal ? screenWeekly() : screenSubject(subjectOf(state.mode)));
  app.querySelectorAll<HTMLElement>('.choice[data-id]').forEach((b) => {
    b.onclick = () => {
      sel = b.dataset.id;
      app.querySelectorAll<HTMLElement>('.choice[data-id]').forEach((x) => x.classList.toggle('selected', x === b));
      $('#go').disabled = false;
      paintSwap();
    };
  });
  paintSwap();
  $('#go').onclick = () => {
    if (!sel) return;
    const s = CFG().starters.find((x) => x.id === sel);
    state.run = {
      mode: state.mode,
      world: 1,
      floor: 1,
      map: [],
      hero: {
        id: s.id,
        evo: 0,
        level: 1,
        xp: 0,
        hp: s.hp,
        maxHp: s.hp,
        attacks: kit(s).map((a) => ({ name: a.name, mod: a.mod })),
      },
      items: ['trank'].concat(state.meta.pantry.slice(0, PANTRY_MAX)),
      tiers: Object.fromEntries(MODKEYS().map((k) => [k, Math.max(1, (levelOf(state.mode)[k] || 1) - 1)])),
      path: [],
      shield: false,
    };
    state.run.map = makeMapFor(1);
    if (swap && swapOn) {
      const a = state.run.hero.attacks.find((x) => x.mod === swap.from);
      if (a) {
        a.mod = swap.to;
        a.name = CFG().extra[swap.to];
      }
    }
    if (rec && sel === rec) state.run.items.push('stern');
    if (swap && swapOn) state.run.items.push('stern');
    state.meta.pantry = [];
    state.meta.lastStarter[state.mode] = sel;
    state.meta.started[state.mode] = (state.meta.started[state.mode] || 0) + 1;
    state.meta.runs++;
    markWeek();
    saveAll();
    screenMap();
  };
}
// shorter adventures for the younger grades; enemies stay as strong (see startBattle)
const FLOORS_BY_GRADE = { 1: 6, 2: 7, 3: 8 };
// floors are counted on an 8-floor map; m.slice(a, -2) ends before the camp and the boss
function makeMapFor(world) {
  const m = makeMap(FLOORS_BY_GRADE[CFG().grade] || 8);
  if (CFG().school && world === 1) {
    m[1].forEach((n) => {
      n.t = 'school';
    });
    if (!m[m.length - 4].some((n) => n.t === 'school')) m[m.length - 4][0].t = 'school';
  }
  // one special node per world on floors 3–6 instead of an event or treasure (a fight if the map has none)
  const sw = CFG().swap;
  if (sw) {
    const on = (t) =>
      m
        .slice(2, -2)
        .flat()
        .filter((n) => n.t === t);
    const c = on(sw.from).length ? on(sw.from) : on('fight');
    if (c.length) pick(c).t = sw.to;
  }
  const chests = m.flat().filter((n) => n.t === 'treasure');
  if (CFG().mine && chests.length && !offList('math').includes('rest')) pick(chests).t = 'bergwerk';
  // one market per world on floors 3–6, in place of an event (a fight if there is none)
  if (marketOn()) {
    const fl = m.slice(2, -2).flat();
    const ev = fl.filter((n) => n.t === 'event');
    const n = pick(ev.length ? ev : fl.filter((x) => x.t === 'fight'));
    if (n) n.t = 'markt';
  }
  // the week's boss takes the place of one fight on floor 5 or 6: once per adventure, until it is beaten this week
  const fights = m
    .slice(-4, -2)
    .flat()
    .filter((n) => n.t === 'fight');
  if (extraOn('wochenziele') && !state.run.wb && fights.length && !weekly().beaten.includes(state.mode)) {
    pick(fights).t = 'weekboss';
    state.run.wb = true;
  }
  if (readsIn(state.mode)) {
    const fights = m
      .slice(1, -2)
      .flat()
      .filter((n) => n.t === 'fight');
    pick(fights.length ? fights : m[0]).t = 'lesen';
  }
  // last, so the Kreisel-Arena only takes a fight on floors 4–6 that no other special node took (else an event or an elite); never in Klasse 1
  const tf =
    extraOn('kreisel') &&
    CFG().grade !== 1 &&
    ['fight', 'event', 'elite']
      .map((t) =>
        m
          .slice(-5, -2)
          .flat()
          .filter((n) => n.t === t),
      )
      .find((c) => c.length);
  if (tf) pick(tf).t = 'arena';
  return m;
}
// one Lesestube per world replaces a fight in every Deutsch and Ethik unit
// texts carry their grade (default 3); a unit only gets a Lesestube when there are texts for its grade
export const textsFor = (m) => TEXTE.map((t, i) => i).filter((i) => (TEXTE[i].grade || 3) === MODES[m].grade);
const readsIn = (m) => ['Deutsch', 'Ethik'].includes(MODES[m].subject) && textsFor(m).length > 0;
// same enemy, weak spot and HP on every device in this week
function weekBossSpec(world) {
  const r = MQ.seeded(weekly().week + ':' + state.mode + ':' + world);
  const pool = CFG().enemies[world].normal;
  const e = pool[Math.floor(r() * pool.length)];
  return Object.assign({}, e, {
    name: e.name + ' der Woche',
    base: e.name,
    hp: Math.round(e.hp * 1.25),
    weekboss: true,
    weakOrder: seededOrder(r, MODKEYS()),
  });
}

export const NODE_INFO = {
  fight: ['⚔️', 'Kampf'],
  elite: ['💀', 'Elite'],
  event: ['❓', 'Ereignis'],
  rest: ['🔥', 'Rast'],
  treasure: ['🎁', 'Schatz'],
  boss: ['👑', 'Boss'],
  school: ['✏️', 'Zeichenschule'],
  labor: ['🔬', 'Forscherlabor'],
  taeusch: ['👁️', 'Sinnestäuschung'],
  karte: ['🗺️', 'Schatzkarte'],
  weekboss: ['🏅', 'Wochenboss'],
  markt: ['🧺', 'Kaufladen'],
  lesen: ['📖', 'Lesestube'],
  bergwerk: ['⛏️', 'Bergwerk'],
  arena: ['🌀', 'Kreisel-Arena'],
};
export function screenMap() {
  state.depth = 2;
  const h = state.run.hero;
  const open = openNodes();
  const live = state.run.map.map(() => new Set());
  open.forEach((i) => live[state.run.floor - 1].add(i));
  for (let f = state.run.floor - 1; f < state.run.map.length - 1; f++)
    live[f].forEach((i) => state.run.map[f][i].n.forEach((j) => live[f + 1].add(j)));
  const ROW = 86,
    H = state.run.map.length * ROW;
  const X = (c) => (c + 0.5) * 25;
  const Y = (f) => H - (f + 0.5) * ROW;
  let lines = '';
  state.run.map.forEach((fl, f) =>
    fl.forEach((nd, i) =>
      nd.n.forEach((j) => {
        if (!state.run.map[f + 1] || !state.run.map[f + 1][j]) return;
        const walked = state.run.path[f] === i && state.run.path[f + 1] === j && f + 1 < state.run.floor - 1;
        const next = f === state.run.floor - 2 && state.run.path[f] === i && open.includes(j);
        const dead = !walked && !next && !(live[f].has(i) && live[f + 1].has(j));
        lines += `<line class="${walked ? 'walked' : next ? 'next' : dead ? 'dead' : ''}" x1="${X(nd.c)}" y1="${Y(f)}" x2="${X(state.run.map[f + 1][j].c)}" y2="${Y(f + 1)}"/>`;
      }),
    ),
  );
  const nodes = state.run.map
    .map((fl, f) =>
      fl
        .map((nd, i) => {
          const isOpen = f === state.run.floor - 1 && open.includes(i);
          const taken = state.run.path[f] === i && f < state.run.floor - 1;
          const cls = isOpen
            ? 'open'
            : taken
              ? 'taken'
              : f < state.run.floor - 1
                ? 'past'
                : live[f].has(i)
                  ? 'future'
                  : 'dead';
          return `<button class="node ${cls} ${nd.t}" style="left:${X(nd.c)}%;top:${Y(f)}px" data-n="${i}" ${isOpen ? '' : 'tabindex="-1" disabled'} aria-label="${NODE_INFO[nd.t][1]}">${NODE_INFO[nd.t][0]}<small>${NODE_INFO[nd.t][1]}</small></button>`;
        })
        .join(''),
    )
    .join('');
  const look = state.mode === 'math' && REWARDS.find((r) => r.world === state.run.world && state.meta.owned[r.id]);
  render(`<div class="screen"${look ? ` style="background:${look.bg}"` : ''}>${topbar(`${heroSVG(heroSpec(), h.evo, 'tbhero')}${esc(heroName())} <span class="levelbadge">Lv ${h.level}</span>`)}
      <div style="padding:8px 16px 0"><div class="hpbar"><i style="width:${(h.hp / h.maxHp) * 100}%" class="${h.hp / h.maxHp < 0.3 ? 'low' : h.hp / h.maxHp < 0.6 ? 'mid' : ''}"></i></div><div class="row" style="justify-content:space-between;font-size:15px;font-weight:700"><span>❤️ ${h.hp} / ${h.maxHp}</span><span>⭐ ${h.xp} / ${xpNeeded(h.level)} XP</span></div><p class="maphint">Wähle deinen Weg – er sperrt andere. 💀 Elite ist schwer, dafür suchst du dir die Beute aus.</p></div>
      <div class="scroll"><div class="wmap" style="height:${H}px"><svg class="maplines" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${nodes}</div></div>
      <div class="bottom"><div class="row"><button class="btn secondary small" id="bag">🎒 Beutel (${state.run.items.length})</button><button class="btn ghost small" id="home">Titel</button></div></div></div>`);
  app.querySelectorAll<HTMLElement>('.node.open').forEach((b) => {
    b.onclick = () => {
      const ni = +b.dataset.n;
      state.run.path[state.run.floor - 1] = ni;
      const type = state.run.map[state.run.floor - 1][ni].t;
      state.run.node = { type };
      saveAll();
      enterNode(type);
    };
  });
  $('#home').onclick = screenTitle;
  state.backTo = () => {
    const s = subjectOf(state.mode);
    if (s) screenSubject(s);
    else screenTitle();
  };
  $('#bag').onclick = () => showBag(null);
  showWeeklyNews();
  const scroller = $('.scroll');
  const cur = $('.node.open');
  if (cur && scroller)
    scroller.scrollTop = Math.max(
      0,
      scroller.scrollTop +
        cur.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top -
        scroller.clientHeight / 2,
    );
}
// nodes the hero can step on now: all of floor 1, later only those the last node leads to
function openNodes() {
  const fl = state.run.map[state.run.floor - 1];
  const all = fl.map((_, i) => i);
  if (state.run.floor === 1) return all;
  const prev = state.run.map[state.run.floor - 2][state.run.path[state.run.floor - 2]];
  const n = prev ? prev.n.filter((i) => fl[i]) : [];
  return n.length ? n : all;
}
// ctx (Turmwacht) may override the texts: { full, later, desc: { [item id]: text } } and the screen after using an item outside a fight (done)
export function showBag(inBattle, ctx?) {
  const T = ctx || {};
  const desc = (id) => (T.desc && T.desc[id]) || ITEMS[id].desc;
  const stacks: any[] = [];
  state.run.items.forEach((it, i) => {
    const st = stacks.find((x) => x.id === it);
    if (st) st.n++;
    else stacks.push({ id: it, i, n: 1 });
  });
  const ov = modal(
    `<h2>🎒 Beutel</h2>${state.run.items.length ? `<div class="items">${stacks.map((st) => `<button class="item" data-i="${st.i}" aria-label="${ITEMS[st.id].name}${st.n > 1 ? `, ${st.n} Stück` : ''}: ${esc(desc(st.id))}"><span>${ITEMS[st.id].icon} ${ITEMS[st.id].name}${st.n > 1 ? ` <b class="count">×${st.n}</b>` : ''}</span><small>${esc(desc(st.id))}</small></button>`).join('')}</div><p class="muted" style="opacity:.8;margin-top:10px" id="bagdesc">Tippe auf einen Gegenstand, um ihn zu benutzen.</p>` : '<p>Dein Beutel ist leer.</p>'}<button class="btn secondary" id="close" style="margin-top:10px">Schließen</button>`,
  );
  $('#close', ov).onclick = () => ov.remove();
  ov.querySelectorAll<HTMLElement>('.item').forEach((b) => {
    b.onclick = () => {
      const id = state.run.items[+b.dataset.i];
      const it = ITEMS[id];
      if (it.heal && state.run.hero.hp >= state.run.hero.maxHp) {
        $('#bagdesc', ov).textContent = T.full || 'Du hast schon volle Lebenspunkte.';
        return;
      }
      if ((it.shield || it.power || it.hint) && !inBattle) {
        $('#bagdesc', ov).textContent = `${it.name}: ${T.later || 'Das kannst du nur im Kampf benutzen.'}`;
        return;
      }
      if (it.revive) {
        $('#bagdesc', ov).textContent = `${it.name}: ${desc(id)}`;
        return;
      }
      if ((it.shield && state.run.shield) || (it.power && state.run.power) || (it.hint && state.run.hint)) {
        $('#bagdesc', ov).textContent = `${it.name} wirkt schon – mehr geht nicht gleichzeitig.`;
        return;
      }
      state.run.items.splice(+b.dataset.i, 1);
      if (it.heal) heal(it.heal);
      if (it.shield) state.run.shield = true;
      if (it.power) state.run.power = true;
      if (it.hint) state.run.hint = true;
      const lv = it.xp ? gainXp(it.xp) : [];
      saveAll();
      ov.remove();
      if (inBattle) inBattle(it, lv);
      else if (T.done) T.done(it);
      else {
        screenMap();
        if (it.xp) {
          const m = modal(
            `<h2>${it.icon} +${it.xp} XP</h2>${lv.map((x) => `<p style="font-weight:800;color:var(--orange)">${esc(x)}</p>`).join('') || '<p>Dein Monster lernt dazu.</p>'}<button class="btn" id="tutok">Weiter</button>`,
          );
          $('#tutok', m).focus({ preventScroll: true });
          $('#tutok', m).onclick = () => m.remove();
        }
      }
    };
  });
}

// resume exactly where it stopped, so closing the app never swaps a node or resets a fight
export function resumeRun() {
  state.depth = 2;
  const n = state.run.node;
  if (!isObj(n)) return screenMap();
  if (n.done) return advance();
  if (n.reward) return screenTreasure('elite'); // elite beaten, reward not picked yet
  if (isObj(n.enemy)) {
    const b = { enemy: n.enemy, log: 'Der Kampf geht weiter!', logCls: '', phase: 'choose' };
    if (isObj(n.enemy.top) && (n.enemy.hp <= 0 || n.enemy.top.spin <= 0)) return topEnd(b);
    if (n.enemy.hp <= 0) return n.enemy.read ? readEnd(b) : battleWon(b); // defeated just before the app closed: hand out the reward
    if (n.enemy.pending) {
      b.phase = 'wait';
      renderBattle(b);
      setTimeout(() => {
        if (state.run) enemyTurn(b, n.enemy.pending);
      }, 1200);
      return;
    } // the enemy still has its turn
    return renderBattle(b);
  }
  if (n.type === 'event' && Number.isInteger(n.opt)) return screenEvent(n.opt); // a started event task can't be swapped for the safe option
  enterNode(n.type);
}
// mark the current node as finished (rewards already given) – a reload then simply moves on
export function nodeDone() {
  if (state.run.node) {
    state.run.node.done = true;
    state.run.node.enemy = null;
  }
}
function enterNode(type) {
  if (type === 'fight') startBattle(pick(CFG().enemies[state.run.world].normal), false);
  else if (type === 'elite') startBattle(CFG().enemies[state.run.world].elite, true);
  else if (type === 'boss') startBattle(CFG().enemies[state.run.world].boss, true);
  else if (type === 'weekboss') startBattle(weekBossSpec(state.run.world), true);
  else if (type === 'arena') startBattle(pick(CFG().enemies[state.run.world].normal), false, true);
  else if (type === 'event') screenEvent();
  else if (type === 'rest') screenRest();
  else if (type === 'treasure') screenTreasure();
  else if (type === 'school') screenSchool(1);
  else if (type === 'bergwerk') screenMine();
  else if (type === 'labor' || type === 'taeusch') screenLabor();
  else if (type === 'karte') screenKarte();
  else if (type === 'lesen') screenRead();
  else if (type === 'markt') {
    if (marketOn()) screenMarket();
    else screenEvent();
  }
}
export function advance() {
  state.run.floor++;
  state.run.shield = false;
  state.run.node = null;
  if (state.run.floor > state.run.map.length) {
    if (state.run.world >= CFG().worlds) {
      screenVictory();
      return;
    }
    state.run.world++;
    state.run.floor = 1;
    state.run.map = makeMapFor(state.run.world);
    state.run.path = [];
    state.meta.bestWorld = Math.max(state.meta.bestWorld, state.run.world);
    if (CFG().worldAttacks && CFG().worldAttacks[state.run.world]) {
      state.run.hero.attacks = CFG().worldAttacks[state.run.world].map((x) => ({ name: x.name, mod: x.mod }));
    }
  }
  saveAll();
  screenMap();
}
