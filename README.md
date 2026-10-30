# Andes Electrónica · Sitio web

Sitio institucional de Andes Electrónica, en revisión con Andes. Hay **dos versiones** publicadas en GitHub Pages para
compararlas. Las dos son planas: se sirven como archivos estáticos, sin compilación en el servidor ni servicios externos.

| Versión | Enlace | Código |
|---|---|---|
| **Nueva** (plana, escrita a mano) | https://bengrez.github.io/andes-electronica-web/nuevo/ | rama [`iter/001-sitio-plano`](../../tree/iter/001-sitio-plano) |
| **Anterior** (diseño de Claude Design, aplanado) | https://bengrez.github.io/andes-electronica-web/anterior/ | rama `main` (este README) y [`gh-pages/anterior/_fuente`](../../tree/gh-pages/anterior/_fuente) |

**Para revisar o evaluar el repositorio** (también con un asistente de IA), empezar por [`REVISION.md`](REVISION.md): mapa de
ramas, qué es escrito a mano y qué es generado, criterios de Andes y límites conocidos.

La raíz https://bengrez.github.io/andes-electronica-web/ lleva a la anterior. Las variantes de color del primer
preview siguen en `v1-original/`, `v2-deep-teal/` y `v3-near-black/` de la rama `gh-pages`, sin cambios.

## Qué se ha hecho (hasta el 30-oct-2026)

### Versión nueva (`iter/001-sitio-plano`)
- HTML, CSS y JavaScript escritos a mano, sin frameworks, sin paso de compilación y sin CDN; fuentes e imágenes
  incluidas. 7 páginas: inicio, productos, SACEL, servicios, empresa, contacto y privacidad.
- Portada: relieve 3D de la ruta H-25 hacia Sewell (OpenStreetMap y Terrain Tiles) con buses que envían tramas a la
  nube de SACEL. Después, la sección Productos contada por etapas con el scroll.
- SACEL presentado con su sigla: Sistema de Aseguramiento de Conducción Eficiente y Legal.
- Modelo 3D del tacógrafo como datos legibles (`datos/tacografo-modelo.js`), no comprimido.
- Accesibilidad: enlace para saltar al contenido, foco visible, temas claro y oscuro, botones «Pausar animación» y
  respeto de «reducir movimiento».
- Entrega para desplegar: [`LEEME.md`](../../blob/iter/001-sitio-plano/LEEME.md) explica qué se copia, cómo se sirve y
  qué hace cada archivo.

### Versión anterior (`gh-pages/anterior/`)
- Es la variante 1 del primer preview, con el texto de portada y la sigla de SACEL nuevos.
- **Plana:** cada página es HTML estático, sin ningún `<script>`, sin cookies ni analítica, y sin Google Fonts ni Font
  Awesome (las fuentes van incluidas).
  - Los menús desplegables funcionan con CSS.
  - Lo que en React se animaba quedó en su estado final.
- La fuente React se conserva en `anterior/_fuente/` (no se publica). Con `compilar.mjs` y `aplanar.mjs` se regeneran
  las páginas; los pasos están en el README de la rama `gh-pages`.

### Pendiente de confirmar con Andes
- Uso de los logos de clientes (sólo Turbus confirmado).
- Línea de autoría en el pie.
- Campos de la trama que se muestran.
- El modelo 3D legible proviene de una reconstrucción a partir de fotos de tacógrafos reales.

---

## Sobre esta rama (`main`): la versión de Claude Design original

Lo que sigue describe el código de esta rama tal como llegó de Claude Design (React + Babel en el navegador). Ya **no** es
lo que se publica: la versión anterior publicada es su forma plana, en `gh-pages/anterior/`.

## Estructura

```
index.html                       ← Home (entrada principal)
Andes Home Exploration.html      ← Redirect legacy → index.html
{Producto,Servicio,Empresa,...}.html
*.jsx                            ← Componentes (React inline + Babel runtime)
data/
  runtime.config.json            ← Configuración runtime (GA4 ID, etc.)
assets/
  hero/                          ← Imágenes del hero (esfera AE)
  logos/                         ← Logo Andes + logos de clientes
  certifications/                ← Imagen del certificado ISO 9001
  images/                        ← Fotografía y diagramas adicionales
  maps/                          ← Mapa de Chile vectorial
```

## Desplegar en GitHub Pages

1. Crear un repo nuevo (público o privado con Pages habilitado).
2. Copiar el contenido de esta carpeta a la raíz del repo (o a `/docs` si se prefiere esa convención).
3. En Settings → Pages, seleccionar la rama y carpeta correspondiente.
4. El sitio queda disponible en `https://<usuario>.github.io/<repo>/`.

Nota: GitHub Pages sirve archivos estáticos. El sitio NO requiere build step — Babel transpila los `.jsx` en el cliente. Si en algún momento se desea pre-compilar para mejorar tiempos de carga, ver "Próximos pasos" abajo.

## Configurar Google Analytics

Editar `data/runtime.config.json` y reemplazar `ga4MeasurementId` con el ID real (formato `G-XXXXXXXXXX`). Hasta que esté poblado, analytics queda silenciado aunque el usuario consienta cookies analíticas.

## Próximos pasos sugeridos (P8 + roadmap)

- **Build pipeline**: pre-compilar los `.jsx` con `esbuild` o `vite build` para producción. Reduce el tiempo de primera renderización.
- **Optimización de imágenes**: convertir PNG a WebP/AVIF y servir `srcset` por resolución.
- **Sitemap + robots.txt**: agregar si se quiere indexación específica.
- **Página "Casos de éxito"**: out-of-scope en esta fase, anotada para release futuro.

## Archivos NO necesarios para deploy

Ver `.gitignore` adjunto. Se excluyen carpetas de exploración (`debug/`, `uploads/`), screenshots y archivos sandbox que no son referenciados por ningún HTML público.
