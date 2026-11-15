// One page load of the built game (docs/index.html) in jsdom, for the page tests. open(storage) is a reload:
// the page starts with that localStorage. Every page is a full copy of the app with its own timers and is never
// freed while open, so the tests close the pages they are done with; dump() still works after close().
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8');

// mulberry32
const seeded = (s) => () => {
  s = (s + 0x6d2b79f5) | 0;
  let x = Math.imul(s ^ (s >>> 15), 1 | s);
  x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};

// opts.seed: the page's Math.random; opts.voice: one speech voice or a list (w.said collects what was read, w.utter is the
// last utterance, w.utters those since the last cancel, i.e. one reading); opts.ua: the browser's userAgent;
// opts.url: page address (e.g. with #lade=); opts.zip: give the page the compression streams jsdom lacks; opts.now: the page's clock
function open(storage, opts) {
  const errors = [];
  opts = opts || {};
  // a closed page may still flush one pending screen update; only open pages report errors
  let snap = null;
  const virtualConsole = new VirtualConsole();
  virtualConsole.sendTo(console, { omitJSDOMErrors: true });
  virtualConsole.on('jsdomError', (e) => {
    if (!snap) console.error(e);
  });
  const dom = new JSDOM(html, {
    virtualConsole,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: opts.url || 'https://example.com/',
    beforeParse(w) {
      for (const [k, v] of Object.entries(storage || {})) w.localStorage.setItem(k, v);
      w.addEventListener('error', (e) => errors.push(e.message));
      if (opts.seed != null) w.Math.random = seeded(opts.seed);
      if (opts.zip) Object.assign(w, { CompressionStream, DecompressionStream, Response, TextEncoder });
      if (opts.voice) {
        w.said = [];
        w.utters = [];
        w.speechSynthesis = {
          getVoices: () => [].concat(opts.voice),
          cancel() {
            w.utters = [];
          },
          speak(u) {
            w.said.push(u.text);
            w.utter = u;
            w.utters.push(u);
          },
        };
        w.SpeechSynthesisUtterance = class {
          constructor(t) {
            this.text = t;
          }
        };
      }
      if (opts.ua) Object.defineProperty(w.navigator, 'userAgent', { value: opts.ua });
      if (opts.now) {
        const D = w.Date,
          now = Date.parse(opts.now);
        w.Date = class extends D {
          constructor(...a) {
            super(...(a.length ? a : [now]));
          }
          static now() {
            return now;
          }
        };
      }
    },
  });
  const w = dom.window,
    d = w.document;
  // tests were written for one title screen: a game's button sits on its subject screen, so open that from the
  // title first, and a title button looked for on a subject screen means going back
  const $ = (s) => d.querySelector(s) || toGame(s) || toTitle(s);
  const toTitle = (s) => {
    if (!d.querySelector('[data-new]') || !d.querySelector('#back')) return null;
    d.querySelector('#back').click();
    return d.querySelector(s);
  };
  const toGame = (s) => {
    const m = /data-(?:new|cont)="(\w+)"/.exec(s);
    const sub = m && d.querySelector('[data-sub]') && w.__mq.subjectOf(m[1]);
    if (!sub) return null;
    d.querySelectorAll('[data-sub]')[
      [...d.querySelectorAll('[data-sub]')].findIndex((b) => b.textContent.includes(sub.subject))
    ].click();
    return d.querySelector(s);
  };
  const click = (s) => {
    const el = typeof s === 'string' ? $(s) : s;
    if (!el) throw new Error('missing ' + s + ' on: ' + d.body.textContent.slice(0, 200));
    el.click();
  };
  const dump = () => snap || Object.fromEntries(Object.keys(w.localStorage).map((k) => [k, w.localStorage.getItem(k)]));
  // drawn icons count as their emoji again
  const text = () => {
    const c = $('#app').cloneNode(true);
    c.querySelectorAll('svg.emo').forEach((s) => s.replaceWith(s.getAttribute('aria-label')));
    return c.textContent;
  };
  return {
    w,
    d,
    $,
    click,
    dump,
    text,
    errors,
    close: () => {
      snap = dump();
      w.close();
    },
  };
}

// answer the task on screen (w.__task) through the real task view, right or wrong, then „Weiter“
function answer(p, right) {
  const t = p.w.__task;
  if (t.kind === 'num') {
    if (t.col) {
      const s = String(right ? t.answers[0] : t.answers[0] + 1);
      const w = t.col.w;
      [...s].forEach((ch, k) => {
        p.click(`.colcalc .inp[data-i="${w - s.length + k}"]`);
        p.click(`.numpad [data-k="${ch}"]`);
      });
    } else
      [...p.d.querySelectorAll('.inp')].forEach((el, i) => {
        el.click();
        for (const ch of String(right ? t.answers[i] : t.answers[i] + 1)) p.click(`.numpad [data-k="${ch}"]`);
      });
    p.click('.numpad [data-k="ok"]');
  } else if (t.kind === 'choice' || t.kind === 'parts') {
    const i = t.options.indexOf(t.answer);
    p.click(p.d.querySelectorAll('.opt')[right ? i : (i + 1) % t.options.length]);
  } else if (t.kind === 'parts-find')
    p.click([...p.d.querySelectorAll('.plant [data-part]')].find((x) => (x.dataset.part === t.part) === right));
  else {
    const o = right ? t.order : [t.order[1], t.order[0]].concat(t.order.slice(2));
    for (const id of o) p.click(`.oitem[data-id="${id}"]`);
    p.click('#ocheck');
  }
  p.click('#next');
}

module.exports = { open, answer };
