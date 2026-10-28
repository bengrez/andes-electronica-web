/* Portada, vista 3D: la cámara baja de altura con el scroll.
   Arriba de todo se ve el mapa desde el cielo; al bajar por la página la portada queda fija y la cámara desciende de
   forma determinista (cada posición del scroll es siempre la misma pose) hasta quedar sobre el valle, mirando la
   cordillera, con el camino subiendo hacia el fondo y los buses con sus focos.
   Dos temas (atributo data-tema de <html>): oscuro, de noche con estrellas; claro, de día, con el sol todavía detrás
   de la cordillera. El logo empieza grande (LOGO_INICIO) y se achica mientras la cámara baja hasta LOGO_FIN (variable CSS --logo).
   Textos (.heroe): arriba, la empresa; desde la mitad del descenso, SACEL (--sacel); con la cámara quieta, sus 4 pasos
   (--datos). WebGL y las texturas se piden después de pintar la página, para no demorar el texto.
   WebGL 1 escrito a mano, sin librerías. Datos: datos/h25.js (ruta, alturas del camino y cuadro 3D),
   img/alturas-3d.png (altura = R·256 + G, en m) e img/relieve-3d-{noche,dia}.webp (relieve sombreado de cada tema).
   Si no hay WebGL o las imágenes no se pueden leer, se usa la vista 2D (flota-mapa.js). */
(function () {
  "use strict";
  var D = window.H25, lienzo = document.getElementById("flota3d"), capa = document.getElementById("flota-reg");
  var recorrido = document.querySelector(".recorrido");
  if (!D || !window.FlotaSim || !lienzo || !capa) return;
  var heroe = document.querySelector(".heroe");
  var SACEL_ENTRA = [0.35, 0.65];               // tramo del descenso en que el texto pasa de la empresa a SACEL
  document.documentElement.classList.add("con-mapa");   // con JS, los textos se turnan (base.css)
  function despues(fn) {                        // tras pintar: con la página cargada y el navegador libre
    function ya() { (window.requestIdleCallback || function (f) { setTimeout(f, 1); })(fn, { timeout: 600 }); }
    if (document.readyState === "complete") ya(); else window.addEventListener("load", ya, { once: true });
  }
  despues(empezar);
  function empezar() {

  var ACELERACION_TIEMPO = 10;                  // el reloj corre 10 veces más rápido que el real
  var EXAG = 1.35;                              // exageración vertical del relieve
  var FOV = 38;                                 // grados, campo vertical
  var FRACCION_DESCENSO = 0.5;                  // la cámara baja en la primera mitad del recorrido; la segunda queda quieta
                                                // (reservada para la animación de los datos: window.FlotaPortada.datos)
  var LOGO_INICIO = 4, LOGO_FIN = 1.7;          // tamaño del logo arriba de todo y al final del descenso (veces 2,4 rem)
  var SOL = { azimut: 75, altura: 0.6 };          // grados: hacia el este-noreste, apenas bajo los filos vistos desde el valle

  // colores por tema (0–1)
  var TEMAS = {
    // lavado: cuánto se aclara el relieve hacia el papel, para que el camino y los buses manden
    oscuro: { niebla: [0.008, 0.016, 0.075], brillo: 1.1, lavado: 0.45, papel: [0.008, 0.016, 0.065], borde: [0.004, 0.012, 0.06],
              calzada: [0.15, 0.18, 0.34], linea: [0.96, 0.77, 0.54], panel: "rgba(1,4,20,.7)", focos: true,
              cielo: ["#000004", "#01030f", "#040b2e"] },
    claro:  { niebla: [0.86, 0.9, 0.94], brillo: 1.04, lavado: 0.55, papel: [0.95, 0.945, 0.92], borde: [0.08, 0.09, 0.14],
              calzada: [0.2, 0.22, 0.29], linea: [0.97, 0.8, 0.5], panel: "rgba(250,247,240,.86)", focos: false,
              cielo: ["#8db8e0", "#cfe0ee", "#f4e6cc"] }
  };
  function temaActual() { return document.documentElement.getAttribute("data-tema") === "claro" ? "claro" : "oscuro"; }
  var tema = temaActual(), TM = TEMAS[tema];

  // ─── poses de la cámara: [p, ojo, objetivo] en metros (x este, y altura, z sur) ───
  var POSES = [
    [0.00, [10000, 36000, 9600], [10000, 0, 9500]],      // desde el cielo: el mapa, con el camino a la derecha del texto
    [0.45, [7000, 15000, 30000], [15500, 0, 9500]],      // bajando por el sur, ya en diagonal
    [1.00, [-2500, 3300, 21500], [19000, 1200, 4000]]    // sobre el valle, mirando la cordillera hacia el noreste
  ];

  var fallado = false;
  function fallar() {
    if (fallado) return; fallado = true;
    document.documentElement.classList.add("sin-3d");
    document.documentElement.style.setProperty("--logo", String(LOGO_FIN));
    if (window.iniciarFlotaMapa) window.iniciarFlotaMapa();
  }

  var gl = lienzo.getContext("webgl", { antialias: true, premultipliedAlpha: true }) ||
           lienzo.getContext("experimental-webgl");
  if (!gl) { fallar(); return; }
  var cr = capa.getContext("2d");
  var sim = window.FlotaSim(D, {
    escala: ACELERACION_TIEMPO, periodo: 2.6, vuelo: 3.2, ventana: 80,
    descanso: [10 * 60 / ACELERACION_TIEMPO, 25 * 60 / ACELERACION_TIEMPO],
    parada: [2 * 60 / ACELERACION_TIEMPO, 5 * 60 / ACELERACION_TIEMPO]
  });
  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ─── matrices (orden de columnas, como las espera WebGL) ───
  function perspectiva(fovy, asp, n, f) {
    var t = 1 / Math.tan(fovy / 2), nf = 1 / (n - f);
    return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0];
  }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cruz(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norma(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function punto(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function mirar(ojo, obj, arriba) {
    var z = norma(sub(ojo, obj)), x = norma(cruz(arriba, z)), y = cruz(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -punto(x, ojo), -punto(y, ojo), -punto(z, ojo), 1];
  }
  function mult(a, b) {
    var r = new Array(16);
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
      r[j * 4 + i] = a[i] * b[j * 4] + a[4 + i] * b[j * 4 + 1] + a[8 + i] * b[j * 4 + 2] + a[12 + i] * b[j * 4 + 3];
    }
    return r;
  }

  // ─── sombreadores ───
  function programa(vs, fs) {
    function sh(tipo, src) {
      var s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  var NIEBLA = "uniform vec3 uOjo; uniform vec2 uNiebla; uniform vec3 cNiebla;";
  var pTerreno, pCamino, pBus;
  try {
    pTerreno = programa(
      "attribute vec3 aPos; attribute vec2 aUV; uniform mat4 uMVP; varying vec2 vUV; varying vec3 vPos;" +
      "void main(){ vUV = aUV; vPos = aPos; gl_Position = uMVP * vec4(aPos, 1.0); }",
      "precision mediump float; uniform sampler2D uTex; varying vec2 vUV; varying vec3 vPos; " + NIEBLA +
      "uniform float uBrillo, uLavado; uniform vec3 uPapel; void main(){ vec3 c = mix(texture2D(uTex, vUV).rgb * uBrillo, uPapel, uLavado);" +
      " float f = smoothstep(uNiebla.x, uNiebla.y, distance(vPos, uOjo));" +
      " float b = smoothstep(0.0, 0.07, vUV.x) * smoothstep(0.0, 0.07, vUV.y) * smoothstep(0.0, 0.07, 1.0 - vUV.x) * smoothstep(0.0, 0.07, 1.0 - vUV.y);" +
      " float a = b * (1.0 - 0.75 * f); c = mix(c, cNiebla, f * 0.7);" +
      " gl_FragColor = vec4(c * a, a); }");
    pCamino = programa(
      "attribute vec3 aPos; attribute vec2 aLS; uniform mat4 uMVP; varying vec2 vLS; varying vec3 vPos;" +
      "void main(){ vLS = aLS; vPos = aPos; gl_Position = uMVP * vec4(aPos, 1.0); }",
      "precision mediump float; varying vec2 vLS; varying vec3 vPos; uniform float uRaya; uniform vec3 uBorde, uCalzada, uLinea; " + NIEBLA +
      "void main(){ float l = abs(vLS.x); vec3 c = l > 0.62 ? uBorde : uCalzada;" +
      " if (l < 0.13 && fract(vLS.y / uRaya) < 0.45) c = uLinea;" +
      " float f = smoothstep(uNiebla.x, uNiebla.y, distance(vPos, uOjo)); c = mix(c, cNiebla, f * 0.7);" +
      " float a = 1.0 - 0.75 * f; gl_FragColor = vec4(c * a, a); }");
    pBus = programa(
      "attribute vec3 aPos; attribute vec3 aCol; uniform mat4 uMVP; varying vec3 vCol;" +
      "void main(){ vCol = aCol; gl_Position = uMVP * vec4(aPos, 1.0); }",
      "precision mediump float; varying vec3 vCol; void main(){ gl_FragColor = vec4(vCol, 1.0); }");
  } catch (e) { fallar(); return; }

  function atributo(p, nombre, buf, n, paso, desde) {
    var loc = gl.getAttribLocation(p, nombre);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, n, gl.FLOAT, false, paso * 4, desde * 4);
    return loc;
  }

  // ─── carga del relieve ───
  var T = D.tres_d, nVert = T.nx * T.nz, alturas = null;
  var bufTerreno = gl.createBuffer(), bufIdx = gl.createBuffer(), bufCamino = gl.createBuffer(), bufBus = gl.createBuffer();
  var nIdx = 0, texturas = {}, listo = 0;
  function cargar(src, alListo) {
    var im = new Image(); im.onload = function () { alListo(im); }; im.onerror = fallar; im.src = src; return im;
  }
  function alturaEn(x, z) {                        // m, bilineal sobre la rejilla 3D
    var u = (x - T.x0) / T.paso, v = (z - T.z0) / T.paso;
    var i = Math.max(0, Math.min(T.nx - 2, Math.floor(u))), j = Math.max(0, Math.min(T.nz - 2, Math.floor(v)));
    var fu = Math.min(1, Math.max(0, u - i)), fv = Math.min(1, Math.max(0, v - j)), a = alturas;
    return (a[j * T.nx + i] * (1 - fu) + a[j * T.nx + i + 1] * fu) * (1 - fv) + (a[(j + 1) * T.nx + i] * (1 - fu) + a[(j + 1) * T.nx + i + 1] * fu) * fv;
  }
  cargar(lienzo.getAttribute("data-alturas"), function (im) {
    var c = document.createElement("canvas"); c.width = T.nx; c.height = T.nz;
    var x2 = c.getContext("2d"); x2.drawImage(im, 0, 0);
    var px;
    try { px = x2.getImageData(0, 0, T.nx, T.nz).data; } catch (e) { fallar(); return; }   // file://: lienzo contaminado
    alturas = new Float32Array(nVert);
    var v = new Float32Array(nVert * 5);
    for (var j = 0; j < T.nz; j++) for (var i = 0; i < T.nx; i++) {
      var k = j * T.nx + i, e = px[k * 4] * 256 + px[k * 4 + 1];
      alturas[k] = e;
      v.set([T.x0 + i * T.paso, e * EXAG, T.z0 + j * T.paso, i / (T.nx - 1), j / (T.nz - 1)], k * 5);
    }
    var idx = new Uint16Array((T.nx - 1) * (T.nz - 1) * 6), n = 0;
    for (j = 0; j < T.nz - 1; j++) for (i = 0; i < T.nx - 1; i++) {
      var a = j * T.nx + i, b = a + 1, c2 = a + T.nx, d = c2 + 1;
      idx.set([a, c2, b, b, c2, d], n); n += 6;
    }
    nIdx = n;
    gl.bindBuffer(gl.ARRAY_BUFFER, bufTerreno); gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufIdx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    if (++listo === 2) iniciar();
  });
  // la textura de cada tema se carga sólo cuando se usa
  function textura(nombre, alListo) {
    if (texturas[nombre]) { if (texturas[nombre].lista) alListo(); return; }
    var tx = texturas[nombre] = { gl: gl.createTexture(), lista: false };
    cargar(lienzo.getAttribute("data-relieve-" + nombre), function (im) {
      gl.bindTexture(gl.TEXTURE_2D, tx.gl);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im); } catch (e) { fallar(); return; }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      tx.lista = true; alListo();
    });
  }
  textura(tema, function () { if (++listo === 2) iniciar(); });

  // ─── cámara determinista ───
  var W = 0, H = 0, dpr = 1, ojo = [0, 0, 0], VP = null, pAct = 0, pCam = 0, pDatos = 0;
  window.FlotaPortada = { descenso: 0, datos: 0 };
  function suave(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function pose(p) {
    for (var k = 1; k < POSES.length && POSES[k][0] < p; k++);
    k = Math.min(k, POSES.length - 1);
    var A = POSES[k - 1], B = POSES[k], t = suave(Math.max(0, Math.min(1, (p - A[0]) / (B[0] - A[0]))));
    var o = lerp(A[1], B[1], t), m = lerp(A[2], B[2], t);
    // al principio se mira hacia abajo con el norte arriba; después, con el cielo arriba
    var w = suave(Math.min(1, p / 0.5)), arriba = norma([0, w, -(1 - w)]);
    return { ojo: o, obj: m, arriba: arriba };
  }
  function progreso() {
    if (quieto || !recorrido) return 1;
    var r = recorrido.getBoundingClientRect(), largo = r.height - window.innerHeight;
    return largo > 0 ? Math.max(0, Math.min(1, -r.top / largo)) : 0;
  }
  function camara(p) {
    var q = pose(p);
    ojo = q.ojo;
    var dist = Math.hypot(q.ojo[0] - q.obj[0], q.ojo[1] - q.obj[1], q.ojo[2] - q.obj[2]);
    VP = mult(perspectiva(FOV * Math.PI / 180, W / H, Math.max(30, dist * 0.004), dist * 6), mirar(q.ojo, q.obj, q.arriba));
    return dist;
  }
  // punto del mundo → px de la portada (null si queda detrás de la cámara)
  function proyectar(x, y, z) {
    var m = VP, cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13];
    var cw = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (cw <= 0) return null;
    return [(cx / cw * 0.5 + 0.5) * W, (1 - (cy / cw * 0.5 + 0.5)) * H];
  }

  // ─── geometría que cambia con la cámara: el camino (ancho casi constante en pantalla) y los buses ───
  var R = D.ruta, ER = D.elev_ruta, acumR = [0];
  for (var i = 1; i < R.length; i++) acumR.push(acumR[i - 1] + Math.hypot(R[i][0] - R[i - 1][0], R[i][1] - R[i - 1][1]));
  function tamPantalla(x, y, z, px) {            // metros que miden px píxeles a esa distancia
    var d = Math.hypot(x - ojo[0], y - ojo[1], z - ojo[2]);
    return d * 2 * Math.tan(FOV * Math.PI / 360) / H * px;
  }
  function elevBase(x, z, e) { return Math.max(e, alturaEn(x, z)) * EXAG; }
  function geometriaCamino() {
    var v = new Float32Array(R.length * 2 * 5);
    for (var k = 0; k < R.length; k++) {
      var a = R[Math.max(0, k - 1)], b = R[Math.min(R.length - 1, k + 1)];
      var dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
      var nx = -dz / l, nz = dx / l, x = R[k][0], z = R[k][1];
      var y0 = elevBase(x, z, ER[k]), w = tamPantalla(x, y0, z, tema === "claro" ? 5.6 : 5), y = y0 + w * 1.4 + 8;
      v.set([x + nx * w, y, z + nz * w, 1, acumR[k], x - nx * w, y, z - nz * w, -1, acumR[k]], k * 10);
    }
    return v;
  }
  // de noche los buses son marfil; de día, techo blanco con costados azul Andes, para que resalten sobre el relieve lavado
  var COLORES_BUS = {
    oscuro: { techo: [0.94, 0.9, 0.84], lado: [0.72, 0.68, 0.6], frente: [0.08, 0.13, 0.31], atras: [0.5, 0.45, 0.38], franja: [0.82, 0.54, 0.24] },
    claro:  { techo: [0.99, 0.985, 0.97], lado: [0.0, 0.063, 0.31], frente: [0.0, 0.04, 0.2], atras: [0.0, 0.05, 0.25], franja: [0.72, 0.44, 0.16] }
  };
  function caja(out, c, d, L, A, Al, col) {     // c: centro de la base; d: dirección (x, z)
    var r = [-d[1], d[0]], hl = L / 2, ha = A / 2;
    function p(u, s, h) { return [c[0] + d[0] * u + r[0] * s, c[1] + h, c[2] + d[1] * u + r[1] * s]; }
    var v = [p(-hl, -ha, 0), p(hl, -ha, 0), p(hl, ha, 0), p(-hl, ha, 0), p(-hl, -ha, Al), p(hl, -ha, Al), p(hl, ha, Al), p(-hl, ha, Al)];
    [[4, 5, 6, 7, col.techo], [1, 2, 6, 5, col.frente], [0, 4, 7, 3, col.atras], [0, 1, 5, 4, col.lado], [3, 7, 6, 2, col.lado]].forEach(function (f) {
      [f[0], f[1], f[2], f[0], f[2], f[3]].forEach(function (q) { out.push(v[q][0], v[q][1], v[q][2], f[4][0], f[4][1], f[4][2]); });
    });
  }
  var focos = [];
  function geometriaBuses() {
    var out = []; focos = [];
    sim.buses.forEach(function (b) {
      var s = sim.posicion(b), q = sim.enRuta(s), x = q[0], z = q[1];
      var y0 = elevBase(x, z, sim.altitud(s));
      var COL = COLORES_BUS[tema];
      var L = Math.max(14, tamPantalla(x, y0, z, tema === "claro" ? 18 : 15)), a = sim.rumboBus(b), d = [Math.cos(a), Math.sin(a)];
      var base = [x, y0 + tamPantalla(x, y0, z, 4.2) * 1.2 + 6, z];
      caja(out, base, d, L, L * 0.4, L * 0.34, COL);
      caja(out, [base[0], base[1] + L * 0.34, base[2]], d, L * 0.6, L * 0.14, L * 0.02, { techo: COL.franja, frente: COL.franja, atras: COL.franja, lado: COL.franja });
      focos.push({ b: b, frente: [x + d[0] * L * 0.55, base[1] + L * 0.12, z + d[1] * L * 0.55], centro: [x, base[1] + L * 0.2, z] });
    });
    return new Float32Array(out);
  }

  // ─── dibujo ───
  // ─── cielo (detrás del terreno): estrellas de noche; de día, el sol todavía detrás de la cordillera ───
  var cielo = document.getElementById("cielo"), cc = cielo && cielo.getContext("2d"), estrellas = [];
  function pintarCielo() {
    if (!cc) return;
    cc.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = cc.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, TM.cielo[0]); g.addColorStop(0.55, TM.cielo[1]); g.addColorStop(1, TM.cielo[2]);
    cc.fillStyle = g; cc.fillRect(0, 0, W, H);
    if (tema === "oscuro") {
      estrellas.forEach(function (e) { cc.fillStyle = "rgba(242,237,227," + e[3] + ")"; cc.fillRect(e[0] * W, e[1] * H, e[2], e[2]); });
    } else {
      var az = SOL.azimut * Math.PI / 180, al = SOL.altura * Math.PI / 180, d = 200000;
      var s = proyectar(ojo[0] + Math.sin(az) * d, ojo[1] + Math.tan(al) * d, ojo[2] - Math.cos(az) * d);
      if (s) {
        var r = Math.max(W, H) * 0.55, h = cc.createRadialGradient(s[0], s[1], 0, s[0], s[1], r);
        h.addColorStop(0, "rgba(255,246,222,1)"); h.addColorStop(0.06, "rgba(255,232,186,.95)");
        h.addColorStop(0.25, "rgba(252,214,160,.45)"); h.addColorStop(1, "rgba(252,214,160,0)");
        cc.fillStyle = h; cc.fillRect(0, 0, W, H);
      }
    }
  }
  (function () {   // estrellas fijas, con semilla
    var s = 7;
    function az() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
    for (var k = 0; k < 220; k++) estrellas.push([az(), az() * 0.8, az() < 0.12 ? 1.6 : 1, (0.18 + az() * 0.6).toFixed(2)]);
  })();
  function texListo() { return texturas[tema] && texturas[tema].lista ? tema : (tema === "claro" ? "oscuro" : "claro"); }

  function dibujar() {
    pCam = Math.min(1, pAct / FRACCION_DESCENSO);
    pDatos = Math.max(0, (pAct - FRACCION_DESCENSO) / (1 - FRACCION_DESCENSO));
    window.FlotaPortada.descenso = pCam; window.FlotaPortada.datos = pDatos;
    var dist = camara(pCam);
    pintarCielo();
    document.documentElement.style.setProperty("--logo", (LOGO_INICIO - (LOGO_INICIO - LOGO_FIN) * suave(pCam)).toFixed(3));
    textos();
    gl.viewport(0, 0, lienzo.width, lienzo.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    var niebla = [dist * 1.15, dist * 3.4];
    // terreno
    gl.useProgram(pTerreno);
    atributo(pTerreno, "aPos", bufTerreno, 3, 5, 0); atributo(pTerreno, "aUV", bufTerreno, 2, 5, 3);
    gl.uniformMatrix4fv(gl.getUniformLocation(pTerreno, "uMVP"), false, VP);
    gl.uniform3fv(gl.getUniformLocation(pTerreno, "uOjo"), ojo);
    gl.uniform2fv(gl.getUniformLocation(pTerreno, "uNiebla"), niebla);
    gl.uniform3fv(gl.getUniformLocation(pTerreno, "cNiebla"), TM.niebla);
    gl.uniform1f(gl.getUniformLocation(pTerreno, "uBrillo"), TM.brillo);
    gl.uniform1f(gl.getUniformLocation(pTerreno, "uLavado"), TM.lavado * suave(pCam));   // el lavado llega con el descenso
    gl.uniform3fv(gl.getUniformLocation(pTerreno, "uPapel"), TM.papel);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texturas[texListo()].gl);
    gl.uniform1i(gl.getUniformLocation(pTerreno, "uTex"), 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufIdx);
    gl.drawElements(gl.TRIANGLES, nIdx, gl.UNSIGNED_SHORT, 0);
    // camino
    gl.useProgram(pCamino);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufCamino); gl.bufferData(gl.ARRAY_BUFFER, geometriaCamino(), gl.DYNAMIC_DRAW);
    atributo(pCamino, "aPos", bufCamino, 3, 5, 0); atributo(pCamino, "aLS", bufCamino, 2, 5, 3);
    gl.uniformMatrix4fv(gl.getUniformLocation(pCamino, "uMVP"), false, VP);
    gl.uniform3fv(gl.getUniformLocation(pCamino, "uOjo"), ojo);
    gl.uniform2fv(gl.getUniformLocation(pCamino, "uNiebla"), niebla);
    gl.uniform1f(gl.getUniformLocation(pCamino, "uRaya"), Math.max(60, dist * 0.0035));
    gl.uniform3fv(gl.getUniformLocation(pCamino, "cNiebla"), TM.niebla);
    gl.uniform3fv(gl.getUniformLocation(pCamino, "uBorde"), TM.borde);
    gl.uniform3fv(gl.getUniformLocation(pCamino, "uCalzada"), TM.calzada);
    gl.uniform3fv(gl.getUniformLocation(pCamino, "uLinea"), TM.linea);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, R.length * 2);
    // buses
    var vb = geometriaBuses();
    gl.useProgram(pBus);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufBus); gl.bufferData(gl.ARRAY_BUFFER, vb, gl.DYNAMIC_DRAW);
    atributo(pBus, "aPos", bufBus, 3, 6, 0); atributo(pBus, "aCol", bufBus, 3, 6, 3);
    gl.uniformMatrix4fv(gl.getUniformLocation(pBus, "uMVP"), false, VP);
    gl.drawArrays(gl.TRIANGLES, 0, vb.length / 6);

    // capa plana: focos, registro y tramas
    cr.setTransform(1, 0, 0, 1, 0, 0); cr.clearRect(0, 0, capa.width, capa.height); cr.setTransform(dpr, 0, 0, dpr, 0, 0);
    cr.globalCompositeOperation = "lighter";
    focos.forEach(function (f) {
      var q = proyectar(f.frente[0], f.frente[1], f.frente[2]); if (!q) return;
      var r = TM.focos && f.b.v > 0.3 ? 26 : 0, alerta = sim.exceso(f.b);
      if (r) { var g = cr.createRadialGradient(q[0], q[1], 0, q[0], q[1], r); g.addColorStop(0, "rgba(255,230,190,.55)"); g.addColorStop(1, "rgba(255,230,190,0)"); cr.fillStyle = g; cr.fillRect(q[0] - r, q[1] - r, 2 * r, 2 * r); }
      if (alerta) { var c = proyectar(f.centro[0], f.centro[1], f.centro[2]); if (c) { cr.fillStyle = TM.focos ? "rgba(255,221,180,.22)" : "rgba(196,110,30,.22)"; cr.beginPath(); cr.arc(c[0], c[1], 14, 0, 7); cr.fill(); } }
    });
    cr.globalCompositeOperation = "source-over";
    pulsos();
  }

  // ─── tramas: un círculo que late y sube desde el bus hasta un tercio de la altura de la portada (internet, la nube) ───
  var PULSO = {
    oscuro: { normal: "246,196,138", alerta: "255,238,214" },
    claro:  { normal: "184,112,42", alerta: "120,56,8" }
  };
  function pulsos() {
    var P = PULSO[tema], techo = H / 3;
    sim.tramas.forEach(function (tr) {
      var u = (sim.reloj - tr.t) / sim.VUELO; if (u < 0 || u > 1) return;
      var q = sim.enRuta(tr.s), y0 = elevBase(q[0], q[1], sim.altitud(tr.s)) + tamPantalla(q[0], 0, q[1], 6);
      var base = proyectar(q[0], y0, q[1]); if (!base) return;
      var meta = Math.min(techo, base[1] - 60);
      var e = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);               // sube con suavidad
      var x = base[0], y = base[1] + (meta - base[1]) * e;
      var a = Math.min(1, u / 0.1) * Math.min(1, (1 - u) / 0.25) * (tr.estado === 2 ? 1 : 0.85);
      var late = Math.sin(u * Math.PI * 6), r = 3.2 + 1.4 * late * late;   // late tres veces en el camino
      var col = tr.estado === 2 ? P.alerta : P.normal;
      var g = cr.createRadialGradient(x, y, 0, x, y, r * 4);
      g.addColorStop(0, "rgba(" + col + "," + (a * 0.4).toFixed(3) + ")"); g.addColorStop(1, "rgba(" + col + ",0)");
      cr.fillStyle = g; cr.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
      cr.fillStyle = "rgba(" + col + "," + a.toFixed(3) + ")";
      cr.beginPath(); cr.arc(x, y, r, 0, 7); cr.fill();
    });
  }

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, W < 760 ? 1.5 : 2);
    W = lienzo.clientWidth; H = lienzo.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, W < 760 ? 1.5 : 2);
    lienzo.width = Math.round(W * dpr); lienzo.height = Math.round(H * dpr);
    capa.width = Math.round(W * dpr); capa.height = Math.round(H * dpr);
    if (cielo) { cielo.width = Math.round(W * dpr); cielo.height = Math.round(H * dpr); }
  }
  function paso(dt) { if (dt) sim.avanzar(dt); if (listo === 2 && alturas) dibujar(); }

  function aplicarTema() {
    tema = temaActual(); TM = TEMAS[tema]; sim.tema(tema);
    textura(tema, function () { paso(0); });
    paso(0);
  }
  function iniciar() {
    document.documentElement.classList.add("con-3d");
    sim.tema(tema);
    new MutationObserver(aplicarTema).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
    window.FlotaCiclo(lienzo, medir, paso, function () { pAct = progreso(); textos(); });
    pAct = progreso(); paso(0); textos();
  }
  // --sacel y --datos para .heroe; el enlace de la capa que no se ve sale del orden del tabulador
  var capaVisible = null;
  function textos() {
    if (!heroe) return;
    var pc = Math.min(1, pAct / FRACCION_DESCENSO);
    var s = quieto ? 1 : suave(Math.max(0, Math.min(1, (pc - SACEL_ENTRA[0]) / (SACEL_ENTRA[1] - SACEL_ENTRA[0]))));
    var d = quieto ? 1 : suave(Math.max(0, Math.min(1, (pAct - FRACCION_DESCENSO) / ((1 - FRACCION_DESCENSO) / 3))));
    heroe.style.setProperty("--sacel", s.toFixed(3));
    heroe.style.setProperty("--datos", d.toFixed(3));
    var v = quieto || s > 0.5 ? "sacel" : "empresa";
    if (v === capaVisible) return; capaVisible = v;
    heroe.querySelectorAll(".capa-sacel a").forEach(function (a) { if (v === "sacel") a.removeAttribute("tabindex"); else a.setAttribute("tabindex", "-1"); });
  }
  }
})();
