const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname,'../docs/index.html'),'utf8');
// Seeded randomness (game and bot), so a failing run can be reproduced: SEED=123 node tests/playtest.js
const SEED=+(process.env.SEED||20261108);
function prng(seed){ let a=seed|0; return ()=>{ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
Math.random=prng(SEED+1);
// a fixed day too: 2026-W52 has the weekly boss in Zahlenquest as its maths goal (the seed can also pick Die Baustelle), so the bot can finish a goal in a math run
const NOW=Date.parse(process.env.NOW||'2026-12-23T10:00:00');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/', beforeParse(win){ win.Math.random=prng(SEED); const D=win.Date; win.Date=class extends D { constructor(...a){ super(...(a.length?a:[NOW])); } static now(){ return NOW; } }; } });
let runNo=0; // each run picks the next starter, so all monsters (and their attacks) get played
const w = dom.window, d = w.document;
const RUNS=+(process.env.RUNS||2); const ACC=+(process.env.ACC||0.85); const errors=[]; w.addEventListener('error', e=>errors.push(e.message));
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
const $ = (s)=>d.querySelector(s); const $$=(s)=>[...d.querySelectorAll(s)];
const text = ()=>$('#app').textContent.replace(/\s+/g,' ').trim();
function click(el){ if(!el) throw new Error('no element to click: '+text().slice(0,200)); if(typeof el.click==='function') el.click(); else el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); }
let weekbossFights=0, correctAnswers=0, wrongAnswers=0, tutorialsSeen=0, battles=0, events=0, dilemmas=0, consequences=0, rests=0, treasures=0, eliteRewards=0, labs=0, maps=0, mines=0;
async function closeModal(){ const ov=$('.overlay'); if(ov){ const b=ov.querySelector('#tutok'); if(b){ tutorialsSeen++; click(b); return true;} } return false; }
async function solveTask(forceWrong){
  const inps=$$('.inp'); if(!inps.length) return false;
  const task=$('.task'); const t=task.textContent;
  let answers=null;
  const expr=$('.expr'); const M=w.eval('MQ'); const T=w.__task;
  // Baustelle: recount from the task data (plan heights, squares of the shape)
  if(T&&T.plan){ const n=T.plan.flat().reduce((a,b)=>a+b,0); answers=[T.full?T.plan.length*T.plan[0].length*T.full-n:n]; }
  else if(T&&T.cells){ const at=new Set(T.cells.map(p=>p.join())); answers=[T.cells.reduce((n,[r,c])=>n+[[r+1,c],[r-1,c],[r,c+1],[r,c-1]].filter(q=>!at.has(q.join())).length,0)]; }
  else if(expr){ const s=expr.textContent; let m;
    if(m=s.match(/^(\d+) \+ (\d+)(?: \+ (\d+))? = \?$/)) answers=[+m[1]+ +m[2]+(m[3]?+m[3]:0)];
    else if(m=s.match(/^(\d+) − (\d+) = \?$/)) answers=[+m[1]-m[2]];
    else if(m=s.match(/^(\d+) − \? = (\d+)$/)) answers=[+m[1]-m[2]];
    else if(m=s.match(/^(\d+) · (\d+) = \?$/)) answers=[+m[1]*m[2]];
    else if(m=s.match(/^\? · (\d+) = (\d+)$/)||s.match(/^(\d+) · \? = (\d+)$/)) answers=[+m[2]/m[1]];
    else if(m=s.match(/^(\d+) : (\d+) = \?$/)) answers=inps.length===2?[Math.floor(m[1]/m[2]),m[1]%m[2]]:[+m[1]/m[2]];
    else if(/^\d+$/.test(s)){ const n=+s, ask=$('.prompt').textContent;
      if(ask.includes('Runde')){ const to=ask.includes('Hunderter')?100:10; answers=[Math.round(n/to)*to]; }
      else if(ask.includes('Verdopple')) answers=[2*n]; else if(ask.includes('Halbiere')) answers=[n/2]; }
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
async function solveKnow(forceWrong){
  const t=w.__task; if(!t) throw new Error('no task');
  if(t.kind==='choice'||t.kind==='parts'){ const opts=$$('.opt'); let idx=t.options.indexOf(t.answer); if(forceWrong) idx=(idx+1)%t.options.length; click(opts[idx]); }
  else if(t.kind==='parts-find'){ const parts=$$('.plant [data-part]'); let el=parts.find(x=>x.dataset.part===t.part); if(forceWrong) el=parts.find(x=>x.dataset.part!==t.part); click(el); }
  else if(t.kind==='karte'){ let cell=t.target.join('-'); if(forceWrong) cell=$$('[data-cell]').map(x=>x.dataset.cell).find(c=>c!==cell); click($('[data-cell="'+cell+'"]')); }
  else if(t.kind==='order'){ let order=t.order.slice();
    // Deutsch: work the order out from what is on screen, not from the task object
    const shown=$$('.oitem').map(b=>({id:b.dataset.id,text:b.textContent.trim()}));
    if(t.mod==='abc') order=shown.slice().sort((a,b)=>a.text.slice(0,3).toLowerCase()<b.text.slice(0,3).toLowerCase()?-1:1).map(x=>x.id);
    if(t.mod==='umstell'){ const sentence=$('.question').textContent.match(/„(.+)\.“/)[1].toLowerCase(); const parts=shown.slice().sort((a,b)=>sentence.indexOf(a.text.toLowerCase())-sentence.indexOf(b.text.toLowerCase())); order=[parts[2],parts[1],parts[0]].map(x=>x.id); }
    if(order.join()!==t.order.join()) throw new Error('bot and game disagree on '+t.qid); if(forceWrong) order=[order[1],order[0]].concat(order.slice(2)); for(const id of order){ click($('.oitem[data-id="'+id+'"]')); } if($('#ocheck').disabled) throw new Error('check disabled'); click($('#ocheck')); }
  const fb=$('.feedback'); if(!fb) throw new Error('no feedback (know) '+t.kind);
  const good=fb.classList.contains('good'); if(forceWrong&&good) throw new Error('wrong marked good '+t.kind); if(!forceWrong&&!good) throw new Error('correct marked bad '+t.kind+' '+JSON.stringify(t));
  if(good) correctAnswers++; else wrongAnswers++; click($('#next'));
}
async function step(){
  if(await closeModal()) return;
  if($('#later')){ click($('#later')); return; }
  const tx=text();
  if($('[data-new]')&&!$('.choice')&&!$('.wmap')) { const m=process.env.MODE||'math'; const c=$('[data-cont="'+m+'"]'); if(c){click(c);return;} click($('[data-new="'+m+'"]')); const y=$('.overlay #yes'); if(y) click(y); return; }
  if($('#go')&&$('.choice[data-id]')){ const ch=$$('.choice[data-id]'); click(ch[runNo%ch.length]); click($('#go')); return; }
  if($('.node.open')){ const nodes=$$('.node.open');
    const special=nodes.find(n=>['Forscherlabor','Schatzkarte'].includes(n.getAttribute('aria-label'))); if(special){ if(special.getAttribute('aria-label')==='Forscherlabor') labs++; else maps++; click(special); return; }
    // steer towards a Forscherlabor/Schatzkarte/Bergwerk further up, so the bot plays them whatever the seed
    { const r=w.__mq.run, memo={}; const leads=(f,i)=>{ const k=f+'/'+i; if(k in memo) return memo[k]; const nd=r.map[f]&&r.map[f][i]; return memo[k]=!!nd&&(['labor','karte','bergwerk'].includes(nd.t)||nd.n.some(j=>leads(f+1,j))); };
      const way=nodes.find(n=>leads(r.floor-1,+n.dataset.n)); if(way){ click(way); return; } }
    // head for the weekly boss whenever the path can still reach it
    const r=w.__mq.run; const reach=(f,i)=>r.map[f][i].t==='weekboss'||r.map[f][i].n.some(j=>r.map[f+1]&&r.map[f+1][j]&&reach(f+1,j));
    const toBoss=nodes.find(n=>reach(r.floor-1,+n.dataset.n)); if(toBoss){ if(toBoss.classList.contains('weekboss')) weekbossFights++; click(toBoss); return; }
    const pref=['school','treasure','event','rest','elite','fight','boss']; let chosen=null; for(const p of pref){ chosen=nodes.find(n=>n.getAttribute('aria-label')===({school:'Zeichenschule',treasure:'Schatz',event:'Ereignis',rest:'Rast',elite:'Elite',fight:'Kampf',boss:'Boss'}[p])); if(chosen&&Math.random()<0.6) break; }
    click(chosen||nodes[0]); return; }
  if($('.inp')){ await solveTask(Math.random()>ACC); return; }
  if($('.opt.guess')){ const g=$$('.opt.guess'); click(g[Math.floor(Math.random()*g.length)]); return; } // Forscherlabor: any guess is fine
  if($('.opt')||$('.oitem')||$('.plant.clickable')||$('.kmap.clickable')){ await solveKnow(Math.random()>ACC); return; }
  if($('.atk:not(.locked)')){ battles++; const hpm=text().match(/❤️ (\d+) \/ (\d+)/); if(hpm && +hpm[1]/+hpm[2]<0.4 && $('#bag')){ $('#bag').click(); const it=$('.overlay .item'); if(it){ it.click(); if(!$('.overlay')) return; } const c=$('.overlay #close'); if(c) c.click(); } const atks=$$('.atk:not(.locked)'); const weak=$('.atk.weak'); click(weak&&Math.random()<0.7?weak:atks[Math.floor(Math.random()*atks.length)]); return; }
  if($('.mblock.covered:not([disabled])')){ if(!$('.mblock.open')) mines++; const b=$$('.mblock.covered:not([disabled])'); click(b[Math.floor(Math.random()*b.length)]); return; }
  if($('#next')){ click($('#next')); return; }
  if($('#go')&&text().includes('Merk-Check')){ click($('#go')); return; }
  if($('#train')){ rests++; click(Math.random()<0.5?$('#train'):$('#heal')); return; }
  if($('.bottom .btn[data-i]')&&tx.includes('kein Richtig oder Falsch')){ events++; dilemmas++; const opts=$$('.bottom .btn[data-i]'); click(opts[Math.floor(Math.random()*opts.length)]); if(text().includes('Denk mal nach:')) consequences++; return; }
  if($('.bottom .btn[data-i]')){ events++; click($('.bottom .btn[data-i="0"]')); return; }
  if($('.choice[data-i]')&&tx.includes('Belohnung')){ if(tx.includes('Elitegegner')) eliteRewards++; else treasures++; click($$('.choice[data-i]').pop()); return; }
  if($('.choice[data-i]')&&tx.includes('ersetzen')){ click($$('.choice[data-i]')[0]); return; }
  if($('#again')){ console.log('END SCREEN:', tx.slice(0,110)); return 'end'; }
  if(tx.includes('❤️ 0 /')){ await sleep(700); return; }
  throw new Error('stuck at: '+tx.slice(0,300));
}
(async()=>{
  let steps=0; let ends=0;
  while(steps<4000){ steps++; const r=await step(); await sleep(0); if(r==='end'){ ends++; runNo++; if(ends>=RUNS) break; click($('#again')); }
    // battle pauses (up to ~2 s between actions): wait until something is clickable again
    for(let w=0; w<6 && !$('.mblock')&&!$('.inp')&&!$('.atk:not(.locked)')&&!$('#next')&&!$('.node.open')&&!$('#go')&&!$('#new')&&!$('#train')&&!$('.bottom .btn[data-i]')&&!$('.choice[data-i]')&&!$('#again')&&!$('.overlay')&&!$('.opt')&&!$('[data-cell]'); w++) await sleep(500);
  }
  const m=w.__mq.meta;
  console.log({steps,correctAnswers,wrongAnswers,tutorialsSeen,battles,events,dilemmas,rests,treasures,eliteRewards,labs,maps,mines,materials:m.materials,runs:m.runs,wins:m.wins,bestWorld:m.bestWorld,dex:Object.keys(m.dex).length,errors});
  const mode=process.env.MODE||'math'; console.log('seed', SEED);
  console.log('stats',JSON.stringify(Object.fromEntries(Object.entries(m.stats[mode]).map(([k,v])=>[k,v.c+'/'+v.t]))));
  console.log('saved run?', !!w.localStorage.getItem(mode==='math'?'mathquest_run_v1':'mathquest_run_'+mode));
  const goals=w.__mq.weeklyGoals(); const done=goals.filter((g,i)=>(m.weekly.progress[i]||0)>=g.n).length;
  console.log('weekly', m.weekly.week, 'boss fights', weekbossFights, 'goals done', done, JSON.stringify(m.weekly.progress));
  if(mode==='wetterstation'&&!labs){ console.error('PLAYTEST FAIL: the bot never reached the Forscherlabor'); process.exit(1); }
  if(mode==='kompass'&&!maps){ console.error('PLAYTEST FAIL: the bot never reached the Schatzkarte'); process.exit(1); }
  if(errors.length){ console.error('PLAYTEST FAIL: page errors', errors); process.exit(1); }
  if(['math','bau'].includes(mode)&&!mines){ console.error('PLAYTEST FAIL: never reached the Bergwerk'); process.exit(1); }
  if(mode==='math'&&RUNS>1&&(!weekbossFights||!m.weekly.beaten.includes('math')||!done)){ console.error('PLAYTEST FAIL: the bot did not beat the weekly boss and finish a weekly goal'); process.exit(1); }
  if(dilemmas!==consequences){ console.error('PLAYTEST FAIL: a dilemma choice showed no consequence'); process.exit(1); }
  if(ends<RUNS){ console.error('PLAYTEST FAIL: did not finish '+RUNS+' run(s) in '+steps+' steps'); process.exit(1); }
})().catch(e=>{console.error('PLAYTEST FAIL',e.message); console.log(errors); process.exit(1);});
