const M=require('../src/logic.js');
const fails=[];
function check(cond,msg,t){ if(!cond){ fails.push(msg+' '+JSON.stringify(t)); } }
const evalExpr=(txt,ans)=>{ // verify arithmetic text
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
      if(mod==='sub'&&t===2){ const [a,b]=tk.text.match(/\d+/g).map(Number); check(a%10<b,'crossing',tk);} }
    if(mod==='riddle'){ const lo=tk.digits===3?100:10, hi=tk.digits===3?999:99; // uniqueness re-check via tutorial-less brute force not possible w/o tests; check clue count
      check(tk.text.split('\n').length>=2,'cluecount',tk); check(tk.answers[0]>=lo&&tk.answers[0]<=hi,'riddlerange',tk); }
    if(mod==='seq'){ const s=tk.seq.concat(tk.answers); const d1=s[1]-s[0],d2=s[2]-s[1]; if(t<4){ check(s.every((v,i)=>i===0||v-s[i-1]===d1),'seqstep',tk);} else { check(s.every((v,i)=>i===0||v-s[i-1]===(i%2===1?d1:d2)),'altseq',tk);} if(t<=2) check(s.every(v=>v>0&&v<100),'w1seq',tk); }
    if(mod==='nb'){ const n=tk.n; const [b,a]=tk.answers; check(b<n&&n<a,'nb',tk); if(tk.nb==='Zehner') check(a-b===10,'nb10',tk); else check(a-b===100,'nb100',tk); }
    if(mod==='grid'){ const g=tk.grid; const v=g.base+(g.tr-g.sr)*g.stepD+(g.tc-g.sc)*g.stepR; check(v===tk.answers[0],'grid',tk); // all tiles in range
      for(let r=0;r<3;r++)for(let c=0;c<3;c++){const x=g.base+(r-g.sr)*g.stepD+(c-g.sc)*g.stepR; check(x>0&&x<1000,'gridrange',tk);} }
  }}}
// riddle uniqueness brute force
const digits=M.digits;
let amb=0;
for(let t=1;t<=3;t++) for(let i=0;i<300;i++){ const tk=M.generate('riddle',t); const lo=tk.digits===3?100:10, hi=tk.digits===3?999:99;
  const clues=tk.text.split('\n'); const matches=[];
  for(let x=lo;x<=hi;x++){ const d=digits(x); let ok=true; for(const c of clues){ let m;
    if(m=c.match(/Einer ist (\d+)-mal so groß wie mein Zehner/)) ok=ok&&d.z>0&&d.e===+m[1]*d.z;
    else if(m=c.match(/Zehner ist (\d+)-mal so groß wie mein Hunderter/)) ok=ok&&d.h>0&&d.z===+m[1]*d.h;
    else if(m=c.match(/Einer ist um (\d+) größer als mein Zehner/)) ok=ok&&d.e-d.z===+m[1];
    else if(m=c.match(/Einer ist um (\d+) kleiner als mein Zehner/)) ok=ok&&d.z-d.e===+m[1];
    else if(m=c.match(/Hunderter ist um (\d+) kleiner als mein Zehner/)) ok=ok&&d.z-d.h===+m[1];
    else if(m=c.match(/Hunderter ist um (\d+) größer als mein Zehner/)) ok=ok&&d.h-d.z===+m[1];
    else if(m=c.match(/Hunderter ist (\d+)\./)) ok=ok&&d.h===+m[1];
    else if(m=c.match(/Zehner ist (\d+)\./)) ok=ok&&d.z===+m[1];
    else if(m=c.match(/Einer ist (\d+)\./)) ok=ok&&d.e===+m[1];
    else if(m=c.match(/Quersumme ist (\d+)/)) ok=ok&&(d.h+d.z+d.e)===+m[1];
    else if(c.includes('gleich')) ok=ok&&d.e===d.z;
    else if(c.includes('gerade Zahl')) ok=ok&&(d.e%2===(c.includes('ungerade')?1:0));
    else { fails.push('unknown clue '+c); ok=false; }
  } if(ok) matches.push(x);} if(matches.length!==1||matches[0]!==tk.answers[0]){amb++; fails.push('riddle ambiguous '+JSON.stringify(tk)+' '+matches);} }
console.log('fails',fails.length); console.log(fails.slice(0,10).join('\n'));
for(const mod of M.MODULE_KEYS){ const tk=M.generate(mod,1); console.log(mod, JSON.stringify(tk)); }
console.log(JSON.stringify(M.generate('riddle',2)), JSON.stringify(M.generate('riddle',3)));
console.log(M.makeMap(1).map(r=>r.join('/')).join(' | '));
