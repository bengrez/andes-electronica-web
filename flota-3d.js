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
  var VELOCIDAD_BUSES = 0.5;                   // los buses avanzan a la mitad (Benjamin, 2026-10-30); esperas y tramas no cambian
  var EXAG = 1.35;                              // exageración vertical del relieve
  var FOV = 38;                                 // grados, campo vertical
  var FRACCION_DESCENSO = 0.5;                  // la cámara baja en la primera mitad del recorrido; la segunda queda quieta
                                                // (reservada para la animación de los datos: window.FlotaPortada.datos)
  var LOGO_INICIO = 8, LOGO_FIN = 1.7;          // tamaño del logo arriba de todo y al final del descenso (veces 2,4 rem);
                                                // en el celular parte en LOGO_INICIO_MOVIL
  var LOGO_INICIO_MOVIL = 4;
  var logoInicio = LOGO_INICIO;                 // el que cabe: en pantallas bajas, menor, para que el texto no se salga (medir)
  var opacMapa = 1, opacVida = 1, nieblaAct = [1, 2];
  var MAPA_FINAL = 0.4;                         // cuánto se transparenta el relieve al final del scroll
  var RUTA_TENUE = 0.45;                        // opacidad de la ruta y los buses arriba de todo
  var tenue = 1;
  var ESCALA = 0.5;                             // camino y buses en pantalla respecto del 29-oct (Benjamin, 2026-10-30: el doble de chicos)
  // la nube de SACEL que recibe las tramas (antes un switch): un punto del valle al norte de la ruta, dibujada unos px más arriba con su mástil
  var SWITCH = [13000, 5200];                   // x, z en metros del cuadro
  var SOL = { azimut: 75, altura: 0.6 };          // grados: hacia el este-noreste, apenas bajo los filos vistos desde el valle

  // colores por tema (0–1)
  var TEMAS = {
    // lavado: cuánto se aclara el relieve hacia el papel, para que el camino y los buses manden
    oscuro: { niebla: [0.008, 0.016, 0.075], brillo: 1.1, lavado: 0.45, verde: 0.3, bruma: [0.05, 0.07, 0.14], papel: [0.008, 0.016, 0.065], velo: true, borde: [0.004, 0.012, 0.06],
              calzada: [0.15, 0.18, 0.34], linea: [0.96, 0.77, 0.54], panel: "rgba(1,4,20,.7)", focos: true,
              cielo: ["#000004", "#01030f", "#01030f"] },  // sin banda azul abajo: el velo deja ver el cielo (2026-10-30)
    claro:  { niebla: [0.922, 0.933, 0.925], brillo: 1.04, lavado: 0.36, verde: 0.6, bruma: [0.70, 0.76, 0.82], papel: [0.922, 0.933, 0.925], velo: true, borde: [0.08, 0.09, 0.14],
              calzada: [0.2, 0.22, 0.29], linea: [0.97, 0.8, 0.5], panel: "rgba(244,246,245,.86)", focos: false,
              cielo: ["#ebeeec", "#ebeeec", "#e7ebe9"] }
  };
  function temaActual() { return document.documentElement.getAttribute("data-tema") === "claro" ? "claro" : "oscuro"; }
  var tema = temaActual(), TM = TEMAS[tema];

  // ─── poses de la cámara: [p, ojo, objetivo] en metros (x este, y altura, z sur) ───
  // Siempre se mira al centro de la H-25 (Benjamin, 2026-10-29: la animación centrada en la ruta y más alejada); el
  // corrimiento de lente de camara() deja ese centro en el medio del espacio del mapa, a la derecha del texto.
  var CENTRO = [16700, 1800, 9500];                    // centro del cuadro de la ruta, a media altura (exagerada)
  var ALEJAR = 1.25;                                   // zoom out respecto de las poses del 28-oct
  function desde(v) { return [CENTRO[0] + v[0] * ALEJAR, CENTRO[1] + v[1] * ALEJAR, CENTRO[2] + v[2] * ALEJAR]; }
  var POSES = [
    [0.00, desde([-8500, 15000, 20500]), CENTRO],       // inclinada desde el sur (Benjamin, 2026-10-29: el tilt inicial)
    [1.00, desde([-19500, 17000, 19500]), CENTRO]       // en alto sobre el valle, más terreno a la vista, hacia el noreste
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
    escala: ACELERACION_TIEMPO * VELOCIDAD_BUSES, periodo: 9, vuelo: 3.2,   // una trama cada 9 s por bus (2026-10-30; antes 2,6) ventana: 80,
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
  // Velo del tema claro (Benjamin, 2026-10-29: sin líneas rectas entre el papel y el mapa). El relieve se funde con el
  // papel hacia la columna de texto y hacia arriba, pero las crestas aguantan más que los valles: el borde sigue el
  // contorno de la cordillera y cambia con la inclinación de la cámara. uVelo = (x del papel sólido, ancho del
  // fundido, alto del fundido superior, alto del lienzo) en px del lienzo; uVeloAlt = altura mínima y máxima.
  var VELO = "uniform vec4 uVelo; uniform vec2 uVeloAlt; uniform float uVeloOn, uVeloAsp;" +
    "float azar(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }" +
    "float ruido(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);" +
    " return mix(mix(azar(i), azar(i + vec2(1.0, 0.0)), f.x), mix(azar(i + vec2(0.0, 1.0)), azar(i + vec2(1.0, 1.0)), f.x), f.y); }" +
    "float velo(float y, vec2 xz, float extra){ if (uVeloOn < 0.5) return 1.0;" +
    " float h = clamp((y - uVeloAlt.x) / (uVeloAlt.y - uVeloAlt.x), 0.0, 1.0);" +
    " float k = pow(h, 0.7) * 0.7 + (ruido(xz / 2600.0) * 0.6 + ruido(xz / 800.0) * 0.4) * 0.5 - 0.6;" +
    " float bajo = 1.0 - gl_FragCoord.y / uVelo.w;" +
    // abajo, bajo los textos, el mapa avanza hacia la izquierda para que se vea el inicio de la H-25
    " float tx = (gl_FragCoord.x - uVelo.x) / uVelo.y + 0.75 * smoothstep(0.68, 1.0, bajo) + extra, ty = (uVelo.w - gl_FragCoord.y) / uVelo.z + 0.2 + extra;" +
    " float td = (uVelo.w * uVeloAsp - gl_FragCoord.x) / uVelo.z + 0.45, tb = gl_FragCoord.y / uVelo.z + 0.4;" +
    " return smoothstep(0.0, 0.85, tx + k * 1.1) * smoothstep(0.0, 0.85, ty + k * 1.1)" +
    " * smoothstep(0.0, 0.85, td + k * 1.1) * smoothstep(0.0, 0.85, tb + k * 1.1); }";
  var pTerreno, pCamino, pBus;
  try {
    pTerreno = programa(
      "attribute vec3 aPos; attribute vec2 aUV; uniform mat4 uMVP; varying vec2 vUV; varying vec3 vPos;" +
      "void main(){ vUV = aUV; vPos = aPos; gl_Position = uMVP * vec4(aPos, 1.0); }",
      "precision mediump float; uniform sampler2D uTex; varying vec2 vUV; varying vec3 vPos; " + NIEBLA + VELO +
      "uniform float uBrillo, uLavado, uVerde, uOpac; uniform vec3 uPapel, uBruma;" +
      // color más verde y realista (Benjamin, 2026-10-30): la textura aporta el sombreado y la nieve; encima, pisos de
      // vegetación de Chile central según la altura (valle agrícola, bosque esclerófilo, matorral andino, roca),
      // con manchas de ruido para que no se vea como franjas, y bruma azulada con la distancia
      "vec3 pisos(vec3 t){ float h = vPos.y / " + EXAG.toFixed(2) + ", lum = dot(t, vec3(0.299, 0.587, 0.114));" +
      " float n = ruido(vPos.xz / 900.0) * 0.6 + ruido(vPos.xz / 260.0) * 0.4, sombra = clamp(lum / 0.38, 0.25, 1.9);" +
      // laderas en sombra (de umbría, al sur) más verdes; las de solana, más secas y pardas
      " float umbria = smoothstep(1.25, 0.55, sombra);" +
      " vec3 seco = mix(vec3(0.46, 0.44, 0.30), vec3(0.50, 0.45, 0.36), smoothstep(1300.0, 2400.0, h + n * 400.0));" +
      " vec3 verde = mix(vec3(0.34, 0.40, 0.22), vec3(0.27, 0.33, 0.20), smoothstep(650.0, 1100.0, h + n * 150.0));" +
      " vec3 bio = mix(seco, verde, clamp(umbria * 0.8 + (1.0 - smoothstep(900.0, 2200.0, h + n * 500.0)) * 0.5, 0.0, 1.0));" +
      " bio = mix(bio, vec3(0.50, 0.46, 0.42), smoothstep(2300.0, 3000.0, h + n * 400.0));" +
      " bio *= mix(vec3(1.0), vec3(0.9, 1.04, 0.86), smoothstep(0.4, 0.8, n));" +
      " vec3 c = bio * sombra * 1.25; float nieve = smoothstep(0.52, 0.72, lum) * smoothstep(2400.0, 3100.0, h);" +
      " return mix(c, t * 1.04, nieve); }" +
      "void main(){ vec3 t = texture2D(uTex, vUV).rgb; vec3 c = mix(t, pisos(t), uVerde) * uBrillo; c = mix(c, uPapel, uLavado);" +
      " float f = smoothstep(uNiebla.x, uNiebla.y, distance(vPos, uOjo));" +
      " c = mix(c, uBruma, smoothstep(0.0, 1.0, distance(vPos, uOjo) / uNiebla.y) * 0.35 * uVerde);" +
      " float b = smoothstep(0.0, 0.07, vUV.x) * smoothstep(0.0, 0.07, vUV.y) * smoothstep(0.0, 0.07, 1.0 - vUV.x) * smoothstep(0.0, 0.07, 1.0 - vUV.y);" +
      " float a = b * (1.0 - 0.75 * f) * velo(vPos.y, vPos.xz, 0.0) * uOpac; c = mix(c, cNiebla, f * 0.7);" +
      " gl_FragColor = vec4(c * a, a); }");
    pCamino = programa(
      "attribute vec3 aPos; attribute vec2 aLS; uniform mat4 uMVP; varying vec2 vLS; varying vec3 vPos;" +
      "void main(){ vLS = aLS; vPos = aPos; gl_Position = uMVP * vec4(aPos, 1.0); }",
      "precision mediump float; varying vec2 vLS; varying vec3 vPos; uniform float uRaya, uTenue; uniform vec3 uBorde, uCalzada, uLinea; " + NIEBLA + VELO +
      "void main(){ float l = abs(vLS.x); vec3 c = l > 0.62 ? uBorde : uCalzada;" +
      " if (l < 0.13 && fract(vLS.y / uRaya) < 0.45) c = uLinea;" +
      " float f = smoothstep(uNiebla.x, uNiebla.y, distance(vPos, uOjo)); c = mix(c, cNiebla, f * 0.7);" +
      " float a = (1.0 - 0.75 * f) * velo(vPos.y, vPos.xz, 0.15) * uTenue; gl_FragColor = vec4(c * a, a); }");
    pBus = programa(
      "attribute vec3 aPos; attribute vec3 aCol; uniform mat4 uMVP; varying vec3 vCol; varying vec3 vPos;" +
      "void main(){ vCol = aCol; vPos = aPos; gl_Position = uMVP * vec4(aPos, 1.0); }",
      "precision mediump float; varying vec3 vCol; varying vec3 vPos; uniform float uTenue; " + VELO +
      "void main(){ float a = velo(vPos.y, vPos.xz, 0.15) * uTenue; gl_FragColor = vec4(vCol * a, a); }");
  } catch (e) { fallar(); return; }

  function atributo(p, nombre, buf, n, paso, desde) {
    var loc = gl.getAttribLocation(p, nombre);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, n, gl.FLOAT, false, paso * 4, desde * 4);
    return loc;
  }

  // ─── carga del relieve ───
  var T = D.tres_d, nVert = T.nx * T.nz, alturas = null, altMin = Infinity, altMax = -Infinity;
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
      alturas[k] = e; if (e < altMin) altMin = e; if (e > altMax) altMax = e;
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
    // siempre con el cielo arriba: desde el 29-oct ya no hay vista cenital al principio
    return { ojo: o, obj: m, arriba: [0, 1, 0] };
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
    var P = perspectiva(FOV * Math.PI / 180, W / H, Math.max(30, dist * 0.004), dist * 6);
    P[8] = -centroMapa();                          // corrimiento de lente: el objetivo queda en el medio del espacio del mapa
    VP = mult(P, mirar(q.ojo, q.obj, q.arriba));
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
      var y0 = elevBase(x, z, ER[k]), w = tamPantalla(x, y0, z, (tema === "claro" ? 5.6 : 5) * ESCALA), y = y0 + w * 1.4 + 8;
      v.set([x + nx * w, y, z + nz * w, 1, acumR[k], x - nx * w, y, z - nz * w, -1, acumR[k]], k * 10);
    }
    return v;
  }
  // de noche los buses son marfil; de día, techo blanco con costados azul Andes, para que resalten sobre el relieve lavado
  var COLORES_BUS = {
    oscuro: { techo: [0.94, 0.9, 0.84], lado: [0.72, 0.68, 0.6], frente: [0.08, 0.13, 0.31], atras: [0.5, 0.45, 0.38], franja: [0.82, 0.54, 0.24] },
    claro:  { techo: [0.99, 0.985, 0.97], lado: [0.0, 0.063, 0.31], frente: [0.0, 0.04, 0.2], atras: [0.0, 0.05, 0.25], franja: [0.72, 0.44, 0.16] }
  };
  function caja(out, c, B, L, A, Al, col) {     // c: centro de la base; B: ejes del bus {f: adelante, r: costado, n: arriba}
    var f = B.f, r = B.r, n = B.n, hl = L / 2, ha = A / 2;
    function p(u, s, h) { return [c[0] + f[0] * u + r[0] * s + n[0] * h, c[1] + f[1] * u + r[1] * s + n[1] * h, c[2] + f[2] * u + r[2] * s + n[2] * h]; }
    var v = [p(-hl, -ha, 0), p(hl, -ha, 0), p(hl, ha, 0), p(-hl, ha, 0), p(-hl, -ha, Al), p(hl, -ha, Al), p(hl, ha, Al), p(-hl, ha, Al)];
    [[4, 5, 6, 7, col.techo], [1, 2, 6, 5, col.frente], [0, 4, 7, 3, col.atras], [0, 1, 5, 4, col.lado], [3, 7, 6, 2, col.lado]].forEach(function (f) {
      [f[0], f[1], f[2], f[0], f[2], f[3]].forEach(function (q) { out.push(v[q][0], v[q][1], v[q][2], f[4][0], f[4][1], f[4][2]); });
    });
  }
  var focos = [];
  // los buses siguen el terreno como juguetes (Benjamin, 2026-10-30): cabecean con la pendiente, se inclinan hacia
  // afuera en las curvas y rebotan un poco con la velocidad; todo un poco exagerado (JUGUETE)
  var JUGUETE = { cabeceo: 2.6, balanceo: 1.4, rebote: 0.16 };
  function enCamino(s) {                         // punto del camino dibujado a s metros del extremo oeste
    s = Math.max(0, Math.min(sim.LARGO, s));
    var q = sim.enRuta(s); return [q[0], elevBase(q[0], q[1], sim.altitud(s)), q[1]];
  }
  function geometriaBuses() {
    var out = []; focos = [];
    sim.buses.forEach(function (b, i) {
      var s = sim.posicion(b), q = sim.enRuta(s), x = q[0], z = q[1];
      var y0 = elevBase(x, z, sim.altitud(s));
      var COL = COLORES_BUS[tema];
      var L = Math.max(14 * ESCALA, tamPantalla(x, y0, z, (tema === "claro" ? 18 : 15) * ESCALA)), a = sim.rumboBus(b), d = [Math.cos(a), Math.sin(a)];
      // pendiente: alturas del camino delante y detrás, a un largo de bus (al menos 120 m para no temblar)
      var paso = Math.max(120, L) * (b.dir > 0 ? 1 : -1), A = enCamino(s - paso), F = enCamino(s + paso);
      var cab = Math.max(-0.7, Math.min(0.7, Math.atan2(F[1] - A[1], Math.hypot(F[0] - A[0], F[2] - A[2])) * JUGUETE.cabeceo));
      // curva: cuánto gira el rumbo entre detrás y delante; el bus se inclina hacia afuera, más si va rápido
      var giro = Math.atan2(F[2] - z, F[0] - x) - Math.atan2(z - A[2], x - A[0]);
      giro = Math.atan2(Math.sin(giro), Math.cos(giro));
      var rapido = Math.min(1, b.v / 20), bal = Math.max(-0.35, Math.min(0.35, giro * JUGUETE.balanceo * (0.4 + rapido)));
      var t = sim.reloj * 7 + i * 1.7;
      cab += Math.sin(t * 1.3) * 0.05 * rapido;                                 // traqueteo
      var f = norma([d[0] * Math.cos(cab), Math.sin(cab), d[1] * Math.cos(cab)]);
      var r0 = norma(cruz(f, [0, 1, 0])), n0 = cruz(r0, f);
      var cb = Math.cos(bal), sb = Math.sin(bal);
      var B = { f: f, r: [r0[0] * cb + n0[0] * sb, r0[1] * cb + n0[1] * sb, r0[2] * cb + n0[2] * sb],
                     n: [n0[0] * cb - r0[0] * sb, n0[1] * cb - r0[1] * sb, n0[2] * cb - r0[2] * sb] };
      var salto = Math.abs(Math.sin(t)) * JUGUETE.rebote * L * rapido;
      var base = [x, y0 + tamPantalla(x, y0, z, 4.2 * ESCALA) * 1.2 + 6 + salto, z];
      caja(out, base, B, L, L * 0.4, L * 0.34, COL);
      var techo = [base[0] + B.n[0] * L * 0.34, base[1] + B.n[1] * L * 0.34, base[2] + B.n[2] * L * 0.34];
      caja(out, techo, B, L * 0.6, L * 0.14, L * 0.02, { techo: COL.franja, frente: COL.franja, atras: COL.franja, lado: COL.franja });
      focos.push({ b: b, frente: [x + f[0] * L * 0.55, base[1] + f[1] * L * 0.55 + L * 0.12, z + f[2] * L * 0.55], centro: [x, base[1] + L * 0.2, z] });
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

  // velo del tema claro: dónde termina el papel sólido (el mismo --velo-solido de base.css) y cuánto mide el fundido
  function medidasVelo() {
    var rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    var solido = W < 760 ? -1e5 : Math.max(1.25 * rem, (W - 80 * rem) / 2) + 31 * rem;
    // transición más larga (Benjamin, 2026-10-30): el fundido empieza antes y se reparte en 30 rem (antes 18)
    return [solido - 3 * rem, 30 * rem, Math.max(12 * rem, H * 0.4), H];
  }
  function centroMapa() {                        // x del medio del espacio del mapa, en coordenadas de -1 a 1
    if (W < 760) return 0;
    var m = medidasVelo();
    return ((m[0] + W) / 2) / W * 2 - 1;
  }
  function ponerVelo(p) {
    var m = medidasVelo();
    gl.uniform4fv(gl.getUniformLocation(p, "uVelo"), [m[0] * dpr, m[1] * dpr, m[2] * dpr, m[3] * dpr]);
    gl.uniform2fv(gl.getUniformLocation(p, "uVeloAlt"), [altMin * EXAG, altMax * EXAG]);
    gl.uniform1f(gl.getUniformLocation(p, "uVeloOn"), TM.velo && W >= 760 ? 1 : 0);
    gl.uniform1f(gl.getUniformLocation(p, "uVeloAsp"), W / H);
  }
  function veloEn(x, y, e) {                     // el mismo velo, para la capa plana (sin el ruido)
    if (!TM.velo || W < 760) return 1;
    var m = medidasVelo(), h = Math.min(1, Math.max(0, (e - altMin) / (altMax - altMin)));
    var k = Math.pow(h, 0.7) * 0.7 + 0.25 - 0.6;
    function ss(t) { t = Math.min(1, Math.max(0, t / 0.85)); return t * t * (3 - 2 * t); }
    var b = Math.min(1, Math.max(0, (y / H - 0.68) / 0.32)); b = b * b * (3 - 2 * b);
    return ss((x - m[0]) / m[1] + 0.75 * b + 0.15 + k * 1.1) * ss(y / m[2] + 0.35 + k * 1.1)
      * ss((W - x) / m[2] + 0.45 + k * 1.1) * ss((H - y) / m[2] + 0.4 + k * 1.1);
  }

  function dibujar() {
    pCam = Math.min(1, pAct / FRACCION_DESCENSO);
    pDatos = Math.max(0, (pAct - FRACCION_DESCENSO) / (1 - FRACCION_DESCENSO));
    window.FlotaPortada.descenso = pCam; window.FlotaPortada.datos = pDatos;
    var dist = camara(pCam);
    pintarCielo();
    var li = W < 760 ? LOGO_INICIO_MOVIL : logoInicio;
    // el logo termina de achicarse antes de que entren los textos de SACEL, para no toparse con ellos
    document.documentElement.style.setProperty("--logo", (li - (li - LOGO_FIN) * suave(Math.min(1, pCam / 0.55))).toFixed(3));
    textos();
    gl.viewport(0, 0, lienzo.width, lienzo.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    var niebla = [dist * 1.15, dist * 3.4]; nieblaAct = niebla;
    // arriba de todo la ruta y los buses van tenues, para que manden las montañas (Benjamin, 2026-10-30); toman fuerza
    // en el primer tramo del descenso
    tenue = RUTA_TENUE + (1 - RUTA_TENUE) * suave(Math.min(1, pCam / 0.4));
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
    gl.uniform1f(gl.getUniformLocation(pTerreno, "uVerde"), TM.verde);
    // en el tramo quieto el relieve se vuelve translúcido, para que los datos y la ruta manden al final (2026-10-30)
    opacMapa = 1 - MAPA_FINAL * suave(pDatos);
    // la flora y fauna se transparentan con un desfase marcado: empiezan cuando el relieve ya va en el 75 % de su cambio
    opacVida = 1 - MAPA_FINAL * suave(Math.max(0, Math.min(1, (pDatos - 0.75) / 0.25)));
    gl.uniform1f(gl.getUniformLocation(pTerreno, "uOpac"), opacMapa);
    gl.uniform3fv(gl.getUniformLocation(pTerreno, "uBruma"), TM.bruma);
    ponerVelo(pTerreno);
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
    gl.uniform1f(gl.getUniformLocation(pCamino, "uTenue"), tenue);
    ponerVelo(pCamino);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, R.length * 2);
    // buses
    var vb = geometriaBuses();
    gl.useProgram(pBus);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufBus); gl.bufferData(gl.ARRAY_BUFFER, vb, gl.DYNAMIC_DRAW);
    atributo(pBus, "aPos", bufBus, 3, 6, 0); atributo(pBus, "aCol", bufBus, 3, 6, 3);
    gl.uniformMatrix4fv(gl.getUniformLocation(pBus, "uMVP"), false, VP);
    gl.uniform1f(gl.getUniformLocation(pBus, "uTenue"), tenue);
    ponerVelo(pBus);
    gl.drawArrays(gl.TRIANGLES, 0, vb.length / 6);

    // capa plana: focos, registro y tramas
    cr.setTransform(1, 0, 0, 1, 0, 0); cr.clearRect(0, 0, capa.width, capa.height); cr.setTransform(dpr, 0, 0, dpr, 0, 0);
    cr.globalCompositeOperation = "lighter"; cr.globalAlpha = tenue;
    focos.forEach(function (f) {
      var q = proyectar(f.frente[0], f.frente[1], f.frente[2]); if (!q) return;
      var r = TM.focos && f.b.v > 0.3 ? 26 * ESCALA : 0, alerta = sim.exceso(f.b);
      if (r) { var g = cr.createRadialGradient(q[0], q[1], 0, q[0], q[1], r); g.addColorStop(0, "rgba(255,230,190,.55)"); g.addColorStop(1, "rgba(255,230,190,0)"); cr.fillStyle = g; cr.fillRect(q[0] - r, q[1] - r, 2 * r, 2 * r); }
      if (alerta) { var c = proyectar(f.centro[0], f.centro[1], f.centro[2]); if (c) { cr.globalAlpha = tenue * veloEn(c[0], c[1], f.centro[1] / EXAG); cr.fillStyle = TM.focos ? "rgba(255,221,180,.22)" : "rgba(196,110,30,.22)"; cr.beginPath(); cr.arc(c[0], c[1], 14 * ESCALA, 0, 7); cr.fill(); cr.globalAlpha = tenue; } }
    });
    cr.globalAlpha = 1;
    cr.globalCompositeOperation = "source-over";
    vida();
    pulsos();
    condores();
    loros();
  }

  // ─── tramas: cada una es un paquete que viaja en arco desde el bus hasta la nube de SACEL (Benjamin, 2026-10-30),
  // que la registra en su gráfico. Las de alerta, en el color fuerte. ───
  var PULSO = {
    oscuro: { sombra: "rgba(0,0,4,.5)", normal: "246,196,138", alerta: "255,238,214", caja: "rgba(1,4,20,.82)", nube: ["196,204,226", "130,140,170", "40,48,80"], nubeA: 0.85, borde: "246,196,138", texto: "rgba(242,237,227,.7)" },
    claro:  { sombra: "rgba(70,52,22,.22)", normal: "184,112,42", alerta: "120,56,8", caja: "rgba(244,246,245,.92)", nube: ["255,255,255", "232,235,241", "170,176,192"], nubeA: 1, borde: "0,16,79", texto: "rgba(0,16,79,.7)" }
  };
  var puertos = [0, 0, 0, 0, 0, 0], estPuerto = [0, 0, 0, 0, 0, 0];
  var ACEL_TRAMA = 14;                          // e^(14u): a 3/4 del vuelo lleva ~3 % del recorrido; el último
                                                // 5 % cruza la mitad, como un salto a la velocidad de la luz
  // la nube es parte del mundo (Benjamin, 2026-10-30): flota a NUBE.altura sobre el valle, se achica con la distancia
  // y deja su sombra sobre el relieve, corrida en contra del sol
  var NUBE = { ancho: 1600, altura: 2600, sombra: 0.12, cielo: 0 };   // cielo: desde cuánto más arriba baja   // m (exagerados como el relieve); sombra: corrimiento / altura
  function posSwitch() {
    var e = alturaEn(SWITCH[0], SWITCH[1]), y0 = e * EXAG;
    // aparece con el descenso, en su lugar y de la nada: se condensa (Benjamin, 2026-10-30; NUBE.cielo > 0 la haría bajar)
    var vis = suave(Math.max(0, Math.min(1, (pCam - 0.15) / 0.55)));
    var yc = y0 + NUBE.altura + (1 - vis) * NUBE.cielo, c = proyectar(SWITCH[0], yc, SWITCH[1]), suelo = proyectar(SWITCH[0], y0, SWITCH[1]);
    if (!c || !suelo) return null;
    var esc = Math.max(0.6, Math.min(2.6, NUBE.ancho / tamPantalla(SWITCH[0], yc, SWITCH[1], 1) / 38));
    return { suelo: suelo, x: c[0], y: c[1], e: e, vis: vis, esc: esc, alto: yc - y0 };
  }
  function sombraNube(sw, P) {
    // sol cerca del mediodía (Benjamin, 2026-10-30): la sombra cae casi bajo la nube, un poco al sur (en Chile el sol
    // del mediodía está al norte). Son anillos concéntricos tendidos sobre el terreno, punto a punto y con poco
    // desenfoque, así el borde sube y baja con cada loma y la sombra se aclara hacia afuera
    var d = sw.alto * NUBE.sombra, cx = SWITCH[0] + d * 0.25, cz = SWITCH[1] + d, R = NUBE.ancho * 0.7;
    cr.save();
    if ("filter" in cr) cr.filter = "blur(" + (0.8 * sw.esc + (1 - sw.vis) * 8).toFixed(1) + "px)";
    cr.fillStyle = P.sombra;
    for (var anillo = 0; anillo < 4; anillo++) {
      var r = R * (1 - anillo * 0.2);
      cr.globalAlpha = sw.vis * sw.vis * veloEn(sw.suelo[0], sw.suelo[1], sw.e) * 0.4;
      cr.beginPath();
      for (var k = 0; k <= 64; k++) {
        var a = k / 64 * Math.PI * 2;
        var bulto = 1 + 0.08 * Math.sin(a * 3 + 1) + 0.05 * Math.sin(a * 5);          // borde de nube, no de círculo
        var x = cx + Math.cos(a) * r * bulto, z = cz + Math.sin(a) * r * 0.75 * bulto;
        var q = proyectar(x, alturaEn(x, z) * EXAG + 15, z); if (!q) { cr.restore(); return; }
        if (k) cr.lineTo(q[0], q[1]); else cr.moveTo(q[0], q[1]);
      }
      cr.fill();
    }
    cr.restore();
  }

  function pulsos() {
    var P = PULSO[tema], sw = posSwitch(); if (!sw || sw.vis <= 0) return;
    var aSw = veloEn(sw.suelo[0], sw.suelo[1], sw.e) * sw.vis;
    sombraNube(sw, P);                                                      // la sombra, debajo de las tramas
    sim.tramas.forEach(function (tr) {
      var u = (sim.reloj - tr.t) / sim.VUELO; if (u < 0 || u > 1) return;
      // sale del bus que la envía, donde va ahora (Benjamin, 2026-10-30), no del punto de la ruta donde se generó
      var fb = focos[tr.bus]; if (!fb) return;
      var o = proyectar(fb.centro[0], fb.centro[1], fb.centro[2]); if (!o) return;
      if (u > 0.97 && !tr.llego) { tr.llego = true; var k = tr.bus % 6; puertos[k] = sim.reloj; estPuerto[k] = tr.estado; }
      // arco: el control sobre el punto medio, más alto cuanto más lejos va
      var mx = (o[0] + sw.x) / 2, my = Math.min(o[1], sw.y) - 0.25 * Math.hypot(sw.x - o[0], sw.y - o[1]);
      var col = tr.estado === 2 ? P.alerta : P.normal;
      var aBase = Math.min(1, u / 0.08) * Math.min(1, (1 - u) / 0.02) * (tr.estado === 2 ? 1 : 0.85) * Math.max(veloEn(o[0], o[1], fb.centro[1] / EXAG), aSw) * sw.vis;
      // mismo arco, pero el paquete acelera de forma exponencial (Benjamin, 2026-10-30): sale lento del bus y llega
      // rápido a SACEL; la estela, que muestrea el tiempo, se alarga sola con la velocidad
      function arco(t) { t = (Math.exp(ACEL_TRAMA * t) - 1) / (Math.exp(ACEL_TRAMA) - 1); var m = 1 - t; return [m * m * o[0] + 2 * m * t * mx + t * t * sw.x, m * m * o[1] + 2 * m * t * my + t * t * sw.y]; }
      cr.lineWidth = 1.2 + 1.3 * Math.pow(u, 6);                              // la estela: se apaga hacia atrás y engorda al final
      for (var j = 0; j < 14; j++) {
        var t1 = Math.max(0, u - j * 0.012), t0 = Math.max(0, u - (j + 1) * 0.012); if (t1 <= 0) break;
        var p1 = arco(t1), p0 = arco(t0);
        cr.strokeStyle = "rgba(" + col + "," + (aBase * (0.75 + 0.25 * u * u) * (1 - j / 14)).toFixed(3) + ")";
        cr.beginPath(); cr.moveTo(p0[0], p0[1]); cr.lineTo(p1[0], p1[1]); cr.stroke();
      }
      if (u < 0.2) {                                                         // al salir, un anillo que se abre en el bus
        var ra = 2 + u * 40;
        cr.strokeStyle = "rgba(" + col + "," + (aBase * (1 - u / 0.2) * 0.7).toFixed(3) + ")"; cr.lineWidth = 1;
        cr.beginPath(); cr.arc(o[0], o[1], ra, 0, 7); cr.stroke();
      }
    });
    // la nube de SACEL (Benjamin, 2026-10-30: algo que el cliente asocie a computador, análisis y nube): un cúmulo de
    // copos suaves, iluminado desde arriba y con la base en sombra, que se condensa de la nada (cada copo aparece y crece
    // a su turno, desenfocado al principio); adentro, un gráfico de barras que crece con cada trama que llega; a su
    // izquierda, el rótulo. Dibujada a la escala que le da la distancia
    cr.save();
    var aN = veloEn(sw.x, sw.y + 20, altMax) * sw.vis;
    if ("filter" in cr && sw.vis < 1) cr.filter = "blur(" + ((1 - sw.vis) * 4).toFixed(1) + "px)";
    cr.translate(sw.x, sw.y); cr.scale(sw.esc, sw.esc);
    var COPOS = [[-18, 5, 7], [-11, 0, 10], [-3, -5, 12], [6, -6, 10], [12, 0, 10], [19, 5, 7.5], [-8, 6, 9], [3, 5, 10], [12, 7, 8], [-1, 0, 11]];
    COPOS.forEach(function (q, i) {
      var v = Math.max(0, Math.min(1, sw.vis * 1.7 - i * 0.1)); if (v <= 0) return;
      var r = q[2] * (0.55 + 0.45 * v), g = cr.createRadialGradient(q[0] - r * 0.2, q[1] - r * 0.3, 0, q[0], q[1], r);
      // copos planos, de borde casi definido: entre el ícono y una nube real (Benjamin, 2026-10-30: «un poco menos realista»)
      g.addColorStop(0, "rgba(" + P.nube[0] + ",.97)"); g.addColorStop(0.62, "rgba(" + P.nube[0] + ",.92)");
      g.addColorStop(0.86, "rgba(" + P.nube[1] + ",.55)"); g.addColorStop(1, "rgba(" + P.nube[1] + ",0)");
      cr.globalAlpha = aN * v * P.nubeA; cr.fillStyle = g;
      cr.beginPath(); cr.arc(q[0], q[1], r, 0, 7); cr.fill();
    });
    var base = cr.createLinearGradient(0, 2, 0, 14);                         // la base, más gris
    base.addColorStop(0, "rgba(" + P.nube[2] + ",0)"); base.addColorStop(1, "rgba(" + P.nube[2] + ",.45)");
    cr.globalAlpha = aN; cr.globalCompositeOperation = "source-atop";
    cr.fillStyle = base; cr.fillRect(-26, -16, 52, 32);
    cr.globalCompositeOperation = "source-over";
    for (var k = 0; k < 4; k++) {                                            // barras: una por cada par de puertos
      var brillo = Math.max(0, 1 - (sim.reloj - Math.max(puertos[k], puertos[k + 2] || 0)) / 0.6);
      var hb = 3 + [3, 6, 4, 7][k] * (0.55 + 0.45 * brillo);
      cr.globalAlpha = aN * aN;
      cr.fillStyle = "rgba(" + (estPuerto[k] === 2 ? P.alerta : P.normal) + "," + (0.5 + 0.5 * brillo).toFixed(3) + ")";
      cr.fillRect(-8 + k * 4.6, 7 - hb, 3, hb);
    }
    cr.globalAlpha = aN;
    cr.fillStyle = P.texto; cr.font = "600 15.75px 'Plex Mono', monospace"; cr.textAlign = "right"; cr.textBaseline = "middle";
    cr.fillText("SACEL", -26, 2);                                            // 75 % más grande que el rótulo original (9 px)                                            // a la izquierda de la nube
    cr.restore();
    cr.globalAlpha = 1;
  }

  // ─── flora y fauna del sector (Benjamin, 2026-10-30; especies de iNaturalist en el recuadro Rancagua–Sewell) ───
  // quiscos en las laderas de solana bajas y quillayes en las de umbría (los zorros se quitaron el 30-oct).
  // Van con el relieve (mismo velo, niebla y color) y se esconden detrás de las lomas; al final se transparentan con
  // un desfase respecto de él (opacVida).
  var VIDA = { quiscos: 70, quillayes: 34 };   // sin fauna terrestre (Benjamin, 2026-10-30: fuera los zorros)
  // los simulados, en una zona acotada en torno al tramo medio de la ruta, que siempre queda a la vista (2026-10-30)
  var ZONA_VIDA = { cx: 13600, cz: 11200, rx: 4200, rz: 3400 };
  // registros reales de iNaturalist con GPS dentro de la zona visible (verificables, sin coordenadas ocultas; consulta
  // del 2026-10-30; x, z en metros del cuadro; los repetidos a menos de 80 m se juntan). Van en colores más vivos.
  // Quisco (Trichocereus chiloensis), obs. 381755775, 357400086, 322230210, 314159521, 314018125, 314017375, 280061564,
  // 252715341, 238014707, 238006260, 238006257, 186950714, 186950713, 186950711, 186950708, 186950700, 186950699,
  // 167012766, 109999256, 106928893, 106890947. Quillay (Quillaja saponaria), obs. 399264022, 396667332, 381755762,
  // 315916228, 239291696. https://www.inaturalist.org/observations/<n>
  var INAT = { quiscos: [[4091,  14933],  [12934,  12325],  [5167,  9403],  [6178,  13070],  [17277,  16954],  [6510,  13094],  [5321,  13908],  [5379,  13830],  [5375,  14052],  [6274,  16300],  [7104,  9869],  [5225,  14140],  [5201,  13711]],
               quillayes: [[3809,  16748],  [4301,  12131],  [4025,  14950],  [3892,  11366],  [5838,  13765]] };
  var seres = null;
  function cercaDeRuta(x, z, d) {
    for (var i = 0; i < R.length; i++) if (Math.abs(R[i][0] - x) < d && Math.abs(R[i][1] - z) < d && Math.hypot(R[i][0] - x, R[i][1] - z) < d) return true;
    return false;
  }
  function prepararVida() {
    var semilla = 29;
    function az() { semilla = (semilla * 1664525 + 1013904223) >>> 0; return semilla / 4294967296; }
    function lugar(min, max, solana, intentos) {   // un punto del cuadro entre esas alturas, con la exposición pedida
      for (var n = 0; n < intentos; n++) {
        var ang = az() * 6.2832, rr = Math.sqrt(az());
        var x = ZONA_VIDA.cx + Math.cos(ang) * rr * ZONA_VIDA.rx, z = ZONA_VIDA.cz + Math.sin(ang) * rr * ZONA_VIDA.rz, h = alturaEn(x, z);
        if (h < min || h > max) continue;
        if (cercaDeRuta(x, z, 320)) continue;                              // que no tapen el camino
        var pend = (alturaEn(x, z + 150) - alturaEn(x, z - 150)) / 300;    // > 0: la ladera mira al norte (al sol)
        if (solana === 1 && pend < 0.03) continue;
        if (solana === -1 && pend > -0.02) continue;
        return [x, z];
      }
      return null;
    }
    seres = [];
    var k, p;
    for (k = 0; k < VIDA.quiscos; k++) if ((p = lugar(700, 1700, 1, 150))) seres.push({ tipo: "quisco", x: p[0], z: p[1], t: 0.8 + az() * 0.5, brazos: az() < 0.7 ? (az() < 0.5 ? 1 : 2) : 0 });
    for (k = 0; k < VIDA.quillayes; k++) {          // de a dos o tres, como en las quebradas
      if (!(p = lugar(700, 1800, -1, 150))) continue;
      var n = 1 + Math.floor(az() * 3);
      for (var j = 0; j < n; j++) {
        var qx = p[0] + (az() - 0.5) * 500, qz = p[1] + (az() - 0.5) * 500;
        if (!cercaDeRuta(qx, qz, 320)) seres.push({ tipo: "quillay", x: qx, z: qz, t: 0.8 + az() * 0.45 });
      }
    }
    INAT.quiscos.forEach(function (q) { seres.push({ tipo: "quisco", x: q[0], z: q[1], t: 1.05, brazos: az() < 0.5 ? 1 : 2, real: true }); });
    INAT.quillayes.forEach(function (q) { seres.push({ tipo: "quillay", x: q[0], z: q[1], t: 1.1, real: true }); });
  }
  function aLaVista(x, y, z) {                     // ¿alguna loma tapa el punto? se recorre el rayo hacia la cámara
    for (var k = 1; k < 14; k++) {
      var t = k / 14 * 0.6, px = x + (ojo[0] - x) * t, py = y + (ojo[1] - y) * t, pz = z + (ojo[2] - z) * t;
      if (alturaEn(px, pz) * EXAG > py + 10) return false;
    }
    return true;
  }
  var COLORES_VIDA = {
    // tonos cercanos al relieve que los rodea, apenas más oscuros (Benjamin, 2026-10-30: que se integren); los «vivo»
    // son para los registros reales de iNaturalist, para que se distingan
    claro:  { cactus: [86, 102, 70], tronco: [104, 92, 76], copa: [84, 98, 64], copa2: [112, 124, 88],
              cactusVivo: [46, 150, 58], copaVivo: [58, 138, 40], copa2Vivo: [118, 186, 74] },
    oscuro: { cactus: [30, 36, 44], tronco: [26, 28, 34], copa: [26, 32, 40], copa2: [40, 48, 58],
              cactusVivo: [90, 190, 110], copaVivo: [96, 176, 96], copa2Vivo: [150, 214, 140] }
  };
  // el mismo tratamiento de color que el relieve en su shader: lavado hacia el papel y niebla por distancia
  function comoMapa(c, f) {
    var l = TM.lavado * suave(pCam), r = [];
    for (var i = 0; i < 3; i++) {
      var v = c[i] / 255; v = v + (TM.papel[i] - v) * l; v = v + (TM.niebla[i] - v) * f * 0.7;
      r.push(Math.round(Math.max(0, Math.min(1, v)) * 255));
    }
    return "rgb(" + r.join(",") + ")";
  }

  function vida() {
    if (!alturas || opacVida <= 0.02) return;
    if (!seres) prepararVida();
    var C = COLORES_VIDA[tema], t = sim.reloj;
    cr.save(); cr.lineCap = "round"; cr.lineJoin = "round";
    seres.forEach(function (o) {
      var x = o.x, z = o.z, rumbo = 0;
      var y = alturaEn(x, z) * EXAG;
      var q = proyectar(x, y, z); if (!q || q[0] < -20 || q[0] > W + 20 || q[1] < -20 || q[1] > H + 20) return;
      if (!aLaVista(x, y, z)) return;
      // alfa igual al del relieve en ese punto: velo × (1 − 0,75 niebla) × opacidad del mapa, para que se vean como parte de él
      var dc = Math.hypot(x - ojo[0], y - ojo[1], z - ojo[2]), fn = Math.max(0, Math.min(1, (dc - nieblaAct[0]) / (nieblaAct[1] - nieblaAct[0])));
      fn = fn * fn * (3 - 2 * fn);
      // abajo a la izquierda (inicio de la H-25, junto al texto) van más tenues, para que no resalten (2026-10-30)
      var mv = medidasVelo(), izq = 1 - Math.max(0, Math.min(1, (q[0] - mv[0]) / (W * 0.3))), baja = Math.max(0, Math.min(1, (q[1] / H - 0.45) / 0.35));
      var a2 = veloEn(q[0], q[1], y / EXAG) * (1 - 0.75 * fn) * opacVida * (1 - 0.7 * izq * baja); if (a2 <= 0.02) return;
      var f = 0.8 * Math.max(0.55, Math.min(1.8, 2600 / tamPantalla(x, y, z, 100)));   // tamaño de juguete, según la distancia (60 % del primero)
      cr.globalAlpha = a2;
      if (o.tipo === "quisco") {                    // columna con uno o dos brazos
        var h = 8 * f * o.t;
        cr.strokeStyle = comoMapa(o.real ? C.cactusVivo : C.cactus, fn); cr.lineWidth = 1.6 * f;
        cr.beginPath(); cr.moveTo(q[0], q[1]); cr.lineTo(q[0], q[1] - h);
        if (o.brazos > 0) { cr.moveTo(q[0], q[1] - h * 0.45); cr.lineTo(q[0] - h * 0.28, q[1] - h * 0.45); cr.lineTo(q[0] - h * 0.28, q[1] - h * 0.78); }
        if (o.brazos > 1) { cr.moveTo(q[0], q[1] - h * 0.3); cr.lineTo(q[0] + h * 0.25, q[1] - h * 0.3); cr.lineTo(q[0] + h * 0.25, q[1] - h * 0.62); }
        cr.stroke();
      } else if (o.tipo === "quillay") {            // tronco corto y copa redonda, más clara arriba
        var r = 4.2 * f * o.t;
        cr.strokeStyle = comoMapa(C.tronco, fn); cr.lineWidth = 1.3 * f;
        cr.beginPath(); cr.moveTo(q[0], q[1]); cr.lineTo(q[0], q[1] - r * 1.1); cr.stroke();
        var g = cr.createRadialGradient(q[0] - r * 0.3, q[1] - r * 1.9, r * 0.1, q[0], q[1] - r * 1.5, r * 1.1);
        g.addColorStop(0, comoMapa(o.real ? C.copa2Vivo : C.copa2, fn)); g.addColorStop(1, comoMapa(o.real ? C.copaVivo : C.copa, fn));
        cr.fillStyle = g; cr.beginPath(); cr.arc(q[0], q[1] - r * 1.5, r, 0, 7); cr.fill();
      }
    });
    cr.restore();
    cr.globalAlpha = 1;
  }

  // ─── una bandada de loros tricahue (Cyanoliseus patagonus; Benjamin, 2026-10-30), bastante más abajo que los cóndores.
  // Es la especie de loro con registros en iNaturalist en el sector (125 al 30-oct; el choroy, ninguno). Cada pasada
  // va por otro lado: parte en una ladera alta al azar y baja por descenso de gradiente sobre la rejilla del relieve
  // (siempre a la celda vecina más baja, con algo de inercia; en los planos cruza sin volver atrás), así el trayecto
  // cae al fondo del valle y lo sigue aguas abajo (Benjamin: que los caminos sigan los valles). Vuelan a LOROS.altura
  // sobre el terreno, a LOROS.vel m/s, y pasan cada LOROS.ciclo s. No se transparentan con el mapa.
  var LOROS = { n: 9, altura: 380, ciclo: 110, vel: 242, minLargo: 7000 };   // vel a la mitad (2026-10-30); el aleteo no cambia
  var bandada = null, pasada = -1, tramo = null;
  // descenso de gradiente sobre la rejilla del relieve, desde la celda (i, j): siempre a la vecina más baja, con algo de
  // inercia, sin volver atrás; termina sin salida, si habría que subir mucho, al bajar de op.piso m o al salir de
  // op.caja. Devuelve el trayecto en metros, suavizado (media móvil de ±op.suave celdas), con su largo acumulado.
  var VEC8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  function descenso(i, j, op) {
    function alt(i, j) { return alturas[j * T.nx + i]; }
    var visto = {}, celdas = [[i, j]], dir = -1;
    visto[i + "," + j] = 1;
    for (var paso = 0; paso < (op.pasos || 260); paso++) {
      var mejor = -1, hMejor = Infinity;
      for (var d = 0; d < 8; d++) {
        var ii = i + VEC8[d][0], jj = j + VEC8[d][1];
        if (ii < 1 || jj < 1 || ii > T.nx - 2 || jj > T.nz - 2 || visto[ii + "," + jj]) continue;
        var h = alt(ii, jj) - (d === dir ? 6 : 0);                            // inercia: preferir seguir derecho
        if (h < hMejor) { hMejor = h; mejor = d; }
      }
      if (mejor < 0 || hMejor > alt(i, j) + 25) break;                      // sin salida o habría que subir mucho
      i += VEC8[mejor][0]; j += VEC8[mejor][1]; dir = mejor; visto[i + "," + j] = 1; celdas.push([i, j]);
      var wx = T.x0 + i * T.paso, wz = T.z0 + j * T.paso, c = op.caja;
      if (wx < c[0] || wx > c[1] || wz < c[2] || wz > c[3]) break;          // salió de la zona que se ve bien
      if (op.piso && alt(i, j) < op.piso) break;
    }
    var pts = celdas.map(function (c) { return [T.x0 + c[0] * T.paso, T.z0 + c[1] * T.paso]; }), lisa = [], acum = [0], v = op.suave || 3;
    for (var n = 0; n < pts.length; n++) {
      var sx = 0, sz = 0, m = 0;
      for (var w = -v; w <= v; w++) { var q = pts[Math.max(0, Math.min(pts.length - 1, n + w))]; sx += q[0]; sz += q[1]; m++; }
      lisa.push([sx / m, sz / m]);
      if (n) acum.push(acum[n - 1] + Math.hypot(lisa[n][0] - lisa[n - 1][0], lisa[n][1] - lisa[n - 1][1]));
    }
    return { pts: lisa, acum: acum, largo: acum[acum.length - 1] };
  }
  function nuevoTramo(k) {
    var sem = 101 + k * 7919; function az() { sem = (sem * 1664525 + 1013904223) >>> 0; return sem / 4294967296; }
    for (var intento = 0; intento < 30; intento++) {
      var i = Math.round((5000 + az() * 25000 - T.x0) / T.paso), j = Math.round((500 + az() * 17500 - T.z0) / T.paso);
      if (alturas[j * T.nx + i] < 1500) continue;                         // partir en altura, para tener valle que bajar
      var tr = descenso(i, j, { caja: [6000, 32000, 0, 19000], suave: 3 });
      if (tr.largo < LOROS.minLargo) continue;
      if (az() < 0.5) {                                                   // la mitad de las veces, valle arriba
        tr.pts.reverse(); var tot = tr.largo; tr.acum = tr.acum.map(function (v) { return tot - v; }).reverse();
      }
      tr.dur = tr.largo / LOROS.vel;
      return tr;
    }
    return null;
  }
  function puntoTramo(tr, u) {                   // punto a la fracción u del largo
    var L = u * tr.acum[tr.acum.length - 1], a = 0, b = tr.acum.length - 1;
    while (b - a > 1) { var m = (a + b) >> 1; if (tr.acum[m] < L) a = m; else b = m; }
    var f = (L - tr.acum[a]) / ((tr.acum[b] - tr.acum[a]) || 1);
    return [tr.pts[a][0] + (tr.pts[b][0] - tr.pts[a][0]) * f, tr.pts[a][1] + (tr.pts[b][1] - tr.pts[a][1]) * f];
  }
  function loros() {
    if (!alturas || tema === "oscuro") return;                          // de noche no vuelan
    if (!bandada) {
      var sem = 7; function az() { sem = (sem * 1664525 + 1013904223) >>> 0; return sem / 4294967296; }
      bandada = []; for (var k = 0; k < LOROS.n; k++) bandada.push({ atras: k * 0.012 + az() * 0.01, lado: (az() - 0.5) * 260, alto: (az() - 0.5) * 120, fase: az() * 6.28 });
    }
    var k = Math.floor(sim.reloj / LOROS.ciclo), t = sim.reloj - k * LOROS.ciclo;
    if (k !== pasada) { pasada = k; tramo = nuevoTramo(k); }
    if (!tramo || t > tramo.dur) return;
    var colA = tema === "claro" ? "52,128,58" : "130,186,128";
    cr.save(); cr.lineCap = "round"; cr.lineJoin = "round";
    bandada.forEach(function (b) {
      var u = t / tramo.dur - b.atras; if (u < 0 || u > 1) return;
      var p = puntoTramo(tramo, u), p2 = puntoTramo(tramo, Math.min(1, u + 0.01));
      var dx = p2[0] - p[0], dz = p2[1] - p[1], l = Math.hypot(dx, dz) || 1;
      var x = p[0] - dz / l * b.lado, z = p[1] + dx / l * b.lado;          // la formación, a los lados del trayecto
      var y = (alturaEn(x, z) + LOROS.altura + b.alto + Math.sin(t * 1.3 + b.fase) * 30) * EXAG;
      var q = proyectar(x, y, z); if (!q) return;
      var a = veloEn(q[0], q[1], y / EXAG) * Math.min(1, u / 0.06) * Math.min(1, (1 - u) / 0.06); if (a <= 0.02) return;
      var sp = Math.max(3.5, Math.min(7, 5 * (2600 / tamPantalla(x, y, z, 100)))), al = Math.sin(t * 24 + b.fase) * 0.35;
      cr.strokeStyle = "rgba(" + colA + "," + (a * 0.95).toFixed(3) + ")"; cr.lineWidth = 1.4;
      cr.beginPath();
      cr.moveTo(q[0] - sp / 2, q[1] - sp * al); cr.lineTo(q[0], q[1] + sp * 0.12); cr.lineTo(q[0] + sp / 2, q[1] - sp * al);
      cr.stroke();
    });
    cr.restore();
  }

  // ─── cóndores (Benjamin, 2026-10-30): unos pocos, diminutos, planeando en círculos sobre las cumbres nevadas ───
  var CONDORES = { n: 3, ala: 9, cumbre: 2650, piso: 2150, altura: 520, cumbreAlta: 3200, vel: 242 };   // cuántos; envergadura en px; m: cumbre de partida, fondo de la quebrada, vuelo sobre el terreno; m/s del mapa
  var condor = null;
  function prepararCondores() {
    // como los loros, siguen quebradas por descenso de gradiente, pero sólo su parte alta: parten en una cumbre y bajan
    // hasta que el terreno cae de CONDORES.piso m, con un trazado más suave (Benjamin, 2026-10-30: «los cracks que van
    // casi llegando a las cumbres»). Van y vuelven por su quebrada, a CONDORES.altura sobre el terreno.
    var orden = [];
    for (var j = 2; j < T.nz - 2; j++) for (var i = 2; i < T.nx - 2; i++) {
      var x = T.x0 + i * T.paso, z = T.z0 + j * T.paso;
      if (x > 9000 && x < 31000 && z > 0 && z < 14000 && alturas[j * T.nx + i] > CONDORES.cumbre) orden.push([alturas[j * T.nx + i], i, j]);
    }
    orden.sort(function (a, b) { return b[0] - a[0]; });
    var semilla = 11;
    function az() { semilla = (semilla * 1664525 + 1013904223) >>> 0; return semilla / 4294967296; }
    condor = [];
    for (var k = 0; k < orden.length && condor.length < CONDORES.n; k++) {
      var o = orden[k], wx = T.x0 + o[1] * T.paso, wz = T.z0 + o[2] * T.paso;
      if (condor.some(function (c) { return Math.hypot(c.pts[0][0] - wx, c.pts[0][1] - wz) < 3000; })) continue;
      var tr = descenso(o[1], o[2], { caja: [3000, 35000, -3000, 18000], piso: CONDORES.piso, suave: 6, pasos: 80 });
      if (tr.largo < 1500) continue;
      tr.fase = az(); tr.bate = az() * 30; tr.hFase = az() * 6.28;
      condor.push(tr);
    }
    // y uno o, a veces, dos más arriba en la cordillera, en quebradas cortas cerca de las cumbres más altas (Benjamin,
    // 2026-10-30); el segundo aparece y desaparece en ciclos largos
    var altos = [];
    for (j = 2; j < T.nz - 2; j++) for (i = 2; i < T.nx - 2; i++) {
      var hx = T.x0 + i * T.paso, hz = T.z0 + j * T.paso, hh = alturas[j * T.nx + i];
      if (hx > 22000 && hx < 40000 && hz > -6000 && hz < 12000 && hh > CONDORES.cumbreAlta) altos.push([hh, i, j]);
    }
    altos.sort(function (a, b) { return b[0] - a[0]; });
    var extra = 0;
    for (k = 0; k < altos.length && extra < 2; k++) {
      var oa = altos[k], ax = T.x0 + oa[1] * T.paso, azz = T.z0 + oa[2] * T.paso;
      if (condor.some(function (c) { return Math.hypot(c.pts[0][0] - ax, c.pts[0][1] - azz) < 3500; })) continue;
      var ta = descenso(oa[1], oa[2], { caja: [3000, 44000, -8000, 18000], piso: oa[0] - 450, suave: 4, pasos: 30 });
      if (ta.largo < 600) continue;
      ta.fase = az(); ta.bate = az() * 30; ta.hFase = az() * 6.28; ta.alto = true; ta.intermitente = extra === 1;
      condor.push(ta); extra++;
    }
  }
  function condores() {
    if (!alturas || tema === "oscuro") return;                          // de noche no vuelan (Benjamin, 2026-10-30)
    if (!condor) prepararCondores();
    var t = sim.reloj, colA = tema === "claro" ? "28,26,34" : "214,218,232";
    cr.lineCap = "round"; cr.lineJoin = "round";
    condor.forEach(function (c) {
      // ida y vuelta por la quebrada, a CONDORES.vel (ahora igual a la de los loros); suave en los extremos, donde da la vuelta
      var vuelta = 2 * c.largo / CONDORES.vel, f = ((t / vuelta) + c.fase) % 1, u = f < 0.5 ? f * 2 : 2 - f * 2;
      u = 0.5 - 0.5 * Math.cos(u * Math.PI);
      var p = puntoTramo(c, u), p2 = puntoTramo(c, Math.min(1, u + 0.01)), sentido = f < 0.5 ? 1 : -1;
      var x = p[0], z = p[1];
      var y = (alturaEn(x, z) + CONDORES.altura) * EXAG + Math.sin(t * 0.2 + c.hFase) * 120;   // sube y baja con la térmica
      var cen = proyectar(x, y, z); if (!cen) return;
      // silueta en pantalla, como se ve un cóndor de lejos: alas abiertas en una "m" muy plana, con la envergadura que
      // le da la distancia; se ladea con las curvas de la quebrada y de vez en cuando da un par de aletazos
      var p3 = puntoTramo(c, Math.min(1, u + 0.03)), giro = Math.atan2(p3[1] - p2[1], p3[0] - p2[0]) - Math.atan2(p2[1] - p[1], p2[0] - p[0]);
      giro = Math.atan2(Math.sin(giro), Math.cos(giro));
      var sp = Math.max(5, Math.min(16, CONDORES.ala * (2600 / tamPantalla(x, y, z, 100)))), ladeo = Math.max(-0.35, Math.min(0.35, giro * 4 * sentido));
      var ciclo = (t + c.bate) % 14, alza = ciclo < 1.2 ? Math.sin(ciclo * 15) * 0.18 : 0;
      var a = veloEn(cen[0], cen[1], y / EXAG) * (tema === "claro" ? 0.8 : 0.65);
      if (c.intermitente) a *= Math.max(0, Math.min(1, Math.sin(t * 0.05 + c.hFase) * 3));   // a veces está, a veces no
      if (a <= 0.02) return;
      cr.save();
      cr.translate(cen[0], cen[1]); cr.rotate(ladeo);
      cr.strokeStyle = "rgba(" + colA + "," + a.toFixed(3) + ")"; cr.lineWidth = 1.3;
      cr.beginPath();
      cr.moveTo(-sp / 2, sp * (0.06 - alza));
      cr.quadraticCurveTo(-sp / 4, -sp * (0.24 + alza), 0, 0);
      cr.quadraticCurveTo(sp / 4, -sp * (0.24 + alza), sp / 2, sp * (0.06 - alza));
      cr.stroke();
      cr.restore();
    });
  }

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, W < 760 ? 1.5 : 2);
    W = lienzo.clientWidth; H = lienzo.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, W < 760 ? 1.5 : 2);
    lienzo.width = Math.round(W * dpr); lienzo.height = Math.round(H * dpr);
    capa.width = Math.round(W * dpr); capa.height = Math.round(H * dpr);
    if (cielo) { cielo.width = Math.round(W * dpr); cielo.height = Math.round(H * dpr); }
    // logo inicial que cabe con todo el texto de la empresa debajo (Benjamin, 2026-10-30: párrafo nuevo): se mide el
    // alto del texto y la separación logo–título, y se despeja el tamaño; nunca más que LOGO_INICIO
    var img = document.querySelector(".marca img"), h1 = heroe && heroe.querySelector(".capa-empresa h1"), lug = heroe && heroe.querySelector(".capa-empresa > :last-child");   // el último párrafo (2026-10-30: sin «Santiago, desde 1991»)
    if (img && h1 && lug && W >= 760) {
      var rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      var lAct = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--logo")) || LOGO_FIN;
      var bi = img.getBoundingClientRect().bottom, t1 = h1.getBoundingClientRect().top, alto = lug.getBoundingClientRect().bottom - t1;
      var sobra = H - 1.5 * rem - (bi + (t1 - bi) + alto);
      logoInicio = Math.max(LOGO_FIN + 1, Math.min(LOGO_INICIO, lAct + sobra / (2.147 * rem)));
    }
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
