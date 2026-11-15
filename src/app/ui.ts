import { MQ } from '../logic.ts';
import { READ_MOD, READ_TUT } from './battle.ts';
import { $, CFG, MODULES_OF, app, esc } from './core.ts';
import { tutKey } from './progress.ts';
import { state } from './state.ts';
import { saveAll } from './storage.ts';
import { joined, speakBtn } from './tasks.ts';

/* ---------- Rendering primitives ---------- */
// physical keyboard while a number task is open
// quiet: re-render without fade-in (battle turns)
export function render(html, quiet?) {
  state.keyHandler = null;
  state.backTo = null;
  if (window.speechSynthesis) speechSynthesis.cancel();
  app.innerHTML = html;
  // a list with nothing to tab to must take the keyboard itself, or it cannot be scrolled without touch
  for (const list of app.querySelectorAll<HTMLElement>('.scroll'))
    if (!$('button, a, input, [tabindex]', list)) list.tabIndex = 0;
  if (!quiet && app.firstElementChild) app.firstElementChild.classList.add('enter');
  syncHistory();
}

/* ---------- Back button ---------- */
// Android's back button and the browser's back gesture step back inside the app. History holds one entry per level
// (title 0, its screens 1, adventure and sub pages 2, an open dialog one more), so an adventure never floods it and
// in-screen updates add nothing. Back does what the screen's „Zurück“ does: a dialog closes, the map goes to the
// subject (the run stays saved), fights and tasks have no „Zurück“ and stay put, the title screen leaves the app.
// History is only a convenience: a reload starts on the title as before.
let maxD = 0;
let moving = 0; // moving: our own history.go is on its way
const level = () => state.depth + ($('.overlay') ? 1 : 0);
const atD = () => (history.state && Number.isInteger(history.state.lq) ? history.state.lq : 0);
function syncHistory() {
  const d = atD(),
    want = level();
  if (moving || want === d) return;
  // walk over entries that are still there instead of pushing: Chrome skips entries on back that were pushed without a tap
  const to = Math.min(want, Math.max(maxD, d));
  try {
    if (to !== d) {
      moving = setTimeout(() => {
        moving = 0;
        syncHistory();
      }, 1000);
      history.go(to - d);
    } else
      for (let i = d + 1; i <= want; i++) {
        history.pushState({ lq: i }, '');
        maxD = i;
      }
  } catch (e) {
    clearTimeout(moving);
    moving = 0;
  }
}
function goBack() {
  const ov = $('.overlay');
  if (ov) {
    const b = $('#no, #ino, #iok, #ok, #close, #tutok, #hnext', ov);
    return b ? b.click() : ov.remove();
  }
  if (state.backTo) return state.backTo();
  const b = $<HTMLButtonElement>('#pback') || $<HTMLButtonElement>('#back');
  if (b && !b.disabled) b.click();
}
try {
  history.replaceState({ lq: 0 }, '');
} catch (e) {
  /* no history */
}
window.addEventListener('popstate', () => {
  if (moving) {
    clearTimeout(moving);
    moving = 0;
    return syncHistory();
  }
  const d = atD();
  if (d >= level()) return syncHistory();
  // a screen reached by going back takes the entry back landed on
  const was = app.firstElementChild;
  goBack();
  if (app.firstElementChild !== was) state.depth = Math.min(state.depth, d);
  syncHistory();
});

/* ---------- Sounds ---------- */
// phones stay silent until a user gesture, so the first tap unlocks the context
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext; // Safari before 14.1
    __sfx: typeof SFX; // for the tests
  }
}
export const SFX = (() => {
  const FILES = {
    tap: 0.45,
    right: 0.9,
    wrong: 0.9,
    hit: 1,
    crit: 1,
    hurt: 0.9,
    block: 1,
    levelup: 1,
    win: 1,
    finale: 1,
    lose: 0.9,
  };
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx: AudioContext | null = null,
    loading = false;
  const buffers: Record<string, AudioBuffer> = {};
  function load() {
    loading = true;
    if (typeof fetch !== 'function') return;
    for (const k of Object.keys(FILES))
      fetch('sounds/' + k + '.mp3')
        .then((r) => r.arrayBuffer())
        .then((ab) => ctx!.decodeAudioData(ab))
        .then((buf) => {
          buffers[k] = buf;
        })
        .catch(() => {});
  }
  function ensure() {
    if (!AC || !state.meta.sound) return null;
    try {
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended') ctx.resume();
      if (!loading) load();
      return ctx;
    } catch (e) {
      return null;
    }
  }
  function play(k) {
    const c = ensure();
    if (!c || !buffers[k]) return;
    try {
      const src = c.createBufferSource();
      src.buffer = buffers[k];
      const g = c.createGain();
      g.gain.value = FILES[k];
      src.connect(g);
      g.connect(c.destination);
      src.start();
    } catch (e) {}
  }
  const api: { unlock: typeof ensure; loaded: () => number; [sound: string]: (arg?: number) => unknown } = {
    unlock: ensure,
    loaded: () => Object.keys(buffers).length,
  };
  for (const k of Object.keys(FILES)) api[k] = () => play(k);
  // short Turmwacht sounds made in code (no files); quiet on purpose, parents hear them too
  const tone = (c, t, type, f0, f1, dur, vol) => {
    const o = c.createOscillator(),
      g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.03);
  };
  const hiss = (c, t, dur, vol, freq) => {
    const b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate),
      d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
    const s = c.createBufferSource(),
      f = c.createBiquadFilter(),
      g = c.createGain();
    s.buffer = b;
    f.type = 'bandpass';
    f.frequency.value = freq;
    g.gain.value = vol;
    s.connect(f);
    f.connect(g);
    g.connect(c.destination);
    s.start(t);
  };
  const SYN = {
    pop: (c, t) => {
      tone(c, t, 'sine', 700, 140, 0.13, 0.22);
      hiss(c, t, 0.08, 0.25, 1800);
    },
    clink: (c, t, k = 0) => {
      const f = 1700 * 2 ** (k / 12);
      tone(c, t, 'triangle', f, f * 0.98, 0.09, 0.09);
      tone(c, t + 0.012, 'sine', f * 1.5, f * 1.5, 0.07, 0.05);
    },
    shatter: (c, t) => {
      hiss(c, t, 0.4, 0.35, 4200);
      [2600, 3300, 2100, 3900].forEach((f, i) => tone(c, t + i * 0.035, 'sine', f, f * 0.9, 0.12, 0.05));
    },
    bell: (c, t) => {
      [
        [660, 0.12],
        [1320, 0.05],
        [1980, 0.03],
      ].forEach(([f, v]) => tone(c, t, 'sine', f, f * 0.995, 1.1, v));
    },
    shot: (c, t, k = 1) => {
      tone(c, t, 'triangle', 900 + 150 * k, 320, 0.1, 0.07);
      if (k > 1) tone(c, t, 'sine', 180, 90, 0.12, 0.08);
    },
    swish: (c, t) => hiss(c, t, 0.16, 0.18, 900),
    chime: (c, t) => [784, 988, 1175].forEach((f, i) => tone(c, t + i * 0.08, 'sine', f, f, 0.35, 0.07)),
    thud: (c, t) => {
      tone(c, t, 'sine', 140, 55, 0.22, 0.25);
      hiss(c, t, 0.12, 0.2, 400);
    },
  };
  for (const k of Object.keys(SYN))
    api[k] = (arg) => {
      const c = ensure();
      if (c)
        try {
          SYN[k](c, c.currentTime + 0.005, arg);
        } catch (e) {}
    };
  return api;
})();
['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
  document.addEventListener(ev, () => SFX.unlock(), { capture: true, passive: true }),
);
document.addEventListener(
  'click',
  (e) => {
    if ((e.target as Element).closest && (e.target as Element).closest<HTMLElement>('button')) SFX.tap();
  },
  true,
);
window.__sfx = SFX;
export function fx(sel, text, cls?) {
  const el = $(sel);
  if (!el) return;
  const r = el.getBoundingClientRect();
  const s = document.createElement('span');
  s.className = 'floatnum ' + (cls || '');
  s.textContent = text;
  s.setAttribute('aria-hidden', 'true');
  s.style.left = r.left + r.width / 2 + 'px';
  s.style.top = r.top + Math.min(40, r.height * 0.3) + 'px';
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 2100);
}
document.addEventListener('keydown', (e) => {
  if (state.keyHandler && !e.ctrlKey && !e.metaKey && !e.altKey && !$('.overlay')) state.keyHandler(e);
});
// one persistent live region: screen readers miss re-created ones
const live = document.createElement('div');
live.className = 'sr-only';
live.setAttribute('aria-live', 'polite');
live.setAttribute('role', 'status');
document.body.appendChild(live);
export function announce(text) {
  live.textContent = '';
  setTimeout(() => {
    live.textContent = text;
  }, 50);
}
export function topbar(title, extra?) {
  return `<div class="topbar"><div class="title">${title}</div>${extra || ''}${state.run && state.run.floor ? `<div class="world">${CFG().worlds > 1 ? `Welt ${state.run.world} · ` : ''}Etage ${state.run.floor}</div>` : ''}</div>`;
}
let modals = 0;
export function modal(html) {
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  const heading = $('h2, h3', ov);
  if (heading) {
    heading.id = `modal-title-${++modals}`;
    ov.firstElementChild!.setAttribute('aria-labelledby', heading.id);
  } else ov.firstElementChild!.setAttribute('aria-label', 'Hinweis');
  const behind = [...app.children] as HTMLElement[];
  behind.forEach((el) => {
    el.inert = true;
  });
  app.appendChild(ov);
  const rm = ov.remove.bind(ov);
  ov.remove = () => {
    behind.forEach((el) => {
      el.inert = false;
    });
    rm();
    syncHistory();
  };
  syncHistory();
  return ov;
}

/* ---------- Tutorials ---------- */
// maths tutorials also serve the Bergwerk's division tasks in other units
function tutFor(group) {
  if (group === 'lesen:1') return Object.assign({ icon: READ_MOD.icon }, READ_TUT);
  const [mod, tier] = group.split(':');
  const nt = CFG().numTut;
  if (nt) return Object.assign({ icon: MODULES_OF()[mod].icon }, nt[mod][+tier] || nt[mod][1]);
  const t = CFG().tut && CFG().tut[group];
  if (!t) return Object.assign({ icon: MQ.MODULES[mod].icon }, MQ.TUT[mod][+tier] || MQ.TUT[mod][1]);
  const M = MODULES_OF()[mod];
  return Object.assign({ icon: M ? M.icon : '📖' }, t);
}
export function showTutorial(group, note?, onClose?, auto?) {
  const t = tutFor(group);
  const n = note && CFG().notes ? CFG().notes[note] : null;
  const ov = modal(
    `<h2>${t.icon} ${esc(t.title)}</h2><p class="muted" style="opacity:.8">${auto ? 'Neue Aufgabenart. So geht sie:' : 'So geht es:'}</p><ol>${t.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>${n ? `<div class="ex"><div style="font-size:16px;color:var(--ink-soft)">📄 Aus deinen Notizen: ${esc(n.title)}</div>${n.lines.map((l) => `<div>• ${esc(l)}</div>`).join('')}${n.fig || ''}</div>` : ''}<button class="btn" id="tutok" style="margin-top:12px">Verstanden</button>`,
  );
  const letter = /(^|[\s,(„])[A-Za-zÄÖÜäöü](?=[\s,.)“:]|$)/,
    say = (list) => (CFG().noLetters ? list.filter((x) => !letter.test(x)) : list);
  const steps = () => joined(t.title, ...say(t.steps));
  speakBtn(
    $('h2', ov),
    'afterbegin',
    () => joined(steps(), n && 'Aus deinen Notizen: ' + n.title, ...(n ? say(n.lines) : [])),
    steps,
  );
  $('#tutok', ov).focus({ preventScroll: true });
  $('#tutok', ov).onclick = () => {
    ov.remove();
    state.meta.seenTut[tutKey(group)] = true;
    if (note) state.meta.seenTut[tutKey('note:' + note)] = true;
    saveAll();
    if (onClose) onClose();
  };
}
export function ensureTutorial(task, then) {
  const needGroup = !state.meta.seenTut[tutKey(task.group)];
  const needNote = task.note && !state.meta.seenTut[tutKey('note:' + task.note)];
  if (needGroup || needNote) showTutorial(task.group, task.note, then, true);
  else then();
}
