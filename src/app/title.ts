import { MODES } from '../curriculum.ts';
import { ELTERN } from '../eltern.ts';
import { LAENDER, LAND_CODES, landName } from '../laender.ts';
import { type Markup, html, raw } from '../ui/html.ts';
import { backupDue } from './backup.ts';
import { screenDex, screenStamps } from './collection.ts';
import { $, app, esc, rnd } from './core.ts';
import { screenDuel } from './duell.ts';
import { pAt, screenParent } from './elternbereich.ts';
import { gardenCard, screenGarden } from './garten.ts';
import { screenHut } from './huette.ts';
import { resumeRun, screenStarter } from './map.ts';
import {
  type WeeklyGoal,
  goalDone,
  goalText,
  heroSVG,
  showWeeklyNews,
  showcase,
  weekly,
  weeklyGoals,
} from './progress.ts';
import { state } from './state.ts';
import {
  chooseGrade,
  curGrade,
  extraOn,
  gradeTabs,
  land,
  loadRun,
  saveAll,
  setLand,
  subjectLabel,
  visSubjects,
} from './storage.ts';
import { screenTurm } from './turm_screens.ts';
import { TW_FLAG, loadTurm, turmOn } from './turm.ts';
import { SFX, modal, on, screen, topbar } from './ui.ts';

/* ---------- Screens ---------- */
const GEAR = raw(
  '<svg class="gear" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="3.6" stroke-dasharray="3.4 3.35"/><circle cx="12" cy="12" r="6.2" fill="none" stroke="currentColor" stroke-width="3.2"/></svg>',
);
// Safari (and every browser on iOS) deletes site data after 7 days without a visit, unless the app is on the home screen
declare global {
  interface Navigator {
    standalone?: boolean; // iOS only: opened from the home screen
  }
}
const evictable = () => {
  const ua = navigator.userAgent;
  return (
    (/iPhone|iPad|iPod/.test(ua) ||
      (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ||
      (/Safari\//.test(ua) && !/Chrome|Chromium|Edg|Android|Firefox/.test(ua))) &&
    !navigator.standalone &&
    !!window.matchMedia &&
    window.matchMedia('(display-mode: browser)').matches
  );
};
const newDex = () => Math.max(0, Object.keys(state.meta.dex).length - state.meta.seenDex);
const tile = (id: string, icon: string, name: string, desc: string, pill: Markup | string = '') =>
  html`<button class="card subjtile" id="${id}" data-action="${id}"><span class="subjicon" aria-hidden="true">${icon}</span><span class="subjname">${name}</span><span class="desc">${desc}</span>${pill}</button>`;
// cards slide in one after another as they come into view; a redraw for the same visit (sound on/off) keeps them still
let still = false;
function reveal() {
  if (still || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches)
    return void (still = false);
  const items = [...app.querySelectorAll<HTMLElement>('.hero, .scroll .card, .grades')];
  const io = new IntersectionObserver(
    (entries) => {
      let i = 0;
      for (const e of entries)
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          el.style.setProperty('--i', String(Math.min(i++, 6)));
          el.classList.add('in');
          io.unobserve(el);
        }
    },
    { threshold: 0.1 },
  );
  for (const el of items) {
    el.classList.add('reveal');
    io.observe(el);
  }
}
const showWarn = () => evictable() && !(Date.now() - Date.parse(state.meta.storage.warnedAt) < 30 * 864e5);
// the page's title names the subjects, so it follows the Bundesland like every other place that prints them
const PAGE_TITLE = document.title;
export function screenTitle() {
  state.depth = 0;
  document.title = PAGE_TITLE.replace(/Ethik|Sachkunde/g, (subject) => subjectLabel(subject));
  if (!state.meta.setup.done && !state.meta.setup.skipped) return screenSetup();
  let taps = 0;
  const seen = () => {
    state.meta.storage.warnedAt = new Date().toISOString();
    saveAll();
  };
  screen(
    html`<div class="screen"><div class="scroll"><div class="titlebar"><button class="soundbtn" id="snd" data-action="sound" aria-label="${state.meta.sound ? 'Töne ausschalten' : 'Töne einschalten'}" aria-pressed="${String(!!state.meta.sound)}">${state.meta.sound ? '🔊' : '🔇'}</button><button class="stampbtn" id="stampsTop" data-action="stamps" aria-label="Stempelheft, ${state.meta.stamps} Stempel">🏷️ ${state.meta.stamps}</button><button class="newsbtn" id="news" data-action="news" aria-label="Was ist neu?">✨${hasNews() ? html`<span class="pill new">Neu!</span>` : ''}</button><button class="parentbtn" id="parents" data-action="parents">${GEAR}<span class="sr-only">Eltern</span>${backupDue() ? html`<span class="dot" aria-hidden="true"></span><span class="sr-only">, bitte Spielstand sichern</span>` : ''}</button></div><div class="hero"><div class="showcase">${raw(heroSVG(showcase(), 2))}</div><h1 id="logo" data-action="logo">Lern­quest</h1></div>
      <div class="stack" style="margin-top:var(--space-16)">
        ${showWarn() ? html`<div class="card warncard"><button class="warnx" id="warnx" data-action="warnx" aria-label="Hinweis schließen">✕</button><p>Safari löscht deinen Fortschritt nach 7 Tagen Pause. Installiere Lernquest auf dem Startbildschirm oder sichere den Spielstand im Elternbereich.</p><button class="btn small secondary" id="warnp" data-action="warnp">Zum Elternbereich</button></div>` : ''}
        ${extraOn('wochenziele') ? weeklyCard() : ''}
        ${raw(gradeTabs())}${extraOn('garten') ? raw(gardenCard()) : ''}<div class="subjects">${visSubjects().map(
          (sub, i) => {
            const live = sub.modes.some((m) => loadRun(m));
            return html`<button class="card subjtile" data-sub="${i}" data-action="subject"><span class="subjicon" aria-hidden="true">${sub.icon}</span><span class="subjname">${subjectLabel(sub.subject)}</span><span class="desc">${live ? '▶ Abenteuer läuft' : `${sub.modes.length} ${sub.modes.length === 1 ? 'Thema' : 'Themen'}`}</span>${sub.modes.every(fromNext) ? nextPill(sub.modes[0]) : ''}</button>`;
          },
        )}</div>
        <div class="subjects more">${[
          tile(
            'dex',
            '📗',
            'Monsterbuch',
            `${Object.keys(state.meta.dex).length} Monster`,
            newDex() ? html`<span class="pill new">${newDex()} neu</span>` : '',
          ),
          extraOn('huette') && tile('hut', '🏡', 'Meine Hütte', 'Möbel aufstellen'),
          extraOn('garten') && tile('garden', '🌼', 'Schulgarten', 'Beete und Ernte'),
          extraOn('duell') && tile('duel', '👥', 'Duell', 'Zu zweit üben'),
          turmOn() &&
            tile(
              'turm',
              '🏰',
              'Turmwacht',
              'Turm schützen',
              loadTurm() ? html`<span class="pill">${raw(TW_FLAG)}läuft</span>` : '',
            ),
        ].filter(Boolean)}</div>
      </div></div></div>`,
    {
      logo: () => {
        taps++;
        if (taps >= 5) {
          taps = 0;
          askPin(screenParent);
        }
      },
      parents: () => askPin(screenParent),
      warnx: () => {
        seen();
        screenTitle();
      },
      warnp: () => {
        seen();
        askPin(() => screenParent('save'));
      },
      subject: (b) => screenSubject(visSubjects()[+b.dataset.sub!]),
      dex: screenDex,
      stamps: () => screenStamps(),
      news: screenNews,
      duel: () => screenDuel([]),
      turm: screenTurm,
      hut: screenHut,
      garden: screenGarden,
      sound: () => {
        still = true;
        state.meta.sound = !state.meta.sound;
        saveAll();
        if (state.meta.sound) {
          SFX.unlock();
          setTimeout(SFX.right, 150);
        }
        screenTitle();
      },
      weekly: screenWeekly,
    },
  );
  reveal();
  on({ harvest: screenGarden, grade: (chip) => chooseGrade(chip, screenTitle) });
  showWeeklyNews();
}
// a unit of the next grade that parents added to this one carries its own grade
const fromNext = (m: string) => MODES[m].grade !== curGrade().grade;
const nextPill = (m: string) => html`<span class="pill">Klasse ${MODES[m].grade}</span>`;
type SubjectTile = ReturnType<typeof visSubjects>[number];
export const subjectOf = (m: string) =>
  visSubjects().find((sub) => sub.modes.includes(m)) || curGrade().subjects.find((sub) => sub.modes.includes(m));
export const practised = (m: string) => Object.values(state.meta.stats[m]).some((x) => x.t > 0);
// no locks: a ranked subject marks its easiest theme and points from a harder one to the easiest one not practised yet
// undefined is not expected: the callers ask for the subject of a unit of this grade
export function screenSubject(sub: SubjectTile | undefined) {
  state.depth = 1;
  const ranked = sub!.modes.some((m) => MODES[m].rank);
  const path = (m: string, i: number) => {
    const e = ranked && sub!.modes.slice(0, i).find((x) => !practised(x));
    return [
      fromNext(m) ? nextPill(m) : '',
      ranked && !i ? html`<span class="pill good">Hier anfangen</span>` : '',
      e ? html`<p class="pathhint">Leichter geht es mit „${MODES[e].title}“ los.</p>` : '',
    ];
  };
  screen(
    html`<div class="screen">${raw(topbar(esc(subjectLabel(sub!.subject))))}<div class="scroll"><div class="stack">${
      extraOn('wochenziele')
        ? weeklyGoals()
            .filter((g) => g.subject === sub!.subject && !goalDone(g))
            .map((g) => html`<p class="callout">⭐ Wochenziel: ${goalText(g)}</p>`)
        : ''
    }${sub!.modes.map((m, i) => {
      const r = loadRun(m);
      const c = MODES[m];
      return html`<div class="card modecard"><div class="row" style="align-items:center;gap:var(--space-12)"><div style="font-size:var(--text-36)" aria-hidden="true">${c.icon}</div><div style="flex:1"><h3>${c.title}</h3><div class="desc">${c.sub}</div></div></div>${path(m, i)}<div class="row" style="margin-top:var(--space-12)">${r ? html`<button class="btn small" data-cont="${m}" data-action="resume">Weiter${c.worlds > 1 ? ` (Welt ${r.world})` : ''}</button>` : ''}<button class="btn small ${r ? 'secondary' : ''}" data-new="${m}" data-action="start">${r ? 'Neu' : 'Starten'}</button></div></div>`;
    })}</div></div><div class="bottom"><button class="btn secondary" id="back" data-action="back">Zurück</button></div></div>`,
    {
      resume: (b) => {
        state.mode = b.dataset.cont!;
        state.run = loadRun(state.mode);
        if (state.run) resumeRun();
        else screenSubject(sub);
      },
      start: (b) => {
        state.mode = b.dataset.new!;
        const r = loadRun(state.mode);
        if (r) {
          const ov = modal(
            html`<h2>Neues Abenteuer?</h2><p>Dein laufendes Abenteuer in „${MODES[state.mode].title}“ wird gelöscht.</p><div class="stack"><button class="btn" id="yes" data-action="yes">Ja, neu starten</button><button class="btn secondary" id="no" data-action="no">Zurück</button></div>`,
            {
              yes: () => {
                state.run = null;
                screenStarter(); /* old save is replaced only when the new adventure starts */
              },
              no: () => ov.remove(),
            },
          );
        } else screenStarter();
      },
      back: screenTitle,
    },
  );
}
export const goalCount = (g: WeeklyGoal) => Math.min(g.n, weekly().progress[g.i] || 0);
function weeklyCard() {
  const goals = weeklyGoals();
  const n = goals.filter(goalDone).length;
  const pct = Math.round((goals.reduce((a, g) => a + goalCount(g) / g.n, 0) / goals.length) * 100);
  return html`<button class="card weekcard" id="weekly" data-action="weekly"><span class="eyebrow">Diese Woche</span><span class="weekline"><b>${weekly().done ? 'Wochenaufgabe geschafft' : `${n} von ${goals.length} Zielen erledigt`}</b><span>Neue Aufgaben am Montag</span></span><span class="bar" role="img" aria-label="${pct} %"><i style="width:${pct}%"></i></span>${weekly().done ? '' : html`<span class="weekgo">Ziele ansehen und loslegen ›</span>`}</button>`;
}
export function screenWeekly() {
  state.depth = 1;
  const goals = weeklyGoals();
  screen(
    html`<div class="screen">${raw(topbar('Wochenaufgabe'))}<div class="scroll"><div class="stack">
      <p class="center">${weekly().done ? 'Alle Ziele dieser Woche sind erledigt.' : 'Für jedes Ziel gibt es 3 Stempel. Schaffst du alle, kommt ein Stern auf deine Stempelkarte.'}</p>
      ${goals.map((g) => {
        const c = goalCount(g);
        return html`<div class="card goal${c >= g.n ? ' done' : ''}"><p>${goalText(g)}</p><div class="goalrow"><span class="bar" aria-hidden="true"><i style="width:${(c / g.n) * 100}%"></i></span><b>${c >= g.n ? '✔ ' : ''}${c} von ${g.n}</b></div>${c >= g.n || !g.subject ? '' : html`<button class="btn small secondary goalplay" data-subject="${g.subject}" data-action="goal">▶ ${subjectLabel(g.subject)} üben</button>`}</div>`;
      })}
      <p class="center">Nichts geht verloren, wenn du eine Woche aussetzt. Neue Aufgaben gibt es am Montag.</p>
      </div></div><div class="bottom"><button class="btn secondary" id="back" data-action="back">Zurück</button></div></div>`,
    { back: screenTitle, goal: (b) => screenSubject(visSubjects().find((sub) => sub.subject === b.dataset.subject)) },
  );
}

/* ---------- First start, PIN, parental gate ---------- */
export const setupDone = (how: 'done' | 'skipped') => {
  state.meta.setup[how] = true;
  state.meta.setup.at = state.meta.setup.at || new Date().toISOString();
  saveAll();
};
function screenSetup() {
  state.depth = 0;
  screen(
    html`<div class="screen setup"><div class="scroll"><div class="hero"><div class="showcase">${raw(heroSVG(showcase(), 2))}</div><h1>Willkommen bei Lernquest</h1></div>
      <div class="card"><div class="eyebrow">Für Eltern</div><p>Lernquest speichert alles nur auf diesem Gerät, ohne Konto. Im Elternbereich stellen Sie ein, was geübt wird, und sehen, was schon gut klappt.</p><p>Mit einer vierstelligen PIN können nur Sie dort etwas ändern.</p>
      <div class="stack" style="margin-top:var(--space-16)"><button class="btn" id="setpin" data-action="setpin">PIN festlegen</button><button class="btn secondary" id="setload" data-action="setload">Spielstand laden</button><button class="btn secondary" id="later" data-action="later">Später</button></div>
      <p class="hintsmall">Der Elternbereich ist jederzeit über das Zahnrad oben rechts erreichbar.</p></div>
      <div class="card" style="margin-top:var(--space-12)"><div class="eyebrow">In welche Klasse geht Ihr Kind?</div>${raw(gradeTabs())}<p class="hintsmall">Das lässt sich jederzeit auf der Startseite ändern.</p></div>
      <div class="card" style="margin-top:var(--space-12)"><div class="eyebrow">${ELTERN.LAND.ask}</div><p><b>${landName(land()) || 'Noch nicht gewählt'}</b></p><button class="btn small secondary" id="setland" data-action="setland">Bundesland wählen</button><p class="hintsmall">Sie können das überspringen und jederzeit im Elternbereich ändern.</p></div></div></div>`,
    {
      setland: () => screenLand(screenSetup),
      setpin: () => setPin(screenTitle, screenSetup),
      setload: () => screenParent('load', screenSetup),
      later: () => {
        setupDone('skipped');
        screenTitle();
      },
    },
  );
  on({ grade: (chip) => chooseGrade(chip, screenSetup) });
}
// The Bundesland, asked on the first start and in the parent area. A tap chooses and goes back: the choice only
// sets defaults (storage.ts), so it is safe at any time, also in the middle of an adventure.
export function screenLand(back: () => void) {
  state.depth++;
  const row = (code: string, name: string) =>
    html`<button class="choice${code === land() ? ' selected' : ''}" data-land="${code}" data-action="land" aria-pressed="${String(code === land())}"><span class="meta"><span class="name">${name}</span></span></button>`;
  screen(
    html`<div class="screen">${raw(topbar('Bundesland'))}<div class="scroll"><div class="stack"><p class="center">${ELTERN.LAND.ask}</p>${row('', ELTERN.LAND.none)}${LAND_CODES.map((code) => row(code, LAENDER[code].name))}<p class="center">${ELTERN.LAND.later}</p></div></div><div class="bottom"><button class="btn secondary" id="back" data-action="back">Zurück</button></div></div>`,
    {
      land: (b) => {
        setLand(b.dataset.land!);
        back();
      },
      back: () => {
        state.meta.setup.land = true;
        saveAll();
        back();
      },
    },
  );
}
// a parental gate, not encryption: four digits are guessed quickly anyway, the hash only keeps the PIN out of plain sight
const pinHash = (p: string) => {
  let h = 2166136261;
  for (const c of 'lernquest:' + p) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return 'h1' + (h >>> 0).toString(36);
};
let pinFails = 0,
  pinLockUntil = 0;
// one numpad screen for entering the PIN, choosing one and the parental gate
// lock: the PIN itself is asked, three misses lock it; relock: see askPin; task: a sum instead of hidden digits
interface CodeOpts {
  title: string;
  text: string;
  msg?: string;
  task?: string;
  len?: number;
  lock?: boolean;
  relock?: boolean;
  back: () => void;
  forgot?: () => void;
  onCode: (code: string, fail: (msg: string) => void) => void;
}
function screenCode(o: CodeOpts) {
  let val = '';
  const len = o.len || 4;
  if (!o.relock) state.depth++;
  screen(
    html`<div class="screen">${raw(topbar(o.title))}<div class="scroll"><div class="card codecard"><p>${o.text}</p>${o.task ? html`<div class="codetask">${o.task}</div>` : ''}<div class="codeval ${o.task ? 'plain' : ''}" id="cval" role="img"></div><p id="cmsg" class="cmsg" role="status">${o.msg || ''}</p>${o.forgot ? html`<button class="linkbtn" id="forgot" data-action="forgot">PIN vergessen?</button>` : ''}</div></div>
      <div class="bottom"><div class="numpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => html`<button data-k="${d}" data-action="key">${d}</button>`)}<button class="del" data-k="del" data-action="key" aria-label="Löschen">⌫</button><button data-k="0" data-action="key">0</button><button class="ok" data-k="ok" data-action="key" aria-label="Bestätigen">✓</button><button class="cancel" id="back" data-action="back" style="grid-column:1/-1">Zurück</button></div></div></div>`,
    { key: (b) => press(b.dataset.k), back: () => o.back(), forgot: () => o.forgot!() },
  );
  const paint = () => {
    const el = $('#cval');
    el.innerHTML = o.task
      ? esc(val)
      : Array.from({ length: len }, (_, i) => `<i class="${i < val.length ? 'on' : ''}"></i>`).join('');
    el.setAttribute('aria-label', o.task ? val || 'leer' : `${val.length} von ${len} Ziffern`);
  };
  const keys = [...app.querySelectorAll<HTMLButtonElement>('.numpad [data-k]')];
  const fail = (msg: string) => {
    val = '';
    paint();
    $('#cmsg').textContent = msg;
  };
  function press(k: string | undefined) {
    if (keys[0].disabled) return;
    if (k === 'del') val = val.slice(0, -1);
    else if (k === 'ok') {
      if (val && (o.task || val.length === len)) {
        const v = val;
        val = '';
        o.onCode(v, fail);
      }
      return;
    } else if (val.length < len) val += k;
    paint();
    if (!o.task && val.length === len) {
      const v = val;
      val = '';
      o.onCode(v, fail);
    }
  }
  state.keyHandler = (e) => {
    const k = /^[0-9]$/.test(e.key)
      ? e.key
      : e.key === 'Backspace' || e.key === 'Delete'
        ? 'del'
        : e.key === 'Enter'
          ? 'ok'
          : null;
    if (k) {
      e.preventDefault();
      press(k);
    }
  };
  paint();
  const wait = pinLockUntil - Date.now();
  if (o.lock && wait > 0) {
    keys.forEach((b) => {
      b.disabled = true;
    });
    $('#cmsg').textContent = 'Dreimal falsch. Bitte 30 Sekunden warten.';
    setTimeout(() => {
      if (!keys[0].isConnected) return;
      keys.forEach((b) => {
        b.disabled = false;
      });
      $('#cmsg').textContent = '';
    }, wait);
  }
}
// relock: the parents' area locked itself; a wrong PIN goes to the title screen
export function askPin(then: () => void, relock?: boolean) {
  if (!state.meta.pin) return then();
  screenCode({
    title: 'Elternbereich',
    text: 'Bitte die Eltern-PIN eingeben.',
    lock: true,
    relock,
    back: screenTitle,
    forgot: () => screenGate(then),
    onCode: (v, fail) => {
      if (pinHash(v) === state.meta.pin) {
        pinFails = 0;
        return then();
      }
      const locked = ++pinFails >= 3;
      if (locked) {
        pinFails = 0;
        pinLockUntil = Date.now() + 30000;
      }
      if (relock) return screenTitle();
      if (locked) askPin(then);
      else fail('Falsche PIN.');
    },
  });
}
// in the background the parents' area locks at once, so the app switcher doesn't show it either; the PIN leads back to the same place
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'hidden' || !state.meta.pin || !$('.ptabs')) return;
  const y = $('.scroll').scrollTop,
    back = pAt.back;
  askPin(() => {
    screenParent(null, back, true);
    $('.scroll').scrollTop = y;
  }, true);
});
export function setPin(done: () => void, back: () => void) {
  const first = (msg?: string) =>
    screenCode({
      title: 'PIN festlegen',
      text: 'Vier Ziffern für den Elternbereich wählen.',
      msg,
      back,
      onCode: (a) =>
        screenCode({
          title: 'PIN festlegen',
          text: 'Zur Kontrolle dieselbe PIN noch einmal eingeben.',
          back: () => first(),
          onCode: (b) => {
            if (a !== b) return first('Die beiden Eingaben waren verschieden. Bitte neu wählen.');
            state.meta.pin = pinHash(a);
            setupDone('done');
            done();
          },
        }),
    });
  first();
}
function screenGate(then: () => void, msg?: string) {
  const a = rnd(13, 29),
    b = rnd(13, 29);
  screenCode({
    title: 'PIN vergessen?',
    text: 'Zur Kontrolle eine Aufgabe für Erwachsene. Danach eine neue PIN wählen.',
    task: `${a} · ${b} = ?`,
    msg,
    back: screenTitle,
    onCode: (v) =>
      +v === a * b ? setPin(then, screenTitle) : screenGate(then, 'Das stimmt nicht. Hier ist eine neue Aufgabe.'),
  });
}

/* ---------- Changelog (CHANGELOG.md via tools/build.js) ---------- */
// one day of the changelog, as tools/build.js puts it into the page
interface NewsDay {
  date: string;
  groups: { title: string; items: string[] }[];
}
declare global {
  var CHANGELOG: NewsDay[] | undefined;
}
const NEWS = Array.isArray(globalThis.CHANGELOG) ? globalThis.CHANGELOG : [];
const hasNews = () => NEWS.length > 0 && NEWS[0].date > (state.meta.seenNews || '');
export const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];
const deDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
};
const GROUP_ICON: Record<string, string> = { Neu: '✨', Verbessert: '🔧', Behoben: '🐞' };
function screenNews() {
  state.depth = 1;
  const unseen = state.meta.seenNews || '';
  screen(
    html`<div class="screen">${raw(topbar('Was ist neu?'))}<div class="scroll"><div class="stack">${NEWS.length ? NEWS.map((e) => html`<div class="card news"><h3>${deDate(e.date)}${e.date > unseen ? html` <span class="pill new">Neu!</span>` : ''}</h3>${e.groups.map((g) => html`<h4>${GROUP_ICON[g.title] || '📌'} ${g.title}</h4><ul>${g.items.map((it) => html`<li>${it}</li>`)}</ul>`)}</div>`) : html`<p>Noch keine Einträge.</p>`}</div></div><div class="bottom"><button class="btn secondary" id="back" data-action="back">Zurück</button></div></div>`,
    { back: screenTitle },
  );
  if (NEWS.length) {
    state.meta.seenNews = NEWS[0].date;
    saveAll();
  }
}
