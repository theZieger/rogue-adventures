import { CURRICULUM, MODES, MODE_KEYS, SUBJECTS, type Subject } from '../curriculum.ts';
import { ELTERN } from '../eltern.ts';
import { LAENDER, fitOf, landName, whyHides, whyOff } from '../laender.ts';
import { MK } from '../knowledge.ts';
import { MQ, type Tutorial } from '../logic.ts';
import { QR } from '../qr.ts';
import { KEY_RUN_FOR, clear, defaultMeta } from '../save.ts';
import { TW } from '../turm.ts';
import { type Markup, html, raw } from '../ui/html.ts';
import { SITE, applySave, backupDue, packSave, qrCode, saveData, summaryHtml, unpackSave } from './backup.ts';
import { $, app } from './core.ts';
import { weekReport } from './duell.ts';
import { screenFeedback } from './feedback.ts';
import { type Attack, REWARDS, goalText } from './progress.ts';
import { state } from './state.ts';
import {
  canBorrow,
  chooseGrade,
  EXTRAS,
  curGrade,
  enOff,
  extraOn,
  fightMods,
  gradeTabs,
  grades,
  heroShown,
  land,
  landHides,
  landOff,
  loadRun,
  offList,
  saveAll,
  setOn,
  shown,
  subjectLabel,
} from './storage.ts';
import { TTS, chosenVoice, enVoice, enVoices, speak, voice, voiceGuide, voices } from './tasks.ts';
import { MONTHS, goalCount, screenLand, screenTitle, setPin } from './title.ts';
import { SFX, modal, on, screen, topbar } from './ui.ts';

// svg, not emoji: the parent area looks the same on every device
const ICO = {
  chart: '<path d="M4 20V11M10 20V4M16 20v-6M22 20H2"/>',
  book: '<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h12M9 8h6"/>',
  sliders: '<path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="3"/><circle cx="8" cy="17" r="3"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  warn: '<path d="M12 3l10 18H2zM12 10v5M12 18v.5"/>',
};
const ico = (n: keyof typeof ICO) => raw(`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICO[n]}</svg>`);
// each tab: title, icon and its sub-tabs
const P_TABS: Record<string, [title: string, icon: keyof typeof ICO, subs: Record<string, string>]> = {
  overview: ['Überblick', 'chart', { week: 'Diese Woche', all: 'Insgesamt' }],
  practice: ['Inhalte', 'book', { subjects: 'Fächer', how: 'So lernt Ihr Kind' }],
  settings: ['Einstellungen', 'sliders', { save: 'Spielstand', app: 'App', show: 'Anzeigen', reset: 'Löschen' }],
};
const P_JUMPS: Record<string, [tab: string, sub: string]> = {
  load: ['settings', 'save'],
  save: ['settings', 'save'],
  appsec: ['settings', 'app'],
};
// where the parents are: the tab, the open sub-tab of each tab, the open subject (-1: the list) and its unit
interface ParentPlace {
  tab: string;
  sub: Record<string, string>;
  subj: number;
  mode: string;
  back?: () => void;
}
export let pAt: ParentPlace;
// ELTERN.INFO and ELTERN.PLAN are looked up by the unit and task type on screen
type Texts<T> = Record<string, T>;
const tutOf = (m: string, k: string, tier: number) => {
  const c = MODES[m];
  return c.numTut ? c.numTut[k][tier] : c.tut ? c.tut[k + ':' + tier] : MQ.TUT[k][tier];
};
// title, yes and a body given as a string are markup already
export function confirmBox(title: string, body: string | Markup, yes: string, fn: () => void, danger?: boolean) {
  const ov = modal(
    html`<h2>${raw(title)}</h2>${typeof body === 'string' ? raw(body) : body}<div class="stack"><button class="btn${danger ? ' danger' : ''}" id="yes" data-action="yes">${raw(yes)}</button><button class="btn secondary" id="no" data-action="no">Abbrechen</button></div>`,
    {
      no: () => ov.remove(),
      yes: () => {
        ov.remove();
        fn();
      },
    },
  );
  $('#no', ov).focus({ preventScroll: true });
}
// quiet: redrawn in place after a switch or a tab, without the screen animation
export function screenParent(jump?: string | null, back?: () => void, quiet?: boolean) {
  back = typeof back === 'function' ? back : screenTitle;
  if (!quiet) pAt = { tab: 'overview', sub: {}, subj: -1, mode: '' };
  if (P_JUMPS[jump!]) {
    pAt.tab = P_JUMPS[jump!][0];
    pAt.sub[pAt.tab] = P_JUMPS[jump!][1];
  }
  pAt.back = back;
  const tab = pAt.tab;
  const subs = P_TABS[tab][2];
  const sub = subs[pAt.sub[tab]] ? pAt.sub[tab] : Object.keys(subs)[0];
  state.depth = sub === 'subjects' && curGrade().subjects[pAt.subj] ? 2 : 1;
  const redraw = (focus?: string) => {
    screenParent(null, back, true);
    const el = focus && $(focus);
    if (el) el.focus({ preventScroll: true });
  };
  const switches = () => [...app.querySelectorAll<HTMLElement>('[role=switch]')];
  const again = () => {
    const y = $('.scroll').scrollTop;
    const i = switches().indexOf(document.activeElement as HTMLElement);
    redraw();
    $('.scroll').scrollTop = y;
    if (i >= 0 && switches()[i]) switches()[i].focus({ preventScroll: true });
  };
  const card = (h: string | Markup, body: unknown, cls?: string) =>
    html`<div class="card pcard${cls ? ' ' + cls : ''}">${h ? html`<h3>${h}</h3>` : ''}${body}</div>`;
  const note = (t: string | Markup) => html`<p class="pnote">${t}</p>`;
  const msg = raw('<p class="tmsg" role="status"></p>');
  const speakSettings = () => {
    const vs = voices(),
      cur = chosenVoice(),
      es = enVoices(),
      ce = enVoice();
    const tryBtn = (i: number, en = '') =>
      html`<button class="btn small secondary" data-try${en}="${i}" data-action="try${en}">Probe hören</button>`;
    if (!TTS) return note('Dieser Browser kann nicht vorlesen.');
    if (!vs.length) return [note('Auf diesem Gerät fehlt eine deutsche Stimme.'), raw(voiceGuide(true))];
    const pick = (list: SpeechSynthesisVoice[], c: SpeechSynthesisVoice | null | undefined, en: string) =>
      list.map(
        (v, i) =>
          html`<div class="pvrow"><button class="pvoice" aria-pressed="${String(v === c)}" data-voice${en}="${i}" data-action="voice${en}">${v.name}</button>${tryBtn(i, en)}</div>`,
      );
    return [
      vs.length > 1 ? html`<div class="pset"><b>Stimme</b>${pick(vs, cur, '')}</div>` : '',
      es.length > 1 ? html`<div class="pset"><b>Stimme für Englisch</b>${pick(es, ce, '-en')}</div>` : '',
      html`<div class="pset"><label for="prate"><b>Tempo</b></label><input type="range" id="prate" class="prate" min="0.6" max="1.4" step="0.05" value="${state.meta.speakRate}"><div class="prange" aria-hidden="true"><span>langsam</span><span>schnell</span></div>${vs.length > 1 ? '' : html`<div class="pvrow">${tryBtn(0)}</div>`}</div>`,
      es.length
        ? ''
        : note(
            'Für Englisch ist keine englische Stimme auf dem Gerät. Bis eine geladen ist, liest die deutsche Stimme die englischen Wörter. Wie das geht, steht unten.',
          ),
      raw(voiceGuide(false)),
    ];
  };
  // attr: the switch's own attributes, its action among them
  const sw = (on: boolean, attr: Markup, title: string | Markup, desc?: Markup) =>
    html`<div class="prow"><div class="ptext"><b>${title}</b>${desc}</div><button class="switch" role="switch" aria-checked="${String(!!on)}" aria-label="${raw(html`${title}`.text.replace(/<[^>]+>/g, ''))}" ${attr}><i></i></button></div>`;
  const stat = (n: string, v: string | number) =>
    html`<div class="statrow"><span class="n">${n}</span><span>${v}</span></div>`;
  const level = (c: number, t: number) =>
    c / t >= 0.8
      ? html`<span class="pill good">sicher</span>`
      : c / t >= 0.5
        ? html`<span class="pill warn">fast sicher</span>`
        : html`<span class="pill bad">übt noch</span>`;
  const srow = (icon: string, name: string, c: number, t: number, more?: string) =>
    html`<div class="srow"><div class="ptext"><b>${icon} ${name}</b><span>${c} von ${t} richtig${more}</span></div>${level(c, t)}</div>`;
  const LEGEND = note(
    html`<b>sicher:</b> mindestens 8 von 10 richtig · <b>fast sicher:</b> mindestens die Hälfte · <b>übt noch:</b> weniger als die Hälfte`,
  );
  const report = weekReport();
  const gameState = (m: string) => {
    if (!shown(m)) return 'ausgeblendet';
    const all = Object.keys(MODES[m].modules);
    const n = all.filter((k) => !offList(m).includes(k)).length;
    const S = MODES[m].starters;
    return `${n} von ${all.length} Aufgabenarten${S.length > 1 ? ` · ${S.filter((x: { id: string }) => heroShown(m, x)).length} von ${S.length} Helden` : ''}`;
  };

  const turmSubjCard = () => {
    const G = grades().filter((g) => g.grade !== 1),
      fixed = (g: number) => (state.meta.turm.subjects || {})[g] || [];
    return G.length
      ? card('Turmwacht: Fächer festlegen', [
          note(ELTERN.TURM.subjects),
          G.map((g) => [
            G.length > 1 ? html`<h4 class="psubhead">${g.label}</h4>` : '',
            g.subjects
              .filter((s) => s.modes.some(shown))
              .map((s) =>
                sw(
                  fixed(g.grade).includes(s.subject),
                  html`data-tsub="${g.grade}:${s.subject}" data-action="turmSubject"`,
                  html`${s.icon} ${subjectLabel(s.subject)}`,
                ),
              ),
          ]),
          msg,
        ])
      : '';
  };
  const landCard = () => {
    const L = land(),
      T = ELTERN.LAND,
      all = !!L && MODE_KEYS.every((m) => fitOf(L, m) !== 'offen');
    return card('Bundesland', [
      L || state.meta.setup.land ? '' : html`<p class="callout">${T.invite}</p>`,
      html`<button class="pnav" id="pland" data-action="land"><span class="ptext"><b>${landName(L) || T.none}</b><span>${T.change}</span></span>${ico('next')}</button>`,
      note(!L || L === 'SN' ? T.base : T.claim(landName(L), all)),
      note(T.what),
      html`<button class="linkbtn" id="plandfb" data-action="landFeedback">${T.feedback}</button>`,
    ]);
  };
  // units of the next grade that may also be shown in this one
  const alsoCard = () => {
    const g = curGrade().grade,
      cand = MODE_KEYS.filter((m) => canBorrow(m, g));
    return cand.length
      ? card(`Themen aus Klasse ${g + 1} dazunehmen`, [
          note(ELTERN.LAND.also(g)),
          cand.map((m) =>
            sw(
              state.meta.forced.includes(`also:${g}:${m}`),
              html`data-also="${m}" data-action="also"`,
              html`${MODES[m].icon} ${MODES[m].title}`,
              html`<span>${subjectLabel(MODES[m].subject)}</span>`,
            ),
          ),
        ])
      : '';
  };
  const pages: Record<string, () => unknown> = {
    week() {
      const r = report;
      const sum = (f: 'c' | 't') => r.rows.reduce((a, x) => a + x[f], 0);
      const weak = r.rows
        .filter((x) => x.t >= 3 && x.c / x.t < 0.8)
        .sort((a, b) => a.c / a.t - b.c / b.t)
        .slice(0, 3);
      return [
        card(
          `Kalenderwoche ${r.wk}`,
          r.rows.length
            ? html`<p class="plead">${sum('t')} Aufgaben gelöst, ${sum('c')} davon richtig.</p>${note('Gezählt wird seit Montag.')}`
            : note('Diese Woche wurde noch nichts geübt.'),
        ),
        card(
          'Braucht noch Übung',
          weak.length
            ? weak.map((x) => srow(x.icon, x.label, x.c, x.t))
            : note(
                r.rows.some((x) => x.t >= 3)
                  ? 'Im Moment nichts. Alles, was diese Woche geübt wurde, klappt sicher.'
                  : 'Noch zu wenig geübt für eine Auswertung.',
              ),
        ),
        extraOn('wochenziele')
          ? card('Wochenziele', [
              note(
                `${r.done} von ${r.goals.length} erledigt. Für jedes Ziel gibt es 3 Stempel, für alle zusammen 10. Wer eine Woche aussetzt, verliert nichts.`,
              ),
              r.goals.map((g) => stat(goalText(g), `${Math.min(goalCount(g), g.n)} von ${g.n}`)),
            ])
          : '',
        r.rows.length
          ? card('Alles, was diese Woche geübt wurde', [LEGEND, r.rows.map((x) => srow(x.icon, x.label, x.c, x.t))])
          : '',
        card(
          'Wochenbericht als Text',
          html`${note('Zum Weitergeben, zum Beispiel an die Lehrerin oder den Lehrer. Es steht kein Name darin.')}<label for="wtext" class="sr-only">Wochenbericht</label><textarea id="wtext" class="codebox reporttext" rows="6" readonly>${r.text}</textarea><button class="btn small" id="wcopy" data-action="copyReport">Text kopieren</button><p id="wmsg" role="status" class="pnote"></p>`,
        ),
      ];
    },
    all() {
      const played = MODE_KEYS.filter((m) => Object.values(state.meta.stats[m]).some((x) => x.t > 0));
      const topics = played.map((m) => {
        const r = loadRun(m);
        return card(
          `${MODES[m].icon} ${MODES[m].title}`,
          Object.keys(MODES[m].modules)
            .filter((k) => state.meta.stats[m][k].t > 0)
            .map((k) => {
              const s = state.meta.stats[m][k];
              return srow(
                MODES[m].modules[k].icon,
                MODES[m].modules[k].name,
                s.c,
                s.t,
                r ? ` · Stufe ${r.tiers[k] || 1}` : '',
              );
            }),
        );
      });
      const weakFacts = Object.entries(state.meta.know)
        .filter(([id, k]) => k.t >= 2 && k.c / k.t < 0.7)
        .map(([id, k]) => {
          const q = Object.values(MK.MODES)
            .flatMap((c) => c.pool!)
            .find((p) => p.id === id.replace('_find', ''));
          return q ? stat(q.q, `${k.c} von ${k.t}`) : '';
        })
        .filter(Boolean);
      return [
        card(
          'Seit dem ersten Tag',
          html`${stat('Abenteuer begonnen', state.meta.runs)}${stat('Bis zum Ende geschafft', state.meta.wins)}${stat('Stempel verdient insgesamt', state.meta.stampsTotal)}${stat('Davon noch übrig', state.meta.stamps)}${note('Alle Fächer zusammen. „Geschafft“ heißt: Der Endgegner der letzten Welt ist besiegt.')}`,
        ),
        state.meta.turm.runs || state.meta.turm.on
          ? card(
              '🏰 Turmwacht',
              html`${stat('Begonnen', state.meta.turm.runs)}${stat('Bis zum Ende geschafft', state.meta.turm.wins)}${stat('Rekord', state.meta.turm.best ? `Welle ${state.meta.turm.best} von ${TW.WAVES.length}` : '–')}${
                Object.values(state.meta.turm.last).some((v) => v.t)
                  ? html`<p class="plead">Letzte Turmwacht</p>${Object.entries(state.meta.turm.last)
                      .filter(([, v]) => v.t)
                      .map(([s, v]) => srow(SUBJECTS[s as Subject], subjectLabel(s), v.c, v.t))}`
                  : ''
              }${note(ELTERN.TURM.counts)}`,
            )
          : '',
        card(
          'Trefferquote je Thema',
          topics.length
            ? html`${note('Hier stehen nur Themen und Aufgabenarten, die schon geübt wurden. „Stufe“ zeigt, wie schwer die Aufgaben im laufenden Abenteuer gerade sind.')}${LEGEND}`
            : note('Noch nichts geübt.'),
        ),
        topics,
        card(
          'Wissensfragen mit Schwierigkeiten',
          weakFacts.length
            ? html`${note('Diese Fragen waren öfter falsch. Lernquest stellt sie bald wieder.')}${weakFacts}`
            : note('Noch keine – oder noch nicht genug geübt.'),
        ),
      ];
    },
    subjects() {
      const S = curGrade().subjects;
      if (!S[pAt.subj])
        return [
          card(
            '',
            html`<p class="plead">Lernquest merkt, was Ihr Kind schon kann, und stellt passende Aufgaben: nicht zu leicht und nicht zu schwer.</p><button class="linkbtn" data-ps="how" data-action="subtab">So lernt Ihr Kind mit Lernquest</button>`,
          ),
          grades().length > 1 ? card('Klasse', raw(gradeTabs())) : '',
          landCard(),
          card(
            'Was soll geübt werden?',
            html`${note('Tippen Sie auf ein Fach. Dort sehen Sie, was jede Aufgabenart übt, und können Themen, Helden und Aufgabenarten ein- oder ausschalten.')}${S.map(
              (s, i) => {
                const vis = s.modes.filter(shown).length;
                return html`<button class="pnav" data-pf="${i}" data-action="subject"><span class="ptext"><b>${s.icon} ${subjectLabel(s.subject)}</b><span>${!vis ? 'ausgeblendet' : s.modes.length === 1 ? gameState(s.modes[0]) : `${vis} von ${s.modes.length} Themen`}</span></span>${ico('next')}</button>`;
              },
            )}`,
          ),
          alsoCard(),
        ];
      const s = S[pAt.subj];
      const m = s.modes.includes(pAt.mode) ? pAt.mode : s.modes[0];
      const c = MODES[m];
      const keys = Object.keys(c.modules);
      const plan = (ELTERN.PLAN as Texts<string>)[m];
      const L = land(),
        fit = fitOf(L, m),
        T = ELTERN.LAND;
      // what parents should know about this subject in their Bundesland
      const subjNotes = [
        L && s.subject === 'Englisch' && LAENDER[L].french ? html`<p class="callout">${T.french}</p>` : '',
        L && subjectLabel(s.subject) === 'Miteinander' ? note(T.noSubject(landName(L))) : '',
      ];
      return [
        html`<button class="pback" id="pback" data-action="subjects">${ico('back')}Alle Fächer</button>`,
        s.modes.length > 1
          ? [
              card(`${s.icon} ${subjectLabel(s.subject, true)}`, [
                subjNotes,
                sw(
                  s.modes.some(shown),
                  html`data-hidesub="${pAt.subj}" data-action="hideSubject"`,
                  'Fach anzeigen',
                  html`<span>Ausgeschaltet erscheint das ganze Fach nicht mehr auf der Startseite.</span>`,
                ),
                msg,
              ]),
              s.subject === 'Englisch'
                ? card(
                    'Themen aus dem Unterricht',
                    html`${note('Ausgeschaltete Themen kommen in beiden Englisch-Themen nicht mehr vor, auch nicht in Sätzen. Sätze ohne Themenwort bleiben immer an. Mindestens ein Thema bleibt an.')}${Object.keys(
                      MK.EN_THEMES,
                    ).map((t) =>
                      sw(
                        !state.meta.hidden.includes('en:' + t),
                        html`data-hide="en:${t}" data-action="hide"`,
                        t,
                        html`<span>${MK.EN_THEMES[t]
                          .slice(0, 4)
                          .map((x) => x[0])
                          .join(', ')} …</span>`,
                      ),
                    )}${msg}`,
                  )
                : '',
              html`<div class="pchips" role="tablist" aria-label="Themen">${s.modes.map((x) => html`<button role="tab" data-pm="${x}" data-action="mode" aria-selected="${String(x === m)}" class="chip${shown(x) ? '' : ' off'}">${MODES[x].icon} ${MODES[x].title}</button>`)}</div>`,
            ]
          : '',
        card(
          `${c.icon} ${c.title}`,
          html`<p>${c.sub}</p>${s.modes.length > 1 ? '' : subjNotes}${
            !L
              ? html`<p class="pplan"><b>Grundlage (Lehrplan Sachsen):</b> ${plan}</p>`
              : L === 'SN' && fit === 'passt'
                ? html`<p class="pplan"><b>Lehrplan Sachsen:</b> ${plan}</p>`
                : html`<p class="pplan"><b>Lehrplan ${landName(L)}:</b> ${T.fit[fit]}</p><p class="pplan"><b>Grundlage (Lehrplan Sachsen):</b> ${plan}</p>`
          }${L && c.subject === 'Deutsch' && LAENDER[L].wordlist ? html`<p class="pplan">${T.wordlist(landName(L))}</p>` : ''}${landHides(m) ? html`<p class="callout">${T.hidden[whyHides(m)](landName(L))}</p>` : ''}${sw(shown(m), html`data-hide="mode:${m}" data-action="hide"`, 'Thema anzeigen', html`<span>Ausgeschaltet erscheint das Thema nicht mehr. Ein laufendes Abenteuer bleibt gespeichert.</span>`)}${msg}`,
        ),
        c.starters.length > 1
          ? card(
              'Helden',
              html`${note('Jeder Held bringt eigene Aufgabenarten mit. Ausgeschaltete Helden stehen nicht mehr zur Wahl.')}${c.starters.map((x) => sw(heroShown(m, x), html`data-hide="hero:${m}:${x.id}" data-action="hide"`, x.names[0], html`<span>${[...new Set(x.attacks.map((a: Attack) => c.modules[a.mod].name))].join(', ')}</span>`))}${msg}`,
            )
          : '',
        card(
          'Aufgabenarten',
          html`${note(`${keys.filter((k) => !offList(m).includes(k)).length} von ${keys.length} sind an. Ausgeschaltete Aufgabenarten kommen nicht mehr vor. Mindestens zwei bleiben an, weil ein Kampf zwei Attacken braucht. Soll das Thema gar nicht vorkommen, schalten Sie oben „Thema anzeigen“ aus.`)}${keys.map((k) => sw(!offList(m).includes(k), html`data-m="${m}" data-k="${k}" data-action="module"`, html`${c.modules[k].icon} ${c.modules[k].name}`, html`<span>${(ELTERN.INFO as Texts<Texts<string>>)[m][k]}</span>${landOff(m, k) ? html`<span>${T.off[whyOff(m, k)](landName(L))}</span>` : ''}<button class="linkbtn" data-info="${k}" data-action="info">Beispiel ansehen</button>`))}${msg}`,
        ),
      ];
    },
    how: () => [
      card(
        'Lernquest passt sich an',
        html`<p>Lernquest merkt, was Ihr Kind schon kann. Läuft es gut, werden die Aufgaben schwerer. Hakt es, werden sie leichter. So bleibt das Üben weder langweilig noch zu schwer.</p><p>Es gibt keine Uhr und keinen Zeitdruck.</p>`,
      ),
      card(
        'Was ist eine Stufe?',
        html`<p>Jede Aufgabenart hat Stufen, von leicht nach schwer.</p><p>Beispiel Addition: Auf Stufe 1 steht 23 + 45, auf Stufe 3 steht 234 + 152.</p><p>Lernquest merkt sich die Stufe. Ein neues Abenteuer beginnt zum Aufwärmen eine Stufe tiefer.</p><p>${ELTERN.TURM.level}</p>`,
      ),
      card(
        'Wann wird es schwerer?',
        html`<p>Lernquest schaut bei jeder Aufgabenart auf die letzten Aufgaben.</p><ul class="plist"><li><b>5 von 6 richtig:</b> eine Stufe höher.</li><li><b>2 von 3 falsch:</b> eine Stufe zurück.</li></ul><p>Danach zählt Lernquest von vorn. Etwa jede vierte Aufgabe kommt von der Stufe darunter. Löst Ihr Kind in einem Abenteuer weniger als zwei Drittel richtig, trifft der Gegner nach einem Fehler nicht so hart.</p>`,
      ),
      card(
        'Was ist eine Welt?',
        html`<p>Ein Abenteuer führt durch eine bis drei Welten. In jeder neuen Welt kommen höhere Stufen und neue Aufgabenarten dazu.</p><p>Beispiel Zahlenquest: In Welt 1 bleiben alle Zahlen unter 100. Das schriftliche Rechnen beginnt erst in Welt 3.</p>`,
      ),
      card(
        'Was passiert bei einem Fehler?',
        html`<p>Ihr Kind sieht sofort die richtige Lösung. Niemand schimpft, es geht einfach weiter.</p><p>Wissensfragen, die falsch waren, kommen bald wieder, bis sie sitzen.</p>`,
      ),
      card(
        'Wie lernt mein Kind eine neue Aufgabenart?',
        html`<p>Beim ersten Mal erklärt Lernquest die Aufgabenart in drei bis vier kurzen Schritten mit einem Beispiel.</p><p>Dieselben Erklärungen finden Sie unter „Fächer“ bei jeder Aufgabenart: „Beispiel ansehen“.</p>`,
      ),
    ],
    save: () => [
      backupDue()
        ? html`<div class="card warncard pwarn" id="pwarn">${ico('warn')}<p>Der Spielstand wurde ${state.meta.backupAt ? 'seit über 30 Tagen' : 'noch nie'} gesichert.</p></div>`
        : '',
      card(
        'Spielstand sichern',
        html`${note('Die Datei und der Code enthalten den ganzen Spielstand. Damit lässt er sich auf einem anderen Gerät laden oder später zurückholen.')}<button class="btn small" id="pexport" data-action="export">Spielstand sichern</button><div id="pout"></div>`,
      ),
      html`<div id="p-load">${card('Spielstand laden', html`<input type="file" id="pfilein" class="sr-only" accept="text/plain,.txt"><label for="pfilein" class="btn small">Datei auswählen</label>${note('Die Datei „Lernquest-Spielstand-….txt“ aus „Dateien“, „Downloads“ oder einer Nachricht wählen.')}<label for="pcodein" class="pnote">Oder Code einfügen</label><textarea id="pcodein" class="codebox" rows="4" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea><p id="pimsg" role="status" class="cmsg"></p><div class="row"><button class="btn small" id="pmerge" data-action="merge">Zusammenlegen</button><button class="btn small secondary" id="preplace" data-action="replace">Ersetzen</button></div>${note(html`<b>Zusammenlegen</b> behält alles auf diesem Gerät und nimmt dazu, was im Code mehr ist. <b>Ersetzen</b> überschreibt alles auf diesem Gerät. Vor beidem fragt Lernquest noch einmal nach.`)}`)}</div>`,
      card(
        'Speicher',
        note(
          state.meta.storage.persisted
            ? 'Dieser Browser hebt den Spielstand dauerhaft auf.'
            : 'Dieser Browser darf den Spielstand löschen, wenn der Speicher knapp wird. Safari löscht ihn nach 7 Tagen ohne Besuch. Als App auf dem Startbildschirm ist er sicherer.',
        ),
      ),
    ],
    app: () => [
      card(
        'Töne',
        sw(
          state.meta.sound,
          html`id="psound" data-action="sound"`,
          'Töne an',
          html`<span>Klick, Treffer, Fanfare und Applaus. Alle Klänge sind gemeinfrei (CC0).</span>`,
        ),
      ),
      card('Vorlesen', [
        sw(
          state.meta.speak,
          html`id="pspeak" data-action="speak"`,
          'Aufgaben vorlesen',
          html`<span>Ein Knopf bei jeder Aufgabe liest Frage und Antworten vor, in Klasse 1 und 2 von selbst. Es spricht nur eine Stimme, die auf Ihrem Gerät gespeichert ist, ohne Internet.</span>`,
        ),
        state.meta.speak ? speakSettings() : '',
      ]),
      card(
        'Eltern-PIN',
        state.meta.pin
          ? html`${note('Die PIN schützt den Elternbereich.')}<div class="row"><button class="btn small secondary" id="pchange" data-action="pin">PIN ändern</button><button class="btn small secondary" id="pdel" data-action="pinRemove">PIN entfernen</button></div>`
          : html`${note('Noch keine PIN festgelegt. Ohne PIN kann jeder hier alles ändern.')}<button class="btn small" id="pset" data-action="pin">PIN festlegen</button>`,
      ),
      card(
        'Erklärungen',
        html`${note('Jede Aufgabenart erklärt sich beim ersten Mal selbst. Hier können Sie alle Erklärungen noch einmal zeigen lassen.')}<button class="btn small secondary" id="rtut" data-action="tutorials">Erklärungen wieder zeigen</button>${msg}`,
      ),
      card(
        'Idee oder Fehler',
        html`${note('Schicken Sie uns Wünsche, Fehler oder Lob.')}<button class="btn small secondary" id="pfeedback" data-action="feedback">Idee oder Fehler melden</button>`,
      ),
      html`<p class="center muted">Lernquest, Version ${(document.querySelector<HTMLMetaElement>('meta[name=app-version]') || ({} as { content?: string })).content || '?'}</p>`,
    ],
    show: () => [
      card(
        'Klassen',
        html`${note('Ausgeschaltete Klassen verschwinden von der Startseite. Mindestens eine bleibt an.')}${CURRICULUM.map((g) => sw(grades().includes(g), html`data-hide="grade:${g.grade}" data-action="hide"`, g.label, html`<span>${g.subjects.map((x) => subjectLabel(x.subject)).join(', ')}</span>`))}${msg}`,
      ),
      card(
        'Extras',
        html`${note('Ausgeschaltete Extras verschwinden von der Startseite und kommen in neuen Abenteuern nicht mehr vor. Was Ihr Kind dort schon gesammelt hat, bleibt gespeichert.')}${Object.entries(
          EXTRAS,
        ).map(([k, [t, d]]) =>
          sw(extraOn(k), html`data-hide="extra:${k}" data-action="hide"`, t, html`<span>${d}</span>`),
        )}`,
      ),
      card(html`🏰 Turmwacht <span class="pill">zum Ausprobieren</span>`, [
        sw(
          state.meta.turm.on,
          html`data-turmon data-action="turm"`,
          'Turmwacht anzeigen',
          html`<span>${ELTERN.TURM.what}</span>`,
        ),
        note(ELTERN.TURM.beta),
      ]),
      state.meta.turm.on ? turmSubjCard() : '',
    ],
    reset: () => [
      card(
        '',
        html`<p class="plead">Hier wird gelöscht. Vor jedem Löschen fragt Lernquest noch einmal nach.</p>${note('Tipp: Sichern Sie vorher den Spielstand unter „Spielstand“.')}`,
      ),
      card(
        'Statistik zurücksetzen',
        html`${note('Löscht nur die Zahlen unter „Überblick“. Stempel, Monsterbuch und laufende Abenteuer bleiben.')}<button class="btn small secondary" id="rstats" data-action="resetStats">Statistik zurücksetzen</button>`,
      ),
      card(
        'Alles löschen',
        html`${note('Setzt Lernquest ganz auf Anfang: Abenteuer, Stempel, Monsterbuch, Statistik und Einstellungen.')}<button class="btn small danger" id="rall" data-action="resetAll">Alles löschen</button>`,
      ),
    ],
  };
  const say = (b: HTMLElement, t: string) => {
    b.closest<HTMLElement>('.card')!.querySelector<HTMLElement>('.tmsg')!.textContent = t;
  };
  const newPin = () =>
    setPin(
      () => screenParent('appsec', back),
      () => screenParent('appsec', back),
    );
  const sample = (v: SpeechSynthesisVoice | null | undefined) => speak('Hallo! So klingt diese Stimme.', v);
  const sampleEn = 'Hello! This is how I sound.';
  const copy = (text: string, box: string, out: string) => {
    const tell = (t: string) => {
      $(out).textContent = t;
    };
    const mark = () => {
      $(box).focus();
      $<HTMLTextAreaElement>(box).select();
      tell('Der Text ist markiert. Bitte jetzt kopieren.');
    };
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(text).then(() => tell('Kopiert.'), mark);
    else mark();
  };
  const readCode = async (how: 'merge' | 'replace') => {
    let s;
    try {
      s = await unpackSave($<HTMLTextAreaElement>('#pcodein').value);
    } catch (e) {
      $('#pimsg').classList.remove('ok');
      $('#pimsg').textContent = (e as Error).message;
      return;
    }
    if (how === 'merge')
      confirmBox(
        'Spielstände zusammenlegen?',
        html`${summaryHtml(s)}<p>Alles auf diesem Gerät bleibt. Dazu kommt, was in diesem Spielstand mehr ist.</p>`,
        'Ja, zusammenlegen',
        () => applySave(s, how),
      );
    else
      confirmBox(
        'Alles ersetzen?',
        html`${summaryHtml(s)}<p>Alles auf diesem Gerät wird durch diesen Spielstand ersetzt. Das kann man nicht rückgängig machen.</p>`,
        'Ja, ersetzen',
        () => applySave(s, how),
        true,
      );
  };
  const setHidden = (keys: string[], hide: boolean) => {
    state.meta.hidden = state.meta.hidden.filter((x) => !keys.includes(x)).concat(hide ? keys : []);
  };
  const noGameLeft = (keys: string[]) =>
    !curGrade().subjects.some((s) => s.modes.some((m) => shown(m) && !keys.includes('mode:' + m)));
  screen(
    html`<div class="screen">${raw(topbar('Elternbereich'))}<nav class="ptabs" role="tablist" aria-label="Bereiche">${Object.entries(
      P_TABS,
    ).map(
      ([id, [t, ic]]) =>
        html`<button role="tab" data-pt="${id}" data-action="tab" aria-selected="${String(id === tab)}">${ico(ic)}<span>${t}</span></button>`,
    )}</nav><div class="scroll"><div class="stack" id="p-${sub}">
      ${state.meta.pin || tab !== 'overview' ? '' : html`<div class="card warncard pwarn">${ico('warn')}<p><b>Noch keine PIN.</b> Ohne PIN kann jeder hier alles ändern.</p><button class="btn small" id="pnew" data-action="pin">PIN festlegen</button></div>`}
      ${
        tab === 'practice' && curGrade().subjects[pAt.subj]
          ? ''
          : html`<div class="psubtabs" role="tablist" aria-label="${P_TABS[tab][0]}">${Object.entries(subs).map(
              ([id, t]) =>
                html`<button role="tab" data-ps="${id}" data-action="subtab" aria-selected="${String(id === sub)}">${t}</button>`,
            )}</div>`
      }
      ${pages[sub]()}
      </div></div><div class="bottom"><button class="btn" id="back" data-action="back">Zurück zu Lernquest</button></div></div>`,
    {
      back: () => back(),
      tab: (b) => {
        pAt.tab = b.dataset.pt!;
        redraw('.ptabs [aria-selected=true]');
      },
      subtab: (b) => {
        pAt.sub[tab] = b.dataset.ps!;
        redraw('.psubtabs [aria-selected=true]');
      },
      subject: (b) => {
        pAt.subj = +b.dataset.pf!;
        pAt.mode = '';
        redraw('#pback');
      },
      subjects: () => {
        const i = pAt.subj;
        pAt.subj = -1;
        redraw(`[data-pf="${i}"]`);
      },
      mode: (b) => {
        const x = $('.pchips').scrollLeft;
        pAt.mode = b.dataset.pm!;
        redraw('.pchips [aria-selected=true]');
        $('.pchips').scrollLeft = x;
      },
      info: (b) => {
        const m = pAt.mode || curGrade().subjects[pAt.subj].modes[0];
        const k = b.dataset.info!;
        const M = MODES[m].modules[k];
        const tiers = Array.from({ length: M.maxTier }, (_, i): [number, Tutorial] => [
          i + 1,
          tutOf(m, k, i + 1),
        ]).filter((x) => x[1]);
        const ov = modal(
          html`<h2>${M.icon} ${M.name}</h2><p>${(ELTERN.INFO as Texts<Texts<string>>)[m][k]}</p><h3>So erklärt Lernquest es Ihrem Kind</h3>${tiers.length > 1 ? note('Die Stufen gehen von leicht nach schwer.') : ''}${tiers.map(([t, x]) => html`${tiers.length > 1 ? html`<h4>Stufe ${t}: ${x.title}</h4>` : ''}<ol>${x.steps.map((s: string) => html`<li>${s}</li>`)}</ol>`)}<button class="btn" id="ok" data-action="ok">Schließen</button>`,
          { ok: () => ov.remove() },
        );
        $('#ok', ov).focus({ preventScroll: true });
      },
      pin: newPin,
      pinRemove: () =>
        confirmBox(
          'PIN entfernen?',
          html`<p>Ohne PIN kann jeder den Elternbereich öffnen und alles ändern.</p>`,
          'Ja, PIN entfernen',
          () => {
            state.meta.pin = '';
            saveAll();
            again();
          },
          true,
        ),
      speak: () => {
        state.meta.speak = !state.meta.speak;
        saveAll();
        again();
      },
      try: (b) => sample(voices()[+b.dataset.try!]),
      voice: (b) => {
        const v = voices()[+b.dataset.voice!];
        if (!v) return;
        state.meta.voiceName = v.name;
        saveAll();
        again();
        sample(v);
      },
      'try-en': (b) => {
        const v = enVoices()[+b.dataset.tryEn!];
        speak(sampleEn, voice(), [sampleEn], v);
      },
      'voice-en': (b) => {
        const v = enVoices()[+b.dataset.voiceEn!];
        if (!v) return;
        state.meta.voiceEn = v.name;
        saveAll();
        again();
        speak(sampleEn, voice(), [sampleEn], v);
      },
      sound: () => {
        state.meta.sound = !state.meta.sound;
        saveAll();
        if (state.meta.sound) {
          SFX.unlock();
          setTimeout(SFX.right, 150);
        }
        again();
      },
      tutorials: (b) => {
        state.meta.seenTut = {};
        saveAll();
        say(b, 'Erledigt. Alle Erklärungen erscheinen beim nächsten Mal wieder.');
      },
      feedback: () => screenFeedback(() => screenParent('appsec', back)),
      resetStats: () =>
        confirmBox(
          'Statistik zurücksetzen?',
          html`<p>Alle Trefferquoten, die Zahl der Abenteuer und der Rekord der Turmwacht werden gelöscht. Stempel, Monsterbuch und laufende Abenteuer bleiben.</p><p>Das kann man nicht rückgängig machen.</p>`,
          'Ja, Statistik löschen',
          () => {
            state.meta.stats = defaultMeta().stats;
            state.meta.know = {};
            state.meta.runs = 0;
            state.meta.wins = 0;
            state.meta.turm = Object.assign(defaultMeta().turm, {
              subjects: state.meta.turm.subjects,
              on: state.meta.turm.on,
            });
            saveAll();
            again();
          },
          true,
        ),
      resetAll: () =>
        confirmBox(
          'Wirklich alles löschen?',
          html`<p>Alle Abenteuer, das Monsterbuch, die Statistik und die Einstellungen werden gelöscht.</p><p>Das kann man nicht rückgängig machen.</p>`,
          'Ja, alles löschen',
          () => {
            state.meta = defaultMeta();
            state.run = null;
            for (const m of MODE_KEYS.concat('turm')) clear(KEY_RUN_FOR(m));
            saveAll();
            screenTitle();
          },
          true,
        ),
      copyReport: () => copy(report.text, '#wtext', '#wmsg'),
      export: async () => {
        state.meta.backupAt = new Date().toISOString();
        saveAll();
        if ($('#pwarn')) $('#pwarn').remove();
        const full = saveData(false);
        const code = await packSave(full);
        const link = (c: string) => SITE + '#lade=' + c;
        let qr = QR.svg(link(qrCode(code)), 'QR-Code mit dem Spielstand'),
          short = false;
        if (!qr) {
          qr = QR.svg(link(qrCode(await packSave(saveData(true)))), 'QR-Code mit einer Kurzfassung des Spielstands');
          short = !!qr;
        }
        $('#pout').innerHTML =
          html`${summaryHtml(full)}<label for="pcode" class="pnote">Code</label><textarea id="pcode" class="codebox" rows="4" readonly>${code}</textarea><div class="row"><button class="btn small" id="pfile" data-action="saveFile">Als Datei sichern</button><button class="btn small secondary" id="pcopy" data-action="copyCode">Kopieren</button>${(navigator as Partial<Navigator>).share ? html`<button class="btn small secondary" id="pshare" data-action="shareCode">Teilen</button>` : ''}</div><p id="pcmsg" role="status" class="pnote"></p>
        ${qr ? html`<div class="qrbox">${raw(qr)}</div>${note((short ? 'Der QR-Code enthält eine Kurzfassung ohne laufende Abenteuer. Den ganzen Spielstand gibt es als Datei oder Code. ' : '') + 'Mit der Kamera des anderen Geräts den QR-Code öffnen, dann fragt Lernquest nach. Ist Lernquest dort als App installiert, den Code lieber in der App einfügen.')}` : note('Für einen QR-Code ist der Spielstand zu groß. Bitte die Datei oder den Code benutzen.')}`.text;
        // .txt: Android shares only known file types, the iPhone file picker greys out unknown ones; the link line is what unpackSave reads
        const d = new Date(full.at),
          day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const file = new File(
          [
            `Lernquest-Spielstand vom ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}\nIn Lernquest unter Eltern › Einstellungen › Spielstand „Datei auswählen“ tippen und diese Datei wählen.\n${link(code)}\n`,
          ],
          `Lernquest-Spielstand-${day}.txt`,
          { type: 'text/plain' },
        );
        const download = () => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(file);
          a.download = file.name;
          document.body.append(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 1e4);
          $('#pcmsg').textContent = 'Die Datei liegt im Download-Ordner.';
        };
        // share inside the tap itself: iOS refuses it after an await; the iPhone app has no downloads, so sharing comes first
        on({
          copyCode: () => copy(code, '#pcode', '#pcmsg'),
          saveFile: () =>
            navigator.canShare && navigator.canShare({ files: [file] })
              ? navigator.share({ files: [file], title: 'Lernquest-Spielstand' }).catch((e) => {
                  if (e.name !== 'AbortError') download();
                })
              : download(),
          shareCode: () => navigator.share({ title: 'Lernquest-Spielstand', text: link(code) }).catch(() => {}),
        });
      },
      merge: () => readCode('merge'),
      replace: () => readCode('replace'),
      module: (b) => {
        const m = b.dataset.m!,
          k = b.dataset.k!;
        const off = offList(m);
        if (!off.includes(k) && !MODES[m].modules[k].shop && fightMods(m).filter((x) => !off.includes(x)).length <= 2)
          return say(b, 'Mindestens zwei Aufgabenarten müssen an bleiben.');
        setOn(`mod:${m}:${k}`, off.includes(k));
        saveAll();
        again();
      },
      hide: (b) => {
        const key = b.dataset.hide!;
        const [kind, m, id] = key.split(':');
        const hide = kind === 'mode' ? shown(m) : !state.meta.hidden.includes(key);
        if (hide && kind === 'mode' && noGameLeft([key])) return say(b, 'Mindestens ein Thema muss sichtbar bleiben.');
        if (hide && kind === 'en' && Object.keys(MK.EN_THEMES).every((t) => t === m || enOff().includes(t)))
          return say(b, 'Mindestens ein Thema muss an bleiben.');
        if (hide && kind === 'grade' && grades().length < 2)
          return say(b, 'Mindestens eine Klasse muss sichtbar bleiben.');
        // a hero that is a reward does not count: it may still be locked
        if (
          hide &&
          kind === 'hero' &&
          !REWARDS.some((r) => r.hero === id) &&
          !MODES[m].starters.some((x) => x.id !== id && heroShown(m, x) && !REWARDS.some((r) => r.hero === x.id))
        )
          return say(b, 'Mindestens ein Held muss bleiben.');
        if (kind === 'mode') setOn(key, !hide);
        else setHidden([key], hide);
        state.meta.grade = curGrade().grade;
        saveAll();
        again();
      },
      also: (b) => {
        const token = `also:${curGrade().grade}:${b.dataset.also}`,
          on = state.meta.forced.includes(token);
        state.meta.forced = state.meta.forced.filter((x) => x !== token).concat(on ? [] : token);
        saveAll();
        again();
      },
      land: () => screenLand(() => screenParent(null, back, true)),
      landFeedback: () => screenFeedback(() => screenParent(null, back, true)),
      turm: () => {
        state.meta.turm.on = !state.meta.turm.on;
        saveAll();
        again();
      },
      turmSubject: (b) => {
        const [g, s] = b.dataset.tsub!.split(':') as [string, Subject],
          all: Record<string, Subject[]> = Object.assign({}, state.meta.turm.subjects),
          cur = all[g] || [];
        if (!cur.includes(s) && cur.length >= 3) return say(b, 'Höchstens drei Fächer.');
        all[g] = cur.includes(s) ? cur.filter((x) => x !== s) : cur.concat(s);
        if (!all[g].length) delete all[g];
        state.meta.turm.subjects = Object.keys(all).length ? all : null;
        saveAll();
        again();
      },
      hideSubject: (b) => {
        const modes = curGrade().subjects[+b.dataset.hidesub!].modes;
        const keys = modes.map((m) => 'mode:' + m);
        const hide = modes.some(shown);
        if (hide && noGameLeft(keys)) return say(b, 'Mindestens ein Fach muss sichtbar bleiben.');
        if (hide) for (const m of modes.filter(shown)) setOn('mode:' + m, false);
        else {
          setHidden(keys, false);
          // what is still hidden is hidden by the Bundesland: the parents want the subject, so all of it
          if (!modes.some(shown)) for (const k of keys) setOn(k, true);
        }
        saveAll();
        again();
      },
    },
    quiet,
  );
  const rate = $<HTMLInputElement>('#prate');
  if (rate)
    rate.onchange = () => {
      state.meta.speakRate = +rate.value;
      saveAll();
      sample(chosenVoice());
    };
  if (TTS)
    TTS.onvoiceschanged = () => {
      if ($('#pspeak')) again();
    }; // some browsers deliver their voices late
  if ($('#pfilein'))
    $('#pfilein').onchange = async (e) => {
      const f = (e.target as HTMLInputElement).files![0];
      if (!f) return;
      const msg = $('#pimsg');
      msg.classList.remove('ok');
      try {
        if (f.size > 5e6) throw 0;
        const text = await f.text();
        await unpackSave(text);
        $<HTMLTextAreaElement>('#pcodein').value = text;
        msg.textContent = 'Datei gelesen. Jetzt „Zusammenlegen“ oder „Ersetzen“ wählen.';
        msg.classList.add('ok');
      } catch (err) {
        msg.textContent = 'Das ist keine Lernquest-Datei. Bitte die Datei „Lernquest-Spielstand-….txt“ wählen.';
      }
      (e.target as HTMLInputElement).value = '';
    };
  if (jump === 'load') {
    const el = $('#p-load');
    const sc = $('.scroll');
    sc.scrollTop = el.offsetTop - sc.offsetTop - 8;
    $('#pcodein').focus({ preventScroll: true });
  }
  on({ grade: (chip) => chooseGrade(chip, again) });
}
