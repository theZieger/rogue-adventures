const { JSDOM } = require('jsdom');
const JM = require('./jm_solver.js');
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname,'../docs/index.html'),'utf8');
// Seeded randomness (game and bot), so a failing run can be reproduced: SEED=123 node tests/playtest.js
const SEED=+(process.env.SEED||20261108);
// W3=1: continue a Zahlenquest adventure in world 3 whose hero has the written methods as attacks (W3ATK=kopf,ueber,… picks others)
const W3=process.env.W3==='1';
// OFF=a,b: these task types are switched off in the parent area, so the hero fights with the others
const OFF=process.env.OFF||'';
const w3run=()=>{ const MQ=require('../src/logic.js'); return JSON.stringify({ mode:'math', world:3, floor:1, map:MQ.makeMap(), hero:{ id:'fuchs', evo:2, level:9, xp:0, hp:150, maxHp:150, attacks:(process.env.W3ATK||'sadd,ssub,smul,bruch').split(',').map(mod=>({name:MQ.EXTRA_ATTACKS[mod],mod})) }, items:['trank'], tiers:Object.fromEntries(MQ.MODULE_KEYS.map(k=>[k,1])), path:[], shield:false }); };
function prng(seed){ let a=seed|0; return ()=>{ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
Math.random=prng(SEED+1);
// a fixed day too: 2026-W52 has the weekly boss in Zahlenquest as its maths goal (the seed can also pick Die Baustelle), so the bot can finish a goal in a math run
const NOW=Date.parse(process.env.NOW||'2026-12-23T10:00:00');
// Fake time: the game's battle pauses (up to ~2 s) and the bot's waits run 100× faster; TIME=1 plays in real time.
const TIME=+(process.env.TIME||0.01);
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/', beforeParse(win){ win.Math.random=prng(SEED); const st=win.setTimeout; win.setTimeout=(fn,ms,...a)=>st.call(win,fn,(ms||0)*TIME,...a); const D=win.Date; win.Date=class extends D { constructor(...a){ super(...(a.length?a:[NOW])); } static now(){ return NOW; } }; if(W3) win.localStorage.setItem('mathquest_run_v1', w3run()); if(OFF) win.localStorage.setItem('mathquest_meta_v2', JSON.stringify({ off: { [process.env.MODE]: OFF.split(',') } })); } });
let runNo=0; // each run picks the next starter, so all monsters (and their attacks) get played
const w = dom.window, d = w.document;
let gradeTry=0; // a unit of another Klasse: try the grade tabs until its subject shows
const RUNS=+(process.env.RUNS||2); const ACC=+(process.env.ACC||0.85); const errors=[]; w.addEventListener('error', e=>errors.push(e.message));
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms*TIME));
const $ = (s)=>d.querySelector(s); const $$=(s,root=d)=>[...root.querySelectorAll(s)];
// drawn icons count as their emoji again
const text = ()=>{ const c=$('#app').cloneNode(true); c.querySelectorAll('svg.emo').forEach(s=>s.replaceWith(s.getAttribute('aria-label'))); return c.textContent.replace(/\s+/g,' ').trim(); };
function click(el){ if(!el) throw new Error('no element to click: '+text().slice(0,200)); if(typeof el.click==='function') el.click(); else el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); }
let weekbossFights=0, correctAnswers=0, wrongAnswers=0, tutorialsSeen=0, battles=0, events=0, dilemmas=0, consequences=0, rests=0, treasures=0, eliteRewards=0, labs=0, maps=0, markets=0, bought=0, mines=0, arenas=0;
const cents=(x)=>{ const m=x.trim().match(/^(?:(\d+) €)?(?: ?(\d+) ct)?$/); if(!m) throw new Error('not money: '+x); return (+(m[1]||0))*100+(+(m[2]||0)); };
async function closeModal(){ const ov=$('.overlay'); if(ov){ const b=ov.querySelector('#tutok'); if(b){ tutorialsSeen++; click(b); return true;} } return false; }
let colTasks=0, readNodes=0, schools=0, crafted=false, fromPantry=false;
// written methods: work result and carries out column by column from the numbers on screen
async function solveColumns(forceWrong){
  const label=$('.colcalc').getAttribute('aria-label'); const m=label.match(/^(\d+) ([+−·]) (\d+)(?: \+ (\d+))?$/); if(!m) throw new Error('column task not parsed '+label);
  const rows=[+m[1],+m[3]].concat(m[4]?[+m[4]]:[]); const add=m[2]==='+', mul=m[2]==='·'; const res=add?rows.reduce((a,b)=>a+b):mul?rows[0]*rows[1]:rows[0]-rows[1];
  const w=$$('.colcalc .inp.dig').length; const dig=(n,i)=>Math.floor(n/10**(w-1-i))%10; const carry=Array(w).fill(0);
  for(let i=w-1;i>0;i--) carry[i-1]=add?Math.floor((rows.reduce((s,n)=>s+dig(n,i),0)+carry[i])/10):mul?Math.floor((dig(rows[0],i)*rows[1]+carry[i])/10):(dig(rows[0],i)<dig(rows[1],i)+carry[i]?1:0);
  const type=(i,ch)=>{ click($('.colcalc .inp[data-i="'+i+'"]')); click($('.numpad [data-k="'+ch+'"]')); };
  carry.forEach((c,i)=>{ if(c) type(w+i,c); });
  const s=String(forceWrong?res+1:res); [...s].forEach((ch,k)=>type(w-s.length+k,ch));
  click($('.numpad [data-k="ok"]'));
  const fb=$('.feedback'); if(!fb) throw new Error('no feedback after column task');
  const good=fb.classList.contains('good'); if(good===!!forceWrong) throw new Error('column task judged wrongly: '+label+' = '+s);
  if($$('.colcalc .inp.carry.bad').length) throw new Error('bot carries marked wrong: '+label);
  colTasks++; if(good) correctAnswers++; else wrongAnswers++; click($('#next')); return true;
}
// Englisch, worked out by the bot itself: number words, days and months
const EN_ONES=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const EN_TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
const EN_DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const EN_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
function enNumber(s){ if(s==='one hundred') return 100; const [t,o]=s.split('-'); const n=EN_ONES.indexOf(t)>0?EN_ONES.indexOf(t):EN_TENS.indexOf(t)*10+(o?EN_ONES.indexOf(o):0); if(!(n>0)) throw new Error('unknown number word '+s); return n; }
async function solveTask(forceWrong){
  const inps=$$('.inp'); if(!inps.length) return false;
  if($('.colcalc')) return solveColumns(forceWrong);
  const task=$('.task'); const t=task.textContent;
  let answers=null;
  const expr=$('.expr'); const M=w.eval('MQ'); const T=w.__task;
  // Baustelle: recount from the task data (plan heights, squares of the shape)
  if(T&&T.area) answers=[T.area.length];
  else if(T&&T.plan){ const n=T.plan.flat().reduce((a,b)=>a+b,0); answers=[T.full?T.plan.length*T.plan[0].length*T.full-n:n]; }
  else if(T&&T.beats) answers=[T.beats.reduce((a,b)=>a+b,0)/T.unit]; // Konzertsaal: note values in eighths, counted in the asked unit
  else if(T&&T.cells){ const at=new Set(T.cells.map(p=>p.join())); answers=[T.cells.reduce((n,[r,c])=>n+[[r+1,c],[r-1,c],[r,c+1],[r,c-1]].filter(q=>!at.has(q.join())).length,0)]; }
  else if(T&&T.k12) answers=T.answers; // Klasse 1/2 Mathe: tests/test_k12_mathe.js recomputes these from the pictures
  else if($('.story')){ const n=$('.story').textContent.match(/\d+/g).map(Number); answers=[n[0]*n[1]]; } // Werkbank: a · b from the text
  else if($('.jm')) answers=JM.solve(task.innerHTML, null, w.eval('MJ').REF);
  else if($('.numword')){ const wd=$('.numword').textContent; const n=[...Array(1000).keys()].find(k=>k&&M.numWord(k)===wd); if(!n) throw new Error('unknown number word '+wd); answers=[n]; }
  else if($('svg.mauer')){ const v=$$('svg.mauer [data-v]').map(g=>g.dataset.v); const k=v.indexOf('?'); const n=v.map(Number);
    // Zahlenmauer: bottom 0–2, middle 3–4, top 5; Rechendreieck: inner 0–2, outer 3 = 0+1, 4 = 1+2, 5 = 0+2
    const rules=$('svg.mauer [data-tri]')?[[3,0,1],[4,1,2],[5,0,2]]:[[3,0,1],[4,1,2],[5,3,4]]; const r=rules.find(x=>x.includes(k)); answers=[r[0]===k?n[r[1]]+n[r[2]]:n[r[0]]-n[r[1]===k?r[2]:r[1]]]; }
  else if(expr){ const s=expr.textContent; let m;
    const FR={'½':[1,2],'¼':[1,4],'¾':[3,4],'⅓':[1,3]}, UNIT={'m cm':100,'h min':60,'kg g':1000,'km m':1000}, dot=(a,o,b)=>o==='·'?a*b:a/b;
    if(m=s.match(/^(\d+) ([+−·:]) (\d+) ([+−·:]) (\d+) = \?$/)){ const pt=(o)=>'·:'.includes(o); const [a,b,c]=[+m[1],+m[3],+m[5]]; answers=[pt(m[2])?(m[4]==='+'?dot(a,m[2],b)+c:dot(a,m[2],b)-c):(m[2]==='+'?a+dot(b,m[4],c):a-dot(b,m[4],c))]; }
    else if(m=s.match(/^([½¼¾⅓]) von (\d+) = \?$/)) answers=[+m[2]/FR[m[1]][1]*FR[m[1]][0]];
    else if(m=s.match(/^([½¼¾]) (\w+) = \? (\w+)$/)) answers=[UNIT[m[2]+' '+m[3]]/FR[m[1]][1]*FR[m[1]][0]];
    else if(/^(\d [HZE] ?){3}= \?$/.test(s)){ const g=(u)=>+s.match(new RegExp('(\\d) '+u))[1]; answers=[100*g('H')+10*g('Z')+g('E')]; }
    else if(/€|ct/.test(s)){ const v=s.includes(' − ')?s.split(' − ').map(cents).reduce((a,b)=>a-b):s.split(' + ').map(cents).reduce((a,b)=>a+b); answers=[Math.floor(v/100),v%100]; }
    else if(m=s.match(/^(\d+) \+ (\d+)(?: \+ (\d+))? = \?$/)) answers=[+m[1]+ +m[2]+(m[3]?+m[3]:0)];
    else if(m=s.match(/^(\d+) − (\d+) = \?$/)) answers=[+m[1]-m[2]];
    else if(m=s.match(/^(\d+) − \? = (\d+)$/)) answers=[+m[1]-m[2]];
    else if(m=s.match(/^(\d+) \+ \? = (\d+)$/)) answers=[+m[2]-m[1]];
    else if(m=s.match(/^(\d+) · (\d+) = \?$/)) answers=[+m[1]*m[2]];
    else if(m=s.match(/^\? · (\d+) = (\d+)$/)||s.match(/^(\d+) · \? = (\d+)$/)) answers=[+m[2]/m[1]];
    else if(m=s.match(/^(\d+) : (\d+) = \?$/)) answers=inps.length===2?[Math.floor(m[1]/m[2]),m[1]%m[2]]:[+m[1]/m[2]];
    else if(/^[a-z -]+$/.test(s)) answers=[enNumber(s)]; // Englisch: number word to digits
    else if(/^\d+$/.test(s)){ const n=+s, ask=$('.prompt').textContent;
      if(ask.includes('Runde')){ const to=ask.includes('Hunderter')?100:10; answers=[Math.round(n/to)*to]; }
      else if(ask.includes('Verdopple')) answers=[2*n]; else if(ask.includes('Quersumme')) answers=[[...s].reduce((a,c)=>a+ +c,0)]; else if(ask.includes('Halbiere')) answers=[n/2]; }
  } else if($('.clues')){ const clues=$$('.clues div').map(x=>x.textContent); const dg=M.digits; const res=[];
    for(let x=10;x<=999;x++){ const dd=dg(x); if(clues.join('').includes('Hunderter')? x<100 : x>=100) continue; let ok=true; for(const c of clues){ let m;
      if(m=c.match(/Einer ist (\d+)-mal so groß wie mein Zehner/)) ok=ok&&dd.z>0&&dd.e===+m[1]*dd.z;
      else if(m=c.match(/Zehner ist (\d+)-mal so groß wie mein Hunderter/)) ok=ok&&dd.h>0&&dd.z===+m[1]*dd.h;
      else if(m=c.match(/Einer ist um (\d+) größer als mein Zehner/)) ok=ok&&dd.e-dd.z===+m[1];
      else if(m=c.match(/Einer ist um (\d+) kleiner als mein Zehner/)) ok=ok&&dd.z-dd.e===+m[1];
      else if(m=c.match(/Hunderter ist um (\d+) kleiner als mein Zehner/)) ok=ok&&dd.z-dd.h===+m[1];
      else if(m=c.match(/Hunderter ist um (\d+) größer als mein Zehner/)) ok=ok&&dd.h-dd.z===+m[1];
      else if(m=c.match(/Hunderter ist (\d+)\./)) ok=ok&&dd.h===+m[1];
      else if(m=c.match(/Zehner ist (\d+)\./)) ok=ok&&dd.z===+m[1];
      else if(m=c.match(/Einer ist (\d+)\./)) ok=ok&&dd.e===+m[1];
      else if(m=c.match(/Quersumme ist (\d+)/)) ok=ok&&(dd.h+dd.z+dd.e)===+m[1];
      else if(c.includes('gleich')) ok=ok&&dd.e===dd.z;
      else if(c.includes('gerade Zahl')) ok=ok&&(dd.e%2===(c.includes('ungerade')?1:0));
      else throw new Error('unknown clue '+c);
    } if(ok) res.push(x);} if(res.length!==1) throw new Error('riddle not unique '+clues+' '+res); answers=res;
  } else if($('.seq')){ const s=$('.seq').textContent.match(/-?\d+/g).map(Number); const d1=s[1]-s[0], d2=s[2]-s[1]; const out=[]; let last=s[3]; for(let i=4;i<7;i++){ last+= (d1===d2)? d1 : (i%2===1?d1:d2); out.push(last);} answers=out; }
  else if($('.nbline')){ const n=+$('.nbline .mid').textContent; const kind=t.includes('Hunderterzahl')?100:10; const lo=Math.floor(n/kind)*kind; answers=[lo,lo+kind]; }
  else if($('.grid')){ const cells=$$('.grid div'); const si=cells.findIndex(c=>c.classList.contains('start')), ti=cells.findIndex(c=>c.classList.contains('target')); const base=+cells[si].textContent; const leg=$('.legend'); const stepR=+leg.dataset.stepR, stepD=+leg.dataset.stepD; const sr=Math.floor(si/3), sc=si%3, tr=Math.floor(ti/3), tc=ti%3; answers=[base+(tr-sr)*stepD+(tc-sc)*stepR]; }
  if(!answers) throw new Error('could not parse task: '+t);
  if(forceWrong) answers=answers.map(a=>a+1);
  for(let i=0;i<answers.length;i++){ click(inps[i]); for(const ch of String(answers[i])){ click($(`.numpad [data-k="${ch}"]`)); } click($('.numpad [data-k="ok"]')); }
  const fb=$('.feedback'); if(!fb) throw new Error('no feedback after submit');
  const good=fb.classList.contains('good'); if(forceWrong && good) throw new Error('wrong answer marked good'); if(!forceWrong && !good) throw new Error('correct answer marked bad: '+$('.task').innerHTML+' gave '+answers);
  if(good) correctAnswers++; else wrongAnswers++;
  click($('#next')); return true;
}
// Zahlenquest choices (Teilbarkeit, Stellenwerte): worked out from the question and the buttons on screen
function mathChoice(t){ const q=$('.question').textContent, opts=$$('.opt').map(b=>b.textContent); let m, a=null;
  if(m=q.match(/^Ist (\d+) durch (\d+) teilbar\?$/)) a=+m[1]%+m[2]===0?'ja':'nein';
  else if(m=q.match(/^Welche Zahl ist durch (\d+) teilbar\?$/)) a=opts.find(o=>+o%+m[1]===0);
  else if(m=q.match(/^Setze ein: <, > oder =\. (.+) _+ (\d+)$/)){ const d=m[1].match(/\d+/g).map(Number); const x=d.length===3?100*d[0]+10*d[1]+d[2]:d[0]; a=x<+m[2]?'<':x>+m[2]?'>':'='; }
  else if(m=q.match(/^Welches Ergebnis kann stimmen\? (\d+) ([+−]) (\d+) = _+$/)){ const r=(n)=>Math.round(n/100)*100; const est=m[2]==='+'?r(+m[1])+r(+m[3]):r(+m[1])-r(+m[3]); a=opts.slice().sort((x,y)=>Math.abs(x-est)-Math.abs(y-est))[0]; }
  else if(m=q.match(/^(\d+) = \? H \? Z \? E$/)) a=opts.find(o=>{ const d=o.match(/\d+/g).map(Number); return 100*d[0]+10*d[1]+d[2]===+m[1]; });
  else return null;
  if(a!==t.answer) throw new Error('bot and game disagree on '+q); return a; }
async function solveKnow(forceWrong){
  const t=w.__task; if(!t) throw new Error('no task');
  if(t.kind==='choice'||t.kind==='parts'){ const opts=$$('.opt'); let idx=t.options.indexOf($('.jm')?JM.solve($('.task').innerHTML, t.options, w.eval('MJ').REF):mathChoice(t)||t.answer); if(idx<0) throw new Error('choice not solvable: '+$('.task').textContent); if(forceWrong) idx=opts.findIndex((o,i)=>i!==idx&&!o.disabled); click(opts[idx]); }
  else if(t.kind==='parts-find'){ const parts=$$('.plant [data-part]'); let el=parts.find(x=>x.dataset.part===t.part); if(forceWrong) el=parts.find(x=>x.dataset.part!==t.part); click(el); }
  else if(t.kind==='karte'){ let cell=t.target.join('-'); if(forceWrong) cell=$$('[data-cell]').map(x=>x.dataset.cell).find(c=>c!==cell); click($('[data-cell="'+cell+'"]')); }
  else if(t.kind==='order'){ let order=t.order.slice();
    // Deutsch: work the order out from what is on screen, not from the task object
    const shown=$$('.oitem').map(b=>({id:b.dataset.id,text:b.textContent.trim()}));
    if(t.mod==='vergl'){ const up=t.q.includes('kleinste'); order=shown.slice().sort((a,b)=>up?a.text-b.text:b.text-a.text).map(x=>x.id); }
    if(t.mod==='abc') order=shown.slice().sort((a,b)=>a.text.slice(0,3).toLowerCase()<b.text.slice(0,3).toLowerCase()?-1:1).map(x=>x.id);
    if(t.mod==='umstell'){ const sentence=$('.question').textContent.match(/„(.+)\.“/)[1].toLowerCase(); const parts=shown.slice().sort((a,b)=>sentence.indexOf(a.text.toLowerCase())-sentence.indexOf(b.text.toLowerCase())); order=[parts[2],parts[1],parts[0]].map(x=>x.id); }
    if(t.mod==='reihe'){ const cal=EN_DAYS.concat(EN_MONTHS); order=shown.slice().sort((a,b)=>cal.indexOf(a.text)-cal.indexOf(b.text)).map(x=>x.id); }
    if(order.join()!==t.order.join()) throw new Error('bot and game disagree on '+t.qid); if(forceWrong) order=order.slice(0,-2).concat([order[order.length-1],order[order.length-2]]); /* the last two: an Eselsbrücke may fix the first */ for(const id of order){ click($('.oitem[data-id="'+id+'"]')); } if($('#ocheck').disabled) throw new Error('check disabled'); click($('#ocheck')); }
  const fb=$('.feedback'); if(!fb) throw new Error('no feedback (know) '+t.kind);
  const good=fb.classList.contains('good'); if(forceWrong&&good) throw new Error('wrong marked good '+t.kind); if(!forceWrong&&!good) throw new Error('correct marked bad '+t.kind+' '+JSON.stringify(t));
  if(good) correctAnswers++; else wrongAnswers++; click($('#next'));
}
// market: buy exactly one affordable thing, then leave; in world 2+ mostly overpay to get the change task
async function shop(){
  const sold=$$('.offer.sold').length; const purse=+$('#purse').dataset.cents;
  if(sold>1) throw new Error('bot bought more than one thing');
  const offer=$$('.offer:not(.sold)').find(o=>+o.dataset.price<=purse);
  if(sold||!offer){ markets++; bought+=sold; click($('#leave')); return; }
  click(offer); const price=+offer.dataset.price; const tier=+$('.market').dataset.tier;
  const coins=()=>$$('.coins .coin:not([disabled])').map(b=>+b.dataset.v);
  const big=coins().filter(v=>v>price).pop();
  if(tier>=2&&big&&Math.random()<0.7) click($(`.coins .coin[data-v="${big}"]`));
  else { let rest=price; for(const v of [1000,500,200,100,50,20,10,5,2,1]) while(v<=rest&&coins().includes(v)){ click($(`.coins .coin[data-v="${v}"]`)); rest-=v; } if(rest) throw new Error('could not pay '+price+' from '+purse); }
  click($('#pay'));
}
// Turmwacht (MODE=turm, GRADE=2|3, SUBJECTS=Mathe,Deutsch: default = the pre-selected ones): plays through the real screens.
// NAIVE=1 plays like a child who taps any monster (a mild pull towards 🎯 and the gate), buys cards in a random order,
// ignores Schild and Chilischote and drinks a potion only when the tower is below a third
const TURM=process.env.MODE==='turm', NAIVE=!!process.env.NAIVE;
const anyOf=(a)=>a[Math.floor(Math.random()*a.length)];
const turmRuns=[]; let turmAt=null, turmPotions=0, turmSeen={}; const turmBuys={};
const turmRun=()=>{ const r=w.__mq.run; return r&&r.mode==='turm'?r:null; };
const turmQ=(r)=>Object.values(r.turm.score).reduce((a,x)=>a+x.t,0);
// questions per attempt (a retry starts a new one) and the monster types seen per path, for the guards' looks
const turmMax=(r)=>{ turmAt.max=Math.max(turmAt.max, turmQ(r)-turmAt.start); turmAt.r=r; };
function turmWatch(){ const r=turmRun(); if(!r||!turmAt) return; turmMax(r);
  for(const x of r.turm.monsters) if(x.cell===5){ const s=turmSeen[x.lane]=turmSeen[x.lane]||{}; s[x.type]=(s[x.type]||0)+1; }
  const said=$$('.tw-log, #bottom, .topbar, .tw-hpbox').map(e=>e.textContent).join(' '); if(/\d,\d/.test(said)) throw new Error('comma number on screen: '+said.slice(0,200)); }
const TW_BEATS={ feuer:'pflanze', pflanze:'wasser', wasser:'feuer' }, TW_TYPE={ Feuer:'feuer', Wasser:'wasser', Pflanze:'pflanze' };
const bagItem=(re)=>{ click($('#bag')); const it=$$('.overlay .item').find(b=>re.test(b.getAttribute('aria-label'))); if(it) click(it); if($('.overlay #close')) click($('.overlay #close')); return !!it; };
const buyCard=(c)=>{ click(c); const b=$('.overlay #build'); if(b) click(b); };
const twBought=(k)=>{ turmBuys[k]=(turmBuys[k]||0)+1; };
// Bauzeit, one purchase per call: repair when low, the free guard, guards on the busiest path, floors, upgrades; then the next wave
function turmNaiveShop(r){
  if(r.hero.hp<r.hero.maxHp/3&&r.items.includes('trank')&&bagItem(/^Trank/)){ turmPotions++; return; }
  const c=anyOf($$('[data-card]').filter(b=>b.getAttribute('aria-disabled')==='false'));
  if(!c){ click($('#nextwave')); return; }
  const id=c.dataset.card; buyCard(c);
  if(id==='guard'||id==='up'){ const sp=anyOf($$('button.tw-spot.pick')); if(!sp){ click($('#pickno')); click($('#nextwave')); return; } click(sp); if(id==='guard') click(anyOf($$('.overlay .tw-look'))); }
  twBought(id.split(':')[0]);
}
function turmShop(r){
  if(NAIVE) return turmNaiveShop(r);
  const t=r.turm, L=t.lanes.length, card=(id)=>$(`[data-card="${id}"]`), ok=(id)=>!!card(id)&&card(id).getAttribute('aria-disabled')==='false';
  const coming=[...Array(L).keys()].map(l=>{ const c=$(`.tw-lane[data-lane="${l}"] .tw-coming`); return c?parseInt(c.textContent,10):0; });
  const busy=[...Array(L).keys()].sort((a,b)=>coming[b]-coming[a]||a-b);
  if(r.hero.hp<=30&&r.items.includes('trank')&&bagItem(/^Trank/)){ turmPotions++; return; }
  if(r.hero.hp<=r.hero.maxHp/2&&ok('fix')){ buyCard(card('fix')); twBought('fix'); return; }
  const spot=busy.filter(l=>coming[l]).flatMap(l=>[0,1].map(s=>[l,s])).find(([l,s])=>!t.guards[l+':'+s]);
  if(spot&&ok('guard')){ const [l,s]=spot; buyCard(card('guard')); click($(`button.tw-spot[data-lane="${l}"][data-spot="${s}"]`));
    // the look whose type beats most of the monsters seen on this path
    const seen=turmSeen[l]||{}, score=(b)=>seen[TW_BEATS[TW_TYPE[{ Glutfuchs:'Feuer', Wellenkröte:'Wasser', Moosbär:'Pflanze' }[b.textContent.trim()]]]]||0;
    click($$('.overlay .tw-look').slice(0,3).sort((a,b)=>score(b)-score(a))[0]); if(!r.turm.guards[l+':'+s]) throw new Error('guard not placed'); twBought('guard'); return; }
  const fl=busy.map(l=>'floor:'+t.lanes[l].subject).find(ok);
  if(fl){ buyCard(card(fl)); twBought('floor'); return; }
  const up=busy.flatMap(l=>[0,1].map(s=>[l,s])).find(([l,s])=>{ const g=t.guards[l+':'+s]; return g&&g.lvl<3&&w.__mq.turm.TW.COST.up[g.lvl-1]<=t.ziegel; });
  if(up&&ok('up')){ const [l,s]=up, k=l+':'+s, lvl=t.guards[k].lvl; buyCard(card('up')); click($(`button.tw-spot[data-lane="${l}"][data-spot="${s}"]`)); if(r.turm.guards[k].lvl!==lvl+1) throw new Error('upgrade failed'); twBought('up'); return; }
  click($('#nextwave'));
}
function turmDone(){ const e=turmAt.r; if(turmRuns.includes(turmAt)) return; turmMax(e);
  Object.assign(turmAt,{ won:e.turm.phase==='won', best:e.turm.best, retries:e.turm.cpUsed, q:turmQ(e), score:JSON.parse(JSON.stringify(e.turm.score)), subjects:[...new Set(e.turm.lanes.map(l=>l.subject))], grade:e.grade }); turmRuns.push(turmAt); }
// one action per call; the board is checked first and the screens are told apart by one class each (queries on the big board are slow in jsdom)
async function turmBot(){
  const ov=$('.overlay');
  if(ov){ const it=$$('.tw-item[data-r]',ov); if(it.length){ click(NAIVE?anyOf(it):it.find(b=>b.textContent.includes('Schild'))||it[0]); return true; }
    const c=ov.querySelector('#close, #no'); if(c){ click(c); return true; } return false; }
  const board=$('.tw-screen'), r=turmRun();
  if(board){
    turmWatch();
    if(board.classList.contains('tasking')){
      if($('.inp')){ await solveTask(Math.random()>ACC); return true; }
      if($('.opt, .oitem, .plant.clickable, .kmap.clickable')){ await solveKnow(Math.random()>ACC); return true; }
      return false; }
    if($('#twon')){ click($('#twon')); return true; }
    if(board.classList.contains('build')){ if($('.tw-pickhint')) click($('#pickno')); else turmShop(r); return true; }
    if(r.turm.phase!=='choose') return false;
    if(r.hero.hp<r.hero.maxHp/3&&r.items.some(i=>i==='trank'||i==='grosstrank')&&bagItem(/Trank/)){ turmPotions++; return true; }
    if(!NAIVE&&!r.shield&&r.items.includes('schild')&&r.turm.monsters.some(x=>x.cell===1)&&bagItem(/^Schild/)) return true;
    // 🎯 first, else the monster closest to the gate that can be attacked
    const ms=$$('button.tw-mon:not(.guarded)'), cell=(b)=>+b.closest('.tw-cell').dataset.cell;
    const pull=(b)=>1+(b.classList.contains('weak')?1:0)+(cell(b)===1?1:0), weighted=ms.flatMap(b=>Array(pull(b)).fill(b));
    const x=NAIVE?anyOf(weighted):ms.find(b=>b.classList.contains('weak'))||ms.sort((a,b)=>cell(a)-cell(b))[0];
    if(!x) throw new Error('no monster to attack: '+text().slice(0,200));
    click(x); const atk=$('#atk'); if(!atk||atk.disabled) throw new Error('cannot attack '+x.getAttribute('aria-label')); click(atk); return true; }
  // a finished run (end screen, or the title when the fake clock let a late history „back“ through first): the main loop
  // counts it and taps „Neue Turmwacht“ if it is there
  const was=turmAt&&turmAt.r; if(was&&!turmRuns.includes(turmAt)&&(was.turm.phase==='won'||(was.turm.phase==='fallen'&&!w.__mq.turm.TW.canRetry(was)))){ turmDone(); return 'end'; }
  if(!w.__mq.meta.turm.on&&$('#logo')){ w.__mq.meta.turm.on=true; w.__mq.screenTitle(); return true; } // off by default: parents switch it on
  if($('#turm')){ const g=process.env.GRADE&&$(`.gradechip[data-grade="${process.env.GRADE}"]`); if(g&&!g.classList.contains('on')){ click(g); return true; } click($('#turm')); return true; }
  if($('.tw-saved')){ click($('#cont')); return true; }
  if($('.tw-heroes')){
    if(process.env.SUBJECTS){ const want=process.env.SUBJECTS.split(','), bs=()=>$$('button[data-subj]');
      for(const b of bs()) if(b.classList.contains('on')&&!want.includes(b.dataset.subj)) click(b);
      for(const s of want){ const b=bs().find(x=>x.dataset.subj===s); if(!b) throw new Error('no subject '+s+' on the Turmwacht start screen'); if(!b.classList.contains('on')) click(b); } }
    const hs=$$('[data-h]'); click(hs[runNo%hs.length]); click($('#go')); turmAt={ start:0, max:0, falls:[] }; turmSeen={}; return true; }
  if(r&&turmAt) turmMax(r);
  if($('#retry')){ turmAt.start=turmQ(r); turmAt.falls.push(r.turm.wave); click($('#retry')); return true; }
  const b=$('#tobuild')||$('#pick'); if(b){ click(b); return true; }
  return false;
}
async function step(){
  if(await closeModal()) return;
  if($('#later')){ click($('#later')); return; }
  if(TURM){ const t=await turmBot(); if(t) return t; }
  const tx=text();
  // once per playtest: build a Schild at the Werkbank (materials seeded) and look into the hut; the Schild must come along into the adventure
  if($('[data-sub]')&&!crafted){ crafted=true; const m=w.__mq.meta; m.materials=Object.assign({holz:2,erz:1},m.materials);
    click($('#stamps')); click($('[data-craft="schild"]')); await solveTask(false); if(!text().includes('Gebaut: Schild')) throw new Error('Werkbank did not build: '+text().slice(0,200)); click($('#next')); click($('#back'));
    click($('#hut')); if(!$('svg.hutroom')) throw new Error('hut did not open'); click($('#back')); return; }
  if($('[data-sub]')&&!$('.wmap')) { const sub=w.__mq.subjectOf(process.env.MODE||'math'); if(!sub){ const g=$$('.gradechip'); click(g[gradeTry++%g.length]); return; } click($$('[data-sub]').find(b=>b.textContent.includes(sub.subject))); return; }
  if($('[data-new]')&&!$('.choice')&&!$('.wmap')) { const m=process.env.MODE||'math'; const c=$('[data-cont="'+m+'"]'); if(c){click(c);return;} click($('[data-new="'+m+'"]')); const y=$('.overlay #yes'); if(y) click(y); return; }
  if($('#go')&&$('.choice[data-id]')){ const ch=$$('.choice[data-id]'); click(ch[runNo%ch.length]); click($('#go')); if(!fromPantry){ fromPantry=true; if(!w.__mq.run.items.includes('schild')||w.__mq.meta.pantry.length) throw new Error('pantry not taken into the adventure'); } return; }
  if($('.node.open')){ const nodes=$$('.node.open');
    const special=nodes.find(n=>['Forscherlabor','Sinnestäuschung','Schatzkarte'].includes(n.getAttribute('aria-label'))); if(special){ if(special.getAttribute('aria-label')!=='Schatzkarte') labs++; else maps++; click(special); return; }
    // steer towards a Forscherlabor/Schatzkarte/Bergwerk or the Kreisel-Arena further up, so the bot plays them whatever the seed –
    // never at the cost of the weekly boss or the Lesestube; in even worlds the arena goes first, as it often shares floors with the Bergwerk
    { const r=w.__mq.run; const reach=(ts,f,i)=>{ const nd=r.map[f]&&r.map[f][i]; return !!nd&&(ts.includes(nd.t)||nd.n.some(j=>reach(ts,f+1,j))); };
      let pool=nodes; for(const t of ['lesen','weekboss']){ const k=pool.filter(n=>reach([t],r.floor-1,+n.dataset.n)); if(k.length) pool=k; }
      const goals=[['labor','taeusch','karte','bergwerk'],['arena']]; if(r.world%2===0) goals.reverse();
      for(const ts of goals){ const ways=pool.filter(n=>reach(ts,r.floor-1,+n.dataset.n)); const way=ways.find(n=>n.classList.contains('markt'))||ways[0];
        if(way){ if(way.classList.contains('weekboss')) weekbossFights++; if(way.classList.contains('lesen')) readNodes++; click(way); return; } } }
    // head for the Lesestube and the weekly boss when the path can still reach them; the market only when it lies on that way
    { const r=w.__mq.run; const reach=(t,f,i)=>r.map[f][i].t===t||r.map[f][i].n.some(j=>r.map[f+1]&&r.map[f+1][j]&&reach(t,f+1,j));
      const leads=(t)=>nodes.filter(n=>reach(t,r.floor-1,+n.dataset.n)); const toRead=leads('lesen'), toBoss=leads('weekboss');
      const both=toRead.filter(n=>toBoss.includes(n)); const ways=both.length?both:toRead.length?toRead:toBoss;
      const mk=nodes.find(n=>n.getAttribute('aria-label')==='Markt'); if(mk&&(!ways.length||ways.includes(mk))){ click(mk); return; }
      const way=ways[0]; if(way){ if(way.classList.contains('lesen')) readNodes++; if(way.classList.contains('weekboss')) weekbossFights++; click(way); return; } }
    const pref=['school','treasure','event','rest','elite','fight','boss']; let chosen=null; for(const p of pref){ chosen=nodes.find(n=>n.getAttribute('aria-label')===({school:'Zeichenschule',treasure:'Schatz',event:'Ereignis',rest:'Rast',elite:'Elite',fight:'Kampf',boss:'Boss'}[p])); if(chosen&&Math.random()<0.6) break; }
    click(chosen||nodes[0]); return; }
  if($('.inp')){ await solveTask(Math.random()>ACC); return; }
  if($('.opt.guess')){ const g=$$('.opt.guess'); click(g[Math.floor(Math.random()*g.length)]); return; } // Forscherlabor: any guess is fine
  if($('.opt')||$('.oitem')||$('.plant.clickable')||$('.kmap.clickable')){ await solveKnow(Math.random()>ACC); return; }
  if($('.atk:not(.locked)')){ battles++; const hpm=text().match(/❤\uFE0F? (\d+) \/ (\d+)/); if(hpm && +hpm[1]/+hpm[2]<0.4 && $('#bag')){ $('#bag').click(); const it=$('.overlay .item'); if(it){ it.click(); if(!$('.overlay')) return; } const c=$('.overlay #close'); if(c) c.click(); } const atks=$$('.atk:not(.locked)'); const weak=$('.atk.weak'); click(weak&&Math.random()<0.7?weak:atks[Math.floor(Math.random()*atks.length)]); return; }
  if($('.mblock.covered:not([disabled])')){ if(!$('.mblock.open')) mines++; const b=$$('.mblock.covered:not([disabled])'); click(b[Math.floor(Math.random()*b.length)]); return; }
  if($('.market')){ await shop(); return; }
  if($('#topend')) arenas++;
  if($('#next')){ click($('#next')); return; }
  if($('#go')&&text().includes('Merk-Check')){ schools++; click($('#go')); return; }
  if($('#train')){ rests++; click(Math.random()<0.5?$('#train'):$('#heal')); return; }
  if($('.bottom .btn[data-i]')&&tx.includes('kein Richtig oder Falsch')){ events++; dilemmas++; const opts=$$('.bottom .btn[data-i]'); click(opts[Math.floor(Math.random()*opts.length)]); if(text().includes('Denk mal nach:')) consequences++; return; }
  if($('.bottom .btn[data-i]')){ events++; click($('.bottom .btn[data-i]:not([disabled])')); return; }
  if($('.choice[data-i]')&&tx.includes('Belohnung')){ if(tx.includes('Elitegegner')) eliteRewards++; else treasures++; click($$('.choice[data-i]').pop()); return; }
  if($('.choice[data-i]')&&tx.includes('ersetzen')){ click($$('.choice[data-i]')[0]); return; }
  if($('#again')){ console.log('END SCREEN:', tx.slice(0,110)); return 'end'; }
  if(/❤\uFE0F? 0 \//.test(tx)){ await sleep(700); return; }
  throw new Error('stuck at: '+tx.slice(0,300));
}
// Turmwacht: what was asked, how far each run got; CI checks only the invariants (no win rates)
function turmEnd(m, ends, steps){
  const fail=(msg)=>{ console.error('PLAYTEST FAIL: '+msg); process.exit(1); };
  console.log({steps,correctAnswers,wrongAnswers,tutorialsSeen,potions:turmPotions,bought:turmBuys,dex:Object.keys(m.dex).length,turm:m.turm,errors});
  for(const r of turmRuns) console.log(`Klasse ${r.grade} ${r.won?'gewonnen':'gefallen'}: Welle ${r.best}, ${r.q} Fragen (pro Anlauf max ${r.max}), Neustarts ${r.retries}${r.falls.length?` (gefallen in Welle ${r.falls.join(', ')})`:''},`, Object.entries(r.score).map(([s,v])=>s+' '+v.c+'/'+v.t).join(', '));
  if(errors.length) fail('page errors '+errors.join(' | '));
  if(ends<RUNS||turmRuns.length<RUNS) fail('did not finish '+RUNS+' Turmwacht run(s) in '+steps+' steps');
  for(const r of turmRuns){
    if(r.max>70) fail('more than 70 questions in one attempt: '+r.max);
    if(r.subjects.length>1) for(const s of r.subjects){ const n=(r.score[s]||{t:0}).t; if(n<0.2*r.q) fail(s+' got only '+n+' of '+r.q+' questions'); }
  }
}
(async()=>{
  let steps=0; let ends=0;
  while(steps<4000){ steps++; const r=await step(); await sleep(0); if(r==='end'){ ends++; runNo++; if(ends>=RUNS) break; if($('#again')) click($('#again')); }
    // battle pauses (up to ~2 s between actions): wait until something is clickable again
    for(let w=0; w<6 && !TURM && !$('.mblock')&&!$('.inp')&&!$('.atk:not(.locked)')&&!$('#next')&&!$('.node.open')&&!$('#go')&&!$('#new')&&!$('#train')&&!$('.bottom .btn[data-i]')&&!$('.choice[data-i]')&&!$('#again')&&!$('.overlay')&&!$('.opt')&&!$('[data-cell]'); w++) await sleep(500);
  }
  const m=w.__mq.meta;
  console.log({steps,colTasks,readNodes,correctAnswers,wrongAnswers,tutorialsSeen,battles,events,dilemmas,rests,treasures,eliteRewards,labs,maps,markets,bought,mines,arenas,materials:m.materials,runs:m.runs,wins:m.wins,bestWorld:m.bestWorld,dex:Object.keys(m.dex).length,errors});
  const mode=process.env.MODE||'math'; console.log('seed', SEED);
  if(TURM){ turmEnd(m, ends, steps); return; }
  console.log('stats',JSON.stringify(Object.fromEntries(Object.entries(m.stats[mode]).map(([k,v])=>[k,v.c+'/'+v.t]))));
  console.log('saved run?', !!w.localStorage.getItem(mode==='math'?'mathquest_run_v1':'mathquest_run_'+mode));
  const goals=w.__mq.weeklyGoals(); const done=goals.filter((g)=>(m.weekly.progress[g.i]||0)>=g.n).length;
  console.log('weekly', m.weekly.week, 'boss fights', weekbossFights, 'goals done', done, JSON.stringify(m.weekly.progress));
  if(mode==='wetterstation'&&!labs){ console.error('PLAYTEST FAIL: the bot never reached the Forscherlabor'); process.exit(1); }
  if(mode==='sinne'&&!labs){ console.error('PLAYTEST FAIL: the bot never reached the Sinnestäuschung'); process.exit(1); }
  if(['sinne','verkehr','kartoffel','kornkammer'].includes(mode)&&!schools){ console.error('PLAYTEST FAIL: the bot never drew in the Zeichenschule'); process.exit(1); }
  if(mode==='kompass'&&!maps){ console.error('PLAYTEST FAIL: the bot never reached the Schatzkarte'); process.exit(1); }
  if(errors.length){ console.error('PLAYTEST FAIL: page errors', errors); process.exit(1); }
  if(['math','bau'].includes(mode)&&!W3&&!mines){ console.error('PLAYTEST FAIL: never reached the Bergwerk'); process.exit(1); }
  if(mode==='math'&&RUNS>1&&(!weekbossFights||!m.weekly.beaten.includes('math')||!done)){ console.error('PLAYTEST FAIL: the bot did not beat the weekly boss and finish a weekly goal'); process.exit(1); }
  if(dilemmas!==consequences){ console.error('PLAYTEST FAIL: a dilemma choice showed no consequence'); process.exit(1); }
  if(!crafted){ console.error('PLAYTEST FAIL: never used the Werkbank'); process.exit(1); }
  if(W3&&!process.env.W3ATK&&colTasks<4){ console.error('PLAYTEST FAIL: only '+colTasks+' written tasks in world 3'); process.exit(1); }
  if(['woerterwerkstatt','satzbaustelle','ethik','kirchenjahr','ichwelt'].includes(mode)&&readNodes<RUNS){ console.error('PLAYTEST FAIL: Lesestube not played'); process.exit(1); }
  if(mode==='ichwelt'&&!m.stats.ichwelt.welten.t){ console.error('PLAYTEST FAIL: never sorted into the three worlds'); process.exit(1); }
  if(mode==='math'&&!W3&&!arenas){ console.error('PLAYTEST FAIL: never played the Kreisel-Arena'); process.exit(1); }
  if(mode==='math'&&!W3&&!bought){ console.error('PLAYTEST FAIL: never bought anything at a market'); process.exit(1); }
  if(ends<RUNS){ console.error('PLAYTEST FAIL: did not finish '+RUNS+' run(s) in '+steps+' steps'); process.exit(1); }
})().catch(e=>{console.error('PLAYTEST FAIL',e.message); console.log(errors); process.exit(1);});
