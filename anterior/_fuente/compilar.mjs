// Precompila la versión anterior (Claude Design) para que no dependa de Babel en el navegador (Benjamin, 2026-10-30).
// Cada .jsx se transforma por separado a js/<nombre>.js con esbuild (sin minificar, para que se pueda leer), los
// bloques <script type="text/babel"> de cada página pasan a js/<Página>-inline-N.js, y React pasa a su build de
// producción, servido desde vendor/ (sin CDN).
//
//   npm install esbuild@0.24.0 react@18.3.1 react-dom@18.3.1      (en una carpeta aparte)
//   node compilar.mjs <ruta a node_modules/esbuild>
//
// Rehace js/ desde los .jsx y reescribe los .html sólo la primera vez (si todavía traen Babel).
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const esbuild = createRequire(import.meta.url)(path.resolve(process.argv[2] || './node_modules/esbuild'));
const op = { loader: 'jsx', jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', target: 'es2018', charset: 'utf8' };

for (const f of fs.readdirSync('.').filter(f => f.endsWith('.jsx'))) {
  const out = esbuild.transformSync(fs.readFileSync(f, 'utf8'), { ...op, sourcefile: f }).code;
  fs.writeFileSync(`js/${f.replace(/\.jsx$/, '.js')}`, `// Generado desde ${f} por compilar.mjs: no editar a mano.\n` + out);
}
for (const f of fs.readdirSync('.').filter(f => f.endsWith('.html'))) {
  let h = fs.readFileSync(f, 'utf8');
  if (!h.includes('babel')) continue;
  const base = f.replace(/\.html$/, '');
  let n = 0;
  h = h.replace(/<script src="https:\/\/unpkg\.com\/react@18\.3\.1\/umd\/react\.development\.js"[^>]*><\/script>/, '<script src="./vendor/react.production.min.js"></script>');
  h = h.replace(/<script src="https:\/\/unpkg\.com\/react-dom@18\.3\.1\/umd\/react-dom\.development\.js"[^>]*><\/script>/, '<script src="./vendor/react-dom.production.min.js"></script>');
  h = h.replace(/<script src="https:\/\/unpkg\.com\/@babel\/standalone[^>]*><\/script>\n?/, '');
  h = h.replace(/<script type="text\/babel" src="\.\/([a-z0-9-]+)\.jsx"><\/script>/g, (_, nombre) => `<script src="./js/${nombre}.js"></script>`);
  h = h.replace(/<script type="text\/babel">([\s\S]*?)<\/script>/g, (_, codigo) => {
    const nombre = `${base}-inline-${++n}`;
    const out = esbuild.transformSync(codigo, { ...op, sourcefile: nombre + '.jsx' }).code;
    fs.writeFileSync(`js/${nombre}.js`, `// Generado desde el <script> de ${f} por compilar.mjs: no editar a mano.\n` + out);
    return `<script src="./js/${nombre}.js"></script>`;
  });
  if (/unpkg|text\/babel/.test(h)) throw new Error(`${f}: quedó algo sin convertir`);
  fs.writeFileSync(f, h);
}
console.log('listo:', fs.readdirSync('js').length, 'archivos en js/');
