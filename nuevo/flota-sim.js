/* Simulación de la flota en la ruta H-25 (datos en datos/h25.js), común a las vistas de la portada.
   Cada bus acelera, frena en las curvas, sigue el límite del tramo (a veces lo pasa un poco) y descansa en los
   extremos; cada bus envía una trama a ritmo regular, que tarda VUELO en llegar a SACEL y deja su marca en el
   registro (una fila por bus: conducción, detención y, apenas más brillante, exceso de velocidad).
   Uso: var sim = FlotaSim(window.H25, { escala: 15 }); sim.avanzar(dt); sim.buses, sim.tramas, sim.dibujarRegistro(ctx, reg)…
   Opciones (todas en segundos de animación salvo escala): escala, periodo, vuelo, ventana, descanso [mín, máx], parada [mín, máx]. */
(function () {
  "use strict";

  window.FlotaSim = function (D, op) {
    op = op || {};
    var ESCALA = op.escala || 45;      // segundos reales por segundo de animación
    var BUSES = 6;
    var PERIODO = op.periodo || 1.6;   // s de animación entre tramas de un mismo bus
    var VUELO = op.vuelo || 1.1;       // s que tarda una trama en llegar a SACEL
    var VENTANA = op.ventana || 48;    // s de registro visibles
    var DESCANSO = op.descanso || [11, 29], PARADA = op.parada || [4, 12];
    var PASO = 50;              // m, grilla del perfil de velocidad
    var ACEL = 0.7, FRENO = 1.1, A_LAT = 1.8;   // m/s²: arranque y frenado de un bus cargado; lateral cómodo en curva
    // colores del registro por tema: [rgb, alfa]
    var PALETAS = {
      oscuro: { rotulo: ["242,237,227", 0.62], vacio: ["242,237,227", 0.05], detenido: ["242,237,227", 0.16],
                conduce: ["208,138,62", 0.85], alerta: ["255,221,180", 1], trama: 0.7 },
      claro:  { rotulo: ["0,16,79", 0.72], vacio: ["0,16,79", 0.08], detenido: ["0,16,79", 0.32],
                conduce: ["184,112,42", 0.9], alerta: ["120,56,8", 1], trama: 0.85 }
    };
    var pal = PALETAS.oscuro;
    function rgba(c, a) { return "rgba(" + c[0] + "," + (c[1] * (a === undefined ? 1 : a)).toFixed(3) + ")"; }

    var semilla = 25;
    function azar() { semilla = (semilla * 1664525 + 1013904223) >>> 0; return semilla / 4294967296; }

    // ─── ruta ───
    var R = D.ruta, acum = [0], i;
    for (i = 1; i < R.length; i++) acum.push(acum[i - 1] + Math.hypot(R[i][0] - R[i - 1][0], R[i][1] - R[i - 1][1]));
    var LARGO = acum[acum.length - 1];
    function enRuta(s) {                       // s: metros desde el extremo oeste → [x, y] en metros del cuadro
      s = Math.max(0, Math.min(LARGO, s));
      var lo = 0, hi = acum.length - 1;
      while (hi - lo > 1) { var m = (lo + hi) >> 1; if (acum[m] < s) lo = m; else hi = m; }
      var t = (s - acum[lo]) / (acum[hi] - acum[lo] || 1);
      return [R[lo][0] + (R[hi][0] - R[lo][0]) * t, R[lo][1] + (R[hi][1] - R[lo][1]) * t];
    }
    function rumbo(s) { var a = enRuta(s - 40), b = enRuta(s + 40); return Math.atan2(b[1] - a[1], b[0] - a[0]); }
    function altitud(s) {                      // m sobre el mar, del perfil del camino
      var P = D.perfil, u = Math.max(0, s * (P.ruta.length - 1) * P.paso / LARGO / P.paso), k = Math.min(P.ruta.length - 2, Math.floor(u));
      return P.ruta[k] + (P.ruta[k + 1] - P.ruta[k]) * Math.min(1, u - k);
    }
    function limiteKmh(s) {
      var L = D.limites, v = L[0][1], sr = s * D.largo / LARGO;
      for (var k = 0; k < L.length && L[k][0] <= sr; k++) v = L[k][1];
      return v;
    }

    var N = Math.ceil(LARGO / PASO) + 1, base = new Float32Array(N), lim = new Float32Array(N);
    for (i = 0; i < N; i++) {
      var s = i * PASO, d = rumbo(s + 110) - rumbo(s - 110);
      d = Math.abs(Math.atan2(Math.sin(d), Math.cos(d)));
      lim[i] = limiteKmh(s) / 3.6;
      base[i] = Math.min(lim[i], Math.sqrt(A_LAT * 220 / Math.max(d, 1e-3)));
    }
    function perfil(factor, fase, sube) {
      var v = new Float32Array(N), k;
      for (k = 0; k < N; k++) v[k] = base[sube ? k : N - 1 - k] * (factor + 0.07 * Math.sin(k * PASO / 1700 + fase));
      v[0] = v[N - 1] = 0;
      for (k = N - 2; k >= 0; k--) v[k] = Math.min(v[k], Math.sqrt(v[k + 1] * v[k + 1] + 2 * FRENO * PASO));
      for (k = 1; k < N; k++) v[k] = Math.min(v[k], Math.sqrt(v[k - 1] * v[k - 1] + 2 * ACEL * PASO));
      return v;
    }

    // ─── buses ───
    var buses = [];
    for (var b = 0; b < BUSES; b++) {
      var f = 0.86 + azar() * 0.16, fa = azar() * 6.28;
      buses.push({
        sube: perfil(f, fa, true), baja: perfil(f, fa + 2, false),
        dir: b % 2 ? -1 : 1,                     // 1: hacia el este (sube), -1: hacia el oeste (baja)
        x: (0.08 + 0.84 * (b / BUSES) + azar() * 0.05) * LARGO,
        espera: 0, parada: -1, fila: [], fase: b * PERIODO / BUSES, prox: 0, v: 0, ult: 0
      });
    }
    function velocidad(bus) {
      var p = bus.dir > 0 ? bus.sube : bus.baja, u = bus.x / PASO, k = Math.min(N - 2, Math.floor(u));
      var v = p[k] + (p[k + 1] - p[k]) * (u - k);
      if (bus.parada >= 0) v = Math.min(v, Math.sqrt(2 * FRENO * Math.max(0, bus.parada - bus.x)));
      return Math.max(v, bus.x < 30 ? 2.5 : 0);
    }
    function posicion(bus) { return bus.dir > 0 ? bus.x : LARGO - bus.x; }
    function exceso(bus) { return bus.v > 0.5 && bus.v > lim[Math.min(N - 1, Math.round(posicion(bus) / PASO))] * 1.03; }

    // ─── tiempo ───
    var api = { reloj: 0, tramas: [], llegadas: [], buses: buses, LARGO: LARGO, VENTANA: VENTANA, VUELO: VUELO };
    api.avanzar = function (dt) {
      api.reloj += dt;
      var reloj = api.reloj;
      buses.forEach(function (bus, i) {
        if (bus.espera > 0) {
          bus.espera -= dt; bus.v = 0;
          if (bus.espera <= 0 && bus.parada < 0) {
            bus.dir = -bus.dir; bus.x = 0;
            if (azar() < 0.35) bus.parada = LARGO * (0.2 + azar() * 0.6);
          } else if (bus.espera <= 0) bus.parada = -1;
        } else {
          bus.v = Math.min(velocidad(bus), bus.v + ACEL * dt * ESCALA);
          bus.x += bus.v * dt * ESCALA;
          if (bus.parada >= 0 && bus.x >= bus.parada - 2) { bus.x = bus.parada; bus.espera = PARADA[0] + azar() * (PARADA[1] - PARADA[0]); bus.v = 0; }
          if (bus.x >= LARGO) { bus.x = LARGO; bus.espera = DESCANSO[0] + azar() * (DESCANSO[1] - DESCANSO[0]); bus.v = 0; }
        }
        if (reloj >= bus.prox) {
          if (!bus.prox) bus.prox = reloj + bus.fase;
          else {
            api.tramas.push({ bus: i, s: posicion(bus), t: reloj, desde: bus.ult || reloj - PERIODO,
                              estado: bus.v < 0.5 ? 0 : (exceso(bus) ? 2 : 1) });
            bus.ult = reloj; bus.prox += PERIODO;
          }
        }
      });
      for (var k = api.tramas.length - 1; k >= 0; k--) {
        var tr = api.tramas[k];
        if (reloj - tr.t >= VUELO) {
          var fila = buses[tr.bus].fila;
          fila.push([tr.desde + VUELO, tr.t + VUELO, tr.estado]);
          while (fila.length && fila[0][1] < reloj - VENTANA - 2) fila.shift();
          api.llegadas.push({ bus: tr.bus, t: reloj, estado: tr.estado });
          api.tramas.splice(k, 1);
        }
      }
      for (var q = api.llegadas.length - 1; q >= 0; q--) if (reloj - api.llegadas[q].t > 0.9) api.llegadas.splice(q, 1);
    };
    api.enRuta = enRuta; api.rumbo = rumbo; api.altitud = altitud; api.posicion = posicion; api.exceso = exceso;
    // sentido de marcha en el plano: el rumbo de la ruta, o el opuesto al bajar
    api.rumboBus = function (bus) { return rumbo(posicion(bus)) + (bus.dir > 0 ? 0 : Math.PI); };

    // ─── dibujo común: registro y tramas en vuelo ───
    // reg: { x, y, w, fila } en px de pantalla
    api.destino = function (reg, bus) { return [reg.x + reg.w, reg.y + bus * reg.fila + 1.5]; };
    api.tema = function (nombre) { pal = PALETAS[nombre] || PALETAS.oscuro; };
    api.dibujarRegistro = function (c, reg) {
      var reloj = api.reloj, pps = reg.w / VENTANA;
      c.font = "500 11px 'Plex Mono', ui-monospace, monospace"; c.textAlign = "right"; c.textBaseline = "alphabetic";
      c.fillStyle = rgba(pal.rotulo); c.fillText("SACEL", reg.x + reg.w, reg.y - 10);
      buses.forEach(function (bus, r) {
        var y = reg.y + r * reg.fila;
        c.fillStyle = rgba(pal.vacio); c.fillRect(reg.x, y, reg.w, 3);
        bus.fila.forEach(function (sg) {
          var x1 = reg.x + reg.w - (reloj - sg[0]) * pps, x2 = reg.x + reg.w - (reloj - sg[1]) * pps;
          x1 = Math.max(x1, reg.x); if (x2 <= reg.x) return;
          var a = Math.min(1, (x1 - reg.x) / (reg.w * 0.18));
          if (sg[2] === 0) { c.fillStyle = rgba(pal.detenido, a); c.fillRect(x1, y + 1, x2 - x1 - 1, 1); }
          else {
            c.fillStyle = rgba(sg[2] === 2 ? pal.alerta : pal.conduce, a);
            c.fillRect(x1, sg[2] === 2 ? y - 0.5 : y, x2 - x1 - 1, sg[2] === 2 ? 4 : 3);
          }
        });
      });
      api.llegadas.forEach(function (l) {
        var p = api.destino(reg, l.bus), a = 1 - (reloj - l.t) / 0.9;
        c.fillStyle = rgba(l.estado === 2 ? pal.alerta : pal.conduce, a * 0.9);
        c.beginPath(); c.arc(p[0] + 4, p[1], 2 + (1 - a) * 3, 0, 7); c.fill();
      });
    };
    // origen(tr) → [x, y] en pantalla del punto de la ruta donde se envió la trama
    api.dibujarTramas = function (c, reg, origen) {
      var reloj = api.reloj;
      c.lineCap = "round";
      api.tramas.forEach(function (tr) {
        var u = (reloj - tr.t) / VUELO; if (u < 0 || u > 1) return;
        var a = origen(tr), z = api.destino(reg, tr.bus);
        var cx = a[0] + (z[0] - a[0]) * 0.25, cy = Math.min(a[1], z[1]) - 40;
        function pt(t) { var m = 1 - t; return [m * m * a[0] + 2 * m * t * cx + t * t * z[0], m * m * a[1] + 2 * m * t * cy + t * t * z[1]]; }
        var col = tr.estado === 2 ? pal.alerta : pal.conduce, n = 10;
        for (var k = 0; k < n; k++) {
          var t0 = u - k * 0.022, t1 = u - (k + 1) * 0.022; if (t1 < 0) break;
          var p0 = pt(t0), p1 = pt(t1);
          c.strokeStyle = "rgba(" + col[0] + "," + ((1 - k / n) * (tr.estado === 2 ? 0.95 : pal.trama)).toFixed(3) + ")";
          c.lineWidth = 1.3; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke();
        }
      });
    };

    // al cargar, el registro ya viene lleno
    for (var pre = 0; pre < (VENTANA + 4) / 0.05; pre++) api.avanzar(0.05);
    return api;
  };

  // ciclo de animación común: dibujar(dt) se llama en cada cuadro; respeta pausa, movimiento reducido y visibilidad
  window.FlotaCiclo = function (lienzo, medir, paso, alDesplazar) {
    var boton = document.querySelector(".pausa");
    var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var pausa = false, visible = true, raf = 0, previo = 0;
    function cuadro(t) {
      raf = 0;
      if (pausa || !visible || document.hidden) { previo = 0; return; }
      var dt = previo ? Math.min((t - previo) / 1000, 0.05) : 0; previo = t;
      paso(dt);
      raf = requestAnimationFrame(cuadro);
    }
    function arrancar() { if (!raf && !pausa && visible && !quieto) { previo = 0; raf = requestAnimationFrame(cuadro); } }
    if (boton) {
      if (quieto) boton.hidden = true;
      boton.addEventListener("click", function () { pausa = !pausa; boton.setAttribute("aria-pressed", String(pausa)); arrancar(); });
    }
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; arrancar(); }).observe(lienzo);
    document.addEventListener("visibilitychange", arrancar);
    var espera = 0;
    window.addEventListener("resize", function () { clearTimeout(espera); espera = setTimeout(function () { medir(); paso(0); }, 120); });
    if (alDesplazar && !quieto) {
      var pendiente = false;
      window.addEventListener("scroll", function () {
        if (pendiente) return; pendiente = true;
        requestAnimationFrame(function () { pendiente = false; alDesplazar(); if (pausa || !visible) paso(0); });
      }, { passive: true });
      alDesplazar();
    }
    medir(); paso(0);
    if (document.fonts) document.fonts.ready.then(function () { medir(); paso(0); });
    arrancar();
  };
})();
