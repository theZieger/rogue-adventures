const M=require('../src/logic.js');
const fails=[];
function check(cond,msg,t){ if(!cond){ fails.push(msg+' '+JSON.stringify(t)); } }
const evalExpr=(txt,ans)=>{
  const m=txt.match(/^(\d+) \+ (\d+)(?: \+ (\d+))? = \?$/); if(m){ return (+m[1])+(+m[2])+(m[3]?+m[3]:0)===ans[0]; }
  const s=txt.match(/^(\d+) − (\d+) = \?$/); if(s){ return (+s[1])-(+s[2])===ans[0]; }
  const sr=txt.match(/^(\d+) − \? = (\d+)$/); if(sr){ return (+sr[1])-ans[0]===+sr[2]; }
  const mu=txt.match(/^(\d+) · (\d+) = \?$/); if(mu){ return (+mu[1])*(+mu[2])===ans[0]; }
  const mr=txt.match(/^\? · (\d+) = (\d+)$/); if(mr){ return ans[0]*(+mr[1])===+mr[2]; }
  return null;
};
for(const mod of M.MODULE_KEYS){ for(let t=1;t<=M.MODULES[mod].maxTier;t++){ const tiers={};
  for(let i=0;i<2000;i++){ const tk=M.generate(mod,t,{elite:i%2===0});
    check(tk.answers.every(a=>Number.isInteger(a)&&a>=0&&a<=999),'range',tk);
    if(['add','sub','mul'].includes(mod)){ check(evalExpr(tk.text,tk.answers)===true,'arith',tk);
      if(mod==='add'&&t<=2) check(tk.answers[0]<100,'w1add',tk);
      if(mod==='sub'&&t===2){ const [a,b]=tk.text.match(/\d+/g).map(Number); check(a%10<b,'crossing',tk);}
      if(mod==='sub'&&t===1){ const [a,b]=tk.text.match(/\d+/g).map(Number); check(a%10>=b,'sub1 no ten-crossing',tk); check(b>=2&&a-b>=2,'sub1 not trivial',tk); }
      if(mod==='mul'&&t===1){ const [a,b]=tk.text.match(/\d+/g).map(Number); check(a>=2&&b>=2,'mul1 no factor 1',tk); } }
    // world 1 promise (README: "Welt 1 unter 100"): every number shown or asked stays under 100
    if(t<=M.MODULES[mod].worldCap[0]){ const nums=(tk.text.match(/\d+/g)||[]).map(Number).concat(tk.answers, tk.seq||[], tk.n!=null?[tk.n]:[]);
      if(tk.grid){ const g=tk.grid; for(let r=0;r<3;r++)for(let c=0;c<3;c++) nums.push(g.base+(r-g.sr)*g.stepD+(c-g.sc)*g.stepR); }
      check(nums.every(v=>v<100),'world1 <100',tk); }
    if(mod==='div'){ let m; const ok=(m=tk.text.match(/^(\d+) : (\d+) = \?$/))?(+m[2])*tk.answers[0]===+m[1]:(m=tk.text.match(/^\? · (\d+) = (\d+)$/)||tk.text.match(/^(\d+) · \? = (\d+)$/))?(+m[1])*tk.answers[0]===+m[2]:false;
      check(ok,'div',tk); check(tk.answers[0]>=2,'div quotient ≥ 2',tk); if(t===2) check(tk.answers[0]%10===0&&/:/.test(tk.text),'div tens',tk); }
    if(mod==='rest'){ const m=tk.text.match(/^(\d+) : (\d+) = \?$/); const [q,r]=tk.answers;
      check(m&&q*(+m[2])+r===+m[1],'rest',tk); check(m&&r>0&&r<+m[2],'0 < Rest < Divisor',tk); check(q>=2&&q<=10,'rest quotient',tk); check(m&&+m[1]<=(t===1?50:99),'rest range',tk); }
    if(mod==='rund'){ const n=+tk.text, to=tk.ask.includes('Hunderter')?100:10; const a=tk.answers[0];
      check(a%to===0&&Math.abs(a-n)<to/2+1&&(n%to>=to/2?a>n:a<n)&&a>0,'rund',tk); if(t===1) check(to===10,'rund1 Zehner',tk); if(t===2) check(to===100,'rund2 Hunderter',tk); }
    if(mod==='dopp'){ const n=+tk.text, a=tk.answers[0];
      check(tk.ask.includes('Verdopple')?a===2*n:n%2===0&&2*a===n,'dopp',tk); check(Math.max(n,a)<(t===1?100:1000),'dopp range',tk); }
    if(mod==='riddle'){ const lo=tk.digits===3?100:10, hi=tk.digits===3?999:99;
      check(tk.text.split('\n').length>=2,'cluecount',tk); check(tk.answers[0]>=lo&&tk.answers[0]<=hi,'riddlerange',tk); }
    if(mod==='seq'){ const s=tk.seq.concat(tk.answers); const d1=s[1]-s[0],d2=s[2]-s[1]; if(t<4){ check(s.every((v,i)=>i===0||v-s[i-1]===d1),'seqstep',tk);} else { check(s.every((v,i)=>i===0||v-s[i-1]===(i%2===1?d1:d2)),'altseq',tk);} if(t<=2) check(s.every(v=>v>0&&v<100),'w1seq',tk); }
    if(mod==='nb'){ const n=tk.n; const [b,a]=tk.answers; check(b<n&&n<a,'nb',tk); if(tk.nb==='Zehner') check(a-b===10,'nb10',tk); else check(a-b===100,'nb100',tk); }
    if(mod==='grid'){ const g=tk.grid; const v=g.base+(g.tr-g.sr)*g.stepD+(g.tc-g.sc)*g.stepR; check(v===tk.answers[0],'grid',tk); // all tiles in range
      for(let r=0;r<3;r++)for(let c=0;c<3;c++){const x=g.base+(r-g.sr)*g.stepD+(c-g.sc)*g.stepR; check(x>0&&x<1000,'gridrange',tk);} }
  }}}
// riddle brute force: exactly one solution, no redundant clue, tier 1 not just "Zehner ist X. Einer ist Y."
const digits=M.digits;
const cluePred=(c)=>{ let m;
  if(m=c.match(/Einer ist (\d+)-mal so groß wie mein Zehner/)) return d=>d.z>0&&d.e===+m[1]*d.z;
  if(m=c.match(/Zehner ist (\d+)-mal so groß wie mein Hunderter/)) return d=>d.h>0&&d.z===+m[1]*d.h;
  if(m=c.match(/Einer ist um (\d+) größer als mein Zehner/)) return d=>d.e-d.z===+m[1];
  if(m=c.match(/Einer ist um (\d+) kleiner als mein Zehner/)) return d=>d.z-d.e===+m[1];
  if(m=c.match(/Hunderter ist um (\d+) kleiner als mein Zehner/)) return d=>d.z-d.h===+m[1];
  if(m=c.match(/Hunderter ist um (\d+) größer als mein Zehner/)) return d=>d.h-d.z===+m[1];
  if(m=c.match(/Hunderter ist (\d+)\./)) return d=>d.h===+m[1];
  if(m=c.match(/Zehner ist (\d+)\./)) return d=>d.z===+m[1];
  if(m=c.match(/Einer ist (\d+)\./)) return d=>d.e===+m[1];
  if(m=c.match(/Quersumme ist (\d+)/)) return d=>(d.h+d.z+d.e)===+m[1];
  if(c.includes('gleich')) return d=>d.e===d.z;
  if(c.includes('gerade Zahl')) return d=>d.e%2===(c.includes('ungerade')?1:0);
  return null; };
const solve=(preds,lo,hi)=>{ const r=[]; for(let x=lo;x<=hi;x++){ const d=digits(x); if(preds.every(p=>p(d))) r.push(x); } return r; };
const isRelText=(c)=>/-mal|größer|kleiner/.test(c);
for(let t=1;t<=3;t++) for(let i=0;i<400;i++){ const tk=M.generate('riddle',t); const lo=tk.digits===3?100:10, hi=tk.digits===3?999:99;
  const clues=tk.text.split('\n'); const preds=clues.map(cluePred);
  if(preds.some(p=>!p)){ fails.push('unknown clue '+tk.text); continue; }
  const matches=solve(preds,lo,hi);
  if(matches.length!==1||matches[0]!==tk.answers[0]) fails.push('riddle ambiguous '+JSON.stringify(tk)+' '+matches);
  preds.forEach((_,k)=>{ if(solve(preds.filter((_,j)=>j!==k),lo,hi).length===1) fails.push('riddle redundant clue "'+clues[k]+'" '+JSON.stringify(tk)); });
  if(!clues.some(isRelText)) fails.push('riddle without relational clue '+JSON.stringify(tk));
  if(t===3&&clues.filter(isRelText).length<2) fails.push('riddle t3 needs 2 relational clues '+JSON.stringify(tk));
}
// Baustelle: every task type has exactly one right answer, and it is the right one
{
  const B=M.BAU;
  // independent fold check: roll a die over the net, faces labelled by name
  const ROLL={ r:{top:'w',bottom:'e',e:'top',w:'bottom'}, l:{top:'e',bottom:'w',w:'top',e:'bottom'}, d:{top:'n',bottom:'s',s:'top',n:'bottom'}, u:{top:'s',bottom:'n',n:'top',s:'bottom'} };
  const folds=(cells)=>{ const at=new Map(cells.map(p=>[p.join(),p])); const face=new Map(); const go=(p,die)=>{ const k=p.join(); if(!at.has(k)||face.has(k)) return; face.set(k,die.bottom);
      for(const [d,[dr,dc]] of Object.entries({r:[0,1],l:[0,-1],d:[1,0],u:[-1,0]})){ const nd=Object.assign({},die); for(const [to,from] of Object.entries(ROLL[d])) nd[to]=die[from]; go([p[0]+dr,p[1]+dc],nd); } };
    go(cells[0],{top:'top',bottom:'bottom',n:'n',s:'s',e:'e',w:'w'}); return cells.length===6&&face.size===6&&new Set(face.values()).size===6; };
  // all free hexominoes: 35, of which exactly the 11 in NETS fold to a cube
  let shapes=new Map([[B.shapeKey([[0,0]]),[[0,0]]]]);
  for(let n=2;n<=6;n++){ const next=new Map(); for(const s of shapes.values()) for(const [r,c] of s) for(const p of [[r+1,c],[r-1,c],[r,c+1],[r,c-1]]) if(!s.some(q=>q.join()===p.join())){ const t=s.concat([p]); next.set(B.shapeKey(t),t); } shapes=next; }
  const foldable=[...shapes.values()].filter(folds);
  check(shapes.size===35,'35 hexominoes',shapes.size); check(foldable.length===11,'11 cube nets',foldable.length);
  const netKeys=new Set(B.NETS.map(n=>B.shapeKey(B.parseNet(n))));
  check(netKeys.size===11&&foldable.every(s=>netKeys.has(B.shapeKey(s))),'NETS are the 11 cube nets',B.NETS);
  for(const s of shapes.values()) check(B.cubeNet(s)===folds(s),'cubeNet agrees with die rolling',s);
  const one=(tk)=>tk.options.filter(o=>o===tk.answer).length===1&&new Set(tk.options).size===tk.options.length;
  for(const mod of Object.keys(B.MODULES)) for(let t=1;t<=B.MODULES[mod].maxTier;t++) for(let i=0;i<1500;i++){ const tk=B.generate(mod,t);
    check(tk.mod===mod&&B.TUT[tk.group],'bau group has a tutorial',tk.group);
    if(tk.kind==='num'){ check(tk.answers.length===1&&Number.isInteger(tk.answers[0])&&tk.answers[0]>0&&tk.answers[0]<100,'bau number',tk.answers); }
    else check(one(tk),'bau: exactly one right option',mod);
    const n=tk.plan&&tk.plan.flat().reduce((a,b)=>a+b,0);
    if(mod==='wz'){ check(tk.answers[0]===n,'wz count',tk.plan); check(t===2||tk.plan.flat().every(h=>h>=1&&h<=3),'wz1 heights',tk.plan);
      check((tk.svg.match(/<polygon/g)||[]).length===3*n,'wz: view shows every cube',tk.plan); }
    if(mod==='fq'){ const cells=tk.plan.length*tk.plan[0].length; check(tk.answers[0]===cells*tk.full-n&&tk.plan.flat().every(h=>h<=tk.full),'fq missing',tk.plan);
      check(tk.ask.includes(`${tk.plan[0].length} Würfel lang, ${tk.plan.length} breit und ${tk.full} hoch`),'fq size text',tk.ask); }
    if(mod==='netz'){ const ok=tk.nets.map(folds); check(ok.filter(Boolean).length===1&&ok[tk.options.indexOf(tk.answer)],'netz: only the answer folds',tk.nets);
      check(new Set(tk.nets.map(B.shapeKey)).size===3,'netz: three different shapes',tk.nets); }
    if(mod==='koerper'){ check(tk.shown.includes(tk.solid)&&new Set(tk.shown).size===3,'koerper options',tk.shown);
      check(tk.svgOpts?tk.options.indexOf(tk.answer)===tk.shown.indexOf(tk.solid):tk.answer===B.SOLIDS[tk.solid][0],'koerper answer',tk.solid); }
    if(mod==='band'){ const p=tk.seq.length; check(tk.next[0]===tk.seq[tk.shown%p]&&tk.next[1]===tk.seq[(tk.shown+1)%p]&&tk.shown>=2*p,'band continuation',tk.seq);
      check(new Set(tk.seq.map(String)).size>=2,'band has a pattern',tk.seq); check((tk.pic.match(/<g /g)||[]).length===tk.shown,'band shows the tiles',tk.shown); }
    if(mod==='lage'){ const d=((tk.angles[1]-tk.angles[0])%180+180)%180; check(tk.answer===(d===0?'parallel':d===90?'senkrecht':'weder noch'),'lage',tk.angles); }
    if(mod==='umfang'){ check(!B.hasHole(tk.cells),'umfang: no hole',tk.cells); const at=new Set(tk.cells.map(p=>p.join()));
      check(tk.answers[0]===4*tk.cells.length-2*tk.cells.filter(([r,c])=>at.has([r,c+1].join())).length-2*tk.cells.filter(([r,c])=>at.has([r+1,c].join())).length,'umfang',tk.cells);
      if(t===1) check(tk.answers[0]===2*(Math.max(...tk.cells.map(p=>p[0]))+1+Math.max(...tk.cells.map(p=>p[1]))+1),'umfang rectangle',tk.cells); }
  }
  check(B.hasHole([[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]]),'a ring has a hole');
  // Bergwerk ore blocks: division without remainder, still in the Einmaleins
  for(let t=1;t<=2;t++) for(let i=0;i<1000;i++){ const tk=M.generate('rest',t,{zero:true}); const m=tk.text.match(/^(\d+) : (\d+) = \?$/);
    check(m&&tk.answers[1]===0&&tk.answers[0]*(+m[2])===+m[1]&&tk.answers[0]>=2&&tk.answers[0]<=10&&+m[1]<=(t===1?50:99),'ore task',tk); }
}
for(const mod of M.MODULE_KEYS){ const tk=M.generate(mod,1); console.log(mod, JSON.stringify(tk)); }
console.log(JSON.stringify(M.generate('riddle',2)), JSON.stringify(M.generate('riddle',3)));
// path map rules (see makeMap in src/logic.js)
const quiet = ['rest', 'treasure', 'elite', 'event'];
for (let i = 0; i < 3000; i++) {
  const m = M.makeMap(1); const bad = (msg) => fails.push('map: ' + msg + ' ' + JSON.stringify(m));
  if (m.length !== M.FLOORS) { bad('floors'); continue; }
  if (m[0].some((n) => n.t !== 'fight')) bad('floor 1 must be fights');
  if (m[6].some((n) => n.t !== 'rest')) bad('floor 7 must be the camp');
  if (m[7].length !== 1 || m[7][0].t !== 'boss') bad('floor 8 boss');
  if (m[0].length < 2) bad('at least two starts');
  if (m.slice(0, 2).some((fl) => fl.some((n) => n.t === 'elite'))) bad('elite before floor 3');
  if (m.slice(1, 3).concat(m.slice(5, 6)).some((fl) => fl.some((n) => n.t === 'rest'))) bad('rest outside floors 4, 5, 7');
  if (m.flat().filter((n) => n.t === 'treasure').length > 2) bad('more than 2 treasures');
  const reached = m.map(() => new Set()); m[0].forEach((_, i) => reached[0].add(i));
  m.forEach((fl, f) => fl.forEach((n, i) => {
    if (f < 7 && !n.n.length) bad('dead end');
    n.n.forEach((j) => { const nx = m[f + 1] && m[f + 1][j]; if (!nx) { bad('edge to nowhere'); return; } reached[f + 1].add(j);
      if (n.t === nx.t && quiet.includes(n.t) && f + 1 < 6) bad(n.t + ' twice in a row'); });
    fl.forEach((o, k) => { if (k <= i) return; n.n.forEach((a) => o.n.forEach((b) => { if (fl[k].c > n.c && m[f + 1][b].c < m[f + 1][a].c) bad('crossing'); })); });
  }));
  m.forEach((fl, f) => { if (reached[f].size !== fl.length) bad('unreachable node'); });
}
console.log(M.makeMap(1).map((r) => r.map((n) => n.t).join('/')).join(' | '));
console.log('fails',fails.length); if(fails.length){ console.log(fails.slice(0,10).join('\n')); process.exit(1); }
