(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover)').matches;

  $('#yr').textContent = new Date().getFullYear();
  addEventListener('load', () => setTimeout(() => $('#loader').classList.add('done'), 900));
  setTimeout(() => $('#loader').classList.add('done'), 2500); // safety net

  /* typed roles */
  const roles = ['Full-Stack Developer', 'AI Enthusiast', 'Civic-Tech Builder', 'GIS & Geospatial Nerd', 'Hackathon Finalist'];
  const el = $('#typed');
  let r = 0, ch = 0, del = false;
  (function tick() {
    const word = roles[r];
    el.textContent = word.slice(0, ch);
    if (!del && ch === word.length) { del = true; return setTimeout(tick, 1500); }
    if (del && ch === 0) { del = false; r = (r + 1) % roles.length; }
    ch += del ? -1 : 1;
    setTimeout(tick, del ? 35 : 80);
  })();

  /* reveal on scroll */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (e.target.dataset.d || 0) + 'ms';
      e.target.classList.add('in'); io.unobserve(e.target);
      const n = e.target.querySelector('[data-count]'); if (n) count(n);
    }
  }), { threshold: 0.12 });
  $$('.reveal').forEach((n, i) => { n.dataset.d = (i % 3) * 90; io.observe(n); });

  function count(n) {
    const to = +n.dataset.count, suf = n.dataset.suffix || '', t0 = performance.now(), dur = 1800;
    (function f(t) {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      n.textContent = Math.round(to * e).toLocaleString('en-IN') + suf;
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }

  /* nav + progress + active link + timeline fill */
  const nav = $('#nav'), prog = $('#progress'), tl = $('.timeline');
  const secs = $$('main section[id]'), links = $$('#links a:not(.pill)');
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (y / h * 100) + '%';
    nav.classList.toggle('stuck', y > 30);
    let cur = secs[0].id;
    secs.forEach((s) => { if (s.offsetTop - 140 <= y) cur = s.id; });
    links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
    const b = tl.getBoundingClientRect();
    tl.style.setProperty('--tl', Math.max(0, Math.min(100, (innerHeight * 0.6 - b.top) / b.height * 100)) + '%');
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* mobile menu */
  const burger = $('#burger'), menu = $('#links');
  burger.onclick = () => { burger.classList.toggle('open'); menu.classList.toggle('open'); };
  links.concat($('#links .pill')).forEach((a) => a.addEventListener('click', () => { burger.classList.remove('open'); menu.classList.remove('open'); }));

  /* spotlight on cards + 3D tilt */
  $$('.tilt').forEach((c) => {
    c.addEventListener('pointermove', (e) => {
      const b = c.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
      if (fine && !reduce && !c.classList.contains('featured'))
        c.style.transform = `perspective(900px) rotateX(${(y / b.height - .5) * -6}deg) rotateY(${(x / b.width - .5) * 6}deg) translateY(-4px)`;
    });
    c.addEventListener('pointerleave', () => (c.style.transform = ''));
  });

  /* magnetic buttons */
  if (fine && !reduce) $$('.magnetic').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    b.addEventListener('pointerleave', () => (b.style.transform = ''));
  });

  /* custom cursor */
  if (fine) {
    const c = $('#cursor'), d = $('#cursorDot'); let x = 0, y = 0, cx = 0, cy = 0;
    addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; c.style.opacity = d.style.opacity = 1; d.style.transform = `translate(${x}px,${y}px)`; });
    (function loop() { cx += (x - cx) * .16; cy += (y - cy) * .16; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
    $$('a,button,.chips span,.stack span').forEach((n) => { n.addEventListener('pointerenter', () => c.classList.add('hover')); n.addEventListener('pointerleave', () => c.classList.remove('hover')); });
  }

  /* particle network background */
  const cv = $('#bg'), g = cv.getContext('2d'); let W, H, pts = [], mouse = { x: -999, y: -999 };
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    pts = Array.from({ length: Math.min(90, Math.floor(innerWidth / 16)) }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }));
  }
  size(); addEventListener('resize', size);
  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  (function draw() {
    g.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1; if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      g.fillStyle = 'rgba(160,150,255,.55)'; g.beginPath(); g.arc(p.x, p.y, 1.5, 0, 6.3); g.fill();
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = dx * dx + dy * dy;
        if (d < 14000) { g.strokeStyle = `rgba(124,92,255,${.22 * (1 - d / 14000)})`; g.beginPath(); g.moveTo(pts[i].x, pts[i].y); g.lineTo(pts[j].x, pts[j].y); g.stroke(); }
      }
      const mx = pts[i].x - mouse.x, my = pts[i].y - mouse.y, md = mx * mx + my * my;
      if (md < 22000) { g.strokeStyle = `rgba(34,211,238,${.45 * (1 - md / 22000)})`; g.beginPath(); g.moveTo(pts[i].x, pts[i].y); g.lineTo(mouse.x, mouse.y); g.stroke(); }
    }
    if (!reduce) requestAnimationFrame(draw);
  })();

  console.log('%cHey 👋 curious dev!', 'font:700 18px monospace;color:#7c5cff', '\nLet\'s build something that matters → github.com/lokeshm2845');

  /* profile modal */
  const modal = $('#profile'), pbtn = $('#profileBtn');
  const setModal = (open) => {
    modal.classList.toggle('open', open); document.body.classList.toggle('lock', open);
    if (open) $('.modal-x', modal).focus(); else pbtn.focus();
  };
  pbtn.addEventListener('click', () => setModal(true));
  $$('[data-close]', modal).forEach((n) => n.addEventListener('click', () => setModal(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) setModal(false); });
})();
