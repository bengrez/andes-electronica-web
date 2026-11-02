#!/usr/bin/env node
/* Revisión automática del sitio con Playwright (desbordes, conexiones externas, CSP, errores, foco, contraste,
   tamaños táctiles con área ampliada y excepciones de WCAG 2.5.8, solape del logo con el h1). Uso:
   PW=<ruta al módulo playwright> CHROMIUM=<ruta a chrome> node scripts/verificar_sitio.cjs [--paginas a,b]
     [--anchos 360x780,390x844,1440x900] [--salida dir] [--capturas]
   Levanta su propio servidor local y lo apaga al terminar. Exit 0 sin fallas duras, 1 con fallas, 2 error de uso. */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), net = require('net'), http = require('http');
const { spawn } = require('child_process');

const PAGINAS_TODAS = ['index', 'productos', 'sacel', 'servicios', 'empresa', 'contacto', 'privacidad', 'iso'];
const ANCHOS_DEF = '360x780,390x844,1440x900';
const ANCHO_REDUCE = '390x844';
const PORCENTAJES = [0, 25, 50, 75, 100];
/* solape del logo de la barra con el h1 (2026-11-02: en la portada de inicio, el logo grande pisaba «Andes Electrónica»).
   Se mide la intersección de las cajas visibles; más de 1 px² es falla dura. */
function medirLogoTitulo() {
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0 && e.offsetParent !== null; };
  const logo = [...document.querySelectorAll('.marca img')].filter(vis)[0], h1 = [...document.querySelectorAll('h1')].filter(vis)[0];
  if (!logo || !h1) return null;
  const rg = document.createRange(); rg.selectNodeContents(h1);   // la caja del texto, no la del bloque de ancho completo
  const a = logo.getBoundingClientRect(), b = rg.getBoundingClientRect();
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 && w * h > 1 ? { area: Math.round(w * h), logo: [Math.round(a.left), Math.round(a.top), Math.round(a.width), Math.round(a.height)],
    h1: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)] } : null;
}

function args(argv) {
  const a = { paginas: PAGINAS_TODAS, anchos: ANCHOS_DEF, salida: null, capturas: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--paginas') a.paginas = (argv[++i] || '').split(',').filter(Boolean);
    else if (k === '--anchos') a.anchos = argv[++i] || ANCHOS_DEF;
    else if (k === '--salida') a.salida = argv[++i];
    else if (k === '--capturas') a.capturas = true;
    else { console.error('Argumento desconocido: ' + k); process.exit(2); }
  }
  a.anchos = a.anchos.split(',').filter(Boolean).map(s => {
    const m = /^(\d+)x(\d+)$/.exec(s);
    if (!m) { console.error('Ancho inválido: ' + s); process.exit(2); }
    return { w: +m[1], h: +m[2], txt: s };
  });
  return a;
}

function puertoLibre() {
  return new Promise((res, rej) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); });
    s.on('error', rej);
  });
}
function responde(puerto) {
  return new Promise(res => {
    const r = http.get({ host: '127.0.0.1', port: puerto, path: '/index.html' }, x => { x.resume(); res(x.statusCode === 200); });
    r.on('error', () => res(false));
    r.setTimeout(1000, () => { r.destroy(); res(false); });
  });
}

/* Código que corre dentro de la página. Se pasa como función a page.evaluate. */
function medirDOM() {
  const sel = e => {
    let s = e.tagName.toLowerCase();
    if (e.id) s += '#' + e.id;
    const cl = e.getAttribute('class');
    if (cl && cl.trim()) s += '.' + cl.trim().split(/\s+/).slice(0, 2).join('.');
    return s;
  };
  const visible = e => {
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0;
  };
  const out = { desborde: null, tactil: [], tactilFalso: [], solapesAreas: [], solapes: [], contraste: [], etiqueta: [], infinitas: [] };
  const de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1) {
    const l = [];
    for (const e of document.body.querySelectorAll('*')) {
      if (!visible(e)) continue;
      const r = e.getBoundingClientRect();
      if (r.right > innerWidth + 1) l.push(sel(e));
      if (l.length >= 15) break;
    }
    out.desborde = { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, elementos: l };
  }
  /* área tocable real: la caja del control más lo que sobresale su ::before transparente (si lo hay) */
  const area = e => {
    const r = e.getBoundingClientRect();
    let a = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    const ps = getComputedStyle(e, '::before');
    if (ps.content !== 'none' && ps.position === 'absolute' && parseFloat(ps.width) > 0) {
      const cs = getComputedStyle(e);
      const l = r.left + parseFloat(cs.borderLeftWidth) + parseFloat(ps.left), t = r.top + parseFloat(cs.borderTopWidth) + parseFloat(ps.top);
      a = { left: Math.min(a.left, l), top: Math.min(a.top, t), right: Math.max(a.right, l + parseFloat(ps.width)), bottom: Math.max(a.bottom, t + parseFloat(ps.height)) };
    }
    return a;
  };
  /* ¿el área ampliada responde de verdad al toque? elementFromPoint en las cuatro esquinas (1 px hacia dentro) */
  const esquinas = (e, a) => [[a.left + 1, a.top + 1], [a.right - 1, a.top + 1], [a.left + 1, a.bottom - 1], [a.right - 1, a.bottom - 1]]
    .every(([x, y]) => { if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return true; const t = document.elementFromPoint(x, y); return !!t && (t === e || e.contains(t)); });
  /* táctiles (WCAG 2.2, 2.5.8): 24 × 24 px; el aviso lleva si la excepción de espaciado o la de enlace en línea se cumple */
  const ctrls = [...document.querySelectorAll('a, button, [role=button], summary')].filter(visible);
  for (const e of ctrls) {
    const r = e.getBoundingClientRect(), ar = area(e);
    const w = ar.right - ar.left, h = ar.bottom - ar.top;
    if (w < 24 || h < 24) {
      const enLinea = e.tagName === 'A' && !!e.closest('p, li') && (e.closest('p, li').textContent || '').trim().length > (e.textContent || '').trim().length;
      /* espaciado: un círculo de 24 px centrado en el control no toca a ningún otro control */
      const cx = (ar.left + ar.right) / 2, cy = (ar.top + ar.bottom) / 2;
      const espaciado = !ctrls.some(o => {
        if (o === e || o.contains(e) || e.contains(o)) return false;
        const q = o.getBoundingClientRect();
        const dx = Math.max(q.left - cx, 0, cx - q.right), dy = Math.max(q.top - cy, 0, cy - q.bottom);
        return Math.hypot(dx, dy) < 12;
      });
      out.tactil.push({ el: sel(e), w: Math.round(w), h: Math.round(h), enLinea, espaciado });
    } else if (w - r.width > 0.5 || h - r.height > 0.5) {
      if (!esquinas(e, ar)) out.tactilFalso.push({ el: sel(e), w: Math.round(w), h: Math.round(h) });
    }
  }
  /* solapes: controles clave contra cualquier control interactivo visible */
  const clave = [...document.querySelectorAll('.seguir, .saltar-seccion, .pausa, .pausa-clientes')].filter(visible);
  const todos = [...document.querySelectorAll('a, button, input, select, textarea, summary, [role=button], [tabindex]')].filter(visible);
  const vistos = new Set();
  for (const a of clave) {
    const ra = a.getBoundingClientRect();
    for (const b of todos) {
      if (a === b || a.contains(b) || b.contains(a)) continue;
      const rb = b.getBoundingClientRect();
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (w > 0 && h > 0) {
        const k = sel(a) + '|' + sel(b);
        if (!vistos.has(k)) { vistos.add(k); out.solapes.push({ a: sel(a), b: sel(b), px: Math.round(w) + 'x' + Math.round(h) }); }
      }
    }
  }
  /* las áreas tocables ampliadas de los controles clave tampoco se pisan entre sí ni con otro control */
  for (const a of clave) {
    const aa = area(a);
    for (const b of todos) {
      if (a === b || a.contains(b) || b.contains(a)) continue;
      const ab = area(b);
      const w = Math.min(aa.right, ab.right) - Math.max(aa.left, ab.left), h = Math.min(aa.bottom, ab.bottom) - Math.max(aa.top, ab.top);
      if (w > 0.5 && h > 0.5) out.solapesAreas.push({ a: sel(a), b: sel(b), px: Math.round(w) + 'x' + Math.round(h) });
    }
  }
  /* contraste */
  /* rgb()/rgba() en 0–255; color(srgb r g b / a) —lo que devuelve color-mix()— en 0–1 */
  const parse = c => {
    const m = c.match(/[\d.]+/g); if (!m) return null;
    const v = m.map(Number);
    if (/^color\(srgb\s/.test(c)) return v.length > 3 ? [v[0] * 255, v[1] * 255, v[2] * 255, v[3]] : v.map(x => x * 255);
    if (/^color\(/.test(c)) return null;
    return v;
  };
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const tieneCanvas = !!document.querySelector('canvas');
  const vistosC = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    if (!n.nodeValue.trim()) continue;
    const e = n.parentElement;
    if (!e || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(e.tagName) || !visible(e) || vistosC.has(e)) continue;
    vistosC.add(e);
    const cs = getComputedStyle(e);
    /* el texto SVG se pinta con fill, no con color; su fondo puede ser una figura del mismo SVG */
    const enSvg = typeof SVGElement !== 'undefined' && e instanceof SVGElement;
    const fg = parse(enSvg ? cs.fill : cs.color); if (!fg) continue;
    let bg = null, noEval = false, a = e, escala = 1;
    if (enSvg) {
      const svg = e.ownerSVGElement, m = svg && svg.getScreenCTM();
      if (m) escala = Math.hypot(m.a, m.b);
      if (+cs.fillOpacity < 1 || +cs.opacity < 1) noEval = true;
      const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      /* fuera de la ventana (o tapado por algo ajeno al SVG) no se puede saber qué hay detrás: se mide en otro punto del scroll */
      if (cx < 0 || cy < 0 || cx >= innerWidth || cy >= innerHeight) continue;
      const pila = document.elementsFromPoint(cx, cy);
      const tope = pila.find(d => d !== e && !/^(text|tspan)$/i.test(d.tagName));
      if (!tope || !(tope instanceof SVGElement) || (tope !== svg && !svg.contains(tope))) continue;
      for (const d of pila) {
        if (d === e || /^(text|tspan)$/i.test(d.tagName)) continue;
        if (!(d instanceof SVGElement) || d.tagName.toLowerCase() === 'svg') break;
        const sf = getComputedStyle(d), c = parse(sf.fill);
        if (c && (c.length === 3 || c[3] === 1) && +sf.fillOpacity === 1 && +sf.opacity === 1) { bg = c; break; }
      }
      if (bg) a = null;
    }
    while (a) {
      const s = getComputedStyle(a);
      if (s.backgroundImage && s.backgroundImage !== 'none') noEval = true;
      const c = parse(s.backgroundColor);
      if (c && (c.length === 3 || c[3] === 1)) { bg = c; break; }
      a = a.parentElement;
    }
    if (tieneCanvas && !noEval) { const cv = document.querySelector('canvas'); if (cv && cv.getBoundingClientRect().height > 0) noEval = true; }
    if (noEval || !bg) { out.contraste.push({ el: sel(e), noEvaluable: true }); continue; }
    const alfa = fg.length === 4 ? fg[3] : 1;
    const fgm = alfa < 1 ? fg.slice(0, 3).map((v, i) => v * alfa + bg[i] * (1 - alfa)) : fg;
    const l1 = lum(fgm), l2 = lum(bg), razon = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const px = parseFloat(cs.fontSize) * escala, neg = (+cs.fontWeight >= 700);
    const grande = px >= 24 || (px >= 18.66 && neg);
    if (razon < (grande ? 3 : 4.5)) out.contraste.push({ el: sel(e), ...(enSvg ? { svg: true } : {}), razon: +razon.toFixed(2), min: grande ? 3 : 4.5, texto: n.nodeValue.trim().slice(0, 30) });
  }
  /* etiqueta vs nombre visible */
  for (const e of document.querySelectorAll('button, [role=button], a')) {
    const al = e.getAttribute('aria-label'), t = (e.textContent || '').trim().replace(/\s+/g, ' ');
    if (!al || !t || !visible(e)) continue;
    if (!al.toLowerCase().includes(t.toLowerCase())) out.etiqueta.push({ el: sel(e), aria: al, visible: t.slice(0, 40) });
  }
  /* animaciones infinitas visibles */
  for (const e of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(e);
    if (cs.animationName !== 'none' && cs.animationIterationCount.split(',').some(v => v.trim() === 'infinite') && visible(e)) {
      const r = e.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) out.infinitas.push({ el: sel(e), animacion: cs.animationName });
    }
  }
  return out;
}

function medirFoco(maxTab) {
  /* corre en la página: devuelve info del elemento enfocado actual */
  const e = document.activeElement;
  if (!e || e === document.body || e === document.documentElement) return null;
  const cs = getComputedStyle(e), r = e.getBoundingClientRect();
  let sel = e.tagName.toLowerCase();
  if (e.id) sel += '#' + e.id;
  if (typeof e.className === 'string' && e.className.trim()) sel += '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.');
  const sinContorno = cs.outlineStyle === 'none' && (cs.boxShadow === 'none' || !cs.boxShadow);
  const fuera = r.width === 0 || r.height === 0 || r.top < 0 || r.left < 0 || r.bottom > innerHeight + 1 || r.right > innerWidth + 1;
  const t = document.elementFromPoint(Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1), Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1));
  const tapado = !(t && (t === e || e.contains(t)));
  return { el: sel, sinContorno, fuera, tapado: !fuera && tapado, tapaPor: (!fuera && tapado && t) ? t.tagName.toLowerCase() + (t.id ? '#' + t.id : '') : null };
}

async function main() {
  const A = args(process.argv.slice(2));
  const PW = process.env.PW;
  if (!PW) { console.error('Falta la variable PW (ruta al módulo playwright). Ejemplo: PW=<ruta> CHROMIUM=<ruta a chrome> node scripts/verificar_sitio.cjs'); process.exit(2); }
  let pw;
  try { pw = require(PW); } catch (e) { console.error('No pude cargar playwright desde PW: ' + e.message); process.exit(2); }
  const raiz = path.resolve(__dirname, '..');
  const salida = A.salida ? path.resolve(A.salida) : fs.mkdtempSync(path.join(os.tmpdir(), 'verificar-sitio-'));
  if (salida === raiz || salida.startsWith(raiz + path.sep)) { console.error('--salida no puede estar dentro del repo.'); process.exit(2); }
  fs.mkdirSync(salida, { recursive: true });

  const puerto = await puertoLibre();
  const srv = spawn('python3', ['-m', 'http.server', String(puerto), '--bind', '127.0.0.1', '-d', raiz], { stdio: 'ignore' });
  let navegador = null;
  const apagar = () => { try { if (srv.pid) process.kill(srv.pid); } catch (e) {} };
  process.on('exit', apagar);
  for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => { apagar(); process.exit(130); });

  const origen = 'http://127.0.0.1:' + puerto;
  const informe = { origen, generado: new Date().toISOString(), resultados: [] };
  let codigo = 0;
  try {
    let ok = false;
    for (let i = 0; i < 50 && !ok; i++) { ok = await responde(puerto); if (!ok) await new Promise(r => setTimeout(r, 100)); }
    if (!ok) throw new Error('El servidor local no respondió.');
    const lanz = {};
    if (process.env.CHROMIUM) lanz.executablePath = process.env.CHROMIUM;
    navegador = await pw.chromium.launch(lanz);

    const combos = [];
    for (const p of A.paginas) for (const an of A.anchos) for (const tema of ['claro', 'oscuro']) {
      combos.push({ p, an, tema, mov: 'no-preference' });
      if (an.txt === ANCHO_REDUCE) combos.push({ p, an, tema, mov: 'reduce' });
    }
    for (const c of combos) {
      const clave = `${c.p}/${c.an.txt}/${c.tema}/${c.mov}`;
      const ctx = await navegador.newContext({ viewport: { width: c.an.w, height: c.an.h }, reducedMotion: c.mov });
      const page = await ctx.newPage();
      const R = { pagina: c.p, ancho: c.an.txt, tema: c.tema, movimiento: c.mov, duras: [], avisos: [] };
      const dura = (tipo, det) => R.duras.push({ tipo, ...det });
      const aviso = (tipo, det) => R.avisos.push({ tipo, ...det });
      page.on('request', rq => { const u = rq.url(); if (!u.startsWith(origen + '/') && !u.startsWith('data:') && !u.startsWith('blob:') && u !== 'about:blank') dura('conexion-externa', { url: u.slice(0, 200) }); });
      page.on('pageerror', e => dura('error-pagina', { msg: String(e.message || e).slice(0, 300) }));
      page.on('console', m => { if (m.type() === 'error') dura('error-consola', { msg: m.text().slice(0, 300) }); });
      await page.addInitScript(t => {
        try { localStorage.setItem('tema', t); } catch (e) {}
        window.__csp = [];
        document.addEventListener('securitypolicyviolation', ev => window.__csp.push({ dir: ev.violatedDirective, bloqueado: ev.blockedURI, linea: ev.lineNumber }));
      }, c.tema);
      try {
        await page.emulateMedia({ reducedMotion: c.mov, colorScheme: c.tema === 'oscuro' ? 'dark' : 'light' });
        await page.goto(`${origen}/${c.p}.html`, { waitUntil: 'load' });
        await page.waitForTimeout(500);
        for (const pc of PORCENTAJES) {
          await page.evaluate(p => { const d = document.documentElement; window.scrollTo(0, (d.scrollHeight - innerHeight) * p / 100); }, pc);
          await page.waitForTimeout(300);
          const m = await page.evaluate(medirDOM);
          const at = { scroll: pc };
          if (m.desborde) dura('desborde-horizontal', { ...at, ...m.desborde });
          // sólo arriba de la página: al bajar, el h1 pasa por debajo de la barra fija (que lo tapa con su fondo) y no es un solape
          const lt = pc === 0 ? await page.evaluate(medirLogoTitulo) : null;
          if (lt) dura('solape-logo-titulo', { ...at, ...lt });
          for (const x of m.tactil) aviso(x.espaciado || x.enLinea ? 'tactil-por-excepcion' : 'tactil-pequeno', { ...at, ...x });   // 2.5.8: espaciado o enlace en línea
          for (const x of m.tactilFalso) dura('tactil-area-no-responde', { ...at, ...x });
          for (const x of m.solapesAreas) aviso('solape-areas-tocables', { ...at, ...x });
          for (const x of m.solapes) aviso('solape-controles', { ...at, ...x });
          for (const x of m.contraste) aviso(x.noEvaluable ? 'contraste-no-evaluable' : 'contraste-bajo', { ...at, ...x });
          for (const x of m.etiqueta) aviso('etiqueta-vs-nombre', { ...at, ...x });
          if (c.mov === 'reduce') for (const x of m.infinitas) aviso('animacion-infinita-reduce', { ...at, ...x });
          if (A.capturas && (pc === 0 || pc === 50 || pc === 100)) {
            const d = path.join(salida, 'capturas'); fs.mkdirSync(d, { recursive: true });
            await page.screenshot({ path: path.join(d, `${c.p}_${c.an.txt}_${c.tema}_${c.mov === 'reduce' ? 'reduce_' : ''}${pc}.png`) });
          }
        }
        /* el texto de los SVG sólo se mide con su centro en pantalla: además de los cortes de scroll, se mide con cada
           SVG con texto visible arriba de la ventana (sólo se cuenta el contraste de ese texto, para no duplicar avisos) */
        const topesSvg = await page.evaluate(() => [...document.querySelectorAll('svg')]
          .filter(v => v.querySelector('text') && v.getBoundingClientRect().height > 0)
          .map(v => Math.max(0, v.getBoundingClientRect().top + scrollY - 8)));
        for (let i = 0; i < topesSvg.length; i++) {
          await page.evaluate(y => window.scrollTo(0, y), topesSvg[i]);
          await page.waitForTimeout(200);
          const m = await page.evaluate(medirDOM);
          for (const x of m.contraste) if (x.svg) aviso(x.noEvaluable ? 'contraste-no-evaluable' : 'contraste-bajo', { scroll: 'svg' + (i + 1), ...x });
        }
        /* de vuelta arriba, con lo que se haya cargado al bajar (p. ej. el mapa 3D): el logo y el h1 siguen sin tocarse */
        await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1200);
        const lt0 = await page.evaluate(medirLogoTitulo);
        if (lt0) dura('solape-logo-titulo', { scroll: 'vuelta', ...lt0 });
        const csp = await page.evaluate(() => window.__csp || []);
        for (const x of csp) dura('violacion-csp', x);
        /* foco (sólo en la combinación sin reduce, desde el inicio de la página) */
        if (c.mov === 'no-preference') {
          await page.evaluate(() => { window.scrollTo(0, 0); if (document.activeElement) document.activeElement.blur(); });
          const vistos = new Set();
          for (let i = 0; i < 40; i++) {
            await page.keyboard.press('Tab');
            await page.waitForTimeout(60);
            const f = await page.evaluate(medirFoco);
            if (!f) continue;
            if (vistos.has(f.el)) { if (vistos.size > 3) { /* ciclo completo */ } }
            vistos.add(f.el);
            if (f.sinContorno) aviso('foco-sin-contorno', { el: f.el, tab: i + 1 });
            if (f.fuera) aviso('foco-fuera-de-vista', { el: f.el, tab: i + 1 });
            if (f.tapado) aviso('foco-tapado', { el: f.el, tab: i + 1, tapaPor: f.tapaPor });
          }
        }
      } catch (e) {
        dura('error-arnes', { msg: String(e.message || e).slice(0, 300) });
      }
      /* deduplicar */
      const dd = l => { const s = new Set(); return l.filter(x => { const k = JSON.stringify({ ...x, scroll: undefined }); if (s.has(k)) return false; s.add(k); return true; }); };
      R.duras = dd(R.duras); R.avisos = dd(R.avisos);
      informe.resultados.push(R);
      await ctx.close();
      process.stderr.write(`  ${clave}: ${R.duras.length} duras, ${R.avisos.length} avisos\n`);
    }
  } catch (e) {
    console.error('Error del arnés: ' + e.message);
    codigo = 2;
  } finally {
    if (navegador) { try { await navegador.close(); } catch (e) {} }
    apagar();
  }

  fs.writeFileSync(path.join(salida, 'informe.json'), JSON.stringify(informe, null, 2));
  const duras = [], cont = {}, porPag = {};
  for (const R of informe.resultados) {
    for (const d of R.duras) duras.push({ R, d });
    for (const a of R.avisos) { cont[a.tipo] = (cont[a.tipo] || 0) + 1; porPag[R.pagina] = porPag[R.pagina] || {}; porPag[R.pagina][a.tipo] = (porPag[R.pagina][a.tipo] || 0) + 1; }
  }
  console.log(`\nInforme: ${path.join(salida, 'informe.json')}`);
  console.log(`Combinaciones: ${informe.resultados.length}`);
  console.log(`Fallas duras: ${duras.length}`);
  duras.slice(0, 10).forEach(({ R, d }) => console.log(`  [${R.pagina} ${R.ancho} ${R.tema} ${R.movimiento}] ${d.tipo} ${JSON.stringify(d).slice(0, 220)}`));
  console.log('Avisos por tipo (con repeticiones entre combinaciones):');
  Object.keys(cont).sort().forEach(k => console.log(`  ${k}: ${cont[k]}`));
  console.log('Avisos por página:');
  Object.keys(porPag).sort().forEach(p => console.log(`  ${p}: ` + Object.keys(porPag[p]).sort().map(k => `${k}=${porPag[p][k]}`).join(', ')));
  if (codigo === 0 && duras.length) codigo = 1;
  process.exit(codigo);
}
main();
