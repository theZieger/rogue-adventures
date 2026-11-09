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
for(const [name,arr] of Object.entries({L_EVENTS_ORDER:K.L_EVENTS_ORDER,KJ_GEBOTE:K.KJ_GEBOTE,KJ_STORY:K.KJ_STORY,KJ_OSTERWEG:K.KJ_OSTERWEG,KJ_JAHR:K.KJ_JAHR,F_SCHLICHTEN:K.F_SCHLICHTEN,GROW:K.GROW,STORY:K.STORY,PARTS:K.PARTS})){
  const ids=arr.map(x=>x.id), texts=arr.map(x=>x.text||x.name);
  if(new Set(ids).size!==ids.length) fails.push(name+' duplicate ids'); if(new Set(texts).size!==texts.length) fails.push(name+' duplicate texts'); }

// every generated choice has exactly one correct option
for(const [mode,cfg] of Object.entries(K.MODES)) for(const mod of Object.keys(cfg.modules)) for(let i=0;i<300;i++){ const q=K.generate(mode,mod,1,{},++seq);
  if(q.kind==='choice'&&q.options.filter(o=>o===q.answer).length!==1) fails.push(mode+' not exactly one correct '+q.qid); }
// Kirchenjahr: at least 60 questions, every topic of the unit is asked in at least two task types, the ten commandments are complete
{ const kj=K.MODES.kirchenjahr; if(kj.pool.length<60) fails.push('kirchenjahr has only '+kj.pool.length+' questions');
  for(const g of ['busstag','konflikt','kreuz','kirche','bibel','gebote','advent','weihnachten','ethik']){ if(!kj.notes[g]) fails.push('kirchenjahr no note '+g);
    if(new Set(kj.pool.filter(e=>e.g===g).map(e=>e.mod)).size<2) fails.push('kirchenjahr topic '+g+' in fewer than 2 task types'); }
  if(K.KJ_GEBOTE.length!==10) fails.push('not ten commandments');
  for(const o of kj.order) if(!kj.notes[o.note]||o.items.length<4) fails.push('kirchenjahr order source '+o.qid); }
// Kirchenjahr Teil 2: world 2 asks only world-2 questions and orders, world 1 only the old ones
{ const kj=K.MODES.kirchenjahr; const w2=new Set(kj.pool.filter(e=>e.w===2).map(e=>e.id));
  if(kj.worlds!==2) fails.push('kirchenjahr needs two worlds');
  if(w2.size<50) fails.push('kirchenjahr world 2 has only '+w2.size+' questions');
  if(kj.pool.some(e=>e.w!==undefined&&e.w!==2)) fails.push('kirchenjahr unknown world tag');
  for(const g of ['fastenzeit','symbole','ostern','himmelfahrt','pfingsten','taufe','festkreis','sorben']){ if(!kj.notes[g]) fails.push('kirchenjahr no note '+g);
    const qs=kj.pool.filter(e=>e.g===g); if(!qs.length||qs.some(e=>e.w!==2)) fails.push('kirchenjahr topic '+g+' not only in world 2');
    if(new Set(qs.map(e=>e.mod)).size<2) fails.push('kirchenjahr topic '+g+' in fewer than 2 task types'); }
  const w2orders=new Set(kj.order.filter(o=>o.w===2).map(o=>o.qid)); if(!w2orders.size) fails.push('kirchenjahr world 2 has no order task');
  for(const mod of Object.keys(kj.modules)) for(let i=0;i<300;i++) for(const world of [1,2]){ const q=K.generate('kirchenjahr',mod,1,know,++seq,{world});
    const isW2=q.kind==='order'?[...w2orders].some(p=>q.qid.startsWith(p)):w2.has(q.qid);
    if(isW2!==(world===2)) { fails.push('kirchenjahr world '+world+' got '+q.qid); break; }
    if(!kj.tut[q.group]||!kj.notes[q.note]) fails.push('kirchenjahr world 2 tut/note '+q.qid);
    if(q.kind==='choice'&&q.options.filter(o=>o===q.answer).length!==1) fails.push('kirchenjahr not exactly one correct '+q.qid); } }
// Gute Freunde: at least 50 questions, notes for the four main topics, dilemma cards
{ const gf=K.MODES.freunde; if(gf.pool.length<50) fails.push('freunde has only '+gf.pool.length+' questions');
  for(const g of ['goldene','streit','freundschaft','wahrheit']) if(!gf.notes[g]) fails.push('freunde no note '+g);
  for(const g of new Set(gf.pool.map(e=>e.g))) if(new Set(gf.pool.filter(e=>e.g===g).map(e=>e.mod)).size<2) fails.push('freunde topic '+g+' in fewer than 2 task types');
  const dil=gf.events.filter(e=>e.dilemma); if(dil.length<8) fails.push('freunde has only '+dil.length+' dilemma cards');
  // bullying situations always offer getting help from an adult
  for(const e of dil) if(/ausgelacht|lacht über|Auslachen/.test(e.text)&&!e.opts.some(o=>o.label==='Hol dir Hilfe bei einem Erwachsenen.')) fails.push('freunde dilemma without adult help: '+e.title);
  for(const o of gf.order) if(!gf.notes[o.note]||o.items.length<4) fails.push('freunde order source '+o.qid); }
const ids=Object.values(K.MODES).flatMap(c=>c.pool.map(p=>p.id)); const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);
console.log('knowledge fails',fails.length,'duplicate ids',dup.length,'questions',Object.keys(know).length);
if(fails.length||dup.length){ console.log(fails.slice(0,20), dup); process.exit(1); }
