# Andes Electrónica · Sitio web — 3 variantes en preview

Sitio institucional de Andes Electrónica, en revisión interna. Tres variantes visuales conviven en este repositorio bajo subcarpetas, servidas desde GitHub Pages.

## Estructura

```
index.html         ← Redirect a anterior/ (entrada por defecto, desde el 2026-10-30)
anterior/          ← Variante 1 actualizada y plana: HTML estático, sin JavaScript, cookies ni CDN (fuente en anterior/_fuente/)
nuevo/             ← Versión nueva, plana (HTML, CSS y JS escritos a mano); fuente en la rama iter/001-sitio-plano
v1-original/       ← Variante 1 — paleta light, accent copper (publicada inicialmente)
v2-deep-teal/      ← Variante 2 — paleta deep-teal
v3-near-black/     ← Variante 3 — paleta near-black
```

Las 3 variantes son builds estáticos autocontenidos (HTML + JSX + Babel runtime en el cliente). No requieren build step.

## URLs

- Root (redirige a anterior): `https://bengrez.github.io/andes-electronica-web/`
- Versión anterior plana: `https://bengrez.github.io/andes-electronica-web/anterior/`
- Versión nueva: `https://bengrez.github.io/andes-electronica-web/nuevo/`
- Variante 1: `https://bengrez.github.io/andes-electronica-web/v1-original/`
- Variante 2: `https://bengrez.github.io/andes-electronica-web/v2-deep-teal/`
- Variante 3: `https://bengrez.github.io/andes-electronica-web/v3-near-black/`

## Disclaimer

Las 3 variantes muestran un banner BETA persistente en esquina inferior izquierda con el texto: *"Sitio en validación — números y datos sujetos a confirmación."* — para evitar que el preview se interprete como sitio oficial mientras está expuesto en internet.

## Configurar Google Analytics

Editar `<variante>/data/runtime.config.json` y reemplazar `ga4MeasurementId` con el ID real (formato `G-XXXXXXXXXX`). Hasta que esté poblado, analytics queda silenciado aunque el usuario consienta cookies analíticas.

## Próximos pasos sugeridos

- Recoger feedback de stakeholders sobre las 3 variantes.
- Consolidar en una sola y pre-compilar los `.jsx` con `esbuild` o `vite build` para producción.
- Optimización de imágenes (WebP/AVIF + `srcset`).
- Sitemap + robots.txt una vez decidida la variante final.

## Archivos NO necesarios para deploy

Ver `.gitignore`. Se excluyen `debug/` y `uploads/` (sandbox de exploración).

## Versión anterior plana (`anterior/`, 2026-10-30)

Copia de `v1-original/` con el texto de portada y la sigla de SACEL nuevos, sin cookies ni analítica, y publicada como
HTML estático: las páginas no cargan JavaScript, React ni nada desde CDN; las fuentes están en `anterior/fuentes/` y los
menús desplegables se abren con CSS. Lo que en React se animaba quedó en su estado final.

La fuente React está en `anterior/_fuente/` (Jekyll no publica las carpetas con `_`). Para regenerar las páginas después
de editar un `.jsx`:

    npm install esbuild@0.24.0 playwright             # en una carpeta aparte; npx playwright install chromium
    cd anterior/_fuente
    node compilar.mjs <carpeta>/node_modules/esbuild    # .jsx → js/
    node aplanar.mjs <carpeta>/node_modules/playwright  # js/ → ../*.html, planas
