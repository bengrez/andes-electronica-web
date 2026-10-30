/* Clientes del inicio: la grilla de la matriz del 29-oct, pero cada casilla es una ficha de tablero de paletas
   (split-flap) de terminal antigua (Benjamin, 2026-10-30): el logo en una paleta grande con dos bisagras, el nombre en
   dos líneas y el rubro. Cada tanto una ficha cambia de cliente y sus paletas giran. La lista <ul class="logos"
   data-matriz> sigue en la página para lectores de pantalla; las fichas son decorativas. Sin JS queda la lista; con
   movimiento reducido, las fichas quietas con todos los clientes. */
(function () {
  "use strict";
  var lista = document.querySelector("ul[data-matriz]");
  if (!lista) return;
  var quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var RUBROS = { pasajeros: "Pasajeros", tren: "Ferrocarril", metro: "Metro", armada: "Naval", mineria: "Minería",
                 turismo: "Turismo", transportes: "Transportes" };   // etiqueta sobre cada ficha
  // figuras de rubro (las de la matriz del 29-oct): la paleta grande pasa por ellas antes de quedar en el logo
  var FIGURAS = [
    '<rect x="4" y="11" width="40" height="23" rx="3"/><path d="M4 22h40M11 11v11M19 11v11M27 11v11M35 11v11"/><circle cx="13" cy="35" r="4"/><circle cx="35" cy="35" r="4"/>',
    '<rect x="12" y="5" width="24" height="31" rx="6"/><path d="M12 20h24M18 11h12"/><circle cx="18" cy="28" r="1.6"/><circle cx="30" cy="28" r="1.6"/><path d="M16 36l-5 7M32 36l5 7M13.5 40h21"/>',
    '<circle cx="24" cy="8.5" r="3.5"/><path d="M24 12v31M16 18h16M8 30c2 8 9 13 16 13s14-5 16-13M8 30l-3 4M8 30l5 1M40 30l3 4M40 30l-5 1"/>',
    '<path d="M9 31c0-9 6.5-15.5 15-15.5S39 22 39 31"/><path d="M4 31h40l-2 5H6z"/><path d="M20 16.5V31M28 16.5V31"/>',
    '<path d="M3 41l14-21 8 11 6-8 14 18z"/><path d="M12.5 26.5l4.5-6.5 3.5 5"/>',
    '<rect x="3" y="12" width="26" height="21" rx="1.5"/><path d="M29 18h8l7 8v7H29z"/><path d="M33 18v8h11"/><circle cx="11" cy="35" r="4"/><circle cx="36" cy="35" r="4"/>'
  ];
  var ANCHO = 13, FICHAS = 8;                 // paletas por línea (13: cabe FERROCARRILES); fichas en la grilla (4 × 2; 2 × 3 en el celular)
  var CARACTERES = " ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789+&-.";
  var PASO = 120, CADA = 4200;                 // ms por paleta; ms entre cambios de ficha (más lento: 2026-10-30)

  function enPaletas(t) {                      // mayúsculas sin tildes (la Ñ se queda)
    return t.toUpperCase().replace(/Ñ/g, "\u0001").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\u0001/g, "Ñ");
  }
  function relleno(t, n) { t = t.slice(0, n); while (t.length < n) t += " "; return t; }
  function enLineas(t, ancho, n) {             // el nombre en n líneas de ancho paletas, cortando entre palabras; null si no cabe
    var p = t.split(" "), out = "";
    for (var i = 0; i < n; i++) {
      var l = "";
      while (p.length && (l ? l + " " + p[0] : p[0]).length <= ancho) l = l ? l + " " + p.shift() : p.shift();
      out += relleno(l, ancho);
    }
    return p.length ? null : out;
  }
  var clientes = [].map.call(lista.querySelectorAll("li"), function (li) {
    var im = li.querySelector("img");
    // data-corto: el nombre abreviado para las paletas (todas las fichas en 2 líneas); el alt completo queda en la lista
    var t = enPaletas(li.getAttribute("data-corto") || im.alt);
    return { logo: im.getAttribute("src"), color: im.classList.contains("en-color"),
             nombre: enLineas(t, ANCHO, 2) || relleno(t, ANCHO * 2),
             rubro: RUBROS[li.getAttribute("data-rubro")] || "" };
  });

  // ─── las fichas ───
  var grilla = document.createElement("div");
  grilla.className = "clientes-fichas"; grilla.setAttribute("aria-hidden", "true");
  var fichas = [];
  var nFichas = quieto ? clientes.length : FICHAS;
  function linea(contenedor, clase, deFicha, ancho) {
    var l = document.createElement("div"); l.className = "linea " + clase;
    for (var k = 0; k < ancho; k++) {
      var c = document.createElement("span"); c.className = "paleta"; c.innerHTML = "<b> </b>";
      l.appendChild(c);
      deFicha.push({ b: c.firstChild, el: c, actual: " ", meta: " ", prox: 0, pasos: 0 });
    }
    contenedor.appendChild(l);
  }

  for (var f = 0; f < nFichas; f++) {
    var ficha = document.createElement("div"); ficha.className = "ficha";
    // la paleta grande del logo: dos bisagras, como un módulo de dos paletas apiladas
    var g = document.createElement("span"); g.className = "paleta-logo"; g.innerHTML = "<i></i>";
    ficha.appendChild(g);
    // el rubro, como etiqueta sobre la ficha (Benjamin, 2026-10-30)
    var et = document.createElement("span"); et.className = "rubro-etiqueta"; ficha.insertBefore(et, g);
    var nombres = document.createElement("div"); nombres.className = "nombres"; ficha.appendChild(nombres);
    var fi = { el: ficha, etiqueta: et, celdas: [], grande: { el: g, i: g.firstChild, cola: [], prox: 0 }, cliente: -1 };
    linea(nombres, "nombre", fi.celdas, ANCHO); linea(nombres, "nombre", fi.celdas, ANCHO);
    grilla.appendChild(ficha);
    fichas.push(fi);
  }
  lista.classList.add("logos-oculta");
  lista.parentNode.insertBefore(grilla, lista.nextSibling);

  function poner(c, ch) { c.actual = ch; c.b.textContent = ch; }
  function ponerLogo(gr, cl) {
    gr.i.innerHTML = '<img alt="" src="' + cl.logo + '"' + (cl.color ? ' class="en-color"' : "") + ">";
  }
  function ponerFigura(gr, n) {
    gr.i.innerHTML = n < 0 ? "" : '<svg viewBox="0 0 48 48">' + FIGURAS[n] + "</svg>";
  }
  if (quieto) {
    fichas.forEach(function (fi, i) {
      var t = clientes[i].nombre;
      fi.celdas.forEach(function (c, k) { poner(c, t[k]); });
      fi.etiqueta.textContent = clientes[i].rubro;
      ponerLogo(fi.grande, clientes[i]);
    });
    return;
  }

  // ─── giro: cada paleta avanza de a un carácter hasta su meta; la grande pasa por figuras y queda en el logo ───
  var raf = 0;
  function mostrarEn(fi, i, ahora) {
    var t = clientes[i].nombre;
    fi.etiqueta.classList.add("cambia");                     // la etiqueta del rubro se apaga y vuelve con el nuevo
    setTimeout(function () { fi.etiqueta.textContent = clientes[i].rubro; fi.etiqueta.classList.remove("cambia"); }, 450);
    fi.celdas.forEach(function (c, k) {
      c.meta = t[k]; c.prox = ahora + (k % ANCHO) * 45 + Math.random() * 250;
      c.pasos = c.actual === c.meta ? 0 : 1 + Math.floor(Math.random() * 3);   // pocos giros (2026-10-30: antes recorría todo el abecedario)
    });
    // las figuras de rubro sólo en la primera aparición; después, la paleta pasa en blanco y queda en el logo nuevo
    var gr = fi.grande, n0 = Math.floor(Math.random() * FIGURAS.length);
    gr.cola = fi.cliente >= 0 ? [-1, clientes[i]] : [-1, n0, clientes[i]];
    gr.prox = ahora;
    fi.cliente = i;
    if (!raf) raf = requestAnimationFrame(girar);
  }
  function girar(ahora) {
    var falta = false;
    fichas.forEach(function (fi) {
      var gr = fi.grande;
      if (!gr.cola.length) return;
      falta = true;
      if (ahora < gr.prox) return;
      var x = gr.cola.shift();
      if (typeof x === "number") ponerFigura(gr, x); else ponerLogo(gr, x);
      gr.prox = ahora + 520;
      gr.el.classList.remove("gira"); void gr.el.offsetWidth; gr.el.classList.add("gira");
    });
    fichas.forEach(function (fi) { fi.celdas.forEach(function (c) {
      if (c.actual === c.meta) return;
      falta = true;
      if (ahora < c.prox) return;
      // unas pocas paletas al azar y luego la letra final
      if (c.pasos > 0) { c.pasos--; poner(c, CARACTERES[1 + Math.floor(Math.random() * (CARACTERES.length - 1))]); }
      else poner(c, c.meta);
      c.prox = ahora + PASO;
      c.el.classList.remove("gira"); void c.el.offsetWidth; c.el.classList.add("gira");
    }); });
    raf = falta ? requestAnimationFrame(girar) : 0;
  }

  // ─── qué cliente entra y en qué ficha (en el celular se ven sólo las primeras 6) ───
  var siguiente = 0, ultima = null, empezado = false;
  function proximoCliente(entre) {
    for (var n = 0; n < clientes.length; n++) {
      var i = (siguiente + n) % clientes.length;
      if (!entre.some(function (fi) { return fi.cliente === i; })) { siguiente = (i + 1) % clientes.length; return i; }
    }
    return -1;
  }
  function cambiar() {
    var ahora = performance.now();
    if (!empezado) {                           // al entrar por primera vez, se llenan todas en cascada
      empezado = true;
      fichas.forEach(function (fi, f) { mostrarEn(fi, proximoCliente(fichas), ahora + f * 260); });
      return;
    }
    var vis = fichas.filter(function (fi) { return fi.el.offsetParent !== null; }), fi;
    do { fi = vis[Math.floor(Math.random() * vis.length)]; } while (fi === ultima && vis.length > 1);
    ultima = fi;
    var i = proximoCliente(vis); if (i >= 0) mostrarEn(fi, i, ahora);
  }

  var pausa = document.createElement("button");
  pausa.type = "button"; pausa.className = "pausa-clientes"; pausa.textContent = "Pausar fichas";
  grilla.parentNode.insertBefore(pausa, grilla.nextSibling);

  var enVista = false, pausado = false, reloj = null;
  function andar() {
    var debe = enVista && !pausado && !document.hidden;
    if (debe && !reloj) { cambiar(); reloj = setInterval(cambiar, CADA); }
    if (!debe && reloj) { clearInterval(reloj); reloj = null; }
  }
  pausa.addEventListener("click", function () {
    pausado = !pausado;
    pausa.textContent = pausado ? "Reanudar fichas" : "Pausar fichas";
    andar();
  });
  document.addEventListener("visibilitychange", andar);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { enVista = e[0].isIntersecting; andar(); }, { threshold: 0.3 }).observe(grilla);
  } else { enVista = true; andar(); }
})();
