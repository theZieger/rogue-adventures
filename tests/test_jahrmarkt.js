// Jahrmarkt generators: every task is solvable from what the child sees, whole numbers only, one right choice.
const MJ = require('../src/jahrmarkt.js');
const { solve, textOf } = require('./jm_solver.js');
const fails = [];
const check = (cond, msg, t) => { if (!cond && fails.length < 10) fails.push(msg + ' ' + JSON.stringify(t).slice(0, 400)); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// upper bound per input field, by the unit written under it
const FIELD_MAX = { Minuten: 59, cm: 99, g: 999, ct: 99 };

for (const [mod, M] of Object.entries(MJ.MODULES)) {
  check(M.worldCap.length === MJ.MODE.worlds && M.worldCap.every((c, i) => c >= 1 && c <= M.maxTier && (!i || c >= M.worldCap[i - 1])), 'worldCap', mod);
  for (let t = 1; t <= M.maxTier; t++) {
    const tut = MJ.TUT[mod][t]; check(tut && tut.steps.length >= 3 && tut.steps.some((s) => /\d/.test(s)), 'tutorial with worked example', mod + t);
    check(!tut || !/super|toll|prima|klasse|geschafft|du schaffst/i.test(tut.steps.join(' ')), 'tutorial without praise', mod + t);
    for (let i = 0; i < 1500; i++) {
      const tk = MJ.generate(mod, t); const seen = textOf(tk.fig) + ' ' + (tk.q || '') + ' ' + (tk.show || tk.why || '') + ' ' + (tk.options || []).join(' ');
      check(tk.mod === mod && tk.tier === t && /data-t="/.test(tk.fig), 'task shape', tk);
      check(!/\d[,.]\d/.test(seen + tk.fig.replace(/<[^>]*>/g, ' ')), 'no comma numbers in what the child reads', seen);
      check(!/NaN|undefined|null/.test(seen + tk.fig), 'no broken text', seen);
      if (tk.kind === 'num') {
        check(tk.answers.every((a) => Number.isInteger(a) && a >= 0 && a <= 9999), 'whole numbers 0–9999', tk);
        check(tk.answers[0] > 0, 'first answer is not 0', tk);
        check(!tk.labels || tk.labels.length === tk.answers.length, 'one label per field', tk);
        if (tk.labels && tk.answers.length === 2) check(tk.answers[1] <= (FIELD_MAX[tk.labels[1]] || 9999), 'second field below the next unit', tk);
        if (tk.labels && tk.labels[0] === 'Stunden') check(tk.answers[0] >= 1 && tk.answers[0] <= 23, 'hours', tk);
        let got; try { got = solve(tk.fig, null, MJ.REF); } catch (e) { got = e.message; }
        check(same(got, tk.answers), `solvable from the question (solver says ${JSON.stringify(got)})`, { q: textOf(tk.fig), answers: tk.answers });
      } else {
        check(tk.kind === 'choice' && tk.options.length >= 2 && new Set(tk.options).size === tk.options.length, 'distinct options', tk);
        check(tk.options.filter((o) => o === tk.answer).length === 1, 'answer is one of the options', tk);
        let got; try { got = solve(tk.fig + `<div class="question">${tk.q}</div>`, tk.options, MJ.REF); } catch (e) { got = e.message; }
        check(got === tk.answer, `exactly one right choice (solver says ${got})`, { q: tk.q, options: tk.options, answer: tk.answer, fig: tk.fig.slice(0, 80) });
      }
    }
  }
}
// estimate questions: the other options are off by at least a factor of 10
for (const r of MJ.REF) { const g = r.slice(1).map(MJ.qty); check(g.slice(1).every((x) => Math.max(x, g[0]) / Math.min(x, g[0]) >= 10), 'REF options far apart', r); }
for (const mod of Object.keys(MJ.MODULES)) { const tk = MJ.generate(mod, MJ.MODULES[mod].maxTier); console.log(mod, textOf(tk.fig), tk.q || '', JSON.stringify(tk.answers || tk.answer)); }
console.log('jahrmarkt fails', fails.length); if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
