/* Portada, vista 3D: la cámara baja de altura con el scroll.
   Arriba de todo se ve el mapa desde el cielo; al bajar por la página la portada queda fija y la cámara desciende de
   forma determinista (cada posición del scroll es siempre la misma pose) hasta quedar sobre el valle, mirando la
   cordillera, con el camino subiendo hacia el fondo y los buses con sus focos.
   Dos temas (atributo data-tema de <html>): oscuro, de noche con estrellas; claro, de día, con el sol todavía detrás
   de la cordillera. Desde el 2026-11-02 el mapa es la segunda sección de inicio (debajo de la portada «cordillera»):
   ya no mueve el logo, y WebGL y las texturas se piden recién cuando la sección se acerca a la pantalla.
   Textos (.heroe): arriba, la empresa; desde la mitad del descenso, SACEL (--sacel); con la cámara quieta, sus 4 pasos
   (--datos).
   WebGL 1 escrito a mano, sin librerías. Datos: datos/h25.js (ruta, alturas del camino y cuadro 3D),
   img/alturas-3d.png (altura = R·256 + G, en m) e img/relieve-3d-{noche,dia}.webp (relieve sombreado de cada tema).
   Si no hay WebGL o las imágenes no se pueden leer, se usa la vista 2D (flota-mapa.js). */
(function () {
  "use strict";
  var D = window.H25, lienzo = document.getElementById("flota3d"), capa = document.getElementById("flota-reg");
  var recorrido = document.querySelector(".recorrido");
  if (!D || !window.FlotaSim || !lienzo || !capa) return;
  var heroe = document.querySelector(".heroe");
  // el mapa abre quieto con el panorama de Andes; en este tramo del descenso entra SACEL y parten la cámara y los buses
  // (Benjamin, 2026-11-02). Antes: [0.35, 0.65] con los párrafos de la empresa; luego [-1, 0] (SACEL desde el comienzo).
  // (2026-11-02, tarde) SACEL es una sola parada: al llegar, la animación corre sola (aSacel, DUR_SACEL) y el panorama
  // sale y SACEL entra en el primer 35 %
  var SACEL_ENTRA = [0, 0.35];
  var DUR_SACEL = 2.5, aSacel = 0, tSacel = 0;
  // (2026-11-03) Benjamin: el relato de SACEL va dentro del mapa, en 3 paradas tras el panorama: 1) SACEL (la de antes)
  // con chips de datos que salen de los buses hacia la nube; 2) la flota: cada bus de la ruta con su línea a la nube y
  // pulsos de cobre; 3) un panel que se despliega desde la nube con el registro de conducción y descanso de los buses
  // simulados. nivelMapa (0–3) lo elige el scroll; aFlota y aReporte se animan solos en DUR_NIVEL
  var PARADAS_MAPA = 3, DUR_NIVEL = 1.3, nivelMapa = 0, aFlota = 0, aReporte = 0;
  var VENTANA_REG = 360;
  var PASOS_PARADA = [[], [0, 1], [3], [2]];      // índices de .pasos li que destaca cada parada                         // s de animación (× escala 5 = 30 min simulados)               // s; 0 = panorama, 1 = SACEL completo
  document.documentElement.classList.add("con-mapa");   // con JS, los textos se turnan (base.css)
  function despues(fn) {                        // tras pintar: con la página cargada y el navegador libre
    function ya() { (window.requestIdleCallback || function (f) { setTimeout(f, 1); })(fn, { timeout: 600 }); }
    if (document.readyState === "complete") ya(); else window.addEventListener("load", ya, { once: true });
  }
  // WebGL y las texturas se piden apenas se pinta la página (Benjamin, 2026-11-02: «la simulación debe empezar a cargar
  // desde el primer momento»), primero lo que se ve primero: el relieve (alturas y textura del tema) y los cóndores, que
  // vuelan con el reloj de la simulación. Mientras carga, el borde del mapa que asoma bajo la portada es su primer
  // cuadro fijo (base.css, --mapa-inicial). Antes (2-nov, mañana) WebGL esperaba a que se bajara hacia el mapa.
  despues(empezar);
  function empezar() {

  var ACELERACION_TIEMPO = 10;                  // el reloj corre 10 veces más rápido que el real
  var VELOCIDAD_BUSES = 0.5;                   // los buses avanzan a la mitad (Benjamin, 2026-10-30); esperas y tramas no cambian
  var EXAG = 1.35;                              // exageración vertical del relieve
  var FOV = 38;                                 // grados, campo vertical
  var FRACCION_DESCENSO = 0.5;                  // la cámara baja en la primera mitad del recorrido; la segunda queda quieta
                                                // (reservada para la animación de los datos: window.FlotaPortada.datos)
  var opacMapa = 1, opacVida = 1, nieblaAct = [1, 2];
  var MAPA_FINAL = 0.4;                         // cuánto se transparenta el relieve al final del scroll
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
    claro:  { niebla: [0.922, 0.933, 0.925], nieve: 0.9, brillo: 1.04, lavado: 0.36, verde: 0.6, bruma: [0.70, 0.76, 0.82], papel: [0.922, 0.933, 0.925], velo: true, borde: [0.08, 0.09, 0.14],
              calzada: [0.2, 0.22, 0.29], linea: [0.97, 0.8, 0.5], panel: "rgba(244,246,245,.86)", focos: false,
              cielo: ["#ebeeec", "#ebeeec", "#e7ebe9"] }
  };
  function temaActual() { return document.documentElement.getAttribute("data-tema") === "claro" ? "claro" : "oscuro"; }
  var tema = temaActual(), TM = TEMAS[tema];

  // ─── poses de la cámara: [p, ojo, objetivo] en metros (x este, y altura, z sur) ───
  // Siempre se mira al centro de la H-25 (Benjamin, 2026-10-29: la animación centrada en la ruta y más alejada); el
  // corrimiento de lente de camara() deja ese centro en el medio del espacio del mapa, a la derecha del texto.
  var CENTRO = [16700, 1800, 9500];                    // centro del cuadro de la ruta, a media altura (exagerada)
  var ALEJAR = 1.85;                                   // zoom out respecto de las poses del 28-oct (1,25 hasta el 2-nov; Benjamin: el mapa completo, cumbres incluidas)
  var BAJAR = 0.08;                                    // corrimiento vertical de lente (fracción de media pantalla), escritorio
  function desde(v) { return [CENTRO[0] + v[0] * ALEJAR, CENTRO[1] + v[1] * ALEJAR, CENTRO[2] + v[2] * ALEJAR]; }
  var POSES = [
    [0.00, desde([-8500, 15000, 20500]), CENTRO],       // inclinada desde el sur (Benjamin, 2026-10-29: el tilt inicial)
    [1.00, desde([-19500, 17000, 19500]), CENTRO]       // en alto sobre el valle, más terreno a la vista, hacia el noreste
  ];

  var fallado = false;
  function fallar() {
    if (fallado) return; fallado = true;
    document.documentElement.classList.add("sin-3d");
    if (window.iniciarFlotaMapa) window.iniciarFlotaMapa();
  }

  var gl = lienzo.getContext("webgl", { antialias: true, premultipliedAlpha: true }) ||
           lienzo.getContext("experimental-webgl");
  if (!gl) { fallar(); return; }
  var cr = capa.getContext("2d");
  var sim = window.FlotaSim(D, {
    escala: ACELERACION_TIEMPO * VELOCIDAD_BUSES, periodo: 9, vuelo: 3.2,   // una trama cada 9 s por bus (2026-10-30; antes 2,6)
    ventana: VENTANA_REG,                         // el registro guarda 30 min simulados, para el panel de la parada 3 (2026-11-03)
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
  var VELO = "uniform vec4 uVelo; uniform vec2 uVeloAlt; uniform float uVeloOn, uVeloAsp, uPicos;" +
    // cuánto de «cumbre alta» tiene el punto (0 a 1): esas no se funden con nada (Benjamin, 2026-11-02)
    "float picos(float y){ return uPicos * smoothstep(0.32, 0.55, clamp((y - uVeloAlt.x) / (uVeloAlt.y - uVeloAlt.x), 0.0, 1.0)); }" +
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
    " float v = smoothstep(0.0, 0.85, tx + k * 1.1) * smoothstep(0.0, 0.85, ty + k * 1.1)" +
    " * smoothstep(0.0, 0.85, td + k * 1.1) * smoothstep(0.0, 0.85, tb + k * 1.1);" +
    // las cumbres altas no se funden: borde nítido contra el cielo (Benjamin, 2026-11-02: «darle más importancia a la altura de la cordillera»)
    " return mix(v, 1.0, picos(y)); }";
  var pTerreno, pCamino, pBus;
  try {
    pTerreno = programa(
      "attribute vec3 aPos; attribute vec2 aUV; uniform mat4 uMVP; varying vec2 vUV; varying vec3 vPos;" +
      "void main(){ vUV = aUV; vPos = aPos; gl_Position = uMVP * vec4(aPos, 1.0); }",
      "precision mediump float; uniform sampler2D uTex; varying vec2 vUV; varying vec3 vPos; " + NIEBLA + VELO +
      "uniform float uBrillo, uLavado, uVerde, uOpac, uNieve; uniform vec3 uPapel, uBruma;" +
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
      " c = mix(c, t * 1.04, nieve);" +
      // tema claro: la textura de día casi no trae nieve; se agrega por altura, con su sombreado (Benjamin, 2026-11-02:
      // «más nieve en la cordillera, como en el oscuro»)
      " float nv = uNieve * smoothstep(2350.0, 3150.0, h + n * 500.0) * smoothstep(0.08, 0.3, lum);" +
      " return mix(c, vec3(0.96, 0.97, 0.99) * clamp(sombra * 0.85, 0.5, 1.2), nv); }" +
      "void main(){ vec3 t = texture2D(uTex, vUV).rgb; vec3 c = mix(t, pisos(t), uVerde) * uBrillo; c = mix(c, uPapel, uLavado);" +
      " float f = smoothstep(uNiebla.x, uNiebla.y, distance(vPos, uOjo));" +
      " c = mix(c, uBruma, smoothstep(0.0, 1.0, distance(vPos, uOjo) / uNiebla.y) * 0.35 * uVerde);" +
      " float b = smoothstep(0.0, 0.07, vUV.x) * smoothstep(0.0, 0.07, vUV.y) * smoothstep(0.0, 0.07, 1.0 - vUV.x) * smoothstep(0.0, 0.07, 1.0 - vUV.y);" +
      // las cumbres más altas están en el borde este del modelo: ahí no se aplican el fundido del borde ni la neblina
      " float pk = picos(vPos.y); b = mix(b, 1.0, pk); f *= 1.0 - pk;" +
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
    var im = new Image(); im.fetchPriority = "high"; im.onload = function () { alListo(im); }; im.onerror = fallar; im.src = src; return im;   // lo primero que se ve
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
  window.FlotaPortada = { descenso: 0, datos: 0, sim: sim };   // sim: para las pruebas (ritmo en tiempo real con las fichas)
  function suave(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function pose(p) {
    // la cámara espera quieta mientras se lee el panorama y parte cuando empieza a entrar SACEL
    p = Math.max(0, (p - SACEL_ENTRA[0]) / (1 - SACEL_ENTRA[0]));
    for (var k = 1; k < POSES.length && POSES[k][0] < p; k++);
    k = Math.min(k, POSES.length - 1);
    var A = POSES[k - 1], B = POSES[k], t = suave(Math.max(0, Math.min(1, (p - A[0]) / (B[0] - A[0]))));
    var o = lerp(A[1], B[1], t), m = lerp(A[2], B[2], t);
    // siempre con el cielo arriba: desde el 29-oct ya no hay vista cenital al principio
    return { ojo: o, obj: m, arriba: [0, 1, 0] };
  }
  function progreso() {
    if (!recorrido) return 1;                     // con movimiento reducido también parte en el panorama (2026-11-03)
    var r = recorrido.getBoundingClientRect(), largo = r.height - window.innerHeight;
    return largo > 0 ? Math.max(0, Math.min(1, -r.top / largo)) : 0;
  }
  // pan y tilt ligeros en cada parada del relato de SACEL (Benjamin, 2026-11-03): la cámara gira alrededor del objetivo
  // (grados por parada: [giro, elevación]) a medida que entran la flota y el registro
  var PAN_TILT = [[-5, 4], [-5, -3]];
  function panTilt(q) {
    var eF = suave(aFlota), eR = suave(aReporte);
    var giro = (PAN_TILT[0][0] * eF + PAN_TILT[1][0] * eR) * Math.PI / 180, elev = (PAN_TILT[0][1] * eF + PAN_TILT[1][1] * eR) * Math.PI / 180;
    if (!giro && !elev) return q;
    var v = [q.ojo[0] - q.obj[0], q.ojo[1] - q.obj[1], q.ojo[2] - q.obj[2]], L = Math.hypot(v[0], v[1], v[2]);
    var cg = Math.cos(giro), sg = Math.sin(giro), x = v[0] * cg - v[2] * sg, z = v[0] * sg + v[2] * cg;
    var hz = Math.hypot(x, z), ang = Math.atan2(v[1], hz) + elev;
    var o = [q.obj[0] + x / hz * Math.cos(ang) * L, q.obj[1] + Math.sin(ang) * L, q.obj[2] + z / hz * Math.cos(ang) * L];
    return { ojo: o, obj: q.obj, arriba: q.arriba };
  }
  function camara(p) {
    var q = panTilt(pose(p));
    ojo = q.ojo;
    var dist = Math.hypot(q.ojo[0] - q.obj[0], q.ojo[1] - q.obj[1], q.ojo[2] - q.obj[2]);
    var P = perspectiva(FOV * Math.PI / 180, W / H, Math.max(30, dist * 0.004), dist * 6);
    P[8] = -centroMapa();                          // corrimiento de lente: el objetivo queda en el medio del espacio del mapa
    if (W >= 760) P[9] = BAJAR;                    // y un poco más abajo, para que las cumbres no queden bajo la barra fija
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
  var JUGUETE = { cabeceo: 1, balanceo: 0, rebote: 0 };   // sin efecto de juguete (Benjamin, 2026-11-03): sólo la pendiente real
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
      focos.push({ B: B, L: L, base: base, b: b, frente: [x + f[0] * L * 0.55, base[1] + f[1] * L * 0.55 + L * 0.12, z + f[2] * L * 0.55], centro: [x, base[1] + L * 0.2, z] });
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
    gl.uniform1f(gl.getUniformLocation(p, "uPicos"), 1);
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
    var e = suave(aSacel);
    pCam = e;                                     // la cámara baja durante toda la animación
    pDatos = Math.max(0, Math.min(1, (e - 0.55) / 0.45));   // los 4 pasos y la transparencia del mapa, al final
    window.FlotaPortada.descenso = pCam; window.FlotaPortada.datos = pDatos;
    var dist = camara(pCam);
    pintarCielo();
    textos();
    gl.viewport(0, 0, lienzo.width, lienzo.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    var niebla = [dist * 2.2, dist * 6]; nieblaAct = niebla;   // neblina más lejos (antes 1,15 y 3,4): el macizo completo se ve nítido
    // arriba de todo la ruta y los buses van tenues, para que manden las montañas (Benjamin, 2026-10-30); toman fuerza
    // en el primer tramo del descenso
    // la ruta y los buses van tenues desde el comienzo (el mapa ya muestra una flota en ruta, no sólo un paisaje;
    // Benjamin, 2026-11-02) y toman fuerza con SACEL; al pasar sobre «Rastreo satelital de flotas», enteros
    resaltes();
    tenue = 0.4 + 0.6 * suave(Math.max(0, Math.min(1, (pCam - SACEL_ENTRA[0]) / (SACEL_ENTRA[1] - SACEL_ENTRA[0]))));
    tenue = Math.max(tenue, RES.flota, RES.ruta);
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
    gl.uniform1f(gl.getUniformLocation(pTerreno, "uNieve"), TM.nieve || 0);
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
    LUPA.ok = false;
    if (RES.iot > 0.01) lupa2d(RES.iot);

    // capa plana: focos, registro y tramas
    cr.setTransform(1, 0, 0, 1, 0, 0); cr.clearRect(0, 0, capa.width, capa.height); cr.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (RES.ruta > 0.01) ruta(RES.ruta);
    cr.globalCompositeOperation = "lighter"; cr.globalAlpha = tenue;
    focos.forEach(function (f) {
      var q = proyectar(f.frente[0], f.frente[1], f.frente[2]); if (!q) return;
      var r = TM.focos && f.b.v > 0.3 ? 26 * ESCALA : 0, alerta = sim.exceso(f.b);
      if (r) { var g = cr.createRadialGradient(q[0], q[1], 0, q[0], q[1], r); g.addColorStop(0, "rgba(255,230,190,.55)"); g.addColorStop(1, "rgba(255,230,190,0)"); cr.fillStyle = g; cr.fillRect(q[0] - r, q[1] - r, 2 * r, 2 * r); }
      if (alerta) { var c = proyectar(f.centro[0], f.centro[1], f.centro[2]); if (c) { cr.globalAlpha = tenue * veloEn(c[0], c[1], f.centro[1] / EXAG); cr.fillStyle = TM.focos ? "rgba(255,221,180,.22)" : "rgba(196,110,30,.22)"; cr.beginPath(); cr.arc(c[0], c[1], 14 * ESCALA, 0, 7); cr.fill(); cr.globalAlpha = tenue; } }
    });
    cr.globalAlpha = 1;
    cr.globalCompositeOperation = "source-over";
    if (RES.bus > 0.01) focos.forEach(function (f) {          // «Equipos electrónicos»: cada bus lleva un tacógrafo
      var c = proyectar(f.centro[0], f.centro[1], f.centro[2]); if (!c) return;
      cr.strokeStyle = "rgba(" + PULSO[tema].normal + "," + (0.9 * RES.bus).toFixed(3) + ")"; cr.lineWidth = 1.5;
      cr.beginPath(); cr.arc(c[0], c[1], 9 + 3 * Math.sin(sim.reloj * 4), 0, 7); cr.stroke();
    });
    pasoEsp();
    vida();
    aguiluchos();
    especies();
    if (RES.flota > 0.01) fichas(RES.flota);
    pulsos();
    if (pDatos > 0.01) chipsDatos();
    if (aFlota > 0.01) redFlota();
    if (aReporte > 0.01) panelReporte();
    if (pDatos > 0.5) enlacesPasos();
    if (RES.iot > 0.01) iot(RES.iot);
    condores();
    loros();
  }

  // ─── etiquetas del panorama que señalan en el mapa (index.html, .haceres [data-resalta]): flota, nube o bus ───
    var RES = { flota: 0, nube: 0, bus: 0, iot: 0, ruta: 0 }, META = { flota: 0, nube: 0, bus: 0, iot: 0, ruta: 0, especies: 0 }, tRes = 0;
  [].forEach.call(document.querySelectorAll("[data-resalta]"), function (el) {
    var ks = el.getAttribute("data-resalta").split(/\s+/);        // una etiqueta puede señalar varias cosas («flota nube»)
    var espera = 0;
    function activar() { espera = 0; if (ancladoEsp && ks.indexOf("especies") < 0) { ancladoEsp = false; META.especies = 0; } ks.forEach(function (k) { META[k] = 1; }); paso(0); }
    // con «Diseño e investigación» anclado, cruzar otra etiqueta camino al mapa no la cambia: hay que detenerse 0,35 s
    function on(ev) { if (ancladoEsp && ks.indexOf("especies") < 0 && ev && ev.type === "mouseenter") { espera = setTimeout(activar, 350); return; } activar(); }
    function off() { if (espera) { clearTimeout(espera); espera = 0; return; } ks.forEach(function (k) { META[k] = 0; }); paso(0); }
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", function (ev) {
      // «Diseño e investigación»: si el cursor sale hacia el mapa, los detalles siguen y el rótulo lo acompaña
      if (ks.indexOf("especies") >= 0 && ev.clientX > el.getBoundingClientRect().right - 4) { bordeEsp = el.getBoundingClientRect().right; ancladoEsp = true; paso(0); return; }
      off();
    });
    el.addEventListener("focus", on); el.addEventListener("blur", off);
  });
  // «Soporte técnico» (Benjamin, 2026-11-02): se destaca la H-25 entera, con un halo cobre y un brillo que la recorre
  var PASO_RUTA = 3;
  function ruta(op) {
    var pts = [];
    for (var k = 0; k < R.length; k += PASO_RUTA) {
      var x = R[k][0], z = R[k][1], y = elevBase(x, z, ER[k]) + 20, q = proyectar(x, y, z);
      pts.push(q ? [q[0], q[1], veloEn(q[0], q[1], y / EXAG), acumR[k]] : null);
    }
    var col = PULSO[tema].normal, largo = acumR[acumR.length - 1], brillo = (sim.reloj * 0.08) % 1;
    cr.save(); cr.lineCap = "round"; cr.lineJoin = "round";
    [[9, 0.16], [2.6, 0.85]].forEach(function (capa) {
      cr.lineWidth = capa[0];
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i]; if (!a || !b) continue;
        // el brillo: un tramo más claro que avanza por la ruta
        var u = b[3] / largo, d = Math.abs(u - brillo), e = Math.max(0, 1 - Math.min(d, 1 - d) / 0.05);
        cr.strokeStyle = "rgba(" + col + "," + (op * Math.min(a[2], b[2]) * Math.min(1, capa[1] * (1 + e * 0.8))).toFixed(3) + ")";
        cr.beginPath(); cr.moveTo(a[0], a[1]); cr.lineTo(b[0], b[1]); cr.stroke();
      }
    });
    cr.restore();
  }
  function resaltes() {                         // se acercan a su meta en ~0,3 s (de inmediato con movimiento reducido)
    var t = performance.now(), dt = tRes ? Math.min(0.1, (t - tRes) / 1000) : 0; tRes = t;
    for (var k in RES) RES[k] = quieto ? META[k] : RES[k] + (META[k] - RES[k]) * Math.min(1, dt * 8);
  }

  // ─── fichas de los buses (Benjamin, 2026-11-02): al pasar sobre «Rastreo de flotas», una tarjeta semitransparente a la
  // derecha de cada uno de los 3 buses más cerca de la cámara, unida a él por una línea y con su sombra sobre el mapa.
  // Datos de la simulación (no son de un cliente): velocidad y límite del tramo, altitud, km de la ruta, sentido y estado ───
  function fichas(op) {
    var cerca = focos.map(function (f, i) {
      return { f: f, i: i, d: Math.hypot(f.centro[0] - ojo[0], f.centro[1] - ojo[1], f.centro[2] - ojo[2]), c: proyectar(f.centro[0], f.centro[1], f.centro[2]) };
    }).filter(function (o) { return o.c && o.c[0] > 0 && o.c[0] < W && o.c[1] > 0 && o.c[1] < H; })
      .sort(function (a, b) { return a.d - b.d; });
    // dos fichas fijas (Benjamin, 2026-11-02): cada una muestra el bus de su sentido que está más cerca de ella en pantalla
    function masCerca(sube) {
      var A = anclaFicha(sube); if (!A) return null;
      return cerca.filter(function (o) { return (o.f.b.dir > 0) === sube; })
        .sort(function (a, b) { return Math.hypot(a.c[0] - A.p[0], a.c[1] - A.p[1]) - Math.hypot(b.c[0] - A.p[0], b.c[1] - A.p[1]); })[0];
    }
    var sube1 = masCerca(true), baja1 = masCerca(false);
    cerca = [sube1, baja1].filter(Boolean).sort(function (a, b) { return a.c[1] - b.c[1]; });
    var claro = tema === "claro", ANCHO = 180, ALTO = 82;
    cr.save();
    cr.globalAlpha = op;
    cerca.forEach(function (o) {
      var b = o.f.b, s = sim.posicion(b), kmh = Math.round(b.v * 3.6), lim = sim.limiteKmh(s);
      var km = (s * D.largo / sim.LARGO / 1000).toFixed(1).replace(".", ","), alt = Math.round(sim.altitud(s)).toLocaleString("es-CL");
      var estado = b.v < 0.5 ? "Detenido" : kmh > lim ? "Sobre el límite" : "En ruta";   // con la misma velocidad que se muestra
      var sube = (b.dir > 0) ? "subiendo" : "bajando";
      // fija en el mapa (Benjamin, 2026-11-02): flota sobre un punto del relieve a la derecha de la ruta, uno para la
      // ficha de subida y otro para la de bajada; sólo la línea sigue al bus
      var A = anclaFicha(b.dir > 0); if (!A) return;
      var x = Math.min(A.p[0], W - ANCHO - 12), y = A.p[1] - ALTO;
      // su sombra sobre el terreno, como la de la nube de SACEL
      sombraFicha(A, ANCHO);
      // conexión con el bus, en azul Andes
      var azul = claro ? "rgba(0,16,79,.8)" : "rgba(122,152,232,.85)";
      cr.strokeStyle = azul; cr.lineWidth = 1.4;
      cr.beginPath(); cr.moveTo(o.c[0], o.c[1]); cr.lineTo(x, y + ALTO / 2); cr.stroke();
      cr.fillStyle = azul; cr.beginPath(); cr.arc(o.c[0], o.c[1], 3, 0, 7); cr.fill();
      cr.beginPath(); cr.arc(x, y + ALTO / 2, 2.2, 0, 7); cr.fill();
      // tarjeta, con color por sentido (Benjamin, 2026-11-02: «un poco de color»): cálida (cobre) si sube, fría (azul) si baja
      var arriba = b.dir > 0;
      var tinte = arriba ? (claro ? "rgba(255,238,220,.84)" : "rgba(58,34,12,.78)") : (claro ? "rgba(226,234,250,.84)" : "rgba(8,22,64,.80)");
      var franja = arriba ? (claro ? "#8f5213" : "#d99a55") : (claro ? "#2f5fb3" : "#8fb0f0");
      cr.fillStyle = tinte;
      cr.strokeStyle = claro ? "rgba(0,16,79,.14)" : "rgba(242,237,227,.18)";
      redondeado(x, y, ANCHO, ALTO, 10); cr.fill(); cr.stroke();
      cr.save(); redondeado(x, y, ANCHO, ALTO, 10); cr.clip(); cr.fillStyle = franja; cr.fillRect(x, y, 4, ALTO); cr.restore();
      var tinta = claro ? "#00104f" : "#f2ede3", tinta2 = claro ? "rgba(0,16,79,.68)" : "rgba(242,237,227,.72)";
      var alerta = estado === "Sobre el límite", acento = claro ? "#8f5213" : "#d99a55";
      cr.textBaseline = "alphabetic";
      cr.font = "600 12.5px 'DM Sans', sans-serif"; cr.fillStyle = tinta; cr.fillText("Bus " + (o.i + 1) + " · H-25, " + sube, x + 12, y + 20);
      cr.font = "600 20px 'DM Sans', sans-serif"; cr.fillStyle = alerta ? acento : tinta; cr.fillText(kmh + " km/h", x + 12, y + 44);
      var wv = cr.measureText(kmh + " km/h").width;
      cr.font = "400 11.5px 'DM Sans', sans-serif"; cr.fillStyle = tinta2; cr.fillText("límite " + lim, x + 18 + wv, y + 44);
      cr.fillText(alt + " m s. n. m. · km " + km, x + 12, y + 61);
      var colEstado = alerta ? acento : estado === "Detenido" ? (claro ? "#7a7f8f" : "#9aa0b4") : franja;
      cr.fillStyle = colEstado; cr.beginPath(); cr.arc(x + 15, y + 71.5, 3, 0, 7); cr.fill();
      cr.fillStyle = alerta ? acento : tinta2; cr.fillText(estado, x + 22, y + 75);
      cr.font = "500 9px 'Plex Mono', monospace"; cr.fillStyle = tinta2; cr.textAlign = "right"; cr.fillText("simulación", x + ANCHO - 10, y + 75); cr.textAlign = "left";
    });
    cr.restore();
  }
  // anclas de las fichas: a la derecha (este) de la ruta, la de subida más arriba en la ruta que la de bajada; flotan a
  // la altura de la nube de SACEL sobre el terreno
  var ANCLAS = { sube: { s: 0.66, este: 2600 }, baja: { s: 0.30, este: 3200 } };
  function anclaFicha(sube) {
    var a = ANCLAS[sube ? "sube" : "baja"], q = sim.enRuta(a.s * sim.LARGO), x = q[0] + a.este, z = q[1];
    var e = alturaEn(x, z), y = (e + NUBE.altura * 0.55) * EXAG, p = proyectar(x, y, z);
    return p ? { p: p, x: x, z: z, e: e, alto: y - e * EXAG } : null;
  }
  function sombraFicha(A, anchoPx) {           // rectángulo redondeado tendido sobre el terreno, corrido como la sombra de la nube
    var wm = tamPantalla(A.x, A.e * EXAG, A.z, anchoPx), hm = wm * 0.42;
    // corrida al sur (hacia quien mira), así asoma bajo la tarjeta como la sombra de la nube bajo la nube
    var d = A.alto * NUBE.sombra, cx = A.x + d * 0.25 - wm * 0.08, cz = A.z + d + hm * 1.1;
    cr.save();
    if ("filter" in cr) cr.filter = "blur(3px)";
    cr.fillStyle = tema === "claro" ? "rgba(40,30,10,.4)" : "rgba(0,0,6,.5)";   // más transparente (Benjamin, 2026-11-02)
    cr.beginPath();
    for (var k = 0; k <= 48; k++) {
      var t = k / 48 * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      var sx = Math.sign(c) * Math.pow(Math.abs(c), 0.35), sz = Math.sign(s) * Math.pow(Math.abs(s), 0.35);   // casi rectángulo
      var x = cx + wm * 0.5 + sx * wm * 0.5, z = cz + sz * hm * 0.5;
      var q = proyectar(x, alturaEn(x, z) * EXAG + 15, z); if (!q) { cr.restore(); return; }
      if (k) cr.lineTo(q[0], q[1]); else cr.moveTo(q[0], q[1]);
    }
    cr.fill(); cr.restore();
  }
  function redondeado(x, y, w, h, r) {
    cr.beginPath();
    if (cr.roundRect) { cr.roundRect(x, y, w, h, r); return; }
    cr.moveTo(x + r, y); cr.arcTo(x + w, y, x + w, y + h, r); cr.arcTo(x + w, y + h, x, y + h, r); cr.arcTo(x, y + h, x, y, r); cr.arcTo(x, y, x + w, y, r); cr.closePath();
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
    var vis = Math.max(suave(Math.max(0, Math.min(1, (pCam - 0.15) / 0.55))), RES.nube);   // o al pasar sobre «Internet de las cosas»
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
    cr.fillText("SACEL", -26, 2);
    cr.restore();
    cr.globalAlpha = 1;
  }

  // ─── «Hardware e IoT», versión 3 (Benjamin, 2026-11-03): una LUPA circular fija sobre el relieve, unida por una línea
  // al bus destacado. Adentro, una versión simplificada en 2D (reemplaza la segunda cámara 3D de 033755c): el bus de
  // costado, en corte, sobre un fondo difuminado del mismo mapa (el relieve alrededor del bus, desenfocado), con lo
  // esencial: el equipo en el tablero, la antena GPS en el techo y el cable CAN del motor al equipo, con pulsos de cobre.
  // Los arcos del satélite y el pulso a la nube van en el mapa grande, sobre el bus real. El mapa no se mueve ───
  var ANCLA_IOT = { s: 0.40, este: 7000 }, LUPA_R = 96, CADA_IOT = 2.6, busIot = -1;
  var LUPA = { ok: false }, lienzoFondo = null, lienzoBlur = null, FONDO_PX = 32, BLUR_PX = 120;
  function anclaLupa() {
    var q = sim.enRuta(ANCLA_IOT.s * sim.LARGO), x = q[0] + ANCLA_IOT.este, z = q[1], e = alturaEn(x, z);
    return proyectar(x, (e + 400) * EXAG, z);
  }
  function elegirBusIot(cx, cy) {               // el visible más cerca de la lupa (a su izquierda); se mantiene mientras se vea
    function enPantalla(f) { var c = f && proyectar(f.centro[0], f.centro[1], f.centro[2]); return c && c[0] > 0 && c[0] < W && c[1] > 0 && c[1] < H ? c : null; }
    if (enPantalla(focos[busIot])) return busIot;
    var mejor = Infinity; busIot = -1;
    focos.forEach(function (f, i) { var c = enPantalla(f); if (!c) return; var d = Math.hypot(c[0] - (cx - 190), c[1] - cy); if (d < mejor) { mejor = d; busIot = i; } });
    return busIot;
  }
  // se llama recién dibujado el relieve (mismo cuadro, así el lienzo WebGL todavía tiene la imagen): copia el entorno del
  // bus a un lienzo de FONDO_PX × FONDO_PX; al estirarlo al disco (con un blur suave donde el navegador lo soporta) queda
  // desenfocado
  function lupa2d(op) {
    var A = anclaLupa(); if (!A) return;
    var k = elegirBusIot(A[0], A[1]), F = focos[k]; if (!F) return;
    var cb = proyectar(F.centro[0], F.centro[1], F.centro[2]); if (!cb) return;
    if (!lienzoFondo) { lienzoFondo = document.createElement("canvas"); lienzoFondo.width = lienzoFondo.height = FONDO_PX; }
    var lado = 120 * dpr, fx = Math.max(0, Math.min(lienzo.width - lado, cb[0] * dpr - lado / 2)), fy = Math.max(0, Math.min(lienzo.height - lado, cb[1] * dpr - lado / 2));
    // copiar el lienzo WebGL obliga a leerlo de la GPU: se hace al elegir el bus y luego cada 0,4 s (desenfocado, no se nota)
    var ahora = performance.now(), ok = LUPA.fondo && LUPA.F === F;
    if (!ok || ahora - (lupa2d.t || 0) > 400) {
      lupa2d.t = ahora; ok = true;
      var cf = lienzoFondo.getContext("2d");
      try { cf.clearRect(0, 0, FONDO_PX, FONDO_PX); cf.drawImage(lienzo, fx, fy, lado, lado, 0, 0, FONDO_PX, FONDO_PX); } catch (e) { ok = false; }
      // el desenfoque se hace aquí, una vez, en un lienzo chico: con un filtro por cuadro, swiftshader caía a la mitad
      if (ok) {
        if (!lienzoBlur) { lienzoBlur = document.createElement("canvas"); lienzoBlur.width = lienzoBlur.height = BLUR_PX; }
        var cb2 = lienzoBlur.getContext("2d"); cb2.clearRect(0, 0, BLUR_PX, BLUR_PX); cb2.imageSmoothingEnabled = true;
        if ("filter" in cb2) cb2.filter = "blur(4px)";
        cb2.drawImage(lienzoFondo, -8, -8, BLUR_PX + 16, BLUR_PX + 16);
        if ("filter" in cb2) cb2.filter = "none";
      }
    }
    LUPA = { ok: true, x: A[0], y: A[1], r: LUPA_R * (0.6 + 0.4 * op), F: F, fondo: ok };
  }
  // el bus de costado dentro de la lupa, en coordenadas de la lupa (r = radio); mira a la derecha
  function busLupa(op, t, P, col, borde) {
    var x0 = LUPA.x, y0 = LUPA.y, r = LUPA.r, claro = tema === "claro";
    var L = 1.52 * r, Hb = 0.5 * r, izq = x0 - L / 2, der = x0 + L / 2, piso = y0 + 0.24 * r, techo = piso - Hb, rueda = 0.1 * r;
    var tinta = claro ? "0,16,79" : "242,237,227", cobre = "rgb(" + col + ")";
    // el camino, con las rayas corriendo hacia atrás (el bus avanza)
    var suelo = piso + rueda;
    cr.strokeStyle = "rgba(" + tinta + ",.35)"; cr.lineWidth = 1.2; cr.beginPath(); cr.moveTo(x0 - r, suelo); cr.lineTo(x0 + r, suelo); cr.stroke();
    var paso = 0.28 * r, des = quieto ? 0 : (t * 0.9 * r) % paso;
    cr.strokeStyle = "rgba(" + tinta + ",.45)"; cr.lineWidth = 1.6; cr.beginPath();
    for (var xr = x0 - r - des; xr < x0 + r; xr += paso) { cr.moveTo(xr, suelo + 7); cr.lineTo(xr + paso * 0.45, suelo + 7); }
    cr.stroke();
    // la carrocería, translúcida (en corte): caja con el frente redondeado
    function carroceria() {
      cr.beginPath(); cr.moveTo(izq + 6, piso); cr.lineTo(der - 4, piso); cr.quadraticCurveTo(der, piso, der, piso - 6);
      cr.lineTo(der, techo + 16); cr.quadraticCurveTo(der - 2, techo, der - 18, techo); cr.lineTo(izq + 6, techo);
      cr.quadraticCurveTo(izq, techo, izq, techo + 6); cr.lineTo(izq, piso - 6); cr.quadraticCurveTo(izq, piso, izq + 6, piso); cr.closePath();
    }
    carroceria(); cr.fillStyle = claro ? "rgba(255,255,255,.55)" : "rgba(20,24,34,.55)"; cr.fill();
    cr.strokeStyle = "rgba(" + tinta + ",.8)"; cr.lineWidth = 1.5; cr.stroke();
    // ventanas y parabrisas, tenues (rayos X)
    cr.strokeStyle = "rgba(" + tinta + ",.3)"; cr.lineWidth = 1;
    var vy = techo + 0.09 * Hb, vh = 0.27 * Hb, vw = (L - 0.32 * r) / 6;
    for (var v = 0; v < 6; v++) { cr.strokeRect(izq + 0.08 * r + v * vw, vy, vw - 4, vh); }
    cr.beginPath(); cr.moveTo(der - 0.12 * r, vy); cr.lineTo(der - 3, vy); cr.lineTo(der - 1, vy + vh * 1.5); cr.stroke();
    // ruedas que giran
    [izq + 0.2 * L, der - 0.2 * L].forEach(function (cx) {
      cr.beginPath(); cr.arc(cx, piso, rueda, 0, 7); cr.fillStyle = claro ? "rgba(40,44,60,.85)" : "rgba(10,12,18,.9)"; cr.fill();
      cr.strokeStyle = "rgba(" + tinta + ",.8)"; cr.lineWidth = 1.2; cr.stroke();
      var g = quieto ? 0 : t * 6; cr.strokeStyle = "rgba(255,255,255,.55)"; cr.lineWidth = 1; cr.beginPath();
      for (var s = 0; s < 3; s++) { var a = g + s * 2.094; cr.moveTo(cx, piso); cr.lineTo(cx + Math.cos(a) * rueda * 0.7, piso + Math.sin(a) * rueda * 0.7); }
      cr.stroke();
    });
    // el motor, atrás
    var mx = izq + 0.05 * r, my = piso - 0.6 * Hb, mw = 0.24 * r, mh = 0.22 * Hb;
    cr.fillStyle = claro ? "rgba(70,78,104,.85)" : "rgba(150,160,190,.75)"; cr.fillRect(mx, my, mw, mh);
    cr.strokeStyle = "rgba(" + tinta + ",.6)"; cr.lineWidth = 1; cr.strokeRect(mx, my, mw, mh);
    cr.beginPath(); for (var a2 = 1; a2 < 4; a2++) { cr.moveTo(mx + a2 * mw / 4, my + 3); cr.lineTo(mx + a2 * mw / 4, my + mh - 3); } cr.stroke();
    // el equipo, sobre el tablero (adelante)
    var ex = der - 0.26 * r, ey = piso - 0.62 * Hb, ew = 0.15 * r, eh = 0.11 * r;
    cr.fillStyle = cobre; cr.fillRect(ex, ey, ew, eh);
    cr.strokeStyle = "rgba(" + tinta + ",.7)"; cr.strokeRect(ex, ey, ew, eh);
    cr.fillStyle = claro ? "rgba(255,255,255,.85)" : "rgba(20,24,34,.85)"; cr.fillRect(ex + 2, ey + 2, ew * 0.55, eh - 4);   // la pantalla
    cr.strokeStyle = "rgba(" + tinta + ",.5)"; cr.beginPath(); cr.moveTo(ex + ew / 2, ey + eh); cr.lineTo(ex + ew / 2, piso - 3); cr.stroke();   // su pie
    // la antena GPS, en el techo sobre el equipo, con su onda
    var ax = ex + ew / 2, ay = techo;
    cr.fillStyle = cobre; cr.beginPath(); cr.ellipse(ax, ay - 2, 7, 3.2, 0, Math.PI, 0); cr.fill();
    cr.strokeStyle = cobre; cr.lineWidth = 1.6; cr.beginPath(); cr.moveTo(ax, ay - 4); cr.lineTo(ax, ay - 0.16 * r); cr.stroke();
    var fo = quieto ? 0.4 : (t * 0.5) % 1; cr.strokeStyle = "rgba(" + col + "," + (0.85 * (1 - fo)).toFixed(3) + ")"; cr.lineWidth = 1.3;
    cr.beginPath(); cr.arc(ax, ay - 0.16 * r, 3 + fo * 14, Math.PI * 1.15, Math.PI * 1.85); cr.stroke();
    cr.setLineDash([2, 3]); cr.strokeStyle = "rgba(" + tinta + ",.45)"; cr.lineWidth = 1;
    cr.beginPath(); cr.moveTo(ax, ay); cr.lineTo(ax, ey); cr.stroke(); cr.setLineDash([]);
    // el cable CAN, por el piso, del motor al equipo, con pulsos de cobre
    var cam = [[mx + mw, my + mh * 0.6], [mx + mw + 0.06 * r, piso - 0.3 * Hb], [ex - 0.1 * r, piso - 0.3 * Hb], [ex, ey + eh * 0.6]];
    cr.strokeStyle = "rgba(" + tinta + ",.55)"; cr.lineWidth = 1.8; cr.beginPath();
    cam.forEach(function (q, i) { if (i) cr.lineTo(q[0], q[1]); else cr.moveTo(q[0], q[1]); }); cr.stroke();
    var tramos = [], largo = 0;
    for (var i = 1; i < cam.length; i++) { var dl = Math.hypot(cam[i][0] - cam[i - 1][0], cam[i][1] - cam[i - 1][1]); tramos.push(dl); largo += dl; }
    for (var j = 0; j < 3; j++) {
      var f = quieto ? (j + 0.5) / 3 : (t * 0.45 + j / 3) % 1, sq = f * largo, n = 0;
      while (n < tramos.length - 1 && sq > tramos[n]) { sq -= tramos[n]; n++; }
      var w = tramos[n] ? sq / tramos[n] : 0, q = [cam[n][0] + (cam[n + 1][0] - cam[n][0]) * w, cam[n][1] + (cam[n + 1][1] - cam[n][1]) * w];
      var g = cr.createRadialGradient(q[0], q[1], 0, q[0], q[1], 6);
      g.addColorStop(0, "rgba(" + col + "," + (0.95 * Math.sin(f * Math.PI)).toFixed(3) + ")"); g.addColorStop(1, "rgba(" + col + ",0)");
      cr.fillStyle = g; cr.beginPath(); cr.arc(q[0], q[1], 6, 0, 7); cr.fill();
    }
    return { mastil: [ax, ay - 0.16 * r], can: [(cam[1][0] + cam[2][0]) / 2, cam[1][1] - 9] };
  }
  function iot(op) {
    if (!LUPA.ok) return;
    var F = LUPA.F, cb = proyectar(F.centro[0], F.centro[1], F.centro[2]); if (!cb) return;
    var P = PULSO[tema], col = P.normal, borde = "rgba(" + P.borde + ",", t = quieto ? 0.35 : performance.now() / 1000;
    cr.save(); cr.globalAlpha = op; cr.lineCap = "round"; cr.lineJoin = "round";
    // en el mapa grande: el bus destacado y la línea hasta la lupa
    cr.strokeStyle = "rgba(" + col + ",.95)"; cr.lineWidth = 1.8;
    cr.beginPath(); cr.arc(cb[0], cb[1], 10 + 2.5 * Math.sin(t * 4), 0, 7); cr.stroke();
    var ang = Math.atan2(cb[1] - LUPA.y, cb[0] - LUPA.x), bx = LUPA.x + Math.cos(ang) * LUPA.r, by = LUPA.y + Math.sin(ang) * LUPA.r;
    cr.beginPath(); cr.moveTo(cb[0] - Math.cos(ang) * 12, cb[1] - Math.sin(ang) * 12); cr.lineTo(bx, by);
    cr.strokeStyle = P.caja; cr.lineWidth = 4; cr.stroke(); cr.strokeStyle = borde + ".75)"; cr.lineWidth = 1.4; cr.stroke();
    // el aro de la lupa, con su sombra
    cr.save(); cr.shadowColor = tema === "claro" ? "rgba(0,16,79,.25)" : "rgba(0,0,0,.6)"; cr.shadowBlur = 16; cr.shadowOffsetY = 6;
    cr.strokeStyle = borde + ".9)"; cr.lineWidth = 2.2; cr.beginPath(); cr.arc(LUPA.x, LUPA.y, LUPA.r, 0, 7); cr.stroke(); cr.restore();
    // GPS: el satélite sobre la cordillera manda arcos al bus real
    var sat = [Math.min(W - 40, LUPA.x + LUPA.r * 0.9), Math.max(H * 0.14, LUPA.y - 260)];
    var a = Math.atan2(cb[1] - sat[1], cb[0] - sat[0]), dist = Math.hypot(cb[0] - sat[0], cb[1] - sat[1]);
    for (var k = 0; k < 3; k++) {
      var u = (t * 0.5 + k / 3) % 1, rr = 10 + u * (dist - 10);
      cr.strokeStyle = "rgba(" + col + "," + (0.7 * (1 - u)).toFixed(3) + ")"; cr.lineWidth = 1.4;
      cr.beginPath(); cr.arc(sat[0], sat[1], rr, a - 0.22, a + 0.22); cr.stroke();
    }
    cr.strokeStyle = borde + ".9)"; cr.fillStyle = P.caja; cr.lineWidth = 1;
    cr.save(); cr.translate(sat[0], sat[1]); cr.rotate(-0.5); cr.scale(1.35, 1.35);
    [[-4, -4, 8, 8], [-17, -3, 10, 6], [7, -3, 10, 6]].forEach(function (q) { cr.fillRect(q[0], q[1], q[2], q[3]); cr.strokeRect(q[0], q[1], q[2], q[3]); });
    cr.beginPath(); cr.moveTo(-7, 0); cr.lineTo(-4, 0); cr.moveTo(4, 0); cr.lineTo(7, 0); cr.stroke();
    cr.restore();
    // del bus real sale un pulso de cobre a la nube (mismo arco que acelera de las tramas)
    var sw = posSwitch();
    if (sw && sw.vis > 0.05) {
      var v = quieto ? 0.6 : (t % CADA_IOT) / CADA_IOT, o = cb;
      var mx = (o[0] + sw.x) / 2, my = Math.min(o[1], sw.y) - 0.25 * Math.hypot(sw.x - o[0], sw.y - o[1]);
      var arco = function (u) { u = (Math.exp(6 * u) - 1) / (Math.exp(6) - 1); var m = 1 - u; return [m * m * o[0] + 2 * m * u * mx + u * u * sw.x, m * m * o[1] + 2 * m * u * my + u * u * sw.y]; };
      cr.lineWidth = 2;
      for (var e = 0; e < 14; e++) {
        var t1 = Math.max(0, v - e * 0.015), t0 = Math.max(0, v - (e + 1) * 0.015); if (t1 <= 0) break;
        var p1 = arco(t1), p0 = arco(t0);
        cr.strokeStyle = "rgba(" + col + "," + ((1 - e / 14) * Math.min(1, (1 - v) / 0.05)).toFixed(3) + ")";
        cr.beginPath(); cr.moveTo(p0[0], p0[1]); cr.lineTo(p1[0], p1[1]); cr.stroke();
      }
    }
    // dentro de la lupa: el fondo difuminado del mapa alrededor del bus, un velo de papel y el bus en 2D
    cr.save(); cr.beginPath(); cr.arc(LUPA.x, LUPA.y, LUPA.r - 1, 0, 7); cr.clip();
    cr.fillStyle = TM.cielo[0]; cr.fillRect(LUPA.x - LUPA.r, LUPA.y - LUPA.r, 2 * LUPA.r, 2 * LUPA.r);
    if (LUPA.fondo) {
      cr.imageSmoothingEnabled = true; cr.imageSmoothingQuality = "high";
      cr.drawImage(lienzoBlur || lienzoFondo, LUPA.x - LUPA.r * 1.2, LUPA.y - LUPA.r * 1.2, LUPA.r * 2.4, LUPA.r * 2.4);
    }
    cr.fillStyle = P.caja; cr.globalAlpha = op * 0.35; cr.fillRect(LUPA.x - LUPA.r, LUPA.y - LUPA.r, 2 * LUPA.r, 2 * LUPA.r); cr.globalAlpha = op;
    var pz = busLupa(op, t, P, col, borde);
    cr.restore();
    // rótulos, con halo del papel
    cr.font = "500 11px 'Plex Mono', monospace"; cr.textBaseline = "middle"; cr.lineWidth = 3.5; cr.strokeStyle = P.caja; cr.fillStyle = P.texto;
    function rotulo(txt, x, y, al) { cr.textAlign = al; cr.strokeText(txt, x, y); cr.fillText(txt, x, y); }
    rotulo("GPS", sat[0] + 26, sat[1] - 14, "left");
    rotulo("GPS", pz.mastil[0] + 8, pz.mastil[1] - 6, "left");
    rotulo("CAN bus", pz.can[0], pz.can[1], "center");
    cr.restore();
  }

  // ─── paradas 1–3 del relato de SACEL en el mapa (Benjamin, 2026-11-03) ───
  function acelU(u) { return (Math.exp(4 * u) - 1) / (Math.exp(4) - 1); }   // sale lento y llega rápido
  function arcoNube(o, sw, u) {                  // el mismo arco de las tramas, del bus a la nube
    var mx = (o[0] + sw.x) / 2, my = Math.min(o[1], sw.y) - 0.25 * Math.hypot(sw.x - o[0], sw.y - o[1]), m = 1 - u;
    return [m * m * o[0] + 2 * m * u * mx + u * u * sw.x, m * m * o[1] + 2 * m * u * my + u * u * sw.y];
  }
  function busesEnPantalla() {
    var out = [];
    focos.forEach(function (f) { var c = proyectar(f.centro[0], f.centro[1], f.centro[2]); if (c && c[0] > 0 && c[0] < W && c[1] > 0 && c[1] < H) out.push(c); });
    return out;
  }
  // 1) chips con nombre que salen de los buses hacia la nube: uno cada CADA_CHIP s, de un bus distinto cada vez
  var DATOS_CHIP = ["km/h", "GPS", "conductor", "CAN bus"], CADA_CHIP = 0.9, VUELO_CHIP = 2.2;
  function chipsDatos() {
    var sw = posSwitch(); if (!sw || sw.vis < 0.3) return;
    var bs = busesEnPantalla(); if (!bs.length) return;
    var op = pDatos * (1 - 0.75 * suave(aFlota)) * (1 - suave(aReporte)); if (op <= 0.02) return;
    var P = PULSO[tema], t = quieto ? 3.1 : performance.now() / 1000, n = Math.floor(t / CADA_CHIP);
    cr.save(); cr.font = "500 11px 'Plex Mono', monospace"; cr.textAlign = "center"; cr.textBaseline = "middle";
    for (var k = n - Math.ceil(VUELO_CHIP / CADA_CHIP); k <= n; k++) {
      var u = (t - k * CADA_CHIP) / VUELO_CHIP; if (u < 0 || u > 1) continue;
      var o = bs[((k % bs.length) + bs.length) % bs.length], q = arcoNube(o, { x: sw.x, y: sw.y + 6 }, acelU(u)), txt = DATOS_CHIP[((k % 4) + 4) % 4];
      var w = cr.measureText(txt).width + 14;
      cr.globalAlpha = op * Math.min(1, u / 0.08) * Math.min(1, (1 - u) / 0.15);
      cr.beginPath(); if (cr.roundRect) cr.roundRect(q[0] - w / 2, q[1] - 10, w, 20, 10); else cr.rect(q[0] - w / 2, q[1] - 10, w, 20);
      cr.fillStyle = P.caja; cr.fill(); cr.strokeStyle = "rgba(" + P.normal + ",.95)"; cr.lineWidth = 1.3; cr.stroke();
      cr.fillStyle = P.texto; cr.fillText(txt, q[0], q[1] + 0.5);
    }
    cr.restore();
  }
  // 2) la flota: cada bus con su anillo y su línea a la nube, con un pulso de cobre que sube
  function redFlota() {
    var sw = posSwitch(); if (!sw) return;
    var P = PULSO[tema], op = suave(aFlota) * (1 - 0.55 * suave(aReporte)), t = quieto ? 0.6 : performance.now() / 1000;
    cr.save(); cr.lineCap = "round";
    busesEnPantalla().forEach(function (o, i) {
      cr.globalAlpha = op;
      cr.strokeStyle = "rgba(" + P.borde + ",.35)"; cr.lineWidth = 1; cr.beginPath(); cr.moveTo(o[0], o[1]);
      var mx = (o[0] + sw.x) / 2, my = Math.min(o[1], sw.y) - 0.25 * Math.hypot(sw.x - o[0], sw.y - o[1]);
      cr.quadraticCurveTo(mx, my, sw.x, sw.y + 6); cr.stroke();
      cr.strokeStyle = "rgba(" + P.normal + ",.95)"; cr.lineWidth = 1.6; cr.beginPath(); cr.arc(o[0], o[1], 9, 0, 7); cr.stroke();
      var f = ((t / 2.2) + i * 0.27) % 1, q = arcoNube(o, { x: sw.x, y: sw.y + 6 }, acelU(f));
      var g = cr.createRadialGradient(q[0], q[1], 0, q[0], q[1], 6);
      g.addColorStop(0, "rgba(" + P.normal + "," + (0.95 * Math.sin(f * Math.PI)).toFixed(3) + ")"); g.addColorStop(1, "rgba(" + P.normal + ",0)");
      cr.fillStyle = g; cr.beginPath(); cr.arc(q[0], q[1], 6, 0, 7); cr.fill();
    });
    cr.restore();
  }
  // 3) el panel que se despliega desde la nube: el registro de los buses simulados (los segmentos que guarda la
  // simulación: conducción, descanso o detención, y exceso de velocidad), en los últimos 30 min simulados
  var panelRect = null;
  function panelReporte() {
    var sw = posSwitch(); if (!sw) return;
    var P = PULSO[tema], claro = tema === "claro", e = suave(aReporte), bs = sim.buses, n = bs.length;
    var pw = Math.min(440, W * 0.34), fila = 22, ph = 64 + fila * n + 26;
    // al costado derecho de la H-25 (Benjamin, 2026-11-03: para repartir la información en la página): a la altura del
    // medio de la ruta en pantalla, a la derecha del punto más a la derecha de la ruta en esa franja
    var rp = [];
    for (var ir = 0; ir < R.length; ir += 4) { var qr = proyectar(R[ir][0], alturaEn(R[ir][0], R[ir][1]) * EXAG, R[ir][1]); if (qr) rp.push(qr); }
    var ys = rp.map(function (q) { return q[1]; }).sort(function (a, b) { return a - b; }), ym = ys.length ? ys[ys.length >> 1] : H / 2;
    var y0 = Math.max(96, Math.min(H - ph - 56, ym - ph / 2)), xr = 0;
    rp.forEach(function (q) { if (q[1] > y0 - 20 && q[1] < y0 + ph + 20) xr = Math.max(xr, q[0]); });
    var x0 = Math.max(W * 0.45, Math.min(W - pw - 24, xr + 44));
    panelRect = { x: x0, y: y0, w: pw, h: ph };
    var tinta = claro ? "0,16,79" : "242,237,227", cob = P.normal;
    cr.save(); cr.globalAlpha = e;
    // de la nube baja el panel: una línea y la caja que se abre hacia abajo
    cr.strokeStyle = "rgba(" + P.borde + ",.5)"; cr.setLineDash([3, 4]); cr.lineWidth = 1;
    cr.beginPath(); cr.moveTo(sw.x, sw.y + 14); cr.lineTo(Math.max(x0 + 20, Math.min(x0 + pw - 20, sw.x)), y0); cr.stroke(); cr.setLineDash([]);
    var hv = ph * (0.3 + 0.7 * e);
    cr.save(); cr.shadowColor = claro ? "rgba(0,16,79,.18)" : "rgba(0,0,0,.5)"; cr.shadowBlur = 14; cr.shadowOffsetY = 5;
    cr.beginPath(); if (cr.roundRect) cr.roundRect(x0, y0, pw, hv, 12); else cr.rect(x0, y0, pw, hv); cr.fillStyle = P.caja; cr.fill(); cr.restore();
    cr.strokeStyle = "rgba(" + P.borde + ",.35)"; cr.lineWidth = 1; cr.stroke();
    cr.beginPath(); cr.rect(x0, y0, pw, hv); cr.clip();
    cr.fillStyle = "rgb(" + tinta + ")"; cr.font = "600 14px 'Archivo', 'DM Sans', sans-serif"; cr.textAlign = "left"; cr.textBaseline = "alphabetic";
    cr.fillText("Registro de la flota", x0 + 16, y0 + 26);
    cr.font = "500 10.5px 'Plex Mono', monospace"; cr.fillStyle = "rgba(" + tinta + ",.7)";
    cr.fillText("conducción y descanso · últimos 30 min", x0 + 16, y0 + 44);
    var gx = x0 + 58, gw = pw - 58 - 60, top = y0 + 60, pps = gw / VENTANA_REG, reloj = sim.reloj, revela = e;
    bs.forEach(function (b, r) {
      var y = top + r * fila;
      cr.fillStyle = "rgba(" + tinta + ",.75)"; cr.textAlign = "right"; cr.textBaseline = "middle"; cr.fillText("Bus " + (r + 1), gx - 10, y + 6);
      cr.fillStyle = "rgba(" + tinta + ",.07)"; cr.fillRect(gx, y, gw, 12);
      var cond = 0, tot = 0;
      b.fila.forEach(function (sg) {
        var d0 = Math.max(sg[0], reloj - VENTANA_REG), d1 = sg[1]; if (d1 <= d0) return;
        tot += d1 - d0; if (sg[2]) cond += d1 - d0;
        var x1 = gx + gw - (reloj - d0) * pps, x2 = gx + gw - (reloj - d1) * pps;
        x1 = Math.max(x1, gx + gw * (1 - revela)); if (x2 <= x1) return;      // se dibuja de derecha a izquierda al abrirse
        if (sg[2] === 0) { cr.fillStyle = "rgba(" + cob + ",.32)"; cr.fillRect(x1, y + 3, x2 - x1, 6); }
        else { cr.fillStyle = sg[2] === 2 ? "rgba(" + cob + ",1)" : "rgba(" + tinta + ",.85)"; cr.fillRect(x1, y, x2 - x1, 12); }
      });
      cr.textAlign = "left"; cr.fillStyle = "rgba(" + tinta + ",.75)";
      cr.fillText(tot > 1 ? Math.round(100 * cond / tot) + " %" : "—", gx + gw + 10, y + 6);
    });
    // leyenda
    var ly = top + n * fila + 10, lx = gx;
    [["conducción", "rgba(" + tinta + ",.85)", 12], ["descanso", "rgba(" + cob + ",.32)", 6], ["exceso", "rgba(" + cob + ",1)", 12]].forEach(function (l) {
      cr.fillStyle = l[1]; cr.fillRect(lx, ly - l[2] / 2, 10, l[2]); cr.fillStyle = "rgba(" + tinta + ",.75)"; cr.textAlign = "left"; cr.fillText(l[0], lx + 14, ly);
      lx += 14 + cr.measureText(l[0]).width + 16;
    });
    cr.textAlign = "right"; cr.fillText("% conducción", gx + gw + 52, ly);
    cr.restore();
  }

  // las líneas que unen los pasos destacados del texto con lo que muestran en el mapa, con el número del paso
  function txtW(dest) { cr.font = "600 11px 'Plex Mono', monospace"; return Math.max(20, cr.measureText(dest.map(function (k) { return k + 1; }).join(" · ")).width + 12); }
  function enlacesPasos() {
    var nv = Math.round(pAct * PARADAS_MAPA), dest = PASOS_PARADA[nv] || []; if (!dest.length || !heroe) return;
    var e = nv === 1 ? pDatos * (1 - suave(aFlota)) : (nv === 2 ? suave(aFlota) * (1 - suave(aReporte)) : suave(aReporte)); if (e <= 0.02) return;
    var P = PULSO[tema], lis = heroe.querySelectorAll(".sacel-datos .pasos li"), b0 = lienzo.getBoundingClientRect(), meta = null;
    var bs = busesEnPantalla(), sw = posSwitch();
    if (nv === 1 && bs.length) meta = bs.reduce(function (m, q) { return q[0] < m[0] ? q : m; });      // el bus más a la izquierda
    if (nv === 2 && sw) meta = [sw.x, sw.y + 12];                                                      // donde llegan las líneas
    if (nv === 3 && panelRect) meta = [panelRect.x, panelRect.y + 30];
    if (!meta) return;
    cr.save(); cr.globalAlpha = e; cr.lineCap = "round";
    dest.forEach(function (k, j) {
      var li = lis[k]; if (!li) return;
      var r = li.getBoundingClientRect(), h3 = li.querySelector("h3"), rh = h3 ? h3.getBoundingClientRect() : r;
      var a = [Math.min(r.right, rh.right + 12) - b0.left, rh.top + rh.height / 2 - b0.top];
      cr.strokeStyle = "rgba(" + P.normal + ",.75)"; cr.lineWidth = 1.2; cr.setLineDash([3, 4]);
      cr.beginPath(); cr.moveTo(a[0] + 6, a[1]);
      // los de la columna izquierda bajan primero por debajo de la lista, para no cruzar el paso de al lado
      var lista = li.parentNode.getBoundingClientRect(), izq = k % 2 === 0, yb = lista.bottom - b0.top + 14 + j * 6;
      if (izq) { cr.lineTo(a[0] + 6, yb - 8); cr.quadraticCurveTo(a[0] + 6, yb, a[0] + 14, yb); a = [a[0] + 14, yb]; }
      var mx = a[0] + (meta[0] - a[0]) * 0.55;
      cr.bezierCurveTo(mx, a[1], mx, meta[1], meta[0] - 10 - (txtW(dest) + 0), meta[1]); cr.stroke(); cr.setLineDash([]);
      a = [Math.min(r.right, rh.right + 12) - b0.left, rh.top + rh.height / 2 - b0.top];
      cr.fillStyle = "rgba(" + P.normal + ",.95)"; cr.beginPath(); cr.arc(a[0] + 6, a[1], 2.4, 0, 7); cr.fill();
    });
    // el número del paso, en el destino
    var txt = dest.map(function (k) { return k + 1; }).join(" · ");
    cr.font = "600 11px 'Plex Mono', monospace"; cr.textAlign = "center"; cr.textBaseline = "middle";
    var w = Math.max(20, cr.measureText(txt).width + 12), bx = meta[0] - 10 - w / 2, by = meta[1];   // pastilla entre la línea y el destino
    cr.beginPath(); if (cr.roundRect) cr.roundRect(bx - w / 2, by - 10, w, 20, 10); else cr.rect(bx - w / 2, by - 10, w, 20);
    cr.fillStyle = P.caja; cr.fill(); cr.strokeStyle = "rgba(" + P.normal + ",.95)"; cr.lineWidth = 1.3; cr.stroke();
    cr.fillStyle = "rgb(" + P.normal + ")"; cr.fillText(txt, bx, by + 0.5);
    cr.restore();
  }

  // ─── flora y fauna del sector (Benjamin, 2026-10-30; especies de iNaturalist en el recuadro Rancagua–Sewell) ───
  // quiscos en las laderas de solana bajas y quillayes en las de umbría (los zorros se quitaron el 30-oct).
  // Van con el relieve (mismo velo, niebla y color) y se esconden detrás de las lomas; al final se transparentan con
  // un desfase respecto de él (opacVida).
  // Plantas uniformes en reposo (Benjamin, 2026-11-03): las 9 especies dibujadas de informe.md §5 se ven siempre, todas
  // del tono del relieve, sin distinguir registro real de modelado. Las reales van en sus registros de iNaturalist
  // (datos/especies-h25.js, de A10; sólo coordenadas abiertas; los repetidos a menos de 60–80 m se juntan); las modeladas
  // completan unas TOTAL_PLANTAS (risk-006: el mismo costo de antes) repartidas según cuántos registros tiene cada especie
  // y puestas con un modelo de hábitat: la altura de sus registros (altitud_registros_m) y su exposición (pesos de solana,
  // umbría, río/quebrada y plano/fondo de valle), cerca de donde se registró. Al activar «Diseño e investigación» se ve la
  // diversidad (especies(), más abajo)
  var TOTAL_PLANTAS = 200;
  var PLANTAS = ["quisco", "quillay", "colliguay", "litre", "espino", "boldo", "peumo", "bollen", "chagual"];
  // grupo de cada una para el color de la etapa 1: cactus, árboles esclerófilos, arbustos y bromelia
  var GRUPO = { quisco: "cactus", quillay: "arbol", litre: "arbol", espino: "arbol", boldo: "arbol", peumo: "arbol", bollen: "arbol",
                colliguay: "arbusto", chagual: "bromelia" };
  var ESP = (window.ESPECIES_H25 && window.ESPECIES_H25.especies) || [];
  function especie(clave) { return ESP.filter(function (x) { return x.c === clave; })[0]; }
  function registrosDe(clave, junta) {
    var e = especie(clave), out = [];
    (e ? e.r : []).forEach(function (r) { if (!out.some(function (q) { return Math.hypot(q[0] - r[0], q[1] - r[1]) < junta; })) out.push([r[0], r[1]]); });
    return out;
  }
  var seres = null;
  function cercaDeRuta(x, z, d) {
    for (var i = 0; i < R.length; i++) if (Math.abs(R[i][0] - x) < d && Math.abs(R[i][1] - z) < d && Math.hypot(R[i][0] - x, R[i][1] - z) < d) return true;
    return false;
  }
  // exposición del relieve en un punto, con las mismas clases que el informe: q río/quebrada (hondonada), p plano o fondo
  // de valle, s solana (ladera que mira al norte) o u umbría
  function exposicion(x, z) {
    var h = alturaEn(x, z), d = 300;
    var hn = alturaEn(x, z + d), hs = alturaEn(x, z - d), he = alturaEn(x + d, z), ho = alturaEn(x - d, z);
    if ((hn + hs + he + ho) / 4 - h > 22) return "q";
    var gz = (hn - hs) / (2 * d), gx = (he - ho) / (2 * d);
    if (Math.hypot(gx, gz) < 0.06) return "p";
    return gz > 0 ? "s" : "u";
  }
  function prepararVida() {
    var semilla = 29;
    function az() { semilla = (semilla * 1664525 + 1013904223) >>> 0; return semilla / 4294967296; }
    function sorteo(pesos) {                       // una clave al azar según sus pesos
      var tot = 0, k; for (k in pesos) tot += pesos[k];
      var u = az() * tot; for (k in pesos) { u -= pesos[k]; if (u <= 0) return k; }
      return k;
    }
    seres = [];
    var reales = {}, nReales = 0, nRegs = 0;
    PLANTAS.forEach(function (c) { reales[c] = registrosDe(c, c === "quisco" || c === "quillay" ? 80 : 60); nReales += reales[c].length; nRegs += (especie(c) || { r: [] }).r.length; });
    var libres = Math.max(0, TOTAL_PLANTAS - nReales);
    function forma(c) { return { brazos: c === "quisco" ? (az() < 0.7 ? (az() < 0.5 ? 1 : 2) : 0) : 0 }; }
    PLANTAS.forEach(function (c) {
      var e = especie(c); if (!e) return;
      reales[c].forEach(function (q) { var o = forma(c); o.tipo = c; o.x = q[0]; o.z = q[1]; o.t = 0.95 + az() * 0.2; o.real = true; seres.push(o); });
      // las modeladas: dentro de 2,5 km de sus registros, en su franja de altura (con algo de holgura) y con la exposición
      // sorteada según sus pesos; si no hay lugar con esa exposición, sólo la altura
      var n = Math.round(libres * e.r.length / Math.max(1, nRegs)), a = e.a || [600, 1100], hab = e.h || { s: 1 };
      var x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      e.r.forEach(function (r) { x0 = Math.min(x0, r[0]); x1 = Math.max(x1, r[0]); z0 = Math.min(z0, r[1]); z1 = Math.max(z1, r[1]); });
      x0 -= 2500; x1 += 2500; z0 -= 2500; z1 += 2500;
      for (var k = 0; k < n; k++) {
        var quiere = sorteo(hab), p = null;
        for (var t = 0; t < 160 && !p; t++) {
          var x = x0 + az() * (x1 - x0), z = z0 + az() * (z1 - z0), h = alturaEn(x, z);
          if (h < a[0] - 80 || h > a[1] + 150 || cercaDeRuta(x, z, 320)) continue;
          if (t < 110 && exposicion(x, z) !== quiere) continue;
          p = [x, z];
        }
        if (p) { var o = forma(c); o.tipo = c; o.x = p[0]; o.z = p[1]; o.t = 0.8 + az() * 0.45; seres.push(o); }
      }
    });
    // el turno de cada una en la etapa 1 (el color corre del valle a la cordillera)
    var xs = seres.map(function (o) { return o.x; }), xa = Math.min.apply(null, xs), xb = Math.max.apply(null, xs);
    seres.forEach(function (o) { o.orden = (o.x - xa) / Math.max(1, xb - xa); });
  }
  function aLaVista(x, y, z) {                     // ¿alguna loma tapa el punto? se recorre el rayo hacia la cámara
    for (var k = 1; k < 14; k++) {
      var t = k / 14 * 0.6, px = x + (ojo[0] - x) * t, py = y + (ojo[1] - y) * t, pz = z + (ojo[2] - z) * t;
      if (alturaEn(px, pz) * EXAG > py + 10) return false;
    }
    return true;
  }
  var COLORES_VIDA = {
    // en reposo, tonos cercanos al relieve que los rodea, apenas más oscuros (Benjamin, 2026-10-30: que se integren), los
    // mismos para todas; «grupos» es el color de la etapa 1 de «Diseño e investigación» (2026-11-03)
    claro:  { cactus: [86, 102, 70], tronco: [104, 92, 76], copa: [84, 98, 64], copa2: [112, 124, 88],
              grupos: { cactus: [24, 120, 112], arbol: [44, 104, 36], arbusto: [150, 136, 20], bromelia: [124, 70, 150] },
              otras: [70, 74, 96], introducida: [150, 92, 40] },
    oscuro: { cactus: [30, 36, 44], tronco: [26, 28, 34], copa: [26, 32, 40], copa2: [40, 48, 58],
              grupos: { cactus: [96, 210, 196], arbol: [126, 204, 104], arbusto: [226, 206, 96], bromelia: [204, 160, 234] },
              otras: [196, 202, 220], introducida: [236, 184, 128] }
  };
  function mezcla(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  // el color de grupo de un registro: las plantas por su grupo (según su clave o su forma de vida), las introducidas en
  // cobre y la fauna y las demás nativas en tinta
  function colorRegistro(e, C) {
    if (e.i) return C.introducida;
    var g = GRUPO[e.c] || { cactus: "cactus", "árbol": "arbol", arbusto: "arbusto", bromelia: "bromelia" }[e.g];
    return g ? C.grupos[g] : C.otras;
  }
  // el mismo tratamiento de color que el relieve en su shader: lavado hacia el papel y niebla por distancia
  function comoMapa(c, f) {
    var l = TM.lavado * suave(pCam), r = [];
    for (var i = 0; i < 3; i++) {
      var v = c[i] / 255; v = v + (TM.papel[i] - v) * l; v = v + (TM.niebla[i] - v) * f * 0.7;
      r.push(Math.round(Math.max(0, Math.min(1, v)) * 255));
    }
    return "rgb(" + r.join(",") + ")";
  }

  // ─── «Diseño e investigación» (Benjamin, 2026-11-03): al pasar el mouse aparece la diversidad que en reposo no se
  // distingue, como señal del detalle que Andes pone en sus equipos: 1) las plantas toman el color de su grupo (cactus,
  // árboles esclerófilos, arbustos, bromelia), del valle a la cordillera; 2) se encienden los registros reales de
  // iNaturalist (punto lleno; fauna y exóticas también, como puntos) y las modeladas quedan tenues, con un anillo hueco;
  // 3) un rótulo con el nombre común y científico de la especie más cercana al cursor, «registro iNaturalist · <fecha>» y,
  // si está amenazada, su categoría del RCE. Una leyenda chica en la esquina libre del mapa, sólo mientras dura. Al salir
  // se apaga en orden inverso; con movimiento reducido, todo junto. etapaEsp va de 0 a 3 (una unidad por etapa) ───
  // (2026-11-03, tarde) Benjamin: se veía con pocos fps y sin reactividad. Ahora todo aparece junto y rápido: sin
  // paquetes, sin turnos de oeste a este y sin destellos; las etapas son sólo el orden (color, registros, rótulo)
  var DUR_SUBIDA_ESP = 0.22;
  var etapaEsp = 0, tEsp = 0, DUR_ETAPA_ESP = 0.18, cursor = null, ancladoEsp = false, bordeEsp = 0;
  function aparece(e) {                         // 0–1 dentro de una etapa (todos a la vez)
    return Math.max(0, Math.min(1, e));
  }
  // el extremo izquierdo del mapa, junto a la columna del texto, queda sin especies (Benjamin, 2026-11-03): factor 0–1 según
  // la x en pantalla, con un fundido de 90 px desde el borde del velo + 230 px
  function lejosDelTexto(x, mv) { return Math.max(0, Math.min(1, (x - (mv[0] + 230)) / 90)); }
  function pasoEsp() {
    var t = performance.now(), dt = tEsp ? Math.min(0.1, (t - tEsp) / 1000) : 0; tEsp = t;
    var meta = META.especies ? 3 : 0;
    // sube despacio (DUR_SUBIDA_ESP por etapa) y baja rápido (DUR_ETAPA_ESP)
    etapaEsp = quieto ? meta : etapaEsp + Math.max(-dt / DUR_ETAPA_ESP, Math.min(dt / DUR_SUBIDA_ESP, meta - etapaEsp));
  }
  document.addEventListener("pointermove", function (ev) {
    var b = lienzo.getBoundingClientRect(); cursor = [ev.clientX - b.left, ev.clientY - b.top];
    // el resalte sigue mientras el cursor recorre el mapa; se suelta al volver a la columna del texto
    if (ancladoEsp && (ev.clientX < bordeEsp - 4 || pCam > 0.1)) { ancladoEsp = false; META.especies = 0; paso(0); }
  }, { passive: true });
  document.addEventListener("pointerleave", function () { if (ancladoEsp) { ancladoEsp = false; META.especies = 0; paso(0); } });
  // las 9 plantas, del mismo tamaño de juguete; g (0–1) lleva la copa del tono del relieve al color de su grupo
  function silueta(o, q, f, C, fn, g) {
    var x = q[0], y = q[1], k = f * o.t, cg = C.grupos[GRUPO[o.tipo]];
    var copa = comoMapa(mezcla(o.tipo === "quisco" ? C.cactus : C.copa, cg, g), fn), copa2 = comoMapa(mezcla(C.copa2, mezcla(cg, [255, 255, 255], 0.3), g), fn), tronco = comoMapa(C.tronco, fn);
    function grad(cx, cy, r) { var g = cr.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.1, cx, cy, r * 1.1); g.addColorStop(0, copa2); g.addColorStop(1, copa); return g; }
    function palo(h) { cr.strokeStyle = tronco; cr.lineWidth = 1.2 * f; cr.beginPath(); cr.moveTo(x, y); cr.lineTo(x, y - h); cr.stroke(); }
    switch (o.tipo) {
      case "quisco":                             // columna con uno o dos brazos
        var hq = 8 * k;
        cr.strokeStyle = copa; cr.lineWidth = 1.6 * f;
        cr.beginPath(); cr.moveTo(x, y); cr.lineTo(x, y - hq);
        if (o.brazos > 0) { cr.moveTo(x, y - hq * 0.45); cr.lineTo(x - hq * 0.28, y - hq * 0.45); cr.lineTo(x - hq * 0.28, y - hq * 0.78); }
        if (o.brazos > 1) { cr.moveTo(x, y - hq * 0.3); cr.lineTo(x + hq * 0.25, y - hq * 0.3); cr.lineTo(x + hq * 0.25, y - hq * 0.62); }
        cr.stroke();
        break;
      case "quillay":                            // tronco corto y copa redonda, más clara arriba
        var r = 4.2 * k;
        palo(r * 1.1); cr.fillStyle = grad(x, y - r * 1.5, r);
        cr.beginPath(); cr.arc(x, y - r * 1.5, r, 0, 7); cr.fill();
        break;
      case "colliguay":                          // mata redonda y baja, de a tres
        cr.fillStyle = grad(x, y - 2.5 * k, 3.5 * k);
        [[-3.2, 0, 2.6], [0, -0.6, 3.2], [3.2, 0, 2.4]].forEach(function (m) { cr.beginPath(); cr.arc(x + m[0] * k, y - 2.2 * k + m[1] * k, m[2] * k, Math.PI, 0); cr.fill(); });
        break;
      case "litre":                              // copa ancha, irregular y achaparrada
        palo(3 * k); cr.fillStyle = grad(x, y - 5 * k, 6 * k);
        cr.beginPath(); cr.ellipse(x, y - 5 * k, 6.2 * k, 3.2 * k, 0, 0, 7); cr.fill();
        cr.beginPath(); cr.arc(x + 3 * k, y - 6.5 * k, 2.6 * k, 0, 7); cr.fill();
        break;
      case "espino":                             // copa aparasolada y rala sobre un tronco corto, con espinas
        palo(5 * k); cr.fillStyle = copa;
        cr.beginPath(); cr.ellipse(x, y - 6.2 * k, 6 * k, 1.8 * k, 0, 0, 7); cr.fill();
        cr.strokeStyle = tronco; cr.lineWidth = 0.8 * f; cr.beginPath();
        for (var s = -2; s <= 2; s++) { cr.moveTo(x + s * 2.2 * k, y - 6.2 * k); cr.lineTo(x + s * 2.6 * k, y - 4.6 * k); }
        cr.stroke();
        break;
      case "boldo":                              // copa densa y ovalada
        palo(2.5 * k); cr.fillStyle = grad(x, y - 6 * k, 4.2 * k);
        cr.beginPath(); cr.ellipse(x, y - 6 * k, 3.8 * k, 4.2 * k, 0, 0, 7); cr.fill();
        break;
      case "peumo":                              // copa alta y ovalada, más alta que ancha
        palo(3 * k); cr.fillStyle = grad(x, y - 8 * k, 5.5 * k);
        cr.beginPath(); cr.ellipse(x, y - 8 * k, 3.4 * k, 5.6 * k, 0, 0, 7); cr.fill();
        break;
      case "bollen":                             // árbol pequeño de copa cónica
        palo(2 * k); cr.fillStyle = grad(x, y - 6 * k, 5 * k);
        cr.beginPath(); cr.moveTo(x, y - 11 * k); cr.lineTo(x + 3.6 * k, y - 2 * k); cr.lineTo(x - 3.6 * k, y - 2 * k); cr.closePath(); cr.fill();
        break;
      case "chagual":                            // roseta de hojas espinosas con una vara floral alta
        cr.strokeStyle = copa; cr.lineWidth = 1.1 * f; cr.beginPath();
        for (var h = -3; h <= 3; h++) { cr.moveTo(x, y); cr.lineTo(x + h * 1.3 * k, y - (3.2 - Math.abs(h) * 0.6) * k); }
        cr.stroke();
        cr.strokeStyle = tronco; cr.lineWidth = 1 * f; cr.beginPath(); cr.moveTo(x, y - 1 * k); cr.lineTo(x + 0.6 * k, y - 13 * k); cr.stroke();
        cr.fillStyle = copa2; cr.beginPath(); cr.ellipse(x + 0.7 * k, y - 13.5 * k, 1.3 * k, 2.6 * k, 0, 0, 7); cr.fill();
        break;
    }
  }
  var puntosEsp = null;
  function prepararPuntos() {                    // todos los registros, del valle (oeste) a la cordillera (este)
    puntosEsp = [];
    ESP.forEach(function (e) { e.r.forEach(function (r) { puntosEsp.push({ e: e, x: r[0], z: r[1], fecha: r[2], lat: r[4], lon: r[5] }); }); });
    puntosEsp.sort(function (a, b) { return a.x - b.x; });
    puntosEsp.forEach(function (p, k) { p.orden = k / Math.max(1, puntosEsp.length - 1); });
  }
  var R_DISCO = 8, ALFA_FAUNA = 0.6, lienzoEsp = null, crEsp = null, claveEsp = "", visEsp = [];
  // sobre el relieve claro los colores de grupo se lavan más: discos algo más opacos
  var ALFA_TEMA = { claro: { disco: 0.58, modelado: 0.3 }, oscuro: { disco: 0.42, modelado: 0.2 } };
  function especies() {
    if (!alturas || etapaEsp <= 0.005 || !ESP.length) { if (aCoord && !aCoord.hidden) { cajaEsp = null; enlaceCoord(null); } return; }
    if (!puntosEsp) prepararPuntos();
    var C = COLORES_VIDA[tema], P = PULSO[tema], claro = tema === "claro", mejor = null, dMejor = Infinity;
    var ref = cursor || [W * 0.72, H * 0.5], qFijo = null;
    // los discos se dibujan en un lienzo aparte, que se rehace sólo si cambia la cámara, la etapa o el tema; los puntos
    // visibles quedan en visEsp para buscar el más cercano al cursor en cada cuadro
    var ap = aparece(etapaEsp - 1);
    var vp = VP ? Array.prototype.map.call(VP, function (v) { return v.toFixed(5); }).join(",") : "";
    var clave = [vp, ap.toFixed(3), opacVida.toFixed(3), tema, capa.width, capa.height, dpr].join("|");
    if (!lienzoEsp) { lienzoEsp = document.createElement("canvas"); crEsp = lienzoEsp.getContext("2d"); }
    if (clave !== claveEsp) {
      claveEsp = clave; visEsp = [];
      if (lienzoEsp.width !== capa.width || lienzoEsp.height !== capa.height) { lienzoEsp.width = capa.width; lienzoEsp.height = capa.height; }
      crEsp.setTransform(1, 0, 0, 1, 0, 0); crEsp.clearRect(0, 0, lienzoEsp.width, lienzoEsp.height); crEsp.setTransform(dpr, 0, 0, dpr, 0, 0);
      var mv = medidasVelo();
      if (ap > 0.01) puntosEsp.forEach(function (p) {
        var y = alturaEn(p.x, p.z) * EXAG, q = proyectar(p.x, y, p.z); if (!q || q[0] < 0 || q[0] > W || q[1] < 0 || q[1] > H) return;
        var lt = lejosDelTexto(q[0], mv); if (lt <= 0.02) return;
        if (!aLaVista(p.x, y, p.z)) return;
        var dc = Math.hypot(p.x - ojo[0], y - ojo[1], p.z - ojo[2]), fn = Math.max(0, Math.min(1, (dc - nieblaAct[0]) / (nieblaAct[1] - nieblaAct[0])));
        var a = veloEn(q[0], q[1], y / EXAG) * (1 - 0.6 * fn) * opacVida * ap * lt; if (a <= 0.02) return;
        // ● registro iNaturalist (Benjamin, 2026-11-03): un disco grande y translúcido del color de su grupo; los que se
        // sobreponen suman color, así donde hay más registros el color se ve más sólido. Al centro, un punto chico
        crEsp.fillStyle = "rgb(" + colorRegistro(p.e, C).join(",") + ")";
        crEsp.globalAlpha = a * ALFA_TEMA[tema].disco * (GRUPO[p.e.c] || p.e.i || /cactus|árbol|arbusto|bromelia/.test(p.e.g) ? 1 : ALFA_FAUNA);
        crEsp.beginPath(); crEsp.arc(q[0], q[1], R_DISCO, 0, 7); crEsp.fill();
        crEsp.globalAlpha = a * 0.9; crEsp.beginPath(); crEsp.arc(q[0], q[1], 1.3, 0, 7); crEsp.fill();
        if (p.e.f && a > 0.3) visEsp.push({ p: p, q: q });
      });
    }
    cr.save(); cr.setTransform(1, 0, 0, 1, 0, 0); cr.globalAlpha = 1; cr.drawImage(lienzoEsp, 0, 0); cr.restore();
    cr.save();
    visEsp.forEach(function (v) {
      var d = Math.hypot(v.q[0] - ref[0], v.q[1] - ref[1]); if (d < dMejor) { dMejor = d; mejor = v; }
      if (cajaEsp && v.p === cajaEsp.p) qFijo = v.q;
    });
    // c) el rótulo de la especie más cercana al cursor; mientras el cursor esté sobre el rótulo (p. ej. camino al enlace de
    // las coordenadas) se mantiene el mismo registro
    var al = Math.max(0, Math.min(1, etapaEsp - 2));
    if (cajaEsp && qFijo && cursor && cursor[0] > cajaEsp.x0 - 8 && cursor[0] < cajaEsp.x1 + 8 && cursor[1] > cajaEsp.y0 - 8 && cursor[1] < cajaEsp.y1 + 8) mejor = { p: cajaEsp.p, q: qFijo };
    if (!mejor || al <= 0.01) { cajaEsp = null; enlaceCoord(null); }
    leyenda(Math.max(0, Math.min(1, etapaEsp)), C, P, claro);
    if (mejor && al > 0.01) {
      var m = mejor, x = m.q[0], y0 = m.q[1];
      cr.globalAlpha = al;
      cr.strokeStyle = "rgba(" + P.borde + ",.9)"; cr.lineWidth = 1.4; cr.beginPath(); cr.arc(x, y0, 6, 0, 7); cr.stroke();
      var tx = x + 12, ty = y0 - 30, l1 = m.p.e.n, l2 = m.p.e.s, l3 = "registro iNaturalist · " + m.p.fecha + (m.p.e.i ? " · introducida" : "");
      cr.font = "600 13px 'DM Sans', sans-serif"; var w = cr.measureText(l1).width;
      cr.font = "italic 12.5px 'Source Serif', serif"; w = Math.max(w, cr.measureText(l2).width);
      cr.font = "500 10.5px 'Plex Mono', monospace"; w = Math.max(w, cr.measureText(l3).width);
      var l4 = m.p.e.rce || "";                  // p. ej. «NT · Casi amenazada (RCE)», sólo si está amenazada
      if (l4) { cr.font = "600 10.5px 'Plex Mono', monospace"; w = Math.max(w, cr.measureText(l4).width); }
      if (tx + w > W - 12) tx = x - 12 - w;
      cr.beginPath(); cr.moveTo(x + (tx > x ? 5 : -5), y0 - 4); cr.lineTo(tx + (tx > x ? -3 : w + 3), ty + 4); cr.lineWidth = 1; cr.stroke();
      cr.textBaseline = "middle"; cr.textAlign = "left"; cr.lineJoin = "round"; cr.lineWidth = 4; cr.strokeStyle = P.caja; cr.fillStyle = P.texto;
      function linea(txt, fuente, yy, color) { cr.font = fuente; cr.strokeText(txt, tx, yy); cr.fillStyle = color || P.texto; cr.fillText(txt, tx, yy); }
      var tinta = claro ? "#00104f" : "#f2ede3";
      linea(l1, "600 13px 'DM Sans', sans-serif", ty, tinta);
      linea(l2, "italic 12.5px 'Source Serif', serif", ty + 16, tinta);
      linea(l3, "500 10.5px 'Plex Mono', monospace", ty + 31);
      if (l4) linea(l4, "600 10.5px 'Plex Mono', monospace", ty + 45, claro ? "#8a3c12" : "#f0b07a");
      // las coordenadas del registro, como enlace a Google Maps (un <a> sobre el lienzo, en la línea siguiente)
      var yc = ty + (l4 ? 59 : 45);
      enlaceCoord(m.p, tx, yc, al);
      cajaEsp = { p: m.p, x0: Math.min(x, tx), x1: Math.max(x, tx + Math.max(w, 150)), y0: ty - 10, y1: yc + 10 };
    }
    cr.restore();
  }
  // enlace a Google Maps con la latitud y longitud del registro del rótulo (Benjamin, 2026-11-03); sólo se toca el DOM
  // cuando cambia algo
  var cajaEsp = null, aCoord = null, estadoCoord = "";
  function gms(v, pos, neg) { return Math.abs(v).toFixed(4).replace(".", ",") + "° " + (v >= 0 ? pos : neg); }
  function enlaceCoord(p, x, y, al) {
    if (!aCoord) {
      aCoord = document.createElement("a"); aCoord.className = "coord-esp"; aCoord.target = "_blank"; aCoord.rel = "noopener";
      lienzo.parentNode.appendChild(aCoord);
    }
    var ok = p && p.lat != null && al > 0.05;
    var est = ok ? [p.lat, p.lon, Math.round(x), Math.round(y), al > 0.5 ? 1 : 0, (al * 20 | 0)].join("|") : "";
    if (est === estadoCoord) return; estadoCoord = est;
    if (!ok) { aCoord.hidden = true; aCoord.tabIndex = -1; return; }
    aCoord.hidden = false; aCoord.tabIndex = al > 0.5 ? 0 : -1;
    aCoord.href = "https://www.google.com/maps/search/?api=1&query=" + p.lat + "," + p.lon;
    aCoord.textContent = gms(p.lat, "N", "S") + " · " + gms(p.lon, "E", "O") + " ↗";
    aCoord.setAttribute("aria-label", "Ver el registro de " + p.e.n + " en Google Maps (" + aCoord.textContent.replace(" ↗", "") + ")");
    aCoord.style.left = Math.round(x) + "px"; aCoord.style.top = Math.round(y) + "px";
    aCoord.style.opacity = al.toFixed(2); aCoord.style.pointerEvents = al > 0.5 ? "auto" : "none";
  }
  // la leyenda de «Diseño e investigación», abajo a la derecha (la esquina libre del mapa, sobre «Pausar animación»)
  function leyenda(al, C, P, claro) {
    if (al <= 0.01) return;
    var filas = [["cactus", "Cactus"], ["arbol", "Árboles esclerófilos"], ["arbusto", "Arbustos"], ["bromelia", "Bromelia"]];
    var x1 = W - 22, alto = 15, y0 = H - 62 - (filas.length + 2) * alto, ancho = 204, x0 = x1 - ancho, tinta = claro ? "#00104f" : "#f2ede3";
    cr.save(); cr.globalAlpha = al;
    cr.fillStyle = P.caja; cr.globalAlpha = al * 0.86;
    cr.beginPath(); cr.roundRect ? cr.roundRect(x0 - 10, y0 - 12, ancho + 20, (filas.length + 2) * alto + 14, 6) : cr.rect(x0 - 10, y0 - 12, ancho + 20, (filas.length + 2) * alto + 14); cr.fill();
    cr.globalAlpha = al; cr.textBaseline = "middle"; cr.textAlign = "left";
    cr.font = "500 10.5px 'Plex Mono', monospace";
    filas.forEach(function (f, k) {
      var y = y0 + k * alto;
      cr.fillStyle = "rgb(" + C.grupos[f[0]].join(",") + ")"; cr.fillRect(x0, y - 4, 12, 8);
      cr.fillStyle = tinta; cr.fillText(f[1], x0 + 20, y);
    });
    var y = y0 + filas.length * alto + 4, gris = "rgb(" + C.otras.join(",") + ")";
    cr.fillStyle = gris; cr.globalAlpha = al * ALFA_TEMA[tema].disco; cr.beginPath(); cr.arc(x0 + 6, y, 5.5, 0, 7); cr.fill();
    cr.globalAlpha = al; cr.beginPath(); cr.arc(x0 + 6, y, 1.3, 0, 7); cr.fill();
    cr.fillStyle = tinta; cr.fillText("registro iNat", x0 + 20, y);
    cr.fillStyle = gris; cr.globalAlpha = al * ALFA_TEMA[tema].modelado * 1.4; cr.beginPath(); cr.arc(x0 + 122, y, 5.5, 0, 7); cr.fill(); cr.globalAlpha = al;
    cr.fillText("modelado", x0 + 132, y);
    y += alto;
    cr.fillStyle = gris; cr.beginPath(); cr.arc(x0 + 6, y, 2.6, 0, 7); cr.fill();
    cr.fillStyle = tinta; cr.fillText("fauna", x0 + 20, y);
    cr.fillStyle = "rgb(" + C.introducida.join(",") + ")"; cr.beginPath(); cr.arc(x0 + 122, y, 2.6, 0, 7); cr.fill();
    cr.fillStyle = tinta; cr.fillText("introducida", x0 + 132, y);
    cr.restore();
  }
  // el aguilucho (informe.md §5): planea en círculos sobre sus registros, solo y más bajo que los cóndores (etapa 2, con los registros)
  function aguiluchos() {
    var ap = Math.max(0, Math.min(1, etapaEsp - 1)); if (ap <= 0.01 || !alturas) return;   // con los registros (etapa 2)
    var regs = registrosDe("aguilucho", 400), t = sim.reloj, col = tema === "claro" ? "28,26,34" : "214,218,232";
    cr.save(); cr.lineCap = "round"; cr.lineJoin = "round";
    regs.slice(0, 3).forEach(function (r, k) {
      var a = t * 0.12 + k * 2.1, x = r[0] + Math.cos(a) * 500, z = r[1] + Math.sin(a) * 380;
      var y = (alturaEn(x, z) + 300) * EXAG, q = proyectar(x, y, z); if (!q) return;
      var al = Math.min(1, veloEn(q[0], q[1], y / EXAG) * opacVida * ap * opacFauna()); if (al <= 0.02) return;
      var sp = 6 * Math.max(0.7, Math.min(1.6, 2600 / tamPantalla(x, y, z, 100)));
      cr.globalAlpha = al; cr.strokeStyle = "rgba(" + col + ",.9)"; cr.lineWidth = 1.6;
      cr.beginPath(); cr.moveTo(q[0] - sp, q[1] + sp * 0.12); cr.quadraticCurveTo(q[0] - sp * 0.45, q[1] - sp * 0.28, q[0], q[1]);
      cr.quadraticCurveTo(q[0] + sp * 0.45, q[1] - sp * 0.28, q[0] + sp, q[1] + sp * 0.12); cr.stroke();
      cr.beginPath(); cr.moveTo(q[0], q[1]); cr.lineTo(q[0], q[1] + sp * 0.35); cr.stroke();   // cola corta
    });
    cr.restore();
  }

  // Transparencia de la flora y fauna (Benjamin, 2026-11-03): en reposo, más transparentes que antes; cuando el mapa se
  // activa (hover de cualquier tarjeta del panorama), más opacas, para que se integren al mapa como parte del mini mapa.
  // Multiplica el alfa de las plantas, el aguilucho, los loros y los cóndores
  var FAUNA_REPOSO = 0.5, FAUNA_ACTIVO = 1.15;
  function opacFauna() {
    var act = Math.min(1, Math.max(RES.flota, RES.nube, RES.bus, RES.iot, RES.ruta, etapaEsp));
    return FAUNA_REPOSO + (FAUNA_ACTIVO - FAUNA_REPOSO) * act;
  }
  // las plantas se dibujan en un lienzo aparte y se redibujan sólo cuando cambia algo que las mueve o las tiñe (cámara,
  // etapa, transparencias, tema, tamaño); el resto de los cuadros se copia de una vez (risk-006: el raster de ~200 siluetas
  // por cuadro costaba ~1 fps en swiftshader)
  var lienzoVida = null, crVida = null, claveVida = "";
  function vida() {
    if (!alturas || opacVida <= 0.02) return;
    if (!seres) prepararVida();
    var vp = VP ? Array.prototype.map.call(VP, function (v) { return v.toFixed(5); }).join(",") : "";
    var clave = [vp, pCam.toFixed(4), etapaEsp.toFixed(3), opacVida.toFixed(3), opacFauna().toFixed(3), tema, capa.width, capa.height, dpr, nieblaAct[0].toFixed(0), nieblaAct[1].toFixed(0)].join("|");
    if (!lienzoVida) { lienzoVida = document.createElement("canvas"); crVida = lienzoVida.getContext("2d"); }
    if (clave !== claveVida) {
      claveVida = clave;
      if (lienzoVida.width !== capa.width || lienzoVida.height !== capa.height) { lienzoVida.width = capa.width; lienzoVida.height = capa.height; }
      var crMapa = cr; cr = crVida;
      cr.setTransform(1, 0, 0, 1, 0, 0); cr.clearRect(0, 0, lienzoVida.width, lienzoVida.height); cr.setTransform(dpr, 0, 0, dpr, 0, 0);
      try { dibujarVida(); } finally { cr = crMapa; }
    }
    cr.save(); cr.setTransform(1, 0, 0, 1, 0, 0); cr.globalAlpha = 1; cr.drawImage(lienzoVida, 0, 0); cr.restore();
  }
  function dibujarVida() {
    var C = COLORES_VIDA[tema], fa = opacFauna();
    cr.save(); cr.lineCap = "round"; cr.lineJoin = "round";
    var e2 = Math.max(0, Math.min(1, etapaEsp - 1));   // etapa 2: las modeladas quedan tenues y huecas
    var mv = medidasVelo();                        // una vez por cuadro (lee el estilo del documento)
    seres.forEach(function (o) {
      var x = o.x, z = o.z;
      var y = alturaEn(x, z) * EXAG;
      var q = proyectar(x, y, z); if (!q || q[0] < -20 || q[0] > W + 20 || q[1] < -20 || q[1] > H + 20) return;
      if (!aLaVista(x, y, z)) return;
      // alfa igual al del relieve en ese punto: velo × (1 − 0,75 niebla) × opacidad del mapa, para que se vean como parte de él
      var dc = Math.hypot(x - ojo[0], y - ojo[1], z - ojo[2]), fn = Math.max(0, Math.min(1, (dc - nieblaAct[0]) / (nieblaAct[1] - nieblaAct[0])));
      fn = fn * fn * (3 - 2 * fn);
      // abajo a la izquierda (inicio de la H-25, junto al texto) van más tenues, para que no resalten (2026-10-30)
      var izq = 1 - Math.max(0, Math.min(1, (q[0] - mv[0]) / (W * 0.3))), baja = Math.max(0, Math.min(1, (q[1] / H - 0.45) / 0.35));
      var a2 = veloEn(q[0], q[1], y / EXAG) * (1 - 0.75 * fn) * opacVida * (1 - 0.7 * izq * baja) * lejosDelTexto(q[0], mv); if (a2 <= 0.02) return;
      var f = 0.8 * Math.max(0.55, Math.min(1.8, 2600 / tamPantalla(x, y, z, 100)));   // tamaño de juguete, según la distancia (60 % del primero)
      var g = aparece(etapaEsp), tenue = o.real ? 1 : 1 - 0.65 * e2;
      a2 = Math.min(1, a2 * fa);
      cr.globalAlpha = a2 * tenue;
      silueta(o, q, f, C, fn, g);
      if (!o.real && e2 > 0.01) {                  // modelado: un disco del color del grupo, más tenue que el de un registro
        cr.globalAlpha = Math.min(1, a2 * 1.6) * e2 * ALFA_TEMA[tema].modelado;
        cr.fillStyle = "rgb(" + C.grupos[GRUPO[o.tipo]].map(Math.round).join(",") + ")";
        cr.beginPath(); cr.arc(q[0], q[1], R_DISCO, 0, 7); cr.fill();
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
      var a = Math.min(1, veloEn(q[0], q[1], y / EXAG) * Math.min(1, u / 0.06) * Math.min(1, (1 - u) / 0.06) * opacFauna()); if (a <= 0.02) return;
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
      a = Math.min(1, a * opacFauna()); if (a <= 0.02) return;
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
  }
  // con las fichas de «Rastreo de flotas» a la vista, la simulación pasa a tiempo real (Benjamin, 2026-11-02: datos
  // plausibles): el ritmo baja de 1 a 1/ESCALA_SIM a medida que aparecen las fichas (RES.flota)
  var ESCALA_SIM = ACELERACION_TIEMPO * VELOCIDAD_BUSES;
  function paso(dt) {
    // la parada de SACEL (Benjamin, 2026-11-02: tres paradas en una): el scroll elige la meta y la animación va sola
    // con reloj propio (no el dt del ciclo, que se recorta a 50 ms por cuadro): dura DUR_SACEL aunque el equipo sea lento
    nivelMapa = Math.round(pAct * PARADAS_MAPA);
    var meta = nivelMapa >= 1 ? 1 : 0, ahora = performance.now(), dReal = tSacel ? Math.min(0.25, (ahora - tSacel) / 1000) : 0;
    tSacel = ahora;
    if (quieto || (!dt && !window.FlotaCicloAndando)) aSacel = meta;
    else aSacel = meta > aSacel ? Math.min(meta, aSacel + dReal / DUR_SACEL) : Math.max(meta, aSacel - dReal / DUR_SACEL);
    // flota y reporte, cuando SACEL ya está completo
    var mF = nivelMapa >= 2 && aSacel > 0.98 ? 1 : 0, mR = nivelMapa >= 3 && aFlota > 0.98 ? 1 : 0;
    if (quieto || (!dt && !window.FlotaCicloAndando)) { aFlota = nivelMapa >= 2 ? 1 : 0; aReporte = nivelMapa >= 3 ? 1 : 0; }
    else {
      aFlota = mF > aFlota ? Math.min(1, aFlota + dReal / DUR_NIVEL) : Math.max(mF, aFlota - (mR ? 0 : dReal / DUR_NIVEL));
      aReporte = mR > aReporte ? Math.min(1, aReporte + dReal / DUR_NIVEL) : Math.max(mR, aReporte - dReal / DUR_NIVEL);
    }
    if (dt) sim.avanzar(dt * (1 + (1 / ESCALA_SIM - 1) * Math.max(RES.flota, RES.iot)));
    if (listo === 2 && alturas) dibujar();
  }   // la simulación corre desde el comienzo: cóndores y buses ya andan cuando se ven

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
    // con movimiento reducido el ciclo no corre ni escucha el scroll: aquí se redibuja al cruzar entre el panorama y
    // SACEL, de golpe (2026-11-03)
    if (quieto) window.addEventListener("scroll", function () {
      var p = progreso(); if (Math.round(p * PARADAS_MAPA) === Math.round(pAct * PARADAS_MAPA)) { pAct = p; return; }
      pAct = p; paso(0); textos();
    }, { passive: true });
  }
  // --sacel y --datos para .heroe; el enlace de la capa que no se ve sale del orden del tabulador
  var capaVisible = null, pasoDestacado = "x";
  function textos() {
    if (!heroe) return;
    var pc = suave(aSacel);
    var s = suave(Math.max(0, Math.min(1, (pc - SACEL_ENTRA[0]) / (SACEL_ENTRA[1] - SACEL_ENTRA[0]))));
    var d = suave(Math.max(0, Math.min(1, (pc - 0.5) / 0.4)));
    heroe.style.setProperty("--sacel", s.toFixed(3));
    heroe.style.setProperty("--datos", d.toFixed(3));
    // en las paradas 2 y 3 se destaca su paso: Operación (la flota) y Registro y cumplimiento (el panel)
    // cada parada destaca sus pasos: 1) Captura a bordo y Transmisión (los datos); 2) Operación (la flota); 3) Registro y
    // cumplimiento (el panel). enlacesPasos() los une con lo que muestran en el mapa
    var nv = Math.round(pAct * PARADAS_MAPA), dest = PASOS_PARADA[nv] || [];
    if (dest.join() !== pasoDestacado) {
      pasoDestacado = dest.join();
      heroe.querySelectorAll(".sacel-datos .pasos li").forEach(function (li, i) { var d = dest.indexOf(i) >= 0; li.classList.toggle("destacado", d); li.classList.toggle("atenuado", dest.length > 0 && !d); });
    }
    var v = s > 0.5 ? "sacel" : "empresa";
    if (v === capaVisible) return; capaVisible = v;
    heroe.setAttribute("data-capa", v);           // la capa que no se ve no toma el puntero (base.css)
    heroe.querySelectorAll(".capa-sacel a").forEach(function (a) { if (v === "sacel") a.removeAttribute("tabindex"); else a.setAttribute("tabindex", "-1"); });
  }
  }
})();
