# Andes Electrónica · Sitio web

Sitio institucional de Andes Electrónica. Build estático — listo para servir desde GitHub Pages, Netlify, Cloudflare Pages o cualquier file server.

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
