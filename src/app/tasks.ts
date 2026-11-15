import { MK } from '../knowledge.ts';
import { MQ } from '../logic.ts';
import { MS } from '../sachkunde.ts';
import { READ_MOD } from './battle.ts';
import { $, CFG, MODULES_OF, app, arrow, esc, euro, reducedMotion } from './core.ts';
import { state } from './state.ts';
import { SFX, showTutorial } from './ui.ts';

/* ---------- Task UI ---------- */
const PLACES = ['Einer', 'Zehner', 'Hunderter', 'Tausender'];
function colHtml(c, text) {
  const place = (i) => PLACES[c.w - 1 - i];
  const cells = (f) => Array.from({ length: c.w }, (_, i) => f(i)).join('');
  // multiplication is written in one line (213 · 3) with the result under the first factor
  const mul = c.op === '·';
  const end = mul ? '<span></span>' : '';
  const rows = (mul ? c.rows.slice(0, 1) : c.rows)
    .map((n, r) => {
      const s = String(n).padStart(c.w, ' ');
      return `<span class="op">${r ? c.op : ''}</span>${cells((i) => `<span>${s[i].trim()}</span>`)}${mul ? `<span class="op">· ${c.rows[1]}</span>` : ''}`;
    })
    .join('');
  return `<div class="colcalc${mul ? ' mul' : ''}" style="--w:${c.w}" role="group" aria-label="${esc(text.replace(' = ?', ''))}">${rows}<span class="op"></span>${cells((i) => (i < c.w - 1 ? `<div class="inp carry" data-i="${c.w + i}" aria-label="Übertrag ${place(i)}"></div>` : '<span></span>'))}${end}<i class="colline"></i><span class="op"></span>${cells((i) => `<div class="inp dig" data-i="${i}" aria-label="${place(i)}"></div>`)}${end}</div><div class="prompt">Rechne von rechts nach links. Den Übertrag schreibst du in das kleine Feld.</div>`;
}
declare global {
  interface Window {
    __task: unknown; // the task on screen, read by the tests
  }
}
// where a task is drawn and what the screen around it wants from it
interface TaskOpts {
  container: HTMLElement;
  bottom: HTMLElement;
  subtitle?: string;
  hint?: boolean;
  cancel?: boolean;
  onResult?: (ok: boolean) => void;
}
// null: the task was cancelled
type TaskDone = (ok: boolean | null) => void;
export function runTask(task, opts: TaskOpts, done: TaskDone) {
  opts = opts || ({} as TaskOpts);
  window.__task = task;
  if (task.kind !== 'num') return runChoiceTask(task, opts, done);
  const mod = task.mod;
  const M = MODULES_OF()[mod] || MQ.MODULES[mod];
  const C = task.col;
  // written methods: one field per result digit (0 … w−1), then the carry fields (w + column)
  const nAns = C ? 2 * C.w - 1 : task.answers.length;
  const values: string[] = Array(nAns).fill('');
  let active = C ? C.w - 1 : 0;
  let locked = false;
  // entry follows the written method: Einer, carry into the Zehner, Zehner, carry into the Hunderter, …
  const order = C
    ? [C.w - 1].concat(...Array.from({ length: C.w - 1 }, (_, k) => [2 * C.w - 2 - k, C.w - 2 - k]))
    : null;
  const container = opts.container;
  const bottom = opts.bottom;
  const labelsFor = () => (task.nb ? [`${task.nb} davor`, `${task.nb} danach`] : task.seq ? ['', '', ''] : ['']);
  function cardHtml() {
    let body = '';
    if (task.fig)
      body = task.fig; // ready-made question with drawing (Jahrmarkt)
    else if (task.riddle)
      body = `<div class="clues">${task.text
        .split('\n')
        .map((c) => `<div>${esc(c)}</div>`)
        .join('')}</div><div class="prompt">Welche Zahl bin ich?</div>`;
    else if (task.seq)
      body = `<div class="seq">${task.seq.join(', ')}, …</div><div class="prompt">Wie gehen die nächsten drei weiter?</div>`;
    else if (task.nb) body = `<div class="prompt">Welche ${task.nb}zahl kommt davor, welche danach?</div>`;
    else if (task.grid) {
      const g = task.grid;
      let cells = '';
      for (let r = 0; r < g.size; r++)
        for (let c = 0; c < g.size; c++) {
          const isS = r === g.sr && c === g.sc,
            isT = r === g.tr && c === g.tc;
          cells += `<div class="${isS ? 'start' : ''}${isT ? ' target' : ''}">${isS ? g.base : isT ? '?' : ''}</div>`;
        }
      body = `<div class="grid">${cells}</div><div class="legend" data-step-r="${g.stepR}" data-step-d="${g.stepD}"><span>${arrow('r')} +${g.stepR}</span><span>${arrow('l')} −${g.stepR}</span><span>${arrow('d')} +${g.stepD}</span><span>${arrow('u')} −${g.stepD}</span></div><div class="prompt">Welche Zahl steht im Zielfeld?</div>`;
    } else if (C) body = colHtml(C, task.text);
    else if (task.word)
      body = `<div class="prompt">Schreibe die Zahl:</div><div class="numword">${esc(task.text).replace(/hundert|tausend/g, '$&<wbr>')}</div>`;
    else if (task.svg) body = `<div class="figure">${task.svg}</div><div class="prompt">${esc(task.ask)}</div>`;
    else if (task.story) body = `<p class="story">${esc(task.story)}</p>`;
    else if (task.ask)
      body = `<div class="expr${task.long ? ' long' : ''}">${esc(task.text)}</div><div class="prompt">${esc(task.ask)}</div>`;
    else body = `<div class="expr">${esc(task.text)}</div>`;
    let inputs = '';
    if (C) inputs = '';
    else if (task.nb)
      inputs = `<div class="nbline"><div class="inpgroup"><div class="inp" data-i="0"></div><span>davor</span></div><div class="mid">${task.n}</div><div class="inpgroup"><div class="inp" data-i="1"></div><span>danach</span></div></div>`;
    else if (task.labels)
      inputs = `<div class="nbline">${task.labels.map((l, i) => `<div class="inpgroup"><div class="inp" data-i="${i}"></div><span>${esc(l)}</span></div>`).join('')}</div>`;
    else
      inputs = `<div class="inputs">${task.answers.map((_, i) => `<div class="inp" data-i="${i}"></div>`).join('')}</div>`;
    const a0 = task.answers[0];
    const lo = Math.max(0, a0 - 1 - Math.floor(Math.random() * 3));
    const hint = opts.hint
      ? `<div class="hintline">🌉 Tipp: ${task.answers.length > 1 ? 'Die erste Zahl' : 'Die Antwort'} liegt zwischen ${lo} und ${lo + 4}.</div>`
      : '';
    return `<div class="task"><div class="head">${M.icon} ${M.name}${opts.subtitle ? ` · ${esc(opts.subtitle)}` : ''}<button class="tut" type="button" aria-label="Erklärung anzeigen">🛈<span class="lbl"> Wie geht das?</span></button></div>${body}${hint}${inputs}<div id="fb" role="status" aria-live="polite"></div></div>`;
  }
  container.innerHTML = cardHtml();
  bottom.innerHTML = `<div class="numpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button data-k="${d}">${d}</button>`).join('')}<button class="del" data-k="del" aria-label="Löschen">⌫</button><button data-k="0">0</button><button class="ok" data-k="ok" aria-label="Antwort prüfen">✓</button>${opts.cancel ? `<button class="cancel" data-k="cancel" style="grid-column:1/-1">Abbrechen</button>` : ''}</div>`;
  const inps: HTMLElement[] = [];
  container.querySelectorAll<HTMLElement>('.inp').forEach((el) => {
    inps[+el.dataset.i!] = el;
  });
  function paint() {
    inps.forEach((el, i) => {
      el.textContent = values[i];
      el.classList.toggle('active', i === active && !locked);
    });
    const a = inps[active];
    if (a && a.scrollIntoView && !locked) a.scrollIntoView({ block: 'nearest' });
  }
  inps.forEach((el) => {
    el.onclick = () => {
      if (!locked) {
        active = +el.dataset.i!;
        paint();
      }
    };
  });
  $('.tut', container).onclick = () => showTutorial(task.group, task.note);
  readAloud(container, opts.bottom, task);
  paint();
  bottom.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('button');
    if (!b || locked || !bottom.contains(b) || !b.dataset.k) return;
    press(b.dataset.k);
  };
  state.keyHandler = (e) => {
    if (locked) return;
    let k: string | null = null;
    if (/^[0-9]$/.test(e.key)) k = e.key;
    else if (e.key === 'Backspace' || e.key === 'Delete') k = 'del';
    else if (e.key === 'Enter') k = 'ok';
    else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && C) {
      e.preventDefault();
      const p = order!.indexOf(active);
      active = order![(p + (e.key === 'ArrowLeft' ? 1 : nAns - 1)) % nAns];
      paint();
      return;
    } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && nAns > 1) {
      e.preventDefault();
      active = (active + (e.key === 'ArrowLeft' ? nAns - 1 : 1)) % nAns;
      paint();
      return;
    }
    if (!k) return;
    e.preventDefault();
    press(k);
  };
  function press(k: string) {
    if (k === 'cancel') {
      done(null);
      return;
    }
    if (k === 'del') {
      values[active] = values[active].slice(0, -1);
    } else if (k === 'ok' && C) {
      // carries are optional; the result needs every digit from its first one to the Einer
      const dig = values.slice(0, C.w);
      const first = dig.findIndex((v) => v !== '');
      const gap = first < 0 ? C.w - 1 : dig.findIndex((v, i) => i > first && v === '');
      if (gap >= 0) {
        active = gap;
        paint();
        return;
      }
      submit();
      return;
    } else if (C) {
      values[active] = k;
      const p = order!.indexOf(active);
      if (p < nAns - 1) active = order![p + 1];
    } else if (k === 'ok') {
      if (values.some((v) => v === '')) {
        const idx = values.findIndex((v) => v === '');
        if (idx === active) return;
        active = idx;
        paint();
        return;
      }
      submit();
      return;
    } else {
      if (values[active].length < (task.maxLen || 3)) values[active] += k;
    }
    paint();
  }
  function submit() {
    locked = true;
    state.keyHandler = null;
    const want = C ? String(task.answers[0]).padStart(C.w, ' ') : '';
    const fieldOk = (v, i) =>
      !C
        ? parseInt(v, 10) === task.answers[i]
        : i < C.w
          ? v === want[i] || (want[i] === ' ' && (v === '' || v === '0'))
          : v === ''
            ? null
            : +v === C.carry[i - C.w];
    const ok = C
      ? parseInt(values.slice(0, C.w).join(''), 10) === task.answers[0]
      : values.every((v, i) => parseInt(v, 10) === task.answers[i]);
    if (opts.onResult) opts.onResult(ok); // game state changes now, so a reload can't undo the answer
    inps.forEach((el, i) => {
      el.classList.remove('active');
      const f = fieldOk(values[i], i);
      if (f !== null) el.classList.add(f ? 'ok' : 'bad');
    });
    const fb = $('#fb', container);
    if (ok) {
      fb.innerHTML = `<div class="feedback good pop">Richtig! ✔</div>`;
      SFX.right();
      sayResult(fb, true);
    } else {
      SFX.wrong();
      const corr =
        task.show ||
        (task.money
          ? euro(task.answers[0] * 100 + task.answers[1])
          : task.answers.join(task.nb ? ' und ' : task.rest ? ' Rest ' : ', '));
      fb.innerHTML = `<div class="feedback bad ${reducedMotion ? '' : 'shake'}">Daneben<small>Richtig wäre: ${corr}</small></div>`;
      sayResult(fb, false, 'Richtig wäre: ' + corr);
    }
    if (fb.scrollIntoView) fb.scrollIntoView({ block: 'nearest' });
    bottom.innerHTML = `<button class="btn" id="next">Weiter</button>`;
    $('#next').focus();
    $('#next').onclick = () => done(ok);
  }
}

/* ---------- Vorlesen ---------- */
// Only a voice that lives on the device: a network voice would send the task text away.
export const TTS = window.speechSynthesis;
if (TTS) TTS.getVoices(); // some browsers only start loading the list when first asked
const local = (lang) => (TTS ? TTS.getVoices().filter((v) => v.localService && lang.test(v.lang)) : []);
export const voices = () => local(/^de/i);
export const enVoices = () => local(/^en/i);
// a saved voice that is gone from the device quietly falls back to the first German one
export const chosenVoice = () => {
  const vs = voices();
  return vs.find((v) => v.name === state.meta.voiceName) || vs[0] || null;
};
export const enVoice = () => {
  const vs = enVoices();
  return (
    vs.find((v) => v.name === state.meta.voiceEn) ||
    vs.find((v) => /^en[-_]GB/i.test(v.lang)) ||
    vs.find((v) => /^en[-_]US/i.test(v.lang)) ||
    vs[0] ||
    null
  );
};
export const voice = () => (state.meta.speak ? chosenVoice() : null);
const spoken = (t) =>
  t
    .replace(/\bLP\b/g, 'Lebenspunkte')
    .replace(/_{2,}/g, ' Lücke ')
    .replace(/−/g, ' minus ')
    .replace(/·/g, ' mal ')
    .replace(/=\s*\?/g, ' gleich wie viel')
    .replace(/\?(?=\s*[=+−·:])/g, ' wie viel ')
    .replace(/\p{Extended_Pictographic}\uFE0F?/gu, '');
// the task's English words and sentences (en) become pieces of their own: [text, true]; a gap is ___ in data, ____ on screen
const gap = (t: string) => t.replace(/_{2,}/g, '___');
function pieces(text: string, en: string[]) {
  const list = [...new Set(en.map(gap))]
    .sort((a, b) => b.length - a.length)
    .map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(?<![\\p{L}'’-])(${list.join('|')})(?![\\p{L}'’-])`, 'u'),
    words = en.map(gap),
    out: [text: string, isEn: boolean][] = [];
  const add = (t: string, isEn: boolean) => {
    const last = out[out.length - 1];
    if (last && last[1] === isEn) last[0] += t;
    else out.push([t, isEn]);
  };
  // a quoted German word stays German even if an English answer is part of it („der September“ with the option September)
  gap(text)
    .split(/(„[^“]*“)/)
    .forEach((seg, i) => {
      if (!list.length || (i % 2 && !words.includes(seg) && !words.includes(seg.slice(1, -1)))) add(seg, false);
      else seg.split(re).forEach((t, k) => add(t, k % 2 === 1));
    });
  return out.filter(([t]) => /[\p{L}\p{N}]/u.test(t));
}
// one utterance per piece; without an English voice the German one gets lang en-GB, which some engines follow
export function speak(text: string, v = voice(), en: string[] = [], ve = enVoice()) {
  if (!v) return;
  TTS.cancel();
  for (const [t, isEn] of pieces(text, en)) {
    const u = new SpeechSynthesisUtterance(isEn ? t.replace(/_{2,}/g, ' … ') : spoken(t));
    u.voice = (isEn && ve) || v;
    u.lang = isEn ? (ve ? ve.lang : 'en-GB') : v.lang;
    u.rate = state.meta.speakRate;
    TTS.speak(u);
  }
}
// a 🔊 button at anchor that reads text(); units for Klasse 1 and 2 read first() on their own (no anchor: no button).
// grade: Turmwacht passes its run's grade, the global mode there is just the unit that asked last
export function speakBtn(anchor, where, text, first = text, en: string[] = [], grade?) {
  if (!voice()) return;
  if (anchor) {
    const b = document.createElement('button');
    Object.assign(b, {
      type: 'button',
      className: 'speak',
      textContent: '🔊',
      onclick: () => speak(text(), voice(), en),
    });
    b.setAttribute('aria-label', 'Vorlesen');
    anchor.insertAdjacentElement(where, b);
  }
  if (first && (grade || CFG().grade) < 3) speak(first(), voice(), en);
}
export const joined = (...t) =>
  t
    .filter(Boolean)
    .join('. ')
    .replace(/([.?!:…“])\. /g, '$1 ');
export const plain = (html) => {
  const d = document.createElement('div');
  d.innerHTML = html.replace(/<br>/g, '. ');
  d.querySelectorAll<HTMLElement>('svg').forEach((s) => s.remove());
  return d.textContent;
};
let onScreen: Record<string, any> = {}; // the task on screen, for its feedback
const sayResult = (fb, ok, why?) =>
  speakBtn(
    !ok && $('.feedback', fb),
    'afterbegin',
    () => (ok ? 'Richtig' : onScreen.quiet ? 'Daneben' : 'Daneben. ' + why),
    undefined,
    onScreen.english || [],
  );
// how a fight ended: the headline and the line under it
export const sayCard = () =>
  speakBtn($('.card'), 'afterbegin', () =>
    joined(...[...app.querySelectorAll<HTMLElement>('.card h2, .card h2 + p')].slice(0, 2).map((e) => e.textContent)),
  );
// setup help for the parents, only for their system; iPadOS reports itself as a Mac with touch
export function voiceGuide(open) {
  const ua = navigator.userAgent;
  const [steps, hint] = /Android/.test(ua)
    ? [
        [
          'Die Einstellungen öffnen, dann System → Sprachen und Eingabe → Sprachausgabe (oder „Text-in-Sprache“).',
          'Als bevorzugtes Modul zum Beispiel „Sprachausgabe von Google“ wählen und als Sprache Deutsch.',
          'Unter „Stimmdaten installieren“ Deutsch laden, für Englisch zusätzlich Englisch.',
          'Die Lautstärke prüfen und Lernquest neu öffnen.',
        ],
        'Die Namen der Menüs unterscheiden sich je nach Hersteller.',
      ]
    : /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
      ? [
          [
            'Die Einstellungen öffnen, dann Bedienungshilfen → Gesprochene Inhalte → Stimmen.',
            'Deutsch antippen und eine Stimme laden. Für Englisch genauso unter Englisch.',
            'Den Lautlos-Schalter ausschalten und die Lautstärke prüfen.',
            'Lernquest neu öffnen.',
          ],
          'Je nach Version heißen die Menüs etwas anders.',
        ]
      : [null, ''];
  return `<details class="pguide"${open ? ' open' : ''}><summary>So klappt das Vorlesen</summary>${steps ? `<ol>${steps.map((x) => `<li>${x}</li>`).join('')}</ol>` : '<p>In den Systemeinstellungen unter Sprachausgabe eine deutsche Stimme hinzufügen, für Englisch auch eine englische.</p>'}${hint ? `<p class="pnote">${hint}</p>` : ''}</details>`;
}
// task.say: the question as spoken, without the letter it shows; task.quiet: its options are letters and stay unread
function readAloud(container: HTMLElement, bottom: HTMLElement, task) {
  onScreen = task;
  const asked = [...container.querySelectorAll<HTMLElement>('.question, .prompt, .expr, .story, .clues, .numword')].map(
    (e) => e.textContent.trim(),
  );
  const opts =
    CFG().speakOptions === false || task.quiet
      ? []
      : [...(bottom || container).querySelectorAll<HTMLElement>('.opt, .oitem')].map((e) => e.textContent.trim());
  speakBtn(
    $('.tut', container),
    'beforebegin',
    () => joined(...(task.say ? [task.say] : asked), ...opts),
    undefined,
    task.english || [],
  );
}

/* ---------- Choice / order / parts tasks ---------- */
function runChoiceTask(task, opts: TaskOpts, done: TaskDone) {
  const container = opts.container,
    bottom = opts.bottom;
  const M = MODULES_OF()[task.mod] || READ_MOD;
  let locked = false;
  const head = `<div class="head">${M.icon} ${M.name}${opts.subtitle ? ` · ${esc(opts.subtitle)}` : ''}<button class="tut" type="button" aria-label="Erklärung anzeigen">🛈<span class="lbl"> Wie geht das?</span></button></div>`;
  // with two options crossing one out gives the answer away, so show the notes instead
  const strikeWrongOption = () => {
    if (task.options.length <= 2) {
      const n = task.note && CFG().notes ? CFG().notes[task.note] : null;
      $('#fb', container).insertAdjacentHTML(
        'beforebegin',
        task.tip
          ? `<div class="hintline">🌉 Tipp: ${esc(task.tip)}</div>`
          : n
            ? `<div class="hintline">🌉 Tipp aus deinen Notizen „${esc(n.title)}“:<br>${n.lines.map((l) => esc(l)).join('<br>')}</div>`
            : '<div class="hintline">🌉 Tipp: Lies die Frage noch einmal ganz genau.</div>',
      );
      return;
    }
    const wrong = [...bottom.querySelectorAll<HTMLButtonElement>('.opt')].filter(
      (b) => task.options[+b.dataset.i!] !== task.answer,
    );
    const w = wrong[Math.floor(Math.random() * wrong.length)];
    if (w) {
      w.disabled = true;
      w.classList.add('struck');
    }
    $('#fb', container).insertAdjacentHTML(
      'beforebegin',
      '<div class="hintline">🌉 Tipp: Eine falsche Antwort ist durchgestrichen.</div>',
    );
  };
  const finish = (ok, extraHtml) => {
    locked = true;
    const fb = $('#fb', container);
    if (ok) SFX.right();
    else SFX.wrong();
    if (opts.onResult) opts.onResult(ok);
    const more = task.more ? `<small>Herkunft: ${esc(task.more)}</small>` : ''; // where a saying comes from, after every answer
    fb.innerHTML = ok
      ? `<div class="feedback good pop">Richtig! ✔${more}</div>`
      : `<div class="feedback bad ${reducedMotion ? '' : 'shake'}">Daneben<small>${extraHtml}</small>${more}</div>`;
    sayResult(fb, ok, plain(extraHtml));
    if (fb.scrollIntoView) fb.scrollIntoView({ block: 'nearest' });
    bottom.innerHTML = `<button class="btn" id="next">Weiter</button>`;
    $('#next').focus();
    $('#next').onclick = () => done(ok);
  };
  if (task.kind === 'choice') {
    // svgOpts: the options are pictures (generated markup, not player text)
    container.innerHTML = `<div class="task">${head}${task.fig || ''}<div class="question">${esc(task.q).replace('___', '<span class="blank">____</span>')}</div>${task.pic || ''}<div id="fb" role="status" aria-live="polite"></div></div>`;
    bottom.innerHTML = `<div class="options ${task.svgOpts ? 'pics' + (task.tall ? ' tall' : '') : task.inline ? 'sentence' : task.cols === 2 ? 'two' : ''}">${task.options.map((o, i) => `<button class="opt" data-i="${i}"${task.svgOpts ? ` aria-label="Bild ${i + 1}">${o}` : `>${esc(o)}`}</button>`).join('')}${task.inline ? '<span aria-hidden="true">.</span>' : ''}</div>`;
    bottom.querySelectorAll<HTMLElement>('.opt').forEach((b) => {
      b.onclick = () => {
        if (locked) return;
        const ok = task.options[+b.dataset.i!] === task.answer;
        b.classList.add(ok ? 'right' : 'wrong');
        if (task.svgOpts) {
          finish(ok, `${esc(task.why)}<span class="fbpic">${task.answer}</span>`);
          return;
        }
        finish(ok, `Richtig wäre: ${esc(task.answer)}${task.why ? ' – ' + esc(task.why) : ''}`);
      };
    });
    if (opts.hint) strikeWrongOption();
  } else if (task.kind === 'parts') {
    container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q)}</div>${plantOf(task.plant).svg({ highlight: task.part })}<div id="fb" role="status" aria-live="polite"></div></div>`;
    bottom.innerHTML = `<div class="options two">${task.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
    bottom.querySelectorAll<HTMLElement>('.opt').forEach((b) => {
      b.onclick = () => {
        if (locked) return;
        const ok = task.options[+b.dataset.i!] === task.answer;
        b.classList.add(ok ? 'right' : 'wrong');
        if (!ok) {
          const el = container.querySelector<HTMLElement>('[data-part="' + task.part + '"]');
          if (el) el.classList.add('reveal');
        }
        finish(ok, `Das ist: ${esc(task.answer)}`);
      };
    });
    if (opts.hint) strikeWrongOption();
  } else if (task.kind === 'parts-find') {
    container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q)}</div>${plantOf(task.plant).svg({ clickable: true })}<div id="fb" role="status" aria-live="polite"></div></div>`;
    const pp = plantOf(task.plant).parts.find((p) => p.id === task.part);
    bottom.innerHTML = `<p class="center muted" style="margin:6px 0">Tippe auf ${(MS.PLANTS[task.plant] && MS.PLANTS[task.plant].tap) || 'den Teil in der Pflanze'}.</p>${opts.hint && pp ? `<p class="center hintline">🌉 Tipp: ${esc(pp.tip || `Der Teil ist ${pp.ground === 'unten' ? 'unter' : 'über'} der Erde.`)}</p>` : ''}`;
    container.querySelectorAll<HTMLElement>('[data-part]').forEach((g) => {
      g.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (g.onclick as () => void)();
        }
      };
      g.onclick = () => {
        if (locked) return;
        const ok = g.dataset.part === task.part;
        g.classList.add(ok ? 'hit-part' : 'miss-part');
        if (!ok) {
          const el = container.querySelector<HTMLElement>('[data-part="' + task.part + '"]');
          if (el) el.classList.add('reveal');
        }
        finish(ok, `Hier leuchtet jetzt: ${esc(task.answer)}`);
      };
    });
  } else if (task.kind === 'karte') {
    const goal = task.target.join('-');
    container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q)}</div>${MS.mapSVG({ start: task.start, neben: task.neben, scale: task.scale, clickable: true })}<div id="fb" role="status" aria-live="polite"></div></div>`;
    bottom.innerHTML = `<p class="center muted" style="margin:6px 0">Tippe auf das Feld mit dem Schatz.</p>${opts.hint ? '<p class="center hintline">🌉 Tipp: Norden ist oben, Osten rechts, Süden unten, Westen links.</p>' : ''}`;
    container.querySelectorAll<HTMLElement>('[data-cell]').forEach((c) => {
      c.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (c.onclick as () => void)();
        }
      };
      c.onclick = () => {
        if (locked) return;
        const ok = c.dataset.cell === goal;
        c.classList.add(ok ? 'hit' : 'miss');
        if (!ok) container.querySelector<HTMLElement>(`[data-cell="${goal}"]`)!.classList.add('reveal');
        finish(ok, 'Der Schatz liegt auf dem gelben Feld.');
      };
    });
  } else if (task.kind === 'order') {
    const chosen = opts.hint ? [task.order[0]] : [];
    const fixed = chosen.length;
    container.innerHTML = `<div class="task">${head}<div class="question">${esc(task.q)}</div><div class="orderlist" id="olist"></div><p class="ohelp">Tippe der Reihe nach. Nochmal tippen nimmt es wieder heraus.</p><div id="fb" role="status" aria-live="polite"></div></div>`;
    const paint = () => {
      $('#olist', container).innerHTML = task.display
        .map((it) => {
          const pos = chosen.indexOf(it.id);
          return `<button class="oitem ${pos >= 0 ? 'picked' : ''}" data-id="${it.id}" aria-pressed="${pos >= 0}" aria-label="${esc(it.text)}${pos >= 0 ? ', Platz ' + (pos + 1) : ''}"><span class="num">${pos >= 0 ? pos + 1 : ''}</span><span>${esc(it.text)}</span></button>`;
        })
        .join('');
      container.querySelectorAll<HTMLElement>('.oitem').forEach((b) => {
        b.onclick = () => {
          if (locked) return;
          const pos = chosen.indexOf(b.dataset.id);
          if (pos >= fixed) chosen.splice(pos, 1);
          else if (pos < 0) chosen.push(b.dataset.id);
          paint();
        };
      }); /* tap again = take it out, the ones after it move up */
      $<HTMLButtonElement>('#ocheck').disabled = chosen.length !== task.order.length;
      $<HTMLButtonElement>('#oundo').disabled = chosen.length <= fixed;
    };
    bottom.innerHTML = `<div class="row"><button class="btn secondary" id="oundo">↶ Rückgängig</button><button class="btn" id="ocheck">✓ Prüfen</button></div>`;
    $('#oundo').onclick = () => {
      if (!locked && chosen.length > fixed) {
        chosen.pop();
        paint();
      }
    };
    if (fixed)
      $('#olist', container).insertAdjacentHTML(
        'afterend',
        '<div class="hintline">🌉 Tipp: Das Erste steht schon richtig.</div>',
      );
    $('#ocheck').onclick = () => {
      if (locked || chosen.length !== task.order.length) return;
      const ok = chosen.every((id, i) => id === task.order[i]);
      const byId = Object.fromEntries(task.items.map((x) => [x.id, x.text]));
      container.querySelectorAll<HTMLElement>('.oitem').forEach((b) => {
        const i = chosen.indexOf(b.dataset.id);
        b.classList.add(task.order[i] === b.dataset.id ? 'right' : 'wrong');
      });
      finish(ok, 'Richtige Reihenfolge:<br>' + task.order.map((id, i) => `${i + 1}. ${esc(byId[id])}`).join('<br>'));
    };
    paint();
  }
  $('.tut', container).onclick = () => showTutorial(task.group, task.note);
  readAloud(container, opts.bottom, task);
}

/* ---------- Potato plant drawing ---------- */
// shared by the hut, garden, market and mine pictures: ink outline, soft gradients lit from the top left
export const INK = '#1C2541';
export const ln = (w) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
export const lg = (id, a, b, h?) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${h ? 1 : 0}" y2="${h ? 0 : 1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
export const rg = (id, a, b) =>
  `<radialGradient id="${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
export const r1 = (svg) => svg.replace(/(\.\d)\d+/g, '$1');
export const shadow = (cx, cy, rx, ry) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${INK}" opacity=".18"/>`;
// the glow style recolours every stroke inside a part, so inner colours and widths are set inline
const st = (c, w) => `fill="none" style="stroke:${c};stroke-width:${w}" stroke-linecap="round" stroke-linejoin="round"`;
const twin = (d, c, w) => `<path d="${d}" ${st(INK, w + 3)}/><path d="${d}" ${st(c, w)}/>`;
const ptLeaf = (x: number, y: number, rx: number, ry: number, a: number) =>
  `<g transform="translate(${x} ${y}) rotate(${x < 130 ? a + 180 : a}) scale(1.15)" fill="url(#pt-lf)" ${ln(2)}><path d="M${-rx} 0Q${-rx * 0.1} ${-ry * 1.5} ${rx} 0Q${-rx * 0.1} ${ry * 1.5} ${-rx} 0Z"/><path d="M${2 - rx} 0Q0 -1 ${rx - 3} 0M${-rx * 0.3} -0.5l${rx * 0.35} ${-ry * 0.55}M${-rx * 0.3} 0.5l${rx * 0.35} ${ry * 0.55}M${rx * 0.2} -0.3l${rx * 0.3} ${-ry * 0.4}M${rx * 0.2} 0.3l${rx * 0.3} ${ry * 0.4}" ${st('#2F7A32', 1.1)}/></g>`;
const ptFlower = (x, y, r) =>
  `<g transform="translate(${x} ${y})" fill="url(#pt-fl)" ${ln(1.8)}>${[0, 72, 144, 216, 288].map((a) => `<ellipse cy="${-r * 0.55}" rx="${r * 0.5}" ry="${r * 0.62}" transform="rotate(${a})"/>`).join('')}<path d="M0 ${-r * 0.42}L${r * 0.16} -2L${r * 0.4} ${-r * 0.1}L${r * 0.2} ${r * 0.18}L${r * 0.25} ${r * 0.42}L0 ${r * 0.3}L${-r * 0.25} ${r * 0.42}L${-r * 0.2} ${r * 0.18}L${-r * 0.4} ${-r * 0.1}L${-r * 0.16} -2Z" fill="#F5C93F" ${ln(1.2)}/></g>`;
const ptTuber = (x, y, rx, ry, a) =>
  `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M${-rx} 1Q${-rx} ${-ry} ${-rx * 0.1} ${-ry}Q${rx * 0.9} ${-ry * 1.1} ${rx} ${-ry * 0.1}Q${rx * 1.05} ${ry} 0 ${ry}Q${-rx * 1.02} ${ry * 1.05} ${-rx} 1Z" fill="url(#pt-tk)" ${ln(2.2)}/>${[
    [-0.4, -0.15],
    [0.42, 0.15],
    [0, 0.55],
  ]
    .map(([a, b]) => `<circle cx="${rx * a}" cy="${ry * b}" r="1.3" fill="#8A6030"/>`)
    .join(
      '',
    )}<ellipse cx="${-rx * 0.35}" cy="${-ry * 0.5}" rx="${rx * 0.28}" ry="${ry * 0.18}" fill="#FFF7E0" opacity=".55"/></g>`;
const PT_DEFS = `<defs>${lg('pt-soil', '#BE9064', '#8A5F3B')}${lg('pt-lf', '#86CF63', '#3E9640')}${lg('pt-st', '#7CC35B', '#3E8E41', 1)}${rg('pt-fl', '#FFFFFF', '#B79BEE')}${rg('pt-tk', '#F6D995', '#BC8B42')}${rg('pt-mk', '#A98256', '#5E4026')}${rg('pt-be', '#C6E89A', '#5E9A2E')}
    <pattern id="pt-cr" width="40" height="34" patternUnits="userSpaceOnUse"><circle cx="6" cy="8" r="1.6" fill="#6E4A2C" opacity=".5"/><circle cx="25" cy="4" r="1.2" fill="#F2D9B0" opacity=".45"/><circle cx="33" cy="20" r="2" fill="#6E4A2C" opacity=".4"/><circle cx="14" cy="26" r="1.3" fill="#F2D9B0" opacity=".4"/><ellipse cx="22" cy="16" rx="2.6" ry="1.8" fill="#A8A29A" stroke="#6E4A2C" stroke-width=".8" opacity=".7"/></pattern></defs>`;
// opts: highlight (part id), clickable, labels (bool), step (1-6 for drawing school)
function potatoSVG(opts) {
  opts = opts || {};
  const step = opts.step || 6;
  const hl = (id) => (opts.highlight === id ? ' glow' : '');
  const g = (id, inner, cls?) =>
    step >= PART_STEP[id]
      ? `<g data-part="${id}" class="part${hl(id)} ${cls || ''}" ${opts.clickable ? `tabindex="0" role="button" aria-label="Pflanzenteil ${Object.keys(PART_STEP).indexOf(id) + 1}"` : ''}>${inner}</g>`
      : '';
  const label = (id, x, y, anchor?) =>
    opts.labels && step >= PART_STEP[id]
      ? `<text class="plabel" x="${x}" y="${y}" text-anchor="${anchor || 'start'}">${MK.PARTS.find((p) => p.id === id)!.name.replace(' (Frucht)', '')}</text>`
      : '';
  return r1(`<svg class="plant ${opts.clickable ? 'clickable' : ''}" viewBox="0 0 260 300" aria-label="Kartoffelpflanze">${PT_DEFS}
      <path d="M0 152Q40 147 80 151T160 150T260 151V300H0Z" fill="url(#pt-soil)"/><path d="M0 152Q40 147 80 151T160 150T260 151V300H0Z" fill="url(#pt-cr)"/><path d="M0 152Q40 147 80 151T160 150T260 151" fill="none" ${ln(2.5)}/>
      <path d="M18 151l-3-7M21 151l1-8M24 151l4-6M226 151l-3-6M229 151l1-8M232 151l4-6" stroke="#4F9A45" stroke-width="2" stroke-linecap="round"/>
      ${g('wurzeln', `${twin('M130 190Q110 215 95 245M130 190Q150 220 160 250M130 195Q125 225 118 260M130 195Q140 230 150 270', '#EAD7B0', 2.4)}<path d="M104 228l-7-3M112 214l-6 2M154 228l7-2M146 212l6 1M121 245l-6 3M145 248l6 2M156 262l6-1" ${st('#EAD7B0', 1.2)}/><path class="hitarea" d="M90 190 L170 190 L170 275 L90 275 Z" fill="transparent"/>`)}
      ${g('mutterknolle', `<path d="M104 186Q103 169 127 169Q154 167 156 184Q157 202 131 202Q105 204 104 186Z" fill="url(#pt-mk)" ${ln(2.5)}/><path d="M112 180q6 4 12 1M134 192q7 2 13-3M116 194q4 2 8 0" ${st('#4A321C', 1.4)}/><circle cx="123" cy="178" r="1.6" fill="#3A2614"/><circle cx="143" cy="183" r="1.6" fill="#3A2614"/><circle cx="129" cy="191" r="1.6" fill="#3A2614"/><ellipse cx="117" cy="175" rx="6" ry="2.5" fill="#E8D2B0" opacity=".4"/>`)}
      ${g('auslaeufer', twin('M110 180Q70 185 50 210M150 180Q190 185 215 205M120 192Q95 215 80 240M140 192Q170 215 190 240', '#F4E9CC', 3))}
      ${g('tochterknollen', ptTuber(44, 218, 15, 10, -8) + ptTuber(222, 214, 15, 10, 10) + ptTuber(76, 248, 14, 9, 6) + ptTuber(196, 248, 14, 9, -6))}
      ${g('staengel', `${twin('M130 170Q128 120 130 60', 'url(#pt-st)', 5)}${twin('M130 120Q110 100 92 92M130 95Q152 80 168 72M130 140Q156 128 176 126M130 125Q104 118 84 120', 'url(#pt-st)', 3.6)}<path d="M128 160Q126.5 120 128.5 66" ${st('#B4E39A', 1.3)}/>`)}
      ${g(
        'blaetter',
        `<path d="M92 92Q78 88 62 100M168 72Q184 70 196 80M176 126Q194 126 208 138M84 120Q66 120 52 134M130 66Q122 56 118 48M130 104Q138 102 146 100" ${st('#3E8E41', 2.4)}/>${(
          [
            [80, 88, 16, 9, -25],
            [62, 100, 13, 8, -10],
            [178, 66, 16, 9, 20],
            [196, 80, 13, 8, 10],
            [190, 124, 16, 9, 15],
            [208, 138, 12, 7, 0],
            [70, 122, 16, 9, -15],
            [52, 134, 12, 7, 0],
            [118, 48, 12, 8, -40],
            [146, 100, 12, 7, 35],
          ] as Parameters<typeof ptLeaf>[]
        )
          .map((l) => ptLeaf(...l))
          .join('')}`,
      )}
      ${g('bluete', `<path d="M130 60V48M131 58Q144 52 156 52" ${st('#3E8E41', 2.6)}/>${ptFlower(130, 40, 13)}${ptFlower(156, 52, 10)}`)}
      ${g('beere', `<path d="M129 78Q112 72 100 84" ${st('#3E8E41', 2.6)}/><circle cx="98" cy="91" r="8" fill="url(#pt-be)" ${ln(2.2)}/><path d="M93 84l5 3 5-3M98 87v-4" ${st('#2F7A32', 1.6)}/><ellipse cx="95" cy="89" rx="2.4" ry="1.6" fill="#F4FBE6" opacity=".8"/>`)}
      ${label('bluete', 168, 30)}${label('beere', 6, 76)}${label('blaetter', 4, 112)}${label('staengel', 140, 146)}${label('mutterknolle', 162, 178)}${label('wurzeln', 160, 290)}${label('auslaeufer', 6, 204)}${label('tochterknollen', 6, 276)}
    </svg>`);
}
const PART_STEP = {
  mutterknolle: 1,
  wurzeln: 2,
  auslaeufer: 3,
  tochterknollen: 3,
  staengel: 4,
  blaetter: 5,
  bluete: 6,
  beere: 6,
};
const DRAW_STEPS = [
  'Zeichne die Erdlinie und darunter die Mutterknolle.',
  'Zeichne die Wurzeln nach unten.',
  'Zeichne die Ausläufer zur Seite und daran die Tochterknollen.',
  'Zeichne den Stängel nach oben mit Seitentrieben.',
  'Zeichne die Blätter an die Triebe.',
  'Zeichne oben die Blüten und eine kleine Beere.',
];
// labelled pictures: the potato here, cereal plant and water cycle in sachkunde.ts
export const POTATO = { svg: potatoSVG, parts: MK.PARTS, steps: DRAW_STEPS, qid: 'p_', note: 'teile' };
export const plantOf = (k) => (k && MS.PLANTS[k]) || POTATO;
