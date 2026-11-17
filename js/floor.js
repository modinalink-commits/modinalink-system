/* M06 — ওয়েটার অ্যাপ · M07 — রান্নাঘরের ডিসপ্লে ও কিচেন টিকিট */
const W = () => UI.w;
const kItems = o => o.items.filter(l=>(l.r||0)===(o.r||0));
const kTime = o => o.kt||o.t;
function wShell(title,body,o={}){ const w=W();
  return `<div class="stage"><div class="phone"><div class="ptop">${o.back?`<button class="ib" data-a="wStep" data-s="${o.back}" aria-label="পেছনে">${ic('back')}</button>`:`<img src="img/logo.jpg" alt="" style="width:36px;height:36px;border-radius:9px">`}<h1>${title}</h1>
  <select data-i="wName" aria-label="ওয়েটার" style="width:auto;min-height:38px;background:#2f3036;color:var(--cream);border-color:#55575e">${['রাকিব','ইমন','সাব্বির'].map(n=>`<option ${w.name===n?'selected':''}>${n}</option>`).join('')}</select></div>
  <div class="pbody" data-keep="wb">${body}</div>${o.foot?`<div class="pfoot">${o.foot}</div>`:''}</div>
  <aside class="aside"><h2>ওয়েটার প্যানেল — M06</h2><p>এক হাতে ব্যবহারের জন্য বড় বাটন ও নিচে মূল কাজ।</p><ol><li>খালি টেবিল বাছুন (যেমন T3)</li><li>খাবার যোগ করুন, নির্দেশনা লিখুন</li><li>পর্যালোচনা → রান্নাঘরে পাঠান</li><li><a href="#kds" style="color:var(--gold)">রান্নাঘরে</a> “প্রস্তুত” করলে এখানে বার্তা আসবে</li><li>টেবিল থেকে “বিলের অনুরোধ” পাঠান → <a href="#pos" style="color:var(--gold)">পিওএসে</a> দেখা যাবে</li></ol></aside></div>`; }
I.wName = v => { W().name=v; render(); };
A.wStep = d => { W().step=d.s; render(); };
A.wTable = d => { const w=W(); w.table=d.id; w.lines=[]; const st=tableState(S.tables.find(t=>t.id===d.id)); w.step=st.o?'table':'menu'; render(); };
A.wCat = d => { W().cat=d.c; render(); };
A.wAdd = d => { const w=W(), m=item(d.id), v=m.v?m.v[m.v.length-1]:null, ex=w.lines.find(l=>l.mid===m.id); if(ex) ex.qty++; else w.lines.push({mid:m.id,name:m.bn+(v?' ('+v.bn+')':''),en:m.en,qty:1,price:v?v.p:m.price,note:''}); render(); };
A.wQty = d => { const w=W(), l=w.lines[+d.i]; l.qty+= +d.d; if(l.qty<1) w.lines.splice(+d.i,1); if(!w.lines.length) w.step='menu'; render(); };
I.wNote = (v,el) => { W().lines[+el.dataset.n].note=v; };
A.wSend = () => { const w=W(); if(!w.lines.length){ toast('কোনো খাবার যোগ হয়নি','bad'); return; }
  let o=S.orders.find(o=>o.table===w.table&&!o.paid);
  if(o){ o.r=(o.r||0)+1; w.lines.forEach(l=>o.items.push(Object.assign({r:o.r},l))); o.k='new'; o.kt=now(); delete o.tk; delete o.tr; o.billReq=false; }
  else o=newOrder({type:'dine',table:w.table,src:'waiter',waiter:w.name,items:w.lines.map(l=>Object.assign({},l))});
  note(`${bn(w.table)} থেকে ${o.id} রান্নাঘরে এসেছে`,'kds'); w.lines=[]; w.step='table'; render(); toast(`${o.id} রান্নাঘরে পাঠানো হয়েছে`,'ok'); };
A.wBill = () => { const o=S.orders.find(o=>o.table===W().table&&!o.paid); o.billReq=true; note(`${bn(o.table)} বিল চেয়েছে`,'pos'); log(`${bn(o.table)} — বিলের অনুরোধ`,W().name); render(); toast('ক্যাশ কাউন্টারে বিলের অনুরোধ গেছে','ok'); };
A.wServed = () => { const o=S.orders.find(o=>o.table===W().table&&!o.paid); o.k='served'; render(); toast('পরিবেশিত হিসেবে চিহ্নিত','ok'); };
A.wMove = () => { const free=S.tables.filter(t=>!tableState(t).o&&!t.res); modal('টেবিল স্থানান্তর', free.length? `<p class="mute" style="margin-bottom:10px">${bn(W().table)} থেকে কোন খালি টেবিলে নেবেন?</p><div class="wt">${free.map(t=>`<button class="tb" data-a="wMoveTo" data-id="${t.id}"><b>${bn(t.id)}</b><small>${bn(t.seats)} আসন</small></button>`).join('')}</div>` : `<div class="empty"><b>কোনো খালি টেবিল নেই</b>টেবিল খালি হলে আবার চেষ্টা করুন।</div>`); };
A.wMoveTo = d => { const w=W(), o=S.orders.find(o=>o.table===w.table&&!o.paid); const from=o.table; o.table=d.id; w.table=d.id; log(`${o.id}: ${bn(from)} → ${bn(d.id)} স্থানান্তর`,w.name); closeModal(); render(); toast(`${bn(from)} থেকে ${bn(d.id)}-এ স্থানান্তর হয়েছে`,'ok'); };
A.wSeen = d => { S.notes.filter(n=>n.to==='waiter').forEach(n=>n.seen=true); render(); };
V.waiter = () => { const w=W(); w.name=w.name||'রাকিব'; w.step=w.step||'tables'; w.cat=w.cat||'all'; w.lines=w.lines||[];
  if(w.step==='tables'||!w.table){ const nt=S.notes.filter(n=>n.to==='waiter'&&!n.seen);
    return wShell('টেবিল',`${nt.length?`<div class="note grn" style="margin-bottom:10px" role="status">${nt.map(n=>`<div>🔔 ${n.text} <span class="mute sm">(${hm(n.t)})</span></div>`).join('')}<button class="btn sec sm" style="margin-top:6px" data-a="wSeen">দেখেছি</button></div>`:''}
    <div class="wt">${S.tables.map(t=>{ const s=tableState(t); return `<button class="tb ${s.c}" data-a="wTable" data-id="${t.id}"><b>${bn(t.id)}</b><small>${bn(t.seats)} আসন</small><span class="bdg ${s.c==='occ'?'info':s.c==='bill'?'warn':s.c==='rdy'?'ok':'plain'}">${s.l}</span></button>`; }).join('')}</div>`); }
  const o=S.orders.find(o=>o.table===w.table&&!o.paid);
  if(w.step==='table'&&o){ const c=calc(o);
    return wShell(`টেবিল ${bn(w.table)}`,`<div class="card"><div class="row sb"><b>${o.id}</b>${kb(o)}</div><p class="sm mute">ওয়েটার ${o.waiter||'—'} · <span data-ts="${o.t}"></span> আগে শুরু</p>
    ${o.items.map(l=>`<div class="row sb" style="padding:7px 0;border-top:1px dashed #e0d5c5"><span>${bn(l.qty)} × ${l.name}${l.note?`<br><span class="sm" style="color:var(--warn)">📝 ${esc(l.note)}</span>`:''}</span><span>${tk(l.qty*l.price)}</span></div>`).join('')}
    <div class="row sb b" style="border-top:2px dashed #cfc3b3;padding-top:8px;margin-top:4px"><span>আনুমানিক মোট (চার্জসহ)</span><span>${tk(c.total)}</span></div></div>
    ${o.billReq?`<p class="note" style="margin-top:10px">বিলের অনুরোধ পাঠানো হয়েছে — ক্যাশ কাউন্টার বিল তৈরি করছে।</p>`:''}
    <div style="display:grid;gap:8px;margin-top:12px">${o.k==='ready'?`<button class="btn ok lg" data-a="wServed">খাবার পরিবেশন করা হয়েছে</button>`:''}<button class="btn lg" data-a="wStep" data-s="menu">+ আরও খাবার যোগ</button><button class="btn sec lg" data-a="wMove">${ic('swap')} টেবিল স্থানান্তর</button><button class="btn dark lg" data-a="wBill" ${o.billReq?'disabled':''}>বিলের অনুরোধ পাঠান</button></div>`,{back:'tables'}); }
  if(w.step==='review'&&w.lines.length){
    return wShell(`পর্যালোচনা — ${bn(w.table)}`,`${w.lines.map((l,i)=>`<div class="card" style="margin-bottom:8px;padding:12px"><div class="row sb"><b>${l.name}</b><span class="qty"><button data-a="wQty" data-i="${i}" data-d="-1" aria-label="কমান">−</button><b>${bn(l.qty)}</b><button data-a="wQty" data-i="${i}" data-d="1" aria-label="বাড়ান">+</button></span></div><input id="wn${i}" data-i="wNote" data-n="${i}" value="${esc(l.note)}" placeholder="বিশেষ নির্দেশনা (যেমন: কম ঝাল)" aria-label="${l.name} — বিশেষ নির্দেশনা" style="margin-top:8px"></div>`).join('')}
    <p class="sm mute">মোট ${bn(w.lines.reduce((s,l)=>s+l.qty,0))}টি পদ · ${tk(w.lines.reduce((s,l)=>s+l.qty*l.price,0))} (চার্জ ছাড়া)</p>`,{back:'menu',foot:`<button class="btn ok block lg" data-a="wSend">${ic('fire')} রান্নাঘরে পাঠান</button>`}); }
  const list=S.menu.filter(m=>w.cat==='all'||m.cat===w.cat), n=w.lines.reduce((s,l)=>s+l.qty,0);
  return wShell(`${bn(w.table)} — খাবার নির্বাচন`,`<div class="chips"><button class="chip ${w.cat==='all'?'on':''}" data-a="wCat" data-c="all">সব</button>${CATS.map(x=>`<button class="chip ${w.cat===x.id?'on':''}" data-a="wCat" data-c="${x.id}">${x.bn}</button>`).join('')}</div>
  ${list.map(m=>{ const q=(w.lines.find(l=>l.mid===m.id)||{}).qty; return `<div class="li" style="padding:8px 10px"><span class="tx"><h3>${m.bn}</h3><p>${tk(m.v?m.v[m.v.length-1].p:m.price)}${m.avail?'':' · <b style="color:var(--bad)">এখন নেই</b>'}</p></span>${q?`<span class="bdg info plain">${bn(q)}টি</span>`:''}<button class="btn ${q?'dark':'sec'}" style="min-width:52px;min-height:48px;font-size:22px" data-a="wAdd" data-id="${m.id}" ${m.avail?'':'disabled'} aria-label="${m.bn} যোগ করুন">+</button></div>`; }).join('')}`,
  {back:o?'table':'tables',foot:`<button class="btn block lg" data-a="wStep" data-s="review" ${n?'':'disabled'}>অর্ডার পর্যালোচনা${n?` (${bn(n)}টি)`:''}</button>`}); };

/* ── রান্নাঘর ── */
A.kNext = d => { const o=order(d.id);
  if(o.k==='new'){ o.k='cooking'; o.tk=now(); }
  else if(o.k==='cooking'){ o.k='ready'; o.tr=now(); const who=o.table?`${bn(o.table)}-এর`:o.id; note(`${who} খাবার প্রস্তুত (${o.id})`, o.src==='waiter'?'waiter':'pos'); toast(`প্রস্তুত হওয়ার বার্তা ${o.src==='waiter'?'ওয়েটারের':o.src==='app'?'গ্রাহকের অ্যাপে ও কাউন্টারে':'কাউন্টারে'} গেছে (ডেমো)`,'ok'); }
  else if(o.k==='ready'){ o.k='served'; }
  render(); };
A.kBack = d => { const o=order(d.id); o.k = o.k==='ready'?'cooking':'new'; render(); toast('আগের ধাপে ফেরানো হয়েছে'); };
A.kot = d => { const o=order(d.id); modal('কিচেন অর্ডার টিকিট (KOT) প্রিভিউ',`<div class="rcpt"><div class="c"><b style="font-size:17px">KOT — ${o.id}</b></div><hr><div class="l"><span class="bn">${TYPE[o.type]}${o.table?' · টেবিল '+bn(o.table):''}</span><span>${hm(kTime(o))}</span></div>${o.waiter?`<div class="bn">ওয়েটার: ${o.waiter}</div>`:''}<hr>
  ${kItems(o).map(l=>`<div class="bn" style="font-size:15px;font-weight:700;margin:4px 0">${bn(l.qty)} × ${l.name}</div>${l.note?`<div class="bn" style="border:1px solid #000;padding:2px 6px;margin-bottom:4px">★ ${esc(l.note)}</div>`:''}`).join('')}<hr><div class="c bn" style="font-size:11px">ডিজাইন প্রদর্শনী — নমুনা টিকিট</div></div>`,`<button class="btn sec" data-a="demo" data-msg="KOT প্রিন্ট — প্রদর্শনী। মূল সফটওয়্যারে রান্নাঘরের থার্মাল প্রিন্টারে ছাপা হবে।">🖨 প্রিন্ট (ডেমো)</button><button class="btn" data-a="close">বন্ধ</button>`); };
V.kds = () => { const act=S.orders.filter(o=>o.k!=='served'), by=k=>act.filter(o=>o.k===k).sort((a,b)=>kTime(a)-kTime(b));
  const all={}; act.filter(o=>o.k!=='ready').forEach(o=>kItems(o).forEach(l=>all[l.name]=(all[l.name]||0)+l.qty));
  const card=o=>{ const late=o.k!=='ready'&&mins(kTime(o))>=15, cls={new:'n',cooking:'c',ready:'d'}[o.k];
    return `<article class="kc ${cls} ${late?'late':''}"><div class="top"><span class="no">${o.table?'টেবিল '+bn(o.table):TYPE[o.type]}</span><span class="tm" data-ts="${kTime(o)}" aria-label="অর্ডারের পর সময়"></span></div>
    <div class="meta">${o.id} · ${TYPE[o.type]}${o.waiter?' · '+o.waiter:''}${(o.r||0)>0?' · <b>বাড়তি অর্ডার</b>':''} ${late?'<span class="bdg bad">দেরি হচ্ছে</span>':''}</div>
    <ul>${kItems(o).map(l=>`<li><b>${bn(l.qty)}×</b>${l.name}${l.note?`<em>★ ${esc(l.note)}</em>`:''}</li>`).join('')}</ul>
    <button class="btn ${o.k==='new'?'':o.k==='cooking'?'ok':'dark'}" data-a="kNext" data-id="${o.id}">${o.k==='new'?'প্রস্তুতি শুরু করুন':o.k==='cooking'?'প্রস্তুত ✓':'পরিবেশিত / হস্তান্তর'}</button>
    <div class="row" style="margin-top:8px"><button class="btn ghost sm" data-a="kot" data-id="${o.id}">KOT টিকিট</button>${o.k!=='new'?`<button class="btn ghost sm" data-a="kBack" data-id="${o.id}">↩ আগের ধাপ</button>`:''}</div></article>`; };
  const col=(k,cls,t)=>{ const l=by(k); return `<section class="kcol ${cls}" aria-label="${t}"><h2><span>${t}</span><span>${bn(l.length)}</span></h2>${l.map(card).join('')||`<p class="empty" style="color:#8d8473">এই ধাপে কোনো অর্ডার নেই</p>`}</section>`; };
  return `<div class="kds"><div class="hd"><h1>রান্নাঘরের ডিসপ্লে</h1><div class="row"><span class="bdg demo">১৫ মিনিট পার হলে “দেরি হচ্ছে” দেখায় (নমুনা সীমা)</span><span class="clock" id="kclock"></span></div></div>
  ${Object.keys(all).length?`<div class="chips" style="margin-bottom:10px" aria-label="মোট কতটি রান্না বাকি"><span class="chip" style="background:#25272c;color:#ffd27a;border-color:#3b3d44">এখন মোট বাকি:</span>${Object.entries(all).map(([n,q])=>`<span class="chip" style="background:#25272c;color:#f4ecdc;border-color:#3b3d44">${bn(q)}× ${n}</span>`).join('')}</div>`:''}
  <div class="kcols">${col('new','n','নতুন অর্ডার')}${col('cooking','c','প্রস্তুতি চলছে')}${col('ready','d','প্রস্তুত')}</div></div>`; };
