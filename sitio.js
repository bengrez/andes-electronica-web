/* Común a todas las páginas: botón de tema (alterna claro y oscuro y lo recuerda) y página actual en la barra. */
(function () {
  "use strict";
  var d = document.documentElement, b = document.querySelector(".tema");
  if (b) {
    // botón redondo con un símbolo (2026-10-30): una luna para pasar a oscuro, un sol para pasar a claro
    var LUNA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
    var SOL = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
    var rotular = function () {
      var claro = d.getAttribute("data-tema") === "claro", texto = claro ? "Cambiar a tema oscuro" : "Cambiar a tema claro";
      b.innerHTML = claro ? LUNA : SOL; b.setAttribute("aria-label", texto); b.title = texto;
    };
    b.addEventListener("click", function () {
      var t = d.getAttribute("data-tema") === "claro" ? "oscuro" : "claro";
      d.setAttribute("data-tema", t);
      try { localStorage.setItem("tema", t); } catch (e) {}
      rotular();
    });
    rotular();
  }
})();
/* Inicio (Benjamin, 2026-11-02): la barra queda fija y el logo parte grande y se achica mientras entra el mapa. --k va
   de 0 (arriba de todo) a 1 (el mapa llega arriba); lo usan base.css (tamaño del logo, fondo de la barra) y el texto
   del mapa, que aparece a medida que entra. Ligado al scroll, no es una animación por sí misma. */
(function () {
  "use strict";
  var portada = document.querySelector(".cordillera");
  if (!portada) return;
  var d = document.documentElement, pedido = false, ultimo = -1;
  function poner() {
    pedido = false;
    var k = Math.min(1, Math.max(0, scrollY / Math.max(1, portada.offsetHeight)));
    k = Math.round(k * 1000) / 1000;
    if (k !== ultimo) { ultimo = k; d.style.setProperty("--k", String(k)); }
    mudar(k);
  }
  /* «Andes Electrónica» es el mismo título de la portada, que viaja y se achica hasta su lugar en el mapa (Benjamin,
     2026-11-02: «es el mismo, sólo que mutó»). Para que no salte con la rueda del mouse (el scroll pinta antes que este
     código), el viaje lo hace una copia fija (.h1-viajero), que sólo existe entre k = 0 y k = 1:
     - arriba de todo (k = 0) se ve el h1 real;
     - durante el viaje, la copia fija (aria-hidden), interpolada entre el lugar del h1 y el del mapa;
     - con el mapa arriba (k = 1), el texto del mapa (.mapa-marca), que va fijo con el mapa sin depender de JS.
     Sólo en escritorio y sin movimiento reducido. */
  var h1 = portada.querySelector("h1"), lugar = document.querySelector(".mapa-marca");
  var activo = h1 && lugar && matchMedia("(min-width: 47.51rem) and (prefers-reduced-motion: no-preference)");
  var base = null, copia = null, fase = "";
  function medirBase() {                          // lugar y tamaño del h1 en el documento
    if (!activo || !activo.matches) { base = null; fijarFase(""); d.classList.remove("h1-viaja"); return; }
    var r = h1.getBoundingClientRect();
    base = { x: r.left, y: r.top + scrollY, fs: parseFloat(getComputedStyle(h1).fontSize) };
    if (!copia) {
      copia = document.createElement("div"); copia.className = "h1-viajero"; copia.setAttribute("aria-hidden", "true");
      copia.textContent = h1.textContent; document.body.appendChild(copia);
    }
    copia.style.fontSize = base.fs + "px";
    d.classList.add("h1-viaja");
  }
  function fijarFase(f) {                        // "arriba" | "viaje" | "mapa"
    if (f === fase) return; fase = f;
    d.classList.toggle("h1-en-viaje", f === "viaje");
    d.classList.toggle("h1-en-mapa", f === "mapa");
  }
  function mudar(k) {
    if (!base) return;
    if (k <= 0) { fijarFase("arriba"); return; }
    if (k >= 1) { fijarFase("mapa"); return; }
    fijarFase("viaje");
    var L = lugar.getBoundingClientRect(), esc = parseFloat(getComputedStyle(lugar).fontSize) / base.fs;
    var x = base.x + (L.left - base.x) * k, y = (base.y - scrollY) + (L.top - (base.y - scrollY)) * k, s = 1 + (esc - 1) * k;
    copia.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(" + s.toFixed(4) + ")";
  }
  if (activo) {
    var rehacer = function () { medirBase(); ultimo = -1; poner(); };
    if (activo.addEventListener) activo.addEventListener("change", rehacer);
    addEventListener("load", rehacer);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rehacer);
    medirBase();
  }
  addEventListener("scroll", function () { if (!pedido) { pedido = true; requestAnimationFrame(poner); } }, { passive: true });
  addEventListener("resize", function () { if (activo) medirBase(); ultimo = -1; poner(); });
  poner();
})();

