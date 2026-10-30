/* Botones «Seguir» y «Saltar» (Benjamin, 2026-10-30): en las secciones que avanzan con el scroll, «Seguir» lleva a la
   etapa siguiente para que se entienda que hay que seguir bajando, y «Saltar» deja la sección y baja a la que viene,
   para quien quiere llegar rápido a lo que sigue. Cada botón dice en qué contenedor vive (data-recorrido, el bloque alto que se
   recorre) y en qué avances están sus etapas (data-etapas, de 0 a 1). Pasada la última, baja a lo que sigue. Con
   movimiento reducido no hace falta: las secciones no quedan fijas. */
(function () {
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".seguir, .saltar-seccion").forEach(function (b) { b.hidden = true; });
    return;
  }
  function tramo(c) {                            // dónde empieza el recorrido del contenedor y cuánto mide
    var fijo = c.querySelector("[data-fijo]") || c.firstElementChild;
    var arriba = parseFloat(getComputedStyle(fijo).top) || 0;
    var inicio = c.getBoundingClientRect().top + scrollY - arriba;
    return { inicio: inicio, largo: Math.max(1, c.offsetHeight - fijo.offsetHeight) };
  }
  document.querySelectorAll(".seguir, .saltar-seccion").forEach(function (b) {
    var c = document.querySelector(b.getAttribute("data-recorrido")); if (!c) return;
    var etapas = (b.getAttribute("data-etapas") || "").split(",").filter(Boolean).map(Number);   // «Saltar» no tiene etapas
    function actual() { var t = tramo(c); return (scrollY - t.inicio) / t.largo; }
    b.addEventListener("click", function () {
      var t = tramo(c), p = actual(), meta = null;
      for (var i = 0; i < etapas.length; i++) if (etapas[i] > p + 0.01) { meta = etapas[i]; break; }
      var y = meta === null ? t.inicio + c.offsetHeight - (parseFloat(getComputedStyle(c.querySelector("[data-fijo]") || c.firstElementChild).top) || 0)
                            : t.inicio + meta * t.largo;
      scrollTo({ top: y, behavior: "smooth" });
    });
  });
})();
