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

  // ─── la escena para un avance a (0–3) ───
  function escena(a, t, fijo) {
    var W = esc.clientWidth, H = esc.clientHeight; if (!W || !H) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (capa.width !== Math.round(W * dpr) || capa.height !== Math.round(H * dpr)) { capa.width = Math.round(W * dpr); capa.height = Math.round(H * dpr); }
    var c = capa.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    var cx = W / 2, ny = H * 0.1, eP = k(a, 0.35, 1), eF = k(a, 1.2, 2), eD = k(a, 2.2, 3), brillo = 0;
    // el bus: grande (paradas 0–1), sube un poco con los periféricos y se achica a su lugar en la fila de la flota
    var Wb = Math.min(W * 0.66, 470), Hb = Wb * 196 / 520, wf = Math.min(W * 0.86 / NB, 120), hf = wf * 196 / 520;
    var filaY = lerp(H * 0.55, H * 0.82, eD), paso = W * 0.9 / NB, x0 = cx - paso * NB / 2 + (paso - wf) / 2;
    function lugar(i) { return [x0 + i * paso, filaY]; }
    var lp = lugar(3), bw = lerp(Wb, wf, eF), bx = lerp(cx - Wb / 2, lp[0], eF), by = lerp(lerp(H * 0.42, H * 0.3, eP), lp[1], eF), bh = bw * 196 / 520;
    poner(elBus, bx, by, bw, 1);
    function antena(x, y, w) { return [x + w * 462 / 520, y + w * 24 / 520]; }
    var taco = [bx + bw * 454 / 520, by + bw * 112 / 520], ants = [antena(bx, by, bw)];
    // la flota
    flota.forEach(function (el, j) {
      var i = j < 3 ? j : j + 1, v = k(a, 1.35 + Math.abs(i - 3) * 0.08, 1.85 + Math.abs(i - 3) * 0.08), p = lugar(i);
      poner(el, p[0], p[1] + (1 - v) * 14, wf, v); if (v > 0.05) ants.push(antena(p[0], p[1], wf));
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
    var rw = Math.min(W * 0.62, 400), ry = lerp(ny, ny + 46, eD), rs = lerp(0.35, 1, eD);
    poner(elRep, cx - rw * rs / 2, ry, rw * rs, eD);
    if (eD > 0.01) linea(c, [cx, ny + 18], [cx, ry + 6], eD);
    // pulsos de cada antena a la nube
    ants.forEach(function (p, j) {
      var f = ((t / 2.6) + j * 0.19) % 1, u = acel(f), q = [cx + 6, ny + 20];
      linea(c, p, q, (j ? 0.6 : 1) * (1 - 0.6 * eD));
      c.save(); c.globalAlpha = 1 - 0.5 * eD; pulso(c, lerp(p[0], q[0], u), lerp(p[1], q[1], u), Math.sin(f * Math.PI)); c.restore();
      if (f > 0.92) brillo = Math.max(brillo, (f - 0.92) / 0.08);
    });
    nube(c, cx + 35, ny, 1.6, brillo);
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
  function modo() {
    var v = mqVivo.matches;
    document.documentElement.classList.toggle("prod-vivo", v);
    colores();
    if (v) { marcarPaso(pasoVisible = Math.round(a)); arrancar(); }
    else { pasos.forEach(function (p) { p.classList.add("activo"); p.querySelectorAll("a").forEach(function (x) { x.removeAttribute("tabindex"); }); }); quieta(); }
  }
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; arrancar(); }).observe(rec);
  document.addEventListener("visibilitychange", arrancar);
  window.addEventListener("scroll", arrancar, { passive: true });
  if (mqVivo.addEventListener) mqVivo.addEventListener("change", modo);
  var espera = 0;
  window.addEventListener("resize", function () { clearTimeout(espera); espera = setTimeout(function () { if (!vivo()) quieta(); }, 150); });
  new MutationObserver(function () { colores(); if (!vivo()) quieta(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  if (document.fonts) document.fonts.ready.then(function () { if (!vivo()) quieta(); });
  a = meta = Math.round(progreso() * N);
  modo();
})();
