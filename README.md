# Andes Electrónica · Sitio web — 3 variantes en preview

Sitio institucional de Andes Electrónica, en revisión interna. Tres variantes visuales conviven en este repositorio bajo subcarpetas, servidas desde GitHub Pages.

## Estructura

```
index.html         ← Redirect a v1-original/ (entrada por defecto)
v1-original/       ← Variante 1 — paleta light, accent copper (publicada inicialmente)
v2-deep-teal/      ← Variante 2 — paleta deep-teal
v3-near-black/     ← Variante 3 — paleta near-black
```

Las 3 variantes son builds estáticos autocontenidos (HTML + JSX + Babel runtime en el cliente). No requieren build step.

## URLs

- Root (redirige a v1): `https://bengrez.github.io/andes-electronica-web/`
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
