"""Extrae el modelo 3D del tacógrafo de la animación hecha con ChatGPT (archivo de Benjamin, 2026-10-27) y lo deja
como datos legibles en datos/tacografo-modelo.js (Benjamin, 2026-10-30: «plana y auditable», pedido de JI).

    python3 scripts/extraer_tacografo.py ~/Downloads/tacografo_scroll.html
    python3 scripts/extraer_tacografo.py datos/tacografo-modelo.js      # también acepta la versión comprimida anterior

El HTML original trae el modelo como una cadena base64 de un JSON comprimido con gzip. Este script la decodifica,
comprueba que traiga materiales, grupos, objetos y mallas, redondea las coordenadas a DECIMALES y escribe un objeto
JavaScript legible: un material, grupo u objeto por línea y, en cada malla, sus puntos, normales e índices. No toca
el original y la salida es idéntica en cada corrida. El motor que dibuja el modelo es tacografo-3d.js.
"""
import base64
import gzip
import json
import re
import sys
from pathlib import Path

DECIMALES = 3          # 0,001 de la unidad del modelo; con 3 el dibujo no cambia a la vista (comparado con capturas)

origen = Path(sys.argv[1]).expanduser()
texto = origen.read_text()
m = re.search(r'(["\'])(H4sI[A-Za-z0-9+/=]+)\1', texto)
if not m:
    raise SystemExit("no se encontró la carga comprimida del modelo (\"H4sI…\")")
datos = json.loads(gzip.decompress(base64.b64decode(m.group(2))))
faltan = {"materials", "groups", "objects", "meshes"} - set(datos)
if faltan:
    raise SystemExit(f"el modelo no trae: {sorted(faltan)}")


def num(v):
    """Número corto: redondeado, sin ceros sobrantes ni -0."""
    if isinstance(v, int):
        return str(v)
    r = round(v, DECIMALES)
    if r == 0:
        return "0"
    s = f"{r:.{DECIMALES}f}".rstrip("0").rstrip(".")
    return s


def js(v):
    if isinstance(v, bool) or v is None:
        return json.dumps(v)
    if isinstance(v, (int, float)):
        return num(v)
    if isinstance(v, str):
        return json.dumps(v, ensure_ascii=False)
    if isinstance(v, list):
        return "[" + ", ".join(js(x) for x in v) + "]"
    if isinstance(v, dict):
        return "{ " + ", ".join(f"{k}: {js(x)}" for k, x in v.items()) + " }"
    raise TypeError(type(v))


def plano(lista, por_linea, sangria):
    """Una lista larga de números, en filas de por_linea valores."""
    partes = [num(x) if not isinstance(x, list) else "[" + ", ".join(num(y) for y in x) + "]" for x in lista]
    filas = [", ".join(partes[k:k + por_linea]) for k in range(0, len(partes), por_linea)]
    return "[\n" + ",\n".join(sangria + "  " + f for f in filas) + "\n" + sangria + "]"


salida = ["""/* Modelo 3D del tacógrafo, en datos legibles. Generado por scripts/extraer_tacografo.py desde la animación de
   Benjamin hecha con ChatGPT (reconstrucción visual basada en fotografías). Para cambiarlo, regenerarlo con el
   script; no editar a mano.

   Estructura (unidades del modelo, ~1 mm; coordenadas redondeadas a """ + str(DECIMALES) + """ decimales):
   - materials: nombre, color RGB (0–1), metal y rugosidad (rough) de cada material.
   - groups: partes que se mueven juntas en la animación (kind: static, lid, front, …), con posición y rotación.
   - objects: cada pieza: su malla (índice en meshes), su material (índice en materials), posición, escala,
     rotación y grupo.
   - meshes: la geometría de cada malla: p (puntos x, y, z), n (normales) e i (índices de triángulos, de a tres). */
window.TACOGRAFO_MODELO = {"""]
salida.append("  materials: [\n" + ",\n".join("    " + js(x) for x in datos["materials"]) + "\n  ],")
salida.append("  groups: [\n" + ",\n".join("    " + js(x) for x in datos["groups"]) + "\n  ],")
salida.append("  objects: [\n" + ",\n".join("    " + js(x) for x in datos["objects"]) + "\n  ],")
mallas = []
for k, ma in enumerate(datos["meshes"]):
    mallas.append(f"    {{ // malla {k}\n"
                  f"      name: {js(ma['name'])},\n"
                  f"      p: {plano(ma['p'], 6, '      ')},\n"
                  f"      n: {plano(ma['n'], 6, '      ')},\n"
                  f"      i: {plano(ma['i'], 24, '      ')}\n"
                  f"    }}")
salida.append("  meshes: [\n" + ",\n".join(mallas) + "\n  ]")
salida.append("};\n")

destino = Path(__file__).resolve().parent.parent / "datos/tacografo-modelo.js"
destino.write_text("\n".join(salida))
print(f"{destino}: {destino.stat().st_size / 1024:.0f} KB · {len(datos['materials'])} materiales, {len(datos['groups'])} grupos, "
      f"{len(datos['objects'])} objetos, {len(datos['meshes'])} mallas")
