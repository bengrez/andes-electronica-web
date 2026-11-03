/* Línea de avance (Benjamin, 2026-11-02: «para bajar la ansiedad de algunos usuarios»). Una línea vertical sutil en el
   borde izquierdo se va coloreando con el scroll y muestra cuánto de la página se ha visto. Sobre ella, una marca por
   sección (cada h1/h2 de <main>) que lleva a esa sección; al pasar sobre la marca o enfocarla aparece su título.
   Si el título está dentro de una sección que avanza con el scroll (contenedor con data-etapas, p. ej. el mapa de
   inicio), la marca lleva al comienzo de ese contenedor. En el celular sólo se ve la línea, sin marcas.
   Con movimiento reducido el salto es inmediato. Sin dependencias; no guarda nada. */
(function () {
  "use strict";
  var main = document.querySelector("main");
  if (!main) return;
  var quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // destinos: cada título, o el contenedor con etapas que lo contiene (sin repetir)
  var vistos = [], destinos = [];
  [].forEach.call(document.querySelectorAll(".cabecera h1, main h1, main h2"), function (h) {
    if (!h.getClientRects().length) return;
    var sec = h.closest("section, .cabecera");
    var el = h.closest("[data-etapas]") || (sec && sec.querySelector("h1, h2") === h ? sec : h);
    if (vistos.indexOf(el) >= 0) return;
    vistos.push(el);
    if (!el.id) el.id = h.id ? "s-" + h.id : "s-" + destinos.length;
    var t = h.textContent.replace(/\s+/g, " ").trim();
    destinos.push({ el: el, titulo: t.length > 48 ? t.slice(0, 46) + "…" : t });
  });

  var nav = document.createElement("nav");
  nav.className = "avance";
  nav.setAttribute("aria-label", "Avance y secciones de esta página");
  nav.innerHTML = '<span class="avance-riel" aria-hidden="true"><span class="avance-lleno"></span></span><ol></ol>';
  var lleno = nav.querySelector(".avance-lleno"), lista = nav.querySelector("ol");
  destinos.forEach(function (d) {
    var li = document.createElement("li"), a = document.createElement("a");
    a.href = "#" + d.el.id; a.className = "avance-marca";
    a.innerHTML = '<span class="avance-titulo"></span>';
    a.firstChild.textContent = d.titulo;
    a.addEventListener("click", function (e) {
      e.preventDefault();
      // la barra fija (escritorio) tapa el borde de arriba: se deja su alto, como mucho 110 px (en inicio el logo se achica al bajar)
      var barra = document.querySelector(".barra"), pos = barra && getComputedStyle(barra).position;
      var tapa = pos === "sticky" || pos === "fixed" ? Math.min(barra.offsetHeight, 110) : 0;
      var y = d.el.getBoundingClientRect().top + scrollY - (d.el.hasAttribute("data-etapas") ? 0 : 16 + tapa);
      scrollTo({ top: Math.max(0, y), behavior: quieto ? "auto" : "smooth" });
      history.replaceState(null, "", "#" + d.el.id);
    });
    li.appendChild(a); lista.appendChild(li); d.a = a;
  });
  document.body.appendChild(nav);

  // posiciones: la marca de cada sección queda a la altura del avance en que la sección llega arriba de la pantalla
  var largo = 1;
  function medir() {
    largo = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    // en px del riel, con 26 px de separación mínima (las áreas tocables de 24 px no se pisan en páginas cortas)
    var alto = nav.clientHeight, SEP = 26, pos = destinos.map(function (d) {
      d.y = Math.max(0, d.el.getBoundingClientRect().top + scrollY);
      return Math.min(1, d.y / largo) * alto;
    });
    for (var i = 1; i < pos.length; i++) pos[i] = Math.max(pos[i], pos[i - 1] + SEP);
    for (i = pos.length - 1; i >= 0; i--) pos[i] = Math.min(pos[i], alto - (pos.length - 1 - i) * SEP);
    destinos.forEach(function (d, i) { d.a.parentNode.style.top = Math.max(0, pos[i]).toFixed(1) + "px"; });
    pintar();
  }
  var pedido = false;
  function pintar() {
    pedido = false;
    var p = Math.min(1, Math.max(0, scrollY / largo));
    lleno.style.transform = "scaleY(" + p.toFixed(4) + ")";
    var actual = -1;
    destinos.forEach(function (d, i) {
      var visto = d.y <= scrollY + 2 || (i === 0 && scrollY < 2);
      d.a.classList.toggle("vista", d.y <= scrollY + innerHeight * 0.4);
      if (visto) actual = i;
    });
    destinos.forEach(function (d, i) { if (i === actual) d.a.setAttribute("aria-current", "location"); else d.a.removeAttribute("aria-current"); });
  }
  addEventListener("scroll", function () { if (!pedido) { pedido = true; requestAnimationFrame(pintar); } }, { passive: true });
  addEventListener("resize", medir);
  addEventListener("load", medir);
  if (window.ResizeObserver) new ResizeObserver(medir).observe(document.body);
  medir();
})();
