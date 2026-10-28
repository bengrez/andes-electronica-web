/* Portada, variante «cordillera»: el camino visto de lado, de noche. El suelo es el perfil real del camino
   (de 600 a 2.100 m) y detrás se escalonan cuatro cortes reales del terreno, paralelos al camino y a 1,2, 3, 6 y
   10,5 km hacia el norte, cada uno más claro por la distancia. Los buses van de perfil, con las ventanas encendidas y los focos.
   Necesita datos/h25.js y flota-sim.js. */
(function () {
  "use strict";
  var D = window.H25, lienzo = document.getElementById("flota");
  if (!D || !window.FlotaSim || !lienzo || !lienzo.getContext) return;
  var ctx = lienzo.getContext("2d"), sim = window.FlotaSim(D), P = D.perfil;
  var EXAG_MIN = 450, EXAG_MAX = 3300;          // m: rango de altitudes que ocupa la escena

  var W = 0, H = 0, dpr = 1, fondo = null, reg = null, esc = {};
  // s (m a lo largo del camino) → x en pantalla; altitud → y
  function X(s) { return esc.x0 + (s - esc.s0) / (sim.LARGO - esc.s0) * (esc.x1 - esc.x0); }
  function Y(e) { return esc.base - (e - EXAG_MIN) * esc.kz; }
  function sDeMuestra(i) { return i / (P.ruta.length - 1) * sim.LARGO; }

  function maquetar() {
    var movil = W < 760;
    esc = movil
      ? { s0: sim.LARGO * 0.3, x0: -10, x1: W + 10, base: H + 6, kz: 330 / (EXAG_MAX - EXAG_MIN) }
      : { s0: 0, x0: 0.03 * W, x1: 0.99 * W, base: H * 0.975, kz: H * 0.66 / (EXAG_MAX - EXAG_MIN) };
    reg = movil ? { x: W * 0.06, y: H - 390, w: W * 0.88, fila: 7 } : { x: W * 0.55, y: H * 0.13, w: W * 0.41, fila: 8 };
  }

  var semilla = 91;
  function azar() { semilla = (semilla * 1664525 + 1013904223) >>> 0; return semilla / 4294967296; }

  function capa(c, alturas, relleno, borde, nieve) {
    var n = alturas.length, k, techo = Infinity;
    c.beginPath();
    c.moveTo(-10, Y(alturas[0]));                       // la capa sigue plana hasta los bordes de la pantalla
    for (k = 0; k < n; k++) { var x = X(sDeMuestra(k)), y = Y(alturas[k]); techo = Math.min(techo, y); c.lineTo(x, y); }
    c.lineTo(W + 10, Y(alturas[n - 1])); c.lineTo(W + 10, H + 10); c.lineTo(-10, H + 10); c.closePath();
    var g = c.createLinearGradient(0, techo, 0, H);
    g.addColorStop(0, relleno[0]); g.addColorStop(1, relleno[1]);
    c.fillStyle = g; c.fill();
    // filo de la capa y, sobre 2.500 m, nieve con luz de luna
    c.lineJoin = "round";
    c.beginPath(); c.moveTo(-10, Y(alturas[0]));
    for (k = 0; k < n; k++) c.lineTo(X(sDeMuestra(k)), Y(alturas[k]));
    c.lineTo(W + 10, Y(alturas[n - 1]));
    c.strokeStyle = borde; c.lineWidth = 1; c.stroke();
    if (nieve) {
      c.strokeStyle = "rgba(226,232,250,.6)"; c.lineWidth = 1.6;
      for (k = 1; k < n; k++) {
        if (alturas[k] < 2500 || alturas[k - 1] < 2500) continue;
        c.beginPath(); c.moveTo(X(sDeMuestra(k - 1)), Y(alturas[k - 1])); c.lineTo(X(sDeMuestra(k)), Y(alturas[k])); c.stroke();
      }
    }
  }

  function pintarFondo() {
    fondo = document.createElement("canvas");
    fondo.width = lienzo.width; fondo.height = lienzo.height;
    var c = fondo.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cielo = c.createLinearGradient(0, 0, 0, H);
    cielo.addColorStop(0, "#00061f"); cielo.addColorStop(0.62, "#0b1b5e"); cielo.addColorStop(1, "#13246b");
    c.fillStyle = cielo; c.fillRect(0, 0, W, H);
    semilla = 91;
    for (var e = 0; e < 90; e++) {
      c.fillStyle = "rgba(242,237,227," + (0.15 + azar() * 0.45).toFixed(2) + ")";
      c.fillRect(azar() * W, azar() * H * 0.55, 1.2, 1.2);
    }
    // de la capa más lejana a la más cercana
    var colores = [
      [["#0a1650", "#061038"], "rgba(150,165,215,.22)"],
      [["#0d1a58", "#071140"], "rgba(160,175,225,.20)"],
      [["#14226a", "#0a154a"], "rgba(175,190,235,.20)"],
      [["#1d2d7a", "#101c58"], "rgba(190,205,240,.22)"]
    ];
    for (var b = P.cortes.length - 1; b >= 0; b--) capa(c, P.cortes[b][1], colores[b][0], colores[b][1], true);
    // suelo y camino (el perfil del camino es la capa del frente)
    capa(c, P.ruta, ["#050c33", "#020822"], "rgba(0,0,0,0)", false);
    c.beginPath(); c.moveTo(-10, Y(P.ruta[0]));
    for (var k = 0; k < P.ruta.length; k++) c.lineTo(X(sDeMuestra(k)), Y(P.ruta[k]));
    c.lineTo(W + 10, Y(P.ruta[P.ruta.length - 1]));
    c.strokeStyle = "#232c55"; c.lineWidth = 5; c.stroke();
    c.strokeStyle = "rgba(242,237,227,.5)"; c.lineWidth = 1; c.translate(0, -2.5); c.stroke(); c.translate(0, 2.5);
    // tachas reflectantes
    c.fillStyle = "rgba(246,196,138,.7)";
    for (var t = 0; t < sim.LARGO; t += (sim.LARGO - esc.s0) / (W / 26)) {
      if (t < esc.s0) continue;
      c.fillRect(X(t) - 0.6, Y(sim.altitud(t)) + 0.4, 1.2, 1.2);
    }
    c.fillStyle = "rgba(2,8,36,.55)";
    c.beginPath();
    if (c.roundRect) c.roundRect(reg.x - 14, reg.y - 28, reg.w + 28, 6 * reg.fila + 40, 8); else c.rect(reg.x - 14, reg.y - 28, reg.w + 28, 6 * reg.fila + 40);
    c.fill();
  }

  // bus de perfil, mirando hacia +x, con las ruedas sobre y = 0
  function bus(c, alerta, encendido) {
    c.save();
    c.globalCompositeOperation = "lighter";
    if (encendido) {
    var g = c.createRadialGradient(13, -4, 0, 13, -4, 80);
    g.addColorStop(0, "rgba(255,232,196,.42)"); g.addColorStop(1, "rgba(255,232,196,0)");
    c.fillStyle = g; c.beginPath(); c.moveTo(13, -5.5); c.lineTo(93, -14); c.lineTo(93, 8); c.lineTo(13, -2.5); c.closePath(); c.fill();
    }
    if (alerta) { c.fillStyle = "rgba(255,221,180,.22)"; c.beginPath(); c.arc(0, -6, 18, 0, 7); c.fill(); }
    c.restore();
    c.fillStyle = "#ece3d2"; c.beginPath();
    if (c.roundRect) c.roundRect(-13, -12.5, 26, 10.5, [2.5, 3.5, 1.5, 1.5]); else c.rect(-13, -12.5, 26, 10.5);
    c.fill();
    c.fillStyle = "#f6c48a"; c.fillRect(-10.5, -10.8, 19.5, 3.6);              // ventanas encendidas
    c.fillStyle = "#ece3d2";
    for (var v = -7.5; v < 9; v += 3.3) c.fillRect(v, -10.8, 0.7, 3.6);          // parantes
    c.fillStyle = "#ffd9a6"; c.fillRect(10.2, -10.8, 2.2, 5.2);                 // parabrisas
    c.fillStyle = "#d08a3e"; c.fillRect(-13, -5.4, 26, 1.1);                    // franja
    c.fillStyle = "#ffe9c8"; c.fillRect(12.2, -4.6, 1, 1.6);                    // foco
    c.fillStyle = "#c8653f"; c.fillRect(-13, -4.6, 0.9, 1.6);                   // luz trasera
    [-7.5, 7.5].forEach(function (rx) {
      c.beginPath(); c.arc(rx, -1.6, 2.5, 0, 7); c.fillStyle = "#03081f"; c.fill();
      c.beginPath(); c.arc(rx, -1.6, 0.9, 0, 7); c.fillStyle = "rgba(242,237,227,.6)"; c.fill();
    });
  }

  function paso(dt) {
    if (dt) sim.avanzar(dt);
    if (!fondo) return;
    var c = ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, lienzo.width, lienzo.height);
    c.drawImage(fondo, 0, 0);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    sim.dibujarRegistro(c, reg);
    sim.dibujarTramas(c, reg, function (tr) { return [X(tr.s), Y(sim.altitud(tr.s)) - 8]; });
    sim.buses.forEach(function (b, i) {
      var s = sim.posicion(b);
      if (s < esc.s0) return;
      var x = X(s), y = Y(sim.altitud(s)) - 2.5;
      // en los extremos los buses que esperan se ordenan uno al lado del otro
      if (b.v === 0 && (s < 5 || s > sim.LARGO - 5)) x += (s < 5 ? 1 : -1) * (i % 3) * 30;
      var d = 400, a = Math.atan2(Y(sim.altitud(s + d)) - Y(sim.altitud(s - d)), X(s + d) - X(s - d));
      a = Math.max(-0.4, Math.min(0.4, a));
      c.save(); c.translate(x, y); c.rotate(a); c.scale(1.35, 1.35);
      if (b.dir < 0) c.scale(-1, 1);
      bus(c, sim.exceso(b), b.v > 0.3);
      c.restore();
    });
  }

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = lienzo.clientWidth; H = lienzo.clientHeight;
    lienzo.width = Math.round(W * dpr); lienzo.height = Math.round(H * dpr);
    maquetar(); pintarFondo();
  }
  window.FlotaCiclo(lienzo, medir, paso);
})();
