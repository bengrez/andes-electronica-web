/* Productos y servicios del inicio (Benjamin y JI, 2026-11-03). 4 paradas animadas, como el mapa (etapas.js da las
   muescas y la transición corre sola, suave y continua): 0) el bus con su tacógrafo, conectado a SACEL (la misma nube
   del mapa), con «Tacógrafo v.N» sobre el taco, cuyas letras cambian como paletas de v.1 a v.4 (las versiones: iguales
   por fuera, distintas por dentro); 1) los periféricos, colgando del taco, con pulsos; 2) la flota: el bus se achica y
   se multiplica, y cada uno manda su pulso a la nube; 3) el dashboard (la ilustración de reportes), que baja desde la nube.
   Segunda forma (Benjamin: la primera, dibujada en canvas, era «poco orgánica»): las piezas son las ilustraciones del
   sitio, con las curvas de nivel de la H-25 (scripts/ilustrar_productos.py, ahora con el bus), que este archivo mueve;
   el lienzo de encima sólo dibuja la nube, las líneas y los pulsos de cobre. En el celular y con movimiento reducido,
   la escena queda quieta en la parada de los periféricos, bajo los textos. */
(function () {
  "use strict";
  var rec = document.querySelector(".prod-recorrido"), sec = rec && rec.querySelector(".prod-relato");
  var esc = sec && sec.querySelector(".prod-escena"), capa = esc && esc.querySelector(".prod-capa");
  if (!rec || !sec || !esc || !capa || !capa.getContext) return;
  var pasos = [].slice.call(sec.querySelectorAll(".prod-paso"));
  var elBus = esc.querySelector(".esc-bus"), elSC = esc.querySelector(".esc-smartcard"), elDi = esc.querySelector(".esc-display"),
      elRep = esc.querySelector(".esc-reportes"), elVer = esc.querySelector(".esc-version");
  var mqVivo = matchMedia("(min-width: 47.51rem) and (prefers-reduced-motion: no-preference)");
  var N = 3, DUR = 1.6, a = 0, meta = 0, tPrev = 0, raf = 0, visible = false, pasoVisible = -1;
  var NB = 7, flota = [];

  // la flota: copias del bus, sin ids (usan el recorte del original)
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
    COL = { nube: claro ? ["255,255,255", "232,235,241", "170,176,192"] : ["196,204,226", "130,140,170", "40,48,80"], nubeA: claro ? 1 : 0.85,
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
    c.save(); c.translate(x, y); c.scale(s, s);
    COPOS.forEach(function (q) {
      var r = q[2], g = c.createRadialGradient(q[0] - r * 0.2, q[1] - r * 0.3, 0, q[0], q[1], r);
      g.addColorStop(0, "rgba(" + COL.nube[0] + ",.97)"); g.addColorStop(0.62, "rgba(" + COL.nube[0] + ",.92)");
      g.addColorStop(0.86, "rgba(" + COL.nube[1] + ",.55)"); g.addColorStop(1, "rgba(" + COL.nube[1] + ",0)");
      c.globalAlpha = COL.nubeA; c.fillStyle = g; c.beginPath(); c.arc(q[0], q[1], r, 0, 7); c.fill();
    });
    c.globalAlpha = 1;
    for (var i = 0; i < 4; i++) {
      var hb = 3 + [3, 6, 4, 7][i] * (0.55 + 0.45 * brillo);
      c.fillStyle = "rgba(" + COL.cobre + "," + (0.5 + 0.5 * brillo).toFixed(3) + ")"; c.fillRect(-8 + i * 4.6, 7 - hb, 3, hb);
    }
    c.fillStyle = COL.texto; c.font = "600 15.75px 'Plex Mono', monospace"; c.textAlign = "right"; c.textBaseline = "middle";
    c.fillText("SACEL", -26, 2);
    c.restore();
  }
  function pulso(c, x, y, al) {
    var g = c.createRadialGradient(x, y, 0, x, y, 6);
    g.addColorStop(0, "rgba(" + COL.cobre + "," + (0.95 * al).toFixed(3) + ")"); g.addColorStop(1, "rgba(" + COL.cobre + ",0)");
    c.fillStyle = g; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill();
  }
  function linea(c, p, q, al) {
    c.save(); c.globalAlpha = al; c.strokeStyle = "rgba(" + COL.tinta + ",.28)"; c.setLineDash([2, 5]); c.lineWidth = 1;
    c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); c.restore();
  }
  function poner(el, x, y, w, op) {
    if (!el) return;
    el.style.left = x.toFixed(1) + "px"; el.style.top = y.toFixed(1) + "px"; el.style.width = w.toFixed(1) + "px";
    el.style.opacity = op.toFixed(3); el.style.visibility = op > 0.01 ? "visible" : "hidden";
  }

  // «Tacógrafo v.N»: las letras cambian como paletas; cuenta de v.1 a v.4 al llegar a la parada 0
  var verN = 0, verT = -1;
  function version(t, fijo) {
    if (!elVer) return;
    var n = fijo ? 4 : (verT < 0 ? 1 : Math.min(4, 1 + Math.floor((t - verT) / 1.1)));
    if (n === verN) return; verN = n;
    var txt = "Tacógrafo v." + n;
    elVer.innerHTML = "";
    for (var i = 0; i < txt.length; i++) {
      var sp = document.createElement("span"); sp.textContent = txt[i] === " " ? " " : txt[i];
      if (i === txt.length - 1) sp.className = "num";
      if (!fijo) { sp.style.animationDelay = (i * 35) + "ms"; sp.classList.add("paleta"); }
      elVer.appendChild(sp);
    }
  }

  // el dashboard con los datos de la flota que se ve (Benjamin, 2026-11-05: «más rico»): en la pantalla de la
  // ilustración, una fila por bus con su velocidad (simulada) y su estado; la fila destella cuando su pulso llega a SACEL
  var llegada = [];
  function tablero(c, x, y, w, al, t) {
    if (al <= 0.01) return;
    var sx = x + w * 40 / 320, sy = y + w * 74 / 320, sw = w * 240 / 320, sh = w * 106 / 320, n = NB, fila = sh / (n + 1.4);
    c.save(); c.globalAlpha = al; c.textBaseline = "middle";
    c.font = "500 " + Math.max(8, fila * 0.62).toFixed(1) + "px 'Plex Mono', monospace"; c.fillStyle = COL.texto; c.textAlign = "left";
    c.fillText("SACEL · flota en línea", sx, sy + fila * 0.55);
    for (var j = 0; j < n; j++) {
      var yy = sy + fila * (1.4 + j) + fila * 0.5, onda = Math.sin(t * 0.2 + j * 2.3), detenido = onda > 0.82;
      var v = detenido ? 0 : Math.round(32 + 58 * (0.5 + 0.5 * Math.sin(t * 0.37 + j * 1.7))), destello = Math.max(0, 1 - (t - (llegada[j] || -9)) / 0.8);
      if (destello > 0) { c.fillStyle = "rgba(" + COL.cobre + "," + (0.18 * destello).toFixed(3) + ")"; c.fillRect(sx - 3, yy - fila * 0.48, sw + 6, fila * 0.96); }
      c.fillStyle = COL.texto; c.textAlign = "left"; c.fillText("Bus " + (j + 1), sx, yy);
      var bx0 = sx + sw * 0.28, bw0 = sw * 0.5;
      c.fillStyle = "rgba(" + COL.tinta + ",.1)"; c.fillRect(bx0, yy - fila * 0.18, bw0, fila * 0.36);
      c.fillStyle = v > 80 ? "rgba(" + COL.cobre + ",.95)" : "rgba(" + COL.tinta + ",.75)"; c.fillRect(bx0, yy - fila * 0.18, bw0 * v / 100, fila * 0.36);
      c.textAlign = "right"; c.fillStyle = detenido ? "rgba(" + COL.cobre + ",.95)" : COL.texto; c.fillText(detenido ? "detenido" : v + " km/h", sx + sw, yy);
    }
    c.restore();
  }

  // ─── la escena para un avance a (0–3) ───
  function escena(a, t, fijo) {
    var W = esc.clientWidth, H = esc.clientHeight; if (!W || !H) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (capa.width !== Math.round(W * dpr) || capa.height !== Math.round(H * dpr)) { capa.width = Math.round(W * dpr); capa.height = Math.round(H * dpr); }
    var c = capa.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    var cx = W / 2, ny = H * 0.1, eP = k(a, 0.35, 1), eF = k(a, 1.2, 2), eD = k(a, 2.2, 3), brillo = 0;
    // el bus: grande (paradas 0–1), sube un poco con los periféricos y se achica a su lugar en la fila de la flota
    var Wb = Math.min(W * 0.66, 470), Hb = Wb * 196 / 520;
    // la flota apilada en 2.5D (Benjamin, 2026-11-05): tres filas, adelante 3 buses, al medio 2 y atrás 2; las de atrás más
    // chicas, más tenues y corridas hacia la derecha, como vistas en perspectiva. En el dashboard bajan y se achican
    var escF = lerp(1, 0.7, eD), wF = Math.min(W * 0.3, 210) * escF, yF = lerp(H * 0.66, H * 0.9, eD);
    var FILAS = [{ s: 0.5, dy: -1.45, dx: 0.07, op: 0.5 }, { s: 0.72, dy: -0.8, dx: 0.035, op: 0.78 }, { s: 1, dy: 0, dx: -0.03, op: 1 }];
    var PUESTOS = [[0, -0.62], [1, -0.62], [2, -1.08], [2, 0], [2, 1.08], [1, 0.62], [0, 0.62]];   // [fila, columna]; el 3 es el bus principal
    function lugar(i) {
      var f = FILAS[PUESTOS[i][0]], w = wF * f.s, x = cx + PUESTOS[i][1] * wF * 1.12 * f.s + W * f.dx - w / 2, y = yF + f.dy * wF * 196 / 520 - w * 196 / 520;
      return [x, y, w, f.op, PUESTOS[i][0]];
    }
    var lp = lugar(3), bw = lerp(Wb, lp[2], eF), bx = lerp(cx - Wb / 2, lp[0], eF), by = lerp(lerp(H * 0.42, H * 0.3, eP), lp[1], eF), bh = bw * 196 / 520;
    poner(elBus, bx, by, bw, 1); elBus.style.zIndex = 3;
    function antena(x, y, w) { return [x + w * 462 / 520, y + w * 24 / 520]; }
    var taco = [bx + bw * 454 / 520, by + bw * 112 / 520], ants = [antena(bx, by, bw)];
    // la flota
    flota.forEach(function (el, j) {
      var i = j < 3 ? j : j + 1, v = k(a, 1.35 + Math.abs(i - 3) * 0.08, 1.85 + Math.abs(i - 3) * 0.08), p = lugar(i);
      poner(el, p[0], p[1] + (1 - v) * 14, p[2], v * p[3]); el.style.zIndex = 1 + p[4];
      if (v > 0.05) ants.push(antena(p[0], p[1], p[2]));
    });
    // «Tacógrafo v.N» sobre el taco
    var vR = 1 - k(a, 1.05, 1.45);
    if (elVer) { elVer.style.left = taco[0].toFixed(1) + "px"; elVer.style.top = (by - 30).toFixed(1) + "px"; elVer.style.opacity = vR.toFixed(3); elVer.style.visibility = vR > 0.01 ? "visible" : "hidden"; }
    if (vR > 0.01) { linea(c, [taco[0], by - 12], [taco[0], taco[1] - 8], vR); }
    // periféricos colgando del taco
    var vP = eP * (1 - k(a, 1.05, 1.45)), sw = Wb * 0.3, dw = Wb * 0.5, py = by + bh + 34;
    var scX = bx + bw * 0.18, diX = bx + bw * 0.5;
    poner(elSC, scX, py + (1 - vP) * 16, sw, vP); poner(elDi, diX, py + sw * 0.18 + (1 - vP) * 16, dw, vP);
    if (vP > 0.01) {
      [[scX + sw * 57 / 290, py + sw * 52 / 290], [diX + dw / 2, py + sw * 0.18 + dw * 56 / 480]].forEach(function (q, j) {
        var my = (taco[1] + q[1]) / 2 + 6;
        c.save(); c.globalAlpha = vP; c.strokeStyle = "rgba(" + COL.tinta + ",.3)"; c.lineWidth = 1;
        c.beginPath(); c.moveTo(taco[0], taco[1]); c.lineTo(taco[0], my); c.lineTo(q[0], my); c.lineTo(q[0], q[1]); c.stroke(); c.restore();
        var f = (t * 0.45 + j * 0.5) % 1, L1 = Math.abs(my - taco[1]), L2 = Math.abs(q[0] - taco[0]), L3 = Math.abs(q[1] - my), s = (1 - f) * (L1 + L2 + L3), pp;
        if (s < L1) pp = [taco[0], taco[1] + (my - taco[1]) * s / L1];
        else if (s < L1 + L2) pp = [taco[0] + (q[0] - taco[0]) * (s - L1) / L2, my];
        else pp = [q[0], my + (q[1] - my) * (s - L1 - L2) / L3];
        c.save(); c.globalAlpha = vP; pulso(c, pp[0], pp[1], Math.sin(f * Math.PI)); c.restore();
      });
    }
    // el dashboard baja desde la nube
    var rw = Math.min(W * 0.62, 400), ry = lerp(ny, ny + 46, eD), rs = lerp(0.35, 1, eD), rx = cx - rw * rs / 2;
    poner(elRep, rx, ry, rw * rs, eD);
    if (eD > 0.01) linea(c, [cx, ny + 18], [cx, ry + 6], eD);
    // pulsos de cada antena a la nube
    ants.forEach(function (p, j) {
      var f = ((t / 2.6) + j * 0.19) % 1, u = acel(f), q = [cx + 6, ny + 20];
      linea(c, p, q, (j ? 0.6 : 1) * (1 - 0.6 * eD));
      c.save(); c.globalAlpha = 1 - 0.5 * eD; pulso(c, lerp(p[0], q[0], u), lerp(p[1], q[1], u), Math.sin(f * Math.PI)); c.restore();
      if (f > 0.92) { brillo = Math.max(brillo, (f - 0.92) / 0.08); if (!fijo && (!llegada[j] || t - llegada[j] > 1)) llegada[j] = t; }
    });
    nube(c, cx + 35, ny, 1.6, brillo);
    if (eD > 0.3) tablero(c, rx, ry, rw * rs, k(a, 2.6, 3), t);
    version(t, fijo);
  }

  // ─── ciclo (como el relato del mapa) ───
  function progreso() { var r = rec.getBoundingClientRect(), largo = r.height - innerHeight; return largo > 0 ? cl(-r.top / largo) : 0; }
  function marcarPaso(n) {
    pasos.forEach(function (p, i) {
      var on = i === n; p.classList.toggle("activo", on);
      p.querySelectorAll("a").forEach(function (x) { if (on) x.removeAttribute("tabindex"); else x.setAttribute("tabindex", "-1"); });
    });
  }
  function cuadro(ahora) {
    raf = 0;
    var dt = tPrev ? Math.min(0.1, (ahora - tPrev) / 1000) : 0; tPrev = ahora;
    meta = Math.round(progreso() * N);
    a = meta > a ? Math.min(meta, a + dt / DUR) : Math.max(meta, a - dt / DUR);
    var t = ahora / 1000;
    if (a < 0.5 && verT < 0) { verT = t; verN = 0; }   // al llegar a la parada 0, cuenta desde v.1
    if (a > 1.5) verT = -1;
    var n = Math.round(a); if (n !== pasoVisible) { pasoVisible = n; marcarPaso(n); }
    escena(a, t, false);
    if (visible && !document.hidden) raf = requestAnimationFrame(cuadro); else tPrev = 0;
  }
  function vivo() { return document.documentElement.classList.contains("prod-vivo"); }
  function arrancar() { if (!raf && visible && vivo()) raf = requestAnimationFrame(cuadro); }
  function quieta() { verN = 0; escena(1, 1.3, true); }
  // en el celular (con movimiento), una sola escena bajo el título que recorre sola las 4 paradas en bucle; destaca el
  // texto de la parada que muestra. Con movimiento reducido, quieta
  var mqMov = matchMedia("(prefers-reduced-motion: no-preference)"), cabeza = sec.querySelector(".prod-cabeza"), rafC = 0, pasoCiclo = -1;
  var PARADA = 4.6, CAMBIO = 0.35;              // s por parada; fracción final que es transición
  function enCiclo() { return !vivo() && mqMov.matches; }
  function ciclo(ahora) {
    rafC = 0; if (!enCiclo()) return;
    var t = ahora / 1000, T = t % (4 * PARADA), n = Math.floor(T / PARADA), f = (T - n * PARADA) / PARADA, u = f > 1 - CAMBIO ? suave((f - 1 + CAMBIO) / CAMBIO) : 0;
    var av = n < 3 ? n + u : 3 - 3 * u;
    if (av < 0.5 && verT < 0) { verT = t; verN = 0; } if (av > 1.5) verT = -1;
    var m = Math.round(av); if (m !== pasoCiclo) { pasoCiclo = m; pasos.forEach(function (p, i) { p.classList.toggle("en-ciclo", i === m); }); }
    escena(av, t, false);
    if (visible && !document.hidden) rafC = requestAnimationFrame(ciclo);
  }
  function arrancarCiclo() { if (!rafC && visible && enCiclo()) rafC = requestAnimationFrame(ciclo); }
  function ubicarEscena() {                       // bajo el título en el celular; a la derecha (su lugar) en escritorio
    if (!vivo() && cabeza && esc.previousElementSibling !== cabeza) cabeza.after(esc);
    else if (vivo() && esc.parentNode !== sec) sec.appendChild(esc);
  }
  function modo() {
    var v = mqVivo.matches;
    document.documentElement.classList.toggle("prod-vivo", v);
    colores();
    ubicarEscena();
    if (v) { pasos.forEach(function (p) { p.classList.remove("en-ciclo"); }); marcarPaso(pasoVisible = Math.round(a)); arrancar(); }
    else { pasos.forEach(function (p) { p.classList.add("activo"); p.querySelectorAll("a").forEach(function (x) { x.removeAttribute("tabindex"); }); }); quieta(); arrancarCiclo(); }
  }
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; arrancar(); arrancarCiclo(); }).observe(rec);
  document.addEventListener("visibilitychange", function () { arrancar(); arrancarCiclo(); });
  if (mqMov.addEventListener) mqMov.addEventListener("change", modo);
  window.addEventListener("scroll", arrancar, { passive: true });
  if (mqVivo.addEventListener) mqVivo.addEventListener("change", modo);
  var espera = 0;
  window.addEventListener("resize", function () { clearTimeout(espera); espera = setTimeout(function () { if (!vivo() && !enCiclo()) quieta(); }, 150); });
  new MutationObserver(function () { colores(); if (!vivo()) quieta(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  if (document.fonts) document.fonts.ready.then(function () { if (!vivo()) quieta(); });
  a = meta = Math.round(progreso() * N);
  modo();
})();
