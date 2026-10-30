/* Productos del inicio (Benjamin, 2026-10-30): la sección queda fija un tramo de scroll y se cuenta en etapas.
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
  var ramas = [].slice.call(sec.querySelectorAll(".familia-ramas li"));
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
  // lo que lleva cada trama que sale de la antena: va cambiando (Benjamin, 2026-10-30); [texto, ¿alerta?]
  var TRAMAS = [["posición GPS · 64 km/h", 0], ["consumo de combustible", 0], ["RPM del motor", 0], ["presión de frenos", 0],
                ["geocerca: entrada a faena", 1], ["horas de conducción", 0], ["aceleración promedio", 0],
                ["conductor identificado", 0], ["emergencia: botón de pánico", 1], ["frenada brusca", 1], ["temperatura del motor", 0],
                ["geocerca: salida de ruta autorizada", 1]];
  var ACEL = 14, VUELO = 2.6, CADA = 3.6;          // como las tramas del mapa; s de vuelo; s entre señales
  var EXTRA = 1.2;                                 // scroll adicional, en altos de pantalla, con la sección fija
  // etapas, como fracción del tramo fijo
  // entradas: lo que el tacógrafo recibe (GPS y bus CAN del vehículo), en la pausa antes de que aparezca SACEL
  // version: umbral que dispara la animación de la paleta del tacógrafo, de v.1 a v.4 (y se queda ahí: la 5 está por venir)
  var ETAPA = { version: 0.04, ramas: [0.04, 0.32], entradas: [0.36, 0.5], antena: [0.55, 0.68], nube: [0.58, 0.78], senal: 0.8 };
  var COLORES = {
    claro:  { nube: ["255,255,255", "232,235,241", "170,176,192"], nubeA: 1, texto: "rgba(0,16,79,.7)", traza: "184,112,42", antena: "0,16,79" },
    oscuro: { nube: ["196,204,226", "130,140,170", "40,48,80"], nubeA: 0.85, texto: "rgba(242,237,227,.7)", traza: "246,196,138", antena: "242,237,227" }
  };
  var COPOS = [[-18, 5, 7], [-11, 0, 10], [-3, -5, 12], [6, -6, 10], [12, 0, 10], [19, 5, 7.5], [-8, 6, 9], [3, 5, 10], [12, 7, 8], [-1, 0, 11]];

  var lienzo = document.createElement("canvas");
  lienzo.className = "productos-lienzo"; lienzo.setAttribute("aria-hidden", "true");
  sec.style.position = "relative"; sec.appendChild(lienzo);
  var c = lienzo.getContext("2d"), W = 0, H = 0, dpr = 1, TACO = null, BASE = null, PUNTA = null, N = null, ALTO_ANTENA = 0, fijo = 0;

  function suave(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function tramo(r, p) { return suave((p - r[0]) / (r[1] - r[0])); }
  function tema() { return document.documentElement.getAttribute("data-tema") === "claro" ? "claro" : "oscuro"; }

  function medir() {
    if (recorrido && !quieto) {                    // la sección se fija; si es más alta que la pantalla, con su pie a la vista
      fijo = Math.min(0, window.innerHeight - sec.offsetHeight);
      sec.style.position = "sticky"; sec.style.top = fijo + "px";
      recorrido.style.height = (sec.offsetHeight + EXTRA * window.innerHeight) + "px";
    }
    var r = sec.getBoundingClientRect(); W = r.width; H = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    lienzo.width = Math.round(W * dpr); lienzo.height = Math.round(H * dpr);
    // la antena: en la cara de arriba del tacógrafo, hacia atrás a la derecha (x 430, y 45 de un viewBox de 500 × 190)
    var t = taco.getBoundingClientRect();
    BASE = [t.left - r.left + t.width * 430 / 500, t.top - r.top + t.height * 45 / 190];
    ALTO_ANTENA = Math.max(13, t.height * 0.17);     // corta: deja más recorrido a la señal (2026-10-30)
    TACO = [t.left - r.left, t.top - r.top, t.width, t.height];
    PUNTA = [BASE[0], BASE[1] - ALTO_ANTENA];
    var h = titulo.getBoundingClientRect();
    // la nube de SACEL va siempre al lado del título, donde estuvo desde el principio, aunque el tacógrafo se mueva
    // (Benjamin, 2026-10-30): anclada al borde derecho del título, no a la antena
    var rg = document.createRange(); rg.selectNodeContents(titulo); var txt = rg.getBoundingClientRect();   // el texto, no la caja del h2
    N = W < 760 ? [PUNTA[0] - 40, PUNTA[1] - 60] : [txt.right - r.left + 185, h.top - r.top + h.height * 0.55];
  }
  function progreso() {
    if (!recorrido || quieto) return 1;
    var r = recorrido.getBoundingClientRect(), largo = EXTRA * window.innerHeight;
    return Math.max(0, Math.min(1, (fijo - r.top) / largo));
  }

  var llegada = -10;
  function nube(P, t, vis) {
    if (vis <= 0) return;
    var esc = W < 760 ? 1.25 : 1.6;
    c.save(); c.translate(N[0], N[1]); c.scale(esc, esc);
    if ("filter" in c && vis < 1) c.filter = "blur(" + ((1 - vis) * 4).toFixed(1) + "px)";   // se condensa, como en el mapa
    COPOS.forEach(function (q, i) {
      var v = Math.max(0, Math.min(1, vis * 1.7 - i * 0.1)); if (v <= 0) return;
      var r = q[2] * (0.55 + 0.45 * v), g = c.createRadialGradient(q[0] - r * 0.2, q[1] - r * 0.3, 0, q[0], q[1], r);
      g.addColorStop(0, "rgba(" + P.nube[0] + ",.97)"); g.addColorStop(0.62, "rgba(" + P.nube[0] + ",.92)");
      g.addColorStop(0.86, "rgba(" + P.nube[1] + ",.55)"); g.addColorStop(1, "rgba(" + P.nube[1] + ",0)");
      c.globalAlpha = P.nubeA * v; c.fillStyle = g; c.beginPath(); c.arc(q[0], q[1], r, 0, 7); c.fill();
    });
    var base = c.createLinearGradient(0, 2, 0, 14);
    base.addColorStop(0, "rgba(" + P.nube[2] + ",0)"); base.addColorStop(1, "rgba(" + P.nube[2] + ",.45)");
    c.globalAlpha = vis; c.globalCompositeOperation = "source-atop"; c.fillStyle = base; c.fillRect(-26, -16, 52, 32);
    c.globalCompositeOperation = "source-over";
    var brillo = Math.max(0, 1 - (t - llegada) / 0.6);
    for (var k = 0; k < 4; k++) {
      var hb = 3 + [3, 6, 4, 7][k] * (0.55 + 0.45 * (k === 3 || k === 1 ? brillo : brillo * 0.6));
      c.globalAlpha = vis * vis; c.fillStyle = "rgba(" + P.traza + "," + (0.5 + 0.5 * brillo).toFixed(3) + ")";
      c.fillRect(-8 + k * 4.6, 7 - hb, 3, hb);
    }
    c.globalAlpha = vis; c.fillStyle = P.texto; c.font = "600 15.75px 'Plex Mono', monospace"; c.textAlign = "right"; c.textBaseline = "middle";
    c.fillText("SACEL", -26, 2);
    c.restore();
  }
  function antena(P, a, t, senal) {               // un mástil fino con su punta; sube desde la cara de arriba
    if (a <= 0) return;
    var y = BASE[1] - ALTO_ANTENA * a;
    c.strokeStyle = "rgba(" + P.antena + ",.85)"; c.lineWidth = 1.3; c.lineCap = "round";
    c.beginPath(); c.moveTo(BASE[0], BASE[1]); c.lineTo(BASE[0], y); c.stroke();
    c.beginPath(); c.moveTo(BASE[0] - 4, BASE[1] + 1); c.lineTo(BASE[0] + 4, BASE[1] - 1); c.stroke();   // la base, apoyada en la cara
    c.fillStyle = "rgb(" + P.traza + ")"; c.beginPath(); c.arc(BASE[0], y, 2.6, 0, 7); c.fill();
    if (senal > 0) {                              // ondas de radio en la punta mientras transmite
      var f = (t % CADA) / CADA;
      for (var k = 0; k < 2; k++) {
        var ff = (f + k * 0.5) % 1;
        c.strokeStyle = "rgba(" + P.traza + "," + ((1 - ff) * 0.5 * senal).toFixed(3) + ")"; c.lineWidth = 1;
        c.beginPath(); c.arc(BASE[0], y, 4 + ff * 14, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
      }
    }
  }
  // lo que entra al tacógrafo, por la derecha (Benjamin, 2026-10-30): el GPS por el aire y el bus CAN por un cable que
  // sube, dobla hacia la izquierda y entra por el costado, con pulsos eléctricos
  function cable(P, pts, t, fase) {               // pts: inicio, codo y llegada; esquina redondeada; pulsos hacia la llegada
    var r = 14, a = pts[0], k = pts[1], b = pts[2];
    var d1 = Math.hypot(k[0] - a[0], k[1] - a[1]), d2 = Math.hypot(b[0] - k[0], b[1] - k[1]);
    var k1 = [k[0] - (k[0] - a[0]) / d1 * r, k[1] - (k[1] - a[1]) / d1 * r], k2 = [k[0] + (b[0] - k[0]) / d2 * r, k[1] + (b[1] - k[1]) / d2 * r];
    c.strokeStyle = "rgba(" + P.antena + ",.45)"; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(k1[0], k1[1]); c.quadraticCurveTo(k[0], k[1], k2[0], k2[1]); c.lineTo(b[0], b[1]); c.stroke();
    c.fillStyle = "rgba(" + P.antena + ",.85)"; c.fillRect(b[0] - 1, b[1] - 3, 4, 6);   // el conector, en el costado
    var largo = d1 + d2;
    function en(s) {                               // punto a la distancia s del inicio (sin la esquina, basta)
      if (s <= d1) return [a[0] + (k[0] - a[0]) * s / d1, a[1] + (k[1] - a[1]) * s / d1];
      var q = (s - d1) / d2; return [k[0] + (b[0] - k[0]) * q, k[1] + (b[1] - k[1]) * q];
    }
    for (var j = 0; j < 3; j++) {
      var f = ((t * 0.4) + fase + j / 3) % 1, q = en(f * largo);
      var g = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], 6);
      g.addColorStop(0, "rgba(" + P.traza + "," + (0.9 * Math.sin(f * Math.PI)).toFixed(3) + ")"); g.addColorStop(1, "rgba(" + P.traza + ",0)");
      c.fillStyle = g; c.beginPath(); c.arc(q[0], q[1], 6, 0, 7); c.fill();
    }
  }
  function entradas(P, v, t) {
    if (v <= 0) return;
    var x0 = TACO[0], y0 = TACO[1], w = TACO[2], h = TACO[3], movil = W < 760;
    var xr = x0 + w * 0.985, xc = xr + (movil ? 26 : 64);   // cables y GPS cerca del equipo                 // costado derecho del equipo; columna de entrada
    var gIn = [xr + 2, y0 + h * 0.42], cIn = [xr, y0 + h * 0.74];
    var gps = [xc + (movil ? 0 : 20), y0 + h * 0.05], can = [xc, y0 + h + (movil ? 26 : 40)];
    c.save(); c.globalAlpha = v;
    // GPS: por el aire (Benjamin, 2026-10-30): ondas que salen del satélite hacia el equipo y paquetes que cruzan
    var ang = Math.atan2(gIn[1] - gps[1], gIn[0] - gps[0]), dist = Math.hypot(gIn[0] - gps[0], gIn[1] - gps[1]);
    for (var k = 0; k < 3; k++) {
      var f = ((t * 0.5) + k / 3) % 1, rr = 8 + f * (dist - 8);
      c.strokeStyle = "rgba(" + P.traza + "," + (0.55 * (1 - f)).toFixed(3) + ")"; c.lineWidth = 1.2;
      c.beginPath(); c.arc(gps[0], gps[1], rr, ang - 0.32, ang + 0.32); c.stroke();
    }
    c.strokeStyle = "rgba(" + P.antena + ",.85)"; c.lineWidth = 1.2;
    c.save(); c.translate(gps[0], gps[1]); c.rotate(-0.5);
    c.strokeRect(-3, -3, 6, 6); c.strokeRect(-13, -2.5, 8, 5); c.strokeRect(5, -2.5, 8, 5);
    c.restore();
    c.fillStyle = "rgba(" + P.antena + ",.85)"; c.beginPath(); c.arc(gIn[0] + 2, gIn[1], 2.2, 0, 7); c.fill();   // receptor en el costado
    // CAN bus: por cable, con pulsos eléctricos
    cable(P, [can, [xc, cIn[1]], cIn], t, 0.5);
    c.strokeRect(can[0] - 5, can[1], 10, 7); c.beginPath(); c.moveTo(can[0] - 2, can[1] + 7); c.lineTo(can[0] - 2, can[1] + 11);
    c.moveTo(can[0] + 2, can[1] + 7); c.lineTo(can[0] + 2, can[1] + 11); c.stroke();
    c.fillStyle = P.texto; c.font = "500 10px 'Plex Mono', monospace"; c.textAlign = "left"; c.textBaseline = "middle";
    c.fillText("GPS", gps[0] + 18, gps[1] - 10);
    c.fillText("CAN bus", can[0] + 12, can[1] + 5);
    c.restore();
  }
  function arco(u) {                              // sube desde la punta de la antena y se curva hacia la base de la nube
    var e = (Math.exp(ACEL * u) - 1) / (Math.exp(ACEL) - 1), m = 1 - e;
    var fin = [N[0], N[1] + 14 * (W < 760 ? 1.25 : 1.6)], ctl = [PUNTA[0], (PUNTA[1] + fin[1]) / 2];
    return [m * m * PUNTA[0] + 2 * m * e * ctl[0] + e * e * fin[0], m * m * PUNTA[1] + 2 * m * e * ctl[1] + e * e * fin[1]];
  }
  function dibujar(t) {
    var P = COLORES[tema()], p = progreso();
    if (ver && !quieto) {
      if (p >= ETAPA.version && !verDisparo) { verDisparo = true; verT0 = t; }
      else if (p < ETAPA.version * 0.5 && verDisparo) { verDisparo = false; ponerPerilla(0); ponerVer(0); }
      if (verDisparo) { var x = valorGiro((t - verT0) * 1000); ponerPerilla(x); ponerVer(Math.max(0, Math.min(4, Math.floor(x + 1e-6)))); }
    }
    // los periféricos entran de a uno
    ramas.forEach(function (li, i) {
      var v = quieto ? 1 : tramo([ETAPA.ramas[0] + i * 0.07, ETAPA.ramas[0] + i * 0.07 + 0.14], p);
      li.style.opacity = v.toFixed(3); li.style.transform = v < 1 ? "translateY(" + ((1 - v) * 18).toFixed(1) + "px)" : "";
    });
    sec.style.setProperty("--ramas", tramo(ETAPA.ramas, p).toFixed(3));
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    var aAnt = tramo(ETAPA.antena, p), vNube = tramo(ETAPA.nube, p), senal = quieto ? 1 : tramo([ETAPA.senal, ETAPA.senal + 0.06], p);
    entradas(P, quieto ? 1 : tramo(ETAPA.entradas, p), t);
    antena(P, aAnt, t, quieto ? 0 : senal);
    if (quieto) {
      c.strokeStyle = "rgba(" + P.traza + ",.6)"; c.setLineDash([2, 5]); c.lineWidth = 1.2;
      c.beginPath(); for (var k = 0; k <= 20; k++) { var q = arco(k / 20); if (k) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); } c.stroke(); c.setLineDash([]);
    } else if (senal > 0) {
      var u = (t % CADA) / VUELO;
      if (u <= 1) {
        var a = Math.min(1, u / 0.08) * Math.min(1, (1 - u) / 0.02) * senal;
        c.lineWidth = 1.2 + 1.3 * Math.pow(u, 6);
        for (var j = 0; j < 14; j++) {
          var t1 = Math.max(0, u - j * 0.012), t0 = Math.max(0, u - (j + 1) * 0.012); if (t1 <= 0) break;
          var p1 = arco(t1), p0 = arco(t0);
          c.strokeStyle = "rgba(" + P.traza + "," + (a * (0.75 + 0.25 * u * u) * (1 - j / 14)).toFixed(3) + ")";
          c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke();
        }
        if (u > 0.97) llegada = t;
        if (u < 0.6) {                              // la trama que sale: qué lleva
          c.save(); c.globalAlpha = senal * Math.min(1, u / 0.1) * Math.min(1, (0.6 - u) / 0.2);
          c.fillStyle = P.texto; c.font = "500 10px 'Plex Mono', monospace"; c.textAlign = "right"; c.textBaseline = "middle";
          var tr = TRAMAS[Math.floor(t / CADA) % TRAMAS.length];
          if (tr[1]) c.fillStyle = "rgb(" + P.traza + ")";                   // emergencias y alertas, en cobre
          c.fillText(tr[0], PUNTA[0] - 12, PUNTA[1] - 6 - u * 10);           // a la izquierda: no invade los textos
          c.restore();
        }
      }
    }
    nube(P, t, vNube);
  }

  // botón «Pausar animación» propio de la sección (accesibilidad: lo que se mueve solo se puede detener)
  var raf = 0, visible = false, pausado = false, boton = sec.querySelector(".pausa-productos");
  if (boton) {
    if (quieto) boton.hidden = true;
    boton.addEventListener("click", function () {
      pausado = !pausado; boton.setAttribute("aria-pressed", String(pausado));
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
