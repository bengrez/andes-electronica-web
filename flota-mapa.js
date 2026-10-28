/* Portada, variante «mapa»: la cordillera vista desde arriba, de noche, con el relieve sombreado
   (img/relieve-noche.webp), el camino dibujado como camino y los buses vistos desde el techo, con sus focos.
   Dos lienzos: #flota (el mapa, dentro de .camara, que se inclina y desplaza con el scroll mediante CSS 3D) y
   #flota-reg (plano, encima: el registro SACEL y las tramas en vuelo, proyectadas con la misma cámara).
   Necesita datos/h25.js y flota-sim.js. */
(function () {
  "use strict";
  // en la página con vista 3D, esta vista es el respaldo: la llama flota-3d.js si no hay WebGL, y sin cámara
  var con3d = !!document.getElementById("flota3d");
  function iniciar() {
  var D = window.H25, lienzo = document.getElementById("flota"), capa = document.getElementById("flota-reg");
  if (!D || !window.FlotaSim || !lienzo || !capa || !lienzo.getContext) return;
  var camara = lienzo.parentNode, portada = camara.parentNode;
  var ctx = lienzo.getContext("2d"), cr = capa.getContext("2d");
  // Tiempo: los buses andan a velocidades reales (límite de OpenStreetMap por tramo, menos en las curvas según su
  // radio, con aceleración y frenado de bus) y el reloj corre ACELERACION_TIEMPO veces más rápido que el real.
  var ACELERACION_TIEMPO = 10;
  var DESCANSO_MIN = [10, 25], PARADA_MIN = [2, 5];      // minutos reales en los extremos y en una parada intermedia
  var sim = window.FlotaSim(D, {
    escala: ACELERACION_TIEMPO, periodo: 2.6, vuelo: 1.8, ventana: 80,
    descanso: DESCANSO_MIN.map(function (m) { return m * 60 / ACELERACION_TIEMPO; }),
    parada: PARADA_MIN.map(function (m) { return m * 60 / ACELERACION_TIEMPO; })
  });
  // tema (data-tema de <html>): la imagen del relieve y el panel del registro cambian con él
  function temaActual() { return document.documentElement.getAttribute("data-tema") === "claro" ? "claro" : "oscuro"; }
  var tema = temaActual();
  sim.tema(tema);
  var relieve = new Image();
  relieve.src = lienzo.getAttribute("data-relieve-" + tema) || lienzo.getAttribute("data-relieve");
  new MutationObserver(function () {
    tema = temaActual(); sim.tema(tema);
    var src = lienzo.getAttribute("data-relieve-" + tema);
    if (src) relieve.src = src;
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });

  var W = 0, H = 0, CW = 0, CH = 0, IX = 0, IY = 0, dpr = 1, esc = 1, ox = 0, oy = 0, fondo = null, reg = null;

  // ─── cámara: al bajar por la página el mapa se inclina hacia atrás, se acerca y se desplaza (sutil) ───
  var CAM = { persp: 1600, giro: 16, acerca: 0.1, panX: -0.035, panY: 0.16 };   // grados; fracciones del tamaño
  var cam = { p: 0, th: 0, s: 1, tx: 0, ty: 0, ox: 0, oy: 0 };
  function desplazar() {
    var alto = portada.offsetHeight || 1;
    var p = Math.max(0, Math.min(1, window.scrollY / alto));
    p = p * p * (3 - 2 * p);                       // suave al empezar y al terminar
    cam.p = p;
    cam.th = CAM.giro * p * Math.PI / 180;
    cam.s = 1 + CAM.acerca * p;
    cam.tx = CAM.panX * p * CW; cam.ty = CAM.panY * p * CH;
    camara.style.transform = p ? "perspective(" + CAM.persp + "px) translate(" + cam.tx.toFixed(1) + "px," + cam.ty.toFixed(1) +
      "px) rotateX(" + (CAM.giro * p).toFixed(2) + "deg) scale(" + cam.s.toFixed(4) + ")" : "";
  }
  // punto del lienzo del mapa (px CSS) → punto de la portada, con la misma transformación que aplica el CSS
  function proyectar(q) {
    var x = (q[0] - cam.ox) * cam.s, y = (q[1] - cam.oy) * cam.s;
    var z = y * Math.sin(cam.th); y = y * Math.cos(cam.th);
    x += cam.tx; y += cam.ty;
    var f = CAM.persp / (CAM.persp - z);
    return [x * f + cam.ox + IX, y * f + cam.oy + IY];
  }

  // metros del cuadro → px del lienzo del mapa
  function aMapa(p) { return [ox + p[0] * esc, oy + p[1] * esc]; }

  function maquetar() {
    var movil = W < 760, xs = D.ruta.map(function (p) { return p[0]; }), ys = D.ruta.map(function (p) { return p[1]; });
    var xe = Math.max.apply(null, xs), yc = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
    // se calcula en coordenadas de la portada y se pasa al lienzo del mapa, que es más grande (IX, IY: su margen)
    esc = Math.max(CW / D.ancho, CH / D.alto) * (movil ? 1.6 : 1.0);
    var px, py;
    if (movil) {   // en celular, un tramo de cuesta bajo el texto
      var m = D.ruta[0];
      for (var k = D.ruta.length - 1; k >= 0; k--) if (D.ruta[k][1] * esc >= H - 190 - IY) { m = D.ruta[k]; break; }
      px = 0.5 * W - m[0] * esc; py = (H - 190) - m[1] * esc;
    } else { px = 0.93 * W - xe * esc; py = 0.6 * H - yc * esc; }
    ox = Math.min(0, Math.max(CW - D.ancho * esc, px - IX));
    oy = Math.min(0, Math.max(CH - D.alto * esc, py - IY));
    reg = movil ? { x: W * 0.06, y: H - 440, w: W * 0.88, fila: 7 } : { x: W * 0.6, y: H - 150, w: W * 0.34, fila: 8 };
  }

  function pintarFondo() {
    fondo = document.createElement("canvas");
    fondo.width = lienzo.width; fondo.height = lienzo.height;
    var c = fondo.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = tema === "claro" ? "#f2f1eb" : "#01030f"; c.fillRect(0, 0, CW, CH);
    c.globalAlpha = tema === "claro" ? 0.45 : 1;          // de día el relieve va lavado, para que mande el camino
    if (relieve.complete && relieve.naturalWidth) c.drawImage(relieve, ox, oy, D.ancho * esc, D.alto * esc);
    c.globalAlpha = 1;
    function trazo() { c.beginPath(); D.ruta.forEach(function (p, k) { var q = aMapa(p); k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.stroke(); }
    c.lineJoin = "round"; c.lineCap = "round";
    c.strokeStyle = "rgba(208,138,62,.12)"; c.lineWidth = 14; trazo();
    c.strokeStyle = "rgba(2,6,24,.92)"; c.lineWidth = 7; trazo();
    c.strokeStyle = "#2a3359"; c.lineWidth = 4.6; trazo();
    c.setLineDash([4, 5]); c.strokeStyle = "rgba(246,196,138,.75)"; c.lineWidth = 0.9; trazo(); c.setLineDash([]);
    [D.ruta[0], D.ruta[D.ruta.length - 1]].forEach(function (p) {
      var q = aMapa(p);
      c.beginPath(); c.arc(q[0], q[1], 6, 0, 7); c.fillStyle = "#040c30"; c.fill();
      c.lineWidth = 1.5; c.strokeStyle = "rgba(242,237,227,.75)"; c.stroke();
    });
  }

  // bus visto desde el techo, apuntando hacia +x
  function bus(c, b, alerta) {
    var L = 17, A = 7;
    c.save();
    c.globalCompositeOperation = "lighter";
    if (b.v > 0.3) {
      var g = c.createRadialGradient(L / 2, 0, 0, L / 2, 0, 52);
      g.addColorStop(0, "rgba(255,230,190,.38)"); g.addColorStop(1, "rgba(255,230,190,0)");
      c.fillStyle = g; c.beginPath(); c.moveTo(L / 2, -2); c.lineTo(L / 2 + 52, -17); c.lineTo(L / 2 + 52, 17); c.lineTo(L / 2, 2); c.closePath(); c.fill();
    }
    if (alerta) { c.fillStyle = "rgba(255,221,180,.25)"; c.beginPath(); c.arc(0, 0, 13, 0, 7); c.fill(); }
    c.restore();
    c.fillStyle = "rgba(0,0,0,.45)"; c.fillRect(-L / 2 + 1.5, -A / 2 + 1.5, L, A);
    c.fillStyle = "#efe6d6"; c.beginPath();
    if (c.roundRect) c.roundRect(-L / 2, -A / 2, L, A, 2); else c.rect(-L / 2, -A / 2, L, A);
    c.fill();
    c.fillStyle = "#13204f"; c.fillRect(L / 2 - 2.6, -A / 2 + 0.8, 2, A - 1.6);         // parabrisas
    c.fillStyle = "#d08a3e"; c.fillRect(-L / 2 + 3, -0.8, L - 7, 1.6);                // franja del techo
    c.fillStyle = "rgba(19,32,79,.55)"; c.fillRect(-L / 2 + 5.5, -A / 2 + 1.4, 3.2, A - 2.8); // equipo del techo
  }

  function paso(dt) {
    if (dt) sim.avanzar(dt);
    if (!fondo) return;
    // mapa
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(fondo, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sim.buses.forEach(function (b) {
      var q = aMapa(sim.enRuta(sim.posicion(b)));
      ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(sim.rumboBus(b));
      bus(ctx, b, sim.exceso(b));
      ctx.restore();
    });
    // capa plana: registro y tramas
    cr.setTransform(1, 0, 0, 1, 0, 0);
    cr.clearRect(0, 0, capa.width, capa.height);
    cr.setTransform(dpr, 0, 0, dpr, 0, 0);
if (con3d) {          // respaldo de la vista 3D: sin registro; cada trama es un anillo que se abre sobre el bus
      sim.tramas.forEach(function (tr) {
        var u = (sim.reloj - tr.t) / sim.VUELO; if (u < 0 || u > 1) return;
        var q = proyectar(aMapa(sim.enRuta(tr.s)));
        cr.strokeStyle = (tema === "claro" ? "rgba(184,112,42," : "rgba(246,196,138,") + ((1 - u) * 0.7).toFixed(3) + ")";
        cr.lineWidth = 1.2; cr.beginPath(); cr.arc(q[0], q[1], 3 + u * 26, 0, 7); cr.stroke();
      });
      return;
    }
        cr.fillStyle = tema === "claro" ? "rgba(250,247,240,.82)" : "rgba(2,8,36,.62)";
    cr.beginPath();
    if (cr.roundRect) cr.roundRect(reg.x - 14, reg.y - 28, reg.w + 28, 6 * reg.fila + 40, 8); else cr.rect(reg.x - 14, reg.y - 28, reg.w + 28, 6 * reg.fila + 40);
    cr.fill();
    sim.dibujarRegistro(cr, reg);
    sim.dibujarTramas(cr, reg, function (tr) { return proyectar(aMapa(sim.enRuta(tr.s))); });
  }

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = capa.clientWidth; H = capa.clientHeight;
    CW = lienzo.clientWidth; CH = lienzo.clientHeight;
    IX = camara.offsetLeft; IY = camara.offsetTop;        // margen del mapa respecto de la portada (negativo)
    cam.ox = CW * 0.6; cam.oy = CH * 0.7;                 // = transform-origin de .camara (60 % 70 %)
    lienzo.width = Math.round(CW * dpr); lienzo.height = Math.round(CH * dpr);
    capa.width = Math.round(W * dpr); capa.height = Math.round(H * dpr);
    maquetar(); pintarFondo(); desplazar();
  }
  relieve.onload = function () { if (W) { pintarFondo(); paso(0); } };
  window.FlotaCiclo(lienzo, medir, paso, con3d ? null : desplazar);
  }
  if (con3d) window.iniciarFlotaMapa = iniciar; else iniciar();
})();
