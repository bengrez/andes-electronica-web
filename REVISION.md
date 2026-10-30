# Guía para revisar este repositorio

Esta guía es para quien evalúe el sitio, sea una persona o un asistente de IA: dónde está cada cosa, qué se pidió y qué
límites ya conocemos. Para el estado general, ver el [README](README.md).

## Qué se pidió (criterios de Andes)

1. **Plana y auditable.** HTML estático simple, sin frameworks ni paso de compilación para publicar, y legible por una
   persona.
2. **Accesible.** Foco visible, enlace para saltar al contenido, contraste, respeto de «reducir movimiento» y una forma
   de pausar lo que se mueve solo.
3. **Lista para desplegar.** Un conjunto de archivos para copiar al servidor, con instrucciones.
4. **Sin cifras ni promesas que Andes no haya confirmado.**
5. **SACEL** presentado como Sistema de Aseguramiento de Conducción Eficiente y Legal.

## Mapa de ramas

| Rama | Qué contiene | Se publica en |
|---|---|---|
| `iter/001-sitio-plano` | **Versión nueva**, escrita a mano | `gh-pages/nuevo/` → https://bengrez.github.io/andes-electronica-web/nuevo/ |
| `gh-pages` | Lo publicado: `nuevo/`, `anterior/` y las variantes `v1-original/`, `v2-deep-teal/` y `v3-near-black/` del primer preview | https://bengrez.github.io/andes-electronica-web/ |
| `main` | Código original de Claude Design (React + Babel en el navegador) | No se publica tal cual: su forma plana es `gh-pages/anterior/` |

## Versión nueva (`iter/001-sitio-plano`): cómo leerla

Empezar por [`LEEME.md`](../../blob/iter/001-sitio-plano/LEEME.md), que explica qué hace cada archivo. En resumen:

- **Escrito a mano, para leer:**
  - 7 páginas `.html`;
  - `base.css` (≈450 líneas);
  - el JavaScript de las animaciones: `flota-3d.js` (≈920 líneas, la portada en WebGL), `flota-sim.js`,
    `flota-mapa.js`, `flota-perfil.js`, `flota.js`, `productos-nube.js`, `clientes.js`, `tacografo-3d.js` y `sitio.js`.
- **Datos generados por scripts, no para editar a mano:**
  - `datos/h25.js`: ruta y relieve, generado con `scripts/preparar_h25.py`;
  - `datos/tacografo-modelo.js`: modelo 3D, ≈2,8 MB, legible pero largo; lo genera `scripts/extraer_tacografo.py`;
  - `img/alturas-3d.png` y los relieves.
- **No se publican:**
  - `scripts/`: los generadores; su salida ya está guardada, así que no hay que correrlos para desplegar;
  - `partes/`: barra y pie comunes, que `scripts/ensamblar.py` copia a las páginas;
  - `muestras/`: bocetos de exploración visual de la primera iteración.

## Versión anterior (`gh-pages/anterior/`): cómo leerla

- Los `.html` publicados son **generados**. Se abrió cada página React en un navegador y se guardó el HTML resultante sin
  scripts. Por eso son largos y traen estilos en línea: se pueden auditar (no ejecutan nada), pero no se editan a mano.
- La fuente editable está en `anterior/_fuente/`: los `.jsx`, `compilar.mjs`, que pasa los `.jsx` a JS, y
  `aplanar.mjs`, que genera las páginas planas.
- `Industrias.html` pesa ≈440 KB porque trae los patrones de las industrias como SVG en línea.

## Límites conocidos (para no descubrirlos de nuevo)

- **La versión nueva usa JavaScript** para las animaciones (WebGL y canvas). Es JS propio, sin dependencias, y la
  página se lee completa sin él (sin JS o sin WebGL queda una versión fija), pero no es «HTML sin scripts» como la
  anterior.
- **Peso:** la nueva pesa ≈4,7 MB en disco. Lo mayor es el modelo 3D (2,8 MB, ≈250 KB con gzip del servidor).
- **Probado** en Chromium de escritorio (1366 a 1850 px) y a 390 px de ancho, en temas claro y oscuro. No se ha probado en
  Safari, en Firefox ni en equipos de bajo rendimiento; el costo por cuadro de la portada no está medido.
- **Contraste:** no hay una auditoría formal de contraste (WCAG); se revisó a ojo en ambos temas.
- **La anterior** muestra en estado final lo que en React se animaba. En los productos destacados de la portada se ven
  las tres pestañas, pero queda fija la primera.
- **Pendiente de Andes:** permiso para los logos de clientes (sólo Turbus confirmado), la línea de autoría del pie, los
  campos de la trama que se muestran y si el modelo 3D legible (reconstruido desde fotos de tacógrafos reales) puede
  quedar en un repositorio público.

## Cómo probarla en un equipo

```
git clone https://github.com/bengrez/andes-electronica-web.git && cd andes-electronica-web
git switch iter/001-sitio-plano
python3 -m http.server 8000        # abrir http://localhost:8000
```

Abrir los `.html` con doble clic (`file://`) no sirve para el relieve 3D de la portada.
