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
    if(tk.kind==='choice') check(tk.options.filter(o=>o===tk.answer).length===1&&new Set(tk.options).size===tk.options.length&&tk.q===tk.text,'choice: exactly one right option',tk);
    else check(tk.answers.every(a=>Number.isInteger(a)&&a>=0&&a<=999),'range',tk);
    if(['add','sub','mul'].includes(mod)){ check(evalExpr(tk.text,tk.answers)===true,'arith',tk);
      if(mod==='add'&&t<=2) check(tk.answers[0]<100,'w1add',tk);
      if(mod==='sub'&&t===2){ const [a,b]=tk.text.match(/\d+/g).map(Number); check(a%10<b,'crossing',tk);}
      if(mod==='sub'&&t===1){ const [a,b]=tk.text.match(/\d+/g).map(Number); check(a%10>=b,'sub1 no ten-crossing',tk); check(b>=2&&a-b>=2,'sub1 not trivial',tk); }
      if(mod==='mul'&&t===1){ const [a,b]=tk.text.match(/\d+/g).map(Number); check(a>=2&&b>=2,'mul1 no factor 1',tk); } }
    // world 1 promise (README: "Welt 1 unter 100"): every number shown or asked stays under 100
    if(t<=M.MODULES[mod].worldCap[0]){ const nums=(tk.text.match(/\d+/g)||[]).map(Number).concat(tk.answers||[], tk.seq||[], tk.n!=null?[tk.n]:[]);
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
    if(mod==='geld'){ const cents=(x)=>{ const m=x.match(/^(?:(\d+) €)?(?: ?(\d+) ct)?$/); return m?(+(m[1]||0))*100+(+(m[2]||0)):NaN; }; const [e,c]=tk.answers; check(c<100&&tk.money&&tk.labels.length===2,'geld answer € ct',tk);
      if(t===1){ const parts=tk.text.split(' + ').map(cents); check(parts.length>=2&&parts.every(v=>M.COINS.includes(v)),'geld coins',tk); check(parts.reduce((a,b)=>a+b,0)===e*100+c,'geld coin sum',tk); }
      else { const [p,q]=tk.text.split(' − ').map(cents); check(p>q&&p-q===e*100+c&&[200,500,1000].includes(p),'geld change',tk); } }
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
  // Quadernetz check from the rectangles alone: roll a die over faces that share a whole edge; every face must
  // measure the box lengths of the two die axes lying along it, and the six faces must land on six sides
  const AX={top:0,bottom:0,n:1,s:1,e:2,w:2};
  const boxFolds=(rs)=>{ if(rs.length!==6) return false;
    const over=rs.some((a,i)=>rs.some((b,j)=>j>i&&a[0]<b[0]+b[2]&&b[0]<a[0]+a[2]&&a[1]<b[1]+b[3]&&b[1]<a[1]+a[3])); if(over) return false;
    const dir=(a,b)=>a[0]+a[2]===b[0]&&a[1]===b[1]&&a[3]===b[3]?'r':b[0]+b[2]===a[0]&&a[1]===b[1]&&a[3]===b[3]?'l':a[1]+a[3]===b[1]&&a[0]===b[0]&&a[2]===b[2]?'d':b[1]+b[3]===a[1]&&a[0]===b[0]&&a[2]===b[2]?'u':null;
    const L=[null,null,null]; const put=(ax,v)=>{ if(L[ax]===null) L[ax]=v; return L[ax]===v; };
    const die=new Map([[0,{top:'top',bottom:'bottom',n:'n',s:'s',e:'e',w:'w'}]]); const q=[0]; let ok=true;
    while(q.length){ const i=q.shift(), d=die.get(i); ok=ok&&put(AX[d.e],rs[i][2])&&put(AX[d.s],rs[i][3]);
      rs.forEach((b,j)=>{ const k=dir(rs[i],b); if(k&&!die.has(j)){ const nd=Object.assign({},d); for(const [to,from] of Object.entries(ROLL[k])) nd[to]=d[from]; die.set(j,nd); q.push(j); } }); }
    return ok&&die.size===6&&new Set([...die.values()].map(x=>x.bottom)).size===6; };
  check(boxFolds([[1,0,2,1],[0,1,1,3],[1,1,2,3],[3,1,1,3],[4,1,2,3],[1,4,2,1]]),'a 2·1·3 box net folds');
  check(!boxFolds([[1,0,2,1],[0,1,1,3],[1,1,2,3],[3,1,1,3],[4,1,2,3]]),'five faces do not fold');
  check(!boxFolds([[1,0,2,1],[0,1,1,3],[1,1,2,3],[3,1,1,3],[4,1,2,3],[1,4,2,2]]),'a face of the wrong size does not fold');
  // shapes on squared paper, recomputed here
  const key=(cells)=>JSON.stringify(cells.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]));
  const norm=(cells)=>{ const r0=Math.min(...cells.map(p=>p[0])),c0=Math.min(...cells.map(p=>p[1])); return key(cells.map(([r,c])=>[r-r0,c-c0])); };
  const turn=(cells)=>cells.map(([r,c])=>[c,-r]), flipX=(cells)=>cells.map(([r,c])=>[r,-c]);
  const rots=(cells)=>{ const out=[]; let x=cells; for(let i=0;i<4;i++){ out.push(norm(x)); x=turn(x); } return out; };
  // properties of the named shapes; r = right angles (unknown for a general Viereck), p = pairs of parallel sides, g = four equal sides
  const FIG={ Quadrat:{e:4,r:4,p:2,g:true}, Rechteck:{e:4,r:4,p:2,g:false}, Parallelogramm:{e:4,r:0,p:2,g:false}, 'Dreieck mit rechtem Winkel':{e:3,r:1,p:0,g:false}, 'Dreieck ohne rechten Winkel':{e:3,r:0,p:0,g:false}, 'Viereck ohne parallele Seiten':{e:4,r:null,p:0,g:false} };
  const holds=(q,f)=>{ const c=[]; if(q.includes('zwei Paar parallele')) c.push(f.p===2); if(q.includes('nicht vier gleich lange')) c.push(!f.g); else if(q.includes('vier gleich lange')) c.push(f.g);
    if(q.includes('vier rechte Winkel')) c.push(f.p===0?false:f.r===4); if(q.includes('keinen rechten Winkel')) c.push(f.p===0&&f.e===4?(f.r===null?null:f.r===0):f.r===0); if(q.includes('genau einen rechten')) c.push(f.r===null?null:f.r===1); if(q.includes('drei Ecken')) c.push(f.e===3);
    return c.includes(false)?false:c.includes(null)?null:true; };
  const sideV=(pts)=>pts.map((p,i)=>{ const q=pts[(i+1)%pts.length]; return [q[0]-p[0],q[1]-p[1]]; });
  const classify=(pts)=>{ const v=sideV(pts), n=pts.length; const right=v.filter((a,i)=>{ const b=v[(i+1)%n]; return a[0]*b[0]+a[1]*b[1]===0; }).length;
    if(n===3) return right?'Dreieck mit rechtem Winkel':'Dreieck ohne rechten Winkel';
    const par=[0,1].filter(i=>v[i][0]*v[i+2][1]-v[i][1]*v[i+2][0]===0).length; const len=v.map(a=>a[0]*a[0]+a[1]*a[1]);
    if(par===2&&right===4) return len.every(x=>x===len[0])?'Quadrat':'Rechteck'; if(par===2) return 'Parallelogramm'; return par===0?'Viereck ohne parallele Seiten':'?'; };
  let equalAreas=0;
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
    if(mod==='netz'&&t===1){ const ok=tk.nets.map(folds); check(ok.filter(Boolean).length===1&&ok[tk.options.indexOf(tk.answer)],'netz: only the answer folds',tk.nets);
      check(new Set(tk.nets.map(B.shapeKey)).size===3,'netz: three different shapes',tk.nets); }
    if(mod==='koerper'){ check(tk.shown.includes(tk.solid)&&new Set(tk.shown).size===3,'koerper options',tk.shown);
      check(tk.svgOpts?tk.options.indexOf(tk.answer)===tk.shown.indexOf(tk.solid):tk.answer===B.SOLIDS[tk.solid][0],'koerper answer',tk.solid); }
    if(mod==='band'){ const p=tk.seq.length; check(tk.next[0]===tk.seq[tk.shown%p]&&tk.next[1]===tk.seq[(tk.shown+1)%p]&&tk.shown>=2*p,'band continuation',tk.seq);
      check(new Set(tk.seq.map(String)).size>=2,'band has a pattern',tk.seq); check((tk.pic.match(/<g /g)||[]).length===tk.shown,'band shows the tiles',tk.shown); }
    if(mod==='lage'){ const d=((tk.angles[1]-tk.angles[0])%180+180)%180; check(tk.answer===(d===0?'parallel':d===90?'senkrecht':'weder noch'),'lage',tk.angles); }
    if(mod==='netz'&&t===2){ const ok=tk.rects.map(boxFolds); check(ok.filter(Boolean).length===1&&ok[tk.options.indexOf(tk.answer)],'quadernetz: only the answer folds to a Quader',tk.rects);
      check(tk.options.every((o,i)=>(o.match(/<rect/g)||[]).length===tk.rects[i].length),'quadernetz: picture shows every face',tk.rects); }
    if(mod==='ansicht'){ const P=tk.plan, R=P.length, C=P[0].length; check(t===2||tk.side!=='rechts','ansicht: von rechts only in tier 2');
      const hs=tk.side==='vorn'?[...Array(C)].map((_,c)=>Math.max(...P.map(row=>row[c]))):[...Array(R)].map((_,r)=>Math.max(...P[R-1-r]));
      const want=norm(tk.side==='oben'?P.flatMap((row,r)=>row.map((n,c)=>n?[r,c]:null)).filter(Boolean):hs.flatMap((h,x)=>[...Array(h)].map((_,z)=>[-z,x])));
      const got=tk.views.map(v=>norm(v.flatMap((row,r)=>[...row].map((ch,c)=>ch==='#'?[r,c]:null)).filter(Boolean)));
      check(got.filter(k=>k===want).length===1&&got[tk.options.indexOf(tk.answer)]===want,'ansicht: only the answer shows the building '+tk.side,P);
      check(new Set(got).size===3,'ansicht: three different pictures',tk.views);
      check(tk.options.every((o,i)=>(o.match(/<rect/g)||[]).length===tk.views[i].join('').split('#').length-1),'ansicht: picture shows every square',tk.views); }
    if(mod==='flaeche'&&t===1){ check(tk.answers[0]===tk.area.length&&(tk.svg.match(/<rect/g)||[]).length===tk.area.length&&tk.area.length>=5,'flaeche count',tk.area); }
    if(mod==='flaeche'&&t===2){ const [a,b]=tk.figs; check(tk.answer===(a.length===b.length?'Beide gleich groß':a.length>b.length?'Figur A':'Figur B'),'flaeche compare',tk.figs);
      check(B.shapeKey(a)!==B.shapeKey(b)&&(tk.pic.match(/<rect/g)||[]).length===a.length+b.length,'flaeche: two different shapes, both drawn',tk.figs); if(a.length===b.length) equalAreas++; }
    if(mod==='spiegel'&&t===1){ const k=tk.k; const m=tk.shape.map(([r,c])=>tk.flat?[2*k-1-r,c]:[r,2*k-1-c]);
      check(tk.answer===(key(m)===key(tk.shape)?'ja':'nein'),'spiegel: symmetric about the drawn axis',tk.shape); check(tk.options.join()==='ja,nein','spiegel options',tk.options); }
    if(mod==='spiegel'&&t===2){ const want=key(tk.left.map(([r,c])=>[r,2-c])); const hits=tk.halves.map(h=>key(h)===want);
      check(hits.filter(Boolean).length===1&&hits[tk.options.indexOf(tk.answer)],'spiegel: one option is the mirror image',tk.left); }
    if(mod==='bewegung'){ const to=norm(tk.to); const kinds=[norm(tk.from)===to&&'verschoben', rots(tk.from).slice(1).includes(to)&&'gedreht', rots(flipX(tk.from)).includes(to)&&'gespiegelt'].filter(Boolean);
      check(kinds.length===1&&kinds[0]===tk.answer,'bewegung: exactly one way fits',[tk.from,tk.to,kinds]); check(new Set(rots(tk.from).concat(rots(flipX(tk.from)))).size===8,'bewegung: shape has no symmetry',tk.from); }
    if(mod==='vieleck'){ if(tk.pts) check(classify(tk.pts)===tk.shape,'vieleck: drawn shape is the named one',[tk.pts,tk.shape]);
      if(t===1){ check(tk.answer===tk.shape,'vieleck name',tk.shape); const truth=(name)=>name===tk.shape||(tk.shape==='Quadrat'&&['Rechteck','Parallelogramm'].includes(name))||(tk.shape==='Rechteck'&&name==='Parallelogramm');
        check(tk.options.filter(truth).length===1,'vieleck: no other option is also true',tk.options); }
      else if(tk.q.startsWith('Welche')){ const v=tk.options.map(o=>holds(tk.q,FIG[o])); check(v.filter(x=>x===true).length===1&&v[tk.options.indexOf(tk.answer)]===true&&!v.includes(null),'vieleck property',[tk.q,tk.options,v]); }
      else { const f=FIG[tk.shape]; check(tk.answer===String(tk.q.includes('rechte Winkel')?f.r:f.p),'vieleck count',[tk.q,tk.answer]); } }
    if(mod==='umfang'){ check(!B.hasHole(tk.cells),'umfang: no hole',tk.cells); const at=new Set(tk.cells.map(p=>p.join()));
      check(tk.answers[0]===4*tk.cells.length-2*tk.cells.filter(([r,c])=>at.has([r,c+1].join())).length-2*tk.cells.filter(([r,c])=>at.has([r+1,c].join())).length,'umfang',tk.cells);
      if(t===1) check(tk.answers[0]===2*(Math.max(...tk.cells.map(p=>p[0]))+1+Math.max(...tk.cells.map(p=>p[1]))+1),'umfang rectangle',tk.cells); }
  }
  check(B.hasHole([[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]]),'a ring has a hole');
  check(equalAreas>50,'flaeche: some pairs have the same area in different shapes',equalAreas);
  // Bergwerk ore blocks: division without remainder, still in the Einmaleins
  for(let t=1;t<=2;t++) for(let i=0;i<1000;i++){ const tk=M.generate('rest',t,{zero:true}); const m=tk.text.match(/^(\d+) : (\d+) = \?$/);
    check(m&&tk.answers[1]===0&&tk.answers[0]*(+m[2])===+m[1]&&tk.answers[0]>=2&&tk.answers[0]<=10&&+m[1]<=(t===1?50:99),'ore task',tk); }
}
for(const mod of M.MODULE_KEYS){ const tk=M.generate(mod,1); console.log(mod, JSON.stringify(tk)); }
console.log(JSON.stringify(M.generate('riddle',2)), JSON.stringify(M.generate('riddle',3)));
// money is written „3 € 50 ct“, never with a comma
for(const [c,t] of [[350,'3 € 50 ct'],[205,'2 € 05 ct'],[300,'3 €'],[60,'60 ct'],[0,'0 ct'],[1000,'10 €']]) check(M.euro(c)===t,'euro '+c,M.euro(c));
check(Object.keys(M.PRICES).every(k=>M.ITEMS[k]&&Number.isInteger(M.PRICES[k])),'market prices are whole cents of real items',M.PRICES);
// path map rules (see makeMap in src/logic.js)
const quiet = ['rest', 'treasure', 'elite', 'event'];
if (M.FLOORS !== 8 || M.makeMap().length !== 8) fails.push('map: 8 floors by default');
for (let i = 0; i < 3000; i++) {
  const F = [6, 7, M.FLOORS][i % 3]; // Klasse 1, 2 and 3
  const m = M.makeMap(F); const bad = (msg) => fails.push('map: ' + msg + ' ' + JSON.stringify(m));
  if (m.length !== F) { bad('floors'); continue; }
  if (m[0].some((n) => n.t !== 'fight')) bad('floor 1 must be fights');
  if (m[F - 2].some((n) => n.t !== 'rest')) bad('the floor before the boss must be the camp');
  if (m[F - 1].length !== 1 || m[F - 1][0].t !== 'boss') bad('boss on the last floor');
  if (m[0].length < 2) bad('at least two starts');
  if (m.slice(0, 2).some((fl) => fl.some((n) => n.t === 'elite'))) bad('elite before floor 3');
  if (m.slice(1, 3).concat(m.slice(F - 3, F - 2)).some((fl) => fl.some((n) => n.t === 'rest'))) bad('rest on floors 2, 3 or right before the camp');
  if (m.flat().filter((n) => n.t === 'treasure').length > 2) bad('more than 2 treasures');
  const reached = m.map(() => new Set()); m[0].forEach((_, i) => reached[0].add(i));
  m.forEach((fl, f) => fl.forEach((n, i) => {
    if (f < F - 1 && !n.n.length) bad('dead end');
    n.n.forEach((j) => { const nx = m[f + 1] && m[f + 1][j]; if (!nx) { bad('edge to nowhere'); return; } reached[f + 1].add(j);
      if (n.t === nx.t && quiet.includes(n.t) && f + 1 < F - 2) bad(n.t + ' twice in a row'); });
    fl.forEach((o, k) => { if (k <= i) return; n.n.forEach((a) => o.n.forEach((b) => { if (fl[k].c > n.c && m[f + 1][b].c < m[f + 1][a].c) bad('crossing'); })); });
  }));
  m.forEach((fl, f) => { if (reached[f].size !== fl.length) bad('unreachable node'); });
}

// ISO 8601 calendar weeks and the school-year stamp card
for (const [d, k] of [['2026-11-09', '2026-W46'], ['2026-11-15', '2026-W46'], ['2026-11-16', '2026-W47'], ['2021-01-03', '2020-W53'], ['2024-12-30', '2025-W01'], ['2026-01-01', '2026-W01'], ['2027-01-01', '2026-W53'], ['2027-01-04', '2027-W01'], ['2010-01-03', '2009-W53']]) {
  const [y, m, day] = d.split('-').map(Number); check(M.isoWeek(new Date(y, m - 1, day)) === k, 'isoWeek ' + d + ' → ' + k, M.isoWeek(new Date(y, m - 1, day)));
}
{ const a = M.schoolWeeks(new Date(2026, 10, 9)); check(a.length === 48 && a[0] === '2026-W36' && a[47] === '2027-W30' && new Set(a).size === 48, 'school year 2026/27 has 48 weeks', [a.length, a[0], a[a.length - 1]]);
  const b = M.schoolWeeks(new Date(2026, 7, 1)); check(b.length === 47 && b[0] === '2025-W36' && b[46] === '2026-W30', 'summer gap shows the year that just ended', [b.length, b[0]]); }
// written methods: column layout, carries recomputed here, world 3 only
for (const mod of ['sadd', 'ssub']) {
  const cap = M.MODULES[mod].worldCap; check(cap[0] === 0 && cap[1] === 0 && cap[2] > 0, mod + ' only in world 3', cap);
  for (let t = 1; t <= M.MODULES[mod].maxTier; t++) for (let i = 0; i < 2000; i++) {
    const tk = M.generate(mod, t); const c = tk.col; const r = tk.answers[0];
    check(c && c.op === (mod === 'sadd' ? '+' : '−'), mod + ' op', tk);
    check(tk.text === c.rows.join(mod === 'sadd' ? ' + ' : ' − ') + ' = ?', mod + ' text', tk);
    check(r === (mod === 'sadd' ? c.rows.reduce((a, b) => a + b, 0) : c.rows[0] - c.rows[1]), mod + ' result', tk);
    check(r >= (mod === 'sadd' ? 100 : 10) && r <= 999 && c.rows.every((n) => n >= 10 && n <= 999), mod + ' range', tk);
    check(c.w === Math.max(...c.rows.concat(r).map((n) => String(n).length)) && c.carry.length === c.w && c.carry[c.w - 1] === 0, mod + ' width', tk);
    const d = (n, k) => Math.floor(n / 10 ** k) % 10; let carry = 0; const want = [];
    for (let k = 0; k < c.w; k++) { // k = place from the right
      const top = mod === 'sadd' ? c.rows.reduce((s, n) => s + d(n, k), 0) + carry : d(c.rows[0], k);
      const out = mod === 'sadd' ? top % 10 : (top - d(c.rows[1], k) - carry + 10) % 10;
      check(out === d(r, k), mod + ' digit ' + k, tk);
      carry = mod === 'sadd' ? Math.floor(top / 10) : (top < d(c.rows[1], k) + carry ? 1 : 0); want.unshift(carry);
    }
    check(carry === 0 && JSON.stringify(want.slice(1).concat(0)) === JSON.stringify(c.carry), mod + ' carries', tk);
    const n = c.carry.filter(Boolean).length;
    if (mod === 'sadd') { check(n >= 1 && c.rows.length === t + 1, 'sadd summands and carry', tk); }
    else check(c.rows.length === 2 && n === t, 'ssub carries per tier', tk);
  }
}
// step 21: written multiplication, divisibility, number walls, fractions of, Punkt vor Strich, number words
{
  const cap = M.MODULES.smul.worldCap; check(cap[0] === 0 && cap[1] === 0 && cap[2] > 0, 'smul only in world 3', cap);
  for (let t = 1; t <= 2; t++) for (let i = 0; i < 2000; i++) {
    const tk = M.generate('smul', t); const c = tk.col; const [a, b] = c.rows; const r = tk.answers[0];
    check(c.op === '·' && tk.text === `${a} · ${b} = ?` && r === a * b && a >= 100 && a <= 999 && b >= 2 && b <= 9 && r <= 999 && c.w === 3, 'smul task', tk);
    const d = (n, k) => Math.floor(n / 10 ** k) % 10; let carry = 0; const want = [];
    for (let k = 0; k < 3; k++) { const v = d(a, k) * b + carry; check(v % 10 === d(r, k), 'smul digit', tk); carry = Math.floor(v / 10); want.unshift(carry); }
    check(carry === 0 && JSON.stringify(want.slice(1).concat(0)) === JSON.stringify(c.carry), 'smul carries', tk);
    check(t === 1 ? c.carry.every((x) => !x) : c.carry.some(Boolean), 'smul carry per tier', tk);
  }
  const qs = (n) => String(n).split('').reduce((s, x) => s + +x, 0);
  // the rules the tutorial teaches, checked against real division
  const rule = { 2: (n) => n % 10 % 2 === 0, 5: (n) => [0, 5].includes(n % 10), 10: (n) => n % 10 === 0, 100: (n) => n % 100 === 0, 3: (n) => qs(n) % 3 === 0, 9: (n) => qs(n) % 9 === 0 };
  for (let n = 1; n <= 999; n++) for (const [k, f] of Object.entries(rule)) check(f(n) === (n % k === 0), 'divisibility rule ' + k, n);
  const seen = { ja: 0, nein: 0 };
  for (let t = 1; t <= 3; t++) for (let i = 0; i < 2000; i++) {
    const tk = M.generate('teilbar', t); let m;
    if (tk.kind !== 'choice') { check(t === 3 && tk.ask.includes('Quersumme') && /^\d{3}$/.test(tk.text) && tk.answers[0] === qs(+tk.text), 'quersumme', tk); continue; }
    if ((m = tk.q.match(/^Ist (\d+) durch (\d+) teilbar\?$/))) { check(tk.answer === (+m[1] % +m[2] === 0 ? 'ja' : 'nein') && tk.options.join() === 'ja,nein', 'teilbar ja/nein', tk); seen[tk.answer]++;
      check((t === 3 ? [3, 9, 100] : [2, 5, 10]).includes(+m[2]) && (t === 1 ? +m[1] < 100 : +m[1] >= 100 && +m[1] <= 999), 'teilbar range', tk); }
    else { m = tk.q.match(/^Welche Zahl ist durch (\d+) teilbar\?$/); check(t === 2 && m && tk.options.filter((o) => +o % +m[1] === 0).length === 1 && +tk.answer % +m[1] === 0, 'teilbar: exactly one divisible', tk); }
  }
  check(seen.ja > 500 && seen.nein > 500, 'teilbar asks ja and nein', seen);
  for (let t = 1; t <= 3; t++) for (let i = 0; i < 2000; i++) {
    const tk = M.generate('mauer', t); const v = [...tk.svg.matchAll(/data-v="(\?|\d+)"/g)].map((x) => x[1]); const miss = v.indexOf('?');
    check(v.filter((x) => x === '?').length === 1, 'mauer: one stone missing', tk);
    // fill in the answer and check every rule, so the missing stone has exactly this one value
    const n = v.map((x) => (x === '?' ? tk.answers[0] : +x));
    if (t < 3) { check(n.length === 6 && n[3] === n[0] + n[1] && n[4] === n[1] + n[2] && n[5] === n[3] + n[4] && n.every((x) => x >= 2 && x <= (t === 1 ? 99 : 999)), 'zahlenmauer', tk);
      if (t === 1) check(miss <= 4, 'mauer1: bottom or middle', tk); }
    else check(n.length === 6 && n[3] === n[0] + n[1] && n[4] === n[1] + n[2] && n[5] === n[0] + n[2] && n.every((x) => x >= 2 && x <= 999), 'rechendreieck', tk);
  }
  const FR = { '½': 1 / 2, '¼': 1 / 4, '¾': 3 / 4, '⅓': 1 / 3 }; const UNIT = { 'm cm': 100, 'h min': 60, 'kg g': 1000, 'km m': 1000 };
  for (let t = 1; t <= 3; t++) for (let i = 0; i < 2000; i++) {
    const tk = M.generate('bruch', t); let m;
    if ((m = tk.text.match(/^([½¼¾⅓]) von (\d+) = \?$/))) { check(t < 3 && Math.abs(FR[m[1]] * +m[2] - tk.answers[0]) < 1e-9 && (t === 2 || ['½', '¼'].includes(m[1])) && tk.ask.includes(`(${m[1]})`), 'bruch', tk); }
    else { m = tk.text.match(/^([½¼¾]) (\w+) = \? (\w+)$/); check(t === 3 && m && UNIT[m[2] + ' ' + m[3]] && FR[m[1]] * UNIT[m[2] + ' ' + m[3]] === tk.answers[0], 'bruch size', tk); }
  }
  for (let t = 1; t <= 2; t++) for (let i = 0; i < 2000; i++) {
    const tk = M.generate('vorrang', t); const m = tk.text.match(/^(\d+) ([+−·:]) (\d+) ([+−·:]) (\d+) = \?$/);
    if (!m) { check(false, 'vorrang form', tk); continue; }
    const pt = (o) => o === '·' || o === ':'; check(pt(m[2]) !== pt(m[4]), 'vorrang: one dot and one dash', tk);
    const dot = (a, o, b) => (o === '·' ? a * b : a / b); const res = pt(m[2]) ? (m[4] === '+' ? dot(+m[1], m[2], +m[3]) + +m[5] : dot(+m[1], m[2], +m[3]) - +m[5]) : (m[2] === '+' ? +m[1] + dot(+m[3], m[4], +m[5]) : +m[1] - dot(+m[3], m[4], +m[5]));
    check(res === tk.answers[0] && Number.isInteger(res), 'vorrang result', tk);
    if (t === 2) check([m[1], m[3], m[5]].filter((x) => +x % 10 === 0).length >= 2, 'vorrang2 tens', tk);
  }
  for (const [n, wd] of [[13, 'dreizehn'], [16, 'sechzehn'], [17, 'siebzehn'], [21, 'einundzwanzig'], [30, 'dreißig'], [48, 'achtundvierzig'], [57, 'siebenundfünfzig'], [66, 'sechsundsechzig'], [70, 'siebzig'], [100, 'einhundert'], [101, 'einhunderteins'], [111, 'einhundertelf'], [212, 'zweihundertzwölf'], [348, 'dreihundertachtundvierzig'], [601, 'sechshunderteins'], [771, 'siebenhunderteinundsiebzig'], [990, 'neunhundertneunzig'], [1000, 'eintausend']]) check(M.numWord(n) === wd, 'numWord ' + n, M.numWord(n));
  check(new Set(Array.from({ length: 999 }, (_, i) => M.numWord(i + 1))).size === 999, 'number words are unique');
  for (let t = 1; t <= 3; t++) for (let i = 0; i < 2000; i++) {
    const tk = M.generate('zahlwort', t);
    if (t < 3) { check(tk.word && M.numWord(tk.answers[0]) === tk.text && (t === 1 ? tk.answers[0] < 100 : tk.answers[0] > 100), 'zahlwort', tk); continue; }
    const pv = (s) => { const g = (u) => +(s.match(new RegExp('(\\d) ' + u)) || [0, NaN])[1]; return 100 * g('H') + 10 * g('Z') + g('E'); };
    if (tk.kind === 'choice') { const n = +tk.q.match(/^(\d+) = \? H \? Z \? E$/)[1]; check(tk.options.filter((o) => pv(o) === n).length === 1 && pv(tk.answer) === n && tk.options.length === 3, 'stellenwert choice', tk); }
    else check(pv(tk.text) === tk.answers[0], 'stellenwert', tk);
  }
}
console.log(M.makeMap().map((r) => r.map((n) => n.t).join('/')).join(' | '));
console.log('fails',fails.length); if(fails.length){ console.log(fails.slice(0,10).join('\n')); process.exit(1); }
