/* Común a todas las páginas: botón de tema (alterna claro y oscuro y lo recuerda) y página actual en la barra. */
(function () {
  "use strict";
  var d = document.documentElement, b = document.querySelector(".tema");
  if (b) {
    var rotular = function () { b.textContent = d.getAttribute("data-tema") === "claro" ? "Tema oscuro" : "Tema claro"; };
    b.addEventListener("click", function () {
      var t = d.getAttribute("data-tema") === "claro" ? "oscuro" : "claro";
      d.setAttribute("data-tema", t);
      try { localStorage.setItem("tema", t); } catch (e) {}
      rotular();
    });
    rotular();
  }
})();
