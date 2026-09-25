/* EL CAPO - script de presentacion. No toca atributos data-itm (los hidrata el runtime ITM). Solo navegacion y animaciones. */
(function(){
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if(toggle && nav){
    toggle.addEventListener('click', function(){ nav.classList.toggle('open'); });
    nav.addEventListener('click', function(e){ if(e.target.tagName === 'A') nav.classList.remove('open'); });
  }
  var yearEls = document.querySelectorAll('[data-year]');
  var y = new Date().getFullYear();
  yearEls.forEach(function(el){ el.textContent = y; });

  // Revelado suave solo para secciones de presentación
  var io = null;
  try{
    io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('visible'); io.unobserve(en.target); } });
    },{threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  }catch(e){
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
  }

  // Ancla suave para CTAs de presentación (no interfiere con tienda)
  document.querySelectorAll('a[href^="#"]:not([data-itm-product-open])').forEach(function(a){
    a.addEventListener('click', function(ev){
      var id = a.getAttribute('href');
      if(id.length > 1){
        var t = document.querySelector(id);
        if(t){ ev.preventDefault(); t.scrollIntoView({behavior:'smooth',block:'start'}); }
      }
    });
  });
})();
