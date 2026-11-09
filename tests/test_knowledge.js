const K=require('../src/knowledge.js');const know={};let seq=0;const fails=[];
for(const [mode,cfg] of Object.entries(K.MODES)){ for(const mod of Object.keys(cfg.modules)){ for(let t=1;t<=cfg.modules[mod].maxTier;t++){ for(let i=0;i<400;i++){ const q=K.generate(mode,mod,t,know,++seq);
 if(q.kind==='choice'||q.kind==='parts'){ if(!q.options.includes(q.answer)) fails.push(JSON.stringify(q)); if(new Set(q.options).size!==q.options.length) fails.push('dup '+q.q); }
 if(q.kind==='order'){ const ids=q.items.map(x=>x.id), texts=q.items.map(x=>x.text);
   if(new Set(ids).size!==ids.length||new Set(texts).size!==texts.length) fails.push('order items not distinct '+q.qid);
   if(q.order.join()!==ids.join()||q.display.length!==q.items.length||!q.display.every(x=>ids.includes(x.id))) fails.push('order inconsistent '+q.qid); }
 if(!cfg.tut[q.group]) fails.push('no tut '+q.group); if(!cfg.notes[q.note]) fails.push('no note '+q.note);
 K.record(know,q.qid,Math.random()<0.8,seq); }}}}

// validate every pool entry directly (schema: id, mod, g, q; T/F entries have boolean a and `why` when false;
// choice entries have o[] and an in-range index a; parts entries name a PARTS id)
const partIds=new Set(K.PARTS.map(p=>p.id));
for(const [mode,cfg] of Object.entries(K.MODES)){ for(const e of cfg.pool){ const tag=mode+'/'+(e.id||'?');
  for(const f of ['id','mod','g','q']) if(typeof e[f]!=='string'||!e[f]) fails.push(tag+' missing '+f);
  if(!cfg.modules[e.mod]) fails.push(tag+' unknown mod '+e.mod);
  if(!cfg.notes[e.g]) fails.push(tag+' unknown note group '+e.g);
  const isTF=e.mod==='rf'||e.rf===true;
  if(e.mod==='parts'){ if(!partIds.has(e.part)) fails.push(tag+' unknown part'); if(K.PARTS.find(p=>p.id===e.part)?.name!==e.a) fails.push(tag+' part name mismatch'); }
  else if(isTF){ if(typeof e.a!=='boolean') fails.push(tag+' T/F answer not boolean'); if(e.a===false&&!(typeof e.why==='string'&&e.why)) fails.push(tag+' false statement without why'); if(e.o) fails.push(tag+' T/F with options'); }
  else { if(!Array.isArray(e.o)||e.o.length<2) fails.push(tag+' needs options');
    else { if(!Number.isInteger(e.a)||e.a<0||e.a>=e.o.length) fails.push(tag+' answer index out of range');
      if(new Set(e.o).size!==e.o.length) fails.push(tag+' duplicate options');
      if(e.o.some(x=>typeof x!=='string'||!x.trim())) fails.push(tag+' empty option'); } }
  if(e.mod==='lt'||e.mod==='ltk'){ if((e.q.match(/___/g)||[]).length!==1) fails.push(tag+' gap text needs exactly one ___'); }
}}
// order sources: distinct ids and texts
for(const [name,arr] of Object.entries({L_EVENTS_ORDER:K.L_EVENTS_ORDER,KJ_GEBOTE:K.KJ_GEBOTE,KJ_STORY:K.KJ_STORY,GROW:K.GROW,STORY:K.STORY,PARTS:K.PARTS})){
  const ids=arr.map(x=>x.id), texts=arr.map(x=>x.text||x.name);
  if(new Set(ids).size!==ids.length) fails.push(name+' duplicate ids'); if(new Set(texts).size!==texts.length) fails.push(name+' duplicate texts'); }

// Deutsch: every list entry has the fields its task type needs, and each task has exactly one right answer
const W=K.W; const de=(c,msg)=>{ if(!c) fails.push('deutsch: '+msg); };
const art=(w)=>w.split(' ')[0]; const ARTS=['der','die','das'];
const pairs=(name,arr,n)=>arr.forEach((x,i)=>de(Array.isArray(x)&&x.length===n&&x.every(v=>typeof v==='string'&&v.trim()),`${name}[${i}] needs ${n} texts`));
pairs('doppel',W.doppel,2); pairs('verlaengern',W.verlaengern,2); pairs('dehnungsh',W.dehnungsh,3); pairs('zusammen',W.zusammen,3); pairs('rede',W.rede,2);
pairs('zeitformen',W.zeitformen,3); pairs('steigerung',W.steigerung,3); pairs('vergleiche',W.vergleiche,2); pairs('teekessel',W.teekessel,3);
W.doppel.concat(W.dehnungsh).forEach(([r,f])=>de(r!==f,'same spelling twice: '+r));
W.doppel.forEach(([r])=>de(/(bb|dd|ff|gg|ll|mm|nn|pp|rr|ss|tt|ck|tz)/.test(r),'doppel without double consonant, ck or tz: '+r));
W.verlaengern.forEach(([w,l])=>{ de('dtgkbp'.includes(w.slice(-1)),'verlaengern must end on d/t/g/k/b/p: '+w); de(l.includes('-'),'verlaengern needs a syllable dash: '+l); });
W.dehnungsh.forEach(([r,,s])=>de(r.includes('h')&&s.includes('-'),'dehnungsh needs h and syllables: '+r));
W.zusammen.forEach(([a,b,z])=>{ de([a,b,z].every(x=>ARTS.includes(art(x))),'zusammen needs articles: '+z); de(art(z)===art(b),'zusammen article must come from the last part: '+z); });
W.rede.forEach(([b,r])=>{ de(b.endsWith(':'),'rede needs a colon: '+b); de(/[.!?]$/.test(r)&&r.split(' ').length>=2,'rede needs two words and a full stop: '+r); });
W.vergleiche.forEach(([q,x])=>{ de((q.match(/___/g)||[]).length===1,'vergleiche needs one ___: '+q); de(x==='als'||x==='wie','vergleiche answer als/wie: '+q); });
const key3=(w)=>w.slice(0,3).toLowerCase();
de(W.abc.length>=8,'abc needs words'); W.abc.forEach(w=>de(/^[A-Za-z]{2,3}/.test(w)&&!/[äöüß]/i.test(key3(w)),'abc word needs plain first letters: '+w));
de(new Set(W.abc.map(key3)).size===W.abc.length,'abc words must differ within the first three letters');
W.nomen.forEach(n=>{ de(ARTS.includes(art(n))&&/^[A-ZÄÖÜ]/.test(n.split(' ')[1]||''),'nomen needs article and capital: '+n); de(!W.verben.concat(W.adjektive,W.pronomen).includes(n.split(' ')[1].toLowerCase()),'nomen also a small word: '+n); });
W.verben.concat(W.adjektive,W.pronomen).forEach(w=>de(/^[a-zäöüß]+$/.test(w),'small word expected: '+w));
const allWords=W.nomen.map(n=>n.split(' ')[1]).concat(W.verben,W.adjektive,W.pronomen); de(new Set(allWords).size===allWords.length,'word in two word classes');
['der','die','das'].forEach(a=>de(W.nomen.some(n=>art(n)===a),'no noun with '+a));
K.SAETZE.forEach(({parts,s},i)=>{ de(parts.length>=3&&s>=0&&s!==1&&W.saetze[i].split('[').length===2,'saetze needs 3+ parts, one [subject], not second: '+W.saetze[i]); de(new Set(parts).size===parts.length,'saetze parts not distinct: '+W.saetze[i]); });
de(K.SAETZE.filter(x=>x.parts.length===3&&x.s===0).length>=4,'umstellprobe needs sentences with three parts starting with the subject');
const ob=Object.entries(W.oberbegriffe); de(ob.length>=3,'oberbegriffe needs 3 groups'); ob.forEach(([o,ws])=>de(Array.isArray(ws)&&ws.length>=3,'oberbegriff needs 3 words: '+o));
const obWords=ob.flatMap(([,ws])=>ws); de(new Set(obWords).size===obWords.length,'a word belongs to two Oberbegriffe');
de(new Set(W.teekessel.map(x=>x[0])).size===W.teekessel.length,'teekessel words not distinct');
const total=['doppel','verlaengern','dehnungsh','zusammen','abc','rede','nomen','verben','adjektive','pronomen','zeitformen','steigerung','vergleiche','saetze','teekessel'].reduce((n,k)=>n+W[k].length,0)+obWords.length;
de(total>=150,'at least 150 words and sentences, have '+total);
// generated Deutsch tasks: dictionary order is the ABC order, the Umstellprobe keeps the verb second and changes the sentence
for(let i=0;i<300;i++){ const a=K.generate('woerterwerkstatt','abc',1,{},i); const ws=a.order.map(id=>a.items.find(x=>x.id===id).text); de(ws.length===4&&ws.every((w,j)=>!j||key3(ws[j-1])<key3(w)),'abc order wrong '+ws);
  const u=K.generate('satzbaustelle','umstell',1,{},i); const s=K.SAETZE.find(x=>'um_'+x.parts.join(' ')===u.qid); de(s&&u.order.map(id=>u.items.find(x=>x.id===id).text)[1]===s.parts[1]&&u.items[0].text!==s.parts[0],'umstell wrong '+u.qid); }
for(const m of ['woerterwerkstatt','satzbaustelle']) for(const mod of Object.keys(K.MODES[m].modules)) de(K.MODES[m].pool.some(e=>e.mod===mod)||['abc','umstell'].includes(mod),'no tasks for '+mod);
console.log('deutsch words and sentences',total);

// every generated choice has exactly one correct option
for(const [mode,cfg] of Object.entries(K.MODES)) for(const mod of Object.keys(cfg.modules)) for(let i=0;i<300;i++){ const q=K.generate(mode,mod,1,{},++seq);
  if(q.kind==='choice'&&q.options.filter(o=>o===q.answer).length!==1) fails.push(mode+' not exactly one correct '+q.qid); }
// Kirchenjahr: at least 60 questions, every topic of the unit is asked in at least two task types, the ten commandments are complete
{ const kj=K.MODES.kirchenjahr; if(kj.pool.length<60) fails.push('kirchenjahr has only '+kj.pool.length+' questions');
  for(const g of ['busstag','konflikt','kreuz','kirche','bibel','gebote','advent','weihnachten','ethik']){ if(!kj.notes[g]) fails.push('kirchenjahr no note '+g);
    if(new Set(kj.pool.filter(e=>e.g===g).map(e=>e.mod)).size<2) fails.push('kirchenjahr topic '+g+' in fewer than 2 task types'); }
  if(K.KJ_GEBOTE.length!==10) fails.push('not ten commandments');
  for(const o of kj.order) if(!kj.notes[o.note]||o.items.length<4) fails.push('kirchenjahr order source '+o.qid); }
// Schulgarten: every crop has questions, every question has a valid answer, the generator returns it
for(const e of K.GARDEN_POOL){ if(!K.CROPS[e.crop]&&e.crop!=='getreide') fails.push('garden unknown crop '+e.id);
  if(!Array.isArray(e.o)||!Number.isInteger(e.a)||!e.o[e.a]||new Set(e.o).size!==e.o.length) fails.push('garden bad options '+e.id); }
for(const c of Object.keys(K.CROPS)){ if(K.GARDEN_POOL.filter(e=>e.crop===c).length<3) fails.push('garden too few questions '+c);
  for(let i=0;i<50;i++){ const q=K.gardenQuestion(c); const e=K.GARDEN_POOL.find(x=>x.id===q.qid);
    if(!q.options.includes(q.answer)||(e.crop!==c&&!(e.crop==='getreide'&&c!=='kartoffel'))) fails.push('garden question '+c+' '+q.qid); } }
const ids=Object.values(K.MODES).flatMap(c=>c.pool.map(p=>p.id)).concat(K.GARDEN_POOL.map(p=>p.id)); const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);
console.log('knowledge fails',fails.length,'duplicate ids',dup.length,'questions',Object.keys(know).length);
if(fails.length||dup.length){ console.log(fails.slice(0,20), dup); process.exit(1); }
