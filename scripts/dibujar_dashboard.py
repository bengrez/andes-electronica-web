"""Dibuja el plano del tablero de SACEL con la gramática de la skill dimensional-drawing y lo guarda como SVG.

    python3 scripts/dibujar_dashboard.py

Escribe partes/dibujo-dashboard.svg, con dos variantes del mismo plano: una horizontal (class="dib dib-h", para
pantallas de 47,5 rem o más) y una vertical apilada (class="dib dib-v", para el celular). base.css muestra una y oculta
la otra. scripts/ensamblar.py las copia en sacel.html entre <!-- dibujo-dashboard --> y <!-- /dibujo-dashboard -->.

Qué se toma de la skill (https://github.com/enesozturk/dimensional-drawing, commit 5c45743, MIT): líneas monocromas,
cotas con código en vez de número, ranuras («slot») en vez de contenido, trazo a trazos para lo no definido, notas
numeradas en recuadro, tabla de códigos y [TBD] para lo que no se sabe. «Arquitectura, no contenido».
Qué no: el JS en línea (la CSP sólo admite scripts propios), el ancho mínimo con scroll horizontal, el tema único claro
ni las fuentes externas. El dibujo es SVG estático; los colores los pone base.css (clases .dib-*, variables del tema),
así sirve en claro y oscuro. Determinista: misma entrada, mismo archivo. Sin cifras de Andes: lo que no se sabe es [TBD].
"""
import textwrap
from html import escape
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def n(v):
    """Número corto y estable para atributos SVG."""
    return f"{v:.1f}".rstrip("0").rstrip(".")


class Hoja:
    """Un SVG: acumula elementos y ofrece el instrumental de la skill (cotas, flechas, rótulos, tabla)."""

    def __init__(self, ident, clase, ancho, alto, dz, titulo, descripcion):
        self.id, self.clase, self.ancho, self.alto, self.dz = ident, clase, ancho, alto, dz
        self.titulo, self.descripcion = titulo, descripcion
        self.e = []
        self.flecha = f"url(#{ident}-flecha)"
        self.rayas = f"url(#{ident}-rayas)"

    def add(self, s):
        self.e.append(s)

    # ---- elementos básicos ----
    def rect(self, x, y, w, h, rx, cls, extra=""):
        self.add(f'<rect class="{cls}" x="{n(x)}" y="{n(y)}" width="{n(w)}" height="{n(h)}" rx="{n(rx)}"{extra}/>')

    def linea(self, x1, y1, x2, y2, cls, extra=""):
        self.add(f'<line class="{cls}" x1="{n(x1)}" y1="{n(y1)}" x2="{n(x2)}" y2="{n(y2)}"{extra}/>')

    def texto(self, x, y, s, cls, ancla=None, rot=False):
        a = f' text-anchor="{ancla}"' if ancla else ""
        r = f' transform="rotate(-90 {n(x)} {n(y)})"' if rot else ""
        self.add(f'<text class="{cls}" x="{n(x)}" y="{n(y)}"{a}{r}>{escape(s)}</text>')

    def lineas(self, cx, cy, ls, cls, ancla="middle"):
        """Varias líneas centradas en vertical sobre cy (cada una es un <text> real)."""
        lh = self.dz * 1.3
        y0 = cy - (len(ls) - 1) * lh / 2 + self.dz * 0.35
        for i, s in enumerate(ls):
            self.texto(cx, y0 + i * lh, s, cls, ancla)

    # ---- instrumental de la skill ----
    def dimH(self, x1, x2, y, e1, e2, rot, debajo=False, dx=0, dy=0):
        for x, e in ((x1, e1), (x2, e2)):
            if e is None:
                continue
            s = 1 if y >= e else -1
            self.linea(x, e + s * 3, x, y + s * 5, "dib-ext")
        if x2 - x1 >= 28:
            self.linea(x1, y, x2, y, "dib-cota", f' marker-start="{self.flecha}" marker-end="{self.flecha}"')
        else:
            self.linea(x1 - 13, y, x1, y, "dib-cota", f' marker-end="{self.flecha}"')
            self.linea(x2 + 13, y, x2, y, "dib-cota", f' marker-end="{self.flecha}"')
            self.linea(x1, y, x2, y, "dib-cota")
        self.texto((x1 + x2) / 2 + dx, (y + self.dz + 1 if debajo else y - 4) + dy, rot, "dib-t", "middle")

    def dimV(self, y1, y2, x, e1, e2, rot, lado=None, mueve=0):
        for y, e in ((y1, e1), (y2, e2)):
            if e is None:
                continue
            s = 1 if x >= e else -1
            self.linea(e + s * 3, y, x + s * 5, y, "dib-ext")
        if y2 - y1 >= 28:
            self.linea(x, y1, x, y2, "dib-cota", f' marker-start="{self.flecha}" marker-end="{self.flecha}"')
        else:
            self.linea(x, y1 - 13, x, y1, "dib-cota", f' marker-end="{self.flecha}"')
            self.linea(x, y2 + 13, x, y2, "dib-cota", f' marker-end="{self.flecha}"')
            self.linea(x, y1, x, y2, "dib-cota")
        c = (y1 + y2) / 2 + mueve
        if lado:
            self.texto(x + 6 if lado == "r" else x - 6, c + 4, rot, "dib-t", "start" if lado == "r" else "end")
        else:
            self.texto(x - 5, c, rot, "dib-t", "middle", rot=True)

    def nota_num(self, x, y, num):
        """Número de nota en recuadro."""
        t = self.dz * 0.55
        self.rect(x - t - 1, y - t - 1, 2 * t + 2, 2 * t + 2, 0, "dib-nb")
        self.texto(x, y + self.dz * 0.34, str(num), "dib-nn", "middle")

    def nota(self, x, y, num, texto, ancho_car):
        """Nota numerada con el texto partido en líneas; devuelve la y de la línea siguiente."""
        ls = textwrap.wrap(texto, ancho_car)
        self.nota_num(x, y - self.dz * 0.3, num)
        for i, s in enumerate(ls):
            self.texto(x + self.dz * 1.3, y + i * self.dz * 1.4, s, "dib-n")
        return y + len(ls) * self.dz * 1.4 + self.dz * 0.5

    def tabla(self, x, y, titulo, filas, anchos, rh):
        self.texto(x, y - 10, titulo, "dib-vt")
        todas = [("Código", "Variable", "Valor")] + list(filas)
        for i, fila in enumerate(todas):
            cx = x
            for j, c in enumerate(fila):
                self.rect(cx, y + i * rh, anchos[j], rh, 0, "dib-fino")
                self.texto(cx + 6, y + i * rh + rh / 2 + self.dz * 0.35, c, "dib-th" if i == 0 else "dib-tc")
                cx += anchos[j]
        return y + len(todas) * rh

    def leyenda(self, x, y, paso):
        """Tres muestras de trazo: lo que está en producción, lo que está en desarrollo y la ranura de contenido."""
        mx = x + 26
        self.rect(x, y - 7, 26, 14, 0, "dib-obj")
        self.texto(mx + 8, y + self.dz * 0.35, "En producción", "dib-n")
        self.rect(x, y - 7 + paso, 26, 14, 0, "dib-dev", f' fill="{self.rayas}"')
        self.texto(mx + 8, y + paso + self.dz * 0.35, "En desarrollo", "dib-n")
        self.rect(x, y - 7 + 2 * paso, 26, 14, 0, "dib-ranura")
        self.texto(mx + 8, y + 2 * paso + self.dz * 0.35, "Ranura de contenido", "dib-n")

    # ---- piezas del tablero ----
    def ranura(self, x, y, w, h, lineas, cruz=False):
        self.rect(x, y, w, h, 2, "dib-ranura")
        if cruz:
            self.add(f'<path class="dib-cruz" d="M{n(x)} {n(y)}L{n(x + w)} {n(y + h)}M{n(x + w)} {n(y)}L{n(x)} {n(y + h)}"/>')
        self.lineas(x + w / 2, y + h / 2, lineas, "dib-s")

    def modulo(self, x, y, w, h, nombre, etiqueta_w):
        """Módulo en desarrollo: trazo largo y rayado, con el rótulo «EN DESARROLLO» y su nombre sobre una placa."""
        self.rect(x, y, w, h, 2, "dib-dev", f' fill="{self.rayas}"')
        th = self.dz * 1.9
        self.rect(x + 10, y + 10, etiqueta_w, th, 0, "dib-sello")
        self.texto(x + 10 + etiqueta_w / 2, y + 10 + th / 2 + self.dz * 0.35, "En desarrollo", "dib-sello-t", "middle")
        ph = len(nombre) * self.dz * 1.3 + self.dz * 1.4
        py = y + (h - ph) / 2 + th / 2 + 6
        self.rect(x + 10, py, w - 20, ph, 0, "dib-placa")
        self.lineas(x + w / 2, py + ph / 2, nombre, "dib-s")

    def cadena(self, x, y, w, h, nombres, vertical):
        """Entrada de datos: cuatro cajas con flechas (de izquierda a derecha, o de arriba abajo en el celular)."""
        if vertical:
            sep = 16
            for i, nom in enumerate(nombres):
                yy = y + i * (h + sep)
                self.rect(x, yy, w, h, 2, "dib-obj" if i == len(nombres) - 1 else "dib-caja")
                self.texto(x + w / 2, yy + h / 2 + self.dz * 0.35, nom, "dib-s", "middle")
                if i < len(nombres) - 1:
                    self.linea(x + w / 2, yy + h, x + w / 2, yy + h + sep - 1, "dib-cota", f' marker-end="{self.flecha}"')
            return y + len(nombres) * h + (len(nombres) - 1) * sep, x + w / 2
        bw = (w - 3 * 22) / len(nombres)
        for i, nom in enumerate(nombres):
            xx = x + i * (bw + 22)
            self.rect(xx, y, bw, h, 2, "dib-obj" if i == len(nombres) - 1 else "dib-caja")
            self.texto(xx + bw / 2, y + h / 2 + self.dz * 0.35, nom, "dib-s", "middle")
            if i < len(nombres) - 1:
                self.linea(xx + bw, y + h / 2, xx + bw + 21, y + h / 2, "dib-cota", f' marker-end="{self.flecha}"')
        return y + h, x + 3 * (bw + 22) + bw / 2

    def cerrar(self):
        defs = (f'<defs><marker id="{self.id}-flecha" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" '
                f'markerHeight="7" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path class="dib-punta" d="M0 1.7L10 5 0 8.3z"/></marker>'
                f'<pattern id="{self.id}-rayas" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
                f'<line class="dib-raya" x1="0" y1="0" x2="0" y2="6"/></pattern></defs>')
        borde = f'<rect class="dib-borde" x="4" y="4" width="{n(self.ancho - 8)}" height="{n(self.alto - 8)}" rx="14"/>'
        cab = (f'<svg class="dib {self.clase}" viewBox="0 0 {self.ancho} {n(self.alto)}" role="img" '
               f'aria-labelledby="{self.id}-t {self.id}-d">\n  <title id="{self.id}-t">{escape(self.titulo)}</title>\n'
               f'  <desc id="{self.id}-d">{escape(self.descripcion)}</desc>\n  ')
        return cab + defs + "\n  " + borde + "\n  " + "\n  ".join(self.e) + "\n</svg>\n"


# ---- contenido (sólo lo que sacel.html ya dice en público; lo demás, [TBD]) ----
ENTRADA = ["Tacógrafo", "Trama 4G-LTE", "Plataforma", "Tablero"]
# rótulos de las ranuras: (horizontal, celular); el celular parte las líneas más cortas
MAPA = (["Mapa de la flota", "Posición en tiempo real"], ["Mapa de la flota", "Posición en", "tiempo real"])
REPORTES = (["Reportes por trabajador", "y vehículo"], ["Reportes por", "trabajador", "y vehículo"])
MONITOREO = (["Monitoreo de flota"], ["Monitoreo", "de flota"])
INFRACCIONES = (["Infracciones laborales"], ["Infracciones", "laborales"])
MANTENCIONES = (["Mantenciones"], ["Mantenciones"])
MODULOS = [["Diagnóstico de", "fallas con IA"], ["Seguridad", "en ruta"]]
CODIGOS = [("W", "ancho-tablero", "2·S1+W1+S2+W2"), ("H", "alto-tablero", "2·S1+H1+S2+H2"),
           ("S1", "margen", "[TBD]"), ("S2", "separación", "[TBD]"), ("W1", "col-mapa", "[TBD]"),
           ("W2", "col-lateral", "[TBD]"), ("H1", "fila-superior", "[TBD]"), ("H2", "fila-inferior", "[TBD]"),
           ("W3", "ancho-módulo", "[TBD]"), ("H3", "alto-módulo", "[TBD]")]
NOTAS = ["Arquitectura, no contenido: el plano no lleva datos reales.",
         "Plano esquemático, sin escala: las proporciones no son medidas.",
         "Cada cota es un código; sus valores y fórmulas están en la tabla.",
         "[TBD] = por definir. No se inventan valores.",
         "Los módulos rayados siguen en desarrollo; su lugar en el tablero es [TBD]."]
TITULO = "Plano del tablero de SACEL"
DESCRIPCION = ("Plano esquemático, sin datos reales ni escala. Los datos del tacógrafo viajan por la red 4G-LTE a la plataforma "
               "y llegan al tablero. El tablero, en producción, tiene cinco ranuras: mapa de la flota con la posición en tiempo "
               "real, reportes por trabajador y vehículo, monitoreo de flota, infracciones laborales y mantenciones. Dos módulos "
               "marcados «en desarrollo», con trazo a trazos, aún no tienen lugar definido: diagnóstico de fallas con IA y "
               "seguridad en ruta. Las medidas están por definir ([TBD]).")


def tablero(h, ox, oy, S, W1, W2, H1, H2, v):
    """Marco del tablero con sus cinco ranuras (misma disposición en las dos variantes). Devuelve (ancho, alto) del marco."""
    W = 2 * S + W1 + S + W2
    H = 2 * S + H1 + S + H2
    h.rect(ox, oy, W, H, 4, "dib-obj")
    x1, x2 = ox + S, ox + S + W1 + S
    ya, yb = oy + S, oy + S + H1 + S
    hl = (H1 - S) / 2
    h.ranura(x1, ya, W1, H1, MAPA[v], cruz=True)
    h.ranura(x2, ya, W2, hl, MONITOREO[v])
    h.ranura(x2, ya + hl + S, W2, hl, INFRACCIONES[v])
    h.ranura(x1, yb, W1, H2, REPORTES[v])
    h.ranura(x2, yb, W2, H2, MANTENCIONES[v])
    return W, H


def cotas_tablero(h, ox, oy, S, W1, W2, H1, H2, W, H, x_cadena, x_total, y_cadena, y_total, esc=9):
    """Cadenas de cotas: izquierda (S1 · H1 · S2 · H2 · S1) y abajo (S1 · W1 · S2 · W2 · S1), más el total de cada una."""
    xs = [ox, ox + S, ox + S + W1, ox + 2 * S + W1, ox + 2 * S + W1 + W2, ox + W]
    for k, ((a, b), c) in enumerate(zip(zip(xs, xs[1:]), ["S1", "W1", "S2", "W2", "S1"])):
        h.dimH(a, b, y_cadena, oy + H, oy + H, c, debajo=True, dx={0: -esc, 4: esc}.get(k, 0))
    h.dimH(ox, ox + W, y_total, y_cadena, y_cadena, "W", debajo=False)
    ys = [oy, oy + S, oy + S + H1, oy + 2 * S + H1, oy + 2 * S + H1 + H2, oy + H]
    for k, ((a, b), c) in enumerate(zip(zip(ys, ys[1:]), ["S1", "H1", "S2", "H2", "S1"])):
        h.dimV(a, b, x_cadena, ox, ox, c, mueve={0: -esc, 4: esc}.get(k, 0))
    h.dimV(oy, oy + H, x_total, x_cadena, x_cadena, "H")


def horizontal():
    dz = 12.5
    h = Hoja("dib-h", "dib-h", 900, 868, dz, TITULO, DESCRIPCION)
    ox, oy, S, W1, W2, H1, H2 = 74, 152, 14, 300, 218, 220, 118
    # entrada de datos (arriba) y flecha hacia el tablero
    h.texto(ox, 30, "Entrada de datos", "dib-vt")
    y_fin, x_tab = h.cadena(ox, 44, 3 * S + W1 + W2, 48, ENTRADA, False)
    h.linea(x_tab, y_fin, x_tab, oy - 2, "dib-cota", f' marker-end="{h.flecha}"')
    h.texto(ox, oy - 8, "Tablero · en producción", "dib-vt")
    W, H = tablero(h, ox, oy, S, W1, W2, H1, H2, 0)
    cotas_tablero(h, ox, oy, S, W1, W2, H1, H2, W, H, ox - 18, ox - 42, oy + H + 26, oy + H + 70)
    # módulos en desarrollo, a la derecha, unidos al tablero por una línea de trazo (su lugar es [TBD])
    mx, mw, mh = 684, 184, 180
    for i, nom in enumerate(MODULOS):
        my = oy + i * (mh + 20)
        h.modulo(mx, my, mw, mh, nom, 122)
        h.linea(ox + W + 2, my + mh / 2, mx - 2, my + mh / 2, "dib-fantasma")
        h.texto((ox + W + mx) / 2, my + mh / 2 - 5, "[TBD]", "dib-t", "middle")
    h.dimH(mx, mx + mw, oy - 18, oy, oy, "W3")
    h.dimV(oy, oy + mh, mx + mw + 18, mx + mw, mx + mw, "H3")
    # leyenda arriba a la derecha
    h.leyenda(mx, 54, 24)
    # tabla de códigos y notas
    ty = oy + H + 124
    h.tabla(ox, ty, "Códigos", CODIGOS, [58, 120, 146], 18)
    ny = ty + 6
    h.texto(ox + 340, ty - 10, "Notas:", "dib-vt")
    for i, nt in enumerate(NOTAS, 1):
        ny = h.nota(ox + 354, ny + 8, i, nt, 52)
    h.alto = max(ty + 11 * 18, ny - 6) + 22
    return h.cerrar()


def vertical():
    dz = 11
    h = Hoja("dib-v", "dib-v", 340, 0, dz, TITULO, DESCRIPCION)
    ox, S, W1, W2, H1, H2 = 52, 10, 138, 108, 140, 76
    W = 3 * S + W1 + W2
    h.texto(ox, 30, "Entrada de datos", "dib-vt")
    y_fin, x_tab = h.cadena(ox, 42, W, 28, ENTRADA, True)
    oy = y_fin + 40
    h.linea(x_tab, y_fin, x_tab, oy - 2, "dib-cota", f' marker-end="{h.flecha}"')
    h.texto(ox, oy - 8, "Tablero · en producción", "dib-vt")
    W, H = tablero(h, ox, oy, S, W1, W2, H1, H2, 1)
    cotas_tablero(h, ox, oy, S, W1, W2, H1, H2, W, H, ox - 14, ox - 30, oy + H + 24, oy + H + 56, esc=5)
    # módulos en desarrollo, uno junto al otro, bajo el tablero
    my = oy + H + 104
    mw, mh = 132, 118
    h.texto(ox, my - 12, "Módulos en desarrollo", "dib-vt")
    for i, nom in enumerate(MODULOS):
        mx = ox + i * (W - mw)
        h.modulo(mx, my, mw, mh, nom, 108)
    h.dimH(ox, ox + mw, my + mh + 22, my + mh, my + mh, "W3", debajo=False)
    h.dimV(my, my + mh, ox - 14, ox, ox, "H3")
    # leyenda, tabla y notas, una debajo de otra
    ly = my + mh + 70
    h.leyenda(ox, ly, 22)
    ty = ly + 2 * 22 + 52
    fin = h.tabla(ox, ty, "Códigos", CODIGOS, [50, 104, 122], 18)
    ny = fin + 40
    h.texto(ox, ny - 14, "Notas:", "dib-vt")
    for i, nt in enumerate(NOTAS, 1):
        ny = h.nota(ox + 8, ny + 6, i, nt, 36)
    h.alto = ny + 14
    return h.cerrar()


def main():
    texto = horizontal() + vertical()
    destino = RAIZ / "partes/dibujo-dashboard.svg"
    destino.write_text(texto)
    print(f"{destino.relative_to(RAIZ)}: {len(texto) / 1024:.1f} KB")


if __name__ == "__main__":
    main()
