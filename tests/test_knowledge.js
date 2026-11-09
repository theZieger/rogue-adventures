const K=require('../src/knowledge.js');const S=require('../src/sachkunde.js');const S2=require('../src/sachkunde2.js');const S3=require('../src/sachkunde3.js');const MU=require('../src/musik.js');const know={};let seq=0;const fails=[];
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
for(const [name,arr] of Object.entries({L_EVENTS_ORDER:K.L_EVENTS_ORDER,KJ_GEBOTE:K.KJ_GEBOTE,KJ_STORY:K.KJ_STORY,KJ_OSTERWEG:K.KJ_OSTERWEG,KJ_JAHR:K.KJ_JAHR,F_SCHLICHTEN:K.F_SCHLICHTEN,GROW:K.GROW,STORY:K.STORY,PARTS:K.PARTS,BROT:S.BROT,GRAIN_PARTS:S.GRAIN_PARTS,HERBAR:S3.HERBAR,LAYERS:S3.LAYERS,FLORA:S3.FLORA,CYCLE_PARTS:S.CYCLE_PARTS,CEREALS:S.CEREALS,WATER:S.WATER.map(x=>({id:x.id,text:x.label})),FLOAT:S.FLOAT.map(x=>({id:x.acc,text:x.label}))})){
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
// Deutsch, step 23: Wortfamilie, Ableitungen, Trennung, Komma, Großschreibung im Satz, Ersatz-/Weglassprobe, Pronomen, Redensarten
const plain=(w)=>w.toLowerCase().replace(/ä/g,'a').replace(/ö/g,'o').replace(/ü/g,'u');
W.familien.forEach(([stem,word,fam,other])=>{ de(Array.isArray(fam)&&fam.length>=3&&Array.isArray(other)&&other.length>=2,'familie needs 3 members and 2 others: '+word);
  fam.forEach(f=>de(plain(f).includes(plain(stem)),'family word without stem '+stem+': '+f)); other.forEach(o=>de(!fam.includes(o)&&o!==word,'other word is in the family: '+o)); });
pairs('nachsilben',W.nachsilben,4); W.nachsilben.forEach(([w,r,f1,f2])=>{ de(new Set([r,f1,f2]).size===3,'nachsilben not distinct: '+w); const n=ARTS.includes(art(r));
  de([f1,f2].every(f=>ARTS.includes(art(f))===n&&(!n||art(f)===art(r))),'nachsilben wrong forms must look like the answer: '+w);
  de(n?/(ung|heit|keit)$/.test(r):/(lich|ig|bar)$/.test(r),'nachsilben suffix: '+r); });
pairs('vorsilben',W.vorsilben,4); W.vorsilben.forEach(([q,r,f1,f2])=>{ de((q.match(/___/g)||[]).length===1,'vorsilben needs one ___: '+q); de(/^(ver|be|ent|vor)/.test(r)&&new Set([r,f1,f2]).size===3,'vorsilben answer/prefix: '+r); });
pairs('trennung',W.trennung,3); W.trennung.forEach(t=>{ de(t.every(x=>(x.match(/-/g)||[]).length===1&&x.replace('-','')===t[0].replace('-','')),'trennung needs one dash in the same word: '+t[0]); de(new Set(t).size===3,'trennung not distinct: '+t[0]); });
W.aufzaehlung.forEach(x=>de(x.split(' und ').length===2&&x.includes(', ')&&!x.includes(', und')&&x.endsWith('.'),'aufzaehlung format: '+x));
W.aberdenn.forEach(x=>de((x.match(/,/g)||[]).length===1&&/, (aber|denn) /.test(x),'aberdenn needs one comma before aber/denn: '+x));
W.grosssaetze.forEach(x=>{ const m=x.match(/\[([A-ZÄÖÜ][a-zäöüß]+)\]/g)||[]; de(m.length===1&&!x.startsWith('['),'grosssaetze needs one [Nomen] not at the start: '+x);
  de(x.split(' ').slice(1).filter(w=>!w.includes('[')&&/^[a-zäöüß]/.test(w)).length>=2,'grosssaetze needs two small words: '+x); });
const PRON=['er','sie','es','wir','ihr','sie (Mehrzahl)']; pairs('ersatz',W.ersatz,3); W.ersatz.forEach(([ng,r,p])=>de(PRON.includes(p)&&!/\.$/.test(r),'ersatz pronoun: '+ng));
PRON.forEach(p=>de(W.ersatz.some(x=>x[2]===p),'ersatz has no '+p));
W.weglassen.forEach(x=>{ const raw=x.split('|').map(y=>y.trim()); const i=raw.findIndex(y=>y.startsWith('['));
  de(raw.filter(y=>y.startsWith('[')).length===1&&i>0&&raw.length>=4&&new Set(raw).size===raw.length,'weglassen needs one [part], not the first: '+x); });
W.personen.forEach(v=>de(/^[a-zäöü]+en$/.test(v)&&!/[sßztd]en$/.test(v),'personen needs a regular verb: '+v));
de(W.redensarten.length>=25,'at least 25 Redensarten'); pairs('redensarten',W.redensarten.map(x=>x.slice(0,4)),4);
W.redensarten.forEach(x=>{ de(x.length===5&&typeof x[4]==='string'&&new Set(x.slice(1,4)).size===3,'redensart: '+x[0]); });
for(let i=0;i<300;i++){ const q=K.generate('satzbaustelle','ersatz',2,{},i); const e=W.ersatz.find(x=>q.qid==='eb_'+x[0]);
  q.options.filter(o=>o!==q.answer).forEach(o=>de(W.ersatz.find(x=>x[0][0].toUpperCase()+x[0].slice(1)===o)[2]!==e[2],'ersatz tier 2: distractor with the same pronoun '+o));
  const g=K.generate('woerterwerkstatt','gross',2,{},i); de(g.q.includes(g.answer)&&g.group==='gross:2','gross tier 2: '+g.qid);
  const s=K.generate('woerterwerkstatt','stamm',1,{},i); de(s.group==='stamm:1'&&s.qid.startsWith('wf_'),'stamm tier 1 asks families '+s.qid); }

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
// Sachkunde: every unit has enough questions, every generated picture task has exactly one fitting answer
for(const m of ['kornkammer','wetterstation','kompass','wiese','frueher']){ const cfg=K.MODES[m]; if(cfg.pool.length<40) fails.push(m+' has only '+cfg.pool.length+' questions');
  for(const mod of Object.keys(cfg.modules)) for(let t=1;t<=cfg.modules[mod].maxTier;t++) for(let i=0;i<300;i++){ const q=K.generate(m,mod,t,{},++seq);
    if(q.kind==='choice'||q.kind==='parts'){ if(q.options.filter(o=>o===q.answer).length!==1) fails.push(m+' not exactly one correct '+q.qid); if(q.options.length<2) fails.push(m+' too few options '+q.qid); }
    if(q.kind==='parts'||q.kind==='parts-find'){ if(!S.PLANTS[q.plant]||!S.PLANTS[q.plant].parts.some(p=>p.id===q.part&&p.name===q.answer)) fails.push(m+' bad picture part '+q.qid); }
    if(/[0-9],[0-9]/.test(q.q+(q.options||[]).join('|'))) fails.push(m+' comma number '+q.q); } }
// Wiese and Früher und heute: at least 50 questions, notes per topic, tier-2 plant traits fit only the answer
for(const m of ['wiese','frueher']){ const cfg=K.MODES[m]; if(cfg.pool.length<50) fails.push(m+' has only '+cfg.pool.length+' questions');
  for(const g of new Set(cfg.pool.map(e=>e.g))) if(!cfg.notes[g]) fails.push(m+' no note '+g); }
for(let i=0;i<500;i++){ const q=K.generate('wiese','pflanze',2,{},++seq); if(!q.qid.startsWith('wimerk_')) continue; const t=S3.TRAITS[+q.qid.slice(7)];
  const fits=q.options.filter(o=>t.has.includes(S3.FLORA.find(p=>p.name===o).id)); if(fits.length!==1||fits[0]!==q.answer) fails.push('plant trait not unique '+q.q+' '+q.options); }
for(const p of S3.FLORA) if(!S3.floraSVG(p.id).includes('<svg')) fails.push('no picture '+p.id);
if(S3.TOOLS.map(x=>x[1]).length!==new Set(S3.TOOLS.map(x=>x[1])).size||S3.TOOLS.map(x=>x[0]).length!==new Set(S3.TOOLS.map(x=>x[0])).size) fails.push('früher/heute pairs not distinct');
for(const x of S3.LOOKUP) if(!S3.SOURCES.includes(x.a)||x.skip.includes(x.a)||S3.SOURCES.length-1-x.skip.length<2) fails.push('lookup '+x.q);
for(const l of S3.LINES.concat(S3.DEV)) if(l.items.length!==4) fails.push('order source needs 4 items '+l.qid);
if(K.MODES.frueher.events.filter(e=>e.dilemma).length<4) fails.push('frueher needs dilemma cards');
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
// Die fünf Sinne und Sicher im Verkehr: 50+ questions each, notes per topic, pictures with exactly one answer
for(const m of ['sinne','verkehr']){ const cfg=K.MODES[m]; if(cfg.pool.length<50) fails.push(m+' has only '+cfg.pool.length+' questions');
  for(const mod of Object.keys(cfg.modules)) for(let t=1;t<=cfg.modules[mod].maxTier;t++) for(let i=0;i<300;i++){ const q=K.generate(m,mod,t,{},++seq);
    if(q.kind==='choice'||q.kind==='parts'){ if(q.options.filter(o=>o===q.answer).length!==1) fails.push(m+' not exactly one correct '+q.qid); if(q.options.length<2) fails.push(m+' too few options '+q.qid); }
    if((q.kind==='parts'||q.kind==='parts-find')&&!S.PLANTS[q.plant].parts.some(p=>p.id===q.part&&p.name===q.answer)) fails.push(m+' bad picture part '+q.qid);
    if(q.kind==='choice'&&q.svgOpts&&!q.why) fails.push(m+' picture options without why '+q.qid);
    if(q.tier!==Math.min(t,cfg.modules[mod].maxTier)&&q.kind!=='order'&&!cfg.pool.some(e=>e.id===q.qid)) fails.push(m+' wrong tier '+q.qid+' for '+t);
    if(!cfg.tut[q.group]||!cfg.notes[q.note]) fails.push(m+' tut/note '+q.group+' '+q.note);
    if(/[0-9],[0-9]/.test(q.q+(q.svgOpts?'':(q.options||[]).join('|')))) fails.push(m+' comma number '+q.q); } }
{ const si=K.MODES.sinne, ve=K.MODES.verkehr;
  for(const g of ['sinne','auge','ohr','schutz','hilfen','drogen']) if(!si.notes[g]||!si.pool.some(e=>e.g===g)) fails.push('sinne topic '+g);
  for(const g of ['zeichen','vorfahrt','fahrrad','abbiegen','fussweg','helm','sicht','radweg']) if(!ve.notes[g]||!ve.pool.some(e=>e.g===g)) fails.push('verkehr topic '+g);
  if(si.events.filter(e=>e.dilemma).length<5) fails.push('sinne needs dilemma cards');
  for(const e of si.events.filter(e=>e.dilemma)) if(!e.opts.some(o=>o.label==='Hol dir Hilfe bei einem Erwachsenen.')&&/rauch|Zigarette|Bier|Tabletten|tuscheln/i.test(e.text)) fails.push('sinne dilemma without adult help: '+e.title);
  // the school draws both pictures, every part of each picture is in the pool
  for(const k of ['auge','ohr','fahrrad']){ const P=S.PLANTS[k]; if(!P.steps||P.steps.length!==Math.max(...Object.values(P.stepOf))) fails.push(k+' drawing steps');
    for(const p of P.parts){ if(!P.stepOf[p.id]) fails.push(k+' part without step '+p.id); if(![si,ve].some(c=>c.pool.some(e=>e.plant===k&&e.part===p.id))) fails.push(k+' part not in pool '+p.id);
      if(!P.svg({}).includes('data-part="'+p.id+'"')||P.svg({omit:p.id}).includes('data-part="'+p.id+'"')) fails.push(k+' part drawing/omit '+p.id); } }
  // Sinnestäuschungen: five experiments, three to look at, each with one result
  for(let i=0;i<200;i++){ const set=si.labor(); if(set.length!==5||new Set(set.map(x=>x.kind)).size!==5) fails.push('illusion set '+set.map(x=>x.kind));
    if(set.filter(x=>x.pic&&x.after).length!==3) fails.push('illusion set needs three pictures');
    for(const x of set) if(!Number.isInteger(x.a)||x.a<0||x.a>=x.opts.length||!x.note||!si.notes[x.topic]) fails.push('illusion '+x.kind); }
  // Vorfahrt: recompute who goes first from the picture's arms (rechts vor links), signs and lights put the main road / green first
  const R=S2.RIGHT_OF;
  for(let i=0;i<500;i++){ const q=K.generate('verkehr','vorfahrt',1,{},++seq); if(!q.qid.startsWith('vfr_')) continue; const arms=q.qid.slice(4).split('');
    const first=arms.filter(a=>!arms.includes(R[a])); if(first.length!==1) fails.push('rechts vor links not unique '+arms);
    if(arms.length===2&&R[arms[0]]!==arms[1]&&R[arms[1]]!==arms[0]) fails.push('two cars not at a right angle '+arms); }
  for(let i=0;i<500;i++){ const q=K.generate('verkehr','vorfahrt',2,{},++seq); if(q.group!=='vorfahrt:2') fails.push('vorfahrt tier 2 group '+q.qid);
    const arms=q.qid.replace(/^vf[as]_/,'').slice(0,q.options.length).split(''); const main=['S','N'].includes(arms[0])?['S','N']:['W','E'];
    if(arms.slice(1).some(a=>main.includes(a))) fails.push('second car on the main road '+q.qid); }
  // Verkehrszeichen: every sign is drawn, meanings are distinct, Stopp and Vorfahrt gewähren never rule each other out
  const means=S2.SIGNS.map(x=>x.mean); if(new Set(means).size!==means.length) fails.push('sign meanings not distinct');
  for(const sg of S2.SIGNS) if(!/<svg[^>]*>.+<\/svg>$/.test(S2.signSVG(sg.id))) fails.push('sign not drawn '+sg.id);
  for(let i=0;i<500;i++){ const q=S2.signTask('zeichen',1); const ids=q.options.map(o=>S2.SIGNS.find(x=>x.mean===o).id); const ans=S2.SIGNS.find(x=>x.mean===q.answer).id; if(['stopp','vorfahrtgewaehren'].includes(ans)&&ids.includes('stopp')&&ids.includes('vorfahrtgewaehren')) fails.push('stop and give way together'); }
  for(const src of [S2.ABBIEGEN,S2.QUEREN]) if(src.length!==5) fails.push('order source needs 5 steps');
  for(let i=0;i<300;i++){ const q=S2.missingTask('fehlt'); const id=q.qid.slice(7); if(q.pic.includes('data-part="'+id+'"')||!S2.BIKE_PARTS.every(p=>p.id===id||q.pic.includes('data-part="'+p.id+'"'))) fails.push('missing part drawing '+id); } }
// Landkreis: no questions while the list is empty; a filled list gives valid questions
if(S.LANDKREIS.length===0&&K.MODES.kompass.pool.some(e=>e.g==='heimat')) fails.push('landkreis questions without data');
{ const lk=S.landkreisPool([{ort:'A-Dorf',kreisstadt:true,fluss:'Fluss A',lage:'Norden'},{ort:'B-Dorf',fluss:'Fluss B',lage:'Süden'},{ort:'C-Dorf',fluss:'Fluss C',lage:'Osten'}]);
  if(lk.length!==7) fails.push('landkreisPool count '+lk.length);
  for(const e of lk) if(new Set(e.o).size!==e.o.length||e.a!==0||e.o.length!==3) fails.push('landkreisPool entry '+e.id); }
// Schulgarten: every crop has questions, every question has a valid answer, the generator returns it
for(const e of K.GARDEN_POOL){ if(!K.CROPS[e.crop]&&e.crop!=='getreide') fails.push('garden unknown crop '+e.id);
  if(!Array.isArray(e.o)||!Number.isInteger(e.a)||!e.o[e.a]||new Set(e.o).size!==e.o.length) fails.push('garden bad options '+e.id); }
for(const c of Object.keys(K.CROPS)){ if(K.GARDEN_POOL.filter(e=>e.crop===c).length<3) fails.push('garden too few questions '+c);
  for(let i=0;i<50;i++){ const q=K.gardenQuestion(c); const e=K.GARDEN_POOL.find(x=>x.id===q.qid);
    if(!q.options.includes(q.answer)||(e.crop!==c&&!(e.crop==='getreide'&&c!=='kartoffel'))) fails.push('garden question '+c+' '+q.qid); } }
// Englisch: data complete and unique, enough words and sentences, every generated task has one right answer
{ const E=K.E, en=[], fail=(m)=>fails.push('englisch '+m);
  for(const [t,list] of Object.entries(K.EN_THEMES)){ if(list.length<4) fail('theme '+t+' has fewer than 4 words');
    for(const w of list) if(typeof w[0]!=='string'||!w[0].trim()||typeof w[1]!=='string'||!w[1].trim()) fail('incomplete word in '+t+': '+JSON.stringify(w));
    const de=list.map(w=>w[1]); de.filter((x,i)=>de.indexOf(x)!==i).forEach(x=>fail('theme '+t+' has the meaning '+x+' twice')); }
  const all=Object.values(E.woerter).flat().concat(E.farben,E.zahlen,E.tage,E.monate);
  all.forEach(w=>en.push(w[0])); en.filter((x,i)=>en.indexOf(x)!==i).forEach(x=>fail('word twice: '+x));
  if(all.length<180) fail('only '+all.length+' words');
  for(const w of Object.values(E.woerter).flat()) if(/^[A-ZÄÖÜ]/.test(w[1])&&!/^(der|die|das) /.test(w[1])) fail('German noun without article: '+w[1]);
  for(const f of E.farben) if(!/^#[0-9A-F]{6}$/i.test(f[2])) fail('colour '+f[0]+' without #RRGGBB');
  for(const z of E.zahlen) if(!Number.isInteger(z[2])) fail('number '+z[0]+' without value');
  for(let n=1;n<=20;n++) if(!E.zahlen.some(z=>z[2]===n)) fail('number word missing for '+n);
  for(let n=30;n<=100;n+=10) if(!E.zahlen.some(z=>z[2]===n)) fail('number word missing for '+n);
  if(K.numWord(42)!=='forty-two'||K.numWord(100)!=='one hundred'||K.numWord(17)!=='seventeen'||K.numWord(70)!=='seventy') fail('numWord');
  if(E.tage.length!==7||E.monate.length!==12) fail('days or months incomplete');
  if(E.saetze.length+E.luecken.length+E.fragen.length<40) fail('fewer than 40 sentences');
  if(E.saetze.length<40) fail('only '+E.saetze.length+' sentences for „Was bedeutet das?“');
  for(const l of E.luecken){ if(l.length!==4||(l[0].match(/___/g)||[]).length!==1) fail('gap sentence '+l[0]); if(new Set(l.slice(1)).size!==3) fail('gap words not distinct '+l[0]); }
  for(const f of E.fragen) if(f.length!==4||new Set(f.slice(1)).size!==3) fail('question '+f[0]);
  const de=E.saetze.map(x=>x[1]), es=E.saetze.map(x=>x[0]); de.concat(es).filter((x,i,a)=>a.indexOf(x)!==i).forEach(x=>fail('sentence twice: '+x));
  if(/'/.test(JSON.stringify(E))) fail("straight apostrophe, use ’");
  if(/colou?r/.test(JSON.stringify(E))&&/\bcolor\b|favorite|\bgray\b/.test(JSON.stringify(E))) fail('American spelling');
  for(const m of ['teestube','doppeldecker']){ const cfg=K.MODES[m];
    for(const mod of Object.keys(cfg.modules)) for(let t=1;t<=cfg.modules[mod].maxTier;t++) for(let i=0;i<300;i++){ const q=K.generate(m,mod,t,{},++seq);
      if(q.mod!==mod) fail(m+' wrong mod '+q.mod);
      if(q.kind==='choice'){ if(q.options.filter(o=>o===q.answer).length!==1) fail('not exactly one correct '+q.qid); if(new Set(q.options).size!==q.options.length) fail('duplicate option '+q.qid); }
      if(mod==='zahl'){ const n=q.answers[0]; if(q.kind!=='num'||q.text!==K.numWord(n)||(t===1?n<1||n>20:n<21||n>100)) fail('zahl tier '+t+' '+q.text+' '+n); }
      if(mod==='farbe'&&(!q.pic||!q.pic.includes(E.farben.find(f=>f[0]===q.answer)[2]))) fail('colour swatch '+q.qid);
      if(mod==='odd'){ const th=(w)=>Object.keys(K.EN_THEMES).filter(k=>K.EN_THEMES[k].some(x=>x[0]===w)); const others=q.options.filter(o=>o!==q.answer);
        if(q.options.length!==4||new Set(others.map(o=>th(o)[0])).size!==1||th(q.answer)[0]===th(others[0])[0]) fail('odd one out '+q.options); }
      if(mod==='reihe'){ const list=(t===1?E.tage:E.monate).map(x=>x[0]); const txt=q.order.map(id=>q.items.find(x=>x.id===id).text);
        if(q.items.length!==4||txt.some((x,i)=>i&&list.indexOf(x)<list.indexOf(txt[i-1]))||txt.some(x=>!list.includes(x))) fail('order '+txt); }
      if(!cfg.tut[q.group]||!cfg.notes[q.note]) fail('tut/note '+q.group+' '+q.note); } } }
// Musik: enough questions, every topic has a note, every picture task has exactly one fitting answer
{ const mu=K.MODES.musik; const f=(m)=>fails.push('musik: '+m);
  if(mu.pool.length<70) f('only '+mu.pool.length+' questions');
  for(const g of ['notenwerte','takt','schluessel','familien','begriffe','komponisten','laender']) if(!mu.notes[g]) f('no note '+g);
  if(new Set(MU.KOMP.map(k=>k.year)).size!==MU.KOMP.length||MU.KOMP.some((k,i)=>i&&k.year<=MU.KOMP[i-1].year)) f('composers not ordered by birth year');
  for(const k of MU.KOMP) if(!mu.notes.komponisten.lines.some(l=>l.includes(k.text)&&l.includes(String(k.year)))) f('birth year not in the note: '+k.text);
  for(const i of MU.INSTR) if(!MU.FAM[i.fam]||!mu.notes.familien.lines.some(l=>l.startsWith(MU.FAM[i.fam])&&l.includes(i.name))) f('instrument not in its family note: '+i.name);
  for(let i=0;i<500;i++){
    for(const t of [1,2]){ const b=MU.makeBar(t); const len=b.top*2, sum=b.items.reduce((a,x)=>a+x.v,0);
      if(sum!==len||![1,2,4].includes(b.gap.v)||b.items.length<2||(t===1&&(b.top===4||b.items.some(x=>x.rest)))) f('bar '+JSON.stringify(b)); }
    const q=K.generate('musik','takt',1+(i%2),{},++seq); if(q.kind==='choice'&&q.bar){ const want={1:'Achtelnote',2:'Viertelnote',4:'Halbe Note'}[q.bar.top*2-q.bar.items.reduce((a,v,j)=>j===q.bar.gap?a:a+v,0)]; if(q.answer!==want||q.options.length!==3) f('takt answer '+q.qid); }
    const n=K.generate('musik','noten',2,{},++seq); if(n.kind!=='num'||!Number.isInteger(n.answers[0])||n.answers[0]<1||n.answers[0]!==n.beats.reduce((a,b)=>a+b,0)/n.unit) f('noten tier 2 '+n.qid);
    const t1=K.generate('musik','ton',1,{},++seq); if(t1.step!==undefined&&MU.TONES[t1.step]!==t1.answer) f('ton name '+t1.qid);
    const t2=K.generate('musik','ton',2,{},++seq); if(t2.svgOpts&&(t2.options.length!==3||t2.options.filter(o=>o===t2.answer).length!==1||!t2.q.endsWith(' '+MU.TONES[t2.step]+'.'))) f('ton find '+t2.qid);
    for(const mod of Object.keys(mu.modules)) for(let t=1;t<=mu.modules[mod].maxTier;t++){ const q=K.generate('musik',mod,t,{},++seq);
      if(q.kind==='choice'&&(q.options.length<2||q.options.filter(o=>o===q.answer).length!==1)) f('not exactly one correct '+q.qid);
      if(/[0-9],[0-9]/.test((q.q||'')+(q.fig||'')+(q.options||[]).join('|'))) f('comma number '+q.qid); } }
  for(const x of MU.INSTR) for(let i=0;i<20;i++){ const q=K.generate('musik','instr',2,{},++seq); if(q.qid==='mhow_'+x.id&&q.answer!==MU.HOW[x.fam]) f('how '+x.id); } }
const ids=Object.values(K.MODES).flatMap(c=>c.pool.map(p=>p.id)).concat(K.GARDEN_POOL.map(p=>p.id)); const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);
console.log('knowledge fails',fails.length,'duplicate ids',dup.length,'questions',Object.keys(know).length);
if(fails.length||dup.length){ console.log(fails.slice(0,20), dup); process.exit(1); }
