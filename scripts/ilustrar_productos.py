"""Dibuja los productos con las curvas de nivel de la H-25 (las mismas del relieve de la portada) y los guarda como SVG.

    python3 scripts/ilustrar_productos.py

Lee datos/h25.js (curvas cada 100 m, Terrain Tiles) y escribe partes/ilustracion-<pieza>.svg para el tacógrafo, la
tarjeta SmartCard, el display alfanumérico y el visor VI7GPS. scripts/ensamblar.py los copia en las páginas entre
<!-- ilustracion-<pieza> --> y <!-- /ilustracion-<pieza> -->.
Cada dibujo: la silueta frontal del equipo rellena con un recorte distinto de las curvas de nivel, y un pulso de cobre.
El pulso sube cuando el equipo entrega datos a SACEL (tacógrafo, tarjeta) y baja cuando los recibe para mostrarlos al
pasajero (display, visor). Determinista: misma entrada, mismos archivos. Los colores los pone base.css (clases .ilus-*),
así sirven en los dos temas.
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TOLERANCIA = 0.8                        # px, simplificación de las curvas ya escaladas


def leer_h25():
    t = (RAIZ / "datos/h25.js").read_text()
    return json.loads(t[t.index("{"):t.rindex("}") + 1])


def dp(pts, tol):
    """Douglas-Peucker."""
    if len(pts) < 3:
        return pts
    (x0, y0), (x1, y1) = pts[0], pts[-1]
    dx, dy = x1 - x0, y1 - y0
    l = (dx * dx + dy * dy) ** 0.5 or 1e-9
    peor, k = 0.0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + x1 * y0 - y1 * x0) / l
        if d > peor:
            peor, k = d, i
    if peor <= tol:
        return [pts[0], pts[-1]]
    return dp(pts[:k + 1], tol)[:-1] + dp(pts[k:], tol)


def chaikin(pts, vueltas=3):
    """Suaviza la polilínea (las curvas vienen simplificadas a 55 m y, ampliadas, se ven quebradas)."""
    for _ in range(vueltas):
        if len(pts) < 3:
            return pts
        nuevo = [pts[0]]
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            nuevo += [(0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1), (0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1)]
        pts = nuevo + [pts[-1]]
    return pts


def recortes(D, ancho_m, alto_m, usados):
    """El recorte del mapa con más puntos de curva que no se superpone con los ya usados."""
    puntos = [(c[i], c[i + 1]) for e, c in D["curvas"] for i in range(0, len(c), 2)]
    mejor, xy = -1, (0, 0)
    for x0 in range(0, int(D["ancho"] - ancho_m), 500):
        for y0 in range(0, int(D["alto"] - alto_m), 500):
            if any(x0 < ux + uw and ux < x0 + ancho_m and y0 < uy + uh and uy < y0 + alto_m for ux, uy, uw, uh in usados):
                continue
            n = sum(1 for x, y in puntos if x0 <= x <= x0 + ancho_m and y0 <= y <= y0 + alto_m)
            if n > mejor:
                mejor, xy = n, (x0, y0)
    return xy


def curvas(D, cuerpo, ventana_m, usados):
    """Trazo SVG de las curvas que caen en el cuerpo (x, y, ancho, alto), con un recorte de ventana_m de ancho."""
    cx, cy, cw, ch = cuerpo
    alto_m = ventana_m * ch / cw
    x0, y0 = recortes(D, ventana_m, alto_m, usados)
    usados.append((x0, y0, ventana_m, alto_m))
    esc = cw / ventana_m
    trazos = []
    for elev, c in D["curvas"]:
        tramo = []
        for i in range(0, len(c), 2):
            x, y = cx + (c[i] - x0) * esc, cy + (c[i + 1] - y0) * esc
            if cy - 2 <= y <= cy + ch + 2 and cx - 2 <= x <= cx + cw + 2:
                tramo.append((x, y))
            elif tramo:
                trazos.append(tramo); tramo = []
        if tramo:
            trazos.append(tramo)
    caminos = []
    for t in trazos:
        t = dp(chaikin(t), TOLERANCIA)
        if len(t) >= 2:
            caminos.append("M" + " ".join(f"{x:.1f} {y:.1f}" for x, y in t))
    return " ".join(caminos), (x0, y0)


def rect(x, y, w, h, rx, cls):
    return f'<rect class="{cls}" x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/>'


def pulso(x, borde, sube):
    """Traza punteada sobre el equipo; el punto sube desde el borde (entrega) o baja hasta él (recibe)."""
    cima = borde - 46
    mueve = "ilus-sube" if sube else "ilus-baja"
    y_mueve = borde if sube else cima
    return f"""<g class="ilus-pulso">
    <path class="ilus-traza" d="M{x} {borde}V{cima}"/>
    <circle class="ilus-punto" cx="{x}" cy="{borde}" r="4"/>
    <circle class="ilus-onda" cx="{x}" cy="{borde}" r="4"/>
    <circle class="{mueve}" cx="{x}" cy="{y_mueve}" r="3.2"/>
  </g>"""


def svg(pieza, ancho, alto, cuerpo, rx, d, piezas, titulo, x_pulso, sube):
    cx, cy, cw, ch = cuerpo
    return f"""<svg class="ilus ilus-{pieza}" viewBox="0 0 {ancho} {alto}" role="img" aria-labelledby="ilus-{pieza}-t">
  <title id="ilus-{pieza}-t">{titulo}</title>
  <defs><clipPath id="ilus-{pieza}-silueta"><rect x="{cx}" y="{cy}" width="{cw}" height="{ch}" rx="{rx}"/></clipPath></defs>
  <path class="ilus-curvas" clip-path="url(#ilus-{pieza}-silueta)" d="{d}"/>
  {rect(cx, cy, cw, ch, rx, "ilus-borde")}
  {piezas}
  {pulso(x_pulso, cy, sube)}
</svg>
"""


def main():
    D = leer_h25()
    usados, salida = [], {}

    # tacógrafo 4.0: frente DIN con el panel del logo, la pantalla, cinco botones, la ranura de la tarjeta y la impresora
    c = (8, 52, 464, 126)
    d, _ = curvas(D, c, 12000, usados)
    botones = "".join(rect(262, 70 + k * 19, 22, 13, 3, "ilus-pieza") for k in range(5))
    salida["tacografo"] = svg("tacografo", 480, 190, c, 10, d, f"""{rect(22, 66, 62, 98, 4, "ilus-pieza")}
  {rect(108, 70, 140, 76, 5, "ilus-pantalla")}
  <path class="ilus-linea" d="M120 92h62M120 112h96M120 128h48"/>
  {botones}
  {rect(300, 64, 160, 104, 5, "ilus-pieza")}
  <path class="ilus-linea" d="M314 78h132M330 154h12M108 160h140"/>""",
        "Tacógrafo 4.0 dibujado con las curvas de nivel de la ruta H-25; un pulso de cobre sube hacia SACEL.", 380, True)

    # tarjeta SmartCard (formato ID-1): chip de contactos, foto del trabajador y líneas de datos
    c = (10, 52, 270, 170)
    d, _ = curvas(D, c, 7000, usados)
    salida["smartcard"] = svg("smartcard", 290, 230, c, 14, d, f"""{rect(34, 98, 46, 36, 6, "ilus-pantalla")}
  <path class="ilus-linea" d="M34 116h46M57 98v36M34 107h14M66 107h14M34 125h14M66 125h14"/>
  {rect(192, 80, 64, 80, 5, "ilus-pieza")}
  <path class="ilus-linea" d="M34 170h120M34 186h88M34 202h104"/>""",
        "Tarjeta SmartCard dibujada con las curvas de nivel de la ruta H-25; un pulso de cobre sube hacia SACEL.", 57, True)

    # display alfanumérico: panel largo con la matriz de LED
    c = (8, 56, 464, 84)
    d, _ = curvas(D, c, 12000, usados)
    salida["display"] = svg("display", 480, 150, c, 8, d, f"""{rect(28, 66, 424, 64, 4, "ilus-pantalla")}
  <pattern id="ilus-leds" x="36" y="71.5" width="8" height="9" patternUnits="userSpaceOnUse"><circle class="ilus-led" cx="4" cy="4.5" r="1.6"/></pattern>
  <rect x="36" y="71.5" width="408" height="45" fill="url(#ilus-leds)"/>""",
        "Display alfanumérico dibujado con las curvas de nivel de la ruta H-25; un pulso de cobre baja desde el tacógrafo.", 240, False)

    # visor VI7GPS (168 × 80 × 45 mm): tres dígitos de 7 segmentos
    c = (10, 56, 300, 143)
    d, _ = curvas(D, c, 8000, usados)
    segmentos = []
    for k in range(3):
        x = 58 + k * 74
        s = [(x + 6, 82, 34, 7), (x + 40, 88, 7, 34), (x + 40, 132, 7, 34), (x + 6, 166, 34, 7),
             (x, 132, 7, 34), (x, 88, 7, 34), (x + 6, 124, 34, 7)]
        segmentos += [rect(a, b, w, h, 3, "ilus-pieza") for a, b, w, h in s]
    salida["visor"] = svg("visor", 320, 210, c, 12, d, f"""{rect(40, 72, 240, 112, 6, "ilus-pantalla")}
  {"".join(segmentos)}""",
        "Visor de velocidad VI7GPS dibujado con las curvas de nivel de la ruta H-25; un pulso de cobre baja hacia el equipo.", 160, False)

    for pieza, texto in salida.items():
        destino = RAIZ / f"partes/ilustracion-{pieza}.svg"
        destino.write_text(texto)
        print(f"{destino.relative_to(RAIZ)}: {len(texto) / 1024:.1f} KB")


if __name__ == "__main__":
    main()
