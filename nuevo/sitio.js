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
