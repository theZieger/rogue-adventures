const K=require('../src/knowledge.js');const S=require('../src/sachkunde.js');const know={};let seq=0;const fails=[];
for(const [mode,cfg] of Object.entries(K.MODES)){ for(const mod of Object.keys(cfg.modules)){ for(let t=1;t<=cfg.modules[mod].maxTier;t++){ for(let i=0;i<400;i++){ const q=K.generate(mode,mod,t,know,++seq);
 if(q.kind==='choice'||q.kind==='parts'){ if(!q.options.includes(q.answer)) fails.push(JSON.stringify(q)); if(new Set(q.options).size!==q.options.length) fails.push('dup '+q.q); }
 if(q.kind==='order'){ const ids=q.items.map(x=>x.id), texts=q.items.map(x=>x.text);
   if(new Set(ids).size!==ids.length||new Set(texts).size!==texts.length) fails.push('order items not distinct '+q.qid);
   if(q.order.join()!==ids.join()||q.display.length!==q.items.length||!q.display.every(x=>ids.includes(x.id))) fails.push('order inconsistent '+q.qid); }
 if(!cfg.tut[q.group]) fails.push('no tut '+q.group); if(!cfg.notes[q.note]) fails.push('no note '+q.note);
 K.record(know,q.qid,Math.random()<0.8,seq); }}}}

// validate every pool entry directly (schema: id, mod, g, q; T/F entries have boolean a and `why` when false;
// choice entries have o[] and an in-range index a; parts entries name a part of their picture (potato, cereal, water cycle))
const partsOf=(e)=>e.plant?S.PLANTS[e.plant].parts:K.PARTS;
for(const [mode,cfg] of Object.entries(K.MODES)){ for(const e of cfg.pool){ const tag=mode+'/'+(e.id||'?');
  for(const f of ['id','mod','g','q']) if(typeof e[f]!=='string'||!e[f]) fails.push(tag+' missing '+f);
  if(!cfg.modules[e.mod]) fails.push(tag+' unknown mod '+e.mod);
  if(!cfg.notes[e.g]) fails.push(tag+' unknown note group '+e.g);
  const isTF=e.mod==='rf'||e.rf===true;
  if(e.part!==undefined){ const p=partsOf(e).find(p=>p.id===e.part); if(!p) fails.push(tag+' unknown part'); else if(p.name!==e.a) fails.push(tag+' part name mismatch'); }
  else if(isTF){ if(typeof e.a!=='boolean') fails.push(tag+' T/F answer not boolean'); if(e.a===false&&!(typeof e.why==='string'&&e.why)) fails.push(tag+' false statement without why'); if(e.o) fails.push(tag+' T/F with options'); }
  else { if(!Array.isArray(e.o)||e.o.length<2) fails.push(tag+' needs options');
    else { if(!Number.isInteger(e.a)||e.a<0||e.a>=e.o.length) fails.push(tag+' answer index out of range');
      if(new Set(e.o).size!==e.o.length) fails.push(tag+' duplicate options');
      if(e.o.some(x=>typeof x!=='string'||!x.trim())) fails.push(tag+' empty option'); } }
  if(e.mod==='lt'||e.mod==='ltk'||e.mod==='regel'&&!e.rf&&e.o&&e.q.includes('___')){ if((e.q.match(/___/g)||[]).length!==1) fails.push(tag+' gap text needs exactly one ___'); }
}}
// order sources: distinct ids and texts
for(const [name,arr] of Object.entries({L_EVENTS_ORDER:K.L_EVENTS_ORDER,KJ_GEBOTE:K.KJ_GEBOTE,KJ_STORY:K.KJ_STORY,GROW:K.GROW,STORY:K.STORY,PARTS:K.PARTS,BROT:S.BROT,GRAIN_PARTS:S.GRAIN_PARTS,CYCLE_PARTS:S.CYCLE_PARTS,CEREALS:S.CEREALS,WATER:S.WATER.map(x=>({id:x.id,text:x.label})),FLOAT:S.FLOAT.map(x=>({id:x.acc,text:x.label}))})){
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
// Sachkunde: every unit has enough questions, every generated picture task has exactly one fitting answer
for(const m of ['kornkammer','wetterstation','kompass']){ const cfg=K.MODES[m]; if(cfg.pool.length<40) fails.push(m+' has only '+cfg.pool.length+' questions');
  for(const mod of Object.keys(cfg.modules)) for(let t=1;t<=cfg.modules[mod].maxTier;t++) for(let i=0;i<300;i++){ const q=K.generate(m,mod,t,{},++seq);
    if(q.kind==='choice'||q.kind==='parts'){ if(q.options.filter(o=>o===q.answer).length!==1) fails.push(m+' not exactly one correct '+q.qid); if(q.options.length<2) fails.push(m+' too few options '+q.qid); }
    if(q.kind==='parts'||q.kind==='parts-find'){ if(!S.PLANTS[q.plant]||!S.PLANTS[q.plant].parts.some(p=>p.id===q.part&&p.name===q.answer)) fails.push(m+' bad picture part '+q.qid); }
    if(/[0-9],[0-9]/.test(q.q+(q.options||[]).join('|'))) fails.push(m+' comma number '+q.q); } }
// Wettervorhersage: the answer is read from the card, and temperatures on the card are all different
for(let i=0;i<300;i++){ const q=K.generate('wetterstation','vorhersage',1,{},++seq); if(!q.pic) continue; const temps=(q.pic.match(/>(−?\d+) °C</g)||[]); if(new Set(temps).size!==4) fails.push('forecast temps not distinct '+temps);
  if(q.q.startsWith('Wie warm')&&!q.pic.includes('>'+q.answer+'<')) fails.push('forecast answer not on card '+q.answer); }
// Plan: wrong places are not even roughly in the asked direction
for(let i=0;i<300;i++){ const q=K.generate('kompass','plan',1,{},++seq); if(q.qid.startsWith('plandir_')&&!/^Im (Nord|Ost|Süd|West)/.test(q.answer)) fails.push('plan direction answer '+q.answer); }
// Schatzkarte: target computation and generated maps
{ const T=(s,st)=>S.karteTarget(s,st).join(',');
  if(T([2,2],[{d:'O',n:2},{d:'N',n:1}])!=='1,4') fails.push('karteTarget east/north');
  if(T([4,0],[{d:'NO',n:2}])!=='2,2') fails.push('karteTarget northeast');
  if(T([0,4],[{d:'SW',n:1},{d:'W',n:2}])!=='1,1') fails.push('karteTarget southwest/west');
  if(S.karteText([{d:'O',n:2},{d:'N',n:1}])!=='Gehe 2 Felder nach Osten und dann 1 Feld nach Norden.') fails.push('karteText '+S.karteText([{d:'O',n:2},{d:'N',n:1}]));
  if(S.karteText([{d:'S',n:3}],true)!=='Gehe 300 m nach Süden.') fails.push('karteText metres');
  const side=['NO','SO','SW','NW'];
  for(let t=1;t<=3;t++) for(let i=0;i<500;i++){ const k=S.makeKarte(t);
    if(k.kind==='choice'){ if(t<3) fails.push('distance task below tier 3'); const m=k.qid.match(/^kdist_(\d)(\d)(\d)(\d)$/); const dist=(Math.abs(m[1]-m[3])+Math.abs(m[2]-m[4]))*100; if(k.answer!==dist+' m'||k.options.filter(o=>o===k.answer).length!==1||k.options.length!==3) fails.push('distance task '+JSON.stringify(k.options)+' '+k.answer); continue; }
    let pos=k.start; for(const s of k.steps){ pos=S.karteTarget(pos,[s]); if(!S.inGrid(pos)) fails.push('path leaves the map '+k.qid); }
    if(pos.join()!==k.target.join()||!S.inGrid(k.target)||k.target.join()===k.start.join()) fails.push('karte target '+k.qid);
    const hasSide=k.steps.some(s=>side.includes(s.d)); if(t===1&&hasSide) fails.push('tier 1 with Nebenrichtung'); if(t===2&&!hasSide) fails.push('tier 2 without Nebenrichtung'); if(t===3&&(hasSide||!k.q.includes(' m nach'))) fails.push('tier 3 needs metres along main directions '+k.q);
    for(const s of k.steps) if(!k.q.includes(S.DIRS[s.d][2])) fails.push('instruction misses a direction '+k.q); } }
// Forscherlabor: five experiments, each with exactly one result; urn outcome follows from the ball counts
for(let i=0;i<300;i++){ const set=S.laborSet(); if(set.length!==5) fails.push('labor set size '+set.length);
  for(const x of set){ if(!Number.isInteger(x.a)||x.a<0||x.a>=x.opts.length||!x.note||!x.q) fails.push('labor experiment '+JSON.stringify(x).slice(0,80));
    if(!K.MODES.wetterstation.notes[x.topic]) fails.push('labor topic without note '+x.topic); }
  const kinds=set.map(x=>x.kind).sort().join(); if(kinds!=='float,float,state,state,urne') fails.push('labor mix '+kinds); }
for(let i=0;i<300;i++){ const u=S.urnExperiment(); const want=u.r[0]>u.r[1]?0:u.r[1]>u.r[0]?1:2; if(u.a!==want) fails.push('urn outcome '+u.r); }
for(const f of S.FLOAT) if(!f.why||typeof f.f!=='boolean') fails.push('float entry '+f.label);
// Landkreis: no questions while the list is empty; a filled list gives valid questions
if(S.LANDKREIS.length===0&&K.MODES.kompass.pool.some(e=>e.g==='heimat')) fails.push('landkreis questions without data');
{ const lk=S.landkreisPool([{ort:'A-Dorf',kreisstadt:true,fluss:'Fluss A',lage:'Norden'},{ort:'B-Dorf',fluss:'Fluss B',lage:'Süden'},{ort:'C-Dorf',fluss:'Fluss C',lage:'Osten'}]);
  if(lk.length!==7) fails.push('landkreisPool count '+lk.length);
  for(const e of lk) if(new Set(e.o).size!==e.o.length||e.a!==0||e.o.length!==3) fails.push('landkreisPool entry '+e.id); }
const ids=Object.values(K.MODES).flatMap(c=>c.pool.map(p=>p.id)); const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);
console.log('knowledge fails',fails.length,'duplicate ids',dup.length,'questions',Object.keys(know).length);
if(fails.length||dup.length){ console.log(fails.slice(0,20), dup); process.exit(1); }
