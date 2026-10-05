# Arneses de verificación — `v1-original`

Dos chequeos que se corren antes de dar por buena cualquier tanda de cambios.
Nacieron de una regresión concreta: el sprint UX de 2026-07-26 dejó dos páginas
lanzando `ReferenceError` en render, y la auditoría de entonces las aprobó
**porque sólo medía desborde horizontal — y una página en blanco no desborda**.

## `scope_check.py`

Detecta identificadores locales (`gcol`, `isMobile`, `pad`…) usados en un
subcomponente que no los declara. Es exactamente el error que rompió
`Empresa.html` e `Industrias.html`: el pase mecánico envolvió grillas en
`gcol(...)` en todo el archivo, pero declaró el helper sólo en el componente de
página.

```bash
python3 tools/scope_check.py
```

Reporta 3 falsos positivos conocidos en `shared.jsx` (destructuring y
parámetros por defecto que el segmentador no distingue). Cualquier otra línea
es real.

## `health.mjs`

Verifica que cada página **renderice** y recién después mide el layout:

1. excepciones no capturadas y errores de consola;
2. que `#root` tenga nodos y texto real;
3. que existan `<nav>` y `<footer>`;
4. desborde horizontal (`scrollWidth` vs viewport), descartando lo recortado
   por `overflow:hidden`.

Requiere un Chrome con CDP y el sitio servido:

```bash
python3 -m http.server 5599 &            # desde v1-original/
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir=/tmp/cdp about:blank &

node --experimental-websocket tools/health.mjs 390 \
  http://127.0.0.1:5599/index.html http://127.0.0.1:5599/Empresa.html
```

Primer argumento: ancho del viewport. Correr al menos en 390, 768 y 1440.
Sale con código 1 si alguna página falla, así que sirve como gate.

`--experimental-websocket` es necesario en Node 20; en Node 22+ sobra.
