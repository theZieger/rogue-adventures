// Duell: two children on one device, nothing is saved (runs the built docs/index.html in jsdom).
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8');

let fails = 0;
const check = (cond, msg) => { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const META = 'mathquest_meta_v2';

function open(storage) {
  const errors = [];
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/', beforeParse(w) { for (const [k, v] of Object.entries(storage || {})) w.localStorage.setItem(k, v); w.addEventListener('error', (e) => errors.push(e.message)); } });
  const w = dom.window, d = w.document; const $ = (s) => d.querySelector(s);
  const click = (s) => { const el = typeof s === 'string' ? $(s) : s; if (!el) throw new Error('missing ' + s + ' on: ' + d.body.textContent.slice(0, 200)); el.click(); };
  const dump = () => Object.fromEntries(Object.keys(w.localStorage).map((k) => [k, w.localStorage.getItem(k)]));
  return { w, d, $, click, dump, text: () => $('#app').textContent, errors };
}
function answer(p, right) {
  const t = p.w.__task;
  if (t.kind === 'num') {
    if (t.col) { const s = String(right ? t.answers[0] : t.answers[0] + 1); const w = t.col.w; [...s].forEach((ch, k) => { p.click(`.colcalc .inp[data-i="${w - s.length + k}"]`); p.click(`.numpad [data-k="${ch}"]`); }); }
    else [...p.d.querySelectorAll('.inp')].forEach((el, i) => { el.click(); for (const ch of String(right ? t.answers[i] : t.answers[i] + 1)) p.click(`.numpad [data-k="${ch}"]`); });
    p.click('.numpad [data-k="ok"]');
  } else if (t.kind === 'choice' || t.kind === 'parts') { const i = t.options.indexOf(t.answer); p.click(p.d.querySelectorAll('.opt')[right ? i : (i + 1) % t.options.length]); }
  else if (t.kind === 'parts-find') p.click([...p.d.querySelectorAll('.plant [data-part]')].find((x) => (x.dataset.part === t.part) === right));
  else { const o = right ? t.order : [t.order[1], t.order[0]].concat(t.order.slice(2)); for (const id of o) p.click(`.oitem[data-id="${id}"]`); p.click('#ocheck'); }
  p.click('#next');
}

(async () => {
  const before = { setup: { done: false, skipped: true, at: 'x' }, stats: { math: { add: { c: 5, t: 6, hist: [1, 1] } } } };
  const src = open({ [META]: JSON.stringify(before) }); src.click('[data-new="satzbaustelle"]'); src.click('#go');
  const runSaved = src.w.localStorage.getItem('mathquest_run_satzbaustelle');
  const p = open({ [META]: JSON.stringify(before), mathquest_run_satzbaustelle: runSaved });
  const meta0 = p.w.localStorage.getItem(META);
  p.click('#duel');
  check(p.text().includes('Kind 1 von 2') && !!p.$('#dname') && p.$('#go').disabled, 'duel setup asks child 1 for name, unit and hero');
  p.$('#dname').value = 'Mia';
  p.click('[data-unit="math"]');
  check(!!p.$('[data-hero="fuchs"]') && !p.$('[data-hero="kauz"]') && p.$('#go').disabled, 'unit shows its heroes (locked ones hidden)');
  p.click('[data-hero="fuchs"]'); p.click('#go');
  check(p.text().includes('Kind 2 von 2') && p.text().includes('Mia ist bereit'), 'then child 2 chooses');
  p.$('#dname').value = 'Ben';
  p.click('[data-unit="woerterwerkstatt"]');
  check(!p.$('#go').disabled, 'a unit with one hero selects it right away');
  p.click('#go');
  check(!!p.$('.plate.hero') && !!p.$('.plate.enemy') && !!p.$('#fh .mon') && !!p.$('#fe .mon'), 'duel shows two plates and two heroes');
  check(p.$('.plate.hero .name').textContent.includes('Mia') && p.$('.plate.enemy .name').textContent.includes('Ben'), 'child 1 at the bottom, child 2 at the top');
  check(p.text().includes('Mia fängt an') && p.$('.plate.hero .levelbadge') && p.$('.plate.hero .levelbadge').textContent === 'am Zug', 'child 1 starts');

  const turns = [];
  // Mia answers wrong once (nothing happens), then everybody answers right until someone has 0 LP
  for (let n = 0; n < 40 && p.$('.atk'); n++) {
    const who = p.$('.levelbadge').closest('.plate').classList.contains('hero') ? 'Mia' : 'Ben';
    p.click('.atk'); turns.push({ who, mode: p.w.__mq.mode, kind: p.w.__task.kind });
    const hp = [...p.d.querySelectorAll('.hptext')].map((x) => x.textContent);
    const right = n !== 0; answer(p, right);
    if (n === 0) check(JSON.stringify([...p.d.querySelectorAll('.hptext')].map((x) => x.textContent)) === JSON.stringify(hp), 'a wrong answer changes no life points');
    if (n === 0) check(p.text().includes('Jetzt ist Ben dran'), 'after a turn the other child is up');
    if (!p.$('.atk')) await sleep(1700);
  }
  check(turns.every((t, i) => t.who === (i % 2 ? 'Ben' : 'Mia')), 'turns alternate');
  check(turns.filter((t) => t.who === 'Mia').every((t) => t.mode === 'math' && t.kind === 'num') && turns.filter((t) => t.who === 'Ben').every((t) => t.mode === 'woerterwerkstatt'), 'each child gets tasks from their own unit');
  check(p.text().includes('Ben gewinnt das Duell') && !!p.$('#again'), 'result screen names the winner (Ben, Mia missed once)');
  check(p.w.localStorage.getItem(META) === meta0, 'duel changes no statistics, stamps or progress');
  check(!p.w.localStorage.getItem('mathquest_run_v1') && !p.w.localStorage.getItem('mathquest_run_woerterwerkstatt') && p.w.localStorage.getItem('mathquest_run_satzbaustelle') === runSaved, 'no save slot is created and other adventures stay');
  p.click('#again');
  check(p.text().includes('Mia fängt an'), 'next duel: the loser starts');
  const p2 = open(p.dump());
  check(!!p2.$('#duel') && !p2.$('.plate') && !p2.$('[data-cont="math"]'), 'a reload returns to the title, nothing to continue');
  check(p.errors.length === 0 && p2.errors.length === 0, 'no page errors ' + p.errors.join(' '));
  console.log('duel fails', fails);
  if (fails) process.exit(1);
})();
