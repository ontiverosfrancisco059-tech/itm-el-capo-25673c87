/* EL CAPO — script.js (home / presentación)
   Solo mejora visual de index.html:
   - sombra del encabezado al hacer scroll
   - resaltado de sección activa en la navegación
   - aparición suave de tarjetas y platillos
   - aviso de horario abierto / cerrado
   - botón volver arriba + año en pie de página
   No gestiona catálogo: el catálogo vive únicamente en /tienda/.
   No usa almacenamiento del navegador.
*/
(function () {
  'use strict';

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Estilos mínimos inyectados (sin tocar styles.css) ---------- */
  function injectStyles() {
    var css =
      '.capo-reveal{opacity:0;transform:translateY(18px);transition:opacity .6s ease,transform .6s ease}' +
      '.capo-reveal.is-visible{opacity:1;transform:none}' +
      '@media(prefers-reduced-motion:reduce){.capo-reveal{opacity:1;transform:none;transition:none}}' +
      'header.nav.is-scrolled{box-shadow:0 6px 24px rgba(0,0,0,.55)}' +
      'nav.links a.is-active{border-color:#ffc107;color:#ffc107;background:rgba(255,193,7,.12)}' +
      '.capo-status{display:inline-block;margin-top:.7rem;font-family:Verdana,Arial,sans-serif;font-size:.8rem;font-weight:700;' +
      'border:2px solid #ffc107;border-radius:999px;padding:.35rem .85rem;background:rgba(255,193,7,.12);color:#ffc107}' +
      '.capo-status.closed{border-color:#ff8a8a;color:#ffb4ab;background:rgba(193,18,31,.18)}' +
      '.capo-count{font-family:Verdana,Arial,sans-serif;font-size:.82rem;color:#f5d7a1;margin-top:1rem;text-align:center}' +
      '#capo-top{position:fixed;right:1rem;bottom:1rem;z-index:30;width:48px;height:48px;border-radius:50%;' +
      'border:3px solid #000;background:#ffc107;color:#000;font-size:1.3rem;font-weight:900;cursor:pointer;' +
      'box-shadow:3px 3px 0 #c1121f;display:none}' +
      '#capo-top.show{display:block}' +
      '#capo-top:focus-visible{outline:3px solid #fff;outline-offset:2px}' +
      'section.block{scroll-margin-top:96px}';
    var style = document.createElement('style');
    style.setAttribute('data-capo-home', 'true');
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------- Sombra del encabezado ---------- */
  function initHeaderShadow() {
    var header = document.querySelector('header.nav');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Resaltado de sección activa ---------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('nav.links a[href^="#"]')
    );
    if (!links.length) return;
    var targets = links
      .map(function (a) {
        var id = a.getAttribute('href').slice(1);
        return document.getElementById(id);
      })
      .filter(Boolean);
    if (!targets.length) return;

    function setActive(id) {
      links.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
      });
    }

    if ('IntersectionObserver' in window && !prefersReduced) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) setActive(entry.target.id);
          });
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 }
      );
      targets.forEach(function (t) { observer.observe(t); });
    } else {
      // Alternativa sin observador: por posición de scroll.
      window.addEventListener('scroll', function () {
        var current = targets[0].id;
        targets.forEach(function (t) {
          if (t.getBoundingClientRect().top <= 140) current = t.id;
        });
        setActive(current);
      }, { passive: true });
    }
  }

  /* ---------- Aparición suave ---------- */
  function initReveal() {
    var items = document.querySelectorAll(
      '#valor .card, #menu-destacado .dish, #negocio .info-box, #negocio .map-wrap, #tienda-acceso .tienda-acceso'
    );
    if (!items.length) return;
    Array.prototype.forEach.call(items, function (el, i) {
      el.classList.add('capo-reveal');
      el.style.transitionDelay = prefersReduced ? '0s' : Math.min(i % 6, 5) * 60 + 'ms';
    });
    if (!('IntersectionObserver' in window) || prefersReduced) {
      Array.prototype.forEach.call(items, function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    Array.prototype.forEach.call(items, function (el) { observer.observe(el); });
  }

  /* ---------- Aviso de horario ( Lun-Vie 7-21, Sáb 8-22, Dom 9-15 ) ---------- */
  function initScheduleBadge() {
    var anchor = document.querySelector('.hero-card');
    if (!anchor || document.querySelector('.capo-status')) return;
    var badge = document.createElement('p');
    badge.className = 'capo-status';
    badge.setAttribute('role', 'status');

    function compute() {
      var now;
      try {
        now = new Date(
          new Date().toLocaleString('en-US', { timeZone: 'America/Merida' })
        );
      } catch (e) {
        now = new Date();
      }
      var day = now.getDay(); // 0=Dom .. 6=Sáb
      var hour = now.getHours() + now.getMinutes() / 60;
      var open = false;
      if (day >= 1 && day <= 5) open = hour >= 7 && hour < 21;
      else if (day === 6) open = hour >= 8 && hour < 22;
      else open = hour >= 9 && hour < 15;
      return open;
    }

    function render() {
      var open = compute();
      badge.textContent = open
        ? '● Abierto ahora · cocina encendida en horario de servicio'
        : '● Cerrado ahora · revisa el horario y visítanos en servicio';
      badge.classList.toggle('closed', !open);
    }

    anchor.appendChild(badge);
    render();
    window.setInterval(render, 5 * 60 * 1000);
  }

  /* ---------- Conteo informativo del menú destacado (solo texto) ---------- */
  function initMenuCount() {
    var grid = document.querySelector('#menu-destacado .menu-grid');
    if (!grid || document.querySelector('.capo-count')) return;
    var total = grid.querySelectorAll('.dish').length;
    if (!total) return;
    var p = document.createElement('p');
    p.className = 'capo-count';
    p.textContent = 'Mostrando ' + total + ' antojos destacados · el catálogo completo está en la tienda.';
    grid.insertAdjacentElement('afterend', p);
  }

  /* ---------- Botón volver arriba ---------- */
  function initBackToTop() {
    if (document.getElementById('capo-top')) return;
    var btn = document.createElement('button');
    btn.id = 'capo-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Volver arriba');
    btn.textContent = '↑';
    document.body.appendChild(btn);

    function onScroll() {
      btn.classList.toggle('show', window.scrollY > 700);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    btn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReduced ? 'auto' : 'smooth'
      });
    });
  }

  /* ---------- Año en pie de página ---------- */
  function initYear() {
    var foot = document.querySelector('footer');
    if (!foot || foot.querySelector('[data-capo-year]')) return;
    var line = foot.querySelector('p');
    if (!line) return;
    var span = document.createElement('span');
    span.setAttribute('data-capo-year', 'true');
    span.textContent = ' ' + new Date().getFullYear() + '.';
    line.appendChild(span);
  }

  /* ---------- Arranque ---------- */
  function init() {
    injectStyles();
    initHeaderShadow();
    initScrollSpy();
    initReveal();
    initScheduleBadge();
    initMenuCount();
    initBackToTop();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
