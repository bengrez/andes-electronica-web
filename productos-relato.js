/* Productos y servicios del inicio (Benjamin, 2026-11-09, plan aprobado). El mismo hilo que el mapa: el tacógrafo queda
   siempre al centro de la escena y, en 3 fases (una por paso de la rueda, flecha o AvPág; etapas.js da las muescas y la
   transición corre sola y se funde), aparecen sobre él:
   1) Hecho en Andes: «Tacógrafo v.N» cambia como paletas de v.1 a v.4 y, en cada cambio, muestra su placa por dentro
      (iguales por fuera, distintos por dentro);
   2) Lo que se conecta: la SmartCard y el display cuelgan del taco, con pulsos de cobre;
   3) En sintonía con SACEL: el taco baja y se achica, arriba llega la nube de SACEL (la del mapa, por el puente), los
      datos suben (cobre) y el firmware baja (tinta), y detrás aparece la flota en 2.5D, cada bus con su pulso.
   Texto a la izquierda: la fase activa se destaca y despliega su texto. En el celular (con movimiento), la escena va bajo
   el título y recorre sola las fases en bucle; con movimiento reducido, quieta en la fase 3. */
(function () {
  "use strict";
  var rec = document.querySelector(".prod-recorrido"), sec = rec && rec.querySelector(".prod-relato");
  var esc = sec && sec.querySelector(".prod-escena"), capa = esc && esc.querySelector(".prod-capa");
  if (!rec || !sec || !esc || !capa || !capa.getContext) return;
  var fases = [].slice.call(sec.querySelectorAll(".prod-fases li"));
  var elTaco = esc.querySelector(".esc-taco"), elSC = esc.querySelector(".esc-smartcard"), elDi = esc.querySelector(".esc-display"),
      elBus = esc.querySelector(".esc-bus"), elVer = esc.querySelector(".esc-version");
  var mqVivo = matchMedia("(min-width: 47.51rem) and (prefers-reduced-motion: no-preference)");
  var mqMov = matchMedia("(prefers-reduced-motion: no-preference)");
  var N = 2, DUR = 1.6, a = 0, raf = 0, tPrev = 0, visible = false, faseVisible = -1;
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
  function k(a, d, h) { return suave((a - d) / (h - d)); }
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
    if (al <= 0.01) return;
    c.save(); c.globalAlpha = al; c.strokeStyle = "rgba(" + COL.tinta + ",.3)"; c.setLineDash([2, 5]); c.lineWidth = 1;
    c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); c.restore();
  }
  function rotulo(c, txt, x, y, al) {
    if (al <= 0.01) return;
    c.save(); c.globalAlpha = al; c.font = "500 10.5px 'Plex Mono', monospace"; c.fillStyle = COL.texto; c.textAlign = "left"; c.textBaseline = "middle";
    c.fillText(txt, x, y); c.restore();
  }
  function poner(el, x, y, w, op) {
    if (!el) return;
    el.style.left = x.toFixed(1) + "px"; el.style.top = y.toFixed(1) + "px"; el.style.width = w.toFixed(1) + "px";
    el.style.opacity = op.toFixed(3); el.style.visibility = op > 0.01 ? "visible" : "hidden";
  }

  // «Tacógrafo v.N» y su placa por dentro: cuenta de v.1 a v.4 al llegar a la fase 1
  var verN = 0, verT = -1, placaN = 0, placaT = -9;
  function version(t, fijo, a) {
    if (!elVer) return;
    var n = fijo || (verT < 0 && a > 0.9) ? 4 : (verT < 0 ? 1 : Math.min(4, 1 + Math.floor((t - verT) / 1.3)));   // fuera de la fase 1 queda en v.4
    if (n === verN) return; verN = n; if (!fijo) { placaN = n; placaT = t; }
    var txt = "Tacógrafo v." + n; elVer.innerHTML = "";
    for (var i = 0; i < txt.length; i++) {
      var sp = document.createElement("span"); sp.textContent = txt[i] === " " ? " " : txt[i];
      if (i === txt.length - 1) sp.className = "num";
      if (!fijo) { sp.style.animationDelay = (i * 35) + "ms"; sp.classList.add("paleta"); }
      elVer.appendChild(sp);
    }
  }
  var PLACAS = { 1: [[0.3, 0.5, 0.3, 0.5]], 2: [[0.25, 0.5, 0.22, 0.4], [0.68, 0.45, 0.2, 0.36]], 3: [[0.3, 0.52, 0.26, 0.5], [0.72, 0.3, 0.16, 0.24], [0.72, 0.72, 0.16, 0.22]],
                 4: [[0.28, 0.5, 0.2, 0.42], [0.56, 0.32, 0.14, 0.22], [0.56, 0.7, 0.14, 0.22], [0.82, 0.5, 0.12, 0.46]] };
  function placa(c, x, y, t, al) {
    var e = t - placaT, a2 = al * cl(e / 0.2) * cl((1.5 - e) / 0.4); if (a2 <= 0.01 || !PLACAS[placaN]) return;
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

  // el texto en una matriz de 7 filas de puntos, con una letra de 5 × 7 propia (sólo los signos que se usan)
  var LETRA = {"0": "01110100011001110101110011000101110", "1": "00100011000010000100001000010001110", "2": "01110100010000100010001000100011111", "3": "11110000010000101110000010000111110", "4": "00010001100101010010111110001000010", "5": "11111100001111000001000011000101110", "6": "00110010001000011110100011000101110", "7": "11111000010001000100010000100001000", "8": "01110100011000101110100011000101110", "9": "01110100011000101111000010001001100", "k": "10000100001001010100110001010010010", "m": "00000000001101010101101011010110101", "h": "10000100001011011001100011000110001", "/": "00001000100001000100010000100010000", "c": "00000000000111010000100001000101110", "o": "00000000000111010001100011000101110", "n": "00000000001011011001100011000110001", "d": "00001000010110110011100011000101111", "u": "00000000001000110001100011001101101", "i": "00100000000110000100001000010001110", "ó": "00010001000111010001100011000101110", "r": "00000000001011011001100001000010000", "t": "01000010001110001000010000100100110", "M": "10001110111010110101100011000110001", "R": "11110100011000111110101001001010001", "j": "00010000000011000010000101001001100", "a": "00000000000111000001011111000101111", "s": "00000000000111110000011100000111110", ".": "00000000000000000000000000110001100", ":": "00000011000110000000011000110000000", "·": "00000000000000001100011000000000000", " ": "00000000000000000000000000000000000"};
  var cacheMatriz = {};
  function matriz(txt) {
    if (cacheMatriz[txt]) return cacheMatriz[txt];
    var ancho = txt.length * 6, px = new Uint8Array(ancho * 7);
    for (var n = 0; n < txt.length; n++) {
      var g = LETRA[txt[n]] || LETRA[" "];
      for (var y = 0; y < 7; y++) for (var x = 0; x < 5; x++) px[y * ancho + n * 6 + x] = g.charCodeAt(y * 5 + x) === 49 ? 1 : 0;
    }
    if (Object.keys(cacheMatriz).length > 40) cacheMatriz = {};
    return (cacheMatriz[txt] = { px: px, ancho: ancho });
  }

  // ─── la escena para un avance a (0–2) ───
  var posNube = null;
  function escena(a, t, fijo) {
    var W = esc.clientWidth, H = esc.clientHeight; if (!W || !H) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (capa.width !== Math.round(W * dpr) || capa.height !== Math.round(H * dpr)) { capa.width = Math.round(W * dpr); capa.height = Math.round(H * dpr); }
    var c = capa.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    var e2 = k(a, 0.3, 1), e3 = k(a, 1.3, 2), cx = W / 2;
    // el taco: mediano (40 %), algo bajo la mitad; sube un poco con los periféricos; en la fase 3 baja y se achica (32 %)
    var tw = lerp(W * 0.4, W * 0.32, e3), th = tw * 190 / 500, ty = lerp(lerp(H * 0.42, H * 0.3, e2), H * 0.5, e3), tx = cx - tw / 2;
    poner(elTaco, tx, ty, tw, 1); elTaco.style.zIndex = 4;
    if (elVer) { elVer.style.left = cx.toFixed(1) + "px"; elVer.style.top = (ty - 22).toFixed(1) + "px"; }
    var antena = [tx + tw * 380 / 500, ty + th * 52 / 190], salida = [cx, ty + th * 0.95];
    // fase 1: la placa por dentro, a la izquierda del taco
    if (!fijo) placa(c, Math.max(4, tx - 122), ty - 70, t, 1 - k(a, 0.5, 0.9));
    // fase 2: los periféricos cuelgan del taco
    var vP = e2 * (1 - 0.75 * e3), pw = tw * 0.42, py = ty + th + H * 0.08;
    var scX = cx - tw * 0.56, diX = cx - tw * 0.06;
    poner(elSC, scX, py + (1 - e2) * 14, pw * 0.75, vP); poner(elDi, diX, py + pw * 0.1 + (1 - e2) * 14, pw * 1.45, vP);
    if (vP > 0.01) [[scX + pw * 0.75 * 57 / 290, py + pw * 0.75 * 52 / 290], [diX + pw * 0.725, py + pw * 0.1 + pw * 1.45 * 56 / 480]].forEach(function (q, j) {
      var my = (salida[1] + q[1]) / 2;
      c.save(); c.globalAlpha = vP; c.strokeStyle = "rgba(" + COL.tinta + ",.3)"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(salida[0], salida[1]); c.lineTo(salida[0], my); c.lineTo(q[0], my); c.lineTo(q[0], q[1]); c.stroke();
      if (!fijo) {
        var f = (t * 0.4 + j * 0.5) % 1, L1 = Math.abs(my - salida[1]), L2 = Math.abs(q[0] - salida[0]), L3 = Math.abs(q[1] - my), sR = f * (L1 + L2 + L3), pp;
        if (sR < L1) pp = [salida[0], salida[1] + (my - salida[1]) * sR / L1];
        else if (sR < L1 + L2) pp = [salida[0] + (q[0] - salida[0]) * (sR - L1) / L2, my];
        else pp = [q[0], my + (q[1] - my) * (sR - L1 - L2) / L3];
        pulso(c, pp[0], pp[1], Math.sin(f * Math.PI));
      }
      c.restore();
    });
    // el display muestra datos simulados (Benjamin, 2026-11-09): una matriz de puntitos dibujada aquí, sin fondo, con el
    // texto que corre de derecha a izquierda (velocidad, tiempo de conducción y conductor). Los puntos apagados, tenues;
    // los encendidos, en cobre
    if (vP > 0.01) {
      var dw = pw * 1.45, dx0 = diX + dw * 36 / 480, dy0 = py + pw * 0.1 + dw * 71.5 / 480, dsw = dw * 408 / 480, dsh = dw * 45 / 480;
      var filas = 7, paso = dsh / filas, cols = Math.floor(dsw / paso), r = Math.max(0.6, paso * 0.32);
      var kmh = Math.round(62 + 9 * Math.sin(t * 0.6)), min = 135 + Math.floor(t / 4) % 60;
      var txt = "   " + kmh + " km/h   ·   conducción " + Math.floor(min / 60) + ":" + ("0" + min % 60).slice(-2) + "   ·   conductor M. Rojas   ";
      var bits = matriz(txt), corr = fijo ? 0 : Math.floor(t * 14) % bits.ancho;
      c.save(); c.globalAlpha = vP;
      for (var cx0 = 0; cx0 < cols; cx0++) for (var fy = 0; fy < filas; fy++) {
        var on = bits.px[fy * bits.ancho + (cx0 + corr) % bits.ancho];
        c.fillStyle = on ? "rgba(" + COL.cobre + ",.95)" : "rgba(" + COL.tinta + ",.12)";
        c.beginPath(); c.arc(dx0 + (cx0 + 0.5) * paso, dy0 + (fy + 0.5) * paso, on ? r * 1.15 : r, 0, 7); c.fill();
      }
      c.restore();
    }
    // fase 3: la flota detrás del taco, en la franja de abajo, tenue
    var wF = Math.min(W * 0.2, 130), yF = H * 0.99;
    var FILAS = [{ s: 0.5, dy: -1.45, dx: 0.07, op: 0.35 }, { s: 0.72, dy: -0.8, dx: 0.035, op: 0.5 }, { s: 1, dy: 0, dx: -0.03, op: 0.65 }];
    var PUESTOS = [[2, 0], [0, -0.62], [1, -0.62], [2, -1.08], [2, 1.08], [1, 0.62], [0, 0.62]];
    var ants = [];
    flota.forEach(function (el, j) {
      var v = k(a, 1.4 + j * 0.05, 1.8 + j * 0.05), f = FILAS[PUESTOS[j][0]], w = wF * f.s;
      var x = cx + PUESTOS[j][1] * wF * 1.15 * f.s + W * f.dx - w / 2, y = yF + f.dy * wF * 196 / 520 - w * 196 / 520;
      poner(el, x, y + (1 - v) * 12, w, v * f.op); el.style.zIndex = 1 + PUESTOS[j][0];
      if (v > 0.05) ants.push([x + w * 462 / 520, y + w * 24 / 520, v]);
    });
    // fase 3: SACEL arriba y el ida y vuelta
    var nx = cx + 30, ny = H * 0.1, destino = [nx - 24, ny + 20], brillo = 0;
    posNube = [nx, ny];
    if (e3 > 0.01) {
      linea(c, antena, destino, e3);
      ants.forEach(function (p, j) {
        linea(c, [p[0], p[1]], destino, 0.15 * p[2] * e3);
        if (!fijo) {
          var f = ((t / 2.8) + j * 0.17) % 1, u = acel(f);
          c.save(); c.globalAlpha = e3 * p[2] * 0.7; pulso(c, lerp(p[0], destino[0], u), lerp(p[1], destino[1], u), Math.sin(f * Math.PI)); c.restore();
          if (f > 0.92) brillo = Math.max(brillo, (f - 0.92) / 0.08);
        }
      });
      if (!fijo) {
        var fu = (t / 2.4) % 1, uu = acel(fu);
        c.save(); c.globalAlpha = e3; pulso(c, lerp(antena[0], destino[0], uu), lerp(antena[1], destino[1], uu), Math.sin(fu * Math.PI)); c.restore();
        if (fu > 0.92) brillo = Math.max(brillo, (fu - 0.92) / 0.08);
        var fb = (t / 5.5) % 1;
        if (fb < 0.6) { var ub = suave(fb / 0.6); c.save(); c.globalAlpha = e3; pulso(c, lerp(destino[0], antena[0], ub), lerp(destino[1], antena[1], ub), Math.sin(fb / 0.6 * Math.PI), COL.tinta); c.restore(); }
      }
      rotulo(c, "datos ↑  ·  firmware ↓", Math.min((antena[0] + destino[0]) / 2 + 10, W - 140), (antena[1] + destino[1]) / 2, e3);
      if (puenteVis() > 0) { c.save(); c.globalAlpha = e3; nube(c, nx, ny, 1.6, brillo); c.restore(); }
    }
    version(t, fijo, a);
  }

  // el puente: al entrar la sección, la nube del mapa baja hacia su lugar en la escena (lienzo fijo) y se desvanece; el
  // mapa deja de dibujarla mientras tanto (flota-3d.js lee SACEL_PUENTE). La nube de la escena aparece en la fase 3
  var puente = null, pPuente = 1, mapaNube = null;
  function puenteVis() { return pPuente > 0 && pPuente < 1 ? 0 : 1; }
  function puenteCuadro() {
    if (!mqMov.matches || !vivo()) { window.SACEL_PUENTE = 0; if (puente) puente.getContext('2d').clearRect(0, 0, puente.width, puente.height); return; }   // sólo en escritorio
    var r = rec.getBoundingClientRect(), u = cl(1 - r.top / innerHeight);
    var m = window.SACEL_MAPA && window.SACEL_MAPA.nube;
    if (m) mapaNube = m;
    pPuente = mapaNube ? u : 1;
    window.SACEL_PUENTE = pPuente > 0 && pPuente < 1 ? 1 : 0;
    if (!puente) { puente = document.createElement("canvas"); puente.className = "puente-nube"; puente.setAttribute("aria-hidden", "true"); document.body.appendChild(puente); }
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
    if (puente.width !== Math.round(W * dpr) || puente.height !== Math.round(H * dpr)) { puente.width = Math.round(W * dpr); puente.height = Math.round(H * dpr); }
    var c = puente.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    if (!window.SACEL_PUENTE || !posNube) return;
    var e = esc.getBoundingClientRect(), s = suave(pPuente);
    c.globalAlpha = 1 - s * 0.8;
    nube(c, lerp(mapaNube.x, e.left + posNube[0], s), lerp(mapaNube.y, e.top + posNube[1], s), lerp(mapaNube.esc, 1.6, s), 0.3);
  }

  // ─── ciclo (como el relato del mapa) ───
  function progreso() { var r = rec.getBoundingClientRect(), largo = r.height - innerHeight; return largo > 0 ? cl(-r.top / largo) : 0; }
  function marcarFase(n) { fases.forEach(function (li, i) { li.classList.toggle("destacado", i === n); li.classList.toggle("atenuado", i !== n); }); }
  function vivo() { return document.documentElement.classList.contains("prod-vivo"); }
  function cuadro(ahora) {
    raf = 0;
    var dt = tPrev ? Math.min(0.1, (ahora - tPrev) / 1000) : 0; tPrev = ahora;
    var t = ahora / 1000;
    if (vivo()) { var meta = Math.round(progreso() * N); a = meta > a ? Math.min(meta, a + dt / DUR) : Math.max(meta, a - dt / DUR); }
    else {                                       // celular con movimiento: recorre solo las fases en bucle
      var PAR = 4.6, CAM = 0.35, T = t % (3 * PAR), n0 = Math.floor(T / PAR), f = (T - n0 * PAR) / PAR, u = f > 1 - CAM ? suave((f - 1 + CAM) / CAM) : 0;
      a = n0 < 2 ? n0 + u : 2 - 2 * u;
    }
    // la cuenta de versiones parte cuando la sección llega arriba de la pantalla (no mientras se acerca)
    var llegada = vivo() ? rec.getBoundingClientRect().top < innerHeight * 0.15 : true;
    if (a < 0.5 && verT < 0 && llegada) { verT = t; verN = 0; }
    if (a > 0.9 || (!llegada && a < 0.5)) { if (verT >= 0 || verN !== 1) { verT = -1; verN = 0; } }
    var n = Math.round(a); if (n !== faseVisible) { faseVisible = n; marcarFase(n); }
    escena(a, t, false); puenteCuadro();
    if (visible && !document.hidden && mqMov.matches) raf = requestAnimationFrame(cuadro); else tPrev = 0;
  }
  function arrancar() { if (!raf && visible && mqMov.matches) raf = requestAnimationFrame(cuadro); }
  function quieta() { verN = 0; fases.forEach(function (li) { li.classList.remove("destacado", "atenuado"); }); escena(2, 0, true); }
  var lista = sec.querySelector(".prod-fases");
  function modo() {
    var v = mqVivo.matches;
    document.documentElement.classList.toggle("prod-vivo", v);
    colores();
    // en el celular, la escena va entre el título y las fases; en escritorio, a la derecha
    if (!v && lista && esc.nextElementSibling !== lista) lista.parentNode.insertBefore(esc, lista);
    else if (v && esc.parentNode !== sec) sec.appendChild(esc);
    if (mqMov.matches) { faseVisible = -1; arrancar(); } else quieta();
  }
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; arrancar(); }, { rootMargin: "0px 0px 300px 0px" }).observe(rec);
  document.addEventListener("visibilitychange", arrancar);
  window.addEventListener("scroll", function () { arrancar(); if (mqMov.matches) puenteCuadro(); }, { passive: true });
  if (mqVivo.addEventListener) mqVivo.addEventListener("change", modo);
  if (mqMov.addEventListener) mqMov.addEventListener("change", modo);
  window.addEventListener("resize", function () { if (!mqMov.matches) quieta(); });
  new MutationObserver(function () { colores(); if (!mqMov.matches) quieta(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  if (document.fonts) document.fonts.ready.then(function () { if (!mqMov.matches) quieta(); });
  a = Math.round(progreso() * N);
  modo();
})();
