// EL CAPO — UI general. Sin carrito propio.
// El runtime ITM gestiona carrito, inventario y pedidos autenticados.
(function(){
  function toggleMenu(){
    var nav = document.querySelector('nav.main');
    if(nav) nav.classList.toggle('open');
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('.menu-toggle');
    if(t) toggleMenu();
    var f = e.target.closest && e.target.closest('[data-filter-btn]');
    if(f){
      var v = f.getAttribute('data-filter-btn');
      document.querySelectorAll('[data-filter-btn]').forEach(function(b){ b.classList.remove('active'); });
      f.classList.add('active');
      document.querySelectorAll('[data-cat]').forEach(function(card){
        if(v==='todo' || card.getAttribute('data-cat')===v) card.style.display='';
        else card.style.display='none';
      });
    }
  });
  // Año footer
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });
  // Detalle fallback: muestra id de ?id=
  try{
    var params = new URLSearchParams(location.search);
    var id = params.get('id');
    document.querySelectorAll('[data-detail-id-text]').forEach(function(el){ if(id) el.textContent = id; });
  }catch(_){}
})();
