/* ============================================================
   EL CAPO — script.js
   Interacciones globales de portada (presentación).
   Alcance: header, navegación por anclas, horario abierto/cerrado,
   revelado suave y marquee. Solo mejora visual, sin almacenamiento.
   ============================================================ */
(function () {
  'use strict';

  var prefersReducedMotion = false;
  try {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) {
    prefersReducedMotion = false;
  }

  /* ---------- 1. Sombra del header al hacer scroll ---------- */
  var header = document.querySelector('.topbar');
  function onScrollHeader() {
    if (!header) return;
    var y = window.scrollY || window.pageYOffset || 0;
    if (y > 8) {
      header.style.boxShadow = '0 10px 30px rgba(0,0,0,.45)';
    } else {
      header.style.boxShadow = 'none';
    }
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 2. Scroll suave para anclas internas ---------- */
  document.addEventListener('click', function (ev) {
    var link = ev.target && ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var id = link.getAttribute('href');
    if (!id || id === '#') return;
    var target = document.querySelector(id);
    if (!target) return;
    ev.preventDefault();
    try {
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    } catch (e) {
      target.scrollIntoView();
    }
    try {
      history.replaceState(null, '', id);
    } catch (e2) { /* sin historial disponible */ }
  });

  /* ---------- 3. Horario abierto / cerrado (solo lectura) ---------- */
  function formatHour(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var suffix = h >= 12 ? 'p.m.' : 'a.m.';
    var h12 = h % 12 || 12;
    return h12 + ':' + String(m).padStart(2, '0') + ' ' + suffix;
  }
  function paintSchedule() {
    var pill = document.getElementById('open-pill');
    var today = document.getElementById('today-hours');
    if (!pill && !today) return;
    var now = new Date();
    var day = now.getDay(); // 0 = domingo
    var mins = now.getHours() * 60 + now.getMinutes();
    var range;
    if (day === 0) range = [9 * 60, 15 * 60];
    else if (day === 6) range = [8 * 60, 22 * 60];
    else range = [7 * 60, 21 * 60];
    var isOpen = mins >= range[0] && mins < range[1];
    if (today) {
      today.textContent = formatHour(range[0]) + ' – ' + formatHour(range[1]);
    }
    if (pill) {
      pill.textContent = isOpen
        ? '● Abierto ahora • cierra ' + formatHour(range[1])
        : '● Cerrado ahora • abre ' + formatHour(range[0]);
      pill.setAttribute('data-open', isOpen ? 'true' : 'false');
      pill.style.borderColor = isOpen ? '#1f7a5a' : '#7a3a1f';
      pill.style.color = isOpen ? '#7bf0c4' : '#ffcc99';
    }
  }
  paintSchedule();
  window.setInterval(paintSchedule, 60000);

  /* ---------- 4. Resaltado de sección activa en el nav ---------- */
  try {
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
    var sections = navLinks
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);
    if (navLinks.length && sections.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
      var activeId = null;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) activeId = '#' + entry.target.id;
        });
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === activeId) {
            a.setAttribute('aria-current', 'true');
            a.style.color = 'var(--amber, #ffb703)';
          } else {
            a.removeAttribute('aria-current');
            a.style.color = '';
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
      sections.forEach(function (s) { observer.observe(s); });
    }
  } catch (err) { /* mejora progresiva: sin resaltado */ }

  /* ---------- 5. Revelado suave de tarjetas (progresivo) ---------- */
  try {
    var revealNodes = document.querySelectorAll('.card, .dish, .step, .panel');
    if (revealNodes.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
      revealNodes.forEach(function (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(14px)';
        el.style.transition = 'opacity .5s ease, transform .5s ease';
      });
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      revealNodes.forEach(function (el) { revealObserver.observe(el); });
    }
  } catch (err) { /* contenido visible por defecto */ }

  /* ---------- 6. Marquee: pausar al pasar el cursor ---------- */
  var marquee = document.querySelector('.marquee');
  if (marquee && !prefersReducedMotion) {
    marquee.addEventListener('mouseenter', function () {
      marquee.style.opacity = '.75';
    });
    marquee.addEventListener('mouseleave', function () {
      marquee.style.opacity = '1';
    });
  }

  /* ---------- 7. Año dinámico si el footer lo prevé ---------- */
  var yearSlot = document.querySelector('[data-year]');
  if (yearSlot) {
    yearSlot.textContent = String(new Date().getFullYear());
  }
})();
