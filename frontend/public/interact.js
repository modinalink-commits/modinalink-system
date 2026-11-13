/* ModinaLink: gives the public design pages their working controls
   (filters, request forms, subscribe, preferences, AI-agent launcher).
   Everything that has no backend yet is labelled Demo (নমুনা ডেটা). */
(function () {
  var path = location.pathname.replace(/\/+$/, '') || '/';
  function all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').replace(/\s+/g, ' ').trim(); }
  function leaf(t, sel) { return all(sel || 'span,div,a,button').filter(function (e) { return e.children.length === 0 && norm(e.textContent) === t; })[0]; }
  function T(tag, css, text) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; }
  function press(el, fn) {
    if (!el) return;
    el.style.cursor = 'pointer';
    if (!/^(A|BUTTON|INPUT)$/.test(el.tagName)) { el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); }
    el.addEventListener('click', function (e) { e.preventDefault(); fn(el, e); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(el, e); } });
  }
  function note(anchor, msg, ok) {
    var n = anchor.parentNode.querySelector('[data-ml-note]');
    if (!n) { n = T('div', 'margin-top:12px;font-size:14px;font-weight:600;line-height:1.6'); n.setAttribute('data-ml-note', '1'); n.setAttribute('role', 'status'); anchor.parentNode.insertBefore(n, anchor.nextSibling); }
    n.style.color = ok ? '#166534' : '#B91C1C'; n.textContent = msg;
  }
  function post(body) {
    return fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); });
  }
  function err(j) { if (j && j.errors) { var k = Object.keys(j.errors)[0]; if (k) return j.errors[k][0]; } return (j && j.message) || 'পাঠানো যায়নি, আবার চেষ্টা করুন।'; }
  var PILL = 'border:1px solid #CBD5E1;border-radius:12px;padding:0 14px;min-height:44px;display:inline-flex;align-items:center;font-size:14px;font-weight:600;background:#fff;color:#0F172A;font-family:inherit;cursor:pointer';
  var INP = 'width:100%;box-sizing:border-box;min-height:44px;border:1px solid #CBD5E1;border-radius:12px;padding:0 12px;font-size:14px;font-family:inherit;background:#fff';

  /* ---------- 1. AI agent launcher (every page) ---------- */
  var ai = leaf('AI এজেন্ট');
  if (ai) {
    var panel = T('div', 'position:fixed;right:16px;bottom:72px;z-index:60;width:min(340px,calc(100vw - 32px));background:#fff;border:1px solid #E2E8F0;border-radius:16px;box-shadow:0 8px 28px rgba(0,0,0,.18);padding:18px;display:none;flex-direction:column;gap:10px;font-size:14px;line-height:1.7');
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'AI এজেন্ট');
    panel.appendChild(T('div', 'font-weight:700;font-size:16px', 'AI এজেন্ট · Demo (নমুনা ডেটা)'));
    panel.appendChild(T('div', 'color:#475569', 'স্বয়ংক্রিয় AI উত্তর এখনো চালু হয়নি। এখনই মানুষের সাথে কথা বলতে চাইলে নিচের যেকোনোটি বেছে নিন।'));
    [['লগইন করে লাইভ চ্যাট', '/login'], ['কোটেশনের অনুরোধ', '/quote'], ['সহায়তা কেন্দ্র', '/help']].forEach(function (x) { var a = T('a', PILL + ';text-decoration:none;justify-content:center', x[0]); a.href = x[1]; panel.appendChild(a); });
    var cl = T('button', PILL + ';justify-content:center', 'বন্ধ করুন'); cl.type = 'button'; cl.addEventListener('click', function () { panel.style.display = 'none'; }); panel.appendChild(cl);
    document.body.appendChild(panel);
    press(ai, function () { panel.style.display = panel.style.display === 'none' ? 'flex' : 'none'; });
  }

  /* ---------- 2. currency: BDT only ---------- */
  all('span,div').forEach(function (e) { if (e.children.length === 0 && /^মুদ্রা: BDT/.test(norm(e.textContent))) { e.textContent = 'মুদ্রা: BDT (শুধু টাকা)'; e.style.cursor = 'default'; } });

  /* ---------- 3. filter chips ---------- */
  function cardsOf(root) {
    return all('div', root).filter(function (d) { var st = d.getAttribute('style') || ''; return /border-radius:(16|14|12)px/.test(st) && norm(d.textContent).length > 40 && !d.querySelector('div[style*="border-radius:16px"]') && !d.querySelector('input,textarea'); });
  }
  function chipGroup() {
    var best = null;
    all('div').forEach(function (p) {
      var kids = all(':scope > span, :scope > div, :scope > button', p).filter(function (k) { return k.children.length === 0 && norm(k.textContent).length >= 2 && norm(k.textContent).length <= 32 && norm(k.textContent) !== 'AI এজেন্ট'; });
      var styled = kids.filter(function (k) { return /border:1px solid|background:#(F1F5F9|EFF6FF|FFFFFF)/.test(k.getAttribute('style') || ''); });
      var use = path === '/services' ? kids : styled;
      if (use.length >= 4 && (!best || use.length > best.length)) { var inForm = p.closest('form'); if (!inForm) best = use; }
    });
    return best;
  }
  if (['/portfolio', '/software', '/price-list'].indexOf(path) >= 0) {
    var chips = chipGroup();
    if (chips) {
      var cards = cardsOf(document.body).filter(function (c) { return chips.indexOf(c) < 0 && !chips.some(function (x) { return c.contains(x); }); });
      var active = {};
      var msg = T('div', 'font-size:14px;color:#475569;line-height:1.7;padding:16px 0;display:none');
      msg.setAttribute('role', 'status'); msg.textContent = 'এই ফিল্টারে কিছু পাওয়া যায়নি। ফিল্টার কমিয়ে দেখুন অথবা প্রয়োজন লিখে কোটেশন চান।';
      if (cards[0]) cards[0].parentNode.parentNode.insertBefore(msg, cards[0].parentNode.nextSibling);
      var base = chips.map(function (c) { return c.getAttribute('style') || ''; });
      function key(c) { return norm(c.textContent).split(' ও ')[0].toLowerCase(); }
      function apply() {
        var on = chips.filter(function (c) { return active[norm(c.textContent)]; });
        var shown = 0;
        cards.forEach(function (card) { var t = card.textContent.toLowerCase(); var ok = !on.length || on.some(function (c) { return t.indexOf(key(c)) >= 0; }); card.style.display = ok ? '' : 'none'; if (ok) shown++; });
        msg.style.display = (on.length && !shown) ? 'block' : 'none';
        chips.forEach(function (c, i) { var a = !!active[norm(c.textContent)]; c.style.cssText = base[i] + (a ? ';background:#0F172A;color:#FFFFFF;border-color:#0F172A' : ''); c.setAttribute('aria-pressed', a ? 'true' : 'false'); });
        var cnt = all('div').filter(function (d) { return d.children.length === 0 && /সার্ভিস দেখানো হচ্ছে/.test(d.textContent); })[0];
        if (cnt) cnt.textContent = shown + 'টি সার্ভিস দেখানো হচ্ছে' + (on.length ? ' · ফিল্টার: ' + on.map(function (c) { return norm(c.textContent); }).join(', ') : '');
      }
      chips.forEach(function (c) { press(c, function () { var k = norm(c.textContent); active[k] = !active[k]; apply(); }); });
      var clr = leaf('ফিল্টার মুছুন', 'a'); if (clr) press(clr, function () { active = {}; apply(); });
      active = {}; apply();
    }
    var pg = all('span,div').filter(function (e) { return e.children.length === 0 && norm(e.textContent) === 'আগের'; })[0];
    if (pg) { var pc = pg.parentNode; while (pc && pc.children.length < 3) pc = pc.parentNode; (pg.closest('div[style*="justify-content"]') || pg.parentNode).style.display = 'none'; }
  }


  /* ---------- 3b. Services: checkbox sidebar ---------- */
  if (path === '/services') {
    var side = all('div').filter(function (d) { return /flex:0 0 260px/.test(d.getAttribute('style') || ''); })[0];
    if (side) {
      var groups = all(':scope > div', side).filter(function (g) { return g.querySelector('span[style*="border-radius:5px"]'); });
      var rowsAll = [];
      groups.forEach(function (g, gi) { all('span[style*="border-radius:5px"]', g).map(function (b) { return b.parentNode; }).forEach(function (r) { var box = r.querySelector('span'); var lab = r.querySelectorAll('span')[1]; if (box && lab) { box.style.background = '#FFFFFF'; rowsAll.push({ g: gi, r: r, box: box, key: norm(lab.textContent).split(' ও ')[0].toLowerCase(), on: false }); r.setAttribute('role', 'checkbox'); r.setAttribute('aria-checked', 'false'); r.setAttribute('tabindex', '0'); r.style.cursor = 'pointer'; r.style.minHeight = '36px'; } }); });
      var cardsS = cardsOf(document.body).filter(function (c) { return !side.contains(c) && !c.contains(side); });
      var emptyMsg = all('div').filter(function (d) { return /কিছু পাচ্ছেন না/.test(d.textContent) && d.children.length <= 2; }).pop();
      var cnt = all('div').filter(function (d) { return d.children.length === 0 && /সার্ভিস দেখানো হচ্ছে/.test(d.textContent); })[0];
      function applyS() {
        var shown = 0;
        cardsS.forEach(function (c) { var t = c.textContent.toLowerCase(); var ok = groups.every(function (g, gi) { var on = rowsAll.filter(function (x) { return x.g === gi && x.on; }); return !on.length || on.some(function (x) { return t.indexOf(x.key) >= 0; }); }); c.style.display = ok ? '' : 'none'; if (ok) shown++; });
        rowsAll.forEach(function (x) { x.box.style.background = x.on ? '#2563EB' : '#FFFFFF'; x.r.setAttribute('aria-checked', x.on ? 'true' : 'false'); });
        var onAll = rowsAll.filter(function (x) { return x.on; });
        if (cnt) cnt.textContent = shown + 'টি সার্ভিস দেখানো হচ্ছে' + (onAll.length ? ' · ফিল্টার: ' + onAll.map(function (x) { return norm(x.r.textContent); }).join(', ') : '');
        if (emptyMsg) emptyMsg.style.outline = shown ? '' : '2px solid #2563EB';
      }
      rowsAll.forEach(function (x) { press(x.r, function () { x.on = !x.on; applyS(); }); });
      var clr2 = leaf('ফিল্টার মুছুন', 'a'); if (clr2) press(clr2, function () { rowsAll.forEach(function (x) { x.on = false; }); applyS(); });
      applyS();
    }
  }

  /* ---------- 4. generic request forms -> /api/leads ---------- */
  function gather(root) {
    var d = { name: '', phone: '', email: '', extra: [] };
    all('input,textarea,select', root).forEach(function (i) {
      var v = (i.value || '').trim(); if (!v || i.type === 'checkbox' || i.type === 'button') return;
      var lb = i.id ? document.querySelector('label[for="' + i.id + '"]') : null; var l = lb ? norm(lb.textContent).replace(/\s*\*$/, '') : (i.placeholder || i.name || '');
      if (/নাম/.test(l) && !/কোম্পানি|প্রতিষ্ঠান/.test(l)) d.name = d.name || v; else if (/ফোন|মোবাইল|phone/i.test(l) || i.type === 'tel') d.phone = d.phone || v; else if (/ইমেইল|email/i.test(l) || i.type === 'email') d.email = d.email || v; else d.extra.push(l + ': ' + v);
    });
    return d;
  }
  function sendForm(btn, root, interest, extraLines, okMsg) {
    var d = gather(root); if (!d.name && d.email) d.name = d.email.split('@')[0]; if (!d.name && d.phone) d.name = 'Visitor';
    if (!d.phone && !d.email) { note(btn, 'ফোন নম্বর অথবা ইমেইল দিন।', false); return; }
    if (!d.name) { note(btn, 'আপনার নাম লিখুন।', false); return; }
    var lines = d.extra.concat(extraLines || []).filter(Boolean);
    var body = { name: d.name, interest: interest, message: lines.join('\n') || interest, locale: 'bn' }; if (d.phone) body.phone = d.phone; if (d.email) body.email = d.email;
    post(body).then(function (r) { if (r.ok) { note(btn, okMsg || 'ধন্যবাদ, আপনার অনুরোধ পেয়েছি। আমাদের টিম যোগাযোগ করবে।', true); all('input,textarea', root).forEach(function (i) { if (i.type !== 'checkbox') i.value = ''; }); } else note(btn, err(r.j), false); });
  }
  function miniForm(btn, interest, fields, okMsg, extraFn) {
    var box = T('div', 'margin-top:12px;display:none;flex-direction:column;gap:10px;max-width:420px;text-align:left;background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:16px'); box.setAttribute('data-mini', '1');
    fields.forEach(function (f, n) { var w = T('div'); var id = 'mf-' + interest.length + '-' + n; var l = T('label', 'display:block;font-size:14px;font-weight:600;margin-bottom:4px;color:#0F172A', f[0]); l.htmlFor = id; var i = f[2] === 'textarea' ? T('textarea', INP + ';padding:10px 12px;min-height:80px') : T('input', INP); i.id = id; if (f[2] && f[2] !== 'textarea') i.type = f[2]; w.appendChild(l); w.appendChild(i); box.appendChild(w); });
    var go = T('button', 'background:#FF7900;color:#26272B;border:0;border-radius:12px;min-height:44px;padding:0 18px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;align-self:flex-start', 'পাঠান'); go.type = 'button'; box.appendChild(go);
    btn.parentNode.insertBefore(box, btn.nextSibling);
    press(btn, function () { box.style.display = box.style.display === 'none' ? 'flex' : 'none'; });
    go.addEventListener('click', function () { sendForm(go, box, interest, extraFn ? extraFn() : [], okMsg); });
  }

  if (path === '/engagement') {
    var techs = all('span').filter(function (s) { return s.children.length === 0 && /^(Laravel|PostgreSQL|PHP|JavaScript|React|Node\.js|Flutter|Python|WordPress|Odoo|AWS|Docker)$/.test(norm(s.textContent)); }); var picked = {};
    var tb = techs.map(function (c) { return c.getAttribute('style') || ''; });
    techs.forEach(function (c, i) { press(c, function () { var k = norm(c.textContent); picked[k] = !picked[k]; c.style.cssText = tb[i] + (picked[k] ? ';background:#0F172A;color:#fff;border-color:#0F172A' : ''); c.setAttribute('aria-pressed', picked[k] ? 'true' : 'false'); }); });
    var sb = leaf('অনুরোধ পাঠান'); if (sb) press(sb, function () { sendForm(sb, document.getElementById('c1').closest('div[style*="border-radius"]') || document.body, 'Engagement: কাজের মডেল', ['প্রযুক্তি: ' + Object.keys(picked).filter(function (k) { return picked[k]; }).join(', ')]); });
    var bk = all('a').filter(function (a) { return /বুক করুন/.test(a.textContent); })[0]; if (bk) bk.href = '#c1';
  }
  if (path === '/trust') {
    var tsub = leaf('অনুরোধ জমা দিন'); if (tsub) press(tsub, function () { sendForm(tsub, document.getElementById('t1').closest('div[style*="border-radius"]') || document.body, 'Trust: ডেটা/গোপনীয়তা অনুরোধ', [], 'আপনার অনুরোধ জমা হয়েছে। যাচাইয়ের পর ইমেইলে জানানো হবে।'); });
    var sv = leaf('পছন্দ সংরক্ষণ'), ne = leaf('শুধু প্রয়োজনীয়');
    function pref(v, btn) { try { localStorage.setItem('ml_cookie_pref', v); } catch (e) {} note(btn, 'আপনার কুকি পছন্দ এই ব্রাউজারে সংরক্ষিত হয়েছে।', true); }
    if (sv) press(sv, function () { pref('custom', sv); }); if (ne) press(ne, function () { pref('essential', ne); });
  }
  if (path === '/status') {
    var sub = leaf('আপডেট সাবস্ক্রাইব'); if (sub) miniForm(sub, 'Status: আপডেট সাবস্ক্রাইব', [['ইমেইল *', '', 'email']], 'সাবস্ক্রাইব হয়েছে। সার্ভিস আপডেট ইমেইলে পাবেন।');
  }
  if (path === '/company') {
    var ap = leaf('আবেদন করুন'); if (ap) miniForm(ap, 'Career: চাকরির আবেদন', [['নাম *', '', 'text'], ['ফোন নম্বর *', '', 'tel'], ['ইমেইল', '', 'email'], ['কোন পদে এবং সংক্ষিপ্ত পরিচয়', '', 'textarea']], 'আবেদন পেয়েছি। প্রয়োজনে আমরা যোগাযোগ করব।');
  }
  if (path === '/finder') {
    var fb = leaf('সম্ভাব্য সমাধান দেখুন'), later = leaf('পরে করব');
    if (fb) press(fb, function () {
      var g = document.getElementById('f1'); if (!g || !g.value.trim()) { note(fb, 'আপনার সমস্যা বা লক্ষ্য লিখুন।', false); return; }
      var res = document.getElementById('ml-finder'); if (!res) { res = T('div', 'margin-top:16px;border:1px solid #E2E8F0;border-radius:16px;padding:18px;background:#fff;display:flex;flex-direction:column;gap:10px;line-height:1.7'); res.id = 'ml-finder'; fb.parentNode.parentNode.insertBefore(res, fb.parentNode.nextSibling); }
      res.textContent = ''; res.appendChild(T('div', 'font-weight:700;font-size:16px', 'সম্ভাব্য পরের ধাপ · Demo (নমুনা ডেটা)'));
      res.appendChild(T('div', 'color:#475569', 'আপনার লক্ষ্য: ' + g.value.trim() + '। স্বয়ংক্রিয় সুপারিশ এখনো চালু হয়নি; এই লক্ষ্য ধরে আমাদের টিম সঠিক সার্ভিস ও আনুমানিক সময় জানাবে।'));
      var row = T('div', 'display:flex;gap:8px;flex-wrap:wrap'); [['সব সার্ভিস দেখুন', '/services'], ['এই লক্ষ্য নিয়ে কোটেশন নিন', '/quote']].forEach(function (x) { var a = T('a', PILL + ';text-decoration:none', x[0]); a.href = x[1]; row.appendChild(a); });
      try { localStorage.setItem('ml_finder_goal', g.value.trim()); } catch (e) {} res.appendChild(row);
    });
    if (later) press(later, function () { location.href = '/'; });
  }
  if (path === '/help') {
    var arts = all('a[href="#top"]').filter(function (a) { return norm(a.textContent).length > 3; });
    arts.forEach(function (a) {
      var box = T('div', 'display:none;font-size:14px;line-height:1.7;color:#475569;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px;margin-top:8px'); box.textContent = 'Demo (নমুনা ডেটা): এই নিবন্ধের পূর্ণ লেখা প্রকাশের আগে যোগ হবে। এখনই সাহায্য চাইলে কোটেশন পাতা বা লগইন করে লাইভ চ্যাট ব্যবহার করুন।';
      a.parentNode.insertBefore(box, a.nextSibling); press(a, function () { box.style.display = box.style.display === 'none' ? 'block' : 'none'; });
    });
    var yes = leaf('হ্যাঁ'), no = leaf('না');
    function fb2(b, v) { try { localStorage.setItem('ml_kb_feedback', v); } catch (e) {} note(b, v === 'yes' ? 'ধন্যবাদ!' : 'ধন্যবাদ। আরও সাহায্য লাগলে কোটেশন পাতা বা লাইভ চ্যাট ব্যবহার করুন।', true); }
    if (yes) press(yes, function () { fb2(yes, 'yes'); }); if (no) press(no, function () { fb2(no, 'no'); });
    var s = document.getElementById('kb1'); if (s) s.addEventListener('input', function () { var q = s.value.trim().toLowerCase(); arts.forEach(function (a) { var show = !q || a.textContent.toLowerCase().indexOf(q) >= 0; (a.closest('div[style*="border-radius"]') || a).style.display = show ? '' : 'none'; }); });
  }
  if (path === '/login') {
    var fg = all('a').filter(function (a) { return /পাসওয়ার্ড ভুলে/.test(a.textContent); })[0];
    if (fg) press(fg, function () { note(fg, 'পাসওয়ার্ড রিসেট এখনো চালু হয়নি। আমাদের সাপোর্টে লিখুন, আমরা যাচাই করে রিসেট করে দেব।', false); });
  }
  if (path === '/price-list') {
    ['মাসিক', 'প্রকল্প ভিত্তিক'].forEach(function (t) { var e = leaf(t); if (e) e.setAttribute('aria-pressed', 'false'); });
  }
})();
