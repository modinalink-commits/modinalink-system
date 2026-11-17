/* মূল সহায়ক: অবস্থা (state), রাউটার, মডাল, টোস্ট, যাচাই */
let S, UI = {tab:{}, q:{}, pos:{type:'takeaway',cat:'all',lines:[],oid:null,table:null,view:'order'}, w:{}, app:{cat:'all'}, site:{cat:'all'}};
var V = {}, A = {}, F = {}, I = {};
var KEY = 'ember-proto-v3';
var $ = (s,r=document)=>r.querySelector(s), $$ = (s,r=document)=>[...r.querySelectorAll(s)];
var esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
var bn = x => String(x).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
var fmt = n => Math.round(n).toLocaleString('en-IN');
var tk = n => (n<0?'−':'') + '৳' + bn(fmt(Math.abs(n)));
var isEn = () => S.lang==='en' && /^(site|app)/.test(route());
var L = (b,e) => isEn()? e : b;
var N = x => isEn()? String(x) : bn(x);
var P = n => isEn()? '৳'+fmt(n) : tk(n);
var now = () => Date.now();
var mins = t => Math.max(0,Math.floor((now()-t)/60000));
var hm = t => { const d=new Date(t); let h=d.getHours(), m=String(d.getMinutes()).padStart(2,'0'); const ap=h>=12?'PM':'AM'; h=h%12||12; return bn(h+':'+m)+' '+ap; };
var dmy = t => { const d=new Date(t); return bn(d.getDate())+' '+['জানু','ফেব্রু','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টে','অক্টো','নভে','ডিসে'][d.getMonth()]; };
var sameDay = t => new Date(t).toDateString()===new Date().toDateString() || now()-t < 20*3600e3;
var img = (name,alt,cls) => name? `<img src="img/${name}.jpg" alt="${esc(alt||'')}" ${cls?`class="${cls}"`:''} onerror="this.outerHTML='<div class=&quot;ph ${cls||''}&quot;>ছবি পরে যুক্ত হবে</div>'">` : `<div class="ph ${cls||''}">${L('ছবি পরে যুক্ত হবে','Photo to be added')}</div>`;
var ICONS = {home:'M3 11l9-8 9 8M5 10v10h14V10',menu:'M4 6h16M4 12h16M4 18h16',cart:'M3 4h2l2.5 11h10L20 7H7M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z',clock:'M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z',list:'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
 web:'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18',phone:'M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zM11 18h2',chart:'M4 20V10M10 20V4M16 20v-7M21 20H3',pos:'M4 5h16v10H4zM8 19h8M12 15v4',user:'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6',fire:'M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z',grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
 box:'M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8',truck:'M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z',users:'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3 3-5 6-5s6 2 6 5M17 11a3 3 0 100-6M21 20c0-2-1-4-4-5',money:'M3 7h18v10H3zM12 14a2 2 0 100-4 2 2 0 000 4z',card:'M3 6h18v12H3zM3 10h18',mega:'M4 10v4l10 4V6zM14 9a3 3 0 010 6M6 14v4h3',shield:'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z',cal:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',doc:'M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6',check:'M5 12l5 5L20 7',plus:'M12 5v14M5 12h14',x:'M6 6l12 12M18 6L6 18',back:'M15 5l-7 7 7 7',bell:'M6 16V11a6 6 0 1112 0v5l2 2H4zM10 20a2 2 0 004 0',swap:'M7 7h13l-3-3M17 17H4l3 3'};
var ic = n => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[n]||''}"/></svg>`;

/* ── state ── */
function load(){ try{ const j=JSON.parse(localStorage.getItem(KEY)); if(j&&j.v===3) return j; }catch(e){} return null; }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function reset(){ S = seed(); UI = {tab:{},q:{},pos:{type:'takeaway',cat:'all',lines:[],oid:null,table:null,view:'order'},w:{},app:{cat:'all'},site:{cat:'all'}}; save(); }
var item = id => S.menu.find(m=>m.id===id);
var ing = id => S.ing.find(i=>i.id===id);
var order = id => S.orders.find(o=>o.id===id);
var recipeOf = m => (S.rx&&S.rx[m.id]) || RECIPE[m.id] || RECIPE[m.cat] || {};
var costOf = m => Object.entries(recipeOf(m)).reduce((s,[k,q])=>s+q*(ing(k)?ing(k).cost:0),0);
function calc(o){
  const sub = o.items.reduce((s,i)=>s+i.qty*i.price,0);
  let disc = 0; if(o.disc) disc = o.disc.type==='pct'? Math.round(sub*o.disc.val/100) : Math.min(o.disc.val,sub);
  const cdisc = o.coupon? couponVal(o.coupon,sub-disc) : 0;
  const base = sub-disc-cdisc;
  const svc = o.type==='dine'? Math.round(base*S.cfg.svc/100) : 0;
  const vat = Math.round(base*S.cfg.vat/100);
  const delivery = o.delivery||0;
  return {sub,disc,cdisc,base,svc,vat,delivery,total:base+svc+vat+delivery};
}
function couponVal(code,amt){ const c=S.coupons.find(c=>c.code===code&&c.on); if(!c||amt<c.min) return 0; return c.type==='pct'? Math.round(amt*c.val/100) : Math.min(c.val,amt); }
var TYPE = {dine:'বসে খাওয়া',takeaway:'পার্সেল',delivery:'ডেলিভারি',online:'অনলাইন অর্ডার'};
var KST = {new:['নতুন','warn'],cooking:['প্রস্তুতি চলছে','info'],ready:['প্রস্তুত','ok'],served:['পরিবেশিত/হস্তান্তর','plain']};
var kb = o => `<span class="bdg ${KST[o.k][1]}">${KST[o.k][0]}</span>`;
var pb = o => o.paid? '<span class="bdg ok">পরিশোধিত</span>' : (o.billReq? '<span class="bdg warn">বিলের অনুরোধ</span>' : '<span class="bdg bad">অপরিশোধিত</span>');
function tableState(t){
  const o = S.orders.find(o=>o.table===t.id && !o.paid);
  if(!o) return t.res? {c:'res',l:'সংরক্ষিত'} : {c:'',l:'খালি'};
  if(o.billReq) return {c:'bill',l:'বিলের অনুরোধ',o};
  if(o.k==='ready') return {c:'rdy',l:'খাবার প্রস্তুত',o};
  return {c:'occ',l:'অর্ডার চলছে',o};
}
function newOrder(p){ const o = Object.assign({id:'EE-'+(S.seq++),k:'new',t:now(),paid:false,items:[]},p); S.orders.unshift(o); return o; }
function log(a,u){ S.audit.unshift({t:now(),u:u||ROLES[S.role],a}); }
function note(text,to){ S.notes.unshift({t:now(),text,to,seen:false}); }
function useStock(o){ // বিক্রিভিত্তিক স্টক কর্তন (রেসিপি অনুযায়ী)
  if(o.stk) return; o.stk=true;
  o.items.forEach(l=>{ const m=item(l.mid); if(!m) return; Object.entries(recipeOf(m)).forEach(([k,q])=>{ const g=ing(k); if(!g) return; const use=+(q*l.qty).toFixed(3); g.stock=+(g.stock-use).toFixed(3); S.moves.unshift({t:now(),ing:k,q:-use,type:'sale',ref:o.id+' · '+l.name}); }); });
}
function payOrder(o,pays,by){
  o.paid=true; o.pt=now(); o.pay=pays; o.cashier=by||o.cashier; o.billReq=false; if(o.type==='dine'||o.k==='ready') o.k = o.k==='new'||o.k==='cooking'? o.k : 'served';
  useStock(o);
  pays.forEach(p=>{ if(p.gw) S.txns.unshift({id:'TXN-'+(88000+S.seq+S.txns.length),t:now(),gw:p.gw,oid:o.id,amt:p.a,status:'success'}); });
  const c = o.cust && S.cust.find(c=>c.phone===o.cust.phone); if(c){ c.orders++; c.spent+=calc(o).total; c.pts+=Math.round(calc(o).total/100); }
  log(`বিল ${o.id} পরিশোধিত — ${tk(calc(o).total)} (${pays.map(p=>p.m).join(' + ')})`, by);
}

/* ── UI primitives ── */
function toast(msg,kind){ const d=document.createElement('div'); d.className='toast '+(kind||''); d.textContent=msg; $('#toasts').appendChild(d); setTimeout(()=>d.remove(),4200); }
let lastFocus=null;
function modal(title,body,foot,wide){
  lastFocus = document.activeElement;
  const m=$('#modal'); m.hidden=false;
  m.innerHTML=`<div class="mbox ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mhd"><h2>${title}</h2><button class="x" data-a="close" aria-label="বন্ধ করুন">×</button></div><div class="mbd">${body}</div>${foot?`<div class="mft">${foot}</div>`:''}</div>`;
  const f=$('input:not([type=hidden]),select,textarea,.mbd button',m)||$('.x',m); f&&f.focus();
}
function closeModal(){ const m=$('#modal'); m.hidden=true; m.innerHTML=''; if(lastFocus&&document.contains(lastFocus)) lastFocus.focus(); }
A.close = closeModal;
function confirmBox(title,text,act,label,data){ modal(title,`<p>${text}</p>`,`<button class="btn sec" data-a="close">বাতিল</button><button class="btn" data-a="${act}" ${Object.entries(data||{}).map(([k,v])=>`data-${k}="${esc(v)}"`).join(' ')}>${label}</button>`); }
function validate(form){
  let ok=true, first=null;
  $$('.em',form).forEach(e=>e.remove()); $$('.fld.err',form).forEach(e=>e.classList.remove('err'));
  $$('input,select,textarea',form).forEach(el=>{
    let msg=''; const v=el.value.trim(); const en=isEn();
    if(el.required && !v) msg = en?'This field is required':'এই ঘরটি পূরণ করুন';
    else if(v && el.dataset.phone!=null && !/^01\d{9}$/.test(v.replace(/[-\s]/g,''))) msg = en?'Enter an 11-digit mobile number (01…)':'১১ সংখ্যার মোবাইল নম্বর দিন (০১ দিয়ে শুরু)';
    else if(v && el.type==='number' && el.min!=='' && +v < +el.min) msg = (en?'Minimum ':'সর্বনিম্ন ')+N(el.min);
    else if(v && el.type==='number' && el.max!=='' && +v > +el.max) msg = (en?'Maximum ':'সর্বোচ্চ ')+N(el.max);
    else if(v && el.type==='email' && !/^\S+@\S+\.\S+$/.test(v)) msg = en?'Enter a valid email':'সঠিক ইমেইল দিন';
    if(msg){ ok=false; const f=el.closest('.fld'); if(f){ f.classList.add('err'); const s=document.createElement('small'); s.className='em'; s.textContent=msg; f.appendChild(s);} el.setAttribute('aria-invalid','true'); first=first||el; } else el.removeAttribute('aria-invalid');
  });
  if(first) first.focus();
  return ok;
}
var fld = (label,name,o={}) => `<label class="fld"><span>${label}${o.req?' *':''}</span>${o.type==='select'? `<select name="${name}" ${o.req?'required':''}>${o.opts.map(x=>{const [v,l]=Array.isArray(x)?x:[x,x];return `<option value="${esc(v)}" ${String(o.val)===String(v)?'selected':''}>${esc(l)}</option>`}).join('')}</select>` : o.type==='textarea'? `<textarea name="${name}" ${o.req?'required':''} placeholder="${esc(o.ph||'')}">${esc(o.val||'')}</textarea>` : `<input type="${o.type||'text'}" name="${name}" value="${esc(o.val==null?'':o.val)}" ${o.req?'required':''} ${o.phone?'data-phone inputmode="tel"':''} ${o.min!=null?`min="${o.min}"`:''} ${o.max!=null?`max="${o.max}"`:''} ${o.step?`step="${o.step}"`:''} placeholder="${esc(o.ph||'')}">`}${o.hint?`<small class="hint">${o.hint}</small>`:''}</label>`;
var tbl = (heads,rows,o={}) => rows.length? `<div class="tw"><table class="t ${o.cls||''}"><thead><tr>${heads.map(h=>`<th ${/^>/.test(h)?'class="r"':''}>${h.replace(/^>/,'')}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>` : `<div class="card empty"><b>${o.empty||'কোনো তথ্য পাওয়া যায়নি'}</b>${o.emptyHint||'ফিল্টার বদলে দেখুন অথবা নতুন এন্ট্রি যোগ করুন।'}</div>`;
var tr = (cells,cls) => `<tr ${cls?`class="${cls}"`:''}>${cells.map(c=>{ const r=typeof c==='string'&&c[0]==='>'; return `<td ${r?'class="r"':''}>${r?c.slice(1):c}</td>`}).join('')}</tr>`;
var tabs = (key,list) => { const cur=UI.tab[key]||list[0][0]; return `<div class="tabs" role="tablist">${list.map(([k,l])=>`<button role="tab" aria-selected="${cur===k}" class="${cur===k?'on':''}" data-a="tab" data-k="${key}" data-v="${k}">${l}</button>`).join('')}</div>`; };
var tabOf = (key,def) => UI.tab[key]||def;
A.tab = d => { UI.tab[d.k]=d.v; render(); };
var demoTag = t => `<span class="bdg demo">${t||'নমুনা'}</span>`;
A.demo = d => toast(d.msg||'এটি প্রদর্শনী — মূল সফটওয়্যারে এই কাজটি বাস্তবে হবে।');
A.copy = d => { try{ navigator.clipboard.writeText(d.text).then(()=>toast('কপি হয়েছে','ok'),()=>toast('কপি করা যায়নি — লেখাটি নির্বাচন করে কপি করুন','bad')); }catch(e){ toast('কপি করা যায়নি','bad'); } };

/* ── router ── */
var ROUTES = {preview:'ডিজাইন প্রিভিউ',modules:'মডিউলভিত্তিক তালিকা',plan:'M01 পরিকল্পনা নথি',handover:'M16 পর্যালোচনা ও হস্তান্তর',
 'site-home':'ওয়েবসাইট','site-menu':'ওয়েবসাইট · মেনু','site-offers':'ওয়েবসাইট · অফার','site-gallery':'ওয়েবসাইট · গ্যালারি','site-reserve':'ওয়েবসাইট · রিজার্ভেশন','site-about':'ওয়েবসাইট · পরিচিতি','site-contact':'ওয়েবসাইট · যোগাযোগ','site-proposed':'ওয়েবসাইট · প্রস্তাবিত অংশ',
 'app-menu':'গ্রাহক অ্যাপ','app-item':'গ্রাহক অ্যাপ · খাবার','app-cart':'গ্রাহক অ্যাপ · কার্ট','app-checkout':'গ্রাহক অ্যাপ · চেকআউট','app-pay':'গ্রাহক অ্যাপ · নমুনা পেমেন্ট','app-done':'গ্রাহক অ্যাপ · অর্ডার নিশ্চিত','app-track':'গ্রাহক অ্যাপ · অর্ডারের অবস্থা','app-history':'গ্রাহক অ্যাপ · ইতিহাস',
 pos:'ক্যাশিয়ার পিওএস',waiter:'ওয়েটার প্যানেল',kds:'রান্নাঘরের ডিসপ্লে',
 'admin-dashboard':'প্যানেল · ড্যাশবোর্ড','admin-orders':'প্যানেল · অর্ডার','admin-reserve':'প্যানেল · রিজার্ভেশন','admin-menu':'প্যানেল · মেনু ও রেসিপি','admin-stock':'প্যানেল · ইনভেন্টরি','admin-purchase':'প্যানেল · ক্রয়','admin-hr':'প্যানেল · কর্মী','admin-accounts':'প্যানেল · হিসাব','admin-payments':'প্যানেল · পেমেন্ট','admin-crm':'প্যানেল · মার্কেটিং','admin-users':'প্যানেল · ব্যবহারকারী ও নিরাপত্তা'};
var route = () => { const h=(location.hash||'').slice(1); return ROUTES[h]? h : 'preview'; };
var go = r => { if(route()===r) render(); else location.hash = r; };
A.go = d => go(d.r);
function demobar(){
  const r=route();
  $('#demobar').innerHTML = `${r!=='preview'?`<button data-a="go" data-r="preview">← প্রিভিউ</button>`:''}<span class="where">${ROUTES[r]}</span><span class="tag">ডেমো · নমুনা তথ্য</span><span class="sp"></span>
  <label class="sm" style="display:flex;gap:6px;align-items:center"><span class="hide-m">অংশ:</span><select data-i="jump" aria-label="অন্য অংশে যান"><option value="">অন্য অংশে যান…</option>${[['site-home','গ্রাহকের ওয়েবসাইট'],['app-menu','গ্রাহক অ্যাপ'],['admin-dashboard','মালিক/ম্যানেজারের প্যানেল'],['pos','ক্যাশিয়ার পিওএস'],['waiter','ওয়েটার প্যানেল'],['kds','রান্নাঘরের ডিসপ্লে'],['modules','মডিউল তালিকা']].map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('')}</select></label>
  <button data-a="askReset" title="সব নমুনা তথ্য শুরুর অবস্থায় ফেরান">↺ রিসেট</button>`;
}
I.jump = v => { if(v) go(v); };
A.askReset = () => confirmBox('নমুনা তথ্য রিসেট','এই ব্রাউজারে আপনার করা সব পরিবর্তন (অর্ডার, স্টক, ফর্ম) মুছে শুরুর নমুনা তথ্য ফিরে আসবে।','doReset','রিসেট করুন');
A.doReset = () => { reset(); closeModal(); render(); toast('নমুনা তথ্য শুরুর অবস্থায় ফিরেছে','ok'); };
let lastRoute=null;
function render(){
  const r=route(), root=$('#root');
  const ae=document.activeElement, fid=ae&&ae.id&&root.contains(ae)?ae.id:null, pos=fid&&ae.selectionStart!=null?[ae.selectionStart,ae.selectionEnd]:null;
  const sc = {}; $$('[data-keep]',root).forEach(e=>sc[e.dataset.keep]=e.scrollTop);
  demobar();
  document.documentElement.lang = isEn()?'en':'bn';
  root.innerHTML = (V[r]||V.preview)();
  document.title = ROUTES[r]+' — Ember Essence design preview';
  if(lastRoute!==r){ window.scrollTo(0,0); lastRoute=r; } else { $$('[data-keep]',root).forEach(e=>{ if(sc[e.dataset.keep]!=null) e.scrollTop=sc[e.dataset.keep]; }); }
  if(fid){ const el=document.getElementById(fid); if(el){ el.focus(); if(pos&&el.setSelectionRange) try{el.setSelectionRange(pos[0],pos[1])}catch(e){} } }
  tick(); save();
}
function tick(){
  $$('[data-ts]').forEach(e=>{ const s=Math.max(0,Math.floor((now()-(+e.dataset.ts))/1000)); e.textContent=bn(String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')); });
  const c=$('#kclock'); if(c) c.textContent=hm(now());
}
function boot(){
  S = load() || seed();
  document.addEventListener('click',e=>{
    const m=$('#modal'); if(e.target===m){ closeModal(); return; }
    const el=e.target.closest('[data-a]'); if(!el||el.disabled) return;
    const fn=A[el.dataset.a]; if(fn){ if(el.tagName==='A') e.preventDefault(); fn(el.dataset,el,e); }
  });
  document.addEventListener('submit',e=>{ e.preventDefault(); const f=e.target; if(!validate(f)) { toast(isEn()?'Please correct the highlighted fields':'চিহ্নিত ঘরগুলো ঠিক করুন','bad'); return; } const fn=F[f.dataset.f]; if(fn) fn(Object.fromEntries(new FormData(f)),f); });
  const oninp=e=>{ const el=e.target.closest('[data-i]'); if(!el) return; if(e.type==='input'&&(el.tagName==='SELECT'||el.type==='checkbox'||el.type==='radio'||el.type==='date')) return; const fn=I[el.dataset.i]; if(fn) fn(el.type==='checkbox'?el.checked:el.value,el); };
  document.addEventListener('input',oninp); document.addEventListener('change',e=>{ const el=e.target.closest('[data-i]'); if(el&&(el.tagName==='SELECT'||el.type==='checkbox'||el.type==='radio'||el.type==='date')) oninp(e); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!$('#modal').hidden) closeModal(); });
  window.addEventListener('hashchange',render);
  window.addEventListener('storage',e=>{ if(e.key===KEY){ const j=load(); if(j){ S=j; if($('#modal').hidden) render(); } } });
  setInterval(tick,1000);
  setInterval(()=>{ if(/^(kds|waiter|pos|app-track)$/.test(route()) && $('#modal').hidden && !(document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) render(); },15000);
  render();
}

/* ── ডিজাইন প্রিভিউ (প্রবেশপথ) ── */
V.preview = () => {
  const doors = [['site-home','web','০১','গ্রাহকের ওয়েবসাইট','বাংলা ও ইংরেজি — হোম, মেনু, অফার, গ্যালারি, রিজার্ভেশন, পরিচিতি, যোগাযোগ।','M03'],
   ['app-menu','phone','০২','গ্রাহক অ্যাপ','মেনু → খাবার → কার্ট → চেকআউট → নমুনা পেমেন্ট → অর্ডারের অবস্থা।','M04'],
   ['admin-dashboard','chart','০৩','মালিক/ম্যানেজারের প্যানেল','ড্যাশবোর্ড, মেনু, স্টক, ক্রয়, কর্মী, হিসাব, পেমেন্ট, মার্কেটিং, নিরাপত্তা।','M02, M08–M15'],
   ['pos','pos','০৪','ক্যাশিয়ার পিওএস','টাচস্ক্রিন অর্ডার, টেবিল ম্যাপ, ছাড়, বিল ভাগ, শিফট ও থার্মাল রসিদ।','M05'],
   ['waiter','user','০৫','ওয়েটার প্যানেল','মোবাইলে টেবিল বেছে অর্ডার, রান্নাঘরে পাঠানো, টেবিল বদল, বিলের অনুরোধ।','M06'],
   ['kds','fire','০৬','রান্নাঘরের ডিসপ্লে','দূর থেকে পড়ার মতো অর্ডার কার্ড, টাইমার, অবস্থা পরিবর্তন, কিচেন টিকিট।','M07'],
   ['modules','grid','০৭','মডিউলভিত্তিক ডিজাইনের তালিকা','কোটেশনের ১৬টি মডিউল — প্রতিটির পর্দা, পরিকল্পনা নথি ও অনুমোদনের তালিকা।','M01–M16']];
  return `<div class="hub"><div class="wrap">
  <header><img src="img/logo.jpg" alt="Ember Essence লোগো"><div><p class="n" style="color:var(--gold);letter-spacing:.14em;font-size:13px">EMBER ESSENCE RESTAURANT · MODINALINK IT SOLUTION</p><h1>ডিজাইন প্রিভিউ — <em>Ember Essence</em> রেস্টুরেন্ট সফটওয়্যার</h1><p class="lead">কোটেশন নং ৪৫৮২১০-এর ১৬টি মডিউল অনুযায়ী ওয়েবসাইট, গ্রাহক অ্যাপ, প্রশাসনিক প্যানেল, পিওএস, ওয়েটার প্যানেল ও রান্নাঘরের ক্লিকযোগ্য নকশা। একটি রেস্টুরেন্ট · একটি শাখা · সর্বোচ্চ ১০ জন স্টাফ ব্যবহারকারী · দুটি পিওএস কাউন্টার।</p></div></header>
  <div class="notice"><b>এটি ডিজাইন অনুমোদনের জন্য তৈরি প্রদর্শনী।</b> এখানে নমুনা তথ্য ব্যবহার করা হয়েছে। ডিজাইন ও নির্ধারিত কার্যপ্রবাহ অনুমোদনের পরে মূল সফটওয়্যার উন্নয়ন শুরু হবে। এখানে কোনো বাস্তব লগইন, পেমেন্ট, বার্তা পাঠানো বা সার্ভার সংযোগ নেই; নিচে পাসওয়ার্ড ছাড়াই নমুনা ভূমিকা বেছে দেখা যায় — এটি নিরাপত্তা ব্যবস্থা নয়।</div>
  <div class="doors">${doors.map(d=>`<a class="door" href="#${d[0]}"><span class="ic">${ic(d[1])}</span><span class="n">${d[2]} · ${d[5]}</span><h2>${d[3]}</h2><p>${d[4]}</p><span class="go">খুলে দেখুন →</span></a>`).join('')}</div>
  <h2 class="sec">যে কার্যপ্রবাহগুলো নিজে চালিয়ে দেখা যায়</h2>
  <div class="tw">${`<table class="t"><thead><tr><th>কার্যপ্রবাহ</th><th>ধাপ</th><th>শুরু</th></tr></thead><tbody>${[
   ['ক. গ্রাহক','মেনু → খাবার → কার্ট → চেকআউট → নমুনা পেমেন্ট → অর্ডার নিশ্চিত → অর্ডারের অবস্থা','app-menu'],
   ['খ. ওয়েটার ও রান্নাঘর','টেবিল → অর্ডার → রান্নাঘরে পাঠানো → প্রস্তুতি → প্রস্তুত → বিলের অনুরোধ','waiter'],
   ['গ. ক্যাশিয়ার','অর্ডার → ছাড় ও চার্জ → বিল ভাগ → নমুনা পেমেন্ট → রসিদ','pos'],
   ['ঘ. স্টক','ক্রয়াদেশ → মাল গ্রহণ → স্টক বৃদ্ধি → বিক্রিতে ব্যবহার → স্টক রিপোর্ট','admin-purchase'],
   ['ঙ. কর্মী','প্রোফাইল → হাজিরা → শিফট → বেতনের সারসংক্ষেপ','admin-hr'],
   ['চ. মার্কেটিং','গ্রাহক নির্বাচন → বার্তার খসড়া → প্রিভিউ → নমুনা ফলাফল','admin-crm']].map(r=>`<tr><td class="b nw">${r[0]}</td><td>${r[1]}</td><td><a class="btn sm" href="#${r[2]}">শুরু করুন</a></td></tr>`).join('')}</tbody></table>`}</div>
  <p class="sm" style="color:#a89c8a;margin-top:8px">সব অংশ একই নমুনা তথ্য ব্যবহার করে: ওয়েটারের পাঠানো অর্ডার রান্নাঘরে ও পিওএসে দেখা যায়, বিল পরিশোধ হলে স্টক কমে ও ড্যাশবোর্ড বদলায়। তথ্য শুধু এই ব্রাউজারে থাকে; উপরের “↺ রিসেট” বাটনে শুরুর অবস্থায় ফেরে।</p>
  <h2 class="sec">অনুমোদনের আগে</h2>
  <div class="grid c2"><div class="card"><h3>পর্যালোচনা ও লিখিত অনুমোদন</h3><p class="sm" style="color:#c1b6a4">আট অংশের পর্যালোচনার তালিকা সংস্করণ ও তারিখসহ প্রস্তুত আছে। তালিকায় টিক দেওয়া চূড়ান্ত অনুমোদন নয় — অনুমোদন লিখিতভাবে নিতে হবে।</p><p style="margin-top:12px"><a class="btn" href="#handover">পর্যালোচনার তালিকা</a> <a class="btn ghost" href="#plan">পরিকল্পনা নথি</a></p></div>
  <div class="card"><h3>এআই অটোমেশন ও বাইরের খরচ</h3><p class="sm" style="color:#c1b6a4">প্রকল্পের নির্ধারিত পরিধির এআই অটোমেশন ইন্টিগ্রেশন ডেভেলপার সম্পন্ন করবেন। সংশ্লিষ্ট এপিআইয়ের ব্যবহারভিত্তিক চার্জ, সাবস্ক্রিপশন ও তৃতীয় পক্ষের খরচ রেস্টুরেন্ট কর্তৃপক্ষ বহন করবে। এই প্রদর্শনীতে কোনো এআই ফিচার বা পেইড এপিআই চালু নেই।</p></div></div>
  <footer><p>${VERSION} · কোটেশন নং ৪৫৮২১০ (মোট ৳২,৬০,০০০ · ১৬ মডিউল · ৪৫ দিন) · প্রস্তুতকারী: ModinaLink IT Solution</p><p>${IMG_CREDIT} খাবারের নাম ও কিছু দাম গ্রাহকের মেনু কার্ড থেকে; বাকি দাম, গ্রাহক, কর্মী ও হিসাবের সব অঙ্ক নমুনা।</p></footer>
  </div></div>`;
};
