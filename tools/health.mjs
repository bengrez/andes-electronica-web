// Auditoría de salud de render + layout.
//
// La versión anterior sólo medía desborde horizontal, y por eso aprobó
// Empresa.html mientras estaba rota: un documento vacío no desborda. Acá el
// render se verifica PRIMERO y de forma independiente:
//   - errores de consola y excepciones no capturadas
//   - que #root tenga contenido real (nodos + texto), no un div vacío
//   - que existan los landmarks del layout (nav y footer)
// y sólo después se mide el desborde.
//
// Uso: node --experimental-websocket health.mjs <width> <url>...
const [widthArg, ...urls] = process.argv.slice(2);
const width = Number(widthArg) || 390;

const page = (await (await fetch('http://127.0.0.1:9222/json/list')).json()).find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
let consoleErrors = []; let exceptions = [];

const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, { res, rej });
  ws.send(JSON.stringify({ id: i, method, params }));
});
await new Promise(r => ws.addEventListener('open', r));
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id); pending.delete(m.id);
    return m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    consoleErrors.push((m.params.args || []).map(a => a.value ?? a.description ?? '').join(' ').slice(0, 160));
  }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    exceptions.push((d.exception?.description || d.text || '').split('\n')[0].slice(0, 160));
  }
});
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value;

await send('Page.enable'); await send('Runtime.enable');
await send('Network.enable'); await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: width <= 720 });

const PROBE = `(() => {
  const root = document.getElementById('root');
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    if (r.right > vw + 1 || r.left < -1) {
      for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        const ox = getComputedStyle(a).overflowX;
        if (ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll') return;
      }
      if (offenders.some(o => o.el.contains(el))) return;
      offenders.push({ el, left: Math.round(r.left), right: Math.round(r.right) });
    }
  });
  return JSON.stringify({
    nodos: root ? root.querySelectorAll('*').length : -1,
    textoLargo: root ? root.innerText.trim().length : 0,
    nav: !!document.querySelector('nav'),
    footer: !!document.querySelector('footer'),
    vw, scrollW: document.documentElement.scrollWidth,
    offenders: offenders.slice(0, 6).map(o => ({
      tag: o.el.tagName.toLowerCase(), left: o.left, right: o.right,
      text: (o.el.textContent || '').trim().slice(0, 40),
    })),
  });
})()`;

let fallos = 0;
for (const url of urls) {
  consoleErrors = []; exceptions = [];
  await send('Page.navigate', { url });
  await new Promise(r => setTimeout(r, 3800));
  const d = JSON.parse(await ev(PROBE));
  const name = url.split('/').pop().padEnd(30);

  const problemas = [];
  if (exceptions.length) problemas.push(`EXCEPCIÓN: ${exceptions[0]}`);
  if (consoleErrors.length) problemas.push(`consola: ${consoleErrors[0]}`);
  // El umbral de nodos sólo debe cazar el árbol vacío o casi vacío: las páginas
  // simples de este sitio rinden bien con ~130 nodos, así que un piso alto daba
  // falsos positivos. La señal fuerte de rotura son las excepciones y la
  // ausencia de nav/footer, no el conteo.
  if (d.nodos < 40) problemas.push(`#root casi vacío (${d.nodos} nodos)`);
  if (d.textoLargo < 400) problemas.push(`sin texto renderizado (${d.textoLargo} chars)`);
  if (!d.nav) problemas.push('sin <nav>');
  if (!d.footer) problemas.push('sin <footer>');
  if (d.scrollW > d.vw) problemas.push(`desborde +${d.scrollW - d.vw}px`);

  if (problemas.length) {
    fallos++;
    console.log(`FALLA  ${name} ${problemas.join(' | ')}`);
    d.offenders.forEach(o => console.log(`         <${o.tag}> ${o.left}..${o.right} "${o.text}"`));
  } else {
    console.log(`ok     ${name} ${d.nodos} nodos · ${d.textoLargo} chars · ancho ${d.scrollW}`);
  }
}
console.log(`\n${urls.length - fallos}/${urls.length} páginas sanas a ${width}px`);
ws.close();
process.exit(fallos ? 1 : 0);
