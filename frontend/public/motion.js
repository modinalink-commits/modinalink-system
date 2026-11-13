/* ModinaLink motion + illustration layer (public pages).
   Brings the design's ml-* animations (float, rise, drift, bar, draw, pulse, marquee, shimmer)
   to every page, adds scroll reveal, count-up, and brand-coloured SVG scenes.
   Respects prefers-reduced-motion. No user data is touched; all SVG is static markup. */
(function () {
  'use strict';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var O = '#FF7900', C = '#26272B';
  var d = document;

  /* ---------- 1. CSS ---------- */
  var css = [
    '@keyframes mlFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}',
    '@keyframes mlPulse{0%{transform:scale(1);opacity:.55}100%{transform:scale(2.6);opacity:0}}',
    '@keyframes mlBar{0%{transform:scaleY(.25)}100%{transform:scaleY(1)}}',
    '@keyframes mlDraw{from{stroke-dashoffset:420}to{stroke-dashoffset:0}}',
    '@keyframes mlSpin{to{transform:rotate(360deg)}}',
    '@keyframes mlDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(26px,-18px)}}',
    '@keyframes mlBlink{0%,100%{opacity:1}50%{opacity:.3}}',
    '@keyframes mlFlow{to{stroke-dashoffset:-24}}',
    '@keyframes mlStep{0%,100%{box-shadow:0 0 0 0 rgba(255,121,0,0)}20%,40%{box-shadow:0 0 0 4px rgba(255,121,0,.35)}}',
    '@keyframes mlSweep{from{transform:translateX(-120%)}to{transform:translateX(220%)}}',
    '@keyframes mlIn{from{opacity:0}to{opacity:1}}',
    '@keyframes mlTick{0%{stroke-dashoffset:40}60%,100%{stroke-dashoffset:0}}',
    '.ml-float{animation:mlFloat 6s ease-in-out infinite}',
    '.ml-drift{animation:mlDrift 14s ease-in-out infinite}',
    '.ml-spin{animation:mlSpin 40s linear infinite;transform-origin:center;transform-box:fill-box}',
    '.ml-bar{transform-origin:bottom;transform-box:fill-box;animation:mlBar 1.8s ease-in-out infinite alternate}',
    '.ml-draw{stroke-dasharray:420;animation:mlDraw 3.2s ease-out infinite alternate}',
    '.ml-flow{stroke-dasharray:6 6;animation:mlFlow 1.2s linear infinite}',
    '.ml-pulse{transform-origin:center;transform-box:fill-box;animation:mlPulse 2.2s ease-out infinite}',
    '.ml-blink{animation:mlBlink 1.6s ease-in-out infinite}',
    'body{animation:mlIn .45s ease both}',
    '.ml-js .mlr{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1);transition-delay:var(--d,0s)}',
    '.ml-js .mlr.in{opacity:1;transform:none}',
    '.ml-card{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}',
    '.ml-card:hover{transform:translateY(-4px);box-shadow:0 18px 40px -18px rgba(255,121,0,.38);border-color:#FF7900!important}',
    'a[style*="border-radius"],button[style*="border-radius"]{transition:transform .15s ease,box-shadow .2s ease,filter .2s ease}',
    'a[style*="border-radius"]:hover,button[style*="border-radius"]:hover{transform:translateY(-1px)}',
    'a[style*="border-radius"]:active,button[style*="border-radius"]:active{transform:scale(.97)}',
    'a[style*="background:#2563EB" i],a[style*="background:#FF7900" i]{position:relative;overflow:hidden}',
    'a[style*="background:#2563EB" i]::after,a[style*="background:#FF7900" i]::after{content:"";position:absolute;top:0;left:0;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);transform:translateX(-120%);pointer-events:none}',
    'a[style*="background:#2563EB" i]:hover::after,a[style*="background:#FF7900" i]:hover::after{animation:mlSweep .8s ease}',
    '.ml-art{pointer-events:none;position:absolute;z-index:0}',
    '.ml-step-on{animation:mlStep 6s ease-in-out infinite}',
    '#mlprog{position:fixed;top:0;left:0;height:3px;width:0;background:#FF7900;z-index:99999;transition:width .1s linear}',
    '@keyframes mlLogo{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}',
    '@keyframes mlSplash{0%,70%{opacity:1}100%{opacity:0;visibility:hidden}}',
        'svg[aria-label="ModinaLink"].ml-logo-go path{stroke-dasharray:1;animation:mlLogo .9s cubic-bezier(.5,0,.2,1) both}',
    'svg[aria-label="ModinaLink"].ml-logo-go path+path{animation-delay:.45s}',
    'a:has(>svg[aria-label="ModinaLink"]),div:has(>svg[aria-label="ModinaLink"]){transition:transform .25s ease}',
    'a:has(>svg[aria-label="ModinaLink"]):hover{transform:scale(1.04)}',
    '#mlsplash{position:fixed;inset:0;z-index:100000;background:#fff;display:flex;align-items:center;justify-content:center;pointer-events:none;animation:mlSplash 1.25s ease forwards}',
    'input:focus,textarea:focus,select:focus{outline:none;border-color:#FF7900!important;box-shadow:0 0 0 3px rgba(255,121,0,.22);transition:box-shadow .2s ease,border-color .2s ease}',
    'input,textarea,select{transition:box-shadow .2s ease,border-color .2s ease}',
    '[role=status],[role=alert]{animation:mlRise .5s cubic-bezier(.2,.7,.2,1) both}',
    '@keyframes mlRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
    '@media (max-width:900px){.ml-art.ml-hide-sm{display:none}}',
    '@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}.ml-js .mlr{opacity:1;transform:none}.ml-draw{stroke-dasharray:none}}'
  ].join('\n');
  var st = d.createElement('style'); st.setAttribute('data-ml', 'motion'); st.textContent = css; d.head.appendChild(st);

  /* ---------- helpers ---------- */
  function all(sel, r) { return Array.prototype.slice.call((r || d).querySelectorAll(sel)); }
  function svg(html, cls, style) {
    var w = d.createElement('div'); if (cls) w.className = cls; if (style) w.style.cssText = style;
    w.setAttribute('aria-hidden', 'true'); w.innerHTML = html; return w;
  }
  function bars(x, y, n, w, gap, hmax, color, delay0) {
    var s = '';
    for (var i = 0; i < n; i++) {
      var h = Math.round(hmax * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7 + 1))));
      s += '<rect class="ml-bar" x="' + (x + i * (w + gap)) + '" y="' + (y - h) + '" width="' + w + '" height="' + h + '" rx="3" fill="' + color + '" style="animation-delay:-' + ((i * 0.23 + (delay0 || 0)).toFixed(2)) + 's;animation-duration:' + (1.3 + (i % 3) * 0.3) + 's"/>';
    }
    return s;
  }

  /* ---------- 2. Illustration scenes (320x150) ---------- */
  var SCENES = {
    dash: function () {
      return '<svg viewBox="0 0 320 150" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="320" height="150" fill="#FFF1E3"/>' +
        '<g class="ml-float"><rect x="26" y="20" width="268" height="110" rx="12" fill="#fff" stroke="#E6E8EC"/><rect x="40" y="32" width="70" height="8" rx="4" fill="' + C + '" opacity=".85"/><rect x="40" y="46" width="44" height="6" rx="3" fill="#D7D9DE"/>' +
        bars(46, 118, 7, 14, 8, 52, O) +
        '<path class="ml-draw" d="M168 108 C190 70 208 96 230 62 S270 54 282 40" fill="none" stroke="' + C + '" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="282" cy="40" r="4.5" fill="' + O + '"/><circle class="ml-pulse" cx="282" cy="40" r="5" fill="' + O + '"/></g></svg>';
    },
    chat: function () {
      return '<svg viewBox="0 0 320 150" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="320" height="150" fill="#F3F4F6"/>' +
        '<g class="ml-float"><rect x="40" y="22" width="170" height="38" rx="14" fill="#fff" stroke="#E6E8EC"/><rect x="54" y="35" width="110" height="7" rx="3.5" fill="#D7D9DE"/><rect x="54" y="47" width="70" height="6" rx="3" fill="#E6E8EC"/>' +
        '<rect x="104" y="72" width="176" height="38" rx="14" fill="' + O + '"/><rect x="118" y="85" width="120" height="7" rx="3.5" fill="' + C + '" opacity=".75"/><rect x="118" y="97" width="80" height="6" rx="3" fill="' + C + '" opacity=".4"/>' +
        '<g fill="' + C + '"><circle class="ml-blink" cx="56" cy="124" r="4"/><circle class="ml-blink" cx="70" cy="124" r="4" style="animation-delay:.25s"/><circle class="ml-blink" cx="84" cy="124" r="4" style="animation-delay:.5s"/></g></g></svg>';
    },
    cart: function () {
      return '<svg viewBox="0 0 320 150" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="320" height="150" fill="#FFF1E3"/>' +
        '<g class="ml-float"><path d="M70 44h26l14 52h92l12-38H104" fill="none" stroke="' + C + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="122" cy="112" r="9" fill="' + O + '"/><circle cx="196" cy="112" r="9" fill="' + O + '"/>' +
        '<rect class="ml-bar" x="130" y="30" width="22" height="22" rx="4" fill="' + O + '" style="animation-delay:-.2s"/><rect class="ml-bar" x="158" y="22" width="22" height="30" rx="4" fill="' + C + '" style="animation-delay:-.7s"/><rect class="ml-bar" x="186" y="34" width="22" height="18" rx="4" fill="' + O + '" opacity=".7" style="animation-delay:-1.1s"/></g>' +
        '<path class="ml-flow" d="M232 76h56" stroke="' + C + '" stroke-width="3" stroke-linecap="round" fill="none"/></svg>';
    },
    shield: function () {
      return '<svg viewBox="0 0 320 150" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="320" height="150" fill="#F3F4F6"/>' +
        '<g class="ml-spin" style="animation-duration:26s"><circle cx="160" cy="75" r="56" fill="none" stroke="#D7D9DE" stroke-dasharray="3 7" stroke-width="2"/><circle cx="216" cy="75" r="7" fill="' + O + '"/></g>' +
        '<g class="ml-float"><path d="M160 30l38 14v28c0 24-16 38-38 46-22-8-38-22-38-46V44z" fill="' + C + '"/><path class="ml-draw" style="stroke-dasharray:60;animation-duration:2.4s" d="M142 76l13 13 25-27" fill="none" stroke="' + O + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g></svg>';
    },
    phone: function () {
      return '<svg viewBox="0 0 320 150" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="320" height="150" fill="#FFF1E3"/>' +
        '<g class="ml-float"><rect x="124" y="10" width="72" height="130" rx="14" fill="' + C + '"/><rect x="130" y="20" width="60" height="110" rx="8" fill="#fff"/>' +
        '<rect x="136" y="28" width="48" height="10" rx="4" fill="' + O + '"/><rect x="136" y="46" width="48" height="12" rx="4" fill="#F3F4F6"/><rect x="136" y="64" width="48" height="12" rx="4" fill="#F3F4F6"/><rect x="136" y="82" width="34" height="12" rx="4" fill="#F3F4F6"/>' +
        '<rect class="ml-bar" x="136" y="104" width="10" height="18" rx="2" fill="' + O + '"/><rect class="ml-bar" x="150" y="104" width="10" height="18" rx="2" fill="' + C + '" style="animation-delay:-.4s"/><rect class="ml-bar" x="164" y="104" width="10" height="18" rx="2" fill="' + O + '" style="animation-delay:-.9s"/></g>' +
        '<circle class="ml-pulse" cx="232" cy="40" r="8" fill="' + O + '"/><circle cx="232" cy="40" r="5" fill="' + O + '"/><circle class="ml-pulse" cx="86" cy="104" r="8" fill="' + C + '"/><circle cx="86" cy="104" r="5" fill="' + C + '"/></svg>';
    },
    flow: function () {
      return '<svg viewBox="0 0 320 150" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="320" height="150" fill="#F3F4F6"/>' +
        '<path class="ml-flow" d="M62 75h60M158 75h50M244 75h24" stroke="' + C + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<g class="ml-float"><rect x="30" y="55" width="40" height="40" rx="10" fill="' + C + '"/><rect x="118" y="55" width="48" height="40" rx="10" fill="' + O + '"/><rect x="204" y="55" width="40" height="40" rx="10" fill="' + C + '"/><circle cx="288" cy="75" r="14" fill="' + O + '"/>' +
        '<path class="ml-draw" style="stroke-dasharray:40;animation-duration:2s" d="M281 75l5 5 9-10" fill="none" stroke="' + C + '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g></svg>';
    }
  };
  var ORDER = ['dash', 'chat', 'cart', 'shield', 'phone', 'flow'];
  function sceneFor(txt, i) {
    var t = (txt || '').toLowerCase();
    if (/\bai\b|চ্যাট|assist|support/.test(t)) return 'chat';
    if (/commerce|pos|retail|cart|অর্ডার|invoice|quote|store/.test(t)) return 'cart';
    if (/cloud|security|backup|trust/.test(t)) return 'shield';
    if (/app|mobile|android/.test(t)) return 'phone';
    if (/automation|workflow|integration/.test(t)) return 'flow';
    if (/business|erp|crm|report|dashboard|suite/.test(t)) return 'dash';
    return ORDER[i % ORDER.length];
  }

  /* ---------- 3. Replace placeholder skeleton thumbnails with scenes ---------- */
  function scenes() {
    all('div[style*="height:150px"]').forEach(function (el, i) {
      if (el.dataset.mlScene) return;
      var skeleton = all('div[style*="height:10px"][style*="width:"]', el).length >= 3;
      if (!skeleton) return;
      var card = el.parentNode, te = card && card.querySelector('div[style*="font-size:18px"]'), title = te ? te.textContent : '';
      el.dataset.mlScene = '1';
      el.innerHTML = ''; el.style.padding = '0'; el.style.overflow = 'hidden';
      el.appendChild(svg(SCENES[sceneFor(title, i)](), '', 'width:100%;height:100%'));
    });
  }

  /* ---------- 4. Page hero art (inner pages) ---------- */
  function heroArt() {
    var h1 = d.querySelector('h1'); if (!h1) return;
    var host = h1.parentNode;
    if (!host || host.dataset.mlHero) return;
    host.dataset.mlHero = '1';
    var isMain = /^\/?$/.test(location.pathname);
    // climb to the padded section wrapper
    var sec = host; for (var k = 0; k < 4 && sec.parentNode && sec.parentNode !== d.body; k++) { if (sec.style && /padding:\d+px 0/.test(sec.getAttribute('style') || '')) break; sec = sec.parentNode; }
    if (!sec || !sec.style) return;
    sec.style.position = sec.style.position || 'relative'; sec.style.overflow = 'hidden';
    var art = isMain
      ? '<svg viewBox="0 0 600 400" width="600" height="400"><g fill="none" stroke="' + O + '" stroke-opacity=".22"><circle class="ml-spin" cx="300" cy="200" r="170" stroke-dasharray="4 9" style="animation-duration:60s"/><circle class="ml-spin" cx="300" cy="200" r="110" stroke-dasharray="2 8" style="animation-duration:45s;animation-direction:reverse"/></g>' +
        '<g class="ml-drift"><circle cx="120" cy="90" r="38" fill="' + O + '" opacity=".14"/><circle cx="500" cy="300" r="52" fill="' + C + '" opacity=".07"/></g>' +
        '<g class="ml-drift" style="animation-duration:19s;animation-delay:-5s"><circle cx="480" cy="80" r="22" fill="' + O + '" opacity=".18"/><circle cx="90" cy="330" r="28" fill="' + C + '" opacity=".08"/></g></svg>'
      : '<svg viewBox="0 0 420 260" width="420" height="260"><g class="ml-drift"><circle cx="330" cy="70" r="46" fill="' + O + '" opacity=".16"/></g><g fill="none" stroke="' + O + '" stroke-opacity=".3" stroke-width="2"><circle class="ml-spin" cx="300" cy="120" r="84" stroke-dasharray="3 8" style="animation-duration:50s"/></g>' +
        '<g class="ml-drift" style="animation-delay:-6s"><rect x="250" y="150" width="90" height="56" rx="12" fill="' + C + '" opacity=".07"/>' + bars(262, 196, 5, 10, 6, 36, O, 0) + '</g></svg>';
    var a = svg(art, 'ml-art ml-hide-sm', isMain ? 'right:-60px;top:20px;opacity:.9' : 'right:0;top:-10px;opacity:.9');
    sec.insertBefore(a, sec.firstChild);
    // keep content above art
    all(':scope > div', sec).forEach(function (c) { if (c !== a) { c.style.position = c.style.position || 'relative'; c.style.zIndex = '1'; } });
  }

  /* ---------- 5. Main: workflow step sequencing, CTA rings, step connectors ---------- */
  function mainExtras() {
    // workflow card: highlight steps in sequence
    var flowCard = all('span').filter(function (s) { return /Order inquiry workflow/.test(s.textContent); })[0];
    if (flowCard) {
      var list = flowCard.parentNode.nextElementSibling;
      if (list) {
        var rows = Array.prototype.slice.call(list.children);
        rows.forEach(function (r, i) { r.classList.add('ml-step-on'); r.style.animationDelay = (i * 1.5) + 's'; r.style.transition = 'transform .3s'; });
        // flowing connector line behind step circles
        if (rows.length > 1) {
          list.style.position = 'relative';
        }
      }
    }
    // "কাজের ধাপ" 5-step row: draw connector line
    var h = all('h2').filter(function (x) { return /কাজের ধাপ/.test(x.textContent); })[0];
    if (h) {
      var grid = h.nextElementSibling;
      if (grid && grid.children.length >= 3) {
        grid.style.position = 'relative';
        var line = svg('<svg viewBox="0 0 100 4" width="100%" height="4" preserveAspectRatio="none"><path class="ml-flow" d="M0 2H100" stroke="' + O + '" stroke-width="2" fill="none" vector-effect="non-scaling-stroke"/></svg>', 'ml-art', 'left:5%;right:5%;top:33px;z-index:0');
        grid.insertBefore(line, grid.firstChild);
        Array.prototype.slice.call(grid.children).forEach(function (c) { if (c !== line) { c.style.position = 'relative'; c.style.zIndex = '1'; } });
      }
    }
    // consultation CTA block rings
    all('div[style*="background:#2563EB"],div[style*="background:#FF7900"]').forEach(function (b) {
      if (!/border-radius:16px/.test(b.getAttribute('style') || '') || b.dataset.mlCta) return;
      b.dataset.mlCta = '1'; b.style.position = 'relative'; b.style.overflow = 'hidden';
      b.insertBefore(svg('<svg viewBox="0 0 300 300" width="300" height="300"><g fill="none" stroke="#26272B" stroke-opacity=".16" stroke-width="2"><circle class="ml-pulse" cx="150" cy="150" r="40"/><circle class="ml-pulse" cx="150" cy="150" r="40" style="animation-delay:.8s"/><circle class="ml-pulse" cx="150" cy="150" r="40" style="animation-delay:1.6s"/></g></svg>', 'ml-art', 'right:-40px;top:-60px'), b.firstChild);
      all(':scope > div', b).forEach(function (c) { c.style.position = 'relative'; c.style.zIndex = '1'; });
    });
  }

  /* ---------- 6. Industry / service icons: small animated glyphs ---------- */
  function iconAnim() {
    all('svg path[d]').forEach(function (p) {
      var s = p.closest('svg'); if (!s || s.dataset.mlI || s.getAttribute('width') !== '22') return;
      s.dataset.mlI = '1'; var box = s.parentNode;
      if (box) { box.classList.add('ml-card-icon'); box.style.transition = 'transform .3s ease'; box.addEventListener('mouseenter', function () { box.style.transform = 'rotate(-6deg) scale(1.1)'; }); box.addEventListener('mouseleave', function () { box.style.transform = ''; }); }
    });
  }

  /* ---------- 7. Status dots, generic pulse ---------- */
  function dots() {
    all('[style*="width:8px"][style*="border-radius:50%"],[style*="width:10px"][style*="border-radius:50%"],[style*="width:8px"][style*="border-radius:999px"],[style*="width:10px"][style*="border-radius:999px"]').forEach(function (e) {
      if (e.dataset.mlD) return; e.dataset.mlD = '1'; e.classList.add('ml-blink');
    });
  }

  /* ---------- 8. Scroll reveal + hover lift ---------- */
  function isCard(el) {
    var s = el.getAttribute('style') || '';
    return /border-radius:1[2-9]px|border-radius:2\dpx/.test(s) && /border:\s*[12]px (solid|dashed)/.test(s) && !/(width:\d+px;height:\d+px)/.test(s.replace(/\s/g, '')) && el.offsetHeight > 60 && el.offsetHeight < 900;
  }
  function reveal() {
    var hdr = d.querySelector('#top > div:first-child') || d.querySelector('body > div > div');
    var els = all('#top [style], body > div [style]').filter(function (el, i, arr) { return el.tagName === 'DIV' || el.tagName === 'A' || el.tagName === 'H2'; });
    var picked = [];
    els.forEach(function (el) {
      if (el.tagName === 'H2') { picked.push(el); return; }
      if (!isCard(el)) return;
      if (hdr && hdr.contains(el)) return;
      if (el.closest('[data-ml-skip]')) return;
      for (var k = 0; k < picked.length; k++) if (picked[k].contains(el)) return; // outermost only
      picked.push(el);
    });
    picked = picked.slice(0, 260);
    if (RM || !('IntersectionObserver' in window)) return;
    d.documentElement.classList.add('ml-js');
    var groups = new Map();
    picked.forEach(function (el) {
      var par = el.parentNode; var n = groups.get(par) || 0; groups.set(par, n + 1);
      el.classList.add('mlr'); el.style.setProperty('--d', Math.min(n, 6) * 0.08 + 's');
      if (el.tagName !== 'H2') el.classList.add('ml-card');
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; var el = e.target; io.unobserve(el);
        el.classList.add('in');
        setTimeout(function () { el.classList.remove('mlr'); el.classList.remove('in'); el.style.removeProperty('--d'); }, 1400);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    picked.forEach(function (el) { io.observe(el); });
    addEventListener('scroll', function () { var vh = innerHeight; all('.mlr:not(.in)').forEach(function (el) { if (el.getBoundingClientRect().top < vh - 40) { io.unobserve(el); el.classList.add('in'); } }); }, { passive: true });
    // fail-safe: never leave content hidden
    setTimeout(function () { all('.mlr').forEach(function (el) { el.classList.add('in'); }); }, 5000);
  }

  /* ---------- 9. Count-up ---------- */
  function counters() {
    if (RM || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; var el = e.target; io.unobserve(el);
        var m = /^(\D*)(\d[\d,]*)(\.\d+)?(\D*)$/.exec(el.dataset.mlN); if (!m) return;
        var end = parseFloat((m[2] + (m[3] || '')).replace(/,/g, '')), dec = m[3] ? m[3].length - 1 : 0, t0 = performance.now(), dur = 1100;
        (function tick(t) {
          var p = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - p, 3));
          var s = dec ? v.toFixed(dec) : Math.round(v).toString();
          if (m[2].indexOf(',') > -1) s = Number(s).toLocaleString('en-US');
          el.textContent = m[1] + s + m[4];
          if (p < 1) requestAnimationFrame(tick); else el.textContent = el.dataset.mlN;
        })(t0);
      });
    }, { threshold: 0.4 });
    all('div,span,b,strong').forEach(function (el) {
      if (el.children.length) return;
      var t = (el.textContent || '').trim();
      if (!/^\D{0,2}\d[\d,]*(\.\d+)?\s?(%|\+|k|K)?$/.test(t)) return;
      var fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 26) return;
      el.dataset.mlN = t; io.observe(el);
    });
  }

  /* ---------- 10. Scroll progress + header elevation ---------- */
  function chrome() {
    var bar = d.createElement('div'); bar.id = 'mlprog'; d.body.appendChild(bar);
    var hdr = d.querySelector('#top > div:first-child');
    function on() {
      var h = d.documentElement, max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      if (hdr) hdr.style.boxShadow = h.scrollTop > 8 ? '0 8px 24px -18px rgba(38,39,43,.45)' : 'none';
    }
    addEventListener('scroll', on, { passive: true }); on();
    if (hdr) hdr.style.transition = 'box-shadow .25s ease';
  }


  /* ---------- 11. Logo animation (brand mark draws itself) ---------- */
  function logos() {
    all('svg[aria-label="ModinaLink"]').forEach(function (sv) {
      if (sv.dataset.mlL) return; sv.dataset.mlL = '1';
      all('path', sv).forEach(function (p) { p.setAttribute('pathLength', '1'); });
      if (!RM) {
        sv.classList.add('ml-logo-go');
        var host = sv.closest('a') || sv.parentNode;
        function replay() { sv.classList.remove('ml-logo-go'); void sv.getBoundingClientRect(); sv.classList.add('ml-logo-go'); }
        if (host) host.addEventListener('mouseenter', replay);
      }
    });
  }
  function splash() {
    if (RM || /^\/(portal|admin)/.test(location.pathname)) return;
    try { if (sessionStorage.getItem('mlSplash')) return; sessionStorage.setItem('mlSplash', '1'); } catch (e) { return; }
    var s = d.createElement('div'); s.id = 'mlsplash'; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<svg width="150" height="86" viewBox="20 8 316 182" class="ml-logo-go" aria-label="ModinaLink"><g transform="translate(15 10)" fill="none" stroke-width="27" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" stroke="#26272B" d="M26 164 V57 C26 28 45 22 61 44 L110 108 Q120 122 132 107 L190 35 Q205 20 216 36 M158 111 V161"/><path pathLength="1" stroke="#FF7900" d="M216 36 V139 Q216 158 237 158 H300"/></g></svg>';
    d.body.appendChild(s); setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 1400);
  }
  function logoWatermark() {
    // big outlined brand mark slowly drawing itself behind the hero / CTA
    var h1 = d.querySelector('h1'); if (!h1) return;
    var sec = h1; while (sec && sec !== d.body && !(sec.style && sec.style.position === 'relative')) sec = sec.parentNode; if (!sec || sec === d.body || sec.dataset.mlWm) return; sec.dataset.mlWm = '1';
    var w = svg('<svg viewBox="20 8 316 182" width="520" height="300"><g transform="translate(15 10)" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".10"><path class="ml-draw" style="stroke-dasharray:900;animation-duration:7s" stroke="#26272B" d="M26 164 V57 C26 28 45 22 61 44 L110 108 Q120 122 132 107 L190 35 Q205 20 216 36 M158 111 V161"/><path class="ml-draw" style="stroke-dasharray:900;animation-duration:7s;animation-delay:1.2s" stroke="#FF7900" d="M216 36 V139 Q216 158 237 158 H300"/></g></svg>', 'ml-art ml-hide-sm', 'left:38%;bottom:-40px');
    sec.insertBefore(w, sec.firstChild.nextSibling || null);
  }

  /* ---------- 12. App mode (portal / admin / mobile admin): animate dynamic content ---------- */
  function appMode() {
    if (RM) return;
    var root = d.getElementById('top') || d.body;
    function pop(el, i) {
      if (!el.animate || el.dataset.mlA) return; el.dataset.mlA = '1';
      el.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: Math.min(i, 8) * 50, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    }
    function fillBars(el) {
      all('[style*="width:"][style*="%"]', el).forEach(function (b) {
        var st = b.getAttribute('style') || ''; if (!/border-radius/.test(st) || b.offsetHeight > 16 || b.offsetHeight < 3 || b.dataset.mlB || !b.animate) return;
        b.dataset.mlB = '1'; b.style.transformOrigin = 'left';
        b.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 900, easing: 'cubic-bezier(.2,.7,.2,1)' });
      });
    }
    function count(el) {
      all('div,span,b,strong', el).forEach(function (n) {
        if (n.children.length || n.dataset.mlN) return; var t = (n.textContent || '').trim();
        if (!/^\d[\d,]*$/.test(t) || parseFloat(getComputedStyle(n).fontSize) < 24) return;
        n.dataset.mlN = t; var end = parseInt(t.replace(/,/g, ''), 10), t0 = performance.now();
        (function tick(x) { var p = Math.min(1, (x - t0) / 800), v = Math.round(end * (1 - Math.pow(1 - p, 3))); n.textContent = v.toLocaleString('en-US'); if (p < 1) requestAnimationFrame(tick); else n.textContent = t; })(t0);
      });
    }
    var mo = new MutationObserver(function (muts) {
      var i = 0;
      muts.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes, function (n) {
          if (n.nodeType !== 1 || n.id === 'mlprog' || n.id === 'mlsplash') return;
          if (n.offsetHeight > 24 || n.tagName === 'TR' || n.tagName === 'LI') pop(n, i++);
          fillBars(n); count(n);
        });
      });
    });
    mo.observe(root, { childList: true, subtree: true });
    // initial content
    all('[style*="border-radius:1"]', root).slice(0, 60).forEach(function (el, i) { if (el.offsetHeight > 40) pop(el, i); });
    fillBars(root); count(root);
    var st2 = d.createElement('style'); st2.textContent = '#top [style*="border-radius:1"]{transition:box-shadow .25s ease,transform .25s ease}#top [style*="border-radius:1"]:hover{box-shadow:0 14px 32px -20px rgba(255,121,0,.35)}tr{transition:background .2s ease}tr:hover{background:rgba(255,121,0,.05)}'; d.head.appendChild(st2);
  }

  /* ---------- run ---------- */
  function run() {
    var APP = /^\/(portal|admin)/.test(location.pathname) || !!d.querySelector('script[src="/portal-app.js"]');
    try { logos(); } catch (e) {}
    if (APP) { try { appMode(); } catch (e) {} try { chrome(); } catch (e) {} return; }
    try { splash(); } catch (e) {}
    try { scenes(); } catch (e) {}
    try { heroArt(); } catch (e) {}
    try { logoWatermark(); } catch (e) {}
    try { mainExtras(); } catch (e) {}
    try { iconAnim(); } catch (e) {}
    try { dots(); } catch (e) {}
    if (!RM) { try { chrome(); } catch (e) {} try { counters(); } catch (e) {} }
    try { reveal(); } catch (e) {}
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', run); else run();
  // content hydrated later by other scripts (prices, filters)
  setTimeout(function () { try { scenes(); dots(); logos(); } catch (e) {} }, 1500);
})();
