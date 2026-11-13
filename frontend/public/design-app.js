/* ModinaLink: connects the design pages to the live API (forms only). */
(function () {
  var API = '/api';
  function $(s, r) { return (r || document).querySelector(s); }
  function byText(sel, t) { return Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function (e) { return e.textContent.replace(/\s+/g, ' ').trim() === t; })[0]; }
  function note(anchor, msg, ok) {
    var n = document.getElementById('ml-note');
    if (!n) { n = document.createElement('div'); n.id = 'ml-note'; n.setAttribute('role', 'status'); n.style.cssText = 'margin-top:12px;font-size:14px;font-weight:600;line-height:1.6'; anchor.parentNode.insertBefore(n, anchor.nextSibling); }
    n.style.color = ok ? '#166534' : '#B91C1C'; n.textContent = msg;
  }
  function post(path, body) {
    return fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); });
  }
  function firstError(j) {
    if (j && j.errors) { var k = Object.keys(j.errors)[0]; if (k) return j.errors[k][0]; }
    return (j && j.message) || 'কিছু ভুল হয়েছে, আবার চেষ্টা করুন।';
  }
  function press(el, fn) {
    if (!el) return;
    el.style.cursor = 'pointer';
    if (!/^(A|BUTTON)$/.test(el.tagName)) { el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); }
    el.addEventListener('click', function (e) { e.preventDefault(); fn(el); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(el); } });
  }
  function resetField(id) {
    var i = document.getElementById(id); if (!i) return;
    i.value = ''; i.style.border = '1px solid #CBD5E1';
    var wrap = i.parentNode; Array.prototype.slice.call(wrap.querySelectorAll('div')).forEach(function (d) { if (/B91C1C/i.test(d.getAttribute('style') || '')) d.style.display = 'none'; });
  }

  /* ---- Quote ---- */
  if (document.getElementById('f1') && document.getElementById('f5')) {
    resetField('f3');
    var chipWrap = null, chips = [];
    Array.prototype.slice.call(document.querySelectorAll('span,button')).forEach(function (e) { if (/AI Automation|Website \/ Web App/.test(e.textContent) && e.children.length === 0) chipWrap = e.parentNode; });
    if (chipWrap) {
      chips = Array.prototype.slice.call(chipWrap.children);
      var on = chips[0].getAttribute('style'), off = chips[1].getAttribute('style'), sel = 0;
      chips.forEach(function (c, i) { press(c, function () { chips[sel].setAttribute('style', off); sel = i; c.setAttribute('style', on); }); if (c.tagName === 'BUTTON') c.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); });
      chipWrap.__sel = function () { return chips[sel].textContent.trim(); };
    }
    var send = byText('a,button,span', 'কোটেশনের অনুরোধ পাঠান');
    press(send, function () {
      var v = function (id) { return (document.getElementById(id).value || '').trim(); };
      if (!v('f1')) return note(send, 'নাম লিখুন।', false);
      if (!v('f2') && !v('f3')) return note(send, 'ফোন বা ইমেইল দিন।', false);
      if (!v('f5')) return note(send, 'আপনার প্রয়োজন লিখুন।', false);
      var msg = v('f5'); if (v('f6')) msg += '\nবাজেট: ' + v('f6'); if (v('f7')) msg += '\nপ্রত্যাশিত তারিখ: ' + v('f7');
      var body = { name: v('f1'), company: v('f4') || null, interest: chipWrap && chipWrap.__sel ? chipWrap.__sel() : null, message: msg, locale: 'bn' };
      if (v('f2')) body.phone = v('f2'); if (v('f3')) body.email = v('f3');
      note(send, 'পাঠানো হচ্ছে…', true);
      post('/leads', body).then(function (r) {
        if (r.ok) { note(send, 'অনুরোধ পাঠানো হয়েছে। আমরা যাচাই করে যোগাযোগ করব।', true); }
        else note(send, firstError(r.j), false);
      }).catch(function () { note(send, 'নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।', false); });
    });
  }

  /* ---- Login / Register ---- */
  if (document.getElementById('l1') && document.getElementById('l2')) {
    resetField('l2'); document.getElementById('l2').type = 'password';
    document.getElementById('l2').setAttribute('autocomplete', 'current-password'); document.getElementById('l1').setAttribute('autocomplete', 'email');
    function done(r, anchor) {
      if (!r.ok) return note(anchor, firstError(r.j), false);
      try { localStorage.setItem('ml_token', r.j.token); } catch (e) {}
      var role = r.j.user && r.j.user.role; location.href = (role === 'admin' || role === 'staff') ? '/admin' : '/portal';
    }
    var lg = byText('a', 'লগইন');
    press(lg, function () {
      var email = document.getElementById('l1').value.trim(), pw = document.getElementById('l2').value;
      if (!email || !pw) return note(lg, 'ইমেইল ও পাসওয়ার্ড দিন।', false);
      note(lg, 'প্রবেশ করা হচ্ছে…', true);
      post('/auth/login', { email: email, password: pw }).then(function (r) { done(r, lg); }).catch(function () { note(lg, 'নেটওয়ার্ক সমস্যা।', false); });
    });
    var r5 = document.getElementById('r5'), r2 = document.getElementById('r2');
    if (r5 && r2) {
      var pwWrap = r5.parentNode.cloneNode(true), pl = pwWrap.querySelector('label'), pi = pwWrap.querySelector('input');
      pl.setAttribute('for', 'r6'); pl.textContent = 'পাসওয়ার্ড * (কমপক্ষে ৮ অক্ষর)'; pi.id = 'r6'; pi.type = 'password'; pi.value = ''; pi.removeAttribute('placeholder'); pi.setAttribute('autocomplete', 'new-password');
      r2.parentNode.parentNode.insertBefore(pwWrap, r2.parentNode.nextSibling);
      var rg = byText('span,a,button', 'নিবন্ধন করুন');
      press(rg, function () {
        var v = function (id) { return (document.getElementById(id).value || '').trim(); };
        if (!v('r1') || !v('r2') || !document.getElementById('r6').value) return note(rg, 'নাম, ইমেইল ও পাসওয়ার্ড দিন।', false);
        note(rg, 'অ্যাকাউন্ট খোলা হচ্ছে…', true);
        post('/auth/register', { name: v('r1'), email: v('r2'), password: document.getElementById('r6').value, company: v('r5') || null, locale: 'bn' }).then(function (r) { done(r, rg); }).catch(function () { note(rg, 'নেটওয়ার্ক সমস্যা।', false); });
      });
    }
  }
})();
