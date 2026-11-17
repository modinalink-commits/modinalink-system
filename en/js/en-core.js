/* English copy: overrides for the shared helpers and the few Bengali-only spots in core.js, site.js and app.js. */
KEY = 'ember-proto-en-v3';
isEn = () => true;
bn = x => String(x);
tk = n => (n<0?'−':'') + '৳' + fmt(Math.abs(n));
dmy = t => { const d=new Date(t); return d.getDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]; };
img = (name,alt,cls) => name? `<img src="img/${name}.jpg" alt="${esc(alt||'')}" ${cls?`class="${cls}"`:''} onerror="this.outerHTML='<div class=&quot;ph ${cls||''}&quot;>Photo to be added</div>'">` : `<div class="ph ${cls||''}">Photo to be added</div>`;
langSw = () => '';
TYPE = {dine:'Dine-in',takeaway:'Takeaway',delivery:'Delivery',online:'Online order'};
KST = {new:['New','warn'],cooking:['In progress','info'],ready:['Ready','ok'],served:['Served / handed over','plain']};
pb = o => o.paid? '<span class="bdg ok">Paid</span>' : (o.billReq? '<span class="bdg warn">Bill requested</span>' : '<span class="bdg bad">Unpaid</span>');
tableState = function(t){
  const o = S.orders.find(o=>o.table===t.id && !o.paid);
  if(!o) return t.res? {c:'res',l:'Reserved'} : {c:'',l:'Free'};
  if(o.billReq) return {c:'bill',l:'Bill requested',o};
  if(o.k==='ready') return {c:'rdy',l:'Food ready',o};
  return {c:'occ',l:'Order in progress',o};
};
payOrder = function(o,pays,by){
  o.paid=true; o.pt=now(); o.pay=pays; o.cashier=by||o.cashier; o.billReq=false; if(o.type==='dine'||o.k==='ready') o.k = o.k==='new'||o.k==='cooking'? o.k : 'served';
  useStock(o);
  pays.forEach(p=>{ if(p.gw) S.txns.unshift({id:'TXN-'+(88000+S.seq+S.txns.length),t:now(),gw:p.gw,oid:o.id,amt:p.a,status:'success'}); });
  const c = o.cust && S.cust.find(c=>c.phone===o.cust.phone); if(c){ c.orders++; c.spent+=calc(o).total; c.pts+=Math.round(calc(o).total/100); }
  log(`Bill ${o.id} paid — ${tk(calc(o).total)} (${pays.map(p=>p.m).join(' + ')})`, by);
};
modal = function(title,body,foot,wide){
  lastFocus = document.activeElement;
  const m=$('#modal'); m.hidden=false;
  m.innerHTML=`<div class="mbox ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mhd"><h2>${title}</h2><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mbd">${body}</div>${foot?`<div class="mft">${foot}</div>`:''}</div>`;
  const f=$('input:not([type=hidden]),select,textarea,.mbd button',m)||$('.x',m); f&&f.focus();
};
confirmBox = function(title,text,act,label,data){ modal(title,`<p>${text}</p>`,`<button class="btn sec" data-a="close">Cancel</button><button class="btn" data-a="${act}" ${Object.entries(data||{}).map(([k,v])=>`data-${k}="${esc(v)}"`).join(' ')}>${label}</button>`); };
tbl = (heads,rows,o={}) => rows.length? `<div class="tw"><table class="t ${o.cls||''}"><thead><tr>${heads.map(h=>`<th ${/^>/.test(h)?'class="r"':''}>${h.replace(/^>/,'')}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>` : `<div class="card empty"><b>${o.empty||'Nothing found'}</b>${o.emptyHint||'Try a different filter or add a new entry.'}</div>`;
demoTag = t => `<span class="bdg demo">${t||'Sample'}</span>`;
A.demo = d => toast(d.msg||'This is a demo — in the real software this action will actually happen.');
A.copy = d => { try{ navigator.clipboard.writeText(d.text).then(()=>toast('Copied','ok'),()=>toast('Could not copy — select the text and copy it manually','bad')); }catch(e){ toast('Could not copy','bad'); } };
Object.assign(ROUTES, {preview:'Design Preview',modules:'Module list',plan:'M01 Planning document',handover:'M16 Review & handover',
 'site-home':'Website','site-menu':'Website · Menu','site-offers':'Website · Offers','site-gallery':'Website · Gallery','site-reserve':'Website · Reservation','site-about':'Website · About','site-contact':'Website · Contact','site-proposed':'Website · Proposed sections',
 'app-menu':'Customer app','app-item':'Customer app · Item','app-cart':'Customer app · Cart','app-checkout':'Customer app · Checkout','app-pay':'Customer app · Demo payment','app-done':'Customer app · Order confirmed','app-track':'Customer app · Order status','app-history':'Customer app · History',
 pos:'Cashier POS',waiter:'Waiter panel',kds:'Kitchen display',
 'admin-dashboard':'Admin · Dashboard','admin-orders':'Admin · Orders','admin-reserve':'Admin · Reservations','admin-menu':'Admin · Menu & recipes','admin-stock':'Admin · Inventory','admin-purchase':'Admin · Purchasing','admin-hr':'Admin · Staff','admin-accounts':'Admin · Accounts','admin-payments':'Admin · Payments','admin-crm':'Admin · Marketing','admin-users':'Admin · Users & security'});
demobar = function(){
  const r=route();
  $('#demobar').innerHTML = `${r!=='preview'?`<button data-a="go" data-r="preview">← Preview</button>`:''}<span class="where">${ROUTES[r]}</span><span class="tag">Demo · sample data</span><span class="sp"></span>
  <label class="sm" style="display:flex;gap:6px;align-items:center"><span class="hide-m">Area:</span><select data-i="jump" aria-label="Go to another area"><option value="">Go to another area…</option>${[['site-home','Customer website'],['app-menu','Customer app'],['admin-dashboard','Owner / manager panel'],['pos','Cashier POS'],['waiter','Waiter panel'],['kds','Kitchen display'],['modules','Module list']].map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('')}</select></label>
  <button data-a="askReset" title="Restore all sample data to its starting state">↺ Reset</button>`;
};
A.askReset = () => confirmBox('Reset sample data','Every change you made in this browser (orders, stock, forms) will be cleared and the starting sample data restored.','doReset','Reset');
A.doReset = () => { reset(); closeModal(); render(); toast('Sample data restored to its starting state','ok'); };

/* app.js spots */
sumBox = (o) => { const c=calc(o); return `<div class="sum"><div><span>Subtotal</span><span>${P(c.sub)}</span></div>${c.disc?`<div><span>Discount</span><span>−${P(c.disc)}</span></div>`:''}${c.cdisc?`<div><span>Coupon (${o.coupon})</span><span>−${P(c.cdisc)}</span></div>`:''}${c.svc?`<div><span>Service charge ${S.cfg.svc}% ${demoTag('sample rate')}</span><span>${P(c.svc)}</span></div>`:''}<div><span>VAT ${S.cfg.vat}% <span class="bdg demo">sample rate</span></span><span>${P(c.vat)}</span></div>${o.type==='online'||o.type==='delivery'?`<div><span>Delivery charge</span><span>${c.delivery?P(c.delivery):'Free'}</span></div>`:''}<div class="tt"><span>Total</span><span>${P(c.total)}</span></div></div>`; };
phone = function(title,body,o={}){
  const r=route(), tb=[['app-menu','home','Menu'],['app-cart','cart','Cart'],['app-track','clock','Order'],['app-history','list','History']];
  return `<div class="stage"><div class="phone" aria-label="Customer app">
  <div class="ptop">${o.back?`<button class="ib" data-a="go" data-r="${o.back}" aria-label="Back">${ic('back')}</button>`:`<img src="img/logo.jpg" alt="" style="width:36px;height:36px;border-radius:9px">`}<h1>${title}</h1></div>
  <div class="pbody" data-keep="pb">${body}</div>${o.foot?`<div class="pfoot">${o.foot}</div>`:''}
  ${o.notabs?'':`<nav class="tabbar" aria-label="App navigation">${tb.map(t=>`<button class="${r===t[0]||(t[0]==='app-menu'&&r==='app-item')?'on':''}" data-a="go" data-r="${t[0]}">${ic(t[1])}${t[2]}${t[0]==='app-cart'&&cartCount()?`<span class="ct">${cartCount()}</span>`:''}</button>`).join('')}</nav>`}
  </div><aside class="aside"><h2>Customer app — M04</h2><p>Shown at phone size. On a real phone it fills the whole screen.</p><ol><li>Pick a dish from the menu</li><li>Choose size and add-ons</li><li>Cart → checkout</li><li>Try coupon <b>EMBER10</b> or <b>WELCOME50</b></li><li>On the demo payment, try both success and failure</li><li>Change the status on the <a href="#kds" style="color:var(--gold)">kitchen display</a> and watch it under “Order”</li></ol><p class="note" style="margin-top:10px">The installable web app (PWA) will be built in the real software. This demo cannot be installed.</p></aside></div>`;
};
placeOrder = function(paid){ const co=UI.app.co, c=cartOrder(), tot=calc(c).total, gwName={bkash:'bKash',nagad:'Nagad',cod:'Cash on delivery'}[co.pm];
  const o=newOrder({type:'online',src:'app',mode:co.mode,cust:{name:co.name,phone:co.phone,addr:co.mode==='delivery'?co.addr:'Pick-up'},area:co.area,delivery:c.delivery,coupon:co.coupon,items:S.cart.map(l=>({mid:l.mid,name:l.name,en:l.en,qty:l.qty,price:l.price,note:l.note})),pm:gwName});
  if(paid){ o.paid=true; o.pt=now(); o.gw=co.pm; o.pay=[{m:gwName,a:tot,gw:co.pm}]; S.txns.unshift({id:'TXN-'+(88100+S.seq),t:now(),gw:co.pm,oid:o.id,amt:tot,status:'success'}); useStock(o); }
  const cp=S.coupons.find(x=>x.code===co.coupon); if(cp) cp.used++;
  if(!S.cust.find(x=>x.phone===co.phone)) S.cust.unshift({id:'c'+(S.cust.length+1),name:co.name,phone:co.phone,orders:1,spent:tot,consent:false,area:(AREAS.find(a=>a.id===co.area)||{}).en||'',pts:Math.round(tot/100)});
  S.myOrders.unshift(o.id); S.cart=[]; UI.app.co={}; UI.app.track=o.id; note('New online order '+o.id,'pos'); log('Online order '+o.id+' received','Customer app'); go('app-done'); };

/* ── Design preview (entry page) ── */
V.preview = () => {
  const doors = [['site-home','web','01','Customer website','Home, menu, offers, gallery, reservation, about and contact.','M03'],
   ['app-menu','phone','02','Customer app','Menu → item → cart → checkout → demo payment → order status.','M04'],
   ['admin-dashboard','chart','03','Owner / manager panel','Dashboard, menu, stock, purchasing, staff, accounts, payments, marketing, security.','M02, M08–M15'],
   ['pos','pos','04','Cashier POS','Touchscreen ordering, table map, discount, bill split, shift and thermal receipt.','M05'],
   ['waiter','user','05','Waiter panel','Pick a table on a phone, take the order, send to kitchen, move table, request the bill.','M06'],
   ['kds','fire','06','Kitchen display','Order cards readable from a distance, timers, status changes, kitchen ticket.','M07'],
   ['modules','grid','07','Module-by-module design list','All 16 quotation modules — their screens, planning documents and approval checklist.','M01–M16']];
  return `<div class="hub"><div class="wrap">
  <header><img src="img/logo.jpg" alt="Ember Essence logo"><div><p class="n" style="color:var(--gold);letter-spacing:.14em;font-size:13px">EMBER ESSENCE RESTAURANT · MODINALINK IT SOLUTION</p><h1>Design Preview — <em>Ember Essence</em> restaurant software</h1><p class="lead">A clickable design of the website, customer app, admin panel, POS, waiter panel and kitchen display, following the 16 modules of quotation no. 458210. One restaurant · one branch · up to 10 staff users · two POS counters.</p><p style="margin-top:12px"><a class="btn ghost sm" href="../">বাংলা সংস্করণ →</a></p></div></header>
  <div class="notice"><b>This is a sample prototype built for design approval.</b> It uses sample data. Development of the real software starts after the design and the agreed workflows are approved. There is no real login, payment, messaging or server connection here; sample roles can be chosen without a password — that is not a security feature.</div>
  <div class="doors">${doors.map(d=>`<a class="door" href="#${d[0]}"><span class="ic">${ic(d[1])}</span><span class="n">${d[2]} · ${d[5]}</span><h2>${d[3]}</h2><p>${d[4]}</p><span class="go">Open →</span></a>`).join('')}</div>
  <h2 class="sec">Workflows you can run yourself</h2>
  <div class="tw"><table class="t"><thead><tr><th>Workflow</th><th>Steps</th><th>Start</th></tr></thead><tbody>${[
   ['A. Customer','Menu → item → cart → checkout → demo payment → order confirmed → order status','app-menu'],
   ['B. Waiter & kitchen','Table → order → send to kitchen → in progress → ready → bill request','waiter'],
   ['C. Cashier','Order → discount & charges → bill split → demo payment → receipt','pos'],
   ['D. Stock','Purchase order → goods receipt → stock increase → used by sales → stock report','admin-purchase'],
   ['E. Staff','Profile → attendance → shift → payroll summary','admin-hr'],
   ['F. Marketing','Select customers → draft message → preview → sample result','admin-crm']].map(r=>`<tr><td class="b nw">${r[0]}</td><td>${r[1]}</td><td><a class="btn sm" href="#${r[2]}">Start</a></td></tr>`).join('')}</tbody></table></div>
  <p class="sm" style="color:#a89c8a;margin-top:8px">Every area shares the same sample data: an order sent by the waiter appears in the kitchen and on the POS, and paying a bill reduces stock and updates the dashboard. Data stays in this browser only; the “↺ Reset” button above restores the starting state.</p>
  <h2 class="sec">Before approval</h2>
  <div class="grid c2"><div class="card"><h3>Review & written approval</h3><p class="sm" style="color:#c1b6a4">An eight-part review checklist is ready with version and date. Ticking the checklist is not final approval — approval must be given in writing.</p><p style="margin-top:12px"><a class="btn" href="#handover">Review checklist</a> <a class="btn ghost" href="#plan">Planning document</a></p></div>
  <div class="card"><h3>AI automation & third-party costs</h3><p class="sm" style="color:#c1b6a4">The developer will complete AI automation integration within the agreed project scope. Usage-based API charges, subscriptions and third-party costs are borne by the restaurant. No AI feature or paid API is active in this demo.</p></div></div>
  <footer><p>${VERSION} · Quotation no. 458210 (total ৳2,60,000 · 16 modules · 45 days) · Prepared by ModinaLink IT Solution</p><p>${IMG_CREDIT} Dish names and some prices come from the client's menu cards; the remaining prices and all customer, staff and accounting figures are samples.</p></footer>
  </div></div>`;
};
