// Deja la versión anterior plana (Benjamin, 2026-10-30: «completamente plana, como JI quiere»). Abre cada página de
// _fuente/ (React precompilado) en un navegador, la recorre para que aparezca todo, espera a que las animaciones
// terminen y guarda el HTML resultante en la carpeta de arriba, sin ningún <script>: el sitio publicado es HTML con
// estilos, sin React ni JavaScript. Los menús desplegables quedan en CSS (al pasar el mouse o con el foco del teclado)
// y las fuentes se sirven desde fuentes/. Lo que en React se animaba queda en su estado final.
//
//   1. node compilar.mjs <node_modules>/esbuild       (si se editó un .jsx)
//   2. node aplanar.mjs <node_modules>/playwright      (necesita Chromium de Playwright)
//
// _fuente/ no se publica (GitHub Pages con Jekyll ignora las carpetas que empiezan con _).
import fs from 'fs';
import path from 'path';
import http from 'http';
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)(path.resolve(process.argv[2] || './node_modules/playwright'));

const AQUI = path.dirname(new URL(import.meta.url).pathname), RAIZ = path.resolve(AQUI, '..');
const TIPOS = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json', '.mp4': 'video/mp4' };
// servidor local: /<archivo> desde _fuente/ y, si no está, desde la carpeta publicada (assets/, fuentes/)
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '');
  for (const base of [AQUI, RAIZ]) {
    const f = path.join(base, u);
    if (f.startsWith(base) && fs.existsSync(f) && fs.statSync(f).isFile()) {
      r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); return;
    }
  }
  r.writeHead(404); r.end();
}).listen(0);
const puerto = srv.address().port;

const CSS_PLANO = `<link rel="stylesheet" href="./fuentes/fuentes.css">
<style>
/* versión plana: los menús desplegables se abren con CSS (antes, con React) */
[data-nav-dropdown]:hover > [role="menu"], [data-nav-dropdown]:focus-within > [role="menu"] { opacity: 1 !important; visibility: visible !important; transform: none !important; transition-delay: 0s !important; }
</style>`;

const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});   // CHROMIUM: ruta a un Chromium propio, opcional
const paginas = fs.readdirSync(AQUI).filter(f => f.endsWith('.html'));
for (const f of paginas) {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errores = []; pg.on('pageerror', e => errores.push(e.message));
  await pg.goto(`http://127.0.0.1:${puerto}/${f}`, { waitUntil: 'load' });
  await pg.waitForTimeout(1200);
  // recorrerla hasta el final y volver, para que se disparen las apariciones al hacer scroll
  await pg.evaluate(async () => {
    const paso = innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += paso) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
    scrollTo(0, 0);
  });
  // escenas que avanzaban con el scroll (un bloque sticky dentro de un contenedor alto): se dejan en su estado final,
  // sin el alto extra, para que no queden espacios vacíos
  const escenas = await pg.evaluate(() => [...document.querySelectorAll('*')]
    .filter(e => getComputedStyle(e).position === 'sticky' && e.tagName !== 'NAV' && e.parentElement && e.parentElement.offsetHeight > innerHeight * 1.5)   // la barra de navegación sigue fija
    .map((e, i) => { e.setAttribute('data-escena', i); return i; }));
  const finales = [];
  // en la portada, los productos destacados quedan en su primera pestaña (el Tacógrafo 4.0); el resto, en su final
  const alInicio = await pg.evaluate(() => [...document.querySelectorAll('[data-escena]')].map(e => !!e.closest('[data-products-section]')));
  for (const i of escenas) {
    if (alInicio[i]) { finales.push(null); continue; }
    await pg.evaluate(i => { const c = document.querySelector(`[data-escena="${i}"]`).parentElement;
      scrollTo(0, c.getBoundingClientRect().top + scrollY + c.offsetHeight - innerHeight - 4); }, i);
    await pg.waitForTimeout(2500);
    finales.push(await pg.evaluate(i => document.querySelector(`[data-escena="${i}"]`).outerHTML, i));
  }
  await pg.evaluate(() => scrollTo(0, 0));
  await pg.waitForTimeout(9000);   // los textos que rotan terminan en su último valor
  await pg.evaluate(finales => finales.forEach((h, i) => {
    const e = document.querySelector(`[data-escena="${i}"]`); if (!e) return;
    let n = e;
    if (h) { const t = document.createElement('template'); t.innerHTML = h; n = t.content.firstElementChild; e.replaceWith(n); }
    n.style.position = 'relative'; n.style.top = 'auto'; n.removeAttribute('data-escena');
    n.parentElement.style.height = 'auto'; n.parentElement.style.minHeight = '0';
  }), finales);
  if (escenas.length) console.log(`  ${f}: ${escenas.length} escena(s) fijada(s) en su estado final`);
  let html = await pg.evaluate(() => {
    // la esfera de la portada es un fondo fijo que el JS desvanecía al bajar; sin JS quedaba pegada sobre todo
    document.querySelectorAll('.hero-bg-image').forEach(e => { e.style.position = 'absolute'; });
    document.querySelectorAll('script').forEach(s => s.remove());
    document.querySelectorAll('link[href*="fonts.googleapis"], link[href*="fonts.gstatic"], link[href*="font-awesome"], link[rel="preconnect"]').forEach(l => l.remove());
    return '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
  });
  html = html.replace('</head>', CSS_PLANO + '\n</head>');
  if (/<script/i.test(html)) throw new Error(`${f}: quedó un <script>`);
  fs.writeFileSync(path.join(RAIZ, f), html);
  console.log(f.padEnd(30), `${(html.length / 1024).toFixed(0)} KB`, errores.length ? 'errores: ' + errores.join(' | ') : '');
  await pg.close();
}
await b.close(); srv.close();
