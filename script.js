/* AP Associates – shared behaviour */
(function () {
  'use strict';

  var PHONE = '919633262728';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ls(get, k, v) {
    try { if (get) return localStorage.getItem(k); localStorage.setItem(k, v); }
    catch (e) { return null; }
  }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }

  /* ---------- Header, progress bar, parallax ---------- */
  var hdr = $('.hdr');
  var prog = $('#progress');
  var par = $$('[data-parallax]');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || 0;
    if (hdr) hdr.classList.toggle('scrolled', y > 24);
    if (prog) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    }
    if (!reduce && y < 1000) {
      par.forEach(function (el) {
        el.style.transform = 'translate3d(0,' + (y * parseFloat(el.getAttribute('data-parallax') || '0.08')).toFixed(1) + 'px,0)';
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var btn = $('#menuBtn'), panel = $('#navPanel');
  function closeMenu() {
    if (!panel) return;
    panel.classList.remove('open');
    if (hdr) hdr.classList.remove('menu-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  if (btn && panel) {
    btn.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      if (hdr) hdr.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 768) closeMenu(); });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  reveals.forEach(function (el) {
    var d = el.getAttribute('data-delay');
    if (d) el.style.transitionDelay = d + 'ms';
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Count-up numbers ---------- */
  var counters = $$('[data-count]');
  function runCount(el) {
    var end = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduce) { el.textContent = end; return; }
    var start = null, dur = 1100;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    counters.forEach(function (c) { c.textContent = '0'; });
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- FAQ accordion ---------- */
  var accs = $$('.acc-item');
  accs.forEach(function (item) {
    var b = $('.acc-btn', item);
    b.addEventListener('click', function () {
      var willOpen = !item.classList.contains('open');
      accs.forEach(function (o) {
        o.classList.remove('open');
        $('.acc-btn', o).setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('open');
        b.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Image fallback (if a dummy image fails to load) ---------- */
  var fallback = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#1d3262"/><text x="50%" y="50%" fill="#b8935a" font-family="serif" font-size="42" text-anchor="middle">AP Associates</text></svg>');
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && !t.getAttribute('data-fb')) {
      t.setAttribute('data-fb', '1');
      t.src = fallback;
    }
  }, true);

  /* ---------- Lightbox ---------- */
  var items = $$('[data-lightbox]');
  if (items.length) {
    var lb = document.createElement('div');
    lb.className = 'fixed inset-0 z-[1100] hidden items-center justify-center bg-ink/95 p-4';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML =
      '<button type="button" id="lbClose" aria-label="Close" class="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">&times;</button>' +
      '<button type="button" id="lbPrev" aria-label="Previous" class="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">&#8249;</button>' +
      '<figure class="max-h-full max-w-5xl"><img id="lbImg" alt="" class="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"><figcaption id="lbCap" class="mt-3 text-center text-sm text-white/80"></figcaption></figure>' +
      '<button type="button" id="lbNext" aria-label="Next" class="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">&#8250;</button>';
    document.body.appendChild(lb);
    var idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + items.length) % items.length;
      var it = items[idx];
      $('#lbImg').src = it.getAttribute('data-full');
      $('#lbImg').alt = it.getAttribute('data-cap') || '';
      $('#lbCap').textContent = it.getAttribute('data-cap') || '';
    }
    function openLb(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.remove('hidden'); lb.classList.add('flex', 'modal-fade');
      document.body.classList.add('no-scroll');
      $('#lbClose').focus();
    }
    function closeLb() {
      lb.classList.add('hidden'); lb.classList.remove('flex', 'modal-fade');
      document.body.classList.remove('no-scroll');
      if (lastFocus) lastFocus.focus();
    }
    items.forEach(function (it, i) { it.addEventListener('click', function () { openLb(i); }); });
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', function () { show(idx - 1); });
    $('#lbNext').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (lb.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------- Language toggle ---------- */
  var langBtn = $('#langBtn');
  function setLang(lang) {
    $$('[data-ml]').forEach(function (n) {
      if (!n.hasAttribute('data-en')) n.setAttribute('data-en', n.textContent.trim());
      n.textContent = lang === 'ml' ? n.getAttribute('data-ml') : n.getAttribute('data-en');
    });
    document.documentElement.lang = lang === 'ml' ? 'ml' : 'en';
    if (langBtn) langBtn.textContent = lang === 'ml' ? 'English' : 'മലയാളം';
    ls(false, 'ap_lang', lang);
  }
  if (langBtn) langBtn.addEventListener('click', function () {
    setLang(document.documentElement.lang === 'ml' ? 'en' : 'ml');
  });

  /* ---------- Disclaimer pop-up (first visit) ---------- */
  if (!document.body.hasAttribute('data-no-modal') && ls(true, 'ap_disclaimer') !== 'yes') {
    var m = document.createElement('div');
    m.className = 'modal-fade fixed inset-0 z-[1000] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-md';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-labelledby', 'dmTitle');
    m.innerHTML =
      '<div class="modal-pop max-h-[92vh] w-full max-w-xl overflow-auto rounded-xl bg-white p-7 shadow-2xl sm:p-9">' +
      '<div class="mb-4 flex items-center gap-3">' +
      '<img src="/images/ap_logo.webp" alt="logo" class="h-14 w-14 rounded-md object-cover">' +
      '<h2 id="dmTitle" class="font-display text-2xl font-bold text-ink" data-ml="നിരാകരണം">Disclaimer</h2></div>' +
      '<div class="space-y-3 text-[15px] leading-relaxed text-slate-600">' +
      '<p>As per the rules of the Bar Council of India, advocates are not permitted to solicit work or advertise. By clicking "I Agree", the user acknowledges that there has been no advertisement, solicitation, invitation or inducement of any sort from Adv. Abijith Prasad or AP Associates, and that the user wishes to obtain information about the office for their own use.</p>' +
      '<p>The information on this website is for general information only and does not constitute legal advice. Visiting or using this website does not create an advocate–client relationship. AP Associates is not liable for any action taken on the basis of the content of this website.</p></div>' +
      '<div class="mt-6 flex flex-wrap gap-3">' +
      '<button type="button" id="agreeBtn" class="btn btn-ink" data-ml="ഞാൻ സമ്മതിക്കുന്നു">I Agree</button>' +
      '<a class="btn btn-line" href="disclaimer.html" data-ml="പൂർണ്ണ നിരാകരണം വായിക്കുക">Read full disclaimer</a></div></div>';
    document.body.appendChild(m);
    document.body.classList.add('no-scroll');
    var agree = $('#agreeBtn');
    agree.focus();
    agree.addEventListener('click', function () {
      ls(false, 'ap_disclaimer', 'yes');
      m.remove();
      document.body.classList.remove('no-scroll');
    });
    m.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('button,a', m), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  if (ls(true, 'ap_lang') === 'ml') setLang('ml');

  /* ---------- Contact form -> WhatsApp ---------- */
  var form = $('#waForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var text = 'Hello, I would like to enquire about an appointment.\n' +
        'Name: ' + f['name'].value.trim() + '\n' +
        'Phone: ' + f['phone'].value.trim() + '\n' +
        'Matter: ' + f['topic'].value +
        (f['message'].value.trim() ? '\nDetails: ' + f['message'].value.trim() : '');
      window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }

  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();



// ------------------- Hero Fact card slide moving -----------

(function () {
  var grid = document.getElementById('factsGrid');
  var dots = document.querySelectorAll('#factsDots span');
  if (!grid || !dots.length) return;

  var cards = grid.children;
  var index = 0;
  var timer = null;
  var DELAY = 3500;

  function isMobile() { return window.innerWidth < 640; }

  function setActive(i) {
    index = i;
    dots.forEach(function (d, n) { d.classList.toggle('active', n === i); });
  }

  function goTo(i) {
    if (!isMobile()) return;
    i = (i + cards.length) % cards.length;
    grid.scrollTo({ left: cards[i].offsetLeft - grid.offsetLeft, behavior: 'smooth' });
    setActive(i);
  }

  function start() {
    stop();
    if (!isMobile()) return;
    timer = setInterval(function () { goTo(index + 1); }, DELAY);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  // swipe ചെയ്യുമ്പോൾ dots update ആകാൻ
  var scrollTimer;
  grid.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      var w = cards[0].offsetWidth;
      if (w) setActive(Math.round(grid.scrollLeft / w));
    }, 80);
  }, { passive: true });

  // touch ചെയ്യുമ്പോൾ pause, വിട്ടാൽ resume
  grid.addEventListener('touchstart', stop, { passive: true });
  grid.addEventListener('touchend', function () { setTimeout(start, 2500); }, { passive: true });

  // tab hidden ആകുമ്പോൾ pause
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });

  window.addEventListener('resize', start);
  start();
})();


// ------------------- Whatapp / Call button mobile view----------

(function () {
  var fab = document.getElementById('fab');
  var btn = document.getElementById('fabMain');
  if (!fab || !btn) return;

  function toggle(open) {
    fab.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggle(!fab.classList.contains('open'));
  });

  // പുറത്ത് tap ചെയ്താൽ close
  document.addEventListener('click', function (e) {
    if (!fab.contains(e.target)) toggle(false);
  });

  // item click ചെയ്താൽ close
  fab.querySelectorAll('.fab-item').forEach(function (a) {
    a.addEventListener('click', function () { toggle(false); });
  });
})();