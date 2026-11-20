/* Dra. Marleydis Blanco Méndez — comportamiento de la página.
   Todo el contenido es visible sin este archivo; aquí solo se añade movimiento y lo vivo. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const WA = 'https://wa.me/573183683665?text=';

  /* ---------- desplazamiento suave ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const bar = $('.bar');
  const barH = () => bar.getBoundingClientRect().height;

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#top' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    const y = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - barH();
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    if (id !== '#top') target.setAttribute('tabindex', '-1'), target.focus({ preventScroll: true });
  });

  /* ---------- menú del celular ---------- */
  const menuBtn = $('.menu-btn');
  const menu = $('#menu');
  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = 'Menú';
  }
  menuBtn.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Cerrar' : 'Menú';
    if (open) $('a', menu).focus();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenu(); } });

  /* ---------- entrada del hero: el campo negro sube y "Blanco" se vuelve blanco ---------- */
  const stage = $('.hero-stage');
  const start = () => { stage.classList.add('is-ready'); bar.classList.add('is-ready'); };
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 350))]) : Promise.resolve();
  fontsReady.then(() => requestAnimationFrame(() => requestAnimationFrame(start)));

  /* la sonrisa dentro de la frase */
  const slotCrops = $$('.copy-a .slot .crop');
  if (slotCrops.length > 1 && !reduce) {
    let k = 0;
    setInterval(() => {
      slotCrops[k].classList.remove('on');
      k = (k + 1) % slotCrops.length;
      slotCrops[k].classList.add('on');
    }, 3000);
  }

  /* ---------- la barra toma el color del capítulo que tiene debajo ---------- */
  const zones = $$('main [data-ground], footer[data-ground]');
  let lastGround = '';
  function paintBar() {
    const y = barH() / 2;
    let g = 'pearl';
    for (const z of zones) {
      const r = z.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) g = z.dataset.ground;
    }
    if (g !== lastGround) { bar.dataset.ground = g; lastGround = g; }
  }

  /* ---------- una foto, tres distancias ---------- */
  const track = $('.show-track');
  const showStage = $('.show-stage');
  const showImg = $('.show-window img');
  const stops = [
    { s: 1, x: 0.5, y: 0.5 },
    { s: 1.8, x: 0.646, y: 0.214 },   // su sonrisa
    { s: 3.2, x: 0.68, y: 0.414 }     // el logo bordado
  ];
  let lastStage = 0;
  function setStage(n) {
    if (n === lastStage) return;
    lastStage = n;
    showStage.dataset.stage = String(n);
    const { s, x, y } = stops[n - 1];
    const clamp = (v) => Math.min(0, Math.max(1 - s, v));
    const tx = clamp(0.5 - s * x) * 100;
    const ty = clamp(0.5 - s * y) * 100;
    showImg.style.transformOrigin = '0 0';
    showImg.style.transform = `translate(${tx}%, ${ty}%) scale(${s})`;
  }
  function stageFromScroll() {
    const r = track.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    setStage(p < 0.3 ? 1 : p < 0.66 ? 2 : 3);
  }
  setStage(1);

  /* ---------- entradas por sección ---------- */
  $$('[data-list]').forEach((list) => Array.from(list.children).forEach((c, i) => c.style.setProperty('--i', i)));
  // Comprobado en cada scroll (no con IntersectionObserver): un salto por un ancla o un scroll
  // programático también revela lo que quedó atrás, y nada se queda escondido.
  let pending = $$('[data-reveal], [data-list], [data-price], .gallery, .foot');
  function reveal() {
    if (!pending.length) return;
    const line = window.innerHeight * 0.88;
    pending = pending.filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < line && (r.bottom > 0 || r.height === 0 || r.top < 0)) { el.classList.add('is-in'); return false; }
      return true;
    });
  }

  /* ---------- antes y después ---------- */
  const cmp = $('.cmp');
  const range = $('.cmp-range');
  const cases = [
    { src: 'assets/ig/ig-001.jpg', before: 80, after: 800, name: 'Rehabilitación oral',
      altB: 'Antes: sonrisa con dientes inferiores ausentes', altA: 'Después: la sonrisa completa, con los dientes que faltaban reemplazados' },
    { src: 'assets/ig/ig-002.jpg', before: 90, after: 860, name: 'Prótesis parcial',
      altB: 'Antes: sonrisa con dos dientes superiores ausentes', altA: 'Después: sonrisa completa con los dientes superiores reemplazados' }
  ];
  let touched = false;
  const setPos = (v) => {
    const p = Math.max(0, Math.min(100, v));
    cmp.style.setProperty('--pos', p + '%');
    range.value = String(Math.round(p));
  };
  range.addEventListener('input', () => { touched = true; setPos(+range.value); });
  range.style.pointerEvents = 'none';
  let dragging = false;
  const fromEvent = (e) => {
    const r = cmp.getBoundingClientRect();
    setPos(((e.clientX - r.left) / r.width) * 100);
  };
  cmp.addEventListener('pointerdown', (e) => {
    dragging = true; touched = true;
    cmp.classList.add('is-drag');
    cmp.setPointerCapture(e.pointerId);
    fromEvent(e);
  });
  cmp.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
  const stop = () => { dragging = false; cmp.classList.remove('is-drag'); };
  cmp.addEventListener('pointerup', stop);
  cmp.addEventListener('pointercancel', stop);

  const caseBtns = $$('.case');
  const before = $('[data-before]');
  const after = $('[data-after]');
  const caseName = $('.cmp-case-name');
  caseBtns.forEach((btn) => btn.addEventListener('click', () => {
    const c = cases[+btn.dataset.case];
    caseBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    [before, after].forEach((el) => { el.style.opacity = '0'; });
    setTimeout(() => {
      const ib = $('img', before), ia = $('img', after);
      ib.src = c.src; ia.src = c.src;
      ib.alt = c.altB; ia.alt = c.altA;
      before.style.setProperty('--cy', c.before);
      after.style.setProperty('--cy', c.after);
      caseName.textContent = c.name;
      [before, after].forEach((el) => { el.style.opacity = '1'; });
      setPos(50);
    }, reduce ? 0 : 220);
  }));

  /* un vistazo cuando aparece, para invitar a deslizar */
  if (!reduce) {
    const peek = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      peek.disconnect();
      const keys = [[0, 50], [700, 24], [1500, 76], [2300, 50]];
      const t0 = performance.now() + 500;
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        if (touched) return;
        const t = now - t0;
        if (t < 0) return requestAnimationFrame(step);
        let i = keys.findIndex((k) => k[0] > t);
        if (i === -1) { setPos(50); return; }
        const [ta, va] = keys[i - 1], [tb, vb] = keys[i];
        setPos(va + (vb - va) * ease((t - ta) / (tb - ta)));
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    peek.observe(cmp);
  }

  /* ---------- clips de sus reels: solo corren cuando se ven, y nunca con movimiento reducido ---------- */
  const clips = $$('video.loop');
  if (reduce) clips.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
  function playClips() {
    if (reduce) return;
    const H = window.innerHeight;
    clips.forEach((v) => {
      const r = v.getBoundingClientRect();
      const seen = r.bottom > 0 && r.top < H;
      if (seen && v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      else if (!seen && !v.paused) v.pause();
    });
  }

  /* ---------- cada tratamiento abre WhatsApp con su nombre ---------- */
  $$('[data-wa]').forEach((a) => {
    a.href = WA + encodeURIComponent(`Hola Dra. Marleydis, quiero información sobre ${a.dataset.wa}.`);
  });

  /* ---------- bucle de scroll ---------- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { paintBar(); stageFromScroll(); reveal(); playClips(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  paintBar(); stageFromScroll(); reveal(); playClips();
})();
