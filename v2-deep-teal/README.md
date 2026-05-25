# Andes Electrónica · build "Deep Teal"

Build pre-configurado para la paleta **Deep Teal** (navy + cobre · paleta original). Pensado para subirse a una branch dedicada de GitHub Pages para review de stakeholders.

## Qué tiene de distinto este build

- La paleta queda **fijada** en `deep-teal`. Cualquier preferencia previa guardada en `localStorage` se sobreescribe en cada carga, así un stakeholder que viene de otra branch nunca queda atrapado en la paleta equivocada.
- El badge **BETA** aparece en la esquina inferior izquierda de todas las páginas (avisa que los números mostrados están en validación).
- Todo lo demás (estructura, copy, assets, formulario, cookies, ISO 9001, etc.) es idéntico al build canónico.

## Desplegar en GitHub Pages

1. Crear una branch nueva (ej. `pages-deep-teal`).
2. Copiar el contenido de esta carpeta a la raíz de la branch.
3. Settings → Pages → seleccionar esa branch.
4. El sitio queda en `https://<usuario>.github.io/<repo>/`.

## Activar Analytics

Editar `data/runtime.config.json` y poner el ID real de GA4 (formato `G-XXXXXXXXXX`). Hasta entonces, analytics queda silenciado aunque se acepten cookies.

## Quitar el badge BETA

Cuando el sitio esté listo para release público, eliminar la línea `<script type="text/babel" src="./beta-badge.jsx"></script>` de cada `*.html` (también puede borrarse el archivo `beta-badge.jsx`).
