/* Dauren & Aliya — invitation: Lenis + GSAP ScrollTrigger */
(function () {
  gsap.registerPlugin(ScrollTrigger);
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- плавный скролл ---------- */
  if (!reduced) {
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- hero: медленный зум + каскад типографики ---------- */
  if (!reduced) {
    gsap.to('#heroImg', { scale: 1, duration: 3.4, ease: 'power2.out' });
    gsap.from('[data-ht]', {
      opacity: 0, y: 34, duration: 1.3, ease: 'power3.out', stagger: 0.14, delay: 0.3
    });
    gsap.from('.spark', {
      opacity: 0, scale: 0, duration: 1, ease: 'back.out(2)', stagger: 0.2, delay: 1.2
    });
    // лёгкий параллакс фото при скролле
    gsap.to('#heroImg', {
      yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- reveal ---------- */
  gsap.utils.toArray('.rv').forEach(function (el) {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: el.closest('footer') ? 'top 99%' : 'top 88%' }
    });
  });
  gsap.utils.toArray('.rv-img').forEach(function (el) {
    var img = el.querySelector('img');
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } })
      .to(el, { clipPath: 'inset(0% 0 0% 0)', duration: 1.3, ease: 'power4.inOut' })
      .from(img, { scale: 1.22, duration: 1.3, ease: 'power4.inOut' }, 0);
  });

  /* ---------- параллакс в полноширинных фото ---------- */
  if (!reduced) {
    gsap.utils.toArray('.par').forEach(function (el) {
      gsap.fromTo(el, { yPercent: -7 }, {
        yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------- курсор: точка + белое кольцо ---------- */
  if (matchMedia('(pointer: fine)').matches) {
    document.documentElement.classList.add('has-cursor');
    var cur = document.createElement('div');
    cur.id = 'cursor';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<div class="c-ring"></div><div class="c-dot"></div>';
    document.body.appendChild(cur);

    var dot = cur.querySelector('.c-dot');
    var ring = cur.querySelector('.c-ring');
    var dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2' });
    var dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2' });
    var ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    var ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    var shown = false;

    window.addEventListener('mousemove', function (e) {
      if (!shown) {
        shown = true;
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        gsap.to(cur, { opacity: 1, duration: 0.3 });
      }
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    });
    document.documentElement.addEventListener('mouseleave', function () {
      shown = false;
      gsap.to(cur, { opacity: 0, duration: 0.25 });
    });
    window.addEventListener('mousedown', function () { cur.classList.add('is-press'); });
    window.addEventListener('mouseup', function () { cur.classList.remove('is-press'); });
    document.addEventListener('mouseover', function (e) {
      cur.classList.toggle('is-link', !!e.target.closest('a, button'));
    });

  }

  /* ---------- обратный отсчёт ---------- */
  var cd = document.getElementById('countdown');
  if (cd) {
    var target = new Date(cd.dataset.date).getTime();
    function pad(n) { return n < 10 ? '0' + n : String(n); }
    function setAll(key, val) {
      document.querySelectorAll('[data-cd="' + key + '"]').forEach(function (el) {
        el.textContent = val;
      });
    }
    function tick() {
      var diff = Math.max(0, target - Date.now());
      setAll('d', String(Math.floor(diff / 86400000)));
      setAll('h', pad(Math.floor(diff / 3600000) % 24));
      setAll('m', pad(Math.floor(diff / 60000) % 60));
      setAll('s', pad(Math.floor(diff / 1000) % 60));
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- i18n RU / QAZ ---------- */
  var I18N = window.INV_I18N || {};
  var nodes = document.querySelectorAll('[data-i18n]');
  var ru = {};
  nodes.forEach(function (n) {
    if (!(n.dataset.i18n in ru)) ru[n.dataset.i18n] = n.innerHTML;
  });
  I18N.ru = ru;
  var lang = localStorage.getItem('da-lang') || 'ru';

  function setLang(l) {
    if (!I18N[l]) l = 'ru';
    lang = l;
    localStorage.setItem('da-lang', l);
    nodes.forEach(function (n) {
      var v = I18N[l][n.dataset.i18n];
      if (v == null) v = ru[n.dataset.i18n];
      if (v != null) n.innerHTML = v.replace(/\n/g, '<br>');
    });
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.lang === l);
    });
    document.documentElement.lang = l === 'kk' ? 'kk' : 'ru';
  }

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });
  if (lang !== 'ru') setLang(lang);

  ScrollTrigger.refresh();
})();
