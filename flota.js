/* Portada: la flota en la cordillera.
   Buses que suben y bajan la ruta H-25 entre las curvas de nivel (datos en datos/h25.js). Cada bus acelera, frena en
   las curvas, respeta el límite del tramo (a veces lo pasa un poco) y descansa en los extremos. Cada bus envía una trama
   a ritmo regular; la trama viaja hasta SACEL y deja su marca en el registro: una fila por bus que muestra conducción,
   detención y, apenas más brillante, los excesos de velocidad.
   Sin dependencias. Con movimiento reducido dibuja un cuadro quieto; el botón .pausa detiene y reanuda. */
(function () {
  "use strict";
  var D = window.H25, lienzo = document.getElementById("flota");
  if (!D || !lienzo || !lienzo.getContext) return;
  var ctx = lienzo.getContext("2d");
  var boton = document.querySelector(".pausa");
  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ─── parámetros ───
  var ESCALA = 45;            // segundos reales por segundo de animación
  var BUSES = 6;
  var PERIODO = 1.6;          // s de animación entre tramas de un mismo bus
  var VUELO = 1.1;            // s que tarda una trama en llegar a SACEL
  var VENTANA = 48;           // s de registro visibles
  var PASO = 50;              // m, grilla del perfil de velocidad
  var ACEL = 0.7, FRENO = 1.1, A_LAT = 2.2;   // m/s²
  var COBRE = "208,138,62", MARFIL = "242,237,227";

  // generador con semilla: el recorrido es el mismo en cada visita
  var semilla = 25;
  function azar() { semilla = (semilla * 1664525 + 1013904223) >>> 0; return semilla / 4294967296; }

  // ─── geometría de la ruta ───
  var R = D.ruta, acum = [0];
  for (var i = 1; i < R.length; i++) acum.push(acum[i - 1] + Math.hypot(R[i][0] - R[i - 1][0], R[i][1] - R[i - 1][1]));
  var LARGO = acum[acum.length - 1];
  function enRuta(s) {                       // s en metros desde el inicio (oeste)
    s = Math.max(0, Math.min(LARGO, s));
    var lo = 0, hi = acum.length - 1;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (acum[m] < s) lo = m; else hi = m; }
    var t = (s - acum[lo]) / (acum[hi] - acum[lo] || 1);
    return [R[lo][0] + (R[hi][0] - R[lo][0]) * t, R[lo][1] + (R[hi][1] - R[lo][1]) * t];
  }
  function limite(s) {                       // m/s, límite del tramo (OpenStreetMap)
    var L = D.limites, v = L[0][1];
    var sr = s * D.largo / LARGO;
    for (var k = 0; k < L.length && L[k][0] <= sr; k++) v = L[k][1];
    return v / 3.6;
  }
  function rumbo(s) { var a = enRuta(s - 40), b = enRuta(s + 40); return Math.atan2(b[1] - a[1], b[0] - a[0]); }

  // velocidad base por celda: el límite, o menos en las curvas cerradas
  var N = Math.ceil(LARGO / PASO) + 1, base = new Float32Array(N), lim = new Float32Array(N);
  for (i = 0; i < N; i++) {
    var s = i * PASO, d = rumbo(s + 110) - rumbo(s - 110);
    d = Math.abs(Math.atan2(Math.sin(d), Math.cos(d)));
    var radio = 220 / Math.max(d, 1e-3);
    lim[i] = limite(s);
    base[i] = Math.min(lim[i], Math.sqrt(A_LAT * radio));
  }
  // perfil de un bus en un sentido: velocidad objetivo con aceleración y frenado finitos, detenido en los extremos
  function perfil(factor, fase, sube) {
    var v = new Float32Array(N), k;
    for (k = 0; k < N; k++) {
      var j = sube ? k : N - 1 - k;
      v[k] = base[j] * (factor + 0.07 * Math.sin(k * PASO / 1700 + fase));
    }
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
      dir: b % 2 ? -1 : 1,                     // 1: hacia el este (sube), -1: hacia el oeste
      x: (0.08 + 0.84 * (b / BUSES) + azar() * 0.05) * LARGO,  // recorrido en el sentido actual
      espera: 0, parada: -1, fila: [], cola: [], fase: b * PERIODO / BUSES, prox: 0, v: 0, ult: 0
    });
  }
  function velocidad(bus) {
    var p = bus.dir > 0 ? bus.sube : bus.baja, u = bus.x / PASO, k = Math.min(N - 2, Math.floor(u));
    var v = p[k] + (p[k + 1] - p[k]) * (u - k);
    if (bus.parada >= 0) v = Math.min(v, Math.sqrt(2 * FRENO * Math.max(0, bus.parada - bus.x)));
    return Math.max(v, bus.x < 30 ? 2.5 : 0);
  }
  function posicion(bus) { return bus.dir > 0 ? bus.x : LARGO - bus.x; }
  function exceso(bus) { var s = posicion(bus); return bus.v > lim[Math.min(N - 1, Math.round(s / PASO))] * 1.03; }

  // ─── simulación ───
  var reloj = 0, tramas = [];
  function avanzar(dt) {
    reloj += dt;
    for (var i = 0; i < buses.length; i++) {
      var bus = buses[i];
      if (bus.espera > 0) {
        bus.espera -= dt; bus.v = 0;
        if (bus.espera <= 0 && bus.parada < 0) {   // fin del descanso en un extremo: vuelta
          bus.dir = -bus.dir; bus.x = 0;
          if (azar() < 0.35) bus.parada = LARGO * (0.2 + azar() * 0.6);
        } else if (bus.espera <= 0) bus.parada = -1;
      } else {
        bus.v = Math.min(velocidad(bus), bus.v + ACEL * dt * ESCALA);   // arranca con aceleración finita
        bus.x += bus.v * dt * ESCALA;
        if (bus.parada >= 0 && bus.x >= bus.parada - 2) { bus.x = bus.parada; bus.espera = (3 + azar() * 6) * 60 / ESCALA; bus.v = 0; }
        if (bus.x >= LARGO) { bus.x = LARGO; bus.espera = (8 + azar() * 14) * 60 / ESCALA; bus.v = 0; }
      }
      // trama periódica
      if (reloj >= bus.prox) {
        if (!bus.prox) bus.prox = reloj + bus.fase;
        else {
          tramas.push({ bus: i, s: posicion(bus), t: reloj, desde: bus.ult || reloj - PERIODO,
                        estado: bus.v < 0.5 ? 0 : (exceso(bus) ? 2 : 1) });
          bus.ult = reloj; bus.prox += PERIODO;
        }
      }
    }
    // tramas que llegan: se escriben en el registro
    for (var k = tramas.length - 1; k >= 0; k--) {
      var tr = tramas[k];
      if (reloj - tr.t >= VUELO) {
        var fila = buses[tr.bus].fila;
        fila.push([tr.desde + VUELO, tr.t + VUELO, tr.estado]);
        while (fila.length && fila[0][1] < reloj - VENTANA - 2) fila.shift();
        llegadas.push({ bus: tr.bus, t: reloj, estado: tr.estado });
        tramas.splice(k, 1);
      }
    }
    for (var q = llegadas.length - 1; q >= 0; q--) if (reloj - llegadas[q].t > 0.6) llegadas.splice(q, 1);
  }
  var llegadas = [];

  // ─── dibujo ───
  var W = 0, H = 0, dpr = 1, escala = 1, ox = 0, oy = 0, fondo = null, reg = null;
  function aPantalla(p) { return [ox + p[0] * escala, oy + p[1] * escala]; }

  function maquetar() {
    var movil = W < 760, zona;
    if (movil) zona = [0, H - 300, W, 270];
    else zona = [W * 0.34, H * 0.27, W * 0.65, H * 0.70];
    escala = Math.min(zona[2] / D.ancho, zona[3] / D.alto);
    ox = zona[0] + (zona[2] - D.ancho * escala) / 2;
    oy = zona[1] + (zona[3] - D.alto * escala) / 2;
    reg = movil
      ? { x: W * 0.06, y: H - 345, w: W * 0.88, fila: 7 }
      : { x: W * 0.54, y: H * 0.13, w: W * 0.42, fila: 8 };
  }

  function pintarFondo() {
    fondo = document.createElement("canvas");
    fondo.width = lienzo.width; fondo.height = lienzo.height;
    var c = fondo.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.lineJoin = c.lineCap = "round";
    c.save(); c.beginPath(); c.rect(ox, oy, D.ancho * escala, D.alto * escala); c.clip();
    D.curvas.forEach(function (cv) {
      var mayor = cv[0] % 500 === 0, p = cv[1];
      c.strokeStyle = "rgba(" + MARFIL + "," + (mayor ? 0.15 : 0.065) + ")";
      c.lineWidth = mayor ? 1 : 0.8;
      c.beginPath();
      for (var k = 0; k < p.length; k += 2) {
        var x = ox + p[k] * escala, y = oy + p[k + 1] * escala;
        k ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
    });
    // el relieve se desvanece hacia los bordes del cuadro
    var w = D.ancho * escala, h = D.alto * escala, m = Math.min(w, h) * 0.22;
    c.globalCompositeOperation = "destination-out";
    [[ox, 0, ox + m, 0, ox, oy, m, h], [ox + w, 0, ox + w - m, 0, ox + w - m, oy, m, h],
     [0, oy, 0, oy + m, ox, oy, w, m], [0, oy + h, 0, oy + h - m, ox, oy + h - m, w, m]].forEach(function (g) {
      var gr = c.createLinearGradient(g[0], g[1], g[2], g[3]);
      gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = gr; c.fillRect(g[4], g[5], g[6], g[7]);
    });
    c.globalCompositeOperation = "source-over";
    c.restore();
    // ruta
    function trazo() { c.beginPath(); R.forEach(function (p, k) { var q = aPantalla(p); k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.stroke(); }
    c.strokeStyle = "rgba(" + COBRE + ",.10)"; c.lineWidth = 7; trazo();
    c.strokeStyle = "rgba(" + MARFIL + ",.42)"; c.lineWidth = 1.4; trazo();
    [R[0], R[R.length - 1]].forEach(function (p) {
      var q = aPantalla(p);
      c.beginPath(); c.arc(q[0], q[1], 4, 0, 7); c.strokeStyle = "rgba(" + MARFIL + ",.6)"; c.lineWidth = 1.2; c.stroke();
    });
    // registro: rótulo y renglones vacíos
    c.font = "500 11px 'Plex Mono', ui-monospace, monospace"; c.textAlign = "right"; c.textBaseline = "alphabetic";
    c.fillStyle = "rgba(" + MARFIL + ",.62)"; c.fillText("SACEL", reg.x + reg.w, reg.y - 10);
    for (var r = 0; r < BUSES; r++) {
      c.fillStyle = "rgba(" + MARFIL + ",.05)"; c.fillRect(reg.x, reg.y + r * reg.fila, reg.w, 3);
    }
  }

  function destino(bus) { return [reg.x + reg.w, reg.y + bus * reg.fila + 1.5]; }

  function dibujar() {
    var c = ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, lienzo.width, lienzo.height);
    c.drawImage(fondo, 0, 0);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.lineCap = "round";

    // registro: una fila por bus, el presente a la derecha
    var pps = reg.w / VENTANA;
    for (var r = 0; r < buses.length; r++) {
      var y = reg.y + r * reg.fila;
      buses[r].fila.forEach(function (sg) {
        var x1 = reg.x + reg.w - (reloj - sg[0]) * pps, x2 = reg.x + reg.w - (reloj - sg[1]) * pps;
        x1 = Math.max(x1, reg.x); if (x2 <= reg.x) return;
        var desv = Math.min(1, (x1 - reg.x) / (reg.w * 0.18));   // se desvanece al salir por la izquierda
        if (sg[2] === 0) { c.fillStyle = "rgba(" + MARFIL + "," + (0.16 * desv).toFixed(3) + ")"; c.fillRect(x1, y + 1, x2 - x1 - 1, 1); }
        else {
          c.fillStyle = sg[2] === 2 ? "rgba(255,221,180," + desv.toFixed(3) + ")" : "rgba(" + COBRE + "," + (0.85 * desv).toFixed(3) + ")";
          c.fillRect(x1, sg[2] === 2 ? y - 0.5 : y, x2 - x1 - 1, sg[2] === 2 ? 4 : 3);
        }
      });
    }
    llegadas.forEach(function (l) {
      var p = destino(l.bus), a = 1 - (reloj - l.t) / 0.6;
      c.fillStyle = "rgba(" + (l.estado === 2 ? "255,221,180" : COBRE) + "," + (a * 0.9).toFixed(3) + ")";
      c.beginPath(); c.arc(p[0] + 4, p[1], 2 + (1 - a) * 3, 0, 7); c.fill();
    });

    // tramas en vuelo: un arco desde el bus hasta su fila en SACEL
    tramas.forEach(function (tr) {
      var u = (reloj - tr.t) / VUELO; if (u < 0 || u > 1) return;
      var a = aPantalla(enRuta(tr.s)), z = destino(tr.bus);
      var cx = a[0] + (z[0] - a[0]) * 0.25, cy = Math.min(a[1], z[1]) - 40;
      function pt(t) { var m = 1 - t; return [m * m * a[0] + 2 * m * t * cx + t * t * z[0], m * m * a[1] + 2 * m * t * cy + t * t * z[1]]; }
      var col = tr.estado === 2 ? "255,221,180" : COBRE, n = 10;
      for (var k = 0; k < n; k++) {
        var t0 = u - k * 0.022, t1 = u - (k + 1) * 0.022; if (t1 < 0) break;
        var p0 = pt(t0), p1 = pt(t1);
        c.strokeStyle = "rgba(" + col + "," + ((1 - k / n) * (tr.estado === 2 ? 0.95 : 0.7)).toFixed(3) + ")";
        c.lineWidth = 1.3; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke();
      }
    });

    // buses con estela
    buses.forEach(function (bus) {
      var q = aPantalla(enRuta(posicion(bus)));
      bus.cola.unshift(q); if (bus.cola.length > 16) bus.cola.pop();
      for (var k = 1; k < bus.cola.length; k++) {
        c.strokeStyle = "rgba(" + COBRE + "," + (0.55 * (1 - k / bus.cola.length)).toFixed(3) + ")";
        c.lineWidth = 2.2; c.beginPath(); c.moveTo(bus.cola[k - 1][0], bus.cola[k - 1][1]); c.lineTo(bus.cola[k][0], bus.cola[k][1]); c.stroke();
      }
      var alerta = bus.v > 0.5 && exceso(bus);
      c.beginPath(); c.arc(q[0], q[1], alerta ? 7 : 5.5, 0, 7);
      c.fillStyle = "rgba(" + COBRE + "," + (alerta ? 0.28 : 0.16) + ")"; c.fill();
      c.beginPath(); c.arc(q[0], q[1], 2.6, 0, 7); c.fillStyle = alerta ? "#ffe2bd" : "#f6c48a"; c.fill();
    });
  }

  // ─── ciclo ───
  var pausa = false, visible = true, raf = 0, previo = 0;
  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = lienzo.clientWidth; H = lienzo.clientHeight;
    lienzo.width = Math.round(W * dpr); lienzo.height = Math.round(H * dpr);
    maquetar(); pintarFondo();
    buses.forEach(function (b) { b.cola = []; });
    dibujar();
  }
  function paso(t) {
    raf = 0;
    if (pausa || !visible || document.hidden) { previo = 0; return; }
    var dt = previo ? Math.min((t - previo) / 1000, 0.05) : 0; previo = t;
    avanzar(dt); dibujar();
    raf = requestAnimationFrame(paso);
  }
  function arrancar() { if (!raf && !pausa && visible && !quieto) { previo = 0; raf = requestAnimationFrame(paso); } }

  // el registro ya viene lleno: se simula antes de mostrar
  for (var pre = 0; pre < (VENTANA + 4) / 0.05; pre++) avanzar(0.05);

  if (boton) {
    if (quieto) boton.hidden = true;
    boton.addEventListener("click", function () { pausa = !pausa; boton.setAttribute("aria-pressed", String(pausa)); arrancar(); });
  }
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; arrancar(); }).observe(lienzo);
  document.addEventListener("visibilitychange", arrancar);
  var espera = 0;
  window.addEventListener("resize", function () { clearTimeout(espera); espera = setTimeout(medir, 120); });
  medir();
  if (document.fonts) document.fonts.ready.then(medir);
  arrancar();
})();
