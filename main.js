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

  function goTo(target, top = false) {
    closeMenu();
    const y = top ? 0 : target.getBoundingClientRect().top + window.scrollY - barH();
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    if (!top) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#top' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    if (a.dataset.treat) setTreat(a.dataset.treat);
    goTo(target, id === '#top');
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
  let pending = $$('[data-reveal], [data-drift], [data-list], [data-price], .gallery, .foot');
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

  /* ---------- reservar cita ----------
     La página no guarda nada: arma la reserva y la abre en el WhatsApp del consultorio.
     Días y horas de atención por confirmar con la doctora (lunes a sábado; sábados solo en la mañana). */
  const form = $('#reserva');
  const treatSel = $('#bf-treat');
  const daysBox = $('#bf-days');
  const slotsBox = $('#bf-slots');
  const timeHint = $('#bf-time-hint');
  const summary = $('#bf-summary');
  const done = $('#bf-done');
  const MORNING = ['8:00', '9:00', '10:00', '11:00'];
  const AFTERNOON = ['2:00', '3:00', '4:00', '5:00'];
  const DAYS_AHEAD = 12;
  const tidy = (s) => s.replace(/\./g, '');
  const fWeek = new Intl.DateTimeFormat('es-CO', { weekday: 'short' });
  const fMonth = new Intl.DateTimeFormat('es-CO', { month: 'short' });
  const fLong = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  const days = [];
  const cursor = new Date(); cursor.setHours(12, 0, 0, 0);
  while (days.length < DAYS_AHEAD) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor.getDay() !== 0) days.push(new Date(cursor));
  }
  daysBox.innerHTML = days.map((d, i) =>
    `<label class="bf-chip"><input type="radio" name="dia" value="${i}" aria-label="${fLong.format(d)}"><span><i>${tidy(fWeek.format(d))}</i><b>${d.getDate()}</b><i>${tidy(fMonth.format(d))}</i></span></label>`
  ).join('');

  function chosen(name) { const el = form.querySelector(`input[name="${name}"]:checked`); return el ? el.value : ''; }
  function renderSlots() {
    const i = chosen('dia');
    if (i === '') { slotsBox.innerHTML = ''; timeHint.hidden = false; timeHint.textContent = 'Primero elige un día.'; return; }
    const sat = days[+i].getDay() === 6;
    const prev = chosen('hora');
    const list = MORNING.map((t) => `${t} a. m.`).concat(sat ? [] : AFTERNOON.map((t) => `${t} p. m.`));
    slotsBox.innerHTML = list.map((t) => {
      const [h, ...ap] = t.split(' ');
      return `<label class="bf-chip"><input type="radio" name="hora" value="${t}"${t === prev ? ' checked' : ''}><span><b>${h}</b><i>${ap.join(' ')}</i></span></label>`;
    }).join('');
    timeHint.hidden = !sat;
    timeHint.textContent = 'Los sábados atendemos en la mañana.';
  }
  function updateSummary() {
    const i = chosen('dia'), t = chosen('hora');
    const parts = [treatSel.value];
    parts.push(i === '' ? 'elige día y hora' : fLong.format(days[+i]) + (t ? ` · ${t}` : ' · elige la hora'));
    summary.textContent = parts.join(' · ');
  }
  function setTreat(name) {
    const opt = Array.from(treatSel.options).find((o) => o.text === name);
    if (opt) treatSel.value = opt.value;
    updateSummary();
  }
  const errs = {
    dia: $('#bf-day-err'), hora: $('#bf-time-err'), nombre: $('#bf-name-err'), celular: $('#bf-phone-err'), ok: $('#bf-ok-err')
  };
  function showErr(key, on, field) {
    errs[key].hidden = !on;
    if (field) field.setAttribute('aria-invalid', on ? 'true' : 'false');
  }
  form.addEventListener('change', (e) => {
    if (e.target.name === 'dia') { renderSlots(); showErr('dia', false); }
    if (e.target.name === 'hora') showErr('hora', false);
    if (e.target.id === 'bf-ok' && e.target.checked) showErr('ok', false);
    updateSummary();
  });
  form.addEventListener('input', (e) => {
    if (e.target.id === 'bf-name') showErr('nombre', false, e.target);
    if (e.target.id === 'bf-phone') showErr('celular', false, e.target);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#bf-name'), phone = $('#bf-phone'), ok = $('#bf-ok');
    let digits = phone.value.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('57')) digits = digits.slice(2);
    const checks = [
      ['dia', chosen('dia') !== '', daysBox.querySelector('input')],
      ['hora', chosen('hora') !== '', slotsBox.querySelector('input') || daysBox.querySelector('input')],
      ['nombre', name.value.trim().length >= 3, name],
      ['celular', /^3\d{9}$/.test(digits), phone],
      ['ok', ok.checked, ok]
    ];
    let first = null;
    checks.forEach(([key, good, el]) => {
      showErr(key, !good, key === 'nombre' || key === 'celular' ? el : null);
      if (!good && !first) first = el;
    });
    if (first) { first.focus(); return; }
    const note = $('#bf-note').value.trim();
    const lines = [
      'Hola Dra. Marleydis, quiero reservar una cita.',
      '',
      `Tratamiento: ${treatSel.value}`,
      `Día: ${fLong.format(days[+chosen('dia')])}`,
      `Hora: ${chosen('hora')}`,
      `Nombre: ${name.value.trim()}`,
      `Celular: ${digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}`,
      `Primera cita: ${chosen('primera')}`
    ];
    if (note) lines.push(`Comentario: ${note}`);
    const url = WA + encodeURIComponent(lines.join('\n'));
    const w = window.open(url, '_blank');
    if (w) w.opener = null; else window.location.href = url;
    $('#bf-done-link').href = url;
    done.hidden = false;
    done.focus();
  });
  $('#bf-again').addEventListener('click', () => {
    form.reset();
    done.hidden = true;
    renderSlots();
    updateSummary();
    Object.keys(errs).forEach((k) => showErr(k, false));
    treatSel.focus();
  });
  renderSlots();
  updateSummary();

  /* ---------- cada tratamiento lleva a la reserva con su nombre ya elegido ---------- */
  $$('[data-wa]').forEach((a) => {
    a.href = WA + encodeURIComponent(`Hola Dra. Marleydis, quiero información sobre ${a.dataset.wa}.`);
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      setTreat(a.querySelector('.svc').textContent.trim());
      goTo($('#reservar'));
    });
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
