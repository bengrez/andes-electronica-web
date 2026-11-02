#!/usr/bin/env node
/* Cuadro inicial del mapa de inicio, como imagen fija (2026-11-02, handoff 017; Benjamin: «que el mapa sobresalga»).
   La portada de inicio mide 78 % de la pantalla y deja asomar el borde superior del mapa. Antes de que cargue WebGL,
   el lienzo del mapa muestra esta imagen (img/mapa-inicio-{noche,dia}[-ancho].webp); WebGL la reemplaza con el mismo
   cuadro, sin salto. Sirve el sitio en un puerto local, carga index.html con flota-3d.js parchado al vuelo (avance fijo,
   sin el texto) y fotografía el lienzo en los dos temas. El repositorio no cambia.
   Uso: PW=<módulo playwright> CHROMIUM=<chrome> SITIO=<ruta a site-nuevo> node scripts/renderizar_mapa_inicial.cjs '<json>'
   Versiones publicadas (salen PNG; se pasan a WebP calidad 80 con Pillow):
     {"nombre":"mapa0-1440","w":1440,"h":900,"dpr":2,"R":{"p":0}}    → img/mapa-inicio-{noche,dia}.webp (16:10)
     {"nombre":"mapa0-1920","w":1920,"h":1080,"dpr":2,"R":{"p":0}}   → img/mapa-inicio-{noche,dia}-ancho.webp (16:9)
   Con "solo": true y "poses" dibuja sólo el relieve desde otra pose (así se hizo la muestra v1 de las cumbres).
   Si cambian flota-3d.js o la portada, hay que volver a renderizar; revisar los textos que reemplaza rep(). */
const { chromium } = require(process.env.PW);
const fs = require('fs'), path = require('path');
const SITIO = process.env.SITIO, PUERTO = +process.env.PUERTO || 8471;
const cfg = JSON.parse(process.argv[2] || '{}');
const W = cfg.w || 1600, H = cfg.h || 900, DPR = cfg.dpr || 2;
(async () => {
  const http = require('http');
  const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
    const f = path.join(SITIO, p);
    if (!f.startsWith(SITIO) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
    let b = fs.readFileSync(f);
    if (p === '/flota-3d.js') {
      let s = b.toString(); const rep = (a, c) => { if (!s.includes(a)) throw new Error('falta: ' + a.slice(0, 50)); s = s.replace(a, c); };
      rep('var fallado = false;', 'if (window.__R && window.__R.poses) { POSES = window.__R.poses; FOV = window.__R.fov || FOV; }\n  var fallado = false;');
      rep('gl.drawElements(gl.TRIANGLES, nIdx, gl.UNSIGNED_SHORT, 0);', 'gl.drawElements(gl.TRIANGLES, nIdx, gl.UNSIGNED_SHORT, 0);\n    if (window.__R) { window.__R.n = (window.__R.n || 0) + 1; if (window.__R.solo) return; }');
      rep('function centroMapa() {', 'function centroMapa() { if (window.__R && window.__R.solo) return 0;');
      rep('TM.velo && W >= 760 ? 1 : 0', '!(window.__R && window.__R.solo) && TM.velo && W >= 760 ? 1 : 0');
      rep('if (quieto || !recorrido) return 1;', 'if (window.__R) return window.__R.p; if (quieto || !recorrido) return 1;');
      rep('var niebla = [dist * 1.15, dist * 3.4];', 'var niebla = window.__R && window.__R.niebla ? window.__R.niebla : [dist * 1.15, dist * 3.4];');
      rep('TM.lavado * suave(pCam)', '(window.__R && window.__R.lavado != null ? window.__R.lavado : TM.lavado * suave(pCam))');
      b = s;
    }
    r.writeHead(200, { 'content-type': tipos[path.extname(p)] || 'application/octet-stream' }); r.end(b);
  }).listen(PUERTO, '127.0.0.1');
  const br = await chromium.launch({ executablePath: process.env.CHROMIUM, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const tema of cfg.temas || ['oscuro', 'claro']) {
    const pg = await br.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: DPR });
    await pg.addInitScript(([t, R]) => { localStorage.setItem('tema', t); window.__R = R; }, [tema, cfg.R]);
    await pg.goto(`http://127.0.0.1:${PUERTO}/index.html`);
    await pg.addStyleTag({ content: '.cordillera,.barra,.heroe,.controles,.camara,.saltar' + (cfg.R.solo ? ',#flota-reg' : '') + '{visibility:hidden!important} .cordillera{display:none!important}' + (cfg.alfa ? '#cielo{visibility:hidden!important} html,body,.portada,.recorrido{background:transparent!important}' : '') });
    await pg.waitForFunction(() => window.__R.n > 3, null, { timeout: 60000 });
    await pg.waitForTimeout(500);
    const sal = path.join(cfg.salida || '.', `${cfg.nombre || 'cumbres'}-${tema}.png`);
    await pg.screenshot({ path: sal, omitBackground: !!cfg.alfa, clip: { x: 0, y: 0, width: W, height: H } });
    console.log('ok', sal);
    await pg.close();
  }
  await br.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
