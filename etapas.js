/* Etapas por gesto (Benjamin, 2026-11-02; reemplaza a seguir.js y sus botones Seguir y Saltar).
   Las secciones que avanzan con el scroll (un contenedor alto con un hijo fijo) dicen sus etapas en data-etapas
   (avances de 0 a 1). Dentro de una de ellas:
   - un paso discreto (una muesca de la rueda del mouse, flecha, AvPág/RePág o espacio) lleva, con animación, a la
     etapa siguiente o a la anterior; pasada la última, a donde termina la sección; antes de la primera, a su comienzo;
   - un gesto continuo (trackpad, dedo, barra de desplazamiento) recorre libremente: no se toca.
   No se «aprende» un modo con el primer gesto (Benjamin lo descartó): cada evento se juzga solo.
   En inicio, la portada cordillera cuenta como la etapa 0 del mapa: una muesca desde arriba baja al mapa.
   Con movimiento reducido no hace nada: queda el scroll nativo y las secciones no quedan fijas. */
(function () {
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var conts = [].slice.call(document.querySelectorAll("[data-etapas]"));
  if (!conts.length) return;

  // puntos de detención de cada sección, en px de scroll
  function puntos(c) {
    var fijo = c.querySelector("[data-fijo]") || c.firstElementChild;
    var arriba = parseFloat(getComputedStyle(fijo).top) || 0;
    var inicio = c.getBoundingClientRect().top + scrollY - arriba;
    var largo = Math.max(1, c.offsetHeight - fijo.offsetHeight);
    var ps = [inicio];
    c.getAttribute("data-etapas").split(",").filter(Boolean).forEach(function (e) { ps.push(inicio + Number(e) * largo); });
    ps.push(inicio + c.offsetHeight - arriba);              // donde la sección suelta lo fijo y entra la siguiente
    if (c.id === "mapa" && c.previousElementSibling && c.previousElementSibling.classList.contains("cordillera")) ps.unshift(0);
    return ps;
  }
  // destino de un paso (dir = 1 abajo, -1 arriba) o null si estamos fuera de toda sección con etapas
  function destino(dir) {
    var y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    for (var i = 0; i < conts.length; i++) {
      var ps = puntos(conts[i]), a = ps[0], b = ps[ps.length - 1];
      if (dir > 0 ? (y >= a - 2 && y < b - 2) : (y > a + 2 && y <= b + 2)) {
        for (var k = 0; k < ps.length; k++) {
          var q = dir > 0 ? ps[k] : ps[ps.length - 1 - k];
          if (dir > 0 ? q > y + 2 : q < y - 2) return Math.max(0, Math.min(max, q));
        }
      }
    }
    return null;
  }

  // animación propia: duración fija, independiente de la distancia; un gesto del usuario la corta
  var anim = null, ultimoFin = 0;
  function ir(y) {
    var y0 = scrollY, t0 = performance.now(), dur = 850;
    if (anim) cancelAnimationFrame(anim.raf);
    anim = { raf: 0 };
    (function cuadro(t) {
      var u = Math.min(1, (t - t0) / dur), e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      scrollTo(0, y0 + (y - y0) * e);
      if (u < 1) anim.raf = requestAnimationFrame(cuadro); else { anim = null; ultimoFin = performance.now(); }
    })(t0);
  }
  function cortar() { if (anim) { cancelAnimationFrame(anim.raf); anim = null; } }

  // una muesca de rueda: deltaMode en líneas o páginas, o un salto grande y entero en px (Chrome y Firefox dan 100–120
  // por muesca). El trackpad entrega una lluvia de deltas chicos y fraccionarios, y ésos no se tocan.
  var ultimaRueda = 0;
  function esMuesca(e) {
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return false;   // zoom con pellizco o gesto lateral
    if (e.deltaMode !== 0) return true;
    var d = Math.abs(e.deltaY);
    return d >= 50 && d === Math.round(d);
  }
  addEventListener("wheel", function (e) {
    var ahora = performance.now(), seguido = ahora - ultimaRueda < 60; ultimaRueda = ahora;
    if (!esMuesca(e)) { cortar(); return; }
    var dir = e.deltaY > 0 ? 1 : -1;
    if (anim || ahora - ultimoFin < 120) { if (destino(dir) !== null || anim) e.preventDefault(); return; }   // una muesca, una etapa
    if (seguido) return;                          // ráfaga muy rápida de deltas grandes: un trackpad con inercia, libre
    var y = destino(dir);
    if (y === null) return;
    e.preventDefault(); ir(y);
  }, { passive: false });

  addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target, tag = t && t.tagName;
    if (t && (t.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")) return;
    var dir = 0;
    if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) dir = 1;
    else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) dir = -1;
    if (!dir) return;
    if (e.key === " " && (tag === "BUTTON" || tag === "A")) return;   // el espacio activa el control enfocado
    var y = destino(dir);
    if (y === null) return;
    e.preventDefault(); ir(y);
  });
  ["touchstart", "mousedown"].forEach(function (n) { addEventListener(n, cortar, { passive: true }); });
})();
