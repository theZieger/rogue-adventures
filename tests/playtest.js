const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname,'../docs/index.html'),'utf8');
// Seeded randomness (game and bot), so a failing run can be reproduced: SEED=123 node tests/playtest.js
const SEED=+(process.env.SEED||20261108);
function prng(seed){ let a=seed|0; return ()=>{ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
Math.random=prng(SEED+1);
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/', beforeParse(win){ win.Math.random=prng(SEED); } });
let runNo=0; // each run picks the next starter, so all monsters (and their attacks) get played
const w = dom.window, d = w.document;
const RUNS=+(process.env.RUNS||2); const ACC=+(process.env.ACC||0.85); const errors=[]; w.addEventListener('error', e=>errors.push(e.message));
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
const $ = (s)=>d.querySelector(s); const $$=(s)=>[...d.querySelectorAll(s)];
const text = ()=>$('#app').textContent.replace(/\s+/g,' ').trim();
function click(el){ if(!el) throw new Error('no element to click: '+text().slice(0,200)); if(typeof el.click==='function') el.click(); else el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); }
let correctAnswers=0, wrongAnswers=0, tutorialsSeen=0, battles=0, events=0, rests=0, treasures=0;
async function closeModal(){ const ov=$('.overlay'); if(ov){ const b=ov.querySelector('#tutok'); if(b){ tutorialsSeen++; click(b); return true;} } return false; }
async function solveTask(forceWrong){
  // current task in DOM
  const inps=$$('.inp'); if(!inps.length) return false;
  // Figure answers via the game's generate? Not accessible: instead reconstruct from DOM.
  const task=$('.task'); const t=task.textContent;
  let answers=null;
  const expr=$('.expr'); const M=w.eval('MQ');
  if(expr){ const s=expr.textContent; let m;
    if(m=s.match(/^(\d+) \+ (\d+)(?: \+ (\d+))? = \?$/)) answers=[+m[1]+ +m[2]+(m[3]?+m[3]:0)];
    else if(m=s.match(/^(\d+) − (\d+) = \?$/)) answers=[+m[1]-m[2]];
    else if(m=s.match(/^(\d+) − \? = (\d+)$/)) answers=[+m[1]-m[2]];
    else if(m=s.match(/^(\d+) · (\d+) = \?$/)) answers=[+m[1]*m[2]];
    else if(m=s.match(/^\? · (\d+) = (\d+)$/)) answers=[+m[2]/m[1]];
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
  else if($('.grid')){ const cells=$$('.grid div'); const si=cells.findIndex(c=>c.classList.contains('start')), ti=cells.findIndex(c=>c.classList.contains('target')); const base=+cells[si].textContent; const leg=$('.legend').textContent; const stepR=+leg.match(/➡ \+(\d+)/)[1]; const sr=Math.floor(si/3), sc=si%3, tr=Math.floor(ti/3), tc=ti%3; answers=[base+(tr-sr)+(tc-sc)*stepR]; }
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
  else if(t.kind==='order'){ let order=t.order.slice(); if(forceWrong) order=[order[1],order[0]].concat(order.slice(2)); for(const id of order){ click($('.oitem[data-id="'+id+'"]')); } if($('#ocheck').disabled) throw new Error('check disabled'); click($('#ocheck')); }
  const fb=$('.feedback'); if(!fb) throw new Error('no feedback (know) '+t.kind);
  const good=fb.classList.contains('good'); if(forceWrong&&good) throw new Error('wrong marked good '+t.kind); if(!forceWrong&&!good) throw new Error('correct marked bad '+t.kind+' '+JSON.stringify(t));
  if(good) correctAnswers++; else wrongAnswers++; click($('#next'));
}
async function step(){
  if(await closeModal()) return;
  const tx=text();
  if($('[data-new]')&&!$('.choice')&&!$('.floor')) { const m=process.env.MODE||'math'; const c=$('[data-cont="'+m+'"]'); if(c){click(c);return;} click($('[data-new="'+m+'"]')); const y=$('.overlay #yes'); if(y) click(y); return; }
  if($('#go')&&$('.choice[data-id]')){ const ch=$$('.choice[data-id]'); click(ch[runNo%ch.length]); click($('#go')); return; }
  if($('.floor.current .node')){ const nodes=$$('.floor.current .node'); // prefer variety
    const pref=['school','treasure','event','rest','elite','fight','boss']; let chosen=null; for(const p of pref){ chosen=nodes.find(n=>n.getAttribute('aria-label')===({school:'Zeichenschule',treasure:'Schatz',event:'Ereignis',rest:'Rast',elite:'Elite',fight:'Kampf',boss:'Boss'}[p])); if(chosen&&Math.random()<0.6) break; }
    click(chosen||nodes[0]); return; }
  if($('.inp')){ await solveTask(Math.random()>ACC); return; }
  if($('.opt')||$('.oitem')||$('.plant.clickable')){ await solveKnow(Math.random()>ACC); return; }
  if($('.atk:not(.locked)')){ battles++; const hpm=text().match(/❤️ (\d+) \/ (\d+)/); if(hpm && +hpm[1]/+hpm[2]<0.4 && $('#bag')){ $('#bag').click(); const it=$('.overlay .item'); if(it){ it.click(); if(!$('.overlay')) return; } const c=$('.overlay #close'); if(c) c.click(); } const atks=$$('.atk:not(.locked)'); click(atks[Math.floor(Math.random()*atks.length)]); return; }
  if($('#next')){ click($('#next')); return; }
  if($('#go')&&text().includes('Merk-Check')){ click($('#go')); return; }
  if($('#train')){ rests++; click(Math.random()<0.5?$('#train'):$('#heal')); return; }
  if($('.bottom .btn[data-i]')){ events++; click($('.bottom .btn[data-i="0"]')); return; }
  if($('.choice[data-i]')&&tx.includes('Belohnung')){ treasures++; click($$('.choice[data-i]').pop()); return; }
  if($('.choice[data-i]')&&tx.includes('ersetzen')){ click($$('.choice[data-i]')[0]); return; }
  if($('#again')){ console.log('END SCREEN:', tx.slice(0,110)); return 'end'; }
  if(tx.includes('❤️ 0 /')){ await sleep(700); return; }
  throw new Error('stuck at: '+tx.slice(0,300));
}
(async()=>{
  // fake timers: jsdom setTimeout real; speed by awaiting
  let steps=0; let ends=0;
  while(steps<4000){ steps++; const r=await step(); await sleep(0); if(r==='end'){ ends++; runNo++; if(ends>=RUNS) break; click($('#again')); }
    if($('[data-new]') && ends>0 && steps>5 && !$('.choice')){ /* back at title: handled in step */ }
    // advance timeouts (enemy turn 700-900ms) -> wait a bit when nothing clickable
    if(!$('.inp')&&!$('.atk:not(.locked)')&&!$('#next')&&!$('.floor.current .node')&&!$('#go')&&!$('#new')&&!$('#train')&&!$('.bottom .btn[data-i]')&&!$('.choice[data-i]')&&!$('#again')&&!$('.overlay')) await sleep(950);
  }
  const m=w.__mq.meta;
  console.log({steps,correctAnswers,wrongAnswers,tutorialsSeen,battles,events,rests,treasures,runs:m.runs,wins:m.wins,bestWorld:m.bestWorld,dex:Object.keys(m.dex).length,errors});
  const mode=process.env.MODE||'math'; console.log('seed', SEED);
  console.log('stats',JSON.stringify(Object.fromEntries(Object.entries(m.stats[mode]).map(([k,v])=>[k,v.c+'/'+v.t]))));
  console.log('saved run?', !!w.localStorage.getItem(mode==='math'?'mathquest_run_v1':'mathquest_run_'+mode));
  if(errors.length){ console.error('PLAYTEST FAIL: page errors', errors); process.exit(1); }
  if(ends<RUNS){ console.error('PLAYTEST FAIL: did not finish '+RUNS+' run(s) in '+steps+' steps'); process.exit(1); }
})().catch(e=>{console.error('PLAYTEST FAIL',e.message); console.log(errors); process.exit(1);});
