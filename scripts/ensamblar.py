"""Copia la cabecera <head>, la barra y el pie de partes/ a cada página, entre sus marcas.

    python3 scripts/ensamblar.py

Cada página lleva <!-- cabeza -->…<!-- /cabeza -->, <!-- barra -->…<!-- /barra --> y <!-- pie -->…<!-- /pie -->.
Lo que queda entre las marcas se reemplaza; el resto de la página no se toca. Las partes opcionales (OPCIONALES) sólo
se copian en las páginas que tienen su marca, p. ej. <!-- ilustracion-tacografo --> (las genera ilustrar_productos.py). La página actual de la barra se marca
con aria-current="page". El resultado se guarda en el repositorio: el sitio no necesita este script para funcionar.
"""
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PARTES = {n: (RAIZ / "partes" / f"{n}.html").read_text().strip() for n in ("cabeza", "barra", "pie")}
OPCIONALES = {f"ilustracion-{n}": (RAIZ / f"partes/ilustracion-{n}.svg").read_text().strip()
              for n in ("tacografo", "smartcard", "display", "visor", "reportes")}

for pagina in sorted(RAIZ.glob("*.html")):
    t = pagina.read_text()
    for nombre, contenido in PARTES.items():
        if nombre == "barra":
            contenido = contenido.replace(f'href="{pagina.name}"', f'href="{pagina.name}" aria-current="page"', 1) \
                if pagina.name != "index.html" else contenido.replace('href="index.html">Inicio', 'href="index.html" aria-current="page">Inicio')
        t, n = re.subn(rf"<!-- {nombre} -->.*?<!-- /{nombre} -->", f"<!-- {nombre} -->\n{contenido}\n<!-- /{nombre} -->", t, flags=re.S)
        if not n:
            raise SystemExit(f"{pagina.name}: falta la marca <!-- {nombre} -->")
    for nombre, contenido in OPCIONALES.items():
        t = re.sub(rf"<!-- {nombre} -->.*?<!-- /{nombre} -->", lambda m: f"<!-- {nombre} -->\n{contenido}\n<!-- /{nombre} -->", t, flags=re.S)
    pagina.write_text(t)
    print("ensamblada:", pagina.name)
