#!/usr/bin/env node
/* Revisión automática del sitio con Playwright (desbordes, conexiones externas, CSP, errores, foco, contraste,
   tamaños táctiles). Uso:
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
    if (typeof e.className === 'string' && e.className.trim()) s += '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.');
    return s;
  };
  const visible = e => {
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0;
  };
  const out = { desborde: null, tactil: [], solapes: [], contraste: [], etiqueta: [], infinitas: [] };
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
  /* táctiles */
  const ctrls = [...document.querySelectorAll('a, button, [role=button], summary')].filter(visible);
  for (const e of ctrls) {
    const r = e.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) {
      const enLinea = e.tagName === 'A' && !!e.closest('p, li') && (e.closest('p, li').textContent || '').trim().length > (e.textContent || '').trim().length;
      out.tactil.push({ el: sel(e), w: Math.round(r.width), h: Math.round(r.height), enLinea });
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
  /* contraste */
  const parse = c => { const m = c.match(/[\d.]+/g); return m ? m.map(Number) : null; };
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
    const fg = parse(cs.color); if (!fg) continue;
    let bg = null, noEval = false, a = e;
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
    const px = parseFloat(cs.fontSize), neg = (+cs.fontWeight >= 700);
    const grande = px >= 24 || (px >= 18.66 && neg);
    if (razon < (grande ? 3 : 4.5)) out.contraste.push({ el: sel(e), razon: +razon.toFixed(2), min: grande ? 3 : 4.5, texto: n.nodeValue.trim().slice(0, 30) });
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
          for (const x of m.tactil) aviso('tactil-pequeno', { ...at, ...x });
          for (const x of m.solapes) aviso('solape-controles', { ...at, ...x });
          for (const x of m.contraste) aviso(x.noEvaluable ? 'contraste-no-evaluable' : 'contraste-bajo', { ...at, ...x });
          for (const x of m.etiqueta) aviso('etiqueta-vs-nombre', { ...at, ...x });
          if (c.mov === 'reduce') for (const x of m.infinitas) aviso('animacion-infinita-reduce', { ...at, ...x });
          if (A.capturas && (pc === 0 || pc === 50 || pc === 100)) {
            const d = path.join(salida, 'capturas'); fs.mkdirSync(d, { recursive: true });
            await page.screenshot({ path: path.join(d, `${c.p}_${c.an.txt}_${c.tema}_${c.mov === 'reduce' ? 'reduce_' : ''}${pc}.png`) });
          }
        }
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
