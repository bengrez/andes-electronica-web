/* Productos y servicios del inicio (Benjamin, 2026-11-09: rediseño completo). Un solo mensaje: hardware hecho en casa
   que se entiende perfecto con nuestro software. Dos mitades en una sola escena, sin paradas de scroll:
   - izquierda, el hardware: el tacógrafo (ilustración con curvas de nivel) con «Tacógrafo v.N», cuyas letras cambian
     como paletas de v.1 a v.4 y en cada cambio muestran un instante su placa por dentro (iguales por fuera, distintos por
     dentro); la SmartCard y el display colgando de él; y la flota apilada en 2.5D (cada bus con su tacógrafo);
   - derecha, el software: la nube de SACEL (la misma del mapa, que viaja desde él al entrar la sección) y el dashboard
     con los buses del mapa (velocidad, detenido, geocerca), cuyas filas destellan cuando llega el pulso de su bus;
   - al centro, el ida y vuelta: los datos suben del tacógrafo a SACEL (cobre) y el firmware baja de SACEL al equipo.
   Pasar el mouse por un bus marca su fila del dashboard, y al revés. Con movimiento reducido, todo quieto. */
(function () {
  "use strict";
  var sec = document.querySelector(".prod-dos"), esc = sec && sec.querySelector(".prod-escena"), capa = esc && esc.querySelector(".prod-capa");
  if (!sec || !esc || !capa || !capa.getContext) return;
  var elTaco = esc.querySelector(".esc-taco"), elSC = esc.querySelector(".esc-smartcard"), elDi = esc.querySelector(".esc-display"),
      elBus = esc.querySelector(".esc-bus"), elRep = esc.querySelector(".esc-reportes"), elVer = esc.querySelector(".esc-version");
  var quieto = matchMedia("(prefers-reduced-motion: reduce)").matches, raf = 0, visible = false;
  var NB = 7, flota = [elBus];

  // la flota: copias del bus, sin ids
  var svgBus = elBus && elBus.querySelector("svg");
  for (var i = 0; i < NB - 1 && svgBus; i++) {
    var d = document.createElement("div"); d.className = "esc esc-bus esc-copia";
    var s = svgBus.cloneNode(true); [].forEach.call(s.querySelectorAll("[id]"), function (n) { n.removeAttribute("id"); });
    var t = s.querySelector("title"); if (t) t.remove(); var df = s.querySelector("defs"); if (df) df.remove();
    s.removeAttribute("aria-labelledby"); s.setAttribute("aria-hidden", "true");
    d.appendChild(s); esc.insertBefore(d, capa); flota.push(d);
  }

  var COL = {};
  function colores() {
    var claro = document.documentElement.getAttribute("data-tema") === "claro";
    COL = { claro: claro, nube: claro ? ["255,255,255", "232,235,241", "170,176,192"] : ["196,204,226", "130,140,170", "40,48,80"], nubeA: claro ? 1 : 0.85,
            cobre: claro ? "184,112,42" : "246,196,138", tinta: claro ? "0,16,79" : "242,237,227", texto: claro ? "rgba(0,16,79,.75)" : "rgba(242,237,227,.75)" };
  }
  function cl(x) { return Math.max(0, Math.min(1, x)); }
  function suave(x) { x = cl(x); return x * x * (3 - 2 * x); }
  function lerp(p, q, t) { return p + (q - p) * t; }
  function acel(u) { return (Math.exp(4 * u) - 1) / (Math.exp(4) - 1); }

  // la nube de SACEL, igual a la del mapa
  var COPOS = [[-18, 5, 7], [-11, 0, 10], [-3, -5, 12], [6, -6, 10], [12, 0, 10], [19, 5, 7.5], [-8, 6, 9], [3, 5, 10], [12, 7, 8], [-1, 0, 11]];
  function nube(c, x, y, s, brillo) {
    var a0 = c.globalAlpha;
    c.save(); c.translate(x, y); c.scale(s, s);
    COPOS.forEach(function (q) {
      var r = q[2], g = c.createRadialGradient(q[0] - r * 0.2, q[1] - r * 0.3, 0, q[0], q[1], r);
      g.addColorStop(0, "rgba(" + COL.nube[0] + ",.97)"); g.addColorStop(0.62, "rgba(" + COL.nube[0] + ",.92)");
      g.addColorStop(0.86, "rgba(" + COL.nube[1] + ",.55)"); g.addColorStop(1, "rgba(" + COL.nube[1] + ",0)");
      c.globalAlpha = a0 * COL.nubeA; c.fillStyle = g; c.beginPath(); c.arc(q[0], q[1], r, 0, 7); c.fill();
    });
    c.globalAlpha = a0;
    for (var i = 0; i < 4; i++) {
      var hb = 3 + [3, 6, 4, 7][i] * (0.55 + 0.45 * brillo);
      c.fillStyle = "rgba(" + COL.cobre + "," + (0.5 + 0.5 * brillo).toFixed(3) + ")"; c.fillRect(-8 + i * 4.6, 7 - hb, 3, hb);
    }
    c.fillStyle = COL.texto; c.font = "600 15.75px 'Plex Mono', monospace"; c.textAlign = "right"; c.textBaseline = "middle";
    c.fillText("SACEL", -26, 2);
    c.restore();
  }
  function pulso(c, x, y, al, rgb) {
    var g = c.createRadialGradient(x, y, 0, x, y, 6);
    g.addColorStop(0, "rgba(" + (rgb || COL.cobre) + "," + (0.95 * al).toFixed(3) + ")"); g.addColorStop(1, "rgba(" + (rgb || COL.cobre) + ",0)");
    c.fillStyle = g; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill();
  }
  function linea(c, p, q, al) {
    c.save(); c.globalAlpha = al; c.strokeStyle = "rgba(" + COL.tinta + ",.3)"; c.setLineDash([2, 5]); c.lineWidth = 1;
    c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); c.restore();
  }
  function rotulo(c, txt, x, y, alin) {
    c.save(); c.font = "500 10.5px 'Plex Mono', monospace"; c.fillStyle = COL.texto; c.textAlign = alin || "left"; c.textBaseline = "middle";
    c.fillText(txt, x, y); c.restore();
  }
  function poner(el, x, y, w, op) {
    if (!el) return;
    el.style.left = x.toFixed(1) + "px"; el.style.top = y.toFixed(1) + "px"; el.style.width = w.toFixed(1) + "px";
    el.style.opacity = op.toFixed(3); el.style.visibility = op > 0.01 ? "visible" : "hidden";
  }

  // «Tacógrafo v.N» y su placa por dentro: cuenta de v.1 a v.4 cuando la sección entra a la pantalla
  var verN = 0, verT = -1, placaN = 0, placaT = -9;
  function version(t) {
    if (!elVer) return;
    var n = quieto ? 4 : (verT < 0 ? 1 : Math.min(4, 1 + Math.floor((t - verT) / 1.3)));
    if (n === verN) return; verN = n; if (!quieto) { placaN = n; placaT = t; }
    var txt = "Tacógrafo v." + n; elVer.innerHTML = "";
    for (var i = 0; i < txt.length; i++) {
      var sp = document.createElement("span"); sp.textContent = txt[i] === " " ? " " : txt[i];
      if (i === txt.length - 1) sp.className = "num";
      if (!quieto) { sp.style.animationDelay = (i * 35) + "ms"; sp.classList.add("paleta"); }
      elVer.appendChild(sp);
    }
  }
  var PLACAS = { 1: [[0.3, 0.5, 0.3, 0.5]], 2: [[0.25, 0.5, 0.22, 0.4], [0.68, 0.45, 0.2, 0.36]], 3: [[0.3, 0.52, 0.26, 0.5], [0.72, 0.3, 0.16, 0.24], [0.72, 0.72, 0.16, 0.22]],
                 4: [[0.28, 0.5, 0.2, 0.42], [0.56, 0.32, 0.14, 0.22], [0.56, 0.7, 0.14, 0.22], [0.82, 0.5, 0.12, 0.46]] };
  function placa(c, x, y, t) {
    var e = t - placaT, a2 = cl(e / 0.2) * cl((1.5 - e) / 0.4); if (a2 <= 0.01 || !PLACAS[placaN]) return;
    var w = 110, h = 56;
    c.save(); c.globalAlpha = a2;
    c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, 5); else c.rect(x, y, w, h);
    c.fillStyle = COL.claro ? "rgba(255,255,255,.8)" : "rgba(10,14,26,.85)"; c.fill(); c.strokeStyle = "rgba(" + COL.tinta + ",.7)"; c.lineWidth = 1.2; c.stroke();
    c.strokeStyle = "rgba(" + COL.tinta + ",.35)"; c.lineWidth = 1; c.beginPath();
    PLACAS[placaN].forEach(function (q, i) { var px = x + q[0] * w, py = y + q[1] * h; c.moveTo(x + 6, py); c.lineTo(px - q[2] * w / 2, py); if (i) { c.moveTo(px, py - q[3] * h / 2); c.lineTo(px, y + 4); } });
    c.stroke();
    PLACAS[placaN].forEach(function (q, i) {
      var cw = q[2] * w, ch = q[3] * h; c.fillStyle = i ? "rgba(" + COL.cobre + ",.25)" : "rgba(" + COL.tinta + ",.18)";
      c.fillRect(x + q[0] * w - cw / 2, y + q[1] * h - ch / 2, cw, ch); c.strokeStyle = "rgba(" + COL.tinta + ",.7)"; c.strokeRect(x + q[0] * w - cw / 2, y + q[1] * h - ch / 2, cw, ch);
    });
    c.fillStyle = COL.texto; c.font = "500 10px 'Plex Mono', monospace"; c.textAlign = "left"; c.textBaseline = "bottom";
    c.fillText("por dentro · v." + placaN, x, y - 4);
    c.restore();
  }

  // el dashboard con los buses del mapa (flota-3d.js publica SACEL_MAPA); fuera de pantalla el mapa se detiene, así que
  // aquí se toma su último estado y la velocidad varía un poco alrededor de él
  var llegada = [], filasRect = [], resaltado = -1;
  function estadoBus(j, t) {
    var m = window.SACEL_MAPA && window.SACEL_MAPA.buses && window.SACEL_MAPA.buses[j], onda = Math.sin(t * 0.2 + j * 2.3);
    if (m) return { v: m.detenido ? 0 : Math.max(0, Math.round(m.kmh + 6 * Math.sin(t * 0.5 + j))), geo: m.geocerca, det: m.detenido };
    return { v: onda > 0.82 ? 0 : Math.round(32 + 58 * (0.5 + 0.5 * Math.sin(t * 0.37 + j * 1.7))), geo: Math.sin(t * 0.13 + j * 1.1) > 0.9, det: onda > 0.82 };
  }
  function tablero(c, x, y, w, t) {
    var sx = x + w * 40 / 320, sy = y + w * 74 / 320, sw = w * 240 / 320, sh = w * 106 / 320, fila = sh / (NB + 1.4);
    c.save(); c.textBaseline = "middle";
    c.font = "500 " + Math.max(8, fila * 0.62).toFixed(1) + "px 'Plex Mono', monospace"; c.fillStyle = COL.texto; c.textAlign = "left";
    c.fillText("SACEL · flota en línea", sx, sy + fila * 0.55);
    filasRect = [];
    for (var j = 0; j < NB; j++) {
      var yy = sy + fila * (1.4 + j) + fila * 0.5, e = estadoBus(j, t), destello = Math.max(0, 1 - (t - (llegada[j] || -9)) / 0.8);
      filasRect.push([sx - 3, yy - fila * 0.5, sw + 6, fila]);
      if (destello > 0 || resaltado === j) { c.fillStyle = "rgba(" + COL.cobre + "," + (resaltado === j ? 0.22 : 0.18 * destello).toFixed(3) + ")"; c.fillRect(sx - 3, yy - fila * 0.48, sw + 6, fila * 0.96); }
      c.fillStyle = COL.texto; c.textAlign = "left"; c.fillText("Bus " + (j + 1), sx, yy);
      var bx0 = sx + sw * 0.28, bw0 = sw * 0.42;
      c.fillStyle = "rgba(" + COL.tinta + ",.1)"; c.fillRect(bx0, yy - fila * 0.18, bw0, fila * 0.36);
      c.fillStyle = e.v > 80 ? "rgba(" + COL.cobre + ",.95)" : "rgba(" + COL.tinta + ",.75)"; c.fillRect(bx0, yy - fila * 0.18, bw0 * e.v / 100, fila * 0.36);
      c.textAlign = "right"; c.fillStyle = e.det || e.geo ? "rgba(" + COL.cobre + ",.95)" : COL.texto;
      c.fillText(e.geo ? "geocerca" : (e.det ? "detenido" : e.v + " km/h"), sx + sw, yy);
    }
    c.restore();
  }

  // ─── la escena ───
  var posNube = null;
  function escena(t) {
    var W = esc.clientWidth, H = esc.clientHeight; if (!W || !H) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (capa.width !== Math.round(W * dpr) || capa.height !== Math.round(H * dpr)) { capa.width = Math.round(W * dpr); capa.height = Math.round(H * dpr); }
    var c = capa.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    var angosto = W < 640;
    // las dos mitades: lado a lado en escritorio, una sobre otra en el celular
    var hw = angosto ? [0, 0, W, H * 0.58] : [0, 0, W * 0.46, H], sw = angosto ? [0, H * 0.6, W, H * 0.4] : [W * 0.56, 0, W * 0.44, H];
    // hardware: el tacógrafo arriba, los periféricos debajo y la flota abajo
    var tw = Math.min(hw[2] * 0.62, 300), tx = hw[0] + (hw[2] - tw) / 2, ty = hw[1] + hw[3] * 0.14, th = tw * 190 / 500;
    poner(elTaco, tx, ty, tw, 1);
    if (elVer) { elVer.style.left = (tx + tw / 2).toFixed(1) + "px"; elVer.style.top = (ty + 6).toFixed(1) + "px"; }
    var antena = [tx + tw * 380 / 500, ty + th * 52 / 190], salidaTaco = [tx + tw / 2, ty + th * 0.95];
    var pw = tw * 0.42, py = ty + th + hw[3] * 0.06, scX = tx - tw * 0.08, diX = tx + tw * 0.5;
    poner(elSC, scX, py, pw * 0.75, 1); poner(elDi, diX, py + pw * 0.1, pw * 1.3, 1);
    [[scX + pw * 0.75 * 57 / 290, py + pw * 0.75 * 52 / 290], [diX + pw * 0.65, py + pw * 0.1 + pw * 1.3 * 56 / 480]].forEach(function (q, j) {
      var my = (salidaTaco[1] + q[1]) / 2;
      c.save(); c.strokeStyle = "rgba(" + COL.tinta + ",.3)"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(salidaTaco[0], salidaTaco[1]); c.lineTo(salidaTaco[0], my); c.lineTo(q[0], my); c.lineTo(q[0], q[1]); c.stroke(); c.restore();
      if (!quieto) {
        var f = (t * 0.4 + j * 0.5) % 1, L1 = Math.abs(my - salidaTaco[1]), L2 = Math.abs(q[0] - salidaTaco[0]), L3 = Math.abs(q[1] - my), sR = f * (L1 + L2 + L3), pp;
        if (sR < L1) pp = [salidaTaco[0], salidaTaco[1] + (my - salidaTaco[1]) * sR / L1];
        else if (sR < L1 + L2) pp = [salidaTaco[0] + (q[0] - salidaTaco[0]) * (sR - L1) / L2, my];
        else pp = [q[0], my + (q[1] - my) * (sR - L1 - L2) / L3];
        pulso(c, pp[0], pp[1], Math.sin(f * Math.PI));
      }
    });
    // la flota apilada en 2.5D, abajo de la mitad del hardware
    var wF = Math.min(hw[2] * 0.3, 150), yF = hw[1] + hw[3] * 0.97, cxF = hw[0] + hw[2] / 2;
    var FILAS = [{ s: 0.5, dy: -1.45, dx: 0.07, op: 0.5 }, { s: 0.72, dy: -0.8, dx: 0.035, op: 0.78 }, { s: 1, dy: 0, dx: -0.03, op: 1 }];
    var PUESTOS = [[2, 0], [0, -0.62], [1, -0.62], [2, -1.08], [2, 1.08], [1, 0.62], [0, 0.62]];
    var ants = [[antena[0], antena[1], -1]];
    flota.forEach(function (el, j) {
      var f = FILAS[PUESTOS[j][0]], w = wF * f.s, x = cxF + PUESTOS[j][1] * wF * 1.12 * f.s + hw[2] * f.dx - w / 2, y = yF + f.dy * wF * 196 / 520 - w * 196 / 520;
      poner(el, x, y, w, f.op); el.style.zIndex = 1 + PUESTOS[j][0]; el.classList.toggle("resaltado", resaltado === j);
      ants.push([x + w * 462 / 520, y + w * 24 / 520, j]);
    });
    // software: la nube arriba y el dashboard debajo
    var nx = sw[0] + sw[2] / 2 + 30, ny = sw[1] + (angosto ? 22 : sw[3] * 0.12);
    var rw = Math.min(sw[2] * 0.92, 380), rx = sw[0] + (sw[2] - rw) / 2, ry = ny + 40;
    poner(elRep, rx, ry, rw, 1);
    linea(c, [nx - 30, ny + 18], [nx - 30, ry + 6], 1);
    posNube = [nx, ny];
    // el ida y vuelta: datos que suben (cobre) y el firmware que baja al tacógrafo (tinta)
    var brillo = 0, destino = [nx - 24, ny + 20];
    ants.forEach(function (p, k) {
      var f = quieto ? 0.5 : ((t / 2.8) + k * 0.17) % 1, u = acel(f);
      linea(c, [p[0], p[1]], destino, k ? 0.18 : 1);   // las de la flota, muy tenues
      if (!quieto) pulso(c, lerp(p[0], destino[0], u), lerp(p[1], destino[1], u), Math.sin(f * Math.PI) * (k ? 0.7 : 1));
      if (!quieto && f > 0.92) { brillo = Math.max(brillo, (f - 0.92) / 0.08); if (p[2] >= 0 && (!llegada[p[2]] || t - llegada[p[2]] > 1)) llegada[p[2]] = t; }
    });
    if (!quieto) { var fb = (t / 5.5) % 1; if (fb < 0.6) { var ub = suave(fb / 0.6); pulso(c, lerp(destino[0], antena[0], ub), lerp(destino[1], antena[1], ub), Math.sin(fb / 0.6 * Math.PI), COL.tinta); } }
    var mid = [(antena[0] + destino[0]) / 2, (antena[1] + destino[1]) / 2];
    rotulo(c, "datos ↑  ·  firmware ↓", Math.min(mid[0] + 8, W - 140), mid[1] - 12);
    placa(c, tx - 4, ty - 84, t);
    if (puenteVis() > 0) nube(c, nx, ny, 1.6, brillo);
    tablero(c, rx, ry, rw, t);
    version(t);
  }

  // el puente: al entrar la sección, la nube del mapa viaja hasta su lugar en la escena (lienzo fijo); el mapa deja de
  // dibujarla mientras tanto (flota-3d.js lee SACEL_PUENTE)
  var puente = null, pPuente = 1, mapaNube = null;
  function puenteVis() { return pPuente > 0 && pPuente < 1 ? 0 : 1; }
  function puenteCuadro() {
    if (quieto) { window.SACEL_PUENTE = 0; return; }
    var r = esc.getBoundingClientRect(), u = cl(1 - r.top / innerHeight);
    var m = window.SACEL_MAPA && window.SACEL_MAPA.nube;
    if (m) mapaNube = m;
    pPuente = mapaNube ? u : 1;
    window.SACEL_PUENTE = pPuente > 0 && pPuente < 1 ? 1 : 0;
    if (!puente) { puente = document.createElement("canvas"); puente.className = "puente-nube"; puente.setAttribute("aria-hidden", "true"); document.body.appendChild(puente); }
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
    if (puente.width !== Math.round(W * dpr) || puente.height !== Math.round(H * dpr)) { puente.width = Math.round(W * dpr); puente.height = Math.round(H * dpr); }
    var c = puente.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    if (!window.SACEL_PUENTE || !posNube) return;
    var s = suave(pPuente);
    nube(c, lerp(mapaNube.x, r.left + posNube[0], s), lerp(mapaNube.y, r.top + posNube[1], s), lerp(mapaNube.esc, 1.6, s), 0.3);
  }

  // mouse: un bus marca su fila del dashboard, y una fila marca su bus
  esc.addEventListener("pointermove", function (ev) {
    var r = esc.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, h = -1;
    filasRect.forEach(function (q, j) { if (x >= q[0] && x <= q[0] + q[2] && y >= q[1] && y <= q[1] + q[3]) h = j; });
    if (h < 0) flota.forEach(function (el, j) { var b = el.getBoundingClientRect(); if (ev.clientX >= b.left && ev.clientX <= b.right && ev.clientY >= b.top && ev.clientY <= b.bottom) h = j; });
    resaltado = h; if (quieto) escena(0);
  });
  esc.addEventListener("pointerleave", function () { resaltado = -1; if (quieto) escena(0); });

  function cuadro(ahora) {
    raf = 0; var t = ahora / 1000;
    if (verT < 0) { verT = t; verN = 0; }
    escena(t); puenteCuadro();
    if (visible && !document.hidden && !quieto) raf = requestAnimationFrame(cuadro);
  }
  function arrancar() { if (!raf && visible) raf = requestAnimationFrame(cuadro); }
  colores();
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (!visible) verT = -1; arrancar(); }, { rootMargin: "0px 0px 300px 0px" }).observe(sec);
  document.addEventListener("visibilitychange", arrancar);
  window.addEventListener("scroll", function () { arrancar(); puenteCuadro(); }, { passive: true });
  window.addEventListener("resize", function () { if (quieto) escena(0); });
  new MutationObserver(function () { colores(); if (quieto) escena(0); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  if (document.fonts) document.fonts.ready.then(function () { escena(performance.now() / 1000); });
  escena(0);
})();
