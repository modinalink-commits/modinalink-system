/* M06 — Waiter app · M07 — Kitchen display & kitchen ticket (English copy) */
const W = () => UI.w;
const kItems = o => o.items.filter(l=>(l.r||0)===(o.r||0));
const kTime = o => o.kt||o.t;
function wShell(title,body,o={}){ const w=W();
  return `<div class="stage"><div class="phone"><div class="ptop">${o.back?`<button class="ib" data-a="wStep" data-s="${o.back}" aria-label="Back">${ic('back')}</button>`:`<img src="img/logo.jpg" alt="" style="width:36px;height:36px;border-radius:9px">`}<h1>${title}</h1>
  <select data-i="wName" aria-label="Waiter" style="width:auto;min-height:38px;background:#2f3036;color:var(--cream);border-color:#55575e">${['Rakib','Emon','Sabbir'].map(n=>`<option ${w.name===n?'selected':''}>${n}</option>`).join('')}</select></div>
  <div class="pbody" data-keep="wb">${body}</div>${o.foot?`<div class="pfoot">${o.foot}</div>`:''}</div>
  <aside class="aside"><h2>Waiter panel — M06</h2><p>Large buttons and the main action at the bottom, for one-handed use.</p><ol><li>Pick a free table (e.g. T3)</li><li>Add items and write instructions</li><li>Review → send to kitchen</li><li>Mark it “Ready” on the <a href="#kds" style="color:var(--gold)">kitchen display</a> and a message arrives here</li><li>Send a “bill request” from the table → it shows on the <a href="#pos" style="color:var(--gold)">POS</a></li></ol></aside></div>`; }
I.wName = v => { W().name=v; render(); };
A.wStep = d => { W().step=d.s; render(); };
A.wTable = d => { const w=W(); w.table=d.id; w.lines=[]; const st=tableState(S.tables.find(t=>t.id===d.id)); w.step=st.o?'table':'menu'; render(); };
A.wCat = d => { W().cat=d.c; render(); };
A.wAdd = d => { const w=W(), m=item(d.id), v=m.v?m.v[m.v.length-1]:null, ex=w.lines.find(l=>l.mid===m.id); if(ex) ex.qty++; else w.lines.push({mid:m.id,name:m.bn+(v?' ('+v.bn+')':''),en:m.en,qty:1,price:v?v.p:m.price,note:''}); render(); };
A.wQty = d => { const w=W(), l=w.lines[+d.i]; l.qty+= +d.d; if(l.qty<1) w.lines.splice(+d.i,1); if(!w.lines.length) w.step='menu'; render(); };
I.wNote = (v,el) => { W().lines[+el.dataset.n].note=v; };
A.wSend = () => { const w=W(); if(!w.lines.length){ toast('No items added','bad'); return; }
  let o=S.orders.find(o=>o.table===w.table&&!o.paid);
  if(o){ o.r=(o.r||0)+1; w.lines.forEach(l=>o.items.push(Object.assign({r:o.r},l))); o.k='new'; o.kt=now(); delete o.tk; delete o.tr; o.billReq=false; }
  else o=newOrder({type:'dine',table:w.table,src:'waiter',waiter:w.name,items:w.lines.map(l=>Object.assign({},l))});
  note(`${o.id} arrived in the kitchen from ${w.table}`,'kds'); w.lines=[]; w.step='table'; render(); toast(`${o.id} sent to the kitchen`,'ok'); };
A.wBill = () => { const o=S.orders.find(o=>o.table===W().table&&!o.paid); o.billReq=true; note(`${o.table} asked for the bill`,'pos'); log(`${o.table} — bill requested`,W().name); render(); toast('Bill request sent to the cash counter','ok'); };
A.wServed = () => { const o=S.orders.find(o=>o.table===W().table&&!o.paid); o.k='served'; render(); toast('Marked as served','ok'); };
A.wMove = () => { const free=S.tables.filter(t=>!tableState(t).o&&!t.res); modal('Move table', free.length? `<p class="mute" style="margin-bottom:10px">Move from ${W().table} to which free table?</p><div class="wt">${free.map(t=>`<button class="tb" data-a="wMoveTo" data-id="${t.id}"><b>${t.id}</b><small>${t.seats} seats</small></button>`).join('')}</div>` : `<div class="empty"><b>No free tables</b>Try again when a table is free.</div>`); };
A.wMoveTo = d => { const w=W(), o=S.orders.find(o=>o.table===w.table&&!o.paid); const from=o.table; o.table=d.id; w.table=d.id; log(`${o.id}: moved ${from} → ${d.id}`,w.name); closeModal(); render(); toast(`Moved from ${from} to ${d.id}`,'ok'); };
A.wSeen = () => { S.notes.filter(n=>n.to==='waiter').forEach(n=>n.seen=true); render(); };
V.waiter = () => { const w=W(); w.name=w.name||'Rakib'; w.step=w.step||'tables'; w.cat=w.cat||'all'; w.lines=w.lines||[];
  if(w.step==='tables'||!w.table){ const nt=S.notes.filter(n=>n.to==='waiter'&&!n.seen);
    return wShell('Tables',`${nt.length?`<div class="note grn" style="margin-bottom:10px" role="status">${nt.map(n=>`<div>🔔 ${n.text} <span class="mute sm">(${hm(n.t)})</span></div>`).join('')}<button class="btn sec sm" style="margin-top:6px" data-a="wSeen">Seen</button></div>`:''}
    <div class="wt">${S.tables.map(t=>{ const s=tableState(t); return `<button class="tb ${s.c}" data-a="wTable" data-id="${t.id}"><b>${t.id}</b><small>${t.seats} seats</small><span class="bdg ${s.c==='occ'?'info':s.c==='bill'?'warn':s.c==='rdy'?'ok':'plain'}">${s.l}</span></button>`; }).join('')}</div>`); }
  const o=S.orders.find(o=>o.table===w.table&&!o.paid);
  if(w.step==='table'&&o){ const c=calc(o);
    return wShell(`Table ${w.table}`,`<div class="card"><div class="row sb"><b>${o.id}</b>${kb(o)}</div><p class="sm mute">Waiter ${o.waiter||'—'} · started <span data-ts="${o.t}"></span> ago</p>
    ${o.items.map(l=>`<div class="row sb" style="padding:7px 0;border-top:1px dashed #e0d5c5"><span>${l.qty} × ${l.name}${l.note?`<br><span class="sm" style="color:var(--warn)">📝 ${esc(l.note)}</span>`:''}</span><span>${tk(l.qty*l.price)}</span></div>`).join('')}
    <div class="row sb b" style="border-top:2px dashed #cfc3b3;padding-top:8px;margin-top:4px"><span>Estimated total (incl. charges)</span><span>${tk(c.total)}</span></div></div>
    ${o.billReq?`<p class="note" style="margin-top:10px">Bill request sent — the cash counter is preparing the bill.</p>`:''}
    <div style="display:grid;gap:8px;margin-top:12px">${o.k==='ready'?`<button class="btn ok lg" data-a="wServed">Food has been served</button>`:''}<button class="btn lg" data-a="wStep" data-s="menu">+ Add more items</button><button class="btn sec lg" data-a="wMove">${ic('swap')} Move table</button><button class="btn dark lg" data-a="wBill" ${o.billReq?'disabled':''}>Send bill request</button></div>`,{back:'tables'}); }
  if(w.step==='review'&&w.lines.length){
    return wShell(`Review — ${w.table}`,`${w.lines.map((l,i)=>`<div class="card" style="margin-bottom:8px;padding:12px"><div class="row sb"><b>${l.name}</b><span class="qty"><button data-a="wQty" data-i="${i}" data-d="-1" aria-label="Decrease">−</button><b>${l.qty}</b><button data-a="wQty" data-i="${i}" data-d="1" aria-label="Increase">+</button></span></div><input id="wn${i}" data-i="wNote" data-n="${i}" value="${esc(l.note)}" placeholder="Special instructions (e.g. less spicy)" aria-label="${l.name} — special instructions" style="margin-top:8px"></div>`).join('')}
    <p class="sm mute">${w.lines.reduce((s,l)=>s+l.qty,0)} items · ${tk(w.lines.reduce((s,l)=>s+l.qty*l.price,0))} (before charges)</p>`,{back:'menu',foot:`<button class="btn ok block lg" data-a="wSend">${ic('fire')} Send to kitchen</button>`}); }
  const list=S.menu.filter(m=>w.cat==='all'||m.cat===w.cat), n=w.lines.reduce((s,l)=>s+l.qty,0);
  return wShell(`${w.table} — choose items`,`<div class="chips"><button class="chip ${w.cat==='all'?'on':''}" data-a="wCat" data-c="all">All</button>${CATS.map(x=>`<button class="chip ${w.cat===x.id?'on':''}" data-a="wCat" data-c="${x.id}">${x.bn}</button>`).join('')}</div>
  ${list.map(m=>{ const q=(w.lines.find(l=>l.mid===m.id)||{}).qty; return `<div class="li" style="padding:8px 10px"><span class="tx"><h3>${m.bn}</h3><p>${tk(m.v?m.v[m.v.length-1].p:m.price)}${m.avail?'':' · <b style="color:var(--bad)">unavailable</b>'}</p></span>${q?`<span class="bdg info plain">×${q}</span>`:''}<button class="btn ${q?'dark':'sec'}" style="min-width:52px;min-height:48px;font-size:22px" data-a="wAdd" data-id="${m.id}" ${m.avail?'':'disabled'} aria-label="Add ${m.bn}">+</button></div>`; }).join('')}`,
  {back:o?'table':'tables',foot:`<button class="btn block lg" data-a="wStep" data-s="review" ${n?'':'disabled'}>Review order${n?` (${n})`:''}</button>`}); };

/* ── kitchen ── */
A.kNext = d => { const o=order(d.id);
  if(o.k==='new'){ o.k='cooking'; o.tk=now(); }
  else if(o.k==='cooking'){ o.k='ready'; o.tr=now(); note(`Food for ${o.table||o.id} is ready (${o.id})`, o.src==='waiter'?'waiter':'pos'); toast(`“Ready” message sent to ${o.src==='waiter'?'the waiter':o.src==='app'?"the customer's app and the counter":'the counter'} (demo)`,'ok'); }
  else if(o.k==='ready'){ o.k='served'; }
  render(); };
A.kBack = d => { const o=order(d.id); o.k = o.k==='ready'?'cooking':'new'; render(); toast('Moved back one step'); };
A.kot = d => { const o=order(d.id); modal('Kitchen order ticket (KOT) preview',`<div class="rcpt"><div class="c"><b style="font-size:17px">KOT — ${o.id}</b></div><hr><div class="l"><span>${TYPE[o.type]}${o.table?' · Table '+o.table:''}</span><span>${hm(kTime(o))}</span></div>${o.waiter?`<div>Waiter: ${o.waiter}</div>`:''}<hr>
  ${kItems(o).map(l=>`<div style="font-size:15px;font-weight:700;margin:4px 0">${l.qty} × ${l.name}</div>${l.note?`<div style="border:1px solid #000;padding:2px 6px;margin-bottom:4px">★ ${esc(l.note)}</div>`:''}`).join('')}<hr><div class="c" style="font-size:11px">Design demo — sample ticket</div></div>`,`<button class="btn sec" data-a="demo" data-msg="KOT print — demo. The real software will print on the kitchen thermal printer.">🖨 Print (demo)</button><button class="btn" data-a="close">Close</button>`); };
V.kds = () => { const act=S.orders.filter(o=>o.k!=='served'), by=k=>act.filter(o=>o.k===k).sort((a,b)=>kTime(a)-kTime(b));
  const all={}; act.filter(o=>o.k!=='ready').forEach(o=>kItems(o).forEach(l=>all[l.name]=(all[l.name]||0)+l.qty));
  const card=o=>{ const late=o.k!=='ready'&&mins(kTime(o))>=15, cls={new:'n',cooking:'c',ready:'d'}[o.k];
    return `<article class="kc ${cls} ${late?'late':''}"><div class="top"><span class="no">${o.table?'Table '+o.table:TYPE[o.type]}</span><span class="tm" data-ts="${kTime(o)}" aria-label="Time since order"></span></div>
    <div class="meta">${o.id} · ${TYPE[o.type]}${o.waiter?' · '+o.waiter:''}${(o.r||0)>0?' · <b>Add-on order</b>':''} ${late?'<span class="bdg bad">Running late</span>':''}</div>
    <ul>${kItems(o).map(l=>`<li><b>${l.qty}×</b>${l.name}${l.note?`<em>★ ${esc(l.note)}</em>`:''}</li>`).join('')}</ul>
    <button class="btn ${o.k==='new'?'':o.k==='cooking'?'ok':'dark'}" data-a="kNext" data-id="${o.id}">${o.k==='new'?'Start preparing':o.k==='cooking'?'Ready ✓':'Served / handed over'}</button>
    <div class="row" style="margin-top:8px"><button class="btn ghost sm" data-a="kot" data-id="${o.id}">KOT ticket</button>${o.k!=='new'?`<button class="btn ghost sm" data-a="kBack" data-id="${o.id}">↩ Previous step</button>`:''}</div></article>`; };
  const col=(k,cls,t)=>{ const l=by(k); return `<section class="kcol ${cls}" aria-label="${t}"><h2><span>${t}</span><span>${l.length}</span></h2>${l.map(card).join('')||`<p class="empty" style="color:#8d8473">No orders at this stage</p>`}</section>`; };
  return `<div class="kds"><div class="hd"><h1>Kitchen display</h1><div class="row"><span class="bdg demo">Shows “Running late” after 15 minutes (sample threshold)</span><span class="clock" id="kclock"></span></div></div>
  ${Object.keys(all).length?`<div class="chips" style="margin-bottom:10px" aria-label="Total still to cook"><span class="chip" style="background:#25272c;color:#ffd27a;border-color:#3b3d44">Still to cook:</span>${Object.entries(all).map(([n,q])=>`<span class="chip" style="background:#25272c;color:#f4ecdc;border-color:#3b3d44">${q}× ${n}</span>`).join('')}</div>`:''}
  <div class="kcols">${col('new','n','New orders')}${col('cooking','c','In progress')}${col('ready','d','Ready')}</div></div>`; };
