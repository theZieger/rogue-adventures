import { MONART } from '../monsters.ts';
import { TOP, isObj } from '../save.ts';
import { TEXTE } from '../texte.ts';
import { screenGameOver } from './collection.ts';
import { $, BEATS, CFG, ITEMS, MODULES_OF, TYPES, app, esc, pick, reducedMotion, shuffle } from './core.ts';
import { advance, nodeDone, showBag, textsFor } from './map.ts';
import { screenTreasure } from './nodes.ts';
import {
  addMat,
  gainXp,
  giveStamps,
  heal,
  heroAttacks,
  heroName,
  heroSVG,
  heroSpec,
  makeTask,
  monsterSVG,
  payAnswers,
  recordAnswer,
  stampLine,
  struggling,
  taskTier,
  typeChip,
  weekly,
  weeklyStep,
  xpNeeded,
} from './progress.ts';
import { state } from './state.ts';
import { endRun, saveAll } from './storage.ts';
import { plain, runTask, sayCard, speakBtn } from './tasks.ts';
import { openGoals } from './title.ts';
import { SFX, announce, ensureTutorial, fx, modal, render, topbar } from './ui.ts';

/* ---------- Battle ---------- */
// arena: a spinning-top duel against the owner of the other top, which isn't a Monsterbuch entry
export function startBattle(spec, hard, arena?) {
  // extra HP offsets weak-spot damage, so fights stay about as long
  // enemies grow along the way as on an 8-floor map, so a shorter map's boss is just as strong
  const step = ((state.run.floor - 1) * 7) / Math.max(1, state.run.map.length - 1);
  const scale = ENEMY_HP * (1 + step * 0.03);
  const elite = hard && !spec.boss;
  const dexName = spec.base || spec.name;
  const fresh = !arena && !state.meta.dex[dexName];
  if (fresh) giveStamps(2);
  const mods = heroAttacks().map((a) => a.mod);
  const weak = spec.weakOrder ? spec.weakOrder.find((k) => mods.includes(k)) : pickWeak();
  const enemy = {
    fresh,
    name: spec.name,
    type: spec.type,
    shape: spec.shape,
    maxHp: Math.round(spec.hp * scale),
    hp: Math.round(spec.hp * scale),
    atk: Math.round(spec.atk * (1 + step * 0.02)) + (elite ? 1 : 0),
    boss: !!spec.boss,
    elite,
    weekboss: !!spec.weekboss,
    weak,
  };
  if (arena) Object.assign(enemy, { hp: TOP_FOE(), maxHp: TOP_FOE(), top: topStart(enemy) });
  else state.meta.dex[dexName] = { type: spec.type, shape: spec.shape, world: state.run.world, mode: state.mode };
  if (state.run.node) {
    state.run.node.enemy = enemy;
    saveAll();
  }
  const b = {
    enemy,
    log: arena
      ? `${esc(enemy.name)} tritt mit einem Kreisel an. Hol zuerst Schwung: Jede richtige Aufgabe gibt +4.`
      : `${enemy.name} taucht auf! 🎯 Schwachstelle: ${esc(weakName(enemy.weak))}.`,
    logCls: '',
    phase: 'choose',
  };
  renderBattle(b);
}
// some callers pass a second argument from an earlier version; it is ignored
export function renderBattle(b, again?: boolean): void;
export function renderBattle(b) {
  const h = state.run.hero,
    e = b.enemy;
  const pct = (a, m) => Math.max(0, (a / m) * 100);
  const hpcls = (a, m) => (a / m < 0.3 ? 'low' : a / m < 0.6 ? 'mid' : '');
  const quiet = !!b.shown;
  b.shown = true;
  const T = e.top;
  render(
    `<div class="screen">${topbar(T ? '🌀 Kreisel-Arena' : e.read ? '📖 Lesestube' : e.boss ? '👑 Bosskampf' : e.weekboss ? '🏅 Wochenboss' : e.elite ? '💀 Elitekampf' : '⚔️ Kampf')}
      <div class="arena ${T ? 'kreisel' : ''}">
        <div class="plate enemy"><div class="name">${esc(e.name)}</div><div class="plateline">${typeChip(e.type)}${BEATS[heroSpec().type] === e.type ? `<span class="advantage">💪 stark gegen ${TYPES[e.type].name}</span>` : ''}</div><div class="hpbar"><i class="${hpcls(e.hp, e.maxHp)}" style="width:${pct(e.hp, e.maxHp)}%"></i></div><div class="hptext">${T ? `🌀 ${e.hp} Schwung` : `❤️ ${e.hp} / ${e.maxHp}`}</div></div>
        ${
          T
            ? `<div class="dish ${b.clash ? 'clash' : quiet ? '' : 'launch'}" id="dish">${SPIRAL}${topSprite('enemy', e.hp, e.maxHp, TYPES[e.type].color, foeParts(), (b.clash === 'foe' ? 'attacker' : b.clash ? 'target' : '') + (T.spin <= 0 ? ' winner' : ''))}${topSprite('hero', T.spin, T.max, TYPES[heroSpec().type].color, T.parts, (b.clash === 'hero' ? 'attacker' : b.clash ? 'target' : b.boost ? 'boost' : '') + (e.hp <= 0 ? ' winner' : ''))}</div>`
            : `<div class="sprite enemy" id="fe">${monsterSVG(e.shape, TYPES[e.type].color, 0, 'enemy', { elite: e.elite, boss: e.boss || e.weekboss })}<i class="ground"></i></div>
        <div class="sprite hero" id="fh">${heroSVG(heroSpec(), h.evo)}<i class="ground"></i></div>`
        }
        <div class="plate hero"><div class="name">${esc(heroName())} <span class="levelbadge">Lv ${h.level}</span></div>${T ? `<div class="hpbar"><i class="${hpcls(T.spin, T.max)}" style="width:${pct(T.spin, T.max)}%"></i></div><div class="hptext">🌀 ${T.spin} Schwung</div>` : `<div class="hpbar"><i class="${hpcls(h.hp, h.maxHp)}" style="width:${pct(h.hp, h.maxHp)}%"></i></div><div class="hptext">❤️ ${h.hp} / ${h.maxHp} ${state.run.shield ? '🛡️' : ''}</div>`}<div class="xpbar" role="progressbar" aria-label="Erfahrung" aria-valuenow="${Math.round(Math.min(100, (h.xp / xpNeeded(h.level)) * 100))}"><i style="width:${Math.min(100, (h.xp / xpNeeded(h.level)) * 100)}%"></i></div></div>
      </div>
      <div class="log ${b.logCls}">${b.log}</div>
      <div class="taskwrap" id="taskwrap"></div>
      <div class="bottom" id="bottom"></div></div>`,
    quiet,
  );
  announce(b.log.replace(/<[^>]+>/g, ''));
  const log = () => plain(b.log);
  speakBtn($('.log'), 'afterbegin', log, !quiet && log); // Klasse 1 and 2 hear only how a fight starts
  delete b.clash;
  delete b.boost; // the clash plays once, on this render
  if (b.phase === 'choose') renderAttackChoice(b);
}
// a top in the dish: spins slower and wobbles more as its Schwung runs out; the burst shows where a clash lands
const BANG = `<svg class="bang" viewBox="0 0 100 100" aria-hidden="true"><path d="${Array.from(
  { length: 24 },
  (_, i) => {
    const r = i % 2 ? 26 : 48,
      a = (i / 24) * 2 * Math.PI;
    return `${i ? 'L' : 'M'}${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
  },
).join('')}Z" fill="#FFC93C" stroke="#1C2541" stroke-width="3" stroke-linejoin="round"/><path d="${Array.from(
  { length: 12 },
  (_, i) => {
    const r = i % 2 ? 10 : 24,
      a = (i / 12) * 2 * Math.PI + 0.3;
    return `${i ? 'L' : 'M'}${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
  },
).join('')}Z" fill="#FFF9EE"/></svg>`;
const SPARKS = Array.from({ length: 7 }, (_, i) => {
  const a = (i / 7) * 2 * Math.PI + 0.4;
  return `<i style="--dx:${Math.round(70 * Math.cos(a))}px;--dy:${Math.round(48 * Math.sin(a))}px"></i>`;
}).join('');
const SPIRAL = (() => {
  let d = '';
  for (let t = 0; t <= 4 * Math.PI; t += 0.25) {
    const r = 2 + t * 3.4;
    d += `${d ? 'L' : 'M'}${(r * Math.cos(t)).toFixed(1)} ${(r * Math.sin(t)).toFixed(1)}`;
  }
  return `<svg class="emblem" viewBox="-50 -50 100 100" aria-hidden="true"><path d="${d}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`;
})();
function topSprite(who, spin, max, color, parts, state) {
  const live = spin > 0;
  const speed = (0.45 + 0.65 * (1 - spin / max)).toFixed(2);
  return `<div class="sprite ${who} ${live ? 'live' : 'fallen'} ${live && spin / max < 0.3 ? 'low' : ''} ${state}" id="${who === 'hero' ? 'fh' : 'fe'}" style="--spin:${speed}s"><i class="streaks"></i>${MONART.topSVG(color, parts, live ? 'live' : 'fallen')}<i class="wave"></i><span class="sparks">${SPARKS}</span>${BANG}</div>`;
}
// Repeating an attack makes it tired; the weak spot moves to the least-practised attack after each hit.
// Both push children to practise all task types. Damage is always a whole number.
const TIRED = [1, 0.6, 0.35],
  WEAK = 1.5,
  ENEMY_HP = 1.4;
function pickWeak(except?) {
  state.run.used = isObj(state.run.used) ? state.run.used : {};
  const mods = [...new Set<string>(heroAttacks().map((a) => a.mod))];
  const pool = mods.length > 1 ? mods.filter((m) => m !== except) : mods;
  const least = Math.min(...pool.map((m) => state.run.used[m] || 0));
  return pick(pool.filter((m) => (state.run.used[m] || 0) === least));
}
function weakName(mod) {
  const a = heroAttacks().find((x) => x.mod === mod);
  return a ? a.name : MODULES_OF()[mod].name;
}
function attackInfo(b, atk) {
  const strong = BEATS[heroSpec().type] === b.enemy.type;
  const weak = b.enemy.weak === atk.mod;
  const tired = b.enemy.lastMod === atk.mod ? Math.min(b.enemy.reps || 1, TIRED.length - 1) : 0;
  let dmg =
    (MODULES_OF()[atk.mod].dmg + state.run.hero.level * 2) * (strong ? 1.5 : 1) * (weak ? WEAK : 1) * TIRED[tired];
  if (state.run.power) dmg *= 2;
  return { dmg: Math.max(1, Math.round(dmg)), strong, tired, weak };
}
function noteAttackUsed(b, atk) {
  if (b.enemy.lastMod === atk.mod) b.enemy.reps = (b.enemy.reps || 1) + 1;
  else {
    b.enemy.lastMod = atk.mod;
    b.enemy.reps = 1;
  }
}
// The name must hold what the button shows, in that order, so someone who speaks to their device can say it:
// the tags follow the number, and the word „Schaden“ comes after them.
function attackLabel(attack, info, moduleName, isGoal) {
  const tags = [
    isGoal && 'Wochenziel',
    info.weak && 'Schwachstelle',
    info.tired && (info.tired > 1 ? 'sehr müde' : 'müde'),
    state.run.power && 'doppelt',
    info.strong && 'stark',
  ].filter(Boolean);
  const start = `${attack.name}: ${moduleName}, ${info.dmg}`;
  return tags.length ? `${start}, ${tags.join(', ')} – Schaden ${info.dmg}` : `${start} Schaden`;
}
function renderAttackChoice(b) {
  if (b.enemy.read) return readChoice(b);
  if (b.enemy.top) return topChoice(b);
  const atks = heroAttacks();
  const MODULES = MODULES_OF();
  if (!atks.some((a) => a.mod === b.enemy.weak)) {
    b.enemy.weak = pickWeak();
    saveAll();
  } // older save or task types switched in the parent area
  const goalMods = openGoals(state.mode)
    .filter((g) => g.kind === 'right')
    .map((g) => g.mod);
  $('#bottom').innerHTML = `<div class="attacks">${atks
    .map((a, i) => {
      const inf = attackInfo(b, a);
      return `<button class="atk ${inf.tired ? 'tired' : ''} ${inf.weak ? 'weak' : ''}" data-i="${i}" aria-label="${esc(attackLabel(a, inf, MODULES[a.mod].name, goalMods.includes(a.mod)))}"><span class="n">${esc(a.name)}</span><span class="m">${MODULES[a.mod].icon} ${MODULES[a.mod].name}<span class="dmg">💥 ${inf.dmg}</span></span><span class="tags">${goalMods.includes(a.mod) ? '<span class="tag goal">⭐ Wochenziel</span>' : ''}${inf.weak ? '<span class="tag weak">🎯 Schwachstelle</span>' : ''}${inf.tired ? `<span class="tag tired">😮‍💨 ${inf.tired > 1 ? 'sehr müde' : 'müde'}</span>` : ''}${state.run.power ? '<span class="tag power">🌶️ doppelt</span>' : ''}</span></button>`;
    })
    .join(
      '',
    )}</div><div class="row" style="margin-top:8px"><button class="btn secondary small" id="bag">🎒 Beutel (${state.run.items.length})</button><span class="muted" style="align-self:center;font-size:14px">Tipp: Nimm die 🎯 Schwachstelle und wechsle ab.</span></div>`;
  $('#bag').onclick = () => showBag((it, lv) => useItemInBattle(b, it, lv));
  app.querySelectorAll<HTMLElement>('.atk').forEach((btn) => {
    btn.onclick = () => chooseAttack(b, atks[+btn.dataset.i!]);
  });
  if (!state.meta.seenTut['battle:intro2']) showBattleIntro();
}
function showBattleIntro() {
  const ov = modal(
    `<h2>So kämpfst du</h2><ol><li>Tippe auf eine Attacke und löse die Aufgabe.</li><li>Richtig gelöst: Dein Monster trifft. Die Zahl bei 💥 zeigt, wie viel Schaden das macht.</li><li>💪 <b>Stark gegen …</b> beim Gegner heißt: Dein Monster ist stark gegen ihn – alle Attacken machen mehr Schaden.</li><li>🎯 <b>Schwachstelle</b>: Mit dieser Attacke triffst du besonders stark. Nach dem Treffer wandert sie zu einer anderen Attacke.</li><li>😮‍💨 <b>müde</b> heißt: Du hast die Attacke gerade schon benutzt. Nimm eine andere – dann ist sie wieder stark.</li><li>Falsch gelöst: Der Gegner bekommt einen freien Schlag.</li></ol><button class="btn" id="tutok" style="margin-top:12px">Alles klar</button>`,
  );
  $('#tutok', ov).focus({ preventScroll: true });
  $('#tutok', ov).onclick = () => {
    ov.remove();
    state.meta.seenTut['battle:intro2'] = true;
    saveAll();
  };
}
// potions take your turn; shield, cookie, magnifier and stars don't
function useItemInBattle(b, it, lv) {
  b.logCls = 'hit';
  if (it.xp) {
    b.log = `${it.icon} +${it.xp} XP!${lv && lv.length ? ' ' + lv.join(' ') : ''}`;
    b.phase = 'choose';
    renderBattle(b);
    return;
  }
  if (it.shield) {
    b.log = `${it.icon} Schild bereit! Der nächste Angriff wird geblockt.`;
    b.phase = 'choose';
    renderBattle(b);
    return;
  }
  if (it.power) {
    b.log = `${it.icon} ${it.name}! Dein nächster Treffer macht doppelten Schaden.`;
    b.phase = 'choose';
    renderBattle(b);
    return;
  }
  if (it.hint) {
    b.log = `${it.icon} ${it.name}! Bei der nächsten Aufgabe bekommst du einen Tipp.`;
    b.phase = 'choose';
    renderBattle(b);
    return;
  }
  b.log = `${it.icon} ${it.name} benutzt!`;
  enemyTurn(b, 1);
}
function chooseAttack(b, atk) {
  const tier = taskTier(atk.mod);
  let t = makeTask(atk.mod, tier, { elite: b.enemy.elite || b.enemy.boss });
  b.phase = 'task';
  $('.screen').classList.add('tasking');
  $('#bottom').innerHTML = ''; // no second attack while the task opens
  const hint = !!state.run.hint;
  state.run.hint = false;
  let hit: { dmg: number; crit: boolean } | null = null;
  // the answer counts the moment it is checked: damage, stats and the enemy's turn are saved right away
  const onResult = (ok) => {
    recordAnswer(atk.mod, ok, t);
    const inf = attackInfo(b, atk);
    if (ok) {
      noteAttackUsed(b, atk); // only hits make an attack tired – after a mistake the child may try the same type again
      let dmg = inf.dmg;
      const crit = heroSpec().perk === 'crit' && Math.random() < 0.15;
      if (crit) dmg *= 2;
      state.run.power = false;
      b.enemy.hp = Math.max(0, b.enemy.hp - dmg);
      state.run.used = isObj(state.run.used) ? state.run.used : {};
      state.run.used[atk.mod] = (state.run.used[atk.mod] || 0) + 1;
      if (inf.weak && !b.enemy.weekboss) b.enemy.weak = pickWeak(atk.mod); // the week's boss keeps its weak spot
      if (heroSpec().perk === 'heal') heal(3);
      b.log = `${atk.name}: ${crit ? 'VOLLTREFFER – doppelter Schaden! ' : inf.weak ? 'Schwachstelle getroffen! ' : inf.strong ? 'Stark! ' : 'Treffer! '}${dmg} Schaden${inf.tired ? ' (müde)' : ''}`;
      b.logCls = crit ? 'crit' : 'hit';
      hit = { dmg, crit };
      if (b.enemy.hp > 0) b.enemy.pending = 1;
    } else {
      b.log = `${atk.name} geht daneben. ${b.enemy.name} hat einen freien Schlag!`;
      b.logCls = 'miss';
      b.enemy.pending = struggling() ? 1 : 1.5;
    }
    saveAll();
  };
  ensureTutorial(t, () => {
    runTask(t, { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: atk.name, hint, onResult }, () => {
      b.phase = b.enemy.hp <= 0 ? 'over' : 'wait';
      if (hit) {
        renderBattle(b, true);
        $('#fe').classList.add('hurt');
        fx('#fe', '−' + hit.dmg, hit.crit ? 'crit' : '');
        if (hit.crit) SFX.crit();
        else SFX.hit();
      } else renderBattle(b, true);
      if (b.enemy.hp <= 0) {
        setTimeout(() => {
          if (state.run) battleWon(b);
        }, 1500);
        return;
      }
      setTimeout(
        () => {
          if (state.run) enemyTurn(b, b.enemy.pending || 1);
        },
        hit ? 1700 : 1900,
      );
    });
  });
}
export function enemyTurn(b, mult) {
  const h = state.run.hero;
  const move = pick(CFG().moves);
  b.taken = 0;
  delete b.enemy.pending;
  if (state.run.shield) {
    state.run.shield = false;
    b.log = `${b.enemy.name} greift mit ${move} an – dein Schild blockt alles! 🛡️`;
    b.logCls = 'hit';
  } else {
    let dmg = Math.round(b.enemy.atk * mult * (0.85 + Math.random() * 0.3));
    if (BEATS[b.enemy.type] === heroSpec().type) dmg = Math.round(dmg * 1.25);
    if (heroSpec().perk === 'tank') dmg = Math.round(dmg * 0.85);
    dmg = Math.max(1, dmg);
    b.taken = dmg;
    h.hp = Math.max(0, h.hp - dmg);
    b.log = `${b.enemy.name} greift mit ${move} an: ${dmg} Schaden${mult > 1 ? ' (freier Schlag)' : ''}`;
    b.logCls = 'miss';
  }
  const angel = state.run.items.indexOf('engel');
  if (h.hp <= 0 && angel >= 0) {
    state.run.items.splice(angel, 1);
    h.hp = Math.round(h.maxHp * 0.5);
    b.log += ` – aber ${ITEMS.engel.icon} der Schutzengel rettet dich! ❤️ ${h.hp}`;
    b.logCls = 'crit';
  }
  b.phase = h.hp <= 0 ? 'over' : 'choose';
  if (h.hp <= 0) {
    b.stamps = payAnswers();
    endRun();
  } else saveAll();
  renderBattle(b);
  if (b.taken) {
    $('#fh').classList.add('hurt');
    fx('#fh', '−' + b.taken);
    SFX.hurt();
  } else {
    fx('#fh', '🛡️', 'shield');
    SFX.block();
  }
  if (h.hp <= 0) setTimeout(() => screenGameOver(b), 1600);
}
export const LOOT = {
  normal: ['beere', 'beere', 'trank', 'keks', 'lupe', 'stern'],
  boss: ['engel', 'keks', 'schild'],
  chest: ['trank', 'schild', 'keks', 'lupe', 'engel', 'stern'],
  rare: ['engel', 'grosstrank', 'schild'],
};
export function battleWon(b) {
  const e = b.enemy;
  const xp = e.boss ? 60 : e.elite ? 35 : 18;
  const msgs = gainXp(xp);
  // ~1/3 of normal fights drop one item, bosses two; elites pick a reward on the next screen
  const drops: any[] = [];
  if (e.boss) drops.push('grosstrank', pick(LOOT.boss));
  else if (!e.elite && Math.random() < 0.3) drops.push(pick(LOOT.normal));
  state.run.items.push(...drops);
  const wood = state.mode === 'kartoffel' ? (e.boss ? 3 : 1) : 0;
  if (wood) addMat('holz', wood);
  // the Monsterbuch stamps were given when the enemy appeared, they are only shown here
  const stamps = payAnswers() + (e.boss ? giveStamps(5) : 0) + (e.fresh ? 2 : 0);
  if (!(e.boss && state.run.world >= CFG().worlds)) setTimeout(SFX.win, 150);
  if (e.weekboss) {
    weekly().beaten.push(state.mode);
    weeklyStep('boss');
  } else if (e.elite) weeklyStep('elite');
  if (e.elite && state.run.node) {
    state.run.node.enemy = null;
    state.run.node.reward = true;
  } else nodeDone();
  let evoMsg = '';
  if (e.boss && state.run.hero.evo < 2 && CFG().worlds > 1 && state.run.world < CFG().worlds) {
    state.run.hero.evo++;
    state.run.hero.maxHp += 15;
    heal(20);
    state.meta.evoUnlocked[state.run.hero.id + state.run.hero.evo] = true;
    const wa = CFG().worldAttacks && CFG().worldAttacks[state.run.world + 1];
    evoMsg = `<div class="card center" style="margin-top:12px"><h3>Dein Monster entwickelt sich!</h3><div class="evo-row">${heroSVG(heroSpec(), state.run.hero.evo - 1, 'before')}<span aria-hidden="true">➜</span>${heroSVG(heroSpec(), state.run.hero.evo, 'after')}</div><p>Dein Monster ist jetzt <b>${esc(heroName())}</b>!</p>${wa ? `<p>Neue Attacken für die nächste Welt: ${wa.map((x) => esc(x.name)).join(', ')}</p>` : ''}</div>`;
  }
  saveAll();
  render(
    `<div class="screen">${topbar('Gewonnen!')}<div class="scroll"><div class="card center"><h2>${esc(e.name)} besiegt!</h2><p>+${xp} XP</p>${wood ? `<p>🪵 +${wood} Holz für die Werkbank</p>` : ''}${stampLine(stamps)}${drops.map((d) => `<p>${ITEMS[d].icon} ${ITEMS[d].name} gefunden! <small class="muted" style="color:var(--ink-soft)">${esc(ITEMS[d].desc)}</small></p>`).join('')}${e.elite ? '<p>Als Beute suchst du dir gleich eine Belohnung aus.</p>' : ''}${msgs.map((m) => `<p style="color:var(--orange);font-weight:800">${m}</p>`).join('')}</div>${evoMsg}</div><div class="bottom"><button class="btn" id="next">${e.elite ? 'Beute aussuchen' : e.boss ? (state.run.world >= CFG().worlds ? 'Zum großen Finale' : 'Weiter zur nächsten Welt') : 'Weiter'}</button></div></div>`,
  );
  sayCard();
  $('#next').onclick = e.elite ? () => screenTreasure('elite') : advance;
}

/* ---------- Kreisel-Arena ---------- */
// Schwung instead of life points: three tasks to wind up (+4 each), then each right answer costs the other top
// your Wucht, each wrong one costs yours 6 minus Panzer. No items; losing only ends this node.
export const TOP_START = 3,
  TOP_WIND = 4,
  TOP_KNOCK = 6;
const TOP_FOE = () => 16 + 8 * state.run.world;
export const topVal = (slot) => TOP[slot].find((p) => p.id === state.meta.top[slot]).val;
// the other top gets better parts in later worlds (only its look; its Schwung comes from TOP_FOE)
const foeParts = () => {
  const i = Math.min(state.run.world, 3) - 1;
  return { tip: TOP.tip[i].id, ring: TOP.ring[i].id, disc: TOP.disc[i].id };
};
// parts and values are fixed when the duel starts, so changing parts during a running duel changes nothing
const topStart = (enemy) => ({
  start: 0,
  spin: topVal('disc'),
  max: topVal('disc') + TOP_START * TOP_WIND,
  wucht: topVal('tip') + (BEATS[heroSpec().type] === enemy.type ? 2 : 0),
  panzer: topVal('ring'),
  parts: Object.assign({}, state.meta.top),
});
function topChoice(b) {
  const e = b.enemy,
    T = e.top;
  if (e.hp <= 0 || T.spin <= 0) {
    $('#bottom').innerHTML = '<button class="btn" id="next">Weiter</button>';
    $('#next').onclick = () => topEnd(b);
    return;
  }
  const atks = heroAttacks();
  const M = MODULES_OF();
  const wind = T.start < TOP_START;
  $('#bottom').innerHTML =
    `<div class="attacks">${atks.map((a, i) => `<button class="atk" data-i="${i}" aria-label="${esc(a.name)}: ${M[a.mod].name}, ${wind ? `${TOP_WIND} Schwung` : `Wucht ${T.wucht}`}"><span class="n">${esc(a.name)}</span><span class="m">${M[a.mod].icon} ${M[a.mod].name}<span class="dmg">${wind ? `🌀 +${TOP_WIND}` : `💥 ${T.wucht}`}</span></span></button>`).join('')}</div>
      <p class="muted toprule">${wind ? `Schwung holen: Aufgabe ${T.start + 1} von ${TOP_START}` : `Wucht ${T.wucht} · Panzer ${T.panzer}. Eine falsche Antwort kostet dich ${TOP_KNOCK - T.panzer} Schwung.`}</p>`;
  app.querySelectorAll<HTMLElement>('.atk').forEach((btn) => {
    btn.onclick = () => topAttack(b, atks[+btn.dataset.i!]);
  });
  if (!state.meta.seenTut['arena:intro']) {
    const ov = modal(
      `<h2>🌀 Kreisel-Arena</h2><ol><li>Erst holst du Schwung: ${TOP_START} Aufgaben, jede richtige gibt deinem Kreisel ${TOP_WIND} Schwung.</li><li>Dann stoßen die Kreisel zusammen. Richtig gelöst: Der andere Kreisel verliert so viel Schwung, wie deine Wucht zeigt.</li><li>Falsch gelöst: Dein Kreisel verliert ${TOP_KNOCK} Schwung, weniger, je mehr Panzer er hat.</li><li>Ein Kreisel ohne Schwung kippt um. Verlierst du, geht dein Abenteuer einfach weiter.</li><li>Neue Teile für deinen Kreisel gibt es im Stempelheft unter „Kreisel bauen“.</li></ol><button class="btn" id="tutok" style="margin-top:12px">Verstanden</button>`,
    );
    $('#tutok', ov).focus({ preventScroll: true });
    $('#tutok', ov).onclick = () => {
      ov.remove();
      state.meta.seenTut['arena:intro'] = true;
      saveAll();
    };
  }
}
function topAttack(b, atk) {
  const e = b.enemy,
    T = e.top;
  const t = makeTask(atk.mod, taskTier(atk.mod));
  const wind = T.start < TOP_START;
  b.phase = 'task';
  $('.screen').classList.add('tasking');
  $('#bottom').innerHTML = '';
  $('#dish').classList.remove('clash');
  let fxOn: [sel: string, text: string, cls?: string] | null = null;
  const onResult = (ok) => {
    recordAnswer(atk.mod, ok, t);
    if (wind) {
      T.start++;
      if (ok) T.spin += TOP_WIND;
      b.log = `${ok ? `Richtig: +${TOP_WIND} Schwung` : 'Daneben: kein Schwung dazu'} (${T.start} von ${TOP_START}).${T.start === TOP_START ? ' Jetzt stoßen die Kreisel zusammen.' : ''}`;
      b.logCls = ok ? 'hit' : 'miss';
      if (ok) {
        fxOn = ['#fh', '+' + TOP_WIND, 'shield'];
        b.boost = true;
      }
    } else if (ok) {
      e.hp = Math.max(0, e.hp - T.wucht);
      b.log = `${esc(atk.name)}: Dein Kreisel kracht in den anderen. Der verliert ${T.wucht} Schwung.`;
      b.logCls = 'hit';
      fxOn = ['#fe', '−' + T.wucht];
      b.clash = 'hero';
    } else {
      const l = TOP_KNOCK - T.panzer;
      T.spin = Math.max(0, T.spin - l);
      b.log = `Daneben. Der andere Kreisel kracht in deinen, der verliert ${l} Schwung.`;
      b.logCls = 'miss';
      fxOn = ['#fh', '−' + l];
      b.clash = 'foe';
    }
    if (e.hp <= 0) b.log += ' Der andere Kreisel kippt um.';
    else if (T.spin <= 0) b.log += ' Dein Kreisel kippt um.';
    saveAll();
  };
  ensureTutorial(t, () =>
    runTask(
      t,
      { container: $('#taskwrap'), bottom: $('#bottom'), subtitle: wind ? 'Schwung holen' : atk.name, onResult },
      () => {
        b.phase = 'choose';
        renderBattle(b, true);
        if (!fxOn) return;
        if (wind) fx(fxOn[0], fxOn[1], fxOn[2]);
        else
          setTimeout(
            () => {
              if (!state.run || !$(fxOn![0])) return;
              fx(fxOn![0], fxOn![1]);
              if (fxOn![0] === '#fe') SFX.hit();
              else SFX.hurt();
            },
            reducedMotion ? 0 : 560,
          );
      },
    ),
  );
}
// like a fight: the answers pay their stamps either way, the win adds XP and 1 stamp
export function topEnd(b) {
  const e = b.enemy,
    T = e.top,
    won = e.hp <= 0;
  const xp = won ? 18 : 0;
  const msgs = won ? gainXp(xp) : [];
  const stamps = payAnswers() + (won ? giveStamps(1) : 0);
  nodeDone();
  saveAll();
  if (won) setTimeout(SFX.win, 150);
  render(`<div class="screen">${topbar('🌀 Kreisel-Arena')}<div class="scroll"><div class="card center topend" id="topend"><h2>${won ? 'Der andere Kreisel kippt um.' : 'Dein Kreisel kippt um.'}</h2>${MONART.topSVG(TYPES[heroSpec().type].color, T.parts, won ? 'live' : 'fallen')}
      <p>${won ? `Dein Kreisel dreht sich noch mit ${T.spin} Schwung.` : `${esc(e.name)} gewinnt diesmal. Das kostet dich nichts, dein Abenteuer geht weiter.`}</p>${xp ? `<p>+${xp} XP</p>` : ''}${stampLine(stamps)}${msgs.map((m) => `<p style="color:var(--orange);font-weight:800">${m}</p>`).join('')}
      ${won ? '' : '<p>Neue Teile für deinen Kreisel gibt es im Stempelheft unter „Kreisel bauen“.</p>'}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`);
  $('#next').onclick = advance;
}

/* ---------- Lesestube ---------- */
// three questions about a text are the attacks; after the third the reading lesson ends, beaten or not
const READ_FOE = { name: 'Der Zeilenspringer', type: 'normal', shape: 'zeilenspringer', hp: 30, atk: 4 };
export const READ_MOD = { icon: '📖', name: 'Lesestube' };
export const READ_TUT = {
  title: 'Lesestube',
  steps: [
    'Lies den Text in Ruhe. Vor jeder Frage kannst du ihn noch einmal ansehen.',
    'Jede richtige Antwort trifft den Zeilenspringer. Nach einer falschen Antwort schlägt er zurück.',
    'Nach den Fragen ist die Lesestunde vorbei.',
  ],
};
const readText = () => TEXTE[state.run.node.text];
// Silbenmethode: syllables alternate two colours, each word starts with the first
const sylHtml = (s) =>
  s
    .split(/([A-Za-zÄÖÜäöüß·]+)/)
    .map((w, i) =>
      i % 2
        ? w
            .split('·')
            .map((x, k) => `<span class="sy${k % 2}">${x}</span>`)
            .join('')
        : esc(w),
    )
    .join('');
const readCard = (t) =>
  `<div class="card readcard"><div class="eyebrow">${esc(t.kind)}</div><h2>${esc(t.title)}</h2><p${t.syl ? ' class="syl"' : ''}>${t.syl ? sylHtml(t.syl) : esc(t.text)}</p>${t.by ? `<p class="by">${esc(t.by)}</p>` : ''}</div>`;
export function screenRead() {
  if (!Number.isInteger(state.run.node.text) || !TEXTE[state.run.node.text]) {
    state.run.node.text = pick(textsFor(state.mode));
    saveAll();
  }
  render(
    `<div class="screen">${topbar('📖 Lesestube')}<div class="scroll">${readCard(readText())}</div><div class="bottom"><button class="btn" id="next">Zu den Fragen</button></div></div>`,
  );
  $('#next').onclick = () => {
    const e = {
      name: READ_FOE.name,
      type: READ_FOE.type,
      shape: READ_FOE.shape,
      maxHp: READ_FOE.hp,
      hp: READ_FOE.hp,
      atk: READ_FOE.atk,
      read: { q: 0, right: 0 },
    };
    state.run.node.enemy = e;
    saveAll();
    renderBattle({
      enemy: e,
      log: `${e.name} bringt die Zeilen durcheinander. Beantworte ${readText().qs.length === 2 ? 'zwei' : 'drei'} Fragen zum Text.`,
      logCls: '',
      phase: 'choose',
    });
  };
}
function readChoice(b) {
  const r = b.enemy.read;
  const n = readText().qs.length;
  const dmg = Math.ceil(b.enemy.maxHp / n);
  if (r.q >= n || b.enemy.hp <= 0) {
    $('#bottom').innerHTML = '<button class="btn" id="next">Weiter</button>';
    $('#next').onclick = () => readEnd(b);
    return;
  }
  $('#bottom').innerHTML =
    `<div class="attacks" style="grid-template-columns:1fr"><button class="atk" id="rq" aria-label="Frage ${r.q + 1} von ${n}, ${dmg} Schaden"><span class="n">Frage ${r.q + 1} von ${n}</span><span class="m">${READ_MOD.icon} ${READ_MOD.name}<span class="dmg">💥 ${dmg}${state.run.power ? ' · 🌶️ doppelt' : ''}</span></span></button></div><div class="row" style="margin-top:8px"><button class="btn secondary small" id="rtext">📄 Text ansehen</button><button class="btn secondary small" id="bag">🎒 Beutel (${state.run.items.length})</button></div>`;
  $('#rtext').onclick = () => {
    const ov = modal(
      `${readCard(readText())}<button class="btn" id="tutok" style="margin-top:12px">Zurück zur Frage</button>`,
    );
    $('#tutok', ov).focus({ preventScroll: true });
    $('#tutok', ov).onclick = () => ov.remove();
  };
  $('#bag').onclick = () => showBag((it, lv) => useItemInBattle(b, it, lv));
  $('#rq').onclick = () => readAsk(b, dmg);
}
function readAsk(b, dmg) {
  const r = b.enemy.read;
  const tx = readText();
  const q = tx.qs[r.q];
  const t = {
    kind: 'choice',
    mod: 'lesen',
    tier: 1,
    group: 'lesen:1',
    q: q.q,
    options: shuffle(q.o),
    answer: q.o[q.a],
    qid: 'lesen_' + tx.id + r.q,
    cols: 1,
  };
  b.phase = 'task';
  $('.screen').classList.add('tasking');
  $('#bottom').innerHTML = '';
  const hint = !!state.run.hint;
  state.run.hint = false;
  let hit = 0;
  const onResult = (ok) => {
    r.q++;
    if (ok) {
      r.right++;
      hit = dmg * (state.run.power ? 2 : 1);
      state.run.power = false;
      b.enemy.hp = Math.max(0, b.enemy.hp - hit);
      b.log = `Richtig gelesen: ${hit} Schaden`;
      b.logCls = 'hit';
    } else {
      b.log = `Das stand anders im Text. ${b.enemy.name} hat einen freien Schlag!`;
      b.logCls = 'miss';
      b.enemy.pending = 1;
    }
    saveAll();
  };
  ensureTutorial(t, () =>
    runTask(
      t,
      {
        container: $('#taskwrap'),
        bottom: $('#bottom'),
        subtitle: `Frage ${r.q + 1} von ${tx.qs.length}`,
        hint,
        onResult,
      },
      () => {
        b.phase = b.enemy.pending ? 'wait' : 'choose';
        renderBattle(b, true);
        if (hit) {
          $('#fe').classList.add('hurt');
          fx('#fe', '−' + hit);
          SFX.hit();
        } else
          setTimeout(() => {
            if (state.run) enemyTurn(b, 1);
          }, 1700);
      },
    ),
  );
}
export function readEnd(b) {
  const r = b.enemy.read;
  const beaten = b.enemy.hp <= 0;
  const xp = 6 * r.right;
  const msgs = gainXp(xp);
  nodeDone();
  saveAll();
  if (r.right) setTimeout(SFX.win, 150);
  render(
    `<div class="screen">${topbar('📖 Lesestube')}<div class="scroll"><div class="card center"><h2>${esc(b.enemy.name)} ${beaten ? 'ist besiegt.' : 'verschwindet zwischen den Seiten.'}</h2><p>${r.right} von ${readText().qs.length} Fragen richtig</p>${xp ? `<p>+${xp} XP</p>` : ''}${msgs.map((m) => `<p style="color:var(--orange);font-weight:800">${m}</p>`).join('')}</div></div><div class="bottom"><button class="btn" id="next">Weiter</button></div></div>`,
  );
  sayCard();
  $('#next').onclick = advance;
}
