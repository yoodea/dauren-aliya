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

    /* ---------- пышное облачко за курсором ---------- */
    if (!reduced) {
      var cv = document.createElement('canvas');
      cv.id = 'cloud';
      cv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cv);
      var ctx = cv.getContext('2d');
      // рисуем в половинном разрешении: браузер растягивает канвас с
      // билинейным сглаживанием — края облака получаются мягкие, без пикселей
      var dpr = 0.55;
      function sizeCloud() {
        cv.width = Math.max(1, Math.round(innerWidth * dpr));
        cv.height = Math.max(1, Math.round(innerHeight * dpr));
      }
      sizeCloud();
      window.addEventListener('resize', sizeCloud);

      // облако = кластер круглых «долек», как кучевое
      var LIFE = 0.55; // секунд — быстро пропадает
      var puffs = [];
      var px = null, py = null;

      function spawnCloud(x, y) {
        var lobes = 4 + (Math.random() * 3 | 0); // 4–6 долек — пышнее
        for (var i = 0; i < lobes; i++) {
          var a = Math.random() * Math.PI * 2;
          var d = Math.random() * 20 * dpr;
          puffs.push({
            x: x + Math.cos(a) * d,
            y: y + Math.sin(a) * d,
            r: (16 + Math.random() * 22) * dpr,
            rise: (8 + Math.random() * 14) * dpr,
            born: performance.now()
          });
        }
        if (puffs.length > 650) puffs.splice(0, puffs.length - 650);
      }

      window.addEventListener('mousemove', function (e) {
        var x = e.clientX * dpr, y = e.clientY * dpr;
        if (px === null) { px = x; py = y; return; }
        var dx = x - px, dy = y - py;
        var dist = Math.sqrt(dx * dx + dy * dy);
        // шаг плотнее — след сплошной, без «ступенек»
        var steps = Math.max(1, Math.ceil(dist / (8 * dpr)));
        for (var i = 1; i <= steps; i++) {
          spawnCloud(px + dx * (i / steps), py + dy * (i / steps));
        }
        px = x; py = y;
      });

      gsap.ticker.add(function () {
        if (!puffs.length) return;
        ctx.clearRect(0, 0, cv.width, cv.height);
        var now = performance.now();
        var alive = [];
        for (var i = 0; i < puffs.length; i++) {
          var p = puffs[i];
          var t = (now - p.born) / (LIFE * 1000);
          if (t >= 1) continue;
          alive.push(p);
          var fade = (1 - t) * (1 - t);
          var r = p.r * (1 + t * 0.6);            // распухает
          var y2 = p.y - p.rise * t;              // всплывает вверх
          // плотная золотая вата: яркая сердцевина, чёткий край, мягкий ореол
          var g = ctx.createRadialGradient(p.x, y2, 0, p.x, y2, r);
          g.addColorStop(0, 'rgba(255,240,214,' + (0.55 * fade).toFixed(3) + ')');
          g.addColorStop(0.5, 'rgba(236,187,106,' + (0.42 * fade).toFixed(3) + ')');
          g.addColorStop(0.8, 'rgba(226,169,78,' + (0.18 * fade).toFixed(3) + ')');
          g.addColorStop(1, 'rgba(226,169,78,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, y2, r, 0, Math.PI * 2);
          ctx.fill();
        }
        puffs = alive;
        if (!puffs.length) ctx.clearRect(0, 0, cv.width, cv.height);
      });
    }
  }

  /* ---------- обратный отсчёт ---------- */
  var cd = document.getElementById('countdown');
  if (cd) {
    var target = new Date(cd.dataset.date).getTime();
    var cells = {
      d: cd.querySelector('[data-cd="d"]'),
      h: cd.querySelector('[data-cd="h"]'),
      m: cd.querySelector('[data-cd="m"]'),
      s: cd.querySelector('[data-cd="s"]')
    };
    function pad(n) { return n < 10 ? '0' + n : String(n); }
    function tick() {
      var diff = Math.max(0, target - Date.now());
      var d = Math.floor(diff / 86400000);
      var h = Math.floor(diff / 3600000) % 24;
      var m = Math.floor(diff / 60000) % 60;
      var s = Math.floor(diff / 1000) % 60;
      cells.d.textContent = String(d);
      cells.h.textContent = pad(h);
      cells.m.textContent = pad(m);
      cells.s.textContent = pad(s);
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
