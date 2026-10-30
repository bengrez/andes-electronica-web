# Sitio de Andes Electrónica: entrega para desplegar

Sitio estático y plano: HTML, CSS y JavaScript escritos a mano, sin frameworks, sin paso de compilación y sin
servicios externos. Las fuentes, las imágenes y los datos van incluidos. Se publica copiando la carpeta.

## Desplegar

1. Copiar al servidor web el contenido de esta carpeta, **excepto** `scripts/`, `muestras/` y este `LEEME.md`, que no
   se publican.
2. Servirla tal cual, con cualquier servidor de archivos estáticos (Apache, nginx, GitHub Pages…). No hay rutas
   dinámicas: cada página es su propio `.html`.
3. Recomendado: compresión gzip o brotli para `.js`, `.css` y `.html`. El archivo más pesado,
   `datos/tacografo-modelo.js` (≈2,8 MB), baja a ≈250 KB comprimido.

Para probarla en el equipo: `python3 -m http.server 8000` dentro de la carpeta y abrir `http://localhost:8000`.
Abrir los `.html` con doble clic (`file://`) no sirve para el mapa 3D, porque el navegador bloquea la lectura de las
imágenes de relieve.

## Qué hay en cada archivo

| Archivo | Qué es |
|---|---|
| `index.html`, `productos.html`, `sacel.html`, `servicios.html`, `empresa.html`, `contacto.html`, `privacidad.html`, `iso.html` | Las 8 páginas |
| `descargas/` | Archivos para descargar: el certificado ISO 9001 en PDF |
| `base.css` | Todos los estilos, temas claro y oscuro |
| `sitio.js` | Botón de tema y página actual en la barra |
| `flota-3d.js`, `flota-sim.js`, `flota-mapa.js`, `flota-perfil.js`, `flota.js` | Portada: relieve 3D de la ruta H-25, buses, tramas a SACEL, flora y aves |
| `productos-nube.js` | Inicio, sección Productos: etapas con el scroll, antena, nube de SACEL y versión del tacógrafo |
| `clientes.js` | Fichas de clientes tipo tablero de paletas |
| `tacografo-3d.js` | Modelo 3D del tacógrafo en `productos.html` |
| `datos/h25.js` | Ruta H-25 y relieve (de OpenStreetMap y Terrain Tiles) |
| `datos/tacografo-modelo.js` | Modelo 3D del tacógrafo, como datos legibles (materiales, piezas y mallas) |
| `img/`, `fuentes/` | Imágenes y fuentes; licencias de las fuentes en `fuentes/LICENCIAS.txt` |

## Lo que se genera con scripts (no hay que correrlos para desplegar)

El resultado de cada script ya está guardado en la carpeta. Sólo hacen falta para cambiar esas piezas.

| Script | Genera | Cuándo |
|---|---|---|
| `scripts/ensamblar.py` | Copia la barra, la cabecera, el pie y las ilustraciones de `partes/` a las 7 páginas | Al cambiar algo de `partes/` |
| `scripts/ilustrar_productos.py` | `partes/ilustracion-*.svg` (dibujos de los productos con curvas de nivel) | Al cambiar un dibujo |
| `scripts/preparar_h25.py` | `datos/h25.js`, `img/alturas-3d.png` y los relieves | Al cambiar la ruta o el recorte del mapa |
| `scripts/extraer_tacografo.py` | `datos/tacografo-modelo.js`, desde la animación original | Al cambiar el modelo 3D |

## Seguridad

El sitio no tiene formularios, cookies, analítica ni conexiones a otros servidores: es de sólo lectura y no expone
ningún sistema de Andes. Cada página declara una política de seguridad de contenido (`Content-Security-Policy`) que
sólo permite los scripts propios del sitio (los dos `<script>` en línea van por hash) y prohíbe conectarse a otros
dominios, enviar formularios e incrustar objetos. `scripts/ensamblar.py` recalcula los hashes. Si el servidor lo permite,
conviene agregar además la cabecera `X-Frame-Options: DENY` (o `frame-ancestors 'none'`), que no se puede fijar desde
el HTML.

## Accesibilidad

Enlace «Saltar al contenido», foco visible, temas claro y oscuro, y botón «Pausar animación» donde algo se mueve solo.
Con «reducir movimiento» activado en el sistema, las animaciones se detienen y el contenido queda a la vista. Sin
JavaScript o sin WebGL, cada sección muestra una versión fija.

## Pendiente de confirmar con Andes

- Logos de clientes: sólo Turbus tiene autorización confirmada.
- Línea de autoría en el pie.
- Campos de la trama que se muestran («GPS · velocidad · CAN · conductor»).
- El modelo 3D legible se reconstruyó a partir de fotos de tacógrafos reales.
