// Klasse 1/2 deutsch: checks beyond the generic ones in test_knowledge.js and test_data.js
const fails = [];
const f = (ok, msg) => { if (!ok) fails.push(msg); };
require('./units.js');
const K = require('../src/knowledge.js');
const D = require('../src/k12_deutsch.js');
const TEXTE = require('../src/texte.js');
const { JSDOM } = require('jsdom');
const parser = new (new JSDOM('').window.DOMParser)();
const UNITS = { laute1: 1, schreiben2: 2, woerter2: 2 };
const plain = (s) => s.replace(/<[^>]+>/g, ' ');
const norm = (w) => w.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u');
// Klasse 3/4 in the Rechtschreibrahmen: ck, tz; Komma and wörtliche Rede are not asked either
const K3 = /ck|tz/i;
// what the read-aloud voice reads in a task: the selector is taken from readAloud in app.js, so both stay in step
const SPOKEN = require('fs').readFileSync(require('path').join(__dirname, '../src/app.js'), 'utf8').match(/function readAloud[\s\S]*?querySelectorAll\('([^']+)'\)/)[1];
const dom = new JSDOM('').window.document;
const spoken = (cfg, q) => {
  const box = dom.createElement('div');
  box.innerHTML = `<div class="question">${q.q}</div>${q.pic || ''}${(q.options || []).map((o) => `<button class="opt">${o}</button>`).join('')}`;
  return [...box.querySelectorAll(SPOKEN + (cfg.speakOptions === false ? '' : ', .opt'))].map((e) => e.textContent.trim()).filter(Boolean).join(' ');
};

for (const [m, grade] of Object.entries(UNITS)) {
  const cfg = K.MODES[m];
  f(cfg && cfg.grade === grade && cfg.subject === 'Deutsch' && cfg.worlds === 1, m + ': grade, subject or worlds');
  const mods = Object.keys(cfg.modules); f(mods.length >= 4 && mods.length <= 7, m + ': 4 to 7 task types');
  f(cfg.events.length >= 4, m + ': at least 4 events');
  f(TEXTE.some((t) => t.grade === grade), m + ': no Lesestube texts for its grade');
  let seq = 0; const know = {};
  for (const mod of mods) for (let t = 1; t <= cfg.modules[mod].maxTier; t++) for (let i = 0; i < 300; i++) {
    const q = K.generate(m, mod, t, know, ++seq); const tag = `${m}/${mod}:${t} ${q.qid}`;
    f(q.group === `${mod}:${t}`, tag + ': wrong tier ' + q.group);
    const words = plain(q.q).split(/\s+/).filter((x) => /[a-zäöüß]/i.test(x)).length;
    f(words <= 12, tag + ': question longer than 12 words');
    const texts = q.kind === 'order' ? q.items.map((x) => x.text) : q.options.map(plain);
    f(!K3.test(texts.join('|').replace(/satz/gi, '')), tag + ': ck or tz in the options');
    if (q.kind === 'choice') {
      f(q.options.length >= 2 && q.options.length <= 4, tag + ': 2 to 4 options');
      f(q.options.filter((o) => o === q.answer).length === 1 && new Set(q.options).size === q.options.length, tag + ': not exactly one right option');
      for (const svg of (q.svgOpts ? q.options : []).concat(q.pic ? [q.pic] : []).map((x) => (x.match(/<svg[\s\S]*<\/svg>/) || [])[0]).filter(Boolean)) {
        const doc = parser.parseFromString(svg, 'image/svg+xml'); f(!doc.getElementsByTagName('parsererror').length && !/NaN|undefined/.test(svg), tag + ': broken picture');
      }
      if (q.svgOpts) f(new Set(q.options.map((o) => o.replace(/<span[\s\S]*/, ''))).size === q.options.length, tag + ': two pictures look the same');
    } else f(q.kind === 'order' && q.items.length === (q.group === 'silben:2' ? q.items.length : 4) && q.items.length >= 3, tag + ': unknown task kind or wrong length ' + q.kind);
    if (q.group === 'silben:2') { const w = D.SILBEN_ORDER.find(([x]) => q.qid === 'l1so_' + x);
      f(w && q.order.map((id) => q.items.find((x) => x.id === id).text).join('') === w[0].toUpperCase() && q.display.some((x, j) => x.id !== q.order[j]), tag + ': syllable order'); }
    // Lesen: the shown letter or word is never read aloud – only the question is
    if (q.mod === 'lesen') {
      f(!spoken(cfg, { q: '', pic: q.pic }), tag + ': the shown letter or word is read aloud');
      if (q.tier === 2) f(spoken(cfg, q) === q.q, tag + ': more than the question is read aloud');
    }
    K.record(know, q.qid, Math.random() < 0.7, seq);
  }
}

// pictures and Klasse-1 word lists
for (const [id, p] of Object.entries(D.PICS)) { f(p.syl.replace(/-/g, '') === p.w, 'syllables of ' + id); f(!K3.test(p.w), 'picture word with ck/tz ' + id); }
for (const [id, l, pos] of D.LAUTPOS) {
  const w = D.PICS[id].w.toUpperCase(); const at = [...w].map((c, i) => (c === l ? i : -1)).filter((i) => i >= 0);
  f(at.length === 1 || (at.length === 2 && at[1] === at[0] + 1), `lautpos ${id} ${l}: heard more than once`);
  const want = at[0] === 0 ? 0 : at[at.length - 1] === w.length - 1 ? 2 : 1; f(want === pos, `lautpos ${id} ${l}: position`);
}
for (const [w, syl] of D.SILBEN) f(syl.replace(/-/g, '') === w && syl.split('-').length <= 4, 'silben ' + w);
const rime = (w) => norm(w).match(/[aeiou]+[^aeiou]*(?:e[^aeiou]*)?$/)[0].replace(/h/g, '').replace(/([aeiou])\1/g, '$1');
D.REIME.forEach((g, i) => { f(new Set(g.map(rime)).size === 1, 'rhyme group does not rhyme: ' + g);
  D.REIME.forEach((h, j) => { if (j !== i) f(rime(g[0]) !== rime(h[0]), 'groups rhyme with each other: ' + g[0] + ' ' + h[0]); }); });
for (const pair of D.PIC_REIME) f(pair.every((id) => D.PICS[id]) && D.REIME.some((g) => pair.every((id) => g.includes(D.PICS[id].w))), 'picture rhyme pair ' + pair);

// Lesen: b, d, p, q and g each start their words; Silben ordnen only with different syllables
for (const [x, ws] of Object.entries(D.MIRROR_WORDS)) f(D.MIRROR.includes(x) && ws.length >= 3 && ws.every((w) => w[0] === x && !K3.test(w)), 'mirror words ' + x);
f(D.SILBEN_ORDER.length >= 10 && D.SILBEN_ORDER.every(([, syl]) => syl.split('-').length >= 3), 'Silben ordnen: too few words');

// spelling: the wrong form differs from the right one only where the task is about
const allRight = new Set([].concat(D.BESONDERS, D.DOPPEL, D.ABLEIT).map((x) => x[0]));
const KIND = { st: /^st/i, sp: /^sp/i, nk: /nk/, qu: /qu/i, x: /x/, ie: /ie/, i: /i/ };
D.BESONDERS.forEach(([r, w, k]) => { f(r !== w && !allRight.has(w), 'besonders same or real: ' + r); f(KIND[k].test(r) && (k !== 'i' || !/ie/.test(r)), 'besonders without ' + k + ': ' + r); f(!KIND[k].test(w) || k === 'i', 'besonders wrong form keeps ' + k + ': ' + w); });
// Merkwörter: the mark is in the right form only; no silbentrennendes h (Kl. 3/4) and no wrong form that is a real word
const MARK = { v: [/v/i, /f/i], ß: [/ß/, /s/], h: [/[aeiouäöü]h/i, /^[^h]*$/], vv: [/aa|ee|oo/, /^(?!.*(aa|ee|oo))/], ai: [/ai/, /ei/], chs: [/chs/, /ks/] };
const SILB_H = ['Kuh', 'Schuh', 'Reh', 'Zeh', 'Floh', 'froh', 'früh', 'roh', 'gehen', 'sehen', 'stehen', 'drehen', 'Ruhe', 'Weihnachten'];
D.MERK.forEach(([r, w, k]) => { f(MARK[k] && MARK[k][0].test(r) && !MARK[k][0].test(w) && MARK[k][1].test(w) && !allRight.has(w), 'merkwort ' + r + '/' + w); f(!SILB_H.includes(r) && !K3.test(r + w), 'merkwort Kl. 3/4: ' + r); });
f(new Set(D.MERK.map((x) => x[2])).size === 6, 'merkwörter: v, ß, h, Doppelvokal, ai and chs');
D.DOPPEL.forEach(([r, w]) => { const dbl = /(.)\1/.test(r); f(dbl ? r.replace(/(.)\1/, '$1') === w : w.replace(/(.)\1/, '$1') === r, 'doppel pair ' + r + '/' + w); });
D.VERL.forEach(([w, l]) => f('dtgkbp'.includes(w.slice(-1)) && l.includes('-') && norm(l.replace(/-/g, '')).includes(norm(w).slice(0, -1)), 'verlaengern ' + w));
D.ABLEIT.forEach(([r, w, b]) => f(/ä/i.test(r) && r.replace(/äu/g, 'eu').replace(/Äu/g, 'Eu').replace(/ä/g, 'e').replace(/Ä/g, 'E') === w && /a/i.test(b), 'ableiten ' + r));
D.GROSS.forEach(([s]) => f((s.match(/\[/g) || []).length === 1 && !s.startsWith('[') && /^[A-ZÄÖÜ]/.test(s) && !s.includes(','), 'gross sentence ' + s));
D.SATZZ.forEach(([s, m]) => f('.?!'.includes(m) && !/[.,?!]/.test(s), 'satzzeichen ' + s));
Object.values(D.SATZARTEN).flat().forEach((s) => f(!s.includes(','), 'satzart with a comma ' + s));
// Funktionswörter: Sächsischer Rechtschreibrahmen 2025, S. 27
const FW = 'aber alle alles als am an auch auf aus bei bin bis da danach dann das dem den denn der des die diese dieser doch du durch ein einen eine einem einer einmal er es für ganz haben habe hat hatte hier ich ihn ihr ihre im immer in ins ist ja jetzt mal man mehr mein meine mich mir mit nach nicht noch nun nur oder ohne schon sehr sein seine selbst sich sie sind so über um und uns unter von vor war waren was weg weil welche wenn wie wieder wir wo wollte zu zum zur zwei'.split(' ');
D.KLEIN.forEach(([s, r, w]) => { f((s.match(/___/g) || []).length === 1 && FW.includes(r.toLowerCase()) && r !== w, 'kleine Wörter ' + r); f(new Set(D.KLEIN.map((x) => x[1])).size === D.KLEIN.length, 'kleine Wörter twice'); });
for (const g of Object.values(D.ABC_WORDS)) f(new Set(g.map((w) => w[0])).size === 1 && new Set(g.map((w) => w.slice(0, 2).toLowerCase())).size === g.length && g.every((w) => !/[äöü]/i.test(w.slice(0, 2))), 'abc group ' + g);

// words and sentences
const ARTS = ['der', 'die', 'das'];
D.NOMEN.forEach((n) => f(ARTS.includes(n.split(' ')[0]) && /^[A-ZÄÖÜ]/.test(n.split(' ')[1]), 'nomen ' + n));
D.VERBEN.concat(D.ADJEKTIVE).forEach((w) => f(/^[a-zäöüß]+$/.test(w), 'small word ' + w));
D.VERBFORMEN.forEach(([g, er, du]) => f(g.endsWith('en') && new Set([g, er, du]).size === 3 && du.endsWith('st'), 'verbformen ' + g));
D.MEHRZAHL.forEach(([e, m, a, b]) => f(ARTS.includes(e.split(' ')[0]) && [m, a, b].every((x) => x.startsWith('die ')) && new Set([m, a, b]).size === 3, 'mehrzahl ' + e));
D.ZUSAMMEN.forEach(([a, b, z]) => { const n = (x) => x.split(' ')[1]; f(n(z) === n(a) + n(b).toLowerCase() && z.split(' ')[0] === b.split(' ')[0], 'zusammengesetzt ohne Fuge ' + z); });
D.FAMILIEN.forEach(([stem, w, fam, other]) => { f(fam.length >= 3 && fam.every((x) => norm(x).includes(stem)) && norm(w).includes(stem), 'wortfamilie ' + w); f(other.every((x) => !norm(x).includes(stem)), 'wortfamilie distractor has the stem ' + w); });
D.VS_WORDS.forEach(([w, v]) => f(w.startsWith(v) && w.length > v.length + 3, 'vorsilbe ' + w));
const fw = Object.values(D.WORTFELDER).flat(); f(new Set(fw).size === fw.length, 'a word in two Wortfelder');
for (const list of [D.BESONDERS, D.MERK, D.DOPPEL, D.VERL, D.ABLEIT, D.GROSS, D.SATZZ, D.KLEIN, D.MEHRZAHL, D.ZUSAMMEN, D.VS_WORDS, D.REIME, D.SILBEN])
  list.flat(2).filter((x) => typeof x === 'string').forEach((x) => f(!K3.test(x), 'Klasse-3 spelling (ck/tz) in a word list: ' + x));
[D.NOMEN, D.VERBEN, D.ADJEKTIVE, fw, Object.values(D.ABC_WORDS).flat(), D.FAMILIEN.flat(2)].flat().forEach((x) => f(!K3.test(x), 'ck/tz in a word list: ' + x));

// Lesestube: enough short texts, and the right answer is found in the text
for (const [g, n] of [[1, 6], [2, 8]]) f(TEXTE.filter((t) => t.grade === g).length >= n, `Lesestube: fewer than ${n} texts for grade ${g}`);
// poems: the author is in by, Strophen and Verse are counted from the text
TEXTE.filter((t) => t.grade).forEach((t) => t.qs.forEach((q, i) => {
  const right = q.o[q.a]; const stanzas = t.text.split('\n\n').map((x) => x.split('\n').length);
  if (/Verse/.test(q.q)) f(t.kind === 'Gedicht' && new Set(stanzas).size === 1 && parseInt(right, 10) === stanzas[0], `Lesestube ${t.id} q${i}: number of Verse`);
  else if (/Strophen/.test(q.q)) f(t.kind === 'Gedicht' && parseInt(right, 10) === stanzas.length, `Lesestube ${t.id} q${i}: number of Strophen`);
  else { const words = right.toLowerCase().replace(/[.,]/g, '').split(' ').filter((w) => w.length >= 3);
    f(words.some((w) => (t.text + ' ' + (t.by || '')).toLowerCase().includes(w)), `Lesestube ${t.id} q${i}: answer not in the text`); }
}));
f(TEXTE.filter((t) => t.grade === 2 && t.kind === 'Gedicht').length >= 2, 'Lesestube: fewer than 2 poems for grade 2');

console.log('k12 deutsch fails', fails.length, [...new Set(fails)].slice(0, 30));
if (fails.length) process.exit(1);
