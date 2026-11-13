/* ModinaLink: fills the design Portal and Admin pages with real data from the API.
   Only what the backend really has is shown. Modules without a backend yet say so plainly. */
(function () {
  var path = location.pathname.replace(/\/+$/, '') || '/';
  var isAdmin = path === '/admin';
  var isPortal = path === '/portal';
  if (!isAdmin && !isPortal) return;

  var TOKEN = null;
  try { TOKEN = localStorage.getItem('ml_token'); } catch (e) {}
  if (!TOKEN) { location.replace('/login'); return; }

  function api(p, opt) {
    opt = opt || {};
    return fetch('/api' + p, {
      method: opt.method || 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
      body: opt.body ? JSON.stringify(opt.body) : undefined
    }).then(function (r) {
      if (r.status === 401) { try { localStorage.removeItem('ml_token'); } catch (e) {} location.replace('/login'); throw new Error('auth'); }
      return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, j: j }; });
    });
  }
  function rows(res) { var j = res.j; return Array.isArray(j) ? j : (j && j.data) || []; }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function norm(s) { return (s || '').replace(/\s+/g, ' ').trim(); }
  function byText(sel, t, partial) {
    return all(sel).filter(function (e) { var x = norm(e.textContent); return partial ? (e.children.length === 0 && x.indexOf(t) === 0) : x === t; })[0];
  }
  function leaf(sel, t) { // element whose own text is t
    return all(sel).filter(function (e) { return e.children.length === 0 && norm(e.textContent) === t; })[0];
  }
  function bdt(n) { return '৳ ' + Number(n || 0).toLocaleString('bn-BD'); }
  function dt(s) { if (!s) return '—'; var d = new Date(s); return isNaN(d) ? String(s) : d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function dtt(s) { if (!s) return '—'; var d = new Date(s); return isNaN(d) ? String(s) : d.toLocaleString('bn-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  var DOT = { paid: '#16A34A', deployed: '#16A34A', closed: '#16A34A', active: '#16A34A', approved: '#16A34A', issued: '#F59E0B', pending: '#F59E0B', review: '#F59E0B', staging_ready: '#F59E0B', needs_info: '#F59E0B', rejected: '#DC2626', void: '#94A3B8', failed: '#DC2626', new: '#2563EB', submitted: '#2563EB' };
  function setStatus(cell, status) {
    var dot = cell.querySelector('span span'); var wrap = cell.querySelector('span');
    if (dot) dot.style.background = DOT[status] || '#94A3B8';
    if (wrap) { for (var i = wrap.childNodes.length - 1; i >= 0; i--) if (wrap.childNodes[i].nodeType === 3) wrap.removeChild(wrap.childNodes[i]); wrap.appendChild(document.createTextNode(status)); }
  }
  function link(el, href, title) {
    var a = document.createElement('a'); a.href = href; if (title) a.title = title;
    a.style.cssText = 'color:inherit;text-decoration:none'; a.appendChild(el); return a;
  }
  function soon(card, label) { // replace a card's body with an honest "not built yet" note
    all(':scope > div', card).forEach(function (d, i) { if (i > 0) d.remove(); });
    var n = document.createElement('div');
    n.style.cssText = 'font-size:14px;color:#475569;line-height:1.7;margin-top:8px';
    n.textContent = label || 'এই মডিউল এখনো চালু হয়নি। চালু হলে এখানে আপনার আসল তথ্য দেখাবে।';
    card.appendChild(n);
  }
  function note(anchor, msg, ok) {
    var n = document.getElementById('ml-note2');
    if (!n) { n = document.createElement('div'); n.id = 'ml-note2'; n.setAttribute('role', 'status'); n.style.cssText = 'margin-top:12px;font-size:14px;font-weight:600;line-height:1.6'; anchor.parentNode.insertBefore(n, anchor.nextSibling); }
    n.style.color = ok ? '#166534' : '#B91C1C'; n.textContent = msg;
  }
  function press(el, fn) {
    if (!el) return;
    el.style.cursor = 'pointer';
    if (!/^(A|BUTTON)$/.test(el.tagName)) { el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); }
    el.addEventListener('click', function (e) { e.preventDefault(); fn(el); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(el); } });
  }
  function nav(map) {
    all('a[href="#top"]').forEach(function (a) {
      var t = norm(a.textContent);
      if (map[t]) { a.setAttribute('href', map[t]); }
      else if (!a.closest('[id="list"]')) { a.setAttribute('aria-disabled', 'true'); a.title = 'এই মডিউল এখনো চালু হয়নি'; a.style.opacity = '.6'; }
    });
  }
  function logoutLink() {
    var host = all('a').filter(function (a) { return /Profile|Settings/.test(norm(a.textContent)); })[0];
    if (!host) return;
    var b = host.cloneNode(true); b.textContent = 'লগআউট'; b.href = '#'; b.style.opacity = '1';
    b.addEventListener('click', function (e) { e.preventDefault(); api('/auth/logout', { method: 'POST' }).catch(function () {}).then(function () { try { localStorage.removeItem('ml_token'); } catch (x) {} location.replace('/login'); }); });
    host.parentNode.appendChild(b);
  }

  /* ------------------------------ PORTAL ------------------------------ */
  function portal() {
    nav({ 'ওভারভিউ': '/portal', Overview: '/portal', Invoices: '/portal/invoices', Payments: '/portal/invoices', 'Support Tickets': '/portal/tickets/new', 'Subscription ও Renewals': '/portal/subscriptions' });
    logoutLink();
    var me = api('/me'), tk = api('/tickets'), iv = api('/invoices'), sb = api('/subscriptions'), pj = api('/my/projects');
    Promise.all([me, tk, iv, sb, pj]).then(function (r) {
      var user = (r[0].j && r[0].j.user) || {}, tickets = rows(r[1]), invs = rows(r[2]), subs = rows(r[3]);
      chatWidget(user);
      var projs = Array.isArray(r[4].j) ? r[4].j : [];
      var sub = leaf('div', 'আপনার অথবা অনুমোদিত প্রতিষ্ঠানের তথ্য। নিচের সব তথ্য নমুনা (Sample data)।') || byText('div', 'আপনার অথবা অনুমোদিত প্রতিষ্ঠানের তথ্য', true);
      if (sub) sub.textContent = (user.name || '') + (user.company ? ' · ' + user.company : '') + ' — আপনার অ্যাকাউন্টের আসল তথ্য।';

      function kpi(label, val) { var l = leaf('div', label); if (l && l.nextElementSibling) l.nextElementSibling.textContent = val; }
      var due = invs.filter(function (i) { return i.status === 'issued'; });
      kpi('চলমান প্রজেক্ট', String(projs.filter(function (p) { return p.status === 'in_progress'; }).length)); kpi('অনুমোদনের অপেক্ষায়', String(awaiting(projs).length));
      kpi('বকেয়া ইনভয়েস', String(due.length));
      var next = subs.filter(function (s) { return s.status === 'active'; })[0];
      kpi('রিনিউয়াল', next ? dt(next.renews_on) : '—');

      var projTitle = leaf('div', '[প্রজেক্টের নাম] — মাইলস্টোন'), apTitle = leaf('div', 'আপনার অনুমোদন প্রয়োজন'), au = leaf('div', 'Automation Status');
      if (projTitle) PV.ovProject = projTitle.parentNode.parentNode; if (apTitle) PV.ovApprove = apTitle.parentNode; if (au) PV.ovAuto = au.parentNode;
      portalViews(user, projs);
      /* invoices */
      var card = leaf('div', 'ইনভয়েস ও পেমেন্ট');
      if (card) {
        card = card.parentNode.parentNode;
        var all_ = card.querySelector('a'); if (all_) all_.href = '/portal/invoices';
        var grid = card.querySelector('div[style*="grid-template-columns"]');
        var cells = all(':scope > div', grid);
        var tpl = cells.slice(4, 8);
        cells.slice(4).forEach(function (c) { c.remove(); });
        if (!invs.length) {
          var e = document.createElement('div'); e.style.cssText = 'grid-column:1/-1;padding:16px 12px;color:#475569'; e.textContent = 'এখনো কোনো ইনভয়েস নেই।'; grid.appendChild(e);
        }
        invs.slice(0, 6).forEach(function (iv_) {
          var c = tpl.map(function (t) { return t.cloneNode(true); });
          c[0].textContent = iv_.number; c[1].textContent = iv_.note || 'ইনভয়েস'; c[2].textContent = bdt(iv_.total_bdt);
          setStatus(c[3], iv_.status);
          c.forEach(function (x) { grid.appendChild(x); });
        });
        var hint = card.querySelector('div[style*="line-height:1.7"]'); if (hint) hint.textContent = 'ম্যানুয়াল পেমেন্ট স্টাফ যাচাইয়ের পরই paid হয়; স্ক্রিনশট থেকে স্বয়ংক্রিয়ভাবে নয়। পেমেন্ট করতে “সব দেখুন” চাপুন।';
      }

      /* support tickets list */
      var stTitle = leaf('div', 'সাপোর্ট টিকেট');
      if (stTitle) {
        var sc = stTitle.parentNode; var rowsEl = all(':scope > div', sc).slice(1); var rt = rowsEl[0];
        rowsEl.forEach(function (x) { x.remove(); });
        if (!tickets.length) { var e2 = document.createElement('div'); e2.style.cssText = 'font-size:14px;color:#475569;padding:10px 0'; e2.textContent = 'এখনো কোনো টিকেট নেই।'; sc.appendChild(e2); }
        tickets.slice(0, 8).forEach(function (t) {
          var row = rt.cloneNode(true); var sp = row.querySelectorAll('span');
          sp[0].textContent = t.number + ' · ' + t.title; sp[1].textContent = t.status;
          var a = link(row, '#t-' + t.id); a.addEventListener('click', function (ev) { ev.preventDefault(); showTicket(t.id); });
          sc.appendChild(a);
        });
      }
      if (tickets[0]) showTicket(tickets[0].id); else clearTimeline();
    }).catch(function () {});

    function tlParts() {
      var h = byText('div', 'টিকেট #', true) || byText('div', 'নিজের টিকেট', true);
      return h;
    }
    function clearTimeline() {
      var h = tlParts(); if (!h) return;
      h.textContent = 'টিকেটের টাইমলাইন';
      var card = h.parentNode.parentNode; var chip = card.querySelector('span'); if (chip) chip.textContent = '—';
      var list = h.parentNode.nextElementSibling; if (list) { list.textContent = ''; var n = document.createElement('div'); n.style.cssText = 'font-size:14px;color:#475569'; n.textContent = 'টিকেট খুললে এখানে প্রতিটি ধাপ সময়সহ দেখাবে।'; list.appendChild(n); }
      var box = card.lastElementChild; if (box && /সার্ভিসের বর্তমান অবস্থা/.test(box.textContent)) box.remove();
    }
    var tlTpl = null;
    function showTicket(id) {
      api('/tickets/' + id).then(function (r) {
        var d = r.j; if (!d || !d.ticket) return;
        var h = tlParts(); if (!h) return;
        h.textContent = 'টিকেট ' + d.ticket.number + ' · টাইমলাইন';
        var card = h.parentNode.parentNode; var chip = h.parentNode.querySelector('span'); if (chip) chip.textContent = d.ticket.status;
        var list = h.parentNode.nextElementSibling;
        if (!tlTpl) tlTpl = list.firstElementChild.cloneNode(true);
        list.textContent = '';
        var evs = d.events || [];
        evs.forEach(function (ev) {
          var it = tlTpl.cloneNode(true); var b = it.querySelector('b'); var sub = b.nextElementSibling;
          b.textContent = ev.from_status ? ev.from_status + ' → ' + ev.to_status : 'টিকেট খোলা হয়েছে (' + ev.to_status + ')';
          sub.textContent = dtt(ev.created_at); list.appendChild(it);
        });
        (d.messages || []).forEach(function (m) {
          var it = tlTpl.cloneNode(true); var b = it.querySelector('b'); var sub = b.nextElementSibling;
          b.textContent = m.author + (m.ai_assisted ? ' (AI-সহায়তায় প্রস্তুত)' : ''); sub.textContent = m.body; list.appendChild(it);
        });
        var box = card.lastElementChild;
        if (box && /সার্ভিসের বর্তমান অবস্থা/.test(box.textContent)) {
          box.textContent = ''; var bb = document.createElement('b'); bb.textContent = 'টিকেটের বর্তমান অবস্থা'; box.appendChild(bb); box.appendChild(document.createElement('br'));
          box.appendChild(document.createTextNode(d.ticket.title + ' · ' + d.ticket.status + (d.ticket.staging_url ? ' · staging প্রস্তুত' : '')));
          var a = document.createElement('a'); a.href = '/portal/tickets/' + id; a.textContent = ' বিস্তারিত ও উত্তর দিন'; a.style.fontWeight = '600'; box.appendChild(a);
        }
      }).catch(function () {});
    }

    /* new-ticket form */
    var send = leaf('span', 'টিকেট পাঠান'), human = leaf('span', 'মানুষের সঙ্গে কথা বলতে চাই');
    var t1 = document.getElementById('t1'), t2 = document.getElementById('t2'), t3 = document.getElementById('t3');
    if (t1) t1.value = ''; if (t2) t2.value = ''; if (t1) t1.placeholder = 'আপনার সার্ভিস / ওয়েবসাইট'; if (t2) t2.placeholder = 'যেমন: সার্ভিস আপডেট, সমস্যা, নতুন ফিচার';
    function type(v) { v = (v || '').toLowerCase(); return /bug|সমস্যা|ত্রুটি|error/.test(v) ? 'bug' : /ফিচার|feature|নতুন/.test(v) ? 'new_feature' : /সাপোর্ট|support|সাহায্য/.test(v) ? 'support' : 'change'; }
    function submit(forceSupport) {
      var body = (t3 && t3.value || '').trim(), svc = (t1 && t1.value || '').trim(), kind = (t2 && t2.value || '').trim();
      if (!body) { note(send.parentNode, 'কী পরিবর্তন চান তা লিখুন।', false); return; }
      var title = (svc ? svc + ' · ' : '') + (kind || (forceSupport ? 'সাপোর্ট' : 'সার্ভিস আপডেট'));
      api('/tickets', { method: 'POST', body: { type: forceSupport ? 'support' : type(kind), title: title.slice(0, 190), description: (forceSupport ? '[মানুষের সঙ্গে কথা বলতে চান] ' : '') + body } }).then(function (r) {
        if (r.ok) { note(send.parentNode, 'টিকেট ' + (r.j.number || '') + ' খোলা হয়েছে।', true); if (t3) t3.value = ''; setTimeout(function () { location.reload(); }, 900); }
        else { var j = r.j || {}; var k = j.errors && Object.keys(j.errors)[0]; note(send.parentNode, k ? j.errors[k][0] : (j.message || 'পাঠানো যায়নি।'), false); }
      });
    }
    press(send, function () { submit(false); }); press(human, function () { submit(true); });
  }

  /* ------------------------ PORTAL: sections ------------------------ */
  var PV = {};
  function awaiting(projs) { var o = []; projs.forEach(function (p) { (p.milestones || []).forEach(function (m) { if (m.status === 'awaiting_client') o.push({ p: p, m: m }); }); }); return o; }
  function portalViews(user, projs) {
    function T(tag, css, text) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; }
    var CARD = 'background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;padding:24px';
    var BTN = 'border:1px solid #CBD5E1;border-radius:10px;padding:0 14px;min-height:44px;font-size:14px;font-weight:600;background:#fff;color:#0F172A;cursor:pointer;font-family:inherit';
    var PRI = 'background:#FF7900;color:#26272B;border:0;border-radius:10px;padding:0 16px;min-height:44px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit';
    var IN = 'width:100%;box-sizing:border-box;min-height:44px;border:1px solid #CBD5E1;border-radius:12px;padding:0 12px;font-size:14px;font-family:inherit;background:#fff';
    function chip(st) { var c = T('span', 'display:inline-flex;gap:6px;align-items:center;font-size:14px;font-weight:600'); c.appendChild(T('span', 'width:8px;height:8px;border-radius:999px;background:' + (DOT[st] || (st === 'completed' ? '#16A34A' : st === 'awaiting_client' ? '#F59E0B' : '#94A3B8')))); c.appendChild(document.createTextNode(st)); return c; }
    function empty(t) { return T('div', 'font-size:14px;color:#475569;line-height:1.7', t); }
    function card(title) { var c = T('div', CARD + ';display:flex;flex-direction:column;gap:12px'); if (title) c.appendChild(T('div', 'font-size:17px;font-weight:700', title)); return c; }
    function msRow(m) { var r = T('div', 'display:flex;gap:12px;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #F1F5F9;font-size:14px;flex-wrap:wrap'); var l = T('div'); l.appendChild(T('div', 'font-weight:600', m.title)); l.appendChild(T('div', 'font-size:14px;color:#475569', (m.due_date ? 'শেষ তারিখ: ' + dt(m.due_date) : 'তারিখ ঠিক হয়নি') + (m.approved_at ? ' · অনুমোদিত ' + dt(m.approved_at) : '') + (m.client_note ? ' · আপনার নোট: ' + m.client_note : ''))); r.appendChild(l); r.appendChild(chip(m.status)); return r; }
    function projectBlock(p) {
      var b = T('div', 'display:flex;flex-direction:column;gap:6px'); var h = T('div', 'display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap'); h.appendChild(T('div', 'font-size:16px;font-weight:700', p.name)); h.appendChild(chip(p.status)); b.appendChild(h);
      var bar = T('div', 'height:8px;border-radius:999px;background:#E2E8F0;overflow:hidden'); bar.setAttribute('role', 'progressbar'); bar.setAttribute('aria-label', 'অগ্রগতি'); bar.setAttribute('aria-valuenow', p.progress); bar.setAttribute('aria-valuemin', 0); bar.setAttribute('aria-valuemax', 100); bar.appendChild(T('div', 'height:100%;background:#FF7900;width:' + p.progress + '%')); b.appendChild(bar);
      if (!(p.milestones || []).length) b.appendChild(empty('এখনো কোনো মাইলস্টোন যোগ হয়নি।')); (p.milestones || []).forEach(function (m) { b.appendChild(msRow(m)); }); return b;
    }
    function approvalRow(x, done) {
      var r = T('div', 'border:1px solid #E2E8F0;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px');
      r.appendChild(T('div', 'font-weight:700;font-size:15px', x.m.title + ' — ' + x.p.name)); r.appendChild(T('div', 'font-size:14px;color:#475569;line-height:1.6', 'অনুমোদনের পর পরের ধাপ শুরু হবে। অনুমোদনের ইতিহাস সংরক্ষিত থাকে।'));
      var note = T('input', IN); note.type = 'text'; note.placeholder = 'পরিবর্তন চাইলে এখানে লিখুন'; note.setAttribute('aria-label', 'পরিবর্তনের নোট'); note.maxLength = 500; r.appendChild(note);
      var msg = T('div', 'font-size:14px;font-weight:600;display:none'); msg.setAttribute('role', 'status');
      var row = T('div', 'display:flex;gap:8px;flex-wrap:wrap'); var ok = T('button', PRI, 'অনুমোদন করুন'), ch = T('button', BTN, 'পরিবর্তন চান'); ok.type = ch.type = 'button'; row.appendChild(ok); row.appendChild(ch); r.appendChild(row); r.appendChild(msg);
      function go(path, body) { ok.disabled = ch.disabled = true; api(path, { method: 'POST', body: body }).then(function (res) { if (res.ok) done(); else { ok.disabled = ch.disabled = false; msg.style.cssText = 'font-size:14px;font-weight:600;color:#B91C1C;display:block'; msg.textContent = (res.j && res.j.message) || 'হয়নি'; } }); }
      ok.addEventListener('click', function () { go('/my/milestones/' + x.m.id + '/approve'); });
      ch.addEventListener('click', function () { if (!note.value.trim()) { msg.style.cssText = 'font-size:14px;font-weight:600;color:#B91C1C;display:block'; msg.textContent = 'কী পরিবর্তন চান তা লিখুন।'; return; } go('/my/milestones/' + x.m.id + '/request-changes', { note: note.value.trim() }); });
      return r;
    }
    function tbl(cols, data) {
      var c = card(); if (!data.length) { c.appendChild(empty('কোনো রেকর্ড নেই।')); return c; } c.style.overflowX = 'auto';
      var g = T('div', 'display:grid;grid-template-columns:repeat(' + cols.length + ',minmax(110px,1fr));font-size:14px;min-width:' + (cols.length * 120) + 'px'); cols.forEach(function (x) { g.appendChild(T('div', 'padding:10px 12px;font-weight:700;color:#475569;border-bottom:1px solid #E2E8F0', x.h)); });
      data.forEach(function (r) { cols.forEach(function (x) { var cell = T('div', 'padding:12px;border-bottom:1px solid #F1F5F9;word-break:break-word'); var v = x.v(r); if (v && v.nodeType) cell.appendChild(v); else if (x.s) cell.appendChild(chip(v)); else cell.textContent = v; g.appendChild(cell); }); }); c.appendChild(g); return c;
    }
    function blob(path, name) { return fetch('/api' + path, { headers: { Authorization: 'Bearer ' + TOKEN } }).then(function (r) { return r.blob(); }).then(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }); }

    /* overview cards on the dashboard */
    if (PV.ovProject) {
      var pc = PV.ovProject; pc.textContent = ''; var act = projs.filter(function (p) { return p.status === 'in_progress'; })[0] || projs[0];
      pc.appendChild(T('div', 'font-size:17px;font-weight:700;margin-bottom:8px', 'প্রজেক্ট ও মাইলস্টোন')); pc.appendChild(act ? projectBlock(act) : empty('এখনো কোনো প্রজেক্ট শুরু হয়নি। কোটেশন গৃহীত হলে প্রজেক্ট এখানে দেখাবে।'));
    }
    if (PV.ovApprove) {
      var ac = PV.ovApprove; ac.textContent = ''; ac.appendChild(T('div', 'font-size:17px;font-weight:700;margin-bottom:8px', 'আপনার অনুমোদন প্রয়োজন'));
      var aw = awaiting(projs); if (!aw.length) ac.appendChild(empty('এই মুহূর্তে কোনো অনুমোদনের অনুরোধ নেই।')); aw.forEach(function (x) { ac.appendChild(approvalRow(x, function () { location.reload(); })); });
    }
    if (PV.ovAuto) { var uc = PV.ovAuto; uc.textContent = ''; uc.appendChild(T('div', 'font-size:17px;font-weight:700;margin-bottom:8px', 'Automation Status')); uc.appendChild(empty('আপনার অ্যাকাউন্টে কোনো অটোমেশন সক্রিয় নেই। সক্রিয় হলে সর্বশেষ রান ও ফলাফল এখানে দেখাবে।')); }

    /* section switching */
    var h1 = document.querySelector('h1'); if (!h1) return; var head = h1.parentNode, col = head.parentNode;
    var dash = Array.prototype.slice.call(col.children).filter(function (x) { return x !== head; });
    var sub = head.lastElementChild; var view = T('div', 'display:none;flex-direction:column;gap:16px'); col.appendChild(view);
    var VIEWS = {
      orders: ['My Orders', function () { return Promise.all([api('/my/orders'), api('/my/quotes')]).then(function (r) { var b = T('div', 'display:flex;flex-direction:column;gap:16px'); b.appendChild(T('div', 'font-size:17px;font-weight:700', 'কোটেশন')); b.appendChild(tbl([{ h: '#', v: function (x) { return 'QUO-' + x.id; } }, { h: 'শিরোনাম', v: function (x) { return x.title; } }, { h: 'পরিমাণ', v: function (x) { return bdt(x.amount_bdt); } }, { h: 'অবস্থা', v: function (x) { return x.status; }, s: 1 }], r[1].j || [])); b.appendChild(T('div', 'font-size:17px;font-weight:700', 'অর্ডার')); b.appendChild(tbl([{ h: '#', v: function (x) { return 'ORD-' + x.id; } }, { h: 'কাজ', v: function (x) { return x.title; } }, { h: 'পরিমাণ', v: function (x) { return bdt(x.amount_bdt); } }, { h: 'অবস্থা', v: function (x) { return x.status; }, s: 1 }], r[0].j || [])); return b; }); }],
      projects: ['My Projects', function () { return Promise.resolve((function () { var b = T('div', 'display:flex;flex-direction:column;gap:16px'); if (!projs.length) { var ec = card(); ec.appendChild(empty('এখনো কোনো প্রজেক্ট নেই।')); b.appendChild(ec); } projs.forEach(function (p) { var c = card(); c.appendChild(projectBlock(p)); b.appendChild(c); }); return b; })()); }],
      milestones: ['Milestones', function () { var all_ = []; projs.forEach(function (p) { (p.milestones || []).forEach(function (m) { all_.push(Object.assign({ pname: p.name }, m)); }); }); return Promise.resolve(tbl([{ h: 'প্রজেক্ট', v: function (m) { return m.pname; } }, { h: 'ধাপ', v: function (m) { return m.title; } }, { h: 'শেষ তারিখ', v: function (m) { return dt(m.due_date); } }, { h: 'অবস্থা', v: function (m) { return m.status; }, s: 1 }], all_)); }],
      approvals: ['Approvals', function () { var b = T('div', 'display:flex;flex-direction:column;gap:12px'); var aw = awaiting(projs); if (!aw.length) { var ec = card(); ec.appendChild(empty('কোনো অনুমোদনের অনুরোধ নেই।')); b.appendChild(ec); } aw.forEach(function (x) { var c = card(); c.appendChild(approvalRow(x, function () { location.reload(); })); b.appendChild(c); }); var done = []; projs.forEach(function (p) { (p.milestones || []).forEach(function (m) { if (m.approved_at) done.push(Object.assign({ pname: p.name }, m)); }); }); b.appendChild(T('div', 'font-size:17px;font-weight:700;margin-top:8px', 'অনুমোদনের ইতিহাস')); b.appendChild(tbl([{ h: 'প্রজেক্ট', v: function (m) { return m.pname; } }, { h: 'ধাপ', v: function (m) { return m.title; } }, { h: 'অনুমোদনের তারিখ', v: function (m) { return dt(m.approved_at); } }], done)); return Promise.resolve(b); }],
      files: ['Files', function () { return api('/my/files').then(function (r) { var b = T('div', 'display:flex;flex-direction:column;gap:16px');
        var f = card('ফাইল পাঠান (সর্বোচ্চ ১০ MB)'); var fm = T('form', 'display:flex;gap:8px;flex-wrap:wrap;align-items:center'); var fi = T('input', IN + ';flex:1 1 240px;padding-top:9px'); fi.type = 'file'; fi.required = true; fi.setAttribute('aria-label', 'ফাইল'); var up = T('button', PRI, 'আপলোড'); up.type = 'submit'; fm.appendChild(fi); fm.appendChild(up); var m = T('div', 'font-size:14px;font-weight:600;color:#B91C1C;display:none'); m.setAttribute('role', 'alert'); f.appendChild(fm); f.appendChild(m);
        fm.addEventListener('submit', function (e) { e.preventDefault(); var fd = new FormData(); fd.append('file', fi.files[0]); up.disabled = true; fetch('/api/my/files', { method: 'POST', headers: { Accept: 'application/json', Authorization: 'Bearer ' + TOKEN }, body: fd }).then(function (x) { return x.json().then(function (j) { return { ok: x.ok, j: j }; }); }).then(function (x) { up.disabled = false; if (x.ok) go('files'); else { var k = x.j.errors && Object.keys(x.j.errors)[0]; m.textContent = k ? x.j.errors[k][0] : (x.j.message || 'আপলোড হয়নি'); m.style.display = 'block'; } }); });
        b.appendChild(f); b.appendChild(tbl([{ h: 'ফাইল', v: function (x) { return x.name; } }, { h: 'সাইজ', v: function (x) { return Math.round(x.size / 1024) + ' KB'; } }, { h: 'তারিখ', v: function (x) { return dt(x.created_at); } }, { h: 'ডাউনলোড', v: function (x) { var bt = T('button', BTN, 'ডাউনলোড'); bt.type = 'button'; bt.addEventListener('click', function () { blob('/my/files/' + x.id + '/download', x.name); }); return bt; } }], r.j || [])); return b; }); }],
      licenses: ['Products ও Licenses', function () { return api('/my/licenses').then(function (r) { return tbl([{ h: 'প্রোডাক্ট', v: function (x) { return x.product_name; } }, { h: 'লাইসেন্স কী', v: function (x) { return x.license_key; } }, { h: 'অবস্থা', v: function (x) { return x.status; }, s: 1 }, { h: 'মেয়াদ', v: function (x) { return dt(x.expires_on); } }], r.j || []); }); }],
      auto: ['Automation Status', function () { var c = card(); c.appendChild(empty('আপনার অ্যাকাউন্টে কোনো অটোমেশন সক্রিয় নেই।')); return Promise.resolve(c); }],
      profile: ['Profile', function () { var c = card('প্রোফাইল'); var fm = T('form', 'display:flex;flex-direction:column;gap:12px;max-width:420px'); function fld(id, l, v, ro) { var w = T('div'); var lb = T('label', 'display:block;font-size:14px;font-weight:600;margin-bottom:4px', l); lb.htmlFor = id; var i = T('input', IN); i.id = id; i.value = v || ''; if (ro) { i.readOnly = true; i.style.background = '#F1F5F9'; } w.appendChild(lb); w.appendChild(i); fm.appendChild(w); return i; }
        var nm = fld('pf-n', 'নাম', user.name), co = fld('pf-c', 'প্রতিষ্ঠান', user.company); fld('pf-e', 'ইমেইল (বদলাতে সাপোর্টে লিখুন)', user.email, 1); fld('pf-p', 'ফোন', user.phone, 1);
        var m = T('div', 'font-size:14px;font-weight:600;display:none'); m.setAttribute('role', 'status'); var sv = T('button', PRI + ';align-self:flex-start', 'সংরক্ষণ করুন'); sv.type = 'submit'; fm.appendChild(sv); fm.appendChild(m);
        fm.addEventListener('submit', function (e) { e.preventDefault(); api('/me', { method: 'PATCH', body: { name: nm.value.trim(), company: co.value.trim() || null } }).then(function (r) { m.style.display = 'block'; m.style.color = r.ok ? '#166534' : '#B91C1C'; m.textContent = r.ok ? 'সংরক্ষিত হয়েছে।' : 'সংরক্ষণ হয়নি।'; }); });
        c.appendChild(fm); return Promise.resolve(c); }]
    };
    var NAV = { 'My Orders': 'orders', 'My Projects': 'projects', Milestones: 'milestones', Approvals: 'approvals', Files: 'files', 'Products ও Licenses': 'licenses', 'Automation Status': 'auto', Profile: 'profile' };
    function setActive(a) { Array.prototype.slice.call(document.querySelectorAll('a[data-pnav]')).forEach(function (x) { x.style.fontWeight = x === a ? '700' : ''; }); }
    var cur = null;
    function go(key, a) {
      var d = VIEWS[key]; h1.textContent = d[0]; if (sub) sub.style.display = 'none'; dash.forEach(function (x) { x.style.display = 'none'; }); view.style.display = 'flex'; view.textContent = 'লোড হচ্ছে…'; if (a) setActive(a);
      d[1]().then(function (n) { view.textContent = ''; view.appendChild(n); }).catch(function () { view.textContent = 'লোড করা যায়নি।'; });
    }
    function home(a) { h1.textContent = 'ওভারভিউ'; if (sub) sub.style.display = ''; view.style.display = 'none'; dash.forEach(function (x) { x.style.display = ''; }); setActive(a); }
    Array.prototype.slice.call(document.querySelectorAll('a')).forEach(function (a) {
      var t = norm(a.textContent);
      if (NAV[t]) { a.setAttribute('data-pnav', '1'); a.removeAttribute('aria-disabled'); a.removeAttribute('title'); a.style.opacity = '1'; a.href = '#' + NAV[t]; a.addEventListener('click', function (e) { e.preventDefault(); go(NAV[t], a); }); }
      else if (t === 'ওভারভিউ' || t === 'Overview') { a.setAttribute('data-pnav', '1'); a.addEventListener('click', function (e) { e.preventDefault(); home(a); }); }
    });
    if (NAV[location.hash.slice(1)] === undefined) { var k = Object.keys(NAV).filter(function (x) { return NAV[x] === location.hash.slice(1); })[0]; if (k) go(NAV[k]); }
  }

  /* ---------------------------- PORTAL: live chat ---------------------------- */
  function chatWidget(user) {
    function T(tag, css, text) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; }
    var INP = 'width:100%;box-sizing:border-box;height:44px;border:1px solid #CBD5E1;border-radius:12px;padding:0 12px;font-size:14px;font-family:inherit';
    var PRI = 'background:#FF7900;color:#26272B;border:0;border-radius:12px;min-height:44px;padding:0 16px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit';
    var open = false, timer = null, lastId = 0, conv = null;
    var fab = T('button', PRI + ';position:fixed;right:20px;bottom:20px;z-index:50;box-shadow:0 4px 16px rgba(0,0,0,.18)', 'লাইভ চ্যাট'); fab.type = 'button'; fab.setAttribute('aria-expanded', 'false');
    var panel = T('div', 'position:fixed;right:20px;bottom:76px;z-index:50;width:min(360px,calc(100vw - 32px));max-height:min(520px,calc(100vh - 110px));background:#fff;border:1px solid #E2E8F0;border-radius:16px;box-shadow:0 8px 28px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden');
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'লাইভ চ্যাট');
    var head = T('div', 'background:#26272B;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;gap:8px');
    head.appendChild(T('div', 'font-weight:700;font-size:15px', 'ModinaLink লাইভ চ্যাট'));
    var endBtn = T('button', 'background:transparent;color:#fff;border:1px solid #62656D;border-radius:8px;min-height:36px;padding:0 10px;font-size:14px;cursor:pointer;font-family:inherit;display:none', 'চ্যাট শেষ'); endBtn.type = 'button'; head.appendChild(endBtn);
    var body = T('div', 'padding:14px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:8px;min-height:120px');
    var foot = T('form', 'display:none;gap:8px;padding:10px;border-top:1px solid #E2E8F0');
    var msgIn = T('input', INP + ';flex:1'); msgIn.type = 'text'; msgIn.placeholder = 'আপনার বার্তা লিখুন…'; msgIn.setAttribute('aria-label', 'বার্তা'); msgIn.maxLength = 2000;
    var sendB = T('button', PRI, 'পাঠান'); sendB.type = 'submit'; foot.appendChild(msgIn); foot.appendChild(sendB);
    panel.appendChild(head); panel.appendChild(body); panel.appendChild(foot);
    document.body.appendChild(panel); document.body.appendChild(fab);

    function bubble(m) {
      var mine = !m.from_staff; var b = T('div', 'max-width:85%;padding:8px 12px;border-radius:12px;font-size:14px;line-height:1.5;word-break:break-word;' + (mine ? 'align-self:flex-end;background:#FF7900;color:#26272B' : 'align-self:flex-start;background:#F1F5F9;color:#0F172A'), m.body);
      b.appendChild(T('div', 'font-size:14px;opacity:.7;margin-top:2px', (mine ? 'আপনি' : 'ModinaLink টিম') + ' · ' + dtt(m.created_at))); b.setAttribute('data-id', m.id); return b;
    }
    function startForm() {
      body.textContent = ''; foot.style.display = 'none'; endBtn.style.display = 'none';
      body.appendChild(T('div', 'font-size:14px;line-height:1.6;color:#475569', 'চ্যাট শুরু করতে আপনার মোবাইল নম্বর ও ইমেইল দিন। আমাদের টিম এখানেই উত্তর দেবে।'));
      var f = T('form', 'display:flex;flex-direction:column;gap:10px');
      function field(id, label, type, val, ph) { var w = T('div'); var l = T('label', 'display:block;font-size:14px;font-weight:600;margin-bottom:4px', label); l.htmlFor = id; var i = T('input', INP); i.id = id; i.type = type; i.value = val || ''; i.required = true; if (ph) i.placeholder = ph; w.appendChild(l); w.appendChild(i); f.appendChild(w); return i; }
      var ph = field('mlc-phone', 'মোবাইল নম্বর *', 'tel', user.phone, '01XXXXXXXXX'), em = field('mlc-email', 'ইমেইল *', 'email', user.email, 'name@example.com');
      var err = T('div', 'font-size:14px;color:#B91C1C;font-weight:600;display:none'); err.setAttribute('role', 'alert'); f.appendChild(err);
      var go = T('button', PRI, 'চ্যাট শুরু করুন'); go.type = 'submit'; f.appendChild(go); body.appendChild(f);
      f.addEventListener('submit', function (e) {
        e.preventDefault(); err.style.display = 'none'; go.disabled = true;
        api('/chat/start', { method: 'POST', body: { phone: ph.value.trim(), email: em.value.trim() } }).then(function (r) {
          go.disabled = false;
          if (r.ok) { conv = r.j.conversation; lastId = 0; chatView(r.j.messages); }
          else { var j = r.j || {}, k = j.errors && Object.keys(j.errors)[0]; err.textContent = k ? j.errors[k][0] : (j.message || 'শুরু করা যায়নি।'); err.style.display = 'block'; }
        });
      });
    }
    function chatView(msgs) {
      body.textContent = ''; foot.style.display = 'flex'; endBtn.style.display = 'inline-block';
      body.appendChild(T('div', 'font-size:14px;color:#475569;text-align:center', 'আপনার নম্বর: ' + conv.phone + ' · ইমেইল: ' + conv.email));
      add(msgs); msgIn.focus(); poll();
    }
    function add(msgs) {
      var atBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 60;
      (msgs || []).forEach(function (m) { if (m.id > lastId) { lastId = m.id; body.appendChild(bubble(m)); } });
      if (atBottom) body.scrollTop = body.scrollHeight;
    }
    function poll() {
      clearInterval(timer);
      timer = setInterval(function () {
        if (!open || !conv) return;
        api('/chat?after_id=' + lastId).then(function (r) {
          if (!r.j.conversation) { conv = null; startForm(); return; }
          add(r.j.messages);
        }).catch(function () {});
      }, 3000);
    }
    function load() {
      body.textContent = 'লোড হচ্ছে…';
      api('/chat').then(function (r) { if (r.j.conversation) { conv = r.j.conversation; lastId = 0; chatView(r.j.messages); } else { conv = null; startForm(); } });
    }
    fab.addEventListener('click', function () {
      open = !open; panel.style.display = open ? 'flex' : 'none'; fab.setAttribute('aria-expanded', open ? 'true' : 'false'); fab.textContent = open ? 'বন্ধ করুন' : 'লাইভ চ্যাট';
      if (open) load(); else clearInterval(timer);
    });
    foot.addEventListener('submit', function (e) {
      e.preventDefault(); var t = msgIn.value.trim(); if (!t) return; sendB.disabled = true;
      api('/chat/messages', { method: 'POST', body: { body: t } }).then(function (r) { sendB.disabled = false; if (r.ok) { msgIn.value = ''; add([r.j]); } });
    });
    endBtn.addEventListener('click', function () { api('/chat/close', { method: 'POST' }).then(function () { conv = null; startForm(); }); });
  }

  /* ------------------------------- ADMIN ------------------------------ */
  function admin() {
    nav({ 'ড্যাশবোর্ড': '/admin', Dashboard: '/admin', Invoices: '/admin/invoices', Payments: '/admin/payments', Settings: '/admin/integrations', 'Support Tickets': '#board', Inquiries: '#list' });
    logoutLink();
    Promise.all([api('/me'), api('/admin/tickets'), api('/admin/leads'), api('/admin/invoices'), api('/admin/subscriptions'), api('/admin/audit'), api('/admin/r/quotes'), api('/admin/r/projects'), api('/admin/r/milestones'), api('/admin/r/automation_runs')]).then(function (r) {
      var user = (r[0].j && r[0].j.user) || {};
      if (user.role === 'customer') { location.replace('/portal'); return; }
      var tickets = rows(r[1]), leads = rows(r[2]), invs = rows(r[3]), subs = rows(r[4]);

      var who = leaf('span', '[অ্যাডমিনের নাম] · Owner'); if (who) who.textContent = (user.name || '') + ' · ' + (user.role === 'admin' ? 'Owner' : 'Staff');
      var sub = byText('div', 'অপারেশনস ওভারভিউ', true); if (sub) sub.textContent = 'অপারেশনস ওভারভিউ · আসল ডেটা; সব সংখ্যা আসল রেকর্ড থেকে';

      function tile(label, val, href) {
        var l = all('a[href="#list"] div').filter(function (d) { return norm(d.textContent).replace(/^\s*/, '').slice(-label.length) === label && d.children.length <= 1; })[0];
        if (!l) return; var a = l.closest('a'); var v = a.children[1]; v.textContent = val;
        if (href) a.setAttribute('href', href);
      }
      tile('Pending inquiry', String(leads.filter(function (l) { return l.status === 'new'; }).length), '#list');
      tile('Open ticket', String(tickets.filter(function (t) { return t.status !== 'closed' && t.status !== 'rejected'; }).length), '#board');
      tile('Payment due', String(invs.filter(function (i) { return i.status === 'issued'; }).length), '/admin/invoices');
      var arr = function (x) { return Array.isArray(x.j) ? x.j : []; };
      tile('Quote awaiting response', String(arr(r[6]).filter(function (q) { return q.status === 'sent'; }).length), '#quotes');
      tile('Active project', String(arr(r[7]).filter(function (q) { return q.status === 'in_progress'; }).length), '#projects');
      tile('Overdue milestone', String(arr(r[8]).filter(function (m) { return m.status !== 'completed' && m.due_date && new Date(m.due_date).getTime() < Date.now(); }).length), '#milestones');
      tile('Failed automation', String(arr(r[9]).filter(function (a) { return a.status === 'failed'; }).length), '#automation-runs');
      var soonDate = Date.now() + 30 * 864e5;
      tile('Renewal due', String(subs.filter(function (s) { return s.status === 'active' && new Date(s.renews_on).getTime() <= soonDate; }).length), '/admin/payments');

      /* release board */
      var bt = byText('div', 'টিকেট থেকে রিলিজ বোর্ড'); if (bt) { var bwrap = bt.parentNode.parentNode; bwrap.id = 'board'; }
      var cols = { 'নতুন টিকেট': ['submitted'], 'স্কোপ যাচাই': ['scope_review', 'needs_info'], 'AI খসড়া (Staging)': ['drafting'], 'স্টাফ অনুমোদন': ['staging_ready'], 'ডিপ্লয় (Production)': ['approved', 'deployed'] };
      Object.keys(cols).forEach(function (name) {
        var h = leaf('div', name); if (!h) return; var col = h.parentNode; var tpl = h.nextElementSibling; if (!tpl) return;
        all(':scope > div', col).slice(1).forEach(function (x) { x.remove(); });
        var mine = tickets.filter(function (t) { return cols[name].indexOf(t.status) >= 0; }).slice(0, 5);
        if (!mine.length) { var e = document.createElement('div'); e.style.cssText = 'font-size:14px;color:#475569;padding:6px 2px'; e.textContent = 'কোনো টিকেট নেই'; col.appendChild(e); }
        mine.forEach(function (t) {
          var c = document.createElement('a'); c.href = '/admin/tickets/' + t.id; c.style.cssText = tpl.getAttribute('style') + ';display:block;color:inherit;text-decoration:none';
          var n = document.createElement('div'); n.style.fontWeight = '700'; n.textContent = t.number;
          var s = document.createElement('div'); s.style.cssText = 'font-size:14px;color:#475569;margin-top:2px'; s.textContent = (t.user && (t.user.company || t.user.name) || '') + ' · ' + t.title + ' · ' + t.status;
          c.appendChild(n); c.appendChild(s); col.appendChild(c);
        });
      });

      /* inquiries */
      var head = leaf('div', 'রেফারেন্স');
      var si = document.getElementById('s1');
      if (head) {
        var grid = head.parentNode; var cells = all(':scope > div', grid); var tpl = cells.slice(5, 10);
        var tplA = tpl[0].querySelector('a');
        cells.slice(5).forEach(function (c) { c.remove(); });
        var draw = function (q) {
          all(':scope > div', grid).slice(5).forEach(function (c) { c.remove(); });
          var list = leads.filter(function (l) { return !q || (l.name + ' ' + (l.company || '') + ' ' + (l.interest || '') + ' INQ-' + l.id).toLowerCase().indexOf(q.toLowerCase()) >= 0; });
          if (!list.length) { var e = document.createElement('div'); e.style.cssText = 'grid-column:1/-1;padding:16px 12px;color:#475569'; e.textContent = q ? 'কিছু পাওয়া যায়নি।' : 'এখনো কোনো ইনকোয়ারি নেই।'; grid.appendChild(e); }
          list.slice(0, 20).forEach(function (l) {
            var c = tpl.map(function (t) { return t.cloneNode(true); });
            var a = c[0].querySelector('a'); a.textContent = 'INQ-' + l.id; a.setAttribute('href', '#list'); a.title = [l.phone, l.email].filter(Boolean).join(' · ');
            c[1].textContent = (l.name || '') + (l.company ? ' (' + l.company + ')' : '') + ' · ' + (l.interest || 'সাধারণ ইনকোয়ারি');
            setStatus(c[2], l.status); c[3].textContent = '—'; c[4].textContent = dt(l.updated_at || l.created_at);
            c.forEach(function (x) { grid.appendChild(x); });
          });
          var pg = byText('span', 'পৃষ্ঠা ১ / [N]'); if (pg) { pg.textContent = 'মোট ' + list.length + 'টি'; var ctl = pg.nextElementSibling; if (ctl) ctl.style.display = 'none'; }
        };
        draw('');
        if (si) si.addEventListener('input', function () { draw(si.value.trim()); });
      }
      all('span').forEach(function (s) { var t = norm(s.textContent); if (s.children.length === 0 && (t === 'স্ট্যাটাস: সব' || t === 'অ্যাসাইনি: সব')) { s.style.opacity = '.6'; s.title = 'ফিল্টার শীঘ্রই'; } });

      /* automation */
      var au = leaf('div', 'AI Automation অপারেশনস');
      if (au) { var ac = au.parentNode; all(':scope > div', ac).slice(2).forEach(function (x) { x.remove(); }); var n = document.createElement('div'); n.style.cssText = 'font-size:14px;color:#475569;line-height:1.7;margin-top:8px'; var runs = arr(r[9]).slice(0, 4); if (!runs.length) { n.textContent = 'এখনো কোনো অটোমেশন রান নেই।'; ac.appendChild(n); } runs.forEach(function (x) { var row = document.createElement('div'); row.style.cssText = 'display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #F1F5F9;font-size:14px'; var a1 = document.createElement('span'); a1.textContent = x.name; var a2 = document.createElement('span'); a2.style.fontWeight = '600'; a2.textContent = x.status; row.appendChild(a1); row.appendChild(a2); ac.appendChild(row); }); }

      /* audit */
      var at = leaf('div', 'অডিট লগ');
      if (at) {
        var ac2 = at.parentNode; var kids = all(':scope > div', ac2); var rt = kids[2]; kids.slice(2).forEach(function (x) { x.remove(); });
        if (r[5].status === 403) { var n2 = document.createElement('div'); n2.style.cssText = 'font-size:14px;color:#475569;margin-top:8px'; n2.textContent = 'অডিট লগ শুধু অ্যাডমিন দেখতে পান।'; ac2.appendChild(n2); }
        else {
          var al = rows(r[5]).slice(0, 8);
          if (!al.length) { var n3 = document.createElement('div'); n3.style.cssText = 'font-size:14px;color:#475569;margin-top:8px'; n3.textContent = 'এখনো কোনো রেকর্ড নেই।'; ac2.appendChild(n3); }
          al.forEach(function (a) { var row = rt.cloneNode(true); var sp = row.querySelectorAll('span'); sp[0].textContent = a.action + (a.subject_type ? ' · ' + a.subject_type + (a.subject_id ? ' #' + a.subject_id : '') : ''); sp[1].textContent = (a.actor_id ? 'ব্যবহারকারী #' + a.actor_id : 'সিস্টেম') + ' · ' + dtt(a.created_at); ac2.appendChild(row); });
        }
      }
      adminViews(user);
    }).catch(function () {});
  }

  /* ---------------------- ADMIN: working sections ---------------------- */
  function adminViews(user) {
    var h1 = document.querySelector('h1'); if (!h1) return;
    var header = h1.parentNode.parentNode, col = header.parentNode;
    var dash = all(':scope > *', col).filter(function (x) { return x !== header; });
    var view = document.createElement('div'); view.style.cssText = 'display:none;flex-direction:column;gap:16px'; col.appendChild(view);
    var CARD = 'background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;padding:24px;overflow-x:auto';
    var BTN = 'border:1px solid #CBD5E1;border-radius:10px;padding:0 12px;min-height:36px;font-size:14px;font-weight:600;background:#fff;color:#0F172A;cursor:pointer;font-family:inherit';
    function T(tag, css, text) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; }
    function table(cols, data, actions) {
      var card = T('div', CARD);
      if (!data.length) { card.appendChild(T('div', 'font-size:14px;color:#475569', 'কোনো রেকর্ড নেই।')); return card; }
      var g = T('div', 'display:grid;grid-template-columns:repeat(' + (cols.length + (actions ? 1 : 0)) + ',minmax(110px,1fr));font-size:14px;min-width:' + ((cols.length + 1) * 120) + 'px');
      cols.concat(actions ? [{ h: 'কাজ' }] : []).forEach(function (c) { g.appendChild(T('div', 'padding:10px 12px;font-weight:700;color:#475569;border-bottom:1px solid #E2E8F0', c.h)); });
      data.forEach(function (row) {
        cols.forEach(function (c) { var v = c.v(row); var cell = T('div', 'padding:12px;border-bottom:1px solid #F1F5F9;word-break:break-word'); if (c.s) { cell.appendChild(T('span', 'display:inline-flex;gap:6px;align-items:center;font-weight:600')); cell.firstChild.appendChild(T('span', 'width:8px;height:8px;border-radius:999px;background:' + (DOT[v] || '#94A3B8'))); cell.firstChild.appendChild(document.createTextNode(v)); } else cell.textContent = v; g.appendChild(cell); });
        if (actions) { var ac = T('div', 'padding:8px 12px;border-bottom:1px solid #F1F5F9;display:flex;gap:6px;flex-wrap:wrap'); actions(row, ac); g.appendChild(ac); }
      });
      card.appendChild(g); return card;
    }
    function btn(label, fn) { var b = T('button', BTN, label); b.type = 'button'; b.addEventListener('click', function () { b.disabled = true; fn(b); }); return b; }
    function msg(t, ok) { var m = T('div', 'font-size:14px;font-weight:600;color:' + (ok ? '#166534' : '#B91C1C'), t); m.setAttribute('role', 'status'); return m; }
    function act(path, body, method, label, reload) {
      return api(path, { method: method || 'POST', body: body }).then(function (r) {
        if (r.ok) { show(reload); } else { var j = r.j || {}; var k = j.errors && Object.keys(j.errors)[0]; alert_(k ? j.errors[k][0] : (j.message || 'হয়নি')); }
      });
    }
    function alert_(t) { var old = view.querySelector('[data-err]'); if (old) old.remove(); var m = msg(t, false); m.setAttribute('data-err', '1'); view.insertBefore(m, view.firstChild.nextSibling); }
    function fmtU(r) { return r.user ? (r.user.company || r.user.name) : '—'; }

    var V = {
      customers: { t: 'Customers', load: function () { return api('/admin/users').then(function (r) { return table([{ h: 'নাম', v: function (u) { return u.name; } }, { h: 'ইমেইল', v: function (u) { return u.email || '—'; } }, { h: 'ফোন', v: function (u) { return u.phone || '—'; } }, { h: 'প্রতিষ্ঠান', v: function (u) { return u.company || '—'; } }, { h: 'ভূমিকা', v: function (u) { return u.role; } }, { h: 'যোগ দেন', v: function (u) { return dt(u.created_at); } }], rows(r)); }); } },
      invoices: { t: 'Invoices', load: function () { return api('/admin/invoices').then(function (r) { return table([{ h: 'ইনভয়েস', v: function (i) { return i.number; } }, { h: 'গ্রাহক', v: fmtU }, { h: 'পরিমাণ', v: function (i) { return bdt(i.total_bdt); } }, { h: 'অবস্থা', v: function (i) { return i.status; }, s: 1 }, { h: 'শেষ তারিখ', v: function (i) { return dt(i.due_date); } }], rows(r), function (i, c) {
        if (i.status === 'draft') c.appendChild(btn('ইস্যু করুন', function () { act('/admin/invoices/' + i.id + '/issue', null, 'POST', '', 'invoices'); }));
        if (i.status === 'draft' || i.status === 'issued') c.appendChild(btn('বাতিল', function () { act('/admin/invoices/' + i.id + '/void', null, 'POST', '', 'invoices'); }));
      }); }); } },
      payments: { t: 'Payments', load: function () { return api('/admin/payments').then(function (r) { return table([{ h: 'ইনভয়েস', v: function (p) { return p.invoice ? p.invoice.number : '—'; } }, { h: 'গ্রাহক', v: function (p) { return p.user ? p.user.name : '—'; } }, { h: 'মাধ্যম', v: function (p) { return p.gateway; } }, { h: 'পরিমাণ', v: function (p) { return bdt(p.amount_bdt); } }, { h: 'রেফারেন্স', v: function (p) { return p.proof_reference || p.gateway_txn_id || '—'; } }, { h: 'অবস্থা', v: function (p) { return p.status; }, s: 1 }], rows(r), function (p, c) {
        if (p.status === 'review' || p.status === 'pending') { c.appendChild(btn('যাচাই (paid)', function () { act('/admin/payments/' + p.id + '/verify', null, 'POST', '', 'payments'); })); c.appendChild(btn('বাতিল', function () { act('/admin/payments/' + p.id + '/reject', null, 'POST', '', 'payments'); })); }
      }); }); } },
      renewals: { t: 'Renewals', load: function () { return api('/admin/subscriptions').then(function (r) { return table([{ h: 'সার্ভিস', v: function (s_) { return s_.name; } }, { h: 'গ্রাহক', v: function (s_) { return s_.user ? s_.user.name : '—'; } }, { h: 'রিনিউয়াল', v: function (s_) { return dt(s_.renews_on); } }, { h: 'পরিমাণ', v: function (s_) { return bdt(s_.amount_bdt); } }, { h: 'অবস্থা', v: function (s_) { return s_.status; }, s: 1 }], rows(r)); }); } },
      tickets: { t: 'Support Tickets', load: function () { return api('/admin/tickets').then(function (r) { return table([{ h: 'টিকেট', v: function (t) { return t.number; } }, { h: 'গ্রাহক', v: fmtU }, { h: 'বিষয়', v: function (t) { return t.title; } }, { h: 'ধরন', v: function (t) { return t.type; } }, { h: 'অবস্থা', v: function (t) { return t.status; }, s: 1 }, { h: 'হালনাগাদ', v: function (t) { return dt(t.updated_at); } }], rows(r), function (t, c) { var a = T('a', BTN + ';display:inline-flex;align-items:center;text-decoration:none', 'খুলুন'); a.href = '/admin/tickets/' + t.id; c.appendChild(a); }); }); } },
      inquiries: { t: 'Inquiries', load: function () { return api('/admin/leads').then(function (r) { return table([{ h: 'নাম', v: function (l) { return l.name; } }, { h: 'যোগাযোগ', v: function (l) { return [l.phone, l.email].filter(Boolean).join(' · ') || '—'; } }, { h: 'আগ্রহ', v: function (l) { return l.interest || '—'; } }, { h: 'বার্তা', v: function (l) { return l.message || '—'; } }, { h: 'অবস্থা', v: function (l) { return l.status; }, s: 1 }, { h: 'তারিখ', v: function (l) { return dt(l.created_at); } }], rows(r), function (l, c) {
        ['contacted', 'won', 'lost'].forEach(function (st) { if (l.status !== st) c.appendChild(btn(st, function () { act('/admin/leads/' + l.id, { status: st }, 'PATCH', '', 'inquiries'); })); });
      }); }); } },

      chat: { t: 'Live Chat', load: function () {
        var wrap = T('div', 'display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start');
        var list = T('div', CARD + ';flex:1 1 260px;max-width:340px;display:flex;flex-direction:column;gap:8px;padding:16px');
        var pane = T('div', CARD + ';flex:2 1 360px;display:flex;flex-direction:column;gap:10px;min-height:360px');
        wrap.appendChild(list); wrap.appendChild(pane);
        var cur = null, last = 0;
        function drawList() {
          api('/admin/chat').then(function (r) {
            list.textContent = ''; list.appendChild(T('div', 'font-size:15px;font-weight:700', 'চ্যাট তালিকা'));
            var data = Array.isArray(r.j) ? r.j : [];
            if (!data.length) list.appendChild(T('div', 'font-size:14px;color:#475569', 'এখনো কোনো চ্যাট নেই।'));
            data.forEach(function (c) {
              var b = T('button', 'text-align:left;border:1px solid ' + (cur === c.id ? '#FF7900' : '#E2E8F0') + ';border-radius:12px;padding:10px 12px;background:#fff;cursor:pointer;font-family:inherit;min-height:44px');
              b.type = 'button'; b.appendChild(T('div', 'font-weight:700;font-size:14px', (c.user ? (c.user.company || c.user.name) : 'গ্রাহক') + (c.status === 'closed' ? ' (শেষ)' : '')));
              b.appendChild(T('div', 'font-size:14px;color:#475569', c.phone + ' · ' + dtt(c.last_message_at)));
              b.addEventListener('click', function () { openConv(c.id); }); list.appendChild(b);
            });
          });
        }
        function openConv(id) {
          cur = id; last = 0; pane.textContent = 'লোড হচ্ছে…';
          api('/admin/chat/' + id).then(function (r) {
            var c = r.j.conversation; pane.textContent = '';
            pane.appendChild(T('div', 'font-size:16px;font-weight:700', (c.user ? c.user.name : '') + (c.user && c.user.company ? ' · ' + c.user.company : '')));
            pane.appendChild(T('div', 'font-size:14px;color:#475569', 'ফোন: ' + c.phone + ' · ইমেইল: ' + c.email));
            var box = T('div', 'flex:1;min-height:220px;max-height:420px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;border:1px solid #F1F5F9;border-radius:12px;padding:12px'); pane.appendChild(box);
            function add(ms) { (ms || []).forEach(function (m) { if (m.id > last) { last = m.id; var b = T('div', 'max-width:80%;padding:8px 12px;border-radius:12px;font-size:14px;word-break:break-word;' + (m.from_staff ? 'align-self:flex-end;background:#26272B;color:#fff' : 'align-self:flex-start;background:#F1F5F9'), m.body); b.appendChild(T('div', 'font-size:14px;opacity:.7;margin-top:2px', (m.from_staff ? 'টিম' : 'গ্রাহক') + ' · ' + dtt(m.created_at))); box.appendChild(b); } }); box.scrollTop = box.scrollHeight; }
            add(r.j.messages);
            if (c.status === 'open') {
              var f = T('form', 'display:flex;gap:8px'); var i = T('input', 'flex:1;height:44px;border:1px solid #CBD5E1;border-radius:12px;padding:0 12px;font-size:14px;font-family:inherit'); i.type = 'text'; i.placeholder = 'উত্তর লিখুন…'; i.setAttribute('aria-label', 'উত্তর');
              var sb = T('button', BTN + ';min-height:44px', 'পাঠান'); sb.type = 'submit'; f.appendChild(i); f.appendChild(sb);
              f.addEventListener('submit', function (e) { e.preventDefault(); var t = i.value.trim(); if (!t) return; api('/admin/chat/' + id + '/messages', { method: 'POST', body: { body: t } }).then(function (x) { sb.disabled = false; if (x.ok) { i.value = ''; add([x.j]); } }); });
              pane.appendChild(f);
              var cl = btn('চ্যাট শেষ করুন', function () { api('/admin/chat/' + id + '/close', { method: 'POST' }).then(function () { drawList(); openConv(id); }); }); cl.style.alignSelf = 'flex-start'; pane.appendChild(cl);
            } else pane.appendChild(T('div', 'font-size:14px;color:#475569', 'এই চ্যাট শেষ হয়েছে।'));
          });
        }
        drawList();
        view._timer = setInterval(function () {
          drawList();
          if (cur) api('/admin/chat/' + cur + '?after_id=' + last).then(function (r) { var ms = r.j.messages || []; if (ms.length) openConv(cur); }).catch(function () {});
        }, 5000);
        return Promise.resolve(wrap).then(function (n) { return n; });
      } },
      services: { t: 'Services ও Price List', load: function () { return fetch('/api/prices', { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); }).then(function (j) { var it = (j && j.items) || []; var cols = it[0] ? Object.keys(it[0]).filter(function (k) { return !/^(id|created_at|updated_at|sort|is_active)$/.test(k); }).slice(0, 6) : []; return table(cols.map(function (k) { return { h: k, v: function (x) { var v = x[k]; return v == null ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v); } }; }), it); }); } }
    };

    function lookups() {
      return Promise.all([api('/admin/users'), api('/admin/r/projects'), api('/admin/r/products'), api('/admin/r/quotes'), api('/admin/r/orders')]).then(function (r) {
        return {
          users: rows(r[0]).map(function (u) { return { v: u.id, l: u.name + (u.company ? ' · ' + u.company : '') }; }),
          projects: (r[1].j || []).map(function (x) { return { v: x.id, l: x.name }; }),
          products: (r[2].j || []).map(function (x) { return { v: x.id, l: x.name }; }),
          quotes: (r[3].j || []).map(function (x) { return { v: x.id, l: '#' + x.id + ' ' + x.title }; }),
          orders: (r[4].j || []).map(function (x) { return { v: x.id, l: '#' + x.id + ' ' + x.title }; })
        };
      });
    }
    var IN = 'width:100%;box-sizing:border-box;min-height:44px;border:1px solid #CBD5E1;border-radius:12px;padding:0 12px;font-size:14px;font-family:inherit;background:#fff';
    function formCard(title, fields, lk, onSubmit) {
      var card = T('form', CARD + ';display:flex;flex-direction:column;gap:12px'); card.appendChild(T('div', 'font-size:16px;font-weight:700', title));
      var grid = T('div', 'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px'); card.appendChild(grid); var ctl = {};
      fields.forEach(function (f, n) {
        var w = T('div'); var id = 'f-' + title.replace(/\W/g, '') + n; var l = T('label', 'display:block;font-size:14px;font-weight:600;margin-bottom:4px', f.l + (f.req ? ' *' : '')); l.htmlFor = id; w.appendChild(l);
        var i;
        if (f.lk || f.o) { i = T('select', IN); var o0 = T('option', null, f.req ? 'বাছাই করুন' : '— নেই —'); o0.value = ''; i.appendChild(o0); (f.lk ? lk[f.lk] : f.o.map(function (x) { return { v: x, l: x }; })).forEach(function (o) { var op = T('option', null, o.l); op.value = o.v; i.appendChild(op); }); }
        else if (f.t === 'textarea') { i = T('textarea', IN + ';min-height:88px;padding:10px 12px'); }
        else { i = T('input', IN); i.type = f.t || 'text'; }
        i.id = id; if (f.req) i.required = true; ctl[f.k] = i; w.appendChild(i); grid.appendChild(w);
      });
      var err = T('div', 'font-size:14px;font-weight:600;color:#B91C1C;display:none'); err.setAttribute('role', 'alert'); card.appendChild(err);
      var go = T('button', 'background:#FF7900;color:#26272B;border:0;border-radius:12px;min-height:44px;padding:0 18px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;align-self:flex-start', 'সংরক্ষণ করুন'); go.type = 'submit'; card.appendChild(go);
      card.addEventListener('submit', function (e) {
        e.preventDefault(); err.style.display = 'none'; var body = {};
        fields.forEach(function (f) { var v = ctl[f.k].value; if (v !== '') body[f.k] = (f.t === 'number' || f.lk) ? Number(v) : v; });
        go.disabled = true; onSubmit(body).then(function (r) { go.disabled = false; if (!r.ok) { var j = r.j || {}, k = j.errors && Object.keys(j.errors)[0]; err.textContent = k ? j.errors[k][0] : (j.message || 'হয়নি'); err.style.display = 'block'; } });
      });
      return card;
    }
    function resView(res, title, cols, fields, statuses, reloadKey) {
      return { t: title, load: function () {
        return Promise.all([api('/admin/r/' + res), lookups()]).then(function (x) {
          var box = T('div', 'display:flex;flex-direction:column;gap:16px');
          box.appendChild(formCard('নতুন যোগ করুন', fields, x[1], function (body) { return api('/admin/r/' + res, { method: 'POST', body: body }).then(function (r) { if (r.ok) show(reloadKey || res); return r; }); }));
          box.appendChild(table(cols, x[0].j || [], statuses ? function (row, c) {
            var sel = T('select', IN + ';min-height:36px;font-size:14px;width:auto'); statuses.forEach(function (st) { var o = T('option', null, st); o.value = st; if (row.status === st) o.selected = true; sel.appendChild(o); });
            sel.setAttribute('aria-label', 'অবস্থা পরিবর্তন'); sel.addEventListener('change', function () { api('/admin/r/' + res + '/' + row.id, { method: 'PUT', body: { status: sel.value } }).then(function (r) { if (!r.ok) alert_('পরিবর্তন হয়নি'); else show(reloadKey || res); }); }); c.appendChild(sel);
          } : null));
          return box;
        });
      } };
    }
    function who(r) { return r.user_company || r.user_name || '—'; }
    function sCol(k) { return { h: 'অবস্থা', v: function (r) { return r[k || 'status']; }, s: 1 }; }
    function blob(path, name) { return fetch('/api' + path, { headers: { Authorization: 'Bearer ' + TOKEN } }).then(function (r) { return r.blob(); }).then(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }); }
    V.quotes = resView('quotes', 'Quotes',
      [{ h: '#', v: function (r) { return 'QUO-' + r.id; } }, { h: 'গ্রাহক', v: who }, { h: 'শিরোনাম', v: function (r) { return r.title; } }, { h: 'পরিমাণ', v: function (r) { return bdt(r.amount_bdt); } }, sCol(), { h: 'তারিখ', v: function (r) { return dt(r.updated_at); } }],
      [{ k: 'user_id', l: 'গ্রাহক', lk: 'users' }, { k: 'title', l: 'শিরোনাম', req: 1 }, { k: 'amount_bdt', l: 'পরিমাণ (৳)', t: 'number' }, { k: 'status', l: 'অবস্থা', o: ['draft', 'sent', 'accepted', 'declined'] }, { k: 'notes', l: 'নোট', t: 'textarea' }], ['draft', 'sent', 'accepted', 'declined']);
    V.orders = resView('orders', 'Orders',
      [{ h: '#', v: function (r) { return 'ORD-' + r.id; } }, { h: 'গ্রাহক', v: who }, { h: 'কাজ', v: function (r) { return r.title; } }, { h: 'পরিমাণ', v: function (r) { return bdt(r.amount_bdt); } }, sCol()],
      [{ k: 'user_id', l: 'গ্রাহক', lk: 'users', req: 1 }, { k: 'quote_id', l: 'কোটেশন (গৃহীত)', lk: 'quotes' }, { k: 'title', l: 'কাজ', req: 1 }, { k: 'amount_bdt', l: 'পরিমাণ (৳)', t: 'number' }], ['new', 'in_progress', 'delivered', 'cancelled']);
    V.projects = resView('projects', 'Projects',
      [{ h: '#', v: function (r) { return 'PRJ-' + r.id; } }, { h: 'গ্রাহক', v: who }, { h: 'প্রজেক্ট', v: function (r) { return r.name; } }, { h: 'অগ্রগতি', v: function (r) { return r.progress + '%'; } }, sCol()],
      [{ k: 'user_id', l: 'গ্রাহক', lk: 'users', req: 1 }, { k: 'order_id', l: 'অর্ডার', lk: 'orders' }, { k: 'name', l: 'প্রজেক্টের নাম', req: 1 }, { k: 'progress', l: 'অগ্রগতি (০–১০০)', t: 'number' }, { k: 'status', l: 'অবস্থা', o: ['planning', 'in_progress', 'on_hold', 'completed'] }], ['planning', 'in_progress', 'on_hold', 'completed']);
    V.milestones = resView('milestones', 'Milestones',
      [{ h: 'প্রজেক্ট', v: function (r) { return r.project_name || '—'; } }, { h: 'ধাপ', v: function (r) { return r.title; } }, { h: 'শেষ তারিখ', v: function (r) { return dt(r.due_date); } }, sCol(), { h: 'গ্রাহকের নোট', v: function (r) { return r.client_note || '—'; } }, { h: 'অনুমোদন', v: function (r) { return r.approved_at ? dt(r.approved_at) : '—'; } }],
      [{ k: 'project_id', l: 'প্রজেক্ট', lk: 'projects', req: 1 }, { k: 'title', l: 'ধাপের নাম', req: 1 }, { k: 'due_date', l: 'শেষ তারিখ', t: 'date' }, { k: 'sort', l: 'ক্রম', t: 'number' }, { k: 'status', l: 'অবস্থা', o: ['pending', 'in_progress', 'awaiting_client', 'completed'] }], ['pending', 'in_progress', 'awaiting_client', 'completed']);
    V.automation = resView('automation_runs', 'Automation Runs',
      [{ h: 'ওয়ার্কফ্লো', v: function (r) { return r.name; } }, sCol(), { h: 'রান', v: function (r) { return dtt(r.ran_at || r.created_at); } }, { h: 'লগ', v: function (r) { return r.log || '—'; } }],
      [{ k: 'name', l: 'ওয়ার্কফ্লো', req: 1 }, { k: 'status', l: 'অবস্থা', o: ['success', 'failed', 'waiting_approval'] }, { k: 'log', l: 'লগ / নোট', t: 'textarea' }], ['success', 'failed', 'waiting_approval']);
    V.content = resView('cms_pages', 'Content',
      [{ h: 'স্লাগ', v: function (r) { return r.slug; } }, { h: 'শিরোনাম', v: function (r) { return r.title; } }, sCol(), { h: 'হালনাগাদ', v: function (r) { return dt(r.updated_at); } }],
      [{ k: 'slug', l: 'স্লাগ (a-z, -)', req: 1 }, { k: 'title', l: 'শিরোনাম', req: 1 }, { k: 'body', l: 'বিষয়বস্তু', t: 'textarea' }, { k: 'status', l: 'অবস্থা', o: ['draft', 'published'] }], ['draft', 'published']);
    V.products = { t: 'Products ও Licenses', load: function () {
      var box = T('div', 'display:flex;flex-direction:column;gap:20px');
      var a = resView('products', '', [{ h: 'প্রোডাক্ট', v: function (r) { return r.name; } }, { h: 'মূল্য', v: function (r) { return r.price_bdt ? bdt(r.price_bdt) : '—'; } }, sCol()],
        [{ k: 'name', l: 'প্রোডাক্টের নাম', req: 1 }, { k: 'price_bdt', l: 'মূল্য (৳)', t: 'number' }, { k: 'status', l: 'অবস্থা', o: ['active', 'coming_soon', 'retired'] }, { k: 'description', l: 'বিবরণ', t: 'textarea' }], ['active', 'coming_soon', 'retired'], 'products');
      var b = resView('licenses', '', [{ h: 'প্রোডাক্ট', v: function (r) { return r.product_name || '—'; } }, { h: 'গ্রাহক', v: who }, { h: 'লাইসেন্স কী', v: function (r) { return r.license_key; } }, sCol(), { h: 'মেয়াদ', v: function (r) { return dt(r.expires_on); } }],
        [{ k: 'user_id', l: 'গ্রাহক', lk: 'users', req: 1 }, { k: 'product_id', l: 'প্রোডাক্ট', lk: 'products', req: 1 }, { k: 'expires_on', l: 'মেয়াদ', t: 'date' }, { k: 'status', l: 'অবস্থা', o: ['active', 'expired', 'revoked'] }], ['active', 'expired', 'revoked'], 'products');
      return Promise.all([a.load(), b.load()]).then(function (n) { box.appendChild(T('div', 'font-size:17px;font-weight:700', 'Products')); box.appendChild(n[0]); box.appendChild(T('div', 'font-size:17px;font-weight:700', 'Licenses (গ্রাহককে দেওয়া)')); box.appendChild(n[1]); return box; });
    } };
    V.files = { t: 'Files', load: function () {
      return Promise.all([api('/admin/files'), lookups()]).then(function (x) {
        var box = T('div', 'display:flex;flex-direction:column;gap:16px');
        var f = T('form', CARD + ';display:flex;flex-direction:column;gap:12px'); f.appendChild(T('div', 'font-size:16px;font-weight:700', 'গ্রাহকের জন্য ফাইল আপলোড (সর্বোচ্চ ১০ MB)'));
        var g = T('div', 'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px'); f.appendChild(g);
        function sel(id, label, list, req) { var w = T('div'); var l = T('label', 'display:block;font-size:14px;font-weight:600;margin-bottom:4px', label); l.htmlFor = id; var i = T('select', IN); i.id = id; var o0 = T('option', null, req ? 'বাছাই করুন' : '— নেই —'); o0.value = ''; i.appendChild(o0); list.forEach(function (o) { var op = T('option', null, o.l); op.value = o.v; i.appendChild(op); }); i.required = !!req; w.appendChild(l); w.appendChild(i); g.appendChild(w); return i; }
        var su = sel('fu', 'গ্রাহক *', x[1].users, 1), sp = sel('fp', 'প্রজেক্ট', x[1].projects, 0);
        var w = T('div'); var l = T('label', 'display:block;font-size:14px;font-weight:600;margin-bottom:4px', 'ফাইল *'); l.htmlFor = 'ff'; var fi = T('input', IN + ';padding-top:9px'); fi.type = 'file'; fi.id = 'ff'; fi.required = true; w.appendChild(l); w.appendChild(fi); g.appendChild(w);
        var err = T('div', 'font-size:14px;font-weight:600;color:#B91C1C;display:none'); err.setAttribute('role', 'alert'); f.appendChild(err);
        var go = T('button', 'background:#FF7900;color:#26272B;border:0;border-radius:12px;min-height:44px;padding:0 18px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;align-self:flex-start', 'আপলোড'); go.type = 'submit'; f.appendChild(go);
        f.addEventListener('submit', function (e) { e.preventDefault(); err.style.display = 'none'; var fd = new FormData(); fd.append('user_id', su.value); if (sp.value) fd.append('project_id', sp.value); fd.append('file', fi.files[0]); go.disabled = true;
          fetch('/api/admin/files', { method: 'POST', headers: { Accept: 'application/json', Authorization: 'Bearer ' + TOKEN }, body: fd }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); }).then(function (r) { go.disabled = false; if (r.ok) show('files'); else { var k = r.j.errors && Object.keys(r.j.errors)[0]; err.textContent = k ? r.j.errors[k][0] : (r.j.message || 'আপলোড হয়নি'); err.style.display = 'block'; } }); });
        box.appendChild(f);
        box.appendChild(table([{ h: 'ফাইল', v: function (r) { return r.name; } }, { h: 'গ্রাহক', v: function (r) { return r.user_name || '—'; } }, { h: 'সাইজ', v: function (r) { return Math.round(r.size / 1024) + ' KB'; } }, { h: 'তারিখ', v: function (r) { return dt(r.created_at); } }], x[0].j || [], function (r, c) { c.appendChild(btn('ডাউনলোড', function (b) { blob('/admin/files/' + r.id + '/download', r.name).then(function () { b.disabled = false; }); })); }));
        return box;
      });
    } };
    var MAP = { Customers: 'customers', Invoices: 'invoices', Payments: 'payments', Renewals: 'renewals', 'Support Tickets': 'tickets', Inquiries: 'inquiries', 'Live Chat': 'chat', Services: 'services', Products: 'products', Quotes: 'quotes', Orders: 'orders', Projects: 'projects', Milestones: 'milestones', 'Automation Runs': 'automation', Content: 'content' };
    var SOON = [];
    function setActive(a) { all('a').forEach(function (x) { if (x.getAttribute('data-nav')) x.style.fontWeight = x === a ? '700' : ''; }); }
    function show(key, a) {
      clearInterval(view._timer);
      var d = V[key]; h1.textContent = d ? d.t : key; setActive(a);
      dash.forEach(function (x) { x.style.display = 'none'; }); view.style.display = 'flex'; view.textContent = '';
      view.appendChild(T('div', 'font-size:14px;color:#475569', 'লোড হচ্ছে…'));
      if (!d) { view.textContent = ''; var c = T('div', CARD); c.appendChild(T('div', 'font-size:17px;font-weight:700', key)); c.appendChild(T('div', 'font-size:14px;color:#475569;line-height:1.7;margin-top:8px', 'এই মডিউলের ব্যাকএন্ড এখনো তৈরি হয়নি (পরের ধাপে আসছে)। তৈরি হলে এখানে আসল রেকর্ড, ফিল্টার ও কাজ থাকবে।')); view.appendChild(c); return; }
      d.load().then(function (node) { view.textContent = ''; view.appendChild(node); }).catch(function () { view.textContent = 'লোড করা যায়নি।'; });
    }
    function showDash(a) { clearInterval(view._timer); h1.textContent = 'ড্যাশবোর্ড'; setActive(a); view.style.display = 'none'; dash.forEach(function (x) { x.style.display = ''; }); }
    var cnNav = all('a').filter(function (a) { return norm(a.textContent) === 'Content'; })[0];
    if (cnNav) { var fl = cnNav.cloneNode(true); fl.textContent = 'Files'; fl.setAttribute('href', '#top'); cnNav.parentNode.insertBefore(fl, cnNav); }
    MAP.Files = 'files';
    var stNav = all('a').filter(function (a) { return norm(a.textContent) === 'Support Tickets'; })[0];
    if (stNav) { var lc = stNav.cloneNode(true); lc.textContent = 'Live Chat'; lc.setAttribute('href', '#top'); stNav.parentNode.insertBefore(lc, stNav.nextSibling); }
    all('a').forEach(function (a) {
      var t = norm(a.textContent);
      var key = MAP[t] || (SOON.indexOf(t) >= 0 ? t : null);
      if (a.getAttribute('href') !== '#top' && t !== 'Inquiries' && t !== 'Support Tickets' && t !== 'Invoices' && t !== 'Payments') return;
      if (key) { a.setAttribute('data-nav', '1'); a.removeAttribute('aria-disabled'); a.removeAttribute('title'); a.style.opacity = '1'; a.href = '#' + key.toLowerCase().replace(/\s+/g, '-'); a.addEventListener('click', function (e) { e.preventDefault(); show(MAP[t] || key, a); }); }
      else if (t === 'ড্যাশবোর্ড' || t === 'Dashboard') { a.setAttribute('data-nav', '1'); a.addEventListener('click', function (e) { e.preventDefault(); showDash(a); }); }
    });
    all('a[href="#list"]').forEach(function (a) { a.addEventListener('click', function () { }); });
    var tl = byText('div', 'ইনকোয়ারি ও কোটেশন'); 
  }

  function start() { if (isPortal) portal(); else admin(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
