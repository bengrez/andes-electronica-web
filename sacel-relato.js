/* SACEL y la flota (Benjamin y JI, 2026-11-03; handoff 020). Relato de inicio en 5 paradas animadas, liderado por
   SACEL: 0) la nube de SACEL en grande; 1) un bus de costado, en corte, con su tacógrafo en el tablero; 2) zoom al
   tacógrafo, con chips de datos (km/h, GPS, conductor, CAN bus) que suben a SACEL; 3) aparecen 7 tacógrafos conectados
   (la flota); 4) un gráfico de conducción y descanso por vehículo (datos de ejemplo). El scroll elige la parada
   (etapas.js da las muescas) y la transición se reproduce sola. En el celular y con movimiento reducido, las paradas
   van apiladas, cada una con su dibujo fijo. La nube copia el dibujo de productos-nube.js y flota-3d.js. */
(function () {
  "use strict";
  var rec = document.querySelector(".sacel-recorrido"), sec = rec && rec.querySelector(".sacel-relato");
  var lienzo = sec && sec.querySelector(".relato-lienzo");
  if (!rec || !sec || !lienzo || !lienzo.getContext) return;
  var pasos = [].slice.call(sec.querySelectorAll(".relato-paso"));
  var mqVivo = matchMedia("(min-width: 47.51rem) and (prefers-reduced-motion: no-preference)");
  var N = 4, DUR = 1.1;                           // última parada; s por parada
  var a = 0, meta = 0, tPrev = 0, raf = 0, visible = false, minis = [];

  // ─── colores del tema (variables de base.css) ───
  var COL = {};
  function colores() {
    var cs = getComputedStyle(document.documentElement);
    function v(n, d) { return (cs.getPropertyValue(n) || "").trim() || d; }
    var pg = v("--pagina", "#eceeee"), m = /^#([0-9a-f]{6})$/i.exec(pg), n = m ? parseInt(m[1], 16) : 0xeceeee;
    var claro = (0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) > 128;   // el tema, por la luz del papel
    COL = { tinta: v("--tinta", "#00104f"), tinta2: v("--tinta-2", "#3d4466"), acento: v("--acento", "#8f5213"), pagina: v("--pagina", "#eceeee"),
            linea: v("--linea", "#c9ccd2"), claro: claro,
            nube: claro ? ["255,255,255", "232,235,241", "170,176,192"] : ["196,204,226", "130,140,170", "40,48,80"], nubeA: claro ? 1 : 0.85,
            cobre: claro ? "184,112,42" : "246,196,138", tintaRGB: claro ? "0,16,79" : "242,237,227",
            descanso: claro ? "rgba(184,112,42,.45)" : "rgba(246,196,138,.45)" };
  }

  // ─── utilidades ───
  function cl(x) { return Math.max(0, Math.min(1, x)); }
  function suave(x) { x = cl(x); return x * x * (3 - 2 * x); }
  function k(a, d, h) { return suave((a - d) / (h - d)); }
  function lerp(p, q, t) { return p + (q - p) * t; }
  function caja(c, x, y, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); }

  var COPOS = [[-18, 5, 7], [-11, 0, 10], [-3, -5, 12], [6, -6, 10], [12, 0, 10], [19, 5, 7.5], [-8, 6, 9], [3, 5, 10], [12, 7, 8], [-1, 0, 11]];
  function nube(c, x, y, esc, brillo) {
    c.save(); c.translate(x, y); c.scale(esc, esc);
    COPOS.forEach(function (q) {
      var r = q[2], g = c.createRadialGradient(q[0] - r * 0.2, q[1] - r * 0.3, 0, q[0], q[1], r);
      g.addColorStop(0, "rgba(" + COL.nube[0] + ",.97)"); g.addColorStop(0.62, "rgba(" + COL.nube[0] + ",.92)");
      g.addColorStop(0.86, "rgba(" + COL.nube[1] + ",.55)"); g.addColorStop(1, "rgba(" + COL.nube[1] + ",0)");
      c.globalAlpha = COL.nubeA; c.fillStyle = g; c.beginPath(); c.arc(q[0], q[1], r, 0, 7); c.fill();
    });
    c.globalAlpha = 1;
    for (var i = 0; i < 4; i++) {                 // las barras de la nube; crecen un poco cuando llega un dato
      var hb = 3 + [3, 6, 4, 7][i] * (0.6 + 0.4 * brillo);
      c.fillStyle = "rgba(" + COL.cobre + "," + (0.55 + 0.45 * brillo).toFixed(3) + ")"; c.fillRect(-8 + i * 4.6, 7 - hb, 3, hb);
    }
    c.fillStyle = COL.tinta; c.font = "600 15px 'Plex Mono', monospace"; c.textAlign = "right"; c.textBaseline = "middle";
    c.fillText("SACEL", -26, 2);
    c.restore();
  }

  // el tacógrafo de frente con su cara de arriba y su costado (como la ilustración del sitio), de ancho w con su esquina
  // arriba a la izquierda en (x, y); detalle 0–1 (pantalla, botones, ranura)
  function taco(c, x, y, w, detalle, alfa, resalta) {
    var h = w * 0.27, p = w * 0.045;
    c.save(); c.globalAlpha = alfa; c.lineJoin = "round";
    c.fillStyle = COL.pagina; c.strokeStyle = resalta ? COL.acento : COL.tinta; c.lineWidth = Math.max(1, w / 180);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + p, y - p * 0.65); c.lineTo(x + w + p, y - p * 0.65); c.lineTo(x + w, y); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(x + w, y); c.lineTo(x + w + p, y - p * 0.65); c.lineTo(x + w + p, y + h - p * 0.65); c.lineTo(x + w, y + h); c.closePath();
    c.fillStyle = "rgba(" + COL.tintaRGB + ",.12)"; c.fill(); c.stroke();
    caja(c, x, y, w, h, w * 0.02); c.fillStyle = COL.pagina; c.fill(); c.stroke();
    if (detalle > 0.01) {
      c.globalAlpha = alfa * detalle; c.lineWidth = Math.max(0.8, w / 260);
      caja(c, x + w * 0.03, y + h * 0.12, w * 0.13, h * 0.76, 3); c.stroke();                 // ranura de la tarjeta
      caja(c, x + w * 0.21, y + h * 0.15, w * 0.3, h * 0.55, 4); c.stroke();                  // pantalla
      c.beginPath(); c.moveTo(x + w * 0.24, y + h * 0.33); c.lineTo(x + w * 0.37, y + h * 0.33);
      c.moveTo(x + w * 0.24, y + h * 0.5); c.lineTo(x + w * 0.44, y + h * 0.5); c.stroke();
      for (var b = 0; b < 5; b++) { caja(c, x + w * 0.54, y + h * (0.14 + b * 0.15), w * 0.045, h * 0.1, 2); c.stroke(); }
      caja(c, x + w * 0.62, y + h * 0.1, w * 0.34, h * 0.8, 4); c.stroke();                  // impresora
      c.beginPath(); c.moveTo(x + w * 0.65, y + h * 0.25); c.lineTo(x + w * 0.93, y + h * 0.25); c.stroke();
    }
    c.restore();
    return { antena: [x + w * 0.76, y - p * 0.65] };
  }

  // el bus de costado, en corte, mirando a la derecha; su tablero queda en (tx, ty) del bus (fracciones)
  var TABLERO = [0.86, 0.6];
  function bus(c, x, y, L, alfa, t) {
    var H = L * 0.3, r = L * 0.06, izq = x, der = x + L, techo = y, piso = y + H;
    c.save(); c.globalAlpha = alfa; c.lineJoin = "round"; c.lineCap = "round";
    c.beginPath(); c.moveTo(izq + 8, piso); c.lineTo(der - 6, piso); c.quadraticCurveTo(der, piso, der, piso - 8);
    c.lineTo(der, techo + H * 0.3); c.quadraticCurveTo(der - 3, techo, der - L * 0.1, techo); c.lineTo(izq + 8, techo);
    c.quadraticCurveTo(izq, techo, izq, techo + 8); c.lineTo(izq, piso - 8); c.quadraticCurveTo(izq, piso, izq + 8, piso); c.closePath();
    c.fillStyle = COL.claro ? "rgba(255,255,255,.6)" : "rgba(20,24,34,.6)"; c.fill();
    c.strokeStyle = COL.tinta; c.lineWidth = 1.6; c.stroke();
    c.strokeStyle = "rgba(" + COL.tintaRGB + ",.3)"; c.lineWidth = 1;
    var vw = (L * 0.78) / 7;
    for (var v = 0; v < 7; v++) { caja(c, izq + L * 0.04 + v * vw, techo + H * 0.1, vw - 6, H * 0.3, 3); c.stroke(); }
    // asientos, tenues
    for (v = 0; v < 6; v++) { c.beginPath(); c.moveTo(izq + L * 0.1 + v * vw, piso - H * 0.12); c.lineTo(izq + L * 0.1 + v * vw, piso - H * 0.38); c.lineTo(izq + L * 0.14 + v * vw, piso - H * 0.38); c.stroke(); }
    // el camino y las ruedas
    var suelo = piso + r;
    c.strokeStyle = "rgba(" + COL.tintaRGB + ",.35)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - L * 0.1, suelo); c.lineTo(der + L * 0.1, suelo); c.stroke();
    var paso = L * 0.12, des = (t * L * 0.25) % paso; c.beginPath();
    for (var xr = x - L * 0.1 - des; xr < der + L * 0.1; xr += paso) { c.moveTo(Math.max(x - L * 0.1, xr), suelo + 8); c.lineTo(Math.min(der + L * 0.1, xr + paso * 0.45), suelo + 8); }
    c.stroke();
    [izq + L * 0.18, der - L * 0.2].forEach(function (cx) {
      c.beginPath(); c.arc(cx, piso, r, 0, 7); c.fillStyle = COL.claro ? "rgba(40,44,60,.9)" : "rgba(10,12,18,.95)"; c.fill();
      c.strokeStyle = COL.tinta; c.lineWidth = 1.2; c.stroke();
      c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 1; c.beginPath();
      for (var s = 0; s < 3; s++) { var g = t * 4 + s * 2.094; c.moveTo(cx, piso); c.lineTo(cx + Math.cos(g) * r * 0.7, piso + Math.sin(g) * r * 0.7); }
      c.stroke();
    });
    c.restore();
    return { tablero: [x + L * TABLERO[0], y + H * TABLERO[1]], H: H };
  }

  // un chip de datos: caja con borde de cobre y su etiqueta
  function chip(c, x, y, txt, alfa) {
    c.save(); c.globalAlpha = alfa; c.font = "500 11px 'Plex Mono', monospace"; c.textBaseline = "middle"; c.textAlign = "center";
    var w = c.measureText(txt).width + 14;
    caja(c, x - w / 2, y - 10, w, 20, 10); c.fillStyle = COL.pagina; c.fill();
    c.strokeStyle = "rgba(" + COL.cobre + ",.95)"; c.lineWidth = 1.3; c.stroke();
    c.fillStyle = COL.tinta; c.fillText(txt, x, y + 0.5);
    c.restore();
  }
  function pulso(c, x, y, alfa) {
    var g = c.createRadialGradient(x, y, 0, x, y, 6);
    g.addColorStop(0, "rgba(" + COL.cobre + "," + (0.95 * alfa).toFixed(3) + ")"); g.addColorStop(1, "rgba(" + COL.cobre + ",0)");
    c.fillStyle = g; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill();
  }
  function acel(u) { return (Math.exp(4 * u) - 1) / (Math.exp(4) - 1); }   // salen lento y llegan rápido, como en el mapa

  var DATOS = ["km/h", "GPS", "conductor", "CAN bus"];
  // datos de ejemplo del gráfico (horas en el día por vehículo); no son de clientes
  var HORAS = [[8.5, 3.0], [7.2, 2.5], [9.6, 1.8], [6.8, 3.4], [8.1, 2.2], [9.0, 2.0], [7.7, 2.9]];
  var NT = HORAS.length;

  // ─── la escena: w × h en px CSS; a = avance entre paradas (0–4); t = reloj (s) ───
  function escena(c, w, h, a, t) {
    c.clearRect(0, 0, w, h);
    var cx = w * 0.5, brillo = 0;
    // posiciones de la flota (paradas 3 y 4)
    var tw = Math.min(w * 0.13, 92), filaY = lerp(h * 0.66, h * 0.86, k(a, 3, 3.6));
    function ranura(i) { var ancho = Math.min(w * 0.92, NT * tw * 1.35); return [cx - ancho / 2 + (i + 0.5) * ancho / NT - tw / 2, filaY + (i % 2 ? h * 0.04 : 0) * (1 - k(a, 3, 3.6))]; }
    // SACEL: grande al centro en la parada 0; arriba desde la 1
    var sub = k(a, 0.2, 1), ne = lerp(Math.min(w / 120, h / 75), Math.min(w / 210, h / 130), sub);
    var nx = lerp(cx + 22 * ne, cx + 22 * ne, sub), ny = lerp(h * 0.44, h * 0.13, sub);   // centrada contando el rótulo «SACEL» a su izquierda

    // 1) el bus en corte, que entra en la parada 1 y se acerca al tablero en la 2
    var vBus = k(a, 0.35, 1) * (1 - k(a, 1.45, 1.85)), z = 1 + 3.2 * k(a, 1, 2);
    var L = Math.min(w * 0.78, h * 1.6), bx = cx - L / 2, by = h * 0.55 - L * 0.15;
    var tab = [bx + L * TABLERO[0], by + L * 0.3 * TABLERO[1]];
    // el zoom lleva el tablero hacia el centro de abajo
    var foco = [lerp(tab[0], cx, k(a, 1, 2)), lerp(tab[1], h * 0.62, k(a, 1, 2))];
    if (vBus > 0.01) {
      c.save(); c.translate(foco[0], foco[1]); c.scale(z, z); c.translate(-tab[0], -tab[1]);
      bus(c, bx, by + (1 - k(a, 0.35, 1)) * 30, L, vBus, t);
      taco(c, tab[0] - L * 0.05, tab[1] - L * 0.015, L * 0.1, 0, vBus, true);       // el taco en el tablero, en cobre
      c.restore();
    }
    // 2) el taco grande; en la parada 3 se achica a su lugar en la flota
    var vTaco = k(a, 1.5, 2), haciaFlota = k(a, 2.5, 3);
    var TW = Math.min(w * 0.56, 420), T0 = [cx - TW / 2, h * 0.62 - TW * 0.135], r3 = ranura(3);
    var tx = lerp(T0[0], r3[0], haciaFlota), ty = lerp(T0[1], r3[1], haciaFlota), tww = lerp(TW, tw, haciaFlota);
    var pts = [];
    if (vTaco > 0.01) pts[3] = taco(c, tx, ty, tww, 1 - haciaFlota * 0.6, vTaco, false).antena;
    // la flota: los otros 6 aparecen de a uno
    for (var i = 0; i < NT; i++) {
      if (i === 3) continue;
      var vi = k(a, 2.6 + Math.abs(i - 3) * 0.08, 3.0 + Math.abs(i - 3) * 0.08); if (vi <= 0.01) continue;
      var r = ranura(i); pts[i] = taco(c, r[0], r[1] + (1 - vi) * 14, tw, 0.4, vi, false).antena;
    }
    // la antena del taco grande y los chips (parada 2)
    var vChips = k(a, 1.75, 2.1) * (1 - k(a, 2.45, 2.8));
    if (pts[3] && vChips > 0.01) {
      var p0 = pts[3], p1 = [nx + 6, ny + 22];
      c.save(); c.globalAlpha = vChips; c.strokeStyle = "rgba(" + COL.tintaRGB + ",.35)"; c.setLineDash([3, 4]); c.lineWidth = 1;
      c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke(); c.restore();
      for (var j = 0; j < 4; j++) {
        var f = (t / 3.2 + j / 4) % 1, u = acel(f), xx = lerp(p0[0], p1[0], u), yy = lerp(p0[1], p1[1], u);
        chip(c, xx, yy, DATOS[j], vChips * Math.min(1, f / 0.08) * Math.min(1, (1 - f) / 0.12));
        if (f > 0.9) brillo = Math.max(brillo, (f - 0.9) / 0.1);
      }
    }
    // la flota conectada (paradas 3 y 4): una línea por taco hasta SACEL, con pulsos de cobre
    var vRed = k(a, 2.7, 3.1) * (1 - 0.65 * k(a, 3, 3.5));
    if (vRed > 0.01) for (i = 0; i < NT; i++) {
      if (!pts[i]) continue;
      var q0 = pts[i], q1 = [nx + (i - 3) * 4, ny + 18];
      c.save(); c.globalAlpha = vRed; c.strokeStyle = "rgba(" + COL.tintaRGB + ",.28)"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(q0[0], q0[1]); c.lineTo(q1[0], q1[1]); c.stroke();
      var fp = (t / 2.4 + i * 0.137) % 1, up = acel(fp);
      c.globalAlpha = vRed; pulso(c, lerp(q0[0], q1[0], up), lerp(q0[1], q1[1], up), Math.sin(fp * Math.PI));
      if (fp > 0.92) brillo = Math.max(brillo, (fp - 0.92) / 0.08);
      c.restore();
    }
    // 3) el gráfico (parada 4): conducción y descanso por vehículo, que sale de SACEL
    var vG = k(a, 3.2, 3.7);
    if (vG > 0.01) grafico(c, cx, ny, w, h, vG, k(a, 3.4, 4));
    nube(c, nx, ny, ne, brillo);
  }
  function grafico(c, cx, ny, w, h, alfa, crece) {
    var gw = Math.min(w * (w < 500 ? 0.94 : 0.78), 520), gh = h * (w < 500 ? 0.56 : 0.42), gx = cx - gw / 2, gy = ny + h * 0.13;
    c.save(); c.globalAlpha = alfa;
    c.strokeStyle = "rgba(" + COL.tintaRGB + ",.35)"; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(cx, ny + 22); c.lineTo(cx, gy); c.stroke(); c.setLineDash([]);
    caja(c, gx, gy, gw, gh, 12); c.fillStyle = COL.pagina; c.fill(); c.strokeStyle = COL.linea; c.lineWidth = 1; c.stroke();
    var chico = gw < 420, ly = chico ? gy + 40 : gy + 24;          // angosto: la leyenda bajo el título
    c.fillStyle = COL.tinta; c.font = "600 " + (chico ? 11.5 : 13) + "px 'DM Sans', sans-serif"; c.textAlign = "left"; c.textBaseline = "alphabetic";
    c.fillText("Conducción y descanso · hoy", gx + 12, gy + 22);
    c.font = "500 " + (chico ? 9.5 : 10.5) + "px 'Plex Mono', monospace"; c.fillStyle = COL.tinta2;
    var lx = gx + gw - 12; c.textAlign = "right"; c.fillText("descanso", lx, ly);
    var wd = c.measureText("descanso").width; c.fillStyle = COL.descanso; c.fillRect(lx - wd - 14, ly - 8, 9, 9);
    c.fillStyle = COL.tinta2; c.fillText("conducción", lx - wd - 22, ly);
    var wc = c.measureText("conducción").width; c.fillStyle = COL.tinta; c.fillRect(lx - wd - wc - 36, ly - 8, 9, 9);
    var x0 = gx + (chico ? 46 : 70), x1 = gx + gw - (chico ? 14 : 24), top = gy + (chico ? 54 : 42), fila = (gh - (chico ? 80 : 70)) / NT, esc = (x1 - x0) / 14, cada = chico ? 4 : 2;
    c.strokeStyle = "rgba(" + COL.tintaRGB + ",.12)"; c.fillStyle = COL.tinta2; c.textAlign = "center";
    for (var hh = 0; hh <= 14; hh += cada) { var xh = x0 + hh * esc; c.beginPath(); c.moveTo(xh, top - 4); c.lineTo(xh, top + fila * NT); c.stroke(); c.fillText(hh + " h", xh, top + fila * NT + 14); }
    HORAS.forEach(function (d, i) {
      var y = top + i * fila + fila * 0.2, bh = fila * 0.6, cc = cl(crece * 1.4 - i * 0.06);
      c.fillStyle = COL.tinta2; c.textAlign = "right"; c.textBaseline = "middle"; c.fillText("Bus " + (i + 1), x0 - 10, y + bh / 2);
      c.fillStyle = COL.tinta; c.fillRect(x0, y, d[0] * esc * cc, bh);
      c.fillStyle = COL.descanso; c.fillRect(x0 + d[0] * esc * cc, y, d[1] * esc * cc, bh);
    });
    c.restore();
  }

  // ─── tamaños, modo y ciclo ───
  function ajustar(cv) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return null;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    var c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { c: c, w: w, h: h };
  }
  function progreso() {
    var r = rec.getBoundingClientRect(), largo = r.height - innerHeight;
    return largo > 0 ? cl(-r.top / largo) : 0;
  }
  function marcarPaso(n) {
    pasos.forEach(function (p, i) {
      var on = i === n; p.classList.toggle("activo", on);
      p.querySelectorAll("a").forEach(function (x) { if (on) x.removeAttribute("tabindex"); else x.setAttribute("tabindex", "-1"); });
    });
  }
  var pasoVisible = -1;
  function cuadro(ahora) {
    raf = 0;
    var dt = tPrev ? Math.min(0.1, (ahora - tPrev) / 1000) : 0; tPrev = ahora;
    meta = Math.round(progreso() * N);
    a = meta > a ? Math.min(meta, a + dt / DUR) : Math.max(meta, a - dt / DUR);
    var n = Math.round(a); if (n !== pasoVisible) { pasoVisible = n; marcarPaso(n); }
    var z = ajustar(lienzo); if (z) escena(z.c, z.w, z.h, a, ahora / 1000);
    if (visible && !document.hidden) raf = requestAnimationFrame(cuadro); else tPrev = 0;
  }
  function arrancar() { if (!raf && visible && vivo()) raf = requestAnimationFrame(cuadro); }
  function vivo() { return document.documentElement.classList.contains("relato-vivo"); }

  // apilado (celular o movimiento reducido): cada paso con su lienzo y su dibujo fijo
  function apilado() {
    if (!minis.length) pasos.forEach(function (p, i) {
      var cv = document.createElement("canvas"); cv.className = "relato-mini"; cv.setAttribute("aria-hidden", "true"); p.appendChild(cv); minis.push(cv);
    });
    minis.forEach(function (cv, i) { var z = ajustar(cv); if (z) escena(z.c, z.w, z.h, i, 1.3); });
  }
  function modo() {
    var v = mqVivo.matches;
    document.documentElement.classList.toggle("relato-vivo", v);
    colores();
    if (v) { marcarPaso(pasoVisible = Math.round(a)); arrancar(); }
    else { pasos.forEach(function (p) { p.classList.add("activo"); p.querySelectorAll("a").forEach(function (x) { x.removeAttribute("tabindex"); }); }); apilado(); }
  }
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; arrancar(); }).observe(rec);
  document.addEventListener("visibilitychange", arrancar);
  window.addEventListener("scroll", arrancar, { passive: true });
  if (mqVivo.addEventListener) mqVivo.addEventListener("change", modo);
  var espera = 0;
  window.addEventListener("resize", function () { clearTimeout(espera); espera = setTimeout(function () { if (!vivo()) apilado(); }, 150); });
  new MutationObserver(function () { colores(); if (!vivo()) apilado(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  if (document.fonts) document.fonts.ready.then(function () { if (!vivo()) apilado(); });
  a = meta = Math.round(progreso() * N);
  modo();
})();
