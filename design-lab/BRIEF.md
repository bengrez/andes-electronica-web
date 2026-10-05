# Brief para explorar dirección visual — Andes Electrónica

> Pegá este texto en la conversación de claude.ai junto con
> `andes-design-lab.html`. Está escrito para que lo lea el modelo, no para
> archivo interno.

## Contexto

Andes Electrónica es una empresa chilena de ingeniería electrónica fundada el
1° de diciembre de 1991, con sede en Ñuñoa, Santiago. Diseña y fabrica hardware
propio —tacógrafos certificados, visores de velocidad, periféricos— y opera
SACEL, su plataforma de gestión de flota. Sus clientes son operadores de
transporte, minería, defensa y telecomunicaciones. No es una startup: es una
empresa de ingeniería con treinta y cinco años de operación continua y
certificaciones regulatorias que son parte central de su propuesta de valor.

El archivo adjunto reúne en una sola página **todas las superficies visuales**
del sitio institucional (que en producción son 13 páginas), con el contenido
real. La dirección visual actual es la que ves: teal profundo `#0c3d5c` con
acento cobre `#c07d2e`, Space Grotesk para titulares, DM Sans para cuerpo y
JetBrains Mono para metadatos y credenciales.

## Qué se busca

Explorar **direcciones visuales alternativas**. No permutaciones menores de la
paleta actual: propuestas con criterio propio sobre cómo debería verse una
empresa de ingeniería electrónica chilena de esta antigüedad y este rubro.

Interesa especialmente resolver una tensión abierta: hoy el sitio usa cobre +
Space Grotesk + DM Sans, pero una decisión de diseño previa (sin implementar)
fijaba dorado champagne `#C49B45` + DM Serif Display + Inter, con un carácter
más editorial. Ambas familias están cargadas en el archivo. Vale la pena ver
las dos direcciones llevadas hasta el final, y también terceras opciones.

Presentá cada dirección completa y aplicada a todas las superficies, no como
paleta suelta. Lo que se evalúa es cómo se ve el sitio entero.

## Restricciones

**No cambiar el texto.** Es contenido de un cliente real:

- Los datos de contacto, la dirección, el horario, la razón social y las
  certificaciones (ISO 9001, Res. DT N°139/2009, Res. Exenta N°1081) son
  canónicos y están verificados.
- Hay cifras que están **explícitamente prohibidas** de publicar por el cliente.
  No agregar métricas, números de clientes, unidades instaladas, porcentajes de
  uptime ni SLAs, aunque el diseño "pida" un número ahí.
- Si una dirección visual necesita otro texto para funcionar, dejalo como
  comentario en el HTML en vez de reescribirlo.

**No cambiar la estructura de secciones ni los atributos `data-surface`.** Se
usan para portar el resultado al sitio real.

**No agregar dependencias externas.** Sólo Google Fonts, que ya está cargado.
Nada de CDNs de iconos, librerías de animación ni imágenes remotas.

**Mantener el responsive.** Los breakpoints reales del sitio son 720px y 1080px,
y ya están en el archivo. Cualquier dirección tiene que funcionar en teléfono:
el sitio se ve mayoritariamente desde ahí.

## Cómo entregar el resultado

Toda decisión visual debería vivir en el bloque `:root` de tokens que está al
inicio del `<style>`. Mientras más contenida esté ahí la dirección, más directo
es llevarla al sitio real —que está escrito en React con estilos inline y lee
sus valores desde una única función de tema—.

Si una dirección necesita cambios de componente que no se pueden expresar como
token, está bien: hacelos, pero dejá el token como fuente cuando se pueda.

Devolver el archivo HTML completo por cada dirección explorada.
