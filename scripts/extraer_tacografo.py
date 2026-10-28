"""Extrae el modelo 3D del tacógrafo de la animación hecha con ChatGPT (archivo de Benjamin, 2026-10-27).

    python3 scripts/extraer_tacografo.py ~/Downloads/tacografo_scroll.html

El HTML original trae el modelo como una cadena base64 de un JSON comprimido con gzip, dentro de su único <script>.
Este script la copia sin cambios a datos/tacografo-modelo.js (window.TACOGRAFO_MODELO = "…"), comprueba que se
decodifique a un JSON con materiales, grupos, objetos y mallas, y no toca el original. La salida es idéntica en cada
corrida. El motor que dibuja el modelo es tacografo-3d.js, escrito aparte a partir del mismo archivo.
"""
import base64
import gzip
import json
import re
import sys
from pathlib import Path

origen = Path(sys.argv[1]).expanduser()
html = origen.read_text()
m = re.search(r'const compressed=(["\'])(H4sI[A-Za-z0-9+/=]+)\1', html)
if not m:
    raise SystemExit("no se encontró la carga del modelo (const compressed=\"H4sI…\")")
carga = m.group(2)
datos = json.loads(gzip.decompress(base64.b64decode(carga)))
faltan = {"materials", "groups", "objects", "meshes"} - set(datos)
if faltan:
    raise SystemExit(f"el modelo no trae: {sorted(faltan)}")
destino = Path(__file__).resolve().parent.parent / "datos/tacografo-modelo.js"
destino.write_text("/* Modelo 3D del tacógrafo (JSON con gzip y base64). Generado por scripts/extraer_tacografo.py desde la\n"
                   "   animación de Benjamin hecha con ChatGPT; reconstrucción visual basada en fotografías. No editar a mano. */\n"
                   f'window.TACOGRAFO_MODELO = "{carga}";\n')
print(f"{destino}: {destino.stat().st_size / 1024:.0f} KB · {len(datos['materials'])} materiales, {len(datos['groups'])} grupos, "
      f"{len(datos['objects'])} objetos, {len(datos['meshes'])} mallas")
