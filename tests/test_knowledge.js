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
for(const [name,arr] of Object.entries({L_EVENTS_ORDER:K.L_EVENTS_ORDER,GROW:K.GROW,STORY:K.STORY,PARTS:K.PARTS})){
  const ids=arr.map(x=>x.id), texts=arr.map(x=>x.text||x.name);
  if(new Set(ids).size!==ids.length) fails.push(name+' duplicate ids'); if(new Set(texts).size!==texts.length) fails.push(name+' duplicate texts'); }

const ids=K.K_POOL.map(p=>p.id).concat(K.L_POOL.map(p=>p.id)); const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);
console.log('knowledge fails',fails.length,'duplicate ids',dup.length,'questions',Object.keys(know).length);
if(fails.length||dup.length){ console.log(fails.slice(0,20), dup); process.exit(1); }
