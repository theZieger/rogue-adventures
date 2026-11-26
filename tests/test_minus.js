// Written subtraction in both ways of writing it, Ergänzen and Abziehen (Entbündeln): the finished picture, the
// task with its small fields, the explanations and the parents' choice. Runs the built docs/index.html in jsdom.
import * as page from './page.js';
import { ELTERN } from '../src/eltern.ts';
import { LAENDER } from '../src/laender.ts';

let fails = 0;
const check = (cond, msg, more) => {
  if (!cond) {
    fails++;
    console.log('FAIL', msg, more === undefined ? '' : JSON.stringify(more));
  }
};
const tick = () => new Promise(setImmediate);
const META = 'mathquest_meta_v2',
  RUN = 'mathquest_run_v1';
const SKIPPED = { setup: { done: false, skipped: true, at: 'x' }, grade: 3, seenTut: { 'battle:intro2': true } };
const VOICE = { voice: { localService: true, lang: 'de-DE' } };

// Zahlenquest in world 3 with written subtraction as the first attack; every such task is rows[0] − rows[1]
function fight(meta, rows, opts) {
  const map = JSON.parse(page.open(null, { seed: 1 }).w.eval('JSON.stringify(MQ.makeMap())'));
  const run = {
    mode: 'math',
    world: 3,
    floor: 1,
    map,
    hero: {
      id: 'fuchs',
      evo: 2,
      level: 9,
      xp: 0,
      hp: 150,
      maxHp: 150,
      attacks: ['ssub', 'sadd', 'smul', 'bruch'].map((mod) => ({ name: mod === 'ssub' ? 'Auffüller' : mod, mod })),
    },
    items: [],
    tiers: { ssub: 1 },
    path: [],
    shield: false,
  };
  const p = page.open(
    { [META]: JSON.stringify({ ...SKIPPED, ...meta }), [RUN]: JSON.stringify(run) },
    { seed: 2, ...opts },
  );
  const MQ = p.w.__mq.modules.MQ,
    generate = MQ.generate;
  MQ.generate = (mod, tier, o) => {
    const t = generate(mod, tier, o);
    return mod === 'ssub' ? Object.assign(t, MQ.columns('−', rows)) : t;
  };
  p.click('[data-cont="math"]');
  p.click(
    [...p.d.querySelectorAll('.node.open')].find((n) => n.getAttribute('aria-label') === 'Kampf') || p.$('.node.open'),
  );
  const key = (k) => p.click(`.numpad [data-k="${k}"]`);
  const field = (i) => p.d.querySelector(`.colcalc .inp[data-i="${i}"]`);
  return Object.assign(p, {
    attack: () => p.click('.atk[data-i="0"]'),
    key,
    field,
    // type a digit into field i
    put: (i, k) => {
      field(i).click();
      key(k);
    },
    active: () => +p.d.querySelector('.colcalc .inp.active').dataset.i,
    mins: () => [...p.d.querySelectorAll('.colcalc .min')],
  });
}

// Abziehen worked out the way a child does it on paper, right to left, unbundling from the nearest digit that has
// something: what each column of the minuend is worth in the end, and which columns gave one away
function byHand(a, b) {
  const w = String(a).length;
  const top = [...String(a)].map(Number),
    sub = [...String(b).padStart(w, '0')].map(Number);
  const gave = Array(w).fill(false),
    got = Array(w).fill(false),
    res = [];
  for (let k = w - 1; k >= 0; k--) {
    if (top[k] < sub[k]) {
      let j = k - 1;
      while (top[j] === 0) j--;
      top[j]--;
      gave[j] = true;
      for (let m = j + 1; m < k; m++) {
        top[m] = 9;
        gave[m] = got[m] = true;
      }
      top[k] += 10;
      got[k] = true;
    }
    res[k] = top[k] - sub[k];
  }
  return { w, top, gave, got, res };
}

// 1. the finished picture, recomputed for pairs across the whole range and for the hard cases
await tick();
{
  const p = page.open();
  const draw = (a, b, abz) => {
    const el = p.d.createElement('div');
    el.innerHTML = p.w.__mq.colSolved([a, b], abz).text;
    return el.firstElementChild;
  };
  const pairs = [
    [742, 318],
    [503, 276],
    [742, 368],
    [800, 356],
    [704, 318],
    [740, 318],
    [103, 57],
    [900, 899],
    [210, 11],
    [999, 111],
  ];
  for (let a = 100; a <= 999; a += 7) for (let b = 10; b <= a - 10; b += 13) pairs.push([a, b]);
  let zeros = 0,
    twice = 0,
    upTen = 0;
  for (const [a, b] of pairs) {
    const want = byHand(a, b),
      { w } = want;
    const abz = draw(a, b, true),
      cells = [...abz.children];
    check(abz.getAttribute('aria-label') === `${a} − ${b} = ${a - b}`, 'the picture names the calculation', [a, b]);
    // rows of w + 1 cells: small digits, minuend, subtrahend, then the line and the result
    const small = cells.slice(1, w + 1).map((c) => c.querySelector('small')),
      min = cells.slice(w + 2, 2 * w + 2),
      result = cells.slice(-w).map((c) => c.textContent);
    check(Number(result.join('')) === a - b && cells.length === 4 * (w + 1) + 1, 'the result stands under the line', [
      a,
      b,
    ]);
    for (let i = 0; i < w; i++) {
      const ten = (el) => (el.classList.contains('ten') ? 10 : 0);
      const worth = small[i] ? ten(small[i]) + +small[i].textContent : ten(min[i]) + +min[i].textContent;
      check(min[i].textContent === String(a)[i], 'the minuend keeps its digits', [a, b, i]);
      check(worth === want.top[i], 'each column is worth what unbundling by hand leaves', [a, b, i, worth]);
      check(min[i].classList.contains('cut') === want.gave[i], 'a digit that gave one away is struck', [a, b, i]);
      check(!!small[i] === want.gave[i], 'and has its new digit above it', [a, b, i]);
      check(
        (small[i] ? ten(small[i]) : 0) + ten(min[i]) === (want.got[i] ? 10 : 0),
        'a column that got ten shows one small 1',
        [a, b, i],
      );
      check(worth - (+String(b).padStart(w, '0')[i] || 0) === +(result[i] || 0), 'column by column gives the result', [
        a,
        b,
        i,
      ]);
      if (small[i] && String(a)[i] === '0') {
        zeros++;
        check(small[i].textContent === '9' && ten(min[i]) === 10, 'a 0 becomes 10 and then 9', [a, b, i]);
      }
      if (small[i] && ten(small[i])) upTen++;
    }
    if (want.gave.filter(Boolean).length > 1) twice++;
    // Ergänzen: the same numbers, the carries under the subtrahend, the same result
    const erg = draw(a, b, false),
      e = [...erg.children],
      c = p.w.MQ.columns('−', [a, b]).col;
    check(!erg.querySelector('.min, .cut, .ten'), 'Ergänzen strikes nothing', [a, b]);
    check(
      e
        .slice(-w)
        .map((x) => x.textContent)
        .join('') === result.join(''),
      'both ways end in the same result',
      [a, b],
    );
    check(
      e
        .slice(2 * w + 3, 3 * w + 3)
        .map((x) => +x.textContent)
        .join() === c.carry.join(),
      'Ergänzen shows the carries under the subtrahend',
      [a, b],
    );
    check(want.gave.map(Number).join() === c.carry.join(), 'a carry of Ergänzen is a digit unbundled by Abziehen', [
      a,
      b,
    ]);
  }
  check(zeros > 50 && twice > 500 && upTen > 300, 'zeros, double unbundling and 4 → 3 → 13 were all drawn', [
    zeros,
    twice,
    upTen,
  ]);
  check(p.errors.length === 0, 'no page errors ' + p.errors.join(' '));
  console.log('ok   the finished picture of', pairs.length, 'subtractions, fails so far', fails);
  p.close();
}

// 2. Abziehen on screen: the explanation, then 503 − 276 across the zero
await tick();
{
  const p = fight({ minus: 'abz', speak: true }, [503, 276], VOICE);
  p.attack();
  const tut = p.d.querySelector('.modal');
  check(
    tut && tut.querySelector('h2').textContent.includes('Schriftlich subtrahieren'),
    'the first task shows the explanation',
  );
  check(
    tut.querySelector('.colcalc.solved').getAttribute('aria-label') === '742 − 318 = 424' &&
      /Entbündle einen Zehner/.test(tut.textContent) &&
      !/ergänz|Übertrag/i.test(tut.textContent),
    'it explains Abziehen with 742 − 318 and draws it',
  );
  check(
    tut.querySelector('ol + p').textContent ===
      'Rechnet deine Klasse anders? Deine Eltern können das im Elternbereich umstellen.',
    'and ends with the hint for a class that calculates differently',
  );
  p.click('.modal .speak');
  check(
    /Entbündle einen Zehner/.test(p.w.said.join(' ')) && /Rechnet deine Klasse anders/.test(p.w.said.join(' ')),
    'read aloud it is the same explanation',
  );
  p.click('#tutok');
  const seen = p.w.__mq.meta.seenTut;
  check(seen['math:ssub:1:abz'] === true && !('math:ssub:1' in seen), 'it is remembered under its own key', seen);
  const col = p.d.querySelector('.colcalc');
  const kids = [...col.children];
  check(
    col.querySelectorAll('.inp.carry.up').length === 2 &&
      kids.indexOf(p.field(3)) < kids.indexOf(p.mins()[0]) &&
      p.mins().length === 3,
    'the small fields stand above the minuend',
  );
  check(
    p.field(3).getAttribute('aria-label') === 'Hunderter nach dem Entbündeln' &&
      p.field(4).getAttribute('aria-label') === 'Zehner nach dem Entbündeln',
    'and say what they are for',
  );
  const prompt = p.d.querySelector('.task .prompt').textContent;
  check(/entbündelst/.test(prompt) && !/Übertrag/.test(prompt), 'the line under the task fits Abziehen', prompt);
  p.w.said.length = 0;
  p.click('.task .speak');
  check(
    /entbündelst/.test(p.w.said.join(' ')) && !/Übertrag/.test(p.w.said.join(' ')),
    'and so does what is read aloud',
  );
  check(p.active() === 2, 'typing starts at the Einer');
  // 5 → 4, then 0 → 10 → 9, then 3 → 13
  p.put(3, 4);
  let [h, z, e] = p.mins();
  check(
    h.classList.contains('cut') &&
      z.classList.contains('ten') &&
      !z.classList.contains('cut') &&
      !e.className.includes('ten'),
    'a new digit strikes the 5 and puts a small 1 before the 0',
  );
  check(p.active() === 1, 'and typing goes on in the column that got the ten');
  p.put(4, 9);
  [h, z, e] = p.mins();
  check(
    z.classList.contains('cut') &&
      z.classList.contains('ten') &&
      e.classList.contains('ten') &&
      !p.field(4).classList.contains('ten'),
    'the 10 is struck with 9 above it, and the 3 becomes 13',
  );
  check(p.active() === 2, 'then the Einer are next');
  p.key(7);
  check(p.active() === 1, 'the result runs to the left by itself');
  p.key(2);
  p.key(2);
  check(p.active() === 0 && [0, 1, 2].map((i) => p.field(i).textContent).join('') === '227', 'digit by digit');
  p.key('ok');
  check(p.d.querySelector('.feedback.good'), '227 is right');
  check(
    [0, 1, 2, 3, 4].every((i) => p.field(i).classList.contains('ok')),
    'result and new digits are marked right',
  );
  check(p.w.__mq.meta.stats.math.ssub.c === 1, 'and the answer counts');
  p.click('#next');
  check(p.errors.length === 0, 'no page errors ' + p.errors.join(' '));
  p.close();
}

// 3. the small fields are a help, never graded: empty, wrong, or a column that gives first and gets then
await tick();
{
  // one fight each: a hit can end a fight
  const start = () => {
    const f = fight({ minus: 'abz', seenTut: { 'battle:intro2': true, 'math:ssub:1:abz': true } }, [742, 368]);
    f.attack();
    return f;
  };
  let p = start();
  check(
    !p.d.querySelector('.modal') && !!p.d.querySelector('.colcalc .inp.up'),
    'a seen explanation is not shown again',
  );
  p.key(4);
  p.key(7);
  p.key(3);
  p.key('ok');
  check(
    p.d.querySelector('.feedback.good') && !p.d.querySelector('.inp.carry.ok, .inp.carry.bad, .min.cut, .min.ten'),
    'the result alone is enough: three taps and ✓',
  );
  check(p.errors.length === 0, 'no page errors ' + p.errors.join(' '));
  p.close();
  p = start();
  p.put(4, 3);
  check(p.mins()[1].classList.contains('cut') && p.mins()[2].classList.contains('ten'), '4 → 3 gives the Einer ten');
  p.put(3, 5);
  check(
    p.field(4).classList.contains('ten') &&
      !p.mins()[1].classList.contains('ten') &&
      p.mins()[0].classList.contains('cut'),
    'the Zehner gave first, so their ten stands before the small 3: 13',
  );
  p.field(3).click();
  p.key('del');
  check(!p.field(4).classList.contains('ten'), 'deleting a new digit takes the ten back');
  p.put(3, 5);
  [
    [2, 4],
    [1, 7],
    [0, 3],
  ].forEach(([i, k]) => p.put(i, k));
  p.key('ok');
  check(p.d.querySelector('.feedback.good'), 'a wrong small digit does not make a right result wrong');
  check(
    p.field(3).classList.contains('bad') && p.field(4).classList.contains('ok'),
    'it is only marked: 7 → 6 was right, not 5',
  );
  check(p.errors.length === 0, 'no page errors ' + p.errors.join(' '));
  p.close();
  p = start();
  p.key(5);
  p.key(7);
  p.key(3);
  p.key('ok');
  const bad = p.d.querySelector('.feedback.bad');
  check(bad && bad.textContent.includes('Richtig wäre: 374'), 'a wrong result is wrong and the right one is shown');
  check(p.errors.length === 0, 'no page errors ' + p.errors.join(' '));
  p.close();
}

// 4. Ergänzen is what it was, plus the hint under its explanation
await tick();
{
  const p = fight({ speak: true }, [503, 276], VOICE);
  check(p.w.__mq.meta.minus === 'erg', 'a save from before the choice keeps Ergänzen');
  p.attack();
  const tut = p.d.querySelector('.modal');
  check(
    /ergänzt von unten nach oben/.test(tut.textContent) &&
      !tut.querySelector('.colcalc') &&
      tut.querySelectorAll('ol li').length === 4,
    'the explanation is the one for Ergänzen',
  );
  check(
    tut.querySelector('ol + p').textContent ===
      'Rechnet deine Klasse anders? Deine Eltern können das im Elternbereich umstellen.',
    'with the same hint at its end',
  );
  p.click('#tutok');
  const seen = p.w.__mq.meta.seenTut;
  check(seen['math:ssub:1'] === true && !('math:ssub:1:abz' in seen), 'remembered under the key it always had', seen);
  const kids = [...p.d.querySelector('.colcalc').children];
  check(
    !p.d.querySelector('.colcalc .up, .colcalc .min') &&
      kids.indexOf(p.field(3)) > kids.findIndex((x) => x.textContent === '−') &&
      p.field(3).getAttribute('aria-label') === 'Übertrag Hunderter',
    'the carry fields stand under the subtrahend',
  );
  check(/Übertrag/.test(p.d.querySelector('.task .prompt').textContent), 'the line under the task names the Übertrag');
  p.key(7);
  check(p.active() === 4, 'after the Einer comes the carry into the Zehner');
  p.key(1);
  p.key(2);
  check(p.active() === 3, 'then the carry into the Hunderter');
  p.key(1);
  p.key(2);
  p.key('ok');
  check(
    p.d.querySelector('.feedback.good') && [0, 1, 2, 3, 4].every((i) => p.field(i).classList.contains('ok')),
    '227 with both carries is right',
  );
  check(p.errors.length === 0, 'no page errors ' + p.errors.join(' '));
  p.close();
}

// 5. the parents' choice, and a child who knows Ergänzen sees the other explanation once after the change
await tick();
{
  const p = fight({ land: 'SN', seenTut: { 'battle:intro2': true, 'math:ssub:1': true } }, [742, 318]);
  p.attack();
  check(!p.d.querySelector('.modal') && !p.d.querySelector('.colcalc .up'), 'the child calculates by Ergänzen');
  const saved = p.dump();
  p.close();
  const q = page.open(saved);
  q.click('#parents');
  q.click('[data-pt="practice"]');
  q.click([...q.d.querySelectorAll('[data-pf]')].find((b) => b.textContent.includes('Mathe')));
  const card = () =>
    [...q.d.querySelectorAll('.pcard')].find((c) => c.querySelector('h3')?.textContent === 'So rechnet die Klasse');
  const choices = () => [...card().querySelectorAll('.choice[data-minus]')];
  check(
    choices()
      .map((b) => b.dataset.minus + b.getAttribute('aria-pressed'))
      .join() === 'abzfalse,ergtrue' && choices()[1].classList.contains('selected'),
    'the Zahlenquest page offers both ways and marks Ergänzen',
  );
  check(
    choices().every((b) => b.querySelector('.colcalc.solved').getAttribute('aria-label') === '742 − 318 = 424') &&
      choices()[0].querySelector('.min.cut') &&
      !choices()[1].querySelector('.min'),
    'each with its small picture',
  );
  check(
    card().textContent.includes('Schauen Sie ins Heft Ihres Kindes') &&
      card().textContent.includes(
        'Der sächsische Lehrplan von 2025 beschreibt das Abziehen. Manche Klassen rechnen mit Ergänzen.',
      ),
    'and says what to look at and what the Saxon plan describes',
  );
  choices()[0].click();
  check(
    q.w.__mq.meta.minus === 'abz' &&
      choices()[0].classList.contains('selected') &&
      !choices()[1].classList.contains('selected'),
    'a tap chooses Abziehen',
  );
  check(JSON.parse(q.dump()[META]).minus === 'abz', 'and it is saved');
  q.click('[data-info="ssub"]');
  check(
    /Entbündle einen Zehner/.test(q.d.querySelector('.modal').textContent),
    '„Beispiel ansehen“ shows the parents the explanation of the chosen way',
  );
  const after = q.dump();
  q.close();
  const r = fight({}, [742, 318]);
  r.close();
  const run = JSON.parse(r.dump()[RUN]);
  const s = page.open({ ...after, [RUN]: JSON.stringify(run) }, { seed: 2 });
  const MQ = s.w.__mq.modules.MQ,
    generate = MQ.generate;
  MQ.generate = (mod, tier, o) =>
    mod === 'ssub' ? Object.assign(generate(mod, tier, o), MQ.columns('−', [742, 318])) : generate(mod, tier, o);
  s.click('[data-cont="math"]');
  if (!s.d.querySelector('.atk')) s.click('.node.open');
  s.click('.atk[data-i="0"]');
  check(
    /Entbündle einen Zehner/.test(s.d.querySelector('.modal')?.textContent || ''),
    'after the change the child sees the explanation of Abziehen',
  );
  s.click('#tutok');
  check(!!s.d.querySelector('.colcalc .inp.up'), 'and the task is written that way');
  check(
    s.w.__mq.meta.seenTut['math:ssub:1'] === true && s.w.__mq.meta.seenTut['math:ssub:1:abz'] === true,
    'both explanations are remembered',
  );
  check(s.errors.length + q.errors.length === 0, 'no page errors ' + s.errors.concat(q.errors).join(' '));
  s.close();
}

// 6. what the card says per Bundesland, and that choosing back works
await tick();
{
  for (const code of ['', ...Object.keys(LAENDER)]) {
    const p = page.open({ [META]: JSON.stringify({ ...SKIPPED, land: code, minus: '' }) });
    p.click('#parents');
    p.click('[data-pt="practice"]');
    p.click([...p.d.querySelectorAll('[data-pf]')].find((b) => b.textContent.includes('Mathe')));
    const card = [...p.d.querySelectorAll('.pcard')].find(
      (c) => c.querySelector('h3')?.textContent === 'So rechnet die Klasse',
    );
    const want = code ? LAENDER[code].minus : 'erg';
    check(
      card && card.querySelector('.choice.selected').dataset.minus === want,
      'the marked way is the default of ' + code,
    );
    const line = code ? ELTERN.MINUS.land[code] || ELTERN.MINUS.free(LAENDER[code].name) : ELTERN.MINUS.none;
    check(card.textContent.includes(line), 'the card says what the plan of ' + code + ' says');
    check(
      new RegExp(want === 'abz' ? 'Abziehen' : 'Ergänzen').test(line) &&
        !/Thüringen|Bremen|Saarland/.test(card.textContent),
      'and that line names the default of ' + code,
      line,
    );
    check(p.w.__mq.meta.minus === '', 'looking at the card saves nothing ' + code);
    if (code === 'BY') {
      card.querySelector('[data-minus="erg"]').click();
      check(
        p.w.__mq.meta.minus === 'erg' && p.w.__mq.land.minusMethod() === 'erg',
        'parents in Bayern can choose Ergänzen',
      );
    }
    check(p.errors.length === 0, 'no page errors ' + p.errors.join(' '));
    p.close();
    await tick();
  }
}

console.log('minus fails', fails);
if (fails) process.exit(1);
