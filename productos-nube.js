/* Productos y servicios del inicio (2026-11-03: antes sólo productos; ver el bloque «(2026-11-03)» más abajo).
   Historia: Productos del inicio (Benjamin, 2026-10-30): la sección queda fija un tramo de scroll y se cuenta en etapas.
   Primero el tacógrafo; enseguida entran sus periféricos; tras una pausa aparece la nube de SACEL, a la altura del
   título, y una antena que sube desde la cara de arriba del tacógrafo (no desde el panel frontal); desde la punta de
   la antena salen las señales hacia la nube, con la misma estela que acelera de forma exponencial (e^14u) que en la
   portada, para que la página se lea como un solo relato. La nube y la estela copian el dibujo de flota-3d.js (si se
   cambia allá, cambiarlo aquí). Con movimiento reducido o sin JS, todo a la vista y quieto. */
(function () {
  "use strict";
  var sec = document.querySelector('section[aria-labelledby="t-productos"]');
  var recorrido = sec && sec.parentNode.classList.contains("productos-recorrido") ? sec.parentNode : null;
  var taco = sec && sec.querySelector(".dg-taco .ilus"), titulo = sec && sec.querySelector("#t-productos");
  if (!sec || !taco || !titulo) return;
  var quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ramas = [].slice.call(sec.querySelectorAll(".familia-siete li"));
  // la versión del tacógrafo: una perilla que gira y mueve el número de la paleta (Benjamin, 2026-10-30). Al cruzar el
  // umbral del scroll gira despacio de 0 a 4 —cada número se ve caer—, se pasa hacia el 5, que se asoma a medio caer
  // en la paleta sin llegar, y vuelve a 4. Línea de tiempo en ms: [inicio, fin, valor desde, valor hasta]
  var ver = sec.querySelector(".ver-paleta b"), asoma = sec.querySelector(".ver-paleta"), perilla = sec.querySelector(".ver-dial");
  var verDisparo = false, verT0 = 0;
  // la perilla y la paleta van juntas: la perilla empuja hacia el 5 (casi lo alcanza, se esfuerza un instante) y la
  // mitad de arriba del 4 cae a la par; al ceder la perilla, la paleta vuelve a su lugar
  var GIRO = [[0, 3800, 0, 4], [3800, 5200, 4, 4.8], [5200, 5800, 4.8, 4.9], [5800, 7200, 4.9, 4]];
  function suaveIO(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function valorGiro(ms) {
    for (var k = 0; k < GIRO.length; k++) {
      var g = GIRO[k]; if (ms <= g[1]) return g[2] + (g[3] - g[2]) * suaveIO(Math.max(0, (ms - g[0]) / (g[1] - g[0])));
    }
    return 4;
  }
  function ponerVer(n) {
    if (!ver || ver.textContent === String(n)) return;
    ver.textContent = String(n);
    var pa = ver.parentNode; pa.classList.remove("gira"); void pa.offsetWidth; pa.classList.add("gira");
  }
  function ponerPerilla(x) {
    if (perilla) perilla.style.setProperty("--giro", (-135 + 270 * x / 5).toFixed(1) + "deg");
    // pasado el 4, la mitad de arriba del 4 empieza a caer y deja ver el 5 detrás; a 4,72 va a medio camino y vuelve
    var f = Math.max(0, Math.min(1, (x - 4) / 0.9));
    if (asoma) { asoma.style.setProperty("--caida", (86 * f).toFixed(1)); asoma.style.setProperty("--asoma", f > 0.01 ? "1" : "0"); }
  }
  // (2026-11-03) Productos y servicios: se quitan la antena, la nube de SACEL y las entradas GPS/CAN (SACEL ya se cuenta
  // en el mapa). Queda la perilla de la versión y, con el scroll, un pulso de cobre que sale del tacógrafo, baja a la
  // barra y corre hasta cada una de las 7 fichas, que se encienden de a una (como los pulsos del CAN bus del mapa)
  var EXTRA = 2.4;                                 // scroll adicional, en altos de pantalla, con la sección fija
  var ETAPA = { version: 0.03, ramas: [0.06, 0.22], pulsos: [0.28, 0.94] };
  var COLORES = { claro: { traza: "184,112,42" }, oscuro: { traza: "246,196,138" } };
  var lienzo = document.createElement("canvas");
  lienzo.className = "productos-lienzo"; lienzo.setAttribute("aria-hidden", "true");
  sec.style.position = "relative"; sec.appendChild(lienzo);
  var c = lienzo.getContext("2d"), W = 0, H = 0, dpr = 1, fijo = 0, ORIGEN = null, BARRA = 0, FICHAS = [];
  function suave(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function tramo(r, p) { return suave((p - r[0]) / (r[1] - r[0])); }
  function tema() { return document.documentElement.getAttribute("data-tema") === "claro" ? "claro" : "oscuro"; }
  function medir() {
    if (recorrido && !quieto) {
      fijo = Math.min(0, window.innerHeight - sec.offsetHeight);
      sec.style.position = "sticky"; sec.style.top = fijo + "px";
      recorrido.style.height = (sec.offsetHeight + EXTRA * window.innerHeight) + "px";
    }
    var r = sec.getBoundingClientRect(); W = r.width; H = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    lienzo.width = Math.round(W * dpr); lienzo.height = Math.round(H * dpr);
    var t = taco.getBoundingClientRect();
    ORIGEN = [t.left - r.left + t.width / 2, t.bottom - r.top];
    var ul = sec.querySelector(".familia-siete"), u = ul ? ul.getBoundingClientRect() : null;
    BARRA = u ? u.top - r.top - parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.3 : ORIGEN[1] + 40;
    FICHAS = ramas.map(function (li) { var b = li.getBoundingClientRect(); return [b.left - r.left + b.width / 2, b.top - r.top]; });
  }
  function progreso() {
    if (!recorrido || quieto) return 1;
    var r = recorrido.getBoundingClientRect(), largo = EXTRA * window.innerHeight;
    return Math.max(0, Math.min(1, (fijo - r.top) / largo));
  }
  // el camino del pulso hasta la ficha i: baja del tacógrafo a la barra, corre por ella y baja a la ficha
  function camino(i) { var f = FICHAS[i]; return [ORIGEN, [ORIGEN[0], BARRA], [f[0], BARRA], [f[0], f[1]]]; }
  function enCamino(pts, u) {
    var L = [], tot = 0; for (var k = 1; k < pts.length; k++) { var d = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); L.push(d); tot += d; }
    var s = u * tot, k2 = 0; while (k2 < L.length - 1 && s > L[k2]) { s -= L[k2]; k2++; }
    var w = L[k2] ? s / L[k2] : 0, a = pts[k2], b = pts[k2 + 1];
    return [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w];
  }
  function pulso(P, q, a) {
    var g = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], 7);
    g.addColorStop(0, "rgba(" + P.traza + "," + (0.95 * a).toFixed(3) + ")"); g.addColorStop(1, "rgba(" + P.traza + ",0)");
    c.fillStyle = g; c.beginPath(); c.arc(q[0], q[1], 7, 0, 7); c.fill();
  }
  function dibujar(t) {
    var P = COLORES[tema()], p = progreso();
    if (ver && !quieto) {
      if (p >= ETAPA.version && !verDisparo) { verDisparo = true; verT0 = t; }
      else if (p < ETAPA.version * 0.5 && verDisparo) { verDisparo = false; ponerPerilla(0); ponerVer(0); }
      if (verDisparo) { var x = valorGiro((t - verT0) * 1000); ponerPerilla(x); ponerVer(Math.max(0, Math.min(4, Math.floor(x + 1e-6)))); }
    }
    // las fichas entran juntas, tenues; el pulso las enciende de a una
    var vR = quieto ? 1 : tramo(ETAPA.ramas, p), n = ramas.length, paso = (ETAPA.pulsos[1] - ETAPA.pulsos[0]) / Math.max(1, n);
    sec.style.setProperty("--ramas", vR.toFixed(3));
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    // la línea del tacógrafo a la barra de las fichas (reemplaza la de CSS, que era de largo fijo)
    if (ORIGEN && vR > 0.01) {
      c.strokeStyle = getComputedStyle(sec).getPropertyValue("--linea").trim() || "rgba(0,16,79,.2)"; c.globalAlpha = vR; c.lineWidth = 1;
      c.beginPath(); c.moveTo(ORIGEN[0] + 0.5, ORIGEN[1]); c.lineTo(ORIGEN[0] + 0.5, BARRA); c.stroke(); c.globalAlpha = 1;
    }
    ramas.forEach(function (li, i) {
      var a0 = ETAPA.pulsos[0] + i * paso, u = quieto ? 1 : (p - a0) / paso, lista = u >= 1;
      li.classList.toggle("encendida", lista);
      li.style.opacity = (vR * (lista ? 1 : 0.45)).toFixed(3);
      li.style.transform = vR < 1 ? "translateY(" + ((1 - vR) * 18).toFixed(1) + "px)" : "";
      if (!quieto && u > 0 && u < 1 && FICHAS[i]) pulso(P, enCamino(camino(i), suave(u)), Math.min(1, u / 0.1) * Math.min(1, (1 - u) / 0.1));
    });
    // con todas encendidas, cada tanto un pulso tenue recorre el camino hasta una ficha al azar (la sección sigue viva)
    if (!quieto && p >= ETAPA.pulsos[1] && FICHAS.length) {
      var ciclo = 2.2, k = Math.floor(t / ciclo), f = (t % ciclo) / ciclo, i2 = (k * 3) % FICHAS.length;
      pulso(P, enCamino(camino(i2), suave(f)), 0.6 * Math.sin(f * Math.PI));
    }
  }

  // botón «Pausar animación» propio de la sección (accesibilidad: lo que se mueve solo se puede detener)
  var raf = 0, visible = false, pausado = false, boton = sec.querySelector(".pausa-productos");
  if (boton) {
    if (quieto) boton.hidden = true;
    boton.addEventListener("click", function () {
      pausado = !pausado;   // el estado lo dice el texto del botón; con aria-pressed además se anunciaría dos veces
      boton.textContent = pausado ? "Reanudar animación" : "Pausar animación";
      if (!pausado && visible && !raf) raf = requestAnimationFrame(cuadro);
    });
  }
  function cuadro(ms) { dibujar(ms / 1000); raf = visible && !quieto && !pausado ? requestAnimationFrame(cuadro) : 0; }
  window.addEventListener("scroll", function () { if (pausado) dibujar(performance.now() / 1000); }, { passive: true });
  if (ver && !quieto) { ver.textContent = "0"; ponerPerilla(0); } else { ponerPerilla(4); }
  medir(); dibujar(0);
  window.addEventListener("resize", function () { medir(); dibujar(performance.now() / 1000); });
  new MutationObserver(function () { dibujar(performance.now() / 1000); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  if ("ResizeObserver" in window) new ResizeObserver(function () { medir(); dibujar(performance.now() / 1000); }).observe(sec);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible && !raf && !quieto && !pausado) raf = requestAnimationFrame(cuadro); }).observe(sec);
  } else { visible = true; raf = requestAnimationFrame(cuadro); }
})();
